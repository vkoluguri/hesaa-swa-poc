// /api/pdf/index.js  (SWA, Node 18+)

// Env needed (Application / client-credential app):
//   SP_TENANT_ID        (tenant guid)
//   SP_CLIENT_ID        (app id)
//   SP_CLIENT_SECRET    (client secret)
//   SP_SITE_URL         (e.g. https://{tenant}.sharepoint.com/sites/HESAAWebRequestsPoC)
// Optional:
//   SP_LIBRARY_NAME     (display name in Graph, usually "Documents")

export async function onRequest(req, ctx) {
  const steps = [];
  const url = new URL(req.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    // ---------- 0) Input validation ----------
    const raw = (url.searchParams.get('file') || url.searchParams.get('doc') || '').trim();
    if (!raw) return respond({ ok: false, error: 'file query required', steps }, 400, debug);

    // only pdf, no traversal, keep spaces and slashes
    const safe = raw.replace(/^\/*/, ''); // strip leading slashes
    if (!/\.pdf$/i.test(safe) || safe.includes('..')) {
      return respond({ ok: false, error: 'invalid file name', steps }, 400, debug);
    }
    steps.push({ step: 'input', file: safe });

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;
    const libraryName  = process.env.SP_LIBRARY_NAME || 'Documents'; // Graph display name is usually "Documents"

    if (!tenant || !clientId || !clientSecret || !siteUrl) {
      return respond({ ok: false, error: 'missing environment variables', steps }, 500, debug);
    }

    // ---------- 1) Token ----------
    const tokRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });
    const tokJson = await tokRes.json().catch(() => ({}));
    if (!tokRes.ok || !tokJson.access_token) {
      steps.push({ step: 'token', status: 'error', statusCode: tokRes.status, body: tokJson });
      return respond({ ok: false, error: 'token error', steps }, 500, debug);
    }
    const token = tokJson.access_token;
    steps.push({ step: 'token', status: 'ok' });

    // ---------- 2) Resolve site ----------
    const u = new URL(siteUrl); // e.g. https://foo.sharepoint.com/sites/HESAAWebRequestsPoC
    const hostname = u.hostname;                       // foo.sharepoint.com
    let sitePath = u.pathname.replace(/^\/+/, '');     // sites/HESAAWebRequestsPoC
    if (sitePath.toLowerCase().startsWith('sites/')) sitePath = sitePath.slice(6); // HESAAWebRequestsPoC

    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(hostname)}:/sites/${encodeURIComponent(sitePath)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const siteJson = await siteRes.json().catch(() => ({}));
    if (!siteRes.ok || !siteJson.id) {
      steps.push({ step: 'site', status: 'error', statusCode: siteRes.status, body: siteJson });
      return respond({ ok: false, error: 'site resolution failed', steps }, siteRes.status || 500, debug);
    }
    const siteId = siteJson.id;
    steps.push({ step: 'site', status: 'ok', siteId });

    // ---------- 3) Pick drive (library) ----------
    const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
      { headers: { Authorization: `Bearer ${token}` } });
    const drivesJson = await drivesRes.json().catch(() => ({}));
    if (!drivesRes.ok || !Array.isArray(drivesJson.value)) {
      steps.push({ step: 'drives', status: 'error', statusCode: drivesRes.status, body: drivesJson });
      return respond({ ok: false, error: 'drives lookup failed', steps }, drivesRes.status || 500, debug);
    }

    // Graph drive.displayName is `Documents` for the default library
    let drive = drivesJson.value.find(d => (d.name || d.displayName) === libraryName)
            || drivesJson.value.find(d => (d.name || d.displayName) === 'Documents')
            || drivesJson.value.find(d => d.driveType === 'documentLibrary');
    if (!drive) {
      steps.push({ step: 'drives', status: 'error', available: drivesJson.value.map(d => d.name || d.displayName) });
      return respond({ ok: false, error: 'library not found', steps }, 404, debug);
    }
    steps.push({ step: 'drive', status: 'ok', driveId: drive.id, driveName: drive.name || drive.displayName });

    // ---------- 4) Fetch file content ----------
    // safe has spaces etc.; we must segment-encode path
    const encodedPath = safe.split('/').map(encodeURIComponent).join('/');
    const fileUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;

    const pdfRes = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!pdfRes.ok) {
      let errText = '';
      try { errText = await pdfRes.text(); } catch { /* ignore */ }

      // capture some headers when debugging
      const hdrs = {};
      for (const [k,v] of pdfRes.headers) hdrs[k] = v;

      steps.push({ step: 'file', status: 'error', statusCode: pdfRes.status, body: errText, headers: hdrs, url: fileUrl });
      return respond({ ok: false, error: 'file fetch failed', steps }, pdfRes.status, debug);
    }

    steps.push({ step: 'file', status: 'ok' });

    // ---------- 5) Stream ----------
    return new Response(pdfRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeFilename(safe)}"`
      }
    });

  } catch (e) {
    steps.push({ step: 'exception', error: String(e?.message || e) });
    return respond({ ok: false, error: 'exception', steps }, 500, true /* always show debug on exception */);
  }

  // helpers
  function respond(obj, status, debugMode) {
    if (!debugMode) return new Response(JSON.stringify({ ok: false, error: obj.error || 'error' }), {
      status, headers: { 'Content-Type': 'application/json' }
    });
    return new Response(JSON.stringify(obj, null, 2), { status, headers: { 'Content-Type': 'application/json' } });
  }

  function encodeFilename(name) {
    // suggest a clean filename for Content-Disposition
    return name.split('/').pop().replace(/["\\]/g, '_');
  }
}

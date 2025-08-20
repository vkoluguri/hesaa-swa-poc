// /api/pdf/index.js  (Node 18, Azure Static Web Apps function)
// Streams a PDF from SharePoint (Graph, app-only).
//
// Required app settings (Application secrets):
//   SP_TENANT_ID      e.g. 00000000-0000-0000-0000-000000000000
//   SP_CLIENT_ID      Entra ID app registration (application) id
//   SP_CLIENT_SECRET  Client secret
//   SP_SITE_URL       e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
// Optional:
//   SP_LIBRARY_NAME   defaults to "Shared Documents"
//   SP_ALLOWED_PREFIX (optional folder prefix inside the library, like "Brochures/")

export async function onRequest(req, ctx) {
  const debug = new URL(req.url).searchParams.get('debug') === '1';

  function dbg(payload) {
    if (!debug) return '';
    try { return '\n\n[debug]\n' + JSON.stringify(payload, null, 2); }
    catch { return '\n\n[debug] (unserializable)'; }
  }

  try {
    const url = new URL(req.url);
    const fileRaw = url.searchParams.get('file') || url.searchParams.get('doc');

    if (!fileRaw) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing ?file=' }), { status: 400 });
    }

    // Guardrails: allow only .pdf and block .. traversal
    const isPdf = /\.pdf$/i.test(fileRaw);
    if (!isPdf || fileRaw.includes('..')) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid file parameter' }), { status: 400 });
    }

    const tenantId     = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL; // full URL like https://{tenant}.sharepoint.com/sites/YourSite
    const libraryName  = process.env.SP_LIBRARY_NAME || 'Shared Documents';
    const allowedPref  = process.env.SP_ALLOWED_PREFIX || ''; // e.g. 'Brochures/'

    if (!tenantId || !clientId || !clientSecret || !siteUrl) {
      return new Response(JSON.stringify({ ok:false, error:'Missing SP_* env vars' }), { status: 500 });
    }

    // 1) App-only token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      return new Response(
        JSON.stringify({ ok:false, error:'Token acquisition failed', details: tokenJson }) + dbg({ tokenRes: tokenJson }),
        { status: 500 }
      );
    }
    const token = tokenJson.access_token;

    // 2) Resolve site id (works for any hostname/site path)
    const sUrl = new URL(siteUrl);
    const hostname = sUrl.hostname;              // vkolugurihesaa.sharepoint.com
    const sitePath = sUrl.pathname.replace(/^\/+/, ''); // sites/HESAAWebRequestsPoC

    const siteResp = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(hostname)}:/` +
      `${encodeURIComponent(sitePath)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const siteJson = await siteResp.json().catch(() => ({}));
    if (!siteResp.ok || !siteJson.id) {
      return new Response(
        JSON.stringify({ ok:false, error:'Could not resolve site id', details: siteJson }) + dbg({ host: hostname, path: sitePath }),
        { status: 500 }
      );
    }

    // 3) Locate the document library (drive)
    const drivesResp = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteJson.id}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const drivesJson = await drivesResp.json().catch(() => ({}));
    const drive = (drivesJson.value || []).find(d => d.name === libraryName) || (drivesJson.value || [])[0];

    if (!drivesResp.ok || !drive?.id) {
      return new Response(
        JSON.stringify({ ok:false, error:'Could not resolve library (drive)', details: drivesJson }) + dbg({ expectedLibrary: libraryName }),
        { status: 500 }
      );
    }

    // 4) Build the path inside the library
    //    - Respect optional allowed prefix (if set)
    //    - Segment-encode each part to preserve slashes while encoding spaces etc.
    let libRelativePath = fileRaw;
    if (allowedPref) {
      if (!fileRaw.startsWith(allowedPref)) {
        return new Response(JSON.stringify({ ok:false, error:'File not allowed by prefix' }), { status: 403 });
      }
    }

    // Split and encode each segment to avoid double-encoding slashes
    const segments = libRelativePath.split('/').map(s => encodeURIComponent(s));
    const encodedPath = segments.join('/'); // e.g. "Brochures/course%20completion.pdf" or "course%20completion.pdf"

    // 5) Fetch file content from Graph (drive by path)
    const contentUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;
    const fileResp = await fetch(contentUrl, { headers: { Authorization: `Bearer ${token}` } });

    if (!fileResp.ok) {
      const txt = await fileResp.text().catch(() => '');
      return new Response(
        JSON.stringify({ ok:false, error:'Graph download failed', status:fileResp.status, details: txt }) +
        dbg({ contentUrl }),
        { status: fileResp.status || 500 }
      );
    }

    // 6) Stream to browser
    const filename = decodeURIComponent(segments[segments.length - 1] || 'file.pdf');
    return new Response(fileResp.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error: String(err) }), { status: 500 });
  }
}

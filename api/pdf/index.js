// /api/pdf/index.js
// Streams a PDF from SharePoint via Microsoft Graph (app-only).
// Works on Azure Static Web Apps Node 18 runtime (no extra deps).

export async function onRequest(req, ctx) {
  const debug = new URL(req.url).searchParams.get('debug'); // &debug=1 shows JSON errors

  try {
    // ----------- 1) Inputs & guardrails -----------
    const url = new URL(req.url);
    const fileParam = url.searchParams.get('file'); // e.g. "course completion.pdf" or "Brochures/summer.pdf"
    if (!fileParam) return jserr(400, 'Missing ?file=...');

    // Basic guard: only PDF, no path traversal; allow subfolders.
    const isValid =
      /^[\w\-./ %]+\.pdf$/i.test(fileParam) && !fileParam.includes('..') && !fileParam.startsWith('/');
    if (!isValid) return jserr(400, 'Invalid file name');

    // Optional: restrict to a specific folder prefix (set SP_PDF_PREFIX in env, e.g. "Brochures/")
    const allowedPrefix = (process.env.SP_PDF_PREFIX || '').trim();
    if (allowedPrefix && !fileParam.startsWith(allowedPrefix)) {
      return jserr(403, 'File outside allowed folder');
    }

    // Env needed
    const tenant       = requiredEnv('SP_TENANT_ID');
    const clientId     = requiredEnv('SP_CLIENT_ID');
    const clientSecret = requiredEnv('SP_CLIENT_SECRET');
    const siteUrl      = requiredEnv('SP_SITE_URL');       // e.g. https://vkolugurihesaa.sharepoint.com/sites/HESAAWebRequestsPoC
    const libraryName  = process.env.SP_LIBRARY_NAME || 'Shared Documents';

    // ----------- 2) App-only token -----------
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      return jserr(tokenRes.status || 500, `Token error: ${tokenJson.error_description || JSON.stringify(tokenJson)}`, debug);
    }
    const bearer = `Bearer ${tokenJson.access_token}`;

    // ----------- 3) Resolve site & drive -----------
    // Graph wants: /sites/{hostname}:/sites/{sitePath}
    const sp = new URL(siteUrl);
    // strip leading "/sites/" from pathname; leave any nested path intact
    const sitePath = sp.pathname.replace(/^\/+/, ''); // e.g. "sites/HESAAWebRequestsPoC"
    const siteApi = `https://graph.microsoft.com/v1.0/sites/${sp.hostname}:/${sitePath}`;
    const siteInfo = await gget(siteApi, bearer);
    if (!siteInfo?.id) return jserr(500, `Could not resolve site id from ${siteApi}`, debug);

    const drivesApi = `https://graph.microsoft.com/v1.0/sites/${siteInfo.id}/drives`;
    const drives = await gget(drivesApi, bearer);
    const drive = (drives?.value || []).find(d => d.name === libraryName) || (drives?.value || [])[0];
    if (!drive?.id) return jserr(500, `Could not resolve drive for library "${libraryName}"`, debug);

    // ----------- 4) Download by *path* (encode each segment safely) -----------
    const safePath = fileParam.split('/').map(encodeURIComponent).join('/'); // keeps folders but encodes spaces, etc.
    const contentApi = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${safePath}:/content`;

    const pdfResp = await fetch(contentApi, { headers: { Authorization: bearer } });
    if (!pdfResp.ok) {
      const t = await pdfResp.text().catch(() => '');
      return jserr(pdfResp.status, `Graph file error: ${t || pdfResp.statusText}`, debug);
    }

    // ----------- 5) Stream back -----------
    // Use the original (unencoded) file name for Content-Disposition
    return new Response(pdfResp.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileParam.split('/').slice(-1)[0]}"`,
        // (Optional) allow embedding from your own origin
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    return jserr(500, String(e));
  }

  // ---------- helpers ----------
  function requiredEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing environment variable ${name}`);
    return v;
  }

  async function gget(url, bearer) {
    const r = await fetch(url, { headers: { Authorization: bearer } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Graph GET ${url} -> ${r.status} ${JSON.stringify(j)}`);
    return j;
  }

  function jserr(status, message, debugFlag) {
    // If &debug=1 was passed, show JSON; otherwise a plain 4xx/5xx so the browser shows error
    if (debugFlag) {
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(message, { status });
  }
}

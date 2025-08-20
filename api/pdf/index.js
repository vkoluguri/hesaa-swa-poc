// /api/pdf/index.js  (Node 18, SWA-style)
// Streams a PDF from a SharePoint library back to the browser.
//
// Required app settings (Application secrets):
//   SP_TENANT_ID        e.g. 00000000-0000-0000-0000-000000000000
//   SP_CLIENT_ID        Entra ID app registration (application) id
//   SP_CLIENT_SECRET    Client secret
//   SP_SITE_URL         e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
// Optional:
//   SP_LIBRARY_NAME     defaults to "Shared Documents"
//   SP_ALLOWED_PREFIX   e.g. "Brochures/" (to fence downloads to a folder). Leave blank to allow any folder.

export async function onRequest(req /* , ctx */) {
  try {
    // ---- Method guard -------------------------------------------------------
    if (req.method !== 'GET') {
      return json({ ok:false, error:'Method not allowed' }, 405);
    }

    // ---- Input --------------------------------------------------------------
    const url  = new URL(req.url);
    const file = url.searchParams.get('file'); // e.g. "Shared Documents/course completion.pdf" OR "Brochures/Guide.pdf"
    if (!file) return json({ ok:false, error:'Query ?file= is required' }, 400);

    // ---- Guardrails ----------------------------------------------------------
    // 1) PDF only + no traversal
    const isPdf = /^[\w\-./ %]+\.pdf$/i.test(file) && !file.includes('..') && !file.startsWith('/');
    if (!isPdf) return json({ ok:false, error:'Invalid file name' }, 400);

    // 2) Optional: restrict to a subfolder (env wins, fallback to constant)
    const ALLOWED_PREFIX = (process.env.SP_ALLOWED_PREFIX || '').trim(); // e.g. "Brochures/"
    if (ALLOWED_PREFIX && !file.startsWith(ALLOWED_PREFIX)) {
      return json({ ok:false, error:'Not allowed' }, 403);
    }

    // ---- Config -------------------------------------------------------------
    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;                // https://<tenant>.sharepoint.com/sites/<site>
    const defaultLib   = process.env.SP_LIBRARY_NAME || 'Shared Documents';

    if (!tenant || !clientId || !clientSecret || !siteUrl) {
      return json({ ok:false, error:'Missing SP_* environment settings' }, 500);
    }

    // ---- Token (Graph app-only) --------------------------------------------
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         'https://graph.microsoft.com/.default',
        grant_type:    'client_credentials'
      })
    });
    const tok = await tokenRes.json();
    if (!tokenRes.ok || !tok?.access_token) {
      return json({ ok:false, error:'Token error', details: tok }, 502);
    }
    const auth = { Authorization: `Bearer ${tok.access_token}` };

    // ---- Build content URL using SharePoint _api v2.1 (by path) -------------
    // If no library segment supplied, assume defaultLib.
    const hasLibrary = /^([^/]+)\//.test(file);
    const library    = hasLibrary ? file.split('/')[0] : defaultLib;
    const pathInLib  = hasLibrary ? file.split('/').slice(1).join('/') : file;

    // Encode each path segment safely (spaces, #, etc.)
    const encSegs = (s) => s.split('/').map(encodeURIComponent).join('/');

    const contentUrl =
      `${siteUrl}/_api/v2.1/drives/root:/${encSegs(library)}/${encSegs(pathInLib)}:/content`;

    // ---- Fetch the file stream from SharePoint ------------------------------
    const spRes = await fetch(contentUrl, { headers: auth });
    if (!spRes.ok) {
      const text = await spRes.text().catch(()=>'');
      return json({ ok:false, error:'SharePoint download failed', status: spRes.status, details: text }, spRes.status);
    }

    // ---- Stream it back inline ----------------------------------------------
    const fname = decodeURIComponent(pathInLib.split('/').pop() || 'file.pdf');
    return new Response(spRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fname}"`,
        // Helpful caching (tune as you like)
        'Cache-Control': 'private, max-age=300'
      }
    });

  } catch (e) {
    return json({ ok:false, error: String(e) }, 500);
  }
}

/* --------------------------- helpers --------------------------- */
function json(obj, status=200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type':'application/json' }
  });
}

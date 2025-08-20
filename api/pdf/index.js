// Streams a PDF from SharePoint to the browser using app permissions.
// Required app settings (in SWA / Azure):
//   SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL
// Optional:
//   SP_LIBRARY_NAME   // defaults to "Shared Documents"

module.exports = async function (context, req) {
  try {
    const file = (req.query.file || '').trim(); // e.g. "course completion.pdf" or "Folder/name.pdf"
    if (!file) {
      context.res = { status: 400, jsonBody: { ok: false, error: 'file query required' } };
      return;
    }

    // Guardrails: only .pdf, no traversal, allow simple path segments
    const okName = /^[\w\-./ %]+\.pdf$/i.test(file) && !file.includes('..');
    if (!okName) {
      context.res = { status: 400, jsonBody: { ok: false, error: 'invalid file' } };
      return;
    }

    // If you want to restrict to a subfolder, set a prefix here (comment out to allow any folder)
    // const ALLOWED_PREFIX = 'Brochures/';
    // if (!file.startsWith(ALLOWED_PREFIX)) {
    //   context.res = { status: 403, jsonBody: { ok:false, error:'not allowed' } };
    //   return;
    // }

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL; // e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
    const libraryName  = process.env.SP_LIBRARY_NAME || 'Shared Documents';

    // 1) App-only token (Microsoft Graph)
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      context.res = { status: tokenRes.status, jsonBody: { ok:false, error: tokenJson.error_description || 'Token error' } };
      return;
    }
    const token = tokenJson.access_token;

    // 2) Resolve site id
    const siteUri = new URL(siteUrl);
    const siteResp = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteUri.hostname)}:/sites/${encodeURIComponent(siteUri.pathname.replace(/^\/+/, '').replace(/^sites\//, ''))}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const site = await siteResp.json();
    if (!site?.id) {
      context.res = { status: 500, jsonBody: { ok:false, error: 'Could not resolve site id' } };
      return;
    }

    // 3) Find the drive (library)
    const drivesResp = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const drives = await drivesResp.json();
    const drive = (drives.value || []).find(d => d.name === libraryName) || (drives.value || [])[0];
    if (!drive?.id) {
      context.res = { status: 500, jsonBody: { ok:false, error: 'Could not resolve drive (library)' } };
      return;
    }

    // 4) Stream file by path. Encode each path segment to preserve spaces.
    const encodedPath = file.split('/').map(encodeURIComponent).join('/');
    const fileResp = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!fileResp.ok) {
      const txt = await fileResp.text();
      context.res = { status: fileResp.status, jsonBody: { ok:false, error: txt } };
      return;
    }

    // 5) Pipe to client
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file.split('/').pop()}"`
      },
      body: fileResp.body // stream
    };
  } catch (e) {
    context.res = { status: 500, jsonBody: { ok:false, error: String(e) } };
  }
};

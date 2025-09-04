// serve-local.js
// Minimal local server to test /api/pdf against Microsoft Graph using app-only auth.
// Run:  node serve-local.js [port]
// Then: http://localhost:5000/partials/pdf.html?file=StateHolidays.pdf
// Or:   http://localhost:5000/api/pdf?file=StateHolidays.pdf&debug=1

import http from 'node:http';
import { URL } from 'node:url';
import { Readable } from 'node:stream'; // <-- for fromWeb()

const PORT = Number(process.argv[2]) || 5000;

// ---- helpers ----
const json = (res, obj, status = 200) => {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
};
const bad = (res, msg, status = 400) => json(res, { ok: false, error: msg }, status);

async function getAppOnlyToken(tenant, clientId, clientSecret) {
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
  const tok = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(tok.error_description || JSON.stringify(tok));
  return tok.access_token;
}

async function resolveSiteId(token, siteUrl) {
  const u = new URL(siteUrl);
  const host = u.hostname; // e.g., vkolugurihesaa.sharepoint.com
  // path after /sites/
  const sitePath = u.pathname.replace(/^\/+/, ''); // sites/HESAAWebRequestsPoC
  const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${host}:/` + sitePath, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const site = await siteRes.json();
  if (!siteRes.ok || !site?.id) throw new Error(site?.error?.message || 'Could not resolve site id');
  return site.id;
}

async function resolveDrive(token, siteId, preferredName) {
  const dRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await dRes.json();
  if (!dRes.ok) throw new Error(data?.error?.message || 'Could not list drives');

  // Prefer the drive by display name; fall back to the first documentLibrary
  const drives = Array.isArray(data.value) ? data.value : [];
  let drive = drives.find(d => d.name === preferredName) || drives.find(d => d.driveType === 'documentLibrary') || drives[0];
  if (!drive?.id) throw new Error('Could not resolve drive (library)');
  return drive;
}

async function streamPdf(res, token, driveId, filePath) {
  // Important: DO NOT double-encode slashes, but you must encode the filename parts
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodedPath}:/content`;

  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    return bad(res, `Graph error ${r.status}: ${t}`, r.status);
  }

  // Pass through content-type and length if available
  const headers = {
    'Content-Type': r.headers.get('content-type') || 'application/pdf',
    'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
  };
  const len = r.headers.get('content-length');
  if (len) headers['Content-Length'] = len;

  res.writeHead(200, headers);

  // Node 18+: convert Web ReadableStream to Node Readable and pipe it
  const nodeStream = Readable.fromWeb(r.body);
  nodeStream.on('error', err => {
    console.error('Stream error:', err);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Stream error');
  });
  nodeStream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://${req.headers.host}`);

    if (u.pathname === '/api/pdf') {
      const debug = u.searchParams.get('debug') === '1';

      const fileRaw =
        (u.searchParams.get('file') || u.searchParams.get('doc') || '').trim();

      if (!fileRaw) return bad(res, 'file query required');

      // very basic guard for PDFs under allowed folders (adjust if needed)
      const ok = /^[\w\-./ %]+\.pdf$/i.test(fileRaw) && !fileRaw.includes('..');
      if (!ok) return bad(res, 'invalid file');

      const tenant       = process.env.SP_TENANT_ID;
      const clientId     = process.env.SP_CLIENT_ID;
      const clientSecret = process.env.SP_CLIENT_SECRET;
      const siteUrl      = process.env.SP_SITE_URL;
      // Based on your latest debug, Graph shows the library is named "Documents"
      const libraryName  = process.env.SP_LIBRARY_NAME || 'Documents';

      if (!tenant || !clientId || !clientSecret || !siteUrl)
        return bad(res, 'missing env: SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL', 500);

      if (debug) {
        console.log('PDF DEBUG start', { fileRaw, SP_SITE_URL: siteUrl, SP_LIBRARY_NAME: libraryName });
      }

      // 1) token
      const token = await getAppOnlyToken(tenant, clientId, clientSecret);
      if (debug) console.log('token ok');

      // 2) site
      const siteId = await resolveSiteId(token, siteUrl);
      if (debug) console.log('site ok', siteId);

      // 3) drive
      const drive = await resolveDrive(token, siteId, libraryName);
      if (debug) console.log('drive ok', { driveId: drive.id, driveName: drive.name });

      // 4) stream the file
      return streamPdf(res, token, drive.id, fileRaw);
    }

    // Very simple static for /partials/pdf.html while testing
    if (u.pathname === '/partials/pdf.html') {
      const html = `<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <title>PDF test</title>
  <main style="max-width:1100px;margin:24px auto;padding:0 16px">
    <h1 id="pdfTitle" style="margin:16px 0;"></h1>
    <iframe id="pdfFrame" style="width:100%;height:80vh;border:0;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.08)"></iframe>
  </main>
  <script>
    (function(){
      const p = new URLSearchParams(location.search);
      const file = p.get('file') || p.get('doc');
      if (!file) { document.getElementById('pdfTitle').textContent = 'Missing ?file=...'; return; }
      const title = file.split('/').pop();
      document.getElementById('pdfTitle').textContent = title;
      document.getElementById('pdfFrame').src = '/api/pdf?file=' + encodeURIComponent(file);
    })();
  </script>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    console.error('SERVER ERROR', err);
    bad(res, String(err), 500);
  }
});

server.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/partials/pdf.html?file=StateHolidays.pdf`);
  console.log(`Or:  http://localhost:${PORT}/api/pdf?file=StateHolidays.pdf&debug=1`);
});

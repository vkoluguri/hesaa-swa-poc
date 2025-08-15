// Azure Function: /api/media/{name}
// Proxies an image from your SharePoint library via Microsoft Graph
// so the browser loads from your SWA origin (no cross-site cookies/ORB).

const TENANT_ID     = process.env.SP_TENANT_ID;
const CLIENT_ID     = process.env.SP_CLIENT_ID;
const CLIENT_SECRET = process.env.SP_CLIENT_SECRET;

const HOSTNAME   = "vkolugurihesaa.sharepoint.com";
const SITE_PATH  = "/sites/HESAAWebRequestsPoC";
const DRIVE_NAME = "MediaAssets"; // library name

async function getToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });
  const res = await fetch(url, { method: "POST", body });
  if (!res.ok) throw new Error(`Token error ${res.status}`);
  const j = await res.json();
  return j.access_token;
}

async function getSiteId(token) {
  const url = `https://graph.microsoft.com/v1.0/sites/${HOSTNAME}:${SITE_PATH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Site error ${res.status}`);
  const j = await res.json();
  return j.id;
}

async function getDriveId(token, siteId) {
  const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drives error ${res.status}`);
  const j = await res.json();
  const drive = (j.value || []).find(d => d.name === DRIVE_NAME);
  if (!drive) throw new Error(`Drive '${DRIVE_NAME}' not found`);
  return drive.id;
}

module.exports = async function (context, req) {
  try {
    const name = req.params.name;
    if (!name) {
      context.res = { status: 400, body: "Missing file name" };
      return;
    }

    const token  = await getToken();
    const siteId = await getSiteId(token);
    const driveId = await getDriveId(token, siteId);

    // Download file content as bytes
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURIComponent(name)}:/content`;
    const fileRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!fileRes.ok) {
      const text = await fileRes.text().catch(() => "");
      context.log(`Fetch error ${fileRes.status}: ${text}`);
      context.res = { status: fileRes.status, body: text || "Fetch error" };
      return;
    }

    const buf = Buffer.from(await fileRes.arrayBuffer());
    const type = fileRes.headers.get("content-type") || "application/octet-stream";

    context.res = {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=600"
      },
      body: buf,
      isRaw: true
    };

  } catch (err) {
    context.log("media error:", err);
    context.res = { status: 500, body: String(err) };
  }
};

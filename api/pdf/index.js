// /api/pdf/index.js
// Streams a PDF from a SharePoint doc library via Microsoft Graph.
// App settings required (in Azure ➜ Functions/Environment):
//   SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL
// Optional: SP_LIBRARY_NAME  (defaults to "Shared Documents")

export default async function (req, ctx) {
  try {
    const url = new URL(req.url);
    // support both ?file= and ?doc=
    let file = url.searchParams.get("file") || url.searchParams.get("doc");
    if (!file) {
      return json({ ok: false, error: "file query required" }, 400);
    }

    // Guard: only PDFs and no traversal
    if (!/\.pdf$/i.test(file) || file.includes("..")) {
      return json({ ok: false, error: "invalid file" }, 400);
    }

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;     // e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
    const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

    // ---- 1) App-only token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
      })
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) return json({ ok:false, where:"token", error: tokenJson.error_description || tokenJson.error || "token error" }, tokenRes.status);
    const token = tokenJson.access_token;

    // ---- 2) Resolve site & drive (library)
    const siteURL = new URL(siteUrl);
    const hostname = siteURL.hostname;                 // contoso.sharepoint.com
    const sitePath = siteURL.pathname.replace(/^\/+/, ""); // sites/HESAAWebRequestsPoC

    const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(hostname)}:/${encodeURIComponent(sitePath)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const site = await siteRes.json();
    if (!siteRes.ok) return json({ ok:false, where:"site", error: site }, siteRes.status);

    const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${site.id}/drives`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const drives = await drivesRes.json();
    if (!drivesRes.ok) return json({ ok:false, where:"drives", error: drives }, drivesRes.status);

    const drive = (drives.value || []).find(d => d.name === libraryName) || (drives.value || [])[0];
    if (!drive?.id) return json({ ok:false, error:`Drive not found (${libraryName})` }, 404);

    // NOTE: file is the path inside the library, e.g.
    //   "course completion.pdf" OR "Brochures/course completion.pdf"
    // Each segment must be encoded (space → %20 etc.)
    const encodedPath = file.split("/").map(encodeURIComponent).join("/");

    // ---- 3) Stream content
    const fileRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!fileRes.ok) {
      const errText = await fileRes.text();
      return json({ ok:false, where:"content", error: errText }, fileRes.status);
    }

    return new Response(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // browsers will show inline; change to attachment to force download
        "Content-Disposition": `inline; filename="${encodedPath.split("/").pop()}"`
      }
    });
  } catch (e) {
    return json({ ok:false, error: String(e) }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

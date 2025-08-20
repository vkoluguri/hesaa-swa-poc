// /api/pdf/index.js  (Node 18, SWA-style)
// Streams a file from a SharePoint library back to the browser.
//
// Required app settings (Application secrets):
//   SP_TENANT_ID        e.g. 00000000-0000-0000-0000-000000000000
//   SP_CLIENT_ID        Entra ID app registration (application) id
//   SP_CLIENT_SECRET    Client secret
//   SP_SITE_URL         e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
// Optional:
//   SP_LIBRARY_NAME     defaults to "Shared Documents"

export async function onRequest(req, ctx) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file"); // e.g. file=Brochure.pdf
    if (!file) {
      return new Response(JSON.stringify({ ok: false, error: "file query required" }), { status: 400 });
    }

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;
    const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

    // 1) App-only token for Microsoft Graph
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
    if (!tokenRes.ok) throw new Error(tokenJson.error_description || "Token error");
    const token = tokenJson.access_token;

    // 2) Resolve the site drive id, then fetch file content by path
    //    (This works regardless of the full tenant name.)
    const site = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(new URL(siteUrl).hostname)}:/sites/${encodeURIComponent(new URL(siteUrl).pathname.replace(/^\/sites\//,''))}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.json());
    if (!site?.id) throw new Error("Could not resolve site id");

    const drives = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.json());
    const drive = (drives.value || []).find(d => d.name === libraryName) || (drives.value || [])[0];
    if (!drive?.id) throw new Error("Could not resolve drive (library)");

    const fileResp = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodeURIComponent(file)}:/content`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!fileResp.ok) {
      const txt = await fileResp.text();
      return new Response(JSON.stringify({ ok:false, error: txt }), { status: fileResp.status });
    }

    // 3) Stream to browser
    return new Response(fileResp.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file}"`
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e) }), { status: 500 });
  }
}

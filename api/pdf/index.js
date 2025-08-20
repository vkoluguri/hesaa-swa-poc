// Streams a PDF from SharePoint Online to the browser using app-only Graph.
// App settings required:
//   SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL (https://<tenant>.sharepoint.com/sites/<SiteName>)
// Optional:
//   SP_LIBRARY_NAME (defaults to "Shared Documents")

export async function onRequest(req, ctx) {
  const url = new URL(req.url);
  // accept ?file=... or ?doc=...
  const fileParam = url.searchParams.get("file") || url.searchParams.get("doc");
  const debug = url.searchParams.get("debug") === "1";

  // small helper for consistent error responses
  const fail = (status, msg, extra = {}) =>
    new Response(
      JSON.stringify({ ok: false, error: msg, ...extra }, null, debug ? 2 : 0),
      { status, headers: { "Content-Type": "application/json" } }
    );

  try {
    if (!fileParam) return fail(400, "Query parameter ?file=<pdf> is required.");

    // basic guardrails: PDFs only, no traversal
    const safe = /^[\w\-./ %]+\.pdf$/i.test(fileParam) && !fileParam.includes("..");
    if (!safe) return fail(400, "Invalid file name.");

    // Normalize path:
    // - make it relative to the library root
    // - allow callers to include "Shared Documents/" or not
    const libraryName = process.env.SP_LIBRARY_NAME || "Shared Documents";
    let relPath = fileParam.replace(/^\/*/,''); // strip leading slashes
    relPath = relPath.replace(
      new RegExp("^" + libraryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/?", "i"),
      ""
    );

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;

    if (!tenant || !clientId || !clientSecret || !siteUrl) {
      return fail(500, "Missing one or more required app settings (SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL).");
    }

    // 1) App-only token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    });

    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      return fail(tokenRes.status || 500, "Failed to obtain access token.", debug ? { tokenJson } : undefined);
    }
    const token = tokenJson.access_token;

    // 2) Resolve site id
    const siteHost = new URL(siteUrl).hostname;               // e.g. vkolugurihesaa.sharepoint.com
    const sitePath = new URL(siteUrl).pathname                // e.g. /sites/HESAAWebRequestsPoC
                        .replace(/^\/+/, "")
                        .replace(/^sites\//i, "sites/");      // ensure "sites/<name>"

    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteHost)}:/${encodeURIComponent(sitePath)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const site = await siteRes.json().catch(() => ({}));
    if (!siteRes.ok || !site.id) {
      return fail(siteRes.status || 500, "Failed to resolve site id.", debug ? { siteResStatus: siteRes.status, site } : undefined);
    }

    // 3) Resolve drive (library)
    const drivesRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const drives = await drivesRes.json().catch(() => ({}));
    if (!drivesRes.ok || !Array.isArray(drives.value)) {
      return fail(drivesRes.status || 500, "Failed to list site drives.", debug ? { drivesResStatus: drivesRes.status, drives } : undefined);
    }

    // Prefer an exact match; otherwise fall back to the first "documentLibrary" drive.
    const drive =
      drives.value.find(d => d.name?.toLowerCase() === libraryName.toLowerCase()) ||
      drives.value.find(d => d.driveType === "documentLibrary") ||
      drives.value[0];

    if (!drive?.id) {
      return fail(404, `Could not resolve a document library (looked for "${libraryName}").`, debug ? { drives } : undefined);
    }

    // 4) Fetch file content by path (URL-encode each segment)
    const encodedPath = relPath.split("/").map(encodeURIComponent).join("/");
    const contentUrl  = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;

    const fileResp = await fetch(contentUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!fileResp.ok) {
      const text = await fileResp.text().catch(() => "");
      return fail(fileResp.status, "Graph returned an error for file content.", debug ? { contentUrl, text } : undefined);
    }

    // 5) Stream the PDF to the browser
    return new Response(fileResp.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(relPath.split("/").pop() || "file.pdf")}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    return fail(500, "Unhandled error.", debug ? { message: String(err), stack: (err && err.stack) || "" } : undefined);
  }
}

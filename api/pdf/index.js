// /api/pdf/index.js  (Node 18+, Azure Static Web Apps Functions-style)
// Streams a PDF from SharePoint Online via Microsoft Graph (app‑only).
//
// APP SETTINGS you must set in the SWA (Environment variables):
//   SP_TENANT_ID       (your Entra tenant id, GUID)
//   SP_CLIENT_ID       (app registration - application (client) id)
//   SP_CLIENT_SECRET   (client secret value)
//   SP_SITE_URL        (e.g. https://{tenant}.sharepoint.com/sites/HESAAWebRequestsPoC)
// Optional:
//   SP_LIBRARY_NAME    (e.g. "Documents"; defaults to "Documents")
//   SP_PDF_FOLDER      (optional folder prefix inside the library, e.g. "Brochures")
//
// Usage (from site):
//   <iframe src="/api/pdf?file=StateHolidays.pdf"></iframe>
//   // also supports: /partials/pdf.html?file=StateHolidays.pdf
//
// Security guards:
//   - only .pdf is allowed
//   - no path traversal ("..")

export async function onRequest(req) {
  const steps = [];
  const debug = new URL(req.url).searchParams.get("debug") === "1";

  try {
    // -------- 0) Read env + validate input --------
    const url = new URL(req.url);

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;
    const libraryName  = process.env.SP_LIBRARY_NAME || "Documents"; // Modern default
    const folderPrefix = (process.env.SP_PDF_FOLDER || "").replace(/^\/+|\/+$/g, ""); // optional

    const fileRaw = (url.searchParams.get("file") || url.searchParams.get("doc") || "").trim();

    if (!fileRaw) {
      return _json({ ok: false, error: "Missing ?file=..." }, 400);
    }

    // guards
    const isPdf = /\.pdf$/i.test(fileRaw);
    const hasTraversal = fileRaw.includes("..");
    if (!isPdf || hasTraversal) {
      return _json({ ok: false, error: "Invalid file name." }, 400);
    }

    // -------- 1) App-only token --------
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
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      steps.push({ step: "token", status: "error", statusCode: tokenRes.status, body: tokenJson });
      return _json({ ok: false, steps }, 500);
    }
    const token = tokenJson.access_token;
    steps.push({ step: "token", status: "ok" });

    // -------- 2) Resolve site id from SP_SITE_URL --------
    // Expect: https://{host}/sites/{sitePath...}
    const parsed = new URL(siteUrl);
    const host = parsed.hostname;                 // vkolugurihesaa.sharepoint.com
    const sitePath = parsed.pathname.replace(/^\/+/, ""); // "sites/HESAAWebRequestsPoC"
    const sitePathTail = sitePath.replace(/^sites\//i, ""); // "HESAAWebRequestsPoC"

    const siteLookupUrl = `https://graph.microsoft.com/v1.0/sites/${host}:/sites/${encodeURIComponent(sitePathTail)}`;
    const siteRes = await fetch(siteLookupUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const siteJson = await siteRes.json();
    if (!siteRes.ok || !siteJson?.id) {
      steps.push({ step: "site", status: "error", statusCode: siteRes.status, url: siteLookupUrl, body: siteJson });
      return _json({ ok: false, steps }, 500);
    }
    const siteId = siteJson.id; // e.g. "domain.sharepoint.com,GUID,GUID"
    steps.push({ step: "site", status: "ok", siteId, displayName: siteJson.displayName });

    // -------- 3) List drives (document libraries) for that site --------
    // IMPORTANT: Use the siteId directly. Encode it once as a path segment.
    const drivesUrl = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/drives?$select=id,name,driveType`;
    const drivesRes = await fetch(drivesUrl, { headers: { Authorization: `Bearer ${token}` } });
    const drivesJson = await drivesRes.json();

    if (!drivesRes.ok) {
      steps.push({ step: "drives", status: "error", statusCode: drivesRes.status, url: drivesUrl, body: drivesJson });
      return _json({ ok: false, steps }, 500);
    }

    const drives = Array.isArray(drivesJson.value) ? drivesJson.value : [];
    // Try exact name match, otherwise first documentLibrary
    let drive = drives.find(d => (d.name || "").toLowerCase() === libraryName.toLowerCase());
    if (!drive) drive = drives.find(d => d.driveType === "documentLibrary");
    if (!drive) {
      steps.push({
        step: "drives",
        status: "error",
        reason: `No document library found (looked for "${libraryName}").`,
        available: drives.map(d => ({ name: d.name, driveType: d.driveType })),
      });
      return _json({ ok: false, steps }, 404);
    }
    steps.push({ step: "drives", status: "ok", chosen: { id: drive.id, name: drive.name } });

    // -------- 4) Build file path under the library (optionally under folderPrefix) --------
    // Segment-encode to handle spaces/specials safely.
    const pathSegments = [];
    if (folderPrefix) pathSegments.push(...folderPrefix.split("/").filter(Boolean));
    pathSegments.push(...fileRaw.split("/").filter(Boolean));
    const pathEncoded = pathSegments.map(encodeURIComponent).join("/");

    // e.g. /v1.0/drives/{driveId}/root:/Brochures/course%20completion.pdf:/content
    const fileUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${pathEncoded}:/content`;

    // -------- 5) Stream the file --------
    const pdfRes = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });

    if (!pdfRes.ok) {
      let errBody;
      try { errBody = await pdfRes.text(); } catch {}
      steps.push({
        step: "file",
        status: "error",
        statusCode: pdfRes.status,
        url: fileUrl,
        body: errBody || "<no body>",
      });
      return _json({ ok: false, steps }, 404);
    }

    // Success — stream back to the browser
    steps.push({ step: "file", status: "ok", statusCode: pdfRes.status, url: fileUrl });

    // In debug mode, return diagnostics instead of streaming the PDF
    if (debug) {
      return _json({ ok: true, steps }, 200);
    }

    return new Response(pdfRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pathSegments[pathSegments.length - 1]}"`,
        // helpful cache for PDFs; adjust as you like
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    steps.push({ step: "exception", status: "error", error: String(e) });
    return _json({ ok: false, steps }, 500);
  }
}

/* ----------------- helpers ------------------ */
function _json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

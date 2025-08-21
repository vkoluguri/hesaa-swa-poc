// /api/pdf/index.js  (Node 18+ on Azure Static Web Apps)
// Streams a PDF from SharePoint Online to the browser using Microsoft Graph (app-only).
//
// Required app settings (Production env variables):
//   SP_TENANT_ID        - Entra tenant id (GUID)
//   SP_CLIENT_ID        - App registration (application) id
//   SP_CLIENT_SECRET    - Client secret
//   SP_SITE_URL         - e.g. https://contoso.sharepoint.com/sites/HESAAWebRequestsPoC
// Optional:
//   SP_LIBRARY_NAME     - Library display name (default: "Shared Documents")
//
// Query:
//   ?file=course%20completion.pdf
//   ?file=FolderA/SubFolder/Some File.pdf
//   (Optional) &debug=1 to get JSON diagnostics instead of streaming the PDF
//
// Permissions (Application): Microsoft Graph -> Sites.Read.All (you have ReadWrite; that’s fine)

const G = "https://graph.microsoft.com/v1.0";

function okJson(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function badRequest(msg) { return okJson({ ok:false, error: msg }, 400); }
function forbidden(msg)  { return okJson({ ok:false, error: msg }, 403); }
function fail(msg)       { return okJson({ ok:false, error: msg }, 500); }

export async function onRequest(req, ctx) {
  const steps = [];                   // collected diagnostics
  const url = new URL(req.url);
  const fileRaw = url.searchParams.get("file") || url.searchParams.get("doc");
  const debug   = url.searchParams.get("debug") === "1";

  if (!fileRaw) return badRequest("Missing ?file");

  // Guardrails: only PDFs, no path traversal
  const isPdf = /\.pdf$/i.test(fileRaw);
  const safe  = !fileRaw.includes("..");
  if (!isPdf || !safe) return badRequest("Invalid file; only .pdf without '..' is allowed");

  // Env
  const tenant       = process.env.SP_TENANT_ID;
  const clientId     = process.env.SP_CLIENT_ID;
  const clientSecret = process.env.SP_CLIENT_SECRET;
  const siteUrl      = process.env.SP_SITE_URL;
  const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

  if (!tenant || !clientId || !clientSecret || !siteUrl) {
    return fail("Missing one or more env vars: SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL");
  }

  try {
    // 1) Token
    steps.push({ step: "token", status: "start" });
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      })
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      steps.push({ step: "token", status: "error", tokenError: tokenJson });
      return debug ? okJson({ ok:false, steps }, 500) : fail("Token error");
    }
    const token = tokenJson.access_token;
    steps.push({ step: "token", status: "ok" });

    // 2) Resolve site by URL
    steps.push({ step: "site", status: "start", siteUrl });

    const siteU = new URL(siteUrl);
    const hostname = siteU.hostname;                // contoso.sharepoint.com
    // Expected path form: /sites/<SiteName>[/<sub>...]
    const pathParts = siteU.pathname.split("/").filter(Boolean);
    const sitesIdx  = pathParts.indexOf("sites");
    if (sitesIdx < 0 || sitesIdx === pathParts.length - 1) {
      steps.push({ step: "site", status: "error", reason: "SP_SITE_URL must look like https://domain/sites/SiteName" });
      return debug ? okJson({ ok:false, steps }, 400) : badRequest("SP_SITE_URL format invalid");
    }
    const sitePath = pathParts.slice(sitesIdx + 1).join("/"); // "HESAAWebRequestsPoC" (or more segments)

    const siteRes = await fetch(`${G}/sites/${hostname}:/sites/${encodeURIComponent(sitePath)}`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const site = await siteRes.json();
    if (!siteRes.ok || !site?.id) {
      steps.push({ step: "site", status: "error", siteResStatus: siteRes.status, siteBody: site });
      return debug ? okJson({ ok:false, steps }, 500) : fail("Could not resolve site");
    }
    steps.push({ step: "site", status: "ok", siteId: site.id });

    // 3) Find library (drive)
    steps.push({ step: "drive", status: "start", libraryName });
    const drivesRes = await fetch(`${G}/sites/${site.id}/drives`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const drives = await drivesRes.json();
    if (!drivesRes.ok || !Array.isArray(drives.value)) {
      steps.push({ step: "drive", status: "error", drivesStatus: drivesRes.status, drivesBody: drives });
      return debug ? okJson({ ok:false, steps }, 500) : fail("Could not list drives (libraries)");
    }
    // Prefer exact name match; otherwise fall back to the first document library.
    let drive = drives.value.find(d => d.name === libraryName);
    if (!drive) drive = drives.value.find(d => (d.driveType === "documentLibrary")) || drives.value[0];
    if (!drive?.id) {
      steps.push({ step: "drive", status: "error", available: drives.value.map(d => d.name) });
      return debug ? okJson({ ok:false, steps }, 404) : fail(`Library not found: ${libraryName}`);
    }
    steps.push({ step: "drive", status: "ok", driveId: drive.id, driveName: drive.name });

    // 4) Build path and fetch content
    steps.push({ step: "file", status: "start", fileRaw });

    // Encode each path segment to preserve spaces & unicode
    const encodedPath = fileRaw.split("/").map(encodeURIComponent).join("/");
    const contentUrl = `${G}/drives/${drive.id}/root:/${encodedPath}:/content`;

    const pdfRes = await fetch(contentUrl, {
      headers: { authorization: `Bearer ${token}` }
    });

    if (!pdfRes.ok) {
      const errBody = await pdfRes.text().catch(() => "");
      steps.push({ step: "file", status: "error", fetchStatus: pdfRes.status, body: errBody });
      return debug ? okJson({ ok:false, steps }, pdfRes.status) : fail("File fetch failed");
    }

    if (debug) {
      steps.push({ step: "file", status: "ok" });
      return okJson({ ok:true, steps, hint: "remove &debug=1 to stream the PDF" });
    }

    // 5) Stream to browser
    const dispName = decodeURIComponent(encodedPath.split("/").pop());
    return new Response(pdfRes.body, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${dispName}"`
      }
    });

  } catch (e) {
    steps.push({ step: "exception", error: String(e) });
    return debug ? okJson({ ok:false, steps }, 500) : fail("Unhandled error");
  }
}

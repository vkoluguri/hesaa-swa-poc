// Azure Functions (CommonJS). Node 18+ has global fetch.
// We buffer the PDF and return it with isRaw for correct binary output.

const { Readable } = require("stream"); // not strictly needed here, but handy if you ever switch to streaming

module.exports = async function (context, req) {
  const steps = [];
  try {
    // ------ input / validation ------
    const fileRaw = (req.query.file || req.query.doc || "").trim();
    if (!fileRaw) {
      context.res = { status: 400, jsonBody: { ok: false, error: "file query required" } };
      return;
    }
    // simple guard: allow only .pdf and block path traversal
    if (!/^[\w\-./ %]+\.pdf$/i.test(fileRaw) || fileRaw.includes("..")) {
      context.res = { status: 400, jsonBody: { ok: false, error: "invalid file" } };
      return;
    }

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const siteUrl      = process.env.SP_SITE_URL;
    // >>> your requested default <<<
    const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

    if (!tenant || !clientId || !clientSecret || !siteUrl) {
      context.res = { status: 500, jsonBody: { ok: false, error: "Missing SP_* environment variables" } };
      return;
    }

    const debug = req.query.debug === "1";

    // ------ token ------
    const tokRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
      })
    });
    const tok = await tokRes.json();
    if (!tokRes.ok) {
      if (debug) steps.push({ step: "token", status: "error", statusCode: tokRes.status, body: tok });
      context.res = { status: tokRes.status, jsonBody: { ok: false, error: tok.error_description || tok.error || "token error", steps } };
      return;
    }
    const token = tok.access_token;
    if (debug) steps.push({ step: "token", status: "ok" });

    // ------ site ------
    const u = new URL(siteUrl);
    const host = u.hostname;                    // *.sharepoint.com
    const sitePath = u.pathname.replace(/^\/+/, ""); // e.g. sites/HESAAWebRequestsPoC

    const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${host}:/${sitePath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const site = await siteRes.json();
    if (!siteRes.ok || !site?.id) {
      if (debug) steps.push({ step: "site", status: "error", statusCode: siteRes.status, body: site });
      context.res = { status: siteRes.status, jsonBody: { ok: false, error: site?.error?.message || "site error", steps } };
      return;
    }
    if (debug) steps.push({ step: "site", status: "ok", siteId: site.id });

    // ------ drive/library ------
    const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${site.id}/drives`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const drives = await drivesRes.json();
    if (!drivesRes.ok) {
      if (debug) steps.push({ step: "drives", status: "error", statusCode: drivesRes.status, body: drives });
      context.res = { status: drivesRes.status, jsonBody: { ok: false, error: drives?.error?.message || "drives error", steps } };
      return;
    }

    const drive =
      drives.value?.find(x => x.name === libraryName) ||
      drives.value?.find(x => x.driveType === "documentLibrary") ||
      drives.value?.[0];

    if (!drive?.id) {
      if (debug) steps.push({ step: "drives", status: "error", reason: `library '${libraryName}' not found` });
      context.res = { status: 404, jsonBody: { ok: false, error: `library '${libraryName}' not found`, steps } };
      return;
    }
    if (debug) steps.push({ step: "drives", status: "ok", driveId: drive.id, driveName: drive.name });

    // ------ fetch file content ------
    const encodedPath = fileRaw.split("/").map(encodeURIComponent).join("/");
    const fileUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;
    const fileRes = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });

    if (!fileRes.ok) {
      const errText = await fileRes.text().catch(() => "");
      if (debug) steps.push({ step: "file", status: "error", statusCode: fileRes.status, body: errText });
      context.res = { status: fileRes.status, jsonBody: { ok: false, error: errText || "file fetch error", steps } };
      return;
    }

    // Buffer it (safe for Azure Functions)
    const ab = await fileRes.arrayBuffer();
    const pdfBuffer = Buffer.from(ab);

    const filename = fileRaw.split("/").pop();
    const headers = {
      "Content-Type": fileRes.headers.get("content-type") || "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`
    };
    const len = fileRes.headers.get("content-length");
    if (len) headers["Content-Length"] = len;

    context.res = {
      status: 200,
      headers,
      isRaw: true,  // return exact bytes
      body: pdfBuffer
    };
  } catch (err) {
    context.log.error("API /pdf error:", err);
    context.res = { status: 500, jsonBody: { ok: false, error: String(err) } };
  }
};

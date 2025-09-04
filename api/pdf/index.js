// api/pdf/index.js
// Streams a PDF from SharePoint (Graph, app-only). Add ?debug=1 to see a JSON trace.
// Env needed: SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL, [SP_LIBRARY_NAME]

// Helper: safe stringify for logs
const toStr = (x) => {
  try { return typeof x === "string" ? x : JSON.stringify(x); }
  catch { return String(x); }
};

// Helper: read a small body (don’t spam logs with huge payloads)
async function peekBody(res, max = 1500) {
  try {
    const txt = await res.text();
    return txt.length > max ? txt.slice(0, max) + "…(truncated)" : txt;
  } catch {
    return "(failed to read body)";
  }
}

module.exports = async function (context, req) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";
  const steps = [];
  const log = (...a) => console.log("[pdf]", ...a);

  const siteUrl      = process.env.SP_SITE_URL || "";
  const tenantId     = process.env.SP_TENANT_ID || "";
  const clientId     = process.env.SP_CLIENT_ID || "";
  const clientSecret = process.env.SP_CLIENT_SECRET || "";
  const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

  // 0) basic input
  const fileRaw = (url.searchParams.get("file") || url.searchParams.get("doc") || "").trim();
  const fileForTitle = fileRaw.split("/").pop() || fileRaw;

  log("REQ file =", fileRaw, " debug =", debug);
  log("ENV siteUrl =", siteUrl, " libraryName =", libraryName);

  if (!fileRaw) {
    const msg = "Missing query ?file=<name.pdf>";
    steps.push({ step: "input", status: "error", reason: msg });
    context.res = { status: 400, body: debug ? { ok:false, steps } : msg };
    return;
  }
  if (!siteUrl.startsWith("https://") || !siteUrl.includes(".sharepoint.com")) {
    const msg = "SP_SITE_URL must be like https://<tenant>.sharepoint.com/sites/<SiteName>";
    steps.push({ step: "env", status: "error", reason: msg });
    context.res = { status: 500, body: debug ? { ok:false, steps } : "Server configuration error." };
    return;
  }

  // Parse site hostname and /sites/<path>
  const u = new URL(siteUrl);
  const hostname = u.hostname;                  // e.g., vkolugurihesaa.sharepoint.com
  const sitePath = u.pathname.replace(/^\/+/, ""); // e.g., sites/HESAAWebRequestsPoC

  try {
    // 1) Token
    steps.push({ step: "token", status: "start" });
    log("STEP token: requesting client_credentials token");
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default"
      })
    });
    const tokenText = await peekBody(tokenRes);
    log("token status =", tokenRes.status, " body ~", tokenText);
    if (!tokenRes.ok) {
      steps.push({ step: "token", status: "error", http: tokenRes.status, body: tokenText });
      context.res = { status: 500, body: debug ? { ok:false, steps } : "Auth failed (token)." };
      return;
    }
    const { access_token } = JSON.parse(tokenText);
    steps.push({ step: "token", status: "ok" });

    // 2) Resolve site
    steps.push({ step: "site", status: "start" });
    log("STEP site: resolving", `${hostname}:/${sitePath}`);
    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${hostname}:/${encodeURI(sitePath)}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const siteTxt = await peekBody(siteRes);
    log("site status =", siteRes.status, " body ~", siteTxt);
    if (!siteRes.ok) {
      steps.push({ step: "site", status: "error", http: siteRes.status, body: siteTxt });
      context.res = { status: 500, body: debug ? { ok:false, steps } : "Cannot resolve site." };
      return;
    }
    const site = JSON.parse(siteTxt);
    steps.push({ step: "site", status: "ok", siteId: site.id });

    // 3) Get drives (libraries)
    steps.push({ step: "drives", status: "start" });
    log("STEP drives: listing libraries for site", site.id);
    const drivesRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const drivesTxt = await peekBody(drivesRes);
    log("drives status =", drivesRes.status, " body ~", drivesTxt);
    if (!drivesRes.ok) {
      steps.push({ step: "drives", status: "error", http: drivesRes.status, body: drivesTxt });
      context.res = { status: 500, body: debug ? { ok:false, steps } : "Cannot list libraries." };
      return;
    }
    const drives = JSON.parse(drivesTxt).value || [];
    const drive = drives.find(d =>
      (d.driveType === "documentLibrary") &&
      (d.name === libraryName || d.webUrl?.includes(`/${encodeURIComponent(libraryName)}/`))
    );
    log("drive selected =", drive ? `${drive.name} (${drive.id})` : "NOT FOUND");
    if (!drive) {
      steps.push({ step: "drives", status: "error", reason: `Library "${libraryName}" not found`, available: drives.map(d => d.name) });
      context.res = { status: 404, body: debug ? { ok:false, steps } : "Library not found." };
      return;
    }
    steps.push({ step: "drives", status: "ok", driveId: drive.id, driveName: drive.name });

    // 4) Fetch file content
    steps.push({ step: "file", status: "start", path: fileRaw });
    const encodedPath = fileRaw.split("/").map(s => encodeURIComponent(s)).join("/");
    const fileUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;
    log("STEP file: GET", fileUrl);
    const pdfRes = await fetch(fileUrl, { headers: { Authorization: `Bearer ${access_token}` } });

    if (!pdfRes.ok) {
      const body = await peekBody(pdfRes);
      log("file fetch FAILED status =", pdfRes.status, " body ~", body);
      steps.push({ step: "file", status: "error", http: pdfRes.status, body });
      context.res = { status: pdfRes.status, body: debug ? { ok:false, steps } : "File fetch failed." };
      return;
    }
    steps.push({ step: "file", status: "ok", http: pdfRes.status });

    if (debug) {
      // Don’t stream in debug
      context.res = { status: 200, body: { ok: true, steps } };
      return;
    }

    // Stream the PDF to client
    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    log("file stream size =", buffer.length, "bytes");
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileForTitle)}"`,
        "Cache-Control": "no-store"
      },
      body: buffer
    };
  } catch (err) {
    log("EXCEPTION", err?.stack || err);
    steps.push({ step: "exception", status: "error", error: toStr(err?.message || err) });
    context.res = { status: 500, body: debug ? { ok:false, steps } : "Server error." };
  }
};

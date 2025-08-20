// /api/pdf/index.js  — Azure Static Web Apps (Node 18)
// Streams a PDF from a SharePoint library using Microsoft Graph.
// Required app settings: SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL
// Optional: SP_LIBRARY_NAME  (defaults to "Shared Documents")
//
// Debugging: add &debug=1 to the URL to get a JSON error response instead of a blank 500.
// Example: /api/pdf?file=course%20completion.pdf&debug=1

export async function onRequest(req, ctx) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");           // e.g. "course completion.pdf" or "Folder/My.pdf"
  const debug = url.searchParams.get("debug") === "1"; // return JSON errors when true

  // ---- Guard rails (allow only .pdf, no parent traversal) ----
  if (!file) {
    return jsonError(400, "Missing ?file query (e.g. ?file=course%20completion.pdf)", debug);
  }
  const safe = /^[\w\-./ %]+\.pdf$/i.test(file) && !file.includes("..");
  if (!safe) {
    return jsonError(400, "Invalid file name. Must be a .pdf and cannot contain '..'", debug);
  }

  try {
    // ---- Config ----
    const tenant       = must("SP_TENANT_ID");
    const clientId     = must("SP_CLIENT_ID");
    const clientSecret = must("SP_CLIENT_SECRET");
    const siteUrl      = must("SP_SITE_URL");                  // https://<tenant>.sharepoint.com/sites/<SiteName>
    const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

    // ---- 1) App-only token for Graph ----
    const token = await getAppToken(tenant, clientId, clientSecret);

    // ---- 2) Resolve site id ----
    const { hostname, pathname } = new URL(siteUrl);
    // Graph site lookup format: sites/{hostname}:/sites/{sitePath}
    const sitePath = pathname.replace(/^\/+/, ""); // e.g. "sites/HESAAWebRequestsPoC"
    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(hostname)}:/${encodeURIComponent(sitePath)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const site = await siteRes.json();
    if (!siteRes.ok) {
      return jsonError(siteRes.status, `Site lookup failed: ${siteRes.status} ${siteRes.statusText} :: ${stringify(site)}`, debug);
    }
    if (!site?.id) {
      return jsonError(500, `Could not resolve site id from ${siteUrl} :: ${stringify(site)}`, debug);
    }

    // ---- 3) Resolve drive (library) id ----
    const drivesRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const drives = await drivesRes.json();
    if (!drivesRes.ok) {
      return jsonError(drivesRes.status, `Drives listing failed :: ${stringify(drives)}`, debug);
    }
    const drive = (drives.value || []).find(d => (d.name || "").toLowerCase() === libraryName.toLowerCase())
               || (drives.value || [])[0];
    if (!drive?.id) {
      return jsonError(404, `Could not resolve drive for library "${libraryName}"`, debug);
    }

    // ---- 4) Fetch file content by path ----
    // Path inside the library is exactly what the user passed in ?file=...
    // Each segment must be encoded ONE BY ONE
    const encodedPath = file.split("/").map(encodeURIComponent).join("/");
    const contentUrl = `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${encodedPath}:/content`;
    const fileResp = await fetch(contentUrl, { headers: { Authorization: `Bearer ${token}` } });

    if (!fileResp.ok) {
      const text = await fileResp.text().catch(() => "");
      return jsonError(fileResp.status, `Download failed: ${fileResp.status} ${fileResp.statusText} :: ${text}`, debug);
    }

    // ---- 5) Stream back to the browser ----
    return new Response(fileResp.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // Let the viewer show inline; set attachment if you want forced download:
        // "Content-Disposition": `attachment; filename="${basename(file)}"`
        "Content-Disposition": `inline; filename="${basename(file)}"`
      }
    });

  } catch (err) {
    // Unexpected crash path
    return jsonError(500, `Unhandled error: ${String(err?.message || err)}`, debug);
  }
}

/* ---------- helpers ---------- */
function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing app setting ${name}`);
  return v;
}
async function getAppToken(tenant, clientId, clientSecret) {
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
  const json = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Token error: ${tokenRes.status} ${tokenRes.statusText} :: ${stringify(json)}`);
  }
  return json.access_token;
}
function basename(p) {
  const parts = (p || "").split("/");
  return parts[parts.length - 1] || "file.pdf";
}
function stringify(x) {
  try { return JSON.stringify(x); } catch { return String(x); }
}
function jsonError(status, message, debug) {
  // For normal user flow we keep status and an empty body so viewers don't print JSON,
  // BUT when debug=1 we return JSON so you can see the exact error in the browser.
  if (debug) {
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status, headers: { "Content-Type": "application/json" }
    });
  }
  // Still include a tiny text (helps in Network tab)
  return new Response(message, { status, headers: { "Content-Type": "text/plain" } });
}

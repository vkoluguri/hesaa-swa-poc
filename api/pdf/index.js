// /api/pdf/index.js  (Azure Static Web Apps / Node 18+)
//
// Streams a PDF from SharePoint Online via Microsoft Graph (app-only).
// Works even if /sites/{siteId}/drives returns [] by falling back to
// the site's default drive: /sites/{siteId}/drive.
//
// Required SWA environment variables (Production slot):
//   SP_TENANT_ID     = <AAD tenant id>
//   SP_CLIENT_ID     = <app registration (application) id>
//   SP_CLIENT_SECRET = <client secret>
//   SP_SITE_URL      = https://<tenant>.sharepoint.com/sites/<SiteName>
// Optional:
//   SP_LIBRARY_NAME  = Friendly library name (e.g., "Shared Documents")
//
// Usage from browser:
//   /api/pdf?file=StateHolidays.pdf
//   /api/pdf?file=Brochures/2025/guide.pdf
//   /api/pdf?file=course%20completion.pdf&debug=1   (debug JSON)

const TOKEN_URL = (tenant) =>
  `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

const G = (path) => `https://graph.microsoft.com/v1.0${path}`;

export async function onRequest(req) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  const steps = [];
  const bad = (status, obj) =>
    new Response(JSON.stringify(obj, null, 2), {
      status,
      headers: { "content-type": "application/json" },
    });

  try {
    // ---- 0) read config
    const tenant = process.env.SP_TENANT_ID || "";
    const clientId = process.env.SP_CLIENT_ID || "";
    const clientSecret = process.env.SP_CLIENT_SECRET || "";
    const siteUrl = process.env.SP_SITE_URL || "";
    const wantedLibrary = (process.env.SP_LIBRARY_NAME || "").trim();

    const fileRaw = (url.searchParams.get("file") || url.searchParams.get("doc") || "").trim();

    if (!fileRaw) {
      return bad(400, { ok: false, error: "Missing ?file=..." });
    }

    // guard: allow only PDFs, no path traversal
    const safe = /^[\w\-./ %]+\.pdf$/i.test(fileRaw) && !fileRaw.includes("..");
    if (!safe) {
      return bad(400, { ok: false, error: "Invalid file path" });
    }

    if (!tenant || !clientId || !clientSecret || !siteUrl) {
      return bad(500, {
        ok: false,
        error: "Missing required environment variables",
        missing: {
          SP_TENANT_ID: !!tenant,
          SP_CLIENT_ID: !!clientId,
          SP_CLIENT_SECRET: !!clientSecret,
          SP_SITE_URL: !!siteUrl,
        },
      });
    }

    // ---- 1) token
    const form = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const tokRes = await fetch(TOKEN_URL(tenant), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });

    const tok = await tokRes.json().catch(() => ({}));
    if (!tokRes.ok || !tok?.access_token) {
      steps.push({ step: "token", ok: false, status: tokRes.status, body: tok });
      return debug ? bad(500, { ok: false, steps }) : bad(500, { ok: false, error: "Auth failed" });
    }
    const auth = { Authorization: `Bearer ${tok.access_token}` };
    steps.push({ step: "token", ok: true });

    // ---- 2) resolve site by path (never use the raw composite id in the URL)
    const { hostname, pathname } = new URL(siteUrl);
    const sitePath = pathname.replace(/^\/+/, ""); // e.g. "sites/HESAAWebRequestsPoC"

    const siteRes = await fetch(
      G(`/sites/${encodeURIComponent(hostname)}:/` + sitePath),
      { headers: auth }
    );
    const site = await siteRes.json().catch(() => ({}));
    if (!siteRes.ok || !site?.id) {
      steps.push({ step: "site", ok: false, status: siteRes.status, body: site });
      return debug ? bad(siteRes.status, { ok: false, steps }) : bad(500, { ok: false, error: "Site lookup failed" });
    }
    steps.push({ step: "site", ok: true, siteId: site.id });

    // ---- 3) pick a drive (document library)
    // If SP_LIBRARY_NAME is supplied, try to match it; otherwise use the default drive.
    let driveId = null;

    if (wantedLibrary) {
      const dRes = await fetch(G(`/sites/${site.id}/drives?$select=id,name,driveType`), { headers: auth });
      const dJson = await dRes.json().catch(() => ({}));
      if (dRes.ok && Array.isArray(dJson.value)) {
        const match = dJson.value.find(
          (d) =>
            String(d.driveType).toLowerCase() === "documentlibrary" &&
            String(d.name || "").toLowerCase() === wantedLibrary.toLowerCase()
        );
        if (match) {
          driveId = match.id;
          steps.push({ step: "drive", ok: true, mode: "named", driveId, name: match.name });
        } else {
          steps.push({ step: "drive", ok: false, mode: "named-not-found", wantedLibrary, available: dJson.value.map(v => ({ id: v.id, name: v.name, type: v.driveType })) });
        }
      } else {
        steps.push({ step: "drive", ok: false, mode: "list-failed", status: dRes.status, body: dJson });
      }
    }

    // Fallback: default library
    if (!driveId) {
      const defRes = await fetch(G(`/sites/${site.id}/drive?$select=id,name`), { headers: auth });
      const defJson = await defRes.json().catch(() => ({}));
      if (!defRes.ok || !defJson?.id) {
        steps.push({ step: "defaultDrive", ok: false, status: defRes.status, body: defJson });
        return debug ? bad(defRes.status, { ok: false, steps }) : bad(500, { ok: false, error: "Drive lookup failed" });
      }
      driveId = defJson.id;
      steps.push({ step: "defaultDrive", ok: true, driveId, name: defJson.name });
    }

    // ---- 4) fetch file content (Graph encodes each segment)
    const path = fileRaw.split("/").map(encodeURIComponent).join("/");
    const fileRes = await fetch(G(`/drives/${driveId}/root:/${path}:/content`), { headers: auth });

    if (!fileRes.ok) {
      const text = await fileRes.text().catch(() => "");
      steps.push({ step: "file", ok: false, status: fileRes.status, body: text });
      return debug
        ? bad(fileRes.status, { ok: false, steps })
        : bad(fileRes.status, { ok: false, error: "File fetch failed" });
    }

    // ---- 5) stream back
    return new Response(fileRes.body, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${decodeURIComponent(path.split("/").pop() || "file.pdf")}"`,
        // allow <iframe src="/api/pdf?..."> to render
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    steps.push({ step: "exception", ok: false, error: String(e) });
    return debug ? bad(500, { ok: false, steps }) : bad(500, { ok: false, error: "Server error" });
  }
}

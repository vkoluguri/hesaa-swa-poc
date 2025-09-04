// Node 18+ (SWA functions)
// Streams a PDF from SharePoint Online via Microsoft Graph (app-only).
//
// Required app settings:
//   SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL
// Optional:
//   SP_LIBRARY_NAME   (e.g., "Shared Documents"; falls back to site's default drive)
//
// Usage (from browser):
//   /api/pdf?file=StateHolidays.pdf
//   /api/pdf?file=folder1/folder2/course%20completion.pdf
//   add &debug=1 to see detailed steps as JSON (no PDF streaming)

export async function onRequest(req) {
  const steps = [];
  const debug = new URL(req.url).searchParams.get("debug") === "1";

  const json = (obj, status = 200, extra = {}) =>
    new Response(JSON.stringify(obj, null, 2), {
      status,
      headers: { "Content-Type": "application/json", ...extra },
    });

  try {
    // ──────────────────────────────────────────────────────────────────────────────
    // 1) Parse and validate input
    // ──────────────────────────────────────────────────────────────────────────────
    const url = new URL(req.url);
    const fileRaw = (url.searchParams.get("file") || url.searchParams.get("doc") || "").trim();

    if (!fileRaw) {
      return json({ ok: false, error: "Missing ?file=..." }, 400);
    }

    // Guard: only relative paths, no traversal, must end with .pdf
    const okPath =
      /^[\w\-./ %]+$/i.test(fileRaw) &&
      !fileRaw.includes("..") &&
      /\.pdf$/i.test(fileRaw);
    if (!okPath) {
      return json({ ok: false, error: "Invalid file path" }, 400);
    }

    const env = {
      tenant: process.env.SP_TENANT_ID || "",
      clientId: process.env.SP_CLIENT_ID || "",
      clientSecret: process.env.SP_CLIENT_SECRET || "",
      siteUrl: process.env.SP_SITE_URL || "",
      libraryName: process.env.SP_LIBRARY_NAME || "", // may be blank
    };

    steps.push({ step: "input", fileRaw, env: { ...env, clientSecret: env.clientSecret ? "***" : "" } });

    if (!env.tenant || !env.clientId || !env.clientSecret || !env.siteUrl) {
      return json({ ok: false, error: "Missing required app settings", env: { ...env, clientSecret: "***" } }, 500);
    }

    // Basic sanity on SP_SITE_URL
    if (!/^https:\/\/[^\/]+\.sharepoint\.com\/sites\/[^\/]+/i.test(env.siteUrl)) {
      return json({ ok: false, error: "SP_SITE_URL must look like https://<tenant>.sharepoint.com/sites/<siteName>" }, 400);
    }

    const siteUri = new URL(env.siteUrl);
    const host = siteUri.hostname; // e.g., vkolugurihesaa.sharepoint.com
    const sitePath = siteUri.pathname.replace(/^\/+/, ""); // e.g., sites/HESAAWebRequestsPoC
    const siteName = sitePath.replace(/^sites\//i, ""); // e.g., HESAAWebRequestsPoC

    // ──────────────────────────────────────────────────────────────────────────────
    // 2) Token
    // ──────────────────────────────────────────────────────────────────────────────
    const tokenRes = await fetch(`https://login.microsoftonline.com/${env.tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      steps.push({ step: "token", status: "error", statusCode: tokenRes.status, body: tokenJson });
      return json({ ok: false, steps }, 500);
    }
    const token = tokenJson.access_token;
    steps.push({ step: "token", status: "ok" });

    const gfetch = (u, init = {}) =>
      fetch(u, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
      });

    // ──────────────────────────────────────────────────────────────────────────────
    // 3) Resolve site (try modern getByPath, then legacy pattern)
    // ──────────────────────────────────────────────────────────────────────────────
    let site;
    // Try getByPath (most reliable)
    {
      const u = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(host)}/microsoft.graph.getByPath(path=${encodeURIComponent(
        "/" + sitePath
      )})?$select=id,displayName,webUrl`;
      const r = await gfetch(u);
      const j = await r.json();
      if (r.ok && j?.id) {
        site = j;
        steps.push({ step: "site@getByPath", status: "ok", siteId: site.id, siteWebUrl: site.webUrl });
      } else {
        steps.push({ step: "site@getByPath", status: "miss", statusCode: r.status, body: j });
      }
    }
    // Fallback legacy
    if (!site) {
      const u = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(host)}:/sites/${encodeURIComponent(
        siteName
      )}?$select=id,displayName,webUrl`;
      const r = await gfetch(u);
      const j = await r.json();
      if (r.ok && j?.id) {
        site = j;
        steps.push({ step: "site@legacy", status: "ok", siteId: site.id, siteWebUrl: site.webUrl });
      } else {
        steps.push({ step: "site@legacy", status: "error", statusCode: r.status, body: j });
        return json({ ok: false, steps }, 500);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 4) Resolve drive (library)
    // ──────────────────────────────────────────────────────────────────────────────
    let driveId = "";
    if (env.libraryName) {
      const r = await gfetch(`https://graph.microsoft.com/v1.0/sites/${site.id}/drives?$select=id,name,driveType`);
      const j = await r.json();
      if (r.ok && Array.isArray(j.value)) {
        const match =
          j.value.find((d) => d.name?.toLowerCase() === env.libraryName.toLowerCase()) ||
          j.value.find((d) => d.driveType === "documentLibrary"); // first doc lib
        if (match) {
          driveId = match.id;
          steps.push({ step: "drive", status: "ok", driveId, picked: match.name });
        } else {
          steps.push({ step: "drive", status: "miss", available: j.value.map((d) => ({ id: d.id, name: d.name })) });
        }
      } else {
        steps.push({ step: "drive", status: "miss", statusCode: r.status, body: j });
      }
    }

    // Fallback to default site drive
    if (!driveId) {
      const r = await gfetch(`https://graph.microsoft.com/v1.0/sites/${site.id}/drive?$select=id,driveType,name`);
      const j = await r.json();
      if (r.ok && j?.id) {
        driveId = j.id;
        steps.push({ step: "drive@default", status: "ok", driveId, name: j.name, driveType: j.driveType });
      } else {
        steps.push({ step: "drive@default", status: "error", statusCode: r.status, body: j });
        return json({ ok: false, steps }, 500);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 5) Fetch file content (segment-encode the path)
    // ──────────────────────────────────────────────────────────────────────────────
    const encodedPath = fileRaw.split("/").map(encodeURIComponent).join("/");
    const contentUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodedPath}:/content`;

    const pdfRes = await gfetch(contentUrl);
    if (!pdfRes.ok) {
      const body = await safeReadText(pdfRes);
      steps.push({ step: "file", status: "error", statusCode: pdfRes.status, body });
      return json({ ok: false, steps }, pdfRes.status);
    }

    // If debug, do not stream the body; show where we would stream from
    if (debug) {
      steps.push({ step: "file", status: "ok", contentUrl });
      return json({ ok: true, steps });
    }

    // Stream PDF to browser
    const headers = new Headers(pdfRes.headers);
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${fileRaw.split("/").pop()}"`);
    return new Response(pdfRes.body, { status: 200, headers });
  } catch (err) {
    steps.push({ step: "exception", error: String(err) });
    return json({ ok: false, steps }, 500);
  }
}

async function safeReadText(res) {
  try {
    return await res.text();
  } catch {
    return "<unreadable>";
  }
}

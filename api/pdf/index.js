// /api/pdf/index.js  (Azure Static Web Apps, Node 18+)
// Streams a PDF from SharePoint. Tries Graph first, then falls back to SharePoint REST.
//
// Env vars required:
//   SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL
// Optional:
//   SP_LIBRARY_NAME  (defaults to "Shared Documents")
//
// Query:
//   ?file=Policies/Student Guide.pdf
//   (Optional) &debug=1  -> returns JSON diagnostics instead of the PDF stream

const G = "https://graph.microsoft.com/v1.0";

const j = (o, s=200) => new Response(JSON.stringify(o, null, 2), {
  status: s, headers: { "content-type":"application/json; charset=utf-8" }
});

function encodePathSegments(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}

async function getToken(tenant, clientId, clientSecret, scope) {
  const r = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method:"POST",
    headers:{ "content-type":"application/x-www-form-urlencoded" },
    body:new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope,
      grant_type: "client_credentials"
    })
  });
  const t = await r.json().catch(()=> ({}));
  if (!r.ok || !t.access_token) {
    throw Object.assign(new Error("token_error"), { responseStatus:r.status, body:t });
  }
  return t.access_token;
}

export async function onRequest(req, ctx) {
  const steps = [];
  const u = new URL(req.url);
  const fileRaw = (u.searchParams.get("file") || u.searchParams.get("doc") || "").trim();
  const debug   = u.searchParams.get("debug") === "1";

  if (!fileRaw)   return j({ ok:false, error:"Missing ?file" }, 400);
  if (!/\.pdf$/i.test(fileRaw) || fileRaw.includes("..")) {
    return j({ ok:false, error:"Invalid file (must end .pdf, no '..')" }, 400);
  }

  const tenant       = process.env.SP_TENANT_ID;
  const clientId     = process.env.SP_CLIENT_ID;
  const clientSecret = process.env.SP_CLIENT_SECRET;
  const siteUrl      = process.env.SP_SITE_URL;
  const libraryName  = process.env.SP_LIBRARY_NAME || "Shared Documents";

  if (!tenant || !clientId || !clientSecret || !siteUrl) {
    return j({ ok:false, error:"Missing env: SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET, SP_SITE_URL" }, 500);
  }

  // Parse SP_SITE_URL like https://<tenant>.sharepoint.com/sites/<SiteName>[...]
  let hostname, sitePath;
  try {
    const su = new URL(siteUrl);
    hostname = su.hostname;
    const parts = su.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("sites");
    if (idx < 0 || idx === parts.length-1) {
      return j({ ok:false, error:"SP_SITE_URL must be https://<tenant>.sharepoint.com/sites/<SiteName>" }, 400);
    }
    sitePath = parts.slice(idx+1).join("/"); // e.g. HESAAWebRequestsPoC or nested
  } catch {
    return j({ ok:false, error:"SP_SITE_URL is not a valid URL" }, 400);
  }

  // helper to stream a readable body to the client
  const streamPdf = (body, fileName) => new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${fileName}"`
    }
  });

  const dispName = fileRaw.split("/").pop();

  try {
    // -------- 1) GRAPH path --------
    try {
      steps.push({ step:"graph_token", status:"start" });
      const graphToken = await getToken(tenant, clientId, clientSecret, "https://graph.microsoft.com/.default");
      steps.push({ step:"graph_token", status:"ok" });

      // Resolve site id
      steps.push({ step:"graph_site", status:"start", hostname, sitePath });
      const siteRes = await fetch(`${G}/sites/${hostname}:/sites/${sitePath}`, {
        headers:{ authorization: `Bearer ${graphToken}` }
      });
      const site = await siteRes.json().catch(()=> ({}));
      if (!siteRes.ok || !site?.id) {
        throw Object.assign(new Error("graph_site_error"), { responseStatus:siteRes.status, body:site });
      }
      steps.push({ step:"graph_site", status:"ok", siteId:site.id });

      // Find drive (library)
      steps.push({ step:"graph_drives", status:"start", libraryName });
      const drivesRes = await fetch(`${G}/sites/${site.id}/drives`, {
        headers:{ authorization: `Bearer ${graphToken}` }
      });
      const drives = await drivesRes.json().catch(()=> ({}));
      if (!drivesRes.ok || !Array.isArray(drives.value)) {
        throw Object.assign(new Error("graph_drives_error"), { responseStatus:drivesRes.status, body:drives });
      }
      let drive = drives.value.find(d => d.name === libraryName)
              || drives.value.find(d => d.driveType === "documentLibrary")
              || drives.value[0];
      if (!drive?.id) {
        throw Object.assign(new Error("graph_drive_not_found"), { available:(drives.value||[]).map(d=>d.name) });
      }
      steps.push({ step:"graph_drives", status:"ok", driveId:drive.id, driveName:drive.name });

      // Fetch file content
      steps.push({ step:"graph_file", status:"start", fileRaw });
      const encoded = encodePathSegments(fileRaw); // encode each segment
      const contentUrl = `${G}/drives/${drive.id}/root:/${encoded}:/content`;
      const pdfRes = await fetch(contentUrl, { headers:{ authorization:`Bearer ${graphToken}` } });
      if (!pdfRes.ok) {
        const errBody = await pdfRes.text().catch(()=> "");
        throw Object.assign(new Error("graph_file_error"), {
          responseStatus: pdfRes.status,
          headers: Object.fromEntries(pdfRes.headers.entries()),
          body: errBody
        });
      }
      steps.push({ step:"graph_file", status:"ok" });

      if (debug) return j({ ok:true, via:"graph", steps });
      return streamPdf(pdfRes.body, dispName);

    } catch (e) {
      steps.push({ step:"graph", status:"failed", detail:{
        name: e?.name, message: e?.message, status: e?.responseStatus, body: e?.body
      }});
      // fall through to REST attempt
    }

    // -------- 2) SharePoint REST fallback --------
    // We’ll request a SPO resource token and download using _api
    steps.push({ step:"spo_token", status:"start" });
    const spoResource = `https://${hostname}/.default`;
    const spoToken = await getToken(tenant, clientId, clientSecret, spoResource);
    steps.push({ step:"spo_token", status:"ok" });

    // Build server‑relative path: /sites/<sitePath>/<libraryName>/<fileRaw>
    // Encode each segment except the slashes between site/library/path.
    const serverRel = `/sites/${sitePath}/${libraryName}/${fileRaw}`.replace(/\/+/g, "/");
    const encServerRel = encodeURIComponent(serverRel);

    // Modern endpoint (works with spaces/unicode):
    //   _api/web/GetFileByServerRelativePath(DecodedUrl=@u)/$value?@u='<serverRelativeUrl>'
    steps.push({ step:"spo_file", status:"start", serverRel });
    const fileUrl = `${siteUrl}/_api/web/GetFileByServerRelativePath(DecodedUrl=@u)/$value?@u='${encServerRel}'`;

    const spRes = await fetch(fileUrl, { headers:{ authorization:`Bearer ${spoToken}` } });
    if (!spRes.ok) {
      const errBody = await spRes.text().catch(()=> "");
      steps.push({ step:"spo_file", status:"error", statusCode: spRes.status, body: errBody });
      return debug ? j({ ok:false, via:"sharepoint_rest", steps }, spRes.status)
                   : j({ ok:false, error:"File fetch failed (SharePoint REST)", steps }, 500);
    }
    steps.push({ step:"spo_file", status:"ok" });

    if (debug) return j({ ok:true, via:"sharepoint_rest", steps });
    return streamPdf(spRes.body, dispName);

  } catch (e) {
    steps.push({ step:"exception", error:String(e) });
    return debug ? j({ ok:false, steps }, 500)
                 : j({ ok:false, error:"Unhandled error", steps }, 500);
  }
}

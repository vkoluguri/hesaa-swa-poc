// serve-local.js
// Minimal local server: serves static files and /api/pdf from SharePoint via Graph
// Node 18+ required (global fetch). Run: node serve-local.js

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- config from env ----------
const {
  SP_TENANT_ID,
  SP_CLIENT_ID,
  SP_CLIENT_SECRET,
  SP_SITE_URL,
  SP_LIBRARY_NAME = "Shared Documents",
  PORT = 5000,
} = process.env;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = __dirname; // serve your repo as the web root

// ---------- helpers ----------
function log(...a){ console.log(new Date().toISOString(), ...a); }

function mimeType(p){
  const ext = (p.split(".").pop() || "").toLowerCase();
  const map = {
    "html":"text/html; charset=utf-8",
    "htm":"text/html; charset=utf-8",
    "css":"text/css; charset=utf-8",
    "js":"application/javascript; charset=utf-8",
    "json":"application/json; charset=utf-8",
    "png":"image/png",
    "jpg":"image/jpeg",
    "jpeg":"image/jpeg",
    "gif":"image/gif",
    "svg":"image/svg+xml",
    "ico":"image/x-icon",
    "pdf":"application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

function send(res, status, body, headers = {}){
  const h = { "Cache-Control":"no-store", ...headers };
  res.writeHead(status, h);
  if (body instanceof Uint8Array || typeof body === "string") {
    res.end(body);
  } else {
    res.end(JSON.stringify(body));
  }
}

function json(res, status, obj){ send(res, status, JSON.stringify(obj), { "Content-Type":"application/json" }); }

function guardPdfPath(fileRaw){
  // allow subfolders and spaces, must end with .pdf, no path traversal
  return /^[\w\-./ %]+\.pdf$/i.test(fileRaw) && !fileRaw.includes("..");
}

// ---------- Graph calls ----------
async function getAppOnlyToken(){
  const tenant = SP_TENANT_ID;
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: SP_CLIENT_ID,
    client_secret: SP_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });
  const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" }, body });
  const j = await r.json().catch(()=> ({}));
  if (!r.ok) throw new Error(j.error_description || j.error || `token HTTP ${r.status}`);
  return j.access_token;
}

async function resolveSiteId(token){
  // Use sites:getByPath to avoid manual hostname parsing
  const host = new URL(SP_SITE_URL).hostname;           // e.g. vkolugurihesaa.sharepoint.com
  const pathPart = new URL(SP_SITE_URL).pathname;       // e.g. /sites/HESAAWebRequestsPoC
  const url = `https://graph.microsoft.com/v1.0/sites/${host}:/sites${pathPart.replace(/^\/sites/,'')}`;
  const r = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  const j = await r.json().catch(()=> ({}));
  if (!r.ok || !j?.id) throw new Error(j?.error?.message || `site HTTP ${r.status}`);
  return j.id;
}

async function resolveDriveId(token, siteId){
  const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`;
  const r = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  const j = await r.json().catch(()=> ({}));
  if (!r.ok) throw new Error(j?.error?.message || `drives HTTP ${r.status}`);
  const list = Array.isArray(j.value) ? j.value : [];
  // prefer the named doc library; fallback to first documentLibrary
  const byName = list.find(d => d.name === SP_LIBRARY_NAME);
  const byType = list.find(d => d.driveType === "documentLibrary");
  const drive = byName || byType || list[0];
  if (!drive?.id) throw new Error("no document library (drives list empty)");
  return { id: drive.id, name: drive.name };
}

async function streamPdf(res, token, driveId, fileRaw, debug){
  // encode each segment so spaces & special chars work
  const safePath = fileRaw.split("/").map(encodeURIComponent).join("/");
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${safePath}:/content`;
  const r = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  if (!r.ok){
    const t = await r.text();
    if (debug) return json(res, r.status, { ok:false, where:"file", status:r.status, body:t });
    return json(res, r.status, { ok:false, error:t });
  }
  // stream to client
  res.writeHead(200, {
    "Content-Type":"application/pdf",
    "Content-Disposition": `inline; filename="${decodeURIComponent(fileRaw.split("/").pop())}"`,
    "Cache-Control":"no-store"
  });
  r.body.pipe(res);
}

// ---------- request router ----------
const server = http.createServer(async (req, res) => {
  try{
    const u = new URL(req.url, `http://${req.headers.host}`);
    // API: /api/pdf?file=Some Folder/StateHolidays.pdf[&debug=1]
    if (u.pathname === "/api/pdf"){
      const debug = u.searchParams.has("debug");
      const fileRaw = (u.searchParams.get("file") || u.searchParams.get("doc") || "").trim();
      if (!fileRaw) return json(res, 400, { ok:false, error:"file query required" });
      if (!guardPdfPath(fileRaw)) return json(res, 400, { ok:false, error:"invalid file" });

      // sanity on required env
      const missing = ["SP_TENANT_ID","SP_CLIENT_ID","SP_CLIENT_SECRET","SP_SITE_URL"]
        .filter(k => !process.env[k]);
      if (missing.length) return json(res, 500, { ok:false, error:`missing env: ${missing.join(", ")}` });

      if (debug) log("PDF DEBUG start", { fileRaw, SP_SITE_URL, SP_LIBRARY_NAME });

      const token = await getAppOnlyToken();
      if (debug) log("token ok");

      const siteId = await resolveSiteId(token);
      if (debug) log("site ok", siteId);

      const { id: driveId, name: driveName } = await resolveDriveId(token, siteId);
      if (debug) log("drive ok", { driveId, driveName });

      return streamPdf(res, token, driveId, fileRaw, debug);
    }

    // Static file server (so your /partials/pdf.html works)
    const reqPath = decodeURIComponent(u.pathname);
    let filePath = path.join(webRoot, reqPath);
    // directory → index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()){
      filePath = path.join(filePath, "index.html");
    }
    // security: keep inside webRoot
    if (!filePath.startsWith(webRoot)) return send(res, 403, "Forbidden");

    fs.readFile(filePath, (err, data) => {
      if (err){
        // fall back to 404
        return send(res, 404, "Not Found");
      }
      send(res, 200, data, { "Content-Type": mimeType(filePath) });
    });
  }catch(e){
    log("SERVER ERROR", e);
    json(res, 500, { ok:false, error:String(e) });
  }
});

// ---------- start ----------
server.listen(PORT, () => {
  log(`Local server running on http://localhost:${PORT}`);
  log(`Try: http://localhost:${PORT}/partials/pdf.html?file=StateHolidays.pdf`);
  log(`Or:  http://localhost:${PORT}/api/pdf?file=StateHolidays.pdf&debug=1`);
});

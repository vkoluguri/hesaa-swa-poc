// Builds assets/content-index.json by scanning HTML files and pulling:
//  - <title>, first <h1> (fallback), <meta name="description">, <meta name="tags">
// Produces extensionless paths to use in search suggestions.

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "assets");
const OUT = path.join(OUT_DIR, "content-index.json");
const EXCLUDE = new Set(["api", "assets", "partials", "node_modules", ".github", "tools"]);

function norm(p) { return p.replace(/\\/g, "/"); }

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel  = norm(path.relative(ROOT, full));
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const top = rel.split("/")[0];
      if (!EXCLUDE.has(top)) walk(full, files);
    } else if (name.toLowerCase().endsWith(".html")) {
      if (rel.startsWith("partials/")) continue;
      files.push(full);
    }
  }
  return files;
}

function cleanPath(relHtml) {
  relHtml = norm(relHtml);
  relHtml = relHtml.replace(/^\/?/, ""); // remove leading slash if any
  if (/^index\.html$/i.test(relHtml)) return "/";
  if (/\/index\.html$/i.test(relHtml)) return "/" + relHtml.replace(/\/index\.html$/i, "");
  return "/" + relHtml.replace(/\.html$/i, "");
}

function compact(s) { return (s || "").replace(/\s+/g, " ").trim(); }

const htmlFiles = walk(ROOT);
const items = [];

for (const full of htmlFiles) {
  const rel = norm(path.relative(ROOT, full));
  const html = fs.readFileSync(full, "utf8");
  const $ = cheerio.load(html);

  const title = compact($("title").first().text()) || compact($("h1").first().text()) || rel;
  const desc  = compact($('meta[name="description"]').attr("content"));
  const tags  = compact($('meta[name="tags"]').attr("content"))
                 .split(",").map(s => compact(s)).filter(Boolean);

  items.push({
    title,
    path: cleanPath(rel),
    summary: desc,
    tags
  });
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
fs.writeFileSync(OUT, JSON.stringify(items, null, 2));
console.log(`✔ Wrote ${OUT} with ${items.length} pages`);

// Generates staticwebapp.config.json with:
//  - rewrite rules:  /foo -> /foo.html   and /dir -> /dir/index.html
//  - redirects:      /foo.html -> /foo   and /dir/index.html -> /dir
// Excludes: api, assets, partials, node_modules, .github, tools

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "staticwebapp.config.json");
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
      if (rel.startsWith("partials/")) continue; // never route partials
      files.push(rel);
    }
  }
  return files;
}

function toRoute(relHtml) {
  // relHtml like: "students.html" or "programs/njclass.html" or "programs/index.html"
  if (/^index\.html$/i.test(relHtml)) {
    return { route: "/", rewrite: "/index.html", redirectFrom: "/index.html" };
  }
  const noHtml = relHtml.replace(/\.html$/i, "");
  if (/\/index$/i.test(noHtml)) {
    // programs/index.html -> /programs
    const clean = "/" + noHtml.replace(/\/index$/i, "");
    return { route: clean, rewrite: "/" + relHtml, redirectFrom: "/" + relHtml };
  }
  // programs/njclass.html -> /programs/njclass
  return { route: "/" + noHtml, rewrite: "/" + relHtml, redirectFrom: "/" + relHtml };
}

function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter(o => (v => !seen.has(v) && seen.add(v))(o[key]));
}

const htmlFiles = walk(ROOT);
const entries = htmlFiles.map(toRoute);

// build routes: rewrites + redirects + keep /api/*
let routes = [];

// 1) rewrites for clean paths
for (const e of entries) {
  if (e.route !== "/") routes.push({ route: e.route, rewrite: e.rewrite });
}

// 2) redirects from .html to clean path (including /dir/index.html -> /dir)
for (const e of entries) {
  if (e.redirectFrom && e.route !== "/") {
    routes.push({ route: e.redirectFrom, redirect: e.route, statusCode: 301 });
  } else if (e.redirectFrom === "/index.html") {
    routes.push({ route: "/index.html", redirect: "/", statusCode: 301 });
  }
}

// 3) always keep api rule
routes.push({ route: "/api/*", allowedRoles: ["anonymous", "authenticated"] });

// de-dupe & nice order
routes = uniqueBy(routes, "route").sort((a, b) => a.route.localeCompare(b.route));

const config = {
  navigationFallback: {
    rewrite: "/index.html",
    exclude: ["/assets/*", "/api/*", "/partials/*", "/favicon.ico"]
  },
  routes,
  responseOverrides: { "404": { rewrite: "/index.html" } }
};

fs.writeFileSync(OUT, JSON.stringify(config, null, 2));
console.log(`✔ Wrote ${OUT} with ${routes.length} routes`);

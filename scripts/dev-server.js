#!/usr/bin/env node
/**
 * dev-server.js — zero-dependency static file server for local preview.
 *
 * AcuTing OS is a static site, but it must be served over http:// (not
 * opened as file://) because index.html loads data/generated/*.js. This
 * serves the repo root so the app runs exactly as deployed.
 *
 *   node scripts/dev-server.js [port]     # default port 8361
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2] || process.env.PORT || 8361);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(path.normalize(ROOT))) { res.writeHead(403); res.end("forbidden"); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",   // local dev: always serve fresh (avoid stale app.js during QA)
    });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`AcuTing OS dev server → http://127.0.0.1:${PORT}`);
});

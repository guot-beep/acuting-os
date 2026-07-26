#!/usr/bin/env node
/**
 * build-site.js — assemble the deployable site into dist/.
 *
 * Cloudflare was deploying the WHOLE repo (897 files, 137 MB): it failed on
 * data/imports/cloudtcm/formula_url_map.json (39 MB > Cloudflare's 25 MiB
 * per-asset limit), and it would have published curriculum/ — Ting's
 * copyrighted course PDFs, which must never leave the private repo.
 *
 * What ships is derived from index.html itself (every local src=/href=), so
 * this stays correct when the app gains or drops a data file. Everything else
 * — curriculum/, docs/, scripts/, data sources, imports, node_modules — stays
 * behind.
 *
 *   node scripts/build-site.js      # writes dist/
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");
const ENTRY = "index.html";

const html = fs.readFileSync(path.join(ROOT, ENTRY), "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(https?:)?\/\//.test(u) && !u.startsWith("#") && !u.startsWith("data:"));

const files = [...new Set([ENTRY, ...refs])];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let total = 0;
const missing = [];
for (const rel of files) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { missing.push(rel); continue; }
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  const mb = fs.statSync(src).size / (1024 * 1024);
  total += mb;
  if (mb > 25) console.warn(`  !! ${rel} is ${mb.toFixed(1)} MB — over Cloudflare's 25 MiB asset limit`);
  console.log(`  ${mb.toFixed(2).padStart(6)} MB  ${rel}`);
}

if (missing.length) {
  console.error(`\nFAIL — referenced by ${ENTRY} but missing:`);
  missing.forEach((m) => console.error("  " + m));
  process.exit(1);
}

console.log(`\ndist/ ready: ${files.length} files, ${total.toFixed(1)} MB total.`);
console.log("Cloudflare Pages settings — Build command: node scripts/build-site.js | Output directory: dist");

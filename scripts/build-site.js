#!/usr/bin/env node
/**
 * build-site.js — assemble the deployable site into dist/.
 *
 * Cloudflare was deploying the WHOLE repo (897 files, 137 MB): it failed on
 * data/imports/cloudtcm/formula_url_map.json (39 MB > Cloudflare's 25 MiB
 * per-asset limit), and it would have published curriculum/ — Ting's
 * copyrighted course PDFs, which must never leave the private repo.
 *
 * What ships is derived from index.html itself (every local src=/href=/poster=), so
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

// previsit.html is a self-contained page deliberately NOT referenced by
// index.html — the ref-scan alone would leave it out of dist/, and with
// wrangler's single-page-application fallback a patient opening the previsit
// link would silently get the ENTIRE clinical workstation instead of a 404.
// (UI/UX P1#1, 2026-08-23.)
const STANDALONE = ["previsit.html"];

// ref-scan 掃 ENTRY ＋每個 STANDALONE 頁自身（2026-08-24）：previsit 引用的
// knowledge_core.js 先前會進 dist 純粹因為 index.html 也剛好引用同一顆——
// 哪天 previsit 改引別片，dist 就少檔，而 wrangler 的 SPA fallback 會把 404
// 變成 200 + index.html 的 HTML，<script> 拿到 HTML 是 SyntaxError，previsit
// 靜默退回 FALLBACK_PROMPTS，沒有任何錯誤。掃每一頁自己的引用，缺檔就不可能。
const scanRefs = (page) =>
  [...fs.readFileSync(path.join(ROOT, page), "utf8").matchAll(/(?:src|href|poster)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !/^(https?:)?\/\//.test(u) && !u.startsWith("#") && !u.startsWith("data:") && !u.startsWith("javascript:") && !u.startsWith("mailto:"));
const refs = [ENTRY, ...STANDALONE].flatMap(scanRefs);
const files = [...new Set([ENTRY, ...STANDALONE, ...refs])];

/* The "curriculum/ stays behind" promise in the header was never enforced — it
 * held only because index.html happened never to reference that directory. The
 * first time one did (a homepage video committed to curriculum/Home/Home.mp4),
 * this script would have copied it into dist/ and published Ting's private
 * course directory to the open internet, silently, with a green build.
 *
 * Deployment is outward-facing and hard to take back: once a file is served it
 * can be cached and indexed even after removal. So the quarantine is a check,
 * not a comment. Site assets belong in assets/.
 */
const QUARANTINED = ["curriculum/", "data/imports/", "docs/", "clinical/", "cases/"];
const leaked = files.filter((rel) => QUARANTINED.some((dir) => rel.startsWith(dir)));
if (leaked.length) {
  console.error(`FAIL — ${ENTRY} references ${leaked.length} file(s) inside a directory that must never ship:`);
  leaked.forEach((rel) => console.error(`  ${rel}`));
  console.error("\nThese would have been published. Move the asset into assets/ and update the reference.");
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/* Cloudflare 的單檔上限是 25 MiB。超過的話部署會在 Cloudflare 那端失敗
 * (`[ERROR] Asset too large`)—— 而 CI 這邊是綠的,因為原本只 console.warn。
 * 也就是說:唯一會發現的方式是 Ting 打開手機發現網站沒更新。
 * 2026-08-31 改成硬紅,並加一條 20 MiB 的接近警告 —— generated 檔會隨著
 * 卡片填充長大(現在最大 knowledge_dx.js 6.65 MB),不希望它某天從綠直接
 * 跳成部署失敗。 */
const HARD_MIB = 25;
const WARN_MIB = 20;

let total = 0;
const missing = [];
const oversize = [];
const nearLimit = [];
for (const rel of files) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { missing.push(rel); continue; }
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  const mb = fs.statSync(src).size / (1024 * 1024);
  total += mb;
  if (mb >= HARD_MIB) oversize.push([rel, mb]);
  else if (mb >= WARN_MIB) nearLimit.push([rel, mb]);
  console.log(`  ${mb.toFixed(2).padStart(6)} MB  ${rel}`);
}

if (missing.length) {
  console.error(`\nFAIL — referenced by ${ENTRY} but missing:`);
  missing.forEach((m) => console.error("  " + m));
  process.exit(1);
}

for (const [rel, mb] of nearLimit) {
  console.warn(`\n  !! ${rel} is ${mb.toFixed(1)} MB — Cloudflare 單檔上限 ${HARD_MIB} MiB,剩不到 ${(HARD_MIB - mb).toFixed(1)} MB 餘裕。`);
}
if (oversize.length) {
  console.error(`\nFAIL — ${oversize.length} 個檔案超過 Cloudflare 單檔上限 ${HARD_MIB} MiB,這樣部署一定失敗:`);
  for (const [rel, mb] of oversize) console.error(`  ${mb.toFixed(1)} MB  ${rel}`);
  console.error("\n這件事必須在 CI 擋下來 —— 不然唯一會發現的人是打開手機發現網站沒更新的 Ting。");
  console.error("處理方向:把該檔切片(參考 knowledge 六片的做法),或讓 index.html 不要引用它。");
  process.exit(1);
}

console.log(`\ndist/ ready: ${files.length} files, ${total.toFixed(1)} MB total.`);
console.log("Cloudflare Pages settings — Build command: node scripts/build-site.js | Output directory: dist");

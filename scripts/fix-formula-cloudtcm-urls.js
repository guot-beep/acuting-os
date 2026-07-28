#!/usr/bin/env node
/**
 * fix-formula-cloudtcm-urls.js — replace fabricated CloudTCM formula links.
 *
 * Ting: 「麻黃湯的 link 是錯的 應該是這個 https://cloudtcm.com/formula/1」
 *
 * She is right, and it is not one formula. ALL 115 cloudtcm_url values were
 * built by pasting this repo's own record id into CloudTCM's path:
 *
 *   麻黃湯 → https://cloudtcm.com/formula/formula.ma_huang_tang   ← 404
 *
 * CloudTCM identifies a formula by a NUMBER. `formula.ma_huang_tang` is our
 * id, not theirs, so every one of those links is dead. This is exactly the
 * failure mode the herb pass was careful to avoid — a URL you can construct is
 * not a URL that exists — and it slipped through here because the field was
 * already populated and looked plausible.
 *
 * The real mapping was in the repo the whole time:
 * data/imports/cloudtcm/formula_url_map.json, keyed by 中文方名, each entry
 * carrying cloudtcm_id and page_url captured at import. 麻黃湯 → /formula/1,
 * which is the link Ting quoted.
 *
 * Matching is on name_zh only. A formula whose name is not in the map gets its
 * fabricated URL REMOVED rather than replaced with a guess — no link is
 * honest, a dead link is not.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const MAP = path.join(ROOT, "data/imports/cloudtcm/formula_url_map.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const map = JSON.parse(fs.readFileSync(MAP, "utf8"));

const FABRICATED = /\/formula\/formula\./;
const isReal = (u) => /^https:\/\/cloudtcm\.com\/formula\/\d+$/.test(String(u || ""));

let fixed = 0, removed = 0, already = 0;
const noMatch = [];

for (const r of recs) {
  const hit = map[String(r.name_zh || "").trim()];
  const had = r.cloudtcm_url;

  if (hit && hit.page_url && isReal(hit.page_url)) {
    if (r.cloudtcm_url !== hit.page_url) {
      r.cloudtcm_url = hit.page_url;
      r.cloudtcm_id = hit.cloudtcm_id;
      r.field_sources = r.field_sources || {};
      r.field_sources.cloudtcm_url = ["data/imports/cloudtcm/formula_url_map.json（匯入時擷取的真實頁面編號）"];
      fixed++;
    } else already++;
    continue;
  }

  // No entry in the map. A fabricated link must go; nothing replaces it.
  if (had && FABRICATED.test(had)) {
    delete r.cloudtcm_url;
    if (r.field_sources) delete r.field_sources.cloudtcm_url;
    removed++;
    noMatch.push(r.name_zh || r.pinyin || r.id);
  }
}

// Nothing may survive that still looks like our own id.
const leftover = recs.filter((r) => r.cloudtcm_url && FABRICATED.test(r.cloudtcm_url));
const badShape = recs.filter((r) => r.cloudtcm_url && !isReal(r.cloudtcm_url));

console.log("CloudTCM 方劑連結修正");
console.log(`  換成真實編號   ${fixed}`);
console.log(`  本來就正確     ${already}`);
console.log(`  刪掉假連結     ${removed}（對照表裡沒有這個方，寧可沒有連結也不要死連結）`);
console.log(`  現在有連結的   ${recs.filter((r) => r.cloudtcm_url).length}/${recs.length}`);
if (noMatch.length) console.log(`\n  沒有對照的方：${noMatch.slice(0, 20).join("、")}${noMatch.length > 20 ? ` …(${noMatch.length})` : ""}`);

if (leftover.length || badShape.length) {
  console.error(`\n❌ 還有 ${leftover.length + badShape.length} 個網址格式不對 —— 不寫入`);
  [...leftover, ...badShape].slice(0, 6).forEach((r) => console.error(`  ${r.name_zh}: ${r.cloudtcm_url}`));
  process.exit(1);
}
console.log("\n✅ 每一個留下的連結都是 cloudtcm.com/formula/<數字>，來自匯入時的對照表");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");

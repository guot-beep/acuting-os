#!/usr/bin/env node
/**
 * restore-point-tags.js — put the short searchable tags back, bilingual.
 *
 * The channel rewrite set action_tags/disease_tags equal to functions/
 * indications. That looked tidy and was wrong: tags feed unifiedSearch and the
 * filter chips, so they have to stay short. LU1's disease tag became
 * 「肺募穴 —— 主一切肺病，尤其實證：咳嗽、喘鳴、哮喘」, which is unusable as a
 * chip and worse as a search term than the 「咳嗽」 it replaced.
 *
 * Four layers, each doing one job:
 *   functions_en / indications_en   the course notes, in Ting's own English
 *   functions_zh / indications_zh   the structured 中文 version
 *   action_tags_* / disease_tags_*  short tags for search and chips
 *   point_identity_*                五輸/原絡郄募 — identity, not an action
 *
 * The short 中文 tags Antigravity migrated were good, so they are restored from
 * the pre-rewrite file rather than reinvented; the English comes from
 * data/config/acupoint_tag_glossary.json so one term never gets two
 * translations across channels. Identity words are dropped from action_tags —
 * 「募穴」 is not something the point does.
 *
 * Usage:
 *   node scripts/restore-point-tags.js --baseline <json> [--channel LU] [--apply]
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const GLOSSARY = path.join(ROOT, "data/config/acupoint_tag_glossary.json");
const APPLY = process.argv.includes("--apply");
const argOf = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : null;
};
const BASELINE = argOf("--baseline");
const CHANNEL = argOf("--channel");

if (!BASELINE) {
  console.error("--baseline <json> required (the pre-rewrite 361.json, e.g. `git show 41bef06:data/acupoints/361.json`)");
  process.exit(1);
}

const gloss = JSON.parse(fs.readFileSync(GLOSSARY, "utf8"));
const IDENTITY = new Set(gloss.identity_not_action);
const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const baseRaw = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const base = new Map((Array.isArray(baseRaw) ? baseRaw : (baseRaw.records || baseRaw.points)).map((r) => [r.code, r]));

const missing = { action: new Set(), disease: new Set() };
let touched = 0;

for (const r of recs) {
  if (CHANNEL && !new RegExp(`^${CHANNEL}\\d+$`).test(r.code)) continue;
  // Only points the rewrite touched: those are the ones whose tags were
  // overwritten. Untouched points still have their original short tags.
  if (!(r.field_sources && r.field_sources.functions_zh)) continue;
  const b = base.get(r.code);
  if (!b) continue;

  for (const [kind, zhKey, enKey] of [["action", "action_tags_zh", "action_tags_en"], ["disease", "disease_tags_zh", "disease_tags_en"]]) {
    const tags = (b[zhKey] || []).filter((t) => !(kind === "action" && IDENTITY.has(t)));
    if (!tags.length) continue;
    const en = tags.map((t) => {
      const hit = gloss[kind][t];
      if (!hit) missing[kind].add(t);
      return hit || null;
    });
    r[zhKey] = tags;
    // Never ship a half-translated array: a null anywhere would misalign every
    // tag after it, which is the exact defect A4 exists to catch.
    r[enKey] = en.every(Boolean) ? en : [];
    r.field_sources = r.field_sources || {};
    r.field_sources[zhKey] = ["data/acupoints/361.json (Antigravity 遷移，短標籤保留)"];
    if (r[enKey].length) r.field_sources[enKey] = ["data/config/acupoint_tag_glossary.json"];
  }
  touched++;
}

console.log(`restored short tags on ${touched} point(s)${CHANNEL ? ` in ${CHANNEL}` : ""}`);
for (const kind of ["action", "disease"]) {
  if (missing[kind].size) {
    console.log(`\n⚠️ glossary 缺 ${kind} 標籤 ${missing[kind].size} 個（該欄英文留空，不半翻）:`);
    console.log("   " + [...missing[kind]].join(" | "));
  }
}
if (missing.action.size || missing.disease.size) {
  console.log("\n補進 data/config/acupoint_tag_glossary.json 後再跑一次。");
}

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("written.");

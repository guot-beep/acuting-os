#!/usr/bin/env node
/**
 * fill-tag-english.js — fill empty English tag slots from the glossary.
 *
 * clean-placeholder-tags.js only rewrote entries shaped like 「活血 (TCM Action)」.
 * Where it could not find a term it left the slot EMPTY on purpose — correct at
 * the time, because a half-translation is worse than none. Those empties are
 * now fillable: the glossary has grown to cover every 中文 tag in the file.
 *
 * The point of the English layer is that board study and search work in
 * English; a blank slot means the chip is 中文-only and the English search
 * misses it entirely.
 *
 * Rules kept from the earlier pass:
 *   - glossary only, never invented here
 *   - the term's own glossary first, then the other (a few terms are filed on
 *     both sides)
 *   - the array length never changes, so A4 alignment holds
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const APPLY = process.argv.includes("--apply");
const g = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/acupoint_tag_glossary.json"), "utf8"));

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);

let filled = 0, stillEmpty = 0;
const missing = new Map();

for (const r of recs) {
  for (const [kind, zk, ek] of [["action", "action_tags_zh", "action_tags_en"], ["disease", "disease_tags_zh", "disease_tags_en"]]) {
    const zh = r[zk];
    if (!Array.isArray(zh) || !zh.length) continue;
    const en = Array.isArray(r[ek]) ? r[ek].slice() : [];
    while (en.length < zh.length) en.push("");
    for (let i = 0; i < zh.length; i++) {
      if (String(en[i] || "").trim()) continue;
      const term = String(zh[i] || "").trim();
      const hit = g[kind][term] || g[kind === "action" ? "disease" : "action"][term];
      if (hit) { en[i] = hit; filled++; }
      else { stillEmpty++; missing.set(term, (missing.get(term) || 0) + 1); }
    }
    r[ek] = en.slice(0, zh.length);
  }
}

// A4 sweep before writing.
const bad = [];
for (const r of recs) {
  for (const [zk, ek] of [["action_tags_zh", "action_tags_en"], ["disease_tags_zh", "disease_tags_en"]]) {
    const z = r[zk], e = r[ek];
    if (Array.isArray(z) && Array.isArray(e) && e.length && z.length !== e.length) bad.push(`${r.code} ${zk}`);
  }
}

console.log(`補上英文標籤 ${filled} 格；仍空白 ${stillEmpty}`);
if (missing.size) {
  console.log(`glossary 仍缺 ${missing.size} 個詞（留空不半翻）:`);
  console.log("  " + [...missing].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `${k}(${v})`).join(" "));
}
if (bad.length) { console.error(`\n❌ A4 長度不符 ${bad.length} 處 —— 不寫入`); process.exit(1); }
console.log("✅ 中英標籤長度全部對齊");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");

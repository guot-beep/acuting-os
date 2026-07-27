#!/usr/bin/env node
/**
 * clean-placeholder-tags.js — replace "X (TCM Action)" English tags with real
 * English, or with nothing.
 *
 * The English tag arrays carry 1786 entries of the form 「活血 (TCM Action)」 and
 * 「坐骨神經痛類辨證 (Indication)」 — the 中文 term with a category word in
 * parentheses, which is not a translation. They were invisible while the card
 * showed one language at a time; making the chips bilingual put them on screen.
 *
 * The rule is the one already in the template: look the term up in the
 * glossary, and if it is not there leave that entry EMPTY rather than shipping
 * a fake translation. Empty keeps the array length, so A4 alignment holds and
 * the chip simply renders 中文-only.
 *
 * Usage: node scripts/clean-placeholder-tags.js [--apply]
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const APPLY = process.argv.includes("--apply");
const g = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/acupoint_tag_glossary.json"), "utf8"));
const PLACEHOLDER = /\s*\((?:TCM Action|Indication|TCM)\)\s*$/;

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
let filled = 0, blanked = 0;
const stillMissing = new Map();

for (const r of recs) {
  for (const [kind, zk, ek] of [["action", "action_tags_zh", "action_tags_en"], ["disease", "disease_tags_zh", "disease_tags_en"]]) {
    const en = r[ek];
    if (!Array.isArray(en) || !en.length) continue;
    r[ek] = en.map((t, i) => {
      const s = String(t || "");
      if (!PLACEHOLDER.test(s)) return s;
      const term = s.replace(PLACEHOLDER, "").trim();
      // Try the term's own glossary first, then the other one: a few entries are
      // filed under the opposite kind and a real translation beats an empty.
      const hit = g[kind][term] || g[kind === "action" ? "disease" : "action"][term];
      if (hit) { filled++; return hit; }
      blanked++;
      stillMissing.set(term, (stillMissing.get(term) || 0) + 1);
      return "";
    });
  }
}

console.log(`佔位英文標籤處理：填入真英文 ${filled}，留空 ${blanked}`);
console.log(`glossary 仍缺 ${stillMissing.size} 個詞（留空不半翻）`);
const top = [...stillMissing.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log("最常出現的待補詞:", top.map(([t, n]) => `${t}(${n})`).join(" "));

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten.");

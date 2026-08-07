#!/usr/bin/env node
/**
 * move-chinese-out-of-en.js — 把坐在 _en 欄位裡的中文搬回 _zh。
 *
 * 101 條中文字串躺在 actions_en / pattern_indications_en 這些英文欄位裡。在
 * Public EN 模式下它們就是英文標籤底下的中文，而且多數帶著抓取殘留的
 * 「Action: 」「Indication: 」前綴。
 *
 * 它們大部分是**真內容放錯地方**，不是垃圾 —— 定喘湯的 actions_en 裡是整段
 * 君臣佐使分析（「麻黃：發汗解表，宣肺平喘，為君藥」）。所以照憲法紅線 3：
 * **先搬到對的欄位，再從原欄位移除**，順序不能反。
 *
 *   同一句 _zh 已經有 → 只從 _en 移除（重複）
 *   _zh 沒有         → 追加到 _zh，再從 _en 移除
 *   「Action: 」前綴  → 搬移時去掉，那是欄位標籤外洩，不是內容
 *
 *   node scripts/move-chinese-out-of-en.js            # dry run
 *   node scripts/move-chinese-out-of-en.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const FILE = "data/herbs/formulas.json";

const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc.formulas;

/* Predominantly Chinese, not "contains a Chinese character". An English
   sentence that cites a Chinese source — 四物湯's 「…but the ratio varies;
   銳齋醫學講稿 says…」 — belongs in _en and must not be dragged into _zh. */
const cjk = (s) => {
  const zh = (String(s).match(/[一-鿿]/g) || []).length;
  const en = (String(s).match(/[A-Za-z]/g) || []).length;
  return zh > 0 && zh * 2 > en;
};
const strip = (s) => String(s).replace(/^\s*(Action|Indication|Actions|Indications)\s*[:：]\s*/i, "").trim();

let moved = 0, dropped = 0, skippedName = 0;
const samples = [];

for (const r of recs) {
  for (const enField of Object.keys(r)) {
    if (!/_en$/.test(enField) || !r[enField]) continue;
    const zhField = enField.replace(/_en$/, "_zh");
    const isArr = Array.isArray(r[enField]);
    const items = isArr ? r[enField] : [r[enField]];
    const keep = [];
    for (const item of items) {
      if (typeof item !== "string" || !cjk(item)) { keep.push(item); continue; }
      /* name_en is a single scalar identity field — a Chinese value there is a
         data-entry error to report, not something to move into name_zh, which
         already holds the real name. */
      if (enField === "name_en") { keep.push(item); skippedName++; continue; }
      const text = strip(item);
      if (!text) { dropped++; continue; }
      const zh = Array.isArray(r[zhField]) ? r[zhField] : (r[zhField] ? [r[zhField]] : []);
      if (zh.some((z) => String(z).trim() === text)) { dropped++; continue; }   // already there
      if (APPLY) { zh.push(text); r[zhField] = zh; }
      moved++;
      if (samples.length < 8) samples.push(`${r.name_zh} ${enField} → ${zhField}: ${text.slice(0, 54)}`);
    }
    if (APPLY) r[enField] = isArr ? keep : (keep[0] ?? "");
  }
}

console.log(`搬到 _zh: ${moved} · 重複或只剩標籤而移除: ${dropped}`);
samples.forEach((s) => console.log("   " + s));
if (skippedName) console.log(`\nname_en 有中文但不搬（身分欄位，回報給 Ting）: ${skippedName} 筆`);

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else console.log("\nDry run. Use --apply to write.");

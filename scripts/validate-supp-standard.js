/* supp.* 骨架卡驗證器 — docs/SUPP_CARD_TEMPLATE.md 的機器面(D14:
 * 詞彙 → 模板 → 驗證器 → 記錄;本驗證器在 0 records 時誠實回報並 exit 0,
 * 跟 validate-symptom-standard 同姿勢——尺先掛牆上)。 */
"use strict";
const fs = require("fs");

const FILE = "data/supplements/supplements.json";
const VOCAB = "data/config/supplement_category_vocabulary.json";

let failures = 0, warnings = 0;
const fail = (m) => { failures++; console.log(`  FAIL ${m}`); };
const warn = (m) => { warnings++; console.log(`  warn ${m}`); };

const categories = new Set((JSON.parse(fs.readFileSync(VOCAB, "utf8")).categories || []).map((c) => c.id));
if (!categories.size) { console.log("FAIL — supplement category vocabulary empty"); process.exit(1); }

if (!fs.existsSync(FILE)) {
  console.log(`validate-supp-standard: namespace built, no records yet (${FILE} absent) — template/vocab/validator ready. PASS`);
  process.exit(0);
}

const doc = JSON.parse(fs.readFileSync(FILE, "utf8"));
const records = doc.records || [];
const seen = new Set();
const CJK = /[一-鿿]/;

for (const r of records) {
  const id = String(r.id || "");
  if (!/^supp\.[a-z0-9_]+$/.test(id)) fail(`${id || "(no id)"}: id must match supp.<ascii_snake> (D17 spelling: supp, not suppl)`);
  if (seen.has(id)) fail(`${id}: duplicate id`);
  seen.add(id);
  if (!r.name_zh || !CJK.test(r.name_zh)) fail(`${id}: name_zh missing or contains no CJK`);
  if (!r.name_en) fail(`${id}: name_en missing`);
  if (!categories.has(r.category)) fail(`${id}: category "${r.category}" not in vocabulary`);
  if (!["skeleton", "core", "clinical_ready"].includes(r.maturity)) fail(`${id}: maturity "${r.maturity}" invalid`);
  // 每個帶主張的欄位要有來源;空欄位合法(誠實留空),有值無源不合法。
  if (r.typical_dose_range_en && !(r.dose_source && r.dose_source.url)) fail(`${id}: dose range present but dose_source.url missing`);
  for (const [i, n] of (r.key_safety_notes || []).entries()) {
    if (!(n.source && n.source.url)) fail(`${id}: key_safety_notes[${i}] has no source.url`);
    if (!n.note_en) fail(`${id}: key_safety_notes[${i}] empty note_en`);
  }
  if (r.evidence_snapshot_en && !(r.evidence_source && r.evidence_source.url)) fail(`${id}: evidence snapshot present but evidence_source.url missing`);
  // 樣板句偵測(粗篩):同一句 evidence 在 ≥3 筆出現即警告。
}
const evCounts = new Map();
for (const r of records) if (r.evidence_snapshot_en) evCounts.set(r.evidence_snapshot_en, (evCounts.get(r.evidence_snapshot_en) || 0) + 1);
for (const [txt, n] of evCounts) if (n >= 3) warn(`template-sentence suspect: "${txt.slice(0, 60)}…" appears ${n}×`);

console.log(`checked ${records.length} supp records · categories ${categories.size}`);
console.log(failures ? `FAIL — ${failures} defect(s), ${warnings} warning(s)` : `PASS — 0 defects, ${warnings} warning(s)`);
process.exit(failures ? 1 : 0);

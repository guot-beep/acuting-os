/* Evidence Debt 計分(SOL 方向 C,OPTIMIZATION_PLAN_2026-08;接在 P3-lite 之後)
 *
 * 北極星迴圈的 Research Queue 供給端:對「臨床上實際用到的知識實體」計算
 * evidence debt = 使用頻率 × 安全性權重 × 卡片缺漏度,排序輸出 —— 取代
 * 單純「哪張卡缺內容」的靜態清單。分數是排序用的相對值,不是臨床判斷。
 *
 * 用法:
 *   node scripts/evidence-debt.js <cases-export.json> [--top 15] [--out queue.md]
 *
 * 去識別化:輸出只含 knowledge ids 與計數,絕無 patientCode/自由文字。
 */
"use strict";
const fs = require("fs");

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.log("usage: node scripts/evidence-debt.js <cases.json> [--top N] [--out queue.md]"); process.exit(2); }
const topN = args.includes("--top") ? Number(args[args.indexOf("--top") + 1]) : 15;
const oIdx = args.indexOf("--out");

let parsed = JSON.parse(fs.readFileSync(file, "utf8"));
if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cases)) parsed = parsed.cases;
const cases = parsed;

// ---- bundle ----
const g = {};
(new Function("globalThis", fs.readFileSync("data/generated/knowledge_data.js", "utf8") + ";"))(g);
const K = g.ACUTING_KNOWLEDGE || {};
const recsOf = (k) => (K[k] && K[k].records) || (Array.isArray(K[k]) ? K[k] : []);

// 每個 namespace:去哪個 section 找卡、哪些欄位算「關鍵證據欄」。
// 欄位空 = 缺一分。欄位名以現行資料實際 shape 為準;找不到卡 = 全缺(debt 最大)。
// 欄位名逐一對過 data/generated/knowledge_data.js 的實際 record shape
// (2026-08-11 校正,不是猜的)。每個 section 有自己的欄位表 —— pattern.* 的
// 卡在 patternLibrary(tcmPatternCanon 用 pat.中文 id,是另一群),兩者
// shape 不同,共用一張欄位表會把齊的卡誤判成 100% 缺。
const NAMESPACES = [
  { prefix: "pattern.", sections: [
      { name: "patternLibrary", fields: ["key_signs_zh", "treatment_principle_zh", "typical_points", "typical_formulas", "differential_patterns"] },
      { name: "patternRegistry", fields: [] },   // usage-derived skeleton:找得到但無內容欄 → 只計頻率
    ] },
  { prefix: "formula.", sections: [
      { name: "formulas", fields: ["composition", "actions_zh", "modifications_zh", "contraindications_zh", "herb_drug_cautions"], safetyField: "herb_drug_cautions" },
    ] },
  { prefix: "acupoint.", sections: [] },   // 361 穴位卡結構另計,先只計頻率
  { prefix: "supp.", sections: [
      { name: "supplementRecords", fields: ["evidence_snapshot_en", "key_safety_notes", "typical_dose_range_en", "common_forms_en"], safetyField: "key_safety_notes" },
    ] },
  { prefix: "drug.", sections: [
      { name: "pharmDrugs", fields: ["mechanism_zh", "indications_zh", "contraindications_zh", "adverse_effects_zh"], safetyField: "contraindications_zh" },
      { name: "medications", fields: [] },
    ] },
  { prefix: "cond.", sections: [
      { name: "conditionCanon", fields: ["summary_zh", "red_flags_zh", "etiology_zh", "western_pathology_zh", "related_patterns"] },
    ] },
  { prefix: "sym.", sections: [
      { name: "symptoms", fields: ["definition_zh", "red_flags_zh", "inquiry_zh", "differentiation_zh"] },
    ] },
];

const findCard = (id) => {
  const ns = NAMESPACES.find((n) => id.startsWith(n.prefix));
  if (!ns) return null;
  for (const sec of ns.sections) { const r = recsOf(sec.name).find((x) => x.id === id); if (r) return { ns, sec, r }; }
  return { ns, sec: ns.sections[0] || null, r: null };
};

// ---- usage + safety signal 收集 ----
const usage = new Map();          // id -> visits used
const aeAdjacent = new Map();     // id -> AE co-occurrence count
const bump = (m, id, n = 1) => { if (id) m.set(id, (m.get(id) || 0) + n); };

for (const c of cases) {
  for (const e of c.agentExposures || []) bump(usage, e.agentId);
  for (const w of c.westernConditions || []) if (String(w).startsWith("cond.")) bump(usage, w);
  for (const n of c.soapNotes || []) {
    for (const s of n.tcmPatternSelections || []) bump(usage, s.patternId);
    for (const id of n.formulaLinks || []) bump(usage, id);
    for (const id of n.acupointLinks || []) bump(usage, id);
    for (const id of n.medicationLinks || []) bump(usage, id);
    const hasAE = (n.adverseEvents || []).length > 0;
    if (hasAE) {
      for (const id of [...(n.formulaLinks || []), ...(n.medicationLinks || [])]) bump(aeAdjacent, id);
      for (const e of c.agentExposures || []) bump(aeAdjacent, e.agentId);
    }
  }
}

// ---- 計分 ----
const rows = [];
for (const [id, freq] of usage) {
  const hit = findCard(id);
  if (!hit) continue;                                   // 未納入計分的 namespace(如 life.*)
  const { sec, r } = hit;
  const fields = (sec && sec.fields) || [];
  let missing, missingDetail;
  if (!r) { missing = 1; missingDetail = "無卡"; }
  else if (!fields.length) { missing = 0; missingDetail = "(此線只計頻率)"; }
  else {
    const empty = fields.filter((f) => { const v = r[f]; return v == null || v === "" || (Array.isArray(v) && !v.length); });
    missing = empty.length / fields.length;
    missingDetail = empty.length ? "缺:" + empty.join(",") : "齊";
  }
  const aeN = aeAdjacent.get(id) || 0;
  const safetyGap = (sec && sec.safetyField && r && (!r[sec.safetyField] || (Array.isArray(r[sec.safetyField]) && !r[sec.safetyField].length))) ? 1 : 0;
  const safety = 1 + aeN + safetyGap;                    // AE 同現與 interaction 缺漏都抬高優先
  const score = freq * safety * (missing || (aeN ? 0.2 : 0)); // 卡齊但有 AE 同現仍該複查
  if (score > 0) rows.push({ id, freq, aeN, safetyGap, missing: Math.round(missing * 100), score: +score.toFixed(2), missingDetail });
}
rows.sort((a, b) => b.score - a.score);

const top = rows.slice(0, topN);
const lines = top.map((r, i) =>
  `| ${i + 1} | ${r.id} | ${r.freq} | ${r.aeN}${r.safetyGap ? " +interaction缺" : ""} | ${r.missing}% | ${r.score} | ${r.missingDetail} |`);
const report = `# Evidence Debt Research Queue(top ${topN} / ${rows.length} scored, ${usage.size} entities used)

score = 使用頻率 × (1 + AE同現 + interaction缺漏) × 卡片缺漏度。排序用相對值。

| # | entity | 用(visits) | AE同現 | 缺漏 | score | 明細 |
|---|---|---|---|---|---|---|
${lines.join("\n") || "|(無)|||||||"}
${rows.length === 0 && usage.size > 0 ? "\n所有臨床使用中的實體(" + usage.size + " 個)卡片關鍵欄位皆齊全且無 AE 同現 —— 目前無 evidence debt。" : ""}

_去識別化:僅 knowledge ids 與計數。產生器:scripts/evidence-debt.js_
`;
if (oIdx > -1 && args[oIdx + 1]) { fs.writeFileSync(args[oIdx + 1], report); console.log("written:", args[oIdx + 1]); }
else console.log(report);

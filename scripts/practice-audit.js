/* P3-lite 月度 Practice Audit(OPTIMIZATION_PLAN_2026-08 §P3-lite;SOL 共識版)
 *
 * 北極星迴圈的 feedback engine:臨床使用 → 結構化資料 → 本報告 → 知識缺口
 * → Research Queue。只算真正可靠的聚合數字;絕不輸出 patientCode/病名文字/
 * 任何臨床自由文字 —— 報告本身即可安全分享或存 repo 外。
 *
 * 用法:
 *   node scripts/practice-audit.js <cases-export.json> [--month YYYY-MM] [--out report.md]
 *   (不給 --month 則統計全部;輸入 = app export 或 raw snapshot 檔)
 */
"use strict";
const fs = require("fs");
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.log("usage: node scripts/practice-audit.js <cases.json> [--month YYYY-MM] [--out report.md]"); process.exit(2); }
const mIdx = args.indexOf("--month");
const month = mIdx > -1 ? args[mIdx + 1] : null;
const oIdx = args.indexOf("--out");

let parsed = JSON.parse(fs.readFileSync(file, "utf8"));
if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cases)) parsed = parsed.cases;   // v2 envelope
const cases = parsed;

const inMonth = (d) => !month || String(d || "").startsWith(month);
const notes = cases.flatMap((c) => (c.soapNotes || []).map((n) => ({ c, n }))).filter(({ n }) => inMonth(n.visitDate));

// ---- 核心計數 ----
const patients = new Set(cases.filter((c) => (c.soapNotes || []).some((n) => inMonth(n.visitDate))).map((c) => String(c.patientCode || "").trim()).filter(Boolean));
const activeCases = new Set(notes.map(({ c }) => c.id));
const verdicts = { improved: 0, no_change: 0, worsened: 0, lost_followup: 0, unrecorded: 0 };
for (const { n } of notes) verdicts[n.outcomeVerdict || "unrecorded"] = (verdicts[n.outcomeVerdict || "unrecorded"] || 0) + 1;

// outcome completion:visit 有至少一筆結構化 metric 的比率
const withMetrics = notes.filter(({ n }) => (n.outcomeMetrics || []).length).length;

// median 變化(pain / sleep hours):每個 case 期間首末差
function medianDelta(metricId) {
  const deltas = [];
  for (const c of cases) {
    const hist = S.getOutcomeHistory(c, metricId).filter((h) => inMonth(h.visitDate));
    if (hist.length >= 2) deltas.push(hist[hist.length - 1].valueNumber - hist[0].valueNumber);
  }
  if (!deltas.length) return { n: 0, median: null };
  deltas.sort((a, b) => a - b);
  const mid = Math.floor(deltas.length / 2);
  return { n: deltas.length, median: deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2 };
}
const painDelta = medianDelta("metric.pain_score");
const sleepDelta = medianDelta("metric.sleep_hours");

// AE:率 + by modality
const aes = notes.flatMap(({ n }) => n.adverseEvents || []);
const aeByModality = {};
for (const ae of aes) { const k = ae.modalityId || ae.interventionType || "unknown"; aeByModality[k] = (aeByModality[k] || 0) + 1; }

// 使用頻率(knowledge ids only — 安全)
const tally = (getter) => {
  const m = new Map();
  for (const { n } of notes) for (const id of getter(n) || []) m.set(id, (m.get(id) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
};
const topPatterns = tally((n) => (n.tcmPatternSelections || []).map((s) => s.patternId));
const topPoints = tally((n) => n.acupointLinks);
const topFormulas = tally((n) => n.formulaLinks);

// 知識缺口:高使用 × 無卡/低成熟(比對 bundle;bundle 缺時誠實跳過)
let gaps = [];
try {
  const K = JSON.parse(fs.readFileSync("data/generated/knowledge_data.js", "utf8").replace(/^[^=]*=\s*/, "").replace(/;\s*$/, ""));
  const known = new Set([
    ...(K.patternLibrary?.records || K.patterns?.records || []).map((r) => r.id),
    ...(K.formulas?.records || []).map((r) => r.id)
  ]);
  gaps = [...topPatterns, ...topFormulas].filter(([id]) => id && !known.has(id)).map(([id, n]) => `${id}(用 ${n} 次,無卡)`);
} catch { gaps = ["(bundle 不可讀 — 跳過缺口比對)"]; }

const fmt = (pairs) => pairs.length ? pairs.map(([k, v]) => `${k} ×${v}`).join(" · ") : "—";
const report = `# Practice Audit${month ? " — " + month : "(全部期間)"}

| 指標 | 值 |
|---|---|
| Patients seen | ${patients.size} |
| Cases active | ${activeCases.size} |
| Visits | ${notes.length} |
| Outcome completion(有結構化 metric 的 visit)| ${notes.length ? Math.round(withMetrics / notes.length * 100) : 0}%(${withMetrics}/${notes.length})|
| 療效判定 improved / no_change / worsened / lost / 未記 | ${verdicts.improved}/${verdicts.no_change}/${verdicts.worsened}/${verdicts.lost_followup}/${verdicts.unrecorded} |
| Median pain change(首末,n=${painDelta.n})| ${painDelta.median === null ? "—" : painDelta.median} |
| Median sleep hours change(n=${sleepDelta.n})| ${sleepDelta.median === null ? "—" : sleepDelta.median} |
| Adverse events | ${aes.length}(rate ${notes.length ? (aes.length / notes.length).toFixed(2) : 0}/visit)|
| AE by modality | ${Object.entries(aeByModality).map(([k, v]) => `${k} ×${v}`).join(" · ") || "—"} |

## 最常用(top 10)
- Patterns:${fmt(topPatterns)}
- Points:${fmt(topPoints)}
- Formulas:${fmt(topFormulas)}

## 知識缺口(高使用 × 無卡)
${gaps.length ? gaps.map((g) => "- " + g).join("\n") : "- 無"}

_資料:去識別化聚合;knowledge ids only。產生器:scripts/practice-audit.js_
`;
if (oIdx > -1 && args[oIdx + 1]) { fs.writeFileSync(args[oIdx + 1], report); console.log("report written:", args[oIdx + 1]); }
else console.log(report);

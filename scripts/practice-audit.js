/* 月度 Practice Audit — CLI 版
 *
 * 北極星迴圈的 feedback engine:臨床使用 → 結構化資料 → 本報告 → 知識缺口
 * → Research Queue。
 *
 * 2026-08-12 改寫:計算全部移到 `js/practice-audit.js`,本檔只負責
 * 「讀檔 → 按月篩 → 呼叫計算 → 印成 Markdown」。
 *
 * 為什麼要改:改寫前這裡自己算了一套,app 畫面又算另一套。同一個問題
 * (「這個月回診率多少」)有兩份實作,遲早給出兩個答案 —— P1 transport 的
 * MED-4 就是這樣來的(app 與 CLI 各有一份驗證規則,漂移之後誰也沒發現)。
 * 順帶修掉舊版兩個名實不符:
 *   - 註解寫「無卡/低成熟」,實作只抓得到「無卡」;draft/skeleton 卡片
 *     天天在用卻永遠不會出現在缺口清單裡
 *   - 只算 pain 與 sleep_hours 兩個 metric,其餘 25 個一律不看
 *
 * 報告內容:去識別化聚合 + knowledge id/名稱。不輸出 patientCode、病名文字、
 * 或任何臨床自由文字 —— 報告本身可安全分享或存 repo 外。
 *
 * 用法:
 *   node scripts/practice-audit.js <cases-export.json> [--month YYYY-MM] [--out report.md]
 *   (不給 --month 則統計全部;輸入 = app export 或 raw snapshot 檔)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { computePracticeAudit } = require(path.join(__dirname, "..", "js", "practice-audit.js"));

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.log("usage: node scripts/practice-audit.js <cases.json> [--month YYYY-MM] [--out report.md]");
  process.exit(2);
}
const mIdx = args.indexOf("--month");
const month = mIdx > -1 ? args[mIdx + 1] : null;
if (mIdx > -1 && !/^\d{4}-\d{2}$/.test(String(month))) {
  console.error(`--month 要是 YYYY-MM,收到「${month}」。寧可停下來,也不要靜默統計成全期間。`);
  process.exit(2);
}
const oIdx = args.indexOf("--out");

let parsed = JSON.parse(fs.readFileSync(file, "utf8"));
if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cases)) parsed = parsed.cases;   // v2 envelope
if (!Array.isArray(parsed)) {
  console.error("讀不到病例陣列:檔案既不是陣列,也沒有 .cases。");
  process.exit(2);
}

/* 月份篩選在進計算層之前做:把每個病例的 soapNotes 縮到該月,再丟掉當月
 * 完全沒有就診的病例。這樣「病例數」自然等於該月的 active cases,計算層
 * 不需要知道月份這回事。 */
const cases = month
  ? parsed
      .map((c) => Object.assign({}, c, { soapNotes: (c.soapNotes || []).filter((n) => String(n && n.visitDate || "").startsWith(month)) }))
      .filter((c) => c.soapNotes.length)
  : parsed;

// knowledge bundle 用來解析名稱與卡片成熟度。讀不到就誠實跳過缺口那一節,
// 不要印一個空清單讓人以為「沒有缺口」。
const knowledge = require("./lib/load-knowledge.js").loadKnowledge();

const r = computePracticeAudit({ cases, knowledge });

const n = (v, suffix) => (v === null || v === undefined ? "—" : `${v}${suffix || ""}`);
const used = (rows) => (rows.length ? rows.slice(0, 10).map((u) => `${u.name}${u.known === false ? "(無卡)" : ""} ×${u.visits}`).join(" · ") : "—");
const verdictLine = ["improved", "no_change", "worsened", "lost_followup"]
  .map((k) => r.verdictMix[k] || 0).join(" / ");
const unrecorded = r.volume.visits - r.completeness.visitsWithVerdict;

const outcomeRows = r.outcomeChanges.length
  ? r.outcomeChanges.map((o) => {
      const change = o.medianChange === null ? "—" : (o.medianChange > 0 ? `+${o.medianChange}` : String(o.medianChange));
      // 判讀依據要跟數字並排。沒有來源就明寫沒有 —— 一個沒有依據的中位數
      // 被單獨列出來,讀的人會自己補上「所以有改善」那句話。
      let basis = o.interpretable ? `可對照文獻(${o.interpretationSource.split(/[,.]/)[0]})` : o.caveat;
      // 第二個軸(D20):沒有閾值不代表沒有具名的正常範圍。分號接在同一格,
      // 不覆蓋前半句 —— 「無公認閾值」跟「有正常範圍可參考」要同時看得到。
      if (!o.interpretable && o.referenceRange) basis += `;參考範圍(${o.referenceRange.source.split(/[,.]/)[0]},限:${o.referenceRange.scope}）`;
      return `| ${o.label} | ${change}${o.unitDisplay ? " " + o.unitDisplay : ""} | ${o.casesMeasured} | ${basis} |`;
    }).join("\n")
  : "| — | — | 0 | 還沒有任何 metric 在同一病例被測過兩次以上 |";

const gapRows = knowledge
  ? (r.knowledgeGaps.length
      ? r.knowledgeGaps.map((g) => `- **${g.name}**(${g.kind})— ${g.visits} 診 · ${g.cases} 例 · 目前:${g.maturityLabel}`).join("\n")
      : "- 目前用到的方劑與證型卡片都已有來源。")
  : "- (knowledge bundle 讀不到 —— 本節跳過,不是「沒有缺口」)";

const report = `# Practice Audit${month ? " — " + month : "(全部期間)"}

| 指標 | 值 |
|---|---|
| Patients seen | ${r.volume.patients} |
| Cases active | ${r.volume.cases} |
| Visits | ${r.volume.visits}${r.volume.undatedVisits ? `(其中 ${r.volume.undatedVisits} 診沒有日期)` : ""} |
| 期間 | ${r.volume.firstVisitDate || "—"} → ${r.volume.lastVisitDate || "—"} |
| 回診率(≥2 診的病例)| ${n(r.followUp.followUpRatePct, "%")}(${r.followUp.casesWithFollowUp}/${r.volume.cases};${r.followUp.singleVisitCases} 例只來過一次)|
| 每病例就診中位數 | ${n(r.followUp.medianVisitsPerCase)} |
| 療效判定填寫率 | ${n(r.completeness.verdictRatePct, "%")}(${r.completeness.visitsWithVerdict}/${r.volume.visits})|
| Outcome 數值填寫率 | ${n(r.completeness.metricRatePct, "%")}(${r.completeness.visitsWithMetric}/${r.volume.visits})|
| 療效判定 improved / no_change / worsened / lost | ${verdictLine}(未記 ${unrecorded})|
| 不良事件 | ${n(r.adverseEvents.aeRatePct, "%")} 的就診有記錄(${r.adverseEvents.visitsWithAe}/${r.volume.visits})|
| AE 嚴重度 | ${Object.entries(r.adverseEvents.bySeverity).map(([k, v]) => `${k} ×${v}`).join(" · ") || "—"} |
| AE by modality | ${used(r.adverseEvents.byModality)} |

## Outcome 變化(同一病例首診 → 末診,取中位數)

| 指標 | 中位變化 | 有前後值的病例數 | 判讀依據 |
|---|---|---|---|
${outcomeRows}

## 最常用(top 10)

- Patterns:${used(r.mostUsed.patterns)}
- Points:${used(r.mostUsed.points)}
- Formulas:${used(r.mostUsed.formulas)}
- Modalities:${used(r.mostUsed.modalities)}

## 知識缺口 — 病例正在需要,但卡片還不到位${knowledge ? `(${r.knowledgeGapTotal} 項,列出前 ${Math.min(r.knowledgeGaps.length, 20)})` : ""}

${gapRows}

## 這份報告刻意不說什麼

${r.notStated.map((s) => "- " + s).join("\n")}

_資料:去識別化聚合;knowledge ids 與名稱。計算:js/practice-audit.js(與 app 畫面同一份)。產生器:scripts/practice-audit.js_
`;

if (oIdx > -1 && args[oIdx + 1]) {
  fs.writeFileSync(args[oIdx + 1], report);
  console.log("report written:", args[oIdx + 1]);
} else {
  console.log(report);
}

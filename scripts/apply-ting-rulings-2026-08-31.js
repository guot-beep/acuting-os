#!/usr/bin/env node
/**
 * apply-ting-rulings-2026-08-31.js — 執行 Ting 2026-08-31 的三條裁定。
 *
 *   1. 青木香撤下     herb.qing_mu_xiang → review_status: "deprecated"
 *   2. 梨皮照建議改   actions_en[0] 改成與 functions_zh[0]「清心潤肺」相符
 *   3. 去重複         方劑四個安全欄裡「同一欄內逐字重複」的句子只留第一次
 *
 * 三條都遵守憲法「只加深,不刪除」:改寫或移除任何既有內容之前,原陣列先逐字
 * 存進 import_artifacts({original_field, text, reason, moved_at, ruling}),
 * 卡片本身一律不硬刪(D6)。
 *
 * 用法:node scripts/apply-ting-rulings-2026-08-31.js [--dry]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry");
const MOVED_AT = "2026-08-31";
const RULING = "Ting 2026-08-31:「1 青木香撤下 2 照建議改 3 去重複」";

const load = (rel) => {
  const p = path.join(ROOT, rel);
  return { p, raw: fs.readFileSync(p, "utf8"), json: JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, "")) };
};
const save = (p, json) => { if (!DRY) fs.writeFileSync(p, JSON.stringify(json, null, 2) + "\n"); };
const recs = (j) => j.records || j;
const L = (v) => (Array.isArray(v) ? v.filter((x) => String(x || "").trim() !== "") : []);
// 標點無關的比對鍵 —— 「孕婦慎用。」與「孕婦慎用」在畫面上是同一句
const chipKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9一-鿿]/g, "");
const archive = (rec, field, originalArray, reason) => {
  if (!Array.isArray(rec.import_artifacts)) rec.import_artifacts = [];
  rec.import_artifacts.push({
    original_field: field,
    text: originalArray.join(" | "),
    reason,
    moved_at: MOVED_AT,
    ruling: RULING,
  });
};

const report = [];

/* ── 裁定 1:青木香撤下 ────────────────────────────────────────────────
 * D6 —— 不硬刪,標 deprecated。卡片內容全部留著,它仍然是一張讀得到的
 * 歷史記錄;改的只是「它不再是可以開的藥」。
 *
 * 刻意**不動**的兩處引用:
 *   - 紫雪丹的組成仍然列著青木香。那是古方的事實,刪掉等於竄改方劑。
 *   - data/config/formula_caution_herbs.json 的 aristolochia_risk 家族
 *     仍然把 qing_mu_xiang 列為警示對象。撤下卡片不等於撤下警告 ——
 *     正好相反,含它的方劑更需要那個警示留在畫面上。 */
{
  const { p, json } = load("data/herbs/herb_canon_shortlist.json");
  const r = recs(json).find((x) => x.id === "herb.qing_mu_xiang");
  if (!r) throw new Error("找不到 herb.qing_mu_xiang");
  const before = r.review_status;
  r.review_status = "deprecated";
  r.deprecated_note_zh =
    "2026-08-31 撤下（Ting 裁定）：馬兜鈴科，含馬兜鈴酸，具腎毒性與致癌性，" +
    "中國藥典自 2005 年版起取消收載。卡片內容完整保留供辨識與歷史查考，" +
    "但不再作為可開立的藥物。紫雪丹的組成仍列本品（古方事實，不竄改），" +
    "data/config/formula_caution_herbs.json 的 aristolochia_risk 警示亦維持不變 —— " +
    "撤下卡片不等於撤下警告。functions_zh/actions_en 的索引不對齊維持原狀：" +
    "替一味已撤下的藥補寫適應症英文，方向與本裁定相反。";
  save(p, json);
  report.push(`裁定1 青木香: review_status ${before} → deprecated,加 deprecated_note_zh`);
}

/* ── 裁定 2:梨皮 actions_en[0] ───────────────────────────────────────
 * functions_zh[0] 是「清心潤肺」(清心 = 清心火),英文卻寫
 * "Moistens the Lung and clears Heat" —— clears Heat 不是清心。
 * 逐索引配對的兩側必須講同一件事,改英文使其與中文相符。 */
{
  const { p, json } = load("data/herbs/herb_canon_shortlist.json");
  const r = recs(json).find((x) => x.id === "herb.li_pi");
  if (!r) throw new Error("找不到 herb.li_pi");
  const OLD = "Moistens the Lung and clears Heat";
  const NEW = "Clears the Heart and moistens the Lung";
  const arr = L(r.actions_en);
  const i = arr.indexOf(OLD);
  if (i === -1) {
    report.push(`裁定2 梨皮: 找不到「${OLD}」—— 可能已被改過,略過`);
  } else {
    archive(r, "actions_en", arr.slice(),
      `梨皮 actions_en[${i}] 與 functions_zh[${i}]「清心潤肺」語意不符（清心 ≠ clears Heat）；` +
      `逐索引配對的兩側必須講同一件事，改英文對齊中文。原陣列逐字保留於此。`);
    arr[i] = NEW;
    r.actions_en = arr;
    save(p, json);
    report.push(`裁定2 梨皮: actions_en[${i}]「${OLD}」→「${NEW}」,原陣列已存 import_artifacts`);
  }
}

/* ── 裁定 3:方劑安全欄的欄位內重複 ───────────────────────────────────
 * 同一個欄位裡出現兩次的句子,在卡上就是印兩次。比對用標點無關的鍵,
 * 因為「孕婦慎用。」與「孕婦慎用」在讀者眼裡是同一句(至寶丹拆句的副產物)。
 * 只留第一次出現,原陣列逐字存進 import_artifacts。
 *
 * 注意這裡**只**處理「同一欄位內部」的重複。禁忌欄與注意事項欄之間的重複
 * 是渲染層逐項去重的職責(見 js/knowledge.js formulaPanels),不在資料層動手 ——
 * 那兩欄的分工是 A1(a) 按方向拆的,資料層擅自合併會把方向資訊弄丟。 */
{
  const SAFETY = ["contraindications_zh", "contraindications_en", "cautions_zh", "cautions_en"];
  const { p, json } = load("data/herbs/formulas.json");
  let removed = 0;
  const touched = [];
  for (const r of recs(json)) {
    for (const f of SAFETY) {
      const arr = L(r[f]);
      if (arr.length < 2) continue;
      const seen = new Set();
      const kept = [];
      const dropped = [];
      for (const v of arr) {
        const k = chipKey(v);
        if (seen.has(k)) { dropped.push(v); continue; }
        seen.add(k); kept.push(v);
      }
      if (!dropped.length) continue;
      archive(r, f, arr.slice(),
        `欄位內逐字重複（標點無關比對），同一句會在卡上印兩次；只留第一次出現。` +
        `移除的是：${dropped.join(" / ")}。原陣列逐字保留於此。`);
      r[f] = kept;
      removed += dropped.length;
      touched.push(`${r.name_zh || r.id} [${f}] −${dropped.length}`);
    }
  }
  save(p, json);
  report.push(`裁定3 去重複: 移除 ${removed} 句欄位內重複,涉及 ${touched.length} 個欄位`);
  touched.forEach((t) => report.push(`         ${t}`));
}

console.log(DRY ? "（--dry：只計算，未寫檔）\n" : "");
report.forEach((r) => console.log(r));

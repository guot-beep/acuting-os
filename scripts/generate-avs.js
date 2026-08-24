/* 診後摘要(AVS)產生器 v1 — 純指示版(2026-08-11,Ting 核准規格)
 *
 * 鐵則:零診斷資訊 —— 不出現病名/證型/ICD/CPT/時間單位/治療必要性語言。
 * 定位 = 照護指示單(如藥局用藥說明),非臨床記錄摘要、非申報文件。
 *
 * 用法:
 *   node scripts/generate-avs.js <cases.json> --case <caseId> [--visit <noteId|latest>]
 *        [--out avs.html] [--skip summary,herbs,...]   區塊鍵:summary herbs lifestyle diet exercise safety followup
 */
"use strict";
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const file = args[0];
const arg = (n, d) => { const i = args.indexOf(n); return i > -1 && args[i + 1] ? args[i + 1] : d; };
if (!file || !arg("--case")) { console.log("usage: node scripts/generate-avs.js <cases.json> --case <id> [--visit latest] [--out avs.html] [--skip a,b]"); process.exit(2); }
const skip = new Set((arg("--skip", "") || "").split(",").filter(Boolean));

let data = JSON.parse(fs.readFileSync(file, "utf8"));
if (data && !Array.isArray(data) && Array.isArray(data.cases)) data = data.cases;
const kase = data.find((c) => c.id === arg("--case"));
if (!kase) { console.error("case not found; available: " + data.map((c) => c.id).join(", ")); process.exit(1); }
const notes = [...(kase.soapNotes || [])].sort((a, b) => String(a.visitDate).localeCompare(String(b.visitDate)));
const visitSel = arg("--visit", "latest");
const note = visitSel === "latest" ? notes[notes.length - 1] : notes.find((n) => n.id === visitSel);
if (!note) { console.error("visit not found"); process.exit(1); }

// 建議庫 + 診所資訊(v2)
let ADVICE = [], CLINIC = {};
try { ADVICE = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/config/avs_advice_library.json"), "utf8")).records || []; } catch {}
try { CLINIC = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/config/clinic_profile.json"), "utf8")); } catch {}

// 知識庫(方劑/補充劑病人名):bundle 可載則用,不可載誠實略過
let K = null;
try { const g = {}; (new Function("globalThis", fs.readFileSync(path.join(__dirname, "..", "data/generated/knowledge_data.js"), "utf8") + ";"))(g); K = g.ACUTING_KNOWLEDGE; } catch { K = null; }
const nameOf = (id) => {
  if (!K) return null;
  const pools = [K.formulas, K.supplementRecords, K.pharmDrugs, K.medications];
  for (const p of pools) { const r = (p && p.records || []).find((x) => x.id === id); if (r) return r.name_zh || r.name_en || null; }
  return null;
};

const MODALITY_PLAIN = {
  "modality.acupuncture": "針灸", "modality.electroacupuncture": "電針", "modality.moxibustion": "溫灸",
  "modality.cupping": "拔罐", "modality.gua_sha": "刮痧", "modality.tui_na": "推拿手法",
  "modality.auricular_acupuncture": "耳穴", "modality.bloodletting": "點刺放血",
  "modality.herbal_medicine": "中藥調理", "modality.tdp_heat_lamp": "溫熱照射", "modality.acupressure": "穴位按壓",
};

// ① 今天做了什麼(平實;不列穴名、不列數量)
const didToday = [];
if ((note.acupointLinks || []).length || note.pointsUsed) didToday.push("針灸");
if (note.retentionMinutes) { /* 留針屬臨床細節,不放 */ }
for (const a of note.adverseEvents || []) { const m = MODALITY_PLAIN[a.modalityId]; if (m && !didToday.includes(m)) { /* AE 的 modality 不代表當日治療,略 */ } }
if ((note.formulaLinks || []).length || note.formulaHerbs) didToday.push("中藥調理");

// ③ 中藥/營養品怎麼吃 — 只取 case 曝露帳(active 者)+ 劑量頻率原文
const meds = (kase.agentExposures || []).filter((e) => !/stopped|past/i.test(String(e.status || "")));
const medRows = meds.map((e) => ({
  name: nameOf(e.agentId) || e.nameText || e.agentId || "—",
  dose: e.doseText || "依醫囑",
  freq: e.frequencyText || "",
})).filter((r) => r.name !== "—");

// ⑧ 自我觀察(追蹤中的 metric 病人題面)
const tracked = new Set();
for (const n of notes) for (const m of n.outcomeMetrics || []) tracked.add(m.metricId);
const prompts = [...tracked].map((id) => {
  const def = (K && K.outcomeMetrics && K.outcomeMetrics.records || []).find((r) => r.id === id);
  return def && def.patient_prompt_zh ? def.patient_prompt_zh : null;
}).filter(Boolean).slice(0, 4);

// v3:媒合委派給共用引擎(js/avs.js)—— 結構化 modalitiesPerformed 優先、
// legacy 文字推斷 fallback、safety 旗標別名正規化後精確比對(不再子字串)。
// 觸發條件絕不輸出,只輸出 advice_zh(病人語言)。
require(path.join(__dirname, "..", "js", "avs.js"));
const AVS = globalThis.AcuTingAVS;
const avsCtx = AVS.buildMatchContext(kase, note);
const matchedAdvice = AVS.matchAdvice(ADVICE, avsCtx).map((m) => m.rule);
const byCat = (cat) => matchedAdvice.filter((a) => a.category === cat).map((a) => a.advice_zh);

const esc = (s) => String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const sec = (key, title, bodyHtml) => (skip.has(key) || !bodyHtml) ? "" : `<section><h2>${title}</h2>${bodyHtml}</section>`;

const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>診後照護指示</title><style>
body{font-family:"Microsoft JhengHei","Noto Sans TC",sans-serif;background:#f3eddf;color:#202427;margin:0;padding:24px;line-height:1.7}
.sheet{max-width:640px;margin:0 auto;background:#fff;border:1px solid #d9e0e4;border-radius:12px;padding:28px 32px;box-shadow:0 8px 30px rgba(23,33,38,.08)}
h1{font-family:"Noto Serif TC",serif;font-size:1.5em;color:#0a5956;border-bottom:2px solid #c89033;padding-bottom:8px;margin:0 0 4px}
.date{color:#66717a;font-size:.9em;margin-bottom:16px}
h2{font-family:"Noto Serif TC",serif;font-size:1.05em;color:#16352f;margin:18px 0 6px}
table{width:100%;border-collapse:collapse;font-size:.95em}
td,th{border:1px solid #e5e0d4;padding:6px 10px;text-align:left}
th{background:#f7f3e8}
ul{margin:4px 0;padding-left:20px}
.footer{margin-top:22px;padding-top:10px;border-top:1px dashed #c89033;font-size:.78em;color:#66717a}
@media print{body{background:#fff;padding:0}.sheet{border:0;box-shadow:none}}
</style></head><body><div class="sheet">
<div style="text-align:center;margin-bottom:6px"><div style="font-family:'Noto Serif TC',serif;font-size:1.2em;color:#16352f">${esc(CLINIC.clinic_name_zh || "")}</div></div>
<h1>診後照護指示</h1>
<div class="date">日期:${esc(note.visitDate)}</div>
${sec("today", "今天做了什麼", didToday.length ? `<p>${didToday.map(esc).join("、")}。</p>` : "")}
${sec("summary", "近況小結", note.avsSummary ? `<p>${esc(note.avsSummary)}</p>` : "")}
${sec("herbs", "調理品怎麼吃", medRows.length ? `<table><tr><th>名稱</th><th>用量</th><th>頻率</th></tr>${medRows.map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.dose)}</td><td>${esc(r.freq)}</td></tr>`).join("")}</table><p style="font-size:.85em;color:#66717a">${esc(byCat("herb_caution").join(" ") || "請依本次提供的方式使用中藥或營養品;若同時使用處方藥或其他長期用藥,請讓醫療團隊知道,不要自行停藥或更改劑量;有任何不適先暫停並聯絡我們。")}</p>` : "")}
${sec("aftercare", "今日治療後注意事項", byCat("aftercare").length ? "<ul>" + byCat("aftercare").map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>" : "")}
${sec("special", "特別注意", byCat("special").length ? "<ul>" + byCat("special").map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>" : "")}
${sec("lifestyle", "作息與生活建議", (byCat("lifestyle").length || note.avsLifestyle) ? (byCat("lifestyle").length ? "<ul>" + byCat("lifestyle").map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>" : "") + (note.avsLifestyle ? "<p>" + esc(note.avsLifestyle) + "</p>" : "") : "")}
${sec("diet", "飲食建議", (byCat("diet").length || note.avsDiet) ? (byCat("diet").length ? "<ul>" + byCat("diet").map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>" : "") + (note.avsDiet ? "<p>" + esc(note.avsDiet) + "</p>" : "") : "")}
${sec("exercise", "活動與運動建議", note.avsExercise ? `<p>${esc(note.avsExercise)}</p>` : "")}
${sec("safety", "什麼情況請盡快與我們聯絡或就醫", `<ul><li>症狀明顯加重、或出現新的劇烈疼痛</li><li>發燒、持續頭暈、異常出血或瘀腫擴大</li><li>服用調理品後噁心、皮疹或任何過敏反應</li>${note.avsSafety ? `<li>${esc(note.avsSafety)}</li>` : ""}</ul>`)}
${/* 回診段只讀 note.avsFollowUp —— 與本檔其餘欄位(avsSummary/avsLifestyle/
    avsDiet/avsExercise/avsSafety)同一條 avs* 慣例:病人文件只印「寫給病人看的
    欄位」。舊版這裡讀的是 note.followUp,那是 SOAP 的內部下次計畫(「若無效改
    梔子豉湯思路」這類),等於預設把醫師的盤算印給病人。沒有 avsFollowUp 時這段
    留白,不 fallback 回內部欄位 —— 寧可少印一句,不可多洩一句。 */""}
${sec("followup", "下次回診與自我觀察", `${note.avsFollowUp ? `<p>回診安排:${esc(note.avsFollowUp)}</p>` : ""}${prompts.length ? `<p>這段期間請留意:</p><ul>${prompts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}`)}
<div style="margin-top:18px;display:flex;justify-content:space-between;font-size:.9em;align-items:flex-end"><div>醫師:${esc(CLINIC.practitioner_zh || "")}＿＿＿＿＿＿</div><div style="text-align:right;color:#66717a">預約電話:${esc(CLINIC.phone || "")}<br>${esc(CLINIC.website || "")}</div></div>
<div class="footer">本文件為衛教與照護指示,非診斷證明,不適用於保險申報。如有疑問請聯絡診所。</div>
</div></body></html>`;

// 零診斷自檢:輸出不得含病名/證型/代碼類詞彙(粗篩 + patientCode)
const banned = [kase.patientCode, "ICD", "CPT", "cond.", "pattern.", "tdis.", "safety.", "modality.", "metric."].filter(Boolean);
for (const b of banned) if (html.includes(b)) { console.error(`SAFETY ABORT: output contains banned token "${b}"`); process.exit(1); }

const out = arg("--out");
if (out) { fs.writeFileSync(out, html); console.log("AVS written:", out); }
else console.log(html);

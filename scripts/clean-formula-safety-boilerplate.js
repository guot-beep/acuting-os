// 安全欄位清理(FORMULA_RESTORATION_AUDIT §4 的兩句樣板)+ 禁忌中文層。
//
// 三件事,全部可驗證:
//   1. 「孕婦及體虛者請遵醫囑使用。」—— 25 方共用的一句話坐在 cautions_zh,
//      讓「有禁忌 84/201」的統計說謊(§4①)。只移除逐字等於這句的元素。
//   2. 「Draft search/study context only; ...」—— 22 方的 clinical_use_note 是
//      流程免責聲明不是方劑知識(§4②)。逐字比對後清空。
//   3. contraindications_en 裡的 AD 頁面區塊標題(CONTRAINDICATIONS /
//      HERB/DRUG INTERACTIONS)是抓取殘渣;移除後把真禁忌逐條譯出 zh 對齊,
//      藥理性質的「protective effect」句搬去 modern_research_en。
//      安全內容紀律:en 照 AD 原文,zh 為逐條對譯,逐欄標來源。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const B1 = "孕婦及體虛者請遵醫囑使用。";
const B2 = "Draft search/study context only; not a treatment claim. Verify English exam layer against Bensky before source_checked.";
const HDR = /^(AND )?HERB\/DRUG INTERACTIONS$|^CONTRAINDICATIONS$/;
const AD_NOTE = "American Dragon formula page (harvested 2026-08) — en 照原文,zh 為對譯(scripts/clean-formula-safety-boilerplate.js)";

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const getRec = (id) => { const r = doc.records.find((x) => x.id === "formula." + id); if (!r) die("找不到 " + id); return r; };

// ---- 1. 孕婦樣板 -------------------------------------------------------------
let n1 = 0;
for (const r of doc.records) {
  if (!Array.isArray(r.cautions_zh)) continue;
  const beforeLen = r.cautions_zh.length;
  r.cautions_zh = r.cautions_zh.filter((s) => s !== B1);
  if (r.cautions_zh.length !== beforeLen) n1++;
}

// ---- 2. 流程免責聲明 ---------------------------------------------------------
let n2 = 0;
for (const r of doc.records) {
  if (r.clinical_use_note === B2) { r.clinical_use_note = ""; n2++; }
}

// ---- 3. 禁忌重建(en 清殘渣 + zh 對譯)---------------------------------------
// expect_en:目前欄位的完整現值(含殘渣),逐字驗證後才動。
// keep:留在禁忌的 en(AD 原文) + zh 對譯。to_research:搬去 modern_research_en。
const REBUILD = [
  { id: "chai_ge_jie_ji_tang",
    keep_en: ["Contraindicate for those with no Interior Heat.", "Do not use if the Yang Ming has been already attacked with constipation and abdominal pain.", "Avoid acrid, oily or spicy foods while taking this formula."],
    zh: ["無裡熱者不宜使用", "陽明已受邪而見便秘、腹痛者不用", "服藥期間忌辛辣、油膩之品"] },
  { id: "ren_shen_bai_du_san",
    keep_en: ["Contraindicated for those with Damp-Heat in the channels.", "Contraindicated for those with Exterior Wind-Heat.", "Contraindicated for those with Internal Heat.", "Contraindicated for those with Yin Deficiency with Exterior Invasion.", "Contraindicated for those with a strong constitution."],
    zh: ["經絡濕熱者禁用", "外感風熱者禁用", "裡熱者禁用", "陰虛而外感者禁用", "體質強實者禁用"] },
  { id: "tiao_wei_cheng_qi_tang",
    keep_en: ["Contraindicated during pregnancy.", "Use extreme caution with weak patients, add tonics."],
    zh: ["孕婦禁用", "體虛者須極慎用,宜加補益之品"],
    to_research: ["This formula has been used with satisfactory results in treating drug overdose."] },
  { id: "li_zhong_wan",
    keep_en: ["Contraindicated for those with External Wind Invasion with fever.", "Contraindicated for those with Yin Deficiency.", "Use with caution during pregnancy.", "For those with sudden turmoil disorder, stop when diarrhea and vomiting have stopped."],
    zh: ["外感風邪發熱者禁用", "陰虛者禁用", "孕婦慎用", "霍亂吐瀉止後即當停藥"] },
  { id: "si_jun_zi_tang",
    expect_exact: ["Review cloying/digestive tolerance and acute excess patterns"],
    keep_en: ["Contraindicated for those with Excess Syndromes with high fever, irritability, thirst and constipation.", "Contraindicated for those with Deficiency Heat, high fever or a combination of irritability, thirst and constipation unless modified."],
    zh: ["實證而高熱、煩躁、口渴、便秘者禁用", "虛熱、高熱,或煩躁口渴便秘並見者,非經加減不用"] },
  { id: "sheng_mai_san",
    keep_en: ["Use extreme caution with high fever.", "Use extreme caution for unresolved external cough.", "Do not use in initial stage flu in summer with mild conditions.", "Do not use if Fluids are not yet injured."],
    zh: ["高熱者須極慎用", "外感咳嗽未解者須極慎用", "夏月外感初起之輕證不用", "津液未傷者不用"] },
  { id: "shi_quan_da_bu_tang",
    keep_en: ["Contraindicated for those with Heat or Excess disorders."],
    zh: ["熱證或實證者禁用"],
    to_research: ["This formula may have a marked protective effect against chemotherapy- and radiation-induced toxicities.", "This formula may have a marked protective effect against cyclophosphamide- or prednisone-induced immuno-suppression.", "This formula may have a marked protective effect against carboplatin- or cisplatin-induced myclosuppression.", "This formula may have a marked protective effect against cis-diamminedichloroplatinum-induced nephrotoxicity and bone marrow toxicity.", "This formula may have a marked protective effect against interferon toxicity.", "This formula may have a marked protective effect against rifampin-induced neutropenia."] },
  { id: "jin_gui_shen_qi_wan",
    expect_exact: ["Review heat signs, hypertension, pregnancy, cardiac disease, kidney disease, and medication context"],
    keep_en: ["Contraindicated for those with Yin Deficiency with dry mouth and throat and a red tongue with no coat.", "Use with caution for those with gastrointestinal weakness.", "Contraindicated for those with marked ascites.", "Contraindicated for those with frequent diarrhea.", "Contraindicated for those with facial flushing with fever.", "Contraindicated during pregnancy."],
    zh: ["陰虛而口乾咽燥、舌紅無苔者禁用", "胃腸虛弱者慎用", "腹水顯著者禁用", "經常腹瀉者禁用", "面赤發熱者禁用", "孕婦禁用"],
    to_research: ["This formula may be effective in treating side effects and adverse reactions, including dizziness, weight gain, perspiration and emotional disturbances associated with long-term prednisone use."] },
  { id: "suan_zao_ren_tang", keep_en: [], zh: [] },
  { id: "gan_mai_da_zao_tang", keep_en: [], zh: [] },
];

for (const spec of REBUILD) {
  const r = getRec(spec.id);
  const cur = (r.contraindications_en || []).map((s) => String(s).trim());
  if (spec.expect_exact) {
    if (JSON.stringify(cur) !== JSON.stringify(spec.expect_exact)) die(`${spec.id} 現值不是預期草稿`);
  } else {
    // 現值必須恰好 = 殘渣標題 ∪ keep_en ∪ to_research,一條不多不少
    const expected = new Set([...spec.keep_en, ...(spec.to_research || [])]);
    for (const line of cur) {
      if (HDR.test(line)) continue;
      if (!expected.has(line)) die(`${spec.id} en 有未預期的行:「${line.slice(0, 50)}」`);
    }
    for (const line of expected) if (!cur.includes(line)) die(`${spec.id} en 缺預期的行:「${line.slice(0, 40)}」`);
  }
  if ((r.contraindications_zh || []).length) die(`${spec.id} zh 不是空的 — 前提不成立`);
  if (spec.keep_en.length !== spec.zh.length) die(`${spec.id} 轉錄表 zh/en 條數不齊`);

  r.contraindications_en = spec.keep_en;
  r.contraindications_zh = spec.zh;
  if (spec.to_research && spec.to_research.length) {
    r.modern_research_en = [...(Array.isArray(r.modern_research_en) ? r.modern_research_en : []), ...spec.to_research];
    r.field_sources = r.field_sources || {};
    r.field_sources.modern_research_en = [...new Set([...(r.field_sources.modern_research_en || []), AD_NOTE + "(原誤列於禁忌欄,已搬移)"])];
  }
  r.field_sources = r.field_sources || {};
  if (spec.keep_en.length) {
    r.field_sources.contraindications_en = [AD_NOTE];
    r.field_sources.contraindications_zh = [AD_NOTE];
  }
  console.log(`✓ ${spec.id.padEnd(24)} 禁忌 ${spec.zh.length} 條中英對齊` + (spec.to_research ? ` · ${spec.to_research.length} 條藥理備註歸位` : "") + (spec.keep_en.length ? "" : "(AD 無實質禁忌,殘渣清空)"));
}

// ---- 4. 補中益氣湯 舌脈(課件表 253 正文)------------------------------------
{
  const r = getRec("bu_zhong_yi_qi_tang");
  if (r.tongue_zh || r.tongue_en || r.pulse_zh || r.pulse_en) die("補中益氣湯 舌脈已有值 — 前提不成立");
  r.tongue_en = "pale with thin, white coating";
  r.tongue_zh = "舌淡;苔薄白";
  r.pulse_en = "flooding, deficient, or deficient & rootless at right Guan";
  r.pulse_zh = "脈洪大而虛,或虛而右關無根";
  r.field_sources = r.field_sources || {};
  const SRC = "curriculum/herbs/方剂学汇总_extracted.md#Table253(正文 T/P 行;中文為回譯)";
  for (const f of ["tongue_zh", "tongue_en", "pulse_zh", "pulse_en"]) r.field_sources[f] = [SRC];
  console.log("✓ bu_zhong_yi_qi_tang      舌脈補齊(課件表253)");
}

if (n1 !== 25 || n2 !== 22) die(`清理數與稽核不符(孕婦句 ${n1}/25 · 免責句 ${n2}/22)— 不寫檔`);
fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log(`\n樣板清理:孕婦句 ${n1}/25 方 · 免責句 ${n2}/22 方`);
console.log("完成");

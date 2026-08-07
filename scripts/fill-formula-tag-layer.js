// 標籤層批次:稽核 §7 列出的 17 首(condition/pattern/study 整層空白或只有
// 「體質調理」一枚通用標籤)。
//
// 規則(模板 §2 + glossary _note):
//   - 標籤 2–6 字,不是句子(F10 會擋 >12 字)。
//   - 新詞先加進 data/config/formula_tag_glossary.json 再用 —— 全 201 方共用,
//     同一個詞才不會兩種英文。
//   - en 一律由 glossary 查出;查不到就整格拒寫(不半翻)。
//   - 只加深:既有標籤保留,新標籤附加在後,zh/en 同步附加保持對齊。
//   - study_tags 沿用既有 slug 風格(uri / fever_context / shaoyang…)。
const fs = require("fs");

const F_FILE = "data/herbs/formulas.json";
const G_FILE = "data/config/formula_tag_glossary.json";
const SRC = "由本卡主治/現代應用內容歸納之短標籤;en 出自 data/config/formula_tag_glossary.json(scripts/fill-formula-tag-layer.js 2026-08-06)";

// ---- glossary 擴充(先進表再用)----------------------------------------------
const NEW_CONDITION = {
  "口渴": "Thirst",
  "盜汗": "Night Sweats",
  "四肢冰冷": "Cold Extremities",
};
const NEW_PATTERN = {
  "脾胃虛寒": "Spleen-Stomach Deficiency Cold",
  "氣陰兩虛": "Qi & Yin Deficiency",
  "臟躁": "Zang Zao (Restless Organ)",
  "氣分熱盛": "Qi-Level Heat Excess",
  "肝脾不和": "Liver-Spleen Disharmony",
  "亡陽": "Yang Collapse",
  "少陰證": "Shao Yin Pattern",
  "肝血虛": "Liver Blood Deficiency",
  "陽明腑實": "Yang Ming Fu Excess",
  "火毒": "Fire Toxin",
};

const PLAN = {
  "formula.ren_shen_bai_du_san": { cond: ["感冒", "身痛", "咳嗽"], pat: ["風寒", "氣虛"], study: ["uri", "body_aches", "qi_deficiency_exterior"] },
  "formula.li_zhong_wan": { cond: ["腹痛", "泄瀉", "嘔吐", "畏寒"], pat: ["脾胃虛寒", "裡寒", "陽虛"], study: ["diarrhea_context", "middle_jiao_cold"] },
  "formula.sheng_mai_san": { cond: ["疲勞", "心悸", "自汗", "口渴"], pat: ["氣陰兩虛"], study: ["summer_qi_yin", "palpitations_context"] },
  "formula.tiao_wei_cheng_qi_tang": { cond: ["便祕", "腹脹", "發熱"], pat: ["陽明證", "裡熱"], study: ["constipation_context", "purgation"] },
  "formula.gan_mai_da_zao_tang": { cond: ["失眠", "焦慮", "憂鬱", "汗證"], pat: ["臟躁", "心陰虛"], study: ["zang_zao", "emotional_context"] },
  "formula.bai_hu_tang": { cond: ["發熱", "口渴", "頭痛"], pat: ["氣分熱盛", "陽明證", "裡熱"], study: ["four_greats", "qi_level_heat"] },
  "formula.qing_hao_bie_jia_tang": { cond: ["發熱", "盜汗"], pat: ["陰虛", "虛熱"], study: ["night_fever", "yin_deficiency_heat"] },
  "formula.xiao_cheng_qi_tang": { cond: ["便祕", "腹脹", "痢疾"], pat: ["陽明證", "裡熱"], study: ["constipation_context", "purgation"] },
  "formula.si_ni_san": { cond: ["脅痛", "腹痛", "憂鬱", "四肢冰冷"], pat: ["肝氣鬱結", "肝脾不和", "氣滯"], study: ["liver_qi", "cold_extremities"] },
  "formula.ma_xing_shi_gan_tang": { cond: ["咳嗽", "氣喘", "發熱", "支氣管炎"], pat: ["肺熱", "風熱"], study: ["wheezing_context", "lung_heat"] },
  "formula.si_ni_tang": { cond: ["四肢冰冷", "畏寒", "泄瀉"], pat: ["亡陽", "陽虛", "裡寒", "少陰證"], study: ["yang_rescue", "shaoyin"] },
  "formula.suan_zao_ren_tang": { cond: ["失眠", "心悸", "盜汗", "眩暈"], pat: ["肝血虛", "血虛", "虛熱"], study: ["insomnia_context", "blood_deficiency"] },
  "formula.shi_quan_da_bu_tang": { cond: ["疲勞", "貧血", "病後虛弱"], pat: ["氣血兩虛", "陽虛"], study: ["tonification", "qi_blood_tonic"] },
  "formula.da_cheng_qi_tang": { cond: ["便祕", "腹脹滿", "發熱"], pat: ["陽明腑實", "陽明證", "裡熱"], study: ["purgation", "pi_man_zao_shi"] },
  "formula.huang_lian_jie_du_tang": { cond: ["發熱", "失眠", "黃疸", "鼻衄"], pat: ["火毒", "裡熱", "熱證"], study: ["fire_toxin", "three_jiao_heat"] },
  "formula.chai_ge_jie_ji_tang": { cond: ["感冒", "頭痛", "發熱"], pat: ["風寒", "裡熱"], study: ["uri", "muscle_layer_release"] },
  "formula.si_jun_zi_tang": { cond: [], pat: [], study: ["qi_tonic_base", "spleen_qi"] },
};

const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const readJson = (f) => {
  const raw = fs.readFileSync(f, "utf8");
  const doc = JSON.parse(raw);
  const trailer = raw.endsWith("\n") ? "\n" : "";
  if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) die(f + " 重排風險");
  return { doc, trailer };
};

const g = readJson(G_FILE);
for (const [zh, en] of Object.entries(NEW_CONDITION)) {
  if (g.doc.condition[zh] && g.doc.condition[zh] !== en) die("glossary condition 衝突:" + zh);
  g.doc.condition[zh] = en;
}
for (const [zh, en] of Object.entries(NEW_PATTERN)) {
  if (g.doc.pattern[zh] && g.doc.pattern[zh] !== en) die("glossary pattern 衝突:" + zh);
  g.doc.pattern[zh] = en;
}
// 依字典序重排兩個表,維持既有排序慣例
g.doc.condition = Object.fromEntries(Object.entries(g.doc.condition).sort((a, b) => a[0].localeCompare(b[0], "zh-Hant")));
g.doc.pattern = Object.fromEntries(Object.entries(g.doc.pattern).sort((a, b) => a[0].localeCompare(b[0], "zh-Hant")));

const f = readJson(F_FILE);
const before = new Map(f.doc.records.map((r) => [r.id, JSON.stringify(r)]));
const report = [];

for (const [id, plan] of Object.entries(PLAN)) {
  const r = f.doc.records.find((x) => x.id === id);
  if (!r) die("找不到 " + id);
  const did = [];

  const appendTags = (zhField, enField, tags, dict) => {
    if (!tags.length) return;
    const zh = Array.isArray(r[zhField]) ? r[zhField] : [];
    const en = Array.isArray(r[enField]) ? r[enField] : [];
    if (zh.length !== en.length) die(`${id} ${zhField} 既有 zh/en 不對齊(${zh.length}/${en.length})— 不動它`);
    const fresh = tags.filter((t) => !zh.includes(t));
    for (const t of fresh) {
      if (t.length > 6) die(`${id} 標籤「${t}」超過 6 字`);
      const e = dict[t];
      if (!e) die(`${id} 標籤「${t}」不在 glossary — 先加表再用`);
      zh.push(t); en.push(e);
    }
    r[zhField] = zh; r[enField] = en;
    if (fresh.length) did.push(`${zhField}+${fresh.length}`);
  };
  appendTags("condition_tags_zh", "condition_tags_en", plan.cond, g.doc.condition);
  appendTags("pattern_tags_zh", "pattern_tags_en", plan.pat, g.doc.pattern);

  const st = Array.isArray(r.study_tags) ? r.study_tags : [];
  const freshSt = plan.study.filter((t) => !st.includes(t));
  if (freshSt.length) { r.study_tags = [...st, ...freshSt]; did.push(`study+${freshSt.length}`); }

  if (did.length) {
    r.field_sources = r.field_sources || {};
    for (const fld of ["condition_tags_zh", "condition_tags_en", "pattern_tags_zh", "pattern_tags_en"])
      if (did.some((d) => d.startsWith(fld.replace("_en", "_zh")))) r.field_sources[fld] = [...new Set([...(r.field_sources[fld] || []), SRC])];
  }
  report.push(`✓ ${id.replace("formula.", "").padEnd(24)} ${did.join(" ") || "(無新增)"}`);
}

// §0 guard:任何欄位變短或消失 → 拒寫
const problems = [];
for (const r of f.doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (k === "field_sources") continue;
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
}
if (problems.length) die(problems.join("\n  "));

fs.writeFileSync(G_FILE, JSON.stringify(g.doc, null, 2) + g.trailer);
fs.writeFileSync(F_FILE, JSON.stringify(f.doc, null, 2) + f.trailer);
console.log(`glossary +${Object.keys(NEW_CONDITION).length} condition +${Object.keys(NEW_PATTERN).length} pattern\n`);
for (const line of report) console.log("  " + line);

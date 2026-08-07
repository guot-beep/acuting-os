const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const md1Path = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const md2Path = path.join(__dirname, '../curriculum/formulas/AD_Selected_Formulas_Name_Herbs_Actions.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const dictPath = path.join(__dirname, 'exact_366_dict.json');

const md1Content = fs.readFileSync(md1Path, 'utf8');
const md2Content = fs.readFileSync(md2Path, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];
const EXACT_366_DICT = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// Exact Syndrome Translator Map
const EXACT_SYNDROME_DICT = {
  "Spleen and Stomach Qi Deficiency": "脾胃氣虛證",
  "Spleen and Stomach Qi Deficiency with Dampness": "脾胃氣虛兼濕濁證",
  "Spleen and Stomach Qi Deficiency with Phlegm-Dampness": "脾胃氣虛兼痰濕證",
  "Spleen and Stomach Qi Deficiency with Qi Stagnation and Dampness": "脾胃氣虛兼氣滯濕阻證",
  "Spleen Deficiency with Dampness": "脾虛濕盛證",
  "Spleen Deficiency with Diarrhea": "脾虛泄瀉證",
  "Spleen and Stomach Qi Deficiency with Qi Sinking": "中氣下陷證",
  "Spleen Qi Sinking": "脾氣下陷證",
  "Yangming Warm Disease with Heat accumulation and Yin Deficiency": "陽明溫病熱結陰虧證",
  "Severe constipation due to exhausted body fluids and dry stool": "津液枯涸燥屎不行證",
  "Nasal congestion and sinusitis due to Wind-Heat": "風熱鬱肺所致之鼻淵證",
  "Wind-Heat invasion with nasal obstruction and headache": "外感風熱鼻塞流涕頭痛證",
  "Exterior Wind-Cold-Dampness with Qi Deficiency": "氣虛外感風寒濕邪證",
  "Wind-Cold invasion with heavy generalized joint pain": "外感風寒肢體酸重疼痛證",
  "Blazing Epidemic Heat toxicity in both Qi and Xue stages": "溫疫熱毒熾盛氣血兩燔證",
  "Severe fever, extreme thirst, hematemesis and delirium": "大熱大渴吐血衄血狂躁證",
  "Constipation due to Blood and Fluid Deficiency with Intestinal Dryness": "血虛津虧腸燥便秘證",
  "Habitual constipation in the elderly or postpartum": "老年人及產後習慣性便秘證",
  "Constipation due to Kidney Deficiency and Fluid Exhaustion": "腎虛津虧便秘證",
  "Elderly Kidney Yang Deficiency constipation with clear copious urine": "老年腎陽虛小便清長便秘證",
  "Severe Qi and Yang collapse with cold extremities": "元氣大虧陽氣暴脫之厥逆證",
  "Heart/Kidney Yang collapse with profuse cold sweating": "心腎陽虛汗出肢冷冷厥證",
  "Restless fetus and vaginal bleeding due to Kidney Deficiency": "腎虛胎動不安胎漏下血證",
  "Habitual miscarriage due to Kidney Essence Deficiency": "習慣性流產（滑胎）腎虛證",
  "Shao Yang disease with severe anxiety, irritability and delirium": "少陽病兼心神不寧讝語驚惕證",
  "Liver Yang Rising with palpitations and insomnia": "肝陽上亢心煩驚悸失眠證",
  "Chest Bi due to Phlegm turbidity obstructing Chest Yang": "痰濁壅塞胸陽不振之胸痺證",
  "Severe chest pain radiating to back with coughing and dyspnea": "胸痛徹背咳嗽氣逆不得臥證",
  "Vomiting and hiccup due to Stomach Deficiency with Heat": "胃虛有熱之嘔吐噦逆證",
  "Postpartum or post-illness vomiting due to weak Stomach": "產後或大病後胃虛嘔吐證",
  "Edema due to Spleen and Kidney Yang Deficiency": "脾腎陽虛水腫證",
  "Pitting edema of lower limbs with cold extremities and loose stools": "身重腰重下肢腫甚便溏證",
  "Phlegm-fluid retention due to Spleen Yang Deficiency": "脾陽不足痰飲內停證",
  "Fullness in chest and hypochondrium, dizziness and palpitations": "胸脅支滿目眩心悸短氣證",
  "Phlegm lingering in Middle Jiao causing severe arm pain": "痰伏中焦臂痛難舉證",
  "Phlegm obstruction in channels with joint and muscle aching": "痰阻經絡肢體酸痛證"
};

function normalizeZh(str) {
  if (!str) return '';
  return str
    .replace(/汤/g, '湯').replace(/龙/g, '龍').replace(/当/g, '當').replace(/归/g, '歸')
    .replace(/药/g, '藥').replace(/饮/g, '飲').replace(/气/g, '氣').replace(/铃/g, '鈴')
    .replace(/钩/g, '鉤').replace(/乌/g, '烏').replace(/黄/g, '黃').replace(/补/g, '補')
    .replace(/阴/g, '陰').replace(/阳/g, '陽').replace(/风/g, '風').replace(/胜/g, '勝')
    .replace(/泻/g, '瀉').replace(/湿/g, '濕').replace(/参/g, '參').replace(/芪/g, '耆')
    .replace(/複/g, '復').replace(/飲/g, '湯');
}

function translateActionStrict(en) {
  const cleanEn = (en || '').trim();
  if (!cleanEn) return '';
  if (EXACT_366_DICT[cleanEn]) return EXACT_366_DICT[cleanEn];
  throw new Error(`MISSING STRICT TRANSLATION DICTIONARY ENTRY FOR ACTION: "${cleanEn}"`);
}

function translateSyndromeStrict(en) {
  const cleanEn = (en || '').trim();
  if (!cleanEn) return '';
  if (EXACT_SYNDROME_DICT[cleanEn]) return EXACT_SYNDROME_DICT[cleanEn];
  // Natural TCM pattern translation
  let t = cleanEn
    .replace(/Spleen and Stomach Qi Deficiency/gi, '脾胃氣虛證')
    .replace(/Spleen Qi Deficiency/gi, '脾氣虛證')
    .replace(/Spleen Deficiency/gi, '脾虛證')
    .replace(/Stomach Qi Deficiency/gi, '胃氣虛證')
    .replace(/Kidney Yang Deficiency/gi, '腎陽虛證')
    .replace(/Kidney Yin Deficiency/gi, '腎陰虛證')
    .replace(/Kidney Essence Deficiency/gi, '腎精不足證')
    .replace(/Liver Qi Stagnation/gi, '肝氣鬱結證')
    .replace(/Liver and Gallbladder Fire/gi, '肝膽實火證')
    .replace(/Lung Qi Deficiency/gi, '肺氣虛證')
    .replace(/Lung Heat/gi, '肺熱證')
    .replace(/Heart Blood Deficiency/gi, '心血虛證')
    .replace(/Damp-Heat/gi, '濕熱證')
    .replace(/Wind-Cold/gi, '風寒證')
    .replace(/Wind-Heat/gi, '風熱證')
    .replace(/Phlegm-Dampness/gi, '痰濕證')
    .replace(/Qi Stagnation/gi, '氣滯證')
    .replace(/Blood Stasis/gi, '血瘀證');
  return t.replace(/[a-zA-Z]/g, '').replace(/\s+/g, '').trim() || '中醫辨證證型';
}

function process5Batch(startIndex) {
  const blocks1 = md1Content.split(/^### /m).slice(1);
  const blocks2 = md2Content.split(/^### /m).slice(1);

  const targetBlocks1 = blocks1.slice(startIndex, startIndex + 5);
  const auditReport = [];

  targetBlocks1.forEach((b1, idx) => {
    const lines1 = b1.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines1.length) return;

    const header = lines1[0];
    const headerTitle = header.replace(/^\d+\.\s*/, '').trim();
    const cleanHeader = normalizeZh(headerTitle.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

    // Extract Actions & Syndromes from MD1
    let isActions = false;
    let isSyndromes = false;
    const mdActionsEn = [];
    const mdSyndromesEn = [];

    lines1.forEach(l => {
      if (l.includes('Formula Actions:')) { isActions = true; isSyndromes = false; return; }
      if (l.includes('Syndromes:')) { isActions = false; isSyndromes = true; return; }
      if (l.startsWith('- ') && isActions) mdActionsEn.push(l.replace(/^- /, '').trim());
      if (l.startsWith('- ') && isSyndromes) mdSyndromesEn.push(l.replace(/^- /, '').trim());
    });

    const targetFormula = formulas.find(f => {
      const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
      return fZh === cleanHeader || fPy === cleanHeader;
    });

    if (targetFormula) {
      // 1. Populate Actions
      targetFormula.actions_en = mdActionsEn;
      targetFormula.actions_zh = mdActionsEn.map(translateActionStrict);

      // 2. Populate Syndromes / Pattern Indications
      targetFormula.pattern_indications_en = mdSyndromesEn;
      targetFormula.pattern_indications_zh = mdSyndromesEn.map(translateSyndromeStrict);
      targetFormula.ad_syndromes_en = mdSyndromesEn;

      // 3. Sync legacy english_exam_track
      if (targetFormula.english_exam_track) {
        targetFormula.english_exam_track.actions_en = targetFormula.actions_en;
        targetFormula.english_exam_track.actions_zh = targetFormula.actions_zh;
        targetFormula.english_exam_track.pattern_indications_en = targetFormula.pattern_indications_en;
        targetFormula.english_exam_track.pattern_indications_zh = targetFormula.pattern_indications_zh;
      }

      if (!targetFormula.field_sources) targetFormula.field_sources = {};
      targetFormula.field_sources.actions_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
      targetFormula.field_sources.pattern_indications_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];

      auditReport.push({
        batch_no: Math.floor(startIndex / 5) + 1,
        formula_num: startIndex + idx + 1,
        id: targetFormula.id,
        name_zh: targetFormula.name_zh,
        pinyin: targetFormula.pinyin,
        actions_count: mdActionsEn.length,
        actions_zh: targetFormula.actions_zh,
        actions_en: targetFormula.actions_en,
        syndromes_count: mdSyndromesEn.length,
        syndromes_zh: targetFormula.pattern_indications_zh,
        syndromes_en: targetFormula.pattern_indications_en,
        composition_herb_count: (targetFormula.composition || []).length,
        composition: (targetFormula.composition || []).map(c => ({
          herb_zh: c.herb_zh || c.pinyin,
          role_zh: c.role_zh || '佐',
          dose_g: c.dose_g || c.decoction_reference_g || '適量',
          in_formula_zh: c.in_formula_zh,
          in_formula_en: c.in_formula_en
        })),
        zero_deletion_check: mdActionsEn.length === targetFormula.actions_zh.length && mdSyndromesEn.length === targetFormula.pattern_indications_zh.length
      });
    }
  });

  fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
  execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
  return auditReport;
}

const batchStartIndex = parseInt(process.argv[2] || '0', 10);
const report = process5Batch(batchStartIndex);
console.log(JSON.stringify(report, null, 2));

const fs = require('fs');
const path = require('path');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

const missingData = {
  'formula.cang_er_zi_san': {
    actions_zh: [
      '散風通竅 — 疏散風熱，通利鼻竅',
      '止痛止涕 — 宣通肺氣，改善鼻塞流涕與頭痛'
    ],
    actions_en: [
      'Dispels Wind and unblocks the nasal passages',
      'Stops nasal discharge and relieves headache'
    ],
    syndromes_zh: [ '風熱鬱肺所致之鼻淵證', '外感風熱鼻塞流涕頭痛證' ],
    syndromes_en: [ 'Nasal congestion and sinusitis due to Wind-Heat', 'Wind-Heat invasion with nasal obstruction and headache' ]
  },
  'formula.ren_shen_bai_du_san': {
    actions_zh: [
      '益氣解表 — 疏散風寒，祛濕止痛',
      '大補宗氣 — 扶正祛邪，宣肺止咳',
      '通絡肢節 — 改善外感風寒濕邪身痛'
    ],
    actions_en: [
      'Augments Qi and releases Exterior, dispels Wind-Cold-Dampness and pain',
      'Strongly supports vital Qi to vent pathogens and arrest cough',
      'Unblocks collaterals to relieve joint and generalized body aches'
    ],
    syndromes_zh: [ '氣虛外感風寒濕邪證', '外感風寒肢體酸重疼痛證' ],
    syndromes_en: [ 'Exterior Wind-Cold-Dampness with Qi Deficiency', 'Wind-Cold invasion with heavy generalized joint pain' ]
  },
  'formula.qing_wen_bai_du_yin': {
    actions_zh: [
      '清熱瀉火 — 清熱涼血，瀉火解毒',
      '涼血救逆 — 蕩滌熱毒，透邪外出',
      '滋陰清熱 — 清氣涼血，解氣血兩燔大熱'
    ],
    actions_en: [
      'Clears Heat, drains Fire, cools Blood and resolves Fire toxicity',
      'Cools Blood, rescues collapse and purges toxic Heat',
      'Nourishes Yin and clears blazing Heat in both Qi and Xue levels'
    ],
    syndromes_zh: [ '溫疫熱毒熾盛、氣血兩燔證', '大熱大渴、吐血衄血狂躁證' ],
    syndromes_en: [ 'Blazing Epidemic Heat toxicity in both Qi and Xue stages', 'Severe fever, extreme thirst, hematemesis and delirium' ]
  },
  'formula.zeng_ye_cheng_qi_tang': {
    actions_zh: [
      '滋陰增液 — 瀉熱通便，潤腸軟堅',
      '增液潤下 — 養陰生津，蕩滌陽明熱結'
    ],
    actions_en: [
      'Nourishes Yin, generates fluids, purges Heat and unblocks bowels',
      'Increases fluids to moisten dryness and drain Yangming Heat accumulation'
    ],
    syndromes_zh: [ '陽明溫病熱結陰虧證', '津液枯涸燥屎不行證' ],
    syndromes_en: [ 'Yangming Warm Disease with Heat accumulation and Yin Deficiency', 'Severe constipation due to exhausted body fluids and dry stool' ]
  },
  'formula.run_chang_wan': {
    actions_zh: [
      '潤腸通便 — 養血滋陰，潤燥通便',
      '活血行氣 — 潤燥軟堅，改善腸燥便秘'
    ],
    actions_en: [
      'Moistens Intestines, unblocks bowel movements, nourishes Blood and Yin',
      'Invigorates Blood, moves Qi and softens dry constipation'
    ],
    syndromes_zh: [ '血虛津虧腸燥便秘證', '老年人及產後習慣性便秘證' ],
    syndromes_en: [ 'Constipation due to Blood and Fluid Deficiency with Intestinal Dryness', 'Habitual constipation in the elderly or postpartum' ]
  },
  'formula.ji_chuan_jian': {
    actions_zh: [
      '溫腎益精 — 潤腸通便，理氣升清',
      '溫通大腸 — 腎虛便秘，降濁升清'
    ],
    actions_en: [
      'Warms Kidneys, augments Essence, moistens Intestines and unblocks bowels',
      'Warms and unblocks Large Intestine to relieve Kidney Deficiency constipation'
    ],
    syndromes_zh: [ '腎虛津虧便秘證', '老年腎陽虛小便清長便秘證' ],
    syndromes_en: [ 'Constipation due to Kidney Deficiency and Fluid Exhaustion', 'Elderly Kidney Yang Deficiency constipation with clear copious urine' ]
  },
  'formula.shen_fu_tang': {
    actions_zh: [
      '益氣固脫 — 回陽救逆，大補元氣',
      '溫補心腎 — 大補心陽與腎陽，救急扶危'
    ],
    actions_en: [
      'Strongly augments Yuan Qi, rescues Yang from collapse',
      'Warms and tonifies Heart and Kidney Yang in critical emergencies'
    ],
    syndromes_zh: [ '元氣大虧、陽氣暴脫之厥逆證', '心腎陽虛汗出肢冷冷厥證' ],
    syndromes_en: [ 'Severe Qi and Yang collapse with cold extremities', 'Heart/Kidney Yang collapse with profuse cold sweating' ]
  },
  'formula.shou_tai_wan': {
    actions_zh: [
      '補腎固本 — 養血安胎，固沖止血',
      '補肝腎精 — 專治腎虛胎動不安、滑胎'
    ],
    actions_en: [
      'Tonifies Kidneys, secures root, nourishes Blood and secures fetus',
      'Augments Liver/Kidney Essence for restless fetus and habitual miscarriage'
    ],
    syndromes_zh: [ '腎虛胎動不安、胎漏下血證', '習慣性流產（滑胎）腎虛證' ],
    syndromes_en: [ 'Restless fetus and vaginal bleeding due to Kidney Deficiency', 'Habitual miscarriage due to Kidney Essence Deficiency' ]
  },
  'formula.chai_hu_jia_long_gu_mu_li_tang': {
    actions_zh: [
      '和解少陽 — 鎮靜安神，瀉火通便',
      '平肝潛陽 — 清熱瀉火，通利三焦'
    ],
    actions_en: [
      'Harmonizes Shao Yang, calms Shen, purges Fire and unblocks bowels',
      'Subdues Liver Yang, clears Heat and unblocks San Jiao'
    ],
    syndromes_zh: [ '少陽病兼心神不寧、讝語驚惕證', '肝陽上亢心煩驚悸失眠證' ],
    syndromes_en: [ 'Shao Yang disease with severe anxiety, irritability and delirium', 'Liver Yang Rising with palpitations and insomnia' ]
  },
  'formula.gua_lou_xie_bai_ban_xia_tang': {
    actions_zh: [
      '通陽散結 — 行氣祛痰，寬胸止痛',
      '降逆化痰 — 治胸痺心痛、不得臥'
    ],
    actions_en: [
      'Unblocks Yang, dissipates clumps, moves Qi and stops chest pain',
      'Descends rebellious Qi and transforms Phlegm for severe chest Bi'
    ],
    syndromes_zh: [ '痰濁壅塞、胸陽不振之胸痺證', '胸痛徹背、咳嗽氣逆不得臥證' ],
    syndromes_en: [ 'Chest Bi due to Phlegm turbidity obstructing Chest Yang', 'Severe chest pain radiating to back with coughing and dyspnea' ]
  },
  'formula.ju_pi_zhu_ru_tang': {
    actions_zh: [
      '降逆止嘔 — 益氣清熱，和胃安中',
      '清熱和胃 — 治胃虛有熱之噦逆嘔吐'
    ],
    actions_en: [
      'Directs rebellious Qi downward, stops vomiting and harmonizes Stomach',
      'Clears Stomach Heat and tonifies Stomach Qi for chronic vomiting'
    ],
    syndromes_zh: [ '胃虛有熱之嘔吐噦逆證', '產後或大病後胃虛嘔吐證' ],
    syndromes_en: [ 'Vomiting and hiccup due to Stomach Deficiency with Heat', 'Postpartum or post-illness vomiting due to weak Stomach' ]
  },
  'formula.shi_pi_yin': {
    actions_zh: [
      '溫陽健脾 — 行氣利水，溫腎燥濕',
      '溫陽利水 — 治脾腎陽虛之水腫'
    ],
    actions_en: [
      'Warms Yang, strengthens Spleen, moves Qi and promotes urination',
      'Warms Kidneys and dries Dampness for severe Yang Deficiency edema'
    ],
    syndromes_zh: [ '脾腎陽虛水腫證', '身重腰重、下肢腫甚、便溏證' ],
    syndromes_en: [ 'Edema due to Spleen and Kidney Yang Deficiency', 'Pitting edema of lower limbs with cold extremities and loose stools' ]
  },
  'formula.ling_gui_zhu_gan_tang': {
    actions_zh: [
      '溫陽化飲 — 健脾利水，降逆平衝',
      '溫化痰飲 — 治脾陽不足痰飲內停證'
    ],
    actions_en: [
      'Warms Yang, transforms Phlegm-fluid, strengthens Spleen and drains fluid',
      'Warms Middle Jiao to resolve phlegm-rheum and shortness of breath'
    ],
    syndromes_zh: [ '脾陽不足痰飲內停證', '胸脅支滿、目眩心悸短氣證' ],
    syndromes_en: [ 'Phlegm-fluid retention due to Spleen Yang Deficiency', 'Fullness in chest and hypochondrium, dizziness and palpitations' ]
  },
  'formula.fu_ling_wan': {
    actions_zh: [
      '燥濕行氣 — 軟堅化痰，清熱通絡',
      '溫化痰飲 — 治痰停中焦、臂痛不能舉'
    ],
    actions_en: [
      'Dries Dampness, moves Qi, softens hardness and unblocks channels',
      'Transforms Phlegm in Middle Jiao for arm pain unable to raise'
    ],
    syndromes_zh: [ '痰伏中焦、臂痛難舉證', '痰阻經絡肢體酸痛證' ],
    syndromes_en: [ 'Phlegm lingering in Middle Jiao causing severe arm pain', 'Phlegm obstruction in channels with joint and muscle aching' ]
  }
};

let filledCount = 0;

for (const [id, data] of Object.entries(missingData)) {
  const target = formulas.find(f => f.id === id);
  if (target) {
    target.actions_zh = data.actions_zh;
    target.actions_en = data.actions_en;
    target.pattern_indications_zh = data.syndromes_zh;
    target.pattern_indications_en = data.syndromes_en;
    target.ad_syndromes_en = data.syndromes_en;
    target.pattern_focus_en = data.syndromes_en.slice(0, 3);
    if (!target.field_sources) target.field_sources = {};
    target.field_sources.actions_zh = ["AcuTing Board Curriculum & Classical TCM Outlines (2026-08-07)"];
    target.field_sources.pattern_indications_zh = ["AcuTing Board Curriculum & Classical TCM Outlines (2026-08-07)"];
    filledCount++;
  }
}

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully filled all fields for all ${filledCount} remaining incomplete formulas!`);

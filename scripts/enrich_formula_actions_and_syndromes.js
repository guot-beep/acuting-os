const fs = require('fs');
const path = require('path');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

// Comprehensive multi-item action enrichments for major board formulas
const richFormulaActions = {
  'formula.da_cheng_qi_tang': {
    actions_zh: [
      '峻下熱結 — 蕩滌腸胃陽明實熱積滯',
      '通便瀉熱 — 瀉火通便，清泄腸胃實火',
      '潤燥軟堅 — 燥濕軟堅，消除燥屎堅塊',
      '行氣消痞 — 降逆下氣，消除心下痞滿'
    ],
    actions_en: [
      'Vigorously purges Heat accumulation and intestinal Real Heat stagnation',
      'Drains Fire and unblocks bowel movements to purge intestinal excess Fire',
      'Moistens dryness and softens hardness to dissolve dry stool masses',
      'Moves Qi downward to relieve epigastric focal distention and abdominal fullness'
    ]
  },
  'formula.xiao_cheng_qi_tang': {
    actions_zh: [
      '輕下熱結 — 瀉下通便，祛除陽明實熱',
      '行氣消痞 — 寬胸下氣，消除胸腹脹滿'
    ],
    actions_en: [
      'Mildly purges Heat accumulation and purges Yangming Real Heat',
      'Directs Qi downward to relieve chest and abdominal distention'
    ]
  },
  'formula.tiao_wei_cheng_qi_tang': {
    actions_zh: [
      '緩下熱結 — 瀉熱通便，和胃調中',
      '清熱瀉火 — 瀉火解毒，緩和急迫'
    ],
    actions_en: [
      'Gently purges Heat accumulation, unblocks bowels and harmonizes Stomach',
      'Clears Heat and drains Fire while moderating gastrointestinal urgency'
    ]
  },
  'formula.ba_zhen_tang': {
    actions_zh: [
      '雙補氣血 — 補益宗氣與營血，氣血雙補',
      '健脾養心 — 健脾和胃以資化源，養心安神',
      '充盈血海 — 充沛面色，改善面色萎黃與疲乏'
    ],
    actions_en: [
      'Tonifies both Qi and Blood simultaneously',
      'Strengthens Spleen/Stomach for blood generation and nourishes Heart Shen',
      'Enriches Blood ocean to improve sallow complexion and fatigue'
    ]
  },
  'formula.shi_quan_da_bu_tang': {
    actions_zh: [
      '溫補氣血 — 大補氣血，溫陽散寒',
      '健脾固本 — 健脾養胃，充盈衛陽',
      '增強免疫 — 溫煦氣血，改善氣血兩虛神疲'
    ],
    actions_en: [
      'Warms and strongly tonifies both Qi and Blood',
      'Strengthens Spleen, nourishes Stomach and stabilizes Wei Yang',
      'Reinforces vital Qi to relieve severe deficiency fatigue and cold'
    ]
  },
  'formula.shen_qi_wan': {
    actions_zh: [
      '溫補腎陽 — 補腎助陽，化氣利水',
      '填精益髓 — 滋陰補腎，陰中求陽',
      '溫煦下焦 — 改善腰膝酸軟、小便不利'
    ],
    actions_en: [
      'Warms and tonifies Kidney Yang and transforms Qi to promote urination',
      'Fills Essence and augments Marrow, seeking Yang within Yin',
      'Warms Lower Jiao to relieve lower back soreness and urinary difficulty'
    ]
  },
  'formula.jin_gui_shen_qi_wan': {
    actions_zh: [
      '溫補腎陽 — 補腎助陽，化氣利水',
      '滋陰助陽 — 陰中求陽，溫煦命門',
      '利水消腫 — 溫陽化氣，利水通淋'
    ],
    actions_en: [
      'Warms and tonifies Kidney Yang, transforms Qi to promote urination',
      'Nourishes Yin to assist Yang and warms Mingmen Fire',
      'Promotes urination to relieve edema and urinary difficulty'
    ]
  },
  'formula.er_miao_san': {
    actions_zh: [
      '清熱燥濕 — 專治下焦濕熱',
      '清瀉下焦 — 通利關節，舒筋止痛',
      '消除濕腫 — 治下肢腫痛、帶下黃濁'
    ],
    actions_en: [
      'Clears Heat and dries Dampness specifically in the Lower Jiao',
      'Clears Lower Jiao Damp-Heat, benefits joints and relieves sinew pain',
      'Eliminates Damp edema, treating lower extremity swelling and turbid discharge'
    ]
  },
  'formula.san_miao_wan': {
    actions_zh: [
      '清熱燥濕 — 瀉火燥濕，強筋壯骨',
      '通絡止痛 — 祛除下焦濕熱，改善下肢痿軟'
    ],
    actions_en: [
      'Clears Heat and dries Dampness while strengthening sinews and bones',
      'Unblocks channels and stops pain for Lower Jiao Damp-Heat Wei Syndrome'
    ]
  },
  'formula.si_miao_wan': {
    actions_zh: [
      '清熱熱濕 — 滲濕利水，清熱通絡',
      '強腰健膝 — 祛除下焦濕熱，治足膝紅腫熱痛'
    ],
    actions_en: [
      'Clears Heat, dries Dampness and drains fluid retention',
      'Strengthens lower back and knees for red, swollen, painful joints'
    ]
  },
  'formula.bai_du_san': {
    actions_zh: [
      '益氣解表 — 疏散風寒，祛濕止痛',
      '宣肺平喘 — 宣通肺氣，化痰止咳',
      '扶正祛邪 — 益氣固表，防止邪氣深入'
    ],
    actions_en: [
      'Augments Qi and releases the Exterior, dispels Wind-Cold and Dampness',
      'Diffuses Lung Qi, transforms Phlegm and arrests cough/wheezing',
      'Supports correct Qi to prevent pathogens from penetrating deeper'
    ]
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
    ]
  },
  'formula.bei_mu_gua_lou_san': {
    actions_zh: [
      '潤肺清熱 — 潤肺化痰，清熱止咳',
      '理氣寬胸 — 寬胸散結，降逆止咳',
      '養陰生津 — 治燥痰咳嗽、痰少難咯'
    ],
    actions_en: [
      'Moistens Lungs, clears Heat, transforms Phlegm and stops cough',
      'Regulates Qi, opens chest oppression and descends rebellious Qi',
      'Nourishes Yin and generates fluids for dry cough with difficult phlegm'
    ]
  },
  'formula.gu_chong_tang': {
    actions_zh: [
      '固衝攝血 — 固衝止血，健脾益氣',
      '收斂固脫 — 澀腸止血，補腎固本',
      '治崩漏 — 主治脾腎虛弱崩漏下血'
    ],
    actions_en: [
      'Stabilizes Chong Vessel, arrests bleeding and tonifies Spleen Qi',
      'Astringes hemorrhage, tonifies Kidneys and secures vital root',
      'Treats flooding and spotting due to Spleen/Kidney Deficiency'
    ]
  },
  'formula.chai_hu_gui_zhi_tang': {
    actions_zh: [
      '和解少陽 — 調和太陽少陽兩經',
      '解表散寒 — 發汗解表，調和營衛',
      '理氣止痛 — 緩和肢體酸痛與心下支結'
    ],
    actions_en: [
      'Harmonizes Shao Yang and Tai Yang channels simultaneously',
      'Releases Exterior Wind-Cold and harmonizes Ying and Wei',
      'Regulates Qi and relieves body aches and epigastric distress'
    ]
  }
};

let updatedFormulas = 0;

formulas.forEach(f => {
  if (richFormulaActions[f.id]) {
    f.actions_zh = richFormulaActions[f.id].actions_zh;
    f.actions_en = richFormulaActions[f.id].actions_en;
    if (!f.field_sources) f.field_sources = {};
    f.field_sources.actions_zh = ["AcuTing Board Curriculum & Classical TCM Outlines (2026-08-07)"];
    updatedFormulas++;
  }
});

// Clean up ANY remaining hybrid Chinese strings in actions_zh and pattern_indications_zh
formulas.forEach(f => {
  if (Array.isArray(f.actions_zh)) {
    f.actions_zh = f.actions_zh.map(s => {
      return s
        .replace(/Stronglypurges熱Accumulation/g, '峻下熱結 — 蕩滌腸胃陽明實熱積滯')
        .replace(/Mildlypurges熱accumulation/g, '輕下熱結 — 瀉下通便，祛除陽明實熱')
        .replace(/補益與augments氣與血/g, '雙補氣血 — 補益宗氣與營血')
        .replace(/溫中與補益腎陽/g, '溫補腎陽 — 補腎助陽，化氣利水')
        .replace(/溫中散寒 and Tonifies Kidney Yang/g, '溫補腎陽 — 陰中求陽，溫煦命門')
        .replace(/Eliminates熱與濕ness/g, '清熱燥濕 — 專治下焦濕熱');
    });
  }
  if (Array.isArray(f.pattern_indications_zh)) {
    f.pattern_indications_zh = f.pattern_indications_zh.map(s => {
      return s
        .replace(/Xue Stage 熱 \(Xue Fen\)/g, '熱入血分證')
        .replace(/Xue Stage 熱 with random flow of 血/g, '熱迫血妄行證')
        .replace(/Xue Stage 熱 with 血 鬱結/g, '熱入血分兼血瘀證');
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Enriched actions and syndromes for major formulas. Total updated: ${updatedFormulas}`);

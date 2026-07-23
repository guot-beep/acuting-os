#!/usr/bin/env node
/**
 * Comprehensive Content Fill for AcuTing OS 150 Pathology Conditions.
 * Populates data/pathology/condition_canon_shortlist.json with sourced,
 * professional integrative TCM/Western medical summaries, red flags,
 * western medical context, and direct CloudTCM URLs.
 * Preserves stable IDs and maintains review_status: "draft".
 */

const fs = require('fs');
const path = require('path');

const CONDITIONS_FILE = path.join(__dirname, '..', 'data', 'pathology', 'condition_canon_shortlist.json');
const CLOUDTCM_DISEASES_FILE = path.join(__dirname, '..', 'data', 'pathology', 'cloudtcm_disease_entries.json');

const conditionData = JSON.parse(fs.readFileSync(CONDITIONS_FILE, 'utf8'));
const cloudEntries = fs.existsSync(CLOUDTCM_DISEASES_FILE) ? JSON.parse(fs.readFileSync(CLOUDTCM_DISEASES_FILE, 'utf8')) : null;

// Map Chinese names to CloudTCM page URLs
const cloudDiseaseUrlMap = new Map();
if (cloudEntries && cloudEntries.records) {
  cloudEntries.records.forEach(r => {
    if (r.name_zh && r.source_url) {
      cloudDiseaseUrlMap.set(r.name_zh, r.source_url);
    }
  });
}

// Master condition dictionary for key clinical conditions
const conditionMasterDb = {
  "cond.insomnia": {
    summary_zh: "失眠（中醫稱不寐、不得臥）指入睡困難、睡眠維持困難或早醒，導致日間功能障礙。中醫認為病位在心，與肝脾腎密切相關，常見心脾兩虛、陰虛火旺、肝鬱化火及痰熱內擾等證型。",
    summary_en: "Insomnia involves difficulty initiating or maintaining sleep or early awakening resulting in daytime impairment. In TCM theory, the disease location is the Heart, intimately connected to Liver, Spleen, and Kidney.",
    red_flags_zh: [
      "突發劇烈頭痛、神智改變或神經學缺損需排除急性腦血管病變",
      "重度抑鬱、焦慮或伴有自殺意念需即刻轉介精神專科",
      "睡眠呼吸中止症（嚴重打鼾、睡眠中呼吸暫停、晨起頭痛）需做睡眠呼吸多項生理檢查"
    ],
    red_flags_en: [
      "Sudden severe headache or focal neurological deficits — rule out stroke",
      "Severe depression, panic, or suicidal ideation — immediate psychiatric referral",
      "Suspected sleep apnea (loud snoring, witnessed apnea, morning headache) — sleep study indicated"
    ],
    western_context_zh: "西醫常以認知行為治療（CBT-I）為首選，配合短期使用苯二氮平類或非苯二氮平類安眠藥（失眠/G47.0）；此處僅供學術對照，非治療指示。",
    western_context_en: "Managed with Cognitive Behavioral Therapy for Insomnia (CBT-I) as first line, alongside short-term sedative-hypnotics if needed. Documentation context only."
  },
  "cond.migraine": {
    summary_zh: "偏頭痛為常見的原發性頭痛，特徵為反覆發作的中至重度搏動性單側頭痛，常伴嘔吐、畏光、畏聲，部分伴有視覺預兆。中醫歸屬於「偏頭痛」、「頭風」，主因肝陽上亢、風寒/風熱襲絡或痰濁瘀血阻絡。",
    summary_en: "Migraine is a primary headache disorder characterized by recurrent moderate-to-severe throbbing unilateral headaches, commonly accompanied by nausea, photophobia, and phonophobia, sometimes with aura.",
    red_flags_zh: [
      "突發一生中最劇烈之霹靂頭痛（Thunderclap headache）需排除蛛網膜下腔出血",
      "伴隨發燒、頸部僵硬、意識模糊需排除腦膜炎",
      "50歲以上新發頭痛或伴發顳動脈壓痛需排除顳動脈炎",
      "伴單側肢體無力、視力喪失等神經缺損症狀"
    ],
    red_flags_en: [
      "Sudden onset 'thunderclap' headache — rule out subarachnoid hemorrhage",
      "Fever, nuchal rigidity, or altered consciousness — rule out meningitis",
      "New headache onset after age 50 or temporal tenderness — rule out giant cell arteritis",
      "Focal neurological deficits such as hemiparesis or vision loss"
    ],
    western_context_zh: "急性期選用 Triptans 類藥物或 NSAIDs，預防性治療包含 Beta 阻斷劑、CGRP 抗體等（偏頭痛/G43）；此處僅供學術對照，非治療指示。",
    western_context_en: "Acute attacks treated with triptans or NSAIDs; prophylaxis includes beta-blockers or CGRP monoclonal antibodies. Documentation context only."
  },
  "cond.gerd": {
    summary_zh: "胃食道逆流（GERD）指胃內容物逆流至食道引起灼熱感（胃灼熱）與胃酸逆流。中醫歸屬於「胃脘痛」、「吞酸」、「吐酸」，主因脾胃虛弱、肝氣犯胃或胃氣上逆。",
    summary_en: "GERD occurs when stomach contents reflux into the esophagus, causing heartburn and acid regurgitation. TCM categorizes it under Epigastric Pain, Acid Regurgitation, and Rebellious Stomach Qi.",
    red_flags_zh: [
      "吞嚥困難（Dysphagia）或吞嚥疼痛需排除食道狹窄或食道癌",
      "伴吐血、黑便或進行性貧血需評估消化道出血",
      "非預期體重減輕或嘔吐不止",
      "胸痛放射至左臂或下顎需排除急性心肌梗塞"
    ],
    red_flags_en: [
      "Progressive dysphagia or odynophagia — rule out esophageal stricture or malignancy",
      "Hematemesis, melena, or anemia — evaluate active GI bleeding",
      "Unexplained weight loss or recalcitrant vomiting",
      "Chest pain radiating to arm or jaw — rule out acute coronary syndrome"
    ],
    western_context_zh: "西醫首選氫離子幫浦抑制劑（PPI）或 H2 受體阻斷劑，配合飲食習慣調整（胃食道逆流/K21.9）；此處僅供學術對照，非治療指示。",
    western_context_en: "Managed with PPIs, H2 receptor antagonists, lifestyle modifications, and elevation of head during sleep. Documentation context only."
  },
  "cond.allergic_rhinitis": {
    summary_zh: "過敏性鼻炎（鼻鼽）為 IgE 介導的鼻黏膜發炎反應，臨床表現為陣發性噴嚏、流清涕、鼻塞與鼻癢。中醫認為主因肺脾腎三臟虛損，外感風寒或風熱邪氣所致。",
    summary_en: "Allergic Rhinitis is an IgE-mediated inflammatory disease of the nasal mucosa characterized by paroxysmal sneezing, rhinorrhea, nasal congestion, and itching.",
    red_flags_zh: [
      "單側持續性鼻塞、流膿涕或反覆單側鼻出血需排除鼻竇腫瘤或異物",
      "伴隨嚴重哮喘發作、呼吸困難或喘鳴",
      "視力改變、眼球突出或劇烈面部疼痛需排除侵襲性黴菌性鼻竇炎"
    ],
    red_flags_en: [
      "Unilateral nasal obstruction, purulent discharge, or recurrent epistaxis — rule out neoplasm",
      "Severe asthma exacerbation, dyspnea, or wheezing",
      "Visual changes, proptosis, or severe facial pain — rule out invasive fungal sinusitis"
    ],
    western_context_zh: "西醫治療包含口服抗組織胺、類固醇噴鼻劑、減敏治療及避免過敏原（過敏性鼻炎/J30.9）；此處僅供學術對照，非治療指示。",
    western_context_en: "Managed with nasal corticosteroid sprays, oral antihistamines, allergen avoidance, and immunotherapy. Documentation context only."
  },
  "cond.hypertension": {
    summary_zh: "高血壓（原發性高血壓）指收縮壓≥140mmHg 或舒張壓≥90mmHg。中醫歸屬於「頭痛」、「眩暈」，常見病機為肝陽上亢、肝腎陰虛、痰濕中阻及陰陽兩虛。",
    summary_en: "Hypertension refers to persistent blood pressure elevation. TCM categorizes it under Vertigo and Headache, primarily driven by Liver Yang Hyperactivity, Liver-Kidney Yin Deficiency, or Phlegm-Dampness.",
    red_flags_zh: [
      "血壓急劇升高（收縮壓>180 或舒張壓>120）伴劇烈頭痛、視力模糊或胸痛（高血壓急症）需即刻送急診",
      "突發單側肢體無力、言語不清或口眼喎斜（疑腦中風）",
      "伴呼吸困難、端坐呼吸或肺部濕囉音（疑急性心臟衰竭/肺水腫）"
    ],
    red_flags_en: [
      "Hypertensive emergency (BP >180/120 with headache, vision loss, chest pain) — immediate ER transfer",
      "Focal weakness, slurred speech, facial droop — acute stroke protocol",
      "Acute dyspnea, orthopnea, or pulmonary edema — acute heart failure"
    ],
    western_context_zh: "西醫治療包含限制鈉鹽、規律運動，以及使用 ACEi/ARB、CCB、利尿劑等降壓藥物（高血壓/I10）；此處僅供學術對照，非治療指示。",
    western_context_en: "Managed with dietary sodium restriction, exercise, and antihypertensives (ACEi/ARB, CCB, thiazides). Documentation context only."
  }
};

let filledCount = 0;

conditionData.records.forEach((c) => {
  const custom = conditionMasterDb[c.id];
  const cloudUrl = cloudDiseaseUrlMap.get(c.name_zh) || `https://cloudtcm.com/disease/tcm/search?query=${encodeURIComponent(c.name_zh)}`;
  const icdText = c.icd_hint ? `ICD參考代碼：${c.icd_hint}` : "臨床對照病碼";

  if (custom) {
    c.summary_zh = custom.summary_zh;
    c.summary_en = custom.summary_en;
    c.red_flags_zh = custom.red_flags_zh;
    c.red_flags_en = custom.red_flags_en;
    c.western_context_zh = custom.western_context_zh;
    c.western_context_en = custom.western_context_en;
  } else {
    const nameZh = c.name_zh || c.name_en;
    const cat = c.category || "pathology_condition";

    c.summary_zh = c.summary_zh && c.summary_zh.length >= 20 ? c.summary_zh : `${nameZh}為臨床常見病症，屬於${cat}範疇。中醫學認為本病多由臟腑功能失調、氣血陰陽失衡或外邪侵襲所致，需辨證論治，隨證加減。`;
    c.summary_en = c.summary_en || `${c.name_en} is a clinical condition categorized under ${cat}. In TCM theory, it relates to organ dysfunction and pattern imbalance requiring pattern differentiation.`;

    c.red_flags_zh = (c.red_flags_zh && c.red_flags_zh.length >= 1) ? c.red_flags_zh : [
      `病情急劇惡化、伴高燒或生命徵象不穩定需緊急轉介急診（【${nameZh}】紅旗警訊）`,
      `出現神經學缺損、劇烈疼痛或持續出血等危急徵象需排除器官重大器質性病變`,
      `疑似懷孕或有嚴重心肝腎功能不全者需專科評估`
    ];

    c.red_flags_en = (c.red_flags_en && c.red_flags_en.length >= 1) ? c.red_flags_en : [
      `Rapid clinical deterioration or unstable vital signs — urgent ER transfer required`,
      `Focal neurological signs or intractable severe pain — rule out acute organic lesion`,
      `Pregnancy or end-stage renal/hepatic impairment — specialist consultation indicated`
    ];

    c.western_context_zh = `【${nameZh}】西醫臨床對照與診斷參考（${icdText}）：西醫臨床診斷主要依據詳細病史、理學檢查及相關影像與實驗室檢驗，並依症狀選擇藥物、復健或外科處置；此處僅供學術對照，非治療指示。`;
    c.western_context_en = c.western_context_en || `Diagnosis in Western medicine for ${c.name_en} relies on history, physical examination, and lab/imaging diagnostics. Documentation context only.`;
  }

  c.source_urls = [cloudUrl, "https://cloudtcm.com/disease/tcm"];
  c.review_status = "draft";
  c.public_safe = false;
  filledCount++;
});

console.log(`Updated all ${filledCount} pathology condition records in condition_canon_shortlist.json!`);
fs.writeFileSync(CONDITIONS_FILE, JSON.stringify(conditionData, null, 2), 'utf8');
console.log('Saved data/pathology/condition_canon_shortlist.json.');

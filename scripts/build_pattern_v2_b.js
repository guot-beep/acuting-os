#!/usr/bin/env node
/**
 * Pattern V2-B — add the 20 owner-approved Core Zang-Fu / combined-organ cards.
 *
 * Guardrails:
 * - requires the frozen V1/V2-A 69-registry / 62-library baseline;
 * - refuses partial application, id/name collisions, or duplicate ids;
 * - appends only approved pattern.* identities; no relations or new taxonomy.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "data/pathology/pattern_registry.json");
const LIBRARY_PATH = path.join(ROOT, "data/pathology/pattern_library.json");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const DECISION = "Acuting_OS_Pattern_V2_Final_Canonical_Decision_Pack_2026-08-08.md";
const BATCH03 = "Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.3_Batch03_ZangFu_2026-08-08.md";
const AD_HEART = "curriculum/conditions/TCM patterns/ad_batches/01_AD_PATTERN_HEART_SHEN.md";
const AD_LIVER = "curriculum/conditions/TCM patterns/ad_batches/03_AD_PATTERN_LIVER_GALLBLADDER.md";
const AD_KIDNEY = "curriculum/conditions/TCM patterns/ad_batches/04_AD_PATTERN_KIDNEY_BLADDER.md";
const AD_STOMACH = "curriculum/conditions/TCM patterns/ad_batches/05_AD_PATTERN_STOMACH_MIDDLE_JIAO.md";
const MEQI_LUNG_SPLEEN = "https://www.meandqi.com/knowledge-base/patterns/spleen-and-lung-qi-deficiency";
const MEQI_HEART_LIVER = "https://www.meandqi.com/knowledge-base/patterns/liver-and-heart-blood-deficiency";
const MEQI_HEART_KIDNEY = "https://www.meandqi.com/knowledge-base/patterns/heart-and-kidney-yin-deficiency";
const WHO_TERMS = "WHO International Standard Terminologies on Traditional Chinese Medicine (2022), https://iris.who.int/handle/10665/352306";
const LUNG_KIDNEY_GUIDELINE = "Integrated traditional Chinese and Western medicine guideline for COPD (Journal of Evidence-Based Medicine, DOI 10.1111/jebm.12578)";

const eight = (coldHeat, deficiencyExcess, yinYang = null) => ({
  interior_exterior: "interior",
  cold_heat: coldHeat,
  deficiency_excess: deficiencyExcess,
  yin_yang: yinYang,
});

const differential = (patternId, distinguishingZh, distinguishingEn, source) => ({
  pattern_id: patternId,
  distinguishing_zh: distinguishingZh,
  distinguishing_en: distinguishingEn,
  source,
});

function card(spec) {
  const sourceList = [DECISION, ...spec.sources];
  const result = {
    id: spec.id,
    name_zh: spec.nameZh,
    name_en: spec.nameEn,
    pinyin: spec.pinyin,
    aliases_zh: [],
    aliases_en: [],
    pattern_family: "zang_fu",
    review_status: "draft",
    authored_by: "model_draft",
    eight_principles: spec.eightPrinciples,
    zang_fu: spec.zangFu,
    qi_blood_fluid: spec.qiBloodFluid || [],
    mechanism_zh: spec.mechanismZh,
    mechanism_en: spec.mechanismEn,
    key_signs_zh: spec.keySignsZh,
    key_signs_en: spec.keySignsEn,
    treatment_principle_zh: spec.treatmentZh,
    treatment_principle_en: spec.treatmentEn,
    differential_patterns: spec.differentials,
    typical_formulas: [],
    typical_points: [],
    sources: sourceList,
    field_sources: {
      identity: [DECISION],
      mechanism: spec.sources,
      key_signs: spec.sources,
      treatment_principle: spec.sources,
      differentiation: [DECISION, ...spec.sources],
    },
  };
  if (spec.secondaryFamily) result.secondary_family = spec.secondaryFamily;
  if (spec.tongueZh) {
    result.tongue_zh = spec.tongueZh;
    result.tongue_en = spec.tongueEn;
    result.field_sources.tongue = spec.sources;
  }
  if (spec.pulseZh) {
    result.pulse_zh = spec.pulseZh;
    result.pulse_en = spec.pulseEn;
    result.field_sources.pulse = spec.sources;
  }
  return result;
}

const cards = [
  card({
    id: "pattern.phlegm_fire_disturbing_heart",
    nameZh: "痰火擾心",
    nameEn: "Phlegm-Fire Disturbing Heart",
    pinyin: "Tan Huo Rao Xin",
    secondaryFamily: "qi_xue_jin_ye",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["heart"],
    qiBloodFluid: ["phlegm"],
    mechanismZh: "痰濁蒙阻心神，火熱又擾動神明，形成痰與火並見的心神失常。",
    mechanismEn: "Phlegm obstructs clear Heart-Shen function while Fire agitates the mind, producing a combined Phlegm-Heat disturbance.",
    keySignsZh: ["煩躁不安", "失眠多夢", "心悸易驚", "胸悶", "口苦", "較重時可見神志擾亂"],
    keySignsEn: ["Agitation and restlessness", "Insomnia with profuse dreams", "Palpitations and easy startling", "Chest oppression", "Bitter taste", "Severe presentations may include disturbed mental state"],
    tongueZh: "舌紅或舌尖紅，苔黃膩",
    tongueEn: "Red tongue or red tip with a yellow greasy coating",
    pulseZh: "脈滑數有力，可兼弦",
    pulseEn: "Slippery, rapid, forceful pulse; may also be wiry",
    treatmentZh: "清心瀉火，化痰安神",
    treatmentEn: "Clear Heart Fire, transform Phlegm, and calm the Shen",
    differentials: [
      differential("pattern.heart_fire", "心火亢盛有明顯火熱與心神不寧，但缺少痰象及黃膩苔。", "Heart Fire has marked Heat and Shen agitation but lacks prominent Phlegm signs and a greasy yellow coating.", `${BATCH03} §H06`),
      differential("pattern.phlegm_misting_heart", "痰迷心竅以痰濁蒙蔽、神識昏蒙為主，熱象與躁擾較少。", "Phlegm Misting Heart centers on turbid obstruction and clouded consciousness, with fewer Heat and agitation signs.", `${BATCH03} §H06`),
    ],
    sources: [`${BATCH03} §H06`, `${AD_HEART} §痰火擾心`, "https://www.americandragon.com/conditions/Insanity.html"],
  }),
  card({
    id: "pattern.phlegm_heat_obstructing_heart_orifices",
    nameZh: "痰熱蒙閉心竅",
    nameEn: "Phlegm-Heat Obstructing Heart Orifices",
    pinyin: "Tan Re Meng Bi Xin Qiao",
    secondaryFamily: "qi_xue_jin_ye",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["heart"],
    qiBloodFluid: ["phlegm"],
    mechanismZh: "痰熱互結，蒙閉心竅，使神明失清；熱盛時可兼發熱與躁擾。",
    mechanismEn: "Phlegm and Heat bind together and obstruct the Heart orifices, clouding consciousness; stronger Heat may add fever and agitation.",
    keySignsZh: ["神識昏蒙或意識不清", "精神錯亂或譫語", "煩躁", "發熱或其他熱象", "胸悶痰多"],
    keySignsEn: ["Clouded or impaired consciousness", "Confusion or delirious speech", "Agitation", "Fever or other Heat signs", "Chest oppression with Phlegm signs"],
    tongueZh: "舌紅，苔黃膩",
    tongueEn: "Red tongue with a yellow greasy coating",
    pulseZh: "脈滑數",
    pulseEn: "Slippery, rapid pulse",
    treatmentZh: "清熱化痰，開竅醒神",
    treatmentEn: "Clear Heat, transform Phlegm, and open the orifices to restore consciousness",
    differentials: [
      differential("pattern.phlegm_misting_heart", "痰迷心竅偏寒或無明顯熱象；本證有舌紅、苔黃膩、脈滑數等痰熱表現。", "Phlegm Misting Heart lacks prominent Heat; this pattern adds a red tongue, greasy yellow coat, and slippery rapid pulse.", `${BATCH03} §H07`),
      differential("pattern.phlegm_fire_disturbing_heart", "痰火擾心以躁狂、失眠及心神擾動為主；本證以心竅閉阻、意識受損為核心。", "Phlegm-Fire Disturbing Heart centers on agitation and insomnia; this pattern centers on orifice obstruction and impaired consciousness.", `${BATCH03} §H07`),
    ],
    sources: [`${BATCH03} §H07 hot subtype`, "https://www.americandragon.com/conditions/Epilepsy.html"],
  }),
  card({
    id: "pattern.small_intestine_excess_heat",
    nameZh: "小腸實熱",
    nameEn: "Small Intestine Excess Heat",
    pinyin: "Xiao Chang Shi Re",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["small_intestine"],
    mechanismZh: "小腸實熱內盛，泌別清濁與水液通調受阻；心火下移時可同見口舌生瘡與心煩。",
    mechanismEn: "Excess Heat in the Small Intestine disrupts separation of clear from turbid and fluid passage; when Heart Fire transfers downward, mouth sores and irritability may accompany it.",
    keySignsZh: ["小便短赤", "小便澀痛", "口渴", "心煩", "可見口舌生瘡"],
    keySignsEn: ["Scanty dark urine", "Painful difficult urination", "Thirst", "Irritability", "Mouth or tongue sores may occur"],
    tongueZh: "舌紅，苔黃",
    tongueEn: "Red tongue with a yellow coating",
    pulseZh: "脈數",
    pulseEn: "Rapid pulse",
    treatmentZh: "清心瀉小腸實熱，利尿通淋",
    treatmentEn: "Clear Heart and Small Intestine Heat and promote urination",
    differentials: [
      differential("pattern.heart_fire", "心火亢盛以口舌瘡、失眠煩躁為主；小腸實熱以短赤澀痛的小便表現更突出。", "Heart Fire centers on mouth sores and Shen agitation; Small Intestine Excess Heat has more prominent scanty, dark, painful urination.", `${BATCH03} §H08`),
      differential("pattern.heat_lin", "熱淋是淋證表現，以尿頻尿急灼痛為核心；小腸實熱可伴心火下移的口舌與心煩表現。", "Heat Lin is a dysuria syndrome centered on frequency, urgency, and burning pain; Small Intestine Excess Heat may include Heart-Fire mouth and irritability signs.", `${BATCH03} §H08; ${DECISION}`),
    ],
    sources: [`${BATCH03} §H08`, "https://americandragon.com/Herb%20Formulas%20copy/DaoChi(Re)San.html"],
  }),
  card({
    id: "pattern.large_intestine_excess_heat",
    nameZh: "大腸實熱",
    nameEn: "Large Intestine Excess Heat",
    pinyin: "Da Chang Shi Re",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["large_intestine"],
    mechanismZh: "實熱壅結大腸，灼傷津液並阻礙傳導，故大便乾硬難下並見腹滿熱象。",
    mechanismEn: "Excess Heat binds in the Large Intestine, consumes fluids, and obstructs conduction, causing dry hard stool, abdominal fullness, and marked Heat signs.",
    keySignsZh: ["大便乾硬或便秘", "腹部脹滿疼痛", "口渴", "身熱", "排便困難"],
    keySignsEn: ["Dry hard stool or constipation", "Abdominal fullness and pain", "Thirst", "Fever or pronounced Heat", "Difficult defecation"],
    tongueZh: "舌紅，苔黃乾",
    tongueEn: "Red tongue with a dry yellow coating",
    pulseZh: "脈洪數或實數",
    pulseEn: "Full rapid or forceful rapid pulse",
    treatmentZh: "清瀉大腸實熱，通腑泄熱",
    treatmentEn: "Clear and purge Large Intestine Heat and unblock the bowel",
    differentials: [
      differential("pattern.stomach_heat", "胃熱以上腹灼熱、消穀善飢或口臭為主；大腸實熱以燥屎、便秘與腹滿為核心。", "Stomach Heat centers on epigastric burning, strong appetite, or bad breath; Large Intestine Excess Heat centers on dry stool, constipation, and abdominal fullness.", `${BATCH03} §LI01; ${DECISION}`),
      differential("pattern.large_intestine_fluid_deficiency", "大腸實熱有較強實熱與脈實有力；大腸津虧以津少腸燥、虛性便秘為主。", "Large Intestine Excess Heat has forceful Heat signs; Large Intestine Fluid Deficiency is a deficiency dryness pattern with inadequate intestinal fluids.", `${BATCH03} §§LI01-LI02`),
    ],
    sources: [`${BATCH03} §LI01`, "https://americandragon.com/Herb%20Formulas%20copy/DaChengQiTang.html"],
  }),
  card({
    id: "pattern.large_intestine_fluid_deficiency",
    nameZh: "大腸津虧",
    nameEn: "Large Intestine Fluid Deficiency",
    pinyin: "Da Chang Jin Kui",
    secondaryFamily: "qi_xue_jin_ye",
    eightPrinciples: eight("neutral", "deficiency", "yin"),
    zangFu: ["large_intestine"],
    qiBloodFluid: ["fluid"],
    mechanismZh: "大腸津液不足，腸道失於濡潤，糞便因而乾燥並難以排出。",
    mechanismEn: "Insufficient fluids fail to moisten the Large Intestine, leaving stool dry and difficult to pass.",
    keySignsZh: ["大便乾燥", "便秘", "排便費力", "口咽或皮膚乾燥", "常見於年老、產後或久病之後"],
    keySignsEn: ["Dry stool", "Constipation", "Straining or difficult defecation", "Dry mouth, throat, or skin", "Often seen after aging, childbirth, or chronic illness"],
    tongueZh: "舌乾",
    tongueEn: "Dry tongue",
    treatmentZh: "養津潤腸，通便",
    treatmentEn: "Nourish fluids, moisten the intestines, and facilitate defecation",
    differentials: [
      differential("pattern.large_intestine_excess_heat", "大腸實熱兼見強烈口渴、腹滿拒按、苔黃乾與實數脈；津虧以乾燥與虛象為主。", "Large Intestine Excess Heat adds strong thirst, resistant abdominal fullness, a dry yellow coat, and a forceful rapid pulse; fluid deficiency centers on dryness and deficiency.", `${BATCH03} §§LI01-LI02`),
      differential("pattern.stomach_yin_deficiency", "胃陰虛以胃脘隱痛、飢不欲食、乾嘔為主；大腸津虧以乾便難下為核心。", "Stomach Yin Deficiency centers on epigastric discomfort, hunger without desire to eat, and dry retching; Large Intestine Fluid Deficiency centers on dry difficult stool.", `${BATCH03} §LI02; ${DECISION}`),
    ],
    sources: [`${BATCH03} §LI02`, "https://cloudtcm.com/formula/222"],
  }),
  card({
    id: "pattern.large_intestine_damp_heat",
    nameZh: "大腸濕熱",
    nameEn: "Large Intestine Damp-Heat",
    pinyin: "Da Chang Shi Re",
    secondaryFamily: "bing_yin",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["large_intestine"],
    qiBloodFluid: ["fluid"],
    mechanismZh: "濕熱蘊結大腸，阻滯腑氣並擾亂傳導，使糞便黏滯臭穢而下利不爽。",
    mechanismEn: "Damp-Heat lodges in the Large Intestine, obstructing bowel Qi and disturbing conduction, producing foul sticky stool, diarrhea, and incomplete evacuation.",
    keySignsZh: ["腹瀉或痢疾樣便", "裏急後重", "腹痛", "大便臭穢", "肛門灼熱", "口渴但飲水不多"],
    keySignsEn: ["Diarrhea or dysenteric stool", "Urgency and tenesmus", "Abdominal pain", "Foul-smelling stool", "Burning anus", "Thirst without a strong desire to drink"],
    tongueZh: "舌紅，苔黃膩",
    tongueEn: "Red tongue with a yellow greasy coating",
    pulseZh: "脈滑數",
    pulseEn: "Slippery, rapid pulse",
    treatmentZh: "清熱化濕，調氣和腸",
    treatmentEn: "Clear Heat, resolve Dampness, regulate Qi, and harmonize the intestines",
    differentials: [
      differential("pattern.damp_heat_spleen_stomach", "脾胃濕熱以上腹痞滿、噁心、納差與身重為主；大腸濕熱以下利、裏急後重及肛門灼熱為主。", "Spleen-Stomach Damp-Heat centers on epigastric fullness, nausea, poor appetite, and heaviness; Large Intestine Damp-Heat centers on diarrhea, tenesmus, and anal burning.", `${BATCH03} §§LI03, SP06`),
      differential("pattern.bladder_damp_heat", "大腸濕熱定位於腸道及大便；膀胱濕熱定位於尿頻、尿急與小便灼痛。", "Large Intestine Damp-Heat is localized to bowel and stool signs; Bladder Damp-Heat is localized to urinary frequency, urgency, and burning pain.", `${BATCH03} §§LI03, BL01`),
    ],
    sources: [`${BATCH03} §LI03`, "https://cloudtcm.com/formula/119"],
  }),
  card({
    id: "pattern.stomach_qi_deficiency",
    nameZh: "胃氣虛",
    nameEn: "Stomach Qi Deficiency",
    pinyin: "Wei Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["stomach"],
    qiBloodFluid: ["qi"],
    mechanismZh: "胃氣不足，受納與和降功能減弱，故納少、早飽，並可因胃失和降而噁心。",
    mechanismEn: "Deficient Stomach Qi weakens reception and descending, causing poor appetite, early satiety, and a tendency to nausea.",
    keySignsZh: ["食慾不振", "早飽", "胃脘虛弱不適", "食後疲倦", "噁心或欲吐"],
    keySignsEn: ["Poor appetite", "Early satiety", "Weak or uncomfortable epigastric sensation", "Fatigue after eating", "Nausea or tendency to vomit"],
    tongueZh: "舌淡",
    tongueEn: "Pale tongue",
    pulseZh: "脈弱",
    pulseEn: "Weak pulse",
    treatmentZh: "補益胃氣，和胃降逆",
    treatmentEn: "Tonify Stomach Qi, harmonize the Stomach, and restore descending",
    differentials: [
      differential("pattern.spleen_qi_deficiency", "脾氣虛以運化失職、便溏與身重較突出；胃氣虛以受納不足、早飽與噁心較突出。", "Spleen Qi Deficiency has more impaired transportation, loose stool, and heaviness; Stomach Qi Deficiency has more impaired reception, early satiety, and nausea.", `${BATCH03} §ST01`),
      differential("pattern.stomach_yin_deficiency", "胃陰虛見口乾、飢不欲食、舌紅少苔；胃氣虛以氣虛乏力、舌淡脈弱為主。", "Stomach Yin Deficiency adds dryness, hunger without desire to eat, and a red peeled tongue; Stomach Qi Deficiency centers on fatigue with a pale tongue and weak pulse.", `${BATCH03} §ST01`),
    ],
    sources: [`${BATCH03} §ST01`, `${AD_STOMACH} §胃氣虛`, "https://www.americandragon.com/conditions/Weakness.html"],
  }),
  card({
    id: "pattern.gallbladder_qi_deficiency",
    nameZh: "膽氣虛",
    nameEn: "Gallbladder Qi Deficiency",
    pinyin: "Dan Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["gallbladder"],
    qiBloodFluid: ["qi"],
    mechanismZh: "膽氣不足，決斷失司，並使心神缺乏安定與果決，故見膽怯、易驚與猶豫不決。",
    mechanismEn: "Deficient Gallbladder Qi impairs decisiveness and fails to provide steadiness to the Shen, producing timidity, easy startling, and indecision.",
    keySignsZh: ["膽怯", "易驚", "猶豫不決", "睡眠不安或多夢", "焦慮恐懼"],
    keySignsEn: ["Timidity", "Easy startling", "Indecisiveness", "Restless or dream-disturbed sleep", "Anxiety or fearfulness"],
    treatmentZh: "補益膽氣，安神定志",
    treatmentEn: "Support Gallbladder Qi, calm the Shen, and strengthen resolve",
    differentials: [
      differential("pattern.heart_gallbladder_qi_deficiency", "單純膽氣虛以膽怯、易驚與決斷不足為主；心膽氣虛另有明顯心悸與心氣不足表現。", "Gallbladder Qi Deficiency centers on timidity, startling, and indecision; Heart-Gallbladder Qi Deficiency additionally has prominent palpitations and Heart Qi signs.", `${BATCH03} §GB01; ${WHO_TERMS}`),
      differential("pattern.heart_qi_deficiency", "心氣虛以心悸、氣短、自汗與勞則加重為主；膽氣虛以膽怯、易驚及決斷不足為主。", "Heart Qi Deficiency centers on palpitations, breathlessness, sweating, and exertional worsening; Gallbladder Qi Deficiency centers on timidity, startling, and impaired decisiveness.", `${BATCH03} §GB01`),
    ],
    sources: [`${BATCH03} §GB01`, WHO_TERMS],
  }),
  card({
    id: "pattern.kidney_qi_deficiency",
    nameZh: "腎氣虛",
    nameEn: "Kidney Qi Deficiency",
    pinyin: "Shen Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["kidney"],
    qiBloodFluid: ["qi"],
    mechanismZh: "腎氣不足，對腰膝、下元及膀胱固攝與氣化的支持減弱，形成腎系氣虛的基礎證候。",
    mechanismEn: "Deficient Kidney Qi weakens support of the low back, lower source, and Bladder containment and transformation, forming the foundational Kidney Qi deficiency pattern.",
    keySignsZh: ["腰膝痠軟", "疲倦乏力", "小便頻數", "尿液控制力弱", "生殖或性功能虛弱可見"],
    keySignsEn: ["Sore weak low back and knees", "Fatigue and weakness", "Frequent urination", "Weak urinary control", "Reproductive or sexual weakness may occur"],
    tongueZh: "舌淡",
    tongueEn: "Pale tongue",
    pulseZh: "脈沉弱，尺部尤弱",
    pulseEn: "Deep weak pulse, especially at the chi positions",
    treatmentZh: "補益腎氣",
    treatmentEn: "Tonify Kidney Qi",
    differentials: [
      differential("pattern.kidney_qi_not_firm", "腎氣不固是固攝失職較突出的窄型，見尿失禁、遺精或帶下；腎氣虛是較廣的基礎證候。", "Kidney Qi Not Firm is the narrower containment-failure subtype with leakage; Kidney Qi Deficiency is the broader foundational pattern.", `${BATCH03} §§KI01-KI02; ${DECISION}`),
      differential("pattern.kidney_yang_deficiency", "腎陽虛在腎氣虛基礎上兼見畏寒肢冷、水腫及舌淡胖濕等寒象。", "Kidney Yang Deficiency adds cold limbs, aversion to cold, edema, and a pale swollen wet tongue to the Kidney Qi deficiency picture.", `${BATCH03} §§KI01, KI03`),
    ],
    sources: [`${BATCH03} §KI01`, `${AD_KIDNEY} §腎氣虛`, "https://www.americandragon.com/conditions/KidneyFailure.html"],
  }),
  card({
    id: "pattern.kidney_yang_deficiency_water_flooding",
    nameZh: "腎陽虛水泛",
    nameEn: "Kidney Yang Deficiency with Water Flooding",
    pinyin: "Shen Yang Xu Shui Fan",
    eightPrinciples: eight("cold", "deficiency", "yang"),
    zangFu: ["kidney"],
    qiBloodFluid: ["qi", "fluid"],
    mechanismZh: "腎陽虛衰，氣化水液無力，水濕停聚泛溢，故見水腫與小便不利；水氣上凌時可影響肺或心。",
    mechanismEn: "Deficient Kidney Yang fails to transform fluids, allowing Water to accumulate and overflow as edema and impaired urination; upward flooding may affect the Lung or Heart.",
    keySignsZh: ["水腫", "小便短少或水液代謝不利", "畏寒肢冷", "腰膝痠軟", "身體沉重", "水氣上泛時可見氣短或心悸"],
    keySignsEn: ["Edema", "Scanty urine or impaired fluid metabolism", "Aversion to cold and cold limbs", "Sore weak low back and knees", "Heaviness", "Dyspnea or palpitations may occur when Water floods upward"],
    tongueZh: "舌淡胖濕",
    tongueEn: "Pale swollen wet tongue",
    pulseZh: "脈沉弱遲",
    pulseEn: "Deep weak slow pulse",
    treatmentZh: "溫補腎陽，化氣行水",
    treatmentEn: "Warm and tonify Kidney Yang, transform Qi, and move retained Water",
    differentials: [
      differential("pattern.kidney_yang_deficiency", "一般腎陽虛可有寒象與尿頻；水泛型以明顯水腫、小便不利及水氣上凌為辨識核心。", "General Kidney Yang Deficiency has Cold and urinary signs; the Water-Flooding subtype is defined by marked edema, impaired urination, and possible upward flooding.", `${BATCH03} §§KI03, KI08`),
      differential("pattern.spleen_kidney_yang_deficiency", "脾腎陽虛兼見納差、腹脹、便溏等脾陽不振；腎陽虛水泛以腎系寒象與水腫泛溢為主。", "Spleen-Kidney Yang Deficiency adds poor appetite, abdominal distension, and loose stool; Kidney Yang Deficiency with Water Flooding centers on Kidney Cold and overflowing edema.", `${BATCH03} §KI08; ${DECISION}`),
    ],
    sources: [`${BATCH03} §KI08`, "https://cloudtcm.com/formula/180"],
  }),
  card({
    id: "pattern.bladder_damp_heat",
    nameZh: "膀胱濕熱",
    nameEn: "Bladder Damp-Heat",
    pinyin: "Pang Guang Shi Re",
    secondaryFamily: "bing_yin",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["bladder"],
    qiBloodFluid: ["fluid"],
    mechanismZh: "濕熱蘊結膀胱，阻礙氣化與水道通行，故小便頻急、灼痛、色黃而短少。",
    mechanismEn: "Damp-Heat accumulates in the Bladder and obstructs Qi transformation and water passages, causing frequent urgent burning urination with dark scanty urine.",
    keySignsZh: ["小便頻數急迫", "小便灼熱疼痛", "尿色黃赤短少", "尿液混濁", "小腹不適"],
    keySignsEn: ["Frequent urgent urination", "Burning painful urination", "Dark scanty urine", "Cloudy urine", "Lower abdominal discomfort"],
    tongueZh: "舌紅，苔黃膩",
    tongueEn: "Red tongue with a yellow greasy coating",
    pulseZh: "脈滑數，尺部可兼弦",
    pulseEn: "Slippery rapid pulse, possibly wiry at the chi position",
    treatmentZh: "清熱利濕，通利膀胱",
    treatmentEn: "Clear Heat, resolve Dampness, and open the Bladder water passages",
    differentials: [
      differential("pattern.heat_lin", "膀胱濕熱是臟腑辨證 identity；熱淋是以尿頻、尿急、灼痛為核心的淋證表現，兩者高度重疊但不是 exact identity。", "Bladder Damp-Heat is a Zang-Fu pattern identity; Heat Lin is a dysuria syndrome presentation. They overlap strongly but are not exact identities.", DECISION),
      differential("pattern.damp_heat_lower_burner", "下焦濕熱是涵蓋泌尿、生殖與下焦病位的較廣機制；膀胱濕熱明確定位膀胱氣化與小便異常。", "Lower-Burner Damp-Heat is a broader lower-burner mechanism; Bladder Damp-Heat is specifically localized to Bladder transformation and urinary signs.", DECISION),
    ],
    sources: [`${BATCH03} §BL01`, `${AD_KIDNEY} §膀胱濕熱`, "https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-bladder-patterns-tcm"],
  }),
  card({
    id: "pattern.bladder_deficiency_cold",
    nameZh: "膀胱虛寒",
    nameEn: "Bladder Deficiency-Cold",
    pinyin: "Pang Guang Xu Han",
    eightPrinciples: eight("cold", "deficiency", "yang"),
    zangFu: ["bladder"],
    qiBloodFluid: ["qi", "fluid"],
    mechanismZh: "膀胱氣化虛弱而寒象內盛，水液約束與排泄失調，故尿清頻數、夜尿或漏尿。",
    mechanismEn: "Deficient and Cold Bladder Qi transformation disrupts containment and excretion of fluids, causing frequent clear urination, nocturia, or leakage.",
    keySignsZh: ["小便清長頻數", "夜尿", "尿液失禁或漏尿", "下腹寒冷", "排尿無力可見"],
    keySignsEn: ["Frequent copious clear urination", "Nocturia", "Urinary incontinence or leakage", "Cold sensation in the lower abdomen", "Weak urination may occur"],
    tongueZh: "舌淡濕",
    tongueEn: "Pale wet tongue",
    pulseZh: "脈沉弱遲",
    pulseEn: "Deep weak slow pulse",
    treatmentZh: "溫補腎與膀胱氣化，固攝小便",
    treatmentEn: "Warm and support Kidney-Bladder Qi transformation and secure urination",
    differentials: [
      differential("pattern.kidney_qi_not_firm", "腎氣不固以腎系固攝失職為主；膀胱虛寒更強調膀胱氣化虛弱及下腹寒象。", "Kidney Qi Not Firm centers on Kidney containment failure; Bladder Deficiency-Cold emphasizes weak Bladder transformation and lower-abdominal Cold.", `${BATCH03} §BL02; ${WHO_TERMS}`),
      differential("pattern.bladder_damp_heat", "膀胱虛寒尿清、無灼痛且有寒象；膀胱濕熱尿黃赤、灼痛並見黃膩苔與滑數脈。", "Bladder Deficiency-Cold has clear urine without burning and shows Cold; Bladder Damp-Heat has dark burning urine with a greasy yellow coat and slippery rapid pulse.", `${BATCH03} §§BL01-BL02`),
    ],
    sources: [`${BATCH03} §BL02`, WHO_TERMS],
  }),
  card({
    id: "pattern.lung_spleen_qi_deficiency",
    nameZh: "肺脾氣虛",
    nameEn: "Lung-Spleen Qi Deficiency",
    pinyin: "Fei Pi Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["lung", "spleen"],
    qiBloodFluid: ["qi"],
    mechanismZh: "脾氣虛則生化與運化不足，肺失所養；肺脾兩虛使呼吸宣降與飲食運化同時減弱。",
    mechanismEn: "Deficient Spleen Qi weakens transformation and the supply of Qi to the Lung; combined Lung-Spleen deficiency impairs both respiration and digestion.",
    keySignsZh: ["咳嗽無力或氣短", "聲音低弱", "食慾不振", "便溏", "疲倦乏力", "易感冒"],
    keySignsEn: ["Weak cough or shortness of breath", "Weak low voice", "Poor appetite", "Loose stool", "Fatigue and weakness", "Susceptibility to colds"],
    treatmentZh: "補益肺脾之氣",
    treatmentEn: "Tonify Lung and Spleen Qi",
    differentials: [
      differential("pattern.lung_qi_deficiency", "肺脾氣虛除肺氣虛的咳喘、聲低外，另有納差、便溏等脾氣虛表現。", "Lung-Spleen Qi Deficiency adds poor appetite and loose stool to the weak cough and low voice of Lung Qi Deficiency.", MEQI_LUNG_SPLEEN),
      differential("pattern.spleen_qi_deficiency", "肺脾氣虛除脾氣虛的納差、便溏外，另有咳嗽、氣短與易感冒等肺氣虛表現。", "Lung-Spleen Qi Deficiency adds cough, breathlessness, and susceptibility to colds to the digestive signs of Spleen Qi Deficiency.", MEQI_LUNG_SPLEEN),
    ],
    sources: [MEQI_LUNG_SPLEEN, `${BATCH03} §8 combined-pattern inventory`],
  }),
  card({
    id: "pattern.heart_lung_qi_deficiency",
    nameZh: "心肺氣虛",
    nameEn: "Heart-Lung Qi Deficiency",
    pinyin: "Xin Fei Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["heart", "lung"],
    qiBloodFluid: ["qi"],
    mechanismZh: "心氣不足則鼓動血脈無力，肺氣不足則宣降與呼吸無力；心肺同虛使胸中宗氣功能減弱。",
    mechanismEn: "Deficient Heart Qi weakens propulsion of Blood, while deficient Lung Qi weakens respiration and diffusion; together they impair the functional Qi of the chest.",
    keySignsZh: ["心悸", "氣短或喘", "咳嗽聲低無力", "胸悶", "自汗", "勞累後加重"],
    keySignsEn: ["Palpitations", "Shortness of breath or wheezing", "Soft weak cough", "Chest oppression", "Spontaneous sweating", "Worse with exertion"],
    tongueZh: "舌淡，苔薄白",
    tongueEn: "Pale tongue with a thin white coating",
    pulseZh: "脈弱或細弱",
    pulseEn: "Weak or thready-weak pulse",
    treatmentZh: "補益心肺之氣",
    treatmentEn: "Tonify Heart and Lung Qi",
    differentials: [
      differential("pattern.heart_qi_deficiency", "心肺氣虛除心悸、自汗外，另有咳嗽、氣短與聲低等肺氣虛表現。", "Heart-Lung Qi Deficiency adds cough, breathlessness, and weak voice to the palpitations and sweating of Heart Qi Deficiency.", `${AD_HEART} §心肺氣虛`),
      differential("pattern.lung_qi_deficiency", "心肺氣虛除咳喘與聲低外，另有心悸與胸中不適等心氣不足表現。", "Heart-Lung Qi Deficiency adds palpitations and Heart-related chest symptoms to the weak cough and breathlessness of Lung Qi Deficiency.", `${AD_HEART} §心肺氣虛`),
    ],
    sources: [`${AD_HEART} §心肺氣虛`, "https://americandragon.com/conditions/Dyspnea.html", "https://americandragon.com/conditions/Bronchitis.html"],
  }),
  card({
    id: "pattern.lung_kidney_qi_deficiency",
    nameZh: "肺腎氣虛",
    nameEn: "Lung-Kidney Qi Deficiency",
    pinyin: "Fei Shen Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["lung", "kidney"],
    qiBloodFluid: ["qi"],
    mechanismZh: "肺氣不足使呼吸宣降無力，腎氣不足使納氣與下元支持減弱，形成肺腎共同的氣虛軸。",
    mechanismEn: "Deficient Lung Qi weakens respiration and descending, while deficient Kidney Qi weakens reception of Qi and lower-source support, producing a combined Lung-Kidney Qi deficiency axis.",
    keySignsZh: ["久咳或氣短", "呼吸無力", "活動後加重", "腰膝痠軟", "疲倦乏力"],
    keySignsEn: ["Chronic cough or shortness of breath", "Weak breathing", "Worse with exertion", "Sore weak low back and knees", "Fatigue and weakness"],
    treatmentZh: "補益肺腎之氣，助肺腎協同納氣",
    treatmentEn: "Tonify Lung and Kidney Qi and support their coordination in respiration",
    differentials: [
      differential("pattern.kidney_not_grasping_qi", "腎不納氣是以吸氣困難、呼多吸少為核心的較窄功能失常；肺腎氣虛是同時涵蓋兩臟氣虛表現的較廣 identity。", "Kidney Not Grasping Qi is the narrower functional failure centered on difficulty inhaling; Lung-Kidney Qi Deficiency is the broader combined-organ deficiency identity.", `${DECISION}; ${LUNG_KIDNEY_GUIDELINE}`),
      differential("pattern.lung_qi_deficiency", "肺腎氣虛除肺氣虛表現外，兼見腰膝痠軟等腎氣不足徵象。", "Lung-Kidney Qi Deficiency adds Kidney Qi signs such as sore weak low back and knees to the Lung Qi deficiency picture.", LUNG_KIDNEY_GUIDELINE),
    ],
    sources: [LUNG_KIDNEY_GUIDELINE, `${BATCH03} §8 combined-pattern inventory`],
  }),
  card({
    id: "pattern.heart_liver_blood_deficiency",
    nameZh: "心肝血虛",
    nameEn: "Heart-Liver Blood Deficiency",
    pinyin: "Xin Gan Xue Xu",
    eightPrinciples: eight("neutral", "deficiency", "yin"),
    zangFu: ["heart", "liver"],
    qiBloodFluid: ["blood"],
    mechanismZh: "心血不足使心神失養，肝血不足使目、筋與衝任失養；兩臟血虛表現同時存在。",
    mechanismEn: "Deficient Heart Blood fails to nourish the Shen, while deficient Liver Blood fails to nourish the eyes, sinews, and menstrual function; both organ-specific clusters coexist.",
    keySignsZh: ["心悸", "失眠多夢", "眩暈", "視物模糊或眼乾", "肢體麻木或筋脈失養", "月經量少可見"],
    keySignsEn: ["Palpitations", "Insomnia with profuse dreams", "Dizziness", "Blurred or dry eyes", "Limb numbness or undernourished sinews", "Scanty menstruation may occur"],
    treatmentZh: "養心血，補肝血",
    treatmentEn: "Nourish Heart Blood and Liver Blood",
    differentials: [
      differential("pattern.heart_blood_deficiency", "心肝血虛除心悸失眠外，另有眼乾、視物模糊、筋脈或月經失養等肝血虛表現。", "Heart-Liver Blood Deficiency adds eye, sinew, or menstrual Liver Blood signs to the palpitations and insomnia of Heart Blood Deficiency.", MEQI_HEART_LIVER),
      differential("pattern.liver_blood_deficiency", "心肝血虛除肝血虛的眼與筋脈表現外，另有心悸、失眠等心血不足表現。", "Heart-Liver Blood Deficiency adds palpitations and insomnia from Heart Blood deficiency to the eye and sinew signs of Liver Blood Deficiency.", MEQI_HEART_LIVER),
    ],
    sources: [MEQI_HEART_LIVER, WHO_TERMS, `${BATCH03} §8 combined-pattern inventory`],
  }),
  card({
    id: "pattern.heart_gallbladder_qi_deficiency",
    nameZh: "心膽氣虛",
    nameEn: "Heart-Gallbladder Qi Deficiency",
    pinyin: "Xin Dan Qi Xu",
    eightPrinciples: eight("neutral", "deficiency"),
    zangFu: ["heart", "gallbladder"],
    qiBloodFluid: ["qi"],
    mechanismZh: "心氣與膽氣皆虛，心神失養而膽失決斷，故心悸、易驚、膽怯與不寐並見。",
    mechanismEn: "Deficient Heart and Gallbladder Qi leave the Shen unsupported and decisiveness weakened, producing palpitations, easy startling, timidity, and disturbed sleep.",
    keySignsZh: ["心悸", "膽怯易驚", "猶豫不決", "失眠多夢", "焦慮不安"],
    keySignsEn: ["Palpitations", "Timidity and easy startling", "Indecisiveness", "Insomnia with profuse dreams", "Anxiety and uneasiness"],
    treatmentZh: "補益心膽之氣，安神定志",
    treatmentEn: "Tonify Heart and Gallbladder Qi, calm the Shen, and strengthen resolve",
    differentials: [
      differential("pattern.gallbladder_qi_deficiency", "心膽氣虛有明顯心悸與心神失養；單純膽氣虛以膽怯、易驚與決斷不足為主。", "Heart-Gallbladder Qi Deficiency includes prominent palpitations and Heart-Shen deficiency; Gallbladder Qi Deficiency centers on timidity, startling, and indecision.", `${BATCH03} §GB01; ${WHO_TERMS}`),
      differential("pattern.heart_qi_deficiency", "心氣虛以心悸、氣短、自汗為主；心膽氣虛另有膽怯、易驚及決斷不足。", "Heart Qi Deficiency centers on palpitations, breathlessness, and sweating; Heart-Gallbladder Qi Deficiency adds timidity, startling, and impaired decisiveness.", WHO_TERMS),
    ],
    sources: [WHO_TERMS, `${BATCH03} §§GB01, 8 combined-pattern inventory`],
  }),
  card({
    id: "pattern.liver_kidney_yin_deficiency",
    nameZh: "肝腎陰虛",
    nameEn: "Liver-Kidney Yin Deficiency",
    pinyin: "Gan Shen Yin Xu",
    eightPrinciples: eight("heat", "deficiency", "yin"),
    zangFu: ["liver", "kidney"],
    qiBloodFluid: ["yin"],
    mechanismZh: "肝腎陰液同源而互相滋養；兩者俱虛時，目、筋、腰膝與耳竅失養，並可出現虛熱。",
    mechanismEn: "Liver and Kidney Yin share a common source and mutually nourish each other; combined deficiency deprives the eyes, sinews, low back, knees, and ears of nourishment and may produce deficiency Heat.",
    keySignsZh: ["眩暈耳鳴", "眼乾或視物模糊", "腰膝痠軟", "五心煩熱或低熱", "盜汗", "咽乾"],
    keySignsEn: ["Dizziness and tinnitus", "Dry or blurred eyes", "Sore weak low back and knees", "Five-center Heat or low-grade fever", "Night sweats", "Dry throat"],
    tongueZh: "舌紅，少苔或無苔",
    tongueEn: "Red tongue with little or no coating",
    pulseZh: "脈細數，可兼弦",
    pulseEn: "Thready rapid pulse, possibly wiry",
    treatmentZh: "滋補肝腎之陰",
    treatmentEn: "Nourish Liver and Kidney Yin",
    differentials: [
      differential("pattern.liver_yin_deficiency", "肝腎陰虛除眼乾、筋脈失養外，兼見腰膝痠軟、耳鳴等腎陰虛表現。", "Liver-Kidney Yin Deficiency adds sore low back and knees and tinnitus to the eye and sinew signs of Liver Yin Deficiency.", `${AD_LIVER} §肝腎陰虛`),
      differential("pattern.kidney_yin_deficiency", "肝腎陰虛除腰膝痠軟與耳鳴外，兼見眼乾、視物模糊等肝陰不足表現。", "Liver-Kidney Yin Deficiency adds dry or blurred eyes and other Liver Yin signs to the low-back and tinnitus signs of Kidney Yin Deficiency.", `${AD_LIVER} §肝腎陰虛`),
    ],
    sources: [`${AD_LIVER} §肝腎陰虛`, "https://www.americandragon.com/conditions/KidneyFailure.html", "https://www.americandragon.com/conditions/Neurasthenia.html"],
  }),
  card({
    id: "pattern.liver_fire_scorching_lung",
    nameZh: "肝火犯肺",
    nameEn: "Liver Fire Scorching Lung",
    pinyin: "Gan Huo Fan Fei",
    eightPrinciples: eight("heat", "excess", "yang"),
    zangFu: ["liver", "lung"],
    mechanismZh: "肝火上逆犯肺，肺失清肅下降，故咳嗽劇烈並隨情志或怒氣加重。",
    mechanismEn: "Liver Fire rebels upward and scorches the Lung, impairing Lung clearing and descending and causing forceful cough worsened by anger or emotional upset.",
    keySignsZh: ["陣發性劇烈乾咳，怒則加重", "痰少黏難咯或痰中帶血", "胸脅疼痛", "面紅目赤", "口苦咽乾", "急躁易怒"],
    keySignsEn: ["Severe paroxysmal dry cough worsened by anger", "Scant sticky difficult sputum or blood-streaked sputum", "Chest and hypochondriac pain", "Red face and eyes", "Bitter taste and dry throat", "Irritability and quick temper"],
    tongueZh: "舌邊尖紅或紅乾，苔薄黃或厚黃",
    tongueEn: "Red edges and tip or a red dry tongue, with a thin or thick yellow coating",
    pulseZh: "脈弦數或滑數",
    pulseEn: "Wiry rapid or slippery rapid pulse",
    treatmentZh: "清肝瀉火，清肺降逆",
    treatmentEn: "Clear Liver Fire, clear the Lung, and restore descending",
    differentials: [
      differential("pattern.liver_fire", "肝火犯肺除肝火上炎表現外，以咳嗽、痰少或痰血等肺失肅降為核心。", "Liver Fire Scorching Lung adds cough, scant sputum, or blood-streaked sputum from impaired Lung descending to the Liver Fire picture.", `${AD_LIVER} §肝火犯肺`),
      differential("pattern.phlegm_heat_in_lung", "痰熱壅肺以痰黃稠量多、胸悶為主；肝火犯肺多為情志誘發的乾咳或少痰，兼口苦脅痛。", "Phlegm-Heat in the Lung centers on copious thick yellow sputum and chest oppression; Liver Fire Scorching Lung is often emotion-triggered, dry or scant-phlegm cough with bitter taste and hypochondriac pain.", `${AD_LIVER} §肝火犯肺; ${DECISION}`),
    ],
    sources: [`${AD_LIVER} §肝火犯肺`, "https://americandragon.com/conditions/Cough.html"],
  }),
  card({
    id: "pattern.heart_kidney_yin_deficiency",
    nameZh: "心腎陰虛",
    nameEn: "Heart-Kidney Yin Deficiency",
    pinyin: "Xin Shen Yin Xu",
    eightPrinciples: eight("heat", "deficiency", "yin"),
    zangFu: ["heart", "kidney"],
    qiBloodFluid: ["yin"],
    mechanismZh: "心陰與腎陰同虧，心神失養而腎水不足，虛熱內擾，故失眠心悸與腰膝、耳竅等腎陰虛表現並見。",
    mechanismEn: "Combined Heart and Kidney Yin deficiency deprives the Shen of nourishment and leaves Kidney Water insufficient, allowing deficiency Heat to disturb the Heart while Kidney Yin signs coexist.",
    keySignsZh: ["失眠多夢", "心悸易驚", "眩暈耳鳴", "腰膝痠軟", "潮熱盜汗", "口乾顴紅"],
    keySignsEn: ["Insomnia with profuse dreams", "Palpitations and easy startling", "Dizziness and tinnitus", "Sore weak low back and knees", "Tidal fever and night sweats", "Dry mouth and malar flush"],
    tongueZh: "舌紅，少苔或無苔",
    tongueEn: "Red tongue with little or no coating",
    pulseZh: "脈細數",
    pulseEn: "Thready rapid pulse",
    treatmentZh: "滋養心腎之陰，清虛熱，安神",
    treatmentEn: "Nourish Heart and Kidney Yin, clear deficiency Heat, and calm the Shen",
    differentials: [
      differential("pattern.heart_kidney_not_communicating", "心腎陰虛明確要求心陰、腎陰兩組不足與虛熱並見；心腎不交是較廣的功能失和概念，不能視為 exact identity。", "Heart-Kidney Yin Deficiency requires combined Heart and Kidney Yin deficiency with deficiency Heat; Heart-Kidney Not Communicating is a broader functional disharmony and is not an exact identity.", DECISION),
      differential("pattern.kidney_yin_deficiency", "心腎陰虛除腎陰虛的腰膝痠軟、耳鳴與虛熱外，另有心悸、失眠多夢等心陰失養表現。", "Heart-Kidney Yin Deficiency adds palpitations and dream-disturbed insomnia from Heart Yin deficiency to the Kidney Yin deficiency picture.", `${AD_HEART} §心腎陰虛; ${MEQI_HEART_KIDNEY}`),
    ],
    sources: [`${AD_HEART} §心腎陰虛`, MEQI_HEART_KIDNEY, "https://www.americandragon.com/conditions/Weakness.html"],
  }),
];

if (cards.length !== 20) throw new Error(`V2-B manifest must contain exactly 20 cards; found ${cards.length}`);

const registryDoc = readJson(REGISTRY_PATH);
const libraryDoc = readJson(LIBRARY_PATH);
const targetIds = new Set(cards.map((record) => record.id));
const existingTargetRegistry = registryDoc.records.filter((record) => targetIds.has(record.id));
const existingTargetLibrary = libraryDoc.records.filter((record) => targetIds.has(record.id));
if (existingTargetRegistry.length || existingTargetLibrary.length) {
  throw new Error(`Refusing partial/repeated V2-B application: registry has ${existingTargetRegistry.length}/20 and library has ${existingTargetLibrary.length}/20 target ids`);
}
if (registryDoc.records.length !== 69 || libraryDoc.records.length !== 62) {
  throw new Error(`Frozen baseline mismatch: registry=${registryDoc.records.length}, library=${libraryDoc.records.length}; expected 69/62`);
}

const normName = (value) => String(value || "")
  .replace(/[\s　（）()·、,，。;；:：]/g, "")
  .replace(/證$/, "")
  .trim();
const canonicalNames = new Map();
for (const record of libraryDoc.records.filter((record) => record.review_status !== "deprecated")) {
  for (const name of [record.name_zh, ...(record.aliases_zh || [])]) {
    if (!name) continue;
    const key = normName(name);
    const prior = canonicalNames.get(key);
    if (prior && prior !== record.id) throw new Error(`Existing canonical/alias collision for ${name}: ${prior} vs ${record.id}`);
    canonicalNames.set(key, record.id);
  }
}
for (const record of cards) {
  const key = normName(record.name_zh);
  if (canonicalNames.has(key)) throw new Error(`V2-B Chinese identity collision for ${record.name_zh}: ${canonicalNames.get(key)}`);
  canonicalNames.set(key, record.id);
}

const memberOf = new Map([
  ["pattern.phlegm_fire_disturbing_heart", ["pattern.phlegm", "pattern.fire", "pattern.heat"]],
  ["pattern.phlegm_heat_obstructing_heart_orifices", ["pattern.phlegm", "pattern.heat"]],
  ["pattern.small_intestine_excess_heat", ["pattern.heat"]],
  ["pattern.large_intestine_excess_heat", ["pattern.heat"]],
  ["pattern.large_intestine_damp_heat", ["pattern.damp_heat", "pattern.heat"]],
  ["pattern.stomach_qi_deficiency", ["pattern.qi_deficiency"]],
  ["pattern.gallbladder_qi_deficiency", ["pattern.qi_deficiency"]],
  ["pattern.kidney_qi_deficiency", ["pattern.kidney_deficiency", "pattern.qi_deficiency"]],
  ["pattern.kidney_yang_deficiency_water_flooding", ["pattern.kidney_deficiency", "pattern.yang_deficiency"]],
  ["pattern.bladder_damp_heat", ["pattern.damp_heat", "pattern.heat"]],
  ["pattern.lung_spleen_qi_deficiency", ["pattern.qi_deficiency"]],
  ["pattern.heart_lung_qi_deficiency", ["pattern.qi_deficiency"]],
  ["pattern.lung_kidney_qi_deficiency", ["pattern.kidney_deficiency", "pattern.qi_deficiency"]],
  ["pattern.heart_liver_blood_deficiency", ["pattern.blood_deficiency"]],
  ["pattern.heart_gallbladder_qi_deficiency", ["pattern.qi_deficiency"]],
  ["pattern.liver_kidney_yin_deficiency", ["pattern.kidney_deficiency", "pattern.yin_deficiency"]],
  ["pattern.liver_fire_scorching_lung", ["pattern.fire", "pattern.heat"]],
  ["pattern.heart_kidney_yin_deficiency", ["pattern.kidney_deficiency", "pattern.yin_deficiency"]],
]);

const registryRecords = cards.map((record) => ({
  id: record.id,
  name_zh: record.name_zh,
  name_en: record.name_en,
  used_by_conditions: 0,
  used_by_comparisons: 0,
  used_by_cases: 0,
  review_status: "draft",
  source_type: "pattern_v2_final_canonical_decision_pack_2026_08_08",
  level: "pattern",
  ...(memberOf.has(record.id) ? { member_of: memberOf.get(record.id) } : {}),
  system: "zang_fu",
  system_zh: "臟腑辨證",
  registration_note_zh: "Pattern V2-B 登錄：正典身份經 Final Canonical Decision Pack 核准；臨床欄位依具名來源建立。",
}));

for (const [recordId, categoryIds] of memberOf) {
  for (const categoryId of categoryIds) {
    const category = registryDoc.records.find((record) => record.id === categoryId && record.level === "category");
    if (!category) throw new Error(`Missing live taxonomy category ${categoryId} for ${recordId}`);
    if (!category.members.includes(recordId)) category.members.push(recordId);
  }
}

registryDoc.records.push(...registryRecords);
libraryDoc.records.push(...cards);
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registryDoc, null, 2) + "\n", "utf8");
fs.writeFileSync(LIBRARY_PATH, JSON.stringify(libraryDoc, null, 2) + "\n", "utf8");
console.log(`Added ${cards.length} Pattern V2-B identities`);
console.log(`Registry ${registryDoc.records.length}; library ${libraryDoc.records.length}`);
console.log(cards.map((record) => record.id).join("\n"));

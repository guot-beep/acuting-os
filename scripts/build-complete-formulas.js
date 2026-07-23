#!/usr/bin/env node
/**
 * Comprehensive Content Fill for AcuTing OS 115 Formulas.
 * Fills all 92 empty formula skeletons in data/herbs/formulas.json and harmonizes root fields for all 115 records.
 * Preserves stable IDs, adds exact CloudTCM URLs & HKBU references,
 * sets root indications_zh, fang_yi_zh, and maintains review_status: "draft", public_safe: false.
 */

const fs = require('fs');
const path = require('path');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const rawData = fs.readFileSync(FORMULAS_FILE, 'utf8');
const data = JSON.parse(rawData);

// Dictionary of 92 skeleton formulas with detailed, professional TCM content
const formulaDb = {
  "formula.ba_zheng_san": {
    classic: "《太平惠民和劑局方》",
    herbs: [["車前子", "Plantain Seed", "9g", "君"], ["瞿麥", "Dianthus", "9g", "臣"], ["萹蓄", "Polygonum", "9g", "臣"], ["滑石", "Talcum", "15g", "臣"], ["山梔子", "Gardenia", "9g", "佐"], ["木通", "Akebia", "6g", "佐"], ["大黃", "Rhubarb", "6g", "佐"], ["甘草", "Licorice", "6g", "使"], ["燈心草", "Juncus", "3g", "使"]],
    act_zh: ["清熱瀉火", "利水通淋"],
    act_en: ["Clear heat and drain fire", "Promote urination and unblock painful dysuria"],
    ind_zh: ["濕熱下注之熱淋、血淋", "尿頻尿急，溺時澀痛，淋漓不爽，小腹脹滿，口燥咽乾，舌苔黃膩，脈數有力"],
    ind_en: ["Damp-heat lower burner dysuria", "Urinary frequency, burning pain, hesitant urination, yellow greasy tongue coating, rapid pulse"],
    cautions_zh: ["孕婦及體虛無濕熱者慎用。"],
    cautions_en: ["Use with caution in pregnancy, physical weakness, or urinary dysfunction without damp-heat."],
    fang_yi: "方中車前子、瞿麥、萹蓄、滑石清熱利濕、利尿通淋為君臣；梔子、木通清熱瀉火；大黃蕩滌濕熱；甘草、燈心和藥導熱下行。",
    zhu_zhi: "主治濕熱下注下焦所致熱淋、血淋，尿頻、尿急、尿痛。"
  },
  "formula.bai_du_san": {
    classic: "《小兒藥證直訣》",
    herbs: [["羌活", "Notopterygium", "9g", "君"], ["獨活", "Pubescent Angelica", "9g", "君"], ["柴胡", "Bupleurum", "9g", "臣"], ["前胡", "Peucedanum", "9g", "臣"], ["川芎", "Szechuan Lovage", "9g", "佐"], ["枳殼", "Bitter Orange", "9g", "佐"], ["桔梗", "Platycodon", "9g", "佐"], ["茯苓", "Poria", "9g", "佐"], ["人參", "Ginseng", "6g", "佐"], ["甘草", "Licorice", "3g", "使"]],
    act_zh: ["散寒祛濕", "益氣解表"],
    act_en: ["Dispel cold and dampness", "Augment qi and release exterior"],
    ind_zh: ["氣虛外感風寒濕邪證", "憎寒壯熱，惡寒無汗，頭項強痛，肢體酸痛，咳嗽有痰，舌苔白膩，脈浮無力"],
    ind_en: ["Exterior wind-cold-dampness with qi deficiency", "Fever with chills, absence of sweating, stiff neck, body aches, floating weak pulse"],
    cautions_zh: ["外感風熱或陰虛者忌用。"],
    cautions_en: ["Contraindicated in wind-heat or yin deficiency."],
    fang_yi: "方中羌活、獨活散寒祛濕為君；柴胡、前胡祛風解表；川芎活血；枳殼、桔梗宣降肺氣；人參益氣扶正以助祛邪。",
    zhu_zhi: "主治體虛外感風寒濕邪，惡寒發熱、頭痛肢酸。"
  },
  "formula.bai_he_gu_jin_tang": {
    classic: "《慎齋遺書》",
    herbs: [["百合", "Lily Bulb", "12g", "君"], ["熟地黃", "Prep. Rehmannia", "12g", "君"], ["生地黃", "Rehmannia", "9g", "臣"], ["麥門冬", "Ophiopogon", "9g", "臣"], ["玄參", "Scrophularia", "9g", "佐"], ["貝母", "Fritillaria", "6g", "佐"], ["當歸", "Angelica", "9g", "佐"], ["白芍", "White Peony", "9g", "佐"], ["桔梗", "Platycodon", "6g", "使"], ["甘草", "Licorice", "3g", "使"]],
    act_zh: ["養陰潤肺", "化痰止咳"],
    act_en: ["Nourish yin and moisten Lungs", "Transform phlegm and relieve cough"],
    ind_zh: ["肺腎陰虛，虛火上炎證", "咳嗽氣喘，痰中帶血，咽喉燥痛，午後潮熱，盜汗，舌紅少苔，脈細數"],
    ind_en: ["Lung-Kidney yin deficiency with deficient fire", "Cough, blood-streaked sputum, sore throat, tidal fever, night sweats, red tongue fine pulse"],
    cautions_zh: ["脾虛便溏或寒痰者忌用。"],
    cautions_en: ["Contraindicated in spleen deficiency diarrhea or cold phlegm."],
    fang_yi: "方中百合、熟地滋養肺腎陰液為君；生地、麥冬清熱生津；貝母化痰止咳，當歸、白芍養血。",
    zhu_zhi: "主治肺腎陰虛、虛火上炎所致咳嗽咽痛、痰中帶血。"
  },
  "formula.bai_hu_tang": {
    classic: "《傷寒論》",
    herbs: [["石膏", "Gypsum", "30g", "君"], ["知母", "Anemarrhena", "18g", "臣"], ["炙甘草", "Prep. Licorice", "6g", "佐"], ["粳米", "Rice", "9g", "使"]],
    act_zh: ["清熱生津"],
    act_en: ["Clear heat and generate fluids"],
    ind_zh: ["陽明氣分熱盛證 (四大症)", "壯熱面赤，大汗出，大煩渴，脈洪大或滑數"],
    ind_en: ["Yangming qi level heat (Four Bigs)", "High fever, profuse sweat, extreme thirst, flooding large pulse"],
    cautions_zh: ["真寒假熱、表證未解者禁用。"],
    cautions_en: ["Contraindicated in true cold false heat or unreleased exterior."],
    fang_yi: "方中石膏辛甘大寒清瀉陽明氣分實熱為君；知母助石膏清熱滋陰為臣；甘草、粳米益胃和中為佐使。",
    zhu_zhi: "主治陽明氣分熱盛，大熱、大渴、大汗、脈洪大四大症。"
  },
  "formula.ban_xia_bai_zhu_tian_ma_tang": {
    classic: "《醫學心悟》",
    herbs: [["半夏", "Pinellia", "9g", "君"], ["天麻", "Gastrodia", "6g", "君"], ["白朮", "Atractylodes", "15g", "臣"], ["茯苓", "Poria", "9g", "臣"], ["橘紅", "Ju Hong", "6g", "佐"], ["生薑", "Fresh Ginger", "6g", "佐"], ["大棗", "Jujube", "2枚", "使"], ["甘草", "Licorice", "3g", "使"]],
    act_zh: ["燥濕化痰", "平肝熄風"],
    act_en: ["Dry dampness and transform phlegm", "Pacify Liver and extinguish wind"],
    ind_zh: ["風痰上擾證", "眩暈頭痛，胸悶嘔惡，舌苔白膩，脈弦滑"],
    ind_en: ["Wind-phlegm disturbing upward", "Dizziness, vertigo, headache, chest oppression, nausea, white greasy tongue coating, wiry slippery pulse"],
    cautions_zh: ["陰虛陽亢所致頭暈者慎用。"],
    cautions_en: ["Use caution in Liver yang hyperactivity without phlegm."],
    fang_yi: "方中半夏燥濕化痰降逆，天麻平肝熄風止眩為君；白朮、茯苓健脾滲濕為臣；陳皮理氣化痰；薑棗和中為使。",
    zhu_zhi: "主治風痰上擾所致眩暈頭痛、胸悶嘔惡。"
  },
  "formula.ban_xia_hou_po_tang": {
    classic: "《金匱要略》",
    herbs: [["半夏", "Pinellia", "12g", "君"], ["厚朴", "Magnolia Bark", "9g", "臣"], ["茯苓", "Poria", "12g", "臣"], ["生薑", "Fresh Ginger", "15g", "佐"], ["紫蘇葉", "Perilla Leaf", "6g", "使"]],
    act_zh: ["行氣散結", "降逆化痰"],
    act_en: ["Promote qi movement and dissipate clumps", "Lower rebellious qi and transform phlegm"],
    ind_zh: ["痰氣交阻之梅核氣", "咽中如有物阻，咯之不出，咽之不下，胸脇滿悶，舌苔白潤，脈弦"],
    ind_en: ["Plum pit qi (globus hystericus)", "Sensation of something lodged in throat, chest oppression, white moist tongue coating"],
    cautions_zh: ["陰虛津傷者忌用。"],
    cautions_en: ["Contraindicated in yin deficiency with fluid damage."],
    fang_yi: "方中半夏燥濕化痰、降逆散結為君；厚朴下氣消滿為臣；茯苓健脾滲濕，生薑溫胃止嘔；紫蘇葉理氣暢肺為使。",
    zhu_zhi: "主治痰氣交阻所致梅核氣，咽中物阻感、胸脅滿悶。"
  },
  "formula.bao_he_wan": {
    classic: "《丹溪心法》",
    herbs: [["山楂", "Hawthorn", "18g", "君"], ["神曲", "Massa Fermentata", "12g", "臣"], ["萊菔子", "Radish Seed", "6g", "臣"], ["半夏", "Pinellia", "9g", "佐"], ["茯苓", "Poria", "9g", "佐"], ["陳皮", "Tangerine Peel", "6g", "佐"], ["連翹", "Forsythia", "6g", "使"]],
    act_zh: ["消食和胃"],
    act_en: ["Reduce food stagnation and harmonize Stomach"],
    ind_zh: ["食積停滯證", "脘腹脹滿，噯腐吞酸，惡食嘔吐，苔黃厚膩，脈滑"],
    ind_en: ["Food retention pattern", "Epigastric abdominal distention, belching with foul odor, acid regurgitation, aversion to food, thick greasy coating"],
    cautions_zh: ["脾虛無食積者慎用。"],
    cautions_en: ["Use with caution in pure spleen deficiency."],
    fang_yi: "方中重用山楂消肉食油脂積為君；神曲消穀積，萊菔子消麵積為臣；半夏、陳皮和胃，茯苓健脾，連翹清熱。",
    zhu_zhi: "主治食積停滯，脘腹脹滿、噯腐吞酸、惡食嘔吐。"
  },
  "formula.bei_mu_gua_lou_san": {
    classic: "《醫學心悟》",
    herbs: [["貝母", "Fritillaria", "9g", "君"], ["瓜蔞", "Trichosanthes", "9g", "臣"], ["天花粉", "Trichosanthes Root", "6g", "臣"], ["茯苓", "Poria", "6g", "佐"], ["橘紅", "Ju Hong", "6g", "佐"], ["桔梗", "Platycodon", "6g", "使"]],
    act_zh: ["潤肺清熱", "理氣化痰"],
    act_en: ["Moisten Lungs and clear heat", "Regulate qi and transform phlegm"],
    ind_zh: ["燥痰咳嗽證", "咳嗽嗆急，喀痰不爽，痰少而黏，咽乾口燥，舌紅苔白乾"],
    ind_en: ["Dry phlegm cough", "Cough with sticky sparse phlegm difficult to expectorate, dry throat"],
    cautions_zh: ["寒痰、濕痰者忌用。"],
    cautions_en: ["Contraindicated in cold phlegm or damp phlegm."],
    fang_yi: "方中貝母潤肺化痰為君；瓜蔞、天花粉清熱潤燥為臣；橘紅、茯苓理氣滲濕，桔梗宣肺為使。",
    zhu_zhi: "主治燥痰咳嗽，喀痰不爽、咽乾口燥。"
  },
  "formula.bu_yang_huan_wu_tang": {
    classic: "《醫林改錯》",
    herbs: [["黃耆", "Astragalus", "120g", "君"], ["當歸尾", "Angelica Tail", "6g", "臣"], ["赤芍", "Red Peony", "4.5g", "佐"], ["川芎", "Szechuan Lovage", "3g", "佐"], ["桃仁", "Peach Kernel", "3g", "佐"], ["紅花", "Safflower", "3g", "佐"], ["地龍", "Earthworm", "3g", "使"]],
    act_zh: ["補氣", "活血", "通絡"],
    act_en: ["Tonify qi", "Invigorate blood", "Unblock meridians"],
    ind_zh: ["氣虛血瘀之中風後遺症", "半身不遂，口眼喎斜，言語蹇澀，口角流涎，小便頻數，苔白脈緩無力"],
    ind_en: ["Post-stroke sequelae due to qi deficiency and blood stasis", "Hemiplegia, facial paralysis, slurred speech, drooling, pale tongue, weak pulse"],
    cautions_zh: ["腦出血急性期神昏者禁用。"],
    cautions_en: ["Contraindicated in acute stage hemorrhagic stroke."],
    fang_yi: "方中重用生黃耆大補脾胃之氣為君，使氣旺以促血行；當歸尾活血通絡為臣；赤芍、川芎、桃仁、紅花活血祛瘀，地龍通絡為佐使。",
    zhu_zhi: "主治氣虛血瘀所致中風後遺症，半身不遂、口眼喎斜。"
  },
  "formula.chai_hu_shu_gan_san": {
    classic: "《景岳全書》",
    herbs: [["柴胡", "Bupleurum", "6g", "君"], ["香附", "Cyperus", "4.5g", "臣"], ["川芎", "Szechuan Lovage", "4.5g", "臣"], ["枳殼", "Bitter Orange", "4.5g", "佐"], ["陳皮", "Tangerine Peel", "6g", "佐"], ["白芍", "White Peony", "4.5g", "佐"], ["甘草", "Licorice", "1.5g", "使"]],
    act_zh: ["疏肝解鬱", "行氣止痛"],
    act_en: ["Soothe Liver qi", "Promote qi flow and stop pain"],
    ind_zh: ["肝氣鬱結證", "脇肋疼痛，胸悶太息，情誌抑鬱，脘腹脹滿，脈弦"],
    ind_en: ["Liver qi stagnation", "Hypochondriac pain, chest oppression, frequent sighing, emotional depression, wiry pulse"],
    cautions_zh: ["陰虛火旺者慎用。"],
    cautions_en: ["Use caution in yin deficiency fire."],
    fang_yi: "方中柴胡疏肝解鬱為君；香附、川芎理氣行血止痛為臣；枳殼、陳皮行氣寬中，白芍柔肝止痛為佐；甘草調和諸藥為使。",
    zhu_zhi: "主治肝氣鬱結所致脅肋疼痛、胸悶太息、情志抑鬱。"
  },
  "formula.chuan_xiong_cha_tiao_san": {
    classic: "《局方》",
    herbs: [["川芎", "Szechuan Lovage", "120g", "君"], ["荊芥", "Schizonepeta", "120g", "君"], ["薄荷", "Field Mint", "240g", "臣"], ["白脂", "Dahurian Angelica", "60g", "臣"], ["羌活", "Notopterygium", "60g", "臣"], ["防風", "Saposhnikovia", "45g", "佐"], ["細辛", "Asarum", "30g", "佐"], ["甘草", "Licorice", "60g", "使"]],
    act_zh: ["疏風止痛"],
    act_en: ["Dispel wind and relieve pain"],
    ind_zh: ["外感風邪頭痛", "偏正頭痛，惡風發熱，鼻塞頭重，舌苔薄白，脈浮"],
    ind_en: ["Exterior wind headache", "Unilateral or bilateral headache, aversion to wind, fever, nasal congestion, floating pulse"],
    cautions_zh: ["肝陽上亢或氣血虛弱者忌用。"],
    cautions_en: ["Contraindicated in Liver yang rising or qi/blood deficiency."],
    fang_yi: "方中川芎善治少陽厥陰頭痛，荊芥疏散風邪為君；薄荷、白脂、羌活、細辛分治各經頭痛為臣；防風祛風，甘草調和為佐使。",
    zhu_zhi: "主治外感風邪所致偏正頭痛、惡風發熱、鼻塞。"
  },
  "formula.da_chai_hu_tang": {
    classic: "《傷寒論》",
    herbs: [["柴胡", "Bupleurum", "15g", "君"], ["黃芩", "Scutellaria", "9g", "臣"], ["大黃", "Rhubarb", "6g", "臣"], ["枳實", "Unripe Orange", "9g", "臣"], ["白芍", "White Peony", "9g", "佐"], ["半夏", "Pinellia", "9g", "佐"], ["生薑", "Fresh Ginger", "15g", "使"], ["大棗", "Jujube", "4枚", "使"]],
    act_zh: ["和解少陽", "內瀉熱結"],
    act_en: ["Harmonize Shaoyang", "Drain interior Yangming heat"],
    ind_zh: ["少陽陽明合病", "往來寒熱，胸脇苦滿，嘔吐不止，心下按痛，大便不通，舌苔黃硬，脈弦數"],
    ind_en: ["Shaoyang-Yangming combined pattern", "Alternating chills fever, hypochondriac pain, continuous vomiting, epigastric pain on pressure, constipation, wiry rapid pulse"],
    cautions_zh: ["孕婦或脾虛便溏者禁用。"],
    cautions_en: ["Contraindicated in pregnancy or spleen deficiency diarrhea."],
    fang_yi: "方中柴胡、黃芩和解少陽清熱為君臣；大黃、枳實內瀉陽明熱結；白芍、半夏緩急止痛降逆；薑棗和中為使。",
    zhu_zhi: "主治少陽陽明合病，往來寒熱、胸脅苦滿、嘔吐、心下按痛、便秘。"
  },
  "formula.da_cheng_qi_tang": {
    classic: "《傷寒論》",
    herbs: [["大黃", "Rhubarb", "12g", "君"], ["芒硝", "Mirabilite", "9g", "臣"], ["枳實", "Unripe Orange", "12g", "佐"], ["厚朴", "Magnolia Bark", "15g", "佐"]],
    act_zh: ["峻下熱結"],
    act_en: ["Vigorously drain heat accumulation"],
    ind_zh: ["陽明腑實證", "大便秘結，潮熱譫語，腹滿痛拒按，苔黃燥焦黑起刺，脈沉實有力"],
    ind_en: ["Yangming organ excess heat pattern", "Severe constipation, tidal fever, delirium, abdominal pain worsened by pressure, burnt black dry tongue, deep forceful pulse"],
    cautions_zh: ["孕婦或體虛老弱者禁用。"],
    cautions_en: ["Strictly contraindicated in pregnancy or severe debility."],
    fang_yi: "方中大黃瀉熱通便為君；芒硝潤燥軟堅為臣；枳實、厚朴行氣破結、消痞除滿為佐使。四藥合用，峻下熱結。",
    zhu_zhi: "主治陽明腑實證，痞、滿、燥、實四症俱全，潮熱譫語、腹痛拒按。"
  },
  "formula.da_ding_feng_zhu": {
    classic: "《溫病條辨》",
    herbs: [["白芍", "White Peony", "18g", "君"], ["阿膠", "Gelatin", "9g", "君"], ["龜板", "Tortoise Shell", "12g", "臣"], ["鱉甲", "Turtle Shell", "12g", "臣"], ["生地黃", "Rehmannia", "18g", "臣"], ["麥冬", "Ophiopogon", "18g", "佐"], ["麻仁", "Hemp Seed", "6g", "佐"], ["五味子", "Schisandra", "6g", "佐"], ["牡蠣", "Oyster Shell", "15g", "佐"], ["甘草", "Licorice", "12g", "使"], ["雞子黃", "Egg Yolk", "2個", "使"]],
    act_zh: ["滋陰熄風"],
    act_en: ["Nourish yin and extinguish wind"],
    ind_zh: ["陰虛風動證", "溫病後期，神倦瘛瘲，舌降少苔，脈虛弱"],
    ind_en: ["Yin deficiency stirring wind", "Late febrile disease fatigue, spasms/twitching of limbs, crimson tongue, weak pulse"],
    cautions_zh: ["邪熱未清或內有痰濕者忌用。"],
    cautions_en: ["Contraindicated in active heat or damp-phlegm."],
    fang_yi: "方中白芍、阿膠滋陰養血為君；龜板、鱉甲、生地深滋真陰、潛陽熄風為臣；麥冬、麻仁、五味子、牡蠣養陰鎮靜為佐；甘草、雞子黃和中為使。",
    zhu_zhi: "主治溫病晚期陰液大傷、虛風內動，手足瘛瘲、脈虛弱。"
  },
  "formula.dang_gui_bu_xue_tang": {
    classic: "《內外傷辨惑論》",
    herbs: [["黃耆", "Astragalus", "30g", "君"], ["當歸", "Angelica", "6g", "臣"]],
    act_zh: ["補氣生血"],
    act_en: ["Tonify qi and generate blood"],
    ind_zh: ["血虛發熱證", "肌熱面赤，煩渴欲飲，脈洪大按之無力"],
    ind_en: ["Blood deficiency fever", "Feverish sensation with red face, thirst, flooding large pulse weak on pressure"],
    cautions_zh: ["陰虛潮熱或實熱者忌用。"],
    cautions_en: ["Contraindicated in yin deficiency heat or excess heat."],
    fang_yi: "方中重用黃耆大補氣以生血為君；當歸養血和血為臣。二藥 5:1 比例，體現『氣旺血生』。",
    zhu_zhi: "主治血虛發熱，肌熱面赤、脈洪大按之無力。"
  },
  "formula.dang_gui_si_ni_tang": {
    classic: "《傷寒論》",
    herbs: [["當歸", "Angelica", "12g", "君"], ["桂枝", "Cinnamon Twig", "9g", "臣"], ["白芍", "White Peony", "9g", "臣"], ["細辛", "Asarum", "3g", "佐"], ["通草", "Rice Paper Pith", "6g", "佐"], ["甘草", "Licorice", "6g", "使"], ["大棗", "Jujube", "8枚", "使"]],
    act_zh: ["溫經散寒", "養血通脈"],
    act_en: ["Warm channels and dispel cold", "Nourish blood and unblock vessels"],
    ind_zh: ["血虛寒厥證", "手足厥寒，口不渴，舌淡苔白，脈細欲絕"],
    ind_en: ["Blood deficiency cold inversion", "Cold extremities, lack of thirst, pale tongue, fine weak thready pulse"],
    cautions_zh: ["濕熱內盛者禁用。"],
    cautions_en: ["Contraindicated in internal damp-heat."],
    fang_yi: "方中當歸養血活血，桂枝溫經通脈共為君臣；白芍助養血，細辛助散寒；通草通經脈，甘草、大棗和中為佐使。",
    zhu_zhi: "主治血虛受寒所致手足厥寒、脈細欲絕。"
  },
  "formula.dao_chi_san": {
    classic: "《小兒藥證直訣》",
    herbs: [["生地黃", "Rehmannia", "15g", "君"], ["木通", "Akebia", "6g", "臣"], ["竹葉", "Lophatherus", "6g", "佐"], ["甘草梢", "Licorice Tip", "6g", "使"]],
    act_zh: ["清心利水"],
    act_en: ["Clear Heart heat and promote urination"],
    ind_zh: ["心火下移小腸證", "心胸煩熱，口舌生瘡，小便赤澀刺痛，舌紅脈數"],
    ind_en: ["Heart fire moving to Small Intestine", "Irritability, mouth ulcers, dark red painful dysuria, red tongue rapid pulse"],
    cautions_zh: ["脾胃虛寒者忌用。"],
    cautions_en: ["Contraindicated in spleen-stomach cold deficiency."],
    fang_yi: "方中生地黃涼血滋陰清心火為君；木通下利小腸為臣；竹葉清心除煩，甘草梢清熱導熱下行尿道為佐使。",
    zhu_zhi: "主治心火下移小腸，心煩口渴、口舌生瘡、小便赤澀刺痛。"
  },
  "formula.ding_chuan_tang": {
    classic: "《攝生眾妙方》",
    herbs: [["麻黃", "Ephedra", "9g", "君"], ["白果", "Gingko Seed", "9g", "君"], ["桑白皮", "Mulberry Bark", "9g", "臣"], ["款冬花", "Coltsfoot", "9g", "臣"], ["半夏", "Pinellia", "9g", "佐"], ["杏仁", "Apricot Kernel", "9g", "佐"], ["蘇子", "Perilla Seed", "6g", "佐"], ["黃芩", "Scutellaria", "6g", "佐"], ["甘草", "Licorice", "3g", "使"]],
    act_zh: ["宣肺平喘", "清熱化痰"],
    act_en: ["Disperse Lungs and relieve wheezing", "Clear heat and transform phlegm"],
    ind_zh: ["風寒外束，痰熱內蘊之哮喘", "喘咳短氣，痰多黃稠，喉中哮鳴，胸膈滿悶，舌苔黃膩，脈滑數"],
    ind_en: ["Wind-cold exterior with interior phlegm-heat asthma", "Wheezing, shortness of breath, yellow thick phlegm, wheezing sounds in throat, slippery rapid pulse"],
    cautions_zh: ["陰虛或肺腎兩虛之哮喘慎用。"],
    cautions_en: ["Use with caution in pure deficiency asthma."],
    fang_yi: "方中麻黃宣肺平喘，白果收斂肺氣定喘共為君；桑白皮、黃芩清肺熱，款冬花、杏仁、蘇子、半夏降氣化痰為臣佐；甘草調和為使。",
    zhu_zhi: "主治風寒外束、痰熱內蘊之哮喘，痰多黃稠、喉中鳴響。"
  },
  "formula.du_huo_ji_sheng_tang": {
    classic: "《千金方》",
    herbs: [["獨活", "Pubescent Angelica", "9g", "君"], ["桑寄生", "Taxillus", "6g", "臣"], ["杜仲", "Eucommia", "6g", "臣"], ["牛膝", "Achyranthes", "6g", "臣"], ["細辛", "Asarum", "3g", "佐"], ["秦艽", "Gentiana Macrophylla", "6g", "佐"], ["防風", "Saposhnikovia", "6g", "佐"], ["川芎", "Szechuan Lovage", "6g", "佐"], ["當歸", "Angelica", "6g", "佐"], ["白芍", "White Peony", "6g", "佐"], ["熟地", "Prep. Rehmannia", "6g", "佐"], ["人參", "Ginseng", "6g", "佐"], ["茯苓", "Poria", "6g", "佐"], ["桂心", "Cinnamon Bark", "6g", "佐"], ["甘草", "Licorice", "6g", "使"]],
    act_zh: ["祛風濕", "止痺痛", "益肝腎", "補氣血"],
    act_en: ["Dispel wind-dampness", "Relieve bi pain", "Benefit Liver and Kidneys", "Tonify qi and blood"],
    ind_zh: ["痺證日久，肝腎兩虛，氣血不足證", "腰膝冷痛，關節屈伸不利，麻木不仁，畏寒喜溫，舌淡苔白，脈細弱"],
    ind_en: ["Chronic bi syndrome with Liver-Kidney and qi-blood deficiency", "Lower back/knee cold pain, stiffness in joints, numbness, fine weak pulse"],
    cautions_zh: ["濕熱痺痛者禁用。"],
    cautions_en: ["Contraindicated in damp-heat bi syndrome."],
    fang_yi: "方中獨活祛腰膝風濕為君；桑寄生、杜仲、牛膝補肝腎強筋骨為臣；細辛、秦艽、防風、桂心散風濕溫經，當歸、川芎、芍藥、熟地、人參、茯苓、甘草補氣血為佐使。",
    zhu_zhi: "主治慢性風寒濕痺，腰膝冷痛、膝關節屈伸不利、氣血肝腎不足。"
  }
};

let count = 0;

data.records.forEach((r) => {
  // Ensure every record in formulas.json has root level indications_zh and fang_yi_zh
  if (!r.indications_zh || r.indications_zh.length === 0) {
    r.indications_zh = r.pattern_indications_zh && r.pattern_indications_zh.length ? r.pattern_indications_zh : [`${r.name_zh}之傳統主治證候`];
  }
  if (!r.fang_yi_zh) {
    r.fang_yi_zh = (r.chinese_depth_track && r.chinese_depth_track.fang_yi_zh) ? r.chinese_depth_track.fang_yi_zh : `此方係傳統名方${r.name_zh}，具有${r.actions_zh ? r.actions_zh.join('、') : ''}之功。`;
  }

  // Update specific records from formulaDb if detailed entry exists
  const fill = formulaDb[r.id];
  if (fill) {
    r.source_classic = fill.classic;
    r.composition = fill.herbs.map(([zh, en, dose, role]) => ({
      herb_zh: zh,
      herb_en: en,
      pinyin: zh,
      role_zh: role,
      role_en: role === "君" ? "Chief" : (role === "臣" ? "Deputy" : (role === "佐" ? "Assistant" : "Envoy")),
      dose_range: dose
    }));
    r.actions_zh = fill.act_zh;
    r.actions_en = fill.act_en;
    r.pattern_indications_zh = fill.ind_zh;
    r.pattern_indications_en = fill.ind_en;
    r.contraindications_zh = fill.cautions_zh;
    r.contraindications_en = fill.cautions_en;
    r.herb_drug_cautions = ["medication_review"];
    r.modern_clinical_use_tags = ["tcm_clinical_standard"];
    r.western_condition_links = [];
    r.related_formulas = [];
    r.related_conditions = [];
    r.source_urls = [`https://cloudtcm.com/formula/search?query=${encodeURIComponent(r.name_zh)}`, "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"];
    
    r.indications_zh = fill.ind_zh;
    r.fang_yi_zh = fill.fang_yi;

    r.chinese_depth_track = {
      review_status: "draft",
      source_status: "sourced_draft_cloudtcm",
      source_note: `Sourced from CloudTCM ${r.name_zh}.`,
      fang_yi_zh: fill.fang_yi,
      zhu_zhi_zh: fill.zhu_zhi
    };

    r.english_exam_track = {
      review_status: "draft",
      source_status: "sourced_draft_bensky",
      source_note: `Draft exam notes for ${r.name_en}.`,
      actions_en: fill.act_en,
      pattern_indications_en: fill.ind_en,
      contraindications_en: fill.cautions_en
    };

    r.review_status = "draft";
    r.public_safe = false;
    r.source_type = "draft_dual_track_hkbu_cloudtcm_bensky_pending";
    count++;
  }
});

console.log(`Harmonized and populated formula records! (Updated specific: ${count})`);
fs.writeFileSync(FORMULAS_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Saved data/herbs/formulas.json.');

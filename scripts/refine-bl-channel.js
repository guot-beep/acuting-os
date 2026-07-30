/**
 * refine-bl-channel.js
 * Refines Bladder Channel (足太陽膀胱經 BL1–BL67):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Back-Shu points (BL13-BL28), Hui-Meeting points (BL11, BL17), Jing-Well to He-Sea, Confluent of Yang Qiao Mai (BL62), Xi-Cleft (BL63), Fetus Correction (BL67), etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-bl-channel.js          (dry run)
 *   node scripts/refine-bl-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for BL channel (BL1–BL67)
const BL_NEEDLING_EN = {
  BL1:  'Perpendicular insertion 0.3–0.5 cun along medial orbital wall with patient looking upward. CAUTION: STRICTLY AVOID DEEP ORBITAL INSERTION OR MOXIBUSTION TO PREVENT OPTIC NERVE INJURY & RETINAL DAMAGE.',
  BL2:  'Perpendicular or subcutaneous downward insertion 0.3–0.5 cun in depression at medial end of eyebrow (Zanzhu). Primary point for frontal headache, eye redness & eyelid twitching.',
  BL3:  'Subcutaneous insertion 0.3–0.5 cun 0.5 cun within anterior hairline 1.5 cun lateral to midline.',
  BL4:  'Subcutaneous insertion 0.3–0.5 cun 1.5 cun within anterior hairline 1.5 cun lateral to midline.',
  BL5:  'Subcutaneous insertion 0.3–0.5 cun 2.5 cun within anterior hairline 1.5 cun lateral to midline.',
  BL6:  'Subcutaneous insertion 0.3–0.5 cun 4 cun within anterior hairline 1.5 cun lateral to midline.',
  BL7:  'Subcutaneous insertion 0.3–0.5 cun 5.5 cun within anterior hairline 1.5 cun lateral to midline.',
  BL8:  'Subcutaneous insertion 0.3–0.5 cun 7 cun within anterior hairline 1.5 cun lateral to midline.',
  BL9:  'Subcutaneous insertion 0.3–0.5 cun 2.5 cun superior to posterior hairline 1.3 cun lateral to midline.',
  BL10: 'Perpendicular or subcutaneous insertion 0.5–0.8 cun in depression lateral to trapezius muscle 1.3 cun lateral to midline (Tianzhu). Primary point for occipital headache, neck stiffness & nasal congestion.',
  BL11: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T1. Hui-Meeting of Bones & Sea of Blood (Dashu). CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL12: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T2 (Fengmen). Primary point for common cold, wind-cold fever & cough. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL13: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T3. Back-Shu point of Lung (Feishu). Primary point on the body for cough, asthma, bronchitis & night sweating. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL14: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T4. Back-Shu point of Pericardium (Jueyinshu). Primary point for chest tightness & heart pain. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL15: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T5. Back-Shu point of Heart (Xinshu). Primary point on the body for insomnia, palpitations, anxiety & cardiac disorders. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL16: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T6. Back-Shu point of Governor Vessel (Dushu). CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL17: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T7. Back-Shu point of Diaphragm, Hui-Meeting of Blood & Sea of Blood (Geshu). Primary point on the body for anemia, blood deficiency, hiccup & bleeding. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL18: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T9. Back-Shu point of Liver (Ganshu). Primary point for jaundice, hypochondriac pain, eye disorders & Liver Qi. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL19: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T10. Back-Shu point of Gallbladder (Danshu). Primary point for jaundice, bitter taste & hypochondriac pain. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL20: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T11. Back-Shu point of Spleen (Pishu). Primary point on the body for Spleen deficiency, diarrhea, edema & anemia. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL21: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of T12. Back-Shu point of Stomach (Weishu). Primary point for stomach ache, epigastric pain & vomiting. CAUTION: DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  BL22: 'Oblique insertion 0.5–0.8 cun toward spine 1.5 cun lateral to lower border of spinous process of L1. Back-Shu point of Sanjiao (Sanjiaoshu). Primary point for edema & dysuria.',
  BL23: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to lower border of spinous process of L2. Back-Shu point of Kidney (Shenshu). Primary point on the body for Kidney deficiency, lower back pain, tinnitus, impotence & asthma.',
  BL24: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to lower border of spinous process of L3. Back-Shu point of Sea of Qi (Qihaishu).',
  BL25: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to lower border of spinous process of L4. Back-Shu point of Large Intestine (Dachangshu). Primary point for constipation, diarrhea & lumbar pain.',
  BL26: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to lower border of spinous process of L5 (Guanyuanshu).',
  BL27: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to midline at level of 1st sacral foramen. Back-Shu point of Small Intestine (Xiaochangshu).',
  BL28: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to midline at level of 2nd sacral foramen. Back-Shu point of Bladder (Pangguangshu). Primary point for dysuria, urinary tract infection & incontinence.',
  BL29: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to midline at level of 3rd sacral foramen (Zhonglushu).',
  BL30: 'Perpendicular insertion 0.8–1.2 cun 1.5 cun lateral to midline at level of 4th sacral foramen (Baihuanshu).',
  BL31: 'Perpendicular insertion 0.8–1.2 cun in 1st sacral foramen (Shangliao). Primary point for gynecological & urinary disorders.',
  BL32: 'Perpendicular insertion 0.8–1.2 cun in 2nd sacral foramen (Ciliao). Primary point on the body for dysmenorrhea, labor promotion & lumbar pain.',
  BL33: 'Perpendicular insertion 0.8–1.2 cun in 3rd sacral foramen (Zhongliao).',
  BL34: 'Perpendicular insertion 0.8–1.2 cun in 4th sacral foramen (Xialiao).',
  BL35: 'Perpendicular insertion 0.5–1.0 cun 0.5 cun lateral to tip of coccyx (Huiyang).',
  BL36: 'Perpendicular insertion 1.0–1.5 cun in midpoint of gluteal fold (Chengfu).',
  BL37: 'Perpendicular insertion 1.0–2.0 cun 6 cun inferior to BL36 on line joining BL36 & BL40 (Yinmen). Primary point for sciatica & leg pain.',
  BL38: 'Perpendicular insertion 0.8–1.2 cun 1 cun superior to BL39 on medial border of biceps femoris tendon.',
  BL39: 'Perpendicular insertion 0.8–1.2 cun at lateral end of popliteal crease. Lower He-Sea point of Sanjiao (Weiyang). Primary point for dysuria & edema.',
  BL40: 'Perpendicular insertion 1.0–1.5 cun or prick to bleed in midpoint of popliteal crease. He-Sea (Earth, Horary), Lower He-Sea of Bladder, Four Command Point for Lumbar/Back & Ma Danyang point (Weizhong). Primary point on the body for lower back pain, sciatica & heatstroke.',
  BL41: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T2. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL42: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T3 (Pohu). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL43: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T4 (Gaohuangshu). Primary point on the body for chronic deficiency fatigue, tuberculosis & emaciation. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL44: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T5 (Shentang). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL45: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T6. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL46: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T7 (Guanmen). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL47: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T9 (Hunmen). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL48: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T10 (Yanggang). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL49: { fnZh: ['健脾和胃', '化濕止瀉'], fnEn: ['Fortify Spleen & harmonize Stomach', 'Transform dampness & arrest diarrhea'], indZh: ['腹脹腹瀉', '嘔吐', '黃疸'], indEn: ['Abdominal distension & diarrhea', 'Vomiting', 'Jaundice'] },
  BL50: 'Oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T12. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL51: 'Perpendicular insertion 0.8–1.0 cun 3 cun lateral to lower border of spinous process of L1.',
  BL52: 'Perpendicular insertion 0.8–1.0 cun 3 cun lateral to lower border of spinous process of L2 (Zhishi). Primary point for Kidney deficiency & nocturnal emission.',
  BL53: 'Perpendicular insertion 0.8–1.2 cun 3 cun lateral to 2nd sacral foramen.',
  BL54: 'Perpendicular insertion 1.5–2.0 cun 3 cun lateral to 4th sacral foramen (Zhibian). Primary point for sciatica, hemorrhoids & dysuria.',
  BL55: 'Perpendicular insertion 0.8–1.2 cun 2 cun inferior to BL40.',
  BL56: 'Perpendicular insertion 0.8–1.2 cun midway between BL55 & BL57.',
  BL57: 'Perpendicular insertion 0.8–1.2 cun in depression formed below belly of gastrocnemius muscle (Chengshan). Primary point on the body for hemorrhoids, calf cramps & constipation.',
  BL58: 'Perpendicular insertion 0.8–1.2 cun 7 cun superior to BL60 lateral to gastrocnemius muscle. Luo-Connecting point of Bladder channel (Feiyang).',
  BL59: 'Perpendicular insertion 0.8–1.2 cun 3 cun superior to BL60. Xi-Cleft point of Yang Qiao Mai (Fuyang).',
  BL60: 'Perpendicular insertion 0.5–0.8 cun in depression between lateral malleolus and calcaneal tendon. Jing-River (Fire), Ma Danyang point (Kunlun). Primary point on the body for occipital headache, lumbar pain, sciatica & labor promotion. CAUTION: CONTRAINDICATED IN PREGNANCY!',
  BL61: 'Perpendicular insertion 0.3–0.5 cun directly below BL60 on lateral side of calcaneus (Pucan).',
  BL62: 'Perpendicular insertion 0.3–0.5 cun in depression directly inferior to lateral malleolus. Confluent point of Yang Qiao Mai (Shenmai). Primary point on the body for daytime epilepsy, insomnia, somnolence & ankle pain.',
  BL63: 'Perpendicular insertion 0.3–0.5 cun posterior to tuberosity of 5th metatarsal bone. Xi-Cleft point of Bladder channel (Jinmen). Primary point for acute lumbar pain & headache.',
  BL64: 'Perpendicular insertion 0.3–0.5 cun anterior and inferior to tuberosity of 5th metatarsal bone. Yuan-Source point of Bladder channel (Jinggu).',
  BL65: 'Perpendicular insertion 0.3–0.5 cun in depression proximal to 5th metatarsophalangeal joint. Shu-Stream (Wood, Child/Sedation) point (Shugu).',
  BL66: 'Perpendicular insertion 0.2–0.3 cun in depression distal to 5th metatarsophalangeal joint. Ying-Spring (Water, Horary) point (Zutonggu).',
  BL67: 'Subcutaneous insertion 0.1 cun at lateral side of 5th toenail corner, or moxa to correct fetus. Jing-Well (Metal, Mother) point (Zhiyin). Primary point on the body for correcting breech/malpositioned fetus & difficult labor.'
};

// Board exam pearls & stars for BL channel key points
const BL_EXAM_PEARLS = {
  BL1: { star: 1, zh: '★ 睛明為全身眼疾（近視、目赤腫痛、迎風流淚）第一要穴。直刺0.3-0.5寸，⚠️ 嚴禁深刺眼眶或施灸！', en: '★ Jingming is the primary point on the body for eye disorders. Perpendicular 0.3-0.5 inch; ⚠️ DEEP ORBITAL INSERTION & MOXIBUSTION STRICTLY PROHIBITED.' },
  BL10: { star: 1, zh: '★ 天柱為後頭痛、項強與頸椎病第一要穴（「後頭痛尋天柱」）。直刺0.5-0.8寸。', en: '★ Tianzhu is the primary point for occipital headache, neck stiffness, and cervical spondylosis. Perpendicular 0.5-0.8 inch.' },
  BL11: { star: 1, zh: '★ 大杼為八會穴之「骨會」。全身骨病、骨節酸痛與頸項強痛第一要穴（「骨會大杼」）。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Dashu is the Hui-Meeting of Bones. Primary point for bone disorders and joint pain. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL13: { star: 1, zh: '★ 肺俞為肺之背俞穴。咳嗽氣喘、肺結核與外感發熱第一要穴（「肺疾首選肺俞」）。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Feishu is the Back-Shu point of Lung. Primary point on the body for cough, asthma, and respiratory disorders. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL15: { star: 1, zh: '★ 心俞為心之背俞穴。失眠健忘、心悸、胸悶與心疾第一要穴（「心疾失眠尋心俞」）。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Xinshu is the Back-Shu point of Heart. Primary point on the body for insomnia, palpitations, and cardiac disorders. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL17: { star: 1, zh: '★ 膈俞為八會穴之「血會」、血海。全身貧血、血虛、吐血便血與打嗝嘔吐第一要穴（「血會膈俞」）。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Geshu is the Hui-Meeting of Blood. Primary point on the body for anemia, blood deficiency, bleeding, and hiccups. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL18: { star: 1, zh: '★ 肝俞為肝之背俞穴。黃疸、脅痛、目疾與肝氣鬱結第一要穴。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Ganshu is the Back-Shu point of Liver. Primary point for jaundice, hypochondriac pain, and eye disorders. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL20: { star: 1, zh: '★ 脾俞為脾之背俞穴。脾虛腹脹腹瀉、水腫與大補中氣第一要穴。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Pishu is the Back-Shu point of Spleen. Primary point on the body for Spleen deficiency, diarrhea, and edema. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL23: { star: 1, zh: '★ 腎俞為腎之背俞穴。大補腎陰腎陽、腰痛、耳鳴耳聾、遺精陽痿與氣喘第一要穴（「腎虛腰痛首選腎俞」）。直刺0.8-1.2寸。', en: '★ Shenshu is the Back-Shu point of Kidney. Primary point on the body for Kidney deficiency, lower back pain, tinnitus, and impotence. Perpendicular 0.8-1.2 inch.' },
  BL25: { star: 1, zh: '★ 大腸俞為大腸之背俞穴。便秘、腹瀉腹脹與腰痛第一要穴。直刺0.8-1.2寸。', en: '★ Dachangshu is the Back-Shu point of Large Intestine. Primary point for constipation, diarrhea, and lumbar pain. Perpendicular 0.8-1.2 inch.' },
  BL28: { star: 1, zh: '★ 膀胱俞為膀胱之背俞穴。小便不利、尿頻尿急、水腫與小便痛第一要穴。直刺0.8-1.2寸。', en: '★ Pangguangshu is the Back-Shu point of Bladder. Primary point for dysuria, frequent urination, and urinary tract infections. Perpendicular 0.8-1.2 inch.' },
  BL32: { star: 1, zh: '★ 次髎為八髎穴之核心。痛經、月經不調、催產與腰骶痛第一要穴（「婦科痛經首選次髎」）。直刺0.8-1.2寸。', en: '★ Ciliao is the core point of the Ba Liao. Primary point on the body for dysmenorrhea, labor promotion, and lumbosacral pain. Perpendicular 0.8-1.2 inch.' },
  BL40: { star: 1, zh: '★ 委中為合穴（土/本穴）、膀胱下合穴、四總穴（「腰背委中求」）、馬丹陽天星十二穴。腰背痛、坐骨神經痛與中暑急救第一要穴（「腰背痛點刺委中出血」）。直刺1.0-1.5寸或點刺膕靜脈出血。', en: '★ Weizhong is the He-Sea (Earth), Lower He-Sea of BL, and Four Command Point (Lumbar/Back). Primary point on the body for lower back pain, sciatica, and heatstroke. Perpendicular 1.0-1.5 inch or bleed.' },
  BL43: { star: 1, zh: '★ 膏肓為大補全身虛勞羸瘦、久病咳嗽、肺結核與慢性消耗性疾病第一要穴（「藥石無功尋膏肓」）。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。', en: '★ Gaohuangshu is the primary point on the body for chronic deficiency fatigue, tuberculosis, and extreme weakness. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.' },
  BL57: { star: 1, zh: '★ 承山為腓腸肌痙攣（小腿抽筋）、痔瘡出血與便秘第一要穴（「痔瘡小腿抽筋尋承山」）。直刺0.8-1.2寸。', en: '★ Chengshan is the primary point on the body for hemorrhoids, calf muscle cramps, and constipation. Perpendicular 0.8-1.2 inch.' },
  BL60: { star: 1, zh: '★ 崑崙為經穴（火）、馬丹陽天星十二穴。太陽頭痛項強、腰痛、坐骨神經痛與難產第一要穴。直刺0.5-0.8寸。⚠️ 孕婦嚴禁針刺！', en: '★ Kunlun is the Jing-River (Fire) point. Primary point on the body for occipital headache, lumbar pain, sciatica, and labor promotion. Perpendicular 0.5-0.8 inch; ⚠️ CONTRAINDICATED IN PREGNANCY.' },
  BL62: { star: 1, zh: '★ 申脈為八脈交會穴（通陽蹻脈，配後溪 SI3）。白天癲癇、失眠嗜睡、頭痛項強與足踝痛第一要穴（「申脈陽蹻頭項腰」）。直刺0.3-0.5寸。', en: '★ Shenmai is the Confluent point of Yang Qiao Mai. Primary point on the body for daytime epilepsy, insomnia, somnolence, and ankle pain. Perpendicular 0.3-0.5 inch.' },
  BL67: { star: 1, zh: '★ 至陰為井穴（金/母穴）。艾灸矯治胎位不正（胎位異常）與難產第一要穴（「胎位不正艾灸至陰」）。淺刺0.1寸或艾灸。', en: '★ Zhiyin is the Jing-Well (Metal, Mother) point. Primary point on the body for correcting breech/malpositioned fetus via moxibustion. Subcutaneous 0.1 inch or moxa.' }
};

const BL_SPECIFIC_CAUTIONS = {
  BL1:  { zh: '眼內眥角稍上方，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺眼眶或施灸以免傷及眼神經與視網膜。', en: 'Medial orbital wall; perpendicular 0.3-0.5 cun. ⚠️ Deep orbital insertion & moxibustion strictly prohibited.' },
  BL2:  { zh: '攢竹穴（眉頭凹陷處），直刺或向下斜刺 0.3-0.5 寸。', en: 'Medial end of eyebrow; perpendicular/downward 0.3-0.5 cun.' },
  BL10: { zh: '項後大筋外緣髮際陷中，直刺 0.5-0.8 寸。', en: 'Lateral border of trapezius; perpendicular 0.5-0.8 cun.' },
  BL11: { zh: '第 1 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T1; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL12: { zh: '第 2 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T2; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL13: { zh: '第 3 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T3; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL14: { zh: '第 4 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T4; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL15: { zh: '第 5 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T5; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL16: { zh: '第 6 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T6; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL17: { zh: '第 7 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '1.5 cun lateral to T7; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  BL18: { zh: '第 9 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肝脾。', en: '1.5 cun lateral to T9; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks liver/spleen puncture.' },
  BL19: { zh: '第 10 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肝膽。', en: '1.5 cun lateral to T10; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks liver/gallbladder puncture.' },
  BL20: { zh: '第 11 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷脾臟。', en: '1.5 cun lateral to T11; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks spleen puncture.' },
  BL21: { zh: '第 12 胸椎棘突下旁開 1.5 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷胃腎。', en: '1.5 cun lateral to T12; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks stomach/kidney puncture.' },
  BL22: { zh: '第 1 腰椎棘突下旁開 1.5 寸，直刺 0.8-1.2 寸。', en: '1.5 cun lateral to L1; perpendicular 0.8-1.2 cun.' },
  BL23: { zh: '第 2 腰椎棘突下旁開 1.5 寸，直刺 0.8-1.2 寸。瘦弱者注意深度。', en: '1.5 cun lateral to L2; perpendicular 0.8-1.2 cun.' },
  BL25: { zh: '第 4 腰椎棘突下旁開 1.5 寸，直刺 0.8-1.2 寸。', en: '1.5 cun lateral to L4; perpendicular 0.8-1.2 cun.' },
  BL28: { zh: '第 2 骶後孔旁開 1.5 寸，直刺 0.8-1.2 寸。', en: '1.5 cun lateral to 2nd sacral foramen; perpendicular 0.8-1.2 cun.' },
  BL32: { zh: '第 2 骶後孔中，直刺 0.8-1.2 寸。', en: 'In 2nd sacral foramen; perpendicular 0.8-1.2 cun.' },
  BL40: { zh: '膕橫紋中點，直刺 1.0-1.5 寸或點刺膕靜脈出血。避開膕動脈。', en: 'Midpoint of popliteal crease; perpendicular 1.0-1.5 cun or bleed. Avoid popliteal artery.' },
  BL41: { zh: '第 2 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免氣胸。', en: '3 cun lateral to T2; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  BL42: { zh: '第 3 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免氣胸。', en: '3 cun lateral to T3; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  BL43: { zh: '第 4 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '3 cun lateral to T4; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion contraindicated (pneumothorax risk).' },
  BL44: { zh: '第 5 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免氣胸。', en: '3 cun lateral to T5; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  BL45: { zh: '第 6 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免氣胸。', en: '3 cun lateral to T6; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  BL46: { zh: '第 7 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免氣胸。', en: '3 cun lateral to T7; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  BL47: { zh: '第 9 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肝脾。', en: '3 cun lateral to T9; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks liver/spleen puncture.' },
  BL48: { zh: '第 10 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肝膽。', en: '3 cun lateral to T10; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks liver/gallbladder puncture.' },
  BL50: { zh: '第 12 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷腎臟。', en: '3 cun lateral to T12; oblique 0.5-0.8 cun. ⚠️ Deep insertion risks kidney puncture.' },
  BL57: { zh: '腓腸肌兩肌腹下端凹陷處，直刺 0.8-1.2 寸。', en: 'Depression below gastrocnemius muscle bellies; perpendicular 0.8-1.2 cun.' },
  BL60: { zh: '外踝尖與跟腱之間凹陷處，直刺 0.5-0.8 寸。⚠️ 孕婦嚴禁針刺（針刺易引產）。', en: 'Between lateral malleolus & calcaneal tendon; perpendicular 0.5-0.8 cun. ⚠️ CONTRAINDICATED IN PREGNANCY.' },
  BL62: { zh: '外踝尖直下 1 寸凹陷處，直刺 0.3-0.5 寸。', en: '1 cun below lateral malleolus; perpendicular 0.3-0.5 cun.' },
  BL67: { zh: '小趾外側趾甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸；矯正胎位首選艾灸。', en: 'Lateral side of 5th toenail corner; 0.1 cun or bleed; moxa preferred for breech correction.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^BL([1-9]|[1-5][0-9]|6[0-7])$/.test(code)) return;

  const idx = parseInt(code.replace('BL', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 12), 6);

  // 1. Needling Method EN
  if (typeof BL_NEEDLING_EN[code] === 'string' && point.acumethod_en !== BL_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: BL_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = BL_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (BL_SPECIFIC_CAUTIONS[code]) {
    const spec = BL_SPECIFIC_CAUTIONS[code];
    if (APPLY) {
      point.contraindications = [spec.zh];
      point.cautions_zh = [spec.zh];
      point.cautions_en = [spec.en];
      point.cautions = spec.zh;
    }
  }

  // 3. Clean A13 Disease Category Action Tags
  if (Array.isArray(point.action_tags_zh) && Array.isArray(point.action_tags_en)) {
    const newZh = [];
    const newEn = [];
    const movedZh = [];
    const movedEn = [];

    for (let i = 0; i < point.action_tags_zh.length; i++) {
      const tagZh = point.action_tags_zh[i];
      const tagEn = point.action_tags_en[i];

      if (DISEASE_CAT_RE.test(tagZh)) {
        movedZh.push(tagZh);
        if (tagEn) movedEn.push(tagEn);
      } else {
        newZh.push(tagZh);
        if (tagEn) newEn.push(tagEn);
      }
    }

    if (movedZh.length > 0) {
      changes.push({ code, field: 'action_tags_zh/en (clean A13)', from: movedZh.join(', '), to: newZh.join(', ') });
      if (APPLY) {
        point.action_tags_zh = newZh;
        point.action_tags_en = newEn;
        point.acu_tags = newZh;
        point.action_tags = newEn;

        if (!Array.isArray(point.disease_tags_zh)) point.disease_tags_zh = [];
        if (!Array.isArray(point.disease_tags_en)) point.disease_tags_en = [];

        movedZh.forEach((dz, idx2) => {
          if (!point.disease_tags_zh.includes(dz)) {
            point.disease_tags_zh.push(dz);
            if (movedEn[idx2] && !point.disease_tags_en.includes(movedEn[idx2])) {
              point.disease_tags_en.push(movedEn[idx2]);
            }
          }
        });
      }
    }
  }

  // Align disease_tags_zh and _en 1-to-1
  if (APPLY && Array.isArray(point.disease_tags_zh) && Array.isArray(point.disease_tags_en)) {
    while (point.disease_tags_en.length < point.disease_tags_zh.length) {
      point.disease_tags_en.push(point.disease_tags_zh[point.disease_tags_en.length]);
    }
    if (point.disease_tags_en.length > point.disease_tags_zh.length) {
      point.disease_tags_en = point.disease_tags_en.slice(0, point.disease_tags_zh.length);
    }
  }

  // 4. Exam Pearls & Stars
  if (BL_EXAM_PEARLS[code]) {
    const ep = BL_EXAM_PEARLS[code];
    if (point.exam_star !== ep.star) {
      changes.push({ code, field: 'exam_star', from: point.exam_star, to: ep.star });
      if (APPLY) point.exam_star = ep.star;
    }
    if (point.exam_pearl !== ep.zh) {
      changes.push({ code, field: 'exam_pearl', from: point.exam_pearl, to: ep.zh });
      if (APPLY) point.exam_pearl = ep.zh;
    }
    if (point.exam_pearl_en !== ep.en) {
      changes.push({ code, field: 'exam_pearl_en', from: point.exam_pearl_en, to: ep.en });
      if (APPLY) point.exam_pearl_en = ep.en;
    }
  }

  // 5. BL60 Pregnancy Contraindication
  if (code === 'BL60') {
    const pregZh = '孕婦嚴禁針刺（崑崙穴能強烈通經下胎，針刺極易引發宮縮致流產或早產）。';
    if (!point.contraindications.includes(pregZh)) {
      if (APPLY) {
        point.contraindications.push(pregZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/7 BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/7 BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/7 BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/7 BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across BL channel:\n`);
changes.slice(0, 30).forEach(c => {
  console.log(`  [${c.code}] ${c.field}`);
  console.log(`    FROM: ${JSON.stringify(c.from)}`);
  console.log(`    TO:   ${JSON.stringify(c.to)}\n`);
});

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('Run with --apply to write changes.');
}

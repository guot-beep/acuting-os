/**
 * refine-si-channel.js
 * Refines Small Intestine Channel (手太陽小腸經 SI1–SI19):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Matched length to _zh arrays, sourced from course PDF.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Window of Sky, Master points, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en from course PDF.
 *   6. field_sources: Cite exact course PDF page and URL sources per field.
 *
 * Usage:
 *   node scripts/refine-si-channel.js          (dry run)
 *   node scripts/refine-si-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Toned Pinyin for SI channel
const SI_TONED_PINYIN = {
  SI1: 'Shào Zé',   SI2: 'Qián Gǔ',   SI3: 'Hòu Xī',
  SI4: 'Wàn Gǔ',   SI5: 'Yáng Gǔ',   SI6: 'Yǎng Lǎo',
  SI7: 'Zhī Zhèng', SI8: 'Xiǎo Hǎi',  SI9: 'Jiān Zhēn',
  SI10: 'Nào Shū',  SI11: 'Tiān Zōng', SI12: 'Bǐng Fēng',
  SI13: 'Qū Yuán',  SI14: 'Jiān Wài Shū', SI15: 'Jiān Zhōng Shū',
  SI16: 'Tiān Chuāng', SI17: 'Tiān Róng', SI18: 'Quán Liáo',
  SI19: 'Tīng Gōng'
};

// Needling Method EN (Anatomical depth & safety precautions)
const SI_NEEDLING_EN = {
  SI1: 'Subcutaneous insertion 0.1 cun, or prick to bleed with a three-edged needle. Jing-Well (Metal) point.',
  SI2: 'Perpendicular insertion 0.3–0.5 cun at the ulnar end of the transverse crease proximal to the 5th metacarpophalangeal joint. Ying-Spring (Water) point.',
  SI3: 'Perpendicular insertion 0.5–0.7 cun with a loose fist made, at the ulnar end of the transverse crease proximal to the 5th metacarpophalangeal joint. Shu-Stream (Wood) point & Master point of Du Mai.',
  SI4: 'Perpendicular insertion 0.3–0.5 cun in the depression between the base of the 5th metacarpal bone and the triquetral bone. Yuan-Source point.',
  SI5: 'Perpendicular insertion 0.3–0.5 cun in the depression between the styloid process of the ulna and the triquetral bone. Jing-River (Fire) point.',
  SI6: 'Perpendicular insertion 0.3–0.5 cun in the bony cleft radial to the styloid process of the ulna when the palm faces the chest. Xi-Cleft point.',
  SI7: 'Perpendicular insertion 0.5–0.8 cun on the line joining SI5 and SI8, 5 cun proximal to the dorsal wrist crease. Luo-Connecting point (connects to Heart channel).',
  SI8: 'Perpendicular insertion 0.3–0.5 cun in the depression between the olecranon process of the ulna and the medial epicondyle of the humerus with elbow flexed. He-Sea (Earth) point. Avoid ulnar nerve injury.',
  SI9: 'Perpendicular insertion 0.5–1.0 cun, 1 cun superior to the posterior end of the axillary fold when the arm is adducted.',
  SI10: 'Perpendicular insertion 0.5–1.0 cun directly above SI9 in the depression inferior to the scapular spine.',
  SI11: 'Perpendicular insertion 0.5–1.0 cun in the center of the infraspinous fossa. CAUTION: Deep perpendicular insertion in thin patients risks pneumothorax.',
  SI12: 'Oblique or perpendicular insertion 0.5–0.7 cun in the center of the supraspinous fossa. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SI13: 'Oblique or perpendicular insertion 0.3–0.5 cun on the medial extremity of the supraspinous fossa. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SI14: 'Oblique or perpendicular insertion 0.3–0.7 cun, 3 cun lateral to the lower border of the spinous process of T1. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SI15: 'Oblique or perpendicular insertion 0.3–0.6 cun, 2 cun lateral to the lower border of the spinous process of C7. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SI16: 'Perpendicular insertion 0.3–0.7 cun on the lateral aspect of the neck, posterior to the SCM muscle at the level of the laryngeal protuberance. Window of Sky point. CAUTION: Avoid carotid artery.',
  SI17: 'Perpendicular insertion 0.5–0.7 cun posterior to the angle of the mandible. Window of Sky point. CAUTION: Avoid internal jugular vein and carotid artery.',
  SI18: 'Perpendicular or oblique insertion 0.5–0.8 cun directly below the outer canthus in the depression at the lower border of the zygomatic bone. CAUTION: NO MOXIBUSTION (classical prohibition).',
  SI19: 'Perpendicular insertion 0.5–1.0 cun with the mouth slightly open, in the depression anterior to the tragus and posterior to the condyloid process of the mandible.'
};

// Point Identity ZH & EN
const SI_IDENTITIES = {
  SI1: {
    zh: ['井穴', '金穴（五輸穴/本經少澤）', '通乳急救要穴'],
    en: ['Jing-Well point', 'Metal point (Five-Shu)', 'Key point for lactation & emergency resuscitation']
  },
  SI2: {
    zh: ['滎穴', '水穴（五輸穴）'],
    en: ['Ying-Spring point', 'Water point (Five-Shu)']
  },
  SI3: {
    zh: ['輸穴', '木穴（五輸穴/本經母穴 Tonification Point）', '八脈交會穴（通督脈）', '配 UB62 申脈治頭項脊背病症'],
    en: [
      'Shu-Stream point',
      'Wood point (Five-Shu, Mother/Tonification point)',
      'Master/Confluent point of Du Mai (Governing Vessel)',
      'Paired with UB62 (Shenmai) for neck, spine & back disorders'
    ]
  },
  SI4: {
    zh: ['原穴', '小腸經原穴（黃疸要穴）'],
    en: ['Yuan-Source point of Small Intestine channel', 'Primary point for jaundice & bilious disorders']
  },
  SI5: {
    zh: ['經穴', '火穴（五輸穴/本經本穴 Horary Point）'],
    en: ['Jing-River point', 'Fire point (Five-Shu, Horary point of Small Intestine channel)']
  },
  SI6: {
    zh: ['郄穴（小腸經急症與老年病要穴）'],
    en: ['Xi-Cleft point (key point for acute pain & geriatric conditions)']
  },
  SI7: {
    zh: ['絡穴（小腸經別絡，通心經）', '疣目皮膚病要穴'],
    en: ['Luo-Connecting point (connects to Heart channel)', 'Key point for warts & dermatological conditions']
  },
  SI8: {
    zh: ['合穴', '土穴（五輸穴/本經子穴 Sedation Point）', '肘部解剖要穴'],
    en: ['He-Sea point', 'Earth point (Five-Shu, Child/Sedation point)', 'Major elbow anatomical point']
  },
  SI9: {
    zh: ['肩關節局部要穴'],
    en: ['Local point for posterior shoulder joint']
  },
  SI10: {
    zh: ['交會穴（手太陽、陽維脈、陽蹻脈）', '肩胛上部要穴'],
    en: ['Intersection point (SI, Yang Wei & Yang Qiao Mai)', 'Upper scapular point']
  },
  SI11: {
    zh: ['肩胛部要穴（天宗）', '通乳、寬胸、止肩痛第一要穴'],
    en: ['Primary scapular point (Tianzong)', 'Essential point for breast disorders, lactation & shoulder pain']
  },
  SI12: {
    zh: ['交會穴（手太陽、手陽明、手少陽、足少陽）'],
    en: ['Intersection point (SI, LI, TE, GB channels)']
  },
  SI13: {
    zh: ['肩胛崗上緣局部穴'],
    en: ['Local point on superior scapular fossa']
  },
  SI14: {
    zh: ['肩背部解剖穴（C7/T1旁開3寸）'],
    en: ['Upper back point (3 cun lateral to T1)']
  },
  SI15: {
    zh: ['肩頸交界部解剖穴（C7旁開2寸）'],
    en: ['Neck/shoulder boundary point (2 cun lateral to C7)']
  },
  SI16: {
    zh: ['天牖五穴之天窗（Window of Sky Point）', '頸部解剖要穴'],
    en: ['Window of Sky point (Tianchuang)', 'Essential neck anatomical point']
  },
  SI17: {
    zh: ['天牖五穴之天容（Window of Sky Point）', '咽喉耳疾要穴'],
    en: ['Window of Sky point (Tianrong)', 'Key point for throat & ear disorders']
  },
  SI18: {
    zh: ['面部解剖要穴（顴髎）', '⚠️ 古典禁灸（禁灸穴）'],
    en: ['Facial landmark point (Quanliao)', 'CONTRAINDICATED FOR MOXIBUSTION (classical prohibition)']
  },
  SI19: {
    zh: ['交會穴（手太陽、手少陽、足少陽）', '耳疾急救第一要穴（聽宮）'],
    en: ['Intersection point (SI, TE, GB channels)', 'Primary ear point for tinnitus & deafness (Tinggong)']
  }
};

// Functions ZH & EN (Length-matched arrays)
const SI_FUNCTIONS_ZH = {
  SI1: ['清熱利竅', '通乳通絡', '醒腦復甦'],
  SI2: ['清風熱', '消腫止痛', '通利耳目咽喉'],
  SI3: ['通督脈', '舒筋利節', '清神志熱症', '通絡止痛'],
  SI4: ['舒筋通絡', '清熱瀉火', '退黃祛濕'],
  SI5: ['清熱解毒', '消腫止痛', '安神定志'],
  SI6: ['舒筋活絡', '明目止痛', '緩急止痛'],
  SI7: ['清熱解表', '安神定志', '通絡止痛'],
  SI8: ['清熱散結', '安神定志', '通絡舒筋'],
  SI9: ['祛風通絡', '利肩止痛'],
  SI10: ['舒筋活絡', '利肩止痛'],
  SI11: ['寬胸理氣', '通乳散結', '通絡止痛'],
  SI12: ['祛風通絡', '利肩胛'],
  SI13: ['舒筋活絡', '止痛'],
  SI14: ['祛風散寒', '通絡止痛'],
  SI15: ['宣肺止咳', '通絡止痛'],
  SI16: ['利耳咽喉', '理氣安神', '通絡止痛'],
  SI17: ['清熱利咽', '消腫散結', '利耳通竅'],
  SI18: ['祛風止痛', '清熱消腫'],
  SI19: ['聰耳通竅', '安神止痛']
};

const SI_FUNCTIONS_EN = {
  SI1: ['Clears heat and benefits sensory orifices', 'Promotes lactation and activates channel', 'Revives consciousness'],
  SI2: ['Clears wind-heat', 'Reduces swelling and alleviates pain', 'Benefits eyes, ears and throat'],
  SI3: ['Regulates Governing Vessel', 'Relaxes sinews and benefits joints', 'Clears heat and calms spirit', 'Activates channel and alleviates pain'],
  SI4: ['Activates channel and alleviates pain', 'Clears heat and reduces swelling', 'Clears heat and treats jaundice'],
  SI5: ['Clears heat and toxins', 'Reduces swelling and alleviates pain', 'Calms the spirit'],
  SI6: ['Activates channel and alleviates pain', 'Benefits shoulder, arm and eyes', 'Moderates acute pain conditions'],
  SI7: ['Clears heat and releases exterior', 'Calms spirit', 'Activates channel and alleviates pain'],
  SI8: ['Clears heat and dissipates swelling', 'Calms spirit', 'Activates channel and relaxes sinews'],
  SI9: ['Expels wind and activates channel', 'Benefits shoulder and alleviates pain'],
  SI10: ['Benefits shoulder and activates channel', 'Alleviates scapular pain'],
  SI11: ['Unbinds chest and moves Qi', 'Benefits breasts and promotes lactation', 'Activates channel and alleviates pain'],
  SI12: ['Expels wind and activates channel', 'Benefits shoulder and scapula'],
  SI13: ['Benefits shoulder and scapula', 'Alleviates pain'],
  SI14: ['Expels wind and cold', 'Activates channel and alleviates pain'],
  SI15: ['Descends Lung Qi', 'Activates channel and alleviates pain'],
  SI16: ['Benefits ears, throat and voice', 'Regulates Qi and calms spirit', 'Activates channel and alleviates pain'],
  SI17: ['Clears heat and benefits neck and throat', 'Disperses swelling', 'Benefits ears and descends rebellious Qi'],
  SI18: ['Eliminates wind and alleviates pain', 'Clears heat and reduces swelling'],
  SI19: ['Benefits ears and opens orifices', 'Calms spirit and alleviates pain']
};

// Indications ZH & EN (Length-matched arrays)
const SI_INDICATIONS_ZH = {
  SI1: ['乳汁不足、乳腺炎', '頭痛、目赤、咽喉腫痛', '昏迷急救'],
  SI2: ['熱病無汗、頭痛', '目赤、耳鳴、咽喉腫痛', '手指麻木拘急'],
  SI3: ['頭項強痛、脊背痛', '急性腰扭傷', '癲狂、熱病、夜汗'],
  SI4: ['頭痛、項強、腕痛', '黃疸、膽囊炎', '熱病無汗'],
  SI5: ['頭痛、項強、腕痛', '目赤、耳鳴、齒痛', '癲狂'],
  SI6: ['肩臂腰腿急性疼痛', '目視不明、老年性眼疾', '項強、肘臂拘急'],
  SI7: ['頭痛、項強、肘臂痛', '癲狂、熱病', '疣目、皮膚贅疣'],
  SI8: ['肘臂痛、肘關節攣急', '癲癇、精神病', '瘰癧、頸頷腫痛'],
  SI9: ['肩臂疼痛、運動障礙', '肩關節周圍炎'],
  SI10: ['肩臂疼痛、痠軟無力', '肩胛痛'],
  SI11: ['肩胛疼痛、背痛', '乳腺炎、乳汁不足、胸脅痛', '咳嗽、喘息'],
  SI12: ['肩胛疼痛、肩膀僵硬', '手臂麻木痛'],
  SI13: ['肩胛疼痛、背部僵硬', '肩臂痛'],
  SI14: ['肩背疼痛、頸項強痛', '上肢麻木'],
  SI15: ['肩背疼痛、頸項強痛', '咳嗽、氣喘'],
  SI16: ['耳鳴、耳聾、暴瘖失音', '咽喉腫痛、癭氣頸腫', '頸項強痛'],
  SI17: ['咽喉腫痛、瘰癧癭氣', '耳鳴、耳聾', '梅核氣、氣逆'],
  SI18: ['口眼喎斜、面肌痙攣', '齒痛、頰腫', '三叉神經痛'],
  SI19: ['耳鳴、耳聾、耳癤流膿', '顳顎關節紊亂、齒痛', '癲狂']
};

const SI_INDICATIONS_EN = {
  SI1: ['Insufficient lactation and mastitis', 'Headache, red eyes, sore throat', 'Loss of consciousness and emergency'],
  SI2: ['Febrile disease without sweating, headache', 'Red eyes, tinnitus, sore throat', 'Numbness and stiffness of fingers'],
  SI3: ['Stiff neck, headache, spinal pain', 'Acute lumbar sprain', 'Mania, febrile diseases, night sweats'],
  SI4: ['Headache, neck rigidity, wrist pain', 'Jaundice and cholecystitis', 'Febrile disease without sweating'],
  SI5: ['Headache, neck rigidity, wrist pain', 'Red eyes, tinnitus, toothache', 'Mania'],
  SI6: ['Acute pain of shoulder, arm and lower back', 'Blurry vision and failing vision in elderly', 'Neck rigidity and elbow contracture'],
  SI7: ['Headache, neck rigidity, arm pain', 'Mania and febrile diseases', 'Warts and skin excrescences'],
  SI8: ['Elbow pain and joint contracture', 'Epilepsy and mental disorders', 'Scrofula and submandibular swelling'],
  SI9: ['Shoulder pain and motor impairment', 'Periarthritis of shoulder'],
  SI10: ['Shoulder aching and weakness', 'Pain in scapular region'],
  SI11: ['Pain in scapular and back region', 'Mastitis, insufficient lactation, chest pain', 'Cough and asthma'],
  SI12: ['Scapular pain and shoulder stiffness', 'Arm numbness and pain'],
  SI13: ['Scapular pain and back stiffness', 'Shoulder and arm pain'],
  SI14: ['Shoulder and back pain, neck rigidity', 'Upper extremity numbness'],
  SI15: ['Shoulder and back pain, neck rigidity', 'Cough and asthma'],
  SI16: ['Tinnitus, deafness, sudden loss of voice', 'Sore throat, goiter, neck masses', 'Neck stiffness and pain'],
  SI17: ['Sore throat, scrofula, goiter', 'Tinnitus and deafness', 'Plum-pit Qi and rebellious Qi'],
  SI18: ['Facial paralysis and eyelid twitching', 'Toothache and cheek swelling', 'Trigeminal neuralgia'],
  SI19: ['Tinnitus, deafness, otorrhea', 'Mandibular joint dysfunction, toothache', 'Mania']
};

// Exam Pearls & Stars
const SI_EXAM_PEARLS = {
  SI3: {
    star: 1,
    zh: '★ 輸穴（木）。八脈交會穴之一（通督脈），配足太陽申脈UB62治療頭項強痛、脊背痛與急性腰扭傷。通督脈第一要穴。',
    en: '★ Shu-Stream (Wood) point. Master point of Du Mai (Governing Vessel). Paired with UB62 (Shenmai) for stiff neck, spinal pain, and acute lumbar sprain. Primary point for Governing Vessel.'
  },
  SI6: {
    star: 1,
    zh: '★ 郄穴。養老穴善治急性痛證與老年眼疾（目視不明、視力減退）。配柱骨穴治療急性項強肩臂痛。',
    en: '★ Xi-Cleft point. Yanglao treats acute pain and eye disorders of the elderly (blurry/failing vision). Combines with local points for acute neck/shoulder strain.'
  },
  SI11: {
    star: 1,
    zh: '★ 天宗在肩胛骨崗下窩中央。為治療肩胛痛、胸脅痛、乳腺炎與乳汁不足第一要穴。直刺0.5-1.0寸，薄弱患者注意避開氣胸。',
    en: '★ Tianzong is in the center of the infraspinous fossa. Primary point for scapular pain, chest oppression, mastitis, and insufficient lactation. Perpendicular 0.5-1.0 inch; caution for pneumothorax in thin patients.'
  },
  SI16: {
    star: 1,
    zh: '★ 天窗為天牖五穴之一（Window of Sky Point）。主治耳鳴、耳聾、暴瘖失音與咽喉腫痛。注意避開頸動脈。',
    en: '★ Tianchuang is a Window of Sky point. Treats tinnitus, deafness, sudden loss of voice, and sore throat. Avoid carotid artery.'
  },
  SI17: {
    star: 1,
    zh: '★ 天容為天牖五穴之一（Window of Sky Point）。主治咽喉腫痛、瘰癧癭氣、耳鳴耳聾。避開頸內靜脈與頸動脈。',
    en: '★ Tianrong is a Window of Sky point. Treats sore throat, scrofula, goiter, and ear disorders. Avoid internal jugular vein and carotid artery.'
  },
  SI18: {
    star: 1,
    zh: '★ 顴髎為面部解剖標誌穴，主治口眼喎斜、面肌痙攣、齒痛與三叉神經痛。⚠️ 古典禁灸。',
    en: '★ Quanliao is a facial landmark point for facial paralysis, twitching, toothache, and trigeminal neuralgia. ⚠️ CONTRAINDICATED FOR MOXIBUSTION.'
  },
  SI19: {
    star: 1,
    zh: '★ 聽宮為手太陽、手少陽、足少陽三經交會穴。耳門、聽宮、聽會為耳前三穴，聽宮為治療耳鳴耳聾第一要穴。張口取穴直刺0.5-1.0寸。',
    en: '★ Tinggong is the meeting point of SI, TE, and GB channels. Primary point for tinnitus, deafness, and ear drainage. Locate and needle with mouth slightly open.'
  }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

// Helper for per-field sources
const makeFieldSources = (code, pageNum) => ({
  acumethod_zh: ['CloudTCM', 'eLotus CORE'],
  acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`],
  functions_zh: ['CloudTCM'],
  functions_en: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
  indications_zh: ['CloudTCM'],
  indications_en: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
  anatomy_zh: ['CloudTCM'],
  anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
  exam_pearl: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
  exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
  combine_points_zh: ['CloudTCM'],
  cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
  cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
});

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^SI([1-9]|1[0-9])$/.test(code)) return;

  const idx = parseInt(code.replace('SI', ''), 10);
  const pageNum = idx <= 8 ? 1 : idx <= 18 ? 2 : 3;

  // 1. Toned Pinyin
  if (SI_TONED_PINYIN[code] && point.pinyin !== SI_TONED_PINYIN[code]) {
    changes.push({ code, field: 'pinyin', from: point.pinyin, to: SI_TONED_PINYIN[code] });
    if (APPLY) point.pinyin = SI_TONED_PINYIN[code];
  }

  // 2. Needling Method EN
  if (SI_NEEDLING_EN[code] && point.acumethod_en !== SI_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: SI_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = SI_NEEDLING_EN[code];
  }

  // 3. Point Identity ZH & EN
  if (SI_IDENTITIES[code]) {
    if (JSON.stringify(point.point_identity_zh) !== JSON.stringify(SI_IDENTITIES[code].zh)) {
      changes.push({ code, field: 'point_identity_zh', from: point.point_identity_zh, to: SI_IDENTITIES[code].zh });
      if (APPLY) point.point_identity_zh = SI_IDENTITIES[code].zh;
    }
    if (JSON.stringify(point.point_identity_en) !== JSON.stringify(SI_IDENTITIES[code].en)) {
      changes.push({ code, field: 'point_identity_en', from: point.point_identity_en, to: SI_IDENTITIES[code].en });
      if (APPLY) point.point_identity_en = SI_IDENTITIES[code].en;
    }
  }

  // 4. Functions ZH & EN
  if (SI_FUNCTIONS_ZH[code]) {
    changes.push({ code, field: 'functions_zh', from: point.functions_zh, to: SI_FUNCTIONS_ZH[code] });
    if (APPLY) point.functions_zh = SI_FUNCTIONS_ZH[code];
  }
  if (SI_FUNCTIONS_EN[code]) {
    changes.push({ code, field: 'functions_en', from: point.functions_en, to: SI_FUNCTIONS_EN[code] });
    if (APPLY) point.functions_en = SI_FUNCTIONS_EN[code];
  }

  // 5. Indications ZH & EN
  if (SI_INDICATIONS_ZH[code]) {
    changes.push({ code, field: 'indications_zh', from: point.indications_zh, to: SI_INDICATIONS_ZH[code] });
    if (APPLY) point.indications_zh = SI_INDICATIONS_ZH[code];
  }
  if (SI_INDICATIONS_EN[code]) {
    changes.push({ code, field: 'indications_en', from: point.indications_en, to: SI_INDICATIONS_EN[code] });
    if (APPLY) point.indications_en = SI_INDICATIONS_EN[code];
  }

  // 6. Clean A13 Disease Category Action Tags
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

  // 7. Exam Pearls & Stars
  if (SI_EXAM_PEARLS[code]) {
    const ep = SI_EXAM_PEARLS[code];
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

  // 8. SI18 Moxibustion Prohibition
  if (code === 'SI18') {
    const noMoxa = '禁灸（本穴古典禁灸，不宜使用艾灸）';
    if (!point.contraindications.includes(noMoxa)) {
      changes.push({ code, field: 'contraindications[] (SI18 no moxa)', from: point.contraindications.join('; '), to: noMoxa });
      if (APPLY) {
        point.contraindications.push(noMoxa);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 9. field_sources & review_status
  if (APPLY) {
    point.field_sources = makeFieldSources(code, pageNum);
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s):\n`);
changes.forEach(c => {
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

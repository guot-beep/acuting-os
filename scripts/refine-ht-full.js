/**
 * refine-ht-full.js
 * Full HT channel refine — 10 items per ACUPOINT_CARD_TEMPLATE.md (2026-07-30)
 *
 * Items addressed:
 *  A4  functions_en / indications_en length must match _zh, or entire _en left empty
 *  TAG action_tags_en / disease_tags_en must be real English (lookup glossary, add missing)
 *  DEL Remove scaffold suffixes "(Indication)" "(TCM Action)" from tags
 *  MOV Move 系統疾病 category strings from action_tags → disease_tags
 *  RV  review_status → "draft" (only Ting's RV1 upgrades to source_checked)
 *  +   anatomy_en, moxa_en, massage_en, combine_points_en, modern_research_en,
 *      cautions_en, contraindications_en (new _en fields)
 *  ID  point_identity_zh/_en: move identity words out of action_tags
 *  EXM exam_pearl, exam_pearl_en  (eLotus/AD sourced)
 *  PIN toned pinyin
 *  FZH functions_zh ≤ 8 (refine HT2/3/6/7/8/9)
 *  SRC field_sources skeleton
 *  FIX HT1 other_names_zh: remove "極泉,天泉" (天泉 = PC2, not HT1 alias)
 *
 * Usage:
 *   node scripts/refine-ht-full.js          # dry run
 *   node scripts/refine-ht-full.js --apply  # write to 361.json
 */

const fs   = require('fs');
const path = require('path');
const APPLY = process.argv.includes('--apply');
const FILE  = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const GFILE = path.join(__dirname, '..', 'data', 'config', 'acupoint_tag_glossary.json');

// ── Load data ────────────────────────────────────────────────────────────────
const db      = JSON.parse(fs.readFileSync(FILE,  'utf8'));
const glossary = JSON.parse(fs.readFileSync(GFILE, 'utf8'));

// Build flat lookup: zh → en from glossary.action + glossary.disease
const GLOSS = {};
Object.assign(GLOSS, glossary.action  || {});
Object.assign(GLOSS, glossary.disease || {});

// Identity words that must NOT be in action_tags
const IDENTITY_WORDS = new Set(glossary.identity_not_action || [
  '井穴','滎穴','輸穴','經穴','合穴','原穴','絡穴','郄穴','募穴','背俞穴','八脈交會穴'
]);

// Disease-category strings that belong in disease_tags, not action_tags
const DISEASE_CATEGORY_STRINGS = [
  '消化系統疾病','呼吸系統疾病','神經系統疾病','心血管疾病','生殖系統疾病',
  '運動系統疾病','精神神志疾病','前陰疾病','泌尿系統疾病','耳鼻喉疾病','皮膚病'
];
const DISEASE_CAT_EN = {
  '消化系統疾病': 'Digestive System Disorders',
  '呼吸系統疾病': 'Respiratory System Disorders',
  '神經系統疾病': 'Neurological Disorders',
  '心血管疾病':   'Cardiovascular Disorders',
  '生殖系統疾病': 'Reproductive System Disorders',
  '運動系統疾病': 'Locomotor & Musculoskeletal Disorders',
  '精神神志疾病': 'Mental & Psychiatric Disorders',
  '前陰疾病':     'Anterior Genital Disorders',
  '泌尿系統疾病': 'Urinary System Disorders',
  '耳鼻喉疾病':   'ENT Disorders',
  '皮膚病':       'Dermatological Disorders',
};

// ── Per-point data ───────────────────────────────────────────────────────────

const HT_TONED_PINYIN = {
  HT1: 'Jí Quán',  HT2: 'Qīng Líng', HT3: 'Shào Hǎi',
  HT4: 'Líng Dào', HT5: 'Tōng Lǐ',   HT6: 'Yīn Xì',
  HT7: 'Shén Mén', HT8: 'Shào Fǔ',   HT9: 'Shào Chōng',
};

// point_identity_zh / _en (五腧/特定穴身分)
const HT_IDENTITY = {
  HT1: { zh: [],              en: [] },
  HT2: { zh: [],              en: [] },
  HT3: { zh: ['合穴','五輸穴(水穴)'],     en: ['He-Sea point', 'Water point (Five-Shu)'] },
  HT4: { zh: ['經穴','五輸穴(金穴)'],     en: ['Jing-River point', 'Metal point (Five-Shu)'] },
  HT5: { zh: ['絡穴'],                    en: ['Luo-Connecting point'] },
  HT6: { zh: ['郄穴'],                    en: ['Xi-Cleft point'] },
  HT7: { zh: ['輸穴','原穴','五輸穴(土穴)'], en: ['Shu-Stream point', 'Yuan-Source point', 'Earth point (Five-Shu, Horary)'] },
  HT8: { zh: ['滎穴','五輸穴(火穴)'],     en: ['Ying-Spring point', 'Fire point (Five-Shu, Horary)'] },
  HT9: { zh: ['井穴','五輸穴(木穴)'],     en: ['Jing-Well point', 'Wood point (Five-Shu)'] },
};

// action_tags_zh — cleaned (≤8, no identity, no category strings)
const HT_ACTION_TAGS_ZH = {
  HT1: ['寬胸理氣','養心安神','通經活絡','開竅急救'],
  HT2: ['寬胸理氣','通經止痛','舒筋活絡','明目'],
  HT3: ['清心熱','化痰安神','通利心經','舒筋利節'],
  HT4: ['養心安神','通經止痛','利舌開音','行氣'],
  HT5: ['養心安神','通利舌竅','清心瀉熱','通絡行氣'],
  HT6: ['養心安神','清虛熱','止盜汗','通絡止痛'],
  HT7: ['養心安神','清心瀉火','通絡止痛','補益心氣'],
  HT8: ['清心火','通絡止痛','利尿通淋','養心安神'],
  HT9: ['清心開竅','急救復甦','清熱解毒','回陽救逆'],
};

// disease_tags_zh (conditions, not functions)
const HT_DISEASE_TAGS_ZH = {
  HT1: ['心痛','胸悶','上肢麻木','心悸','脅肋痛'],
  HT2: ['頭痛目黃','肩臂痛','脅痛','心痛','腋下淋巴結炎'],
  HT3: ['心痛','癲狂癇','肘臂痛','腋脅痛','手顫'],
  HT4: ['心痛','心悸','失音','舌強不語','腕臂痛'],
  HT5: ['心悸','怔忡','失語','舌強','腕臂痛'],
  HT6: ['心痛','盜汗','失音','肘臂痛','吐血'],
  HT7: ['心痛','失眠','癲狂','健忘','煩躁'],
  HT8: ['心痛','遺尿','陰部痛','掌中熱','口瘡'],
  HT9: ['心痛','昏迷急救','熱病','癲狂','胸痛'],
};

// functions_zh refined ≤8 items (only HT2/3/6/7/8/9 need work; HT1/4/5 already ≤8)
const HT_FUNCTIONS_ZH = {
  HT1: null, // already fine — keep existing
  HT2: ['寬胸理氣','通經止痛','舒筋活絡','散結消腫','清熱明目'],
  HT3: ['清心熱','化痰安神','通利心經','舒筋利節'],
  HT4: null,
  HT5: null,
  HT6: ['養心安神','清退虛熱','固表止汗','通絡止痛'],
  HT7: ['養心安神','清心瀉火','通絡止痛','補益心氣'],
  HT8: ['清心火','通絡止痛','利尿通淋','養心安神'],
  HT9: ['清心開竅','急救復甦','清熱解毒','回陽救逆'],
};

// functions_en (paired length = same count as functions_zh; source: eLotus/AD)
const HT_FUNCTIONS_EN = {
  HT1: [
    'Unbinds the chest and regulates Heart Qi',
    'Calms the spirit and nourishes the Heart',
    'Activates the channel and alleviates pain',
    'Opens the orifices and resuscitates (acute use)',
  ],
  HT2: [
    'Unbinds the chest and moves Qi',
    'Activates the channel and alleviates pain',
    'Relaxes sinews and invigorates the network vessels',
    'Softens hardness and disperses nodules',
    'Clears heat and brightens the eyes',
  ],
  HT3: [
    'Clears Heart heat',
    'Transforms phlegm and calms the spirit',
    'Benefits the Heart channel',
    'Relaxes sinews and benefits the joints',
  ],
  HT4: [
    'Calms the spirit',
    'Activates the channel and alleviates pain',
    'Benefits the tongue and restores voice',
    'Moves Qi',
  ],
  HT5: [
    'Calms the spirit',
    'Opens the portals and benefits the tongue',
    'Clears Heart heat',
    'Activates the channel and moves Qi',
  ],
  HT6: [
    'Nourishes the Heart and calms the spirit',
    'Clears deficiency heat',
    'Consolidates the exterior and stops sweating',
    'Activates the channel and alleviates pain',
  ],
  HT7: [
    'Nourishes the Heart and calms the spirit',
    'Clears Heart fire',
    'Activates the channel and alleviates pain',
    'Supplements Heart Qi',
  ],
  HT8: [
    'Clears Heart fire',
    'Activates the channel and alleviates pain',
    'Promotes urination and relieves painful urinary dysfunction',
    'Nourishes the Heart and calms the spirit',
  ],
  HT9: [
    'Clears the Heart and opens the orifices',
    'Resuscitates and restores consciousness (emergency)',
    'Clears heat and resolves toxins',
    'Restores Yang (for extreme cold patterns)',
  ],
};

// indications_en (length-matched to indications_zh; source: eLotus/AD)
const HT_INDICATIONS_EN = {
  HT1: [
    'Heart pain',
    'Chest oppression',
    'Costal pain',
    'Upper limb numbness and paralysis',
    'Palpitations',
  ],
  HT2: [
    'Headache with jaundice (yellow eyes)',
    'Shoulder and arm pain',
    'Hypochondriac pain',
    'Heart pain',
  ],
  HT3: [
    'Heart pain',
    'Mania and epilepsy patterns',
    'Elbow and arm pain',
    'Axillary and costal pain',
    'Tremor of the hand',
  ],
  HT4: [
    'Heart pain',
    'Palpitations',
    'Loss of voice (sudden aphonia)',
    'Stiff tongue with difficult speech',
    'Wrist and arm pain',
  ],
  HT5: [
    'Palpitations',
    'Severe palpitations (zheng chong)',
    'Aphasia',
    'Stiff tongue',
    'Wrist and arm pain',
  ],
  HT6: [
    'Heart pain',
    'Night sweats',
    'Loss of voice',
    'Elbow and arm pain',
    'Hematemesis (blood-spitting from deficiency heat)',
  ],
  HT7: [
    'Heart pain',
    'Insomnia',
    'Mania and withdrawal patterns',
    'Poor memory and forgetfulness',
    'Agitation and restlessness',
  ],
  HT8: [
    'Heart pain',
    'Enuresis',
    'Genital pain',
    'Heat sensation in the palms',
    'Mouth sores',
  ],
  HT9: [
    'Heart pain',
    'Loss of consciousness (emergency resuscitation)',
    'Febrile disease',
    'Mania and withdrawal',
    'Chest pain',
  ],
};

// exam_pearl + exam_pearl_en
const HT_EXAM_PEARL = {
  HT1: {
    zh: '★ 極泉在腋窩，避開腋動脈直刺0.3–0.5寸。「彈撥」手法可治臟躁（癔病）。心絞痛急救：配神門HT7、內關PC6。',
    en: '★ Located in the axilla; avoid axillary artery; insert 0.3–0.5 cun. "Plucking" technique (dan bo) indicated for hysteria (zang zao). For acute cardiac pain: combine with HT7 + PC6.',
  },
  HT2: {
    zh: '★ 《經穴匯解》記載「禁刺」，現代以謹慎針刺為主，不做強刺激。多用於肩臂痛與腋淋巴結炎。',
    en: '★ Historically recorded as "forbidden to needle" (《Keiketsu Kaikai》). Modern practice allows careful, gentle needling. Clinically used for shoulder/arm pain and axillary lymphadenitis.',
  },
  HT3: {
    zh: '★ 合穴（水）。清心熱、化痰安神的要穴。治癲狂癇配大陵PC7、豐隆ST40。屈肘取穴。',
    en: '★ He-Sea (Water) point. Key point for clearing Heart heat and calming the spirit with phlegm. For mania/epilepsy: combine PC7 (Daling) + ST40 (Fenglong). Locate with elbow slightly flexed.',
  },
  HT4: {
    zh: '★ 經穴（金）。治暴喑（突發失音）配廉泉CV23、天突CV22。心絞痛配內關PC6、心俞BL15。',
    en: '★ Jing-River (Metal) point. For sudden loss of voice: combine CV23 (Lianquan) + CV22 (Tiantu). For cardiac pain: combine PC6 (Neiguan) + BL15 (Xinshu).',
  },
  HT5: {
    zh: '★ 絡穴。通里為心經與小腸經絡穴。治失語、舌強：配廉泉CV23、啞門GV15。治心悸怔忡：配神門HT7、內關PC6。',
    en: '★ Luo-Connecting point. For aphasia and stiff tongue: combine CV23 (Lianquan) + GV15 (Yamen). For palpitations: combine HT7 (Shenmen) + PC6 (Neiguan).',
  },
  HT6: {
    zh: '★ 郄穴。陰郄治陰虛盜汗，是止盜汗要穴。配後溪SI3、肺俞BL13治骨蒸潮熱盜汗。注意抗凝血患者。',
    en: '★ Xi-Cleft point. Yin Xi specialises in night sweats from Yin deficiency. Combine SI3 (Houxi) + BL13 (Feishu) for steaming-bone fever with night sweats. Caution in patients on anticoagulants.',
  },
  HT7: {
    zh: '★★ 原穴＋輸穴（土）。神門是心經最重要的穴位之一，養心安神第一要穴。失眠、心悸、健忘首選。四總穴之「心」。',
    en: '★★ Yuan-Source + Shu-Stream (Earth/Horary) point. Shenmen is the primary point for nourishing the Heart and calming the spirit. First choice for insomnia, palpitations, and poor memory.',
  },
  HT8: {
    zh: '★ 滎穴（火）。清心火的要穴。治口瘡、遺尿、陰部痛（心火下移小腸）。配中極CV3、三陰交SP6治遺尿。',
    en: '★ Ying-Spring (Fire/Horary) point. Key point for clearing Heart fire. Treats mouth sores, enuresis, and genital pain (Heart fire moving into Small Intestine). Combine CV3 + SP6 for enuresis.',
  },
  HT9: {
    zh: '★ 井穴（木）。少衝主急救，點刺出血清心開竅。治昏迷配水溝GV26、十宣EX-UE11。心絞痛急救首選之一。',
    en: '★ Jing-Well (Wood) point. Shaochong is the emergency-resuscitation point of the Heart channel; prick to bleed. For coma: combine GV26 (Shuigou) + EX-UE11 (Shixuan). One of the first-aid points for acute cardiac pain.',
  },
};

// anatomy_en (short, per WHO SAPL style)
const HT_ANATOMY_EN = {
  HT1: 'Located in the center of the axilla, at the pulsation of the axillary artery. Deep to pectoralis major and coracobrachialis. The brachial plexus (ulnar, median, and medial cutaneous nerves of the forearm) and the axillary artery and vein are present in this region.',
  HT2: 'On the medial aspect of the arm, in the groove medial to biceps brachii. The basilic vein and superior ulnar collateral artery run here; the medial cutaneous nerve of the forearm and the ulnar nerve are present.',
  HT3: 'At the medial end of the cubital crease, between the medial epicondyle and the biceps brachii tendon. Pronator teres and brachialis lie deep. The basilic vein, superior/inferior ulnar collateral arteries, and ulnar recurrent artery are nearby; the medial cutaneous nerve of the forearm passes here, with the median nerve anterolaterally.',
  HT4: 'On the anteromedial forearm, between flexor carpi ulnaris and flexor digitorum superficialis. The ulnar artery runs lateral to this point; the medial cutaneous nerve of the forearm is present, with the ulnar nerve on the ulnar side of the flexor carpi ulnaris tendon.',
  HT5: 'On the anteromedial forearm, 1 cun proximal to the wrist crease, between the ulnar artery (lateral) and the ulnar nerve. The luo-connecting point of the Heart channel.',
  HT6: 'On the anteromedial forearm, 0.5 cun proximal to the wrist crease, between the ulnar artery and the flexor carpi ulnaris tendon. The ulnar nerve is nearby. Xi-cleft point; exercise caution in patients on anticoagulants.',
  HT7: 'At the wrist, at the radial side of the flexor carpi ulnaris tendon, in the depression at the proximal border of the pisiform bone. The ulnar artery and ulnar nerve run laterally; the dorsal cutaneous branch of the ulnar nerve is nearby.',
  HT8: 'On the palm, between the 4th and 5th metacarpal bones, where the tip of the little finger touches when the fist is clenched. Common palmar digital vessels and nerves are present.',
  HT9: 'On the radial side of the little finger, 0.1 cun proximal to the corner of the nail. The proper palmar digital artery and nerve are present at this level.',
};

// moxa_en
const HT_MOXA_EN = {
  HT1: 'Moxibustion is generally avoided at HT1 due to its location near the axillary artery. If moxibustion is indicated clinically, use indirect moxa (ginger slice) with extreme care; direct moxa is contraindicated. Far-infrared lamp may be used cautiously.',
  HT2: 'Warm moxibustion: suspend a moxa stick 3–4 cm from the skin for 10–15 minutes. Gentle moxa is preferred over direct moxa at this location due to the nearby vasculature.',
  HT3: 'Warm moxibustion: hold moxa stick 3 cm from skin for 10–15 minutes per session with the elbow slightly flexed. Suitable for cold-damp bi and chronic elbow conditions.',
  HT4: 'Warm moxibustion: suspend moxa stick 2–3 cm from skin for 10–15 minutes. Suitable for cold patterns with Heart Qi deficiency.',
  HT5: 'Warm moxibustion: suspend moxa stick 2–3 cm from skin for 10–15 minutes. Moxibustion is primarily used for deficiency cold patterns affecting speech and the Heart.',
  HT6: 'Warm moxibustion: suspend moxa stick 2–3 cm from skin for 10–15 minutes. Moxa is less commonly used at HT6, which primarily treats yin deficiency heat; moxa is reserved for mixed deficiency-cold patterns.',
  HT7: 'Warm moxibustion: suspend moxa stick 2–3 cm from skin for 10–15 minutes per session. Moxibustion at Shenmen is used for Heart Yang deficiency patterns presenting with cold extremities and severe fatigue.',
  HT8: 'Warm moxibustion: moxa stick 2–3 cm from skin, 10 minutes. Moxa is generally avoided for HT8 when Heart fire is the pattern — needle and reduce instead. Reserved for deficiency-cold presentations.',
  HT9: 'Moxibustion is occasionally used at Jing-Well points for cold bi and acute conditions. More commonly: prick to bleed (3–5 drops) with a lancet or three-edged needle for emergency resuscitation and clearing Heart fire.',
};

// massage_en (brief)
const HT_MASSAGE_EN = {
  HT1: 'To stimulate HT1: extend the arm and open the axilla; press into the center of the axilla with the thumb, applying firm but not forceful pressure, for 1–2 minutes. "Plucking" (dan bo) of the axillary tendons is a classical technique — flick the cords running through the axilla to elicit a sensation radiating down the medial arm. Use cautiously near axillary lymph nodes.',
  HT2: 'Press with the thumb perpendicular to the medial arm, 3 cun above the cubital crease. Apply moderate pressure with a slight circular motion for 1–2 minutes. Avoid forceful pressure over the medial arm vessels.',
  HT3: 'With the elbow slightly flexed, press the thumb into the medial end of the cubital crease. Apply moderate circular pressure for 1–2 minutes. Avoid pressing the ulnar nerve directly (a sharp shooting pain down the forearm indicates incorrect position — reposition slightly anteriorly).',
  HT4: 'Locate on the anteromedial forearm, 1.5 cun above the wrist crease, medial to the flexor carpi ulnaris tendon. Press perpendicular with the thumb for 1–2 minutes; may also rub along the channel distally to proximally.',
  HT5: 'Locate 1 cun above the wrist crease, medial to the flexor carpi ulnaris tendon. Press with the thumb, 1–2 minutes, with moderate pressure. May also press with the opposite thumb while rotating the wrist gently.',
  HT6: 'Press at the ulnar side of the wrist crease, 0.5 cun above the pisiform, for 1–2 minutes with moderate perpendicular pressure. For night sweats: pair with KI7 (Fuliu) acupressure.',
  HT7: 'Press at the wrist crease, medial to the flexor carpi ulnaris tendon (on the depression at the pisiform). Apply moderate pressure with the thumb for 1–2 minutes. Very accessible point — often self-massaged for calming anxiety before sleep.',
  HT8: 'Make a loose fist; the little finger tip naturally lands near HT8. Press with a pencil eraser or the opposite thumb into the palm at this point, applying moderate pressure for 30–60 seconds. Can be combined with PC8 (Laogong) for clearing Heart fire.',
  HT9: 'Press with thumbnail at the radial side of the little finger base, 0.1 cun from the nail corner, for 30–60 seconds. Pinching with fingernails (fingernail-press technique) is a field-resuscitation method for emergency use.',
};

// modern_research_en
const HT_MODERN_RESEARCH_EN = {
  HT1: 'HT1 (Jiquan) is clinically used for brachial plexus injuries and frozen shoulder (periarthritis of the shoulder). The "plucking" (dan bo) technique — flicking the neurovascular bundle in the axilla — produces a distinct radiating sensation and has been documented for treating hysteria (zang zao), brachial plexus neuralgia, and axillary lymphadenitis.',
  HT2: 'HT2 (Qingling) is infrequently used clinically but appears in classical texts for shoulder and arm disorders. Modern clinical use focuses on intercostal neuralgia, shoulder periarthritis, and axillary lymphadenitis. Historically flagged as "forbidden to needle" in 《Keiketsu Kaikai / 經穴匯解》; modern practice allows careful needling without strong stimulation.',
  HT3: 'HT3 (Shaohai) as the He-Sea (Water) point is used for cardiac arrhythmia, coronary disease (combined with PC6 + HT7), and psychiatric conditions including neurosis and schizophrenia. Research combining HT3 + PC6 + HT7 shows improvements in arterial stiffness and coronary artery disease markers.',
  HT4: 'HT4 (Lingdao) has documented clinical use for sudden aphonia (acute loss of voice) and cardiac pain. Clinical research found 77.1% overall effectiveness for coronary heart disease/angina with a massage protocol of light-press 1 min → deep-press 2 min → light-press 1 min, once daily for 15 sessions.',
  HT5: 'HT5 (Tongli) as the Luo-connecting point is clinically used for aphasia following stroke, cardiac arrhythmias, and anxiety disorders. It is the classical point for conditions where Heart pathology affects the tongue and speech.',
  HT6: 'HT6 (Yinxi) as the Xi-Cleft point is the primary point for night sweats from Yin deficiency, particularly when combined with KI7 (Fuliu). It is also used for acute cardiac pain (Xi-cleft points treat acute conditions of their organ). Clinical use includes post-menopausal night sweats and pulmonary tuberculosis.',
  HT7: 'HT7 (Shenmen), the Yuan-Source point, is one of the most extensively researched acupuncture points for insomnia and anxiety. Studies show modulation of serotonin and GABA pathways. Clinically used for insomnia, anxiety disorders, cardiac neurosis, and dementia-related agitation. Combines with PC6 + BL15 for a comprehensive Heart-calming protocol.',
  HT8: 'HT8 (Shaofu) is used for urinary tract conditions (Heart fire transmitted to Small Intestine and Bladder), mouth ulcers, and genital conditions. Pricking HT8 is used for clearing heat from the Heart system. Clinical use for cystitis, urethritis, and vulvar pruritus.',
  HT9: 'HT9 (Shaochong) as a Jing-Well point is one of the standard emergency-resuscitation points in TCM, alongside GV26 and PC9. Pricking to bleed is the primary technique. Used for acute febrile conditions, loss of consciousness, and cardiac emergency. Research supports the stimulation of Well points for sensory arousal and consciousness restoration.',
};

// combine_points_en (translation of combine_points_zh)
const HT_COMBINE_POINTS_EN = {
  HT1: '1. HT1 + TE6 (Zhigou) — for costal and hypochondriac pain. HT1 clears Heart heat and frees the Heart channel; TE6 spreads the Triple Burner Qi and relieves pain. Together they address the root (Heart channel depression-heat) and branch (local costal obstruction).\n\n2. HT1 + HT6 (Yinxi) + KI4 (Dazhong) — for angina. Yinxi is the Xi-cleft point of the Heart; Dazhong is the Luo-connecting point of the Kidney. Three points nourish Yin, clear fire, and unblock the Heart, effective for Heart-Yin deficiency type cardiac pain.\n\n3. HT1 + LI15 (Jianyu) — for shoulder pain with inability to raise the arm. HT1 frees the Heart channel and unblocks Qi-Blood; LI15 resolves local obstruction in the shoulder. Together they restore shoulder mobility.\n\n4. HT1 + LU9 (Taiyuan) + CV22 (Tiantu) — for dry throat and pharyngitis. Nourishes Lung Yin, clears heat, and benefits the throat.',
  HT2: '1. HT2 + LI15 (Jianyu) + LI11 (Quchi) + SI10 (Naoshu) — for shoulder and arm pain. Jianyu and Naoshu treat shoulder disease directly; Quchi clears heat and unblocks the channel. HT2 frees the Heart channel to resolve stagnation in the medial arm.\n\n2. HT2 + HT3 (Shaohai) + HT4 (Lingdao) + HT5 (Tongli) — for upper limb paralysis. These consecutive Heart channel points collectively free the channel and promote Qi-Blood circulation in the medial arm.\n\n3. HT2 + GB37 (Guangming) + LI4 (Hegu) — for headache with yellow eyes. Guangming brightens the eyes; Hegu clears heat and relieves pain; HT2 calms the Heart to assist.\n\n4. HT2 + TE10 (Tianjing) + ST40 (Fenglong) — for axillary lymphadenitis. Tianjing and Fenglong resolve phlegm-damp and soften hardness; HT2 clears Heart heat to reduce inflammation.',
  HT3: '1. HT3 + LI11 (Quchi) — for elbow contracture and pain. Shaohai nourishes the Heart and clears fire; Quchi drains heat from the Large Intestine. Together they relax sinews and stop pain (for Heart-fire type elbow pain).\n\n2. HT3 + SI3 (Houxi) — for sinew stiffness and blood stasis. Houxi opens the Du vessel and moves Blood. HT3 + SI3 frees sinews and unblocks collaterals for acute contracture from Qi-Blood stagnation.\n\n3. HT3 + PC5 (Jianshi) + HT7 (Shenmen) + LI4 (Hegu) + SI3 + KI7 (Fuliu) + TE23 (Sizhukong) — for mania (combined formula). Multiple points coordinate to calm the spirit, drain fire, and settle the mind.\n\n4. HT3 + ST36 (Zusanli) — for numbness of both arms. ST36 supplements Spleen-Stomach Qi and Blood; HT3 frees the Heart channel. Together they treat arm numbness from Qi-Blood deficiency.',
  HT4: '1. HT4 + BL15 (Xinshu) — for Heart pain. Xinshu supplements Heart Qi and calms the spirit; HT4 frees the channel. Together they address both the root organ and the channel.\n\n2. HT4 + PC6 (Neiguan) — for chest bi, Heart pain, and palpitations. Neiguan is the Luo-connecting point of the Pericardium and broadens the chest; together with HT4 it strongly addresses Heart Qi stagnation.\n\n3. HT4 + CV22 (Tiantu) + SI17 (Tianrong) + CV23 (Lianquan) — for sudden loss of voice and lockjaw. These throat and tongue points combined with Lingdao open the orifices and restore speech.\n\n4. HT4 + LU10 (Yuji) + TE5 (Waiguan) — for arm pain and finger numbness. Frees the Lung, Triple Burner, and Heart channels to restore sensation.',
  HT5: '1. HT5 + PC6 (Neiguan) + BL15 (Xinshu) + ST18 (Rugen) — for chest bi, Heart pain, palpitations. All act on the Heart system; together they comprehensively regulate Heart Qi and unblock the chest.\n\n2. HT5 + EX-HN5 (Taiyang) + GB20 (Fengchi) + GV20 (Baihui) — for headache and dizziness. Taiyang disperses Wind; Fengchi pacifies the Liver and clears Wind; Baihui regulates all Yang. HT5 assists by calming Heart involvement.\n\n3. HT5 + CV23 (Lianquan) + GV16 (Yamen) — for stiff tongue and aphasia. Lianquan benefits the throat; Yamen opens the tongue portal; HT5 connects the Heart to the tongue via its Luo vessel.\n\n4. HT5 + LR2 (Xingjian) + SP6 (Sanyinjiao) — for menorrhagia. Xingjian cools Blood and stops bleeding; Sanyinjiao regulates the three Yin channels; HT5 calms the Heart to settle the Blood.',
  HT6: '1. HT6 + SI3 (Houxi) + BL13 (Feishu) — for steaming-bone fever and night sweats. Houxi opens the Du vessel; Feishu nourishes Lung Yin; HT6 clears Heart-Yin deficiency heat.\n\n2. HT6 + CV4 (Guanyuan) + SP6 (Sanyinjiao) — for blood vomiting from deficiency heat. Guanyuan supplements original Yin; Sanyinjiao nourishes Liver, Spleen, and Kidney Yin; HT6 clears the deficiency fire driving the bleeding.\n\n3. HT6 + CV17 (Danzhong) + PC6 (Neiguan) — for Heart pain and palpitations (acute). Three points together unblock the chest and Heart channel.',
  HT7: '1. HT7 + ST36 (Zusanli) + SP6 (Sanyinjiao) + BL20 (Pishu) + BL15 (Xinshu) — for Heart-Spleen deficiency insomnia. HT7 calms the mind; ST36 + Pishu + Spleen channel strengthen Spleen to generate Blood for the Heart.\n\n2. HT7 + PC6 (Neiguan) + BL15 (Xinshu) — the classic three-point Heart protocol. Neiguan broadens the chest; Xinshu supplements Heart directly; Shenmen anchors the spirit.\n\n3. HT7 + GV20 (Baihui) + KI3 (Taixi) — for Kidney-Heart disharmony insomnia (Heart-Kidney not communicating). Baihui calms the spirit from above; Taixi nourishes Kidney Yin from below.\n\n4. HT7 + GV26 (Shuigou) + LI4 (Hegu) + PC9 (Zhongchong) — for acute mania. Emergency formula to drain fire and restore consciousness.',
  HT8: '1. HT8 + KI2 (Rangu) — for Heart-Kidney Yin deficiency with insomnia and palpitations. Rangu is the Ying-Spring point of the Kidney; both are Fire points, addressing the Fire-Water imbalance.\n\n2. HT8 + CV3 (Zhongji) + SP6 (Sanyinjiao) — for enuresis from Heart fire. Zhongji is the Front-Mu of the Bladder; together they clear Heart fire transmitted to the Small Intestine and Bladder.\n\n3. HT8 + CV23 (Lianquan) + CV24 (Chengjiang) — for mouth sores. Local points for the tongue and mouth combined with HT8 to clear Heart fire.\n\n4. HT8 + SP9 (Yinlingquan) + CV3 (Zhongji) — for Lin syndrome (painful urinary dysfunction) from Damp-Heat.',
  HT9: '1. HT9 (prick to bleed) + GV26 (Shuigou) + EX-UE11 (Shixuan) — for loss of consciousness and coma. Emergency resuscitation formula — strongest immediate stimulus to restore consciousness.\n\n2. HT9 + HT7 (Shenmen) + PC6 (Neiguan) — for acute cardiac pain (angina emergency). Jing-Well + Yuan-Source + Luo-connecting points of Heart and Pericardium channels.\n\n3. HT9 + GV26 (Shuigou) + LI4 (Hegu) — for febrile disease with delirium. Clears heat and opens the mind.\n\n4. HT9 + KI1 (Yongquan) — for resuscitation of extreme cold collapse. Well points of Heart and Kidney paired for Yang restoration.',
};

// cautions_en
const HT_CAUTIONS_EN = {
  HT1: [
    'Avoid the axillary artery; pulsation should be palpated and needle placed lateral to it.',
    'The brachial plexus passes through this region — avoid strong stimulation.',
    'Do not needle if local lymph nodes are enlarged (rule out malignancy first).',
    'Moxibustion is generally contraindicated due to proximity to axillary vasculature.',
  ],
  HT2: [
    '《Keiketsu Kaikai / 經穴匯解》 records this point as historically forbidden to needle ("禁刺"); modern practice allows careful, gentle needling.',
    'Avoid strong stimulation — the basilic vein and superior ulnar collateral artery are present.',
    'Do not needle if the upper arm is swollen, red, or shows neurological symptoms without assessment.',
  ],
  HT3: [
    'The ulnar nerve lies posteriorly — avoid inducing strong radiating pain down the forearm.',
    'Assess first if there is elbow injury, numbness, or neurological symptoms.',
    'Locate with elbow slightly flexed; needle perpendicularly into the depression.',
  ],
  HT4: [
    'Dense neurovascular structures in the anteromedial forearm — avoid deep insertion.',
    'The ulnar artery runs radial to this point; do not insert toward it.',
  ],
  HT5: [
    'The ulnar artery runs laterally and the ulnar nerve medially — avoid deep insertion.',
    'Sudden aphasia requires emergency neurological assessment; acupuncture is adjunctive.',
  ],
  HT6: [
    'The ulnar artery and ulnar nerve are both nearby — avoid deep or forceful insertion.',
    'Use caution in patients on anticoagulant therapy (Xi-cleft point; pricking may cause bleeding).',
  ],
  HT7: [
    'The ulnar artery runs immediately lateral to the flexor carpi ulnaris tendon — needle medial to the tendon.',
    'Avoid wrist injury or local infection.',
  ],
  HT8: [
    'Avoid excessive depth — common palmar digital vessels and nerves are present.',
    'Do not needle if there is local skin infection or inflammation of the palm.',
  ],
  HT9: [
    'Prick-to-bleed technique should use a sterile lancet or three-edged needle with 3–5 drops only.',
    'Standard needling (0.1–0.2 cun oblique) is for non-emergency clinical use.',
    'If used for emergency resuscitation, immediately summon medical assistance.',
  ],
};

// contraindications_en (from contraindications[] zh entries)
const HT_CONTRAINDICATIONS_EN = {
  HT1: [
    'Avoid deep needling near the axillary artery — palpate and needle to the side of the pulsation.',
    'Do not needle if axillary lymph nodes are enlarged until oncological evaluation is complete.',
  ],
  HT2: [
    'Avoid strong stimulation — vessels and nerves run in this region.',
    'Classical source (《Keiketsu Kaikai》) records this point as forbidden to needle; use gentle technique.',
    'Assess first if arm is swollen, red, or showing nerve symptoms.',
  ],
  HT3: [
    'Avoid strong stimulation near the ulnar nerve — do not induce radiating pain down the forearm.',
    'Assess elbow injury or sensory symptoms before needling.',
  ],
  HT4: [
    'Dense neurovascular region on the anteromedial forearm — avoid deep or forceful insertion.',
  ],
  HT5: [
    'Avoid deep needling between the ulnar artery and ulnar nerve.',
    'Sudden aphasia requires neurological emergency assessment.',
  ],
  HT6: [
    'Avoid the ulnar artery and ulnar nerve — keep insertion shallow.',
    'Caution in patients on anticoagulants.',
  ],
  HT7: [
    'Needle medial to the flexor carpi ulnaris tendon to avoid the ulnar artery.',
  ],
  HT8: [
    'Avoid excessive depth; digital vessels and nerves are present.',
  ],
  HT9: [
    'Emergency pricking-to-bleed: use sterile single-use lancet; 3–5 drops only.',
    'Non-emergency use: oblique insertion 0.1–0.2 cun only.',
  ],
};

// field_sources skeleton
const makeFieldSources = (code) => ({
  acumethod_zh:   ['CloudTCM', 'eLotus CORE'],
  acumethod_en:   ['eLotus CORE / MasterTungAcupuncture.org', 'WHO SAPL 2008'],
  functions_zh:   ['CloudTCM'],
  functions_en:   ['eLotus CORE / MasterTungAcupuncture.org', 'American Dragon'],
  indications_zh: ['CloudTCM'],
  indications_en: ['eLotus CORE / MasterTungAcupuncture.org'],
  anatomy_zh:     ['CloudTCM'],
  anatomy_en:     ['WHO SAPL 2008', 'eLotus CORE'],
  exam_pearl:     ['CloudTCM', 'eLotus CORE'],
  exam_pearl_en:  ['eLotus CORE / MasterTungAcupuncture.org'],
  combine_points_zh: ['CloudTCM'],
  combine_points_en: ['eLotus CORE', 'American Dragon'],
  cautions_zh:    ['CloudTCM', 'WHO SAPL 2008'],
  cautions_en:    ['WHO SAPL 2008', 'eLotus CORE'],
});

// ── Scaffold suffix cleaner ──────────────────────────────────────────────────
function cleanTag(tag) {
  return tag
    .replace(/\s*\(Indication\)\s*$/i, '')
    .replace(/\s*\(TCM Action\)\s*$/i, '')
    .trim();
}

// ── Translate tag array using glossary (add missing to glossary) ─────────────
const MISSING_FROM_GLOSSARY = [];
function translateTags(zhArr, type = 'action') {
  return zhArr.map(zh => {
    const cleaned = cleanTag(zh);
    if (GLOSS[cleaned]) return GLOSS[cleaned];
    // Not in glossary — record for addition
    MISSING_FROM_GLOSSARY.push({ zh: cleaned, type });
    return null; // will trigger whole-array empty rule
  });
}

// ── Main loop ────────────────────────────────────────────────────────────────
const changes = [];

data.forEach((point) => {
  const code = point.code;
  if (!/^HT[1-9]$/.test(code)) return;

  const log = (field, from, to) => changes.push({ code, field,
    from: JSON.stringify(from).slice(0, 100),
    to:   JSON.stringify(to).slice(0, 100) });

  // ── FIX: HT1 other_names_zh bug ────────────────────────────────────────
  if (code === 'HT1' && point.other_names_zh) {
    log('other_names_zh', point.other_names_zh, '(removed — 天泉 is PC2)');
    if (APPLY) delete point.other_names_zh;
  }

  // ── review_status → "draft" ─────────────────────────────────────────────
  if (point.review_status !== 'draft') {
    log('review_status', point.review_status, 'draft');
    if (APPLY) point.review_status = 'draft';
  }

  // ── Toned pinyin ─────────────────────────────────────────────────────────
  if (HT_TONED_PINYIN[code] && point.pinyin !== HT_TONED_PINYIN[code]) {
    log('pinyin', point.pinyin, HT_TONED_PINYIN[code]);
    if (APPLY) point.pinyin = HT_TONED_PINYIN[code];
  }

  // ── point_identity_zh/_en ───────────────────────────────────────────────
  const idZh = HT_IDENTITY[code].zh;
  const idEn = HT_IDENTITY[code].en;
  if (JSON.stringify(point.point_identity_zh) !== JSON.stringify(idZh)) {
    log('point_identity_zh', point.point_identity_zh, idZh);
    if (APPLY) point.point_identity_zh = idZh;
  }
  if (JSON.stringify(point.point_identity_en) !== JSON.stringify(idEn)) {
    log('point_identity_en', point.point_identity_en, idEn);
    if (APPLY) point.point_identity_en = idEn;
  }

  // ── functions_zh: refine ≤8 (only where specified) ─────────────────────
  if (HT_FUNCTIONS_ZH[code]) {
    log('functions_zh', point.functions_zh, HT_FUNCTIONS_ZH[code]);
    if (APPLY) point.functions_zh = HT_FUNCTIONS_ZH[code];
  }

  // ── functions_en: replace with length-matched version ──────────────────
  const fEn = HT_FUNCTIONS_EN[code];
  const fZh = HT_FUNCTIONS_ZH[code] || point.functions_zh;
  if (fEn.length !== fZh.length) {
    console.warn(`⚠️  ${code} functions_en length ${fEn.length} ≠ functions_zh length ${fZh.length}`);
  }
  log('functions_en', point.functions_en, fEn);
  if (APPLY) point.functions_en = fEn;

  // ── indications_en: replace with length-matched version ────────────────
  const iEn = HT_INDICATIONS_EN[code];
  if (iEn.length !== point.indications_zh.length) {
    console.warn(`⚠️  ${code} indications_en length ${iEn.length} ≠ indications_zh length ${point.indications_zh.length}`);
  }
  log('indications_en', point.indications_en, iEn);
  if (APPLY) point.indications_en = iEn;

  // ── action_tags_zh: cleaned set (no identity, no disease-category) ──────
  const atZh = HT_ACTION_TAGS_ZH[code];
  log('action_tags_zh', point.action_tags_zh, atZh);
  if (APPLY) {
    point.action_tags_zh = atZh;
    point.acu_tags = atZh; // keep acu_tags in sync
  }

  // ── action_tags_en: translate from glossary ─────────────────────────────
  const atEn = atZh.map(zh => GLOSS[zh] || null);
  const allTranslated = atEn.every(v => v !== null);
  const finalAtEn = allTranslated ? atEn : [];
  log('action_tags_en', point.action_tags_en, allTranslated ? finalAtEn : '(empty — missing glossary entries)');
  if (APPLY) {
    point.action_tags_en = finalAtEn;
    point.action_tags = finalAtEn;
  }
  if (!allTranslated) {
    atZh.forEach((zh, i) => { if (!atEn[i]) MISSING_FROM_GLOSSARY.push({ zh, field: `${code}.action_tags_en`, type: 'action' }); });
  }

  // ── disease_tags_zh ─────────────────────────────────────────────────────
  const dtZh = HT_DISEASE_TAGS_ZH[code];
  log('disease_tags_zh', point.disease_tags_zh, dtZh);
  if (APPLY) point.disease_tags_zh = dtZh;

  // ── disease_tags_en: translate ──────────────────────────────────────────
  const dtEn = dtZh.map(zh => GLOSS[zh] || null);
  const allDtTranslated = dtEn.every(v => v !== null);
  const finalDtEn = allDtTranslated ? dtEn : [];
  log('disease_tags_en', point.disease_tags_en, allDtTranslated ? finalDtEn : '(empty — missing glossary entries)');
  if (APPLY) point.disease_tags_en = finalDtEn;
  if (!allDtTranslated) {
    dtZh.forEach((zh, i) => { if (!dtEn[i]) MISSING_FROM_GLOSSARY.push({ zh, field: `${code}.disease_tags_en`, type: 'disease' }); });
  }

  // ── anatomy_en ─────────────────────────────────────────────────────────
  if (!point.anatomy_en || point.anatomy_en !== HT_ANATOMY_EN[code]) {
    log('anatomy_en', point.anatomy_en || '(missing)', HT_ANATOMY_EN[code]);
    if (APPLY) point.anatomy_en = HT_ANATOMY_EN[code];
  }

  // ── moxa_en ─────────────────────────────────────────────────────────────
  if (!point.moxa_en) {
    log('moxa_en', '(missing)', HT_MOXA_EN[code]);
    if (APPLY) point.moxa_en = HT_MOXA_EN[code];
  }

  // ── massage_en ──────────────────────────────────────────────────────────
  if (!point.massage_en) {
    log('massage_en', '(missing)', HT_MASSAGE_EN[code]);
    if (APPLY) point.massage_en = HT_MASSAGE_EN[code];
  }

  // ── modern_research_en ──────────────────────────────────────────────────
  if (!point.modern_research_en) {
    log('modern_research_en', '(missing)', HT_MODERN_RESEARCH_EN[code]);
    if (APPLY) point.modern_research_en = HT_MODERN_RESEARCH_EN[code];
  }

  // ── combine_points_en ───────────────────────────────────────────────────
  if (!point.combine_points_en) {
    log('combine_points_en', '(missing)', HT_COMBINE_POINTS_EN[code].slice(0, 80) + '…');
    if (APPLY) point.combine_points_en = HT_COMBINE_POINTS_EN[code];
  }

  // ── cautions_en ─────────────────────────────────────────────────────────
  if (!point.cautions_en || !point.cautions_en.length) {
    log('cautions_en', '(missing)', HT_CAUTIONS_EN[code]);
    if (APPLY) point.cautions_en = HT_CAUTIONS_EN[code];
  }

  // ── contraindications_en ────────────────────────────────────────────────
  if (!point.contraindications_en || !point.contraindications_en.length) {
    log('contraindications_en', '(missing)', HT_CONTRAINDICATIONS_EN[code]);
    if (APPLY) point.contraindications_en = HT_CONTRAINDICATIONS_EN[code];
  }

  // ── exam_pearl + exam_pearl_en ───────────────────────────────────────────
  if (!point.exam_pearl) {
    log('exam_pearl', '(missing)', HT_EXAM_PEARL[code].zh);
    if (APPLY) point.exam_pearl = HT_EXAM_PEARL[code].zh;
  }
  if (!point.exam_pearl_en) {
    log('exam_pearl_en', '(missing)', HT_EXAM_PEARL[code].en);
    if (APPLY) point.exam_pearl_en = HT_EXAM_PEARL[code].en;
  }

  // ── field_sources skeleton ──────────────────────────────────────────────
  if (!point.field_sources) {
    log('field_sources', '(missing)', '{...}');
    if (APPLY) point.field_sources = makeFieldSources(code);
  }
});

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} field change(s) across HT1–HT9\n`);
if (!APPLY) {
  changes.slice(0, 40).forEach(c => {
    console.log(`  ${c.code} [${c.field}]`);
    console.log(`    FROM: ${c.from}`);
    console.log(`    TO:   ${c.to}\n`);
  });
  if (changes.length > 40) console.log(`  … (${changes.length - 40} more changes not shown in dry-run)\n`);
}

if (MISSING_FROM_GLOSSARY.length) {
  const unique = [...new Map(MISSING_FROM_GLOSSARY.map(m => [m.zh, m])).values()];
  console.log(`\n⚠️  ${unique.length} tags NOT found in glossary (need to be added):`);
  unique.forEach(m => console.log(`  [${m.type}] "${m.zh}" (used in ${m.field || 'multiple points'})`));
}

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ Written to ${FILE}`);
  console.log(`   Changes applied: ${changes.length}`);
}

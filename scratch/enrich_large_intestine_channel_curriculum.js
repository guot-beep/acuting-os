/**
 * scratch/enrich_large_intestine_channel_curriculum.js
 * 100% comprehensive enrichment for Large Intestine Channel (LI) including:
 * - 20 Points detailed curriculum notes (LI1 to LI20)
 * - Divergent Channel (經別)
 * - Luo Channel (絡脈：偏歷)
 * - Muscle Channel (經筋)
 * - Dermatome (皮部：害蜚)
 * - Channel Rhymes & Songs (循行歌、二十穴總歌、經別經筋歌、分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、所生病與按診分段結節診斷)
 * - Meridian Care & Preservation (大腸主津氣化、經絡拍打刮痧保養、卯時養生)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const liChannel = channels.find(c => c.code === 'LI');

if (!liChannel) {
  console.error('LI channel not found!');
  process.exit(1);
}

// 1. 常見經絡異常 Common Meridian Pathomechanism (含按診分段判讀)
liChannel.pathomechanism_zh = `【《靈樞·經脈》大腸經是動病與所生病】
• 是動病 (Shi Dong Pathologies / 經氣變動): 齒痛，頸腫（頸部腺體腫大）。
• 所生病 (Suo Sheng Pathologies / 臟腑所生病): 目黃，口乾，鼽衄（鼻塞流涕鼻出血），喉痺，肩前臑痛，大指次指痛不用（食指麻木疼痛運動障礙）。
• 實證 (Excess): 經脈所過處熱腫疼痛、頭痛牙痛、腹脹腹痛、便秘、腸鳴。
• 虛證 (Deficiency): 寒栗不復（畏寒發冷）、腹瀉泄瀉清谷、腸鳴下利、屈伸不利。

【手陽明經循經按診與分段切診判讀】
1. 合谷至陽溪段：若出現疼痛或僵硬、緊張度增高，多提示外感風寒/風熱或面神經麻痺；若循推時手臂凹陷，提示虛證（肌肉萎縮或長期腹瀉）；若感覺較硬有結節，提示實證（齒痛、牙齦腫痛或外感頭痛）。
2. 溫溜至下廉段：發現較硬結節，提示可能是大腸息肉、結腸炎、腹痛腹瀉；若為急性腸炎，出現肌肉劇烈疼痛與緊張度增高。
3. 上廉至手三里段：醫者手下感覺松軟、患者酸痛，多有慢性腸炎、消化不良、慢性胃炎或皮癬；若有結節或結塊，可能有牙痛、牙齦腫或食道炎。
4. 曲池部位：按壓發硬疼痛提示外感或急性腸炎；若沿手三里與曲池深層循推有較硬結節，提示食道或大腸息肉/增生病變。
5. 肘髎至臂臑段：若有結塊異常，提示食道疾病。`;

liChannel.pathomechanism_en = `【Large Intestine Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies (Channel Reactivity): Toothache, swelling of the neck.
• Suo Sheng Pathologies (Organ/Channel Disorders): Yellow sclera, dry mouth, rhinorrhea, epistaxis, sore throat, pain in anterior shoulder and arm, pain/motor impairment of index finger.
• Excess Symptoms: Heat, redness, swelling along the channel, headache, toothache, abdominal pain, constipation, borborygmus.
• Deficiency Symptoms: Chills and shivering unable to get warm, loose stools with undigested food, diarrhea.

【Segmental Meridian Palpation & Diagnostic Pearls】
1. Hegu (LI4) to Yangxi (LI5): Hardness/stiffness indicates exterior pathogens or Bell's palsy; flaccidity/depressions indicate deficiency (atrophy/chronic diarrhea); nodules indicate excess (toothache/headache).
2. Wenliu (LI7) to Xialian (LI8): Hard nodules suggest intestinal polyps, colitis, or chronic pain; muscle tenderness suggests acute enteritis.
3. Shanglian (LI9) to Shousanli (LI10): Soft flaccid texture indicates chronic enteritis or indigestion; nodules suggest esophagitis or toothaches.
4. Quchi (LI11): Hard pressure pain indicates exterior fever or enteritis; deep hard nodules suggest esophagitis or colonic polyps.
5. Zhouliao (LI12) to Binao (LI14): Abnormalities indicate esophageal or shoulder/arm disorders.`;

// 2. 經絡保養與日常養生 Meridian Care & Preservation (含氣化與大腸主津)
liChannel.preservation_zh = `【大腸主津、傳導之官與氣化理論】
手陽明經內屬大腸（含食道），外行於商陽至迎香。小腸吸收後之殘渣由大腸接收，重新吸收水液，稱之為「大腸主津」。同時大腸傳導糟粕經肛門排出，稱為「傳導之官」。大腸虛寒則無力吸收水分，致腸鳴腹瀉；大腸實熱則消爍水分，致大便秘結燥乾。《脾胃論》云：「大腸主津，小腸主液，受胃之榮氣，乃能行津液於上焦，灌溉皮毛，充實腠理。」

【大腸經日常保健與養生導引】
• 時辰養生 (Clock Time 5:00-7:00 AM 卯時): 卯時大腸經當令，大腸蠕動最旺盛。晨起宜飲一杯溫開水（稀釋血液、預防血栓），並養成定時排便習慣，清化腸胃毒素。忌晨起暴食或憋便。
• 通便排毒與刮痧拍打: 手陽明大腸經多氣多血，主傳化渣滓。沿大腸經循行路線（由上臂至食指）每日拍打12分鐘；或採用刮痧法（重點刮二間、曲池等穴）排出腸道瘀毒，可有效預防皮膚病與蕁麻疹。
• 導引按揉與保養穴位:
  1. 按揉 **LI4 合谷**（頭面保健第一要穴、增強免疫力、緩解頭痛牙痛與腸胃不適。⚠️ 孕婦嚴禁針灸按摩）。
  2. 按揉 **LI11 曲池**（清熱解毒、退燒、降血壓、調理皮膚濕疹過敏）。
  3. 按揉 **LI20 迎香**（通鼻開竅、預防感冒、緩解鼻炎與鼻塞）。`;

liChannel.preservation_en = `【Large Intestine Qi Transformation & Water Metabolism】
Large Intestine governs fluid reabsorption ("Large Intestine Governs Jin / 大腸主津") and waste transit ("Official of Transportation / 傳導之官"). Cold-deficiency leads to diarrhea and borborygmus; Full-Heat dries fluids leading to constipation.

【Meridian Health Preservation & Self-Care Protocol】
• Clock Time Alignment (5:00 - 7:00 AM Mao Hour): Large Intestine is most active. Drink warm water on waking to prevent thrombus and facilitate morning bowel movements.
• Detoxification & Gua Sha Scraping: Tap along the LI meridian (12 min/day) or perform Gua Sha on LI2 (Erjian) and LI11 (Quchi) to clear cutaneous heat and skin toxins.
• Daily Self-Care Points:
  1. Press LI4 Hegu (boosts immunity, relieves face/head pain; ⚠️ Contraindicated in pregnancy).
  2. Press LI11 Quchi (clears heat, lowers blood pressure, treats urticaria/eczema).
  3. Press LI20 Yingxiang (opens nasal passages, prevents colds).`;

// 3. 經別 Divergent Channel
liChannel.divergent_channel_zh = `【手陽明大腸經經別 (Large Intestine Divergent Channel)】
• 循行路線：從手陽明經脈的肩髃穴分出，別入肩髃，入缺盆（鎖骨上窩），下走大腸，還巡上貫肺，沿喉嚨，出缺盆，複合於手陽明本經，上結於頸部扶突穴（LI18 - 天窗穴）。
• 臨床意義：陽明經別深入肺與大腸，與手太陰肺經經別在胸腹深層完全貫通交織。上合於天窗穴 LI18，能調節頭面、咽喉與頭身陰陽氣血升降。`;

liChannel.divergent_channel_en = `【Large Intestine Divergent Channel (Jing Bie)】
• Trajectory: Branches at shoulder (LI15), enters supraclavicular fossa (ST12), descends to Large Intestine, turns upward through Lung, ascends throat, emerges at supraclavicular fossa, and connects at LI18 (Futu / Window of Sky).
• Clinical Significance: Integrates Large Intestine and Lung deep in the interior. Conjoins at LI18 (Window of Sky) to balance head-body Qi flow.`;

// 4. 絡脈 Luo-Connecting Channel
liChannel.luo_channel_zh = `【手陽明絡脈 —— 偏歷 (LI6 Luo-Connecting Channel)】
• 循行路線：在腕關節後3寸偏歷穴處分出走向手太陰肺經；其支脈沿臂經肩髃上行至下頜角，遍布於齒中；另一支脈進入耳中，合於耳部主脈。
• 病變與臨床應用：實證為齲齒、耳聾；虛證為齒冷、經氣閉阻不通暢。臨床取絡穴偏歷 (LI6) 主治。`;

liChannel.luo_channel_en = `【Large Intestine Luo-Connecting Vessel (Pianli LI6)】
• Trajectory: Departs from LI6 (3 cun above wrist), connects to Lung channel; one branch ascends arm over shoulder to jaw and enters teeth; another branch enters inner ear.
• Pathology: Excess: Tooth decay/caries, deafness. Deficiency: Cold teeth, sensation of Qi blockage. Treated via LI6.`;

// 5. 經筋 Muscle Channel / Tendino-Muscular
liChannel.muscle_channel_zh = `【手陽明經筋 (Large Intestine Muscle Channel / Sinew Channel)】
• 循行路線：起於食指爪甲橈側端（商陽），結於腕，沿前臂上行，結於肘外側（曲池），沿上臂上行，結於肩髃；分支繞肩胛，挾脊柱；直者從肩髃上頸，分支上頰，結於頄（鼻旁），直者上出手太陽之前，上左角，絡頭，下右頷。
• 病候與臨床應用：經筋所過之處扭傷、轉筋、肩臂拘急疼痛、肩不能舉、頸不能左右顧視、口角歪斜、齒痛。`;

liChannel.muscle_channel_en = `【Large Intestine Muscle Channel (Jing Jin)】
• Trajectory: Originates at index finger (LI1), binds at wrist, elbow (LI11), and shoulder (LI15); branch wraps scapula and flanks spine; main branch ascends neck over cheek to nose and reaches opposite jaw.
• Pathology: Cramping, strain, pain along path: shoulder/arm spasm, inability to raise arm, neck stiffness, mouth deviation.`;

// 6. 皮部 Dermatome (陽明皮部：害蜚)
liChannel.dermatome_zh = `【陽明皮部 —— 「害蜚」(Yangming Dermatome)】
• 陽明皮部名「害蜚」（害通闔 hé）。陽明為陽氣亢盛，是三陽之「闔」，多氣多血，為五臟六腑之海。「蜚」即陽氣飛揚之意。
• 臨床意義：外感病過程中，陽明病是邪熱最盛階段。傷寒論云「陽明之為病，胃家實是也」。手足陽明經循行部位之浮絡與皮膚即屬陽明皮部，治療當以清下實熱、保存津液為主。`;

// 7. 經脈歌訣 Channel Rhymes & Classic Point Songs
liChannel.channel_rhyme_zh = `【手陽明大腸經循行歌與分寸歌】
「手陽明穴起商陽，二間三間合谷藏，陽溪偏歷溫溜長，下廉上廉三里光，曲池肘髃五里近，臂臑肩髃巨骨當，天鼎扶突禾髃接，迎香二穴鼻旁旁。」

【二十穴總歌與經別經筋歌】
「手陽明經二十穴，大腸之府相表裡，食指橈側起商陽，迎香鼻旁終其位，合谷頭面功效大，曲池清熱退高燒。」
「大腸經別別肩髃，入走缺盆貫肺腑，復出缺盆合扶突，天窗調氣頭面通；經筋起於食指端，結腕結肘肩髃連，繞肩挾脊上頭角，筋攣臂痛口眼歪。」`;

// 8. 全20穴位詳細課件精華 (LI1 - LI20)
liChannel.points_curriculum = [
  {
    code: "LI1",
    nameZh: "商陽 (Shangyang)",
    nameEn: "Shang Yang / Metal Yang",
    category: "五輸穴之井穴 (Jing-Well - 金穴 Metal Point) · 刺血救急要穴",
    location: "食指橈側指甲角旁0.1寸 (Radial side of index finger, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或點刺出血 (Prick to bleed)。古云不宜灸。",
    actions: "清熱解毒 (Clears Heat)、消腫止痛 (Reduces Swelling & Alleviates Pain)、醒腦開竅 (Revives Consciousness)、利咽通絡 (Benefits Throat)。",
    indications: "急性咽喉腫痛、齒痛、頷下腫、食指麻木痛、高熱無汗、中風昏迷、耳痛眼痛、口乾症 (Xerostomia)。",
    notes: "【課件考綱精華】① 井穴急救：點刺出血治高熱昏迷與喉痺劇痛。② 清瀉頭面經絡對側熱邪（眼睛耳痛牙痛）。③ 研究顯示可刺激唾液分泌，治療口乾症 (Xerostomia)。"
  },
  {
    code: "LI2",
    nameZh: "二間 (Erjian)",
    nameEn: "Second Space",
    category: "五輸穴之滎穴 (Ying-Spring - 水穴 Water) · 瀉穴 (Sedation Point)",
    location: "微屈食指，第二掌指關節橈側前下方凹陷中 (Distal to 2nd MCP joint, radial side).",
    needling: "直刺 0.2 - 0.3 寸。可灸。",
    actions: "疏風清熱 (Expels Wind & Clears Heat)、消腫止痛 (Reduces Swelling & Alleviates Pain)、利咽明目 (Benefits Throat & Eyes)。",
    indications: "牙痛、齒齦腫痛、目赤腫痛、急性咽喉腫痛、鼻衄、身熱、手指麻木痛。",
    notes: "【課件考綱精華】滎穴瀉穴：清瀉大腸經對側頭面熱邪（牙痛、目赤、咽腫）。臨床因 LI4 與 LI11 功效更廣，LI2/LI3 較少單獨使用。"
  },
  {
    code: "LI3",
    nameZh: "三間 (Sanjian)",
    nameEn: "Third Space",
    category: "五輸穴之輸穴 (Shu-Stream - 木穴 Wood Point)",
    location: "握空拳，第二掌骨體橈側，掌骨頭後方凹陷中 (Proximal to head of 2nd metacarpal bone, radial side).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "疏風清熱 (Expels Wind & Heat)、利咽正齒 (Benefits Throat & Teeth)、理氣止瀉 (Dispels Fullness & Treats Diarrhea)。",
    indications: "牙痛、咽喉腫痛、目赤腫痛、手指手背紅腫疼痛、頭痛、項強痛、鼻塞、腸鳴腹瀉。",
    notes: "【課件考綱精華】輸穴主體重節痛：清熱利咽、正齒止痛，兼能腹瀉腸鳴氣滯。"
  },
  {
    code: "LI4",
    nameZh: "合谷 (Hegu)",
    nameEn: "Union Valley",
    category: "原穴 · 入口穴 (Entry) · 頭面六總穴 · 四關穴 (Four Gates w/ LR3) · 孕婦禁針",
    location: "手背第一、二掌骨間，第二掌骨橈側中點凹陷處 (Between 1st & 2nd metacarpals, midpoint of 2nd metacarpal radial border).",
    needling: "直刺 0.5 - 1.0 寸。⚠️ 孕婦嚴禁針灸 (Contraindicated in Pregnancy - Induces Labor)。",
    actions: "疏風解表 (Releases Exterior Wind)、調控頭面五官 (Command Point for Face/Nose/Mouth/Jaw)、開竅止痛 (Activates Channel & Alleviates Pain)、催產下胎 (Induces Labor)、回陽固表 (Restores Yang & Regulates Sweating)。",
    indications: "頭痛（陽明前額痛/正頭痛）、牙痛（下頜牙痛特效）、咽喉腫痛、腮腺炎、面癱、過敏性鼻炎、感冒發熱無汗/多汗、腹痛、便秘、閉經、滯產、小兒驚風、四肢痙攣疼痛。",
    notes: "【課件考綱精華】① 頭面第一要穴（面口合谷收）：所有頭面五官、牙痛、過敏鼻炎首選。下頜牙痛用合谷 LI4，上頜牙痛配內庭 ST44。② 雙向調節汗腺：多汗（補合谷瀉復溜 KI7）、無汗（瀉合谷補復溜）。③ 四關穴 (LI4 + LR3)：強效行氣活血止痛。④ 孕婦禁針：強烈催產下胎。"
  },
  {
    code: "LI5",
    nameZh: "陽溪 (Yangxi)",
    nameEn: "Yang Ravine",
    category: "五輸穴之經穴 (Jing-River - 火穴 Fire Point)",
    location: "腕背側橈側，拇短伸肌腱與拇長伸肌腱之間的凹陷中（解剖學解剖細溝/鼻煙窩中） (In anatomical snuffbox between EPL & EPB tendons).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱止痛 (Clears Heat & Alleviates Pain)、清瀉陽明火邪 (Clears Yangming Fire)、安神定志 (Calms the Spirit)、利腕關節 (Benefits Wrist).",
    indications: "頭痛、目赤腫痛、牙痛、咽喉腫痛、手腕痛、耳鳴耳聾、狂躁神志病。",
    notes: "【課件考綱精華】① 解剖鼻煙窩中。② 經典記載與 LI7 孔最/溫溜同用治「見鬼狂躁」（Manic conditions / seeing ghosts）。"
  },
  {
    code: "LI6",
    nameZh: "偏歷 (Pianli)",
    nameEn: "Veering Passageway",
    category: "絡穴 (Luo-Connecting Point to LU Channel)",
    location: "屈肘，陽溪與曲池連線上，腕橫紋上3寸 (3 cun above wrist crease on LI5-LI11 line).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "祛風清熱 (Expels Wind & Clears Heat)、通調水道 (Opens & Regulates Water Passages)、利頭面五官 (Benefits Ear/Jaw/Nose)。",
    indications: "耳鳴、耳聾、牙痛、鼻衄、頭痛、水腫、面腫、腹脹腸鳴、肘臂酸痛。",
    notes: "【課件考綱精華】絡脈上行至頭面部（耳、牙、鼻）：主治耳鳴耳聾、牙痛與面部水腫。實則齲齒耳聾，虛則齒冷。主客原絡配穴：LU9 (原) + LI6 (絡) 治肺虛大腸水腫。"
  },
  {
    code: "LI7",
    nameZh: "溫溜 (Wenliu)",
    nameEn: "Warm Dwelling",
    category: "郄穴 (Xi-Cleft Point of Large Intestine Channel)",
    location: "屈肘，陽溪與曲池連線上，腕橫紋上5寸 (5 cun above wrist crease on LI5-LI11 line).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "清熱解毒 (Clears Heat & Detoxifies Poison)、緩急止痛 (Moderates Acute Conditions)、和胃調腸 (Harmonizes Intestines & Stomach)、安神定志 (Calms Spirit).",
    indications: "肩臂疼痛拘急、急性頭痛牙痛、急性腹痛腸鳴、疔瘡腫毒、狂躁妄動。",
    notes: "【課件考綱精華】郄穴專治大腸經沿線（肩、肘、腕）氣血凝滯之急性劇痛與疔瘡癰腫。古籍記載與 LI5 同用治狂躁「見鬼」。"
  },
  {
    code: "LI8",
    nameZh: "下廉 (Xialian)",
    nameEn: "Lower Ridge",
    category: "局部要穴 (Local Point)",
    location: "陽溪與曲池連線上，肘橫紋下4寸（腕橫紋上8寸） (4 cun below cubital crease).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "調和小腸 (Harmonizes Small Intestine)、疏風清熱 (Expels Wind & Clears Heat)、清陽明火 (Clears Yangming Fire)。",
    indications: "腹痛、腸鳴、小腹臍痛、溺血（小腸熱引致）、肘臂疼痛麻木。",
    notes: "【課件考綱精華】特定配穴連繫：LI8 + ST39 (小腸下合穴) 調理小腸腸道病變；小腸熱下注尿血配 CV3 + ST39。"
  },
  {
    code: "LI9",
    nameZh: "上廉 (Shanglian)",
    nameEn: "Upper Ridge",
    category: "局部要穴 (Local Point)",
    location: "陽溪與曲池連線上，肘橫紋下3寸（腕橫紋上9寸） (3 cun below cubital crease).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "調和腸胃 (Harmonizes Large Intestine)、通經活絡 (Activates Channel)、止痛 (Alleviates Pain)。",
    indications: "肩臂酸痛、上肢不遂、手足麻木、腸鳴腹痛、小便難。",
    notes: "【課件考綱精華】特定配穴連繫：LI9 + ST37 (大腸下合穴) 調理大腸腸胃積滯與傳化病變。"
  },
  {
    code: "LI10",
    nameZh: "手三里 (Shousanli)",
    nameEn: "Arm Three Li",
    category: "強壯要穴 · 局部要穴 (Major Local & Qi-Blood Regulating Point)",
    location: "陽溪與曲池連線上，肘橫紋下2寸 (2 cun below cubital crease).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "理氣用血 (Regulates Qi & Blood)、通經活絡止痛 (Activates Channel & Alleviates Pain)、和胃利腸 (Harmonizes Intestines & Stomach)。",
    indications: "齒痛、頰腫、肩臂酸痛、上肢不遂、手足麻木痛、腹痛、腹瀉、嘔吐、潰瘍病、胃痛。",
    notes: "【課件考綱精華】上肢強壯要穴（效同足三里 ST36），比其他大腸經穴更具補益氣血作用。配穴連繫：LI10 + ST36 為全身大補氣血金三角。"
  },
  {
    code: "LI11",
    nameZh: "曲池 (Quchi)",
    nameEn: "Pool at the Bend",
    category: "五輸穴之合穴 (He-Sea - 土穴 Earth) · 補穴 (Tonification Point) · 孫思邈十三鬼穴 (Ghost Point)",
    location: "屈肘90度，肘橫紋外側端凹陷中，尺澤(LU5)與肱骨外上髁連線中點 (Midway between LU5 and lateral epicondyle of humerus).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "清熱瀉火涼血 (Clears Heat & Cools Blood)、疏風解表 (Eliminates Wind)、利濕止癢 (Drains Damp & Alleviates Itching)、調和氣血 (Regulates Qi & Blood)、降血壓與清陽明四大熱症 (Used for 4 Bigs: Big fever, sweat, thirst, pulse)。",
    indications: "高熱、四大熱症、發熱無汗、咽喉腫痛、牙痛、目赤腫痛、瘰癧、蕁麻疹、皮膚濕疹發炎瘙癢、上肢不遂、肘臂癱瘓疼痛、腹痛嘔吐腹瀉、潮熱月經不調、中暑（配 BL40, SP10, SI3）。",
    notes: "【課件考綱精華】① 清熱第一要穴：退高燒、清陽明四大熱（大熱、大汗、大渴、脈洪大）。② 皮膚病第一要穴：祛風利濕止癢（濕疹、蕁麻疹紅腫發炎），常配委中 BL40。③ 降血壓與中暑急救。④ 補穴（土生金）。"
  },
  {
    code: "LI12",
    nameZh: "肘髎 (Zhouliao)",
    nameEn: "Elbow Bone Hole",
    category: "局部要穴 (Local Point)",
    location: "屈肘，肱骨外上髁上方1寸，肱骨外側緣 (1 cun above LI11, on border of humerus).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "通經活絡 (Activates Channel)、舒筋止痛 (Alleviates Pain)、利肘關節 (Benefits Elbow Joint)。",
    indications: "肘臂拘急疼痛、麻木、網球肘、肘關節攣痛。",
    notes: "【課件考綱精華】肘部局部痛、肱骨外上髁炎（網球肘）專用穴。"
  },
  {
    code: "LI13",
    nameZh: "手五里 (Shouwuli)",
    nameEn: "Arm Five Li",
    category: "局部要穴 (Local Point)",
    location: "曲池與肩髃連線上，曲池上3寸，肱骨橈側緣 (3 cun above LI11).",
    needling: "直刺 0.5 - 1.0 寸。避開動脈。可灸。",
    actions: "通經止痛 (Activates Channel)、理氣化濕 (Regulates Qi & Drains Damp)、化痰散結 (Transforms Phlegm).",
    indications: "肘臂疼痛拘急、頸項強痛、瘰癧（淋巴結核/腫塊）。",
    notes: "【課件考綱精華】局部通絡止痛，兼能化痰散結治瘰癧。"
  },
  {
    code: "LI14",
    nameZh: "臂臑 (Binao)",
    nameEn: "Upper Arm",
    category: "手陽明經與陽維經/陽貎經交會穴 · 局部要穴",
    location: "曲池與肩髃連線上，曲池上7寸，三角肌止點處 (7 cun above LI11, at insertion of deltoid muscle).",
    needling: "直刺或向上斜刺 0.8 - 1.5 寸。可灸。",
    actions: "通經止痛 (Activates Channel)、理氣散結 (Regulates Qi & Dissipates Phlegm Nodules)、明目清熱 (Benefits the Eyes)。",
    indications: "肩臂疼痛拘急、上肢不遂、瘰癧、風疹、眼疾（目赤腫痛、視物模糊）。",
    notes: "【課件考綱精華】肩臂痛與眼疾要穴；能化痰散結治療頸部淋巴結腫大 (Scrofula)。"
  },
  {
    code: "LI15",
    nameZh: "肩髃 (Jianyu)",
    nameEn: "Shoulder Bone",
    category: "手陽明經與陽貎脈交會穴 · 肩關節第一要穴",
    location: "肩部，肩峰端下緣，肩峰與肱骨大結節之間，臂外展或向前平舉時，肩部出現前後兩個凹陷，前凹陷中 (In depression anterior border of AC joint, when arm abducted).",
    needling: "直刺或向下斜刺 0.8 - 1.5 寸。可灸。",
    actions: "祛風濕利肩關節 (Dispels Wind-Damp & Benefits Shoulder Joint)、通經活絡止痛 (Activates Channel)、理氣化痰散結 (Dissipates Phlegm Nodules).",
    indications: "肩關節周圍炎（五十肩/Frozen Shoulder）、肩臂疼痛不遂、旋轉肌袖損傷 (Rotator Cuff Injury)、風疹、瘰癧。",
    notes: "【課件考綱精華】① 肩關節病變第一要穴：五十肩、肩袖損傷、肩關節活動受限 (ROM issues)。② 配穴：常配肩髎 TE14、肩貞 SI9、肩前痛點。"
  },
  {
    code: "LI16",
    nameZh: "巨骨 (Jugu)",
    nameEn: "Great Bone",
    category: "手陽明經與陽貎脈交會穴",
    location: "鎖骨肩峰端與肩胛岡之間的凹陷中 (In depression between acromial extremity of clavicle and scapular spine).",
    needling: "直刺 0.5 - 0.7 寸。⚠️ 避免深刺入胸腔傷害肺臟 (Deep needling could affect Lung)。可灸。",
    actions: "通經活絡 (Activates Channel)、利肩關節 (Benefits Shoulder)、散瘀止血理氣 (Resolves Blood Stagnation & Dissipates Phlegm).",
    indications: "肩背疼痛不遂、肩痛不能舉、吐血/咳血（胸肺瘀血）、瘰癧、癭氣。",
    notes: "【課件考綱精華】① 輔助肩髃治肩部頑固疼痛。② 散胸肺瘀血（咳血吐血）。⚠️ 注意針刺深度防傷肺。"
  },
  {
    code: "LI17",
    nameZh: "天鼎 (Tianding)",
    nameEn: "Celestial Tripod",
    category: "局部要穴 (Local Point)",
    location: "頸外側部，胸鎖乳突肌後緣，扶突(LI18)直下1寸，結喉旁開3.5寸 (1 cun below LI18).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "利咽清音 (Benefits Throat & Voice)、化痰散結 (Dissipates Phlegm Nodules)。",
    indications: "暴瘖失音、咽喉腫痛、吞咽困難、瘰癧、癭氣。",
    notes: "【課件考綱精華】咽喉氣阻突然失音 (Sudden loss of voice) 與瘰癧癭氣。"
  },
  {
    code: "LI18",
    nameZh: "扶突 (Futu)",
    nameEn: "Protuberance Assistant",
    category: "天牖五部/天窗穴 (Window of the Sky Point) · 經別上合穴",
    location: "頸外側部，結喉旁開3寸，胸鎖乳突肌的胸骨頭與鎖骨頭之間 (Level with tip of Adam's apple, between sternal & clavicular heads of SCM).",
    needling: "直刺 0.3 - 0.5 寸。⚠️ 注意避開頸總動脈 (Caution with carotid artery)。可灸。",
    actions: "利咽清音 (Benefits Throat & Voice)、宣肺平喘 (Alleviates Cough & Wheezing)、調節頭身氣血陰陽 (Window of Sky - Regulates Head-Body Qi/BP).",
    indications: "暴瘖失音、咽喉腫痛、咳嗽、氣喘、瘰癧、癭氣、高血壓與低血壓雙向調節。",
    notes: "【課件考綱精華】① 天窗穴：咽喉氣阻致突然失音之特效穴。② 經別上合穴：肺與大腸經別於扶突相合。③ 血壓雙向調節：高血壓或低血壓升降氣血。"
  },
  {
    code: "LI19",
    nameZh: "口禾髎 (Heliao)",
    nameEn: "Grain Bone Hole",
    category: "手陽明經與足陽明經交會穴 · 出口穴 (Exit Point)",
    location: "人中穴(GV26)旁開0.5寸，鼻孔外緣直下方 (Below lateral margin of nostril, level with GV26).",
    needling: "斜刺 0.2 - 0.3 寸。⚠️ 禁灸 (No Moxibustion)。",
    actions: "祛風開竅 (Eliminates Wind)、通利鼻竅 (Opens Nasal Passages)。",
    indications: "鼻塞、鼻衄、嗅覺減退 (Hyposmia)、口眼歪斜、面腫痛。",
    notes: "【課件考綱精華】通鼻開竅、嗅覺喪失，禁灸。"
  },
  {
    code: "LI20",
    nameZh: "迎香 (Yingxiang)",
    nameEn: "Welcome Fragrance",
    category: "手陽明經與足陽明經交會穴 · 終點穴 · 鼻病第一要穴",
    location: "鼻翼外緣中點旁開，鼻唇溝中 (In nasolabial groove, level with midpoint of lateral border of ala nasi).",
    needling: "斜刺或平刺 0.3 - 0.5 寸向內上方（或透鼻通穴）。⚠️ 禁灸 (No Moxibustion)。",
    actions: "通利鼻竅 (Opens Nasal Passages)、疏風清熱 (Expels Wind & Clears Heat)、宣通頭面 (Benefits Nose & Face).",
    indications: "鼻塞、鼻淵（鼻竇炎）、過敏性鼻炎、鼻衄、嗅覺喪失 (Loss of smell/taste)、口眼歪斜、面部瘙癢腫脹。",
    notes: "【課件考綱精華】① 鼻病第一要穴：過敏性鼻炎、鼻竇炎、鼻塞、嗅覺喪失。② 禁灸。常配印堂、風池、合谷 LI4。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Large Intestine Channel (LI) with full 20 points, Luo channel, Dermatome, and Palpation Segmental Diagnosis!');

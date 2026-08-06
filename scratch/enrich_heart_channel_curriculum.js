/**
 * scratch/enrich_heart_channel_curriculum.js
 * 100% comprehensive enrichment for Heart Channel (HT) including:
 * - 9 Points detailed curriculum notes (HT1 to HT9)
 * - Divergent Channel (經別：合於目內眥)
 * - Luo Channel (絡脈：通里 HT5)
 * - Muscle Channel (經筋：結於銳骨、肘內側、伏脊)
 * - Dermatome (皮部：樞儒)
 * - Channel Rhymes & Songs (循行歌、九穴分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、所生病與 3 段按診切診判讀)
 * - Meridian Care & Preservation (午時養生、神門通里導引、心主血脈君主之官)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const htChannel = channels.find(c => c.code === 'HT');

if (!htChannel) {
  console.error('HT channel not found!');
  process.exit(1);
}

htChannel.seam_anatomy_zh = `【體內循行路線】
起於心中，分支下穿膈肌屬心絡小腸；分支上行夾咽連目系；主幹上肺出腋下。

【體表循行縫隙描述】
上臂部行於肱二頭肌內側溝縫隙中；前臂部行於尺側腕屈肌腱與指淺屈肌腱之間的縫隙；手掌部沿第四、五掌骨間行至小指橈側指甲角。`;

htChannel.qihua_zh = `【手少陰經氣化功能】
手少陰心經內屬於心，外行於極泉至少衝。《素問·靈蘭秘典論》曰：「心者，君主之官也，神明出焉。」心主血脈，又主藏神。

【心與小腸表裡關係】
心與小腸相表裡，心火旺盛可下移小腸，出現小便短赤、灼熱痛感；小腸熱亦可上炎於心，見口舌生瘡、心煩失眠。`;

htChannel.pathomechanism_zh = `【主要病候】
心痛，心悸，失眠，黃疸，脅痛，臑臂內側後緣痛，掌中熱痛，嗌乾，渴而欲飲。

【《靈樞·經脈》是動病與所生病原文】
是動病：嗌乾，心痛，渴而欲飲，是為臂厥。
所生病：目黃，脅痛，臑臂內後廉痛厥，掌中熱痛。

【常見經絡異常按診切診 3 段判讀】
1. 神門至通里段：若按壓極度酸痛或有深層細小結節，提示心氣不足、心血虛（心悸、失眠、健忘）。
2. 少海段：肘內側壓痛或發硬提示心火亢盛或心脈瘀阻（胸悶、心前區痛）。
3. 極泉至青靈段：若有明顯腫塊或拉扯疼痛，提示心胸氣滯血瘀或腋下淋巴結腫大。`;

htChannel.pathomechanism_en = `【Heart Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies: Dryness of throat, cardiac pain, thirst with desire to drink, arm Bi-syndrome (臂厥).
• Suo Sheng Pathologies: Yellow eyes, hypochondriac pain, pain and coldness along the medial posterior aspect of arm and forearm, heat and pain in palms.`;

htChannel.preservation_zh = `【心經日常保養與導引】
• 午時 (11:00 AM - 01:00 PM) 養生：午時心經當令，心主血脈與藏神。午時宜小憩30分鐘（午睡養心），順應陽極陰生之氣血轉換。忌劇烈運動或大喜大怒。
• 導引按揉保養穴位：
  1. 按揉 **HT7 神門**（安神定志、治療失眠第一要穴）。
  2. 按揉 **HT5 通里**（通利舌本、治失語舌強與舌下腺炎）。
  3. 按揉 **HT3 少海**（清心瀉火、舒緩上肢抽痛）。`;

htChannel.preservation_en = `【Heart Meridian Health Preservation & Self-Care】
• Clock Time Alignment (11:00 AM - 1:00 PM Wu Hour): Heart meridian is most active. Take a 30-minute nap during Wu Hour to nourish Heart Qi and balance Yin-Yang transition. Avoid heavy workouts or intense emotions.
• Self-Care Points: Press HT7 Shenmen (sleep & anxiety), HT5 Tongli (tongue & speech), HT3 Shaohai (clears Heart fire).`;

htChannel.divergent_channel_zh = `【手少陰心經經別 (Heart Divergent Channel)】
• 循行路線：從手少陰經別出於淵腋兩筋之間（腋下），入走胸中，別屬心臟，向上沿喉嚨，淺出于面部，合於目內眥（合於手太陽小腸經）。
• 臨床意義：貫通心與眼睛（目系）、咽喉，上合目內眥，解釋了心火上炎致目赤、口舌生瘡與神志異常之機制。`;

htChannel.divergent_channel_en = `【Heart Divergent Channel (Jing Bie)】
• Trajectory: Departs from main channel at axilla, enters chest, pertains to Heart, ascends along throat, emerges on face, and connects at inner canthus of eye (conjoining Small Intestine channel).
• Clinical Significance: Links Heart directly to eyes, throat, and face, explaining why Heart fire causes red eyes and tongue sores.`;

htChannel.luo_channel_zh = `【手少陰絡脈 —— 通里 (HT5 Luo-Connecting Channel)】
• 循行路線：在腕後1寸（通里穴）分出走向手太陽小腸經；其支脈沿本經上行入心，系於舌本，屬目系。
• 病變：氣逆則發為暴瘖（突然失音）或咽喉腫痛；實證為胸脅支滿、心驚痛；虛證為不能言（失語/言語蹇澀）。取絡穴通里 (HT5) 治療。`;

htChannel.luo_channel_en = `【Heart Luo-Connecting Vessel (Tongli HT5)】
• Trajectory: Departs from HT5 (1 cun above wrist), connects to Small Intestine channel; branch ascends to Heart, root of tongue, and eye system.
• Pathology: Rebellious Qi: Sudden loss of voice, sore throat. Excess: Fullness in chest/hypochondrium. Deficiency: Aphasia/inability to speak. Treated via HT5.`;

htChannel.muscle_channel_zh = `【手少陰經筋 (Heart Muscle Channel / Sinew Channel)】
• 循行路線：起於手小指內側端，結於銳骨（神門掌後骨），上結於肘內側（少海），上入腋下，交手太陰經筋，伏行乳里，結於胸中，沿背部下貫膈肌，抵於臍部。
• 病候：小指轉筋疼痛、肘臂內側後緣拘急疼痛、腋下瘰癧痛、胸中拘急、伏脊抽痛。`;

htChannel.muscle_channel_en = `【Heart Muscle Channel (Jing Jin)】
• Trajectory: Originates at little finger, binds at pisiform bone (HT7), medial elbow (HT3), axilla, chest, diaphragm, and umbilicus.
• Pathology: Cramping of little finger, pain along inner elbow/arm, axillary swelling, chest oppression, spinal cramping.`;

htChannel.dermatome_zh = `【少陰皮部 —— 「樞儒」(Shaoyin Dermatome)】
• 少陰皮部名「樞儒」（樞者樞紐，儒者柔順）。少陰為三陰之「樞」，主心腎相交、水火既濟。邪犯少陰見心悸、怔忡、心煩失眠、舌強不語。`;

htChannel.channel_rhyme_zh = `【手少陰心經循行歌與分寸歌】
「手少陰穴九心經，起於極泉少衝停，心胸神志咽舌病，前臂內側後廉行。
極泉腋窩動脈牽，青靈肘上三寸連，少海肘內橫紋頭，靈道掌後寸半求，
通里掌後一寸取，陰隙掌後半寸留，神門尺側銳骨陷，少府四五掌骨間，
少衝小指橈側角，九穴精微仔細看。」`;

htChannel.points_curriculum = [
  {
    code: "HT1",
    nameZh: "極泉 (Jiquan)",
    nameEn: "Highest Spring",
    category: "心經起點 (Entry Point) · 局部與急救要穴",
    location: "腋窩中央，腋動脈搏動處 (Center of axilla, on medial side of axillary artery).",
    needling: "直刺 0.5 - 1.0 寸。⚠️ 避開腋動脈 (Avoid Axillary Artery). 可灸。",
    actions: "寬胸理氣 (Unbinds Chest)、通經活絡 (Activates Channel)、利臂止痛 (Benefits Arm).",
    indications: "心痛、胸脅痛、瘰癧、肩臂冷痛、五十肩、腋下臭汗、手臂麻木抽搐。",
    notes: "【課件考綱精華】心經起點；胸痛與上肢痛要穴；避開腋動脈。"
  },
  {
    code: "HT2",
    nameZh: "青靈 (Qingling)",
    nameEn: "Cyan Spirit",
    category: "局部要穴 (Local Point)",
    location: "上臂內側，少海(HT3)上3寸，肱二頭肌內側溝中 (3 cun proximal to HT3, in groove medial to biceps brachii).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "通經活絡 (Activates Channel)、理氣止痛 (Alleviates Pain).",
    indications: "心痛、頭痛、目黃、脅痛、肩臂痛、帕金森/中風手顫 (Hand tremors).",
    notes: "【課件考綱精華】上肢痛與手顫（帕金森氏症/中風後遺症手抖）局部要穴。"
  },
  {
    code: "HT3",
    nameZh: "少海 (Shaohai)",
    nameEn: "Lesser Sea",
    category: "五輸穴之合穴 (He-Sea - 水穴 Water Point)",
    location: "屈肘，肘橫紋內側端與肱骨內上髁連線中點 (Midway between medial end of cubital crease and medial epicondyle of humerus).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "清心安神 (Calms Spirit)、化痰瀉火 (Transforms Phlegm & Clears Heat)、通經活絡 (Activates Channel)、利音清咽 (Benefits Voice & Tongue).",
    indications: "心痛、失眠、健忘、癲癇、暴瘖失音（突然失音）、目赤腫痛、口舌生瘡、肘臂攣痛、瘰癧。",
    notes: "【課件考綱精華】① 合穴（水穴）：清心瀉火、化痰安神（治痰火擾心致癲癇失眠）。② 突然失音與肘部攣痛要穴。"
  },
  {
    code: "HT4",
    nameZh: "靈道 (Lingdao)",
    nameEn: "Spirit Pathway",
    category: "五輸穴之經穴 (Jing-River - 金穴 Metal Point)",
    location: "前臂掌側，腕橫紋上1.5寸，尺側腕屈肌腱橈側 (1.5 cun above wrist crease, radial side of flexor carpi ulnaris tendon).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "寧心安神 (Calms Spirit)、通利舌本 (Benefits Voice & Tongue)、舒筋活絡 (Relaxes Sinews).",
    indications: "心悸、心痛、失音（暴瘖）、舌強不語、悲傷善恐（臟躁症 Restless Zang Disorder）、肘臂攣痛。",
    notes: "【課件考綱精華】臟躁症（Restless Zang Disorder）與突然失音、舌強不語要穴。"
  },
  {
    code: "HT5",
    nameZh: "通里 (Tongli)",
    nameEn: "Connecting Li",
    category: "絡穴 (Luo-Connecting Point to SI Channel)",
    location: "前臂掌側，腕橫紋上1寸，尺側腕屈肌腱橈側 (1 cun proximal to wrist crease, radial side of flexor carpi ulnaris).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "通利舌本 (Benefits Tongue & Voice)、清心安神 (Calms Spirit)、調律止悸 (Regulates Heart Rhythm)、清熱止血 (Cools Blood).",
    indications: "心悸、心律不整 (Arrhythmia)、失眠、突然失音（暴瘖）、舌強不語、口吃 (Stuttering)、月經過多、尿頻尿失禁、肘臂痛。",
    notes: "【課件考綱精華】① 絡穴通舌本：舌強不語、口吃、暴瘖失音第一要穴。② 心律不整與心悸。③ 移熱於小腸致尿頻尿失禁。"
  },
  {
    code: "HT6",
    nameZh: "陰隙 (Yinxi)",
    nameEn: "Yin Cleft",
    category: "郄穴 (Xi-Cleft Point of Heart Channel) · 盜汗要穴",
    location: "前臂掌側，腕橫紋上0.5寸，尺側腕屈肌腱橈側 (0.5 cun proximal to wrist crease, radial side of flexor carpi ulnaris).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清虛熱 (Clears Deficiency Fire)、止盜汗 (Alleviates Night Sweating)、和心血 (Regulates Heart Blood)、緩急止痛 (Moderates Acute Conditions).",
    indications: "急性心痛、心心痛（血瘀急性心絞痛）、陰虛盜汗（Night Sweating特效）、吐血、鼻衄、暴瘖、骨蒸潮熱。",
    notes: "【課件考綱精華】① 盜汗第一要穴（陰虛盜汗特效）。② 郄穴：專治急性心絞痛與心血瘀阻發作。"
  },
  {
    code: "HT7",
    nameZh: "神門 (Shenmen)",
    nameEn: "Spirit Gate",
    category: "原穴 · 輸穴 (Shu-Stream - 土穴/子穴 Earth/Child Point) · 全身安神第一要穴",
    location: "腕掌側橫紋尺側端，尺側腕屈肌腱橈側凹陷中 (Ulnar end of wrist crease, radial side of flexor carpi ulnaris).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "安神定志 (Calms Spirit & Mind)、補心氣血陰陽 (Regulates & Tonifies Heart)、清心火 (Clears Heart Fire)、和胃降逆 (Harmonizes Stomach).",
    indications: "心痛、心悸、心律不整、失眠（Insomnia第一要穴）、健忘、癡呆、癲狂、悲傷欲哭、驚悸、胸脅痛。",
    notes: "【課件考綱精華】① 全身安神定志第一要穴：治療失眠、心悸、焦慮、健忘與神志病首選。② 原穴輸穴：補心氣、心血、心陰與心陽。"
  },
  {
    code: "HT8",
    nameZh: "少府 (Shaofu)",
    nameEn: "Lesser Mansion",
    category: "五輸穴之滎穴 (Ying-Spring - 火穴/本穴 Fire Point)",
    location: "手掌面，第4、5掌骨之間，握拳時小指尖所指處 (Between 4th & 5th metacarpals, where tip of little finger rests when making a fist).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清瀉心火 (Clears Heart & SI Fire)、利下焦 (Benefits Lower Jiao)、安神定志 (Calms Spirit).",
    indications: "心悸、胸痛、小便不利、遺尿、陰癢（外陰瘙癢）、掌心發熱、目黃、胸脅痛。",
    notes: "【課件考綱精華】本穴滎穴：清瀉心火與小腸熱（心火下移小腸致尿頻陰癢、掌心發熱）。"
  },
  {
    code: "HT9",
    nameZh: "少衝 (Shaochong)",
    nameEn: "Lesser Surge",
    category: "五輸穴之井穴 (Jing-Well - 木穴/母穴 Wood/Mother Point) · 心臟急救第一要穴",
    location: "手小指橈側，指甲角旁0.1寸 (Radial side of little finger, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或三稜針點刺出血 (Prick to bleed). 可灸。",
    actions: "開竅甦厥 (Revives Consciousness)、清心瀉火 (Clears Heat & Benefits Tongue/Eyes)、安神定志 (Calms Spirit).",
    indications: "心絞痛、急性心肌梗塞急救 (Heart Attack Emergency)、中風昏迷、熱病發熱、心煩心痛、喉痺、舌強痛、掌心熱。",
    notes: "【課件考綱精華】① 心臟急救第一要穴（Heart attack / Stroke emergency point）：強刺激或點刺出血救逆。② 井穴：開竅甦厥。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Heart Channel (HT) with full 9 points, Luo channel, Dermatome, and Palpation Segmental Diagnosis!');

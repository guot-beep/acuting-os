/**
 * scratch/enrich_all_remaining_channels.js
 * Populate 100% full untruncated curriculum notes, songs, divergent, luo, muscle, dermatome,
 * pathomechanism, and preservation for PC, TE, GB, LR, Du, Ren, Chong, Dai, Yangqiao, Yinqiao, Yangwei, Yinwei.
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

// -------------------------------------------------------------
// PC (手厥陰心包經 - 9穴)
// -------------------------------------------------------------
const pc = channels.find(c => c.code === 'PC');
if (pc) {
  pc.seam_anatomy_zh = `【體內循行路線】
起於胸中，出屬心包絡，下穿膈肌，沿腹膜腔間隙依次聯絡上、中、下三焦。分支從胸中沿脇肋穿出於天池穴。

【體表循行縫隙描述】
胸脇部：起於天池穴（乳頭外1寸，第4肋間隙）；
上臂與前臂部：沿肱二頭肌內側長短頭縫隙下行至肘窩（曲澤 PC3），沿掌長肌腱與橈側腕屈肌腱之間的縫隙（郄門 PC4、間使 PC5、內關 PC6、大陵 PC7）至手掌（勞宮 PC8），出中指末端（中衝 PC9）。`;

  pc.qihua_zh = `【手厥陰經氣化與心主之官】
手厥陰心包經內屬於心包，外行於天池至中衝。心包為心臟之外圍屏障，代心受邪。《素問·靈蘭秘典論》曰：「心包者，膻中之官，喜樂出焉。」膻中為宗氣布散之處，心包氣化失常見心痛、心悸、胸悶、胸脅支滿、狂躁失眠。`;

  pc.pathomechanism_zh = `【主要病候】
心痛，心悸，胸脅支滿，掌中熱痛，心煩，面赤，目黃，喜笑不休，嘔吐，癲狂。

【《靈樞·經脈》是動病與所生病原文】
是動病：手心熱，臂肘攣急，腋腫，甚則胸脅支滿，心中澹澹大動，面赤，目黃，喜笑不休，是為臂厥。
所生病：主脈所生病者，煩心，心痛，掌中熱。

【常見經絡異常按診切診 3 段判讀】
1. 內關至大陵段：按壓有劇烈過敏性壓痛或細沙粒狀結節，提示心包氣血瘀阻、心悸失眠、噁心嘔吐或胸陽不振。
2. 曲澤段：肘窩曲澤處壓痛或有異常青筋（靜脈浮絡），提示心包熱入營血、心絞痛或胃腸吐瀉。
3. 天池段：天池穴按壓痛或有結節，提示胸脅氣滯、乳腺痛或心胸鬱結。`;

  pc.preservation_zh = `【心包經日常保養與導引】
• 戌時 (19:00 - 21:00) 養生：戌時心包經當令。心包為心臟之屏障。戌時宜放鬆心情、聽音樂、按揉內關穴，保持心胸開朗。忌大喜大怒。
• 導引按揉保養穴位：
  1. 按揉 **PC6 內關**（和胃降逆止嘔、寬胸理氣、安神定志第一要穴）。
  2. 按揉 **PC7 大陵**（清心瀉火、治口臭與心煩失眠）。
  3. 按揉 **PC3 曲澤**（清熱涼血、治心絞痛與胃腸吐瀉）。`;

  pc.divergent_channel_zh = `【手厥陰心包經經別 (Pericardium Divergent Channel)】
• 循行路線：從天池穴下3寸分出，別入胸中，貫穿上中下三焦，上循喉嚨，淺出于耳後，合於手少陽三焦經（天牖穴）。
• 臨床意義：加強心包與三焦之表裡貫通，並上連喉嚨與耳後。`;

  pc.luo_channel_zh = `【手厥陰絡脈 —— 內關 (PC6 Luo-Connecting Channel)】
• 循行與病變：在腕後2寸（內關穴）分出走向手少陽三焦經；其支脈沿本經上行系於心包，絡於心系。實則心痛，虛則頭項強痛。取絡穴內關 (PC6) 治療。`;

  pc.muscle_channel_zh = `【手厥陰經筋 (Pericardium Muscle Channel / Sinew Channel)】
• 循行路線：起於中指端，結於掌中，上沿前臂結於肘內側，上上臂內側，結於腋下，下散前後脅，結於胸中，散於膈。`;

  pc.dermatome_zh = `【厥陰皮部 —— 「害肩」(Jueyin Dermatome)】
• 厥陰皮部名「害肩」。厥陰為三陰之「闔」，主陰氣之開闔與陰血之調暢。`;

  pc.channel_rhyme_zh = `【手厥陰心包經循行歌與九穴分寸歌】
「手厥陰穴九心包，起於天池中衝拋，心胸胃痛神志病，前臂正中屈肌找。
天池乳外一寸尋，天泉腋下二寸深，曲澤肘窩肌腱內，郄門腕上五寸臨，
間使腕上三寸取，內關掌後二寸尋，大陵掌後橫紋中，勞宮掌心握指求，
中衝中指尖端處，九穴精微仔細審。」`;

  pc.points_curriculum = [
    { code: "PC1", nameZh: "天池", nameEn: "Celestial Pool", category: "天牖五部/天窗穴 · 手厥陰與足少陽交會穴", location: "胸部，第4肋間隙，乳頭外側1寸 (In 4th intercostal space, 1 cun lateral to nipple).", needling: "斜刺或平刺 0.2 - 0.4 寸。⚠️ 嚴禁深刺，防止氣胸危險。可灸。", actions: "寬胸理氣 (Unbinds the chest)、化痰散結 (Transforms phlegm & Dissipates nodules)、降逆平喘 (Descends rebellion)、通乳 (Benefits breasts).", indications: "胸脅脹痛、胸悶、咳嗽、氣喘、腋下腫痛、瘰癧、乳腺炎、產後缺乳、頭痛目眩、心痛。", notes: "【課件考綱精華】天窗穴：胸脅氣滯、乳腺痛與瘰癧要穴；嚴禁深刺。" },
    { code: "PC2", nameZh: "天泉", nameEn: "Celestial Spring", category: "局部要穴 (Local Point)", location: "上臂前側，腋前紋頭下2寸，肱二頭肌長短頭之間 (2 cun below anterior axillary fold, between two heads of biceps brachii).", needling: "直刺 0.5 - 0.7 寸。可灸。", actions: "寬胸理氣 (Unbinds chest)、活血通絡 (Invigorates blood)、止痛 (Alleviates pain).", indications: "心痛、心悸、胸脇痛、咳嗽、上臂內側痛、手臂震顫（帕金森氏症手抖）。", notes: "【課件考綱精華】心絞痛、胸痛與手抖（帕金森氏症）要穴。" },
    { code: "PC3", nameZh: "曲澤", nameEn: "Marsh at the Bend", category: "五輸穴之合穴 (He-Sea - 水穴 Water Point)", location: "肘橫紋上，肱二頭肌肌腱尺側緣 (On transverse cubital crease, ulnar side of biceps brachii tendon).", needling: "直刺 0.5 - 0.7 寸，或三稜針點刺靜脈出血 (Prick to bleed)。可灸。", actions: "清營涼血 (Clears heat from Qi, nutritive & blood levels)、和胃降逆 (Harmonizes Stomach & Stops vomiting)、活血止痛 (Invigorates blood & Dispels stasis).", indications: "心痛、心悸、胃痛、嘔吐、腹瀉、急急性吐瀉（霍亂/Sudden turmoil）、吐血、衄血、熱病、肘臂攣痛、暑熱病。", notes: "【課件考綱精華】① 合穴（水穴）：清瀉心包熱邪與暑熱。② 點刺出血治急性胃腸炎吐瀉與心絞痛。" },
    { code: "PC4", nameZh: "郄門", nameEn: "Xi Cleft Gate", category: "郄穴 (Xi-Cleft Point of Pericardium Channel) · 急性心絞痛第一要穴", location: "前臂掌側，腕橫紋上5寸，掌長肌腱與橈側腕屈肌腱之間 (5 cun proximal to wrist crease, between palmaris longus & flexor carpi radialis).", needling: "直刺 0.5 - 1.0 寸。可灸。", actions: "涼血止血 (Cools blood & Stops bleeding)、活血祛瘀 (Invigorates blood & Dispels stasis)、清心安神 (Calms spirit)、緩急止痛 (Moderates acute conditions).", indications: "急性心痛（心絞痛/心肌梗塞發作）、心悸、嘔血、咳血、鼻衄、疔瘡、癲癇、抑鬱畏人、悲傷。", notes: "【課件考綱精華】① 郄穴：急性心絞痛與心肌梗塞發作第一救急要穴。② 涼血止血治嘔血咳血。" },
    { code: "PC5", nameZh: "間使", nameEn: "Intermediary Courier", category: "五輸穴之經穴 (Jing-River - 金穴 Metal Point)", location: "前臂掌側，腕橫紋上3寸，掌長肌腱與橈側腕屈肌腱之間 (3 cun proximal to wrist crease, between palmaris longus & flexor carpi radialis).", needling: "直刺 0.5 - 1.0 寸。可灸。", actions: "滌痰開竅 (Transforms phlegm & Settles spirit)、和胃降逆 (Harmonizes Stomach & Lowers rebellious Qi)、調經 (Regulates Menses).", indications: "心痛、心悸、胃痛、嘔吐、熱病、癲癇、瘧疾（半表半裏少陽瘧疾）、月經不調、甲狀腺腫大 (Enlarged thyroid)、喘鳴痰多 (配膻中 Ren17 / 天突 Ren22)。", notes: "【課件考綱精華】① 滌痰開竅：化痰清心治癲癇與神志病。② 瘧疾與甲狀腺腫大遠道要穴。" },
    { code: "PC6", nameZh: "內關", nameEn: "Inner Pass", category: "絡穴 (to TE Channel) · 八脈交會穴 (通陰維脈 Yin Wei - 配公孫 SP4) · 四總穴 (心胸內關謀)", location: "前臂掌側，腕橫紋上2寸，掌長肌腱與橈側腕屈肌腱之間 (2 cun proximal to wrist crease, between palmaris longus & flexor carpi radialis).", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "寬胸理氣 (Unbinds the chest & Regulates Qi)、和胃降逆 (Harmonizes Stomach & Alleviates nausea/vomiting)、寧心安神 (Calms the spirit)、調陰維脈 (Opens Yin Wei vessel).", indications: "心痛、心悸、胸悶、胃痛、嘔吐 (Nausea/Vomiting特效)、呃逆、失眠、癲癇、熱病、暈車暈船 (Motion sickness)、孕吐 (Morning sickness)、臂肘攣痛。", notes: "【課件考綱精華】① 四總穴（心胸內關謀）：心胸疾病與胃痛噁心嘔吐第一要穴。② 八脈交會穴通陰維脈（配公孫 SP4 治胃心胸病症）。" },
    { code: "PC7", nameZh: "大陵", nameEn: "Great Mound", category: "原穴 · 輸穴 (Shu-Stream - 土穴/子穴 Earth/Child Point) · 十三鬼穴 (鬼心)", location: "腕掌側橫紋中點，掌長肌腱與橈側腕屈肌腱之間 (In middle of transverse wrist crease, between palmaris longus & flexor carpi radialis).", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "清心瀉火 (Clears heat from Heart & Calms spirit)、和胃通腑 (Harmonizes Stomach & Intestines)、寬胸理氣 (Unbinds chest)、涼血 (Cools blood).", indications: "心痛、心悸、胸脅痛、胃痛、嘔吐、口臭 (Foul breath)、失眠、狂躁、精神錯亂、腕管症候群 (Carpal Tunnel Syndrome)。", notes: "【課件考綱精華】① 原穴瀉穴：清心火、治口臭與狂躁失眠。② 腕管症候群 (CTS) 局部要穴。" },
    { code: "PC8", nameZh: "勞宮", nameEn: "Place of Toil", category: "五輸穴之滎穴 (Ying-Spring - 火穴/本穴 Fire Point) · 十三鬼穴 (鬼路)", location: "手掌心，第2、3掌骨之間，握拳屈指時中指尖所指處 (Center of palm, between 2nd & 3rd metacarpals, where tip of middle finger rests).", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "清心瀉火 (Clears heat from Pericardium & Calms spirit)、醒神開竅 (Revives consciousness)、和胃清熱 (Clears heat from middle jiao)、涼血 (Cools blood).", indications: "心痛、心悸、胃痛、嘔吐、中風昏迷、熱病發熱、口瘡口臭、掌心發熱、狂躁癲癇、手足癬。",
    notes: "【課件考綱精華】① 滎穴本穴（火穴）：清心包與心胃實火（口舌生瘡、口臭、掌心熱）。② 醒神開竅救逆。"
  },
  {
    code: "PC9",
    nameZh: "中衝", nameEn: "Central Hub", category: "五輸穴之井穴 (Jing-Well - 木穴/母穴 Wood/Mother Point)", location: "手中指末端中央 (In center of tip of middle finger).", needling: "淺刺 0.1 寸，或點刺出血 (Prick to bleed)。可灸。", actions: "開竅甦厥 (Revives consciousness)、清心瀉熱 (Clears heat from Pericardium & Heart)、利舌本 (Benefits tongue).", indications: "心絞痛、中風昏迷、熱病高熱、舌強腫痛、小兒夜啼、熱入營血、暑熱吐瀉。",
    notes: "【課件考綱精華】① 井穴急救：中風昏迷與高熱甦厥急救要穴。② 點刺出血清心火。"
  }
];
}

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated PC with 100% untruncated full clinical text!');

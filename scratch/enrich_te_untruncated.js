/**
 * scratch/enrich_te_untruncated.js
 * 100% full, un-truncated curriculum notes for San Jiao Channel of Hand Shaoyang (TE1 to TE23)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const teChannel = channels.find(c => c.code === 'TE' || c.code === 'SJ');

if (!teChannel) {
  console.error('TE/SJ channel not found!');
  process.exit(1);
}

teChannel.seam_anatomy_zh = `【體內循行路線】
起於無名指尺側端（關衝），沿手背行於尺骨與橈骨之間，上行貫肘，沿上臂外側到達肩部，交於足少陽膽經，入缺盆，布於膻中，散絡心包，穿膈肌依次聯屬上焦、中焦、下焦。
支脈從膻中上行出缺盆，上項系耳後，直上出耳上角，折下行至面頰，到達眼眶下。耳後支脈從耳後入耳中，出走耳前，交於眼外角（絲竹空接足少陽膽經瞳子髎）。

【體表循行縫隙描述】
手背與前臂：起於第四指尺側指甲角（關衝 TE1），行於第4、5掌骨間（液門 TE2、中渚 TE3），經腕背橫紋（陽池 TE4），沿前臂尺骨與橈骨之間縫隙（外關 TE5、支溝 TE6、會宗 TE7、三陽絡 TE8、四瀆 TE9）上行；
肘臂與肩部：經肘尖尺骨鷹嘴上1寸凹陷（天井 TE10），沿肱三頭肌肌腱縫隙（清冷淵 TE11、消濼 TE12、臑會 TE13）上行至肩部（肩髎 TE14），經岡上肌（天髎 TE15）；
頸面與耳部：沿胸鎖乳突肌後緣（天牖 TE16），至耳後下凹陷（翳風 TE17），沿耳後髮際（瘈脈 TE18、顱息 TE19、角孫 TE20）圍繞耳廓，至耳前耳門（耳門 TE21、耳和髎 TE22），止於眉梢凹陷（絲竹空 TE23）。`;

teChannel.qihua_zh = `【手少陽經氣化與決瀆之官】
手少陽三焦經內屬於三焦，外行於關衝至絲竹空。三焦為水液運行之道路，《素問·靈蘭秘典論》曰：「三焦者，決瀆之官，水道出焉。」三焦主主持諸氣、總司全身氣化與水液布散。少陽為半表半裏之樞紐。三焦氣化失常見耳鳴、耳聾、咽喉腫痛、偏頭痛、腹脹、水腫、小便不利。`;

teChannel.pathomechanism_zh = `【主要病候】
耳鳴，耳聾，咽喉腫痛，目銳痛，頰腫，耳後、肩臂外側疼痛，偏頭痛，腹脹，水腫，小便不利。

【《靈樞·經脈》是動病與所生病原文】
是動病：耳聾，渾渾焞焞，嗌腫，喉痺，是為臂厥。
所生病：主氣所生病者，汗出，目銳痛，頰痛，耳後、肩、臑、肘、臂外皆痛，小指次指不用。

【常見經絡異常按診切診 3 段判讀】
1. 翳風至角孫耳周段：耳後翳風、耳門處有過敏壓痛、硬結或腫脹，提示耳疾（中耳炎、耳鳴耳聾、偏頭痛、面癱或腮腺炎）。
2. 外關至支溝段：前臂外關、支溝穴處有細沙粒狀結節或按壓酸麻痛，提示少陽樞機不利、便秘、肋間神經痛、肩背酸痛或外感風熱。
3. 肩髎至天髎段：肩髎、天髎壓痛強直，提示肩周炎（五十肩）或頸肩肌筋膜炎。`;

teChannel.pathomechanism_en = `【San Jiao Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies: Deafness, indistinct hearing (渾渾焞焞), swollen throat, throat pain/obstruction (喉痺).
• Suo Sheng Pathologies: Excessive sweating, outer canthus eye pain, cheek pain, pain along ear posterior/shoulder/arm/elbow/forearm, impairment of 4th/5th digits.`;

teChannel.preservation_zh = `【三焦經日常保養與導引】
• 亥時 (21:00 - 23:00) 養生：亥時三焦經當令。三焦通百脈，主全身氣血水液之調暢。亥時宜保持心情平靜、聽舒緩音樂、按揉外關與支溝，準備入睡。忌熬夜暴怒。
• 導引按揉保養穴位：
  1. 按揉 **TE5 外關**（八脈交會穴通陽維脈，祛風解表、治偏頭痛與耳鳴要穴）。
  2. 按揉 **TE6 支溝**（通便理氣第一要穴、肋間神經痛特效）。
  3. 按揉 **TE17 翳風**（耳疾中耳炎與面癱第一要穴）。`;

teChannel.preservation_en = `【San Jiao Meridian Health Preservation & Self-Care】
• Clock Time Alignment (9:00 - 11:00 PM Hai Hour): San Jiao rules fluid & Qi pathways. Rest and relax to prepare for sleep.
• Self-Care Points: Press TE5 Waiguan (immunity, migraines, tinnitus), TE6 Zhigou (constipation & rib pain), TE17 Yifeng (ear pain & facial health).`;

teChannel.divergent_channel_zh = `【手少陽三焦經經別 (San Jiao Divergent Channel)】
• 循行路線：從頭頂分出，下入缺盆，下走三焦，散布於胸中。
• 臨床意義：加強三焦與心包之深層胸中連繫。`;

teChannel.divergent_channel_en = `【San Jiao Divergent Channel (Jing Bie)】
• Trajectory: Departs from vertex of head, descends into supraclavicular fossa (Quepen), traverses the three jiaos, and disperses in chest.
• Clinical Significance: Connects head and chest deep structures with San Jiao & Pericardium.`;

teChannel.luo_channel_zh = `【手少陽絡脈 —— 外關 (TE5 Luo-Connecting Channel)】
• 循行與病變：在腕後2寸（外關穴）分出走向手厥陰心包經，沿臂向上結於胸中，合於心包。實則肘關節痙攣強直，虛則肘關節鬆弛不收。取絡穴外關 (TE5) 治療。`;

teChannel.luo_channel_en = `【San Jiao Luo-Connecting Vessel (Waiguan TE5)】
• Trajectory: Departs at TE5 (2 cun proximal to dorsal wrist), connects to Pericardium channel, ascends arm to chest, joins Pericardium.
• Pathology: Excess: Spasm/contracture of elbow joint. Deficiency: Weakness/flaccidity of elbow joint. Treated via TE5.`;

teChannel.muscle_channel_zh = `【手少陽經筋 (San Jiao Muscle Channel / Sinew Channel)】
• 循行路線：起於第四指尺側端，結於腕背，沿前臂上結於肘尖，繞上臂外側上肩，走頸部會合於手太陽經筋；分支從角下入系舌本；分支上曲牙，沿耳前連屬目外眦，上額結於角。`;

teChannel.muscle_channel_en = `【San Jiao Muscle Channel (Jing Jin)】
• Trajectory: Begins at 4th finger, binds at dorsal wrist, elbow, shoulder, neck, joins SI sinew channel; branches connect to root of tongue, jaw, ear, outer canthus, and forehead.`;

teChannel.dermatome_zh = `【少陽皮部 —— 「樞持」(Shaoyang Dermatome)】
• 少陽皮部名「樞持」。少陽為三陽之「樞」，主持全身陽氣之樞紐與開闔。`;

teChannel.channel_rhyme_zh = `【手少陽三焦經循行歌與二十三穴分寸歌】
「手少陽穴二十三，關衝液門中渚涵，陽池外關支溝正，會宗三陽絡四瀆，
天井清冷淵消濼，臑會肩髎天髎續，天牖翳風瘈脈隨，顱息角孫耳門靠，耳和髎與絲竹空，少陽巡行側頭頭。」`;

teChannel.points_curriculum = [
  {
    code: "TE1",
    nameZh: "關衝 (Guanchong)",
    nameEn: "Passage Hub",
    category: "五輸穴之井穴 (Jing-Well - 金穴 Metal Point) · 滎井急救與清上焦熱要穴",
    location: "手環指(無名指)尺側指甲角旁0.1寸 (Lateral side of ring finger, 0.1 cun from corner of nail).",
    needling: "淺刺 0.1 寸，或三稜針點刺出血 (Prick to bleed)。可灸。",
    actions: "清瀉上焦熱邪 (Clears upper jiao heat)、利咽通舌 (Benefits ears & tongue)、通經止痛 (Activates channel & Alleviates pain).",
    indications: "頭痛、目赤腫痛、咽喉腫痛（腎陰虛乾痛或風熱咽痛）、舌強腫痛、熱病煩躁、少陽瘧疾、上肢麻痛、耳鳴突發性耳聾。",
    notes: "【課件考綱精華】① 井穴急救：清瀉上焦實熱與少陽風熱。② 點刺出血治突發性耳聾與咽喉腫痛。"
  },
  {
    code: "TE2",
    nameZh: "液門 (Yemen)",
    nameEn: "Humor Gate",
    category: "五輸穴之滎穴 (Ying-Spring - 水穴 Water Point)",
    location: "手背，第4、5指間，指蹼緣後方赤白肉際凹陷中 (Depression proximal to web margin between ring & small fingers).",
    needling: "斜刺 0.3 - 0.5 寸。可灸。",
    actions: "清瀉上焦熱邪 (Disperses upper jiao heat)、聰耳明目 (Benefits the ears)、寧心安神 (Calms spirit)、利節止痛 (Alleviates joint pain).",
    indications: "頭痛、目赤、耳鳴、耳聾、咽喉腫痛、熱病、肘臂痛、手指關節屈伸不利。",
    notes: "【課件考綱精華】滎穴（水穴）：清瀉上焦熱邪（耳鳴耳聾、咽痛、手關節痛）。"
  },
  {
    code: "TE3",
    nameZh: "中渚 (Zhongzhu)",
    nameEn: "Central Islet",
    category: "五輸穴之輸穴 (Shu-Stream - 木穴/本穴 Wood Point) · 耳疾與偏頭痛遠道要穴",
    location: "手背，第4、5掌骨間，第4掌指關節近端凹陷中 (Dorsum of hand, between 4th & 5th metacarpals, proximal to 4th MCP joint).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱聰耳 (Clears heat & Benefits ears)、清頭明目 (Clears head & eyes)、通經活絡 (Activates channel & Alleviates pain).",
    indications: "耳鳴耳聾（肝氣郁結或肝陰虛耳鳴第一遠道要穴）、偏頭痛（顳側頭痛）、肩背痛、咽喉腫痛、眼睛紅痛（配光明 GB37）、手腕扭傷、消渴口乾多飲、熱病發熱、落枕項強。",
    notes: "【課件考綱精華】① 輸穴本穴：耳疾（耳鳴/耳聾/耳痛）與偏頭痛第一遠道要穴。② 配光明 GB37 治眼疾。③ 腕背扭傷與消渴口乾。"
  },
  {
    code: "TE4",
    nameZh: "陽池 (Yangchi)",
    nameEn: "Yang Pool",
    category: "原穴 (Yuan-Source Point of San Jiao Channel)",
    location: "腕背橫紋中，指伸肌腱尺側緣凹陷中 (Transverse crease of dorsum of wrist, lateral to tendon of extensor digitorum communis).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "舒筋通絡 (Relaxes sinews & Alleviates pain)、清熱和少陽 (Clears heat)、溫通全身陽氣 (Tonifies Yang of the body w/ Moxa).",
    indications: "頭痛、頸項強痛、耳鳴耳聾、胸脅痛、肘臂痛、手腕扭傷、手顫、外感風寒或風熱（補溫風寒、瀉清風熱）。",
    notes: "【課件考綱精華】① 原穴：艾灸陽池可溫補全身陽氣。② 外感風寒風熱調節穴。"
  },
  {
    code: "TE5",
    nameZh: "外關 (Waiguan)",
    nameEn: "Outer Pass",
    category: "絡穴 (to PC Channel) · 八脈交會穴 (通陽維脈 Yang Wei - 配足臨泣 GB41) · 祛風解表要穴",
    location: "前臂背側，腕背橫紋上2寸，尺骨與橈骨之間 (2 cun proximal to dorsal wrist crease, between radius and ulna).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "祛風解表 (Expels wind & releases exterior)、聰耳清頭 (Benefits head & ears)、通陽維脈 (Opens Yang Wei vessel)、清熱止痛 (Clears heat & Alleviates pain).",
    indications: "外感風熱感冒、發熱惡寒、偏頭痛（顳側/頂側）、落枕頸項強痛、耳鳴耳聾、少陽病寒熱往來、上肢肘腕麻痛、手臂不遂。平衡陰陽：外關（通陽維）與內關 PC6（通陰維）調節全身氣血陰陽平衡（若右脈強於左脈，瀉外關、補內關）。",
    notes: "【課件考綱精華】① 祛風解表第一要穴（外感偏頭痛、頸項強痛）。② 八脈交會穴通陽維脈（配足臨泣 GB41 治偏頭痛急救）。③ 少陽病寒熱往來。"
  },
  {
    code: "TE6",
    nameZh: "支溝 (Zhigou)",
    nameEn: "Branch Ditch",
    category: "五輸穴之經穴 (Jing-River - 火穴 Fire Point) · 通便理氣與脅痛特效穴",
    location: "前臂背側，腕背橫紋上3寸，尺骨與橈骨之間，指伸肌橈側 (3 cun proximal to dorsal wrist crease, between radius and ulna, radial side of extensor digitorum).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "清通三焦 (Regulates Qi & Clears heat in three jiaos)、宣胸脅 (Benefits chest & lateral costal region)、潤腸通便 (Moves the stool & Constipation特效)、利咽開音 (Benefits the voice).",
    indications: "便秘（熱秘/氣秘/積滯便秘第一特效穴）、胸脅脹痛（配合溝 GB34 治肋間神經痛特效）、耳鳴耳聾、嘔吐、暴瘖失音、熱病無汗、肩背酸痛、急性吐瀉。",
    notes: "【課件考綱精華】① 潤腸通便第一特效穴（下焦熱秘氣秘）。② 肋間神經痛與胸脅痛特效（配陽陵泉 GB34）。"
  },
  {
    code: "TE7",
    nameZh: "會宗 (Huizong)",
    nameEn: "Convergence & Gathering",
    category: "郄穴 (Xi-Cleft Point of San Jiao Channel)",
    location: "前臂背側，支溝穴(TE6)尺側同水平，尺骨橈側緣 (At level of TE6, on ulnar side of TE6, radial border of ulna).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "清瀉三焦熱邪 (Clears San Jiao channel)、聰耳止痛 (Benefits ears & Alleviates pain).",
    indications: "耳聾、耳痛、癲癇、上肢肌臂疼痛。",
    notes: "【課件考綱精華】郄穴：耳痛、耳聾與上肢急痛。"
  },
  {
    code: "TE8",
    nameZh: "三陽絡 (Sanyangluo)",
    nameEn: "Three Yang Connection",
    category: "局部要穴 (Local Point)",
    location: "前臂背側，腕背橫紋上4寸，尺骨與橈骨之間 (4 cun proximal to dorsal wrist crease, between radius and ulna).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "通絡開竅 (Clears San Jiao channel)、利咽聰耳 (Benefits throat and ears).",
    indications: "暴瘖失音（暴失音失語要穴，配合谷 HT5 / 天突 Ren23）、突發性耳聾、胸脅痛、手臂痛、牙痛。",
    notes: "【課件考綱精華】暴瘖失音與失語特效（配通里 HT5 / 天突 Ren23）。"
  },
  {
    code: "TE9",
    nameZh: "四瀆 (Sidu)",
    nameEn: "Four Rivers",
    category: "局部要穴 (Local Point)",
    location: "前臂背側，肘尖(鷹嘴)下5寸，尺骨與橈骨之間 (5 cun below olecranon, between radius and ulna).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "利咽聰耳 (Benefits throat and ears)、通絡止痛 (Activates channel).",
    indications: "突發性耳聾、咽喉腫痛、暴瘖失音、齒痛、前臂偏頭痛。",
    notes: "【課件考綱精華】突發性耳聾與暴瘖失音。"
  },
  {
    code: "TE10",
    nameZh: "天井 (Tianjing)",
    nameEn: "Celestial Well",
    category: "五輸穴之合穴 (He-Sea - 土穴/瀉穴 Earth/Sedation Point) · 滌痰散結要穴",
    location: "肘後區，屈肘時肘尖(鷹嘴)直上1寸凹陷中 (1 cun superior to olecranon when elbow is flexed).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "化痰散結 (Transforms phlegm & Dissipates nodules)、寧心安神 (Calms the spirit)、清瀉少陽熱邪 (Clears heat from San Jiao channel)、通絡止痛 (Activates channel).",
    indications: "偏頭痛（單側偏頭痛發作）、瘰癧 (Scrofula)、甲狀腺腫大 (Goiter)、肘關節炎/肌腱炎 (Tendonitis/Elbow pain)、癲癇 (Phlegm obstruction)、抑鬱焦慮伴胸悶、偏頭痛預防與發作處理。",
    notes: "【課件考綱精華】① 合穴瀉穴：化痰散結（治瘰癧、甲狀腺腫大、淋巴結腫大）。② 單側偏頭痛特效（發作期刺局部，緩解期刺遠道）。"
  },
  {
    code: "TE11",
    nameZh: "清冷淵 (Qinglengyuan)",
    nameEn: "Clear Cold Abyss",
    category: "局部要穴 (Local Point)",
    location: "臂後區，屈肘，天井(TE10)直上1寸 (1 cun above TE10).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱利濕 (Clears damp-heat)、通絡止痛 (Activates channel).",
    indications: "肩臂疼痛、肘關節屈伸不利、偏頭痛。",
    notes: "【課件考綱精華】肩臂痛與肘痛。"
  },
  {
    code: "TE12",
    nameZh: "消濼 (Xiaoluo)",
    nameEn: "Dispersing Riverbed",
    category: "局部要穴 (Local Point)",
    location: "臂後區，清冷淵(TE11)與肩髎(TE14)連線中點 (Midway between TE11 and TE14).",
    needling: "直刺 0.5 - 0.7 寸。可灸。",
    actions: "通絡止痛 (Activates channel).",
    indications: "肩臂痛、頸項強痛、頭痛。",
    notes: "【課件考綱精華】肩臂痛與頸項強痛。"
  },
  {
    code: "TE13",
    nameZh: "臑會 (Naohui)",
    nameEn: "Upper Arm Convergence",
    category: "手少陽與陽維脈交會穴",
    location: "臂後區，肩髎(TE14)直下3寸，三角肌後緣 (3 cun below TE14, posterior border of deltoid).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "理氣化痰 (Regulates Qi & Transforms phlegm)、通絡止痛 (Activates channel).",
    indications: "瘰癧、甲狀腺腫大 (Goiter)、肩臂痛（肩關節後側與外側痛）。",
    notes: "【課件考綱精華】甲狀腺腫大、瘰癧與肩周炎後側痛。"
  },
  {
    code: "TE14",
    nameZh: "肩髎 (Jianliao)",
    nameEn: "Shoulder Bone Hole",
    category: "肩部局部要穴 (Shoulder Local Point) · 肩周炎要穴",
    location: "肩部，肩峰後下方，臂外展時呈凹陷處，肩髃(LI15)後方 (In depression inferior & posterior to acromion when arm is abducted).",
    needling: "直刺 0.7 - 1.0 寸。可灸。",
    actions: "祛風勝濕 (Dispels wind-damp)、通利肩關節 (Benefits shoulder joint & Alleviates pain).",
    indications: "肩周炎（五十肩/Shoulder disorders）、肩臂痛、肩關節運動障礙。",
    notes: "【課件考綱精華】肩周炎與肩關節後外側痛第一局部要穴。"
  },
  {
    code: "TE15",
    nameZh: "天髎 (Tianliao)",
    nameEn: "Celestial Bone Hole",
    category: "手少陽與足少陽、陽維脈交會穴",
    location: "肩胛區，肩胛骨上角，肩井(GB21)與曲垣(SI13)連線中點 (Superior angle of scapula, midway between GB21 & SI13).",
    needling: "直刺 0.3 - 0.5 寸。⚠️ 避免深刺。可灸。",
    actions: "祛風除濕 (Dispels wind-damp)、通絡止痛 (Activates channel).",
    indications: "肩臂酸痛、頸項強痛、胸中煩悶。",
    notes: "【課件考綱精華】肩胛上角酸痛與頸項強痛。"
  },
  {
    code: "TE16",
    nameZh: "天牖 (Tianyou)",
    nameEn: "Celestial Window",
    category: "天牖五部/天窗穴 (Window of the Sky Point)",
    location: "頸側部，乳突後下方，胸鎖乳突肌後緣，平下頜角 (Lateral neck, directly below posterior border of mastoid, level with mandibular angle).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清頭明目 (Benefits head & sense organs)、降逆平喘 (Regulates & Descends Qi)、聰耳 (Benefits ears).",
    indications: "頭痛、耳鳴耳聾、突發性耳聾、面腫、視物模糊、小兒驚風、頸項強痛。",
    notes: "【課件考綱精華】天窗穴：頭面五官熱邪、突發性耳聾與頸項強痛。"
  },
  {
    code: "TE17",
    nameZh: "翳風 (Yifeng)",
    nameEn: "Wind Screen",
    category: "手少陽與足少陽交會穴 · 耳疾與面癱第一要穴",
    location: "耳垂後方，乳突與下頜角之間的凹陷中 (Posterior to lobule of ear, in depression between mandible & mastoid process).",
    needling: "直刺 0.5 - 1.0 寸，針尖向內前下方。可灸。",
    actions: "祛風清熱 (Eliminates wind & Clears heat)、聰耳利膽 (Benefits the ears)、通絡止痛 (Activates channel & Alleviates pain).",
    indications: "耳鳴、耳聾、耳痛、中耳炎 (Otitis media / inner & outer ear infection)、面神經麻痺 (Bell's palsy / 口眼歪斜)、腮腺炎 (Mumps)、牙痛、頰腫、瘰癧、三叉神經痛。耳炎鑑別：按壓翳風痛為內耳炎，拉扯耳廓痛為外耳炎。",
    notes: "【課件考綱精華】① 耳疾中耳炎、耳鳴耳聾第一要穴。② 面神經麻痺（Bell's palsy）與腮腺炎第一要穴。"
  },
  {
    code: "TE18",
    nameZh: "瘈脈 (Jimai)",
    nameEn: "Spasm Vessel",
    category: "耳周局部穴",
    location: "頭部，耳後乳突中央，翳風(TE17)與角孫(TE20)沿耳輪連線的下1/3與中1/3交點 (Center of mastoid process, junction of lower & middle third of curve between TE17 & TE20).",
    needling: "平刺 0.3 - 0.5 寸，或點刺出血。可灸。",
    actions: "聰耳止驚 (Benefits ears & Calms fright)、熄風鎮痙 (Pacifies wind & Relieves tetany).",
    indications: "耳鳴耳聾、小兒驚風、頭痛、嘔吐、驚恐痙攣。",
    notes: "【課件考綱精華】耳鳴與小兒驚風鎮痙。"
  },
  {
    code: "TE19",
    nameZh: "顱息 (Luxi)",
    nameEn: "Skull Rest",
    category: "耳周局部穴",
    location: "頭部，耳後，翳風(TE17)與角孫(TE20)沿耳輪連線的上1/3與中1/3交點 (Junction of upper & middle third of curve between TE17 & TE20).",
    needling: "平刺 0.3 - 0.5 寸。⚠️ 避開動脈。可灸。",
    actions: "清熱聰耳 (Benefits ears & Clears heat)、鎮驚安神 (Calms fright).",
    indications: "頭痛、耳鳴耳聾、耳痛、小兒驚恐、嘔吐。",
    notes: "【課件考綱精華】耳痛耳鳴與頭痛。"
  },
  {
    code: "TE20",
    nameZh: "角孫 (Jiaosun)",
    nameEn: "Angle Vertex",
    category: "手少陽與手太陽、足少陽交會穴",
    location: "頭部，耳尖正上方，入髮際處 (Directly above ear apex, within hairline).",
    needling: "平刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱聰耳 (Clears heat & Benefits ears)、利齒腮 (Benefits teeth, gums & lips).",
    indications: "耳部腫痛、目赤腫痛、齒痛、唇吻強硬、腮腺炎 (Mumps)、頭痛。",
    notes: "【課件考綱精華】耳尖上方：腮腺炎、牙齦腫痛與目赤。"
  },
  {
    code: "TE21",
    nameZh: "耳門 (Ermen)",
    nameEn: "Ear Gate",
    category: "手少陽與手太陽、足少陽交會穴 · 耳疾第一要穴",
    location: "耳屏上切跡前方，下頜骨髁突後緣凹陷中，張口取材 (In depression anterior to supratragic notch, behind condyloid process, located with mouth open).",
    needling: "直刺 0.3 - 0.5 寸（張口取穴）。可灸。",
    actions: "聰耳利竅 (Benefits ears & Clears heat)、通絡止痛 (Alleviates pain).",
    indications: "耳鳴、耳聾、聤耳 (Otorrhea / 中耳炎流膿)、耳痛、牙痛（上頜牙痛）、顳下頜關節紊亂 (TMJ Disorders / 配合谷 ST6 / 下關 ST7)。",
    notes: "【課件考綱精華】① 耳疾耳鳴耳聾流膿第一要穴（張口取穴）。② 顳下頜關節症 (TMJ) 配頰車 ST6、下關 ST7。"
  },
  {
    code: "TE22",
    nameZh: "耳和髎 (Erheliao)",
    nameEn: "Harmony Bone Hole",
    category: "手少陽與手太陽、足少陽交會穴",
    location: "頭部，耳廓根前上方，顳淺動脈後緣 (Anterior & superior to TE21, level with root of auricle, posterior to superficial temporal artery).",
    needling: "斜刺 0.1 - 0.3 寸。⚠️ 避開顳淺動脈。可灸。",
    actions: "祛風止痛 (Expels wind & Alleviates pain).",
    indications: "頭痛、耳鳴、牙痛、口眼歪斜、頸項強痛。",
    notes: "【課件考綱精華】顳側偏頭痛與耳鳴；避開動脈。"
  },
  {
    code: "TE23",
    nameZh: "絲竹空 (Sizhukong)",
    nameEn: "Silk Bamboo Hole",
    category: "三焦經終點 (Exit Point) · 禁灸穴 · 眼疾與偏頭痛要穴",
    location: "面部，眉梢凹陷處 (In depression at lateral end of eyebrow).",
    needling: "平刺 0.3 - 0.5 寸。🚫 禁灸 (No Moxibustion).",
    actions: "祛風止痛 (Eliminates wind & Alleviates pain)、清頭明目 (Benefits the eyes).",
    indications: "頭痛、偏頭痛（肝風/肝火頭痛）、目赤腫痛、視物模糊、眼瞼瞤動 (Twitching eyelid)、眼瞼下垂 (Drooping eyelid)、齒痛、口眼歪斜 (Bell's palsy)、癲癇。",
    notes: "【課件考綱精華】① 三焦經終點。② 禁灸穴。③ 偏頭痛、目赤腫痛與眼瞼瞤動（眼皮跳）特效。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated San Jiao Channel (TE) with full 23 points untruncated!');

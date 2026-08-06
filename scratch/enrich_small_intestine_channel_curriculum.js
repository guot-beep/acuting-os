/**
 * scratch/enrich_small_intestine_channel_curriculum.js
 * 100% comprehensive enrichment for Small Intestine Channel (SI) including:
 * - 19 Points detailed curriculum notes (SI1 to SI19)
 * - Divergent Channel (經別)
 * - Luo Channel (絡脈：支正 SI7 治贅疣)
 * - Muscle Channel (經筋)
 * - Dermatome (皮部：關樞)
 * - Channel Rhymes & Songs (循行歌、十九穴分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、所生病與 3 段按診切診判讀)
 * - Meridian Care & Preservation (未時養生、後谿天宗導引、受盛之官與小腸主液)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const siChannel = channels.find(c => c.code === 'SI');

if (!siChannel) {
  console.error('SI channel not found!');
  process.exit(1);
}

siChannel.seam_anatomy_zh = `【體內循行路線】
進入缺盆後，沿食管兩側胸膜腔間隙下行穿膈肌，聯絡心臟，抵達胃部，屬於小腸。

【體表循行縫隙描述】
手部：起於小指尺側指甲角，沿第五掌骨尺側緣至腕部；
前臂部：行於尺側腕伸肌與尺側腕屈肌之間的縫隙，至尺骨鷹嘴與肱骨內上髁之間的凹陷（小海穴）；
上臂與肩部：沿肱三頭肌長頭與外側頭之間上行，繞岡下肌、岡上肌（天宗、秉風、曲垣），交大椎(GV14)後入缺盆；
頭頸面部：支脈循胸鎖乳突肌後緣（天窗 SI16、天容 SI17）上頰，至目銳眥入耳中（聽宮 SI19）；分支抵鼻至目內眥（接足太陽膀胱經 BL1 睛明）。`;

siChannel.qihua_zh = `【手太陽經氣化與受盛之官】
《素問·靈蘭秘典論》曰：「小腸者，受盛之官，化物出焉。」小腸主受盛和分別清濁，將食物殘渣下送大腸，精微水液（液）下輸膀胱。

【小腸主液】
《脾胃論·卷下》云：「大腸主津，小腸主液。」小腸吸收養分精微與水液，參與人體液體代謝。小腸氣化失常見腹瀉、小腹脹痛、小便頻數或不通。`;

siChannel.pathomechanism_zh = `【主要病候】
耳聾，目黃，頰腫，頸、頷、肩、臑、肘、臂外側後廉痛，咽喉腫痛，少腹痛，小便頻數或不通。

【《靈樞·經脈》是動病與所生病原文】
是動病：嗌痛，頷腫，不可以顧，肩拔如折，臑似折，是為臂厥。
所生病：主液所生病者，目黃，脅痛，頸頷肩臑肘臂外後廉痛。

【常見經絡異常按診切診 3 段判讀】
1. 後谿至腕骨段：原穴腕骨或後谿有硬結或極度酸痛，提示小腸積熱或頸椎/腰椎寒凝。
2. 支正段：絡穴支正處有結節或贅疣，提示手太陽經氣阻滯、疣贅生或心經失調。
3. 天宗至肩中俞段：天宗壓痛劇烈提示肩胛肌筋膜炎、乳腺增生或心胸氣滯。`;

siChannel.pathomechanism_en = `【Small Intestine Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies: Sore throat, swollen cheek/jaw, stiffness of neck (unable to turn head), shoulder feels broken/pulled, upper arm pain as if broken (臂厥).
• Suo Sheng Pathologies (Disorders of Liquid / 液): Yellow eyes, hypochondriac pain, pain along posterior-lateral aspect of neck, jaw, shoulder, arm, and elbow.`;

siChannel.preservation_zh = `【小腸經日常保養與導引】
• 未時 (01:00 PM - 03:00 PM) 養生：未時小腸經當令，小腸分別清濁、吸收水液精微。未時宜多喝溫水促進腸道吸收與水分循環排毒。
• 導引按揉保養穴位：
  1. 按揉 **SI3 後谿**（通督脈、治療頸椎病、腰痛、保護視力特效穴）。
  2. 按揉 **SI11 天宗**（解肩背酸痛、通乳散結）。
  3. 按揉 **SI6 養老**（清頭明目、利肩臂痛、老年保健要穴）。`;

siChannel.preservation_en = `【Small Intestine Meridian Health Preservation & Self-Care】
• Clock Time Alignment (1:00 - 3:00 PM Wei Hour): Small Intestine meridian is most active, separating the clear from the turbid. Drink warm water during Wei Hour to promote nutrient absorption and fluid metabolism.
• Self-Care Points: Press SI3 Houxi (cervical spine, back pain, vision), SI11 Tianzong (shoulder pain, lactation), SI6 Yanglao (eye health for elderly, joint stiffness).`;

siChannel.divergent_channel_zh = `【手太陽小腸經經別 (Small Intestine Divergent Channel)】
• 循行路線：從肩解部（肩關節）別出，入腋走心，下巡小腸。
• 臨床意義：加強小腸與心臟之深層表裡連繫。`;

siChannel.divergent_channel_en = `【Small Intestine Divergent Channel (Jing Bie)】
• Trajectory: Departs from shoulder joint (SI10/SI9), enters axilla, penetrates Heart, and descends to Small Intestine.
• Clinical Significance: Connects Small Intestine directly to the Heart organ.`;

siChannel.luo_channel_zh = `【手太陽絡脈 —— 支正 (SI7 Luo-Connecting Channel)】
• 循行路線：在腕後5寸（支正穴）分出走向手少陰心經；其支脈上肘絡於肩髃部。
• 病變：實證為關節鬆弛、肘臂失用、生贅疣（疣贅/Warts/Skin tags）；虛證為皮膚生小贅疣。取絡穴支正 (SI7) 治療。`;

siChannel.luo_channel_en = `【Small Intestine Luo-Connecting Vessel (Zhizheng SI7)】
• Trajectory: Departs from SI7 (5 cun above wrist), connects to Heart channel; branch ascends to elbow and shoulder.
• Pathology: Excess: Joint laxity, weakness of elbow/arm, warts/skin tags (贅疣). Deficiency: Small skin tags. Treated via SI7.`;

siChannel.muscle_channel_zh = `【手太陽經筋 (Small Intestine Muscle Channel / Sinew Channel)】
• 循行路線：起於手小指尺側端，結於腕，結於肘內側，繞肩胛，上頸結於耳後，分支入耳中，上結於目銳眥，上角絡於頭頂。
• 病候：小指痛、肘內側後緣痛、肩胛痛拘急、頸項強痛、耳鳴耳痛。`;

siChannel.muscle_channel_en = `【Small Intestine Muscle Channel (Jing Jin)】
• Trajectory: Originates at little finger, binds at wrist, elbow, scapula, neck, behind ear, enters ear, connects at outer canthus of eye, and ascends head.
• Pathology: Pain of little finger, inner elbow, scapula, stiffness of neck, tinnitus, ear pain.`;

siChannel.dermatome_zh = `【太陽皮部 —— 「關樞」(Taiyang Dermatome)】
• 太陽皮部名「關樞」（關者主表，樞者運轉）。太陽為三陽之「關」，主一身之表，外感邪氣首犯太陽。`;

siChannel.channel_rhyme_zh = `【手太陽小腸經循行歌與分寸歌】
「手太陽穴十九經，起於少澤聽宮終，頭面五官熱神志，肩臂後廉液病同。
少澤小指尺甲角，前谷節前陷中求，後谿節後橫紋頭，腕骨腕前骨陷取，
陽谷腕後銳骨下，養老轉拳骨縫瞅，支正腕上五寸取，小海肘內兩骨間，
肩貞腋後一寸許，臑俞肩髃後陷間，天宗岡下窩中陷，秉風岡上舉臂填，
曲垣岡內端陷處，肩外俞在二肋邊，肩中俞在大椎旁，天窗肌後結喉平，
天容耳下肌前陷，顴髎面頰顴骨下，聽宮耳屏前陷中，十九穴名仔細考。」`;

siChannel.points_curriculum = [
  {
    code: "SI1",
    nameZh: "少澤 (Shaoze)",
    nameEn: "Lesser Marsh",
    category: "五輸穴之井穴 (Jing-Well - 金穴 Metal Point) · 催乳第一要穴",
    location: "手小指尺側，指甲角旁0.1寸 (Ulnar side of little finger, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或點刺出血 (Prick to bleed)。可灸。",
    actions: "通乳消腫 (Promotes Lactation & Benefits Breasts)、清熱開竅 (Clears Heat & Revives Consciousness)、利頭面五官 (Benefits Sensory Orifices).",
    indications: "產後缺乳（乳少）、乳腺炎（乳癰）、急性咽喉腫痛、舌強、耳鳴耳痛、高熱昏迷、頭痛、目赤腫痛、手指麻木。",
    notes: "【課件考綱精華】① 產後催乳第一要穴（缺乳/乳少/乳腺炎）。② 井穴刺血急救高熱失音。"
  },
  {
    code: "SI2",
    nameZh: "前谷 (Qiangu)",
    nameEn: "Front Valley",
    category: "五輸穴之滎穴 (Ying-Spring - 水穴 Water Point)",
    location: "微握拳，手小指尺側，第5掌指關節前下方赤白肉際凹陷中 (Ulnar end of crease in front of 5th MCP joint).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "疏風清熱 (Clears Wind-Heat)、消腫止痛 (Reduces Swelling & Alleviates Pain)、利耳目項背 (Benefits Ears, Eyes & Neck).",
    indications: "頭痛、項強痛（頸椎拉傷/落枕）、耳鳴耳聾、目赤腫痛、咽喉腫痛、產後缺乳、小便赤澀。",
    notes: "【課件考綱精華】滎穴清風熱：頸椎扭傷落枕與耳目風熱腫痛。"
  },
  {
    code: "SI3",
    nameZh: "後谿 (Houxi)",
    nameEn: "Back Ravine",
    category: "五輸穴之輸穴 (Shu-Stream - 木穴/母穴) · 八脈交會穴 (通督脈 Du Mai - 配申脈 BL62)",
    location: "微握拳，第5掌指關節後下方尺側，掌橫紋頭赤白肉際凹陷中 (Ulnar end of distal palmar crease, proximal to 5th MCP joint).",
    needling: "直刺 0.5 - 0.7 寸。可灸。",
    actions: "通調督脈 (Regulates Governing Vessel)、疏風清熱 (Clears Wind-Heat)、通絡止痛 (Activates Channel & Alleviates Pain)、清心安神 (Calms Spirit & Treats Epilepsy)、止盜汗 (Alleviates Night Sweats w/ HT6).",
    indications: "頭痛、頸項強痛、急性腰扭傷（特效）、脊柱痛、肩背痛、手臂手指麻木攣急、癲癇、瘧疾、盜汗（配陰隙 HT6）、目赤腫痛、耳鳴耳聾、發熱無汗。",
    notes: "【課件考綱精華】① 通督脈第一要穴（八脈交會穴配申脈 BL62）：頸椎病、急性腰扭傷、脊柱痛與姿勢矯正在線特效。② 治癲癇與盜汗（配 HT6 陰隙）。"
  },
  {
    code: "SI4",
    nameZh: "腕骨 (Wangu)",
    nameEn: "Wrist Bone",
    category: "原穴 (Yuan-Source Point of Small Intestine Channel)",
    location: "手掌尺側，第5掌骨基底部與三角骨之間的凹陷中，赤白肉際處 (In depression between base of 5th metacarpal & hamate/triquetral bone).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "疏太陽邪熱 (Clears Heat & Reduces Swelling)、退黃疸 (Benefits Jaundice)、通絡止痛 (Activates Channel).",
    indications: "黃疸、膽囊炎、頭痛、頸項強痛、手腕手掌腫痛、熱病、退行性關節痛、頷腫。",
    notes: "【課件考綱精華】① 原穴：退黃疸（Jaundice）要穴。② 腕部與手部痛。"
  },
  {
    code: "SI5",
    nameZh: "陽谷 (Yanggu)",
    nameEn: "Yang Valley",
    category: "五輸穴之經穴 (Jing-River - 火穴/本穴 Fire Point)",
    location: "腕背側尺側，尺骨莖突與三角骨之間的凹陷中 (At ulnar end of wrist crease, between styloid process of ulna & triquetral bone).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱瀉火 (Clears Heat & Reduces Swelling)、安神定志 (Calms Spirit)、利腕關節 (Benefits Wrist).",
    indications: "頭痛、目眩、耳鳴耳聾、齒痛、頷腫、手腕痛、肩臂痛、狂躁神志病、小兒驚風。",
    notes: "【課件考綱精華】本穴（火穴）：清熱瀉火、手腕局部痛。"
  },
  {
    code: "SI6",
    nameZh: "養老 (Yanglao)",
    nameEn: "Nursing the Aged",
    category: "郄穴 (Xi-Cleft Point of Small Intestine Channel) · 老年眼疾要穴",
    location: "前臂背側尺側，掌心向胸時，尺骨莖突橈側骨縫凹陷中 (When palm faces chest, in bony cleft on radial side of styloid process of ulna).",
    needling: "向肘部斜刺 0.5 - 0.8 寸。可灸。",
    actions: "明目退翳 (Benefits Eyes & Failing Vision)、舒筋通絡 (Activates Channel & Alleviates Pain)、緩和急性痛 (Moderates Acute Conditions).",
    indications: "目視不明（老花眼、白內障、視力減退）、肩背肘臂痛、急性腰扭傷、頸項強痛、上肢癱瘓無力。",
    notes: "【課件考綱精華】① 老年眼疾要穴（視力減退、老花眼、白內障）。② 郄穴：急性肩背痛與急性腰痛。"
  },
  {
    code: "SI7",
    nameZh: "支正 (Zhizheng)",
    nameEn: "Branch to the Correct",
    category: "絡穴 (Luo-Connecting Point to Heart Channel) · 贅疣特效穴",
    location: "前臂背側尺側，陽谷(SI5)與小海(SI8)連線上，腕背橫紋上5寸 (5 cun proximal to wrist crease on SI5-SI8 line).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "祛風清熱 (Clears Heat & Releases Exterior)、消贅疣 (Treats Warts/Skin Tags)、安神定志 (Calms Spirit)、通絡止痛 (Activates Channel).",
    indications: "贅疣（扁平疣/尋常疣/Skin tags/Warts特效）、頭痛、項強痛、肘臂酸痛、熱病、狂躁、癲癇、肘臂無力。",
    notes: "【課件考綱精華】① 贅疣（Warts / Skin tags）第一特效穴（絡穴通心，氣滯生贅）。② 兼清頭面風熱與神志病。"
  },
  {
    code: "SI8",
    nameZh: "小海 (Xiaohai)",
    nameEn: "Small Sea",
    category: "五輸穴之合穴 (He-Sea - 土穴/子穴 Earth/Child Point)",
    location: "屈肘，尺骨鷹嘴與肱骨內上髁之間的凹陷中 (In depression between olecranon process of ulna & medial epicondyle of humerus).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "清熱散結 (Clears Heat & Dissipates Swelling)、通絡止痛 (Activates Channel & Alleviates Pain)、安神定志 (Calms Spirit).",
    indications: "肘臂疼痛麻木（尺神經麻痺/痛）、頸項肩背痛、癲癇、瘰癧、齒齦腫痛、頰腫。",
    notes: "【課件考綱精華】① 瀉穴（子穴）：清瀉小腸經與心經熱。② 肘部尺神經痛（Ulnar nerve pain）與肘關節攣急。"
  },
  {
    code: "SI9",
    nameZh: "肩貞 (Jianzhen)",
    nameEn: "True Shoulder",
    category: "肩部要穴 (Shoulder Local Point)",
    location: "肩關節後下方，臂內收時，腋後紋頭直上1寸 (1 cun above posterior end of axillary fold when arm adducted).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "祛風利濕 (Expels Wind)、利肩關節 (Benefits Shoulder)、通絡止痛 (Activates Channel).",
    indications: "肩背疼痛、肩關節周圍炎（五十肩）、上肢不遂、手麻痛、瘰癧、肩部腫脹。",
    notes: "【課件考綱精華】五十肩（肩周炎）與肩背痛要穴。"
  },
  {
    code: "SI10",
    nameZh: "臑俞 (Naoshu)",
    nameEn: "Upper Arm Shu",
    category: "手太陽經與陽維脈、陽貎脈交會穴",
    location: "肩部，腋後紋頭直上，肩胛岡下緣凹陷中 (Directly above posterior end of axillary fold, inferior to scapular spine).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "利肩關節 (Benefits Shoulder)、通絡止痛 (Activates Channel).",
    indications: "肩臂疼痛、肩關節活動受限、瘰癧、肩腫痛。",
    notes: "【課件考綱精華】肩關節痛與活動受限。"
  },
  {
    code: "SI11",
    nameZh: "天宗 (Tianzong)",
    nameEn: "Celestial Gathering",
    category: "肩胛與乳疾第一要穴 (Primary Scapular & Breast Point)",
    location: "肩胛區，天宗凹陷中，岡下窩中央，約第4胸椎棘突平齊 (In depression center of subscapular fossa, level with T4).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "通絡止痛 (Activates Channel & Alleviates Pain)、寬胸理氣 (Unbinds Chest)、通乳散結 (Benefits Breasts & Promotes Lactation).",
    indications: "肩胛疼痛（肩胛肌筋膜炎特效）、肩背僵硬痛、頸項強痛、乳腺炎（乳癰）、產後缺乳（乳少）、乳房脹痛（乳癖）、咳嗽、氣喘、胸脅痛。",
    notes: "【課件考綱精華】① 肩胛痛與肌筋膜痛第一要穴。② 婦科乳腺炎與產後催乳要穴。"
  },
  {
    code: "SI12",
    nameZh: "秉風 (Bingfeng)",
    nameEn: "Grasping the Wind",
    category: "手太陽經、手陽明經、足少陽經、手少陽經交會穴",
    location: "肩胛區，岡上窩中央，天宗(SI11)直上方 (In center of suprascapular fossa, directly above SI11).",
    needling: "直刺 0.5 - 0.7 寸。可灸。",
    actions: "祛風通絡 (Expels Wind)、利肩胛 (Benefits Shoulder & Scapula).",
    indications: "肩胛疼痛、肩臂痠麻、舉臂困難。",
    notes: "【課件考綱精華】祛風止痛，治肩胛痛舉臂困難。"
  },
  {
    code: "SI13",
    nameZh: "曲垣 (Quyuan)",
    nameEn: "Crooked Wall",
    category: "局部要穴 (Local Point)",
    location: "肩胛區，岡上窩內側端 (On medial extremity of suprascapular fossa).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "通絡止痛 (Benefits Shoulder & Scapula).",
    indications: "肩胛崗內側痛、肩背拘急疼痛。",
    notes: "【課件考綱精華】肩胛內側痛與肩背拘急。"
  },
  {
    code: "SI14",
    nameZh: "肩外俞 (Jianwaishu)",
    nameEn: "Outer Shoulder Shu",
    category: "局部要穴 (Local Point)",
    location: "背部，第1胸椎棘突下旁開3寸 (3 cun lateral to lower border of spinous process of T1).",
    needling: "斜刺 0.3 - 0.7 寸。⚠️ 避免向內深刺。可灸。",
    actions: "祛風散寒 (Expels Wind & Cold)、通絡止痛 (Benefits Shoulder & Scapula).",
    indications: "肩背疼痛、頸項強痛、上肢酸麻。",
    notes: "【課件考綱精華】風寒肩背痛與頸項強痛。"
  },
  {
    code: "SI15",
    nameZh: "肩中俞 (Jianzhongshu)",
    nameEn: "Central Shoulder Shu",
    category: "局部要穴 (Local Point)",
    location: "背部，第7頸椎棘突下旁開2寸 (2 cun lateral to lower border of spinous process of C7).",
    needling: "斜刺 0.3 - 0.6 寸。⚠️ 避免深刺。可灸。",
    actions: "宣肺降氣 (Descends Lung Qi)、通絡止痛 (Activates Channel).",
    indications: "肩背痛、頸項強痛、咳嗽、氣喘、視物模糊、唾血。",
    notes: "【課件考綱精華】肩背痛與咳嗽氣喘。"
  },
  {
    code: "SI16",
    nameZh: "天窗 (Tianchuang)",
    nameEn: "Celestial Windows",
    category: "天牖五部/天窗穴 (Window of the Sky Point)",
    location: "頸外側部，胸鎖乳突肌後緣，扶突(LI18)後方，平結喉 (In lateral neck, posterior to SCM, level with Adam's apple).",
    needling: "直刺 0.3 - 0.7 寸。可灸。",
    actions: "聰耳利咽 (Benefits Ears, Throat & Voice)、安神定志 (Calms Spirit)、清熱散結 (Clears Heat & Disperses Swelling).",
    indications: "耳鳴、耳聾、暴瘖失音（突然失音）、咽喉腫痛、頸項強痛、瘰癧、癭氣、癲癇。",
    notes: "【課件考綱精華】天窗穴：耳鳴耳聾與突然失音、瘰癧要穴。"
  },
  {
    code: "SI17",
    nameZh: "天容 (Tianrong)",
    nameEn: "Celestial Countenance",
    category: "天牖五部/天窗穴 · 手太陽經與手少陽經交會穴",
    location: "頸部，下頜角後方，胸鎖乳突肌前緣凹陷中 (Posterior to angle of mandible, anterior border of SCM).",
    needling: "直刺 0.5 - 0.7 寸。⚠️ 避免深刺頸動脈。⚠️ 禁灸 (No Moxa).",
    actions: "利咽聰耳 (Benefits Throat & Ears)、降逆散結 (Descends Rebellious Qi & Disperses Swelling).",
    indications: "咽喉腫痛、暴瘖失音、耳鳴耳聾、瘰癧、癭氣、頰腫、頸項強痛、扁桃體炎。",
    notes: "【課件考綱精華】天窗穴：咽喉腫痛、扁桃體炎與耳鳴耳聾；禁灸。"
  },
  {
    code: "SI18",
    nameZh: "顴髎 (Quanliao)",
    nameEn: "Cheek Bone Hole",
    category: "手太陽經與手少陽經交會穴 · 面疾要穴",
    location: "面部，目外眥直下方，顴骨下緣凹陷中 (Directly below outer canthus, in depression on lower border of zygoma).",
    needling: "直刺或斜刺 0.5 - 0.8 寸。⚠️ 禁灸 (No Moxa).",
    actions: "祛風止痛 (Eliminates Wind & Alleviates Pain)、消腫正歪 (Reduces Swelling & Facial Spasm).",
    indications: "口眼歪斜（面癱）、三叉神經痛、面肌痙攣、齒痛（上頜牙痛）、頰腫、目黃、眼瞼瞤動。",
    notes: "【課件考綱精華】面癱、三叉神經痛與上頜牙痛第一要穴；禁灸。"
  },
  {
    code: "SI19",
    nameZh: "聽宮 (Tinggong)",
    nameEn: "Auditory Palace",
    category: "手太陽經、手少陽經與足少陽經交會穴 · 耳病第一要穴",
    location: "面部耳屏前，下頜骨髁突後方，張口時呈凹陷處 (Anterior to tragus, in depression formed when mouth open).",
    needling: "張口取穴，直刺 0.5 - 1.0 寸。可灸。",
    actions: "聰耳通竅 (Benefits Ears & Opens Orifices)、安神定志 (Calms Spirit)、利顳顎關節 (Benefits Mandibular Joint).",
    indications: "耳鳴、耳聾、聤耳（中耳炎耳腫流膿）、耳道痛、齒痛、顳顎關節紊亂 (TMJ)、癲癇、狂躁。",
    notes: "【課件考綱精華】① 耳病第一要穴（耳鳴耳聾中耳炎）：張口取穴。② 常配耳門 TE21、聽會 GB2 三聽穴。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Small Intestine Channel (SI) with full 19 points, Luo channel, Dermatome, and Palpation Segmental Diagnosis!');

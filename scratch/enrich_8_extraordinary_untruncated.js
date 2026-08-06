/**
 * scratch/enrich_8_extraordinary_untruncated.js
 * 100% full, un-truncated enrichment for 8 Extraordinary Vessels:
 * Du (督脈), Ren (任脈), Chong (衝脈), Dai (帶脈), Yangqiao (陽蹻脈), Yinqiao (陰蹻脈), Yangwei (陽維脈), Yinwei (陰維脈)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

function updateChannel(code, data) {
  let ch = channels.find(c => c.code === code);
  if (!ch) {
    console.log(`Creating channel ${code}...`);
    ch = { code, nameZh: data.nameZh || code, nameEn: data.nameEn || code, points_curriculum: [] };
    channels.push(ch);
  }
  Object.assign(ch, data);
}

// -------------------------------------------------------------
// 1. Du (督脈 - 28穴)
// -------------------------------------------------------------
const duPoints = [
  { code: "DU1", nameZh: "長強 (Changqiang)", nameEn: "Long Strong", category: "督脈絡穴 (to Ren & KD) · 痔瘡第一要穴", location: "尾骨端下0.5寸，尾骨端與肛門連線中點 (Midway between tip of coccyx and anus).", needling: "直刺 0.5 - 1.0 寸。可灸 (Moxibustion Applicable).", actions: "通調督脈 (Activates channel & Alleviates pain)、清熱利濕 (Benefits two lower yin & Treats hemorrhoids)、升陽固脫、寧心安神 (Calms the spirit).", indications: "痔瘡 (Hemorrhoids / Anal fissure)、便血、脫肛 (Prolapse of rectum)、便秘、腹瀉、腰脊強痛、癲癇、小便不利 (Five Lin)、陽痿遺精 (Sexual exhaustion).", notes: "【課件考綱精華】① 督脈絡穴：痔瘡（內痔/外痔/混合痔）與脫肛第一特效穴（配合谷/長強/承山 UB57/二白）。② 生殖泌尿與尾骨扭傷。" },
  { code: "DU2", nameZh: "腰俞 (Yaoshu)", nameEn: "Lumbar Shu", category: "腰骶部要穴", location: "骶管裂孔處 (In sacral hiatus).", needling: "向上斜刺 0.5 - 1.0 寸。可灸。", actions: "強腰利腿 (Benefits lumbar region & legs)、祛風除濕 (Dispels wind-damp).", indications: "月經不調、腰骶疼痛、下肢麻木、痔瘡、脫肛、下肢痿痺、痛經。", notes: "【課件考綱精華】下焦虛寒、腰骶痛與痔瘡要穴。" },
  { code: "DU3", nameZh: "腰陽關 (Yaoyangguan)", nameEn: "Lumbar Yang Pass", category: "腰部要穴 · 寒濕腰痛要穴", location: "第4腰椎棘突下凹陷中，平腸骨脊 (Below spinous process of 4th lumbar vertebra, level with iliac crest).", needling: "直刺 0.5 - 1.0 寸。可灸 (Moxibustion Applicable).", actions: "溫陽散寒 (Warming point for cold in lower warmer)、強腰利腿 (Benefits lumbar region)、理下焦 (Regulates lower jiao).", indications: "腰腿痛 (Lumbago)、腰脊強痛、月經不調、陽痿、遺精、帶下、下肢痿痺、寒濕腰痛 (彎腰前屈痛).", notes: "【課件考綱精華】腰陽關（腰部樞紐）：寒濕腰痛與彎腰前屈疼痛特效（多用艾灸）。" },
  { code: "DU4", nameZh: "命門 (Mingmen)", nameEn: "Life Gate", category: "命門之火 · 全身溫補腎陽第一要穴", location: "第2腰椎棘突下凹陷中 (Below spinous process of 2nd lumbar vertebra).", needling: "直刺 0.5 - 1.0 寸。可灸 (Moxibustion Applicable).", actions: "溫補腎陽 (Tonifies Kidney Qi & Yang)、補髓充腦 (Benefits lumbar & spine)、清熱固本 (Clears heat & Regulates Governing vessel).", indications: "腰脊強痛、腎虛陽痿、遺精、早洩、月經不調、赤白帶下、五更瀉 (Early morning diarrhea)、水腫、骨蒸潮熱 (Steaming bone disease).", notes: "【課件考綱精華】① 全身溫補生命之火（腎陽）第一要穴。② 治腎虛腰痛、膝軟無力與五更瀉。" },
  { code: "DU5", nameZh: "懸樞 (Xuanshu)", nameEn: "Suspended Pivot", category: "腰部局部穴", location: "第1腰椎棘突下凹陷中", needling: "直刺 0.5-1.0 寸。可灸。", actions: "健脾和胃、強腰脊", indications: "腰脊強痛、腹脹、腹瀉、消化不良", notes: "【課件考綱精華】腰痛與腸胃腹瀉。" },
  { code: "DU6", nameZh: "脊中 (Jizhong)", nameEn: "Middle of the Spine", category: "背部局部穴 · 禁灸", location: "第11胸椎棘突下凹陷中", needling: "直刺 0.5-1.0 寸。🚫 禁灸 (No Moxibustion).", actions: "健脾利濕、寧神", indications: "腰脊強痛、腹脹、黃疸、腹瀉、脫肛、癲癇", notes: "【課件考綱精華】禁灸；黃疸與腰脊痛。" },
  { code: "DU7", nameZh: "中樞 (Zhongshu)", nameEn: "Central Pivot", category: "背部局部穴", location: "第10胸椎棘突下凹陷中", needling: "直刺 0.5-1.0 寸。可灸。", actions: "利膽和胃、通絡止痛", indications: "腰脊痛、黃疸、嘔吐、腹脹", notes: "【課件考綱精華】黃疸與嘔吐腹脹。" },
  { code: "DU8", nameZh: "筋縮 (Jinsuo)", nameEn: "Muscle Contraction", category: "背部要穴 · 全身筋脈拘急要穴", location: "第9胸椎棘突下凹陷中", needling: "直刺 0.5-1.0 寸。可灸。", actions: "息風鎮驚、舒筋理氣", indications: "癲癇、小兒驚風、脊強反張、胃痛、腰背痛、筋脈拘急抽搐", notes: "【課件考綱精華】全身筋脈拘急抽搐、癲癇與背痛要穴。" },
  { code: "DU9", nameZh: "至陽 (Zhiyang)", nameEn: "Reaching Yang", category: "背部要穴 · 黃疸與寬胸要穴", location: "第7胸椎棘突下凹陷中，平肩胛下角", needling: "斜刺 0.5-1.0 寸。可灸。", actions: "利膽退黃、寬胸理氣、和胃降逆", indications: "黃疸 (Jaundice)、胸脅脹痛、咳嗽氣喘、胃痛、脊強痛、膽囊炎", notes: "【課件考綱精華】黃疸（急性/慢性黃疸）與胸悶肋痛第一要穴。" },
  { code: "DU10", nameZh: "靈台 (Lingtai)", nameEn: "Spirit Tower", category: "背部要穴 · 疔瘡癰疽要穴", location: "第6胸椎棘突下凹陷中", needling: "斜刺 0.5-1.0 寸。可灸 (多用艾灸).", actions: "宣肺止咳、清熱解毒", indications: "咳嗽、氣喘、疔瘡毒瘡 (Furuncles/Carbuncles)、背痛", notes: "【課件考綱精華】疔瘡毒瘡發熱（多用艾灸）。" },
  { code: "DU11", nameZh: "神道 (Shendao)", nameEn: "Spirit Path", category: "背部要穴", location: "第5胸椎棘突下凹陷中", needling: "斜刺 0.5-1.0 寸。可灸。", actions: "寧心安神、宣肺止咳", indications: "心悸、失眠、健忘、咳嗽、氣喘、脊背痛", notes: "【課件考綱精華】心悸失眠與氣喘。" },
  { code: "DU12", nameZh: "身柱 (Shenzhu)", nameEn: "Body Pillar", category: "小兒強身要穴", location: "第3胸椎棘突下凹陷中", needling: "斜刺 0.5-1.0 寸。可灸 (小兒灸).", actions: "宣肺止咳、寧心祛風、小兒健脾保健", indications: "咳嗽、氣喘、小兒驚風、癲癇、脊背強痛、小兒發育不良", notes: "【課件考綱精華】小兒保健與止咳要穴。" },
  { code: "DU13", nameZh: "陶道 (Taodao)", nameEn: "Kiln Path", category: "督脈與足太陽交會穴", location: "第1胸椎棘突下凹陷中", needling: "斜刺 0.5-1.0 寸。可灸。", actions: "解表清熱、和少陽", indications: "惡寒發熱、瘧疾、脊背強痛、頭痛", notes: "【課件考綱精華】外感發熱與瘧疾。" },
  { code: "DU14", nameZh: "大椎 (Dazhui)", nameEn: "Great Vertebra", category: "手足三陽與督脈七經交會穴 · 全身退熱第一要穴", location: "第7頸椎棘突下凹陷中 (Below spinous process of 7th cervical vertebra).", needling: "斜刺 0.5 - 1.0 寸。可灸。刺血拔罐。", actions: "解表退熱 (Clears heat & Releases exterior)、宣通全身陽氣、平喘止咳 (Benefits Lung & Calms asthma).", indications: "感冒高熱 (Febrile diseases)、惡寒發熱、項強、咳嗽氣喘、骨蒸潮熱、癲癇、肩背痛、風疹瘙癢。", notes: "【課件考綱精華】全身解表退熱（刺血拔罐）第一要穴。" },
  { code: "DU15", nameZh: "啞門 (Yamen)", nameEn: "Mute Gate", category: "督脈與陽維脈交會穴 · 舌強失語要穴", location: "第1頸椎下，後髮際正中直上0.5寸", needling: "伏案正坐，向下頜方向刺 0.5-1.0 寸。⚠️ 嚴禁向上深刺延髓！可灸。", actions: "開竅利舌、醒腦通絡", indications: "啞不能言 (Aphasia/Muteness)、舌強不語、中風舌癱、癲癇、頭痛、頸項強痛", notes: "【課件考綱精華】啞不能言與中風失語第一要穴；嚴禁向上深刺。" },
  { code: "DU16", nameZh: "風府 (Fengfu)", nameEn: "Wind Palace", category: "督脈與陽維脈交會穴 · 十三鬼穴 (鬼穴) · 祛風要穴", location: "枕骨下，後髮際正中直上1寸", needling: "伏案正坐，向下頜方向平刺或斜刺 0.5-1.0 寸。⚠️ 嚴禁向上深刺延髓！可灸。", actions: "祛風清頭 (Eliminates wind)、開竅醒神、通絡止痛", indications: "頭痛、項強、眩暈、中風失語、精神錯亂、癲癇、感冒風寒", notes: "【課件考綱精華】祛外風第一要穴；嚴禁向上深刺延髓。" },
  { code: "DU17", nameZh: "腦戶 (Naohu)", nameEn: "Brain Door", category: "督脈與足太陽交會穴", location: "枕外隆凸上緣凹陷中", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭熄風、寧神", indications: "頭痛、項強、眩暈、目赤腫痛、癲癇", notes: "【課件考綱精華】後頭痛與項強。" },
  { code: "DU18", nameZh: "強間 (Qiangjian)", nameEn: "Unyielding Space", category: "頭部局部穴", location: "腦戶(DU17)直上1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "平肝熄風、清頭止痛", indications: "頭痛、頸項強痛、眩暈、狂煩", notes: "【課件考綱精華】頭痛與項強。" },
  { code: "DU19", nameZh: "後頂 (Houding)", nameEn: "Behind the Crown", category: "頭部局部穴", location: "強間(DU18)直上1.5寸 (百會後1.5寸)", needling: "平刺 0.3-0.5 寸。可灸。", actions: "熄風止痛、寧神", indications: "頭痛、眩暈、癲癇、失眠", notes: "【課件考綱精華】頭痛與眩暈。" },
  { code: "DU20", nameZh: "百會 (Baihui)", nameEn: "Hundred Convergences", category: "督脈與手足三陽交會穴 · 全身升陽舉陷與醒腦第一要穴", location: "頭頂後正中線上，折頂線中點，兩耳尖連線中點 (5 cun within anterior hairline, 7 cun above posterior hairline).", needling: "平刺 0.5 - 0.8 寸。可灸 (Moxibustion Applicable).", actions: "升陽舉陷 (Raises Yang & Rescues prolapse)、醒腦開竅 (Revives consciousness)、寧心安神 (Calms spirit)、平肝熄風 (Extinguishes LV Wind).", indications: "頭痛、眩暈、高血壓/低血壓、脫肛 (Prolapse of rectum)、子宮脫垂 (Prolapse of uterus)、胃下垂、失眠、健忘、中風昏迷、癲癇。", notes: "【課件考綱精華】① 全身升陽舉陷第一要穴（治脫肛/子宮脫垂/胃下垂）。② 醒腦開竅、治失眠健忘高血壓。" },
  { code: "DU21", nameZh: "前頂 (Qianding)", nameEn: "In Front of the Crown", category: "頭部局部穴", location: "百會(DU20)前1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清頭、寧神", indications: "頭痛、眩暈、鼻塞、小兒驚風", notes: "【課件考綱精華】頭痛與眩暈。" },
  { code: "DU22", nameZh: "信會 (Xinhui)", nameEn: "Fontanelle Meeting", category: "頭部局部穴", location: "百會(DU20)前3寸 (前髮際直上2寸)", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清頭、通鼻", indications: "頭痛、眩暈、鼻塞、鼻衄、癲癇", notes: "【課件考綱精華】前頭痛與鼻塞。" },
  { code: "DU23", nameZh: "上星 (Shangxing)", nameEn: "Upper Star", category: "通鼻第一要穴", location: "前髮際正中直上1寸", needling: "平刺 0.3-0.5 寸。可灸。點刺出血。", actions: "宣肺通鼻 (Benefits nose)、清頭明目 (Clears head & eyes).", indications: "鼻塞、鼻淵 (Sinusitis)、鼻衄 (Nosebleed)、前額頭痛、目赤腫痛。", notes: "【課件考綱精華】鼻塞、鼻炎、鼻衄（點刺出血）第一要穴。" },
  { code: "DU24", nameZh: "神庭 (Shenting)", nameEn: "Courtyard of Spirit", category: "督脈與足太陽、足陽明交會穴 · 神志要穴", location: "前髮際正中直上0.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寧心安神 (Calms spirit)、清頭明目 (Benefits head & eyes).", indications: "頭痛、眩暈、失眠、癲癇、驚悸、鼻塞。", notes: "【課件考綱精華】失眠、焦慮與神志病要穴。" },
  { code: "DU25", nameZh: "素髎 (Suliao)", nameEn: "White Bone Hole", category: "面部急救要穴", location: "鼻尖正中", needling: "向上斜刺 0.2-0.3 寸，或點刺出血。🚫 禁灸。", actions: "開竅甦厥、升壓通鼻", indications: "休克昏迷、低血壓、鼻塞、鼻衄、酒糟鼻", notes: "【課件考綱精華】休克低血壓急救與酒糟鼻。" },
  { code: "DU26", nameZh: "水溝 (人中)", nameEn: "Water Trough (Renzhong)", category: "督脈與手足陽明交會穴 · 急救第一要穴", location: "人中溝的上1/3與中1/3交點處 (Junction of upper 1/3 & middle 1/3 of philtrum).", needling: "向上斜刺 0.3 - 0.5 寸，或掐按。可灸。", actions: "醒神開竅 (Revives consciousness & Rescues collapse)、回陽救逆、祛風通絡 (Clears sensory orifices).", indications: "休克昏迷 (Shock / Coma)、中風 (Apoplexy)、小兒驚風、癲癇、急性腰扭傷 (Acute lumbar sprain)、口眼歪斜。", notes: "【課件考綱精華】① 休克昏迷甦厥第一急救要穴（掐人中）。② 急性腰扭傷特效。" },
  { code: "DU27", nameZh: "兌端 (Duiduan)", nameEn: "Extremity of Lip", category: "口唇局部穴", location: "上唇紅肉際正中尖端", needling: "刺 0.2-0.3 寸。可灸。", actions: "清熱利齒、開竅", indications: "齒齦腫痛、口瘡、癲癇、鼻塞", notes: "【課件考綱精華】口瘡與牙齦腫痛。" },
  { code: "DU28", nameZh: "齦交 (Yinjiao)", nameEn: "Gum Intersection", category: "督脈終點 · 任督交會穴", location: "上唇系帶與齒齦交界處", needling: "向上斜刺 0.2-0.3 寸，或點刺出血。🚫 禁灸。", actions: "清熱明目、利齒宣鼻", indications: "齒齦腫痛、痔瘡 (出血點刺)、目赤腫痛、鼻淵", notes: "【課件考綱精華】督脈終點；痔瘡點刺唇系帶小白泡出血。" }
];

updateChannel('Du', {
  seam_anatomy_zh: `【體內循行路線】
起於小腹內胞宮，下出會陰，沿脊柱內部向上貫穿脊髓，經項後入腦，上達頭頂百會，沿前額下行至鼻柱，止於上唇系帶處（齦交）。`,
  qihua_zh: `【督脈氣化與陽脈之海】
督脈總督全身陽氣，稱為「陽脈之海」。主脊髓與腦，與神志、精神、升陽固脫、免疫力密切相關。`,
  pathomechanism_zh: `【主要病候】
脊柱強直，角弓反張，頭痛，頭暈，癲狂，發熱，神志病，陽痿，遺精，脫肛，痔瘡。`,
  preservation_zh: `【督脈日常保養與導引】
• 按揉 **DU20 百會**（升陽舉陷、治頭痛失眠）。
• 刺血拔罐 **DU14 大椎**（退熱解表）。
• 艾灸 **DU4 命門**（溫補腎陽）。`,
  divergent_channel_zh: `【督脈經別】
與足太陽經別並行，上貫脊，入屬腎。`,
  luo_channel_zh: `【督脈絡脈 —— 長強 (DU1 Luo-Connecting Channel)】
起於尾骨端長強穴，沿脊柱兩旁上行至項部，散於頭上。實則脊柱強直，虛則頭重搖晃。`,
  muscle_channel_zh: `【督脈經筋】
沿脊柱挾脊兩旁上行，結於枕骨，會於頭頂。`,
  dermatome_zh: `【督脈皮部】
分布於背部正中線及脊柱兩旁皮膚。`,
  channel_rhyme_zh: `【督脈循行歌與二十八穴分寸歌】
「督脈二十八穴行，長強腰俞腰陽關，命門懸樞脊中停，中樞筋縮至陽在，
靈台神道身柱推，陶道大椎啞門開，風府腦空強間位，後頂百會前頂催，
信會上星神庭置，素髎水溝兌端隨，齦交唇內二十八，陽脈之海總綱維。」`,
  points_curriculum: duPoints
});

// -------------------------------------------------------------
// 2. Ren (任脈 - 24穴)
// -------------------------------------------------------------
const renPoints = [
  { code: "REN1", nameZh: "會陰 (Huiyin)", nameEn: "Meeting of Yin", category: "任脈、督脈、衝脈三脈交會穴 · 溺水急救要穴", location: "會陰部，男性在陰囊根部與肛門連線中點，女性在大陰唇後聯合與肛門連線中點 (Between anus & scrotum/labia).", needling: "直刺 0.5 - 1.0 寸。可灸。", actions: "清利下焦 (Regulates lower yin orifices)、通利前陰後陰、醒神救逆 (Revives from drowning)、清熱利濕.", indications: "溺水窒息急救 (Main point for drowning)、陰癢陰痛、小便不利、尿頻、痔瘡、脫肛、月經不調、夢遺、癲癇。", notes: "【課件考綱精華】① 任督衝三脈交會穴。② 溺水窒息急救第一要穴。③ 下陰生殖病症。" },
  { code: "REN2", nameZh: "曲骨 (Qugu)", nameEn: "Curved Bone", category: "任脈與足厥陰交會穴", location: "下腹部，恥骨聯合上緣中點 (Midpoint of upper border of pubic symphysis).", needling: "直刺 0.5 - 1.0 寸。⚠️ 孕婦深刺禁針。可灸。", actions: "溫補腎氣 (Warms & Tonifies Kidneys)、通利小便 (Benefits urination)、調理衝任.", indications: "小便不利、遺尿、赤白帶下 (Feminine discharges)、陽痿、遺精、痛經、疝氣。", notes: "【課件考綱精華】下焦虛寒、赤白帶下與前陰痛。" },
  { code: "REN3", nameZh: "中極 (Zhongji)", nameEn: "Central Pole", category: "膀胱募穴 (Front-Mu Point of Urinary Bladder) · 任脈與足三陰交會穴", location: "下腹部，前正中線上，臍中下4寸 (4 cun below umbilicus).", needling: "直刺 0.5 - 1.0 寸。⚠️ 孕婦深刺禁針。可灸。", actions: "清瀉下焦濕熱 (Drains damp-heat from Bladder)、利尿通淋 (Benefits Bladder)、調經固帶 (Benefits uterus).", indications: "尿頻尿急尿痛、膀胱炎 (Cystitis)、小便不利、尿閉、遺尿、赤白帶下、痛經、閉經、子宮肌瘤 (Fibroids)、奔豚氣 (Running Piglet)。", notes: "【課件考綱精華】① 膀胱募穴：專治下焦濕熱實證（尿路感染/膀胱炎/尿痛）。② 婦科實證痛經與肌瘤。" },
  { code: "REN4", nameZh: "關元 (Guanyuan)", nameEn: "Origin Pass", category: "小腸募穴 · 任脈與足三陰交會穴 · 全身大補元氣第一要穴", location: "下腹部，前正中線上，臍中下3寸 (3 cun below umbilicus).", needling: "直刺 0.8 - 1.2 寸。⚠️ 孕婦深刺禁針。可灸 (Moxibustion Applicable).", actions: "大補元氣 (Fortifies Original Qi)、溫補腎陽 (Tonifies Kidneys & Spleen)、培元固本、助孕育 (Benefits uterus & Assists conception)、回陽救逆.", indications: "少腹冷痛、遺精、陽痿、尿頻、尿閉、五更瀉 (Cock-crow diarrhea)、月經不調、痛經、崩漏、不孕症 (Infertility)、中風脫證 (Flaccid type apoplexy)、虛勞羸瘦。", notes: "【課件考綱精華】① 全身培元固本、大補元氣、補腎陽第一要穴。② 助孕治不孕症與五更瀉。" },
  { code: "REN5", nameZh: "石門 (Shimen)", nameEn: "Stone Gate", category: "三焦募穴 (Front-Mu Point of San Jiao)", location: "下腹部，前正中線上，臍中下2寸", needling: "直刺 0.5-1.0 寸。⚠️ 避開膀胱。可灸。", actions: "通調水道、理氣止痛", indications: "小便不利、水腫、腹脹腹痛、崩漏、帶下、疝氣", notes: "【課件考綱精華】三焦募穴：通調水道與水腫。" },
  { code: "REN6", nameZh: "氣海 (Qihai)", nameEn: "Sea of Qi", category: "肓之原 · 全身補氣第一要穴", location: "下腹部，前正中線上，臍中下1.5寸 (1.5 cun below umbilicus).", needling: "直刺 0.8 - 1.2 寸。⚠️ 孕婦深刺禁針。可灸。", actions: "大補元氣 (Tonifies Yuan Qi)、理氣沖任 (Regulates Qi)、固本止帶 (Benefits lower jiao).", indications: "腹脹、腹瀉、便秘、遺精、陽痿、月經不調、痛經、崩漏、脫肛、虛勞衰弱、氣虛哮喘。", notes: "【課件考綱精華】① 全身補氣第一要穴（氣海補氣，關元補陽）。② 治氣虛下陷脫肛與腸胃腹脹。" },
  { code: "REN7", nameZh: "陰交 (Yinjiao)", nameEn: "Yin Intersection", category: "任脈與衝脈交會穴", location: "下腹部，前正中線上，臍中下1寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "調經止帶、利水止痛", indications: "月經不調、崩漏、帶下、少腹痛、水腫、疝氣", notes: "【課件考綱精華】婦科月經與少腹痛。" },
  { code: "REN8", nameZh: "神闕 (Shenque)", nameEn: "Spirit Gateway", category: "肚臍穴 · 嚴禁針刺 (No Needle) · 艾灸急救要穴", location: "臍窩中央 (Center of umbilicus).", needling: "🚫 嚴禁針刺 (No Needle)! 隔鹽灸、隔薑灸或溫灸 (Moxibustion with Salt/Ginger Applicable).", actions: "溫陽救逆 (Restores collapse)、健脾和胃 (Fortifies Spleen)、理腸止瀉 (Warms & Benefits intestines).", indications: "中風脫證 (Flaccid type apoplexy)、腸鳴腹瀉、慢性腹瀉、水腫、腹痛、水谷不化、畏寒肢冷。", notes: "【課件考綱精華】① 嚴禁針刺！② 隔鹽灸大補脾胃溫陽救逆第一要穴。" },
  { code: "REN9", nameZh: "水分 (Shuifen)", nameEn: "Water Divide", category: "利水消腫第一要穴", location: "上腹部，前正中線上，臍中上1寸 (1 cun above umbilicus).", needling: "直刺 0.5-1.0 寸。可灸 (Moxa Applicable).", actions: "利水消腫 (Regulates water passages & Treats edema)、和胃健脾.", indications: "水腫 (Edema)、腹脹、腹瀉、腹水 (Ascites)、小便不利。", notes: "【課件考綱精華】全身利水消腫腹水第一特效穴。" },
  { code: "REN10", nameZh: "下脘 (Xiawan)", nameEn: "Lower Xiawan", category: "任脈與足太陰交會穴", location: "上腹部，前正中線上，臍中上2寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "健脾和胃、導滯消積", indications: "胃痛、腹脹、嘔吐、消化不良、腹瀉", notes: "【課件考綱精華】食積消化不良與胃痛。" },
  { code: "REN11", nameZh: "建里 (Jianli)", nameEn: "Interior Strengthening", category: "上腹部要穴", location: "上腹部，前正中線上，臍中上3寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "健脾和胃、消食化滯", indications: "胃痛、腹脹、嘔吐、食欲不振、水腫", notes: "【課件考綱精華】健脾和胃與食欲不振。" },
  { code: "REN12", nameZh: "中脘 (Zhongwan)", nameEn: "Middle Xiawan", category: "胃募穴 · 八會穴之「腑會」 · 手太陽少陽、足陽明與任脈交會穴 · 脾胃第一要穴", location: "上腹部，前正中線上，臍中上4寸 (4 cun above umbilicus, midway between sternum & umbilicus).", needling: "直刺 1.0 - 1.5 寸。可灸 (Moxibustion Applicable).", actions: "健脾和胃 (Harmonizes Stomach & Fortifies Spleen)、降逆化濕 (Lowers rebellion)、理氣止痛 (Alleviates pain)、六腑總調 (Hui Meeting of Fu).", indications: "胃痛 (Stomachache)、胃脹、嘔吐、打嗝反酸 (GERD/Acid regurgitation)、腹瀉、便秘、消化不良、失眠 (胃不和則臥不安)、精神鬱悶。", notes: "【課件考綱精華】① 胃之募穴與腑會（六腑總調）。② 脾胃胃痛噁心胃食道逆流第一要穴。" },
  { code: "REN13", nameZh: "上脘 (Shangwan)", nameEn: "Upper Xiawan", category: "任脈與手太陽、足陽明交會穴", location: "上腹部，前正中線上，臍中上5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "和胃降逆、化痰寧神", indications: "胃痛、嘔吐、打嗝、反酸、癲癇", notes: "【課件考綱精華】胃痛嘔吐與和胃降逆。" },
  { code: "REN14", nameZh: "巨闕 (Juque)", nameEn: "Great Gateway", category: "心募穴 (Front-Mu Point of Heart)", location: "上腹部，前正中線上，臍中上6寸 (6 cun above umbilicus).", needling: "直刺 0.5-0.8 寸。⚠️ 避開肝臟與心臟。可灸。", actions: "清心安神 (Clears Heart & Calms spirit)、和胃降逆 (Harmonizes Stomach & Lowers rebellion).", indications: "心痛、心悸、失眠、胸悶、嘔吐、打嗝、癲癇、狂躁。", notes: "【課件考綱精華】心之募穴：心痛心悸與失眠狂躁要穴。" },
  { code: "REN15", nameZh: "鳩尾 (Jiuwei)", nameEn: "Turtledove Tail", category: "任脈絡穴 · 癲癇要穴", location: "上腹部，前正中線上，胸劍結合部下0.5寸", needling: "向下斜刺 0.3-0.5 寸。⚠️ 嚴禁深刺。可灸。", actions: "寧心安神 (Calms spirit)、寬胸降逆", indications: "心痛、心悸、癲癇、狂躁、胸悶、嘔吐", notes: "【課件考綱精華】任脈絡穴：癲癇與狂躁安神要穴。" },
  { code: "REN16", nameZh: "中庭 (Zhongting)", nameEn: "Central Courtyard", category: "胸部局部穴", location: "胸部，前正中線上，平第5肋間隙 (胸劍結合部)", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、和胃降逆", indications: "胸脅脹痛、嘔吐、打嗝、噎膈", notes: "【課件考綱精華】胸痛與打嗝。" },
  { code: "REN17", nameZh: "膻中 (Danzhong)", nameEn: "Chest Center", category: "心包募穴 · 八會穴之「氣會」 · 寬胸理氣第一要穴", location: "胸部前正中線上，平第4肋間隙，兩乳頭連線中點 (In 4th intercostal space, midway between nipples).", needling: "平刺 0.3 - 0.5 寸。可灸 (Moxibustion Applicable).", actions: "寬胸理氣 (Unbinds chest & Regulates Qi)、宣肺平喘 (Benefits Lung & Calms asthma)、通乳 (Benefits breasts & Lactation).", indications: "胸悶、胸痛、心悸、咳嗽、氣喘 (Asthma)、乳腺炎 (Mastitis)、產後缺乳 (Insufficient lactation)、哮喘。", notes: "【課件考綱精華】① 八會穴之氣會、心包募穴：寬胸理氣、治胸悶氣喘第一要穴。② 產後缺乳與乳腺炎。" },
  { code: "REN18", nameZh: "玉堂 (Yutang)", nameEn: "Jade Hall", category: "胸部局部穴", location: "胸部，前正中線上，平第3肋間隙", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、止咳平喘", indications: "咳嗽、氣喘、胸痛、嘔吐", notes: "【課件考綱精華】咳嗽氣喘與胸痛。" },
  { code: "REN19", nameZh: "紫宮 (Zigong)", nameEn: "Purple Palace", category: "胸部局部穴", location: "胸部，前正中線上，平第2肋間隙", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、宣肺止咳", indications: "咳嗽、氣喘、胸脅脹痛", notes: "【課件考綱精華】咳嗽與胸痛。" },
  { code: "REN20", nameZh: "華蓋 (Huagai)", nameEn: "Magnificent Canopy", category: "胸部局部穴", location: "胸部，前正中線上，平第1肋間隙", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、宣肺平喘", indications: "咳嗽、氣喘、胸痛、咽喉腫痛", notes: "【課件考綱精華】咳嗽氣喘與咽痛。" },
  { code: "REN21", nameZh: "璇璣 (Xuanji)", nameEn: "Jade Pivot", category: "胸部局部穴", location: "胸部，前正中線上，胸骨柄中央 (平第1肋間隙上緣)", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、利咽止咳", indications: "咳嗽、氣喘、胸痛、喉痺咽痛", notes: "【課件考綱精華】咽痛與氣喘。" },
  { code: "REN22", nameZh: "天突 (Tiantu)", nameEn: "Heavenly Chimney", category: "陰維脈與任脈交會穴 · 哮喘與咽喉急痛第一要穴", location: "頸前正中，胸骨上窩中央 (Center of suprasternal fossa).", needling: "先直刺0.2寸，然後沿胸骨柄後緣向下斜刺 0.5 - 1.0 寸。⚠️ 嚴禁深刺直刺，避免刺傷主動脈弧/氣管。可灸。", actions: "宣肺平喘 (Benefits Lung & Calms asthma)、利咽開音 (Benefits throat & Voice)、降逆止嘔 (Lowers rebellious Qi).", indications: "哮喘 (Asthma)、暴咳、咽喉腫痛、梅核氣 (Plum Pit Qi)、失音暴瘖、打嗝嘔吐、甲狀腺腫大。", notes: "【課件考綱精華】① 哮喘、梅核氣與失音第一急救要穴。② 針刺方向必須沿胸骨柄後緣向下。" },
  { code: "REN23", nameZh: "廉泉 (Lianquan)", nameEn: "Corner Spring", category: "陰維脈與任脈交會穴 · 舌強失語要穴", location: "頸前部，喉結上方，舌骨體上緣凹陷中 (Above hyoid bone, in depression above thyroid cartilage).", needling: "向舌根方向斜刺 0.5 - 0.8 寸。可灸。", actions: "利舌開竅 (Benefits tongue & Voice)、清熱利咽 (Clears heat & Benefits throat).", indications: "中風舌強不語 (Aphasia/Speech impairment)、吞咽困難 (Dysphagia)、舌下腫痛、流涎 (Salivation)、暴瘖失音。", notes: "【課件考綱精華】中風舌強失語、吞咽困難與流涎第一要穴。" },
  { code: "REN24", nameZh: "承漿 (Chengjiang)", nameEn: "Container of Fluids", category: "任脈與手足陽明交會穴 · 任脈終點", location: "面部，頦唇溝正中凹陷處 (In depression of mentolabial groove).", needling: "斜刺 0.3 - 0.5 寸。可灸。", actions: "生津利齒 (Benefits teeth & Gums)、祛風止痛 (Eliminates wind & Alleviates pain)、通絡 (Activates channel).", indications: "口眼歪斜 (Bell's palsy)、齒齦腫痛、流涎、暴瘖、消渴口乾、面腫、流口水。", notes: "【課件考綱精華】任脈終點；面癱口眼歪斜、齒齦腫痛與流口水要穴。" }
];

updateChannel('Ren', {
  seam_anatomy_zh: `【體內循行路線】
起於小腹內胞宮，下出會陰，沿前正中向上，經陰毛、腹部、胸部、頸部，止於下唇頦唇溝（承漿）。`,
  qihua_zh: `【任脈氣化與陰脈之海】
任脈總任全身陰經氣血，稱為「陰脈之海」。主胞胎與生殖。`,
  pathomechanism_zh: `【主要病候】
疝氣，帶下，瘕聚，月經不調，不孕，小便不利，胸腹脹痛。`,
  preservation_zh: `【任脈日常保養與導引】
• 按揉 **REN12 中脘**（健脾和胃）。
• 按揉 **REN6 氣海**（大補元氣）。
• 艾灸 **REN4 關元**（培元固本補腎陽）。`,
  divergent_channel_zh: `【任脈經別】
與足少陰、足太陰經別並行。`,
  luo_channel_zh: `【任脈絡脈 —— 鳩尾 (REN15 Luo-Connecting Channel)】
起於胸骨劍突下鳩尾穴，散於腹部。實則腹皮痛，虛則腹皮瘙癢。`,
  muscle_channel_zh: `【任脈經筋】
沿腹部正中線上行，結於胸骨與頸部。`,
  dermatome_zh: `【任脈皮部】
分布於胸腹部正中線皮膚。`,
  channel_rhyme_zh: `【任脈循行歌與二十四穴分寸歌】
「任脈二十四穴行，會陰曲骨中極連，關元石門氣海存，陰交神闕水分在，
下脘建里中脘求，上脘巨闕鳩尾留，中庭膻中玉堂搜，紫宮華蓋璇璣籌，
天突廉泉承漿交，陰脈之海總任攬。」`,
  points_curriculum: renPoints
});

// -------------------------------------------------------------
// 3. Chong (衝脈)
// -------------------------------------------------------------
updateChannel('Chong', {
  seam_anatomy_zh: `起於胞宮，下出會陰，分支沿脊柱內上行；直行者經氣衝穴（ST30）與足少陰腎經並行，沿腹部旁開0.5寸（橫骨KI11至幽門KI21）上行至胸中，散於胸脅，上交唇口。
八脈交會穴：公孫（SP4，通衝脈）。`,
  qihua_zh: `【衝脈氣化與十二經脈之海 / 血海】
衝脈稱為「十二經脈之海」與「血海」。總領全身氣血衝要，調節十二經氣血，主生殖與月經。衝脈氣逆常見氣上撞心、腹痛嘔吐、奔豚氣。`,
  pathomechanism_zh: `【主要病候】
氣上撞心（奔豚氣），少腹痛，胸脅脹痛，月經不調，不孕，嘔吐，腹瀉。`,
  preservation_zh: `【衝脈日常保養】
按揉八脈交會穴 **SP4 公孫**（配合關 PC6）調理衝脈、和胃降逆止痛。`,
  points_curriculum: []
});

// -------------------------------------------------------------
// 4. Dai (帶脈)
// -------------------------------------------------------------
updateChannel('Dai', {
  seam_anatomy_zh: `起於季脇（章門LR13下），斜向下行至帶脈穴（GB26）、五樞（GB27）、維道（GB28），橫行繞腰腹一圈，狀如束帶。
八脈交會穴：足臨泣（GB41，通帶脈）。`,
  qihua_zh: `【帶脈氣化與約束諸經】
帶脈如腰帶般橫向約束全身縱向循行的經脈。主婦科帶下與腰腹鬆弛。帶脈不固常見赤白帶下、子宮脫垂、腰腹軟弱無力。`,
  pathomechanism_zh: `【主要病候】
赤白帶下，子宮脫垂，腰溶溶如坐水中，腰腹軟弱無力，疝氣。`,
  preservation_zh: `【帶脈日常保養】
按揉八脈交會穴 **GB41 足臨泣**（配外關 TE5）與 **GB26 帶脈穴** 固護帶脈。`,
  points_curriculum: []
});

// -------------------------------------------------------------
// 5. Yangqiao (陽蹻脈)
// -------------------------------------------------------------
updateChannel('Yangqiao', {
  seam_anatomy_zh: `起於足跟外側申脈穴（BL62），經外踝下，沿下肢外側、股外側、脇後，沿肩、頸、口角，至目內眥（睛明BL1），上額會於風池（GB20）。
八脈交會穴：申脈（BL62，通陽蹻脈）。`,
  qihua_zh: `【陽蹻脈氣化與主一身左右之陽】
陽蹻脈主一身左右之陽氣，主下肢運動與眼瞼開合（陽蹻盛則目張不眠）。`,
  pathomechanism_zh: `【主要病候】
失眠（陽不入陰），下肢外側肌肉痙攣強直而內側鬆弛，目痛，癲癇。`,
  preservation_zh: `【陽蹻脈日常保養】
按揉八脈交會穴 **BL62 申脈**（配後溪 SI3）鎮靜安神、治失眠與癲癇。`,
  points_curriculum: []
});

// -------------------------------------------------------------
// 6. Yinqiao (陰蹻脈)
// -------------------------------------------------------------
updateChannel('Yinqiao', {
  seam_anatomy_zh: `起於足舟骨後方照海穴（KI6），沿內踝後、下肢內側、前陰、胸腹，至缺盆，沿喉嚨出於面部，至目內眥（睛明BL1）。
八脈交會穴：照海（KI6，通陰蹻脈）。`,
  qihua_zh: `【陰蹻脈氣化與主一身左右之陰】
陰蹻脈主一身左右之陰氣，主下肢內側運動與眼瞼開合（陰蹻盛則目瞑嗜睡）。`,
  pathomechanism_zh: `【主要病候】
嗜睡（陰盛陽衰），下肢內側肌肉痙攣強直而外側鬆弛，咽喉腫痛，陰痛。`,
  preservation_zh: `【陰蹻脈日常保養】
按揉八脈交會穴 **KI6 照海**（配列缺 LU7）滋陰清熱、治失眠與咽乾。`,
  points_curriculum: []
});

// -------------------------------------------------------------
// 7. Yangwei (陽維脈)
// -------------------------------------------------------------
updateChannel('Yangwei', {
  seam_anatomy_zh: `起於足外踝下金門穴（BL63），沿下肢外側、肩部、項後，至額部（陽白GB14），會於督脈（風府DU16、大椎DU14）。
八脈交會穴：外關（TE5，通陽維脈）。`,
  qihua_zh: `【陽維脈氣化與維絡一身之陽】
陽維脈維絡一身之陽經。陽維脈病變主表，常見寒熱往來、惡寒發熱。`,
  pathomechanism_zh: `【主要病候】
寒熱往來，惡寒發熱，表證，肩背酸痛，偏頭痛。`,
  preservation_zh: `【陽維脈日常保養】
按揉八脈交會穴 **TE5 外關**（配足臨泣 GB41）祛風解表、治少陽寒熱與偏頭痛。`,
  points_curriculum: []
});

// -------------------------------------------------------------
// 8. Yinwei (陰維脈)
// -------------------------------------------------------------
updateChannel('Yinwei', {
  seam_anatomy_zh: `起於小腿內側築賓穴（KI9），沿下肢內側、腹部（衝門SP12、期門LR14），至胸部，上脅挾咽，會於任脈（天突REN22、廉泉REN23）。
八脈交會穴：內關（PC6，通陰維脈）。`,
  qihua_zh: `【陰維脈氣化與維絡一身之陰】
陰維脈維絡一身之陰經。陰維脈病變主裡，常見心痛、胸悶、鬱證、心煩。`,
  pathomechanism_zh: `【主要病候】
心痛，胸悶，抑鬱，心煩，胃痛，咽喉腫痛。`,
  preservation_zh: `【陰維脈日常保養】
按揉八脈交會穴 **PC6 內關**（配公孫 SP4）寬胸理氣、治心痛與胃痛。`,
  points_curriculum: []
});

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated ALL 8 Extraordinary Vessels in channels_and_charts.json!');

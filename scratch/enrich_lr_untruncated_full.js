/**
 * scratch/enrich_lr_untruncated_full.js
 * 100% full, un-truncated curriculum notes for Liver Channel of Foot Jueyin (LR1 to LR14)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const lrChannel = channels.find(c => c.code === 'LR');

if (!lrChannel) {
  console.error('LR channel not found!');
  process.exit(1);
}

lrChannel.seam_anatomy_zh = `【體內循行路線】
起於足大趾爪甲後（大敦），沿足背上行，經內踝前（中封），上小腿內側交出足太陰脾經之後（太衝、三陰交），上腘內廉（曲泉），沿大腿內側入陰毛中，環繞陰器，抵小腹，挾胃，屬肝，絡膽，上貫膈，布脅肋，沿喉嚨後面，向上進入鼻咽部，連目系，出額部，與督脈交會於頭頂（百會）。
目系支脈：從目系下行頰裏，環繞唇內。
肝部支脈：從肝分出，穿過膈肌，向上注入肺中（交手太陰肺經中府穴）。

【體表循行縫隙描述】
足部：起於足大趾外側爪甲角（大敦 LR1），經第1、2趾間（行間 LR2），沿第1、2跖骨底結合部前凹陷（太衝 LR3），至內踝前1寸脛骨前肌腱內側凹陷（中封 LR4）；
小腿與大腿部：沿脛骨內側中線（蠡溝 LR5、中都 LR6），至脛骨內側髁後下方（膝關 LR7），上至腘橫紋內側端（曲泉 LR8），沿大腿內側縫隙（陰包 LR9、足五里 LR10、陰廉 LR11、急脈 LR12）；
腹部：經腹股溝斜上，至第11肋骨游離端下方（章門 LR13），止於第6肋間隙乳頭直下（期門 LR14）。`;

lrChannel.qihua_zh = `【足厥陰經氣化與將軍之官】
足厥陰肝經內屬於肝，外行於大敦至期門。《素問·靈蘭秘典論》曰：「肝者，將軍之官，謀慮出焉。」肝主疏泄、主藏血、主筋，開竅於目。厥陰為三陰之「闔」（陰盡陽生與極致交接）。肝氣化失常見頭痛目眩、急躁易怒、脅肋脹痛、疝氣、月經不調、胸悶太息。`;

lrChannel.pathomechanism_zh = `【主要病候】
腰痛不能俯仰，胸脅脹痛，少腹痛，疝氣，婦科少腹腫，咽乾，面塵脫色，頭痛，嘔逆，小便不利或失禁。

【《靈樞·經脈》是動病與所生病原文】
是動病：腰痛不可以俯仰，丈夫㿉疝，婦人少腹腫，甚則嗌乾，面塵脫色，是為肝厥。
所生病：主肝所生病者，胸滿，嘔逆，飧泄，狐疝，遺溺，閉癃。

【常見經絡異常按診切診 3 段判讀】
1. 太衝至中封足背段：太衝壓痛強烈或無力塌陷，提示肝氣郁結、肝火上炎（高血壓/頭痛）或肝血不足。
2. 蠡溝至中都小腿段：蠡溝壓痛、細沙粒結節，提示肝膽濕熱、陰癢、睾丸痛或下肢麻痺。
3. 章門至期門胸脅段：期門、章門壓痛強直，提示肝脾不調、膽囊炎、脅肋脹痛、奔豚氣或乳腺炎。`;

lrChannel.preservation_zh = `【肝經日常保養與導引】
• 丑時 (01:00 - 03:00) 養生：丑時肝經當令。肝藏血，人臥則血歸於肝。丑時必須熟睡，戒熬夜、酗酒、大怒。
• 導引按揉保養穴位：
  1. 按揉 **LR3 太衝**（疏肝理氣、降肝火高血壓第一要穴，配合谷 LI4 開四關）。
  2. 按揉 **LR2 行間**（清瀉肝火實火要穴）。
  3. 按揉 **LR5 蠡溝**（清下焦濕熱、治陰癢要穴）。
  4. 按揉 **LR14 期門**（肝募穴，疏肝理氣解鬱第一要穴）。`;

lrChannel.channel_rhyme_zh = `【足厥陰肝經循行歌與十四穴分寸歌】
「足厥陰穴十四分，大敦行間太衝循，中封蠡溝中都近，膝關曲泉陰包殷，
五里陰廉急脈穴，章門期門十四全，厥陰巡行入陰器，走向胸脅百會連。」`;

lrChannel.points_curriculum = [
  {
    code: "LR1",
    nameZh: "大敦 (Dadun)",
    nameEn: "Large Pile",
    category: "五輸穴之井穴 (Jing-Well - 木穴/本穴 Wood Point) · 疝氣與崩漏第一要穴",
    location: "足大趾末節外側，趾甲角旁0.1寸 (Lateral side of terminal phalanx of great toe, 0.1 cun from corner of nail).",
    needling: "淺刺 0.1-0.2 寸，或三稜針點刺出血。可灸 (Moxa Applicable).",
    actions: "理下焦疝氣 (Treats shan disorder & Regulates Qi in lower jiao)、調生殖 (Benefits genitals & Adjusts urination)、固經止崩 (Stops menstrual bleeding)、醒神開竅 (Revives consciousness & Calms spirit).",
    indications: "疝氣 (Shan disorder/swollen genitals)、陰囊腫痛、遺尿、小便不利、五淋尿痛 (Lin disorders)、崩漏 (Uterine/Menstrual bleeding)、月經過多、癲癇、昏迷厥逆、情志抑鬱鬱悶。",
    notes: "【課件考綱精華】① 井穴：治疝氣（陰囊腫痛）與婦科崩漏大出血第一要穴。② 醒神開竅與疏理下焦生殖。"
  },
  {
    code: "LR2",
    nameZh: "行間 (Xingjian)",
    nameEn: "Moving Between",
    category: "五輸穴之滎穴 (Ying-Spring - 火穴/瀉穴 Fire Point)",
    location: "足背，第1、2趾間，趾蹼緣後方赤白肉際 (Dorsum of foot, between 1st & 2nd toes, proximal to web margin).",
    needling: "斜刺 0.3-0.5 寸。可灸 (Moxibustion Applicable).",
    actions: "清瀉肝火 (Clears Liver fire)、疏肝理氣 (Spreads Liver Qi)、息風止痙 (Pacifies Liver wind)、清熱止血 (Clears heat & Stops bleeding).",
    indications: "頭痛、頭暈目眩、目赤腫痛、急躁易怒 (Extreme irritability, red face/eyes)、脅肋脹痛、口苦、小便澀痛、尿閉、月經不調、痛經、崩漏、癲癇、小兒驚風失眠。",
    notes: "【課件考綱精華】滎穴瀉穴：專清肝火實火（急躁易怒、高血壓、目赤腫痛、頭痛）。"
  },
  {
    code: "LR3",
    nameZh: "太衝 (Taichong)",
    nameEn: "Great Surge",
    category: "原穴 (Yuan-Source) · 輸穴 (Shu-Stream - 土穴 Earth Point) · 四關穴之一 · 全身疏肝理氣第一要穴",
    location: "足背，第1、2跖骨間，跖骨底結合部前方凹陷中 (Dorsum of foot, in depression distal to junction of 1st & 2nd metatarsal bases).",
    needling: "直刺 0.3-0.5 寸。可灸 (Moxibustion Applicable).",
    actions: "疏肝理氣 (Spreads Liver Qi)、平肝熄風 (Subdues Liver Yang & Extinguishes wind)、滋養肝陰肝血 (Nourishes LV blood & Yin)、清利頭目 (Clears head & eyes)、調經利下焦 (Regulates menses & Lower jiao).",
    indications: "頭痛、眩暈、高血壓、急躁易怒、抑鬱症 (Depression)、胸脅脹痛、咽喉異物感、月經不調、痛經、閉經、經前乳房脹痛 (PMS breast tenderness)、陽痿、遺精、疝氣、嘔吐、腹瀉、手足厥冷（真熱假寒/手腳冰冷）、失眠焦慮。開四關：配合谷 LI4 (Four Gates Treatment) 強效調暢全身氣血。",
    notes: "【課件考綱精華】① 原穴：全身疏肝理氣解鬱第一要穴。② 四關穴（配合谷 LI4）：開四關、調和氣血鎮痛。③ 降高血壓與治偏頭痛。"
  },
  {
    code: "LR4",
    nameZh: "中封 (Zhongfeng)",
    nameEn: "Mound Center",
    category: "五輸穴之經穴 (Jing-River - 金穴 Metal Point)",
    location: "足背內側，內踝前1寸，脛骨前肌腱內側凹陷中 (Anterior to medial malleolus, 1 cun anterior to medial malleolus, medial side of tibialis anterior tendon).",
    needling: "直刺 0.3-0.5 寸。可灸 (Moxibustion Applicable).",
    actions: "疏肝理氣 (Spreads Liver Qi)、清利下焦濕熱 (Clears stagnant heat from lower jiao).",
    indications: "疝氣 (Hernia)、前陰疼痛、遺精、小便不利 (Retention of urine)、黃疸 (Jaundice / Hepatitis)、胸脅脹痛、足踝痛 (Medial ankle pain).",
    notes: "【課件考綱精華】經穴：清瀉肝膽濕熱（黃疸/肝炎/五淋）與足踝痛。"
  },
  {
    code: "LR5",
    nameZh: "蠡溝 (Ligou)",
    nameEn: "Woodworm Canal",
    category: "絡穴 (Luo-Connecting Point to GB Channel) · 陰癢生殖要穴",
    location: "小腿內側，內踝尖上5寸，脛骨內側面中央 (5 cun above tip of medial malleolus, on midline of medial surface of tibia).",
    needling: "平刺 0.3-0.5 寸。可灸 (Moxibustion Applicable).",
    actions: "疏肝理氣 (Spreads Liver)、理下焦生殖 (Benefits the genitals)、清熱利濕 (Clears dampness & Heat from lower jiao)、調經 (Regulates menses)、梅核氣 (Treats plumstone Qi).",
    indications: "陰癢 (Pruritus vulvae)、赤白帶下 (Leucorrhea)、睾丸腫痛 (Genital damp-heat infections)、疝氣、月經不調、小便不利、下肢麻木痿痺、梅核氣。",
    notes: "【課件考綱精華】絡穴：陰癢、睾丸痛與生殖器濕熱感染第一要穴。"
  },
  {
    code: "LR6",
    nameZh: "中都 (Zhongdu)",
    nameEn: "Central Metropolis",
    category: "郄穴 (Xi-Cleft Point of Liver Channel) · 急性肝炎與崩漏要穴",
    location: "小腿內側，內踝尖上7寸，脛骨內側面中央 (7 cun above tip of medial malleolus, on midline of medial surface of tibia).",
    needling: "平刺 0.5-0.8 寸。可灸 (Moxibustion Applicable).",
    actions: "疏肝理氣 (Spreads Liver Qi)、理下焦 (Regulates lower jiao)、調血止血 (Regulates blood)、祛濕 (Drains damp).",
    indications: "急性肝炎 (Acute hepatitis)、崩漏 (Uterine bleeding)、惡露不盡 (Prolonged lochia)、腹痛、腹瀉、疝氣、膝關節痛。",
    notes: "【課件考綱精華】郄穴：急性肝炎與婦科崩漏惡露不盡急痛要穴。"
  },
  {
    code: "LR7",
    nameZh: "膝關 (Xiguan)",
    nameEn: "Knee Joint",
    category: "膝關節局部要穴",
    location: "小腿內側，脛骨內側髁後下方，陰陵泉(SP9)後1寸 (Posterior & inferior to medial condyle of tibia, 1 cun posterior to SP9).",
    needling: "直刺 0.5-1.0 寸。可灸。",
    actions: "祛風除濕 (Dispels wind-damp)、通利膝關節 (Benefits the knee & Relaxes sinews).",
    indications: "膝關節腫痛、屈伸不利、小腿內側痛。",
    notes: "【課件考綱精華】膝關節內側風濕痛要穴。"
  },
  {
    code: "LR8",
    nameZh: "曲泉 (Ququan)",
    nameEn: "Spring at the Bend",
    category: "五輸穴之合穴 (He-Sea - 水穴/母穴 Water/Mother Point) · 滋陰養血第一要穴",
    location: "膝內側，屈膝時腘橫紋內側端，半腱肌肌腱前緣凹陷中 (Medial end of transverse popliteal crease, anterior to semimembranosus & semitendinosus insertions).",
    needling: "直刺 0.5-0.8 寸。可灸 (Moxibustion Applicable).",
    actions: "滋陰養肝血 (Nourishes Liver Blood & Yin)、清瀉下焦濕熱 (Clears damp-heat from lower jiao)、理下焦生殖 (Benefits genitals & Uterus).",
    indications: "陰癢、陰痛、膝關節痛、小便不利、尿痛、膀胱炎、前列腺炎、卵巢囊腫 (Prostatitis / Cystitis / Ovarian cysts)、遺精、陽痿、痛經、月經不調、子宮脫垂、腰骶痛。",
    notes: "【課件考綱精華】① 合穴母穴（水生木）：滋養肝陰肝血第一要穴。② 清下焦濕熱（膀胱炎/前列腺炎/卵巢囊腫）。"
  },
  {
    code: "LR9",
    nameZh: "陰包 (Yinbao)",
    nameEn: "Yin Bladder",
    category: "大腿內側要穴",
    location: "大腿內側，股骨內上髁上4寸，股內側肌與縫匠肌之間 (4 cun above medial epicondyle of femur, between vastus medialis & sartorius).",
    needling: "直刺 0.5-0.7 寸。可灸。",
    actions: "調經止帶 (Adjusts menstruation)、利下焦 (Regulates lower jiao).",
    indications: "月經不調、小便不利、遺尿、少腹痛、腰股痛。",
    notes: "【課件考綱精華】月經不調與小便不利。"
  },
  {
    code: "LR10",
    nameZh: "足五里 (Zuwuli)",
    nameEn: "Foot Five Li",
    category: "大腿內側要穴",
    location: "大腿內側，氣衝(ST30)直下3寸，長收肌外側緣 (3 cun directly below ST30, lateral border of adductor longus).",
    needling: "直刺 0.5-1.0 寸。可灸。",
    actions: "清熱利濕 (Clears damp-heat)、利下焦 (Benefits lower jiao).",
    indications: "少腹脹痛、小便不利、陰股痛、睾丸痛。",
    notes: "【課件考綱精華】少腹痛與陰股痛。"
  },
  {
    code: "LR11",
    nameZh: "陰廉 (Yinlian)",
    nameEn: "Yin Corner",
    category: "助孕與婦科要穴",
    location: "大腿內側，氣衝(ST30)直下2寸，長收肌外側緣 (2 cun directly below ST30, lateral border of adductor longus).",
    needling: "直刺 0.5-1.0 寸。可灸。",
    actions: "調經止帶 (Adjusts menstruation)、溫經散寒 (Eliminates cold from Liver channel).",
    indications: "不孕症 (Infertility - 艾灸要穴)、月經不調、赤白帶下、少腹痛、疝氣。",
    notes: "【課件考綱精華】艾灸陰廉穴治療女性不孕症（助孕要穴）。"
  },
  {
    code: "LR12",
    nameZh: "急脈 (Jimai)",
    nameEn: "Urgent Pulse",
    category: "股溝局部穴 · 禁針 (No Needle)",
    location: "恥骨結節外側，氣衝(ST30)外下方，股溝處可觸及股動脈搏動 (Lateral to pubic tubercle, in inguinal groove).",
    needling: "🚫 禁針 (No Needle - 避免刺傷股動脈/Avoid Femoral Artery)。可灸。",
    actions: "暖肝散寒 (Eliminates cold from Liver channel)、理下焦 (Benefits lower jiao).",
    indications: "疝氣 (Hernia)、陰部痛、少腹痛。",
    notes: "【課件考綱精華】禁針（避免刺傷股動脈）；疝氣要穴。"
  },
  {
    code: "LR13",
    nameZh: "章門 (Zhangmen)",
    nameEn: "Camphorwood Gate",
    category: "脾經募穴 (Front-Mu Point of Spleen) · 八會穴之「臟會」 (Master Point of Zang Organs) · 足厥陰與足少陽交會穴",
    location: "側腹部，第11肋骨遊離端下方 (Lateral side of abdomen, below free end of 11th rib).",
    needling: "直刺 0.5-0.8 寸。可灸 (Moxibustion Applicable).",
    actions: "調和肝脾 (Harmonizes Liver & Spleen)、健脾和胃 (Fortifies Spleen & Harmonizes middle jiao)、疏肝理氣 (Spreads Liver & Regulates Qi)、五臟總補 (Hui Meeting of Zang).",
    indications: "腹脹 (Abdominal distension)、腹瀉 (Diarrhea)、腸鳴 (Borborygmus)、嘔吐 (Vomiting)、消化不良 (Indigestion)、脅肋疼痛 (Hypochondriac pain)、肝脾不調症 (LV invading SP - 腹痛腹脹、完谷不化、便秘腹瀉交替)、奔豚氣 (Running Piglet Disorder)、五臟虛損。",
    notes: "【課件考綱精華】① 脾之募穴、八會穴之臟會（五臟總補）。② 調和肝脾（肝木乘脾土腹痛腹瀉）第一要穴。"
  },
  {
    code: "LR14",
    nameZh: "期門 (Qimen)",
    nameEn: "Cycle Gate",
    category: "肝經募穴 (Front-Mu Point of Liver) · 肝經終點 · 足厥陰、足太陰、陰維脈交會穴",
    location: "胸部，第6肋間隙，前正中線旁開4寸 (Directly below nipple, 6th intercostal space, 4 cun lateral to Ren Channel).",
    needling: "斜刺 0.3-0.5 寸。⚠️ 嚴禁深刺直刺。可灸 (Moxibustion Applicable).",
    actions: "疏肝理氣 (Spreads Liver & Regulates Qi)、活血化瘀 (Invigorates blood & Disperses masses)、調和肝胃 (Harmonizes Liver & Stomach)、宣肺平喘 (LV overacting on LU).",
    indications: "胸脅脹痛 (Hypochondriac pain)、肝炎 (Hepatitis)、膽結石 (Gallstones)、胃痛、打嗝反酸 (Acid regurgitation)、嘔吐、乳腺炎 (Mastitis)、抑鬱易怒 (Anger/Irritability)、奔豚氣 (Running Piglet Disorder)、肝火犯肺咳嗽氣喘 (Cough, SOB).",
    notes: "【課件考綱精華】① 肝之募穴與肝經終點：疏肝解鬱、治脅痛與肝膽病症第一要穴。② 肝木乘胃土與肝火犯肺。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Liver Channel (LR) with full 14 points untruncated!');

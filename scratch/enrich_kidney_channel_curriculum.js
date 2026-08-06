/**
 * scratch/enrich_kidney_channel_curriculum.js
 * 100% comprehensive enrichment for Kidney Channel (KI)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const kiChannel = channels.find(c => c.code === 'KI');

if (!kiChannel) {
  console.error('KI channel not found!');
  process.exit(1);
}

kiChannel.seam_anatomy_zh = `【體內循行路線】
從腰部穿過脊柱聯屬腎臟、聯絡膀胱；直行支脈從腎上穿肝、膈，入肺中，沿喉嚨挾舌本；胸部支脈從肺出絡心，注入胸中。

【體表循行縫隙描述】
足部：起於足小趾下，斜走足心（湧泉），出於舟骨粗隆下（然谷），循內踝後（太溪），別入足跟；
小腿與大腿部：沿小腿內側後緣（脛骨後緣縫隙），上行至腘窩內側（陰谷），沿大腿內側後緣上行至腹股溝；
腹部與胸部：腹部行於前正中線旁開0.5寸（橫骨 KI11 至幽門 KI21）；胸部行於前正中線旁開2寸（步廊 KI22 至俞府 KI27）。`;

kiChannel.qihua_zh = `【足少陰經氣化與作強之官】
《素問·靈蘭秘典論》曰：「腎者，作強之官，技巧出焉。」腎藏精，主生殖發展，為先天之本，主骨生髓充腦。

【腎主水與封藏之本】
腎主水液代謝，主納氣。腎氣化失常見水腫、遺精、陽痿、哮喘（腎不納氣）、耳鳴耳聾、腰膝酸軟。`;

kiChannel.pathomechanism_zh = `【主要病候】
婦科、前陰、腎臟、腸胃、呼吸系統、神經神經系統及本經脈所經過部位之病症。

【《靈樞·經脈》是動病與所生病原文】
是動病：飢不欲食，面如漆柴，咳唾則有血，喉鳴而喘，坐而欲起，目𠯟𠯟如無所見，心如懸若飢狀，氣不足則善恐，心惕惕如人將捕之，是為骨厥。
所生病：主腎所生病者，口熱，舌乾，咽腫，上氣，嗌乾及痛，煩心，心痛，黃疸，腸澼，脊股內後廉痛，痿厥，嗜臥，足下熱而痛。

【常見經絡異常按診切診 3 段判讀】
1. 湧泉至然谷段：湧泉處塌陷或極度痛敏感，提示腎氣大虛或肝陽上亢；然谷有硬結提示腎陰虛火旺。
2. 太溪至大鐘照海段：原穴太溪深按無力塌陷，提示腎精不足、腎氣虛衰（腰酸、耳鳴、遺精、水腫）。
3. 復溜段：復溜處壓痛發硬或腫脹，提示水液代謝失調（水腫、盜汗、自汗）。`;

kiChannel.pathomechanism_en = `【Kidney Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies: Lack of appetite, dark complexion, coughing blood, asthma/wheezing, restlessness, blurry vision, feeling of emptiness in heart, fearfulness/anxiety as if being pursued (骨厥).
• Suo Sheng Pathologies: Hot mouth, dry tongue, swollen throat, coughing, dry/sore throat, anxiety, cardiac pain, jaundice, diarrhea, spinal & posterior thigh pain, weakness/coldness of feet, drowsiness, burning feet.`;

kiChannel.preservation_zh = `【腎經日常保養與導引】
• 酉時 (17:00 - 19:00) 養生：酉時腎經當令，腎藏精，為先天之本。酉時宜補充水分、養腎固精，忌過勞或房事過度。
• 導引按揉保養穴位：
  1. 按揉 **KI1 湧泉**（降頂心急火、引火歸元、降血壓安神要穴）。
  2. 按揉 **KI3 太溪**（滋陰補腎第一要穴）。
  3. 按揉 **KI6 照海**（利咽通咽、治陰虛咽乾失眠）。
  4. 按揉 **KI7 復溜**（止汗汗多特效穴）。`;

kiChannel.preservation_en = `【Kidney Meridian Health Preservation & Self-Care】
• Clock Time Alignment (5:00 - 7:00 PM You Hour): Kidney meridian is most active. Conserve Kidney Essence and drink warm fluids. Avoid excessive stress or burnout.
• Self-Care Points: Press KI1 Yongquan (anchors Yang, lowers BP), KI3 Taixi (tonifies Kidney Yin/Yang), KI6 Zhaohai (throat & sleep), KI7 Fuliu (sweat regulation).`;

kiChannel.divergent_channel_zh = `【足少陰腎經經別 (Kidney Divergent Channel)】
• 循行路線：從腘窩別出，與足太陽經別並行，上至腎，別出於第十四椎（腰二），歸屬腎臟，向上貫帶脈，直行者系於舌本，復出於項，合於足太陽膀胱經。
• 臨床意義：加強腎與膀胱深層表裡連繫，貫帶脈並系舌本。`;

kiChannel.divergent_channel_en = `【Kidney Divergent Channel (Jing Bie)】
• Trajectory: Departs at popliteal fossa, ascends to lumbar spine (L2), pertains to Kidney, connects to Dai Mai, ascends to root of tongue, and emerges at neck to join Bladder channel.
• Clinical Significance: Connects Kidney directly to tongue root, Dai Mai, and Bladder channel.`;

kiChannel.luo_channel_zh = `【足少陰絡脈 —— 大鐘 (KI4 Luo-Connecting Channel)】
• 循行與病變：在內踝後下方（大鐘穴）分出走向足太陽膀胱經；其支脈與本經並行上繞心包，下貫腰脊。氣逆則煩悶，實則閉癃（小便不通/大便秘結），虛則腰痛。取絡穴大鐘 (KI4) 治療。`;

kiChannel.luo_channel_en = `【Kidney Luo-Connecting Vessel (Dazhong KI4)】
• Trajectory: Departs from KI4, connects to Bladder channel; branch ascends to Pericardium and lumbar spine.
• Pathology: Rebellious Qi: Oppression in chest. Excess: Retention of urine/constipation (閉癃). Deficiency: Lumbar pain. Treated via KI4.`;

kiChannel.muscle_channel_zh = `【足少陰經筋 (Kidney Muscle Channel / Sinew Channel)】
• 循行路線：起於足小趾下，斜走足心，結於內踝下，結於足跟，上結於膝內輔骨之下，上沿股內側結於陰器（生殖器），沿脊柱內兩旁上行結於枕骨，與足太陽經筋會合。`;

kiChannel.muscle_channel_en = `【Kidney Muscle Channel (Jing Jin)】
• Trajectory: Originates under 5th toe, traverses sole (KI1), binds at inner ankle, heel, medial knee, genitals, and ascends internal spine to occiput.
• Pathology: Cramping on sole, plantar pain, medial ankle/knee pain, genital cramps, spinal stiffness.`;

kiChannel.dermatome_zh = `【少陰皮部 —— 「樞儒」(Shaoyin Dermatome)】
• 少陰皮部名「樞儒」（樞者樞紐，儒者柔順）。少陰為三陰之「樞」，主心腎相交、水火既濟。`;

kiChannel.channel_rhyme_zh = `【足少陰腎經循行歌與二十七穴分寸歌】
「足少陰穴二十七，湧泉然谷太溪溢，大鐘水泉照海連，復溜交信築賓全，
陰谷膝內輔骨後，橫骨大赫氣穴填，四滿中注肓俞上，商曲石關陰都邊，
通谷幽門步廊位，神封靈墟神藏連，彧中俞府二十七，足心走向胸前沿。」`;

const pts = [
  { code: "KI1", nameZh: "湧泉", nameEn: "Gushing Spring", category: "井穴 (木) · 降逆平肝與醒腦要穴", location: "足底前1/3與後2/3連線交點處", needling: "直刺 0.3-0.5 寸。可灸。", actions: "降逆平肝、滋陰熄風、開竅甦厥", indications: "頭痛、頭暈、目眩、失眠、高血壓、咽喉腫痛、昏迷、足心熱", notes: "【課件考綱精華】降頂心急火第一要穴；醒腦開竅。" },
  { code: "KI2", nameZh: "然谷", nameEn: "Blazing Valley", category: "滎穴 (火/本) · 清虛熱要穴", location: "足內側緣，舟骨粗隆下方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "清瀉虛熱、滋陰調腎", indications: "陰虛潮熱、盜汗、失眠、咽喉乾痛、月經不調、遺精、陽痿", notes: "【課件考綱精華】滎穴清降腎陰虛火旺特效。" },
  { code: "KI3", nameZh: "太溪", nameEn: "Great Ravine", category: "原穴 · 輸穴 (土) · 全身滋陰補腎第一要穴", location: "足內側，內踝尖與跟腱之間的凹陷中", needling: "直刺 0.5-0.8 寸。可灸。", actions: "大補腎氣血陰陽、清瀉虛熱、納氣平喘", indications: "腎虛腰痛、頭暈耳鳴、失眠、遺精陽痿、月經不調、哮喘、足跟痛", notes: "【課件考綱精華】滋陰補腎第一要穴；腎不納氣哮喘。" },
  { code: "KI4", nameZh: "大鐘", nameEn: "Large Goblet", category: "絡穴 (通膀胱經)", location: "足內側，內踝後下方，跟腱附著部內側前方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "補腎納氣、益志祛恐", indications: "腰痛、哮喘、小便不利、便秘、足跟痛、精神恐懼", notes: "【課件考綱精華】補腎納氣與治精神恐懼。" },
  { code: "KI5", nameZh: "水泉", nameEn: "Water Spring", category: "郄穴 · 婦科痛經要穴", location: "足內側，太溪直下1寸，跟骨結節內側凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "調理衝任、通經止痛", indications: "痛經、閉經、月經不調、子宮脫垂、小便不利", notes: "【課件考綱精華】急性痛經閉經第一要穴。" },
  { code: "KI6", nameZh: "照海", nameEn: "Shining Sea", category: "八脈交會穴 (通陰貎脈 - 配列缺 LU7)", location: "足內側，內踝尖正下方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "利咽通喉、滋陰清熱、寧心安神", indications: "慢性咽喉痛、失音、梅核氣、失眠、月經不調、便秘", notes: "【課件考綱精華】陰虛咽乾第一要穴；通陰貎脈治失眠。" },
  { code: "KI7", nameZh: "復溜", nameEn: "Recover Flow", category: "經穴 (金/母) · 汗液調節特效穴", location: "小腿內側，太溪直上2寸，跟腱前緣", needling: "直刺 0.5-0.8 寸。可灸。", actions: "利水消腫、調汗止汗、溫陽補腎", indications: "水腫、腹脹腹瀉、盜汗、自汗、無汗、腰脊強痛", notes: "【課件考綱精華】汗液調節第一特效穴（自汗/盜汗/無汗）。" },
  { code: "KI8", nameZh: "交信", nameEn: "Intersection Reach", category: "陰貎脈之郄穴", location: "小腿內側，太溪直上2寸，復溜前0.5寸", needling: "直刺 0.5-0.8 寸。可灸。", actions: "調理衝任、固經止崩", indications: "崩漏、月經不調、痛經、子宮脫垂、睪丸腫痛", notes: "【課件考綱精華】崩漏子宮大出血要穴。" },
  { code: "KI9", nameZh: "築賓", nameEn: "Guest House", category: "陰維脈之郄穴 · 解毒與神志要穴", location: "小腿內側，太溪直上5寸，腓腸肌肌腹下端", needling: "直刺 0.5-0.8 寸。可灸。", actions: "解毒排毒、清心安神", indications: "癲狂、精神錯亂、疝氣腹痛、下肢抽痛、胎毒排毒", notes: "【課件考綱精華】全身排毒特效穴；狂躁病。" },
  { code: "KI10", nameZh: "陰谷", nameEn: "Yin Valley", category: "合穴 (水/本)", location: "腘窩內側，屈膝時半腱肌與半膜肌肌腱之間", needling: "直刺 0.8-1.0 寸。可灸。", actions: "清瀉下焦濕熱、滋陰補腎", indications: "陽痿、疝氣、崩漏、小便不利、陰癢帶下、膝痛", notes: "【課件考綱精華】清瀉下焦濕熱與膝痛。" },
  { code: "KI11", nameZh: "橫骨", nameEn: "Pubic Bone", category: "衝脈交會穴", location: "下腹部，臍中下5寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "利下焦、通尿固精", indications: "少腹脹痛、小便不利、遺尿、遺精、陽痿", notes: "【課件考綱精華】前陰與尿頻少腹痛。" },
  { code: "KI12", nameZh: "大赫", nameEn: "Great Manifestation", category: "衝脈交會穴 · 助孕要穴", location: "下腹部，臍中下4寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "補腎固精、調理衝任", indications: "遺精、陽痿、陰挺、帶下、痛經、不孕症", notes: "【課件考綱精華】助孕與男科生殖要穴。" },
  { code: "KI13", nameZh: "氣穴", nameEn: "Qi Hole", category: "衝脈交會穴", location: "下腹部，臍中下3寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "調經止帶、通利小便", indications: "月經不調、帶下、小便不利、腹痛腹瀉", notes: "【課件考綱精華】婦科月經與帶下。" },
  { code: "KI14", nameZh: "四滿", nameEn: "Fourfold Fullness", category: "衝脈交會穴", location: "下腹部，臍中下2寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "行氣活血、水道通利", indications: "月經不調、痛經、腹痛腹脹、便秘、水腫", notes: "【課件考綱精華】腹脹腹痛與水腫。" },
  { code: "KI15", nameZh: "中注", nameEn: "Central Flow", category: "衝脈交會穴", location: "下腹部，臍中下1寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "健脾和胃、理氣止痛", indications: "月經不調、腹痛、便秘、腹瀉", notes: "【課件考綱精華】月經與腸胃腹痛。" },
  { code: "KI16", nameZh: "肓俞", nameEn: "Huang Shu", category: "衝脈交會穴", location: "腹部，臍中旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "理氣止痛、潤腸通便", indications: "腹痛、便秘、嘔吐、腹瀉、疝氣", notes: "【課件考綱精華】肚臍旁腹痛與便秘。" },
  { code: "KI17", nameZh: "商曲", nameEn: "Shang Bend", category: "衝脈交會穴", location: "上腹部，臍中上2寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "運化積滯、和胃止痛", indications: "腹痛、胃痛、便秘、食積腹脹", notes: "【課件考綱精華】腹痛積滯與胃痛。" },
  { code: "KI18", nameZh: "石關", nameEn: "Stone Pass", category: "衝脈交會穴", location: "上腹部，臍中上3寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "和胃降逆、通關散結", indications: "嘔吐、腹痛腹脹、便秘、產後腹痛、不孕", notes: "【課件考綱精華】便秘與嘔吐腹痛。" },
  { code: "KI19", nameZh: "陰都", nameEn: "Yin Metropolis", category: "衝脈交會穴", location: "上腹部，臍中上4寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "降逆和胃、寬胸理氣", indications: "腹脹腹痛、嘔吐、消化不良、哮喘", notes: "【課件考綱精華】腹脹與嘔吐。" },
  { code: "KI20", nameZh: "腹通谷", nameEn: "Open Valley", category: "衝脈交會穴", location: "上腹部，臍中上5寸，前正中線旁開0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "健脾和胃、寬胸降逆", indications: "腹脹腹痛、嘔吐、消化不良、心悸", notes: "【課件考綱精華】消化不良與胃痛。" },
  { code: "KI21", nameZh: "幽門", nameEn: "Dark Gate", category: "衝脈交會穴", location: "上腹部，臍中上6寸，前正中線旁開0.5寸", needling: "直刺 0.5-0.8 寸。避開肝臟。可灸。", actions: "疏肝和胃、降逆止嘔", indications: "腹痛腹脹、嘔吐、晨吐（孕吐）、胃痛", notes: "【課件考綱精華】孕吐晨吐與胃痛腹脹。" },
  { code: "KI22", nameZh: "步廊", nameEn: "Corridor Walk", category: "胸部要穴", location: "胸部，第5肋間隙，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、降逆平喘", indications: "咳嗽、氣喘、胸脅脹痛、嘔吐", notes: "【課件考綱精華】胸痛與咳嗽氣喘。" },
  { code: "KI23", nameZh: "神封", nameEn: "Spirit Seal", category: "胸部要穴", location: "胸部，第4肋間隙，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、宣肺止咳、通乳", indications: "咳嗽、氣喘、胸脅脹痛、乳腺炎", notes: "【課件考綱精華】咳嗽胸痛與乳腺炎。" },
  { code: "KI24", nameZh: "靈墟", nameEn: "Spirit Ruins", category: "胸部要穴", location: "胸部，第3肋間隙，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣、宣肺平喘", indications: "咳嗽、氣喘、胸脅脹痛、乳腺炎", notes: "【課件考綱精華】咳嗽氣喘與胸痛。" },
  { code: "KI25", nameZh: "神藏", nameEn: "Spirit Storehouse", category: "胸部要穴", location: "胸部，第2肋間隙，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "寬胸降氣、止咳平喘", indications: "咳嗽、氣喘、胸痛", notes: "【課件考綱精華】胸痛與氣喘。" },
  { code: "KI26", nameZh: "彧中", nameEn: "Lively Center", category: "胸部要穴", location: "胸部，第1肋間隙，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "宣肺化痰、寬胸理氣", indications: "咳嗽、氣喘、痰多、胸脅脹痛", notes: "【課件考綱精華】痰多咳嗽與胸痛。" },
  { code: "KI27", nameZh: "俞府", nameEn: "Shu Mansion", category: "腎經終點 · 腎不納氣急喘要穴", location: "胸部，鎖骨下緣凹陷中，前正中線旁開2寸", needling: "斜刺 0.3-0.5 寸。可灸。", actions: "納氣平喘、化痰止咳、和胃降逆", indications: "咳嗽、氣喘（腎不納氣急喘）、胸痛、嘔吐、腎虛疲勞衰竭", notes: "【課件考綱精華】腎經終點；腎不納氣急喘第一要穴。" }
];

kiChannel.points_curriculum = pts;

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Kidney Channel (KI) with full 27 points!');

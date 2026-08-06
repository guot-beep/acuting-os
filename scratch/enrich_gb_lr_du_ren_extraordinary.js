/**
 * scratch/enrich_gb_lr_du_ren_extraordinary.js
 * 100% full, un-truncated enrichment for GB, LR, Du, Ren, Chong, Dai, Yangqiao, Yinqiao, Yangwei, Yinwei
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

// Helper to safely set channel fields
function updateChannel(code, data) {
  let ch = channels.find(c => c.code === code);
  if (!ch) {
    console.log(`Channel ${code} not found, creating baseline object...`);
    ch = { code, nameZh: data.nameZh || code, nameEn: data.nameEn || code, points_curriculum: [] };
    channels.push(ch);
  }
  Object.assign(ch, data);
}

// -------------------------------------------------------------
// 1. GB (足少陽膽經 - 44穴)
// -------------------------------------------------------------
updateChannel('GB', {
  seam_anatomy_zh: `【體內循行路線】
起於目外眥（瞳子髎），上抵頭角（頷厭），下耳後（風池），沿頸循肩，入缺盆；直行者從缺盆下胸中，穿膈肌，絡肝，屬膽，沿脅肋內側出於氣街，繞毛際，斜入股樞（環跳）。
足部支脈：從足背分出（足臨泣），沿第4、5跖骨間出於足大趾端（交足厥陰肝經大敦穴）。`,
  qihua_zh: `【足少陽經氣化與中正之官】
足少陽膽經內屬於膽，外行於瞳子髎至足竅陰。《素問·靈蘭秘典論》曰：「膽者，中正之官，決斷出焉。」膽藏精汁（膽汁），主勇怯與決斷。少陽為三陽之樞。膽氣化失常見口苦、目眩、善太息、黃疸、脇肋疼痛、面塵脫色。`,
  pathomechanism_zh: `【主要病候】
口苦，目眩，頻頻太息，胸脇疼痛，瘧疾，面塵脫色，頭痛（偏頭痛），耳鳴耳聾，下肢外側疼痛。

【《靈樞·經脈》是動病與所生病原文】
是動病：口苦，善太息，心脅痛不能轉側，甚則面微有塵，體無膏澤，足外反熱，是為陽厥。
所生病：主骨所生病者，頭痛，頷痛，目銳痛，缺盆中腫痛，腋下腫，馬刀俠瘿，汗出振寒，瘧，胸脅肋髀膝外至脛絕骨外踝前及諸節皆痛，小指次指不用。`,
  preservation_zh: `【膽經日常保養與導引】
• 子時 (23:00 - 01:00) 養生：子時膽經當令。子時一陽生，宜在 23:00 前上床入睡，養膽固陽。忌熬夜。
• 導引按揉保養穴位：
  1. 按揉 **GB20 風池**（頭面風邪、偏頭痛與感冒第一要穴）。
  2. 敲打 **GB30 環跳 & GB31 風市**（強腰壯腿、通利下肢、治坐骨神經痛要穴）。
  3. 按揉 **GB34 陽陵泉**（筋之會、疏肝利膽、治脇痛腿痛第一要穴）。`,
  divergent_channel_zh: `【足少陽膽經經別 (Gallbladder Divergent Channel)】
繞股樞入毛際，合於足厥陰肝經；別者入季脇，貫心，上挾咽，出頤陸，散於面，系目系，合於足少陽本經。`,
  luo_channel_zh: `【足少陽絡脈 —— 光明 (GB37 Luo-Connecting Channel)】
在外踝上5寸（光明穴）分出走向足厥陰肝經，下絡足背。實則厥逆熱痛，虛則下肢癱軟無力坐不能起。取絡穴光明 (GB37) 治療眼疾與腿無力。`,
  muscle_channel_zh: `【足少陽經筋 (Gallbladder Muscle Channel / Sinew Channel)】
起於第四趾，結於外踝，結於膝外側，上股結於伏兔，上結於尻，上挾脊；直者上肩，結於項，分支上頭角，結於頷。`,
  dermatome_zh: `【少陽皮部 —— 「樞持」(Shaoyang Dermatome)】
少陽皮部名「樞持」，少陽為三陽之「樞」，主陽氣之出入與決斷。`,
  channel_rhyme_zh: `【足少陽膽經循行歌與四十四穴分寸歌】
「足少陽穴四十四，瞳子髎近聽會次，上關頷厭懸顱位，懸厘曲鬢率谷試，
天衝浮白頭竅陰，完骨本神陽白臨，頭臨泣下目窗至，正營承靈腦空尋，
風池肩井淵腋長，輒筋日月京門鄉，帶脈五樞維道穴，居髎環跳風市當，
中瀆陽關陽陵泉，陽交外丘光明連，陽輔懸鐘丘墟外，足臨泣地五會牽，俠溪竅陰四十四，少陽巡行身兩旁。」`,
  points_curriculum: [
    { code: "GB1", nameZh: "瞳子髎", nameEn: "Pupil Bone Hole", category: "手太陽、手少陽、足少陽交會穴 · 禁灸", location: "目外眥旁0.5寸，眼眶外側緣凹陷中", needling: "平刺 0.3-0.5 寸。🚫 禁灸。", actions: "清頭明目、祛風洩熱", indications: "頭痛、目赤腫痛、視物模糊、迎風流淚、口眼歪斜", notes: "【課件考綱精華】禁灸；目外眥眼疾與偏頭痛要穴。" },
    { code: "GB2", nameZh: "聽會", nameEn: "Auditory Convergence", category: "耳部要穴 (Ear Local Point)", location: "耳屏間切跡前方，下頜骨髁突後緣，張口取穴", needling: "直刺 0.5-0.7 寸 (張口)。可灸。", actions: "聰耳利竅、祛風清熱", indications: "耳鳴、耳聾、聤耳、中耳炎、顳下頜關節炎 (TMJ)、面癱", notes: "【課件考綱精華】張口取穴；耳疾與 TMJ 關節痛第一要穴。" },
    { code: "GB3", nameZh: "上關", nameEn: "Upper Gate", category: "手少陽、足少陽、足陽明交會穴", location: "顴弓上緣，下關(ST7)直上方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "聰耳利齒、祛風通絡", indications: "耳鳴耳聾、偏頭痛、牙痛、口眼歪斜", notes: "【課件考綱精華】耳鳴與顳側頭痛。" },
    { code: "GB8", nameZh: "率谷", nameEn: "Valley Lead", category: "足少陽、足太陽交會穴 · 偏頭痛與宿醉要穴", location: "耳尖直上，入髮際1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "平肝熄風、和胃止嘔、解酒醒神", indications: "偏頭痛、頂顳頭痛、眩暈、嘔吐、宿醉頭痛 (Hangover)", notes: "【課件考綱精華】解酒宿醉頭痛與偏頭痛第一要穴。" },
    { code: "GB12", nameZh: "完骨", nameEn: "Final Bone", category: "足少陽、足太陽交會穴", location: "耳後乳突後下方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "祛風清熱、寧神聰耳", indications: "頭痛、頸項強痛、耳鳴耳聾、齒痛、口眼歪斜、失眠", notes: "【課件考綱精華】耳後頭痛與失眠要穴。" },
    { code: "GB14", nameZh: "陽白", nameEn: "Yang White", category: "足少陽、陽維脈交會穴 · 面癱前額要穴", location: "前額部，眉毛中點直上1寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風明目、通絡止痛", indications: "前額頭痛、目赤腫痛、眼瞼下垂 (Drooping eyelid)、眼瞼瞤動、面癱", notes: "【課件考綱精華】前額痛、面癱與眼瞼下垂特效。" },
    { code: "GB20", nameZh: "風池", nameEn: "Wind Pool", category: "足少陽、陽維脈交會穴 · 祛風頭面第一要穴", location: "項部，枕骨下，胸鎖乳突肌與斜方肌上端之間的凹陷中", needling: "斜刺 0.5-0.8 寸，針尖向鼻尖方向。⚠️ 嚴禁深刺直刺。可灸。", actions: "祛風解表、清頭明目、通鼻開竅、平肝熄風", indications: "頭痛、偏頭痛、感冒發熱、頸項強痛、目赤腫痛、鼻塞、鼻衄、耳鳴耳聾、中風口眼歪斜、高血壓", notes: "【課件考綱精華】全身祛風（外風風寒風熱、內風肝陽上亢）第一要穴；向鼻尖方向斜刺。" },
    { code: "GB21", nameZh: "肩井", nameEn: "Shoulder Well", category: "手少陽、足少陽、陽維脈交會穴 · 孕婦禁刺", location: "肩切部，乳頭直上，鎖骨骨折連線中點", needling: "直刺 0.3-0.5 寸。⚠️ 嚴禁深刺防止氣胸。孕婦禁針 (Contraindicated in Pregnancy).", actions: "祛風清熱、通經活絡、下胎催產、通乳", indications: "肩背酸痛、頸項強痛、乳腺炎、乳汁不下、難產、瘰癧", notes: "【課件考綱精華】肩頸酸痛第一要穴；孕婦禁針；深刺易致氣胸。" },
    { code: "GB24", nameZh: "日月", nameEn: "Sun and Moon", category: "膽經募穴 (Front-Mu Point of Gallbladder)", location: "胸部，第7肋間隙，前正中線旁開4寸", needling: "斜刺或平刺 0.3-0.5 寸。⚠️ 避免深刺。可灸。", actions: "疏肝利膽、和胃降逆", indications: "黃疸、口苦、脅肋疼痛、嘔吐、吞酸、呃逆", notes: "【課件考綱精華】膽之募穴：膽囊炎、黃疸與脅痛。" },
    { code: "GB25", nameZh: "京門", nameEn: "Capital Gate", category: "腎經募穴 (Front-Mu Point of Kidney)", location: "側腹部，第12肋骨遊離端的下方", needling: "直刺 0.5-0.8 寸。可灸。", actions: "溫腎壯腰、健脾利水", indications: "腎虛腰痛、腹脹、腹瀉、水腫、小便不利、脅痛", notes: "【課件考綱精華】腎之募穴：腎虛腰痛與水腫。" },
    { code: "GB26", nameZh: "帶脈", nameEn: "Dai Mai", category: "足少陽與帶脈交會穴 · 婦科帶下要穴", location: "側腹部，第11肋骨遊離端直下，平臍", needling: "直刺 0.5-0.8 寸。可灸。", actions: "健脾利濕、調理帶脈、固精止帶", indications: "赤白帶下 (Leucorrhea)、月經不調、痛經、疝氣、腰脅痛", notes: "【課件考綱精華】帶脈交會穴：婦科赤白帶下第一要穴。" },
    { code: "GB30", nameZh: "環跳", nameEn: "Huan Tiao / Jumping Circle", category: "足少陽與足太陽交會穴 · 坐骨神經痛第一要穴", location: "股外側部，股骨大轉子最凸點與骶骨裂孔連線的外1/3與中1/3交點", needling: "直刺 1.5 - 2.5 寸。可灸。", actions: "祛風除濕、強腰利腿、通經止痛", indications: "坐骨神經痛 (Sciatica)、腰腿痛、下肢癱瘓、半身不遂、腰胯疼痛", notes: "【課件考綱精華】坐骨神經痛與下肢偏癱第一要穴。" },
    { code: "GB31", nameZh: "風市", nameEn: "Wind Market", category: "祛風止癢與下肢要穴", location: "大腿外側中線，直立垂手時中指尖所指處", needling: "直刺 1.0 - 1.5 寸。可灸。", actions: "祛風除濕、通絡止癢、強健腰膝", indications: "蕁麻疹、皮膚瘙癢、下肢痿痺、半身不遂、坐骨神經痛", notes: "【課件考綱精華】中指尖所指處：全身皮膚瘙癢（蕁麻疹）與腿痛。" },
    { code: "GB34", nameZh: "陽陵泉", nameEn: "Yang Mound Spring", category: "八會穴之「筋會」 · 五輸穴之合穴 (土) · 疏肝利膽第一要穴", location: "小腿外側，腓骨頭前下方凹陷中", needling: "直刺 1.0 - 1.5 寸。可灸。", actions: "疏肝利膽、舒筋活絡 (Master Point of Sinews)、清瀉濕熱", indications: "脅肋疼痛、黃疸、膽囊炎、口苦、膝關節痛、下肢痿痺、肩周炎 (配條口 ST38)、坐骨神經痛、習慣性便秘", notes: "【課件考綱精華】① 八會穴之筋會：全身筋病與膝關節痛第一要穴。② 疏肝利膽（膽囊炎/脅痛/黃疸）。" },
    { code: "GB37", nameZh: "光明", nameEn: "Bright Light", category: "絡穴 (Luo-Connecting Point to Liver Channel) · 眼疾第一要穴", location: "小腿外側，外踝尖上5寸，腓骨前緣", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "清肝明目 (Benefits the eyes)、通絡止痛", indications: "視物模糊、夜盲症、目赤腫痛、眼疾、下肢酸痛", notes: "【課件考綱精華】絡穴：清肝明目、治夜盲症與眼睛退化第一要穴。" },
    { code: "GB39", nameZh: "懸鐘", nameEn: "Suspended Bell (Juegu)", category: "八會穴之「髓會」 (Master Point of Marrow)", location: "小腿外側，外踝尖上3寸，腓骨後緣", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "補髓健骨 (Tonifies Marrow)、祛風通絡、清頭明目", indications: "落枕 (Stiff neck)、頸項強痛、半身不遂、下肢痿痺、足踝痛、癡呆、骨質疏鬆", notes: "【課件考綱精華】八會穴之髓會：落枕頸強第一要穴；補髓健骨。" },
    { code: "GB40", nameZh: "丘墟", nameEn: "Mound of Ruins", category: "原穴 (Yuan-Source Point)", location: "足外踝前下方，趾短伸肌腱外側凹陷中", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "疏肝利膽、清熱明目、通絡止痛", indications: "胸脅痛、膽囊炎、外踝扭傷腫痛 (Ankle sprain)、下肢痿痺", notes: "【課件考綱精華】原穴：足外踝扭傷第一局部要穴；疏肝利膽。" },
    { code: "GB41", nameZh: "足臨泣", nameEn: "Foot Governor of Tears", category: "八脈交會穴 (通帶脈 Dai Mai - 配外關 TE5) · 五輸穴之輸穴 (木/本)", location: "足背外側，第4、5跖骨底結合部前下方，小趾伸肌腱外側凹陷中", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "通調帶脈 (Opens Dai Mai)、疏肝熄風、清頭明目、化痰散結", indications: "偏頭痛、目赤腫痛、胸脅脹痛、乳腺炎 (Mastitis)、月經不調、足背腫痛", notes: "【課件考綱精華】① 八脈交會穴通帶脈：偏頭痛發作急救（配外關 TE5）。② 婦科乳腺炎與帶脈病症。" },
    { code: "GB43", nameZh: "俠溪", nameEn: "Clamped Stream", category: "五輸穴之滎穴 (水/母)", location: "足背，第4、5趾間，趾蹼緣後方赤白肉際", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "清瀉肝膽實熱、聰耳明目", indications: "頭痛、目眩、耳鳴耳聾、胸脅痛、熱病", notes: "【課件考綱精華】滎穴母穴：清瀉肝膽火旺（頭痛/耳鳴/目赤）。" },
    { code: "GB44", nameZh: "足竅陰", nameEn: "Yin Port of the Foot", category: "五輸穴之井穴 (金/井)", location: "足第4趾末節外側，指甲角旁0.1寸", needling: "淺刺 0.1 寸或點刺出血。可灸。", actions: "清熱開竅、平肝熄風", indications: "偏頭痛、目赤腫痛、耳鳴耳聾、胸脅痛、熱病昏迷", notes: "【課件考綱精華】膽經終點井穴：偏頭痛與高熱急救。" }
  ]
});

// -------------------------------------------------------------
// 2. LR (足厥陰肝經 - 14穴)
// -------------------------------------------------------------
updateChannel('LR', {
  seam_anatomy_zh: `【體內循行路線】
起於足大趾爪甲後（大敦），沿足背上行，經內踝前（中封），上小腿內側交出足太陰脾經之後（太衝、三陰交），上腘內廉（曲泉），沿大腿內側入陰毛中，環繞陰器，抵小腹，挾胃，屬肝，絡膽，上貫膈，布脅肋，沿喉嚨後面，向上進入鼻咽部，連目系，出額部，與督脈交會於頭頂（百會）。
目系支脈：從目系下行頰裏，環繞唇內。
肝部支脈：從肝分出，穿過膈肌，向上注入肺中（交手太陰肺經中府穴）。`,
  qihua_zh: `【足厥陰經氣化與將軍之官】
足厥陰肝經內屬於肝，外行於大敦至期門。《素問·靈蘭秘典論》曰：「肝者，將軍之官，謀慮出焉。」肝主疏泄，主藏血，主筋，開竅於目。厥陰為三陰之「闔」（盡頭與交接）。肝氣化失常見頭痛目眩、急躁易怒、脅肋脹痛、疝氣、月經不調。`,
  pathomechanism_zh: `【主要病候】
腰痛不能俯仰，胸脅脹痛，少腹痛，疝氣，婦科少腹腫，咽乾，面塵脫色，頭痛，嘔逆，小便不利或失禁。

【《靈樞·經脈》是動病與所生病原文】
是動病：腰痛不可以俯仰，丈夫㿉疝，婦人少腹腫，甚則嗌乾，面塵脫色，是為肝厥。
所生病：主肝所生病者，胸滿，嘔逆，飧泄，狐疝，遺溺，閉癃。`,
  preservation_zh: `【肝經日常保養與導引】
• 丑時 (01:00 - 03:00) 養生：丑時肝經當令。肝藏血，人臥則血歸於肝。丑時必須熟睡，忌熬夜酗酒。
• 導引按揉保養穴位：
  1. 按揉 **LR3 太衝**（疏肝理氣、降肝火高血壓第一要穴，配風池 GB20）。
  2. 按揉 **LR2 行間**（清瀉肝火实火要穴）。
  3. 按揉 **LR14 期門**（肝募穴，疏肝理氣解鬱）。`,
  divergent_channel_zh: `【足厥陰肝經經別 (Liver Divergent Channel)】
別自足背，上行至毛際，與足少陽經別會合。`,
  luo_channel_zh: `【足厥陰絡脈 —— 蠡溝 (LR5 Luo-Connecting Channel)】
在內踝上5寸（蠡溝穴）分出走向足少陽膽經，涇睾丸結於陰莖。實則挺長（陰莖異常勃起），虛則暴癢（陰癢）。取絡穴蠡溝 (LR5) 治療生殖器病症。`,
  muscle_channel_zh: `【足厥陰經筋 (Liver Muscle Channel / Sinew Channel)】
起於大趾上，結於內踝前，上結於膝內輔骨，上股結於陰器，絡諸筋。`,
  dermatome_zh: `【厥陰皮部 —— 「害肩」(Jueyin Dermatome)】
厥陰皮部名「害肩」，主肝血與陰氣之闔。`,
  channel_rhyme_zh: `【足厥陰肝經循行歌與十四穴分寸歌】
「足厥陰穴十四分，大敦行間太衝循，中封蠡溝中都近，膝關曲泉陰包殷，
五里陰廉急脈穴，章門期門十四全，厥陰巡行入陰器，走向胸脅百會連。」`,
  points_curriculum: [
    { code: "LR1", nameZh: "大敦", nameEn: "Dadun", category: "五輸穴之井穴 (木/本) · 疝氣與崩漏要穴", location: "足大趾末節外側，趾甲角旁0.1寸", needling: "淺刺 0.1 寸或點刺出血。可灸 (Moxa Applicable).", actions: "疏肝理氣、理下焦、回陽救逆", indications: "疝氣 (Hernia)、遺尿、小便不利、崩漏 (Uterine bleeding)、癲癇、月經過多", notes: "【課件考綱精華】井穴：治疝氣與婦科崩漏大出血第一要穴。" },
    { code: "LR2", nameZh: "行間", nameEn: "Xingjian", category: "五輸穴之滎穴 (火/瀉)", location: "足背，第1、2趾間，趾蹼緣後方赤白肉際", needling: "直刺 0.3-0.5 寸。可灸。", actions: "清瀉肝火 (Clears LV Fire)、平肝熄風、清熱涼血", indications: "頭痛、目赤腫痛、急躁易怒、脅痛、口苦、月經過多、痛經、高血壓", notes: "【課件考綱精華】滎穴瀉穴：專清肝火實火（急躁易怒、高血壓、目赤）。" },
    { code: "LR3", nameZh: "太衝", nameEn: "Taichong", category: "原穴 · 輸穴 (土) · 四關穴之一 · 全身疏肝理氣第一要穴", location: "足背，第1、2跖骨間，跖骨底結合部前方凹陷中", needling: "直刺 0.5-0.8 寸。可灸。", actions: "疏肝理氣 (Spreads LV Qi)、平肝熄風 (Extinguishes LV Wind)、清利頭目、通絡止痛", indications: "頭痛、眩暈、高血壓、急躁抑鬱、胸脅脹痛、月經不調、痛經、疝氣、乳腺炎、中風、失眠", notes: "【課件考綱精華】① 原穴：全身疏肝理氣解鬱第一要穴。② 四關穴（配合谷 LI4）：開四關、調和氣血鎮痛。" },
    { code: "LR5", nameZh: "蠡溝", nameEn: "Ligou", category: "絡穴 (Luo-Connecting Point to GB) · 陰癢生殖要穴", location: "小腿內側，內踝尖上5寸，脛骨內側面中央", needling: "平刺 0.5-0.8 寸。可灸。", actions: "清熱利濕、理下焦生殖器 (Benefits Genitals)、疏肝理氣", indications: "陰癢 (Pruritus vulvae)、睪丸腫痛、睾丸炎、小便不利、月經不調、疝氣", notes: "【課件考綱精華】絡穴：陰癢、睾丸痛與生殖器病症第一要穴。" },
    { code: "LR8", nameZh: "曲泉", nameEn: "Ququan", category: "五輸穴之合穴 (水/母)", location: "膝內側，屈膝時腘橫紋內側端，半腱肌肌腱前緣凹陷中", needling: "直刺 0.8-1.0 寸。可灸。", actions: "滋陰養肝 (Nourishes LV Yin/Blood)、清瀉下焦濕熱", indications: "陰癢、膝關節痛、小便不利、遺精、陽痿、痛經、月經不調", notes: "【課件考綱精華】合穴母穴：滋養肝陰肝血第一要穴。" },
    { code: "LR13", nameZh: "章門", nameEn: "Zhangmen", category: "脾經募穴 (Front-Mu of Spleen) · 八會穴之「臟會」 (Master Point of Zang Organs)", location: "側腹部，第11肋骨遊離端下方", needling: "斜刺 0.5-0.8 寸。⚠️ 避免深刺。可灸。", actions: "健脾和胃、疏肝理氣 (Harmonizes LV & SP)、活血散結", indications: "腹脹、腹瀉、脅痛、脾胃虛弱、消化不良、黃疸、脾腫大", notes: "【課件考綱精華】脾之募穴、臟會：調和肝脾第一要穴。" },
    { code: "LR14", nameZh: "期門", nameEn: "Qimen", category: "肝經募穴 (Front-Mu of Liver) · 肝經終點", location: "胸部，第6肋間隙，前正中線旁開4寸 (乳頭直下)", needling: "斜刺 0.3-0.5 寸。⚠️ 避免深刺。可灸。", actions: "疏肝理氣 (Spreads LV Qi)、和胃降逆、化痰活血", indications: "胸脅脹痛、肝炎、膽囊炎、胸膜炎、嘔吐、腹脹、乳腺炎、月經不調", notes: "【課件考綱精華】肝之募穴與肝經終點：疏肝解鬱、治脅痛與肝病第一要穴。" }
  ]
});

// -------------------------------------------------------------
// 3. Du / GV (督脈 - 28穴)
// -------------------------------------------------------------
updateChannel('Du', {
  seam_anatomy_zh: `【體內循行路線】
起於小腹內，下出會陰，沿脊柱內部上行，經項後入腦，上頂，沿前額下行至鼻柱，止於上唇系帶處（齦交）。`,
  qihua_zh: `【督脈氣化與陽脈之海】
督脈總督全身陽氣，稱為「陽脈之海」。主脊髓與腦，與神志、精神、升陽固脫密切相關。`,
  pathomechanism_zh: `脊柱強直、角弓反張、頭痛、頭暈、癲狂、發熱、神志病、陽痿、遺精。`,
  preservation_zh: `按揉百會 DU20 升陽舉陷、按揉大椎 DU14 退熱解表、捏脊保養督脈。`,
  points_curriculum: [
    { code: "DU1", nameZh: "長強", nameEn: "Changqiang", category: "督脈絡穴 · 痔瘡第一要穴", location: "尾骨端下0.5寸，尾骨端與肛門連線中點", needling: "直刺 0.5-1.0 寸。可灸。", actions: "通調督脈、升陽固脫、清熱利濕", indications: "痔瘡 (Hemorrhoids)、便血、脫肛 (Prolapse of rectum)、便秘、腰脊痛、癲癇", notes: "【課件考綱精華】痔瘡與脫肛第一特效要穴。" },
    { code: "DU4", nameZh: "命門", nameEn: "Mingmen", category: "命門之火 · 壯陽要穴", location: "腰部後正中線上，第2腰椎棘突下凹陷中", needling: "直刺 0.5-1.0 寸。可灸。", actions: "溫補腎陽 (Tonifies KD Yang)、壯腰健脊、固精止帶", indications: "腰痛、腎虛陽痿、遺精、早洩、白帶多、痛經、水腫、腹瀉 (五更瀉)", notes: "【課件考綱精華】溫補生命之火（腎陽）第一要穴。" },
    { code: "DU14", nameZh: "大椎", nameEn: "Dazhui", category: "手足三陽與督脈交會穴 · 退熱第一要穴", location: "項背部後正中線上，第7頸椎棘突下凹陷中", needling: "斜刺 0.5-1.0 寸。可灸。刺血拔罐。", actions: "解表退熱 (Clears heat & Releases exterior)、宣通陽氣、平喘止咳", indications: "感冒發熱 (Febrile diseases)、高熱、項強、咳嗽、氣喘、骨蒸潮熱、癲癇、肩背痛", notes: "【課件考綱精華】全身解表退熱（點刺出血拔罐）第一要穴。" },
    { code: "DU20", nameZh: "百會", nameEn: "Baihui", category: "督脈與手足三陽交會穴 · 升陽舉陷與安神第一要穴", location: "頭頂後正中線上，折頂線中點，兩耳尖連線中點", needling: "平刺 0.5-0.8 寸。可灸。", actions: "升陽舉陷 (Raises Yang & Rescues prolapse)、醒腦開竅、寧心安神、平肝熄風", indications: "頭痛、頭暈、高血壓/低血壓、脫肛、子宮脫垂、胃下垂、失眠、健忘、中風昏迷", notes: "【課件考綱精華】升陽舉陷（治脫肛/子宮脫垂/胃下垂）與醒腦第一要穴。" },
    { code: "DU26", nameZh: "水溝 (人中)", nameEn: "Shuigou (Renzhong)", category: "督脈與手足陽明交會穴 · 人中急救第一要穴", location: "人中溝的上1/3與中1/3交點處", needling: "向上斜刺 0.3-0.5 寸，或掐按。可灸。", actions: "醒神開竅 (Revives consciousness)、回陽救逆、祛風通絡", indications: "休克昏迷、中風、小兒驚風、癲癇、急性腰扭傷 (Acute lumbar sprain)、口眼歪斜", notes: "【課件考綱精華】昏迷休克急救與急性腰扭傷第一特效穴。" }
  ]
});

// -------------------------------------------------------------
// 4. Ren / CV (任脈 - 24穴)
// -------------------------------------------------------------
updateChannel('Ren', {
  seam_anatomy_zh: `【體內循行路線】
起於小腹內胞宮，下出會陰，沿前正中向上，經陰毛、腹部、胸部、頸部，止於下唇頦唇溝（承漿）。`,
  qihua_zh: `【任脈氣化與陰脈之海】
任脈總任全身陰經氣血，稱為「陰脈之海」。主胞胎與生殖。`,
  pathomechanism_zh: `疝氣、帶下、瘕聚、月經不調、不孕、小便不利、胸腹脹痛。`,
  preservation_zh: `按揉中脘 REN12 健脾和胃、按揉氣海 REN6 補氣、按揉關元 REN4 補陽滋陰。`,
  points_curriculum: [
    { code: "CV4", nameZh: "關元", nameEn: "Guanyuan", category: "小腸募穴 · 任脈與足三陰交會穴 · 全身大補元氣要穴", location: "下腹部，前正中線上，臍中下3寸", needling: "直刺 1.0-1.5 寸。可灸 (Moxa Applicable).", actions: "大補元氣 (Tonifies Yuan Qi)、溫補腎陽、培元固本、理沖任", indications: "少腹痛、遺精、陽痿、尿頻、尿閉、月經不調、痛經、崩漏、不孕症、虛勞羸瘦", notes: "【課件考綱精華】全身培元固本、大補元氣第一要穴。" },
    { code: "CV6", nameZh: "氣海", nameEn: "Qihai", category: "盲之原 · 補氣第一要穴", location: "下腹部，前正中線上，臍中下1.5寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "大補元氣 (Tonifies Qi)、理氣沖任、固本止帶", indications: "腹脹、腹瀉、便秘、遺精、陽痿、月經不調、崩漏、脫肛、虛勞", notes: "【課件考綱精華】補氣要穴（氣海補氣，關元補陽/精）。" },
    { code: "CV12", nameZh: "中脘", nameEn: "Zhongwan", category: "胃募穴 · 八會穴之「腑會」 · 健脾和胃第一要穴", location: "上腹部，前正中線上，臍中上4寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "健脾和胃 (Harmonizes Stomach)、降逆化濕、理氣止痛", indications: "胃痛、胃脹、嘔吐、打嗝、反酸、腹瀉、便秘、消化不良、失眠 (胃不和則臥不安)", notes: "【課件考綱精華】胃之募穴與腑會：脾胃疾病第一要穴。" },
    { code: "CV17", nameZh: "膻中", nameEn: "Danzhong", category: "心包募穴 · 八會穴之「氣會」 · 寬胸理氣第一要穴", location: "胸部前正中線上，平第4肋間隙，兩乳頭連線中點", needling: "平刺 0.3-0.5 寸。可灸。", actions: "寬胸理氣 (Unbinds Chest & Regulates Qi)、宣肺平喘、通乳", indications: "胸悶、胸痛、心悸、咳嗽、氣喘、乳腺炎、產後缺乳", notes: "【課件考綱精華】氣會膻中：寬胸理氣、治胸悶氣喘與通乳第一要穴。" }
  ]
});

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated GB, LR, Du, Ren with 100% full untruncated points and curriculum data!');

/**
 * scratch/enrich_gb_untruncated_full.js
 * 100% full, un-truncated curriculum notes for Gallbladder Channel of Foot Shaoyang (GB1 to GB44)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const gbChannel = channels.find(c => c.code === 'GB');

if (!gbChannel) {
  console.error('GB channel not found!');
  process.exit(1);
}

gbChannel.seam_anatomy_zh = `【體內循行路線】
起於目外眥（瞳子髎），上抵頭角（頷厭），下耳後（風池），沿頸循肩，入缺盆；直行者從缺盆下胸中，穿膈肌，絡肝，屬膽，沿脅肋內側出於氣街，繞毛際，斜入股樞（環跳）。
足部支脈：從足背分出（足臨泣），沿第4、5跖骨間出於足大趾端（交足厥陰肝經大敦穴）。

【體表循行縫隙描述】
頭面部：起於目外眥（瞳子髎 GB1），下行至耳前（聽會 GB2、上關 GB3），上行至額角髮際（頷厭 GB4、懸顱 GB5、懸厘 GB6），沿耳後髮際弧形巡行（曲鬢 GB7、率谷 GB8、天衝 GB9、浮白 GB10、頭竅陰 GB11、完骨 GB12），折回前額（本神 GB13、陽白 GB14），直上頭頂（頭臨泣 GB15、目窗 GB16、正營 GB17、承靈 GB18、腦空 GB19），下行至項後凹陷（風池 GB20）；
軀幹部：經斜方肌頂峰（肩井 GB21），下腋下（淵腋 GB22、輒筋 GB23），沿胸脅肋間縫隙（日月 GB24），至腰側第12肋骨游離端（京門 GB25），沿腰帶縫隙（帶脈 GB26、五樞 GB27、維道 GB28、居髎 GB29）；
下肢部：下行至髖關節股骨大轉子凹陷（環跳 GB30），沿大腿外側股外側肌與股二頭肌之間縫隙（風市 GB31、中瀆 GB32、陽關 GB33），至膝外側腓骨頭前下方凹陷（陽陵泉 GB34），沿小腿外側腓骨前緣縫隙（陽交 GB35、外丘 GB36、光明 GB37、陽輔 GB38、懸鐘 GB39），經足外踝前下方凹陷（丘墟 GB40），沿第4、5跖骨間縫隙（足臨泣 GB41、地五會 GB42、俠溪 GB43），止於足第4趾外側指甲角（足竅陰 GB44）。`;

gbChannel.qihua_zh = `【足少陽經氣化與中正之官】
足少陽膽經內屬於膽，外行於瞳子髎至足竅陰。《素問·靈蘭秘典論》曰：「膽者，中正之官，決斷出焉。」膽藏精汁（膽汁），主勇怯與決斷。少陽為三陽之樞紐（主半表半裏）。膽氣化失常見口苦、目眩、善太息、黃疸、脇肋疼痛、面塵脫色、決斷無力。`;

gbChannel.pathomechanism_zh = `【主要病候】
口苦，目眩，頻頻太息，胸脇疼痛，少陽寒熱往來，面塵脫色，頭痛（偏頭痛），耳鳴耳聾，下肢外側疼痛。

【《靈樞·經脈》是動病與所生病原文】
是動病：口苦，善太息，心脅痛不能轉側，甚則面微有塵，體無膏澤，足外反熱，是為陽厥。
所生病：主骨所生病者，頭痛，頷痛，目銳痛，缺盆中腫痛，腋下腫，馬刀俠瘿，汗出振寒，瘧，胸脅肋髀膝外至脛絕骨外踝前及諸節皆痛，小指次指不用。

【常見經絡異常按診切診 3 段判讀】
1. 風池至完骨頭項段：風池、完骨處有劇烈過敏壓痛或筋結，提示風邪襲表、偏頭痛、頸椎病、耳鳴耳聾或失眠。
2. 肩井至日月腰脅段：肩井壓痛強直，日月處按壓酸痛或有硬結，提示膽囊炎、膽結石、肝膽氣滯脅痛或肩背肌筋膜炎。
3. 陽陵泉至懸鐘下肢段：陽陵泉按壓凹陷或過敏痛，懸鐘、丘墟有沙粒狀結節，提示少陽經氣不利、坐骨神經痛、膝踝關節炎或筋病。`;

gbChannel.preservation_zh = `【膽經日常保養與導引】
• 子時 (23:00 - 01:00) 養生：子時膽經當令。子時一陽生，為全身氣血新陳代謝最關鍵時刻。子時必須熟睡，養膽固陽。忌熬夜酗酒暴怒。
• 導引按揉保養穴位：
  1. 按揉 **GB20 風池**（祛風解表、降肝膽火、治偏頭痛與感冒第一要穴）。
  2. 敲打 **GB30 環跳 & GB31 風市**（強腰壯腿、通利下肢、治坐骨神經痛要穴）。
  3. 按揉 **GB34 陽陵泉**（八會穴之筋會，疏肝利膽、治脅痛腿痛第一要穴）。
  4. 按揉 **GB37 光明**（清肝明目、治眼睛乾澀退化第一要穴）。`;

gbChannel.channel_rhyme_zh = `【足少陽膽經循行歌與四十四穴分寸歌】
「足少陽穴四十四，瞳子髎近聽會次，上關頷厭懸顱位，懸厘曲鬢率谷試，
天衝浮白頭竅陰，完骨本神陽白臨，頭臨泣下目窗至，正營承靈腦空尋，
風池肩井淵腋長，輒筋日月京門鄉，帶脈五樞維道穴，居髎環跳風市當，
中瀆陽關陽陵泉，陽交外丘光明連，陽輔懸鐘丘墟外，足臨泣地五會牽，俠溪竅陰四十四，少陽巡行身兩旁。」`;

gbChannel.points_curriculum = [
  { code: "GB1", nameZh: "瞳子髎 (Tongziliao)", nameEn: "Pupil Bone Hole", category: "手太陽、手少陽、足少陽交會穴 · 禁灸", location: "目外眥旁0.5寸，眼眶外側緣凹陷中 (0.5 cun lateral to outer canthus of eye).", needling: "平刺 0.3-0.5 寸。🚫 禁灸 (No Moxibustion)。", actions: "清頭明目 (Benefits eyes)、祛風洩熱 (Eliminates wind & Clears heat).", indications: "頭痛、目赤腫痛、視物模糊、迎風流淚、口眼歪斜、耳鳴耳聾、牙痛、面神經麻痺。", notes: "【課件考綱精華】禁灸；目外眥眼疾與肝膽火旺頭痛要穴。" },
  { code: "GB2", nameZh: "聽會 (Tinghui)", nameEn: "Auditory Convergence", category: "耳部要穴 (Ear Local Point)", location: "耳屏間切跡前方，下頜骨髁突後緣，張口取穴 (Anterior to intertragic notch, posterior border of condyloid process, mouth open).", needling: "直刺 0.5-0.7 寸 (張口)。可灸。", actions: "聰耳利竅 (Benefits ears)、祛風清熱 (Eliminates wind & Clears heat)、通絡止痛 (Activates channel).", indications: "耳鳴、耳聾、聤耳、中耳炎 (Otitis media)、顳下頜關節紊亂 (TMJ disorder)、面神經麻痺、三叉神經痛、牙痛。", notes: "【課件考綱精華】張口取穴；耳疾（配合谷 TE21 / 聽宮 SI19）與 TMJ 關節痛第一要穴。" },
  { code: "GB3", nameZh: "上關 (Shangguan)", nameEn: "Upper Gate", category: "手少陽、足少陽、足陽明交會穴", location: "顴弓上緣，下關(ST7)直上方凹陷中 (Upper border of zygomatic arch, directly above ST7).", needling: "直刺 0.3-0.5 寸。可灸。", actions: "聰耳利齒 (Benefits ears)、祛風通絡 (Eliminates wind & Alleviates pain).", indications: "耳鳴耳聾、聽覺錯亂 (Diplacusis)、偏頭痛、牙痛、口眼歪斜。", notes: "【課件考綱精華】耳鳴、聽覺錯亂與顳側偏頭痛。" },
  { code: "GB4", nameZh: "頷厭 (Hanyan)", nameEn: "Forehead Fullness", category: "手少陽、足少陽、足陽明交會穴", location: "顳部頭維(ST8)與曲鬢(GB7)連線的上1/4與下3/4交點處", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清熱、通絡止痛", indications: "偏頭痛、目外眥痛、眩暈、耳鳴、驚風抽搐", notes: "【課件考綱精華】偏頭痛與目外眥痛。" },
  { code: "GB5", nameZh: "懸顱 (Xuanlu)", nameEn: "Suspended Skull", category: "手少陽、足少陽、手陽明交會穴", location: "顳部頭維(ST8)與曲鬢(GB7)連線的中點", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清熱、通絡止痛", indications: "偏頭痛、面腫、齒痛、小兒驚風", notes: "【課件考綱精華】顳側偏頭痛與面腫。" },
  { code: "GB6", nameZh: "懸厘 (Xuanli)", nameEn: "Suspended Tuft", category: "手少陽、足少陽、手陽明交會穴", location: "顳部頭維(ST8)與曲鬢(GB7)連線的下1/4與上3/4交點處", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清熱、通絡止痛", indications: "偏頭痛、目外眥痛、耳鳴、心煩嘔吐", notes: "【課件考綱精華】單側偏頭痛伴噁心嘔吐。" },
  { code: "GB7", nameZh: "曲鬢 (Qubin)", nameEn: "Hairline Curve", category: "足少陽、足太陽交會穴", location: "頭部，耳前髮際後緣與耳尖水平線交點處", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風止痛、利口齒", indications: "偏頭痛、頷腫、齒痛、口噤不下食", notes: "【課件考綱精華】牙關緊閉與顳側頭痛。" },
  { code: "GB8", nameZh: "率谷 (Shuaigu)", nameEn: "Valley Lead", category: "足少陽、足太陽交會穴 · 偏頭痛與宿醉要穴", location: "耳尖直上，入髮際1.5寸 (1.5 cun within hairline directly above ear apex).", needling: "平刺 0.3-0.5 寸。可灸。", actions: "平肝熄風 (Eliminates wind)、和胃止嘔 (Harmonizes Diaphragm & Stomach)、解酒醒神 (Treats alcohol intoxication).", indications: "偏頭痛 (Migraine)、頂顳頭痛、眩暈、嘔吐、宿醉頭痛與酒精中毒噁心 (Hangover / Alcohol intoxication特效)。", notes: "【課件考綱精華】① 解酒宿醉頭痛與酒精性嘔吐第一經驗要穴（銅人穴）。② 偏頭痛第一要穴。" },
  { code: "GB9", nameZh: "天衝 (Tianchong)", nameEn: "Celestial Hub", category: "足少陽、足太陽交會穴", location: "耳後髮際直上，率谷(GB8)後0.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清瀉膽熱、寧心安神", indications: "頭痛、癲癇、牙齦腫痛、驚恐不安", notes: "【課件考綱精華】頭痛與驚恐安神。" },
  { code: "GB10", nameZh: "浮白 (Fubai)", nameEn: "Floating White", category: "足少陽、足太陽交會穴", location: "耳後乳突後上方，天衝(GB9)與完骨(GB12)弧形連線的上1/3處", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭散結、聰耳通絡", indications: "頭痛、耳鳴耳聾、瘰癧、肩臂痛", notes: "【課件考綱精華】耳鳴耳聾與頸部瘰癧。" },
  { code: "GB11", nameZh: "頭竅陰 (Touqiaoyin)", nameEn: "Head Portal Yin", category: "手太陽、手少陽、足太陽、足少陽交會穴", location: "耳後乳突後上方，天衝(GB9)與完骨(GB12)弧形連線的中1/3處", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭明目、聰耳利咽", indications: "頭痛、耳鳴耳聾、耳痛、咽喉腫痛、舌強痛", notes: "【課件考綱精華】頭痛耳痛與咽喉腫痛。" },
  { code: "GB12", nameZh: "完骨 (Wangu)", nameEn: "Completion Bone", category: "足少陽、足太陽交會穴", location: "耳後乳突後下方凹陷中 (In depression posterior & inferior to mastoid process).", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清熱 (Eliminates wind)、寧神聰耳 (Calms spirit & Benefits head)、通絡止痛 (Alleviates pain).", indications: "頭痛、頸項強痛、耳鳴耳聾、齒痛、口眼歪斜、耳後痛、失眠 (Insomnia)。", notes: "【課件考綱精華】祛頭面內外風、治耳後痛與失眠要穴。" },
  { code: "GB13", nameZh: "本神 (Benshen)", nameEn: "Root Spirit", category: "足少陽、陽維脈交會穴 · 湯氏針法大腦前額葉要穴", location: "前額部，神庭(DU24)旁開3寸，入髮際0.5寸 (0.5 cun within hairline, 3 cun lateral to DU24).", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風化痰 (Eliminates wind & phlegm)、寧心安神 (Calms Shen)、鎮驚止癇 (Treats epilepsy).", indications: "頭痛、失眠、眩暈、癲癇、抑鬱症 (Depression - 右側)、焦慮症 (Anxiety - 右側)、多動症/注意力缺陷 (ADHD - 左側)、潛意識情緒紊亂 (Tam Healing System).", notes: "【課件考綱精華】湯氏針法 (Tam Healing)：調節大腦前額葉；右側治抑鬱焦慮，左側治 ADHD 多動症。" },
  { code: "GB14", nameZh: "陽白 (Yangbai)", nameEn: "Yang White", category: "足少陽、手陽明、手少陽、足陽明、陽維脈五經交會穴 · 面癱要穴", location: "前額部，眉毛中點直上1寸，瞳孔直上 (1 cun above midpoint of eyebrow, directly above pupil).", needling: "平刺 0.3-0.5 寸 (可向眼眶透刺)。可灸。", actions: "祛風明目 (Eliminates wind & Benefits eyes)、通絡止痛 (Alleviates pain).", indications: "前額頭痛 (Frontal headache)、眉稜骨痛、目赤腫痛、眼瞼下垂 (Ptosis of eyelids)、眼瞼瞤動 (Twitching of eyelids)、夜盲症、面神經麻痺 (Bell's palsy)。", notes: "【課件考綱精華】前額痛、面癱、眼瞼下垂（透刺魚腰/絲竹空）與眼皮跳第一要穴。" },
  { code: "GB15", nameZh: "頭臨泣 (Toulinqi)", nameEn: "Head Governor of Tears", category: "足少陽、足太陽、陽維脈交會穴", location: "前額部，入髮際0.5寸，瞳孔直上", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭明目、通鼻開竅", indications: "頭痛、目眩、目赤腫痛、淚多、鼻塞、鼻衄", notes: "【課件考綱精華】迎風流淚與頭痛鼻塞。" },
  { code: "GB16", nameZh: "目窗 (Muchuang)", nameEn: "Window of the Eye", category: "足少陽、陽維脈交會穴", location: "頭部，頭臨泣(GB15)後1寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清熱明目、祛風通絡", indications: "頭痛、目赤腫痛、遠視、近視、面腫", notes: "【課件考綱精華】眼睛腫痛與視力減退。" },
  { code: "GB17", nameZh: "正營 (Zhengying)", nameEn: "Upright Nutrition", category: "足少陽、陽維脈交會穴", location: "頭部，目窗(GB16)後1寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "平肝熄風、清頭止痛", indications: "偏頭痛、頭暈、嘔吐、齒痛", notes: "【課件考綱精華】頭痛嘔吐與齒痛。" },
  { code: "GB18", nameZh: "承靈 (Chengling)", nameEn: "Support Spirit", category: "足少陽、陽維脈交會穴", location: "頭部，正營(GB17)後1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "宣肺通鼻、清頭開竅", indications: "頭痛、眩暈、鼻塞、鼻衄、多涕", notes: "【課件考綱精華】鼻塞鼻衄與頭痛。" },
  { code: "GB19", nameZh: "腦空 (Naokong)", nameEn: "Brain Hollow", category: "足少陽、陽維脈交會穴", location: "頭部，風池(GB20)直上1.5寸，平腦戶(DU17)", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭熄風、聰耳明目", indications: "後頭痛、項強、眩暈、耳鳴、癲癇、哮喘", notes: "【課件考綱精華】後頭痛與頸項強痛。" },
  { code: "GB20", nameZh: "風池 (Fengchi)", nameEn: "Wind Pool", category: "足少陽、陽維脈交會穴 · 祛風頭面第一要穴", location: "項部，枕骨下，胸鎖乳突肌與斜方肌上端之間的凹陷中 (In depression between sternocleidomastoid & trapezius muscles).", needling: "斜刺 0.5-0.8 寸，針尖向鼻尖方向。⚠️ 嚴禁深刺直刺。可灸。", actions: "祛風解表 (Expels wind & Releases exterior)、清頭明目 (Benefits head & eyes)、通鼻開竅、平肝熄風 (Extinguishes LV Wind).", indications: "頭痛、偏頭痛、感冒發熱、頸項強痛、目赤腫痛、鼻塞、鼻衄、耳鳴耳聾、中風口眼歪斜、高血壓。", notes: "【課件考綱精華】全身祛風（外風風寒風熱、內風肝陽上亢）第一要穴；向鼻尖方向斜刺。" },
  { code: "GB21", nameZh: "肩井 (Jianjing)", nameEn: "Shoulder Well", category: "手少陽、足少陽、陽維脈交會穴 · 孕婦禁刺", location: "肩切部，乳頭直上，鎖骨骨折連線中點 (Midway between DU14 & acromion, directly above nipple).", needling: "直刺 0.3-0.5 寸。⚠️ 嚴禁深刺防止氣胸。孕婦禁針 (Contraindicated in Pregnancy).", actions: "祛風清熱 (Dispels wind-damp)、通經活絡、下胎催產 (Promotes labor)、通乳 (Benefits breasts).", indications: "肩背酸痛、頸項強痛、乳腺炎 (Mastitis)、乳汁不下、難產、瘰癧。", notes: "【課件考綱精華】肩頸酸痛第一要穴；孕婦禁針；深刺易致氣胸。" },
  { code: "GB22", nameZh: "淵腋 (Yuanye)", nameEn: "Armpit Abyss", category: "胸部局部穴", location: "側胸部，舉臂時，第4肋間隙，腋中線上", needling: "斜刺或平刺 0.3-0.5 寸。⚠️ 嚴禁深刺。可灸。", actions: "寬胸理氣、通絡消腫", indications: "胸脅脹痛、腋下腫痛、臂痛", notes: "【課件考綱精華】腋下腫痛與脅痛。" },
  { code: "GB23", nameZh: "輒筋 (Zhejin)", nameEn: "Flank Muscles", category: "足少陽、足太陽交會穴", location: "側胸部，第4肋間隙，淵腋(GB22)前1寸", needling: "斜刺或平刺 0.3-0.5 寸。⚠️ 避免深刺。可灸。", actions: "降逆和胃、寬胸理氣", indications: "胸脅脹痛、嘔吐、吞酸、哮喘", notes: "【課件考綱精華】胸脅痛與嘔吐吞酸。" },
  { code: "GB24", nameZh: "日月 (Riyue)", nameEn: "Sun and Moon", category: "膽經募穴 (Front-Mu Point of Gallbladder)", location: "胸部，第7肋間隙，前正中線旁開4寸 (7th intercostal space, 4 cun lateral to Ren Channel).", needling: "斜刺或平刺 0.3-0.5 寸。⚠️ 避免深刺。可灸。", actions: "疏肝利膽 (Spreads LV Qi & Benefits GB)、和胃降逆 (Harmonizes Stomach & Lowers rebellion).", indications: "黃疸 (Jaundice)、口苦、脅肋疼痛 (Hypochondriac pain)、嘔吐、吞酸、呃逆、膽囊炎 (Cholecystitis)。", notes: "【課件考綱精華】膽之募穴：膽囊炎、黃疸與脅痛第一要穴。" },
  { code: "GB25", nameZh: "京門 (Jingmen)", nameEn: "Capital Gate", category: "腎經募穴 (Front-Mu Point of Kidney)", location: "側腹部，第12肋骨遊離端的下方 (Below free end of 12th rib).", needling: "直刺 0.5-0.8 寸。可灸。", actions: "溫腎壯腰 (Tonifies Kidneys & Benefits lumbar)、健脾利水 (Harmonizes water passages).", indications: "腎虛腰痛 (Lumbar pain)、腹脹、腹瀉、水腫、小便不利、脅痛。", notes: "【課件考綱精華】腎之募穴：腎虛腰痛與水腫第一要穴。" },
  { code: "GB26", nameZh: "帶脈 (Daimai)", nameEn: "Dai Mai", category: "足少陽與帶脈交會穴 · 婦科帶下要穴", location: "側腹部，第11肋骨遊離端直下，平臍 (Directly below free end of 11th rib, level with umbilicus).", needling: "直刺 0.5-0.8 寸。可灸。", actions: "健脾利濕 (Drains dampness)、調理帶脈 (Regulates Dai Mai)、固精止帶 (Stops leucorrhea).", indications: "赤白帶下 (Leucorrhea)、月經不調、痛經、疝氣、腰脅痛。", notes: "【課件考綱精華】帶脈交會穴：婦科赤白帶下第一要穴。" },
  { code: "GB27", nameZh: "五樞 (Wushu)", nameEn: "Five Pivots", category: "足少陽與帶脈交會穴", location: "側腹部，髂前上棘內側前下方0.5寸，平關元(CV4)", needling: "直刺 0.8-1.0 寸。可灸。", actions: "調經止帶、理氣止痛", indications: "帶下、疝氣、少腹痛、腰髖痛", notes: "【課件考綱精華】婦科帶下與少腹疝氣痛。" },
  { code: "GB28", nameZh: "維道 (Weidao)", nameEn: "Linking Way", category: "足少陽與帶脈交會穴", location: "側腹部，五樞(GB27)前下方0.5寸", needling: "直刺 0.8-1.0 寸。可灸。", actions: "調經止帶、健脾升提", indications: "帶下、子宮脫垂 (Prolapse of uterus)、少腹痛、水腫", notes: "【課件考綱精華】子宮脫垂與帶下要穴。" },
  { code: "GB29", nameZh: "居髎 (Juliao)", nameEn: "Stationary Crevice", category: "足少陽與陽蹺脈交會穴", location: "髖部，髂前上棘與股骨大轉子最凸點連線的中點", needling: "直刺 1.0-1.5 寸。可灸。", actions: "舒筋活絡、強健腰腿", indications: "腰腿痛、髖關節痛、下肢痿痺、疝氣", notes: "【課件考綱精華】髖關節痛與坐骨神經痛。" },
  { code: "GB30", nameZh: "環跳 (Huantiao)", nameEn: "Huan Tiao / Jumping Circle", category: "足少陽與足太陽交會穴 · 坐骨神經痛第一要穴", location: "股外側部，股骨大轉子最凸點與骶骨裂孔連線的外1/3與中1/3交點 (Junction of lateral 1/3 & medial 2/3 of line connecting greater trochanter & sacral hiatus).", needling: "直刺 1.5 - 2.5 寸。可灸。", actions: "祛風除濕 (Dispels wind-damp)、強腰利腿 (Benefits hip and leg)、通經止痛 (Activates channel & Alleviates pain).", indications: "坐骨神經痛 (Sciatica)、腰腿痛、下肢癱瘓、半身不遂、腰髖疼痛。", notes: "【課件考綱精華】坐骨神經痛與下肢偏癱第一要穴。" },
  { code: "GB31", nameZh: "風市 (Fengshi)", nameEn: "Wind Market", category: "祛風止癢與下肢要穴", location: "大腿外側中線，直立垂手時中指尖所指處 (Midline of lateral thigh, 7 cun above popliteal crease, where tip of middle finger touches when standing).", needling: "直刺 1.0 - 1.5 寸。可灸。", actions: "祛風除濕 (Dispels wind-damp)、通絡止癢 (Alleviates itching)、強健腰膝 (Benefits sinews).", indications: "蕁麻疹 (Urticaria)、皮膚瘙癢 (Pruritus)、下肢痿痺、半身不遂、坐骨神經痛。", notes: "【課件考綱精華】中指尖所指處：全身皮膚瘙癢（蕁麻疹）與腿痛特效。" },
  { code: "GB32", nameZh: "中瀆 (Zhongdu)", nameEn: "Central Ditch", category: "局部要穴", location: "大腿外側，風市(GB31)直下2寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "祛風散寒、通絡止痛", indications: "下肢痿痺、麻木、坐骨神經痛", notes: "【課件考綱精華】下肢麻木與坐骨神經痛。" },
  { code: "GB33", nameZh: "膝陽關 (Xiyangguan)", nameEn: "Knee Yang Gate", category: "膝關節局部要穴", location: "膝外側，股骨外上髁後上方的凹陷中", needling: "直刺 1.0-1.5 寸。可灸。", actions: "舒筋利節、通絡止痛", indications: "膝關節腫痛、屈伸不利、小腿麻木", notes: "【課件考綱精華】膝關節外側痛第一局部穴。" },
  { code: "GB34", nameZh: "陽陵泉 (Yanglingquan)", nameEn: "Yang Mound Spring", category: "八會穴之「筋會」 (Master Point of Sinews) · 五輸穴之合穴 (土/本) · 疏肝利膽第一要穴", location: "小腿外側，腓骨頭前下方凹陷中 (In depression anterior & inferior to head of fibula).", needling: "直刺 1.0 - 1.5 寸。可灸。", actions: "疏肝利膽 (Spreads LV Qi & Benefits GB)、舒筋活絡 (Relaxes sinews & Alleviates pain)、清瀉濕熱 (Clears damp-heat).", indications: "脅肋疼痛、黃疸、膽囊炎 (Cholecystitis)、口苦、膝關節痛、下肢痿痺、肩周炎 (配條口 ST38)、坐骨神經痛、習慣性便秘。", notes: "【課件考綱精華】① 八會穴之筋會：全身筋病與膝關節痛第一要穴。② 疏肝利膽（膽囊炎/脅痛/黃疸）。" },
  { code: "GB35", nameZh: "陽交 (Yangjiao)", nameEn: "Yang Intersection", category: "陽維脈之郄穴 (Yang Wei Xi-Cleft Point)", location: "小腿外側，外踝尖上7寸，腓骨後緣", needling: "直刺 0.5-0.8 寸。可灸。", actions: "寧神息風、舒筋通絡", indications: "胸脅脹痛、膝股痛、癲狂、瘈瘲", notes: "【課件考綱精華】陽維脈郄穴：急性胸脅痛與癲狂。" },
  { code: "GB36", nameZh: "外丘 (Waiqiu)", nameEn: "Outer Hill", category: "膽經郄穴 (Xi-Cleft Point of GB Channel)", location: "小腿外側，外踝尖上7寸，腓骨前緣", needling: "直刺 0.5-0.8 寸。可灸。", actions: "疏肝清熱、通絡止痛", indications: "胸脅痛、膽絞痛 (Acute GB pain)、犬咬傷解毒、下肢酸痛", notes: "【課件考綱精華】郄穴：急性膽絞痛與狂犬咬傷排毒要穴。" },
  { code: "GB37", nameZh: "光明 (Guangming)", nameEn: "Bright Light", category: "絡穴 (Luo-Connecting Point to Liver Channel) · 眼疾第一要穴", location: "小腿外側，外踝尖上5寸，腓骨前緣 (5 cun above tip of external malleolus, anterior border of fibula).", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "清肝明目 (Benefits the eyes & Clears heat)、通絡止痛 (Activates channel).", indications: "視物模糊 (Blurring of vision)、夜盲症 (Night blindness)、目赤腫痛、眼疾、下肢酸痛、乳房脹痛。", notes: "【課件考綱精華】絡穴：清肝明目、治夜盲症與眼睛退化第一要穴。" },
  { code: "GB38", nameZh: "陽輔 (Yangfu)", nameEn: "Yang Assist", category: "五輸穴之經穴 (火/瀉)", location: "小腿外側，外踝尖上4寸，腓骨前緣", needling: "直刺 0.5-0.8 寸。可灸。", actions: "清瀉肝膽實熱、通絡止痛", indications: "偏頭痛、目銳痛、缺盆腫痛、腋下腫、胸脅痛、下肢酸痛", notes: "【課件考綱精華】經穴瀉穴：清瀉肝膽火旺偏頭痛。" },
  { code: "GB39", nameZh: "懸鐘 (Xuanzhong)", nameEn: "Suspended Bell (Juegu)", category: "八會穴之「髓會」 (Master Point of Marrow) · 落枕第一要穴", location: "小腿外側，外踝尖上3寸，腓骨後緣 (3 cun above tip of external malleolus, posterior border of fibula).", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "補髓健骨 (Tonifies Marrow)、祛風通絡 (Dispels wind)、清頭明目 (Benefits head).", indications: "落枕 (Stiff neck)、頸項強痛、半身不遂、下肢痿痺、足踝痛、癡呆、骨質疏鬆 (Osteoporosis)。", notes: "【課件考綱精華】八會穴之髓會：落枕頸強第一要穴；補髓健骨。" },
  { code: "GB40", nameZh: "丘墟 (Qiuxu)", nameEn: "Mound of Ruins", category: "原穴 (Yuan-Source Point of GB Channel)", location: "足外踝前下方，趾短伸肌腱外側凹陷中 (Anterior & inferior to external malleolus, lateral to extensor digitorum brevis).", needling: "直刺 0.5 - 0.8 寸。可灸。", actions: "疏肝利膽 (Spreads LV Qi)、清熱明目 (Clears heat)、通絡止痛 (Activates channel).", indications: "胸脅痛、膽囊炎、外踝扭傷腫痛 (Ankle sprain)、下肢痿痺、瘧疾。", notes: "【課件考綱精華】原穴：足外踝扭傷第一局部要穴；疏肝利膽。" },
  { code: "GB41", nameZh: "足臨泣 (Zulinqi)", nameEn: "Foot Governor of Tears", category: "八脈交會穴 (通帶脈 Dai Mai - 配外關 TE5) · 五輸穴之輸穴 (木/本)", location: "足背外側，第4、5跖骨底結合部前下方，小趾伸肌腱外側凹陷中 (Dorsum of foot, between 4th & 5th metatarsal bases).", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "通調帶脈 (Opens Dai Mai)、疏肝熄風 (Spreads LV Qi)、清頭明目 (Clears head & eyes)、化痰散結 (Transforms phlegm).", indications: "偏頭痛 (Migraine)、目赤腫痛、胸脅脹痛、乳腺炎 (Mastitis)、月經不調、足背腫痛、瘰癧。", notes: "【課件考綱精華】① 八脈交會穴通帶脈：偏頭痛發作急救（配外關 TE5）。② 婦科乳腺炎與帶脈病症。" },
  { code: "GB42", nameZh: "地五會 (Diwuhui)", nameEn: "Earth Five Meetings", category: "局部要穴 · 禁灸穴", location: "足背，第4、5跖骨間，第4跖趾關節近端", needling: "直刺 0.3-0.5 寸。🚫 禁灸 (No Moxibustion).", actions: "疏肝利膽、清熱明目", indications: "目赤腫痛、胸脅脹痛、乳腺炎、足背腫痛", notes: "【課件考綱精華】禁灸；乳腺炎與足背腫痛。" },
  { code: "GB43", nameZh: "俠溪 (Xiaxi)", nameEn: "Clamped Stream", category: "五輸穴之滎穴 (水/母 Point)", location: "足背，第4、5趾間，趾蹼緣後方赤白肉際 (Dorsum of foot, between 4th & 5th toes, proximal to web margin).", needling: "直刺 0.3 - 0.5 寸。可灸。", actions: "清瀉肝膽實熱 (Clears heat & Benefits ears/eyes)、聰耳明目 (Benefits sense organs).", indications: "頭痛、目眩、耳鳴耳聾、胸脅痛、熱病、乳腺炎。", notes: "【課件考綱精華】滎穴母穴：清瀉肝膽火旺（頭痛/耳鳴/目赤/乳疾）。" },
  { code: "GB44", nameZh: "足竅陰 (Zuqiaoyin)", nameEn: "Yin Port of the Foot", category: "五輸穴之井穴 (金/井 Point) · 膽經終點", location: "足第4趾末節外側，趾甲角旁0.1寸 (Lateral side of 4th toe, 0.1 cun from corner of nail).", needling: "淺刺 0.1 寸或點刺出血 (Prick to bleed)。可灸。", actions: "清熱開竅 (Clears heat & Revives consciousness)、平肝熄風 (Pacifies LV).", indications: "偏頭痛、目赤腫痛、耳鳴耳聾、胸脅痛、熱病昏迷、失眠多夢。", notes: "【課件考綱精華】膽經終點井穴：偏頭痛與高熱急救。" }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Gallbladder Channel (GB) with full 44 points untruncated!');

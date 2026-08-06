/**
 * scratch/enrich_spleen_channel_curriculum.js
 * 100% comprehensive enrichment for Spleen Channel (SP) including:
 * - 21 Points detailed curriculum notes (SP1 to SP21)
 * - Divergent Channel (經別)
 * - Luo Channel & Great Luo (絡脈：公孫 SP4 & 脾之大絡：大包 SP21)
 * - Muscle Channel (經筋：結膝內輔骨、會聚陰器)
 * - Dermatome (皮部：關蟄)
 * - Channel Rhymes & Songs (循行歌、二十一穴分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、所生病與 6 段按診分段結節診斷)
 * - Meridian Care & Preservation (脾與胰解剖考證、脾主運化統血、巳時養生、孕婦三陰交合谷禁忌)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const spChannel = channels.find(c => c.code === 'SP');

if (!spChannel) {
  console.error('SP channel not found!');
  process.exit(1);
}

// 1. 常見經絡異常 Common Meridian Pathomechanism (含 6 段按診分段判讀)
spChannel.pathomechanism_zh = `【《靈樞·經脈》脾經是動病與所生病】
• 是動病 (Shi Dong Pathologies / 經氣變動): 舌根部發強、嘔逆、胃脘痛、腹脹、嗳氣、大便或矢氣後感到輕鬆、身體沉重無力。
• 所生病 (Suo Sheng Pathologies / 脾所生病): 舌根部痛、身體不能活動、食不下（吃不下）、心胸煩悶、心窩下急痛、大便溏、腹有痞塊、泄利（瀉泄）、水閉（小便不通）、黃疸、不能安睡、勉強站立、大腿和小腿內側腫脹厥冷、足大趾不能運用。

【足太陰經循經按診與 6 段切診判讀】
1. 大都、太白段（特別是原穴太白）：若有松軟、塌陷、小結節或酸痛感，提示脾虛（慢性結腸炎、消瘦、盜汗、乏力、腹瀉、水腫）。
2. 公孫段：若出現沙粒狀結節伴尖銳刺痛，多為濕熱傷絡（眼睛充血/急性結膜炎）或脾胃濕熱病；若松軟塌陷，提示衝脈虛（婦科病）。
3. 商丘段：若出現過敏性劇烈疼痛或結絡，提示脾經被濕熱所困（目赤充血或口腔潰瘍）。
4. 三陰交段：三陰經（脾、肝、腎）病變均在此反應，女性70%以上有異常。實證為銳痛，虛證為酸痛與松軟腫塊（提示婦科病）。從大都至三陰交皮膚較薄，很少硬結。
5. 漏谷至地機段：此段常有硬結、結塊、結節，是子宮肌瘤、卵巢囊腫等婦科病變的特異反應部位。
6. 陰陵泉段：大部分松軟，局部酸軟酸痛表示足太陰氣化失常、行氣化濕功能受阻，濕邪代謝緩慢（尿頻、尿不暢、水腫）。`;

spChannel.pathomechanism_en = `【Spleen Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies (Channel Reactivity): Stiffness of tongue root, belching, epigastric pain, abdominal fullness, relief after flatulence/stool, heavy limbs and weakness.
• Suo Sheng Pathologies (Spleen Organ Disorders): Root of tongue pain, body unable to move, anorexia (unable to eat), restless oppression in chest/heart, acute pain below heart, loose stools, abdominal masses/tumors, diarrhea, dysuria/water blockage, jaundice, insomnia, difficulty standing, swelling and coldness of inner thigh/knee, dysfunction of big toe.

【Segmental Meridian Palpation & Diagnostic Pearls】
1. Dadu (SP2) to Taibai (SP3): Softness, flaccid depression, small nodules, or soreness at Taibai (SP3) indicates Spleen Deficiency (emaciation, fatigue, chronic diarrhea, edema).
2. Gongsun (SP4): Gritty nodules with sharp pain indicate Damp-Heat in channels (conjunctivitis) or SP/ST disease; flaccid depression indicates Chong Mai deficiency (gynecological disorders).
3. Shangqiu (SP5): Sharp tenderness or cord-like nodules indicate Damp-Heat trapping Spleen (mouth ulcers, red eyes).
4. Sanyinjiao (SP6): Reflects Spleen, Liver, and Kidney pathology (over 70% of women react here). Sharp pain = Excess; dull soreness/soft swelling = Deficiency & gynecological issues.
5. Lougu (SP7) to Diji (SP8): Hard nodules/masses are specific diagnostic points for uterine fibroids or ovarian pathology.
6. Yinlingquan (SP9): Soft soreness indicates impaired SP Qi transformation and water metabolism failure (dysuria, frequent urination, edema).`;

// 2. 經絡保養與日常養生 Meridian Care & Preservation (含中醫脾與胰古籍解剖考驗)
spChannel.preservation_zh = `【古籍中「脾與胰」之解剖考證與氣化理論】
脾為後天之本，主運化、行津液、主生血與統血、主升清、主肌肉四肢、主藏意。《素問·靈蘭秘典論》曰：「脾胃者，倉廩之官，五味出焉。」
中醫藏象學說中的「脾」解剖上包含現代解剖學之脾與胰：
• 《醫學入門》稱其「扁似馬蹄」（指脾臟）。
• 《醫貫》《醫綱總樞》稱其「形如刀鐮、犬舌、雞冠，生於胃下，橫貼胃底，中有一管斜入腸名曰瓏管」（指胰臟與胰管）。
生理功能兼具消化吸收、血糖調節與精神記憶管理。脾經氣化失常則見消瘦易倦、記憶力減退、慢性出血與股膝內腫厥。

【脾經日常保健與養生導引】
• 時辰養生 (Clock Time 9:00-11:00 AM 巳時): 巳時脾經當令，脾為消化吸收與血液統領之總調度。此時拍打刺激脾經（雙腿內側每側10分鐘）是最佳保養法。忌食燥熱辛辣食物。
• 艾灸隱白止血: 隱白穴(SP1)為脾經井穴，艾條灸隱白能健脾統血，治月經過多、崩漏、便血。
• 唇色診斷: 脾功能好則嘴唇紅潤。唇白示氣血不足；唇暗、唇紫示寒入脾經。
• ⚠️ 孕婦禁忌: 孕婦嚴禁按摩針灸三陰交(SP6)，文獻記載合按三陰交與合谷(LI4)有強烈催產作用，可導致流產！`;

spChannel.preservation_en = `【Ancient Anatomical Insight of Spleen & Pancreas (脾與胰)】
In TCM, "Spleen" encompasses both the anatomical Spleen and Pancreas. Ancient texts describe its horse-shoe shape (Spleen) and its sickle/dog-tongue shape under the stomach with a duct entering the intestine ("Long Guan" / Pancreatic Duct). Spleen governs transformation/transportation, blood control, muscle strength, and intellect/memory ("Zang Yi / 藏意").

【Meridian Health Preservation & Self-Care Protocol】
• Clock Time Alignment (9:00 - 11:00 AM Si Hour): Spleen meridian is most active. Tap along the medial leg Spleen channel (10 min per side) during Si Hour. Avoid spicy or greasy hot foods.
• Moxibustion on Yinbai (SP1): Moxa on Yinbai (SP1) strongly tonifies Spleen ability to control blood, treating menorrhagia, uterine bleeding, and blood in stool.
• Lip Complexion Diagnosis: Healthy Spleen shows rosy lips; pale lips = Qi-Blood deficiency; purple/dark lips = Cold in Spleen.
• ⚠️ Pregnancy Contraindication: Sanyinjiao (SP6) is STRICTLY CONTRAINDICATED in pregnancy! Combining SP6 and LI4 induces labor and causes abortion!`;

// 3. 經別 Divergent Channel
spChannel.divergent_channel_zh = `【足太陰脾經經別 (Spleen Divergent Channel)】
• 循行路線：從足太陰經脈的大腿內側（股內側）分出，上至髀部，同足陽明胃經的經別相合并行，向上貫穿心臟，結於咽喉，貫通舌中。
• 臨床意義：加強脾胃表裡聯繫，並向上貫心連舌，解釋了脾病致舌強、舌本痛與心煩失眠之機制。`;

spChannel.divergent_channel_en = `【Spleen Divergent Channel (Jing Bie)】
• Trajectory: Branches at inner thigh, ascends to hip, conjoins Stomach Divergent channel, penetrates Heart, ascends to throat, and penetrates root of tongue.
• Clinical Significance: Reinforces Spleen-Stomach interior-exterior relationship and links Spleen directly to Heart and tongue.`;

// 4. 絡脈與脾之大絡 Luo Channel & Great Luo
spChannel.luo_channel_zh = `【足太陰絡脈 —— 公孫 (SP4 Luo-Connecting Channel)】
• 循行路線：在足大趾本節後1寸處（公孫穴）分出走向足陽明胃經；其支脈進入腹腔聯絡腸胃。
• 病變：氣逆則發生霍亂吐瀉；實證為腹內絞痛；虛證為鼓脹（腹脹水腫）。取公孫 (SP4) 治療。

【脾之大絡 —— 大包 (SP21 Great Luo-Connecting Vessel)】
• 循行路線：出於淵腋下3寸（第6肋間隙），散布於胸脅部，貫通全身諸絡脈。
• 病變：實證為全身盡痛（全背胸脅疼痛）；虛證為百節盡皆縱（全身關節鬆弛無力、肌肉軟弱）。取大包 (SP21) 治療。`;

spChannel.luo_channel_en = `【Spleen Luo-Connecting Vessel (Gongsun SP4)】
• Trajectory: Departs from SP4, connects to Stomach channel, enters abdominal cavity to connect with Stomach and Intestines.
• Pathology: Rebellious Qi: Cholera/severe vomiting & diarrhea. Excess: Acute abdominal cramping. Deficiency: Abdominal distention/ascites.

【Great Luo Vessel of Spleen (Dabao SP21 - 脾之大絡)】
• Trajectory: Emerges 3 cun below Yuanye (GB22) at 6th intercostal space, spreading over chest and hypochondrium, embracing all Luo vessels in the body.
• Pathology: Excess: General aching and pain all over the body. Deficiency: Flaccidity of all joints and muscles.`;

// 5. 經筋 Muscle Channel / Tendino-Muscular
spChannel.muscle_channel_zh = `【足太陰經筋 (Spleen Muscle Channel / Sinew Channel)】
• 循行路線：起於足大趾內側端（隱白），上行結於內踝，直上結於膝內輔骨（股骨與脛骨內側髁），沿股內側上行結於髀部，會聚於陰器；再上行布於腹部，結聚於臍，沿腹內上行結於肋骨，散布於胸中，附於脊旁。
• 病候與臨床應用：足大趾扭傷、內踝痛、膝內輔骨痛、股內側痛、髀樞痛、陰器扭痛、臍腹抽痛、胸脅脊脅痛。`;

spChannel.muscle_channel_en = `【Spleen Muscle Channel (Jing Jin)】
• Trajectory: Originates at big toe (SP1), binds at medial malleolus, medial knee condyle, hip, gathers at genitals, ascends abdomen to bind at umbilicus, ribs, chest, and flanks spine.
• Pathology: Spasm/pain of big toe, medial ankle, inner knee, thigh, groin/genitals, umbilical cramping, chest and spinal pain.`;

// 6. 皮部 Dermatome (太陰皮部：關蟄)
spChannel.dermatome_zh = `【太陰皮部 —— 「關蟄」(Taiyin Dermatome)】
• 太陰皮部名「關蟄」（關者固於外，蟄者伏於中）。太陰為三陰之「關」，亦為病邪出入門戶。太陰脾土喜溫惡濕，邪犯太陰多從寒濕而化。
• 傷寒論：「太陰之為病，腹滿而吐，食不下，自利益甚，時腹自痛」，此為太陰里虛寒證，治宜溫中祛寒、健脾燥濕。`;

// 7. 經脈歌訣 Channel Rhymes & Classic Point Songs
spChannel.channel_rhyme_zh = `【足太陰脾經循行歌與分寸歌】
「SP二一是脾經，起於隱白大包終，脾胃腸腹泌尿好，五臟生殖血舌病。
隱白大趾內甲角，大都節前陷中尋，太白節後白肉際，基底前下是公孫，
商丘內踝前下找，踝上三寸三陰交，踝上六寸漏谷是，陵下三寸地機朝，
膝內輔下陰陵泉，血海股內肌頭間，箕門髌底衝門連，髌上三分之二見，
衝門腹溝動脈外，衝上斜七府舍連，橫下三寸是腹結，臍旁四寸大橫穴，
腹哀建里旁四寸，中庭旁六食竇全，天溪胸鄉周榮上，四肋三肋二肋間，
脾之大絡大包穴，腋中線上六肋間。」`;

// 8. 全21穴位詳細課件精華 (SP1 - SP21)
spChannel.points_curriculum = [
  {
    code: "SP1",
    nameZh: "隱白 (Yinbai)",
    nameEn: "Hidden White",
    category: "五輸穴之井穴 (Jing-Well - 木穴 Wood Point) · 孫思邈十三鬼穴 · 止血第一要穴",
    location: "足大趾內側，趾甲角旁0.1寸 (Medial side of great toe, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或點刺出血；出血證宜用艾條大炷灸。可灸。",
    actions: "健脾統血止血 (Stops Bleeding & Regulates Spleen)、清心安神 (Calms Heart & Spirit)、開竅甦厥 (Restores Consciousness).",
    indications: "月經過多、崩漏（子宮異常出血）、便血、尿血、癲狂、多梦、驚風、腹滿、暴瀉、痛風 (Gout)。",
    notes: "【課件考綱精華】① 止血第一要穴：艾灸隱白治脾不統血之崩漏、月經過多與便血。② 鬼穴之一：治癲狂夢魘。"
  },
  {
    code: "SP2",
    nameZh: "大都 (Dadu)",
    nameEn: "Great Metropolis",
    category: "五輸穴之滎穴 (Ying-Spring - 火穴/母穴 Fire/Mother Point)",
    location: "足大趾內側，第1跖趾關節前下方赤白肉際凹陷中 (Distal & inferior to 1st metatarsophalangeal joint).",
    needling: "直刺 0.1 - 0.3 寸。可灸。",
    actions: "健脾和胃 (Regulates Spleen)、清熱利濕 (Resolves Damp-Heat)、理氣止痛 (Harmonizes Middle Jiao).",
    indications: "腹脹、胃痛、嘔吐、腹瀉、便秘、熱病無汗、足趾痛、腳氣病 (Beriberi/B1 deficiency).",
    notes: "【課件考綱精華】母穴（火生土）：補脾經氣血；清脾胃濕熱。"
  },
  {
    code: "SP3",
    nameZh: "太白 (Taibai)",
    nameEn: "Supreme White",
    category: "五輸穴之輸穴 (Shu-Stream - 土穴/本穴) · 原穴 (Yuan-Source Point) · 健脾第一要穴",
    location: "足內側緣，第1跖骨小頭後下方赤白肉際凹陷中 (Proximal & inferior to head of 1st metatarsal bone).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "大補脾土 (Major Spleen Tonification)、健脾化濕 (Fortifies SP & Resolves Damp)、和胃理氣 (Harmonizes SP & ST).",
    indications: "腸鳴、腹脹、腹瀉、胃痛、便秘、痢疾、嘔吐、體重節痛（濕重）、腹痛。",
    notes: "【課件考綱精華】① 原穴本穴：健脾化濕第一要穴。② 脾虛切診反應點：若太白松軟塌陷或酸痛提示脾虛（消瘦、腹瀉、水腫）。"
  },
  {
    code: "SP4",
    nameZh: "公孫 (Gongsun)",
    nameEn: "Yellow Emperor / Grandfather Grandson",
    category: "絡穴 (to ST) · 八脈交會穴 (通衝脈 Chong Mai - 配內關 PC6)",
    location: "足內側緣，第1跖骨基底部前下方赤白肉際凹陷中 (Distal & inferior to base of 1st metatarsal bone).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "健脾和胃 (Fortifies Spleen)、通調衝脈 (Regulates Penetrating/Chong Vessel)、理氣寬胸 (Benefits Heart & Chest)、安神定志 (Calms Spirit).",
    indications: "胃痛、嘔吐、腹痛、腹瀉、痢疾、心煩、失眠、狂證、逆氣裏急、氣上衝心、痛經、月經不調、足踝痛、痔瘡。",
    notes: "【課件考綱精華】① 八脈交會穴 (公孫衝脈胃心胸，配內關 PC6)：專治胃痛、胸悶、嘔吐與衝脈逆氣。② 按診：結節刺痛提示濕熱傷絡（結膜炎）；塌陷提示衝脈虛（婦科病）。"
  },
  {
    code: "SP5",
    nameZh: "商丘 (Shangqiu)",
    nameEn: "Shang Hill",
    category: "五輸穴之經穴 (Jing-River - 金穴/子穴 Metal/Child Point)",
    location: "足內側部，內踝前下方，舟骨粗隆與內踝尖連線中點凹陷中 (Distal & inferior to medial malleolus).",
    needling: "直刺 0.2 - 0.3 寸。可灸。",
    actions: "健脾利濕 (Tonifies Spleen & Resolves Damp)、和胃消滯 (Harmonizes Stomach)、利足踝 (Benefits Foot & Ankle).",
    indications: "腹脹、腹瀉、便秘、黃疸、足踝腫痛、舌本強痛、消化不良、小兒驚風。",
    notes: "【課件考綱精華】瀉穴（子穴）：瀉脾經實熱濕灼；切診劇痛提示脾經濕熱（口腔潰瘍/目赤）。"
  },
  {
    code: "SP6",
    nameZh: "三陰交 (Sanyinjiao)",
    nameEn: "Three Yin Intersection",
    category: "足三陰經交會穴 (脾、肝、腎) · 婦科生殖第一要穴 · ⚠️ 孕婦禁針",
    location: "小腿內側，內踝尖上3寸，脛骨內側緣後際 (3 cun above tip of medial malleolus, posterior to medial tibia border).",
    needling: "直刺 0.5 - 1.0 寸。可灸。⚠️ 孕婦嚴禁針灸 (Contraindicated during Pregnancy).",
    actions: "健脾益氣 (Tonifies SP & ST)、滋補肝腎 (Harmonizes Liver & Kidneys)、調經安胎/催產 (Regulates Menses & Labor)、通利下焦 (Benefits Lower Jiao & Genitals)、安神助眠 (Calms Spirit & Insomnia).",
    indications: "腸鳴腹脹腹瀉、月經不調、崩漏、帶下、陰挺（子宮脫垂）、不孕症、滯產、遺精、陽痿、遺尿、尿頻、心悸、失眠、高血壓、下肢痿痺、蕁麻疹。",
    notes: "【課件考綱精華】① 全身最重要穴位之一：脾肝腎三經總樞紐。婦科、男科、生殖、泌尿、失眠第一要穴。② ⚠️ 孕婦禁針（合按三陰交+合谷 LI4 有強烈催產作用致流產）。"
  },
  {
    code: "SP7",
    nameZh: "漏谷 (Lougu)",
    nameEn: "Leaking Valley",
    category: "局部要穴 (Local Point)",
    location: "小腿內側，內踝尖上6寸，脛骨內側緣後際 (6 cun above tip of medial malleolus).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "健脾利濕 (Fortifies Spleen & Resolves Damp)、通利小便 (Promotes Urination).",
    indications: "腹脹、腸鳴、小便不利、遺精、下肢痿痺、水腫、足脛麻木痛。",
    notes: "【課件考綱精華】小便不利與水腫；切診硬結提示子宮肌瘤或卵巢病變。"
  },
  {
    code: "SP8",
    nameZh: "地機 (Diji)",
    nameEn: "Earth's Crux",
    category: "郄穴 (Xi-Cleft Point of Spleen Channel) · 痛經要穴",
    location: "小腿內側，陰陵泉(SP9)直下3寸，脛骨內側緣後際 (3 cun below SP9, on line connecting SP9 & medial malleolus).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "調經止痛 (Regulates Menses & Invigorates Blood)、和脾理血 (Harmonizes Spleen)、緩急止痛 (Moderates Acute Conditions).",
    indications: "痛經（劇烈痛經血塊）、崩漏、月經不調、腹痛、腹瀉、小便不利、水腫、男性不育症。",
    notes: "【課件考綱精華】郄穴：專治急性痛經、血瘀痛經、血塊與腹痛。切診硬結提示子宮肌瘤。"
  },
  {
    code: "SP9",
    nameZh: "陰陵泉 (Yinlingquan)",
    nameEn: "Yin Mound Spring",
    category: "五輸穴之合穴 (He-Sea - 水穴 Water Point) · 利濕第一要穴",
    location: "小腿內側，脛骨內側髁下緣先後方凹陷中 (In depression posterior & inferior to medial condyle of tibia).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "運化水濕 (Primary Point to Resolve Dampness)、通調水道 (Opens Water Passages)、健脾利濕 (Benefits Lower Jiao).",
    indications: "腹脹、腹瀉、水腫、黃疸、小便不利、遺尿、尿失禁、陰部痛、痛經、遺精、膝關節痛（內側）、帶下、陰道念珠菌感染 (Yeast/Candida).",
    notes: "【課件考綱精華】① 全身利濕排毒第一要穴（濕熱、寒濕、水腫、黃疸、帶下）。② 配穴：陰陵泉 (SP9) + 陽陵泉 (GB34) 膝關節痛雙陵穴。"
  },
  {
    code: "SP10",
    nameZh: "血海 (Xuehai)",
    nameEn: "Sea of Blood",
    category: "血證與皮膚病第一要穴 (Primary Blood & Skin Point)",
    location: "大腿內側，髌底內側端上2寸，股四頭肌內側頭隆起處 (2 cun above medio-superior border of patella, on bulge of quadriceps femoris).",
    needling: "直刺 0.5 - 1.2 寸。可灸。",
    actions: "調血理血 (Invigorates & Cools Blood)、化瘀止痛 (Dispels Blood Stasis)、祛風止癢 (Benefits Skin).",
    indications: "月經不調、痛經、閉經、崩漏、經前症候群 (PMS)、癮疹（蕁麻疹）、濕疹、丹毒、皮炎、大腿內側痛、小便不利。",
    notes: "【課件考綱精華】① 血證第一要穴：清血熱、補血、活血化瘀。② 皮膚病要穴：治蕁麻疹、濕疹（治風先治血，血行風自滅）。"
  },
  {
    code: "SP11",
    nameZh: "箕門 (Jimen)",
    nameEn: "Winnower Gate",
    category: "局部要穴 (Local Point)",
    location: "大腿內側，血海(SP10)與衝門(SP12)連線上，血海直上6寸 (6 cun above SP10).",
    needling: "直刺 0.5 - 1.0 寸。避開股動脈。可灸。",
    actions: "利尿通淋 (Regulates Urination)、清熱利濕 (Drains Damp & Clears Heat).",
    indications: "小便不利、遺尿、腹股溝腫痛、下肢萎縮麻木痛。",
    notes: "【課件考綱精華】小便不利與腹股溝腫痛；避開股動脈。"
  },
  {
    code: "SP12",
    nameZh: "衝門 (Chongmen)",
    nameEn: "Surging Gate",
    category: "足太陰脾經與厥陰肝經交會穴",
    location: "腹股溝外側，恥骨聯合上緣旁開3.5寸，股動脈外側 (Lateral to pulsating external iliac artery, 3.5 cun lateral to REN2).",
    needling: "直刺 0.5 - 1.0 寸。避開股動脈。可灸。",
    actions: "理氣止痛 (Regulates Qi & Alleviates Pain)、健脾利濕 (Drains Damp).",
    indications: "腹痛、疝氣、崩漏、帶下、胎氣上衝、小便不利。",
    notes: "【課件考綱精華】疝氣與下腹劇痛；避開股動脈。"
  },
  {
    code: "SP13",
    nameZh: "府舍 (Fushe)",
    nameEn: "Bowel Abode",
    category: "足太陰脾經、厥陰肝經與陰維脈交會穴",
    location: "下腹部，衝門(SP12)斜上方0.7寸，距前正中線4寸 (4 cun lateral, 0.7 cun superior to SP12).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "理氣止痛 (Regulates Qi)、積聚散結 (Dispels Accumulation).",
    indications: "腹痛、積聚（腹部腫塊）、疝氣、腹瀉。",
    notes: "【課件考綱精華】腹部積聚腫塊與疝氣腹痛。"
  },
  {
    code: "SP14",
    nameZh: "腹結 (Fujie)",
    nameEn: "Abdominal Bind",
    category: "局部要穴 (Local Point)",
    location: "下腹部，大橫(SP15)直下1.3寸，前正中線旁開4寸 (1.3 cun below SP15, 4 cun lateral).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "溫中散寒 (Warms Lower Jiao)、理氣止痛 (Regulates Qi).",
    indications: "腹痛、腹瀉、食積、疝氣、便秘。",
    notes: "【課件考綱精華】臍周腹痛與食積腹瀉。"
  },
  {
    code: "SP15",
    nameZh: "大橫 (Daheng)",
    nameEn: "Great Horizontal",
    category: "足太陰脾經與陰維脈交會穴 · 腸道要穴",
    location: "腹中部，臍中旁開4寸，腹直肌外側緣 (Level with center of umbilicus, 4 cun lateral).",
    needling: "直刺 0.7 - 1.2 寸。可灸。",
    actions: "理氣通腸 (Regulates Intestines & Moves Qi)、溫中止瀉 (Warms Lower Jiao).",
    indications: "腹痛、腹瀉、便秘（最常用）、痢疾、消化不良、腸麻痺。",
    notes: "【課件考綱精華】便秘與腹痛大穴；平臍旁開 4 寸。"
  },
  {
    code: "SP16",
    nameZh: "腹哀 (Fuai)",
    nameEn: "Abdominal Lament",
    category: "足太陰脾經與陰維脈交會穴",
    location: "上腹部，臍中上3寸，前正中線旁開4寸 (3 cun above umbilicus, 4 cun lateral).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "和胃理腸 (Regulates Intestines)、清熱化濕 (Clears Damp).",
    indications: "消化不良、腹痛、便秘、痢疾、便血。",
    notes: "【課件考綱精華】消化不良與腸道病變。"
  },
  {
    code: "SP17",
    nameZh: "食竇 (Shidou)",
    nameEn: "Food Hole",
    category: "胸部要穴 (Chest Point)",
    location: "胸外側部，第5肋間隙，前正中線旁開6寸 (5th intercostal space, 6 cun lateral).",
    needling: "斜刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺（防氣胸）。可灸。",
    actions: "健脾消食 (Dissipates Food Stagnation)、寬胸利氣 (Promotes Digestion).",
    indications: "胸脅脹痛、暖氣、反胃、腹脹、水腫、食谷不化。",
    notes: "【課件考綱精華】食谷不化、反胃與胸脅脹痛。"
  },
  {
    code: "SP18",
    nameZh: "天溪 (Tianxi)",
    nameEn: "Celestial Ravine",
    category: "胸部與乳疾要穴 (Chest & Breast Point)",
    location: "胸外側部，第4肋間隙，前正中線旁開6寸 (4th intercostal space, 6 cun lateral).",
    needling: "斜刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "寬胸理氣 (Regulates LU/ST Qi)、通乳消腫 (Benefits Breasts).",
    indications: "胸脅疼痛、咳嗽、乳癰（乳腺炎）、乳少（缺乳）、噫氣。",
    notes: "【課件考綱精華】產後缺乳與乳腺炎要穴。"
  },
  {
    code: "SP19",
    nameZh: "胸鄉 (Xiongxiang)",
    nameEn: "Chest Village",
    category: "胸部要穴 (Chest Point)",
    location: "胸外側部，第3肋間隙，前正中線旁開6寸 (3rd intercostal space, 6 cun lateral).",
    needling: "斜刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "寬胸理氣 (Unbinds Chest & Descends Qi).",
    indications: "胸脅脹痛、咳嗽、胸痛引背。",
    notes: "【課件考綱精華】胸脅脹痛與氣逆咳嗽。"
  },
  {
    code: "SP20",
    nameZh: "周榮 (Zhourong)",
    nameEn: "All-Round Flourishing",
    category: "胸部要穴 (Chest Point)",
    location: "胸外側部，第2肋間隙，前正中線旁開6寸 (2nd intercostal space, 6 cun lateral).",
    needling: "斜刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "宣肺理氣 (Unbinds Chest & Descends Qi).",
    indications: "咳嗽、氣逆、胸脅脹滿、飲食不下。",
    notes: "【課件考綱精華】胸脅脹滿與咳嗽氣逆。"
  },
  {
    code: "SP21",
    nameZh: "大包 (Dabao)",
    nameEn: "Great Embracement",
    category: "脾之大絡 (Great Luo-Connecting Point of Spleen) · 統轄全身諸絡",
    location: "胸外側區，第6肋間隙，腋中線上 (6th intercostal space, on mid-axillary line).",
    needling: "斜刺或平刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺入胸腔。可灸。",
    actions: "寬胸利脅 (Unbinds Chest & Lateral Ribs)、統轄全身氣血絡脈 (Regulates All Luo Vessels)、舒筋固節 (Firms Sinews & Joints).",
    indications: "氣喘、胸脅痛、全身疼痛（實證：全身盡痛）、四肢無力/肌肉軟弱（虛證：百節盡皆縱）、纖維肌痛症 (Fibromyalgia)。",
    notes: "【課件考綱精華】① 脾之大絡：統轄全身十五絡脈。② 虛實鑑別：實證為全身盡痛（按壓疼痛）；虛證為全身關節鬆弛軟弱無力（按壓舒適）。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Spleen Channel (SP) with full 21 points, Luo channel, Great Luo, Dermatome, and Palpation Segmental Diagnosis!');

/**
 * scratch/enrich_stomach_channel_curriculum.js
 * 100% comprehensive enrichment for Stomach Channel (ST) including:
 * - 45 Points detailed curriculum notes (ST1 to ST45)
 * - Divergent Channel (經別)
 * - Luo Channel (絡脈：豐隆 ST40)
 * - Muscle Channel (經筋：目下綱)
 * - Dermatome (皮部：害蜚)
 * - Channel Rhymes & Songs (循行歌、四十五穴分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、所生病與按診分段結節診斷)
 * - Meridian Care & Preservation (倉廩之官氣化、拍打揉按保養、辰時養生)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const stChannel = channels.find(c => c.code === 'ST');

if (!stChannel) {
  console.error('ST channel not found!');
  process.exit(1);
}

// 1. 常見經絡異常 Common Meridian Pathomechanism (含按診分段判讀)
stChannel.pathomechanism_zh = `【《靈樞·經脈》胃經是動病與所生病】
• 是動病 (Shi Dong Pathologies / 經氣變動): 發冷、喜伸懶腰、屢屢呵欠、顏面暗黑。病發時厭惡他人與火光，聽到木器聲音就惕惕慌慌。嚴重者登高而歌、棄衣而走、腹部脹滿、小腿氣血阻逆（厥冷、麻木、痠痛）。
• 所生病 (Suo Sheng Pathologies / 主治「血」病): 躁狂、瘧疾、溫熱病、自汗出、鼻塞流涕或出血、口喎斜、唇生疱疹、頸部腫、喉嚨痛、大腹水腫、膝關節腫痛；胸前、乳部、氣衝、腹股溝、大腿前、小腿外側、足背連線上疼痛，足中趾不能運用。氣盛有餘則身體前面發冷寒戰，胃寒則脹滿。

【足陽明經循經按診與分段切診判讀】
1. 內庭至陷谷段：如果有結節或過敏性痛點，提示陽明熱盛。
2. 衝陽至足三里段：若出現結節、硬結，提示陽明積滯不通；若出現松軟下陷，提示陽明寒凝、寒氣瘀阻。
3. 髌骨外側至梁丘段：如果有過敏性疼痛，或明顯肌肉緊張度增高，或有結節，提示可能是胃痙攣、胃潰瘍或胃部占位病變。`;

stChannel.pathomechanism_en = `【Stomach Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies (Channel Reactivity): Chills, yawning, stretching, dark facial complexion. When diseased, aversion to people and fire, startled by wooden sounds; severe cases climb high and sing, discard clothes and run, abdominal fullness, lower leg Qi-blood stagnation (coldness, numbness, pain).
• Suo Sheng Pathologies (Blood Disorders & Organ Pathologies): Mania, malaria, febrile diseases, spontaneous sweating, rhinorrhea/epistaxis, facial paralysis, lip herpes, neck swelling, sore throat, abdominal edema, knee joint swelling; pain along chest, breast, groin, thigh, anterior leg, dorsum of foot, index/middle toe dysfunction. Cold shivering when Qi is excessive, fullness when Stomach is cold.

【Segmental Meridian Palpation & Diagnostic Pearls】
1. Neiting (ST44) to Xiangu (ST43): Tenderness or nodules indicate Yangming Full-Heat.
2. Chongyang (ST42) to Zusanli (ST36): Hard nodules indicate Yangming Food/Stagnation; soft flaccid depressions indicate Yangming Cold-Deficiency.
3. Lateral Patella to Liangqiu (ST34): Muscle hypertonicity, acute pain, or nodules suggest stomach spasms, gastric ulcers, or stomach occupative lesions.`;

// 2. 經絡保養與日常養生 Meridian Care & Preservation (含倉廩之官與氣化)
stChannel.preservation_zh = `【胃經氣化理論與倉廩之官】
足陽明經內屬於胃，外行於承泣至厲兌。脾胃為「倉廩之官，五味出焉」，是人體後天之本。胃主受納腐熟水穀、主通降。胃受納降濁功能障礙則見胃脘脹痛、嘔吐、消瘦、精神異常；循行經氣障礙則見膝髌腫痛、足背痛，集中在梁丘、足三里、豐隆、上巨虛、下巨虛、陷谷出現結塊。

【胃經日常保健與養生導引】
• 時辰養生 (Clock Time 7:00-9:00 AM 辰時): 辰時胃經當令，吃早餐最易消化吸收。早餐宜選溫和養胃食品（稀粥、麥片），忌生冷暴食。
• 經絡拍打與按揉: 胃經貫穿人體正面。臉部重點穴位用指腹揉按1分鐘；雙腿胃經循線拍打梳理，每天3次（辰時、飯後1小時、睡前1小時），每次5~10分鐘。
• 飯後1小時按壓: 飯後1小時循按腿部胃經可啟動人體「發電系統」，調節胃腸功能。避免胃火過盛（唇乾裂、唇瘡）及胃寒。`;

stChannel.preservation_en = `【Stomach Qi Transformation & Root of Post-Natal Qi】
Stomach and Spleen are the "Official of the Granary (倉廩之官)" and the root of Post-Natal Qi. Stomach governs receiving, rotting/ripening food, and descending. Dysfunction causes epigastric pain, vomiting, emaciation, or mental restlessness.

【Meridian Health Preservation & Self-Care Protocol】
• Clock Time Alignment (7:00 - 9:00 AM Chen Hour): Stomach meridian is most active. Eat a warm nourishing breakfast (oatmeal, warm porridge) for optimal digestion and absorption.
• Daily Tapping & Self-Massage: Tap along the anterior leg Stomach meridian (3 times daily: 7-9 AM, 1h post-meal, before bed, 5-10 min/session) to activate digestion.
• Post-Meal Acupressure: Pressing leg ST points 1 hour after meals boosts digestive energy and prevents stomach fire or stomach cold.`;

// 3. 經別 Divergent Channel
stChannel.divergent_channel_zh = `【足陽明胃經經別 (Stomach Divergent Channel)】
• 循行路線：從足陽明經脈的大腿前面處（髀部 ST31）分出，進入腹腔裡面，歸屬於胃，散布到脾臟，向上通過心臟，沿食道淺出口腔，上達鼻根及目眶下，回過來聯繫目系，脈氣仍注入足陽明本經。
• 臨床意義：胃經經別向上貫心，解釋了胃火上炎或胃不和引致心煩失眠、狂癲神志病之機制。`;

stChannel.divergent_channel_en = `【Stomach Divergent Channel (Jing Bie)】
• Trajectory: Branches at thigh (ST31), enters abdomen, pertains to Stomach, diffuses to Spleen, ascends through Heart, follows esophagus to mouth, nose, and infraorbital region, connects to eye system, and rejoins main ST channel.
• Clinical Significance: Penetrates the Heart organ, explaining why Stomach Heat/Phlegm induces insomnia, anxiety, and manic-depressive disorders.`;

// 4. 絡脈 Luo-Connecting Channel
stChannel.luo_channel_zh = `【足陽明絡脈 —— 豐隆 (ST40 Luo-Connecting Channel)】
• 循行路線：在距離外踝上8寸處（豐隆穴）分出走向足太陰脾經；其支脈沿脛骨外緣上行聯絡頭項部，與各經經氣相會合，再向下聯絡於咽喉部。
• 病變與臨床應用：氣逆則發生喉痺、突然失音；實證為狂癲之疾；虛證為足緩不收、脛部肌肉萎縮。臨床取絡穴豐隆 (ST40) 主治化痰與神志病。`;

stChannel.luo_channel_en = `【Stomach Luo-Connecting Vessel (Fenglong ST40)】
• Trajectory: Departs from ST40 (8 cun above external malleolus), connects to Spleen channel; branch ascends along tibia to head and neck, conjoins other channels, and descends to throat.
• Pathology: Rebellious Qi: Sudden loss of voice, throat obstruction. Excess: Mania and epilepsy. Deficiency: Weakness/flaccidity of lower leg and atrophy. Treated via ST40.`;

// 5. 經筋 Muscle Channel / Tendino-Muscular
stChannel.muscle_channel_zh = `【足陽明經筋 (Stomach Muscle Channel / Sinew Channel)】
• 循行路線：起於足次趾、中趾及無名趾，結於足背，上結於膝外側，結於髖關節，沿脅部聯屬脊柱；直行者沿脛骨結於膝，聚於陰器，上腹結於缺盆，上頸挾口合於鼻旁頄部，下結於鼻，合於足太陽經筋（太陽維絡上眼瞼目上綱，陽明維絡下眼瞼目下綱）。另一支結於耳前。
• 病候與臨床應用：足中趾扭傷、脛部轉筋、跳動硬急、伏兔部肌肉痙攣、腹股溝腫痛、疝氣、腹肌痙攣、缺盆及頸部痙攣、口角歪斜、下眼瞼痙攣不能閉合（目下綱病變）。`;

stChannel.muscle_channel_en = `【Stomach Muscle Channel (Jing Jin)】
• Trajectory: Originates at 2nd, 3rd, 4th toes, binds at dorsum of foot, lateral knee, hip, abdomen, supraclavicular fossa, neck, mouth, nose, and ear; conjoins BL muscle channel where BL binds upper eyelid (目上綱) and ST binds lower eyelid (目下綱).
• Pathology: Spasm of 2nd/3rd toes, lower leg cramping, thigh twitching, groin swelling, abdominal cramping, facial spasm/mouth deviation, and lower eyelid twitching/inability to close (目下綱).`;

// 6. 皮部 Dermatome (陽明皮部：害蜚)
stChannel.dermatome_zh = `【陽明皮部 —— 「害蜚」(Yangming Dermatome)】
• 陽明皮部名「害蜚」（害通闔）。陽明為陽氣亢盛，是三陽之「闔」，多氣多血，胃家實。
• 臨床意義：熱邪入裏見身熱、自汗、不惡寒反惡熱。治療以清下實熱、保存津液為主。`;

// 7. 經脈歌訣 Channel Rhymes & Classic Point Songs
stChannel.channel_rhyme_zh = `【足陽明胃經循行歌與分寸歌】
「ST四五是胃經，起於承泣厲兌停，胃腸血病與神志，頭面熱病五官病。
承泣下眶邊緣上，四白穴在眶下孔，巨髎鼻旁直瞳子，地倉吻旁四分靈，
大迎肌前動脈處，頰車咬肌高處迎，下關張口骨支起，頭維四五旁神庭，
人迎結喉旁動脈，水突環骨肌前行，肌間氣舍鎖骨上，缺盆鎖骨上窩中，
氣戶鎖下一肋上，相去中線四寸平，庫房屋翳膺窗接，都隔一肋乳中停，
乳根乳下一肋中，胸部諸穴要記清，不容巨闕旁二寸，其下承滿與梁門，
關門太乙滑肉門，天樞臍旁二寸平，外陵大巨水道穴，歸來氣衝曲骨鄰，
髀關髂下恥骨下，伏兔膝上六寸中，陰市膝上方三寸，梁丘膝上二寸呈，
膝外下陷是犢鼻，膝下三寸三里迎，膝下六寸上巨虛，膝下八寸條口行，
再下一寸下巨虛，條外一指是豐隆，解溪跗上系鞋處，衝陽跗上動脈憑，
陷谷跖趾關節後，次中趾縫尋內庭，厲兌次趾外甲角，四十五穴要記清。」`;

// 8. 全45穴位詳細課件精華 (ST1 - ST45)
stChannel.points_curriculum = [
  {
    code: "ST1",
    nameZh: "承泣 (Chengqi)",
    nameEn: "Tear Container",
    category: "陽貎脈 · 任脈 · 足陽明經交會穴 · 入口穴 (Entry)",
    location: "面部，眼球與眶下緣之間，瞳孔直下方 (Directly below pupil, between eyeball & infraorbital ridge).",
    needling: "左手拇指向上輕推眼球，直刺 0.5 - 1.0 寸沿眶下壁緩緩刺入。⚠️ 嚴禁提插捻轉，⚠️ 禁灸 (No Moxa).",
    actions: "疏風清熱 (Eliminates Wind & Clears Heat)、明目止淚 (Benefits Eyes & Stops Lacrimation).",
    indications: "目赤腫痛、迎風流淚、夜盲、近視、目翳、眼瞼瞤動、面癱、面肌痙攣。",
    notes: "【課件考綱精華】眼疾要穴；針刺難度高，進針須緩慢，ST2 為其安全替代穴。"
  },
  {
    code: "ST2",
    nameZh: "四白 (Sibai)",
    nameEn: "Four Whites",
    category: "眼疾與面痛要穴 (Local Eye & Face Point)",
    location: "面部，瞳孔直下方，眶下孔凹陷處 (Directly below pupil, in infraorbital foramen).",
    needling: "直刺 0.2 - 0.3 寸。⚠️ 禁深刺入眶下孔以防傷及神經血管。⚠️ 禁灸 (No Moxa).",
    actions: "祛風清熱 (Eliminates Wind & Heat)、通絡明目 (Benefits Eyes)、止痛 (Alleviates Pain).",
    indications: "目赤痛癢、眼瞼瞤動、目翳、口眼歪斜、三叉神經痛、面肌痛、頭痛眩暈、鼻衄。",
    notes: "【課件考綱精華】眼疾與面痛安全要穴（替代 ST1 針刺）；三叉神經痛與面癱必用。"
  },
  {
    code: "ST3",
    nameZh: "巨髎 (Julaio)",
    nameEn: "Great Bone Hole",
    category: "手足陽明經與陽貎脈交會穴",
    location: "面部，瞳孔直下方，平鼻翼下緣凹陷處 (Directly below pupil, level with lower border of ala nasi).",
    needling: "斜刺或平刺 0.3 - 0.5 寸。可灸。",
    actions: "祛風消腫 (Eliminates Wind & Dissipates Swelling)、通絡止痛 (Alleviates Pain).",
    indications: "口角歪斜、面痛、三叉神經痛、鼻衄、齒痛（上頜牙痛）、唇頰腫脹、眼瞼瞤動。",
    notes: "【課件考綱精華】上頜牙痛與面癱、面肌痙攣要穴。"
  },
  {
    code: "ST4",
    nameZh: "地倉 (Dicang)",
    nameEn: "Earth Granary",
    category: "手足陽明經與陽貎脈交會穴 · 面癱要穴",
    location: "面部，口角旁開0.4寸，瞳孔直下方 (Lateral to corner of mouth, directly below pupil).",
    needling: "斜刺或平刺 1.0 - 1.5 寸（常向頰車 ST6 方向透刺）。可灸。",
    actions: "祛風通絡 (Eliminates Wind from Face)、止痛降逆 (Alleviates Pain & Swelling).",
    indications: "口角歪斜、流涎（流口水）、面痛、齒痛、面肌痙攣、牙關緊閉 (Trismus/Tetanus).",
    notes: "【課件考綱精華】面癱第一要穴；透刺頰車 ST6 治面癱口角歪斜與流涎特效。"
  },
  {
    code: "ST5",
    nameZh: "大迎 (Daying)",
    nameEn: "Great Reception",
    category: "局部要穴 (Local Point)",
    location: "下頜角前下方，咬肌止點前緣，面動脈脈搏應手處 (Anterior to angle of mandible, on anterior border of masseter).",
    needling: "避開動脈，斜刺或平刺 0.3 - 0.5 寸。可灸。",
    actions: "祛風通絡 (Eliminates Wind)、消腫正齒 (Benefits Jaw & Teeth).",
    indications: "口角歪斜、頰腫、齒痛（智齒痛/後磨牙痛）、面痛、腮腺炎 (Mumps)、牙關緊閉。",
    notes: "【課件考綱精華】智齒痛與頰腫要穴；注意避開面動脈。"
  },
  {
    code: "ST6",
    nameZh: "頰車 (Jiache)",
    nameEn: "Jawbone",
    category: "孫思邈十三鬼穴 (Ghost Point) · 面癱牙痛要穴",
    location: "下頜角前上方一橫指，咬牙時咬肌隆起最高點 (One finger-breadth anterior/superior to angle of mandible).",
    needling: "直刺 0.3 - 0.5 寸，或向地倉 ST4 方向平刺 1.0 - 1.5 寸。可灸。",
    actions: "祛風清熱 (Eliminates Wind)、利頰正齒 (Benefits Jaw & Teeth)、通絡止痛 (Alleviates Pain).",
    indications: "齒痛（下頜牙痛）、牙關緊閉、頰腫、口角歪斜、面痛、腮腺炎、顳顎關節痛 (TMJ).",
    notes: "【課件考綱精華】下頜牙痛與顳顎關節痛 (TMJ) 第一要穴；鬼穴之一。"
  },
  {
    code: "ST7",
    nameZh: "下關 (Xiaguan)",
    nameEn: "Below the Joint",
    category: "足陽明經與足少陽經交會穴 · 耳齒耳痛要穴",
    location: "面部耳前，顴弓下緣凹陷中，下頜切跡之間，閉口取穴 (Anterior to ear, in depression between zygomatic arch & mandibular notch, mouth closed).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "聰耳利齒 (Benefits Ears, Jaw & Teeth)、通絡止痛 (Activates Channel & Alleviates Pain).",
    indications: "牙關緊閉、面痛（三叉神經痛）、齒痛、口眼歪斜、耳聾、耳鳴、中耳炎 (Otorrhea)、顳顎關節紊亂 (TMJ).",
    notes: "【課件考綱精華】閉口取穴；三叉神經痛、耳痛與上頜牙痛第一要穴。"
  },
  {
    code: "ST8",
    nameZh: "頭維 (Touwei)",
    nameEn: "Head Corner",
    category: "足陽明經與足少陽經、陽維脈交會穴 · 陽明頭痛要穴",
    location: "頭部額角發際上0.5寸，頭正中線旁開4.5寸 (0.5 cun above hairline at corner of forehead, 4.5 cun lateral to midline).",
    needling: "沿皮向後平刺 0.5 - 1.0 寸。⚠️ 禁灸 (No Moxa).",
    actions: "祛風止痛 (Eliminates Wind & Alleviates Pain)、清頭明目 (Benefits Eyes).",
    indications: "頭痛（陽明前額痛/裂開樣頭痛/偏頭痛/感冒頭痛/吐瀉伴頭痛）、目眩、目痛、迎風流淚、視物模糊、脫髮。",
    notes: "【課件考綱精華】前額與陽明頭痛第一要穴；禁灸。"
  },
  {
    code: "ST9",
    nameZh: "人迎 (Renying)",
    nameEn: "Man's Welcome",
    category: "足陽明經與足少陽經交會穴 · 四海穴之氣海穴 · 血壓雙向調節穴",
    location: "頸部，結喉旁開1.5寸，胸鎖乳突肌前緣，頸總動脈搏動處 (Level with Adam's apple, 1.5 cun lateral, anterior border of SCM).",
    needling: "左手手指推開頸總動脈，直刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺或傷及動脈。⚠️ 禁灸 (No Moxa).",
    actions: "理氣降逆 (Regulates Qi & Descends Rebellious Qi)、利咽散結 (Benefits Throat & Dissipates Nodules)、雙向調節血壓 (Regulates Blood Pressure).",
    indications: "高血壓、低血壓、癭氣（甲狀腺腫）、瘰癧、咽喉腫痛、氣喘、胸滿。",
    notes: "【課件考綱精華】氣海穴之一；高血壓與低血壓雙向調節；注意避開頸總動脈。"
  },
  {
    code: "ST10",
    nameZh: "水突 (Shuitu)",
    nameEn: "Water Prominence",
    category: "局部要穴 (Local Point)",
    location: "頸部，人迎(ST9)與氣舍(ST11)連線中點，胸鎖乳突肌前緣 (Midpoint between ST9 & ST11).",
    needling: "直刺 0.3 - 0.5 寸。可灸。",
    actions: "利咽寬胸 (Benefits Throat)、降氣平喘 (Alleviates Cough & Wheezing).",
    indications: "咽喉腫痛、失音、咳嗽、氣喘、癭氣。",
    notes: "【課件考綱精華】咽喉腫痛與咳嗽氣喘局部要穴。"
  },
  {
    code: "ST11",
    nameZh: "氣舍 (Qishe)",
    nameEn: "Abode of Qi",
    category: "局部要穴 (Local Point)",
    location: "頸部，鎖骨內側端上緣，胸鎖乳突肌胸骨頭與鎖骨頭之間 (Superior border of clavicle, between sternal & clavicular heads of SCM).",
    needling: "直刺 0.3 - 0.5 寸。⚠️ 避免深刺入胸腔。可灸。",
    actions: "利咽降逆 (Benefits Throat & Descends Qi)、理氣止痛 (Regulates Qi).",
    indications: "咽喉腫痛、癭瘤、瘰癧、氣喘、呃逆（打嗝）、頸項強痛。",
    notes: "【課件考綱精華】呃逆與咽喉腫痛、頸項強痛要穴。"
  },
  {
    code: "ST12",
    nameZh: "缺盆 (Quepen)",
    nameEn: "Empty Basin",
    category: "諸陽經交會總樞紐 (Intersection Point of All Yang Channels)",
    location: "鎖骨上窩中央，鎖骨頭上緣凹陷中，距前正中線4寸 (In supraclavicular fossa, 4 cun lateral to midline).",
    needling: "直刺 0.3 - 0.5 寸。⚠️ 嚴禁深刺（深刺可穿透胸膜引致氣胸 Pneumothorax danger）。",
    actions: "宣肺降氣 (Descends LU Qi)、通絡止痛 (Alleviates Pain).",
    indications: "咳嗽、氣喘、咽喉腫痛、缺盆中痛、胸滿、瘰癧、肩臂酸痛。",
    notes: "【課件考綱精華】諸陽經入胸腹之總門戶；⚠️ 針刺極高風險，嚴禁深刺！"
  },
  {
    code: "ST13",
    nameZh: "氣戶 (Qihu)",
    nameEn: "Door of Qi",
    category: "胸部要穴 (Chest Point)",
    location: "鎖骨下緣，前正中線旁開4寸 (Below clavicle, 4 cun lateral to midline).",
    needling: "斜刺或平刺 0.5 - 0.8 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "寬胸理氣 (Regulates Chest Qi)、止咳平喘 (Alleviates Cough).",
    indications: "咳嗽、氣喘、呃逆、胸痛、胸脅支滿。",
    notes: "【課件考綱精華】胸脅支滿與咳嗽氣喘。"
  },
  {
    code: "ST14",
    nameZh: "庫房 (Kufang)",
    nameEn: "Storehouse",
    category: "胸部要穴 (Chest Point)",
    location: "第1肋間隙，前正中線旁開4寸 (1st intercostal space, 4 cun lateral).",
    needling: "斜刺或平刺 0.5 - 0.8 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "理氣寬胸 (Regulates Qi)、清熱排膿 (Clears Heat & Purgative).",
    indications: "咳嗽、氣喘、咳唾膿血、胸脅脹痛。",
    notes: "【課件考綱精華】肺熱咳唾膿血（肺癰/肺部感染）。"
  },
  {
    code: "ST15",
    nameZh: "屋翳 (Wuyi)",
    nameEn: "Roof Room",
    category: "胸部與乳疾要穴 (Chest & Breast Point)",
    location: "第2肋間隙，前正中線旁開4寸 (2nd intercostal space, 4 cun lateral).",
    needling: "斜刺或平刺 0.5 - 0.8 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "宣肺止咳 (Promotes LU Descending)、疏肝通乳 (Benefits Breasts).",
    indications: "咳嗽、氣喘、咳唾膿血、胸脅脹痛、乳癰（乳腺炎）、乳癖（乳腺增生/塊）。",
    notes: "【課件考綱精華】乳腺炎與乳腺增生要穴。"
  },
  {
    code: "ST16",
    nameZh: "膺窗 (Yingchuang)",
    nameEn: "Breast Window",
    category: "胸部與乳疾要穴 (Chest & Breast Point)",
    location: "第3肋間隙，前正中線旁開4寸 (3rd intercostal space, 4 cun lateral).",
    needling: "斜刺或平刺 0.5 - 0.8 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "寬胸理氣 (Regulates Qi)、消腫通乳 (Reduces Swelling in Breasts).",
    indications: "咳嗽、氣喘、胸脅脹痛、乳癰、乳痛。",
    notes: "【課件考綱精華】乳房脹痛與乳腺炎。"
  },
  {
    code: "ST17",
    nameZh: "乳中 (Ruzhong)",
    nameEn: "Breast Center",
    category: "解剖標誌穴 (Anatomical Landmark Only) · ⚠️ 禁針禁灸",
    location: "乳頭中央，第4肋間隙，距前正中線4寸 (Center of nipple, 4th intercostal space).",
    needling: "⚠️ 嚴禁針刺，⚠️ 嚴禁艾灸 (Prohibited from Needling & Moxa). 僅作胸腹解剖定位標誌。",
    actions: "不作針灸治療 (Landmark only).",
    indications: "難產（僅作解剖基準）。",
    notes: "【課件考綱精華】⚠️ 禁針禁灸！僅作第4肋間隙與旁開4寸之體表定位標誌。"
  },
  {
    code: "ST18",
    nameZh: "乳根 (Rugen)",
    nameEn: "Breast Root",
    category: "乳疾第一要穴 (Primary Breast Point)",
    location: "乳頭直下，第5肋間隙，前正中線旁開4寸 (5th intercostal space, directly below nipple).",
    needling: "斜刺或平刺 0.5 - 0.8 寸。⚠️ 嚴禁深刺。可灸。",
    actions: "通乳消腫 (Benefits Breasts & Promotes Lactation)、寬胸理氣 (Regulates Chest Qi).",
    indications: "乳癰、乳癖、乳少（產後缺乳）、咳嗽、氣喘、呃逆、胸痛。",
    notes: "【課件考綱精華】產後催乳（乳少）與乳腺炎第一要穴。"
  },
  {
    code: "ST19",
    nameZh: "不容 (Burong)",
    nameEn: "Not Contained",
    category: "上腹要穴 (Upper Abdomen Point)",
    location: "上腹部，臍中上6寸，前正中線旁開2寸 (6 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "和胃降逆 (Harmonizes Stomach & Descends Rebellious Qi)、理氣止痛 (Alleviates Pain).",
    indications: "嘔吐、胃痛、納少（食欲不振）、腹脹、吐血、腹瀉。",
    notes: "【課件考綱精華】胃痛與嘔吐、食欲不振。"
  },
  {
    code: "ST20",
    nameZh: "承滿 (Chengman)",
    nameEn: "Assuming Fullness",
    category: "上腹要穴 (Upper Abdomen Point)",
    location: "上腹部，臍中上5寸，前正中線旁開2寸 (5 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "和胃消食 (Harmonizes Stomach & Food Stagnation)、理氣止痛 (Alleviates Pain).",
    indications: "胃痛、吐血、納少、腹脹、嘔吐。",
    notes: "【課件考綱精華】胃脹飽滿、食滯胃痛。"
  },
  {
    code: "ST21",
    nameZh: "梁門 (Liangmen)",
    nameEn: "Beam Gate",
    category: "潰瘍與胃病要穴 (Gastric Ulcer & Digestion Point)",
    location: "上腹部，臍中上4寸（平中脘CV12），前正中線旁開2寸 (4 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "健脾和胃 (Fortifies Spleen & Harmonizes ST)、消積止痛 (Clears Food Stagnation & Pain).",
    indications: "胃痛、胃潰瘍、腹脹、納少、嘔吐、腹瀉、胃炎。",
    notes: "【課件考綱精華】胃痛與胃潰瘍要穴；常配中脘 CV21、足三里 ST36。"
  },
  {
    code: "ST22",
    nameZh: "關門 (Guanmen)",
    nameEn: "Pass Gate",
    category: "中腹要穴 (Mid-Abdomen Point)",
    location: "上腹部，臍中上3寸，前正中線旁開2寸 (3 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "健脾利濕 (Fortifies Spleen & Drains Damp)、理腸止瀉 (Harmonizes Intestines).",
    indications: "腹脹、腹痛、腸鳴、腹瀉、水腫、小便不利。",
    notes: "【課件考綱精華】腹脹腸鳴與腹瀉水腫。"
  },
  {
    code: "ST23",
    nameZh: "太乙 (Taiyi)",
    nameEn: "Supreme Unity",
    category: "神志與腸胃要穴 (Shen & Abdomen Point)",
    location: "上腹部，臍中上2寸，前正中線旁開2寸 (2 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "清心安神 (Calms Spirit)、和胃理腸 (Harmonizes Stomach & Intestines).",
    indications: "腹痛、腹脹、心煩、癲狂、吐血、遺尿。",
    notes: "【課件考綱精華】癲狂神志病與腸胃氣滯心煩。"
  },
  {
    code: "ST24",
    nameZh: "滑肉門 (Huaroumen)",
    nameEn: "Slippery Flesh Gate",
    category: "神志與胃痛要穴 (Shen & Stomach Point)",
    location: "上腹部，臍中上1寸，前正中線旁開2寸 (1 cun above umbilicus, 2 cun lateral).",
    needling: "直刺 0.8 - 1.2 寸。可灸。",
    actions: "清心安神 (Calms Spirit)、降逆和胃 (Harmonizes ST & Descends Qi).",
    indications: "腹痛、腹脹、嘔吐、癲狂、舌強、吐血。",
    notes: "【課件考綱精華】神志癲狂與胃氣上逆嘔吐。"
  },
  {
    code: "ST25",
    nameZh: "天樞 (Tianshu)",
    nameEn: "Celestial Pivot",
    category: "大腸之募穴 (Front-Mu Point of Large Intestine) · 腸道第一要穴",
    location: "臍中旁開2寸 (Level with center of umbilicus, 2 cun lateral).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "雙向調節腸道 (Bi-directional Regulation of Intestines)、理氣消滯 (Clears Stagnation)、調經止痛 (Regulates Menses).",
    indications: "腹痛、腹脹、便秘、腹瀉、痢疾、腸癰（闌尾炎）、月經不調、痛經、不孕症。",
    notes: "【課件考綱精華】① 大腸募穴：腸道病變第一要穴（便秘與腹瀉雙向調節）。② 急性闌尾炎（腸癰）要穴。③ 婦科痛經與月經不調。"
  },
  {
    code: "ST26",
    nameZh: "外陵 (Wailing)",
    nameEn: "Outer Mound",
    category: "下腹要穴 (Lower Abdomen Point)",
    location: "下腹部，臍中下1寸，前正中線旁開2寸 (1 cun below umbilicus, 2 cun lateral).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "理氣止痛 (Regulates Qi & Alleviates Pain)、通腑散結 (Dispels Stagnation).",
    indications: "腹痛、疝氣痛、痛經、月經不調。",
    notes: "【課件考綱精華】下腹痛與疝氣痛、痛經。"
  },
  {
    code: "ST27",
    nameZh: "大巨 (Daju)",
    nameEn: "Great Gigantic",
    category: "泌尿生殖要穴 (Urogenital Point)",
    location: "下腹部，臍中下2寸，前正中線旁開2寸 (2 cun below umbilicus, 2 cun lateral).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "固精利尿 (Consolidates Essence & Benefits Urination)、理氣散結 (Regulates Qi).",
    indications: "小腹脹滿、小便不利、疝氣、遺精、早洩、驚悸。",
    notes: "【課件考綱精華】男科遺精早洩與小便不利。"
  },
  {
    code: "ST28",
    nameZh: "水道 (Shuidao)",
    nameEn: "Water Passage",
    category: "水腫與婦科要穴 (Edema & Gynecological Point)",
    location: "下腹部，臍中下3寸（平關元CV4），前正中線旁開2寸 (3 cun below umbilicus, 2 cun lateral).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "通調水道 (Opens & Regulates Water Passages)、利尿消腫 (Drains Damp & Edema)、調經止痛 (Benefits Uterus & Menses).",
    indications: "小腹脹滿、小便不利、水腫（腹水/下肢水腫）、疝氣、痛經、不孕症、腹痛。",
    notes: "【課件考綱精華】利水消腫（通調水道）與婦科不孕、痛經要穴。"
  },
  {
    code: "ST29",
    nameZh: "歸來 (Guilai)",
    nameEn: "Return",
    category: "婦科與男科要穴 (Gynecological & Reproductive Point)",
    location: "下腹部，臍中下4寸（平中極CV3），前正中線旁開2寸 (4 cun below umbilicus, 2 cun lateral).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "溫經散寒 (Warms Channels & Dispels Cold)、調經止痛 (Regulates Menses)、昇提下陷 (Raises Prolapse).",
    indications: "小腹痛、疝氣、月經不調、痛經、帶下、陰挺（子宮脫垂）、陽痿。",
    notes: "【課件考綱精華】溫經散寒治冷痛、子宮脫垂（歸來）與月經不調第一要穴。"
  },
  {
    code: "ST30",
    nameZh: "氣衝 (Qichong)",
    nameEn: "Rushing Qi",
    category: "衝脈交會穴 · 氣海穴之一 · 宗筋要穴",
    location: "下腹部，恥骨聯合上緣旁開2寸，氣衝動脈搏動處 (2 cun lateral to midline at superior border of pubic symphysis).",
    needling: "直刺 0.5 - 1.0 寸。⚠️ 避開動脈。可灸。",
    actions: "調衝任 (Harmonizes Chong & Ren Vessels)、理氣散寒 (Dispels Cold & Regulates Qi)、舒宗筋 (Benefits Groin).",
    indications: "腸鳴腹痛、疝氣、月經不調、不孕症、陽痿、陰腫（外陰腫痛）、滯產。",
    notes: "【課件考綱精華】衝脈起點交會；疝氣與婦科男科生殖氣滯寒凝。"
  },
  {
    code: "ST31",
    nameZh: "髀關 (Biguan)",
    nameEn: "Thigh Gate",
    category: "下肢要穴 (Lower Limb Local Point)",
    location: "大腿前面，髂前上棘與髌底外側端連線上，縫匠肌與股直肌外側緣凹陷中 (On line connecting ASIS & lateral patella border).",
    needling: "直刺 1.0 - 2.0 寸。可灸。",
    actions: "祛風除濕 (Dispels Wind-Damp)、通經活絡 (Activates Channel)、利腰膝 (Benefits Lumbar & Knee).",
    indications: "下肢痿痺、腰痛、膝冷、股外側皮神經炎、髁關節痛。",
    notes: "【課件考綱精華】下肢癱瘓、麻木痛與膝冷。"
  },
  {
    code: "ST32",
    nameZh: "伏兔 (Futu)",
    nameEn: "Crouching Rabbit",
    category: "下肢要穴 (Lower Limb Local Point)",
    location: "大腿前面，髂前上棘與髌底外側端連線上，髌底上6寸 (6 cun above lateral border of patella).",
    needling: "直刺 1.0 - 2.0 寸。可灸。",
    actions: "疏風祛濕 (Dispels Wind-Damp)、通經活絡 (Activates Channel).",
    indications: "下肢痿痺、腰痛、膝冷、疝氣、腳氣（腳氣病/下肢水腫麻木）。",
    notes: "【課件考綱精華】股四頭肌麻木痛與腳氣、腰膝冷痛。"
  },
  {
    code: "ST33",
    nameZh: "陰市 (Yinshi)",
    nameEn: "Yin Market",
    category: "局部要穴 (Local Point)",
    location: "大腿前面，髌底上3寸，股直肌腱外側 (3 cun above lateral border of patella).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "溫經散寒 (Warms Channels & Dispels Cold)、利膝關節 (Benefits Knee).",
    indications: "下肢痿痺、膝關節屈伸不利、膝冷痛、疝氣、水腫。",
    notes: "【課件考綱精華】膝關節寒痛與屈伸不利。"
  },
  {
    code: "ST34",
    nameZh: "梁丘 (Liangqiu)",
    nameEn: "Beam Mound",
    category: "郄穴 (Xi-Cleft Point of Stomach Channel) · 急性胃痛與胃痙攣要穴",
    location: "大腿前面，髌底上2寸，股直肌腱外側 (2 cun above lateral border of patella).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "和胃止痛 (Harmonizes ST & Alleviates Acute Pain)、理氣散結 (Moderates Acute Conditions)、利膝關節 (Benefits Knee).",
    indications: "急性胃痛、胃痙攣、膝腫痛、下肢不遂、乳癰、乳痛、胃潰瘍發作。",
    notes: "【課件考綱精華】① 郄穴：專治急性劇烈胃痛、胃痙攣與乳腺炎急性痛。② 按診切診：梁丘壓痛緊張提示胃潰瘍或胃部占位。"
  },
  {
    code: "ST35",
    nameZh: "犢鼻 (Dubi)",
    nameEn: "Calf's Nose",
    category: "膝關節第一要穴 (Primary Knee Point)",
    location: "屈膝，髌骨下緣，髌韌帶外側凹陷中 (In depression lateral to patellar ligament).",
    needling: "向內上方斜刺 1.0 - 1.5 寸。可灸。",
    actions: "通經活絡 (Activates Channel)、疏風散寒 (Dispels Wind-Cold)、利膝關節 (Benefits Knee Joint).",
    indications: "膝痛、屈伸不利、下肢麻木膝關節炎、鶴膝風。",
    notes: "【課件考綱精華】膝關節退化、關節炎與痛腫第一要穴。"
  },
  {
    code: "ST36",
    nameZh: "足三里 (Zusanli)",
    nameEn: "Leg Three Miles",
    category: "五輸穴之合穴 (He-Sea - 土穴/本穴) · 六腑下合穴(胃) · 全身第一強壯穴 · 四總穴",
    location: "犢鼻(ST35)下3寸，脛骨前緣外側一橫指（中指） (3 cun below ST35, 1 finger-breadth lateral to anterior tibia border).",
    needling: "直刺 1.0 - 2.0 寸。強壯保健宜大艾炷灸。",
    actions: "大補後天脾胃氣血 (Major Tonification Point for Qi & Blood)、健脾和胃 (Fortifies SP & ST)、扶正培元 (Boosts Immunity & Lifespan)、理腸消滯 (Harmonizes Intestines)、通經活絡 (Activates Channel).",
    indications: "胃痛、嘔吐、噎膈、腹脹、腹瀉、痢疾、便秘、水腫、心悸、高血壓、虛勞羸瘦、下肢痿痺、癲狂、乳癰、腸癰、全身強壯保健。",
    notes: "【課件考綱精華】① 全身第一強壯穴（若要身體安，三里常不乾）：長壽保健、大補氣血、提升免疫力。② 六腑下合穴治胃病：胃痛、嘔吐、潰瘍、消化不良。③ 四總穴（肚腹三里留）。"
  },
  {
    code: "ST37",
    nameZh: "上巨虛 (Shangjuxu)",
    nameEn: "Upper Great Void",
    category: "六腑下合穴 (Lower He-Sea Point of Large Intestine) · 腸道要穴",
    location: "犢鼻(ST35)下6寸，脛骨前緣外側一橫指 (6 cun below ST35).",
    needling: "直刺 1.0 - 2.0 寸。可灸。",
    actions: "通調大腸 (Harmonizes Large Intestine)、清熱利濕 (Clears Heat & Drains Damp)、理氣止痛 (Alleviates Abdominal Pain).",
    indications: "腸鳴、腹痛、腹瀉、便秘、腸癰（闌尾炎）、痢疾、下肢痿痺痛。",
    notes: "【課件考綱精華】大腸下合穴：專治大腸腸道急性積滯、腹瀉、便秘與闌尾炎 (Appendicitis)。"
  },
  {
    code: "ST38",
    nameZh: "條口 (Tiaokou)",
    nameEn: "Ribbon Opening",
    category: "肩痛特效遠道穴 (Empirical Point for Shoulder Pain)",
    location: "犢鼻(ST35)下8寸，脛骨前緣外側一橫指 (8 cun below ST35).",
    needling: "直刺 1.0 - 1.5 寸（常透刺山皇/承山 BL57）。可灸。",
    actions: "舒筋活絡 (Relaxes Sinews & Activates Channel)、通利肩臂 (Benefits Shoulder & Arm).",
    indications: "肩臂痛、五十肩（肩關節活動受限不能舉）、轉筋、脘腹疼痛、下肢痿痺。",
    notes: "【課件考綱精華】五十肩（肩周炎）遠道透刺特效穴（運動針法：針條口令患者活動肩部）。"
  },
  {
    code: "ST39",
    nameZh: "下巨虛 (Xiajuxu)",
    nameEn: "Lower Great Void",
    category: "六腑下合穴 (Lower He-Sea Point of Small Intestine)",
    location: "犢鼻(ST35)下9寸（條口下1寸），脛骨前緣外側一橫指 (9 cun below ST35).",
    needling: "直刺 1.0 - 2.0 寸。可灸。",
    actions: "通調小腸 (Harmonizes Small Intestine)、清熱利濕 (Clears Heat & Drains Damp)、安神止痛 (Alleviates Pain).",
    indications: "腹瀉、痢疾、小腹痛、小腸氣痛（疝氣）、腰脊痛引睪丸、乳癰、下肢痿痺。",
    notes: "【課件考綱精華】小腸下合穴：專治小腸氣痛、小腹痛、腹瀉與乳腺炎。"
  },
  {
    code: "ST40",
    nameZh: "豐隆 (Fenglong)",
    nameEn: "Abundant Bulge",
    category: "絡穴 (to SP) · 全身化痰第一要穴 (Primary Phlegm Resolving Point)",
    location: "外踝尖上8寸，條口穴(ST38)外側一橫指，脛骨前緣外兩橫指 (8 cun above external malleolus, 1 finger-breadth lateral to ST38).",
    needling: "直刺 1.0 - 1.5 寸。可灸。",
    actions: "化有形無形之痰 (Primary Point to Resolve Phlegm)、和胃降逆 (Harmonizes Stomach)、清心安神 (Calms Spirit)、宣肺平喘 (Descends LU Qi).",
    indications: "咳嗽痰多、哮喘、胸悶、頭痛眩暈（痰濁中阻）、癲狂（痰迷心竅）、梅核氣、肥胖、高血脂、便秘、下肢痿痺。",
    notes: "【課件考綱精華】① 全身化痰第一要穴（化有形之痰如咳痰，無形之痰如眩暈高血脂癲狂）。② 配穴：SP3 (原/主) + ST40 (絡/客) 健脾化痰金三角。"
  },
  {
    code: "ST41",
    nameZh: "解溪 (Jiexi)",
    nameEn: "Ravine Divide",
    category: "五輸穴之經穴 (Jing-River - 火穴/母穴 Fire/Mother Point)",
    location: "足背踝關節橫紋中央，拇長伸肌腱與趾長伸肌腱之間 (On ankle crease, between EPL & EDC tendons).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "清胃熱 (Clears ST Heat)、安神定志 (Calms Spirit)、利踝關節 (Benefits Ankle).",
    indications: "下肢痿痺、踝關節病、足下垂、頭痛、眩暈、癲狂、腹脹、便秘、面腫。",
    notes: "【課件考綱精華】母穴（火生土）：補胃經氣血；足下垂與踝關節痛要穴。"
  },
  {
    code: "ST42",
    nameZh: "衝陽 (Chongyang)",
    nameEn: "Surging Yang",
    category: "原穴 (Yuan-Source Point) · 出口穴 (Exit Point)",
    location: "足背最高處，足背動脈搏動處，第2、3跖骨基底部與楔骨之間 (On dorsum of foot, in depression between 2nd/3rd metatarsal & cuneiform, over dorsalis pedis artery).",
    needling: "避開動脈，直刺 0.3 - 0.5 寸。可灸。",
    actions: "和胃化滯 (Harmonizes ST & Food Stagnation)、安神定志 (Calms Shen)、通絡止痛 (Activates Channel).",
    indications: "胃痛、口眼歪斜、癲狂癇、足痿無力、足背腫痛、齒痛。",
    notes: "【課件考綱精華】原穴診脈（衝陽脈）；主客原絡 ST42 (原/主) + SP4 (絡/客) 配穴。"
  },
  {
    code: "ST43",
    nameZh: "陷谷 (Xiangu)",
    nameEn: "Sunken Valley",
    category: "五輸穴之輸穴 (Shu-Stream - 木穴 Wood Point)",
    location: "足背，第2、3跖骨結合部前方凹陷處 (In depression proximal to 2nd & 3rd metatarsophalangeal joints).",
    needling: "直刺或斜刺 0.5 - 0.8 寸。可灸。",
    actions: "清熱利濕 (Clears Heat & Drains Damp)、消腫止痛 (Reduces Swelling).",
    indications: "面腫、全身水腫、足背腫痛、腸鳴腹痛、熱病無汗。",
    notes: "【課件考綱精華】輸穴主體重節痛：利水消腫（面腫足腫）與陽明熱盛。"
  },
  {
    code: "ST44",
    nameZh: "內庭 (Neiting)",
    nameEn: "Inner Court",
    category: "五輸穴之滎穴 (Ying-Spring - 水穴 Water) · 清胃火第一要穴",
    location: "足背，第2、3趾間，趾蹼緣後方赤白肉際處 (Between 2nd & 3rd toes, proximal to web margin).",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "清瀉胃火 (Clears Stomach Fire)、和胃降逆 (Harmonizes ST)、通絡止痛 (Alleviates Pain).",
    indications: "齒痛（上頜牙痛特效）、咽喉腫痛、鼻衄、吐酸、口臭、胃熱消穀善飢、腹瀉、便秘、足背腫痛、跖趾關節痛。",
    notes: "【課件考綱精華】① 清瀉胃火第一要穴：口臭、上頜牙痛（配 LI4）、胃熱牙痛、消穀善飢。② 滎穴主身熱。"
  },
  {
    code: "ST45",
    nameZh: "厲兌 (Lidui)",
    nameEn: "Strict Exchange",
    category: "五輸穴之井穴 (Jing-Well - 金穴/瀉穴) · 醒腦安神要穴",
    location: "足第2趾外側，趾甲角旁0.1寸 (Lateral side of 2nd toe, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或點刺出血。可灸。",
    actions: "清胃熱瀉陽明 (Clears ST Heat)、醒腦開竅 (Revives Shen)、安神定志 (Calms Spirit - Nightmares).",
    indications: "鼻衄、齒痛、咽喉腫痛、神志病、多夢噩夢、癲狂、熱病、足急腫痛。",
    notes: "【課件考綱精華】井穴瀉穴：清瀉胃經極熱；鎮靜安神治多夢噩夢與癲狂。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Stomach Channel (ST) with full 45 points, Luo channel, Dermatome, and Palpation Segmental Diagnosis!');

/**
 * scratch/enrich_ki_untruncated.js
 * Re-populate KI1-KI27 with 100% complete, un-truncated, full clinical text from curriculum notes
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

kiChannel.points_curriculum = [
  {
    code: "KI1",
    nameZh: "湧泉 (Yongquan)",
    nameEn: "Gushing Spring",
    category: "五輸穴之井穴 (Jing-Well - 木穴 Wood Point) · 降頂心急火與醒腦第一要穴",
    location: "足底前1/3與後2/3連線交點處，屈趾時足前凹陷中 (On sole, in depression with foot in plantar flexion; At junction of anterior 1/3 and posterior 2/3 of line connecting base of 2nd & 3rd toes with heel).",
    needling: "直刺 0.3 - 0.5 寸 (Perpendicular 0.3-0.5 inch)。可灸 (Moxibustion Applicable)。",
    actions: "降頂心急火平肝 (Descends excess from the head)、平息肝陽肝火 (LV Yang Rising / LV Fire)、平息心神 (Calms the spirit)、開竅甦厥 (Revives consciousness)、回陽救逆 (Rescues yang).",
    indications: "頭痛、目眩、視物模糊、咽喉腫痛、舌乾口燥、失音、小便不利、小兒驚风、足心發熱、昏迷厥逆。平肝瀉火：肝陽上亢或肝火上炎致高血壓、頭痛、耳鳴、癲癇。清瀉腎虛熱：慢性咽喉痛、口乾、腰痛。滋補腎心陰：失眠、心悸、焦慮、健忘、狂躁善怒欲殺、潮熱、盜汗。神志厥逆、陽氣暴脫。",
    notes: "【課件考綱精華】① 降頂心急火第一要穴（平肝陽、降高血壓、頭痛耳鳴）。② 井穴急救醒腦甦厥與回陽救逆。③ 滋補腎心陰治失眠心悸與潮熱盜汗。④ 醫學氣功要穴：連結大地之氣 (Connects to Earth)."
  },
  {
    code: "KI2",
    nameZh: "然谷 (Rangu)",
    nameEn: "Blazing Valley",
    category: "五輸穴之滎穴 (Ying-Spring - 火穴/本穴 Fire Point)",
    location: "足內側緣，舟骨粗隆下方凹陷中 (Anterior and inferior to medial malleolus, in depression on lower border of tuberosity of navicular bone).",
    needling: "直刺 0.3 - 0.5 寸 (Perpendicular 0.3-0.5 inch)。可灸 (Moxibustion Applicable)。",
    actions: "清瀉陰虛火熱 (Clears deficiency heat)、滋陰調腎 (Regulates the Kidneys)、理下焦 (Regulates the lower jiao).",
    indications: "陰癢 (Pruritus vulvae)、子宮脫垂 (Prolapse of uterus)、月經不調 (Irregular menstruation)、夢遺 (Nocturnal emission)、咯血 (Hemoptysis)、口渴 (Thirst)、腹瀉 (Diarrhea)、足背腫痛 (Swelling and pain of dorsum of foot)、小兒臍風發炎 (Acute infantile omphalitis)。滎穴清虛熱：慢性咽喉痛、心煩易怒、陰虛盜汗、消渴（糖尿病口渴多飲）、情緒不寧、懼怕被捕恐懼症 (Fear of being apprehended)。",
    notes: "【課件考綱精華】① 滎穴（火穴）：專清腎經陰虛火熱（慢性咽乾、陰虛盜汗、消渴口渴、陰癢）。② 調理衝任與下焦生殖病症。"
  },
  {
    code: "KI3",
    nameZh: "太溪 (Taixi)",
    nameEn: "Great Ravine",
    category: "原穴 (Yuan-Source) · 輸穴 (Shu-Stream - 土穴 Earth Point) · 全身滋陰補腎第一要穴",
    location: "足內側，內踝尖與跟腱之間的凹陷中 (In depression midway between tip of medial malleolus and attachment of Achilles tendon).",
    needling: "直刺 0.5 - 0.8 寸 (Perpendicular 0.5-0.8 inch)。可灸 (Moxibustion Applicable)。",
    actions: "大補腎陰 (Nourishes Kidney Yin)、清瀉虛熱 (Clears deficiency heat)、大補腎陽 (Tonifies Kidney Yang)、納氣平喘 (Anchors the Qi and benefits the Lung)、強腰健骨 (Strengthens the lumbar spine).",
    indications: "咽喉腫痛、牙痛、耳鳴、耳聾、頭眩、咯血、氣喘、口渴、月經不調、失眠、夢遺、陽痿、尿頻、腰脊酸痛、足跟痛。補腎納氣：腎虛不納氣之哮喘（吸氣困難）。補三臟之陰：補腎陰（慢性咽痛、虛熱）、補肝陰（頭眩、耳鳴、頭痛）、補心陰（焦慮、失眠、多夢）。補腎陽：腎陽虛腰痛寒冷。",
    notes: "【課件考綱精華】① 全身滋陰補腎第一要穴（原穴輸穴）：不論腎陰虛、腎陽虛、腎氣虛均可大補。② 補腎納氣治吸氣困難之哮喘。③ 補心肝腎三臟之陰。"
  },
  {
    code: "KI4",
    nameZh: "大鐘 (Dazhong)",
    nameEn: "Large Goblet",
    category: "絡穴 (Luo-Connecting Point to Bladder Channel)",
    location: "足內側，內踝後下方，跟腱附著部內側前方凹陷中 (Posterior & inferior to medial malleolus, in depression anterior to medial attachment of Achilles tendon).",
    needling: "直刺 0.3 - 0.5 寸 (Perpendicular 0.3-0.5 inch)。可灸 (Moxibustion Applicable)。",
    actions: "補腎納氣 (Reinforces the Kidneys & Anchors the Qi)、清肺平喘 (Benefits the Lung)、益志祛恐 (Strengthens the will & Dispels fear).",
    indications: "咯血 (Spitting of blood)、氣喘 (Asthma)、腰脊強痛 (Stiffness and pain of lower back)、小便不利 (Dysuria)、便秘 (Constipation)、足跟痛 (Pain in heel)、癡呆神志遲鈍 (Dementia)。絡穴調表裡：慢性腎虛腰痛、足跟扭傷與疼痛、精神膽怯恐懼。",
    notes: "【課件考綱精華】① 絡穴：補腎納氣治吸氣困難之慢性哮喘與慢性腰痛。② 益志祛恐：治療精神膽怯恐懼與癡呆健忘。"
  },
  {
    code: "KI5",
    nameZh: "水泉 (Shuiquan)",
    nameEn: "Water Spring",
    category: "郄穴 (Xi-Cleft Point of Kidney Channel) · 婦科痛經要穴",
    location: "足內側，太溪(KI3)直下1寸，跟骨結節內側凹陷中 (1 cun directly below KI3, in depression on medial side of tuberosity of calcaneum).",
    needling: "直刺 0.3 - 0.5 寸 (Perpendicular 0.3-0.5 inch)。可灸 (Moxibustion Applicable)。",
    actions: "調理衝任 (Regulates Penetrating & Conception vessels)、通經止痛 (Benefits menstruation & Alleviates pain)、緩和婦科急痛 (Moderates acute conditions).",
    indications: "閉經 (Amenorrhea)、月經不調 (Irregular menstruation)、痛經 (Dysmenorrhea)、子宮脫垂 (Prolapse of uterus)、小便不利 (Dysuria)、視物模糊 (Blurring of vision)、心下壓迫悶脹感 (Sensation of oppression below heart)。滋養陰血、活血動宮。",
    notes: "【課件考綱精華】① 郄穴：專治婦科急性痛經、閉經與下腹急痛發作。② 活血動宮與調理衝任。"
  },
  {
    code: "KI6",
    nameZh: "照海 (Zhaohai)",
    nameEn: "Shining Sea",
    category: "八脈交會穴 (通陰貎脈 Yin Qiao - 配列缺 LU7 通任脈) · 咽喉與失眠要穴",
    location: "足內側，內踝尖正下方凹陷中 (In a depression below tip of medial malleolus).",
    needling: "直刺 0.3 - 0.5 寸 (Perpendicular 0.3-0.5 inch)。可灸 (Moxibustion Applicable)。",
    actions: "利咽通喉 (Benefits the throat)、滋陰清熱 (Nourishes the Kidneys & Clears deficiency heat)、調陰貎脈 (Regulates Yin Motility vessel)、寧心安神 (Calms the spirit)、通利下焦 (Regulates lower jiao).",
    indications: "月經不調、赤白帶下、子宮脫垂、陰癢、尿頻、尿閉、便秘、夜間癲癇發作 (Nighttime epilepsy)、失眠（陰貎盛則目張不眠）、咽喉腫痛（陰虛虛火咽乾痛特效）、哮喘、梅核氣 (Plum Pit Qi)、失音暴瘖、吞咽困難。",
    notes: "【課件考綱精華】① 滋陰清熱利咽喉第一要穴（陰虛虛火咽乾、失音、梅核氣）。② 八脈交會穴通陰貎脈（配列缺 LU7）：治療失眠與夜間癲癇發作。③ 陰虛腸燥便秘。"
  },
  {
    code: "KI7",
    nameZh: "復溜 (Fuliu)",
    nameEn: "Recover Flow",
    category: "五輸穴之經穴 (Jing-River - 金穴/母穴 Metal Point) · 汗液調節與水腫特效穴",
    location: "小腿內側，太溪(KI3)直上2寸，跟腱前緣 (2 cun above KI3 on anterior border of Achilles tendon).",
    needling: "直刺 0.5 - 0.7 寸 (Perpendicular 0.5-0.7 inch)。可灸 (Moxibustion Applicable)。",
    actions: "益腎溫陽 (Benefits the Kidneys)、通調水道 (Regulates water passages & Treats edema)、調汗止汗 (Regulates sweating)、瀉濕清熱 (Drains damp & Clears damp-heat)、強腰健脊 (Strengthens lumbar region).",
    indications: "水腫 (Edema)、腹脹 (Abdominal distension)、腹瀉 (Diarrhea)、腸鳴 (Borborygmus)、下肢痿痺 (Muscular atrophy of leg)、盜汗 (Night sweating)、自汗 (Spontaneous sweating)、熱病無汗 (Febrile diseases without sweating)、五淋尿痛 (Five types of Lin Disorder)。補腎陽利水：慢性腹部與下肢水腫、腎虛腰痛。",
    notes: "【課件考綱精華】① 汗液調節第一特效穴（自汗配合谷 LI4，盜汗配陰隙 HT6）。② 母穴（金生水）：溫補腎陽、通調水道、治水腫與五淋。"
  },
  {
    code: "KI8",
    nameZh: "交信 (Jiaoxin)",
    nameEn: "Intersection Reach",
    category: "陰貎脈之郄穴 (Yin Qiao Xi-Cleft Point)",
    location: "小腿內側，太溪(KI3)直上2寸，復溜(KI7)前0.5寸，脛骨內側緣後方 (0.5 cun anterior to KI7, 2 cun above KI3 posterior to medial border of tibia).",
    needling: "直刺 0.5 - 0.7 寸 (Perpendicular 0.5-0.7 inch)。可灸 (Moxibustion Applicable)。",
    actions: "調理衝任 (Regulates Conception & Penetrating vessels)、調經止崩 (Adjusts menstruation & Stops uterine bleeding)、清熱利濕 (Clears heat & drains damp from lower jiao).",
    indications: "月經不調 (Irregular menstruation)、痛經 (Dysmenorrhea)、崩漏 (Uterine bleeding)、子宮脫垂 (Prolapse of uterus)、腹瀉 (Diarrhea)、便秘 (Constipation)、睪丸腫痛 (Pain and swelling of testes)、下肢內側扭傷腫痛 (Ankle & lower limb sprain).",
    notes: "【課件考綱精華】陰貎脈郄穴：專治崩漏（功能性子宮大出血）、痛經與下肢內側筋骨扭傷。"
  },
  {
    code: "KI9",
    nameZh: "築賓 (Zhubin)",
    nameEn: "Guest House",
    category: "陰維脈之郄穴 (Yin Wei Xi-Cleft Point) · 全身排毒與神志要穴",
    location: "小腿內側，太溪(KI3)直上5寸，腓腸肌肌腹下端 (5 cun above KI3 on line from KI3 to KI10, lower end of belly of gastrocnemius).",
    needling: "直刺 0.5 - 0.7 寸 (Perpendicular 0.5-0.7 inch)。可灸 (Moxibustion Applicable)。",
    actions: "清心化痰 (Clears Heart & transforms phlegm)、理氣安神 (Regulates Qi & Calms spirit)、解毒排毒 (Detoxification point)、緩和急痛 (Alleviates pain).",
    indications: "癲狂 (Mental disorders)、精神錯亂狂躁怒罵 (Strong spirit disorders - anger, cursing, mania)、足小腿痛 (Pain in foot and lower leg)、疝氣 (Hernia / Shan disorder)、陰囊縮痛 (Pain/retraction of scrotum)。解毒處方必備穴：協助身體清潔排毒、抒解情志爆發。",
    notes: "【課件考綱精華】① 陰維脈郄穴：全身解毒排毒（Detoxification）必備要穴。② 清心化痰治狂躁怒罵等嚴重神志病。"
  },
  {
    code: "KI10",
    nameZh: "陰谷 (Yingu)",
    nameEn: "Yin Valley",
    category: "五輸穴之合穴 (He-Sea - 水穴/本穴 Water Point)",
    location: "腘窩內側，屈膝時，半腱肌肌腱與半膜肌肌腱之間 (Medial side of popliteal fossa, between tendons of semitendinosus and semimembranosus).",
    needling: "直刺 0.8 - 1.0 寸 (Perpendicular 0.8-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "清瀉下焦濕熱 (Clears damp-heat from lower jiao)、滋陰補腎 (Benefits the Kidneys)、通絡止痛 (Activates channel and alleviates pain).",
    indications: "陽痿 (Impotence)、疝氣 (Hernia)、崩漏 (Uterine bleeding)、小便不利 (Dysuria)、尿急尿痛、陰癢帶下 (Genital pain/itching, leucorrhea)、膝腘窩痛 (Pain in knee & popliteal fossa)、精神錯亂 (Mental disorders)。五行相生：水為木之母，五行針法中補肝要穴。",
    notes: "【課件考綱精華】① 本穴合穴（水穴）：清瀉下焦濕熱（小便赤澀、陰癢、崩漏）。② 五行針法補水生木：補肝第一要穴。"
  },
  {
    code: "KI11",
    nameZh: "橫骨 (Henggu)",
    nameEn: "Pubic Bone",
    category: "衝脈與足少陰交會穴 (Intersection Point w/ Chong Mai)",
    location: "下腹部，臍中下5寸，前正中線旁開0.5寸 (5 cun below umbilicus, 0.5 cun lateral to Ren 2).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "利下焦 (Benefits lower jiao)、通尿固精 (Promotes urination & Astringes essence).",
    indications: "少腹脹痛 (Fullness and pain of lower abdomen)、小便不利 (Dysuria)、遺尿 (Enuresis)、遺精 (Nocturnal emission)、陽痿 (Impotence)、陰部疼痛 (Pain of genitalia)。",
    notes: "【課件考綱精華】衝脈交會穴：前陰痛、少腹痛與遺精陽痿。"
  },
  {
    code: "KI12",
    nameZh: "大赫 (Dahe)",
    nameEn: "Great Manifestation",
    category: "衝脈與足少陰交會穴 · 助孕與男科要穴",
    location: "下腹部，臍中下4寸，前正中線旁開0.5寸 (4 cun below umbilicus, 0.5 cun lateral to Ren 3).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "補腎固精 (Tonifies the Kidneys & Astringes essence)、調理衝任 (Regulates Penetrating & Conception vessels).",
    indications: "遺精 (Nocturnal emission)、陽痿 (Impotence)、赤白帶下 (Morbid leukorrhea)、陰部疼痛 (Pain external genitalia)、子宮脫垂 (Prolapse of uterus)、月經不調 (Irregular menstruation)、痛經 (Dysmenorrhea)、不孕症 (Infertility)。",
    notes: "【課件考綱精華】衝脈交會穴：助孕（治不孕症）與補腎固精第一要穴。"
  },
  {
    code: "KI13",
    nameZh: "氣穴 (Qixue)",
    nameEn: "Qi Hole",
    category: "衝脈與足少陰交會穴",
    location: "下腹部，臍中下3寸，前正中線旁開0.5寸 (3 cun below umbilicus, 0.5 cun lateral to Ren 4).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "調下焦 (Regulates lower jiao)、通利小便 (Benefits lower jiao)、緩急止痛 (Alleviates pain).",
    indications: "小便不利 (Dysuria)、腹痛 (Abdominal pain)、腹瀉 (Diarrhea)、遺精 (Nocturnal emission)、月經不調 (Irregular menstruation)、痛經 (Dysmenorrhea)、產後腹痛 (Postpartum abdominal pain)。",
    notes: "【課件考綱精華】衝脈交會穴：調下焦、痛經與產後腹痛。"
  },
  {
    code: "KI14",
    nameZh: "四滿 (Siman)",
    nameEn: "Fourfold Fullness",
    category: "衝脈與足少陰交會穴",
    location: "下腹部，臍中下2寸，前正中線旁開0.5寸 (2 cun below umbilicus, 0.5 cun lateral to Ren 5).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "理氣活血 (Regulates Qi & Moves blood stasis)、通調水道 (Regulates water passages)、調腸利便 (Regulates intestines).",
    indications: "月經不調 (Irregular menstruation)、腹痛 (Abdominal pain)、便秘 (Constipation)、腹脹 (Abdominal distension)、嘔吐 (Vomiting)、腹瀉 (Diarrhea)、下腹寒凝痛 (Cold/Dry in lower abdomen).",
    notes: "【課件考綱精華】衝脈交會穴：祛腹部血瘀腹脹與便秘。"
  },
  {
    code: "KI15",
    nameZh: "中注 (Zhongzhu)",
    nameEn: "Central Flow",
    category: "衝脈與足少陰交會穴",
    location: "下腹部，臍中下1寸，前正中線旁開0.5寸 (1 cun below umbilicus, 0.5 cun lateral to Ren 7).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "理氣止痛 (Regulates Qi and alleviates pain)、溫調腸胃 (Regulates and warms intestines).",
    indications: "腹痛 (Abdominal pain)、腹瀉 (Diarrhea)、便秘 (Constipation)、五淋尿痛 (Five types of Lin)、疝氣痛 (Shan disorder / Hernia).",
    notes: "【課件考綱精華】衝脈交會穴：溫調腸胃與少腹疝氣痛。"
  },
  {
    code: "KI16",
    nameZh: "肓俞 (Huangshu)",
    nameEn: "Huang Shu",
    category: "衝脈與足少陰交會穴 · 肚臍旁要穴",
    location: "腹部，臍中旁開0.5寸 (0.5 cun lateral to umbilicus, level with Ren 8).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "理氣散結 (Dispels accumulation)、止痛通便 (Alleviates pain & Regulates intestines).",
    indications: "腹痛 (Abdominal pain)、便秘 (Constipation)、嘔吐 (Vomiting)、腹瀉 (Diarrhea)、產後腹痛 (Postpartum abdominal pain)、不孕症 (Sterility)。",
    notes: "【課件考綱精華】衝脈交會穴：肚臍旁理氣止痛與產後腹痛。"
  },
  {
    code: "KI17",
    nameZh: "商曲 (Shangqu)",
    nameEn: "Shang Bend",
    category: "衝脈與足少陰交會穴",
    location: "上腹部，臍中上2寸，前正中線旁開0.5寸 (2 cun above umbilicus, 0.5 cun lateral to Ren 10).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "和胃止痛 (Harmonizes Stomach & Alleviates pain)、祛瘀散結 (Moves blood stasis & Dispels accumulation).",
    indications: "腸鳴 (Borborygmus)、腹痛 (Abdominal pain)、胃痛 (Epigastric pain)、便秘 (Constipation)、嘔吐 (Vomiting)。",
    notes: "【課件考綱精華】衝脈交會穴：和胃止痛與腹痛腹瀉。"
  },
  {
    code: "KI18",
    nameZh: "石關 (Shiguan)",
    nameEn: "Stone Pass",
    category: "衝脈與足少陰交會穴",
    location: "上腹部，臍中上3寸，前正中線旁開0.5寸 (3 cun above umbilicus, 0.5 cun lateral to Ren 11).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "和胃降逆 (Harmonizes Stomach & Lowers rebellion)、理氣止痛 (Regulates Qi & Alleviates pain).",
    indications: "腹痛腹脹 (Abdominal pain and distension)、嘔吐 (Vomiting)、消化不良 (Indigestion)。",
    notes: "【課件考綱精華】衝脈交會穴：和胃降逆止嘔與消化不良。"
  },
  {
    code: "KI19",
    nameZh: "陰都 (Yindu)",
    nameEn: "Yin Metropolis",
    category: "衝脈與足少陰交會穴",
    location: "上腹部，臍中上4寸，前正中線旁開0.5寸 (4 cun above umbilicus, 0.5 cun lateral to Ren 12).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "寬胸理氣 (Unbinds chest & transforms phlegm)、降逆和胃 (Harmonizes Stomach & Lowers rebellion).",
    indications: "腹痛腹脹 (Abdominal pain and distension)、消化不良 (Indigestion)、嘔吐 (Vomiting)、腹瀉 (Diarrhea)、妊娠惡阻嘔吐 (Nausea, morning sickness)。",
    notes: "【課件考綱精華】衝脈交會穴：妊娠惡阻（孕吐）與和胃降逆。"
  },
  {
    code: "KI20",
    nameZh: "腹通谷 (Futonggu)",
    nameEn: "Open Valley",
    category: "衝脈與足少陰交會穴",
    location: "上腹部，臍中上5寸，前正中線旁開0.5寸 (5 cun above umbilicus, 0.5 cun lateral to Ren 13).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。可灸 (Moxibustion Applicable)。",
    actions: "健脾和胃 (Fortifies Spleen & Harmonizes Stomach)、降逆止嘔 (Lowers rebellion).",
    indications: "腹痛腹脹 (Abdominal pain and distension)、嘔吐 (Vomiting)、消化不良 (Indigestion)。",
    notes: "【課件考綱精華】衝脈交會穴：健脾和胃與嘔吐食積。"
  },
  {
    code: "KI21",
    nameZh: "幽門 (Youmen)",
    nameEn: "Dark Gate",
    category: "衝脈與足少陰交會穴",
    location: "上腹部，臍中上6寸，前正中線旁開0.5寸 (6 cun above umbilicus, 0.5 cun lateral to Ren 14).",
    needling: "直刺 0.5 - 0.8 寸 (Perpendicular 0.5-0.8 inch)。⚠️ 避開肝臟 (Avoid Liver). 可灸。",
    actions: "疏肝和胃 (Spreads Liver Qi & Harmonizes Stomach)、利胸脅 (Benefits chest & breasts)、降逆止痛 (Lowers rebellion & Alleviates pain).",
    indications: "腹痛腹脹 (Abdominal pain)、嘔吐 (Vomiting)、晨吐孕吐 (Morning sickness)、胃痛 (Epigastric pain)、乳腺炎 (Mastitis)。",
    notes: "【課件考綱精華】衝脈交會穴：晨吐孕吐與疏肝和胃；避開肝臟。"
  },
  {
    code: "KI22",
    nameZh: "步廊 (Bulang)",
    nameEn: "Corridor Walk",
    category: "胸部要穴 (Chest Local Point)",
    location: "胸部，第5肋間隙，前正中線旁開2寸 (In 5th intercostal space, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "寬胸理氣 (Unbinds the chest)、降逆平喘 (Lowers rebellious Lung & Stomach Qi).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、胸脅脹痛 (Distension and fullness in chest & hypochondriac region)、嘔吐 (Vomiting)。",
    notes: "【課件考綱精華】胸部局部穴：寬胸理氣、降逆平喘。"
  },
  {
    code: "KI23",
    nameZh: "神封 (Shenfeng)",
    nameEn: "Spirit Seal",
    category: "胸部要穴 (Chest Local Point)",
    location: "胸部，第4肋間隙，前正中線旁開2寸 (In 4th intercostal space, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "寬胸理氣 (Unbinds the chest)、降逆平喘 (Lowers rebellious Lung & Stomach Qi)、通乳散結 (Benefits the breasts).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、胸脅脹痛 (Fullness in chest & hypochondriac region)、乳腺炎 (Mastitis)。",
    notes: "【課件考綱精華】胸痛咳嗽與乳腺炎通乳。"
  },
  {
    code: "KI24",
    nameZh: "靈墟 (Lingxu)",
    nameEn: "Spirit Ruins",
    category: "胸部要穴 (Chest Local Point)",
    location: "胸部，第3肋間隙，前正中線旁開2寸 (In 3rd intercostal space, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "寬胸理氣 (Unbinds the chest)、降逆平喘 (Lowers rebellious Lung & Stomach Qi)、通乳散結 (Benefits the breasts).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、胸脅脹痛 (Fullness in chest & hypochondriac region)、乳腺炎 (Mastitis)。",
    notes: "【課件考綱精華】胸痛咳嗽與氣喘。"
  },
  {
    code: "KI25",
    nameZh: "神藏 (Shencang)",
    nameEn: "Spirit Storehouse",
    category: "胸部要穴 (Chest Local Point)",
    location: "胸部，第2肋間隙，前正中線旁開2寸 (In 2nd intercostal space, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "寬胸理氣 (Unbinds the chest)、降逆平喘 (Lowers rebellious Lung & Stomach Qi).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、胸痛 (Chest pain)。",
    notes: "【課件考綱精華】胸痛與咳嗽氣喘。"
  },
  {
    code: "KI26",
    nameZh: "彧中 (Yuzhong)",
    nameEn: "Lively Center",
    category: "胸部要穴 (Chest Local Point)",
    location: "胸部，第1肋間隙，前正中線旁開2寸 (In 1st intercostal space, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "寬胸化痰 (Unbinds chest & Transforms phlegm)、降逆平喘 (Lowers rebellious Lung & Stomach Qi).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、痰多 (Accumulation of phlegm)、胸脅脹痛 (Fullness in chest).",
    notes: "【課件考綱精華】痰多咳嗽與寬胸理氣。"
  },
  {
    code: "KI27",
    nameZh: "俞府 (Shufu)",
    nameEn: "Shu Mansion",
    category: "腎經終點 (Exit Point) · 腎不納氣急喘第一要穴",
    location: "胸部，鎖骨下緣凹陷中，前正中線旁開2寸 (In depression of lower border of clavicle, 2 cun lateral to Ren Channel).",
    needling: "斜刺 0.3 - 0.5 寸 (Obliquely 0.3-0.5 inch)。⚠️ 避免深刺。可灸。",
    actions: "納氣平喘 (Anchors Qi for Breathless / Unbinds chest)、化痰止咳 (Transforms phlegm & Alleviates cough/wheezing)、降逆和胃 (Harmonizes Stomach & Lowers rebellious Qi).",
    indications: "咳嗽 (Cough)、氣喘 (Asthma)、腎不納氣急喘 (Constricted breathing / Adrenal exhaustion)、胸痛 (Chest pain)、嘔吐 (Vomiting)、頸項與下頜拘急 (Jaw pain/tension)。",
    notes: "【課件考綱精華】① 腎經終點。② 腎不納氣急喘與腎虛腎上腺耗竭疲勞（Adrenal exhaustion）第一要穴。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully re-populated KI1-KI27 with 100% untruncated full clinical text!');

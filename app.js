const STORAGE_KEY = "acupoint-atlas-v1";
const CASE_STORAGE_KEY = "acuting-clinical-cases-v1";
const CONTENT_MODE_KEY = "acuting-content-mode-v1";

const standardChannelAudit = {
  generatedOn: "2026-06-16",
  expectedTotal: 361,
  nextRecommendedBatch: "PC1-PC9",
  channels: [
    { code: "LU", name: "Lung", expected: 11 },
    { code: "LI", name: "Large Intestine", expected: 20 },
    { code: "ST", name: "Stomach", expected: 45 },
    { code: "SP", name: "Spleen", expected: 21 },
    { code: "HT", name: "Heart", expected: 9 },
    { code: "SI", name: "Small Intestine", expected: 19 },
    { code: "BL", name: "Bladder", expected: 67 },
    { code: "KI", name: "Kidney", expected: 27 },
    { code: "PC", name: "Pericardium", expected: 9 },
    { code: "TE", name: "Triple Energizer", expected: 23 },
    { code: "GB", name: "Gallbladder", expected: 44 },
    { code: "LR", name: "Liver", expected: 14 },
    { code: "CV", name: "Conception Vessel", expected: 24 },
    { code: "GV", name: "Governing Vessel", expected: 28 }
  ]
};

const channelPrefixMeta = {
  LU: { meridian: "Lung / 肺經", region: "待補", x: 100, y: 200 },
  LI: { meridian: "Large Intestine / 大腸經", region: "待補", x: 80, y: 250 },
  ST: { meridian: "Stomach / 胃經", region: "待補", x: 220, y: 320 },
  SP: { meridian: "Spleen / 脾經", region: "待補", x: 140, y: 440 },
  HT: { meridian: "Heart / 心經", region: "待補", x: 82, y: 260 },
  SI: { meridian: "Small Intestine / 小腸經", region: "待補", x: 68, y: 270 },
  BL: { meridian: "Bladder / 膀胱經", region: "待補", x: 150, y: 360 },
  KI: { meridian: "Kidney / 腎經", region: "待補", x: 150, y: 430 },
  PC: { meridian: "Pericardium / 心包經", region: "待補", x: 58, y: 250 },
  TE: { meridian: "Triple Energizer / 三焦經", region: "待補", x: 64, y: 250 },
  GB: { meridian: "Gallbladder / 膽經", region: "待補", x: 228, y: 320 },
  LR: { meridian: "Liver / 肝經", region: "待補", x: 230, y: 540 },
  CV: { meridian: "Conception Vessel / 任脈", region: "前正中線", x: 180, y: 330 },
  GV: { meridian: "Governing Vessel / 督脈", region: "後正中線", x: 180, y: 220 }
};

function standardPointPlaceholder(code) {
  const prefix = channelCodeFromPointCode(code);
  const meta = channelPrefixMeta[prefix] || { meridian: "Standard Channel / 標準經穴", region: "待補", x: 180, y: 320 };
  return {
    code,
    nameZh: code,
    nameEn: code,
    pinyin: code,
    meridian: meta.meridian,
    region: meta.region,
    location: "待依 WHO Standard Acupuncture Point Locations 與專業教材補入。",
    locationEn: "Pending source review against WHO Standard Acupuncture Point Locations and professional textbooks.",
    cunMeasurement: "Pending source review.",
    functions: "待補。",
    functionsEn: ["Pending source review"],
    patterns: ["待補"],
    patternsEn: ["Pending source review"],
    evidence: "Placeholder page created so every standard channel point has an individual AcuTing OS record. Do not use as a clinical location until source_checked.",
    cautions: "Draft placeholder. Needling depth, angle, contraindications, and anatomical safety notes are pending professional source review.",
    reviewStatus: "placeholder",
    sources: standardPointSources(code),
    visualLinks: standardPointVisualLinks(code),
    x: meta.x,
    y: meta.y
  };
}

const standardPointPlaceholders = standardChannelAudit.channels.flatMap((channel) =>
  Array.from({ length: channel.expected }, (_, index) => standardPointPlaceholder(`${channel.code}${index + 1}`))
);

const tungIndexRecords = globalThis.ACUTING_TUNG_INDEX?.points || [];

function tungIndexPoint(record) {
  return {
    code: record.code,
    standardCode: record.display_code,
    nameZh: record.name_zh || record.name_en,
    nameEn: record.name_en,
    pinyin: record.pinyin || record.name_en,
    meridian: `Master Tung / 董氏奇穴`,
    region: `${record.zone_zh || record.zone_en} · ${record.region_zh || record.region_en}`,
    location: record.location_zh || "待依專業來源補入。",
    locationEn: record.location_en || "Pending source review.",
    cunMeasurement: "Pending source review.",
    functions: (record.traditional_functions_zh || ["待補"]).join("、"),
    functionsEn: record.traditional_functions_en || ["Pending source review"],
    patterns: record.indications_zh || ["待補"],
    patternsEn: record.indications_en || ["Pending source review"],
    evidence: "Master Tung index-only record created from the public eLotus/Master Tung navigation list. Location, indications, Dao Ma grouping, needling and safety remain pending source review.",
    cautions: (record.contraindications || []).join(" ") || "Index-only draft. Do not use clinically until source-checked.",
    reviewStatus: record.review_status || "index_only",
    sources: record.source_urls || ["https://www.mastertungacupuncture.org/"],
    visualLinks: tungPointVisualLinks(record),
    x: record.x || 180,
    y: record.y || 320
  };
}

const tungPointIndex = tungIndexRecords.map(tungIndexPoint);

const auricularGb93 = globalThis.ACUTING_AURICULAR_GB93 || {};
const auricularGb93Records = auricularGb93.points || [];
const auricularGb93Zones = auricularGb93.zones || {};
const auricularGb93Worklist = globalThis.ACUTING_AURICULAR_GB93_WORKLIST || {};
const auricularGb93NextBatch = auricularGb93Worklist.next_batch || [];

const auricularZonePositions = {
  HX: { x: 166, y: 72 },
  AH: { x: 134, y: 168 },
  SC: { x: 92, y: 180 },
  TF: { x: 142, y: 126 },
  TG: { x: 224, y: 238 },
  AT: { x: 174, y: 296 },
  CO: { x: 158, y: 246 },
  LO: { x: 170, y: 418 }
};

function auricularGb93Point(record) {
  const zone = auricularGb93Zones[record.zone] || {};
  const position = auricularZonePositions[record.zone] || { x: 178, y: 250 };
  const zoneLabelZh = zone.zh || record.zone || "耳廓";
  const zoneLabelEn = zone.en || record.zone || "Auricle";
  return {
    code: record.code,
    standardCode: record.code,
    nameZh: record.name_zh || record.code,
    nameEn: record.name_en || record.code,
    pinyin: record.pinyin || record.code,
    aliases: record.aliases_zh || record.aliases || [],
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    standardRegion: `${zoneLabelZh} / ${zoneLabelEn}`,
    location: record.location_zh || `GB93 耳穴索引：${zoneLabelZh}區。待依專業來源補入精確定位。`,
    locationEn: record.location_en || `GB93 auricular index: ${zoneLabelEn}. Precise location pending source review.`,
    cunMeasurement: "Auricular regional point. Cun measurement is not used.",
    functions: (record.indications_zh || ["待校對"]).join("、"),
    functionsEn: record.indications_en || ["Pending source review"],
    patterns: record.indications_zh || ["待校對"],
    patternsEn: record.indications_en || ["Pending source review"],
    evidence: "GB/T 13734-2008 auricular index scaffold. Use this page as a navigation placeholder until location, indications, needling method and cautions are source-checked.",
    cautions: "Index-only draft. Do not use clinically until source-checked against auricular acupuncture references.",
    reviewStatus: record.review_status || "index_only",
    sources: record.source_urls || auricularGb93.sources || [],
    visualLinks: auricularPointVisualLinks(record.code),
    x: record.x || position.x,
    y: record.y || position.y
  };
}

const auricularGb93Index = auricularGb93Records.map(auricularGb93Point);

const starterPoints = [
  {
    code: "LI4",
    nameZh: "合谷",
    nameEn: "Joining Valley",
    pinyin: "Hegu",
    meridian: "Large Intestine / 大腸經",
    region: "手部",
    location: "手背，第 2 掌骨橈側中點附近；常以拇指、食指併攏時肌肉隆起最高處作參考。",
    functions: "疏風解表，清熱止痛，調理面口與頭項。",
    patterns: ["風寒表證", "風熱表證", "頭面痛", "牙痛", "氣滯疼痛"],
    cautions: "孕期慎用或避免強刺激。",
    x: 70,
    y: 284
  },
  {
    code: "PC6",
    nameZh: "內關",
    nameEn: "Inner Pass",
    pinyin: "Neiguan",
    meridian: "Pericardium / 心包經",
    region: "前臂",
    location: "腕橫紋上 2 寸，掌長肌腱與橈側腕屈肌腱之間。",
    functions: "寬胸理氣，和胃降逆，寧心安神。",
    patterns: ["胸悶", "心悸", "噁心嘔吐", "胃氣上逆", "焦慮失眠"],
    cautions: "局部皮膚破損或感染時避開。",
    x: 55,
    y: 250
  },
  {
    code: "LU7",
    nameZh: "列缺",
    nameEn: "Broken Sequence",
    pinyin: "Lieque",
    meridian: "Lung / 肺經",
    region: "前臂",
    location: "腕橫紋上 1.5 寸，橈骨莖突上方凹陷處。",
    functions: "宣肺解表，通調任脈，利咽止咳。",
    patterns: ["外感咳嗽", "鼻塞", "咽喉不利", "頭項強痛", "肺氣不宣"],
    cautions: "避免深刺傷及局部血管神經。",
    x: 72,
    y: 232
  },
  {
    code: "ST36",
    nameZh: "足三里",
    nameEn: "Leg Three Miles",
    pinyin: "Zusanli",
    meridian: "Stomach / 胃經",
    region: "小腿",
    location: "犢鼻下 3 寸，脛骨前嵴外一橫指處。",
    functions: "健脾和胃，扶正培元，通經活絡。",
    patterns: ["脾胃虛弱", "胃痛", "腹脹", "泄瀉", "氣血不足"],
    cautions: "糖尿病或循環不良者需注意局部照護。",
    x: 222,
    y: 475
  },
  {
    code: "SP6",
    nameZh: "三陰交",
    nameEn: "Three Yin Intersection",
    pinyin: "Sanyinjiao",
    meridian: "Spleen / 脾經",
    region: "小腿",
    location: "內踝尖上 3 寸，脛骨內側緣後方。",
    functions: "健脾化濕，調肝腎，調經安神。",
    patterns: ["脾虛濕盛", "月經不調", "失眠", "肝腎不足", "下焦虛寒"],
    cautions: "孕期慎用或避免強刺激。",
    x: 138,
    y: 536
  },
  {
    code: "LR3",
    nameZh: "太衝",
    nameEn: "Great Rushing",
    pinyin: "Taichong",
    meridian: "Liver / 肝經",
    region: "足部",
    location: "足背，第 1、2 跖骨間隙後方凹陷處。",
    functions: "疏肝理氣，平肝息風，清利下焦。",
    patterns: ["肝氣鬱結", "頭痛眩暈", "脅痛", "情志鬱悶", "肝陽上亢"],
    cautions: "局部腫痛或傷口時避開。",
    x: 236,
    y: 590
  },
  {
    code: "KI3",
    nameZh: "太谿",
    nameEn: "Great Ravine",
    pinyin: "Taixi",
    meridian: "Kidney / 腎經",
    region: "踝部",
    location: "內踝尖與跟腱之間凹陷處。",
    functions: "滋腎陰，補腎氣，強腰膝。",
    patterns: ["腎陰虛", "腰膝痠軟", "耳鳴", "潮熱盜汗", "腎氣不足"],
    cautions: "局部靜脈曲張明顯者須審慎。",
    x: 132,
    y: 568
  },
  {
    code: "GB20",
    nameZh: "風池",
    nameEn: "Wind Pool",
    pinyin: "Fengchi",
    meridian: "Gallbladder / 膽經",
    region: "頭頸",
    location: "枕骨下，胸鎖乳突肌與斜方肌上端之間凹陷處。",
    functions: "疏風清熱，明目醒腦，舒緩頭項。",
    patterns: ["風邪頭痛", "眩暈", "目赤", "頸項強痛", "少陽證"],
    cautions: "針刺方向與深度需由受訓者操作，避免危險深刺。",
    x: 150,
    y: 98
  },
  {
    code: "GV20",
    nameZh: "百會",
    nameEn: "Hundred Meetings",
    pinyin: "Baihui",
    meridian: "Governing Vessel / 督脈",
    region: "頭部",
    location: "頭頂正中線，兩耳尖連線與前後正中線交會處。",
    functions: "醒神開竅，升陽舉陷，安神定志。",
    patterns: ["頭暈", "神志不清", "中氣下陷", "失眠", "焦慮"],
    cautions: "嬰幼兒囟門未閉或頭皮病變時需避免。",
    x: 180,
    y: 30
  },
  {
    code: "CV12",
    nameZh: "中脘",
    nameEn: "Middle Epigastrium",
    pinyin: "Zhongwan",
    meridian: "Conception Vessel / 任脈",
    region: "腹部",
    location: "前正中線，臍上 4 寸。",
    functions: "和胃健脾，降逆止嘔，消食導滯。",
    patterns: ["胃脘痛", "食滯", "胃氣上逆", "脾胃虛弱", "腹脹"],
    cautions: "飽食、妊娠或腹部急症需審慎。",
    x: 180,
    y: 240
  },
  {
    code: "CV6",
    nameZh: "氣海",
    nameEn: "Sea of Qi",
    pinyin: "Qihai",
    meridian: "Conception Vessel / 任脈",
    region: "腹部",
    location: "前正中線，臍下 1.5 寸。",
    functions: "補益元氣，溫陽固脫，調理下焦。",
    patterns: ["氣虛", "陽虛", "腹痛", "月經不調", "虛勞"],
    cautions: "孕期與腹部不明疼痛應先諮詢專業人員。",
    x: 180,
    y: 326
  },
  {
    code: "BL23",
    nameZh: "腎俞",
    nameEn: "Kidney Shu",
    pinyin: "Shenshu",
    meridian: "Bladder / 膀胱經",
    region: "腰背",
    location: "第 2 腰椎棘突下，旁開 1.5 寸。",
    functions: "補腎壯腰，益精助陽，利水。",
    patterns: ["腎虛腰痛", "耳鳴", "遺精", "水腫", "腎陽不足"],
    cautions: "背部深刺需專業訓練，避開腎區風險。",
    x: 210,
    y: 345
  },
  {
    code: "HT7",
    nameZh: "神門",
    nameEn: "Spirit Gate",
    pinyin: "Shenmen",
    meridian: "Heart / 心經",
    region: "腕部",
    location: "腕橫紋尺側端，尺側腕屈肌腱橈側凹陷處。",
    functions: "寧心安神，養心定悸。",
    patterns: ["心悸", "失眠", "多夢", "心血不足", "心神不寧"],
    cautions: "腕部神經血管密集，操作宜輕柔準確。",
    x: 304,
    y: 286
  },
  {
    code: "LI11",
    nameZh: "曲池",
    nameEn: "Pool at the Bend",
    pinyin: "Quchi",
    meridian: "Large Intestine / 大腸經",
    region: "肘部",
    location: "屈肘時，肘橫紋外側端與肱骨外上髁連線中點。",
    functions: "清熱，祛風止癢，通絡止痛。",
    patterns: ["熱證", "皮膚瘙癢", "上肢痹痛", "高熱", "風熱"],
    cautions: "肘部發炎或腫脹時避免刺激。",
    x: 292,
    y: 214
  },
  {
    code: "GB34",
    nameZh: "陽陵泉",
    nameEn: "Yang Mound Spring",
    pinyin: "Yanglingquan",
    meridian: "Gallbladder / 膽經",
    region: "小腿",
    location: "腓骨頭前下方凹陷處。",
    functions: "疏肝利膽，舒筋活絡。",
    patterns: ["筋脈拘急", "脅肋痛", "膽腑濕熱", "下肢痹痛", "肝膽氣滯"],
    cautions: "避免刺激腓總神經過強。",
    x: 236,
    y: 450
  },
  {
    code: "BL40",
    nameZh: "委中",
    nameEn: "Middle of the Crook",
    pinyin: "Weizhong",
    meridian: "Bladder / 膀胱經",
    region: "膝後",
    location: "膕橫紋中點。",
    functions: "舒筋通絡，清熱涼血，利腰背。",
    patterns: ["腰背痛", "膝痛", "下肢痹痛", "暑熱", "血熱"],
    cautions: "膕窩血管神經豐富，針刺需非常審慎。",
    x: 150,
    y: 438
  }
];

const professionalPoints = [
  {
    code: "LI4",
    evidence: "常用於頭面痛與一般疼痛配穴；疼痛研究通常評估完整針灸方案，孕期安全需特別注意。"
  },
  {
    code: "PC6",
    evidence: "P6/PC6 是噁心嘔吐研究最常見穴位之一；術後或化療相關噁心仍應配合標準醫療處置。"
  },
  {
    code: "LU7",
    evidence: "常用於咳嗽、鼻咽與頭項症狀配穴；呼吸急促、胸痛或高熱需先就醫。"
  },
  {
    code: "ST36",
    evidence: "足三里常見於疼痛、腸胃、疲勞與免疫相關研究；需依病種與治療方案判讀。"
  },
  {
    code: "SP6",
    evidence: "婦科、泌尿與睡眠相關配穴常見；孕期通常列為慎用或禁用強刺激穴位。"
  },
  {
    code: "LR3",
    evidence: "常用於情志、頭痛、肝鬱與肝陽相關證型；高血壓或神經症狀需配合醫療評估。"
  },
  {
    code: "KI3",
    evidence: "腎虛、腰膝、耳鳴等傳統配穴常見；慢性症狀需確認內科或神經耳科原因。"
  },
  {
    code: "GB20",
    evidence: "頭痛、偏頭痛、頸項痛研究與臨床配穴常見；頸後部操作需高度注意解剖安全。"
  },
  {
    code: "GV20",
    evidence: "常用於頭面、神志與升提類傳統處方；昏厥、中風徵象或急症不可延誤就醫。"
  },
  {
    code: "CV12",
    evidence: "腸胃症狀配穴常見；持續胃痛、黑便、體重下降等警訊需醫學檢查。"
  },
  {
    code: "CV6",
    evidence: "常見於氣虛、下焦與慢性疲勞型處方；腹部症狀需排除急症與妊娠相關狀況。"
  },
  {
    code: "BL23",
    evidence: "腰痛與腎系傳統證型常用；泌尿感染、腎病或神經壓迫需醫療診斷。"
  },
  {
    code: "HT7",
    evidence: "睡眠、焦慮與心悸相關配穴常見；胸痛、心律不整或自傷風險需立即就醫。"
  },
  {
    code: "LI11",
    evidence: "疼痛、皮膚癢與熱證配穴常見；感染、過敏或高熱需依醫學處理。"
  },
  {
    code: "GB34",
    evidence: "筋膜、膝腿與膽經證型配穴常見；膝部外傷或神經症狀需先評估。"
  },
  {
    code: "BL40",
    evidence: "腰背痛與膝後症狀常見配穴；膕窩血管神經密集，不適合自行深按或針刺。"
  },
  {
    code: "LU1",
    nameZh: "中府",
    nameEn: "Central Treasury",
    pinyin: "Zhongfu",
    meridian: "Lung / 肺經",
    region: "胸部",
    location: "前胸外上方，第 1 肋間隙附近，前正中線旁開約 6 寸。",
    functions: "宣肺降氣，止咳平喘，寬胸理氣。",
    patterns: ["肺氣不宣", "咳嗽", "喘證", "胸悶", "痰濁阻肺"],
    evidence: "胸部穴位多用於呼吸道症狀的傳統配穴；臨床研究需依疾病與方案判讀，不能單點推論療效。",
    cautions: "胸肺區需避免深刺，氣胸風險需由受訓專業人員評估。",
    x: 138,
    y: 150
  },
  {
    code: "LU5",
    nameZh: "尺澤",
    nameEn: "Cubit Marsh",
    pinyin: "Chize",
    meridian: "Lung / 肺經",
    region: "肘部",
    location: "肘橫紋上，肱二頭肌腱橈側凹陷處。",
    functions: "清肺熱，降逆氣，舒筋止痛。",
    patterns: ["肺熱咳嗽", "喘咳", "咽喉腫痛", "肘臂痛", "痰熱壅肺"],
    evidence: "常見於呼吸道與上肢疼痛配穴；證據品質依病種差異很大。",
    cautions: "肘窩血管神經較多，避免粗暴刺激。",
    x: 82,
    y: 212
  },
  {
    code: "LU9",
    nameZh: "太淵",
    nameEn: "Great Abyss",
    pinyin: "Taiyuan",
    meridian: "Lung / 肺經",
    region: "腕部",
    location: "腕掌側橫紋橈側，橈動脈搏動處附近。",
    functions: "補肺益氣，化痰止咳，通脈。",
    patterns: ["肺氣虛", "久咳", "氣短", "脈弱", "痰飲"],
    evidence: "傳統上作肺經原穴使用；涉及動脈區，定位與操作安全比單純功效更重要。",
    cautions: "避開橈動脈，勿強刺激搏動處。",
    x: 66,
    y: 286
  },
  {
    code: "LI20",
    nameZh: "迎香",
    nameEn: "Welcome Fragrance",
    pinyin: "Yingxiang",
    meridian: "Large Intestine / 大腸經",
    region: "面部",
    location: "鼻翼外緣中點旁，鼻唇溝中。",
    functions: "通鼻竅，散風熱，清面部。",
    patterns: ["鼻塞", "鼻炎", "面癢", "風熱犯肺", "嗅覺不利"],
    evidence: "常用於鼻部症狀配穴；現代研究多需與整體針灸方案一起評估。",
    cautions: "面部皮膚感染、酒糟或急性發炎時避開。",
    x: 166,
    y: 72
  },
  {
    code: "ST25",
    nameZh: "天樞",
    nameEn: "Celestial Pivot",
    pinyin: "Tianshu",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "臍中旁開 2 寸。",
    functions: "調理腸腑，行氣導滯，止瀉通便。",
    patterns: ["腹痛", "腹瀉", "便秘", "食積", "腸腑氣滯"],
    evidence: "腸胃症狀是針灸研究常見領域；需依診斷、刺激方式與治療頻率評估。",
    cautions: "妊娠、腹部急症、腫瘤或術後狀態需先諮詢醫療人員。",
    x: 206,
    y: 292
  },
  {
    code: "ST40",
    nameZh: "豐隆",
    nameEn: "Abundant Bulge",
    pinyin: "Fenglong",
    meridian: "Stomach / 胃經",
    region: "小腿",
    location: "外踝尖上 8 寸，脛骨前嵴外約 2 橫指處。",
    functions: "化痰降濁，和胃寧神。",
    patterns: ["痰濕", "痰熱", "眩暈", "胸悶", "胃氣不和"],
    evidence: "常用於痰濕相關證型與代謝、神志症狀配伍；單穴證據有限。",
    cautions: "局部靜脈曲張或皮膚病變時避開。",
    x: 236,
    y: 510
  },
  {
    code: "ST44",
    nameZh: "內庭",
    nameEn: "Inner Courtyard",
    pinyin: "Neiting",
    meridian: "Stomach / 胃經",
    region: "足部",
    location: "足背第 2、3 趾間，趾蹼緣後方赤白肉際處。",
    functions: "清胃熱，止痛，和腸胃。",
    patterns: ["胃火牙痛", "咽喉腫痛", "口臭", "腹痛", "熱結腸胃"],
    evidence: "多作清熱止痛配穴；牙痛、胃熱等需先排除急性牙科或感染問題。",
    cautions: "足部傷口、感染或糖尿病足風險者需避免自行刺激。",
    x: 246,
    y: 600
  },
  {
    code: "SP9",
    nameZh: "陰陵泉",
    nameEn: "Yin Mound Spring",
    pinyin: "Yinlingquan",
    meridian: "Spleen / 脾經",
    region: "小腿",
    location: "脛骨內側髁下緣與脛骨內側緣之間凹陷處。",
    functions: "健脾利濕，通利下焦。",
    patterns: ["脾虛濕盛", "水腫", "小便不利", "腹瀉", "膝痛"],
    evidence: "濕、水液代謝相關證型常用；現代病名需另依醫學診斷。",
    cautions: "膝內側疼痛或腫脹明顯時需先評估原因。",
    x: 136,
    y: 446
  },
  {
    code: "SP10",
    nameZh: "血海",
    nameEn: "Sea of Blood",
    pinyin: "Xuehai",
    meridian: "Spleen / 脾經",
    region: "大腿",
    location: "髕底內上方約 2 寸，股內側肌隆起處。",
    functions: "活血化瘀，涼血止癢，調經。",
    patterns: ["血瘀", "血熱", "皮膚瘙癢", "月經不調", "膝痛"],
    evidence: "婦科與皮膚症狀配穴常見；應配合病因診斷，避免延誤異常出血評估。",
    cautions: "不明原因陰道出血、凝血異常或抗凝藥使用者需謹慎。",
    x: 135,
    y: 402
  },
  {
    code: "SI3",
    nameZh: "後谿",
    nameEn: "Back Ravine",
    pinyin: "Houxi",
    meridian: "Small Intestine / 小腸經",
    region: "手部",
    location: "握拳時，第 5 掌指關節尺側後方赤白肉際處。",
    functions: "舒項背，通督脈，清心安神。",
    patterns: ["頸項強痛", "腰背痛", "督脈不利", "癲癇", "盜汗"],
    evidence: "頸項與背部疼痛常作遠端配穴；疼痛治療證據通常看完整處方與療程。",
    cautions: "手部急性扭傷、傷口或感染時避開。",
    x: 302,
    y: 302
  },
  {
    code: "BL10",
    nameZh: "天柱",
    nameEn: "Celestial Pillar",
    pinyin: "Tianzhu",
    meridian: "Bladder / 膀胱經",
    region: "頭頸",
    location: "後髮際上約 0.5 寸，斜方肌外側凹陷處。",
    functions: "舒項強，清頭目，安神。",
    patterns: ["頸項強痛", "頭痛", "眩暈", "鼻塞", "失眠"],
    evidence: "頸項痛、頭痛常見配穴；需排除神經學危險徵象。",
    cautions: "頸項部位深刺有風險，需專業操作。",
    x: 206,
    y: 104
  },
  {
    code: "BL13",
    nameZh: "肺俞",
    nameEn: "Lung Shu",
    pinyin: "Feishu",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "第 3 胸椎棘突下，旁開 1.5 寸。",
    functions: "宣肺理氣，止咳平喘，解表。",
    patterns: ["咳嗽", "喘證", "肺氣虛", "外感", "盜汗"],
    evidence: "背俞穴常用於臟腑相關傳統治療；胸背部操作需把安全放在首位。",
    cautions: "胸背區避免過深刺激，氣胸風險需專業評估。",
    x: 215,
    y: 180
  },
  {
    code: "BL17",
    nameZh: "膈俞",
    nameEn: "Diaphragm Shu",
    pinyin: "Geshu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "第 7 胸椎棘突下，旁開 1.5 寸。",
    functions: "活血化瘀，寬胸和胃。",
    patterns: ["血瘀", "胸脅痛", "呃逆", "嘔吐", "皮膚血熱"],
    evidence: "傳統上為血會穴；現代應用需依具體疾病研究判斷。",
    cautions: "胸背部深刺風險需由專業人員控制。",
    x: 215,
    y: 230
  },
  {
    code: "BL20",
    nameZh: "脾俞",
    nameEn: "Spleen Shu",
    pinyin: "Pishu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "第 11 胸椎棘突下，旁開 1.5 寸。",
    functions: "健脾化濕，益氣統血。",
    patterns: ["脾氣虛", "食少", "腹脹", "泄瀉", "水濕內停"],
    evidence: "常用於消化與疲勞相關傳統配穴；不是用來替代腸胃或血液疾病診斷。",
    cautions: "背部局部感染、骨折或不明痛點需先評估。",
    x: 215,
    y: 285
  },
  {
    code: "BL25",
    nameZh: "大腸俞",
    nameEn: "Large Intestine Shu",
    pinyin: "Dachangshu",
    meridian: "Bladder / 膀胱經",
    region: "腰部",
    location: "第 4 腰椎棘突下，旁開 1.5 寸。",
    functions: "調理腸腑，理氣止痛。",
    patterns: ["腰痛", "便秘", "腹瀉", "腹脹", "腸腑氣滯"],
    evidence: "腰痛與腸胃症狀均有針灸研究；需區分肌骨、神經與內科病因。",
    cautions: "急性腰痛伴發燒、麻木無力或大小便異常需先就醫。",
    x: 214,
    y: 382
  },
  {
    code: "BL32",
    nameZh: "次髎",
    nameEn: "Second Bone Hole",
    pinyin: "Ciliao",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "第 2 骶後孔處。",
    functions: "調經止痛，通利下焦，舒腰骶。",
    patterns: ["痛經", "月經不調", "腰骶痛", "小便不利", "下焦寒濕"],
    evidence: "婦科、泌尿與腰骶痛配穴常見；相關症狀需排除感染、妊娠或急症。",
    cautions: "妊娠、骨盆腔急性發炎或不明出血需避免自行處理。",
    x: 205,
    y: 412
  },
  {
    code: "BL60",
    nameZh: "崑崙",
    nameEn: "Kunlun Mountains",
    pinyin: "Kunlun",
    meridian: "Bladder / 膀胱經",
    region: "踝部",
    location: "外踝尖與跟腱之間凹陷處。",
    functions: "舒筋活絡，清頭目，利腰背。",
    patterns: ["腰背痛", "頭痛", "踝痛", "頸項強痛", "經絡阻滯"],
    evidence: "常作遠端止痛配穴；急性外傷需先排除骨折或韌帶嚴重損傷。",
    cautions: "孕期慎用；踝部腫脹明顯或傷口感染時避開。",
    x: 246,
    y: 566
  },
  {
    code: "KI6",
    nameZh: "照海",
    nameEn: "Shining Sea",
    pinyin: "Zhaohai",
    meridian: "Kidney / 腎經",
    region: "踝部",
    location: "內踝尖下方凹陷處。",
    functions: "滋陰清熱，利咽，調任脈。",
    patterns: ["腎陰虛", "咽喉乾痛", "失眠", "月經不調", "陰虛內熱"],
    evidence: "陰虛、咽喉與睡眠相關配穴常見；睡眠問題需留意藥物、情緒與內科因素。",
    cautions: "足踝感染、傷口或循環不良需避開。",
    x: 125,
    y: 582
  },
  {
    code: "TE5",
    nameZh: "外關",
    nameEn: "Outer Pass",
    pinyin: "Waiguan",
    meridian: "Triple Energizer / 三焦經",
    region: "前臂",
    location: "腕背橫紋上 2 寸，橈骨與尺骨之間。",
    functions: "解表清熱，通少陽，利耳目。",
    patterns: ["外感發熱", "偏頭痛", "耳鳴", "脅痛", "上肢痹痛"],
    evidence: "常與 GB41 等配伍處理少陽與頭側症狀；偏頭痛需依研究方案與診斷評估。",
    cautions: "前臂局部神經血管疼痛或麻木時避免強刺激。",
    x: 290,
    y: 252
  },
  {
    code: "GB21",
    nameZh: "肩井",
    nameEn: "Shoulder Well",
    pinyin: "Jianjing",
    meridian: "Gallbladder / 膽經",
    region: "肩部",
    location: "肩上，乳頭直上與大椎連線中點附近。",
    functions: "舒肩項，降逆，通絡。",
    patterns: ["肩頸痛", "乳癰", "頭項強痛", "氣機上逆", "產後乳少"],
    evidence: "肩頸肌筋膜疼痛常見配穴；位置接近肺尖，安全深度非常重要。",
    cautions: "孕期禁慎用；避免深刺以降低氣胸風險。",
    x: 236,
    y: 130
  },
  {
    code: "GB30",
    nameZh: "環跳",
    nameEn: "Jumping Round",
    pinyin: "Huantiao",
    meridian: "Gallbladder / 膽經",
    region: "髖臀",
    location: "股骨大轉子與骶管裂孔連線外 1/3 與內 2/3 交點附近。",
    functions: "舒筋活絡，利腰腿，祛風濕。",
    patterns: ["坐骨神經痛", "髖痛", "下肢痹痛", "腰腿痛", "風寒濕痹"],
    evidence: "腰腿痛與坐骨神經痛常見針灸適應研究；需排除神經壓迫危險徵象。",
    cautions: "深部臀區需熟悉解剖，避免坐骨神經過強刺激。",
    x: 230,
    y: 374
  },
  {
    code: "GB39",
    nameZh: "懸鐘",
    nameEn: "Suspended Bell",
    pinyin: "Xuanzhong",
    meridian: "Gallbladder / 膽經",
    region: "小腿",
    location: "外踝尖上 3 寸，腓骨前緣。",
    functions: "益髓強骨，舒筋活絡。",
    patterns: ["頸項強痛", "下肢痹痛", "骨髓不足", "偏癱", "踝痛"],
    evidence: "傳統為髓會穴；神經復健或疼痛應搭配正式醫療評估。",
    cautions: "避免刺激腓骨附近神經造成放電樣疼痛。",
    x: 240,
    y: 532
  },
  {
    code: "LR14",
    nameZh: "期門",
    nameEn: "Cycle Gate",
    pinyin: "Qimen",
    meridian: "Liver / 肝經",
    region: "胸脅",
    location: "乳頭直下，第 6 肋間隙，前正中線旁開約 4 寸。",
    functions: "疏肝理氣，和胃降逆，寬胸脅。",
    patterns: ["肝氣鬱結", "胸脅脹痛", "胃氣上逆", "呃逆", "情志鬱悶"],
    evidence: "胸脅與消化情志證型常用；胸痛需先排除心肺急症。",
    cautions: "胸脅部避免深刺，胸痛、呼吸困難時應立即就醫。",
    x: 132,
    y: 222
  },
  {
    code: "CV4",
    nameZh: "關元",
    nameEn: "Origin Pass",
    pinyin: "Guanyuan",
    meridian: "Conception Vessel / 任脈",
    region: "下腹",
    location: "前正中線，臍下 3 寸。",
    functions: "補益元氣，溫腎固本，調經。",
    patterns: ["腎陽虛", "元氣不足", "月經不調", "不孕", "下焦虛寒"],
    evidence: "常見於虛證與婦科配穴；生殖與泌尿問題需配合醫學檢查。",
    cautions: "孕期、腹部急症或不明出血需避免自行刺激。",
    x: 180,
    y: 350
  },
  {
    code: "CV17",
    nameZh: "膻中",
    nameEn: "Chest Center",
    pinyin: "Danzhong",
    meridian: "Conception Vessel / 任脈",
    region: "胸部",
    location: "前正中線，第 4 肋間隙，兩乳頭連線中點。",
    functions: "寬胸理氣，降逆平喘，通乳。",
    patterns: ["胸悶", "氣逆", "咳喘", "乳汁不下", "焦慮胸悶"],
    evidence: "胸悶與呼吸症狀須先排除急症；針灸多作輔助調理研究。",
    cautions: "胸痛、呼吸困難、冒冷汗等症狀需立即就醫。",
    x: 180,
    y: 190
  },
  {
    code: "GV14",
    nameZh: "大椎",
    nameEn: "Great Vertebra",
    pinyin: "Dazhui",
    meridian: "Governing Vessel / 督脈",
    region: "頸背",
    location: "第 7 頸椎棘突下凹陷處。",
    functions: "清熱解表，振奮陽氣，舒項背。",
    patterns: ["外感發熱", "項背強痛", "陽氣不足", "瘧疾往來寒熱", "風熱"],
    evidence: "常見於發熱、頸背痛與免疫調節相關研究；高熱或感染需醫療評估。",
    cautions: "頸胸交界處避免深刺，脊柱疾病者需審慎。",
    x: 180,
    y: 126
  },
  {
    code: "GV26",
    nameZh: "水溝",
    nameEn: "Water Trough",
    pinyin: "Shuigou",
    meridian: "Governing Vessel / 督脈",
    region: "面部",
    location: "人中溝上 1/3 與中 1/3 交點。",
    functions: "醒神開竅，急救回陽，清熱息風。",
    patterns: ["昏厥", "中暑", "癲狂", "抽搐", "急性腰扭傷"],
    evidence: "傳統急救穴；現代急症不可用穴位刺激取代急救與醫療處置。",
    cautions: "意識不清、抽搐、胸痛或中風徵象時應立即呼叫急救。",
    x: 180,
    y: 78
  },
  {
    code: "EX-HN3",
    nameZh: "印堂",
    nameEn: "Yintang",
    pinyin: "Yintang",
    meridian: "Extra Point / 經外奇穴",
    region: "頭面",
    location: "兩眉頭連線中點。",
    functions: "安神定志，通鼻竅，清頭目。",
    patterns: ["焦慮", "失眠", "頭痛", "鼻塞", "心神不寧"],
    evidence: "放鬆、焦慮與鼻部症狀研究常見此穴；效果需依研究設計與個人狀態判斷。",
    cautions: "局部皮膚發炎或外傷時避開。",
    x: 180,
    y: 58
  },
  {
    code: "EX-HN5",
    nameZh: "太陽",
    nameEn: "Taiyang",
    pinyin: "Taiyang",
    meridian: "Extra Point / 經外奇穴",
    region: "頭面",
    location: "眉梢與外眼角之間向後約 1 寸凹陷處。",
    functions: "清頭明目，止頭痛，疏風。",
    patterns: ["偏頭痛", "目赤腫痛", "頭暈", "風熱", "眼疲勞"],
    evidence: "頭痛與眼周症狀常見配穴；突發劇烈頭痛或視力改變需先就醫。",
    cautions: "眼周附近避免深刺與粗暴按壓。",
    x: 218,
    y: 64
  }
];

const lungMeridianExpansion = [
  {
    code: "LU2",
    nameZh: "雲門",
    nameEn: "Cloud Gate",
    pinyin: "Yunmen",
    meridian: "Lung / 肺經",
    region: "胸部",
    location: "前胸外上方，鎖骨外端下方凹陷中，前正中線旁開約 6 寸。",
    locationEn: "On the upper lateral chest, in the depression below the acromial end of the clavicle, about 6 cun lateral to the anterior midline.",
    anatomy: [{ zh: "鎖骨外端", en: "acromial end of the clavicle" }, { zh: "前正中線", en: "anterior midline" }, { zh: "胸部", en: "chest" }],
    functions: "宣肺降氣，寬胸止咳。",
    functionsEn: "Regulate and descend Lung qi, open the chest, and stop cough.",
    patterns: ["咳嗽", "喘證", "胸痛", "肩背痛", "肺氣不宣"],
    patternsEn: ["cough", "asthma or dyspnea", "chest pain", "shoulder and back pain", "impaired Lung diffusion"],
    evidence: "肺經胸部穴位，常作呼吸與胸肩症狀配穴；胸痛或呼吸困難需先排除急症。",
    cautions: "胸肺區避免深刺，需注意氣胸風險。",
    sources: ["https://www.acupoints.org/lu2-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 132,
    y: 132
  },
  {
    code: "LU3",
    nameZh: "天府",
    nameEn: "Upper Arm Assembly",
    pinyin: "Tianfu",
    meridian: "Lung / 肺經",
    region: "上臂",
    location: "上臂內側，肱二頭肌橈側緣，腋前紋頭下約 3 寸。",
    locationEn: "On the medial aspect of the upper arm, on the radial side of biceps brachii, 3 cun below the anterior axillary fold.",
    anatomy: [{ zh: "肱二頭肌", en: "biceps brachii" }, { zh: "上臂內側", en: "medial upper arm" }, { zh: "腋前紋", en: "anterior axillary fold" }],
    functions: "肅降肺氣，止咳止衄，安神定志。",
    functionsEn: "Descend Lung qi, stop bleeding, and calm the corporeal soul in traditional use.",
    patterns: ["鼻衄", "咳嗽", "喘證", "肩臂痛", "情志鬱悶"],
    patternsEn: ["epistaxis", "cough", "asthma or dyspnea", "shoulder and arm pain", "emotional constraint"],
    evidence: "AcuPoints 將 LU3 列為天窗類相關穴；精神情志用途需作傳統配穴理解。",
    cautions: "上臂內側血管神經較多，操作需避開明顯血管與神經敏感區。",
    sources: ["https://www.acupoints.org/lu3-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 94,
    y: 172
  },
  {
    code: "LU4",
    nameZh: "俠白",
    nameEn: "Supporting the Lung",
    pinyin: "Xiabai",
    meridian: "Lung / 肺經",
    region: "上臂",
    location: "上臂內側，肱二頭肌橈側緣，腋前紋頭下約 4 寸，肘橫紋上約 5 寸。",
    locationEn: "On the medial aspect of the upper arm, on the radial side of biceps brachii, 4 cun below the anterior axillary fold and 5 cun above the cubital crease.",
    anatomy: [{ zh: "肱二頭肌", en: "biceps brachii" }, { zh: "肘橫紋", en: "cubital crease" }, { zh: "腋前紋", en: "anterior axillary fold" }],
    functions: "宣降肺氣，寬胸和胃。",
    functionsEn: "Descend Lung qi, open the chest, and harmonize the Stomach in traditional use.",
    patterns: ["咳嗽", "喘證", "胸悶", "噁心", "上臂痛"],
    patternsEn: ["cough", "asthma or dyspnea", "chest oppression", "nausea", "upper arm pain"],
    evidence: "多作肺經局部與呼吸相關輔助穴。",
    cautions: "局部酸麻放散過強時需調整刺激。",
    sources: ["https://www.acupoints.org/lu4-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 90,
    y: 190
  },
  {
    code: "LU6",
    nameZh: "孔最",
    nameEn: "Collection Hole",
    pinyin: "Kongzui",
    meridian: "Lung / 肺經",
    region: "前臂",
    location: "前臂掌側橈側，LU5 與 LU9 連線上，腕橫紋上約 7 寸。",
    locationEn: "On the radial palmar aspect of the forearm, on the line joining LU5 and LU9, 7 cun proximal to the wrist crease.",
    anatomy: [{ zh: "前臂掌側", en: "palmar forearm" }, { zh: "橈側", en: "radial side" }, { zh: "腕橫紋", en: "wrist crease" }],
    functions: "肅肺止咳，清熱止血，利咽。",
    functionsEn: "Descend and regulate Lung qi, stop bleeding, clear heat, and benefit the throat.",
    patterns: ["咯血", "鼻衄", "咳嗽", "喘證", "咽喉腫痛"],
    patternsEn: ["hemoptysis", "epistaxis", "cough", "asthma or dyspnea", "sore throat"],
    evidence: "肺經郄穴，傳統常用於急性、疼痛或出血相關肺系症狀。",
    cautions: "咯血、呼吸困難或大量出血需立即就醫，不可只依靠穴位處理。",
    sources: ["https://www.acupoints.org/lu6-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 76,
    y: 236
  },
  {
    code: "LU8",
    nameZh: "經渠",
    nameEn: "Channel Ditch",
    pinyin: "Jingqu",
    meridian: "Lung / 肺經",
    region: "腕部",
    location: "前臂掌側橈側，橈骨莖突與橈動脈之間凹陷，腕橫紋上約 1 寸。",
    locationEn: "On the radial palmar aspect of the forearm, in the depression between the styloid process of the radius and the radial artery, 1 cun proximal to the wrist crease.",
    anatomy: [{ zh: "橈骨莖突", en: "styloid process of the radius" }, { zh: "橈動脈", en: "radial artery" }, { zh: "腕橫紋", en: "wrist crease" }],
    functions: "宣肺降氣，止咳平喘。",
    functionsEn: "Descend Lung qi and relieve wheezing and cough.",
    patterns: ["咳嗽", "喘證", "胸痛", "咽喉痛", "腕痛"],
    patternsEn: ["cough", "asthma or dyspnea", "chest pain", "sore throat", "wrist pain"],
    evidence: "肺經經穴，傳統主治咳喘與腕部局部症狀。",
    cautions: "靠近橈動脈，避免直接強刺激搏動處。",
    sources: ["https://www.acupoints.org/lu8-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 68,
    y: 270
  },
  {
    code: "LU10",
    nameZh: "魚際",
    nameEn: "Fish Border",
    pinyin: "Yuji",
    meridian: "Lung / 肺經",
    region: "手部",
    location: "第 1 掌骨中點橈側，赤白肉際處，魚際肌隆起後方凹陷。",
    locationEn: "In the depression posterior to the thenar eminence, around the midpoint of the palmar side of the first metacarpal bone, at the junction of the red and white skin.",
    anatomy: [{ zh: "第1掌骨", en: "first metacarpal bone" }, { zh: "魚際肌", en: "thenar eminence" }, { zh: "赤白肉際", en: "junction of red and white skin" }],
    functions: "清肺熱，利咽喉，止咳。",
    functionsEn: "Clear Lung heat, benefit the throat, and stop cough.",
    patterns: ["咽喉腫痛", "發熱", "咳嗽", "咯血", "肺熱"],
    patternsEn: ["sore throat", "fever", "cough", "hemoptysis", "Lung heat"],
    evidence: "肺經滎穴，傳統多用於熱證與咽喉症狀。",
    cautions: "局部皮膚破損或感染時避開。",
    sources: ["https://www.acupoints.org/lu10-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 58,
    y: 318
  },
  {
    code: "LU11",
    nameZh: "少商",
    nameEn: "Lesser Metal",
    pinyin: "Shaoshang",
    meridian: "Lung / 肺經",
    region: "手部",
    location: "拇指橈側，距指甲角約 0.1 寸。",
    locationEn: "On the radial side of the thumb, about 0.1 cun from the corner of the nail.",
    anatomy: [{ zh: "拇指", en: "thumb" }, { zh: "指甲角", en: "corner of the nail" }, { zh: "橈側", en: "radial side" }],
    functions: "清熱利咽，醒神開竅，宣肺解表。",
    functionsEn: "Clear heat, benefit the throat, revive consciousness, and release the exterior in traditional use.",
    patterns: ["咽喉腫痛", "發熱", "咳嗽", "鼻衄", "昏厥"],
    patternsEn: ["sore throat", "fever", "cough", "epistaxis", "fainting or collapse"],
    evidence: "肺經井穴，傳統急症用途需配合現代急救判斷。",
    cautions: "昏迷、抽搐、高熱或呼吸困難應立即急救；刺血類操作需專業訓練與無菌觀念。",
    sources: ["https://www.acupoints.org/lu11-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 50,
    y: 340
  }
];

const largeIntestineMeridianExpansion = [
  {
    code: "LI1",
    nameZh: "商陽",
    nameEn: "Metal Yang",
    pinyin: "Shangyang",
    meridian: "Large Intestine / 大腸經",
    region: "手部",
    location: "食指橈側，距指甲角約 0.1 寸。",
    locationEn: "On the radial side of the index finger, about 0.1 cun from the corner of the nail.",
    anatomy: [{ zh: "食指", en: "index finger" }, { zh: "指甲角", en: "corner of the nail" }, { zh: "橈側", en: "radial side" }],
    functions: "清熱利咽，醒神開竅，宣肺解表。",
    functionsEn: "Clear heat, benefit the throat, revive consciousness, and release the exterior in traditional use.",
    patterns: ["咽喉腫痛", "牙痛", "發熱", "昏厥", "熱證"],
    patternsEn: ["sore throat", "toothache", "fever", "fainting", "heat pattern"],
    evidence: "大腸經井穴，傳統用於急性熱證與咽喉、齒痛相關配穴。",
    techniqueNotes: "待依 WHO/專業教材補入；井穴刺血或強刺激需專業訓練與無菌觀念。",
    cautions: "昏迷、高熱或嚴重感染不可只依穴位處理；局部感染或凝血風險者避免刺血。",
    sources: ["https://www.acupoints.org/li1-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 52,
    y: 342
  },
  {
    code: "LI2",
    nameZh: "二間",
    nameEn: "Second Space",
    pinyin: "Erjian",
    meridian: "Large Intestine / 大腸經",
    region: "手部",
    location: "食指橈側，第 2 掌指關節前下方赤白肉際處。",
    locationEn: "On the radial side of the index finger, distal to the second metacarpophalangeal joint, at the junction of the red and white skin.",
    anatomy: [{ zh: "第2掌指關節", en: "second metacarpophalangeal joint" }, { zh: "赤白肉際", en: "junction of red and white skin" }],
    functions: "清熱利咽，消腫止痛。",
    functionsEn: "Clear heat, benefit the throat, reduce swelling, and relieve pain.",
    patterns: ["牙痛", "咽喉腫痛", "目赤", "熱證", "手指痛"],
    patternsEn: ["toothache", "sore throat", "red eyes", "heat pattern", "finger pain"],
    evidence: "大腸經滎穴，常作熱證、頭面五官症狀配穴。",
    techniqueNotes: "待依專業來源補入；手指局部皮膚破損、感染時避開。",
    cautions: "急性化膿、蜂窩性組織炎或嚴重外傷需醫療處理。",
    sources: ["https://www.acupoints.org/li2-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 58,
    y: 332
  },
  {
    code: "LI3",
    nameZh: "三間",
    nameEn: "Third Space",
    pinyin: "Sanjian",
    meridian: "Large Intestine / 大腸經",
    region: "手部",
    location: "手背，第 2 掌指關節後，第二掌骨橈側凹陷處。",
    locationEn: "On the dorsum of the hand, proximal to the second metacarpophalangeal joint, in the depression on the radial side of the second metacarpal bone.",
    anatomy: [{ zh: "手背", en: "dorsum of the hand" }, { zh: "第二掌骨", en: "second metacarpal bone" }],
    functions: "清熱利咽，通絡止痛。",
    functionsEn: "Clear heat, benefit the throat, open the channel, and relieve pain.",
    patterns: ["牙痛", "咽喉腫痛", "目痛", "手背痛", "風熱"],
    patternsEn: ["toothache", "sore throat", "eye pain", "dorsal hand pain", "wind-heat"],
    evidence: "大腸經輸穴，常見於頭面五官與手部局部症狀配穴。",
    techniqueNotes: "待依專業來源補入；靠近掌骨與局部小血管，需注意角度與刺激量。",
    cautions: "局部腫脹、感染或骨折疑慮時不作刺激。",
    sources: ["https://www.acupoints.org/li3-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 64,
    y: 318
  },
  {
    code: "LI5",
    nameZh: "陽谿",
    nameEn: "Yang Stream",
    pinyin: "Yangxi",
    meridian: "Large Intestine / 大腸經",
    region: "腕部",
    location: "腕背橈側，拇長伸肌腱與拇短伸肌腱之間凹陷，約在解剖鼻煙窩處。",
    locationEn: "On the radial side of the dorsal wrist, in the depression between the tendons of extensor pollicis longus and extensor pollicis brevis, near the anatomical snuffbox.",
    anatomy: [{ zh: "腕背", en: "dorsal wrist" }, { zh: "拇長伸肌腱", en: "extensor pollicis longus tendon" }, { zh: "拇短伸肌腱", en: "extensor pollicis brevis tendon" }, { zh: "解剖鼻煙窩", en: "anatomical snuffbox" }],
    functions: "清熱安神，利咽通絡。",
    functionsEn: "Clear heat, calm the spirit, benefit the throat, and open the channel.",
    patterns: ["頭痛", "目赤", "咽喉痛", "腕痛", "熱證"],
    patternsEn: ["headache", "red eyes", "sore throat", "wrist pain", "heat pattern"],
    evidence: "大腸經經穴，常用於腕部局部症狀與頭面熱證配穴。",
    techniqueNotes: "待依專業來源補入；解剖鼻煙窩鄰近橈動脈分支與肌腱，需避免粗暴深刺。",
    cautions: "腕部腱鞘炎急性腫痛、外傷或局部感染時避開。",
    sources: ["https://www.acupoints.org/li5-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 68,
    y: 294
  },
  {
    code: "LI6",
    nameZh: "偏歷",
    nameEn: "Veering Passage",
    pinyin: "Pianli",
    meridian: "Large Intestine / 大腸經",
    region: "前臂",
    location: "前臂背橈側，陽谿 LI5 與曲池 LI11 連線上，腕橫紋上約 3 寸。",
    locationEn: "On the radial side of the dorsal forearm, on the line joining LI5 and LI11, 3 cun proximal to the wrist crease.",
    anatomy: [{ zh: "前臂背側", en: "dorsal forearm" }, { zh: "橈側", en: "radial side" }, { zh: "腕橫紋", en: "wrist crease" }],
    functions: "宣肺利水，通經活絡，清頭面。",
    functionsEn: "Diffuse the Lung, promote urination, open the channel, and clear the head and face.",
    patterns: ["水腫", "小便不利", "耳鳴", "牙痛", "前臂痛"],
    patternsEn: ["edema", "difficult urination", "tinnitus", "toothache", "forearm pain"],
    evidence: "大腸經絡穴，傳統常與肺經表裡關係一起理解。",
    techniqueNotes: "待依專業來源補入；依局部肌腱、血管與神經走向調整角度。",
    cautions: "前臂急性外傷、感染或神經症狀加重需醫療評估。",
    sources: ["https://www.acupoints.org/li6-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 76,
    y: 266
  },
  {
    code: "LI7",
    nameZh: "溫溜",
    nameEn: "Warm Flow",
    pinyin: "Wenliu",
    meridian: "Large Intestine / 大腸經",
    region: "前臂",
    location: "前臂背橈側，陽谿 LI5 與曲池 LI11 連線上，腕橫紋上約 5 寸。",
    locationEn: "On the radial side of the dorsal forearm, on the line joining LI5 and LI11, 5 cun proximal to the wrist crease.",
    anatomy: [{ zh: "前臂背側", en: "dorsal forearm" }, { zh: "橈側", en: "radial side" }],
    functions: "清熱解毒，理腸止痛，通絡。",
    functionsEn: "Clear heat, resolve toxicity, regulate the intestines, relieve pain, and open the channel.",
    patterns: ["咽喉腫痛", "面腫", "腸鳴腹痛", "前臂痛", "熱毒"],
    patternsEn: ["sore throat", "facial swelling", "intestinal rumbling and abdominal pain", "forearm pain", "heat toxin"],
    evidence: "大腸經郄穴，傳統用於急性痛證、熱證與局部經絡症狀。",
    techniqueNotes: "待依專業來源補入；急性腫痛需先分辨感染、外傷或神經血管問題。",
    cautions: "紅腫熱痛伴發燒或傷口感染需就醫。",
    sources: ["https://www.acupoints.org/li7-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 82,
    y: 250
  },
  {
    code: "LI8",
    nameZh: "下廉",
    nameEn: "Lower Ridge",
    pinyin: "Xialian",
    meridian: "Large Intestine / 大腸經",
    region: "前臂",
    location: "前臂背橈側，曲池 LI11 下約 4 寸，陽谿 LI5 與曲池 LI11 連線上。",
    locationEn: "On the radial side of the dorsal forearm, 4 cun distal to LI11, on the line joining LI5 and LI11.",
    anatomy: [{ zh: "前臂背側", en: "dorsal forearm" }, { zh: "橈側", en: "radial side" }],
    functions: "調腸胃，通經活絡，止痛。",
    functionsEn: "Regulate the intestines and Stomach, open the channel, and relieve pain.",
    patterns: ["腹痛", "腹瀉", "肘臂痛", "上肢痹痛", "經絡阻滯"],
    patternsEn: ["abdominal pain", "diarrhea", "elbow and arm pain", "upper limb painful obstruction", "channel obstruction"],
    evidence: "常作大腸經前臂局部與腸胃相關配穴。",
    techniqueNotes: "待依專業來源補入；上肢神經放射痛需先評估頸椎或周邊神經問題。",
    cautions: "急性腹痛、血便或持續腹瀉需醫療處理。",
    sources: ["https://www.acupoints.org/li8-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 88,
    y: 238
  },
  {
    code: "LI9",
    nameZh: "上廉",
    nameEn: "Upper Ridge",
    pinyin: "Shanglian",
    meridian: "Large Intestine / 大腸經",
    region: "前臂",
    location: "前臂背橈側，曲池 LI11 下約 3 寸，陽谿 LI5 與曲池 LI11 連線上。",
    locationEn: "On the radial side of the dorsal forearm, 3 cun distal to LI11, on the line joining LI5 and LI11.",
    anatomy: [{ zh: "前臂背側", en: "dorsal forearm" }, { zh: "橈側", en: "radial side" }],
    functions: "調腸胃，通絡止痛。",
    functionsEn: "Regulate the intestines and Stomach, open the channel, and relieve pain.",
    patterns: ["腹痛", "腸鳴", "肘臂痛", "手麻", "經絡阻滯"],
    patternsEn: ["abdominal pain", "intestinal rumbling", "elbow and arm pain", "hand numbness", "channel obstruction"],
    evidence: "常用於大腸經局部疼痛與腸胃症狀配穴。",
    techniqueNotes: "待依專業來源補入；手麻無力需排除神經壓迫或血管問題。",
    cautions: "上肢無力、麻木惡化或外傷後疼痛需就醫。",
    sources: ["https://www.acupoints.org/li9-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 94,
    y: 228
  },
  {
    code: "LI10",
    nameZh: "手三里",
    nameEn: "Arm Three Miles",
    pinyin: "Shousanli",
    meridian: "Large Intestine / 大腸經",
    region: "前臂",
    location: "前臂背橈側，曲池 LI11 下約 2 寸，陽谿 LI5 與曲池 LI11 連線上。",
    locationEn: "On the radial side of the dorsal forearm, 2 cun distal to LI11, on the line joining LI5 and LI11.",
    anatomy: [{ zh: "前臂背側", en: "dorsal forearm" }, { zh: "橈側", en: "radial side" }],
    functions: "調理腸胃，通絡止痛，扶正和中。",
    functionsEn: "Regulate the intestines and Stomach, open the channel, relieve pain, and support healthy qi.",
    patterns: ["腹痛", "腹瀉", "上肢痹痛", "肘臂痛", "氣虛乏力"],
    patternsEn: ["abdominal pain", "diarrhea", "upper limb painful obstruction", "elbow and arm pain", "qi deficiency fatigue"],
    evidence: "手三里為大腸經常用穴，臨床多見於腸胃與上肢疼痛配穴。",
    techniqueNotes: "待依專業來源補入；局部痠脹可為常見得氣感，需避免過強刺激。",
    cautions: "急性外傷、感染或神經症狀需先評估。",
    sources: ["https://www.acupoints.org/li10-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 100,
    y: 220
  },
  {
    code: "LI12",
    nameZh: "肘髎",
    nameEn: "Elbow Crevice",
    pinyin: "Zhouliao",
    meridian: "Large Intestine / 大腸經",
    region: "肘部",
    location: "屈肘，曲池 LI11 上方約 1 寸，肱骨外上髁前上方凹陷處。",
    locationEn: "With the elbow flexed, about 1 cun superior to LI11, in the depression anterior and superior to the lateral epicondyle of the humerus.",
    anatomy: [{ zh: "肱骨外上髁", en: "lateral epicondyle of the humerus" }, { zh: "肘部", en: "elbow" }],
    functions: "舒筋活絡，止肘臂痛。",
    functionsEn: "Relax the sinews, open the channel, and relieve elbow and arm pain.",
    patterns: ["肘痛", "上肢痹痛", "肘關節拘急", "經絡阻滯", "網球肘"],
    patternsEn: ["elbow pain", "upper limb painful obstruction", "elbow stiffness", "channel obstruction", "lateral elbow pain"],
    evidence: "以局部肘臂疼痛配穴為主；運動傷害需依結構診斷處理。",
    techniqueNotes: "待依專業來源補入；肘外側局部炎症明顯時刺激需保守。",
    cautions: "外傷後變形、明顯腫脹或活動受限需就醫。",
    sources: ["https://www.acupoints.org/li12-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 286,
    y: 204
  },
  {
    code: "LI13",
    nameZh: "手五里",
    nameEn: "Arm Five Miles",
    pinyin: "Shouwuli",
    meridian: "Large Intestine / 大腸經",
    region: "上臂",
    location: "上臂外側，曲池 LI11 與肩髃 LI15 連線上，曲池上約 3 寸。",
    locationEn: "On the lateral aspect of the upper arm, on the line joining LI11 and LI15, about 3 cun superior to LI11.",
    anatomy: [{ zh: "上臂外側", en: "lateral upper arm" }, { zh: "肱骨", en: "humerus" }],
    functions: "通經活絡，消腫散結。",
    functionsEn: "Open the channel, activate the collaterals, and reduce swelling or nodulation in traditional use.",
    patterns: ["上臂痛", "肘臂拘急", "瘰癧", "經絡阻滯", "氣血瘀滯"],
    patternsEn: ["upper arm pain", "elbow and arm stiffness", "scrofula", "channel obstruction", "qi and blood stasis"],
    evidence: "多作上臂局部疼痛與經絡症狀配穴。",
    techniqueNotes: "待依專業來源補入；上臂外側需注意局部神經血管與刺激量。",
    cautions: "不明腫塊、感染或淋巴結腫大需醫療評估。",
    sources: ["https://www.acupoints.org/li13-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 278,
    y: 178
  },
  {
    code: "LI14",
    nameZh: "臂臑",
    nameEn: "Upper Arm",
    pinyin: "Binao",
    meridian: "Large Intestine / 大腸經",
    region: "上臂",
    location: "上臂外側，曲池 LI11 與肩髃 LI15 連線上，曲池上約 7 寸，三角肌止點附近。",
    locationEn: "On the lateral aspect of the upper arm, on the line joining LI11 and LI15, about 7 cun superior to LI11, near the insertion of the deltoid.",
    anatomy: [{ zh: "三角肌", en: "deltoid muscle" }, { zh: "上臂外側", en: "lateral upper arm" }, { zh: "肱骨", en: "humerus" }],
    functions: "通絡止痛，明目散結。",
    functionsEn: "Open the channel, relieve pain, brighten the eyes, and disperse nodulation in traditional use.",
    patterns: ["肩臂痛", "上肢不舉", "目疾", "瘰癧", "經絡阻滯"],
    patternsEn: ["shoulder and arm pain", "inability to raise the arm", "eye disorders", "scrofula", "channel obstruction"],
    evidence: "常用於肩臂局部疼痛與活動受限配穴。",
    techniqueNotes: "待依專業來源補入；三角肌區刺激需依肌肉厚度與個體差異調整。",
    cautions: "肩臂外傷、神經症狀或不明腫塊需評估。",
    sources: ["https://www.acupoints.org/li14-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 266,
    y: 154
  },
  {
    code: "LI15",
    nameZh: "肩髃",
    nameEn: "Shoulder Bone",
    pinyin: "Jianyu",
    meridian: "Large Intestine / 大腸經",
    region: "肩部",
    location: "肩峰外側下方，肩關節外展時前方凹陷處。",
    locationEn: "Inferior to the lateral extremity of the acromion, in the anterior depression that appears when the arm is abducted.",
    anatomy: [{ zh: "肩峰", en: "acromion" }, { zh: "三角肌", en: "deltoid muscle" }, { zh: "肩關節", en: "shoulder joint" }],
    functions: "舒筋通絡，祛風止痛。",
    functionsEn: "Relax the sinews, open the channel, dispel wind, and relieve pain.",
    patterns: ["肩痛", "肩周炎", "上肢不舉", "風寒濕痹", "經絡阻滯"],
    patternsEn: ["shoulder pain", "frozen shoulder", "inability to raise the arm", "wind-cold-damp painful obstruction", "channel obstruction"],
    evidence: "肩髃是肩部疼痛與活動受限常用穴；需結合肩關節結構評估。",
    techniqueNotes: "待依專業來源補入；肩部深度與方向需避免不當深刺並考慮局部滑囊、肌腱與關節狀態。",
    cautions: "外傷後無力、疑似脫臼、感染或劇烈夜痛需醫療評估。",
    sources: ["https://www.acupoints.org/li15-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 252,
    y: 134
  },
  {
    code: "LI16",
    nameZh: "巨骨",
    nameEn: "Great Bone",
    pinyin: "Jugu",
    meridian: "Large Intestine / 大腸經",
    region: "肩部",
    location: "肩上部，鎖骨肩峰端與肩胛岡之間凹陷處。",
    locationEn: "On the upper aspect of the shoulder, in the depression between the acromial end of the clavicle and the spine of the scapula.",
    anatomy: [{ zh: "鎖骨肩峰端", en: "acromial end of the clavicle" }, { zh: "肩胛岡", en: "spine of the scapula" }, { zh: "肩部", en: "shoulder" }],
    functions: "通絡止痛，散結消腫。",
    functionsEn: "Open the channel, relieve pain, disperse nodulation, and reduce swelling in traditional use.",
    patterns: ["肩痛", "上肢不舉", "瘰癧", "肩背痛", "經絡阻滯"],
    patternsEn: ["shoulder pain", "inability to raise the arm", "scrofula", "shoulder and back pain", "channel obstruction"],
    evidence: "肩上部局部配穴，需注意肩鎖關節與鄰近深部結構。",
    techniqueNotes: "待依專業來源補入；肩上部與鎖骨附近不可粗暴深刺。",
    cautions: "肩鎖關節外傷、腫塊或感染需就醫。",
    sources: ["https://www.acupoints.org/li16-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 240,
    y: 126
  },
  {
    code: "LI17",
    nameZh: "天鼎",
    nameEn: "Heavenly Tripod",
    pinyin: "Tianding",
    meridian: "Large Intestine / 大腸經",
    region: "頸部",
    location: "頸外側，扶突 LI18 下方約 1 寸，胸鎖乳突肌後緣附近。",
    locationEn: "On the lateral neck, about 1 cun inferior to LI18, near the posterior border of sternocleidomastoid.",
    anatomy: [{ zh: "胸鎖乳突肌", en: "sternocleidomastoid muscle" }, { zh: "頸部", en: "neck" }],
    functions: "利咽開音，降氣散結。",
    functionsEn: "Benefit the throat, restore the voice, descend qi, and disperse nodulation.",
    patterns: ["咽喉腫痛", "失音", "瘰癧", "頸部腫塊", "氣逆"],
    patternsEn: ["sore throat", "loss of voice", "scrofula", "neck swelling", "rebellious qi"],
    evidence: "頸部穴位需以解剖安全為優先，常用於咽喉與頸部症狀配穴。",
    techniqueNotes: "待依專業來源補入；頸部靠近大血管、神經與氣管，需嚴格安全角度與深度。",
    cautions: "頸部腫塊、吞嚥困難、呼吸困難或血管疾病風險需醫療評估。",
    sources: ["https://www.acupoints.org/li17-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 224,
    y: 104
  },
  {
    code: "LI18",
    nameZh: "扶突",
    nameEn: "Support the Prominence",
    pinyin: "Futu",
    meridian: "Large Intestine / 大腸經",
    region: "頸部",
    location: "頸外側，喉結旁開約 3 寸，胸鎖乳突肌胸骨頭與鎖骨頭之間附近。",
    locationEn: "On the lateral neck, about 3 cun lateral to the laryngeal prominence, near the interval between the sternal and clavicular heads of sternocleidomastoid.",
    anatomy: [{ zh: "喉結", en: "laryngeal prominence" }, { zh: "胸鎖乳突肌", en: "sternocleidomastoid muscle" }, { zh: "頸部", en: "neck" }],
    functions: "利咽開音，止咳平喘，散結。",
    functionsEn: "Benefit the throat, restore the voice, stop cough, calm wheezing, and disperse nodulation.",
    patterns: ["咳嗽", "喘證", "咽喉腫痛", "失音", "瘰癧"],
    patternsEn: ["cough", "asthma or dyspnea", "sore throat", "loss of voice", "scrofula"],
    evidence: "頸部重要安全穴，臨床需明確避開頸動脈與深部危險結構。",
    techniqueNotes: "待依專業來源補入；頸動脈區禁止粗暴按壓或深刺，需專業訓練。",
    cautions: "頸動脈疾病、暈厥史、頸部腫塊、吞嚥/呼吸困難需醫療評估。",
    sources: ["https://www.acupoints.org/li18-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 216,
    y: 96
  },
  {
    code: "LI19",
    nameZh: "口禾髎",
    nameEn: "Mouth Grain Crevice",
    pinyin: "Kouheliao",
    meridian: "Large Intestine / 大腸經",
    region: "面部",
    location: "上唇部，水溝 GV26 旁開約 0.5 寸，鼻孔外緣下方附近。",
    locationEn: "On the upper lip, about 0.5 cun lateral to GV26, inferior to the lateral margin of the nostril.",
    anatomy: [{ zh: "上唇", en: "upper lip" }, { zh: "鼻孔", en: "nostril" }, { zh: "面部", en: "face" }],
    functions: "通鼻竅，祛風通絡。",
    functionsEn: "Open the nasal passages, dispel wind, and open the channel.",
    patterns: ["鼻塞", "鼻衄", "口眼歪斜", "面癱", "面部痛"],
    patternsEn: ["nasal obstruction", "epistaxis", "deviation of the mouth and eye", "facial paralysis", "facial pain"],
    evidence: "面鼻部局部配穴，常與 LI20 等鼻竅穴合用。",
    techniqueNotes: "待依專業來源補入；面部淺層操作需注意局部血管與皮膚狀態。",
    cautions: "面部感染、嚴重鼻出血、急性神經症狀需就醫。",
    sources: ["https://www.acupoints.org/li19-acupuncture-point/", "https://cloudtcm.com/acupoint"],
    x: 174,
    y: 78
  }
];

function standardPointSources(code) {
  return [`https://www.acupoints.org/${String(code).toLowerCase()}-acupuncture-point/`, "https://cloudtcm.com/acupoint"];
}

function standardPointVisualLinks(code) {
  const normalized = String(code || "").toLowerCase();
  return [
    {
      labelZh: "AcuPoints 英文定位圖",
      labelEn: "AcuPoints location image",
      url: `https://www.acupoints.org/${normalized}-acupuncture-point/`,
      source: "AcuPoints.org"
    },
    {
      labelZh: "CloudTCM 中文穴位圖",
      labelEn: "CloudTCM Chinese point page",
      url: "https://cloudtcm.com/acupoint",
      source: "CloudTCM"
    }
  ];
}

function auricularPointVisualLinks(code) {
  const normalized = String(code || "").toUpperCase();
  const links = [
    {
      labelZh: "GB93 耳穴定位圖",
      labelEn: "GB93 auricular point image",
      url: `https://acupun.site/point_list_Ear93GB.aspx?pointId=${encodeURIComponent(normalized)}`,
      source: "acupun.site"
    },
    {
      labelZh: "耳針療法總覽圖",
      labelEn: "Auricular therapy overview",
      url: "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95",
      source: "A+醫學百科"
    }
  ];
  return links;
}

function tungPointVisualLinks(record = {}) {
  const searchTerm = record.name_en || record.display_code || record.code || "Master Tung acupuncture";
  return [
    {
      labelZh: "eLotus / Master Tung 圖文搜尋",
      labelEn: "eLotus / Master Tung visual search",
      url: `https://www.mastertungacupuncture.org/?s=${encodeURIComponent(searchTerm)}`,
      source: "MasterTungAcupuncture.org"
    },
    {
      labelZh: "Master Tung 穴位資料庫",
      labelEn: "Master Tung point database",
      url: "https://www.mastertungacupuncture.org/",
      source: "MasterTungAcupuncture.org"
    }
  ];
}

const stomachMeridianExpansion = [
  {
    code: "ST1",
    nameZh: "承泣",
    nameEn: "Tears Container",
    pinyin: "Chengqi",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "目正視，瞳孔直下，眼球與眶下緣之間。",
    locationEn: "Directly below the pupil, between the eyeball and the infraorbital margin.",
    anatomy: [{ zh: "眶下緣", en: "infraorbital margin" }, { zh: "眼球", en: "eyeball" }],
    functions: "明目止淚，疏風清熱。",
    functionsEn: "Brighten the eyes, stop tearing, dispel wind, and clear heat.",
    patterns: ["目赤腫痛", "流淚", "近視", "夜盲", "眼瞼瞤動"],
    patternsEn: ["red swollen painful eyes", "tearing", "myopia", "night blindness", "eyelid twitching"],
    evidence: "眼周穴位需以安全操作為首要，臨床多作眼部症狀配穴。",
    techniqueNotes: "眼周危險區，禁止粗暴深刺；需由受訓專業人員依眼眶解剖操作。",
    cautions: "眼外傷、急性視力下降、劇烈眼痛或感染需立即就醫。",
    sources: standardPointSources("ST1"),
    x: 176,
    y: 62
  },
  {
    code: "ST2",
    nameZh: "四白",
    nameEn: "Four Whites",
    pinyin: "Sibai",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "目正視，瞳孔直下，眶下孔凹陷處。",
    locationEn: "Directly below the pupil, in the depression at the infraorbital foramen.",
    anatomy: [{ zh: "眶下孔", en: "infraorbital foramen" }, { zh: "眶下神經", en: "infraorbital nerve" }],
    functions: "明目，祛風通絡。",
    functionsEn: "Brighten the eyes, dispel wind, and open the collaterals.",
    patterns: ["目赤", "目痛", "面癱", "眼瞼瞤動", "面痛"],
    patternsEn: ["red eyes", "eye pain", "facial paralysis", "eyelid twitching", "facial pain"],
    evidence: "面眼部常用穴，需避開眶下孔神經血管束過度刺激。",
    techniqueNotes: "面部淺層操作；避免向眼球方向深刺。",
    cautions: "急性眼疾或面部感染時避開。",
    sources: standardPointSources("ST2"),
    x: 176,
    y: 70
  },
  {
    code: "ST3",
    nameZh: "巨髎",
    nameEn: "Great Crevice",
    pinyin: "Juliao",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "鼻翼下緣平線與瞳孔直下線交會處。",
    locationEn: "At the intersection of the vertical line through the pupil and the horizontal line level with the lower border of the ala nasi.",
    anatomy: [{ zh: "鼻翼", en: "ala nasi" }, { zh: "顴骨", en: "zygomatic bone" }],
    functions: "祛風通絡，消腫止痛。",
    functionsEn: "Dispel wind, open the collaterals, reduce swelling, and relieve pain.",
    patterns: ["面癱", "面痛", "鼻塞", "牙痛", "面腫"],
    patternsEn: ["facial paralysis", "facial pain", "nasal obstruction", "toothache", "facial swelling"],
    evidence: "常見於面部神經與鼻齒症狀配穴。",
    techniqueNotes: "面部淺層操作；注意局部血管與神經。",
    cautions: "面部感染、急性神經症狀或不明腫脹需就醫。",
    sources: standardPointSources("ST3"),
    x: 170,
    y: 76
  },
  {
    code: "ST4",
    nameZh: "地倉",
    nameEn: "Earth Granary",
    pinyin: "Dicang",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "口角旁開約 0.4 寸。",
    locationEn: "About 0.4 cun lateral to the corner of the mouth.",
    anatomy: [{ zh: "口角", en: "corner of the mouth" }, { zh: "口輪匝肌", en: "orbicularis oris" }],
    functions: "祛風通絡，調口面。",
    functionsEn: "Dispel wind, open the collaterals, and regulate the mouth and face.",
    patterns: ["口眼歪斜", "流涎", "面癱", "面痛", "齒痛"],
    patternsEn: ["deviation of the mouth and eye", "drooling", "facial paralysis", "facial pain", "toothache"],
    evidence: "面癱與口面症狀常用配穴。",
    techniqueNotes: "常作面部局部淺層操作；需避開感染與皮膚病灶。",
    cautions: "突發口歪伴肢體無力或言語困難需立即排除中風。",
    sources: standardPointSources("ST4"),
    x: 172,
    y: 88
  },
  {
    code: "ST5",
    nameZh: "大迎",
    nameEn: "Great Welcome",
    pinyin: "Daying",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "下頜角前方，咬肌前緣，面動脈搏動處附近。",
    locationEn: "Anterior to the angle of the mandible, near the anterior border of masseter and the facial artery pulse.",
    anatomy: [{ zh: "下頜角", en: "angle of the mandible" }, { zh: "咬肌", en: "masseter" }, { zh: "面動脈", en: "facial artery" }],
    functions: "祛風通絡，消腫止痛。",
    functionsEn: "Dispel wind, open the collaterals, reduce swelling, and relieve pain.",
    patterns: ["牙痛", "頰腫", "面癱", "三叉神經痛", "口噤"],
    patternsEn: ["toothache", "cheek swelling", "facial paralysis", "trigeminal neuralgia", "lockjaw"],
    evidence: "頜面部疼痛與牙齒症狀配穴常見。",
    techniqueNotes: "避開面動脈搏動處強刺激。",
    cautions: "牙源性感染、蜂窩組織炎或張口困難加重需就醫。",
    sources: standardPointSources("ST5"),
    x: 188,
    y: 100
  },
  {
    code: "ST6",
    nameZh: "頰車",
    nameEn: "Jaw Bone",
    pinyin: "Jiache",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "下頜角前上方約一橫指，咬緊牙時咬肌隆起處。",
    locationEn: "One finger-breadth anterior and superior to the angle of the mandible, at the prominence of masseter when the teeth are clenched.",
    anatomy: [{ zh: "咬肌", en: "masseter" }, { zh: "下頜骨", en: "mandible" }],
    functions: "祛風通絡，開關止痛。",
    functionsEn: "Dispel wind, open the collaterals, relax the jaw, and relieve pain.",
    patterns: ["牙痛", "口噤", "面癱", "頰腫", "下頜痛"],
    patternsEn: ["toothache", "lockjaw", "facial paralysis", "cheek swelling", "mandibular pain"],
    evidence: "咬肌與顳顎區症狀常見局部配穴。",
    techniqueNotes: "咬肌區操作需依肌肉厚度與疼痛敏感度調整。",
    cautions: "顳顎關節急性卡住、外傷或感染需評估。",
    sources: standardPointSources("ST6"),
    x: 198,
    y: 100
  },
  {
    code: "ST7",
    nameZh: "下關",
    nameEn: "Below the Joint",
    pinyin: "Xiaguan",
    meridian: "Stomach / 胃經",
    region: "面部",
    location: "顴弓下緣，下頜骨髁突前方凹陷處，閉口取穴。",
    locationEn: "Inferior to the zygomatic arch, in the depression anterior to the condyloid process of the mandible; locate with the mouth closed.",
    anatomy: [{ zh: "顴弓", en: "zygomatic arch" }, { zh: "下頜骨髁突", en: "mandibular condyle" }, { zh: "顳顎關節", en: "temporomandibular joint" }],
    functions: "利耳開關，通絡止痛。",
    functionsEn: "Benefit the ear, relax the jaw, open the channel, and relieve pain.",
    patterns: ["耳鳴", "耳聾", "牙痛", "面痛", "顳顎關節痛"],
    patternsEn: ["tinnitus", "hearing loss", "toothache", "facial pain", "TMJ pain"],
    evidence: "耳、齒、顳顎關節症狀常用局部配穴。",
    techniqueNotes: "顳顎關節附近操作需避免粗暴深刺或強按。",
    cautions: "急性耳痛、突發聽力下降或下頜外傷需就醫。",
    sources: standardPointSources("ST7"),
    x: 208,
    y: 84
  },
  {
    code: "ST8",
    nameZh: "頭維",
    nameEn: "Head Corner",
    pinyin: "Touwei",
    meridian: "Stomach / 胃經",
    region: "頭面",
    location: "額角髮際上約 0.5 寸，頭正中線旁約 4.5 寸。",
    locationEn: "0.5 cun within the anterior hairline at the corner of the forehead, about 4.5 cun lateral to the midline.",
    anatomy: [{ zh: "額角", en: "frontal corner" }, { zh: "髮際", en: "hairline" }],
    functions: "清頭明目，止痛。",
    functionsEn: "Clear the head, brighten the eyes, and relieve pain.",
    patterns: ["頭痛", "目眩", "目痛", "偏頭痛", "風熱"],
    patternsEn: ["headache", "dizziness", "eye pain", "migraine", "wind-heat"],
    evidence: "頭痛與眼周症狀常用頭部配穴。",
    techniqueNotes: "頭皮部位多作淺層或平刺類操作，待專業來源補深度方向。",
    cautions: "突發劇烈頭痛、神經症狀或視力改變需急診評估。",
    sources: standardPointSources("ST8"),
    x: 218,
    y: 54
  },
  {
    code: "ST9",
    nameZh: "人迎",
    nameEn: "Man's Prognosis",
    pinyin: "Renying",
    meridian: "Stomach / 胃經",
    region: "頸部",
    location: "喉結旁開約 1.5 寸，胸鎖乳突肌前緣，頸總動脈搏動處。",
    locationEn: "Level with the laryngeal prominence, anterior to sternocleidomastoid, over the common carotid artery pulse, about 1.5 cun lateral to the midline.",
    anatomy: [{ zh: "喉結", en: "laryngeal prominence" }, { zh: "胸鎖乳突肌", en: "sternocleidomastoid" }, { zh: "頸總動脈", en: "common carotid artery" }],
    functions: "利咽降逆，調氣血。",
    functionsEn: "Benefit the throat, descend rebellious qi, and regulate qi and blood.",
    patterns: ["咽喉腫痛", "喘證", "高血壓", "頭暈", "甲狀腺腫"],
    patternsEn: ["sore throat", "dyspnea", "hypertension", "dizziness", "thyroid swelling"],
    evidence: "頸動脈區安全風險極高，僅作專業定位學習。",
    techniqueNotes: "頸動脈搏動處禁止深刺或強壓；需專業訓練。",
    cautions: "頸動脈疾病、暈厥、胸痛、神經症狀或血壓危象需醫療處理。",
    sources: standardPointSources("ST9"),
    x: 204,
    y: 104
  },
  {
    code: "ST10",
    nameZh: "水突",
    nameEn: "Water Prominence",
    pinyin: "Shuitu",
    meridian: "Stomach / 胃經",
    region: "頸部",
    location: "頸部，ST9 與 ST11 連線中點，胸鎖乳突肌前緣附近。",
    locationEn: "On the neck, midway between ST9 and ST11, near the anterior border of sternocleidomastoid.",
    anatomy: [{ zh: "胸鎖乳突肌", en: "sternocleidomastoid" }, { zh: "頸部", en: "neck" }],
    functions: "利咽散結，降逆平喘。",
    functionsEn: "Benefit the throat, disperse nodulation, descend rebellious qi, and calm wheezing.",
    patterns: ["咽喉腫痛", "咳喘", "瘰癧", "甲狀腺腫", "氣逆"],
    patternsEn: ["sore throat", "cough and wheezing", "scrofula", "thyroid swelling", "rebellious qi"],
    evidence: "頸部穴位需與大血管、氣管、神經安全相關。",
    techniqueNotes: "頸部慎刺；待專業來源補深度方向。",
    cautions: "頸部腫塊、吞嚥困難或呼吸困難需就醫。",
    sources: standardPointSources("ST10"),
    x: 202,
    y: 112
  },
  {
    code: "ST11",
    nameZh: "氣舍",
    nameEn: "Qi Abode",
    pinyin: "Qishe",
    meridian: "Stomach / 胃經",
    region: "頸部",
    location: "鎖骨上緣，胸鎖乳突肌胸骨頭與鎖骨頭之間凹陷處。",
    locationEn: "Superior to the clavicle, in the depression between the sternal and clavicular heads of sternocleidomastoid.",
    anatomy: [{ zh: "鎖骨", en: "clavicle" }, { zh: "胸鎖乳突肌", en: "sternocleidomastoid" }, { zh: "鎖骨上窩", en: "supraclavicular fossa" }],
    functions: "利咽降逆，寬胸理氣。",
    functionsEn: "Benefit the throat, descend rebellious qi, open the chest, and regulate qi.",
    patterns: ["咽喉腫痛", "喘咳", "胸滿", "瘰癧", "氣逆"],
    patternsEn: ["sore throat", "cough and dyspnea", "chest fullness", "scrofula", "rebellious qi"],
    evidence: "鎖骨上區需高度注意肺尖與大血管風險。",
    techniqueNotes: "鎖骨上危險區，禁止不當深刺；需專業訓練。",
    cautions: "胸痛、呼吸困難或鎖骨上腫塊需醫療評估。",
    sources: standardPointSources("ST11"),
    x: 198,
    y: 124
  },
  {
    code: "ST12",
    nameZh: "缺盆",
    nameEn: "Empty Basin",
    pinyin: "Quepen",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "鎖骨上窩中央，前正中線旁開約 4 寸。",
    locationEn: "In the midpoint of the supraclavicular fossa, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "鎖骨上窩", en: "supraclavicular fossa" }, { zh: "肺尖", en: "apex of lung" }, { zh: "鎖骨下血管", en: "subclavian vessels" }],
    functions: "寬胸降逆，利咽止咳。",
    functionsEn: "Open the chest, descend rebellious qi, benefit the throat, and stop cough.",
    patterns: ["咳嗽", "喘證", "胸滿", "咽喉腫痛", "缺盆痛"],
    patternsEn: ["cough", "dyspnea", "chest fullness", "sore throat", "supraclavicular pain"],
    evidence: "鎖骨上窩為高風險區，涉及肺尖與大血管。",
    techniqueNotes: "高風險禁深刺區；需專業來源逐字核對操作。",
    cautions: "氣胸風險區；胸痛、呼吸困難不可自行處理。",
    sources: standardPointSources("ST12"),
    x: 146,
    y: 132
  },
  {
    code: "ST13",
    nameZh: "氣戶",
    nameEn: "Qi Door",
    pinyin: "Qihu",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "鎖骨下緣，前正中線旁開約 4 寸。",
    locationEn: "Inferior to the clavicle, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "鎖骨", en: "clavicle" }, { zh: "胸大肌", en: "pectoralis major" }, { zh: "肋間隙", en: "intercostal space" }],
    functions: "寬胸理氣，止咳平喘。",
    functionsEn: "Open the chest, regulate qi, stop cough, and calm wheezing.",
    patterns: ["咳嗽", "喘證", "胸痛", "胸悶", "氣逆"],
    patternsEn: ["cough", "dyspnea", "chest pain", "chest oppression", "rebellious qi"],
    evidence: "胸部穴位需注意氣胸與局部血管風險。",
    techniqueNotes: "胸部慎深刺；方向與深度需依專業來源。",
    cautions: "胸痛或呼吸困難需先排除急症。",
    sources: standardPointSources("ST13"),
    x: 142,
    y: 144
  },
  {
    code: "ST14",
    nameZh: "庫房",
    nameEn: "Storehouse",
    pinyin: "Kufang",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "第 1 肋間隙，前正中線旁開約 4 寸。",
    locationEn: "In the first intercostal space, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "第1肋間隙", en: "first intercostal space" }, { zh: "胸大肌", en: "pectoralis major" }],
    functions: "寬胸理氣，止咳平喘。",
    functionsEn: "Open the chest, regulate qi, stop cough, and calm wheezing.",
    patterns: ["咳嗽", "喘證", "胸悶", "胸痛", "痰飲"],
    patternsEn: ["cough", "dyspnea", "chest oppression", "chest pain", "phlegm-fluid"],
    evidence: "胸部肋間穴位需注意肺臟風險。",
    techniqueNotes: "胸部禁不當深刺；待專業來源補操作。",
    cautions: "胸痛、咳血或呼吸困難需就醫。",
    sources: standardPointSources("ST14"),
    x: 140,
    y: 156
  },
  {
    code: "ST15",
    nameZh: "屋翳",
    nameEn: "Room Screen",
    pinyin: "Wuyi",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "第 2 肋間隙，前正中線旁開約 4 寸。",
    locationEn: "In the second intercostal space, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "第2肋間隙", en: "second intercostal space" }, { zh: "胸大肌", en: "pectoralis major" }],
    functions: "寬胸止咳，消癰散結。",
    functionsEn: "Open the chest, stop cough, reduce abscess, and disperse nodulation.",
    patterns: ["咳嗽", "喘證", "胸痛", "乳癰", "胸悶"],
    patternsEn: ["cough", "dyspnea", "chest pain", "breast abscess", "chest oppression"],
    evidence: "胸乳區配穴，需結合乳房與胸壁安全評估。",
    techniqueNotes: "胸部慎深刺；乳房病變需先醫療評估。",
    cautions: "乳房紅腫熱痛、硬塊或胸痛需就醫。",
    sources: standardPointSources("ST15"),
    x: 138,
    y: 170
  },
  {
    code: "ST16",
    nameZh: "膺窗",
    nameEn: "Breast Window",
    pinyin: "Yingchuang",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "第 3 肋間隙，前正中線旁開約 4 寸。",
    locationEn: "In the third intercostal space, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "第3肋間隙", en: "third intercostal space" }, { zh: "胸大肌", en: "pectoralis major" }],
    functions: "寬胸理氣，通乳散結。",
    functionsEn: "Open the chest, regulate qi, promote lactation, and disperse nodulation.",
    patterns: ["胸痛", "乳癰", "乳少", "咳喘", "胸悶"],
    patternsEn: ["chest pain", "breast abscess", "insufficient lactation", "cough and dyspnea", "chest oppression"],
    evidence: "胸乳部位安全與乳房病變鑑別重要。",
    techniqueNotes: "胸乳區慎刺；待專業來源補操作細節。",
    cautions: "乳房腫塊、不明分泌物或感染需就醫。",
    sources: standardPointSources("ST16"),
    x: 136,
    y: 184
  },
  {
    code: "ST17",
    nameZh: "乳中",
    nameEn: "Breast Center",
    pinyin: "Ruzhong",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "乳頭中央。",
    locationEn: "At the center of the nipple.",
    anatomy: [{ zh: "乳頭", en: "nipple" }, { zh: "乳房", en: "breast" }],
    functions: "定位標誌穴，通常不作針灸治療穴。",
    functionsEn: "An anatomical reference point; generally not used for needling or moxibustion.",
    patterns: ["定位參考", "胸部標誌", "乳房標誌"],
    patternsEn: ["location reference", "chest landmark", "breast landmark"],
    evidence: "多作胸部定位標誌，不作治療操作。",
    techniqueNotes: "禁刺禁灸。",
    cautions: "不針不灸；乳房症狀需依醫療評估。",
    sources: standardPointSources("ST17"),
    x: 136,
    y: 198
  },
  {
    code: "ST18",
    nameZh: "乳根",
    nameEn: "Breast Root",
    pinyin: "Rugen",
    meridian: "Stomach / 胃經",
    region: "胸部",
    location: "第 5 肋間隙，乳頭直下，前正中線旁開約 4 寸。",
    locationEn: "In the fifth intercostal space, directly below the nipple, about 4 cun lateral to the anterior midline.",
    anatomy: [{ zh: "第5肋間隙", en: "fifth intercostal space" }, { zh: "乳房", en: "breast" }],
    functions: "寬胸止痛，通乳散結。",
    functionsEn: "Open the chest, relieve pain, promote lactation, and disperse nodulation.",
    patterns: ["胸痛", "乳癰", "乳少", "咳喘", "胸脅滿"],
    patternsEn: ["chest pain", "breast abscess", "insufficient lactation", "cough and dyspnea", "chest and hypochondriac fullness"],
    evidence: "胸乳部位常用於乳房與胸部症狀配穴，安全需優先。",
    techniqueNotes: "胸部慎刺，避免不當深刺。",
    cautions: "胸痛、乳房腫塊或感染需就醫。",
    sources: standardPointSources("ST18"),
    x: 136,
    y: 216
  },
  {
    code: "ST19",
    nameZh: "不容",
    nameEn: "Not Contained",
    pinyin: "Burong",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 6 寸，前正中線旁開 2 寸。",
    locationEn: "On the upper abdomen, 6 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "臍", en: "umbilicus" }],
    functions: "和胃降逆，寬胸止痛。",
    functionsEn: "Harmonize the Stomach, descend rebellious qi, open the chest, and relieve pain.",
    patterns: ["胃痛", "嘔吐", "食少", "胸脅滿", "胃氣上逆"],
    patternsEn: ["stomach pain", "vomiting", "poor appetite", "chest and hypochondriac fullness", "rebellious Stomach qi"],
    evidence: "上腹胃脘症狀配穴。",
    techniqueNotes: "腹部深度需依體型與臟器位置保守評估。",
    cautions: "急腹症、嘔血、黑便或劇烈腹痛需就醫。",
    sources: standardPointSources("ST19"),
    x: 154,
    y: 250
  },
  {
    code: "ST20",
    nameZh: "承滿",
    nameEn: "Supporting Fullness",
    pinyin: "Chengman",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 5 寸，前正中線旁開 2 寸。",
    locationEn: "On the upper abdomen, 5 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "上腹部", en: "upper abdomen" }],
    functions: "和胃降逆，消脹滿。",
    functionsEn: "Harmonize the Stomach, descend rebellious qi, and reduce fullness.",
    patterns: ["胃脹", "嘔吐", "食少", "腹滿", "胃痛"],
    patternsEn: ["epigastric distension", "vomiting", "poor appetite", "abdominal fullness", "stomach pain"],
    evidence: "胃脘脹滿與消化症狀配穴。",
    techniqueNotes: "腹部操作需依體型、孕期與臟器位置判斷。",
    cautions: "急性腹痛、妊娠或不明腫塊需評估。",
    sources: standardPointSources("ST20"),
    x: 154,
    y: 266
  },
  {
    code: "ST21",
    nameZh: "梁門",
    nameEn: "Beam Gate",
    pinyin: "Liangmen",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 4 寸，前正中線旁開 2 寸。",
    locationEn: "On the upper abdomen, 4 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "胃脘", en: "epigastrium" }],
    functions: "和胃止痛，消食導滯。",
    functionsEn: "Harmonize the Stomach, relieve pain, promote digestion, and move food stagnation.",
    patterns: ["胃痛", "嘔吐", "食積", "腹脹", "胃氣上逆"],
    patternsEn: ["stomach pain", "vomiting", "food stagnation", "abdominal distension", "rebellious Stomach qi"],
    evidence: "胃脘痛與食積症狀常用配穴。",
    techniqueNotes: "腹部深度需依體型與安全來源。",
    cautions: "劇烈胃痛、黑便、嘔血需醫療處理。",
    sources: standardPointSources("ST21"),
    x: 154,
    y: 280
  },
  {
    code: "ST22",
    nameZh: "關門",
    nameEn: "Pass Gate",
    pinyin: "Guanmen",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 3 寸，前正中線旁開 2 寸。",
    locationEn: "On the upper abdomen, 3 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "腹部", en: "abdomen" }],
    functions: "調理腸胃，利水消腫。",
    functionsEn: "Regulate the intestines and Stomach, promote urination, and reduce swelling.",
    patterns: ["腹脹", "腸鳴", "腹痛", "水腫", "食少"],
    patternsEn: ["abdominal distension", "intestinal rumbling", "abdominal pain", "edema", "poor appetite"],
    evidence: "腹部腸胃與水濕相關配穴。",
    techniqueNotes: "腹部操作需避開急腹症與孕期風險。",
    cautions: "腹痛伴發燒、反彈痛、血便需就醫。",
    sources: standardPointSources("ST22"),
    x: 154,
    y: 296
  },
  {
    code: "ST23",
    nameZh: "太乙",
    nameEn: "Great Unity",
    pinyin: "Taiyi",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 2 寸，前正中線旁開 2 寸。",
    locationEn: "On the upper abdomen, 2 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "腹部", en: "abdomen" }],
    functions: "和胃安神，消脹止痛。",
    functionsEn: "Harmonize the Stomach, calm the spirit, reduce distension, and relieve pain.",
    patterns: ["胃痛", "腹脹", "心煩", "癲狂", "食少"],
    patternsEn: ["stomach pain", "abdominal distension", "restlessness", "mania or agitation", "poor appetite"],
    evidence: "胃腸與情志相關傳統配穴，需依辨證使用。",
    techniqueNotes: "腹部操作需保守評估深度。",
    cautions: "精神急症或劇烈腹痛需專業醫療處理。",
    sources: standardPointSources("ST23"),
    x: 154,
    y: 312
  },
  {
    code: "ST24",
    nameZh: "滑肉門",
    nameEn: "Slippery Flesh Gate",
    pinyin: "Huaroumen",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "上腹部，臍上 1 寸，前正中線旁開 2 寸。",
    locationEn: "On the abdomen, 1 cun superior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "臍", en: "umbilicus" }],
    functions: "和胃化痰，安神定志。",
    functionsEn: "Harmonize the Stomach, transform phlegm, and calm the spirit.",
    patterns: ["腹痛", "嘔吐", "癲狂", "痰濁", "胃氣不和"],
    patternsEn: ["abdominal pain", "vomiting", "mania or agitation", "phlegm turbidity", "Stomach disharmony"],
    evidence: "腹部胃腸與痰擾心神相關傳統配穴。",
    techniqueNotes: "腹部慎刺，待專業來源補深度。",
    cautions: "急腹症或妊娠需避開自行處理。",
    sources: standardPointSources("ST24"),
    x: 154,
    y: 328
  },
  {
    code: "ST26",
    nameZh: "外陵",
    nameEn: "Outer Mound",
    pinyin: "Wailing",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "下腹部，臍下 1 寸，前正中線旁開 2 寸。",
    locationEn: "On the lower abdomen, 1 cun inferior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "下腹部", en: "lower abdomen" }],
    functions: "理氣止痛，調下焦。",
    functionsEn: "Regulate qi, relieve pain, and regulate the lower burner.",
    patterns: ["腹痛", "疝氣", "痛經", "下腹痛", "氣滯"],
    patternsEn: ["abdominal pain", "hernial disorder", "dysmenorrhea", "lower abdominal pain", "qi stagnation"],
    evidence: "下腹部疼痛與氣滯症狀配穴。",
    techniqueNotes: "下腹部操作需考慮妊娠、膀胱與腹腔安全。",
    cautions: "妊娠、不明下腹痛或急腹症需醫療評估。",
    sources: standardPointSources("ST26"),
    x: 154,
    y: 360
  },
  {
    code: "ST27",
    nameZh: "大巨",
    nameEn: "Great Gigantic",
    pinyin: "Daju",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "下腹部，臍下 2 寸，前正中線旁開 2 寸。",
    locationEn: "On the lower abdomen, 2 cun inferior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "腹直肌", en: "rectus abdominis" }, { zh: "下腹部", en: "lower abdomen" }],
    functions: "調腸胃，理氣止痛，調下焦。",
    functionsEn: "Regulate the intestines and Stomach, move qi, relieve pain, and regulate the lower burner.",
    patterns: ["小腹痛", "疝氣", "便秘", "小便不利", "痛經"],
    patternsEn: ["lower abdominal pain", "hernial disorder", "constipation", "difficult urination", "dysmenorrhea"],
    evidence: "下腹部腸胃、泌尿、生殖相關傳統配穴。",
    techniqueNotes: "下腹部深度需依體型與臟器位置；孕期慎用。",
    cautions: "急性腹痛、妊娠或泌尿感染症狀需就醫。",
    sources: standardPointSources("ST27"),
    x: 154,
    y: 374
  },
  {
    code: "ST28",
    nameZh: "水道",
    nameEn: "Water Passage",
    pinyin: "Shuidao",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "下腹部，臍下 3 寸，前正中線旁開 2 寸。",
    locationEn: "On the lower abdomen, 3 cun inferior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "下腹部", en: "lower abdomen" }, { zh: "膀胱", en: "urinary bladder" }],
    functions: "利水通淋，調經止痛。",
    functionsEn: "Promote urination, benefit strangury, regulate menstruation, and relieve pain.",
    patterns: ["小便不利", "水腫", "痛經", "不孕", "下腹痛"],
    patternsEn: ["difficult urination", "edema", "dysmenorrhea", "infertility", "lower abdominal pain"],
    evidence: "泌尿與婦科相關傳統配穴。",
    techniqueNotes: "下腹部與膀胱區需確認排尿狀態與孕期風險。",
    cautions: "尿閉、血尿、妊娠或急性腹痛需就醫。",
    sources: standardPointSources("ST28"),
    x: 154,
    y: 388
  },
  {
    code: "ST29",
    nameZh: "歸來",
    nameEn: "Return",
    pinyin: "Guilai",
    meridian: "Stomach / 胃經",
    region: "腹部",
    location: "下腹部，臍下 4 寸，前正中線旁開 2 寸。",
    locationEn: "On the lower abdomen, 4 cun inferior to the umbilicus and 2 cun lateral to the anterior midline.",
    anatomy: [{ zh: "下腹部", en: "lower abdomen" }, { zh: "腹股溝", en: "inguinal region" }],
    functions: "溫經散寒，調經止痛。",
    functionsEn: "Warm the channel, disperse cold, regulate menstruation, and relieve pain.",
    patterns: ["痛經", "月經不調", "不孕", "疝氣", "小腹冷痛"],
    patternsEn: ["dysmenorrhea", "irregular menstruation", "infertility", "hernial disorder", "cold lower abdominal pain"],
    evidence: "婦科與下腹寒凝相關傳統配穴。",
    techniqueNotes: "下腹部慎刺；孕期或疑似妊娠需避免自行刺激。",
    cautions: "不明陰道出血、妊娠或劇烈下腹痛需就醫。",
    sources: standardPointSources("ST29"),
    x: 154,
    y: 404
  },
  {
    code: "ST30",
    nameZh: "氣衝",
    nameEn: "Surging Qi",
    pinyin: "Qichong",
    meridian: "Stomach / 胃經",
    region: "腹股溝",
    location: "腹股溝上方，恥骨聯合上緣旁開約 2 寸，股動脈搏動附近。",
    locationEn: "Superior to the inguinal groove, about 2 cun lateral to the superior border of the pubic symphysis, near the femoral artery pulse.",
    anatomy: [{ zh: "腹股溝", en: "inguinal region" }, { zh: "恥骨聯合", en: "pubic symphysis" }, { zh: "股動脈", en: "femoral artery" }],
    functions: "調衝任，理氣止痛。",
    functionsEn: "Regulate the Chong and Ren vessels, move qi, and relieve pain.",
    patterns: ["疝氣", "月經不調", "不孕", "小腹痛", "奔豚氣"],
    patternsEn: ["hernial disorder", "irregular menstruation", "infertility", "lower abdominal pain", "running piglet qi"],
    evidence: "腹股溝大血管區，安全定位非常重要。",
    techniqueNotes: "靠近股動脈，禁止粗暴深刺或強壓搏動處。",
    cautions: "腹股溝腫塊、血管疾病、劇烈下腹痛需醫療評估。",
    sources: standardPointSources("ST30"),
    x: 154,
    y: 424
  },
  {
    code: "ST31",
    nameZh: "髀關",
    nameEn: "Thigh Gate",
    pinyin: "Biguan",
    meridian: "Stomach / 胃經",
    region: "大腿",
    location: "大腿前外側，髂前上棘與髕底外側端連線上，股直肌與闊筋膜張肌之間。",
    locationEn: "On the anterolateral thigh, on the line between the anterior superior iliac spine and the lateral border of the patella, between rectus femoris and tensor fasciae latae.",
    anatomy: [{ zh: "髂前上棘", en: "anterior superior iliac spine" }, { zh: "股直肌", en: "rectus femoris" }, { zh: "闊筋膜張肌", en: "tensor fasciae latae" }],
    functions: "舒筋活絡，強腰膝。",
    functionsEn: "Relax the sinews, open the channel, and strengthen the lumbar region and knees.",
    patterns: ["髖痛", "下肢痿痹", "膝痛", "腰腿痛", "經絡阻滯"],
    patternsEn: ["hip pain", "lower limb weakness or painful obstruction", "knee pain", "lumbar and leg pain", "channel obstruction"],
    evidence: "髖腿局部症狀配穴。",
    techniqueNotes: "大腿肌肉層深度需依體型與專業來源。",
    cautions: "髖部外傷、無力麻木或不能負重需就醫。",
    sources: standardPointSources("ST31"),
    x: 220,
    y: 412
  },
  {
    code: "ST32",
    nameZh: "伏兔",
    nameEn: "Crouching Rabbit",
    pinyin: "Futu",
    meridian: "Stomach / 胃經",
    region: "大腿",
    location: "大腿前面，髕底外側端上 6 寸，股直肌上。",
    locationEn: "On the anterior thigh, 6 cun superior to the laterosuperior border of the patella, on rectus femoris.",
    anatomy: [{ zh: "股直肌", en: "rectus femoris" }, { zh: "髕骨", en: "patella" }],
    functions: "舒筋活絡，止痛。",
    functionsEn: "Relax the sinews, open the channel, and relieve pain.",
    patterns: ["膝痛", "下肢痿痹", "腿痛", "寒濕痹", "經絡阻滯"],
    patternsEn: ["knee pain", "lower limb weakness or painful obstruction", "leg pain", "cold-damp painful obstruction", "channel obstruction"],
    evidence: "大腿前側局部症狀配穴。",
    techniqueNotes: "股四頭肌區操作需依肌肉厚度與刺激量。",
    cautions: "外傷、腫脹、疑似血栓或神經症狀需就醫。",
    sources: standardPointSources("ST32"),
    x: 222,
    y: 444
  },
  {
    code: "ST33",
    nameZh: "陰市",
    nameEn: "Yin Market",
    pinyin: "Yinshi",
    meridian: "Stomach / 胃經",
    region: "大腿",
    location: "大腿前面，髕底外側端上 3 寸，股直肌上。",
    locationEn: "On the anterior thigh, 3 cun superior to the laterosuperior border of the patella, on rectus femoris.",
    anatomy: [{ zh: "股直肌", en: "rectus femoris" }, { zh: "髕骨", en: "patella" }],
    functions: "溫經散寒，通絡止痛。",
    functionsEn: "Warm the channel, disperse cold, open the collaterals, and relieve pain.",
    patterns: ["膝冷痛", "腿痛", "下肢痿痹", "寒濕痹", "膝關節痛"],
    patternsEn: ["cold knee pain", "leg pain", "lower limb weakness or painful obstruction", "cold-damp painful obstruction", "knee joint pain"],
    evidence: "膝腿寒痛與局部疼痛配穴。",
    techniqueNotes: "待依專業來源補深度與手法。",
    cautions: "膝腿紅腫熱痛、外傷或不能負重需就醫。",
    sources: standardPointSources("ST33"),
    x: 224,
    y: 468
  },
  {
    code: "ST34",
    nameZh: "梁丘",
    nameEn: "Beam Mound",
    pinyin: "Liangqiu",
    meridian: "Stomach / 胃經",
    region: "膝部",
    location: "大腿前外側，髕底外側端上 2 寸。",
    locationEn: "On the anterolateral thigh, 2 cun superior to the laterosuperior border of the patella.",
    anatomy: [{ zh: "髕骨", en: "patella" }, { zh: "股外側肌", en: "vastus lateralis" }],
    functions: "和胃止痛，通絡止痛。",
    functionsEn: "Harmonize the Stomach, relieve pain, and open the channel.",
    patterns: ["急性胃痛", "乳癰", "膝痛", "下肢痹痛", "胃氣上逆"],
    patternsEn: ["acute stomach pain", "breast abscess", "knee pain", "lower limb painful obstruction", "rebellious Stomach qi"],
    evidence: "胃經郄穴，傳統用於急性胃痛與膝腿局部症狀。",
    techniqueNotes: "待依專業來源補入；急性胃痛需辨別急腹症。",
    cautions: "劇烈腹痛、嘔血黑便或膝部外傷需就醫。",
    sources: standardPointSources("ST34"),
    x: 226,
    y: 486
  },
  {
    code: "ST35",
    nameZh: "犢鼻",
    nameEn: "Calf's Nose",
    pinyin: "Dubi",
    meridian: "Stomach / 胃經",
    region: "膝部",
    location: "屈膝，髕韌帶外側凹陷處。",
    locationEn: "With the knee flexed, in the depression lateral to the patellar ligament.",
    anatomy: [{ zh: "髕韌帶", en: "patellar ligament" }, { zh: "膝關節", en: "knee joint" }],
    functions: "通利膝關節，祛風濕，止痛。",
    functionsEn: "Benefit the knee joint, dispel wind-damp, and relieve pain.",
    patterns: ["膝痛", "膝腫", "下肢痹痛", "膝關節炎", "風寒濕痹"],
    patternsEn: ["knee pain", "knee swelling", "lower limb painful obstruction", "knee arthritis", "wind-cold-damp painful obstruction"],
    evidence: "膝關節局部常用穴。",
    techniqueNotes: "膝關節周圍操作需注意關節腔、感染與腫脹狀態。",
    cautions: "膝部紅腫熱痛、感染、外傷變形或不能負重需就醫。",
    sources: standardPointSources("ST35"),
    x: 226,
    y: 504
  },
  {
    code: "ST37",
    nameZh: "上巨虛",
    nameEn: "Upper Great Void",
    pinyin: "Shangjuxu",
    meridian: "Stomach / 胃經",
    region: "小腿",
    location: "小腿前外側，犢鼻 ST35 下 6 寸，脛骨前嵴外一橫指。",
    locationEn: "On the anterolateral lower leg, 6 cun inferior to ST35, one finger-breadth lateral to the anterior crest of the tibia.",
    anatomy: [{ zh: "脛骨前嵴", en: "anterior crest of the tibia" }, { zh: "小腿前外側", en: "anterolateral lower leg" }],
    functions: "調腸胃，清濕熱，止痛。",
    functionsEn: "Regulate the intestines and Stomach, clear damp-heat, and relieve pain.",
    patterns: ["腹痛", "腹瀉", "便秘", "腸癰", "下肢痹痛"],
    patternsEn: ["abdominal pain", "diarrhea", "constipation", "intestinal abscess pattern", "lower limb painful obstruction"],
    evidence: "大腸下合穴，NCCAOM 高頻。",
    techniqueNotes: "待依專業來源補深度；小腿前外側需避開骨膜過強刺激。",
    cautions: "急性腹痛、血便或小腿感染腫脹需就醫。",
    sources: standardPointSources("ST37"),
    x: 234,
    y: 544
  },
  {
    code: "ST38",
    nameZh: "條口",
    nameEn: "Ribbon Opening",
    pinyin: "Tiaokou",
    meridian: "Stomach / 胃經",
    region: "小腿",
    location: "小腿前外側，犢鼻 ST35 下 8 寸，脛骨前嵴外一橫指。",
    locationEn: "On the anterolateral lower leg, 8 cun inferior to ST35, one finger-breadth lateral to the anterior crest of the tibia.",
    anatomy: [{ zh: "脛骨前嵴", en: "anterior crest of the tibia" }, { zh: "小腿前外側", en: "anterolateral lower leg" }],
    functions: "舒筋活絡，止痛。",
    functionsEn: "Relax the sinews, open the channel, and relieve pain.",
    patterns: ["肩痛", "下肢痹痛", "膝痛", "足下垂", "經絡阻滯"],
    patternsEn: ["shoulder pain", "lower limb painful obstruction", "knee pain", "foot drop", "channel obstruction"],
    evidence: "傳統常用於肩痛遠端配穴與小腿局部症狀。",
    techniqueNotes: "待依專業來源補入；遠端配肩痛需配合整體診斷。",
    cautions: "足下垂或神經症狀需醫療評估。",
    sources: standardPointSources("ST38"),
    x: 236,
    y: 560
  },
  {
    code: "ST39",
    nameZh: "下巨虛",
    nameEn: "Lower Great Void",
    pinyin: "Xiajuxu",
    meridian: "Stomach / 胃經",
    region: "小腿",
    location: "小腿前外側，犢鼻 ST35 下 9 寸，脛骨前嵴外一橫指。",
    locationEn: "On the anterolateral lower leg, 9 cun inferior to ST35, one finger-breadth lateral to the anterior crest of the tibia.",
    anatomy: [{ zh: "脛骨前嵴", en: "anterior crest of the tibia" }, { zh: "小腿前外側", en: "anterolateral lower leg" }],
    functions: "調小腸，清濕熱，通絡止痛。",
    functionsEn: "Regulate the Small Intestine, clear damp-heat, open the channel, and relieve pain.",
    patterns: ["小腹痛", "腹瀉", "痢疾", "下肢痹痛", "乳癰"],
    patternsEn: ["lower abdominal pain", "diarrhea", "dysentery", "lower limb painful obstruction", "breast abscess"],
    evidence: "小腸下合穴，與腸道症狀和小腿局部症狀相關。",
    techniqueNotes: "待依專業來源補入。",
    cautions: "嚴重腹痛、血便、發燒需就醫。",
    sources: standardPointSources("ST39"),
    x: 238,
    y: 574
  },
  {
    code: "ST41",
    nameZh: "解谿",
    nameEn: "Stream Divide",
    pinyin: "Jiexi",
    meridian: "Stomach / 胃經",
    region: "踝部",
    location: "踝關節前方橫紋中央，拇長伸肌腱與趾長伸肌腱之間凹陷。",
    locationEn: "At the center of the anterior ankle crease, between the tendons of extensor hallucis longus and extensor digitorum longus.",
    anatomy: [{ zh: "踝關節前方", en: "anterior ankle" }, { zh: "拇長伸肌腱", en: "extensor hallucis longus tendon" }, { zh: "趾長伸肌腱", en: "extensor digitorum longus tendon" }],
    functions: "清胃化痰，通絡止痛。",
    functionsEn: "Clear the Stomach, transform phlegm, open the channel, and relieve pain.",
    patterns: ["頭痛", "眩暈", "踝痛", "足下垂", "痰熱"],
    patternsEn: ["headache", "dizziness", "ankle pain", "foot drop", "phlegm-heat"],
    evidence: "胃經經穴，足踝局部與痰熱頭面症狀配穴。",
    techniqueNotes: "踝前肌腱與血管神經附近，需注意角度與深度。",
    cautions: "踝部扭傷急性腫痛或神經症狀需評估。",
    sources: standardPointSources("ST41"),
    x: 242,
    y: 590
  },
  {
    code: "ST42",
    nameZh: "衝陽",
    nameEn: "Surging Yang",
    pinyin: "Chongyang",
    meridian: "Stomach / 胃經",
    region: "足部",
    location: "足背最高處，足背動脈搏動處附近。",
    locationEn: "On the highest point of the dorsum of the foot, near the pulse of the dorsalis pedis artery.",
    anatomy: [{ zh: "足背", en: "dorsum of the foot" }, { zh: "足背動脈", en: "dorsalis pedis artery" }],
    functions: "和胃化痰，寧神通絡。",
    functionsEn: "Harmonize the Stomach, transform phlegm, calm the spirit, and open the channel.",
    patterns: ["胃痛", "足背痛", "面腫", "癲狂", "痰濁"],
    patternsEn: ["stomach pain", "dorsal foot pain", "facial swelling", "mania or agitation", "phlegm turbidity"],
    evidence: "胃經原穴，定位涉及足背動脈安全。",
    techniqueNotes: "避開足背動脈搏動處強刺激。",
    cautions: "糖尿病足、足部感染、血管病變或傷口需避免自行刺激。",
    sources: standardPointSources("ST42"),
    x: 246,
    y: 604
  },
  {
    code: "ST43",
    nameZh: "陷谷",
    nameEn: "Sunken Valley",
    pinyin: "Xiangu",
    meridian: "Stomach / 胃經",
    region: "足部",
    location: "足背，第 2、3 跖骨間，第 2 跖趾關節後方凹陷處。",
    locationEn: "On the dorsum of the foot, between the second and third metatarsal bones, in the depression proximal to the second metatarsophalangeal joint.",
    anatomy: [{ zh: "足背", en: "dorsum of the foot" }, { zh: "跖骨", en: "metatarsal bone" }],
    functions: "清熱消腫，和胃通絡。",
    functionsEn: "Clear heat, reduce swelling, harmonize the Stomach, and open the channel.",
    patterns: ["面腫", "足背腫痛", "胃痛", "腹脹", "熱證"],
    patternsEn: ["facial swelling", "dorsal foot swelling and pain", "stomach pain", "abdominal distension", "heat pattern"],
    evidence: "胃經輸穴，常用於腫痛與胃腸症狀配穴。",
    techniqueNotes: "足背局部操作需避開血管與感染病灶。",
    cautions: "足部感染、糖尿病足或外傷需醫療照護。",
    sources: standardPointSources("ST43"),
    x: 250,
    y: 610
  },
  {
    code: "ST45",
    nameZh: "厲兌",
    nameEn: "Strict Mouth",
    pinyin: "Lidui",
    meridian: "Stomach / 胃經",
    region: "足部",
    location: "第 2 趾外側，距趾甲角約 0.1 寸。",
    locationEn: "On the lateral side of the second toe, about 0.1 cun from the corner of the nail.",
    anatomy: [{ zh: "第二趾", en: "second toe" }, { zh: "趾甲角", en: "corner of the toenail" }],
    functions: "清胃瀉熱，醒神安神。",
    functionsEn: "Clear Stomach heat, drain heat, revive consciousness, and calm the spirit.",
    patterns: ["牙痛", "咽喉腫痛", "多夢", "癲狂", "熱證"],
    patternsEn: ["toothache", "sore throat", "excessive dreaming", "mania or agitation", "heat pattern"],
    evidence: "胃經井穴，傳統用於胃熱、神志與頭面熱證。",
    techniqueNotes: "井穴刺血類操作需專業訓練與無菌觀念。",
    cautions: "足趾感染、糖尿病足、凝血異常或急性精神/神經症狀需醫療處理。",
    sources: standardPointSources("ST45"),
    x: 256,
    y: 616
  }
];

const spleenMeridianExpansion = [
  {
    code: "SP1",
    nameZh: "隱白",
    nameEn: "Hidden White",
    pinyin: "Yinbai",
    meridian: "Spleen / 脾經",
    region: "足部",
    location: "足大趾末節內側，趾甲根角旁約 0.1 寸。",
    locationEn: "On the medial side of the great toe, about 0.1 cun from the corner of the nail.",
    cunMeasurement: "0.1 cun from the medial nail corner of the great toe.",
    functions: "健脾統血，回陽救逆，寧神。",
    functionsEn: ["Regulates the Spleen and blood", "Stops bleeding", "Restores consciousness", "Calms the spirit"],
    patterns: ["脾不統血", "崩漏", "便血", "昏厥", "多夢驚悸"],
    patternsEn: ["Spleen failing to control blood", "Uterine bleeding", "Blood in stool", "Fainting", "Agitation with dreaming"],
    evidence: "井穴常用於急症、出血與神志相關配穴；臨床急症需立即就醫。",
    cautions: "足趾感染、糖尿病足、凝血異常或抗凝藥使用者避免自行刺絡。",
    sources: standardPointSources("SP1"),
    x: 142,
    y: 614
  },
  {
    code: "SP2",
    nameZh: "大都",
    nameEn: "Great Metropolis",
    pinyin: "Dadu",
    meridian: "Spleen / 脾經",
    region: "足部",
    location: "足大趾內側，第 1 蹠趾關節前下方赤白肉際凹陷處。",
    locationEn: "On the medial side of the great toe, distal and inferior to the first metatarsophalangeal joint, at the junction of red and white skin.",
    cunMeasurement: "Distal to the first metatarsophalangeal joint.",
    functions: "健脾和胃，清熱化濕。",
    functionsEn: ["Strengthens the Spleen", "Harmonizes the Stomach", "Clears heat", "Resolves dampness"],
    patterns: ["脾胃濕熱", "胃痛", "腹脹", "嘔吐", "發熱無汗"],
    patternsEn: ["Damp-heat in the Spleen and Stomach", "Epigastric pain", "Abdominal distention", "Vomiting", "Fever without sweating"],
    evidence: "常作脾胃濕熱與足趾局部痛配穴。",
    cautions: "足部傷口、感染、痛風急性發作或糖尿病足風險者避免自行刺激。",
    sources: standardPointSources("SP2"),
    x: 144,
    y: 604
  },
  {
    code: "SP3",
    nameZh: "太白",
    nameEn: "Supreme White",
    pinyin: "Taibai",
    meridian: "Spleen / 脾經",
    region: "足部",
    location: "足內側，第 1 蹠骨小頭後下方赤白肉際凹陷處。",
    locationEn: "On the medial side of the foot, posterior and inferior to the head of the first metatarsal bone, at the junction of red and white skin.",
    cunMeasurement: "Posterior-inferior to the first metatarsal head.",
    functions: "健脾益氣，化濕和中。",
    functionsEn: ["Tonifies the Spleen", "Resolves dampness", "Harmonizes the middle burner"],
    patterns: ["脾虛濕困", "腹脹", "腹痛", "泄瀉", "倦怠"],
    patternsEn: ["Spleen qi deficiency with dampness", "Abdominal distention", "Abdominal pain", "Diarrhea", "Fatigue"],
    evidence: "脾經輸原穴，常作消化、濕困與體力低下配穴。",
    cautions: "足內側局部腫痛、傷口或感染時避開。",
    sources: standardPointSources("SP3"),
    x: 146,
    y: 594
  },
  {
    code: "SP4",
    nameZh: "公孫",
    nameEn: "Grandfather Grandson",
    pinyin: "Gongsun",
    meridian: "Spleen / 脾經",
    region: "足部",
    location: "足內側，第 1 蹠骨基底部前下方赤白肉際處。",
    locationEn: "On the medial side of the foot, distal and inferior to the base of the first metatarsal bone, at the junction of red and white skin.",
    cunMeasurement: "Distal-inferior to the base of the first metatarsal.",
    functions: "健脾和胃，調衝脈，寬胸理氣。",
    functionsEn: ["Strengthens the Spleen", "Harmonizes the Stomach", "Regulates the Chong vessel", "Unbinds the chest"],
    patterns: ["脾胃不和", "胃痛", "嘔吐", "腹痛泄瀉", "胸悶", "月經不調"],
    patternsEn: ["Spleen-Stomach disharmony", "Epigastric pain", "Vomiting", "Abdominal pain with diarrhea", "Chest oppression", "Menstrual irregularity"],
    evidence: "八脈交會穴，臨床常與 PC6 配合處理胸胃、衝脈與婦科證型。",
    cautions: "孕期或腹痛出血等情況需由合格醫師辨證，不宜自行強刺激。",
    sources: standardPointSources("SP4"),
    x: 148,
    y: 584
  },
  {
    code: "SP5",
    nameZh: "商丘",
    nameEn: "Shang Mound",
    pinyin: "Shangqiu",
    meridian: "Spleen / 脾經",
    region: "踝部",
    location: "內踝前下方凹陷處，舟骨結節與內踝尖連線中點附近。",
    locationEn: "In the depression anterior and inferior to the medial malleolus, near the midpoint between the navicular tuberosity and the tip of the medial malleolus.",
    cunMeasurement: "Anterior-inferior to the medial malleolus.",
    functions: "健脾化濕，利踝止痛。",
    functionsEn: ["Strengthens the Spleen", "Resolves dampness", "Benefits the ankle"],
    patterns: ["脾虛濕困", "腹脹泄瀉", "黃疸", "足踝痛", "痔疾"],
    patternsEn: ["Spleen deficiency with dampness", "Abdominal distention with diarrhea", "Jaundice", "Ankle pain", "Hemorrhoids"],
    evidence: "常用於濕困脾胃與踝部局部症狀配穴。",
    cautions: "踝部急性扭傷、骨折疑慮或感染時先評估。",
    sources: standardPointSources("SP5"),
    x: 150,
    y: 572
  },
  {
    code: "SP6",
    nameZh: "三陰交",
    nameEn: "Three Yin Intersection",
    pinyin: "Sanyinjiao",
    meridian: "Spleen / 脾經",
    region: "小腿",
    location: "小腿內側，內踝尖上 3 寸，脛骨內側緣後方。",
    locationEn: "On the medial aspect of the leg, 3 cun superior to the prominence of the medial malleolus, posterior to the medial border of the tibia.",
    cunMeasurement: "3 cun above the medial malleolus.",
    functions: "健脾化濕，調肝腎，調經助孕，安神。",
    functionsEn: ["Strengthens the Spleen", "Resolves dampness", "Regulates Liver and Kidney", "Regulates menstruation", "Calms the spirit"],
    patterns: ["脾虛濕盛", "月經不調", "痛經", "不孕", "失眠", "小便不利"],
    patternsEn: ["Spleen deficiency with dampness", "Menstrual irregularity", "Dysmenorrhea", "Infertility pattern support", "Insomnia", "Urinary difficulty"],
    evidence: "婦科、泌尿與消化常用高頻穴；需結合辨證與醫學評估。",
    cautions: "孕期禁用或慎用強刺激，尤其未經專業評估不可自行針刺。",
    sources: standardPointSources("SP6"),
    x: 138,
    y: 540
  },
  {
    code: "SP7",
    nameZh: "漏谷",
    nameEn: "Dripping Valley",
    pinyin: "Lougu",
    meridian: "Spleen / 脾經",
    region: "小腿",
    location: "小腿內側，內踝尖上 6 寸，脛骨內側緣後方。",
    locationEn: "On the medial aspect of the leg, 6 cun superior to the prominence of the medial malleolus, posterior to the medial border of the tibia.",
    cunMeasurement: "6 cun above the medial malleolus.",
    functions: "健脾利濕，通調下焦。",
    functionsEn: ["Strengthens the Spleen", "Drains dampness", "Regulates the lower burner"],
    patterns: ["脾虛濕盛", "腹脹", "小便不利", "下肢腫脹", "足膝冷痛"],
    patternsEn: ["Spleen deficiency with dampness", "Abdominal distention", "Urinary difficulty", "Leg swelling", "Cold pain of foot and knee"],
    evidence: "濕、水腫與下肢內側循經症狀配穴。",
    cautions: "下肢不明腫脹、紅熱痛或疑似血栓需先就醫。",
    sources: standardPointSources("SP7"),
    x: 137,
    y: 514
  },
  {
    code: "SP8",
    nameZh: "地機",
    nameEn: "Earth Pivot",
    pinyin: "Diji",
    meridian: "Spleen / 脾經",
    region: "小腿",
    location: "小腿內側，陰陵泉下 3 寸，脛骨內側緣後方。",
    locationEn: "On the medial aspect of the leg, 3 cun inferior to SP9, posterior to the medial border of the tibia.",
    cunMeasurement: "3 cun inferior to SP9.",
    functions: "健脾理血，調經止痛。",
    functionsEn: ["Regulates the Spleen", "Regulates blood", "Regulates menstruation", "Stops pain"],
    patterns: ["痛經", "月經不調", "腹痛", "泄瀉", "水腫"],
    patternsEn: ["Dysmenorrhea", "Menstrual irregularity", "Abdominal pain", "Diarrhea", "Edema"],
    evidence: "脾經郄穴，婦科疼痛與急性腹痛類配穴常見。",
    cautions: "劇烈腹痛、異常出血或疑似急腹症需先醫療評估。",
    sources: standardPointSources("SP8"),
    x: 136,
    y: 480
  },
  {
    code: "SP11",
    nameZh: "箕門",
    nameEn: "Winnower Gate",
    pinyin: "Jimen",
    meridian: "Spleen / 脾經",
    region: "大腿",
    location: "大腿內側，髕底上 8 寸，股內側肌與縫匠肌之間。",
    locationEn: "On the medial aspect of the thigh, 8 cun superior to the base of the patella, between vastus medialis and sartorius.",
    cunMeasurement: "8 cun above the base of the patella.",
    functions: "利水通淋，調下焦。",
    functionsEn: ["Benefits urination", "Regulates the lower burner", "Clears dampness"],
    patterns: ["小便不利", "淋證", "腹股溝痛", "下肢腫痛"],
    patternsEn: ["Urinary difficulty", "Lin patterns", "Inguinal pain", "Leg swelling and pain"],
    evidence: "下焦濕熱、泌尿與大腿內側循經症狀配穴。",
    cautions: "避開股動脈搏動；腹股溝腫塊、血管病變或不明疼痛需先評估。",
    sources: standardPointSources("SP11"),
    x: 134,
    y: 372
  },
  {
    code: "SP12",
    nameZh: "衝門",
    nameEn: "Surging Gate",
    pinyin: "Chongmen",
    meridian: "Spleen / 脾經",
    region: "腹股溝",
    location: "腹股溝外側，距恥骨聯合上緣外 3.5 寸，股動脈外側。",
    locationEn: "In the inguinal region, 3.5 cun lateral to the upper border of the pubic symphysis, lateral to the femoral artery.",
    cunMeasurement: "3.5 cun lateral to the pubic symphysis.",
    functions: "理氣化濕，調下焦。",
    functionsEn: ["Moves qi", "Resolves dampness", "Regulates the lower burner"],
    patterns: ["腹痛", "疝氣", "帶下", "小便不利", "腹股溝痛"],
    patternsEn: ["Abdominal pain", "Hernia patterns", "Vaginal discharge", "Urinary difficulty", "Inguinal pain"],
    evidence: "下腹、腹股溝與泌尿生殖相關配穴。",
    cautions: "重要血管區，避開股動脈；孕期、腹股溝腫塊或血管病變需專業操作。",
    sources: standardPointSources("SP12"),
    x: 142,
    y: 332
  },
  {
    code: "SP13",
    nameZh: "府舍",
    nameEn: "Bowel Abode",
    pinyin: "Fushe",
    meridian: "Spleen / 脾經",
    region: "下腹",
    location: "下腹部，臍下 4 寸，前正中線旁開 4 寸。",
    locationEn: "On the lower abdomen, 4 cun inferior to the umbilicus and 4 cun lateral to the anterior midline.",
    cunMeasurement: "4 cun below the umbilicus, 4 cun lateral to midline.",
    functions: "理氣止痛，調腸腑。",
    functionsEn: ["Moves qi", "Stops pain", "Regulates the intestines"],
    patterns: ["腹痛", "疝氣", "便秘", "腹滿", "積聚"],
    patternsEn: ["Abdominal pain", "Hernia patterns", "Constipation", "Abdominal fullness", "Abdominal masses pattern"],
    evidence: "腹部氣滯、腸腑不調與疝氣類配穴。",
    cautions: "孕期、腹部腫塊、急腹症或術後疤痕區需避開或專業評估。",
    sources: standardPointSources("SP13"),
    x: 122,
    y: 322
  },
  {
    code: "SP14",
    nameZh: "腹結",
    nameEn: "Abdomen Knot",
    pinyin: "Fujie",
    meridian: "Spleen / 脾經",
    region: "下腹",
    location: "下腹部，臍下 1.3 寸，前正中線旁開 4 寸。",
    locationEn: "On the lower abdomen, 1.3 cun inferior to the umbilicus and 4 cun lateral to the anterior midline.",
    cunMeasurement: "1.3 cun below the umbilicus, 4 cun lateral to midline.",
    functions: "理氣散結，調腸止痛。",
    functionsEn: ["Moves qi", "Dissipates binding", "Regulates the intestines", "Stops pain"],
    patterns: ["腹痛", "腹滿", "便秘", "泄瀉", "疝氣"],
    patternsEn: ["Abdominal pain", "Abdominal fullness", "Constipation", "Diarrhea", "Hernia patterns"],
    evidence: "腹部氣結與腸道不調配穴。",
    cautions: "急性腹痛、腹部腫塊、孕期或術後區域需先評估。",
    sources: standardPointSources("SP14"),
    x: 124,
    y: 300
  },
  {
    code: "SP15",
    nameZh: "大橫",
    nameEn: "Great Horizontal",
    pinyin: "Daheng",
    meridian: "Spleen / 脾經",
    region: "腹部",
    location: "腹部，臍中旁開 4 寸。",
    locationEn: "On the abdomen, 4 cun lateral to the center of the umbilicus.",
    cunMeasurement: "4 cun lateral to the umbilicus.",
    functions: "調理腸腑，健脾化濕。",
    functionsEn: ["Regulates the intestines", "Strengthens the Spleen", "Resolves dampness"],
    patterns: ["便秘", "泄瀉", "腹痛", "腹脹", "腸鳴"],
    patternsEn: ["Constipation", "Diarrhea", "Abdominal pain", "Abdominal distention", "Borborygmus"],
    evidence: "腸道功能與腹部脹痛常用局部配穴。",
    cautions: "孕期、急腹症、腹主動脈瘤風險或腹部手術近期史需專業評估。",
    sources: standardPointSources("SP15"),
    x: 126,
    y: 286
  },
  {
    code: "SP16",
    nameZh: "腹哀",
    nameEn: "Abdomen Sorrow",
    pinyin: "Fuai",
    meridian: "Spleen / 脾經",
    region: "上腹",
    location: "上腹部，臍上 3 寸，前正中線旁開 4 寸。",
    locationEn: "On the upper abdomen, 3 cun superior to the umbilicus and 4 cun lateral to the anterior midline.",
    cunMeasurement: "3 cun above the umbilicus, 4 cun lateral to midline.",
    functions: "健脾和胃，降逆止痛。",
    functionsEn: ["Strengthens the Spleen", "Harmonizes the Stomach", "Descends counterflow", "Stops pain"],
    patterns: ["胃痛", "腹痛", "消化不良", "嘔吐", "便秘"],
    patternsEn: ["Epigastric pain", "Abdominal pain", "Indigestion", "Vomiting", "Constipation"],
    evidence: "上腹與脾胃不和配穴。",
    cautions: "不明上腹痛、胸痛、黑便或劇烈嘔吐需先排除急症。",
    sources: standardPointSources("SP16"),
    x: 126,
    y: 252
  },
  {
    code: "SP17",
    nameZh: "食竇",
    nameEn: "Food Cavity",
    pinyin: "Shidou",
    meridian: "Spleen / 脾經",
    region: "胸脅",
    location: "胸外側部，第 5 肋間隙，前正中線旁開 6 寸。",
    locationEn: "On the lateral chest, in the fifth intercostal space, 6 cun lateral to the anterior midline.",
    cunMeasurement: "Fifth intercostal space, 6 cun lateral to midline.",
    functions: "寬胸利膈，降逆和胃。",
    functionsEn: ["Unbinds the chest", "Benefits the diaphragm", "Descends counterflow", "Harmonizes the Stomach"],
    patterns: ["胸脅滿悶", "噫氣", "嘔吐", "食少", "水飲停胸"],
    patternsEn: ["Chest and hypochondriac fullness", "Belching", "Vomiting", "Poor appetite", "Fluid retention in chest pattern"],
    evidence: "胸脅與胃氣上逆配穴。",
    cautions: "胸肋區需淺刺斜刺，避免深刺；胸痛、呼吸困難需先急症評估。",
    sources: standardPointSources("SP17"),
    x: 106,
    y: 216
  },
  {
    code: "SP18",
    nameZh: "天溪",
    nameEn: "Heavenly Ravine",
    pinyin: "Tianxi",
    meridian: "Spleen / 脾經",
    region: "胸部",
    location: "胸外側部，第 4 肋間隙，前正中線旁開 6 寸。",
    locationEn: "On the lateral chest, in the fourth intercostal space, 6 cun lateral to the anterior midline.",
    cunMeasurement: "Fourth intercostal space, 6 cun lateral to midline.",
    functions: "寬胸理氣，通乳散結。",
    functionsEn: ["Moves chest qi", "Benefits the breast", "Promotes lactation", "Dissipates nodules"],
    patterns: ["胸悶", "乳少", "乳癰", "咳嗽", "胸脅痛"],
    patternsEn: ["Chest oppression", "Insufficient lactation", "Breast abscess pattern", "Cough", "Chest and hypochondriac pain"],
    evidence: "胸乳局部症狀與氣滯配穴。",
    cautions: "乳房腫塊、紅腫熱痛或哺乳感染需先醫療評估；胸部避免深刺。",
    sources: standardPointSources("SP18"),
    x: 106,
    y: 202
  },
  {
    code: "SP19",
    nameZh: "胸鄉",
    nameEn: "Chest Village",
    pinyin: "Xiongxiang",
    meridian: "Spleen / 脾經",
    region: "胸部",
    location: "胸外側部，第 3 肋間隙，前正中線旁開 6 寸。",
    locationEn: "On the lateral chest, in the third intercostal space, 6 cun lateral to the anterior midline.",
    cunMeasurement: "Third intercostal space, 6 cun lateral to midline.",
    functions: "寬胸理氣，止咳平喘。",
    functionsEn: ["Unbinds the chest", "Moves qi", "Stops cough", "Calms wheezing"],
    patterns: ["胸悶", "咳嗽", "氣喘", "胸脅痛"],
    patternsEn: ["Chest oppression", "Cough", "Wheezing", "Chest and hypochondriac pain"],
    evidence: "胸部氣滯、肺胃氣逆相關配穴。",
    cautions: "胸部穴位避免深刺；氣喘急性發作或胸痛需先急症處理。",
    sources: standardPointSources("SP19"),
    x: 108,
    y: 188
  },
  {
    code: "SP20",
    nameZh: "周榮",
    nameEn: "All-Round Flourishing",
    pinyin: "Zhourong",
    meridian: "Spleen / 脾經",
    region: "胸部",
    location: "胸外側部，第 2 肋間隙，前正中線旁開 6 寸。",
    locationEn: "On the lateral chest, in the second intercostal space, 6 cun lateral to the anterior midline.",
    cunMeasurement: "Second intercostal space, 6 cun lateral to midline.",
    functions: "宣肺寬胸，止咳平喘。",
    functionsEn: ["Spreads Lung qi", "Unbinds the chest", "Stops cough", "Calms wheezing"],
    patterns: ["咳嗽", "氣喘", "胸悶", "胸脅痛"],
    patternsEn: ["Cough", "Wheezing", "Chest oppression", "Chest and hypochondriac pain"],
    evidence: "胸肺症狀配穴，通常需與肺經、任脈等穴合用。",
    cautions: "胸部避免深刺；呼吸困難、胸痛或疑似心肺急症需立即就醫。",
    sources: standardPointSources("SP20"),
    x: 110,
    y: 174
  },
  {
    code: "SP21",
    nameZh: "大包",
    nameEn: "Great Wrapping",
    pinyin: "Dabao",
    meridian: "Spleen / 脾經",
    region: "側胸",
    location: "側胸部，第 6 肋間隙，腋中線上。",
    locationEn: "On the lateral side of the chest, in the sixth intercostal space, on the midaxillary line.",
    cunMeasurement: "Sixth intercostal space on the midaxillary line.",
    functions: "統絡全身，寬胸理氣，止痛。",
    functionsEn: ["Regulates the network vessels", "Unbinds the chest", "Moves qi", "Stops pain"],
    patterns: ["全身疼痛", "胸脅痛", "氣短", "四肢無力", "岔氣"],
    patternsEn: ["Generalized body pain", "Chest and hypochondriac pain", "Shortness of breath", "Weakness of the limbs", "Intercostal strain pattern"],
    evidence: "脾之大絡，常用於全身絡脈失調與胸脅疼痛配穴。",
    cautions: "側胸部避免深刺；肋骨外傷、胸痛或呼吸困難需先排除急症。",
    sources: standardPointSources("SP21"),
    x: 98,
    y: 226
  }
];

const heartMeridianExpansion = [
  {
    code: "HT1",
    nameZh: "極泉",
    nameEn: "Highest Spring",
    pinyin: "Jiquan",
    meridian: "Heart / 心經",
    region: "腋窩",
    location: "腋窩中央，腋動脈搏動處。",
    locationEn: "In the center of the axilla, at the pulsation of the axillary artery.",
    cunMeasurement: "Center of the axilla.",
    functions: "寬胸理氣，通經活絡，寧心。",
    functionsEn: ["Unbinds the chest", "Regulates Heart qi", "Activates the channel", "Calms the spirit"],
    patterns: ["心痛", "胸悶", "脅肋痛", "上肢麻木", "心悸"],
    patternsEn: ["Heart pain pattern", "Chest oppression", "Costal pain", "Numbness of the upper limb", "Palpitations"],
    evidence: "胸心與上肢內側循經症狀配穴；胸痛需先排除心肺急症。",
    cautions: "腋動脈與神經叢附近，避免深刺和強刺激；局部淋巴結腫大需先評估。",
    sources: standardPointSources("HT1"),
    x: 118,
    y: 150
  },
  {
    code: "HT2",
    nameZh: "青靈",
    nameEn: "Cyan Spirit",
    pinyin: "Qingling",
    meridian: "Heart / 心經",
    region: "上臂",
    location: "臂內側，肘橫紋上 3 寸，肱二頭肌內側溝中。",
    locationEn: "On the medial aspect of the arm, 3 cun proximal to the cubital crease, in the groove medial to biceps brachii.",
    cunMeasurement: "3 cun above the cubital crease.",
    functions: "寬胸理氣，通絡止痛。",
    functionsEn: ["Unbinds the chest", "Moves qi", "Activates the channel", "Stops pain"],
    patterns: ["頭痛目黃", "脅痛", "肩臂痛", "心痛"],
    patternsEn: ["Headache with yellow eyes pattern", "Hypochondriac pain", "Shoulder and arm pain", "Heart pain pattern"],
    evidence: "上臂循經痛與胸脅不適配穴。",
    cautions: "避開明顯血管；上臂腫脹、紅熱或神經症狀需先評估。",
    sources: standardPointSources("HT2"),
    x: 112,
    y: 194
  },
  {
    code: "HT3",
    nameZh: "少海",
    nameEn: "Lesser Sea",
    pinyin: "Shaohai",
    meridian: "Heart / 心經",
    region: "肘部",
    location: "肘橫紋內側端，屈肘時肱骨內上髁與肘橫紋內端之間。",
    locationEn: "At the medial end of the cubital crease, between the medial epicondyle of the humerus and the medial end of the cubital crease when the elbow is flexed.",
    cunMeasurement: "Medial end of the cubital crease.",
    functions: "清心化痰，寧神，通絡止痛。",
    functionsEn: ["Clears Heart heat", "Transforms phlegm", "Calms the spirit", "Benefits the elbow and arm"],
    patterns: ["心痛", "癲狂癇", "手顫", "肘臂痛", "腋脅痛"],
    patternsEn: ["Heart pain pattern", "Mania or seizure patterns", "Tremor", "Elbow and arm pain", "Axillary and costal pain"],
    evidence: "心神與肘臂局部症狀配穴，亦常見於痰火擾心類辨證。",
    cautions: "尺神經附近，避免強烈放射痛；肘部外傷或麻木需先評估。",
    sources: standardPointSources("HT3"),
    x: 112,
    y: 246
  },
  {
    code: "HT4",
    nameZh: "靈道",
    nameEn: "Spirit Pathway",
    pinyin: "Lingdao",
    meridian: "Heart / 心經",
    region: "前臂",
    location: "前臂前內側，腕掌側遠端橫紋上 1.5 寸，尺側腕屈肌腱橈側。",
    locationEn: "On the anteromedial aspect of the forearm, 1.5 cun proximal to the palmar wrist crease, radial to the tendon of flexor carpi ulnaris.",
    cunMeasurement: "1.5 cun above the wrist crease.",
    functions: "寧心安神，理氣止痛，利舌。",
    functionsEn: ["Calms the spirit", "Regulates Heart qi", "Stops pain", "Benefits the tongue"],
    patterns: ["心痛", "失音", "舌強不語", "心悸", "腕臂痛"],
    patternsEn: ["Heart pain pattern", "Loss of voice", "Stiff tongue with speech difficulty", "Palpitations", "Wrist and arm pain"],
    evidence: "心經經穴，胸心、神志與語言舌象相關配穴。",
    cautions: "腕前臂神經血管密集，避免深刺與強刺激。",
    sources: standardPointSources("HT4"),
    x: 302,
    y: 260
  },
  {
    code: "HT5",
    nameZh: "通里",
    nameEn: "Penetrating the Interior",
    pinyin: "Tongli",
    meridian: "Heart / 心經",
    region: "前臂",
    location: "前臂前內側，腕掌側遠端橫紋上 1 寸，尺側腕屈肌腱橈側。",
    locationEn: "On the anteromedial aspect of the forearm, 1 cun proximal to the palmar wrist crease, radial to the tendon of flexor carpi ulnaris.",
    cunMeasurement: "1 cun above the wrist crease.",
    functions: "寧心安神，通絡利舌。",
    functionsEn: ["Calms the spirit", "Regulates Heart qi", "Benefits the tongue and speech", "Activates the channel"],
    patterns: ["心悸", "怔忡", "失語", "舌強", "腕臂痛"],
    patternsEn: ["Palpitations", "Severe palpitations", "Aphasia pattern", "Stiff tongue", "Wrist and arm pain"],
    evidence: "絡穴，NCCAOM 常見於心神、語言與舌相關考點。",
    cautions: "腕部神經血管密集，避免深刺；突發失語需急症評估。",
    sources: standardPointSources("HT5"),
    x: 303,
    y: 270
  },
  {
    code: "HT6",
    nameZh: "陰郄",
    nameEn: "Yin Cleft",
    pinyin: "Yinxi",
    meridian: "Heart / 心經",
    region: "前臂",
    location: "前臂前內側，腕掌側遠端橫紋上 0.5 寸，尺側腕屈肌腱橈側。",
    locationEn: "On the anteromedial aspect of the forearm, 0.5 cun proximal to the palmar wrist crease, radial to the tendon of flexor carpi ulnaris.",
    cunMeasurement: "0.5 cun above the wrist crease.",
    functions: "養陰清熱，寧心止汗。",
    functionsEn: ["Nourishes Heart yin", "Clears deficiency heat", "Calms the spirit", "Stops sweating"],
    patterns: ["盜汗", "五心煩熱", "心悸", "失眠", "吐血衄血"],
    patternsEn: ["Night sweating", "Five-center heat", "Palpitations", "Insomnia", "Bleeding patterns"],
    evidence: "郄穴，常見於陰虛內熱、汗證與心悸失眠配穴。",
    cautions: "腕部淺刺為主；出血症狀需醫療評估，不可僅靠穴位處理。",
    sources: standardPointSources("HT6"),
    x: 304,
    y: 278
  },
  {
    code: "HT8",
    nameZh: "少府",
    nameEn: "Lesser Mansion",
    pinyin: "Shaofu",
    meridian: "Heart / 心經",
    region: "手掌",
    location: "手掌，第 4、5 掌骨之間，握拳時小指尖所指處。",
    locationEn: "On the palm, between the fourth and fifth metacarpal bones, where the tip of the little finger rests when a fist is made.",
    cunMeasurement: "Between the fourth and fifth metacarpals.",
    functions: "清心瀉火，利小便，寧神。",
    functionsEn: ["Clears Heart fire", "Benefits urination", "Calms the spirit"],
    patterns: ["心火亢盛", "口舌生瘡", "小便不利", "陰癢", "掌中熱"],
    patternsEn: ["Heart fire blazing", "Mouth and tongue sores", "Urinary difficulty", "Genital itching pattern", "Heat in the palm"],
    evidence: "滎火穴，心火、舌口與小便熱痛類配穴。",
    cautions: "手掌傷口、感染或神經卡壓症狀時避開。",
    sources: standardPointSources("HT8"),
    x: 310,
    y: 304
  },
  {
    code: "HT9",
    nameZh: "少衝",
    nameEn: "Lesser Rushing",
    pinyin: "Shaochong",
    meridian: "Heart / 心經",
    region: "手指",
    location: "小指末節橈側，指甲根角旁約 0.1 寸。",
    locationEn: "On the radial side of the distal phalanx of the little finger, about 0.1 cun from the corner of the nail.",
    cunMeasurement: "0.1 cun from the radial nail corner of the little finger.",
    functions: "醒神開竅，清心泄熱。",
    functionsEn: ["Restores consciousness", "Opens the orifices", "Clears Heart heat"],
    patterns: ["昏厥", "中風閉證", "心痛", "熱病", "心煩"],
    patternsEn: ["Fainting", "Wind-stroke closed pattern", "Heart pain pattern", "Febrile disease", "Irritability"],
    evidence: "井穴，急救與熱擾心神相關考點常見；急症需立即就醫。",
    cautions: "指尖刺絡需專業訓練；凝血異常、抗凝藥或感染風險者避免自行操作。",
    sources: standardPointSources("HT9"),
    x: 316,
    y: 318
  }
];

const smallIntestineMeridianExpansion = [
  {
    code: "SI1",
    nameZh: "少澤",
    nameEn: "Lesser Marsh",
    pinyin: "Shaoze",
    meridian: "Small Intestine / 小腸經",
    region: "手指",
    location: "小指末節尺側，指甲根角旁約 0.1 寸。",
    locationEn: "On the ulnar side of the distal phalanx of the little finger, about 0.1 cun from the corner of the nail.",
    cunMeasurement: "0.1 cun from the ulnar nail corner of the little finger.",
    functions: "清熱開竅，通乳，利咽。",
    functionsEn: ["Clears heat", "Opens the orifices", "Promotes lactation", "Benefits the throat"],
    patterns: ["乳少", "乳癰", "咽喉腫痛", "昏厥", "熱病"],
    patternsEn: ["Insufficient lactation", "Breast abscess pattern", "Sore throat", "Fainting", "Febrile disease"],
    evidence: "井穴，常見於乳少、咽喉與急症開竅配穴；乳房感染或高熱需醫療評估。",
    cautions: "指尖刺絡需專業訓練；凝血異常、抗凝藥或感染風險者避免自行操作。",
    sources: standardPointSources("SI1"),
    x: 320,
    y: 320
  },
  {
    code: "SI2",
    nameZh: "前谷",
    nameEn: "Front Valley",
    pinyin: "Qiangu",
    meridian: "Small Intestine / 小腸經",
    region: "手部",
    location: "手尺側，微握拳，第 5 掌指關節前方赤白肉際處。",
    locationEn: "On the ulnar side of the hand, distal to the fifth metacarpophalangeal joint at the junction of red and white skin, with a loose fist.",
    cunMeasurement: "Distal to the fifth metacarpophalangeal joint.",
    functions: "清熱利咽，通經止痛。",
    functionsEn: ["Clears heat", "Benefits the throat", "Activates the channel", "Stops pain"],
    patterns: ["頭項痛", "目赤", "耳鳴", "咽喉痛", "手指痛"],
    patternsEn: ["Head and neck pain", "Red eyes", "Tinnitus", "Sore throat", "Finger pain"],
    evidence: "滎水穴，頭項、耳目咽喉與手部局部痛配穴。",
    cautions: "手部傷口、感染或急性扭傷時避開。",
    sources: standardPointSources("SI2"),
    x: 314,
    y: 310
  },
  {
    code: "SI4",
    nameZh: "腕骨",
    nameEn: "Wrist Bone",
    pinyin: "Wangu",
    meridian: "Small Intestine / 小腸經",
    region: "腕部",
    location: "手尺側，第 5 掌骨基底與三角骨之間赤白肉際凹陷處。",
    locationEn: "On the ulnar side of the hand, in the depression between the base of the fifth metacarpal bone and the triquetral bone, at the junction of red and white skin.",
    cunMeasurement: "Between the fifth metacarpal base and triquetral bone.",
    functions: "清熱利濕，通絡止痛。",
    functionsEn: ["Clears heat", "Resolves dampness", "Activates the channel", "Stops pain"],
    patterns: ["黃疸", "熱病", "頭項痛", "腕痛", "耳鳴"],
    patternsEn: ["Jaundice", "Febrile disease", "Head and neck pain", "Wrist pain", "Tinnitus"],
    evidence: "原穴，腕部局部症狀與小腸經頭項耳目症狀配穴。",
    cautions: "腕部神經血管密集，局部腫痛或骨折疑慮需先評估。",
    sources: standardPointSources("SI4"),
    x: 306,
    y: 296
  },
  {
    code: "SI5",
    nameZh: "陽谷",
    nameEn: "Yang Valley",
    pinyin: "Yanggu",
    meridian: "Small Intestine / 小腸經",
    region: "腕部",
    location: "腕背尺側，尺骨莖突與三角骨之間凹陷處。",
    locationEn: "On the ulnar side of the dorsal wrist, in the depression between the styloid process of the ulna and the triquetral bone.",
    cunMeasurement: "Between ulnar styloid process and triquetral bone.",
    functions: "清熱安神，通絡止痛。",
    functionsEn: ["Clears heat", "Calms the spirit", "Activates the channel", "Stops pain"],
    patterns: ["頭痛", "目眩", "耳鳴", "腕痛", "癲狂"],
    patternsEn: ["Headache", "Dizziness", "Tinnitus", "Wrist pain", "Mania pattern"],
    evidence: "經火穴，熱證、神志與腕部局部痛配穴。",
    cautions: "腕尺側疼痛、麻木或外傷時先評估。",
    sources: standardPointSources("SI5"),
    x: 304,
    y: 286
  },
  {
    code: "SI6",
    nameZh: "養老",
    nameEn: "Nursing the Aged",
    pinyin: "Yanglao",
    meridian: "Small Intestine / 小腸經",
    region: "前臂",
    location: "前臂背尺側，尺骨小頭近端橈側凹陷處。",
    locationEn: "On the dorsal ulnar aspect of the forearm, in the depression on the radial side of the proximal end of the head of the ulna.",
    cunMeasurement: "Near the head of the ulna.",
    functions: "舒筋活絡，明目止痛。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the eyes", "Stops pain"],
    patterns: ["肩臂痛", "腰痛", "目視不明", "急性腰扭傷", "落枕"],
    patternsEn: ["Shoulder and arm pain", "Low back pain", "Blurred vision", "Acute lumbar sprain pattern", "Stiff neck"],
    evidence: "郄穴，臨床常見於急性疼痛與目疾配穴。",
    cautions: "急性外傷、骨折疑慮或神經症狀需先醫療評估。",
    sources: standardPointSources("SI6"),
    x: 302,
    y: 270
  },
  {
    code: "SI7",
    nameZh: "支正",
    nameEn: "Branch to the Correct",
    pinyin: "Zhizheng",
    meridian: "Small Intestine / 小腸經",
    region: "前臂",
    location: "前臂背尺側，腕背橫紋上 5 寸，尺骨與尺側腕屈肌之間。",
    locationEn: "On the dorsal ulnar aspect of the forearm, 5 cun proximal to the dorsal wrist crease, between the ulna and flexor carpi ulnaris.",
    cunMeasurement: "5 cun above the dorsal wrist crease.",
    functions: "通絡止痛，安神清熱。",
    functionsEn: ["Activates the channel", "Stops pain", "Calms the spirit", "Clears heat"],
    patterns: ["頭項強痛", "肩臂痛", "癲狂", "熱病", "肘臂拘急"],
    patternsEn: ["Stiff neck and headache", "Shoulder and arm pain", "Mania pattern", "Febrile disease", "Elbow and arm tension"],
    evidence: "絡穴，手太陽循經痛與神志熱證配穴。",
    cautions: "前臂外傷、感染或不明麻木需先評估。",
    sources: standardPointSources("SI7"),
    x: 300,
    y: 244
  },
  {
    code: "SI8",
    nameZh: "小海",
    nameEn: "Small Sea",
    pinyin: "Xiaohai",
    meridian: "Small Intestine / 小腸經",
    region: "肘部",
    location: "肘內側，尺骨鷹嘴與肱骨內上髁之間凹陷處。",
    locationEn: "On the medial aspect of the elbow, in the depression between the olecranon of the ulna and the medial epicondyle of the humerus.",
    cunMeasurement: "Between olecranon and medial epicondyle.",
    functions: "清熱安神，通絡止痛。",
    functionsEn: ["Clears heat", "Calms the spirit", "Activates the channel", "Stops pain"],
    patterns: ["肘臂痛", "癲癇", "頭項痛", "耳鳴", "牙齦腫痛"],
    patternsEn: ["Elbow and arm pain", "Seizure pattern", "Head and neck pain", "Tinnitus", "Swollen painful gums"],
    evidence: "合土穴，肘部局部痛與小腸經頭面耳症狀配穴。",
    cautions: "尺神經附近，避免強烈電擊樣刺激；肘部麻木需評估。",
    sources: standardPointSources("SI8"),
    x: 300,
    y: 222
  },
  {
    code: "SI9",
    nameZh: "肩貞",
    nameEn: "True Shoulder",
    pinyin: "Jianzhen",
    meridian: "Small Intestine / 小腸經",
    region: "肩部",
    location: "肩關節後下方，臂內收時腋後紋頭上 1 寸。",
    locationEn: "Posterior and inferior to the shoulder joint, 1 cun superior to the posterior axillary fold when the arm is adducted.",
    cunMeasurement: "1 cun above the posterior axillary fold.",
    functions: "通絡止痛，利肩臂。",
    functionsEn: ["Activates the channel", "Benefits the shoulder and arm", "Stops pain"],
    patterns: ["肩臂痛", "肩關節活動受限", "上肢麻木", "耳鳴"],
    patternsEn: ["Shoulder and arm pain", "Restricted shoulder movement", "Upper limb numbness", "Tinnitus"],
    evidence: "肩部局部高頻穴，常與 LI15、TE14、SI10 等配合。",
    cautions: "肩部急性外傷、撕裂或紅腫熱痛需先評估。",
    sources: standardPointSources("SI9"),
    x: 106,
    y: 148
  },
  {
    code: "SI10",
    nameZh: "臑俞",
    nameEn: "Upper Arm Shu",
    pinyin: "Naoshu",
    meridian: "Small Intestine / 小腸經",
    region: "肩胛",
    location: "肩胛部，腋後紋頭直上，肩胛岡下緣凹陷處。",
    locationEn: "On the scapular region, directly superior to the posterior axillary fold, in the depression inferior to the scapular spine.",
    cunMeasurement: "Inferior to the scapular spine.",
    functions: "舒筋活絡，利肩臂。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the shoulder and arm"],
    patterns: ["肩臂痛", "肩胛痛", "上肢不舉", "頸項痛"],
    patternsEn: ["Shoulder and arm pain", "Scapular pain", "Inability to raise the arm", "Neck pain"],
    evidence: "肩胛局部與肩關節活動受限配穴。",
    cautions: "肩胛區深部操作需熟悉解剖；急性肩傷先評估。",
    sources: standardPointSources("SI10"),
    x: 98,
    y: 132
  },
  {
    code: "SI11",
    nameZh: "天宗",
    nameEn: "Celestial Gathering",
    pinyin: "Tianzong",
    meridian: "Small Intestine / 小腸經",
    region: "肩胛",
    location: "肩胛部，肩胛岡中點與肩胛骨下角連線上 1/3 與下 2/3 交點凹陷處。",
    locationEn: "On the scapular region, in the depression at the junction of the upper third and lower two thirds of the line between the midpoint of the scapular spine and the inferior angle of the scapula.",
    cunMeasurement: "On the scapula, upper third/lower two thirds landmark line.",
    functions: "舒筋活絡，理氣寬胸。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Moves qi", "Unbinds the chest"],
    patterns: ["肩胛痛", "肩臂痛", "乳癰", "胸脅痛", "氣滯疼痛"],
    patternsEn: ["Scapular pain", "Shoulder and arm pain", "Breast abscess pattern", "Chest and hypochondriac pain", "Qi stagnation pain"],
    evidence: "肩胛痛與胸乳氣滯常用穴，臨床辨證配伍很高頻。",
    cautions: "肩胛區避免過深向胸腔方向操作；外傷或腫塊需先評估。",
    sources: standardPointSources("SI11"),
    x: 104,
    y: 166
  },
  {
    code: "SI12",
    nameZh: "秉風",
    nameEn: "Grasping the Wind",
    pinyin: "Bingfeng",
    meridian: "Small Intestine / 小腸經",
    region: "肩胛",
    location: "肩胛部，岡上窩中央，天宗直上，舉臂有凹陷處。",
    locationEn: "On the scapular region, in the center of the supraspinous fossa, directly superior to SI11, where a depression forms when the arm is raised.",
    cunMeasurement: "Center of supraspinous fossa.",
    functions: "祛風通絡，利肩胛。",
    functionsEn: ["Dispels wind", "Activates the channel", "Benefits the shoulder and scapula"],
    patterns: ["肩胛痛", "肩臂痠痛", "上肢麻木", "頸項強痛"],
    patternsEn: ["Scapular pain", "Shoulder and arm soreness", "Upper limb numbness", "Stiff neck"],
    evidence: "肩胛岡上窩局部痛與風寒痹阻配穴。",
    cautions: "肩胛區需注意深度與方向；急性肩袖損傷需先評估。",
    sources: standardPointSources("SI12"),
    x: 104,
    y: 126
  },
  {
    code: "SI13",
    nameZh: "曲垣",
    nameEn: "Crooked Wall",
    pinyin: "Quyuan",
    meridian: "Small Intestine / 小腸經",
    region: "肩胛",
    location: "肩胛部，岡上窩內側端，臑俞與第 2 胸椎棘突連線中點。",
    locationEn: "On the scapular region, at the medial end of the supraspinous fossa, midway between SI10 and the spinous process of T2.",
    cunMeasurement: "Medial end of supraspinous fossa.",
    functions: "舒筋止痛，利肩背。",
    functionsEn: ["Relaxes sinews", "Stops pain", "Benefits the shoulder and back"],
    patterns: ["肩胛痛", "肩背拘急", "頸項強痛", "上肢痠痛"],
    patternsEn: ["Scapular pain", "Tight shoulder and back", "Stiff neck", "Upper limb soreness"],
    evidence: "肩背肌筋膜痛常用局部穴。",
    cautions: "肩背區不宜盲目深刺；神經症狀或外傷需評估。",
    sources: standardPointSources("SI13"),
    x: 122,
    y: 126
  },
  {
    code: "SI14",
    nameZh: "肩外俞",
    nameEn: "Outer Shoulder Shu",
    pinyin: "Jianwaishu",
    meridian: "Small Intestine / 小腸經",
    region: "上背",
    location: "背部，第 1 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T1.",
    cunMeasurement: "3 cun lateral to T1.",
    functions: "舒肩背，散寒止痛。",
    functionsEn: ["Benefits the shoulder and back", "Dispels cold", "Stops pain"],
    patterns: ["肩背痛", "頸項強痛", "肩胛拘急", "咳嗽"],
    patternsEn: ["Shoulder and back pain", "Stiff neck", "Scapular tightness", "Cough"],
    evidence: "頸肩背痛局部配穴。",
    cautions: "上背部近肺尖區域需注意角度與深度，避免深刺。",
    sources: standardPointSources("SI14"),
    x: 126,
    y: 116
  },
  {
    code: "SI15",
    nameZh: "肩中俞",
    nameEn: "Middle Shoulder Shu",
    pinyin: "Jianzhongshu",
    meridian: "Small Intestine / 小腸經",
    region: "上背",
    location: "背部，第 7 頸椎棘突下，後正中線旁開 2 寸。",
    locationEn: "On the back, 2 cun lateral to the lower border of the spinous process of C7.",
    cunMeasurement: "2 cun lateral to C7.",
    functions: "宣肺止咳，舒項背。",
    functionsEn: ["Benefits the Lung", "Stops cough", "Relaxes the neck and back"],
    patterns: ["咳嗽", "氣喘", "頸項強痛", "肩背痛"],
    patternsEn: ["Cough", "Wheezing", "Stiff neck", "Shoulder and back pain"],
    evidence: "頸肩背與肺氣不宣類配穴。",
    cautions: "近肺尖，需斜刺淺刺並避免深刺；呼吸困難需急症評估。",
    sources: standardPointSources("SI15"),
    x: 132,
    y: 108
  },
  {
    code: "SI16",
    nameZh: "天窗",
    nameEn: "Celestial Window",
    pinyin: "Tianchuang",
    meridian: "Small Intestine / 小腸經",
    region: "頸部",
    location: "頸外側，胸鎖乳突肌後緣，喉結旁開約 3 寸。",
    locationEn: "On the lateral aspect of the neck, posterior to sternocleidomastoid, about 3 cun lateral to the laryngeal prominence.",
    cunMeasurement: "About 3 cun lateral to the laryngeal prominence.",
    functions: "利咽開竅，聰耳明目。",
    functionsEn: ["Benefits the throat", "Opens the orifices", "Benefits the ears and eyes"],
    patterns: ["耳鳴", "咽喉腫痛", "失音", "頸項強痛", "癲狂"],
    patternsEn: ["Tinnitus", "Sore throat", "Loss of voice", "Stiff neck", "Mania pattern"],
    evidence: "天窗類穴，耳咽喉與頸項症狀配穴。",
    cautions: "頸部血管神經密集，需專業操作；頸部腫塊或眩暈症狀需先評估。",
    sources: standardPointSources("SI16"),
    x: 198,
    y: 104
  },
  {
    code: "SI17",
    nameZh: "天容",
    nameEn: "Celestial Appearance",
    pinyin: "Tianrong",
    meridian: "Small Intestine / 小腸經",
    region: "頸面",
    location: "下頜角後方，胸鎖乳突肌前緣凹陷處。",
    locationEn: "Posterior to the angle of the mandible, in the depression on the anterior border of sternocleidomastoid.",
    cunMeasurement: "Posterior to the angle of mandible.",
    functions: "清咽利喉，消腫散結。",
    functionsEn: ["Benefits the throat", "Reduces swelling", "Dissipates nodules"],
    patterns: ["咽喉腫痛", "頸項腫痛", "耳鳴", "牙關不利", "甲狀腺腫大類辨證"],
    patternsEn: ["Sore swollen throat", "Neck swelling and pain", "Tinnitus", "Jaw difficulty", "Goiter pattern support"],
    evidence: "咽喉、頸部腫痛與耳部症狀配穴。",
    cautions: "頸動脈附近，避免深刺；頸部腫塊、吞嚥困難或感染需醫療評估。",
    sources: standardPointSources("SI17"),
    x: 204,
    y: 96
  },
  {
    code: "SI18",
    nameZh: "顴髎",
    nameEn: "Cheek Bone Crevice",
    pinyin: "Quanliao",
    meridian: "Small Intestine / 小腸經",
    region: "面部",
    location: "面部，目外眥直下，顴骨下緣凹陷處。",
    locationEn: "On the face, directly inferior to the outer canthus, in the depression at the lower border of the zygomatic bone.",
    cunMeasurement: "Below the outer canthus at the zygomatic bone.",
    functions: "祛風通絡，消腫止痛。",
    functionsEn: ["Dispels wind", "Activates the channel", "Reduces swelling", "Stops pain"],
    patterns: ["面痛", "面癱", "三叉神經痛類辨證", "牙痛", "面頰腫"],
    patternsEn: ["Facial pain", "Facial paralysis pattern", "Trigeminal neuralgia pattern support", "Toothache", "Cheek swelling"],
    evidence: "面頰局部痛、面癱與牙面症狀配穴。",
    cautions: "面部淺刺，避開眼眶；急性面癱、腫脹感染或視覺症狀需醫療評估。",
    sources: standardPointSources("SI18"),
    x: 192,
    y: 78
  },
  {
    code: "SI19",
    nameZh: "聽宮",
    nameEn: "Hearing Palace",
    pinyin: "Tinggong",
    meridian: "Small Intestine / 小腸經",
    region: "耳前",
    location: "面部，耳屏前，下頜骨髁狀突後方，張口時凹陷處。",
    locationEn: "On the face, anterior to the tragus and posterior to the condyloid process of the mandible, in the depression formed when the mouth is opened.",
    cunMeasurement: "Anterior to the tragus with mouth open.",
    functions: "聰耳開竅，通絡止痛。",
    functionsEn: ["Benefits the ears", "Opens the orifices", "Activates the channel", "Stops pain"],
    patterns: ["耳鳴", "耳聾", "中耳炎類辨證", "牙痛", "下頜關節痛"],
    patternsEn: ["Tinnitus", "Hearing loss", "Otitis pattern support", "Toothache", "Temporomandibular joint pain"],
    evidence: "耳前局部與聽覺症狀高頻穴，常與 TE21、GB2 比較記憶。",
    cautions: "張口取穴，面神經與耳前血管附近需輕柔；急性耳痛發熱需醫療評估。",
    sources: standardPointSources("SI19"),
    x: 214,
    y: 78
  }
];

const bladderMeridianExpansion = [
  {
    code: "BL1",
    nameZh: "睛明",
    nameEn: "Bright Eyes",
    pinyin: "Jingming",
    meridian: "Bladder / 膀胱經",
    region: "眼周",
    location: "目內眥內上方凹陷處。",
    locationEn: "In the depression slightly superior to the inner canthus of the eye.",
    cunMeasurement: "At the inner canthus.",
    functions: "明目祛風，清熱通絡。",
    functionsEn: ["Benefits the eyes", "Dispels wind", "Clears heat", "Activates the channel"],
    patterns: ["目赤腫痛", "流淚", "夜盲", "近視類辨證", "目眩"],
    patternsEn: ["Red swollen painful eyes", "Lacrimation", "Night blindness pattern", "Myopia pattern support", "Dizziness with eye symptoms"],
    evidence: "眼科局部高頻穴，常見於目赤、流淚與視覺疲勞配穴。",
    cautions: "眼周高風險穴，嚴禁自行針刺；需專業訓練並注意眼球與血管。",
    sources: standardPointSources("BL1"),
    x: 174,
    y: 60
  },
  {
    code: "BL2",
    nameZh: "攢竹",
    nameEn: "Gathered Bamboo",
    pinyin: "Cuanzhu",
    meridian: "Bladder / 膀胱經",
    region: "眉部",
    location: "眉頭凹陷處，眶上切跡附近。",
    locationEn: "In the depression at the medial end of the eyebrow, near the supraorbital notch.",
    cunMeasurement: "Medial end of the eyebrow.",
    functions: "疏風明目，清頭止痛。",
    functionsEn: ["Dispels wind", "Benefits the eyes", "Clears the head", "Stops pain"],
    patterns: ["頭痛", "眉棱骨痛", "目赤", "流淚", "面癱"],
    patternsEn: ["Headache", "Supraorbital pain", "Red eyes", "Lacrimation", "Facial paralysis pattern"],
    evidence: "頭面眼周常用穴，常與 GB14、Taiyang 等配合。",
    cautions: "眼眶附近宜淺刺或按揉；外傷、感染、視力突變需醫療評估。",
    sources: standardPointSources("BL2"),
    x: 172,
    y: 52
  },
  {
    code: "BL3",
    nameZh: "眉衝",
    nameEn: "Eyebrow Rushing",
    pinyin: "Meichong",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 0.5 寸，神庭旁開 1.5 寸。",
    locationEn: "On the head, 0.5 cun within the anterior hairline, 1.5 cun lateral to GV24.",
    cunMeasurement: "0.5 cun posterior to anterior hairline, 1.5 cun lateral to midline.",
    functions: "清頭目，止痛安神。",
    functionsEn: ["Clears the head and eyes", "Stops pain", "Calms the spirit"],
    patterns: ["頭痛", "目眩", "鼻塞", "癲癇類辨證", "失眠"],
    patternsEn: ["Headache", "Dizziness", "Nasal congestion", "Seizure pattern support", "Insomnia"],
    evidence: "前額頭痛、鼻目症狀與神志類配穴。",
    cautions: "頭皮局部感染或外傷時避開。",
    sources: standardPointSources("BL3"),
    x: 166,
    y: 42
  },
  {
    code: "BL4",
    nameZh: "曲差",
    nameEn: "Crooked Difference",
    pinyin: "Qucha",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 0.5 寸，神庭旁開 3 寸。",
    locationEn: "On the head, 0.5 cun within the anterior hairline, 3 cun lateral to GV24.",
    cunMeasurement: "0.5 cun posterior to anterior hairline, 3 cun lateral to midline.",
    functions: "清頭目，通鼻竅。",
    functionsEn: ["Clears the head and eyes", "Opens the nasal passages", "Stops pain"],
    patterns: ["頭痛", "目眩", "鼻塞", "鼻衄", "目赤"],
    patternsEn: ["Headache", "Dizziness", "Nasal congestion", "Nosebleed", "Red eyes"],
    evidence: "前額、鼻竅與眼目症狀配穴。",
    cautions: "頭皮外傷、感染或出血傾向者需謹慎。",
    sources: standardPointSources("BL4"),
    x: 154,
    y: 44
  },
  {
    code: "BL5",
    nameZh: "五處",
    nameEn: "Fifth Place",
    pinyin: "Wuchu",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 1 寸，神庭旁開 1.5 寸。",
    locationEn: "On the head, 1 cun within the anterior hairline, 1.5 cun lateral to the midline.",
    cunMeasurement: "1 cun posterior to anterior hairline, 1.5 cun lateral to midline.",
    functions: "清頭安神，祛風止痙。",
    functionsEn: ["Clears the head", "Calms the spirit", "Dispels wind", "Stops spasms"],
    patterns: ["頭痛", "目眩", "癲癇類辨證", "小兒驚風類辨證"],
    patternsEn: ["Headache", "Dizziness", "Seizure pattern support", "Pediatric fright-wind pattern support"],
    evidence: "頭部與神志、風動類辨證配穴。",
    cautions: "兒童、癲癇或神志症狀需由專業者評估。",
    sources: standardPointSources("BL5"),
    x: 166,
    y: 34
  },
  {
    code: "BL6",
    nameZh: "承光",
    nameEn: "Receiving Light",
    pinyin: "Chengguang",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 2.5 寸，前正中線旁開 1.5 寸。",
    locationEn: "On the head, 2.5 cun posterior to the anterior hairline and 1.5 cun lateral to the midline.",
    cunMeasurement: "2.5 cun posterior to anterior hairline, 1.5 cun lateral to midline.",
    functions: "清頭明目，通鼻止痛。",
    functionsEn: ["Clears the head", "Benefits the eyes", "Opens the nose", "Stops pain"],
    patterns: ["頭痛", "目眩", "鼻塞", "熱病無汗", "癲癇類辨證"],
    patternsEn: ["Headache", "Dizziness", "Nasal congestion", "Febrile disease without sweating", "Seizure pattern support"],
    evidence: "頭頂前部、鼻目與熱病類配穴。",
    cautions: "頭皮局部病變或外傷時避開。",
    sources: standardPointSources("BL6"),
    x: 166,
    y: 24
  },
  {
    code: "BL7",
    nameZh: "通天",
    nameEn: "Heavenly Connection",
    pinyin: "Tongtian",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 4 寸，前正中線旁開 1.5 寸。",
    locationEn: "On the head, 4 cun posterior to the anterior hairline and 1.5 cun lateral to the midline.",
    cunMeasurement: "4 cun posterior to anterior hairline, 1.5 cun lateral to midline.",
    functions: "清頭開竅，通鼻利竅。",
    functionsEn: ["Clears the head", "Opens the orifices", "Benefits the nose"],
    patterns: ["頭痛", "鼻塞", "鼻淵", "目眩", "頸項強痛"],
    patternsEn: ["Headache", "Nasal congestion", "Sinus pattern", "Dizziness", "Stiff neck"],
    evidence: "頭鼻症狀與膀胱經循行頭項痛配穴。",
    cautions: "慢性鼻竇症狀需辨別感染、過敏與結構性問題。",
    sources: standardPointSources("BL7"),
    x: 166,
    y: 18
  },
  {
    code: "BL8",
    nameZh: "絡卻",
    nameEn: "Declining Connection",
    pinyin: "Luoque",
    meridian: "Bladder / 膀胱經",
    region: "頭部",
    location: "頭部，前髮際上 5.5 寸，前正中線旁開 1.5 寸。",
    locationEn: "On the head, 5.5 cun posterior to the anterior hairline and 1.5 cun lateral to the midline.",
    cunMeasurement: "5.5 cun posterior to anterior hairline, 1.5 cun lateral to midline.",
    functions: "清頭安神，熄風止痙。",
    functionsEn: ["Clears the head", "Calms the spirit", "Extinguishes wind", "Stops spasms"],
    patterns: ["頭暈", "目視不明", "癲癇類辨證", "耳鳴", "鼻塞"],
    patternsEn: ["Dizziness", "Blurred vision", "Seizure pattern support", "Tinnitus", "Nasal congestion"],
    evidence: "頭部風動、神志與耳目鼻症狀配穴。",
    cautions: "突發頭暈、神志改變、抽搐或視覺異常需急症評估。",
    sources: standardPointSources("BL8"),
    x: 166,
    y: 14
  },
  {
    code: "BL9",
    nameZh: "玉枕",
    nameEn: "Jade Pillow",
    pinyin: "Yuzhen",
    meridian: "Bladder / 膀胱經",
    region: "後頭",
    location: "後頭部，後髮際上 2.5 寸，後正中線旁開 1.3 寸。",
    locationEn: "On the posterior head, 2.5 cun superior to the posterior hairline and 1.3 cun lateral to the midline.",
    cunMeasurement: "2.5 cun above posterior hairline, 1.3 cun lateral to midline.",
    functions: "清頭目，通鼻竅，舒項。",
    functionsEn: ["Clears the head and eyes", "Opens the nose", "Benefits the neck"],
    patterns: ["頭痛", "目痛", "鼻塞", "頸項強痛", "目視不明"],
    patternsEn: ["Headache", "Eye pain", "Nasal congestion", "Stiff neck", "Blurred vision"],
    evidence: "後頭痛、頸項與鼻目症狀配穴。",
    cautions: "枕部外傷、劇烈頭痛或神經症狀需先醫療評估。",
    sources: standardPointSources("BL9"),
    x: 166,
    y: 72
  },
  {
    code: "BL11",
    nameZh: "大杼",
    nameEn: "Great Shuttle",
    pinyin: "Dazhu",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 1 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T1.",
    cunMeasurement: "1.5 cun lateral to T1.",
    functions: "強骨舒筋，宣肺解表。",
    functionsEn: ["Benefits bones", "Relaxes sinews", "Releases the exterior", "Benefits the Lung"],
    patterns: ["項背強痛", "咳嗽", "發熱", "骨病類辨證", "肩背痛"],
    patternsEn: ["Stiff neck and back pain", "Cough", "Fever", "Bone disorder pattern support", "Shoulder and back pain"],
    evidence: "八會穴之骨會，NCCAOM 高頻考點；常用於頸背與骨關節相關配穴。",
    cautions: "近肺尖區域，避免深刺；呼吸症狀或胸背劇痛需醫療評估。",
    sources: standardPointSources("BL11"),
    x: 148,
    y: 116
  },
  {
    code: "BL12",
    nameZh: "風門",
    nameEn: "Wind Gate",
    pinyin: "Fengmen",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 2 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T2.",
    cunMeasurement: "1.5 cun lateral to T2.",
    functions: "祛風解表，宣肺止咳。",
    functionsEn: ["Dispels wind", "Releases the exterior", "Benefits the Lung", "Stops cough"],
    patterns: ["外感風寒", "咳嗽", "鼻塞", "項背強痛", "發熱惡寒"],
    patternsEn: ["External wind-cold", "Cough", "Nasal congestion", "Stiff neck and back", "Fever with chills"],
    evidence: "風邪與外感、肺衛不固類配穴常用。",
    cautions: "上背近肺區域需注意深度；發熱咳喘嚴重或呼吸困難需醫療評估。",
    sources: standardPointSources("BL12"),
    x: 148,
    y: 126
  },
  {
    code: "BL14",
    nameZh: "厥陰俞",
    nameEn: "Pericardium Shu",
    pinyin: "Jueyinshu",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 4 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T4.",
    cunMeasurement: "1.5 cun lateral to T4.",
    functions: "寬胸理氣，寧心安神。",
    functionsEn: ["Unbinds the chest", "Regulates qi", "Calms the Heart spirit"],
    patterns: ["心痛", "胸悶", "心悸", "咳嗽", "嘔吐"],
    patternsEn: ["Heart pain pattern", "Chest oppression", "Palpitations", "Cough", "Vomiting"],
    evidence: "心包背俞穴，胸心、心悸與胃氣上逆配穴常見。",
    cautions: "胸背近肺區域避免深刺；胸痛或心律異常需醫療評估。",
    sources: standardPointSources("BL14"),
    x: 148,
    y: 146
  },
  {
    code: "BL15",
    nameZh: "心俞",
    nameEn: "Heart Shu",
    pinyin: "Xinshu",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 5 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T5.",
    cunMeasurement: "1.5 cun lateral to T5.",
    functions: "養心安神，理氣寬胸。",
    functionsEn: ["Nourishes the Heart", "Calms the spirit", "Moves qi", "Unbinds the chest"],
    patterns: ["心悸", "失眠", "健忘", "癲狂癇", "胸痛"],
    patternsEn: ["Palpitations", "Insomnia", "Poor memory", "Mania or seizure patterns", "Chest pain"],
    evidence: "心背俞穴，神志、睡眠與心悸類高頻考點。",
    cautions: "胸痛、心律不整或自傷風險需立即醫療處理；背部針刺避免深刺。",
    sources: standardPointSources("BL15"),
    x: 148,
    y: 156
  },
  {
    code: "BL16",
    nameZh: "督俞",
    nameEn: "Governing Shu",
    pinyin: "Dushu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 6 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T6.",
    cunMeasurement: "1.5 cun lateral to T6.",
    functions: "理氣寬胸，調督脈。",
    functionsEn: ["Moves qi", "Unbinds the chest", "Regulates the Governing vessel"],
    patterns: ["胸痛", "腹痛", "寒熱往來", "心胸煩悶", "背痛"],
    patternsEn: ["Chest pain", "Abdominal pain", "Alternating chills and fever", "Chest vexation", "Back pain"],
    evidence: "背部中線相關與胸膈氣機不暢配穴。",
    cautions: "背胸區避免深刺；不明胸腹痛需先排除急症。",
    sources: standardPointSources("BL16"),
    x: 148,
    y: 166
  },
  {
    code: "BL18",
    nameZh: "肝俞",
    nameEn: "Liver Shu",
    pinyin: "Ganshu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 9 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T9.",
    cunMeasurement: "1.5 cun lateral to T9.",
    functions: "疏肝理氣，養血明目，清利濕熱。",
    functionsEn: ["Spreads Liver qi", "Nourishes blood", "Benefits the eyes", "Clears damp-heat"],
    patterns: ["肝氣鬱結", "目疾", "脅痛", "眩暈", "月經不調"],
    patternsEn: ["Liver qi stagnation", "Eye disorders", "Hypochondriac pain", "Dizziness", "Menstrual irregularity"],
    evidence: "肝背俞穴，情志、目疾、脅痛與婦科辨證高頻。",
    cautions: "肝膽區疼痛、黃疸、視覺急變需醫療評估；背部避免深刺。",
    sources: standardPointSources("BL18"),
    x: 148,
    y: 190
  },
  {
    code: "BL19",
    nameZh: "膽俞",
    nameEn: "Gallbladder Shu",
    pinyin: "Danshu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 10 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T10.",
    cunMeasurement: "1.5 cun lateral to T10.",
    functions: "疏肝利膽，清熱化濕，和胃降逆。",
    functionsEn: ["Benefits the Gallbladder", "Clears damp-heat", "Harmonizes the Stomach", "Descends counterflow"],
    patterns: ["膽腑濕熱", "黃疸", "脅痛", "口苦", "嘔吐"],
    patternsEn: ["Gallbladder damp-heat", "Jaundice", "Hypochondriac pain", "Bitter taste", "Vomiting"],
    evidence: "膽背俞穴，膽濕熱、脅痛與消化逆氣配穴常見。",
    cautions: "黃疸、劇烈右上腹痛或發熱需醫療評估；背部避免深刺。",
    sources: standardPointSources("BL19"),
    x: 148,
    y: 200
  },
  {
    code: "BL21",
    nameZh: "胃俞",
    nameEn: "Stomach Shu",
    pinyin: "Weishu",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 12 胸椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the back, 1.5 cun lateral to the lower border of the spinous process of T12.",
    cunMeasurement: "1.5 cun lateral to T12.",
    functions: "和胃降逆，健脾消食。",
    functionsEn: ["Harmonizes the Stomach", "Descends counterflow", "Strengthens the Spleen", "Promotes digestion"],
    patterns: ["胃痛", "嘔吐", "腹脹", "食少", "脾胃不和"],
    patternsEn: ["Epigastric pain", "Vomiting", "Abdominal distention", "Poor appetite", "Spleen-Stomach disharmony"],
    evidence: "胃背俞穴，消化、胃氣上逆與中焦不和高頻配穴。",
    cautions: "劇烈腹痛、嘔血黑便或持續嘔吐需醫療評估；背部避免深刺。",
    sources: standardPointSources("BL21"),
    x: 148,
    y: 220
  },
  {
    code: "BL22",
    nameZh: "三焦俞",
    nameEn: "Triple Burner Shu",
    pinyin: "Sanjiaoshu",
    meridian: "Bladder / 膀胱經",
    region: "腰背",
    location: "腰部，第 1 腰椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the low back, 1.5 cun lateral to the lower border of the spinous process of L1.",
    cunMeasurement: "1.5 cun lateral to L1.",
    functions: "調三焦，利水濕，和脾胃。",
    functionsEn: ["Regulates the Triple Burner", "Promotes water metabolism", "Resolves dampness", "Harmonizes Spleen and Stomach"],
    patterns: ["水腫", "小便不利", "腹脹", "泄瀉", "腰痛"],
    patternsEn: ["Edema", "Urinary difficulty", "Abdominal distention", "Diarrhea", "Low back pain"],
    evidence: "三焦背俞穴，水液代謝與消化下焦相關證型常用。",
    cautions: "水腫、尿少或腎病疑慮需醫療評估；腰背操作注意深度。",
    sources: standardPointSources("BL22"),
    x: 148,
    y: 232
  },
  {
    code: "BL24",
    nameZh: "氣海俞",
    nameEn: "Qi Sea Shu",
    pinyin: "Qihaishu",
    meridian: "Bladder / 膀胱經",
    region: "腰部",
    location: "腰部，第 3 腰椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the low back, 1.5 cun lateral to the lower border of the spinous process of L3.",
    cunMeasurement: "1.5 cun lateral to L3.",
    functions: "益氣壯腰，調下焦。",
    functionsEn: ["Tonifies qi", "Strengthens the low back", "Regulates the lower burner"],
    patterns: ["腰痛", "下肢痿痹", "痛經", "氣虛", "腹脹"],
    patternsEn: ["Low back pain", "Weakness or painful obstruction of the legs", "Dysmenorrhea", "Qi deficiency", "Abdominal distention"],
    evidence: "腰痛與下焦虛弱類配穴，常與 BL23、BL26、CV6 配伍。",
    cautions: "急性腰傷、神經壓迫或大小便失控需醫療評估。",
    sources: standardPointSources("BL24"),
    x: 148,
    y: 258
  },
  {
    code: "BL26",
    nameZh: "關元俞",
    nameEn: "Origin Pass Shu",
    pinyin: "Guanyuanshu",
    meridian: "Bladder / 膀胱經",
    region: "腰部",
    location: "腰部，第 5 腰椎棘突下，後正中線旁開 1.5 寸。",
    locationEn: "On the low back, 1.5 cun lateral to the lower border of the spinous process of L5.",
    cunMeasurement: "1.5 cun lateral to L5.",
    functions: "強腰膝，調下焦，溫補元氣。",
    functionsEn: ["Strengthens the low back and knees", "Regulates the lower burner", "Supports original qi"],
    patterns: ["腰痛", "腹瀉", "小便不利", "遺尿", "下焦虛寒"],
    patternsEn: ["Low back pain", "Diarrhea", "Urinary difficulty", "Enuresis", "Lower burner deficiency-cold"],
    evidence: "腰骶痛、泌尿與下焦虛寒相關配穴。",
    cautions: "腰椎外傷、放射痛或馬尾症狀需立即醫療評估。",
    sources: standardPointSources("BL26"),
    x: 148,
    y: 284
  },
  {
    code: "BL27",
    nameZh: "小腸俞",
    nameEn: "Small Intestine Shu",
    pinyin: "Xiaochangshu",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 1 骶後孔平，正中骶嵴旁開 1.5 寸。",
    locationEn: "On the sacral region, level with the first posterior sacral foramen, 1.5 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with the first posterior sacral foramen.",
    functions: "通利小腸，調下焦，利腰骶。",
    functionsEn: ["Regulates the Small Intestine", "Benefits urination", "Regulates the lower burner", "Benefits the lumbosacral region"],
    patterns: ["小便不利", "遺尿", "腹瀉", "腰骶痛", "帶下"],
    patternsEn: ["Urinary difficulty", "Enuresis", "Diarrhea", "Lumbosacral pain", "Vaginal discharge pattern"],
    evidence: "小腸背俞穴，下焦泌尿與腰骶症狀配穴。",
    cautions: "骶部操作需辨識骶後孔；孕期與局部感染需專業評估。",
    sources: standardPointSources("BL27"),
    x: 148,
    y: 300
  },
  {
    code: "BL28",
    nameZh: "膀胱俞",
    nameEn: "Bladder Shu",
    pinyin: "Pangguangshu",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 2 骶後孔平，正中骶嵴旁開 1.5 寸。",
    locationEn: "On the sacral region, level with the second posterior sacral foramen, 1.5 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with the second posterior sacral foramen.",
    functions: "通利膀胱，清利濕熱，調下焦。",
    functionsEn: ["Regulates the Bladder", "Promotes urination", "Clears damp-heat", "Regulates the lower burner"],
    patterns: ["小便不利", "淋證", "遺尿", "腰骶痛", "便秘"],
    patternsEn: ["Urinary difficulty", "Lin patterns", "Enuresis", "Lumbosacral pain", "Constipation"],
    evidence: "膀胱背俞穴，泌尿與骶部症狀高頻考點。",
    cautions: "尿痛發熱、血尿、腎盂腎炎疑慮需醫療評估；骶部針刺需專業。",
    sources: standardPointSources("BL28"),
    x: 148,
    y: 314
  },
  {
    code: "BL29",
    nameZh: "中膂俞",
    nameEn: "Mid-Spine Shu",
    pinyin: "Zhonglushu",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 3 骶後孔平，正中骶嵴旁開 1.5 寸。",
    locationEn: "On the sacral region, level with the third posterior sacral foramen, 1.5 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with the third posterior sacral foramen.",
    functions: "強腰骶，調下焦。",
    functionsEn: ["Strengthens the lumbosacral region", "Regulates the lower burner"],
    patterns: ["腰骶痛", "坐骨神經痛類辨證", "泄瀉", "疝氣", "月經不調"],
    patternsEn: ["Lumbosacral pain", "Sciatica pattern support", "Diarrhea", "Hernia pattern", "Menstrual irregularity"],
    evidence: "骶部與坐骨神經路徑疼痛類配穴。",
    cautions: "下肢麻木無力、大小便異常或嚴重放射痛需先醫療評估。",
    sources: standardPointSources("BL29"),
    x: 148,
    y: 326
  },
  {
    code: "BL30",
    nameZh: "白環俞",
    nameEn: "White Ring Shu",
    pinyin: "Baihuanshu",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 4 骶後孔平，正中骶嵴旁開 1.5 寸。",
    locationEn: "On the sacral region, level with the fourth posterior sacral foramen, 1.5 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with the fourth posterior sacral foramen.",
    functions: "調經止帶，強腰骶。",
    functionsEn: ["Regulates menstruation", "Stops vaginal discharge pattern", "Strengthens the lumbosacral region"],
    patterns: ["帶下", "月經不調", "遺精", "腰骶痛", "下焦虛寒"],
    patternsEn: ["Vaginal discharge pattern", "Menstrual irregularity", "Spermatorrhea", "Lumbosacral pain", "Lower burner deficiency-cold"],
    evidence: "婦科、男科與腰骶下焦虛寒配穴。",
    cautions: "孕期、感染、異常出血或泌尿生殖急症需醫療評估。",
    sources: standardPointSources("BL30"),
    x: 148,
    y: 338
  },
  {
    code: "BL31",
    nameZh: "上髎",
    nameEn: "Upper Bone Hole",
    pinyin: "Shangliao",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 1 骶後孔中。",
    locationEn: "On the sacral region, in the first posterior sacral foramen.",
    cunMeasurement: "First posterior sacral foramen.",
    functions: "調下焦，利腰骶，調經止痛。",
    functionsEn: ["Regulates the lower burner", "Benefits the lumbosacral region", "Regulates menstruation", "Stops pain"],
    patterns: ["腰骶痛", "月經不調", "痛經", "小便不利", "便秘"],
    patternsEn: ["Lumbosacral pain", "Menstrual irregularity", "Dysmenorrhea", "Urinary difficulty", "Constipation"],
    evidence: "八髎穴之一，婦科、泌尿與腰骶痛常用。",
    cautions: "骶孔操作需專業定位；孕期或骨盆急性症狀需評估。",
    sources: standardPointSources("BL31"),
    x: 156,
    y: 300
  },
  {
    code: "BL33",
    nameZh: "中髎",
    nameEn: "Middle Bone Hole",
    pinyin: "Zhongliao",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 3 骶後孔中。",
    locationEn: "On the sacral region, in the third posterior sacral foramen.",
    cunMeasurement: "Third posterior sacral foramen.",
    functions: "調下焦，利腰骶，調經止痛。",
    functionsEn: ["Regulates the lower burner", "Benefits the lumbosacral region", "Regulates menstruation", "Stops pain"],
    patterns: ["腰骶痛", "月經不調", "痛經", "小便不利", "便秘"],
    patternsEn: ["Lumbosacral pain", "Menstrual irregularity", "Dysmenorrhea", "Urinary difficulty", "Constipation"],
    evidence: "八髎穴之一，婦科、泌尿與腰骶痛常用。",
    cautions: "骶孔操作需專業定位；孕期或急性骨盆症狀需評估。",
    sources: standardPointSources("BL33"),
    x: 156,
    y: 326
  },
  {
    code: "BL34",
    nameZh: "下髎",
    nameEn: "Lower Bone Hole",
    pinyin: "Xialiao",
    meridian: "Bladder / 膀胱經",
    region: "骶部",
    location: "骶部，第 4 骶後孔中。",
    locationEn: "On the sacral region, in the fourth posterior sacral foramen.",
    cunMeasurement: "Fourth posterior sacral foramen.",
    functions: "調經止帶，通利二便，舒腰骶。",
    functionsEn: ["Regulates menstruation", "Regulates urination and defecation", "Benefits the lumbosacral region"],
    patterns: ["帶下", "痛經", "小便不利", "便秘", "腰骶痛"],
    patternsEn: ["Vaginal discharge pattern", "Dysmenorrhea", "Urinary difficulty", "Constipation", "Lumbosacral pain"],
    evidence: "八髎穴之一，下焦婦科、泌尿與腰骶痛配穴。",
    cautions: "骶部感染、孕期、異常出血或急性疼痛需專業評估。",
    sources: standardPointSources("BL34"),
    x: 156,
    y: 338
  },
  {
    code: "BL35",
    nameZh: "會陽",
    nameEn: "Meeting of Yang",
    pinyin: "Huiyang",
    meridian: "Bladder / 膀胱經",
    region: "會陰骶部",
    location: "尾骨端旁開 0.5 寸。",
    locationEn: "0.5 cun lateral to the extremity of the coccyx.",
    cunMeasurement: "0.5 cun lateral to coccyx tip.",
    functions: "通調二便，清利濕熱。",
    functionsEn: ["Regulates urination and defecation", "Clears damp-heat", "Benefits the perineal region"],
    patterns: ["痔疾", "泄瀉", "便秘", "小便不利", "帶下"],
    patternsEn: ["Hemorrhoids", "Diarrhea", "Constipation", "Urinary difficulty", "Vaginal discharge pattern"],
    evidence: "會陰肛門與下焦濕熱類配穴。",
    cautions: "局部私密區域需專業、衛生與同意；感染、出血或腫塊需醫療評估。",
    sources: standardPointSources("BL35"),
    x: 154,
    y: 356
  },
  {
    code: "BL36",
    nameZh: "承扶",
    nameEn: "Support and Hold",
    pinyin: "Chengfu",
    meridian: "Bladder / 膀胱經",
    region: "臀部",
    location: "臀橫紋中點。",
    locationEn: "At the midpoint of the gluteal fold.",
    cunMeasurement: "Midpoint of the gluteal fold.",
    functions: "舒筋活絡，利腰腿。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the low back and leg"],
    patterns: ["腰腿痛", "坐骨神經痛類辨證", "痔疾", "下肢痿痹"],
    patternsEn: ["Low back and leg pain", "Sciatica pattern support", "Hemorrhoids", "Weakness or painful obstruction of the leg"],
    evidence: "臀腿後側疼痛與坐骨神經路徑配穴。",
    cautions: "臀部深層神經血管需注意；急性放射痛或肌力下降需醫療評估。",
    sources: standardPointSources("BL36"),
    x: 170,
    y: 380
  },
  {
    code: "BL37",
    nameZh: "殷門",
    nameEn: "Gate of Abundance",
    pinyin: "Yinmen",
    meridian: "Bladder / 膀胱經",
    region: "大腿後側",
    location: "大腿後側，承扶與委中連線上，承扶下 6 寸。",
    locationEn: "On the posterior thigh, 6 cun inferior to BL36 on the line connecting BL36 and BL40.",
    cunMeasurement: "6 cun below BL36.",
    functions: "舒筋活絡，利腰腿。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the low back and leg"],
    patterns: ["腰腿痛", "坐骨神經痛類辨證", "大腿後側痛", "下肢麻木"],
    patternsEn: ["Low back and leg pain", "Sciatica pattern support", "Posterior thigh pain", "Leg numbness"],
    evidence: "膀胱經大腿後側循經痛常用。",
    cautions: "深部坐骨神經附近，避免強刺激；神經缺損需醫療評估。",
    sources: standardPointSources("BL37"),
    x: 176,
    y: 420
  },
  {
    code: "BL38",
    nameZh: "浮郄",
    nameEn: "Superficial Cleft",
    pinyin: "Fuxi",
    meridian: "Bladder / 膀胱經",
    region: "膕上",
    location: "膕橫紋上 1 寸，股二頭肌腱內側。",
    locationEn: "1 cun superior to the popliteal crease, medial to the tendon of biceps femoris.",
    cunMeasurement: "1 cun above the popliteal crease.",
    functions: "舒筋活絡，清熱止痛。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Clears heat", "Stops pain"],
    patterns: ["膝膕痛", "大腿後側痛", "便秘", "熱病"],
    patternsEn: ["Knee and popliteal pain", "Posterior thigh pain", "Constipation", "Febrile disease"],
    evidence: "膕窩上方局部與膀胱經腿後側疼痛配穴。",
    cautions: "膕窩附近血管神經密集，避免深刺。",
    sources: standardPointSources("BL38"),
    x: 180,
    y: 462
  },
  {
    code: "BL39",
    nameZh: "委陽",
    nameEn: "Bend Yang",
    pinyin: "Weiyang",
    meridian: "Bladder / 膀胱經",
    region: "膕窩",
    location: "膕橫紋外側端，股二頭肌腱內側。",
    locationEn: "At the lateral end of the popliteal crease, medial to the tendon of biceps femoris.",
    cunMeasurement: "Lateral end of the popliteal crease.",
    functions: "通調三焦，利水消腫，舒筋止痛。",
    functionsEn: ["Regulates the Triple Burner", "Promotes urination", "Reduces swelling", "Benefits the knee"],
    patterns: ["小便不利", "水腫", "膝痛", "腰痛", "下肢腫痛"],
    patternsEn: ["Urinary difficulty", "Edema", "Knee pain", "Low back pain", "Leg swelling and pain"],
    evidence: "三焦下合穴，水液代謝與膝腿疼痛高頻考點。",
    cautions: "膕窩血管神經密集，不宜深刺；下肢紅腫熱痛需排除血栓或感染。",
    sources: standardPointSources("BL39"),
    x: 190,
    y: 472
  },
  {
    code: "BL41",
    nameZh: "附分",
    nameEn: "Attached Branch",
    pinyin: "Fufen",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 2 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T2.",
    cunMeasurement: "3 cun lateral to T2.",
    functions: "舒筋活絡，祛風散寒，利肩背。",
    functionsEn: ["Activates the channel", "Dispels wind-cold", "Benefits the shoulder and back"],
    patterns: ["肩背痛", "頸項強痛", "肘臂麻木", "風寒濕痹"],
    patternsEn: ["Shoulder and back pain", "Stiff neck", "Elbow and arm numbness", "Wind-cold-damp painful obstruction"],
    evidence: "膀胱經外側線上背段，常用於肩背痹痛與頸項拘急配穴。",
    cautions: "上背近肺區域，避免深刺；胸背劇痛或呼吸症狀需先醫療評估。",
    sources: standardPointSources("BL41"),
    x: 126,
    y: 126
  },
  {
    code: "BL42",
    nameZh: "魄戶",
    nameEn: "Po Door",
    pinyin: "Pohu",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 3 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T3.",
    cunMeasurement: "3 cun lateral to T3.",
    functions: "宣肺理氣，止咳平喘，寬胸。",
    functionsEn: ["Benefits the Lung", "Stops cough", "Calms wheezing", "Unbinds the chest"],
    patterns: ["咳嗽", "氣喘", "胸悶", "肺氣虛", "肩背痛"],
    patternsEn: ["Cough", "Wheezing", "Chest oppression", "Lung qi deficiency", "Shoulder and back pain"],
    evidence: "肺俞外側相應點，常與 BL13、LU 系穴配合處理肺系與上背症狀。",
    cautions: "胸背區避免深刺；氣喘急性發作、胸痛或呼吸困難需立即就醫。",
    sources: standardPointSources("BL42"),
    x: 126,
    y: 136
  },
  {
    code: "BL43",
    nameZh: "膏肓",
    nameEn: "Vital Region",
    pinyin: "Gaohuang",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 4 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T4.",
    cunMeasurement: "3 cun lateral to T4.",
    functions: "補虛扶正，宣肺止咳，寧心安神。",
    functionsEn: ["Tonifies deficiency", "Supports upright qi", "Benefits the Lung", "Calms the spirit"],
    patterns: ["虛勞", "咳喘", "盜汗", "健忘", "肩背痛"],
    patternsEn: ["Consumptive deficiency", "Cough and wheezing", "Night sweating", "Poor memory", "Shoulder and back pain"],
    evidence: "傳統補虛要穴，NCCAOM 常見考點；臨床需辨虛實與體質。",
    cautions: "近肺區域需斜刺或淺刺，避免深刺；嚴重虛弱或不明體重下降需醫療評估。",
    sources: standardPointSources("BL43"),
    x: 126,
    y: 146
  },
  {
    code: "BL44",
    nameZh: "神堂",
    nameEn: "Spirit Hall",
    pinyin: "Shentang",
    meridian: "Bladder / 膀胱經",
    region: "上背",
    location: "背部，第 5 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T5.",
    cunMeasurement: "3 cun lateral to T5.",
    functions: "寧心安神，寬胸理氣。",
    functionsEn: ["Calms the spirit", "Unbinds the chest", "Regulates Heart qi"],
    patterns: ["心悸", "失眠", "胸悶", "咳嗽", "背痛"],
    patternsEn: ["Palpitations", "Insomnia", "Chest oppression", "Cough", "Back pain"],
    evidence: "心俞外側相應點，常用於神志、睡眠與胸背不適配穴。",
    cautions: "胸痛、心律不整或自傷風險需醫療評估；背部避免深刺。",
    sources: standardPointSources("BL44"),
    x: 126,
    y: 156
  },
  {
    code: "BL45",
    nameZh: "譩譆",
    nameEn: "Yixi",
    pinyin: "Yixi",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 6 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T6.",
    cunMeasurement: "3 cun lateral to T6.",
    functions: "宣肺理氣，舒背止痛。",
    functionsEn: ["Regulates Lung qi", "Unbinds the chest", "Benefits the back", "Stops pain"],
    patterns: ["咳嗽", "氣喘", "胸脅痛", "背痛", "瘧疾往來寒熱"],
    patternsEn: ["Cough", "Wheezing", "Chest and hypochondriac pain", "Back pain", "Alternating chills and fever"],
    evidence: "胸背氣機不暢與肺系症狀配穴。",
    cautions: "背胸區需注意深度；發熱寒戰或呼吸困難需醫療評估。",
    sources: standardPointSources("BL45"),
    x: 126,
    y: 166
  },
  {
    code: "BL46",
    nameZh: "膈關",
    nameEn: "Diaphragm Gate",
    pinyin: "Geguan",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 7 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T7.",
    cunMeasurement: "3 cun lateral to T7.",
    functions: "寬胸利膈，和胃降逆。",
    functionsEn: ["Benefits the diaphragm", "Unbinds the chest", "Harmonizes the Stomach", "Descends counterflow"],
    patterns: ["呃逆", "嘔吐", "胸悶", "吞嚥不利", "背痛"],
    patternsEn: ["Hiccup", "Vomiting", "Chest oppression", "Difficult swallowing", "Back pain"],
    evidence: "膈俞外側相應點，胸膈與胃氣上逆類配穴。",
    cautions: "吞嚥困難、胸痛或持續嘔吐需醫療評估；背部避免深刺。",
    sources: standardPointSources("BL46"),
    x: 126,
    y: 178
  },
  {
    code: "BL47",
    nameZh: "魂門",
    nameEn: "Hun Gate",
    pinyin: "Hunmen",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 9 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T9.",
    cunMeasurement: "3 cun lateral to T9.",
    functions: "疏肝理氣，寬胸脅，安神。",
    functionsEn: ["Spreads Liver qi", "Benefits the chest and hypochondrium", "Calms the spirit"],
    patterns: ["肝氣鬱結", "脅痛", "胸悶", "情志鬱悶", "背痛"],
    patternsEn: ["Liver qi stagnation", "Hypochondriac pain", "Chest oppression", "Emotional constraint", "Back pain"],
    evidence: "肝俞外側相應點，肝鬱、脅痛與情志相關配穴。",
    cautions: "黃疸、劇烈右上腹痛或情緒危機需醫療評估。",
    sources: standardPointSources("BL47"),
    x: 126,
    y: 190
  },
  {
    code: "BL48",
    nameZh: "陽綱",
    nameEn: "Yang Headrope",
    pinyin: "Yanggang",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 10 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T10.",
    cunMeasurement: "3 cun lateral to T10.",
    functions: "疏肝利膽，清利濕熱。",
    functionsEn: ["Benefits the Gallbladder", "Clears damp-heat", "Regulates the middle burner"],
    patterns: ["膽腑濕熱", "黃疸", "口苦", "脅痛", "嘔吐"],
    patternsEn: ["Gallbladder damp-heat", "Jaundice", "Bitter taste", "Hypochondriac pain", "Vomiting"],
    evidence: "膽俞外側相應點，膽濕熱與脅肋不適常用配穴。",
    cautions: "黃疸、發熱或劇烈腹痛需醫療評估。",
    sources: standardPointSources("BL48"),
    x: 126,
    y: 200
  },
  {
    code: "BL49",
    nameZh: "意舍",
    nameEn: "Thought Abode",
    pinyin: "Yishe",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 11 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T11.",
    cunMeasurement: "3 cun lateral to T11.",
    functions: "健脾和胃，化濕寧神。",
    functionsEn: ["Strengthens the Spleen", "Harmonizes the Stomach", "Resolves dampness", "Calms the mind"],
    patterns: ["脾氣虛", "腹脹", "泄瀉", "食少", "失眠多思"],
    patternsEn: ["Spleen qi deficiency", "Abdominal distention", "Diarrhea", "Poor appetite", "Overthinking with insomnia"],
    evidence: "脾俞外側相應點，脾胃與思慮相關證型配穴。",
    cautions: "慢性消化症狀伴體重下降、黑便或劇痛需醫療評估。",
    sources: standardPointSources("BL49"),
    x: 126,
    y: 212
  },
  {
    code: "BL50",
    nameZh: "胃倉",
    nameEn: "Stomach Granary",
    pinyin: "Weicang",
    meridian: "Bladder / 膀胱經",
    region: "背部",
    location: "背部，第 12 胸椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the back, 3 cun lateral to the lower border of the spinous process of T12.",
    cunMeasurement: "3 cun lateral to T12.",
    functions: "和胃健脾，消食導滯。",
    functionsEn: ["Harmonizes the Stomach", "Strengthens the Spleen", "Promotes digestion"],
    patterns: ["胃痛", "腹脹", "食少", "嘔吐", "脾胃不和"],
    patternsEn: ["Epigastric pain", "Abdominal distention", "Poor appetite", "Vomiting", "Spleen-Stomach disharmony"],
    evidence: "胃俞外側相應點，中焦消化與胃氣不和配穴。",
    cautions: "劇烈腹痛、嘔血、黑便或持續嘔吐需醫療評估。",
    sources: standardPointSources("BL50"),
    x: 126,
    y: 220
  },
  {
    code: "BL51",
    nameZh: "肓門",
    nameEn: "Vitals Gate",
    pinyin: "Huangmen",
    meridian: "Bladder / 膀胱經",
    region: "腰背",
    location: "腰部，第 1 腰椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the low back, 3 cun lateral to the lower border of the spinous process of L1.",
    cunMeasurement: "3 cun lateral to L1.",
    functions: "理氣止痛，調中下焦。",
    functionsEn: ["Moves qi", "Stops pain", "Regulates the middle and lower burners"],
    patterns: ["腹痛", "腹脹", "便秘", "腰痛", "乳疾類辨證"],
    patternsEn: ["Abdominal pain", "Abdominal distention", "Constipation", "Low back pain", "Breast disorder pattern support"],
    evidence: "腰背外側線，中下焦氣滯與腰痛配穴。",
    cautions: "不明腹痛或腰痛伴神經症狀需先醫療評估。",
    sources: standardPointSources("BL51"),
    x: 126,
    y: 232
  },
  {
    code: "BL52",
    nameZh: "志室",
    nameEn: "Will Chamber",
    pinyin: "Zhishi",
    meridian: "Bladder / 膀胱經",
    region: "腰部",
    location: "腰部，第 2 腰椎棘突下，後正中線旁開 3 寸。",
    locationEn: "On the low back, 3 cun lateral to the lower border of the spinous process of L2.",
    cunMeasurement: "3 cun lateral to L2.",
    functions: "補腎益精，強腰膝，固精。",
    functionsEn: ["Tonifies the Kidney", "Benefits essence", "Strengthens the low back and knees", "Stabilizes essence"],
    patterns: ["腎虛腰痛", "遺精", "陽痿類辨證", "水腫", "耳鳴"],
    patternsEn: ["Kidney deficiency low back pain", "Spermatorrhea", "Impotence pattern support", "Edema", "Tinnitus"],
    evidence: "腎俞外側相應點，腎系與腰膝虛弱類高頻配穴。",
    cautions: "腎病、泌尿感染、神經壓迫或劇烈腰痛需醫療評估。",
    sources: standardPointSources("BL52"),
    x: 126,
    y: 246
  },
  {
    code: "BL53",
    nameZh: "胞肓",
    nameEn: "Bladder Vitals",
    pinyin: "Baohuang",
    meridian: "Bladder / 膀胱經",
    region: "骶臀",
    location: "骶部，第 2 骶後孔平，正中骶嵴旁開 3 寸。",
    locationEn: "On the sacral region, level with the second posterior sacral foramen, 3 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with second posterior sacral foramen, 3 cun lateral.",
    functions: "通利二便，調下焦，舒腰骶。",
    functionsEn: ["Regulates urination and defecation", "Regulates the lower burner", "Benefits the lumbosacral region"],
    patterns: ["小便不利", "便秘", "腰骶痛", "坐骨神經痛類辨證", "帶下"],
    patternsEn: ["Urinary difficulty", "Constipation", "Lumbosacral pain", "Sciatica pattern support", "Vaginal discharge pattern"],
    evidence: "骶臀外側線，下焦與坐骨神經路徑疼痛常用。",
    cautions: "骶臀深部操作需熟悉解剖；急性放射痛或大小便異常需醫療評估。",
    sources: standardPointSources("BL53"),
    x: 126,
    y: 314
  },
  {
    code: "BL54",
    nameZh: "秩邊",
    nameEn: "Order's Edge",
    pinyin: "Zhibian",
    meridian: "Bladder / 膀胱經",
    region: "臀部",
    location: "臀部，平第 4 骶後孔，正中骶嵴旁開 3 寸。",
    locationEn: "On the buttock, level with the fourth posterior sacral foramen, 3 cun lateral to the median sacral crest.",
    cunMeasurement: "Level with fourth posterior sacral foramen, 3 cun lateral.",
    functions: "舒筋活絡，利腰腿，通利下焦。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the low back and leg", "Regulates the lower burner"],
    patterns: ["腰腿痛", "坐骨神經痛類辨證", "小便不利", "便秘", "痔疾"],
    patternsEn: ["Low back and leg pain", "Sciatica pattern support", "Urinary difficulty", "Constipation", "Hemorrhoids"],
    evidence: "臀部與坐骨神經路徑高頻穴，常見於腰腿痛配穴。",
    cautions: "深部坐骨神經附近，需專業操作；急性神經缺損需醫療評估。",
    sources: standardPointSources("BL54"),
    x: 128,
    y: 344
  },
  {
    code: "BL55",
    nameZh: "合陽",
    nameEn: "Yang Union",
    pinyin: "Heyang",
    meridian: "Bladder / 膀胱經",
    region: "小腿後側",
    location: "小腿後側，委中下 2 寸，腓腸肌兩肌腹之間。",
    locationEn: "On the posterior leg, 2 cun inferior to BL40, between the two heads of gastrocnemius.",
    cunMeasurement: "2 cun below BL40.",
    functions: "舒筋活絡，利腰膝。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the low back and knee"],
    patterns: ["腰腿痛", "膝痛", "小腿痙攣", "疝氣", "崩漏"],
    patternsEn: ["Low back and leg pain", "Knee pain", "Calf cramp", "Hernia pattern", "Uterine bleeding"],
    evidence: "膀胱經小腿後側循經痛與筋脈拘急配穴。",
    cautions: "小腿紅腫熱痛需排除血栓或感染；避免深刺血管區。",
    sources: standardPointSources("BL55"),
    x: 182,
    y: 496
  },
  {
    code: "BL56",
    nameZh: "承筋",
    nameEn: "Support the Sinews",
    pinyin: "Chengjin",
    meridian: "Bladder / 膀胱經",
    region: "小腿後側",
    location: "小腿後側，腓腸肌肌腹中央，委中與承山連線上。",
    locationEn: "On the posterior leg, in the center of the belly of gastrocnemius, on the line between BL40 and BL57.",
    cunMeasurement: "Center of the gastrocnemius muscle belly.",
    functions: "舒筋解痙，通絡止痛。",
    functionsEn: ["Relaxes sinews", "Relieves spasm", "Activates the channel", "Stops pain"],
    patterns: ["小腿痙攣", "腰腿痛", "痔疾", "膕窩痛", "足跟痛"],
    patternsEn: ["Calf cramp", "Low back and leg pain", "Hemorrhoids", "Popliteal pain", "Heel pain"],
    evidence: "小腿後側肌筋膜與痙攣疼痛常用穴。",
    cautions: "急性小腿腫痛、外傷或疑似血栓需先醫療評估。",
    sources: standardPointSources("BL56"),
    x: 184,
    y: 522
  },
  {
    code: "BL57",
    nameZh: "承山",
    nameEn: "Support the Mountain",
    pinyin: "Chengshan",
    meridian: "Bladder / 膀胱經",
    region: "小腿後側",
    location: "小腿後側，腓腸肌兩肌腹下方交角處，伸直小腿或足跟上提時呈凹陷。",
    locationEn: "On the posterior leg, below the gastrocnemius muscle bellies where they form an angle, in the depression that appears when the calf is stretched or the heel is lifted.",
    cunMeasurement: "Below the gastrocnemius bellies.",
    functions: "舒筋止痙，通便消痔，利腰腿。",
    functionsEn: ["Relaxes sinews", "Stops cramping", "Benefits defecation and hemorrhoid patterns", "Benefits the low back and leg"],
    patterns: ["小腿痙攣", "痔疾", "便秘", "腰腿痛", "足跟痛"],
    patternsEn: ["Calf cramp", "Hemorrhoids", "Constipation", "Low back and leg pain", "Heel pain"],
    evidence: "痔疾、小腿痙攣與腰腿痛常用高頻穴。",
    cautions: "小腿急性腫痛、紅熱或深壓痛需排除血栓；避免自行強刺激。",
    sources: standardPointSources("BL57"),
    x: 186,
    y: 544
  },
  {
    code: "BL58",
    nameZh: "飛揚",
    nameEn: "Taking Flight",
    pinyin: "Feiyang",
    meridian: "Bladder / 膀胱經",
    region: "小腿後外側",
    location: "小腿後外側，崑崙上 7 寸，腓腸肌外側下緣。",
    locationEn: "On the posterolateral leg, 7 cun superior to BL60, at the inferior border of the lateral head of gastrocnemius.",
    cunMeasurement: "7 cun above BL60.",
    functions: "舒筋活絡，清頭目，通鼻竅。",
    functionsEn: ["Activates the channel", "Benefits the head and eyes", "Opens the nose", "Stops pain"],
    patterns: ["頭痛", "鼻塞", "腰腿痛", "癲狂", "足踝痛"],
    patternsEn: ["Headache", "Nasal congestion", "Low back and leg pain", "Mania pattern", "Ankle pain"],
    evidence: "膀胱經絡穴，頭項鼻竅與下肢循經痛配穴。",
    cautions: "小腿外側疼痛伴麻木或腫脹需先評估。",
    sources: standardPointSources("BL58"),
    x: 196,
    y: 560
  },
  {
    code: "BL59",
    nameZh: "跗陽",
    nameEn: "Instep Yang",
    pinyin: "Fuyang",
    meridian: "Bladder / 膀胱經",
    region: "踝上",
    location: "小腿後外側，崑崙上 3 寸。",
    locationEn: "On the posterolateral leg, 3 cun superior to BL60.",
    cunMeasurement: "3 cun above BL60.",
    functions: "舒筋活絡，利腰腿，安神止痛。",
    functionsEn: ["Activates the channel", "Benefits the low back and leg", "Calms the spirit", "Stops pain"],
    patterns: ["腰腿痛", "踝痛", "頭痛", "癲癇類辨證", "下肢痿痹"],
    patternsEn: ["Low back and leg pain", "Ankle pain", "Headache", "Seizure pattern support", "Lower limb weakness or painful obstruction"],
    evidence: "陽蹻脈郄穴，踝腿疼痛、頭痛與痙攣類辨證配穴。",
    cautions: "踝上外傷、腫痛或神經症狀需先評估。",
    sources: standardPointSources("BL59"),
    x: 198,
    y: 580
  },
  {
    code: "BL61",
    nameZh: "僕參",
    nameEn: "Subservient Visitor",
    pinyin: "Pucan",
    meridian: "Bladder / 膀胱經",
    region: "足外側",
    location: "足外側，外踝後下方，崑崙 BL60 直下，跟骨外側赤白肉際處。",
    locationEn: "On the lateral aspect of the foot, posterior and inferior to the lateral malleolus, directly below BL60, lateral to the calcaneus at the junction of the red and white skin.",
    cunMeasurement: "Posterior-inferior to the lateral malleolus, directly below BL60.",
    functions: "舒筋活絡，利踝足，止痛。",
    functionsEn: ["Relaxes sinews", "Activates the channel", "Benefits the ankle and foot", "Alleviates pain"],
    patterns: ["足跟痛", "踝痛", "下肢麻木痿弱", "癲癇類辨證"],
    patternsEn: ["Heel pain", "Ankle pain", "Lower limb numbness or weakness", "Epilepsy pattern support"],
    evidence: "足外側膀胱經循行末段穴，常作足跟、踝部與下肢循經疼痛配穴。",
    cautions: "踝足外傷、急性腫痛或神經症狀需先評估；癲癇相關症狀需醫療照護。",
    sources: standardPointSources("BL61"),
    x: 202,
    y: 604
  },
  {
    code: "BL62",
    nameZh: "申脈",
    nameEn: "Extending Vessel",
    pinyin: "Shenmai",
    meridian: "Bladder / 膀胱經",
    region: "外踝下方",
    location: "足外側，外踝尖正下方凹陷處。",
    locationEn: "In the depression directly inferior to the lateral malleolus.",
    cunMeasurement: "Directly below the lateral malleolus.",
    functions: "祛風安神，利頭目，舒筋活絡。",
    functionsEn: ["Dispels internal wind", "Calms the spirit", "Benefits the head and eyes", "Relaxes sinews"],
    patterns: ["失眠", "癲癇類辨證", "頭痛項強", "腰腿痛", "足外翻"],
    patternsEn: ["Insomnia", "Epilepsy pattern support", "Headache and stiff neck", "Low back and leg pain", "Foot eversion"],
    evidence: "陽蹻脈八脈交會穴，常與後溪 SI3 配伍，用於項背、頭目與神志睡眠類辨證。",
    cautions: "神志、癲癇或睡眠嚴重症狀需結合醫療評估；踝部局部急性損傷應避開強刺激。",
    sources: standardPointSources("BL62"),
    x: 214,
    y: 610
  },
  {
    code: "BL63",
    nameZh: "金門",
    nameEn: "Golden Gate",
    pinyin: "Jinmen",
    meridian: "Bladder / 膀胱經",
    region: "足外側",
    location: "足外側，外踝前緣直下，骰骨下緣外側凹陷處。",
    locationEn: "On the lateral aspect of the foot, directly below the anterior border of the lateral malleolus, lateral to the lower border of the cuboid bone.",
    cunMeasurement: "Below the anterior border of the lateral malleolus, by the cuboid.",
    functions: "舒筋活絡，熄風安神，止痛。",
    functionsEn: ["Relaxes sinews", "Calms wind", "Activates the channel", "Alleviates pain"],
    patterns: ["癲癇類辨證", "小兒驚風類辨證", "頭痛", "腰痛", "踝痛"],
    patternsEn: ["Epilepsy pattern support", "Infantile convulsion pattern support", "Headache", "Low back pain", "Lateral ankle pain"],
    evidence: "膀胱經郄穴，常用於急性循經疼痛、踝足痛與風動神志類辨證。",
    cautions: "小兒驚風、癲癇或急性神經症狀不可只靠穴位處理；足踝外傷需先排除骨折或韌帶損傷。",
    sources: standardPointSources("BL63"),
    x: 226,
    y: 616
  },
  {
    code: "BL64",
    nameZh: "京骨",
    nameEn: "Metatarsal Tuberosity",
    pinyin: "Jinggu",
    meridian: "Bladder / 膀胱經",
    region: "足外側",
    location: "足外側，第五蹠骨粗隆下方，赤白肉際處。",
    locationEn: "On the lateral aspect of the foot, inferior to the tuberosity of the fifth metatarsal bone, at the junction of the red and white skin.",
    cunMeasurement: "Inferior to the tuberosity of the fifth metatarsal.",
    functions: "祛風清頭目，安神，舒筋活絡止痛。",
    functionsEn: ["Dispels wind", "Benefits the head and eyes", "Calms the spirit", "Activates the channel and alleviates pain"],
    patterns: ["頭痛", "項強", "目翳類辨證", "腰腿痛", "神志不寧"],
    patternsEn: ["Headache", "Stiff neck", "Eye opacity pattern support", "Low back and leg pain", "Restlessness pattern support"],
    evidence: "膀胱經原穴，兼顧頭項目系、神志與足外側循經疼痛。",
    cautions: "足外側局部腫痛、糖尿病足或感覺異常者需謹慎評估局部安全。",
    sources: standardPointSources("BL64"),
    x: 238,
    y: 622
  },
  {
    code: "BL65",
    nameZh: "束骨",
    nameEn: "Metatarsal Head",
    pinyin: "Shugu",
    meridian: "Bladder / 膀胱經",
    region: "足外側",
    location: "足外側，第五蹠趾關節後方，赤白肉際處。",
    locationEn: "On the lateral aspect of the foot, posterior to the fifth metatarsophalangeal joint, at the junction of the red and white skin.",
    cunMeasurement: "Posterior to the fifth metatarsophalangeal joint.",
    functions: "清熱祛風，舒筋活絡，止痛。",
    functionsEn: ["Clears heat", "Dispels wind", "Relaxes sinews", "Activates the channel and alleviates pain"],
    patterns: ["頭痛項強", "腰腿痛", "足外側痛", "癲狂類辨證", "肛門痛"],
    patternsEn: ["Headache and stiff neck", "Low back and leg pain", "Lateral foot pain", "Mania pattern support", "Anal pain"],
    evidence: "膀胱經輸穴，常用於頭項、腰腿及足外側循經疼痛。",
    cautions: "足部感染、傷口或循環不良者避免局部刺激；精神急症需先醫療處置。",
    sources: standardPointSources("BL65"),
    x: 248,
    y: 628
  },
  {
    code: "BL66",
    nameZh: "足通谷",
    nameEn: "Foot Valley Passage",
    pinyin: "Zutonggu",
    meridian: "Bladder / 膀胱經",
    region: "足外側",
    location: "足外側，第五蹠趾關節前方，赤白肉際處。",
    locationEn: "On the lateral aspect of the foot, anterior to the fifth metatarsophalangeal joint, at the junction of the red and white skin.",
    cunMeasurement: "Anterior to the fifth metatarsophalangeal joint.",
    functions: "清熱熄風，通絡止痛，利頭目。",
    functionsEn: ["Clears heat", "Eliminates wind", "Activates the channel", "Benefits the head and sense organs"],
    patterns: ["頭痛", "項強", "眩暈", "鼻衄", "癲狂類辨證"],
    patternsEn: ["Headache", "Stiff neck", "Dizziness", "Epistaxis", "Mania pattern support"],
    evidence: "膀胱經滎穴，偏向清熱、頭目與風熱上擾類辨證。",
    cautions: "鼻衄量多、反覆出血或神志異常需醫療評估；足趾局部傷口應避開。",
    sources: standardPointSources("BL66"),
    x: 258,
    y: 634
  },
  {
    code: "BL67",
    nameZh: "至陰",
    nameEn: "Reaching Yin",
    pinyin: "Zhiyin",
    meridian: "Bladder / 膀胱經",
    region: "小趾",
    location: "足小趾外側，趾甲角旁約 0.1 寸處。",
    locationEn: "On the lateral side of the little toe, approximately 0.1 cun from the corner of the nail.",
    cunMeasurement: "0.1 cun from the lateral corner of the little toenail.",
    functions: "清頭目，祛風，轉胎催產類辨證。",
    functionsEn: ["Eliminates wind", "Clears the head and eyes", "Supports fetal malposition treatment protocols", "Assists labor-related pattern work"],
    patterns: ["胎位不正", "難產類辨證", "頭痛", "目痛", "鼻塞鼻衄"],
    patternsEn: ["Malposition of fetus", "Difficult labor pattern support", "Headache", "Eye pain", "Nasal congestion or epistaxis"],
    evidence: "膀胱經井穴；臨床常見於胎位不正之艾灸方案與頭面五官風熱類辨證。",
    cautions: "孕期、胎位不正或分娩相關用途必須由合格醫療/中醫專業人員評估；高危妊娠、出血、腹痛或胎動異常需立即就醫。",
    sources: standardPointSources("BL67"),
    x: 268,
    y: 640
  }
];

function kidneyPoint({ code, nameZh, nameEn, pinyin, region, location, locationEn, cunMeasurement, functions, functionsEn, patterns, patternsEn, cautions, x, y }) {
  return {
    code,
    nameZh,
    nameEn,
    pinyin,
    meridian: "Kidney / 腎經",
    region,
    location,
    locationEn,
    cunMeasurement,
    functions,
    functionsEn,
    patterns,
    patternsEn,
    evidence: "Kidney channel draft record for AcuTing OS. Location and clinical notes should be cross-checked against WHO Standard Acupuncture Point Locations and professional textbooks before source_checked or public_ready status.",
    cautions: cautions || "Draft educational record. Avoid needling over local infection, wounds, severe vascular disease, or unclear anatomy; pregnancy, fertility treatment, anticoagulant use, and serious symptoms require qualified clinical supervision.",
    sources: standardPointSources(code),
    x,
    y
  };
}

const kidneyMeridianExpansion = [
  kidneyPoint({
    code: "KI1",
    nameZh: "湧泉",
    nameEn: "Gushing Spring",
    pinyin: "Yongquan",
    region: "足底",
    location: "足底，屈趾時足心前部凹陷處，約在足底前 1/3 與後 2/3 交界附近。",
    locationEn: "On the sole of the foot, in the depression formed when the toes are flexed, near the junction of the anterior one-third and posterior two-thirds of the sole.",
    cunMeasurement: "Sole depression with toes flexed.",
    functions: "滋陰降火，開竅安神，蘇厥醒神。",
    functionsEn: ["Nourishes yin", "Descends excess from the head", "Calms the spirit", "Revives consciousness in traditional emergency use"],
    patterns: ["頭頂痛", "眩暈", "失眠", "咽喉腫痛", "昏厥類辨證"],
    patternsEn: ["Vertex headache", "Dizziness", "Insomnia", "Sore throat", "Collapse or loss-of-consciousness pattern support"],
    cautions: "足底疼痛敏感；糖尿病足、周邊循環不良、傷口或感染者避免局部刺激。急性昏厥或神志異常須先急救處置。",
    x: 138,
    y: 610
  }),
  kidneyPoint({
    code: "KI2",
    nameZh: "然谷",
    nameEn: "Blazing Valley",
    pinyin: "Rangu",
    region: "足內側",
    location: "足內側，舟骨粗隆下方，赤白肉際處。",
    locationEn: "On the medial aspect of the foot, inferior to the tuberosity of the navicular bone, at the junction of the red and white skin.",
    cunMeasurement: "Inferior to the navicular tuberosity.",
    functions: "清虛熱，滋腎陰，調下焦。",
    functionsEn: ["Clears deficiency heat", "Nourishes Kidney yin", "Regulates the lower jiao"],
    patterns: ["腎陰虛熱", "咽喉腫痛", "月經不調", "小便不利", "足內側痛"],
    patternsEn: ["Kidney yin deficiency heat", "Sore throat", "Menstrual irregularity", "Urinary difficulty", "Medial foot pain"],
    x: 132,
    y: 588
  }),
  kidneyPoint({
    code: "KI3",
    nameZh: "太谿",
    nameEn: "Great Ravine",
    pinyin: "Taixi",
    region: "踝部",
    location: "內踝尖與跟腱之間凹陷處。",
    locationEn: "In the depression between the prominence of the medial malleolus and the Achilles tendon.",
    cunMeasurement: "Between medial malleolus and Achilles tendon.",
    functions: "滋腎陰，補腎氣，強腰膝，利咽喉。",
    functionsEn: ["Tonifies Kidney qi", "Nourishes Kidney yin", "Strengthens the low back and knees", "Benefits the throat"],
    patterns: ["腎陰虛", "腎氣不足", "腰膝痠軟", "耳鳴", "咽喉乾痛"],
    patternsEn: ["Kidney yin deficiency", "Kidney qi deficiency", "Sore and weak low back and knees", "Tinnitus", "Dry sore throat"],
    cautions: "局部靜脈曲張、踝部腫脹、感染或傷口時避開；深刺需注意局部血管神經。",
    x: 132,
    y: 568
  }),
  kidneyPoint({
    code: "KI4",
    nameZh: "大鐘",
    nameEn: "Great Bell",
    pinyin: "Dazhong",
    region: "踝後",
    location: "內踝後下方，跟腱附著部前方凹陷處。",
    locationEn: "Posterior and inferior to the medial malleolus, in the depression anterior to the attachment of the Achilles tendon.",
    cunMeasurement: "Posteroinferior to medial malleolus.",
    functions: "補腎固本，安神定志，利小便。",
    functionsEn: ["Tonifies the Kidney", "Stabilizes the root", "Calms the spirit", "Regulates urination"],
    patterns: ["腰脊痛", "足跟痛", "小便不利", "癡呆類辨證", "心神不寧"],
    patternsEn: ["Lumbar spine pain", "Heel pain", "Urinary difficulty", "Cognitive decline pattern support", "Restless spirit"],
    x: 124,
    y: 572
  }),
  kidneyPoint({
    code: "KI5",
    nameZh: "水泉",
    nameEn: "Water Spring",
    pinyin: "Shuiquan",
    region: "踝後",
    location: "太谿下 1 寸，跟骨結節內側凹陷處。",
    locationEn: "1 cun inferior to KI3, in a depression on the medial side of the calcaneal tuberosity.",
    cunMeasurement: "1 cun inferior to KI3.",
    functions: "調經止痛，利水通淋，調下焦。",
    functionsEn: ["Regulates menstruation", "Alleviates pain", "Promotes urination", "Regulates the lower jiao"],
    patterns: ["月經不調", "痛經", "閉經", "小便不利", "足跟痛"],
    patternsEn: ["Menstrual irregularity", "Dysmenorrhea", "Amenorrhea pattern support", "Urinary difficulty", "Heel pain"],
    x: 124,
    y: 586
  }),
  kidneyPoint({
    code: "KI6",
    nameZh: "照海",
    nameEn: "Shining Sea",
    pinyin: "Zhaohai",
    region: "踝部",
    location: "內踝尖下方凹陷處。",
    locationEn: "In the depression inferior to the prominence of the medial malleolus.",
    cunMeasurement: "Inferior to medial malleolus.",
    functions: "滋陰清熱，利咽喉，調任脈，安神。",
    functionsEn: ["Nourishes yin", "Clears heat", "Benefits the throat", "Regulates the Yin Qiao and Conception Vessel", "Calms the spirit"],
    patterns: ["失眠", "咽喉乾痛", "月經不調", "陰虛內熱", "小便不利"],
    patternsEn: ["Insomnia", "Dry sore throat", "Menstrual irregularity", "Yin deficiency heat", "Urinary difficulty"],
    cautions: "孕期、下腹/婦科相關治療與不孕療程中需由合格臨床人員辨證使用；踝部傷口或感染避開。",
    x: 136,
    y: 578
  }),
  kidneyPoint({
    code: "KI7",
    nameZh: "復溜",
    nameEn: "Returning Current",
    pinyin: "Fuliu",
    region: "小腿內側",
    location: "太谿上 2 寸，跟腱前緣。",
    locationEn: "2 cun superior to KI3, on the anterior border of the Achilles tendon.",
    cunMeasurement: "2 cun superior to KI3.",
    functions: "補腎益陰，調水道，固表止汗。",
    functionsEn: ["Tonifies the Kidney", "Regulates water passages", "Stabilizes the exterior", "Regulates sweating"],
    patterns: ["水腫", "盜汗", "自汗", "腹瀉", "腰脊痛"],
    patternsEn: ["Edema", "Night sweating", "Spontaneous sweating", "Diarrhea", "Lumbar pain"],
    x: 132,
    y: 536
  }),
  kidneyPoint({
    code: "KI8",
    nameZh: "交信",
    nameEn: "Exchange Belief",
    pinyin: "Jiaoxin",
    region: "小腿內側",
    location: "太谿上 2 寸，復溜前方，脛骨內側緣後方。",
    locationEn: "2 cun superior to KI3, anterior to KI7, posterior to the medial border of the tibia.",
    cunMeasurement: "2 cun superior to KI3, anterior to KI7.",
    functions: "調經止血，利下焦，清濕熱。",
    functionsEn: ["Regulates menstruation", "Stops bleeding in pattern use", "Benefits the lower jiao", "Clears damp-heat"],
    patterns: ["月經不調", "崩漏", "陰癢", "小便不利", "腹痛"],
    patternsEn: ["Menstrual irregularity", "Uterine bleeding pattern support", "Genital itching pattern", "Urinary difficulty", "Abdominal pain"],
    x: 144,
    y: 536
  }),
  kidneyPoint({
    code: "KI9",
    nameZh: "築賓",
    nameEn: "Guest House",
    pinyin: "Zhubin",
    region: "小腿內側",
    location: "太谿上 5 寸，腓腸肌內側肌腹下方。",
    locationEn: "5 cun superior to KI3, inferior to the medial belly of gastrocnemius.",
    cunMeasurement: "5 cun superior to KI3.",
    functions: "清心安神，理下焦，解毒類辨證。",
    functionsEn: ["Clears the Heart in traditional pattern use", "Calms the spirit", "Regulates the lower jiao", "Supports toxin-type pattern differentiation"],
    patterns: ["癲狂類辨證", "嘔吐", "疝氣", "小腿內側痛", "孕期情緒不安類辨證"],
    patternsEn: ["Mania or agitation pattern support", "Vomiting", "Hernia pattern", "Medial leg pain", "Pregnancy-related emotional restlessness pattern support"],
    cautions: "孕期相關用途須由合格臨床人員監督；精神急症、嚴重嘔吐或劇烈腹痛須先醫療評估。",
    x: 142,
    y: 498
  }),
  kidneyPoint({
    code: "KI10",
    nameZh: "陰谷",
    nameEn: "Yin Valley",
    pinyin: "Yingu",
    region: "膝內側",
    location: "膝後內側，半腱肌腱與半膜肌腱之間，膕橫紋內側端。",
    locationEn: "On the medial aspect of the popliteal fossa, between the tendons of semitendinosus and semimembranosus, at the medial end of the popliteal crease.",
    cunMeasurement: "Medial end of popliteal crease.",
    functions: "滋腎清熱，利膀胱，調下焦。",
    functionsEn: ["Nourishes the Kidney", "Clears deficiency heat", "Benefits the bladder", "Regulates the lower jiao"],
    patterns: ["小便不利", "陰部痛癢", "膝內側痛", "腎陰虛熱", "腹痛"],
    patternsEn: ["Urinary difficulty", "Genital pain or itching pattern", "Medial knee pain", "Kidney yin deficiency heat", "Abdominal pain"],
    cautions: "膕窩附近血管神經密集，需避免深刺或粗暴操作；膝部腫脹、血栓疑慮或感染須先醫療評估。",
    x: 142,
    y: 446
  }),
  kidneyPoint({
    code: "KI11",
    nameZh: "橫骨",
    nameEn: "Pubic Bone",
    pinyin: "Henggu",
    region: "下腹部",
    location: "下腹部，臍下 5 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the lower abdomen, 5 cun inferior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "5 cun below umbilicus, 0.5 cun lateral.",
    functions: "調下焦，利小便，調經種子類辨證。",
    functionsEn: ["Regulates the lower jiao", "Promotes urination", "Regulates menstruation and fertility pattern work"],
    patterns: ["小便不利", "遺精", "陽痿類辨證", "月經不調", "不孕類辨證"],
    patternsEn: ["Urinary difficulty", "Spermatorrhea pattern", "Impotence pattern support", "Menstrual irregularity", "Infertility pattern support"],
    cautions: "下腹部、孕期、術後、腫塊、急腹症或不明原因疼痛需專業評估；避免深刺傷及膀胱或腹腔結構。",
    x: 174,
    y: 392
  }),
  kidneyPoint({
    code: "KI12",
    nameZh: "大赫",
    nameEn: "Great Manifestation",
    pinyin: "Dahe",
    region: "下腹部",
    location: "下腹部，臍下 4 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the lower abdomen, 4 cun inferior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "4 cun below umbilicus, 0.5 cun lateral.",
    functions: "補腎調衝任，調經助孕類辨證。",
    functionsEn: ["Tonifies the Kidney", "Regulates the Chong and Ren vessels", "Supports menstrual and fertility pattern work"],
    patterns: ["不孕", "月經不調", "帶下", "遺精", "下腹痛"],
    patternsEn: ["Infertility pattern support", "Menstrual irregularity", "Vaginal discharge pattern", "Spermatorrhea pattern", "Lower abdominal pain"],
    cautions: "孕期、IUI/IVF 週期、下腹痛、出血或術後狀態需主管臨床人員評估；避免深刺。",
    x: 174,
    y: 372
  }),
  kidneyPoint({
    code: "KI13",
    nameZh: "氣穴",
    nameEn: "Qi Hole",
    pinyin: "Qixue",
    region: "下腹部",
    location: "下腹部，臍下 3 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the lower abdomen, 3 cun inferior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "3 cun below umbilicus, 0.5 cun lateral.",
    functions: "調衝任，理下焦，調經止帶。",
    functionsEn: ["Regulates the Chong and Ren vessels", "Regulates the lower jiao", "Regulates menstruation", "Addresses discharge patterns"],
    patterns: ["月經不調", "不孕類辨證", "帶下", "小便不利", "下腹痛"],
    patternsEn: ["Menstrual irregularity", "Infertility pattern support", "Vaginal discharge pattern", "Urinary difficulty", "Lower abdominal pain"],
    cautions: "下腹部高安全需求；孕期、可能懷孕、婦科急症、急腹症或不明出血須先醫療評估。",
    x: 174,
    y: 352
  }),
  kidneyPoint({
    code: "KI14",
    nameZh: "四滿",
    nameEn: "Four Fullness",
    pinyin: "Siman",
    region: "下腹部",
    location: "下腹部，臍下 2 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the lower abdomen, 2 cun inferior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "2 cun below umbilicus, 0.5 cun lateral.",
    functions: "理氣活血，調經止痛，調下焦。",
    functionsEn: ["Moves qi", "Activates blood in pattern use", "Regulates menstruation", "Alleviates lower abdominal pain"],
    patterns: ["腹痛", "月經不調", "痛經", "產後腹痛類辨證", "便秘"],
    patternsEn: ["Abdominal pain", "Menstrual irregularity", "Dysmenorrhea", "Postpartum abdominal pain pattern support", "Constipation"],
    cautions: "孕期、產後出血、急腹症、嚴重腹痛或不明原因腹部腫塊須醫療評估；避免深刺。",
    x: 174,
    y: 332
  }),
  kidneyPoint({
    code: "KI15",
    nameZh: "中注",
    nameEn: "Central Flow",
    pinyin: "Zhongzhu",
    region: "下腹部",
    location: "下腹部，臍下 1 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the lower abdomen, 1 cun inferior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "1 cun below umbilicus, 0.5 cun lateral.",
    functions: "調腸腑，理氣止痛，調下焦。",
    functionsEn: ["Regulates the intestines", "Moves qi", "Alleviates abdominal pain", "Regulates the lower jiao"],
    patterns: ["腹痛", "便秘", "泄瀉", "月經不調", "腰腹牽痛"],
    patternsEn: ["Abdominal pain", "Constipation", "Diarrhea", "Menstrual irregularity", "Low back and abdominal pulling pain"],
    x: 174,
    y: 312
  }),
  kidneyPoint({
    code: "KI16",
    nameZh: "肓俞",
    nameEn: "Huang Shu",
    pinyin: "Huangshu",
    region: "腹部",
    location: "腹部，臍中旁開 0.5 寸。",
    locationEn: "On the abdomen, 0.5 cun lateral to the center of the umbilicus.",
    cunMeasurement: "Level with umbilicus, 0.5 cun lateral.",
    functions: "理氣止痛，和腸胃，調衝任。",
    functionsEn: ["Moves qi", "Alleviates pain", "Harmonizes the intestines and stomach", "Regulates the Chong and Ren vessels"],
    patterns: ["腹痛", "便秘", "腹脹", "嘔吐", "月經不調"],
    patternsEn: ["Abdominal pain", "Constipation", "Abdominal distension", "Vomiting", "Menstrual irregularity"],
    cautions: "臍周感染、腹部急症、術後或不明腹痛避免自行刺激；深刺需謹慎。",
    x: 174,
    y: 292
  }),
  kidneyPoint({
    code: "KI17",
    nameZh: "商曲",
    nameEn: "Shang Bend",
    pinyin: "Shangqu",
    region: "上腹部",
    location: "上腹部，臍上 2 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the upper abdomen, 2 cun superior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "2 cun above umbilicus, 0.5 cun lateral.",
    functions: "和胃降逆，理氣止痛，調腸腑。",
    functionsEn: ["Harmonizes the stomach", "Descends rebellion", "Moves qi", "Regulates the intestines"],
    patterns: ["胃痛", "嘔吐", "腹痛", "腹脹", "便秘"],
    patternsEn: ["Epigastric pain", "Vomiting", "Abdominal pain", "Abdominal distension", "Constipation"],
    x: 174,
    y: 252
  }),
  kidneyPoint({
    code: "KI18",
    nameZh: "石關",
    nameEn: "Stone Pass",
    pinyin: "Shiguan",
    region: "上腹部",
    location: "上腹部，臍上 3 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the upper abdomen, 3 cun superior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "3 cun above umbilicus, 0.5 cun lateral.",
    functions: "和胃降逆，寬中止痛，調衝任。",
    functionsEn: ["Harmonizes the stomach", "Descends rebellion", "Regulates the middle", "Regulates the Chong and Ren vessels"],
    patterns: ["胃痛", "嘔吐", "腹痛", "不孕類辨證", "產後腹痛類辨證"],
    patternsEn: ["Epigastric pain", "Vomiting", "Abdominal pain", "Infertility pattern support", "Postpartum abdominal pain pattern support"],
    x: 174,
    y: 232
  }),
  kidneyPoint({
    code: "KI19",
    nameZh: "陰都",
    nameEn: "Yin Metropolis",
    pinyin: "Yindu",
    region: "上腹部",
    location: "上腹部，臍上 4 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the upper abdomen, 4 cun superior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "4 cun above umbilicus, 0.5 cun lateral.",
    functions: "和胃理氣，降逆止嘔，清心安神類辨證。",
    functionsEn: ["Harmonizes the stomach", "Moves qi", "Descends rebellion", "Calms the spirit in pattern use"],
    patterns: ["胃痛", "嘔吐", "腹脹", "心煩", "胸腹滿悶"],
    patternsEn: ["Epigastric pain", "Vomiting", "Abdominal distension", "Irritability", "Fullness in chest and abdomen"],
    x: 174,
    y: 212
  }),
  kidneyPoint({
    code: "KI20",
    nameZh: "腹通谷",
    nameEn: "Abdominal Valley Passage",
    pinyin: "Futonggu",
    region: "上腹部",
    location: "上腹部，臍上 5 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the upper abdomen, 5 cun superior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "5 cun above umbilicus, 0.5 cun lateral.",
    functions: "和胃降逆，寬胸理氣，安神類辨證。",
    functionsEn: ["Harmonizes the stomach", "Descends rebellion", "Opens the chest", "Regulates qi"],
    patterns: ["嘔吐", "胃痛", "胸滿", "心悸", "癲狂類辨證"],
    patternsEn: ["Vomiting", "Epigastric pain", "Chest fullness", "Palpitations", "Mania pattern support"],
    x: 174,
    y: 192
  }),
  kidneyPoint({
    code: "KI21",
    nameZh: "幽門",
    nameEn: "Dark Gate",
    pinyin: "Youmen",
    region: "上腹部",
    location: "上腹部，臍上 6 寸，前正中線旁開 0.5 寸。",
    locationEn: "On the upper abdomen, 6 cun superior to the umbilicus and 0.5 cun lateral to the anterior midline.",
    cunMeasurement: "6 cun above umbilicus, 0.5 cun lateral.",
    functions: "和胃降逆，寬胸止痛，理氣。",
    functionsEn: ["Harmonizes the stomach", "Descends rebellious qi", "Opens the chest", "Alleviates pain"],
    patterns: ["嘔吐", "胃痛", "胸脅滿悶", "食少", "腹脹"],
    patternsEn: ["Vomiting", "Epigastric pain", "Chest and rib-side fullness", "Poor appetite", "Abdominal distension"],
    x: 174,
    y: 172
  }),
  kidneyPoint({
    code: "KI22",
    nameZh: "步廊",
    nameEn: "Walking Corridor",
    pinyin: "Bulang",
    region: "胸部",
    location: "胸部，第 5 肋間隙，前正中線旁開 2 寸。",
    locationEn: "On the chest, in the fifth intercostal space, 2 cun lateral to the anterior midline.",
    cunMeasurement: "5th intercostal space, 2 cun lateral.",
    functions: "寬胸理氣，降逆平喘，和胃。",
    functionsEn: ["Opens the chest", "Moves qi", "Descends rebellion", "Calms wheezing", "Harmonizes the stomach"],
    patterns: ["胸痛", "咳喘", "嘔吐", "乳少類辨證", "胸悶"],
    patternsEn: ["Chest pain", "Cough and wheezing", "Vomiting", "Insufficient lactation pattern support", "Chest oppression"],
    cautions: "胸部穴位有氣胸風險；嚴禁深刺或自行針刺。胸痛、呼吸困難或心肺症狀須先醫療評估。",
    x: 152,
    y: 166
  }),
  kidneyPoint({
    code: "KI23",
    nameZh: "神封",
    nameEn: "Spirit Seal",
    pinyin: "Shenfeng",
    region: "胸部",
    location: "胸部，第 4 肋間隙，前正中線旁開 2 寸。",
    locationEn: "On the chest, in the fourth intercostal space, 2 cun lateral to the anterior midline.",
    cunMeasurement: "4th intercostal space, 2 cun lateral.",
    functions: "寬胸理氣，降逆平喘，安神。",
    functionsEn: ["Opens the chest", "Moves qi", "Descends rebellion", "Calms wheezing", "Calms the spirit"],
    patterns: ["胸痛", "咳喘", "胸悶", "乳癰類辨證", "心悸"],
    patternsEn: ["Chest pain", "Cough and wheezing", "Chest oppression", "Breast abscess pattern support", "Palpitations"],
    cautions: "胸部穴位有氣胸與心肺風險；只可由受訓臨床人員操作，避免深刺。",
    x: 152,
    y: 146
  }),
  kidneyPoint({
    code: "KI24",
    nameZh: "靈墟",
    nameEn: "Spirit Ruins",
    pinyin: "Lingxu",
    region: "胸部",
    location: "胸部，第 3 肋間隙，前正中線旁開 2 寸。",
    locationEn: "On the chest, in the third intercostal space, 2 cun lateral to the anterior midline.",
    cunMeasurement: "3rd intercostal space, 2 cun lateral.",
    functions: "寬胸止咳，理氣安神。",
    functionsEn: ["Opens the chest", "Stops cough in pattern use", "Moves qi", "Calms the spirit"],
    patterns: ["咳嗽", "胸痛", "胸悶", "乳癰類辨證", "心悸"],
    patternsEn: ["Cough", "Chest pain", "Chest oppression", "Breast abscess pattern support", "Palpitations"],
    cautions: "胸部穴位需嚴格安全審核；避免深刺，心肺症狀先轉醫療評估。",
    x: 152,
    y: 126
  }),
  kidneyPoint({
    code: "KI25",
    nameZh: "神藏",
    nameEn: "Spirit Storehouse",
    pinyin: "Shencang",
    region: "胸部",
    location: "胸部，第 2 肋間隙，前正中線旁開 2 寸。",
    locationEn: "On the chest, in the second intercostal space, 2 cun lateral to the anterior midline.",
    cunMeasurement: "2nd intercostal space, 2 cun lateral.",
    functions: "寬胸宣肺，止咳平喘，安神。",
    functionsEn: ["Opens the chest", "Regulates Lung qi", "Calms cough and wheezing", "Calms the spirit"],
    patterns: ["咳嗽", "氣喘", "胸痛", "心悸", "胸悶"],
    patternsEn: ["Cough", "Wheezing", "Chest pain", "Palpitations", "Chest oppression"],
    cautions: "胸部穴位有氣胸風險；哮喘急性發作、胸痛、呼吸困難須先醫療處置。",
    x: 152,
    y: 106
  }),
  kidneyPoint({
    code: "KI26",
    nameZh: "彧中",
    nameEn: "Amidst Elegance",
    pinyin: "Yuzhong",
    region: "胸部",
    location: "胸部，第 1 肋間隙，前正中線旁開 2 寸。",
    locationEn: "On the chest, in the first intercostal space, 2 cun lateral to the anterior midline.",
    cunMeasurement: "1st intercostal space, 2 cun lateral.",
    functions: "寬胸理氣，宣肺止咳，降逆。",
    functionsEn: ["Opens the chest", "Moves qi", "Regulates Lung qi", "Descends rebellion"],
    patterns: ["咳嗽", "氣喘", "胸痛", "咽喉不利", "胸悶"],
    patternsEn: ["Cough", "Wheezing", "Chest pain", "Throat discomfort", "Chest oppression"],
    cautions: "胸上部穴位鄰近肺尖及大血管區域；避免深刺，自覺胸痛或呼吸困難需急診/醫療評估。",
    x: 152,
    y: 86
  }),
  kidneyPoint({
    code: "KI27",
    nameZh: "俞府",
    nameEn: "Shu Mansion",
    pinyin: "Shufu",
    region: "胸部",
    location: "胸部，鎖骨下緣，前正中線旁開 2 寸。",
    locationEn: "On the chest, inferior to the clavicle, 2 cun lateral to the anterior midline.",
    cunMeasurement: "Inferior border of clavicle, 2 cun lateral.",
    functions: "宣肺降逆，寬胸止咳，和胃。",
    functionsEn: ["Regulates Lung qi", "Descends rebellion", "Opens the chest", "Calms cough", "Harmonizes the stomach"],
    patterns: ["咳嗽", "氣喘", "胸痛", "嘔吐", "咽喉不利"],
    patternsEn: ["Cough", "Wheezing", "Chest pain", "Vomiting", "Throat discomfort"],
    cautions: "鎖骨下胸部高風險區，嚴禁深刺；需注意氣胸、血管與肺尖風險。胸痛、喘、呼吸困難須先醫療評估。",
    x: 152,
    y: 70
  })
];

const locationEnglishByCode = {
  LI4: "On the dorsum of the hand, near the midpoint of the radial side of the second metacarpal bone; commonly found at the highest point of the muscle mound when the thumb and index finger are adducted.",
  PC6: "On the anterior forearm, 2 cun proximal to the wrist crease, between the tendons of palmaris longus and flexor carpi radialis.",
  LU7: "On the radial aspect of the forearm, about 1.5 cun proximal to the wrist crease, superior to the styloid process of the radius.",
  ST36: "On the anterior leg, 3 cun inferior to ST35/Dubi, one finger-breadth lateral to the anterior crest of the tibia.",
  SP6: "On the medial leg, 3 cun superior to the prominence of the medial malleolus, posterior to the medial border of the tibia.",
  LR3: "On the dorsum of the foot, in the depression distal to the junction of the first and second metatarsal bones.",
  KI3: "In the depression between the prominence of the medial malleolus and the Achilles tendon.",
  GB20: "Below the occipital bone, in the depression between the upper portion of sternocleidomastoid and trapezius.",
  GV20: "On the vertex of the head, on the midline, at the intersection of the midline and the line connecting the apexes of both ears.",
  CV12: "On the anterior midline of the upper abdomen, 4 cun superior to the umbilicus.",
  CV6: "On the anterior midline of the lower abdomen, 1.5 cun inferior to the umbilicus.",
  BL23: "On the lower back, 1.5 cun lateral to the lower border of the spinous process of the second lumbar vertebra.",
  HT7: "At the ulnar end of the wrist crease, in the depression on the radial side of the tendon of flexor carpi ulnaris.",
  LI11: "With the elbow flexed, at the lateral end of the cubital crease, midway between the crease and the lateral epicondyle of the humerus.",
  GB34: "On the lateral leg, in the depression anterior and inferior to the head of the fibula.",
  BL40: "At the midpoint of the transverse popliteal crease.",
  LU1: "On the upper lateral chest, in the first intercostal space, about 6 cun lateral to the anterior midline.",
  LU5: "On the cubital crease, in the depression on the radial side of the biceps brachii tendon.",
  LU9: "At the radial end of the palmar wrist crease, near the radial artery.",
  LI20: "On the face, in the nasolabial groove, level with the midpoint of the lateral border of the ala nasi.",
  ST25: "On the abdomen, 2 cun lateral to the center of the umbilicus.",
  ST40: "On the lateral lower leg, 8 cun superior to the lateral malleolus, about two finger-breadths lateral to the anterior crest of the tibia.",
  ST44: "On the dorsum of the foot, between the second and third toes, proximal to the web margin.",
  SP9: "On the medial lower leg, in the depression inferior to the medial condyle of the tibia.",
  SP10: "On the medial thigh, about 2 cun superior to the superior medial border of the patella, on the bulge of vastus medialis.",
  SI3: "With the hand in a loose fist, on the ulnar side of the fifth metacarpophalangeal joint, at the junction of the red and white skin.",
  BL10: "On the posterior neck, about 0.5 cun superior to the posterior hairline, in the depression lateral to trapezius.",
  BL13: "On the upper back, 1.5 cun lateral to the lower border of the spinous process of the third thoracic vertebra.",
  BL17: "On the back, 1.5 cun lateral to the lower border of the spinous process of the seventh thoracic vertebra.",
  BL20: "On the back, 1.5 cun lateral to the lower border of the spinous process of the eleventh thoracic vertebra.",
  BL25: "On the lower back, 1.5 cun lateral to the lower border of the spinous process of the fourth lumbar vertebra.",
  BL32: "On the sacrum, at the second posterior sacral foramen.",
  BL60: "In the depression between the prominence of the lateral malleolus and the Achilles tendon.",
  KI6: "In the depression inferior to the prominence of the medial malleolus.",
  TE5: "On the dorsal forearm, 2 cun proximal to the dorsal wrist crease, between the radius and ulna.",
  GB21: "On the shoulder, midway between GV14 and the acromion, on the highest region of the shoulder.",
  GB30: "On the buttock, near the junction of the lateral one-third and medial two-thirds of the line between the greater trochanter and the sacral hiatus.",
  GB39: "On the lateral lower leg, 3 cun superior to the prominence of the lateral malleolus, anterior to the fibula.",
  LR14: "On the chest, directly below the nipple, in the sixth intercostal space, about 4 cun lateral to the anterior midline.",
  CV4: "On the anterior midline of the lower abdomen, 3 cun inferior to the umbilicus.",
  CV17: "On the anterior midline of the chest, at the level of the fourth intercostal space, midway between the nipples.",
  GV14: "Below the spinous process of the seventh cervical vertebra.",
  GV26: "On the philtrum, at the junction of the upper one-third and middle one-third of the philtrum groove.",
  "EX-HN3": "At the midpoint between the medial ends of the eyebrows.",
  "EX-HN5": "In the depression about 1 cun posterior to the midpoint between the lateral end of the eyebrow and the outer canthus."
};

const anatomyGlossary = {
  "手背": "dorsum of the hand",
  "足背": "dorsum of the foot",
  "掌骨": "metacarpal bone",
  "跖骨": "metatarsal bone",
  "腕橫紋": "wrist crease",
  "掌長肌腱": "palmaris longus tendon",
  "橈側腕屈肌腱": "flexor carpi radialis tendon",
  "尺側腕屈肌腱": "flexor carpi ulnaris tendon",
  "橈骨": "radius",
  "尺骨": "ulna",
  "橈骨莖突": "styloid process of the radius",
  "橈動脈": "radial artery",
  "肱二頭肌腱": "biceps brachii tendon",
  "肱骨外上髁": "lateral epicondyle of the humerus",
  "肘橫紋": "cubital crease",
  "膕橫紋": "popliteal crease",
  "腓骨": "fibula",
  "腓骨頭": "head of the fibula",
  "脛骨": "tibia",
  "脛骨前嵴": "anterior crest of the tibia",
  "脛骨內側髁": "medial condyle of the tibia",
  "內踝": "medial malleolus",
  "外踝": "lateral malleolus",
  "跟腱": "Achilles tendon",
  "髕骨": "patella",
  "股內側肌": "vastus medialis",
  "股骨大轉子": "greater trochanter of the femur",
  "骶管裂孔": "sacral hiatus",
  "骶後孔": "posterior sacral foramen",
  "胸鎖乳突肌": "sternocleidomastoid muscle",
  "斜方肌": "trapezius muscle",
  "枕骨": "occipital bone",
  "乳頭": "nipple",
  "肋間隙": "intercostal space",
  "前正中線": "anterior midline",
  "臍": "umbilicus",
  "腰椎": "lumbar vertebra",
  "胸椎": "thoracic vertebra",
  "頸椎": "cervical vertebra",
  "棘突": "spinous process",
  "鼻翼": "ala nasi",
  "鼻唇溝": "nasolabial groove",
  "眉": "eyebrow",
  "外眼角": "outer canthus",
  "人中溝": "philtrum groove",
  "耳廓": "Auricle",
  "耳輪": "Helix",
  "耳舟": "Scaphoid Fossa",
  "對耳輪": "AntiHelix",
  "三角窩": "Triangle Fossa",
  "耳屏": "Tragus",
  "對耳屏": "Antitragus",
  "耳甲腔": "Inferior Concha",
  "耳甲艇": "Superior Concha",
  "耳垂": "Lobe",
  "屏間切跡": "Intertragal Notch",
  "屏上切跡": "Supratragal Notch",
  "耳廓背面": "Posterior Surface",
  "外耳道": "external acoustic meatus",
  "耳輪腳": "Crus of Helix",
  "對耳輪腳": "AntiHelix Crus",
  "下對耳輪腳": "Inferior AntiHelix Crus",
  "對耳輪上腳": "Superior AntiHelix Crus",
  "皮膚": "skin",
  "皮下組織": "subcutaneous tissue",
  "胸肌筋膜": "pectoral fascia",
  "胸大肌": "pectoralis major",
  "胸小肌": "pectoralis minor",
  "鎖骨上神經": "supraclavicular nerve",
  "胸肩峰動脈": "thoracoacromial artery",
  "臂叢": "brachial plexus",
  "胸前神經": "anterior thoracic nerve"
};

const functionEnglishMap = {
  "疏風解表": "release the exterior and dispel wind",
  "清熱止痛": "clear heat and relieve pain",
  "調理面口與頭項": "regulate the face, mouth, head, and neck",
  "寬胸理氣": "open the chest and regulate qi",
  "和胃降逆": "harmonize the stomach and direct rebellious qi downward",
  "寧心安神": "calm the Heart and quiet the spirit",
  "宣肺解表": "diffuse the Lung and release the exterior",
  "通調任脈": "regulate the Conception Vessel",
  "利咽止咳": "benefit the throat and stop cough",
  "健脾和胃": "strengthen the Spleen and harmonize the Stomach",
  "扶正培元": "support healthy qi and tonify the source",
  "通經活絡": "open the channels and activate the collaterals",
  "健脾化濕": "strengthen the Spleen and transform dampness",
  "調肝腎": "regulate the Liver and Kidney",
  "調經安神": "regulate menstruation and calm the spirit",
  "疏肝理氣": "soothe the Liver and regulate qi",
  "平肝息風": "pacify the Liver and extinguish wind",
  "清利下焦": "clear and benefit the lower burner",
  "滋腎陰": "nourish Kidney yin",
  "補腎氣": "tonify Kidney qi",
  "強腰膝": "strengthen the lumbar region and knees",
  "明目醒腦": "brighten the eyes and awaken the mind",
  "醒神開竅": "awaken the spirit and open the orifices",
  "升陽舉陷": "raise yang and lift prolapse",
  "和胃健脾": "harmonize the Stomach and strengthen the Spleen",
  "降逆止嘔": "descend rebellious qi and stop vomiting",
  "消食導滯": "promote digestion and move food stagnation",
  "補益元氣": "tonify source qi",
  "溫陽固脫": "warm yang and secure collapse",
  "調理下焦": "regulate the lower burner",
  "補腎壯腰": "tonify the Kidney and strengthen the low back",
  "益精助陽": "benefit essence and support yang",
  "利水": "promote urination and drain water",
  "養心定悸": "nourish the Heart and calm palpitations",
  "祛風止癢": "dispel wind and stop itching",
  "舒筋活絡": "relax the sinews and activate the collaterals",
  "疏肝利膽": "soothe the Liver and benefit the Gallbladder",
  "清熱涼血": "clear heat and cool the blood",
  "宣肺降氣": "diffuse the Lung and descend qi",
  "止咳平喘": "stop cough and calm wheezing",
  "清肺熱": "clear Lung heat",
  "降逆氣": "direct rebellious qi downward",
  "補肺益氣": "tonify the Lung and augment qi",
  "化痰止咳": "transform phlegm and stop cough",
  "通脈": "open the vessels",
  "通鼻竅": "open the nasal passages",
  "散風熱": "dispel wind-heat",
  "調理腸腑": "regulate the intestines",
  "行氣導滯": "move qi and guide out stagnation",
  "止瀉通便": "stop diarrhea and promote bowel movement",
  "化痰降濁": "transform phlegm and descend turbidity",
  "清胃熱": "clear Stomach heat",
  "止痛": "relieve pain",
  "健脾利濕": "strengthen the Spleen and drain dampness",
  "通利下焦": "open and benefit the lower burner",
  "活血化瘀": "invigorate blood and dispel stasis",
  "涼血止癢": "cool the blood and stop itching",
  "舒項背": "relax the neck and back",
  "清頭目": "clear the head and eyes",
  "宣肺理氣": "diffuse the Lung and regulate qi",
  "寬胸和胃": "open the chest and harmonize the Stomach",
  "益氣統血": "augment qi and control blood",
  "調經止痛": "regulate menstruation and relieve pain",
  "滋陰清熱": "nourish yin and clear heat",
  "解表清熱": "release the exterior and clear heat",
  "通少陽": "open the Shaoyang channel",
  "利耳目": "benefit the ears and eyes",
  "降逆": "descend rebellious qi",
  "通絡": "open the collaterals",
  "利腰腿": "benefit the low back and legs",
  "祛風濕": "dispel wind-damp",
  "益髓強骨": "benefit marrow and strengthen bones",
  "溫腎固本": "warm the Kidney and secure the root",
  "降逆平喘": "descend rebellious qi and calm wheezing",
  "通乳": "promote lactation",
  "振奮陽氣": "invigorate yang qi",
  "急救回陽": "rescue yang in emergency traditional use",
  "清熱息風": "clear heat and extinguish wind",
  "安神定志": "calm the spirit and settle the will",
  "止頭痛": "relieve headache",
  "疏風": "dispel wind"
};

const patternEnglishMap = {
  "風寒表證": "wind-cold exterior pattern",
  "風熱表證": "wind-heat exterior pattern",
  "頭面痛": "head and facial pain",
  "牙痛": "toothache",
  "氣滯疼痛": "qi stagnation pain",
  "胸悶": "chest oppression",
  "心悸": "palpitations",
  "噁心嘔吐": "nausea and vomiting",
  "胃氣上逆": "rebellious Stomach qi",
  "焦慮失眠": "anxiety with insomnia",
  "外感咳嗽": "externally contracted cough",
  "鼻塞": "nasal obstruction",
  "咽喉不利": "throat discomfort",
  "頭項強痛": "stiff and painful head and neck",
  "肺氣不宣": "failure of Lung qi to diffuse",
  "脾胃虛弱": "Spleen and Stomach deficiency",
  "胃痛": "stomach pain",
  "腹脹": "abdominal distention",
  "泄瀉": "diarrhea",
  "氣血不足": "qi and blood deficiency",
  "脾虛濕盛": "Spleen deficiency with dampness",
  "月經不調": "irregular menstruation",
  "失眠": "insomnia",
  "肝腎不足": "Liver and Kidney deficiency",
  "下焦虛寒": "deficiency cold of the lower burner",
  "肝氣鬱結": "Liver qi constraint",
  "頭痛眩暈": "headache and dizziness",
  "脅痛": "hypochondriac pain",
  "情志鬱悶": "emotional constraint",
  "肝陽上亢": "ascendant Liver yang",
  "腎陰虛": "Kidney yin deficiency",
  "腰膝痠軟": "sore and weak low back and knees",
  "耳鳴": "tinnitus",
  "潮熱盜汗": "tidal fever and night sweating",
  "腎氣不足": "Kidney qi deficiency",
  "風邪頭痛": "wind-type headache",
  "眩暈": "dizziness",
  "目赤": "red eyes",
  "少陽證": "Shaoyang pattern",
  "頭暈": "dizziness",
  "神志不清": "clouded consciousness",
  "中氣下陷": "sinking of middle qi",
  "焦慮": "anxiety",
  "胃脘痛": "epigastric pain",
  "食滯": "food stagnation",
  "腹痛": "abdominal pain",
  "氣虛": "qi deficiency",
  "陽虛": "yang deficiency",
  "虛勞": "deficiency taxation",
  "腎虛腰痛": "low back pain due to Kidney deficiency",
  "遺精": "spermatorrhea",
  "水腫": "edema",
  "腎陽不足": "Kidney yang insufficiency",
  "多夢": "excessive dreaming",
  "心血不足": "Heart blood deficiency",
  "心神不寧": "restless Heart spirit",
  "熱證": "heat pattern",
  "皮膚瘙癢": "skin itching",
  "上肢痹痛": "painful obstruction of the upper limb",
  "高熱": "high fever",
  "風熱": "wind-heat",
  "筋脈拘急": "sinew tightness",
  "膽腑濕熱": "damp-heat in the Gallbladder",
  "下肢痹痛": "painful obstruction of the lower limb",
  "肝膽氣滯": "Liver and Gallbladder qi stagnation",
  "腰背痛": "low back and back pain",
  "膝痛": "knee pain",
  "暑熱": "summer heat",
  "血熱": "blood heat",
  "咳嗽": "cough",
  "喘證": "wheezing pattern",
  "痰濁阻肺": "phlegm turbidity obstructing the Lung",
  "肺熱咳嗽": "cough due to Lung heat",
  "喘咳": "wheezing cough",
  "咽喉腫痛": "sore swollen throat",
  "肘臂痛": "elbow and arm pain",
  "痰熱壅肺": "phlegm-heat obstructing the Lung",
  "肺氣虛": "Lung qi deficiency",
  "久咳": "chronic cough",
  "氣短": "shortness of breath",
  "脈弱": "weak pulse",
  "痰飲": "phlegm-fluid retention",
  "鼻炎": "rhinitis",
  "面癢": "facial itching",
  "風熱犯肺": "wind-heat invading the Lung",
  "嗅覺不利": "impaired smell",
  "腹瀉": "diarrhea",
  "便秘": "constipation",
  "腸腑氣滯": "intestinal qi stagnation",
  "痰濕": "phlegm-dampness",
  "痰熱": "phlegm-heat",
  "胃氣不和": "disharmony of Stomach qi",
  "胃火牙痛": "toothache due to Stomach fire",
  "口臭": "bad breath",
  "熱結腸胃": "heat binding the intestines and Stomach",
  "小便不利": "difficult urination",
  "血瘀": "blood stasis",
  "督脈不利": "Governing Vessel dysfunction",
  "癲癇": "epilepsy",
  "盜汗": "night sweating",
  "外感": "external contraction",
  "胸脅痛": "chest and hypochondriac pain",
  "呃逆": "hiccup",
  "嘔吐": "vomiting",
  "皮膚血熱": "blood heat affecting the skin",
  "脾氣虛": "Spleen qi deficiency",
  "食少": "poor appetite",
  "水濕內停": "internal retention of water-dampness",
  "腰骶痛": "lumbosacral pain",
  "咽喉乾痛": "dry sore throat",
  "陰虛內熱": "yin deficiency with internal heat",
  "外感發熱": "externally contracted fever",
  "偏頭痛": "migraine",
  "肩頸痛": "shoulder and neck pain",
  "乳癰": "breast abscess",
  "氣機上逆": "upward counterflow of qi dynamic",
  "產後乳少": "insufficient postpartum lactation",
  "坐骨神經痛": "sciatica",
  "髖痛": "hip pain",
  "腰腿痛": "low back and leg pain",
  "風寒濕痹": "wind-cold-damp painful obstruction",
  "骨髓不足": "marrow insufficiency",
  "偏癱": "hemiplegia",
  "踝痛": "ankle pain",
  "胸脅脹痛": "distending chest and hypochondriac pain",
  "元氣不足": "source qi deficiency",
  "不孕": "infertility",
  "氣逆": "rebellious qi",
  "咳喘": "cough and wheezing",
  "乳汁不下": "failure of lactation",
  "陽氣不足": "yang qi insufficiency",
  "瘧疾往來寒熱": "alternating chills and fever",
  "昏厥": "syncope",
  "中暑": "heatstroke",
  "癲狂": "mania and withdrawal",
  "抽搐": "convulsions",
  "急性腰扭傷": "acute lumbar sprain",
  "頭痛": "headache",
  "眼疲勞": "eye strain"
};

const auricularPoints = [
  {
    code: "EAR-SM",
    nameZh: "神門",
    nameEn: "Shenmen",
    pinyin: "Shenmen",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳廓三角窩內，靠近上、下對耳輪腳分叉處。",
    locationEn: "In the Triangle Fossa of the auricle, near the bifurcation of the superior and inferior AntiHelix crura.",
    anatomy: [{ zh: "三角窩", en: "Triangle Fossa" }, { zh: "對耳輪腳", en: "AntiHelix Crus" }, { zh: "耳廓", en: "Auricle" }],
    functions: "寧心安神，鎮靜止痛，調節情志。",
    functionsEn: "Calm the spirit, support relaxation, and assist pain modulation in traditional auricular therapy.",
    patterns: ["焦慮", "失眠", "疼痛", "心神不寧", "戒斷不適"],
    patternsEn: ["anxiety", "insomnia", "pain", "restless spirit", "withdrawal discomfort"],
    evidence: "神門是耳穴療法最常用點之一；研究多為輔助治療，證據品質依症狀與研究設計差異很大。",
    cautions: "耳部皮膚感染、濕疹、破皮或金屬/膠布過敏時避免貼壓。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/", "https://en.wikipedia.org/wiki/Auriculotherapy"],
    x: 168,
    y: 164
  },
  {
    code: "EAR-SYM",
    nameZh: "交感",
    nameEn: "Sympathetic",
    pinyin: "Jiaogan",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "下對耳輪腳與耳輪內側交界附近，常作自主神經調節點。",
    locationEn: "Near the junction of the inferior antihelix crus and the inner helix, used as an autonomic regulation point in auricular maps.",
    anatomy: [{ zh: "下對耳輪腳", en: "Inferior AntiHelix Crus" }, { zh: "耳輪", en: "Helix" }],
    functions: "調節自主神經，緩急止痛，和胃腸。",
    functionsEn: "Regulate autonomic balance, ease spasmodic discomfort, and support gastrointestinal regulation.",
    patterns: ["腹痛", "胃氣上逆", "疼痛", "焦慮", "自主神經失調"],
    patternsEn: ["abdominal pain", "rebellious Stomach qi", "pain", "anxiety", "autonomic dysregulation"],
    evidence: "耳穴交感常與神門、皮質下等合用；不能取代急性腹痛或胸痛的醫療評估。",
    cautions: "劇烈腹痛、胸痛、冒冷汗或昏厥感需立即就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 204,
    y: 226
  },
  {
    code: "EAR-P0",
    nameZh: "零點",
    nameEn: "Point Zero",
    pinyin: "Lingdian",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔中央附近，常作全身平衡與鎮靜配穴。",
    locationEn: "Near the center of the concha, commonly used as a balancing point in auricular therapy systems.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "調和全身，安神，協調耳穴處方。",
    functionsEn: "Harmonize the body, calm the spirit, and coordinate auricular point prescriptions.",
    patterns: ["焦慮", "失眠", "疼痛", "壓力", "整體調節"],
    patternsEn: ["anxiety", "insomnia", "pain", "stress", "general regulation"],
    evidence: "零點多見於法式與整合耳穴系統；不同學派定位略有差異。",
    cautions: "避免將耳豆或貼片推入外耳道。",
    sources: ["https://en.wikipedia.org/wiki/Auriculotherapy"],
    x: 190,
    y: 304
  },
  {
    code: "EAR-END",
    nameZh: "內分泌",
    nameEn: "Endocrine",
    pinyin: "Neifenmi",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔下部與屏間切跡附近。",
    locationEn: "Near the inferior concha and intertragal notch region.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }, { zh: "屏間切跡", en: "Intertragal Notch" }],
    functions: "調節內分泌，清熱抗敏，調經。",
    functionsEn: "Support endocrine regulation, allergic response modulation, and menstrual regulation in traditional use.",
    patterns: ["月經不調", "過敏", "皮膚瘙癢", "內分泌失調", "潮熱盜汗"],
    patternsEn: ["irregular menstruation", "allergy", "skin itching", "endocrine imbalance", "hot flashes and night sweating"],
    evidence: "常用於過敏、皮膚與婦科耳穴配伍；內分泌疾病需依正式醫學診斷治療。",
    cautions: "懷孕、荷爾蒙治療或內分泌疾病患者應先諮詢專業人員。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 196,
    y: 382
  },
  {
    code: "AT4",
    standardCode: "AT4",
    standardRegion: "對耳屏區8穴 / Antitragus region, 8 points",
    standardZone: "對耳屏4區 / Antitragus Zone 4",
    nameZh: "皮質下",
    nameEn: "Subcortex",
    pinyin: "pizhixia",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "皮質下穴區在對耳屏內側面，即對耳屏4區。",
    locationEn: "On the medial surface of the antitragus, corresponding to Antitragus Zone 4 in the 93 auricular-point national standard map.",
    anatomy: [
      { zh: "對耳屏", en: "Antitragus" },
      { zh: "對耳屏內側面", en: "medial surface of the antitragus" },
      { zh: "耳廓", en: "auricle" },
      { zh: "耳廓感覺神經", en: "sensory nerves of the auricle" },
      { zh: "耳大神經", en: "great auricular nerve" },
      { zh: "耳顳神經", en: "auriculotemporal nerve" },
      { zh: "迷走神經耳支", en: "auricular branch of the vagus nerve" }
    ],
    aliases: ["卵巢", "睪丸", "興奮點", "對耳屏4區"],
    functions: "鎮靜安神，止痛，調節大腦皮層興奮與抑制功能，協助調節自主神經與消化功能。",
    functionsEn: "Calm the spirit, relieve pain, and help regulate cortical excitation/inhibition, autonomic function, and digestive function in auricular therapy.",
    patterns: ["失眠", "焦慮", "疼痛", "神經衰弱", "自主神經失調", "消化不良", "噁心嘔吐", "腹脹", "腹瀉", "便秘", "高血壓", "心律失常"],
    patternsEn: ["insomnia", "anxiety", "pain", "neurasthenia", "autonomic dysregulation", "indigestion", "nausea and vomiting", "abdominal distention", "diarrhea", "constipation", "hypertension", "arrhythmia"],
    evidence: "此資料依 93 耳針國標文字後設資料整理。耳穴皮質下常用於神經系統、消化系統與心血管相關配伍；現代臨床應作輔助學習與治療思路參考，不可取代正式診斷。",
    cautions: "耳屏/對耳屏附近貼壓需避免阻塞外耳道；急性神經症狀、胸痛、嚴重高血壓或心律異常需就醫。",
    image: "https://acupun.site/Ear93GB/pics/AT4%e7%9a%ae%e8%b3%aa%e4%b8%8b-Top45Oblique.png",
    sources: ["https://acupun.site/point_list_Ear93GB.aspx?pointId=AT4", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 127,
    y: 306
  },
  {
    code: "EAR-ADR",
    nameZh: "腎上腺",
    nameEn: "Adrenal",
    pinyin: "Shenshangxian",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳屏下緣或屏尖附近，依圖譜系統略有差異。",
    locationEn: "Near the inferior tragus or tragus tip region, depending on the auricular chart system.",
    anatomy: [{ zh: "耳屏", en: "tragus" }],
    functions: "抗敏，清熱，調節應激反應。",
    functionsEn: "Support stress response regulation and allergic/inflammatory pattern modulation in traditional use.",
    patterns: ["過敏", "皮膚瘙癢", "哮喘", "發炎", "壓力"],
    patternsEn: ["allergy", "skin itching", "asthma", "inflammation", "stress"],
    evidence: "耳穴腎上腺多作過敏與壓力反應配伍；不等同於腎上腺疾病治療。",
    cautions: "嚴重過敏、呼吸困難或氣喘急性發作需立即就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 124,
    y: 356
  },
  {
    code: "EAR-LUNG",
    nameZh: "肺",
    nameEn: "Lung",
    pinyin: "Fei",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔中央偏外側區，常用於呼吸與皮膚相關配穴。",
    locationEn: "In the central-lateral concha region, commonly used for respiratory and skin-related auricular prescriptions.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "宣肺止咳，利咽，調皮毛。",
    functionsEn: "Diffuse Lung qi, ease cough, benefit the throat, and support skin regulation.",
    patterns: ["咳嗽", "喘證", "鼻炎", "皮膚瘙癢", "肺氣不宣"],
    patternsEn: ["cough", "wheezing pattern", "rhinitis", "skin itching", "failure of Lung qi to diffuse"],
    evidence: "常用於呼吸道與皮膚症狀耳穴配伍；氣喘或感染應以標準醫療為主。",
    cautions: "呼吸困難、胸痛或高熱需立即就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 210,
    y: 318
  },
  {
    code: "EAR-HEART",
    nameZh: "心",
    nameEn: "Heart",
    pinyin: "Xin",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔內，肺區附近偏中央。",
    locationEn: "Within the concha, near the central region adjacent to the Lung area on auricular maps.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "寧心安神，定悸，助眠。",
    functionsEn: "Calm the Heart, settle palpitations, and support sleep.",
    patterns: ["心悸", "失眠", "焦慮", "心神不寧", "多夢"],
    patternsEn: ["palpitations", "insomnia", "anxiety", "restless Heart spirit", "excessive dreaming"],
    evidence: "心區耳穴多用於睡眠與情志配伍；胸痛或心律異常需醫療評估。",
    cautions: "胸痛、呼吸困難、暈厥或心律不整不可自行處理。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 178,
    y: 330
  },
  {
    code: "EAR-LIVER",
    nameZh: "肝",
    nameEn: "Liver",
    pinyin: "Gan",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲艇上部或耳甲腔上內側區，依圖譜略有差異。",
    locationEn: "In the Superior Concha or superior-medial concha region, depending on the auricular chart system.",
    anatomy: [{ zh: "耳甲艇", en: "Superior Concha" }, { zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "疏肝理氣，清肝明目，調情志。",
    functionsEn: "Soothe the Liver, regulate qi, clear Liver heat, and support emotional balance.",
    patterns: ["肝氣鬱結", "頭痛眩暈", "目赤", "情志鬱悶", "肝陽上亢"],
    patternsEn: ["Liver qi constraint", "headache and dizziness", "red eyes", "emotional constraint", "ascendant Liver yang"],
    evidence: "耳穴肝常用於情志、眼目與肝鬱相關配伍；肝膽疾病需正式檢查。",
    cautions: "黃疸、劇烈右上腹痛或視力急變需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 208,
    y: 268
  },
  {
    code: "EAR-KIDNEY",
    nameZh: "腎",
    nameEn: "Kidney",
    pinyin: "Shen",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲艇下部或耳甲腔上方區域。",
    locationEn: "In the lower Superior Concha or upper concha region.",
    anatomy: [{ zh: "耳甲艇", en: "Superior Concha" }, { zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "補腎益精，強腰膝，助聽。",
    functionsEn: "Tonify Kidney, benefit essence, strengthen the low back and knees, and support hearing in traditional use.",
    patterns: ["腎陰虛", "腎氣不足", "腰膝痠軟", "耳鳴", "失眠"],
    patternsEn: ["Kidney yin deficiency", "Kidney qi deficiency", "sore and weak low back and knees", "tinnitus", "insomnia"],
    evidence: "耳穴腎常用於腰膝、耳鳴與虛證配伍；腎臟疾病需由醫師診斷。",
    cautions: "水腫、血尿、嚴重腰痛或聽力突降需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 180,
    y: 254
  },
  {
    code: "EAR-SPLEEN",
    nameZh: "脾",
    nameEn: "Spleen",
    pinyin: "Pi",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔或耳甲艇相鄰區，常與胃、腸點配伍。",
    locationEn: "In the Inferior Concha or adjacent Superior Concha region, commonly combined with Stomach and intestinal auricular points.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }, { zh: "耳甲艇", en: "Superior Concha" }],
    functions: "健脾化濕，益氣，助運化。",
    functionsEn: "Strengthen the Spleen, transform dampness, augment qi, and support transformation and transportation.",
    patterns: ["脾虛濕盛", "腹脹", "腹瀉", "氣血不足", "水濕內停"],
    patternsEn: ["Spleen deficiency with dampness", "abdominal distention", "diarrhea", "qi and blood deficiency", "internal water-damp retention"],
    evidence: "脾胃耳穴多用於消化功能與疲勞相關配伍；持續腸胃症狀需醫療評估。",
    cautions: "黑便、體重下降、持續腹痛或脫水需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 220,
    y: 350
  },
  {
    code: "EAR-STOMACH",
    nameZh: "胃",
    nameEn: "Stomach",
    pinyin: "Wei",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔近耳輪腳根部區域。",
    locationEn: "In the concha near the root of the helix crus.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }, { zh: "耳輪腳", en: "Crus of Helix" }],
    functions: "和胃降逆，止嘔，消食。",
    functionsEn: "Harmonize the Stomach, descend rebellious qi, ease nausea, and support digestion.",
    patterns: ["胃痛", "噁心嘔吐", "食滯", "腹脹", "胃氣上逆"],
    patternsEn: ["stomach pain", "nausea and vomiting", "food stagnation", "abdominal distention", "rebellious Stomach qi"],
    evidence: "耳穴胃常用於噁心與消化症狀配伍；急性腹症需先排除。",
    cautions: "劇烈腹痛、嘔血、黑便或持續嘔吐需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 160,
    y: 282
  },
  {
    code: "EAR-LI",
    nameZh: "大腸",
    nameEn: "Large Intestine",
    pinyin: "Dachang",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔下外側區，胃區附近。",
    locationEn: "In the inferolateral concha, near the Stomach area on auricular maps.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "調腸通便，行氣導滯。",
    functionsEn: "Regulate the intestines, promote bowel movement, and move qi stagnation.",
    patterns: ["便秘", "腹瀉", "腹痛", "腹脹", "腸腑氣滯"],
    patternsEn: ["constipation", "diarrhea", "abdominal pain", "abdominal distention", "intestinal qi stagnation"],
    evidence: "腸道耳穴常用於便秘或腹瀉配伍；慢性或警訊症狀需檢查。",
    cautions: "便血、嚴重腹痛、發燒或脫水需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 232,
    y: 390
  },
  {
    code: "EAR-MOUTH",
    nameZh: "口",
    nameEn: "Mouth",
    pinyin: "Kou",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔下方靠近耳屏與屏間切跡區。",
    locationEn: "In the inferior concha near the tragus and intertragal notch region.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }, { zh: "耳屏", en: "Tragus" }, { zh: "屏間切跡", en: "Intertragal Notch" }],
    functions: "利口咽，調食慾，和胃。",
    functionsEn: "Benefit the mouth and throat, regulate appetite, and harmonize the Stomach.",
    patterns: ["口瘡", "口臭", "食慾不調", "咽喉腫痛", "胃火"],
    patternsEn: ["mouth ulcers", "bad breath", "appetite dysregulation", "sore swollen throat", "Stomach fire"],
    evidence: "口區常與胃、神門、飢點等配伍；口腔感染或潰瘍持續需牙醫/醫師評估。",
    cautions: "口腔潰瘍超過兩週或伴發燒需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 154,
    y: 356
  },
  {
    code: "EAR-HUNGER",
    nameZh: "飢點",
    nameEn: "Hunger",
    pinyin: "Jidian",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳屏前緣或耳屏區附近，常用於食慾管理配伍。",
    locationEn: "Near the anterior tragus margin or tragus region, commonly used in appetite-regulation auricular prescriptions.",
    anatomy: [{ zh: "耳屏", en: "tragus" }],
    functions: "調食慾，和胃，輔助體重管理。",
    functionsEn: "Regulate appetite, harmonize the Stomach, and support weight-management programs as an adjunct.",
    patterns: ["食慾不調", "食積", "痰濕", "壓力進食", "胃氣不和"],
    patternsEn: ["appetite dysregulation", "food stagnation", "phlegm-dampness", "stress eating", "disharmony of Stomach qi"],
    evidence: "耳穴減重/食慾研究結果不一致；應作飲食、運動與醫療管理的輔助。",
    cautions: "飲食障礙、糖尿病或快速體重變化需專業照護。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/", "https://www.health.com/ear-seeds-7505999"],
    x: 116,
    y: 286
  },
  {
    code: "EAR-OCC",
    nameZh: "枕",
    nameEn: "Occiput",
    pinyin: "Zhen",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳垂後上方或對耳屏附近，常用於頭項與睡眠配伍。",
    locationEn: "Near the posterosuperior lobule or antitragus region, commonly used for head-neck and sleep-related prescriptions.",
    anatomy: [{ zh: "耳垂", en: "Lobe" }, { zh: "對耳屏", en: "Antitragus" }],
    functions: "清頭目，安神，止頭痛。",
    functionsEn: "Clear the head and eyes, calm the spirit, and ease headache.",
    patterns: ["頭痛", "眩暈", "失眠", "頸項強痛", "眼疲勞"],
    patternsEn: ["headache", "dizziness", "insomnia", "stiff and painful neck", "eye strain"],
    evidence: "枕區常用於頭痛、睡眠與頸項配伍；突發劇烈頭痛需急診評估。",
    cautions: "突發最嚴重頭痛、視力改變、肢體無力或言語困難需立即就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 172,
    y: 456
  },
  {
    code: "EAR-EYE",
    nameZh: "眼",
    nameEn: "Eye",
    pinyin: "Yan",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳垂中央或耳垂前區。",
    locationEn: "In the central or anterior region of the Lobe.",
    anatomy: [{ zh: "耳垂", en: "Lobe" }],
    functions: "明目，清肝熱，緩解眼疲勞。",
    functionsEn: "Brighten the eyes, clear Liver heat, and ease eye strain in traditional use.",
    patterns: ["目赤", "眼疲勞", "頭痛", "肝陽上亢", "風熱"],
    patternsEn: ["red eyes", "eye strain", "headache", "ascendant Liver yang", "wind-heat"],
    evidence: "眼區可作眼疲勞輔助配穴；視力急變、眼痛或外傷需眼科評估。",
    cautions: "突發視力下降、劇烈眼痛或眼外傷不可自行處理。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 154,
    y: 504
  },
  {
    code: "EAR-APEX",
    nameZh: "耳尖",
    nameEn: "Ear Apex",
    pinyin: "Erjian",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "將耳廓向前折疊時，耳輪最高點附近。",
    locationEn: "At the highest point of the helix when the auricle is folded forward.",
    anatomy: [{ zh: "耳輪", en: "Helix" }, { zh: "耳廓", en: "Auricle" }],
    functions: "清熱，醒神，明目。",
    functionsEn: "Clear heat, refresh the spirit, and benefit the eyes in traditional auricular practice.",
    patterns: ["高熱", "目赤", "咽喉腫痛", "頭痛", "風熱"],
    patternsEn: ["high fever", "red eyes", "sore swollen throat", "headache", "wind-heat"],
    evidence: "耳尖常見放血/刺絡傳統操作描述；侵入性操作必須由合格專業人員執行。",
    cautions: "不可自行刺血；凝血異常、抗凝藥、感染或糖尿病足/傷口照護風險者需避免。",
    sources: ["https://zh.wikipedia.org/wiki/%E8%80%B3%E9%87%9D"],
    x: 158,
    y: 78
  },
  {
    code: "EAR-CSP",
    nameZh: "頸椎",
    nameEn: "Cervical Spine",
    pinyin: "Jingzhui",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "對耳輪下段，對應頸椎區。",
    locationEn: "On the lower antihelix, corresponding to the cervical spine area in auricular maps.",
    anatomy: [{ zh: "對耳輪", en: "AntiHelix" }],
    functions: "舒項止痛，通絡。",
    functionsEn: "Relax the neck, relieve pain, and open the collaterals.",
    patterns: ["頸項強痛", "頭痛", "肩頸痛", "經絡阻滯", "上肢痹痛"],
    patternsEn: ["stiff and painful neck", "headache", "shoulder and neck pain", "channel obstruction", "upper limb painful obstruction"],
    evidence: "脊柱耳穴多依倒置胎兒映射使用；頸痛伴神經症狀需醫療評估。",
    cautions: "手麻無力、走路不穩或外傷後頸痛需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/", "https://en.wikipedia.org/wiki/Auriculotherapy"],
    x: 232,
    y: 232
  },
  {
    code: "EAR-LSP",
    nameZh: "腰椎",
    nameEn: "Lumbar Spine",
    pinyin: "Yaozhui",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "對耳輪中下段，對應腰椎區。",
    locationEn: "On the middle-lower antihelix, corresponding to the lumbar spine area in auricular maps.",
    anatomy: [{ zh: "對耳輪", en: "AntiHelix" }],
    functions: "利腰背，舒筋活絡，止痛。",
    functionsEn: "Benefit the low back, relax sinews, activate collaterals, and relieve pain.",
    patterns: ["腰背痛", "坐骨神經痛", "腰腿痛", "腎虛腰痛", "風寒濕痹"],
    patternsEn: ["low back pain", "sciatica", "low back and leg pain", "Kidney-deficiency low back pain", "wind-cold-damp painful obstruction"],
    evidence: "耳穴腰椎常用於腰痛輔助；紅旗症狀需醫療處理。",
    cautions: "大小便異常、下肢無力麻木加重、發燒或癌症病史合併腰痛需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 242,
    y: 300
  },
  {
    code: "EAR-KNEE",
    nameZh: "膝",
    nameEn: "Knee",
    pinyin: "Xi",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "對耳輪上腳或三角窩下緣附近，對應下肢關節區。",
    locationEn: "Near the Superior AntiHelix Crus or lower Triangle Fossa, corresponding to the lower-limb joint area.",
    anatomy: [{ zh: "對耳輪上腳", en: "Superior AntiHelix Crus" }, { zh: "三角窩", en: "Triangle Fossa" }],
    functions: "舒筋活絡，止膝痛。",
    functionsEn: "Relax sinews, activate collaterals, and relieve knee pain.",
    patterns: ["膝痛", "下肢痹痛", "風寒濕痹", "筋脈拘急", "經絡阻滯"],
    patternsEn: ["knee pain", "lower limb painful obstruction", "wind-cold-damp painful obstruction", "sinew tightness", "channel obstruction"],
    evidence: "膝區耳穴多用於疼痛配伍；急性腫脹外傷需排除骨折/韌帶損傷。",
    cautions: "膝部紅腫熱痛、不能負重或外傷後變形需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 206,
    y: 170
  },
  {
    code: "EAR-SHOULDER",
    nameZh: "肩",
    nameEn: "Shoulder",
    pinyin: "Jian",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳舟上部或耳輪與對耳輪之間凹陷區。",
    locationEn: "In the upper Scaphoid Fossa, the groove between the Helix and AntiHelix.",
    anatomy: [{ zh: "耳舟", en: "Scaphoid Fossa" }, { zh: "耳輪", en: "Helix" }, { zh: "對耳輪", en: "AntiHelix" }],
    functions: "舒肩通絡，止痛。",
    functionsEn: "Relax the shoulder, open the collaterals, and relieve pain.",
    patterns: ["肩頸痛", "上肢痹痛", "經絡阻滯", "筋脈拘急", "風寒濕痹"],
    patternsEn: ["shoulder and neck pain", "upper limb painful obstruction", "channel obstruction", "sinew tightness", "wind-cold-damp painful obstruction"],
    evidence: "肩區耳穴常與神門、交感配伍作疼痛輔助。",
    cautions: "肩痛伴胸痛、呼吸困難或外傷後無力需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 248,
    y: 202
  },
  {
    code: "EAR-UTERUS",
    nameZh: "子宮",
    nameEn: "Uterus",
    pinyin: "Zigong",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "三角窩內下部，靠近對耳輪下腳區。",
    locationEn: "In the lower Triangle Fossa, near the Inferior AntiHelix Crus region.",
    anatomy: [{ zh: "三角窩", en: "Triangle Fossa" }, { zh: "下對耳輪腳", en: "Inferior AntiHelix Crus" }],
    functions: "調經止痛，調下焦。",
    functionsEn: "Regulate menstruation, relieve menstrual pain, and regulate the lower burner.",
    patterns: ["月經不調", "痛經", "下焦寒濕", "不孕", "腹痛"],
    patternsEn: ["irregular menstruation", "dysmenorrhea", "lower-burner cold-damp", "infertility", "abdominal pain"],
    evidence: "婦科耳穴需依正式診斷輔助使用；不明出血或妊娠相關症狀不可自行處理。",
    cautions: "孕期、不明陰道出血、劇烈腹痛或疑似感染需就醫。",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/"],
    x: 176,
    y: 210
  },
  {
    code: "EAR-DIA",
    nameZh: "膈",
    nameEn: "Diaphragm",
    pinyin: "Ge",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳輪腳上，常用於膈肌與胃氣上逆相關配伍。",
    locationEn: "On the Crus of Helix, commonly used in auricular maps for diaphragm-related and rebellious Stomach qi patterns.",
    anatomy: [{ zh: "耳輪腳", en: "Crus of Helix" }],
    functions: "寬胸降逆，和胃止呃。",
    functionsEn: "Open the chest, direct rebellious qi downward, harmonize the Stomach, and relieve hiccup in traditional use.",
    patterns: ["呃逆", "胃氣上逆", "胸悶", "噁心", "嘔吐"],
    patternsEn: ["hiccup", "rebellious Stomach qi", "chest oppression", "nausea", "vomiting"],
    evidence: "常見耳針教材列為膈區相關點；需與完整病因辨識配合。",
    cautions: "持續嘔吐、胸痛、吞嚥困難或黑便需就醫。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 184,
    y: 280
  },
  {
    code: "EAR-BLADDER",
    nameZh: "膀胱",
    nameEn: "Bladder",
    pinyin: "Pangguang",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲艇內，靠近對耳輪下腳下緣與大腸直上方區。",
    locationEn: "In the Superior Concha, near the inferior border of the Inferior AntiHelix Crus and superior to the Large Intestine region.",
    anatomy: [{ zh: "耳甲艇", en: "Superior Concha" }, { zh: "下對耳輪腳", en: "Inferior AntiHelix Crus" }],
    functions: "利水通淋，調膀胱氣化。",
    functionsEn: "Promote urination, benefit strangury patterns, and regulate Bladder qi transformation.",
    patterns: ["尿頻", "尿急", "遺尿", "淋證", "下焦濕熱"],
    patternsEn: ["frequent urination", "urgent urination", "enuresis", "strangury pattern", "lower-burner damp-heat"],
    evidence: "A+醫學百科耳針表將膀胱列於耳甲艇部；定位需與圖譜版本核對。",
    cautions: "血尿、發燒腰痛、尿閉或疑似腎盂腎炎需立即就醫。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 198,
    y: 258
  },
  {
    code: "EAR-TRACHEA",
    nameZh: "氣管",
    nameEn: "Trachea",
    pinyin: "Qiguan",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳甲腔內，口與心穴之間。",
    locationEn: "In the Inferior Concha, between the Mouth and Heart auricular regions.",
    anatomy: [{ zh: "耳甲腔", en: "Inferior Concha" }],
    functions: "宣肺利咽，止咳平喘。",
    functionsEn: "Diffuse the Lung, benefit the throat, relieve cough, and calm wheezing in traditional use.",
    patterns: ["咳嗽", "氣喘", "咽喉不利", "肺氣不宣", "痰濕阻肺"],
    patternsEn: ["cough", "wheezing", "throat discomfort", "impaired Lung diffusion", "phlegm-damp obstructing the Lung"],
    evidence: "常見耳針教材列於耳甲腔部呼吸相關區。",
    cautions: "呼吸困難、喘鳴急性加重、唇紫或高熱需立即就醫。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 184,
    y: 354
  },
  {
    code: "EAR-THROAT",
    nameZh: "咽喉",
    nameEn: "Pharynx and Larynx",
    pinyin: "Yanhou",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳屏內側面，與外耳道口相對處。",
    locationEn: "On the medial surface of the Tragus, opposite the external acoustic meatus.",
    anatomy: [{ zh: "耳屏", en: "Tragus" }, { zh: "外耳道", en: "external acoustic meatus" }],
    functions: "清咽利喉，消腫止痛。",
    functionsEn: "Clear and benefit the throat, reduce swelling, and relieve pain in traditional use.",
    patterns: ["咽喉腫痛", "咳嗽", "風熱", "肺熱", "聲音嘶啞"],
    patternsEn: ["sore throat", "cough", "wind-heat", "Lung heat", "hoarseness"],
    evidence: "A+醫學百科耳針表列咽喉於耳屏部。",
    cautions: "吞嚥困難、呼吸困難、單側頸部腫脹或高熱需就醫。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 114,
    y: 318
  },
  {
    code: "EAR-EXT-NOSE",
    nameZh: "外鼻",
    nameEn: "External Nose",
    pinyin: "Waibi",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳屏外側中央附近。",
    locationEn: "Near the center of the lateral surface of the Tragus.",
    anatomy: [{ zh: "耳屏", en: "Tragus" }],
    functions: "通鼻竅，疏風清熱。",
    functionsEn: "Open the nasal orifices, dispel wind, and clear heat in traditional use.",
    patterns: ["鼻塞", "鼻炎", "鼻淵", "風熱", "感冒"],
    patternsEn: ["nasal obstruction", "rhinitis", "sinus congestion", "wind-heat", "common cold"],
    evidence: "A+醫學百科耳針表列外鼻於耳屏部。",
    cautions: "單側鼻出血不止、面部劇痛、發燒或疑似感染需就醫。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 108,
    y: 292
  },
  {
    code: "EAR-HTN-GROOVE",
    nameZh: "降壓溝",
    nameEn: "Hypertension Groove",
    pinyin: "Jiangyagou",
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    location: "耳廓背面，由內上方斜向外下方行走的凹溝處。",
    locationEn: "On the Posterior Surface of the auricle, along the groove running obliquely from the superomedial to inferolateral region.",
    anatomy: [{ zh: "耳廓背面", en: "Posterior Surface" }],
    functions: "平肝潛陽，輔助調節血壓。",
    functionsEn: "Pacify the Liver, anchor yang, and support blood-pressure regulation as an adjunctive traditional auricular point.",
    patterns: ["高血壓", "肝陽上亢", "頭暈", "頭痛", "耳鳴"],
    patternsEn: ["hypertension", "Liver yang rising", "dizziness", "headache", "tinnitus"],
    evidence: "A+醫學百科耳針表列降壓溝於耳廓背面；血壓管理需以醫療診斷與監測為主。",
    cautions: "血壓危象、胸痛、神經學症狀或用藥調整需由醫師處理。",
    sources: ["https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"],
    x: 264,
    y: 418
  }
];

const sourceByCode = Object.fromEntries(
  [...new Set([...Object.keys(locationEnglishByCode), ...defaultCodeList(standardPointPlaceholders, starterPoints, professionalPoints, lungMeridianExpansion, largeIntestineMeridianExpansion, stomachMeridianExpansion, spleenMeridianExpansion, heartMeridianExpansion, smallIntestineMeridianExpansion, bladderMeridianExpansion, kidneyMeridianExpansion, auricularGb93Index, auricularPoints, tungPointIndex)])]
    .map((code) => [code, ["https://www.acupoints.org/", "https://cloudtcm.com/acupoint"]])
);

const auricularSupplementSources = [
  "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"
];

const defaultPoints = enrichPoints(mergeByCode(standardPointPlaceholders, starterPoints, professionalPoints, lungMeridianExpansion, largeIntestineMeridianExpansion, stomachMeridianExpansion, spleenMeridianExpansion, heartMeridianExpansion, smallIntestineMeridianExpansion, bladderMeridianExpansion, kidneyMeridianExpansion, auricularGb93Index, auricularPoints, tungPointIndex));

let points = loadPoints();
let selectedCode = points[0]?.code || "";
let editingCode = null;
let clinicalCases = loadClinicalCases();
let selectedCaseId = clinicalCases[0]?.id || "";
let editingCaseId = null;
let editingSoapId = null;
let isSyncingPointHash = false;

const searchInput = document.querySelector("#searchInput");
const meridianFilter = document.querySelector("#meridianFilter");
const regionFilter = document.querySelector("#regionFilter");
const patternFilter = document.querySelector("#patternFilter");
const meridianCategoryList = document.querySelector("#meridianCategoryList");
const regionCategoryList = document.querySelector("#regionCategoryList");
const topicCategoryList = document.querySelector("#topicCategoryList");
const cardsEl = document.querySelector("#cards");
const detailCard = document.querySelector("#detailCard");
const bodyCanvas = document.querySelector("#bodyCanvas");
const modelStage = document.querySelector("#modelStage");
const modelLabels = document.querySelector("#modelLabels");
const earAnatomyLabels = document.querySelector("#earAnatomyLabels");
const modelRotate = document.querySelector("#modelRotate");
const modelReset = document.querySelector("#modelReset");
const viewTabs = [...document.querySelectorAll(".view-tab")];
const resultCount = document.querySelector("#resultCount");
const selectedCodeEl = document.querySelector("#selectedCode");
const standardCountEl = document.querySelector("#standardCount");
const missingCountEl = document.querySelector("#missingCount");
const acupunctureProgressEl = document.querySelector("#acupunctureProgress");
const caseProgressEl = document.querySelector("#caseProgress");
const caseCountEl = document.querySelector("#caseCount");
const auditGeneratedOnEl = document.querySelector("#auditGeneratedOn");
const healthStandardCountEl = document.querySelector("#healthStandardCount");
const healthMissingCountEl = document.querySelector("#healthMissingCount");
const healthCompletionPercentEl = document.querySelector("#healthCompletionPercent");
const healthNextBatchEl = document.querySelector("#healthNextBatch");
const healthNextTaskEl = document.querySelector("#healthNextTask");
const healthChannelListEl = document.querySelector("#healthChannelList");
const gb93NextBatchTextEl = document.querySelector("#gb93NextBatchText");
const gb93PromotionChecklistEl = document.querySelector("#gb93PromotionChecklist");
const gb93CandidateGridEl = document.querySelector("#gb93CandidateGrid");
const healthReviewedStandardEl = document.querySelector("#healthReviewedStandard");
const healthPlaceholderStandardEl = document.querySelector("#healthPlaceholderStandard");
const healthTungIndexEl = document.querySelector("#healthTungIndex");
const healthAuricularIndexEl = document.querySelector("#healthAuricularIndex");
const healthAuricularGb93CoverageEl = document.querySelector("#healthAuricularGb93Coverage");
const healthGb93WorklistEl = document.querySelector("#healthGb93Worklist");
const healthVisualCoverageEl = document.querySelector("#healthVisualCoverage");
const healthMissingEnglishLocationEl = document.querySelector("#healthMissingEnglishLocation");
const healthMissingTechniqueEl = document.querySelector("#healthMissingTechnique");
const healthMissingSafetyEl = document.querySelector("#healthMissingSafety");
const directoryTotalEl = document.querySelector("#directoryTotal");
const caseSearch = document.querySelector("#caseSearch");
const homeSearch = document.querySelector("#homeSearch");
const caseList = document.querySelector("#caseList");
const caseDetail = document.querySelector("#caseDetail");
const caseResultCount = document.querySelector("#caseResultCount");
const caseDialog = document.querySelector("#caseDialog");
const caseForm = document.querySelector("#caseForm");
const soapDialog = document.querySelector("#soapDialog");
const soapForm = document.querySelector("#soapForm");
const dialog = document.querySelector("#editDialog");
const form = document.querySelector("#pointForm");
const deleteBtn = document.querySelector("#deleteBtn");
const deleteCaseBtn = document.querySelector("#deleteCaseBtn");
const deleteSoapBtn = document.querySelector("#deleteSoapBtn");
const modelCtx = bodyCanvas?.getContext("2d") || null;
let contentMode = localStorage.getItem(CONTENT_MODE_KEY) || "bilingual";
let visibleMapPoints = [];
let modelView = "front";
let directoryRegionGroup = "";
let directoryTopic = "";

const directoryRegionGroups = [
  { id: "head_face", zh: "頭面頸部", en: "Head, Face, Neck", match: /頭|面|頸|項|鼻|眼|耳|眉|口|scalp|head|face|neck|nose|eye|ear/i },
  { id: "chest_abdomen", zh: "胸腹部", en: "Chest & Abdomen", match: /胸|腹|脅|乳|chest|abdomen|thorax|rib/i },
  { id: "back", zh: "背腰骶部", en: "Back, Lumbar, Sacral", match: /背|腰|骶|俞|back|lumbar|sacral/i },
  { id: "upper_limb", zh: "上肢", en: "Upper Limb", match: /手|腕|肘|前臂|臂|肩|upper limb|hand|wrist|elbow|forearm|arm|shoulder/i },
  { id: "lower_limb", zh: "下肢", en: "Lower Limb", match: /足|腿|膝|踝|趾|下肢|lower limb|leg|knee|ankle|foot|toe/i },
  { id: "auricular", zh: "耳穴", en: "Auricular", match: /耳|auricular|ear/i }
];

const directoryTopics = [
  { id: "pain", zh: "疼痛與痺症", en: "Pain", keywords: ["痛", "痺", "pain", "ache", "bi syndrome"] },
  { id: "head_face", zh: "頭面五官", en: "Head & Sense Organs", keywords: ["頭", "面", "目", "鼻", "耳", "咽", "headache", "facial", "eye", "nose", "ear", "throat"] },
  { id: "digestive", zh: "脾胃消化", en: "Digestive", keywords: ["胃", "腹", "便", "瀉", "嘔", "digest", "stomach", "abdominal", "diarrhea", "vomit"] },
  { id: "respiratory", zh: "肺系呼吸", en: "Respiratory", keywords: ["咳", "喘", "肺", "鼻塞", "cough", "wheezing", "lung", "asthma", "nasal"] },
  { id: "fertility_gyn", zh: "婦科與生殖", en: "Fertility & Gynecology", keywords: ["月經", "不孕", "子宮", "帶下", "pregnancy", "fertility", "menstrual", "uterus", "gynecology"] },
  { id: "shen_sleep", zh: "神志睡眠", en: "Shen & Sleep", keywords: ["失眠", "神", "心悸", "焦慮", "sleep", "insomnia", "anxiety", "spirit", "palpitation"] },
  { id: "tonify", zh: "補虛扶正", en: "Tonification", keywords: ["虛", "補", "氣血", "扶正", "tonify", "deficiency", "qi", "blood"] },
  { id: "needs_review", zh: "待校對資料", en: "Needs Review", match: (point) => point.reviewStatus === "placeholder" || point.reviewStatus === "index_only" },
  { id: "tung_index", zh: "董氏奇穴索引", en: "Master Tung Index", match: (point) => String(point.meridian || "").includes("Master Tung") },
  { id: "auricular_index", zh: "耳穴索引", en: "Auricular Index", match: (point) => isAuricularPoint(point) },
  { id: "auricular_gb93_draft", zh: "GB93待校對", en: "GB93 Drafts", match: (point) => /^(HX|AH|SC|TF|TG|AT|CO|LO)\d+/i.test(point.code) && point.reviewStatus !== "source_checked" },
  { id: "missing_english_location", zh: "缺英文定位", en: "Missing English Location", match: (point) => isPendingContent(point.locationEn) },
  { id: "missing_technique", zh: "缺針刺手法", en: "Missing Needling", match: (point) => isMissingTechnique(point) },
  { id: "missing_safety", zh: "缺禁忌安全", en: "Missing Safety", match: (point) => isPendingContent(point.cautions) },
  { id: "missing_indications", zh: "缺主治功效", en: "Missing Indications", match: (point) => isMissingIndications(point) },
  { id: "missing_sources", zh: "缺資料來源", en: "Missing Sources", match: (point) => !(point.sources || []).length },
  { id: "missing_visual", zh: "缺圖像連結", en: "Missing Visual Link", match: (point) => normalizeVisualLinks(point.visualLinks || []).length === 0 }
];

const earAnatomyLabelData = [
  { zh: "耳輪", en: "Helix", x: 248, y: 116 },
  { zh: "耳舟", en: "Scaphoid Fossa", x: 104, y: 168 },
  { zh: "對耳輪", en: "AntiHelix", x: 148, y: 274 },
  { zh: "三角窩", en: "Triangle Fossa", x: 204, y: 174 },
  { zh: "耳甲艇", en: "Superior Concha", x: 170, y: 292 },
  { zh: "耳甲腔", en: "Inferior Concha", x: 176, y: 376 },
  { zh: "耳屏", en: "Tragus", x: 268, y: 344 },
  { zh: "對耳屏", en: "Antitragus", x: 200, y: 432 },
  { zh: "耳垂", en: "Lobe", x: 170, y: 526 },
  { zh: "屏間切跡", en: "Intertragal Notch", x: 238, y: 416 },
  { zh: "屏上切跡", en: "Supratragal Notch", x: 266, y: 290 }
];

const earPointAnchors = {
  "EAR-SM": { x: 205, y: 176 },
  "EAR-SYM": { x: 202, y: 268 },
  "EAR-P0": { x: 176, y: 350 },
  "EAR-END": { x: 222, y: 418 },
  AT4: { x: 204, y: 430 },
  "EAR-ADR": { x: 266, y: 366 },
  "EAR-LUNG": { x: 190, y: 374 },
  "EAR-HEART": { x: 172, y: 386 },
  "EAR-LIVER": { x: 190, y: 318 },
  "EAR-KIDNEY": { x: 176, y: 292 },
  "EAR-SPLEEN": { x: 210, y: 382 },
  "EAR-STOMACH": { x: 152, y: 350 },
  "EAR-LI": { x: 214, y: 392 },
  "EAR-MOUTH": { x: 244, y: 338 },
  "EAR-HUNGER": { x: 272, y: 318 },
  "EAR-OCC": { x: 170, y: 432 },
  "EAR-EYE": { x: 164, y: 504 },
  "EAR-APEX": { x: 158, y: 64 },
  "EAR-CSP": { x: 154, y: 342 },
  "EAR-LSP": { x: 152, y: 276 },
  "EAR-KNEE": { x: 206, y: 208 },
  "EAR-SHOULDER": { x: 116, y: 210 },
  "EAR-UTERUS": { x: 220, y: 214 },
  "EAR-DIA": { x: 166, y: 334 },
  "EAR-BLADDER": { x: 204, y: 292 },
  "EAR-TRACHEA": { x: 224, y: 366 },
  "EAR-THROAT": { x: 260, y: 350 },
  "EAR-EXT-NOSE": { x: 276, y: 324 },
  "EAR-HTN-GROOVE": { x: 302, y: 470 }
};

document.querySelector("#addBtn").addEventListener("click", () => openEditor());
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancelBtn").addEventListener("click", () => dialog.close());
document.querySelector("#exportBtn").addEventListener("click", exportJson);
document.querySelector("#importFile").addEventListener("change", importJson);
document.querySelector("#resetBtn").addEventListener("click", resetStarter);
document.querySelector("#modeBilingualBtn")?.addEventListener("click", () => setContentMode("bilingual"));
document.querySelector("#modeEnglishBtn")?.addEventListener("click", () => setContentMode("english"));
document.querySelector("#homeSearchBtn").addEventListener("click", runHomeSearch);
homeSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runHomeSearch();
});
document.querySelectorAll("[data-directory-topic-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const topic = link.dataset.directoryTopicLink || "";
    if (!topic) return;
    clearPointDetailHash();
    directoryTopic = topic;
    if (patternFilter) patternFilter.value = "";
    if (regionFilter) regionFilter.value = "";
    if (searchInput) searchInput.value = "";
    render();
  });
});
document.querySelector("#newCaseBtn").addEventListener("click", () => openCaseEditor());
document.querySelector("#newSoapBtn").addEventListener("click", () => openSoapEditor());
document.querySelector("#patientNewCaseLink")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  openCaseEditor();
});
document.querySelector("#patientSoapLink")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  openSoapEditor();
});
document.querySelector("#exportCasesBtn").addEventListener("click", exportClinicalCases);
document.querySelector("#importCasesFile").addEventListener("change", importClinicalCases);
document.querySelector("#closeCaseDialog").addEventListener("click", () => caseDialog.close());
document.querySelector("#cancelCaseBtn").addEventListener("click", () => caseDialog.close());
document.querySelector("#closeSoapDialog").addEventListener("click", () => soapDialog.close());
document.querySelector("#cancelSoapBtn").addEventListener("click", () => soapDialog.close());
modelRotate?.addEventListener("input", () => renderMap(getFilteredPoints()));
modelReset?.addEventListener("click", () => {
  modelView = "front";
  updateViewTabs();
  if (modelRotate) modelRotate.value = "0";
  renderMap(getFilteredPoints());
});
viewTabs.forEach((button) => {
  button.addEventListener("click", () => {
    modelView = button.dataset.view;
    if (modelRotate) modelRotate.value = viewDefaultRotation(modelView);
    updateViewTabs();
    renderMap(getFilteredPoints());
  });
});
bodyCanvas?.addEventListener("click", handleModelClick);
form.addEventListener("submit", saveFromForm);
deleteBtn.addEventListener("click", deleteCurrent);
caseForm.addEventListener("submit", saveCaseFromForm);
soapForm.addEventListener("submit", saveSoapFromForm);
deleteCaseBtn.addEventListener("click", deleteCurrentCase);
deleteSoapBtn.addEventListener("click", deleteCurrentSoap);
caseSearch.addEventListener("input", renderClinicalCases);
window.addEventListener("hashchange", handlePointHashChange);

[searchInput, meridianFilter, regionFilter, patternFilter].forEach((el) => {
  el.addEventListener("input", () => {
    if (el === regionFilter) directoryRegionGroup = "";
    if (el === patternFilter) directoryTopic = "";
    render();
  });
});

applyPointHash();
render();

function setContentMode(mode) {
  contentMode = mode;
  localStorage.setItem(CONTENT_MODE_KEY, contentMode);
  updateContentModeUI();
  render();
}

function updateContentModeUI() {
  document.body.dataset.contentMode = contentMode;
  document.querySelector("#modeBilingualBtn")?.classList.toggle("active", contentMode === "bilingual");
  document.querySelector("#modeEnglishBtn")?.classList.toggle("active", contentMode === "english");
}

function loadPoints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultPoints;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? enrichPoints(mergeByCode(defaultPoints, parsed)) : defaultPoints;
  } catch {
    return defaultPoints;
  }
}

function runHomeSearch() {
  const query = homeSearch.value.trim();
  if (!query) return;
  const caseHit = clinicalCases.some((item) => {
    const haystack = [
      item.patientCode,
      item.caseTitle,
      item.chiefComplaint,
      ...item.westernConditions,
      ...item.easternDiseases,
      ...item.tcmPatterns,
      ...item.safetyFlags,
      ...item.soapNotes.flatMap((note) => [
        note.workflowLink,
        note.cyclePhase,
        note.fertilityPhase,
        note.subjective,
        note.objective,
        note.assessment,
        note.plan,
        note.pointsUsed,
        note.formulaHerbs,
        note.westernMeds,
        note.outcomes,
        note.followUp,
        note.technique,
        ...note.westernConditionLinks,
        ...note.easternDiseaseLinks,
        ...note.tcmPatternLinks,
        ...note.safetyFlagLinks,
        ...note.acupointLinks,
        ...note.formulaLinks,
        ...note.medicationLinks,
        ...note.outcomeMetricLinks
      ])
    ].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  if (caseHit) {
    caseSearch.value = query;
    document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
    renderClinicalCases();
    return;
  }
  searchInput.value = query;
  document.querySelector("#acupointDirectory").scrollIntoView({ behavior: "smooth", block: "start" });
  render();
}

function pointHash(code) {
  return `#point/${encodeURIComponent(code)}`;
}

function codeFromPointHash() {
  const match = window.location.hash.match(/^#point\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function applyPointHash() {
  const code = codeFromPointHash();
  if (!code) return false;
  const point = points.find((item) => item.code.toLowerCase() === code.toLowerCase());
  if (!point) return false;
  selectedCode = point.code;
  searchInput.value = point.code;
  if (isAuricularPoint(point)) modelView = "ear";
  return true;
}

function handlePointHashChange() {
  if (isSyncingPointHash) return;
  if (!applyPointHash()) {
    render();
    return;
  }
  render();
  document.querySelector("#acupunctureWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadClinicalCases() {
  const saved = localStorage.getItem(CASE_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeClinicalCase) : [];
  } catch {
    return [];
  }
}

function persistClinicalCases() {
  localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(clinicalCases, null, 2));
}

function defaultCodeList(...groups) {
  return groups.flat().map((point) => point.code).filter(Boolean);
}

function mergeByCode(...groups) {
  return groups.flat().reduce((merged, point) => {
    const index = merged.findIndex((item) => item.code === point.code);
    if (index >= 0) merged[index] = { ...merged[index], ...point };
    else merged.push(point);
    return merged;
  }, []);
}

function enrichPoints(list) {
  return list.map(enrichPoint);
}

function enrichPoint(point) {
  const locationEn = point.locationEn || locationEnglishByCode[point.code] || "";
  const anatomy = normalizeAnatomy(point.anatomy?.length ? point.anatomy : anatomyFromText(point));
  const functionsEn = point.functionsEn || translateFunctionText(point.functions || "");
  const patternsEn = point.patternsEn?.length ? point.patternsEn : (point.patterns || []).map((pattern) => patternEnglishMap[pattern] || "");
  const baseSources = point.sources?.length ? point.sources : sourceByCode[point.code] || [];
  const sources = isAuricularPoint(point) ? [...new Set([...baseSources, ...auricularSupplementSources])] : baseSources;
  const visualLinks = normalizeVisualLinks(point.visualLinks?.length ? point.visualLinks : defaultVisualLinks(point));
  return { ...point, locationEn, anatomy, functionsEn, patternsEn, sources, visualLinks };
}

function defaultVisualLinks(point) {
  if (isAuricularPoint(point)) return auricularPointVisualLinks(point.standardCode || point.code);
  if (String(point.meridian || "").includes("Master Tung")) {
    return tungPointVisualLinks({ name_en: point.nameEn, display_code: point.standardCode || point.code, code: point.code });
  }
  if (isStandardChannelPoint(point)) return standardPointVisualLinks(point.code);
  return (point.sources || []).map((url) => ({
    labelZh: "外部圖像/來源頁",
    labelEn: "External visual/source page",
    url,
    source: safeHostname(url)
  }));
}

function normalizeVisualLinks(links = []) {
  return links
    .map((link) => {
      if (!link) return null;
      if (typeof link === "string") {
        return {
          labelZh: "外部圖像/來源頁",
          labelEn: "External visual/source page",
          url: link,
          source: safeHostname(link)
        };
      }
      return {
        labelZh: String(link.labelZh || link.label || "外部圖像/來源頁"),
        labelEn: String(link.labelEn || link.label || "External visual/source page"),
        url: String(link.url || ""),
        source: String(link.source || safeHostname(link.url || ""))
      };
    })
    .filter((link) => link?.url);
}

function safeHostname(url) {
  try {
    return new URL(url, window.location.href).hostname || "external";
  } catch {
    return "external";
  }
}

function anatomyFromText(point) {
  const text = [point.location, point.locationEn, point.cautions].join(" ");
  return Object.entries(anatomyGlossary)
    .filter(([zh]) => text.includes(zh))
    .map(([zh, en]) => ({ zh, en }));
}

function normalizeAnatomy(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === "string" ? parseAnatomyLine(item) : { zh: String(item.zh || ""), en: String(item.en || "") })
      .filter((item) => item.zh || item.en);
  }
  return splitLines(String(value || "")).map(parseAnatomyLine).filter((item) => item.zh || item.en);
}

function parseAnatomyLine(line) {
  const [zh = "", en = ""] = String(line).split(/[=：:]/);
  return { zh: zh.trim(), en: en.trim() };
}

function translateFunctionText(text) {
  if (!text) return "";
  let translated = text;
  Object.entries(functionEnglishMap).forEach(([zh, en]) => {
    translated = translated.replaceAll(zh, en);
  });
  return translated
    .replaceAll("，", ", ")
    .replaceAll("、", ", ")
    .replaceAll("。", ".")
    .replace(/\s+/g, " ")
    .trim();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points, null, 2));
}

function render() {
  updateContentModeUI();
  hydrateFilters();
  renderOsStatus();
  renderDatabaseHealth();
  renderClinicalCases();
  renderDirectoryFilters();
  const filtered = getFilteredPoints();
  const detailMode = isPointDetailMode();
  if (!filtered.some((point) => point.code === selectedCode)) {
    selectedCode = filtered[0]?.code || points[0]?.code || "";
  }
  renderMap(filtered);
  renderCards(filtered);
  document.body.classList.toggle("point-detail-mode", detailMode);
  if (cardsEl) cardsEl.hidden = detailMode;
  if (detailCard) detailCard.hidden = !detailMode;
  if (detailMode) renderDetail(points.find((point) => point.code === selectedCode));
  else if (detailCard) detailCard.innerHTML = "";
  if (directoryTotalEl) directoryTotalEl.textContent = String(points.length);
  resultCount.textContent = contentMode === "english"
    ? `Showing ${filtered.length} / ${points.length} acupoints`
    : `目前顯示 ${filtered.length} / ${points.length} 個穴位`;
}

function isPointDetailMode() {
  return /^#point\/.+/.test(window.location.hash);
}

function clearPointDetailHash() {
  if (!window.location.hash.startsWith("#point/")) return;
  isSyncingPointHash = true;
  window.location.hash = "#acupointDirectory";
  isSyncingPointHash = false;
}

function renderOsStatus() {
  const audit = getStandardPointAudit();
  const standardCount = audit.presentTotal;
  const missingCount = audit.missingTotal;
  standardCountEl.textContent = String(standardCount);
  missingCountEl.textContent = String(missingCount);
  acupunctureProgressEl.textContent = `${standardCount}/${standardChannelAudit.expectedTotal} 標準經穴`;
  caseCountEl.textContent = String(clinicalCases.length);
  caseProgressEl.textContent = clinicalCases.length ? `${clinicalCases.length} cases / ${clinicalCases.reduce((sum, item) => sum + item.soapNotes.length, 0)} SOAP` : "病例紀錄入口";
}

function renderDatabaseHealth() {
  const audit = getStandardPointAudit();
  const quality = getDataQualityAudit();
  if (auditGeneratedOnEl) auditGeneratedOnEl.textContent = `audit ${standardChannelAudit.generatedOn}`;
  if (healthStandardCountEl) healthStandardCountEl.textContent = `${audit.presentTotal}/${standardChannelAudit.expectedTotal}`;
  if (healthMissingCountEl) healthMissingCountEl.textContent = String(audit.missingTotal);
  if (healthCompletionPercentEl) healthCompletionPercentEl.textContent = `${audit.completionPercent}%`;
  if (healthReviewedStandardEl) healthReviewedStandardEl.textContent = String(quality.reviewedStandard);
  if (healthPlaceholderStandardEl) healthPlaceholderStandardEl.textContent = String(quality.placeholderStandard);
  if (healthTungIndexEl) healthTungIndexEl.textContent = String(quality.tungIndex);
  if (healthAuricularIndexEl) healthAuricularIndexEl.textContent = String(quality.auricular);
  if (healthAuricularGb93CoverageEl) healthAuricularGb93CoverageEl.textContent = `${quality.auricularGb93Indexed}/${quality.auricularGb93Expected}`;
  if (healthGb93WorklistEl) healthGb93WorklistEl.textContent = `${quality.gb93WorklistCount} queued`;
  if (healthVisualCoverageEl) healthVisualCoverageEl.textContent = `${quality.visualLinked}/${quality.total}`;
  if (healthMissingEnglishLocationEl) healthMissingEnglishLocationEl.textContent = String(quality.missingEnglishLocation);
  if (healthMissingTechniqueEl) healthMissingTechniqueEl.textContent = String(quality.missingTechnique);
  if (healthMissingSafetyEl) healthMissingSafetyEl.textContent = String(quality.missingSafety);
  if (healthNextBatchEl) healthNextBatchEl.textContent = `Next batch: ${standardChannelAudit.nextRecommendedBatch}`;
  if (gb93NextBatchTextEl) {
    const preview = auricularGb93NextBatch.slice(0, 12).map((item) => item.candidate_code).join(", ");
    gb93NextBatchTextEl.textContent = preview
      ? `先查證 ${preview}${auricularGb93NextBatch.length > 12 ? " ..." : ""}，確認名稱、耳區、圖源後再升級為 index record。`
      : "目前沒有 GB93 候選清單。";
  }
  if (gb93CandidateGridEl) {
    gb93CandidateGridEl.innerHTML = auricularGb93NextBatch.map((item) => `
      <a href="${escapeAttribute(gb93CandidateUrl(item.candidate_code))}" target="_blank" rel="noreferrer">
        <strong>${escapeHtml(item.candidate_code)}</strong>
        <span>${escapeHtml(item.zone || "GB93")}</span>
      </a>
    `).join("") || `<p>目前沒有 GB93 候選清單。</p>`;
  }
  if (gb93PromotionChecklistEl) {
    const checklist = auricularGb93Worklist.promotion_checklist || [];
    gb93PromotionChecklistEl.innerHTML = checklist.map((item) => `<span>${escapeHtml(formatGb93ChecklistItem(item))}</span>`).join("");
  }
  if (healthNextTaskEl) {
    const next = audit.channels.find((item) => item.missing > 0);
    healthNextTaskEl.textContent = next
      ? `先補 ${next.code} ${next.name}：缺 ${next.missing} / ${next.expected} 個穴位。`
      : "361 標準經穴已完整，下一步改做來源審核與英文 public-ready。";
  }
  if (!healthChannelListEl) return;
  healthChannelListEl.innerHTML = audit.channels.map((item) => {
    const status = item.missing === 0 ? "complete" : item.percent >= 50 ? "partial" : "priority";
    return `
      <article class="health-channel-row ${status}">
        <div>
          <strong>${escapeHtml(item.code)}</strong>
          <span>${escapeHtml(item.name)}</span>
        </div>
        <div class="health-bar" aria-label="${escapeAttribute(item.code)} completion">
          <i style="width: ${item.percent}%"></i>
        </div>
        <small>${item.present}/${item.expected} · missing ${item.missing}</small>
      </article>
    `;
  }).join("");
}

function gb93CandidateUrl(code) {
  return `https://acupun.site/point_list_Ear93GB.aspx?pointId=${encodeURIComponent(String(code || "").toUpperCase())}`;
}

function formatGb93ChecklistItem(item) {
  const labels = {
    code_confirmed: "代碼已確認",
    chinese_name_confirmed: "中文名已確認",
    english_name_or_translation_added: "英文名/翻譯已補",
    auricular_zone_confirmed: "耳區已確認",
    visual_source_url_checked: "圖源 URL 已檢查",
    review_status_kept_index_only_until_clinical_details_are_checked: "臨床細節未查前維持 index_only"
  };
  return labels[item] || item;
}

function getDataQualityAudit() {
  const standard = points.filter(isStandardChannelPoint);
  const visualLinked = points.filter((point) => normalizeVisualLinks(point.visualLinks || []).length > 0).length;
  return {
    total: points.length,
    reviewedStandard: standard.filter((point) => point.reviewStatus !== "placeholder").length,
    placeholderStandard: standard.filter((point) => point.reviewStatus === "placeholder").length,
    tungIndex: points.filter((point) => String(point.meridian || "").includes("Master Tung")).length,
    auricular: points.filter(isAuricularPoint).length,
    auricularGb93Indexed: auricularGb93Records.length,
    auricularGb93Expected: Number(auricularGb93.expected_total || 93),
    gb93WorklistCount: auricularGb93NextBatch.length,
    visualLinked,
    missingEnglishLocation: points.filter((point) => isPendingContent(point.locationEn)).length,
    missingTechnique: points.filter(isMissingTechnique).length,
    missingSafety: points.filter((point) => isPendingContent(point.cautions)).length
  };
}

function getStandardPointAudit() {
  const standardCodes = new Set(points.filter(isReviewedStandardChannelPoint).map((point) => point.code));
  const channels = standardChannelAudit.channels.map((channel) => {
    const present = Array.from(standardCodes).filter((code) => channelCodeFromPointCode(code) === channel.code).length;
    const missing = Math.max(0, channel.expected - present);
    const percent = Math.min(100, Math.round((present / channel.expected) * 100));
    return { ...channel, present, missing, percent };
  });
  const presentTotal = channels.reduce((sum, item) => sum + item.present, 0);
  const missingTotal = Math.max(0, standardChannelAudit.expectedTotal - presentTotal);
  const completionPercent = Math.min(100, Math.round((presentTotal / standardChannelAudit.expectedTotal) * 100));
  return { channels, presentTotal, missingTotal, completionPercent };
}

function channelCodeFromPointCode(code) {
  const match = String(code || "").match(/^[A-Z]+/);
  return match ? match[0] : "";
}

function isStandardChannelPoint(point) {
  return Boolean(channelPrefixMeta[channelCodeFromPointCode(point.code)])
    && !isAuricularPoint(point)
    && !String(point.meridian || "").includes("Extra Point")
    && !String(point.meridian || "").includes("Master Tung")
    && !String(point.code || "").startsWith("EX-");
}

function isReviewedStandardChannelPoint(point) {
  return isStandardChannelPoint(point) && point.reviewStatus !== "placeholder";
}

function hydrateFilters() {
  fillSelect(meridianFilter, "全部經絡", unique(points.map((point) => point.meridian)));
  fillSelect(regionFilter, "全部部位", unique(points.map((point) => point.region)));
  fillSelect(patternFilter, "全部證型", unique(points.flatMap((point) => point.patterns)));
}

function renderDirectoryFilters() {
  renderMeridianCategories();
  renderRegionCategories();
  renderTopicCategories();
}

function renderMeridianCategories() {
  if (!meridianCategoryList) return;
  const meridians = unique(points.map((point) => point.meridian));
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !meridianFilter.value,
      action: "meridian",
      value: ""
    }),
    ...meridians.map((meridian) => directoryButton({
      labelZh: shortMeridianFromText(meridian),
      labelEn: shortMeridianFromText(meridian),
      count: points.filter((point) => point.meridian === meridian).length,
      active: meridianFilter.value === meridian,
      action: "meridian",
      value: meridian
    }))
  ];
  meridianCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(meridianCategoryList);
}

function renderRegionCategories() {
  if (!regionCategoryList) return;
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !directoryRegionGroup,
      action: "regionGroup",
      value: ""
    }),
    ...directoryRegionGroups.map((group) => directoryButton({
      labelZh: group.zh,
      labelEn: group.en,
      count: points.filter((point) => pointMatchesRegionGroup(point, group.id)).length,
      active: directoryRegionGroup === group.id,
      action: "regionGroup",
      value: group.id
    }))
  ];
  regionCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(regionCategoryList);
}

function renderTopicCategories() {
  if (!topicCategoryList) return;
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !directoryTopic,
      action: "topic",
      value: ""
    }),
    ...directoryTopics.map((topic) => directoryButton({
      labelZh: topic.zh,
      labelEn: topic.en,
      count: points.filter((point) => pointMatchesTopic(point, topic.id)).length,
      active: directoryTopic === topic.id,
      action: "topic",
      value: topic.id
    }))
  ];
  topicCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(topicCategoryList);
}

function directoryButton({ labelZh, labelEn, count, active, action, value }) {
  const label = contentMode === "english" ? labelEn : labelZh;
  return `
    <button class="directory-filter-btn ${active ? "active" : ""}" type="button" data-directory-action="${escapeAttribute(action)}" data-directory-value="${escapeAttribute(value)}">
      <span>${escapeHtml(label)}</span>
      <small>${count}</small>
    </button>
  `;
}

function bindDirectoryButtons(scope) {
  scope.querySelectorAll("[data-directory-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.directoryAction;
      const value = button.dataset.directoryValue || "";
      if (action === "meridian") meridianFilter.value = value;
      if (action === "regionGroup") {
        directoryRegionGroup = value;
        regionFilter.value = "";
      }
      if (action === "topic") {
        directoryTopic = value;
        patternFilter.value = "";
      }
      clearPointDetailHash();
      render();
      document.querySelector("#acupunctureWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function shortMeridianFromText(value) {
  return String(value || "").split("/")[0].trim() || (contentMode === "english" ? "Uncategorized" : "未分類");
}

function fillSelect(select, firstLabel, values) {
  const current = select.value;
  select.innerHTML = `<option value="">${firstLabel}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.value = values.includes(current) ? current : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

function getFilteredPoints() {
  const query = searchInput.value.trim().toLowerCase();
  return points.filter((point) => {
    const haystack = [
      point.code,
      point.nameZh,
      point.nameEn,
      point.pinyin,
      point.standardCode,
      point.standardRegion,
      point.standardZone,
      point.meridian,
      point.region,
      point.location,
      point.locationEn,
      point.functions,
      point.functionsEn,
      point.evidence,
      point.cautions,
      point.image,
      ...(point.patterns || []),
      ...(point.patternsEn || []),
      ...(point.aliases || []),
      ...(point.anatomy || []).flatMap((item) => [item.zh, item.en]),
      ...(point.visualLinks || []).flatMap((item) => [item.labelZh, item.labelEn, item.url, item.source]),
      ...(point.sources || [])
    ].join(" ").toLowerCase();

    return (!query || haystack.includes(query))
      && (!meridianFilter.value || point.meridian === meridianFilter.value)
      && (!regionFilter.value || point.region === regionFilter.value)
      && (!patternFilter.value || point.patterns.includes(patternFilter.value))
      && (!directoryRegionGroup || pointMatchesRegionGroup(point, directoryRegionGroup))
      && (!directoryTopic || pointMatchesTopic(point, directoryTopic));
  });
}

function pointMatchesRegionGroup(point, groupId) {
  const group = directoryRegionGroups.find((item) => item.id === groupId);
  if (!group) return true;
  return group.match.test([point.region, point.meridian, point.location, point.locationEn, point.nameZh, point.nameEn, point.code].join(" "));
}

function pointMatchesTopic(point, topicId) {
  const topic = directoryTopics.find((item) => item.id === topicId);
  if (!topic) return true;
  if (topic.match) return topic.match(point);
  const haystack = [
    point.nameZh,
    point.nameEn,
    point.meridian,
    point.region,
    point.location,
    point.locationEn,
    point.functions,
    point.functionsEn,
    point.evidence,
    ...(point.patterns || []),
    ...(point.patternsEn || [])
  ].join(" ").toLowerCase();
  return topic.keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function isPendingContent(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  return /pending|待補|待校對|待依|source review|index-only|placeholder|not yet/i.test(text);
}

function isMissingTechnique(point) {
  return [
    point.techniqueNotes,
    point.needlingDepth,
    point.needlingAngle,
    point.needlingMethod,
    point.tonificationSedation,
    point.moxibustion,
    point.forbiddenActions
  ].every(isPendingContent);
}

function isMissingIndications(point) {
  const functionsMissing = isPendingContent(point.functions) && isPendingContent(point.functionsEn);
  const patternText = [...(point.patterns || []), ...(point.patternsEn || [])].join(" ");
  return functionsMissing || isPendingContent(patternText);
}

function renderMap(filtered) {
  if (!bodyCanvas || !modelStage || !modelLabels || !earAnatomyLabels || !modelCtx) {
    visibleMapPoints = [];
    return;
  }
  modelStage.classList.toggle("use-anatomy-plate", usesAnatomyPlate(modelView));
  modelStage.classList.toggle("use-ear-atlas", modelView === "ear");
  drawBodyModel();
  modelLabels.innerHTML = "";
  earAnatomyLabels.innerHTML = "";
  if (modelView === "ear") renderEarAnatomyLabels();
  visibleMapPoints = filtered
    .map((point) => ({ point, projected: projectPoint(point) }))
    .filter((item) => item.projected.visible);
  visibleMapPoints
    .sort((a, b) => a.projected.depth - b.projected.depth)
    .forEach(({ point, projected }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `model-point ${modelView === "ear" ? "ear-point" : ""} ${point.code === selectedCode ? "active" : ""}`;
      button.innerHTML = modelView === "ear" ? earPointLabel(point) : escapeHtml(point.code);
      button.title = `${point.code} ${point.nameZh} ${point.nameEn}`;
      button.style.left = `${(projected.x / 360) * 100}%`;
      button.style.top = `${(projected.y / 620) * 100}%`;
      button.style.opacity = String(projected.opacity);
      button.style.transform = `translate(-50%, -50%) scale(${projected.scale})`;
      button.dataset.view = modelView;
      button.addEventListener("click", () => selectPoint(point.code));
      modelLabels.append(button);
    });
}

function usesAnatomyPlate(view) {
  return ["front", "back", "head", "limbs"].includes(view);
}

function renderEarAnatomyLabels() {
  earAnatomyLabelData.forEach((label) => {
    const el = document.createElement("span");
    el.className = "ear-region-label";
    el.style.left = `${(label.x / 360) * 100}%`;
    el.style.top = `${(label.y / 620) * 100}%`;
    el.innerHTML = `${escapeHtml(label.zh)}<small>${escapeHtml(label.en)}</small>`;
    earAnatomyLabels.append(el);
  });
}

function updateViewTabs() {
  viewTabs.forEach((button) => button.classList.toggle("active", button.dataset.view === modelView));
}

function viewDefaultRotation(view) {
  return {
    front: "0",
    back: "0",
    side: "30",
    head: "0",
    limbs: "0",
    ear: "0"
  }[view] || "0";
}

function drawBodyModel() {
  const dpr = window.devicePixelRatio || 1;
  const rect = bodyCanvas.getBoundingClientRect();
  const width = Math.max(360, Math.round(rect.width || 360));
  const height = Math.round(width * 620 / 360);
  bodyCanvas.width = width * dpr;
  bodyCanvas.height = height * dpr;
  modelCtx.setTransform(width * dpr / 360, 0, 0, height * dpr / 620, 0, 0);
  modelCtx.clearRect(0, 0, 360, 620);

  const rotation = Number(modelRotate.value) / 34;
  drawAtmosphere(rotation);
  drawShadow();
  if (usesAnatomyPlate(modelView)) {
    drawPlateBackdrop(modelView);
    return;
  }
  if (modelView === "head") {
    drawHeadView(rotation);
    return;
  }
  if (modelView === "ear") {
    drawEarView(rotation);
    return;
  }
  if (modelView === "limbs") {
    drawLimbsView(rotation);
    return;
  }
  if (modelView === "back") {
    drawBackModel(rotation);
    return;
  }
  if (modelView === "side") {
    drawSideModel(rotation);
    return;
  }
  drawFrontModel(rotation);
}

function drawPlateBackdrop(view) {
  modelCtx.save();
  modelCtx.fillStyle = "rgba(255, 255, 255, 0.58)";
  modelCtx.fillRect(0, 0, 360, 620);
  modelCtx.fillStyle = "rgba(19, 60, 59, 0.78)";
  modelCtx.font = "700 13px Microsoft JhengHei, Arial";
  modelCtx.fillText(view === "front" ? "Anterior anatomical reference" : "Posterior anatomical reference", 78, 32);
  modelCtx.restore();
}

function drawFrontModel(rotation) {
  drawLimb(118, 142, 66, 304, 28, 17, rotation, "left-arm");
  drawLimb(242, 142, 294, 304, 28, 17, rotation, "right-arm");
  drawLeg(148, 392, 118, 586, 30, rotation, "left-leg");
  drawLeg(212, 392, 244, 586, 30, rotation, "right-leg");
  drawTorso(rotation);
  drawNeck(rotation);
  drawHead(rotation);
  drawSurfaceLandmarks(rotation);
}

function drawBackModel(rotation) {
  drawLimb(118, 142, 66, 304, 27, 17, -rotation, "left-arm");
  drawLimb(242, 142, 294, 304, 27, 17, -rotation, "right-arm");
  drawLeg(148, 392, 118, 586, 30, -rotation, "left-leg");
  drawLeg(212, 392, 244, 586, 30, -rotation, "right-leg");
  drawBackTorso(rotation);
  drawNeck(rotation);
  drawBackHead(rotation);
  drawBackLandmarks(rotation);
}

function drawSideModel(rotation) {
  const side = Math.sign(Number(modelRotate.value)) || 1;
  modelCtx.save();
  modelCtx.translate(side > 0 ? 10 : -10, 0);
  drawLimb(180 - side * 24, 146, 180 - side * 48, 318, 24, 15, side * 0.9, "left-arm");
  drawLeg(170 - side * 8, 390, 158 - side * 18, 588, 29, side * 0.5, "left-leg");
  drawLeg(198 + side * 7, 390, 216 + side * 16, 586, 25, -side * 0.2, "right-leg");
  drawSideTorso(side);
  drawSideHead(side);
  modelCtx.restore();
}

function drawHeadView(rotation) {
  modelCtx.save();
  modelCtx.translate(0, -5);
  modelCtx.scale(1.08, 1.08);
  const head = modelCtx.createRadialGradient(150 + rotation * 20, 132, 16, 184, 168, 116);
  head.addColorStop(0, "#f8d8c3");
  head.addColorStop(0.58, "#d8956b");
  head.addColorStop(1, "#8f523c");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(166, 150, 74, 94, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(91, 57, 48, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(141, 144, 7, 3, 0, 0, Math.PI * 2);
  modelCtx.ellipse(191, 144, 7, 3, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(95, 56, 43, 0.35)";
  modelCtx.lineWidth = 2;
  modelCtx.beginPath();
  modelCtx.moveTo(166, 154);
  modelCtx.quadraticCurveTo(158, 180, 165, 196);
  modelCtx.stroke();
  modelCtx.beginPath();
  modelCtx.arc(166, 208, 19, 0.1, Math.PI - 0.1);
  modelCtx.stroke();
  modelCtx.restore();

  drawLimb(95, 350, 55, 510, 20, 14, rotation, "left-arm");
  drawLimb(265, 350, 305, 510, 20, 14, rotation, "right-arm");
  drawTorso(rotation * 0.4);
}

function drawLimbsView(rotation) {
  modelCtx.save();
  modelCtx.fillStyle = "rgba(255,255,255,0.35)";
  [[34, 42, 128, 248], [198, 42, 128, 248], [34, 338, 128, 240], [198, 338, 128, 240]].forEach(([x, y, w, h]) => {
    roundedRectPath(x, y, w, h, 18);
    modelCtx.fill();
  });
  modelCtx.restore();

  drawLimb(98, 70, 72, 244, 28, 17, rotation, "left-arm");
  drawLimb(260, 70, 286, 244, 28, 17, -rotation, "right-arm");
  drawLeg(100, 354, 76, 574, 32, rotation, "left-leg");
  drawLeg(254, 354, 284, 574, 32, -rotation, "right-leg");

  modelCtx.fillStyle = "rgba(19, 60, 59, 0.72)";
  modelCtx.font = "700 13px Microsoft JhengHei, Arial";
  modelCtx.fillText("手臂 / Arm", 55, 36);
  modelCtx.fillText("手臂 / Arm", 220, 36);
  modelCtx.fillText("腿足 / Leg & Foot", 50, 330);
  modelCtx.fillText("腿足 / Leg & Foot", 210, 330);
}

function drawEarView(rotation) {
  modelCtx.save();
  modelCtx.translate(0, -4);

  const ear = modelCtx.createRadialGradient(146 + rotation * 18, 112, 16, 188, 306, 258);
  ear.addColorStop(0, "#ffd4e8");
  ear.addColorStop(0.22, "#f5a2c9");
  ear.addColorStop(0.55, "#f58e86");
  ear.addColorStop(0.8, "#bf605b");
  ear.addColorStop(1, "#5c302d");

  modelCtx.shadowColor = "rgba(30, 20, 20, 0.44)";
  modelCtx.shadowBlur = 22;
  modelCtx.shadowOffsetX = 0;
  modelCtx.shadowOffsetY = 16;
  modelCtx.fillStyle = ear;
  modelCtx.beginPath();
  modelCtx.moveTo(188, 44);
  modelCtx.bezierCurveTo(278, 48, 326, 138, 302, 254);
  modelCtx.bezierCurveTo(284, 320, 308, 366, 266, 440);
  modelCtx.bezierCurveTo(228, 506, 240, 562, 176, 574);
  modelCtx.bezierCurveTo(112, 588, 76, 520, 98, 456);
  modelCtx.bezierCurveTo(122, 384, 66, 330, 76, 236);
  modelCtx.bezierCurveTo(88, 128, 116, 42, 188, 44);
  modelCtx.fill();
  modelCtx.shadowColor = "transparent";
  modelCtx.strokeStyle = "rgba(75, 42, 45, 0.62)";
  modelCtx.lineWidth = 2.4;
  modelCtx.stroke();

  drawEarRegion("耳輪\nHelix", [[170, 70], [238, 72], [286, 132], [278, 208], [238, 194], [216, 126], [166, 112]], "#f4a0cf", { labelY: -4, maxWidth: 70 });
  drawEarRegion("耳輪結節\nHelix Tubercle", [[104, 136], [146, 104], [172, 112], [138, 214], [96, 246], [84, 188]], "#ff7777", { maxWidth: 70 });
  drawEarRegion("耳舟\nScaphoid Fossa", [[134, 134], [166, 112], [216, 126], [210, 194], [168, 242], [122, 206]], "#7270c8", { labelY: -2, maxWidth: 72 });
  drawEarRegion("對耳輪上腳\nSuperior AntiHelix Crus", [[170, 122], [214, 128], [248, 182], [204, 184]], "#ffd76d", { maxWidth: 84 });
  drawEarRegion("三角窩\nTriangle Fossa", [[206, 186], [248, 184], [258, 238], [212, 246], [188, 218]], "#ff8180", { maxWidth: 78 });
  drawEarRegion("對耳輪下腳\nInferior AntiHelix Crus", [[180, 222], [258, 238], [242, 274], [178, 270]], "#e6a044", { maxWidth: 92 });
  drawEarRegion("對耳輪\nAntiHelix", [[168, 208], [188, 224], [178, 372], [148, 430], [118, 398], [126, 278]], "#ff7f78", { maxWidth: 76 });
  drawEarRegion("耳甲艇\nSuperior Concha", [[156, 258], [190, 224], [238, 276], [212, 338], [154, 326]], "#635ea8", { maxWidth: 78 });
  drawEarRegion("耳甲腔\nInferior Concha", [[146, 334], [214, 332], [252, 382], [212, 436], [148, 418], [116, 374]], "#ffd064", { maxWidth: 82 });
  drawEarRegion("耳屏\nTragus", [[94, 292], [132, 262], [148, 328], [122, 386], [88, 360]], "#ff8a80", { maxWidth: 60 });
  drawEarRegion("對耳屏\nAntitragus", [[150, 420], [212, 434], [224, 476], [168, 486], [126, 454]], "#f3a4d7", { maxWidth: 74 });
  drawEarRegion("耳垂\nLobe", [[122, 468], [224, 468], [240, 532], [178, 566], [112, 532]], "#ff8179", { maxWidth: 70 });

  drawEarGroove([[132, 126], [110, 206], [104, 286], [114, 366], [136, 430]], "#5a569e");
  drawEarGroove([[184, 292], [220, 300], [246, 330], [244, 374], [218, 412]], "#a35e47");
  drawEarLobeGrid();

  drawEarLeader("耳尖 / Ear apex", 170, 78, 98, 62);
  drawEarLeader("屏上切跡 / Supratragal Notch", 105, 274, 28, 236);
  drawEarLeader("屏間切跡 / Intertragal Notch", 148, 384, 44, 422);
  drawEarLeader("耳廓背面 / Posterior Surface", 258, 424, 306, 476);
  drawEarLeader("AT4 皮質下 / Subcortex", 127, 306, 34, 272);
  modelCtx.restore();
}

function drawEarRegion(label, points, color) {
  const gradient = modelCtx.createLinearGradient(120, 120, 250, 440);
  gradient.addColorStop(0, lighten(color, 0.28));
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, darken(color, 0.22));
  modelCtx.fillStyle = gradient;
  modelCtx.strokeStyle = "rgba(82, 50, 55, 0.5)";
  modelCtx.lineWidth = 1.25;
  modelCtx.beginPath();
  points.forEach(([x, y], index) => index ? modelCtx.lineTo(x, y) : modelCtx.moveTo(x, y));
  modelCtx.closePath();
  modelCtx.save();
  modelCtx.shadowColor = "rgba(55, 30, 36, 0.24)";
  modelCtx.shadowBlur = 8;
  modelCtx.shadowOffsetY = 4;
  modelCtx.fill();
  modelCtx.restore();
  modelCtx.stroke();

  const center = polygonCenter(points);
  const options = arguments[3] || {};
  modelCtx.fillStyle = "rgba(39, 29, 32, 0.9)";
  modelCtx.font = "800 11px Microsoft JhengHei, Arial";
  modelCtx.textAlign = "center";
  label.split("\n").forEach((line, index) => modelCtx.fillText(line, center.x, center.y + (options.labelY || 0) + index * 13, options.maxWidth || 90));
  modelCtx.textAlign = "start";
}

function drawEarGroove(points, color) {
  modelCtx.save();
  modelCtx.strokeStyle = color;
  modelCtx.globalAlpha = 0.62;
  modelCtx.lineWidth = 7;
  modelCtx.lineCap = "round";
  modelCtx.lineJoin = "round";
  modelCtx.beginPath();
  points.forEach(([x, y], index) => index ? modelCtx.lineTo(x, y) : modelCtx.moveTo(x, y));
  modelCtx.stroke();
  modelCtx.globalAlpha = 0.22;
  modelCtx.strokeStyle = "#1f214d";
  modelCtx.lineWidth = 2;
  modelCtx.stroke();
  modelCtx.restore();
}

function drawEarLobeGrid() {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(125, 65, 68, 0.34)";
  modelCtx.lineWidth = 1;
  [[138, 474, 140, 540], [172, 470, 174, 558], [206, 472, 206, 540], [122, 506, 230, 508]].forEach(([x1, y1, x2, y2]) => {
    modelCtx.beginPath();
    modelCtx.moveTo(x1, y1);
    modelCtx.lineTo(x2, y2);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function polygonCenter(points) {
  const sum = points.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function drawEarLeader(text, x1, y1, x2, y2) {
  modelCtx.strokeStyle = "rgba(42, 31, 25, 0.64)";
  modelCtx.lineWidth = 1.2;
  modelCtx.beginPath();
  modelCtx.moveTo(x1, y1);
  modelCtx.lineTo(x2, y2);
  modelCtx.stroke();
  modelCtx.fillStyle = "rgba(30, 26, 22, 0.88)";
  modelCtx.font = "800 12px Microsoft JhengHei, Arial";
  modelCtx.fillText(text, x2, y2 - 4);
}

function lighten(hex, amount) {
  return shadeHex(hex, amount);
}

function darken(hex, amount) {
  return shadeHex(hex, -amount);
}

function shadeHex(hex, amount) {
  const value = hex.replace("#", "");
  const rgb = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const shaded = rgb.map((channel) => Math.max(0, Math.min(255, Math.round(channel + 255 * amount))));
  return `rgb(${shaded.join(",")})`;
}

function drawAtmosphere(rotation) {
  const wash = modelCtx.createLinearGradient(0, 0, 360, 620);
  wash.addColorStop(0, "#f6fbfa");
  wash.addColorStop(0.48, "#e4eef2");
  wash.addColorStop(1, "#f4eee4");
  modelCtx.fillStyle = wash;
  modelCtx.fillRect(0, 0, 360, 620);

  modelCtx.save();
  modelCtx.globalAlpha = 0.2;
  modelCtx.fillStyle = rotation >= 0 ? "#1b7c79" : "#b67828";
  modelCtx.beginPath();
  modelCtx.ellipse(184 + rotation * 24, 300, 118, 255, rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.restore();
}

function drawShadow() {
  const shadow = modelCtx.createRadialGradient(180, 594, 18, 180, 594, 126);
  shadow.addColorStop(0, "rgba(28, 37, 40, 0.26)");
  shadow.addColorStop(1, "rgba(28, 37, 40, 0)");
  modelCtx.fillStyle = shadow;
  modelCtx.beginPath();
  modelCtx.ellipse(180, 594, 118, 19, 0, 0, Math.PI * 2);
  modelCtx.fill();
}

function skinGradient(x0, y0, x1, y1, warm = 0) {
  const gradient = modelCtx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, warm ? "#f1c6a6" : "#f6d1b7");
  gradient.addColorStop(0.5, "#d79269");
  gradient.addColorStop(1, "#9f5e43");
  return gradient;
}

function drawLimb(x1, y1, x2, y2, shoulderWidth, wristWidth, rotation, side) {
  const sideSign = side.startsWith("left") ? -1 : 1;
  const shift = rotation * sideSign * -10;
  modelCtx.save();
  modelCtx.lineCap = "round";
  modelCtx.lineJoin = "round";
  modelCtx.strokeStyle = skinGradient(x1, y1, x2, y2, sideSign > 0);
  modelCtx.lineWidth = shoulderWidth;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 + shift, y1);
  modelCtx.bezierCurveTo(x1 + sideSign * 12 + shift, 182, x2 - sideSign * 13 + shift, 238, x2 + shift, y2);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.24)";
  modelCtx.lineWidth = Math.max(4, wristWidth / 2);
  modelCtx.beginPath();
  modelCtx.moveTo(x1 - sideSign * 5 + shift, y1 + 8);
  modelCtx.bezierCurveTo(x1 + sideSign * 4 + shift, 188, x2 - sideSign * 10 + shift, 240, x2 - sideSign * 4 + shift, y2 - 6);
  modelCtx.stroke();
  drawHand(x2 + shift, y2 + 7, sideSign);
  modelCtx.restore();
}

function drawHand(x, y, sideSign) {
  const gradient = modelCtx.createRadialGradient(x - sideSign * 6, y - 4, 3, x, y, 25);
  gradient.addColorStop(0, "#f7d5bd");
  gradient.addColorStop(1, "#b26f4c");
  modelCtx.fillStyle = gradient;
  modelCtx.beginPath();
  modelCtx.ellipse(x, y, 16, 21, sideSign * 0.18, 0, Math.PI * 2);
  modelCtx.fill();
}

function drawLeg(x1, y1, x2, y2, thighWidth, rotation, side) {
  const sideSign = side.startsWith("left") ? -1 : 1;
  const shift = rotation * sideSign * -7;
  modelCtx.save();
  modelCtx.lineCap = "round";
  modelCtx.strokeStyle = skinGradient(x1, y1, x2, y2, sideSign > 0);
  modelCtx.lineWidth = thighWidth;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 + shift, y1);
  modelCtx.bezierCurveTo(x1 - sideSign * 10 + shift, 456, x2 - sideSign * 4 + shift, 516, x2 + shift, y2);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.22)";
  modelCtx.lineWidth = 7;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 - sideSign * 4 + shift, y1 + 18);
  modelCtx.bezierCurveTo(x1 - sideSign * 14 + shift, 462, x2 - sideSign * 4 + shift, 522, x2 - sideSign * 2 + shift, y2 - 12);
  modelCtx.stroke();

  drawFoot(x2 + shift, y2 + 7, sideSign);
  modelCtx.restore();
}

function drawFoot(x, y, sideSign) {
  modelCtx.fillStyle = skinGradient(x - 22, y - 10, x + 22, y + 10, sideSign > 0);
  modelCtx.beginPath();
  modelCtx.ellipse(x + sideSign * 6, y, 24, 12, sideSign * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
}

function drawTorso(rotation) {
  modelCtx.save();
  const torso = modelCtx.createRadialGradient(158 + rotation * 12, 165, 12, 184, 275, 170);
  torso.addColorStop(0, "#f8d8c1");
  torso.addColorStop(0.42, "#db9a70");
  torso.addColorStop(1, "#95563f");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(128 + rotation * 10, 120);
  modelCtx.bezierCurveTo(150, 98, 210, 98, 232 + rotation * -10, 120);
  modelCtx.bezierCurveTo(254 + rotation * -8, 196, 258 + rotation * -10, 300, 216, 372);
  modelCtx.bezierCurveTo(202, 397, 158, 397, 144, 372);
  modelCtx.bezierCurveTo(102 + rotation * 8, 300, 106 + rotation * 10, 196, 128 + rotation * 10, 120);
  modelCtx.fill();

  modelCtx.strokeStyle = "rgba(101, 61, 45, 0.45)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.25)";
  modelCtx.lineWidth = 3;
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 7, 126);
  modelCtx.bezierCurveTo(171 + rotation * 4, 190, 171 + rotation * 2, 310, 178, 374);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(97, 59, 45, 0.18)";
  modelCtx.lineWidth = 1;
  [178, 205, 234].forEach((y) => {
    modelCtx.beginPath();
    modelCtx.moveTo(136, y);
    modelCtx.bezierCurveTo(158, y + 8, 202, y + 8, 224, y);
    modelCtx.stroke();
  });

  modelCtx.fillStyle = "rgba(90, 48, 37, 0.13)";
  modelCtx.beginPath();
  modelCtx.ellipse(180 + rotation * 5, 302, 44, 74, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.restore();
}

function drawBackTorso(rotation) {
  modelCtx.save();
  const torso = modelCtx.createRadialGradient(198 - rotation * 12, 155, 12, 178, 278, 165);
  torso.addColorStop(0, "#f3c8aa");
  torso.addColorStop(0.5, "#cf875f");
  torso.addColorStop(1, "#8b4d3b");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(126 - rotation * 8, 120);
  modelCtx.bezierCurveTo(150, 100, 210, 100, 234 + rotation * 8, 120);
  modelCtx.bezierCurveTo(252, 198, 252, 306, 214, 374);
  modelCtx.bezierCurveTo(202, 398, 158, 398, 146, 374);
  modelCtx.bezierCurveTo(108, 306, 108, 198, 126 - rotation * 8, 120);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(86, 50, 39, 0.48)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(80, 48, 39, 0.28)";
  modelCtx.lineWidth = 2;
  modelCtx.beginPath();
  modelCtx.moveTo(180, 118);
  modelCtx.bezierCurveTo(176, 190, 176, 292, 180, 382);
  modelCtx.stroke();
  [148, 212].forEach((x) => {
    modelCtx.strokeStyle = "rgba(255,255,255,0.18)";
    modelCtx.beginPath();
    modelCtx.moveTo(x, 140);
    modelCtx.bezierCurveTo(x - 12, 214, x - 8, 306, x + 4, 372);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function drawBackHead(rotation) {
  const head = modelCtx.createRadialGradient(194 - rotation * 8, 44, 8, 180, 64, 54);
  head.addColorStop(0, "#edc3a5");
  head.addColorStop(0.62, "#c87f5c");
  head.addColorStop(1, "#79483b");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 - rotation * 5, 64, 42, 49, -rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(73, 48, 42, 0.2)";
  modelCtx.beginPath();
  modelCtx.ellipse(180, 47, 30, 18, 0, Math.PI, Math.PI * 2);
  modelCtx.fill();
}

function drawBackLandmarks(rotation) {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(47, 76, 76, 0.32)";
  modelCtx.setLineDash([4, 8]);
  modelCtx.beginPath();
  modelCtx.moveTo(180, 105);
  modelCtx.lineTo(180, 420);
  modelCtx.stroke();
  modelCtx.setLineDash([]);
  modelCtx.strokeStyle = "rgba(60, 43, 38, 0.22)";
  [180, 230, 285, 345, 382, 412].forEach((y) => {
    modelCtx.beginPath();
    modelCtx.moveTo(130, y);
    modelCtx.bezierCurveTo(154, y + 5, 206, y + 5, 230, y);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function drawSideTorso(side) {
  const torso = modelCtx.createRadialGradient(170 + side * 18, 170, 10, 180, 272, 150);
  torso.addColorStop(0, "#f5ceb3");
  torso.addColorStop(0.56, "#d28b62");
  torso.addColorStop(1, "#8d4f3c");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(170, 118);
  modelCtx.bezierCurveTo(212 + side * 18, 126, 228 + side * 22, 202, 214 + side * 14, 310);
  modelCtx.bezierCurveTo(206 + side * 8, 368, 170, 392, 150, 362);
  modelCtx.bezierCurveTo(132 - side * 8, 292, 134 - side * 10, 190, 170, 118);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(92, 55, 42, 0.42)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();
}

function drawSideHead(side) {
  const head = modelCtx.createRadialGradient(170 + side * 20, 48, 8, 180, 66, 54);
  head.addColorStop(0, "#f8d6c0");
  head.addColorStop(0.55, "#d48e67");
  head.addColorStop(1, "#8d523f");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 + side * 8, 66, 36, 49, side * 0.12, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(85, 52, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(192 + side * 12, 65, 4, 2.5, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(86, 52, 42, 0.3)";
  modelCtx.beginPath();
  modelCtx.moveTo(200 + side * 12, 70);
  modelCtx.lineTo(211 + side * 13, 79);
  modelCtx.lineTo(199 + side * 11, 84);
  modelCtx.stroke();
}

function drawNeck(rotation) {
  modelCtx.fillStyle = skinGradient(150, 92, 210, 130);
  roundedRectPath(154 + rotation * 5, 92, 52, 54, 18);
  modelCtx.fill();
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  modelCtx.beginPath();
  modelCtx.moveTo(x + r, y);
  modelCtx.lineTo(x + width - r, y);
  modelCtx.quadraticCurveTo(x + width, y, x + width, y + r);
  modelCtx.lineTo(x + width, y + height - r);
  modelCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  modelCtx.lineTo(x + r, y + height);
  modelCtx.quadraticCurveTo(x, y + height, x, y + height - r);
  modelCtx.lineTo(x, y + r);
  modelCtx.quadraticCurveTo(x, y, x + r, y);
  modelCtx.closePath();
}

function drawHead(rotation) {
  modelCtx.save();
  const head = modelCtx.createRadialGradient(164 + rotation * 10, 45, 8, 184, 64, 54);
  head.addColorStop(0, "#f8d7c0");
  head.addColorStop(0.56, "#d89369");
  head.addColorStop(1, "#9c5a41");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 + rotation * 8, 64, 42, 49, rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();

  modelCtx.fillStyle = "rgba(78, 51, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(166 + rotation * 12, 62, 4, 2, 0, 0, Math.PI * 2);
  modelCtx.ellipse(194 + rotation * 12, 62, 4, 2, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(88, 52, 42, 0.22)";
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 10, 66);
  modelCtx.lineTo(176 + rotation * 10, 82);
  modelCtx.stroke();
  modelCtx.restore();
}

function drawSurfaceLandmarks(rotation) {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(54, 86, 85, 0.24)";
  modelCtx.setLineDash([5, 7]);
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 5, 105);
  modelCtx.lineTo(180 + rotation * 2, 372);
  modelCtx.stroke();
  modelCtx.setLineDash([]);

  modelCtx.strokeStyle = "rgba(95, 58, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.moveTo(138, 134);
  modelCtx.bezierCurveTo(160, 150, 200, 150, 222, 134);
  modelCtx.stroke();
  modelCtx.restore();
}

function projectPoint(point) {
  if (isAuricularPoint(point) && modelView !== "ear") {
    return { x: Number(point.x), y: Number(point.y), depth: -100, scale: 0.7, opacity: 0, visible: false };
  }
  if (modelView === "ear") return projectEarPoint(point);
  if (modelView === "head") return projectHeadPoint(point);
  if (modelView === "limbs") return projectLimbPoint(point);
  if (modelView === "back") return projectBackPoint(point);
  if (modelView === "side") return projectSidePoint(point);
  if (modelView === "front") return projectAnatomyPlateFront(point);

  const rotation = Number(modelRotate.value) * Math.PI / 180;
  const x = Number(point.x);
  const y = Number(point.y);
  const centerX = 180;
  const dx = x - centerX;
  const depthHint = getDepthHint(point);
  const projectedX = centerX + dx * Math.cos(rotation) + depthHint * Math.sin(rotation);
  const projectedY = y + Math.abs(Math.sin(rotation)) * Math.min(18, Math.abs(dx) * 0.06);
  const depth = depthHint * Math.cos(rotation) - dx * Math.sin(rotation);
  const scale = Math.max(0.78, Math.min(1.18, 1 + depth / 420));
  const opacity = Math.max(0.5, Math.min(1, 0.86 + depth / 520));
  return { x: projectedX, y: projectedY, depth, scale, opacity, visible: true };
}

function projectAnatomyPlateFront(point) {
  const x = 248 + (Number(point.x) - 180) * 0.43;
  const y = 84 + Number(point.y) * 0.67;
  return {
    x: Math.max(186, Math.min(326, x)),
    y: Math.max(44, Math.min(500, y)),
    depth: getDepthHint(point),
    scale: isBackPoint(point) ? 0.82 : 1.02,
    opacity: isBackPoint(point) ? 0.42 : 0.96,
    visible: true
  };
}

function projectEarPoint(point) {
  if (!isAuricularPoint(point)) {
    return { x: Number(point.x), y: Number(point.y), depth: -100, scale: 0.7, opacity: 0, visible: false };
  }
  const anchor = earPointAnchors[point.code] || { x: Number(point.x), y: Number(point.y) };
  return {
    x: anchor.x,
    y: anchor.y,
    depth: 60,
    scale: point.code === selectedCode ? 1.16 : 1,
    opacity: 1,
    visible: true
  };
}

function isAuricularPoint(point) {
  return point.meridian === "Auricular / 耳穴"
    || point.region === "耳穴"
    || point.code.startsWith("EAR-")
    || /^(HX|AH|SC|TF|TG|AT|CO|LO)\d+/i.test(point.code);
}

function projectBackPoint(point) {
  const backLike = isBackPoint(point);
  const x = 108 + (180 - Number(point.x)) * 0.43;
  const y = 84 + Number(point.y) * 0.67;
  return {
    x: Math.max(34, Math.min(174, x)),
    y: Math.max(44, Math.min(500, y)),
    depth: backLike ? 42 : -28,
    scale: backLike ? 1.08 : 0.84,
    opacity: backLike ? 1 : 0.42,
    visible: backLike || /頭|頸|肩|腿|膝|踝|足/.test(point.region)
  };
}

function projectSidePoint(point) {
  const side = Math.sign(Number(modelRotate.value)) || 1;
  const x = Number(point.x);
  const y = Number(point.y);
  const lateral = Math.abs(x - 180);
  const sideBias = Math.sign(x - 180 || side);
  const depth = getDepthHint(point);
  const visibleSide = sideBias === side || /CV|GV|頭|頸|胸|腹|背|腰|骶/.test(`${point.code} ${point.region}`);
  return {
    x: 180 + side * (Math.min(72, lateral * 0.46) + depth * 0.18),
    y: y + (isBackPoint(point) ? -4 : 0),
    depth,
    scale: visibleSide ? 1.02 : 0.78,
    opacity: visibleSide ? 0.96 : 0.34,
    visible: true
  };
}

function projectHeadPoint(point) {
  const text = `${point.region} ${point.nameZh} ${point.code}`;
  const isHead = /頭|面|鼻|眉|眼|頸|GB20|GV20|GV26|EX-HN/.test(text);
  if (!isHead) {
    return { x: Number(point.x), y: Number(point.y), depth: -80, scale: 0.72, opacity: 0, visible: false };
  }
  const projected = isBackPoint(point) ? projectBackPoint(point) : projectAnatomyPlateFront(point);
  return { ...projected, scale: 1.14, opacity: 1, visible: true };
}

function projectLimbPoint(point) {
  const region = point.region || "";
  if (/手|腕|肘|前臂|肩|臂|腿|膝|足|踝|小腿|大腿/.test(region)) {
    const projected = isBackPoint(point) ? projectBackPoint(point) : projectAnatomyPlateFront(point);
    return { ...projected, scale: 1.1, opacity: 1, visible: true };
  }
  return {
    x: Number(point.x),
    y: Number(point.y),
    depth: -70,
    scale: 0.72,
    opacity: 0,
    visible: false
  };
}

function frontBackMirror(point, backLike) {
  const x = Number(point.x);
  return {
    x: backLike ? 360 - x : x,
    y: Number(point.y)
  };
}

function isBackPoint(point) {
  return /背|腰|骶|俞|BL|GV14|GV20|GB20|BL10/.test(`${point.region} ${point.nameZh} ${point.code}`);
}

function getDepthHint(point) {
  if (/背|俞|腰|骶|BL/.test(`${point.region} ${point.nameZh} ${point.code}`)) return -44;
  if (/胸|腹|CV|中脘|氣海|關元|膻中/.test(`${point.region} ${point.nameZh} ${point.code}`)) return 34;
  if (/頭|面|鼻|眉/.test(`${point.region} ${point.nameZh}`)) return 24;
  if (/手|腕|肘|前臂|肩/.test(point.region)) return Math.sign(Number(point.x) - 180 || 1) * 28;
  if (/腿|膝|足|踝/.test(point.region)) return Math.sign(Number(point.x) - 180 || 1) * 18;
  return 0;
}

function handleModelClick(event) {
  if (!bodyCanvas) return;
  const rect = bodyCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * 360 / rect.width;
  const y = (event.clientY - rect.top) * 620 / rect.height;
  const closest = visibleMapPoints
    .map((item) => ({ ...item, distance: Math.hypot(item.projected.x - x, item.projected.y - y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (closest && closest.distance < 20) selectPoint(closest.point.code);
}

function renderCards(filtered) {
  cardsEl.innerHTML = "";
  filtered.forEach((point) => {
    const card = document.createElement("article");
    card.className = `card ${point.code === selectedCode ? "active" : ""}`;
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="card-head">
        <div>
          <h3>${escapeHtml(pointTitle(point))}</h3>
          <p>${escapeHtml(pointSubtitle(point))}</p>
        </div>
        <span class="code-pill">${point.code}</span>
      </div>
      <p>${escapeHtml(contentMode === "english" ? (point.locationEn || point.location) : point.location)}</p>
      <div class="tag-row">${cardTags(point).map(tag).join("")}</div>
    `;
    card.addEventListener("click", () => selectPoint(point.code));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") selectPoint(point.code);
    });
    cardsEl.append(card);
  });
}

function pointTitle(point) {
  return contentMode === "english" ? `${point.nameEn} (${point.code})` : `${point.nameZh} ${point.nameEn}`;
}

function pointSubtitle(point) {
  return contentMode === "english" ? `${point.pinyin} · ${shortMeridianEn(point)}` : `${point.pinyin} · ${point.meridian}`;
}

function cardTags(point) {
  if (contentMode === "english") return [regionEn(point), ...(point.patternsEn || [])].filter(Boolean).slice(0, 3);
  return (point.patterns || []).slice(0, 3);
}

function renderDetail(point) {
  if (!point) {
    detailCard.innerHTML = `<div class="empty-detail">沒有符合條件的穴位。可以調整搜尋，或新增一筆資料。</div>`;
    if (selectedCodeEl) selectedCodeEl.textContent = "無選取";
    return;
  }
  if (selectedCodeEl) selectedCodeEl.textContent = `${point.code} ${point.nameZh}`;
  const related = relatedPoints(point);
  const pairings = commonPairings(point);
  const moxaText = point.moxibustion || inferMoxaText(point);
  const sourceLinks = externalPointLinks(point);
  detailCard.innerHTML = `
    <nav class="point-breadcrumb" aria-label="breadcrumb">${escapeHtml(breadcrumbText(point))}</nav>
    <div class="point-page-toolbar">
      <button class="ghost" type="button" id="backToDirectoryBtn">${contentMode === "english" ? "Back to acupoint list" : "返回穴位列表"}</button>
      <span>${escapeHtml(point.code)} ${escapeHtml(contentMode === "english" ? point.nameEn : point.nameZh)}</span>
    </div>
    <div class="point-study-layout">
      <main class="point-article">
        <section class="point-hero-card">
          <div class="hero-watermark">${escapeHtml((contentMode === "english" ? point.nameEn : point.nameZh).slice(0, 1))}</div>
          <div class="point-hero-top">
            <div>
              <div class="hero-badges">
                <span>${escapeHtml(contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point))}</span>
                <span>${escapeHtml(point.code)}</span>
              </div>
              <h2>${escapeHtml(contentMode === "english" ? point.nameEn : point.nameZh)}</h2>
              <p>${escapeHtml(heroSubtitle(point))}</p>
            </div>
            <div class="hero-actions">
              ${sourceLinks.map((link) => `<a class="${escapeAttribute(link.kind)}" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
              <button class="hero-copy-btn" type="button" id="copyPointLinkBtn">${contentMode === "english" ? "Copy page link" : "複製分頁連結"}</button>
              <button class="hero-edit-btn" type="button" id="editBtn">${contentMode === "english" ? "Edit" : "編輯資料"}</button>
            </div>
          </div>
          <div class="hero-fact-grid">
            ${heroFact(contentMode === "english" ? "Channel" : "所屬經絡", contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point), point.code)}
            ${heroFact(contentMode === "english" ? "Region" : "身體部位", contentMode === "english" ? regionEn(point) : (point.region || "未分類"), contentMode === "english" ? (point.locationEn || point.location) : point.location)}
            ${heroFact(contentMode === "english" ? "Needling" : "針刺/手法", shortTechnique(point), contentMode === "english" ? "Verify with professional sources and clinical training" : "依專業來源與臨床訓練判斷")}
            ${heroFact(contentMode === "english" ? "Moxibustion" : "艾灸", contentMode === "english" ? moxaTextEn(moxaText) : moxaText, contentMode === "english" ? "Based on presentation and contraindications" : (point.cautions || "依體質與病勢判斷"))}
          </div>
        </section>

        ${studySection(contentMode === "english" ? "Overview" : "基本介紹", pointIntro(point))}
        ${studySection(contentMode === "english" ? "Point Location" : "取穴方法", pointLocationArticle(point), "location")}
        ${visualLinksSection(point)}
        ${studySection(contentMode === "english" ? "Indications" : "主治病症", indicationArticle(point), "target")}
        ${pairingSection(pairings)}
        ${studySection(contentMode === "english" ? "Needling and Moxibustion" : "針刺與艾灸", needlingArticle(point), "needle")}
        ${studySection(contentMode === "english" ? "Clinical Notes and Evidence" : "現代研究 / 臨床提醒", evidenceText(point), "research")}
        ${studySection(contentMode === "english" ? "Cautions" : "注意事項", cautionText(point), "warning")}
        ${studySection(contentMode === "english" ? "Sources" : "參考來源", formatSources(point.sources), "sources")}
      </main>

      <aside class="point-sidebar" aria-label="相關穴道與常用配穴">
        <section class="sidebar-box">
          <h3>${contentMode === "english" ? "Related Points" : "相關穴道"}</h3>
          ${related.map((item) => `<button type="button" data-related-point="${escapeAttribute(item.code)}"><strong>${escapeHtml(contentMode === "english" ? item.nameEn : item.nameZh)}</strong><span>${escapeHtml(item.code)}</span></button>`).join("") || `<p>${contentMode === "english" ? "No related points yet." : "尚未建立相關穴道。"}</p>`}
        </section>
        <section class="sidebar-box">
          <h3>${contentMode === "english" ? "Common Pairings" : "常用配穴"}</h3>
          ${pairings.map((item) => `<button type="button" data-related-point="${escapeAttribute(item.code)}"><strong>${escapeHtml(contentMode === "english" ? item.nameEn : item.nameZh)}</strong><span>${escapeHtml(sharedPatternLabel(point, item))}</span></button>`).join("") || `<p>${contentMode === "english" ? "Pairings pending." : "待補常用配穴。"}</p>`}
        </section>
      </aside>
    </div>
  `;
  document.querySelector("#backToDirectoryBtn")?.addEventListener("click", () => {
    isSyncingPointHash = true;
    window.location.hash = "#acupointDirectory";
    isSyncingPointHash = false;
    render();
    document.querySelector("#acupointDirectory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#editBtn").addEventListener("click", () => openEditor(point));
  document.querySelector("#copyPointLinkBtn")?.addEventListener("click", () => copyPointLink(point));
  detailCard.querySelectorAll("[data-related-point]").forEach((button) => {
    button.addEventListener("click", () => selectPoint(button.dataset.relatedPoint));
  });
}

function heroFact(title, value, detail) {
  return `
    <article>
      <span>${escapeHtml(title)}</span>
      <strong>${escapeHtml(value || "待補")}</strong>
      <small>${escapeHtml(detail || "")}</small>
    </article>
  `;
}

function copyPointLink(point) {
  const url = `${window.location.origin}${window.location.pathname}${pointHash(point.code)}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      const button = document.querySelector("#copyPointLinkBtn");
      if (!button) return;
      const original = button.textContent;
      button.textContent = contentMode === "english" ? "Copied" : "已複製";
      setTimeout(() => { button.textContent = original; }, 1200);
    }).catch(() => alert(url));
    return;
  }
  alert(url);
}

function studySection(title, body, tone = "book") {
  return `
    <section class="study-section ${escapeAttribute(tone)}">
      <h3>${escapeHtml(sectionIcon(tone))} ${escapeHtml(title)}</h3>
      <div class="study-copy">${formatStudyText(body)}</div>
    </section>
  `;
}

function visualLinksSection(point) {
  const links = normalizeVisualLinks(point.visualLinks || []);
  const title = contentMode === "english" ? "Visual References" : "圖像參考";
  if (!links.length) return studySection(title, contentMode === "english" ? "No visual reference links yet." : "尚未建立外部圖像連結。", "visual");
  return `
    <section class="study-section visual">
      <h3>${escapeHtml(sectionIcon("visual"))} ${escapeHtml(title)}</h3>
      <div class="visual-link-grid">
        ${links.map((link) => `
          <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(contentMode === "english" ? link.labelEn : link.labelZh)}</strong>
            <span>${escapeHtml(link.source || safeHostname(link.url))}</span>
          </a>
        `).join("")}
      </div>
      <p class="visual-note">${contentMode === "english"
        ? "External diagrams open in a new tab. Use them as visual references and verify against professional sources before clinical use."
        : "外部圖會在新分頁開啟。先作定位參考，臨床使用仍要對照專業教材與安全規範。"}</p>
    </section>
  `;
}

function pairingSection(pairings) {
  const title = contentMode === "english" ? "Common Pairings" : "常用配穴";
  if (!pairings.length) return studySection(title, contentMode === "english" ? "Pairings are pending professional source review." : "待依臨床來源補入常用配穴、功效與適應證。", "link");
  return `
    <section class="study-section link">
      <h3>${escapeHtml(sectionIcon("link"))} ${escapeHtml(title)}</h3>
      <div class="pairing-table" role="table" aria-label="${escapeAttribute(title)}">
        <div class="pairing-row head" role="row"><span>${contentMode === "english" ? "Point" : "配穴"}</span><span>${contentMode === "english" ? "Possible Use" : "可能用途"}</span><span>${contentMode === "english" ? "Linked Pattern" : "連結證型"}</span></div>
        ${pairings.map((item) => `
          <button class="pairing-row" type="button" data-related-point="${escapeAttribute(item.code)}" role="row">
            <span>${escapeHtml(contentMode === "english" ? item.nameEn : item.nameZh)} ${escapeHtml(item.code)}</span>
            <span>${escapeHtml(contentMode === "english" ? primaryFunctionEn(item) : primaryFunction(item))}</span>
            <span>${escapeHtml(sharedPatternLabel(points.find((p) => p.code === selectedCode) || item, item))}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function tag(text) {
  return `<span class="tag">${escapeHtml(text)}</span>`;
}

function shortMeridian(point) {
  return String(point.meridian || "").split("/")[0].trim() || "未分類";
}

function shortMeridianEn(point) {
  return String(point.meridian || "").split("/")[0].trim() || "Uncategorized";
}

function regionEn(point) {
  const text = `${point.region || ""} ${point.locationEn || ""} ${point.location || ""}`;
  if (/head|face|scalp|eye|nose|頭|面|鼻|眼|眉|項|頸/i.test(text)) return "Head and face";
  if (/chest|abdomen|thorax|腹|胸/i.test(text)) return "Chest and abdomen";
  if (/back|lumbar|sacral|背|腰|骶/i.test(text)) return "Back";
  if (/hand|wrist|elbow|forearm|arm|shoulder|手|腕|肘|臂|肩/i.test(text)) return "Upper limb";
  if (/leg|knee|ankle|foot|lower limb|腿|膝|踝|足|下肢/i.test(text)) return "Lower limb";
  if (/ear|auricular|耳/i.test(text)) return "Auricular";
  return "Body region";
}

function breadcrumbText(point) {
  return contentMode === "english"
    ? `Home > Acupoints > ${shortMeridianEn(point)} > ${point.nameEn}`
    : `首頁 › 穴道 › ${shortMeridian(point)} › ${point.nameZh}`;
}

function heroSubtitle(point) {
  if (contentMode === "english") return `${point.pinyin} · ${point.code} · ${primaryFunctionEn(point)}`;
  return `${point.pinyin} · ${point.nameEn} · ${primaryFunction(point)}`;
}

function externalPointLinks(point) {
  const sources = point.sources || [];
  const visualLinks = normalizeVisualLinks(point.visualLinks || []);
  if (isAuricularPoint(point)) {
    const primary = visualLinks[0]?.url || sources[0] || "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95";
    return contentMode === "english"
      ? [{ label: "Visual source", url: primary, kind: "english" }]
      : [{ label: "耳穴圖源", url: primary, kind: "english" }];
  }
  if (String(point.meridian || "").includes("Master Tung")) {
    const primary = visualLinks[0]?.url || sources[0] || "https://www.mastertungacupuncture.org/";
    return contentMode === "english"
      ? [{ label: "eLotus source", url: primary, kind: "english" }]
      : [{ label: "董氏圖源", url: primary, kind: "english" }];
  }
  const english = sources.find((source) => source.includes("acupoints.org")) || `https://www.acupoints.org/${String(point.code).toLowerCase()}-acupuncture-point/`;
  const chinese = sources.find((source) => source.includes("cloudtcm.com")) || "https://cloudtcm.com/acupoint";
  if (contentMode === "english") {
    return [
      { label: "English source", url: english, kind: "english" },
      { label: "Source policy", url: "#sourceSection", kind: "chinese" }
    ];
  }
  return [
    { label: "英文來源", url: english, kind: "english" },
    { label: "中文來源", url: chinese, kind: "chinese" }
  ];
}

function primaryFunction(point) {
  return String(point.functions || point.functionsEn || "待補功效").split(/[，,。.\n]/)[0].trim();
}

function primaryFunctionEn(point) {
  return String(point.functionsEn || point.functions || "Actions pending").split(/[，,。.\n]/)[0].trim();
}

function shortTechnique(point) {
  const text = formatTechniqueNotes(point);
  const depth = String(point.needlingDepth || "").trim();
  if (depth) return depth;
  const match = text.match(/(?:平刺|直刺|斜刺|oblique|transverse|perpendicular)[^。\n；;]*/i);
  return match ? match[0] : "待補";
}

function inferMoxaText(point) {
  const caution = `${point.cautions || ""} ${point.techniqueNotes || ""}`;
  if (/禁灸|不宜灸|moxa contraindicated/i.test(caution)) return "不建議";
  if (/艾灸|moxa/i.test(caution)) return "依證適用";
  return "待補";
}

function moxaTextEn(text) {
  if (/不建議|禁|contra/i.test(text)) return "Not recommended";
  if (/適用|moxa/i.test(text)) return "As indicated";
  return "Pending";
}

function pointIntro(point) {
  if (contentMode === "english") {
    return `${point.nameEn} (${point.pinyin}; ${point.code}) belongs to the ${shortMeridianEn(point)}. It is located in the ${regionEn(point).toLowerCase()} region.\n\nActions: ${point.functionsEn || "Actions pending professional source review."}\n\nThis public English draft should be reviewed against WHO-style location standards, professional textbooks, and English clinical safety sources before publication.`;
  }
  return `${point.nameZh} (${point.pinyin}; ${point.nameEn}) 屬於 ${shortMeridian(point)}，位置在${point.region || "未分類部位"}。${point.functions || "本穴功效待補。"}\n\n臨床學習時可同時對照中文主治、英文定位、解剖名詞與針刺安全提醒。`;
}

function pointLocationArticle(point) {
  if (contentMode === "english") {
    return [
      `Standard location draft: ${point.locationEn || "English location pending."}`,
      `Code and region:\n${formatStandardMeta(point)}`,
      `Anatomy terms:\n${formatAnatomy(point.anatomy, "english")}`
    ].filter(Boolean).join("\n\n");
  }
  return [
    `標準定位：${point.location || "待補中文定位。"}`,
    point.locationEn ? `English location: ${point.locationEn}` : "English location: pending.",
    formatStandardMeta(point),
    `解剖對照：${formatAnatomy(point.anatomy)}`
  ].filter(Boolean).join("\n\n");
}

function indicationArticle(point) {
  if (contentMode === "english") {
    const patterns = (point.patternsEn || []).filter(Boolean).join("\n") || "Indications pending.";
    return [
      point.functionsEn ? `Actions: ${point.functionsEn}` : "",
      `Common indications / patterns:\n${patterns}`
    ].filter(Boolean).join("\n\n");
  }
  const patterns = bilingualPatterns(point) || "待補主治病症。";
  return [
    point.functions ? `功效：${point.functions}` : "",
    point.functionsEn ? `Actions: ${point.functionsEn}` : "",
    `常見主治 / Patterns:\n${patterns}`
  ].filter(Boolean).join("\n\n");
}

function needlingArticle(point) {
  if (contentMode === "english") {
    return [
      formatTechniqueNotes(point),
      point.cautions ? `Safety note: ${point.cautions}` : "",
      "Needling depth, angle, reinforcing/reducing method, and moxibustion should be verified against professional training, anatomy, patient presentation, and contraindications."
    ].filter(Boolean).join("\n\n");
  }
  return [
    formatTechniqueNotes(point),
    point.cautions ? `安全提醒：${point.cautions}` : "",
    "實際針刺深度、角度、補瀉與艾灸需依專業教材、解剖安全、體質、病勢與臨床訓練判斷。"
  ].filter(Boolean).join("\n\n");
}

function evidenceText(point) {
  if (contentMode === "english") return point.evidence || "Clinical and evidence notes are pending. Add study type, evidence strength, and safety limitations before public use.";
  return point.evidence || "目前先保留為臨床學習提醒；後續會逐穴補入研究摘要、證據等級與 NCCAOM high-yield 重點。";
}

function cautionText(point) {
  if (contentMode === "english") return point.cautions || "No specific cautions entered yet. Clinical use requires professional training, anatomy-based safety assessment, and patient-specific contraindication screening.";
  return point.cautions || "無特別標註。實際操作仍需依專業訓練、解剖安全、患者體質與禁忌判斷。";
}

function relatedPoints(point) {
  return points
    .filter((item) => item.code !== point.code && shortMeridian(item) === shortMeridian(point))
    .slice(0, 5);
}

function commonPairings(point) {
  const pointPatterns = new Set([...(point.patterns || []), ...(point.patternsEn || [])].map((item) => String(item).toLowerCase()));
  return points
    .filter((item) => item.code !== point.code)
    .map((item) => {
      const shared = [...(item.patterns || []), ...(item.patternsEn || [])].filter((pattern) => pointPatterns.has(String(pattern).toLowerCase()));
      return { ...item, sharedCount: shared.length };
    })
    .filter((item) => item.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 4);
}

function sharedPatternLabel(point, item) {
  const pointPatterns = new Set([...(point.patterns || []), ...(point.patternsEn || [])].map((pattern) => String(pattern).toLowerCase()));
  const source = contentMode === "english" ? (item.patternsEn || []) : (item.patterns || []);
  const shared = source.find((pattern) => pointPatterns.has(String(pattern).toLowerCase()));
  return shared || (contentMode === "english" ? "Similar indications" : "同經/相近主治");
}

function sectionIcon(tone) {
  const icons = contentMode === "english" ? {
    book: "Overview",
    location: "Location",
    target: "Indications",
    link: "Pairings",
    visual: "Images",
    needle: "Needling",
    research: "Evidence",
    warning: "Cautions",
    sources: "Sources"
  } : {
    book: "基本介紹",
    location: "取穴方法",
    target: "主治病症",
    link: "常用配穴",
    visual: "圖像參考",
    needle: "針刺與艾灸",
    research: "現代研究",
    warning: "注意事項",
    sources: "參考來源"
  };
  return icons[tone] || "內容";
}

function formatStudyText(text) {
  return String(text || "待補")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function earPointLabel(point) {
  return `
    <span class="ear-code">${escapeHtml(point.standardCode || point.code)}</span>
    <span>${escapeHtml(point.nameZh)}</span>
    <small>${escapeHtml(point.nameEn)}</small>
  `;
}

function infoBlock(title, text) {
  return `<section class="info-block"><h3>${title}</h3><p>${escapeHtml(text)}</p></section>`;
}

function bilingualText(zh, en) {
  return [zh, en].filter(Boolean).join("\n");
}

function bilingualPatterns(point) {
  return (point.patterns || []).map((pattern, index) => {
    const en = point.patternsEn?.[index] || patternEnglishMap[pattern] || "";
    return en ? `${pattern} = ${en}` : pattern;
  }).join("\n");
}

function formatTechniqueNotes(point) {
  if (point.techniqueNotes) return point.techniqueNotes;
  const rows = [
    point.needlingDepth ? `針刺深度 Depth: ${point.needlingDepth}` : "",
    point.needlingAngle ? `角度/方向 Angle: ${point.needlingAngle}` : "",
    point.needlingMethod ? `手法/得氣 Technique: ${point.needlingMethod}` : "",
    point.tonificationSedation ? `補瀉 Tonification/Sedation: ${point.tonificationSedation}` : "",
    point.moxibustion ? `艾灸 Moxibustion: ${point.moxibustion}` : "",
    point.forbiddenActions ? `禁忌 Forbidden: ${point.forbiddenActions}` : ""
  ].filter(Boolean);
  if (rows.length) return rows.join("\n");
  return contentMode === "english"
    ? "Needling details pending professional source review; include depth, angle/direction, technique, moxibustion, and contraindications."
    : "待逐穴依專業來源補入；包含針刺深度、角度/方向、補瀉、艾灸與禁忌。";
}

function formatAnatomy(anatomy = [], mode = contentMode) {
  if (!anatomy.length) return mode === "english" ? "Not yet annotated" : "尚未標註";
  if (mode === "english") return anatomy.map((item) => item.en || item.zh).filter(Boolean).join("\n");
  return anatomy.map((item) => `${item.zh} = ${item.en}`).join("\n");
}

function formatSources(sources = []) {
  if (!sources.length) return contentMode === "english" ? "Sources pending" : "尚未標註";
  const visibleSources = contentMode === "english"
    ? sources.filter((source) => !source.includes("cloudtcm.com") && !source.includes("a-hospital.com"))
    : sources;
  const rows = visibleSources.map((source) => {
    if (source.includes("acupoints.org")) return `English source: ${source}`;
    if (source.includes("cloudtcm.com")) return `中文來源: ${source}`;
    if (source.includes("who.int") || source.toLowerCase().includes("who")) return `Core standard: ${source}`;
    return `Reference: ${source}`;
  });
  if (contentMode === "english") rows.push("Public source rule: verify against WHO-style standards, professional textbooks, NCCAOM/NCCIH where relevant, and peer-reviewed evidence before publishing.");
  return rows.join("\n");
}

function formatStandardMeta(point) {
  return [
    `Code: ${point.standardCode || point.code}`,
    point.standardRegion ? `Region: ${point.standardRegion}` : "",
    point.standardZone ? `Zone: ${point.standardZone}` : ""
  ].filter(Boolean).join("\n");
}

function normalizeClinicalCase(value) {
  return {
    id: String(value.id || createId("case")),
    patientCode: String(value.patientCode || ""),
    caseTitle: String(value.caseTitle || ""),
    caseCategory: String(value.caseCategory || ""),
    status: String(value.status || "active"),
    startDate: String(value.startDate || ""),
    birthYear: value.birthYear ? Number(value.birthYear) : "",
    chiefComplaint: String(value.chiefComplaint || ""),
    westernConditions: Array.isArray(value.westernConditions) ? value.westernConditions.map(String) : splitList(String(value.westernConditions || "")),
    easternDiseases: Array.isArray(value.easternDiseases) ? value.easternDiseases.map(String) : splitList(String(value.easternDiseases || "")),
    tcmPatterns: Array.isArray(value.tcmPatterns) ? value.tcmPatterns.map(String) : splitList(String(value.tcmPatterns || "")),
    safetyFlags: Array.isArray(value.safetyFlags) ? value.safetyFlags.map(String) : splitList(String(value.safetyFlags || "")),
    summary: String(value.summary || ""),
    soapNotes: Array.isArray(value.soapNotes) ? value.soapNotes.map(normalizeSoapNote) : [],
    createdAt: String(value.createdAt || new Date().toISOString()),
    updatedAt: String(value.updatedAt || new Date().toISOString())
  };
}

function normalizeSoapNote(value) {
  return {
    id: String(value.id || createId("soap")),
    visitDate: String(value.visitDate || ""),
    visitNumber: value.visitNumber ? Number(value.visitNumber) : "",
    cycleDay: value.cycleDay ? Number(value.cycleDay) : "",
    fertilityPhase: String(value.fertilityPhase || ""),
    workflowLink: String(value.workflowLink || ""),
    cyclePhase: String(value.cyclePhase || ""),
    westernConditionLinks: normalizeStringList(value.westernConditionLinks),
    easternDiseaseLinks: normalizeStringList(value.easternDiseaseLinks),
    tcmPatternLinks: normalizeStringList(value.tcmPatternLinks),
    safetyFlagLinks: normalizeStringList(value.safetyFlagLinks),
    subjective: String(value.subjective || ""),
    objective: String(value.objective || ""),
    assessment: String(value.assessment || ""),
    plan: String(value.plan || ""),
    pointsUsed: String(value.pointsUsed || ""),
    acupointLinks: normalizeStringList(value.acupointLinks),
    retentionMinutes: value.retentionMinutes ? Number(value.retentionMinutes) : "",
    technique: String(value.technique || ""),
    formulaHerbs: String(value.formulaHerbs || ""),
    formulaLinks: normalizeStringList(value.formulaLinks),
    westernMeds: String(value.westernMeds || ""),
    medicationLinks: normalizeStringList(value.medicationLinks),
    outcomes: String(value.outcomes || ""),
    outcomeMetricLinks: normalizeStringList(value.outcomeMetricLinks),
    followUp: String(value.followUp || ""),
    createdAt: String(value.createdAt || new Date().toISOString()),
    updatedAt: String(value.updatedAt || new Date().toISOString())
  };
}

function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return splitList(String(value || ""));
}

function formatNoteList(value, fallback = "未連結") {
  const list = normalizeStringList(value);
  return list.length ? list.join("、") : fallback;
}

function createId(prefix) {
  return `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
}

function renderClinicalCases() {
  const filtered = getFilteredClinicalCases();
  if (selectedCaseId && !clinicalCases.some((item) => item.id === selectedCaseId)) selectedCaseId = clinicalCases[0]?.id || "";
  if (!selectedCaseId && filtered.length) selectedCaseId = filtered[0].id;
  caseResultCount.textContent = `${filtered.length} cases`;
  caseList.innerHTML = "";

  if (!filtered.length) {
    caseList.innerHTML = `<div class="case-empty">尚未有病例。<br>先用 patient_code 建立第一筆。</div>`;
  } else {
    filtered.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `case-list-item ${item.id === selectedCaseId ? "active" : ""}`;
      button.innerHTML = `
        <span>${escapeHtml(item.patientCode || "No code")}</span>
        <strong>${escapeHtml(item.caseTitle || "Untitled case")}</strong>
        <small>${escapeHtml([item.caseCategory, item.status, `${item.soapNotes.length} SOAP`].filter(Boolean).join(" · "))}</small>
      `;
      button.addEventListener("click", () => {
        selectedCaseId = item.id;
        renderClinicalCases();
      });
      caseList.append(button);
    });
  }

  renderClinicalCaseDetail(clinicalCases.find((item) => item.id === selectedCaseId));
}

function getFilteredClinicalCases() {
  const query = caseSearch.value.trim().toLowerCase();
  if (!query) return clinicalCases;
  return clinicalCases.filter((item) => {
    const haystack = [
      item.patientCode,
      item.caseTitle,
      item.caseCategory,
      item.status,
      item.chiefComplaint,
      item.summary,
      ...item.westernConditions,
      ...item.easternDiseases,
      ...item.tcmPatterns,
      ...item.safetyFlags,
      ...item.soapNotes.flatMap((note) => [
        note.workflowLink,
        note.cyclePhase,
        note.fertilityPhase,
        note.subjective,
        note.objective,
        note.assessment,
        note.plan,
        note.pointsUsed,
        note.formulaHerbs,
        note.westernMeds,
        note.outcomes,
        note.followUp,
        note.technique,
        ...note.westernConditionLinks,
        ...note.easternDiseaseLinks,
        ...note.tcmPatternLinks,
        ...note.safetyFlagLinks,
        ...note.acupointLinks,
        ...note.formulaLinks,
        ...note.medicationLinks,
        ...note.outcomeMetricLinks
      ])
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderClinicalCaseDetail(item) {
  if (!item) {
    caseDetail.innerHTML = `
      <div class="case-empty">
        <div>
          <strong>Clinical Case Notebook</strong>
          <p>新增病例後，這裡會顯示 SOAP 時間線、用穴、方藥、西藥與 outcome。</p>
        </div>
      </div>
    `;
    return;
  }

  const notes = [...item.soapNotes].sort((a, b) => {
    const dateCompare = String(b.visitDate || "").localeCompare(String(a.visitDate || ""));
    if (dateCompare) return dateCompare;
    return Number(b.visitNumber || 0) - Number(a.visitNumber || 0);
  });

  caseDetail.innerHTML = `
    <div class="case-detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(item.patientCode || "Patient")}</p>
        <h3>${escapeHtml(item.caseTitle || "Untitled case")}</h3>
        <div class="case-meta">${escapeHtml([item.caseCategory, item.status, item.startDate].filter(Boolean).join(" · "))}</div>
      </div>
      <div class="case-actions">
        <button class="ghost" type="button" id="editCaseInline">編輯病例</button>
        <button type="button" id="addSoapInline">新增 SOAP</button>
      </div>
    </div>
    <div class="clinical-mini-grid">
      <div><small>Chief complaint</small><span>${escapeHtml(item.chiefComplaint || "尚未填寫")}</span></div>
      <div><small>Western</small><span>${escapeHtml(item.westernConditions.join("、") || "尚未連結")}</span></div>
      <div><small>TCM Patterns</small><span>${escapeHtml(item.tcmPatterns.join("、") || "尚未辨證")}</span></div>
    </div>
    ${renderCaseTags(item)}
    <div class="timeline-head">
      <strong>SOAP Timeline</strong>
      <small class="timeline-date">${notes.length} notes</small>
    </div>
    <div class="soap-timeline">
      ${notes.length ? notes.map(renderSoapNoteCard).join("") : `<div class="case-empty">尚未有 SOAP note。點「新增 SOAP」開始第一診。</div>`}
    </div>
  `;

  document.querySelector("#editCaseInline").addEventListener("click", () => openCaseEditor(item));
  document.querySelector("#addSoapInline").addEventListener("click", () => openSoapEditor());
  caseDetail.querySelectorAll("[data-edit-soap]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = item.soapNotes.find((entry) => entry.id === button.dataset.editSoap);
      openSoapEditor(note);
    });
  });
}

function renderCaseTags(item) {
  const tags = [
    ...item.easternDiseases.map((value) => `中醫病名 ${value}`),
    ...item.safetyFlags.map((value) => `Safety ${value}`)
  ];
  return tags.length ? `<div class="case-tags">${tags.map((tag) => `<span class="case-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : "";
}

function renderSoapNoteCard(note) {
  const title = note.visitNumber ? `Visit ${note.visitNumber}` : "SOAP Note";
  const linkedRecords = [
    ...note.acupointLinks,
    ...note.formulaLinks,
    ...note.medicationLinks,
    ...note.outcomeMetricLinks
  ];
  return `
    <article class="soap-note">
      <div class="timeline-head">
        <h4>${escapeHtml(title)}</h4>
        <div class="case-actions">
          <small class="timeline-date">${escapeHtml([note.visitDate, note.fertilityPhase, note.cyclePhase, note.workflowLink, note.cycleDay ? `CD${note.cycleDay}` : ""].filter(Boolean).join(" · "))}</small>
          <button class="ghost" type="button" data-edit-soap="${escapeAttribute(note.id)}">編輯</button>
        </div>
      </div>
      <div class="soap-grid">
        ${soapBlock("S", note.subjective)}
        ${soapBlock("O", note.objective)}
        ${soapBlock("A", note.assessment)}
        ${soapBlock("P", note.plan)}
      </div>
      <div class="clinical-mini-grid">
        <div><small>Points</small><span>${escapeHtml(note.pointsUsed || "未填")}</span></div>
        <div><small>Formula / Herbs</small><span>${escapeHtml(note.formulaHerbs || "未填")}</span></div>
        <div><small>Outcomes</small><span>${escapeHtml(note.outcomes || "未填")}</span></div>
      </div>
      <div class="soap-link-grid">
        <div><small>Western links</small><span>${escapeHtml(formatNoteList(note.westernConditionLinks))}</span></div>
        <div><small>TCM disease links</small><span>${escapeHtml(formatNoteList(note.easternDiseaseLinks))}</span></div>
        <div><small>Pattern links</small><span>${escapeHtml(formatNoteList(note.tcmPatternLinks))}</span></div>
        <div><small>Safety links</small><span>${escapeHtml(formatNoteList(note.safetyFlagLinks))}</span></div>
        <div class="wide"><small>Treatment record links</small><span>${escapeHtml(formatNoteList(linkedRecords))}</span></div>
      </div>
    </article>
  `;
}

function soapBlock(label, text) {
  return `<div class="soap-block"><strong>${label}</strong><p>${escapeHtml(text || "未填寫")}</p></div>`;
}

function selectPoint(code) {
  selectedCode = code;
  const selected = points.find((point) => point.code === code);
  if (selected && isAuricularPoint(selected)) {
    modelView = "ear";
    updateViewTabs();
  }
  if (selected && window.location.hash !== pointHash(selected.code)) {
    isSyncingPointHash = true;
    window.location.hash = pointHash(selected.code);
    isSyncingPointHash = false;
  }
  render();
  detailCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openCaseEditor(item = null) {
  editingCaseId = item?.id || null;
  document.querySelector("#caseDialogTitle").textContent = item ? `編輯 ${item.patientCode}` : "新增病例";
  deleteCaseBtn.hidden = !item;
  const fallback = {
    patientCode: `P-${new Date().getFullYear()}-${String(clinicalCases.length + 1).padStart(3, "0")}`,
    caseTitle: "",
    caseCategory: "",
    status: "active",
    startDate: new Date().toISOString().slice(0, 10),
    birthYear: "",
    chiefComplaint: "",
    westernConditions: [],
    easternDiseases: [],
    tcmPatterns: [],
    safetyFlags: [],
    summary: ""
  };
  const data = { ...fallback, ...(item || {}) };
  Object.entries(data).forEach(([key, value]) => {
    if (!caseForm.elements[key]) return;
    caseForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  caseDialog.showModal();
}

function saveCaseFromForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(caseForm).entries());
  const now = new Date().toISOString();
  const current = clinicalCases.find((item) => item.id === editingCaseId);
  const nextCase = normalizeClinicalCase({
    ...(current || {}),
    id: current?.id || createId("case"),
    patientCode: data.patientCode.trim(),
    caseTitle: data.caseTitle.trim(),
    caseCategory: data.caseCategory.trim(),
    status: data.status,
    startDate: data.startDate,
    birthYear: data.birthYear,
    chiefComplaint: data.chiefComplaint.trim(),
    westernConditions: splitList(data.westernConditions),
    easternDiseases: splitList(data.easternDiseases),
    tcmPatterns: splitList(data.tcmPatterns),
    safetyFlags: splitList(data.safetyFlags),
    summary: data.summary.trim(),
    createdAt: current?.createdAt || now,
    updatedAt: now,
    soapNotes: current?.soapNotes || []
  });

  if (!nextCase.patientCode || !nextCase.caseTitle) {
    alert("Patient code 和 Case title 必填。");
    return;
  }

  const duplicate = clinicalCases.find((item) => item.patientCode === nextCase.patientCode && item.id !== editingCaseId);
  if (duplicate) {
    alert("這個 patient code 已存在，請改用不同代碼。");
    return;
  }

  if (editingCaseId) {
    clinicalCases = clinicalCases.map((item) => item.id === editingCaseId ? nextCase : item);
  } else {
    clinicalCases = [nextCase, ...clinicalCases];
  }
  selectedCaseId = nextCase.id;
  persistClinicalCases();
  caseDialog.close();
  render();
}

function deleteCurrentCase() {
  if (!editingCaseId) return;
  const item = clinicalCases.find((entry) => entry.id === editingCaseId);
  if (!confirm(`確定刪除 ${item?.patientCode || "這筆病例"}？此動作會刪除其 SOAP notes。`)) return;
  clinicalCases = clinicalCases.filter((entry) => entry.id !== editingCaseId);
  selectedCaseId = clinicalCases[0]?.id || "";
  persistClinicalCases();
  caseDialog.close();
  render();
}

function openSoapEditor(note = null) {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) {
    alert("請先新增或選擇一筆病例。");
    return;
  }
  editingSoapId = note?.id || null;
  document.querySelector("#soapDialogTitle").textContent = note ? "編輯 SOAP Note" : `新增 SOAP - ${activeCase.patientCode}`;
  deleteSoapBtn.hidden = !note;
  const fallback = {
    visitDate: new Date().toISOString().slice(0, 10),
    visitNumber: activeCase.soapNotes.length + 1,
    cycleDay: "",
    fertilityPhase: "",
    workflowLink: "",
    cyclePhase: "",
    westernConditionLinks: [],
    easternDiseaseLinks: [],
    tcmPatternLinks: [],
    safetyFlagLinks: [],
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    pointsUsed: "",
    acupointLinks: [],
    retentionMinutes: "",
    technique: "",
    formulaHerbs: "",
    formulaLinks: [],
    westernMeds: "",
    medicationLinks: [],
    outcomes: "",
    outcomeMetricLinks: [],
    followUp: ""
  };
  const data = { ...fallback, ...(note || {}) };
  Object.entries(data).forEach(([key, value]) => {
    if (!soapForm.elements[key]) return;
    soapForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  soapDialog.showModal();
}

function saveSoapFromForm(event) {
  event.preventDefault();
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) return;
  const data = Object.fromEntries(new FormData(soapForm).entries());
  const current = activeCase.soapNotes.find((note) => note.id === editingSoapId);
  const now = new Date().toISOString();
  const nextNote = normalizeSoapNote({
    ...(current || {}),
    id: current?.id || createId("soap"),
    visitDate: data.visitDate,
    visitNumber: data.visitNumber,
    cycleDay: data.cycleDay,
    fertilityPhase: data.fertilityPhase.trim(),
    workflowLink: data.workflowLink.trim(),
    cyclePhase: data.cyclePhase.trim(),
    westernConditionLinks: splitList(data.westernConditionLinks),
    easternDiseaseLinks: splitList(data.easternDiseaseLinks),
    tcmPatternLinks: splitList(data.tcmPatternLinks),
    safetyFlagLinks: splitList(data.safetyFlagLinks),
    subjective: data.subjective.trim(),
    objective: data.objective.trim(),
    assessment: data.assessment.trim(),
    plan: data.plan.trim(),
    pointsUsed: data.pointsUsed.trim(),
    acupointLinks: splitList(data.acupointLinks),
    retentionMinutes: data.retentionMinutes,
    technique: data.technique.trim(),
    formulaHerbs: data.formulaHerbs.trim(),
    formulaLinks: splitList(data.formulaLinks),
    westernMeds: data.westernMeds.trim(),
    medicationLinks: splitList(data.medicationLinks),
    outcomes: data.outcomes.trim(),
    outcomeMetricLinks: splitList(data.outcomeMetricLinks),
    followUp: data.followUp.trim(),
    createdAt: current?.createdAt || now,
    updatedAt: now
  });

  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    const notes = editingSoapId
      ? item.soapNotes.map((entry) => entry.id === editingSoapId ? nextNote : entry)
      : [...item.soapNotes, nextNote];
    return { ...item, soapNotes: notes, updatedAt: now };
  });
  persistClinicalCases();
  soapDialog.close();
  render();
}

function deleteCurrentSoap() {
  if (!editingSoapId) return;
  if (!confirm("確定刪除這筆 SOAP note？")) return;
  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    return { ...item, soapNotes: item.soapNotes.filter((note) => note.id !== editingSoapId), updatedAt: new Date().toISOString() };
  });
  persistClinicalCases();
  soapDialog.close();
  render();
}

function exportClinicalCases() {
  const blob = new Blob([JSON.stringify(clinicalCases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acuting-clinical-cases-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importClinicalCases(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Clinical cases JSON must be an array");
      clinicalCases = imported.map(normalizeClinicalCase);
      selectedCaseId = clinicalCases[0]?.id || "";
      persistClinicalCases();
      render();
    } catch {
      alert("匯入失敗：請確認 JSON 是 AcuTing Clinical Cases 陣列格式。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function openEditor(point = null) {
  editingCode = point?.code || null;
  document.querySelector("#dialogTitle").textContent = point ? `編輯 ${point.code}` : "新增穴位";
  deleteBtn.hidden = !point;
  const fallback = {
    code: "",
    standardCode: "",
    standardRegion: "",
    standardZone: "",
    nameZh: "",
    nameEn: "",
    pinyin: "",
    aliases: [],
    meridian: "",
    region: "",
    location: "",
    locationEn: "",
    anatomy: [],
    functions: "",
    functionsEn: "",
    patterns: [],
    patternsEn: [],
    evidence: "",
    techniqueNotes: "",
    needlingDepth: "",
    needlingAngle: "",
    needlingMethod: "",
    tonificationSedation: "",
    moxibustion: "",
    forbiddenActions: "",
    image: "",
    visualLinks: [],
    sources: [],
    cautions: "",
    x: 180,
    y: 310
  };
  const data = { ...fallback, ...(point || {}) };
  const hasLegacyTechnique = ["needlingDepth", "needlingAngle", "needlingMethod", "tonificationSedation", "moxibustion", "forbiddenActions"]
    .some((key) => data[key]);
  if (!data.techniqueNotes && hasLegacyTechnique) data.techniqueNotes = formatTechniqueNotes(data);
  Object.entries(data).forEach(([key, value]) => {
    if (!form.elements[key]) return;
    if (key === "anatomy") form.elements[key].value = formatAnatomy(value);
    else if (key === "visualLinks") form.elements[key].value = normalizeVisualLinks(value).map((item) => item.url).join("\n");
    else if (key === "sources") form.elements[key].value = value.join("\n");
    else form.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  dialog.showModal();
}

function saveFromForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const nextPoint = {
    code: data.code.trim().toUpperCase(),
    standardCode: data.standardCode.trim(),
    standardRegion: data.standardRegion.trim(),
    standardZone: data.standardZone.trim(),
    nameZh: data.nameZh.trim(),
    nameEn: data.nameEn.trim(),
    pinyin: data.pinyin.trim(),
    aliases: splitList(data.aliases || ""),
    meridian: data.meridian.trim(),
    region: data.region.trim(),
    location: data.location.trim(),
    locationEn: data.locationEn.trim(),
    anatomy: normalizeAnatomy(data.anatomy),
    functions: data.functions.trim(),
    functionsEn: data.functionsEn.trim(),
    patterns: splitList(data.patterns),
    patternsEn: splitList(data.patternsEn),
    evidence: data.evidence.trim(),
    techniqueNotes: data.techniqueNotes.trim(),
    needlingDepth: (data.needlingDepth || "").trim(),
    needlingAngle: (data.needlingAngle || "").trim(),
    needlingMethod: (data.needlingMethod || "").trim(),
    tonificationSedation: (data.tonificationSedation || "").trim(),
    moxibustion: (data.moxibustion || "").trim(),
    forbiddenActions: (data.forbiddenActions || "").trim(),
    image: String(data.image || "").trim(),
    visualLinks: splitLines(data.visualLinks),
    sources: splitLines(data.sources),
    cautions: data.cautions.trim(),
    x: Number(data.x),
    y: Number(data.y)
  };

  const duplicate = points.find((point) => point.code === nextPoint.code && point.code !== editingCode);
  if (duplicate) {
    alert("這個代碼已存在，請改用不同代碼。");
    return;
  }

  if (editingCode) {
    points = points.map((point) => (point.code === editingCode ? nextPoint : point));
  } else {
    points = [...points, nextPoint];
  }
  selectedCode = nextPoint.code;
  persist();
  dialog.close();
  render();
}

function splitList(text) {
  return text.split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
}

function splitLines(text) {
  return String(text || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function deleteCurrent() {
  if (!editingCode) return;
  if (!confirm(`確定刪除 ${editingCode}？`)) return;
  points = points.filter((point) => point.code !== editingCode);
  selectedCode = points[0]?.code || "";
  persist();
  dialog.close();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(points, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acupoint-atlas-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Not an array");
      points = enrichPoints(imported.map(normalizePoint));
      selectedCode = points[0]?.code || "";
      persist();
      render();
    } catch {
      alert("匯入失敗：請確認 JSON 是穴位陣列格式。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function normalizePoint(point) {
  return {
    code: String(point.code || "").toUpperCase(),
    standardCode: String(point.standardCode || ""),
    standardRegion: String(point.standardRegion || ""),
    standardZone: String(point.standardZone || ""),
    nameZh: String(point.nameZh || ""),
    nameEn: String(point.nameEn || ""),
    pinyin: String(point.pinyin || ""),
    aliases: Array.isArray(point.aliases) ? point.aliases.map(String) : splitList(String(point.aliases || "")),
    meridian: String(point.meridian || ""),
    region: String(point.region || ""),
    location: String(point.location || ""),
    locationEn: String(point.locationEn || ""),
    anatomy: normalizeAnatomy(point.anatomy || []),
    functions: String(point.functions || ""),
    functionsEn: String(point.functionsEn || ""),
    patterns: Array.isArray(point.patterns) ? point.patterns.map(String) : splitList(String(point.patterns || "")),
    patternsEn: Array.isArray(point.patternsEn) ? point.patternsEn.map(String) : splitList(String(point.patternsEn || "")),
    evidence: String(point.evidence || ""),
    techniqueNotes: String(point.techniqueNotes || ""),
    needlingDepth: String(point.needlingDepth || ""),
    needlingAngle: String(point.needlingAngle || ""),
    needlingMethod: String(point.needlingMethod || ""),
    tonificationSedation: String(point.tonificationSedation || ""),
    moxibustion: String(point.moxibustion || ""),
    forbiddenActions: String(point.forbiddenActions || ""),
    image: String(point.image || ""),
    visualLinks: normalizeVisualLinks(point.visualLinks || []),
    sources: Array.isArray(point.sources) ? point.sources.map(String) : splitLines(String(point.sources || "")),
    cautions: String(point.cautions || ""),
    x: Number(point.x || 180),
    y: Number(point.y || 310)
  };
}

function resetStarter() {
  if (!confirm("確定還原範例資料？目前瀏覽器內儲存的修改會被覆蓋。")) return;
  points = defaultPoints;
  selectedCode = points[0].code;
  persist();
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}


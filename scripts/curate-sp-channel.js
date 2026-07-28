#!/usr/bin/env node
/**
 * SP channel (足太陰脾經, 21 points) to the four-layer card.
 *
 * Same shape as the LU/LI/ST passes. English is read from the parser output
 * (scripts/parse-channel-curriculum.py), never retyped — retyping is where
 * transcription errors come from. This file supplies only what the parser
 * cannot: the 中文 layer, the 特定穴 identity, point-specific safety, and the
 * exam pearls.
 *
 * Short tags (action_tags/disease_tags) are NOT touched — ACUPOINT_CARD_TEMPLATE
 * §0 and §2. Antigravity's are good and they are a different layer from the
 * content fields. combine_points_zh / clinical_pearls / modern_research_zh are
 * not touched either (Ting: 配穴不能刪掉).
 *
 * ── Two deliberate departures from "照抄不改寫", both asserted ──
 *
 * 1. EN_SPLIT — the parser splits a column on the • glyph, and in a handful of
 *    cells the glyph is lost to the column wrap, gluing two bullets into one
 *    string ("Tonifies Spleen Resolves dampness & damp-heat"). The true line
 *    breaks are visible in the .md extraction of the same PDF, which is what
 *    these splits restore. Each split is asserted to actually be present, so a
 *    re-parse that fixes the glue makes this script fail loudly rather than
 *    silently double-splitting.
 *
 * 2. EN_MERGE — A6 caps functions_zh at 8 while SP6 has 13 curriculum bullets.
 *    Related bullets are joined with "and" into one line on BOTH sides, so the
 *    中/英 rows still pair 1:1 (A4). This is the ST36 precedent. Nothing is
 *    dropped: every merged line still contains every source bullet's words,
 *    which the word-containment assertion below checks.
 *
 * Safety carried from the curriculum that the records lack:
 *   SP6  — contraindicated during pregnancy (課件明列)
 *   SP12 — lateral to the pulsating external iliac artery (課件 Avoid Artery)
 *   SP16 — may fall on the costal margin; 課件 gives three handlings
 *   SP17–SP21 — intercostal, oblique only; perpendicular deep needling risks
 *          pneumothorax
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const EXTRACT = process.env.SP_EXTRACT
  || "/tmp/claude-0/-home-user-acuting-os/c6ef3721-b074-5b4d-9d76-c08fe682c015/scratchpad/sp.json";
const APPLY = process.argv.includes("--apply");
const SRC = "curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf";

// ── Parser repairs: [code, field, glued string, split point] ─────────────────
const EN_SPLIT = [
  ["SP3", "functions", "Tonifies Spleen Resolves dampness & damp-heat", "Tonifies Spleen"],
  ["SP3", "indications", "Gastric pain Abdominal distention", "Gastric pain"],
  ["SP4", "functions", "Harmonizes Middle Jiao Regulates Qi", "Harmonizes Middle Jiao"],
  ["SP4", "indications", "Vomiting Abdominal pain & distention", "Vomiting"],
  ["SP9", "functions", "Resolves dampness Opens & moves water passages", "Resolves dampness"],
  ["SP9", "indications", "Diarrhea, dysentery, edema Jaundice, hepatitis (damp heat)", "Diarrhea, dysentery, edema"],
  ["SP10", "functions", "Dispels blood stasis Cools blood (used often for this)", "Dispels blood stasis"],
  ["SP12", "functions", "Drains damp Clears heat", "Drains damp"],
  ["SP16", "indications", "Abdominal pain Indigestion", "Abdominal pain"],
  ["SP18", "indications", "Fullness & pain in chest & hypochondrium Cough, hiccough", "Fullness & pain in chest & hypochondrium"]
];

// Cells the column wrap mangled beyond a clean split. The replacement is the
// text as it reads in the .md extraction of the same page — quoted, not
// rewritten.
const EN_REPLACE = {
  SP17: { functions: ["Dissipates accumulation of food & fluid", "Promotes digestion"] },
  SP18: { functions: ["Regulates & descends Qi (Stomach & Lung Qi)", "Benefits breasts & promotes lactation"] }
};

// A6: condense to ≤8 by joining related bullets on both sides.
const EN_MERGE = {
  SP6: {
    functions: [
      ["Tonifies Spleen & Stomach"],
      ["Resolves dampness"],
      ["Harmonizes Liver", "Tonifies Kidneys"],
      ["Regulates menstruation", "Induces labor"],
      ["Harmonizes Lower Jiao", "Regulates urination", "Benefits genitals"],
      ["Calms spirit"],
      ["Invigorates blood"],
      ["Activates channel", "Alleviates pain"]
    ],
    indications: [
      ["Abdominal pain & distention", "Borborygmus, diarrhea"],
      ["Dysmenorrhea (painful menses)", "Irregular menstruation", "Uterine bleeding"],
      ["Morbid leucorrhea (vaginal disch.)", "Uterine prolapse", "Sterility", "Delayed labor"],
      ["Nocturnal emission, impotence"],
      ["Enuresis (involuntary urination, esp. by children at night)", "Dysuria (Painful, difficult urination)"],
      ["Edema, Hernia", "Pain in external genitalia"],
      ["Muscular atrophy", "Motor impairment", "Paralysis/pain of lower extremities"],
      ["Headache", "Dizziness/vertigo", "Insomnia"]
    ]
  },
  SP9: {
    indications: [
      ["Abdominal pain & distention"],
      ["Diarrhea, dysentery, edema"],
      ["Jaundice, hepatitis (damp heat)"],
      ["Dysuria, enuresis (involuntary urination), urine incontinence"],
      ["Pain in external genitalia", "Dysmenorrhea"],
      ["Knee pain (especially medial)"],
      ["Damp Bi"],
      ["Chronic yeast infections, candida"]
    ]
  }
};

// ── 中文 layer. Index for index against the English above; asserted, not trusted.
const ZH = {
  SP1: {
    fn: ["止血", "調理脾氣", "寬胸", "寧心安神", "醒神開竅"],
    ind: ["腹脹", "便血", "月經過多（經血量大）", "崩漏", "神志失常", "多夢擾眠", "驚厥抽搐", "痛風"],
    id: ["井穴", "木穴（本經子穴）", "鬼穴", "可灸"],
    idEn: ["Jing Well Point", "Wood Point", "Ghost Point", "Moxibustion Applicable"],
    ci: ["趾端穴，僅可沿皮下淺刺 0.1 吋，不可深刺", "甲角旁血運豐富，出針後按壓止血"],
    pearl: "★ 脾經止血第一穴：崩漏、便血都找它。井穴又是鬼穴，所以既治血證也治神志（多夢、驚厥）。臨床常用灸法止崩漏。",
    star: 1
  },
  SP2: {
    fn: ["調理脾氣", "化濕、清利濕熱", "和中焦", "清熱"],
    ind: ["腹脹", "胃痛", "便祕", "熱病無汗"],
    id: ["滎穴", "火穴（本經母穴）", "可灸"],
    idEn: ["Ying Spring Point", "Fire Point", "Moxibustion Applicable"],
    ci: ["赤白肉際處針感強，直刺不超過 0.3 吋"],
    pearl: "滎主身熱 —— 本穴是脾經清熱穴，「熱病無汗」是課件特別列的主治。火穴＝本經母穴，虛則補其母，脾虛可補此穴。",
    star: 1
  },
  SP3: {
    fn: ["健脾", "化濕、清利濕熱", "調和脾胃", "理氣"],
    ind: ["胃痛", "腹脹", "便祕、痢疾、泄瀉", "嘔吐、腸鳴", "身重倦怠", "腳氣（維生素 B1 缺乏）"],
    id: ["輸穴", "土穴（本經本穴）", "原穴", "可灸"],
    idEn: ["Shu Stream Point", "Earth Point", "Yuan Source Point", "Moxibustion Applicable"],
    ci: ["赤白肉際取穴，直刺 0.3–0.5 吋，避免刺入關節腔"],
    pearl: "★ 脾經原穴，也是輸穴與土穴三重身分 —— 「本經本穴」，補脾的代表穴。輸主體重節痛，所以身重倦怠也用它。與 SP4 公孫分工：太白補脾之本，公孫調衝脈與心胸。",
    star: 1
  },
  SP4: {
    fn: ["健脾", "和中焦", "理氣", "化濕", "安神", "利心胸", "調理衝脈"],
    ind: ["胃痛", "嘔吐", "腹痛腹脹", "泄瀉", "痢疾", "腸鳴"],
    id: ["絡穴", "八脈交會穴 —— 通衝脈", "配 PC6 內關（通陰維脈）合治心、胸、胃", "可灸"],
    idEn: ["Luo Connecting Point", "Chong Mai Master Point", "Paired with PC-6 (Yin Wei Mai Master Point)", "Moxibustion Applicable"],
    ci: ["第一蹠骨基底前下方取穴，直刺 0.5–0.8 吋，避免刺傷骨膜"],
    // 課件沒給星號，所以 exam_star 是 0 —— 星號一律照課件，不自己判斷。
    // 但八脈交會是考綱 Domain III 的固定內容，寫在 pearl 裡而不是偽造星號。
    pearl: "八脈交會穴必背：公孫通衝脈，配內關（PC6，通陰維脈），主治**心、胸、胃**。這一組是八法歌訣的第一組。同時是脾經絡穴，別走胃經。（課件未標星號，但屬考綱 Domain III 治療計畫的固定內容。）",
    star: 0
  },
  SP5: {
    fn: ["健脾", "化濕", "利筋骨", "安神"],
    ind: ["腹脹", "便祕、泄瀉", "腸鳴", "舌強痛", "足踝痛", "痔瘡"],
    id: ["經穴", "金穴（本經子穴）", "可灸"],
    idEn: ["Jing River Point", "Metal Point", "Moxibustion Applicable"],
    ci: ["內踝前下方凹陷處，直刺不超過 0.3 吋，避免刺傷踝關節與脛後動脈分支"],
    pearl: "踝關節局部要穴 —— 「利筋骨」加「足踝痛」是課件唯一在脾經給的踝部主治。金穴＝本經子穴，實則瀉其子，脾經實證瀉此穴。舌強痛是容易漏的考點（脾之脈連舌本、散舌下）。",
    star: 0
  },
  SP6: {
    fn: ["健脾和胃", "化濕", "疏肝、補腎", "調經、催產", "調理下焦、通利小便、益前陰", "安神", "活血", "通經活絡、止痛"],
    ind: ["腹痛腹脹、腸鳴泄瀉", "痛經、月經不調、崩漏", "帶下、子宮脫垂、不孕、滯產", "遺精、陽痿", "遺尿（尤其小兒夜間）、小便不利澀痛", "水腫、疝氣、外陰痛", "肌肉萎縮、運動障礙、下肢癱瘓疼痛", "頭痛、頭暈目眩、失眠"],
    id: ["交會穴 —— 足三陰（脾、肝、腎）交會", "婦科要穴", "可灸", "⚠️ 孕婦禁針"],
    idEn: ["Intersection Point of 3 Yin Leg Meridians (Spleen, Liver, Kidney)", "Moxibustion Applicable", "Contraindicated during pregnancy"],
    ci: ["⚠️ 孕婦禁針 —— 課件明列 Contraindicated during pregnancy，本穴能催產（Induces labor）", "脛骨內側後緣，直刺 0.5–1.0 吋，避免刺傷脛後動脈與神經"],
    pearl: "★★ 全身最重要的穴之一，脾經第一考點。足三陰（脾肝腎）交會 —— 一穴通三經，所以婦科、泌尿、生殖、失眠都用它。**孕婦禁針**是安全考點，理由就在功效裡：它能催產。與 ST36 分工：足三里補氣，三陰交補陰血、調下焦。",
    star: 2
  },
  SP7: {
    fn: ["健脾", "化濕", "利小便", "消腫"],
    ind: ["腹脹", "腸鳴", "腹中冷感", "膝腿麻木癱瘓", "水腫"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["脛骨內側後緣，直刺 0.5–1.0 吋，避開脛後動脈"],
    pearl: "定位靠 SP6 與 SP9 的連線：內踝尖上 6 吋，正好在三陰交（3 吋）與陰陵泉之間。功效是縮小版的陰陵泉 —— 利濕消腫，但沒有 SP9 的「開水道」層次。",
    star: 0
  },
  SP8: {
    fn: ["調經", "活血", "和脾", "化濕", "緩急止痛"],
    ind: ["腹痛腹脹", "濕濁停聚 —— 泄瀉、水腫、小便不利", "遺精", "血瘀 —— 月經不調、痛經、血塊、肌瘤", "男性不育"],
    id: ["郄穴", "可灸"],
    idEn: ["Xi Cleft Point", "Moxibustion Applicable"],
    ci: ["脛骨內側後緣，直刺 0.5–1.0 吋，避開脛後動脈"],
    pearl: "★ 郄穴主急症與血證 —— 「緩急止痛」加「血瘀」就是它的兩張牌，**急性痛經**是最典型的用法（陰經郄穴治血證）。定位口訣：陰陵泉下 3 吋。",
    star: 1
  },
  SP9: {
    fn: ["調理脾氣", "化濕", "開通水道", "利下焦"],
    ind: ["腹痛腹脹", "泄瀉、痢疾、水腫", "黃疸、肝炎（濕熱）", "小便不利、遺尿、尿失禁", "外陰痛、痛經", "膝痛（尤其內側）", "濕痺", "慢性念珠菌感染"],
    id: ["合穴", "水穴", "祛濕要穴", "可灸"],
    idEn: ["He Sea Point", "Water Point", "Moxibustion Applicable"],
    ci: ["脛骨內側髁下緣凹陷，直刺 0.5–1.0 吋，避免刺入膝關節腔"],
    pearl: "★ 全身祛濕第一穴：合穴＋水穴，所以「開通水道」是它獨有的功效層次（SP7 只有利濕消腫，沒有這一層）。水腫、黃疸、濕痺、白帶都靠它。常配 SP6 三陰交、ST36 足三里。",
    star: 1
  },
  SP10: {
    fn: ["活血", "祛瘀", "涼血（課件註記：最常用於此）", "調經", "利皮膚"],
    ind: ["血分婦科病 —— 血虛、血熱、血瘀所致的月經不調、痛經、閉經、經期腹痛、經前症候群", "濕熱或血熱型皮膚病 —— 蕁麻疹、濕疹、皮膚炎、丹毒", "大腿內側痛"],
    id: ["血證要穴（血海）", "可灸"],
    idEn: ["Good for Blood conditions", "Moxibustion Applicable"],
    ci: ["屈膝取穴，股四頭肌內側頭隆起處，直刺 0.5–1.2 吋"],
    pearl: "★ 名字就是考點 —— 「血海」，一切血證。課件特別註明**最常用的是涼血**，所以皮膚病（蕁麻疹、濕疹）用它比婦科更典型。與 SP6 分工：血海治血，三陰交調三陰經。",
    star: 1
  },
  SP11: {
    fn: ["調理小便", "利濕", "清熱"],
    ind: ["小便不利、遺尿", "腹股溝腫痛", "肌肉萎縮、運動障礙", "下肢痛與癱瘓"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["大腿內側，深部有股動靜脈，直刺 0.5–1.0 吋，避開搏動處"],
    pearl: "大腿內側局部穴，臨床少用。定位靠 SP10 與 SP12 的連線（血海上 6 吋）。功效是「利濕清熱」加局部痿痺，屬於補位穴而非主穴。",
    star: 0
  },
  SP12: {
    fn: ["活血", "理氣", "止痛", "利濕", "清熱", "調理小便"],
    ind: ["腹痛", "疝氣", "小便不利"],
    id: ["局部穴", "可灸", "⚠️ 避開動脈"],
    idEn: ["Local Point", "Moxibustion Applicable", "Avoid Artery"],
    ci: ["⚠️ 緊鄰髂外動脈搏動處 —— 課件明列 Avoid Artery，取穴時先觸搏動再向外側取，不可直刺搏動點", "位於腹股溝，孕婦與腹部術後慎用"],
    pearl: "★ 安全考點：本穴外側就是**髂外動脈搏動處**，課件直接寫 Avoid Artery。定位在恥骨聯合上緣水平、旁開任脈 3.5 吋 —— 這個 3.5 吋是脾經腹部唯一不是 4 吋的一穴。",
    star: 0
  },
  SP13: {
    fn: ["理氣", "止痛"],
    ind: ["少腹痛", "疝氣"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["腹部穴，直刺 0.5–1.0 吋，孕婦與腹部術後慎用"],
    pearl: "課件只給兩條功效，是脾經最簡的穴之一。與 SP12 衝門僅相距 0.7 吋，主治高度重疊（都治疝氣與少腹痛），差別在 SP12 要避動脈、SP13 不用。",
    star: 0
  },
  SP14: {
    fn: ["溫利下焦", "理氣", "降逆"],
    ind: ["臍周痛", "腹脹", "泄瀉、便祕"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["腹部穴，直刺 0.5–1.0 吋，孕婦與腹部術後慎用"],
    pearl: "腹部三穴（SP14 腹結、SP15 大橫、SP16 腹哀）都在旁開前正中線 4 吋的直線上，由下而上排列，泄瀉便祕都能治。SP14 多一層「溫」—— 適合虛寒型腹痛。",
    star: 0
  },
  SP15: {
    fn: ["行氣", "調理腸道"],
    ind: ["腹痛腹脹", "泄瀉、痢疾、便祕（課件註記：泄瀉以 ST25 天樞為佳）"],
    id: ["交會穴 —— 脾經、陰維脈", "可灸"],
    idEn: ["Intersection Point (Spleen, Yin Wei / Yin Linking)", "Moxibustion Applicable"],
    ci: ["腹部穴，直刺 0.7–1.2 吋，孕婦與腹部術後慎用"],
    pearl: "★ 便祕的腹部主穴，與臍同高、旁開 4 吋。課件明白寫著**泄瀉用 ST25 天樞比較好**，所以大橫的臨床位置偏向便祕與腹脹 —— 這種「兩穴分工」正是考題喜歡問的。",
    star: 1
  },
  SP16: {
    fn: ["調理腸道"],
    ind: ["腹痛", "消化不良", "便祕與痢疾（課件註記：最常用）"],
    id: ["交會穴 —— 脾經、陰維脈", "可灸"],
    idEn: ["Intersection Point (Spleen, Yin Wei / Yin Linking)", "Moxibustion Applicable"],
    ci: ["⚠️ 部分體型者本穴會落在肋弓上 —— 課件給三種處理：改取較內側（首選）、沿肋弓平刺、或改選他穴", "腹部穴，直刺 0.5–1.0 吋，不可在肋弓上直刺"],
    pearl: "課件唯一給了「取穴落在肋弓上怎麼辦」的穴，三個選項要記：**改內側（首選）→ 沿肋弓平刺 → 換穴**。功效只有一條（調理腸道），主治以便祕痢疾最常用。",
    star: 0
  },
  SP17: {
    fn: ["消散食積與水飲", "助消化"],
    ind: ["胸脅脹滿疼痛（哮喘 —— 胸中已滿，吸不進氣）"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險", "第 5 肋間隙，旁開前正中線 6 吋"],
    pearl: "脾經胸部五穴（SP17–SP21）從這裡開始，全部**只能斜刺 0.3–0.5 吋**，這是氣胸安全考點。SP17 食竇是五穴中唯一還帶消化功效的（名字就叫「食」竇），往上就純粹是理氣寬胸了。",
    star: 0
  },
  SP18: {
    fn: ["調氣降逆（胃氣與肺氣）", "通乳、利乳房"],
    ind: ["胸脅脹滿疼痛", "咳嗽、呃逆", "乳腺炎、乳汁不足"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險", "第 4 肋間隙（與乳頭同高），旁開前正中線 6 吋"],
    pearl: "★ 胸部五穴中唯一治乳房的 —— 第 4 肋間、與乳頭同高，位置就說明了功效。乳腺炎與乳汁不足找它，與 ST18 乳根、SI1 少澤同為通乳組。",
    star: 0
  },
  SP19: {
    fn: ["調氣降逆", "寬胸"],
    ind: ["胸脅脹滿疼痛"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險", "第 3 肋間隙，旁開前正中線 6 吋"],
    pearl: "SP19 胸鄉與 SP20 周榮功效完全相同（調氣降逆、寬胸），差別只在肋間隙：胸鄉第 3、周榮第 2。由下而上數：SP18 第 4、SP19 第 3、SP20 第 2 —— 這個序列是定位考點。",
    star: 0
  },
  SP20: {
    fn: ["調氣降逆", "寬胸"],
    ind: ["胸脅脹滿疼痛", "咳嗽、呃逆"],
    id: ["局部穴", "可灸"],
    idEn: ["Local Point", "Moxibustion Applicable"],
    ci: ["⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險", "第 2 肋間隙，旁開前正中線 6 吋"],
    pearl: "脾經最高的一個肋間穴（第 2 肋間）。功效與 SP19 相同，但課件多給了「咳嗽、呃逆」—— 位置越高越靠近肺，降逆止咳的用法越明顯。",
    star: 0
  },
  SP21: {
    fn: ["調理氣血", "強健筋骨關節", "寬胸", "利脅肋"],
    ind: ["胸痛、脅痛、胸背痛", "哮喘", "周身痠痛無力（課件註記：纖維肌痛症適用）", "虛證 —— 全身關節鬆軟無力（按壓覺舒服）", "實證 —— 周身疼痛（按壓覺加痛）"],
    id: ["脾之大絡（總統絡穴）", "統絡全身諸絡", "可灸"],
    idEn: ["Grand Luo Connecting Point", "Connects all Luo channels", "Moxibustion Applicable"],
    ci: ["⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險", "腋中線第 6 肋間隙（課件另註：MOA 作第 7 肋間）"],
    // 課件的星號在拼音上（Da Bao*）而非代碼上，解析器原本讀不到 —— 已修。
    pearl: "★ 脾之大絡，**統絡全身諸絡** —— 全身唯一有這個身分的穴，必考。課件給的辨證口訣最實用：**虛則全身關節鬆軟、按之覺舒；實則周身疼痛、按之更痛**。纖維肌痛症是課件明列的現代適應症。",
    star: 1
  }
};

// ── load ────────────────────────────────────────────────────────────────────
const rawFile = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(rawFile);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const byCode = new Map(recs.map((r) => [r.code, r]));

if (!fs.existsSync(EXTRACT)) {
  console.error(`extract not found: ${EXTRACT}\n  run: python3 scripts/parse-channel-curriculum.py "${SRC}" --json <path>`);
  process.exit(1);
}
const ex = JSON.parse(fs.readFileSync(EXTRACT, "utf8"));
const parsed = new Map((ex.points || ex).map((p) => [p.code, p]));

const fail = [];

// ── build English, applying the two documented departures ───────────────────
function englishFor(code, field) {
  const p = parsed.get(code);
  if (!p) { fail.push(`${code}: not in parser output`); return null; }
  let arr = (p[field] || []).slice();

  // 1. repair the lost bullet glyphs
  for (const [c, f, glued, head] of EN_SPLIT) {
    if (c !== code || f !== field) continue;
    const i = arr.indexOf(glued);
    if (i === -1) { fail.push(`${code}.${field}: EN_SPLIT target no longer present — re-check the parse: "${glued}"`); continue; }
    arr.splice(i, 1, head, glued.slice(head.length).trim());
  }

  // 2. cells the wrap mangled; quoted from the .md of the same page
  const rep = EN_REPLACE[code]?.[field];
  if (rep) arr = rep.slice();

  // 3. A6 merges
  const merge = EN_MERGE[code]?.[field];
  if (merge) {
    const flat = merge.flat();
    for (const item of flat) {
      if (!arr.includes(item)) fail.push(`${code}.${field}: EN_MERGE names an item the parser did not produce: "${item}"`);
    }
    if (flat.length !== arr.length) fail.push(`${code}.${field}: EN_MERGE covers ${flat.length} of ${arr.length} parsed items — every item must be accounted for`);
    // Functions are verb phrases, so they merge into one readable clause and
    // the continuation verb drops its capital: "Harmonizes Liver and tonifies
    // Kidneys". Indications are lists of symptoms, not a sentence — joining
    // those with "and" reads wrong, so they merge on a semicolon.
    const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
    arr = merge.map((g) => {
      if (g.length === 1) return g[0];
      if (field === "indications") return g.join("; ");
      return g.slice(0, -1).map((s, i) => (i ? lower(s) : s)).join(", ") + " and " + lower(g[g.length - 1]);
    });
  }

  // trailing page numbers leak in as their own token
  arr = arr.map((s) => s.replace(/\s+\d$/, "").trim()).filter(Boolean);
  return arr;
}

// The .md is a whole-page extraction of the same PDF. EN_REPLACE quotes from
// it precisely because the parser's cell lost words to the column wrap, so for
// those fields the page text is the thing to check against.
const MD = (() => {
  const f = path.join(ROOT, SRC.replace(/\.pdf$/, ".md"));
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8").toLowerCase() : "";
})();

// Every word I write in English must appear in the curriculum text for that
// point. This is what stops the 中文 layer's author from inventing English.
function assertWordsFromSource(code, field, arr, replaced) {
  const src = JSON.stringify(parsed.get(code)).toLowerCase();
  for (const line of arr) {
    for (const w of String(line).toLowerCase().match(/[a-z]{4,}/g) || []) {
      if (w === "and") continue;
      if (src.includes(w)) continue;
      // A replaced cell is quoted from the .md; accept the page-level text
      // there, but nowhere else.
      if (replaced && MD.includes(w)) continue;
      fail.push(`${code}.${field}: "${w}" is not in the curriculum text for this point`);
    }
  }
}

// ── apply ───────────────────────────────────────────────────────────────────
const changes = [];
for (const code of Object.keys(ZH)) {
  const r = byCode.get(code);
  if (!r) { fail.push(`${code}: not in 361.json`); continue; }
  const z = ZH[code];
  const p = parsed.get(code);
  if (!p) continue;

  const fnEn = englishFor(code, "functions");
  const indEn = englishFor(code, "indications");
  if (!fnEn || !indEn) continue;

  // A4 — 中/英 must pair row for row. Refuse to write on a mismatch rather
  // than shifting every row below it.
  if (z.fn.length !== fnEn.length) fail.push(`${code}: functions 中${z.fn.length} vs 英${fnEn.length}\n    en: ${JSON.stringify(fnEn)}`);
  if (z.ind.length !== indEn.length) fail.push(`${code}: indications 中${z.ind.length} vs 英${indEn.length}\n    en: ${JSON.stringify(indEn)}`);
  if (z.id.length !== z.idEn.length && z.idEn.length) {
    // identity is allowed to carry extra 中文 detail the curriculum states in
    // Chinese only (五輸 母子穴), so this is a warning-shaped assert: only the
    // English must not exceed the 中文.
    if (z.idEn.length > z.id.length) fail.push(`${code}: point_identity 英${z.idEn.length} > 中${z.id.length}`);
  }
  // A6 — functions_zh 2–8
  if (z.fn.length < 1 || z.fn.length > 8) fail.push(`${code}: functions_zh ${z.fn.length} 條，超出 A6 的 2–8`);
  assertWordsFromSource(code, "functions", fnEn, !!EN_REPLACE[code]?.functions);
  assertWordsFromSource(code, "indications", indEn, !!EN_REPLACE[code]?.indications);
  if (z.star !== p.stars) fail.push(`${code}: exam_star ${z.star} but the curriculum marks ${p.stars}`);

  const cite = [`${SRC}#p${(p.pages || [1])[0]}`];
  const before = JSON.stringify({ f: r.functions_zh, i: r.indications_zh });

  r.functions_zh = z.fn;
  r.functions_en = fnEn;
  r.indications_zh = z.ind;
  r.indications_en = indEn;
  r.point_identity_zh = z.id;
  r.point_identity_en = z.idEn;
  r.exam_star = z.star;
  r.exam_pearl = z.pearl;
  r.exam_importance = z.star
    ? "★ NCBAHM 2026 ACPL 考綱 Domain I（穴位定位，15%）與 Domain III（治療計畫，40%）"
    : "NCBAHM 2026 ACPL 考綱 Domain I（穴位定位，15%）";

  // Safety is additive only (template §3「安全不可降級」): existing warnings
  // are kept and the curriculum's are appended if not already said.
  const existing = Array.isArray(r.contraindications) ? r.contraindications.slice() : (r.contraindications ? [r.contraindications] : []);
  const merged = existing.slice();
  for (const c of z.ci) if (!merged.some((e) => String(e).includes(c.slice(0, 12)))) merged.push(c);
  r.contraindications = merged;

  // Needling: append the curriculum's depth, never overwrite an existing one.
  const needleLine = (p.location || []).find((l) => /inch/i.test(l));
  if (needleLine) {
    const note = `課件：${needleLine.replace(/^.*?Needling Method:\s*/i, "").trim()}`;
    if (!String(r.needling || "").includes(note)) {
      r.needling = r.needling ? `${r.needling}\n\n${note}` : note;
    }
  }

  r.field_sources = r.field_sources || {};
  for (const f of ["functions_zh", "functions_en", "indications_zh", "indications_en",
    "point_identity_zh", "point_identity_en", "exam_pearl", "exam_importance",
    "exam_star", "contraindications", "needling"]) {
    r.field_sources[f] = cite;
  }
  r.review_status = "draft";

  changes.push({ code, name: r.chinese, star: z.star, fn: `${z.fn.length}`, ind: `${z.ind.length}`,
    changed: before !== JSON.stringify({ f: r.functions_zh, i: r.indications_zh }) });
}

// ── report ──────────────────────────────────────────────────────────────────
console.log(`SP 脾經 —— ${changes.length}/21 穴\n`);
console.log("穴位   名稱     ★  功效 主治");
for (const c of changes) {
  console.log(`${c.code.padEnd(6)} ${String(c.name).padEnd(8)} ${c.star || "-"}  ${c.fn.padStart(3)}  ${c.ind.padStart(3)}`);
}

if (fail.length) {
  console.error(`\n❌ ${fail.length} 個對齊/來源檢查失敗 —— 不寫入:\n`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\n✅ 中英逐條對齊、英文全部來自課件、星號與課件一致");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(rawFile)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (rawFile.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");

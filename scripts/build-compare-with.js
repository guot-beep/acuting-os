#!/usr/bin/env node
/**
 * build-compare-with.js — the §6.5 (C) 複習對比 layer.
 *
 * The most useful thing in a board question is the contrast: not "what does
 * SP15 do" but "SP15 or ST25 for diarrhea". That knowledge already exists in
 * this repo, but only as prose inside exam_pearl and inside the curriculum's
 * own asides — so the app cannot build a comparison table from it and it is
 * not searchable.
 *
 * Two sourced origins, no invention:
 *
 *   CURRICULUM — a curriculum line that explicitly ranks two points
 *     ("ST-25 better for diarrhea", "use LI-18 because it is safer",
 *     "More important than ST-29"). Found by scanning the parser output for
 *     comparative language, then confirmed by hand. `scripts/…` cannot judge
 *     which cross-reference is a comparison and which is a 配穴 pairing —
 *     of 35 cross-references in the 14 channel lectures only 7 rank anything;
 *     the rest say "combine with", which belongs in combine_points_zh.
 *
 *   PEARL — a 「與 X 分工」 sentence written into exam_pearl during the
 *     LU/LI/ST/SP curation passes, each of which already carries a
 *     field_sources.exam_pearl citation back to a curriculum page.
 *
 * `axis` is the one thing written here rather than quoted: it is the short
 * name of the dimension being compared (安全性, 部位分工, 寒熱). `note` is
 * quoted, and the script asserts the quote actually appears in the record's
 * exam_pearl — a note that drifts from its source fails the build.
 *
 * Links are written BOTH ways. A comparison that only appears on one of the
 * two cards is the half that gets missed in revision.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const APPLY = process.argv.includes("--apply");

// origin: "pearl"      — note must appear in the FIRST code's exam_pearl
//         "curriculum" — note is the curriculum line itself, cited by page
const PAIRS = [
  // ── from the curriculum's own comparative asides ──
  { codes: ["SP15", "ST25"], axis: "腹瀉 vs 便祕", origin: "curriculum",
    note: "課件：Diarrhea, dysentery, constipation (ST-25 better for diarrhea) —— 泄瀉用天樞，大橫偏便祕與腹脹。",
    src: "curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf#p2" },
  { codes: ["ST9", "LI18"], axis: "頸部安全性", origin: "curriculum",
    note: "課件：Can affect common carotid artery, use LI-18 because it is safer —— 人迎緊貼頸總動脈，需要頸部取穴時扶突較安全。",
    src: "curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p2" },
  { codes: ["ST30", "ST29"], axis: "奔豚氣主次", origin: "curriculum",
    note: "課件：Running Piglet Disorder (More important than ST-29) —— 奔豚氣以氣沖為主，歸來次之。",
    src: "curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p4" },
  { codes: ["BL10", "GB20"], axis: "風寒解表主次", origin: "curriculum",
    note: "課件：Secondary point to release exterior in wind-cold conditions (Primary is GB-20) —— 風寒解表以風池為主，天柱為輔。",
    src: "curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p2" },
  { codes: ["BL60", "BL40"], axis: "脊椎痛部位分工", origin: "curriculum",
    note: "課件：Main point for pain anywhere along spine (UB-40 may be used more for pain in middle of spine) —— 崑崙主全脊，委中偏中段。",
    src: "curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p6" },
  { codes: ["TE1", "TE3"], axis: "臨床使用頻率", origin: "curriculum",
    note: "課件：Similar to SJ3 (used more clinically) —— 關沖與中渚作用相近，臨床多用中渚。",
    src: "curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p1" },
  { codes: ["LU5", "BL40"], axis: "上下對應", origin: "curriculum",
    note: "課件：Classically noted for 5 types of Lumbar Pain, possibly upper body equivalent of UB-40 —— 尺澤治腰痛，被視為委中的上肢對應穴。",
    src: "curriculum/acupoints/1 LUNG CHANNEL OF HAND TAI YIN.pdf#p1" },

  // ── from 分工 sentences already written into exam_pearl ──
  { codes: ["LU10", "LU5"], axis: "清熱緩急", origin: "pearl",
    note: "LU10 偏清而急，主咽痛；LU5 偏降而廣，主水道與痹痛" },
  { codes: ["LU8", "LU7"], axis: "作用範圍", origin: "pearl",
    note: "課件直接把它跟 LU7 對比：作用範圍較窄" },
  { codes: ["LU1", "LU2"], axis: "募穴 vs 局部穴", origin: "pearl",
    note: "兩穴都在鎖骨下，但 LU2 更常單純當肩部局部穴用" },
  { codes: ["LI7", "LU6"], axis: "陰陽經郄穴分工", origin: "pearl",
    note: "大腸經郄穴的特色是清熱解毒（癰腫瘡瘍）而非止血，這跟肺經郄穴 LU6 主咯血不同" },
  { codes: ["LI16", "LI15"], axis: "肩部深淺與功效", origin: "pearl",
    note: "功效上比 LI15 多一條化胸肺血瘀（吐血、咯血）" },
  { codes: ["ST2", "ST1"], axis: "眼周安全性", origin: "pearl",
    note: "眼病與面癱的第一線眶下穴，比 ST1 安全" },
  { codes: ["ST6", "ST7"], axis: "上下頜分工", origin: "pearl",
    note: "ST6 主下頜與後臼齒，ST7 主上頜與顳顎關節" },
  { codes: ["ST22", "ST21"], axis: "是否兼水道", origin: "pearl",
    note: "關門兼顧腸與水道，腹瀉伴水腫時比 ST21 更對證" },
  { codes: ["ST29", "ST28"], axis: "寒 vs 熱瘀", origin: "pearl",
    note: "水道偏實熱瘀，歸來偏虛寒" },
  { codes: ["SP3", "SP4"], axis: "補脾 vs 通衝脈", origin: "pearl",
    note: "太白補脾之本，公孫調衝脈與心胸" },
  { codes: ["SP6", "ST36"], axis: "補氣 vs 補陰血", origin: "pearl",
    note: "足三里補氣，三陰交補陰血、調下焦" },
  { codes: ["SP10", "SP6"], axis: "治血 vs 調經", origin: "pearl",
    note: "血海治血，三陰交調三陰經" },

  // ── 2026-08-19 擴充批A:經絡課件/Therapeutics/Techniques/exam_pearl(帳本 scratchpad compare_with_proposals,逐字引文已驗) ──
  { codes: ["TE2", "TE3"], axis: "臨床使用頻率", origin: "curriculum",
    note: "課件：Similar to SJ 3 (used more clinically) —— 液門與中渚作用相近，臨床多用中渚。",
    src: "curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p1" },
  { codes: ["GB28", "GB27"], axis: "男科分工", origin: "curriculum",
    note: "課件：GB 27 is used more for male issues: testicular pain a/or retraction, lower abdominal pain, shan disorder —— 男科（睪丸痛、疝氣）多用五樞，維道偏帶下與子宮脫垂。",
    src: "curriculum/acupoints/11 GALLBLADDER CHANNEL OF FOOT SHAO YANG.pdf#p5" },
  { codes: ["GV11", "GV12"], axis: "心肺虛實分工", origin: "curriculum",
    note: "課件：Differentiation — DU 11: mostly for HT & LU deficiency; DU 12: more for excess of HT & LU —— 神道偏心肺之虛，身柱偏心肺之實。",
    src: "curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p3" },
  { codes: ["GV23", "GV24"], axis: "鼻病 vs 頭痛", origin: "curriculum",
    note: "課件：Differentiation: DU 23 is more for nose problems whereas DU 24 is more for headaches —— 上星偏鼻病，神庭偏頭痛。",
    src: "curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p5" },
  { codes: ["HT9", "PC8"], axis: "情志與心火口瘡", origin: "curriculum",
    note: "課件：Emotional disorders (PC 8 might be better)；Heart Fire affecting mouth: Ulcers, canker sores, etc. (PC 7 or PC 8 may be better) —— 情志病與心火口瘡，勞宮可能優於少衝。",
    src: "curriculum/acupoints/5 HEART CHANNEL OF HAND SHAO YIN.pdf#p2" },
  { codes: ["PC6", "PC3"], axis: "急慢性心症分工", origin: "curriculum",
    note: "課件：Similar to PC 3 but more for Chronic Heart symptoms from Qi stagnation —— 內關與曲澤相近，但更偏氣滯所致的慢性心症。",
    src: "curriculum/acupoints/9 PERICARDIUM CHANNEL OF HAND JUE YIN.pdf#p2" },
  { codes: ["CV13", "CV12"], axis: "上焦 vs 中焦分工", origin: "curriculum",
    note: "課件：REN 13 is useful for upper warmer issues (vomiting, hiatal hernia, hiccups, epigastric pain), whereas REN 12 is useful for middle warmer issues —— 上脘主上、中脘主中。",
    src: "curriculum/acupoints/Techniques 3 points.pdf#p15" },
  { codes: ["CV12", "CV10"], axis: "中焦 vs 下焦分工", origin: "curriculum",
    note: "課件：REN 12 is useful for middle warmer issues and REN 10 is useful for lower warmer issues —— 中脘主中、下脘主下。",
    src: "curriculum/acupoints/Techniques 3 points.pdf#p15" },
  { codes: ["TE6", "TE5"], axis: "清熱強度", origin: "curriculum",
    note: "課件：SJ 6: Clear heat [better than SJ 5] —— 脅肋痛清熱取支溝勝外關。",
    src: "curriculum/acupoints/Therapeutics Notes Comprehensive (1).pdf#p58" },
  { codes: ["CV8", "GV4"], axis: "灸法分工（脫垂 vs 陽痿）", origin: "curriculum",
    note: "課件：Differentiation REN 8/DU 4 — Organ Prolapse: Moxa REN 8 better than Moxa DU 4; Male ED: Moxa DU 4 —— 臟器脫垂灸神闕優於命門，陽痿灸命門。",
    src: "curriculum/acupoints/Therapeutics Notes Comprehensive (1).pdf#p61" },
  { codes: ["KI3", "KI6"], axis: "補陰 vs 清熱", origin: "curriculum",
    note: "課件：KD 3: Yin [Tonify Yin stronger than KD 6]；KD 6: Clear heat better —— 太溪補陰較強，照海清熱較好。",
    src: "curriculum/acupoints/Therapeutics Notes Comprehensive (1).pdf#p91" },
  { codes: ["LR2", "GB34"], axis: "清肝熱方式", origin: "curriculum",
    note: "課件：LV 2: Heat [Clear better LV heat, doesn’t drain turbid yang]；GB 34: Heat [More balancing, drains turbid yang] —— 行間清肝熱較好但不瀉濁陽，陽陵泉較平衡且瀉濁陽。",
    src: "curriculum/acupoints/Therapeutics Notes Comprehensive (1).pdf#p101" },
  { codes: ["LI1", "LU11"], axis: "井穴放血分工", origin: "pearl",
    note: "與 LU11 少商同為井穴放血穴，一在食指一在拇指：LI1 偏牙痛咽痛，LU11 偏極度咽痛與中風昏迷" },
  { codes: ["LI19", "LI20"], axis: "主輔分工", origin: "pearl",
    note: "功效與 LI20 幾乎相同但更單純，臨床多作迎香的輔助" },
  { codes: ["SP13", "SP12"], axis: "動脈安全性", origin: "pearl",
    note: "與 SP12 衝門僅相距 0.7 吋，主治高度重疊（都治疝氣與少腹痛），差別在 SP12 要避動脈、SP13 不用" },
  { codes: ["SP19", "SP20"], axis: "肋間定位差別", origin: "pearl",
    note: "SP19 胸鄉與 SP20 周榮功效完全相同（調氣降逆、寬胸），差別只在肋間隙：胸鄉第 3、周榮第 2" },

  // ── 2026-08-19 擴充批B:AP Point Book(學生複習書口吻,含 Maciocia 轉引;證據等級低於經絡課件——Ting 若降級,revert 本批 commit 或按 src 過濾) ──
  { codes: ["LI4", "LI11"], axis: "風氣 vs 熱血", origin: "curriculum",
    note: "課件：L.I. 4 stronger for Wind/Qi; L.I. 11 stronger for Heat/Blood —— 合谷偏風偏氣，曲池偏熱偏血。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p32" },
  { codes: ["LI5", "LI4"], axis: "頭痛使用頻率", origin: "curriculum",
    note: "課件：L.I. 5 headaches (L.I. 4 used more) —— 頭痛陽溪可用，但合谷更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p32" },
  { codes: ["LI18", "LI17"], axis: "頸局部使用頻率", origin: "curriculum",
    note: "課件：L.I. 18 used more than 17 for local problems —— 頸部局部問題扶突比天鼎更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p32" },
  { codes: ["ST21", "CV12"], axis: "調上下焦使用頻率", origin: "curriculum",
    note: "課件：\"Door that regulates upper and lower burners\" — but Ren 12 is used more often —— 梁門能調上下焦，但臨床多用中脘。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p70" },
  { codes: ["SP5", "SP1"], axis: "痔瘡首選", origin: "curriculum",
    note: "課件：hemorrhoids (Sp 1 used more) —— 痔瘡商丘可用，但隱白更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p99" },
  { codes: ["SP10", "SP8"], axis: "偏熱程度", origin: "curriculum",
    note: "課件：(Sp 10) More for heat than Sp 8 —— 血海比地機更偏熱證。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p105" },
  { codes: ["BL17", "BL16"], axis: "膈肌痙攣", origin: "curriculum",
    note: "課件：spasms of the diaphragm (better than Bl 16) —— 膈肌痙攣膈俞優於督俞。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p161" },
  { codes: ["BL24", "BL23"], axis: "補氣使用頻率", origin: "curriculum",
    note: "課件：Used as a Qi tonic, though U.B. 23 is used more —— 氣海俞可補氣，但腎俞更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p168" },
  { codes: ["BL25", "BL23"], axis: "腰痛虛實分工", origin: "curriculum",
    note: "課件：(UB 25) Used allot for low back pain — U.B. 23 used more for chronic deficient low back pain —— 大腸俞治腰痛，慢性虛性腰痛多用腎俞。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p169" },
  { codes: ["BL62", "BL60"], axis: "頭痛類型分工", origin: "curriculum",
    note: "課件：headache more from neurological/brain disorders (U.B. 60 more for tension HA) —— 申脈偏神經性頭痛，崑崙偏緊張性頭痛。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p196" },
  { codes: ["BL63", "BL62"], axis: "痛證使用頻率", origin: "curriculum",
    note: "課件：(UB 63) U.B. 62 used more for pain —— 痛證申脈比金門更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p198" },
  { codes: ["KI2", "KI6"], axis: "咽痛虛實分工", origin: "curriculum",
    note: "課件：(K 2) More for excess sore throat than K 6；(K 6) K 2 more for tonsillitis/excess, more for chronic sore throat —— 然谷偏實熱咽痛，照海偏陰虛慢性咽痛。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p209" },
  { codes: ["PC6", "PC5"], axis: "甲狀腺亢進", origin: "curriculum",
    note: "課件：(P 6) hyperthyroidism (P-5 used more) —— 甲亢間使比內關更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p238" },
  { codes: ["PC7", "HT7"], axis: "情志男女分工", origin: "curriculum",
    note: "課件：Maciocia: emotional upset from the ending of relationships, P 7: better for women / H 7: better for men —— 關係結束的情志傷，大陵偏女、神門偏男。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p239" },
  { codes: ["TE4", "TE3"], axis: "耳疾使用頻率", origin: "curriculum",
    note: "課件：(SJ 4) deafness & tinnitus — SJ 3 more common —— 耳鳴耳聾中渚比陽池更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p247" },
  { codes: ["TE5", "TE6"], axis: "便祕使用頻率", origin: "curriculum",
    note: "課件：(SJ 5) constipation (SJ 6 used more) —— 便祕支溝比外關更常用。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p248" },
  { codes: ["GB27", "GB26"], axis: "整體強度 vs 疝氣", origin: "curriculum",
    note: "課件：Similar to GB 26, which is usually stronger, but GB 27 is better for hernia —— 帶脈通常較強，疝氣則五樞較好。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p285" },
  { codes: ["LR5", "LR8"], axis: "疏散 vs 清潤", origin: "curriculum",
    note: "課件：Liv 8 herpes/genital. Liv 5 used more — Liv 8 more cooling, nourishing, Liv 5 more dispersing —— 生殖器疱疹蠡溝更常用；曲泉偏清潤，蠡溝偏疏散。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p302" },
  { codes: ["LR8", "KI6"], axis: "子宮脫垂", origin: "curriculum",
    note: "課件：(Liv 8) prolapsed uterus (K-6 better) —— 子宮脫垂照海優於曲泉。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p310" },
  { codes: ["CV3", "CV4"], axis: "月經虛實分工", origin: "curriculum",
    note: "課件：(Ren 3) More for excessive menstrual disorders — Ren 4 more for deficient menses —— 中極偏實性月經病，關元偏虛性月經病。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p320" },
  { codes: ["CV6", "CV4"], axis: "補氣血分工", origin: "curriculum",
    note: "課件：(Ren 6) Very similar to Ren 4, but more for building deficient Qi in the body. Also more for deficient Blood —— 氣海與關元相近，但更偏補氣血之虛。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p324" },
  { codes: ["GV2", "GV1"], axis: "痔瘡替代", origin: "curriculum",
    note: "課件：(DU 2) hemorrhoids (instead of DU 1) —— 痔瘡可用腰俞替代長強。",
    src: "curriculum/acupoints/AP Point Book (1).pdf#p344" },
];

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const byCode = new Map(recs.map((r) => [r.code, r]));

const fail = [];
const links = new Map();   // code → [{codes, axis, note}]

for (const p of PAIRS) {
  const [a, b] = p.codes;
  for (const c of p.codes) if (!byCode.has(c)) fail.push(`${p.codes.join(" vs ")}: ${c} 不在 361.json`);
  if (!byCode.has(a) || !byCode.has(b)) continue;

  // A pearl-sourced note must still be in the pearl. If a later curation pass
  // rewrites that sentence, this fails rather than leaving a quote attributed
  // to text that no longer says it.
  if (p.origin === "pearl") {
    const pearl = String(byCode.get(a).exam_pearl || "");
    if (!pearl.includes(p.note)) fail.push(`${a}: compare_with 的 note 不在 exam_pearl 裡（來源已改？）\n    note: ${p.note}`);
  }

  const entry = { codes: p.codes, axis: p.axis, note: p.note };
  for (const c of p.codes) {
    if (!links.has(c)) links.set(c, []);
    if (!links.get(c).some((e) => e.axis === entry.axis && e.note === entry.note)) links.get(c).push(entry);
  }
}

for (const [code, entries] of links) {
  const r = byCode.get(code);
  r.compare_with = entries;
  r.field_sources = r.field_sources || {};
  const srcs = new Set();
  for (const p of PAIRS) {
    if (!p.codes.includes(code)) continue;
    srcs.add(p.origin === "curriculum" ? p.src
      : (byCode.get(p.codes[0]).field_sources?.exam_pearl?.[0] || "exam_pearl"));
  }
  r.field_sources.compare_with = [...srcs];
}

console.log(`複習對比 compare_with — ${PAIRS.length} 組，寫入 ${links.size} 個穴（雙向）\n`);
console.log("穴位   對比對象  面向");
for (const [code, entries] of [...links].sort()) {
  for (const e of entries) {
    const other = e.codes.find((c) => c !== code);
    console.log(`${code.padEnd(6)} ${String(other).padEnd(9)} ${e.axis}`);
  }
}
const byOrigin = PAIRS.reduce((m, p) => ((m[p.origin] = (m[p.origin] || 0) + 1), m), {});
console.log(`\n來源：課件明文比較 ${byOrigin.curriculum || 0} 組 · 考點 分工句 ${byOrigin.pearl || 0} 組`);

if (fail.length) {
  console.error(`\n❌ ${fail.length} 個來源檢查失敗 —— 不寫入:\n`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("✅ 每一條 note 都對得回它的來源");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");

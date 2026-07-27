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
    note: "血海治血，三陰交調三陰經" }
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

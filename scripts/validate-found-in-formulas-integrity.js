#!/usr/bin/env node
/**
 * validate-found-in-formulas-integrity.js — 藥對的 found_in_formulas 站不站得住
 *
 * 這個欄位是方劑卡「經典對藥」區的第二個來源。`herb_pairs.json` 的 schema_note 一直寫著
 *   "formula ids where this pair does the work, so the formula card can show its pairs"
 * 但**它從來沒被接上**:2026-09-01 全庫 grep 只有這支驗證器讀它 —— 274 條策展連結、
 * 涵蓋 123 張方劑卡,一條都沒上過畫面;而方劑側的 `key_pairs` 只有 25 條卻是有渲染的。
 * 同日 Ting 裁定接線,兩側併集後方劑卡多出 240 條藥對(其中 114 張原本一條都沒有)。
 *
 * **接線之前先量了可信度,不是先接再說。** 初測 265 條可查證連結裡有 21 條的藥對成員
 * 根本不在該方 composition 裡;那 21 條先處理完才接(17 條錯連移除、部位別判為同一味、
 * 定喘湯「銀杏」補上 herb_id)。沒驗就接 = 把未驗內容當已驗送上畫面 ——
 * 那是 CLAUDE.md 第 5 條的反面(不是 fallback 說謊,是拿沒驗過的東西當驗過的用)。
 *
 * 接線之後這支就是那條線的守門。
 *
 * 四個計數，每個一個上限，**只准變少**:
 *   malformed found_in_formulas 裡不是 `formula.` 開頭字串的東西(物件、裸 slug、別的命名空間)。
 *             2026-09-06 之前這些被 `continue` 靜默跳過 —— 覆核員負控塞 {id:"formula.x"} /
 *             "si_jun_zi_tang" / "herb.x" 三種都放行,而渲染端一樣查不到。上限 0。
 *   dangling  found_in_formulas 指向不存在的方(目前 9 條 / 7 首方)
 *   mismatch  藥對某味不在該方 composition。比對會吃兩件事:
 *             · 同一味藥的兩張卡(中文名/別名交集分群)
 *             · **炮製前綴**(炙甘草 = 甘草)—— 這是寫法差異不是內容錯
 *             但**部位別不算**(栝樓皮 ≠ 瓜蔞、槐米 ≠ 槐花):那是不同藥材，
 *             判成相同會把真的錯連洗白。
 *   both_missing  藥對兩味都不在該方 —— 這一類幾乎確定是錯連，單獨計數
 *
 * 用法: node scripts/validate-found-in-formulas-integrity.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// 2026-09-01:接線同批把 21 條不成立的連結修掉後鎖到 0。
// mismatch / both_missing **一條都不准新增** —— 這條線現在會上畫面。
// dangling 9 是前向引用(指向 7 首尚未建卡的方),前批已裁定保留,只准變少。
const CEILING = { malformed: 0, dangling: 9, mismatch: 0, both_missing: 0 };

// 2026-09-06:原本是裸 JSON.parse(readFileSync) —— 檔案不在時吐一整段 ENOENT 堆疊,
// 讀 log 的人要自己從堆疊裡撈路徑。改成印檔名、exit 1。
const readJson = (rel) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  } catch (e) {
    console.log("FAIL — 讀不到 " + rel + "(" + ((e && e.code) || (e && e.name) || "error") + ":" + ((e && e.message) || "") + ")");
    console.log("  檔案缺了或不是合法 JSON;這是量不到,不是資料乾淨,不允許空跑通過。");
    process.exit(1);
  }
};
const hp = readJson("data/herbs/herb_pairs.json");
const pairs = hp.pairs || [];
const forms = readJson("data/herbs/formulas.json").records || [];
const herbs = readJson("data/herbs/herb_canon_shortlist.json").records || [];
if (!pairs.length || !forms.length || !herbs.length) {
  console.log("FAIL — 讀不到 pairs/formulas/herbs，不允許空跑通過。");
  process.exit(1);
}

const byF = new Map(forms.map((f) => [f.id, f]));
const byH = new Map(herbs.map((h) => [h.id, h]));
const zh = (id) => (byH.get(id) || {}).name_zh || String(id);

// 同一味藥的兩張卡:中文名或別名有交集就視為同一味
const nameSet = (h) => new Set([h.name_zh, ...(h.aliases_zh || [])].filter(Boolean));
const grp = new Map();
{
  let g = 0;
  for (const h of herbs) {
    if (grp.has(h.id)) continue;
    const k = "g" + (g++);
    grp.set(h.id, k);
    for (const o of herbs) if (!grp.has(o.id) && [...nameSet(h)].some((x) => nameSet(o).has(x))) grp.set(o.id, k);
  }
}
const gid = (id) => grp.get(id) || id;

// 炮製前綴:寫法差異,不是內容錯(炙甘草 = 甘草)
const PREP = /^(炙|生|炒|焦|煅|製|制|酒|蜜|鹽|醋|薑|姜|土|麩|燀|去油)+/;
const stripPrep = (s) => String(s || "").replace(PREP, "");
const samePreparation = (a, b) => {
  const A = zh(a), B = zh(b);
  if (!A || !B || A === B) return false;
  return stripPrep(A) === stripPrep(B) && stripPrep(A).length >= 2;
};
/* 部位別:Ting 裁定(2026-09-01)在這個檢查裡當成同一味 —— 藥對指名某個部位、
   方劑組成寫全株(或反之)時，連結在臨床上仍成立。
   **刻意寫成具名清單而不是模糊規則**:模糊規則(例如「名字包含」)會把真的錯連一起洗白，
   而這個檢查的價值就在於分得出「寫法不同」與「連錯方」。要加新的一組就明確加一行。 */
const PART_GROUPS = [
  ["herb.gua_lou", "herb.gua_lou_pi", "herb.gua_lou_ren"],   // 瓜蔞 / 栝樓皮 / 栝樓仁
  ["herb.huai_hua", "herb.huai_mi"],                          // 槐花 / 槐米
];
const partOf = new Map();
PART_GROUPS.forEach((g, i) => g.forEach((id) => partOf.set(id, "part" + i)));
const samePart = (a, b) => partOf.has(a) && partOf.get(a) === partOf.get(b);

let links = 0;
const malformed = [];
const dangling = new Map();
const mismatch = [];
const bothMissing = [];
for (const p of pairs) {
  for (const fid of (p.found_in_formulas || [])) {
    if (typeof fid !== "string" || !fid.startsWith("formula.")) {
      // 2026-09-06 之前這裡是 continue:形狀不對的引用直接消失,三個計數都看不到它。
      malformed.push({ pair: p.id, pairZh: p.name_zh || p.id, raw: typeof fid === "string" ? fid : JSON.stringify(fid) });
      continue;
    }
    const f = byF.get(fid);
    if (!f) { dangling.set(fid, (dangling.get(fid) || 0) + 1); continue; }
    links++;
    const compIds = (f.composition || []).map((c) => c.herb_id).filter(Boolean);
    const compG = new Set(compIds.map(gid));
    const miss = (p.herbs || []).filter((h) => !compG.has(gid(h))
      && !compIds.some((c) => samePreparation(h, c) || samePart(h, c)));
    if (!miss.length) continue;
    const row = { pair: p.id, pairZh: p.name_zh || p.id, fid, fZh: f.name_zh || fid, miss: miss.map(zh) };
    if (miss.length === (p.herbs || []).length) bothMissing.push(row);
    else mismatch.push(row);
  }
}
const nDangling = [...dangling.values()].reduce((a, b) => a + b, 0);
const counts = { malformed: malformed.length, dangling: nDangling, mismatch: mismatch.length, both_missing: bothMissing.length };

console.log("validate-found-in-formulas-integrity — 藥對→方劑的反向索引站不站得住");
console.log("  這條線 2026-09-01 起有渲染(formulaPairsSection 與 key_pairs 併集):" + links + " 條可查證連結、"
  + new Set(pairs.flatMap((p) => (p.found_in_formulas || []).filter((x) => byF.has(x)))).size + " 張方劑卡會用到。");
/* 下限(2026-09-06):可查證連結 0 條 = 欄位名變了或 build 掉欄位,不是「沒有連結所以三個計數都 0」。
   覆核員負控把每一條 found_in_formulas 改名,三個計數全 0、閘門全綠。今天 248 條。 */
if (links === 0) {
  console.log("\nFAIL — 一條可查證連結都沒抽到(found_in_formulas 今天應有 248 條),欄位名可能變了;這是量不到,不是資料乾淨,不允許空跑通過。");
  process.exit(1);
}
for (const k of Object.keys(CEILING)) {
  console.log("  " + k.padEnd(14) + String(counts[k]).padStart(3) + " / 上限 " + CEILING[k]);
}
const over = Object.keys(CEILING).filter((k) => counts[k] > CEILING[k]);
const better = Object.keys(CEILING).filter((k) => counts[k] < CEILING[k]);
if (malformed.length) {
  console.log("\n  形狀不對的引用(不是 formula. 開頭的字串;渲染端一樣查不到,以前被靜默跳過):");
  malformed.slice(0, 20).forEach((r) => console.log("    " + r.pairZh.padEnd(22) + "→ " + r.raw));
  if (malformed.length > 20) console.log("    …另有 " + (malformed.length - 20) + " 條。");
}
if (dangling.size) {
  console.log("\n  指向不存在的方(前向引用，前批已裁定「留引用不補骨架」):");
  for (const [fid, n] of dangling) console.log("    " + fid.padEnd(46) + n + " 次");
}
if (bothMissing.length) {
  console.log("\n  兩味都不在該方(幾乎確定是錯連，待裁):");
  bothMissing.forEach((r) => console.log("    " + r.pairZh.padEnd(22) + "→ " + r.fZh.padEnd(14) + " 缺:" + r.miss.join("、")));
}
if (mismatch.length) {
  console.log("\n  單味不在該方(部位別 或 方劑組成漏味 或 錯連，逐條待裁):");
  mismatch.forEach((r) => console.log("    " + r.pairZh.padEnd(22) + "→ " + r.fZh.padEnd(14) + " 缺:" + r.miss.join("、")));
}
if (better.length) {
  console.log("");
  better.forEach((k) => console.log("  ℹ 改善了:" + k + " " + CEILING[k] + " → " + counts[k] + "(把 CEILING 改成 " + counts[k] + " 鎖住)"));
}
if (over.length) {
  console.log("\nFAIL — " + over.map((k) => k + " " + counts[k] + " > " + CEILING[k]).join("、"));
  console.log("  這條線會上方劑卡的「經典對藥」區,所以錯連 = 錯的藥對出現在方劑卡上。"
    + "\n  處置:把該連結拿掉,或改指組成真的含有這條藥對全部成員的方 —— 不要改比對規則來讓它變綠。");
  process.exit(1);
}
console.log("\nPASS — 四個計數都在上限內。");

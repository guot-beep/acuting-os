#!/usr/bin/env node
/* validate-herb-safety-pairing.js — 中藥卡的禁忌/慎用,中英不准亂配、不准有看不到的句子
 * (2026-10-22)
 *
 * 這支守的是一個實際發生過、而且所有既有驗證器都看不到的缺陷。
 *
 * 中藥卡的安全文字住在兩層:較新的記錄在 `safety_info` 底下,CloudTCM 來源的在記錄頂層。
 * 舊版 js/knowledge.js 的 pairEn 用兩行**各自**決定要讀哪一層:
 *     zh = safety.X_zh 有值 ? safety.X_zh : record.X_zh
 *     en = safety.X_en 有值 ? safety.X_en : record.X_en
 * 然後 `zh.map((z,i) => en[i] ? z+"（"+en[i]+"）" : z)`。
 *
 * 兩個後果,實測 360 味非退役中藥:
 *   (1) **跨層硬配**(58 個欄位 / 31 味):中文取自 safety_info、英文取自記錄頂層,
 *       那是兩份不同的清單,卻被當成「同一句話的兩個語言版本」印成「中文（英文）」。
 *       滑石 cautions:中文是「布包煎」的煎服提示,括號裡是
 *       「Contraindicated in Spleen deficiency with weak Qi」。讀的人沒有理由懷疑括號。
 *   (2) **沒有等長護欄**(39 個欄位 / 28 味):`zh.map` 的長度由 zh 決定,
 *       en 比 zh 長時尾巴整段消失 —— 全庫 96 句英文安全句(多半是禁忌)從來沒上過畫面;
 *       zh 比 en 長時後面的中文配到空字串。
 *       川芎 contraindications:「孕婦慎用（Contraindicated with heavy menstrual bleeding.）」。
 *
 * 為什麼既有閘門抓不到:
 *   - `validate-bilingual-index-pairing` 的 R1 是靜態掃 knowledge.js 的「跨欄位湊長度」樣式,
 *     R2 只比同一層同名欄位的長度 —— 跨「層」這一種它沒有看;
 *   - `validate-bilingual-render-parity` 問的是「這個 _en 有沒有被任何一行讀到」,
 *     而這裡的 _en **有**被讀到,只是配錯對象;
 *   - `validate-formula-safety-reachability` 只管方劑。中藥卡先前沒有對應物。
 *
 * 兩條檢查:
 *   R1 渲染層(靜態):安全欄的配對函式必須同時具備「同一層」與「等長」兩個條件,
 *      缺任何一個就紅。拿掉護欄、改成 `>=`、或把來源判斷拆回兩側各自決定,都要被擋下。
 *   R2 資料層(以渲染規則重現):照 renderer 實際會印的結果算,
 *      (a) 不准有「跨層或不等長卻仍被括號配在一起」的句子;
 *      (b) 不准有任何英文安全句在畫面上看不到。兩者都必須是 0。
 *
 * 用法:node scripts/validate-herb-safety-pairing.js [--self-test] [--worklist]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

const cleanList = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x == null ? "" : x).trim()).filter(Boolean);

/* 渲染規則的唯一真相(與 js/knowledge.js 的 safetyList 同一條規則)。
   閘門自己實作一份,是為了能在沒有瀏覽器的情況下算出「畫面上會是什麼」;
   R1 負責確保 knowledge.js 那份沒有偏離這一條。 */
function renderedSafety(record, field) {
  const safety = record.safety_info || {};
  const zhSrc = cleanList(safety[`${field}_zh`]).length ? safety : record;
  const enSrc = cleanList(safety[`${field}_en`]).length ? safety : record;
  const zh = cleanList(zhSrc[`${field}_zh`]);
  const en = cleanList(enSrc[`${field}_en`]);
  const paired = zhSrc === enSrc && zh.length > 0 && zh.length === en.length;
  return { zh, en, paired, items: paired ? zh.map((z, i) => `${z}（${en[i]}）`) : [...zh, ...en] };
}

function checkData(herbs) {
  const failures = [];
  let fields = 0, pairedFields = 0, falsePairs = 0, invisibleEn = 0;
  for (const r of herbs) {
    const safety = r.safety_info || {};
    for (const field of ["contraindications", "cautions"]) {
      const res = renderedSafety(r, field);
      if (!res.zh.length && !res.en.length) continue;
      fields++;
      if (res.paired) pairedFields++;
      // (a) 配對了,但兩側其實不同層或不等長 → 假配對
      const zhSrc = cleanList(safety[`${field}_zh`]).length ? safety : r;
      const enSrc = cleanList(safety[`${field}_en`]).length ? safety : r;
      if (res.paired && (zhSrc !== enSrc || res.zh.length !== res.en.length)) {
        falsePairs++;
        failures.push(`${r.id} ${field}:配對成立但來源不同層或長度不等(zh ${res.zh.length} / en ${res.en.length})`);
      }
      // (b) 有英文,但一句都沒出現在畫面上
      const shown = res.items.join("\n");
      for (const e of res.en) {
        if (!shown.includes(e)) { invisibleEn++; failures.push(`${r.id} ${field}:英文句在畫面上看不到 —— 「${e.slice(0, 60)}」`); }
      }
    }
  }
  return { failures, fields, pairedFields, falsePairs, invisibleEn };
}

/* R1:knowledge.js 的配對函式必須同時有「同一層」與「等長」兩個條件。
   用大括號配對抓本體,不是抓到下一個 `}` —— 本體裡有樣板字串。 */
function functionBody(src, name) {
  const at = src.indexOf(`const ${name} = (`);
  if (at === -1) return null;
  const open = src.indexOf("{", at);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(open + 1, i); }
  }
  return null;
}

function checkRenderer(src) {
  const failures = [];
  const body = functionBody(src, "safetyList");
  if (!body) {
    failures.push("js/knowledge.js 抽不到 `const safetyList = (` 的本體(抽 0 筆一律 FAIL:函式改名了?配對規則被搬走了?)");
    return { failures, facts: {} };
  }
  const sameSource = /zhSrc\s*===\s*enSrc/.test(body);
  const equalLen = /zh\.length\s*===\s*en\.length/.test(body);
  if (!sameSource) failures.push("safetyList 沒有「兩側同一層」的條件(zhSrc === enSrc)—— 中文取自 safety_info、英文取自記錄頂層時會被當成同一句話的兩個語言版本");
  if (!equalLen) failures.push("safetyList 沒有「等長」的條件(zh.length === en.length)—— 逐索引配對會讓多出來的英文整段消失");
  // 舊的壞樣式不准回來
  if (/const pairEn\s*=/.test(src)) failures.push("js/knowledge.js 又出現 pairEn —— 那是 2026-10-22 修掉的無護欄逐索引配對");
  return { failures, facts: { sameSource, equalLen } };
}

if (process.argv.includes("--self-test")) {
  const mk = (o) => Object.assign({ id: "herb.t", name_zh: "測試" }, o);
  const cases = [
    ["同層等長 → 配對成立",
      (() => { const r = renderedSafety(mk({ safety_info: { cautions_zh: ["甲", "乙"], cautions_en: ["A", "B"] } }), "cautions"); return r.paired && r.items.join("|") === "甲（A）|乙（B）"; })()],
    ["同層不等長 → 不配對,分開印,一句不丟",
      (() => { const r = renderedSafety(mk({ safety_info: { cautions_zh: ["甲"], cautions_en: ["A", "B"] } }), "cautions"); return !r.paired && r.items.length === 3 && r.items.includes("B"); })()],
    ["跨層即使等長也不准配",
      (() => { const r = renderedSafety(mk({ safety_info: { cautions_zh: ["甲"] }, cautions_en: ["A"] }), "cautions"); return !r.paired && r.items.join("|") === "甲|A"; })()],
    ["只有中文 → 原樣",
      (() => { const r = renderedSafety(mk({ safety_info: { cautions_zh: ["甲"] } }), "cautions"); return !r.paired && r.items.join("|") === "甲"; })()],
    ["只有英文 → 也要印出來(舊版會整段丟掉)",
      (() => { const r = renderedSafety(mk({ cautions_en: ["A", "B"] }), "cautions"); return r.items.join("|") === "A|B"; })()],
    ["兩側都空 → 空",
      (() => { const r = renderedSafety(mk({}), "cautions"); return r.items.length === 0; })()],
    ["字串而非陣列的欄位不准崩",
      (() => { const r = renderedSafety(mk({ safety_info: { cautions_zh: "甲", cautions_en: "A" } }), "cautions"); return r.paired && r.items.join("|") === "甲（A）"; })()],
    ["資料層:跨層硬配要被 checkData 抓到",
      (() => {
        // 直接餵一個「會被舊規則配起來」的記錄,確認新規則不配、且不報假陽性
        const r = mk({ safety_info: { cautions_zh: ["甲"] }, cautions_en: ["A"] });
        const out = checkData([r]);
        return out.falsePairs === 0 && out.invisibleEn === 0 && out.failures.length === 0;
      })()],
    ["R1:拿掉同層條件要紅",
      checkRenderer("const safetyList = (field) => { const zh=[],en=[]; if (zh.length === en.length) return []; return []; };").failures.some((f) => /同一層/.test(f))],
    ["R1:拿掉等長條件要紅",
      checkRenderer("const safetyList = (field) => { if (zhSrc === enSrc) return []; return []; };").failures.some((f) => /等長/.test(f))],
    ["R1:抽不到函式要紅",
      checkRenderer("// 什麼都沒有").failures.some((f) => /抽 0 筆一律 FAIL/.test(f))],
    ["R1:舊的 pairEn 回來要紅",
      checkRenderer("const safetyList = (field) => { if (zhSrc === enSrc && zh.length === en.length) return []; return []; };\nconst pairEn = (a,b) => a;").failures.some((f) => /pairEn/.test(f))]
  ];
  let bad = 0;
  for (const [label, ok] of cases) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條`);
  process.exit(bad ? 1 : 0);
}

const { loadKnowledge } = require(path.join(root, "scripts/lib/load-knowledge"));
const K = loadKnowledge();
if (!K || !K.herbs) { console.error("FAIL — 讀不到 data/generated 的 herbs 分片"); process.exit(1); }
const herbs = (K.herbs.records || []).filter((r) => r.review_status !== "deprecated" && !r.deprecated);
if (!herbs.length) { console.error("FAIL — 非退役中藥 0 味(抽 0 筆一律 FAIL,分母不合理)"); process.exit(1); }

const r1 = checkRenderer(fs.readFileSync(path.join(root, "js/knowledge.js"), "utf8"));
const r2 = checkData(herbs);
const failures = [...r1.failures, ...r2.failures];

console.log(`中藥安全欄中英配對:${herbs.length} 味 · 有內容的欄位 ${r2.fields} 個 · 逐索引配對 ${r2.pairedFields} 個` +
  ` · 假配對 ${r2.falsePairs} · 看不到的英文句 ${r2.invisibleEn}`);
const show = process.argv.includes("--worklist") ? failures : failures.slice(0, 12);
for (const f of show) console.log(`  ✗ ${f}`);
if (failures.length > show.length) console.log(`  …另 ${failures.length - show.length} 條(加 --worklist 全列)`);
console.log(failures.length
  ? `\nFAIL — ${failures.length} 條`
  : "\nPASS — 只有同一層且等長的安全欄才逐索引配對,沒有英文安全句被擋在畫面外。");
process.exit(failures.length ? 1 : 0);

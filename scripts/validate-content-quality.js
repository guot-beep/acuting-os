#!/usr/bin/env node
/* Content QUALITY validator — the check this repo never had.

   Every other validator in scripts/ checks FORM: ids resolve, no duplicates,
   encoding is clean, relations point somewhere. None of them ever asked
   whether a field actually says anything. That is how 202 herbs sharing 26
   template sentences passed the whole suite, and how a coverage report based
   on "field is not empty" was able to call that layer complete.

   This checks SUBSTANCE:
     PLACEHOLDER  - 待補 / pending / verify-before-use filler text
     SHARED       - the same value copy-pasted across many records
     NOT_ZH       - a _zh / Chinese field holding no Chinese characters
     THIN         - present but too short to be useful

   Usage:
     node scripts/validate-content-quality.js            # summary
     node scripts/validate-content-quality.js --detail   # list offending records
     node scripts/validate-content-quality.js --layer herbs

   Reports, does not block. Exit 1 only with --strict. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DETAIL = process.argv.includes("--detail");
const STRICT = process.argv.includes("--strict");
const ONLY = (process.argv.find((a) => a.startsWith("--layer=")) || "").split("=")[1]
  || (process.argv.includes("--layer") ? process.argv[process.argv.indexOf("--layer") + 1] : null);

const PLACEHOLDER = /待補|待確認|尚未|暫無|pending|to be (added|filled|verified)|\bTBD\b|draft pending|verify (against|individual|before)|depending on herb|context only|documentation context|study differentiation|not a treatment claim|review pending|placeholder/i;

const CJK = /[㐀-䶿一-鿿]/;

const LAYERS = [
  {
    id: "acupoints",
    file: "data/acupoints/361.json",
    key: "code",
    label: (r) => `${r.code} ${r.chinese || ""}`,
    fields: [
      { name: "functions_zh", zh: true, minLen: 8 },
      { name: "indications_zh", zh: true, minLen: 6 },
      { name: "functions_en", minLen: 12 },
      { name: "indications_en", minLen: 8 },
      { name: "contraindications", minLen: 8 },
      { name: "clinical_pearls", minLen: 12 },
      { name: "muscles", minLen: 3 },
      { name: "nerves", minLen: 3 }
    ]
  },
  {
    id: "herbs",
    file: "data/herbs/herb_canon_shortlist.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "functions", minLen: 12 },
      /* 性味的值**本來就會重複** —— 全庫 221 個不同值,最多的「辛、溫」10 味、
       * 「辛、苦、溫」8 味。那是中藥學的事實,不是有人貼樣板。
       * shared 這條啟發式(值與別筆相同 = 樣板)對它是錯的:它把 107 筆
       * 正確的性味算成缺陷,於是這一欄長年顯示 20%,而實際填了 291/366。
       * sharedOk 只放給「值域本來就小的受控描述」,不放給散文欄位。 */
      /* minLen 也要跟著改:性味的標準寫法就是短的 ——「辛、溫」3 字、
       * 「苦、寒」3 字都是完整正確的答案。原本設 8,於是 209 筆正確的性味
       * 被算成「太短」。長度在這一欄不是品質訊號,填了沒填才是。 */
      { name: "properties_taste_temp", minLen: 2, sharedOk: true },
      { name: "clinical_use_note", minLen: 20 },
      { name: "dosage", minLen: 3 },
      { name: "cautions", minLen: 8 }
    ]
  },
  {
    id: "formulas",
    file: "data/herbs/formulas.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "composition", minLen: 3 },
      { name: "actions_zh", zh: true, minLen: 6 },
      /* 方劑的主治內容住在 pattern_indications_zh(222/223),indications_zh
       * 是 0/223 —— 但那不是缺口,是欄位名。渲染層本來就把兩個併起來讀
       * (js/knowledge.js:214 `...(record.indications_zh||[]), ...(record.pattern_indications_zh||[])`),
       * 所以這裡也要一起看,否則報表會說「主治覆蓋率 0%」而畫面上其實滿的。
       * 2026-09-01 之前這一欄一直被算成 223 筆全空,把 fill 線指去一個
       * 不存在的缺口。 */
      { name: "indications_zh", alt: ["pattern_indications_zh"], zh: true, minLen: 6 },
      { name: "fang_yi_zh", zh: true, minLen: 10 }
    ]
  },
  {
    id: "conditions",
    file: "data/pathology/condition_canon_shortlist.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "summary_zh", zh: true, minLen: 20 },
      { name: "red_flags_zh", zh: true, minLen: 8 },
      { name: "western_context_zh", zh: true, minLen: 20 }
    ]
  }
];

/* Wrapper files hold several arrays (formulas.json has starter_categories[8]
   AND records[115]). Picking the first array found silently measured the wrong
   one — exactly the class of bug this validator exists to catch. Prefer the
   known record keys, then fall back to the LONGEST array. */
const RECORD_KEYS = ["records", "herbs", "formulas", "points", "conditions", "entries", "items"];

function loadArray(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return null;
  const raw = JSON.parse(fs.readFileSync(full, "utf8"));
  if (Array.isArray(raw)) return raw;
  for (const key of RECORD_KEYS) if (Array.isArray(raw[key])) return raw[key];
  const arrays = Object.values(raw).filter(Array.isArray);
  if (!arrays.length) return null;
  return arrays.sort((a, b) => b.length - a.length)[0];
}

/* 物件也要攤平成它真正的文字。第一版用 String(v),物件就變成
 * "[object Object]" —— 沒有中文、長度固定 15,於是 137 張條件卡的
 * red_flags_zh(物件形狀 {finding, recommended_action, …},內容全是中文)
 * 被算成「中文欄位裡沒有中文」。那是量錯不是資料錯。
 * 同一個形狀在渲染層造成的是 [object Object] 印在卡上(已於 814c1632 修掉);
 * 在這裡造成的是一份指錯方向的覆蓋率報表。 */
const flatten = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(flatten).join(" ");
  if (typeof v === "object") return Object.values(v).map(flatten).join(" ");
  return String(v);
};

let anyFail = false;
// --json:給 check-validation-ratchet 用(2026-08-27 接線)。缺陷數 = 實質內容
// 覆蓋率低於 50% 的欄位數,不是欄位實例數 —— 這支量的是「哪些欄位整層還沒
// 有內容」(如 361 穴的 muscles/nerves 全空),那是 fill 線的長期回填,棘輪
// 只需要保證它不再變多。逐欄明細照舊由人類可讀模式輸出。
const JSON_MODE = process.argv.includes("--json");
const failingFields = [];
const grand = { fields: 0, good: 0 };
// 靜音人類可讀輸出:ratchet 對整份 stdout 做 JSON.parse,混一行報表就會炸。
// 用 no-op 取代而不是逐處加判斷 —— 這支的列印散在整個掃描迴圈裡,逐處改
// 反而容易漏一處,而漏一處的症狀是 ratchet 報「讀不到缺陷數」而非明顯錯誤。
const realLog = console.log;
if (JSON_MODE) console.log = () => {};

for (const layer of LAYERS) {
  if (ONLY && ONLY !== layer.id) continue;
  const records = loadArray(layer.file);
  if (!records) { console.log(`\n${layer.id}: file not found (${layer.file}) — skipped`); continue; }

  console.log(`\n=== ${layer.id} — ${records.length} records — ${layer.file} ===`);
  console.log(
    "field".padEnd(24) + "empty".padStart(7) + "filler".padStart(8) +
    "shared".padStart(8) + "notZh".padStart(7) + "thin".padStart(6) + "GOOD".padStart(8) + "  quality"
  );

  for (const spec of layer.fields) {
    const counts = { empty: 0, filler: 0, shared: 0, notZh: 0, thin: 0, good: 0 };
    const offenders = { filler: [], shared: [], notZh: [], thin: [] };

    /* how many records share each exact value */
    /* 取值時把 alt(同義的姊妹欄位)一起看 —— 渲染層併集讀哪幾個,這裡就
     * 併集讀哪幾個,否則報表量的是欄位名而不是畫面。 */
    const pick = (r) => {
      const names = [spec.name, ...(spec.alt || [])];
      for (const n of names) {
        const v = r[n];
        if (v !== undefined && v !== null && flatten(v).trim()) return v;
      }
      return r[spec.name];
    };

    const freq = new Map();
    for (const r of records) {
      const v = JSON.stringify(pick(r) ?? "");
      if (v === '""' || v === "[]" || v === "null") continue;
      freq.set(v, (freq.get(v) || 0) + 1);
    }

    for (const r of records) {
      const raw = pick(r);
      const text = flatten(raw).trim();
      if (!text) { counts.empty += 1; continue; }

      const key = JSON.stringify(raw ?? "");
      if (PLACEHOLDER.test(text)) {
        counts.filler += 1; offenders.filler.push(layer.label(r)); continue;
      }
      if (!spec.sharedOk && (freq.get(key) || 0) > 1) {
        counts.shared += 1; offenders.shared.push(`${layer.label(r)} (x${freq.get(key)})`); continue;
      }
      if (spec.zh && !CJK.test(text)) {
        counts.notZh += 1; offenders.notZh.push(layer.label(r)); continue;
      }
      if (text.length < (spec.minLen || 0)) {
        counts.thin += 1; offenders.thin.push(`${layer.label(r)} "${text.slice(0, 24)}"`); continue;
      }
      counts.good += 1;
    }

    const pct = Math.round((counts.good / records.length) * 100);
    grand.fields += records.length;
    grand.good += counts.good;
    if (pct < 50) { anyFail = true; failingFields.push(`${layer.id}.${spec.name}=${pct}%`); }

    console.log(
      spec.name.padEnd(24) +
      String(counts.empty).padStart(7) + String(counts.filler).padStart(8) +
      String(counts.shared).padStart(8) + String(counts.notZh).padStart(7) +
      String(counts.thin).padStart(6) + String(counts.good).padStart(8) +
      `  ${pct}%${pct < 50 ? "  <-- " : ""}`
    );

    if (DETAIL) {
      for (const kind of ["filler", "shared", "notZh", "thin"]) {
        if (!offenders[kind].length) continue;
        console.log(`    ${kind} (${offenders[kind].length}): ${offenders[kind].slice(0, 6).join(", ")}${offenders[kind].length > 6 ? " …" : ""}`);
      }
    }
  }
}

console.log(`\n=== overall ===`);
console.log(`field-instances checked : ${grand.fields}`);
console.log(`substantive             : ${grand.good}  (${Math.round(grand.good / grand.fields * 100)}%)`);
console.log(`\nempty  = nothing there            filler = 待補/pending/verify-later text`);
console.log(`shared = same value as other records (template, not content)`);
console.log(`notZh  = Chinese field with no Chinese   thin = present but too short\n`);

if (JSON_MODE) {
  console.log = realLog;
  const byCode = {};
  for (const f of failingFields) byCode[f] = 1;
  console.log(JSON.stringify({ defects: failingFields.length, by_code: byCode }));
  process.exit(0);
}

if (STRICT && anyFail) process.exit(1);

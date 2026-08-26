#!/usr/bin/env node
/* Formula CORRECTNESS checks — the gap that let a wrong 六一散 composition ship.

   The existing validators check FORM (non-empty, no template sentences).
   None of them could catch "the composition is simply wrong". Ting caught that
   by hand. This script catches the mechanical classes of wrongness so she
   doesn't have to, and so bulk import can stay fast.

   Checks (all instant, no network):
     1. every composition herb resolves to the herb canon        → broken link
     2. no duplicate herb inside one composition                 → import bug
     3. formula has composition at all                           → gap
     4. composition has a 君 (chief)                             → incomplete
     5. NAME-ENCODED HERB COUNT for formulas whose Chinese name
        states how many herbs it has (四君子湯=4, 八珍湯=8 …)      → wrong count
     6. per-herb dose present                                    → gap

   Check 5 uses a hand-verified list ONLY. Names like 四逆湯 (four rebellions,
   3 herbs) and 二陳湯 (two aged herbs, more than 2) do NOT encode a count and
   are deliberately excluded — a naive number-parser would produce false alarms.

   is_alternate 條目（括號替代註記，如「(黨參)」對人參）與 review_status=deprecated
   的退役記錄不算進任何結構檢查——見 2026-08-24 修法：is_alternate 有 js/knowledge.js
   既有精確排除先例，deprecated 有 validate-formula-composition-signatures.js /
   validate-relations.js 既有豁免先例；兩者都不是資料錯，是這支驗證器少排除的。

   Usage: node scripts/validate-formula-correctness.js [--verbose] [--json]
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VERBOSE = process.argv.includes("--verbose");
const AS_JSON = process.argv.includes("--json");

const load = (p) => {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
  return Array.isArray(j) ? j : (j.records || Object.values(j).find(Array.isArray) || []);
};

const formulas = load("data/herbs/formulas.json");
const herbs = load("data/herbs/herb_canon_shortlist.json");

/* herb lookup by id, 中文名, and pinyin — compositions reference herbs
   inconsistently across import batches, so accept any of them. */
const herbKey = new Set();
for (const h of herbs) {
  if (h.id) herbKey.add(String(h.id).toLowerCase());
  if (h.name_zh) herbKey.add(String(h.name_zh).trim());
  if (h.pinyin) herbKey.add(String(h.pinyin).toLowerCase().replace(/\s+/g, "_"));
}
const resolves = (item) => {
  const cands = [item.herb_id, item.herb_zh, item.name_zh, item.pinyin];
  return cands.some((c) => {
    if (!c) return false;
    const s = String(c).trim();
    return herbKey.has(s) || herbKey.has(s.toLowerCase()) ||
           herbKey.has(s.toLowerCase().replace(/\s+/g, "_")) ||
           herbKey.has("herb." + s.toLowerCase().replace(/\s+/g, "_"));
  });
};

/* Hand-verified: Chinese name genuinely encodes the herb count. */
const NAME_COUNT = {
  "四君子湯": 4, "四物湯": 4, "六味地黃丸": 6, "八珍湯": 8,
  "十全大補湯": 10, "五苓散": 5, "六一散": 2, "四妙勇安湯": 4,
  "三子養親湯": 3, "五皮飲": 5, "四神丸": 4
};

const issues = [];
const add = (sev, formula, kind, detail) =>
  issues.push({ sev, id: formula.id, name: formula.name_zh || formula.id, kind, detail });

for (const f of formulas) {
  // 退役記錄不進結構檢查（DECISIONS D6：退役走 review_status=deprecated，
  // 組成保持留白正是退役狀態的一部分——不是缺漏，見
  // validate-formula-composition-signatures.js / validate-relations.js 同款豁免）。
  if (f.review_status === "deprecated") continue;

  const comp = f.composition || [];

  if (!comp.length) { add("GAP", f, "no-composition", "組成完全空白"); continue; }

  // 1 + 2 + 6
  const seen = new Set();
  let unresolved = [], noDose = 0;
  for (const item of comp) {
    const label = item.herb_zh || item.name_zh || item.herb_id || item.pinyin || "(unnamed)";
    if (seen.has(label)) add("ERROR", f, "duplicate-herb", `組成中重複：${label}`);
    seen.add(label);
    if (!resolves(item)) unresolved.push(label);
    if (!(item.dose_g || item.decoction_reference_g || item.dose_range || item.classical_amount_text)) noDose += 1;
  }
  if (unresolved.length) add("ERROR", f, "herb-not-in-canon", `查無此藥：${unresolved.join("、")}`);
  if (noDose) add("GAP", f, "missing-dose", `${noDose}/${comp.length} 味無劑量`);

  // 4
  const hasChief = comp.some((c) => /君/.test(String(c.role_zh || "")) || /chief/i.test(String(c.role_en || "")));
  if (!hasChief) add("GAP", f, "no-chief", "組成無君藥標註");

  // 5 — the check that would have caught a wrong 六一散.
  // is_alternate 條目（如「(黨參)」對人參的替代註記）不算進名稱編碼的味數——
  // js/knowledge.js:2555 的比較表渲染已經用同一個排除規則；100% 的括號記法
  // 條目（83 例）都帶著這個欄位。四君子湯「4 味」與八珍湯「8 味」原本因為
  // 這條替代註記被誤判成 5/9 味——不是資料錯，是這支驗證器沒排除替代項。
  const realCount = comp.filter((c) => !c.is_alternate).length;
  const expect = NAME_COUNT[String(f.name_zh || "").trim()];
  if (expect && realCount !== expect) {
    add("ERROR", f, "wrong-herb-count", `方名表示 ${expect} 味，實際 ${realCount} 味（不含替代註記）`);
  }
}

const bySev = { ERROR: issues.filter((i) => i.sev === "ERROR"), GAP: issues.filter((i) => i.sev === "GAP") };

if (AS_JSON) {
  const byCode = {};
  for (const i of issues) (byCode[i.kind] = byCode[i.kind] || []).push(i);
  console.log(JSON.stringify({
    defects: issues.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
  }));
  process.exit(0);
}

console.log(`\nformulas checked: ${formulas.length}   herb canon: ${herbs.length}\n`);
console.log(`ERRORS (likely wrong data): ${bySev.ERROR.length}`);
console.log(`GAPS   (incomplete):        ${bySev.GAP.length}\n`);

const show = (list, cap) => {
  const byKind = {};
  list.forEach((i) => (byKind[i.kind] = byKind[i.kind] || []).push(i));
  for (const [kind, arr] of Object.entries(byKind)) {
    console.log(`  ${kind}  (${arr.length})`);
    arr.slice(0, VERBOSE ? 999 : cap).forEach((i) => console.log(`      ${i.name.padEnd(14)} ${i.detail}`));
    if (!VERBOSE && arr.length > cap) console.log(`      … +${arr.length - cap} more (--verbose)`);
  }
};

if (bySev.ERROR.length) { console.log("=== ERRORS ==="); show(bySev.ERROR, 8); console.log(""); }
if (bySev.GAP.length) { console.log("=== GAPS ==="); show(bySev.GAP, 5); console.log(""); }

process.exitCode = bySev.ERROR.length ? 1 : 0;

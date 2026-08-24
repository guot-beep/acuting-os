#!/usr/bin/env node
/**
 * apply-zh-term-backfill.js — 把 status=applied 的中文譯詞回填進方劑卡的中文欄。
 *
 * 只動 data/herbs/formulas.json 的 treats_zh / modern_applications_zh，
 * **同索引原地替換**；_en 陣列一個位元組都不准變——英文因此不會消失，
 * 它仍在同索引的 _en 欄（這是「只加深不刪除」在本次改動的具體形式）。
 *
 * 每一次執行都自我抓包，任一條不成立就中止不寫檔：
 *   A1 只有兩個目標陣列可能變動，其餘欄位深度比對必須完全相同
 *   A2 陣列長度不變（_en/_zh 索引對齊是卡片渲染的前提）
 *   A3 所有 _en 陣列前後逐字元相同
 *   A4 每個被改的格子：舊值不含中文、新值含中文、數字集合相同、
 *      且同索引的 _en 與舊值一致（英文有備份才准改）
 *   A5 實際改動格數 == 詞表宣告的格數
 *   A6 兩個英文詞正規化後同鍵時，譯文必須相同（否則後者靜默蓋前者）
 *
 * Usage: node scripts/apply-zh-term-backfill.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = "data/herbs/formulas.json";
const LEDGER = "data/audits/en_zh_term_crosswalk.json";
const TARGET_FIELDS = [["treats_zh", "treats_en"], ["modern_applications_zh", "modern_applications_en"]];
const hasCJK = (s) => /[一-鿿㐀-䶿]/.test(String(s));
const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[.．,，;；]+$/, "");
const digits = (s) => (String(s).match(/[0-9]/g) || []).sort().join("");

const dryRun = process.argv.includes("--dry-run");
const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const before = JSON.parse(raw);
const after = JSON.parse(raw);
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER), "utf8"));

const dict = new Map();
const collisions = [];
let expectedSlots = 0;
for (const t of ledger.terms) {
  if (t.status !== "applied") continue;
  const k = norm(t.term_en);
  // A6：兩個英文詞正規化後同鍵、譯文卻不同 → 後者會靜默蓋掉前者，而格數斷言
  // 仍然會通過（總數不變）。大小寫變體是常態，譯文分歧不是。
  if (dict.has(k) && dict.get(k) !== t.zh) collisions.push(`A6 "${k}" 有兩個不同譯文：${dict.get(k)} / ${t.zh}`);
  dict.set(k, t.zh);
  expectedSlots += t.count;
}

const fail = [...collisions];
let changed = 0;
const changedByField = {};
after.records.forEach((rec, ri) => {
  for (const [zk, ek] of TARGET_FIELDS) {
    const z = rec[zk], e = rec[ek];
    if (!Array.isArray(z)) continue;
    z.forEach((v, i) => {
      if (hasCJK(v)) return;
      const zh = dict.get(norm(v));
      if (!zh) return;
      // A4：英文必須在同索引的 _en 有備份，才准改
      if (!Array.isArray(e) || e[i] === undefined || norm(e[i]) !== norm(v)) {
        fail.push(`A4 ${rec.id} ${zk}[${i}] 的英文在 ${ek} 沒有同索引備份，拒絕改動`);
        return;
      }
      if (digits(v) !== digits(zh)) { fail.push(`A4 ${rec.id} ${zk}[${i}] 數字集合不同：${v} → ${zh}`); return; }
      if (!hasCJK(zh)) { fail.push(`A4 ${rec.id} ${zk}[${i}] 譯文不含中文`); return; }
      z[i] = zh;
      changed++;
      changedByField[zk] = (changedByField[zk] || 0) + 1;
    });
  }
});

// A1/A2/A3：把兩個目標陣列抽掉之後，全檔必須完全相同
const strip = (j) => {
  const c = JSON.parse(JSON.stringify(j));
  for (const rec of c.records) for (const [zk] of TARGET_FIELDS) delete rec[zk];
  return JSON.stringify(c);
};
if (strip(before) !== strip(after)) fail.push("A1 目標陣列以外的內容被動到了");
before.records.forEach((rec, ri) => {
  for (const [zk, ek] of TARGET_FIELDS) {
    const b = rec[zk], a = after.records[ri][zk];
    if (Array.isArray(b) !== Array.isArray(a)) fail.push(`A2 ${rec.id} ${zk} 型別變了`);
    else if (Array.isArray(b) && b.length !== a.length) fail.push(`A2 ${rec.id} ${zk} 長度 ${b.length}→${a.length}`);
    if (JSON.stringify(rec[ek]) !== JSON.stringify(after.records[ri][ek])) fail.push(`A3 ${rec.id} ${ek} 被動到了`);
  }
});
if (changed !== expectedSlots) fail.push(`A5 實改 ${changed} 格 ≠ 詞表宣告 ${expectedSlots} 格`);

console.log(JSON.stringify({ 詞數: dict.size, 預期格數: expectedSlots, 實改格數: changed, 分欄: changedByField }, null, 1));
if (fail.length) {
  console.error(`✗ 抓包 ${fail.length} 條，未寫檔：`);
  fail.slice(0, 20).forEach((f) => console.error("  " + f));
  process.exit(1);
}
if (dryRun) { console.log("✓ 全部斷言通過（--dry-run，未寫檔）"); process.exit(0); }
fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(after, null, 2) + "\n");
console.log(`✓ 全部斷言通過，已寫入 ${FILE}`);

#!/usr/bin/env node
/**
 * validate-formula-hdi-review.js
 *
 * `herb_drug_interactions_en` 從來沒有被渲染過(見 TING_DECISION_QUEUE §A0b)。
 * 「還沒接上畫面」不是安全機制 —— 哪天有人接上去,26 段沒人審過的中西藥交互
 * 敘述就一次全上。這支把「0 條未審核內容進入 UI」變成可執行的規則:
 *
 *   1. 每一段敘述都必須在 data/quality/formula_hdi_review.json 有對應審查紀錄
 *   2. 紀錄用 text_sha1 釘住「當時審的是哪一句」——
 *      改了字就等於沒審過,驗證器會重新報它未審
 *   3. 只有 render_eligible=true 的條目允許進畫面
 *
 * 第 2 條是重點。用 id+index 當鍵而不驗內容的話,把一句話整個換掉會沿用上一句
 * 的通過紀錄 —— 審查就變成給位置蓋章,不是給內容蓋章。
 *
 * BLOCKING(不是 NOTE):這一條沒有歷史積欠要照顧 —— 26 段全部已審。
 * 新增一段沒審過的敘述就該當場紅,不是排進待辦。
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const formulas = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const review = JSON.parse(fs.readFileSync(path.join(ROOT, "data/quality/formula_hdi_review.json"), "utf8"));
const entries = review.entries || {};

const sha = (s) => crypto.createHash("sha1").update(String(s).trim()).digest("hex").slice(0, 10);

const unreviewed = [];
const changed = [];
const eligible = [];
let total = 0;

for (const rec of formulas.records || formulas) {
  (rec.herb_drug_interactions_en || []).forEach((text, i) => {
    total++;
    const key = `${rec.id}#${i}`;
    const entry = entries[key];
    if (!entry) return unreviewed.push(`${key}  "${String(text).trim().slice(0, 60)}…"`);
    if (entry.text_sha1 !== sha(text)) {
      return changed.push(`${key}  審查紀錄是 ${entry.text_sha1},現在的內容是 ${sha(text)}`);
    }
    if (entry.render_eligible === true) eligible.push(key);
  });
}

// 反向:審查紀錄指向已不存在的敘述(例如被移進 quarantine),留著會讓數字說謊。
const stale = Object.keys(entries).filter((key) => {
  const [id, idx] = key.split("#");
  const rec = (formulas.records || formulas).find((r) => r.id === id);
  return !rec || !(rec.herb_drug_interactions_en || [])[Number(idx)];
});

console.log(`formula herb-drug interaction review\n`);
console.log(`  資料裡的敘述        ${total}`);
console.log(`  已審且內容未變      ${total - unreviewed.length - changed.length}`);
console.log(`  未審                ${unreviewed.length}`);
console.log(`  審後被改動          ${changed.length}`);
console.log(`  允許進畫面          ${eligible.length}${eligible.length ? "  " + eligible.join(" ") : ""}`);
console.log(`  紀錄指向已消失的敘述 ${stale.length}${stale.length ? "  " + stale.join(" ") : ""}`);

for (const u of unreviewed) console.log(`\n  ⛔ 未審  ${u}`);
for (const c of changed) console.log(`\n  ⛔ 內容已改,需重審  ${c}`);
for (const s of stale) console.log(`\n  ⚠️  紀錄無對應敘述(可刪)  ${s}`);

const fail = unreviewed.length + changed.length;
console.log(fail ? `\nFAIL — ${fail} blocking defects.` : `\nPASS — no blocking defects.`);
process.exit(fail ? 1 : 0);

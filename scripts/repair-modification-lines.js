#!/usr/bin/env node
/**
 * repair-modification-lines.js — 把被拆碎的加減條目併回一行。
 *
 * 人參敗毒散的「常見加減與鑑別」在卡片上長這樣：
 *     • For Wind predominant Bi:
 *     • + 10g Rx. Saposhnikoviae
 *     • Fang Feng
 * 一味藥被拆成三行，藥名還跟拉丁名分家 —— 讀起來像亂碼。Ting 要的是麻黃湯那種：
 *     • 喘甚者：加重杏仁用量，或加蘇子 9g、桑白皮 9g 降氣平喘
 *
 * 這支只做**確定安全**的一件事：`+ <劑量> <拉丁名>` 後面緊接一行純拼音時，
 * 那是同一味藥被抽取器切斷，合併成 `+ Fang Feng 10g（Rx. Saposhnikoviae）`。
 * 118 組。
 *
 * **不做**的事：把加減歸到它的標題底下。來源裡「For Wind predominant Bi:」和
 * 「For Cold predominant Bi:」兩行相鄰，中間沒有內容 —— 哪一味藥屬於哪一證，
 * 抽取時就已經失去了。猜一個歸屬會讓卡片看起來完整而實際是編的。標題保持原樣，
 * 由渲染層當成小標而不是項目符號。
 *
 *   node scripts/repair-modification-lines.js            # dry run
 *   node scripts/repair-modification-lines.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const FILE = "data/herbs/formulas.json";

const FIELDS = ["modifications_zh", "modifications_en", "ad_modifications_en"];
const isAdd = (s) => /^\s*\+/.test(s);
/* A bare pinyin continuation: Title Case words, no leading +, no dose, no
   punctuation that would make it a sentence. "Fang Feng" yes, "For Damp
   predominant Bi" no (lowercase words), "+ Sm. Coicis" no. */
const isPinyinTail = (s) => /^[A-Z][a-zA-Z]*(\s+[A-Z][a-zA-Z]*){0,3}$/.test(String(s).trim());

const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc.formulas;

let merged = 0;
const samples = [];
for (const r of recs) {
  for (const f of FIELDS) {
    if (!Array.isArray(r[f])) continue;
    const out = [];
    for (let i = 0; i < r[f].length; i++) {
      const cur = r[f][i];
      const next = r[f][i + 1];
      if (typeof cur === "string" && typeof next === "string" && isAdd(cur) && isPinyinTail(next)) {
        // 「+ 10g Rx. Saposhnikoviae」 + 「Fang Feng」 → 「+ Fang Feng 10g（Rx. Saposhnikoviae）」
        const body = cur.replace(/^\s*\+\s*/, "").trim();
        const dose = (/(\d+(?:\.\d+)?\s*(?:g|克|片|枚))/i.exec(body) || [])[1] || "";
        const latin = body.replace(dose, "").trim().replace(/^[,;]|[,;]$/g, "").trim();
        const line = `+ ${next.trim()}${dose ? " " + dose.replace(/\s+/g, "") : ""}${latin ? `（${latin}）` : ""}`;
        out.push(line);
        if (samples.length < 8) samples.push(`${r.name_zh}: ${cur.trim()} ⏎ ${next.trim()}  →  ${line}`);
        merged++;
        i++;                                  // the pinyin line is consumed
        continue;
      }
      out.push(cur);
    }
    if (APPLY) r[f] = out;
  }
}

console.log(`合併被拆開的加減條目: ${merged} 組`);
samples.forEach((s) => console.log("   " + s));

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else console.log("\nDry run. Use --apply to write.");

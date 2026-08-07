#!/usr/bin/env node
/**
 * fix-punctuation.js — 只修標點，一個字都不刪。
 *
 * Ting 2026-08-07:「小問題不用清空 這樣我空很多地方更麻煩 你看到就把標點符號
 * 改一下就好」。所以這支不判斷內容對錯，只把同一次填充留下的標點殘渣掃乾淨：
 *   調和諸藥。。      → 調和諸藥。
 *   滋陰養陰,,熱與    → 滋陰養陰，熱與
 *   清熱瀉火，。      → 清熱瀉火。
 *
 * 掃全記錄的每一個字串欄位（前一支只掃 composition 底下的三個欄位，所以
 * actions_zh、applications_zh、english_exam_track.* 裡的殘渣沒被清到）。
 *
 * 安全性：規則全部是**標點對標點**的取代，沒有任何一條會移除中文、英文或數字。
 * 中文字元序列比對必須前後完全相同，check-formula-no-loss 會確認這件事。
 *
 *   node scripts/fix-punctuation.js            # dry run
 *   node scripts/fix-punctuation.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const FILE = "data/herbs/formulas.json";

function tidy(s) {
  let t = s;
  /* Ellipsis first, before the doubled-period rule eats it. Runs of ASCII dots
     inside Chinese prose are ellipses, not stray punctuation —「胃脘痛...等等」,
     「魂之居也......以生血氣」— and Chinese typography sets them as ……. */
  t = t.replace(/(?<=[一-鿿「」『』，、])\.{2,}/g, "……");
  t = t.replace(/\.{2,}(?=[一-鿿「」『』])/g, "……");
  t = t.replace(/[。]{2,}/g, "。");
  t = t.replace(/[，]{2,}/g, "，");
  t = t.replace(/[,]{2,}/g, "，");          // ASCII doubles came from the same fill
  t = t.replace(/[、]{2,}/g, "、");
  t = t.replace(/[；;]{2,}/g, "；");
  t = t.replace(/[，,、；;]+。/g, "。");
  t = t.replace(/。[，,、；;]+/g, "。");
  t = t.replace(/\s+([，。、；：！？])/g, "$1");   // space before CJK punctuation
  t = t.replace(/([，。、；：！？])[ \t]+(?=[一-鿿])/g, "$1");  // and after it, before 中文
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc.formulas;

let fixed = 0;
const samples = [];
const walk = (o) => {
  if (Array.isArray(o)) {
    o.forEach((v, i) => {
      if (typeof v === "string") {
        const t = tidy(v);
        if (t !== v) { if (APPLY) o[i] = t; fixed++; if (samples.length < 10) samples.push(`${JSON.stringify(v.slice(0, 44))} → ${JSON.stringify(t.slice(0, 44))}`); }
      } else walk(v);
    });
  } else if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") {
        const t = tidy(v);
        if (t !== v) { if (APPLY) o[k] = t; fixed++; if (samples.length < 10) samples.push(`[${k}] ${JSON.stringify(v.slice(0, 40))} → ${JSON.stringify(t.slice(0, 40))}`); }
      } else walk(v);
    }
  }
};
walk(recs);

console.log(`標點修正: ${fixed} 個字串`);
samples.forEach((s) => console.log("   " + s));

/* Prove no character other than punctuation moved. */
const strip = (o, into = []) => {
  if (Array.isArray(o)) o.forEach((v) => strip(v, into));
  else if (o && typeof o === "object") Object.values(o).forEach((v) => strip(v, into));
  else if (typeof o === "string") into.push(o.replace(/[^一-鿿A-Za-z0-9]/g, ""));
  return into;
};
const before = strip(JSON.parse(raw).records || JSON.parse(raw).formulas).join("|");
const after = strip(recs).join("|");
console.log(before === after ? "字元檢查：中文／英文／數字完全未變 ✓" : "*** 字元檢查失敗 —— 不要套用 ***");

if (APPLY && before === after) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else if (!APPLY) console.log("\nDry run. Use --apply to write.");

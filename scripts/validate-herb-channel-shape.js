/* 中藥歸經:值要是乾淨的經名、三個顯示點與搜尋索引要同一條鏈(2026-09-07,包 D 審查 H3 / M4)
 *
 * 審查抓到:茯苓 tcm_properties.meridian_tropism_zh[3] 是「肺經（雲端中醫另列;Chenoweth 作 HT/SP/KD 三經）」——
 * 一句編輯注記被塞進經名陣列,統一顯示鏈之後表頭 / chip / 清單卡三處都把它當第四個經印出來;而 13 支既有驗證器
 * 把渲染鏈改回舊版、把注記留在陣列裡,全部原字不動 PASS。這支守兩件事:
 *   1. 資料:tcm_properties.meridian_tropism_zh 與 channels_zh 的每個元素都要是「XX經 / XX脈」(1–4 個漢字 + 經/脈);
 *      channels_entered(無來源、鏈的最後一位)裡的英文 / 縮寫只算 WARN 並報數,不擋。
 *   2. 程式:js/knowledge.js 只有一份 herbChannelsZh,表頭 / chip / 清單卡三處都用它,搜尋索引同時含 channels_zh
 *      (卡上看得到的經,搜得到;審查 M4:黃芩卡顯示脾經、搜「脾經」卻找不到)。
 * 用法:node scripts/validate-herb-channel-shape.js [--self-test]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const { loadKnowledge } = require("./lib/load-knowledge");

const SHAPE = /^[一-龥]{1,4}(經|脈)$/;

function checkData(herbs) {
  const failures = [], warnings = [];
  for (const r of herbs) {
    const props = (r.tcm_properties || {}).meridian_tropism_zh || [];
    for (const v of props) if (!SHAPE.test(String(v))) failures.push(`${r.id} tcm_properties.meridian_tropism_zh 含非經名元素:「${String(v).slice(0, 60)}」`);
    for (const v of (r.channels_zh || [])) if (!SHAPE.test(String(v))) failures.push(`${r.id} channels_zh 含非經名元素:「${String(v).slice(0, 60)}」`);
    for (const v of (r.channels_entered || [])) if (!SHAPE.test(String(v))) warnings.push(`${r.id} channels_entered:「${String(v).slice(0, 40)}」`);
  }
  return { failures, warnings };
}

function checkCode(src) {
  const failures = [];
  const impls = (src.match(/function herbChannelsZh\(/g) || []).length;
  if (impls !== 1) failures.push(`herbChannelsZh 實作有 ${impls} 份(要剛好 1 份)`);
  const anchors = [
    [/\["歸經 Channels", cleanList\(herbChannelsZh\(record\)\)/, "詳情表頭"],
    [/: herbChannelsZh\(record\)\)\)\}/, "詳情 chip(中文分支)"],
    [/esc\(herbChannelsZh\(h\)\.join\(/, "清單卡 k-meta"]
  ];
  for (const [re, label] of anchors) if (!re.test(src)) failures.push(`${label} 沒有走 herbChannelsZh`);
  const stale = src.match(/record\.channels_entered \|\| record\.channels_zh/g) || [];
  if (stale.length) failures.push(`仍有 ${stale.length} 處舊鏈 channels_entered || channels_zh`);
  // 直接對中藥索引那一行:檔裡有好幾個 `const text = [`(方劑、鑑別表…),用最近的 `].join` 圈範圍會圈到別段。
  const idxLine = src.match(/\.\.\.\(h\.channels_entered \|\| \[\]\),[^\n]*\n/);
  if (!idxLine) failures.push("找不到中藥搜尋索引裡的 channels_entered 那一行");
  else if (!/\.\.\.\(h\.channels_zh \|\| \[\]\)/.test(idxLine[0]) || !/meridian_tropism_zh/.test(idxLine[0])) failures.push("中藥搜尋索引沒有同時納入 channels_zh / meridian_tropism_zh(卡上看得到的經要搜得到)");
  return failures;
}

if (process.argv.includes("--self-test")) {
  const src = fs.readFileSync(path.join(root, "js/knowledge.js"), "utf8");
  const cases = [
    ["乾淨經名要綠", checkData([{ id: "h", channels_zh: ["肺經", "膀胱經"], tcm_properties: { meridian_tropism_zh: ["心包經", "督脈"] } }]).failures.length === 0],
    ["注記塞進 props 要紅", checkData([{ id: "h", tcm_properties: { meridian_tropism_zh: ["肺經（雲端中醫另列）"] } }]).failures.length === 1],
    ["英文塞進 channels_zh 要紅", checkData([{ id: "h", channels_zh: ["Spleen"] }]).failures.length === 1],
    ["英文塞進 channels_entered 只 WARN", (() => { const r = checkData([{ id: "h", channels_entered: ["SP"] }]); return r.failures.length === 0 && r.warnings.length === 1; })()],
    ["現行程式要綠", checkCode(src).length === 0],
    ["表頭改回舊鏈要紅", checkCode(src.replace('cleanList(herbChannelsZh(record))', 'cleanList(record.channels_entered || record.channels_zh)')).length > 0],
    ["搜尋索引拿掉 channels_zh 要紅", checkCode(src.replace(/\.\.\.\(h\.channels_zh \|\| \[\]\),\s*/, "")).length > 0]
  ];
  let bad = 0;
  for (const [label, ok] of cases) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條`);
  process.exit(bad ? 1 : 0);
}

const K = loadKnowledge();
if (!K) { console.error("FAIL — 讀不到 data/generated 知識分片(先跑 node scripts/build-data.js)"); process.exit(1); }
const herbs = (K.herbs && K.herbs.records) || [];
if (!herbs.length) { console.error("FAIL — herbs 0 筆(抽 0 筆一律 FAIL)"); process.exit(1); }
const data = checkData(herbs);
const code = checkCode(fs.readFileSync(path.join(root, "js/knowledge.js"), "utf8"));
console.log(`中藥歸經:${herbs.length} 味 · 有來源欄(props/channels_zh)非經名元素 ${data.failures.length} · channels_entered 非經名(WARN)${data.warnings.length}`);
for (const f of data.failures) console.log(`  ✗ ${f}`);
for (const f of code) console.log(`  ✗ ${f}`);
if (data.warnings.length) console.log(`  ⚠ channels_entered 英文/縮寫 ${data.warnings.length} 個(無來源欄,鏈的最後一位;整批去留待 Ting)例:${data.warnings.slice(0, 3).join(" · ")}`);
const bad = data.failures.length + code.length;
console.log(bad ? `\nFAIL — ${bad} 條` : "\nPASS — 有來源的歸經欄都是乾淨經名;三個顯示點與搜尋索引同一條鏈。");
process.exit(bad ? 1 : 0);

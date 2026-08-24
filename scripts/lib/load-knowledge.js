/**
 * load-knowledge.js — node 端唯一的知識分片載入器。
 *
 * P1 分包（2026-08-24）之後，瀏覽器端由 index.html 的六個 <script> 合流
 * ACUTING_KNOWLEDGE；node 端的每個消費者都必須走這裡，不准自己 readFileSync
 * 解析——generate-care-draft 曾用「單一賦值 + 裸 JSON RHS」的正則硬解發射
 * 格式，發射格式一改它就靜默退化（catch → null → 標籤全變 raw id，exit 0）。
 * 這個檔案是那條事故的永久修法：發射格式只有 build-data.js 與這裡兩個地方
 * 知道，兩邊同 repo 同 PR 改。
 *
 * loadKnowledge()            → ACUTING_KNOWLEDGE 或 null（任一片讀不到就 null，
 *                              保留各呼叫端「誠實降級/大聲失敗」的自主權）
 * loadGeneratedGlobal(rel,g) → 單一 generated 檔的某個 global（points_361 等）
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
// 與 build-data.js 的 KNOWLEDGE_PARTS 同序。core 片帶 __expected 清單，
// 但 node 端不靠它——這裡讀不到檔案就是 null，沒有部分成功。
const SHARDS = ["core", "ref", "rx", "mm", "dx", "pat"];

function evalInto(g, rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
  new Function("globalThis", src + ";")(g);
}

function loadKnowledge() {
  const g = {};
  try {
    for (const name of SHARDS) evalInto(g, path.join("data", "generated", `knowledge_${name}.js`));
    return g.ACUTING_KNOWLEDGE || null;
  } catch (e) {
    return null;
  }
}

function loadGeneratedGlobal(rel, globalName) {
  const g = {};
  try {
    evalInto(g, rel);
    return g[globalName] || null;
  } catch (e) {
    return null;
  }
}

module.exports = { loadKnowledge, loadGeneratedGlobal, SHARDS };

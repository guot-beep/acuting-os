#!/usr/bin/env node
/**
 * validate-board-pair-attribution.js — 「NCBAHM 考綱官方對藥」這個宣稱對不對得上考綱正本
 *
 * 為什麼有這一支(2026-08-27):
 * 藥卡的 key_pairs 與 herb_pairs 記錄都會宣稱某個組合是「2026 NCBAHM Appendix B 官方對藥」。
 * 考綱正本就在 repo 裡(curriculum/board/NCBAHM_CH_...md),但沒有任何東西在核對這個宣稱。
 * 實際一核:Appendix B 全部是「A and B」二味對藥,而庫裡有 3–4 味的組合掛著同一個宣稱,
 * 也有二味組合根本不在清單上。考綱宣稱是學生判斷「這題會不會考」的依據,標錯比留空更糟。
 *
 * 這支做三件事:
 *   1. 從考綱 md 解析 Appendix B(錨定行首「Appendix B.」——內文第 36 行有一句
 *      「See Appendix B.」,抓到它會讓區段落在錯地方、解析出 0 組而不自知;
 *      所以解析出 0 組一律視為 FAIL,不允許空跑通過)
 *   2. 逐條核對 herb_pairs 的 ncbahm_official_pair:true
 *   3. 逐條核對藥卡 key_pairs 標籤裡的 NCBAHM / Appendix B 字樣
 *
 * 比對用拼音,並吃別名:考綱寫 Xin Yi Hua / Han Lian Cao / Sha Shen,
 * 本庫正名是 辛夷 / 墨旱蓮 / 北沙參,中文別名對得上就算命中——
 * 別名差異是命名問題,不是歸屬錯誤,不能混為一談。
 *
 * 用法: node scripts/validate-board-pair-attribution.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUTLINE = path.join(ROOT, "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md");

const problems = [];
const notes = [];

if (!fs.existsSync(OUTLINE)) {
  console.log("validate-board-pair-attribution — SKIP");
  console.log("  考綱正本不在 curriculum/board/,無法核對。這不是 PASS,是量不到。");
  process.exit(0);
}
const lines = fs.readFileSync(OUTLINE, "utf8").split("\n");
const start = lines.findIndex((l) => /^Appendix B\. Chinese Herbal Pairs/.test(l.trim()));
const end = lines.findIndex((l, i) => i > start && /^Appendix C\./.test(l.trim()));
if (start < 0 || end < 0) {
  console.log("FAIL — 考綱裡找不到 Appendix B 區段(start=" + start + " end=" + end + "),解析規則要跟著考綱更新");
  process.exit(1);
}
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const appB = [];
for (const l of lines.slice(start, end)) {
  const m = l.match(/([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*)\s*\([^)]*\)\s+and\s+([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*)\s*\([^)]*\)/);
  if (m) appB.push([m[1].trim(), m[2].trim()]);
}
if (!appB.length) {
  console.log("FAIL — Appendix B 解析出 0 組。區段錨點或行格式變了,不允許空跑通過。");
  process.exit(1);
}
const appSet = new Set(appB.map((p) => [norm(p[0]), norm(p[1])].sort().join("|")));
notes.push("考綱 Appendix B 解析出 " + appB.length + " 組(全為二味對藥)");

const bundle = path.join(ROOT, "data/generated/knowledge_mm.js");
if (!fs.existsSync(bundle)) { console.log("FAIL — 先跑 node scripts/build-data.js"); process.exit(1); }
globalThis.window = globalThis;
require(bundle);
const K = globalThis.ACUTING_KNOWLEDGE || {};
const herbs = (K.herbs && K.herbs.records) || [];
const pairs = (K.herbPairs && K.herbPairs.pairs) || [];
if (!herbs.length || !pairs.length) { console.log("FAIL — bundle 讀不到 herbs/herbPairs"); process.exit(1); }

// 一味藥可用的所有拼音寫法:正名拼音 + 別名(中文別名沒有拼音欄,用考綱那側的中文對照不可行,
// 故改以「考綱英文詞 ↔ 本庫某味藥」的候選集合比對:正名拼音,以及別名去掉常見詞綴後的變體)
const pyOf = new Map(herbs.map((h) => [h.id, norm(h.pinyin)]));
const zhOf = new Map(herbs.map((h) => [h.id, h.name_zh]));
// 考綱英文詞 → 本庫藥 id 的對照表:先用正名拼音,再用「考綱詞是本庫拼音的延伸或被延伸」補
const idByPy = new Map();
for (const h of herbs) if (h.pinyin) { const k = norm(h.pinyin); if (!idByPy.has(k)) idByPy.set(k, h.id); }
// 同一味藥在本庫可能有兩張卡(旱蓮草/墨旱蓮、沙參/北沙參)。中文名或別名有交集就視為同一味,
// 否則考綱寫 Han Lian Cao、藥對用 herb.mo_han_lian 會被誤判成「不在清單上」——
// 那是重複卡的命名問題,不是歸屬錯誤,兩者不能混為一談。
const zhNamesOf = (h) => new Set([h.name_zh, ...(h.aliases_zh || [])].filter(Boolean));
const groupOf = new Map();   // herb.id -> group id
{
  let g = 0;
  for (const h of herbs) {
    if (groupOf.has(h.id)) continue;
    const mine = zhNamesOf(h);
    const key = "g" + (g++);
    groupOf.set(h.id, key);
    for (const o of herbs) {
      if (groupOf.has(o.id)) continue;
      const theirs = zhNamesOf(o);
      if ([...mine].some((x) => theirs.has(x))) groupOf.set(o.id, key);
    }
  }
}
const resolveOutlineTerm = (term) => {
  const t = norm(term);
  if (idByPy.has(t)) return idByPy.get(t);
  // Xin Yi Hua ↔ Xin Yi 這類詞綴差異
  for (const [k, id] of idByPy) if (k && (t.startsWith(k) || k.endsWith(t) || t.endsWith(k))) return id;
  return null;
};
const appPairsAsIds = appB.map(([a, b]) => [resolveOutlineTerm(a), resolveOutlineTerm(b)]).filter((p) => p[0] && p[1]);
const appGroupSet = new Set(appPairsAsIds.map((p) => p.map((i) => groupOf.get(i)).sort().join("|")));
const appIdSet = new Set(appPairsAsIds.map((p) => [...p].sort().join("|")));
notes.push("其中 " + appPairsAsIds.length + " 組的兩味都對得上本庫藥 id");

const onAppB = (ids) => ids.length === 2 && (
  appIdSet.has([...ids].sort().join("|")) ||
  appGroupSet.has(ids.map((i) => groupOf.get(i)).sort().join("|")) ||
  appSet.has(ids.map((i) => pyOf.get(i) || "").sort().join("|"))
);

// ---- 1. herb_pairs 的 ncbahm_official_pair ----------------------------------
const badPairs = [];
let okPairs = 0;
for (const p of pairs) {
  if (p.ncbahm_official_pair !== true) continue;
  if (onAppB(p.herbs || [])) okPairs++;
  else badPairs.push(p);
}
notes.push("herb_pairs 標 ncbahm_official_pair:true — 成立 " + okPairs + " 條 / 不成立 " + badPairs.length + " 條");
for (const p of badPairs) {
  problems.push({
    known: p.id,
    text: "herb_pairs " + p.id + "（" + p.name_zh + "，" + (p.herbs || []).length + " 味）標 ncbahm_official_pair:true，"
      + ((p.herbs || []).length !== 2 ? "但 Appendix B 全為二味對藥" : "但該組合不在 Appendix B 清單上")
      + (p.migrated_from ? "；migrated_from " + p.migrated_from : ""),
  });
}

// ---- 2. 藥卡 key_pairs 標籤裡的宣稱 ------------------------------------------
const tok = new Map();
for (const h of herbs) for (const a of (h.aliases_zh || [])) if (h.name_zh) tok.set(a, h.name_zh);
for (const h of herbs) if (h.name_zh) tok.set(h.name_zh, h.name_zh);   // 正名一定贏
const tokens = [...tok.keys()].sort((a, b) => b.length - a.length);
const idByZh = new Map(herbs.map((h) => [h.name_zh, h.id]).filter((x) => x[0]));
const namesIn = (l) => { const s = new Set(); let r = String(l || ""); for (const t of tokens) if (r.includes(t)) { s.add(tok.get(t)); r = r.split(t).join(" "); } return s; };
let okCards = 0; const badCards = [];
for (const h of herbs) for (const kp of (h.key_pairs || [])) {
  if (!/NCBAHM|Appendix\s*B/i.test(kp.pair || "")) continue;
  const ids = [...namesIn(kp.pair)].map((x) => idByZh.get(x)).filter(Boolean);
  if (onAppB(ids)) okCards++;
  else badCards.push({ h, kp, n: ids.length });
}
notes.push("藥卡 key_pairs 標籤宣稱 NCBAHM — 成立 " + okCards + " 條 / 不成立 " + badCards.length + " 條");
for (const b of badCards) {
  problems.push({
    known: b.h.id + "|" + b.kp.pair,
    text: "藥卡 " + b.h.id + "「" + b.kp.pair + "」宣稱 NCBAHM，"
      + (b.n !== 2 ? "但辨識出 " + b.n + " 味而 Appendix B 全為二味對藥" : "但該組合不在 Appendix B 清單上"),
  });
}

// 既有待裁清單(2026-08-27 首次核對時就存在,不是本批造成)。
// 這些不擋 CI —— 它們要不要改是內容決定,等 Ting 裁;但**不准再多**:
// 清單以外的任何一項都是 FAIL。修好一項就從這裡刪一行,清單只能變短。
const KNOWN = new Set([
  // herb_pairs:3–4 味卻標 ncbahm_official_pair(Appendix B 全為二味)
  "pair.chuan_xiong__dang_gui__chi_shao",
  "pair.liu_huang__fu_zi__rou_gui",
  "pair.bai_guo__ma_huang__zi_su_zi__xing_ren",
  "pair.gou_ji__du_zhong__xu_duan",
  "pair.gu_sui_bu__ru_xiang__mo_yao",
  "pair.hai_piao_xiao__shan_yao__long_gu__mu_li",
  "pair.he_tao_ren__dang_gui__huo_ma_ren__rou_cong_rong",
  "pair.hu_jiao__sheng_jiang__ban_xia",
  "pair.jing_mi__shi_gao__zhi_mu__gan_cao",
  // 藥卡 key_pairs 標籤:宣稱 NCBAHM 但核對不成立
  "herb.qiang_huo|羌活 + 獨活 (2026 NCBAHM Appendix B 官方對藥)",
  "herb.xi_xin|細辛 + 乾薑 + 五味子 (2026 NCBAHM Appendix B 官方對藥)",
  "herb.hua_shi|滑石 + 甘草 (Bastyr / NCBAHM 官方對藥)",
  "herb.yan_hu_suo|延胡索 + 川楝子 (Bastyr / NCBAHM 官方對藥)",
]);
const fresh = problems.filter((p) => !p.known || !KNOWN.has(p.known));
const stale = [...KNOWN].filter((k) => !problems.some((p) => p.known === k));

console.log("validate-board-pair-attribution — 考綱官方對藥宣稱是否對得上考綱正本");
notes.forEach((n) => console.log("  " + n));
console.log("  既有待裁清單 " + KNOWN.size + " 項(不擋,等 Ting 裁定;清單只能變短)");
if (stale.length) {
  console.log("");
  stale.forEach((s) => console.log("  ℹ 已修好,可從 KNOWN 清單刪掉:" + s));
}
if (problems.length) {
  console.log("");
  problems.forEach((p) => console.log("  " + (KNOWN.has(p.known) ? "·" : "✗") + " " + p.text));
}
if (fresh.length) {
  console.log("\nFAIL — " + fresh.length + " 項新的歸屬不符(既有 " + (problems.length - fresh.length) + " 項不計)");
  process.exit(1);
}
console.log("\nPASS — 沒有新的歸屬錯誤(既有 " + problems.length + " 項在待裁清單內)。");

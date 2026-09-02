#!/usr/bin/env node
/**
 * validate-herb-track-filler.js — 抓 english_exam_track / chinese_depth_track 裡的「樣板句」。
 *
 * 為什麼需要這支(2026-09-02 量到的):
 *   `validate-herb-canon.js` 要求每張中藥卡的 english_exam_track 有 7 個非空欄位。
 *   360 張裡 200 張沒有 → 貢獻約 5,495 個缺陷中的絕大多數。
 *   而**已經有的 204 張裡,184 張裝的是樣板句**:麻黃與桂枝的 functions 一字不差,
 *   都是 "Release exterior wind-cold pattern context" / "Support surface-dispersing study
 *   differentiation" —— 這種句子沒有任何臨床內容,只是為了讓閘門變綠。
 *   同一張卡的 actions_en 反而有真東西("Induces sweating and releases the exterior")。
 *
 *   更關鍵:`js/knowledge.js` 的 herbPanels 宣告了 `const exam = record.english_exam_track || {}`
 *   之後**一個 exam 欄位都沒用**(全檔只有 formulaPanels 讀 exam.contraindications_en)。
 *   也就是說這 7 個必填欄位**不會出現在任何卡面上**。
 *
 *   把 5,495 補成 0 的最省力做法,就是再生 162 份同樣的樣板 —— 閘門全綠、卡面零改變、
 *   而且往後沒有人分得出哪些是真的。這支的存在是為了讓那條路走不通:
 *   **樣板句本身就是缺陷**,而且只會往下走(棘輪 layer: herb_track_filler)。
 *
 * 判準(保守:寧可漏抓,不可錯殺真內容):
 *   1. 句尾樣板:以 "pattern context" / "study differentiation" / "documentation context only" 結尾
 *   2. 明示待辦:含 "Draft pending Bensky" / "verify against Bensky" / "review_pending" 之類的字樣
 *   3. 通用免責:"Pairings depend on formula context" / "Review pregnancy, fever red flags"
 *   4. 跨卡完全相同:**english_exam_track 的英文長句**(≥5 詞)出現在 ≥ 8 張不同的卡上。
 *      只限英文長句是因為第一版對中文欄位也套這條,把「發汗解表」這種真術語算成樣板(2,424 條假陽性);
 *      中藥功效術語本來就會跨卡重複,英文整句一字不差才是機器生成的訊號。
 * 輸出 --json:{ defects, by_code, records_with_filler }
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const TRACKS = {
  english_exam_track: ["properties_taste_temp", "functions", "indications", "common_pairings", "contraindications"],
  chinese_depth_track: ["summary_zh", "functions_zh"],
};
const PATTERNS = [
  { code: "template_suffix", re: /(pattern context|study differentiation|documentation context only|context only)\s*$/i },
  { code: "todo_marker", re: /(draft pending|verify against bensky|review[_ ]pending|待來源|待補|pending verification)/i },
  { code: "generic_disclaimer", re: /(pairings depend on formula context|review pregnancy, fever red flags|depends on formula context)/i },
];
const DUP_THRESHOLD = 8;

function values(track, fields) {
  const out = [];
  for (const f of fields) {
    const v = track[f];
    if (typeof v === "string" && v.trim()) out.push([f, v.trim()]);
    else if (Array.isArray(v)) for (const s of v) if (typeof s === "string" && s.trim()) out.push([f, s.trim()]);
  }
  return out;
}

function scan() {
  const json = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const records = (json.records || json).filter((r) => r.review_status !== "deprecated");
  const defects = [];
  const seen = new Map();   // `${trackName}.${field}|${text}` -> [ids]
  for (const r of records) {
    for (const [trackName, fields] of Object.entries(TRACKS)) {
      const track = r[trackName];
      if (!track || typeof track !== "object") continue;
      for (const [field, text] of values(track, fields)) {
        for (const p of PATTERNS) {
          if (p.re.test(text)) defects.push({ code: p.code, record: r.id, path: `${trackName}.${field}`, text: text.slice(0, 90) });
        }
        const k = `${trackName}.${field}|${text}`;
        if (!seen.has(k)) seen.set(k, []);
        seen.get(k).push(r.id);
      }
    }
  }
  for (const [k, ids] of seen) {
    if (ids.length < DUP_THRESHOLD) continue;
    /* 2026-09-02 自己踩到的假陽性:第一版對所有欄位判「逐字重複」,結果 chinese_depth_track.functions_zh
     * 的「發汗解表」「利水消腫」被算成樣板 —— 那是真的中藥功效術語,本來就會在幾十張卡上重複出現,
     * 2,424 條裡沒有一條是缺陷。逐字重複只在**英文長句**上才是可疑訊號:真正寫過的臨床句子不會
     * 在 8 張不同的藥卡上一字不差。所以限縮為 english_exam_track 且 ≥ 5 個英文詞。 */
    const [whereK] = k.split("|");
    if (!whereK.startsWith("english_exam_track.")) continue;
    const textK = k.slice(whereK.length + 1);
    if (textK.split(/\s+/).filter(Boolean).length < 5) continue;
    const [where, text] = k.split("|");
    if (defects.some((d) => d.path === where && text.startsWith(d.text.slice(0, 40)))) continue;   // 已被句型抓到,不重複計
    for (const id of ids) defects.push({ code: "identical_across_cards", record: id, path: where, text: `${text.slice(0, 60)}(${ids.length} 張卡逐字相同)` });
  }
  const by_code = {};
  for (const d of defects) by_code[d.code] = (by_code[d.code] || 0) + 1;
  const withFiller = new Set(defects.map((d) => d.record));
  return { defects: defects.length, by_code, records_with_filler: withFiller.size, records_scanned: records.length, detail: defects };
}

if (require.main === module) {
  const res = scan();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ defects: res.defects, by_code: res.by_code, records_with_filler: res.records_with_filler }, null, 2));
    process.exit(0);
  }
  console.log(`掃描 ${res.records_scanned} 張在庫中藥卡的 exam/depth track`);
  console.log(`樣板句 ${res.defects} 條,分布在 ${res.records_with_filler} 張卡:`);
  for (const [code, n] of Object.entries(res.by_code).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${code}`);
  const byPath = {};
  for (const d of res.detail) byPath[d.path] = (byPath[d.path] || 0) + 1;
  console.log("欄位分布:");
  for (const [p, n] of Object.entries(byPath).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${p}`);
  console.log("\n樣本:");
  for (const d of res.detail.slice(0, 6)) console.log(`  ${d.record}  ${d.path}  「${d.text}」`);
  console.log("\n這些欄位目前不會出現在任何卡面上(js/knowledge.js 的 herbPanels 讀了 english_exam_track 卻沒用它的任何欄位)。");
  console.log("在 Ting 裁定之前:不要為了讓 validate-herb-canon 變綠而生成更多這種句子 —— 這支就是為了讓那條路走不通。");
  process.exit(0);   // 報告型:數字交給棘輪管,不自己紅燈
}
module.exports = { scan };

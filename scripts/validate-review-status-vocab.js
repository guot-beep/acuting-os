#!/usr/bin/env node
/**
 * validate-review-status-vocab.js — review_status 的受控詞彙鎖。
 *
 * 檢測報告（2026-08-19 §結論一「信任軸失靈」）：review_status 曾碎裂成
 * 16 種值，拼錯的 sourced_checked（×272）比正確的 source_checked（×131）
 * 還多一倍——一個沒有詞彙表的信任欄位，等於沒有信任欄位。pattern-v2
 * 各 Phase 已把大盤收斂掉；本鎖讓它不再碎回去：record 級 review_status
 * 只准用受控集合，新變體直接紅燈。
 *
 * 兩個歷史單例（herb.bai_ji_li: draft_reviewed / herb.zhi_gan_cao: reviewed）
 * 釘在 KNOWN_EXCEPTIONS——語意介於 draft 與 source_checked 之間，機器不
 * 自作主張升降信任等級，待 Ting 裁定歸位後從清單移除。清單只准縮不准長。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const VOCAB = new Set([
  "draft",            // 初稿，未經任何核對
  "skeleton",         // 骨架：結構在、內容待填
  "source_checked",   // 逐來源核對過（信任軸的正值）
  "sourced_cloudtcm_record", // 來源特定：cloudtcm 搬運記錄（provenance 標記）
  "deprecated",       // 退役（never-hard-delete 的正路）
  "correction_queued",// 已知有誤、修正排隊中
]);

// 只准縮不准長。每筆格式 "<file>|<id>|<value>"。
const KNOWN_EXCEPTIONS = new Set([
  "data/herbs/herb_canon_shortlist.json|herb.bai_ji_li|draft_reviewed",
  "data/herbs/herb_canon_shortlist.json|herb.zhi_gan_cao|reviewed",
]);

const FILES = [
  "data/herbs/herb_canon_shortlist.json",
  "data/herbs/formulas.json",
  "data/pathology/condition_canon_shortlist.json",
  "data/pathology/tdis_registry.json",
  "data/acupoints/361.json",
  "data/acupoints/extra_points.json",
  "data/symptoms/symptoms.json",
  "data/interop/condition_crosswalk.json",
];

const defects = [];
let checked = 0, excepted = 0;
for (const f of FILES) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const j = JSON.parse(fs.readFileSync(full, "utf8"));
  const recs = j.records || j.points || j;
  if (!Array.isArray(recs)) continue;
  for (const r of recs) {
    if (typeof r.review_status !== "string") continue; // 缺欄位不歸本鎖管
    checked++;
    if (VOCAB.has(r.review_status)) continue;
    const key = `${f}|${r.id || r.code}|${r.review_status}`;
    if (KNOWN_EXCEPTIONS.has(key)) { excepted++; continue; }
    defects.push(`RS1 ${f} ${r.id || r.code}: review_status "${r.review_status}" 不在受控詞彙表`);
  }
}

console.log(`review-status vocab: ${checked} record-level values checked · ${excepted} pinned exceptions · ${defects.length} defects`);
if (excepted) console.log(`  （${excepted} 筆歷史單例釘在 KNOWN_EXCEPTIONS，待 Ting 裁定歸位）`);
if (defects.length) { defects.slice(0, 20).forEach((d) => console.log("  " + d)); process.exit(1); }
console.log("PASS — record 級 review_status 全部在受控詞彙表內。");

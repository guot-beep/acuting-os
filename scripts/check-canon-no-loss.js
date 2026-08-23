#!/usr/bin/env node
/**
 * check-canon-no-loss.js — canonical 檔的「id 集合不准縮」棘輪。
 *
 * 為什麼存在：2026-08-21 的 Phase C 中藥庫整檔取代把 5 筆既有記錄
 * （herb.jiu / bi_yu_san / zao_xin_tu / zong_lu_tan / cha_ye）一起帶走了。
 * 352→358 是「淨增」，蓋住了「有 5 筆被刪」——三方分析裡沒有任何一項在問
 * 「舊檔有、新檔沒有的 id 是哪些」。而 check-formula-no-loss.js 只看
 * data/herbs/formulas.json，中藥庫這條線當時沒有任何機器在擋整檔取代造成的
 * 記錄流失。這次是靠 F12 剛好踩到才浮出來；如果那 5 筆沒有被任何方劑引用，
 * 它們會一路全綠地消失。
 *
 * 規則（呼應憲法「只加深，不刪除」與 never-hard-delete 慣例）：
 *   - 快照裡的每一個 id 都必須仍然存在於現檔。新增隨時歡迎。
 *   - 記錄退役的正路是 review_status: deprecated（記錄留著），不是刪除。
 *   - 真的要讓一個 id 離開快照，唯一的路是 --retire <id> "理由"——
 *     留下日期與理由的紙本痕跡，跟 ratchet 的 --rebaseline 同一個精神。
 *
 *   node scripts/check-canon-no-loss.js            # 對照快照，缺 id 就 exit 1
 *   node scripts/check-canon-no-loss.js --save     # 現況存為新快照（只在沒有缺 id 時）
 *   node scripts/check-canon-no-loss.js --retire <id> "reason"
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SNAP = path.join(ROOT, "data/audits/canon_id_snapshot.json");

// 守的檔與各自的 key。generated/ 不守（由 build-data 重建）；imports/staging 不守（本來就可整批丟棄）。
const GUARDED = [
  { file: "data/herbs/herb_canon_shortlist.json", key: "id" },
  { file: "data/herbs/formulas.json", key: "id" },
  { file: "data/pathology/condition_canon_shortlist.json", key: "id" },
  { file: "data/pathology/tdis_registry.json", key: "id" },
  { file: "data/acupoints/361.json", key: "code" },
  { file: "data/acupoints/extra_points.json", key: "code" },
  { file: "data/symptoms/symptoms.json", key: "id" },
];

const recsOf = (j) => j.records || j.points || j.formulas || j;
const idsOf = (g) => {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, g.file), "utf8"));
  return recsOf(j).map((r) => String(r[g.key] || "").trim()).filter(Boolean);
};

const argv = process.argv.slice(2);
const SAVE = argv.includes("--save");
const RETIRE = argv.indexOf("--retire");

let snap = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : null;

if (RETIRE >= 0) {
  const id = argv[RETIRE + 1];
  const reason = argv[RETIRE + 2];
  if (!id || !reason) { console.error("用法: --retire <id> \"reason\""); process.exit(2); }
  if (!snap) { console.error("沒有快照可退役"); process.exit(2); }
  let hit = false;
  for (const [file, ids] of Object.entries(snap.files)) {
    const i = ids.indexOf(id);
    if (i >= 0) { ids.splice(i, 1); hit = true;
      snap.retired.push({ id, file, reason, date: new Date().toISOString().slice(0, 10) });
    }
  }
  if (!hit) { console.error(`快照裡沒有這個 id: ${id}`); process.exit(2); }
  fs.writeFileSync(SNAP, JSON.stringify(snap, null, 2) + "\n");
  console.log(`已退役 ${id}（理由已記錄）。`);
  process.exit(0);
}

// ---- 對照 ----
const missing = [];
const counts = [];
for (const g of GUARDED) {
  const cur = new Set(idsOf(g));
  const base = snap ? (snap.files[g.file] || []) : [];
  const lost = base.filter((id) => !cur.has(id));
  for (const id of lost) missing.push(`${g.file}: ${id}`);
  counts.push(`  ${g.file.padEnd(48)} ${String(base.length).padStart(4)} → ${String(cur.size).padStart(4)}${lost.length ? `  ⚠ 缺 ${lost.length}` : ""}`);
}
console.log("check-canon-no-loss:");
console.log(counts.join("\n"));

if (missing.length) {
  console.log(`\n❌ ${missing.length} 個快照裡的 id 從現檔消失了：`);
  missing.slice(0, 20).forEach((m) => console.log("  " + m));
  console.log("\n刪除不是退役。退役的正路是 review_status: deprecated（記錄留著）。");
  console.log("真的要移出快照：node scripts/check-canon-no-loss.js --retire <id> \"reason\"");
  process.exit(1);
}

if (SAVE) {
  const files = {};
  for (const g of GUARDED) files[g.file] = [...new Set(idsOf(g))].sort();
  snap = { _comment: "id 集合棘輪快照——每個 id 都必須存在於對應檔案；退役走 --retire 留痕。", updated_at: new Date().toISOString().slice(0, 10), retired: snap?.retired || [], files };
  fs.writeFileSync(SNAP, JSON.stringify(snap, null, 2) + "\n");
  console.log("\n✓ 快照已更新。");
} else if (!snap) {
  console.log("\n（尚無快照——先跑 --save 建立基線。）");
  process.exit(1);
} else {
  console.log("\n✓ PASS — 快照裡的每一個 id 都仍然存在。");
}

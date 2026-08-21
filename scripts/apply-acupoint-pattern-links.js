#!/usr/bin/env node
/**
 * apply-acupoint-pattern-links.js — 穴位卡 §6.5 證候連結(tcm_pattern_ids)落庫。
 *
 * 來源帳本:docs/research_packs/ACUPOINT_PATTERN_LINKS_LEDGER_2026-08-19.json
 * (219 穴、811 條提案,每條帶 pattern_id + 來源檔 + 原句引文 + 信度)。
 * 帳本本身是唯讀研究產出:此腳本只消費、不回寫。
 *
 * 證據門檻(寧缺勿濫):一條連結要寫入,至少要有一條證據是
 *   - structured_reverse_link(pattern_library.typical_points /
 *     conditions.seed_acupoints 這類結構化反向連結),或
 *   - curriculum_line(課件行級共現,agent 已人工複核),或
 *   - point_text 且出處不是 combine_points_zh / clinical_pearls ——
 *     配伍文說的是「配 X 治某證」,主詞是穴組不是本穴,單靠它不足以
 *     宣稱本穴主治該證。只有配伍孤證的連結進 held 清單待人工覆核,
 *     不寫入。
 *
 * 寫入規則:併集(既有 tcm_pattern_ids 一條不動,含 legacy pat.<中文>,
 * 依 alias map 政策 legacy 永不改寫);新 id 一律 canonical pattern.<slug>
 * (紅線 1);field_sources.tcm_pattern_ids 記帳本路徑(僅在本次有新增且
 * 原本沒有這個 field_sources 鍵時寫,不覆蓋)。
 *
 * 批次:--offset N --limit M 控制(預設 dry-run 全量報告;--apply 寫入)。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const argOf = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? Number(process.argv[i + 1]) : dflt;
};
const OFFSET = argOf("--offset", 0);
const LIMIT = argOf("--limit", Infinity);

const LEDGER_REL = "docs/research_packs/ACUPOINT_PATTERN_LINKS_LEDGER_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const pointsDoc = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/acupoints/361.json"), "utf8")
);
const points = Array.isArray(pointsDoc)
  ? pointsDoc
  : Object.values(pointsDoc).find(Array.isArray);
const byId = new Map(points.map((p) => [p.id || p.code, p]));

const registry = Object.values(
  JSON.parse(fs.readFileSync(path.join(ROOT, "data/pathology/pattern_registry.json"), "utf8"))
).find(Array.isArray);
const validIds = new Set(registry.map((p) => p.id));

const weakOnly = (evs) =>
  !evs.some(
    (e) =>
      e.confidence === "structured_reverse_link" ||
      e.confidence === "curriculum_line" ||
      (e.confidence === "point_text" &&
        !/combine_points|clinical_pearls/.test(String(e.source || "")))
  );

let applied = 0,
  addedLinks = 0,
  held = [],
  missingPoint = [],
  badId = [];

const proposals = ledger.proposals
  .slice()
  .sort((a, b) => String(a.point_id).localeCompare(String(b.point_id)))
  .slice(OFFSET, OFFSET + LIMIT);

for (const prop of proposals) {
  const rec = byId.get(prop.point_id);
  if (!rec) {
    missingPoint.push(prop.point_id);
    continue;
  }
  const existing = new Set(rec.tcm_pattern_ids || []);
  const evByPattern = new Map();
  for (const e of prop.evidence || []) {
    if (!evByPattern.has(e.pattern_id)) evByPattern.set(e.pattern_id, []);
    evByPattern.get(e.pattern_id).push(e);
  }
  const toAdd = [];
  for (const pid of prop.add_pattern_ids || []) {
    if (!validIds.has(pid)) {
      badId.push(`${prop.point_id} ${pid}`);
      continue;
    }
    if (existing.has(pid)) continue;
    const evs = evByPattern.get(pid) || [];
    if (!evs.length || weakOnly(evs)) {
      held.push(`${prop.point_id}  ${pid}  (${evs.map((e) => e.confidence + ":" + e.source).join(" | ") || "no evidence"})`);
      continue;
    }
    toAdd.push(pid);
  }
  if (!toAdd.length) continue;
  applied++;
  addedLinks += toAdd.length;
  if (APPLY) {
    rec.tcm_pattern_ids = [...existing, ...toAdd];
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.tcm_pattern_ids) {
      rec.field_sources.tcm_pattern_ids = [
        `derived: ${LEDGER_REL}(逐條帶來源檔與原句引文;結構化反向連結/課件行/本穴自述文字,配伍孤證不寫入)`,
      ];
    }
  } else {
    console.log(`${prop.point_id}  +${toAdd.length}  [${toAdd.join(", ")}]`);
  }
}

console.log(
  `\n本批範圍 offset=${OFFSET} limit=${LIMIT === Infinity ? "all" : LIMIT}: 寫入穴位 ${applied},新增連結 ${addedLinks},held(配伍孤證/無證據) ${held.length},查無穴位 ${missingPoint.length},非法 id ${badId.length}`
);
if (badId.length) console.log("非法 id:", badId.join("; "));
if (missingPoint.length) console.log("查無穴位:", missingPoint.join(", "));

if (APPLY) {
  fs.writeFileSync(
    path.join(ROOT, "data/acupoints/361.json"),
    JSON.stringify(pointsDoc, null, 2) + "\n",
    "utf8"
  );
  const heldPath = path.join(ROOT, "docs/research_packs/ACUPOINT_PATTERN_LINKS_HELD_FOR_REVIEW.md");
  const heldHeader =
    "# 穴位證候連結 — 配伍孤證待人工覆核\n\n" +
    "以下連結唯一證據是 combine_points_zh / clinical_pearls 的配伍句(主詞是穴組不是本穴),未寫入 361.json。\n" +
    "覆核後要收的,把該條移進帳本 evidence 換成更強證據再跑 apply。\n\n";
  fs.writeFileSync(heldPath, heldHeader + held.map((h) => "- " + h).join("\n") + "\n", "utf8");
  console.log(`WROTE data/acupoints/361.json + held 清單 ${held.length} 條`);
} else {
  console.log("\nDRY RUN — 加 --apply 寫入(配合 --offset/--limit 分批)。");
}

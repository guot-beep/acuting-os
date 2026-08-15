#!/usr/bin/env node
/**
 * ingest-protocol-delivery.js — 把 SOL 的逐病處方交付寫進條件卡
 *
 * B1–B8 的交付格式相同,所以落庫也應該是同一支程式,不是每批手寫一次。
 * 前三批(B3/B4/B5)各寫一次臨時腳本,差異只在欄位名 —— 那是重複,也是出錯的來源。
 *
 * 規則(與 docs/CONDITION_CARD_TEMPLATE.md §3 及驗證器 C14 一致):
 *   - 穴位與它的證據**一起寫**。沒有證據就不准寫穴位。
 *   - 沒有穴位的卡也要寫證據 —— 「查過,結論是不建處方」與「沒人查過」
 *     在畫面上必須分得出來。
 *   - 既有 acupuncture_scope_zh / red_flags_zh / import_artifacts **一律不動**。
 *     SOL 的 scope_zh 是提案,由 Ting 裁決。
 *   - 穴名與代碼以 repo 的穴位登記為準(太溪 -> 太谿),ASHI 等非經穴原樣保留。
 *   - 各批獨有的欄位(sensory_loss_safety_zh、local_needling_contraindications_zh…)
 *     收進 acupoint_protocol_evidence 底下,不新增卡片頂層欄位 —— 頂層每加一個
 *     都是 schema 變更,而這些是同一件事的細節。
 *
 * 用法:
 *   node scripts/ingest-protocol-delivery.js <delivery.json> <批次標籤> [--dry-run]
 *   例:node scripts/ingest-protocol-delivery.js ~/B5.json "SOL B5 2026-08-15"
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANON = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");

/* 各批獨有、要收進 evidence 底下的欄位。新增批次時加在這裡就好。 */
const EXTRA_FIELDS = [
  "sensory_loss_safety_zh",              // B5 神經
  "local_needling_contraindications_zh", // B8 心血管/皮膚
  "identical_protocol_explanation",      // 全批共用規則
];

function loadRegistry() {
  const map = new Map();
  for (const f of ["data/acupoints/361.json", "data/acupoints/extra_points.json"]) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
    const arr = Array.isArray(j) ? j : (j.records || j.points || Object.values(j).find(Array.isArray));
    for (const p of arr) {
      const c = String(p.code || p.id || "").toUpperCase().replace(/^POINT\./, "");
      if (c) map.set(c, String(p.name_zh || p.nameZh || p.name || "").trim());
    }
  }
  return map;
}

function main() {
  const [file, label] = process.argv.slice(2);
  const dry = process.argv.includes("--dry-run");
  if (!file || !label) {
    console.log("用法: node scripts/ingest-protocol-delivery.js <delivery.json> <批次標籤> [--dry-run]");
    process.exit(1);
  }

  const delivery = JSON.parse(fs.readFileSync(file, "utf8"));
  const cards = delivery.conditions;
  if (!Array.isArray(cards) || !cards.length) {
    console.log("⛔ 交付檔裡找不到 conditions 陣列");
    process.exit(1);
  }

  const canon = JSON.parse(fs.readFileSync(CANON, "utf8"));
  const byId = new Map(canon.records.map((r) => [r.id, r]));
  const reg = loadRegistry();

  let renamed = 0, missing = 0, overwritten = 0;
  const rows = [];

  for (const c of cards) {
    const rec = byId.get(c.condition_id);
    if (!rec) { console.log(`⛔ ${c.condition_id} 在 repo 找不到,跳過`); missing++; continue; }
    if (rec.acupoint_protocol_evidence && rec.acupoint_protocol_evidence.collected_by) {
      // 已經有查證過的 evidence —— 覆蓋前要看得到
      console.log(`⚠  ${c.condition_id} 已有 ${rec.acupoint_protocol_evidence.collected_by} 的 evidence,將被覆蓋`);
      overwritten++;
    }

    const pts = (c.points || []).map((p) => {
      const code = String(p.code || "").toUpperCase();
      const canonName = reg.get(code);
      if (canonName && p.name_zh && canonName !== p.name_zh) renamed++;
      return { name_zh: canonName || p.name_zh, code };
    });

    const ev = {
      protocol_status: c.protocol_status,
      point_rationale_zh: c.point_rationale_zh || null,
      point_rationale_en: c.point_rationale_en || null,
      evidence_note_zh: c.evidence_note_zh || null,
      treatment_parameters: c.treatment_parameters || null,
      scope_conflict_note: c.scope_conflict_note || null,
      sources: c.sources || [],
      points_detail: (c.points || []).map((p) => ({
        code: String(p.code || "").toUpperCase(),
        role_zh: p.role_zh || null,
        reason_zh: p.reason_zh || null,
        source_ids: p.source_ids || [],
      })),
      collected_by: label,
      assessed: true,
      no_source_found: !!c.no_source_found,
    };
    for (const f of EXTRA_FIELDS) if (c[f] != null) ev[f] = c[f];
    if (Array.isArray(c.unresolved) && c.unresolved.length) ev.unresolved = c.unresolved;

    if (!dry) {
      if (pts.length) rec.acupoint_protocols = pts;
      rec.acupoint_protocol_evidence = ev;
    }
    const extras = EXTRA_FIELDS.filter((f) => c[f] != null).length;
    rows.push(`  ${c.condition_id.padEnd(30)} ${String(c.protocol_status).padEnd(15)} 穴 ${String(pts.length).padStart(2)} | 來源 ${String((c.sources || []).length).padStart(2)}`
      + ` | 批次專屬欄位 ${extras}${c.scope_conflict_note ? " | ⚑ scope 衝突" : ""}`);
  }

  if (!dry) fs.writeFileSync(CANON, JSON.stringify(canon, null, 2) + "\n", "utf8");

  for (const r of rows) console.log(r);
  console.log(`\n${dry ? "[乾跑] " : ""}寫入 ${rows.length} 張;找不到 ${missing};覆蓋既有 evidence ${overwritten};穴名依登記正規化 ${renamed}`);
  console.log("既有 acupuncture_scope_zh / red_flags_zh / import_artifacts 未動。");
}

if (require.main === module) main();

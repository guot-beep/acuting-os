#!/usr/bin/env node
/**
 * insert-361-drafts.js — append model-draft records from
 * data/imports/model_draft/*.json into data/acupoints/361.json.
 *
 *   node scripts/insert-361-drafts.js            # dry run: report only
 *   node scripts/insert-361-drafts.js --apply    # append + write diff summary
 *
 * Safety contract:
 * - ADD-ONLY. If a draft code already exists in 361.json the record is
 *   SKIPPED and reported — existing records are never modified.
 * - Every inserted record is stamped review_status "draft" and
 *   source_status "model_draft_pending_source_review".
 * - sources[] is auto-filled: acupoints.org per-point URL + CloudTCM direct
 *   link from data/sources/cloudtcm_point_map.json.
 * - Writes docs/361_DRAFT_FILL_SUMMARY.md describing exactly what was added.
 * - Also refreshes data/audits/missing_report.json channel counts afterward
 *   (same shape as the existing report).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRAFT_DIR = path.join(ROOT, "data", "imports", "model_draft");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const MAP_FILE = path.join(ROOT, "data", "sources", "cloudtcm_point_map.json");
const AUDIT_FILE = path.join(ROOT, "data", "audits", "missing_report.json");
const SUMMARY_FILE = path.join(ROOT, "docs", "361_DRAFT_FILL_SUMMARY.md");

const APPLY = process.argv.includes("--apply");

function loadDraftRecords() {
  const files = fs.readdirSync(DRAFT_DIR).filter((f) => f.endsWith("_draft.json")).sort();
  const all = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DRAFT_DIR, file), "utf8"));
    for (const record of data.records || []) all.push({ ...record, _sourceFile: file });
  }
  return all;
}

function normalizeRecord(draft, cloudtcmMap) {
  const code = draft.code;
  const sources = [];
  sources.push(`https://www.acupoints.org/${code.toLowerCase()}-acupuncture-point/`);
  if (cloudtcmMap[code]) sources.push(`https://cloudtcm.com/acupoint/${cloudtcmMap[code].id}`);
  return {
    code,
    chinese: draft.chinese || "",
    pinyin: draft.pinyin || "",
    english: draft.english || "",
    channel_zh: draft.channel_zh || "",
    channel_en: draft.channel_en || "",
    location_zh: draft.location_zh || "",
    location_en: draft.location_en || "",
    cun_measurement: draft.cun_measurement || "",
    functions_zh: draft.functions_zh || [],
    functions_en: draft.functions_en || [],
    indications_zh: draft.indications_zh || [],
    indications_en: draft.indications_en || [],
    muscles: [],
    bones: [],
    nerves: [],
    vessels: [],
    contraindications: draft.contraindications || [],
    needling: draft.needling || "",
    danger: draft.danger || [],
    nccaom_high_yield: [],
    clinical_pearls: [],
    sources,
    meridian_display: `${draft.channel_en} / ${draft.channel_zh}`,
    region: draft.region || "",
    evidence: "",
    cautions: draft.contraindications || [],
    review_status: "draft",
    source_status: "model_draft_pending_source_review",
    draft_created: draft._sourceFile ? "2026-07-08" : ""
  };
}

function channelOf(code) {
  const match = String(code).match(/^[A-Z]+/);
  return match ? match[0] : "";
}

function rebuildAudit(records, existingAudit) {
  const byChannel = {};
  for (const [channel, info] of Object.entries(existingAudit.channels)) {
    const expectedCodes = Array.from({ length: info.expected_count }, (_, i) => `${channel}${i + 1}`);
    const have = new Set(records.filter((r) => channelOf(r.code) === channel).map((r) => r.code));
    const present = expectedCodes.filter((c) => have.has(c));
    const missing = expectedCodes.filter((c) => !have.has(c));
    byChannel[channel] = {
      expected_count: info.expected_count,
      present_count: present.length,
      missing_count: missing.length,
      present,
      missing
    };
  }
  const totalPresent = Object.values(byChannel).reduce((s, c) => s + c.present_count, 0);
  const totalExpected = Object.values(byChannel).reduce((s, c) => s + c.expected_count, 0);
  return {
    ...existingAudit,
    generated_on: new Date().toISOString().slice(0, 10),
    total_expected: totalExpected,
    total_present: totalPresent,
    total_missing: totalExpected - totalPresent,
    channels: byChannel,
    next_recommended_batch: totalExpected - totalPresent === 0
      ? "361 layer complete — next: per-record source verification (draft → source_checked)"
      : existingAudit.next_recommended_batch
  };
}

function main() {
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (!Array.isArray(db)) { console.error("361.json is not an array — aborting."); process.exit(1); }
  const cloudtcmMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf8")).points || {};
  const existingCodes = new Set(db.map((p) => p.code));

  const drafts = loadDraftRecords();
  const toInsert = [];
  const skipped = [];
  const seen = new Set();
  for (const draft of drafts) {
    if (!draft.code || seen.has(draft.code)) { skipped.push({ code: draft.code, reason: "duplicate in drafts" }); continue; }
    seen.add(draft.code);
    if (existingCodes.has(draft.code)) { skipped.push({ code: draft.code, reason: "already in 361.json — never overwritten" }); continue; }
    toInsert.push(normalizeRecord(draft, cloudtcmMap));
  }

  const byChannel = {};
  toInsert.forEach((r) => { const c = channelOf(r.code); byChannel[c] = (byChannel[c] || 0) + 1; });

  console.log(`Draft records read: ${drafts.length}`);
  console.log(`To insert: ${toInsert.length}`, byChannel);
  console.log(`Skipped: ${skipped.length}`, skipped.length ? skipped.slice(0, 5) : "");
  console.log(`361.json currently: ${db.length} records → would become ${db.length + toInsert.length}`);

  if (!APPLY) { console.log("\nDry run only. Re-run with --apply to write."); return; }

  const merged = db.concat(toInsert);
  const codes = merged.map((p) => p.code);
  if (new Set(codes).size !== codes.length) { console.error("Duplicate codes after merge — aborting, nothing written."); process.exit(1); }

  fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 1));

  const audit = rebuildAudit(merged, JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8")));
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(audit, null, 2));

  const summary = `# 361 Draft Fill Summary

Generated: ${new Date().toISOString()}

Source: data/imports/model_draft/*.json (model-knowledge drafts, Claude 2026-07-08)

## What happened

- ${toInsert.length} NEW records appended to data/acupoints/361.json (add-only).
- 0 existing records modified. ${skipped.length} draft records skipped (already present or duplicate).
- Every new record: review_status "draft", source_status "model_draft_pending_source_review",
  sources auto-filled with acupoints.org + CloudTCM per-point URLs.
- data/audits/missing_report.json regenerated: ${audit.total_present}/${audit.total_expected} present, ${audit.total_missing} missing.

## Added by channel

${Object.entries(byChannel).map(([c, n]) => `- ${c}: ${n}`).join("\n")}

## Added codes

${toInsert.map((r) => r.code).join(", ")}

## Review path

These records are study drafts from model knowledge, NOT source-checked.
Verification order per docs/CODEX_TASK_QUEUE.md: CloudTCM import (D1-D3)
cross-checks the Chinese layer; WHO SAPL verifies locations; only then may
records be promoted past draft. High-risk points (CV22 天突, GV15 啞門,
GV16 風府, chest/back points) carry explicit danger notes and must be
independently verified before any clinical reference use.
`;
  fs.writeFileSync(SUMMARY_FILE, summary);

  console.log(`\nApplied. 361.json now ${merged.length} records.`);
  console.log(`Audit refreshed: ${audit.total_present}/${audit.total_expected}.`);
  console.log(`Summary: ${path.relative(ROOT, SUMMARY_FILE)}`);
}

main();

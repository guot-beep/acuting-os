const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANONICAL_PATH = path.join(ROOT, "data", "acupoints", "361.json");
const MANIFEST_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "source_manifest.json");
const STAGING_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "protocol_table_staging.json");
const JSON_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_PROTOCOL_ANATOMY_PREVIEW.json");
const MD_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_PROTOCOL_ANATOMY_SUMMARY.md");

if (process.argv.some((arg) => arg.startsWith("--apply"))) {
  throw new Error("Apply is intentionally unsupported; protocol anatomy requires field-level review");
}

const canonical = JSON.parse(fs.readFileSync(CANONICAL_PATH, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const staging = JSON.parse(fs.readFileSync(STAGING_PATH, "utf8"));
if (canonical.length !== 361) throw new Error(`Expected 361 canonical points, got ${canonical.length}`);
if (manifest.canonical_write_allowed !== false || staging.canonical_write_allowed !== false) {
  throw new Error("Protocol anatomy inputs must prohibit canonical writes");
}
if (staging.review_status !== "draft") throw new Error("Protocol anatomy staging must remain draft");

const canonicalByCode = new Map(canonical.map((point) => [point.code, point]));
const sourcesById = new Map(manifest.sources.map((source) => [source.id, source]));
const recordsByCode = new Map();

for (const record of staging.records) {
  if (!canonicalByCode.has(record.code)) throw new Error(`Unknown point code ${record.code}`);
  if (!sourcesById.has(record.source_id)) throw new Error(`Unknown source id ${record.source_id}`);
  if (!Array.isArray(record.protocol_tissue) || !record.protocol_tissue.length) {
    throw new Error(`${record.code}/${record.source_id} has no protocol tissue`);
  }
  if (!recordsByCode.has(record.code)) recordsByCode.set(record.code, []);
  recordsByCode.get(record.code).push(record);
}

const conflicts = [];
for (const [code, records] of recordsByCode) {
  const muscleSets = records
    .filter((record) => record.muscle_candidates.length)
    .map((record) => [...record.muscle_candidates].sort().join("|"));
  if (new Set(muscleSets).size > 1) {
    conflicts.push({
      code,
      field: "muscles",
      source_variants: records.map((record) => ({
        source_id: record.source_id,
        values: record.muscle_candidates
      })),
      resolution: "withheld_pending_insertion_path_and_anatomy_review"
    });
  }
}

const conflictCodes = new Set(conflicts.map((item) => item.code));
const proposals = [];
const skips = [];

function propose(code, field, values, sourceIds, rationale) {
  const point = canonicalByCode.get(code);
  const item = {
    code,
    name_zh: point.chinese,
    field,
    current_value: point[field],
    proposed_values: [...new Set(values)],
    source_ids: [...new Set(sourceIds)],
    rationale,
    review_status: "draft",
    source_status: "protocol_table_extracted_pending_anatomy_review",
    canonical_write_allowed: false
  };
  if (conflictCodes.has(code)) {
    skips.push({ ...item, reason: "cross-source anatomy conflict" });
  } else if (Array.isArray(point[field]) && point[field].length === 0) {
    proposals.push(item);
  } else {
    skips.push({ ...item, reason: "canonical field is already non-empty" });
  }
}

for (const [code, records] of recordsByCode) {
  const muscles = records.flatMap((record) => record.muscle_candidates || []);
  if (muscles.length) {
    propose(
      code,
      "muscles",
      muscles,
      records.filter((record) => record.muscle_candidates.length).map((record) => record.source_id),
      "Study-protocol tissue path explicitly names these muscles; candidate is not an exhaustive universal anatomy statement."
    );
  }
  const nerves = records.flatMap((record) => [
    ...(record.cutaneous_innervation || []),
    ...(record.muscle_innervation || [])
  ]);
  if (nerves.length) {
    propose(
      code,
      "nerves",
      nerves,
      records.filter((record) => (record.cutaneous_innervation || []).length || (record.muscle_innervation || []).length).map((record) => record.source_id),
      "Human study explicitly names cutaneous or muscle innervation at the stimulation site."
    );
  }
}

proposals.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.field.localeCompare(b.field));
skips.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.field.localeCompare(b.field));

const studyRecords = [...recordsByCode.entries()].map(([code, records]) => ({
  code,
  name_zh: canonicalByCode.get(code).chinese,
  sources: records.map((record) => record.source_id),
  protocol_tissue_variants: records.map((record) => ({ source_id: record.source_id, values: record.protocol_tissue })),
  segmental_innervation: records.map((record) => ({ source_id: record.source_id, values: record.segmental_innervation || [] })),
  cutaneous_innervation: [...new Set(records.flatMap((record) => record.cutaneous_innervation || []))],
  muscle_innervation: [...new Set(records.flatMap((record) => record.muscle_innervation || []))],
  cutaneous_segmental_innervation: [...new Set(records.flatMap((record) => record.cutaneous_segmental_innervation || []))],
  muscle_segmental_innervation: [...new Set(records.flatMap((record) => record.muscle_segmental_innervation || []))],
  conflict_status: conflictCodes.has(code) ? "cross_source_review_required" : "none",
  review_status: "draft"
})).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

const summary = {
  canonical_records_checked: canonical.length,
  source_table_rows: staging.records.length,
  unique_points: recordsByCode.size,
  fill_empty_field_proposals: proposals.length,
  proposed_values: proposals.reduce((sum, item) => sum + item.proposed_values.length, 0),
  cross_source_conflicts: conflicts.length,
  withheld_or_existing_field_skips: skips.length,
  source_reference_errors: 0,
  unknown_point_codes: 0,
  canonical_writes: 0
};

const payload = {
  generated_at: new Date().toISOString(),
  canonical_input: "data/acupoints/361.json",
  staging_input: "data/imports/acupoint_anatomy/protocol_table_staging.json",
  canonical_write_allowed: false,
  summary,
  rules: [
    "Protocol tissue is study-specific and is not a universal needling path.",
    "Segmental innervation remains study metadata and is not forced into the canonical nerves array.",
    "Cross-source muscle differences are withheld rather than silently merged.",
    "Only wholly empty canonical arrays are eligible for fill proposals.",
    "No treatment efficacy or universal depth claim is derived from these tables."
  ],
  proposals,
  conflicts,
  skips,
  study_records: studyRecords
};

fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const proposalRows = proposals.map((item) =>
  `| \`${item.code}\` ${item.name_zh} | \`${item.field}\` | ${item.proposed_values.join("<br>")} | ${item.source_ids.map((id) => `\`${id}\``).join("<br>")} |`
).join("\n");
const studyRows = studyRecords.map((item) =>
  `| \`${item.code}\` ${item.name_zh} | ${item.protocol_tissue_variants.map((entry) => `${entry.values.join("; ")} (${entry.source_id})`).join("<br>")} | ${[
    ...item.segmental_innervation.flatMap((entry) => entry.values),
    ...item.cutaneous_segmental_innervation.map((value) => `cutaneous ${value}`),
    ...item.muscle_segmental_innervation.map((value) => `muscle ${value}`)
  ].join("; ") || "-"} | ${item.conflict_status} |`
).join("\n");

const markdown = `# Acupoint Protocol Anatomy Summary

Review-only extraction from peer-reviewed human-study tables. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points checked | ${summary.canonical_records_checked} |
| Source table rows | ${summary.source_table_rows} |
| Unique points | ${summary.unique_points} |
| Fill-empty field proposals | ${summary.fill_empty_field_proposals} |
| Proposed values | ${summary.proposed_values} |
| Cross-source conflicts | ${summary.cross_source_conflicts} |
| Withheld/existing-field skips | ${summary.withheld_or_existing_field_skips} |
| Canonical writes | 0 |

## Fill-Empty Proposals

| Point | Field | Proposed values | Sources |
| --- | --- | --- | --- |
${proposalRows}

## Extracted Study Table

| Point | Protocol tissue/path | Segmental innervation | Conflict status |
| --- | --- | --- | --- |
${studyRows}

## Conflict Kept Visible

\`LR3\` is withheld from muscle and nerve fill proposals. The PCOS trial protocol names the first dorsal interosseous muscle, while the lower-limb haemodynamic study names extensor digitorum brevis and a different innervation description. This may reflect localization, insertion path, depth, or reporting differences; it must not be mechanically normalized.

## Gate

These data describe the tissue path used in particular human studies. Review each muscle or nerve proposal against an approved professional anatomy text before any later canonical apply step. No efficacy or universal needling-depth statement is authorized.
`;

fs.writeFileSync(MD_OUTPUT, markdown, "utf8");
console.log(JSON.stringify(summary, null, 2));

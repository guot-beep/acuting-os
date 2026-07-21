const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANONICAL_PATH = path.join(ROOT, "data", "acupoints", "361.json");
const MANIFEST_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "source_manifest.json");
const STAGING_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "high_risk_review_staging.json");
const JSON_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_ANATOMY_FILL_PREVIEW.json");
const MD_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_ANATOMY_FILL_DIFF_SUMMARY.md");

if (process.argv.some((arg) => arg.startsWith("--apply"))) {
  throw new Error("Apply is intentionally unsupported; anatomy fill proposals require Ting review");
}

const canonical = JSON.parse(fs.readFileSync(CANONICAL_PATH, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const staging = JSON.parse(fs.readFileSync(STAGING_PATH, "utf8"));
if (canonical.length !== 361) throw new Error(`Expected 361 canonical points, got ${canonical.length}`);
if (manifest.canonical_write_allowed !== false || staging.canonical_write_allowed !== false) {
  throw new Error("Inputs must prohibit canonical writes");
}

const canonicalByCode = new Map(canonical.map((point) => [point.code, point]));
const sourceIds = new Set(manifest.sources.map((source) => source.id));
const candidates = [];

function addCandidate(code, field, value, sourceId, rationale) {
  const point = canonicalByCode.get(code);
  if (!point) throw new Error(`Unknown point code ${code}`);
  if (!sourceIds.has(sourceId)) throw new Error(`Unknown source id ${sourceId}`);
  candidates.push({ code, name_zh: point.chinese, field, value, source_id: sourceId, rationale });
}

for (const item of staging.explicit_peripheral_nerve_candidates) {
  addCandidate(
    item.code,
    "nerves",
    item.nerve,
    item.source_id,
    "The source explicitly names this point-to-peripheral-nerve proximity relationship."
  );
}

for (const finding of staging.point_specific_findings) {
  const structures = finding.structures.join("; ");
  addCandidate(
    finding.code,
    "danger",
    `Source-identified anatomy review: ${structures}. ${finding.review_prompt}`,
    finding.source_id,
    "Point-specific safety/anatomy finding; staged as a review prompt, not a technique or universal-depth rule."
  );
}

addCandidate("ST9", "muscles", "sternocleidomastoid muscle", "kim_ultrasound_44_points_2017", "Named in the article's point-specific ST9 ultrasound SOP.");
addCandidate("ST9", "vessels", "common carotid artery", "kim_ultrasound_44_points_2017", "Named in the article's point-specific ST9 ultrasound SOP.");
addCandidate("ST9", "vessels", "internal jugular vein", "lin_mri_neck_shoulder_depth_2015", "Named as a major-vessel depth endpoint for the neck-point MRI review.");
addCandidate("CV22", "vessels", "brachiocephalic vein", "zhang_cv22_st11_cadaver_2007", "Named in the published abstract's CV22 cadaver safety findings.");
addCandidate("ST11", "vessels", "internal jugular vein", "zhang_cv22_st11_cadaver_2007", "Named in the published abstract's ST11 cadaver safety findings.");
addCandidate("ST11", "vessels", "common carotid artery", "zhang_cv22_st11_cadaver_2007", "Named in the published abstract's ST11 cadaver safety findings.");
addCandidate("ST11", "nerves", "vagus nerve", "zhang_cv22_st11_cadaver_2007", "Named in the published abstract's ST11 cadaver safety findings.");
addCandidate("GV20", "nerves", "greater occipital nerves", "lee_gv20_anatomy_2023", "Named in the GV20 anatomy article.");
addCandidate("GV20", "vessels", "emissary veins", "lee_gv20_anatomy_2023", "Named in the GV20 anatomy article.");
addCandidate("GV20", "vessels", "occipital vessels", "lee_gv20_anatomy_2023", "Named in the GV20 anatomy article.");

const grouped = new Map();
for (const item of candidates) {
  const key = `${item.code}|${item.field}`;
  if (!grouped.has(key)) {
    grouped.set(key, {
      code: item.code,
      name_zh: item.name_zh,
      field: item.field,
      proposed_values: [],
      source_ids: [],
      rationales: []
    });
  }
  const group = grouped.get(key);
  group.proposed_values.push(item.value);
  group.source_ids.push(item.source_id);
  group.rationales.push(item.rationale);
}

const proposals = [];
const existingFieldSkips = [];
for (const group of grouped.values()) {
  const point = canonicalByCode.get(group.code);
  const current = point[group.field];
  const normalized = {
    ...group,
    proposed_values: [...new Set(group.proposed_values)],
    source_ids: [...new Set(group.source_ids)],
    rationales: [...new Set(group.rationales)],
    current_value: current,
    review_status: "draft",
    source_status: "source_extracted_pending_record_review",
    conflict: false,
    canonical_write_allowed: false
  };
  if (Array.isArray(current) && current.length === 0) proposals.push(normalized);
  else existingFieldSkips.push({ ...normalized, reason: "canonical field is already non-empty; no append or overwrite previewed" });
}

proposals.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.field.localeCompare(b.field));
existingFieldSkips.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.field.localeCompare(b.field));

const summary = {
  canonical_records_checked: canonical.length,
  raw_source_candidates: candidates.length,
  fill_empty_field_proposals: proposals.length,
  proposed_values: proposals.reduce((sum, item) => sum + item.proposed_values.length, 0),
  existing_nonempty_field_skips: existingFieldSkips.length,
  affected_points: new Set(proposals.map((item) => item.code)).size,
  conflicts: 0,
  canonical_writes: 0
};

const payload = {
  generated_at: new Date().toISOString(),
  canonical_input: "data/acupoints/361.json",
  staging_input: "data/imports/acupoint_anatomy/high_risk_review_staging.json",
  canonical_write_allowed: false,
  summary,
  rules: [
    "Only wholly empty canonical arrays are eligible for this preview.",
    "No populated field is appended to or overwritten.",
    "Danger values are source review prompts, not needling instructions.",
    "Nerve, vessel, and muscle values require field-level review before any later apply tool is authorized.",
    "No population imaging distance is converted to a safe depth."
  ],
  proposals,
  existing_field_skips: existingFieldSkips
};

fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const rows = proposals.map((item) =>
  `| \`${item.code}\` ${item.name_zh} | \`${item.field}\` | ${item.proposed_values.join("<br>")} | ${item.source_ids.map((id) => `\`${id}\``).join("<br>")} |`
).join("\n");

const markdown = `# Acupoint Anatomy Fill Diff Summary

Fill-empty, review-only preview. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points checked | ${summary.canonical_records_checked} |
| Raw source candidates | ${summary.raw_source_candidates} |
| Fill-empty field proposals | ${summary.fill_empty_field_proposals} |
| Proposed values | ${summary.proposed_values} |
| Affected points | ${summary.affected_points} |
| Existing non-empty field skips | ${summary.existing_nonempty_field_skips} |
| Conflicts | 0 |
| Canonical writes | 0 |

## Proposed Empty-Field Fills

| Point | Field | Proposed values | Sources |
| --- | --- | --- | --- |
${rows}

## Interpretation

- Peripheral-nerve candidates are point-proximity anatomy relationships explicitly named by the source.
- Vessels and muscle candidates are limited to point-specific structures named in the cited articles.
- The \`danger\` proposals preserve the source finding as a review prompt. They do not prescribe angle, depth, or treatment.
- Existing non-empty arrays are untouched and listed in the JSON preview for later comparison.

## Gate

Ting or a qualified reviewer should approve each field proposal before a separate conflict-refusing apply script is considered. This preview does not authorize changes to \`361.json\`.
`;

fs.writeFileSync(MD_OUTPUT, markdown, "utf8");
console.log(JSON.stringify(summary, null, 2));

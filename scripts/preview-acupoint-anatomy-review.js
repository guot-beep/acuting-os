const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANONICAL_PATH = path.join(ROOT, "data", "acupoints", "361.json");
const MANIFEST_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "source_manifest.json");
const STAGING_PATH = path.join(ROOT, "data", "imports", "acupoint_anatomy", "high_risk_review_staging.json");
const JSON_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_HIGH_RISK_ANATOMY_PREVIEW.json");
const MD_OUTPUT = path.join(ROOT, "docs", "ACUPOINT_HIGH_RISK_ANATOMY_SUMMARY.md");

if (process.argv.some((arg) => arg.startsWith("--apply"))) {
  throw new Error("Apply is intentionally unsupported; anatomy staging requires field-level review");
}

const canonical = JSON.parse(fs.readFileSync(CANONICAL_PATH, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const staging = JSON.parse(fs.readFileSync(STAGING_PATH, "utf8"));

if (canonical.length !== 361) throw new Error(`Expected 361 canonical points, got ${canonical.length}`);
if (manifest.canonical_write_allowed !== false || staging.canonical_write_allowed !== false) {
  throw new Error("Anatomy manifest and staging must both prohibit canonical writes");
}
if (staging.review_status !== "draft") throw new Error("Anatomy staging must remain draft");

const canonicalByCode = new Map(canonical.map((point) => [point.code, point]));
const sourcesById = new Map(manifest.sources.map((source) => [source.id, source]));
const previewSourceIds = new Set(["chapple_361_anatomy_catalog_2013"]);

function requireCode(code, context) {
  if (!canonicalByCode.has(code)) throw new Error(`${context}: unknown canonical point code ${code}`);
}

function requireSource(sourceId, context) {
  if (!sourcesById.has(sourceId)) throw new Error(`${context}: unknown source id ${sourceId}`);
}

const studySetCodes = [];
for (const set of staging.study_sets) {
  requireSource(set.source_id, `study set ${set.id}`);
  previewSourceIds.add(set.source_id);
  for (const code of set.codes) {
    requireCode(code, `study set ${set.id}`);
    studySetCodes.push(code);
  }
}

if (studySetCodes.length !== 44) throw new Error(`Expected 44 ultrasound study entries, got ${studySetCodes.length}`);
if (new Set(studySetCodes).size !== 44) throw new Error("The 44-point ultrasound study set contains duplicate point codes");

for (const finding of staging.point_specific_findings) {
  requireCode(finding.code, "point-specific finding");
  requireSource(finding.source_id, `point-specific finding ${finding.code}`);
  previewSourceIds.add(finding.source_id);
  if (!finding.structures.length) throw new Error(`Point-specific finding ${finding.code} has no structures`);
}

const nerveKeys = new Set();
for (const finding of staging.explicit_peripheral_nerve_candidates) {
  requireCode(finding.code, "nerve candidate");
  requireSource(finding.source_id, `nerve candidate ${finding.code}`);
  previewSourceIds.add(finding.source_id);
  const key = `${finding.code}|${finding.nerve}`;
  if (nerveKeys.has(key)) throw new Error(`Duplicate nerve candidate ${key}`);
  nerveKeys.add(key);
}

const reviewByCode = new Map();
function reviewRecord(code) {
  if (!reviewByCode.has(code)) {
    const point = canonicalByCode.get(code);
    reviewByCode.set(code, {
      code,
      name_zh: point.chinese,
      name_en: point.english,
      risk_regions: [],
      study_set_ids: [],
      regional_review_targets: [],
      point_specific_findings: [],
      nerve_candidates: [],
      current_canonical_anatomy_counts: {
        muscles: Array.isArray(point.muscles) ? point.muscles.length : 0,
        bones: Array.isArray(point.bones) ? point.bones.length : 0,
        nerves: Array.isArray(point.nerves) ? point.nerves.length : 0,
        vessels: Array.isArray(point.vessels) ? point.vessels.length : 0
      },
      review_status: "draft",
      source_status: "source_extracted_pending_record_review",
      canonical_write_allowed: false
    });
  }
  return reviewByCode.get(code);
}

for (const set of staging.study_sets) {
  for (const code of set.codes) {
    const record = reviewRecord(code);
    record.risk_regions.push(set.risk_region);
    record.study_set_ids.push(set.id);
    record.regional_review_targets.push(...set.review_targets);
  }
}

for (const finding of staging.point_specific_findings) {
  reviewRecord(finding.code).point_specific_findings.push({
    source_id: finding.source_id,
    finding_type: finding.finding_type,
    structures: finding.structures,
    review_prompt: finding.review_prompt
  });
}

for (const finding of staging.explicit_peripheral_nerve_candidates) {
  reviewRecord(finding.code).nerve_candidates.push({
    nerve: finding.nerve,
    source_id: finding.source_id,
    status: "candidate_pending_anatomy_review"
  });
}

for (const record of reviewByCode.values()) {
  record.risk_regions = [...new Set(record.risk_regions)];
  record.study_set_ids = [...new Set(record.study_set_ids)];
  record.regional_review_targets = [...new Set(record.regional_review_targets)];
}

const records = [...reviewByCode.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
const previewSources = manifest.sources.filter((source) => previewSourceIds.has(source.id));
const regionCounts = {};
for (const set of staging.study_sets) regionCounts[set.risk_region] = set.codes.length;

const summary = {
  canonical_records_checked: canonical.length,
  ultrasound_high_risk_points: studySetCodes.length,
  unique_points_in_review_preview: records.length,
  point_specific_findings: staging.point_specific_findings.length,
  explicit_peripheral_nerve_candidates: staging.explicit_peripheral_nerve_candidates.length,
  sources_registered: previewSources.length,
  source_reference_errors: 0,
  unknown_point_codes: 0,
  conflicts: 0,
  canonical_writes: 0,
  region_counts: regionCounts
};

const payload = {
  generated_at: new Date().toISOString(),
  canonical_input: "data/acupoints/361.json",
  source_manifest: "data/imports/acupoint_anatomy/source_manifest.json",
  staging_input: "data/imports/acupoint_anatomy/high_risk_review_staging.json",
  canonical_write_allowed: false,
  summary,
  rules: [
    "Regional review targets are not canonical anatomy claims for every point in a study set.",
    "Only explicitly named point-specific structures appear in point_specific_findings or nerve_candidates.",
    "No fixed safe depth is proposed from population MRI or ultrasound measurements.",
    "All proposed anatomy remains draft pending professional record-level review.",
    "This preview does not provide treatment guidance or medical advice."
  ],
  sources: previewSources,
  records
};

fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const regionRows = Object.entries(regionCounts)
  .map(([region, count]) => `| ${region} | ${count} |`)
  .join("\n");
const specificRows = records
  .filter((record) => record.point_specific_findings.length || record.nerve_candidates.length)
  .map((record) => {
    const structures = record.point_specific_findings.flatMap((item) => item.structures).join("; ") || "-";
    const nerves = record.nerve_candidates.map((item) => item.nerve).join("; ") || "-";
    return `| \`${record.code}\` ${record.name_zh} | ${structures} | ${nerves} |`;
  })
  .join("\n");

const markdown = `# Acupoint High-Risk Anatomy Summary

Review-only source staging. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points checked | ${summary.canonical_records_checked} |
| Ultrasound high-risk study points | ${summary.ultrasound_high_risk_points} |
| Unique points in combined preview | ${summary.unique_points_in_review_preview} |
| Point-specific source findings | ${summary.point_specific_findings} |
| Explicit peripheral-nerve candidates | ${summary.explicit_peripheral_nerve_candidates} |
| Registered sources | ${summary.sources_registered} |
| Source/code errors | 0 |
| Conflicts | 0 |
| Canonical writes | 0 |

## Ultrasound Study Regions

| Region | Points |
| --- | ---: |
${regionRows}

The 44-point article supports inclusion in a high-risk ultrasound study set. It does **not** supply a complete point-by-point anatomy claim for every listed point. Regional targets therefore remain review prompts.

## Explicit Point-Level Candidates

| Point | Source-named structures | Source-named peripheral nerve |
| --- | --- | --- |
${specificRows}

## Safety Boundaries

1. MRI distances are cohort measurements affected by BMI, sex, insertion angle, direction, and individual anatomy. No universal safe depth is proposed.
2. Pleura, major-vessel, dura, and nerve relationships are safety-review context, not efficacy claims.
3. The CV22/ST11 extraction is abstract-level and requires full-text or professional-textbook review before canonical use.
4. The Chapple 361-point catalog is registered as a future lane only. Its abstract confirms scope, but no point-level facts were extracted without the catalog.
5. This staging is for study and record review, not medical advice.

## Gate

Review the explicit candidates against the cited articles and an approved professional acupuncture anatomy text. A later fill-empty preview may propose individual \`nerves\` or \`vessels\` values, but only after field-level approval. Regional study membership must never be applied as anatomy content.
`;

fs.writeFileSync(MD_OUTPUT, markdown, "utf8");
console.log(JSON.stringify(summary, null, 2));

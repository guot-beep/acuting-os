const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANONICAL_PATH = path.join(ROOT, "data", "acupoints", "361.json");
const STAGING_PATH = path.join(ROOT, "data", "imports", "acupoint_sources", "who_location_staging.json");
const JSON_OUTPUT = path.join(ROOT, "docs", "WHO_CUN_FILL_PREVIEW.json");
const MD_OUTPUT = path.join(ROOT, "docs", "WHO_CUN_FILL_DIFF_SUMMARY.md");

if (process.argv.includes("--apply")) {
  throw new Error("Apply is intentionally unsupported; WHO cun preview requires Ting approval");
}

const canonical = JSON.parse(fs.readFileSync(CANONICAL_PATH, "utf8"));
const staging = JSON.parse(fs.readFileSync(STAGING_PATH, "utf8"));

if (canonical.length !== 361) throw new Error(`Expected 361 canonical records, got ${canonical.length}`);
if (staging.canonical_write_allowed !== false) throw new Error("WHO staging must prohibit canonical writes");
if (staging.records.length !== 361) throw new Error(`Expected 361 WHO staging records, got ${staging.records.length}`);

const stagingByCode = new Map(staging.records.map((record) => [record.code, record]));
const proposals = [];
const unresolved = [];
let existing = 0;

for (const point of canonical) {
  const staged = stagingByCode.get(point.code);
  if (!staged) throw new Error(`Missing WHO staging record: ${point.code}`);
  if (point.cun_measurement) {
    existing += 1;
    continue;
  }
  if (!Array.isArray(staged.b_cun_fragments) || staged.b_cun_fragments.length === 0) {
    unresolved.push({
      code: point.code,
      name_zh: point.chinese,
      reason: "WHO standard location has no separately extracted B-cun fragment",
      source_pdf_page: staged.source_pdf_page
    });
    continue;
  }
  proposals.push({
    code: point.code,
    name_zh: point.chinese,
    pinyin: point.pinyin,
    field: "cun_measurement",
    current_value: "",
    proposed_value: staged.b_cun_fragments.join("; "),
    source_id: staged.source_id,
    source_url: staged.source_url,
    source_pdf_page: staged.source_pdf_page,
    source_printed_page_estimate: staged.source_printed_page_estimate,
    extraction_method: staged.extraction_method,
    review_status: "draft",
    source_status: "who_extracted_pending_record_review",
    conflict: false
  });
}

const manualTranscriptions = proposals.filter((item) => item.extraction_method === "page_image_manual_transcription");
const payload = {
  generated_at: new Date().toISOString(),
  canonical_input: "data/acupoints/361.json",
  staging_input: "data/imports/acupoint_sources/who_location_staging.json",
  canonical_write_allowed: false,
  summary: {
    canonical_records: canonical.length,
    existing_cun_measurement: existing,
    fill_empty_proposals: proposals.length,
    still_unresolved: unresolved.length,
    manual_transcription_proposals: manualTranscriptions.length,
    conflicts: 0,
    canonical_writes: 0
  },
  rules: [
    "Only empty canonical cun_measurement fields are eligible.",
    "B-cun fragments remain draft until record-level review.",
    "No location_en value is overwritten.",
    "Page-image transcriptions require a second visual review.",
    "No apply mode exists in this review session."
  ],
  proposals,
  unresolved
};

fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const samples = proposals.slice(0, 20).map((item) =>
  `| \`${item.code}\` ${item.name_zh} | ${item.proposed_value} | ${item.source_pdf_page} | ${item.extraction_method} |`
).join("\n");

const markdown = `# WHO Cun Fill Diff Summary

Review-only, fill-empty preview. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points | ${canonical.length} |
| Existing non-empty cun values | ${existing} |
| Empty fields fillable from explicit WHO B-cun fragments | ${proposals.length} |
| Empty fields still unresolved | ${unresolved.length} |
| Page-image transcription proposals | ${manualTranscriptions.length} |
| Conflicts | 0 |
| Canonical writes | 0 |

## Sample Proposals

| Point | Proposed cun measurement | PDF page | Extraction method |
| --- | --- | ---: | --- |
${samples}

## Special Review

${manualTranscriptions.length
  ? manualTranscriptions.map((item) => `- \`${item.code}\`: ${item.proposed_value} (PDF page ${item.source_pdf_page}; second visual review required)`).join("\n")
  : "- No page-image transcription enters this preview."}

## Gate

Review the 100 short B-cun clauses against their WHO page locators. Approval of this preview would permit a separate conflict-refusing, fill-empty-only apply tool. It would not approve any changes to full English locations, needling, moxibustion, functions, indications, or efficacy content.
`;

fs.writeFileSync(MD_OUTPUT, markdown, "utf8");
console.log(JSON.stringify(payload.summary, null, 2));

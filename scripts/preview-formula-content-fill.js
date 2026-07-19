const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMULAS_PATH = path.join(ROOT, "data", "herbs", "formulas.json");
const REPORT_DIR = path.join(ROOT, "docs", "formula_content_previews");

const ALLOWED_FIELDS = new Set([
  "composition",
  "actions_en",
  "pattern_indications_en",
  "modifications_en",
  "contraindications_en",
  "safety_flags",
  "english_exam_track.actions",
  "english_exam_track.indications",
  "english_exam_track.modifications",
  "english_exam_track.contraindications",
  "english_exam_track.notes"
]);

const PROHIBITED_FIELD_PATTERN = /dose|gram|modern|condition|clinical_use|source_checked/i;
const DAMAGE_PATTERN = /\?{3,}|\uFFFD/;

function fail(message) {
  throw new Error(message);
}

function getPath(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value?.[key], object);
}

function isEmpty(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return value == null;
}

function containsDamage(value) {
  if (typeof value === "string") return DAMAGE_PATTERN.test(value);
  if (Array.isArray(value)) return value.some(containsDamage);
  if (value && typeof value === "object") return Object.values(value).some(containsDamage);
  return false;
}

function validateSources(sources, context) {
  if (!Array.isArray(sources) || sources.length === 0) {
    fail(`${context}: each field requires at least one source`);
  }
  for (const [index, source] of sources.entries()) {
    if (!source || typeof source !== "object") fail(`${context}: source ${index} must be an object`);
    if (typeof source.url !== "string" || !/^https:\/\//.test(source.url)) {
      fail(`${context}: source ${index} requires an https URL`);
    }
    if (typeof source.title !== "string" || source.title.trim() === "") {
      fail(`${context}: source ${index} requires a title`);
    }
    if (source.locator != null && typeof source.locator !== "string") {
      fail(`${context}: source ${index} locator must be a string`);
    }
  }
}

function validateStringArray(value, context) {
  if (!Array.isArray(value) || value.length === 0) fail(`${context}: value must be a non-empty array`);
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`${context}: item ${index} must be a non-empty string`);
    }
  });
}

function validateComposition(value, context) {
  if (!Array.isArray(value) || value.length === 0) fail(`${context}: composition must be non-empty`);
  value.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      fail(`${context}: composition item ${index} must be an object`);
    }
    if (typeof item.pinyin !== "string" || item.pinyin.trim() === "") {
      fail(`${context}: composition item ${index} requires pinyin`);
    }
    for (const [key, fieldValue] of Object.entries(item)) {
      if (PROHIBITED_FIELD_PATTERN.test(key) && !isEmpty(fieldValue)) {
        fail(`${context}: composition item ${index} cannot include ${key} in C2`);
      }
    }
  });
}

function safeBatchSlug(value) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(value)) {
    fail("batch must use lowercase letters, numbers, underscores, or hyphens");
  }
  return value;
}

function buildPreview(staging, formulas) {
  if (staging.dataset !== "formula_content_fill_staging") fail("dataset must be formula_content_fill_staging");
  if (staging.review_status !== "draft") fail("top-level review_status must remain draft");
  const batch = safeBatchSlug(staging.batch);
  if (!Array.isArray(staging.records) || staging.records.length === 0) fail("records must be non-empty");

  const formulaById = new Map(formulas.map((record) => [record.id, record]));
  const seen = new Set();
  const preview = [];

  for (const record of staging.records) {
    if (!record || typeof record !== "object") fail("each staging record must be an object");
    if (seen.has(record.id)) fail(`duplicate staging id: ${record.id}`);
    seen.add(record.id);
    const target = formulaById.get(record.id);
    if (!target) fail(`unknown formula id: ${record.id}`);
    if (target.source_type !== "formula_canon_shortlist_skeleton") {
      fail(`${record.id}: C2 may only target skeleton records`);
    }
    if (record.review_status !== "draft") fail(`${record.id}: review_status must remain draft`);
    if (!record.fields || typeof record.fields !== "object" || Array.isArray(record.fields)) {
      fail(`${record.id}: fields must be an object`);
    }

    const changes = [];
    for (const [fieldPath, entry] of Object.entries(record.fields)) {
      if (PROHIBITED_FIELD_PATTERN.test(fieldPath) || !ALLOWED_FIELDS.has(fieldPath)) {
        fail(`${record.id}: unsupported or prohibited field ${fieldPath}`);
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        fail(`${record.id}.${fieldPath}: entry must contain value and sources`);
      }
      validateSources(entry.sources, `${record.id}.${fieldPath}`);
      if (fieldPath === "composition") validateComposition(entry.value, `${record.id}.${fieldPath}`);
      else validateStringArray(entry.value, `${record.id}.${fieldPath}`);
      if (containsDamage(entry.value)) fail(`${record.id}.${fieldPath}: damaged text is not allowed`);

      const current = getPath(target, fieldPath);
      if (!isEmpty(current)) {
        fail(`${record.id}.${fieldPath}: conflict; canonical target is not empty`);
      }
      changes.push({ fieldPath, itemCount: entry.value.length, sources: entry.sources });
    }
    if (changes.length === 0) fail(`${record.id}: no staged fields`);
    preview.push({ id: record.id, nameZh: target.name_zh, nameEn: target.name_en, changes });
  }
  return { batch, preview };
}

function markdownReport(stagingPath, result) {
  const lines = [
    `# Formula Content Preview - ${result.batch}`,
    "",
    `Staging file: \`${path.relative(ROOT, stagingPath).replace(/\\/g, "/")}\``,
    "",
    "Preview only. This script has no apply mode and does not modify canonical formula data.",
    "",
    "## Summary",
    "",
    `- formulas: ${result.preview.length}`,
    `- fields: ${result.preview.reduce((sum, record) => sum + record.changes.length, 0)}`,
    `- staged items: ${result.preview.reduce((sum, record) => sum + record.changes.reduce((fieldSum, change) => fieldSum + change.itemCount, 0), 0)}`,
    "- conflicts: 0",
    "- canonical writes: 0",
    "",
    "## Field Preview",
    "",
    "| Formula | Field | Items | Sources |",
    "| --- | --- | ---: | --- |"
  ];
  for (const record of result.preview) {
    for (const change of record.changes) {
      const sources = change.sources
        .map((source) => `[${source.title}](${source.url})${source.locator ? ` (${source.locator})` : ""}`)
        .join("<br>");
      lines.push(`| \`${record.id}\` ${record.nameZh} / ${record.nameEn} | \`${change.fieldPath}\` | ${change.itemCount} | ${sources} |`);
    }
  }
  lines.push("", "## Gate", "", "Ting/Claude review is required before any apply-capable script is added or run.", "");
  return `${lines.join("\n")}\n`;
}

function main() {
  const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!inputArg) fail("Usage: node scripts/preview-formula-content-fill.js <staging.json> [--write-report]");
  if (process.argv.includes("--apply")) fail("Apply is intentionally unsupported; preview gate required");
  const stagingPath = path.resolve(ROOT, inputArg);
  const staging = JSON.parse(fs.readFileSync(stagingPath, "utf8"));
  const formulas = JSON.parse(fs.readFileSync(FORMULAS_PATH, "utf8")).records;
  const result = buildPreview(staging, formulas);
  const report = markdownReport(stagingPath, result);
  if (process.argv.includes("--write-report")) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const outputPath = path.join(REPORT_DIR, `${result.batch}.md`);
    fs.writeFileSync(outputPath, report, "utf8");
    console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
  }
  console.log(JSON.stringify({ batch: result.batch, formulas: result.preview.length, fields: result.preview.reduce((sum, record) => sum + record.changes.length, 0), conflicts: 0, canonical_writes: 0 }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Formula content preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { buildPreview, markdownReport };

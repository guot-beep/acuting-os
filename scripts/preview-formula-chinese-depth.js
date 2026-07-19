const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMULAS_PATH = path.join(ROOT, "data", "herbs", "formulas.json");
const REPORT_DIR = path.join(ROOT, "docs", "formula_chinese_depth_previews");

const ALLOWED_FIELDS = new Set([
  "chinese_depth_track.fang_yi_zh",
  "chinese_depth_track.zhu_zhi_zh",
  "chinese_depth_track.notes_zh"
]);
const DAMAGE_PATTERN = /\?{3,}|\uFFFD/;
const PROHIBITED_PATTERN = /dose|gram|modern|condition|clinical_use|source_checked|treat|cure/i;

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
    fail(`${context}: at least one source is required`);
  }
  for (const [index, source] of sources.entries()) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      fail(`${context}: source ${index} must be an object`);
    }
    if (typeof source.title !== "string" || source.title.trim() === "") {
      fail(`${context}: source ${index} requires a title`);
    }
    if (typeof source.url !== "string" || !/^https:\/\//.test(source.url)) {
      fail(`${context}: source ${index} requires an https URL`);
    }
    if (typeof source.locator !== "string" || source.locator.trim() === "") {
      fail(`${context}: source ${index} requires a locator`);
    }
  }
}

function validateSourceMatch(sourceMatch, context) {
  if (!sourceMatch || typeof sourceMatch !== "object" || Array.isArray(sourceMatch)) {
    fail(`${context}: source_match is required`);
  }
  if (sourceMatch.status !== "matched_with_caveats") {
    fail(`${context}: source_match.status must be matched_with_caveats`);
  }
  if (typeof sourceMatch.cloudtcm_formula_id !== "number") {
    fail(`${context}: cloudtcm_formula_id must be numeric`);
  }
  if (typeof sourceMatch.url !== "string" || !/^https:\/\/cloudtcm\.com\/formula\/\d+$/.test(sourceMatch.url)) {
    fail(`${context}: source_match.url must be an exact CloudTCM formula URL`);
  }
  if (!Array.isArray(sourceMatch.identity_checks) || sourceMatch.identity_checks.length < 2) {
    fail(`${context}: at least two identity checks are required`);
  }
  if (!Array.isArray(sourceMatch.caveats)) {
    fail(`${context}: caveats must be an array`);
  }
}

function validateFieldValue(fieldPath, value, context) {
  if (fieldPath.endsWith("notes_zh")) {
    if (!Array.isArray(value) || value.length === 0) {
      fail(`${context}: notes_zh must be a non-empty array`);
    }
    value.forEach((item, index) => {
      if (typeof item !== "string" || item.trim() === "") {
        fail(`${context}: item ${index} must be a non-empty string`);
      }
    });
    return value.length;
  }
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${context}: value must be a non-empty string`);
  }
  return 1;
}

function buildPreview(staging, formulas) {
  if (staging.dataset !== "formula_chinese_depth_staging") {
    fail("dataset must be formula_chinese_depth_staging");
  }
  if (staging.review_status !== "draft") fail("top-level review_status must remain draft");
  if (staging.canonical_write_allowed !== false) fail("canonical_write_allowed must be false");
  if (!Array.isArray(staging.records) || staging.records.length === 0) fail("records must be non-empty");

  const formulaById = new Map(formulas.map((record) => [record.id, record]));
  const seen = new Set();
  const preview = [];

  for (const record of staging.records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) fail("each record must be an object");
    if (seen.has(record.formula_id)) fail(`duplicate formula_id: ${record.formula_id}`);
    seen.add(record.formula_id);
    const target = formulaById.get(record.formula_id);
    if (!target) fail(`unknown formula id: ${record.formula_id}`);
    if (record.review_status !== "draft") fail(`${record.formula_id}: review_status must remain draft`);
    validateSourceMatch(record.source_match, record.formula_id);
    if (!record.fields || typeof record.fields !== "object" || Array.isArray(record.fields)) {
      fail(`${record.formula_id}: fields must be an object`);
    }

    const changes = [];
    for (const [fieldPath, entry] of Object.entries(record.fields)) {
      if (!ALLOWED_FIELDS.has(fieldPath) || PROHIBITED_PATTERN.test(fieldPath)) {
        fail(`${record.formula_id}: unsupported or prohibited field ${fieldPath}`);
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        fail(`${record.formula_id}.${fieldPath}: entry must contain value and sources`);
      }
      const itemCount = validateFieldValue(fieldPath, entry.value, `${record.formula_id}.${fieldPath}`);
      validateSources(entry.sources, `${record.formula_id}.${fieldPath}`);
      if (containsDamage(entry.value)) fail(`${record.formula_id}.${fieldPath}: damaged text is not allowed`);
      if (!isEmpty(getPath(target, fieldPath))) {
        fail(`${record.formula_id}.${fieldPath}: canonical target is not empty`);
      }
      changes.push({ fieldPath, itemCount, sources: entry.sources });
    }
    if (changes.length === 0) fail(`${record.formula_id}: no staged fields`);
    preview.push({
      id: record.formula_id,
      nameZh: target.name_zh,
      nameEn: target.name_en,
      sourceMatch: record.source_match,
      changes
    });
  }
  return { batch: staging.batch, preview };
}

function markdownReport(stagingPath, staging, result) {
  const fields = result.preview.reduce((sum, record) => sum + record.changes.length, 0);
  const items = result.preview.reduce(
    (sum, record) => sum + record.changes.reduce((fieldSum, change) => fieldSum + change.itemCount, 0),
    0
  );
  const lines = [
    `# Formula Chinese Depth Preview - ${result.batch}`,
    "",
    `Staging file: \`${path.relative(ROOT, stagingPath).replace(/\\/g, "/")}\``,
    "",
    "Review-only Chinese depth layer. No canonical formula data was modified, and this tool has no apply mode.",
    "",
    "## Summary",
    "",
    `- formulas: ${result.preview.length}`,
    `- fields: ${fields}`,
    `- staged items: ${items}`,
    "- conflicts: 0",
    "- canonical writes: 0",
    "- review status: draft",
    "",
    "## Source Matching",
    "",
    "| Formula | CloudTCM match | Caveats |",
    "| --- | --- | --- |"
  ];
  for (const record of result.preview) {
    const caveats = record.sourceMatch.caveats.length
      ? record.sourceMatch.caveats.join("<br>")
      : "None recorded";
    lines.push(`| \`${record.id}\` ${record.nameZh} | [formula/${record.sourceMatch.cloudtcm_formula_id}](${record.sourceMatch.url}) | ${caveats} |`);
  }
  lines.push(
    "",
    "## Field Preview",
    "",
    "| Formula | Field | Items | Sources |",
    "| --- | --- | ---: | --- |"
  );
  for (const record of result.preview) {
    for (const change of record.changes) {
      const sources = change.sources
        .map((source) => `[${source.title}](${source.url}) (${source.locator})`)
        .join("<br>");
      lines.push(`| \`${record.id}\` ${record.nameZh} | \`${change.fieldPath}\` | ${change.itemCount} | ${sources} |`);
    }
  }
  lines.push("", "## American Dragon Collection Status", "");
  lines.push(`- status: \`${staging.american_dragon_collection.status}\``);
  lines.push(`- reason: ${staging.american_dragon_collection.reason}`);
  lines.push(`- action: ${staging.american_dragon_collection.next_action}`);
  lines.push(
    "",
    "## Gate",
    "",
    "Ting/Claude must review the wording, source caveats, and field-level evidence model before any canonical apply path is designed."
  );
  return `${lines.join("\n")}\n`;
}

function main() {
  const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!inputArg) fail("Usage: node scripts/preview-formula-chinese-depth.js <staging.json> [--write-report]");
  if (process.argv.includes("--apply")) fail("Apply is intentionally unsupported; review gate required");
  const stagingPath = path.resolve(ROOT, inputArg);
  const staging = JSON.parse(fs.readFileSync(stagingPath, "utf8"));
  const formulas = JSON.parse(fs.readFileSync(FORMULAS_PATH, "utf8")).records;
  const result = buildPreview(staging, formulas);
  const report = markdownReport(stagingPath, staging, result);
  if (process.argv.includes("--write-report")) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const outputPath = path.join(REPORT_DIR, `${result.batch}.md`);
    fs.writeFileSync(outputPath, report, "utf8");
    console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
  }
  console.log(JSON.stringify({
    batch: result.batch,
    formulas: result.preview.length,
    fields: result.preview.reduce((sum, record) => sum + record.changes.length, 0),
    conflicts: 0,
    canonical_writes: 0
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Formula Chinese depth preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { buildPreview, markdownReport };

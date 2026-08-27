const fs = require("fs");

const herbPath = "data/herbs/herb_canon_shortlist.json";
const formulaPath = "data/herbs/formula_canon_shortlist.json";

const REQUIRED_TOP_FIELDS = ["dataset", "status", "updated", "purpose", "review_rule", "records"];
const REQUIRED_HERB_FIELDS = [
  "id",
  "name_zh",
  "name_en",
  "pinyin",
  "category",
  "channels_entered",
  "source_hint",
  "review_status",
  "properties_taste_temp",
  "functions",
  "related_formulas",
  "safety_flags",
  "clinical_use_note",
  "modern_use_tags",
  "english_exam_track",
  "chinese_depth_track"
];

const REQUIRED_ENGLISH_TRACK_FIELDS = [
  "review_status",
  "source_status",
  "properties_taste_temp",
  "functions",
  "indications",
  "common_pairings",
  "contraindications"
];

const REQUIRED_CHINESE_TRACK_FIELDS = ["review_status", "source_status", "summary_zh"];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

function hasMojibake(value) {
  return typeof value === "string" && /(?:Ã|Â|æ|è|é|å|ç|ä|¥|œ|ƒ|¤|¥|¡|§|—||�)/.test(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isArray(value) {
  return Array.isArray(value);
}

function main() {
  const errors = [];
  const warnings = [];
  const data = readJson(herbPath);
  const formulas = readJson(formulaPath);
  const formulaIds = new Set((formulas.records || []).map((record) => record.id));

  for (const field of REQUIRED_TOP_FIELDS) {
    if (!(field in data)) errors.push(`Top-level missing field: ${field}`);
  }

  if (!Array.isArray(data.records)) {
    errors.push("Top-level records must be an array.");
  }

  const ids = new Set();
  const categoryCounts = new Map();
  let sourceChecked = 0;
  let relatedFormulaLinks = 0;
  let safetyFlagLinks = 0;
  let modernUseTags = 0;

  for (const [index, record] of (data.records || []).entries()) {
    const label = record.id || `record[${index}]`;

    for (const field of REQUIRED_HERB_FIELDS) {
      if (!(field in record)) errors.push(`${label}: missing field ${field}`);
    }

    if (!/^herb\.[a-z0-9_]+$/.test(record.id || "")) {
      errors.push(`${label}: id must match herb.<pinyin_snake>`);
    }

    if (ids.has(record.id)) errors.push(`${label}: duplicate herb id`);
    ids.add(record.id);

    for (const field of ["name_zh", "name_en", "pinyin", "category", "source_hint", "review_status", "properties_taste_temp", "clinical_use_note"]) {
      if (!isNonEmptyString(record[field])) errors.push(`${label}: ${field} must be a non-empty string`);
      if (hasMojibake(record[field])) errors.push(`${label}: ${field} contains likely mojibake`);
    }

    if ("chinese_name_status" in record || "category_status" in record) {
      errors.push(`${label}: pending UTF-8 repair marker still present`);
    }

    for (const field of ["channels_entered", "functions", "related_formulas", "safety_flags", "modern_use_tags"]) {
      if (!isArray(record[field])) errors.push(`${label}: ${field} must be an array`);
    }

    if ((record.channels_entered || []).length === 0) warnings.push(`${label}: channels_entered is empty`);
    if ((record.functions || []).length === 0) errors.push(`${label}: functions should have draft study text`);
    if ((record.safety_flags || []).length === 0) errors.push(`${label}: safety_flags should include at least one review context`);
    if ((record.modern_use_tags || []).length === 0) warnings.push(`${label}: modern_use_tags is empty`);

    if (record.review_status !== "draft") {
      sourceChecked += record.review_status === "source_checked" ? 1 : 0;
      errors.push(`${label}: record review_status must remain draft for this staging file`);
    }

    for (const formulaId of record.related_formulas || []) {
      relatedFormulaLinks += 1;
      if (!formulaIds.has(formulaId)) errors.push(`${label}: related formula does not exist: ${formulaId}`);
    }

    safetyFlagLinks += (record.safety_flags || []).length;
    modernUseTags += (record.modern_use_tags || []).length;
    categoryCounts.set(record.category, (categoryCounts.get(record.category) || 0) + 1);

    const english = record.english_exam_track || {};
    for (const field of REQUIRED_ENGLISH_TRACK_FIELDS) {
      if (!(field in english)) errors.push(`${label}: english_exam_track missing field ${field}`);
    }
    if (english.review_status !== "draft") errors.push(`${label}: english_exam_track.review_status must remain draft`);
    if (english.source_status !== "bensky_review_pending") {
      errors.push(`${label}: english_exam_track.source_status must be bensky_review_pending`);
    }
    for (const field of ["properties_taste_temp"]) {
      if (!isNonEmptyString(english[field])) errors.push(`${label}: english_exam_track.${field} must be a non-empty string`);
      if (hasMojibake(english[field])) errors.push(`${label}: english_exam_track.${field} contains likely mojibake`);
    }
    for (const field of ["functions", "indications", "common_pairings", "contraindications"]) {
      if (!isArray(english[field]) || english[field].length === 0) {
        errors.push(`${label}: english_exam_track.${field} must be a non-empty array`);
      }
    }

    const chinese = record.chinese_depth_track || {};
    for (const field of REQUIRED_CHINESE_TRACK_FIELDS) {
      if (!(field in chinese)) errors.push(`${label}: chinese_depth_track missing field ${field}`);
    }
    if (chinese.review_status !== "draft") errors.push(`${label}: chinese_depth_track.review_status must remain draft`);
    if (chinese.source_status !== "cloudtcm_or_institution_review_pending") {
      errors.push(`${label}: chinese_depth_track.source_status must be cloudtcm_or_institution_review_pending`);
    }
    if (!isNonEmptyString(chinese.summary_zh)) errors.push(`${label}: chinese_depth_track.summary_zh must be a non-empty string`);
    if (hasMojibake(chinese.summary_zh)) errors.push(`${label}: chinese_depth_track.summary_zh contains likely mojibake`);
  }

  if (sourceChecked > 0) errors.push(`Staging file contains ${sourceChecked} source_checked records.`);

  const summary = {
    herbs: (data.records || []).length,
    categories: categoryCounts.size,
    relatedFormulaLinks,
    safetyFlagLinks,
    modernUseTags,
    warnings: warnings.length,
    failures: errors.length
  };

  // --json:給 check-validation-ratchet 用。這支報的 5,577 筆是同一個 schema
  // 塊(english_exam_track)在 164 張卡上缺欄位 —— 結構性積欠,不是逐張的臨床
  // 內容問題。要求它一次歸零會擋住每一次 merge,於是沒人會留著這個 gate;
  // 棘輪「不准變差」才是能一直開著的形式(2026-08-27 接線)。
  if (process.argv.includes("--json")) {
    const byCode = {};
    for (const e of errors) {
      const code = String(e).replace(/^[a-z]+\.[a-z_0-9]+: /, "").replace(/"[^"]*"/g, "X").replace(/\d+/g, "N").slice(0, 60);
      byCode[code] = (byCode[code] || 0) + 1;
    }
    console.log(JSON.stringify({ defects: errors.length, warnings: warnings.length, by_code: byCode }));
    process.exit(0);
  }

  if (warnings.length) {
    console.warn("Herb canon validation warnings:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (errors.length) {
    console.error("Herb canon validation failed.");
    for (const error of errors) console.error(`- ${error}`);
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log("Herb canon validation passed.");
  console.log(JSON.stringify(summary, null, 2));
}

main();

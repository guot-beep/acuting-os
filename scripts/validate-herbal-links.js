const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const formulas = readJson("data/herbs/formulas.json");
const safety = readJson("data/herbs/formula_safety_flags.json");
const graph = readJson("data/pathology/clinical_graph_seed.json");
const acupoints = readJson("data/acupoints/361.json");
const links = readJson("data/herbs/formula_pattern_links.json");

const formulaIds = new Set(formulas.records.map((record) => record.id));
const safetyIds = new Set(safety.flags.map((flag) => flag.id));
const patternIds = new Set(graph.tcm_patterns.map((pattern) => pattern.id));
const westernConditionIds = new Set(
  graph.western_conditions.map((condition) => condition.id)
);
const acupointCodes = new Set(acupoints.map((point) => point.code));

const failures = [];

function requireArray(record, fieldName) {
  if (!Array.isArray(record[fieldName])) {
    failures.push(`${record.formula_id || "unknown"}: ${fieldName} must be an array`);
    return [];
  }
  return record[fieldName];
}

if (!links || !Array.isArray(links.records)) {
  failures.push("data/herbs/formula_pattern_links.json must contain records[]");
}

(links.records || []).forEach((record, index) => {
  const label = record.formula_id || `record[${index}]`;

  if (!formulaIds.has(record.formula_id)) {
    failures.push(`${label}: formula_id is not present in formulas.json`);
  }

  if (record.review_status !== "draft_index") {
    failures.push(`${label}: review_status must remain draft_index until source checked`);
  }

  if (record.source_status !== "needs_professional_source_review") {
    failures.push(`${label}: source_status must be needs_professional_source_review`);
  }

  if (record.public_safe !== false) {
    failures.push(`${label}: public_safe must be false for draft relationship records`);
  }

  requireArray(record, "pattern_ids").forEach((id) => {
    if (!patternIds.has(id)) {
      failures.push(`${label}: unknown pattern id ${id}`);
    }
  });

  requireArray(record, "western_condition_ids").forEach((id) => {
    if (!westernConditionIds.has(id)) {
      failures.push(`${label}: unknown western condition id ${id}`);
    }
  });

  requireArray(record, "western_context_tags");
  requireArray(record, "fertility_workflow_links");
  requireArray(record, "soap_link_fields");

  const safetyFlags = requireArray(record, "safety_flag_ids");
  if (safetyFlags.length === 0) {
    failures.push(`${label}: safety_flag_ids must not be empty`);
  }
  safetyFlags.forEach((id) => {
    if (!safetyIds.has(id)) {
      failures.push(`${label}: unknown safety flag ${id}`);
    }
  });

  const acupointSeeds = requireArray(record, "acupoint_seed_codes");
  if (acupointSeeds.length === 0) {
    failures.push(`${label}: acupoint_seed_codes must not be empty`);
  }
  acupointSeeds.forEach((code) => {
    if (!acupointCodes.has(code)) {
      failures.push(`${label}: unknown acupoint code ${code}`);
    }
  });
});

if (failures.length > 0) {
  console.error("Herbal link validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Herbal link validation passed: ${links.records.length} draft formula relationship records.`
);

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const stagingPath = path.join(root, "data", "imports", "formula_doses", "formula_dose_staging.json");
const formulasPath = path.join(root, "data", "herbs", "formulas.json");
const herbsPath = path.join(root, "data", "herbs", "herb_canon_shortlist.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const staging = readJson(stagingPath);
const formulas = readJson(formulasPath).records || [];
const herbs = readJson(herbsPath).records || [];
const formulaIds = new Set(formulas.map((record) => record.id));
const formulasById = new Map(formulas.map((record) => [record.id, record]));
const herbIds = new Set(herbs.map((record) => record.id));
const errors = [];
const seenFormulaIds = new Set();
let componentCount = 0;
let gramReferenceCount = 0;
let pendingDoseCount = 0;
let pendingHerbIdCount = 0;
let granuleProductCount = 0;
let granuleServingCount = 0;

if (staging.status !== "staging_only") errors.push("dataset status must be staging_only");
if (staging.review_status !== "draft") errors.push("dataset review_status must remain draft");

for (const [recordIndex, record] of (staging.records || []).entries()) {
  const prefix = `records[${recordIndex}]`;
  if (!formulaIds.has(record.formula_id)) errors.push(`${prefix}.formula_id does not exist: ${record.formula_id}`);
  if (seenFormulaIds.has(record.formula_id)) errors.push(`${prefix}.formula_id is duplicated: ${record.formula_id}`);
  seenFormulaIds.add(record.formula_id);
  if (record.review_status !== "draft") errors.push(`${prefix}.review_status must remain draft`);
  if (!record.source_formula?.url || !record.source_formula?.source_formula_id) {
    errors.push(`${prefix}.source_formula requires url and source_formula_id`);
  }
  const canonicalFormula = formulasById.get(record.formula_id);
  const canonicalPinyin = new Set(
    (canonicalFormula?.composition || []).map((component) => String(component.pinyin || "").toLowerCase())
  );

  for (const [componentIndex, component] of (record.composition_doses || []).entries()) {
    const componentPrefix = `${prefix}.composition_doses[${componentIndex}]`;
    componentCount += 1;
    if (!component.pinyin || !component.name_zh || !component.dose_status) {
      errors.push(`${componentPrefix} requires pinyin, name_zh, and dose_status`);
    }
    if (canonicalFormula && !canonicalPinyin.has(String(component.pinyin || "").toLowerCase())) {
      errors.push(`${componentPrefix}.pinyin is not present in ${record.formula_id}: ${component.pinyin}`);
    }
    if (component.herb_id && !herbIds.has(component.herb_id)) {
      errors.push(`${componentPrefix}.herb_id does not exist: ${component.herb_id}`);
    }
    if (!component.herb_id) pendingHerbIdCount += 1;
    if (component.decoction_reference_g !== null) {
      if (typeof component.decoction_reference_g !== "number" || component.decoction_reference_g <= 0) {
        errors.push(`${componentPrefix}.decoction_reference_g must be a positive number or null`);
      } else {
        gramReferenceCount += 1;
      }
    } else {
      pendingDoseCount += 1;
    }
  }

  for (const [productIndex, product] of (record.granule_products || []).entries()) {
    const productPrefix = `${prefix}.granule_products[${productIndex}]`;
    granuleProductCount += 1;
    if (!product.brand || !product.product_url || !product.source_status) {
      errors.push(`${productPrefix} requires brand, product_url, and source_status`);
    }
    if (product.label_serving_g !== null) {
      granuleServingCount += 1;
      if (typeof product.label_serving_g !== "number" || product.label_serving_g <= 0) {
        errors.push(`${productPrefix}.label_serving_g must be a positive number or null`);
      }
      if (!product.label_frequency || !product.concentration_ratio) {
        errors.push(`${productPrefix} cannot state serving grams without frequency and concentration ratio evidence`);
      }
    }
  }
}

if (granuleServingCount > 0) {
  errors.push("This first staging batch must not contain granule serving grams without reviewed label evidence");
}

if (errors.length) {
  console.error("Formula dose staging validation FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Formula dose staging validation PASS");
console.log(`- formulas: ${seenFormulaIds.size}`);
console.log(`- composition rows: ${componentCount}`);
console.log(`- gram references transcribed: ${gramReferenceCount}`);
console.log(`- non-gram or missing dose rows: ${pendingDoseCount}`);
console.log(`- herb IDs pending: ${pendingHerbIdCount}`);
console.log(`- Sun Ten product records: ${granuleProductCount}`);
console.log(`- granule serving grams entered: ${granuleServingCount}`);

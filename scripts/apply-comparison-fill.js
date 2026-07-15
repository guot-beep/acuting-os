#!/usr/bin/env node
/**
 * Merge source-assisted comparison fills into data/knowledge/comparisons.json.
 *
 * Fill source: data/knowledge/comparison_fill_<batch>.json
 *
 * Default behavior is conservative:
 * - cells are filled only when the target cell is empty;
 * - metadata fields are updated only from an allowlist;
 * - unknown comparison ids, pattern ids, or dimensions stop the write.
 *
 *   node scripts/apply-comparison-fill.js pcos
 *   node scripts/apply-comparison-fill.js pcos --apply
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const batch = process.argv[2];
const APPLY = process.argv.includes("--apply");

if (!batch || batch.startsWith("--")) {
  console.error("Usage: node scripts/apply-comparison-fill.js <batch> [--apply]");
  process.exit(2);
}

const comparisonPath = path.join(ROOT, "data/knowledge/comparisons.json");
const fillPath = path.join(ROOT, `data/knowledge/comparison_fill_${batch}.json`);

const comparisons = JSON.parse(fs.readFileSync(comparisonPath, "utf8"));
const fill = JSON.parse(fs.readFileSync(fillPath, "utf8"));
const byId = new Map((comparisons.records || []).map((record) => [record.id, record]));

const metadataFields = new Set([
  "title_en",
  "seed_basis",
  "authored_by",
  "status",
  "review_status",
  "source_urls",
  "source_type",
  "last_reviewed",
  "public_safe",
  "medical_disclaimer_en",
  "notes_en"
]);

function isEmpty(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

let filledCells = 0;
let skippedCells = 0;
let updatedMetadata = 0;
const errors = [];

Object.entries(fill.fills || {}).forEach(([comparisonId, patch]) => {
  const record = byId.get(comparisonId);
  if (!record) {
    errors.push(`${comparisonId}: comparison id not found`);
    return;
  }

  Object.entries(patch.cells || {}).forEach(([patternId, cells]) => {
    if (!record.compares.includes(patternId)) {
      errors.push(`${comparisonId}.cells.${patternId}: pattern id is not in compares[]`);
      return;
    }
    if (!record.cells || !record.cells[patternId]) {
      errors.push(`${comparisonId}.cells.${patternId}: missing target cell object`);
      return;
    }

    Object.entries(cells).forEach(([dimension, value]) => {
      if (!record.dimensions.includes(dimension)) {
        errors.push(`${comparisonId}.cells.${patternId}.${dimension}: dimension not in dimensions[]`);
        return;
      }
      const current = record.cells[patternId][dimension];
      if (!isEmpty(current)) {
        skippedCells += 1;
        return;
      }
      console.log(`${APPLY ? "filled" : "would fill"} ${comparisonId}.${patternId}.${dimension}`);
      if (APPLY) record.cells[patternId][dimension] = value;
      filledCells += 1;
    });
  });

  Object.entries(patch).forEach(([field, value]) => {
    if (field === "cells") return;
    if (!metadataFields.has(field)) {
      errors.push(`${comparisonId}.${field}: metadata field is not allowed`);
      return;
    }
    console.log(`${APPLY ? "updated" : "would update"} ${comparisonId}.${field}`);
    if (APPLY) record[field] = value;
    updatedMetadata += 1;
  });
});

if (errors.length) {
  console.error("Comparison fill failed:");
  errors.forEach((error) => console.error("  " + error));
  process.exit(1);
}

console.log(`\nCells filled: ${filledCells}`);
console.log(`Cells skipped: ${skippedCells}`);
console.log(`Metadata updates: ${updatedMetadata}`);

if (APPLY) {
  fs.writeFileSync(comparisonPath, JSON.stringify(comparisons, null, 2) + "\n", "utf8");
  console.log("Written " + path.relative(ROOT, comparisonPath));
} else {
  console.log("Dry run. Use --apply to write.");
}

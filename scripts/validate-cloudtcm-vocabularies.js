#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const specs = [
  { file: "data/pathology/cloudtcm_disease_categories.json", count: 14, prefix: "cloudtcm.disease_category.", bilingual: true },
  { file: "data/pathology/cloudtcm_disease_entries.json", count: 190, prefix: "cloudtcm.disease_entry.", bilingual: true },
  { file: "data/herbs/cloudtcm_formula_function_tags.json", count: 139, prefix: "cloudtcm.formula_function.", bilingual: true },
  { file: "data/herbs/cloudtcm_formula_indication_tags.json", count: 2473, prefix: "cloudtcm.formula_indication.", bilingual: false }
];

const failures = [];
const summary = [];
const hasCjk = (value) => /[\u3400-\u9fff]/u.test(String(value || ""));

for (const spec of specs) {
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, spec.file), "utf8"));
  const records = Array.isArray(doc.records) ? doc.records : [];
  const ids = new Set();
  let bilingual = 0;
  for (const [index, record] of records.entries()) {
    const at = `${spec.file} records[${index}]`;
    if (!String(record.id || "").startsWith(spec.prefix)) failures.push(`${at}: bad id ${record.id}`);
    if (ids.has(record.id)) failures.push(`${at}: duplicate id ${record.id}`);
    ids.add(record.id);
    if (!Number.isInteger(record.source_id) || record.source_id <= 0) failures.push(`${at}: invalid source_id`);
    if (!hasCjk(record.name_zh)) failures.push(`${at}: name_zh lacks CJK`);
    if (!/^https:\/\/cloudtcm\.com\//.test(record.source_url || "")) failures.push(`${at}: non-direct source_url`);
    if (record.name_en) bilingual += 1;
    if (spec.bilingual && (!record.name_en || record.translation_status !== "curated_draft")) failures.push(`${at}: curated bilingual label required`);
    if (!spec.bilingual && record.name_en && record.translation_status !== "curated_draft") failures.push(`${at}: translated indication must be curated_draft`);
    if (!spec.bilingual && !record.name_en && record.translation_status !== "pending_professional_translation") failures.push(`${at}: pending translation must be explicit`);
  }
  if (records.length !== spec.count) failures.push(`${spec.file}: expected ${spec.count}, found ${records.length}`);
  if (doc.count !== spec.count) failures.push(`${spec.file}: metadata count mismatch`);
  if (doc.bilingual_complete != null && doc.bilingual_complete !== bilingual) failures.push(`${spec.file}: bilingual_complete mismatch`);
  summary.push({ file: spec.file, records: records.length, unique_ids: ids.size, bilingual, pending: records.length - bilingual });
}

const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "data/pathology/cloudtcm_disease_categories.json"), "utf8"));
const entries = JSON.parse(fs.readFileSync(path.join(ROOT, "data/pathology/cloudtcm_disease_entries.json"), "utf8"));
const categoryIds = new Set(categories.records.map((record) => record.id));
if (entries.source_row_count !== 205) failures.push(`disease entries: expected 205 source rows, found ${entries.source_row_count}`);
for (const record of entries.records) {
  if (!record.category_ids?.length) failures.push(`${record.id}: missing category_ids`);
  for (const id of record.category_ids || []) {
    if (!categoryIds.has(id)) failures.push(`${record.id}: unknown category ${id}`);
  }
  if (record.source_url !== `https://cloudtcm.com/disease/tcm/${record.source_id}`) failures.push(`${record.id}: source URL does not match source_id`);
  if (record.image_url && !/^https:\/\/(media\.cloudtcm\.uk\/(?:disease|postimg)\/|cloudtcm-assets\.s3\.amazonaws\.com\/disease\/)/.test(record.image_url)) {
    failures.push(`${record.id}: unexpected image host`);
  }
}

if (failures.length) {
  console.error("CloudTCM vocabulary validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("CloudTCM vocabulary validation passed.");
console.log(JSON.stringify(summary, null, 2));

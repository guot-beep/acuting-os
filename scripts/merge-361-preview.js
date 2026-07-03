#!/usr/bin/env node
/**
 * merge-361-preview.js
 *
 * Builds a reviewable preview for merging embedded app acupoint records into
 * data/acupoints/361.json. By default this script does not overwrite 361.json.
 *
 * Usage:
 *   node scripts/merge-361-preview.js
 *   node scripts/merge-361-preview.js --apply-approved
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANONICAL_PATH = path.join(ROOT, "data/acupoints/361.json");
const PREVIEW_PATH = path.join(ROOT, "docs/361_MERGE_PREVIEW.json");
const SUMMARY_PATH = path.join(ROOT, "docs/361_MERGE_DIFF_SUMMARY.md");

const STANDARD_PREFIXES = new Set(["LU", "LI", "ST", "SP", "HT", "SI", "BL", "KI", "PC", "TE", "GB", "LR", "CV", "GV"]);
const EMBEDDED_SOURCES = [
  "data/acupoints/embedded/starter_points.json",
  "data/acupoints/embedded/professional_points.json",
  "data/acupoints/embedded/meridian_lu.json",
  "data/acupoints/embedded/meridian_li.json",
  "data/acupoints/embedded/meridian_st.json",
  "data/acupoints/embedded/meridian_sp.json",
  "data/acupoints/embedded/meridian_ht.json",
  "data/acupoints/embedded/meridian_si.json",
  "data/acupoints/embedded/meridian_bl.json",
  "data/acupoints/embedded/meridian_ki.json",
];

function readJson(relOrAbs) {
  const file = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function mergeByCode(groups) {
  return groups.flat().reduce((merged, point) => {
    const index = merged.findIndex((item) => item.code === point.code);
    if (index >= 0) merged[index] = { ...merged[index], ...point };
    else merged.push(point);
    return merged;
  }, []);
}

function prefixFor(code) {
  return String(code || "").match(/^[A-Z]+/)?.[0] || "";
}

function isStandardCode(code) {
  return STANDARD_PREFIXES.has(prefixFor(code));
}

function asArray(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.filter((item) => item != null && item !== "");
  return [value];
}

function isNonEmpty(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function isPlaceholderMojibake(value) {
  if (!isNonEmpty(value)) return false;
  if (typeof value === "string") return /^[?\s,.;:()[\]{}'"，。；：、（）「」『』]+$/.test(value);
  if (Array.isArray(value)) return value.length > 0 && value.every(isPlaceholderMojibake);
  return false;
}

function stable(value) {
  return JSON.stringify(value);
}

function splitMeridian(display) {
  const [en = "", zh = ""] = String(display || "").split("/").map((part) => part.trim());
  return { channel_en: en, channel_zh: zh };
}

function mapEmbeddedToCanonical(point) {
  const channel = splitMeridian(point.meridian);
  const mapped = {
    code: point.code,
    chinese: point.nameZh,
    pinyin: point.pinyin,
    english: point.nameEn,
    channel_zh: channel.channel_zh,
    channel_en: channel.channel_en,
    meridian_display: point.meridian,
    region: point.region,
    location_zh: point.location,
    location_en: point.locationEn,
    cun_measurement: point.cunMeasurement,
    functions_zh: asArray(point.functions),
    functions_en: asArray(point.functionsEn),
    indications_zh: asArray(point.patterns),
    indications_en: asArray(point.patternsEn),
    anatomy_terms: asArray(point.anatomy),
    evidence: point.evidence,
    contraindications: asArray(point.cautions),
    cautions: asArray(point.cautions),
    sources: asArray(point.sources),
    visual_links: asArray(point.visualLinks),
    review_status: point.reviewStatus,
  };

  if (point.x != null || point.y != null) {
    mapped.ui_map = {};
    if (point.x != null) mapped.ui_map.x = point.x;
    if (point.y != null) mapped.ui_map.y = point.y;
  }

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => isNonEmpty(value))
  );
}

function canonicalDefaults() {
  return {
    muscles: [],
    bones: [],
    nerves: [],
    vessels: [],
    contraindications: [],
    needling: "",
    danger: [],
    nccaom_high_yield: [],
    clinical_pearls: [],
    sources: [],
  };
}

function addCount(map, key) {
  map[key] = (map[key] || 0) + 1;
}

function mergeRecord(existing, incoming, stats, code) {
  const out = { ...existing };
  for (const [field, value] of Object.entries(incoming)) {
    if (field === "code" || !isNonEmpty(value)) continue;
    if (!isNonEmpty(out[field])) {
      out[field] = value;
      addCount(stats.filledFields, field);
    } else if (isPlaceholderMojibake(out[field])) {
      out[field] = value;
      addCount(stats.repairedPlaceholderFields, field);
    } else if (stable(out[field]) !== stable(value)) {
      stats.overwriteCandidates.push({
        code,
        field,
        canonical: out[field],
        embedded: value,
      });
    } else {
      addCount(stats.sameFields, field);
    }
  }
  return out;
}

function assertNoDuplicateCodes(records, label) {
  const seen = new Set();
  const duplicates = new Set();
  for (const record of records) {
    if (seen.has(record.code)) duplicates.add(record.code);
    seen.add(record.code);
  }
  if (duplicates.size) {
    throw new Error(`${label} has duplicate codes: ${[...duplicates].join(", ")}`);
  }
}

function formatList(items) {
  return items.length ? items.join(", ") : "(none)";
}

function sortedFieldCounts(counts) {
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
}

function buildSummary(stats, applied = false) {
  const overwriteByField = {};
  for (const item of stats.overwriteCandidates) addCount(overwriteByField, item.field);
  const sampleOverwrites = stats.overwriteCandidates.slice(0, 40);
  const statusLine = applied
    ? "APPROVED AND APPLIED. Ting approved the preview, and `data/acupoints/361.json` has been overwritten with this merge result."
    : "PREVIEW ONLY. `data/acupoints/361.json` has not been overwritten.";
  const approvalSection = applied
    ? `## Approval Result

Approved by Ting and applied with:

\`\`\`powershell
node scripts/merge-361-preview.js --apply-approved
\`\`\`
`
    : `## Approval Point

Pause here. Ting must approve before running:

\`\`\`powershell
node scripts/merge-361-preview.js --apply-approved
\`\`\`
`;

  return `# 361 Merge Diff Summary

Generated: ${new Date().toISOString()}

Status: ${statusLine}

## Counts

| Item | Count |
|---|---:|
| Existing 361 records | ${stats.existingCount} |
| Embedded unique records | ${stats.embeddedUniqueCount} |
| Embedded standard-channel records | ${stats.embeddedStandardCount} |
| Preview 361 records | ${stats.previewCount} |
| Added records | ${stats.addedCodes.length} |
| Removed records | ${stats.removedCodes.length} |
| Duplicate preview codes | ${stats.duplicatePreviewCodes.length} |
| Placeholder fields repaired | ${Object.values(stats.repairedPlaceholderFields).reduce((sum, count) => sum + count, 0)} |
| Non-empty overwrite candidates not applied | ${stats.overwriteCandidates.length} |

## Added Codes

${formatList(stats.addedCodes)}

## Removed Codes

${formatList(stats.removedCodes)}

## Fields Filled From Embedded Data

| Field | Count |
|---|---:|
${sortedFieldCounts(stats.filledFields).map(([field, count]) => `| \`${field}\` | ${count} |`).join("\n")}

## Placeholder Fields Repaired From Embedded Data

These were existing canonical values made only of question-mark placeholders, so the preview treats them as damaged/empty instead of preserving them.

| Field | Count |
|---|---:|
${sortedFieldCounts(stats.repairedPlaceholderFields).map(([field, count]) => `| \`${field}\` | ${count} |`).join("\n")}

## Non-Empty Overwrite Candidates Not Applied

These are places where both \`361.json\` and embedded data have a value, but the values differ. The preview preserves the existing canonical value.

| Field | Count |
|---|---:|
${sortedFieldCounts(overwriteByField).map(([field, count]) => `| \`${field}\` | ${count} |`).join("\n")}

## Overwrite Candidate Samples

| Code | Field | Canonical | Embedded |
|---|---|---|---|
${sampleOverwrites.map((item) => `| ${item.code} | \`${item.field}\` | ${JSON.stringify(item.canonical)} | ${JSON.stringify(item.embedded)} |`).join("\n")}

## Validation Gates

- Expected preview count: 235 standard-channel records.
- Expected added codes from this run: ${formatList(stats.addedCodes)}.
- Expected removed codes: none.
- Expected duplicate preview codes: none.
- Required after approval before overwrite: \`node scripts/validate-data.js\` and \`node scripts/validate-interactions.js\`.

${approvalSection}
`;
}

function main() {
  const applyApproved = process.argv.includes("--apply-approved");
  const canonical = readJson(CANONICAL_PATH);
  const embeddedGroups = EMBEDDED_SOURCES.map(readJson);
  const embeddedMerged = mergeByCode(embeddedGroups);
  const embeddedStandard = embeddedMerged.filter((point) => isStandardCode(point.code));

  assertNoDuplicateCodes(canonical, "data/acupoints/361.json");
  assertNoDuplicateCodes(embeddedStandard, "embedded standard preview");

  const canonicalByCode = new Map(canonical.map((record) => [record.code, record]));
  const embeddedByCode = new Map(embeddedStandard.map((record) => [record.code, record]));
  const stats = {
    existingCount: canonical.length,
    embeddedUniqueCount: embeddedMerged.length,
    embeddedStandardCount: embeddedStandard.length,
    previewCount: 0,
    addedCodes: [],
    removedCodes: [],
    duplicatePreviewCodes: [],
    filledFields: {},
    repairedPlaceholderFields: {},
    sameFields: {},
    overwriteCandidates: [],
  };

  const preview = canonical.map((record) => {
    const embedded = embeddedByCode.get(record.code);
    if (!embedded) return record;
    return mergeRecord(record, mapEmbeddedToCanonical(embedded), stats, record.code);
  });

  for (const point of embeddedStandard) {
    if (canonicalByCode.has(point.code)) continue;
    stats.addedCodes.push(point.code);
    preview.push({ ...canonicalDefaults(), ...mapEmbeddedToCanonical(point) });
  }

  const previewCodes = preview.map((record) => record.code);
  const previewSet = new Set();
  stats.duplicatePreviewCodes = [...new Set(previewCodes.filter((code) => {
    if (previewSet.has(code)) return true;
    previewSet.add(code);
    return false;
  }))];
  stats.removedCodes = canonical
    .map((record) => record.code)
    .filter((code) => !previewCodes.includes(code));
  stats.previewCount = preview.length;

  writeJson(PREVIEW_PATH, preview);
  fs.writeFileSync(SUMMARY_PATH, buildSummary(stats, applyApproved));

  if (applyApproved) {
    writeJson(CANONICAL_PATH, preview);
    console.log("Applied approved merge to data/acupoints/361.json");
  } else {
    console.log("Wrote docs/361_MERGE_PREVIEW.json");
    console.log("Wrote docs/361_MERGE_DIFF_SUMMARY.md");
    console.log("Preview only. data/acupoints/361.json was not overwritten.");
  }

  console.log(JSON.stringify({
    existing: stats.existingCount,
    embedded_unique: stats.embeddedUniqueCount,
    embedded_standard: stats.embeddedStandardCount,
    preview: stats.previewCount,
    added: stats.addedCodes.length,
    removed: stats.removedCodes.length,
    duplicate_preview_codes: stats.duplicatePreviewCodes.length,
    overwrite_candidates_not_applied: stats.overwriteCandidates.length,
  }, null, 2));
}

main();

#!/usr/bin/env node
/**
 * Analyze D3 CloudTCM preview diffs into human-review documents.
 * Read-only against data; writes docs only. Does not apply any merge.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PREVIEW_FILE = path.join(ROOT, "docs", "CLOUDTCM_MERGE_PREVIEW.json");
const STRATEGY_FILE = path.join(ROOT, "docs", "CLOUDTCM_REVIEW_STRATEGY.md");
const HIGH_RISK_FILE = path.join(ROOT, "docs", "CLOUDTCM_HIGH_RISK_DIFFS.md");

const preview = JSON.parse(fs.readFileSync(PREVIEW_FILE, "utf8"));
const differs = preview.differs || [];

const riskKeywords = [
  "氣胸", "肺", "眼球", "眼眶", "延髓", "頸動脈", "頸靜脈", "動脈", "神經",
  "孕", "禁", "不可", "深刺", "出血", "膀胱", "腎", "腹腔", "腹膜", "胸腔"
];

const directionTerms = ["直刺", "斜刺", "平刺", "橫刺", "淺刺", "點刺", "向外", "向內", "向上", "向下"];

function norm(s) {
  return String(s || "").replace(/&mdash;/g, "-").replace(/\s+/g, "");
}

function nums(s) {
  return [...norm(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
}

function terms(s, list) {
  const text = norm(s);
  return list.filter((term) => text.includes(term));
}

function sameArray(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function classifyNeedling(d) {
  const current = norm(d.current);
  const cloud = norm(d.cloudtcm);
  const currentNums = nums(current);
  const cloudNums = nums(cloud);
  const currentDirections = terms(current, directionTerms);
  const cloudDirections = terms(cloud, directionTerms);
  const currentRisks = terms(current, riskKeywords);
  const cloudRisks = terms(cloud, riskKeywords);
  const reasons = [];

  if (!sameArray(currentNums, cloudNums)) reasons.push(`depth/number differs: current ${currentNums.join(",") || "-"} vs CloudTCM ${cloudNums.join(",") || "-"}`);
  if (!sameArray(currentDirections, cloudDirections)) reasons.push(`direction differs: current ${currentDirections.join(",") || "-"} vs CloudTCM ${cloudDirections.join(",") || "-"}`);
  const missingCurrentRisks = cloudRisks.filter((term) => !currentRisks.includes(term));
  const missingCloudRisks = currentRisks.filter((term) => !cloudRisks.includes(term));
  if (missingCurrentRisks.length) reasons.push(`CloudTCM has safety terms not in current: ${missingCurrentRisks.join(",")}`);
  if (missingCloudRisks.length) reasons.push(`current has safety terms not in CloudTCM: ${missingCloudRisks.join(",")}`);
  return reasons;
}

function classifyLocation(d) {
  const currentNums = nums(d.current);
  const cloudNums = nums(d.cloudtcm);
  const reasons = [];
  if (!sameArray(currentNums, cloudNums)) reasons.push(`location number differs: current ${currentNums.join(",") || "-"} vs CloudTCM ${cloudNums.join(",") || "-"}`);
  const current = norm(d.current);
  const cloud = norm(d.cloudtcm);
  const anatomyTerms = ["胸椎", "腰椎", "骶", "肋間", "旁開", "髮際", "臍", "腕", "踝", "膝", "眼", "耳", "鼻"];
  const currentTerms = terms(current, anatomyTerms);
  const cloudTerms = terms(cloud, anatomyTerms);
  const cloudOnly = cloudTerms.filter((term) => !currentTerms.includes(term));
  if (cloudOnly.length) reasons.push(`CloudTCM adds anatomy landmarks: ${cloudOnly.join(",")}`);
  return reasons;
}

function bucketDiff(d) {
  if (d.field === "needling") {
    const reasons = classifyNeedling(d);
    if (reasons.length) return { level: "high", reasons };
    return { level: "low", reasons: ["wording differs only after simple checks"] };
  }
  if (d.field === "location_zh") {
    const reasons = classifyLocation(d);
    if (reasons.some((r) => r.startsWith("location number differs"))) return { level: "high", reasons };
    if (reasons.length) return { level: "medium", reasons };
    return { level: "low", reasons: ["wording differs only after simple checks"] };
  }
  if (d.field === "contraindications") {
    const currentRisks = terms(d.current, riskKeywords);
    const cloudRisks = terms(d.cloudtcm, riskKeywords);
    const reasons = [];
    if (!sameArray(currentRisks, cloudRisks)) reasons.push(`safety wording differs: current ${currentRisks.join(",") || "-"} vs CloudTCM ${cloudRisks.join(",") || "-"}`);
    return { level: reasons.length ? "high" : "medium", reasons: reasons.length ? reasons : ["contraindication prose differs"] };
  }
  return { level: "reference", reasons: ["functions/indications prose differs; keep as reference-only until human review"] };
}

const reviewed = differs.map((d) => ({ ...d, review: bucketDiff(d) }));
const byLevel = reviewed.reduce((acc, item) => {
  acc[item.review.level] = (acc[item.review.level] || 0) + 1;
  return acc;
}, {});
const byFieldLevel = reviewed.reduce((acc, item) => {
  acc[item.field] = acc[item.field] || {};
  acc[item.field][item.review.level] = (acc[item.field][item.review.level] || 0) + 1;
  return acc;
}, {});

function mdTableCounts() {
  return Object.entries(preview.counts)
    .map(([field, c]) => `| ${field} | ${c.fill} | ${c.match} | ${c.differ} | ${c.staging_empty} |`)
    .join("\n");
}

function sampleItems(filter, limit = 25) {
  return reviewed
    .filter(filter)
    .slice(0, limit)
    .map((d) => [
      `### ${d.code} - ${d.field}`,
      ``,
      `Risk: ${d.review.level}`,
      ``,
      `Reasons:`,
      ...d.review.reasons.map((r) => `- ${r}`),
      ``,
      `Current:`,
      `> ${d.current.slice(0, 420)}`,
      ``,
      `CloudTCM:`,
      `> ${d.cloudtcm.slice(0, 420)}`,
      ``
    ].join("\n"))
    .join("\n");
}

const strategy = `# CloudTCM D3 Review Strategy

Generated: ${new Date().toISOString()}

## Current Gate Decision

Do not run \`--apply-approved\` yet.

Reason: the D3 preview has no fill candidates. \`FILL = 0\` for every mapped field, so applying now would write nothing useful. The work is now a review/classification task, not a merge task.

## Preview Counts

| canonical field | FILL | MATCH | DIFFER | staging empty |
|---|---:|---:|---:|---:|
${mdTableCounts()}

## Interpretation

- \`location_zh\`: 360 differs. Most are likely wording/detail differences, but numeric landmark differences must be reviewed first.
- \`needling\`: 354 differs. This is the highest safety priority. Review direction, depth, organ-risk language, eye/neck/chest warnings, pregnancy cautions, and bleeding cautions.
- \`functions_zh\` and \`indications_zh\`: 348 differs each. Treat CloudTCM as reference-only. Do not overwrite canonical prose in bulk.
- \`contraindications\`: only 44 CloudTCM records have caution text; review as a safety supplement, not as a replacement.

## Automated Triage Summary

By risk level:

${Object.entries(byLevel).sort().map(([level, count]) => `- ${level}: ${count}`).join("\n")}

By field and risk level:

${Object.entries(byFieldLevel).map(([field, levels]) => `- ${field}: ${Object.entries(levels).map(([level, count]) => `${level} ${count}`).join(", ")}`).join("\n")}

## Recommended Review Order

1. Needling high-risk differences.
2. Location numeric differences.
3. Contraindication differences.
4. Function/indication differences as draft reference only.

## Approval Recommendation

Do not approve bulk apply. Instead, create smaller source-review batches, such as:

- Batch A: eye/neck/chest/abdomen safety points.
- Batch B: BL back-shu location and needling review.
- Batch C: commonly searched points such as LI4, ST36, SP6, PC6, LR3, CV12, CV17, GV20.

Each approved batch should produce a small patch or fill plan with explicit human-reviewed decisions.
`;

const highRisk = `# CloudTCM High-Risk Diffs

Generated: ${new Date().toISOString()}

This file is a triage aid. It does not decide which source is correct. It highlights records where numeric landmarks, needling depth/direction, or safety wording differ.

## Summary

- Total DIFFER records: ${differs.length}
- High-risk triage items: ${reviewed.filter((d) => d.review.level === "high").length}
- Medium-risk triage items: ${reviewed.filter((d) => d.review.level === "medium").length}
- Reference-only prose differences: ${reviewed.filter((d) => d.review.level === "reference").length}

## Needling High-Risk Sample

${sampleItems((d) => d.field === "needling" && d.review.level === "high", 30) || "(none)"}

## Location High-Risk Sample

${sampleItems((d) => d.field === "location_zh" && d.review.level === "high", 30) || "(none)"}

## Contraindication High-Risk Sample

${sampleItems((d) => d.field === "contraindications" && d.review.level === "high", 30) || "(none)"}
`;

fs.writeFileSync(STRATEGY_FILE, strategy, "utf8");
fs.writeFileSync(HIGH_RISK_FILE, highRisk, "utf8");

console.log(JSON.stringify({
  wrote: [path.relative(ROOT, STRATEGY_FILE), path.relative(ROOT, HIGH_RISK_FILE)],
  byLevel,
  byFieldLevel
}, null, 2));

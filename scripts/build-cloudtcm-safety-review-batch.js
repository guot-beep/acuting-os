#!/usr/bin/env node
/**
 * Build Batch A safety review worksheet from CloudTCM D3 preview.
 * Read-only against canonical data. Writes review docs only.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PREVIEW_FILE = path.join(ROOT, "docs", "CLOUDTCM_MERGE_PREVIEW.json");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const OUT_JSON = path.join(ROOT, "docs", "CLOUDTCM_REVIEW_BATCH_A_SAFETY.json");
const OUT_MD = path.join(ROOT, "docs", "CLOUDTCM_REVIEW_BATCH_A_SAFETY.md");
const OUT_CRITICAL_JSON = path.join(ROOT, "docs", "CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.json");
const OUT_CRITICAL_MD = path.join(ROOT, "docs", "CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.md");

const preview = JSON.parse(fs.readFileSync(PREVIEW_FILE, "utf8"));
const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const byCode = new Map(db.map((point) => [point.code, point]));

const SAFETY_TERMS = [
  "眼", "眶", "頸", "延髓", "胸", "肺", "氣胸", "腹", "腹腔", "腹膜",
  "孕", "膀胱", "腎", "動脈", "靜脈", "神經", "出血", "禁", "不可",
  "深刺", "強刺激", "直腸", "耳", "面"
];

const REGION_RULES = [
  { region: "eye-face", pattern: /^(BL1|BL2|ST1|ST2|GB1|TE23|SI18|LI20|GV26)$/ },
  { region: "neck-head-risk", pattern: /^(BL10|GB20|GV15|GV16|SI16|SI17|TE16|TE17)$/ },
  { region: "chest-back-pneumothorax", pattern: /^(LU1|LU2|CV17|CV18|CV19|CV20|CV21|GB21|GB22|GB23|GB24|LR14|SP17|SP18|SP19|SP20|SP21|KI22|KI23|KI24|KI25|KI26|KI27|BL1[1-9]|BL2[0-2]|BL4[1-9])$/ },
  { region: "abdomen-pregnancy-organ-depth", pattern: /^(CV[2-9]|CV1[0-6]|ST2[5-9]|ST30|SP1[2-6]|KI1[1-9]|KI20|KI21|LR13|GB2[5-8])$/ },
  { region: "pregnancy-caution-common", pattern: /^(LI4|SP6|GB21|BL60|BL67|CV3|CV4|ST25)$/ }
];

function regionFor(code) {
  return REGION_RULES.filter((rule) => rule.pattern.test(code)).map((rule) => rule.region);
}

function includesSafetyText(item) {
  const text = `${item.current || ""}\n${item.cloudtcm || ""}`;
  return SAFETY_TERMS.some((term) => text.includes(term));
}

function numbers(text) {
  return [...String(text || "").matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
}

function directions(text) {
  const terms = ["直刺", "斜刺", "平刺", "橫刺", "淺刺", "點刺", "向外", "向內", "向上", "向下"];
  return terms.filter((term) => String(text || "").includes(term));
}

function safetyFlags(item) {
  const flags = [];
  const currentNums = numbers(item.current);
  const cloudNums = numbers(item.cloudtcm);
  const currentDirs = directions(item.current);
  const cloudDirs = directions(item.cloudtcm);
  if (item.field === "needling" && currentNums.join("|") !== cloudNums.join("|")) flags.push("depth_diff");
  if (item.field === "needling" && currentDirs.join("|") !== cloudDirs.join("|")) flags.push("direction_diff");
  for (const term of SAFETY_TERMS) {
    const inCurrent = String(item.current || "").includes(term);
    const inCloud = String(item.cloudtcm || "").includes(term);
    if (inCurrent !== inCloud) flags.push(`safety_term_diff:${term}`);
  }
  return [...new Set(flags)];
}

const safetyItems = (preview.differs || [])
  .filter((item) => ["needling", "contraindications", "location_zh"].includes(item.field))
  .map((item) => {
    const regions = regionFor(item.code);
    const flags = safetyFlags(item);
    return {
      ...item,
      chinese: byCode.get(item.code)?.chinese || "",
      regions,
      safety_flags: flags,
      include: regions.length > 0 || flags.length > 0 || includesSafetyText(item)
    };
  })
  .filter((item) => item.include);

const byCodeGrouped = new Map();
for (const item of safetyItems) {
  if (!byCodeGrouped.has(item.code)) {
    byCodeGrouped.set(item.code, {
      code: item.code,
      chinese: item.chinese,
      regions: item.regions,
      fields: []
    });
  }
  const group = byCodeGrouped.get(item.code);
  group.regions = [...new Set([...group.regions, ...item.regions])];
  group.fields.push({
    field: item.field,
    safety_flags: item.safety_flags,
    current: item.current,
    cloudtcm: item.cloudtcm
  });
}

const grouped = [...byCodeGrouped.values()].sort((a, b) => {
  const score = (x) => x.fields.reduce((sum, f) => sum + f.safety_flags.length, 0) + x.fields.length;
  return score(b) - score(a) || a.code.localeCompare(b.code);
});

const output = {
  generated: new Date().toISOString(),
  policy: "Review worksheet only. Do not bulk apply. CloudTCM remains private study staging; decisions require human/source review.",
  total_items: safetyItems.length,
  total_codes: grouped.length,
  groups: grouped
};

function clip(text, n = 180) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  return s.length > n ? `${s.slice(0, n)}...` : s;
}

function fieldSummary(fields) {
  return fields.map((field) => `${field.field} (${field.safety_flags.slice(0, 3).join(", ") || "wording"})`).join("; ");
}

const regionCounts = {};
for (const group of grouped) {
  for (const region of group.regions.length ? group.regions : ["keyword-only"]) {
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  }
}

const topRows = grouped.slice(0, 40).map((group) => {
  const first = group.fields[0];
  return `| ${group.code} | ${group.chinese} | ${group.regions.join(", ") || "keyword-only"} | ${fieldSummary(group.fields)} | ${clip(first.current, 90)} | ${clip(first.cloudtcm, 90)} |`;
}).join("\n");

const allCodes = grouped.map((group) => `\`${group.code}\``).join(", ");

const markdown = `# CloudTCM Review Batch A - Safety Worksheet

Generated: ${output.generated}

This is a review worksheet only. It does not decide which source is correct and does not approve any merge.

## Scope

Batch A focuses on safety-sensitive differences from the D3 preview:

- eye / face points,
- neck and medulla-adjacent points,
- chest, back, and pneumothorax-risk points,
- abdomen, pregnancy, bladder, kidney, organ-depth caution points,
- other needling or contraindication differences that contain safety terms.

## Summary

- Safety-related diff items: ${output.total_items}
- Unique point codes: ${output.total_codes}
- Canonical data changed: no
- Merge/apply approved: no

## Region Counts

${Object.entries(regionCounts).sort().map(([region, count]) => `- ${region}: ${count}`).join("\n")}

## Reviewer Rule

For each point, choose one decision:

- Keep current canonical text.
- Keep current text but add a source-review note later.
- Rewrite a concise canonical sentence after checking WHO SAPL / approved source.
- Use CloudTCM only as private draft reference.

Do not bulk copy CloudTCM prose into canonical 361 data.

## Top Safety Review Rows

| code | zh | region | fields / flags | current sample | CloudTCM sample |
|---|---|---|---|---|---|
${topRows}

## Full Code List

${allCodes}

Full machine-readable worksheet: docs/CLOUDTCM_REVIEW_BATCH_A_SAFETY.json
`;

fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
fs.writeFileSync(OUT_MD, markdown, "utf8");

const criticalGroups = grouped.filter((group) => group.regions.length > 0);
const criticalRows = criticalGroups.map((group) => {
  const first = group.fields[0];
  return `| ${group.code} | ${group.chinese} | ${group.regions.join(", ")} | ${fieldSummary(group.fields)} | ${clip(first.current, 90)} | ${clip(first.cloudtcm, 90)} |`;
}).join("\n");

const criticalOutput = {
  generated: new Date().toISOString(),
  policy: "Critical safety subset only. Review worksheet; no merge approval.",
  total_codes: criticalGroups.length,
  groups: criticalGroups
};

const criticalMarkdown = `# CloudTCM Review Batch A1 - Critical Safety Subset

Generated: ${criticalOutput.generated}

This is the smaller first-pass safety worksheet. It excludes broad keyword-only matches and keeps only points that belong to explicit high-risk regions.

## Scope

- eye / face
- neck / medulla-adjacent
- chest / back / pneumothorax risk
- abdomen / pregnancy / bladder / kidney / organ-depth caution
- common pregnancy caution points

## Summary

- Unique point codes: ${criticalOutput.total_codes}
- Canonical data changed: no
- Merge/apply approved: no

## Review Table

| code | zh | region | fields / flags | current sample | CloudTCM sample |
|---|---|---|---|---|---|
${criticalRows}

## Recommended First Review Order

1. Eye/face: BL1, BL2, ST1, ST2, GB1, TE23, SI18, LI20, GV26.
2. Neck/head risk: BL10, GB20, GV15, GV16, SI16, SI17, TE16, TE17.
3. Chest/back/pneumothorax: LU1, LU2, CV17-CV21, GB21-GB24, LR14, SP17-SP21, KI22-KI27, BL11-BL22, BL41-BL49.
4. Abdomen/pregnancy/organ depth: CV2-CV16, ST25-ST30, SP12-SP16, KI11-KI21, LR13, GB25-GB28, LI4, SP6, BL60, BL67.

Full machine-readable worksheet: docs/CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.json
`;

fs.writeFileSync(OUT_CRITICAL_JSON, JSON.stringify(criticalOutput, null, 2), "utf8");
fs.writeFileSync(OUT_CRITICAL_MD, criticalMarkdown, "utf8");

console.log(JSON.stringify({
  wrote: [
    path.relative(ROOT, OUT_MD),
    path.relative(ROOT, OUT_JSON),
    path.relative(ROOT, OUT_CRITICAL_MD),
    path.relative(ROOT, OUT_CRITICAL_JSON)
  ],
  safety_items: output.total_items,
  unique_codes: output.total_codes,
  critical_unique_codes: criticalOutput.total_codes,
  region_counts: regionCounts
}, null, 2));

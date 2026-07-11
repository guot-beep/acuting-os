#!/usr/bin/env node
/**
 * Report canonical 361 strings that look like irreversible "????" encoding loss.
 * Read-only against data; writes a review finding doc.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const STAGING_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "staging_points.json");
const OUT_FILE = path.join(ROOT, "docs", "CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md");

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const staging = fs.existsSync(STAGING_FILE)
  ? JSON.parse(fs.readFileSync(STAGING_FILE, "utf8")).records || []
  : [];
const stagingByCode = new Map(staging.map((record) => [record.code, record]));

const findings = [];
for (const point of db) {
  for (const [field, value] of Object.entries(point)) {
    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) {
      if (typeof entry === "string" && /\?{3,}/.test(entry)) {
        const staged = stagingByCode.get(point.code) || {};
        findings.push({
          code: point.code,
          chinese: point.chinese || "",
          field,
          value: entry,
          cloudtcm_location_zh: staged.location_zh || "",
          cloudtcm_technique_zh: staged.technique_zh || "",
          cloudtcm_description_zh: staged.description_zh || "",
          source_url: staged.source_url || ""
        });
      }
    }
  }
}

const rows = findings.map((item) => `| ${item.code} | ${item.chinese} | ${item.field} | ${item.value.replace(/\|/g, "\\|")} | ${item.source_url || "-"} |`).join("\n");

const details = findings.map((item) => `## ${item.code} ${item.chinese} - ${item.field}

Current damaged value:

> ${item.value}

CloudTCM staging reference:

- source: ${item.source_url || "-"}
- location_zh: ${item.cloudtcm_location_zh || "-"}
- technique_zh: ${item.cloudtcm_technique_zh ? item.cloudtcm_technique_zh.slice(0, 300) : "-"}
- description_zh: ${item.cloudtcm_description_zh ? item.cloudtcm_description_zh.slice(0, 300) : "-"}
`).join("\n");

const md = `# CloudTCM / 361 Canonical Encoding Findings

Generated: ${new Date().toISOString()}

This is a finding document only. It does not modify canonical data.

## Summary

- Damaged string fields found in \`data/acupoints/361.json\`: ${findings.length}
- Affected point codes: ${[...new Set(findings.map((f) => f.code))].join(", ") || "none"}
- Pattern: strings containing three or more literal question marks, suggesting prior encoding loss.

## Recommendation

Do not bulk apply CloudTCM. However, these damaged fields should be handled before source review because the current canonical value is not readable.

Recommended next step:

1. Create a tiny gated repair batch for BL61-BL67 damaged fields only.
2. Use CloudTCM staging only as one reference source.
3. Prefer concise rewritten canonical text over direct bulk copied prose.
4. Run validators and encoding check afterward.

## Findings Table

| code | zh | field | damaged value | CloudTCM source |
|---|---|---|---|---|
${rows || "| - | - | - | - | - |"}

${details}
`;

fs.writeFileSync(OUT_FILE, md, "utf8");
console.log(JSON.stringify({
  wrote: path.relative(ROOT, OUT_FILE),
  damaged_fields: findings.length,
  affected_codes: [...new Set(findings.map((f) => f.code))]
}, null, 2));

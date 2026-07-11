#!/usr/bin/env node
/**
 * Build a gated repair preview for BL61-BL67 canonical "????" fields.
 * Does not modify data/acupoints/361.json.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const STAGING_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "staging_points.json");
const OUT_JSON = path.join(ROOT, "docs", "BL61_BL67_ENCODING_REPAIR_PREVIEW.json");
const OUT_MD = path.join(ROOT, "docs", "BL61_BL67_ENCODING_REPAIR_PREVIEW.md");

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const staging = JSON.parse(fs.readFileSync(STAGING_FILE, "utf8")).records || [];
const stagingByCode = new Map(staging.map((record) => [record.code, record]));

const SAFE_REPAIR_CANDIDATES = {
  BL61: {
    location_zh: "足外側，外踝後下方，崑崙（BL60）直下 2 寸，跟部外側赤白肉際處。"
  },
  BL67: {
    location_zh: "足小趾末節外側，距趾甲角 0.1 寸處。",
    contraindications: [
      "孕期慎用或禁用強刺激；胎位調整相關用法需由受訓專業人員評估。"
    ]
  }
};

function hasDamage(value) {
  if (Array.isArray(value)) return value.some(hasDamage);
  return typeof value === "string" && /\?{3,}/.test(value);
}

const codes = ["BL61", "BL62", "BL63", "BL64", "BL65", "BL66", "BL67"];
const records = [];

for (const code of codes) {
  const point = db.find((item) => item.code === code);
  const staged = stagingByCode.get(code) || {};
  const damagedFields = Object.entries(point || {})
    .filter(([, value]) => hasDamage(value))
    .map(([field, value]) => ({ field, current: value }));

  const proposed = [];
  const needsRewrite = [];
  for (const item of damagedFields) {
    const candidate = SAFE_REPAIR_CANDIDATES[code]?.[item.field];
    if (candidate) {
      proposed.push({
        field: item.field,
        current: item.current,
        proposed: candidate,
        basis: "concise rewrite using CloudTCM staging as one reference; still pending Ting/source review"
      });
    } else {
      needsRewrite.push({
        field: item.field,
        current: item.current,
        note: "No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review.",
        cloudtcm_reference: {
          location_zh: staged.location_zh || "",
          technique_zh: staged.technique_zh || "",
          description_zh: staged.description_zh || "",
          source_url: staged.source_url || ""
        }
      });
    }
  }

  records.push({
    code,
    chinese: point?.chinese || "",
    pinyin: point?.pinyin || "",
    english: point?.english || "",
    damaged_fields: damagedFields.length,
    proposed_repairs: proposed,
    needs_manual_rewrite: needsRewrite,
    cloudtcm_reference: {
      source_url: staged.source_url || "",
      location_zh: staged.location_zh || "",
      technique_zh: staged.technique_zh || "",
      description_zh: staged.description_zh || ""
    }
  });
}

const proposedCount = records.reduce((sum, record) => sum + record.proposed_repairs.length, 0);
const manualCount = records.reduce((sum, record) => sum + record.needs_manual_rewrite.length, 0);

const output = {
  generated: new Date().toISOString(),
  policy: "Preview only. Does not modify canonical data. Proposed repairs require Ting approval before apply.",
  affected_codes: codes,
  proposed_repairs: proposedCount,
  needs_manual_rewrite: manualCount,
  records
};

function valText(value) {
  return Array.isArray(value) ? value.join("; ") : String(value || "");
}

const proposedRows = records.flatMap((record) =>
  record.proposed_repairs.map((repair) =>
    `| ${record.code} | ${record.chinese} | ${repair.field} | ${valText(repair.current).replace(/\|/g, "\\|")} | ${valText(repair.proposed).replace(/\|/g, "\\|")} |`
  )
).join("\n");

const manualRows = records.flatMap((record) =>
  record.needs_manual_rewrite.map((item) =>
    `| ${record.code} | ${record.chinese} | ${item.field} | ${valText(item.current).replace(/\|/g, "\\|")} | ${item.note} |`
  )
).join("\n");

const md = `# BL61-BL67 Encoding Repair Preview

Generated: ${output.generated}

This is a gated preview only. It does not modify \`data/acupoints/361.json\`.

## Summary

- Affected codes: ${codes.join(", ")}
- Proposed concise repairs: ${proposedCount}
- Fields needing manual rewrite/removal decision: ${manualCount}

## Why This Matters

These fields contain literal \`????\`, which means the canonical text is unreadable. This is different from a normal CloudTCM wording difference.

## Proposed Repairs

These are small candidate repairs for fields where a concise safe replacement is possible.

| code | zh | field | current damaged value | proposed replacement |
|---|---|---|---|---|
${proposedRows || "| - | - | - | - | - |"}

## Needs Manual Rewrite

These are study-note fields such as \`clinical_pearls\` and \`danger\`. They should not be blindly replaced with CloudTCM prose.

| code | zh | field | current damaged value | note |
|---|---|---|---|---|
${manualRows || "| - | - | - | - | - |"}

## Recommended Gate

If Ting approves, apply only the proposed repairs first:

- BL61 \`location_zh\`
- BL67 \`location_zh\`
- BL67 \`contraindications\`

Then separately decide whether the unreadable \`clinical_pearls\` and \`danger\` fields should be rewritten, emptied with a review note, or reconstructed from another source.

Machine-readable preview: docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.json
`;

fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
fs.writeFileSync(OUT_MD, md, "utf8");

console.log(JSON.stringify({
  wrote: [path.relative(ROOT, OUT_MD), path.relative(ROOT, OUT_JSON)],
  proposed_repairs: proposedCount,
  needs_manual_rewrite: manualCount
}, null, 2));

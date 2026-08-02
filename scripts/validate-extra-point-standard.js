#!/usr/bin/env node
/**
 * Extra-point audit for data/acupoints/extra_points.json.
 *
 * This is intentionally an audit/worklist first, not a hard gate by default:
 * the extra-point layer predates the final acupoint-card template and currently
 * contains legacy imported text. Use --strict when a cleanup batch is expected
 * to be clean.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/extra_points.json");
const STRICT = process.argv.includes("--strict");
const SHOW_ALL = process.argv.includes("--all");

const records = JSON.parse(fs.readFileSync(FILE, "utf8"));
const arr = (v) => Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]);
const text = (v) => Array.isArray(v) ? v.join("\n") : String(v || "");
const hasHan = (v) => /[\u3400-\u9fff]/.test(text(v));
const hasMojibake = (v) => /Ã|Â|�|å[^\x00-\x7f]|ç[^\x00-\x7f]|é[^\x00-\x7f]/.test(text(v));
const hasDepth = (v) => /(\d+(\.\d+)?\s*[-~–]\s*\d+(\.\d+)?|\d+(\.\d+)?)\s*(cun|寸|吋)/i.test(text(v));
const hasBloodlettingTechnique = (v) => /(prick\s+to\s+bleed|bloodletting|點刺出血|點刺.*出血|三稜針|三棱针|出血|drops?|滴)/i.test(text(v));
const hasMoxibustionTechnique = (v) => /(?:\d+(?:\.\d+)?\s*[-~–]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:壯|壮|cones?|minutes?|mins?|分鐘|分钟)/i.test(text(v));
const hasMeasurableTechnique = (v) => hasDepth(v) || hasBloodlettingTechnique(v) || hasMoxibustionTechnique(v);
const isGenericSourceUrl = (v) => /^https?:\/\/(?:www\.)?cloudtcm\.com\/acupoint\/?(?:[?#].*)?$/i.test(String(v || "").trim());
const filled = (v) => text(v).trim() !== "";

const issueMap = new Map();
function flag(record, issue) {
  const list = issueMap.get(record.code) || [];
  list.push(issue);
  issueMap.set(record.code, list);
}

const required = ["code", "nameZh", "nameEn", "pinyin", "location", "locationEn", "functions", "functionsEn", "patterns", "patternsEn", "techniqueNotes", "cautions", "sources"];
for (const r of records) {
  for (const key of required) {
    if (!filled(r[key])) flag(r, `missing ${key}`);
  }
  for (const key of ["nameZh", "region", "location", "functions", "patterns", "cautions", "combinePointsZh", "visualLinks"]) {
    if (filled(r[key]) && hasMojibake(r[key])) flag(r, `mojibake suspected in ${key}`);
  }
  for (const key of ["nameZh", "location", "functions"]) {
    if (filled(r[key]) && !hasHan(r[key])) flag(r, `${key} has no readable Chinese`);
  }
  if (arr(r.patterns).length !== arr(r.patternsEn).length) {
    flag(r, `patterns/patternsEn length mismatch ${arr(r.patterns).length} vs ${arr(r.patternsEn).length}`);
  }
  if ((arr(r.functionsZhList).length || arr(r.functionsEnList).length) && arr(r.functionsZhList).length !== arr(r.functionsEnList).length) {
    flag(r, `functionsZhList/functionsEnList length mismatch ${arr(r.functionsZhList).length} vs ${arr(r.functionsEnList).length}`);
  }
  if (!hasMeasurableTechnique(r.techniqueNotes)) flag(r, "techniqueNotes lacks measurable needling, bloodletting, or moxibustion method");
  if (!arr(r.sources).some((s) => /^https?:\/\//.test(String(s)))) flag(r, "no external source URL");
  if (arr(r.sources).some(isGenericSourceUrl)) flag(r, "generic CloudTCM directory URL; exact detail source or explicit source gap required");
  if (/local skin|skin lesion/i.test(text(r.cautions)) || /局部皮膚破損|皮膚破損|皮损/.test(text(r.cautions))) {
    flag(r, "generic local-skin caution; needs point-specific safety review");
  }
}

const total = records.length;
const issueRecords = [...issueMap.entries()];
const mojibakeRecords = records.filter((r) => ["nameZh", "region", "location", "functions", "patterns", "cautions", "combinePointsZh", "visualLinks"].some((k) => hasMojibake(r[k]))).length;
const noDepth = records.filter((r) => !hasMeasurableTechnique(r.techniqueNotes)).length;
const sourceMissing = records.filter((r) => !arr(r.sources).some((s) => /^https?:\/\//.test(String(s)))).length;
const genericSourceRecords = records.filter((r) => arr(r.sources).some(isGenericSourceUrl)).length;

console.log("validate-extra-point-standard");
console.log(`  records                 ${total}`);
console.log(`  records with issues     ${issueRecords.length}/${total}`);
console.log(`  mojibake suspected      ${mojibakeRecords}/${total}`);
console.log(`  missing measurable method ${noDepth}/${total}`);
console.log(`  missing source URL      ${sourceMissing}/${total}`);
console.log(`  generic source URL      ${genericSourceRecords}/${total}`);

if (issueRecords.length) {
  console.log("\n===== EXTRA POINT WORKLIST =====");
  for (const [code, issues] of (SHOW_ALL ? issueRecords : issueRecords.slice(0, 30))) {
    const r = records.find((item) => item.code === code) || {};
    console.log(`  ${code.padEnd(8)} ${(r.nameZh || r.nameEn || "").padEnd(18)} ${issues.length} issue(s): ${issues.slice(0, 5).join("; ")}`);
  }
  if (!SHOW_ALL && issueRecords.length > 30) {
    console.log(`  ... ${issueRecords.length - 30} more. Re-run with --all for full list.`);
  }
}

if (STRICT && issueRecords.length) {
  console.error("\nFAIL --strict: extra-point issues remain.");
  process.exit(1);
}
console.log("\nPASS audit mode. Use --strict after an extra-point cleanup batch.");

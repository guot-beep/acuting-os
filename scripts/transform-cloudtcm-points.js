#!/usr/bin/env node
/**
 * transform-cloudtcm-points.js — distill raw CloudTCM point JSON
 * (data/imports/cloudtcm/points/*.json) into a reviewable draft staging file.
 *
 *   node scripts/transform-cloudtcm-points.js --inspect LU1   # print raw key structure
 *   node scripts/transform-cloudtcm-points.js                 # build staging + coverage report
 *
 * Output (never touches data/acupoints/ or runtime files):
 * - data/imports/cloudtcm/staging_points.json — one draft record per point
 * - data/imports/cloudtcm/coverage_report.json — which fields were found/missing
 *
 * The exact JSON shape of CloudTCM's acupoint pageProps is unknown until the
 * first fetch, so field mapping below is defensive: it walks pageProps for the
 * first object that has a name/id and tries several likely key spellings per
 * field. After the first real fetch, run --inspect on one file and tighten
 * FIELD_CANDIDATES if coverage is poor.
 *
 * Every staged record gets:
 *   review_status: "draft"
 *   source_status: "cloudtcm_import_pending_review"
 *   source_url: the exact CloudTCM page
 * Nothing here may be promoted to source_checked without per-record review.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "imports", "cloudtcm", "points");
const MAP_FILE = path.join(ROOT, "data", "sources", "cloudtcm_point_map.json");
const STAGING_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "staging_points.json");
const REPORT_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "coverage_report.json");

// Likely key names per target field. Extend after --inspect on real data.
const FIELD_CANDIDATES = {
  name_zh: ["AcuNameCH", "name", "name_zh", "chinese_name", "title", "acupoint_name"],
  pinyin: ["AcuNameEN", "pinyin", "name_pinyin", "romanization"],
  name_en: ["AcuNameEN", "name_en", "english_name", "english"],
  code: ["AcuCode", "code", "point_code", "abbr", "number"],
  meridian_zh: ["meridian", "meridian_name", "channel", "meridian_zh"],
  location_zh: ["Location", "location", "position", "locate", "location_zh", "anatomy_location"],
  functions_zh: ["Detail", "effect", "function", "functions", "efficacy", "action"],
  indications_zh: ["DiseaseCategory_JSON", "Detail", "indication", "indications", "main_treatment", "treats", "symptom"],
  technique_zh: ["Acumethod", "method", "operation", "manipulation", "needling", "technique", "acupuncture_method"],
  cautions_zh: ["Caution", "caution", "cautions", "contraindication", "warning", "notice"],
  description_zh: ["NameIntroCH", "Detail", "description", "detail", "content", "intro"]
};

function cleanText(value) {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h\d|div|ol|ul)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findPointObject(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 6) return null;
  if (!Array.isArray(node)) {
    const keys = Object.keys(node);
    const hasName = keys.some((k) => FIELD_CANDIDATES.name_zh.includes(k));
    const hasBody = keys.some((k) => FIELD_CANDIDATES.location_zh.includes(k) || FIELD_CANDIDATES.indications_zh.includes(k));
    if (hasName && hasBody) return node;
  }
  const children = Array.isArray(node) ? node : Object.values(node);
  for (const child of children) {
    const found = findPointObject(child, depth + 1);
    if (found) return found;
  }
  return null;
}

function pick(obj, candidates) {
  for (const key of candidates) {
    const value = obj[key];
    if (value == null) continue;
    if (typeof value === "string" && cleanText(value)) return cleanText(value);
    if (Array.isArray(value) && value.length) return value.map((v) => cleanText(typeof v === "object" ? JSON.stringify(v) : v)).filter(Boolean);
    if (typeof value === "number") return String(value);
  }
  return "";
}

function keyTree(node, depth = 0, max = 4) {
  if (!node || typeof node !== "object" || depth >= max) return typeof node;
  if (Array.isArray(node)) return node.length ? [keyTree(node[0], depth + 1, max)] : [];
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = keyTree(v, depth + 1, max);
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const inspectIndex = args.indexOf("--inspect");

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`No raw files at ${path.relative(ROOT, RAW_DIR)}. Run scripts/fetch-cloudtcm-points.js first (on a machine with cloudtcm.com access).`);
    process.exit(1);
  }
  const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".json")).sort();
  if (!files.length) { console.error("Raw directory is empty."); process.exit(1); }

  if (inspectIndex >= 0) {
    const code = String(args[inspectIndex + 1] || files[0].replace(".json", "")).toUpperCase();
    const raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, `${code}.json`), "utf8"));
    console.log(JSON.stringify(keyTree(raw), null, 2));
    return;
  }

  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8")).points || {};
  const staged = [];
  const coverage = {};
  const unmatched = [];

  for (const file of files) {
    const code = file.replace(".json", "");
    const raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), "utf8"));
    const pointObj = findPointObject(raw.pageProps || raw) || {};
    if (!Object.keys(pointObj).length) unmatched.push(code);

    const record = {
      code,
      cloudtcm_id: map[code] ? map[code].id : "",
      review_status: "draft",
      source_status: "cloudtcm_import_pending_review",
      source_url: map[code] ? `https://cloudtcm.com/acupoint/${map[code].id}` : "",
      imported_at: new Date().toISOString().slice(0, 10)
    };
    for (const [field, candidates] of Object.entries(FIELD_CANDIDATES)) {
      const value = pick(pointObj, candidates);
      if (field === "code") record.cloudtcm_code = value;
      else record[field] = value;
      if (value && String(value).length) coverage[field] = (coverage[field] || 0) + 1;
    }
    staged.push(record);
  }

  const report = {
    generated: new Date().toISOString(),
    raw_files: files.length,
    staged_records: staged.length,
    field_coverage: coverage,
    records_with_no_matched_object: unmatched,
    note: unmatched.length
      ? "Some raw files did not match the field heuristics. Run --inspect on one of them and extend FIELD_CANDIDATES."
      : "All raw files matched. Review staging_points.json, then plan a merge diff against data/acupoints/361.json (separate approval-gated step)."
  };

  fs.writeFileSync(STAGING_FILE, JSON.stringify({
    dataset: "CloudTCM acupoint import staging",
    policy: "draft only; private study; per-record review required before any promotion; do not republish text",
    records: staged
  }, null, 2));
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log(`Staged ${staged.length} records → ${path.relative(ROOT, STAGING_FILE)}`);
  console.log("Field coverage:", coverage);
  if (unmatched.length) console.warn(`Unmatched files (${unmatched.length}):`, unmatched.slice(0, 10).join(", "), unmatched.length > 10 ? "..." : "");
}

main();

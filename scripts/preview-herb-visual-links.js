const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HERBS_PATH = path.join(ROOT, "data", "herbs", "herb_canon_shortlist.json");
const REPORT_DIR = path.join(ROOT, "docs", "herb_visual_previews");
const CLOUDTCM_URL = /^https:\/\/cloudtcm\.com\/herb\/(?:pharm\/)?\d+$/;
const HKBU_URL = /^https:\/\/sys01\.lib\.hkbu\.edu\.hk\/cmed\/(?:mmid|mpid)\/detail\.php\?(?:pid|herb_id)=[A-Z]\d+$/;
const DAMAGE_PATTERN = /\?{3,}|\uFFFD/;

function fail(message) {
  throw new Error(message);
}

function normalizedPinyin(value) {
  return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
}

function validateLink(link, context) {
  if (!link || typeof link !== "object" || Array.isArray(link)) fail(`${context}: link must be an object`);
  const required = ["source_id", "source_name", "database_type", "url", "label_zh", "label_en", "page_name_zh", "page_pinyin"];
  for (const key of required) {
    if (typeof link[key] !== "string" || link[key].trim() === "") fail(`${context}: ${key} is required`);
    if (DAMAGE_PATTERN.test(link[key])) fail(`${context}: ${key} contains damaged text`);
  }
  if (link.source_id === "cloudtcm_herb" && !CLOUDTCM_URL.test(link.url)) {
    fail(`${context}: invalid exact CloudTCM herb URL`);
  }
  if (["hkbu_mmid", "hkbu_mpid"].includes(link.source_id) && !HKBU_URL.test(link.url)) {
    fail(`${context}: invalid exact HKBU image URL`);
  }
  if (!["cloudtcm_herb", "hkbu_mmid", "hkbu_mpid"].includes(link.source_id)) {
    fail(`${context}: unsupported source_id ${link.source_id}`);
  }
  if (!Array.isArray(link.identity_checks) || link.identity_checks.length < 3) {
    fail(`${context}: at least three identity checks are required`);
  }
  if (!Array.isArray(link.caveats) || link.caveats.length === 0) {
    fail(`${context}: at least one caveat is required`);
  }
}

function buildPreview(staging, herbs) {
  if (staging.dataset !== "herb_visual_link_staging") fail("dataset must be herb_visual_link_staging");
  if (staging.review_status !== "draft") fail("top-level review_status must remain draft");
  if (staging.canonical_write_allowed !== false) fail("canonical_write_allowed must be false");
  if (!Array.isArray(staging.records) || staging.records.length === 0) fail("records must be non-empty");

  const herbById = new Map(herbs.map((record) => [record.id, record]));
  const seenHerbs = new Set();
  const seenUrls = new Set();
  const preview = [];

  for (const record of staging.records) {
    if (seenHerbs.has(record.herb_id)) fail(`duplicate herb_id: ${record.herb_id}`);
    seenHerbs.add(record.herb_id);
    const target = herbById.get(record.herb_id);
    if (!target) fail(`unknown herb id: ${record.herb_id}`);
    if (record.review_status !== "draft") fail(`${record.herb_id}: review_status must remain draft`);
    if (record.name_zh !== target.name_zh) fail(`${record.herb_id}: staged Chinese name does not match canonical`);
    if (normalizedPinyin(record.pinyin) !== normalizedPinyin(target.pinyin)) {
      fail(`${record.herb_id}: staged pinyin does not match canonical`);
    }
    if (!Array.isArray(record.visual_links) || record.visual_links.length !== 2) {
      fail(`${record.herb_id}: exactly two visual links are required for this probe`);
    }
    const sourceFamilies = new Set();
    for (const [index, link] of record.visual_links.entries()) {
      validateLink(link, `${record.herb_id}.visual_links[${index}]`);
      if (link.page_name_zh !== target.name_zh) fail(`${record.herb_id}: source page Chinese name mismatch`);
      if (normalizedPinyin(link.page_pinyin) !== normalizedPinyin(target.pinyin)) {
        if (link.pinyin_match_status !== "source_typo_documented") {
          fail(`${record.herb_id}: source page pinyin mismatch`);
        }
        const typoDocumented = link.caveats.some((caveat) => /pinyin|拼音|romanization/i.test(caveat));
        if (!typoDocumented) fail(`${record.herb_id}: source pinyin mismatch requires an explicit caveat`);
      }
      if (seenUrls.has(link.url)) fail(`duplicate visual URL: ${link.url}`);
      seenUrls.add(link.url);
      sourceFamilies.add(link.source_id === "cloudtcm_herb" ? "cloudtcm" : "hkbu");
    }
    if (sourceFamilies.size !== 2) fail(`${record.herb_id}: CloudTCM and HKBU links are both required`);
    preview.push({
      herb_id: record.herb_id,
      name_zh: target.name_zh,
      pinyin: target.pinyin,
      links: record.visual_links
    });
  }
  return { batch: staging.batch, preview };
}

function markdownReport(stagingPath, result) {
  const lines = [
    `# Herb Visual Link Preview - ${result.batch}`,
    "",
    `Staging file: \`${path.relative(ROOT, stagingPath).replace(/\\/g, "/")}\``,
    "",
    "Review-only exact-page mapping. No canonical herb data was modified, and this tool has no apply mode.",
    "",
    "## Summary",
    "",
    `- herbs: ${result.preview.length}`,
    `- exact visual links: ${result.preview.reduce((sum, record) => sum + record.links.length, 0)}`,
    "- source families per herb: 2 (CloudTCM + HKBU)",
    "- conflicts: 0",
    "- canonical writes: 0",
    "- review status: draft",
    "",
    "## Exact Page Matches",
    "",
    "| Herb | Source | Database type | Exact page | Identity caveat |",
    "| --- | --- | --- | --- | --- |"
  ];
  for (const record of result.preview) {
    for (const link of record.links) {
      lines.push(`| \`${record.herb_id}\` ${record.name_zh} ${record.pinyin} | ${link.source_id} | ${link.database_type} | [${link.label_zh}](${link.url}) | ${link.caveats.join("<br>")} |`);
    }
  }
  lines.push(
    "",
    "## Gate",
    "",
    "Ting/Claude should spot-check the ten pages and the homonym/medicinal-part caveats before any canonical merge or UI override is designed."
  );
  return `${lines.join("\n")}\n`;
}

function main() {
  const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!inputArg) fail("Usage: node scripts/preview-herb-visual-links.js <staging.json> [--write-report]");
  if (process.argv.some((arg) => arg.startsWith("--apply"))) fail("Apply is intentionally unsupported; review gate required");
  const stagingPath = path.resolve(ROOT, inputArg);
  const staging = JSON.parse(fs.readFileSync(stagingPath, "utf8"));
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, "utf8")).records;
  const result = buildPreview(staging, herbs);
  const report = markdownReport(stagingPath, result);
  if (process.argv.includes("--write-report")) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const outputPath = path.join(REPORT_DIR, `${result.batch}.md`);
    fs.writeFileSync(outputPath, report, "utf8");
    console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
  }
  console.log(JSON.stringify({
    batch: result.batch,
    herbs: result.preview.length,
    exact_visual_links: result.preview.reduce((sum, record) => sum + record.links.length, 0),
    conflicts: 0,
    canonical_writes: 0
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Herb visual link preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { buildPreview, markdownReport };

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HERBS_PATH = path.join(ROOT, "data", "herbs", "herb_canon_shortlist.json");
const JSON_OUTPUT = path.join(ROOT, "docs", "HERB_COMPARISON_GROUP_PREVIEW.json");
const SUMMARY_OUTPUT = path.join(ROOT, "docs", "HERB_COMPARISON_GROUP_DIFF_SUMMARY.md");

function fail(message) {
  throw new Error(message);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function categoryGroup(category) {
  if (typeof category !== "string" || !category.includes(" / ")) {
    fail(`category lacks bilingual separator: ${category}`);
  }
  const english = category.split(" / ").slice(1).join(" / ").trim();
  const group = slugify(english);
  if (!group) fail(`category cannot produce comparison_group: ${category}`);
  return group;
}

function isEmpty(value) {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

function buildPreview(herbs) {
  if (!Array.isArray(herbs) || herbs.length === 0) fail("herb canon records must be non-empty");
  const herbIds = new Set();
  const groupByCategory = new Map();
  const categoryByGroup = new Map();
  const membersByGroup = new Map();

  for (const herb of herbs) {
    if (!herb.id || herbIds.has(herb.id)) fail(`missing or duplicate herb id: ${herb.id}`);
    herbIds.add(herb.id);
    const group = categoryGroup(herb.category);
    if (categoryByGroup.has(group) && categoryByGroup.get(group) !== herb.category) {
      fail(`comparison_group collision: ${group}`);
    }
    groupByCategory.set(herb.category, group);
    categoryByGroup.set(group, herb.category);
    if (!membersByGroup.has(group)) membersByGroup.set(group, []);
    membersByGroup.get(group).push(herb.id);
  }

  for (const members of membersByGroup.values()) members.sort();

  const records = herbs.map((herb) => {
    const comparisonGroup = groupByCategory.get(herb.category);
    const relatedHerbs = membersByGroup.get(comparisonGroup).filter((id) => id !== herb.id);
    const conflicts = [];
    if (!isEmpty(herb.comparison_group) && herb.comparison_group !== comparisonGroup) conflicts.push("comparison_group");
    if (!isEmpty(herb.related_herbs)) conflicts.push("related_herbs");
    if (!isEmpty(herb.substitution_context_zh)) conflicts.push("substitution_context_zh");
    return {
      herb_id: herb.id,
      name_zh: herb.name_zh,
      pinyin: herb.pinyin,
      category: herb.category,
      additions: {
        comparison_group: comparisonGroup,
        related_herbs: relatedHerbs,
        substitution_context_zh: ""
      },
      conflicts
    };
  });

  const allRelated = records.flatMap((record) => record.additions.related_herbs.map((id) => [record.herb_id, id]));
  const brokenLinks = allRelated.filter(([, id]) => !herbIds.has(id));
  const selfLinks = allRelated.filter(([from, to]) => from === to);
  const crossGroupLinks = allRelated.filter(([from, to]) => {
    const fromRecord = records.find((record) => record.herb_id === from);
    const toRecord = records.find((record) => record.herb_id === to);
    return fromRecord.additions.comparison_group !== toRecord.additions.comparison_group;
  });
  if (brokenLinks.length || selfLinks.length || crossGroupLinks.length) {
    fail(`invalid related-herb links: broken=${brokenLinks.length}, self=${selfLinks.length}, cross_group=${crossGroupLinks.length}`);
  }

  const groups = [...membersByGroup.entries()]
    .map(([id, members]) => ({ id, category: categoryByGroup.get(id), count: members.length, members }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  const conflicts = records.flatMap((record) => record.conflicts.map((field) => ({ herb_id: record.herb_id, field })));

  return {
    dataset: "herb_comparison_group_preview",
    created: new Date().toISOString().slice(0, 10),
    review_status: "draft",
    canonical_write_allowed: false,
    wording_law: "同組相近藥供比較與替換思考參考，非自動替代；劑量與配伍調整屬專業判斷。",
    summary: {
      herbs: records.length,
      categories: groupByCategory.size,
      comparison_groups: groups.length,
      proposed_comparison_group_fields: records.length,
      proposed_related_herbs_fields: records.length,
      proposed_substitution_context_fields: records.length,
      directed_related_herb_links: allRelated.length,
      singleton_groups: groups.filter((group) => group.count === 1).length,
      conflicts: conflicts.length,
      canonical_writes: 0
    },
    groups,
    records,
    conflicts
  };
}

function markdownReport(preview) {
  const s = preview.summary;
  const lines = [
    "# Herb Comparison Group Diff Summary",
    "",
    "H1 review-only preview. Existing herb categories are reused as the comparison-group boundary; no new clinical classification is inferred.",
    "",
    "## Migration Safety Plan",
    "",
    "1. What changes: add `comparison_group`, generated `related_herbs[]`, and empty `substitution_context_zh` to each of 202 herb records.",
    "2. Why: enable same-category comparison and substitution-thinking navigation while preserving stable herb IDs.",
    "3. Backup: canonical data is unchanged in this preview; any later approved apply must be a standalone git commit.",
    "4. Validation: reject unknown/self/cross-group IDs, duplicate IDs, group-slug collisions, and non-empty target conflicts.",
    "5. Rollback: revert the standalone apply commit; no existing field or ID would be renamed or deleted.",
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Herbs | ${s.herbs} |`,
    `| Existing categories reused | ${s.categories} |`,
    `| Proposed comparison groups | ${s.comparison_groups} |`,
    `| Proposed directed related-herb links | ${s.directed_related_herb_links} |`,
    `| Singleton groups | ${s.singleton_groups} |`,
    `| Conflicts | ${s.conflicts} |`,
    `| Canonical writes | ${s.canonical_writes} |`,
    "",
    "## Group Size Review",
    "",
    "| Group | Existing category | Herbs | Review note |",
    "| --- | --- | ---: | --- |"
  ];
  for (const group of preview.groups) {
    const note = group.count === 1
      ? "Singleton: related_herbs remains empty"
      : (group.count > 10 ? "Large group: Ting/Claude should confirm this category is sufficiently specific" : "Mechanical same-category group");
    lines.push(`| \`${group.id}\` | ${group.category} | ${group.count} | ${note} |`);
  }
  lines.push(
    "",
    "## Sample Proposed Records",
    "",
    "| Herb | Group | Related herb IDs |",
    "| --- | --- | --- |"
  );
  for (const record of preview.records.slice(0, 12)) {
    lines.push(`| \`${record.herb_id}\` ${record.name_zh} | \`${record.additions.comparison_group}\` | ${record.additions.related_herbs.map((id) => `\`${id}\``).join(", ") || "None"} |`);
  }
  lines.push(
    "",
    "## Permanent UI Wording",
    "",
    `> ${preview.wording_law}`,
    "",
    "## Gate",
    "",
    "Review the 34 group boundaries, especially groups larger than 10 herbs. Do not apply this preview until Ting/Claude approves the mechanical category-to-group rule. No substitution prose or dosage is included."
  );
  return `${lines.join("\n")}\n`;
}

function main() {
  if (process.argv.some((arg) => arg.startsWith("--apply"))) fail("Apply is intentionally unsupported; H1 review gate required");
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, "utf8")).records;
  const preview = buildPreview(herbs);
  fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(preview, null, 2)}\n`, "utf8");
  fs.writeFileSync(SUMMARY_OUTPUT, markdownReport(preview), "utf8");
  console.log(JSON.stringify(preview.summary, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Herb comparison preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { buildPreview, markdownReport };

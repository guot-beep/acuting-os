const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FORMULAS_PATH = path.join(ROOT, "data/herbs/formulas.json");
const SHORTLIST_PATH = path.join(ROOT, "data/herbs/formula_canon_shortlist.json");
const PREVIEW_PATH = path.join(ROOT, "docs/FORMULA_MERGE_PREVIEW.json");
const SUMMARY_PATH = path.join(ROOT, "docs/FORMULA_MERGE_DIFF_SUMMARY.md");

const CANON_FIELDS_TO_ABSORB = [
  "tier",
  "category",
  "source_hint",
  "comparison_group",
  "related_formulas",
  "modern_clinical_use_tags",
  "related_conditions",
  "clinical_use_note"
];

const FORMULA_CONTENT_FIELDS = [
  "actions_en",
  "actions_zh",
  "composition",
  "modifications_en",
  "modifications_zh",
  "contraindications_en",
  "contraindications_zh",
  "pattern_indications_en",
  "pattern_indications_zh",
  "english_exam_track",
  "chinese_depth_track",
  "source_urls",
  "safety_flags",
  "clinical_pearls",
  "fertility_notes",
  "herb_drug_cautions",
  "acupoint_links",
  "condition_links",
  "western_condition_links"
];

const PLANNING_FIELDS_TO_FILL = [
  "tier",
  "category",
  "source_hint",
  "comparison_group",
  "related_formulas",
  "clinical_use_note"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function asRecords(data) {
  return Array.isArray(data.records) ? data.records : [];
}

function valueEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function uniqueKeys(records) {
  const keys = new Set();
  records.forEach((record) => Object.keys(record).forEach((key) => keys.add(key)));
  return [...keys].sort();
}

function makeSkeleton(shortlistRecord) {
  const record = {
    id: shortlistRecord.id,
    name_zh: shortlistRecord.name_zh,
    name_en: shortlistRecord.name_en,
    pinyin: shortlistRecord.pinyin,
    review_status: "draft",
    source_status: "source_review_pending",
    source_type: "formula_canon_shortlist_skeleton",
    category_id: "",
    category_en: "",
    category: shortlistRecord.category || "",
    tier: shortlistRecord.tier || "core",
    source_hint: shortlistRecord.source_hint || "",
    comparison_group: shortlistRecord.comparison_group || "",
    modern_clinical_use_tags: clone(shortlistRecord.modern_clinical_use_tags) || [],
    related_conditions: clone(shortlistRecord.related_conditions) || [],
    related_formulas: clone(shortlistRecord.related_formulas) || [],
    clinical_use_note: shortlistRecord.clinical_use_note || "",
    nccaom_high_yield: true,
    public_safe: false,
    study_tags: [],
    pattern_focus_en: "",
    actions_en: [],
    actions_zh: [],
    composition: [],
    pattern_indications_en: [],
    pattern_indications_zh: [],
    modifications_en: [],
    modifications_zh: [],
    contraindications_en: [],
    contraindications_zh: [],
    safety_flags: [],
    source_urls: [],
    clinical_pearls: [],
    fertility_notes: [],
    herb_drug_cautions: [],
    acupoint_links: [],
    condition_links: [],
    western_condition_links: [],
    english_exam_track: {
      review_status: "draft",
      source_status: "bensky_review_pending",
      actions: [],
      indications: [],
      modifications: [],
      contraindications: [],
      notes: []
    },
    chinese_depth_track: {
      review_status: "draft",
      source_status: "cloudtcm_or_institution_review_pending",
      fang_yi_zh: "",
      zhu_zhi_zh: "",
      notes_zh: []
    },
    last_reviewed: ""
  };
  return record;
}

function mergeOverlapRecord(formula, shortlist) {
  const merged = clone(formula);
  for (const field of PLANNING_FIELDS_TO_FILL) {
    if (Object.prototype.hasOwnProperty.call(shortlist, field) && !Object.prototype.hasOwnProperty.call(merged, field)) {
      merged[field] = clone(shortlist[field]);
    }
  }

  for (const field of ["modern_clinical_use_tags", "related_conditions"]) {
    if (!Object.prototype.hasOwnProperty.call(merged, field) && Object.prototype.hasOwnProperty.call(shortlist, field)) {
      merged[field] = clone(shortlist[field]);
    }
  }

  return merged;
}

function compareOverlap(formula, shortlist) {
  const identical = [];
  const changed = [];
  const fillFromShortlist = [];
  const keepFormula = [];

  for (const field of CANON_FIELDS_TO_ABSORB) {
    const formulaHas = Object.prototype.hasOwnProperty.call(formula, field);
    const shortlistHas = Object.prototype.hasOwnProperty.call(shortlist, field);

    if (!shortlistHas) continue;

    if (!formulaHas) {
      fillFromShortlist.push({ field, value: shortlist[field] });
      continue;
    }

    if (valueEqual(formula[field], shortlist[field])) {
      identical.push(field);
      continue;
    }

    changed.push({
      field,
      current: formula[field],
      shortlist: shortlist[field],
      decision: field === "review_status"
        ? "keep current formula review_status; do not downgrade content-bearing record automatically"
        : "prefer shortlist planning value only after Ting approves formula merge"
    });
  }

  for (const field of ["id", "name_zh", "name_en", "pinyin"]) {
    if (!valueEqual(formula[field], shortlist[field])) {
      changed.push({
        field,
        current: formula[field],
        shortlist: shortlist[field],
        decision: "identity conflict; must review before apply"
      });
    }
  }

  for (const field of FORMULA_CONTENT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(formula, field)) {
      keepFormula.push(field);
    }
  }

  return { identical, fillFromShortlist, changed, keepFormula };
}

function main() {
  const formulasData = readJson(FORMULAS_PATH);
  const shortlistData = readJson(SHORTLIST_PATH);
  const formulas = asRecords(formulasData);
  const shortlist = asRecords(shortlistData);

  const formulaById = new Map(formulas.map((record) => [record.id, record]));
  const shortlistById = new Map(shortlist.map((record) => [record.id, record]));
  const duplicateFormulaIds = formulas.map((record) => record.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  const duplicateShortlistIds = shortlist.map((record) => record.id).filter((id, index, ids) => ids.indexOf(id) !== index);

  const overlapIds = shortlist.map((record) => record.id).filter((id) => formulaById.has(id)).sort();
  const formulaOnlyIds = formulas.map((record) => record.id).filter((id) => !shortlistById.has(id)).sort();
  const shortlistOnlyIds = shortlist.map((record) => record.id).filter((id) => !formulaById.has(id)).sort();

  const overlap = overlapIds.map((id) => {
    const comparison = compareOverlap(formulaById.get(id), shortlistById.get(id));
    return {
      id,
      name_zh: formulaById.get(id).name_zh,
      name_en: formulaById.get(id).name_en,
      pinyin: formulaById.get(id).pinyin,
      ...comparison
    };
  });

  const skeletonAdds = shortlistOnlyIds.map((id) => makeSkeleton(shortlistById.get(id)));
  const conflictRecords = overlap.filter((record) =>
    record.changed.some((change) => ["id", "name_zh", "name_en", "pinyin"].includes(change.field))
  );
  const changedPlanningFields = overlap.reduce((count, record) => count + record.changed.length, 0);
  const fillPlanningFields = overlap.reduce((count, record) => count + record.fillFromShortlist.length, 0);

  const fieldMap = [
    ["id", "id", "primary key; must match; no auto-change on conflict"],
    ["name_zh", "name_zh", "identity field; must match; no auto-change on conflict"],
    ["name_en", "name_en", "identity field; must match; no auto-change on conflict"],
    ["pinyin", "pinyin", "identity field; must match; no auto-change on conflict"],
    ["category", "category", "add shortlist category while preserving existing category_id/category_en"],
    ["tier", "tier", "add to all records; current shortlist is core"],
    ["source_hint", "source_hint", "add planning/source hint from shortlist"],
    ["comparison_group", "comparison_group", "add study comparison group from shortlist"],
    ["related_formulas", "related_formulas", "add/replace from shortlist only after approval; ID references only"],
    ["modern_clinical_use_tags", "modern_clinical_use_tags", "compare existing values; prefer approved union/review, not blind overwrite"],
    ["related_conditions", "related_conditions", "compare existing values; keep ID references only"],
    ["clinical_use_note", "clinical_use_note", "add conservative clinical-context note from shortlist"],
    ["english_exam_track", "english_exam_track", "preserve formulas.json content-bearing field; skeleton additions get draft empty track"],
    ["chinese_depth_track", "chinese_depth_track", "preserve formulas.json content-bearing field; skeleton additions get draft empty track"],
    ["actions/composition/indications/modifications/contraindications", "same formulas.json fields", "preserve existing 23 content; skeleton additions remain empty draft"]
  ];

  const preview = {
    generated_at: new Date().toISOString(),
    policy: "Preview only. Does not modify data/herbs/formulas.json. Stop for Ting approval before apply.",
    source_files: {
      formulas: "data/herbs/formulas.json",
      shortlist: "data/herbs/formula_canon_shortlist.json"
    },
    recommended_target: "data/herbs/formulas.json",
    counts: {
      formulas_records: formulas.length,
      shortlist_records: shortlist.length,
      overlap_records: overlapIds.length,
      formula_only_records: formulaOnlyIds.length,
      shortlist_only_records_to_add_as_draft_skeletons: shortlistOnlyIds.length,
      projected_records_after_merge: formulas.length + shortlistOnlyIds.length,
      duplicate_formula_ids: duplicateFormulaIds.length,
      duplicate_shortlist_ids: duplicateShortlistIds.length,
      identity_conflict_records: conflictRecords.length,
      overlapping_fill_from_shortlist_fields: fillPlanningFields,
      overlapping_changed_or_conflicting_fields: changedPlanningFields
    },
    field_inventory: {
      formulas_fields: uniqueKeys(formulas),
      shortlist_fields: uniqueKeys(shortlist)
    },
    field_map: fieldMap.map(([shortlistField, targetField, decision]) => ({ shortlistField, targetField, decision })),
    duplicate_ids: {
      formulas: [...new Set(duplicateFormulaIds)],
      shortlist: [...new Set(duplicateShortlistIds)]
    },
    formula_only_ids: formulaOnlyIds,
    overlap,
    additions: skeletonAdds.map((record) => ({
      id: record.id,
      name_zh: record.name_zh,
      name_en: record.name_en,
      pinyin: record.pinyin,
      review_status: record.review_status,
      tier: record.tier,
      category: record.category,
      comparison_group: record.comparison_group,
      modern_clinical_use_tags: record.modern_clinical_use_tags,
      related_conditions: record.related_conditions,
      related_formulas: record.related_formulas,
      proposed_skeleton: record
    }))
  };

  writeJson(PREVIEW_PATH, preview);
  fs.writeFileSync(SUMMARY_PATH, renderSummary(preview), "utf8");

  if (process.argv.includes("--apply-approved")) {
    if (preview.counts.duplicate_formula_ids > 0 || preview.counts.duplicate_shortlist_ids > 0 || preview.counts.identity_conflict_records > 0) {
      throw new Error("Refusing to apply formula merge preview with duplicate IDs or identity conflicts.");
    }

    const mergedRecords = [
      ...formulas.map((record) => mergeOverlapRecord(record, shortlistById.get(record.id) || {})),
      ...skeletonAdds
    ];

    const mergedData = {
      ...formulasData,
      status: "merged_with_formula_canon_shortlist_draft_skeletons",
      merge_note: {
        applied_at: new Date().toISOString(),
        source: "scripts/merge-formulas-preview.js --apply-approved",
        policy: "Preserved 23 content-bearing formulas; added shortlist planning fields; added 92 draft skeleton records; no source_checked upgrades."
      },
      records: mergedRecords
    };

    writeJson(FORMULAS_PATH, mergedData);
    console.log(`Applied formula merge to ${path.relative(ROOT, FORMULAS_PATH)}`);
  }

  console.log(`Formula merge preview written: ${path.relative(ROOT, PREVIEW_PATH)}`);
  console.log(`Formula merge summary written: ${path.relative(ROOT, SUMMARY_PATH)}`);
  console.log(JSON.stringify(preview.counts, null, 2));
}

function renderSummary(preview) {
  const lines = [];
  lines.push("# Formula Merge Diff Summary");
  lines.push("");
  lines.push(`Generated: ${preview.generated_at}`);
  lines.push("");
  lines.push("## Gate");
  lines.push("");
  lines.push("Preview only. No data file was modified. Do not apply until Ting approves this summary.");
  lines.push("");
  lines.push("## Counts");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|---|---:|");
  Object.entries(preview.counts).forEach(([key, value]) => {
    lines.push(`| ${key} | ${value} |`);
  });
  lines.push("");
  lines.push("## Field Map");
  lines.push("");
  lines.push("| Shortlist field | Target field | Decision |");
  lines.push("|---|---|---|");
  preview.field_map.forEach((row) => {
    lines.push(`| \`${row.shortlistField}\` | \`${row.targetField}\` | ${row.decision} |`);
  });
  lines.push("");
  lines.push("## Overlap Result");
  lines.push("");
  lines.push(`- Overlap records matched by \`id\`: ${preview.counts.overlap_records}`);
  lines.push(`- Formula-only records: ${preview.counts.formula_only_records}`);
  lines.push(`- Shortlist-only records proposed as draft skeleton additions: ${preview.counts.shortlist_only_records_to_add_as_draft_skeletons}`);
  lines.push(`- Identity conflict records: ${preview.counts.identity_conflict_records}`);
  lines.push(`- Projected merged record count: ${preview.counts.projected_records_after_merge}`);
  lines.push("");

  if (preview.formula_only_ids.length > 0) {
    lines.push("## Formula-Only IDs");
    lines.push("");
    preview.formula_only_ids.forEach((id) => lines.push(`- \`${id}\``));
    lines.push("");
  }

  lines.push("## Overlap Planning Field Changes");
  lines.push("");
  lines.push("| Formula | Fill from shortlist | Changed/conflicting fields |");
  lines.push("|---|---:|---:|");
  preview.overlap.forEach((record) => {
    lines.push(`| \`${record.id}\` ${record.name_zh} | ${record.fillFromShortlist.length} | ${record.changed.length} |`);
  });
  lines.push("");

  const changedExamples = preview.overlap
    .filter((record) => record.changed.length > 0)
    .slice(0, 12);
  if (changedExamples.length > 0) {
    lines.push("## Changed Field Examples");
    lines.push("");
    changedExamples.forEach((record) => {
      lines.push(`### ${record.id} ${record.name_zh}`);
      record.changed.slice(0, 6).forEach((change) => {
        lines.push(`- \`${change.field}\`: current=${JSON.stringify(change.current)}; shortlist=${JSON.stringify(change.shortlist)}; decision=${change.decision}`);
      });
      lines.push("");
    });
  }

  lines.push("## Draft Skeleton Additions");
  lines.push("");
  lines.push("The following 92 shortlist-only formulas would be added as `review_status: \"draft\"` skeletons after approval:");
  lines.push("");
  preview.additions.forEach((record) => {
    lines.push(`- \`${record.id}\` ${record.name_zh} / ${record.name_en} (${record.category}; group \`${record.comparison_group || "unassigned"}\`)`);
  });
  lines.push("");
  lines.push("## Recommended Apply Policy");
  lines.push("");
  lines.push("1. Preserve all content-bearing fields already present in `data/herbs/formulas.json` for the 23 overlap records.");
  lines.push("2. Add missing planning fields from the shortlist (`tier`, `category`, `source_hint`, `comparison_group`, `related_formulas`, `clinical_use_note`).");
  lines.push("3. For overlapping `modern_clinical_use_tags` and `related_conditions`, review before overwrite; these are search/relation surfaces.");
  lines.push("4. Add the 92 shortlist-only records as compact draft skeletons only after Ting approves this preview.");
  lines.push("5. Do not upgrade any record to `source_checked` during merge.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

main();

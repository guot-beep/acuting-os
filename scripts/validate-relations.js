const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    throw new Error(`${relativePath}: ${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function addId(set, id, source, errors, prefix) {
  if (typeof id !== "string" || !id.trim()) {
    errors.push(`${source}: missing id`);
    return;
  }
  if (prefix && !id.startsWith(prefix)) {
    errors.push(`${source}: id "${id}" must start with "${prefix}"`);
    return;
  }
  set.add(id);
}

function checkRef(set, id, source, errors) {
  if (typeof id !== "string" || !id.trim()) {
    errors.push(`${source}: empty reference`);
    return false;
  }
  if (!set.has(id)) {
    errors.push(`${source}: missing reference "${id}"`);
    return false;
  }
  return true;
}

function collectPathologyGraph(graph, sourceName, sets, errors) {
  asArray(graph.records).forEach((record, index) => {
    addId(sets.westernConditions, record.id, `${sourceName}.records[${index}]`, errors, "western_condition.");
  });

  asArray(graph.western_conditions).forEach((record, index) => {
    addId(sets.westernConditions, record.id, `${sourceName}.western_conditions[${index}]`, errors, "western_condition.");
  });

  asArray(graph.eastern_diseases).forEach((record, index) => {
    addId(sets.easternDiseases, record.id, `${sourceName}.eastern_diseases[${index}]`, errors, "eastern_disease.");
  });

  asArray(graph.tcm_patterns).forEach((record, index) => {
    addId(sets.patterns, record.id, `${sourceName}.tcm_patterns[${index}]`, errors, "pattern.");
  });
}

function collectAcupoints(filePath, set) {
  const data = readJson(filePath);
  const points = Array.isArray(data) ? data : asArray(data.points);
  points.forEach((point) => {
    if (typeof point.code === "string" && point.code.trim()) {
      set.add(point.code);
    }
  });
}

function collectClinicalDecisionLinks(filePath, sets, errors) {
  if (!fs.existsSync(path.join(ROOT, filePath))) return;
  const data = readJson(filePath);
  asArray(data.records).forEach((record, index) => {
    addId(sets.workflows, record.id, `${filePath}.records[${index}]`, errors);
  });
}

function collectFormulaIds(set, errors) {
  const formulas = readJson("data/herbs/formulas.json");
  asArray(formulas.records).forEach((record, index) => {
    addId(set, record.id, `data/herbs/formulas.json.records[${index}]`, errors, "formula.");
  });

  const shortlist = readJson("data/herbs/formula_canon_shortlist.json");
  asArray(shortlist.records).forEach((record, index) => {
    if (typeof record.id === "string" && record.id.trim()) {
      set.add(record.id);
      if (!record.id.startsWith("formula.")) {
        errors.push(`data/herbs/formula_canon_shortlist.json.records[${index}]: id "${record.id}" must start with "formula."`);
      }
    }
  });
}

function validateComparisons(sets, counters, errors) {
  const rel = "data/knowledge/comparisons.json";
  if (!fs.existsSync(path.join(ROOT, rel))) return;
  // Comparisons reference the full pattern universe (pattern_library's 50 +
  // the older graph patterns already in sets.patterns), not just the ~9 in
  // the pathology graph files.
  const patternUniverse = new Set(sets.patterns);
  asArray(readJson("data/pathology/pattern_library.json").records)
    .forEach((r) => { if (r.id) patternUniverse.add(r.id); });
  const data = readJson(rel);
  asArray(data.records).forEach((record, index) => {
    const base = `${rel}.records[${index}]`;
    counters.comparisonRecords += 1;
    if (typeof record.id !== "string" || !record.id.startsWith("cmp.")) {
      errors.push(`${base}.id: "${record.id}" must start with "cmp."`);
    }
    if (record.type !== "comparison") {
      errors.push(`${base}.type: expected "comparison"`);
    }
    if (!["owner", "model_draft"].includes(record.authored_by)) {
      errors.push(`${base}.authored_by: expected "owner" or "model_draft"`);
    }
    if (record.status !== "draft" && record.review_status !== "deprecated") {
      errors.push(`${base}.status: expected "draft" unless review_status is "deprecated"`);
    }
    if (!["draft", "deprecated"].includes(record.review_status)) {
      errors.push(`${base}.review_status: expected "draft" or "deprecated"`);
    }
    if (record.source_condition_id) {
      counters.comparisonSourceConditionLinks += 1;
      checkRef(sets.westernConditions, record.source_condition_id, `${base}.source_condition_id`, errors);
    }
    const dimensions = asArray(record.dimensions);
    if (!dimensions.length) errors.push(`${base}.dimensions: a comparison needs at least one dimension`);
    const compares = asArray(record.compares);
    if (compares.length < 2) errors.push(`${base}.compares: a comparison needs >= 2 patterns`);
    compares.forEach((id) => {
      counters.comparisonPatternLinks += 1;
      checkRef(patternUniverse, id, `${base}.compares`, errors);
      if (!record.cells || typeof record.cells[id] !== "object" || Array.isArray(record.cells[id])) {
        errors.push(`${base}.cells.${id}: missing cell object for compared pattern`);
      } else {
        dimensions.forEach((dimension) => {
          if (!Object.prototype.hasOwnProperty.call(record.cells[id], dimension)) {
            errors.push(`${base}.cells.${id}: missing dimension "${dimension}"`);
          } else if (typeof record.cells[id][dimension] !== "string") {
            errors.push(`${base}.cells.${id}.${dimension}: expected string value`);
          }
        });
      }
    });
    // every cells key must be one of the compared patterns
    Object.keys(record.cells || {}).forEach((key) => {
      if (!compares.includes(key)) errors.push(`${base}.cells: "${key}" is not in compares[]`);
    });
  });
}

function validatePathologyGraph(graph, sourceName, sets, counters, errors) {
  const westernRecords = asArray(graph.records).concat(asArray(graph.western_conditions));

  westernRecords.forEach((record, index) => {
    const base = `${sourceName}.western[${index}]`;
    asArray(record.medication_links).forEach((id) => {
      counters.medicationLinks += 1;
      checkRef(sets.medications, id, `${base}.medication_links`, errors);
    });
    asArray(record.workflow_links).forEach((id) => {
      counters.workflowLinks += 1;
      checkRef(sets.workflows, id, `${base}.workflow_links`, errors);
    });
    asArray(record.related_eastern_diseases).forEach((id) => {
      counters.westernEasternLinks += 1;
      checkRef(sets.easternDiseases, id, `${base}.related_eastern_diseases`, errors);
    });
    asArray(record.related_tcm_patterns).forEach((id) => {
      counters.westernPatternLinks += 1;
      checkRef(sets.patterns, id, `${base}.related_tcm_patterns`, errors);
    });
  });

  asArray(graph.tcm_patterns).forEach((record, index) => {
    const base = `${sourceName}.tcm_patterns[${index}]`;
    asArray(record.seed_acupoints).forEach((code) => {
      counters.acupointLinks += 1;
      checkRef(sets.acupoints, code, `${base}.seed_acupoints`, errors);
    });
    asArray(record.seed_formulas).forEach((id) => {
      counters.formulaLinks += 1;
      checkRef(sets.formulas, id, `${base}.seed_formulas`, errors);
    });
  });

  const relationLinks = graph.relation_links || graph.links || {};
  asArray(relationLinks.western_to_eastern).forEach((link, index) => {
    const westernId = Array.isArray(link) ? link[0] : link.western_condition_id;
    const easternId = Array.isArray(link) ? link[1] : link.eastern_disease_id;
    counters.westernEasternLinks += 1;
    checkRef(sets.westernConditions, westernId, `${sourceName}.western_to_eastern[${index}].western`, errors);
    checkRef(sets.easternDiseases, easternId, `${sourceName}.western_to_eastern[${index}].eastern`, errors);
  });

  asArray(relationLinks.western_to_patterns).forEach((link, index) => {
    const westernId = Array.isArray(link) ? link[0] : link.western_condition_id;
    const patternId = Array.isArray(link) ? link[1] : link.pattern_id;
    counters.westernPatternLinks += 1;
    checkRef(sets.westernConditions, westernId, `${sourceName}.western_to_patterns[${index}].western`, errors);
    checkRef(sets.patterns, patternId, `${sourceName}.western_to_patterns[${index}].pattern`, errors);
  });
}

function validateFormulaPatternLinks(sets, counters, errors) {
  const links = readJson("data/herbs/formula_pattern_links.json");
  const safety = readJson("data/herbs/formula_safety_flags.json");
  const safetyIds = new Set(asArray(safety.flags).map((flag) => flag.id).filter(Boolean));

  asArray(links.records).forEach((record, index) => {
    const base = `data/herbs/formula_pattern_links.json.records[${index}]`;
    counters.formulaLinks += 1;
    checkRef(sets.formulas, record.formula_id, `${base}.formula_id`, errors);

    asArray(record.pattern_ids).forEach((id) => {
      counters.patternLinks += 1;
      checkRef(sets.patterns, id, `${base}.pattern_ids`, errors);
    });
    asArray(record.western_condition_ids).forEach((id) => {
      counters.westernConditionLinks += 1;
      checkRef(sets.westernConditions, id, `${base}.western_condition_ids`, errors);
    });
    asArray(record.acupoint_seed_codes).forEach((code) => {
      counters.acupointLinks += 1;
      checkRef(sets.acupoints, code, `${base}.acupoint_seed_codes`, errors);
    });
    asArray(record.fertility_workflow_links).forEach((id) => {
      counters.workflowLinks += 1;
      checkRef(sets.workflows, id, `${base}.fertility_workflow_links`, errors);
    });
    asArray(record.safety_flag_ids).forEach((id) => {
      counters.safetyFlagLinks += 1;
      checkRef(safetyIds, id, `${base}.safety_flag_ids`, errors);
    });

    if (record.review_status !== "draft_index") {
      errors.push(`${base}.review_status: expected "draft_index"`);
    }
    if (record.source_status !== "needs_professional_source_review") {
      errors.push(`${base}.source_status: expected "needs_professional_source_review"`);
    }
    if (record.public_safe !== false) {
      errors.push(`${base}.public_safe: expected false`);
    }
  });
}

function validateFormulaCanon(sets, counters, errors) {
  const shortlist = readJson("data/herbs/formula_canon_shortlist.json");
  asArray(shortlist.records).forEach((record, index) => {
    const base = `data/herbs/formula_canon_shortlist.json.records[${index}]`;
    asArray(record.related_formulas).forEach((id) => {
      counters.relatedFormulaLinks += 1;
      checkRef(sets.formulas, id, `${base}.related_formulas`, errors);
      if (id === record.id) {
        errors.push(`${base}.related_formulas: self link "${id}"`);
      }
    });
  });
}

function validateWorkflows(workflowFile, sets, counters, errors) {
  const data = readJson(workflowFile);
  asArray(data.workflows).forEach((workflow, index) => {
    const base = `${workflowFile}.workflows[${index}]`;
    asArray(workflow.western_condition_links).forEach((id) => {
      counters.westernConditionLinks += 1;
      checkRef(sets.westernConditions, id, `${base}.western_condition_links`, errors);
    });
    asArray(workflow.common_medication_links).forEach((id) => {
      counters.medicationLinks += 1;
      checkRef(sets.medications, id, `${base}.common_medication_links`, errors);
    });
    asArray(workflow.tcm_pattern_watchlist).forEach((id) => {
      const normalized = id.startsWith("pattern.") ? id : `pattern.${id}`;
      counters.patternLinks += 1;
      checkRef(sets.patterns, normalized, `${base}.tcm_pattern_watchlist`, errors);
    });
    asArray(workflow.acupoint_seed_links).forEach((code) => {
      counters.acupointLinks += 1;
      checkRef(sets.acupoints, code, `${base}.acupoint_seed_links`, errors);
    });
    asArray(workflow.formula_seed_links).forEach((id) => {
      counters.formulaLinks += 1;
      checkRef(sets.formulas, id, `${base}.formula_seed_links`, errors);
    });
  });
}

function validateConditionCrosswalk(counters, errors, warnings) {
  const crosswalkPath = "data/interop/condition_crosswalk.json";
  if (!fs.existsSync(path.join(ROOT, crosswalkPath))) return;

  const canon = readJson("data/pathology/condition_canon_shortlist.json");
  const canonById = new Map(asArray(canon.records).map((record) => [record.id, record]));
  const tdis = readJson("data/pathology/tdis_registry.json");
  const tdisIds = new Set(asArray(tdis.records).map((record) => record.id).filter(Boolean));

  const crosswalk = readJson(crosswalkPath);
  asArray(crosswalk.records).forEach((record, index) => {
    const base = `${crosswalkPath}.records[${index}]`;
    counters.crosswalkRecords += 1;

    const canonRecord = canonById.get(record.condition_id);
    if (!canonRecord) {
      errors.push(`${base}.condition_id: missing reference "${record.condition_id}"`);
      return;
    }
    const expectedId = "xwalk." + String(record.condition_id).replace(/^cond\./, "");
    if (record.id !== expectedId) {
      errors.push(`${base}.id: "${record.id}" should be "${expectedId}"`);
    }
    if (!Array.isArray(record.cpt_placeholder)) {
      errors.push(`${base}.cpt_placeholder: reserved array must be present`);
    }
    if (typeof record.insurance_placeholder !== "object" || record.insurance_placeholder === null || Array.isArray(record.insurance_placeholder)) {
      errors.push(`${base}.insurance_placeholder: reserved object must be present`);
    }
    asArray(record.tcm_dictionary_refs).forEach((ref, refIndex) => {
      counters.crosswalkDictionaryRefs += 1;
      checkRef(tdisIds, ref.tdis_id, `${base}.tcm_dictionary_refs[${refIndex}].tdis_id`, errors);
    });
    const primaryIcd = asArray(record.icd10)[0]?.code || "";
    if (canonRecord.icd_hint && primaryIcd && canonRecord.icd_hint !== primaryIcd) {
      warnings.push(`${base}.icd10: "${primaryIcd}" disagrees with canon icd_hint "${canonRecord.icd_hint}"`);
    }
  });
}

function main() {
  const errors = [];
  const warnings = [];
  const counters = {
    acupointLinks: 0,
    comparisonRecords: 0,
    comparisonPatternLinks: 0,
    comparisonSourceConditionLinks: 0,
    crosswalkRecords: 0,
    crosswalkDictionaryRefs: 0,
    formulaLinks: 0,
    medicationLinks: 0,
    patternLinks: 0,
    relatedFormulaLinks: 0,
    safetyFlagLinks: 0,
    westernConditionLinks: 0,
    westernEasternLinks: 0,
    westernPatternLinks: 0,
    workflowLinks: 0
  };

  const sets = {
    acupoints: new Set(),
    easternDiseases: new Set(),
    formulas: new Set(),
    medications: new Set(),
    patterns: new Set(),
    westernConditions: new Set(),
    workflows: new Set()
  };

  collectAcupoints("data/acupoints/361.json", sets.acupoints);
  [
    "data/acupoints/embedded/starter_points.json",
    "data/acupoints/embedded/professional_points.json",
    "data/acupoints/embedded/meridian_bl.json",
    "data/acupoints/embedded/meridian_ht.json",
    "data/acupoints/embedded/meridian_ki.json",
    "data/acupoints/embedded/meridian_li.json",
    "data/acupoints/embedded/meridian_lu.json",
    "data/acupoints/embedded/meridian_si.json",
    "data/acupoints/embedded/meridian_sp.json",
    "data/acupoints/embedded/meridian_st.json"
  ].forEach((filePath) => collectAcupoints(filePath, sets.acupoints));

  collectFormulaIds(sets.formulas, errors);

  const medications = readJson("data/medications/western_medications.json");
  asArray(medications.records).forEach((record, index) => {
    addId(sets.medications, record.id, `data/medications/western_medications.json.records[${index}]`, errors, "med.");
  });

  const workflows = readJson("data/clinical_cases/fertility_workflow_seed.json");
  asArray(workflows.workflows).forEach((workflow, index) => {
    addId(sets.workflows, workflow.id, `data/clinical_cases/fertility_workflow_seed.json.workflows[${index}]`, errors, "fertility.workflow.");
  });
  collectClinicalDecisionLinks("data/clinical_cases/clinical_decision_links.json", sets, errors);

  const pathologyFiles = [
    "data/pathology/conditions.json",
    "data/pathology/condition_graph_expansion.json",
    "data/pathology/clinical_graph_seed.json"
  ];
  const pathologyGraphs = pathologyFiles.map((filePath) => [filePath, readJson(filePath)]);
  pathologyGraphs.forEach(([filePath, graph]) => collectPathologyGraph(graph, filePath, sets, errors));

  pathologyGraphs.forEach(([filePath, graph]) => validatePathologyGraph(graph, filePath, sets, counters, errors));
  validateFormulaPatternLinks(sets, counters, errors);
  validateFormulaCanon(sets, counters, errors);
  validateWorkflows("data/clinical_cases/fertility_workflow_seed.json", sets, counters, errors);
  validateConditionCrosswalk(counters, errors, warnings);
  validateComparisons(sets, counters, errors);

  if (warnings.length) {
    console.warn("Relation validation warnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (errors.length) {
    console.error("Relation validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Relation validation passed.");
  console.log(JSON.stringify({
    ids: {
      western_conditions: sets.westernConditions.size,
      eastern_diseases: sets.easternDiseases.size,
      tcm_patterns: sets.patterns.size,
      formulas: sets.formulas.size,
      western_medications: sets.medications.size,
      acupoints: sets.acupoints.size,
      fertility_workflows: sets.workflows.size
    },
    checked_links: counters
  }, null, 2));
}

main();

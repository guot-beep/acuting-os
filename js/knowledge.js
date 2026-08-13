/**
 * knowledge.js — renders real records from data/generated/knowledge_data.js
 * into the Formula, Condition, Sources, and Quality sections.
 *
 * Source of truth: data/herbs/formulas.json, data/pathology/conditions.json,
 * data/sources/source_registry.json, data/audits/missing_report.json.
 * Edit those, run `node scripts/build-data.js`, refresh.
 */
(function () {
  const K = globalThis.ACUTING_KNOWLEDGE;
  const CONTENT_MODE_KEY = "acuting-content-mode-v1";

  function el(id) { return document.getElementById(id); }
  function isEnglishMode() {
    try {
      return (document.body && document.body.dataset && document.body.dataset.contentMode === "english") || (typeof localStorage !== "undefined" && localStorage && localStorage.getItem(CONTENT_MODE_KEY) === "english");
    } catch (e) {
      return false;
    }
  }
  function modeText(bilingual, english) {
    return isEnglishMode() ? english : bilingual;
  }
  function displayLabel(zh, en, fallback = "") {
    const cleanZh = String(zh || "").trim();
    const cleanEn = String(en || "").trim();
    if (isEnglishMode()) return cleanEn || cleanZh || fallback;
    return cleanZh && cleanEn ? `${cleanZh} \u00B7 ${cleanEn}` : (cleanZh || cleanEn || fallback);
  }
  function applyKnowledgeModeText() {
    const formulaFilter = el("formulaFilter");
    if (formulaFilter) formulaFilter.placeholder = modeText("搜尋方劑、拼音、分類、證型、現代標籤… Search formula, pinyin, category, pattern...", "Search formulas, pinyin, category, patterns, modern tags...");
    const herbFilter = el("herbFilter");
    if (herbFilter) herbFilter.placeholder = modeText("搜尋中藥、拼音、功效、主治、方劑… Search herb, pinyin, action, indication...", "Search herbs, pinyin, actions, indications, formulas...");
    const comparisonFilter = el("comparisonFilter");
    if (comparisonFilter) comparisonFilter.placeholder = modeText("搜尋鑑別表、證型、比較軸… Search comparison, pattern, axis", "Search comparisons, patterns, axes...");
    const conditionFilter = el("conditionFilter");
    if (conditionFilter) conditionFilter.placeholder = modeText("搜尋病名、證型、別名、拼音、ICD...", "Search diagnosis names, patterns, aliases, pinyin, ICD...");
  }
  document.addEventListener("acuting:content-mode", applyKnowledgeModeText);
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function tag(t) { return `<span class="k-tag">${esc(t)}</span>`; }
  function asList(values) {
    if (Array.isArray(values)) return values;
    if (values == null || values === "") return [];
    return [values];
  }

  /* Modern application tags were rendering as raw snake_case keys — common_cold,
     uri, chills_body_ache_context. Those are internal identifiers, not content.
     data/config/modern_application_vocabulary.json maps every tag to a bilingual
     label plus a type, so a tag can be shown properly and routed to the right
     section. Source strings are never renamed (DECISIONS D1); resolution happens
     here at display time, which also collapses the ~18 cough / cough_context
     duplicate pairs onto one concept. */
  const MODERN_VOCAB = (() => {
    const v = K && K.modernApplicationVocabulary;
    const byKey = new Map();
    (v && v.concepts ? v.concepts : []).forEach((c) => {
      byKey.set(c.id, c);
      (c.aliases || []).forEach((a) => byKey.set(a, c));
    });
    return byKey;
  })();

  /* Bidirectional browsing: tap any tag and see everything carrying it.
     Filtering on the concept, not the raw string, is what makes this correct -
     搜尋「感冒」would otherwise miss records tagged uri or chills_body_ache_context,
     since those are aliases of the same concept. Same pattern as the 特定穴
     filter on the point directory. */
  let activeConcept = null;
  const conceptListeners = new Set();
  function setActiveConcept(id) {
    activeConcept = activeConcept === id ? null : id;
    conceptListeners.forEach((fn) => fn());
  }
  function recordHasConcept(tags, conceptId) {
    if (!conceptId) return true;
    return (tags || []).some((t) => resolveModernTag(t).id === conceptId);
  }
  function conceptLabel(id) {
    const c = MODERN_VOCAB.get(id);
    if (!c) return id;
    return displayLabel(c.name_zh, c.name_en, id);
  }
  function activeConceptBar() {
    if (!activeConcept) return "";
    return `<div class="k-active-filter">${esc(modeText("篩選中", "Filtering"))} <strong>${esc(conceptLabel(activeConcept))}</strong>
      <button type="button" data-concept-clear>${esc(modeText("清除 Clear", "Clear"))}</button></div>`;
  }
  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-concept-id]");
    if (chip) { setActiveConcept(chip.dataset.conceptId); return; }
    if (e.target.closest("[data-concept-clear]")) { setActiveConcept(null); }
    // 我的病例 row → open that case in the case workspace. app.js owns the store
    // and the navigation; this only asks.
    const caseBtn = e.target.closest("[data-case-open]");
    if (caseBtn && window.AcuTingCases && window.AcuTingCases.open) {
      document.querySelector("[data-detail-close]")?.click();   // same idiom the formula chips use
      window.AcuTingCases.open(caseBtn.dataset.caseOpen);
    }
  });

  function resolveModernTag(raw) {
    const hit = MODERN_VOCAB.get(String(raw));
    if (hit) return hit;
    // Unmapped tag: still never show the raw key. Humanise it and flag it.
    const label = String(raw || "").replace(/_context$/, "").replace(/_/g, " ").trim();
    return { id: String(raw), name_zh: "", name_en: label.charAt(0).toUpperCase() + label.slice(1), type: "unmapped" };
  }

  /* Renders modern tags grouped by type. Conditions and symptoms show; TCM
     patterns are labelled as patterns because they were mis-filed here and are
     not modern applications; internal workflow states never render at all. */
  function modernTagChips(values) {
    const groups = { condition: [], symptom: [], pattern: [], unmapped: [] };
    (values || []).forEach((raw) => {
      const c = resolveModernTag(raw);
      if (c.type === "internal") return;
      (groups[c.type] || groups.unmapped).push(c);
    });
    const dedupe = (arr) => [...new Map(arr.map((c) => [c.id, c])).values()];
    const chip = (c, cls) => {
      const text = displayLabel(c.name_zh, c.name_en, c.id);
      const on = activeConcept === c.id ? " is-active" : "";
      return `<button type="button" class="k-modern-chip ${cls}${on}" data-concept-id="${esc(c.id)}"
        title="顯示所有含此項目的方劑與中藥">${esc(text)}</button>`;
    };
    const block = (labelZh, labelEn, arr, cls) => {
      if (!arr.length) return "";
      return `<div class="k-modern-group"><span class="k-modern-group-label">${esc(labelZh)} <small>${esc(labelEn)}</small></span>${dedupe(arr).map((c) => chip(c, cls)).join("")}</div>`;
    };
    const out = [
      block("現代病名", "Conditions", groups.condition, "is-condition"),
      block("症狀", "Symptoms", groups.symptom, "is-symptom"),
      block("證型", "TCM patterns", groups.pattern, "is-pattern"),
      block("其他", "Other", groups.unmapped, "is-unmapped")
    ].join("");
    return out || '<p class="k-detail-empty">—</p>';
  }

  function modernInlineChips(values, limit = 6) {
    const seen = new Set();
    const chips = [];
    (values || []).forEach((raw) => {
      const c = resolveModernTag(raw);
      if (c.type === "internal" || seen.has(c.id) || chips.length >= limit) return;
      seen.add(c.id);
      const on = activeConcept === c.id ? " is-active" : "";
      chips.push(`<button type="button" class="k-modern-chip is-inline ${c.type ? `is-${esc(c.type)}` : ""}${on}" data-concept-id="${esc(c.id)}">${esc(displayLabel(c.name_zh, c.name_en, c.id))}</button>`);
    });
    return chips.join("");
  }

  const EXTERIOR_CONTEXTS = [
    {
      id: "wind_cold",
      zh: "風寒感冒",
      en: "Wind-Cold cold",
      cls: "is-wind-cold",
      terms: ["風寒", "外感風寒", "寒邪襲表", "寒邪束表", "wind-cold", "wind cold"]
    },
    {
      id: "wind_heat",
      zh: "風熱感冒",
      en: "Wind-Heat cold",
      cls: "is-wind-heat",
      terms: ["風熱", "外感風熱", "溫病初起", "溫熱初起", "wind-heat", "wind heat"]
    },
    {
      id: "summerheat_damp",
      zh: "暑濕感冒",
      en: "Summerheat-Damp cold",
      cls: "is-summerheat-damp",
      terms: ["暑濕", "暑邪", "夏月", "陰暑", "summerheat", "summer heat"]
    },
    {
      id: "exterior_deficiency",
      zh: "表虛感冒",
      en: "Exterior-deficiency",
      cls: "is-exterior-deficiency",
      terms: ["表虛", "營衛不和", "exterior deficiency", "ying-wei"]
    },
    {
      id: "exterior_excess",
      zh: "表實感冒",
      en: "Exterior-excess",
      cls: "is-exterior-excess",
      terms: ["表實", "風寒表實", "exterior excess", "excess exterior"]
    },
    {
      id: "wind_cold_lung",
      zh: "風寒束肺",
      en: "Wind-Cold constraining Lung",
      cls: "is-wind-cold-lung",
      terms: ["風寒束肺", "外寒內飲", "寒飲", "咳吐清稀", "wind-cold cough", "cold-phlegm", "exterior cold with internal", "internal thin fluids"]
    }
  ];

  function recordTextForContext(record) {
    const fields = [
      record.category,
      record.category_zh,
      record.category_en,
      ...(record.condition_tags_zh || []),
      ...(record.condition_tags_en || []),
      ...(record.indications_zh || []),
      ...(record.indications_en || []),
      ...(record.pattern_focus_zh || []),
      ...(record.pattern_focus_en || []),
      ...(record.pattern_indications_zh || []),
      ...(record.pattern_indications_en || []),
      ...(record.syndromes_zh || []),
      ...(record.syndromes_en || [])
    ];
    return fields.filter(Boolean).join(" ").toLowerCase();
  }

  function exteriorContextChips(record) {
    const modern = [
      ...(record.modern_use_tags || []),
      ...(record.modern_clinical_use_tags || [])
    ].map((raw) => resolveModernTag(raw).id);
    const text = recordTextForContext(record);
    const hasColdSearchTag = modern.includes("common_cold") || /感冒|common cold|外感|表證|解表|release exterior/.test(text);
    if (!hasColdSearchTag) return "";
    const matched = EXTERIOR_CONTEXTS.filter((ctx) => ctx.terms.some((term) => text.includes(term.toLowerCase())));
    if (!matched.length) return `<span class="k-pattern-chip is-unspecified">${esc(modeText("感冒類：待辨風寒/風熱", "Cold/URI: pattern unspecified"))}</span>`;
    return matched.map((ctx) => `<span class="k-pattern-chip ${esc(ctx.cls)}">${esc(displayLabel(ctx.zh, ctx.en, ctx.id))}</span>`).join("");
  }
  /* 相關病名與證型 was printing raw ids (pattern.spleen_qi_deficiency). The
     registries already carry bilingual names — the pattern library has 脾氣虛 /
     Spleen Qi Deficiency — they were simply never resolved at display time. */
  const ENTITY_NAMES = (() => {
    const map = new Map();
    const add = (list) => {
      const arr = Array.isArray(list) ? list : (list && Object.values(list).find(Array.isArray)) || [];
      arr.forEach((r) => { if (r && r.id) map.set(r.id, r); });
    };
    if (K) {
      add(K.patternLibrary);
      add(K.conditionCanon);
      add(K.conditions);
      add(K.tdisRegistry);
      add(K.symptoms);
    }
    return map;
  })();

  function entityLabel(id) {
    const r = ENTITY_NAMES.get(id);
    if (r) {
      const zh = r.name_zh || "";
      const en = r.name_en || "";
      return displayLabel(zh, en, id);
    }
    // Unknown id: humanise rather than expose the key.
    return String(id).replace(/^[a-z_]+\./, "").replace(/_/g, " ")
      .replace(/^\w/, (m) => m.toUpperCase());
  }

  function entityKindLabel(id) {
    const p = String(id).split(".")[0];
    return p === "pattern" ? "證型" : p === "eastern_disease" ? "中醫病名"
      : p === "western_condition" || p === "cond" ? "西醫病名" : "";
  }

  function entityChips(ids) {
    const list = (ids || []).filter(Boolean);
    if (!list.length) return '<p class="k-detail-empty">—</p>';
    return list.map((id) => {
      const kind = entityKindLabel(id);
      return `<span class="k-entity-chip">${kind ? `<small>${esc(kind)}</small>` : ""}${esc(entityLabel(id))}</span>`;
    }).join("");
  }

  /* sym.* chips. An id with no card behind it says so, rather than rendering
     as if a symptom card existed (only 3 sym.* records exist today). */
  const SYMPTOM_IDS = new Set((((K && K.symptoms && K.symptoms.records) || [])).map((r) => r.id));
  function symptomChips(ids) {
    const list = (ids || []).filter(Boolean);
    if (!list.length) return "";
    return list.map((id) => SYMPTOM_IDS.has(id)
      ? `<span class="k-entity-chip"><small>症狀</small>${esc(entityLabel(id))}</span>`
      : `<span class="k-entity-chip is-unresolved" title="${esc(id)} — 尚無症狀卡 / no symptom card yet"><small>症狀</small>${esc(entityLabel(id))} ⚠</span>`
    ).join("");
  }

  /* ⚠ LABEL RESOLVERS — DO NOT let a render-site rewrite drop these calls.
     Raw snake_case keys must NEVER reach the screen. If you rewrite a section
     that shows a comparison_group or safety_flags, keep the resolver call.
     (comparisonGroupLabel was lost once in a merge and shipped raw keys.) */
  const COMPARE_VOCAB = new Map(
    ((K && K.comparisonGroupVocabulary && K.comparisonGroupVocabulary.groups) || []).map((g) => [g.id, g])
  );
  /* 方歌 — the rhymed mnemonic for the formula. Not every formula has one, and
   * Ting asked for it to appear only when we actually have it, so this renders
   * nothing at all rather than a 待補 placeholder. */
  function formulaSongSection(record) {
    const song = usableText(record.formula_song_zh || record.formula_song || record.fang_ge_zh);
    if (!song) return "";
    const note = usableText(record.formula_song_source_zh);
    return `
      <section class="k-detail-block k-formula-song">
        <h3>方歌 <span class="k-detail-en">Mnemonic verse</span></h3>
        <p class="k-song-text">${esc(song).replace(/\n/g, "<br>")}</p>
        ${note ? `<p class="k-detail-note">${esc(note)}</p>` : ""}
      </section>`;
  }

  /* The herb names for the summary tile. Long formulas would overflow it, so
   * past a dozen ingredients the rest collapse into a count — the full list is
   * still rendered in the composition section below. */
  function compositionSummary(composition) {
    const items = Array.isArray(composition) ? composition : [];
    if (!items.length) return "待補";
    const names = items
      .map((item) => item?.herb_zh || item?.pinyin || item?.herb_en)
      .filter(Boolean);
    if (!names.length) return `${items.length} 味`;
    const shown = names.slice(0, 12).join("、");
    return names.length > 12
      ? `${shown} … 共 ${names.length} 味`
      : `${shown}（${names.length} 味）`;
  }

  function comparisonGroupLabel(id) {
    if (!id) return "";
    const g = COMPARE_VOCAB.get(String(id).trim());
    return g ? displayLabel(g.name_zh, g.name_en, id) : String(id).replace(/_/g, " ");
  }

  const SAFETY_VOCAB = new Map(
    ((K && K.safetyFlagVocabulary && K.safetyFlagVocabulary.flags) || []).map((f) => [f.id, f])
  );
  function safetyFlagLabel(flag) {
    const f = SAFETY_VOCAB.get(String(flag).trim());
    return f ? displayLabel(f.name_zh, f.name_en, flag) : String(flag).replace(/_/g, " ");
  }
  function safetyList(flags) {
    return (flags || []).map(safetyFlagLabel);
  }

  /* 藥對. A pair belongs to both herbs and is the unit formulas are built from,
     so it renders on the formula card and on each member herb's card — the
     chain is 方劑 → 藥對 → 單味藥, navigable in every direction.
     Where a formula has no explicit key_pairs yet, pairs whose members are all
     present in its composition are surfaced as candidates and labelled as such,
     so the section is useful before every formula has been curated. */
  const PAIRS = (() => {
    const d = K && K.herbPairs;
    return (d && d.pairs) ? d.pairs : [];
  })();
  const PAIR_RELATIONS = (() => {
    const d = K && K.herbPairRelations;
    const m = new Map();
    ((d && d.relations) || []).forEach((r) => m.set(r.id, r));
    return m;
  })();

  function pairCard(pair, derived) {
    const rel = PAIR_RELATIONS.get(pair.relation);
    const relLabel = rel ? `${rel.name_zh} · ${rel.name_en}` : "";
    const warn = rel && rel.safety_critical;
    const members = (pair.herbs || []).map((id) => {
      const h = herbById.get(id);
      const label = h ? `${h.name_zh || h.pinyin} · ${h.pinyin || ""}`.trim() : id.replace(/^herb\./, "");
      return h ? relationButton(h.id, label, "herb") : `<span class="k-static-chip">${esc(label)}</span>`;
    }).join('<span class="k-pair-plus">＋</span>');
    return `<article class="k-pair${warn ? " is-warning" : ""}">
      <header>
        <div class="k-pair-members">${members}</div>
        ${relLabel ? `<span class="k-pair-relation${warn ? " is-warning" : ""}">${esc(relLabel)}</span>` : ""}
        ${derived ? '<span class="k-pair-derived">依組成推得 · derived from composition</span>' : ""}
      </header>
      ${pair.pair_meaning_zh ? `<p class="k-pair-meaning">${esc(pair.pair_meaning_zh)}</p>` : ""}
      ${pair.pair_meaning_en ? `<p class="k-pair-meaning-en">${esc(pair.pair_meaning_en)}</p>` : ""}
      ${pair.indication_zh ? `<p class="k-pair-line"><strong>主治</strong> ${esc(pair.indication_zh)}</p>` : ""}
      ${pair.caution_zh ? `<p class="k-pair-line k-pair-caution"><strong>注意</strong> ${esc(pair.caution_zh)}</p>` : ""}
      ${pair.teaching_note_zh ? `<p class="k-pair-line k-pair-teach"><strong>學習提示</strong> ${esc(pair.teaching_note_zh)}</p>` : ""}
    </article>`;
  }

  function formulaPairsSection(record) {
    const explicit = (record.key_pairs || []).map((id) => PAIRS.find((p) => p.id === id)).filter(Boolean);
    let derived = [];
    if (!explicit.length) {
      const inFormula = new Set((record.composition || []).map((c) =>
        c.herb_id || `herb.${normalizeKey(c.pinyin)}`));
      derived = PAIRS.filter((p) => (p.herbs || []).length && p.herbs.every((h) => inFormula.has(h)));
    }
    const list = explicit.length ? explicit : derived;
    if (!list.length) {
      return '<p class="k-detail-empty">此方尚未建立藥對 / No herb pairs recorded for this formula yet.</p>';
    }
    const note = record.key_pairs_note_zh ? `<p class="k-pair-note">${esc(record.key_pairs_note_zh)}</p>` : "";
    return note + `<div class="k-pair-list">${list.map((p) => pairCard(p, !explicit.length)).join("")}</div>`;
  }

  function herbPairsSection(record) {
    const list = PAIRS.filter((p) => (p.herbs || []).includes(record.id));
    if (!list.length) return '<p class="k-detail-empty">尚未建立此藥的藥對 / No herb pairs recorded yet.</p>';
    return `<div class="k-pair-list">${list.map((p) => pairCard(p, false)).join("")}</div>`;
  }

  function statusPill(status) {
    return `<span class="k-status k-status-${esc(status)}">${esc(status || "draft")}</span>`;
  }

  if (!K) {
    ["formulaRecords", "herbRecords", "pharmRecords", "comparisonRecords", "conditionRecords", "sourceRegistry", "auditFileStrip"].forEach((id) => {
      const host = el(id);
      if (host) host.innerHTML = '<p class="k-missing">⚠ knowledge_data.js 未載入（請確認檔案已同步後 Ctrl+F5）。</p>';
    });
    return;
  }

  const formulas = (K.formulas && K.formulas.records) || [];
  const herbs = (K.herbs && K.herbs.records) || [];
  // 藥理四層。分類/標的/系統各自成表,單藥卡要靠它們把 id 換成名字 ——
  // 少帶一個,卡片上就會出現 drugclass.loop_diuretics 這種字串。
  const pharmDrugs = (K.pharmDrugs && K.pharmDrugs.records) || [];
  const pharmClassById = new Map(((K.pharmDrugClasses && K.pharmDrugClasses.records) || []).map((c) => [c.id, c]));
  const pharmTargetById = new Map(((K.pharmDrugTargets && K.pharmDrugTargets.records) || []).map((t) => [t.id, t]));
  const formulaById = new Map(formulas.map((record) => [record.id, record]));
  const herbById = new Map(herbs.map((record) => [record.id, record]));

  function normalizeKey(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }

  const herbByPinyin = new Map(herbs.map((record) => [normalizeKey(record.pinyin), record]));
  const herbByNameZh = new Map(herbs.map((record) => [record.name_zh, record]));

  // 2026-08-12:\u52A0\u5165\u4F54\u4F4D\u5B57\u4E32\u904E\u6FFE\u3002usableText \u539F\u672C\u53EA\u64CB ?? \u8207 U+FFFD,\u65BC\u662F\u532F\u5165
  // \u7559\u4E0B\u7684\u82F1\u6587\u8349\u7A3F\u6703\u88AB\u7576\u6210\u5167\u5BB9\u6E32\u67D3 \u2014\u2014 herb.zhe_bei_mu \u8207 herb.zhi_ke \u7684
  // \u300C\u6027\u5473\u300D\u6B04\u76EE\u524D\u986F\u793A\u7684\u662F "Draft: warm/cool/bitter/acrid depending on herb;
  // verify individual taste and temperature."\u3002\u90A3\u4E0D\u662F\u5F85\u9A57\u8B49\u7684\u5167\u5BB9,\u90A3\u662F
  // \u300C\u9084\u6C92\u6709\u4EBA\u5BEB\u300D\u7684\u81EA\u767D,\u986F\u793A\u5B83\u6BD4\u7559\u767D\u66F4\u7CDF:\u8B80\u7684\u4EBA\u6703\u4EE5\u70BA\u90A3\u5C31\u662F\u9019\u5473\u85E5\u7684\u6027\u5473\u3002
  // \u9019\u88E1\u53EA\u8A8D\u532F\u5165\u5668\u7522\u751F\u7684\u56FA\u5B9A\u53E5\u578B,\u4E0D\u505A\u6CDB\u7528\u82F1\u6587\u5075\u6E2C \u2014\u2014 \u4E2D\u82F1\u5C0D\u7167\u6B04\u4F4D\u672C\u4F86\u5C31\u6709\u82F1\u6587\u3002
  // \u9328\u9EDE\u4FEE\u6B63(2026-08-12,\u540C\u65E5\u7B2C\u4E8C\u6B21):\u7B2C\u4E00\u7248\u53EA\u7528 ^ \u958B\u982D\u6BD4\u5C0D,\u6F0F\u6389 243 \u500B
  // \u628A\u540C\u4E00\u53E5\u578B\u653E\u5728\u53E5\u4E2D/\u53E5\u5C3E\u7684\u5B57\u4E32,\u4F8B\u5982
  //   "Exterior pattern documentation context only"
  //   "Often studied with qi tonics or blood-moving herbs depending on pattern;
  //    verify against Bensky before source_checked."
  // \u5F8C\u8005\u9010\u5B57\u76F8\u540C\u5730\u51FA\u73FE\u5728\u767D\u828D\u3001\u7576\u6B78\u3001\u719F\u5730\u9EC3\u3001\u963F\u81A0\u4E0A \u2014\u2014 \u56DB\u5473\u4E0D\u540C\u7684\u85E5\u5171\u7528\u4E00\u53E5\u8A71,
  // \u5B9A\u7FA9\u4E0A\u5C31\u4E0D\u662F\u8A72\u85E5\u7684\u5167\u5BB9;\u800C "before source_checked" \u662F\u5167\u90E8\u6D41\u7A0B\u8A3B\u8A18\u5916\u6D29\u3002
  // \u7528\u300C\u6574\u4E32\u7D50\u5C3E\u5373\u8A72\u53E5\u578B\u300D\u800C\u975E\u4EFB\u610F\u4F4D\u7F6E\u6BD4\u5C0D,\u907F\u514D\u8AA4\u50B7\u771F\u7684\u63D0\u5230 verify \u7684\u53E5\u5B50\u3002
  const PLACEHOLDER_RES = [
    /^draft:/i,
    /^review .+ before clinical use\.?$/i,
    /verify against .+ before source_checked\.?$/i,
    /pattern documentation context only\.?$/i,
  ];
  function usableText(value) {
    const text = String(value || "").trim();
    if (!text || /\?{2,}/.test(text) || text.includes("\uFFFD")) return "";
    if (PLACEHOLDER_RES.some((re) => re.test(text))) return "";
    return text;
  }

  function cleanList(values) {
    // Field shape drifts between sources: tongue_zh/pulse_zh are arrays on 麻黃湯
    // but strings on 桂枝湯 and the 2026-08 舌脈 batch. A string here used to
    // render as empty ("待補") while the content sat in the record — the Dong-point
    // tab broke the same way. Wrap instead of drop.
    const list = Array.isArray(values) ? values : (values ? [values] : []);
    return list.map(usableText).filter(Boolean);
  }

  function doseValue(value, suffix = "g") {
    if (value === 0) return `0${suffix}`;
    if (typeof value === "number") return `${value}${suffix}`;
    const text = usableText(value);
    if (!text) return "待來源核對";
    return /[a-zA-Z克兩錢枚]/.test(text) ? text : `${text}${suffix}`;
  }

  /* A line ending in a colon is a group label, not an item — 人參敗毒散's
     modifications read 「For Wind predominant Bi:」 as its own bullet, level
     with the herbs underneath it. Rendering it as a small heading restores the
     shape the source had, without inventing which additions belong to which
     label (the extraction lost that, and guessing would look complete and be
     made up). */
  function detailList(values, emptyText = "待補 / Content pending source review") {
    const items = cleanList(values);
    if (!items.length) return `<p class="k-detail-empty">${esc(emptyText)}</p>`;
    const html = [];
    let open = false;
    for (const item of items) {
      const text = String(item).trim();
      if (/[:：]$/.test(text) && text.length < 40) {
        if (open) { html.push("</ul>"); open = false; }
        html.push(`<p class="k-list-label">${esc(text.replace(/[:：]$/, ""))}</p>`);
        continue;
      }
      if (!open) { html.push('<ul class="k-detail-list">'); open = true; }
      html.push(`<li>${esc(text)}</li>`);
    }
    if (open) html.push("</ul>");
    return html.join("");
  }

  /* 中英逐條成對 (FORMULA_CARD_TEMPLATE §1 sections 5 and 6). The formula card
     used to show English only, so the curated 中文 layer was invisible — the
     same defect the acupoint card had with point_identity and exam_pearl.
     Falls back to a single-language list when the two do not pair, rather than
     lining up rows that describe different things. */
  function detailPairedList(zh, en, emptyText = "待補 / Content pending source review") {
    const z = cleanList(zh), e = cleanList(en);
    if (!z.length && !e.length) return `<p class="k-detail-empty">${esc(emptyText)}</p>`;
    if (z.length && e.length && z.length === e.length) {
      return `<ol class="k-paired-list">${z.map((v, i) => {
        const zhStr = (v || "").trim();
        const enStr = (e[i] || "").trim();
        if (zhStr === enStr) {
          return `<li><span class="kp-en">${esc(enStr)}</span></li>`;
        }
        return `<li><span class="kp-zh">${esc(zhStr)}</span><span class="kp-en">${esc(enStr)}</span></li>`;
      }).join("")}</ol>`;
    }
    /* Lists of different lengths are not a broken translation — they are two
       independent lists (a curated 中文 set against American Dragon's full
       English one), which is why they must never be zipped by index. The old
       fallback showed the Chinese and dropped the English entirely, hiding
       content on 108 fields: 桂枝湯 has 3 Chinese contraindications and 4
       English ones, and the 4 were invisible. Show both, separately labelled,
       so nothing is hidden and nothing is falsely paired. */
    if (z.length && e.length) {
      /* The English goes in a drawer, closed. Printing it inline made 大黃牡丹湯
         show one Chinese contraindication above six English ones — the English
         out-weighed the content it was supposed to support, on a Chinese-first
         card. It is one click away and the count is on the label, so nothing is
         hidden and the 中文 leads. */
      return `${detailList(z, emptyText)}
        <details class="k-en-drawer">
          <summary>${esc(`英文來源另有 ${e.length} 條（不逐條對應）`)}</summary>
          ${detailList(e, emptyText)}
        </details>`;
    }
    return detailList(z.length ? z : e, emptyText);
  }

  /* Ting 2026-08-07:「這些待補如果你沒東西補 就不要出現」. A card carrying six
     待補 / Pending headings buries the three sections that do have content, and
     a heading with nothing under it is not honest reporting — it is noise. The
     Quality page is where coverage gets counted; the card should show what it
     has. Any section whose whole body is one k-detail-empty placeholder is
     dropped, so this applies to every card without hunting each call site. */
  const isPlaceholderOnly = (html) =>
    !String(html).replace(/<p class="k-detail-empty">[\s\S]*?<\/p>/g, "").trim();

  function detailSection(titleZh, titleEn, content) {
    if (isPlaceholderOnly(content)) return "";
    return `<section class="k-detail-section"><h3>${esc(titleZh)} <small>${esc(titleEn)}</small></h3>${content}</section>`;
  }

  function relationButton(id, label, kind) {
    return `<button type="button" class="k-relation-chip" data-detail-kind="${esc(kind)}" data-detail-id="${esc(id)}">${esc(label)}</button>`;
  }

  function formulaLabel(id) {
    const record = formulaById.get(id);
    if (record) return displayLabel(record.name_zh, record.pinyin || record.name_en, id);
    return String(id || "").replace(/^formula\./, "").replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());
  }

  function formulaChips(ids) {
    return (ids || []).filter(Boolean)
      .map((id) => `<span class="k-link-chip">${esc(formulaLabel(id))}</span>`)
      .join(" ");
  }

  function sourceLinks(record) {
    const cloudUrl = record.cloudtcm_url;
    const adUrl = record.american_dragon_url;
    let html = '<div class="k-source-citations" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';

    if (cloudUrl) {
      html += `<a href="${esc(cloudUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;text-decoration:none;color:#0284c7;font-weight:600;font-size:0.9em;">雲端中醫 CloudTCM ↗</a>`;
    }
    if (adUrl) {
      html += `<a href="${esc(adUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;text-decoration:none;color:#0284c7;font-weight:600;font-size:0.9em;">American Dragon ↗</a>`;
    }

    const citations = Array.isArray(record.source_citations) ? record.source_citations : [];
    if (citations.length) {
      citations.forEach(c => {
        const isUrl = c.url && /^https?:\/\//.test(c.url) && !/cloudtcm|americandragon/.test(c.url);
        if (isUrl) {
          html += `
            <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-decoration:none;color:#1e293b;font-size:0.85em;">
              <strong style="color:#0284c7;">${esc(c.name)} ↗</strong>
              ${c.scope ? `<span style="color:#64748b;margin-left:4px;">(${esc(c.scope)})</span>` : ""}
            </a>`;
        } else if (c.name && !/cloudtcm|americandragon/i.test(c.name)) {
          html += `
            <div style="display:inline-block;padding:6px 12px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;color:#334155;font-size:0.85em;">
              <strong>${esc(c.name)}</strong>
              ${c.scope ? `<span style="color:#64748b;margin-left:4px;">— ${esc(c.scope)}</span>` : ""}
            </div>`;
        }
      });
    }

    /* One chip per curriculum file+page. field_sources annotates the same page
       many ways ("...#p29（WM 行）"), which used to print the same course file
       three times (Ting: 課件部份就標註一兩個就好,不要重複). */
    const curriculumRefs = [...new Set(Object.values(record.field_sources || {}).flat()
      .filter((v) => typeof v === "string" && v.startsWith("curriculum/"))
      .map((v) => v.split("（")[0].split(" (")[0].split(" →")[0].trim()))]
      .reduce((acc, ref) => {                       // one chip per course FILE
        const file = ref.split("#")[0];
        if (!acc.some((x) => x.split("#")[0] === file)) acc.push(ref);
        return acc;
      }, [])
      .sort((a, b) => (b.includes("materia") ? 1 : 0) - (a.includes("materia") ? 1 : 0))
      .slice(0, 2);
    curriculumRefs.forEach((ref) => {
      const page = (ref.match(/#p(\d+)/) || [])[1];
      const base = ref.split("/").pop().split("#")[0].replace(/\.(pdf|csv|xlsx|md)$/, "").replace(/_/g, " ");
      html += `<div style="display:inline-block;padding:6px 12px;background:#f6efdd;border:1px solid #e0d3ae;border-radius:6px;color:#6b5620;font-size:0.85em;">📘 課件 ${esc(base)}${page ? ` p${esc(page)}` : ""}</div>`;
    });
    if (record.safety_review_pending) {
      html += `<div style="flex-basis:100%;margin-top:6px;color:#92400e;font-size:0.85em;">⏳ ${esc(record.safety_review_pending)}</div>`;
    }

    html += '</div>';
    return html;
  }

  /* Verified direct per-herb source URLs, keyed by herb id and by 中文名. */
  const HERB_URL_MAP = (() => {
    const d = K && K.herbUrlMap;
    const m = new Map();
    ((d && d.entries) || []).forEach((e) => {
      if (e.herb_id) m.set(e.herb_id, e);
      if (e.name_zh) m.set(e.name_zh, e);
    });
    return m;
  })();

  function herbVisualLinks(record) {
    const stored = Array.isArray(record.visual_links)
      ? record.visual_links
      : (Array.isArray(record.visualLinks) ? record.visualLinks : []);
    const exact = stored.filter((link) => link && /^https?:\/\//.test(link.url || ""));
    if (exact.length) return exact;

    /* No Google. The old fallback sent every herb to a site-scoped Google
       search, which does not resolve: CloudTCM pages are /herb/<numeric id>
       and carry no herb name, so a name-based search rarely lands on the
       right record. data/imports/cloudtcm/herb_url_map.json holds verified
       direct URLs. If a herb is not mapped yet, say so plainly rather than
       handing over a link that goes nowhere useful. */
    const mapped = HERB_URL_MAP.get(record.id) || HERB_URL_MAP.get(usableText(record.name_zh));
    if (mapped) {
      return [{
        label_zh: `雲端中醫 · ${mapped.name_zh}`,
        label_en: "CloudTCM herb page",
        source: "CloudTCM",
        url: mapped.page_url,
        link_status: "direct"
      }];
    }
    return [];
  }

  function herbVisualLinksSection(record) {
    const links = herbVisualLinks(record);
    if (!links.length) {
      return `<p class="k-detail-empty">此藥尚未建立直達來源連結。<br>
        <small>No verified direct source link for this herb yet — see data/imports/cloudtcm/herb_url_map.json.</small></p>`;
    }
    return `<div class="k-source-links k-visual-source-links">
      ${links.map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
        <strong>${esc(link.label_zh || link.labelZh || "圖像參考")}</strong>
        <small>${esc(link.label_en || link.labelEn || link.source || "Visual reference")}</small>
      </a>`).join("")}
    </div>
    <p class="k-detail-note">外部圖文只作藥材辨識與學習參考；同名藥、炮製品與混淆品仍須核對來源。</p>`;
  }

  function ensureDetailDialog() {
    let dialog = el("knowledgeDetailDialog");
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "knowledgeDetailDialog";
    dialog.className = "k-detail-dialog";
    dialog.setAttribute("aria-label", "方藥學習卡詳情");
    dialog.innerHTML = '<div id="knowledgeDetailContent"></div>';
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
      const closeButton = event.target.closest("[data-detail-close]");
      if (closeButton) {
        dialog.close();
        return;
      }
      const jumpButton = event.target.closest("[data-detail-jump]");
      if (jumpButton) {
        dialog.querySelector(`#knowledge-section-${jumpButton.dataset.detailJump}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      // 換對照方：只重畫雷達圖那一塊，不重開整張卡（重開會把捲軸彈回最上面）
      const partnerChip = event.target.closest("[data-radar-partner]");
      if (partnerChip) {
        const box = partnerChip.closest("[data-radar-for]");
        const rec = box && formulaById.get(box.dataset.radarFor);
        if (rec) box.outerHTML = formulaRadarSection(rec, partnerChip.dataset.radarPartner);
        return;
      }
      const relation = event.target.closest("[data-detail-kind][data-detail-id]");
      if (relation) openKnowledgeDetail(relation.dataset.detailKind, relation.dataset.detailId);
    });
    /* Hover 層。圖上的百分比是算出來的，所以每一點都該說得出它是哪幾味藥
       堆出來的 —— 「解表 56%（15g）｜麻黃 9g、桂枝 6g」。鍵盤與螢幕報讀走
       下面那張表，不用逐點 tab（8 軸 × 2 方 = 16 個停留點太多）。 */
    dialog.addEventListener("mouseover", (event) => {
      const hit = event.target.closest("[data-radar-tip]");
      if (!hit) return;
      const plot = hit.closest(".kr-plot");
      const tip = plot && plot.querySelector(".kr-tip");
      if (!tip) return;
      const box = plot.getBoundingClientRect();
      const dot = hit.getBoundingClientRect();
      tip.textContent = hit.dataset.radarTip;
      tip.hidden = false;
      tip.style.left = Math.round(dot.left + dot.width / 2 - box.left) + "px";
      tip.style.top = Math.round(dot.top - box.top) + "px";
    });
    dialog.addEventListener("mouseout", (event) => {
      if (!event.target.closest("[data-radar-tip]")) return;
      const tip = event.target.closest(".kr-plot")?.querySelector(".kr-tip");
      if (tip) tip.hidden = true;
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  /* The Tier-2 herb sites, in the order Ting set. Each link carries what is
     actually known about it:
       CloudTCM       — verified per-herb page (exact-name match against their
                        public index, recorded in herb_url_map.json)
       American Dragon— URL derived from the pinyin; the page is not confirmed
                        to exist, so it is marked 未驗證
       Atlas          — only an index page is known; there is no per-herb path */
  function herbSourceLinks(record, cloudUrl, adUrl) {
    const a = (url, label, note) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="k-src-link">${esc(label)} ↗</a>${note ? `<small class="k-src-note">${esc(note)}</small>` : ""}`;
    const out = [];
    // herbReferenceUrl falls back through source_urls, which for the 45 herbs
    // with no CloudTCM page can be an American Dragon or NCCIH link. Labelling
    // that "雲端中醫 CloudTCM" claims a source the record does not have, so the
    // label follows the host, not the position in the fallback chain. Only
    // treat it as a generic external link when it is an actual http(s) URL —
    // a curriculum file path (e.g. "curriculum/herbs/...md#L1-L2") reaching
    // here is a caller bug, not a link to render.
    if (cloudUrl && /cloudtcm\.com/i.test(cloudUrl)) out.push(a(cloudUrl, "雲端中醫 CloudTCM"));
    else if (cloudUrl && /^https?:\/\//i.test(cloudUrl) && !/americandragon/i.test(cloudUrl)) out.push(a(cloudUrl, "外部藥材參考"));
    // American Dragon: prefer the dedicated field; most herb records only
    // carry the AD page inside source_citations, so fall back to that.
    const dragonUrl = record.american_dragon_url || adUrl;
    if (dragonUrl) {
      out.push(a(dragonUrl, "American Dragon",
        record.american_dragon_link_status === "derived" ? "未驗證連結" : ""));
    }
    if (record.atlas_url) out.push(a(record.atlas_url, "TCM Herb Atlas", record.atlas_link_status === "index" ? "索引頁" : ""));
    return out.length ? `<span class="k-src-links">${out.join("")}</span>` : "來源待補";
  }

  /* Formula-specific card sections (docs/FORMULA_CARD_TEMPLATE.md §1).
     These exist because a formula is an assembly, not an entity: the 八法 is
     the treatment strategy the outline examines by name (Domain I.B.5), the
     family is what "加減" actually means, and the tongue/pulse is the selection
     signal that tells this formula apart from its neighbours. */
  /* exam_importance is shared boilerplate on 200 of 201 formulas: one sentence
     of exam-outline Domain percentages (169 cards) or "not on the outline" (31),
     identical word for word. Printed at the very top of every card it is pure
     noise — Ting: 「前面還放一堆廢話」— and it pushes the one line that IS
     per-formula (exam_pearl) below the fold. The ★ header already says whether
     the formula is on the board list, which is the only part of that sentence
     that varies. So: print exam_importance only when it is NOT one of the shared
     strings. The data stays (§0); this is a display decision. */
  const SHARED_EXAM_SCOPE = [
    "★ NCBAHM 2026 CH 考綱 Appendix C 官方應試方劑",
    "非 NCBAHM 2026 CH 考綱 Appendix C 列表方劑",
  ];
  function formulaExamBanner(record) {
    const onBoard = record.on_board_list;
    const pearl = usableText(record.exam_pearl);
    const scope = usableText(record.exam_importance);
    const scopeIsShared = scope && SHARED_EXAM_SCOPE.some((s) => scope.startsWith(s));
    const showScope = scope && !scopeIsShared;
    if (!showScope && !pearl) return "";
    const bold = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong class="k-pearl-key">$1</strong>').replace(/\n/g, "<br>");
    return `<section class="k-exam-banner${onBoard ? " is-board" : ""}">
      <h4>${onBoard ? "★ 考試重點 · NCBAHM 應試方劑" : "💡 學習提示"}</h4>
      ${showScope ? `<p class="k-exam-scope">${esc(scope)}</p>` : ""}
      ${pearl ? `<p class="k-exam-pearl">${bold(pearl)}</p>` : ""}
    </section>`;
  }

  /* 症狀與現代對應病名(2026-08-12,A0c 的方劑層第一步)。
   *
   * `symptoms_zh`(206 張)與 `clinical_manifestations_zh`(197 張)先前都沒上過畫面。
   * 兩者**大多是同一份內容的兩種排版** —— 前者是斜線分隔的清單,後者是頓號連成的
   * 散文。兩個都印會變成同一段話講兩次,所以先比對去標點後的內容,一樣就只印清單版
   * (清單好掃,考試時要的是掃)。這是 panel 改寫那次學到的:先數重疊再還原,
   * 否則會 double-print。
   *
   * `modern_diseases_zh` 是現代病名關聯,不是適應症 —— 標題與說明都要講清楚,
   * 不然「心肌梗塞」出現在桂枝湯卡上會被讀成主治。 */
  function formulaSymptomSection(record) {
    // 標點要剝乾淨才比得出「同一份內容的兩種排版」。第一版漏了全形分號「；」——
    // 清單版用「/」分隔、散文版用「；、」分隔,只差那一個字元就判定成不同內容,
    // 於是同一段症狀在我自己的區塊裡印了兩次(224 張裡 120 張)。
    // 用「非中日韓文字與英數一律剝除」而不是逐個列標點,免得下次再漏一個。
    const norm = (s) => String(s || "").replace(/[^一-鿿豈-﫿a-zA-Z0-9]/g, "");
    const list = cleanList(record.symptoms_zh);
    const prose = usableText(record.clinical_manifestations_zh);
    // 只比對兩個新欄位彼此還不夠 —— 實測 224 張裡有 120 張,同一段症狀早就寫在
    // 考試重點的 exam_pearl 裡了,於是新區塊把同一句話在同一張卡上再講一次。
    // 所以要對「這張卡上面已經印過的東西」去重,不是對兄弟欄位去重。
    const priorText = norm([
      usableText(record.exam_pearl), usableText(record.exam_importance),
      cleanList(record.pattern_indications_zh).join(""), cleanList(record.actions_zh).join(""),
    ].filter(Boolean).join(""));
    const already = (s) => s && priorText.includes(norm(s));
    if (already(list.join("")) || (!list.length && already(prose))) return "";
    const same = list.length && prose && norm(list.join("")) === norm(prose);
    const body = list.length
      ? `<ul>${list.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>${same || !prose ? "" : `<p>${esc(prose)}</p>`}`
      : (prose ? `<p>${esc(prose)}</p>` : "");
    return detailSection("症狀表現", "Presenting symptoms", body);
  }

  function formulaModernDiseaseSection(record) {
    const list = cleanList(record.modern_diseases_zh);
    if (!list.length) return "";
    return `<section class="k-detail-section">
      <h3>${esc(modeText("現代對應病名（關聯，非主治）", "Modern disease associations (not indications)"))}</h3>
      <p class="k-chip-cloud">${list.map((n) => `<span class="k-tag">${esc(n)}</span>`).join("")}</p>
      <p class="k-meta">${esc(modeText(
        "來自來源網站的關聯清單:代表文獻上曾一起出現,不代表本方主治這些病,仍須辨證。",
        "Association list from the source site: co-occurrence in the literature, not an indication list. Pattern differentiation still applies."))}</p>
    </section>`;
  }

  function formulaGlanceRow(record) {
    const bits = [
      ["八法 Ba Fa", [usableText(record.ba_fa_zh), usableText(record.ba_fa_en)].filter(Boolean).join(" · ")],
      ["出典 Source", usableText(record.source_classic)],
      // 苔(coating_zh)171 張卡有值,先前完全沒上畫面。缺它的差別是實的:
      // 桂枝湯的「舌」只寫「正常」,而它的苔是「白潤」—— 英文欄早就寫著
      // "thin, white, moist coating",中文讀者卻只看到「正常」。國考問的是舌苔。
      ["舌 Tongue", [cleanList(record.tongue_zh).join("、"), usableText(record.coating_zh) ? `苔${usableText(record.coating_zh)}` : ""].filter(Boolean).join("・")],
      ["脈 Pulse", cleanList(record.pulse_zh).join("、")],
      ["煎法 Preparation", usableText(record.preparation_zh)],
      ["臺灣藥典 TW Pharmacopeia", usableText(record.taiwan_pharmacopeia_zh)]
    ].filter(([, v]) => v);
    if (!bits.length) return "";
    return `<div class="k-formula-glance">${bits.map(([k, v]) =>
      `<div><span class="kfg-k">${esc(k)}</span><span class="kfg-v">${esc(v)}</span></div>`).join("")}</div>`;
  }

  function formulaFamilySection(record) {
    const fam = Array.isArray(record.formula_family) ? record.formula_family : [];
    if (!fam.length) return "";   // concatenated with formulaCompareSection — see detailSection
    const sign = { "加": "＋", "減": "－", "倍": "×", "合方": "＋方", "同類": "≈" };
    return `<ul class="k-family">${fam.map((f) => `
      <li class="k-family__row">
        <span class="kf-rel">${esc(sign[f.relation] || "")}${esc(f.relation || "")}</span>
        <span class="kf-name">${esc(f.name_zh || f.formula_id || "")}</span>
        <span class="kf-change">${(f.change || []).map((c) => `<code>${esc(c)}</code>`).join(" ")}</span>
        <span class="kf-ind">${esc(f.indication_zh || "")}</span>
      </li>`).join("")}</ul>`;
  }

  function formulaCompareSection(record) {
    const rows = Array.isArray(record.compare_with) ? record.compare_with : [];
    if (!rows.length) return "";  // concatenated with formulaRadarSection — see detailSection
    return `<ul class="k-fcompare">${rows.map((c) => {
      const other = (c.codes || []).find((x) => x !== record.id) || "";
      return `<li><span class="kfc-axis">${esc(c.axis || "")}</span><span class="kfc-note">${esc(c.note || "")}</span></li>`;
    }).join("")}</ul>`;
  }

  /* ── 功效組成雷達圖 ────────────────────────────────────────────────────
     Ting: 「數縮到 8 根（用八法或功效大類），兩個方疊圖，放在『類方鑑別』那一區」

     CloudTCM 那張圖有 26 根軸，其中 20 根趨近於零。兩個方疊上去，差別被埋在
     一圈噪音裡。8 根軸不是把資訊丟掉，是把差異留下來。

     圖上每一格都是算出來的，不是評出來的：軸長 = 該類藥的煎劑克數 ÷ 全方總克數，
     由 scripts/build-formula-action-profile.js 從組成算好寫進 action_profile，
     hover 就看得到是哪幾味藥撐起這根軸。這裡只負責畫，不做任何判斷。

     刻度依這一對方的最大值收放，圈上直接標出百分比。本來寫死 0–100%，理由是
     「每張圖刻度一樣才能互相比」，但畫出來就知道那是錯的：溫膽湯 vs 二陳湯
     全部落在 7–37%，兩個形狀擠成中心一小團，什麼都看不出來 —— 而它們的差別
     （溫膽湯就是二陳湯加竹茹枳實）正是這張圖唯一該講的事。
     這張圖的工作是比「疊在一起的這兩個方」，不是跨卡片比大小；刻度標在圈上，
     所以收放不會騙人。 */
  const ACTION_AXES = Object.entries((K && K.formulaActionGroups) || {})
    .map(([zh, def]) => ({ zh, en: (def && def.en) || "" }));

  const RADAR = { CX: 180, CY: 158, R: 100, LR: 126 };
  function radarPoint(i, v) {
    const a = (-90 + i * (360 / ACTION_AXES.length)) * Math.PI / 180;
    return [RADAR.CX + Math.cos(a) * RADAR.R * v, RADAR.CY + Math.sin(a) * RADAR.R * v];
  }
  const radarPolygon = (shares) =>
    shares.map((v, i) => radarPoint(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

  function actionShares(record) {
    const p = record && record.action_profile;
    if (!p || !p.total_g) return null;
    return ACTION_AXES.map((ax) => (p.groups_g[ax.zh] || 0) / p.total_g);
  }

  /* 類方 = 可以疊圖的對象，依「關係有多明確」排序：
       compare_with   已經寫好鑑別要點的一對（最明確，但目前只有 1 筆）
       derived_from / formula_family  加減關係（麻黃湯 ↔ 大青龍湯）
       comparison_group 同一個鑑別群組（115 方有，這是覆蓋率的來源）
     只留真的算得出圖的對象 —— 沒有 action_profile 就疊不上去。 */
  function comparablePartners(record) {
    const ids = [];
    const push = (id) => { if (id && id !== record.id && !ids.includes(id)) ids.push(id); };
    (record.compare_with || []).forEach((c) => (c.codes || []).forEach(push));
    if (record.derived_from) push(record.derived_from.formula_id);
    (record.formula_family || []).forEach((f) => push(f.formula_id));
    if (record.comparison_group) {
      formulas.forEach((f) => { if (f.comparison_group === record.comparison_group) push(f.id); });
    }
    return ids.map((id) => formulaById.get(id)).filter((f) => f && f.action_profile);
  }

  function formulaRadarSection(record, partnerId) {
    const mine = actionShares(record);
    if (!mine) return "";
    const partners = comparablePartners(record);
    const partner = partners.find((p) => p.id === partnerId) || partners[0] || null;
    const theirs = partner ? actionShares(partner) : null;

    const pct = (v) => Math.round(v * 100);
    const grams = (rec, ax) => (rec.action_profile.groups_g[ax.zh] || 0);
    const herbsOf = (rec, ax) => (rec.action_profile.groups_herbs[ax.zh] || []).join("、");

    // 兩個系列用固定的第 1、2 色位（藍／橘），不是依名次上色 —— 換一個對照方，
    // 本方的顏色不可以跟著變。palette 已用 dataviz 的 validate_palette.js 對
    // #ffffff 面驗過：CVD ΔE 24.7、一般視覺 ΔE 33.6、對比度都過 3:1。
    const series = [
      { rec: record, shares: mine, cls: "s1" },
      ...(partner ? [{ rec: partner, shares: theirs, cls: "s2" }] : [])
    ];

    // 最外圈 = 兩個方的最大值進位到 10%，下限 40%（免得一個很平的方被放大到
    // 看起來像有巨大差異）。scale() 把百分比換算成 0–1 的半徑比例。
    const peak = Math.max(...mine, ...(theirs || [0]));
    const outer = Math.max(0.4, Math.ceil(peak * 10) / 10);
    const scale = (v) => v / outer;

    const rings = [0.25, 0.5, 0.75, 1].map((f) =>
      `<polygon class="kr-ring" points="${radarPolygon(ACTION_AXES.map(() => f))}"/>`).join("");
    const spokes = ACTION_AXES.map((_, i) => {
      const [x, y] = radarPoint(i, 1);
      return `<line class="kr-spoke" x1="${RADAR.CX}" y1="${RADAR.CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join("");
    /* 刻度標在最外和中間兩圈，靠垂直軸左側（text-anchor=end）—— 本來壓在
       正上方那根軸上，資料線一畫過去就疊在一起看不清。 */
    const ticks = [0.5, 1].map((f) =>
      `<text class="kr-tick" x="${RADAR.CX - 6}" y="${(RADAR.CY - RADAR.R * f + 3).toFixed(1)}"
         text-anchor="end">${Math.round(outer * f * 100)}%</text>`).join("");

    const labels = ACTION_AXES.map((ax, i) => {
      const [x, y] = radarPoint(i, RADAR.LR / RADAR.R);
      const dx = x - RADAR.CX;
      const anchor = dx > 6 ? "start" : dx < -6 ? "end" : "middle";
      return `<text class="kr-axis" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}">${esc(ax.zh)}</text>`;
    }).join("");

    const shapes = series.map((s) =>
      `<polygon class="kr-area kr-${s.cls}" points="${radarPolygon(s.shares.map(scale))}"/>`).join("");
    // 標記只畫在有值的軸上。零值全部落在圓心，八個點疊成一坨反而看不懂。
    const dots = series.map((s) => s.shares.map((v, i) => {
      if (!v) return "";
      const [x, y] = radarPoint(i, scale(v));
      const ax = ACTION_AXES[i];
      return `<circle class="kr-dot kr-${s.cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/>`
        + `<circle class="kr-hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"
             data-radar-tip="${esc(`${ax.zh} ${ax.en} · ${s.rec.name_zh} ${pct(v)}%（${grams(s.rec, ax)}g）｜${herbsOf(s.rec, ax)}`)}"/>`;
    }).join("")).join("");

    const legend = series.map((s) =>
      `<span class="kr-key"><i class="kr-sw kr-${s.cls}"></i>${esc(s.rec.name_zh)}</span>`).join("");

    const chips = partners.length > 1
      ? `<div class="kr-picker">${partners.map((p) =>
          `<button type="button" class="kr-chip${p.id === (partner && partner.id) ? " is-on" : ""}"
             data-radar-partner="${esc(p.id)}">${esc(p.name_zh)}</button>`).join("")}</div>`
      : "";

    // 表格不是備份，是主要的可讀路徑：螢幕報讀、色覺障礙、以及「到底幾克」
    // 都靠它。圖是快速看形狀，數字在這裡。
    const rows = ACTION_AXES.map((ax) => {
      const a = mine[ACTION_AXES.indexOf(ax)];
      const b = theirs ? theirs[ACTION_AXES.indexOf(ax)] : null;
      if (!a && !b) return "";
      const cell = (rec, v) => v
        ? `<td><b>${pct(v)}%</b> <small>${grams(rec, ax)}g · ${esc(herbsOf(rec, ax))}</small></td>`
        : `<td class="kr-nil">—</td>`;
      return `<tr><th scope="row">${esc(ax.zh)}<small>${esc(ax.en)}</small></th>`
        + cell(record, a) + (partner ? cell(partner, b) : "") + "</tr>";
    }).join("");

    const summary = `${record.name_zh} 功效組成：`
      + ACTION_AXES.map((ax, i) => mine[i] ? `${ax.zh} ${pct(mine[i])}%` : "").filter(Boolean).join("、")
      + (partner ? `；對照 ${partner.name_zh}：`
        + ACTION_AXES.map((ax, i) => theirs[i] ? `${ax.zh} ${pct(theirs[i])}%` : "").filter(Boolean).join("、") : "");

    return `<div class="k-radar" data-radar-for="${esc(record.id)}">
      <div class="kr-head">
        <div class="kr-legend">${legend}</div>
        ${chips}
      </div>
      <div class="kr-plot">
        <svg viewBox="0 0 360 326" role="img" aria-label="${esc(summary)}">
          <g>${rings}${spokes}</g>
          ${ticks}
          ${labels}${shapes}${dots}
        </svg>
        <div class="kr-tip" hidden></div>
      </div>
      <table class="kr-table">
        <caption>依煎劑劑量佔比計算，非療效評分。組成裡的食材輔料（粳米等）不計入分母。</caption>
        <thead><tr><th scope="col">功效大類</th><th scope="col">${esc(record.name_zh)}</th>
          ${partner ? `<th scope="col">${esc(partner.name_zh)}</th>` : ""}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  /* CloudTCM 中文深度層 (chinese_depth_track). 方義 is card contract §1 row 9
     and sat invisible on every formula that carried it (lesson 9 again — the
     2026-08 misfile moves put real content here, so it must render).
     Paragraphs are \n-joined by the move scripts; render as <br>. */
  function formulaDepthSection(record, key, titleZh, titleEn) {
    const text = usableText((record.chinese_depth_track || {})[key]);
    if (!text) return "";
    return detailSection(titleZh, titleEn, `<p class="k-depth-text">${esc(text).replace(/\n/g, "<br>")}</p>`);
  }

  /* 原方 back-link. formula_family lives on the BASE formula, so opening a
     derived one gave no hint it was a modification — which is the single most
     useful thing to know about 大青龍湯. Mirrored by
     scripts/link-formula-family-back.js, never authored twice. */
  /* Hero tile 2: whichever source pages this formula actually has. Styled for
     the hero gradient (translucent fill, light text) rather than reusing the
     bottom panel's white chips, which was why the first attempt was reverted.
     Falls back to the tier only when there is genuinely no link to show, so the
     tile is never empty and never claims a link that isn't there. */
  function heroSourceTile(record) {
    const chip = (url, label) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="k-hero-src">${esc(label)} ↗</a>`;
    const links = [];
    if (record.cloudtcm_url) links.push(chip(record.cloudtcm_url, "雲端中醫"));
    if (record.american_dragon_url) links.push(chip(record.american_dragon_url, "American Dragon"));
    if (!links.length) return ["學習層級 Tier", record.tier || "draft"];
    return ["來源頁面 Source pages", links.join(""), true];
  }

  /* 我的病例 — the visits where Ting actually prescribed this formula.
     A formula card that cannot answer "where have I used this" is a reference
     book; with it, the knowledge layer and the clinical record are one system.
     Only de-identified fields cross over (see window.AcuTingCases): code, visit
     number, date, title, verdict — never S/O/A/P text (DECISIONS D4/D7). */
  function formulaCaseSection(record) {
    const api = window.AcuTingCases;
    if (!api || !api.usedIn) return "";
    const rows = api.usedIn("formula", record.id);
    if (!rows.length) return "";
    const cases = new Set(rows.map((r) => r.caseId));
    return `<p class="k-case-count">${esc(`${cases.size} 個病例 · ${rows.length} 次就診用過本方`)}</p>
      <ul class="k-case-list">${rows.slice(0, 12).map((r) => {
        const v = VERDICT_LABEL[r.verdict];
        return `<li>
          <button type="button" class="k-case-open" data-case-open="${esc(r.caseId)}">
            <span class="kc-code">${esc(r.patientCode || "—")}</span>
            <span class="kc-title">${esc(r.caseTitle || "未命名病例")}</span>
          </button>
          <span class="kc-meta">${esc([r.visitNumber ? `第 ${r.visitNumber} 診` : "", r.date].filter(Boolean).join(" · "))}</span>
          ${v ? `<span class="kc-verdict kc-${esc(r.verdict)}">${esc(v[0])}</span>` : ""}
        </li>`;
      }).join("")}</ul>
      ${rows.length > 12 ? `<p class="k-meta">${esc(`另有 ${rows.length - 12} 次，見病例區`)}</p>` : ""}`;
  }

  function formulaSourceLinks(record) {
    const a = (url, label, note) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="k-src-link"${note ? ` title="${esc(note)}"` : ""} style="margin-right:6px;display:inline-block;padding:2px 8px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;color:#0284c7;font-size:0.85em;text-decoration:none;">${esc(label)} ↗</a>`;
    const out = [];
    if (record.cloudtcm_url) {
      // 3 formulas link to a page filed under a different name (理中湯 for
      // 理中丸, 生脈飲 for 生脈散, 八味地黃丸 for 金匱腎氣丸). Say so on the
      // chip — clicking through to a differently-named page otherwise reads
      // like a broken link, and for 金匱腎氣丸 the target really does differ
      // by one herb (肉桂 vs 桂枝), which she needs to know before trusting it.
      const note = usableText(record.cloudtcm_link_note);
      out.push(a(record.cloudtcm_url, "雲端中醫 CloudTCM", note));
      if (note) out.push(`<small class="k-src-note" style="display:block;color:#92400e;font-size:0.78em;margin-top:2px;">※ ${esc(note)}</small>`);
    }
    if (record.american_dragon_url) out.push(a(record.american_dragon_url, "American Dragon"));
    return out.length ? out.join("") : `<span class="k-meta">${esc(record.tier || "draft")}</span>`;
  }

  function formulaDerivedFrom(record) {
    const d = record.derived_from;
    if (!d) return "";
    return `<p class="k-derived-from">原方 <a href="#" data-formula-jump="${esc(d.formula_id)}">${esc(d.name_zh)}</a>
      <span class="kdf-rel">${esc(d.relation || "")}</span>
      ${(d.change || []).map((c) => `<code>${esc(c)}</code>`).join(" ")}
      ${d.indication_zh ? `<span class="kdf-ind">${esc(d.indication_zh)}</span>` : ""}</p>`;
  }

  /* 66d3e72 merged the flat English condition lists (ad_treats_en, and the
     applications_en that carries the same American Dragon list) into the
     現代運用索引 chip cloud. Reprinting them as a section too would show the
     same 24 conditions twice on one tab. This asks the only question that
     matters at render time — is this list already on the card? — instead of
     hardcoding which fields were merged: 7 of the 8 English-only 現代應用 are
     100% covered by the chips, 人參敗毒散 is 0% covered and must still render.
     Nothing is filtered item by item; a list either belongs here whole or was
     absorbed whole, so no half-list of fragments can reach the card. */
  const chipKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9一-鿿]/g, "");
  function alreadyShown(list, shownLists) {
    const items = cleanList(list);
    if (!items.length) return false;
    const shown = new Set(shownLists.flatMap((l) => cleanList(l)).map(chipKey));
    if (!shown.size) return false;
    return items.filter((v) => shown.has(chipKey(v))).length / items.length >= 0.8;
  }
  function absorbedByModernIndex(list, record) {
    return alreadyShown(list, [
      record.modern_applications_en || record.treats_en || ((record.english_exam_track || {}).treats_en),
      record.modern_applications_zh || record.treats_zh
    ]);
  }

  /* 現代應用 — what this formula treats today. Kept separate from CloudTCM's
     modern_diseases_zh: that list has 系統性紅斑性狼瘡 and 心肌梗塞 under
     麻黃湯, which is keyword association rather than clinical application. Both
     are shown, each under its own heading and its own source. */
  function formulaModernSection(record) {
    const out = [];
    // Gate on either language, not on 中文 alone: 8 formulas carry
    // applications_en with no applications_zh and 5 carry modern_research_en
    // with no _zh. A zh-only gate leaves that English in the data and off the
    // card — the invisible-English failure this project keeps hitting.
    // detailPairedList already falls back to whichever side exists.
    const app = cleanList(record.applications_zh), appEn = cleanList(record.applications_en);
    // 課件 Chinese prose is never in the chip cloud, so it always renders; a
    // bare English list only renders when the index did not already absorb it.
    if (app.length || (appEn.length && !absorbedByModernIndex(appEn, record))) {
      out.push(detailSection("現代應用", "What this formula treats today（課件 Applications）", detailPairedList(app, appEn)));
    }
    // American Dragon's TREATS list: 24 English condition names, a different
    // granularity from the Chinese prose above. They used to share
    // applications_zh/_en, where the length mismatch made detailPairedList fall
    // back to Chinese only — the English was in the data and invisible on the
    // card. Its own section, so both actually render.
    const adTreats = cleanList(record.ad_treats_en);
    if (adTreats.length && !absorbedByModernIndex(adTreats, record)) {
      out.push(detailSection("現代應用（American Dragon 清單）", "Conditions treated — American Dragon", detailList(adTreats)));
    }
    // Research sentences are prose, never chips — no absorption check needed.
    const res = cleanList(record.modern_research_zh), resEn = cleanList(record.modern_research_en);
    if (res.length || resEn.length) out.push(detailSection("現代藥理", "Modern research（課件）", detailPairedList(res, resEn)));
    // modern_diseases_zh is NOT rendered. It is CloudTCM keyword co-occurrence:
    // whatever disease names happened to appear on the same page. That is why
    // 桂枝湯 carried 心肌梗塞, 痲瘋 and 麻疹, and why Ting could not work out what
    // the block was for — there was nothing to work out. It answered no question
    // a reader has, while sitting above 現代應用, which answers the real one.
    //
    // The data stays in the record (§0 — this is a display decision, not a
    // deletion) and the template's §1 row 13b is corrected to match. If a use
    // for it ever appears, it comes back as a deliberate section, not as the
    // loudest thing on the card.
    return out.join("");
  }

  /* Bridge to js/notes.js. Kept as a one-line helper so the herb and formula
     panel builders don't each repeat the display-name assembly. */
  function notesPanel(kind, record) {
    if (!window.AcuTingNotes) return '<p class="k-detail-empty">筆記模組未載入 / Notes module not loaded</p>';
    const name = [usableText(record.name_zh), usableText(record.pinyin) || usableText(record.name_en)]
      .filter(Boolean).join(" ");
    return window.AcuTingNotes.panel(kind, record.id, name || record.id);
  }

  function syndromeHeroSummary(record) {
    const zh = cleanList(record.pattern_indications_zh || record.pattern_tags_zh);
    if (zh.length) {
      const shortItems = zh.map((s) => String(s || "").split("：")[0].split(" - ")[0].split("・")[0].trim()).filter(Boolean);
      const summary = [...new Set(shortItems)].slice(0, 3).join(" · ");
      if (summary.length <= 40) return summary;
      return summary.slice(0, 38) + "…";
    }
    const en = cleanList(record.ad_syndromes_en || record.pattern_indications_en);
    if (en.length) return en.slice(0, 2).join(" · ");
    return comparisonGroupLabel(record.comparison_group) || "—";
  }

  function detailShell(record, kind, panels) {
    /* Once detailSection() drops placeholder-only sections, a tab can end up
       with nothing in it — 藥對 on a formula with no recorded pairs. An empty
       tab is worse than a 待補 line, because it reads as a loading bug. The
       notes tab always stays: it is Ting's own layer and starts empty by
       design. */
    panels = (panels || []).filter((p) => p && (p.id === "notes" || String(p.content || "").trim()));
    const eyebrow = kind === "formula" ? "FORMULA STUDY CARD"
      : kind === "pharm" ? "DRUG LABEL CARD"
      : "MATERIA MEDICA STUDY CARD";
    const identity = [record.category || record.category_en, record.tier ? `tier: ${record.tier}` : "", record.id].filter(Boolean).join(" · ");
    const mappedHerb = kind === "herb" ? (HERB_URL_MAP.get(record.id) || HERB_URL_MAP.get(usableText(record.name_zh))) : null;
    // Most herb cards (Codex + Claude batches) never set the dedicated
    // record.cloudtcm_url / record.american_dragon_url fields — those sources
    // only live inside source_citations. Without an http(s) filter here, the
    // "find first citation with a url" fallback below picks whichever came
    // first in the array, which is often a curriculum file path like
    // "curriculum/herbs/...md#L1-L2" (truthy .url, not a real link) — that
    // then got rendered as if it were the herb's external reference link.
    const herbCitations = kind === "herb" ? (record.source_citations || []) : [];
    const citedUrl = (re) => herbCitations.find((source) => source?.url && re.test(source.url))?.url;
    const citedCloudtcmUrl = citedUrl(/cloudtcm\.com/i);
    const citedAmericanDragonUrl = citedUrl(/americandragon\.com/i);
    const preferredCitation = kind === "herb"
      ? herbCitations.find((source) => source?.url && /^https?:\/\//.test(source.url) && /主要外部圖像|圖像與藥材辨識/.test(source.scope || ""))
        || herbCitations.find((source) => source?.url && /^https?:\/\//.test(source.url))
      : null;
    const herbReferenceUrl = mappedHerb?.page_url || record.cloudtcm_url || citedCloudtcmUrl || preferredCitation?.url
      || record.exact_source_url || (record.source_urls || []).find(Boolean) || "";
    const herbReferenceLabel = mappedHerb || record.cloudtcm_url || citedCloudtcmUrl
      ? "雲端中醫 CloudTCM"
      : (preferredCitation?.name || "外部藥材參考 Source");
    const herbDragonUrl = record.american_dragon_url || citedAmericanDragonUrl;
    // 西藥卡不能沿用中藥的 glance row:那三格會在華法林上印出「性味 待補」
    // 「歸經 待補」—— 那不是缺資料,是**這些概念不適用於西藥**。印「待補」等於
    // 暗示遲早會補上,是渲染層在說資料沒說過的話(與假劑量 6~15g 同一種錯)。
    const facts = kind === "pharm"
      ? [
          // 用列表卡已經在用的同一組解析(classLabelOf / drugtarget_id 查表),
          // 不要另外猜欄位名 —— 猜錯就印「待補」,而那會被讀成「這味藥缺資料」。
          ["分類 Class", (() => {
            const c = pharmClassById.get(record.drugclass_id);
            if (!c) return "待補";
            return c.name_zh && c.name_en ? `${c.name_zh} / ${c.name_en}` : (c.name_zh || c.name_en || "待補");
          })()],
          ["作用標的 Target", (() => {
            const t = pharmTargetById.get(record.drugtarget_id);
            return t ? modeText(t.name_zh || t.name_en, t.name_en || t.name_zh) : "待補";
          })()],
          ["官方標籤 Label", usableText(record.dailymed_label_title) || usableText(record.medlineplus_title) || "待補"],
        ]
      : kind === "formula"
      ? [
          ["分類 Category", record.category || record.category_en || "待補"],
          // Ting removed the Tier tile long ago and wants this slot to be the
          // CloudTCM link instead — it is the page she actually opens from a
          // formula card. Falls back to the tier only when no link exists, so
          // the tile is never empty.
          //
          // 2026-08-06: a first attempt to put BOTH links here was reverted for
          // styling — formulaSourceLinks() paints white chips that glare on the
          // #70405d→#a05d7d gradient. The fix is hero-native styling, not
          // dropping the link. 2026-08-07: the tile only ever offered CloudTCM,
          // so the 67 formulas that have an American Dragon page and no CloudTCM
          // one showed "Tier: draft" — a filled link field rendering as nothing.
          heroSourceTile(record),
          // Ting wants the herbs themselves here, not a count — the tile is
          // the first thing she reads on a formula card. Falls back to pinyin
          // when a curriculum ingredient has no Chinese name yet.
          ["組成 Composition", compositionSummary(record.composition)],
          ["主治證型 Syndromes", syndromeHeroSummary(record)]
        ]
      : [
          ["分類 Category", record.category || record.category_en || "待補"],
          ["性味 Properties", usableText(record.properties_taste_temp || record.taste_temperature_zh) || "待補"],
          ["歸經 Channels", cleanList(record.channels_entered || record.channels_zh).join("、") || "待補"],
          // All three Tier-2 sites, in Ting's order (CloudTCM → American Dragon
          // → atlas), each labelled by how far it can be trusted. A derived
          // American Dragon URL and an atlas index page are useful links but
          // they are not verified per-herb pages, and the card says so rather
          // than presenting all three as equivalent.
          ["外部參考 Sources", herbSourceLinks(record, herbReferenceUrl, herbDragonUrl), Boolean(herbReferenceUrl || herbDragonUrl || record.atlas_url)]
        ];
    return `
      <div class="k-detail-shell">
        <div class="k-detail-toolbar">
          <span>${esc(kind === "formula" ? "方劑資料庫 / Formula" : kind === "pharm" ? "西藥資料庫 / Drug label" : "中藥資料庫 / Materia Medica")}</span>
          <button type="button" class="k-detail-close" data-detail-close aria-label="關閉詳情">返回列表</button>
        </div>
        <header class="k-detail-hero">
          <div class="k-detail-watermark" aria-hidden="true">${esc((record.name_zh || record.pinyin || "?").slice(0, 1))}</div>
          <div class="k-detail-hero-top">
            <div>
              <div class="k-detail-badges"><span>${esc(record.category || record.category_en || kind)}</span></div>
              ${kind === "formula" ? `<h2>${esc(record.name_zh || record.pinyin)} <small>${esc(record.pinyin)}</small></h2><p class="k-detail-en">${esc(record.name_en)}</p>` : `
              <h2>${esc(record.name_zh || record.name_en)} <small style="font-size:0.8em;font-weight:bold;color:#ffffff;margin-left:8px;">${esc(record.pinyin || record.pinyin_toned || "")} · ${esc(record.name_en || "")}</small></h2>
              ${(record.pharmaceutical_latin || record.latin_name) ? `<p class="k-detail-en" style="color:#38bdf8;font-weight:600;margin:3px 0 0 0;font-size:0.95em;">${esc(record.pharmaceutical_latin || record.latin_name)}</p>` : ""}
              `}
            </div>
          <div class="k-detail-header-actions">
            ${statusPill(record.review_status)}
          </div>
          </div>
          <div class="k-detail-fact-grid">
            ${facts.map(([label, value, isRawHtml]) => `<article><span>${esc(label)}</span><strong>${isRawHtml ? value : esc(value)}</strong></article>`).join("")}
          </div>
        </header>
        <div class="k-review-banner"><strong>Draft · source review pending</strong><span>私人學習參考，不是醫療建議；現代病名關聯仍需辨證與來源核對。</span></div>
        <div class="k-detail-study-layout">
          <main class="k-detail-panels">
            ${panels.map((panel) => `<section class="k-detail-panel" id="knowledge-section-${panel.id}" data-detail-panel="${panel.id}"><h2>${esc(panel.label)}</h2>${panel.content}</section>`).join("")}
          </main>
          <aside class="k-detail-sidebar" aria-label="學習卡快速導覽">
            <section class="k-detail-sidebar-box">
              <h3>快速導覽</h3>
              ${panels.map((panel, index) => `<button type="button" data-detail-jump="${panel.id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(panel.label)}</button>`).join("")}
            </section>
            <section class="k-detail-sidebar-box k-detail-review-box">
              <h3>資料狀態</h3>
              <p>${statusPill(record.review_status)}</p>
              <small>內容需依教材、機構資料庫與 Ting 課件逐欄核對。</small>
              ${window.AcuTingReview ? window.AcuTingReview.strip(kind, record.id, record.review_status) : ""}
            </section>
          </aside>
        </div>
      </div>`;
  }

  function formulaPanels(record) {
    const exam = record.english_exam_track || {};
    const actions = cleanList(record.actions_en).length ? record.actions_en : (cleanList(exam.actions_en).length ? exam.actions_en : []);
    const indications = cleanList(record.pattern_indications_en).length ? record.pattern_indications_en : (cleanList(exam.pattern_indications_en).length ? exam.pattern_indications_en : []);
    const modifications = cleanList(exam.modifications_en).length ? exam.modifications_en : record.modifications_en;
    /* 濃縮藥粉 only exists on a handful of formulas — 45 of 1,610 composition
       rows — so on every other card it printed 待來源核對 down a whole column.
       Same call Ting already made on 原典用量: the field stays in the data, the
       column only appears on cards that have a value in it. */
    const showGranule = (record.composition || []).some(
      (i) => usableText(i.granule_reference_g) || usableText(i.granule_dose_g));
    const composition = (record.composition || []).map((item) => {
      const herb = (item.pinyin && herbByPinyin.get(normalizeKey(item.pinyin))) || (item.herb_zh && herbByNameZh.get(usableText(item.herb_zh))) || (item.herbZh && herbByNameZh.get(usableText(item.herbZh)));
      const label = [usableText(item.herb_zh), usableText(item.pinyin), usableText(item.herb_en)].filter(Boolean).join(" • ") || "Composition item pending";
      const role = [usableText(item.role_zh), usableText(item.role_en)].filter(Boolean).join(" • ");
      // 原典用量 dropped from the table on Ting's call (「原典用量不用，全部
      // 用生藥煎劑就好」). Only 22 of 201 formulas carry one and the rest
      // printed a column of 待補. The field is NOT deleted from the data —
      // §0 — it simply no longer occupies a column on the card.
      const decoctionDose = doseValue(item.decoction_reference_g || item.decoction_dose_g || item.dose_range);
      const granuleDose = doseValue(item.granule_reference_g || item.granule_dose_g);
      const granuleContext = [usableText(item.granule_concentration_ratio), usableText(item.granule_brand)].filter(Boolean).join(" · ");
      // What this herb does IN THIS FORMULA (Ting: 加上每一味要在這個方劑的功效, 中文就好).
      // Distinct from the herb's own 功效 on its card - 杏仁 alone descends Lung qi;
      // 杏仁 in 麻黃湯 is the 佐 that pairs one-down against Ma Huang's one-up.
      // in_formula_zh comes first: it is the short, curated line rescued from
      // pattern_indications_zh by fix-formula-misfiled-composition.js, and it
      // is more useful here than elucidation_zh's several paragraphs.
      const zhReason = cleanList(item.in_formula_zh || item.role_reason_zh || item.function_in_formula_zh || item.role_note_zh || item.elucidation_zh).join("； ");
      const enReason = cleanList(item.in_formula_en || item.actions_en).join("; ");
      let roleReasonHtml = "";
      if (zhReason && enReason && zhReason !== enReason) {
        roleReasonHtml = `${esc(zhReason)}<br><small class="k-en" style="color:var(--text-muted, #71717a); display:block; margin-top:4px; line-height:1.4; font-weight:normal;">${esc(enReason)}</small>`;
      } else {
        roleReasonHtml = esc(zhReason || enReason);
      }
      return `<tr>
        <th scope="row"><div>${herb ? relationButton(herb.id, label, "herb") : `<span>${esc(label)}</span>`}${role ? `<small>${esc(role)}</small>` : ""}</div></th>
        <td class="k-dose-role">${roleReasonHtml ? roleReasonHtml : '<span class="k-detail-empty">—</span>'}</td>
        <td>${esc(decoctionDose)}</td>
        ${showGranule ? `<td><strong>${esc(granuleDose)}</strong>${granuleContext ? `<small>${esc(granuleContext)}</small>` : ""}</td>` : ""}
      </tr>`;
    }).join("");
    const relatedFormulas = (record.related_formulas || []).map((id) => relationButton(id, formulaLabel(id), "formula")).join("");
    const relatedConditions = entityChips(record.related_conditions);
    /* 現代運用索引 read only modern_clinical_use_tags, which is null on most
       formulas — so the section rendered "—" while the record was actually
       carrying 感冒 / Common Cold and 營衛不和 / Ying-Wei Disharmony in
       condition_tags_* and pattern_tags_*. The bilingual tag layer existed and
       nothing rendered it (template lesson 9, and lesson 2's warning that the
       tag layer dies silently because the card still looks fine).
       Pairs are index-aligned per §2; a zh with no en shows the zh alone rather
       than a half-translation. */
    const bilingualTagChips = (zhList, enList, kindZh, kindEn) => {
      const zh = cleanList(zhList), en = cleanList(enList);
      if (!zh.length && !en.length) return "";
      const maxLen = Math.max(zh.length, en.length);
      const chips = [];
      for (let i = 0; i < maxLen; i++) {
        const z = (zh[i] || "").trim();
        const e = (en[i] || "").trim();
        const label = (z && e && z.toLowerCase() !== e.toLowerCase()) ? `${z} \u00B7 ${e}` : (z || e);
        const search = z || e;
        chips.push(`<button type="button" class="k-modern-chip k-chip-${kindEn}" data-search-term="${esc(search)}"
          title="${esc(kindZh)} — 點擊全站搜尋">${esc(label)}</button>`);
      }
      return chips.join("");
    };
    const treatsZh = cleanList(record.modern_applications_zh || record.treats_zh);
    const treatsEn = cleanList(record.modern_applications_en || record.treats_en || exam.treats_en);
    const treatsChips = bilingualTagChips(treatsZh, treatsEn, "現代運用", "condition");
    const condChips = bilingualTagChips(record.condition_tags_zh, record.condition_tags_en, "病證", "condition");
    const patChips = bilingualTagChips(record.pattern_tags_zh, record.pattern_tags_en, "證型", "pattern");

    const allModernChips = [condChips, patChips, treatsChips].filter(Boolean).join("");
    const totalModernCount = Math.max(treatsZh.length, treatsEn.length) + (cleanList(record.condition_tags_zh)).length + (cleanList(record.pattern_tags_zh)).length;

    let modernIndexHtml = '<p class="k-detail-empty">待補</p>';
    if (allModernChips) {
      if (totalModernCount > 8) {
        modernIndexHtml = `<details class="k-chip-drawer" open>
          <summary class="k-chip-drawer-summary">
            <span>現代運用標籤雲（共 ${totalModernCount} 項，點擊可折疊/展開）</span>
            <span class="k-chip-toggle-icon"></span>
          </summary>
          <div class="k-chip-drawer-body">
            <div class="k-chip-cloud">${allModernChips}</div>
          </div>
        </details>`;
      } else {
        modernIndexHtml = `<div class="k-chip-cloud">${allModernChips}</div>`;
      }
    }

    /* American Dragon 證型 sat under 主治證型 as its own subhead until 66d3e72
       rewrote this panel. Restoring it verbatim would double-print: on 202 of
       the 212 formulas that carry ad_syndromes_en it is the same list as
       pattern_indications_en, already paired with the 中文 line right above.
       Ten formulas carry something genuinely different — 桂枝湯 Chest Bi,
       理中丸 Colon Cold, 六一散 summer-heat — and those are the ones that were
       lost. Same 80% test as the modern index, one shared helper. */
    const adSyndromes = cleanList(record.ad_syndromes_en);
    const adSyndromesBlock = (adSyndromes.length && !alreadyShown(adSyndromes, [indications, record.pattern_indications_en]))
      ? `<h4 class="k-subhead">American Dragon 證型 Syndromes</h4>${detailList(adSyndromes)}`
      : "";

    const safety = [...new Set([...(record.safety_flags || []), ...(record.herb_drug_cautions || [])])];
    const contraindicationsZh = cleanList(record.contraindications_zh || record.cautions_zh);
    const contraindicationsEn = cleanList(record.contraindications_en || exam.contraindications_en);
    const contraHtml = (contraindicationsZh.length || contraindicationsEn.length)
      ? detailPairedList(contraindicationsZh, contraindicationsEn)
      : detailList(safetyList(safety));

    return [
      { id: "core", label: "考試核心 Exam Core", content: `${formulaExamBanner(record)}${formulaSongSection(record)}${formulaDerivedFrom(record)}${formulaGlanceRow(record)}<div class="k-detail-columns">${detailSection("功用", "Actions", detailPairedList(record.actions_zh, actions))}${detailSection("主治證型", "Pattern indications", detailPairedList(record.pattern_indications_zh, indications) + adSyndromesBlock)}${formulaSymptomSection(record)}${detailSection("常見加減與鑑別", "Modifications & differentiation", detailPairedList(record.modifications_zh, modifications) + (cleanList(record.ad_modifications_en).length ? `<h4 class="k-subhead">American Dragon 加減</h4>${detailList(record.ad_modifications_en)}` : ""))}${detailSection("方劑群組", "Comparison group", usableText(record.comparison_group) ? `<p>${esc(comparisonGroupLabel(record.comparison_group))}</p>` : "")}</div>${formulaDepthSection(record, "fang_yi_zh", "方義 為什麼這樣配", "Formula rationale（CloudTCM 中文深度層）")}${detailSection("方劑家族 加減變化", "Base formula → what changed → what it treats", formulaFamilySection(record))}${detailSection("類方鑑別", "How this differs from its neighbours", formulaRadarSection(record) + formulaCompareSection(record))}` },
      { id: "composition", label: "組成中藥 Composition", content: detailSection("組成與君臣佐使 · 方劑分析", "角色 · 本方功效 · 原方用量 · 科學中藥用量；點選中藥可進入單味藥卡", composition ? `${record.composition_suspect ? `<p class="k-comp-suspect">⚠️ 這個方的組成只有一味，而且那一味就是方名的開頭 —— 很可能是匯入時被截斷，<strong>不要當成完整組成</strong>。待由課件補齊。</p>` : ""}<div class="k-dose-table-wrap"><table class="k-dose-table"><thead><tr><th>中藥 Herb</th><th>本方功效</th><th>生藥煎劑參考 g</th>${showGranule ? "<th>濃縮藥粉參考 g</th>" : ""}</tr></thead><tbody>${composition}</tbody></table></div>${usableText(record.administration_zh) ? `<p class="k-admin">服法 Administration：${esc(record.administration_zh)}</p>` : ""}${showGranule ? `<p class="k-dose-caution">濃縮藥粉克數受廠牌、濃縮倍率、劑型與處方情境影響；必須保留來源，不由生藥克數自動換算。</p>` : ""}` : `<p class="k-detail-empty">組成待補 / Composition pending</p>${record.composition_cleared_note ? `<p class="k-comp-suspect">⚠️ 原本這裡有一筆「組成」，其實是方名去掉劑型後綴被當成藥材（例：瀉心湯 → 瀉心），已清除。真正的組成待由課件補齊。</p>` : ""}`) },
      { id: "pairs", label: "藥對 Herb pairs", content: detailSection("藥對與配伍意義", "Herb pairs and why they are paired", formulaPairsSection(record)) },
      { id: "clinical", label: "臨床理解 Clinical", content: `${formulaHdiSection(record)}${detailSection("我的病例", "Visits where I prescribed this", formulaCaseSection(record))}${formulaDepthSection(record, "zhu_zhi_zh", "主治深度 病機展開", "Indication depth（CloudTCM 中文深度層）")}${formulaDepthSection(record, "notes_zh", "源流與臨床筆記", "History & clinical notes（CloudTCM 中文深度層）")}${formulaModernSection(record)}${formulaModernDiseaseSection(record)}${detailSection("現代運用索引", "Modern application tags（中英對照，點擊全站搜尋）", modernIndexHtml)}${detailSection("相關病名與證型", "Related conditions and patterns", (record.related_conditions || []).length ? `<div class="k-chip-cloud">${relatedConditions}</div>` : "")}${detailSection("相關方劑", "Compare, differentiate, continue studying", relatedFormulas ? `<div class="k-chip-cloud">${relatedFormulas}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("學習備註", "Study context", (usableText(record.clinical_use_note) ? `<p>${esc(usableText(record.clinical_use_note))}</p>` : "<p class=\"k-detail-empty\">-</p>"))}` },
      { id: "safety", label: "安全與來源 Safety", content: `${detailSection("⚠️ 禁忌與注意事項", "Contraindications & Cautions", contraHtml)}${detailSection("來源", "Sources", sourceLinks(record))}` },
      // 我的臨床筆記 — her own layer, deliberately its own tab so it is never
      // confused with sourced content (see js/notes.js header).
      { id: "notes", label: "我的筆記 My Notes", content: notesPanel("formula", record) }
    ];
  }

  /* Herb-name linkifier. Ting: 推薦配伍中藥 建議可以加上中英文標籤跟連接.
     Any 中藥 named inside an indication line or a 對藥 becomes a clickable
     bilingual chip that opens that herb's card (the dialog already delegates
     [data-detail-kind][data-detail-id] clicks). Longest names match first so
     懷牛膝 wins over 牛膝; a herb never links to itself. */
  const HERB_NAME_INDEX = (() => {
    const m = new Map();
    ((K.herbs && K.herbs.records) || []).forEach((h) => {
      if (h.name_zh) m.set(h.name_zh, h);
      (h.aliases_zh || []).forEach((a) => { if (a && !m.has(a)) m.set(a, h); });
    });
    return m;
  })();
  const HERB_NAME_RE = (() => {
    const names = [...HERB_NAME_INDEX.keys()].filter((n) => n.length >= 2)
      .sort((a, b) => b.length - a.length)
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return names.length ? new RegExp(names.join("|"), "g") : null;
  })();
  function herbChipHtml(h, label) {
    const sub = [h.pinyin, h.name_en].filter(Boolean).join(" · ");
    return `<button type="button" class="k-herb-link" data-detail-kind="herb" data-detail-id="${esc(h.id)}"` +
      ` title="${esc(sub)}">${esc(label)}<small>${esc(h.pinyin || h.name_en || "")}</small></button>`;
  }
  function linkifyHerbs(text, selfId) {
    const safe = esc(text);
    if (!HERB_NAME_RE) return safe;
    return safe.replace(HERB_NAME_RE, (name) => {
      const h = HERB_NAME_INDEX.get(name);
      if (!h || h.id === selfId) return name;
      return herbChipHtml(h, name);
    });
  }

  /* 西藥詳卡(2026-08-12)。
   *
   * 這顆按鈕先前是壞的:`openKnowledgeDetail` 只認得 formula 與 herb,pharm 查不到
   * 記錄就靜靜 return —— 按鈕在、按了什麼都不會發生。**按了沒反應比沒有按鈕更糟**,
   * 它讀起來像「我查過了,沒有更多」。
   *
   * 顯示的欄位全部來自官方藥品標籤(DailyMed / MedlinePlus),而且已經有
   * `validate-pharm-standard.js` 的 §0 閘門在守:安全欄位沒有 verified_exact 的
   * 官方來源就不准存在。所以這裡不是「把沒人覆核的內容放上畫面」——
   * 與方劑那 26 段抓取來的效益宣稱(A0b)剛好相反,那批仍然全部隱藏。
   *
   * 排序照臨床急迫性,不照資料表順序:黑框警告 → 禁忌 → 警語 → 嚴重不良反應 →
   * 孕哺 → 交互作用。59 種藥裡 25 種有黑框警告,先前一種都沒顯示過。 */
  function pharmPanels(record) {
    const pair = (zh, en) => detailPairedList(zh, en, "");
    const has = (...keys) => keys.some((k) => {
      const v = record[k];
      return Array.isArray(v) ? v.length : usableText(v);
    });
    const boxed = has("boxed_warning_zh", "boxed_warning_en")
      ? `<div class="k-boxed-warning">${modeText("⚠️ 黑框警告 BOXED WARNING（FDA 最高級別）", "⚠️ BOXED WARNING (FDA's most serious)")}
           ${pair(record.boxed_warning_zh, record.boxed_warning_en)}</div>`
      : "";
    const safety = [
      boxed,
      detailSection("禁忌", "Contraindications", pair(record.contraindications_zh, record.contraindications_en)),
      detailSection("警語與注意事項", "Warnings & precautions", pair(record.warnings_zh, record.warnings_en)),
      detailSection("嚴重不良反應", "Serious adverse effects", pair(record.serious_adverse_effects_zh, record.serious_adverse_effects_en)),
      detailSection("常見不良反應", "Adverse effects", pair(record.adverse_effects_zh, record.adverse_effects_en)),
      detailSection("懷孕與哺乳", "Pregnancy & lactation", pair(record.pregnancy_lactation_zh, record.pregnancy_lactation_en)),
      detailSection("藥物交互作用", "Drug interactions", pair(record.drug_interactions_zh, record.drug_interactions_en)),
    ].join("");
    const pharmacology = [
      detailSection("作用機轉", "Mechanism of action", pair(record.mechanism_zh, record.mechanism_en)),
      detailSection("生理作用", "Physiologic effect", pair(record.physiologic_effect_zh, record.physiologic_effect_en)),
      detailSection("作用部位", "Site of action", pair(record.site_of_action_zh, record.site_of_action_en)),
      detailSection("適應症", "Indications", pair(record.indications_zh, record.indications_en)),
    ].join("");
    // 中西醫關聯是本庫自己寫的,不是官方標籤 —— 與上面兩區分開放,標明出處性質。
    const integrative = [
      detailSection("與中醫的關聯（本庫註記，非官方標籤）", "TCM relation (this library's note, not label text)",
        pair(record.tcm_relation_note_zh, record.tcm_relation_note_en)),
    ].join("");
    return [
      { id: "safety", label: modeText("安全 Safety", "Safety"), content: safety },
      { id: "pharmacology", label: modeText("藥理 Pharmacology", "Pharmacology"), content: pharmacology },
      { id: "integrative", label: modeText("中西醫 Integrative", "Integrative"), content: integrative },
    ];
  }

  /* 中西藥交互作用(2026-08-12)。
   *
   * 這個欄位過去從來沒有被渲染過(A0b)。逐條審完 26 段之後,規則是:
   * **只顯示 `data/quality/formula_hdi_review.json` 標記 render_eligible 的條目**。
   * 目前只有 1 段合格 —— 小柴胡湯與干擾素的間質性肺炎禁忌,它講的是危害而且有
   * PubMed / LiverTox 文獻。其餘 25 段講的是「本方減輕西藥不良反應」且無來源,
   * 留在資料裡但不上畫面(寧缺勿造)。
   *
   * 雜湊也在這裡再驗一次,不是只信 JSON 的旗標:審查是對**當時那句話**的判斷,
   * 有人改了字卻沒重審,這裡就不顯示。驗證器擋 CI,這一層擋畫面 —— 兩道都要,
   * 因為 CI 綠燈不代表使用者手上那份 bundle 是同一份。 */
  function formulaHdiSection(record) {
    const review = (K.formulaHdiReview && K.formulaHdiReview.entries) || {};
    const en = record.herb_drug_interactions_en || [];
    const zh = record.herb_drug_interactions_zh || [];
    const rows = [];
    en.forEach((text, i) => {
      const entry = review[`${record.id}#${i}`];
      if (!entry || entry.render_eligible !== true) return;
      // 雜湊比對在 build 時做(瀏覽器沒有同步 sha1),build-data 會把通過比對的
      // 原文放進 verified_texts。這裡比對原文本身 —— 保證同一件事:
      // 顯示的字必須就是被審過的那句話,不是後來被改掉的版本。
      const verified = (K.formulaHdiReview && K.formulaHdiReview.verified_texts) || [];
      if (!verified.includes(String(text).trim())) return;
      const zhText = usableText(zh[i]);
      rows.push(`<li>${zhText ? `<strong>${esc(zhText)}</strong><br>` : ""}${esc(String(text).trim())}</li>`);
    });
    if (!rows.length) return "";
    const srcs = (record.herb_drug_interaction_sources || []).filter((u) => /^https?:/.test(u));
    return `<section class="k-detail-section k-hdi-section">
      <h3>${esc(modeText("⚠️ 與西藥的交互作用", "⚠️ Herb-drug interactions"))}</h3>
      <ul>${rows.join("")}</ul>
      ${srcs.length ? `<p class="k-meta">${srcs.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//, "").slice(0, 46))}</a>`).join(" · ")}</p>` : ""}
    </section>`;
  }

  function herbPanels(record) {
    const exam = record.english_exam_track || {};
    const props = record.tcm_properties || {};
    const dose = record.dosage_g || {};
    const safety = record.safety_info || {};
    const visual = record.visual_reference || {};
    
    const tradFunctions = cleanList(record.functions_zh).length
      ? cleanList(record.functions_zh)
      : cleanList(record.traditional_functions_zh);
    const modernPharm = cleanList(record.modern_pharmacology_zh).length
      ? cleanList(record.modern_pharmacology_zh)
      : cleanList(record.modern_functions_zh);
    const actionsEn = cleanList(record.actions_en);
    const indicationsZh = cleanList(record.indications_zh);
    const indicationsEn = cleanList(record.indications_en);
    /* Same alignment rule as actionsAligned above: only pair by index when the
       two arrays actually correspond 1:1. This section used to render
       indications_zh only and silently drop a fully-populated, index-aligned
       indications_en — the record had bilingual content but the card only
       ever showed the Chinese half. */
    const indicationsAligned = indicationsEn.length === indicationsZh.length && indicationsZh.length > 0;
    const condTags = cleanList(record.condition_tags_zh);
    const CONDITION_TAG_EN_MAP = {
      "經閉": "Amenorrhea",
      "痛經": "Dysmenorrhea",
      "產後惡露腹痛": "Postpartum Abdominal Pain",
      "跌打損傷": "Traumatic Injury",
      "癥瘕積聚": "Abdominal Masses",
      "腸燥便秘": "Dry Constipation",
      "肺癰": "Lung Abscess",
      "腸癰": "Intestinal Abscess",
      "久咳失音": "Chronic Cough & Lost Voice",
      "聲音嘶啞": "Hoarseness / Loss of Voice",
      "咽喉腫痛": "Sore Throat",
      "久瀉久痢": "Chronic Diarrhea & Dysentery",
      "脫肛": "Prolapse of Rectum",
      "便血": "Blood in Stool",
      "崩漏": "Uterine Bleeding",
      "下痢滑脫": "Unremitting Diarrhea",
      "瘡瘍不斂": "Non-healing Sores",
      "久咳虛喘": "Chronic Deficiency Cough & Wheeze",
      "自汗盜汗": "Spontaneous & Night Sweating",
      "津傷口渴": "Fluid Damage & Thirst",
      "遺精尿頻": "Spermatorrhea & Polyuria",
      "心悸失眠": "Palpitations & Insomnia",
      "久咳少痰": "Chronic Dry Cough",
      "虛熱消渴": "Deficiency Heat Wasting & Thirst",
      "蛔厥腹痛": "Roundworm Abdominal Pain",
      "膽道蛔蟲": "Biliary Ascariasis",
      "五更瀉": "5 AM / Daybreak Diarrhea",
      "脾胃虛寒久瀉": "SP Deficiency Cold Diarrhea",
      "脘腹冷痛": "Cold Abdominal Pain",
      "晨瀉": "Daybreak Diarrhea"
    };

    /* Only pair 功效 with actions_en when the two arrays are index-aligned. On
       older records actions_en is an independent English action list of a
       different length, and pairing it by index printed the WRONG English on
       every tag after the first gap. Unaligned -> Chinese tags stand alone and
       the English actions render in their own section below. */
    const actionsAligned = actionsEn.length === tradFunctions.length && tradFunctions.length > 0;
    const bilingualFunctions = tradFunctions.map((zh, i) => {
      const en = actionsAligned ? (actionsEn[i] || "") : "";
      return en ? `<span class="k-chip" style="background:#ecfdf5;color:#047857;font-weight:500;padding:4px 10px;margin:3px;border-radius:6px;display:inline-block;">${esc(zh)} <small style="opacity:0.85;margin-left:4px;font-weight:normal;color:#065f46;">(${esc(en)})</small></span>` : tag(zh);
    }).join("");

    /* Bilingual tag chips. English comes from the record's own index-aligned
       `_en` array first (the standard), then the shared fallback map. A tag
       with no English still renders — missing English is a gap to fill, not a
       reason to hide content. */
    const bilingualChips = (zhList, enList, css, fallbackMap) => zhList.map((zh, i) => {
      const en = (enList && enList[i]) || (fallbackMap && fallbackMap[zh]) || "";
      if (!en) return `<span class="k-chip" style="${css}">${esc(zh)}</span>`;
      return `<span class="k-chip" style="${css}">${esc(zh)} <small style="opacity:0.85;margin-left:4px;font-weight:normal;">(${esc(en)})</small></span>`;
    }).join("");

    /* Condition tags search the whole site. They mostly do NOT match a
       condition record 1:1 (水腫/泄瀉/痰飲 are symptoms, not canon entries), so
       a direct link would be dead most of the time; a search always resolves
       and shows every herb / formula / condition carrying that term. */
    const condEn = cleanList(record.condition_tags_en);
    const bilingualCondTags = condTags.map((zh, i) => {
      const en = condEn[i] || CONDITION_TAG_EN_MAP[zh] || "";
      return `<button type="button" class="k-cond-tag" data-search-term="${esc(zh)}" title="搜尋「${esc(zh)}」相關內容">` +
        `${esc(zh)}${en ? `<small>(${esc(en)})</small>` : ""}</button>`;
    }).join("");
    const bilingualModernPharm = bilingualChips(
      modernPharm,
      cleanList(record.modern_functions_en),
      "background:#e0f2fe;color:#0369a1;padding:4px 10px;margin:3px;border-radius:6px;display:inline-block;"
    );
    
    const relatedFormulas = (record.related_formulas || []).map((id) => relationButton(id, formulaLabel(id), "formula")).join("");
    const keyPairs = (record.key_pairs || []).map((p) => {
      if (typeof p === "string") return `<div class="k-pair-item"><strong>${linkifyHerbs(p, record.id)}</strong></div>`;
      const zh = p.rationale_zh || p.rationale || "";
      const en = p.rationale_en || "";
      return `<div class="k-pair-item" style="margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-left:3px solid #0284c7;border-radius:4px;">
        <strong>${linkifyHerbs(p.pair || "", record.id)}</strong>
        ${zh ? `<p style="margin:4px 0 0 0;font-size:0.92em;color:#334155;">${linkifyHerbs(zh, record.id)}</p>` : ""}
        ${en ? `<p style="margin:2px 0 0 0;font-size:0.88em;color:#64748b;">${esc(en)}</p>` : ""}
      </div>`;
    }).join("");
    
    /* Safety text lives in safety_info on newer records but at the top level on
       CloudTCM-sourced ones; read both or the panel renders empty. English is
       paired in when the record carries it (Safety deepening from CloudTCM /
       American Dragon is a later pass — see HERB_RECORD_STANDARD §5). */
    const pairEn = (zhList, enList) => zhList.map((zh, i) => {
      const en = (enList && enList[i]) || "";
      return en ? `${zh}（${en}）` : zh;
    });
    const contraList = pairEn(
      cleanList(safety.contraindications_zh).length ? cleanList(safety.contraindications_zh) : cleanList(record.contraindications_zh),
      cleanList(safety.contraindications_en).length ? cleanList(safety.contraindications_en) : cleanList(record.contraindications_en)
    );
    const cautionList = pairEn(
      cleanList(safety.cautions_zh).length ? cleanList(safety.cautions_zh) : cleanList(record.cautions_zh),
      cleanList(safety.cautions_en).length ? cleanList(safety.cautions_en) : cleanList(record.cautions_en)
    );

    return [
      { 
        id: "core", 
        label: "考試與傳統核心 Exam Core", 
        content: `
          ${record.exam_importance ? `<p class="k-exam-badge" style="color:#d97706;font-weight:bold;margin-bottom:8px;">${esc(record.exam_importance)}</p>` : ""}
          ${record.exam_pearl ? `<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:8px 12px;margin:8px 0;border-radius:4px;color:#14532d;font-size:0.95em;"><strong>💡 考試重點 Exam Pearl:</strong> ${esc(record.exam_pearl)}</div>` : ""}
          <div class="k-detail-columns">
            ${detailSection("性味", "Properties & Temp", `<p><strong>${esc(props.four_natures_zh || usableText(record.properties_taste_temp || record.taste_temperature_zh) || "待補")}</strong> · ${esc(Array.isArray(props.five_flavors_zh) ? props.five_flavors_zh.join("、") : "")}</p>`)}
            ${detailSection("歸經", "Channels entered", detailList(props.meridian_tropism_zh || record.channels_entered || record.channels_zh))}
            ${/* 2026-08-12 紅線 4:此處原本是 `dose.standard_daily_g || "6~15g"`。
                  358 張中藥卡有 200 張沒有 standard_daily_g,於是全部被填上編造的
                  「6~15g」—— 其中 17 張標記有毒:雄黃卡自身寫「內服 0.05–0.1g,
                  入丸散用」卻顯示 6~15g(300 倍),硃砂 150 倍,細辛卡自身寫
                  「絕不可超過 5g」而畫面蓋過它。劑量寧可留白。
                  刻意「不」自動改讀 record.dosage:那個欄位含「食療用量範圍」,
                  在 77 張卡上食療上限高於藥用上限,盲撈會顯示更危險的數字。
                  154 張卡的真實上限確實在那裡,接上去需要先定形狀公約(見
                  docs/TING_DECISION_QUEUE.md B3)。*/ ""}
            ${detailSection("常用劑量", "Standard & Granule Dose", `<p><strong>生藥日服量：</strong>${esc(dose.standard_daily_g || "待補")}</p>${dose.granule_dose_g ? `<p><strong>濃縮藥粉 (5:1)：</strong>${esc(dose.granule_dose_g)}</p>` : ""}`)}
            ${detailSection("使用部位", "Part used", `<p>${esc(props.part_used_zh || "待補")}</p>`)}
          </div>
          ${detailSection("功效 (Actions)", "傳統功效 · 中英對照", `<div class="k-chip-cloud">${bilingualFunctions}${actionsAligned ? "" : actionsEn.map((a) => `<span class="k-chip" style="background:#ecfdf5;color:#047857;padding:4px 10px;margin:3px;border-radius:6px;display:inline-block;">${esc(a)}</span>`).join("")}</div>`)}
          ${record.pao_zhi_notes_zh ? detailSection("炮製作用 (Pao Zhi)", "炮製方式與臨床差異（來源見下方引用）", `<p style="background:#fef3c7;color:#92400e;padding:8px 12px;border-radius:6px;font-size:0.92em;margin-top:6px;">${esc(record.pao_zhi_notes_zh)}</p>`) : ""}
          ${modernPharm.length ? detailSection("現代藥理 (Modern Pharmacology)", "實證藥理作用", `<div class="k-chip-cloud">${bilingualModernPharm}</div>`) : ""}
        ` 
      },
      { 
        id: "clinical", 
        label: "主治與症狀 Indications", 
        content: `
          ${detailSection("主治症狀與病機", "Indications（配伍中藥可點開）", indicationsZh.length ? `<ul class="k-detail-list">${indicationsZh.map((zh, i) => {
            const en = indicationsAligned ? indicationsEn[i] : "";
            return `<li>${linkifyHerbs(zh, record.id)}${en ? `<br><small style="color:#64748b;">${esc(en)}</small>` : ""}</li>`;
          }).join("")}</ul>${!indicationsAligned && indicationsEn.length ? `<div class="k-detail-list" style="margin-top:6px;color:#64748b;font-size:0.92em;">${indicationsEn.map((v) => `<p>${esc(v)}</p>`).join("")}</div>` : ""}` : (indicationsEn.length ? `<ul class="k-detail-list">${indicationsEn.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>` : '<p class="k-detail-empty">待補 / Content pending source review</p>'))}
          ${record.key_indications_en && record.key_indications_en.length ? detailSection("重點主治 (Key Indications)", "考試重點主治（來源見下方引用）", detailList(record.key_indications_en)) : ""}
          ${detailSection("病名與症狀索引標籤", "Common Condition Tags", `<div class="k-chip-cloud">${bilingualCondTags}</div>`)}
          ${detailSection("相關經典方劑", "Classical Formulas containing this herb", relatedFormulas ? `<div class="k-chip-cloud">${relatedFormulas}</div>` : '<p class="k-detail-empty">待補</p>')}
        ` 
      },
      { 
        id: "pairing", 
        label: "對藥與古文 Pairing & Classics", 
        content: `
          ${detailSection("經典對藥 (Herb Pairs)", "Key pairings and rationale", keyPairs || herbPairsSection(record))}
          ${record.classical_text_zh ? detailSection("古籍原文 (Classical Text)", "本草原文與英譯", `<blockquote class="k-classic">${linkifyHerbs(record.classical_text_zh, record.id)}${record.classical_text_en ? `<span class="k-classic-en">${esc(record.classical_text_en)}</span>` : ""}</blockquote>`) : ""}
          ${record.classical_text_zh ? detailSection("古文典籍記載", "Classical text quotation", `<blockquote class="k-classic-quote" style="border-left:3px solid #d97706;padding-left:10px;font-style:italic;color:#451a03;margin:8px 0;line-height:1.6;">${esc(record.classical_text_zh).replace(/\n/g, '<br>')}</blockquote>`) : ""}
          ${detailSection("學習筆記", "Study context", (usableText(record.clinical_use_note) ? `<p>${esc(usableText(record.clinical_use_note))}</p>` : "<p class=\"k-detail-empty\">-</p>"))}
        ` 
      },
      { 
        id: "safety", 
        label: "毒性安全與來源 Safety & Sources", 
        content: `
          ${safety.toxicity_zh ? detailSection("毒性說明 (Toxicity)", "Toxicity review", `<p style="color:#b91c1c;font-weight:bold;">${esc(safety.toxicity_zh)}</p><p style="color:#7f1d1d;font-size:0.9em;">${esc(safety.toxicity_en || "")}</p>`) : ""}
          ${detailSection("禁忌症 (Contraindications)", "Strict contraindications", contraList.length ? `<ul class="k-detail-list">${contraList.map((v) => `<li>${linkifyHerbs(v, record.id)}</li>`).join("")}</ul>` : '<p class="k-detail-empty">待補 / Content pending source review</p>')}
          ${detailSection("慎用與副作用 (Cautions & Interactions)", "Cautions, pregnancy, and drug interactions（提到的中藥可點開）", cautionList.length ? `<ul class="k-detail-list">${cautionList.map((v) => `<li>${linkifyHerbs(v, record.id)}</li>`).join("")}</ul>` : '<p class="k-detail-empty">待補 / Content pending source review</p>')}
          ${detailSection("權威來源引用與圖像連結 (Sources & References)", "Referenced sources & external visual links", sourceLinks(record))}
        `
      },
      // 我的臨床筆記 — her own layer, deliberately its own tab so it is never
      // confused with sourced content (see js/notes.js header).
      { id: "notes", label: "我的筆記 My Notes", content: notesPanel("herb", record) }
    ];
  }

  function openKnowledgeDetail(kind, id) {
    // pharm 先前不在這裡,所以「查看西藥卡」按鈕按了靜靜什麼都不做。
    const record = kind === "formula" ? formulaById.get(id)
      : kind === "pharm" ? pharmDrugs.find((d) => d.id === id)
      : herbById.get(id);
    if (!record) return;
    const dialog = ensureDetailDialog();
    const panels = kind === "formula" ? formulaPanels(record)
      : kind === "pharm" ? pharmPanels(record)
      : herbPanels(record);
    el("knowledgeDetailContent").innerHTML = detailShell(record, kind, panels);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  /* Category filter chips — the single category system (herb-atlas look).
     One chip per category with a small round 圖示 (first 中文 char), a count,
     and a one-line description under the row for the active category.
     Raw category labels are inconsistent in the data ("清熱劑" vs
     "清熱劑 / Clear Heat"), which used to split one category into two chips;
     labels are merged by 中文 name unless they carry genuinely different
     English subcategories (herb 解表藥 Warm vs Cool Acrid stay separate).
     Chips drive the existing hidden <select>; merged chips filter via a
     "||"-joined value that the grid updaters split. */
  function categoryModeLabel(raw) {
    const text = String(raw || "").trim();
    const zh = text.split("/")[0].trim();
    const en = text.split("/").slice(1).join("/").trim();
    return displayLabel(zh, en, text);
  }

  function categorySummaryLabel(value, emptyLabel = modeText("全部 All", "All")) {
    if (!value) return emptyLabel;
    return String(value).split("||").map(categoryModeLabel).join(" / ");
  }

  function buildCategoryChips(containerId, selectId, records, categoryFn, updateFn, descMap) {
    const container = el(containerId);
    const select = el(selectId);
    if (!container || !select) return;

    const zhOf = (raw) => String(raw).split("/")[0].trim();
    const enOf = (raw) => String(raw).split("/").slice(1).join("/").trim();

    const counts = new Map();
    records.forEach((r) => { const c = categoryFn(r); if (c) counts.set(c, (counts.get(c) || 0) + 1); });

    // group raw labels by 中文 name; merge when English suffixes don't disagree
    const groups = new Map();
    for (const raw of counts.keys()) {
      const zh = zhOf(raw);
      if (!groups.has(zh)) groups.set(zh, []);
      groups.get(zh).push(raw);
    }
    const chips = [];
    for (const [zh, raws] of groups) {
      const ens = [...new Set(raws.map(enOf).filter(Boolean))];
      if (ens.length <= 1) {
        chips.push({
          value: raws.join("||"),
          zh, en: ens[0] || "",
          count: raws.reduce((s, r) => s + counts.get(r), 0)
        });
      } else {
        raws.forEach((raw) => chips.push({ value: raw, zh, en: enOf(raw), count: counts.get(raw) }));
      }
    }
    chips.sort((a, b) => b.count - a.count || a.zh.localeCompare(b.zh));

    // merged "a||b" values need a real <option> or select.value assignment is dropped
    chips.forEach((c) => {
      if (c.value.includes("||") && ![...select.options].some((o) => o.value === c.value)) {
        const o = document.createElement("option");
        o.value = c.value; o.textContent = c.zh;
        select.appendChild(o);
      }
    });

    const chipHtml = (value, zh, en, n, active) => {
      const main = isEnglishMode() ? (en || zh) : zh;
      const sub = isEnglishMode() ? (zh && en ? zh : "") : en;
      return `<button type="button" class="cat-chip${active ? " active" : ""}" data-cat="${esc(value)}">
        <span class="cat-chip__ico" aria-hidden="true">${esc(zh.charAt(0))}</span>
        <span class="cat-chip__t">${esc(main)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>
        <span class="cat-chip__n">${n}</span>
      </button>`;
    };
    const render = () => {
      const cur = select.value;
      const active = chips.find((c) => c.value === cur);
      const desc = active && descMap ? descMap[active.zh] : "";
      container.innerHTML =
        chipHtml("", "全部", "All", records.length, !cur)
        + chips.map((c) => chipHtml(c.value, c.zh, c.en, c.count, cur === c.value)).join("")
        + (desc ? `<p class="cat-desc">${esc(displayLabel(active.zh, active.en, active.zh))} — ${esc(desc)}</p>` : "");
    };
    render();
    document.addEventListener("acuting:content-mode", render);
    container.addEventListener("click", (event) => {
      const b = event.target.closest(".cat-chip");
      if (!b) return;
      select.value = b.dataset.cat;
      updateFn();
      render();
    });
    select.classList.add("is-chip-hidden");
  }

  // One-line 解釋 per formula category (shown under the chips when selected).
  const FORMULA_CATEGORY_DESC = {
    "解表劑": "外感表證：風寒、風熱、表虛表實。Wind-cold, wind-heat, early exterior patterns.",
    "清熱劑": "裡熱：熱毒、濕熱、血熱、虛熱。Heat, fire toxin, damp-heat, blood heat, deficiency heat.",
    "和解劑": "少陽、肝脾不和、寒熱錯雜。Shaoyang, liver-spleen disharmony, mixed hot-cold.",
    "溫裡劑": "裡寒、陽虛、寒痛、亡陽欲脫。Interior cold, yang deficiency, cold pain, collapse patterns.",
    "補益劑": "氣血陰陽精之虛損。Qi, blood, yin, yang, essence, chronic deficiency.",
    "理氣劑": "氣滯、氣逆、情志不暢。Qi stagnation, rebellious qi, emotional constraint.",
    "理血劑": "血瘀、出血、經痛、癥瘕。Blood stasis, bleeding, menstrual pain, masses.",
    "祛濕劑": "水濕、水腫、淋證、風濕。Dampness, edema, urinary difficulty, wind-damp.",
    "祛痰劑": "痰濕、痰熱、咳嗽、眩暈。Phlegm-damp, phlegm-heat, cough, dizziness.",
    "化痰劑": "痰濕、痰熱、咳嗽、瘰癧。Phlegm patterns: cough, nodules, dizziness.",
    "安神劑": "失眠、心悸、煩躁不安。Insomnia, palpitations, restlessness.",
    "治風劑": "內風、外風：抽搐、眩暈、中風。Internal/external wind: tremor, dizziness, spasms.",
    "消食劑": "食積、脹滿、噯腐吞酸。Food stagnation, bloating, reflux.",
    "固澀劑": "滑脫不禁：自汗、遺精、久瀉、帶下。Leakage: sweat, essence, chronic diarrhea, discharge.",
    "瀉下劑": "便祕、積滯、水飲內停。Constipation, accumulation, retained fluids.",
    "開竅劑": "神昏竅閉：熱閉、寒閉。Blocked orifices: loss of consciousness patterns.",
    "治燥劑": "外燥、內燥：肺燥、腸燥。Dryness of lung and intestines.",
    "驅蟲劑": "腸道蟲積。Intestinal parasites.",
    "癰瘍劑": "瘡瘍腫毒、內癰。Sores, abscesses, toxic swellings."
  };

  // ---- Formulas ------------------------------------------------------------
  const formulaHost = el("formulaRecords");
  if (formulaHost) {
    const records = formulas;
    if (records.length > 24) {
      const hasContent = (f) => [
        f.actions_en,
        f.actions_zh,
        f.functions_zh,
        f.effect_zh,
        f.composition,
        f.composition_zh,
        f.pattern_indications_en,
        f.pattern_indications_zh,
        f.indications_zh,
        f.syndromes_zh,
        f.contraindications_en,
        f.contraindications_zh,
        f.cautions_zh
      ].some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value));
      const categoryLabel = (f) => f.category || f.category_en || f.category_id || "uncategorized";
      const categories = [...new Set(records.map(categoryLabel).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      const renderEnhanced = (list) => list.map((f) => {
        const contentReady = hasContent(f);
        const meta = [
          categoryLabel(f),
          f.tier ? `tier: ${f.tier}` : "",
          f.comparison_group ? `group: ${f.comparison_group}` : "",
          f.nccaom_high_yield ? "NCCAOM high-yield" : ""
        ].filter(Boolean).join(" · ");
        const searchTags = (f.modern_clinical_use_tags || []).slice(0, 5);
        const exteriorChips = exteriorContextChips(f);
        if (!contentReady) {
          return `
            <article class="k-row k-formula-skeleton" data-record-id="${esc(f.id)}">
              <div>
                <strong>${esc(f.name_zh)} <small>${esc(f.pinyin)}</small></strong>
                <p class="k-en">${esc(f.name_en)}</p>
                <p class="k-meta">${esc(meta)} · draft content pending</p>
              </div>
              <div class="k-row-side">
                ${statusPill(f.review_status)}
                <p class="k-tags">${modernInlineChips(searchTags, 5)}${exteriorChips}</p>
                <button type="button" class="k-open-detail" data-detail-kind="formula" data-detail-id="${esc(f.id)}">${esc(modeText("查看方劑卡", "Open formula card"))}</button>
              </div>
            </article>`;
        }
        return `
          <article class="k-card" data-record-id="${esc(f.id)}">
            <header>
              <strong>${esc(f.name_zh)} <small>${esc(f.pinyin)}</small></strong>
              ${statusPill(f.review_status)}
            </header>
            <p class="k-en">${esc(f.name_en)}</p>
            <p class="k-meta">${esc(meta)}</p>
            <p class="k-tags">${cleanList(f.pattern_focus_en).slice(0, 3).map(tag).join("")}${modernInlineChips(searchTags, 5)}${exteriorChips}</p>
            ${cleanList(f.safety_flags).length ? `<p class="k-flags">! ${cleanList(f.safety_flags).map(safetyFlagLabel).map(esc).join(" · ")}</p>` : ""}
            <button type="button" class="k-open-detail" data-detail-kind="formula" data-detail-id="${esc(f.id)}">${esc(modeText("查看方劑卡", "Open formula card"))}</button>
          </article>`;
      }).join("");

      const box = document.createElement("div");
      box.innerHTML = `
        <div class="k-toolbar k-toolbar--single">
          <input type="search" id="formulaFilter" placeholder="${esc(modeText("搜尋方劑、拼音、分類、證型、現代標籤… Search formula, pinyin, category, pattern...", "Search formulas, pinyin, category, patterns, modern tags..."))}" class="k-filter" />
        </div>
        <details class="k-category-drawer">
          <summary>
            <span><span class="i18n-zh">分類篩選 </span><span class="i18n-en">Category filters</span></span>
            <small id="formulaCategorySummary">${esc(modeText("全部 All", "All"))} · ${records.length}</small>
          </summary>
          <select id="formulaCategoryFilter" class="k-filter">
            <option value="">All categories</option>
            ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}
          </select>
          <div class="cat-chips" id="formulaCatChips" aria-label="方劑分類篩選"></div>
        </details>
        <div class="k-grid" id="formulaGrid">${renderEnhanced(records)}</div>`;
      formulaHost.appendChild(box);

      const updateFormulaGrid = () => {
        const q = el("formulaFilter").value.trim().toLowerCase();
        const category = el("formulaCategoryFilter").value;
        const hit = records.filter((f) => {
          if (!recordHasConcept(f.modern_clinical_use_tags, activeConcept)) return false;
          const categoryHit = !category || category.split("||").includes(categoryLabel(f));
          const text = [
            f.id,
            f.name_zh,
            f.name_en,
            f.pinyin,
            f.category,
            f.category_en,
            f.comparison_group,
            ...(f.study_tags || []),
            ...(f.modern_clinical_use_tags || [])
          ].join(" ").toLowerCase();
          return categoryHit && (!q || text.includes(q));
        });
        const bar = activeConceptBar();
        const summary = el("formulaCategorySummary");
        if (summary) summary.textContent = `${categorySummaryLabel(category)} · ${hit.length}`;
        el("formulaGrid").innerHTML = bar + (renderEnhanced(hit) || '<p class="k-missing">沒有符合的方劑 / No matching formulas.</p>');
      };
      el("formulaFilter").addEventListener("input", updateFormulaGrid);
      el("formulaCategoryFilter").addEventListener("change", updateFormulaGrid);
      document.addEventListener("acuting:content-mode", updateFormulaGrid);
      buildCategoryChips("formulaCatChips", "formulaCategoryFilter", records, categoryLabel, updateFormulaGrid, FORMULA_CATEGORY_DESC);

      /* Make the 方劑分類 cards bidirectional (Ting: 這邊的按鈕都不是雙向的).
         The cards were static display only. Now clicking one (解表, 清熱, …)
         sets the category filter to the matching full category and scrolls to
         the results, so every category — not just one — browses its formulas. */
      const categoryPanel = el("formulaCategories");
      if (categoryPanel) {
        categoryPanel.querySelectorAll(".formula-category-card").forEach((card) => {
          const badge = card.querySelector("span")?.textContent.trim() || "";
          const match = categories.find((c) => String(c).startsWith(badge));
          if (!match) return;
          card.classList.add("is-clickable");
          card.setAttribute("role", "button");
          card.setAttribute("tabindex", "0");
          const go = () => {
            el("formulaCategoryFilter").value = match;
            updateFormulaGrid();
            el("formulaGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
          };
          card.addEventListener("click", go);
          card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
        });
      }
      // re-run when a tag is tapped anywhere, including from inside a detail card
      conceptListeners.add(() => {
        updateFormulaGrid();
        if (activeConcept) {
          document.querySelector("[data-detail-close]")?.click();
          el("formulaGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      formulaHost.addEventListener("click", (event) => {
        const button = event.target.closest('[data-detail-kind="formula"][data-detail-id]');
        if (button) openKnowledgeDetail("formula", button.dataset.detailId);
      });
    } else {
    const render = (list) => list.map((f) => `
      <article class="k-card">
        <header>
          <strong>${esc(f.name_zh)} <small>${esc(f.pinyin)}</small></strong>
          ${statusPill(f.review_status)}
        </header>
        <p class="k-en">${esc(f.name_en)}</p>
        <p class="k-meta">${esc(f.category_en)}${f.nccaom_high_yield ? " · NCCAOM high-yield" : ""}</p>
        <p class="k-tags">${cleanList(f.pattern_focus_en).map(tag).join("")}</p>
        ${cleanList(f.safety_flags).length ? `<p class="k-flags">⚠ ${cleanList(f.safety_flags).map(safetyFlagLabel).map(esc).join(" · ")}</p>` : ""}
      </article>`).join("");

    const box = document.createElement("div");
    box.innerHTML = `
      <div class="mini-heading">
        <strong>Formula Records / 方劑草稿（${records.length}）</strong>
        <span>來源：data/herbs/formulas.json · 全部為 draft，尚未 source-checked，不可作臨床依據。</span>
      </div>
      <input type="search" id="formulaFilter" placeholder="篩選方名 / pinyin / category…" class="k-filter" />
      <div class="k-grid" id="formulaGrid">${render(records)}</div>`;
    formulaHost.appendChild(box);

    el("formulaFilter").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const hit = q
        ? records.filter((f) =>
            [f.name_zh, f.name_en, f.pinyin, f.category_en, ...(f.study_tags || [])]
              .join(" ").toLowerCase().includes(q))
        : records;
      el("formulaGrid").innerHTML = render(hit) || '<p class="k-missing">沒有符合的方劑。</p>';
    });
  }

    }

  // ---- Herbs ---------------------------------------------------------------
  const herbHost = el("herbRecords");
  if (herbHost) {
    const herbCategory = (h) => h.category || "uncategorized";
    const categories = [...new Set(herbs.map(herbCategory).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const renderHerbs = (list) => list.map((h) => {
      const formulaLinks = (h.related_formulas || []).slice(0, 5);
      const modernTags = (h.modern_use_tags || []).slice(0, 5);
      const safetyFlags = (h.safety_flags || []).slice(0, 4);
      const exteriorChips = exteriorContextChips(h);
      return `
        <article class="k-card k-herb-card" data-record-id="${esc(h.id)}">
          <header>
            <strong>${esc(h.name_zh)} <small>${esc(h.pinyin)}</small></strong>
            ${statusPill(h.review_status)}
          </header>
          <p class="k-en">${esc(h.name_en)}</p>
          <p class="k-meta">${esc(herbCategory(h))}</p>
          <p class="k-meta">${esc((h.channels_entered || []).join(" / "))}</p>
          <p class="k-tags">${modernInlineChips(modernTags, 5)}${exteriorChips}</p>
          ${formulaLinks.length ? `<p class="k-meta">${esc(modeText("相關方劑：", "Related formulas:"))} ${formulaChips(formulaLinks)}</p>` : ""}
          ${safetyFlags.length ? `<p class="k-flags">${esc(modeText("審核：", "Review:"))} ${safetyFlags.map(safetyFlagLabel).map(esc).join(" · ")}</p>` : ""}
          <p class="k-meta">${esc(modeText("草稿 · 來源待審 · 學習參考", "draft · source review pending · study reference only"))}</p>
          <button type="button" class="k-open-detail" data-detail-kind="herb" data-detail-id="${esc(h.id)}">${esc(modeText("查看中藥卡", "Open herb card"))}</button>
        </article>`;
    }).join("");

    herbHost.innerHTML = `
      <div class="k-toolbar k-toolbar--single">
        <input type="search" id="herbFilter" placeholder="${esc(modeText("搜尋中藥、拼音、功效、主治、方劑… Search herb, pinyin, action, indication...", "Search herbs, pinyin, actions, indications, formulas..."))}" class="k-filter" />
      </div>
      <details class="k-category-drawer">
        <summary>
          <span><span class="i18n-zh">分類篩選 </span><span class="i18n-en">Category filters</span></span>
          <small id="herbCategorySummary">${esc(modeText("全部 All", "All"))} · ${herbs.length}</small>
        </summary>
        <select id="herbCategoryFilter" class="k-filter">
          <option value="">All categories</option>
          ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}
        </select>
        <div class="cat-chips" id="herbCatChips" aria-label="中藥分類篩選"></div>
      </details>
      <div class="k-grid" id="herbGrid">${renderHerbs(herbs)}</div>`;

    const updateHerbGrid = () => {
      const q = el("herbFilter").value.trim().toLowerCase();
      const category = el("herbCategoryFilter").value;
      const hit = herbs.filter((h) => {
        if (!recordHasConcept(h.modern_use_tags, activeConcept)) return false;
        const categoryHit = !category || category.split("||").includes(herbCategory(h));
        const text = [
          h.id,
          h.name_zh,
          h.name_en,
          h.pinyin,
          h.category,
          ...(h.channels_entered || []),
          ...(h.functions || []),
          ...(h.related_formulas || []),
          ...(h.safety_flags || []),
          ...(h.modern_use_tags || [])
        ].join(" ").toLowerCase();
        return categoryHit && (!q || text.includes(q));
      });
      const summary = el("herbCategorySummary");
      if (summary) summary.textContent = `${categorySummaryLabel(category)} · ${hit.length}`;
      el("herbGrid").innerHTML = activeConceptBar() + (renderHerbs(hit) || '<p class="k-missing">沒有符合的中藥 / No matching herbs.</p>');
    };
    conceptListeners.add(updateHerbGrid);
    el("herbFilter").addEventListener("input", updateHerbGrid);
    el("herbCategoryFilter").addEventListener("change", updateHerbGrid);
    document.addEventListener("acuting:content-mode", updateHerbGrid);
    buildCategoryChips("herbCatChips", "herbCategoryFilter", herbs, herbCategory, updateHerbGrid);
    herbHost.addEventListener("click", (event) => {
      const button = event.target.closest('[data-detail-kind="herb"][data-detail-id]');
      if (button) openKnowledgeDetail("herb", button.dataset.detailId);
    });
  }

  // ---- Pharmacology --------------------------------------------------------
  // Same shape as the herb list on purpose: search box, category drawer, chips.
  // The category axis is the drug class, since that is how the course teaches
  // it and how the board asks about it.
  const pharmHost = el("pharmRecords");
  if (pharmHost) {
    /* Returns the combined "中文 / English" form rather than one language.
     * buildCategoryChips splits on "/" to build a bilingual chip, the way
     * formula categories already work (補益劑 / Tonify). Returning modeText()
     * here gave it a single language frozen at render time, so the chips
     * stayed Chinese while the rest of the page switched to English. */
    const classLabelOf = (d) => {
      const c = pharmClassById.get(d.drugclass_id);
      if (!c) return d.drugclass_id || "uncategorized";
      const zh = c.name_zh || "";
      const en = c.name_en || "";
      return zh && en ? `${zh} / ${en}` : (zh || en);
    };
    const classNameOf = classLabelOf;
    const classes = [...new Set(pharmDrugs.map(classNameOf).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const renderPharm = (list) => list.map((d) => {
      const target = pharmTargetById.get(d.drugtarget_id);
      // A gap_note is the honest state of a field nobody could source yet, so
      // it is shown rather than hidden — the card should not read as complete.
      const gap = usableText(d.gap_note_zh);
      return `
        <article class="k-card k-pharm-card" data-record-id="${esc(d.id)}">
          <header>
            <strong>${esc(d.name_zh || d.name_en)} <small>${esc(d.name_en || "")}</small></strong>
            ${statusPill(d.review_status)}
          </header>
          ${d.brand_names_en && d.brand_names_en.length ? `<p class="k-en">${esc(d.brand_names_en.join(" / "))}</p>` : ""}
          <p class="k-meta">${esc(classNameOf(d))}${d.suffix_en ? ` · <code>${esc(d.suffix_en)}</code>` : ""}</p>
          ${target ? `<p class="k-meta">${esc(modeText("作用標的：", "Target: "))}${esc(modeText(target.name_zh || target.name_en, target.name_en || target.name_zh))}</p>` : ""}
          ${usableText(d.mechanism_zh) || usableText(d.mechanism_en) ? `<p class="k-meta">${esc(modeText(d.mechanism_zh || d.mechanism_en, d.mechanism_en || d.mechanism_zh))}</p>` : ""}
          ${d.mnemonic_en ? `<p class="k-tags"><span class="k-chip k-chip--mnemonic">${esc(d.mnemonic_en)}</span></p>` : ""}
          ${d.exam_trap_zh || d.exam_trap_en ? `<p class="k-flags">⚠️ ${esc(modeText(d.exam_trap_zh || d.exam_trap_en, d.exam_trap_en || d.exam_trap_zh))}</p>` : ""}
          ${gap ? `<p class="k-meta k-pharm-gap">${esc(gap)}</p>` : ""}
          <p class="k-meta">${esc(modeText("草稿 · 禁忌與交互作用引用官方標籤", "draft · contraindications and interactions cite the official label"))}</p>
          <button type="button" class="k-open-detail" data-detail-kind="pharm" data-detail-id="${esc(d.id)}">${esc(modeText("查看西藥卡", "Open drug card"))}</button>
        </article>`;
    }).join("");

    pharmHost.innerHTML = `
      <div class="k-toolbar k-toolbar--single">
        <input type="search" id="pharmFilter" placeholder="${esc(modeText("搜尋藥名、分類、機轉、適應症、記憶法… Search drug, class, mechanism, indication...", "Search drugs, class, mechanism, indications, mnemonics..."))}" class="k-filter" />
      </div>
      <details class="k-category-drawer">
        <summary>
          <span><span class="i18n-zh">分類篩選 </span><span class="i18n-en">Category filters</span></span>
          <small id="pharmCategorySummary">${esc(modeText("全部 All", "All"))} · ${pharmDrugs.length}</small>
        </summary>
        <select id="pharmCategoryFilter" class="k-filter">
          <option value="">All classes</option>
          ${classes.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}
        </select>
        <div class="cat-chips" id="pharmCatChips" aria-label="西藥分類篩選"></div>
      </details>
      <div class="k-grid" id="pharmGrid">${renderPharm(pharmDrugs)}</div>`;

    const updatePharmGrid = () => {
      const q = el("pharmFilter").value.trim().toLowerCase();
      const category = el("pharmCategoryFilter").value;
      const hit = pharmDrugs.filter((d) => {
        const categoryHit = !category || category.split("||").includes(classNameOf(d));
        const text = [
          d.id, d.name_zh, d.name_en, d.suffix_en, d.rxnorm_rxcui,
          classNameOf(d), d.mechanism_zh, d.mechanism_en, d.mnemonic_en,
          ...asList(d.brand_names_en),
          ...asList(d.indications_zh), ...asList(d.indications_en),
          ...asList(d.contraindications_zh), ...asList(d.adverse_effects_zh)
        ].filter(Boolean).join(" ").toLowerCase();
        return categoryHit && (!q || text.includes(q));
      });
      const summary = el("pharmCategorySummary");
      if (summary) summary.textContent = `${categorySummaryLabel(category)} · ${hit.length}`;
      el("pharmGrid").innerHTML = renderPharm(hit) || '<p class="k-missing">沒有符合的西藥 / No matching drugs.</p>';
    };
    el("pharmFilter").addEventListener("input", updatePharmGrid);
    el("pharmCategoryFilter").addEventListener("change", updatePharmGrid);
    document.addEventListener("acuting:content-mode", updatePharmGrid);
    buildCategoryChips("pharmCatChips", "pharmCategoryFilter", pharmDrugs, classNameOf, updatePharmGrid);
    pharmHost.addEventListener("click", (event) => {
      const button = event.target.closest('[data-detail-kind="pharm"][data-detail-id]');
      if (button) openKnowledgeDetail("pharm", button.dataset.detailId);
    });
  }

  // ---- Comparisons ---------------------------------------------------------
  const comparisonHost = el("comparisonRecords");
  if (comparisonHost) {
    const comparisons = (K.comparisons && K.comparisons.records) || [];
    const patternLabels = new Map();
    const addPatternLabel = (record) => {
      if (!record || !record.id) return;
      patternLabels.set(record.id, [record.name_zh, record.name_en, record.id].filter(Boolean).join(" / "));
    };
    (((K.patternLibrary || {}).records) || []).forEach(addPatternLabel);
    (((K.conditions || {}).tcm_patterns) || []).forEach(addPatternLabel);
    const patternLabel = (id) => patternLabels.get(id) || id;
    const conditionLabels = new Map();
    (((K.conditions || {}).records) || []).forEach((record) => {
      if (!record || !record.id) return;
      conditionLabels.set(record.id, [record.name_zh, record.name_en, record.id].filter(Boolean).join(" / "));
    });
    const conditionLabel = (id) => conditionLabels.get(id) || id || "";
    const cellStats = (record) => {
      const compares = record.compares || [];
      const dimensions = record.dimensions || [];
      const total = compares.length * dimensions.length;
      const filled = compares.reduce((sum, id) => {
        const row = (record.cells || {})[id] || {};
        return sum + dimensions.filter((dimension) => String(row[dimension] || "").trim()).length;
      }, 0);
      return { filled, total };
    };
    const comparisonTotals = comparisons.reduce((totals, record) => {
      const stats = cellStats(record);
      totals.filled += stats.filled;
      totals.total += stats.total;
      if (stats.filled === 0) totals.emptyTables += 1;
      if (stats.filled > 0 && stats.filled < stats.total) totals.partialTables += 1;
      if (stats.total > 0 && stats.filled === stats.total) totals.completeTables += 1;
      return totals;
    }, { filled: 0, total: 0, emptyTables: 0, partialTables: 0, completeTables: 0 });
    const pendingCells = Math.max(0, comparisonTotals.total - comparisonTotals.filled);
    const cellText = (value) => {
      const text = String(value || "").trim();
      return text ? esc(text) : '<span class="k-empty-cell">待 Ting 填寫</span>';
    };
    const renderComparisons = (list) => list.map((record) => {
      const compares = record.compares || [];
      const dimensions = record.dimensions || [];
      const stats = cellStats(record);
      const sourceLabel = record.source_condition_id ? conditionLabel(record.source_condition_id) : "";
      return `
        <article class="k-card k-comparison-card">
          <header>
            <strong>${esc(record.title_zh || record.id)} <small>${esc(record.title_en || "")}</small></strong>
            ${statusPill(record.review_status || record.status)}
          </header>
          <p class="k-meta">${esc(record.id)} · ${esc(record.authored_by || "owner")} · contrast table skeleton</p>
          <div class="k-comparison-meta-row">
            ${sourceLabel ? `<span class="k-link-chip">source: ${esc(sourceLabel)}</span>` : ""}
            <span class="k-fill-chip">${stats.filled}/${stats.total} cells filled</span>
          </div>
          <div class="k-comparison-scroll">
            <table class="k-comparison-table">
              <thead>
                <tr>
                  <th>Axis</th>
                  ${compares.map((id) => `<th>${esc(patternLabel(id))}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${dimensions.map((dimension) => `
                  <tr>
                    <th>${esc(dimension)}</th>
                    ${compares.map((id) => `<td>${cellText((record.cells || {})[id] && (record.cells || {})[id][dimension])}</td>`).join("")}
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
          ${record.notes_zh ? `<p class="k-meta">${esc(record.notes_zh)}</p>` : ""}
        </article>`;
    }).join("");

    // Fill-progress numbers belong on the Quality page, not the study page
    // (Ting: 這應該在品質裡面出現). The lookup page keeps only search + tables.
    const cmpStatEl = el("healthComparisonCells");
    if (cmpStatEl) cmpStatEl.textContent = `${comparisonTotals.filled}/${comparisonTotals.filled + pendingCells}`;
    const cmpTablesEl = el("healthComparisonTables");
    if (cmpTablesEl) cmpTablesEl.textContent = `${comparisonTotals.completeTables} 完成 · ${comparisonTotals.partialTables} 部分 · ${comparisonTotals.emptyTables} 空`;

    comparisonHost.innerHTML = `
      <input type="search" id="comparisonFilter" placeholder="${esc(modeText("搜尋鑑別表、證型、比較軸… Search comparison, pattern, axis", "Search comparisons, patterns, axes..."))}" class="k-filter" />
      <div class="k-grid k-grid-wide" id="comparisonGrid">${renderComparisons(comparisons) || '<p class="k-missing">No comparison records yet.</p>'}</div>`;

    el("comparisonFilter").addEventListener("input", (event) => {
      const q = event.target.value.trim().toLowerCase();
      const hit = comparisons.filter((record) => {
        const text = [
          record.id,
          record.title_zh,
          record.title_en,
          record.authored_by,
          record.status,
          record.review_status,
          record.source_condition_id,
          conditionLabel(record.source_condition_id),
          ...(record.compares || []),
          ...(record.compares || []).map(patternLabel),
          ...(record.dimensions || [])
        ].join(" ").toLowerCase();
        return !q || text.includes(q);
      });
      el("comparisonGrid").innerHTML = renderComparisons(hit) || '<p class="k-missing">No matching comparison records.</p>';
    });
  }

  // ---- Conditions ----------------------------------------------------------
  // Rebuilt 2026-08-05 (28575cc + 0b9eaf4): three diagnostic namespaces, one
  // search surface; CloudTCM is an import layer, not a namespace (D11), so its
  // pages attach to the cards they describe instead of keeping a parallel
  // classification. The 8/6 bl-refinement merge resolved this file to the
  // pre-rebuild side and silently brought the old tab back — restored 8/7.
  /* 症狀卡(2026-08-12,A0c 症狀層)。
   *
   * 這一層 102 筆記錄先前**完全沒有畫面入口** —— 不是欄位沒接,是整層沒有 UI。
   * 而裡面放的正是診間會用到的東西:
   *   patient_words   病人自己怎麼講(「一跳一跳的」「像被箍住」)
   *   inquiry         要問哪幾個面向,每個面向附「為什麼要問」
   *   differentiation 同一個症狀怎麼分證型,附鑑別點,並連到證型卡
   *
   * 排版順序照問診順序,不照資料表順序:先聽病人怎麼講 → 再問 → 再鑑別。
   * 病人原話放最前面是刻意的:那是診間第一個接觸到的東西,也是最難從書上背到的。 */
  const symptomHost = el("symptomRecords");
  if (symptomHost) {
    const symptoms = (K.symptoms && K.symptoms.records) || [];
    const pickLang = (zh, en) => (contentMode === "english" ? (en || zh) : (zh || en));

    const inquiryBlock = (s) => {
      const rows = pickLang(s.inquiry_zh, s.inquiry_en) || [];
      if (!Array.isArray(rows) || !rows.length) return "";
      const items = rows.filter((r) => r && (r.dimension || r.why)).map((r) =>
        `<li><strong>${esc(r.dimension || "")}</strong>${r.why ? ` — ${esc(r.why)}` : ""}</li>`).join("");
      return items ? `<div class="k-symptom-block"><strong>${esc(modeText(`問診面向（${rows.length}）`, `Inquiry dimensions (${rows.length})`))}</strong><ul>${items}</ul></div>` : "";
    };

    const diffBlock = (s) => {
      const rows = pickLang(s.differentiation_zh, s.differentiation_en) || [];
      if (!Array.isArray(rows) || !rows.length) return "";
      const items = rows.filter((r) => r && r.variant).map((r) => {
        // points_to 是 pattern id;能解析出名字就連過去,解析不到就照實說「尚無證型卡」,
        // 不要默默印 id ——「pattern.liver_yang_rising」對讀的人沒有意義。
        const links = (r.points_to || []).map((pid) => {
          // entityLabel 是模組層的解析器。原本想用 conditionPatternLabel,但那個
          // 是條件區塊裡的 const,在這裡既不在作用域也還沒初始化 —— 會直接丟錯。
          const label = entityLabel(pid);
          return label && label !== pid
            ? `<span class="k-entity-chip">${esc(label)}</span>`
            : `<span class="k-entity-chip is-unresolved" title="${esc(pid)}">${esc(modeText("尚無證型卡", "no pattern card"))}</span>`;
        }).join("");
        return `<li><strong>${esc(r.variant)}</strong> ${links}${r.distinguishing ? `<br><small>${esc(r.distinguishing)}</small>` : ""}</li>`;
      }).join("");
      return items ? `<div class="k-symptom-block"><strong>${esc(modeText(`辨證鑑別（${rows.length}）`, `Differentiation (${rows.length})`))}</strong><ul class="k-symptom-diff">${items}</ul></div>` : "";
    };

    const renderSymptoms = (list) => list.map((s) => {
      const words = usableText(pickLang(s.patient_words_zh, s.patient_words_en));
      const def = usableText(pickLang(s.definition_zh, s.definition_en));
      const metrics = (s.supporting_measurements || []).map((m) => `<span class="k-tag">${esc(entityLabel(m) || m)}</span>`).join("");
      return `<article class="k-card k-symptom-card" data-record-id="${esc(s.id)}">
        <header><strong>${esc(s.name_zh || "")} <small>${esc(s.name_en || "")}</small></strong></header>
        <p class="k-meta">${esc(s.id)}${s.primary_mode ? ` · ${esc(s.primary_mode)}` : ""}</p>
        ${def ? `<p>${esc(def)}</p>` : ""}
        ${words ? `<p class="k-symptom-words">${esc(modeText("病人這樣講:", "Patients say: "))}${esc(words)}</p>` : ""}
        ${inquiryBlock(s)}
        ${diffBlock(s)}
        ${metrics ? `<p class="k-tags">${esc(modeText("可追蹤指標:", "Trackable metrics: "))}${metrics}</p>` : ""}
        ${(s.safety_review_sources || []).length ? `<details class="k-condition-related"><summary>${esc(modeText("安全覆核來源", "Safety review sources"))}</summary><ul>${(s.safety_review_sources || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
      </article>`;
    }).join("");

    const updateSymptoms = () => {
      const q = String((el("symptomFilter") || {}).value || "").trim().toLowerCase();
      const hit = !q ? symptoms : symptoms.filter((s) =>
        JSON.stringify([s.name_zh, s.name_en, s.patient_words_zh, s.patient_words_en, s.id]).toLowerCase().includes(q));
      symptomHost.innerHTML = renderSymptoms(hit) || `<p class="k-detail-empty">${esc(modeText("沒有符合的症狀", "No matching symptom"))}</p>`;
      const sum = el("symptomSummary");
      if (sum) sum.textContent = `${hit.length} / ${symptoms.length}`;
    };
    updateSymptoms();
    if (el("symptomFilter")) el("symptomFilter").addEventListener("input", updateSymptoms);
    document.addEventListener("acuting:content-mode", updateSymptoms);
  }

  // The Antigravity pattern big-card (modal + preview renderer) is kept: that
  // is what the 8/6 merge was trying to preserve.
  const condHost = el("conditionRecords");
  if (condHost) {
    const conds = (K.conditionCanon && K.conditionCanon.records) || [];
    const tdisRecords = (K.tdisRegistry && K.tdisRegistry.records) || [];
    // Deprecated patterns (retired duplicate-import records, D16) stay in
    // pattern_library.json (D6 forbids hard delete) but are not a canonical
    // Pattern card: excluded here from the rendered count, search results,
    // classification buckets and "Awaiting classification". Their Chinese/
    // English names remain resolvable via ENTITY_NAMES (line ~245) and the
    // comparison-table patternLabels (line ~1930), which still read the full,
    // unfiltered K.patternLibrary.records — so any historical reference to a
    // retired id still displays a name instead of a raw id; it is simply never
    // offered as something to browse or search into.
    const patternRecords = ((K.patternLibrary && K.patternLibrary.records) || [])
      .filter((p) => p.review_status !== "deprecated");
    const patternRecordById = new Map(patternRecords.map((pattern) => [pattern.id, pattern]));
    const conditionPatternLabel = (id) => {
      const pattern = patternRecordById.get(id);
      return pattern
        ? [pattern.name_zh, pattern.name_en, pattern.id].filter(Boolean).join(" / ")
        : id;
    };

    const cloudCounts = (K.cloudtcmRefMap && K.cloudtcmRefMap.counts) || {};
    const cloudNote = modeText(
      `雲端中醫 ${cloudCounts.source_entries || 0} 筆已融入：${cloudCounts.matched_to_canonical || 0} 筆的來源頁掛在上方對應的卡片上；${cloudCounts.symptom_seed_for_sym || 0} 筆其實是症狀，成為 sym.* 症狀軸的種子；${cloudCounts.disease_gap_for_cond || 0} 筆是尚未建卡的西醫病名。它不再有自己的分類。`,
      `CloudTCM's ${cloudCounts.source_entries || 0} entries are dissolved: ${cloudCounts.matched_to_canonical || 0} source pages now sit on the matching cards above; ${cloudCounts.symptom_seed_for_sym || 0} were symptoms and seeded the sym.* axis; ${cloudCounts.disease_gap_for_cond || 0} are biomedical conditions not yet carded. It no longer has a classification of its own.`
    );

    // Grouping vocabularies (D14 part 1 for each namespace).
    const condCategories = (K.conditionCategoryVocabulary && K.conditionCategoryVocabulary.categories) || [];
    const condCategoryById = new Map(condCategories.map((c) => [c.id, c]));
    const tdisTaxonomy = (K.tcmDiseaseTaxonomy && K.tcmDiseaseTaxonomy.categories) || [];
    const patternFamilies = (K.patternFamilyVocabulary && K.patternFamilyVocabulary.records) || [];
    const patternFamilyById = new Map(patternFamilies.map((family) => [family.id, family]));

    const firstNonEmptyList = (...candidates) => {
      for (const candidate of candidates) {
        const values = asList(candidate).filter((value) => value !== null && value !== undefined && String(value).trim());
        if (values.length) return values;
      }
      return [];
    };

    const patternFamilyLabel = (pattern, isEn) => {
      const familyId = pattern.pattern_family || pattern.pattern_category || "";
      const family = patternFamilyById.get(familyId);
      if (!family) return familyId;
      return isEn
        ? (family.name_en || family.name_zh || familyId)
        : (family.name_zh || family.name_en || familyId);
    };

    const patternEightPrincipleLabels = (pattern, isEn) => {
      const valueLabels = {
        interior: ["裏", "Interior"],
        exterior: ["表", "Exterior"],
        cold: ["寒", "Cold"],
        heat: ["熱", "Heat"],
        neutral: ["寒熱未定", "Cold/Heat undetermined"],
        deficiency: ["虛", "Deficiency"],
        excess: ["實", "Excess"],
        mixed: ["虛實夾雜", "Mixed Deficiency and Excess"],
        yin: ["陰", "Yin"],
        yang: ["陽", "Yang"]
      };
      const principles = pattern.eight_principles || {};
      return [
        principles.interior_exterior,
        principles.cold_heat,
        principles.deficiency_excess,
        principles.yin_yang
      ].filter(Boolean).map((value) => {
        const labels = valueLabels[value];
        return labels ? labels[isEn ? 1 : 0] : value;
      });
    };

    const patternSourceReference = (source) => {
      const value = String(source || "").trim();
      if (!value) return "";
      if (/^https?:\/\//i.test(value)) {
        return `<a href="${esc(value)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>`;
      }
      return `<span>${esc(value)}</span>`;
    };

    const patternFieldSourceLabel = (field, isEn) => {
      const labels = {
        identity: ["身分", "Identity"],
        mechanism: ["病機", "Pathomechanism"],
        common_causes: ["常見病因", "Common causes"],
        progression: ["演變", "Progression"],
        key_signs: ["主症", "Key signs"],
        supporting_signs: ["兼症", "Supporting signs"],
        differentiation: ["鑑別", "Differentiation"],
        treatment_principle: ["治則", "Treatment principle"],
        tongue: ["舌象", "Tongue"],
        pulse: ["脈象", "Pulse"]
      };
      const pair = labels[field];
      return pair ? pair[isEn ? 1 : 0] : field.replaceAll("_", " ");
    };

    // CloudTCM keeps no classification of its own (Ting 2026-08-06). Its exact
    // source pages and diagrams attach to whichever canonical record they
    // describe. The 129 symptom entries seeded data/config/symptom_taxonomy.json
    // instead — they were never diseases, which is why only 20 of 190 matched a
    // disease record.
    const cloudRefs = (K.cloudtcmRefMap && K.cloudtcmRefMap.refs) || {};
    const cloudRefBlock = (recordId) => {
      const list = cloudRefs[recordId] || [];
      if (!list.length) return "";
      return `<div class="k-source-links k-condition-source-links">${list.map((r) => `
        <a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">
          <strong>雲端中醫 · ${esc(r.name_zh)}</strong>
          <small>${esc(r.name_en_draft || "CloudTCM source page")}</small>
        </a>`).join("")}</div>`;
    };

    // A record with no red flags is NOT hidden. The old gate filtered the grid
    // to the records that had them, so the rest were invisible — search 眩暈 in
    // clinic, get nothing, conclude it does not exist. Labelling the gap is
    // honest; hiding it makes the gap itself invisible. Unflagged records sort
    // last inside their group and carry a warning badge.
    const hasRedFlags = (r) => asList(r.red_flags_zh).length > 0 || asList(r.red_flags_en).length > 0;
    const noFlagBadge = `<span class="k-pill k-pill-warn" title="尚未填入安全警訊">⚠ 無安全警訊</span>`;

    /* A+ Clinical Safety View (2026-08-09). Structured red-flag rows joined
       from the bundled registry at render time (D13). Membership and ORDER
       come from the runtime resolver's red_flag_record_ids — never re-scanned
       here. A row whose id does not resolve, or whose wording does not align
       with the runtime strings, renders as plain text: a warning can never
       disappear or gain invented metadata because a join failed. No
       provenance/status is shown at this layer — not_found is admin
       semantics, and a record without a tier simply has no badge. Tier labels
       come ONLY from the registry's tier_vocabulary (the en badge trims the
       vocabulary string at its own dash/paren; no second label dictionary). */
    const RF_BY_ID = new Map(((K.redFlagRegistry && K.redFlagRegistry.records) || []).map((r) => [r.id, r]));
    const RF_TIER_VOCAB = (K.redFlagRegistry && K.redFlagRegistry.tier_vocabulary) || {};
    const RF_TIER_CLASS = { emergency_referral: "is-tier-emergency", urgent_referral: "is-tier-urgent", routine_referral: "is-tier-routine" };
    const redFlagRows = (c) => {
      const zh = asList(c.red_flags_zh), en = asList(c.red_flags_en), ids = asList(c.red_flag_record_ids);
      const n = Math.max(zh.length, en.length);
      if (!n) return "";
      const rows = [];
      for (let i = 0; i < n; i++) {
        const text = modeText(zh[i] || en[i] || "", en[i] || zh[i] || "");
        const f = RF_BY_ID.get(ids[i]);
        const aligned = f && (f.trigger_zh === zh[i] || (en[i] && f.trigger_en === en[i]));
        const v = aligned && f.tier ? RF_TIER_VOCAB[f.tier] : null;
        const badge = v ? `<span class="k-red-flag-tier ${RF_TIER_CLASS[f.tier] || ""}">${esc(modeText(v.zh, String(v.en || "").split(/[—(]/)[0].trim()))}</span>` : "";
        rows.push(`<li class="k-red-flag-item">${badge}<span class="k-red-flag-text">⚠ ${esc(text)}</span></li>`);
      }
      return `<details class="k-condition-flags"><summary>${esc(modeText(`安全警訊 / Red flags (${n})`, `Red flags (${n})`))}</summary><ul class="k-red-flag-list">${rows.join("")}</ul></details>`;
    };

    const conditionSources = (record) => {
      const links = asList(record.source_links).filter((link) =>
        link && /^https?:\/\//.test(link.url || "") && !/google\./i.test(link.url)
      );
      if (!links.length) return "";
      return `<div class="k-source-links k-condition-source-links">
        ${links.map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
          <strong>${esc(link.label_zh || "資料來源")}</strong>
          <small>${esc(link.label_en || "Source")}</small>
        </a>`).join("")}
      </div>`;
    };

    let patternLangMode = "zh";

    function openPatternBigCardModal(p, langMode = patternLangMode) {
      let modal = document.getElementById("patternDetailModalOverlay");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "patternDetailModalOverlay";
        modal.className = "k-modal-overlay";
        document.body.appendChild(modal);
      }

      const isEn = langMode === "en";
      const manifests = isEn
        ? firstNonEmptyList(p.key_manifestations_en, p.key_signs_en, p.key_manifestations_zh, p.key_signs_zh)
        : firstNonEmptyList(p.key_manifestations_zh, p.key_signs_zh, p.key_manifestations_en, p.key_signs_en);

      const supportingSigns = isEn
        ? firstNonEmptyList(p.supporting_signs_en, p.supporting_signs_zh)
        : firstNonEmptyList(p.supporting_signs_zh, p.supporting_signs_en);

      const tongueText = isEn
        ? (p.tongue_preview?.en || p.tongue_en || p.tongue || p.tongue_zh || "—")
        : (p.tongue_preview?.zh || p.tongue_zh || p.tongue || p.tongue_en || "—");

      const pulseText = isEn
        ? (p.pulse_preview?.en || p.pulse_en || p.pulse || p.pulse_zh || "—")
        : (p.pulse_preview?.zh || p.pulse_zh || p.pulse || p.pulse_en || "—");

      const summaryText = isEn
        ? (p.short_summary_en || p.mechanism_en || p.short_summary_zh || p.mechanism_zh || "")
        : (p.short_summary_zh || p.mechanism_zh || p.short_summary_en || p.mechanism_en || "");

      const commonCausesText = isEn
        ? (p.common_causes_en || p.etiology_en || p.common_causes_zh || p.etiology_zh || "")
        : (p.common_causes_zh || p.etiology_zh || p.common_causes_en || p.etiology_en || "");

      const progressionText = isEn
        ? (p.progression_en || p.progression_zh || "")
        : (p.progression_zh || p.progression_en || "");

      const diffText = isEn
        ? (p.differentiation_preview_en || p.differentiation_preview_zh || "")
        : (p.differentiation_preview_zh || p.differentiation_preview_en || "");

      const principleText = isEn
        ? (p.treatment_principle_en || p.treatment_principle_zh || "")
        : (p.treatment_principle_zh || p.treatment_principle_en || "");

      const formulas = firstNonEmptyList(p.primary_formula_ids, p.typical_formulas);
      const points = firstNonEmptyList(p.primary_acupoint_ids, p.typical_points);
      const conditions = firstNonEmptyList(p.related_biomedical_condition_ids);
      const aliases = isEn
        ? firstNonEmptyList(p.aliases_en, p.aliases_zh)
        : firstNonEmptyList(p.aliases_zh, p.aliases_en);
      const eightPrinciples = patternEightPrincipleLabels(p, isEn);
      const structuredDifferentials = asList(p.differential_patterns).filter((item) => item && item.pattern_id);
      const sourceList = firstNonEmptyList(p.sources, p.source_ids);
      const fieldSourceRows = Object.entries(p.field_sources || {})
        .map(([field, values]) => [field, asList(values).filter(Boolean)])
        .filter(([, values]) => values.length);

      modal.innerHTML = `
        <div class="k-big-card" role="dialog" aria-modal="true">
          <button type="button" class="k-big-card-close" id="patternModalCloseBtn" aria-label="Close">&times;</button>

          <!-- Big Card Top Bar & Language Switcher -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #e5dccb; padding-bottom: 0.6rem;">
            <div id="bigCardLangSwitcher" class="k-cloud-disease-categories" style="margin: 0;">
              <button type="button" class="${!isEn ? 'is-active' : ''}" data-modal-lang="zh">🇹🇼 中文大卡</button>
              <button type="button" class="${isEn ? 'is-active' : ''}" data-modal-lang="en">🇺🇸 English Card</button>
            </div>
            <span class="k-status k-status-draft">${esc(p.review_status || p.status || "draft")}</span>
          </div>

          <div class="k-big-card-header">
            <h2 class="k-big-card-title">${isEn ? esc(p.name_en) : esc(p.name_zh)} <small>${isEn ? esc(p.name_zh) : esc(p.name_en)} ${p.pinyin ? `(${esc(p.pinyin)})` : ""}</small></h2>
            <p class="k-meta">ID: <code>${esc(p.id)}</code>${patternFamilyLabel(p, isEn) ? ` · ${esc(patternFamilyLabel(p, isEn))}` : ""}${eightPrinciples.length ? ` · ${eightPrinciples.map(esc).join(" · ")}` : ""}</p>
            ${aliases.length ? `<p class="k-tags"><strong>${isEn ? "Aliases:" : "別名："}</strong> ${aliases.map((alias) => `<span class="k-tag">${esc(alias)}</span>`).join("")}</p>` : ""}
          </div>

          <!-- 1. 病因與病理機轉 -->
          <div class="k-big-card-section">
            <h3>${isEn ? "1. Etiology & Pathomechanism" : "1. 病因與病理機轉 Etiology & Pathomechanism"}</h3>
            ${summaryText ? `<p><strong>${isEn ? "[Pathomechanism]" : "【核心病機】"}</strong> ${esc(summaryText)}</p>` : ""}
            ${commonCausesText ? `<p><strong>${isEn ? "[Common Causes]" : "【常見病因】"}</strong> ${esc(commonCausesText)}</p>` : ""}
            ${progressionText ? `<p><strong>${isEn ? "[Progression]" : "【演變】"}</strong> ${esc(progressionText)}</p>` : ""}
          </div>

          <!-- 2. 系統化臨床表現 -->
          <div class="k-big-card-section">
            <h3>${isEn ? "2. Clinical Manifestations" : "2. 系統化臨床表現 Clinical Manifestations"}</h3>
            ${manifests.length ? `<p><strong>${isEn ? "【Key Signs & Symptoms】" : "【主症表現 Key Signs】"}</strong> ${manifests.map(m => esc(m)).join(" · ")}</p>` : ""}
            ${supportingSigns.length ? `<p><strong>${isEn ? "【Supporting Signs】" : "【兼症 Supporting Signs】"}</strong> ${supportingSigns.map(m => esc(m)).join(" · ")}</p>` : ""}
            <ul>
              <li><strong>👅 ${isEn ? "Tongue" : "舌象 Tongue"}：</strong> ${esc(tongueText)}</li>
              <li><strong>💓 ${isEn ? "Pulse" : "脈象 Pulse"}：</strong> ${esc(pulseText)}</li>
            </ul>
          </div>

          <!-- 3. 辨證要點與國考考點 -->
          ${(diffText || structuredDifferentials.length || principleText || p.exam_pearls_zh) ? `
            <div class="k-big-card-section">
              <h3>${isEn ? "3. Differential & Treatment Principles" : "3. 辨證要點與國考考點 Differential & Exam Pearls"}</h3>
              ${diffText ? `<p><strong>${isEn ? "[Differentiation]" : "【辨證要點】"}</strong> ${esc(diffText)}</p>` : ""}
              ${structuredDifferentials.length ? `<div class="k-pattern-differentials">
                ${structuredDifferentials.map((item) => {
                  const distinguishing = isEn
                    ? (item.distinguishing_en || item.distinguishing_zh || "")
                    : (item.distinguishing_zh || item.distinguishing_en || "");
                  const tongueDifference = isEn
                    ? (item.tongue_difference_en || item.tongue_difference_zh || "")
                    : (item.tongue_difference_zh || item.tongue_difference_en || "");
                  const pulseDifference = isEn
                    ? (item.pulse_difference_en || item.pulse_difference_zh || "")
                    : (item.pulse_difference_zh || item.pulse_difference_en || "");
                  return `<article class="k-condition-related">
                    <strong>${esc(conditionPatternLabel(item.pattern_id))}</strong>
                    ${distinguishing ? `<p>${esc(distinguishing)}</p>` : ""}
                    ${tongueDifference ? `<p><strong>${isEn ? "Tongue:" : "舌象："}</strong> ${esc(tongueDifference)}</p>` : ""}
                    ${pulseDifference ? `<p><strong>${isEn ? "Pulse:" : "脈象："}</strong> ${esc(pulseDifference)}</p>` : ""}
                    ${item.source ? `<small>${isEn ? "Source:" : "來源："} ${patternSourceReference(item.source)}</small>` : ""}
                  </article>`;
                }).join("")}
              </div>` : ""}
              ${principleText ? `<p><strong>${isEn ? "[Treatment Principle]" : "【治則治法】"}</strong> ${esc(principleText)}</p>` : ""}
              ${(!isEn && p.exam_pearls_zh) ? `<p><strong>💡 考點提示：</strong> ${esc(p.exam_pearls_zh)}</p>` : ""}
            </div>
          ` : ""}

          <!-- 4. 代表方藥與針灸處方 -->
          ${(formulas.length || points.length || conditions.length) ? `
            <div class="k-big-card-section">
              <h3>${isEn ? "4. Primary Treatment & Links" : "4. 代表方藥與針灸處方 Primary Treatment & Links"}</h3>
              ${formulas.length ? `<p><strong>💊 ${isEn ? "Primary Formulas:" : "代表方劑："}</strong> ${formulas.map(id => `<a href="#formulaSection" class="k-entity-chip" onclick="document.getElementById('patternDetailModalOverlay').classList.remove('is-open')">💊 ${esc(entityLabel(id))}</a>`).join(" ")}</p>` : ""}
              ${points.length ? `<p><strong>📌 ${isEn ? "Acupuncture Points:" : "針灸配穴："}</strong> ${points.map(code => `<a href="#point/${esc(code)}" class="k-entity-chip" onclick="document.getElementById('patternDetailModalOverlay').classList.remove('is-open')">📌 ${esc(code)}</a>`).join(" ")}</p>` : ""}
              ${conditions.length ? `<p><strong>🏥 ${isEn ? "Biomedical Mapping:" : "西醫對應："}</strong> ${conditions.map(id => `<span class="k-tag">${esc(entityLabel(id))}</span>`).join(" ")}</p>` : ""}
            </div>
          ` : ""}

          <!-- 5. 急症紅旗 (如有) -->
          ${p.red_flags_zh?.length ? `
            <div class="k-big-card-section">
              <h3>5. 急症紅旗 Safety Red Flags</h3>
              <div class="k-red-flag-box">
                <strong>🚨 急症紅旗：</strong> ${p.red_flags_zh.map(esc).join(" · ")}
              </div>
            </div>
          ` : ""}

          <!-- 6. 出處標註：只顯示卡片實際保存的 provenance，不製造預設來源。 -->
          ${(sourceList.length || fieldSourceRows.length) ? `<div class="k-big-card-section">
            <h3>${isEn ? "6. Sources & Provenance" : "6. 資料來源 Sources & Provenance"}</h3>
            ${sourceList.length ? `<ul class="k-source-links">${sourceList.map((source) => `<li>${patternSourceReference(source)}</li>`).join("")}</ul>` : ""}
            ${fieldSourceRows.length ? `<details class="k-condition-flags">
              <summary>${isEn ? "Field-level provenance" : "逐欄來源"} (${fieldSourceRows.length})</summary>
              ${fieldSourceRows.map(([field, values]) => `<p><strong>${esc(patternFieldSourceLabel(field, isEn))}：</strong> ${values.map(patternSourceReference).join(" · ")}</p>`).join("")}
            </details>` : ""}
          </div>` : ""}
        </div>
      `;
      modal.classList.add("is-open");

      // Bind language switcher inside Big Card Modal
      document.getElementById("bigCardLangSwitcher")?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-modal-lang]");
        if (!btn) return;
        const newLang = btn.dataset.modalLang;
        openPatternBigCardModal(p, newLang);
      });

      document.getElementById("patternModalCloseBtn").addEventListener("click", () => {
        modal.classList.remove("is-open");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("is-open");
      });
    }

    const renderPatternCard = (p, langMode = patternLangMode) => {
      const isEn = langMode === "en";
      const manifests = isEn
        ? firstNonEmptyList(p.key_manifestations_en, p.key_signs_en, p.key_manifestations_zh, p.key_signs_zh)
        : firstNonEmptyList(p.key_manifestations_zh, p.key_signs_zh, p.key_manifestations_en, p.key_signs_en);

      const tongueText = isEn
        ? (p.tongue_preview?.en || p.tongue_en || p.tongue || p.tongue_zh || "—")
        : (p.tongue_preview?.zh || p.tongue_zh || p.tongue || p.tongue_en || "—");

      const pulseText = isEn
        ? (p.pulse_preview?.en || p.pulse_en || p.pulse || p.pulse_zh || "—")
        : (p.pulse_preview?.zh || p.pulse_zh || p.pulse || p.pulse_en || "—");

      return `
        <article class="k-card k-pattern-card" data-record-id="${esc(p.id)}">
          <header>
            <strong>${isEn ? esc(p.name_en) : esc(p.name_zh)} <small>${isEn ? esc(p.name_zh) : esc(p.name_en)}</small></strong>
            <span class="k-status k-status-draft">${esc(p.review_status || p.status || "draft")}</span>
          </header>
          ${manifests.length ? `
            <div class="k-pattern-manifestations" style="margin-top: 0.4rem;">
              <strong class="k-subhead">${isEn ? "Key Manifestations" : "核心症狀與辨徵 Key Manifestations"}</strong>
              <div class="k-tags">
                ${manifests.map((item) => `<span class="k-tag k-tag-manifestation">${esc(item)}</span>`).join("")}
              </div>
            </div>
          ` : ""}
          <div class="k-pattern-tp-grid">
            <div class="k-tp-item">
              <strong>👅 ${isEn ? "Tongue" : "舌象 Tongue"}</strong>
              <p>${esc(tongueText)}</p>
            </div>
            <div class="k-tp-item">
              <strong>💓 ${isEn ? "Pulse" : "脈象 Pulse"}</strong>
              <p>${esc(pulseText)}</p>
            </div>
          </div>
          ${asList(p.key_signs_ids).length ? `<p class="k-tags">${symptomChips(asList(p.key_signs_ids))}</p>` : ""}
          <div style="margin-top: 0.75rem; text-align: right;">
            <button type="button" class="k-entity-chip" data-open-big-pattern="${esc(p.id)}" style="background: #e2d2b8; border-color: #c8b598; cursor: pointer; padding: 0.35rem 0.75rem; font-size: 0.84rem;">
              ${isEn ? "📖 Open Big Card &rarr;" : "📖 開啟證型大卡 · Open Big Card &rarr;"}
            </button>
          </div>
        </article>`;
    };

    // Preview card renderers — one shape per namespace, same shell.
    // 兩軸 maturity 的第二軸上畫面。`review_status` 回答「欄位補到哪」,
    // 這個回答「內容經人讀過沒有、讀出什麼」。兩者不同:92 張 full_detail 卡
    // 全部欄位齊備,其中 8 張帶未修復的安全缺陷(孕期卡的處方是樣板的合谷＋
    // 三陰交、自行停藥敘事等),在畫面上與乾淨的卡長得一模一樣。
    // 只標記不隱藏:內容已由 eyes-on 那幾輪搬走,留下的是「這張卡別當臨床依據」。
    const QUALITY_LABEL = {
      SAFETY_HOLD: ["⚠️ 安全暫扣 · 有未修復的安全缺陷,不可作為臨床依據", "SAFETY HOLD — unrepaired safety defect; not a clinical reference"],
      DEFECT: ["內容審查:發現缺陷,尚未修復", "Reviewed: defects found, not yet repaired"],
      MINOR: ["內容審查:有小問題", "Reviewed: minor issues"],
      CLEAN: ["內容審查:通過", "Reviewed: clean"],
    };
    const contentQualityBanner = (id) => {
      const overlay = (K.contentQuality && K.contentQuality.records) || {};
      const entry = overlay[id];
      if (!entry || !QUALITY_LABEL[entry.quality]) return "";
      // CLEAN/MINOR 不佔畫面 —— 讀的人要知道的是「哪張不能信」,不是每張都貼標籤。
      if (entry.quality === "CLEAN" || entry.quality === "MINOR") return "";
      const [zh, en] = QUALITY_LABEL[entry.quality];
      return `<p class="k-quality-banner k-quality-${esc(entry.quality.toLowerCase())}">${esc(modeText(zh, en))}${
        entry.evidence ? ` <small>${esc(entry.evidence)}</small>` : ""
      }</p>`;
    };
    /* 條件卡的西醫欄位與針灸範圍(2026-08-12,A0c 條件層)。
     *
     * 這幾欄先前完全沒上過畫面:western_pathology(213)、western_context(190)、
     * acupuncture_scope(184)、risk_factors(183)、summary_en(190)。
     *
     * `acupuncture_scope` 是其中對診所最重要的一個,而且它不是自由文字而是結構:
     *   can_treat / precautions / co_management / evidence / source
     * 也就是「這個病針灸能做到哪裡、什麼情況不能碰、要跟哪一科共管」。
     * 上線前掃描抓到 4 筆 can_treat 與 precautions **內容對調**(肺栓塞、心肌梗塞、
     * TIA),已在資料層搬回原位 —— 把急症排除文字印在「可以治療」標題下,
     * 會讓臨床做出相反的決定。
     *
     * precautions 用警示樣式且排在 can_treat 前面:讀的人要先知道什麼不能碰。
     * 長段落(西醫病理/脈絡)收在 <details> 裡,免得把卡片撐爆 —— 但預設收合的是
     * 敘述性內容,安全相關的一律攤開。 */
    const scopeBlock = (c) => {
      const s = (contentMode === "english" ? c.acupuncture_scope_en : c.acupuncture_scope_zh)
        || c.acupuncture_scope_zh || c.acupuncture_scope_en;
      if (!s || typeof s !== "object") return "";
      const row = (label, val, cls) => usableText(val)
        ? `<p class="${cls}"><strong>${esc(label)}</strong> ${esc(usableText(val))}</p>` : "";
      /* can_treat 不一定是「可以做什麼」。全庫有一批卡(闌尾炎、腸阻塞、馬尾症候群、
       * 子宮外孕、急性 PE…)在這一欄寫的是「不適用」「不屬針灸處置範圍」——
       * 那是正確的寫法。但固定印「針灸可作為」當標題,就會變成
       * 「針灸可作為:疑似急性PE不屬於常規針灸處置範圍」,標題與內容互相打架,
       * 而打架的方向剛好是危險的那一邊。標題跟著內容走,不要假設欄位語氣。 */
      const canText = usableText(s.can_treat);
      const canIsExclusion = /不適用|不屬|不得|絕不應|不應以|須立即|not applicable|outside (routine|the scope)|should never|is an emergency|requires emergency/i.test(canText);
      const body = [
        row(modeText("⚠️ 不可單獨處理 / 注意", "⚠️ Precautions"), s.precautions, "k-scope-precaution"),
        row(canIsExclusion ? modeText("⚠️ 針灸範圍限制", "⚠️ Out of scope")
                           : modeText("針灸可作為", "Acupuncture may serve as"),
            s.can_treat, canIsExclusion ? "k-scope-precaution" : "k-scope-can"),
        row(modeText("共同照護", "Co-management"), s.co_management, "k-scope-co"),
      ].join("");
      if (!body) return "";
      return `<div class="k-condition-scope"><strong>${esc(modeText("針灸範圍 Scope", "Acupuncture scope"))}</strong>
        ${body}
        ${usableText(s.source) ? `<small>${esc(modeText("來源:", "Source: "))}${esc(usableText(s.source))}</small>` : ""}</div>`;
    };

    const riskBlock = (c) => {
      const list = (contentMode === "english" ? c.risk_factors_en : c.risk_factors_zh) || c.risk_factors_zh || [];
      if (!Array.isArray(list) || !list.length) return "";
      const items = list.filter((x) => x && x.factor).map((x) => {
        const dir = x.direction === "decreases" ? "↓" : "↑";
        const mod = x.modifiable === true ? modeText("可介入", "modifiable") : x.modifiable === false ? modeText("不可改變", "fixed") : "";
        return `<li>${esc(dir)} ${esc(x.factor)}${mod ? ` <small>(${esc(mod)})</small>` : ""}</li>`;
      });
      if (!items.length) return "";
      return `<details class="k-condition-related"><summary>${esc(modeText(`風險因子（${items.length}）`, `Risk factors (${items.length})`))}</summary><ul>${items.join("")}</ul></details>`;
    };

    const longTextBlock = (c, labelZh, labelEn, zhKey, enKey) => {
      const text = usableText(contentMode === "english" ? (c[enKey] || c[zhKey]) : (c[zhKey] || c[enKey]));
      if (!text) return "";
      return `<details class="k-condition-related"><summary>${esc(modeText(labelZh, labelEn))}</summary><p>${esc(text).replace(/\n/g, "<br>")}</p></details>`;
    };

    const renderConditions = (list) => list.map((c) => {
      const relatedSymptoms = asList(c.related_tcm_symptoms).map((item) =>
        tag(`${item.name_zh || ""}${item.name_en ? ` · ${item.name_en}` : ""}`)
      ).join("");
      const symptomIds = asList(c.sign_symptom_ids);
      const aliases = [...asList(c.aliases_zh), ...asList(c.aliases_en)];
      const flags = asList(c.red_flags_zh);
      return `
        <article class="k-card k-condition-card" data-record-id="${esc(c.id)}">
          <header><strong>${esc(c.name_zh)} <small>${esc(c.name_en)}</small></strong>${statusPill(c.review_status)}${hasRedFlags(c) ? "" : noFlagBadge}</header>
          ${contentQualityBanner(c.id)}
          <p class="k-meta">${esc(c.id)} · ICD hint ${esc(c.icd_hint || "—")}</p>
          ${aliases.length ? `<p class="k-tags">${aliases.map(tag).join("")}</p>` : ""}
          ${c.summary_zh ? `<p>${esc(c.summary_zh)}</p>` : ""}
          ${symptomIds.length ? `<div class="k-condition-related"><strong>症狀 <small>Symptoms</small></strong><p class="k-tags">${symptomChips(symptomIds)}</p></div>` : ""}
          ${relatedSymptoms ? `<div class="k-condition-related"><strong>相關中醫症狀 <small>Related TCM symptom</small></strong><p class="k-tags">${relatedSymptoms}</p><small>相關概念，不代表一對一診斷對照。</small></div>` : ""}
          ${asList(c.related_eastern_diseases).length ? `<p class="k-tags">${entityChips(c.related_eastern_diseases)}</p>` : ""}
          ${redFlagRows(c)}
          ${scopeBlock(c)}
          ${riskBlock(c)}
          ${longTextBlock(c, "西醫病理 Western pathology", "Western pathology", "western_pathology_zh", "western_pathology_en")}
          ${longTextBlock(c, "西醫脈絡 Western context", "Western context", "western_context_zh", "western_context_en")}
          ${conditionSources(c)}${cloudRefBlock(c.id)}
        </article>`;
    }).join("");

    const renderTdis = (list) => list.map((t) => `
      <article class="k-card k-condition-card" data-record-id="${esc(t.id)}">
        <header><strong>${esc(t.name_zh)} <small>${esc(t.name_en || "")}</small></strong>${statusPill(t.review_status)}${hasRedFlags(t) ? "" : noFlagBadge}</header>
        <p class="k-meta">${esc(t.id)}${t.pinyin ? ` · ${esc(t.pinyin)}` : ""}${t.classical_source ? ` · ${esc(t.classical_source)}` : ""}</p>
        ${t.definition_zh ? `<p>${esc(t.definition_zh)}</p>` : ""}
        ${asList(t.key_manifestation_ids).length ? `<p class="k-tags">${symptomChips(asList(t.key_manifestation_ids))}</p>` : ""}
        ${asList(t.related_patterns).length ? `<p class="k-tags">${entityChips(t.related_patterns)}</p>` : ""}${cloudRefBlock(t.id)}
      </article>`).join("");

    const renderPatterns = (list) => list.map((p) => renderPatternCard(p, patternLangMode)).join("");

    // Group renderer shared by all three namespaces: one <details> per bucket,
    // count in the summary, safety-incomplete records sorted last inside it.
    const renderGroups = (buckets, renderer) => buckets
      .filter((b) => b.items.length)
      .map((b) => `
        <details class="k-dx-group" open>
          <summary>${esc(b.label_zh)} <small>${esc(b.label_en || "")}</small> <b>${b.items.length}</b>${b.gap ? ` <span class="k-dx-gap">⚠ ${b.gap}</span>` : ""}</summary>
          <div class="k-grid k-grid-wide">${renderer(b.items)}</div>
        </details>`).join("");

    const bySafetyThenName = (a, b) => (hasRedFlags(b) - hasRedFlags(a))
      || String(a.name_zh || "").localeCompare(String(b.name_zh || ""), "zh-Hant");

    const condBuckets = () => {
      const seen = new Set();
      const buckets = condCategories.map((cat) => {
        const items = conds.filter((c) => c.category === cat.id).sort(bySafetyThenName);
        items.forEach((c) => seen.add(c.id));
        const missing = items.filter((c) => !hasRedFlags(c)).length;
        return { label_zh: cat.name_zh || cat.id, label_en: cat.name_en || "", items, gap: missing ? `${missing} 缺安全警訊` : "" };
      });
      const rest = conds.filter((c) => !seen.has(c.id)).sort(bySafetyThenName);
      if (rest.length) buckets.push({ label_zh: "未分類", label_en: "Uncategorised", items: rest, gap: "" });
      return buckets;
    };

    const tdisBuckets = () => {
      const seen = new Set();
      const buckets = [];
      tdisTaxonomy.forEach((cat) => (cat.children || []).forEach((leaf) => {
        const items = tdisRecords.filter((t) => t.taxonomy_id === leaf.id).sort(bySafetyThenName);
        items.forEach((t) => seen.add(t.id));
        const missing = items.filter((t) => !hasRedFlags(t)).length;
        buckets.push({
          label_zh: `${cat.name_zh}·${leaf.name_zh}`, label_en: leaf.name_en || "",
          items, gap: missing ? `${missing} 缺安全警訊` : "",
        });
      }));
      const rest = tdisRecords.filter((t) => !seen.has(t.id)).sort(bySafetyThenName);
      if (rest.length) {
        buckets.push({
          label_zh: "待分類", label_en: "Awaiting classification",
          items: rest, gap: `${rest.length} 筆仍用舊的 classical_source_hint`,
        });
      }
      return buckets;
    };

    const patternBuckets = () => {
      const seen = new Set();
      const buckets = patternFamilies.map((f) => {
        const items = patternRecords.filter((p) => p.pattern_family === f.id).sort(bySafetyThenName);
        items.forEach((p) => seen.add(p.id));
        return { label_zh: f.name_zh, label_en: f.name_en || "", items, gap: "" };
      });
      const rest = patternRecords.filter((p) => !seen.has(p.id)).sort(bySafetyThenName);
      if (rest.length) {
        buckets.push({
          label_zh: "待分類", label_en: "Awaiting classification",
          items: rest, gap: `${rest.length} 筆尚未指定辨證體系`,
        });
      }
      return buckets;
    };

    // One search box across all three namespaces, one type filter. The user
    // searches 眩暈 once — she should not have to know whether it is filed as a
    // 西醫病名, a 中醫病名 or a 證型 to find it. (Two search boxes and two
    // category bars on one page is what made this tab confusing.)
    let activeDxType = "all";
    const dxMatches = (record, q) => !q || [
      record.id, record.name_zh, record.name_en, record.pinyin, record.icd_hint,
      ...asList(record.aliases_zh), ...asList(record.aliases_en),
      ...asList(record.key_signs_zh), ...asList(record.key_signs_en), ...asList(record.key_manifestations_zh),
      ...asList(record.key_manifestations_en),
      ...asList(record.supporting_signs_zh), ...asList(record.supporting_signs_en),
      record.mechanism_zh, record.mechanism_en, record.common_causes_zh, record.common_causes_en,
      record.progression_zh, record.progression_en, record.tongue_zh, record.tongue_en, record.pulse_zh, record.pulse_en,
      record.treatment_principle_zh, record.treatment_principle_en,
      ...asList(record.differential_patterns).flatMap((item) => [
        item && item.pattern_id,
        item && item.distinguishing_zh,
        item && item.distinguishing_en
      ]),
      ...asList(record.related_tcm_symptoms).flatMap((i) => [i.name_zh, i.name_en]),
    ].filter(Boolean).join(" ").toLowerCase().includes(q);

    const renderDx = () => {
      const q = String(el("conditionFilter")?.value || "").trim().toLowerCase();
      const pick = (list) => list.filter((r) => dxMatches(r, q));
      const sections = [];
      if (activeDxType === "all" || activeDxType === "cond") {
        const hits = pick(conds);
        sections.push({ key: "cond", zh: "西醫病名", en: "Biomedical conditions", n: hits.length,
          html: renderGroups(condBuckets().map((b) => ({ ...b, items: b.items.filter((r) => dxMatches(r, q)) })), renderConditions) });
      }
      if (activeDxType === "all" || activeDxType === "tdis") {
        const hits = pick(tdisRecords);
        sections.push({ key: "tdis", zh: "中醫病名", en: "TCM diseases", n: hits.length,
          html: renderGroups(tdisBuckets().map((b) => ({ ...b, items: b.items.filter((r) => dxMatches(r, q)) })), renderTdis) });
      }
      if (activeDxType === "all" || activeDxType === "pattern") {
        const hits = pick(patternRecords);
        sections.push({ key: "pattern", zh: "證型", en: "TCM patterns", n: hits.length,
          html: renderGroups(patternBuckets().map((b) => ({ ...b, items: b.items.filter((r) => dxMatches(r, q)) })), renderPatterns) });
      }
      const body = sections.filter((s) => s.n).map((s) => `
        <section class="k-dx-section">
          <div class="mini-heading"><strong>${esc(s.zh)} <small>${esc(s.en)}</small> <b>${s.n}</b></strong></div>
          ${s.html}
        </section>`).join("");
      el("conditionGrid").innerHTML = body || '<p class="k-missing">找不到相符診斷 / No matching diagnosis.</p>';
      el("dxTypeBar")?.querySelectorAll("[data-dx-type]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.dxType === activeDxType);
      });
    };

    const condMissingFlags = conds.filter((c) => !hasRedFlags(c)).length;
    condHost.innerHTML = `
      <div class="mini-heading">
        <strong>${esc(modeText(`診斷 / Diagnosis（西醫病名 ${conds.length} · 中醫病名 ${tdisRecords.length} · 證型 ${patternRecords.length}）`, `Diagnosis (${conds.length} biomedical · ${tdisRecords.length} TCM diseases · ${patternRecords.length} patterns)`))}</strong>
        <span>${esc(modeText(`三種是不同的實體，不是同義詞：一病多證、同證異病。中西醫名稱是相關映射，不是一對一翻譯。目前 ${condMissingFlags} 筆西醫病名尚無安全警訊，已標示但未隱藏。`, `Three distinct entity types, not synonyms. Biomedical and TCM names are related mappings, never one-to-one. ${condMissingFlags} biomedical conditions still have no red flags — flagged, not hidden.`))}</span>
      </div>
      <div id="dxTypeBar" class="k-dx-types" aria-label="${esc(modeText("診斷類型", "Diagnosis type"))}">
        <button type="button" class="is-active" data-dx-type="all">${esc(modeText("全部 · All", "All"))}</button>
        <button type="button" data-dx-type="cond">${esc(modeText("西醫病名", "Biomedical"))} ${conds.length}</button>
        <button type="button" data-dx-type="tdis">${esc(modeText("中醫病名", "TCM disease"))} ${tdisRecords.length}</button>
        <button type="button" data-dx-type="pattern">${esc(modeText("證型", "Pattern"))} ${patternRecords.length}</button>
      </div>
      <input type="search" id="conditionFilter" placeholder="${esc(modeText("搜尋病名、證型、別名、拼音、ICD...", "Search diagnosis names, patterns, aliases, pinyin, ICD..."))}" class="k-filter" />
      <div id="conditionGrid"></div>
      <p class="k-meta">${esc(cloudNote)}</p>`;

    el("conditionFilter").addEventListener("input", renderDx);
    el("dxTypeBar").addEventListener("click", (event) => {
      const button = event.target.closest("[data-dx-type]");
      if (!button) return;
      activeDxType = button.dataset.dxType;
      renderDx();
    });
    condHost.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-open-big-pattern]");
      if (!btn) return;
      const found = patternRecords.find((r) => r.id === btn.dataset.openBigPattern);
      if (found) openPatternBigCardModal(found, patternLangMode);
    });
    renderDx();
  }

  // ---- Source registry -------------------------------------------------------
  const srcHost = el("sourceRegistry");
  if (srcHost) {
    const sources = K.sources.sources || [];
    srcHost.innerHTML = `
      <div class="mini-heading">
        <strong>${esc(modeText(`Source Registry / 來源登記（${sources.length}）`, `Source Registry (${sources.length})`))}</strong>
        <span>${esc(modeText("來源：data/sources/source_registry.json · authority 5 = 最高權威。", "Source: data/sources/source_registry.json · authority 5 = highest authority."))}</span>
      </div>
      <div class="k-grid k-grid-wide">
        ${sources.map((s) => {
          // 36 of the 43 registry entries carry a url that nothing rendered, so
          // the page Ting browses these sites from listed their names and made
          // her go find them herself. The title is the link when there is one;
          // the rest say so rather than looking identical to a dead title.
          const url = s.url || "";
          const title = url
            ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="k-src-title">${esc(s.name)} ↗</a>`
            : `<strong>${esc(s.name)}</strong>`;
          const host = url ? (() => { try { return new URL(url).host.replace(/^www\./, ""); } catch { return ""; } })() : "";
          return `
          <article class="k-card${url ? " has-link" : ""}">
            <header>${title}<span class="k-status">${"★".repeat(s.authority || 0)}</span></header>
            <p class="k-meta">${esc(s.source_group || "")} · ${esc(s.layer || "")} · ${esc(s.access_type || "")}</p>
            ${host ? `<p class="k-src-host">${esc(host)}</p>` : `<p class="k-src-host is-none">無線上連結（紙本／付費資料庫）</p>`}
            <p class="k-tags">${(s.primary_use || []).slice(0, 5).map(tag).join("")}</p>
          </article>`;
        }).join("")}
      </div>`;
  }

  // ---- Quality: audit file summary -------------------------------------------
  const auditHost = el("auditFileStrip");
  if (auditHost) {
    const a = K.audit;
    const worst = Object.entries(a.channels || {})
      .filter(([, v]) => v.missing_count > 0)
      .sort((x, y) => y[1].missing_count - x[1].missing_count)
      .slice(0, 6)
      .map(([ch, v]) => `${ch} 缺 ${v.missing_count}`)
      .join(" · ");
    auditHost.innerHTML = `
      <div class="mini-heading">
        <strong>Audit File / 缺漏稽核（${esc(a.generated_on)}）</strong>
        <span>來源：data/audits/missing_report.json</span>
      </div>
      <p class="k-meta">標準經穴 ${a.total_present}/${a.total_expected}，缺 ${a.total_missing}。${esc(worst)}</p>
      <p class="k-meta">建議下一批：${esc(a.next_recommended_batch || "—")}</p>`;
  }

  // Expose the formula/herb study-card opener so unified search (app.js) can
  // open the exact card the user clicked, rather than dumping them in a section.
  globalThis.ACUTING_KNOWLEDGE_API = Object.assign(globalThis.ACUTING_KNOWLEDGE_API || {}, {
    openDetail: openKnowledgeDetail
  });
})();

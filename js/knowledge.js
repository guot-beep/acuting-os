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
    return document.body.dataset.contentMode === "english" || localStorage.getItem(CONTENT_MODE_KEY) === "english";
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
    if (conditionFilter) conditionFilter.placeholder = modeText("搜尋中英文病名、別名、ICD...", "Search Chinese/English names, aliases, ICD...");
    const cloudtcmDiseaseFilter = el("cloudtcmDiseaseFilter");
    if (cloudtcmDiseaseFilter) cloudtcmDiseaseFilter.placeholder = modeText("搜尋中文、English 或來源 ID...", "Search Chinese, English, or source ID...");
  }
  document.addEventListener("acuting:content-mode", applyKnowledgeModeText);
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function tag(t) { return `<span class="k-tag">${esc(t)}</span>`; }

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

  /* ⚠ LABEL RESOLVERS — DO NOT let a render-site rewrite drop these calls.
     Raw snake_case keys must NEVER reach the screen. If you rewrite a section
     that shows a comparison_group or safety_flags, keep the resolver call.
     (comparisonGroupLabel was lost once in a merge and shipped raw keys.) */
  const COMPARE_VOCAB = new Map(
    ((K && K.comparisonGroupVocabulary && K.comparisonGroupVocabulary.groups) || []).map((g) => [g.id, g])
  );
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
    ["formulaRecords", "herbRecords", "comparisonRecords", "conditionRecords", "sourceRegistry", "auditFileStrip"].forEach((id) => {
      const host = el(id);
      if (host) host.innerHTML = '<p class="k-missing">⚠ knowledge_data.js 未載入（請確認檔案已同步後 Ctrl+F5）。</p>';
    });
    return;
  }

  const formulas = (K.formulas && K.formulas.records) || [];
  const herbs = (K.herbs && K.herbs.records) || [];
  const formulaById = new Map(formulas.map((record) => [record.id, record]));
  const herbById = new Map(herbs.map((record) => [record.id, record]));

  function normalizeKey(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }

  const herbByPinyin = new Map(herbs.map((record) => [normalizeKey(record.pinyin), record]));
  const herbByNameZh = new Map(herbs.map((record) => [record.name_zh, record]));

  function usableText(value) {
    const text = String(value || "").trim();
    return text && !/\?{2,}/.test(text) && !text.includes("\uFFFD") ? text : "";
  }

  function cleanList(values) {
    return (Array.isArray(values) ? values : []).map(usableText).filter(Boolean);
  }

  function doseValue(value, suffix = "g") {
    if (value === 0) return `0${suffix}`;
    if (typeof value === "number") return `${value}${suffix}`;
    const text = usableText(value);
    if (!text) return "待來源核對";
    return /[a-zA-Z克兩錢枚]/.test(text) ? text : `${text}${suffix}`;
  }

  function detailList(values, emptyText = "待補 / Content pending source review") {
    const items = cleanList(values);
    return items.length
      ? `<ul class="k-detail-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
      : `<p class="k-detail-empty">${esc(emptyText)}</p>`;
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
      return `<ol class="k-paired-list">${z.map((v, i) =>
        `<li><span class="kp-zh">${esc(v)}</span><span class="kp-en">${esc(e[i])}</span></li>`).join("")}</ol>`;
    }
    return detailList(z.length ? z : e, emptyText);
  }

  function detailSection(titleZh, titleEn, content) {
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
    const citations = Array.isArray(record.source_citations) ? record.source_citations : [];
    let html = '<div class="k-source-citations" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';

    // Web Links vs Textbook Citations
    if (citations.length) {
      citations.forEach(c => {
        const isUrl = c.url && /^https?:\/\//.test(c.url);
        if (isUrl) {
          html += `
            <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-decoration:none;color:#1e293b;font-size:0.85em;">
              <strong style="color:#0284c7;">${esc(c.name)} ↗</strong>
              ${c.scope ? `<span style="color:#64748b;margin-left:4px;">(${esc(c.scope)})</span>` : ""}
            </a>`;
        } else {
          html += `
            <div style="display:inline-block;padding:6px 12px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;color:#334155;font-size:0.85em;">
              <strong>${esc(c.name)}</strong>
              ${c.scope ? `<span style="color:#64748b;margin-left:4px;">— ${esc(c.scope)}</span>` : ""}
            </div>`;
        }
      });
    }

    /* Every source is named. "Source 1" told Ting nothing — a citation must say
       what it is (Ting: 引用來源都要寫). URLs are named by host; curriculum
       references collected from field_sources are shown as textbook citations. */
    const hostName = (url) => {
      if (/cloudtcm\.com/.test(url)) return "雲端中醫 CloudTCM";
      if (/americandragon\.com/.test(url)) return "American Dragon";
      if (/chinesemedicineatlas\.com/.test(url)) return "Chinese Medicine Atlas";
      if (/acupun\.site/.test(url)) return "acupun.site";
      try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return "來源 Source"; }
    };
    const links = [...new Set((record.source_urls || []).concat(record.exact_source_url || [], record.safety_source_url || [])
      .filter((url) => typeof url === "string" && /^https?:\/\//.test(url)))];
    if (!citations.length && links.length) {
      html += links.map((url) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-decoration:none;color:#0284c7;font-size:0.85em;">${esc(hostName(url))} ↗</a>`).join("");
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
      const relation = event.target.closest("[data-detail-kind][data-detail-id]");
      if (relation) openKnowledgeDetail(relation.dataset.detailKind, relation.dataset.detailId);
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
  function herbSourceLinks(record, cloudUrl) {
    const a = (url, label, note) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="k-src-link">${esc(label)} ↗</a>${note ? `<small class="k-src-note">${esc(note)}</small>` : ""}`;
    const out = [];
    // herbReferenceUrl falls back through source_urls, which for the 45 herbs
    // with no CloudTCM page can be an American Dragon or NCCIH link. Labelling
    // that "雲端中醫 CloudTCM" claims a source the record does not have, so the
    // label follows the host, not the position in the fallback chain.
    if (cloudUrl && /cloudtcm\.com/i.test(cloudUrl)) out.push(a(cloudUrl, "雲端中醫 CloudTCM"));
    else if (cloudUrl && !/americandragon/i.test(cloudUrl)) out.push(a(cloudUrl, "外部藥材參考"));
    if (record.american_dragon_url) {
      out.push(a(record.american_dragon_url, "American Dragon",
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
  function formulaExamBanner(record) {
    const onBoard = record.on_board_list;
    const pearl = usableText(record.exam_pearl);
    if (!record.exam_importance && !pearl) return "";
    const bold = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong class="k-pearl-key">$1</strong>').replace(/\n/g, "<br>");
    return `<section class="k-exam-banner${onBoard ? " is-board" : ""}">
      <h4>${onBoard ? "★ 考試重點 · NCBAHM 應試方劑" : "💡 學習提示"}</h4>
      ${record.exam_importance ? `<p class="k-exam-scope">${esc(record.exam_importance)}</p>` : ""}
      ${pearl ? `<p class="k-exam-pearl">${bold(pearl)}</p>` : ""}
    </section>`;
  }

  function formulaGlanceRow(record) {
    const bits = [
      ["八法 Ba Fa", [usableText(record.ba_fa_zh), usableText(record.ba_fa_en)].filter(Boolean).join(" · ")],
      ["出典 Source", usableText(record.source_classic)],
      ["舌 Tongue", cleanList(record.tongue_zh).join("、")],
      ["脈 Pulse", cleanList(record.pulse_zh).join("、")],
      ["煎法 Preparation", usableText(record.preparation_zh)]
    ].filter(([, v]) => v);
    if (!bits.length) return "";
    return `<div class="k-formula-glance">${bits.map(([k, v]) =>
      `<div><span class="kfg-k">${esc(k)}</span><span class="kfg-v">${esc(v)}</span></div>`).join("")}</div>`;
  }

  function formulaFamilySection(record) {
    const fam = Array.isArray(record.formula_family) ? record.formula_family : [];
    if (!fam.length) return '<p class="k-detail-empty">待補 / Pending</p>';
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
    if (!rows.length) return '<p class="k-detail-empty">待補 / Pending</p>';
    return `<ul class="k-fcompare">${rows.map((c) => {
      const other = (c.codes || []).find((x) => x !== record.id) || "";
      return `<li><span class="kfc-axis">${esc(c.axis || "")}</span><span class="kfc-note">${esc(c.note || "")}</span></li>`;
    }).join("")}</ul>`;
  }

  /* 原方 back-link. formula_family lives on the BASE formula, so opening a
     derived one gave no hint it was a modification — which is the single most
     useful thing to know about 大青龍湯. Mirrored by
     scripts/link-formula-family-back.js, never authored twice. */
  function formulaDerivedFrom(record) {
    const d = record.derived_from;
    if (!d) return "";
    return `<p class="k-derived-from">原方 <a href="#" data-formula-jump="${esc(d.formula_id)}">${esc(d.name_zh)}</a>
      <span class="kdf-rel">${esc(d.relation || "")}</span>
      ${(d.change || []).map((c) => `<code>${esc(c)}</code>`).join(" ")}
      ${d.indication_zh ? `<span class="kdf-ind">${esc(d.indication_zh)}</span>` : ""}</p>`;
  }

  /* 現代應用 — what this formula treats today. Kept separate from CloudTCM's
     modern_diseases_zh: that list has 系統性紅斑性狼瘡 and 心肌梗塞 under
     麻黃湯, which is keyword association rather than clinical application. Both
     are shown, each under its own heading and its own source. */
  function formulaModernSection(record) {
    const out = [];
    const app = cleanList(record.applications_zh), appEn = cleanList(record.applications_en);
    if (app.length) out.push(detailSection("現代應用", "What this formula treats today（課件 Applications）", detailPairedList(app, appEn)));
    const res = cleanList(record.modern_research_zh), resEn = cleanList(record.modern_research_en);
    if (res.length) out.push(detailSection("現代藥理", "Modern research（課件）", detailPairedList(res, resEn)));
    const dis = cleanList(record.modern_diseases_zh);
    if (dis.length) out.push(detailSection("CloudTCM 可改善疾病", "關聯疾病索引（來源為關鍵字關聯，非臨床應用，需自行判讀）", `<div class="k-chip-cloud">${dis.map(tag).join("")}</div>`));
    return out.join("");
  }

  function detailShell(record, kind, panels) {
    const eyebrow = kind === "formula" ? "FORMULA STUDY CARD" : "MATERIA MEDICA STUDY CARD";
    const identity = [record.category || record.category_en, record.tier ? `tier: ${record.tier}` : "", record.id].filter(Boolean).join(" · ");
    const mappedHerb = kind === "herb" ? (HERB_URL_MAP.get(record.id) || HERB_URL_MAP.get(usableText(record.name_zh))) : null;
    const preferredCitation = kind === "herb"
      ? (record.source_citations || []).find((source) => source?.url && /主要外部圖像|圖像與藥材辨識/.test(source.scope || ""))
        || (record.source_citations || []).find((source) => source?.url)
      : null;
    const herbReferenceUrl = mappedHerb?.page_url || record.cloudtcm_url || preferredCitation?.url
      || record.exact_source_url || (record.source_urls || []).find(Boolean) || "";
    const herbReferenceLabel = mappedHerb || record.cloudtcm_url
      ? "雲端中醫 CloudTCM"
      : (preferredCitation?.name || "外部藥材參考 Source");
    const facts = kind === "formula"
      ? [
          ["分類 Category", record.category || record.category_en || "待補"],
          // Ting removed the Tier tile long ago and wants this slot to be the
          // CloudTCM link instead — it is the page she actually opens from a
          // formula card. Falls back to the tier only when no link exists, so
          // the tile is never empty.
          record.cloudtcm_url
            ? ["雲端中醫 CloudTCM", `<a href="${esc(record.cloudtcm_url)}" target="_blank" rel="noopener noreferrer" class="k-src-title">開啟方劑頁面 ↗</a>`, true]
            : ["學習層級 Tier", record.tier || "draft"],
          ["組成 Composition", `${(record.composition || []).length} 味`],
          ["鑑別群組 Comparison", comparisonGroupLabel(record.comparison_group) || "—"]
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
          ["外部參考 Sources", herbSourceLinks(record, herbReferenceUrl), Boolean(herbReferenceUrl || record.american_dragon_url || record.atlas_url)]
        ];
    return `
      <div class="k-detail-shell">
        <div class="k-detail-toolbar">
          <span>${esc(kind === "formula" ? "方劑資料庫 / Formula" : "中藥資料庫 / Materia Medica")}</span>
          <button type="button" class="k-detail-close" data-detail-close aria-label="關閉詳情">返回列表</button>
        </div>
        <header class="k-detail-hero">
          <div class="k-detail-watermark" aria-hidden="true">${esc((record.name_zh || record.pinyin || "?").slice(0, 1))}</div>
          <div class="k-detail-hero-top">
            <div>
              <div class="k-detail-badges"><span>${esc(record.category || record.category_en || kind)}</span></div>
              ${kind === "formula" ? `<h2>${esc(record.name_zh || record.pinyin)} <small>${esc(record.pinyin)}</small></h2><p class="k-detail-en">${esc(record.name_en)}</p>` : `
              <h2>${esc(record.name_zh || record.name_en)} <small style="font-size:0.8em;font-weight:bold;color:#ffffff;margin-left:8px;">${esc(record.pinyin_toned || record.pinyin || "")} · ${esc(record.name_en || "")}</small></h2>
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
    // On a curated card the curriculum English is the half that was asserted to
    // pair with the 中文 line for line; english_exam_track is an older summary
    // that does not. Prefer the curated pair when it exists.
    const curated = !!(record.field_sources && record.field_sources.actions_zh);
    const actions = curated && cleanList(record.actions_en).length
      ? record.actions_en
      : (cleanList(exam.actions_en).length ? exam.actions_en : record.actions_en);
    const indications = curated && cleanList(record.pattern_indications_en).length
      ? record.pattern_indications_en
      : (cleanList(exam.pattern_indications_en).length ? exam.pattern_indications_en : record.pattern_indications_en);
    const modifications = cleanList(exam.modifications_en).length ? exam.modifications_en : record.modifications_en;
    const composition = (record.composition || []).map((item) => {
      const herb = (item.pinyin && herbByPinyin.get(normalizeKey(item.pinyin))) || (item.herb_zh && herbByNameZh.get(usableText(item.herb_zh))) || (item.herbZh && herbByNameZh.get(usableText(item.herbZh)));
      const label = [usableText(item.herb_zh), usableText(item.pinyin), usableText(item.herb_en)].filter(Boolean).join(" · ") || "Composition item pending";
      const role = [usableText(item.role_zh), usableText(item.role_en)].filter(Boolean).join(" · ");
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
      const roleReason = usableText(item.in_formula_zh || item.role_reason_zh || item.function_in_formula_zh || item.role_note_zh || item.elucidation_zh);
      return `<tr>
        <th scope="row"><div>${herb ? relationButton(herb.id, label, "herb") : `<span>${esc(label)}</span>`}${role ? `<small>${esc(role)}</small>` : ""}</div></th>
        <td class="k-dose-role">${roleReason ? esc(roleReason) : '<span class="k-detail-empty">—</span>'}</td>
        <td>${esc(decoctionDose)}</td>
        <td><strong>${esc(granuleDose)}</strong>${granuleContext ? `<small>${esc(granuleContext)}</small>` : ""}</td>
      </tr>`;
    }).join("");
    const relatedFormulas = (record.related_formulas || []).map((id) => relationButton(id, formulaLabel(id), "formula")).join("");
    const relatedConditions = entityChips(record.related_conditions);
    const modern = modernTagChips(record.modern_clinical_use_tags);
    const safety = [...new Set([...(record.safety_flags || []), ...(record.herb_drug_cautions || [])])];
    return [
      { id: "core", label: "考試核心 Exam Core", content: `${formulaExamBanner(record)}${formulaDerivedFrom(record)}${formulaGlanceRow(record)}<div class="k-detail-columns">${detailSection("功用", "Actions", detailPairedList(record.actions_zh, actions))}${detailSection("主治證型", "Pattern indications", detailPairedList(record.pattern_indications_zh, indications))}${detailSection("常見加減與鑑別", "Modifications & differentiation", detailList(modifications))}${detailSection("方劑群組", "Comparison group", usableText(record.comparison_group) ? `<p>${esc(comparisonGroupLabel(record.comparison_group))}</p>` : '<p class="k-detail-empty">—</p>')}</div>${detailSection("方劑家族 加減變化", "Base formula → what changed → what it treats", formulaFamilySection(record))}${detailSection("類方鑑別", "How this differs from its neighbours", formulaCompareSection(record))}` },
      { id: "composition", label: "組成中藥 Composition", content: detailSection("組成與君臣佐使 · 方劑分析", "角色 · 本方功效 · 原方用量 · 科學中藥用量；點選中藥可進入單味藥卡", composition ? `${record.composition_suspect ? `<p class="k-comp-suspect">⚠️ 這個方的組成只有一味，而且那一味就是方名的開頭 —— 很可能是匯入時被截斷，<strong>不要當成完整組成</strong>。待由課件補齊。</p>` : ""}<div class="k-dose-table-wrap"><table class="k-dose-table"><thead><tr><th>中藥 Herb</th><th>本方功效</th><th>生藥煎劑參考 g</th><th>濃縮藥粉參考 g</th></tr></thead><tbody>${composition}</tbody></table></div>${usableText(record.administration_zh) ? `<p class="k-admin">服法 Administration：${esc(record.administration_zh)}</p>` : ""}<p class="k-dose-caution">濃縮藥粉克數受廠牌、濃縮倍率、劑型與處方情境影響；必須保留來源，不由生藥克數自動換算。</p>` : `<p class="k-detail-empty">組成待補 / Composition pending</p>${record.composition_cleared_note ? `<p class="k-comp-suspect">⚠️ 原本這裡有一筆「組成」，其實是方名去掉劑型後綴被當成藥材（例：瀉心湯 → 瀉心），已清除。真正的組成待由課件補齊。</p>` : ""}`) },
      { id: "pairs", label: "藥對 Herb pairs", content: detailSection("藥對與配伍意義", "Herb pairs and why they are paired", formulaPairsSection(record)) },
      { id: "clinical", label: "臨床理解 Clinical", content: `${formulaModernSection(record)}${detailSection("現代運用索引", "Modern application tags", modern ? `<div class="k-chip-cloud">${modern}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("相關病名與證型", "Condition & pattern IDs", relatedConditions ? `<div class="k-chip-cloud">${relatedConditions}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("相關方劑", "Compare, differentiate, continue studying", relatedFormulas ? `<div class="k-chip-cloud">${relatedFormulas}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("學習備註", "Study context", `<p>${esc(usableText(record.clinical_use_note) || "待補 / Content pending source review")}</p>`)}` },
      { id: "safety", label: "安全與來源 Safety", content: `${detailSection("禁忌與注意", "Contraindications & review prompts", detailList([...(exam.contraindications_en || []), ...safetyList(safety)]))}${detailSection("來源", "Sources", sourceLinks(record))}` }
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
            ${detailSection("常用劑量", "Standard & Granule Dose", `<p><strong>生藥日服量：</strong>${esc(dose.standard_daily_g || "6~15g")}</p>${dose.granule_dose_g ? `<p><strong>濃縮藥粉 (5:1)：</strong>${esc(dose.granule_dose_g)}</p>` : ""}`)}
            ${detailSection("使用部位", "Part used", `<p>${esc(props.part_used_zh || "根 / 果實 / 全草")}</p>`)}
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
          ${detailSection("主治症狀與病機", "Indications（配伍中藥可點開）", (indicationsZh.length ? indicationsZh : [record.indications_en]).filter(Boolean).length ? `<ul class="k-detail-list">${(indicationsZh.length ? indicationsZh : [record.indications_en]).filter(Boolean).map((v) => `<li>${linkifyHerbs(v, record.id)}</li>`).join("")}</ul>` : '<p class="k-detail-empty">待補 / Content pending source review</p>')}
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
          ${detailSection("學習筆記", "Study context", `<p>${esc(usableText(record.clinical_use_note) || "待補 / Content pending source review")}</p>`)}
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
      }
    ];
  }

  function openKnowledgeDetail(kind, id) {
    const record = kind === "formula" ? formulaById.get(id) : herbById.get(id);
    if (!record) return;
    const dialog = ensureDetailDialog();
    el("knowledgeDetailContent").innerHTML = detailShell(record, kind, kind === "formula" ? formulaPanels(record) : herbPanels(record));
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
            <p class="k-tags">${(f.pattern_focus_en || []).slice(0, 3).map(tag).join("")}${modernInlineChips(searchTags, 5)}${exteriorChips}</p>
            ${(f.safety_flags || []).length ? `<p class="k-flags">! ${(f.safety_flags || []).map(safetyFlagLabel).map(esc).join(" · ")}</p>` : ""}
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
        <p class="k-tags">${(f.pattern_focus_en || []).map(tag).join("")}</p>
        ${(f.safety_flags || []).length ? `<p class="k-flags">⚠ ${(f.safety_flags || []).map(safetyFlagLabel).map(esc).join(" · ")}</p>` : ""}
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
  const condHost = el("conditionRecords");
  if (condHost) {
    const allConds = (K.conditionCanon && K.conditionCanon.records) || [];
    const cloudDiseaseCategories = (K.cloudtcmDiseaseCategories && K.cloudtcmDiseaseCategories.records) || [];
    const cloudDiseaseEntries = (K.cloudtcmDiseaseEntries && K.cloudtcmDiseaseEntries.records) || [];
    const cloudDiseaseCategoryById = new Map(cloudDiseaseCategories.map((record) => [record.id, record]));
    // CONDITIONS_MODULE_DESIGN gate: do not present a condition as study-ready
    // until its safety prompts exist. Skeleton-only records remain counted below.
    const conds = allConds.filter((record) =>
      (record.red_flags_zh || []).length && (record.red_flags_en || []).length
    );
    const eastern = K.conditions.eastern_diseases || [];
    const patterns = K.conditions.tcm_patterns || [];
    const conditionSources = (record) => {
      const links = (record.source_links || []).filter((link) =>
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
    const renderConditions = (list) => list.map((c) => {
      const relatedSymptoms = (c.related_tcm_symptoms || []).map((item) =>
        tag(`${item.name_zh || ""}${item.name_en ? ` · ${item.name_en}` : ""}`)
      ).join("");
      const aliases = [...(c.aliases_zh || []), ...(c.aliases_en || [])];
      return `
        <article class="k-card k-condition-card" data-record-id="${esc(c.id)}">
          <header><strong>${esc(c.name_zh)} <small>${esc(c.name_en)}</small></strong>${statusPill(c.review_status)}</header>
          <p class="k-meta">${esc(c.id)} · ${esc(c.category || "")} · ICD hint ${esc(c.icd_hint || "—")}</p>
          ${aliases.length ? `<p class="k-tags">${aliases.map(tag).join("")}</p>` : ""}
          ${c.summary_zh ? `<p>${esc(c.summary_zh)}</p>` : ""}
          ${relatedSymptoms ? `<div class="k-condition-related"><strong>相關中醫症狀 <small>Related TCM symptom</small></strong><p class="k-tags">${relatedSymptoms}</p><small>相關概念，不代表一對一診斷對照。</small></div>` : ""}
          ${(c.related_eastern_diseases || []).length ? `<p class="k-tags">${entityChips(c.related_eastern_diseases)}</p>` : ""}
          ${(c.red_flags_zh || []).length ? `<details class="k-condition-flags"><summary>安全警訊 / Red flags</summary><p class="k-flags">⚠ ${(c.red_flags_zh || []).slice(0, 8).map(esc).join(" · ")}</p></details>` : ""}
          ${conditionSources(c)}
        </article>`;
    }).join("");
    const cloudDiseaseCard = (record) => `
      <article class="k-card k-cloud-disease-card" data-record-id="${esc(record.id)}">
        <header><strong>${esc(record.name_zh)} <small>${esc(record.name_en)}</small></strong>${statusPill(record.review_status)}</header>
        <p class="k-meta">${esc(record.id)}</p>
        <p class="k-tags">${(record.category_ids || []).map((id) => {
          const category = cloudDiseaseCategoryById.get(id);
          return tag(category ? `${category.name_zh} · ${category.name_en}` : id);
        }).join("")}</p>
        <a class="k-cloud-disease-link" href="${esc(record.source_url)}" target="_blank" rel="noopener noreferrer">
          <strong>雲端中醫原始頁</strong><small>Open exact CloudTCM source page</small>
        </a>
      </article>`;
    const cloudDiseasePageSize = 24;
    let cloudDiseasePage = 1;
    let activeCloudDiseaseCategory = "";
    const renderCloudDiseaseDirectory = () => {
      const query = String(el("cloudtcmDiseaseFilter")?.value || "").trim().toLowerCase();
      const filtered = cloudDiseaseEntries.filter((record) => {
        const matchesCategory = !activeCloudDiseaseCategory || (record.category_ids || []).includes(activeCloudDiseaseCategory);
        const text = [record.id, record.name_zh, record.name_en, ...(record.category_ids || []).map((id) => {
          const category = cloudDiseaseCategoryById.get(id);
          return category ? `${category.name_zh} ${category.name_en}` : id;
        })].join(" ").toLowerCase();
        return matchesCategory && (!query || text.includes(query));
      });
      const totalPages = Math.max(1, Math.ceil(filtered.length / cloudDiseasePageSize));
      cloudDiseasePage = Math.min(Math.max(1, cloudDiseasePage), totalPages);
      const start = (cloudDiseasePage - 1) * cloudDiseasePageSize;
      el("cloudtcmDiseaseGrid").innerHTML = filtered.slice(start, start + cloudDiseasePageSize).map(cloudDiseaseCard).join("")
        || '<p class="k-missing">找不到相符病症 / No matching source entry.</p>';
      el("cloudtcmDiseasePageStatus").textContent = `${filtered.length} 筆 · 第 ${cloudDiseasePage} / ${totalPages} 頁`;
      el("cloudtcmDiseasePrev").disabled = cloudDiseasePage <= 1;
      el("cloudtcmDiseaseNext").disabled = cloudDiseasePage >= totalPages;
      el("cloudtcmDiseaseCategoryBar").querySelectorAll?.("[data-cloud-disease-category]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.cloudDiseaseCategory === activeCloudDiseaseCategory);
      });
    };
    condHost.innerHTML = `
      <div class="mini-heading">
        <strong>${esc(modeText(`Western Conditions / 西醫病症（${conds.length} safety-filled · ${allConds.length} canon）`, `Western Conditions (${conds.length} safety-filled · ${allConds.length} canon)`))}</strong>
        <span>${esc(modeText("來源：condition_canon_shortlist.json · 中西醫名稱是相關映射，不是一對一翻譯。", "Source: condition_canon_shortlist.json · biomedical and TCM names are related mappings, not one-to-one translations."))}</span>
      </div>
      <input type="search" id="conditionFilter" placeholder="${esc(modeText("搜尋中英文病名、別名、ICD...", "Search Chinese/English names, aliases, ICD..."))}" class="k-filter" />
      <div class="k-grid k-grid-wide" id="conditionGrid">${renderConditions(conds)}</div>
      <section class="k-cloud-disease-directory" aria-labelledby="cloudtcmDiseaseHeading">
        <div class="mini-heading">
          <strong id="cloudtcmDiseaseHeading">${esc(modeText(`雲端中醫症狀疾病索引 / Disease & Symptom Index (${cloudDiseaseEntries.length})`, `CloudTCM Disease & Symptom Index (${cloudDiseaseEntries.length})`))}</strong>
          <span>${esc(modeText(`205 張來源卡合併為 ${cloudDiseaseEntries.length} 個穩定頁面 ID；英文為 curated draft。`, `205 source cards are consolidated into ${cloudDiseaseEntries.length} stable page IDs; English labels are curated drafts.`))}</span>
        </div>
        <div id="cloudtcmDiseaseCategoryBar" class="k-cloud-disease-categories" aria-label="症狀疾病分類">
          <button type="button" class="is-active" data-cloud-disease-category="">全部 · All</button>
          ${cloudDiseaseCategories.map((category) => `<button type="button" data-cloud-disease-category="${esc(category.id)}">${esc(category.name_zh)} · ${esc(category.name_en)}</button>`).join("")}
        </div>
        <input type="search" id="cloudtcmDiseaseFilter" placeholder="${esc(modeText("搜尋中文、English 或來源 ID...", "Search Chinese, English, or source ID..."))}" class="k-filter" />
        <div class="k-cloud-disease-toolbar">
          <span id="cloudtcmDiseasePageStatus"></span>
          <div>
            <button type="button" id="cloudtcmDiseasePrev" aria-label="${esc(modeText("上一頁", "Previous page"))}">${esc(modeText("上一頁", "Previous"))}</button>
            <button type="button" id="cloudtcmDiseaseNext" aria-label="${esc(modeText("下一頁", "Next page"))}">${esc(modeText("下一頁", "Next"))}</button>
          </div>
        </div>
        <div class="k-grid k-grid-wide" id="cloudtcmDiseaseGrid"></div>
      </section>
      <p class="k-meta">Eastern：${eastern.map((d) => esc(d.name_zh + " " + (d.name_en || ""))).join("、")}</p>
      <p class="k-meta">Patterns：${patterns.map((d) => esc(d.name_zh + " " + (d.name_en || ""))).join("、")}</p>`;
    el("conditionFilter").addEventListener("input", (event) => {
      const q = event.target.value.trim().toLowerCase();
      const hits = conds.filter((record) => [
        record.id, record.name_zh, record.name_en, record.icd_hint, record.category,
        ...(record.aliases_zh || []), ...(record.aliases_en || []),
        ...(record.related_tcm_symptoms || []).flatMap((item) => [item.name_zh, item.name_en])
      ].join(" ").toLowerCase().includes(q));
      el("conditionGrid").innerHTML = renderConditions(hits) || '<p class="k-missing">找不到相符病症 / No matching condition.</p>';
    });
    el("cloudtcmDiseaseFilter").addEventListener("input", () => {
      cloudDiseasePage = 1;
      renderCloudDiseaseDirectory();
    });
    el("cloudtcmDiseaseCategoryBar").addEventListener("click", (event) => {
      const button = event.target.closest("[data-cloud-disease-category]");
      if (!button) return;
      activeCloudDiseaseCategory = button.dataset.cloudDiseaseCategory || "";
      cloudDiseasePage = 1;
      renderCloudDiseaseDirectory();
    });
    el("cloudtcmDiseasePrev").addEventListener("click", () => {
      cloudDiseasePage -= 1;
      renderCloudDiseaseDirectory();
    });
    el("cloudtcmDiseaseNext").addEventListener("click", () => {
      cloudDiseasePage += 1;
      renderCloudDiseaseDirectory();
    });
    renderCloudDiseaseDirectory();
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

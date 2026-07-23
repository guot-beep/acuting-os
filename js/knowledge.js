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

  function el(id) { return document.getElementById(id); }
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
    return c.name_zh && c.name_en ? `${c.name_zh} · ${c.name_en}` : (c.name_zh || c.name_en);
  }
  function activeConceptBar() {
    if (!activeConcept) return "";
    return `<div class="k-active-filter">篩選中 <strong>${esc(conceptLabel(activeConcept))}</strong>
      <button type="button" data-concept-clear>清除 Clear</button></div>`;
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
      const zh = c.name_zh || "";
      const en = c.name_en || "";
      const text = zh && en ? `${zh} · ${en}` : (zh || en || c.id);
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
      return zh && en ? `${zh} · ${en}` : (zh || en || id);
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
    return g ? `${g.name_zh} · ${g.name_en}` : String(id).replace(/_/g, " ");
  }

  const SAFETY_VOCAB = new Map(
    ((K && K.safetyFlagVocabulary && K.safetyFlagVocabulary.flags) || []).map((f) => [f.id, f])
  );
  function safetyFlagLabel(flag) {
    const f = SAFETY_VOCAB.get(String(flag).trim());
    return f ? `${f.name_zh} · ${f.name_en}` : String(flag).replace(/_/g, " ");
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

  function detailSection(titleZh, titleEn, content) {
    return `<section class="k-detail-section"><h3>${esc(titleZh)} <small>${esc(titleEn)}</small></h3>${content}</section>`;
  }

  function relationButton(id, label, kind) {
    return `<button type="button" class="k-relation-chip" data-detail-kind="${esc(kind)}" data-detail-id="${esc(id)}">${esc(label)}</button>`;
  }

  function formulaLabel(id) {
    const record = formulaById.get(id);
    return record ? `${record.name_zh || record.pinyin} · ${record.pinyin || record.name_en}` : id;
  }

  function sourceLinks(record) {
    const links = (record.source_urls || []).filter((url) => /^https?:\/\//.test(url));
    const sourceHint = usableText(record.source_hint);
    return `
      ${sourceHint ? `<p class="k-detail-note">${esc(sourceHint)}</p>` : ""}
      ${links.length ? `<div class="k-source-links">${links.map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${index + 1}</a>`).join("")}</div>` : '<p class="k-detail-empty">來源連結待補 / Source links pending</p>'}`;
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

  function detailShell(record, kind, panels) {
    const eyebrow = kind === "formula" ? "FORMULA STUDY CARD" : "MATERIA MEDICA STUDY CARD";
    const identity = [record.category || record.category_en, record.tier ? `tier: ${record.tier}` : "", record.id].filter(Boolean).join(" · ");
    const facts = kind === "formula"
      ? [
          ["分類 Category", record.category || record.category_en || "待補"],
          ["學習層級 Tier", record.tier || "draft"],
          ["組成 Composition", `${(record.composition || []).length} 味`],
          ["鑑別群組 Comparison", comparisonGroupLabel(record.comparison_group) || "—"]
        ]
      : [
          ["分類 Category", record.category || record.category_en || "待補"],
          ["性味 Properties", usableText(record.properties_taste_temp) || "待補"],
          ["歸經 Channels", cleanList(record.channels_entered).join("、") || "待補"],
          ["相關方劑 Related", `${(record.related_formulas || []).length} 首`]
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
            <p class="k-detail-eyebrow">${eyebrow}</p>
            <h2>${esc(record.name_zh || record.pinyin)} <small>${esc(record.pinyin)}</small></h2>
            <p class="k-detail-en">${esc(record.name_en)}</p>
            <p class="k-detail-meta">${esc(identity)}</p>
          </div>
          <div class="k-detail-header-actions">
            ${statusPill(record.review_status)}
          </div>
          </div>
          <div class="k-detail-fact-grid">
            ${facts.map(([label, value]) => `<article><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join("")}
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
    const actions = cleanList(exam.actions_en).length ? exam.actions_en : record.actions_en;
    const indications = cleanList(exam.pattern_indications_en).length ? exam.pattern_indications_en : record.pattern_indications_en;
    const modifications = cleanList(exam.modifications_en).length ? exam.modifications_en : record.modifications_en;
    const composition = (record.composition || []).map((item) => {
      const herb = herbByPinyin.get(normalizeKey(item.pinyin));
      const label = [usableText(item.herb_zh), usableText(item.pinyin), usableText(item.herb_en)].filter(Boolean).join(" · ") || "Composition item pending";
      const role = [usableText(item.role_zh), usableText(item.role_en)].filter(Boolean).join(" · ");
      const classicalAmount = usableText(item.classical_amount_text || item.classical_amount) || "待補";
      const decoctionDose = doseValue(item.decoction_reference_g || item.decoction_dose_g || item.dose_range);
      const granuleDose = doseValue(item.granule_reference_g || item.granule_dose_g);
      const granuleContext = [usableText(item.granule_concentration_ratio), usableText(item.granule_brand)].filter(Boolean).join(" · ");
      // What this herb does IN THIS FORMULA (Ting: 加上每一味要在這個方劑的功效, 中文就好).
      // Distinct from the herb's own 功效 on its card - 杏仁 alone descends Lung qi;
      // 杏仁 in 麻黃湯 is the 佐 that pairs one-down against Ma Huang's one-up.
      const roleReason = usableText(item.role_reason_zh || item.function_in_formula_zh || item.role_note_zh);
      return `<tr>
        <th scope="row"><div>${herb ? relationButton(herb.id, label, "herb") : `<span>${esc(label)}</span>`}${role ? `<small>${esc(role)}</small>` : ""}</div></th>
        <td class="k-dose-role">${roleReason ? esc(roleReason) : '<span class="k-detail-empty">—</span>'}</td>
        <td>${esc(classicalAmount)}</td>
        <td>${esc(decoctionDose)}</td>
        <td><strong>${esc(granuleDose)}</strong>${granuleContext ? `<small>${esc(granuleContext)}</small>` : ""}</td>
      </tr>`;
    }).join("");
    const relatedFormulas = (record.related_formulas || []).map((id) => relationButton(id, formulaLabel(id), "formula")).join("");
    const relatedConditions = entityChips(record.related_conditions);
    const modern = modernTagChips(record.modern_clinical_use_tags);
    const safety = [...new Set([...(record.safety_flags || []), ...(record.herb_drug_cautions || [])])];
    return [
      { id: "core", label: "考試核心 Exam Core", content: `<div class="k-detail-columns">${detailSection("功用", "Actions", detailList(actions))}${detailSection("主治證型", "Pattern indications", detailList(indications))}${detailSection("常見加減與鑑別", "Modifications & differentiation", detailList(modifications))}${detailSection("方劑群組", "Comparison group", usableText(record.comparison_group) ? `<p>${esc(comparisonGroupLabel(record.comparison_group))}</p>` : '<p class="k-detail-empty">—</p>')}</div>` },
      { id: "composition", label: "組成中藥 Composition", content: detailSection("組成與劑量", "點選中藥可進入單味藥卡", composition ? `<div class="k-dose-table-wrap"><table class="k-dose-table"><thead><tr><th>中藥 Herb</th><th>本方功效</th><th>原典用量</th><th>生藥煎劑參考 g</th><th>濃縮藥粉參考 g</th></tr></thead><tbody>${composition}</tbody></table></div><p class="k-dose-caution">濃縮藥粉克數受廠牌、濃縮倍率、劑型與處方情境影響；必須保留來源，不由生藥克數自動換算。</p>` : '<p class="k-detail-empty">組成待補 / Composition pending</p>') },
      { id: "pairs", label: "藥對 Herb pairs", content: detailSection("藥對與配伍意義", "Herb pairs and why they are paired", formulaPairsSection(record)) },
      { id: "clinical", label: "臨床理解 Clinical", content: `${detailSection("現代運用索引", "Modern application tags", modern ? `<div class="k-chip-cloud">${modern}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("相關病名與證型", "Condition & pattern IDs", relatedConditions ? `<div class="k-chip-cloud">${relatedConditions}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("相關方劑", "Compare, differentiate, continue studying", relatedFormulas ? `<div class="k-chip-cloud">${relatedFormulas}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("學習備註", "Study context", `<p>${esc(usableText(record.clinical_use_note) || "待補 / Content pending source review")}</p>`)}` },
      { id: "safety", label: "安全與來源 Safety", content: `${detailSection("禁忌與注意", "Contraindications & review prompts", detailList([...(exam.contraindications_en || []), ...safetyList(safety)]))}${detailSection("來源", "Sources", sourceLinks(record))}` }
    ];
  }

  function herbPanels(record) {
    const exam = record.english_exam_track || {};
    const functions = cleanList(exam.functions).length ? exam.functions : record.functions;
    const relatedFormulas = (record.related_formulas || []).map((id) => relationButton(id, formulaLabel(id), "formula")).join("");
    const modern = modernTagChips(record.modern_use_tags);
    return [
      { id: "core", label: "考試核心 Exam Core", content: `<div class="k-detail-columns">${detailSection("性味", "Properties, taste & temperature", `<p>${esc(usableText(exam.properties_taste_temp) || usableText(record.properties_taste_temp) || "待補")}</p>`)}${detailSection("歸經", "Channels entered", detailList(record.channels_entered))}${detailSection("功效", "Functions", detailList(functions))}${detailSection("主治脈絡", "Indication context", detailList(exam.indications))}</div>` },
      { id: "clinical", label: "臨床理解 Clinical", content: `${detailSection("現代運用索引", "Modern application tags", modern ? `<div class="k-chip-cloud">${modern}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("相關方劑", "Formulas containing or comparing this herb", relatedFormulas ? `<div class="k-chip-cloud">${relatedFormulas}</div>` : '<p class="k-detail-empty">待補</p>')}${detailSection("學習備註", "Study context", `<p>${esc(usableText(record.clinical_use_note) || "待補 / Content pending source review")}</p>`)}` },
      { id: "pairing", label: "配伍與鑑別 Pairing", content: `${detailSection("常見配伍", "Common pairings", detailList(exam.common_pairings))}${detailSection("中文深度筆記", "Chinese-depth track", `<p>${esc(usableText((record.chinese_depth_track || {}).summary_zh) || "待 CloudTCM、機構庫或 Ting 課件核對後補入")}</p>`)}` },
      { id: "pairs", label: "藥對 Herb pairs", content: detailSection("含此藥的藥對", "Pairs this herb belongs to", herbPairsSection(record)) },
      { id: "visual", label: "圖像參考 Visuals", content: detailSection("藥材與飲片圖像", "External herb image references", herbVisualLinksSection(record)) },
      { id: "safety", label: "安全與來源 Safety", content: `${detailSection("禁忌與安全提醒", "Contraindications & review prompts", detailList([...(exam.contraindications || []), ...safetyList(record.safety_flags)]))}${detailSection("來源", "Sources", sourceLinks(record))}` }
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

  // ---- Formulas ------------------------------------------------------------
  const formulaHost = el("formulaRecords");
  if (formulaHost) {
    const records = formulas;
    if (records.length > 24) {
      const hasContent = (f) => [
        f.actions_en,
        f.actions_zh,
        f.composition,
        f.pattern_indications_en,
        f.pattern_indications_zh,
        f.contraindications_en,
        f.contraindications_zh
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
                <p class="k-tags">${searchTags.map(tag).join("")}</p>
                <button type="button" class="k-open-detail" data-detail-kind="formula" data-detail-id="${esc(f.id)}">查看方劑卡</button>
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
            <p class="k-tags">${[...(f.pattern_focus_en || []), ...searchTags].slice(0, 8).map(tag).join("")}</p>
            ${(f.safety_flags || []).length ? `<p class="k-flags">! ${(f.safety_flags || []).map(esc).join(" · ")}</p>` : ""}
            <button type="button" class="k-open-detail" data-detail-kind="formula" data-detail-id="${esc(f.id)}">查看方劑卡</button>
          </article>`;
      }).join("");

      const box = document.createElement("div");
      box.innerHTML = `
        <div class="mini-heading">
          <strong>Formula Records (${records.length})</strong>
          <span>Source: data/herbs/formulas.json · draft/source-review pending · study reference only.</span>
        </div>
        <div class="k-toolbar">
          <input type="search" id="formulaFilter" placeholder="Search formula, pinyin, category, modern tag..." class="k-filter" />
          <select id="formulaCategoryFilter" class="k-filter">
            <option value="">All categories</option>
            ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}
          </select>
        </div>
        <div class="k-grid" id="formulaGrid">${renderEnhanced(records)}</div>`;
      formulaHost.appendChild(box);

      const updateFormulaGrid = () => {
        const q = el("formulaFilter").value.trim().toLowerCase();
        const category = el("formulaCategoryFilter").value;
        const hit = records.filter((f) => {
          if (!recordHasConcept(f.modern_clinical_use_tags, activeConcept)) return false;
          const categoryHit = !category || categoryLabel(f) === category;
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
        el("formulaGrid").innerHTML = bar + (renderEnhanced(hit) || '<p class="k-missing">沒有符合的方劑 / No matching formulas.</p>');
      };
      el("formulaFilter").addEventListener("input", updateFormulaGrid);
      el("formulaCategoryFilter").addEventListener("change", updateFormulaGrid);

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
        ${(f.safety_flags || []).length ? `<p class="k-flags">⚠ ${(f.safety_flags || []).map(esc).join(" · ")}</p>` : ""}
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
      return `
        <article class="k-card k-herb-card" data-record-id="${esc(h.id)}">
          <header>
            <strong>${esc(h.name_zh)} <small>${esc(h.pinyin)}</small></strong>
            ${statusPill(h.review_status)}
          </header>
          <p class="k-en">${esc(h.name_en)}</p>
          <p class="k-meta">${esc(herbCategory(h))}</p>
          <p class="k-meta">${esc((h.channels_entered || []).join(" / "))}</p>
          <p class="k-tags">${modernTags.map(tag).join("")}</p>
          ${formulaLinks.length ? `<p class="k-meta">Related formulas: ${formulaLinks.map((id) => `<span class="k-link-chip">${esc(id)}</span>`).join(" ")}</p>` : ""}
          ${safetyFlags.length ? `<p class="k-flags">Review: ${safetyFlags.map(esc).join(" Â· ")}</p>` : ""}
          <p class="k-meta">draft - source review pending - study reference only</p>
          <button type="button" class="k-open-detail" data-detail-kind="herb" data-detail-id="${esc(h.id)}">查看中藥卡</button>
        </article>`;
    }).join("");

    herbHost.innerHTML = `
      <div class="mini-heading">
        <strong>Herb Records (${herbs.length})</strong>
        <span>Source: data/herbs/herb_canon_shortlist.json Â· draft/source-review pending Â· study reference only.</span>
      </div>
      <div class="k-toolbar">
        <input type="search" id="herbFilter" placeholder="Search herb, pinyin, category, tag, related formula..." class="k-filter" />
        <select id="herbCategoryFilter" class="k-filter">
          <option value="">All categories</option>
          ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}
        </select>
      </div>
      <div class="k-grid" id="herbGrid">${renderHerbs(herbs)}</div>`;

    const updateHerbGrid = () => {
      const q = el("herbFilter").value.trim().toLowerCase();
      const category = el("herbCategoryFilter").value;
      const hit = herbs.filter((h) => {
        if (!recordHasConcept(h.modern_use_tags, activeConcept)) return false;
        const categoryHit = !category || herbCategory(h) === category;
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
      el("herbGrid").innerHTML = activeConceptBar() + (renderHerbs(hit) || '<p class="k-missing">沒有符合的中藥 / No matching herbs.</p>');
    };
    conceptListeners.add(updateHerbGrid);
    el("herbFilter").addEventListener("input", updateHerbGrid);
    el("herbCategoryFilter").addEventListener("change", updateHerbGrid);
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

    comparisonHost.innerHTML = `
      <div class="mini-heading">
        <strong>Comparison Records (${comparisons.length})</strong>
        <span>Source: data/knowledge/comparisons.json · draft skeletons; discriminator cells are owner-filled only.</span>
      </div>
      <div class="k-comparison-summary" aria-label="Comparison fill progress summary">
        <span class="k-summary-chip"><strong>${comparisonTotals.filled}</strong> filled cells</span>
        <span class="k-summary-chip"><strong>${pendingCells}</strong> pending cells</span>
        <span class="k-summary-chip"><strong>${comparisonTotals.emptyTables}</strong> empty tables</span>
        <span class="k-summary-chip"><strong>${comparisonTotals.partialTables}</strong> partial</span>
        <span class="k-summary-chip"><strong>${comparisonTotals.completeTables}</strong> complete</span>
      </div>
      <input type="search" id="comparisonFilter" placeholder="Search comparison, pattern, axis..." class="k-filter" />
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
        <strong>Western Conditions / 西醫病症（${conds.length} safety-filled · ${allConds.length} canon）</strong>
        <span>來源：condition_canon_shortlist.json · 中西醫名稱是相關映射，不是一對一翻譯。</span>
      </div>
      <input type="search" id="conditionFilter" placeholder="搜尋中英文病名、別名、ICD..." class="k-filter" />
      <div class="k-grid k-grid-wide" id="conditionGrid">${renderConditions(conds)}</div>
      <section class="k-cloud-disease-directory" aria-labelledby="cloudtcmDiseaseHeading">
        <div class="mini-heading">
          <strong id="cloudtcmDiseaseHeading">雲端中醫症狀疾病索引 / Disease & Symptom Index (${cloudDiseaseEntries.length})</strong>
          <span>205 張來源卡合併為 ${cloudDiseaseEntries.length} 個穩定頁面 ID；英文為 curated draft。</span>
        </div>
        <div id="cloudtcmDiseaseCategoryBar" class="k-cloud-disease-categories" aria-label="症狀疾病分類">
          <button type="button" class="is-active" data-cloud-disease-category="">全部 · All</button>
          ${cloudDiseaseCategories.map((category) => `<button type="button" data-cloud-disease-category="${esc(category.id)}">${esc(category.name_zh)} · ${esc(category.name_en)}</button>`).join("")}
        </div>
        <input type="search" id="cloudtcmDiseaseFilter" placeholder="搜尋中文、English 或來源 ID..." class="k-filter" />
        <div class="k-cloud-disease-toolbar">
          <span id="cloudtcmDiseasePageStatus"></span>
          <div>
            <button type="button" id="cloudtcmDiseasePrev" aria-label="上一頁">上一頁</button>
            <button type="button" id="cloudtcmDiseaseNext" aria-label="下一頁">下一頁</button>
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
        <strong>Source Registry / 來源登記（${sources.length}）</strong>
        <span>來源：data/sources/source_registry.json · authority 5 = 最高權威。</span>
      </div>
      <div class="k-grid k-grid-wide">
        ${sources.map((s) => `
          <article class="k-card">
            <header><strong>${esc(s.name)}</strong><span class="k-status">${"★".repeat(s.authority || 0)}</span></header>
            <p class="k-meta">${esc(s.source_group || "")} · ${esc(s.layer || "")} · ${esc(s.access_type || "")}</p>
            <p class="k-tags">${(s.primary_use || []).slice(0, 5).map(tag).join("")}</p>
          </article>`).join("")}
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
})();

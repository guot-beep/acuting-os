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

  // ---- Formulas ------------------------------------------------------------
  const formulaHost = el("formulaRecords");
  if (formulaHost) {
    const records = K.formulas.records || [];
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
            <article class="k-row k-formula-skeleton">
              <div>
                <strong>${esc(f.name_zh)} <small>${esc(f.pinyin)}</small></strong>
                <p class="k-en">${esc(f.name_en)}</p>
                <p class="k-meta">${esc(meta)} · draft content pending</p>
              </div>
              <div class="k-row-side">
                ${statusPill(f.review_status)}
                <p class="k-tags">${searchTags.map(tag).join("")}</p>
              </div>
            </article>`;
        }
        return `
          <article class="k-card">
            <header>
              <strong>${esc(f.name_zh)} <small>${esc(f.pinyin)}</small></strong>
              ${statusPill(f.review_status)}
            </header>
            <p class="k-en">${esc(f.name_en)}</p>
            <p class="k-meta">${esc(meta)}</p>
            <p class="k-tags">${[...(f.pattern_focus_en || []), ...searchTags].slice(0, 8).map(tag).join("")}</p>
            ${(f.safety_flags || []).length ? `<p class="k-flags">! ${(f.safety_flags || []).map(esc).join(" · ")}</p>` : ""}
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
        el("formulaGrid").innerHTML = renderEnhanced(hit) || '<p class="k-missing">No matching formulas.</p>';
      };
      el("formulaFilter").addEventListener("input", updateFormulaGrid);
      el("formulaCategoryFilter").addEventListener("change", updateFormulaGrid);
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
    const herbs = (K.herbs && K.herbs.records) || [];
    const herbCategory = (h) => h.category || "uncategorized";
    const categories = [...new Set(herbs.map(herbCategory).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const renderHerbs = (list) => list.map((h) => {
      const formulaLinks = (h.related_formulas || []).slice(0, 5);
      const modernTags = (h.modern_use_tags || []).slice(0, 5);
      const safetyFlags = (h.safety_flags || []).slice(0, 4);
      return `
        <article class="k-card k-herb-card">
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
      el("herbGrid").innerHTML = renderHerbs(hit) || '<p class="k-missing">No matching herbs.</p>';
    };
    el("herbFilter").addEventListener("input", updateHerbGrid);
    el("herbCategoryFilter").addEventListener("change", updateHerbGrid);
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
    const conds = K.conditions.records || [];
    const eastern = K.conditions.eastern_diseases || [];
    const patterns = K.conditions.tcm_patterns || [];
    condHost.innerHTML = `
      <div class="mini-heading">
        <strong>Condition Records / 病症紀錄（${conds.length} western · ${eastern.length} eastern · ${patterns.length} patterns）</strong>
        <span>來源：data/pathology/conditions.json · relation records，不是一對一翻譯。</span>
      </div>
      <div class="k-grid">
        ${conds.map((c) => `
          <article class="k-card">
            <header><strong>${esc(c.name_zh)}</strong>${c.fertility_relevance ? '<span class="k-status k-status-fertility">fertility</span>' : ""}</header>
            <p class="k-en">${esc(c.name_en)}</p>
            <p class="k-meta">${esc(c.category)}</p>
            <p class="k-tags">${(c.common_documentation_topics || []).slice(0, 4).map(tag).join("")}</p>
            ${(c.red_flags_en || []).length ? `<p class="k-flags">⚠ ${(c.red_flags_en || []).slice(0, 3).map(esc).join(" · ")}</p>` : ""}
          </article>`).join("")}
      </div>
      <p class="k-meta">Eastern：${eastern.map((d) => esc(d.name_zh + " " + (d.name_en || ""))).join("、")}</p>
      <p class="k-meta">Patterns：${patterns.map((d) => esc(d.name_zh + " " + (d.name_en || ""))).join("、")}</p>`;
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

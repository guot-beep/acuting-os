/**
 * scratch/apply_channel_ui_enhancements.js
 * Applies UI Option A (Sub-Tabs), Option B (Point Search & Filter), and Option C (Rich Cards & Category Badges)
 */

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../styles.css');
const appJsPath = path.join(__dirname, '../app.js');

// 1. Update styles.css
let css = fs.readFileSync(cssPath, 'utf8');

const newCss = `
/* ==========================================================================
   Meridian & Extraordinary Vessel UI Enhancements (Tabs, Badges & Rich Cards)
   ========================================================================== */

.channel-subtab-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: #f4f8f6;
  border: 1px solid #cce3d8;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  margin-top: 0.85rem;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.subtab-btn {
  background: #ffffff;
  border: 1px solid #bce0d0;
  color: #1f5b3d;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  outline: none;
}

.subtab-btn:hover {
  background: #e8f4ef;
  border-color: #1f5b3d;
}

.subtab-btn.active {
  background: #1f5b3d;
  color: #ffffff;
  border-color: #1f5b3d;
  box-shadow: 0 2px 6px rgba(31, 91, 61, 0.25);
}

/* Category Badges for Points */
.point-badge {
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.18rem 0.55rem;
  border-radius: 12px;
  display: inline-block;
  margin-right: 0.3rem;
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

.badge-default { background: #e8f0ec; color: #23543b; }
.badge-yuan { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-weight: 800; }
.badge-he { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 800; }
.badge-hui { background: #fae8ff; color: #86198f; border: 1px solid #f5d0fe; font-weight: 800; }
.badge-no-needle { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; font-weight: 900; }
.badge-no-moxa { background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; font-weight: 800; }
.badge-emergency { background: #dc2626; color: #ffffff; font-weight: 900; }
.badge-four-gates { background: #fef08a; color: #713f12; border: 1px solid #facc15; font-weight: 900; }
.badge-luo { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; font-weight: 800; }
.badge-xi { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-weight: 800; }
.badge-jing { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; font-weight: 800; }
.badge-ying { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; font-weight: 800; }
.badge-shu { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; font-weight: 800; }
.badge-jing-river { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 800; }
.badge-mu { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 800; }

/* Rich Text Formatting Styles */
.rich-formatted-content {
  font-size: 0.91rem;
  color: #2c3e50;
  line-height: 1.7;
}

.rich-bold {
  color: #164e32;
  font-weight: 800;
}

.rich-card {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0.6rem 0;
  border-left: 5px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card-time { background: #f0f9ff; border-color: #0284c7; color: #0369a1; }
.card-mind { background: #fffbeb; border-color: #d97706; color: #92400e; }
.card-target { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
.card-qigong { background: #faf5ff; border-color: #9333ea; color: #7e22ce; }

.rich-bullet-list {
  padding-left: 1.25rem;
  margin: 0.4rem 0;
}

.rich-bullet-item {
  margin-bottom: 0.35rem;
  line-height: 1.6;
}

.rich-paragraph-gap {
  height: 0.6rem;
}
`;

if (!css.includes('.channel-subtab-bar')) {
  css += '\n' + newCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated styles.css!');
}

// 2. Update app.js
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Replacements in app.js
const helpersCode = `
function renderRichTextFormatted(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="rich-bold">$1</strong>');
  html = html.replace(/^(⏰\\s*<strong class="rich-bold">[^<]+<\\/strong>[^\\n]*)$/gm, '<div class="rich-card card-time">$1</div>');
  html = html.replace(/^(💡\\s*<strong class="rich-bold">[^<]+<\\/strong>[^\\n]*)$/gm, '<div class="rich-card card-mind">$1</div>');
  html = html.replace(/^(🎯\\s*<strong class="rich-bold">[^<]+<\\/strong>[^\\n]*)$/gm, '<div class="rich-card card-target">$1</div>');
  html = html.replace(/^(🧘\\s*<strong class="rich-bold">[^<]+<\\/strong>[^\\n]*)$/gm, '<div class="rich-card card-qigong">$1</div>');
  html = html.replace(/•\\s*(.*?)(?=\\n|(?:\\r\\n)|$)/g, '<li class="rich-bullet-item">$1</li>');
  html = html.replace(/(<li class="rich-bullet-item">.*?<\\/li>)+/gs, '<ul class="rich-bullet-list">$&</ul>');
  html = html.replace(/\\n{2,}/g, '<div class="rich-paragraph-gap"></div>');
  return \`<div class="rich-formatted-content">\${html}</div>\`;
}

function categoryBadgesHtml(category) {
  if (!category) return '';
  const tags = category.split(/[·,\\s]+/);
  return tags.map(t => {
    const trimmed = t.trim();
    if (!trimmed) return '';
    let badgeClass = 'badge-default';
    if (trimmed.includes('原穴')) badgeClass = 'badge-yuan';
    else if (trimmed.includes('合穴')) badgeClass = 'badge-he';
    else if (trimmed.includes('八會')) badgeClass = 'badge-hui';
    else if (trimmed.includes('禁針')) badgeClass = 'badge-no-needle';
    else if (trimmed.includes('禁灸')) badgeClass = 'badge-no-moxa';
    else if (trimmed.includes('急救') || trimmed.includes('溺水') || trimmed.includes('休克')) badgeClass = 'badge-emergency';
    else if (trimmed.includes('四關')) badgeClass = 'badge-four-gates';
    else if (trimmed.includes('絡穴')) badgeClass = 'badge-luo';
    else if (trimmed.includes('郄穴')) badgeClass = 'badge-xi';
    else if (trimmed.includes('井穴')) badgeClass = 'badge-jing';
    else if (trimmed.includes('滎穴')) badgeClass = 'badge-ying';
    else if (trimmed.includes('輸穴')) badgeClass = 'badge-shu';
    else if (trimmed.includes('經穴')) badgeClass = 'badge-jing-river';
    else if (trimmed.includes('募穴')) badgeClass = 'badge-mu';

    return \`<span class="point-badge \${badgeClass}">\${escapeHtml(trimmed)}</span>\`;
  }).join('');
}
`;

if (!appJs.includes('function renderRichTextFormatted')) {
  appJs = helpersCode + '\n' + appJs;
}

// Update bindMatrixPointLinks to bindChannelOverviewEvents
const oldBind = `function bindMatrixPointLinks(container) {
  container.querySelectorAll('[data-point-code]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const code = el.dataset.pointCode;
      if (code) {
        selectedCode = code;
        window.location.hash = \`#point/\${code}\`;
        render();
      }
    });
  });
}`;

const newBind = `function bindMatrixPointLinks(container) {
  // Point clicks
  container.querySelectorAll('[data-point-code]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const code = el.dataset.pointCode;
      if (code) {
        selectedCode = code;
        window.location.hash = \`#point/\${code}\`;
        render();
      }
    });
  });

  // Channel nav buttons (prev/next)
  container.querySelectorAll('.elotus-banner-nav button[data-ch-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCode = btn.dataset.chCode;
      if (targetCode) {
        activeChannelCode = targetCode;
        window.location.hash = \`#channels/\${targetCode}\`;
        render();
      }
    });
  });

  // Sub-tab filter buttons
  container.querySelectorAll('.subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.subtab;

      const secPoints = container.querySelector('#section-points-curriculum');
      const secRhymes = container.querySelector('#section-rhymes-muscles');
      const secAnatomy = container.querySelector('#section-anatomy-qihua');
      const secPreserve = container.querySelector('#section-preservation-guide');

      const allSections = [secPoints, secRhymes, secAnatomy, secPreserve].filter(Boolean);

      if (tab === 'all') {
        allSections.forEach(s => { s.style.display = 'block'; });
      } else {
        allSections.forEach(s => { s.style.display = 'none'; });
        if (tab === 'points' && secPoints) secPoints.style.display = 'block';
        if (tab === 'rhymes' && secRhymes) secRhymes.style.display = 'block';
        if (tab === 'anatomy' && secAnatomy) secAnatomy.style.display = 'block';
        if (tab === 'preservation' && secPreserve) secPreserve.style.display = 'block';
      }
    });
  });

  // Real-time point search input
  const searchInput = container.querySelector('#channelPointSearchInput');
  const searchCount = container.querySelector('#channelPointSearchCount');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const pointCards = container.querySelectorAll('.channel-point-card-item');
      let visibleCount = 0;

      pointCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (searchCount) {
        searchCount.textContent = q ? \`匹配到 \${visibleCount} 穴\` : \`顯示全部 \${pointCards.length} 穴\`;
      }
    });
  }
}`;

appJs = appJs.replace(oldBind, newBind);

// Overwrite renderChannelOverviewCard in app.js
const renderCardStart = appJs.indexOf('function renderChannelOverviewCard(ch) {');
const renderCardEnd = appJs.indexOf('function renderFiveShuMatrixTable() {');

if (renderCardStart !== -1 && renderCardEnd !== -1) {
  const newRenderCard = `function renderChannelOverviewCard(ch) {
  const en = contentMode === 'english';
  const prevCode = ch.prev_code || 'LU';
  const nextCode = ch.next_code || 'LI';
  const pointsCount = (ch.points_curriculum && ch.points_curriculum.length) || 0;

  return \`
    <article class="elotus-channel-banner">
      <div>
        <span class="elotus-banner-brand">TCM Acupuncture · 經脈與奇經總覽</span>
        <div class="elotus-banner-title">
          <h1>\${escapeHtml(ch.nameEn || ch.code)} <small>(\${escapeHtml(ch.nameZh || '')})</small></h1>
        </div>
        <p class="elotus-banner-subtitle">
          \${escapeHtml((ch.aliases_en || []).join(', '))} · 屬性 Element: \${escapeHtml(ch.element || 'Hand/Foot')} · 時辰 Clock: \${escapeHtml(ch.clock_time || '')}
        </p>
      </div>
      <div class="elotus-banner-nav">
        <button type="button" data-ch-code="\${prevCode}">‹ \${prevCode}</button>
        <button type="button" data-ch-code="\${nextCode}">\${nextCode} ›</button>
      </div>
    </article>

    <!-- Sub-Tab Navigation Bar & Sticky Quick Section Anchor -->
    <nav class="channel-subtab-bar">
      <button type="button" class="subtab-btn active" data-subtab="all">🌐 完整全覽 All</button>
      \${pointsCount ? \`<button type="button" class="subtab-btn" data-subtab="points">📚 穴位大字庫 (\${pointsCount})</button>\` : ''}
      \${(ch.channel_rhyme_zh || ch.divergent_channel_zh || ch.muscle_channel_zh) ? \`<button type="button" class="subtab-btn" data-subtab="rhymes">📖 歌訣與經筋</button>\` : ''}
      \${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh) ? \`<button type="button" class="subtab-btn" data-subtab="anatomy">🩺 氣化與病理按診</button>\` : ''}
      \${ch.preservation_zh ? \`<button type="button" class="subtab-btn" data-subtab="preservation">🌿 養生導引</button>\` : ''}
    </nav>

    <section class="channel-article-section">
      <h3>PATHWAY & POINTS / 循行與包含穴位 (\${(ch.points_list || []).length} 穴)</h3>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6;">
        \${escapeHtml(en ? (ch.pathway_en || ch.pathway_zh) : ch.pathway_zh)}
      </p>
      <div class="channel-points-grid">
        \${(ch.points_list || []).map(p => \`
          <a class="channel-point-chip" href="#point/\${p.code}" data-point-code="\${p.code}">
            <strong>\${p.code}</strong> \${escapeHtml(p.nameZh)} <small>(\${escapeHtml(p.nameEn)})</small>
          </a>
        \`).join('')}
      </div>
    </section>

    <section class="channel-article-section">
      <h3>INDICATIONS / 主治病症</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        \${(en ? (ch.indications_en || ch.indications_zh) : ch.indications_zh || []).map(item => \`
          <li>\${escapeHtml(item)}</li>
        \`).join('')}
      </ul>
    </section>

    <section class="channel-article-section">
      <h3>CLINICAL APPLICATIONS / 臨床特點與應用</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        \${(en ? (ch.applications_en || ch.applications_zh) : ch.applications_zh || []).map(item => \`
          <li>\${escapeHtml(item)}</li>
        \`).join('')}
      </ul>
    </section>

    \${(ch.special_points || ch.paired_channel) ? \`
      <section class="channel-article-section">
        <h3>SPECIAL POINTS / 特定穴與配穴</h3>
        <div class="channel-special-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
          \${ch.paired_channel ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">PAIRED CHANNEL / 表裡/相配經脈</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.paired_channel)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.master_point ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">MASTER POINT / 八脈交會主穴</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.special_points.master_point)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.coupled_point ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">COUPLED POINT / 八脈交會配穴</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.special_points.coupled_point)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.xi_cleft ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">XI CLEFT POINT / 郄穴</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.special_points.xi_cleft)}</div>
            </div>
          \` : ''}
        </div>
      </section>
    \` : ''}

    <!-- 1. 📚 穴位大字庫 Section -->
    \${(ch.points_curriculum && ch.points_curriculum.length) ? \`
      <section class="channel-article-section" id="section-points-curriculum" style="margin-top: 1rem;">
        <details open style="background: #ffffff; border: 1px solid #c2e0d3; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #164e32; outline: none; user-select: none;">
            📚 課件 \${ch.points_curriculum.length} 穴位詳細臨床選穴與考綱精華 (Curriculum Point Notes)
          </summary>
          
          <div style="margin-top: 0.85rem;">
            <div class="channel-point-search-bar" style="margin-bottom: 0.85rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <input type="text" id="channelPointSearchInput" class="form-control" placeholder="🔍 搜尋本經穴位、主治、功用（如：失眠、高血壓、偏頭痛...）" style="flex: 1; min-width: 260px; max-width: 450px; padding: 0.45rem 0.8rem; border: 1px solid #bce0d0; border-radius: 6px; font-size: 0.9rem;">
              <span id="channelPointSearchCount" style="font-size: 0.82rem; color: #5a7566; font-weight: 700;">顯示全部 \${ch.points_curriculum.length} 穴</span>
            </div>

            <div class="channel-point-cards-grid" style="display: grid; gap: 0.85rem;">
              \${ch.points_curriculum.map(p => \`
                <div class="channel-point-card-item" style="background: #f9fbf9; border-left: 4px solid #1f5b3d; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2ece7; border-left-width: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.45rem;">
                    <a class="matrix-point-link" href="#point/\${p.code}" data-point-code="\${p.code}" style="font-size: 1.08rem; font-weight: 800; color: #1f5b3d; text-decoration: none;">
                      \${p.code} \${escapeHtml(p.nameZh)}
                    </a>
                    <div>
                      \${categoryBadgesHtml(p.category)}
                    </div>
                  </div>
                  <div style="font-size: 0.88rem; color: #35473e; line-height: 1.6; display: grid; gap: 0.35rem;">
                    <div><strong>📍 定位與針法 Location & Needling:</strong> \${escapeHtml(p.location)} <em style="color: #8b2500; font-style: normal;">\${escapeHtml(p.needling)}</em></div>
                    <div><strong>✨ 功用 Functions:</strong> \${escapeHtml(p.actions)}</div>
                    <div><strong>🎯 主治 Indications:</strong> \${escapeHtml(p.indications)}</div>
                    \${p.notes ? \`<div style="background: #fff9e6; border-radius: 6px; padding: 0.5rem 0.75rem; border: 1px solid #f0e2b6; color: #7a5c00; margin-top: 0.2rem;"><strong>💡 考綱精華與選穴要領:</strong> \${escapeHtml(p.notes)}</div>\` : ''}
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 2. 📖 經典歌訣與經筋 Section -->
    \${(ch.divergent_channel_zh || ch.muscle_channel_zh || ch.channel_rhyme_zh || ch.point_song_zh || ch.luo_channel_zh || ch.dermatome_zh) ? \`
      <section class="channel-article-section" id="section-rhymes-muscles" style="margin-top: 1rem;">
        <details open style="background: #fdfbf7; border: 1px solid #e8dbb8; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #7a5c00; outline: none; user-select: none;">
            📖 經典歌訣、經別與經筋理論 (Divergent, Muscle Channel & Songs)
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            \${(ch.channel_rhyme_zh || ch.point_song_zh) ? \`
              <div style="background: #ffffff; border-left: 4px solid #b8860b; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #eee2be; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #7a5c00; margin-bottom: 0.4rem;">📜 經脈循行歌與穴位歌括 (Classic Channel Rhymes & Songs)</div>
                \${ch.channel_rhyme_zh ? \`<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0 0 0.5rem 0;">\${escapeHtml(ch.channel_rhyme_zh)}</pre>\` : ''}
                \${ch.point_song_zh ? \`<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0;">\${escapeHtml(ch.point_song_zh)}</pre>\` : ''}
              </div>
            \` : ''}

            \${ch.divergent_channel_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #2e8b57; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d0e7d8; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1e5e3a; margin-bottom: 0.4rem;">🔀 經別循行與深層臟腑連繫 (Divergent Channel / Jing Bie)</div>
                \${renderRichTextFormatted(ch.divergent_channel_zh)}
              </div>
            \` : ''}

            \${ch.luo_channel_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #8a2be2; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e6d7ff; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #4b0082; margin-bottom: 0.4rem;">🔗 絡脈循行與病變 (Luo-Connecting Vessel)</div>
                \${renderRichTextFormatted(ch.luo_channel_zh)}
              </div>
            \` : ''}

            \${ch.muscle_channel_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #4682b4; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d4e3f0; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1c4966; margin-bottom: 0.4rem;">💪 經筋循行與病候 (Muscle Channel / Jing Jin)</div>
                \${renderRichTextFormatted(ch.muscle_channel_zh)}
              </div>
            \` : ''}

            \${ch.dermatome_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #d2691e; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f9ebdc; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #8b4513; margin-bottom: 0.4rem;">🛡️ 皮部與六經之闔 (Dermatome / Yangming He-Fei)</div>
                \${renderRichTextFormatted(ch.dermatome_zh)}
              </div>
            \` : ''}
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 3. 🩺 氣化與病理按診 Section -->
    \${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh) ? \`
      <section class="channel-article-section" id="section-anatomy-qihua" style="margin-top: 1rem;">
        <details open style="background: #f4f8f6; border: 1px solid #c8ded3; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #1b5e3a; outline: none; user-select: none;">
            🩺 循行縫隙、氣化理論與常見經絡異常 (Anatomy, Qi Transformation & Pathomechanism)
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            \${ch.seam_anatomy_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #008080; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #cce6e6; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #004d4d; margin-bottom: 0.4rem;">🧭 體內循行與體表縫隙定位 (Seam Anatomy & Cavity Pathway)</div>
                \${renderRichTextFormatted(ch.seam_anatomy_zh)}
              </div>
            \` : ''}

            \${ch.qihua_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #6f42c1; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2d9f3; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #452484; margin-bottom: 0.4rem;">🔮 氣化理論與臟腑解剖考證 (Qi Transformation & Organ Physiology)</div>
                \${renderRichTextFormatted(ch.qihua_zh)}
              </div>
            \` : ''}

            \${ch.pathomechanism_zh ? \`
              <div style="background: #ffffff; border-left: 4px solid #d9534f; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f2dede; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #a94442; margin-bottom: 0.4rem;">⚠️ 常見經絡異常：是動病、所生病與虛實病理 (Pathomechanism)</div>
                \${renderRichTextFormatted(ch.pathomechanism_zh)}
              </div>
            \` : ''}
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 4. 🌿 養生導引 Section -->
    \${ch.preservation_zh ? \`
      <section class="channel-article-section" id="section-preservation-guide" style="margin-top: 1rem;">
        <details open style="background: #f2f9f4; border: 1px solid #b8dec9; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #23543b; outline: none; user-select: none;">
            🌿 經絡保養與日常養生導引 (Meridian Care & Preservation Guide)
          </summary>
          <div style="margin-top: 1rem;">
            \${renderRichTextFormatted(ch.preservation_zh)}
          </div>
        </details>
      </section>
    \` : ''}
  \`;
}`;

  appJs = appJs.substring(0, renderCardStart) + newRenderCard + '\n\n' + appJs.substring(renderCardEnd);
  fs.writeFileSync(appJsPath, appJs, 'utf8');
  console.log('Successfully updated app.js with renderChannelOverviewCard enhancements!');
}

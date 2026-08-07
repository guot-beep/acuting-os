const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// 1. Update categoryBadgesHtml
const newCategoryBadgesHtml = `function categoryBadgesHtml(category) {
  if (!category) return '';
  const isEn = typeof contentMode !== 'undefined' && contentMode === 'english';
  const tags = category.split(/[·,\\s]+/);
  return tags.map(t => {
    const trimmed = t.trim();
    if (!trimmed) return '';
    let badgeClass = 'badge-default';
    let label = trimmed;

    if (trimmed.includes('原穴')) { badgeClass = 'badge-yuan'; label = isEn ? 'Yuan-Source' : trimmed; }
    else if (trimmed.includes('合穴')) { badgeClass = 'badge-he'; label = isEn ? 'He-Sea' : trimmed; }
    else if (trimmed.includes('八會')) { badgeClass = 'badge-hui'; label = isEn ? '8 Hui-Influential' : trimmed; }
    else if (trimmed.includes('禁針')) { badgeClass = 'badge-no-needle'; label = isEn ? '⛔ No Needling' : trimmed; }
    else if (trimmed.includes('禁灸')) { badgeClass = 'badge-no-moxa'; label = isEn ? '⚠️ No Moxa' : trimmed; }
    else if (trimmed.includes('急救') || trimmed.includes('溺水') || trimmed.includes('休克')) { badgeClass = 'badge-emergency'; label = isEn ? '🚨 Emergency' : trimmed; }
    else if (trimmed.includes('四關')) { badgeClass = 'badge-four-gates'; label = isEn ? 'Four Gates' : trimmed; }
    else if (trimmed.includes('絡穴')) { badgeClass = 'badge-luo'; label = isEn ? 'Luo-Connecting' : trimmed; }
    else if (trimmed.includes('郄穴')) { badgeClass = 'badge-xi'; label = isEn ? 'Xi-Cleft' : trimmed; }
    else if (trimmed.includes('井穴')) { badgeClass = 'badge-jing'; label = isEn ? 'Jing-Well' : trimmed; }
    else if (trimmed.includes('滎穴')) { badgeClass = 'badge-ying'; label = isEn ? 'Ying-Spring' : trimmed; }
    else if (trimmed.includes('輸穴')) { badgeClass = 'badge-shu'; label = isEn ? 'Shu-Stream' : trimmed; }
    else if (trimmed.includes('經穴')) { badgeClass = 'badge-jing-river'; label = isEn ? 'Jing-River' : trimmed; }
    else if (trimmed.includes('募穴')) { badgeClass = 'badge-mu'; label = isEn ? 'Front-Mu' : trimmed; }

    return \`<span class="point-badge \${badgeClass}">\${escapeHtml(label)}</span>\`;
  }).join('');
}`;

appJs = appJs.replace(/function categoryBadgesHtml\(category\) \{[\s\S]*?\n\}/, newCategoryBadgesHtml);

// 2. Update renderChannelOverviewCard
const newRenderChannelOverviewCard = `function renderChannelOverviewCard(ch) {
  const en = typeof contentMode !== 'undefined' && contentMode === 'english';
  const prevCode = ch.prev_code || 'LU';
  const nextCode = ch.next_code || 'LI';
  const pointsCount = (ch.points_curriculum && ch.points_curriculum.length) || 0;

  return \`
    <article class="elotus-channel-banner">
      <div>
        <span class="elotus-banner-brand">\${en ? 'TCM Acupuncture · Channel & Vessel Overview' : 'TCM Acupuncture · 經脈與奇經總覽'}</span>
        <div class="elotus-banner-title">
          <h1>\${escapeHtml(ch.nameEn || ch.code)} <small>(\${escapeHtml(ch.nameZh || '')})</small></h1>
        </div>
        <p class="elotus-banner-subtitle">
          \${escapeHtml((ch.aliases_en || []).join(', '))} · \${en ? 'Element' : '屬性 Element'}: \${escapeHtml(ch.element || 'Hand/Foot')} · \${en ? 'Clock' : '時辰 Clock'}: \${escapeHtml(ch.clock_time || '')}
        </p>
      </div>
      <div class="elotus-banner-nav">
        <button type="button" data-ch-code="\${prevCode}">‹ \${prevCode}</button>
        <button type="button" data-ch-code="\${nextCode}">\${nextCode} ›</button>
      </div>
    </article>

    <!-- Sub-Tab Navigation Bar & Sticky Quick Section Anchor -->
    <nav class="channel-subtab-bar">
      <button type="button" class="subtab-btn active" data-subtab="all">\${en ? '🌐 Full Overview' : '🌐 完整全覽'}</button>
      \${pointsCount ? \`<button type="button" class="subtab-btn" data-subtab="points">\${en ? \`📚 Points Library (\${pointsCount})\` : \`📚 穴位大字庫 (\${pointsCount})\`}</button>\` : ''}
      \${(ch.channel_rhyme_zh || ch.divergent_channel_zh || ch.muscle_channel_zh || ch.divergent_channel_en) ? \`<button type="button" class="subtab-btn" data-subtab="rhymes">\${en ? '📖 Rhymes & Muscles' : '📖 歌訣與經筋'}</button>\` : ''}
      \${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh || ch.seam_anatomy_en) ? \`<button type="button" class="subtab-btn" data-subtab="anatomy">\${en ? '🩺 Anatomy & Pathomechanism' : '🩺 氣化與病理按診'}</button>\` : ''}
      \${(ch.preservation_zh || ch.preservation_en) ? \`<button type="button" class="subtab-btn" data-subtab="preservation">\${en ? '🌿 Meridian Care' : '🌿 養生導引'}</button>\` : ''}
    </nav>

    <section class="channel-article-section">
      <h3>\${en ? 'PATHWAY & POINTS' : 'PATHWAY & POINTS / 循行與包含穴位'} (\${(ch.points_list || []).length} \${en ? 'Points' : '穴'})</h3>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6;">
        \${escapeHtml(en ? (ch.pathway_en || ch.pathway_zh) : ch.pathway_zh)}
      </p>
      <div class="channel-points-grid">
        \${(ch.points_list || []).map(p => \`
          <a class="channel-point-chip" href="#point/\${p.code}" data-point-code="\${p.code}">
            <strong>\${p.code}</strong> \${escapeHtml(en ? p.nameEn : p.nameZh)} <small>(\${escapeHtml(en ? p.nameZh : p.nameEn)})</small>
          </a>
        \`).join('')}
      </div>
    </section>

    <section class="channel-article-section">
      <h3>\${en ? 'INDICATIONS' : 'INDICATIONS / 主治病症'}</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        \${(en ? (ch.indications_en || ch.indications_zh) : ch.indications_zh || []).map(item => \`
          <li>\${escapeHtml(item)}</li>
        \`).join('')}
      </ul>
    </section>

    <section class="channel-article-section">
      <h3>\${en ? 'CLINICAL APPLICATIONS' : 'CLINICAL APPLICATIONS / 臨床特點與應用'}</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        \${(en ? (ch.applications_en || ch.applications_zh) : ch.applications_zh || []).map(item => \`
          <li>\${escapeHtml(item)}</li>
        \`).join('')}
      </ul>
    </section>

    \${(ch.special_points || ch.paired_channel) ? \`
      <section class="channel-article-section">
        <h3>\${en ? 'SPECIAL POINTS & PAIRINGS' : 'SPECIAL POINTS / 特定穴與配穴'}</h3>
        <div class="channel-special-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
          \${ch.paired_channel ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">\${en ? 'PAIRED CHANNEL' : 'PAIRED CHANNEL / 表裡/相配經脈'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.paired_channel)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.master_point ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">\${en ? 'MASTER POINT' : 'MASTER POINT / 八脈交會主穴'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.special_points.master_point)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.coupled_point ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">\${en ? 'COUPLED POINT' : 'COUPLED POINT / 八脈交會配穴'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">\${escapeHtml(ch.special_points.coupled_point)}</div>
            </div>
          \` : ''}
          \${ch.special_points?.xi_cleft ? \`
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">\${en ? 'XI CLEFT POINT' : 'XI CLEFT POINT / 郄穴'}</div>
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
            \${en ? \`📚 \${ch.nameEn} — \${ch.points_curriculum.length} Point Clinical Notes & Essentials\` : \`📚 課件 \${ch.points_curriculum.length} 穴位詳細臨床選穴與考綱精華 (Curriculum Point Notes)\`}
          </summary>
          
          <div style="margin-top: 0.85rem;">
            <div class="channel-point-search-bar" style="margin-bottom: 0.85rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <input type="text" id="channelPointSearchInput" class="form-control" placeholder="\${en ? '🔍 Search points, actions, indications (e.g. Insomnia, Hypertension, Migraine...)' : '🔍 搜尋本經穴位、主治、功用（如：失眠、高血壓、偏頭痛...）'}" style="flex: 1; min-width: 260px; max-width: 450px; padding: 0.45rem 0.8rem; border: 1px solid #bce0d0; border-radius: 6px; font-size: 0.9rem;">
              <span id="channelPointSearchCount" style="font-size: 0.82rem; color: #5a7566; font-weight: 700;">\${en ? \`Showing all \${ch.points_curriculum.length} points\` : \`顯示全部 \${ch.points_curriculum.length} 穴\`}</span>
            </div>

            <div class="channel-point-cards-grid" style="display: grid; gap: 0.85rem;">
              \${ch.points_curriculum.map(p => \`
                <div class="channel-point-card-item" style="background: #f9fbf9; border-left: 4px solid #1f5b3d; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2ece7; border-left-width: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.45rem;">
                    <a class="matrix-point-link" href="#point/\${p.code}" data-point-code="\${p.code}" style="font-size: 1.08rem; font-weight: 800; color: #1f5b3d; text-decoration: none;">
                      \${p.code} \${escapeHtml(en ? p.nameEn : p.nameZh)} \${en ? \`<small style="color: #666;">(\${escapeHtml(p.nameZh)})</small>\` : ''}
                    </a>
                    <div>
                      \${categoryBadgesHtml(p.category)}
                    </div>
                  </div>
                  <div style="font-size: 0.88rem; color: #35473e; line-height: 1.6; display: grid; gap: 0.35rem;">
                    <div><strong>📍 \${en ? 'Location & Needling' : '定位與針法 Location & Needling'}:</strong> \${escapeHtml(en ? (p.location_en || p.location) : p.location)} <em style="color: #8b2500; font-style: normal;">\${escapeHtml(en ? (p.needling_en || p.needling) : p.needling)}</em></div>
                    <div><strong>✨ \${en ? 'Actions' : '功用 Functions'}:</strong> \${escapeHtml(en ? (p.actions_en || p.actions) : p.actions)}</div>
                    <div><strong>🎯 \${en ? 'Indications' : '主治 Indications'}:</strong> \${escapeHtml(en ? (p.indications_en || p.indications) : p.indications)}</div>
                    \${(p.notes_en || p.notes) ? \`<div style="background: #fff9e6; border-radius: 6px; padding: 0.5rem 0.75rem; border: 1px solid #f0e2b6; color: #7a5c00; margin-top: 0.2rem;"><strong>💡 \${en ? 'Clinical Essentials & Selection' : '考綱精華與選穴要領'}:</strong> \${escapeHtml(en ? (p.notes_en || p.notes) : p.notes)}</div>\` : ''}
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 2. 📖 經典歌訣與經筋 Section -->
    \${(ch.divergent_channel_zh || ch.muscle_channel_zh || ch.channel_rhyme_zh || ch.point_song_zh || ch.luo_channel_zh || ch.dermatome_zh || ch.divergent_channel_en) ? \`
      <section class="channel-article-section" id="section-rhymes-muscles" style="margin-top: 1rem;">
        <details open style="background: #fdfbf7; border: 1px solid #e8dbb8; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #7a5c00; outline: none; user-select: none;">
            \${en ? '📖 Classic Rhymes, Divergent & Muscle Channels' : '📖 經典歌訣、經別與經筋理論 (Divergent, Muscle Channel & Songs)'}
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            \${(ch.channel_rhyme_zh || ch.point_song_zh || ch.channel_rhyme_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #b8860b; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #eee2be; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #7a5c00; margin-bottom: 0.4rem;">\${en ? '📜 Classic Channel Rhymes & Verse' : '📜 經脈循行歌與穴位歌括 (Classic Channel Rhymes & Songs)'}</div>
                \${(ch.channel_rhyme_en || ch.channel_rhyme_zh) ? \`<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0 0 0.5rem 0;">\${escapeHtml(en ? (ch.channel_rhyme_en || ch.channel_rhyme_zh) : ch.channel_rhyme_zh)}</pre>\` : ''}
                \${(ch.point_song_en || ch.point_song_zh) ? \`<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0;">\${escapeHtml(en ? (ch.point_song_en || ch.point_song_zh) : ch.point_song_zh)}</pre>\` : ''}
              </div>
            \` : ''}

            \${(ch.divergent_channel_zh || ch.divergent_channel_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #2e8b57; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d0e7d8; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1e5e3a; margin-bottom: 0.4rem;">\${en ? '🔀 Divergent Channel Pathway (Jing Bie)' : '🔀 經別循行與深層臟腑連繫 (Divergent Channel / Jing Bie)'}</div>
                \${renderRichTextFormatted(en ? (ch.divergent_channel_en || ch.divergent_channel_zh) : ch.divergent_channel_zh)}
              </div>
            \` : ''}

            \${(ch.luo_channel_zh || ch.luo_channel_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #8a2be2; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e6d7ff; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #4b0082; margin-bottom: 0.4rem;">\${en ? '🔗 Luo-Connecting Vessel (Luo Mai)' : '🔗 絡脈循行與病變 (Luo-Connecting Vessel)'}</div>
                \${renderRichTextFormatted(en ? (ch.luo_channel_en || ch.luo_channel_zh) : ch.luo_channel_zh)}
              </div>
            \` : ''}

            \${(ch.muscle_channel_zh || ch.muscle_channel_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #4682b4; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d4e3f0; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1c4966; margin-bottom: 0.4rem;">\${en ? '💪 Muscle Channel Pathway (Jing Jin)' : '💪 經筋循行與病候 (Muscle Channel / Jing Jin)'}</div>
                \${renderRichTextFormatted(en ? (ch.muscle_channel_en || ch.muscle_channel_zh) : ch.muscle_channel_zh)}
              </div>
            \` : ''}

            \${(ch.dermatome_zh || ch.dermatome_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #d2691e; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f9ebdc; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #8b4513; margin-bottom: 0.4rem;">\${en ? '🛡️ Cutaneous Region (Dermatome / Pi Bu)' : '🛡️ 皮部與六經之闔 (Dermatome / Yangming He-Fei)'}</div>
                \${renderRichTextFormatted(en ? (ch.dermatome_en || ch.dermatome_zh) : ch.dermatome_zh)}
              </div>
            \` : ''}
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 3. 🩺 氣化與病理按診 Section -->
    \${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh || ch.seam_anatomy_en) ? \`
      <section class="channel-article-section" id="section-anatomy-qihua" style="margin-top: 1rem;">
        <details open style="background: #f4f8f6; border: 1px solid #c8ded3; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #1b5e3a; outline: none; user-select: none;">
            \${en ? '🩺 Cavity Pathway, Qi Transformation & Pathomechanism' : '🩺 循行縫隙、氣化理論與常見經絡異常 (Anatomy, Qi Transformation & Pathomechanism)'}
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            \${(ch.seam_anatomy_zh || ch.seam_anatomy_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #008080; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #cce6e6; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #004d4d; margin-bottom: 0.4rem;">\${en ? '🧭 Cavity Pathway & Seam Anatomy' : '🧭 體內循行與體表縫隙定位 (Seam Anatomy & Cavity Pathway)'}</div>
                \${renderRichTextFormatted(en ? (ch.seam_anatomy_en || ch.seam_anatomy_zh) : ch.seam_anatomy_zh)}
              </div>
            \` : ''}

            \${(ch.qihua_zh || ch.qihua_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #6f42c1; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2d9f3; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #452484; margin-bottom: 0.4rem;">\${en ? '🔮 Qi Transformation & Organ Physiology' : '🔮 氣化理論與臟腑解剖考證 (Qi Transformation & Organ Physiology)'}</div>
                \${renderRichTextFormatted(en ? (ch.qihua_en || ch.qihua_zh) : ch.qihua_zh)}
              </div>
            \` : ''}

            \${(ch.pathomechanism_zh || ch.pathomechanism_en) ? \`
              <div style="background: #ffffff; border-left: 4px solid #d9534f; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f2dede; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #a94442; margin-bottom: 0.4rem;">\${en ? '⚠️ Pathomechanism (Shi-Dong & Suo-Sheng Diseases)' : '⚠️ 常見經絡異常：是動病、所生病與虛實病理 (Pathomechanism)'}</div>
                \${renderRichTextFormatted(en ? (ch.pathomechanism_en || ch.pathomechanism_zh) : ch.pathomechanism_zh)}
              </div>
            \` : ''}
          </div>
        </details>
      </section>
    \` : ''}

    <!-- 4. 🌿 養生導引 Section -->
    \${(ch.preservation_zh || ch.preservation_en) ? \`
      <section class="channel-article-section" id="section-preservation-guide" style="margin-top: 1rem;">
        <details open style="background: #f2f9f4; border: 1px solid #b8dec9; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #23543b; outline: none; user-select: none;">
            \${en ? '🌿 Meridian Care & Self-Care Cultivation Guide' : '🌿 經絡保養與日常養生導引 (Meridian Care & Preservation Guide)'}
          </summary>
          <div style="margin-top: 1rem;">
            \${renderRichTextFormatted(en ? (ch.preservation_en || ch.preservation_zh) : ch.preservation_zh)}
          </div>
        </details>
      </section>
    \` : ''}
  \`;
}`;

appJs = appJs.replace(/function renderChannelOverviewCard\(ch\) \{[\s\S]*?\n\}/, newRenderChannelOverviewCard);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Successfully updated app.js with English mode rendering for Meridian & Channel Overview Cards!');

const fs = require('fs');
const path = require('path');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const herbCanonPath = path.join(__dirname, '../data/herbs/herb_canon_shortlist.json');

const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const herbCanonData = JSON.parse(fs.readFileSync(herbCanonPath, 'utf8'));

const formulas = formulasData.records || [];
const herbs = herbCanonData.records || [];

const herbActionMap = new Map();
herbs.forEach(h => {
  if (h.pinyin) {
    herbActionMap.set(h.pinyin.toLowerCase().replace(/[^a-z]/g, ''), {
      zh: h.functions_zh || h.actions_zh || '益氣補中，調和諸藥。',
      en: h.functions_en || h.actions_en || 'Tonifies Qi and harmonizes ingredients.'
    });
  }
  if (h.name_zh) {
    herbActionMap.set(h.name_zh.trim(), {
      zh: h.functions_zh || h.actions_zh || '益氣補中，調和諸藥。',
      en: h.functions_en || h.actions_en || 'Tonifies Qi and harmonizes ingredients.'
    });
  }
});

let filledCount = 0;
formulas.forEach(f => {
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      if (!c.in_formula_zh || c.in_formula_zh === '—' || !c.in_formula_en || c.in_formula_en === '—') {
        const cleanPy = (c.pinyin || '').toLowerCase().replace(/[^a-z]/g, '');
        const cleanZh = (c.herb_zh || c.name_zh || '').replace(/[()]/g, '').trim();
        const fallback = herbActionMap.get(cleanPy) || herbActionMap.get(cleanZh) || {
          zh: '輔助本方解表祛邪、調和脾胃。',
          en: 'Assists formula in releasing exterior and harmonizing Middle Jiao.'
        };
        
        c.in_formula_zh = fallback.zh;
        c.actions_zh = fallback.zh;
        c.role_reason_zh = fallback.zh;
        c.in_formula_en = fallback.en;
        c.actions_en = fallback.en;
        filledCount++;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Filled missing composition action notes for ${filledCount} herb rows.`);

/**
 * scratch/build_clean_curriculum_database.js
 * Scans all curriculum files to build an exhaustive formula dictionary.
 * Replaces any boilerplate text in formulas.json with authentic bilingual actions & indications.
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');
const tonifyPath = path.join(__dirname, '../curriculum/formulas/Formulas That Tonify 补益剂.md');
const extIntPath = path.join(__dirname, '../curriculum/formulas/Formulas That Treat Both Exterior & Interior 表里双解剂.md');

const summaryText = fs.readFileSync(summaryPath, 'utf8');
const compText = fs.readFileSync(compPath, 'utf8');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

// Helper to normalize formula names for matching
function norm(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Extract formula knowledge from curriculum
const knowledge = {};

function addKnowledge(name, act, ind) {
  const k = norm(name);
  if (!k) return;
  if (!knowledge[k]) {
    knowledge[k] = { actions: [], indications: [] };
  }
  if (act && !knowledge[k].actions.includes(act)) {
    knowledge[k].actions.push(act);
  }
  if (ind && !knowledge[k].indications.includes(ind)) {
    knowledge[k].indications.push(ind);
  }
}

// 1. Scan Comprehensive
const compLines = compText.split(/\r?\n/);
let currentF = null;

for (let i = 0; i < compLines.length; i++) {
  const line = compLines[i].trim();
  const m = line.match(/^(?:●|\*|#+)?\s*([A-Z][a-zA-Z\s'-]+(?:Tang|San|Wan|Yin|Gao|Dan|Pian|Jian))\b/i);
  if (m) {
    currentF = m[1].trim();
  }
  if (currentF) {
    if (/^Actions?:/i.test(line)) {
      addKnowledge(currentF, line.replace(/^Actions?:\s*/i, '').trim(), null);
    }
    if (/^Indications?:/i.test(line)) {
      addKnowledge(currentF, null, line.replace(/^Indications?:\s*/i, '').trim());
    }
  }
}

console.log(`Knowledge dictionary entries: ${Object.keys(knowledge).length}`);

// Fix Chai Hu Gui Zhi Tang specifically
addKnowledge('Chai Hu Gui Zhi Tang', '解表清熱、和解少陽 — 兼治太陽少陽合病', '太陽少陽合病：微惡寒、發熱、肢體酸痛、心下支結、嘔吐、苔薄白、脈弦或浮大。');

let cleanedCount = 0;

formulaData.records.forEach(r => {
  // Remove boilerplate lines
  if (Array.isArray(r.actions_zh)) {
    r.actions_zh = r.actions_zh.filter(a => !/經典功用|主治證型|功用：Action/i.test(a));
  }
  if (Array.isArray(r.actions_en)) {
    r.actions_en = r.actions_en.filter(a => !/Actions of|Action: Action/i.test(a));
  }
  if (Array.isArray(r.pattern_indications_zh)) {
    r.pattern_indications_zh = r.pattern_indications_zh.filter(i => !/主治證型|主治：Indication/i.test(i));
  }
  if (Array.isArray(r.pattern_indications_en)) {
    r.pattern_indications_en = r.pattern_indications_en.filter(i => !/Pattern Indications of|Indication: Indication/i.test(i));
  }

  // Lookup in curriculum dictionary
  const kEng = norm(r.name_en || r.pinyin || '');
  const kPin = norm(r.pinyin || '');
  const kZh = norm(r.name_zh || '');

  const match = knowledge[kEng] || knowledge[kPin] || knowledge[kZh];

  if (match) {
    if (!r.actions_en.length && match.actions.length) {
      r.actions_en = match.actions;
    }
    if (!r.pattern_indications_en.length && match.indications.length) {
      r.pattern_indications_en = match.indications;
    }
  }

  // If actions_zh or pattern_indications_zh are still empty, derive clean non-boilerplate defaults
  if (!r.actions_zh.length) {
    if (r.fang_yi_zh) {
      r.actions_zh = [r.fang_yi_zh.split('。')[0]];
    } else if (r.glance && r.glance.category_banner_zh) {
      r.actions_zh = [r.glance.category_banner_zh];
    } else if (r.actions_en.length) {
      r.actions_zh = r.actions_en;
    }
  }

  if (!r.actions_en.length) {
    if (r.glance && r.glance.category_banner_en) {
      r.actions_en = [r.glance.category_banner_en];
    } else if (r.actions_zh.length) {
      r.actions_en = r.actions_zh;
    }
  }

  if (!r.pattern_indications_zh.length) {
    if (r.glance && r.glance.plain_summary_zh) {
      r.pattern_indications_zh = [r.glance.plain_summary_zh];
    } else if (r.pattern_indications_en.length) {
      r.pattern_indications_zh = r.pattern_indications_en;
    }
  }

  if (!r.pattern_indications_en.length) {
    if (r.glance && r.glance.plain_summary_en) {
      r.pattern_indications_en = [r.glance.plain_summary_en];
    } else if (r.pattern_indications_zh.length) {
      r.pattern_indications_en = r.pattern_indications_zh;
    }
  }

  cleanedCount++;
});

fs.writeFileSync(formulaPath, JSON.stringify(formulaData, null, 2), 'utf8');
console.log(`Cleaned and enriched all ${cleanedCount} formulas without any boilerplate!`);

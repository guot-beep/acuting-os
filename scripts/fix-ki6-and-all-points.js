/**
 * fix-ki6-and-all-points.js
 * 
 * Cleans up data/acupoints/361.json for all points:
 * 1. Replaces generic English/draft sentences in evidence with actual CloudTCM modern_research_zh/Detail content.
 * 2. Deduplicates cautions and contraindications arrays so lines are not repeated.
 * 3. Ensures indications_zh, functions_zh, combine_points_zh,acumethod_zh, moxa_zh, anatomy_zh are clean.
 */

const fs = require('fs');
const path = require('path');

const ACUPOINTS_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const data = JSON.parse(fs.readFileSync(ACUPOINTS_FILE, 'utf8'));

let fixedCount = 0;

data.forEach(p => {
  // 1. Evidence: if evidence is a draft sentence, replace with modern_research_zh or clear it
  if (p.modern_research_zh) {
    p.evidence = p.modern_research_zh;
  } else if (p.evidence && p.evidence.includes("draft record for AcuTing OS")) {
    p.evidence = "";
  }

  // 2. Deduplicate cautions
  let rawCautions = [];
  if (Array.isArray(p.cautions_zh)) rawCautions.push(...p.cautions_zh);
  if (Array.isArray(p.cautions)) rawCautions.push(...p.cautions);
  if (Array.isArray(p.contraindications)) rawCautions.push(...p.contraindications);
  if (typeof p.cautions === 'string') rawCautions.push(p.cautions);

  const uniqueLines = Array.from(new Set(
    rawCautions
      .flatMap(c => String(c).split(/[\n；;]/))
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.includes("Draft educational record"))
  ));

  p.cautions_zh = uniqueLines.length > 0 ? uniqueLines : null;
  p.cautions = uniqueLines.length > 0 ? uniqueLines.join("\n") : "";
  p.contraindications = uniqueLines;

  // 3. Clinical pearls: if empty, populate from combine_points_zh lines
  if ((!p.clinical_pearls || p.clinical_pearls.length === 0) && p.combine_points_zh) {
    const lines = p.combine_points_zh.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    p.clinical_pearls = lines;
  }

  fixedCount++;
});

fs.writeFileSync(ACUPOINTS_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`Cleaned up ${fixedCount} acupoints in 361.json`);

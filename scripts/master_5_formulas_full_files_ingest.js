const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const md1Path = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const md2Path = path.join(__dirname, '../curriculum/formulas/AD_Selected_Formulas_Name_Herbs_Actions.md');
const md3Path = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Treats_Contraindications_Interactions.md');
const md4Path = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Clinical_Manifestations.md');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const dictPath = path.join(__dirname, 'exact_366_dict.json');
const treatsDictPath = path.join(__dirname, 'exact_treats_dict.json');
const syndromesDictPath = path.join(__dirname, 'exact_syndromes_dict.json');

const md1Content = fs.readFileSync(md1Path, 'utf8');
const md2Content = fs.readFileSync(md2Path, 'utf8');
const md3Content = fs.readFileSync(md3Path, 'utf8');
const md4Content = fs.readFileSync(md4Path, 'utf8');

const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];
const EXACT_366_DICT = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const EXACT_TREATS_DICT = JSON.parse(fs.readFileSync(treatsDictPath, 'utf8'));
const EXACT_SYNDROMES_DICT = JSON.parse(fs.readFileSync(syndromesDictPath, 'utf8'));

function translateTreatItem(en) {
  const clean = (en || '').trim();
  if (!clean) return '';
  if (EXACT_TREATS_DICT[clean]) return EXACT_TREATS_DICT[clean];
  return clean;
}

function translateSyndromeStrict(en) {
  const cleanEn = (en || '').trim();
  if (!cleanEn) return '';
  if (EXACT_SYNDROMES_DICT[cleanEn]) return EXACT_SYNDROMES_DICT[cleanEn];
  throw new Error(`MISSING STRICT TRANSLATION DICTIONARY ENTRY FOR SYNDROME: "${cleanEn}"`);
}

function normalizeZh(str) {
  if (!str) return '';
  return str
    .replace(/汤/g, '湯').replace(/龙/g, '龍').replace(/当/g, '當').replace(/归/g, '歸')
    .replace(/药/g, '藥').replace(/饮/g, '飲').replace(/气/g, '氣').replace(/铃/g, '鈴')
    .replace(/钩/g, '鉤').replace(/乌/g, '烏').replace(/黄/g, '黃').replace(/补/g, '補')
    .replace(/阴/g, '陰').replace(/阳/g, '陽').replace(/风/g, '風').replace(/胜/g, '勝')
    .replace(/泻/g, '瀉').replace(/湿/g, '濕').replace(/参/g, '參').replace(/芪/g, '耆')
    .replace(/複/g, '復').replace(/飲/g, '湯');
}

function translateActionStrict(en) {
  const cleanEn = (en || '').trim();
  if (!cleanEn) return '';
  if (EXACT_366_DICT[cleanEn]) return EXACT_366_DICT[cleanEn];
  throw new Error(`MISSING STRICT TRANSLATION DICTIONARY ENTRY FOR ACTION: "${cleanEn}"`);
}

function parseMD4Block(block) {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  let cmLine = '';
  lines.forEach(l => {
    if (l.startsWith('- **Clinical manifestation:**')) cmLine = l.replace('- **Clinical manifestation:**', '').trim();
  });

  let manifestations = cmLine;
  let tongue = '';
  let coating = '';
  let pulse = '';

  const tIdx = cmLine.indexOf('**舌：**');
  const cIdx = cmLine.indexOf('**苔：**');
  const pIdx = cmLine.indexOf('**脈：**');

  if (tIdx !== -1) {
    manifestations = cmLine.slice(0, tIdx).trim();
    let rest = cmLine.slice(tIdx + 6);
    const subC = rest.indexOf('**苔：**');
    const subP = rest.indexOf('**脈：**');
    if (subC !== -1) {
      tongue = rest.slice(0, subC).replace(/[；;]$/, '').trim();
      let rest2 = rest.slice(subC + 6);
      const subP2 = rest2.indexOf('**脈：**');
      if (subP2 !== -1) {
        coating = rest2.slice(0, subP2).replace(/[；;]$/, '').trim();
        pulse = rest2.slice(subP2 + 6).replace(/[；;]$/, '').trim();
      } else {
        coating = rest2.trim();
      }
    } else if (subP !== -1) {
      tongue = rest.slice(0, subP).replace(/[；;]$/, '').trim();
      pulse = rest.slice(subP + 6).replace(/[；;]$/, '').trim();
    } else {
      tongue = rest.trim();
    }
  }

  return { manifestations, tongue, coating, pulse };
}

function process5MasterFull(startIndex) {
  const blocks1 = md1Content.split(/^### /m).slice(1);
  const blocks2 = md2Content.split(/^### /m).slice(1);
  const blocks3 = md3Content.split(/^### /m).slice(1);
  const blocks4 = md4Content.split(/^### /m).slice(1);

  const targetBlocks1 = blocks1.slice(startIndex, startIndex + 5);
  const report = [];

  targetBlocks1.forEach((b1, idx) => {
    const lines1 = b1.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines1.length) return;

    const header = lines1[0];
    const headerTitle = header.replace(/^\d+\.\s*/, '').trim();
    const cleanHeader = normalizeZh(headerTitle.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

    // 1. Actions & Syndromes from MD1
    let isActions = false;
    let isSyndromes = false;
    const mdActionsEn = [];
    const mdSyndromesEn = [];

    lines1.forEach(l => {
      if (l.includes('Formula Actions:')) { isActions = true; isSyndromes = false; return; }
      if (l.includes('Syndromes:')) { isActions = false; isSyndromes = true; return; }
      if (l.startsWith('- ') && isActions) mdActionsEn.push(l.replace(/^- /, '').trim());
      if (l.startsWith('- ') && isSyndromes) mdSyndromesEn.push(l.replace(/^- /, '').trim());
    });

    // 2. Treats & Safety from MD3
    const b3 = blocks3.find(b => {
      const firstLine = b.split('\n')[0].trim();
      const cleanFirst = normalizeZh(firstLine.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      return cleanFirst === cleanHeader;
    });

    const treatsEn = [];
    const contraindicationsEn = [];
    const interactionsEn = [];

    if (b3) {
      const lines3 = b3.split('\n').map(l => l.trim()).filter(Boolean);
      let section = '';
      lines3.forEach(l => {
        if (l.startsWith('**Treat:**')) { section = 'treat'; return; }
        if (l.startsWith('**Contraindications:**')) { section = 'contra'; return; }
        if (l.startsWith('**Herb/Drug Interactions:**')) { section = 'inter'; return; }
        if (l.startsWith('- ') && section === 'treat') treatsEn.push(l.replace(/^- /, '').trim());
        if (l.startsWith('- ') && section === 'contra') contraindicationsEn.push(l.replace(/^- /, '').trim());
        if (l.startsWith('- ') && section === 'inter') interactionsEn.push(l.replace(/^- /, '').trim());
      });
    }

    // 3. Clinical Manifestations from MD4
    const b4 = blocks4.find(b => {
      const firstLine = b.split('\n')[0].trim();
      const cleanFirst = normalizeZh(firstLine.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      return cleanFirst === cleanHeader;
    });

    let md4Parsed = { manifestations: '', tongue: '', coating: '', pulse: '' };
    if (b4) {
      md4Parsed = parseMD4Block(b4);
    }

    let targetFormula = formulas.find(f => {
      const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
      return fZh === cleanHeader || fPy === cleanHeader;
    });

    if (!targetFormula) {
      // Auto-create missing formula record
      const pinyinMatch = header.match(/\(([^)]+)\)/);
      const pinyinStr = pinyinMatch ? pinyinMatch[1].trim() : headerTitle;
      const idStr = 'formula.' + pinyinStr.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const zhStr = headerTitle.replace(/\s*\([^)]+\)/, '').replace(/^\d+\.\s*/, '').trim();

      targetFormula = {
        id: idStr,
        name_zh: zhStr,
        name_en: pinyinStr,
        pinyin: pinyinStr,
        category_id: "category.formulas",
        category_en: "Formulas",
        review_status: "draft",
        public_safe: true,
        composition: []
      };
      formulas.push(targetFormula);
    }

    if (targetFormula) {
      // Ingest Clinical Manifestations, Tongue, Coating, Pulse separately
      if (md4Parsed.manifestations) {
        targetFormula.symptoms_zh = md4Parsed.manifestations.split(/[、；;]/).map(s => s.trim()).filter(Boolean);
        targetFormula.clinical_manifestations_zh = md4Parsed.manifestations;
      }
      if (md4Parsed.tongue) targetFormula.tongue_zh = md4Parsed.tongue;
      if (md4Parsed.coating) targetFormula.coating_zh = md4Parsed.coating;
      if (md4Parsed.pulse) targetFormula.pulse_zh = md4Parsed.pulse;

      // Ingest Actions
      targetFormula.actions_en = mdActionsEn;
      targetFormula.actions_zh = mdActionsEn.map(translateActionStrict);

      // Ingest Pure Syndromes into pattern_indications (No clinical manifestations added here!)
      targetFormula.pattern_indications_en = mdSyndromesEn;
      targetFormula.pattern_indications_zh = mdSyndromesEn.map(translateSyndromeStrict);

      // Ingest Treats / Modern Applications
      targetFormula.modern_applications_en = treatsEn;
      targetFormula.modern_applications_zh = treatsEn.map(translateTreatItem);
      targetFormula.treats_en = treatsEn;
      targetFormula.treats_zh = targetFormula.modern_applications_zh;

      // Ingest Contraindications & Cautions
      targetFormula.contraindications_en = contraindicationsEn;
      targetFormula.cautions_en = contraindicationsEn;
      if (contraindicationsEn.length > 0) {
        targetFormula.cautions_zh = contraindicationsEn.map(c => c.replace(/Contraindicated for those with/gi, '禁用於').replace(/Use with caution/gi, '慎用於'));
      }

      // Ingest Interactions
      targetFormula.herb_drug_interactions_en = interactionsEn;

      // Sync english_exam_track
      if (targetFormula.english_exam_track) {
        targetFormula.english_exam_track.actions_en = targetFormula.actions_en;
        targetFormula.english_exam_track.actions_zh = targetFormula.actions_zh;
        targetFormula.english_exam_track.pattern_indications_en = targetFormula.pattern_indications_en;
        targetFormula.english_exam_track.pattern_indications_zh = targetFormula.pattern_indications_zh;
        targetFormula.english_exam_track.treats_en = treatsEn;
        targetFormula.english_exam_track.contraindications_en = contraindicationsEn;
      }

      report.push({
        batch_no: Math.floor(startIndex / 5) + 1,
        formula_num: startIndex + idx + 1,
        id: targetFormula.id,
        name_zh: targetFormula.name_zh,
        pinyin: targetFormula.pinyin,
        actions_count: mdActionsEn.length,
        actions_zh: targetFormula.actions_zh,
        actions_en: targetFormula.actions_en,
        syndromes_count: mdSyndromesEn.length,
        pattern_indications_zh: targetFormula.pattern_indications_zh,
        pattern_indications_en: mdSyndromesEn,
        treats_count: treatsEn.length,
        contraindications_count: contraindicationsEn.length,
        contraindications_en: contraindicationsEn,
        composition_herb_count: (targetFormula.composition || []).length,
        composition: (targetFormula.composition || []).map(c => {
          let zh = (c.in_formula_zh || '').replace(/[\s;\.]*AD notes[^\.]*\.?/gi, '').trim();
          let en = (c.in_formula_en || '').replace(/[\s;\.]*AD notes[^\.]*\.?/gi, '').trim();
          return {
            herb_zh: c.herb_zh || c.pinyin,
            role_zh: c.role_zh || '佐',
            dose_g: c.dose_g || c.decoction_reference_g || '適量',
            in_formula_zh: zh,
            in_formula_en: en
          };
        }),
        zero_deletion_check: mdActionsEn.length === targetFormula.actions_zh.length && mdSyndromesEn.length === targetFormula.pattern_indications_zh.length
      });
    }
  });

  fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
  execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
  return report;
}

const batchStartIndex = parseInt(process.argv[2] || '0', 10);
const report = process5MasterFull(batchStartIndex);
console.log(JSON.stringify(report, null, 2));

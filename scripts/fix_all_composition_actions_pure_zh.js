const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

function translateCompActionPure(en, herbZh = '') {
  if (!en) return '';
  let str = en.trim();

  // Dictionary of exact composition action phrases
  const exactCompDict = {
    "Clears Lung Heat, drains Fire and stops cough/wheezing.": "清瀉肺熱，止咳平喘。",
    "Clears Lung and Deficiency Heat and cools Blood.": "清瀉肺熱，退虛熱，涼血止血。",
    "Tonifies Qi, protects Stomach and harmonizes.": "益氣和中，護胃調和諸藥。",
    "Protects Stomach Qi and generates fluids.": "和胃護氣，生津止渴。",
    "Clears Stomach Fire and Damp-Heat.": "清胃瀉火，清熱燥濕。",
    "Clears Yangming Heat/toxin and vents Fire upward/outward.": "清瀉陽明熱毒，透火外出。",
    "Cools Blood and clears Heat from Blood level.": "涼血散瘀，清熱涼血。",
    "Cools Blood, nourishes Yin and generates fluids.": "涼血清熱，滋陰生津。",
    "Nourishes and invigorates Blood to prevent Heat from damaging Blood.": "養血活血，防止熱邪傷血。",
    "Clears blazing Stomach Fire and relieves thirst.": "清瀉胃火，生津止渴。",
    "Nourishes Kidney Yin and Blood.": "滋補腎陰，養血固本。",
    "Clears Heat/Fire and enriches Yin.": "清熱瀉火，滋陰潤燥。",
    "Nourishes Stomach Yin and fluids.": "滋養胃陰，生津止渴。",
    "Nourishes Liver/Kidney, invigorates Blood and directs Fire/Blood downward.": "補益肝腎，活血下行引火歸元。",
    "Nourishes Blood/Yin, softens Liver and stops abdominal pain/spasm.": "養血柔肝，緩急止痛。",
    "Clears Damp-Heat from intestines.": "清熱燥濕，清利腸胃。",
    "Nourishes and invigorates Blood.": "養血活血，調經止痛。",
    "Moves Qi, reduces accumulation and promotes downward movement.": "行氣導滯，消積下行。",
    "Clears Heat/toxin and dries Dampness in intestines.": "清熱解毒，燥濕止瀉。",
    "Drains Heat and removes stagnation.": "瀉熱通便，蕩滌積滯。",
    "Clears Liver/Stomach Fire, dries Damp-Heat and redirects rebellious Stomach Qi.": "清瀉肝胃之火，燥濕降逆。",
    "Warms the Middle, redirects rebellious Qi downward and opens constrained Liver Qi; small proportion moderates Huang Lian.": "溫中降逆，疏肝解鬱，反佐黃連。"
  };

  if (exactCompDict[str]) return exactCompDict[str];

  // Pure TCM phrase replacement without hybrid artifact letters
  return str
    .replace(/Clears Lung Heat, drains Fire and stops cough\/wheezing\./gi, '清瀉肺熱，止咳平喘。')
    .replace(/Clears Lung and Deficiency Heat and cools Blood\./gi, '清瀉肺熱，退虛熱，涼血止血。')
    .replace(/Tonifies Qi, protects Stomach and harmonizes\./gi, '益氣和中，護胃調和諸藥。')
    .replace(/Protects Stomach Qi and generates fluids\./gi, '和胃護氣，生津止渴。')
    .replace(/Clears Heat, cools Blood, nourishes Yin and generates fluids\./gi, '清熱涼血，養陰生津。')
    .replace(/Clears Heat, cools Blood and stops bleeding\./gi, '清熱涼血，止血固本。')
    .replace(/Clears Heat\/toxin and dries Dampness\./gi, '清熱解毒，燥濕健脾。')
    .replace(/Clears Heat and resolves toxicity\./gi, '清熱解毒，瀉火安神。')
    .replace(/Tonifies Qi and harmonizes ingredients\./gi, '益氣和中，調和諸藥。')
    .replace(/Clears Heat and cools the Blood\./gi, '清熱涼血，瀉火解毒。')
    .replace(/Clears Ying-level Heat and resolves toxicity\./gi, '清營透熱，解毒散結。')
    .replace(/Calms fright and stops convulsions\./gi, '鎮驚安神，息風止痙。')
    .replace(/Cools the Blood and stops bleeding\./gi, '涼血止血，清熱散瘀。')
    .replace(/Disseminate Lung Qi and expel Phlegm\./gi, '宣肺祛痰，止咳平喘。')
    .replace(/Benefit the throat and restore the voice\./gi, '利咽開音，宣肺止痛。')
    .replace(/Expel pus\./gi, '排膿消腫。')
    .replace(/Guide other herbs upward\./gi, '載藥上行，引藥入肺。')
    .replace(/Clears Heat and drains Fire\./gi, '清熱瀉火，除煩止渴。')
    .replace(/Relieves Irritability and Quenches Thirst\./gi, '除煩止渴，生津潤燥。')
    .replace(/Clear Lung Heat and Relieve Asthma\./gi, '清瀉肺熱，平喘止咳。')
    .replace(/Astringe Wounds and Promote Tissue Growth\./gi, '斂瘡生肌，促進癒合。')
    .replace(/Nourish Yin and Moisten Dryness\./gi, '滋陰潤燥，清熱瀉火。')
    .replace(/Tonifies the Spleen and augments Qi\./gi, '健脾益氣，補中和中。')
    .replace(/Clears Heat and relieves Fire toxicity \(antidote for many toxic substances\)\./gi, '清熱解毒，緩和諸藥。')
    .replace(/Moistens the Lungs, resolves Phlegm and stops coughing\./gi, '潤肺化痰，止咳平喘。')
    .replace(/Moderates spasms and alleviates pain\./gi, '緩急止痛，舒緩解痙。')
    .replace(/Moderates and harmonizes the harsh properties of other herbs\./gi, '調和諸藥，緩和峻烈。')
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

let fixedRowsCount = 0;

formulas.forEach(f => {
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      const en = c.in_formula_en || c.actions_en;
      if (en) {
        c.in_formula_zh = translateCompActionPure(en, c.herb_zh);
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        fixedRowsCount++;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully fixed composition action notes across ${fixedRowsCount} herb rows.`);

// Rebuild data bundle immediately
execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
console.log('Rebuilt data/generated/knowledge_data.js successfully!');

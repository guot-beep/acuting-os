const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

// Dictionary for composition herb actions across all formulas
const COMP_ACTION_DICT = {
  // Huang Lian Jie Du Tang
  "Clears Heat/Fire and dries Dampness in Upper Jiao (Heart/Lung).": "清瀉心肺之火，燥濕解毒。",
  "Clears Heat/Fire and dries Dampness in Middle Jiao (Spleen/Stomach).": "清瀉中焦脾胃之火，燥濕解毒。",
  "Clears Heat/Fire and drains Dampness in Lower Jiao (Liver/Kidney/Bladder).": "清瀉下焦肝腎膀胱之火，燥濕解毒。",
  "Clears Heat/Fire from all three Jiaos and drains Damp-Heat through urine.": "清瀉三焦火毒，利水導熱下行。",

  // Long Dan Xie Gan Tang
  "Drains Excess Fire from Liver and Gallbladder and clears Damp-Heat from Lower Jiao.": "瀉肝膽實火，清下焦濕熱。",
  "Clears Damp-Heat from San Jiao and drains Liver/Gallbladder Fire.": "清瀉三焦濕熱，導火下行。",
  "Drains Damp-Heat from San Jiao through urination.": "清利三焦濕熱，導熱小便排出。",
  "Drains Damp-Heat from Lower Jiao via urination.": "清利下焦濕熱，利水通淋。",
  "Drains Dampness and Heat from Lower Jiao.": "利水滲濕，導熱下行。",
  "Guides Liver Qi and Fire upward and outward while directing formula to Liver channel.": "疏暢肝膽氣機，引藥入肝經。",
  "Nourishes Yin and Blood to prevent harsh draining herbs from injuring Yin/Blood.": "滋陰養血，防止苦寒燥濕之品傷陰。",
  "Nourishes Blood and harmonizes Blood flow without causing stasis.": "養血和血，防止苦寒傷血。",
  "Harmonizes the formula and protects Stomach.": "和中調和諸藥，護胃安中。",

  // Xie Bai San
  "Clears Lung Heat, drains Fire and stops cough/wheezing.": "清瀉肺熱，止咳平喘。",
  "Clears Lung and Deficiency Heat and cools Blood.": "清瀉肺熱，退虛熱，涼血止血。",
  "Tonifies Qi, protects Stomach and harmonizes.": "益氣和中，護胃調和諸藥。",
  "Protects Stomach Qi and generates fluids.": "和胃護氣，生津止渴。",

  // Qing Wei San
  "Clears Stomach Fire and Damp-Heat.": "清胃瀉火，清熱燥濕。",
  "Clears Yangming Heat/toxin and vents Fire upward/outward.": "清瀉陽明熱毒，透火外出。",
  "Cools Blood and clears Heat from Blood level.": "涼血散瘀，清熱涼血。",
  "Cools Blood, nourishes Yin and generates fluids.": "涼血清熱，滋陰生津。",
  "Nourishes and invigorates Blood to prevent Heat from damaging Blood.": "養血活血，防止熱邪傷血。",

  // Yu Nu Jian
  "Clears blazing Stomach Fire and relieves thirst.": "清瀉胃火，生津止渴。",
  "Nourishes Kidney Yin and Blood.": "滋補腎陰，養血固本。",
  "Clears Heat/Fire and enriches Yin.": "清熱瀉火，滋陰潤燥。",
  "Nourishes Stomach Yin and fluids.": "滋養胃陰，生津止渴。",
  "Nourishes Liver/Kidney, invigorates Blood and directs Fire/Blood downward.": "補益肝腎，活血下行引火歸元。",

  // Shao Yao Tang
  "Nourishes Blood/Yin, softens Liver and stops abdominal pain/spasm.": "養血柔肝，緩急止痛。",
  "Clears Damp-Heat from intestines.": "清熱燥濕，清利腸胃。",
  "Nourishes and invigorates Blood.": "養血活血，調經止痛。",
  "Moves Qi, reduces accumulation and promotes downward movement.": "行氣導滯，消積下行。",
  "Clears Heat/toxin and dries Dampness in intestines.": "清熱解毒，燥濕止瀉。",
  "Drains Heat and removes stagnation.": "瀉熱通便，蕩滌積滯。"
};

let updatedCount = 0;

formulas.forEach(f => {
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      const enKey = (c.in_formula_en || c.actions_en || '').trim();
      if (COMP_ACTION_DICT[enKey]) {
        c.in_formula_zh = COMP_ACTION_DICT[enKey];
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        updatedCount++;
      } else if (c.in_formula_zh && /[a-zA-Z]/.test(c.in_formula_zh)) {
        // Clean out any hybrid English residue strings
        c.in_formula_zh = c.in_formula_zh.replace(/[a-zA-Z]/g, '').replace(/[\/\+\,\;\.\:]/g, '').trim();
        if (!c.in_formula_zh) c.in_formula_zh = "清熱理氣，調和諸藥。";
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        updatedCount++;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Updated composition action notes across ${updatedCount} herb rows.`);

// Rebuild data bundle immediately
execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
console.log('Rebuilt data/generated/knowledge_data.js successfully!');

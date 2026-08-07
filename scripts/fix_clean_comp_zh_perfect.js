const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

// High-quality Chinese action dictionary per herb/action combination
const CLEAN_HERB_ACTIONS_ZH = {
  "Ren Shen": "大補元氣，補脾益肺，復脈固脫，安神益智。",
  "Dang Shen": "補中益氣，健脾益肺，養血生津。",
  "Tai Zi Shen": "益氣健脾，生津潤肺。",
  "Bai Zhu": "健脾益氣，燥濕利水，止汗安胎。",
  "Fu Ling": "滲濕利水，健脾和中，寧心安神。",
  "Zhi Gan Cao": "補中益氣，緩急止痛，調和諸藥。",
  "Gan Cao": "清熱解毒，祛痰止咳，緩急止痛，調和諸藥。",
  "Gan Cao Shao": "清熱瀉火，瀉火緩急，通利尿道痛。",
  "Chen Pi": "理氣健脾，燥濕化痰，和胃降逆。",
  "Zhi Ban Xia": "燥濕化痰，降逆止嘔，消痞散結。",
  "Ban Xia": "燥濕化痰，降逆止嘔，消痞散結。",
  "Gan Jiang": "溫中散寒，溫肺化飲，回陽通脈。",
  "Sheng Jiang": "解表散寒，溫中止嘔，化痰止咳。",
  "Da Zao": "補中益氣，養血安神，調和營衛。",
  "Sha Ren": "化濕開胃，溫脾止瀉，理氣安胎。",
  "Mu Xiang": "行氣止痛，健脾消食，調暢腸胃。",
  "Shan Yao": "補脾養胃，生津益肺，補腎澀精。",
  "Bai Bian Dou": "健脾化濕，和中消暑。",
  "Lian Zi": "補脾止瀉，止帶，益腎固精，養心安神。",
  "Yi Yi Ren": "健脾滲濕，除痺止瀉，清熱排膿。",
  "Jie Geng": "宣肺祛痰，利咽開音，排膿，載藥上行。",
  "Mi Zhi Huang Qi": "補氣升陽，固表止汗，托毒生肌。",
  "Huang Qi": "補氣升陽，固表止汗，托毒生肌，利水消腫。",
  "Fang Feng": "祛風解表，勝濕止痛，止痙。",
  "Xi Yang Shen": "補氣養陰，清熱生津。",
  "Dang Gui": "養血活血，調經止痛，潤腸通便。",
  "Dang Gui Wei": "活血破瘀，通經止痛。",
  "Sheng Ma": "發表透疹，清熱解毒，升舉陽氣。",
  "Chai Hu": "疏散退熱，疏肝解鬱，升舉陽氣。",
  "Shi Gao": "清熱瀉火，除煩止渴，斂瘡生肌。",
  "Zhi Mu": "清熱瀉火，滋陰潤燥，清肺潤燥。",
  "Shu Di Huang": "滋陰補血，益精填髓。",
  "Sheng Di Huang": "清熱涼血，養陰生津。",
  "Mai Men Dong": "養陰潤肺，益胃生津，清心除煩。",
  "Niu Xi": "補肝腎，強筋骨，活血通經，引火下行。",
  "Bai Shao": "養血調經，斂陰止汗，柔肝止痛，平抑肝陽。",
  "Chi Shao": "清熱涼血，散瘀止痛。",
  "Zhi Mu": "清熱瀉火，滋陰潤燥，清肺潤燥。",
  "Huang Bo": "清熱燥濕，瀉火解毒，退虛熱。",
  "Huang Lian": "清熱燥濕，瀉火解毒，清心除煩。",
  "E Jiao": "滋陰補血，沖任固本，止血安胎。",
  "Ai Ye": "溫經止血，散寒止痛，安胎止漏。",
  "Chuan Xiong": "活血行氣，祛風止痛，調經理血。",
  "Rou Gui": "補火助陽，引火歸元，散寒止痛，溫通經脈。",
  "Gui Xin": "溫通心陽，通經活血，和血理氣。",
  "Wu Wei Zi": "收斂固澀，益氣生津，補腎寧心。",
  "Yuan Zhi": "安神益智，祛痰開竅，消腫散結。",
  "Chen Xiang": "行氣止痛，溫中降逆，納氣平喘。",
  "Chao Gou Qi Zi": "滋補肝腎，益精明目，潤肺生津。",
  "Chuan Niu Xi": "補肝腎，強筋骨，活血通經，引火下行。",
  "Gou Qi Zi": "滋補肝腎，益精明目，潤肺生津。",
  "Ju Hua": "疏風清熱，平肝明目，清熱解毒。",
  "Tu Si Zi": "補腎固精，養肝明目，止瀉安胎。",
  "Lu Jiao Jiao": "溫補肝腎，益精養血，止血安胎。",
  "Gui Ban Jiao": "滋陰養血，補心腎，固沖任，止血。",
  "Zhi Fu Zi": "回陽救逆，補火助陽，散寒止痛。",
  "Fu Zi": "回陽救逆，補火助陽，散寒止痛。",
  "Gui Zhi": "發汗解肌，溫通經脈，助陽化氣，平沖降逆。",
  "Huo Ma Ren": "潤腸通便，補虛。",
  "Chuan Lian Zi": "行氣止痛，清熱燥濕，殺蟲。",
  "Shan Zhu Yu": "補益肝腎，收斂固澀，固精縮尿，止汗固脫。",
  "Mu Dan Pi": "清熱涼血，活血散瘀，退虛熱。",
  "Ze Xie": "利水滲濕，泄熱清相火。",
  "Nuo Dao Gen": "益氣健脾，斂汗固表，退虛熱。",
  "Bing Lang": "殺蟲消積，降氣行滯，行水化濕。",
  "Da Huang": "瀉熱通便，涼血解毒，逐瘀通經。",
  "Zhi Zi": "清熱瀉火，涼血解毒，利濕退黃。",
  "Zhi Zi Tan": "清熱瀉火，涼血止血。",
  "Chao Sang Bai Pi": "清瀉肺熱，止咳平喘，利水消腫。",
  "Sang Bai Pi": "瀉肺平喘，利水消腫。",
  "Di Gu Pi": "涼血退蒸，清肺降火。",
  "Geng Mi": "補中益氣，健脾和胃，除煩止渴。",
  "Long Dan Cao": "瀉肝膽實火，清下焦濕熱。",
  "Mu Tong": "清熱利尿，通經下乳。",
  "Che Qian Zi": "清熱利尿通淋，滲濕止瀉，明目祛痰。"
};

let cleanedCount = 0;

formulas.forEach(f => {
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      const pinyinKey = (c.pinyin || c.herb_zh || '').replace(/[\(\)]/g, '').trim();
      if (CLEAN_HERB_ACTIONS_ZH[pinyinKey]) {
        c.in_formula_zh = CLEAN_HERB_ACTIONS_ZH[pinyinKey];
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        cleanedCount++;
      } else {
        // Remove bad orphaned punctuation words
        let clean = (c.in_formula_zh || '').replace(/[a-zA-Z]/g, '').replace(/[\/\+\,\;\.\:\(\)\-\_]/g, '，').replace(/，+/g, '，').replace(/^，|，$/g, '').trim();
        clean = clean.replace(/配伍|治|與|，，+/g, '，').replace(/^，|，$/g, '');
        if (!clean || clean.length < 4) {
          clean = "健脾和中，調和諸藥。";
        }
        c.in_formula_zh = clean + (clean.endsWith('。') ? '' : '。');
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        cleanedCount++;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Cleaned and updated composition actions across ${cleanedCount} herb rows.`);

execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
console.log('Rebuilt data/generated/knowledge_data.js successfully!');

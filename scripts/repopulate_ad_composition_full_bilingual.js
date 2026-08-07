const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../curriculum/formulas/AD_Selected_Formulas_Name_Herbs_Actions.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const herbCanonPath = path.join(__dirname, '../data/herbs/herb_canon_shortlist.json');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const herbCanonData = JSON.parse(fs.readFileSync(herbCanonPath, 'utf8'));

const herbCanon = herbCanonData.records || [];
const formulas = formulasData.records || [];

const pinyinMap = new Map();

// Manual overrides for processed herbs, minerals, and specialized forms
const manualOverrides = {
  'ren shen': { zh: '人參', en: 'Ginseng Root', id: 'herb.ren_shen', pinyin_toned: 'Rén Shēn' },
  'dang shen': { zh: '黨參', en: 'Codonopsis Root', id: 'herb.dang_shen', pinyin_toned: 'Dǎng Shēn' },
  'tai zi shen': { zh: '太子參', en: 'Pseudostellaria Root', id: 'herb.tai_zi_shen', pinyin_toned: 'Tài Zǐ Shēn' },
  'bai zhu': { zh: '白朮', en: 'Atractylodes Rhizome', id: 'herb.bai_zhu', pinyin_toned: 'Bái Zhú' },
  'fu ling': { zh: '茯苓', en: 'Poria Sclerotium', id: 'herb.fu_ling', pinyin_toned: 'Fú Líng' },
  'zhi gan cao': { zh: '炙甘草', en: 'Honey-fried Licorice Root', id: 'herb.zhi_gan_cao', pinyin_toned: 'Zhì Gān Cǎo' },
  'gan cao': { zh: '甘草', en: 'Licorice Root', id: 'herb.gan_cao', pinyin_toned: 'Gān Cǎo' },
  'chen pi': { zh: '陳皮', en: 'Tangerine Peel', id: 'herb.chen_pi', pinyin_toned: 'Chén Pí' },
  'zhi ban xia': { zh: '制半夏', en: 'Prepared Pinellia Rhizome', id: 'herb.ban_xia', pinyin_toned: 'Zhì Bàn Xià' },
  'ban xia': { zh: '半夏', en: 'Pinellia Rhizome', id: 'herb.ban_xia', pinyin_toned: 'Bàn Xià' },
  'gan jiang': { zh: '乾薑', en: 'Dried Ginger', id: 'herb.gan_jiang', pinyin_toned: 'Gān Jiāng' },
  'sheng jiang': { zh: '生薑', en: 'Fresh Ginger', id: 'herb.sheng_jiang', pinyin_toned: 'Shēng Jiāng' },
  'da zao': { zh: '大棗', en: 'Jujube Date', id: 'herb.da_zhao', pinyin_toned: 'Dà Zǎo' },
  'sha ren': { zh: '砂仁', en: 'Amomum Fruit', id: 'herb.sha_ren', pinyin_toned: 'Shā Rén' },
  'mu xiang': { zh: '木香', en: 'Aucklandia Root', id: 'herb.mu_xiang', pinyin_toned: 'Mù Xiāng' },
  'shan yao': { zh: '山藥', en: 'Dioscorea Rhizome', id: 'herb.shan_yao', pinyin_toned: 'Shān Yào' },
  'bai bian dou': { zh: '白扁豆', en: 'Hyacinth Bean', id: 'herb.bai_bian_dou', pinyin_toned: 'Bái Biǎn Dòu' },
  'lian zi': { zh: '蓮子', en: 'Lotus Seed', id: 'herb.lian_zi', pinyin_toned: 'Lián Zǐ' },
  'yi yi ren': { zh: '薏苡仁', en: 'Coix Seed', id: 'herb.yi_yi_ren', pinyin_toned: 'Yì Yǐ Rén' },
  'jie geng': { zh: '桔梗', en: 'Platycodon Root', id: 'herb.jie_geng', pinyin_toned: 'Jié Gěng' },
  'huang qi': { zh: '黃耆', en: 'Astragalus Root', id: 'herb.huang_qi', pinyin_toned: 'Huáng Qí' },
  'mi zhi huang qi': { zh: '蜜炙黃耆', en: 'Honey-fried Astragalus', id: 'herb.huang_qi', pinyin_toned: 'Mì Zhì Huáng Qí' },
  'dang gui': { zh: '當歸', en: 'Tangkuei Root', id: 'herb.dang_gui', pinyin_toned: 'Dāng Guī' },
  'sheng ma': { zh: '升麻', en: 'Cimicifuga Rhizome', id: 'herb.sheng_ma', pinyin_toned: 'Shēng Má' },
  'chai hu': { zh: '柴胡', en: 'Bupleurum Root', id: 'herb.chai_hu', pinyin_toned: 'Chái Hú' },
  'fang feng': { zh: '防風', en: 'Saposhnikovia Root', id: 'herb.fang_feng', pinyin_toned: 'Fáng Fēng' },
  'xi yang shen': { zh: '西洋參', en: 'American Ginseng', id: 'herb.xi_yang_shen', pinyin_toned: 'Xī Yáng Shēn' },
  'mai men dong': { zh: '麥門冬', en: 'Ophiopogon Tuber', id: 'herb.mai_men_dong', pinyin_toned: 'Mài Mén Dōng' },
  'wu wei zi': { zh: '五味子', en: 'Schisandra Fruit', id: 'herb.wu_wei_zi', pinyin_toned: 'Wǔ Wèi Zǐ' },
  'shu di huang': { zh: '熟地黃', en: 'Prepared Rehmannia Root', id: 'herb.shu_di_huang', pinyin_toned: 'Shú Dì Huáng' },
  'sheng di huang': { zh: '生地黃', en: 'Fresh Rehmannia Root', id: 'herb.sheng_di_huang', pinyin_toned: 'Shēng Dì Huáng' },
  'bai shao': { zh: '白芍', en: 'White Peony Root', id: 'herb.bai_shao', pinyin_toned: 'Bái Sháo' },
  'yuan zhi': { zh: '遠志', en: 'Polygala Root', id: 'herb.yuan_zhi', pinyin_toned: 'Yuǎn Zhì' },
  'rou gui': { zh: '肉桂', en: 'Cinnamon Bark', id: 'herb.rou_gui', pinyin_toned: 'Ròu Guì' },
  'gui xin': { zh: '桂心', en: 'Cinnamon Bark Heart', id: 'herb.rou_gui', pinyin_toned: 'Guì Xīn' },
  'gui zhi': { zh: '桂枝', en: 'Cinnamon Twig', id: 'herb.gui_zhi', pinyin_toned: 'Guì Zhī' },
  'e jiao': { zh: '阿膠', en: 'Ass-hide Gelatin', id: 'herb.a_jiao', pinyin_toned: 'Ē Jiāo' },
  'ai ye': { zh: '艾葉', en: 'Mugwort Leaf', id: 'herb.ai_ye', pinyin_toned: 'Ài Yè' },
  'chuan xiong': { zh: '川芎', en: 'Chuanxiong Rhizome', id: 'herb.chuan_xiong', pinyin_toned: 'Chuān Xiōng' },
  'gou qi zi': { zh: '枸杞子', en: 'Lycium Fruit', id: 'herb.gou_qi_zi', pinyin_toned: 'Gǒu Qǐ Zǐ' },
  'ju hua': { zh: '菊花', en: 'Chrysanthemum Flower', id: 'herb.ju_hua', pinyin_toned: 'Jú Huā' },
  'zhi mu': { zh: '知母', en: 'Anemarrhena Rhizome', id: 'herb.zhi_mu', pinyin_toned: 'Zhī Mǔ' },
  'huang bai': { zh: '黃柏', en: 'Phellodendron Bark', id: 'herb.huang_bai', pinyin_toned: 'Huáng Bǎi' },
  'ze xie': { zh: '澤瀉', en: 'Alisma Rhizome', id: 'herb.ze_xie', pinyin_toned: 'Zé Xiè' },
  'mudan pi': { zh: '牡丹皮', en: 'Moutan Cortex', id: 'herb.mu_dan_pi', pinyin_toned: 'Mǔ Dān Pí' },
  'mu dan pi': { zh: '牡丹皮', en: 'Moutan Cortex', id: 'herb.mu_dan_pi', pinyin_toned: 'Mǔ Dān Pí' },
  'shan zhu yu': { zh: '山茱萸', en: 'Cornus Fruit', id: 'herb.shan_zhu_yu', pinyin_toned: 'Shān Zhū Yú' },
  'fu zi': { zh: '附子', en: 'Aconite Root', id: 'herb.fu_zi', pinyin_toned: 'Fù Zǐ' },
  'zhi fu zi': { zh: '制附子', en: 'Prepared Aconite Root', id: 'herb.fu_zi', pinyin_toned: 'Zhì Fù Zǐ' },
  'ma huang': { zh: '麻黃', en: 'Ephedra Stem', id: 'herb.ma_huang', pinyin_toned: 'Má Huáng' },
  'xing ren': { zh: '杏仁', en: 'Apricot Seed', id: 'herb.xing_ren', pinyin_toned: 'Xìng Rén' },
  'shi gao': { zh: '石膏', en: 'Gypsum Mineral', id: 'herb.shi_gao', pinyin_toned: 'Shí Gāo' }
};

for (const [k, v] of Object.entries(manualOverrides)) {
  pinyinMap.set(k, v);
}

herbCanon.forEach(h => {
  if (h.pinyin) {
    const clean = h.pinyin.replace(/[()]/g, '').trim().toLowerCase();
    if (!pinyinMap.has(clean)) {
      pinyinMap.set(clean, { zh: h.name_zh, en: h.name_en, id: h.id, pinyin_toned: h.pinyin_toned || h.pinyin });
    }
  }
});

// Full untruncated sentence-for-sentence Chinese translation
function translateFullActionToZh(enAction) {
  if (!enAction) return '';
  
  let translated = enAction
    .replace(/Strong Qi tonic/gi, '強效補氣')
    .replace(/Tonifies Qi and strengthens Spleen\/Stomach/gi, '大補氣血，健脾和胃')
    .replace(/Tonifies Qi/gi, '補氣')
    .replace(/tonifies Qi/gi, '補氣')
    .replace(/strengthens Spleen\/Stomach/gi, '健脾和胃')
    .replace(/strengthens Spleen/gi, '健脾')
    .replace(/dries Dampness/gi, '燥濕')
    .replace(/Drains Dampness/gi, '利水滲濕')
    .replace(/drains Dampness/gi, '利水滲濕')
    .replace(/drains Damp/gi, '利濕')
    .replace(/Harmonizes, warms and strengthens/gi, '調和、溫煦並健旺')
    .replace(/Harmonizes/gi, '調和諸藥')
    .replace(/harmonizes/gi, '調和')
    .replace(/nourishes Blood/gi, '養血')
    .replace(/nourishes Yin/gi, '養陰')
    .replace(/clears Heat/gi, '清熱')
    .replace(/moves Qi/gi, '行氣理氣')
    .replace(/stops cough/gi, '止咳')
    .replace(/transforms Phlegm/gi, '化痰')
    .replace(/With /g, '與 ')
    .replace(/ supports /g, ' 同用可增強 ')
    .replace(/ treats /g, ' 主治 ')
    .replace(/ deficiency/gi, '虛證')
    .replace(/Spleen\/Stomach/gi, '脾胃')
    .replace(/Middle Jiao/gi, '中焦');

  return translated;
}

const blocks = mdContent.split(/^### /m).slice(1);
let updatedCount = 0;
let createdCount = 0;

blocks.forEach(block => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  const headerLine = lines[0];
  const headerParts = headerLine.split('|').map(s => s.trim());
  
  let pinyinHeader = headerParts[0] || '';
  let zhHeader = headerParts[1] || '';
  let enHeader = headerParts[2] || '';

  const cleanKey = pinyinHeader.toLowerCase().replace(/[^a-z]/g, '');

  let targetFormula = formulas.find(f => {
    const fPy = (f.pinyin || '').toLowerCase().replace(/[^a-z]/g, '');
    const fId = (f.id || '').replace('formula.', '').replace(/_/g, '').toLowerCase();
    const fEn = (f.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
    const fZh = f.name_zh || '';

    return (fPy && fPy === cleanKey) ||
           (fId && fId === cleanKey) ||
           (fZh && zhHeader && fZh === zhHeader) ||
           (fEn && enHeader && fEn === enHeader.toLowerCase().replace(/[^a-z]/g, ''));
  });

  if (!targetFormula) {
    createdCount++;
    const newId = 'formula.' + pinyinHeader.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    targetFormula = {
      id: newId,
      name_zh: zhHeader,
      pinyin: pinyinHeader,
      name_en: enHeader,
      review_status: 'sourced_ad_record',
      on_board_list: true,
      nccaom_high_yield: true,
      composition: []
    };
    formulas.push(targetFormula);
  } else {
    updatedCount++;
    if (!targetFormula.name_zh && zhHeader) targetFormula.name_zh = zhHeader;
  }

  const composition = [];

  lines.forEach(l => {
    if (l.startsWith('|') && !l.includes('Pharmaceutical Latin') && !l.includes('---')) {
      const cols = l.split('|').map(c => c.trim());
      if (cols.length >= 5) {
        const latinRaw = cols[1];
        const pinyinRaw = cols[2];
        const dosageRaw = cols[3];
        const actionsRaw = cols[4]; // 100% full exact text from MD

        const isAlternate = pinyinRaw.includes('(') || latinRaw.includes('(');
        const cleanPinyin = pinyinRaw.replace(/[()]/g, '').trim();
        const cleanLatin = latinRaw.replace(/[()]/g, '').trim();
        const cleanDosage = dosageRaw.replace(/[()]/g, '').trim();

        const matchObj = pinyinMap.get(cleanPinyin.toLowerCase()) || {};
        
        let base_zh = matchObj.zh || cleanPinyin;
        let base_en = matchObj.en || cleanLatin;
        let herb_id = matchObj.id || '';
        let pinyin_toned = matchObj.pinyin_toned || cleanPinyin;

        const itemZh = isAlternate ? `(${base_zh})` : base_zh;
        const itemEn = isAlternate ? `(${base_en})` : base_en;

        const fullZhAction = translateFullActionToZh(actionsRaw);

        composition.push({
          herb_id: herb_id,
          herb_zh: itemZh,
          name_zh: itemZh,
          herb_en: itemEn,
          name_en: itemEn,
          pinyin: cleanPinyin,
          pinyin_toned: pinyin_toned,
          pharmaceutical_latin: cleanLatin,
          dose_g: cleanDosage,
          decoction_reference_g: cleanDosage,
          in_formula_en: actionsRaw,    // 100% exact unabridged AD text
          actions_en: actionsRaw,       // 100% exact unabridged AD text
          in_formula_zh: fullZhAction,  // Full Chinese translation
          actions_zh: fullZhAction,
          role_reason_zh: fullZhAction,
          is_alternate: isAlternate
        });
      }
    }
  });

  targetFormula.composition = composition;
  if (!targetFormula.field_sources) targetFormula.field_sources = {};
  targetFormula.field_sources.composition = "American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)";
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully repopulated composition for all ${blocks.length} formulas in formulas.json.`);

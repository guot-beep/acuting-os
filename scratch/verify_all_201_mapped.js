const fs = require('fs');

const formulas = JSON.parse(fs.readFileSync('data/herbs/formulas.json', 'utf8')).records;
const adUrls = JSON.parse(fs.readFileSync('scratch/formula_only_ad_urls.json', 'utf8'));

// Exact manual overrides for remaining formulas where spelling/naming differs
const manualOverrides = {
  'formula.zhen_ren_yang_zang_tang': 'Herb%20Formulas%20copy/ZhenRenYangZangTang.html',
  'formula.chai_hu_shu_gan_san': 'Herb%20Formulas%20copy/ChaiHuShuGanTang.html',
  'formula.zhen_gan_xi_feng_tang': 'Herb%20Formulas%20copy/ZhenGan%20Xi%20FengTang.html',
  'formula.bei_mu_gua_lou_san': 'Herb%20Formulas%20copy/BeiMuGuaLouSan.html',
  'formula.gu_chong_tang': 'Herb%20Formulas%20copy/GuChongTang.html',
  'formula.shi_pi_san': 'Herb%20Formulas%20copy/ShiPiYin.html',
  'formula.su_he_xiang_wan': 'Herb%20Formulas%20copy/SuHeXiangWan.html',
  'formula.da_bu_yin_wan': 'Herb%20Formulas%20copy/DaBuYinWan.html',
  'formula.da_jian_zhong_tang': 'Herb%20Formulas%20copy/DaJianZhongTang.html',
  'formula.da_qing_long_tang': 'Herb%20Formulas%20copy/DaQingLongTang.html',
  'formula.dang_gui_shao_yao_san': 'Herb%20Formulas%20copy/DangGuiShaoYaoSan.html',
  'formula.ding_zhi_wan': 'Herb%20Formulas%20copy/DingZhiWan.html',
  'formula.er_zhi_wan': 'Herb%20Formulas%20copy/ErZhiWan.html',
  'formula.fang_feng_tong_sheng_san': 'Herb%20Formulas%20copy/FangFengTongShengSan.html',
  'formula.ge_gen_huang_qin_huang_lian_tang': 'Herb%20Formulas%20copy/GeGenHuangLianHuangQinTang.html',
  'formula.jin_ling_zi_san': 'Herb%20Formulas%20copy/JinLingZiSan.html',
  'formula.liang_fu_wan': 'Herb%20Formulas%20copy/LiangFuWan.html',
  'formula.ling_jiao_gou_teng_yin': 'Herb%20Formulas%20copy/LingJiaoGouTengTang.html',
  'formula.qiang_huo_sheng_shi_tang': 'Herb%20Formulas%20copy/QiangHuoShengShiTang.html',
  'formula.tian_tai_wu_yao_san': 'Herb%20Formulas%20copy/TianTaiWuYaoSan.html'
};

function fullNorm(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function norm(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/tang|wan|san|yin|zi|jian/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const siteMap = [];

formulas.forEach((f, idx) => {
  let matchedUrl = f.american_dragon_url || f.exact_source_url;

  if (manualOverrides[f.id]) {
    matchedUrl = 'https://www.americandragon.com/' + manualOverrides[f.id];
  }

  if (!matchedUrl && f.source_urls && Array.isArray(f.source_urls)) {
    matchedUrl = f.source_urls.find(u => u.includes('americandragon'));
  }

  if (!matchedUrl) {
    const pinyinFull = fullNorm(f.pinyin);
    const pinyinStem = norm(f.pinyin);
    const enFull = fullNorm(f.name_en);

    let match = adUrls.find(u => fullNorm(u.rel).includes(pinyinFull));
    if (!match && pinyinStem.length > 4) {
      match = adUrls.find(u => norm(u.rel).includes(pinyinStem));
    }
    if (!match && enFull.length > 6) {
      match = adUrls.find(u => fullNorm(u.rel).includes(enFull));
    }

    if (match) matchedUrl = match.url;
  }

  siteMap.push({
    index: idx + 1,
    id: f.id,
    name_zh: f.name_zh || '',
    name_en: f.name_en || '',
    pinyin: f.pinyin || '',
    url: matchedUrl || null
  });
});

const matchedCount = siteMap.filter(s => s.url).length;
console.log(`Matched ${matchedCount} / ${formulas.length} site formulas (100% Target)`);

const missing = siteMap.filter(s => !s.url);
if (missing.length > 0) {
  console.log('Still missing:', missing.length);
  missing.forEach(m => console.log(`  ${m.index}. ${m.id} | ${m.pinyin}`));
}

fs.writeFileSync('scratch/mapped_201_site_formulas.json', JSON.stringify(siteMap, null, 2), 'utf8');

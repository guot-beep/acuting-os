/**
 * scratch/check_candidate_curriculum_details.js
 */

const fs = require('fs');
const path = require('path');

const curriculumFiles = [
  path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md'),
  path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md'),
  path.join(__dirname, '../curriculum/formulas/Formulas That Tonify 补益剂.md'),
  path.join(__dirname, '../curriculum/formulas/Formulas That Treat Both Exterior & Interior 表里双解剂.md'),
  path.join(__dirname, '../curriculum/formulas/Dui-Yao-.md')
];

let curriculumText = '';
curriculumFiles.forEach(file => {
  if (fs.existsSync(file)) {
    curriculumText += fs.readFileSync(file, 'utf8') + '\n\n';
  }
});

const candidates = [
  { id: 'formula.yin_qiao_san', name_zh: '銀翹散', search: 'Yin Qiao San' },
  { id: 'formula.sang_ju_yin', name_zh: '桑菊飲', search: 'Sang Ju Yin' },
  { id: 'formula.bai_hu_tang', name_zh: '白虎湯', search: 'Bai Hu Tang' },
  { id: 'formula.huang_lian_jie_du_tang', name_zh: '黃連解毒湯', search: 'Huang Lian Jie Du Tang' },
  { id: 'formula.long_dan_xie_gan_tang', name_zh: '龍膽瀉肝湯', search: 'Long Dan Xie Gan Tang' },
  { id: 'formula.dao_chi_san', name_zh: '導赤散', search: 'Dao Chi San' },
  { id: 'formula.chai_ge_jie_ji_tang', name_zh: '柴葛解肌湯', search: 'Chai Ge Jie Ji Tang' },
  { id: 'formula.ren_shen_bai_du_san', name_zh: '人參敗毒散', search: 'Ren Shen Bai Du San' },
  { id: 'formula.cang_er_zi_san', name_zh: '蒼耳子散', search: 'Cang Er Zi San' },
  { id: 'formula.jiu_wei_qiang_huo_tang', name_zh: '九味羌活湯', search: 'Jiu Wei Qiang Huo Tang' }
];

candidates.forEach(c => {
  const re = new RegExp(c.search, 'i');
  const match = curriculumText.match(re);
  console.log(`\n=================== ${c.id} (${c.name_zh} / ${c.search}) ===================`);
  if (match) {
    const pos = match.index;
    const excerpt = curriculumText.substring(pos, pos + 300).replace(/\n+/g, ' ');
    console.log(`Found in curriculum:\n${excerpt}`);
  } else {
    console.log(`NOT FOUND in curriculum text`);
  }
});

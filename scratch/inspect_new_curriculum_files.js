/**
 * scratch/inspect_new_curriculum_files.js
 * Inspects curriculum/herbs/方剂学汇总_extracted.md and CHM_Formulation_2_course_package_extracted.md
 */

const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '../curriculum/herbs/方剂学汇总_extracted.md');
const file2 = path.join(__dirname, '../curriculum/herbs/CHM_Formulation_2_course_package_extracted.md');

console.log(`File 1 exists: ${fs.existsSync(file1)} (Size: ${fs.statSync(file1).size} bytes)`);
console.log(`File 2 exists: ${fs.existsSync(file2)} (Size: ${fs.statSync(file2).size} bytes)`);

const text1 = fs.readFileSync(file1, 'utf8');
const text2 = fs.readFileSync(file2, 'utf8');

const targets = [
  '銀翹散', 'Yin Qiao San',
  '桑菊飲', 'Sang Ju Yin',
  '白虎湯', 'Bai Hu Tang',
  '黃連解毒湯', 'Huang Lian Jie Du Tang',
  '龍膽瀉肝湯', 'Long Dan Xie Gan Tang',
  '導赤散', 'Dao Chi San',
  '柴葛解肌湯', 'Chai Ge Jie Ji Tang',
  '人參敗毒散', 'Ren Shen Bai Du San',
  '蒼耳子散', 'Cang Er Zi San',
  '九味羌活湯', 'Jiu Wei Qiang Huo Tang'
];

targets.forEach(t => {
  const in1 = text1.includes(t);
  const in2 = text2.includes(t);
  console.log(`Target: ${t.padEnd(25)} -> In 方劑學彙總: ${in1} | In CHM_Formulation_2: ${in2}`);
});

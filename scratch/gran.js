process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
let rows=0,withG=0; const keys=new Set();
for(const x of r) for(const h of x.composition||[]){rows++;
  for(const k of Object.keys(h)) if(/gran|concentr|powder|科學中藥|濃縮/i.test(k)) keys.add(k);
  const g=h.granule_g||h.concentrated_g||h.granule_dose||h.powder_g;
  if(g&&String(g).trim())withG++;}
console.log('組成列數: '+rows+' · 有濃縮藥粉劑量: '+withG);
console.log('相關欄位名: '+([...keys].join(', ')||'(無)'));
// 類方鑑別重複
const dup=r.filter(x=>{const c=(x.comparison_group_members||x.compare_with||[]).map(y=>y.name_zh||y);
 return new Set(c).size!==c.length;});
console.log('類方鑑別成員有重複的方: '+dup.length+(dup.length?' → '+dup.slice(0,5).map(x=>x.name_zh).join('、'):''));

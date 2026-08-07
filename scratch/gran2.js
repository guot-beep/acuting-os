process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
let n=0,ex=[];
for(const x of r) for(const h of x.composition||[]){
  const g=h.granule_reference_g;
  if(g&&String(g).trim()){n++; if(ex.length<4)ex.push(x.name_zh+' '+h.herb_zh+' → '+g);}}
console.log('granule_reference_g 有值: '+n+'/1610');
ex.forEach(e=>console.log('   '+e));

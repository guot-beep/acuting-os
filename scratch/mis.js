process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
let dupInFormula=0,doubleDot=0,ex=[],ex2=[];
for(const x of r){
  const comp=x.composition||[];
  const seen=new Map();
  for(const h of comp){const v=String(h.in_formula_zh||'').trim(); if(!v)continue;
    if(/。。|，。|。，/.test(v)){doubleDot++; if(ex2.length<6)ex2.push(x.name_zh+' '+h.herb_zh+' → '+v.slice(0,40));}
    if(!seen.has(v))seen.set(v,[]); seen.get(v).push(h.herb_zh);}
  for(const [v,hs] of seen) if(hs.length>1){dupInFormula++; if(ex.length<8)ex.push(x.name_zh+'：'+hs.join('／')+' 共用「'+v.slice(0,30)+'」');}
}
console.log('同一方內多味藥共用同一句本方功效: '+dupInFormula+' 組');
ex.forEach(e=>console.log('   '+e));
console.log('\n標點異常（。。 ，。）: '+doubleDot);
ex2.forEach(e=>console.log('   '+e));

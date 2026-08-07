process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const x=r.find(f=>f.name_zh==='人參敗毒散');
for(const k of ['modifications_zh','modifications_en','ad_modifications_en']){
  const v=x[k]; if(!v)continue;
  console.log('### '+k+'  ('+(Array.isArray(v)?v.length:1)+' 條)');
  (Array.isArray(v)?v:[v]).slice(0,14).forEach((s,i)=>console.log('  '+String(i+1).padStart(2)+'. '+JSON.stringify(String(s).slice(0,70))));
}

process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const f=new Map();
for(const x of r) for(const k of ['contraindications_en','cautions_en']){
  const v=x[k]; if(!Array.isArray(v)) continue;
  for(const s of v){ if(typeof s!=='string') continue;
    const m=/^(?:Contraindicated for those with|Use (?:with )?caution for those with|Contraindicated for|Use caution in)\s*(.+?)\.?$/i.exec(s.trim());
    const key=m?m[1]:s.trim().replace(/\.$/,'');
    f.set(key,(f.get(key)||0)+1); }}
const a=[...f.entries()].sort((x,y)=>y[1]-x[1]);
console.log('英文欄位裡的相異片語: '+a.length);
a.slice(0,34).forEach(([s,c])=>console.log('  x'+c+'  '+s.slice(0,66)));

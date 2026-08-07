process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const isPin=s=>/^[A-Z][a-z]+(\s+[A-Z]?[a-zA-Z]+){0,3}$/.test(s.trim())&&!/^\+/.test(s.trim());
const isAdd=s=>/^\+/.test(s.trim());
const isHead=s=>/[:：]\s*$/.test(s.trim());
let formulas=0,pairs=0,heads=0;
for(const x of r){
  for(const k of ['modifications_en','modifications_zh','ad_modifications_en']){
    const v=x[k]; if(!Array.isArray(v))continue;
    let hit=0;
    for(let i=0;i<v.length-1;i++){ if(typeof v[i]!=='string')continue;
      if(isAdd(v[i])&&typeof v[i+1]==='string'&&isPin(v[i+1])){hit++;pairs++;} }
    heads+=v.filter(s=>typeof s==='string'&&isHead(s)).length;
    if(hit)formulas++;
  }}
console.log('「+拉丁名」後接「拼音」被拆成兩行: '+pairs+' 組，涉及 '+formulas+' 個欄位');
console.log('以冒號結尾的標題行: '+heads);

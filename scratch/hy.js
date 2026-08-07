const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const hybrid=[],pureEn=[],pureZh=[];
for(const x of r){
  for(const f of ['contraindications_zh','cautions_zh','pattern_indications_zh','actions_zh','modifications_zh']){
    const v=x[f]; if(!v) continue;
    for(const s of (Array.isArray(v)?v:[v])){ if(typeof s!=='string') continue;
      const zh=(s.match(/[\u4e00-\u9fff]/g)||[]).length, en=(s.match(/[A-Za-z]/g)||[]).length;
      if(zh&&en>=4) hybrid.push([x.name_zh,f,s]);
      else if(!zh&&en) pureEn.push([x.name_zh,f,s]);
      else pureZh.push(1);
    }}}
console.log('中英混雜（中文欄位裡夾英文詞）: '+hybrid.length);
hybrid.slice(0,10).forEach(([n,f,s])=>console.log('   '+n+' ['+f+'] '+s.slice(0,64)));
console.log('\n中文欄位裡整條是英文: '+pureEn.length);
pureEn.slice(0,6).forEach(([n,f,s])=>console.log('   '+n+' ['+f+'] '+s.slice(0,64)));
console.log('\n純中文: '+pureZh.length);

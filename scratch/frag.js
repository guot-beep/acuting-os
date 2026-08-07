const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const frag=new Map();
const add=s=>{const t=s.trim().replace(/\.$/,'');if(t)frag.set(t,(frag.get(t)||0)+1)};
for(const x of r) for(const f of ['contraindications_zh','cautions_zh','pattern_indications_zh','actions_zh','modifications_zh']){
  const v=x[f]; if(!v) continue;
  for(const s of (Array.isArray(v)?v:[v])){ if(typeof s!=='string') continue;
    const zh=(s.match(/[\u4e00-\u9fff]/g)||[]).length, en=(s.match(/[A-Za-z]/g)||[]).length;
    if(!en) continue;
    if(zh){ const m=/^禁用於\s*(.+)$/.exec(s.trim()); if(m) add(m[1]); }
    else add(s);
  }}
const arr=[...frag.entries()].sort((a,b)=>b[1]-a[1]);
console.log('相異英文片語: '+arr.length+' 種 / '+arr.reduce((s,[,c])=>s+c,0)+' 次');
console.log('出現 >=2 次的: '+arr.filter(([,c])=>c>1).length);
console.log('--- 前 40 ---');
arr.slice(0,40).forEach(([s,c])=>console.log('  x'+c+'  '+s));

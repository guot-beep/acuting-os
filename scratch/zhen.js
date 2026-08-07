process.chdir('C:/Projects/acupuncture-point-app');
const {execSync}=require('child_process');const fs=require('fs');
const scan=recs=>{const out=[];for(const x of recs)for(const f of Object.keys(x)){if(!/_en$/.test(f)||!x[f])continue;
 for(const s of (Array.isArray(x[f])?x[f]:[x[f]])) if(typeof s==='string'&&/[\u4e00-\u9fff]/.test(s)) out.push(x.name_zh+' ['+f+'] '+s.slice(0,70));}return out;};
const b=scan(JSON.parse(execSync('git show HEAD:data/herbs/formulas.json',{maxBuffer:5e8}).toString()).records);
const a=scan(JSON.parse(fs.readFileSync('data/herbs/formulas.json','utf8')).records);
const bs=new Set(b);
console.log('新增的中文在_en:');a.filter(x=>!bs.has(x)).forEach(x=>console.log('   '+x));

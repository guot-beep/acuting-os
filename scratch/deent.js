process.chdir('C:/Projects/acupuncture-point-app');
const fs=require('fs');
const F='data/herbs/formulas.json';
const raw=fs.readFileSync(F,'utf8');const doc=JSON.parse(raw);
const MAP={'&quot;':'「','&amp;':'&','&lt;':'<','&gt;':'>','&nbsp;':' '};
let n=0;
/* HTML entities land in the data from scraped pages and render literally on the
   card, because the renderer escapes & — so 「&quot;血塊痛&quot;」 shows the
   entity text itself. Quotation marks become the Chinese pair, not ASCII " ,
   since the surrounding text is Chinese. */
(function w(o){if(Array.isArray(o)){o.forEach((v,i)=>{if(typeof v==='string'){const t=fix(v);if(t!==v){o[i]=t;n++;}}else w(v);});}
 else if(o&&typeof o==='object'){for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'){const t=fix(v);if(t!==v){o[k]=t;n++;}}else w(v);}}})(doc.records);
function fix(s){let t=s;let open=true;
  t=t.replace(/&quot;/g,()=>{const c=open?'「':'」';open=!open;return c;});
  for(const [e,c] of Object.entries(MAP)) if(e!=='&quot;') t=t.split(e).join(c);
  return t;}
if(n){const ind=(/\n(\x20+)\S/.exec(raw)||[])[1]?.length??2;fs.writeFileSync(F,JSON.stringify(doc,null,ind)+'\n');}
console.log('HTML 實體修正: '+n+' 個字串');

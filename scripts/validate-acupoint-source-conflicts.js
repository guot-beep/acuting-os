#!/usr/bin/env node
/**
 * validate-acupoint-source-conflicts.js — APB-2 / APB-4
 *
 * 361 經穴的中文與英文針法來自兩份來源,從未對帳。渲染層已經在衝突時抑制數字
 * (commit 980d9ef7,docs/TING_DECISION_QUEUE.md §E5),但那是止血:資料本身
 * 還是矛盾的,而且沒有任何東西擋住「再多加幾筆矛盾」。這支就是那個擋。
 *
 * 判定與 app.js 的 needlingDepthConflict() 必須同義 —— 兩邊分開實作是刻意的:
 * 驗證器讀 data/,渲染器讀 adapter 之後的物件。若兩邊數字對不上,先查 adapter。
 *
 * 四個述詞:
 *   APB-2  中文明文禁灸(不宜運用灸法/禁灸/不可灸),而英文寫 Moxibustion applicable
 *   APB-4a 中文卡自相矛盾:針法欄寫「直刺 N 寸」,自己的禁忌欄寫「嚴禁直刺」
 *   APB-4b 中文禁直刺,英文的「指示句」(CAUTION 之前)寫 perpendicular
 *   APB-4c 英文深度 > 中文深度,且本穴文字提到肺/氣胸/動脈/眼眶/脊髓等器官
 *
 * 分級:今天全部是 NOTE。畢業條件寫在這裡,不要憑感覺改:
 *   某述詞的計數降到 0 之後,把它加進 BLOCKING,讓它永遠回不去。
 *   在降到 0 之前把它設成 blocking 只會逼人為了綠燈去刪內容 —— 那是反方向。
 *
 * 反例(已踩過,不要再退回去):
 *   - /perpendicular/i 掃整段英文會掃到英文警告句本身,把警告讀成許可。
 *   - GB29–GB43 的禁忌欄有整條經共用的條件句「胸背部穴位…嚴禁直刺過深」,
 *     那句講的不是丘墟、俠溪。先剔除條件句再判斷。
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "acupoints", "361.json");
const BLOCKING = new Set([]); // 見檔頭畢業條件

// 棘輪基線(SOL 2026-08-12 建議):NOTE 級不擋 CI,等於「歷史積欠可以留著,
// 但不准再長」。這一行才是真正的擋 —— 沒有它,NOTE 只是把問題寫下來而已。
// 數字只能往下改,而且要在同一個 commit 裡說明是哪幾筆修掉了。
const BASELINE = { "APB-2": 21, "APB-4a": 4, "APB-4b": 1, "APB-4c": 14 };

const records = JSON.parse(fs.readFileSync(FILE, "utf8").replace(/^﻿/, ""));
const list = Array.isArray(records) ? records : records.records || [];

const asText = (v) =>
  Array.isArray(v) ? v.filter(Boolean).join(" ") : typeof v === "string" ? v : v ? JSON.stringify(v) : "";

// 剔除以「胸背部穴位」為主詞的條件句 —— 它描述的是別的穴。
const dropScoped = (s) => s.split(/[。\n]/).filter((t) => !/胸背部穴位|背部穴位/.test(t)).join("。");

const maxCun = (s) => {
  const out = [];
  const re = /(\d+(?:\.\d+)?)\s*[–\-~至]\s*(\d+(?:\.\d+)?)\s*(?:cun|寸|吋)/gi;
  let m;
  while ((m = re.exec(s))) out.push(parseFloat(m[2]));
  if (!out.length) {
    const one = /(\d+(?:\.\d+)?)\s*(?:cun|寸|吋)/gi;
    let s1;
    while ((s1 = one.exec(s))) out.push(parseFloat(s1[1]));
  }
  return out.length ? Math.max(...out) : null;
};

const HAZARD_ZH = /氣胸|傷及肺|肺臟|內臟|心臟|肝脾|大血管|動脈|眼球|眶|延髓|脊髓|胸腔|腹腔/;
const HAZARD_EN = /pneumothorax|lung|pleura|artery|eyeball|orbit|spinal cord|medulla|cardiac|heart|viscera/i;
const NO_PERP = /嚴禁直刺|不可直刺|禁直刺|不宜直刺|僅可斜刺|只可斜刺/;

const findings = { "APB-2": [], "APB-4a": [], "APB-4b": [], "APB-4c": [] };

for (const r of list) {
  const code = r.code || r.id || "?";
  const label = `${code}${r.chinese || ""}`;
  const own = dropScoped([asText(r.needling), asText(r.acumethod_zh)].filter(Boolean).join(" "));
  const zh = dropScoped(
    // 三個禁忌欄都要讀,與 adapt361Record 一致:BL13 肺俞的「斜刺 0.5-0.8 寸」
    // 就住在 record.cautions 裡,漏掉它會把一張其實一致的卡算成衝突。
    [asText(r.needling), asText(r.acumethod_zh), asText(r.contraindications), asText(r.cautions_zh), asText(r.cautions)]
      .filter(Boolean)
      .join(" ")
  );
  const en = asText(r.acumethod_en);

  const moxaZh = asText(r.moxibustion_zh || r.moxa_zh || r.moxibustion).trim();
  const moxaEn = asText(r.moxibustion_en || r.moxa_en);
  if (/^(不宜運用灸法|禁灸|不可灸|不宜灸)/.test(moxaZh) && /moxibustion applicable/i.test(moxaEn)) {
    findings["APB-2"].push(label);
  }

  if (!en) continue;
  const forbidsPerp = NO_PERP.test(zh);
  const hazard = HAZARD_ZH.test(zh) || HAZARD_EN.test(en);

  if (forbidsPerp && /直刺\s*\d/.test(own)) findings["APB-4a"].push(label);
  else if (forbidsPerp && /perpendicular/i.test(en.split(/CAUTION|⚠|Contraindicat/i)[0])) findings["APB-4b"].push(label);
  else {
    const zhMax = maxCun(zh);
    const enMax = maxCun(en);
    if (zhMax != null && enMax != null && enMax > zhMax + 0.05 && hazard) findings["APB-4c"].push(label);
  }
}

const DESC = {
  "APB-2": "中文禁灸而英文寫 Moxibustion applicable",
  "APB-4a": "中文卡自相矛盾:針法寫直刺,自己的禁忌欄寫嚴禁直刺",
  "APB-4b": "中文禁直刺而英文指示 perpendicular",
  "APB-4c": "英文深度較深,且本穴涉及肺/動脈/眼眶等器官",
};

const worklist = process.argv.includes("--worklist");
let blocking = 0;
const grew = [];
console.log(`acupoint source conflicts — ${list.length} 穴\n`);
for (const key of Object.keys(findings)) {
  const hits = findings[key];
  const tier = BLOCKING.has(key) ? "BLOCK" : "NOTE ";
  if (BLOCKING.has(key)) blocking += hits.length;
  const base = BASELINE[key];
  let mark = "";
  if (base != null) {
    if (hits.length > base) { grew.push(`${key}: ${base} → ${hits.length}`); mark = `  ⛔ 超過基線 ${base}`; }
    else if (hits.length < base) mark = `  ✅ 低於基線 ${base}（請一併調降 BASELINE）`;
  }
  console.log(`  ${tier} ${key.padEnd(7)} ${String(hits.length).padStart(3)}  ${DESC[key]}${mark}`);
  if (worklist && hits.length) console.log(`         ${hits.join(" ")}`);
}
if (grew.length) {
  blocking += grew.length;
  console.log(`\n⛔ 衝突數增加了 —— 新增或改動的卡引入了新的來源衝突:`);
  for (const g of grew) console.log(`   ${g}`);
  console.log(`   修掉它,或在同一個 commit 裡說明為什麼基線該往上（預設不該）。`);
}
console.log(
  worklist ? "" : "\n提示:加 --worklist 列出每一個穴位。畢業條件見檔頭 —— 計數歸零才升為 blocking。"
);
console.log(blocking ? `\nFAIL — ${blocking} blocking defects.` : "\nPASS — no blocking defects.");
process.exit(blocking ? 1 : 0);

#!/usr/bin/env node
/**
 * report-herb-caution-conflicts.js — cautions_zh 自我矛盾普查(2026-08-14)
 *
 * 起因:HB-B5~B10 雙語補完後,`cautions_en` 還剩 17 筆補不了。Fable 停手是對的
 * (fail-closed),但停手的理由被寫成「等 Ting 裁定」。逐筆讀過之後,那個定位
 * 不對 —— 這些不是「兩種臨床觀點打架、需要人來選」,絕大多數是**可查證的
 * 事實錯誤**:藥性寒熱與同一筆記錄自己的 properties_taste_temp 相反、解釋段
 * 講的是另一味藥、或根本是亂碼。事實錯誤不該送到裁定桌上。
 *
 * 更要緊的是範圍。17 筆全部來自 `safety_source: cloudtcm_caution_field`,
 * 而全庫有 197 筆共用那個來源 —— 也就是說 17 不是一個藥物學上的類別,
 * 是「雙語補完這條線剛好讀到」的那些。剩下的沒人讀過。
 *
 * 所以這支不去判斷「哪個說法對」(那要查本草原典,是 SOL research staging
 * 的工作),只做一件機器做得到的事:**把記錄自己打自己臉的地方數出來**。
 * 三個判準,各自獨立:
 *
 *   T  溫度倒置 —— cautions_zh 內文宣稱的寒/熱,與本記錄 properties_taste_temp
 *      的寒/熱**符號相反**。只抓符號相反(寒 vs 溫),不抓程度差異
 *      (微寒 vs 寒),因為程度差異在本草之間本來就有分歧。
 *   S  自我矛盾 —— 同一筆 cautions_zh 內同時宣稱偏寒與偏溫。
 *   X  跨藥污染 —— 解釋段裡另一味藥的藥名出現次數 **多於** 本藥自己的藥名。
 *      「忌與乾漆同用」這種正當的配伍禁忌不會觸發(乾漆只出現一次,
 *      而本藥名通常出現多次);「川貝母性涼…川貝母具有…」會觸發。
 *
 * 這支永遠 exit 0。它是一張清單,不是 gate —— 現在把它接成 blocking 只會
 * 為了沒人被指派修的 backlog 讓 build 變紅。畢業條件:數字歸零後加 --blocking。
 *
 * 用法:node scripts/report-herb-caution-conflicts.js [--json]
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8"));
const RECORDS = Array.isArray(raw) ? raw : raw.records || raw.herbs || [];

/* 溫度尺。只有符號有意義(見檔頭 T 的說明),數值是為了比較方向。 */
const TEMP_SCALE = [
  [/大熱/, 2], [/大寒/, -2],
  [/微寒/, -1], [/微溫/, 1], [/微涼/, -1],
  [/寒涼/, -1], [/涼/, -1], [/寒/, -1],
  [/熱/, 2], [/溫/, 1],
  [/平/, 0],
];

function tempOf(text) {
  const s = String(text || "");
  for (const [re, v] of TEMP_SCALE) if (re.test(s)) return v;
  return null;
}

/* properties_taste_temp 是「甘、辛、苦、平、無毒」這種頓號串,也可能是英文
 * 草稿(「Draft: acrid/bitter/warm…」)。英文草稿本身就還沒定案,不拿它當基準。 */
function declaredTemp(rec) {
  const p = String(rec.properties_taste_temp || "");
  if (!p || /^Draft:/i.test(p)) return null;
  const parts = p.split(/[、,,/]/).map((x) => x.trim()).filter(Boolean);
  const temps = parts.map(tempOf).filter((v) => v !== null);
  if (!temps.length) return null;
  // 同一筆列了多個溫度(三棱:「溫、甘、辛、苦、澀、無毒、涼、平」)本身就是
  // 未收斂的資料 —— 回 null 而不是挑一個,挑就是替資料做決定。
  const signs = new Set(temps.map((t) => Math.sign(t)));
  return signs.size === 1 ? temps[0] : null;
}

/* cautions_zh 內文對「本藥」藥性的宣稱。
 *
 * 主詞一定要抓出來比對,這是第一版踩到的坑:瓜蔞的內文寫「瓜蔞性寒滑,
 * 幹薑性溫熱,兩藥相配會抵消功效」—— 那個「溫熱」是**乾薑**的,不是瓜蔞的。
 * 不看主詞就把它算成「瓜蔞宣稱性溫」,於是一筆寫得完全正確的配伍說明被
 * 報成溫度倒置。報告一旦有這種雜訊,讀的人就會開始整批略過。
 *
 * 所以只收主詞確定是本藥的宣稱:藥名(或別名、或本藥名為前綴的寫法,
 * 佛手→佛手柑)、或「本品/該藥/此藥」。抓不到主詞就不算 —— 寧可少報。
 * 也不抓「脾胃虛寒者」「虛寒作泄」:那是在講**病人**體質,不是藥性。 */
const CLAIM_RE = /([一-鿿]{2,5}|本品|該藥|此藥)(?:藥)?性(?:質)?(?:偏)?([寒涼溫熱平][寒涼溫熱]?)/g;
const SELF_PRONOUNS = new Set(["本品", "該藥", "此藥"]);

function claimedTemps(rec) {
  const aliases = [String(rec.name_zh || ""), ...(Array.isArray(rec.aliases_zh) ? rec.aliases_zh.map(String) : [])].filter(Boolean);
  const isSelf = (subj) =>
    SELF_PRONOUNS.has(subj) || aliases.some((a) => subj === a || subj.startsWith(a) || a.startsWith(subj));
  const out = [];
  for (const line of rec.cautions_zh || []) {
    CLAIM_RE.lastIndex = 0;
    let m;
    while ((m = CLAIM_RE.exec(String(line))) !== null) {
      const subj = m[1];
      const v = tempOf(m[2]);
      if (v === null || !isSelf(subj)) continue;
      out.push({ v, subject: subj, snippet: String(line).slice(Math.max(0, m.index - 6), m.index + 18) });
    }
  }
  return out;
}

const NAMES = RECORDS.map((r) => String(r.name_zh || "")).filter((n) => n.length >= 2);

function crossHerb(rec) {
  const text = (rec.cautions_zh || []).join("\n");
  const self = String(rec.name_zh || "");
  if (!self) return null;
  /* 別名要放行,否則同一味藥的另一個名字會被判成別的藥:烏賊骨的內文通篇
   * 寫「海螵蛸」是正確的(同物異名),水牛角提「犀角」是法定代用關係。
   * 不放行的話這支報出來的十筆有一半是雜訊,而報告一旦有雜訊就沒人看。 */
  const aliases = new Set([self, ...(Array.isArray(rec.aliases_zh) ? rec.aliases_zh.map(String) : [])].filter(Boolean));
  const count = (needle) => (needle ? text.split(needle).length - 1 : 0);
  const selfN = Math.max(...[...aliases].map(count));
  let worst = null;
  for (const other of NAMES) {
    if (aliases.has(other)) continue;
    // 本藥名是別藥名的子字串時會互相干擾(浙貝母 ⊃ 貝母),跳過包含關係。
    if ([...aliases].some((a) => a.includes(other) || other.includes(a))) continue;
    const n = count(other);
    if (n > selfN && n >= 2 && (!worst || n > worst.n)) worst = { other, n, selfN };
  }
  return worst;
}

const T = [], S = [], X = [], XW = [];

for (const rec of RECORDS) {
  const cautions = rec.cautions_zh;
  if (!Array.isArray(cautions) || !cautions.length) continue;

  const claims = claimedTemps(rec);
  const decl = declaredTemp(rec);

  if (decl !== null && Math.sign(decl) !== 0) {
    for (const c of claims) {
      if (Math.sign(c.v) !== 0 && Math.sign(c.v) !== Math.sign(decl)) {
        T.push({ id: rec.id, name: rec.name_zh, declared: rec.properties_taste_temp, claim: c.snippet.trim() });
        break;
      }
    }
  }

  const signs = new Set(claims.map((c) => Math.sign(c.v)).filter((s) => s !== 0));
  if (signs.size > 1) {
    S.push({ id: rec.id, name: rec.name_zh, claims: claims.map((c) => c.snippet.trim()) });
  }

  /* 跨藥污染分兩級,而且必須分 —— 第一版把九筆全報成污染,實際讀過之後
   * 只有三筆是。代赭石「畏附子:《日華子本草》記載」是有出處的配伍禁忌;
   * 制草烏提甘草是炮製解毒;龍齒那筆更是反例中的反例,它明寫「龍骨的禁忌
   * 屬龍骨,未搬入」—— 寫得最謹慎的一筆被判成污染。
   *   X  強訊號:整篇**一次都沒提到本藥自己**,卻反覆講另一味藥。
   *   XW 弱訊號:本藥有出現,只是他藥出現更多。多半是引文或配伍,需人眼。 */
  const x = crossHerb(rec);
  if (x) {
    const row = { id: rec.id, name: rec.name_zh, other: x.other, otherCount: x.n, selfCount: x.selfN };
    (x.selfN === 0 && x.n >= 4 ? X : XW).push(row);
  }
}

const bySource = {};
for (const r of RECORDS) {
  if (!Array.isArray(r.cautions_zh) || !r.cautions_zh.length) continue;
  const s = r.safety_source || "(none)";
  bySource[s] = (bySource[s] || 0) + 1;
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ T, S, X, XW, bySource }, null, 2));
  process.exit(0);
}

console.log("herb cautions_zh 自我矛盾普查\n");
console.log(`  記錄總數                      ${RECORDS.length}`);
console.log(`  有 cautions_zh 的記錄          ${RECORDS.filter((r) => Array.isArray(r.cautions_zh) && r.cautions_zh.length).length}`);
console.log(`  T  溫度倒置(與本記錄性味相反)      ${T.length}`);
console.log(`  S  自我矛盾(同筆內寒溫並陳)        ${S.length}`);
console.log(`  X  跨藥污染(整篇未提本藥)          ${X.length}`);
console.log(`  T/S/X 去重後(可機器斷定)          ${new Set([...T, ...S, ...X].map((r) => r.id)).size}`);
console.log(`  XW 需人眼(他藥較多,多為引文配伍)  ${XW.length}`);

console.log("\n  cautions_zh 的來源分佈:");
for (const [k, v] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(v).padStart(4)}  ${k}`);
}

const show = (label, rows, fmt) => {
  console.log(`\n— ${label} (${rows.length}) —`);
  rows.forEach((r) => console.log(`  ${r.id.padEnd(22)} ${String(r.name).padEnd(5)} ${fmt(r)}`));
};
show("T 溫度倒置", T, (r) => `性味「${r.declared}」 ↔ 內文「…${r.claim}…」`);
show("S 自我矛盾", S, (r) => r.claims.map((c) => `「…${c}…」`).join("  vs  "));
show("X 跨藥污染(整篇未提本藥)", X, (r) => `內文提「${r.other}」${r.otherCount} 次,提本藥 0 次`);
show("XW 需人眼(不當作缺陷計數)", XW, (r) => `內文提「${r.other}」${r.otherCount} 次,提本藥「${r.name}」${r.selfCount} 次`);

console.log("\n本報告只指出「記錄自己打自己臉」的地方,不判斷哪個說法對 ——");
console.log("那要回查本草原典與藥典,是 SOL research staging 的工作。");
console.log("清單與逐筆查證要求:docs/research_packs/HERB_CAUTION_SOURCE_VERIFICATION_SOL.md");

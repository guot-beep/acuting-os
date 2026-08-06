// 錯層搬移 批次2:甘麥大棗湯 · 小承氣湯 · 調胃承氣湯。
//
// 三首共同的病:CloudTCM 全文住在 actions_zh(部分同時複製到 pattern_indications_zh),
// 而 actions_en/pattern_indications_en 是「Action: 」/「Indication: 」+ 同一句中文的
// 假英文。搬移規則同四物湯(scripts/curate-si-wu-tang-move.js):
//   1. 每一條中文原文必須逐字存活在搬移後的記錄裡,少一條就拒寫。
//   2. 假英文在替換前逐條驗證「= 前綴 + 對應中文」,不是就拒寫 —— 確保刪掉的
//      只是重複,不是內容。真英文由課件(甘麥大棗:表350)或 AD harvest 補上。
//   3. 只在空欄填 in_formula_zh;既有值不碰。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const MOVED = (id) => `CloudTCM 方劑頁——原存於 actions_zh/pattern_indications_zh,2026-08-06 錯層搬移歸位(scripts/curate-misfile-move-batch2.js)`;
const AD_NOTE = "American Dragon formula page (harvested 2026-08)";
const COURSE_350 = "curriculum/herbs/方剂学汇总_extracted.md#Table350";

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const getRec = (id) => doc.records.find((x) => x.id === id);
const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const cdtOf = (r) => (r.chinese_depth_track = r.chinese_depth_track || {});
const appendPara = (obj, key, lines) => {
  if (!lines.length) return;
  obj[key] = [typeof obj[key] === "string" ? obj[key] : "", lines.join("\n")].filter(Boolean).join("\n");
};
// 假英文驗證:每條 en 必須等於 prefix + 對應 zh(允許 en 較多尾字,CloudTCM 匯入
// 曾把中文截斷後放進 zh、完整版放進 en —— 用 startsWith 檢查)。
const assertFakeEn = (id, en, zhArr, prefix) => {
  if (!Array.isArray(en)) return;
  if (en.length !== zhArr.length) die(`${id} en ${en.length} 條 vs zh ${zhArr.length} 條 — 假英文前提不成立`);
  en.forEach((e, i) => {
    if (!String(e).startsWith(prefix + zhArr[i].slice(0, 20))) die(`${id} en[${i}] 不是「${prefix}」+ 中文 — 不是假英文,不可替換`);
  });
};
// 搬移後總 assert:原文一條不少。
const assertSurvival = (id, r, originals) => {
  const after = JSON.stringify(r);
  const lost = originals.filter((s) => s !== "-" && !after.includes(JSON.stringify(s).slice(1, -1)));
  if (lost.length) die(`${id} 搬移後遺失 ${lost.length} 條:\n  ` + lost.map((s) => s.slice(0, 40)).join("\n  "));
};
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));

// ── 甘麥大棗湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.gan_mai_da_zao_tang";
  const r = getRec(id);
  const A = r.actions_zh;
  if (!Array.isArray(A) || A.length !== 25) die(`${id} actions_zh 不是 25 條`);
  if (JSON.stringify(r.pattern_indications_zh) !== JSON.stringify(A)) die(`${id} 兩欄不是同一份`);
  if (!A[0].startsWith("此方只有3味中藥") || !A[15].startsWith("關於甘麥大棗湯的治療原理") || !A[24].startsWith("現代臨床上"))
    die(`${id} 錨點不符 — 順序已變`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, A, "Indication: ");

  const pick = (...idx) => idx.map((i) => A[i]);
  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", pick(0, 1, 2, 3, 4, 5, 6));
  appendPara(cdt, "notes_zh", pick(7, 8, 9, 10, 11, 12, 13, 14, 23));
  appendPara(cdt, "fang_yi_zh", pick(15, 16, 17, 18, 19, 20, 21, 22));
  r.applications_zh = pick(24);

  r.actions_zh = ["養心", "安神", "和中"];
  r.actions_en = ["Nourishes HT", "Calms Spirit", "Harmonizes Middle jiao"];
  r.pattern_indications_zh = ["臟躁——精神恍惚,悲傷欲哭,不能自主,睡眠不安,呵欠頻作,甚則言行失常"];
  r.pattern_indications_en = ["Restless organ disorder (Zang Zao 臟躁): disorientation, frequent attacks of melancholy and crying spells, inability to control oneself, restless sleep, frequent bouts of yawning, abnormal behavior and speech"];

  r.field_sources = r.field_sources || {};
  for (const f of ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.notes_zh", "chinese_depth_track.fang_yi_zh", "applications_zh"])
    r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), MOVED(id)])];
  r.field_sources.actions_en = [COURSE_350 + "(Actions 行逐字)"];
  r.field_sources.pattern_indications_en = [COURSE_350 + "(Indications 行逐字)"];
  assertSurvival(id, r, A);
  console.log("✓ 甘麥大棗湯  25 條歸位:主治7 筆記9 方義8 應用1;中英 3/3+1/1 對齊(課件表350)");
}

// ── 小承氣湯 ─────────────────────────────────────────────────────────────────
{
  const id = "formula.xiao_cheng_qi_tang";
  const r = getRec(id);
  const A = r.actions_zh;
  if (!Array.isArray(A) || A.length !== 34) die(`${id} actions_zh 不是 34 條`);
  if (JSON.stringify(r.pattern_indications_zh) !== JSON.stringify(A)) die(`${id} 兩欄不是同一份`);
  if (!A[0].startsWith("大便不通") || !A[22].startsWith("小承氣湯的組方思路") || !A[31].startsWith("近年來由於「腦腸軸」"))
    die(`${id} 錨點不符 — 順序已變`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, A, "Indication: ");

  const pick = (...idx) => idx.map((i) => A[i]);
  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", pick(7, 8, 10));
  appendPara(cdt, "notes_zh", pick(11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 28, 30, 32));
  appendPara(cdt, "fang_yi_zh", pick(22, 23, 24, 25, 26, 27, 29));
  r.applications_zh = pick(31);
  r.modern_research_zh = [...(Array.isArray(r.modern_research_zh) ? r.modern_research_zh : []), A[33]];

  r.pattern_indications_zh = pick(9, 0, 1, 2, 3, 4, 5, 6);
  r.pattern_indications_en = ["Relatively mild Colon Excess Heat", "Relatively mild Yang Ming Fu", "Wen Bing Qi Stage Intestinal Dry Heat", "Early-stage dysentery"];
  r.actions_zh = ["輕下熱結", "行氣導滯"];
  r.actions_en = ["Moderately purges Heat accumulation", "Normalizes the flow of Qi at the center"];

  r.field_sources = r.field_sources || {};
  for (const f of ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.notes_zh", "chinese_depth_track.fang_yi_zh", "applications_zh", "modern_research_zh"])
    r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), MOVED(id)])];
  r.field_sources.actions_en = [AD_NOTE];
  r.field_sources.pattern_indications_en = [AD_NOTE + " — zh 為古籍條文(CloudTCM),en 為 AD 證型,兩源並記非逐條對譯"];
  assertSurvival(id, r, A);
  console.log("✓ 小承氣湯    34 條歸位:主治8 病機3 筆記14 方義7 應用1 藥理1;actions 2/2 對齊(AD)");
}

// ── 調胃承氣湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.tiao_wei_cheng_qi_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 33) die(`${id} actions_zh 不是 33 條`);
  if (!Array.isArray(P) || P.length !== 8) die(`${id} pattern_indications_zh 不是 8 條`);
  if (!A[0].startsWith("陽明腑實") || A[8] !== "方劑組成及藥理" || !A[32].startsWith("註：") || P[5] !== "治療原理")
    die(`${id} 錨點不符 — 順序已變`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  // 方義依原文閱讀順序:ind5-7(治療原理/清熱瀉下)→ act4-7(芒硝/調和胃氣/甘草/綜合)
  appendPara(cdt, "fang_yi_zh", [P[5], P[6], P[7], A[4], A[5], A[6], A[7]]);
  // 壓平的「方劑組成及藥理」表(A8-19)整塊保留為原典用量筆記
  appendPara(cdt, "notes_zh", [A.slice(8, 20).join(" | ")]);
  // 逐味「本方功效」救進 composition(只填空欄)
  const inf = { "甘草": A[13], "大黃": A[16], "芒硝": A[19] };
  for (const c of r.composition || []) {
    if (inf[c.herb_zh] && !String(c.in_formula_zh || "").trim()) c.in_formula_zh = inf[c.herb_zh];
  }
  // 加減藥(桂枝/桃仁/黃連/犀角):名稱行+功效行合併;「-」是表格填充符,不保留
  r.modifications_zh = [
    `${A[20]}：${A[22]}`,
    `${A[23]}：${A[25]}`,
    `${A[26]}：${A[28]}`,
    `${A[29]}：${A[31]}`,
    A[32],
  ];
  r.pattern_indications_zh = [A[0], A[1], A[2], A[3], P[0], P[1], P[2], P[3], P[4]];
  r.pattern_indications_en = ["Stomach Excess Heat", "Colon Excess Heat", "Yang Ming Fu", "Wen Bing Qi Stage Intestinal Dry Heat"];
  r.actions_zh = ["緩下熱結"];
  r.actions_en = ["Mildly purges Heat accumulation"];

  r.field_sources = r.field_sources || {};
  for (const f of ["chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "modifications_zh"])
    r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), MOVED(id)])];
  r.field_sources.composition = [...new Set([...(r.field_sources.composition || []), MOVED(id) + " — in_formula_zh 自壓平表格救回"])];
  r.field_sources.actions_en = [AD_NOTE];
  r.field_sources.pattern_indications_en = [AD_NOTE + " — zh 為古籍條文(CloudTCM),en 為 AD 證型,兩源並記非逐條對譯"];
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 調胃承氣湯  33+8 條歸位:主治9 方義7 加減5 原典用量1塊 in_formula_zh×3;actions 1/1 對齊(AD)");
}

// §0 guard:被搬移的兩欄之外,任何欄位變短或消失 → 整批拒寫。
const MOVED_FIELDS = new Set(["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en", "modifications_zh", "field_sources", "composition", "applications_zh", "modern_research_zh", "chinese_depth_track"]);
const TOUCHED = new Set(["formula.gan_mai_da_zao_tang", "formula.xiao_cheng_qi_tang", "formula.tiao_wei_cheng_qi_tang"]);
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (TOUCHED.has(r.id) && MOVED_FIELDS.has(k)) continue;
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
  if (!TOUCHED.has(r.id) && JSON.stringify(r) !== before.get(r.id)) problems.push(`${r.id} 不在批次卻被改動`);
}
if (problems.length) die(problems.join("\n  "));

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log("\n批次2完成,§0 guard 通過");

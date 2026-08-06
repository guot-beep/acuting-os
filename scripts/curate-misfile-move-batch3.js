// 錯層搬移 批次3:大承氣湯 · 麻杏石甘湯 · 酸棗仁湯。
// 紀律同批次2(scripts/curate-misfile-move-batch2.js):原文逐字存活 assert、
// 假英文逐條驗證後才替換、真英文來自 AD harvest、兩源並記時標明。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const MOVED = "CloudTCM 方劑頁——原存於 actions_zh/pattern_indications_zh,2026-08-06 錯層搬移歸位(scripts/curate-misfile-move-batch3.js)";
const AD_NOTE = "American Dragon formula page (harvested 2026-08)";

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
const assertFakeEn = (id, en, zhArr, prefix) => {
  if (!Array.isArray(en)) return;
  if (en.length !== zhArr.length) die(`${id} en ${en.length} vs zh ${zhArr.length} — 假英文前提不成立`);
  en.forEach((e, i) => {
    if (!String(e).startsWith(prefix + zhArr[i].slice(0, 20))) die(`${id} en[${i}] 不是假英文,不可替換`);
  });
};
const assertSurvival = (id, r, originals) => {
  const after = JSON.stringify(r);
  const lost = originals.filter((s) => !after.includes(JSON.stringify(s).slice(1, -1)));
  if (lost.length) die(`${id} 遺失 ${lost.length} 條:\n  ` + lost.map((s) => s.slice(0, 40)).join("\n  "));
};
const srcNote = (r, fields, note) => {
  r.field_sources = r.field_sources || {};
  for (const f of fields) r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), note])];
};
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));

// ── 大承氣湯 ─────────────────────────────────────────────────────────────────
{
  const id = "formula.da_cheng_qi_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 2 || !Array.isArray(P) || P.length !== 32) die(`${id} 條數不符`);
  if (!A[0].startsWith("所謂的「陽明腑實證」") || P[0] !== "痞：指患者自覺胸腹部有悶塞和壓迫感。" || !P[14].startsWith("大承氣湯的組成") || !P[31].startsWith("大承氣湯常用於"))
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [P[5], P[6], P[7], P[8], P[9], P[10], P[11], P[12], P[13]]);
  appendPara(cdt, "fang_yi_zh", [P[14], P[15], P[16], P[17], P[18], P[19]]);
  appendPara(cdt, "notes_zh", [P[20], P[21], P[22], P[23], P[24], P[25], P[26], P[27], P[28], P[29], P[30]]);
  r.applications_zh = [P[31]];
  r.pattern_indications_zh = [A[0], A[1], P[0], P[1], P[2], P[3], P[4]];
  r.pattern_indications_en = ["Colon Excess Heat", "Intestinal Abscess", "Yang Ming Fu", "Wen Bing Qi Stage - Intestinal Dry Heat", "Syncope and seizures (closed type Wind-Stroke or Heat Collapse)", "San Jiao - Large Intestine Damp-Heat", "Internal Blood Stasis with spasms"];
  r.actions_zh = ["峻下熱結"];
  r.actions_en = ["Strongly purges Heat Accumulation"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], AD_NOTE + " — zh 為 CloudTCM 條文,en 為 AD 證型,兩源並記非逐條對譯");
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 大承氣湯    2+32 條歸位:主治7 病機9 方義6 筆記11 應用1;actions 1/1(AD)");
}

// ── 麻杏石甘湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.ma_xing_shi_gan_tang";
  const r = getRec(id);
  const A = r.actions_zh;
  if (!Array.isArray(A) || A.length !== 23) die(`${id} actions_zh 不是 23 條`);
  if (!A[0].startsWith("麻黃，主要作用於肺經") || A[17] !== "現代上半身高機率化熱" || !A[20].startsWith("近代中醫臨床") || !A[22].startsWith("加減法："))
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  // pattern_indications_zh 的 8 條是真的主治條文,不搬;只有英文是假的
  assertFakeEn(id, r.pattern_indications_en, r.pattern_indications_zh, "Indication: ");

  const cdt = cdtOf(r);
  appendPara(cdt, "fang_yi_zh", A.slice(0, 17));
  appendPara(cdt, "notes_zh", [A[17], A[18], A[19]]);
  r.applications_zh = [A[20], A[21]];
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), A[22]];
  r.actions_zh = ["疏散風熱", "平喘", "清肺", "降氣"];
  r.actions_en = ["Disperses Wind-Heat", "Stops Asthma", "Clears the Lungs", "Descends Qi"];
  r.pattern_indications_en = ["Wind-Heat Attacks the Lungs", "Wind-Cold Transformed into Heat", "Wen Bing - Qi Stage Lung Heat"];
  srcNote(r, ["chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh", "modifications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], AD_NOTE + " — zh 為 CloudTCM 條文,en 為 AD 證型,兩源並記非逐條對譯");
  assertSurvival(id, r, A);
  console.log("✓ 麻杏石甘湯  23 條歸位:方義17 筆記3 應用2 加減1;actions 4/4 對齊(AD)");
}

// ── 酸棗仁湯 ─────────────────────────────────────────────────────────────────
{
  const id = "formula.suan_zao_ren_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 1 || !Array.isArray(P) || P.length !== 21) die(`${id} 條數不符`);
  if (!A[0].startsWith("酸棗仁湯主要功用") || !P[1].startsWith("酸棗仁湯所治的主要是") || !P[10].startsWith("《黃帝內經.素問》提到：「肝者") || !P[20].startsWith("酸棗仁湯現代運用"))
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [A[0], P[0], P[2], P[3], P[4], P[5], P[6], P[7], P[8], P[9]]);
  appendPara(cdt, "fang_yi_zh", [P[10], P[11], P[12], P[13], P[14], P[15]]);
  appendPara(cdt, "notes_zh", [P[16], P[17]]);
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), P[18], P[19]];
  r.applications_zh = [P[20]];
  r.pattern_indications_zh = [P[1], "虛勞虛煩不眠,心悸不安,盜汗,頭暈目眩,口乾咽燥,舌紅,脈細弦"];
  r.pattern_indications_en = ["Heart Blood Deficiency", "Heart and Liver Blood Deficiency", "Liver Yin Deficiency with Empty Fire Disturbing Heart", "Liver Blood Deficiency with Deficiency Heat Rising"];
  r.actions_zh = ["養肝血", "養心", "安神", "清心肝虛熱", "除煩"];
  r.actions_en = ["Nourishes Liver Blood", "Nourishes the Heart", "Calms the Shen", "Clears Heat in Liver and Heart", "Eliminates irritability"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "modifications_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], AD_NOTE + " — zh 為 CloudTCM 條文(第2條由原功用句濃縮,原文在 zhu_zhi_zh),en 為 AD 證型,兩源並記");
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 酸棗仁湯    1+21 條歸位:主治10 方義6 筆記2 加減2 應用1;actions 5/5 對齊(AD)");
}

// §0 guard
const MOVED_FIELDS = new Set(["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en", "modifications_zh", "field_sources", "applications_zh", "modern_research_zh", "chinese_depth_track"]);
const TOUCHED = new Set(["formula.da_cheng_qi_tang", "formula.ma_xing_shi_gan_tang", "formula.suan_zao_ren_tang"]);
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
console.log("\n批次3完成,§0 guard 通過");

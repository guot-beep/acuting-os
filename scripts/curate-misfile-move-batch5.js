// 錯層搬移 批次5(最終批):四逆散 · 青蒿鱉甲湯 · 四逆湯 · 逍遙散 · 半夏瀉心湯。
// 紀律同批次2-4:中文原文逐字存活 assert;假前綴英文逐條驗證後替換(四逆散/青蒿鱉甲/四逆湯);
// 無來源草稿英文逐字比對後替換並同步 english_exam_track(逍遙散/半夏瀉心湯);
// 真英文一律出自 AD harvest,zh/en 非逐條對譯時標「兩源並記」。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const MOVED = "CloudTCM 方劑頁——原存於 actions_zh/pattern_indications_zh,2026-08-06 錯層搬移歸位(scripts/curate-misfile-move-batch5.js)";
const AD_NOTE = "American Dragon formula page (harvested 2026-08)";
const PAIR_NOTE = AD_NOTE + " — zh 為辨證條文(原文完整保留於 chinese_depth_track 或本欄),en 為 AD 證型,兩源並記";

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
  en.forEach((e, i) => { if (!String(e).startsWith(prefix + zhArr[i].slice(0, 18))) die(`${id} en[${i}] 不是假英文`); });
};
const assertDraftEn = (id, field, en, expected) => {
  if (JSON.stringify(en) !== JSON.stringify(expected)) die(`${id}.${field} 與轉錄所見不符`);
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
const syncExamTrack = (r) => {
  const e = r.english_exam_track;
  if (!e) return;
  e.actions_en = r.actions_en;
  e.pattern_indications_en = r.pattern_indications_en;
  e.source_note = "actions_en/pattern_indications_en 於 2026-08-06 由無來源草稿替換為 American Dragon harvest 版本(與 record 層一致);其餘欄位仍為舊摘要。";
};
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));

// ── 四逆散 ───────────────────────────────────────────────────────────────────
{
  const id = "formula.si_ni_san";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 16 || !Array.isArray(P) || P.length !== 30) die(`${id} 條數不符`);
  if (!A[0].startsWith("「陽氣鬱滯導致的厥逆證」") || A[7] !== "四逆散的治療原理" || P[17] !== "四逆散的組成原理" || !P[29].startsWith("相關加減法"))
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [A[2], A[3], A[4], A[5], A[6], A[7], A[8], A[9], A[10], A[11], A[12], A[13], A[14]]);
  appendPara(cdt, "fang_yi_zh", P.slice(1, 18));
  appendPara(cdt, "notes_zh", [A[15], P[0], P[18], P[19]]);
  r.applications_zh = [P[20], P[21], P[22], P[23], P[24], P[25], P[26], P[27], P[28]];
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), P[29]];
  r.pattern_indications_zh = [A[0], A[1]];
  r.pattern_indications_en = ["Jue Yin Heat", "Shao Yin Heat", "Liver and Spleen Disharmony (Liver Attacking the Spleen) with costal or abdominal pain and menstrual complaints", "Gu Syndrome"];
  r.actions_zh = ["解表", "調和肝脾", "解鬱滯", "疏肝行氣", "清裡熱", "解情志抑鬱"];
  r.actions_en = ["Releases the Exterior", "Regulates Liver and Spleen", "Relieves Stagnation", "Spreads Liver Qi", "Eliminates Heat in the Interior", "Relieves mental depression"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh", "modifications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 四逆散      16+30 條歸位:主治2 病機13 方義17(暖氣系統比喻) 筆記4 應用9 加減1;actions 6/6(AD)");
}

// ── 青蒿鱉甲湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.qing_hao_bie_jia_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 19 || !Array.isArray(P) || P.length !== 12) die(`${id} 條數不符`);
  if (!A[0].startsWith("鱉甲：滋陰潛陽") || A[5] !== "方劑組成與加減" || A[17] !== "總結" || P[9] !== "治療原理")
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  appendPara(cdt, "fang_yi_zh", [A[0], A[1], A[2], A[3], A[4], P[9], P[10], P[11]]);
  appendPara(cdt, "notes_zh", [A[5], A[6], A[7], A[8], A[9], A[10], A[11], A[15], A[17], A[18]]);
  appendPara(cdt, "zhu_zhi_zh", [P[0]]);
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), A[12], A[13], A[14]];
  if (!String(r.administration_zh || "").trim()) r.administration_zh = A[16];
  else appendPara(cdt, "notes_zh", [A[16]]);
  r.pattern_indications_zh = [P[1], P[2], P[3], P[4], P[5], P[6], P[7], P[8]];
  r.pattern_indications_en = ["Heat lurking in the Yin aspects of the body (usually due to later stages of a Warm-Heat pathogen)"];
  r.actions_zh = ["養陰", "透泄陰分伏熱"];
  r.actions_en = ["Nourishes the Yin", "Vents Interior Deficiency Heat"];
  srcNote(r, ["chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "chinese_depth_track.zhu_zhi_zh", "modifications_zh", "administration_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 青蒿鱉甲湯  19+12 條歸位:主治8 方義8 筆記10+ 加減3 服法1;actions 2/2(AD)");
}

// ── 四逆湯 ───────────────────────────────────────────────────────────────────
{
  const id = "formula.si_ni_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 13 || !Array.isArray(P) || P.length !== 11) die(`${id} 條數不符`);
  if (!A[0].startsWith("四逆湯在傳統中醫被運用來急救之方") || !A[12].startsWith("最後必須提到的是") || !P[5].startsWith("四逆湯方中「附子」") || !P[9].startsWith("本方藥雖僅三味"))
    die(`${id} 錨點不符`);
  assertFakeEn(id, r.actions_en, A, "Action: ");
  assertFakeEn(id, r.pattern_indications_en, P, "Indication: ");

  const cdt = cdtOf(r);
  r.applications_zh = A.slice(0, 12);
  appendPara(cdt, "notes_zh", [A[12], P[9], P[10]]);
  appendPara(cdt, "zhu_zhi_zh", [P[0], P[1], P[2], P[3], P[4]]);
  appendPara(cdt, "fang_yi_zh", [P[5], P[6], P[7], P[8]]);
  r.pattern_indications_zh = [
    "少陰病,陽虛陰盛——四肢厥逆,惡寒蜷臥,腹痛下利,神疲欲寐,脈沉微細",
    "亡陽證——大汗淋漓,四肢厥冷,脈微欲絕",
  ];
  r.pattern_indications_en = ["Heart Yang Deficiency Exhaustion: Yang Xu Jue Ni", "Kidney Yang Deficiency with Internal Cold", "Shao Yin Cold", "Yang Ming Han", "Excess use of diaphoretics in Tai Yang Stage leading to loss of Yang"];
  r.actions_zh = ["回陽救逆", "溫中", "散裡寒", "止瀉"];
  r.actions_en = ["Rescues Yang", "Warms the Middle Jiao", "Disperses Internal Cold", "Stops diarrhea"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 四逆湯      13+11 條歸位:主治2 病機5 方義4 筆記3(含生附子毒性註) 應用12;actions 4/4(AD)");
}

// ── 逍遙散 ───────────────────────────────────────────────────────────────────
{
  const id = "formula.xiao_yao_san";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 13 || !Array.isArray(P) || P.length !== 14) die(`${id} 條數不符`);
  // A 是 P[1..13] 的完整複本 —— 收掉 A 不會丟任何內容,前提先驗證
  for (let i = 0; i < 13; i++) if (A[i] !== P[i + 1]) die(`${id} A[${i}] ≠ P[${i + 1}] — 複本前提不成立`);
  if (!P[0].startsWith("逍遙散始見於《太平惠民和劑局方》") || !P[13].startsWith("現代臨床常用於")) die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Soothe Liver qi", "Strengthen Spleen", "Nourish blood"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Liver qi stagnation with blood deficiency and Spleen deficiency pattern context"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [P[1], P[2], P[3], P[4]]);
  appendPara(cdt, "fang_yi_zh", [P[5], P[6], P[7], P[8]]);
  appendPara(cdt, "notes_zh", [P[0], P[9], P[10], P[12]]);
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), P[11]];
  r.applications_zh = [P[13]];
  r.pattern_indications_zh = ["肝鬱血虛,脾失健運證——兩脅作痛,頭痛目眩,口燥咽乾,神疲食少,月經不調,乳房脹痛,舌淡,脈弦而虛"];
  r.pattern_indications_en = ["Liver Qi Stagnation Invades Stomach", "Liver Qi Stagnation Invades the Spleen (Liver and Spleen Disharmony)", "Liver Qi Stagnation with Blood Deficiency", "Qi and Blood Stagnation", "Blood Deficiency with Liver Qi Stagnation"];
  r.actions_zh = ["平肝", "疏肝行氣", "健脾", "養血", "調和肝脾"];
  r.actions_en = ["Pacifies the Liver", "Spreads Liver Qi", "Strengthens the Spleen", "Nourishes the Blood", "Harmonizes the Liver and Spleen"];
  syncExamTrack(r);
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "modifications_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, P); // A 是 P 的子集複本,驗 P 即涵蓋全部
  console.log("✓ 逍遙散      14 條歸位(act 為複本已收):病機4 方義4 筆記4 加減1 應用1;actions 5/5(AD)");
}

// ── 半夏瀉心湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.ban_xia_xie_xin_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 9 || !Array.isArray(P) || P.length !== 4) die(`${id} 條數不符`);
  if (!A[0].startsWith("《傷寒論》中除了提到半夏瀉心湯") || A[5] !== "比較三種瀉心湯的差異" || P[3] !== "現代中醫對於半夏瀉心湯的運用")
    die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Harmonize Stomach and Intestines", "Disperse focal distention", "Balance cold and heat pattern context"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Mixed cold-heat focal distention pattern with epigastric fullness, nausea, borborygmus, or diarrhea context"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "notes_zh", [A[0], A[1], A[2], A[3], A[4], A[5]]);
  r.applications_zh = [A[6], A[7], A[8], P[0], P[1], P[2], P[3]];
  r.pattern_indications_zh = ["寒熱錯雜之痞證——心下痞滿而不痛,嘔吐,腸鳴下利,舌苔膩而微黃"];
  r.pattern_indications_en = ["Disharmony Between the Stomach and Intestines with interaction of Cold and Heat factors", "Improper purging of the Shao Yang with underlying Stomach Deficiency", "Damp-Heat in the gastrointestinal area"];
  r.actions_zh = ["和胃", "降逆", "散結", "消寒熱錯雜之痞滿"];
  r.actions_en = ["Harmonizes the Stomach", "Descends Rebellious Qi", "Disperses clumping", "Eliminates focal distention due to Cold and Heat factors"];
  syncExamTrack(r);
  srcNote(r, ["chinese_depth_track.notes_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 半夏瀉心湯  9+4 條歸位:主治1 筆記6(三瀉心比較) 應用7;actions 4/4(AD)");
}

// §0 guard
const MOVED_FIELDS = new Set(["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en", "modifications_zh", "field_sources", "applications_zh", "administration_zh", "chinese_depth_track", "english_exam_track"]);
const TOUCHED = new Set(["formula.si_ni_san", "formula.qing_hao_bie_jia_tang", "formula.si_ni_tang", "formula.xiao_yao_san", "formula.ban_xia_xie_xin_tang"]);
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
console.log("\n批次5完成 —— 錯層搬移 15/15 全部結案,§0 guard 通過");

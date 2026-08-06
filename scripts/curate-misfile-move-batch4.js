// 錯層搬移 批次4:小柴胡湯 · 補中益氣湯 · 六味地黃丸 · 歸脾湯。
//
// 這批與批次2/3不同:actions_en / pattern_indications_en 不是假前綴,而是
// 無來源的產生器草稿(field_sources 全空,措辭是「Support ... pattern context」
// 這種流程詞彙 —— 稽核 §4② 記載的同一批污染)。替換為 AD harvest 的可引用版本,
// 原草稿文字記在 commit message(git 歷史可回復)。
// 中文搬移紀律不變:原文逐字存活 assert,少一條就整批拒寫。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const MOVED = "CloudTCM 方劑頁——原存於 actions_zh/pattern_indications_zh,2026-08-06 錯層搬移歸位(scripts/curate-misfile-move-batch4.js)";
const AD_NOTE = "American Dragon formula page (harvested 2026-08)";
const PAIR_NOTE = AD_NOTE + " — zh 為辨證條文(由搬移前 CloudTCM 原文濃縮,原文完整保留於 chinese_depth_track),en 為 AD 證型,兩源並記";

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
const assertDraftEn = (id, field, en, expected) => {
  if (JSON.stringify(en) !== JSON.stringify(expected)) die(`${id}.${field} 與轉錄所見不符 — 拒寫`);
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

// ── 小柴胡湯 ─────────────────────────────────────────────────────────────────
{
  const id = "formula.xiao_chai_hu_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 1 || !Array.isArray(P) || P.length !== 27) die(`${id} 條數不符`);
  if (!A[0].startsWith("小柴胡湯是網路的熱門中藥方劑") || !P[3].startsWith("小柴胡湯在古代被用來改善「熱入血室證」") || !P[12].startsWith("千年以來小柴胡湯應用非常廣泛") || !P[26].startsWith("小柴胡湯的加減"))
    die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Harmonize shaoyang", "Support pivot-pattern differentiation"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Shaoyang pattern context with alternating chills and fever, chest/rib-side discomfort, poor appetite, nausea"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [P[0], P[1], P[2], P[3], P[4], P[5], P[6], P[7], P[8]]);
  appendPara(cdt, "notes_zh", [A[0], P[9], P[10], P[11], P[25]]);
  r.applications_zh = [P[12], P[13], P[14], P[15], P[16], P[17], P[18], P[19], P[20], P[21], P[22], P[23], P[24]];
  r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), P[26]];
  r.actions_zh = ["和解少陽", "疏肝", "調和肝脾"];
  r.actions_en = ["Harmonizes and releases Shao Yang Stage disorders", "Relieves the Liver", "Harmonizes the Liver and Spleen"];
  r.pattern_indications_zh = [
    "傷寒少陽證——往來寒熱,胸脅苦滿,默默不欲飲食,心煩喜嘔,口苦咽乾目眩,脈弦",
    "婦人熱入血室——經期感受風邪,經水不當斷而斷,寒熱發作",
    "瘧疾、黃疸與內傷雜病見少陽證者",
  ];
  r.pattern_indications_en = ["Shao Yang Stage disorders", "Gu Syndrome", "Liver Qi Stagnation with Spleen Dampness", "Heat in the Liver, Gallbladder, Stomach and/or Lungs"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.notes_zh", "applications_zh", "modifications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 小柴胡湯    1+27 條歸位:病機9 筆記5 應用13 加減1;actions 3/3 對齊(AD)");
}

// ── 補中益氣湯 ────────────────────────────────────────────────────────────────
{
  const id = "formula.bu_zhong_yi_qi_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 1 || !Array.isArray(P) || P.length !== 22) die(`${id} 條數不符`);
  if (!A[0].startsWith("補中益氣湯的功用") || !P[0].startsWith("亦可改善氣虛發熱證") || !P[12].startsWith("補中升陽之品首推黃耆") || !P[20].startsWith("此方應用極廣"))
    die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Tonify middle qi", "Raise yang", "Support sinking qi pattern context"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Spleen/Stomach qi deficiency with sinking qi pattern context"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [A[0], P[0], P[1], P[2], P[3], P[4], P[5], P[6], P[7]]);
  appendPara(cdt, "fang_yi_zh", [P[8], P[9], P[10], P[11], P[12], P[13], P[14], P[15], P[16], P[17], P[18], P[19]]);
  r.applications_zh = [P[20], P[21]];
  r.actions_zh = ["補中焦之氣", "益氣", "理氣", "升舉下陷之陽氣", "升提下垂之臟器"];
  r.actions_en = ["Tonifies Middle Jiao Qi", "Benefits Qi", "Regulates Qi", "Raises Sunken Yang", "Lifts prolapsed organs"];
  r.pattern_indications_zh = [
    "脾胃氣虛證——體倦乏力,少氣懶言,面色萎黃,食少便溏,舌淡脈弱",
    "氣虛發熱證——身熱自汗,渴喜熱飲,氣短乏力,脈大無力",
    "中氣下陷證——脫肛、子宮脫垂、胃下垂,久瀉久痢,崩漏",
  ];
  r.pattern_indications_en = ["Central Qi Sinking", "Spleen Not Governing Blood", "Spleen and Lung Qi Deficiency: Yin Fire due to Spleen and Lung Qi Deficiency", "Gu Syndrome", "Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 補中益氣湯  1+22 條歸位:主治9 方義12 應用2;actions 5/5 對齊(AD)");
}

// ── 六味地黃丸 ────────────────────────────────────────────────────────────────
{
  const id = "formula.liu_wei_di_huang_wan";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 1 || !Array.isArray(P) || P.length !== 13) die(`${id} 條數不符`);
  if (!A[0].startsWith("六味地黃丸從古至今") || !P[5].startsWith("方中重用熟地黃") || !P[8].startsWith("六味地黃丸是北宋兒科名家錢乙") || !P[12].startsWith("現代運用於慢性腎炎"))
    die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Nourish Kidney and Liver yin"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Kidney/Liver yin deficiency pattern context"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [P[1], P[2], P[3], P[4]]);
  appendPara(cdt, "fang_yi_zh", [P[5], P[6], P[7]]);
  appendPara(cdt, "notes_zh", [A[0], P[8], P[9], P[10], P[11]]);
  r.applications_zh = [P[12]];
  r.pattern_indications_zh = ["腎陰不足,虛火內擾證", P[0]];
  r.pattern_indications_en = ["Kidney Yin Deficiency", "Heart and Kidney Yin Deficiency", "Liver and Kidney Yin Deficiency", "Atrophy disorder (Wei Syndrome) due to Liver and Kidney Deficiency"];
  r.actions_zh = ["滋陰", "滋養肝腎之精"];
  r.actions_en = ["Enriches Yin", "Nourishes the Essence of the Liver and Kidney"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 六味地黃丸  1+13 條歸位:病機4 方義3 筆記5 應用1;actions 2/2 對齊(AD)");
}

// ── 歸脾湯 ───────────────────────────────────────────────────────────────────
{
  const id = "formula.gui_pi_tang";
  const r = getRec(id);
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (!Array.isArray(A) || A.length !== 1 || !Array.isArray(P) || P.length !== 9) die(`${id} 條數不符`);
  if (!A[0].startsWith("歸脾湯是一個相當熱門的中藥方劑") || !P[7].startsWith("所以本方以參、耆、朮、草") || !P[8].startsWith("現代運用於胃及十二指腸潰瘍出血"))
    die(`${id} 錨點不符`);
  assertDraftEn(id, "actions_en", r.actions_en, ["Tonify qi and blood", "Strengthen Spleen", "Nourish Heart", "Support bleeding-pattern documentation context"]);
  assertDraftEn(id, "pattern_indications_en", r.pattern_indications_en, ["Heart-Spleen deficiency pattern context with insomnia, palpitations, fatigue, poor memory, or bleeding tendency"]);

  const cdt = cdtOf(r);
  appendPara(cdt, "zhu_zhi_zh", [P[0], P[1], P[2], P[3], P[4], P[5], P[6]]);
  appendPara(cdt, "fang_yi_zh", [P[7]]);
  appendPara(cdt, "notes_zh", [A[0]]);
  r.applications_zh = [P[8]];
  r.pattern_indications_zh = [
    "心脾氣血兩虛證——失眠、驚悸、多夢、健忘、體倦、食少",
    "脾不統血證——便血、崩漏、月經失準、皮下紫瘢",
  ];
  r.pattern_indications_en = ["Spleen Not Governing Blood", "Heart Blood Deficiency", "Heart (Blood) and Spleen (Qi) Deficiency due to worry (excessive deliberation or obsession)", "Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency"];
  r.actions_zh = ["益氣", "養血", "健脾", "養心"];
  r.actions_en = ["Augments Qi", "Nourishes the Blood", "Strengthens the Spleen", "Nourishes the Heart"];
  srcNote(r, ["chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "chinese_depth_track.notes_zh", "applications_zh"], MOVED);
  srcNote(r, ["actions_en"], AD_NOTE);
  srcNote(r, ["pattern_indications_en"], PAIR_NOTE);
  assertSurvival(id, r, [...A, ...P]);
  console.log("✓ 歸脾湯      1+9 條歸位:病機7 方義1 筆記1 應用1;actions 4/4 對齊(AD)");
}

// §0 guard
const MOVED_FIELDS = new Set(["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en", "modifications_zh", "field_sources", "applications_zh", "chinese_depth_track"]);
const TOUCHED = new Set(["formula.xiao_chai_hu_tang", "formula.bu_zhong_yi_qi_tang", "formula.liu_wei_di_huang_wan", "formula.gui_pi_tang"]);
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
console.log("\n批次4完成,§0 guard 通過");

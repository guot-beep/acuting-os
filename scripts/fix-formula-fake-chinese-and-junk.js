// 修 Ting 2026-08-06 在卡片上直接看到的四類問題。
//
// 這四類我先前的稽核與批次全部漏掉,原因記在這裡免得重蹈:
//   我的篩選條件是「actions_zh 條數 > 8」的長文錯層,所以只有 1-3 條的卡
//   看起來「乾淨」。而驗證器 F3 檢查「_zh 有沒有中文字」——
//   「金匱腎氣丸功用：」有中文字,所以整串英文照樣過關。
//   驗證器 PASS ≠ 沒有損失,這次是活生生的例子。
//
// A. 假中文:`方名 + 功用/主治：` + 英文原句(2 方)。
//    來自 batch_enrich_all_201_formulas_from_curriculum.js 的
//    `r.pattern_indications_en.map(i => \`${name}主治：${i}\`)`。
// B. 內容錯誤:蘇合香丸的功效寫成「清熱解表、調理氣血」——它是溫開劑。
//    課件表 367 明寫 Warms Middle, Aromatically Opens Orifices…
// C. 課件 Case Study 段落被解析器黏進 pattern_indications_zh(4 方)。
// D. modifications_en 的無來源流程草稿(17 方),與已清掉的
//    contraindications 草稿同一批。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const AD = "American Dragon formula page (harvested 2026-08)";
const T367 = "curriculum/herbs/方剂学汇总_extracted.md#Table367(Actions/Indications 行)";

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const die = (m) => { console.error("REFUSING — " + m); process.exit(1); };
const rec = (id) => { const r = doc.records.find((x) => x.id === "formula." + id); if (!r) die("找不到 " + id); return r; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const src = (r, fields, note) => {
  r.field_sources = r.field_sources || {};
  for (const f of fields) r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), note])];
};
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));
const log = [];

// ── A/B. 金匱腎氣丸 ───────────────────────────────────────────────────────────
{
  const r = rec("jin_gui_shen_qi_wan");
  if (!same(r.actions_zh, ["金匱腎氣丸功用：Warm and tonify Kidney yang", "金匱腎氣丸功用：Support water metabolism pattern context"])) die("金匱腎氣丸 actions_zh 與所見不符");
  // 方歌自己就寫著「溫補腎陽化氣水」,AD 作 Warms and Tonifies Kidney Yang。
  r.actions_zh = ["溫補腎陽", "化氣行水"];
  r.actions_en = ["Warms and Tonifies Kidney Yang", "Promotes Qi transformation and water metabolism"];
  r.pattern_indications_zh = ["腎陽不足證——腰痛腳軟,身半以下常有冷感,少腹拘急,小便不利或反多,舌淡而胖,脈虛弱尺部沉細"];
  r.pattern_indications_en = ["Kidney Yang Deficiency with cold sensations below the waist, low back soreness, urinary difficulty or frequency, and edema"];
  if (r.english_exam_track) {
    r.english_exam_track.actions_en = r.actions_en;
    r.english_exam_track.pattern_indications_en = r.pattern_indications_en;
    r.english_exam_track.source_note = "actions_en/pattern_indications_en 於 2026-08-06 由無來源草稿替換(與 record 層一致)。";
  }
  src(r, ["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en"],
    AD + " + 本方方歌「溫補腎陽化氣水，陽虛水腫腰酸痊」;原值為腳本產生的假中文(方名+功用：+英文),2026-08-06 替換");
  log.push("✓ 金匱腎氣丸  假中文 3 條 → 真功效 2/2 · 主治 1/1");
}

// ── B. 蘇合香丸(內容錯誤:溫開劑被寫成清熱解表)────────────────────────────
{
  const r = rec("su_he_xiang_wan");
  if (!same(r.actions_zh, ["蘇合香丸：清熱解表、調理氣血"])) die("蘇合香丸 actions_zh 與所見不符");
  r.actions_zh = ["溫通中焦", "芳香開竅", "行氣", "化濁"];
  r.actions_en = ["Warms the Middle", "Aromatically Opens the Orifices", "Promotes Qi Flow", "Transforms Turbidity"];
  r.pattern_indications_zh = [
    "寒閉證——突然昏倒,不省人事,牙關緊閉",
    "胸腹滿痛而有冷感,可為昏厥之先兆",
    "腹痛、胸中痞悶,欲吐欲瀉",
  ];
  r.pattern_indications_en = [
    "Acute closed disorders due to excessive cold: sudden collapse, loss of consciousness, clenched jaw",
    "Fullness, pain, and a sensation of cold in the chest and abdomen that may signal impending loss of consciousness",
    "Abdominal pain and focal distention in the chest, with an urge to vomit and defecate",
  ];
  src(r, ["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en"],
    T367 + ";原 actions_zh 誤作「清熱解表、調理氣血」(本方為溫開劑),2026-08-06 依課件更正");
  log.push("✓ 蘇合香丸    ⚠️內容錯誤更正:清熱解表 → 溫通中焦/芳香開竅(課件表367) · 主治 3/3");
}

// ── C. Case Study 殘渣 ────────────────────────────────────────────────────────
// 解析器把課件的病例段落黏進主治欄。前半是真的 Indications,後半是病例故事。
// 依 §0 例外(F9 完全損毀)處理:真內容移到 _en(它本來就是英文),病例殘渣不保留。
const CASE = [
  { id: "xiang_su_san", was: ["Case Study"], keepEn: [] },
  { id: "ren_shen_bai_du_san",
    was: ["Wind-cold-damp invasion to deficient patient [high fever & severe pimples in the nape and chest [Toxins in the body]. This adopted boy was fed"],
    keepEn: ["Wind-cold-damp invasion in a deficient patient"] },
  { id: "liang_ge_san",
    was: ["Heat accumulation in the upper and middle jiao (blazing heat in Case Study"],
    keepEn: ["Heat accumulation in the upper and middle jiao"] },
  { id: "qing_wen_bai_du_yin",
    was: ["Severe heat (fire) in both Qi & Blood levels [intense fever, strong and elbows when she had a fall 2 days ago. Other sx: flushed face, fast and"],
    keepEn: ["Severe heat (fire) at both the Qi and Blood levels"] },
];
for (const c of CASE) {
  const r = rec(c.id);
  if (!same(r.pattern_indications_zh, c.was)) die(`${c.id} pattern_indications_zh 與所見不符`);
  r.pattern_indications_zh = [];
  r.pattern_indications_en = c.keepEn;
  src(r, ["pattern_indications_en"],
    "curriculum/herbs/方剂学汇总_extracted.md(Indications 行);解析器原將 Case Study 病例段落黏入,2026-08-06 截去病例殘渣,中文層待填");
  log.push(`✓ ${r.name_zh.padEnd(8)} Case Study 殘渣清除(英文保留 ${c.keepEn.length} 條,中文待填)`);
}

// ── D. modifications_en 無來源草稿 ────────────────────────────────────────────
const DRAFT = /^(Review|Base for|Support|Consider|Compare with)\b/;
let dn = 0, df = 0;
for (const r of doc.records) {
  const en = Array.isArray(r.modifications_en) ? r.modifications_en : [];
  if (!en.length) continue;
  const keep = en.filter((x) => !DRAFT.test(String(x).trim()));
  if (keep.length === en.length) continue;
  dn += en.length - keep.length; df++;
  r.modifications_en = keep;
}
log.push(`✓ modifications_en  清掉 ${dn} 條無來源草稿句(${df} 方)`);

// ── 四物湯:AD 其實給了 4 條 actions,先前只用到舊的 2 條 ──────────────────────
{
  const r = rec("si_wu_tang");
  if (!same(r.actions_zh, ["補血", "調血"])) die("四物湯 actions_zh 與所見不符");
  r.actions_zh = ["補血養血", "調肝", "行血活血", "調經"];
  r.actions_en = ["Nourishes the Blood", "Regulates the Liver", "Improves Blood circulation", "Regulates menstruation"];
  src(r, ["actions_zh", "actions_en"], AD + "(完整 4 條;先前僅採用舊的 2 條摘要)");
  log.push("✓ 四物湯      功效 2 → 4 條(AD 完整版,中英 4/4)");
}

// §0 guard:被指名修的欄位之外不得變短
const TOUCHED = new Set(["formula.jin_gui_shen_qi_wan", "formula.su_he_xiang_wan", "formula.si_wu_tang",
  ...CASE.map((c) => "formula." + c.id)]);
const OK = new Set(["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en",
  "modifications_en", "field_sources", "english_exam_track"]);
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (OK.has(k) && (TOUCHED.has(r.id) || k === "modifications_en")) continue;
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
}
if (problems.length) die(problems.join("\n  "));

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
for (const l of log) console.log("  " + l);

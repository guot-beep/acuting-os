// 修中英錯位 —— 這是我(Claude)在 2026-08-06 批次 2-5 自己造成的,記在這裡。
//
// 我把 pattern_indications_zh 改寫成中文辨證條文,再把 American Dragon 的
// **證型名稱清單**填進 pattern_indications_en,然後在 commit 裡稱之為「兩源並記」。
// 那不是並記,是把兩種不同粒度的東西塞進同一組索引對齊的欄位:
//     zh: 「陽明腑實,胃腸積熱:大便秘結、腹脹滿痛…」  ← 敘述
//     en: 「Stomach Excess Heat」「Colon Excess Heat」  ← 證型標籤
// 後果不是畫面錯位(detailPairedList 遇到不等長只印中文),而是**英文完全不顯示**。
// 我以為填好了英文,使用者一個字都看不到。模板 §3 F4 早就寫著:
// 「不確定就整個留空,絕不錯位」。
//
// 修法與 applications/modifications 一致:AD 的清單各自成欄並各自渲染,
// pattern_indications_en 留空等對譯,寧可誠實留空也不錯位。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const die = (m) => { console.error("REFUSING — " + m); process.exit(1); };
const rec = (id) => { const r = doc.records.find((x) => x.id === "formula." + id); if (!r) die("找不到 " + id); return r; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const src = (r, fs_, note) => { r.field_sources = r.field_sources || {}; for (const f of fs_) r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), note])]; };
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));
const log = [];

// ── 1. AD 證型清單獨立成欄 ────────────────────────────────────────────────────
let n1 = 0;
for (const r of doc.records) {
  const zh = Array.isArray(r.pattern_indications_zh) ? r.pattern_indications_zh : [];
  const en = Array.isArray(r.pattern_indications_en) ? r.pattern_indications_en : [];
  if (!zh.length || !en.length || zh.length === en.length) continue;
  r.ad_syndromes_en = en;
  r.pattern_indications_en = [];
  src(r, ["ad_syndromes_en"], "American Dragon SYNDROMES 清單(證型名稱,與中文辨證敘述粒度不同)— 2026-08-06 拆為獨立欄位以免中英錯位");
  if (r.field_sources) delete r.field_sources.pattern_indications_en;
  if (r.english_exam_track) r.english_exam_track.pattern_indications_en = [];
  n1++;
}
log.push(`✓ AD 證型清單 → ad_syndromes_en:${n1} 方(pattern_indications_en 留空待對譯)`);

// ── 2. 四君子湯:整段敘述躺在 actions_zh / pattern_indications_zh ──────────────
{
  const r = rec("si_jun_zi_tang");
  const A = r.actions_zh, P = r.pattern_indications_zh;
  if (A.length !== 1 || !A[0].startsWith("本方的主要功用")) die("四君子湯 actions_zh 與所見不符");
  if (P.length !== 5) die("四君子湯 pattern_indications_zh 不是 5 條");
  const cdt = (r.chinese_depth_track = r.chinese_depth_track || {});
  const app = (obj, k, lines) => { obj[k] = [typeof obj[k] === "string" ? obj[k] : "", lines.join("\n")].filter(Boolean).join("\n"); };
  app(cdt, "zhu_zhi_zh", [A[0], P[0], P[1], P[2]]);
  app(cdt, "fang_yi_zh", [P[3]]);
  r.applications_zh = [...(Array.isArray(r.applications_zh) ? r.applications_zh : []), P[4]];
  r.actions_zh = ["益氣", "健脾"];
  r.actions_en = ["Tonify qi", "Strengthen Spleen"];
  r.pattern_indications_zh = ["脾胃氣虛證——面色萎白,語聲低微,氣短乏力,食少便溏,舌淡苔白,脈虛弱"];
  r.pattern_indications_en = ["Spleen and Stomach Qi Deficiency: pale complexion, weak voice, shortness of breath, fatigue, poor appetite, loose stools, pale tongue with white coating, weak pulse"];
  src(r, ["actions_zh", "pattern_indications_zh", "pattern_indications_en", "chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.fang_yi_zh", "applications_zh"],
    "CloudTCM 方劑頁——原整段敘述誤置於 actions_zh/pattern_indications_zh,2026-08-06 搬移歸位;功效與主治改為對齊的條列");
  const survive = [A[0], ...P].filter((s) => !JSON.stringify(r).includes(JSON.stringify(s).slice(1, -1)));
  if (survive.length) die("四君子湯 搬移後遺失 " + survive.length + " 條");
  log.push("✓ 四君子湯    整段敘述歸位(病機4 方義1 應用1);功效 2/2 · 主治 1/1 對齊");
}

// ── 3. 三首禁忌的無來源草稿 → AD 真內容 ──────────────────────────────────────
// 中文是既有的真內容,AD 的條目與它高度對應 —— 所以 en 寫成該條中文的對譯,
// 並在括號內標出 AD 的對應原文;AD 多出來的藥物交互敘述屬藥理,另歸 modern_research_en。
const CONTRA = [
  { id: "ban_xia_xie_xin_tang",
    draftStarts: "Severe abdominal pain, blood in stool",
    zh: ["主治虛實互見之證，若因氣滯或食積所致的心下痞滿．不宜使用。", "陰虛嘔逆者忌用"],
    en: ["Contraindicated for focal distention due to Qi Stagnation, Food Stagnation, or accumulation of Phlegm and Heat — this formula treats mixed excess-deficiency patterns.",
      "Contraindicated for nausea and vomiting due to Yin Deficiency."],
    research: ["Diarrhea induced by cisplatin (Platinol) and irinotecan (Camptosar) was effectively controlled by this formula."] },
  { id: "xiao_chai_hu_tang",
    draftStarts: "Unexplained fever, severe abdominal pain",
    zh: ["長期服用可能引起頭痛、頭暈，牙齦出血、肺炎", "肝陽上亢，高血壓，陰虛吐血慎用", "柴胡升散，芩、夏性燥，故對陰虛血少者禁用。"],
    en: ["Long-term use may cause headache, dizziness, bleeding gums, or pneumonitis.",
      "Use with caution for Liver Yang Rising, hypertension, or hematemesis due to Yin Deficiency.",
      "Contraindicated for Yin or Blood Deficiency — Chai Hu is raising and dispersing while Huang Qin and Ban Xia are drying."],
    research: ["Acute pneumonitis may be associated with interferon in combination with this formula.",
      "Concurrent use with Interleukin 2 may have a synergistic anti-tumor effect against murine renal cell carcinoma.",
      "Concurrent use with antiviral drugs such as zidovudine (AZT), lamivudine (3TC), or AZT plus 3TC may have a synergistic antiviral effect.",
      "Concurrent use with 5-fluorouracil (5-FU) may be synergistic in treating cancer.",
      "This formula has a beneficial effect in preventing and/or treating damage induced by drugs such as halothane, danazol, D-galactosamine, and carbon tetrachloride."] },
  { id: "gui_pi_tang",
    draftStarts: "Review bleeding disorders, anticoagulants",
    zh: ["忌生冷食物", "勿思慮過度及過勞", "陰虛內熱或實熱證者勿用"],
    en: ["Avoid raw and cold foods while taking this formula.",
      "Avoid excessive worry, rumination, and overwork — they are the cause this formula addresses.",
      "Contraindicated for Yin Deficiency with Heat signs or for Interior Excess Heat patterns."],
    research: [] },
];
for (const c of CONTRA) {
  const r = rec(c.id);
  const cur = r.contraindications_en || [];
  if (cur.length !== 1 || !String(cur[0]).startsWith(c.draftStarts)) die(`${c.id} contraindications_en 與所見不符:${JSON.stringify(cur).slice(0, 100)}`);
  if (!same(r.contraindications_zh, c.zh)) die(`${c.id} contraindications_zh 與所見不符`);
  if (c.en.length !== c.zh.length) die(`${c.id} 轉錄的 en/zh 條數不符`);
  r.contraindications_en = c.en;
  if (c.research.length) {
    r.modern_research_en = [...(Array.isArray(r.modern_research_en) ? r.modern_research_en : []), ...c.research];
    src(r, ["modern_research_en"], "American Dragon HERB/DRUG INTERACTIONS — 屬藥理與交互作用,不是禁忌,2026-08-06 歸位");
  }
  src(r, ["contraindications_en"], "zh 為既有中文原文,en 為其對譯(內容與 American Dragon 2026-08 harvest 的禁忌條目一致);原值為無來源流程草稿,2026-08-06 替換");
  log.push(`✓ ${r.name_zh.padEnd(8)} 禁忌草稿 → 中文對譯 ${c.zh.length}/${c.zh.length} 對齊` + (c.research.length ? ` · ${c.research.length} 條藥物交互歸位` : ""));
}

// §0 guard
const OKF = new Set(["pattern_indications_en", "ad_syndromes_en", "field_sources", "english_exam_track",
  "actions_zh", "actions_en", "pattern_indications_zh", "contraindications_en", "chinese_depth_track", "applications_zh", "modern_research_en"]);
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (OKF.has(k)) continue;
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
}
if (problems.length) die(problems.join("\n  "));

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
for (const l of log) console.log("  " + l);

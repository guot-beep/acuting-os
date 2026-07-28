#!/usr/bin/env node
/**
 * curate-sample-formula.js — 麻黃湯 to the full template, as the sample Ting
 * asked to see before we commit to the structure.
 *
 * Everything here comes from ONE curriculum page,
 * `curriculum/formulas/Formulations Summary Chart.docx.pdf#p1`, which is the
 * table the template's §5 describes:
 *
 *   Ma Huang Tang [麻黄汤]   Chief     Ma Huang    M 9   Ma Huang Jia Zhu Tang [5] ● Bai Zhu 12
 *   (Ephedra Decoction) [4]  Deputy    Gui Zhi     G 6   [Body Aches ← Damp Cold]
 *   [Shang Han Lun]          Assistant Xing Ren    X 9   Da Qing Long Tang [7]     ● Ma Huang → 18
 *   Strongest Diaphoretic    Envoy     Zhi Gan Cao Z 3   San Ao Tang [3]           ● Gui Zhi
 *   [Could damage Qi & Fluids]                           Hua Gai San [7]           ● Sang Bai Pi …
 *   Actions: Releases Exterior Cold & Arrests Wheezing
 *   Preparation: Short time [<20 minutes]
 *   Indications: Tai Yang Shang Han (Wind Cold Exterior Excess (Shi))
 *   [Fever & chills NO sweating  Floating, tight pulse]  T: thin, white coating
 *
 * The chapter heading gives the 八法: 「Chapter 1: 汗法 Formulas That Release
 * the Exterior [Sweating]」 — which the CH outline names as its own exam
 * objective (Domain I.B.5), so it becomes a field rather than prose.
 *
 * ⚠️ This one card is transcribed by hand and every English string is asserted
 * to appear verbatim in the extracted page text. That assertion is the whole
 * safety net — it is why a hand transcription is acceptable for ONE sample and
 * not for 173 formulas, which need parse-formula-curriculum.py.
 *
 * Existing content is not overwritten (§0): CloudTCM's per-herb elucidation_zh,
 * modern_diseases_zh, pharmacology_zh and the granule doses all stay.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const SRC_MD = path.join(ROOT, "curriculum/formulas/Formulations Summary Chart.docx.md");
const SRC_MD2 = path.join(ROOT, "curriculum/formulas/Herbal Formulations Comprehensive.docx.md");
const CITE = "curriculum/formulas/Formulations Summary Chart.docx.pdf#p1";
const CITE2 = "curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf（麻黃湯 條目）";
const APPLY = process.argv.includes("--apply");
const ID = "formula.ma_huang_tang";

// ── everything below is quoted from the page above ──────────────────────────
const EN = {
  actions: ["Releases Exterior Cold", "Arrests Wheezing"],
  indications: [
    "Tai Yang Shang Han (Wind Cold Exterior Excess (Shi))",
    "Fever & chills NO sweating"
  ],
  // ⚠️ The tongue/pulse cell wraps across two physical lines with ANOTHER
  // column's text interleaved between them:
  //   "… Wheezing, T: thin, | Internal phlegm with wind cold ● Zi Su Zi"
  //   "white coating, P: floating, tight | attack [Scoop away, stop ● Chi Fu Ling"
  // So "T: thin, white coating" never appears contiguously in the extracted
  // text even though that is what the page says. The assertion below therefore
  // checks the two fragments that DO appear — and this is precisely the trap
  // §5 warns about, which is why 173 formulas need the parser rather than more
  // hand transcription.
  tongue: "T: thin, white coating",
  tongueFragments: ["T: thin,", "white coating, P: floating, tight"],
  pulse: "Floating, tight pulse",
  preparation: "Short time [<20 minutes]",
  caution: "Could damage Qi & Fluids",
  note: "Strongest Diaphoretic",
  // ── from Herbal Formulations Comprehensive ──
  // "Applications" is the 現代應用 Ting was looking for: what this formula
  // treats today. CloudTCM's modern_diseases_zh list for this formula includes
  // 系統性紅斑性狼瘡 and 心肌梗塞, which is a loose keyword association, not a
  // clinical application — so the curriculum's list is kept separate from it
  // rather than merged into it.
  applications: [
    "Cold/flu/acute bronchitis, asthma mainly manifesting as wheezing due to cold",
    "Bi Sx due to wind cold damp",
    "Nosebleeds w/o sweating and with a floating/tight pulse",
    "Acute glomerulonephritis",
    "Skin disorders due to wind cold"
  ],
  research: ["Antipyretic", "Promotes glandular secretion, esp. sweating & tearing",
    "Antitussive", "Antiasthmatic", "Expectorant", "Antibacterial, antiviral"],
  administration: "taken hot to induce sweating"
};

const ZH = {
  actions: ["發汗解表、散風寒", "宣肺平喘"],
  indications: [
    "太陽傷寒 —— 風寒表實證",
    "發熱惡寒、無汗"
  ],
  tongue: "舌苔薄白",
  pulse: "脈浮緊",
  preparation: "煎煮時間短（20 分鐘以內）—— 麻黃、桂枝皆為辛散之品，久煎則發散之力減。",
  baFa: "汗法",
  baFaEn: "Sweating (Han Fa)",
  roles: [
    { herb: "麻黃", role: "君", in_formula: "發汗解表、宣肺平喘 —— 開腠理、透毛竅，使表寒從汗而解" },
    { herb: "桂枝", role: "臣", in_formula: "溫經散寒、助麻黃發汗 —— 並溫通經脈，緩解身疼骨節痛" },
    { herb: "杏仁", role: "佐", in_formula: "降肺氣、止咳平喘 —— 與麻黃一宣一降，恢復肺的宣降" },
    { herb: "甘草", role: "使", in_formula: "調和諸藥、緩麻桂之峻 —— 防發汗太過傷正" }
  ],
  family: [
    { relation: "加", name_zh: "麻黃加朮湯", change: ["＋白朮 12g"], indication_zh: "身疼痛 —— 寒濕在表" },
    { relation: "加", name_zh: "大青龍湯", change: ["麻黃 9g → 18g", "＋石膏", "＋生薑", "＋大棗"], indication_zh: "外寒兼內熱；急性浮腫" },
    { relation: "減", name_zh: "三拗湯", change: ["－桂枝"], indication_zh: "風寒輕證初起" },
    { relation: "減", name_zh: "華蓋散", change: ["－桂枝", "＋桑白皮", "＋紫蘇子", "＋赤茯苓", "＋陳皮"], indication_zh: "風寒外束兼內有痰飲，咳喘" }
  ],
  pearl: "**麻黃湯是最強的發汗劑**，課件直接註明「Strongest Diaphoretic」，並警告**可能耗傷氣與津液**，所以中病即止、不可久服。\n君臣佐使的考點在**麻黃配杏仁**：麻黃宣、杏仁降，一宣一降恢復肺氣的升降，這就是「宣肺平喘」的機理。\n**與桂枝湯的分界是「有汗無汗」** —— 麻黃湯治無汗（表實），桂枝湯治有汗（表虛）。這是傷寒論最基本、也最常考的一組對比。\n煎法本身也是考點：**短煎 20 分鐘以內**，久煎則辛散之力失。",
  contra: [
    "表虛有汗者禁用 —— 有汗屬桂枝湯證，誤用麻黃湯會發汗太過",
    "體虛、氣血不足、津液虧虛者慎用（課件：Could damage Qi & Fluids）",
    "高血壓、心臟病患者慎用麻黃",
    "中病即止，不可久服；得汗即停後服"
  ],
  applications: [
    "感冒／流感／急性支氣管炎；氣喘以寒性喘鳴為主",
    "風寒濕痺",
    "鼻衄 —— 無汗、脈浮緊者",
    "急性腎小球腎炎",
    "風寒型皮膚病"
  ],
  research: ["解熱", "促進腺體分泌（尤其發汗與流淚）", "止咳", "平喘", "祛痰", "抗菌、抗病毒"],
  administration: "熱服，以助發汗。得汗即停後服。",
  compare: [
    { codes: ["formula.ma_huang_tang", "formula.gui_zhi_tang"], axis: "有汗 vs 無汗", note: "麻黃湯治風寒表實（無汗、脈浮緊）；桂枝湯治風寒表虛（有汗、脈浮緩）。這是傷寒論第一組、也是最常考的一組對比。" },
    { codes: ["formula.ma_huang_tang", "formula.da_qing_long_tang"], axis: "是否兼內熱", note: "大青龍湯就是麻黃湯加石膏、生薑、大棗並倍麻黃 —— 外寒兼內熱煩躁時用它。" }
  ]
};

// ── load & assert ───────────────────────────────────────────────────────────
const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const r = recs.find((x) => x.id === ID);
if (!r) { console.error(`${ID} 不在 formulas.json`); process.exit(1); }

const page = (() => {
  const md = fs.readFileSync(SRC_MD, "utf8");
  const i = md.indexOf("## p.1");
  const j = md.indexOf("## p.2");
  return (j > i ? md.slice(i, j) : md).replace(/\s+/g, " ");
})();
// The Comprehensive doc's 麻黃湯 entry — Applications, Modern research and
// Administration come from here, and are asserted against it separately.
const page2 = fs.readFileSync(SRC_MD2, "utf8").replace(/\s+/g, " ");

const fail = [];
// Every English string must be on that page, whitespace-insensitive. This is
// what makes a hand transcription checkable.
const quoted = [
  ...EN.actions, ...EN.indications, ...EN.tongueFragments, EN.pulse,
  EN.preparation, EN.caution, EN.note
];
for (const s of quoted) {
  const norm = String(s).replace(/\s+/g, " ").trim();
  if (!page.includes(norm)) fail.push(`Summary Chart 第 1 頁找不到這句英文：「${norm}」`);
}
for (const s of [...EN.applications, ...EN.research, EN.administration]) {
  const norm = String(s).replace(/\s+/g, " ").trim();
  if (!page2.includes(norm)) fail.push(`Comprehensive 找不到這句英文：「${norm}」`);
}
if (ZH.applications.length !== EN.applications.length) fail.push(`現代應用 中${ZH.applications.length} vs 英${EN.applications.length}`);
if (ZH.research.length !== EN.research.length) fail.push(`藥理 中${ZH.research.length} vs 英${EN.research.length}`);
// 中英 must pair (F4).
if (ZH.actions.length !== EN.actions.length) fail.push(`功效 中${ZH.actions.length} vs 英${EN.actions.length}`);
if (ZH.indications.length !== EN.indications.length) fail.push(`主治 中${ZH.indications.length} vs 英${EN.indications.length}`);
// Roles must match the existing composition, not introduce herbs (F12).
const comp = r.composition || [];
for (const x of ZH.roles) {
  if (!comp.some((c) => String(c.herb_zh).trim() === x.herb)) fail.push(`組成裡沒有「${x.herb}」，不能給它角色`);
}
if (ZH.roles.filter((x) => x.role === "君").length > 2) fail.push("君藥超過 2 味");
// Family entries must all say what changed (F11).
for (const f of ZH.family) if (!f.change.length) fail.push(`${f.name_zh} 沒寫 change`);

if (fail.length) {
  console.error(`❌ ${fail.length} 個檢查失敗 —— 不寫入:\n`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}

// ── write ───────────────────────────────────────────────────────────────────
r.actions_zh = ZH.actions;
r.actions_en = EN.actions;
r.pattern_indications_zh = ZH.indications;
r.pattern_indications_en = EN.indications;
r.tongue_zh = [ZH.tongue];
r.tongue_en = [EN.tongue];
r.pulse_zh = [ZH.pulse];
r.pulse_en = [EN.pulse];
r.preparation_zh = ZH.preparation;
r.preparation_en = EN.preparation;
r.ba_fa_zh = ZH.baFa;
r.ba_fa_en = ZH.baFaEn;
r.exam_pearl = ZH.pearl;
r.contraindications_zh = ZH.contra;
// The record's existing English safety line is a single umbrella statement
// ("Pregnancy, hypertension, palpitations, insomnia… require review") while the
// 中文 above is four specific rules. They cannot pair (F4), and I will not
// invent three more English lines to make the lengths match — that is exactly
// the misalignment this rule exists to stop. Deleting it is also wrong: §3
// 安全不可降級. So it moves to cautions_en, where it stands on its own, and
// contraindications_en is left empty.
if ((r.contraindications_en || []).length && r.contraindications_en.length !== ZH.contra.length) {
  r.cautions_en = [...new Set([...(r.cautions_en || []), ...r.contraindications_en])];
  r.contraindications_en = [];
  r.field_sources.cautions_en = ["既有安全敘述，因無法與中文逐條配對而移至此欄（scripts/curate-sample-formula.js）"];
}
r.formula_family = ZH.family.map((f) => ({ ...f, source: CITE }));
r.compare_with = ZH.compare;
// 現代應用 kept in its OWN field, not merged into CloudTCM's modern_diseases_zh
// (§0 — that list stays untouched, and mixing a curriculum list into a scraped
// one would make neither citable).
r.applications_zh = ZH.applications;
r.applications_en = EN.applications;
r.modern_research_zh = ZH.research;
r.modern_research_en = EN.research;
r.administration_zh = ZH.administration;
r.administration_en = EN.administration;

for (const x of ZH.roles) {
  const c = comp.find((c) => String(c.herb_zh).trim() === x.herb);
  c.role_zh = x.role;
  c.role_en = { 君: "Chief", 臣: "Deputy", 佐: "Assistant", 使: "Envoy" }[x.role];
  // Do not overwrite the line rescued from pattern_indications_zh; append the
  // curriculum's role reasoning as its own field instead (§0).
  c.role_reason_zh = x.in_formula;
}

r.field_sources = r.field_sources || {};
for (const f of ["actions_zh", "actions_en", "pattern_indications_zh", "pattern_indications_en",
  "tongue_zh", "tongue_en", "pulse_zh", "pulse_en", "preparation_zh", "preparation_en",
  "ba_fa_zh", "exam_pearl", "contraindications_zh", "formula_family", "compare_with", "composition"]) {
  r.field_sources[f] = [CITE];
}
for (const f of ["applications_zh", "applications_en", "modern_research_zh", "modern_research_en",
  "administration_zh", "administration_en"]) {
  r.field_sources[f] = [CITE2];
}
r.review_status = "draft";

console.log(`樣板卡：${r.name_zh}（${r.pinyin}）\n`);
console.log(`  八法          ${r.ba_fa_zh} / ${r.ba_fa_en}`);
console.log(`  考綱          ${r.on_board_list ? "★ Appendix C 官方應試方劑" : "不在考綱表"}`);
console.log(`  君臣佐使      ${ZH.roles.map((x) => `${x.role}${x.herb}`).join(" ")}`);
console.log(`  功效          ${ZH.actions.length} 條（中英成對）`);
console.log(`  主治          ${ZH.indications.length} 條（中英成對）`);
console.log(`  舌脈          ${ZH.tongue} · ${ZH.pulse}`);
console.log(`  方劑家族      ${ZH.family.length} 個衍生方`);
console.log(`  類方對比      ${ZH.compare.length} 組`);
console.log(`  現代應用      ${ZH.applications.length} 條（中英成對，來自 Comprehensive）`);
console.log(`  現代藥理      ${ZH.research.length} 條（中英成對）`);
console.log(`  服法          ${ZH.administration}`);
console.log(`  禁忌          ${ZH.contra.length} 條`);
console.log(`  逐欄來源      ${Object.keys(r.field_sources).length} 欄`);
console.log(`\n✅ 每一句英文都在 ${CITE} 的頁面文字裡找得到；中英逐條對齊；角色都對應既有組成`);

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");

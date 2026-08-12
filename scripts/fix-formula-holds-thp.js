// 方劑 CI 阻擋缺陷清理:6 筆(F5/F6/F8/F12)。
// 紀律同 scripts/curate-misfile-move-batch5.js:
//   1) 重新序列化必須逐字元相同,否則拒寫;
//   2) assertSurvival —— 動過的每一條原文都必須仍存在於該筆記錄裡(只搬不刪);
//   3) §0 guard —— 未列入 MOVED_FIELDS 的欄位不得消失或變短,未列入 TOUCHED 的記錄不得被改。
//
// 逐筆理由與來源見各區塊註解。查不到來源的洞(葛根湯君臣佐使、大建中湯君臣佐使、
// 柴胡加龍骨牡蠣湯組成、烏梅丸功效收斂、蒿芩清膽湯碧玉散)一律不動,留給 Ting。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";

const THP = "curriculum/formulas/臺灣中藥典第四版英文版.md#p.635（THP 433 葛根湯濃縮製劑〔顆粒、散〕官方組成，出典《傷寒論》）";
const COMPREHENSIVE = "curriculum/formulas/Herbal Formulations Comprehensive.docx.md";
const NCBAHM_AD = "curriculum/formulas/NCBAHM_2026_AD_181_Formulas_Name_Actions_Syndromes.md#010 Bei Mu Gua Lou San";
const CARD191 = "curriculum/formulas/20_Formula_Cards_191-201_未分類-考點與補充劑.md#191 良附丸（Bastyr/Chenoweth 課件 composition/role evidence）";
const AD_INDEX = "American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)";

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const getRec = (id) => doc.records.find((x) => x.id === id);
const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const srcNote = (r, fields, note) => {
  r.field_sources = r.field_sources || {};
  for (const f of fields) {
    const cur = r.field_sources[f];
    const arr = Array.isArray(cur) ? cur : cur ? [cur] : [];
    r.field_sources[f] = [...new Set([...arr, note])];
  }
};
const appendNote = (r, key, text) => {
  r[key] = [typeof r[key] === "string" ? r[key] : "", text].filter(Boolean).join("\n");
};
const assertSurvival = (id, r, originals) => {
  const after = JSON.stringify(r);
  const lost = originals.filter((s) => s && !after.includes(JSON.stringify(String(s)).slice(1, -1)));
  if (lost.length) die(`${id} 遺失 ${lost.length} 條:\n  ` + lost.map((s) => String(s).slice(0, 60)).join("\n  "));
};
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));

// ── 葛根湯 F6 ────────────────────────────────────────────────────────────────
// 這筆是「匯入時接錯方」:American Dragon 201 方索引裡根本沒有 GE GEN TANG 這一頁,
// 只有 SHENG MA GE GEN TANG(升麻葛根湯)。匯入腳本用方名子字串比對,把升麻葛根湯
// 整套內容(組成 升麻/葛根/甘草/赤芍/生薑、功效、主治「麻疹初起」)灌進了葛根湯。
// 證據三條:
//   (1) curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md
//       只有 1134 行 SHENG MA GE GEN TANG,沒有 GE GEN TANG;
//   (2) 同一套 pattern_focus_en / ad_syndromes_en 逐字出現在 formula.sheng_ma_ge_gen_tang,
//       而且那筆的君臣佐使已對過 方剂学汇总 Table47-48 —— 內容在正確的家已經完整存在;
//   (3) 本筆自己的 formula_song_zh「葛根湯內麻黃黃,桂芍甘草薑棗藏」與 clinical_use_note
//       所引的 THP 433 官方組成,兩者都指向另一組七味藥。
// 因此:組成改為《臺灣中藥典》第四版官方組成(有官方劑量),被接錯的內容全文搬進
// correction_note 保存,並註明正本在 formula.sheng_ma_ge_gen_tang。
// ⚠️ 君臣佐使不補:全 repo 找不到葛根湯的君臣佐使來源(課件 3rd group 只教
//    [Name, Ingredients, Actions],無 hierarchy),不自己指派 —— 留 worklist 給 Ting。
{
  const id = "formula.ge_gen_tang";
  const r = getRec(id);
  const comp = r.composition || [];
  if (comp.length !== 5 || comp[0].herb_zh !== "升麻" || comp[1].herb_zh !== "葛根") die(`${id} 組成錨點不符`);
  if (!String(r.composition_suspect || "").trim()) die(`${id} 預期 composition_suspect 存在`);
  if (!String(r.clinical_use_note || "").includes("THP 433")) die(`${id} clinical_use_note 未引 THP 433`);

  const A = r.actions_zh || [], P = r.pattern_indications_zh || [];
  const AE = r.actions_en || [], PE = r.pattern_indications_en || [];
  const PF = r.pattern_focus_en || [], AS = r.ad_syndromes_en || [];
  const originals = [
    ...A, ...P, ...AE, ...PE, ...PF, ...AS,
    ...comp.flatMap((c) => [c.herb_zh, c.name_en, c.in_formula_zh, c.in_formula_en, c.dose_g,
      c.pharmaceutical_latin, c.role_zh, c.herb_id, c.pinyin, c.pinyin_toned]),
  ].filter(Boolean);

  // 拼音一律從中藥庫查(憲法 8:pinyin 無聲調,聲調只放 pinyin_toned),不自己寫。
  const canon = JSON.parse(fs.readFileSync("data/herbs/herb_canon_shortlist.json", "utf8"));
  const canonById = new Map((canon.records || canon).map((h) => [String(h.id), h]));

  // 《臺灣中藥典》第四版 p.635 / THP 433 —— 官方組成與官方劑量(每日總量 28.0 公克)
  const THP_COMP = [
    ["葛根", "herb.ge_gen", "Puerariae Radix", "Pueraria Root", "6.0g"],
    ["麻黃", "herb.ma_huang", "Ephedrae Herba", "Ephedra Stem", "4.5g"],
    ["桂枝", "herb.gui_zhi", "Cinnamomi Ramulus", "Cinnamon Twig", "3.0g"],
    ["白芍", "herb.bai_shao", "Paeoniae Radix Alba", "White Peony Root", "3.0g"],
    ["炙甘草", "herb.zhi_gan_cao", "Glycyrrhizae Radix et Rhizoma Praeparatum cum Melle", "Honey-fried Licorice Root", "3.0g"],
    ["生薑", "herb.sheng_jiang", "Zingiberis Rhizoma Recens", "Fresh Ginger Root", "4.5g"],
    ["大棗", "herb.da_zao", "Jujubae Fructus", "Jujube", "4.0g"],
  ];
  r.composition = THP_COMP.map(([zh, hid, latin, en, g]) => {
    const h = canonById.get(hid);
    if (!h) die(`${id} 中藥庫查無 ${hid}`);
    const row = {
      herb_id: hid, herb_zh: zh, name_zh: zh, herb_en: en, name_en: en,
      pharmaceutical_latin: latin,
      dose_range: g, decoction_reference_g: g, dose_g: g,
      classical_amount_text: "《臺灣中藥典》第四版 THP 433 官方組成（每日總服用量 28.0 公克）",
    };
    if (h.pinyin) row.pinyin = h.pinyin;
    if (h.pinyin_toned) row.pinyin_toned = h.pinyin_toned;
    return row;
  });

  appendNote(r, "correction_note",
    "【2026-08-11 接錯方修正】本筆原本帶的是「升麻葛根湯」的內容 —— American Dragon 201 方索引沒有 GE GEN TANG 條目，" +
    "只有 SHENG MA GE GEN TANG，匯入時以方名子字串比對接錯。原內容全文保存如下，正本仍完整存放於 formula.sheng_ma_ge_gen_tang：\n" +
    "・原組成：" + comp.map((c) => `${c.role_zh || "?"}／${c.herb_zh}／${c.herb_id}／${c.pinyin}／${c.pinyin_toned}／${c.name_en}／${c.pharmaceutical_latin}／${c.dose_g}／${c.in_formula_zh}／${c.in_formula_en}`).join("；") + "\n" +
    "・原功效中文：" + A.join("、") + "\n" +
    "・原功效英文：" + AE.join(" / ") + "\n" +
    "・原主治中文：" + P.join("、") + "\n" +
    "・原主治英文：" + PE.join(" / ") + "\n" +
    "・原 pattern_focus_en / ad_syndromes_en：" + [...new Set([...PF, ...AS])].join(" / ") + "\n" +
    "組成改依《臺灣中藥典》第四版 p.635（THP 433）官方組成與官方劑量填入，出典《傷寒論》。" +
    "⚠️ 君臣佐使未填：全 repo 查無葛根湯的君臣佐使來源（課件把葛根湯列在 3rd group，只教 Name/Ingredients/Actions，無 hierarchy），不自行指派，待 Ting 指認。" +
    "⚠️ 功效與主治暫時留空：原內容既然是別的方的，就不能留在這裡；葛根湯自己的功效／主治在 repo 內查無來源，依憲法「查不到就留空」。");

  r.actions_zh = []; r.actions_en = [];
  r.pattern_indications_zh = []; r.pattern_indications_en = [];
  r.pattern_focus_en = []; r.ad_syndromes_en = [];
  delete r.composition_suspect;

  // 假來源必須撤掉:AD 沒有這一頁,不能掛 AD;欄位已無內容者不得掛來源(§4)。
  if (r.field_sources) {
    delete r.field_sources.actions_zh;
    delete r.field_sources.pattern_indications_zh;
    // composition 現在 100% 出自 THP;原本掛的 AD 來源指向的是已搬進 correction_note
    // 的升麻葛根湯組成,留著就是掛一個這個欄位裡不存在的來源(§4)。
    delete r.field_sources.composition;
  }
  srcNote(r, ["composition"], THP);
  r.source_classic = String(r.source_classic || "").trim() || "《傷寒論》";
  r.review_status = "draft";

  assertSurvival(id, r, originals);
  console.log("✓ 葛根湯        組成 5(升麻葛根湯誤植)→ 7(THP 433 官方組成+官方劑量);誤植內容全文存 correction_note;君臣佐使留空待 Ting");
}

// ── 杞菊地黃丸 F8 ────────────────────────────────────────────────────────────
// actions 9 條超過上限 8。第 5-9 條「增強吞噬細胞活性/促進淋巴細胞轉化/促進免疫球蛋白
// 生成/防輻射損傷血小板/抗化學性肝損傷」是現代藥理指標,不是中醫功效 —— AD 把它們
// 併在 Formula Actions 底下,屬教訓 1 的錯層。搬到 modern_research_zh/en(§1 第 13 區,
// js/knowledge.js:1070 已渲染),中英 5:5 對齊。功效剩 4 條,F8 解除。
{
  const id = "formula.qi_ju_di_huang_wan";
  const r = getRec(id);
  const A = r.actions_zh || [], AE = r.actions_en || [];
  if (A.length !== 9 || AE.length !== 9) die(`${id} 功效條數不符(${A.length}/${AE.length})`);
  if (A[4] !== "增強吞噬細胞活性" || A[8] !== "抗化學性肝損傷") die(`${id} 錨點不符`);
  if (!AE[4].startsWith("Increases phagocytic") || !AE[8].startsWith("Protects against Liver damage")) die(`${id} 英文錨點不符`);
  if ("modern_research_zh" in r || "modern_research_en" in r) die(`${id} modern_research 已存在,需先人工合併`);
  const originals = [...A, ...AE];

  r.modern_research_zh = A.slice(4);
  r.modern_research_en = AE.slice(4);
  r.actions_zh = A.slice(0, 4);
  r.actions_en = AE.slice(0, 4);
  srcNote(r, ["modern_research_zh", "modern_research_en"], AD_INDEX + " —— 原列於 actions 第 5-9 條，屬藥理指標非中醫功效，2026-08-11 錯層搬移歸位");

  assertSurvival(id, r, originals);
  console.log("✓ 杞菊地黃丸    功效 9 → 4(中英同步);第 5-9 條藥理指標搬入 modern_research_zh/en 5:5 對齊");
}

// ── 失笑散 F12 ───────────────────────────────────────────────────────────────
// 組成第 3 味 herb_zh 是「—」、name_en 是「Wine or vinegar」—— 那是送服的藥引(服法),
// 不是方中藥味,所以中藥庫永遠查不到它。搬到 administration_zh/en
// (js/knowledge.js:1320 就印在組成表下方「服法 Administration」,不會變成隱形欄位)。
{
  const id = "formula.shi_xiao_san";
  const r = getRec(id);
  const comp = r.composition || [];
  if (comp.length !== 3) die(`${id} 組成條數不符(${comp.length})`);
  const v = comp[2];
  if (v.herb_zh !== "—" || v.name_en !== "Wine or vinegar") die(`${id} 藥引錨點不符`);
  if (String(r.administration_zh || "").trim() || String(r.administration_en || "").trim()) die(`${id} administration 已有內容,需先人工合併`);
  const originals = [v.herb_zh, v.name_en, v.in_formula_en, v.in_formula_zh, v.pharmaceutical_latin, v.dose_g, v.role_zh];

  r.composition = comp.slice(0, 2);
  r.administration_en = "Wine or vinegar — " + v.in_formula_en;
  r.administration_zh = "以酒或醋為藥引送服。（原資料把「Wine or vinegar」列為組成第 3 味、herb_zh 寫成「—」、role_zh「" +
    v.role_zh + "」、劑量「" + v.dose_g + "」、原文註「" + v.in_formula_zh + "」；藥引屬服法不屬方中藥味，2026-08-11 搬移歸位，組成 3 味 → 2 味。）";
  srcNote(r, ["administration_zh", "administration_en"], AD_INDEX + " —— 原列為 composition 第 3 味「Wine or vinegar」，屬服法藥引，2026-08-11 錯層搬移歸位");

  assertSurvival(id, r, originals);
  console.log("✓ 失笑散        組成 3 → 2(五靈脂、蒲黃);藥引「Wine or vinegar」搬入 administration_zh/en");
}

// ── 良附丸 F12 ───────────────────────────────────────────────────────────────
// 組成第 3 味 herb_zh 是拼音「Jiang Shi」(而且 _zh 欄位裡放英文本身就違反紅線 5),
// 中藥庫查無。課件 20_Formula_Cards_191-201 的 Bastyr/Chenoweth composition/role
// evidence 只列兩味:Chief 高良薑、Deputy 香附 —— 第 3 味出自 AD 表,是製丸/送服用的
// 薑(汁),不是課件認定的方中藥味。搬到 administration_zh/en,並在文字裡標明
// 「Jiang Shi」到底是薑汁還是乾薑,repo 內查無定論,不臆測。
{
  const id = "formula.liang_fu_wan";
  const r = getRec(id);
  const comp = r.composition || [];
  if (comp.length !== 3) die(`${id} 組成條數不符(${comp.length})`);
  const v = comp[2];
  if (v.herb_zh !== "Jiang Shi") die(`${id} 錨點不符`);
  if (comp[0].herb_zh !== "高良薑" || comp[1].herb_zh !== "香附") die(`${id} 前兩味不符`);
  if (String(r.administration_zh || "").trim() || String(r.administration_en || "").trim()) die(`${id} administration 已有內容,需先人工合併`);
  const originals = [v.herb_zh, v.name_en, v.in_formula_en, v.in_formula_zh, v.pharmaceutical_latin, v.dose_g, v.role_zh];

  r.composition = comp.slice(0, 2);
  r.administration_en = "Ginger (AD lists as “Jiang Shi”, Rz. Zingiberis, " + v.dose_g + ") — " + v.in_formula_en +
    " Used as the pill-making / delivery vehicle; the Bastyr–Chenoweth course composition table lists only Chief Gao Liang Jiang and Deputy Xiang Fu.";
  r.administration_zh = "以薑為藥引／製丸用（原資料把「Jiang Shi」列為組成第 3 味，role_zh「" + v.role_zh + "」、劑量「" + v.dose_g +
    "」、Rz. Zingiberis、原文註「" + v.in_formula_zh + "」）。課件 Bastyr/Chenoweth 的君臣表只列高良薑（君）與香附（臣）兩味，" +
    "故第 3 味 2026-08-11 搬入服法欄，組成 3 味 → 2 味。⚠️「Jiang Shi」究竟指薑汁或乾薑，repo 內查無定論，未指派 herb_id，待 Ting 指認。";
  srcNote(r, ["administration_zh", "administration_en"], CARD191 + "；" + AD_INDEX);
  srcNote(r, ["composition"], CARD191);

  assertSurvival(id, r, originals);
  console.log("✓ 良附丸        組成 3 → 2(高良薑君、香附臣，與課件君臣表一致);「Jiang Shi」搬入 administration_zh/en");
}

// ── 貝母瓜蔞散 F5 ────────────────────────────────────────────────────────────
// pattern_indications_en 整個缺。課件 Herbal Formulations Comprehensive 有 Indications
// 原文一句,照抄成 1 條,與現有 1 條中文維持 1:1(不製造新的中英未對齊)。
// NCBAHM/AD 的 3 條證型放進 pattern_focus_en(本來就是空的,且是其他方存 AD 證型的欄位)。
// ⚠️ pattern_indications_zh 現在是樣板句「貝母瓜蔞散主治證候」(方名+主治證候),
//    那是佔位字串不是內容;repo 內查無中文主治來源,不硬翻,原字串保留待 Ting 覆寫。
{
  const id = "formula.bei_mu_gua_lou_san";
  const r = getRec(id);
  const P = r.pattern_indications_zh || [];
  if (P.length !== 1 || P[0] !== "貝母瓜蔞散主治證候") die(`${id} 主治錨點不符`);
  if ((r.pattern_indications_en || []).length) die(`${id} 預期 pattern_indications_en 為空`);
  if ((r.pattern_focus_en || []).length) die(`${id} 預期 pattern_focus_en 為空`);

  r.pattern_indications_en = [
    "LU dry-phlegm causing cough — dry cough, or cough with deep-seated, viscous, difficult-to-expectorate sputum, wheezing, dry & sore throat",
  ];
  r.pattern_focus_en = [
    "Phlegm-Heat with dryness in Lung",
    "Phlegm-Dryness in Lungs",
    "Lung Yin deficiency with Phlegm-Fire",
  ];
  r.source_classic = String(r.source_classic || "").trim() || "《醫學心悟》";
  srcNote(r, ["pattern_indications_en"], COMPREHENSIVE + "（Bei Mu Gua Lou San 條目 Indications 原文）");
  srcNote(r, ["pattern_focus_en"], NCBAHM_AD);
  srcNote(r, ["source_classic"], COMPREHENSIVE + "（Source: Yi Xue Xin Wu）");
  appendNote(r, "composition_source_note_zh",
    "⚠️ pattern_indications_zh 目前是樣板佔位句「貝母瓜蔞散主治證候」（方名＋主治證候），不是真內容；" +
    "2026-08-11 依課件補上英文主治，中文主治 repo 內查無來源，不硬翻，待 Ting 覆寫。");

  assertSurvival(id, r, P);
  console.log("✓ 貝母瓜蔞散    pattern_indications_en 0 → 1(課件 Indications 原文，與中文 1:1);pattern_focus_en 0 → 3(NCBAHM/AD 證型);出典補《醫學心悟》");
}

// ── 固沖湯 F5 ────────────────────────────────────────────────────────────────
// pattern_indications_en 整個缺,而 actions_en 第 3 條「Treats flooding and spotting due
// to Spleen/Kidney Deficiency」根本是主治不是功效(教訓 1 的錯層)。把它搬到
// pattern_indications_en,功效同步收成 2:2,主治 1:1。它的中文搭檔「於與於脾/腎」是
// 匯入時壞掉的殘字,不當內容搬,原字串保存在註記欄。
{
  const id = "formula.gu_chong_tang";
  const r = getRec(id);
  const A = r.actions_zh || [], AE = r.actions_en || [], P = r.pattern_indications_zh || [];
  if (A.length !== 3 || AE.length !== 3) die(`${id} 功效條數不符`);
  if (AE[2] !== "Treats flooding and spotting due to Spleen/Kidney Deficiency") die(`${id} 錨點不符`);
  if (P.length !== 1 || P[0] !== "固沖湯主治證候") die(`${id} 主治錨點不符`);
  if ((r.pattern_indications_en || []).length) die(`${id} 預期 pattern_indications_en 為空`);
  const originals = [...A, ...AE, ...P];

  r.pattern_indications_en = [AE[2]];
  r.actions_en = AE.slice(0, 2);
  r.actions_zh = A.slice(0, 2);
  r.source_classic = String(r.source_classic || "").trim() || "《醫學衷中參西錄》";
  srcNote(r, ["pattern_indications_en"], "原列於 actions_en 第 3 條（實為主治非功效），2026-08-11 錯層搬移歸位");
  srcNote(r, ["source_classic"], COMPREHENSIVE + "（Source: Yi Xue Zhong Zhong Can Xi Lu）");
  appendNote(r, "composition_source_note_zh",
    "⚠️ 2026-08-11 錯層搬移：actions_en 第 3 條「" + AE[2] + "」實為主治，已搬入 pattern_indications_en；" +
    "其中文搭檔「" + A[2] + "」是匯入時壞掉的殘字（非可讀內容），原字串保留於此不搬入主治。" +
    "⚠️ pattern_indications_zh 目前是樣板佔位句「固沖湯主治證候」，repo 內查無中文主治來源，不硬翻，待 Ting 覆寫。" +
    "⚠️ actions_zh 三條「" + A.join("、") + "」全為殘字，待 Ting 依《醫學衷中參西錄》重寫。");

  assertSurvival(id, r, originals);
  console.log("✓ 固沖湯        主治英文 0 → 1(由 actions_en 第 3 條錯層歸位);功效 3 → 2 中英對齊;出典補《醫學衷中參西錄》");
}

// ── §0 guard ────────────────────────────────────────────────────────────────
const MOVED_FIELDS = new Set([
  "composition", "composition_suspect", "actions_zh", "actions_en",
  "pattern_indications_zh", "pattern_indications_en", "pattern_focus_en", "ad_syndromes_en",
  "field_sources", "correction_note", "composition_source_note_zh",
  "administration_zh", "administration_en", "modern_research_zh", "modern_research_en",
  "source_classic", "review_status",
]);
const TOUCHED = new Set([
  "formula.ge_gen_tang", "formula.qi_ju_di_huang_wan", "formula.shi_xiao_san",
  "formula.liang_fu_wan", "formula.bei_mu_gua_lou_san", "formula.gu_chong_tang",
]);
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
console.log("\n6 筆改完,§0 guard 通過。未動:柴胡加龍骨牡蠣湯(組成無來源)、大建中湯(君臣佐使無來源)、烏梅丸(功效收斂需臨床判斷)、蒿芩清膽湯(碧玉散為方中方)。");

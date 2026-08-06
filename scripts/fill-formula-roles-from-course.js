// 君臣佐使 + 劑量:課件 Rank 表為正,課件沒有的劑量從 AD 來(Ting 2026-08-06 定案)。
//
// 來源:curriculum/herbs/方剂学汇总_extracted.md 的 Rank 表(表號逐方標注)。
// 轉錄規則(教訓 7:課件的標記就是答案,不用自己判):
//   Chief→君 Deputy→臣 Assistant→佐 Envoy→使;
//   Rank 欄空白 = 延續上一個角色(課件表格的排版慣例,白虎湯/小柴胡湯可驗證)。
//
// 明確不做的三首(照「不確定就留空」,列 worklist):
//   小承氣湯/調胃承氣湯 —— 課件只給組成與劑量(表61/80),沒給角色;AD 也沒有角色欄。
//   歸脾湯 —— 課件表 280 的 Rank 欄從 Envoy 之後全空白,字面讀會變成 8 味使藥,
//             明顯是排版遺漏而不是標記,機械轉錄會寫出錯的結構。
//
// 寫入紀律:
//   只填空的 role_zh / dose_range。既有值不同 → 記 CONFLICT 回報,絕不覆蓋(兩源並記)。
//   君藥 >2 → 拒寫該方(F7)。課件列的藥在卡片組成裡對不到 → 拒寫該方。
//   人參敗毒散是唯一的重建(組成只剩「人參」一味,方名截斷損毀,稽核 §3 核可):
//   整個 composition 由課件表 53 重建 12 味,composition_suspect 移除。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const SRC = (t) => `curriculum/herbs/方剂学汇总_extracted.md#Table${t}(Rank 表:君臣佐使/劑量)`;

// role: 君/臣/佐/使。amount 為課件 Amount 欄逐字轉錄(空字串 = 課件沒給)。
const COURSE = {
  "formula.ma_xing_shi_gan_tang": { table: 44, herbs: [
    { zh: "麻黃", role: "君", en: "Chief", amount: "4.5-12" },
    { zh: "石膏", role: "君", en: "Chief", amount: "18-48" },
    { zh: "杏仁", role: "臣", en: "Deputy", amount: "9" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "6" },
  ]},
  "formula.da_cheng_qi_tang": { table: 59, herbs: [
    { zh: "大黃", role: "君", en: "Chief", amount: "12" },
    { zh: "芒硝", role: "臣", en: "Deputy", amount: "9" },
    { zh: "枳實", role: "佐", en: "Assistant", amount: "12" },
    { zh: "厚朴", role: "佐", en: "Assistant", amount: "24" },
  ]},
  "formula.xiao_chai_hu_tang": { table: 92, herbs: [
    { zh: "柴胡", role: "君", en: "Chief", amount: "12-24" },
    { zh: "黃芩", role: "臣", en: "Deputy", amount: "9" },
    { zh: "半夏", role: "佐", en: "Assistant", amount: "9" },
    { zh: "生薑", role: "佐", en: "Assistant", amount: "9" },
    { zh: "人參", role: "佐", en: "Assistant", amount: "9" },
    { zh: "大棗", role: "佐", en: "Assistant", amount: "4枚" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "9" },
  ]},
  "formula.si_ni_san": { table: 103, herbs: [
    { zh: "柴胡", role: "君", en: "Chief", amount: "9-12" },
    { zh: "枳實", role: "臣", en: "Deputy", amount: "9-12" },
    { zh: "白芍", role: "佐", en: "Assistant", amount: "12-24" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "6-9" },
  ]},
  "formula.xiao_yao_san": { table: 107, herbs: [
    { zh: "柴胡", role: "君", en: "Chief", amount: "30/9" },
    { zh: "當歸", role: "臣", en: "Deputy", amount: "30/9" },
    { zh: "白芍", role: "臣", en: "Deputy", amount: "30/9" },
    { zh: "白朮", role: "佐", en: "Assistant", amount: "30/9" },
    { zh: "茯苓", role: "佐", en: "Assistant", amount: "30/9" },
    { zh: "甘草", role: "佐", en: "Assistant", amount: "15/6" },
    { zh: "生薑", role: "佐", en: "Assistant", amount: "" },
    { zh: "薄荷", role: "佐", en: "Assistant", amount: "" },
  ]},
  "formula.ban_xia_xie_xin_tang": { table: 115, herbs: [
    { zh: "半夏", role: "君", en: "Chief", amount: "12" },
    { zh: "乾薑", role: "臣", en: "Deputy", amount: "9" },
    { zh: "黃芩", role: "臣", en: "Deputy", amount: "9" },
    { zh: "黃連", role: "臣", en: "Deputy", amount: "3" },
    { zh: "人參", role: "佐", en: "Assistant", amount: "9" },
    { zh: "大棗", role: "佐", en: "Assistant", amount: "4枚" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "9" },
  ]},
  "formula.qing_hao_bie_jia_tang": { table: 187, herbs: [
    { zh: "鱉甲", role: "君", en: "Chief", amount: "15" },
    { zh: "青蒿", role: "君", en: "Chief", amount: "6" },
    { zh: "生地黃", role: "臣", en: "Deputy", amount: "12" },
    { zh: "知母", role: "臣", en: "Deputy", amount: "6" },
    { zh: "牡丹皮", role: "佐", en: "Assistant", amount: "9" },
  ]},
  "formula.si_ni_tang": { table: 221, herbs: [
    { zh: "附子", role: "君", en: "Chief", amount: "5-10" },
    { zh: "乾薑", role: "臣", en: "Deputy", amount: "6-9" },
    { zh: "甘草", role: "佐", en: "Assistant", amount: "6" },
  ]},
  "formula.si_jun_zi_tang": { table: 246, herbs: [
    { zh: "人參", role: "君", en: "Chief", amount: "3-9" },
    { zh: "茯苓", role: "臣", en: "Deputy", amount: "6-9" },
    { zh: "白朮", role: "佐", en: "Assistant", amount: "6-9" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "3-6" },
  ]},
  "formula.bu_zhong_yi_qi_tang": { table: 254, herbs: [
    { zh: "黃耆", role: "君", en: "Chief", amount: "18" },
    { zh: "人參", role: "臣", en: "Deputy", amount: "9" },
    { zh: "白朮", role: "臣", en: "Deputy", amount: "9" },
    { zh: "甘草", role: "臣", en: "Deputy", amount: "6" },
    { zh: "當歸", role: "佐", en: "Assistant", amount: "6" },
    { zh: "陳皮", role: "佐", en: "Assistant", amount: "6" },
    { zh: "升麻", role: "使", en: "Envoy", amount: "6" },
    { zh: "柴胡", role: "使", en: "Envoy", amount: "6" },
  ]},
  "formula.si_wu_tang": { table: 267, herbs: [
    { zh: "熟地黃", role: "君", en: "Chief", amount: "9-21" },
    { zh: "白芍", role: "臣", en: "Deputy", amount: "9-15" },
    { zh: "當歸", role: "佐", en: "Assistant", amount: "9-12" },
    { zh: "川芎", role: "使", en: "Envoy", amount: "3-6" },
  ]},
  "formula.liu_wei_di_huang_wan": { table: 298, herbs: [
    { zh: "熟地黃", role: "君", en: "Chief", amount: "240" },
    { zh: "山茱萸", role: "臣", en: "Deputy", amount: "120" },
    { zh: "山藥", role: "臣", en: "Deputy", amount: "120" },
    { zh: "茯苓", role: "佐", en: "Assistant", amount: "90" },
    { zh: "牡丹皮", role: "佐", en: "Assistant", amount: "90" },
    { zh: "澤瀉", role: "佐", en: "Assistant", amount: "90" },
  ]},
  "formula.suan_zao_ren_tang": { table: 343, herbs: [
    { zh: "酸棗仁", role: "君", en: "Chief", amount: "15-18" },
    { zh: "茯苓", role: "臣", en: "Deputy", amount: "6" },
    { zh: "知母", role: "臣", en: "Deputy", amount: "6-10" },
    { zh: "川芎", role: "佐", en: "Assistant", amount: "3-6" },
    { zh: "甘草", role: "使", en: "Envoy", amount: "3" },
  ]},
  "formula.gan_mai_da_zao_tang": { table: 351, herbs: [
    { zh: "浮小麥", role: "君", en: "Chief", amount: "9-15" },
    { zh: "甘草", role: "臣", en: "Deputy", amount: "9" },
    { zh: "大棗", role: "佐", en: "Assistant", amount: "10枚" },
  ]},
};

// 人參敗毒散:課件表 53 全表重建(12 味)。in_formula_en 為課件 Notes 欄原文(截要)。
const BAI_DU_SAN = { table: 53, herbs: [
  { zh: "羌活", py: "Qiang Huo", role: "君", en: "Chief", amount: "30", note: "Address w-c-d, alleviate pain all over [Upper & Lower body], both aromatic" },
  { zh: "獨活", py: "Du Huo", role: "君", en: "Chief", amount: "30", note: "Address w-c-d, alleviate pains all over" },
  { zh: "川芎", py: "Chuan Xiong", role: "臣", en: "Deputy", amount: "30", note: "Helps chiefs in treating pain, moving blood [Invigorates blood]; help chiefs in releasing exterior, lower fever" },
  { zh: "柴胡", py: "Chai Hu", role: "臣", en: "Deputy", amount: "30", note: "Helps chiefs in treating pains, moving blood; help chiefs in releasing exterior, lower fever" },
  { zh: "薄荷", py: "Bo He", role: "臣", en: "Deputy", amount: "少許", note: "Helps chiefs in treating pains, moving blood; help chiefs in releasing exterior, lower fever" },
  { zh: "桔梗", py: "Jie Geng", role: "佐", en: "Assistant", amount: "30", note: "Ascending and descending actions to regulate flow of chest qi, relieve chest discomfort [Guiding herb]" },
  { zh: "枳殼", py: "Zhi Ke", role: "佐", en: "Assistant", amount: "30", note: "Ascending and descending actions to regulate flow of chest qi, relieve chest discomfort" },
  { zh: "前胡", py: "Qian Hu", role: "佐", en: "Assistant", amount: "30", note: "Transform phlegm, strengthen Sp, release w-c-d – treat both root & branches" },
  { zh: "生薑", py: "Sheng Jiang", role: "佐", en: "Assistant", amount: "少許", note: "Transform phlegm, strengthen Sp, release w-c-d – treat both root & branches" },
  { zh: "人參", py: "Ren Shen", role: "佐", en: "Assistant", amount: "30", note: "Tonify qi to dispel pathogens; prevent relapses [Use Bai Ren Shen — tonify Qi without retaining pathogens]" },
  { zh: "茯苓", py: "Fu Ling", role: "佐", en: "Assistant", amount: "30", note: "Transform phlegm, strengthen Sp, release w-c-d; tonify qi to dispel pathogens" },
  { zh: "甘草", py: "Gan Cao", role: "使", en: "Envoy", amount: "15", note: "Envoy; with jie geng to soothe throat, with ren shen to boost qi" },
]};

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));

// 卡片藥名正規化:炙甘草/甘草、白芍藥/白芍、黃芪/黃耆 視為同一味。
const norm = (s) => String(s || "").replace(/^炙|^煨/, "").replace(/藥$/, "").replace(/芪/g, "耆");
const report = [];

for (const [id, spec] of Object.entries(COURSE)) {
  const r = doc.records.find((x) => x.id === id);
  if (!r) { report.push(`✗ ${id} 找不到記錄`); continue; }
  const comp = Array.isArray(r.composition) ? r.composition : [];
  const chiefs = spec.herbs.filter((h) => h.role === "君").length;
  if (chiefs > 2) { report.push(`✗ ${id} 課件轉錄有 ${chiefs} 味君藥 — 拒寫`); continue; }

  // 先全部配對,配不到就整方拒寫(不寫半套)。
  const pairs = [];
  let fail = null;
  for (const h of spec.herbs) {
    const c = comp.find((x) => norm(x.herb_zh) === norm(h.zh));
    if (!c) { fail = `課件藥「${h.zh}」在卡片組成對不到`; break; }
    pairs.push([h, c]);
  }
  if (fail) { report.push(`✗ ${id.replace("formula.", "")} ${fail} — 整方拒寫`); continue; }

  let roles = 0, doses = 0; const conflicts = [];
  for (const [h, c] of pairs) {
    if (!String(c.role_zh || "").trim()) { c.role_zh = h.role; c.role_en = h.en; roles++; }
    else if (String(c.role_zh).trim() !== h.role) conflicts.push(`${h.zh}: 卡片=${c.role_zh} 課件=${h.role}`);
    if (!String(c.dose_range || "").trim() && h.amount) { c.dose_range = `${h.amount}（課件）`; doses++; }
  }
  const extra = comp.filter((x) => !spec.herbs.some((h) => norm(h.zh) === norm(x.herb_zh))).map((x) => x.herb_zh);
  if (roles || doses) {
    r.field_sources = r.field_sources || {};
    r.field_sources.composition = [...new Set([...(r.field_sources.composition || []), SRC(spec.table)])];
  }
  report.push(`✓ ${id.replace("formula.", "").padEnd(24)} 角色+${roles} 劑量+${doses}` +
    (conflicts.length ? `  ⚠CONFLICT(未覆蓋): ${conflicts.join("; ")}` : "") +
    (extra.length ? `  課件未列(角色留空): ${extra.join("/")}` : ""));
}

// ---- 人參敗毒散重建 ----------------------------------------------------------
{
  const r = doc.records.find((x) => x.id === "formula.ren_shen_bai_du_san");
  const comp = Array.isArray(r.composition) ? r.composition : [];
  if (comp.length !== 1 || norm(comp[0].herb_zh) !== "人參") {
    report.push("✗ ren_shen_bai_du_san 組成不是預期的單味「人參」— 已被別人動過,拒寫重建");
  } else {
    r.composition = BAI_DU_SAN.herbs.map((h) => ({
      herb_zh: h.zh, pinyin: h.py, role_zh: h.role, role_en: h.en,
      dose_range: `${h.amount}（課件,散劑原方比例）`,
      in_formula_en: h.note,
    }));
    delete r.composition_suspect;
    r.composition_rebuilt_note = "組成原本只剩「人參」一味(方名截斷損毀,FORMULA_RESTORATION_AUDIT §3)。2026-08-06 由課件表 53 重建 12 味。";
    r.field_sources = r.field_sources || {};
    r.field_sources.composition = [SRC(BAI_DU_SAN.table)];
    report.push("✓ ren_shen_bai_du_san        重建 1→12 味(君2 臣3 佐6 使1)");
  }
}

// ---- 十全大補湯:黃芪→黃耆 正名 + AD 劑量 ------------------------------------
{
  const r = doc.records.find((x) => x.id === "formula.shi_quan_da_bu_tang");
  const c = (r.composition || []).find((x) => x.herb_zh === "黃芪");
  if (c) {
    c.herb_zh = "黃耆"; // 中藥庫正名(audit §0③:正簡體不一致,連結因此斷掉)
    if (!String(c.dose_range || "").trim()) c.dose_range = "6-10g（AD）";
    r.field_sources = r.field_sources || {};
    r.field_sources.composition = [...new Set([...(r.field_sources.composition || []),
      "American Dragon formula page (harvested 2026-08) — 黃耆劑量;黃芪→黃耆 為中藥庫正名"])];
    report.push("✓ shi_quan_da_bu_tang        黃芪→黃耆 + 劑量 6-10g（AD）");
  } else {
    report.push("— shi_quan_da_bu_tang        找不到「黃芪」— 可能已正名,略過");
  }
}

report.push("— xiao_cheng_qi_tang / tiao_wei_cheng_qi_tang  角色留空(課件表61/80只給組成劑量,AD無角色欄)→ worklist");
report.push("— gui_pi_tang                角色留空(課件表280 Rank欄爛版,字面讀=8味使藥)→ worklist");

// §0 guard(人參敗毒散的 composition 重建是稽核核可的唯一例外)。
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (r.id === "formula.ren_shen_bai_du_san" && (k === "composition" || k === "composition_suspect")) continue;
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (k === "field_sources" || k === "composition") continue;
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
  if (r.id !== "formula.ren_shen_bai_du_san") {
    const bc = (b.composition || []).length, rc = (r.composition || []).length;
    if (rc < bc) problems.push(`${r.id}.composition lost herbs`);
  }
}
if (problems.length) { console.error("REFUSING:\n  " + problems.join("\n  ")); process.exit(1); }

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log("君臣佐使批次(課件 Rank 表)\n");
for (const line of report) console.log("  " + line);

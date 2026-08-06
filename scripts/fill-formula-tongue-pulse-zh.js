// 方劑中文層 批次1:舌脈(tongue_zh / pulse_zh)。
//
// 對象:formula_restoration_worklist 的 30 首裡,有 tongue_en/pulse_en(AD 英文層,
// 2026-08-06 填入)但沒有中文的 27 首。舌脈的英文本來就是從中醫標準用語譯出去的,
// 這裡做的是回譯成標準詞(浮=superficial/floating、弦=wiry、細=thready…),
// 不是自由翻譯。
//
// 防呆(照 SP 批的做法,對不上就拒寫):
//   1. 每一筆都帶「翻譯當下看到的英文」(en_seen)。寫入前逐字比對卡片現值,
//      不同就跳過並回報 —— 絕不把譯文寫在已經變動的原文上。
//   2. 只填空欄。既有 _zh(麻黃湯、桂枝湯)一律不碰(§0 只加深不刪除)。
//   3. 寫檔前 §0 guard:任何既有欄位變短或消失就整批拒寫。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const SRC_NOTE = "譯自 tongue_en/pulse_en(American Dragon harvest 2026-08,scripts/fill-formula-tongue-pulse-zh.js 回譯為標準舌脈用語)";

// en_seen 必須與卡片上的英文完全一致(含大小寫與標點),否則該欄跳過。
const ROWS = [
  { id: "formula.ren_shen_bai_du_san",
    tongue_en: "Pale or Slightly purple or Purple spots; coating: White or thin, white, greasy",
    tongue_zh: "舌淡,或略紫、有紫斑;苔白,或薄白而膩",
    pulse_en: "Slippery or Slightly superficial or Superficial and soft or Slightly rough or Slow and Sof",
    pulse_zh: "脈滑,或略浮,或浮而濡,或略澀,或遲而濡" },
  { id: "formula.li_zhong_wan",
    tongue_en: "Pale, may be moist; coating: White or None",
    tongue_zh: "舌淡而潤;苔白或無苔",
    pulse_en: "Deep, weak and slow or Deep and thready or Big and weak",
    pulse_zh: "脈沉弱而遲,或沉細,或大而無力" },
  { id: "formula.sheng_mai_san",
    tongue_en: "Red and dry or Pink and dry; coating: Thin and dry",
    tongue_zh: "舌紅而乾,或淡紅而乾;苔薄而乾",
    pulse_en: "Deficient and rapid or Irregular and slow or",
    pulse_zh: "脈虛數,或遲而結代" },
  { id: "formula.tiao_wei_cheng_qi_tang",
    tongue_en: "Pink and dry with prickles; coating: Yellow or Black",
    tongue_zh: "舌淡紅而乾、有芒刺;苔黃或黑",
    pulse_en: "Deep, Excess and rapid or",
    pulse_zh: "脈沉實而數" },
  { id: "formula.gan_mai_da_zao_tang",
    tongue_en: "Red or pale red; coating: Scanty",
    tongue_zh: "舌紅或淡紅;苔少",
    pulse_en: "Thready and rapid",
    pulse_zh: "脈細數" },
  { id: "formula.bai_hu_tang",
    tongue_en: "Red tip and sides; coating: Yellow, dry or white",
    tongue_zh: "舌尖邊紅;苔黃燥或白",
    pulse_en: "Flooding and forceful or Large and forceless or Slippery and rapid",
    pulse_zh: "脈洪大有力,或大而無力,或滑數" },
  { id: "formula.qing_hao_bie_jia_tang",
    tongue_en: "Red; coating: Little",
    tongue_zh: "舌紅;苔少",
    pulse_en: "Thready and rapid",
    pulse_zh: "脈細數" },
  { id: "formula.xiao_cheng_qi_tang",
    tongue_en: "Dry with prickles; coating: Dark yellow and dry or Black and dry",
    tongue_zh: "舌乾而有芒刺;苔深黃而燥,或黑而燥",
    pulse_en: "Deep, Shi and rapid or Tenesmus Slippery and rapid",
    pulse_zh: "脈沉實而數;裡急後重者脈滑數" },
  { id: "formula.si_ni_san",
    tongue_en: "Red or pale; coating: Thin yellow or white or Greasy yellow or white",
    tongue_zh: "舌紅或淡;苔薄黃或薄白,或黃膩、白膩",
    pulse_en: "Wiry or Wiry and tight or Wiry and slippery",
    pulse_zh: "脈弦,或弦緊,或弦滑" },
  { id: "formula.ma_xing_shi_gan_tang",
    tongue_en: "Red; coating: Yellow or White",
    tongue_zh: "舌紅;苔黃或白",
    pulse_en: "Superficial and rapid or Slippery and rapid",
    pulse_zh: "脈浮數,或滑數" },
  { id: "formula.si_ni_tang",
    tongue_en: "Pale or Dark purple; coating: White and slippery",
    tongue_zh: "舌淡或暗紫;苔白滑",
    pulse_en: "Deep and thready or Deep and slow or Deep and faint",
    pulse_zh: "脈沉細,或沉遲,或沉微" },
  { id: "formula.suan_zao_ren_tang",
    tongue_en: "Pale or Red and dry",
    tongue_zh: "舌淡,或紅而乾",
    pulse_en: "Wiry and rapid or Thready and rapid or Thready and weak or Thready and tight",
    pulse_zh: "脈弦數,或細數,或細弱,或細緊" },
  { id: "formula.shi_quan_da_bu_tang",
    tongue_en: "Pale; coating: Thin and white",
    tongue_zh: "舌淡;苔薄白",
    pulse_en: "Thready and weak",
    pulse_zh: "脈細弱" },
  { id: "formula.da_cheng_qi_tang",
    tongue_en: "Pink with prickles or Red; coating: Yellow and dry or Black and dry",
    tongue_zh: "舌淡紅而有芒刺,或紅;苔黃燥或黑燥",
    pulse_en: "Deep, Excess and rapid or Slippery and rapid",
    pulse_zh: "脈沉實而數,或滑數" },
  { id: "formula.huang_lian_jie_du_tang",
    tongue_en: "Red; coating: Yellow",
    tongue_zh: "舌紅;苔黃",
    pulse_en: "Rapid and forceful",
    pulse_zh: "脈數而有力" },
  { id: "formula.chai_ge_jie_ji_tang",
    tongue_en: "Normal; coating: Thin and yellow",
    tongue_zh: "舌正常;苔薄黃",
    pulse_en: "Floating and slightly flooding",
    pulse_zh: "脈浮而微洪" },
  { id: "formula.si_wu_tang",
    tongue_en: "Pale; coating: Normal",
    tongue_zh: "舌淡;苔正常",
    pulse_en: "Thready and wiry or Thready and choppy",
    pulse_zh: "脈細弦,或細澀" },
  { id: "formula.si_jun_zi_tang",
    tongue_en: "Pale and flabby - may have teeth marks; coating: White",
    tongue_zh: "舌淡胖,或有齒痕;苔白",
    pulse_en: "Even, forceless and deficient",
    pulse_zh: "脈虛緩無力" },
  { id: "formula.jin_gui_shen_qi_wan",
    tongue_en: "Pale, may be swollen; coating: Thin, white and moist",
    tongue_zh: "舌淡胖;苔薄白而潤",
    pulse_en: "Deep, Deep and thready and/or Weak and slow",
    pulse_zh: "脈沉,或沉細,或弱而遲" },
  { id: "formula.sang_ju_yin",
    tongue_en: "Red tip; coating: Thin and yellow or white",
    tongue_zh: "舌尖紅;苔薄黃或薄白",
    pulse_en: "Superficial and rapid",
    pulse_zh: "脈浮數" },
  { id: "formula.yin_qiao_san",
    tongue_en: "Red tip; coating: Thin and yellow or white",
    tongue_zh: "舌尖紅;苔薄黃或薄白",
    pulse_en: "Superficial and rapid",
    pulse_zh: "脈浮數" },
  { id: "formula.xiao_yao_san",
    tongue_en: "Pink; coating: Thin white or yellow",
    tongue_zh: "舌淡紅;苔薄白或薄黃",
    pulse_en: "Wiry and Deficient or Wiry, tight and Deficient",
    pulse_zh: "脈弦而虛,或弦緊而虛" },
  { id: "formula.ban_xia_xie_xin_tang",
    tongue_en: "Normal or with a red tip; coating: Thin, yellow and greasy",
    tongue_zh: "舌正常或尖紅;苔薄黃而膩",
    pulse_en: "Wiry and rapid or Wiry, tight and rapid",
    pulse_zh: "脈弦數,或弦緊而數" },
  { id: "formula.long_dan_xie_gan_tang",
    tongue_en: "Red or Red edges; coating: Yellow or Yellow and greasy",
    tongue_zh: "舌紅或邊紅;苔黃或黃膩",
    pulse_en: "Wiry, Excess and rapid",
    pulse_zh: "脈弦實而數" },
  { id: "formula.xiao_chai_hu_tang",
    tongue_en: "Pink; coating: Thin and white",
    tongue_zh: "舌淡紅;苔薄白",
    pulse_en: "Wiry",
    pulse_zh: "脈弦" },
  { id: "formula.gui_pi_tang",
    tongue_en: "Pale, maybe swollen; coating: White",
    tongue_zh: "舌淡而胖;苔白",
    pulse_en: "Thready and weak or Thready and moderate",
    pulse_zh: "脈細弱,或細緩" },
  { id: "formula.liu_wei_di_huang_wan",
    tongue_en: "Red; coating: Little or None",
    tongue_zh: "舌紅;苔少或無苔",
    pulse_en: "Thready and rapid",
    pulse_zh: "脈細數" },
];

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}

const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));
let wrote = 0;
const report = [];

for (const row of ROWS) {
  const r = doc.records.find((x) => x.id === row.id);
  if (!r) { report.push(`✗ ${row.id} 找不到記錄`); continue; }
  const did = [], skipped = [];

  const put = (enField, zhField, enSeen, zhValue) => {
    if (r[zhField]) { skipped.push(`${zhField} 已有內容,不碰`); return; }
    if (r[enField] !== enSeen) {
      skipped.push(`${enField} 與翻譯所見不符 — 拒寫`);
      return;
    }
    r[zhField] = zhValue;
    r.field_sources = r.field_sources || {};
    r.field_sources[zhField] = [SRC_NOTE];
    did.push(zhField);
  };
  put("tongue_en", "tongue_zh", row.tongue_en, row.tongue_zh);
  put("pulse_en", "pulse_zh", row.pulse_en, row.pulse_zh);

  if (did.length) wrote++;
  report.push(`${did.length ? "✓" : "—"} ${row.id.replace("formula.", "").padEnd(24)} ${did.join(", ")}${skipped.length ? "  [" + skipped.join("; ") + "]" : ""}`);
}

// §0 guard:任何既有欄位變短或消失 → 整批拒寫。
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (k === "field_sources") continue;
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
}
if (problems.length) { console.error("REFUSING:\n  " + problems.join("\n  ")); process.exit(1); }

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log(`舌脈中文層:寫入 ${wrote}/${ROWS.length} 首\n`);
for (const line of report) console.log("  " + line);

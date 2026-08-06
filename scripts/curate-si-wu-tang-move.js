// 四物湯 錯層搬移(FORMULA_RESTORATION_AUDIT §6 的第一首示範)。
//
// 現況:36 條 CloudTCM 全文「同一份」複製在 actions_zh 與 pattern_indications_zh
// 兩欄(稽核 §5 同卡重複)。內容本身有價值,住錯地方而已。
//
// §0 的順序鐵律:先搬到對的欄位,再換掉原欄位。這支腳本一次做完兩步,
// 但寫檔前 assert:36 條原文每一條都逐字存在於搬移後的記錄裡 —— 少一條就
// process.exit(1),絕不寫檔。
//
// 分配表(index → 新家):
//   0,1,2,22-27        → chinese_depth_track.notes_zh      歷史、源流、臨床軼事
//   3-10               → chinese_depth_track.zhu_zhi_zh    病機與症狀展開
//   11-21              → chinese_depth_track.fang_yi_zh    立方旨意與逐味配伍(§1 區9 必填,本來是空的)
//   28,29,34           → applications_zh                   現代應用(CloudTCM 散文,與 AD 的 applications_en 並記,兩源分標)
//   30,35              → modern_research_zh                藥理(含註2)
//   31,32,33           → modifications_zh                  加減與劑量調整(31 有缺字「黃芪��藥物」,照 §0 保留,列 worklist)
//
// 之後:
//   actions_zh             → ["補血","調血"] 與 actions_en ["Tonify blood","Regulate blood"] 逐條對齊
//   pattern_indications_zh → 4 條辨證重點(由 3/6/7/9/10/11 濃縮;原文完整保留在 zhu_zhi_zh)
//
// 不加 field_sources.actions_zh:那是「已整理」開關,F7 會要求君臣佐使,
// 而四物湯的角色還沒從課件 Rank 表填(0/4)。等角色批次做完才開。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const ID = "formula.si_wu_tang";
const MOVE_NOTE = "CloudTCM 方劑頁(https://cloudtcm.com/formula/77)——原存於 actions_zh/pattern_indications_zh,2026-08-06 錯層搬移歸位(scripts/curate-si-wu-tang-move.js)";

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}

const r = doc.records.find((x) => x.id === ID);
if (!r) { console.error("找不到 " + ID); process.exit(1); }

const A = r.actions_zh;
if (!Array.isArray(A) || A.length !== 36) {
  console.error(`actions_zh 不是預期的 36 條(實際 ${Array.isArray(A) ? A.length : typeof A})— 內容已變動,拒寫`);
  process.exit(1);
}
// 兩欄必須真的是同一份,否則「收掉 pattern_indications_zh」會丟內容。
if (JSON.stringify(r.pattern_indications_zh) !== JSON.stringify(A)) {
  console.error("pattern_indications_zh 與 actions_zh 不是同一份 — 前提不成立,拒寫");
  process.exit(1);
}
// 錨點抽查:確認條目順序沒被動過(翻譯/分配是照這個順序做的)。
const anchors = { 0: "四物湯在中國社會", 11: "四物湯是針對「營血虛滯」", 31: "四物湯劑量加減方法", 34: "註1", 35: "註2" };
for (const [i, prefix] of Object.entries(anchors)) {
  if (!A[i].startsWith(prefix)) { console.error(`第 ${i} 條開頭不是「${prefix}」— 順序已變,拒寫`); process.exit(1); }
}

const pick = (...idx) => idx.map((i) => A[i]);

// ---- 搬 ---------------------------------------------------------------------
r.chinese_depth_track = r.chinese_depth_track || {};
const cdt = r.chinese_depth_track;
const joinPara = (arr) => arr.join("\n");

cdt.notes_zh = [cdt.notes_zh, joinPara(pick(0, 1, 2, 22, 23, 24, 25, 26, 27))].filter(Boolean).join("\n");
cdt.zhu_zhi_zh = [cdt.zhu_zhi_zh, joinPara(pick(3, 4, 5, 6, 7, 8, 9, 10))].filter(Boolean).join("\n");
cdt.fang_yi_zh = [cdt.fang_yi_zh, joinPara(pick(11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21))].filter(Boolean).join("\n");

r.applications_zh = pick(28, 29, 34);
r.modern_research_zh = [...(Array.isArray(r.modern_research_zh) ? r.modern_research_zh : []), ...pick(30, 35)];
r.modifications_zh = [...(Array.isArray(r.modifications_zh) ? r.modifications_zh : []), ...pick(31, 32, 33)];

// ---- 換 ---------------------------------------------------------------------
// actions_en 現值 ["Tonify blood","Regulate blood"](AD),中文逐條對齊。
if (JSON.stringify(r.actions_en) !== JSON.stringify(["Tonify blood", "Regulate blood"])) {
  console.error("actions_en 與翻譯所見不符 — 拒寫"); process.exit(1);
}
r.actions_zh = ["補血", "調血"];
// 辨證重點:由第 3/6/7/9/10/11 條濃縮(原文逐字保留在 zhu_zhi_zh)。
r.pattern_indications_zh = [
  "營血虛滯證——一切血虛及血行不暢(血滯)之證",
  "血虛失養:頭暈眼花、心悸失眠、面色無華、唇甲色淡",
  "婦人血虛:月經量少色淡、週期不準,甚則閉經、小腹疼痛",
  "孕期、產後血虛諸證",
];

r.field_sources = r.field_sources || {};
for (const f of ["applications_zh", "modern_research_zh", "modifications_zh",
  "chinese_depth_track.fang_yi_zh", "chinese_depth_track.zhu_zhi_zh", "chinese_depth_track.notes_zh"]) {
  r.field_sources[f] = [...new Set([...(r.field_sources[f] || []), MOVE_NOTE])];
}
r.field_sources.pattern_indications_zh = ["由錯層搬移前的 CloudTCM 全文第 3/6/7/9/10/11 條濃縮(原文逐字保留於 chinese_depth_track.zhu_zhi_zh)"];

// ---- assert:36 條原文一條不少 ----------------------------------------------
const after = JSON.stringify(r);
const lost = A.filter((s) => !after.includes(JSON.stringify(s).slice(1, -1)));
if (lost.length) {
  console.error(`REFUSING — 搬移後遺失 ${lost.length} 條原文:\n  ` + lost.map((s) => s.slice(0, 40)).join("\n  "));
  process.exit(1);
}
if (r.actions_zh.length !== r.actions_en.length) { console.error("actions 中英不對齊"); process.exit(1); }

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log("四物湯 錯層搬移完成:36 條全數歸位,0 條遺失");
console.log("  notes_zh 9 · zhu_zhi_zh 8 · fang_yi_zh 11 · applications_zh 3 · modern_research_zh 2 · modifications_zh 3");
console.log("  actions_zh 36→2(與 en 對齊) · pattern_indications_zh 36→4(濃縮,原文在 zhu_zhi_zh)");

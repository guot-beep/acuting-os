// 補上 3 首缺 CloudTCM 連結的方 —— 它們在站上是「異名同方」的頁面。
//
// 教訓 10 的紀律:推得出網址 ≠ 那頁存在 ≠ 內容出自那裡。所以這三個連結不是
// 猜的,是從 data/imports/cloudtcm/formula_url_map.json(先前抓好的 511 筆
// 站內索引)找出來,再逐味比對組成才採用:
//
//   理中丸     ←→ 理中湯   (id 217)  組成 4/4 完全相同(湯丸異劑型)
//   生脈散     ←→ 生脈飲   (id 95)   組成 3/3 完全相同(散飲異名)
//   金匱腎氣丸 ←→ 八味地黃丸(id 17)  組成 7/8 相同,差在 桂枝 vs 肉桂
//
// 最後一項是**真實的版本差異**,不是錯配:《金匱》原方用桂枝,後世通行本多作
// 肉桂。依「兩源不合就並記」,連結照收,差異寫進 cloudtcm_link_note,卡片上
// 標示出來,而不是假裝兩邊講同一件事。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const MAP = "data/imports/cloudtcm/formula_url_map.json";

const PLAN = [
  { id: "formula.li_zhong_wan", cloudName: "理中湯", expectId: 217,
    note: "CloudTCM 頁名為「理中湯」——與理中丸同方異劑型,組成四味完全相同" },
  { id: "formula.sheng_mai_san", cloudName: "生脈飲", expectId: 95,
    note: "CloudTCM 頁名為「生脈飲」——與生脈散同方異名,組成三味完全相同" },
  { id: "formula.jin_gui_shen_qi_wan", cloudName: "八味地黃丸", expectId: 17,
    note: "CloudTCM 頁名為「八味地黃丸」——即金匱腎氣丸,惟該頁作肉桂,本卡依《金匱》原方作桂枝,其餘七味相同" },
];

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const map = JSON.parse(fs.readFileSync(MAP, "utf8"));
const norm = (s) => String(s).replace(/^炙|^煨/, "").replace(/芪/g, "耆").replace("麥冬", "麥門冬");

for (const spec of PLAN) {
  const r = doc.records.find((x) => x.id === spec.id);
  if (!r) die("找不到 " + spec.id);
  if (r.cloudtcm_url) die(`${spec.id} 已有 cloudtcm_url — 前提不成立,不覆蓋`);
  const e = map[spec.cloudName];
  if (!e) die(`索引裡沒有「${spec.cloudName}」`);
  if (e.cloudtcm_id !== spec.expectId) die(`${spec.cloudName} id 是 ${e.cloudtcm_id},預期 ${spec.expectId}`);

  // 採用前逐味比對:允許的差異只有已寫進 note 的那一項(桂枝/肉桂)。
  const theirs = (typeof e.pageData.FormulaHerb_JSON === "string"
    ? JSON.parse(e.pageData.FormulaHerb_JSON) : e.pageData.FormulaHerb_JSON).map((h) => h.HerbNameCH);
  const ours = (r.composition || []).map((c) => c.herb_zh);
  const missing = ours.filter((o) => !theirs.some((t) => norm(t) === norm(o)));
  const extra = theirs.filter((t) => !ours.some((o) => norm(t) === norm(o)));
  const allowed = spec.id === "formula.jin_gui_shen_qi_wan" ? 1 : 0;
  if (missing.length > allowed || extra.length > allowed) {
    die(`${spec.id} 組成不符(我方獨有 ${missing.join("、") || "無"} / 對方獨有 ${extra.join("、") || "無"})— 不是同一方,拒寫`);
  }

  r.cloudtcm_url = e.page_url;
  r.cloudtcm_link_note = spec.note;
  r.field_sources = r.field_sources || {};
  r.field_sources.cloudtcm_url = [`data/imports/cloudtcm/formula_url_map.json(站內索引);採用前逐味比對組成,差異記於 cloudtcm_link_note`];
  console.log(`✓ ${r.name_zh.padEnd(8)} → ${e.page_url}  (${spec.cloudName};我方獨有 ${missing.join("、") || "無"} / 對方獨有 ${extra.join("、") || "無"})`);
}

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log("\n完成 —— 30 首 board 卡的 CloudTCM 連結由 27 → 30");

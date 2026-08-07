// 逐味「本方功效」中文層 —— 卡片 §1 第 4 區的核心欄位。
// Ting:「加上每一味要在這個方劑的功效, 中文就好」。
//
// 這一欄跟中藥卡的功效是兩件事(模板 §6):
//   中藥卡的杏仁 = 降肺氣;麻黃湯裡的杏仁 = 佐藥,與麻黃一宣一降。
//
// 來源:課件 Rank 表的 Notes 欄(逐方標表號),中文為該欄之對譯與整理。
// 教訓 7:課件怎麼寫就怎麼記,不自己判斷配伍角色。
// 課件 Notes 欄空白的味 → 留空並列報告,不從別的方推(六味地黃丸的三瀉不能
// 搬到金匱腎氣丸,那是推導不是來源)。
//
// 紀律:只填空的 in_formula_zh;既有值一律不碰。藥名對不上就整方拒寫。
const fs = require("fs");

const FILE = "data/herbs/formulas.json";
const SRC = (t) => `curriculum/herbs/方剂学汇总_extracted.md#Table${t}(Rank 表 Notes 欄;中文為對譯整理)`;

// 每一味:[藥名, 本方功效中文]。順序照課件表。
const PLAN = {
  "formula.ma_xing_shi_gan_tang": { table: 44, herbs: [
    ["麻黃", "宣肺散邪,開泄鬱閉之肺氣——肺熱重時減麻黃、加石膏,表證重時反之"],
    ["石膏", "清泄肺熱;大劑量石膏制約麻黃之溫性,使宣散不助熱"],
    ["杏仁", "助麻黃肅降肺氣,止咳平喘"],
    ["甘草", "潤肺止咳,調和諸藥"],
  ]},
  "formula.ren_shen_bai_du_san": { table: 53, herbs: [
    ["羌活", "散風寒濕,止周身疼痛(偏上半身),氣味俱厚"],
    ["獨活", "散風寒濕,止周身疼痛(偏下半身)"],
    ["川芎", "助君藥止痛、行血,並助解表退熱"],
    ["柴胡", "助君藥止痛、行血,並助解表退熱"],
    ["薄荷", "少許辛涼,助君藥行血止痛、透邪外達"],
    ["桔梗", "與枳殼一升一降,調暢胸中氣機,寬胸利膈(引經藥)"],
    ["枳殼", "與桔梗一升一降,行氣寬中,化中上二焦濕滯"],
    ["前胡", "化痰健脾,助解表散濕——標本兼治"],
    ["生薑", "化痰健脾,助解表散濕"],
    ["人參", "益氣扶正以祛邪,防邪復入(用白人參,補氣而不戀邪)"],
    ["茯苓", "化痰健脾滲濕,益氣以助祛邪"],
    ["甘草", "益氣扶正;配桔梗利咽,配人參補氣"],
  ]},
  "formula.da_cheng_qi_tang": { table: 59, herbs: [
    ["大黃", "苦寒瀉下,蕩滌腸胃積熱,推動腸蠕動(不宜久煎)"],
    ["芒硝", "鹹寒軟堅,助大黃潤燥軟便(不煎,溶於藥汁)"],
    ["枳實", "助君臣降中焦之氣,破氣消痞"],
    ["厚朴", "行氣除滿,助消積導滯,通中下二焦(腹脹甚者尤宜)"],
  ]},
  "formula.xiao_chai_hu_tang": { table: 92, herbs: [
    ["柴胡", "透泄少陽之邪,升散以暢氣機"],
    ["黃芩", "清降少陽之熱;與柴胡一升一降成對,共透邪外出"],
    ["半夏", "化痰和中,降逆止嘔(與生薑成對)"],
    ["生薑", "配半夏散寒止嘔"],
    ["人參", "扶助正氣,顧護中焦,防邪內傳陽明"],
    ["大棗", "益氣和中,調和諸藥"],
    ["甘草", "益氣扶正,調和諸藥"],
  ]},
  "formula.si_ni_san": { table: 103, herbs: [
    ["柴胡", "疏肝解鬱,升散透泄鬱熱;入肝膽,引肝氣由膽而出"],
    ["枳實", "降泄中焦壅滯,與柴胡一升一降"],
    ["白芍", "養肝斂陰,使行肝氣而不傷肝血陰"],
    ["甘草", "緩急止痛,調和諸藥"],
  ]},
  "formula.xiao_yao_san": { table: 107, herbs: [
    ["柴胡", "疏肝解鬱,恢復肝之條達(用量不過重,防升散傷肝血)"],
    ["當歸", "養血活血,柔肝助疏"],
    ["白芍", "養血柔肝斂陰"],
    ["白朮", "健脾益氣"],
    ["茯苓", "健脾滲濕"],
    ["甘草", "配白芍緩急止痛,益氣和中"],
    ["生薑", "辛散達鬱,降逆和中"],
    ["薄荷", "少許辛散,助柴胡透達肝經鬱滯"],
  ]},
  "formula.ban_xia_xie_xin_tang": { table: 115, herbs: [
    ["半夏", "散結消痞,降逆止嘔——痞結在中焦或上中之間"],
    ["乾薑", "溫中散寒(寒熱錯雜,寒熱並治)"],
    ["黃芩", "苦寒泄熱"],
    ["黃連", "苦寒泄熱"],
    ["人參", "補益中氣(配大棗顧護中焦)"],
    ["大棗", "顧護中焦之氣"],
    ["甘草", "補中,調和諸藥"],
  ]},
  "formula.qing_hao_bie_jia_tang": { table: 187, herbs: [
    ["鱉甲", "滋陰潛陽,退虛熱,入陰絡搜邪"],
    ["青蒿", "芳香透絡,引伏邪自陰分外出"],
    ["生地黃", "滋陰涼血,清血分之熱"],
    ["知母", "滋陰潤燥,清陰虛之熱"],
    ["牡丹皮", "涼血散瘀,泄陰分伏熱"],
  ]},
  "formula.si_ni_tang": { table: 221, herbs: [
    ["附子", "大辛大熱,溫腎壯陽、回陽救逆,通行十二經達於內外"],
    ["乾薑", "溫中散寒,與附子相須為用——附子走而不守,乾薑守而不走,合則溫三焦之陽"],
    ["甘草", "益氣強中,緩附薑辛熱燥烈之性並解其毒"],
  ]},
  "formula.li_zhong_wan": { table: 212, herbs: [
    ["乾薑", "溫中焦之陽,散裡寒"],
    ["人參", "補中氣與元氣,恢復脾胃運化"],
    ["白朮", "健運中焦,燥濕"],
    ["甘草", "和中,補益中焦"],
  ]},
  "formula.sheng_mai_san": { table: 258, herbs: [
    ["人參", "補元氣,生津液"],
    ["麥冬", "養陰潤肺,生津"],
    ["五味子", "斂肺止汗,防肺氣耗散,並能生津"],
  ]},
  "formula.si_jun_zi_tang": { table: 246, herbs: [
    ["人參", "補脾益氣(君臣對藥:人參配白朮)"],
    ["茯苓", "滲濕以助健脾"],
    ["白朮", "健脾燥濕"],
    ["甘草", "溫中和中,調和諸藥"],
  ]},
  "formula.bu_zhong_yi_qi_tang": { table: 254, herbs: [
    ["黃耆", "補中益氣,升舉下陷之中焦陽氣,固表止汗——補與升並行"],
    ["人參", "補脾益氣"],
    ["白朮", "補脾益氣"],
    ["甘草", "補脾益氣"],
    ["當歸", "配黃耆養血,使氣血雙補"],
    ["陳皮", "理氣和胃,助補藥消化,以其行散之性助清陽上升"],
    ["升麻", "升舉下陷之清陽(引陽明清氣上行)"],
    ["柴胡", "升舉下陷之清陽(引少陽清氣上行)"],
  ]},
  "formula.si_wu_tang": { table: 267, herbs: [
    ["熟地黃", "滋養血中之陰,補肝腎精血——最滋膩難化,為補血主藥"],
    ["白芍", "補血養陰斂陰;配熟地為強力血分之補"],
    ["當歸", "補血兼活血,養血中之陽"],
    ["川芎", "行血中之氣,暢通血脈、疏肝解鬱而止痛"],
  ]},
  "formula.gui_pi_tang": { table: 280, herbs: [
    ["人參", "補脾益氣"],
    ["黃耆", "補脾益氣,並能生血"],
    ["白朮", "補脾益氣,健運中焦"],
    ["茯神", "寧心安神,養心健脾"],
    ["酸棗仁", "寧心安神,養心健脾"],
    ["龍眼肉", "補血養心,安神"],
    ["木香", "理氣醒脾,使補而不滯"],
    ["甘草", "補脾益氣,調和諸藥"],
    ["當歸", "補血養心"],
    ["遠志", "寧心安神,養心健脾"],
    ["生薑", "調和營衛,助脾運"],
    ["大棗", "調和營衛,助脾運"],
  ]},
  "formula.liu_wei_di_huang_wan": { table: 298, herbs: [
    ["熟地黃", "滋腎陰、填精益髓(三補中最厚重)"],
    ["山茱萸", "補養肝腎,收澀以固精——治肝陰虛"],
    ["山藥", "補脾陰而固精——治脾氣虛"],
    ["茯苓", "淡滲脾濕,與山藥相配(三瀉之一)"],
    ["牡丹皮", "清泄肝火,與山茱萸相配(三瀉之一)"],
    ["澤瀉", "清泄腎濁與腎火,與熟地相配(三瀉之一)"],
  ]},
  "formula.suan_zao_ren_tang": { table: 343, herbs: [
    ["酸棗仁", "養心肝之血,安神(酸收)"],
    ["茯苓", "健脾寧心安神(可易茯神以增安神之力)"],
    ["知母", "滋陰清熱,潤燥"],
    ["川芎", "調暢肝血,行血以疏達(辛散);與酸棗仁酸收辛散並用"],
    ["甘草", "和中,調和諸藥"],
  ]},
  "formula.gan_mai_da_zao_tang": { table: 351, herbs: [
    ["浮小麥", "養心安神——重用以養心肝、除煩,其浮而澀之性專治神魂浮越"],
    ["甘草", "養心,和中緩急"],
    ["大棗", "益氣潤燥,助甘草緩急、調和陰陽"],
  ]},
  "formula.jin_gui_shen_qi_wan": { table: 289, herbs: [
    ["熟地黃", "三補之一:補益腎、肝、脾"],
    ["山茱萸", "三補之一:補益腎、肝、脾"],
    ["山藥", "三補之一:補益腎、肝、脾"],
    ["附子", "溫補命門真火,散寒除濕"],
    ["桂枝", "溫通經脈,利關節,通血脈"],
  ]},
};

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}
const die = (msg) => { console.error("REFUSING — " + msg); process.exit(1); };
const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));
// 藥名正規化走 glossary 的 herb_aliases(集中管理),不在腳本裡硬編異寫 ——
// 麥冬/麥門冬 這種對照將來別的批次也會遇到,寫在表裡才只需要修一次。
const ALIASES = JSON.parse(fs.readFileSync("data/config/formula_tag_glossary.json", "utf8")).herb_aliases || {};
const norm = (s) => {
  const t = String(s || "").replace(/^炙|^煨/, "").replace(/芪/g, "耆");
  return ALIASES[t] || t;
};

const report = [], pending = [];
let total = 0;

for (const [id, spec] of Object.entries(PLAN)) {
  const r = doc.records.find((x) => x.id === id);
  if (!r) die("找不到 " + id);
  const comp = Array.isArray(r.composition) ? r.composition : [];

  // 先全部配對,對不上就整方拒寫(不寫半套)
  const pairs = [];
  for (const [zh, text] of spec.herbs) {
    const c = comp.find((x) => norm(x.herb_zh) === norm(zh));
    if (!c) die(`${id} 課件藥「${zh}」在卡片組成對不到 — 整方拒寫`);
    if (text.length > 60) die(`${id} 「${zh}」本方功效 ${text.length} 字 — 這一欄是表格單格,過長`);
    pairs.push([c, text, zh]);
  }

  let n = 0;
  for (const [c, text] of pairs) {
    if (String(c.in_formula_zh || "").trim()) continue;
    c.in_formula_zh = text;
    n++;
  }
  if (n) {
    r.field_sources = r.field_sources || {};
    r.field_sources.composition = [...new Set([...(r.field_sources.composition || []), SRC(spec.table)])];
  }
  total += n;

  const missing = comp.filter((x) => !String(x.in_formula_zh || "").trim()).map((x) => x.herb_zh);
  report.push(`✓ ${id.replace("formula.", "").padEnd(24)} +${n} 味` + (missing.length ? `  ⏳ 課件無 Notes: ${missing.join("/")}` : ""));
  if (missing.length) pending.push(`${r.name_zh}: ${missing.join("、")}`);
}

// §0 guard
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (k === "field_sources" || k === "composition") continue;
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
  const bc = (b.composition || []).length, rc = (r.composition || []).length;
  if (rc < bc) problems.push(`${r.id}.composition lost herbs`);
}
if (problems.length) die(problems.join("\n  "));

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
console.log(`本方功效中文層:${total} 味寫入,${Object.keys(PLAN).length} 方\n`);
for (const line of report) console.log("  " + line);
if (pending.length) {
  console.log("\n待補(課件 Rank 表該味 Notes 欄空白,不從別方推導):");
  for (const p of pending) console.log("  ⏳ " + p);
}

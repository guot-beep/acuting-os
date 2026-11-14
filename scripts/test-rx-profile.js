#!/usr/bin/env node
/**
 * test-rx-profile.js — js/rx-profile.js(半年開藥回顧 + 科中採購建議,D37)的真值表。
 *
 * 開方字串的「形狀」照 2026-11-06 匯出實測的格式(中文份數 + 每次幾克一天幾次,英文翻譯接在後面;
 * 編號兩方;日期開頭;「單位原文未記」;「未記服法」),**內容全是虛構的組合**,不是任何病人的處方。
 *
 * 負控(該擋的要擋):中英並列不准重複計、日期「26日」不准當天數、「3 天後回診」不准當天數、
 * 單位未記不准換算克數、沒填天數不准算出罐數、自家病例不准進病歷線、沒日期的不准進期間。
 *
 *   node scripts/test-rx-profile.js
 */
"use strict";
const path = require("path");
const R = require(path.join(__dirname, "..", "js", "rx-profile.js"));
const H = require(path.join(__dirname, "..", "js", "herb-inventory.js"));

let pass = 0, fail = 0;
const ok = (cond, name, detail) => { if (cond) pass++; else { fail++; console.log(`FAIL ${name}${detail !== undefined ? `  → ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); } };
const near = (a, b, eps = 1e-6) => a !== null && b !== null && Math.abs(a - b) < eps;

// 虛構的知識庫查表(真的 app 用 ACUTING_KNOWLEDGE 的 name_zh / pinyin)
const KB = {
  "桂枝湯": ["formula", "formula.gui_zhi_tang"], "止嗽散": ["formula", "formula.zhi_sou_san"], "清燥救肺湯": ["formula", "formula.qing_zao_jiu_fei_tang"],
  "小柴胡湯": ["formula", "formula.xiao_chai_hu_tang"], "四逆湯": ["formula", "formula.si_ni_tang"], "麻黃湯": ["formula", "formula.ma_huang_tang"],
  "川烏": ["herb", "herb.chuan_wu"], "白芍": ["herb", "herb.bai_shao"], "甘草": ["herb", "herb.gan_cao"], "半夏": ["herb", "herb.ban_xia"], "黃芩": ["herb", "herb.huang_qin"],
  "gui zhi tang": ["formula", "formula.gui_zhi_tang"], "xiao chai hu tang": ["formula", "formula.xiao_chai_hu_tang"], "ban xia": ["herb", "herb.ban_xia"], "huang qin": ["herb", "herb.huang_qin"],
};
const resolve = (name) => { const h = KB[name] || KB[String(name).toLowerCase()]; return h ? { kind: h[0], id: h[1] } : null; };

// ── 1. 自由文字解析 ──
{
  const r = R.parseRxText("桂枝湯 40、止嗽散 40(原文 Zhi Sou San)、清燥救肺湯 20;每次 5 g,一天三次,熱水溶解,服前搖勻 Gui Zhi Tang 40, Zhi Sou San 40, Qing Zao Jiu Fei Tang 20; 5 g TID, dissolve in hot water", resolve);
  ok(r.language === "zh", "P1 中英並列 → 用中文", r.language);
  ok(r.prescriptions.length === 1, "P1 一張方(英文翻譯不另算一張)", r.prescriptions.length);
  const p = r.prescriptions[0] || { items: [] };
  ok(p.items.length === 3, "P1 三味,不是六味(負控:中英不准重複計)", p.items.map((i) => i.name));
  ok(near(p.gpd, 15), "P1 每次 5 g × 一天三次 = 15 g/天", p.gpd);
  ok(p.days === null, "P1 沒寫天數 → null(不補)", p.days);
  ok(near(p.items[0] && p.items[0].share, 0.4) && near(p.items[2] && p.items[2].share, 0.2), "P1 份數 40/40/20 → 比例 .4/.4/.2", p.items.map((i) => i.share));
  ok(p.items.every((i) => i.id), "P1 三味都對到知識庫 id", p.items.map((i) => i.id));
}
{
  const r = R.parseRxText("原文列兩方: 1. 桂枝湯 40、四逆湯 20、麻黃湯 20、製川烏 20;每次 5 g,一天三次 2. 桂枝湯 40、製川烏 20、白芍 20、甘草 20(未記服法) Two formulas as listed: 1. Gui Zhi Tang 40, Si Ni Tang 20; 5 g TID 2. Gui Zhi Tang 40, Bai Shao 20 (administration not recorded)", resolve);
  ok(r.prescriptions.length === 2, "P2 編號兩方 → 兩張(英文的 1. 2. 不另算)", r.prescriptions.length);
  const [a, b] = r.prescriptions;
  ok(a && near(a.gpd, 15), "P2 第一方 15 g/天", a && a.gpd);
  ok(b && b.gpd === null && b.doseUnknown === true, "P2 第二方「未記服法」→ 沒有每天總量", b && { gpd: b.gpd, doseUnknown: b.doseUnknown });
  const wu = a && a.items.find((i) => i.id === "herb.chuan_wu");
  ok(wu && wu.name === "製川烏", "P2 製川烏 → 對到 川烏 的 id,名字照原文", wu);
}
{
  const r = R.parseRxText("9/29/26 治食慾差:小柴胡湯 60、半夏 20、黃芩 20(單位原文未記) 9/29/26 For poor appetite: Xiao Chai Hu Tang 60, Ban Xia 20, Huang Qin 20", resolve);
  ok(r.prescriptions.length === 1, "P3 日期開頭 + 英文段 → 一張", r.prescriptions.length);
  const p = r.prescriptions[0] || {};
  ok(p.unitsUnknown === true && p.gpd === null, "P3 單位原文未記 → 不換算克數(負控)", { u: p.unitsUnknown, gpd: p.gpd });
  ok((p.items || []).length === 3, "P3 三味", (p.items || []).map((i) => i.name));
}
{
  const r = R.parseRxText("Xiao Chai Hu Tang 60, Ban Xia 20, Huang Qin 20; 5 g TID x 7 days", resolve);
  ok(r.language === "en" && r.prescriptions.length === 1, "P4 全英文才讀英文", r.language);
  const p = r.prescriptions[0] || {};
  ok(near(p.gpd, 15) && p.days === 7, "P4 5 g TID x 7 days → 15 g/天、7 天", { gpd: p.gpd, days: p.days });
  ok((p.items || []).every((i) => i.id), "P4 英文名對到 id", (p.items || []).map((i) => i.id));
}
{
  const p = (R.parseRxText("桂枝湯 50、白芍 50;每日 9 g,14天份", resolve).prescriptions[0]) || {};
  ok(near(p.gpd, 9) && p.days === 14, "P5 每日 9 g、14天份", { gpd: p.gpd, days: p.days });
}
{
  const p = (R.parseRxText("2026年11月26日 處方桂枝湯 50、白芍 50 每次 3 g 一天兩次", resolve).prescriptions[0]) || {};
  ok(p.days === null, "P6 「11月26日」不准當成 26 天(負控)", p.days);
  ok(near(p.gpd, 6), "P6 每次 3 g 一天兩次 = 6 g/天", p.gpd);
  ok((p.items || [])[0] && p.items[0].id === "formula.gui_zhi_tang" && p.items[0].name === "桂枝湯", "P6 「處方桂枝湯」砍前綴對到桂枝湯", (p.items || [])[0]);
}
{
  const p = (R.parseRxText("桂枝湯 100;每次 5 g 一天三次,3 天後回診", resolve).prescriptions[0]) || {};
  ok(p.days === null, "P7 「3 天後回診」不准當成開 3 天(負控)", p.days);
}
{
  ok(R.parseRxText("", resolve).prescriptions.length === 0, "P8 空字串 → 0 張");
  ok(R.parseRxText("每次 5 g,一天三次", resolve).prescriptions.length === 0, "P9 只有服法沒有藥 → 0 張(「每次」不是藥名)");
  ok(R.parseRxText("建議回家多休息", resolve).prescriptions.length === 0, "P10 沒有數字的文字 → 0 張");
}

// ── 2. 病歷 → 期間內的就診 ──
const note = (id, visitDate, formulaHerbs, extra) => Object.assign({ id, visitDate, formulaHerbs, formulaLinks: [], herbLinks: [] }, extra || {});
const CASES = [
  { id: "c1", patientCode: "PT-AAAAAA", clinicSite: "external", categoryPrimary: "musculoskeletal", sex: "F", birthYear: 1985, westernConditions: ["Low back pain"],
    soapNotes: [note("n1", "2026-10-02", "桂枝湯 40、止嗽散 40、清燥救肺湯 20;每次 5 g,一天三次"), note("n2", "2026-10-20", "桂枝湯 100;每次 5 g 一天三次")] },
  { id: "c2", patientCode: "PT-BBBBBB", clinicSite: "bastyr", categoryPrimary: "neuro_ent", sex: "M", birthYear: 2010,
    soapNotes: [note("n3", "2026-09-15", "", { formulaLinks: ["formula.xiao_chai_hu_tang"] }), note("n4", "2026-09-30", "")] },
  { id: "c3", patientCode: "PT-CCCCCC", clinicSite: "home", categoryPrimary: "gi_metabolic", soapNotes: [note("n5", "2026-10-05", "小柴胡湯 100;每次 5 g 一天三次")] },
  { id: "c4", patientCode: "PT-DDDDDD", clinicSite: "external", soapNotes: [note("n6", "", "桂枝湯 100;每次 5 g 一天三次"), note("n7", "2026-01-10", "桂枝湯 100;每次 5 g 一天三次")] },
  { id: "c5", patientCode: "PT-EEEEEE", clinicSite: "external", soapNotes: [note("n8", "2026-10-10", "桂枝湯 40、半夏 30、黃芩 30", { formulaLinks: ["formula.gui_zhi_tang"] })] },
];
const nameOf = (kind, id) => ({ "formula.xiao_chai_hu_tang": "小柴胡湯" }[id] || "");
const { visits, undated } = R.collectVisits(CASES, { from: "2026-05-16", to: "2026-11-14", today: "2026-11-14", excludeSites: ["home"], resolve, nameOf });
ok(!visits.some((v) => v.caseId === "c3"), "V1 自家病例不進病歷線(負控:它走藥櫃線)", visits.map((v) => v.caseId));
ok(undated === 1, "V2 沒有就診日期的 1 筆照實計數、不進期間", undated);
ok(!visits.some((v) => v.date === "2026-01-10"), "V3 期間外的不算(負控)");
ok(visits.length === 5, "V4 期間內 5 次就診(c1×2、c2×2、c5×1)", visits.length);
const n3 = visits.find((v) => v.caseId === "c2" && v.date === "2026-09-15");
ok(n3 && n3.prescribed && n3.prescriptions.length === 1 && n3.prescriptions[0].fromLinks && n3.prescriptions[0].items[0].name === "小柴胡湯", "V5 只有結構化方劑 id 的那診 → 只計張數的一張", n3 && n3.prescriptions);
const n4 = visits.find((v) => v.caseId === "c2" && v.date === "2026-09-30");
ok(n4 && !n4.prescribed, "V6 沒開藥的那診 → prescribed false", n4);
const n8 = visits.find((v) => v.caseId === "c5");
ok(n8 && n8.prescriptions.length === 1, "V7 文字已解析到的方劑 id 不再從 formulaLinks 重複補一張(負控)", n8 && n8.prescriptions.length);

// ── 3. 病例輪廓 ──
const mix = R.caseMix(visits);
ok(mix.patients === 3 && mix.visits === 5, "M1 3 位病人、5 次就診", { p: mix.patients, v: mix.visits });
ok(mix.prescribedPatients === 3 && mix.prescribedVisits === 4, "M2 有開藥:3 位、4 次", { p: mix.prescribedPatients, v: mix.prescribedVisits });
ok(mix.bySite.external === 2 && mix.bySite.bastyr === 1, "M3 依看診地點", mix.bySite);
ok(mix.byAge["40–59"] === 1 && mix.byAge["<18"] === 1 && mix.byAge["未填"] === 1, "M4 年齡層(2026 − 出生年)", mix.byAge);

// ── 4. 克數與罐數 ──
{
  const s = R.summarizeRx(visits, { bottleG: 200 });
  const gz = s.rows.find((r) => r.id === "formula.gui_zhi_tang");
  ok(gz && gz.rxCount === 3 && gz.patients === 2, "S1 桂枝湯:3 張方、2 位病人", gz && { rx: gz.rxCount, pt: gz.patients });
  ok(gz && gz.grams === null && gz.bottles === null && gz.noDays === 2, "S2 沒填天數 → 克數與罐數都是空(負控:不准自己猜天數)", gz);
  ok(s.rows[0].id === "formula.gui_zhi_tang", "S3 依張數排序,桂枝湯第一", s.rows.map((r) => r.name));
}
{
  const s = R.summarizeRx(visits, { bottleG: 200, rxDays: 7 });
  const gz = s.rows.find((r) => r.id === "formula.gui_zhi_tang");
  // n1:15 × .4 × 7 = 42;n2:15 × 1 × 7 = 105;n8:沒有服法 → 不算
  ok(gz && near(gz.grams, 147) && gz.gramRx === 2 && gz.noDose === 1, "S4 填 7 天 → 桂枝湯 42 + 105 = 147 g(n8 沒服法不算)", gz && { g: gz.grams, rx: gz.gramRx, noDose: gz.noDose });
  ok(gz && near(gz.bottles, 0.7) && gz.bottlesToBuy === 1, "S5 147 / 200 = 0.7 罐 → 買 1 罐", gz && { b: gz.bottles, buy: gz.bottlesToBuy });
  ok(gz && gz.bottlesPerYear === 2, "S6 一年 ≈ 147 × 365/182 = 294.8 g → 2 罐", gz && gz.bottlesPerYear);
  ok(gz && gz.slowForBottle === false, "S7 兩年用得完一罐 → 不標", gz && gz.slowForBottle);
  const qz = s.rows.find((r) => r.id === "formula.qing_zao_jiu_fei_tang");
  ok(qz && near(qz.grams, 21) && qz.slowForBottle === true, "S8 清燥救肺湯 21 g/半年 → 兩年 84 g < 200 g,標「開了會過期」", qz && { g: qz.grams, slow: qz.slowForBottle });
  const xc = s.rows.find((r) => r.id === "formula.xiao_chai_hu_tang");
  ok(xc && xc.grams === null && xc.noDose === 1, "S9 只有方劑 id 沒份數 → 只計張數", xc);
  ok(s.rxTotal === 4 && s.rxWithGrams === 2, "S10 4 張方裡 2 張算得出克數", { total: s.rxTotal, g: s.rxWithGrams });
}
{
  const s = R.summarizeRx(visits, { bottleG: 200, rxDays: 7, fallbackGpd: 10 });
  const bx = s.rows.find((r) => r.id === "herb.ban_xia");
  ok(bx && near(bx.grams, 21), "S11 沒寫服法的方用她填的每天克數(10 × .3 × 7 = 21 g)", bx && bx.grams);
  const u = R.summarizeRx(R.collectVisits([{ id: "u", patientCode: "PT-U", clinicSite: "external", soapNotes: [note("u1", "2026-10-01", "小柴胡湯 60、半夏 20、黃芩 20(單位原文未記)")] }],
    { from: "2026-05-16", to: "2026-11-14", excludeSites: ["home"], resolve }).visits, { rxDays: 7, fallbackGpd: 10 });
  ok(u.rows.every((r) => r.grams === null), "S12 單位原文未記 → 就算填了每天克數也不換算(負控)", u.rows.map((r) => r.grams));
}

// ── 5. 設定與提醒 ──
{
  const s = R.reviewSettings({ bottleG: "abc", rxDays: "0", fallbackGpd: "" });
  ok(s.bottleG === 200 && s.rxDays === "" && s.fallbackGpd === "", "R1 不合法的設定 → 預設 200 g;0 與空字串 = 還沒填", s);
  ok(R.reminderState({}, "2026-11-14").due === true, "R2 從沒看過 → 現在就提醒");
  const a = R.reminderState({ lastReviewedAt: "2026-05-01" }, "2026-11-14");
  ok(a.due === true, "R3 5/1 看過,11/14 已滿 182 天 → 提醒", a);
  const b = R.reminderState({ lastReviewedAt: "2026-10-01" }, "2026-11-14");
  ok(b.due === false && b.nextDue === "2027-04-01" && b.daysLeft === 138, "R4 10/1 看過 → 2027-04-01 再提醒、還有 138 天", b);
  ok(R.reminderState({ lastReviewedAt: "not-a-date" }, "2026-11-14").due === true, "R5 壞掉的日期 → 當作沒看過,提醒");
}

// ── 6. 藥櫃線(用真的 herb-inventory.js 建一份虛構藥櫃)──
{
  let seq = 0;
  const newId = (p) => `${p}-${++seq}`;
  let d = H.normalize({ schema: H.SCHEMA, products: [
    { id: "p1", nameZh: "桂枝湯", kind: "formula", form: "granule", packageG: 200 },
    { id: "p2", nameZh: "甘草", kind: "single", form: "granule", packageG: 100, frequent: true },
    { id: "p3", nameZh: "沒用過的", kind: "formula", form: "granule", packageG: 200 },
  ] });
  d = H.receiveLot(d, { productId: "p1", gramsInit: 200, price: 20, purchaseDate: "2026-06-01", expiry: "2028-06-01" }, newId).data;
  d = H.receiveLot(d, { productId: "p3", gramsInit: 200, price: 20, purchaseDate: "2026-06-01", expiry: "2028-06-01" }, newId).data;
  d = H.receiveLot(d, { productId: "p2", gramsInit: 100, price: 9, purchaseDate: "2026-06-01", expiry: "2028-06-01" }, newId).data;
  d = H.use(d, "p1", 150, "2026-08-01", "自用", "", newId);
  d = H.use(d, "p1", 30, "2026-10-01", "自用", "", newId);
  const plan = R.inventoryPlan(H, d, "2026-11-14", { bottleG: 200 });
  const gz = plan.find((r) => r.id === "p1");
  ok(gz && gz.used === 180 && near(gz.usable, 20) && gz.bottlesToBuy === 1, "I1 半年用 180 g、剩 20 g → 下半年再買 1 罐(200 g)", gz);
  ok(plan.some((r) => r.id === "p2" && r.used === 0), "I2 ★常用但沒用量的照樣列出");
  ok(!plan.some((r) => r.id === "p3"), "I3 沒用過也非常用的不列(負控)");
}

// ── 7. 藥名 → 知識庫(畫面與測試共用的 buildResolver)──
{
  const K = {
    formulas: { records: [
      { id: "formula.gui_zhi_tang", name_zh: "桂枝湯", pinyin: "Gui Zhi Tang" },
      { id: "formula.old_retired", name_zh: "退役方", review_status: "deprecated" },
      { id: "formula.gan_cao_tang", name_zh: "甘草湯", pinyin: "Gan Cao Tang" },
    ] },
    herbs: { records: [
      { id: "herb.gan_cao", name_zh: "甘草", pinyin: "Gan Cao", aliases_zh: ["國老"] },
      { id: "herb.gui_zhi_tang_dup", name_zh: "桂枝湯" },
    ] },
  };
  const rs = R.buildResolver(K);
  ok(rs("桂枝湯") && rs("桂枝湯").id === "formula.gui_zhi_tang", "K1 同名時「湯」結尾算方劑(單味藥同名不蓋掉)", rs("桂枝湯"));
  ok(rs("退役方") === null, "K2 退役卡不收(負控)", rs("退役方"));
  ok(rs("gan cao") && rs("gan cao").id === "herb.gan_cao" && rs("Gan  Cao").id === "herb.gan_cao", "K3 拼音大小寫、空白不影響", rs("gan cao"));
  ok(rs("國老") && rs("國老").id === "herb.gan_cao", "K4 中文別名也查得到", rs("國老"));
  ok(rs.nameOf("formula", "formula.gui_zhi_tang") === "桂枝湯", "K5 id → 中文名");
}

console.log(`${fail ? "FAIL" : "PASS"} — test-rx-profile: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

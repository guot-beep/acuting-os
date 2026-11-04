#!/usr/bin/env node
/**
 * validate-herb-inventory.js — 藥櫃(js/herb-inventory.js)的行為真值表。
 *
 * require 真正在跑的模組,餵虛構品項(不是她的真實庫存),斷言輸出。任一條失敗 exit 1。
 * 守的規則(D36 / Ting 2026-11-03 審過的原型):
 *   - 帳只加不改:庫存從帳加總;入庫、用量、調整、報廢都是新的一筆
 *   - FEFO:已開封的先用完,再用效期最早的;第一次扣到的批次記開封日;跨批扣
 *   - 庫存不夠整筆拒絕(用量、開方都不扣半套)
 *   - 補貨點 = 日均 ×(補貨天數 + 安全天數);★ 常用低於門檻(20 g)另外算,進 email
 *   - 到期 / 已過期 / 開封過久(依劑型:科中 24 月、水藥 36 月;品項可另設)
 *   - 開藥紀錄依病人 / 依病症分組;病症摘要算「開過幾次、平均一天幾克」
 *   - 採購清單補到目標天數、換算整包裝
 *
 * 用法:node scripts/validate-herb-inventory.js
 */
"use strict";
const path = require("path");
const H = require(path.join(__dirname, "..", "js", "herb-inventory.js"));

const T = "2026-11-03";
let seq = 0;
const newId = (p) => `${p}.${++seq}`;
const failures = [];
const check = (name, fn) => {
  let ok = false, detail = "";
  try { const r = fn(); ok = r === true; if (r !== true && r !== false) detail = JSON.stringify(r); } catch (e) { detail = e.message; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${ok || !detail ? "" : "  → " + detail}`);
  if (!ok) failures.push(name);
};
const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };

// 虛構品項
let D = H.emptyData();
D.products.push(
  { id: "p.a", nameZh: "虛構方甲", nameEn: "", kind: "formula", form: "granule", brand: "品牌A", code: "", ratio: "5:1", packageG: 100, source: "taiwan", madeIn: "台灣", origin: "", organic: false, frequent: true, reorderG: "", openedShelfMonths: "", knowledgeId: "", archived: false },
  { id: "p.b", nameZh: "虛構藥乙", nameEn: "", kind: "single", form: "raw", brand: "散裝", code: "", ratio: "", packageG: 300, source: "baijia", madeIn: "中國", origin: "甘肅", organic: true, frequent: false, reorderG: "", openedShelfMonths: "", knowledgeId: "", archived: false },
);
D = H.normalize(D);
const recv = (pid, g, price, expiry, bought) => { const r = H.receiveLot(D, { productId: pid, gramsInit: g, price, expiry, purchaseDate: bought, lotNo: "", place: "" }, newId); D = r.data; return r.lot; };
const lotEarly = recv("p.a", 100, 24, "2027-03-01", "2026-06-01");
const lotLate = recv("p.a", 100, 26, "2028-01-01", "2026-08-01");
const lotRaw = recv("p.b", 300, 15, "2029-01-01", "2026-05-01");

console.log("讀檔 / 形狀");
check("空資料有預設設定(科中 24 月、水藥 36 月、常用門檻 20 g)", () => { const e = H.emptyData(); return e.settings.shelfByForm.granule === 24 && e.settings.shelfByForm.raw === 36 && e.settings.frequentMinG === 20; });
check("schema 不符 → 拒絕", () => throws(() => H.normalize({ schema: "something-else" })));
check("null → 空資料(第一次用)", () => H.normalize(null).products.length === 0);
check("normalize 不改內容(來回一次相同)", () => JSON.stringify(H.normalize(JSON.parse(JSON.stringify(D)))) === JSON.stringify(D));

console.log("入庫 / 庫存");
check("入庫寫一筆 receive 帳,庫存 = 帳加總", () => H.stats(D, D.products[0], T).stock === 200 && D.txns.filter((x) => x.type === "receive").length === 3);
check("每克成本 = 美金總價 / 克數", () => Math.abs(H.costPerGram(lotEarly) - 0.24) < 1e-9);
check("入庫缺效期 → 拒絕", () => throws(() => H.receiveLot(D, { productId: "p.a", gramsInit: 100, price: 1, expiry: "" }, newId), /效期/));
check("入庫不存在的品項 → 拒絕", () => throws(() => H.receiveLot(D, { productId: "nope", gramsInit: 100, price: 1, expiry: "2030-01-01" }, newId)));

console.log("FEFO 用量");
const before = JSON.stringify(D);
D = H.use(D, "p.a", 30, "2026-10-01", "自用", "", newId);
check("不改原物件", () => JSON.stringify(H.normalize(JSON.parse(before))) === before);
check("先扣效期最早的那批,並記開封日", () => H.lotRemaining(D, lotEarly.id) === 70 && D.lots.find((l) => l.id === lotEarly.id).openedDate === "2026-10-01" && H.lotRemaining(D, lotLate.id) === 100);
D = H.use(D, "p.a", 90, "2026-10-10", "自用", "", newId);
check("跨批扣:先把開封那批用完,再開下一批", () => H.lotRemaining(D, lotEarly.id) === 0 && H.lotRemaining(D, lotLate.id) === 80 && D.lots.find((l) => l.id === lotLate.id).openedDate === "2026-10-10");
check("跨批時寫兩筆帳(各批一筆)", () => D.txns.filter((x) => x.type === "use" && x.date === "2026-10-10").length === 2);
check("庫存不夠 → 整筆拒絕、零寫入", () => { const n = D.txns.length; return throws(() => H.use(D, "p.a", 999, T, "", "", newId), /只剩/) && D.txns.length === n; });
check("下一瓶(next)是已開封的那批", () => H.stats(D, D.products[0], T).next.id === lotLate.id);

console.log("補貨 / 常用 / 到期");
let S = H.stats(D, D.products[0], T);
check("日均用量從用量帳算(120 g;第一次用在 33 天前,含當天 → 視窗 34 天)", () => Math.abs(S.adu - 120 / 34) < 1e-9);
check("補貨點 = 日均 ×(30 + 14)天", () => S.reorderAuto === Math.ceil((120 / 34) * 44));
check("剩 80 g ≤ 補貨點 → 要補貨", () => S.low === true);
check("★ 常用但還有 80 g → 不寄 email", () => S.frequentLow === false && H.frequentLowEmail(D, T) === null);
D = H.use(D, "p.a", 65, "2026-10-20", "自用", "", newId);
S = H.stats(D, D.products[0], T);
check("★ 常用剩 15 g < 20 g → 進 email", () => S.frequentLow && /1 個常用藥低於 20 g/.test(H.frequentLowEmail(D, T).subject));
check("門檻可改(改成 10 g → 不寄)", () => { const d2 = JSON.parse(JSON.stringify(D)); d2.settings.frequentMinG = 10; return H.frequentLowEmail(d2, T) === null; });
check("快到期:90 天內(水藥批次在 2029,不算)", () => H.stats(D, D.products[1], "2028-11-15").expiring.length === 1 && H.stats(D, D.products[1], T).expiring.length === 0);
check("已過期:效期在今天以前", () => H.stats(D, D.products[1], "2029-02-01").expired.length === 1);
D = H.use(D, "p.b", 10, "2026-05-02", "自用", "", newId);
check("開封過久依劑型:水藥 36 個月內不算、超過才算", () => H.stats(D, D.products[1], "2028-05-01").openedLong.length === 0 && H.stats(D, D.products[1], "2029-05-03").openedLong.length === 1);
check("品項可另設開封期限(水藥改 12 月)", () => { const d2 = JSON.parse(JSON.stringify(D)); d2.products[1].openedShelfMonths = 12; return H.stats(d2, d2.products[1], "2027-06-01").openedLong.length === 1; });
check("久未使用:最後一次用量超過 120 天", () => H.stats(D, D.products[1], "2026-10-01").slow === true && H.stats(D, D.products[0], T).slow === false);

console.log("調整 / 報廢(只加帳)");
const n0 = D.txns.length;
D = H.adjust(D, lotLate.id, -5, T, "adjust", "盤點少 5 g", newId);
check("盤點調整寫一筆 adjust,不改舊帳", () => D.txns.length === n0 + 1 && H.lotRemaining(D, lotLate.id) === 10);
check("調整到負的 → 拒絕", () => throws(() => H.adjust(D, lotLate.id, -50, T, "adjust", "", newId), /負/));
D = H.adjust(D, lotLate.id, 0, T, "discard", "受潮", newId);
check("報廢 = 那一批扣到 0", () => H.lotRemaining(D, lotLate.id) === 0 && D.txns.slice(-1)[0].type === "discard");

console.log("開方(自家病人)");
D = recv("p.a", 100, 24, "2028-06-01", "2026-10-25") && D;
const r1 = H.prescribe(D, { date: "2026-10-26", patientCode: "AQZ", sexAge: "F/41", caseId: "case.x", condition: "失眠", category: "mental_sleep", pattern: "心脾兩虛",
  items: [{ productId: "p.a", gpd: 6, days: 7 }, { productId: "p.b", gpd: 2, days: 7 }] }, newId);
D = r1.data;
check("開方扣每一味、帳帶 rxId 與用途「自家病人」", () => D.txns.filter((x) => x.rxId === r1.rx.id).length === 2 && D.txns.filter((x) => x.rxId === r1.rx.id).every((x) => x.purpose === "自家病人"));
check("開方總量 = Σ 每天克數 × 天數", () => H.rxTotal(r1.rx) === 56);
check("開方成本用最近一批的每克成本", () => Math.abs(H.rxCost(D, r1.rx) - (0.24 * 42 + 0.05 * 14)) < 1e-9);
check("任何一味不夠 → 整張拒絕、零寫入", () => { const n = D.txns.length; return throws(() => H.prescribe(D, { date: T, patientCode: "AQZ", condition: "失眠", items: [{ productId: "p.b", gpd: 1, days: 1 }, { productId: "p.a", gpd: 50, days: 10 }] }, newId), /庫存只剩/) && D.txns.length === n && D.rx.length === 1; });
check("同一味寫兩行 → 合計檢查庫存", () => throws(() => H.prescribe(D, { date: T, patientCode: "AQZ", condition: "失眠", items: [{ productId: "p.a", gpd: 5, days: 10 }, { productId: "p.a", gpd: 5, days: 10 }] }, newId), /庫存只剩/));
check("沒病人代號 / 沒病症 / 沒克數 → 拒絕", () => throws(() => H.prescribe(D, { condition: "x", items: [{ productId: "p.a", gpd: 1, days: 1 }] }, newId)) && throws(() => H.prescribe(D, { patientCode: "A", items: [{ productId: "p.a", gpd: 1, days: 1 }] }, newId)) && throws(() => H.prescribe(D, { patientCode: "A", condition: "x", items: [{ productId: "p.a", gpd: 0, days: 1 }] }, newId)));
D = H.prescribe(D, { date: "2026-11-01", patientCode: "BXR", sexAge: "M/58", condition: "失眠", category: "mental_sleep", items: [{ productId: "p.a", gpd: 4, days: 7 }] }, newId).data;
check("依病人分組", () => { const g = H.groupRx(D, "patient"); return g.size === 2 && g.get("AQZ").length === 1; });
check("依病症分組(兩位失眠病人在同一組,新的在前)", () => { const g = H.groupRx(D, "condition").get("mental_sleep|失眠"); return g.length === 2 && g[0].patientCode === "BXR"; });
check("病症摘要:開過幾次、平均一天幾克", () => { const s = H.conditionSummary(H.groupRx(D, "condition").get("mental_sleep|失眠")); return s[0].productId === "p.a" && s[0].times === 2 && s[0].avgGpd === 5; });

console.log("採購清單");
const list = H.shoppingList(D, T);
const a = list.find((x) => x.p.id === "p.a");
check("要補的品項在清單上,並說出原因", () => !!a && a.why.length > 0);
check("補到目標天數,換算整包裝(至少 1 包)", () => a.packs >= 1 && Number.isInteger(a.packs));
check("不用補的不在清單上(水藥還很多)", () => !list.some((x) => x.p.id === "p.b"));
check("封存的品項不進清單", () => { const d2 = JSON.parse(JSON.stringify(D)); d2.products[0].archived = true; return !H.shoppingList(d2, T).some((x) => x.p.id === "p.a"); });

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項`);
  process.exit(1);
}
console.log("\nPASS — 藥櫃帳只加不改、FEFO、補貨與常用門檻、到期與開封期限、開方、開藥紀錄分組、採購清單都照規格。");

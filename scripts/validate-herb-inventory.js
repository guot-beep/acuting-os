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
check("剛入庫、還沒用過的不算久未使用;買了 120 天以上都沒用才算", () => { const p = { id: "p.idle", nameZh: "虛構未用", kind: "single", form: "granule", packageG: 100, reorderG: "", frequent: false };
  let d = H.normalize({ products: [p] }); d = H.receiveLot(d, { productId: "p.idle", gramsInit: 100, price: 10, expiry: "2030-01-31", purchaseDate: "2026-06-01" }, newId).data;
  return H.stats(d, d.products[0], "2026-06-02").slow === false && H.stats(d, d.products[0], "2026-10-15").slow === true; });
check("久未使用:最後一次用量超過 120 天",() => H.stats(D, D.products[1], "2026-10-01").slow === true && H.stats(D, D.products[0], T).slow === false);

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

console.log("修改(只改描述,數量走帳)");
const ledgerBefore = JSON.stringify(D.txns);
D = H.editProduct(D, "p.a", { brand: "品牌A2", packageG: 200, origin: "四川", frequent: false });
check("改品項的品牌 / 包裝 / 產地 / 常用,帳一筆都不動", () => D.products[0].brand === "品牌A2" && D.products[0].packageG === 200 && D.products[0].origin === "四川" && !D.products[0].frequent && JSON.stringify(D.txns) === ledgerBefore);
check("品項中文名空白 → 拒絕", () => throws(() => H.editProduct(D, "p.a", { nameZh: " " }), /中文名/));
check("包裝克數 0 → 拒絕", () => throws(() => H.editProduct(D, "p.a", { packageG: 0 })));
check("不在可改清單的欄位(例 id)不會被改", () => H.editProduct(D, "p.a", { id: "hack" }).products[0].id === "p.a");
D = H.editLot(D, lotRaw.id, { expiry: "2030-06-30", price: 18, lotNo: "L-9", place: "百家中藥行" });
check("改批次的效期 / 價格 / 批號 / 地點,剩餘克數不變", () => { const l = D.lots.find((x) => x.id === lotRaw.id); return l.expiry === "2030-06-30" && l.price === 18 && l.lotNo === "L-9" && H.lotRemaining(D, lotRaw.id) === 300 - 10 - 14; });
check("改價格後每克成本跟著變", () => Math.abs(H.costPerGram(D.lots.find((x) => x.id === lotRaw.id)) - 0.06) < 1e-9);
check("想直接改克數 → 拒絕,要用盤點調整", () => throws(() => H.editLot(D, lotRaw.id, { gramsInit: 999 }), /盤點/));
check("效期清空 → 拒絕", () => throws(() => H.editLot(D, lotRaw.id, { expiry: "" }), /效期/));

console.log("撤銷開方(只加反向帳)");
const rxA = D.rx.find((r) => r.patientCode === "AQZ");
const stockA0 = H.stats(D, D.products[0], T).stock, stockB0 = H.stats(D, D.products[1], T).stock, txn0 = D.txns.length;
D = H.voidRx(D, rxA.id, T, "開錯藥", newId);
check("撤銷:每一味的量加回原來那一批", () => H.stats(D, D.products[0], T).stock === stockA0 + 42 && H.stats(D, D.products[1], T).stock === stockB0 + 14);
check("撤銷只加帳(return),舊帳一筆不少", () => D.txns.length === txn0 + 2 && D.txns.slice(-2).every((x) => x.type === "return" && x.rxId === rxA.id));
check("開方紀錄留著,標成已撤銷並記原因", () => { const r = D.rx.find((x) => x.id === rxA.id); return r.voided && r.voidReason === "開錯藥" && r.voidedAt === T; });
check("同一張方不能撤銷兩次", () => throws(() => H.voidRx(D, rxA.id, T, "", newId), /撤銷過/));
check("撤銷的方不算進病症摘要", () => { const s = H.conditionSummary(H.groupRx(D, "condition").get("mental_sleep|失眠")); return s.length === 1 && s[0].times === 1; });
check("撤銷的量不算日均用量(用量 = 用掉 − 退回)", () => H.usageG(D, "p.b", 90, T) === 0 + 0 && H.usageG(D, "p.b", 400, T) === 10);

console.log("一次貼上清單建檔");
check("效期格式:2027-05-31 / 2027/5/31 / 2027-05 / 05/2027", () => H.bulkDate("2027-05-31") === "2027-05-31" && H.bulkDate("2027/5/31") === "2027-05-31" && H.bulkDate("2027-05") === "2027-05-31" && H.bulkDate("05/2027") === "2027-05-31" && H.bulkDate("明年") === "");
const TSV = ["品名\t品牌\t劑型\t每包克數\t包數\t現有克數\t價格\t效期\t購買地\t產地\t有機\t常用",
  "虛構丸\t品牌C\t蜜丸\t150\t1\t60\t$30\t2027/12\t台灣\t\t\t是",
  "虛構藥丙\t散裝\t水藥\t300\t\t250\t12.5\t2028-03-31\t百家中藥行\t甘肅\t有\t",
  "\t品牌D\t科中\t100\t\t50\t10\t2027-01-01\t台灣",
  "虛構方丁\t品牌E\t科中\t100\t\t80\t20\t下個月\t加拿大",
  "虛構方甲\t品牌A2\t科中\t100\t\t100\t24\t2028-01-31\t台灣"].join("\n");
const P = H.parseBulk(TSV, D.products);
check("認得標題列,5 列資料", () => P.usedHeader && P.rows.length === 5);
check("劑型、購買地、有機、常用從中文字認出來", () => { const r = P.rows[0], q = P.rows[1]; return r.product.form === "honeypill" && r.product.source === "taiwan" && r.product.frequent && q.product.form === "raw" && q.product.source === "baijia" && q.product.organic && q.product.origin === "甘肅"; });
check("沒寫種類:名字結尾「丸」→ 方劑,「丙」→ 單味藥", () => P.rows[0].product.kind === "formula" && P.rows[1].product.kind === "single");
check("價格的 $ 去掉;蜜丸 / 水藥不填濃縮比", () => P.rows[0].lot.price === 30 && P.rows[0].product.ratio === "" && P.rows[1].product.ratio === "");
check("有包數 → 買的量 = 包數 × 每包;現有量另記", () => P.rows[0].lot.boughtG === 150 && P.rows[0].lot.stockG === 60);
check("沒品名 / 看不懂效期 → 該列錯誤", () => P.rows[2].errors.length === 1 && /效期/.test(P.rows[3].errors[0]));
check("同名同品牌 → 提醒會入到既有品項", () => P.rows[4].existingProductId === "p.a");
const before2 = { p: D.products.length, l: D.lots.length };
const A = H.applyBulk(D, P.rows, newId, T, () => "");
check("只套用沒錯誤的列:新建 2 個品項、入 3 批(1 批入既有品項)", () => A.products === 2 && A.lots === 3 && A.data.products.length === before2.p + 2 && A.data.lots.length === before2.l + 3);
const pill = A.data.products.find((p) => p.nameZh === "虛構丸");
check("買 150 g 現剩 60 g:庫存 60 g、每克成本照 150 g 算(0.2)、記為已開封", () => { const s = H.stats(A.data, pill, T); const lot = s.lots[0]; return s.stock === 60 && Math.abs(H.costPerGram(lot) - 0.2) < 1e-9 && lot.openedDate === T; });
check("建檔時已用掉的量是 adjust,不算日均用量", () => H.usageG(A.data, pill.id, 90, T) === 0 && A.data.txns.some((x) => x.type === "adjust" && x.note === "建檔時已用掉"));
check("沒標題列時照預設順序(品名、品牌、劑型、每包克數、現有克數、價格、效期、購買地)", () => { const r = H.parseBulk("虛構湯\t品牌F\t科中\t100\t40\t22\t2027-06\t網購").rows[0]; return !r.errors.length && r.product.kind === "formula" && r.lot.stockG === 40 && r.product.source === "us_online" && r.lot.expiry === "2027-06-30"; });
check("逗號分隔也可以;# 開頭的列當註解", () => H.parseBulk("# 註解\n虛構散, 品牌G, 濃縮散, 100, 30, 9, 2027-02-28, 加拿大").rows.length === 1);


// ── 2026-11-11 掃描補的規則 ──
console.log("過期批次(不排第一、不開給病人)");
{
  let E = H.emptyData();
  E.products.push({ id: "p.e", nameZh: "虛構方戊", kind: "formula", form: "granule", brand: "品牌E", packageG: 100 });
  E = H.normalize(E);
  const oldLot = H.receiveLot(E, { productId: "p.e", gramsInit: 100, price: 20, expiry: "2026-09-30", purchaseDate: "2024-01-01" }, newId); E = oldLot.data;   // 已過期
  const goodLot = H.receiveLot(E, { productId: "p.e", gramsInit: 50, price: 20, expiry: "2028-01-31", purchaseDate: "2026-10-01" }, newId); E = goodLot.data;
  const pe = E.products[0];
  check("過期批的效期最早,但「下一瓶」是沒過期的那批", () => H.stats(E, pe, T).next.id === goodLot.lot.id);
  check("庫存 150 g 照帳算,其中可用(沒過期)50 g", () => { const st = H.stats(E, pe, T); return st.stock === 150 && st.usable === 50 && st.expired.length === 1; });
  check("開方只從沒過期的批次扣", () => { const r = H.prescribe(E, { date: T, patientCode: "ZZZ", condition: "虛構", items: [{ productId: "p.e", gpd: 5, days: 7 }] }, newId);
    return r.data.txns.filter((x) => x.type === "use").every((x) => x.lotId === goodLot.lot.id); });
  check("沒過期的不夠 → 整張方拒絕,訊息說出是過期批(零寫入)", () => throws(() => H.prescribe(E, { date: T, patientCode: "ZZZ", condition: "虛構", items: [{ productId: "p.e", gpd: 10, days: 7 }] }, newId), /已過期的批次,不開給病人/));
  check("自用的用量可以動到過期批,但排在最後才扣", () => { const d = H.use(E, "p.e", 60, T, "自用", "", newId); const u = d.txns.filter((x) => x.type === "use");
    return u.length === 2 && u[0].lotId === goodLot.lot.id && u[0].grams === -50 && u[1].lotId === oldLot.lot.id && u[1].grams === -10; });
  check("沒給日期的 fefo(舊呼叫法)維持原本順序:效期最早的在前", () => H.fefo(H.lotsOf(E, "p.e"))[0].id === oldLot.lot.id);
}

console.log("日期要是真的日期");
{
  let E = H.emptyData();
  E.products.push({ id: "p.f", nameZh: "虛構藥己", kind: "single", form: "raw", brand: "", packageG: 100 });
  E = H.normalize(E);
  const lot = (o) => Object.assign({ productId: "p.f", gramsInit: 100, price: 10, expiry: "2028-01-31", purchaseDate: T }, o);
  check("入庫:效期不是日期 / 不存在的日期 / 購買日空白 都拒絕", () => throws(() => H.receiveLot(E, lot({ expiry: "abc" }), newId), /有效期限/)
    && throws(() => H.receiveLot(E, lot({ expiry: "2027-02-31" }), newId), /有效期限/) && throws(() => H.receiveLot(E, lot({ purchaseDate: "" }), newId), /購買日/));
  const R = H.receiveLot(E, lot({}), newId); E = R.data;
  check("用量:日期空白 / 亂打 都拒絕(原本會記一筆沒有日期的帳、開封日變成 abc)", () => throws(() => H.use(E, "p.f", 5, "", "自用", "", newId), /日期/) && throws(() => H.use(E, "p.f", 5, "abc", "自用", "", newId), /日期/));
  check("修改批次:效期 / 開封日不是日期拒絕;開封日可以清空", () => throws(() => H.editLot(E, R.lot.id, { expiry: "2027-13-01" }), /效期/)
    && throws(() => H.editLot(E, R.lot.id, { openedDate: "x" }), /開封日/) && H.editLot(E, R.lot.id, { openedDate: "" }).lots[0].openedDate === "");
  check("貼上建檔:不存在的日期當看不懂(2027-13、2027/00、2027-02-31、13/2027 都回空)", () => ["2027-13", "2027/00", "2027-02-31", "2027-13-01", "13/2027"].every((v) => H.bulkDate(v) === ""));
  check("貼上建檔:效期寫 2027-13 → 那一列標錯誤,不建立", () => H.parseBulk("品名\t現有克數\t效期\n虛構湯\t50\t2027-13", []).rows[0].errors.some((e) => /看不懂效期/.test(e)));
  check("月底加月份不溢出:8/31 + 6 月 = 2/28、1/31 + 1 月 = 2/28、閏年 2/29", () => H.addMonths("2026-08-31", 6) === "2027-02-28" && H.addMonths("2026-01-31", 1) === "2026-02-28"
    && H.addMonths("2027-08-31", 6) === "2028-02-29" && H.addMonths("2026-11-03", 24) === "2028-11-03");
}

console.log("帳的精度、到期排序、貼上的包數");
{
  let E = H.emptyData();
  E.products.push({ id: "p.g", nameZh: "虛構散庚", kind: "formula", form: "granule", brand: "品牌G", packageG: 100 });
  E = H.normalize(E);
  E = H.receiveLot(E, { productId: "p.g", gramsInit: 100, price: 20, expiry: "2027-01-31", purchaseDate: "2026-01-01" }, newId).data;   // 89 天
  E = H.receiveLot(E, { productId: "p.g", gramsInit: 100, price: 20, expiry: "2026-11-20", purchaseDate: "2026-02-01" }, newId).data;   // 17 天
  check("快到期的批次:最快到期的排第一(畫面顯示的天數拿第一筆)", () => { const ex = H.stats(E, E.products[0], T).expiring; return ex.length === 2 && ex[0].expiry === "2026-11-20"; });
  let F = E;
  for (let i = 0; i < 30; i++) F = H.use(F, "p.g", 3.33, T, "自用", "", newId);
  check("3.33 g 扣 30 次:帳上剩 100.1 g(原本每筆先取到 0.1,會多出 0.9 g)", () => Math.abs(H.stats(F, F.products[0], T).stock - 100.1) < 1e-9);
  const pv = H.parseBulk("品名\t品牌\t每包克數\t包數\t現有克數\t價格\t效期\n虛構丹\t品牌H\t100\t1\t130\t20\t2028-12-31", []);
  const ap = H.applyBulk(H.emptyData(), pv.rows, newId, T);
  check("貼上:現有 130 g 比 1 包 × 100 g 多 → 照 130 g 入庫並提醒(原本悄悄只記 100 g)", () => pv.rows[0].warnings.some((w) => /請確認包數/.test(w)) && H.stats(ap.data, ap.data.products[0], T).stock === 130);
}

console.log("過期的量不算可用(補貨提醒看可用量)");
{
  let E = H.emptyData();
  E.products.push({ id: "p.k", nameZh: "虛構湯癸", kind: "formula", form: "granule", brand: "品牌K", packageG: 100, frequent: true });
  E = H.normalize(E);
  E = H.receiveLot(E, { productId: "p.k", gramsInit: 100, price: 20, expiry: "2026-09-30", purchaseDate: "2024-01-01" }, newId).data;   // 已過期 100 g
  E = H.receiveLot(E, { productId: "p.k", gramsInit: 15, price: 5, expiry: "2028-01-31", purchaseDate: "2026-10-01" }, newId).data;    // 可用 15 g
  const st = H.stats(E, E.products[0], T);
  check("★ 常用:可用 15 g + 過期 100 g → 低於 20 g 要提醒(原本看總量 115 g,不提醒)", () => st.stock === 115 && st.usable === 15 && st.frequentLow === true && st.low === true);
  check("email 寫的是可用量,並註明另有多少已過期", () => { const m = H.frequentLowEmail(E, T); return !!m && /可用的剩 15 g/.test(m.lines[0]) && /另有 100 g 已過期/.test(m.lines[0]); });
  check("沒有用量時補貨點是 0,不是 -0(畫面印過「補貨點 -0 g」)", () => Object.is(st.reorder, 0) && Object.is(H.usageG(E, "p.k", 90, T), 0));
}

console.log("撤銷的方不算用量(各個時間窗都一樣)");
{
  let E = H.emptyData();
  E.products.push({ id: "p.h", nameZh: "虛構飲辛", kind: "formula", form: "granule", brand: "品牌I", packageG: 200 });
  E = H.normalize(E);
  E = H.receiveLot(E, { productId: "p.h", gramsInit: 200, price: 40, expiry: "2028-01-31", purchaseDate: "2026-08-01" }, newId).data;
  const rr = H.prescribe(E, { date: "2026-10-01", patientCode: "ZZZ", condition: "虛構", items: [{ productId: "p.h", gpd: 6, days: 10 }] }, newId);
  const V = H.voidRx(rr.data, rr.rx.id, T, "開錯", newId);
  check("十月開、十一月撤銷:開方那個月與撤銷那一週的用量都是 0(原本是 +60 與 −60)", () => H.usageG(V, "p.h", 31, "2026-10-31") === 0 && H.usageG(V, "p.h", 7, T) === 0);
  check("usageTxns 不含撤銷那張方的 use;庫存加回 200 g;帳一筆都沒刪", () => H.usageTxns(V).length === 0 && H.stats(V, V.products[0], T).stock === 200 && V.txns.length === rr.data.txns.length + 1);
  check("撤銷後不再算「最後一次使用」(久未使用從購買日算)", () => H.stats(V, V.products[0], T).lastUse === "");
}

// ── 兩台裝置:真的病例服務 + 真的 backend adapter ──
async function twoDevices() {
  console.log("兩台裝置(真的病例服務 + adapter;另一台寫過就拒絕,不蓋掉對方的帳)");
  const fs = require("fs"), os = require("os");
  let svcMod;
  try { svcMod = require("./clinical-sqlite-service.js"); } catch (e) { check("載入本機病例服務", () => "載入失敗:" + e.message); return; }
  require("../js/clinical-sqlite-backend.js");
  const B = global.AcuTingClinicalSqliteBackend;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-herbinv-test-"));
  const svc = await svcMod.startServer({ dbFile: path.join(tmp, "t.db"), port: 0, root: path.join(__dirname, ".."), log: () => {} });
  try {
    const host = "127.0.0.1:" + svc.port;
    const transport = (method, p, body, headers) => {
      const h = {}; for (const k in (headers || {})) h[k.toLowerCase()] = headers[k]; h.host = host;
      const out = svc.handle({ method, url: p, headers: h, body });
      return { status: out.status, text: Buffer.isBuffer(out.body) ? out.body.toString("utf8") : String(out.body) };
    };
    const device = () => { const b = B.makeBackend(transport, {}); b.refresh(); return b; };
    const io = (b) => ({ read: () => b.readKey(H.STORAGE_KEY), write: (s) => b.writeKey(H.STORAGE_KEY, s) });
    const seed = () => { let d = H.emptyData(); d.products.push({ id: "p.z", nameZh: "虛構方壬", kind: "formula", form: "granule", brand: "品牌Z", packageG: 100 }); d = H.normalize(d);
      return H.receiveLot(d, { productId: "p.z", gramsInit: 100, price: 20, expiry: "2028-01-31", purchaseDate: "2026-10-01" }, newId).data; };
    const rxOf = (data) => H.prescribe(data, { date: T, patientCode: "ZZZ", condition: "虛構", items: [{ productId: "p.z", gpd: 6, days: 7 }] }, newId).data;

    // 對照組:沒有基準比對的寫法(修之前的 commit)—— 必須真的重現遺失,不然這一段什麼都沒測到
    {
      const desk = device(), phone = device();
      desk.writeKey(H.STORAGE_KEY, JSON.stringify(seed()));
      phone.markStale();
      const deskMem = H.normalize(JSON.parse(desk.readKey(H.STORAGE_KEY)));            // 桌機開著藥櫃頁,整本在記憶體
      phone.writeKey(H.STORAGE_KEY, JSON.stringify(rxOf(H.normalize(JSON.parse(phone.readKey(H.STORAGE_KEY))))));   // 手機開了一張方
      desk.markStale();                                                                 // 桌機 10 秒 ping 發現 revision 變了
      let wrote = true;
      try { desk.writeKey(H.STORAGE_KEY, JSON.stringify(H.use(deskMem, "p.z", 5, T, "自用", "", newId))); } catch (_) { wrote = false; }
      const after = H.normalize(JSON.parse(device().readKey(H.STORAGE_KEY)));
      check("對照組(沒有基準比對):桌機寫入成功、手機那張方消失 —— 這就是要防的遺失", () => wrote && after.rx.length === 0 && H.stats(after, after.products[0], T).stock === 95);
      desk.removeKey(H.STORAGE_KEY);
    }
    // 修正後:makeSession
    {
      const desk = device(), phone = device();
      const sDesk = H.makeSession(io(desk)), sPhone = H.makeSession(io(phone));
      check("空的藥櫃:load 得到空帳,第一次寫入成功", () => sDesk.load().products.length === 0 && sDesk.commit(seed()).ok === true);
      phone.markStale();
      check("手機讀到桌機剛建的品項,開一張方(扣 42 g)", () => sPhone.load().products.length === 1 && sPhone.commit(rxOf(sPhone.data())).ok === true);
      desk.markStale();
      const stale = sDesk.data();
      const r = sDesk.commit(H.use(stale, "p.z", 5, T, "自用", "", newId));
      check("桌機拿舊的那本存檔 → 拒絕,說明是別處更新過", () => r.ok === false && r.conflict === true && /另一台裝置/.test(r.message));
      const cloud = H.normalize(JSON.parse(device().readKey(H.STORAGE_KEY)));
      check("雲端那本沒被動:手機的方還在、庫存 58 g", () => cloud.rx.length === 1 && H.stats(cloud, cloud.products[0], T).stock === 58);
      check("桌機已換成最新的那本;照最新的再做一次就成功(58 − 5 = 53 g,方還在)", () => { const d = sDesk.data(); if (d.rx.length !== 1) return false;
        const again = sDesk.commit(H.use(d, "p.z", 5, T, "自用", "", newId)); const c = H.normalize(JSON.parse(device().readKey(H.STORAGE_KEY)));
        return again.ok === true && c.rx.length === 1 && H.stats(c, c.products[0], T).stock === 53; });
      phone.markStale();
      check("ensure:別處寫過就自動換成新的那本(病例頁的開藥紀錄不會停在舊的)", () => H.stats(sPhone.ensure(), sPhone.data().products[0], T).stock === 53);
      check("讀到壞掉的內容:不給資料、有錯誤訊息,而且之後的寫入被拒絕(不拿空帳蓋掉)", () => { const bad = device(); bad.writeKey(H.STORAGE_KEY, "{not json"); const sb = H.makeSession(io(bad));
        const loaded = sb.load(); const w = sb.commit(H.emptyData());
        return loaded === null && !!sb.error() && w.ok === false && device().readKey(H.STORAGE_KEY) === "{not json"; });
    }
  } finally {
    try { if (svc.close) await svc.close(); else if (svc.server && svc.server.close) svc.server.close(); } catch (_) { /* */ }
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* Windows 上 db 檔可能還被占著 */ }
  }
}

twoDevices().catch((e) => { check("兩台裝置測試跑完", () => "例外:" + (e && e.stack || e)); }).then(() => {
  if (failures.length) {
    console.error(`\nFAIL — ${failures.length} 項`);
    process.exit(1);
  }
  console.log("\nPASS — 藥櫃帳只加不改、FEFO(過期批排最後、不開給病人)、補貨與常用門檻、到期與開封期限、開方、撤銷、開藥紀錄分組、採購清單、兩台裝置不互蓋,都照規格。");
  process.exit(0);
});

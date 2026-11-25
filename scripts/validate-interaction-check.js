#!/usr/bin/env node
/**
 * validate-interaction-check.js — D38 交互檢查的真值表:引擎(js/interaction-check.js)+ 索引 + 對照表 + 渲染 + 診前單。
 *
 * 為什麼要這支:資料驗證器全綠、畫面在說謊,是這個庫抓過七次的病。這支用真的知識庫、真的 app.js 函式
 * (從 app.js 抽出來在 sandbox 跑,不複製邏輯)跑虛構病例,斷言畫面上會出現什麼、不會出現什麼。
 *
 *   索引   :藥卡上每一列 `with` 指得到卡片的標籤交互列,都進了 buildIndex(A 不會被吃掉);索引沒有懸空的 id。
 *   對照表 :對照表裡每個旗標都真的存在於卡片上(不然 B 層永遠不會命中而沒人發現);藥卡用到的每個旗標都有中文名。
 *   引擎   :華法林 × 血府逐瘀湯 → B 層命中數 = 獨立算出的「方中帶出血類旗標的味數」;A 層要有來源;停用的藥不算;
 *           沒卡的藥明說沒查;沒組成的方明說沒比對;同一組已有 A 時 B 不重列。
 *   措辭   :任何輸出都不准出現「無交互作用」;沒命中一定說「這不代表安全」;B 層一定說「不是交互作用的證據」。
 *   渲染   :病例頁交互檢查卡三層都畫得出來;模組沒載入要明說;來源被拿掉時要說「這一列沒有來源」(突變測試)。
 *   診前單 :結構化用藥的出血風險跟「文字提到」分開列;A/B/C 進「可能遇到的問題」;沒給引擎時不假裝比對過。
 *
 * 所有病例都是虛構的(沒有 patientCode、caseTitle)。抽 0 筆 = FAIL,不准空跑通過。
 * 用法:node scripts/validate-interaction-check.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) pass++;
  else { fail++; console.log(`FAIL ${name}${detail !== undefined ? " — " + JSON.stringify(detail).slice(0, 400) : ""}`); }
}

// ── 真的知識庫(index.html 載入的 knowledge 片) ──
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const shards = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1].split("?")[0]).filter((s) => s.startsWith("data/generated/knowledge"));
const kctx = { window: {} }; kctx.globalThis = kctx.window; vm.createContext(kctx);
for (const s of shards) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), kctx);
const K = kctx.window.ACUTING_KNOWLEDGE;
const recs = (k) => (K && K[k] && K[k].records) || [];
check("知識庫載入:pharmDrugs / herbs / formulas / supplementRecords 都有資料", recs("pharmDrugs").length > 0 && recs("herbs").length > 0 && recs("formulas").length > 0 && recs("supplementRecords").length > 0,
  { shards, drugs: recs("pharmDrugs").length });
check("知識庫載入:integrativeFlagCrosswalk 在 bundle 裡", !!(K && K.integrativeFlagCrosswalk && Array.isArray(K.integrativeFlagCrosswalk.risk_classes) && K.integrativeFlagCrosswalk.risk_classes.length));

const IC = require("../js/interaction-check.js");
const P = require("../js/preshift.js");
const ids = (k) => new Set(recs(k).map((r) => r.id));
const herbIds = ids("herbs"), suppIds = ids("supplementRecords"), formulaIds = ids("formulas");

// ── 索引 ──
const index = IC.buildIndex(K);
let expected = 0;
for (const d of recs("pharmDrugs")) for (const row of d.herb_drug_interactions_graded || []) {
  const w = String(row.with || "");
  if ((w.startsWith("herb.") && herbIds.has(w)) || (w.startsWith("supp.") && suppIds.has(w))) expected++;
}
check("索引:每一列指得到卡片的標籤交互列都進了索引", index.length === expected && expected > 0, { index: index.length, expected });
const dangling = index.filter((x) => !(herbIds.has(x.otherId) || suppIds.has(x.otherId) || formulaIds.has(x.otherId)));
check("索引:沒有指到不存在卡片的列", dangling.length === 0, dangling.map((x) => x.otherId));
check("索引:每一列都有來源", index.every((x) => x.sources.length > 0), index.filter((x) => !x.sources.length).map((x) => x.id));
check("索引:evidence 不印生 enum(每一列都有顯示字)", index.every((x) => x.evidenceLabel && !/_/.test(x.evidenceLabel)));

// ── 對照表 ──
const cw = K.integrativeFlagCrosswalk;
const drugFlagsInData = new Set(recs("pharmDrugs").flatMap((d) => d.integrative_clinical_flags || []));
const herbFlagsInData = new Set(recs("herbs").flatMap((h) => h.safety_flags || []));
const suppFlagsInData = new Set(recs("supplementRecords").flatMap((s) => (s.key_safety_notes || []).flatMap((n) => n.interaction_flags || [])));
for (const rc of cw.risk_classes) {
  for (const f of rc.drug_flags || []) check(`對照表 ${rc.id}:藥卡旗標 ${f} 真的出現在藥卡上`, drugFlagsInData.has(f));
  for (const f of rc.herb_flags || []) check(`對照表 ${rc.id}:中藥卡旗標 ${f} 真的出現在中藥卡上`, herbFlagsInData.has(f));
  for (const f of rc.supplement_flags || []) check(`對照表 ${rc.id}:補充劑旗標 ${f} 真的出現在補充劑卡上`, suppFlagsInData.has(f));
  check(`對照表 ${rc.id}:有中文名`, !!String(rc.name_zh || "").trim());
}
for (const f of drugFlagsInData) check(`藥卡旗標 ${f} 在對照表有中文名(不然畫面會不顯示它)`, !!IC.drugFlagLabel(K, f));

// ── 引擎 ──
const FXZ = "formula.xue_fu_zhu_yu_tang";
const fxz = recs("formulas").find((r) => r.id === FXZ);
check("固定測資:血府逐瘀湯存在且有組成", !!(fxz && (fxz.composition || []).length));
const bleedClass = cw.risk_classes.find((r) => r.id === "bleeding");
const bleedHerbs = new Set((fxz.composition || []).map((c) => c.herb_id).filter((h) => {
  const r = recs("herbs").find((x) => x.id === h);
  return r && (r.safety_flags || []).some((f) => bleedClass.herb_flags.includes(f));
}));
const ex = (agentId, status, extra) => Object.assign({ id: "e_" + agentId, agentId, status: status || "current" }, extra || {});

const r1 = IC.check(K, { exposures: [ex("drug.warfarin")], formulaLinks: [FXZ] });
const r1Bherbs = new Set(r1.tierB.filter((b) => b.riskClassId === "bleeding" && b.otherKind === "herb").map((b) => b.otherId));
check("華法林 × 血府逐瘀湯:B 層出血類命中數 = 獨立算出的味數", r1Bherbs.size === bleedHerbs.size && bleedHerbs.size > 0, { got: [...r1Bherbs], expected: [...bleedHerbs] });
check("華法林 × 血府逐瘀湯:B 層每一條都寫了在哪首方裡", r1.tierB.every((b) => /血府逐瘀湯/.test(b.via)));
check("華法林 × 血府逐瘀湯:A 層 0 條(標籤沒點名這些藥材)", r1.tierA.length === 0, r1.tierA);
check("華法林:C 層帶出藥卡的針刺注意(逐字)", r1.tierC.length === 1 && r1.tierC[0].noteZh === recs("pharmDrugs").find((d) => d.id === "drug.warfarin").acupuncture_note_zh);
check("華法林:comparedA = 索引裡華法林的列數", r1.comparedA === index.filter((x) => x.drugId === "drug.warfarin").length && r1.comparedA > 0);

const r2 = IC.check(K, { exposures: [ex("drug.warfarin")], herbLinks: ["herb.ren_shen"] });
check("華法林 × 人參(單味):A 層 1 條,帶 DailyMed 來源", r2.tierA.length === 1 && /^dailymed:/.test(r2.tierA[0].sources[0] || ""), r2.tierA);
check("華法林 × 人參:同一組已有 A,B 不重列", !r2.tierB.some((b) => b.otherId === "herb.ren_shen"));

const r3 = IC.check(K, { exposures: [ex("drug.warfarin"), ex("supp.garlic")] });
check("華法林 + 大蒜補充劑:A 層命中(標籤列已連到 supp.garlic)", r3.tierA.some((a) => a.otherId === "supp.garlic"), r3.tierA);
check("華法林 + 大蒜補充劑:B 不重列同一組", !r3.tierB.some((b) => b.otherId === "supp.garlic"));
const r3b = IC.check(K, { exposures: [ex("drug.sertraline"), ex("supp.st_johns_wort")] });
check("sertraline + 聖約翰草補充劑:A 層命中", r3b.tierA.some((a) => a.otherId === "supp.st_johns_wort"), r3b.tierA);
const r3c = IC.check(K, { exposures: [ex("drug.apixaban"), ex("supp.omega_3")] });
check("apixaban + 魚油:B 層出血類命中,並逐字引用補充劑卡的備註", r3c.tierB.some((b) => b.otherId === "supp.omega_3" && b.otherQuotes.length > 0), r3c.tierB);

const r4 = IC.check(K, { exposures: [ex("drug.warfarin", "stopped")], formulaLinks: [FXZ] });
check("停用的藥不算目前用藥", r4.drugs.length === 0 && r4.tierB.length === 0 && r4.tierC.length === 0);
const r4b = IC.check(K, { exposures: [ex("drug.warfarin", "prn")], formulaLinks: [FXZ] });
check("需要時(prn)算目前用藥", r4b.tierB.length > 0);

const r5 = IC.check(K, { exposures: [ex("drug.fixture_not_in_kb", "current", { nameText: "虛構藥" }), ex("", "current", { id: "e_blank", nameText: "只有名字" })] });
check("沒有卡的藥:明說沒做安全檢查", r5.drugs.find((d) => d.agentId === "drug.fixture_not_in_kb").reason === IC.TEXT.noCard);
check("沒有連到卡片的用藥:明說沒做安全檢查", r5.drugs.find((d) => d.exposureId === "e_blank").reason === IC.TEXT.noAgentId);

const noComp = recs("formulas").find((f) => !(f.composition || []).some((c) => String(c && c.herb_id || "").startsWith("herb.")));
check("固定測資:有一首沒有結構化組成的方", !!noComp);
const r6 = IC.check(K, { exposures: [ex("drug.warfarin")], formulaLinks: [noComp.id, "formula.fixture_missing"] });
check("沒有組成的方:明說沒比對", r6.unresolved.some((u) => u.id === noComp.id && u.text === IC.TEXT.noComposition));
check("知識庫找不到的方:明說沒比對", r6.unresolved.some((u) => u.id === "formula.fixture_missing" && u.text === IC.TEXT.notInKnowledge));

const r7 = IC.check(K, { exposures: [ex("herb.dan_shen"), ex("drug.warfarin")] });
check("病人自己在吃的中藥(agentId herb.*)併進中藥那一側", r7.tierB.some((b) => b.otherId === "herb.dan_shen" && /病人自己在用/.test(b.via)));

// ── 措辭 ──
const allOut = JSON.stringify([r1, r2, r3, r3b, r3c, r4, r5, r6, r7, IC.TEXT, IC.noHitText(0), IC.noHitText(12)]);
check("任何輸出都沒有「無交互作用」", !/無交互作用|沒有交互作用|no interaction/i.test(allOut));
check("沒命中的句子說「這不代表安全」,而且帶 N", /這不代表安全/.test(IC.noHitText(0)) && /12/.test(IC.noHitText(12)));
check("B 層說明說「不是交互作用的證據」", /不是交互作用的證據/.test(IC.TEXT.tierBNote));

// ── 渲染(真的 app.js 函式) ──
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
function grab(name) {
  const start = app.indexOf("function " + name + "(");
  if (start < 0) throw new Error(`app.js 裡找不到 function ${name} —— 測試必須跟著更新,不能默默跳過`);
  let depth = 0;
  for (let j = app.indexOf("{", start); j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) return app.slice(start, j + 1); }
  }
  throw new Error(`function ${name} 括號沒有收斂`);
}
function renderer(withModule, knowledge) {
  const sb = { window: {}, console };
  sb.globalThis = sb;
  sb.ACUTING_KNOWLEDGE = knowledge || K;
  if (withModule) sb.window.AcuTingInteractionCheck = IC;
  sb.window.AcuTingPreshift = P;
  vm.createContext(sb);
  vm.runInContext([grab("escapeHtml"), grab("renderInteractionCheckCard"), grab("renderAgentExposureAcuNote")].join("\n"), sb);
  return sb;
}
const fixtureCase = (exposures, notes) => ({ id: "case_fixture", agentExposures: exposures, soapNotes: notes || [] });
const note = (visitDate, formulaLinks, herbLinks) => ({ id: "n_" + visitDate, visitDate, formulaLinks: formulaLinks || [], herbLinks: herbLinks || [] });

const R = renderer(true);
const h1 = R.renderInteractionCheckCard(fixtureCase([ex("drug.warfarin")], [note("2026-01-02", ["formula.gui_zhi_tang"]), note("2026-01-09", [FXZ])]));
check("病例頁:交互檢查卡畫出 A/B/C 三層", /A · /.test(h1) && /B · /.test(h1) && /C · /.test(h1), h1.slice(0, 300));
check("病例頁:用的是最近一次 SOAP 的處方(日期寫在卡上)", /2026-01-09 的處方/.test(h1));
check("病例頁:B 層列出方裡的藥材名", [...bleedHerbs].every((hid) => h1.includes(recs("herbs").find((x) => x.id === hid).name_zh)));
check("病例頁:B 層說「不是交互作用的證據」", h1.includes(IC.TEXT.tierBNote));
check("病例頁:A 層沒命中時說「已比對 N 條…這不代表安全」", h1.includes(IC.noHitText(r1.comparedA)));
check("病例頁:沒有「無交互作用」", !/無交互作用/.test(h1));
const h2 = R.renderInteractionCheckCard(fixtureCase([ex("drug.warfarin")], [note("2026-01-09", [], ["herb.ren_shen"])]));
check("病例頁:A 層命中帶 DailyMed 連結", /dailymed\.nlm\.nih\.gov\/dailymed\/drugInfo\.cfm\?setid=/.test(h2) && /人參/.test(h2));
check("病例頁:沒有目前用藥 → 整張不畫", R.renderInteractionCheckCard(fixtureCase([ex("drug.warfarin", "stopped")], [note("2026-01-09", [FXZ])])) === "");
const h3 = renderer(false).renderInteractionCheckCard(fixtureCase([ex("drug.warfarin")], []));
check("病例頁:模組沒載入要明說", /模組未載入/.test(h3));
const h4 = R.renderInteractionCheckCard(fixtureCase([ex("drug.fixture_not_in_kb", "current", { nameText: "虛構藥" })], []));
check("病例頁:沒有卡的藥明說沒查", h4.includes(IC.TEXT.noCard) && h4.includes("虛構藥"));
// 突變:把人參那一列的來源拿掉 → 畫面要說「這一列沒有來源」,不能照樣看起來有根據
const Kmut = JSON.parse(JSON.stringify({ pharmDrugs: K.pharmDrugs, herbs: K.herbs, formulas: K.formulas, supplementRecords: K.supplementRecords, integrativeFlagCrosswalk: K.integrativeFlagCrosswalk, safetyFlagVocabulary: K.safetyFlagVocabulary }));
Kmut.pharmDrugs.records.find((d) => d.id === "drug.warfarin").herb_drug_interactions_graded.find((g) => g.with === "herb.ren_shen").sources = [];
const h5 = renderer(true, Kmut).renderInteractionCheckCard(fixtureCase([ex("drug.warfarin")], [note("2026-01-09", [], ["herb.ren_shen"])]));
check("突變:來源被拿掉 → 畫面說「這一列沒有來源」", /這一列沒有來源/.test(h5) && !/DailyMed 標籤/.test(h5));
const acu = R.renderAgentExposureAcuNote(ex("drug.warfarin"));
check("用藥列:帶出藥卡的針刺注意與旗標中文名", acu.includes("針刺注意") && acu.includes("出血風險") && !/bleeding_risk/.test(acu));
// 藥卡的針刺注意帶 markdown 粗體(apixaban 的 **神經軸麻醉與脊椎穿刺**):畫面上不准印出星號
const apixCard = recs("pharmDrugs").find((d) => d.id === "drug.apixaban");
check("固定測資:apixaban 的針刺注意帶 ** 粗體", /\*\*/.test(apixCard.acupuncture_note_zh || ""));
const hApix = R.renderInteractionCheckCard(fixtureCase([ex("drug.apixaban")], [note("2026-01-09", [FXZ])])) + R.renderAgentExposureAcuNote(ex("drug.apixaban"));
check("病例頁:針刺注意不印出 ** 星號(轉成粗體)", !/\*\*/.test(hApix) && /<strong>神經軸麻醉與脊椎穿刺<\/strong>/.test(hApix));
const sApix = P.summarizeCase({ id: "fx_apix", agentExposures: [ex("drug.apixaban")], soapNotes: [note("2026-01-09", [FXZ])] }, { today: "2026-01-16", interactionCheck: (item, last) => IC.check(K, { exposures: item.agentExposures, formulaLinks: last.formulaLinks, herbLinks: last.herbLinks }) });
check("診前單:針刺注意不印出 ** 星號", sApix.drafts.problems.some((p) => /神經軸麻醉與脊椎穿刺/.test(p.text)) && !sApix.drafts.problems.some((p) => /\*\*/.test(p.text)));
check("病例頁:B 層依「藥 × 風險類別」分組,一組一行", (h1.match(/出血類:華法林/g) || []).length === 1);
check("用藥列:沒有卡的藥不畫針刺注意(沒卡已由安全列明說)", R.renderAgentExposureAcuNote(ex("drug.fixture_not_in_kb")) === "");

// ── 診前單 ──
const icFn = (item, last) => IC.check(K, { exposures: item.agentExposures || [], formulaLinks: (last && last.formulaLinks) || [], herbLinks: (last && last.herbLinks) || [] });
const pcase = { id: "case_fixture_ps", agentExposures: [ex("drug.warfarin")], currentMeds: "", soapNotes: [Object.assign(note("2026-01-09", [FXZ]), { pointsUsed: "LI4" })] };
const s1 = P.summarizeCase(pcase, { today: "2026-01-16", interactionCheck: icFn });
check("診前單:結構化用藥的出血風險列在注意事項(標明來源是結構化用藥)", s1.attention.some((a) => a.structured && /華法林/.test(a.label) && /結構化用藥/.test(a.source)), s1.attention);
check("診前單:2 病況有「結構化用藥」一列", s1.conditions.some((c) => c.label === "結構化用藥" && /華法林/.test(c.text)));
check("診前單:4 可能遇到的問題帶 B 層(措辭:不是交互作用的證據)", s1.drafts.problems.some((p) => /兩張卡都標了出血類/.test(p.text) && /不是交互作用的證據/.test(p.text)));
check("診前單:4 可能遇到的問題帶 C 層(藥卡針刺注意)", s1.drafts.problems.some((p) => /針刺注意/.test(p.text) && /華法林/.test(p.source)));
const pcase2 = Object.assign({}, pcase, { currentMeds: "長期服用 warfarin" });
const s2 = P.summarizeCase(pcase2, { today: "2026-01-16", interactionCheck: icFn });
check("診前單:結構化 與 文字提到 分開列,不合併", s2.attention.some((a) => a.structured) && s2.attention.some((a) => a.code === "anticoagulant" && a.level === "mention"));
const s3 = P.summarizeCase(pcase, { today: "2026-01-16" });
check("診前單:沒給引擎時不假裝比對過(沒有結構化項目、interaction 是 null)", s3.interaction === null && !s3.attention.some((a) => a.structured));
check("診前單:輸出沒有「無交互作用」", !/無交互作用/.test(JSON.stringify([s1, s2, s3])));

// ── 接線 ──
const iIC = html.indexOf('src="js/interaction-check.js"'), iPs = html.indexOf('src="js/preshift.js"'), iApp = html.indexOf('src="app.js"');
check("index.html:interaction-check.js 排在 preshift.js 與 app.js 之前", iIC > 0 && iIC < iPs && iIC < iApp, { iIC, iPs, iApp });
check("app.js:病例頁真的呼叫 renderInteractionCheckCard", /\$\{renderInteractionCheckCard\(item\)\}/.test(app));
check("app.js:用藥列真的呼叫 renderAgentExposureAcuNote", /\$\{renderAgentExposureAcuNote\(exposure\)\}/.test(app));
const psui = fs.readFileSync(path.join(ROOT, "js/preshift-ui.js"), "utf8");
check("preshift-ui.js:有把 interactionCheck 傳給 summarizeCase", /interactionCheck:\s*\(item, last\)/.test(psui));

console.log(`validate-interaction-check: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);

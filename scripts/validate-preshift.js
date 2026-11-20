#!/usr/bin/env node
/* validate-preshift.js — 今日診前單 Pre-shift 的真值表(js/preshift.js)+ 接線檢查。
 *
 * 守的事:
 *   1. 排程:時間格式、同日同病例不重複、照時間排(沒時間排最後)、勾完成帶時間、移出名單不碰心得。
 *   2. 心得:只加不改、帶時間、空白拒收、超長拒收;病例心得 / 當天心得分開。
 *   3. 病例只讀:summarizeCase 前後病例 JSON 一個字都沒變。
 *   4. 注意事項:旗標原文置頂;關鍵字「提到」一定附原句;否定句標成「可能」;已是旗標的不重複。
 *   5. 兩台裝置:另一台在中間寫過 → 這一步疊在最新那本上(對方的資料還在);寫入丟錯 → 重讀再做一次;兩次都失敗 → 回報沒存到。
 *   6. 接線:index.html 有 section + 兩支 script(順序在 app.js 前後正確)、router 白名單、app.js 病例頁掛心得、
 *      worker 把 acuting-preshift-v1 列為不可 DELETE 的正本鍵。
 * 全部用虛構資料;不讀任何真實病例。
 */
"use strict";
const fs = require("fs");
const path = require("path");
const P = require("../js/preshift.js");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; } else { fail++; console.log("FAIL", name, detail !== undefined ? "→ " + JSON.stringify(detail) : ""); }
}
function throws(fn) { try { fn(); return false; } catch (_) { return true; } }
let seq = 0;
const newId = (p) => `${p}.t${++seq}`;
const NOW = "2026-01-05T09:00:00.000Z";
const D = "2026-01-05";

// ── 1. 排程 ──
let d = P.emptyData();
check("isTime 14:30", P.isTime("14:30"));
check("isTime 空白可", P.isTime(""));
check("isTime 24:00 拒", !P.isTime("24:00"));
check("isTime 9:5 拒", !P.isTime("9:5"));
check("addEntry 壞時間丟錯", throws(() => P.addEntry(d, D, "case.a", "2pm", NOW, newId)));
check("addEntry 壞日期丟錯", throws(() => P.addEntry(d, "1/5", "case.a", "", NOW, newId)));
check("addEntry 沒病例丟錯", throws(() => P.addEntry(d, D, "", "", NOW, newId)));
const before = JSON.stringify(d);
let d1 = P.addEntry(d, D, "case.b", "15:00", NOW, newId);
check("addEntry 不改輸入", JSON.stringify(d) === before);
d1 = P.addEntry(d1, D, "case.c", "", NOW, newId);
d1 = P.addEntry(d1, D, "case.a", "09:30", NOW, newId);
check("同日三位", P.dayEntries(d1, D).length === 3);
check("照時間排、沒時間最後", P.dayEntries(d1, D).map((e) => e.caseId).join() === "case.a,case.b,case.c", P.dayEntries(d1, D).map((e) => e.caseId));
const d2 = P.addEntry(d1, D, "case.b", "08:00", NOW, newId);
check("重複加同病例 = 更新時間,不多一列", P.dayEntries(d2, D).length === 3 && P.dayEntries(d2, D)[0].caseId === "case.b");
check("重複加且時間空白 → 保留原時間", P.dayEntries(P.addEntry(d1, D, "case.b", "", NOW, newId), D).find((e) => e.caseId === "case.b").time === "15:00");
check("別天是空的", P.dayEntries(d1, "2026-01-06").length === 0);
const eB = P.dayEntries(d1, D).find((e) => e.caseId === "case.b");
let d3 = P.setDone(d1, D, eB.id, true, "2026-01-05T15:40:00.000Z");
check("勾完成帶時間", P.dayEntries(d3, D).find((e) => e.id === eB.id).doneAt === "2026-01-05T15:40:00.000Z");
d3 = P.setDone(d3, D, eB.id, false, NOW);
check("取消完成清時間", P.dayEntries(d3, D).find((e) => e.id === eB.id).doneAt === "" && !P.dayEntries(d3, D).find((e) => e.id === eB.id).done);
check("setTime 不存在的列丟錯", throws(() => P.setTime(d1, D, "nope", "10:00")));
check("setTime 壞時間丟錯", throws(() => P.setTime(d1, D, eB.id, "25:00")));
check("setTime 改時間", P.dayEntries(P.setTime(d1, D, eB.id, "07:15"), D)[0].id === eB.id);
check("datesWithEntries", P.datesWithEntries(d1).join() === D);

// ── 2. 心得 ──
let n1 = P.addNote(d1, { caseId: "case.b", date: D, text: "  第一則  " }, "2026-01-05T10:00:00.000Z", newId);
n1 = P.addNote(n1, { caseId: "case.b", date: D, text: "第二則" }, "2026-01-05T11:00:00.000Z", newId);
n1 = P.addNote(n1, { caseId: "", date: D, text: "今天整體" }, "2026-01-05T18:00:00.000Z", newId);
check("病例心得兩則、照時間", P.caseNotes(n1, "case.b").map((n) => n.text).join("|") === "第一則|第二則");
check("心得帶建立時間", P.caseNotes(n1, "case.b")[0].createdAt === "2026-01-05T10:00:00.000Z");
check("當天心得分開", P.dayNotes(n1, D).length === 1 && P.caseNotes(n1, "").length === 0);
check("空白心得拒收", throws(() => P.addNote(d1, { caseId: "case.b", text: "   " }, NOW, newId)));
check("超長心得拒收", throws(() => P.addNote(d1, { caseId: "case.b", text: "字".repeat(P.MAX_NOTE_CHARS + 1) }, NOW, newId)));
const n2 = P.removeEntry(n1, D, eB.id);
check("移出名單不碰心得", P.caseNotes(n2, "case.b").length === 2 && P.dayEntries(n2, D).length === 2);
check("API 沒有改 / 刪心得的操作", !("editNote" in P) && !("deleteNote" in P) && !("removeNote" in P));

// normalize:壞列丟掉、心得字不丟
const norm = P.normalize({ days: { "2026-01-05": { entries: [{ id: "x", caseId: "c", time: "bad" }, { caseId: "noid" }] }, "bad-date": { entries: [{ id: "y", caseId: "c" }] } },
  notes: [{ id: "n", caseId: "c", text: "保留", createdAt: "t" }, { id: "m", text: "  " }] });
check("normalize 壞時間變空白", norm.days[D].entries.length === 1 && norm.days[D].entries[0].time === "");
check("normalize 壞日期丟掉", !norm.days["bad-date"]);
check("normalize 有字的心得留著、空的丟掉", norm.notes.length === 1 && norm.notes[0].text === "保留");
check("normalize null", JSON.stringify(P.normalize(null)) === JSON.stringify(P.emptyData()));

// ── 3 & 4. 病例只讀 + 注意事項(虛構病例) ──
const fakeCase = {
  id: "case.fake1", patientCode: "PT-000000", displayCode: "ZZZ", caseTitle: "虛構病名 肩頸痛", chiefComplaint: "虛構主訴",
  sex: "F", safetyFlags: ["虛構旗標 氣胸史"], allergies: "虛構過敏原", pastHistory: "無高血壓。曾用 warfarin。",
  currentMeds: "", historyPresent: "正在備孕", tcmPatterns: ["虛構證型"],
  soapNotes: [
    { id: "v1", visitDate: "2026-01-01", tcmPattern: "舊證型", pointsUsed: "LI4", plan: "舊計畫" },
    { id: "v2", visitDate: "2026-01-03", tcmPattern: "新證型", pointsUsed: "ST36 SP6", formulaHerbs: "虛構方", plan: "新計畫", followUp: "一週後",
      referralOrSupervisorQuestion: "要不要加灸", safetyFlagLinks: ["safety.fake"] },
  ],
};
const snap = JSON.stringify(fakeCase);
fakeCase.birthYearMonth = "1985-06";
const snap2 = JSON.stringify(fakeCase);
const CS = require("../js/case-search.js");
const s = P.summarizeCase(fakeCase, { today: D, caseSearch: CS });
check("summarizeCase 不改病例", JSON.stringify(fakeCase) === snap2);
check("顯示代號 / 病人 ID / 性別年齡", s.displayCode === "ZZZ" && s.patientId === "PT-000000" && s.sexAge === "F/40");
check("上次就診 = 日期最新那診", s.lastVisit === "2026-01-03" && s.last.pattern === "新證型" && s.last.points === "ST36 SP6", s.last);
check("距今天數", s.daysSince === 2);
check("方藥 / 計畫 / 下次 / 問 preceptor", s.last.herbs === "虛構方" && s.last.plan === "新計畫" && s.last.followUp === "一週後" && s.last.askPreceptor === "要不要加灸");
const flags = s.attention.filter((a) => a.level === "flag").map((a) => a.label);
check("旗標原文", flags.includes("虛構旗標 氣胸史"));
check("上次 SOAP 安全警示", flags.includes("safety.fake"));
check("過敏", flags.some((f) => f.includes("虛構過敏原")));
check("旗標在最前面", s.attention[0].level === "flag");
check("已是旗標的氣胸不再重複成『提到』", !s.attention.some((a) => a.code === "pneumothorax"));
const preg = s.attention.find((a) => a.code === "pregnancy");
check("備孕被找到且附原句", preg && preg.level === "mention" && preg.snippet.includes("備孕") && preg.source === "現病史", preg);
const htn = s.attention.find((a) => a.code === "hypertension");
check("『無高血壓』標成可能(否定句)", htn && htn.level === "maybe" && htn.negated === true, htn);
const ac = s.attention.find((a) => a.code === "anticoagulant");
check("warfarin 被找到", ac && ac.level === "mention");
const plain = P.summarizeCase({ id: "c2", allergies: "NKDA", soapNotes: [] }, { today: D });
check("NKDA 不算過敏旗標、沒 SOAP = 初診", plain.attention.length === 0 && plain.last === null && plain.lastVisit === "");
check("summarizeCase(null)", P.summarizeCase(null) === null);

// ── 5. 兩台裝置 ──
function fakeIo(initial) {
  const io = { raw: initial, writes: 0, failNext: 0, read() { return this.raw; }, write(s) { if (this.failNext > 0) { this.failNext--; throw new Error("409 模擬"); } this.writes++; this.raw = s; }, refresh() {} };
  return io;
}
const io = fakeIo(null);
const st = P.makeStore(io);
st.load();
check("store 第一次寫", st.apply((x) => P.addEntry(x, D, "case.a", "09:00", NOW, newId)).ok);
// 另一台裝置在中間加了一位 + 一則心得
const other = P.addNote(P.addEntry(JSON.parse(io.raw), D, "case.z", "10:00", NOW, newId), { caseId: "case.z", text: "對方的心得" }, NOW, newId);
io.raw = JSON.stringify(other);
const r1 = st.apply((x) => P.addNote(x, { caseId: "case.a", text: "我的心得" }, NOW, newId));
const after1 = JSON.parse(io.raw);
check("疊在最新那本上:對方的病人還在", r1.ok && P.dayEntries(after1, D).some((e) => e.caseId === "case.z"));
check("疊在最新那本上:對方的心得還在、我的也在", P.caseNotes(after1, "case.z").length === 1 && P.caseNotes(after1, "case.a").length === 1);
io.failNext = 1;
const r2 = st.apply((x) => P.addEntry(x, D, "case.q", "", NOW, newId));
check("寫入失敗一次 → 重讀再做一次成功", r2.ok && r2.retried && P.dayEntries(JSON.parse(io.raw), D).some((e) => e.caseId === "case.q"));
io.failNext = 2;
const rawBefore = io.raw;
const r3 = st.apply((x) => P.addEntry(x, D, "case.w", "", NOW, newId));
check("兩次都失敗 → 回報沒存到、資料沒變", !r3.ok && /沒有存到/.test(r3.message) && io.raw === rawBefore);
const r4 = st.apply((x) => P.addNote(x, { caseId: "case.a", text: "" }, NOW, newId));
check("操作本身拒收 → 不寫", !r4.ok && io.raw === rawBefore);
const ioBad = fakeIo("{not json");
const stBad = P.makeStore(ioBad);
check("壞 JSON → 讀不到、不寫", stBad.load() === null && !stBad.apply((x) => x).ok && ioBad.writes === 0);

// ── 6. 接線 ──
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const html = read("index.html");
check("index.html 有 #preshiftApp 在 data-workspace=preshift 裡", /data-workspace="preshift"[\s\S]{0,1200}id="preshiftApp"/.test(html));
check("index.html 導覽有 #ws/preshift", html.includes('href="#ws/preshift"'));
const iCore = html.indexOf('src="js/preshift.js"'), iApp = html.indexOf('src="app.js"'), iUi = html.indexOf('src="js/preshift-ui.js"');
check("script 順序 preshift.js < app.js < preshift-ui.js", iCore > 0 && iApp > iCore && iUi > iApp, { iCore, iApp, iUi });
check("router 白名單有 preshift", /WORKSPACES\s*=\s*\[[^\]]*"preshift"/.test(read("js/router.js")));
const app = read("app.js");
check("病例頁畫心得", app.includes("AcuTingPreshiftUI.caseNotesHtml(item)"));
check("病例頁接線", app.includes("AcuTingPreshiftUI.wireCase(caseDetail)"));
check("worker:acuting-preshift-v1 不可 DELETE", /PROTECTED_KEYS[\s\S]{0,300}"acuting-preshift-v1"/.test(read("src/clinical-handler.mjs")));
check("STORAGE_KEY", P.STORAGE_KEY === "acuting-preshift-v1");
const ui = read("js/preshift-ui.js");
check("UI 不寫病例(沒有 saveClinicalCases / clinicalCases.push / 寫 acuting-clinical-)", !/saveClinicalCases|persistClinicalCases|clinicalCases\.(push|splice)|writeKey\(\s*["']acuting-clinical/.test(ui));
check("UI 只寫自己的 key", (ui.match(/writeKey\(/g) || []).length === 1 && /writeKey\(P\.STORAGE_KEY/.test(ui));

// ── 7. 在通行碼後面:沒有通行證讀不到、寫不進、不能 DELETE(用真的 clinical-handler,通行碼驗證換成樁) ──
(async () => {
  const { pathToFileURL } = require("url");
  const H = await import(pathToFileURL(path.join(ROOT, "src", "clinical-handler.mjs")).href);
  const touched = [];
  const core = new Proxy({}, { get: (_, k) => async () => { touched.push(String(k)); return { revision: 1, value: "{}" }; } });
  const handle = H.createClinicalHandler({
    core, ensureSchema: async () => {}, authConfigured: false, devBypass: false,
    passphraseAuth: { async verifyToken(t) { return t === "good" ? { ok: true } : { ok: false, reason: t ? "bad" : "no_token" }; } },
    verify: async () => ({ ok: false, reason: "no_token" }), version: "t", dbName: "t", environment: "test", log: () => {},
  });
  const url = "https://example.invalid/__clinical/kv/" + P.STORAGE_KEY;
  const req = (method, headers, body) => handle(new Request(url, { method, headers: { [H.CLIENT_HEADER]: "t", ...(headers || {}) }, body }));
  check("沒通行證 GET 診前單 → 401", (await req("GET")).status === 401);
  check("錯的通行證 GET → 401", (await req("GET", { [H.AUTH_HEADER]: "nope" })).status === 401);
  check("沒通行證 PUT → 401", (await req("PUT", { "If-Match": "1" }, "{}")).status === 401);
  check("被拒的請求一次都沒碰到資料層", touched.length === 0, touched);
  { const r = await req("DELETE", { [H.AUTH_HEADER]: "good", "If-Match": "1" }); const j = await r.json().catch(() => ({})); check("有通行證也不能 DELETE 診前單(protected_key)", r.status === 405 && j.error === "protected_key", { status: r.status, j }); }
  check("PROTECTED_KEYS 有診前單", H.PROTECTED_KEYS.has(P.STORAGE_KEY));
  check("有通行證但沒 If-Match 的 PUT → 428(不准蓋掉沒讀過的那本)", (await req("PUT", { [H.AUTH_HEADER]: "good" }, "{}")).status === 428);
  console.log(`validate-preshift: ${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log("FAIL 通行碼段丟錯", e && e.stack); process.exit(1); });

#!/usr/bin/env node
/**
 * validate-care-draft-phi.js — CARE 草稿的匯出邊界(2026-08-14 Ting ruling)
 *
 * 為什麼要新開一支,而不是加進 validate-care-draft-render.js:
 *   那支守的是「按鈕接不接得上」(UI 接線)。這支守的是「按下去之後跑出來的
 *   那份檔案能不能宣稱安全」。兩者退化的方式完全不同 —— 按鈕好好的、草稿照樣
 *   可以在標頭寫「已去識別」而騙過所有人。
 *
 * CODEX AUDIT #1/#2 的機器面。要守的三條:
 *   1. patientCode / caseTitle 一個字都不准出現在草稿或檔名裡
 *      (舊版把 patientCode 放第一行註解、caseTitle 放 H1 與檔名)
 *   2. 每份草稿都必須明著寫「含 PHI」,並列出它為什麼含
 *   3. **永遠不准宣稱已清乾淨** —— 這條是最重要的一條,也是最容易在某次
 *      「讓文案好看一點」的重構裡失守的一條。
 *
 * 第 3 條的關鍵反例:自由文字裡放了姓名 / 病歷號 / 電話 / Email,產生器**不會**
 * 因為掃到就變得比較安全,也不會因為**沒掃到**就變得乾淨。所以兩個方向都測:
 *   - 有植入識別碼 → 掃描必須命中、必須列進黑框、且仍不得出現放行措辭
 *   - 沒有可掃到的識別碼 → 黑框仍在、仍必須寫明「掃不到不代表乾淨」、
 *     仍不得出現放行措辭
 * 只測前者的話,「零命中就印一句 clean」這種寫法會全綠 —— 那正是要防的東西。
 *
 * 用法:node scripts/validate-care-draft-phi.js
 */
"use strict";

const path = require("path");
const CD = require(path.join(__dirname, "..", "js", "care-draft.js"));

const failures = [];
const check = (name, fn) => {
  let ok = false, detail = "";
  try {
    const r = fn();
    if (r === true || r === undefined) ok = true;
    else if (typeof r === "string") { ok = false; detail = r; }
    else ok = !!r;
  } catch (e) {
    ok = false;
    detail = String((e && e.message) || e);
  }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${!ok && detail ? `  · ${detail}` : ""}`);
  if (!ok) failures.push(name + (detail ? ` (${detail})` : ""));
};

const REF = new Date("2026-08-14");
const gen = (item) => CD.generateDraft(item, { lang: "both", labelIdx: new Map(), metricDefs: new Map(), refDate: REF });

/* 黑框 = 檔案最上方連續的 `>` 區塊。遮蔽斷言只能對這一段做:正文本來就照錄
 * 原文,在正文裡找到植入的 Email 是**正確**的,不是缺陷。 */
function bannerOf(draft) {
  const out = [];
  for (const line of draft.split("\n")) {
    if (line.startsWith(">")) out.push(line);
    else break;
  }
  return out.join("\n");
}

const BASE = {
  id: "case.phi_fixture",
  patientCode: "PCODE-MUST-NOT-LEAK-7731",
  caseTitle: "CaseTitleMustNotLeakZZZ",
  sex: "女",
  birthYearMonth: "1984-03",
  occupation: "測試",
  publicationConsent: "granted",
  soapNotes: [
    { id: "n1", visitDate: "2026-05-01", visitNumber: 1, objective: "測試客觀", assessment: "測試評估", plan: "測試計畫" },
    { id: "n2", visitDate: "2026-05-15", visitNumber: 2, objective: "測試客觀二", assessment: "測試評估二", plan: "測試計畫二" },
  ],
};
const withFields = (patch, notePatch) => ({
  ...BASE,
  ...patch,
  soapNotes: BASE.soapNotes.map((n, i) => (i === 0 && notePatch ? { ...n, ...notePatch } : { ...n })),
});

console.log("CARE draft PHI boundary\n");
console.log("— 1. patientCode / caseTitle 不得離開系統 —");

const clean = withFields({ chiefComplaint: "右側頭痛三個月,勞累後加重" });
const cleanDraft = gen(clean);

check("patientCode 不出現在草稿的任何地方(含 HTML 註解)", () =>
  cleanDraft.includes(BASE.patientCode) ? "草稿裡找得到 patientCode" : true);
check("caseTitle 不出現在草稿的任何地方", () =>
  cleanDraft.includes(BASE.caseTitle) ? "草稿裡找得到 caseTitle" : true);
check("下載檔名不含 caseTitle", () => {
  const f = CD.draftFilename(clean, "2026-08-14");
  return f.includes(BASE.caseTitle) ? `檔名 ${f}` : true;
});
check("下載檔名不含 patientCode", () => {
  const f = CD.draftFilename(clean, "2026-08-14");
  return f.includes(BASE.patientCode) ? `檔名 ${f}` : true;
});
check("下載檔名自己就標示 PHI(下載資料夾一眼認得出)", () =>
  CD.draftFilename(clean, "2026-08-14").includes("PHI"));

console.log("\n— 2. 每份草稿都必須明著寫「含 PHI」 —");

check("黑框是檔案的第一件事", () => cleanDraft.startsWith("> ⚠️ **本檔含 PHI"));
check("黑框報出精確日期的『幾個』與『幾處』(宣告,不是掃描)", () =>
  /精確日期 \d+ 個 · 全文出現 \d+ 處/.test(bannerOf(cleanDraft)));
check("黑框點名病歷原文與病人原話", () =>
  bannerOf(cleanDraft).includes("原始敘述") && bannerOf(cleanDraft).includes("病人原話"));
check("黑框有英文版(投稿對象不一定讀中文)", () => bannerOf(cleanDraft).includes("CONTAINS PHI"));

console.log("\n— 3. 永遠不得宣稱已清乾淨 —");

/* 這裡逐條列出來跑,而不是「有沒有其中之一」——  失敗訊息要指得出是哪一句
 * 被寫進去了,不然下一個人只知道「有問題」卻不知道改哪裡。 */
function assertNoClearance(label, text) {
  const lower = text.toLowerCase();
  const hit = CD.FORBIDDEN_CLEARANCE_CLAIMS.filter((c) => lower.includes(c.toLowerCase()));
  check(`${label}:沒有任何放行措辭`, () => (hit.length ? `出現 ${JSON.stringify(hit)}` : true));
}
assertNoClearance("乾淨 fixture", cleanDraft);
check("零命中時仍寫明「掃不到不代表乾淨」", () => {
  const b = bannerOf(cleanDraft);
  return b.includes("掃描是提醒,不是放行") && b.includes("只有人眼抓得到");
});
check("零命中時不會把「未命中」寫成通過", () =>
  bannerOf(cleanDraft).includes("未命中 K1/K2/K3/K5/K6"));
check("乾淨 fixture 的掃描確實是零命中(否則上面兩條測到的是別的情況)", () => {
  const n = CD.scanIdentifiers(cleanDraft).length;
  return n === 0 ? true : `掃到 ${n} 筆:${JSON.stringify(CD.scanIdentifiers(cleanDraft))}`;
});

console.log("\n— 4. 自由文字裡的姓名 / 病歷號 / 電話 / Email(CODEX AUDIT #2) —");

/* 每一種識別碼放進**不同的**自由文字欄位。放同一欄會讓「只掃 chiefComplaint」
 * 這種實作矇混過關 —— 病歷原文散落在 5b / 5c / 8a / 11c / 12,每一處都會被照錄。 */
const PLANTS = [
  { id: "K2", what: "Email(主訴 5b)", raw: "jane.doe@example.com",
    make: () => withFields({ chiefComplaint: "頭痛,病人來信 jane.doe@example.com 詢問" }) },
  { id: "K1", what: "電話(既往史 5c)", raw: "415-555-0132",
    make: () => withFields({ chiefComplaint: "頭痛", pastHistory: "前院聯絡電話 415-555-0132" }) },
  { id: "K5", what: "病歷號(評估 8a)", raw: "MRN 88231-4",
    make: () => withFields({ chiefComplaint: "頭痛" }, { assessment: "對照前院紀錄 MRN 88231-4 的影像" }) },
  { id: "K6", what: "英文姓名(病人視角 12)", raw: "Mrs. Chen",
    make: () => withFields({ chiefComplaint: "頭痛" }, { patientPerspective: "Mrs. Chen said the pain eased." }) },
  { id: "K6", what: "中文姓名(反思 11c)", raw: "林小姐",
    make: () => withFields({ chiefComplaint: "頭痛" }, { reflection: "林小姐對針感較敏感,下次減量" }) },
  { id: "K3", what: "社會安全號碼(生活型態 5c)", raw: "123-45-6789",
    make: () => withFields({ chiefComplaint: "頭痛", lifestyle: "保險資料 123-45-6789 已建檔" }) },
];

for (const plant of PLANTS) {
  const draft = gen(plant.make());
  const found = CD.scanIdentifiers(draft.split("\n").filter((l) => !l.startsWith(">")).join("\n"));
  const banner = bannerOf(draft);

  check(`${plant.what}:掃描命中並歸類為 ${plant.id}`, () => {
    const hits = found.filter((f) => f.id === plant.id);
    return hits.length ? true : `只掃到 ${JSON.stringify(found.map((f) => f.id))}`;
  });
  check(`${plant.what}:黑框把它列出來了`, () =>
    banner.includes(`${plant.id} `) && /自動掃描另外命中 \d+ 處/.test(banner)
      ? true
      : "黑框沒有列出命中");
  check(`${plant.what}:黑框裡的樣本是遮蔽過的,不是原值`, () =>
    banner.includes(plant.raw) ? `黑框把 ${plant.raw} 原樣印出來了` : true);
  // 最重要的一條:掃到識別碼**不會**讓草稿變成可分享的東西,也不准出現任何
  // 「已處理/已清乾淨」的說法。
  assertNoClearance(`${plant.what}`, draft);
  check(`${plant.what}:草稿仍然標示含 PHI`, () => draft.startsWith("> ⚠️ **本檔含 PHI"));
  check(`${plant.what}:原文照錄(識別碼仍在正文,沒有被偷偷刪掉)`, () =>
    draft.includes(plant.raw) ? true : "正文裡找不到植入值 —— 產生器悄悄改了病歷原文");
}

console.log("\n— 5. 掃描器本身 —");

check("scanIdentifiers 回報所在章節,而不是行號(黑框會讓行號整份位移)", () => {
  const d = gen(withFields({ chiefComplaint: "頭痛,來信 a.b@c.com" }));
  const f = CD.scanIdentifiers(d.split("\n").filter((l) => !l.startsWith(">")).join("\n"));
  return f.length && typeof f[0].section === "string" && f[0].section.length > 0
    ? true
    : `findings=${JSON.stringify(f)}`;
});
check("redactSample 不會把短字串原樣吐回來", () =>
  CD.redactSample("林小姐") !== "林小姐" && CD.redactSample("ab") === "…");
check("K4(完整日期)刻意不在掃描表 —— 日期改用宣告,否則就診日會淹掉訊號", () =>
  CD.IDENTIFIER_PATTERNS.every((p) => p.id !== "K4"));
check("countExactDates 真的數得到就診日", () => {
  const n = CD.countExactDates(cleanDraft);
  return n >= 2 ? true : `只數到 ${n},fixture 有 2 個就診日`;
});
/* distinct 與 total 必須是兩個真的不同的量。同一個就診日會散在
 * 6 / 7 / 8a / 10a 等好幾節,如果哪天有人把 distinct 寫成 total 的別名,
 * 黑框會宣稱「精確日期 17 個」—— 把風險講大,跟講小一樣是不準。 */
check("phiCounts 的 distinct 與 total 是兩個不同的量(同一天重複出現要摺疊)", () => {
  const s = CD.phiCounts(cleanDraft).dates;
  if (s.distinct !== 2) return `fixture 有 2 個不同就診日,distinct=${s.distinct}`;
  return s.total > s.distinct ? true : `total=${s.total} 沒有大於 distinct=${s.distinct},摺疊沒發生或計數壞了`;
});
/* 產生日期不是病人日期。這條原本是抓到的實際缺陷:兩診的 fixture 被報成
 * 「精確日期 3 個」,多出來的是標頭那行 `產生時間 YYYY-MM-DD`。 */
check("產生時間那一行不算進病人日期", () => {
  const raw = CD.exactDateStats(cleanDraft);
  const net = CD.phiCounts(cleanDraft).dates;
  return raw.distinct > net.distinct
    ? true
    : `未剔除:raw.distinct=${raw.distinct} net.distinct=${net.distinct} —— GENERATOR_META_PREFIX 可能與標頭文案不同步`;
});
check("黑框報的數字與 phiCounts 一致(三個出口不准各報各的)", () => {
  const net = CD.phiCounts(cleanDraft).dates;
  return bannerOf(cleanDraft).includes(`精確日期 ${net.distinct} 個 · 全文出現 ${net.total} 處`)
    ? true
    : `黑框與 phiCounts 對不上(net=${JSON.stringify(net)})`;
});

console.log("\n— 6. 病人代碼不因為看起來像別的東西就漏掉 —");

/* 回歸防護:patientCode 的預設值長得像 `P-2026-001`(app.js newCase 表單)。
 * 如果哪天有人「為了追溯方便」把它塞回標頭,而且塞的是預設格式,上面用
 * 顯眼字串當 fixture 的斷言仍然會綠。所以另外用預設格式測一次。 */
const defaultCoded = { ...clean, patientCode: "P-2026-001" };
check("預設格式的 patientCode(P-2026-001)也不出現在草稿裡", () =>
  gen(defaultCoded).includes("P-2026-001") ? "草稿裡找得到 P-2026-001" : true);
check("預設格式的 patientCode 也不出現在檔名裡", () =>
  CD.draftFilename(defaultCoded, "2026-08-14").includes("P-2026-001") ? "檔名帶了 patientCode" : true);

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log("\nPASS — 草稿不帶 patientCode/caseTitle,黑框在位,且從不宣稱已清乾淨。");

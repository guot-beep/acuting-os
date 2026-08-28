#!/usr/bin/env node
/**
 * validate-picker-hygiene.js — D31 臨床 picker 身分衛生閘(2026-08-28)。
 *
 * 為什麼需要這支:病例/SOAP 那幾個連結欄位的文字框被 `enhanceLinkField()` 設成
 * `hidden`,**picker 是唯一的鑄造路徑** —— 選單上出現什麼,病歷裡就永久存下什麼,
 * 沒有自由輸入的逃生口。所以「選單裡有什麼」就是持久化語彙表。
 *
 * D31 裁定三條(docs/audits/G1_LEGACY_PICKER_RULING_2026-08-28.md):
 *   1. `review_status === "deprecated"` 的記錄,**不得出現在任何 picker**。
 *   2. legacy 命名空間 id(`western_condition.*` / `eastern_disease.*`)只有
 *      白名單那 5 筆療程背景可以留,其餘一律不得上架。
 *   3. 白名單那 5 筆**必須帶可見前綴**(`［療程背景］`)—— 標示是裁定的一部分,
 *      不是裝飾:沒有它,選單上分不出哪一列是 legacy 命名空間。
 *
 * 檢查方式是**真的把 picker 跑起來**(從 app.js 抽函式進 vm,餵真正出貨的
 * `data/generated/knowledge_*.js`),不是掃字串 —— 掃字串只能證明「有寫過濾」,
 * 證明不了「過濾真的擋住了東西」。另外保留幾條靜態斷言,擋的是「把過濾拿掉」
 * 這種改法。
 *
 * 用法:
 *   node scripts/validate-picker-hygiene.js
 *   node scripts/validate-picker-hygiene.js --self-test   # 負控(不寫任何檔)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const argIdx = process.argv.indexOf("--app-src");
const APP_PATH = argIdx >= 0 ? process.argv[argIdx + 1] : path.join(ROOT, "app.js");
const SELF_TEST = process.argv.includes("--self-test");

const PICKERS = [
  "pointPickerOptions",
  "formulaPickerOptions",
  "herbPickerOptions",
  "patternPickerOptions",
  "easternDiseasePickerOptions",
  "symptomPickerOptions",
  "westernConditionPickerOptions",
];

// picker → [ACUTING_KNOWLEDGE 上的來源路徑]
const SOURCES = {
  formulaPickerOptions: ["formulas.records"],
  herbPickerOptions: ["herbs.records"],
  patternPickerOptions: ["patternLibrary.records"],
  easternDiseasePickerOptions: ["tdisRegistry.records"],
  symptomPickerOptions: ["symptoms.records"],
  westernConditionPickerOptions: ["conditionCanon.records", "conditions.records"],
};

const LEGACY_PREFIXES = ["western_condition.", "eastern_disease.", "med."];

function grab(src, name) {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) return null;
  let depth = 0;
  for (let j = src.indexOf("{", start); j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  return null;
}
function grabConstArray(src, name) {
  const m = src.match(new RegExp(`^const ${name} = \\[`, "m"));
  if (!m) return null;
  const end = src.indexOf("];", m.index);
  return end < 0 ? null : src.slice(m.index, end + 2);
}
function grabConstString(src, name) {
  const m = src.match(new RegExp(`^const ${name} = [^\\n]*;$`, "m"));
  return m ? m[0] : null;
}
function get(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function loadKnowledge() {
  const sandbox = { console, JSON, Object, Array, Date, Math, String, Number };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const dir = path.join(ROOT, "data/generated");
  const shards = fs.readdirSync(dir).filter((f) => /^knowledge_.*\.js$/.test(f));
  if (!shards.length) throw new Error("data/generated 裡找不到 knowledge_*.js —— 先跑 node scripts/build-data.js");
  for (const f of shards) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), sandbox);
  return { sandbox, knowledge: sandbox.ACUTING_KNOWLEDGE || {}, shards: shards.length };
}

function evaluate(appSrc) {
  const problems = [];
  const notes = [];

  // ---- A. 靜態斷言:過濾被拿掉、legacy union 被加回來,都在這裡擋 ----
  const bodies = {};
  for (const name of PICKERS) {
    const body = grab(appSrc, name);
    if (!body) { problems.push(`app.js 裡找不到 ${name} —— picker 被改名或移除,這支驗證器必須跟著更新,不能默默跳過`); continue; }
    bodies[name] = body;
    if (!body.includes("pickerLive(")) {
      problems.push(`${name} 沒有經過 pickerLive() —— 退役卡會直接上架(D31 第 1 條)`);
    }
  }
  if (bodies.patternPickerOptions && /conditions\?\.tcm_patterns/.test(bodies.patternPickerOptions)) {
    problems.push("patternPickerOptions 又 union 了 conditions.tcm_patterns(D31 已拆除)");
  }
  if (bodies.easternDiseasePickerOptions && /conditions\?\.eastern_diseases/.test(bodies.easternDiseasePickerOptions)) {
    problems.push("easternDiseasePickerOptions 又 union 了 conditions.eastern_diseases(D31 已撤下)");
  }
  const wc = bodies.westernConditionPickerOptions || "";
  if (wc && !wc.includes("TREATMENT_CONTEXT_PICKER_ALLOWLIST")) {
    problems.push("westernConditionPickerOptions 沒有引用 D31 白名單常數 —— 用前綴規則放行等於沒有白名單");
  }
  if (wc && !wc.includes("TREATMENT_CONTEXT_LABEL_PREFIX")) {
    problems.push("westernConditionPickerOptions 沒有加 ［療程背景］ 標示 —— 標示是 D31 裁定的一部分");
  }

  // ---- B. 行為斷言:真的把 picker 跑起來 ----
  const { knowledge, shards } = loadKnowledge();
  const sb = { console, JSON, Object, Array, Date, Math, String, Number, Boolean };
  sb.globalThis = sb;
  sb.ACUTING_KNOWLEDGE = knowledge;
  /* `points` 是 app.js 的模組層變數,來源是出貨的 points_361.js
   * (globalThis.ACUTING_POINTS_361)。這裡照 index.html 的載入方式餵它,
   * 否則 pointPickerOptions 會在 0 列上「通過」—— 空集合永遠合格,
   * 那種綠燈是測試空跑。 */
  const pointsSrc = path.join(ROOT, "data/generated/points_361.js");
  if (!fs.existsSync(pointsSrc)) throw new Error("找不到 data/generated/points_361.js —— 先跑 node scripts/build-data.js");
  const pbox = { console, JSON };
  pbox.globalThis = pbox;
  vm.createContext(pbox);
  vm.runInContext(fs.readFileSync(pointsSrc, "utf8"), pbox);
  sb.points = (pbox.ACUTING_POINTS_361 || []).map((p) => ({ code: p.code, nameZh: p.chinese, pinyin: p.pinyin, review_status: p.review_status }));
  if (!sb.points.length) throw new Error("points_361 載入後是空的 —— 不能用空集合當成 pointPickerOptions 合格");
  vm.createContext(sb);

  const need = [
    grabConstArray(appSrc, "TREATMENT_CONTEXT_PICKER_ALLOWLIST"),
    grabConstString(appSrc, "TREATMENT_CONTEXT_LABEL_PREFIX"),
    grab(appSrc, "dedupeOptions"),
    grab(appSrc, "pickerLive"),
    grab(appSrc, "pickerTerms"),
    ...PICKERS.map((n) => bodies[n]),
  ];
  if (need.some((x) => !x)) {
    problems.push("抽不到 picker 或它依賴的 helper/常數 —— 無法做行為驗證,視為失敗(不做無聲略過)");
    return { problems, notes, counts: {} };
  }
  vm.runInContext(need.join("\n"), sb);
  // const/let 進的是 context 的 global lexical environment,不會掛在 sandbox 物件上,
  // 所以要用求值取回來(function 宣告則會掛上去,sb[name]() 直接可用)
  const allowlist = vm.runInContext("TREATMENT_CONTEXT_PICKER_ALLOWLIST", sb);
  const prefix = vm.runInContext("TREATMENT_CONTEXT_LABEL_PREFIX", sb);

  const counts = { shards };
  for (const name of PICKERS) {
    let options;
    try { options = sb[name](); } catch (e) { problems.push(`${name} 執行失敗:${e.message}`); continue; }
    counts[name] = options.length;

    // B1 退役卡不得上架
    const deprecated = new Set();
    for (const src of SOURCES[name] || []) {
      for (const r of get(knowledge, src) || []) if (r && r.review_status === "deprecated") deprecated.add(r.id);
    }
    const leaked = options.filter((o) => deprecated.has(o.value));
    if (leaked.length) problems.push(`${name} 上架了 ${leaked.length} 筆退役記錄:${leaked.slice(0, 5).map((o) => o.value).join(", ")}`);
    counts[name + "__deprecated_filtered"] = deprecated.size;

    // B2 legacy 命名空間只有白名單放行
    for (const o of options) {
      const legacy = LEGACY_PREFIXES.find((p) => String(o.value).startsWith(p));
      if (!legacy) continue;
      if (!allowlist.includes(o.value)) {
        problems.push(`${name} 鑄造了白名單以外的 legacy id:${o.value}`);
        continue;
      }
      // B3 白名單的必須帶標示
      if (!String(o.label).startsWith(prefix)) {
        problems.push(`${name} 的 ${o.value} 沒有帶 ${prefix} 標示(D31 第 3 條)`);
      }
    }
  }

  /* B4 別名要真的能搜到。
   *
   * 注意「沙參」這個詞本身證明不了什麼 —— 它是「北沙參」name_zh 的子字串,
   * 就算 terms 完全不含別名也照樣命中(第一版就是這樣寫的,被負控抓出來)。
   * 所以這裡改成**動態挑一個只存在於 aliases 的詞**來測。 */
  try {
    const opts = sb.herbPickerOptions();
    const byId = new Map(opts.map((o) => [o.value, o]));
    const herbs = (get(knowledge, "herbs.records") || []).filter((h) => h && h.review_status !== "deprecated");
    let probe = null;
    for (const h of herbs) {
      const base = `${h.name_zh || ""} ${h.pinyin || ""} ${h.name_en || ""} ${h.id}`.toLowerCase();
      const alias = (h.aliases_zh || []).find((a) => a && !base.includes(String(a).toLowerCase()));
      if (alias && byId.has(h.id)) { probe = { id: h.id, alias: String(alias) }; break; }
    }
    if (!probe) {
      notes.push("找不到「只存在於別名」的詞可測(資料裡每個別名都已是其他欄位的子字串),別名檢查這輪略過");
    } else {
      const opt = byId.get(probe.id);
      if (!opt.terms.includes(probe.alias.toLowerCase())) {
        problems.push(`picker 的 terms 沒有納入 aliases —— 「${probe.alias}」搜不到 ${probe.id}(D21 的重導在輸入層失效)`);
      } else {
        notes.push(`別名可搜:「${probe.alias}」→ ${probe.id}`);
      }
    }
    // D21 沙參個案本身:北沙參要在、退役的 herb.sha_shen 不得在
    const shaShen = opts.filter((o) => o.terms.includes("沙參")).map((o) => o.value);
    if (!shaShen.includes("herb.bei_sha_shen")) problems.push("搜「沙參」找不到 herb.bei_sha_shen");
    if (shaShen.includes("herb.sha_shen")) problems.push("搜「沙參」仍會跳出 D21 退役的 herb.sha_shen");
    notes.push(`搜「沙參」命中 ${shaShen.length} 列:${shaShen.join(", ")}`);
  } catch (e) {
    problems.push("別名搜尋檢查執行失敗:" + e.message);
  }

  /* B5 patternDifferentialVocab() 必須跟 patternPickerOptions 同源。
   * 那支函式的註解白紙黑字說自己「刻意用跟 patternPickerOptions 同一批來源,
   * 否則選出來的 id 會跟 tcmPatternSelections 對不起來,反查就會斷」——
   * 註解自律會腐爛(D31 拆 union 那次就腐爛過一次),所以在這裡驗。 */
  try {
    const vocabSrc = grab(appSrc, "patternDifferentialVocab");
    if (!vocabSrc) {
      problems.push("找不到 patternDifferentialVocab —— 它與 patternPickerOptions 的同源不變量無法驗");
    } else {
      vm.runInContext(vocabSrc, sb);
      const vocabIds = new Set(sb.patternDifferentialVocab().map((p) => p.id));
      const pickerIds = new Set(sb.patternPickerOptions().map((o) => o.value));
      const onlyVocab = [...vocabIds].filter((id) => !pickerIds.has(id));
      const onlyPicker = [...pickerIds].filter((id) => !vocabIds.has(id));
      if (onlyVocab.length || onlyPicker.length) {
        problems.push(`patternDifferentialVocab 與 patternPickerOptions 不同源:只在鑑別清單 ${onlyVocab.length} 筆(${onlyVocab.slice(0, 3).join(", ")})、只在 picker ${onlyPicker.length} 筆(${onlyPicker.slice(0, 3).join(", ")})`);
      } else {
        notes.push(`鑑別清單與 picker 同源:兩邊都是 ${vocabIds.size} 筆`);
      }
    }
  } catch (e) {
    problems.push("同源檢查執行失敗:" + e.message);
  }

  return { problems, notes, counts };
}

// ---------------- 負控 ----------------
function selfTest() {
  const os = require("os");
  const { spawnSync } = require("child_process");
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "picker-hygiene-selftest-"));
  const swap = (from, to) => {
    if (!app.includes(from)) throw new Error(`負控本身壞了:找不到「${from.slice(0, 50)}」`);
    return app.replace(from, to);
  };
  const cases = [
    ["把 herb picker 的 pickerLive() 拿掉(退役卡會上架)",
      () => swap("const records = pickerLive(globalThis.ACUTING_KNOWLEDGE?.herbs?.records);",
        "const records = globalThis.ACUTING_KNOWLEDGE?.herbs?.records || [];"), 1],
    ["把 easternDisease 的 legacy union 加回去",
      () => swap("  const tdis = pickerLive(k.tdisRegistry?.records);\n  return dedupeOptions(tdis.map((d) => ({",
        "  const tdis = [...pickerLive(k.tdisRegistry?.records), ...(k.conditions?.eastern_diseases || [])];\n  return dedupeOptions(tdis.map((d) => ({"), 1],
    ["把 ［療程背景］ 標示拿掉(白名單還在,只是不標示了)",
      () => swap("      label: `${TREATMENT_CONTEXT_LABEL_PREFIX}${c.name_zh || c.id}${c.name_en ? \" · \" + c.name_en : \"\"}`,",
        "      label: `${c.name_zh || c.id}${c.name_en ? \" · \" + c.name_en : \"\"}`,"), 1],
    ["把白名單換成前綴規則(等於沒有白名單)",
      () => swap("    .filter((c) => TREATMENT_CONTEXT_PICKER_ALLOWLIST.includes(c.id))",
        "    .filter((c) => String(c.id).startsWith(\"western_condition.\"))"), 1],
    ["picker 的 terms 拿掉別名(D21 沙參重導在輸入層失效)",
      () => swap("function pickerTerms(r, extra) {\n  return `${r.name_zh || \"\"} ${r.pinyin || \"\"} ${r.name_en || \"\"} ${(r.aliases_zh || []).join(\" \")} ${(r.aliases_en || []).join(\" \")} ${extra || \"\"} ${r.id}`.toLowerCase();",
        "function pickerTerms(r, extra) {\n  return `${r.name_zh || \"\"} ${r.pinyin || \"\"} ${r.name_en || \"\"} ${extra || \"\"} ${r.id}`.toLowerCase();"), 1],
    ["整支 herbPickerOptions 被改名(必須 fail loud,不得靜默跳過)",
      () => swap("function herbPickerOptions() {", "function herbPickerOptionsV2() {"), 1],
    ["不動任何東西(必須 PASS —— 證明前面的紅燈不是背景噪音)", () => app, 0],
  ];
  let pass = 0;
  const fails = [];
  cases.forEach(([label, mutate, expect], i) => {
    let src;
    try { src = mutate(); } catch (e) { fails.push(`${label} —— ${e.message}`); return; }
    const f = path.join(dir, `app-${i}.js`);
    fs.writeFileSync(f, src);
    const r = spawnSync(process.execPath, [__filename, "--app-src", f], { encoding: "utf8" });
    const got = r.status === 0 ? 0 : 1;
    if (got === expect) { pass++; console.log(`PASS  ${label}  → exit ${r.status}`); }
    else fails.push(`${label}:預期 exit ${expect ? "非 0" : "0"},實得 ${r.status}\n${(r.stdout || r.stderr || "").split("\n").slice(-5).join("\n")}`);
  });
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* 清不掉不影響結論 */ }
  console.log(`\n負控 ${pass}/${cases.length}`);
  if (fails.length) {
    console.error("\nFAIL —— 下列負控沒有得到預期結果:");
    fails.forEach((f) => console.error("  ⛔ " + f));
    process.exit(1);
  }
  console.log("PASS —— 這支閘在該紅的時候紅得起來,在該綠的時候也沒有亂紅。");
  process.exit(0);
}

if (SELF_TEST) selfTest();

const { problems, notes, counts } = evaluate(fs.readFileSync(APP_PATH, "utf8"));
console.log("D31 臨床 picker 身分衛生閘\n");
for (const name of PICKERS) {
  if (counts[name] === undefined) continue;
  const filtered = counts[name + "__deprecated_filtered"];
  console.log(`  ${name.padEnd(30)} ${String(counts[name]).padStart(4)} 列` + (filtered ? `   (擋掉 ${filtered} 筆退役)` : ""));
}
notes.forEach((n) => console.log("  · " + n));
if (problems.length) {
  console.error(`\nFAIL — ${problems.length} 個問題:`);
  problems.forEach((p) => console.error("  ⛔ " + p));
  process.exit(1);
}
console.log("\nPASS — 退役卡與白名單外的 legacy id 都沒有出現在任何 picker。");

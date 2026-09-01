#!/usr/bin/env node
/**
 * check-validation-ratchet.js — the CI gate for layers that are mid-cleanup.
 *
 * Two kinds of validator live in this repo:
 *
 *   GREEN   already passing. CI runs them directly; any failure blocks a merge.
 *   RATCHET a real, honest backlog (conditions 631 defects, patterns 250).
 *           Demanding zero would block every merge, so nobody would keep the
 *           gate on. Demanding "no worse than the committed baseline" is a gate
 *           that can actually stay on — and it makes the numbers only ever go
 *           down.
 *
 * This is the mechanism that answers the repo's real failure mode: 27 validators
 * existed on 2026-08-02 and nothing forced any of them to be run, so a batch was
 * reported complete and had to be re-measured by the next agent.
 *
 *   node scripts/check-validation-ratchet.js            # compare to baseline
 *   node scripts/check-validation-ratchet.js --update   # accept current as new
 *                                                       # baseline (only when
 *                                                       # counts went DOWN)
 *
 * A baseline is only ever allowed to move downward. `--update` refuses to
 * record a regression — that is the whole point of a ratchet.
 *
 * The ONE legitimate reason for a ceiling to rise is the measure getting
 * stricter (a validator learns a new defect class, so the same data counts
 * higher). That path is explicit and leaves a paper trail:
 *
 *   node scripts/check-validation-ratchet.js --rebaseline "C10 added: verbatim-shared content"
 *
 * `--rebaseline` requires a reason, records it (with date) in the baseline
 * file, and is the only way a number goes up. Using it to absorb a real data
 * regression instead of a validator change is a constitution §D.17 violation.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = "data/audits/validation_baseline.json";

// Each entry: run the validator with --json and read `defects` (or a custom
// extractor). Adding a layer here is how it joins the ratchet.
const RATCHETED = [
  {
    key: "conditions",
    script: "scripts/validate-condition-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/CONDITION_CARD_TEMPLATE.md",
  },
  {
    key: "patterns",
    script: "scripts/validate-pattern-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/PATTERN_CARD_TEMPLATE.md",
  },
  {
    key: "tdis",
    script: "scripts/validate-tdis-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/TDIS_CARD_TEMPLATE.md",
  },
  {
    key: "symptoms",
    script: "scripts/validate-symptom-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/SYMPTOM_CARD_TEMPLATE.md",
  },
  {
    key: "naming",
    script: "scripts/validate-naming.js",
    args: [],
    // validate-naming has no --json; count its "FAIL:" lines.
    extract: (out) => (out.match(/^FAIL:/gm) || []).length,
    detail: () => null,
    doc: "DECISIONS.md D3",
  },
  {
    key: "encoding",
    script: "scripts/validate-encoding.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-24 加入：中文欄位裝英文（chinese_field_without_cjk）與匯入殘留的
    // 置換字元，一度 13,201 筆而完全沒有 gate ——「Ting 在中文欄看到英文」是
    // 每天都看得到的內容缺陷，卻能無聲增長。方劑主治／現代運用回填後入棘輪。
    doc: "data/audits/en_zh_term_crosswalk.json",
  },
  {
    key: "formula_correctness",
    script: "scripts/validate-formula-correctness.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-24：修掉兩個驗證器誤判（is_alternate 替代註記與 deprecated 退役
    // 記錄本不該算進結構檢查）後，剩 2 筆真缺陷需要 TCM 判斷才能結案（四神丸
    // 名稱編碼 4 味 vs 實際 6 味的藥引歸類；甘麥大棗湯無君藥標註）——留給 Ting。
    doc: "scripts/validate-formula-correctness.js",
  },
  {
    key: "formula_dose_staging",
    script: "scripts/validate-formula-dose-staging.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-24：修掉一個驗證器誤判（加工法改了 pinyin 但 herb_id 兩邊一致
    // 時不該算查無此藥）後，剩 1 筆真待解：銀翹散的「Zhu Ye／竹葉」與該方
    // 組成寫的「Dan Zhu Ye／淡竹葉」是藥典裡不同的兩味藥，herb_id 明確標成
    // pending——需要人工核對 HKBU 來源掃描頁後才能定案，不是我能猜的。
    doc: "data/imports/formula_doses/formula_dose_staging.json",
  },
  {
    key: "relation_integrity",
    script: "scripts/validate-relation-registry-integrity.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-27:D13 登記了 29 條邊,但沒有東西檢查那些欄位裡的 id 指得到
    // 東西。首次掃描 32 筆懸空,其中 12 筆是代碼慣例錯(RN→CV 任脈、
    // SJ→TE 三焦,本庫正典一律 CV/TE)當場修掉;剩 20 筆是前向引用 ——
    // 該連的卡還沒建(cond.stroke、formula.jiao_tai_wan、白虎湯家族三方…)。
    // 那是內容缺口不是結構錯,歸 fill 線;棘輪保證不再變多。
    doc: "data/config/relation_registry.json",
  },
  {
    key: "content_quality",
    script: "scripts/validate-content-quality.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-27 接線(W2-2):寫好但從未接線。缺陷數 = 實質內容覆蓋率
    // <50% 的欄位數(現 5:361 穴的 muscles/nerves 全空、方劑 indications_zh、
    // 方義 4%、中藥性味 21%)。這是 fill 線的長期回填面,棘輪保證不再變多。
    doc: "docs/HERB_CARD_TEMPLATE.md",
  },
  {
    key: "herb_canon",
    script: "scripts/validate-herb-canon.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-27 接線(W2-2):寫好但從未接線。5,577 筆裡壓倒性多數是同一個
    // schema 塊(english_exam_track)在 164 張卡缺欄位 —— 結構性積欠,要求
    // 一次歸零會擋住每一次 merge,於是沒人會留著這個 gate。棘輪只准降。
    doc: "docs/HERB_CARD_TEMPLATE.md",
  },
  {
    key: "herb_card_schema",
    script: "scripts/validate-herb-card-schema.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-27 接線(W2-2)。6 筆全是 H5 中英陣列不對齊,逐筆看過:兩側
    // 各自有對方沒有的真內容(珍珠母英文多兩條、青木香中文多一條),刪任何
    // 一邊都是丟內容,補齊需要中醫判斷 —— 屬 fill 線,不是機械修得掉的。
    doc: "docs/HERB_CARD_TEMPLATE.md",
  },
  {
    key: "curriculum_anchors",
    script: "scripts/validate-curriculum-anchor-resolution.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    // 2026-08-31 接線。32 筆:A2 行號超出 19 + A1 檔案不存在 6 + A3 頁碼超出 7。
    // 根因不是有人引錯 —— `ebef2401` 重新抽取了兩個 Chenoweth 課件
    // (mm_abbreviated 9006→3474 行、herb_functions 2281→1010 行),在那之前寫的
    // `#L` 錨點一次全失效。這 19 筆是「超界所以看得出來」的部分;另有 28 筆仍落在
    // 新檔範圍內、卻指到不相干段落,這支**抓不到**(pair.lu_dou__gan_cao 即此型,
    // 靠人回去讀才發現)。所以天花板降到 0 也不等於錨點全對。
    // A1 的 6 筆是純改名/搬家(TRIPLE BURNER→SAN JIAO 5 筆、Formulations Summary
    // Chart 少一層目錄 1 筆),機械修得掉;A2/A3 要等課件檔本身的處置裁定。
    doc: "docs/AI_CONSTITUTION.md",
  },
  // retired_id_references sat here one day (2026-08-26, ceiling 10) while the
  // D21 herb_pairs residue and D16 pattern re-references were redirected and
  // Ting ruled on 敗毒散→人參敗毒散 (D22). Baseline hit 0 the same day — it
  // graduated into the blocking `green` job in validate.yml, like point_ids.
  //
  // point_ids sat here temporarily (ceiling 72) while the extra-point line
  // backfilled the D2 ids. Done 2026-08-06 — it graduated into the blocking
  // `green` job in .github/workflows/validate.yml. That is the intended life
  // of a ratchet entry: hold the line, then leave.
];

/* 用 spawnSync 而不是 execFileSync,是為了把離開碼帶回來。
   2026-09-01:某支驗證器硬當機(exit -1073740791),舊版的 catch 只回傳
   `stdout + stderr` —— 而硬當機時兩者都是空的,於是下面那句 RATCHET ERROR
   後面印出一片空白,連「它是掛了還是格式變了」都分不出來,只能用猜的。
   離開碼是唯一能分辨這兩件事的證據,不能丟。 */
function run(script, args) {
  const r = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });
  // 這些驗證器有缺陷時本來就 exit 1 —— 那是預期的,不是錯誤。
  return {
    out: `${r.stdout || ""}${r.stderr || ""}`,
    status: r.status, signal: r.signal, spawnError: r.error,
  };
}

const UPDATE = process.argv.includes("--update");
const rbIdx = process.argv.indexOf("--rebaseline");
const REBASELINE = rbIdx >= 0;
const REBASELINE_REASON = REBASELINE ? process.argv[rbIdx + 1] : null;
if (REBASELINE && (!REBASELINE_REASON || REBASELINE_REASON.startsWith("--"))) {
  console.error("--rebaseline requires a reason string, e.g. --rebaseline \"C10 added: ...\"");
  process.exit(2);
}
const baselinePath = path.join(ROOT, BASELINE);
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, "utf8"))
  : { note: "", layers: {} };

const current = {};
for (const entry of RATCHETED) {
  const res = run(entry.script, entry.args);
  const out = res.out;
  let count;
  try {
    count = entry.extract(out);
  } catch {
    console.error(`RATCHET ERROR: could not read a defect count from ${entry.script}.`);
    /* 以下三種是完全不同的故障,舊版印同一句話。分開講,不然下次還是要重猜。
       判準是**離開碼**,不是「輸出空不空」——第一版寫成看輸出,負向測試立刻打臉:
       `process.abort()` 會吐原生堆疊、模組找不到會吐 loader 錯誤,兩者輸出都非空,
       於是三條分支全落到同一句。真正的 0xC0000409 才是一個字都不印的。
       正常跑完的驗證器只會是 exit 0(PASS)或 1(有缺陷);其餘一律是它自己掛了。 */
    const abnormalExit = res.status !== 0 && res.status !== 1;
    const nodeCrashSignature =
      /(^|\n)\s*(node:internal|Error: Cannot find module|FATAL ERROR|-+ Native stack trace)/.test(out);
    if (res.spawnError) {
      console.error(`  子行程起不來:${res.spawnError.message}`);
    } else if (abnormalExit || res.signal || nodeCrashSignature) {
      console.error(`  **驗證器自己掛了**,不是缺陷數變多 —— 不要照著去改資料。`);
      console.error(`  exit=${res.status}, signal=${res.signal || "none"}, 輸出 ${out.length} 字元。`);
      if (out.trim() === "") {
        console.error("  一個字都沒印出來。Windows 上 exit=-1073740791 (0xC0000409) 是 node 的");
        console.error("  通用 abort 碼,不專指堆疊溢位;2026-09-01 遇過一次間歇當機,27 次未重現,根因未知。");
      }
    } else {
      console.error(`  子行程正常跑完(exit=${res.status})但抽不出數字,共 ${out.length} 字元。`);
      console.error("  多半是報表格式改了而 extract() 沒跟上,不是資料變壞。");
    }
    console.error(out.slice(0, 400));
    process.exit(2);
  }
  current[entry.key] = { defects: count, by_code: entry.detail(out) || undefined, doc: entry.doc };
}

let regressed = false;
let improved = false;
const lines = [];
for (const entry of RATCHETED) {
  const now = current[entry.key].defects;
  const was = baseline.layers?.[entry.key]?.defects;
  if (was === undefined) {
    lines.push(`  NEW      ${entry.key.padEnd(12)} ${now}  (no baseline yet)`);
    improved = true;
    continue;
  }
  if (now > was) {
    lines.push(`  REGRESS  ${entry.key.padEnd(12)} ${was} → ${now}   (+${now - was})  see ${entry.doc}`);
    regressed = true;
  } else if (now < was) {
    lines.push(`  BETTER   ${entry.key.padEnd(12)} ${was} → ${now}   (−${was - now})`);
    improved = true;
  } else {
    lines.push(`  flat     ${entry.key.padEnd(12)} ${now}`);
  }
}

console.log("validation ratchet — defect counts vs committed baseline\n");
lines.forEach((l) => console.log(l));
console.log("");

if (UPDATE || REBASELINE) {
  if (regressed && !REBASELINE) {
    console.error("REFUSED to update the baseline: a count went UP.");
    console.error("A ratchet only moves one way. If a VALIDATOR got stricter (not the data worse),");
    console.error("use: --rebaseline \"<which check was added and why>\"");
    process.exit(1);
  }
  const next = {
    note: "Defect-count ceiling per layer. CI fails if any count rises. Only ever lower this file — see scripts/check-validation-ratchet.js.",
    updated_at: new Date().toISOString().slice(0, 10),
    ...(REBASELINE ? {
      rebaseline_history: [
        ...(baseline.rebaseline_history || []),
        { date: new Date().toISOString().slice(0, 10), reason: REBASELINE_REASON },
      ],
    } : baseline.rebaseline_history ? { rebaseline_history: baseline.rebaseline_history } : {}),
    layers: Object.fromEntries(Object.entries(current).map(([k, v]) => [k, { defects: v.defects, by_code: v.by_code, doc: v.doc }])),
  };
  fs.writeFileSync(baselinePath, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log(`baseline ${REBASELINE ? "REBASELINED (" + REBASELINE_REASON + ")" : "updated"} → ${BASELINE}`);
  process.exit(0);
}

if (regressed) {
  console.error("FAIL — a layer got worse than the committed baseline.");
  console.error("Fix the new defects. (Only if a VALIDATOR was tightened — not the data made");
  console.error("worse — record it: check-validation-ratchet.js --rebaseline \"<what changed>\")");
  process.exit(1);
}
console.log(improved ? "PASS — no regressions (and something improved; run --update to lock it in)." : "PASS — no regressions.");

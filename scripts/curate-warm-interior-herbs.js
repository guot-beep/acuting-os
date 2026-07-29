#!/usr/bin/env node
/**
 * curate-warm-interior-herbs.js — 溫裡藥 8 味升級成模板級（第一批中藥卡）。
 *
 * Ting: 「方劑先停 我想先完整中藥卡」
 *
 * 中藥卡的缺口不是「沒有中文」—— 中文 98% 都有。缺的是 docs/HERB_RECORD_STANDARD.md
 * 早就規定、但從來沒有真的做出來的那一層：
 *
 *   functions_zh 只放傳統功效、濃縮到 3–5 條，並與 actions_en 逐條對齊
 *
 * 現況是 functions_zh 裝的是**原始抓取的功效標籤庫**（311 個詞、平均一味 5 條、
 * 89 味超過 6 條），花椒有 18 條而且包含「清熱利尿」——一味辛熱藥不會清熱利尿，
 * 那是關鍵字比對抓來的。所以中英配不起來（260 味裡只有 1 味長度對得上），
 * 卡片只好中英分開顯示。
 *
 * 這一批做的事，每一件都是搬移或對照，沒有一件是憑空生成：
 *
 *   1  actions_en ← 課件的 "Main Actions" 條列**逐字照抄**。
 *      每一條都 assert 必須在課件原文裡找得到，找不到就不寫檔。
 *   2  functions_zh ← 對應每一條英文的標準中藥學術語，**逐條對齊**。
 *      這是中英對照，不是翻譯發揮；來源同時記課件頁碼與「標準術語對應」。
 *   3  function_tags_zh ← 原本那份標籤庫**整份保留**，只是換到搜尋層。
 *      §0 只加深不刪除 —— 舊清單一個字都沒有丟，assert 會檢查。
 *   4  contraindications_zh ← 從既有 cautions_zh 裡**把「禁服/忌服」挑出來**。
 *      E7 要求模板級必須有禁忌；這些句子本來就在，只是跟「慎服」混在同一欄。
 *
 * 不升級的會列出來，不會為了湊數而補：高良薑在這份課件只給一條主功效
 * （"Warms the middle Jiao and alleviates pain"），低於模板下限 2 條。
 * 補第二條就是我自己編的，所以它留在非模板級，等其他課件補。
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const SRC = "curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md";
const CITE = "curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf";
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc;
const lecture = fs.readFileSync(path.join(ROOT, SRC), "utf8");

/* 每一條 en 都是課件 "Main Actions" 的原文；zh 是它對應的標準中藥學術語。
   兩個陣列同一個索引講的是同一件事 —— 這正是卡片成對顯示的前提。 */
const BATCH = {
  "附子": {
    page: 2,
    en: [
      "Revives the yang and restores devastated yang",
      "Augments fire and assists the Yang",
      "Disperses cold-dampness, warms the channels and alleviates pain"
    ],
    zh: ["回陽救逆", "補火助陽", "散寒除濕、溫經止痛"]
  },
  "乾薑": {
    page: 5,
    en: ["Warms the middle Jiāo", "Restores devastated yang", "Warms the Lung and transforms phlegm"],
    zh: ["溫中散寒", "回陽通脈", "溫肺化飲"]
  },
  "肉桂": {
    page: 6,
    en: [
      "Warms the Kidney yang and augments the Ming Men fire",
      "Disperses cold and alleviates pain",
      "Warms channels and vessels"
    ],
    zh: ["補火助陽、溫腎壯陽", "散寒止痛", "溫通經脈"]
  },
  "吳茱萸": {
    page: 7,
    en: [
      "Warms the middle, disperses cold, and alleviates pain",
      "Redirects rebellious qi downward",
      "Smoothes the Liver",
      "Dries dampness"
    ],
    zh: ["溫中散寒止痛", "降逆止嘔", "疏肝解鬱", "燥濕"]
  },
  "花椒": {
    page: 9,
    en: ["Warms the middle jiao, alleviates pain", "Kills parasites."],
    zh: ["溫中止痛", "殺蟲"]
  },
  "丁香": {
    page: 10,
    en: ["Warms the middle jiao and directs rebellious qi downward.", "Warms and assists Kidney yang."],
    zh: ["溫中降逆", "溫腎助陽"]
  },
  "小茴香": {
    page: 11,
    en: ["Disperses cold, and relieves pain", "Regulates qi (liver and Stomach) and harmonizes the Stomach"],
    zh: ["散寒止痛", "理氣和胃"]
  }
};

// 課件只給一條主功效，低於模板下限 2 條 —— 不補第二條，留在非模板級。
const HELD_BACK = {
  "高良薑": '課件只有一條 Actions（"Warms the middle Jiao and alleviates pain"），低於 E8 的 2 條下限；補第二條就是自己編的'
};

/* 現代藥理用語，混在傳統功效標籤庫裡。搬到 modern_functions_zh，不刪。
   HERB_RECORD_STANDARD.md：functions_zh 只放傳統功效，現代藥理絕不混進來。 */
const MODERN_TERM = /^(保肝|利膽|降脂|延緩衰老|鎮靜安神|鎮痛解熱|鎮咳祛痰)$/;
// 「禁服/忌服/禁用/不宜/不可」= 禁忌；「慎服/慎用」= 注意事項，留在 cautions_zh。
const IS_CONTRA = /禁服|忌服|禁用|忌用|不宜|不可/;

const byName = new Map(recs.map((r) => [String(r.name_zh || "").trim(), r]));
const fail = [];
const report = [];

for (const [name, spec] of Object.entries(BATCH)) {
  const r = byName.get(name);
  if (!r) { fail.push(`${name}: 正名表裡沒有這味藥`); continue; }
  if (r.category_zh !== "溫裡藥") {
    fail.push(`${name}: category_zh 是「${r.category_zh}」而不是溫裡藥 —— 這一批的範圍錯了`);
    continue;
  }

  // ── assert 1：每一句英文都必須在課件原文裡找得到 ──
  // ST 經那一輪，這條 assert 擋下 9 次；每一次都是寫的人記錯，不是課件錯。
  for (const line of spec.en) {
    if (!lecture.includes(line)) {
      fail.push(`${name}: 「${line}」在課件裡找不到逐字對應 —— 不可寫入`);
    }
  }
  // ── assert 2：中英必須等長，否則英文會整排錯位（而畫面上看不出來）──
  if (spec.en.length !== spec.zh.length) {
    fail.push(`${name}: 中文 ${spec.zh.length} 條 vs 英文 ${spec.en.length} 條`);
    continue;
  }
  // ── assert 3：E8 模板級 functions_zh 必須 2–6 條 ──
  if (spec.zh.length < 2 || spec.zh.length > 6) {
    fail.push(`${name}: ${spec.zh.length} 條，超出模板的 2–6 條`);
    continue;
  }

  const oldFunctions = [...(r.functions_zh || [])];

  // 3  舊標籤庫整份移到搜尋層；現代藥理用語改掛現代藥理欄
  const toModern = oldFunctions.filter((t) => MODERN_TERM.test(t));
  const toTags = oldFunctions.filter((t) => !MODERN_TERM.test(t));
  r.function_tags_zh = [...new Set([...(r.function_tags_zh || []), ...toTags])];
  if (toModern.length) {
    r.modern_functions_zh = [...new Set([...(r.modern_functions_zh || []), ...toModern])];
  }

  // ── assert 4：舊清單一個字都不能消失（§0 只加深不刪除）──
  const kept = new Set([...r.function_tags_zh, ...(r.modern_functions_zh || [])]);
  const lost = oldFunctions.filter((t) => !kept.has(t));
  if (lost.length) fail.push(`${name}: 舊 functions_zh 有 ${lost.length} 條不見了：${lost.join("、")}`);

  // 1+2  寫入成對的功效層
  r.functions_zh = spec.zh;
  r.actions_en = spec.en;

  // 4  從既有 cautions_zh 把禁忌挑出來（搬移，不新寫）
  const cautions = (r.cautions_zh || []).map(String);
  const contra = cautions.filter((c) => IS_CONTRA.test(c));
  const stillCaution = cautions.filter((c) => !IS_CONTRA.test(c));
  if (contra.length) {
    r.contraindications_zh = [...new Set([...(r.contraindications_zh || []), ...contra])];
    r.cautions_zh = stillCaution;
  }
  // ── assert 5：E7 模板級必須有禁忌 ──
  if (!(r.contraindications_zh || []).length) {
    fail.push(`${name}: 沒有 contraindications_zh，升級成模板級會直接違反 E7`);
  }
  // ── assert 6：搬移前後禁忌+注意的總數不能變 ──
  if ((r.contraindications_zh || []).length + (r.cautions_zh || []).length < cautions.length) {
    fail.push(`${name}: cautions_zh 拆成禁忌/注意之後條目變少了`);
  }

  r.field_sources = r.field_sources || {};
  r.field_sources.actions_en = [`${CITE}#p${spec.page}（Main Actions 逐字照抄）`];
  r.field_sources.functions_zh = [
    `${CITE}#p${spec.page}（與 actions_en 逐條對應）`,
    "中文為標準中藥學術語對應，非逐字翻譯"
  ];
  r.field_sources.function_tags_zh = ["原 functions_zh 標籤庫（搜尋層，未經課件核對）"];
  if (contra.length) r.field_sources.contraindications_zh = ["由既有 cautions_zh 依「禁服/忌服」挑出，未新增內容"];

  report.push({ name, n: spec.zh.length, tags: toTags.length, modern: toModern.length, contra: contra.length });
}

console.log("溫裡藥 —— 第一批模板級中藥卡");
console.log(`  課件：${SRC}\n`);
console.log("  藥名      功效  搜尋標籤  移入現代藥理  禁忌");
report.forEach((x) =>
  console.log(`  ${x.name.padEnd(5, "　")}   ${String(x.n).padStart(2)} 條    ${String(x.tags).padStart(2)} 條      ${String(x.modern).padStart(2)} 條        ${String(x.contra).padStart(2)} 條`));

console.log(`\n  升級 ${report.length} 味`);
for (const [name, why] of Object.entries(HELD_BACK)) {
  console.log(`  保留不升級：${name} —— ${why}`);
}

const sample = byName.get("附子");
if (sample && sample.functions_zh) {
  console.log("\n  抽驗 附子 中英成對：");
  sample.functions_zh.forEach((zh, i) => console.log(`    ${zh.padEnd(10, "　")} ${sample.actions_en[i]}`));
}

if (fail.length) {
  console.error(`\n❌ ${fail.length} 項不通過 —— 不寫入`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\n✅ 每句英文都在課件原文裡；中英逐條對齊；舊標籤一條都沒丟");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(doc, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/herb_canon_shortlist.json");

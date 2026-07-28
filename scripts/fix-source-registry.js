#!/usr/bin/env node
/**
 * fix-source-registry.js — make the Sources page usable.
 *
 * Ting browses these sites constantly and asked for the registry entries to be
 * real links. Three problems were in the way.
 *
 * 1 · MOJIBAKE — 13 of 43 entries lost their Chinese to the same encoding bug
 *     that hit the formulas: "????????????". The `id` and `url` survived, so
 *     the identity of the source is not actually lost, only its label.
 *
 *     Names are restored ONLY where the surviving evidence determines them:
 *     `hkbu_cmfid` + library.hkbu.edu.hk/electronic/libdbs/cmfid/ is the HKBU
 *     Chinese Medicine Formulae Images Database — the id is the database's own
 *     acronym and the URL is its own path. That is derivation, not invention.
 *     Restored names are English, marked `name_restored_from: "id+url"`, and
 *     the Chinese title is left for Ting because guessing a Chinese title from
 *     an English acronym IS invention.
 *
 *     Entries whose id is not descriptive keep a plain "(名稱待補)" label.
 *
 * 2 · DESTROYED TAG ARRAYS — `category: ["??"]`, `primary_use: ["??","??"]`.
 *     No information survives; they render as rows of question marks. Cleared,
 *     same rule as the formula mojibake (§0's exception).
 *
 * 3 · MISSING ENTRY — chinesemedicineatlas, which Ting named directly and which
 *     the herb pipeline already lists as a Tier-2 source, was in the pipeline
 *     doc but not in the registry the Sources page reads.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/sources/source_registry.json");
const APPLY = process.argv.includes("--apply");

const MOJI = /\?{2,}|�/;
const lostRatio = (s) => ((String(s).match(/[?�]/g) || []).length) / Math.max(1, String(s).length);

// id + url determine these; nothing here is invented.
const RESTORE = {
  hkbu_cmfid: "HKBU Chinese Medicine Formulae Images Database (CMFID)",
  cckf_tcm_database: "CCKF TCM Cross-Database Search (cckf.org)",
  tcmip: "TCMIP — Integrative Pharmacology-based Research Platform of TCM",
  hkcmms: "Hong Kong Chinese Materia Medica Standards (HKCMMS)",
  kmuh_herbal_formula_collection: "KMUH Herbal Formula Collection（高雄醫學大學附設醫院）",
  wanfang_tcm_knowledge: "Wanfang TCM Knowledge Database（萬方）",
  contemporary_acupuncture_archive: "Contemporary Acupuncture Teaching Archive（名稱待補）",
  china_taiwan_tcm_web_references: "China / Taiwan TCM Web References（名稱待補）"
};

const ATLAS = {
  id: "chinese_medicine_atlas",
  name: "TCM Herb Atlas (chinesemedicineatlas.com)",
  url: "https://chinesemedicineatlas.com/tcm_herb_atlas/",
  layer: "herb_glance_presentation",
  source_group: "TCM_C_herbs_pharmacology",
  tier: "B",
  language: "en",
  category: ["中藥"],
  authority: 3,
  review_status: "source_checked",
  primary_use: ["toned pinyin", "channel abbreviations", "plain-English indications", "glance-layer presentation"],
  fields_to_extract: ["pinyin_toned", "channels_entered", "indications_en"],
  notes: "Ting 指定的常用參考站，中藥 Tier-2 第三順位（CloudTCM → American Dragon → 本站）。目前只有索引頁，沒有可推導的單味藥網址；架構呈現方式是這站的主要價值。"
};

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const sources = data.sources;

let renamed = 0, clearedTags = 0, stillBroken = [];

for (const s of sources) {
  if (MOJI.test(String(s.name || "")) && lostRatio(s.name) > 0.3) {
    if (RESTORE[s.id]) {
      s.name = RESTORE[s.id];
      s.name_restored_from = "id+url（原中文名於匯入時編碼遺失，中文標題待 Ting 補）";
      renamed++;
    } else {
      stillBroken.push(`${s.id}：${s.name}`);
    }
  }
  for (const f of ["category", "primary_use", "fields_to_extract"]) {
    if (!Array.isArray(s[f])) continue;
    const before = s[f].length;
    s[f] = s[f].filter((v) => !(MOJI.test(String(v)) && lostRatio(v) > 0.5));
    clearedTags += before - s[f].length;
  }
}

if (!sources.some((s) => s.id === ATLAS.id)) sources.push(ATLAS);

const withUrl = sources.filter((s) => s.url).length;
console.log("來源登記整理");
console.log(`  來源總數                ${sources.length}`);
console.log(`  有可點連結的            ${withUrl}/${sources.length}`);
console.log(`  修復亂碼名稱            ${renamed}（由 id + url 推得，標 name_restored_from）`);
console.log(`  清掉全毀的標籤          ${clearedTags} 條`);
console.log(`  新增 chinesemedicineatlas`);
if (stillBroken.length) {
  console.log(`\n  ⚠️ 名稱仍是亂碼、id 也看不出是什麼的 ${stillBroken.length} 筆（需要 Ting 指認）:`);
  stillBroken.forEach((b) => console.log("    " + b));
}
console.log("\n無線上連結的來源（紙本／付費，正常）:");
sources.filter((s) => !s.url).forEach((s) => console.log(`  ${s.name}`));

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/sources/source_registry.json");

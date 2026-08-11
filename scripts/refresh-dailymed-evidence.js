/* dailymed_api_responses.json 誠實重建(2026-08-11,Ting 核准)
 *
 * 背景:pharm enrich 批次發現本檔對真實標籤「過度宣稱」——8 藥聲稱有
 * BOXED_WARNING 但標籤沒有、10 藥聲稱 USE_IN_SPECIFIC_POPULATIONS、2 藥
 * 聲稱 MECHANISM_OF_ACTION。verified_sections 是 P0 防捏造防線的證據,
 * 必須 = 「當日實際抓取 SPL 後真的看到的節」,不能手寫。
 *
 * 作法:對 drugs.json 每筆的 dailymed_setid 實抓 SPL XML,以 LOINC 節碼
 * 對照出現的節,重寫該藥 entry(保持既有欄位形狀)。網路失敗的藥保留
 * 舊 entry 並列入 stderr 警告——絕不無資料就改寫證據。
 *
 * 用法:node scripts/refresh-dailymed-evidence.js [--dry-run]
 */
"use strict";
const fs = require("fs");

// 節名對照涵蓋 drugs.json field_sources 實際引用的全部 anchor
// (ADVERSE_REACTIONS/BOXED_WARNING/CLINICAL_PHARMACOLOGY/CONTRAINDICATIONS/
//  DESCRIPTION/DO_NOT_USE/INDICATIONS_AND_USAGE/MECHANISM_OF_ACTION/
//  PHARMACODYNAMICS/USE_IN_SPECIFIC_POPULATIONS/WARNINGS/WARNINGS_AND_PRECAUTIONS)。
const LOINC_TO_NAME = {
  "34070-3": "CONTRAINDICATIONS",
  "43685-7": "WARNINGS_AND_PRECAUTIONS",
  "34071-1": "WARNINGS",                      // 舊式(non-PLR)WARNINGS
  "34084-4": "ADVERSE_REACTIONS",
  "34067-9": "INDICATIONS_AND_USAGE",
  "43684-0": "USE_IN_SPECIFIC_POPULATIONS",
  "43679-0": "MECHANISM_OF_ACTION",
  "34066-1": "BOXED_WARNING",
  "34073-7": "DRUG_INTERACTIONS",
  "34068-7": "DOSAGE_AND_ADMINISTRATION",
  "34090-1": "CLINICAL_PHARMACOLOGY",
  "43681-6": "PHARMACODYNAMICS",
  "34089-3": "DESCRIPTION",
  "50570-1": "DO_NOT_USE",                    // OTC Drug Facts
  "42232-9": "PRECAUTIONS",                   // 舊式(non-PLR)
  "42228-7": "PREGNANCY",
  "77290-5": "LACTATION",
  "34088-5": "OVERDOSAGE",
};

const dry = process.argv.includes("--dry-run");
const DRUGS = "data/pharmacology/drugs.json";
const EVID = "data/pharmacology/dailymed_api_responses.json";
const today = (() => {
  // 允許以環境變數固定日期(重現性);預設當日
  return process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
})();

(async () => {
  const drugs = JSON.parse(fs.readFileSync(DRUGS, "utf8"));
  const recs = drugs.records || drugs;
  const evid = JSON.parse(fs.readFileSync(EVID, "utf8"));
  const byId = new Map(evid.map((e) => [e.drug_id, e]));
  let refreshed = 0, failed = 0, changedSections = 0;

  for (const r of recs) {
    const e = byId.get(r.id);
    if (!e) { console.error(`WARN no evidence entry for ${r.id} — skipped`); continue; }
    try {
      const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${r.dailymed_setid}.xml`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const xml = await resp.text();
      // 屬性順序不可假設(各廠 SPL 排法不同):逐 <code> tag 解析,
      // code= 與 codeSystem= 各自在 tag 內找。
      const found = new Set();
      for (const tag of xml.matchAll(/<code\s+([^>]*)\/?>/g)) {
        const attrs = tag[1];
        if (!/codeSystem="2\.16\.840\.1\.113883\.6\.1"/.test(attrs)) continue;
        const cm = attrs.match(/\bcode="([\d-]+)"/);
        const name = cm && LOINC_TO_NAME[cm[1]];
        if (name) found.add(name);
      }
      const title = (xml.match(/<title>([^<]{5,120})<\/title>/) || [])[1];
      const before = JSON.stringify([...(e.verified_sections || [])].sort());
      const after = JSON.stringify([...found].sort());
      if (before !== after) changedSections++;
      e.setid = r.dailymed_setid;
      e.title = r.dailymed_label_title || e.title;
      e.verified_sections = [...found].sort();
      e.source_endpoint = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${r.dailymed_setid}.json`;
      e.metadata_endpoint = e.source_endpoint;
      e.spl_xml_endpoint = url;
      e.retrieved_date = today;
      if (title && !e.title) e.title = title;
      refreshed++;
      process.stdout.write(".");
    } catch (err) {
      failed++;
      console.error(`\nWARN ${r.id}: fetch failed (${err.message}) — old entry kept`);
    }
  }
  console.log(`\nrefreshed ${refreshed}/40 · fetch-failed ${failed} · section-lists changed ${changedSections}`);
  if (!dry) { fs.writeFileSync(EVID, JSON.stringify(evid, null, 1) + "\n"); console.log("written:", EVID); }
  else console.log("(dry-run, not written)");
})();

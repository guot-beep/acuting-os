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

/* 未編碼的黑框(2026-09-07,furosemide 案):
 * 有些廠的 SPL 把黑框全文放在**第一個 section**、標題「WARNING」、code 42229-5(SPL UNCLASSIFIED)或沒有 code,
 * 沒有用 34066-1。只認 LOINC 的話,verified_sections 就沒有 BOXED_WARNING,下游「未列黑框警語」的註記就成了假陰性
 * (2026-09-06 覆核抓到,已撤回那筆)。這裡多一條判準:在第一個「已分類」section(DESCRIPTION 34089-3 等)**之前**出現、
 * 標題以 WARNING 開頭的 section → 記成 BOXED_WARNING_UNCODED。它與 BOXED_WARNING 分開記,因為「有黑框」與「編了碼」是兩件事。
 * 下游規則要把兩者都當「有黑框」。 */
function detectUncodedBoxedWarning(xml) {
  const sections = [...String(xml).matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[1]);
  for (const body of sections) {
    const codeTag = body.match(/<code\s+([^>]*)\/?>/);
    const attrs = codeTag ? codeTag[1] : "";
    const cm = attrs.match(/\bcode="([\d-]+)"/);
    const code = cm ? cm[1] : null;
    if (code && LOINC_TO_NAME[code]) return false;          // 走到第一個已分類 section 就停:黑框只會在它前面
    const title = (body.match(/<title>\s*([^<]{1,200}?)\s*<\/title>/) || [])[1] || "";
    if (/^(BOXED\s+)?WARNINGS?\b/i.test(title)) return true;
  }
  return false;
}

if (process.argv.includes("--self-test")) {
  const wrap = (inner) => `<document>${inner}</document>`;
  const sec = (code, title, text) => `<component><section>${code ? `<code code="${code}" codeSystem="2.16.840.1.113883.6.1"/>` : ""}<title>${title}</title><text>${text}</text></section></component>`;
  const cases = [
    ["furosemide 型:首節 42229-5 標題 WARNING,之後才是 DESCRIPTION", wrap(sec("42229-5", "WARNING", "Furosemide tablets are a potent diuretic...") + sec("34089-3", "DESCRIPTION", "...") + sec("34071-1", "WARNINGS", "...")), true],
    ["首節沒有 code、標題 BOXED WARNING", wrap(sec(null, "BOXED WARNING", "...") + sec("34089-3", "DESCRIPTION", "...")), true],
    ["正常標籤:WARNINGS(34071-1)在 DESCRIPTION 之後 → 不是黑框", wrap(sec("34089-3", "DESCRIPTION", "...") + sec("34071-1", "WARNINGS", "...")), false],
    ["編了碼的黑框 34066-1:這條判準不管它(LOINC 那條會記 BOXED_WARNING)", wrap(sec("34066-1", "WARNING: RISK", "...") + sec("34089-3", "DESCRIPTION", "...")), false],
    ["首節是 INDICATIONS(已分類)→ 後面的 WARNING 不算", wrap(sec("34067-9", "INDICATIONS AND USAGE", "...") + sec("42229-5", "WARNING", "...")), false],
    ["空文件", wrap(""), false],
  ];
  let bad = 0;
  for (const [name, xml, want] of cases) { const got = detectUncodedBoxedWarning(xml); console.log(`  ${got === want ? "✓" : "✗"} ${name} → ${got}`); if (got !== want) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條(離線,不打 DailyMed)`);
  process.exit(bad ? 1 : 0);
}
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
      if (detectUncodedBoxedWarning(xml)) found.add("BOXED_WARNING_UNCODED");   // 見檔頭:furosemide 型未編碼黑框
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

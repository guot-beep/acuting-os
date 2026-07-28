#!/usr/bin/env node
/**
 * link-herb-sources.js — the source + link layer for all 260 herb cards.
 *
 * Ting's ask: every herb card should carry the links and the per-field
 * citations — CloudTCM, American Dragon, chinesemedicineatlas, and one or two
 * curriculum citations.
 *
 * ⚠️ All three sites are blocked by this environment's network policy (the
 * gateway answers 403 to CONNECT), so nothing here was fetched. That decides
 * what is honest to write, and the three sites end up treated differently:
 *
 *   CloudTCM — VERIFIED. data/imports/cloudtcm/herb_url_map.json holds 202
 *     exact-name matches against CloudTCM's public index, each with
 *     verified:true and the verification method recorded, and 255 of 260 herbs
 *     already carry source_type "sourced_cloudtcm_record" with an
 *     exact_source_url. That is recorded provenance, not a guess, so CloudTCM
 *     URLs are written AND cited in field_sources.
 *
 *   American Dragon — DERIVED. The URL is deterministic from the pinyin
 *     (tone marks stripped, syllables CamelCased: Má Huáng →
 *     .../Individualherbsupdate/MaHuang.html), confirmed against all 59 herbs
 *     that already carry one. Deriving the other 201 is safe as a link, but a
 *     derived URL is not evidence that the page exists, let alone that any
 *     field's content came from it. So it is written with
 *     link_status:"derived" and is NEVER cited in field_sources.
 *
 *   chinesemedicineatlas — INDEX ONLY. source_registry records the atlas index
 *     (chinesemedicineatlas.com/tcm_herb_atlas/) and no per-herb pattern is
 *     known. Linking the index is honest; inventing a per-herb path is not.
 *
 * field_sources are derived only from provenance the record already states:
 *   modern_functions_zh/en   ← modern_functions_source_url
 *   cautions_* / contraindications_* ← safety_source_url
 *   the CloudTCM-imported content fields ← exact_source_url
 *   exam_importance / exam_pearl ← the NCBAHM CH outline where present
 * An existing field_sources entry is NEVER overwritten: those 25 herbs were
 * cited by earlier passes that actually read the source.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const MAP = path.join(ROOT, "data/imports/cloudtcm/herb_url_map.json");
const APPLY = process.argv.includes("--apply");

const ATLAS_INDEX = "https://chinesemedicineatlas.com/tcm_herb_atlas/";
const CH_OUTLINE = "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.pdf";

// Má Huáng → MaHuang. NFD splits the diacritic off so it can be dropped.
function americanDragonUrl(pinyin) {
  const clean = String(pinyin || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("");
  return clean ? `https://www.americandragon.com/Individualherbsupdate/${clean}.html` : "";
}

// Fields the CloudTCM herb page is the stated origin of. Deliberately excludes
// anything the curriculum or the board outline supplied.
const CLOUDTCM_FIELDS = [
  "properties_taste_temp", "tcm_properties", "channels_zh", "functions_zh",
  "indications_zh", "traditional_functions_zh", "dosage", "pao_zhi_notes_zh",
  "modern_pharmacology_zh", "condition_tags_zh", "aliases_zh", "category_zh"
];

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;

const mapEntries = JSON.parse(fs.readFileSync(MAP, "utf8")).entries || [];
const byHerbId = new Map(mapEntries.filter((e) => e.verified).map((e) => [e.herb_id, e]));
const byNameZh = new Map(mapEntries.filter((e) => e.verified).map((e) => [e.name_zh, e]));

const t = { cloud: 0, ad: 0, atlas: 0, fs: 0, kept: 0, outline: 0, noCloud: [] };
// Every (herb, field) pair this run wrote — the assertions below only judge these.
const written = new Set();

for (const r of recs) {
  // ── CloudTCM: verified map first, then the record's own recorded URL ──
  const hit = byHerbId.get(r.id) || byNameZh.get(r.name_zh);
  const cloudUrl = r.cloudtcm_url || hit?.page_url
    || (/cloudtcm\.com\/herb\//.test(String(r.exact_source_url || "")) ? r.exact_source_url : "");
  if (cloudUrl && !r.cloudtcm_url) { r.cloudtcm_url = cloudUrl; t.cloud++; }
  if (!cloudUrl) t.noCloud.push(r.name_zh);

  // ── American Dragon: derived, and labelled as derived ──
  if (!r.american_dragon_url) {
    const u = americanDragonUrl(r.pinyin || r.pinyin_toned);
    if (u) { r.american_dragon_url = u; r.american_dragon_link_status = "derived"; t.ad++; }
  }

  // ── Atlas: index only ──
  if (!r.atlas_url) { r.atlas_url = ATLAS_INDEX; r.atlas_link_status = "index"; t.atlas++; }

  // ── field_sources, from stated provenance only ──
  r.field_sources = r.field_sources || {};
  const put = (field, url) => {
    if (!url) return;
    const v = r[field];
    const empty = v == null || v === "" || (Array.isArray(v) && !v.length);
    if (empty) return;                       // never cite a field with no content
    if (r.field_sources[field]) { t.kept++; return; }   // earlier pass read it; leave alone
    r.field_sources[field] = [url];
    written.add(`${r.id}:${field}`);
    t.fs++;
  };

  if (cloudUrl) for (const f of CLOUDTCM_FIELDS) put(f, cloudUrl);
  for (const f of ["modern_functions_zh", "modern_functions_en", "modern_functions_detail_zh"]) {
    put(f, r.modern_functions_source_url || cloudUrl);
  }
  for (const f of ["cautions_zh", "cautions_en", "contraindications_zh", "contraindications_en"]) {
    put(f, r.safety_source_url || cloudUrl);
  }
  for (const f of ["exam_importance", "exam_pearl"]) {
    if (r[f] && !r.field_sources[f]) { r.field_sources[f] = [CH_OUTLINE]; written.add(`${r.id}:${f}`); t.fs++; t.outline++; }
  }
}

// ── assertions ──────────────────────────────────────────────────────────────
// Scoped to what THIS script wrote. The 25 herbs curated earlier already cite
// American Dragon on some fields, and those passes actually read the page —
// blanket-forbidding AD citations would fail on their legitimate work.
const fail = [], warn = [];
for (const r of recs) {
  for (const f of Object.keys(r.field_sources || {})) {
    const v = r[f];
    const empty = v == null || v === "" || (Array.isArray(v) && !v.length);
    if (!empty) continue;
    // A citation on an empty field says "this was sourced" about nothing.
    if (written.has(`${r.id}:${f}`)) fail.push(`${r.name_zh}: field_sources.${f} 但該欄位是空的`);
    else warn.push(`${r.name_zh}.${f}（既有標註，欄位已空）`);
  }
  for (const [f, arr] of Object.entries(r.field_sources || {})) {
    if (!written.has(`${r.id}:${f}`)) continue;
    if ([].concat(arr).some((s) => /americandragon/i.test(String(s)))) {
      fail.push(`${r.name_zh}: field_sources.${f} 引用了 American Dragon —— 該連結是推導的，不能當來源`);
    }
  }
  // Only URLs this run derived. 半夏's existing one is
  // .../ZhiBanXia.htm — 製半夏, and .htm not .html — which is a hand-checked
  // URL from an earlier pass, not something to "correct" into a guess.
  if (r.american_dragon_link_status === "derived"
    && !/^https:\/\/www\.americandragon\.com\/Individualherbsupdate\/[A-Za-z]+\.html$/.test(r.american_dragon_url)) {
    fail.push(`${r.name_zh}: 推導的 American Dragon URL 格式不符 → ${r.american_dragon_url}`);
  }
}

const withFs = recs.filter((r) => Object.keys(r.field_sources || {}).length).length;
console.log("中藥卡來源與連結層");
console.log(`  CloudTCM 連結     新增 ${String(t.cloud).padStart(4)}   共 ${recs.filter((r) => r.cloudtcm_url).length}/${recs.length}（已驗證對照表）`);
console.log(`  American Dragon   新增 ${String(t.ad).padStart(4)}   共 ${recs.filter((r) => r.american_dragon_url).length}/${recs.length}（由拼音推導，標 derived）`);
console.log(`  Atlas 索引        新增 ${String(t.atlas).padStart(4)}   共 ${recs.filter((r) => r.atlas_url).length}/${recs.length}（只有索引頁，無單味藥頁）`);
console.log(`  逐欄 field_sources 新增 ${String(t.fs).padStart(4)}   其中考綱 ${t.outline}；保留既有 ${t.kept}`);
console.log(`  有 field_sources 的藥          ${withFs}/${recs.length}`);
if (t.noCloud.length) console.log(`  ⚠️ 查不到 CloudTCM 頁 ${t.noCloud.length}：${t.noCloud.slice(0, 8).join("、")}`);

if (fail.length) {
  console.error(`\n❌ ${fail.length} 個來源檢查失敗 —— 不寫入:`);
  fail.slice(0, 12).forEach((f) => console.error("  " + f));
  process.exit(1);
}
if (warn.length) console.log(`\n⚠️ 既有標註指向空欄位 ${warn.length} 處（本次未動，留給人工確認）：${warn.slice(0, 6).join("、")}`);
console.log("\n✅ 本次新增的標註沒有空欄位；American Dragon 只當連結不當來源");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/herb_canon_shortlist.json");

#!/usr/bin/env node
/**
 * report-cloudtcm-buildout.js — the standing answer to "都融合到卡片裡面了嗎?"
 *
 * No, and this prints exactly how far short. CloudTCM's 205 source rows are
 * 190 records after the import merged pages that appear under several
 * categories, and of those only the ones with a canonical counterpart can sit
 * on a card — you cannot attach a source page to a card that does not exist.
 *
 * The rest are a build-out queue, not content. Creating a card per queued name
 * would produce empty shells with a name and a link, which is the failure this
 * repo keeps re-learning (202 herbs / 26 sentences; the 535-entry 知源 index).
 *
 * Ordering is deliberate and matches the clinic-risk triage in
 * docs/PLAN_TO_2026-09-05.md §3c rather than source order: a disease that
 * patients bring to an acupuncture clinic believing it is minor outranks one
 * they would already be under specialist care for.
 *
 *   node scripts/report-cloudtcm-buildout.js
 *   node scripts/report-cloudtcm-buildout.js --json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const map = readJson("data/config/cloudtcm_ref_map.json");
const entriesFile = readJson("data/pathology/cloudtcm_disease_entries.json");
const symTax = readJson("data/config/symptom_taxonomy.json");

// Clinic-risk tiers for the un-carded biomedical names. Tier 1 is what walks
// into an acupuncture clinic as a "minor" complaint and is not.
const TIERS = [
  {
    tier: 1,
    label_zh: "先建:病人會拿來針灸、但漏掉代價最高",
    label_en: "Build first: presents as minor, is not",
    match: /中風|心肌梗塞|三叉神經痛|青光眼|類風濕|高血壓|糖尿病|貧血|甲狀腺|癲癇|腦|心臟|血栓/,
  },
  {
    tier: 2,
    label_zh: "次建:診所常見,且已有中醫治療脈絡",
    label_en: "Build next: common in clinic with an established TCM context",
    match: /五十肩|坐骨|頸椎|腰椎|關節炎|失眠|焦慮|憂鬱|經痛|子宮|更年期|不孕|濕疹|蕁麻疹|鼻炎|胃|腸|便秘|腹瀉/,
  },
];

const tierOf = (name) => {
  for (const t of TIERS) if (t.match.test(name)) return t.tier;
  return 3;
};

const disease = (map.disease_gap_candidates || []).map((d) => ({ ...d, tier: tierOf(d.name_zh) }));
const symptom = symTax.candidates || [];

const byTier = {};
disease.forEach((d) => (byTier[d.tier] ||= []).push(d));

const report = {
  source: {
    url: entriesFile.source_url,
    rows_on_site: entriesFile.source_row_count,
    records_after_merge: entriesFile.count,
    snapshot: entriesFile.source_snapshot_date,
    merge_reason: "a page listed under several categories is one record with several category_ids",
  },
  on_cards_now: map.counts.matched_to_canonical,
  queued: {
    biomedical_conditions: disease.length,
    symptoms: symptom.length,
    total: disease.length + symptom.length,
  },
  build_order: {
    "1_existing_150_red_flags": "95 cond.* records still have no red flags — finish the safety layer on cards that already exist before adding 41 more gaps",
    "2_biomedical_tier1": (byTier[1] || []).length,
    "3_biomedical_tier2": (byTier[2] || []).length,
    "4_biomedical_tier3": (byTier[3] || []).length,
    "5_symptoms": `${symptom.length} — needs docs/SYMPTOM_CARD_TEMPLATE.md + validate-symptom-standard.js first (D14 build order); the vocabulary already exists`,
  },
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ...report, tiers: byTier, symptom_candidates: symptom }, null, 2));
} else {
  console.log("CloudTCM build-out — how much is actually on cards\n");
  console.log(`  site rows            ${report.source.rows_on_site}  (snapshot ${report.source.snapshot})`);
  console.log(`  records after merge  ${report.source.records_after_merge}`);
  console.log(`  ON CARDS NOW         ${report.on_cards_now}`);
  console.log(`  queued               ${report.queued.total}  (${report.queued.biomedical_conditions} 病名 · ${report.queued.symptoms} 症狀)\n`);
  console.log("build order:");
  console.log(`  1. 補完現有 150 筆的 red flags  — 還缺 95 筆`);
  for (const t of TIERS) {
    const list = byTier[t.tier] || [];
    console.log(`  ${t.tier + 1}. ${t.label_zh} — ${list.length} 筆`);
    console.log(`     ${list.map((d) => d.name_zh).join(" · ") || "(none)"}`);
  }
  const rest = byTier[3] || [];
  console.log(`  4. 其餘西醫病名 — ${rest.length} 筆`);
  console.log(`     ${rest.map((d) => d.name_zh).join(" · ")}`);
  console.log(`  5. 症狀 ${symptom.length} 筆 — 需要先有 SYMPTOM_CARD_TEMPLATE + validator(D14 順序);詞彙表已存在`);
}

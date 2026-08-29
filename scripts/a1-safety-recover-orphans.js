#!/usr/bin/env node
/**
 * a1-safety-recover-orphans.js — fix A1(a)'s wrong fallback direction.
 *
 * A1(a) (scripts/a1-safety-migrate.js) removed every needs_review segment
 * from the canonical contraindications_/cautions_ fields, keeping the
 * original text only in import_artifacts. That is correct for text that
 * genuinely never rendered before, but wrong for text that WAS already on
 * the card: import_artifacts is not read by any renderer, so "needs_review"
 * silently became "gone from the card" — 423 sentences across 114 formulas
 * (see validate-formula-safety-reachability.js R2).
 *
 * The fix has two parts, run together against every field A1(a) actually
 * touched (identified by import_artifacts entries whose reason contains
 * "A1(a)" — held-back / never-in-scope fields have no such entry and are
 * left completely alone):
 *
 *   1. Re-run classification with the expanded lexicon (2026-08-28 patch to
 *      formula_safety_direction_lexicon_A1.json — near-synonym patterns for
 *      real orphaned sentences, verified against zero collisions in
 *      already-canonical text). Anything that now resolves to a confident
 *      direction goes to the correct field, same as A1(a)'s original design.
 *   2. NEW fallback: anything that still cannot be classified — no
 *      direction token, ambiguous avoidance, mixed tokens, or missing
 *      provenance — is restored to whichever original field(s) it was
 *      pooled from (recovered from import_artifacts.text), not dropped.
 *      This is not a new claim: it is exactly the text that was already on
 *      the card before A1(a) touched it, in exactly the position it was
 *      already in. No wording is rewritten.
 *
 * import_artifacts entries are NOT modified — they still correctly record
 * "this field used to look like this before A1(a)".
 *
 * Usage:
 *   node scripts/a1-safety-recover-orphans.js --plan --out <path>   # dry run
 *   node scripts/a1-safety-recover-orphans.js --apply                # writes formulas.json
 */
const fs = require("fs");
const path = require("path");
const { classifyLegacyItem } = require("./a1-safety-lexicon-lib");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const argVal = (f) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : null; };
const OUT = argVal("--out");

function normKey(s, lang) {
  const t = String(s).trim().replace(/\s+/g, " ");
  return lang === "en" ? t.toLowerCase() : t;
}

function cardProvenance(record) {
  const fs_ = record.field_sources || {};
  const keys = ["contraindications_en", "contraindications_zh", "cautions_zh", "cautions_en", "contraindications", "cautions"];
  const fsHit = keys.find((k) => fs_[k] && (Array.isArray(fs_[k]) ? fs_[k].length : String(fs_[k]).trim()));
  const urls = Array.isArray(record.source_urls) ? record.source_urls.filter(Boolean) : [];
  if (fsHit) return { ok: true };
  if (urls.length) return { ok: true };
  return { ok: false };
}

function planForRecord(record) {
  const artifacts = (record.import_artifacts || []).filter((a) => a && a.reason && a.reason.includes("A1(a)"));
  if (!artifacts.length) return null; // untouched or fully held_back — nothing to recover

  const byField = new Map(artifacts.map((a) => [a.original_field, a]));
  const perLang = {};
  let touched = false;

  for (const lang of ["en", "zh"]) {
    const cField = `contraindications_${lang}`;
    const kField = `cautions_${lang}`;
    const cArt = byField.get(cField);
    const kArt = byField.get(kField);
    if (!cArt && !kArt) continue; // this language was held back or never in scope

    const origC = cArt ? String(cArt.text).split(" | ").filter(Boolean) : [];
    const origK = kArt ? String(kArt.text).split(" | ").filter(Boolean) : [];

    // Rebuild the exact same dedup pool A1(a) built, from the recovered
    // pre-migration arrays (A1-M01: legacy field position is not evidence
    // of direction, so pool + dedupe before classifying).
    const byKey = new Map();
    for (const [arr, fname] of [[origC, cField], [origK, kField]]) {
      for (const item of arr) {
        const key = normKey(item, lang);
        if (!key) continue;
        if (!byKey.has(key)) byKey.set(key, { text: String(item).trim(), fields: new Set([fname]) });
        else byKey.get(key).fields.add(fname);
      }
    }
    const unique = [...byKey.values()];
    const prov = cardProvenance(record);

    const newContra = [];
    const newCaution = [];
    const recovered = []; // fell back to original field(s), not classified
    const resolved = [];  // newly classified via expanded lexicon

    for (const u of unique) {
      const subs = classifyLegacyItem(u.text, lang);
      for (const sub of subs) {
        const confident = sub.classification !== "needs_review" && prov.ok;
        if (confident) {
          if (sub.classification === "contraindications") newContra.push(sub.text);
          else newCaution.push(sub.text);
          resolved.push({ text: sub.text, direction_id: sub.direction_id, classification: sub.classification });
        } else {
          // Fallback: restore to EVERY original field this exact sentence
          // was pooled from (usually the duplicate-pair defect itself, i.e.
          // both fields; sometimes only one). Not a new claim — the text is
          // exactly what was already there.
          if (u.fields.has(cField)) newContra.push(sub.text);
          if (u.fields.has(kField)) newCaution.push(sub.text);
          recovered.push({
            text: sub.text,
            reason: sub.classification === "needs_review" ? sub.review_reason : "missing_provenance",
            restored_to: [...u.fields],
          });
        }
      }
    }

    perLang[lang] = { cField, kField, before: { [cField]: record[cField] || [], [kField]: record[kField] || [] },
      after: { [cField]: newContra, [kField]: newCaution }, resolved, recovered };
    touched = true;
  }

  return touched ? { id: record.id, name_zh: record.name_zh, perLang } : null;
}

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const records = data.records;
  const plans = [];
  for (const r of records) {
    const p = planForRecord(r);
    if (p) plans.push(p);
  }

  let totalResolved = 0, totalRecovered = 0;
  for (const p of plans) for (const lang of ["en", "zh"]) {
    const l = p.perLang[lang];
    if (!l) continue;
    totalResolved += l.resolved.length;
    totalRecovered += l.recovered.length;
  }

  if (has("--plan")) {
    const outPath = OUT || path.join(ROOT, "a1-recover-plan.json");
    fs.writeFileSync(outPath, JSON.stringify({ summary: { cards: plans.length, totalResolved, totalRecovered }, plans }, null, 2), "utf8");
    console.log(JSON.stringify({ cards: plans.length, totalResolved, totalRecovered }, null, 2));
    console.log(`plan written to ${outPath}`);
    return;
  }

  if (has("--apply")) {
    const byId = new Map(records.map((r) => [r.id, r]));
    for (const p of plans) {
      const rec = byId.get(p.id);
      for (const lang of ["en", "zh"]) {
        const l = p.perLang[lang];
        if (!l) continue;
        rec[l.cField] = l.after[l.cField];
        rec[l.kField] = l.after[l.kField];
      }
    }
    fs.writeFileSync(FILE, JSON.stringify(data, null, 1) + "\n", "utf8");
    console.log(`applied to ${plans.length} cards; resolved=${totalResolved} recovered=${totalRecovered}`);
    return;
  }

  console.log("use --plan --out <path> or --apply");
  console.log(JSON.stringify({ cards: plans.length, totalResolved, totalRecovered }, null, 2));
}

main();

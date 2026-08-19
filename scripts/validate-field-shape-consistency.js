#!/usr/bin/env node
/**
 * validate-field-shape-consistency.js — census of POLYMORPHIC FIELDS across
 * every canonical data collection: fields that are a string on some records
 * and an array (or object, or number) on others.
 *
 * ── Why this script exists ───────────────────────────────────────────────
 *
 * Three separate defects found on 2026-08-10/12, all the same shape, and all
 * three found BY ACCIDENT rather than by a check:
 *
 *   1. `cautionsEn` is a plain string on some acupoints and an array on
 *      others. `needlingArticle()` in app.js tested `.length` (truthy for a
 *      non-empty STRING as well as an array), then called `.join()` →
 *      TypeError → English-mode contraindications vanished on 206 points,
 *      SILENTLY, because the throw happened inside a builder whose result was
 *      discarded. Fixed at c078f4e by branching on `Array.isArray`.
 *   2. The pre-visit payload's `metrics` could arrive as an OBJECT instead of
 *      an array; the in-app validator degraded it to `[]` and ACCEPTED, while
 *      the CLI validator rejected the identical payload. Fixed at aaf8b81.
 *   3. `import_artifacts` carries two disjoint key shapes
 *      (`{original_field,text,reason,moved_at}` vs
 *      `{field,archived_at,belongs_to,source_url}`) because two lanes invented
 *      the same field on the same day and neither knew about the other.
 *
 * A field that is sometimes a string and sometimes an array is a defect
 * factory: every consumer has to guess, and when it guesses wrong the failure
 * is usually SILENT (an empty section, a dropped paragraph) rather than loud.
 * `.length` is the trap — it is the one shape-specific accessor that is valid
 * on both shapes and therefore never throws where you would see it.
 *
 * This script measures the whole class. It does not fix anything: remediation
 * is a separately-approved batch (see the baseline doc), because normalizing a
 * field means WRITING to a lane this script does not own (憲法 §一).
 *
 * ── What is scanned ──────────────────────────────────────────────────────
 *
 * Every `*.json` under `data/`, enumerated by walking the tree — NOT a
 * hardcoded directory list, because the hardcoded guess (`data/patterns/*`)
 * does not exist in this repo (pattern data lives in
 * `data/pathology/pattern_*.json`) and a hardcoded list is exactly how a
 * walker ends up silently missing the file that holds the defect.
 *
 * `data/generated/**` is EXCLUDED: it is build-data.js output, so a shape
 * defect there is a mirror of an upstream defect and counting it would
 * double-count. `curriculum/**` is never read (Ting's, AI 只讀 — and it holds
 * no JSON records anyway).
 *
 * ── What counts as a "collection" ────────────────────────────────────────
 *
 * A collection is a set of records that are supposed to be alike. Detected
 * three ways, all structural (no filename whitelist):
 *
 *   root-array      the file's root is an array of ≥2 plain objects
 *                   → collection id `<relpath>`
 *   keyed-array     a top-level key whose value is an array of ≥2 plain
 *                   objects (`records`, `ids`, `browse_layers`, …)
 *                   → collection id `<relpath>#<key>`
 *   object-map      the root object's values are ≥2 plain objects and the
 *                   root has no scalar top-level keys (an id→record map)
 *                   → collection id `<relpath>#{map}`
 *
 * NESTED collections are then detected inside records, to MAX_NEST levels: a
 * field that holds arrays of plain objects becomes its own collection
 * (`<parent>.<field>[]`). This is what reaches `composition[].role_zh`,
 * `differentiation_zh[].points_to`, and `import_artifacts[]` — incident 3
 * lives two levels down and a top-level-only walker cannot see it.
 *
 * ── The two defect tiers this script counts ──────────────────────────────
 *
 * SHAPE   a field is present with ≥2 distinct types drawn from
 *         {string, array, object, number, boolean}. This is the real defect
 *         class. `absent` is NOT a type — a field missing on some records is
 *         normal sparseness, not polymorphism.
 *
 * CROSS   the SAME FIELD NAME has a different dominant shape in different
 *         collections. This tier was added after the first run of this script
 *         reported `cautionsEn` split inside `extra_points.json` (28 string /
 *         44 array) and NOWHERE ELSE — while incident #1's real number was 206
 *         of 947 points. The reason: the runtime point object is MERGED from
 *         `data/acupoints/361.json`, `extra_points.json`,
 *         `data/scalp/*`, `data/auricular/*` and more, and each of those files
 *         can be perfectly self-consistent while the union the consumer
 *         actually holds is not. A per-collection census alone would have
 *         under-reported the incident that motivated the script, so the
 *         per-collection number is not the headline number.
 *         CAVEAT, stated rather than hidden: two collections in unrelated
 *         domains sharing a field name are not necessarily merged at runtime
 *         (`functions` on a herb and on a scalp point are different fields).
 *         CROSS is a NAME-keyed signal — which is exactly the key the consumer
 *         grep uses too, so a shared name plus a shape-specific call site is
 *         still the risk worth printing.
 *
 * NULLMIX a field has exactly ONE non-null type but is also explicitly `null`
 *         on some records. Reported separately and NEVER ranked as dangerous,
 *         because `null.join()` and `null.length` both throw LOUDLY and
 *         immediately — the failure mode that gets noticed and fixed. The
 *         string/array split is worse precisely because it is quiet.
 *
 * ITEMSHAPE  within-array item polymorphism, two sub-kinds:
 *         primitive  an array whose items are sometimes strings and sometimes
 *                    objects (or numbers).
 *         keysplit   an array of objects containing a MUTUALLY EXCLUSIVE KEY
 *                    PAIR: two keys that never appear on the same item, each
 *                    on a non-trivial share of items, together covering most
 *                    of them. That is incident 3 exactly — `field` vs
 *                    `original_field`, `archived_at` vs `moved_at`: one slot,
 *                    two names, invented by two lanes on the same day.
 *                    NOT "the key signatures differ": ordinary optional fields
 *                    make signatures differ on almost every collection in the
 *                    repo and would drown the real finding. NOT "no key is
 *                    common to all items" either — that test was tried first
 *                    and MISSES incident 3, because both families do share
 *                    `reason` and `text`. Exclusivity is the signal; a shared
 *                    core is not evidence of health.
 *                    Thresholds: minority side ≥2 items and ≥5% of items;
 *                    the pair's union ≥60% of items.
 *
 * ── Ranking: dangerous vs bookkeeping ────────────────────────────────────
 *
 * A polymorphic field NOBODY READS is bookkeeping. A polymorphic field with a
 * shape-specific consumer is the `cautionsEn` shape. So each polymorphic field
 * is graded on three axes and bucketed:
 *
 *   (a) SAFETY NAME — the field name matches
 *       contraindicat / caution / red_flag / redflag / warning / interact /
 *       dose / dosage / depth  (the dispatch's list; `needl` and `toxic` are
 *       NOT included, to keep the list the one that was actually specified
 *       rather than one this script widened on its own authority).
 *   (b) MINORITY COUNT — how many records sit on the minority shape. 206 of
 *       947 was the cautionsEn number; a 1-of-500 outlier is a typo, a
 *       200-of-900 split is two lanes disagreeing.
 *   (c) CONSUMER — does `app.js` or `js/*.js` call a shape-specific method
 *       (.join .map .filter .length .trim .split) on something named like this
 *       field? Reported with file:line and the source line.
 *
 *   Tier A  dangerous     ≥1 shape-specific consumer call site.
 *   Tier B  safety-named  safety name, no shape-specific call site found.
 *   Tier C  bookkeeping   neither.
 *   Within a tier: safety-named first, then by consumer-site count, then by
 *   minority count descending.
 *   SHAPE and CROSS are tiered independently and reported as separate lists;
 *   a field can be Tier C within every single collection and Tier A across
 *   them (that is `functionsEn`: 5 meridian files array, 3 string, one
 *   `.join()` consumer serving all eight).
 *
 * ── Consumer detection is a GREP, and greps have blind spots ─────────────
 *
 * Say it out loud rather than let a "0 consumers" line read as "nothing reads
 * this". The scan is line-oriented over `app.js` and `js/*.js`; it finds the
 * field name as a word, then looks for a shape-specific method within the same
 * line. It therefore MISSES, by construction:
 *   • aliasing — `const c = p.cautionsEn;` on one line, `c.join()` on the next.
 *     (A 3-line lookahead was tried and produced more false positives from
 *     unrelated neighbouring statements than it recovered true ones.)
 *   • destructuring — `const { cautionsEn } = point;`
 *   • dynamic access — `point[fieldName]` in a loop over a field list. app.js
 *     does this in several render helpers, so entire families of consumers are
 *     invisible here.
 *   • index.html inline script and any consumer outside app.js / js/*.js.
 * A field reported with 0 call sites means "this grep found none", not "none
 * exist". The bare-mention count is printed alongside so the difference
 * between "never mentioned" and "mentioned, no same-line shape call" stays
 * visible.
 *
 * Call sites are additionally marked `[guarded]` when a shape test appears on
 * the same line or the line before: `Array.isArray(` (the c078f4e fix shape)
 * OR `typeof … === "string"|"object"|"number"|"boolean"`. Both idioms are in
 * use here — `app.js:4698` guards `point.needling.split()` with the typeof
 * form — and counting only the first made this script report that call site as
 * unguarded on its first pass. A guarded call site still counts as a consumer,
 * because the underlying data is still polymorphic and the next consumer
 * written against it will not necessarily copy the guard.
 *
 * ── CI tier: NOTE, and here is the honest reason ─────────────────────────
 *
 * Measured on this tree (branch codex/field-shape-consistency off
 * codex/pattern-v2 tip c078f4e; frozen worklist in
 * docs/research_packs/FIELD_SHAPE_CONSISTENCY_BASELINE.md):
 *
 *     collections 361 (101 nested) · records 40,293 · field slots 4,299
 *     SHAPE    28   (A 10 · B 3 · C 15)
 *     CROSS    81   (A 24 · B  0 · C 57)
 *     ITEM     13
 *     NULLMIX  46
 *
 * That is 122 polymorphic findings, 34 of them with a live shape-specific
 * consumer. Every one is a `data/**` edit in a lane this script does not own,
 * and none of it has been dispatched. Wiring any of it blocking today would
 * make the build red over a backlog nobody has been asked to fix, and a gate
 * like that gets switched off within a week — the same call
 * `validate-formula-composition-signatures.js` and
 * `validate-formula-safety-predicates.js` already made, for the same reason.
 *
 * So: default invocation NEVER exits non-zero. It reports and exits 0. The CI
 * step runs it informationally so the four numbers appear on every run and
 * cannot drift upward unnoticed.
 *
 * GRADUATION CONDITION — deliberately NOT "all polymorphism reaches zero".
 * Some of it is legitimate dual meaning that a ruling may bless (see the
 * baseline doc's per-field 「安全正規化 / 需裁決」 column). The gates that can
 * actually be reached are the ones with a consumer behind them:
 *
 *     node scripts/validate-field-shape-consistency.js --blocking=A     (10)
 *   Tier A graduates when every within-collection polymorphic field with a
 *   shape-specific consumer has either (i) been normalized in data to one
 *   shape, or (ii) had its consumers made shape-agnostic AND been recorded in
 *   `data/config/` as an intentional dual-shape field. (ii) is a ruling, not a
 *   unilateral call by whoever runs the batch.
 *
 *     node scripts/validate-field-shape-consistency.js --blocking=CROSS (24)
 *   CROSS Tier A graduates on the same terms across collections. It is the
 *   larger and slower of the two, because a cross-collection normalization
 *   touches several lanes at once (`cautions_zh` spans 15 collections).
 *
 *     node scripts/validate-field-shape-consistency.js --blocking=ITEM  (13)
 *   ITEM graduates when the primitive splits and the keysplit families are
 *   reconciled. The two rows that matter most are
 *   `condition_canon_shortlist.json#records.red_flags_zh/_en[]` (519 object
 *   items vs 382 string items, consumed by `.map(esc).join()` in
 *   js/knowledge.js) and incident 3's `import_artifacts`. Both are
 *   `data/pathology/**`, i.e. the conditions lane, not this script's author.
 *
 *     node scripts/validate-field-shape-consistency.js --blocking
 *   is A + CROSS + ITEM. Tier B (safety-named, no consumer found) is
 *   available as `--blocking=B` but is NOT part of the bare `--blocking` set,
 *   because its members are exactly the ones where the grep found nothing and
 *   the grep is admitted to be incomplete — blocking on a signal this script
 *   says it cannot fully see would be dishonest. There is deliberately no
 *   all-polymorphism blocking mode: a flag that can never be satisfied is not
 *   a graduation condition.
 *
 * Usage:
 *   node scripts/validate-field-shape-consistency.js
 *   node scripts/validate-field-shape-consistency.js --worklist
 *   node scripts/validate-field-shape-consistency.js --blocking[=A,CROSS,ITEM,B]
 *   node scripts/validate-field-shape-consistency.js --json
 *
 * This script NEVER writes. It reads data/**.json, app.js and js/*.js and
 * prints. Remediation is a separate, separately-approved batch.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const EXCLUDE_DIRS = new Set(["generated", "node_modules"]);

const MAX_NEST = 3; // root collection = depth 0; composition[] = 1; …
const MIN_RECORDS = 2; // a "collection" of one record cannot be inconsistent

const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const JSON_OUT = argv.includes("--json");
const blockingArg = argv.find((a) => a === "--blocking" || a.startsWith("--blocking="));
const BLOCKING = blockingArg
  ? blockingArg.includes("=")
    ? blockingArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : ["A", "CROSS", "ITEM"]
  : [];

// ── helpers ───────────────────────────────────────────────────────────────
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/** Unordered key-pair id; the separator is escaped so no literal control byte ends up in this file. */
const pairKey = (x, y) => (x < y ? x + "\u0001" + y : y + "\u0001" + x);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");
const renderCountsInline = (counts) =>
  Object.entries(counts)
    .map(([t, n]) => `${t}:${n}`)
    .join(" ");
const clip = (s, n = 110) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

/** The seven buckets a value can land in. `absent` is handled by the caller. */
function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "object") return "object";
  if (t === "string" || t === "number" || t === "boolean") return t;
  return "other";
}

// ── 1. walk data/ ─────────────────────────────────────────────────────────
function walkJson(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      walkJson(p, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".json")) {
      out.push(p);
    }
  }
  return out;
}

const files = walkJson(DATA_DIR, []).sort();
const parseFailures = [];
const parsed = [];
for (const f of files) {
  let text;
  try {
    text = fs.readFileSync(f, "utf8");
  } catch (err) {
    parseFailures.push({ file: rel(f), reason: `read: ${err.message}` });
    continue;
  }
  // Two tung/*.json files carry a UTF-8 BOM; JSON.parse rejects it. Strip it
  // rather than record them as blind spots — the content is fine.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  try {
    parsed.push({ file: rel(f), json: JSON.parse(text) });
  } catch (err) {
    parseFailures.push({ file: rel(f), reason: `parse: ${err.message.split("\n")[0]}` });
  }
}

// ── 2. discover collections (incl. nested) ────────────────────────────────
/** @type {Map<string, {id:string, file:string, depth:number, records:object[]}>} */
const collections = new Map();

function isRecordArray(v) {
  if (!Array.isArray(v) || v.length < MIN_RECORDS) return false;
  const objs = v.filter(isPlainObject).length;
  return objs >= MIN_RECORDS && objs / v.length >= 0.5;
}

function addCollection(id, file, depth, records) {
  const objs = records.filter(isPlainObject);
  if (objs.length < MIN_RECORDS) return;
  collections.set(id, { id, file, depth, records: objs });
  if (depth < MAX_NEST) descend(id, file, depth, objs);
}

/** Any field holding arrays-of-objects becomes its own nested collection. */
function descend(parentId, file, depth, records) {
  const byField = new Map();
  for (const r of records) {
    for (const [k, v] of Object.entries(r)) {
      if (!Array.isArray(v)) continue;
      const objs = v.filter(isPlainObject);
      if (!objs.length) continue;
      if (!byField.has(k)) byField.set(k, []);
      byField.get(k).push(...objs);
    }
  }
  for (const [k, items] of byField) {
    if (items.length < MIN_RECORDS) continue;
    addCollection(`${parentId}.${k}[]`, file, depth + 1, items);
  }
}

for (const { file, json } of parsed) {
  if (Array.isArray(json)) {
    if (isRecordArray(json)) addCollection(file, file, 0, json);
    continue;
  }
  if (!isPlainObject(json)) continue;

  const entries = Object.entries(json);
  let keyed = 0;
  for (const [k, v] of entries) {
    if (isRecordArray(v)) {
      addCollection(`${file}#${k}`, file, 0, v);
      keyed++;
    }
  }
  // object-map form: every value is a plain object (id -> record). Only when
  // no keyed-array collection was found, so `{dataset, records:[…]}` files are
  // not double-counted as a 2-entry map.
  if (!keyed) {
    const objVals = entries.filter(([, v]) => isPlainObject(v));
    if (objVals.length >= MIN_RECORDS && objVals.length === entries.length) {
      addCollection(`${file}#{map}`, file, 0, objVals.map(([, v]) => v));
    }
  }
}

// ── 3. per-collection field census ────────────────────────────────────────
const TYPES = ["string", "array", "object", "number", "boolean", "null", "other"];
const SHAPE_TYPES = new Set(["string", "array", "object", "number", "boolean", "other"]);

/** field key -> aggregated finding */
const shapeFindings = [];
const nullMixFindings = [];
const itemFindings = [];
/** field NAME -> [{collection, counts, dominant, samples}] across all collections */
const byName = new Map();
let totalFields = 0;

for (const col of collections.values()) {
  const census = new Map(); // field -> {counts, samples}
  for (const r of col.records) {
    for (const [k, v] of Object.entries(r)) {
      if (!census.has(k)) census.set(k, { counts: Object.create(null), samples: Object.create(null) });
      const c = census.get(k);
      const t = typeOf(v);
      c.counts[t] = (c.counts[t] || 0) + 1;
      if (c.samples[t] === undefined) {
        c.samples[t] =
          t === "array"
            ? `[${v.length} items]${v.length ? " e.g. " + clip(JSON.stringify(v[0]), 60) : ""}`
            : t === "object"
              ? `{${Object.keys(v).slice(0, 5).join(",")}}`
              : clip(JSON.stringify(v), 70);
      }
    }
  }

  totalFields += census.size;

  for (const [field, c] of census) {
    const present = TYPES.filter((t) => c.counts[t]);
    const shapes = present.filter((t) => SHAPE_TYPES.has(t));
    const total = present.reduce((a, t) => a + c.counts[t], 0);
    const absent = col.records.length - total;

    if (shapes.length) {
      const dom = shapes.slice().sort((a, b) => c.counts[b] - c.counts[a])[0];
      if (!byName.has(field)) byName.set(field, []);
      byName.get(field).push({
        collection: col.id,
        dominant: dom,
        counts: Object.fromEntries(shapes.map((t) => [t, c.counts[t]])),
        sample: c.samples[dom],
      });
    }

    if (shapes.length >= 2) {
      const ranked = shapes.slice().sort((a, b) => c.counts[b] - c.counts[a]);
      const majority = ranked[0];
      const minority = ranked.slice(1).reduce((a, t) => a + c.counts[t], 0);
      shapeFindings.push({
        collection: col.id,
        file: col.file,
        depth: col.depth,
        field,
        records: col.records.length,
        absent,
        counts: Object.fromEntries(present.map((t) => [t, c.counts[t]])),
        samples: Object.fromEntries(shapes.map((t) => [t, c.samples[t]])),
        majority,
        majority_n: c.counts[majority],
        minority_n: minority,
        types: shapes,
      });
    } else if (shapes.length === 1 && c.counts.null) {
      nullMixFindings.push({
        collection: col.id,
        field,
        records: col.records.length,
        type: shapes[0],
        typed_n: c.counts[shapes[0]],
        null_n: c.counts.null,
        absent,
      });
    }
  }

  // ── within-array item polymorphism ──────────────────────────────────────
  const arrayFields = new Map(); // field -> {prims, sigs, keyN, pairN, arrays, items}
  for (const r of col.records) {
    for (const [k, v] of Object.entries(r)) {
      if (!Array.isArray(v) || !v.length) continue;
      if (!arrayFields.has(k))
        arrayFields.set(k, { prims: new Map(), sigs: new Map(), keyN: new Map(), pairN: new Map(), arrays: 0, items: 0 });
      const a = arrayFields.get(k);
      a.arrays++;
      for (const it of v) {
        a.items++;
        const t = typeOf(it);
        a.prims.set(t, (a.prims.get(t) || 0) + 1);
        if (t === "object") {
          const keys = Object.keys(it).sort();
          a.sigs.set(keys.join("|"), (a.sigs.get(keys.join("|")) || 0) + 1);
          for (const key of keys) a.keyN.set(key, (a.keyN.get(key) || 0) + 1);
          for (let i = 0; i < keys.length; i++)
            for (let j = i + 1; j < keys.length; j++) {
              a.pairN.set(pairKey(keys[i], keys[j]), (a.pairN.get(pairKey(keys[i], keys[j])) || 0) + 1);
            }
        }
      }
    }
  }
  for (const [field, a] of arrayFields) {
    const prims = [...a.prims.entries()].sort((x, y) => y[1] - x[1]);
    if (prims.length >= 2) {
      itemFindings.push({
        kind: "primitive",
        collection: col.id,
        file: col.file,
        field,
        arrays: a.arrays,
        items: a.items,
        detail: prims.map(([t, n]) => `${t}:${n}`).join(" "),
        minority_n: prims.slice(1).reduce((s, [, n]) => s + n, 0),
      });
      continue; // primitive split is the stronger finding; do not double-report
    }
    if (a.sigs.size >= 2) {
      // keysplit = a MUTUALLY EXCLUSIVE key pair (see the header for why the
      // "no key common to all items" test was rejected: it misses incident 3).
      const keys = [...a.keyN.keys()];
      const objItems = [...a.sigs.values()].reduce((s, n) => s + n, 0);
      const floor = Math.max(2, Math.ceil(objItems * 0.05));
      const pairs = [];
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          const [x, y] = [keys[i], keys[j]].sort();
          if (a.pairN.get(pairKey(x, y))) continue; // they co-occur → not exclusive
          const nx = a.keyN.get(x);
          const ny = a.keyN.get(y);
          if (Math.min(nx, ny) < floor) continue;
          if (nx + ny < objItems * 0.6) continue;
          pairs.push({ a: x, b: y, na: nx, nb: ny, min: Math.min(nx, ny) });
        }
      }
      if (pairs.length) {
        pairs.sort((p, q) => q.min - p.min);
        const sigs = [...a.sigs.entries()].sort((x, y) => y[1] - x[1]);
        itemFindings.push({
          kind: "keysplit",
          collection: col.id,
          file: col.file,
          field,
          arrays: a.arrays,
          items: a.items,
          exclusive_pairs: pairs,
          detail:
            `互斥鍵對 ${pairs.map((p) => `${p.a}(${p.na}) ⊥ ${p.b}(${p.nb})`).join(" · ")}` +
            `  ‖ 鍵組: ${sigs.map(([s, n]) => `${n}×{${s}}`).join(" | ")}`,
          minority_n: pairs[0].min,
        });
      }
    }
  }
}

// ── 4. consumer grep over app.js + js/*.js ────────────────────────────────
const SHAPE_METHODS = ["join", "map", "filter", "length", "trim", "split"];
// A call site is marked [guarded] when a shape test appears on the same line or
// the line before. BOTH idioms in this codebase count, not just the first:
//   Array.isArray(x) ?…            — the c078f4e fix shape
//   typeof x === "string" ?…       — app.js:4698's guard on point.needling
// Counting only Array.isArray produced a false "unguarded" verdict on
// app.js:4699 during the first pass of this script, which is exactly the kind
// of over-claim the report must not make.
const RE_GUARD = /Array\.isArray\s*\(|typeof\s+[^\n;]{1,60}===\s*["'](?:string|object|number|boolean)["']/;
const consumerFiles = [];
{
  const a = path.join(ROOT, "app.js");
  if (fs.existsSync(a)) consumerFiles.push(a);
  const jsDir = path.join(ROOT, "js");
  if (fs.existsSync(jsDir)) {
    for (const f of fs.readdirSync(jsDir).sort()) {
      if (f.endsWith(".js")) consumerFiles.push(path.join(jsDir, f));
    }
  }
}
const consumerSources = consumerFiles.map((f) => ({ file: rel(f), lines: fs.readFileSync(f, "utf8").split(/\r?\n/) }));

const consumerCache = new Map();
function consumersFor(field) {
  if (consumerCache.has(field)) return consumerCache.get(field);
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mention = new RegExp(`(?:^|[^A-Za-z0-9_$])${esc}(?![A-Za-z0-9_$])`);
  const shapeCall = new RegExp(
    `(?:^|[^A-Za-z0-9_$])${esc}(?![A-Za-z0-9_$])[^\\n]{0,80}?\\.(?:${SHAPE_METHODS.join("|")})\\b`
  );
  const sites = [];
  let mentions = 0;
  for (const src of consumerSources) {
    for (let i = 0; i < src.lines.length; i++) {
      const line = src.lines[i];
      if (!mention.test(line)) continue;
      mentions++;
      const m = shapeCall.exec(line);
      if (!m) continue;
      const method = (line.slice(m.index).match(/\.(join|map|filter|length|trim|split)\b/) || [, "?"])[1];
      const guarded = RE_GUARD.test(line) || (i > 0 && RE_GUARD.test(src.lines[i - 1]));
      sites.push({ file: src.file, line: i + 1, method, guarded, text: clip(line, 130) });
    }
  }
  const out = { sites, mentions };
  consumerCache.set(field, out);
  return out;
}

// ── 5. rank ───────────────────────────────────────────────────────────────
// The dispatch's list, verbatim; not widened on this script's own authority.
const RE_SAFETY = /contraindicat|caution|red_?flag|warning|interact|dosage|dose|depth/i;

for (const f of shapeFindings) {
  f.safety = RE_SAFETY.test(f.field);
  const c = consumersFor(f.field);
  f.consumer_sites = c.sites;
  f.consumer_mentions = c.mentions;
  f.tier = c.sites.length ? "A" : f.safety ? "B" : "C";
}
for (const f of itemFindings) {
  f.safety = RE_SAFETY.test(f.field);
  const c = consumersFor(f.field);
  f.consumer_sites = c.sites;
  f.consumer_mentions = c.mentions;
}

// ── 5b. CROSS: same field name, different dominant shape per collection ───
const crossFindings = [];
for (const [field, entries] of byName) {
  if (entries.length < 2) continue;
  const doms = new Set(entries.map((e) => e.dominant));
  if (doms.size < 2) continue;
  const totals = Object.create(null);
  for (const e of entries) for (const [t, n] of Object.entries(e.counts)) totals[t] = (totals[t] || 0) + n;
  const ranked = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  const c = consumersFor(field);
  crossFindings.push({
    field,
    safety: RE_SAFETY.test(field),
    collections: entries.length,
    dominant_shapes: [...doms],
    totals,
    majority: ranked[0],
    majority_n: totals[ranked[0]],
    minority_n: ranked.slice(1).reduce((s, t) => s + totals[t], 0),
    per_collection: entries.sort((x, y) => x.dominant.localeCompare(y.dominant) || x.collection.localeCompare(y.collection)),
    consumer_sites: c.sites,
    consumer_mentions: c.mentions,
    tier: c.sites.length ? "A" : RE_SAFETY.test(field) ? "B" : "C",
  });
}

const tierSort = (a, b) =>
  Number(b.safety) - Number(a.safety) ||
  b.consumer_sites.length - a.consumer_sites.length ||
  b.minority_n - a.minority_n ||
  a.collection.localeCompare(b.collection);

const tierA = shapeFindings.filter((f) => f.tier === "A").sort(tierSort);
const tierB = shapeFindings.filter((f) => f.tier === "B").sort(tierSort);
const tierC = shapeFindings.filter((f) => f.tier === "C").sort(tierSort);
itemFindings.sort(
  (a, b) =>
    Number(b.safety) - Number(a.safety) ||
    b.consumer_sites.length - a.consumer_sites.length ||
    b.minority_n - a.minority_n
);

const crossSort = (a, b) =>
  Number(b.safety) - Number(a.safety) ||
  b.consumer_sites.length - a.consumer_sites.length ||
  b.minority_n - a.minority_n ||
  a.field.localeCompare(b.field);
const crossA = crossFindings.filter((f) => f.tier === "A").sort(crossSort);
const crossB = crossFindings.filter((f) => f.tier === "B").sort(crossSort);
const crossC = crossFindings.filter((f) => f.tier === "C").sort(crossSort);

const COUNTS = {
  A: tierA.length,
  B: tierB.length,
  C: tierC.length,
  SHAPE: shapeFindings.length,
  CROSS: crossFindings.length,
  CROSS_A: crossA.length,
  CROSS_B: crossB.length,
  CROSS_C: crossC.length,
  ITEM: itemFindings.length,
  NULLMIX: nullMixFindings.length,
};

// ── 6. known-incident sanity check ────────────────────────────────────────
// If the walker cannot re-find the three defects that motivated it, the walker
// is broken and its "N polymorphic fields" number is not trustworthy. This is
// printed on every run, not hidden behind a flag.
//
// Incident 2 is DELIBERATELY marked out of scope rather than quietly dropped.
// The pre-visit `metrics` split lived in a TRANSPORT PAYLOAD in flight (the
// app-side validator vs the CLI validator disagreed about the same object),
// not in any `data/**.json` record. This script scans data AT REST. That is a
// real boundary of the class it covers, and it is stated here so nobody reads
// "3 incidents, 3 ticks" into a scan that structurally cannot see one of them.
// Payload shapes are gated by scripts/validate-previsit-payload.js --self-test.
const SENTINELS = [
  {
    key: "cautionsEn",
    label: "#1 cautionsEn string/array (c078f4e)",
    in_scope: true,
    test: (f) => f.field === "cautionsEn",
  },
  {
    key: "metrics",
    label: "#2 previsit metrics array/object (aaf8b81)",
    in_scope: false,
    note: "傳輸中的 payload,不是 data/**.json 記錄 —— 本腳本掃靜態資料,結構上看不到。該類由 validate-previsit-payload.js --self-test 守。此處只回報 data 內同名欄位是否也分裂。",
    test: (f) => f.field === "metrics",
  },
  {
    key: "import_artifacts",
    label: "#3 import_artifacts two key families",
    in_scope: true,
    test: (f) => f.field === "import_artifacts",
  },
];
const sentinelResults = SENTINELS.map((s) => {
  const inShape = shapeFindings.filter(s.test);
  const inItem = itemFindings.filter(s.test);
  const inCross = crossFindings.filter(s.test);
  return {
    key: s.key,
    label: s.label,
    in_scope: s.in_scope,
    note: s.note || "",
    found: inShape.length + inItem.length + inCross.length > 0,
    cross_hits: inCross.map((f) => ({
      collections: f.collections,
      totals: f.totals,
      per_collection: f.per_collection.map((e) => `${e.collection}=${e.dominant}(${renderCountsInline(e.counts)})`),
    })),
    shape_hits: inShape.map((f) => ({ collection: f.collection, counts: f.counts })),
    item_hits: inItem.map((f) => ({ collection: f.collection, kind: f.kind, detail: f.detail })),
  };
});
/** Only IN-SCOPE sentinels can indict the walker. */
const sentinelMisses = sentinelResults.filter((s) => s.in_scope && !s.found);

const stats = {
  json_files_seen: files.length,
  json_files_parsed: parsed.length,
  parse_failures: parseFailures.length,
  collections: collections.size,
  collections_nested: [...collections.values()].filter((c) => c.depth > 0).length,
  records_total: [...collections.values()].reduce((a, c) => a + c.records.length, 0),
  field_slots_scanned: totalFields,
  distinct_field_names: new Set(shapeFindings.map((f) => f.field)).size,
  consumer_files: consumerSources.length,
};

// ── 7. output ─────────────────────────────────────────────────────────────
const renderCounts = renderCountsInline;

function renderCross(f, indent = "  ") {
  const l = [];
  l.push(
    `${indent}${f.field}${f.safety ? "  ⚠SAFETY" : ""}  —— ${f.collections} 個集合，主導型別 [${f.dominant_shapes.join(" / ")}]\n` +
      `${indent}    合計 ${renderCounts(f.totals)}  多數=${f.majority}(${f.majority_n}) 少數=${f.minority_n}`
  );
  const per = WORKLIST ? f.per_collection : f.per_collection.slice(0, 8);
  for (const e of per) l.push(`${indent}    ${e.dominant.padEnd(7)} ${e.collection}  (${renderCounts(e.counts)})`);
  if (!WORKLIST && f.per_collection.length > per.length)
    l.push(`${indent}    …另 ${f.per_collection.length - per.length} 個集合（--worklist 全列）`);
  if (f.consumer_sites.length) {
    for (const s of f.consumer_sites.slice(0, WORKLIST ? 99 : 4))
      l.push(`${indent}    → ${s.file}:${s.line} .${s.method}${s.guarded ? " [guarded]" : ""}  ${s.text}`);
    if (!WORKLIST && f.consumer_sites.length > 4)
      l.push(`${indent}    → …另 ${f.consumer_sites.length - 4} 處（--worklist 全列）`);
  } else {
    l.push(`${indent}    → 無 same-line shape 呼叫（欄名被提及 ${f.consumer_mentions} 次；grep 有盲區,見腳本開頭）`);
  }
  return l.join("\n");
}

function renderShape(f, indent = "  ") {
  const l = [];
  l.push(
    `${indent}${f.collection}  ::  ${f.field}${f.safety ? "  ⚠SAFETY" : ""}\n` +
      `${indent}    ${renderCounts(f.counts)}  (absent:${f.absent} of ${f.records})  多數=${f.majority}(${f.majority_n}) 少數=${f.minority_n}`
  );
  for (const t of f.types) l.push(`${indent}    ${t.padEnd(7)} 例: ${f.samples[t]}`);
  if (f.consumer_sites.length) {
    for (const s of f.consumer_sites.slice(0, WORKLIST ? 99 : 4)) {
      l.push(`${indent}    → ${s.file}:${s.line} .${s.method}${s.guarded ? " [guarded]" : ""}  ${s.text}`);
    }
    if (!WORKLIST && f.consumer_sites.length > 4)
      l.push(`${indent}    → …另 ${f.consumer_sites.length - 4} 處（--worklist 全列）`);
  } else {
    l.push(`${indent}    → 無 same-line shape 呼叫（欄名被提及 ${f.consumer_mentions} 次；grep 有盲區,見腳本開頭）`);
  }
  return l.join("\n");
}

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        stats,
        counts: COUNTS,
        sentinels: sentinelResults,
        parse_failures: parseFailures,
        tierA,
        tierB,
        tierC,
        crossA,
        crossB,
        crossC,
        item: itemFindings,
        nullmix: nullMixFindings,
      },
      null,
      2
    )
  );
} else {
  console.log(
    `validate-field-shape-consistency: ${stats.json_files_parsed}/${stats.json_files_seen} 個 data/**.json 解析成功，` +
      `${stats.collections} 個集合（其中 ${stats.collections_nested} 個是巢狀）、${stats.records_total} 筆記錄、` +
      `${stats.field_slots_scanned} 個欄位槽位。\n`
  );
  console.log(`  SHAPE   同一集合內型別分裂的欄位        ${COUNTS.SHAPE}`);
  console.log(`            ├ Tier A 有 shape 專屬消費端   ${COUNTS.A}   ← 危險的那一類`);
  console.log(`            ├ Tier B 安全欄名、找不到消費端 ${COUNTS.B}`);
  console.log(`            └ Tier C 沒人讀（記帳用）      ${COUNTS.C}`);
  console.log(`  CROSS   同名欄位在不同集合主導型別不同    ${COUNTS.CROSS}`);
  console.log(`            ├ Tier A 有 shape 專屬消費端   ${COUNTS.CROSS_A}   ← 事故 #1 的真實規模在這一層`);
  console.log(`            ├ Tier B 安全欄名、找不到消費端 ${COUNTS.CROSS_B}`);
  console.log(`            └ Tier C 沒人讀（記帳用）      ${COUNTS.CROSS_C}`);
  console.log(`  ITEM    陣列元素型別/鍵組分裂            ${COUNTS.ITEM}`);
  console.log(`  NULLMIX 單一型別但混 null（會大聲爆，非本次目標） ${COUNTS.NULLMIX}`);

  console.log(`\n===== 已知三起事故回測（walker 自檢）=====`);
  for (const s of sentinelResults) {
    const mark = !s.in_scope ? (s.found ? "○ 範圍外（但同名欄位也分裂）" : "○ 範圍外") : s.found ? "✔ 找到" : "✘ 沒找到";
    console.log(`  ${mark}  ${s.label}`);
    if (s.note) console.log(`        註：${s.note}`);
    for (const h of s.cross_hits) {
      console.log(`        CROSS  ${h.collections} 個集合  合計 ${renderCounts(h.totals)}`);
      for (const line of h.per_collection) console.log(`               ${line}`);
    }
    for (const h of s.shape_hits) console.log(`        SHAPE  ${h.collection}  ${renderCounts(h.counts)}`);
    for (const h of s.item_hits) console.log(`        ITEM   ${h.collection}  [${h.kind}]  ${clip(h.detail, 200)}`);
  }
  if (sentinelMisses.length) {
    console.log(
      `  ⚠ 有應該掃到的 sentinel 沒掃到 —— 表示 walker 漏檔或集合偵測太窄，上面的總數就不可信。\n` +
        `    修 walker 再引用數字，不要只把 sentinel 拿掉。`
    );
  }

  if (parseFailures.length) {
    console.log(`\n===== 解析失敗（掃不到 = 盲區，${parseFailures.length}）=====`);
    for (const p of parseFailures) console.log(`  ${p.file}  ${p.reason}`);
  }

  console.log(`\n===== Tier A：型別分裂 × 有 shape 專屬消費端（${COUNTS.A}）=====`);
  const aShown = WORKLIST ? tierA : tierA.slice(0, 20);
  for (const f of aShown) console.log(renderShape(f));
  if (!WORKLIST && tierA.length > aShown.length) console.log(`  …另 ${tierA.length - aShown.length} 筆（--worklist 全列）`);

  console.log(`\n===== CROSS Tier A：跨集合同名欄位型別不一致 × 有 shape 專屬消費端（${COUNTS.CROSS_A}）=====`);
  const caShown = WORKLIST ? crossA : crossA.slice(0, 20);
  for (const f of caShown) console.log(renderCross(f));
  if (!WORKLIST && crossA.length > caShown.length)
    console.log(`  …另 ${crossA.length - caShown.length} 筆（--worklist 全列）`);

  console.log(`\n===== ITEM：陣列元素分裂（${COUNTS.ITEM}）=====`);
  const iShown = WORKLIST ? itemFindings : itemFindings.slice(0, 15);
  for (const f of iShown) {
    console.log(
      `  ${f.collection}  ::  ${f.field}[]  [${f.kind}]${f.safety ? "  ⚠SAFETY" : ""}\n` +
        `      ${f.arrays} 個陣列 / ${f.items} 個元素 · 少數側 ${f.minority_n}\n` +
        `      ${clip(f.detail, WORKLIST ? 400 : 180)}`
    );
    for (const s of f.consumer_sites.slice(0, WORKLIST ? 99 : 2))
      console.log(`      → ${s.file}:${s.line} .${s.method}${s.guarded ? " [guarded]" : ""}  ${s.text}`);
  }
  if (!WORKLIST && itemFindings.length > iShown.length)
    console.log(`  …另 ${itemFindings.length - iShown.length} 筆（--worklist 全列）`);

  console.log(`\n===== Tier B：安全欄名、grep 找不到消費端（${COUNTS.B}）=====`);
  const bShown = WORKLIST ? tierB : tierB.slice(0, 15);
  for (const f of bShown) console.log(renderShape(f));
  if (!WORKLIST && tierB.length > bShown.length) console.log(`  …另 ${tierB.length - bShown.length} 筆（--worklist 全列）`);

  console.log(`\n===== CROSS Tier B：安全欄名、grep 找不到消費端（${COUNTS.CROSS_B}）=====`);
  const cbShown = WORKLIST ? crossB : crossB.slice(0, 10);
  for (const f of cbShown) console.log(renderCross(f));
  if (!WORKLIST && crossB.length > cbShown.length)
    console.log(`  …另 ${crossB.length - cbShown.length} 筆（--worklist 全列）`);

  if (WORKLIST) {
    console.log(`\n===== Tier C：記帳用（${COUNTS.C}）=====`);
    for (const f of tierC) console.log(renderShape(f));
    console.log(`\n===== CROSS Tier C：記帳用（${COUNTS.CROSS_C}）=====`);
    for (const f of crossC) console.log(renderCross(f));
    console.log(`\n===== NULLMIX（${COUNTS.NULLMIX}）=====`);
    for (const f of nullMixFindings)
      console.log(`  ${f.collection}  ::  ${f.field}  ${f.type}:${f.typed_n} null:${f.null_n} absent:${f.absent}`);
  } else {
    console.log(
      `\n（Tier C ${COUNTS.C} 筆、CROSS Tier C ${COUNTS.CROSS_C} 筆與 NULLMIX ${COUNTS.NULLMIX} 筆只在 --worklist 列出）`
    );
  }

  console.log(
    `\n提示：本檢查是 NOTE 級，預設不會讓 CI 失敗（見腳本開頭「CI tier」與畢業條件）。` +
      `\n     消費端偵測是逐行 grep：別名、解構、動態取值都看不到，「0 消費端」只代表這個 grep 沒找到。` +
      `\n     本腳本只量測，不改任何 data —— 正規化屬於另一批、要另外核准。` +
      `\n     加 --blocking=A 可預覽危險層畢業後的行為。`
  );
}

// ── 8. blocking preview / graduated gate ──────────────────────────────────
if (BLOCKING.length) {
  const map = { A: COUNTS.A, B: COUNTS.B, CROSS: COUNTS.CROSS_A, ITEM: COUNTS.ITEM };
  const unknown = BLOCKING.filter((t) => !(t in map));
  if (unknown.length) {
    console.error(`\n❌ --blocking 不認得 [${unknown.join(",")}]；可用值：A, B, CROSS, ITEM。`);
    process.exit(2);
  }
  const failed = BLOCKING.filter((t) => map[t] > 0);
  if (failed.length) {
    console.error(`\n❌ --blocking: ${failed.map((t) => `${t}=${map[t]}`).join(", ")}（見上方清單）。`);
    process.exit(1);
  }
  console.log(`\nPASS（--blocking=${BLOCKING.join(",")}，目前 0）。`);
} else if (!JSON_OUT) {
  console.log("\n完成（NOTE 級，不影響 exit code）。");
}

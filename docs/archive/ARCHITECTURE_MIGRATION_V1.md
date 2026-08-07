# Architecture migration V1 — one entity model

Ting, after reviewing the whole app: 「重複的太多 使用便利性有問題 然後雙向連接跟
命名都不夠專業 內容太多我要手動輸入 中藥 方濟 針灸都是」.

She is right, and the evidence is not subtle.

---

## 1. Measured state, 2026-07-22

**483 JSON record files, 2900 records.**

**26 id prefixes, several of them duplicates of each other:**

| concept | competing prefixes |
| --- | --- |
| conditions | `cond` (150) · `western_condition` (26) · `xwalk` (150) |
| patterns | `pattern` (50) · `pat` (8) |
| formulas | `formula` (143) · `formula_category` (26) |

**Tags and taxonomy have no namespace at all** — `qi_tonify`, `common_cold`,
`exterior_wind_cold` are bare strings sitting beside properly namespaced ids.

**The same entity lives in several files:**

- formulas → `formulas.json`, `formula_canon_shortlist.json` (115),
  `high_yield_formula_seeds.json` (23), `formula_categories.json` (18)
- conditions → `conditions.json` (12), `condition_canon_shortlist.json` (150),
  `condition_graph_expansion.json` (12), `condition_crosswalk.json` (150)
- points → `361.json`, `staging_points.json` (361), `point_index.json` (277),
  the generated twins, plus `embedded/meridian_*.json`

**Field naming has drifted badly:**

- **21 different `source*` field names**: source_id, source_hint, source_status,
  source_url, source_urls, sources, source_type, source_name, source_notes,
  source_field, source_match, source_priority, primary_sources,
  secondary_sources, source_group, source_condition_id, source_formula,
  source_pdf_page, allowed_source_types, restricted_source_types, classical_source_hint
- **10 different status fields**: review_status, source_status, link_status,
  enrichment_status, conflict_status, access_status, license_status,
  granule_catalog_status, access_status_note, status
- two names for one field: `modern_clinical_use_tags` (formulas) vs
  `modern_use_tags` (herbs)
- three names for one dose: the renderer literally checks
  `decoction_reference_g || decoction_dose_g || dose_range`

## 2. Diagnosis

**There is no single entity model.** The repo grew by accretion: each new track
— herbs, conditions, anatomy, exams, pairs — opened its own file, its own id
prefix and its own field names instead of extending a shared one.

Every one of Ting's four complaints is a symptom of that one cause:

| complaint | cause |
| --- | --- |
| 重複太多 | the same entity exists in 3–4 files with no designated canonical copy |
| 使用便利性差 | nothing joins, so the UI cannot offer real navigation |
| 雙向連接與命名不專業 | 26 prefixes and 21 source-field names mean **no generic resolver can be written** — every relationship needs bespoke code |
| **內容要手動輸入** | nothing can be derived, because nothing is joined. This is a consequence of the first three, not a separate problem. |

**I made this worse today.** modern_application_vocabulary,
comparison_group_vocabulary, movement_vocabulary, herb_pair_relations,
herb_pairs, the exam blueprint, the reference records — each a new file with
new conventions. I was treating "too many parallel structures" by adding more
parallel structures. The individual pieces are fine; the direction was wrong.

## 3. The fix, in order

### V1-A — Entity registry *(non-breaking, do first)*

`scripts/build-entity-registry.js` scans every data file and emits
`data/generated/entity_registry.json`: every id in the repo mapped to its type,
bilingual names, home file, and any aliases.

**This changes no source data.** It gives the app one place to resolve any id
into a name, which is what the display layer has been faking with per-section
special cases. It also produces the collision report that V1-B needs.

### V1-B — Namespace consolidation

Fold the duplicate prefixes onto one each: `pat.` → `pattern.`,
`western_condition.` → `cond.`, and give the bare taxonomy strings a namespace
(`qi_tonify` → `cat.tonify.qi`, parented under `cat.tonify`).

DECISIONS D1 says ids are immutable — so old ids are never deleted, they become
**aliases** recorded in the registry. Nothing breaks; both resolve.

### V1-C — Field contract

One `review_status`. One `sources[]` shape. One dose field. One tag field name.
Mechanical rename with a codemod plus a validator that fails on the old names.

### V1-D — Relation table

Replace the scattered arrays (`related_formulas`, `key_pairs`,
`related_conditions`, `treatable_conditions`, …) with edges:
`{ from, to, relation, source_id, review_status }`.

**This is what makes bidirectional linking free.** Today each relationship type
needs its own renderer and its own reverse lookup written by hand; with edges,
the reverse direction is the same query with `from` and `to` swapped.

### V1-E — Canonical copy per entity

For each entity type, designate one file as canonical and mark the others as
derived or as staging. Then delete or clearly quarantine the duplicates.

## 4. What does not change

- **No content is edited.** This migration moves ids and field names only.
- No safety-load value is touched — depths, doses, contraindications are
  carried across verbatim.
- The status ladder and the fill-and-cite policy stay exactly as they are.

## 5. Cost, honestly

V1-A is a day of tooling. V1-B and V1-C are mechanical and scriptable, with
validators to prove them. V1-D is the real work and touches the renderer.

**Progress will look stalled for a day or two.** The alternative is paying this
interest on every future track — which is what Ting felt today, on a repo that
is only a few months old. Doing the content fill first would mean filling
everything twice.

## 6. Order of work

| step | work | breaks anything? |
| --- | --- | --- |
| V1-A | entity registry + collision report | no |
| V1-C | field contract codemod + validator | no, mechanical |
| V1-B | namespace consolidation with aliases | no, aliases keep old ids resolving |
| V1-E | designate canonical files, quarantine duplicates | no |
| V1-D | relation table + renderer rewrite | yes — do last, behind the registry |

Then, and only then, resume content fill — against a model where a filled fact
in one place shows up everywhere it is relevant, instead of needing to be typed
again.

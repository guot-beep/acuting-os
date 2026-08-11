# SUPP VERIFY LEDGER — `data/supplements/supplements.json`

Branch `codex/supp-verify-a`, off `origin/codex/pattern-v2` @ 726f773.
Pass run 2026-08-11. Scope: 36 records, interaction focus + skeleton audit +
`related_herb_id`. Staging inputs: `SUPP_BATCH01_INTERACTION_FOCUS_MATRIX_v1`,
`SUPP_SKELETON_BATCH_01_v1`, `SUPP_SKELETON_BATCH_02_v1`,
`SUPPLEMENT_SOURCE_MAP_BATCH_01`, `SUPPLEMENT_TAXONOMY_GAP_REVIEW_v0`.
Superseded assets in `DO_NOT_USE_SUPERSEDED_ASSETS.md` were not read.

## 1. What changed

| Field | Before | After |
|---|---|---|
| `interaction_focus` (new) | 0/36 | 36/36 |
| `interaction_focus_vocabulary` (new, dataset level) | absent | present |
| `typical_dose_range_en` + `dose_source` | 34/36 | 34/36 (unchanged) |
| `evidence_snapshot_en` + `evidence_source` | 36/36 | 36/36 (unchanged) |
| `common_forms_en` | 36/36 | 36/36 (unchanged) |
| `key_safety_notes` (all source-carrying) | 36/36 | 36/36 (unchanged) |
| `maturity` | 36 skeleton | 36 skeleton (0 upgrades — see §5.3) |
| `related_herb_id` | 2 set | 2 set (both verified, 0 added) |
| `related_drugclass_review_flags` | 0/36 | 0/36 (review-gated — see §5.1) |

Every commit was purely additive: 919 insertions, 0 deletions across the three
batches. No pre-existing field was shortened, re-worded, or emptied; the patch
script carried a per-record byte-equality guard on all prior keys.

**The file arrived far more complete than the dispatch assumed.** All 36 records
already carried forms / dose / evidence / safety notes transcribed from the two
skeleton packs. No record was at bare skeleton needing those four fields filled,
so §2 of the dispatch ("skeleton deepening") had 0 records to act on. The real
hole was the interaction layer, which existed in the staging packs and in no
canonical field.

## 2. `interaction_focus` — shape and vocabulary

The two packs express the same triage in two different shapes and two different
string vocabularies. Normalized to one, with the pack's original string kept
verbatim in `staged_label` so every normalization is reversible and auditable.

```json
"interaction_focus": {
  "classes": {
    "anticoagulant":     {"status": "...", "staged_label": "...", "note_en": "..."},
    "immunosuppressant": {...},
    "thyroid":           {...}
  },
  "focus_note_en": "...", "source": {"name": "...", "url": "..."},
  "staging_ref": "docs/research_packs/..."
}
```

Five statuses: `known_concern`, `possible_concern`, `component_dependent`,
`no_specific_flag_in_source`, `insufficient_data`. The last two are **not**
"no interaction" — that distinction is required by the source-map architecture
guardrail ("distinguish unknown/not-reviewed from reviewed-and-none-found") and
is the reason a flat boolean flag list could not carry this data.

Class keys follow the **canonical** strings already in
`key_safety_notes[].interaction_flags` (`anticoagulant` / `immunosuppressant` /
`thyroid`), not the Batch-02 pack's `thyroid_med`.

### Class-cell tally — 36 records x 3 classes = 108 cells

| status | cells |
|---|---:|
| `insufficient_data` | 42 |
| `no_specific_flag_in_source` | 37 |
| `known_concern` | 16 |
| `possible_concern` | 9 |
| `component_dependent` | 4 |

66/108 cells carry a positive review verdict traced to a named federal source;
42/108 are honestly unknown. `focus_note_en` is unique across 36/36 records and
class-level `note_en` unique across 26/26 written — no boilerplate.

### Normalization judgment calls (each preserved in `staged_label`)

| Pack label | Normalized to | Why |
|---|---|---|
| `known_theoretical_clinical_concern` (ashwagandha/immuno) | `known_concern` | NCCIH names the interaction outright; "theoretical" understates it |
| `known_warfarin_case_signal` (glucosamine) | `possible_concern` | case-level reports, not established |
| `theoretical_concern` (echinacea/immuno) | `possible_concern` | explicitly theoretical in source |
| `autoimmune_immunologic_context_flag` (ginseng/immuno) | `possible_concern` | host-context risk, not a drug interaction |
| `thyroid_biology_relevant_but_no_blanket_drug_rule` (selenium) | `no_specific_flag_in_source` | biology kept in `note_en`; no drug rule asserted |
| `major_clinical_context_flag` (iodine/thyroid) | `known_concern` | source asserts thyroid-drug relevance |
| `product_dependent_vitamin_k_caffeine_context` (green tea) | `possible_concern` | product-dependent, not a class rule |

Direction of error: for the two safety-critical calls that could go either way
(ashwagandha, glucosamine) the flag is raised, not suppressed. All five statuses
except `no_specific_flag_in_source` should drive a human review prompt.

## 3. `related_herb_id` — 2 linked, 1 rejection, 0 invented

Checked against the 330 herb records in `data/generated/knowledge_data.js`.

- `supp.curcumin` -> `herb.jiang_huang` (薑黃, Turmeric / Curcuma Longa) — verified, kept.
- `supp.asian_ginseng` -> `herb.ren_shen` (人參, Ginseng Root) — verified, kept.
- **`supp.ginkgo` -> left null, deliberately.** The only ginkgo herb records are
  `herb.yin_xing` (銀杏, "Ginkgo Semen") and `herb.bai_guo` (白果, "Ginkgo Nut") —
  both the **seed**. `supp.ginkgo` is standardized **leaf** extract, and the
  staged pack explicitly separates them ("seeds are toxic when raw/roasted in
  quantity; supplement data mainly concern leaf extract"). Different plant part =
  different medicinal substance. Linking these would assert a false identity.
- Garlic, green tea, elderberry, echinacea, St John's wort, ashwagandha, melatonin:
  no corresponding herb record exists in the 330. Correctly null.

## 4. Gaps for SOL research — CONTENT_REQUEST-ready

**CR-SUPP-G01 — `supp.lutein` has no supporting source. (HIGH)**
Its `dose_source`, `evidence_source` and only `sources[0]` all point at
`https://ods.od.nih.gov/factsheets/list-all/`. Fetched 2026-08-11: that page is a
**directory index**; NIH ODS publishes no lutein fact sheet and routes lutein to
an external MedlinePlus entry. MedlinePlus herbs-and-supplements content has been
unavailable since 2025-07-29 (Therapeutic Research Center data withdrawn), so
that route is also dead. The canonical dose claim "lutein 10 mg/day with
zeaxanthin 2 mg/day" therefore sits in canon with a URL that does not support it.
Not overwritten (constitution §三 forbids overwriting canonical content without
Ting). Needs a real source — AREDS2 / National Eye Institute is the likely home.
Interaction cells were downgraded to `insufficient_data` in the meantime.

**CR-SUPP-G02 — `supp.nmn` cites a PubMed search query, not a record. (MEDIUM)**
`sources[1]` is `pubmed.ncbi.nlm.nih.gov/?term=nicotinamide+mononucleotide...` —
a live search URL, not a citable, stable source. Needs specific trial citations.
Dose correctly left null; the pack's "250–1,200 mg/day" was **not** promoted to
canon because its only backing is that search URL.

**CR-SUPP-G03 — `supp.nad_plus` has only the FDA landing page. (MEDIUM)**
Sole source is `fda.gov/food/dietary-supplements`, a generic regulatory page with
no ingredient-level content. Dose correctly null. Either find an ingredient-level
source or record the absence as the finding.

**CR-SUPP-G04 — `supp.nac` / `supp.glutathione` dose figure unconfirmed. (MEDIUM)**
The cited ODS Immune Function fact sheet **does** carry an "N-acetylcysteine and
Glutathione" section (fetched and confirmed 2026-08-11), so the page-level
attribution is sound. But the specific "~600–1,200 mg/day" in `supp.nac` was not
visible in the fetched content. Verify the figure against that page or re-source.

**CR-SUPP-G05 — no `drugclass.*` target for immunosuppressants. (BLOCKER for §5.1)**
`data/pharmacology/drug_classes.json` holds 33 classes. Anticoagulant and thyroid
are well covered; the immunosuppressant focus class has no target beyond
`drugclass.systemic_glucocorticoids` — cyclosporine, tacrolimus and the
antimetabolites are absent. This blocks a complete supp→drugclass crosswalk, which
matters most for `supp.st_johns_wort` (cyclosporine) and `supp.ashwagandha`.

**CR-SUPP-G06 — three records sit in semantically wrong categories. (MEDIUM)**
`supp.melatonin` is filed `antioxidants_coenzymes`; `supp.glucosamine` and
`supp.chondroitin` are filed `amino_acids_performance`. All three are validator-legal
but wrong — melatonin is neither antioxidant nor coenzyme, and glucosamine is an
aminosaccharide, not a performance amino acid. `SUPPLEMENT_SOURCE_MAP_BATCH_01`
already flagged all three `UNRESOLVED_CATEGORY`, and
`SUPPLEMENT_TAXONOMY_GAP_REVIEW_v0` proposes `other_bioactives`, which does not
exist in the 8-term vocabulary. **Not changed here** — adding a 9th category is a
taxonomy decision for Fable/`DECISIONS.md`, and the vocabulary file is outside
this pass's write scope.

**CR-SUPP-G07 — no ginkgo leaf herb card. (LOW)** See §3. A 銀杏葉 / Ginkgo Folium
herb record would give `supp.ginkgo` an honest `related_herb_id`.

## 5. Blocked / not done, with reasons

### 5.1 `related_drugclass_review_flags` left empty on all 36
`SUPP_CARD_TEMPLATE.md` §1 rule 3 gates this field behind human review of the
CR-009 staging seeds, the template supplies no object shape for its entries, and
CR-SUPP-G05 means the immunosuppressant axis has nowhere to point. Filling it
would have been schema invention on a review-gated field. Proposed crosswalk for
whoever holds that review:

| focus class | `drugclass.*` targets available today |
|---|---|
| anticoagulant | `vitamin_k_antagonists`, `heparins`, `factor_xa_inhibitors`, `direct_thrombin_inhibitors`; antiplatelet: `cox_antiplatelet`, `p2y12_inhibitors` |
| thyroid | `thyroid_hormones` |
| immunosuppressant | `systemic_glucocorticoids` only — **incomplete**, see CR-SUPP-G05 |

Also reachable from record-level notes already in canon: `thiazide_diuretics`
(vitamin D), `hydantoin_antiseizure` / `iminostilbene_antiseizure` (folate),
`statins` and `nonselective_beta_blockers` (green tea — atorvastatin, nadolol).

### 5.2 `interaction_focus` is a field the template does not define
Adding it is a judgment call and should be ratified. The case for it: the shape
and the three class names come from `SUPP_SKELETON_BATCH_02_v1`, which already
carries `interaction_focus` per record, so it is transcription rather than
invention; the source map mandates the unknown-vs-reviewed-none distinction that
no existing field can express; and it is purely additive. `SUPP_CARD_TEMPLATE.md`
§1 should be updated to include it, or the field should be renamed before any UI
reads it. **Not yet reflected in the template or in `validate-supp-standard.js`,
which does not check it.**

### 5.3 Zero maturity upgrades — criteria do not exist
`SUPP_CARD_TEMPLATE.md` §1 rule 1 lists `skeleton | core | clinical_ready` and
defines only what skeleton requires, adding that depth waits for a clinical demand
signal (簡報 §2). It states **no criteria for `core` or `clinical_ready`**. The
dispatch said to upgrade "only when the template's criteria are actually met" —
there are none to meet, so all 36 stay `skeleton`. Ruling needed before any
supp record can advance. All 36 also remain `review_status: "skeleton_unreviewed"`;
this pass is machine work and does not constitute Ting's review.

### 5.4 Ownership note
`AI_CONSTITUTION.md` §一's file-ownership table predates the supp line and does not
list `data/supplements/**`. This pass treated the dispatch as the owner grant.
The table should gain a row.

## 6. Verification

```
node scripts/build-data.js
node scripts/validate-supp-standard.js      # checked 36 supp records · categories 8 · PASS — 0 defects, 0 warning(s)
node scripts/check-validation-ratchet.js    # PASS — no regressions.
node scripts/validate-content-junk.js       # PASS — no scraped header tokens in content arrays.
node scripts/validate-relations.js          # Relation validation passed.
git diff --check                            # clean
```

Every card touched was read back in rendered form: no fake Chinese, no English
sentences inside `name_zh`, no invisible English, no repeated template sentence.
`supp.*` records carry no paired `_en`/`_zh` list fields, so the length-parity rule
has nothing to bind on here.

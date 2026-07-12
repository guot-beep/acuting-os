# Conditions Module Design (中西醫病名層)

Written: 2026-07-12 (Claude). Status: DESIGN — Ting approves scope before
any skeleton is built. This module is the hub of M2 (unified search) and
M3 (case tags → related points/formulas suggestions) in the timeline.

## Why three entities, not one

A "condition" in this system is three different things that must never be
merged into one record:

1. **WesternCondition 西醫病名** — e.g. `cond.pcos` (PCOS 多囊性卵巢症候群)
2. **TraditionalDisease 中醫病名** — e.g. `tdis.yue_jing_hou_qi` (月經後期)
3. **TcmPattern 證型** — e.g. `pattern.kidney_yang_deficiency` (腎陽虛)

One western condition maps to several traditional disease names, and each
of those presents as several patterns. The links carry the clinical logic;
flattening them destroys it. (This matches ARCHITECTURE_AUDIT's entity
model; existing files data/pathology/conditions.json + clinical_graph
files already follow this direction with 12 + 6 + 9 records.)

## Schemas

### WesternCondition
```
id: "cond.<slug>"            // stable forever
name_en, name_zh, aliases[]  // search surface
icd_hint: "E28.2"            // reference only, not billing truth
category: one of the controlled category list below
summary_zh, summary_en       // 2-3 sentence draft definition, conservative
red_flags[]                  // REFER-OUT warnings — mandatory field;
                             // e.g. sudden severe headache, GI bleed signs
western_context: ""          // typical workup/management CONTEXT (documentation
                             // language only, never treatment instruction)
related_eastern_diseases[]   // tdis ids
related_patterns[]           // pattern ids + one-line differentiation note:
                             //   [{id, note_zh}]
seed_acupoints[]             // point codes, study reference
seed_formulas[]              // formula ids, study reference
medication_links[]           // existing western medication ids
modern_use_tags[]            // controlled tag vocabulary (see Tags)
review_status, source_status, sources[], public_safe:false
```

### TraditionalDisease
```
id: "tdis.<pinyin_slug>", name_zh, name_en, pinyin
classical_source_hint        // e.g. 中醫內科學/婦科學 chapter
related_patterns[], related_western[]  // back-links
review_status, sources[]
```

### TcmPattern (expand the existing 9 → ~50)
```
id: "pattern.<slug>", name_zh, name_en
key_signs_zh[]               // 主症
tongue, pulse                // 舌脈
treatment_principle_zh/en    // 治法
typical_points[], typical_formulas[]   // study reference
review_status, sources[]
```

### Category controlled list (WesternCondition.category)
gyn_fertility · pain_msk · gi · respiratory · neuro · psych_sleep ·
derm · endo_metabolic · cardio · uro_renal · ent_eye · immune_misc

## Scope: the 150-condition shortlist (Ting approves before build)

NCCAOM-oriented + Ting's practice focus. Target counts per category:
gyn_fertility 25 (PCOS, endometriosis, IVF support contexts, menopause…),
pain_msk 30 (LBP, neck, knee OA, sciatica, headache/migraine…),
gi 15, psych_sleep 15 (insomnia, anxiety, depression-context),
respiratory 10, neuro 12 (Bell's palsy, stroke rehab, neuropathy…),
derm 8, endo_metabolic 10 (thyroid, T2DM-context…), cardio 8 (HTN-context…),
uro_renal 8, ent_eye 6, immune_misc 3. Total ≈ 150.

Pattern library expansion: ~50 standard patterns covering the NCCAOM
differential-diagnosis core (currently 9 exist).

## Safety wording rules (permanent)

- Western summaries/context are documentation language: "commonly managed
  with…", never "treat with…".
- red_flags[] is REQUIRED on every condition before it may render.
- Pattern→points/formulas links are study references; UI must label them
  「學習參考 / study reference — not treatment advice」.
- All records draft / needs_source_review until checked against 中醫內科學/
  婦科學-level sources + a western reference (e.g. clinic-standard summaries).

## Tags: the connective tissue (feeds M3 suggestions)

One controlled vocabulary file `data/tags/tag_vocabulary.json`:
`{id, label_zh, label_en, kind: condition|symptom|context}` — seeded from
the modern_use_tags already on formulas/herbs (pms, ibs, insomnia,
infertility, gerd…). Rules: tags are lowercase_snake ids; every tag used
anywhere MUST exist in the vocabulary (validate-relations extension).
Cases, conditions, formulas, herbs, and points all reference the SAME tag
ids — that identity is what makes "case tag → related everything" work.

## Suggestion flow (M3 target behavior)

Case/SOAP input: Ting picks condition id(s) + pattern id(s) (tags).
The case detail then shows a "study reference" panel:
pattern → typical_points + typical_formulas; formula → related_formulas
(comparison_group, already built); condition → red_flags + medication
context. Pure lookup over the relation files — no inference engine, no
treatment claims. This is a renderer feature once the data above exists.

## Build order (plugs into EXECUTION_PLAN Phase 3-4)

1. [TING] Approve this design + the 150-condition scope.
2. [CODEX] E1: pattern library skeleton (~50 ids, names, empty fields).
3. [CODEX] E2: condition shortlist skeleton (150 ids/names/categories/
   icd_hint only). STOP for Ting scope review.
4. [CODEX] E3+: fill batches (category by category, gyn_fertility first,
   red_flags mandatory), extending validate-relations for tag/id integrity.
5. [CODEX] E-tags: tag_vocabulary.json consolidation from existing tags.
6. [CODEX] Wire into conditionGraph section (list + search + category
   filter, like formulas/herbs). Detail pages later.
7. [CLAUDE] M3 suggestion panel in case detail (after runtime adapter).

## Done criteria for "M2 conditions complete"

150 conditions + 50 patterns rendered and searchable, every condition has
red_flags, every link passes validate-relations, unified search returns
conditions alongside points/formulas/herbs.

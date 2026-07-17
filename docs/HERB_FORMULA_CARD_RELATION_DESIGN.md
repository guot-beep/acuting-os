# Herb / Formula Card Relation Design

Written: 2026-07-17 (Codex). Status: DESIGN - captures Ting's direction before
formula/herb UI wiring and content import.

## Purpose

Formula and single-herb data should become study cards like acupoint detail
cards, not loose lists. Each card must support:

- NCCAOM/Bensky exam review.
- Chinese-depth understanding from class notes, CloudTCM, American Dragon, and
  other approved private-study sources.
- Modern application lookup.
- Bidirectional links among western conditions, traditional disease names,
  patterns, formulas, and herbs.
- Formula composition links down to single herbs.

This is for Ting's private AcuTing OS. It is not public marketing content and
not a treatment recommendation system.

## Core Rule

Every connection uses stable IDs, not prose-only tags.

Examples:

- western condition: `western_condition.pcos` or future `cond.pcos`
- traditional disease: `eastern_disease.infertility` or future `tdis.bu_yun`
- pattern: `pattern.kidney_deficiency`
- formula: `formula.xiao_yao_san`
- herb: `herb.chai_hu`

Search tags are useful, but they are not enough. Tags should supplement ID
relations, not replace them.

## Card Model

### Formula Card

Minimum fields for a useful formula card:

```json
{
  "id": "formula.xiao_yao_san",
  "name_zh": "逍遙散",
  "name_en": "Free and Easy Wanderer Powder",
  "pinyin": "Xiao Yao San",
  "category": "harmonize_liver_spleen",
  "tier": "core",
  "review_status": "draft",
  "source_status": "source_review_pending",
  "exam_core": {
    "composition": [],
    "actions_zh": [],
    "actions_en": [],
    "indications_zh": [],
    "indications_en": [],
    "tongue": "",
    "pulse": "",
    "contraindications": []
  },
  "clinical_understanding": {
    "pattern_key": "",
    "formula_meaning": "",
    "differentiation_notes": [],
    "common_modifications": []
  },
  "modern_applications": [],
  "related_conditions": [],
  "related_traditional_diseases": [],
  "related_patterns": [],
  "related_formulas": [],
  "composition_links": [],
  "private_source_notes": [],
  "sources": []
}
```

### Formula Composition Links

Formula composition should link to herb IDs wherever possible:

```json
{
  "herb_id": "herb.chai_hu",
  "name_zh": "柴胡",
  "pinyin": "Chai Hu",
  "role": "chief",
  "classical_amount_text": "一兩",
  "decoction_reference_g": 3,
  "granule_reference_g": null,
  "granule_concentration_ratio": "",
  "granule_brand": "",
  "dose_scope": "per_day / per_dose / whole_formula",
  "dose_note": "private study/source note only; never auto-convert decoction grams to granule grams",
  "source_refs": ["bensky", "cloudtcm.formula.xiao_yao_san"]
}
```

Dose display is intentionally multi-track:

- `classical_amount_text`: the source text and historical unit.
- `decoction_reference_g`: source-backed raw-herb/decoction reference grams.
- `granule_reference_g`: source-backed concentrated-granule reference grams.
- `granule_concentration_ratio` and `granule_brand`: required context because
  extraction ratios and products differ.
- `dose_scope`: distinguishes a whole formula, total daily amount, and a single
  administration.

The app must never derive `granule_reference_g` automatically from
`decoction_reference_g`. Unknown values remain null/pending until a named
manufacturer, formulary, course source, or other approved reference is recorded.

If the herb ID does not exist yet, keep the name and mark
`herb_id_review_status: "needs_matching"`. Do not invent unstable IDs.

### Single Herb Card

Minimum fields for a useful herb card:

```json
{
  "id": "herb.chai_hu",
  "name_zh": "柴胡",
  "name_en": "Bupleurum",
  "pinyin": "Chai Hu",
  "category": "release_exterior",
  "channels_entered": ["liver", "gallbladder"],
  "properties_taste_temp": "",
  "review_status": "draft",
  "source_status": "source_review_pending",
  "exam_core": {
    "functions": [],
    "indications": [],
    "contraindications": [],
    "interactions_or_cautions": []
  },
  "clinical_understanding": {
    "herb_personality": "",
    "pairing_notes": [],
    "differentiation_notes": []
  },
  "modern_applications": [],
  "related_conditions": [],
  "related_traditional_diseases": [],
  "related_patterns": [],
  "related_formulas": [],
  "included_in_formulas": [],
  "private_source_notes": [],
  "sources": []
}
```

`included_in_formulas` can be generated from formula composition links later,
so the source of truth should usually be the formula's `composition_links`.

## Modern Application Model

Modern application is a first-class field. It should not be buried in summary
text.

```json
{
  "label": "PCOS cycle irregularity context",
  "modern_tag": "pcos",
  "western_condition_ids": ["western_condition.pcos"],
  "traditional_disease_ids": ["eastern_disease.irregular_menstruation"],
  "pattern_ids": ["pattern.liver_qi_stagnation", "pattern.phlegm_damp"],
  "note_zh": "課件/來源列為相關臨床運用；需辨證，不等於自動適用。",
  "note_en": "Associated documentation context only; pattern differentiation required.",
  "source_refs": ["ting_course_notes", "cloudtcm", "american_dragon"],
  "review_status": "draft"
}
```

Wording rules:

- Use "related to", "associated documentation context", "traditional use
  context", "course-note application".
- Do not write "treats", "cures", "effective for", or automatic substitutions.
- A western condition never maps one-to-one to a formula or herb.
- A formula/herb can be related to a condition only through source notes and
  pattern differentiation.

## Bidirectional Relation Behavior

The app should let Ting navigate both directions:

- Western condition -> traditional disease names.
- Western condition -> common patterns.
- Western condition -> related formulas and herbs.
- Traditional disease -> western condition candidates.
- Pattern -> formulas, herbs, points, and comparison tables.
- Formula -> related conditions, patterns, similar formulas, and component herbs.
- Herb -> formulas containing it, related patterns, and modern application tags.

Implementation preference:

- Store stable source relations in one direction where possible.
- Generate backlinks during build or validation.
- Validate all IDs with `scripts/validate-relations.js`.
- UI can display backlinks as "Related / 相關" sections.

## Source Layers

Private-study source layers are allowed and useful.

Recommended source fields:

```json
{
  "source_id": "cloudtcm.formula.xiao_yao_san",
  "source_name": "CloudTCM",
  "url": "https://cloudtcm.com/formula/...",
  "usage": "private_study_reference",
  "content_mode": "summary_plus_excerpt",
  "review_status": "draft"
}
```

CloudTCM and American Dragon can be used for rich private study context,
including long notes or excerpts if Ting wants that locally. Keep the source
clearly marked and do not promote those fields to public-safe content.

Suggested split:

- `data/imports/` or future private sidecar: raw/private source material.
- canonical card fields: structured summaries, relationship IDs, key study
  points, and source refs.

## UI Target

Formula and herb detail pages should feel like point detail pages:

- title block with Chinese, pinyin, English, category, status pill.
- tabs/sections:
  - Exam Core
  - Clinical Understanding
  - Modern Applications
  - Related Conditions
  - Related Formulas / Formula Family
  - Composition / Herbs
  - Sources and Private Notes
- every draft card visibly says `draft - source review pending`.
- source links open externally.
- related IDs render as chips that jump to the matching card when wired.

## Build Order

1. Finish B1/B2 formula merge path so there is one rendered formula source.
2. Wire formula cards in Lookup with status pills and related-formula chips.
3. Wire herb cards in Lookup from `herb_canon_shortlist.json`.
4. Add formula `composition_links[]` using herb IDs.
5. Extend `validate-relations.js` to check formula <-> herb composition links
   and condition/traditional disease/pattern/formula/herb relation IDs.
6. Add modern application sections from Ting course notes, CloudTCM, and
   American Dragon in small batches.
7. Generate backlinks for herb `included_in_formulas` and condition related
   formulas/herbs.

## Done Criteria

- Searching a western disease such as PCOS can surface related TCM disease
  names, patterns, formulas, and herbs.
- Opening a formula shows its related conditions/patterns and component herbs.
- Opening an herb shows formulas containing it.
- Every relationship uses an ID that validates.
- Every modern application has conservative wording and source refs.
- Draft/private source content is clearly marked and never confused with
  source-checked public-safe content.

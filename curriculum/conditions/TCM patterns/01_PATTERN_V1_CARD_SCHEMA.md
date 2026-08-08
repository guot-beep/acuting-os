# 01 — TCM Pattern V1 Card Schema

## Principle

Use the existing `docs/PATTERN_CARD_TEMPLATE.md` and current JSON schema as the starting authority.

The structure below is a **semantic target**. Do not blindly create duplicate fields if the current repo already has an equivalent field.

Any schema change must be:

- additive
- backward-compatible
- validated
- source-aware
- compatible with existing UI

---

# A. Header / Identity

Required:

```yaml
id: pattern.<existing_slug>
name_zh:
name_en:
pinyin:
aliases_zh: []
aliases_en: []
```

`pinyin` or aliases may be omitted only if the current schema intentionally does not support them and adding them provides no practical value.

---

# B. Classification

Required:

```yaml
classification:
  primary_system:
  family_tags: []
  eight_principles: []
  substance_mechanism_tags: []
  pathogenic_factor_tags: []
  stage_tags: []
```

Adapt field names to existing repo vocabulary.

Classification is multi-axis. The primary system controls the main UI grouping; secondary axes improve search, differentiation, graph reasoning, and later clinical analytics.

---

# C. Etiology & Pathomechanism

Target:

```yaml
etiology_pathomechanism:
  etiology_zh:
  etiology_en:
  mechanism_zh:
  mechanism_en:
  location_tags: []
  nature_tags: []
  progression_notes_zh:
  progression_notes_en:
```

Rules:

- source-backed only
- do not generate mechanism from the Pattern name alone
- separate etiology from mechanism when source material permits
- concise synthesis is acceptable when it is directly derived from cited source material
- preserve source refs at field/block level

---

# D. Clinical Manifestations

Required:

```yaml
manifestations:
  key_signs:
    - zh:
      en:
      source_refs: []
  supporting_signs:
    - zh:
      en:
      source_refs: []
```

Rules:

- Key signs = differentiating high-yield features
- Supporting signs = common but less discriminating features
- do not dump every manifestation from every AD condition page into Key Signs
- context-only findings stay source-scoped

---

# E. Tongue

Prefer structured components:

```yaml
tongue:
  body_color: []
  shape: []
  moisture: []
  special_features: []
```

Do not force a single tongue variant when multiple legitimate context-dependent variants exist.

---

# F. Tongue Coating

Keep separate from tongue body:

```yaml
coating:
  color: []
  thickness: []
  texture: []
  moisture: []
```

This separation is important for future `sym.*` / observation mapping.

---

# G. Pulse

```yaml
pulse:
  qualities: []
  notes_zh:
  notes_en:
```

Preserve alternative pulse possibilities only when sources support them.

---

# H. Differential & Exam Pearls

High-value V1 field:

```yaml
differentiation:
  comparisons:
    - pattern_id:
      distinguishing_zh:
      distinguishing_en:
      source_refs: []
  exam_pearls:
    - zh:
      en:
      source_refs: []
```

Every comparison target must resolve to an existing canonical Pattern.

Examples of useful differentiation:

```text
Heart Qi Deficiency vs Heart Yang Deficiency
Liver Yin Deficiency vs Liver Yang Rising
Kidney Qi Deficiency vs Kidney Qi Not Firm
Spleen Qi Deficiency vs Central Qi Sinking
Heart Blood Deficiency vs Heart-Spleen Deficiency
Phlegm-Damp vs Phlegm-Heat
Wind-Cold vs Wind-Heat
```

Do not invent board pearls to make a field look full.

---

# I. Treatment Principle

Required bilingual canonical wording:

```yaml
treatment_principle:
  zh:
  en:
```

Preserve accepted existing Chinese wording.

American Dragon may corroborate, but awkward literal AD English should not replace established TCM terminology.

---

# J. Formula Connections

Use existing canonical formula IDs only.

Conceptually:

```yaml
typical_formulas:
  - formula_id:
    role: core | common | contextual
    source_refs: []
    context_note_zh:
    context_note_en:
```

If the current field is a simple list, keep the existing shape unless the source/context distinction truly requires an additive structure.

Rules:

- resolve formula aliases first
- no duplicate formula creation
- no doses here
- distinguish universal/core candidates from condition-page-specific candidates
- preserve source context

---

# K. Acupoint Connections

Use existing point IDs/codes only.

Conceptually:

```yaml
typical_points:
  - point_id:
    role: core | common | contextual
    source_refs: []
```

Rules:

- resolve aliases/codes
- do not create duplicate points
- do not import needle depth, manipulation, or moxa dosage into Pattern V1
- source-context point prescriptions should not be presented as universal prescriptions

---

# L. Related TCM Diseases / Biomedical Context

Do not introduce duplicate reverse relation fields.

Render approved relations through the existing relation registry / reverse index.

For American Dragon page context, preserve:

```yaml
source_contexts:
  - source: American Dragon
    url:
    page_label:
    scope: contextual_association
```

Never interpret page placement as equivalence.

---

# M. Board / Exam

If current schema supports it:

```yaml
board:
  scope_status:
  pearls: []
  source_refs: []
```

Use NCBAHM/current course materials.

AD disease placement is not a Board fact.

---

# N. Provenance

At minimum:

```yaml
sources:
  - source_id:
    url:
    source_type:
    accessed_or_captured_date:
```

Prefer field-level provenance:

```yaml
field_sources:
  key_signs: []
  tongue: []
  coating: []
  pulse: []
  treatment_principle: []
  formulas: []
  points: []
  etiology_pathomechanism: []
  differentiation: []
```

---

# O. Review / Completeness

Do not conflate “field has data” with “clinically reviewed”.

Conceptually:

```yaml
review:
  status:
  completeness:
    identity:
    classification:
    etiology_pathomechanism:
    manifestations:
    tongue:
    coating:
    pulse:
    differentiation:
    treatment:
    relations:
    provenance:
```

Use existing allowed enum values wherever possible.

---

# Recommended large-card rendering

```text
Header
  identity + classification badges

1. 病因與病理機轉
   Etiology & Pathomechanism

2. 系統化臨床表現
   Key Signs
   Supporting Signs
   Tongue
   Coating
   Pulse

3. 辨證要點與國考考點
   Treatment Principle
   Differential Patterns
   Exam Pearls

4. 治療連接
   Formula links
   Acupoint links

5. 關聯知識
   TCM disease links
   Biomedical context links
   Derived from relation graph

6. 資料來源
   Sources & Provenance
```

Small-card fields must remain a subset of the large-card data model.

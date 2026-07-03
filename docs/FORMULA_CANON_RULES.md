# Formula Canon Rules

Date: 2026-07-03  
Status: working rules for Ting review

## Purpose

This file defines how AcuTing OS should expand formula records after
`data/herbs/formula_canon_shortlist.json` is approved.

AcuTing OS is Ting's personal study and future private-clinic system. Formula
content can be practical and clinically useful, but source status must stay
clear and conservative.

## Two-Track Formula Content

### English Exam Track

- Use Bensky `Formulas & Strategies`, Bensky `Materia Medica`, Deadman where relevant, and NCCAOM-style terminology.
- This track is the exam-accuracy layer.
- Only this track can move toward `review_status: "source_checked"`.
- Keep citations/source notes internal and concise.

### Chinese Clinical-Understanding Track

- Use CloudTCM formula pages, Wanfang, and other Ting-approved Chinese references.
- This track is for depth, pattern nuance, and modern clinical understanding.
- Keep it `draft` until cross-checked against the English exam track or a professional source.

## Required Conservative Language

Use:

- "related to"
- "commonly discussed for"
- "traditional pattern context"
- "clinical reference context"
- "may be considered in pattern-differentiated study"

Avoid:

- "treats"
- "cures"
- "replaces"
- "indicated for all cases of"
- "safe substitute for"

`related_formulas` means comparison or study reference. It does not mean
automatic substitution.

## Core / Expanded Tier

- `tier: "core"`: current 115 formula shortlist. Ting studies these first.
- `tier: "expanded"`: later additions from broader Bensky principal formulas,
  CloudTCM, school materials, or clinic-specific needs.

Do not remove `core` formulas without Ting approval.

## Stable Formula IDs

Every formula must have:

```json
"id": "formula.<pinyin_snake>"
```

Examples:

- `formula.xiao_yao_san`
- `formula.jia_wei_xiao_yao_san`
- `formula.si_jun_zi_tang`

All `related_formulas` values must reference these stable IDs, not free text.

## Field Naming Rules

### modern_clinical_use_tags

Use English `snake_case`.

Examples:

- `pcos`
- `ibs`
- `insomnia`
- `pms`
- `gerd`
- `uri`
- `dysmenorrhea`
- `menopause`
- `fatigue`
- `bloating`
- `nausea`
- `cough`

These are search tags and clinical-context tags, not treatment claims.

### related_conditions

Use stable condition/pattern IDs when available.

Examples:

- `western_condition.pcos`
- `western_condition.ibs`
- `western_condition.insomnia`
- `pattern.liver_qi_stagnation`
- `pattern.spleen_qi_deficiency`

If a target condition ID does not exist yet, leave a draft note for future
condition graph expansion rather than inventing a final ID in content.

### related_formulas

Use formula IDs only.

Examples:

- `formula.xiao_yao_san`
- `formula.jia_wei_xiao_yao_san`
- `formula.chai_hu_shu_gan_san`

Relation means "compare with / may be considered in differential formula study",
not "substitute automatically".

Current rule for the shortlist:

- `related_formulas` are generated from shared `comparison_group`.
- A formula can list all other formulas in the same group.
- Singleton groups may have an empty list until expanded formulas are added.
- Do not add cross-group related formulas unless Ting explicitly wants a
  special comparison link.

### comparison_group

Use English `snake_case` group names based on what students need to
differentiate.

Initial recommended groups:

- `exterior_wind_cold`
- `exterior_wind_heat`
- `heat_qi_ying_blood`
- `liver_gallbladder_damp_heat`
- `shaoyang_harmonize`
- `liver_spleen`
- `qi_tonify`
- `blood_tonify`
- `qi_blood_tonify`
- `yin_tonify`
- `yang_tonify`
- `kidney_tonify`
- `calm_spirit`
- `qi_regulation`
- `blood_stasis`
- `phlegm_damp`
- `damp_water`
- `gynecology_blood`

Examples:

- `liver_spleen`: `formula.xiao_yao_san`, `formula.jia_wei_xiao_yao_san`,
  `formula.tong_xie_yao_fang`, `formula.chai_hu_shu_gan_san`
- `qi_tonify`: `formula.si_jun_zi_tang`, `formula.liu_jun_zi_tang`,
  `formula.shen_ling_bai_zhu_san`, `formula.bu_zhong_yi_qi_tang`
- `blood_stasis`: `formula.xue_fu_zhu_yu_tang`,
  `formula.tao_hong_si_wu_tang`, `formula.gui_zhi_fu_ling_wan`,
  `formula.sheng_hua_tang`
- `phlegm_damp`: `formula.er_chen_tang`, `formula.wen_dan_tang`,
  `formula.ban_xia_bai_zhu_tian_ma_tang`

## Filling Order

1. Keep the 115-formula shortlist as `core`.
2. Start content filling with the existing 23 AcuTing formulas.
3. For each formula, fill English exam track first.
4. Add Chinese clinical-understanding track as `draft`.
5. Add modern clinical tags and related formulas only after the formula's
   basic identity and category are stable.

## Safety

- Every formula remains educational until reviewed.
- Red flags, pregnancy, anticoagulants, fertility medications, psychiatric
  risk, and urgent medical symptoms must be phrased conservatively.
- Formula comparison is for learning and clinical reasoning, not self-treatment.

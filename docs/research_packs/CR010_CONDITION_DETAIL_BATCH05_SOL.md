# CR-010 Common-300 Detail Batch 05 — SOL

**Status:** RESEARCH STAGING / NOT CANONICAL / NO PHI  
**Source commit:** `d7c9901`  
**Scope:** 8 acupuncture-scope backfills (live ranks 16–23) + 15 new detail candidates (live ranks 31–45).

## Contract

- Exact IDs copied from the live queue.
- Existing canonical fields are PRESERVE_EXISTING; this package is research staging only.
- Crossrefs remain unresolved seeds and are never auto-resolved.
- `acupuncture_scope.evidence` is `unknown` where no condition-specific acupuncture guideline was verified; standard-care sources support boundaries and co-management, not acupuncture efficacy.
- No PHI.

## Scope backfill
- 16. `cond.pid_chronic` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 17. `cond.piriformis_syndrome` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 18. `cond.pmdd` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 19. `cond.postpartum_hypolactation` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 20. `cond.rotator_cuff` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 21. `cond.secondary_dysmenorrhea` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 22. `cond.vulvovaginal_candidiasis` — bilingual can_treat / precautions / co_management; evidence=unknown.
- 23. `cond.whiplash` — bilingual can_treat / precautions / co_management; evidence=unknown.

## New live order

| Rank | ID | Condition | Authority |
|---:|---|---|---|
| 31 | `cond.autism_spectrum_disorder` | 自閉症類群障礙 / Autism Spectrum Disorder | CDC |
| 32 | `cond.autoimmune_hepatitis` | 自體免疫性肝炎 / Autoimmune Hepatitis | NIDDK |
| 33 | `cond.av_block` | 房室傳導阻滯 / Atrioventricular Block | AHA |
| 34 | `cond.bacterial_vaginosis` | 細菌性陰道炎 / Bacterial Vaginosis | CDC |
| 35 | `cond.barrett_esophagus` | 巴瑞特食道 / Barrett Esophagus | NIDDK |
| 36 | `cond.behcet_disease` | 貝西氏症 / Behçet Disease | NIAMS |
| 37 | `cond.bipolar_disorder` | 雙相情緒障礙症 / Bipolar Disorder | NIMH |
| 38 | `cond.bladder_stones` | 膀胱結石 / Bladder Stones | NIDDK |
| 39 | `cond.blepharitis` | 眼瞼炎 / Blepharitis | NEI |
| 40 | `cond.body_dysmorphic_disorder` | 身體臆形症 / Body Dysmorphic Disorder | NIMH |
| 41 | `cond.borderline_personality_disorder` | 邊緣型人格障礙 / Borderline Personality Disorder | NIMH |
| 42 | `cond.cancer_related_fatigue` | 癌因性疲憊 / Cancer-Related Fatigue | NCI |
| 43 | `cond.cardiomyopathy` | 心肌病變 / Cardiomyopathy | NHLBI |
| 44 | `cond.cataract` | 白內障 / Cataract | NEI |
| 45 | `cond.cellulitis` | 蜂窩性組織炎 / Cellulitis | MedlinePlus |

## Ingestion note

The consumer must verify each proposed field against the cited page at ingestion time. Generic standard-care pages are not evidence of acupuncture efficacy. Red-flag urgency values are staging candidates and require clinical review before canonical merge.

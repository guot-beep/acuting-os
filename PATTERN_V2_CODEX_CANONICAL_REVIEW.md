# AcuTing OS Pattern V2 Canonical Review

> Review-only artifact. Date: 2026-08-08 (America/Los_Angeles)
>
> Scope: reconciliation of Pattern V2 research Batches 02–10 against the live repository.
> No Pattern ID, registry/library record, alias, relation type, production edge, schema, or migration was created or changed.

## A. Live repository baseline audit

### A1. Git state

| Check | Live result |
|---|---|
| Current branch | `codex/extra-points-2026-08-07` |
| Current HEAD (final re-audit) | `7b5feee84e32a1c70fff8078b2d27be2154a273a` |
| `c8a5ea7` ancestor of HEAD | Yes (`git merge-base --is-ancestor c8a5ea7 HEAD` returned 0) |
| Working tree | Dirty: review artifact and user-provided ZIP are untracked |
| Initial-audit modified file | `data/acupoints/extra_points.json` (committed externally while review was in progress) |
| User-provided untracked file | `curriculum/conditions/Acuting_OS_Pattern_V2_CODEX_Handoff_Batch02-10_2026-08-08.zip` |
| Pattern baseline files locally modified before review | No |

The initial audit ran at HEAD `eb435c21b0da5a2bf40ce76ffba7ecb8700ad0f5`. During the review, HEAD advanced externally to `7b5feee84e32a1c70fff8078b2d27be2154a273a`; the intervening diff touched acupoint/generated/handoff files, not Pattern registry/library/relation files. The full V1 count and reconciliation audit was rerun at the final HEAD and passed unchanged. No pull, reset, rebase, checkout, commit, or data repair was performed by this review.

### A2. Verified V1 counts

| Metric | Verification target | Live result | Gate |
|---|---:|---:|---|
| Pattern registry total | 69 | 69 | Pass |
| Registry taxonomy/category (`level:"category"`) | 10 | 10 | Pass |
| Registry clinical (`level:"pattern"`) | 59 | 59 | Pass |
| Pattern library raw | 62 | 62 | Pass |
| Active library (`review_status != "deprecated"`) | 59 | 59 | Pass |
| Deprecated library | 3 | 3 | Pass |
| Registry clinical ↔ active library | 59/59 | 59/59 | Pass |
| Duplicate registry IDs | 0 | 0 | Pass |
| Duplicate library IDs | 0 | 0 | Pass |

Deprecated records are:

- `pattern.liver_fire_flaring`
- `pattern.liver_wind_stirring`
- `pattern.insomnia_heart_kidney_disharmony`

No active registry ID is missing from the active library, and no active library ID is missing from the clinical registry. The research-pack statements that three V1 cards remain missing, or that the library is 59 raw / 56 active, are stale and must not be used as repository truth.

### A3. Audited authorities

- ID authority: `data/pathology/pattern_registry.json`
- Card authority: `data/pathology/pattern_library.json`
- Alias staging: `data/pathology/pattern_alias_map.json`
- Relation authority: `data/config/relation_registry.json`
- Governance: `docs/AI_CONSTITUTION.md`, `DECISIONS.md`, `docs/BLUEPRINT.md`
- Card contract: `docs/PATTERN_CARD_TEMPLATE.md`
- Research corpus: extracted to a temporary folder; `curriculum/**` was not modified.

Read-only audit commands/checks used:

- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git merge-base --is-ancestor c8a5ea7 HEAD`
- `git diff --quiet -- data/pathology/pattern_registry.json data/pathology/pattern_library.json data/config/relation_registry.json`
- Direct JSON parsing of registry/library IDs, `level`, and `review_status`; set comparison of clinical registry IDs against active library IDs; duplicate-ID checks.
- Direct inspection of `pattern_alias_map.json`, `relation_registry.json`, Pattern family vocabulary, `tdis_registry.json`, and channel/vessel records.

### A4. Classification method

Every normalized candidate below has exactly one primary action. Repeated formula wording and repeated appearances across batches are reconciled into one row. `NEW_CANONICAL_CANDIDATE` means “eligible for Ting review”; it does not assign an ID or authorize implementation.

Primary actions:

`KEEP_EXISTING`, `ENRICH_EXISTING`, `ADD_ALIAS`, `NEW_CANONICAL_CANDIDATE`, `SUBTYPE_REVIEW`, `BROADER_NARROWER_REVIEW`, `GRAPH_COMPOSITION`, `PROGRESSION_RELATION`, `LOCATION_MODIFIER`, `TCM_DISEASE_ONLY`, `CONTEXT_RELATION`, `CROSS_SYSTEM_OVERLAP`, `TERMINOLOGY_REVIEW`, `HOLD_INSUFFICIENT_EVIDENCE`.

## B. Batch 02–10 candidate reconciliation

### B1. Zang-Fu and combined-system candidates

| Ref | Normalized concept | Live reconciliation | Primary action | Rationale |
|---|---|---|---|---|
| B001 | 心氣虛 | `pattern.heart_qi_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern; research may enrich evidence only. |
| B002 | 心陽虛 | `pattern.heart_yang_deficiency` | `ENRICH_EXISTING` | Already active; research pack calling it new is stale. |
| B003 | 心血虛 | `pattern.heart_blood_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B004 | 心陰虛 | `pattern.heart_yin_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B005 | 心火亢盛／心火上炎 | `pattern.heart_fire` | `ENRICH_EXISTING` | Same core Pattern cluster; wording must be handled as terminology, not another ID. |
| B006 | 心腎不交 | `pattern.heart_kidney_not_communicating` | `KEEP_EXISTING` | Frozen V1 identity; do not collapse into Heart–Kidney Yin Deficiency. |
| B007 | 痰火擾心 | No exact clinical Pattern | `NEW_CANONICAL_CANDIDATE` | Stable hot-phlegm Shen disturbance cluster; distinguish from pure Heart Fire. |
| B008 | 痰迷／痰蒙／痰阻心竅 | `pattern.phlegm_misting_heart` | `ADD_ALIAS` | Exact synonym review for the existing canonical; no new Pattern. |
| B009 | 痰熱蒙閉心竅 | Closest `pattern.phlegm_misting_heart` | `SUBTYPE_REVIEW` | Heat qualifier may justify a narrower subtype; not an automatic alias. |
| B010 | 小腸實熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Coherent excess-heat organ Pattern with distinct urinary/tongue cluster. |
| B011 | 小腸虛寒 | No exact live Pattern | `HOLD_INSUFFICIENT_EVIDENCE` | Research evidence is too formula-dependent and overlaps Spleen/Kidney Yang deficiency. |
| B012 | 肺氣虛 | `pattern.lung_qi_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B013 | 肺陰虛 | `pattern.lung_yin_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B014 | 肺燥／燥傷肺 | No exact live Pattern | `BROADER_NARROWER_REVIEW` | Must separate external warm/cool dryness from internal Lung fluid/Yin injury. |
| B015 | 風寒犯肺 | `pattern.wind_cold_invading_lung` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B016 | 風熱犯肺 | `pattern.wind_heat_invading_lung` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B017 | 痰濕阻肺 | `pattern.phlegm_damp_in_lung` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B018 | 痰熱壅肺 | `pattern.phlegm_heat_in_lung` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B019 | 寒痰阻肺 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Cold-phlegm discriminators are not represented by existing Damp- or Heat-Phlegm cards. |
| B020 | 痰飲停肺／飲停於肺 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Requires Pattern-versus-`tdis.*` Tan-Yin boundary decision. |
| B021 | 大腸實熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct bowel excess-heat cluster. |
| B022 | 大腸津虧 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct constipation/dryness mechanism; not identical to generic Yin deficiency. |
| B023 | 大腸濕熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct bowel Damp-Heat cluster. |
| B024 | 大腸虛寒／腸寒 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Excess Cold, deficiency Cold, and Spleen/Kidney origin are conflated in the pack. |
| B025 | 脾氣虛 | `pattern.spleen_qi_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B026 | 脾陽虛 | `pattern.spleen_yang_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B027 | 中氣下陷／脾氣下陷 | `pattern.spleen_qi_sinking` | `ADD_ALIAS` | The two wordings denote the same V1 identity in this corpus. |
| B028 | 脾不統血／脾不攝血 | `pattern.spleen_not_governing_blood` | `ADD_ALIAS` | Exact identity; add only after source-string audit. |
| B029 | 寒濕困脾 | `pattern.cold_damp_encumbering_spleen` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B030 | 脾胃濕熱 | `pattern.damp_heat_spleen_stomach` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B031 | 胃氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Recurrent, clinically discriminable cluster not identical to Spleen Qi deficiency. |
| B032 | 胃寒 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Must split 胃實寒 from 胃虛寒 before canonicalization. |
| B033 | 胃火 | `pattern.stomach_fire` | `KEEP_EXISTING` | Frozen V1 distinction from `pattern.stomach_heat`; do not reopen. |
| B034 | 胃陰虛／胃津不足 | Closest `pattern.stomach_yin_deficiency` | `BROADER_NARROWER_REVIEW` | 胃津不足 may be earlier/narrower fluid depletion, not an automatic alias. |
| B035 | 胃氣上逆 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Directional functional Pattern; not reducible to a biomedical nausea condition. |
| B036 | 飲食積滯／食積／食滯 | `pattern.food_stagnation` | `ADD_ALIAS` | Exact identity wording variants. |
| B037 | 胃絡瘀血 | Closest `pattern.blood_stasis` | `LOCATION_MODIFIER` | Prefer Blood Stasis + stomach/络 location until the location layer is canonical. |
| B038 | 肝氣鬱結 | `pattern.liver_qi_stagnation` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B039 | 肝氣犯胃 | Closest `pattern.liver_stomach_disharmony` | `SUBTYPE_REVIEW` | Directional overacting is narrower than broad disharmony; crosswalk is not alias. |
| B040 | 肝脾不和 | `pattern.liver_spleen_disharmony` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B041 | 肝氣犯脾 | Closest `pattern.liver_spleen_disharmony` | `SUBTYPE_REVIEW` | Directional mechanism may be a narrower subtype. |
| B042 | 肝血虛 | `pattern.liver_blood_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B043 | 肝陰虛 | `pattern.liver_yin_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B044 | 肝陽上亢 | `pattern.liver_yang_rising` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B045 | 肝火上炎／肝火 | `pattern.liver_fire` | `KEEP_EXISTING` | Frozen identity; deprecated duplicate must remain retired. |
| B046 | 肝風內動／肝風 | `pattern.liver_wind` | `KEEP_EXISTING` | Frozen identity; deprecated duplicate must remain retired. |
| B047 | 肝膽濕熱 | `pattern.liver_gallbladder_damp_heat` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B048 | 膽氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Recurrent courage/startle/decision cluster; requires evidence-standard confirmation. |
| B049 | 膽腑濕熱 | Closest `pattern.liver_gallbladder_damp_heat` | `SUBTYPE_REVIEW` | Need proof that isolated Gallbladder Damp-Heat is independently discriminable. |
| B050 | 腎氣虛 | No exact clinical Pattern; category `pattern.kidney_deficiency` exists | `NEW_CANONICAL_CANDIDATE` | A clinical Qi-deficiency Pattern is not the same entity as the broad taxonomy category. |
| B051 | 腎氣不固 | `pattern.kidney_qi_not_firm` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B052 | 腎陽虛 | `pattern.kidney_yang_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B053 | 腎陰虛 | `pattern.kidney_yin_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B054 | 腎陰虛火旺 | Closest Kidney Yin Deficiency + Fire | `SUBTYPE_REVIEW` | A hot subtype must not be silently folded into generic Kidney Yin Deficiency. |
| B055 | 腎精不足 | `pattern.kidney_essence_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B056 | 腎不納氣 | `pattern.kidney_not_grasping_qi` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B057 | 腎陽虛水泛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Classic Yang-deficiency water-flooding cluster; not the same as Kidney Yang Deficiency alone. |
| B058 | 膀胱濕熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Do not equate with Heat Lin; Pattern and TCM disease subtype are different entities. |
| B059 | 膀胱虛寒 | No exact live Pattern | `SUBTYPE_REVIEW` | Must distinguish local Bladder deficiency-Cold from Kidney Qi/Yang deficiency. |
| B060 | 熱入心包 | No exact live Pattern | `CROSS_SYSTEM_OVERLAP` | Likely crosswalks to Four-Level Ying-stage Pericardium involvement; not an alias. |
| B061 | 肺脾氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable combined-system deficiency with respiratory + transformation discriminators. |
| B062 | 心肺氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable combined-system deficiency cluster. |
| B063 | 肺腎氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable combined-system deficiency; distinguish from Kidney failing to grasp Qi. |
| B064 | 心脾兩虛／心脾氣血兩虛 | `pattern.heart_spleen_deficiency` | `BROADER_NARROWER_REVIEW` | Existing card is broader; decide whether explicit Qi-Blood deficiency is subtype or content detail. |
| B065 | 心肝血虛 | Existing Heart Blood + Liver Blood deficiency | `GRAPH_COMPOSITION` | Two existing endpoints; composition is preferable to a flat duplicate. |
| B066 | 心膽氣虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable deficiency/fear/startle cluster. |
| B067 | 肝腎陰虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable combined-system Yin deficiency. |
| B068 | 肝腎陰虛、肝陽上亢 | Existing components | `GRAPH_COMPOSITION` | Express combined Pattern relation, not another identity. |
| B069 | 肝腎陰虛、相火／虛火上炎 | Existing components plus unresolved Fire subtype | `GRAPH_COMPOSITION` | Formula syndrome wording does not create a canonical Pattern. |
| B070 | 脾腎陽虛 | `pattern.spleen_kidney_yang_deficiency` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B071 | 脾腎陽虛、水濕內停 | Existing Yang deficiency + unresolved water state | `GRAPH_COMPOSITION` | Mechanism/result composition, not another flat ID. |
| B072 | 腎水上泛犯肺 | No exact live location/organ endpoint contract | `LOCATION_MODIFIER` | Preserve the invasion mechanism in staging until organ/location endpoints exist. |
| B073 | 心陽虛、水氣凌心 | Heart Yang Deficiency + water state | `GRAPH_COMPOSITION` | Formula-level syndrome wording; composed mechanism. |
| B074 | 肝火犯肺 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Directional cross-organ excess Pattern with distinct cough/hemoptysis cluster. |
| B075 | 心腎陰虛 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct combined Yin deficiency; must remain separate from Heart–Kidney not communicating. |

### B2. Mechanism, pathogen, Bi, Lin, and gynecology candidates

| Ref | Normalized concept | Live reconciliation | Primary action | Rationale |
|---|---|---|---|---|
| B076 | 氣虛血瘀／氣虛血瘀阻絡 | Existing Qi deficiency + Blood Stasis components | `GRAPH_COMPOSITION` | Add channel/location only when endpoint layer is canonical. |
| B077 | 氣滯痰阻／氣鬱痰結 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Recurrent dual mechanism with stable chest/throat/mass presentations. |
| B078 | 肝鬱痰氣交阻 | Existing Liver Qi Stagnation + Phlegm | `GRAPH_COMPOSITION` | Formula wording is a composition, not identity proof. |
| B079 | 風痰 | No exact live Pattern | `BROADER_NARROWER_REVIEW` | Umbrella may split into channel, head-face, and stroke/tremor contexts. |
| B080 | 濕痰／痰濕 | `pattern.phlegm_damp` | `ADD_ALIAS` | Wording-order variants of the same identity. |
| B081 | 燥痰 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Need adequate discriminators from Lung Dryness and Phlegm-Heat. |
| B082 | 脾虛生痰濕 | Existing Spleen Qi Deficiency and Phlegm-Damp | `PROGRESSION_RELATION` | Etiologic development relation, not another Pattern. |
| B083 | 食積生痰 | Existing Food Stagnation and Phlegm category | `PROGRESSION_RELATION` | Mechanism relation; no new identity. |
| B084 | 血虛夾瘀 | Existing Blood Deficiency + Blood Stasis | `GRAPH_COMPOSITION` | Mixed mechanism composition. |
| B085 | 血虛寒凝 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Clinically discriminable deficiency-cold-blood cluster; requires Ting granularity decision. |
| B086 | 熱與瘀血相結 | Existing Heat + Blood Stasis | `GRAPH_COMPOSITION` | Mechanism composition. |
| B087 | 血熱妄行／迫血妄行 | `pattern.blood_heat` plus bleeding manifestation | `PROGRESSION_RELATION` | Bleeding is a consequence/manifestation, not a second Pattern identity. |
| B088 | 陰虛火旺 | Existing Yin Deficiency category + Fire category | `BROADER_NARROWER_REVIEW` | Decide generic canonical Pattern versus organ-specific hot subtypes. |
| B089 | 真寒假熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable Eight-Principle complex Pattern if evidence criteria are met. |
| B090 | 寒熱錯雜 | No exact live Pattern | `BROADER_NARROWER_REVIEW` | Umbrella is too broad without subtype rules. |
| B091 | 水飲內停／水濕泛濫 | No generic water-state Pattern | `BROADER_NARROWER_REVIEW` | Must separate Water Retention, Water Flooding, edema context, and Tan-Yin disease. |
| B092 | 下焦水濕停滯 | No canonical lower-Jiao endpoint | `LOCATION_MODIFIER` | Mechanism plus unresolved location. |
| B093 | 風水相搏 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Pattern-vs-edema disease context and external-Wind subtype need review. |
| B094 | 痰飲（generic） | No exact live Pattern; TCM disease boundary implicated | `TERMINOLOGY_REVIEW` | Do not create a Pattern until `tdis.*` versus mechanism usage is separated. |
| B095 | 津傷／津液虧損 | No exact live Pattern | `TERMINOLOGY_REVIEW` | Acute fluid injury, chronic fluid deficiency, and Yin deficiency are not interchangeable. |
| B096 | 津液停滯 | No stable canonical term in live data | `HOLD_INSUFFICIENT_EVIDENCE` | Corpus lacks consistent discriminators and naming. |
| B097 | 肺熱傷津 | Heat mechanism + Lung fluid injury | `PROGRESSION_RELATION` | Causal/damage relation, not a separate identity. |
| B098 | 胃火灼傷胃陰 | `pattern.stomach_fire` → `pattern.stomach_yin_deficiency` | `PROGRESSION_RELATION` | Both endpoints exist; relation semantics are not registered. |
| B099 | 外風 | `pattern.wind_external` category | `ENRICH_EXISTING` | Taxonomy concept only; not a clinical Pattern card. |
| B100 | 風寒 | `pattern.wind_cold` | `KEEP_EXISTING` | Exact live clinical Pattern. |
| B101 | 風熱 | `pattern.wind_heat` | `KEEP_EXISTING` | Exact live clinical Pattern. |
| B102 | 風寒束表、氣機不暢 | Existing Wind-Cold + Qi stagnation concept | `GRAPH_COMPOSITION` | Formula syndrome wording; do not mint a Pattern. |
| B103 | 表寒裡熱 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable mixed exterior/interior diagnostic configuration. |
| B104 | 風寒鬱閉化熱 | Existing Wind-Cold and Heat category | `PROGRESSION_RELATION` | Transformation relation; relation type absent. |
| B105 | 溫燥傷肺 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct warm-dryness external Pattern. |
| B106 | 涼燥犯肺 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct cool-dryness external Pattern. |
| B107 | 風熱化燥／風熱夾燥 | No stable single identity | `TERMINOLOGY_REVIEW` | Transformation and co-occurrence wordings must be separated. |
| B108 | 暑濕 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable seasonal pathogen combination. |
| B109 | 濕熱初起／初犯 | No canonical temporal/stage endpoint | `SUBTYPE_REVIEW` | Early-stage qualifier should not automatically become a flat Pattern. |
| B110 | 下焦濕熱 | `pattern.damp_heat_lower_burner` | `ENRICH_EXISTING` | Exact live clinical Pattern; also San-Jiao crosswalk in G. |
| B111 | 風寒濕痹 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Distinct cold-dominant Bi mechanism; not identical to Wind-Damp Bi. |
| B112 | 風濕痹阻 | `pattern.wind_damp_bi` | `ENRICH_EXISTING` | Exact live clinical Pattern. |
| B113 | 風濕熱痹 | Closest `pattern.heat_bi` | `SUBTYPE_REVIEW` | Decide whether Heat Bi is the canonical umbrella or this is a narrower subtype. |
| B114 | 痹久化熱 | Existing Bi + Heat | `PROGRESSION_RELATION` | Development relation. |
| B115 | 痰瘀痹阻 | Existing Phlegm + Blood Stasis | `GRAPH_COMPOSITION` | Chronic Bi mechanism composition. |
| B116 | 氣滯血瘀痹阻 | Existing Qi Stagnation/Blood Stasis + Bi context | `GRAPH_COMPOSITION` | Composition plus disease context. |
| B117 | 肝腎虧虛型痹證 | Deficiency Pattern + `tdis.bi_zheng` | `TCM_DISEASE_ONLY` | Disease subtype/context; not a new Pattern identity. |
| B118 | 氣血兩虛型痹證 | `pattern.qi_blood_deficiency` + `tdis.bi_zheng` | `TCM_DISEASE_ONLY` | Disease-context combination. |
| B119 | 熱淋、石淋、氣淋、血淋、膏淋、勞淋 | Six frozen V1 Lin subtype Patterns | `KEEP_EXISTING` | All six exist; `tdis.lin_zheng` remains a distinct disease entity. |
| B120 | 衝任不調 | `pattern.chong_ren_disharmony` | `ENRICH_EXISTING` | Existing broad clinical Pattern. |
| B121 | 衝任不足／衝任虛損 | Closest `pattern.chong_ren_disharmony` | `BROADER_NARROWER_REVIEW` | Deficiency is not automatically identical to disharmony. |
| B122 | 衝任虛寒、氣血不足 | Multiple deficiency/cold components | `GRAPH_COMPOSITION` | Formula wording; preserve composition. |
| B123 | 衝任虛寒、瘀血阻滯 | Deficiency-cold + Blood Stasis | `GRAPH_COMPOSITION` | Formula wording; preserve composition. |
| B124 | 脾虛、衝任不固 | Spleen Qi Deficiency + Chong-Ren state | `GRAPH_COMPOSITION` | Mechanism/context combination. |
| B125 | 衝任血熱 | Existing Blood Heat + Chong-Ren location | `SUBTYPE_REVIEW` | Needs stable Chong-Ren location semantics. |
| B126 | 肝火損傷衝任 | `pattern.liver_fire` + Chong-Ren location | `PROGRESSION_RELATION` | Damage relation, not a new Pattern. |
| B127 | 胞宮虛寒 | No exact live Pattern | `NEW_CANONICAL_CANDIDATE` | Stable gynecologic Pattern if uterus location is accepted as part of identity. |
| B128 | 寒凝胞宮 | Cold mechanism + uterus location | `GRAPH_COMPOSITION` | Prefer composition pending uterus-location ontology. |
| B129 | 胞宮瘀血／瘀阻胞宮 | `pattern.blood_stasis` + uterus location | `LOCATION_MODIFIER` | Location-specific expression; no location endpoint exists. |
| B130 | 氣滯血瘀（婦科／產後） | Existing `pattern.qi_stagnation_blood_stasis` + context | `CONTEXT_RELATION` | Context does not determine Pattern identity. |
| B131 | 脾陽不攝血、血熱迫血、血虛經少 | Existing mechanism Patterns + menstrual context | `CONTEXT_RELATION` | Preserve symptom/disease context separately. |
| B132 | 產後血虛、產後血瘀、產後寒凝 | Existing Pattern mechanisms + postpartum context | `CONTEXT_RELATION` | Postpartum status is context, not a new Pattern identity. |
| B133 | 腎虛胎元不固、脾腎不足胎動不安、衝任不固 | Deficiency/Chong-Ren mechanisms + pregnancy context | `CONTEXT_RELATION` | Threatened-miscarriage context endpoint is missing; edges remain staging-only. |

## C. Proposed new canonical Patterns

The following are the review’s recommended `NEW_CANONICAL_CANDIDATE` concepts. No slug or ID is assigned in this review:

- Zang-Fu/combined: 痰火擾心、小腸實熱、寒痰阻肺、大腸實熱、大腸津虧、大腸濕熱、胃氣虛、胃氣上逆、膽氣虛、腎氣虛、腎陽虛水泛、膀胱濕熱、肺脾氣虛、心肺氣虛、肺腎氣虛、心膽氣虛、肝腎陰虛、肝火犯肺、心腎陰虛。
- Mechanism/pathogen: 氣滯痰阻、血虛寒凝、真寒假熱、表寒裡熱、溫燥傷肺、涼燥犯肺、暑濕、風寒濕痹、胞宮虛寒。
- Classical systems and channel/vessel candidates are listed individually in G and H.

Admission requirements for any future canonical Pattern remain: stable Chinese/English/Pinyin terminology, discriminating signs, tongue/pulse, at least one named source, family assignment, collision check, and Ting approval of granularity. Formula syndrome wording alone is insufficient.

## D. Alias review

Only exact-identity aliases are proposed; none were written:

| Proposed alias string | Existing canonical | Decision |
|---|---|---|
| 痰蒙心竅、痰阻心竅 | `pattern.phlegm_misting_heart` | Alias candidate after exact source-string verification. |
| 脾氣下陷 | `pattern.spleen_qi_sinking` | Alias candidate for canonical 中氣下陷. |
| 脾不攝血 | `pattern.spleen_not_governing_blood` | Alias candidate for 脾不統血. |
| 食積、食滯 | `pattern.food_stagnation` | Alias candidate for 飲食積滯. |
| 濕痰 | `pattern.phlegm_damp` | Word-order alias candidate for 痰濕. |

Rejected as aliases in this review:

- `肝氣犯胃` ≠ `肝胃不和`: narrower directional mechanism versus broader disharmony.
- `胃津不足` ≠ automatically `胃陰虛`: fluid depletion may be earlier/narrower.
- `衝任不足` ≠ `衝任不調`: deficiency versus general disharmony.
- `痰熱蒙閉心竅` ≠ automatically `痰迷心竅`: heat qualifier may change subtype identity.
- Cross-system overlap, formula syndrome wording, `tdis.*`, and biomedical condition labels are never aliases for `pattern.*` by default.

## E. Subtype and broader/narrower review

Priority hierarchy decisions requiring Ting:

1. Lung Dryness: umbrella 肺燥 versus separate external 溫燥傷肺／涼燥犯肺 and internal fluid injury.
2. Stomach fluids: `pattern.stomach_yin_deficiency` versus 胃津不足.
3. Directional disharmony: 肝氣犯胃 under/alongside `pattern.liver_stomach_disharmony`; 肝氣犯脾 under/alongside `pattern.liver_spleen_disharmony`.
4. Hot Phlegm-Shen disorders: 痰火擾心, 痰熱蒙閉心竅, and `pattern.phlegm_misting_heart`.
5. Kidney Yin deficiency with Fire: subtype versus composed Yin Deficiency + Fire.
6. Wind-Phlegm: umbrella versus channel/head-face/stroke-specific forms.
7. Yin Deficiency Fire: generic canonical Pattern versus organ-specific subtypes only.
8. Water disorders: 水飲內停, 水濕泛濫, Tan-Yin disease, and organ-specific water-flooding Patterns.
9. Bi: `pattern.heat_bi` versus 風濕熱痹; Wind-Cold-Damp Bi versus existing Wind-Damp Bi.
10. Chong-Ren: existing `pattern.chong_ren_disharmony` versus deficiency, deficiency-Cold, Blood-Heat, and pregnancy-specific states.

No hierarchy edge can be produced now because the relation registry has no subtype/broader-narrower relation.

## F. Graph-composition-only decisions

The following should be expressed as compositions or mechanisms, not new flat Pattern identities:

- 心肝血虛 = Heart Blood Deficiency + Liver Blood Deficiency.
- 肝腎陰虛兼肝陽上亢／虛火 = combined Pattern states.
- 脾腎陽虛兼水濕內停、心陽虛水氣凌心 = deficiency plus water mechanism.
- 氣虛血瘀、血虛夾瘀、熱瘀互結 = mechanism combinations.
- 肝鬱痰氣交阻、風痰阻絡、痰瘀痹阻 = Pattern/mechanism plus location/context.
- 肺熱傷津、胃火灼傷胃陰、脾虛生痰、食積生痰 = progression/damage, not new identity.
- Formula-specific multi-clause syndrome wording remains explanatory staging text until each component and relation is canonical.

These decisions do not authorize edges: several endpoint classes and relation semantics are absent.

## G. Six-Channel, Four-Level, San-Jiao, and Eight-Principle decisions

Live family vocabulary uses `liu_jing`, not the research-pack label `six_channels`. The live repository has family codes for `liu_jing`, `wei_qi_ying_xue`, and `san_jiao`, but no individual stage-layer endpoint IDs.

### G1. Mandatory classical-system candidates

| Ref | Candidate | System-level decision | Primary action | Reconciliation |
|---|---|---|---|---|
| G001 | 太陽中風 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Tai-Yang exterior deficiency presentation. |
| G002 | 太陽傷寒 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Tai-Yang exterior excess presentation. |
| G003 | 陽明經證 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct channel-pattern Four-Greats cluster. |
| G004 | 陽明腑證 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct bowel excess/constipation cluster. |
| G005 | 少陽證 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct half-exterior/half-interior cluster. |
| G006 | 太陰虛寒 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Classical identity; crosswalks to Spleen Yang deficiency but is not its alias. |
| G007 | 少陰寒化 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Classical cold-transformation identity. |
| G008 | 少陰熱化 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Classical heat-transformation identity. |
| G009 | 厥陰寒熱錯雜 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Classical mixed hot/cold identity. |
| G010 | 衛分風熱 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Four-Level entry Pattern; overlaps Wind-Heat but is not an alias. |
| G011 | 氣分熱盛 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Qi-level Heat cluster. |
| G012 | 營分熱盛／熱入營分 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Ying-level Heat cluster. |
| G013 | 血分熱盛／熱入血分 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Xue-level Heat cluster. |
| G014 | 氣分濕熱 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Stage-specific Damp-Heat; not generic Damp-Heat alias. |
| G015 | 濕熱瀰漫三焦／三焦濕熱 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Whole-San-Jiao Damp-Heat umbrella with distinct distribution. |
| G016 | 中焦濕熱 | `CROSSWALK_ONLY` | `CROSS_SYSTEM_OVERLAP` | Crosswalk candidate to `pattern.damp_heat_spleen_stomach`; no alias. |
| G017 | 下焦濕熱 | `CROSSWALK_ONLY` | `ENRICH_EXISTING` | Exact live `pattern.damp_heat_lower_burner`; add San-Jiao family/crosswalk evidence later. |

### G2. Additional stage, subtype, and location candidates

| Ref | Candidate | Primary action | Decision |
|---|---|---|---|
| G018 | 太陽腑證／太陽蓄水 | `TERMINOLOGY_REVIEW` | Need canonical naming and proof that 蓄水 is a Pattern rather than formula syndrome wording. |
| G019 | 太陽蓄血 | `CROSS_SYSTEM_OVERLAP` | Cross-system expression of Blood Stasis in a classical location; no alias. |
| G020 | 太陽少陽合病／併病 | `GRAPH_COMPOSITION` | Multi-stage composition. |
| G021 | 少陽陽明合病 | `GRAPH_COMPOSITION` | Multi-stage composition. |
| G022 | 厥陰寒證 | `HOLD_INSUFFICIENT_EVIDENCE` | Corpus lacks stable differentiators independent of mixed Jue-Yin Pattern. |
| G023 | 厥陰熱證 | `HOLD_INSUFFICIENT_EVIDENCE` | Same issue; do not split prematurely. |
| G024 | 衛分濕熱 | `SUBTYPE_REVIEW` | Potential Four-Level Damp-Heat subtype. |
| G025 | 氣分肺熱 | `CROSS_SYSTEM_OVERLAP` | Stage-specific view of Lung Heat; no exact live Lung Heat Pattern. |
| G026 | 氣分胃熱 | `CROSS_SYSTEM_OVERLAP` | Crosswalk to `pattern.stomach_heat`, not alias. |
| G027 | 氣分腸熱 | `CROSS_SYSTEM_OVERLAP` | Crosswalk to proposed Large-Intestine Heat cluster. |
| G028 | 氣分膽熱／少陽膽熱 | `HOLD_INSUFFICIENT_EVIDENCE` | Pack conflates Four-Level and Six-Channel framing. |
| G029 | 營分心包熱 | `SUBTYPE_REVIEW` | Narrower Pericardium-involvement form of Ying-level Heat. |
| G030 | 血分熱迫血妄行 | `PROGRESSION_RELATION` | Xue-level Heat → bleeding manifestation. |
| G031 | 血分熱與瘀結 | `GRAPH_COMPOSITION` | Xue-level Heat + Blood Stasis. |
| G032 | 血分熱動風 | `PROGRESSION_RELATION` | Xue-level Heat → internal Wind manifestation. |
| G033 | 上焦熱證／上焦濕熱 | `LOCATION_MODIFIER` | Heat/Damp-Heat plus unresolved upper-Jiao location. |
| G034 | 上焦寒濕 | `HOLD_INSUFFICIENT_EVIDENCE` | Insufficient stable corpus support. |
| G035 | 中焦痰熱 | `LOCATION_MODIFIER` | Phlegm-Heat plus middle-Jiao location. |
| G036 | 中焦濕滯 | `LOCATION_MODIFIER` | Dampness endpoint is absent; keep staging-only. |
| G037 | 中焦陽虛 | `BROADER_NARROWER_REVIEW` | Cross-system overlap with Spleen/Stomach Yang deficiency. |
| G038 | 中焦瘀血 | `LOCATION_MODIFIER` | Blood Stasis plus middle-Jiao location. |
| G039 | 下焦瘀血 | `LOCATION_MODIFIER` | Blood Stasis plus lower-Jiao location. |
| G040 | 下焦虛寒 | `BROADER_NARROWER_REVIEW` | Cross-system overlap with Kidney/Spleen-Kidney Yang deficiency. |
| G041 | 表裡俱熱 | `GRAPH_COMPOSITION` | Exterior Heat + Interior Heat; no new identity without stable discriminators. |
| G042 | 真熱假寒 | `HOLD_INSUFFICIENT_EVIDENCE` | Corpus support is less stable than 真寒假熱. |
| G043 | 虛實夾雜 | `GRAPH_COMPOSITION` | Diagnostic configuration, not a single canonical Pattern. |

### G3. Required cross-system non-aliases

- `太陰虛寒` overlaps `pattern.spleen_yang_deficiency`, but classical stage identity differs.
- `少陰寒化` overlaps Kidney/Heart Yang-deficiency clusters, but is not their alias.
- `少陰熱化` overlaps Kidney Yin deficiency/Fire and Heart–Kidney patterns, but is not their alias.
- `衛分風熱` overlaps `pattern.wind_heat`, but Four-Level stage framing is distinct.
- `氣分胃熱` overlaps `pattern.stomach_heat`; this is a crosswalk.
- `中焦濕熱` overlaps `pattern.damp_heat_spleen_stomach`; this is a crosswalk.
- `下焦濕熱` has an exact existing Pattern identity and may receive a San-Jiao crosswalk, not a duplicate.

## H. Extraordinary-vessel and channel decisions

The channel file contains 20 records keyed by `code`, not canonical graph `id`: 12 primary channels (`LU`, `LI`, `ST`, `SP`, `HT`, `SI`, `BL`, `KI`, `PC`, `TE`, `GB`, `LR`) and 8 extraordinary vessels (`Du`, `Ren`, `Chong`, `Dai`, `Yangqiao`, `Yinqiao`, `Yangwei`, `Yinwei`). `relation_registry.json` does not authorize any of those codes as Pattern-edge targets.

| Ref | Candidate | Mandatory decision | Primary action | Reconciliation |
|---|---|---|---|---|
| H001 | 帶脈失約／帶脈失調 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Stable Dai-Mai constraint/leukorrhea/waist-girdling cluster. |
| H002 | 陰蹻脈失衡 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Stable sleep/medial-leg/eye-opening cluster, pending source-standard confirmation. |
| H003 | 陽蹻脈失衡 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Stable wakefulness/lateral-leg/eye cluster. |
| H004 | 陽維脈失和 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Potential extraordinary-vessel disharmony with exterior/lateral linkage. |
| H005 | 衝氣上逆 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Distinct Chong-Mai counterflow cluster; not an alias of Stomach Qi Rebellion. |
| H006 | 經脈氣血痹阻 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | General channel-obstruction Pattern candidate; must not duplicate Bi disease. |
| H007 | 痰阻經絡 | `GRAPH_COMPOSITION_ONLY` | `GRAPH_COMPOSITION` | `pattern.phlegm` + channel obstruction; channel endpoint contract missing. |
| H008 | 瘀血阻絡／瘀阻經絡 | `GRAPH_COMPOSITION_ONLY` | `GRAPH_COMPOSITION` | `pattern.blood_stasis` + channel obstruction; no new flat ID. |
| H009 | 經筋拘急／經筋拘攣 | `NEW_CANONICAL` | `NEW_CANONICAL_CANDIDATE` | Stable sinew-channel contraction state if supported beyond symptom labels. |
| H010 | 衝任不足 | `SUBTYPE` | `BROADER_NARROWER_REVIEW` | Reviewed against existing `pattern.chong_ren_disharmony`; no duplicate row is added to projection. |
| H011 | 任脈虛損 | `HOLD` | `HOLD_INSUFFICIENT_EVIDENCE` | Too broad and insufficiently separated from Chong-Ren/Kidney deficiency. |
| H012 | 督脈痹阻／督脈不通 | `HOLD` | `TERMINOLOGY_REVIEW` | Could be channel state, Bi context, or symptom description. |
| H013 | 陰維脈失和 | `HOLD` | `HOLD_INSUFFICIENT_EVIDENCE` | Corpus lacks stable, non-generic discriminators. |
| H014 | 寒凝經脈 | `SUBTYPE` | `SUBTYPE_REVIEW` | Potential cold subtype of channel obstruction. |
| H015 | 風痰阻絡 | `GRAPH_COMPOSITION_ONLY` | `GRAPH_COMPOSITION` | Wind-Phlegm plus channel obstruction. |
| H016 | 經筋弛緩／不利 | `HOLD` | `HOLD_INSUFFICIENT_EVIDENCE` | Risks collapsing symptoms/Wei disease into a Pattern. |
| H017 | 經脈熱盛 | `HOLD` | `HOLD_INSUFFICIENT_EVIDENCE` | Insufficient canonical terminology and discriminators. |
| H018 | 任脈絡／督脈絡實證、虛證 | `LOCATION_MODIFIER` | `CONTEXT_RELATION` | Structured vessel/luo state, not Pattern identity. |
| H019 | 十二正經虛實／氣血盛衰 | `LOCATION_MODIFIER` | `CONTEXT_RELATION` | Channel-state metadata pending canonical channel endpoints. |
| H020 | 是動病／所生病 | `LOCATION_MODIFIER` | `CONTEXT_RELATION` | Classical channel symptom taxonomy, not Pattern identity. |
| H021 | 皮部／絡脈／經別病候 | `LOCATION_MODIFIER` | `CONTEXT_RELATION` | Structured channel-layer context. |
| H022 | 奇經八脈交會穴／八脈交會配對 | `LOCATION_MODIFIER` | `CONTEXT_RELATION` | Point/vessel treatment relation, not Pattern identity. |

H010 is a cross-reference to B121 and is excluded from projected new-count arithmetic to prevent double-counting. All channel/vessel graph relations are `STAGING_ONLY` until canonical endpoint IDs and relation contracts exist.

## I. TCM disease and clinical-context-only decisions

| Ref | Research wording | Canonical context reconciliation | Primary action | Decision |
|---|---|---|---|---|
| I001 | 痹證／Bi syndrome | `tdis.bi_zheng` | `TCM_DISEASE_ONLY` | Research endpoint `tdis.bi_syndrome` is invalid. |
| I002 | 痿證／Wei syndrome | `tdis.wei_zheng` | `TCM_DISEASE_ONLY` | Research endpoint `tdis.wei_syndrome` is invalid. |
| I003 | 淋證／Lin syndrome | `tdis.lin_zheng` | `TCM_DISEASE_ONLY` | Disease entity remains distinct from six V1 Pattern subtype cards. |
| I004 | 不寐／insomnia | `tdis.bu_mei` | `TCM_DISEASE_ONLY` | Research `tdis.insomnia` is invalid; deprecated insomnia Pattern stays retired. |
| I005 | 崩漏／月經過多等出血 context | `tdis.beng_lou`, `tdis.yue_jing_guo_duo` | `TCM_DISEASE_ONLY` | Clinical context does not define Pattern identity. |
| I006 | 帶下病 | `tdis.dai_xia_bing` | `TCM_DISEASE_ONLY` | May contextualize Dai-Mai/Dampness Patterns. |
| I007 | 不孕／不育 | `tdis.bu_yun`, `tdis.bu_yu` | `TCM_DISEASE_ONLY` | Sex-specific disease endpoints exist; do not merge. |
| I008 | 水腫 | `tdis.shui_zhong` | `TCM_DISEASE_ONLY` | Disease context is not a generic Water Pattern. |
| I009 | 胎動不安／先兆流產 context | No exact live `tdis.*` endpoint | `CONTEXT_RELATION` | `cond.recurrent_pregnancy_loss` exists but is biomedical condition context only. |
| I010 | 產後惡露不盡 context | No exact live `tdis.*` endpoint | `CONTEXT_RELATION` | Keep staging text; do not invent endpoint. |
| I011 | 月經先期、後期、過多、過少、閉經、痛經 | Matching live `tdis.*` records | `TCM_DISEASE_ONLY` | Link Patterns to the appropriate disease context later. |
| I012 | 麻木 | `tdis.ma_mu` | `TCM_DISEASE_ONLY` | Symptom/disease context; not proof of channel Pattern identity. |
| I013 | 中風、顫證、面癱 | `tdis.zhong_feng`, `tdis.chan_zheng`, `tdis.mian_tan` | `TCM_DISEASE_ONLY` | Context for Wind-Phlegm/channel Patterns. |
| I014 | Biomedical infertility, COPD, hypertension, etc. | `cond.*` only when a live condition exists | `CONTEXT_RELATION` | Biomedical diagnosis cannot determine TCM Pattern identity. |
| I015 | Formula indication/syndrome strings | Formula context only | `HOLD_INSUFFICIENT_EVIDENCE` | Must be normalized to Pattern evidence; never promoted verbatim. |

## J. Cross-system mappings

Cross-system overlap is modeled as a non-identity crosswalk. None is an alias:

| Source concept | Target live/candidate concept | Mapping judgment |
|---|---|---|
| 太陰虛寒 | `pattern.spleen_yang_deficiency` | Strong clinical overlap; different classical-system identity. |
| 少陰寒化 | Kidney/Heart Yang-deficiency cluster | Partial overlap; no single equivalent endpoint. |
| 少陰熱化 | Kidney Yin deficiency/Fire and Heart–Kidney cluster | Partial overlap; no single equivalent endpoint. |
| 衛分風熱 | `pattern.wind_heat` | Strong overlap; stage framing differs. |
| 氣分胃熱 | `pattern.stomach_heat` | Strong crosswalk; not alias. |
| 氣分腸熱 | proposed 大腸實熱 | Strong crosswalk if candidate is approved. |
| 中焦濕熱 | `pattern.damp_heat_spleen_stomach` | Strong crosswalk; system framing differs. |
| 下焦濕熱 | `pattern.damp_heat_lower_burner` | Same clinical identity already live; add only system evidence/crosswalk. |
| 熱入心包／營分心包熱 | proposed 營分熱盛 subtype | Narrower overlap; subtype decision required. |
| 肝氣犯胃 | `pattern.liver_stomach_disharmony` | Directional subtype, not alias. |
| 風濕熱痹 | `pattern.heat_bi` | Possible subtype/equivalence; terminology decision required. |
| 經脈氣血痹阻 | `tdis.bi_zheng` | Pattern-versus-disease relation, never identity. |
| 衝氣上逆 | 胃氣上逆 | Shared counterflow mechanism but different vessel/organ location. |
| 帶脈失約 | `tdis.dai_xia_bing` and gynecologic contexts | Pattern-to-disease context, not identity. |

## K. Graph-edge and endpoint audit

### K1. Current relation registry

The live relation registry contains 14 relation contracts only:

`edge.condition_patterns`, `edge.condition_tcm_diseases`, `edge.condition_formulas`, `edge.condition_acupoint_protocols`, `edge.condition_medications`, `edge.pattern_formulas`, `edge.pattern_points`, `edge.pattern_differentials`, `edge.comparison_members`, `edge.clinical_case_links`, `edge.condition_symptoms`, `edge.pattern_symptoms`, `edge.tdis_symptoms`, `edge.symptom_pattern_inference`.

No registered relation supports Pattern hierarchy, Pattern progression/transformation, cause/damage, organ invasion/effect, stage membership, cross-system crosswalk, Pattern-to-TCM-disease context, Pattern-to-channel, or Pattern-to-extraordinary-vessel edges.

`members`, `member_of`, `develops_into`, and `relation_note_zh` occur as ad hoc Pattern fields, but they are not registered relation contracts and therefore are not production graph vocabulary under D13.

### K2. Endpoint resolution

| Endpoint class | Live status | Review consequence |
|---|---|---|
| Phlegm | Resolved taxonomy `pattern.phlegm` | May be referenced as taxonomy, but no channel-obstruction relation exists. |
| Heat | Resolved taxonomy `pattern.heat` | Generic category, not a substitute for a clinical target. |
| Fire | Resolved taxonomy `pattern.fire` | Generic category, not every Empty-Fire subtype. |
| Dampness | Missing generic endpoint | `pattern.damp_heat` and `pattern.phlegm_damp` are not Dampness itself. |
| Cold | Missing generic endpoint | Existing cold-specific clinical Patterns are not a generic Cold entity. |
| Blood | Missing generic endpoint | Blood Deficiency/Heat/Stasis are distinct Patterns, not a Blood node. |
| Water/Fluids | Missing generic endpoint | Do not invent water or Jin-Ye IDs. |
| Organs | No canonical `organ.*` registry | Existing unresolved-looking strings do not prove an endpoint authority. |
| Upper/Middle/Lower Jiao | No individual location IDs | Family `san_jiao` is vocabulary only; lower-Jiao Damp-Heat is a Pattern, not a location node. |
| Six-Channel stages | No individual stage IDs | Family `liu_jing` exists; Tai Yang etc. do not. |
| Four-Level stages | No individual stage IDs | Family `wei_qi_ying_xue` exists; Wei/Qi/Ying/Xue do not. |
| Primary channels | 12 live `code` values, no graph `id` contract | Cannot be production relation targets. |
| Extraordinary vessels | 8 live `code` values, no graph `id` contract | Cannot be production relation targets. |
| Threatened miscarriage/postpartum retained lochia | Missing exact `tdis.*` endpoint | Do not invent endpoint; biomedical `cond.*` remains context only. |

### K3. Edge staging ledger

No production edges are written. “Endpoints resolved” means IDs exist; the edge still remains `STAGING_ONLY` when relation semantics are absent.

| Proposed semantic statement | Endpoint status | Relation status | Disposition |
|---|---|---|---|
| `pattern.spleen_qi_deficiency` may develop into `pattern.spleen_qi_sinking` | Both resolved | No progression/subtype relation | `STAGING_ONLY` |
| `pattern.heart_qi_deficiency` may deepen into `pattern.heart_yang_deficiency` | Both resolved | No progression relation | `STAGING_ONLY` |
| `pattern.stomach_heat` may intensify to `pattern.stomach_fire` | Both resolved | No progression relation | `STAGING_ONLY` |
| `pattern.stomach_fire` may damage `pattern.stomach_yin_deficiency` | Both resolved | No damage relation | `STAGING_ONLY` |
| `pattern.liver_qi_stagnation` may transform into `pattern.liver_fire` | Both resolved | No transformation relation | `STAGING_ONLY` |
| `pattern.liver_yang_rising` may generate `pattern.liver_wind` | Both resolved | No generate relation | `STAGING_ONLY` |
| `pattern.spleen_qi_deficiency` may generate `pattern.phlegm_damp` | Both resolved | No generate relation | `STAGING_ONLY` |
| `pattern.food_stagnation` may generate `pattern.phlegm` | Both resolved | No generate relation | `STAGING_ONLY` |
| `pattern.blood_heat` may cause bleeding manifestations | Pattern resolved; symptom targets vary | No cause relation; symptom registry audit still required | `STAGING_ONLY` |
| Tai-Yang/Shao-Yang/Yang-Ming combined-stage relations | Candidate endpoints absent | No stage-composition relation | `STAGING_ONLY` |
| Four-Level Ying → Xue progression | Candidate endpoints absent | No stage-progression relation | `STAGING_ONLY` |
| Qi-level Heat ↔ Stomach Heat crosswalk | One candidate, one resolved | No crosswalk relation | `STAGING_ONLY` |
| Middle-Jiao Damp-Heat ↔ `pattern.damp_heat_spleen_stomach` | Source stage/location endpoint absent | No crosswalk relation | `STAGING_ONLY` |
| Lower-Jiao Damp-Heat ↔ `pattern.damp_heat_lower_burner` | Clinical Pattern resolved; location endpoint absent | No crosswalk relation | `STAGING_ONLY` |
| Phlegm obstructs a channel/vessel | Phlegm resolved; channel target not canonical | No obstruction relation | `STAGING_ONLY` |
| Blood Stasis obstructs a channel/vessel | Blood Stasis resolved; channel target not canonical | No obstruction relation | `STAGING_ONLY` |
| Liver Fire invades Lung | Target candidate absent; organ nodes absent | No invasion relation | `STAGING_ONLY` |
| Kidney water floods Lung | Water/organ endpoints absent | No flooding/invasion relation | `STAGING_ONLY` |
| Chong-Ren/Dai-Mai Pattern relates to gynecologic `tdis.*` | Pattern candidate; some disease IDs resolved | No Pattern→TCM-disease relation | `STAGING_ONLY` |
| Pattern relates to `cond.recurrent_pregnancy_loss` | Condition resolved; Pattern varies | `edge.condition_patterns` stores authored relation on `cond.*`; only condition-authored future link possible | `STAGING_ONLY` |

## L. Relation semantic matrix

| Required semantic | Closest live contract/field | Sufficient? | Gap | Review decision |
|---|---|---|---|---|
| Exact alias/identity | `pattern_alias_map.json` | Partly | Alias workflow exists but requires exact-identity review | Use only D candidates; no write. |
| Deprecated replacement | Deprecated library metadata | Partly | Frozen redirects already exist; no new retirement authorized | Keep V1 frozen. |
| Category membership | `members` / `member_of` ad hoc fields | No | Not registered in relation registry | Audit/design later; no production edge. |
| Subtype / broader-narrower | `edge.pattern_differentials` | No | Differential is not hierarchy | New semantic decision required from Ting. |
| Progression / develops-into | `develops_into` ad hoc field | No | Not registered; reverse/ownership undefined | Keep staging ledger only. |
| Transformation / generates | None | No | No predicate or ownership contract | Keep staging-only. |
| Damages / consumes | None | No | No causal predicate | Keep staging-only. |
| Invades / affects organ | None | No | Organ endpoint registry also absent | Blocked pending both layers. |
| Obstructs channel/vessel | None | No | Target IDs and predicate absent | Blocked pending both layers. |
| Stage membership | Family vocabulary only | No | No individual stage endpoints or relation | Keep family metadata only. |
| Cross-system overlap/crosswalk | `edge.comparison_members` | No | Comparison membership is not semantic equivalence/overlap | Require explicit crosswalk predicate or approved non-edge representation. |
| Pattern ↔ TCM disease context | `edge.condition_tcm_diseases`, `edge.tdis_symptoms` | No | Neither connects `pattern.*` to `tdis.*` | New contract decision required. |
| Condition ↔ Pattern | `edge.condition_patterns` | Yes, narrowly | Authored on `cond.*`; cannot be repurposed for TCM disease or Pattern hierarchy | Use only for verified `cond.*` context later. |
| Pattern differential | `edge.pattern_differentials` | Yes | Only differential/comparison semantics | Do not overload for hierarchy or crosswalk. |
| Pattern ↔ symptom | `edge.pattern_symptoms` | Yes | Requires canonical symptom IDs | Reuse only after symptom audit. |

This review does not recommend adding a relation type yet. The minimum next governance decision is whether Pattern hierarchy, progression/transformation, cross-system crosswalk, Pattern-to-TCM-disease context, and channel/location relations belong in the graph at all, followed by endpoint authority and authored-side/reverse rules.

## M. Conflicts, missing evidence, and Ting decisions

### M1. Repository/research conflicts

1. Research pack counts are stale; live V1 is 69 registry, 62 raw library, 59 active, 3 deprecated, 59/59 reconciled.
2. Research claims that Heart Yang Deficiency and several Kidney/combined Patterns are new conflict with live active records.
3. `DECISIONS.md` D16 contains a historical residual count note (59 raw / 56 active) that no longer matches the audited live baseline. It was not edited.
4. Research identifiers `tdis.bi_syndrome`, `tdis.wei_syndrome`, and `tdis.insomnia` are invalid in live data; correct IDs are `tdis.bi_zheng`, `tdis.wei_zheng`, and `tdis.bu_mei`.
5. Research family label `six_channels` conflicts with live family vocabulary `liu_jing`.
6. Existing channel/vessel `code` values are not relation-registry target IDs.

### M2. Decisions required from Ting before implementation

1. Approve/reject the proposed new-canonical granularity, especially generic Kidney Qi Deficiency, Gallbladder Qi Deficiency, combined-organ Patterns, and uterus-specific Patterns.
2. Decide 肝氣犯胃 and 肝氣犯脾 as standalone subtypes versus content/crosswalk under existing disharmony Patterns.
3. Decide the split for 胃寒 and 大腸虛寒 (excess Cold versus deficiency Cold).
4. Decide 胃津不足 versus 胃陰虛 and 津傷 versus chronic fluid/Yin deficiency.
5. Decide Tan-Yin: Pattern identity, `tdis.*` disease, or mechanism vocabulary.
6. Decide generic 陰虛火旺 and 風痰 umbrellas versus organ/location-specific subtypes only.
7. Decide Bi hierarchy and whether `pattern.heat_bi` covers 風濕熱痹.
8. Decide Chong-Ren granularity and whether 胞宮 location belongs inside Pattern identity or a separate location layer.
9. Approve the nine Six-Channel candidates and four core Four-Level candidates as canonical Pattern identities rather than only classical classifications.
10. Decide whole-San-Jiao Damp-Heat as a canonical Pattern, and approve middle/lower-Jiao crosswalk policy.
11. Approve/reject the extraordinary-vessel candidates (Dai, Yin Qiao, Yang Qiao, Yang Wei, Chong Qi Rebellion).
12. Decide whether general channel obstruction and sinew-channel contraction are Pattern identities, structured channel states, or symptom groupings.
13. Decide whether channel/vessel codes need canonical IDs before any graph relation.
14. Decide whether to add relation semantics for hierarchy, progression/transformation, crosswalk, Pattern-to-TCM-disease context, and channel/location; do not overload current relations.
15. Decide whether missing pregnancy/postpartum TCM disease contexts should receive future `tdis.*` records; do not use biomedical conditions as Pattern identity.
16. Decide whether to correct the stale historical count note in `DECISIONS.md` in a separate governance change.

## N. Projected V2 counts

The arithmetic below counts unique rows classified `NEW_CANONICAL_CANDIDATE`; H010 is explicitly a cross-reference to B121 and is not double-counted. All other actions add zero canonical IDs.

<!-- COUNT_BLOCK_START -->
Unique normalized concepts reviewed: **212** (B, G, H, and I; H010 cross-reference excluded).

| Primary action | Count |
|---|---:|
| `KEEP_EXISTING` | 7 |
| `ENRICH_EXISTING` | 32 |
| `ADD_ALIAS` | 5 |
| `NEW_CANONICAL_CANDIDATE` | 50 |
| `SUBTYPE_REVIEW` | 12 |
| `BROADER_NARROWER_REVIEW` | 10 |
| `GRAPH_COMPOSITION` | 24 |
| `PROGRESSION_RELATION` | 10 |
| `LOCATION_MODIFIER` | 9 |
| `TCM_DISEASE_ONLY` | 13 |
| `CONTEXT_RELATION` | 12 |
| `CROSS_SYSTEM_OVERLAP` | 6 |
| `TERMINOLOGY_REVIEW` | 10 |
| `HOLD_INSUFFICIENT_EVIDENCE` | 12 |
| **Total** | **212** |

If and only if Ting approves all 50 proposed new canonical candidates without reclassification:

- Registry total: `69 + 50 = 119`
  - Taxonomy/category: `10 + 0 = 10`
  - Clinical Patterns: `59 + 50 = 109`
- Library raw: `62 + 50 = 112`
  - Active: `59 + 50 = 109`
  - Deprecated: `3 + 0 = 3`
- Projected active reconciliation: `109/109`

Conservative no-approval state remains the audited V1 baseline: Registry 69 (10 + 59), library 62 (59 active + 3 deprecated), reconciliation 59/59.
<!-- COUNT_BLOCK_END -->

This is a review projection, not an implementation authorization. Candidates later reclassified from `SUBTYPE_REVIEW`, `BROADER_NARROWER_REVIEW`, `TERMINOLOGY_REVIEW`, or `HOLD_INSUFFICIENT_EVIDENCE` would change the projection and require a new approved arithmetic pass.

## O. Dependency-aware future implementation batches

No batch below was started.

1. **Governance gate:** Ting resolves M2; approve canonical candidate set, naming, family membership, endpoint authority, and relation semantics.
2. **Existing-only cleanup:** source-verify the five alias candidates and enrich existing records without changing IDs; validate 69/62/59/3/59↔59 before and after.
3. **Core Zang-Fu/mechanism batch:** add at most 20 approved high-confidence candidates with full bilingual cards and named sources; rebuild and reconcile registry/library.
4. **Remaining combined/pathogen/gynecology batch:** add at most 20 approved candidates; keep disease/context relations separate.
5. **Six-Channel batch:** add the approved nine core candidates as one internally consistent classical family.
6. **Four-Level/San-Jiao batch:** add approved stage candidates; implement crosswalks only after relation policy exists.
7. **Extraordinary-vessel/channel batch:** add only approved Pattern identities; establish canonical channel/vessel endpoint contract first if graph relations are desired.
8. **Graph batch:** only after endpoints and relation registry contracts are approved; author one side, derive reverse, validate every endpoint, and reject missing IDs.
9. **Final reconciliation:** registry category/clinical counts, library raw/active/deprecated counts, exact active reconciliation, duplicate/alias collision audit, source audit, build, interaction validation if UI changes, and rollback record.

Stop point: canonical review complete; no automatic transition to implementation.

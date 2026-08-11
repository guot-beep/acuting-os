# AcuTing OS — TCM Pattern Expansion Research Pack v0.2
## Batch 02 — Combined, Mechanism, Channel/Bi, Exterior & Fluid-Pathology Candidates

**Date:** 2026-08-08  
**Workstream owner:** ChatGPT research/extraction layer  
**Implementation owner:** Claude / repository agent  
**Status:** Research staging only — NOT canonical production data

---

## 0. Purpose

This batch continues the existing `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.1_2026-08-08.md`.

The goal is to extract high-value Pattern concepts already present in the user's formula/course/source corpus so Claude can later focus on:

1. matching against existing `pattern.*` IDs,
2. deciding alias vs subtype vs progression vs distinct Pattern,
3. resolving formula / point relationships,
4. constructing production cards,
5. running validators and committing.

No candidate below should be promoted automatically.

---

## 1. Candidate status vocabulary

- `distinct_candidate` — likely useful standalone Pattern if absent
- `subtype_review` — likely subtype of an existing broader Pattern
- `broader_narrower_review` — relationship may be umbrella ↔ narrower presentation
- `progression_review` — source implies transformation / progression
- `compound_graph_preferred` — probably better represented as multiple Pattern nodes + relationship/context rather than one giant canonical Pattern
- `possible_existing_match` — likely already represented under another label
- `source_context_only` — clinically meaningful wording, but not necessarily a canonical Pattern
- `canonical_review_required` — identity decision needed before promotion

---

# 2. High-priority combined Zang-Fu candidates

| # | Candidate | Chinese | Likely system | Status | Source / formula anchors | Canonical review note |
|---|---|---|---|---|---|---|
| 1 | Lung-Spleen Qi Deficiency | 肺脾氣虛 | Zang-Fu combined | distinct_candidate | Shen Ling Bai Zhu San; Bu Zhong Yi Qi Tang | Common combined deficiency; review against separate Lung Qi / Spleen Qi deficiency |
| 2 | Heart-Lung Qi Deficiency | 心肺氣虛 | Zang-Fu combined | distinct_candidate | Sheng Mai San | Strong combined-organ candidate |
| 3 | Lung-Kidney Qi Deficiency | 肺腎氣虛 | Zang-Fu combined | distinct_candidate | Sheng Mai San | Distinguish from Lung-Kidney Yin deficiency |
| 4 | Heart-Spleen Qi/Blood Deficiency | 心脾氣血兩虛 | Zang-Fu combined | possible_existing_match | Gui Pi Tang; Ren Shen Yang Rong Tang | May already exist as Heart-Spleen Deficiency; preserve source wording as subtype/alias if so |
| 5 | Heart-Liver Blood Deficiency | 心肝血虛 | Zang-Fu combined | subtype_review | Dang Gui Bu Xue Tang | Review whether separate canonical Pattern adds value |
| 6 | Liver-Kidney Yin Deficiency with Liver Yang Rising | 肝腎陰虛兼肝陽上亢 | Zang-Fu combined | compound_graph_preferred | Qi Ju Di Huang Wan family; Yi Guan Jian-related source context | Likely base deficiency + secondary Yang-rising relationship |
| 7 | Liver-Kidney Yin Deficiency with Fire Flaring | 肝腎陰虛火旺 | Zang-Fu combined | progression_review | Zhi Bai Di Huang Wan; Da Bu Yin Wan | May be deficiency-root + Fire-branch graph rather than flat standalone Pattern |
| 8 | Kidney Yin Deficiency with Fire Flaring | 腎陰虛火旺 | Zang-Fu | subtype_review | Zhi Bai Di Huang Wan | Strong subtype of Kidney Yin deficiency |
| 9 | Spleen-Kidney Yang Deficiency with Water Flooding | 脾腎陽虛水泛 | Zang-Fu combined | distinct_candidate | Zhen Wu Tang; Shi Pi Yin | Strong clinically useful combined Pattern |
| 10 | Kidney Yang Deficiency with Water Flooding Lung | 腎陽虛水泛於肺 | Zang-Fu combined | subtype_review | Zhen Wu Tang | Likely subtype/location manifestation of Kidney Yang deficiency + water retention |
| 11 | Heart Yang Deficiency with Water Qi Insulting Heart | 心陽不振水氣凌心 | Zang-Fu combined | distinct_candidate | Zhen Wu Tang; Ling Gui Zhu Gan Tang-type source wording | Important fluid-pathology / cardiac presentation candidate |
| 12 | Heart-Gallbladder Qi Deficiency | 心膽氣虛 | Zang-Fu combined | distinct_candidate | Ding Zhi Wan | Strong Shen-pattern candidate if absent |
| 13 | Liver-Spleen Disharmony | 肝脾不和 | Zang-Fu combined | possible_existing_match | Xiao Yao / Chai Hu-related formula corpus | May already be represented by Liver Qi stagnation affecting Spleen |
| 14 | Liver Qi Invading Stomach | 肝氣犯胃 | Zang-Fu combined | distinct_candidate | Chai Hu Shu Gan San; Zuo Jin Wan contexts | High-value clinical/board Pattern |
| 15 | Liver Fire Scorching Lung | 肝火犯肺 / 肝火灼肺 | Zang-Fu combined | distinct_candidate | Xie Bai San context | Classic cross-organ excess Pattern; high graph value |

---

# 3. Qi, Blood, Phlegm, Damp and mixed-mechanism candidates

| # | Candidate | Chinese | Likely system | Status | Source / formula anchors | Review note |
|---|---|---|---|---|---|---|
| 16 | Qi Deficiency with Blood Stasis Obstructing Channels | 氣虛血瘀阻絡 | Qi/Blood + channels | distinct_candidate | Bu Yang Huan Wu Tang | Strong clinical graph candidate; sequelae/post-stroke context should remain source-scoped, not universal |
| 17 | Qi Stagnation with Phlegm Retention | 氣滯痰阻 | Qi/Phlegm | distinct_candidate | Ban Xia Hou Po Tang; San Zi Yang Qin Tang | Useful broader mechanism candidate; Plum-Pit Qi may be a subtype/context |
| 18 | Liver Qi Stagnation with Phlegm-Qi Binding | 肝氣鬱結痰氣互結 | Liver + Phlegm | subtype_review | Ban Xia Hou Po Tang | Consider relation to Liver Qi Stagnation + Phlegm rather than independent canonical Pattern |
| 19 | Phlegm-Fire Disturbing Heart | 痰火擾心 | Phlegm + Heart | distinct_candidate | Wen Dan Tang; Ci Zhu Wan-related corpus | Strong Shen/mental-emotional Pattern candidate |
| 20 | Phlegm-Heat Obstructing Heart Orifices | 痰熱蒙閉心竅 | Phlegm + orifices | distinct_candidate | Ling Jiao Gou Teng Tang / opening-orifice formula contexts | Acute severe presentation; requires separate biomedical safety layer, not safety claims inside Pattern card |
| 21 | Turbid Phlegm Obstructing Channels/Collaterals | 痰濁阻絡 | Phlegm + channels | distinct_candidate | Su He Xiang Wan context | Useful channel/neurologic graph candidate |
| 22 | Wind-Phlegm | 風痰 | Wind + Phlegm | broader_narrower_review | Ban Xia Bai Zhu Tian Ma Tang | Could be umbrella for several head/vertigo/channel presentations |
| 23 | Wind-Phlegm Obstructing Head/Face Channels | 風痰阻絡（頭面） | Wind + Phlegm + channels | subtype_review | Qian Zheng San context | Likely narrower clinical presentation under Wind-Phlegm |
| 24 | Damp-Phlegm | 濕痰 | Phlegm/Damp | distinct_candidate | Er Chen Tang; Ban Xia Bai Zhu Tian Ma Tang | Strong basic mechanism candidate |
| 25 | Cold-Phlegm Obstructing Lung | 寒痰阻肺 | Phlegm + Lung | distinct_candidate | San Zi Yang Qin Tang | Useful Lung subtype |
| 26 | Phlegm-Heat in Lung | 痰熱壅肺 | Phlegm + Lung | distinct_candidate | Ding Chuan Tang / Qing Qi Hua Tan-related corpus | High-value respiratory Pattern |
| 27 | Phlegm-Dryness in Lung | 燥痰阻肺 / 痰燥 | Phlegm + Dryness | subtype_review | Bei Mu Gua Lou San | Terminology review needed; may be source-context rather than universal canonical name |
| 28 | Phlegm-Damp from Spleen Qi Deficiency | 脾氣虛生痰濕 | Spleen + Phlegm/Damp | progression_review | Shen Ling Bai Zhu San; Liu Jun Zi Tang | Better represented as causal/progression edge in many cases |
| 29 | Food Stagnation with Phlegm | 食積生痰 / 食滯兼痰 | Food + Phlegm | source_context_only | San Zi Yang Qin Tang | Likely modifier/context rather than core Pattern |
| 30 | Blood Deficiency with Blood Stasis | 血虛血瘀 | Blood | subtype_review | Run Chang Wan / postpartum and gynecology corpus | Important but may be better graph combination than flat canonical node |
| 31 | Blood Deficiency with Cold Stagnation | 血虛寒凝 | Blood + Cold | distinct_candidate | Dang Gui Si Ni Tang; Sheng Hua Tang | Strong classic mixed mechanism |
| 32 | Heat with Blood Stasis | 熱瘀互結 | Heat + Blood | distinct_candidate | Da Huang Mu Dan Tang | Strong mechanism candidate, often location-specific |
| 33 | Blood Heat with Bleeding | 血熱妄行 | Blood/Heat | subtype_review | Shi Hui San; Xi Jiao Di Huang Tang contexts | Distinguish generic Blood Heat from bleeding manifestation |
| 34 | Yin Deficiency Fire | 陰虛火旺 | Yin/Heat | distinct_candidate | Huang Lian E Jiao Tang; Gu Jing Wan | Broad deficiency-Heat mechanism, likely taxonomy + clinical Pattern depending repo design |
| 35 | True Cold with False Heat | 真寒假熱 | Eight Principles | distinct_candidate | You Gui Yin source wording | Important Eight-Principles candidate; cross-check with Shen-Nong / standards |
| 36 | Mixed Cold and Heat in Middle / Epigastrium | 寒熱錯雜 | Eight Principles / Middle Jiao | distinct_candidate | Ban Xia Xie Xin Tang; Wu Mei Wan for Jue Yin mixed Cold/Heat | May require system-specific subtypes rather than one generic node |

---

# 4. Channel / Bi / Wei candidates

| # | Candidate | Chinese | Likely system | Status | Source / formula anchors | Review note |
|---|---|---|---|---|---|---|
| 37 | Wind-Cold-Damp Bi | 風寒濕痹 | Channel/Bi | distinct_candidate | Ren Shen Bai Du San; Du Huo Ji Sheng Tang | Strong board/clinical candidate |
| 38 | Wind-Damp Bi | 風濕痹 | Channel/Bi | distinct_candidate | Fang Ji Huang Qi Tang | Review relation to generalized Wind-Damp |
| 39 | Wind-Damp-Heat Bi | 風濕熱痹 | Channel/Bi | distinct_candidate | Gui Zhi Shao Yao Zhi Mu Tang / AD special-system corpus | Strong heat-transformed Bi candidate |
| 40 | Recurrent Wind-Cold-Damp Bi Transforming to Heat | 風寒濕痹鬱久化熱 | Channel/Bi | progression_review | Gui Zhi Shao Yao Zhi Mu Tang | Better as progression relation than separate canonical Pattern in many ontologies |
| 41 | Phlegm-Blood Stasis Bi / Channel Obstruction | 痰瘀痹阻 | Channel/Bi | distinct_candidate | Xiao Huo Luo Dan-type corpus | High clinical relevance; source cross-check needed |
| 42 | Qi-Blood Stagnation Painful Obstruction | 氣血瘀滯痹阻 | Channel/Bi | distinct_candidate | Shen Tong Zhu Yu Tang | Strong mechanism-based pain candidate |
| 43 | Bi with Liver-Kidney Deficiency | 肝腎虧虛痹證 | Channel/Bi + deficiency | compound_graph_preferred | Du Huo Ji Sheng Tang | Root deficiency + branch obstruction; likely graph decomposition |
| 44 | Bi with Qi-Blood Deficiency | 氣血虛痹 | Channel/Bi + deficiency | compound_graph_preferred | Du Huo Ji Sheng Tang | Same caution: may be better as modifiers/relations |
| 45 | Wei Syndrome from Spleen/Stomach Qi Deficiency | 脾胃氣虛痿證 | Wei syndrome / Zang-Fu | source_context_only | Bu Zhong Yi Qi Tang; Shen Ling Bai Zhu San; Liu Jun Zi Tang | Wei is disease/syndrome context, not automatically a Pattern node |
| 46 | Wei Syndrome from Liver-Kidney Deficiency | 肝腎虧虛痿證 | Wei syndrome / Zang-Fu | source_context_only | Liu Wei Di Huang Wan; Zuo Gui Wan; Du Huo Ji Sheng Tang | Keep as TCM disease ↔ Pattern mapping candidate |
| 47 | Wei Syndrome from Lung Heat with Fluid Deficiency | 肺熱津傷痿證 | Wei syndrome / Lung | source_context_only | Sheng Mai San | Strong mapping candidate, not necessarily a new Pattern |
| 48 | Wei Syndrome from Qi Deficiency + Blood Stasis | 氣虛血瘀痿證 | Wei syndrome / Qi-Blood | source_context_only | Bu Yang Huan Wu Tang | Prefer TCM disease relation to Pattern combination |

---

# 5. Exterior / pathogenic-factor candidates

| # | Candidate | Chinese | Likely system | Status | Source / formula anchors | Review note |
|---|---|---|---|---|---|---|
| 49 | External Wind | 外風 | Pathogenic factor | possible_existing_match | Chuan Xiong Cha Tiao San | Existing category may already cover this; distinguish taxonomy node from clinical card |
| 50 | Wind-Cold Attacking Lung | 風寒犯肺 | Zang-Fu / pathogenic factor | distinct_candidate | Ma Huang Tang; Ge Gen Tang contexts | Distinct from generic Wind-Cold if Lung manifestations are required |
| 51 | Wind-Heat Attacking Lung | 風熱犯肺 | Zang-Fu / pathogenic factor | distinct_candidate | Yin Qiao San; Sang Ju Yin; Ma Xing Shi Gan Tang | Strong external Lung Pattern |
| 52 | Wind-Cold with Qi Stagnation | 風寒兼氣滯 | pathogenic factor + Qi | subtype_review | Xiang Su San | Likely combined modifier |
| 53 | Wind-Cold with Interior Heat | 外寒裏熱 | Eight Principles / exterior-interior | distinct_candidate | Da Qing Long Tang; Cang Er Zi San contexts | Strong mixed exterior/interior candidate |
| 54 | Wind-Cold Transforming into Heat | 風寒化熱 | progression | progression_review | Chai Ge Jie Ji Tang; Ma Xing Shi Gan Tang | Relationship/event more than static canonical Pattern |
| 55 | External Wind with Heat and Dryness | 外風燥熱 / 溫燥犯肺 | pathogenic factor + Lung | distinct_candidate | Sang Xing Tang | High-value Dryness Pattern; normalize exact Chinese |
| 56 | Wind-Heat with Dryness | 風熱兼燥 | pathogenic factor | subtype_review | Bei Mu Gua Lou San / Sang Xing Tang contexts | Could be source variant of Warm-Dryness |
| 57 | Summerheat with Dampness | 暑濕 | pathogenic factor | distinct_candidate | Liu Yi San; San Ren Tang; Yin Qiao/Sang Ju source contexts | Strong seasonal pathogenic Pattern |
| 58 | Early Damp-Heat | 濕熱初起 | pathogenic factor / Wen Bing | subtype_review | San Ren Tang | Likely early-stage modifier rather than independent core Pattern |
| 59 | Damp-Heat in Lower Jiao | 下焦濕熱 | San Jiao/pathogenic | distinct_candidate | Long Dan Xie Gan Tang; Ge Gen Huang Qin Huang Lian Tang contexts | Strong graph hub, but distinguish San Jiao stage from organ-specific Bladder/Liver-GB Damp-Heat |

---

# 6. Water / Jin-Ye / fluid-pathology candidates

| # | Candidate | Chinese | Likely system | Status | Source / formula anchors | Review note |
|---|---|---|---|---|---|---|
| 60 | Water Retention / Water Flooding | 水濕停聚 / 水泛 | Body Fluid / pathogenic | broader_narrower_review | Wu Ling San; Zhen Wu Tang | Umbrella mechanism; organ/root subtypes should remain distinguishable |
| 61 | Lower Jiao Water Retention | 下焦水停 | San Jiao / fluid | subtype_review | Wu Ling San | Location subtype |
| 62 | Kidney Yang Deficiency with Water Flooding | 腎陽虛水泛 | Zang-Fu + fluid | distinct_candidate | Zhen Wu Tang | Strong classical candidate |
| 63 | Spleen Deficiency Edema | 脾虛水腫 | Zang-Fu + fluid | subtype_review | Wu Ling San; Shi Pi Yin | Could be TCM disease-context mapping rather than standalone canonical Pattern |
| 64 | Wind-Damp Edema | 風水 / 風濕水腫 | pathogenic + fluid | canonical_review_required | Fang Ji Huang Qi Tang | Chinese normalization and distinction from Feng Shui need authoritative cross-check |
| 65 | Congested Fluids / Thin Mucus (Tan Yin) | 痰飲 | Fluid pathology | distinct_candidate | Xiao Qing Long Tang; Ling Gui Zhu Gan-type corpus; Jin Gui Shen Qi Wan | Strong classical fluid-pathology Pattern/disease-mechanism concept |
| 66 | Jin-Ye Stasis | 津液停滯 / 津液瘀滯 | Fluid pathology | canonical_review_required | Jin Gui Shen Qi Wan; Zhen Wu Tang source wording | AD wording may not map cleanly to standard canonical terminology |
| 67 | Fluid Deficiency / Jin-Ye Injury | 津傷 / 津液不足 | Body Fluid deficiency | distinct_candidate | Bai Hu Tang, Zhu Ye Shi Gao Tang, Sheng Mai San | Core mechanism; distinguish from Yin deficiency |
| 68 | Stomach Fluid Deficiency | 胃津不足 | Zang-Fu + fluid | distinct_candidate | Zhu Ye Shi Gao Tang | Strong candidate if absent |
| 69 | Lung Heat Consuming Fluids | 肺熱傷津 | Lung + fluid | progression_review | Sheng Mai San / Ma Xing Shi Gan Tang contexts | Usually progression/etiology link rather than standalone if Lung Heat and fluid deficiency both canonical |
| 70 | Stomach Fire Damaging Yin/Fluids | 胃火傷陰 / 胃火傷津 | Stomach + fluid | progression_review | Yu Nu Jian / Mai Men Dong Tang contexts | Important progression edge, not necessarily separate Pattern |

---

# 7. TCM disease / Pattern boundary warnings

The formula corpus contains many labels that are clinically useful but should **not** automatically become `pattern.*` IDs.

Examples:

- Lin Syndrome 淋證
- Wei Syndrome 痿證
- Bi Syndrome 痹證
- Xiao Ke 消渴
- Gu Syndrome 蠱證
- Tan Yin 痰飲 may sit at the boundary of disease category vs fluid-pattern mechanism depending AcuTing design
- intestinal abscess 腸癰
- collapse / syncope presentations
- habitual miscarriage
- postpartum states

For future canonicalization:

`tdis.*` should represent the TCM disease when appropriate.

`pattern.*` should represent the differentiating Pattern.

Example:

`tdis.wei_syndrome`
→ may_have_pattern →
`pattern.spleen_stomach_qi_deficiency`

rather than creating `pattern.wei_syndrome_due_to_spleen_stomach_qi_deficiency` for every formula wording.

---

# 8. Relationship candidates extracted in this batch

These are **research relations**, not production edges yet.

## Progression / transformation
- Spleen Qi Deficiency → may_generate → Dampness
- Dampness → may_condense_into → Phlegm
- Kidney Yang Deficiency → may_cause → Water Flooding
- Water Flooding → may_affect → Lung / Heart
- Wind-Cold → may_transform_into → Heat
- Wind-Cold-Damp Bi → may_transform_into → Wind-Damp-Heat Bi
- Liver Qi Stagnation → may_affect → Stomach
- Liver Qi Stagnation → may_bind_with → Phlegm
- Qi Deficiency → may_contribute_to → Blood Stasis
- Stomach Fire → may_damage → Stomach Yin / fluids
- Lung Heat → may_damage → fluids
- Blood Deficiency → may_generate → Internal Wind
- Liver Yang / Liver Fire → may_generate → Internal Wind

## Root ↔ branch / compound-pattern structure
- Kidney Yang Deficiency + Water Retention
- Spleen-Kidney Yang Deficiency + Water Flooding
- Liver-Kidney Yin Deficiency + Fire Flaring
- Liver-Kidney Yin Deficiency + Liver Yang Rising
- Qi Deficiency + Blood Stasis obstructing Channels
- Blood Deficiency + Cold Stagnation
- Phlegm + Heat + Heart-Orifice obstruction
- Wind + Phlegm + channel obstruction

These combinations should be reviewed for graph composition before creating compound canonical IDs.

---

# 9. Highest-priority candidates for V2 canonical review

These are the candidates from this batch most likely to justify real cards if absent:

1. 肺脾氣虛 — Lung-Spleen Qi Deficiency
2. 心肺氣虛 — Heart-Lung Qi Deficiency
3. 肺腎氣虛 — Lung-Kidney Qi Deficiency
4. 脾腎陽虛水泛 — Spleen-Kidney Yang Deficiency with Water Flooding
5. 心膽氣虛 — Heart-Gallbladder Qi Deficiency
6. 肝氣犯胃 — Liver Qi Invading Stomach
7. 肝火犯肺 — Liver Fire Scorching Lung
8. 痰火擾心 — Phlegm-Fire Disturbing Heart
9. 痰熱蒙閉心竅 — Phlegm-Heat Obstructing Heart Orifices
10. 濕痰 — Damp-Phlegm
11. 寒痰阻肺 — Cold-Phlegm Obstructing Lung
12. 痰熱壅肺 — Phlegm-Heat in Lung
13. 血虛寒凝 — Blood Deficiency with Cold Stagnation
14. 風寒濕痹 — Wind-Cold-Damp Bi
15. 風濕熱痹 — Wind-Damp-Heat Bi
16. 氣血瘀滯痹阻 — Qi-Blood Stagnation Painful Obstruction
17. 風寒犯肺 — Wind-Cold Attacking Lung
18. 風熱犯肺 — Wind-Heat Attacking Lung
19. 溫燥犯肺 — Warm-Dryness Attacking Lung
20. 暑濕 — Summerheat with Dampness
21. 腎陽虛水泛 — Kidney Yang Deficiency with Water Flooding
22. 胃津不足 — Stomach Fluid Deficiency
23. 津傷 / 津液不足 — Fluid Deficiency / Jin-Ye Injury
24. 痰飲 — Congested Fluids / Thin Mucus

---

# 10. Candidates that should probably remain relations/modifiers unless stronger evidence appears

- Wind-Cold transforming into Heat
- Spleen Qi Deficiency generating Dampness
- Dampness generating Phlegm
- Lung Heat consuming fluids
- Stomach Fire damaging Yin
- Liver Yang/Fire generating Internal Wind
- Wei Syndrome from Spleen/Stomach Qi Deficiency
- Wei Syndrome from Liver/Kidney Deficiency
- Wei Syndrome from Lung Heat with fluid deficiency
- Wei Syndrome from Qi deficiency + Blood stasis
- Upper/Middle/Lower Jiao location-only phrases without stable independent differentiation criteria
- extremely compound multi-organ labels where graph decomposition preserves more clinical meaning

---

# 11. Source notes supporting this batch

The user's current formula/source corpus contains direct Pattern anchors including:

- Sheng Mai San → Lung/Kidney Qi deficiency; Heart/Lung Qi deficiency; Lung Qi/Yin deficiency
- Shen Ling Bai Zhu San → Lung/Spleen Qi deficiency; Dampness from Spleen Qi deficiency
- Zhen Wu Tang → Kidney Yang deficiency with Water Flooding; Water Flooding Lung; Spleen/Kidney Yang deficiency with Water Flooding; Heart Yang weakness with Water Qi affecting Heart
- Ding Zhi Wan → Heart/Gallbladder Qi deficiency
- Ban Xia Hou Po Tang → Liver Qi stagnation with Phlegm-Qi binding
- Ban Xia Bai Zhu Tian Ma Tang → Wind-Phlegm; Damp-Phlegm
- Si Wu Tang → Liver Blood deficiency generating Internal Wind
- Bu Yang Huan Wu Tang → Qi deficiency with Blood stasis obstructing channels
- Ren Shen Bai Du San / Du Huo Ji Sheng Tang / Fang Ji Huang Qi Tang / Gui Zhi Shao Yao Zhi Mu Tang → multiple Bi-pattern anchors
- Sang Xing Tang → external Wind with Heat and Dryness
- San Ren Tang → early Damp-Heat; Wei-stage Damp-Heat; San Jiao/Upper Jiao Heat
- Wu Ling San / Zhen Wu Tang → water-retention mechanisms
- Zhu Ye Shi Gao Tang → Qi-stage Lung/Stomach Heat injuring Qi and fluids; Stomach fluid deficiency
- Huang Lian E Jiao Tang → Heart/Kidney Yin deficiency with Fire; Shao Yin Heat; Yin-deficiency Fire
- Zhi Bai Di Huang Wan → Kidney Yin deficiency with Fire Flaring; Liver/Kidney Yin deficiency with Fire Flaring

These are formula-to-Pattern evidence anchors, not proof that every wording deserves an independent canonical node.

---

# 12. Next research batches

Recommended next passes:

### Batch 03 — Full Zang-Fu expansion
Systematically extract candidate Patterns organ by organ:
- Heart / Small Intestine
- Lung / Large Intestine
- Spleen / Stomach
- Liver / Gallbladder
- Kidney / Bladder
- Pericardium / San Jiao

### Batch 04 — Gynecology / Chong-Ren / Jing / reproductive Patterns
Use formula/course data to separate:
- Chong-Ren deficiency
- Chong-Ren Heat
- Chong-Ren Cold
- Chong-Ren Blood stasis
- Kidney Jing deficiency
- uterus Blood stasis
- deficiency-Cold of uterus
- pregnancy/postpartum contexts that belong to `tdis.*` rather than `pattern.*`

### Batch 05 — Canonical alias & duplicate map
Build a review table:
`source wording → normalized concept → existing pattern candidate → relation type → confidence → sources`

### Batch 06 — Full formula-to-Pattern inversion
Invert the 181/201 formula corpus into:
`Pattern candidate → all supporting formulas → source count → board relevance`

This will be especially useful for candidate prioritization.

---

# 13. Implementation handoff rule

Claude should not consume this file as an instruction to bulk-create Pattern IDs.

For each candidate:

1. check `pattern_registry.json`
2. check `pattern_library.json`
3. check `pattern_alias_map.json`
4. check staging/history
5. compare bilingual identity
6. classify as:
   - existing match
   - alias
   - subtype
   - broader/narrower
   - progression
   - graph composition
   - distinct candidate
7. only promote after canonical review
8. preserve exact source provenance
9. resolve formula/point IDs before production links
10. run validators before commit

---

## End of Batch 02

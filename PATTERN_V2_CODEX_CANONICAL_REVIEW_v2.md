# AcuTing OS Pattern V2 Canonical Review v2

> Review-only artifact — 2026-08-08 (America/Los_Angeles)
>
> Authority order: live frozen V1 → Final Canonical Decision Pack → Batch 02–10 → v1 Codex review.
> No production Pattern ID, registry/library record, alias, relation type, TDIS endpoint, graph edge, schema, or migration was created or changed.

## 1. Frozen live baseline and scope

| Audit | Live result |
|---|---|
| Branch | `codex/extra-points-2026-08-07` |
| HEAD at opening audit | `751d75322faaf192bbe8a4f6e264b20bef707988` |
| HEAD at final re-audit | `099523aa8984b36dfce799a2f149877ba24edce3` |
| `c8a5ea7` ancestor | Yes |
| Pattern authority files locally clean | Yes |
| Registry total | 69 |
| Taxonomy/category | 10 |
| Clinical `level:"pattern"` | 59 |
| Library raw | 62 |
| Active | 59 |
| Deprecated | 3 |
| Active reconciliation | 59/59 |
| Duplicate registry/library IDs | 0/0 |

The working tree was already dirty outside Pattern scope (`js/knowledge.js`, `js/router.js`, the v1 review, supplied ZIP, and later external `tmp/`). Those files were not modified by this review. During review, HEAD advanced through acupoint/generated/handoff commits only; the Pattern/relation authority files were not touched, and the full baseline was rerun at the final HEAD. The three deprecated Pattern records remain historical provenance.

## 2. Reclassification rules

1. Exact live V1 identities remain `ENRICH_EXISTING`; a Decision Pack “approve canonical” statement cannot create a duplicate of an existing V1 ID.
2. Only aliases explicitly approved in Decision Pack §15 are `ADD_ALIAS`.
3. Any non-V1 concept not explicitly resolved by the Decision Pack is `HOLD_FOR_TING`, even when the v1 Codex review proposed another classification.
4. `APPROVE_CANONICAL` and `APPROVE_CANONICAL_SUBTYPE` are review decisions only. Proposed IDs below are planning labels, not created IDs.
5. H010 is a duplicate cross-reference to B121 and is shown for traceability but excluded from the 212-row counts and projected delta.

## 3. Complete 212-concept decision ledger

### 3A. Zang-Fu, mechanism, pathogen, Bi, Lin, and gynecology

| Ref | Concept | Final classification | Live/proposed ID | Authority note |
|---|---|---|---|---|
| B001 | 心氣虛 | `ENRICH_EXISTING` | `pattern.heart_qi_deficiency` | Frozen V1. |
| B002 | 心陽虛 | `ENRICH_EXISTING` | `pattern.heart_yang_deficiency` | Frozen V1. |
| B003 | 心血虛 | `ENRICH_EXISTING` | `pattern.heart_blood_deficiency` | Frozen V1. |
| B004 | 心陰虛 | `ENRICH_EXISTING` | `pattern.heart_yin_deficiency` | Frozen V1. |
| B005 | 心火亢盛／心火上炎 | `ENRICH_EXISTING` | `pattern.heart_fire` | Frozen V1 identity. |
| B006 | 心腎不交 | `ENRICH_EXISTING` | `pattern.heart_kidney_not_communicating` | Locked V1 identity. |
| B007 | 痰火擾心 | `APPROVE_CANONICAL` | proposed `pattern.phlegm_fire_disturbing_heart` | Decision Pack §3. |
| B008 | 痰迷／痰蒙／痰阻心竅 | `HOLD_FOR_TING` | Existing `pattern.phlegm_misting_heart`; aliases unresolved | Not in approved alias list. |
| B009 | 痰熱蒙閉心竅 | `APPROVE_CANONICAL` | proposed `pattern.phlegm_heat_obstructing_heart_orifices` | Decision Pack §3 overrides v1 subtype review. |
| B010 | 小腸實熱 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.small_intestine_excess_heat` | Decision Pack §4. |
| B011 | 小腸虛寒 | `HOLD_FOR_TING` | — | Explicit hold. |
| B012 | 肺氣虛 | `ENRICH_EXISTING` | `pattern.lung_qi_deficiency` | Frozen V1. |
| B013 | 肺陰虛 | `ENRICH_EXISTING` | `pattern.lung_yin_deficiency` | Frozen V1. |
| B014 | 肺燥／燥傷肺 | `HOLD_FOR_TING` | — | Pack approves specific warm/cool Dryness, not this umbrella. |
| B015 | 風寒犯肺 | `ADD_ALIAS` | `pattern.wind_cold_invading_lung` | Approved alias §15. |
| B016 | 風熱犯肺 | `ADD_ALIAS` | `pattern.wind_heat_invading_lung` | Approved alias §15. |
| B017 | 痰濕阻肺 | `ENRICH_EXISTING` | `pattern.phlegm_damp_in_lung` | Frozen V1. |
| B018 | 痰熱壅肺 | `ADD_ALIAS` | `pattern.phlegm_heat_in_lung` | Approved alias §15. |
| B019 | 寒痰阻肺 | `APPROVE_CANONICAL` | proposed `pattern.cold_phlegm_obstructing_lung` | Decision Pack §3. |
| B020 | 痰飲停肺／飲停於肺 | `HOLD_FOR_TING` | — | Tan-Yin namespace boundary unresolved. |
| B021 | 大腸實熱 | `APPROVE_CANONICAL` | proposed `pattern.large_intestine_excess_heat` | Decision Pack §3; distinct from Yang-Ming Fu. |
| B022 | 大腸津虧 | `APPROVE_CANONICAL` | proposed `pattern.large_intestine_fluid_deficiency` | Decision Pack §3. |
| B023 | 大腸濕熱 | `APPROVE_CANONICAL` | proposed `pattern.large_intestine_damp_heat` | Decision Pack §3. |
| B024 | 大腸虛寒／腸寒 | `TERMINOLOGY_REVIEW` | — | Split excess vs deficiency-Cold. |
| B025 | 脾氣虛 | `ENRICH_EXISTING` | `pattern.spleen_qi_deficiency` | Frozen V1. |
| B026 | 脾陽虛 | `ENRICH_EXISTING` | `pattern.spleen_yang_deficiency` | Frozen V1. |
| B027 | 中氣下陷／脾氣下陷 | `ADD_ALIAS` | `pattern.spleen_qi_sinking` | 脾氣下陷 approved alias. |
| B028 | 脾不統血／脾不攝血 | `HOLD_FOR_TING` | Existing `pattern.spleen_not_governing_blood`; alias unresolved | 脾不攝血 omitted from approved aliases. |
| B029 | 寒濕困脾 | `ENRICH_EXISTING` | `pattern.cold_damp_encumbering_spleen` | Already V1; no duplicate despite Pack approval wording. |
| B030 | 脾胃濕熱 | `ADD_ALIAS` | `pattern.damp_heat_spleen_stomach` | Approved alias §15. |
| B031 | 胃氣虛 | `APPROVE_CANONICAL` | proposed `pattern.stomach_qi_deficiency` | Decision Pack §3. |
| B032 | 胃寒 | `TERMINOLOGY_REVIEW` | — | Split 胃實寒 vs 胃虛寒. |
| B033 | 胃火 | `ENRICH_EXISTING` | `pattern.stomach_fire` | Locked distinct from Stomach Heat. |
| B034 | 胃陰虛／胃津不足 | `BROADER_NARROWER` | `pattern.stomach_yin_deficiency` + unresolved narrower concept | Decision Pack §4. |
| B035 | 胃氣上逆 | `HOLD_FOR_TING` | — | Explicit mechanism-versus-Pattern hold. |
| B036 | 飲食積滯／食積／食滯 | `ADD_ALIAS` | `pattern.food_stagnation` | 食積 approved alias. |
| B037 | 胃絡瘀血 | `BROADER_NARROWER` | `pattern.blood_stasis` + unresolved stomach location | Decision Pack §4. |
| B038 | 肝氣鬱結 | `ENRICH_EXISTING` | `pattern.liver_qi_stagnation` | Frozen V1. |
| B039 | 肝氣犯胃 | `BROADER_NARROWER` | broader `pattern.liver_stomach_disharmony` | Decision Pack §5; never hard-alias. |
| B040 | 肝脾不和 | `ENRICH_EXISTING` | `pattern.liver_spleen_disharmony` | Frozen V1. |
| B041 | 肝氣犯脾 | `BROADER_NARROWER` | broader `pattern.liver_spleen_disharmony` | Decision Pack §5; never hard-alias. |
| B042 | 肝血虛 | `ENRICH_EXISTING` | `pattern.liver_blood_deficiency` | Frozen V1. |
| B043 | 肝陰虛 | `ENRICH_EXISTING` | `pattern.liver_yin_deficiency` | Frozen V1. |
| B044 | 肝陽上亢 | `ENRICH_EXISTING` | `pattern.liver_yang_rising` | Frozen V1. |
| B045 | 肝火上炎／肝火 | `ENRICH_EXISTING` | `pattern.liver_fire` | Frozen V1; deprecated duplicate stays retired. |
| B046 | 肝風內動／肝風 | `ENRICH_EXISTING` | `pattern.liver_wind` | Frozen V1; deprecated duplicate stays retired. |
| B047 | 肝膽濕熱 | `ENRICH_EXISTING` | `pattern.liver_gallbladder_damp_heat` | Frozen V1. |
| B048 | 膽氣虛 | `APPROVE_CANONICAL` | proposed `pattern.gallbladder_qi_deficiency` | Decision Pack §3; source-complete dependency. |
| B049 | 膽腑濕熱 | `BROADER_NARROWER` | broader `pattern.liver_gallbladder_damp_heat` | Decision Pack §4. |
| B050 | 腎氣虛 | `APPROVE_CANONICAL` | proposed `pattern.kidney_qi_deficiency` | Category is not a clinical Pattern. |
| B051 | 腎氣不固 | `ENRICH_EXISTING` | `pattern.kidney_qi_not_firm` | Frozen V1. |
| B052 | 腎陽虛 | `ENRICH_EXISTING` | `pattern.kidney_yang_deficiency` | Frozen V1. |
| B053 | 腎陰虛 | `ENRICH_EXISTING` | `pattern.kidney_yin_deficiency` | Frozen V1. |
| B054 | 腎陰虛火旺 | `HOLD_FOR_TING` | — | Not explicitly resolved as an organ-specific subtype. |
| B055 | 腎精不足 | `ENRICH_EXISTING` | `pattern.kidney_essence_deficiency` | Frozen V1. |
| B056 | 腎不納氣 | `ENRICH_EXISTING` | `pattern.kidney_not_grasping_qi` | Frozen V1. |
| B057 | 腎陽虛水泛 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.kidney_yang_water_flooding` | Child of Kidney Yang Deficiency. |
| B058 | 膀胱濕熱 | `APPROVE_CANONICAL` | proposed `pattern.bladder_damp_heat` | Distinct from Lower-Jiao Damp-Heat. |
| B059 | 膀胱虛寒 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.bladder_deficiency_cold` | Decision Pack §4. |
| B060 | 熱入心包 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.heat_entering_pericardium` | Decision Pack §10. |
| B061 | 肺脾氣虛 | `APPROVE_CANONICAL` | proposed `pattern.lung_spleen_qi_deficiency` | Decision Pack §3. |
| B062 | 心肺氣虛 | `APPROVE_CANONICAL` | proposed `pattern.heart_lung_qi_deficiency` | Decision Pack §3. |
| B063 | 肺腎氣虛 | `APPROVE_CANONICAL` | proposed `pattern.lung_kidney_qi_deficiency` | Distinct from Kidney failing to grasp Qi. |
| B064 | 心脾兩虛／心脾氣血兩虛 | `ADD_ALIAS` | `pattern.heart_spleen_deficiency` | Alias approved only if mechanism matches. |
| B065 | 心肝血虛 | `APPROVE_CANONICAL` | proposed `pattern.heart_liver_blood_deficiency` | Decision Pack §3 overrides graph-only recommendation. |
| B066 | 心膽氣虛 | `APPROVE_CANONICAL` | proposed `pattern.heart_gallbladder_qi_deficiency` | Decision Pack §3. |
| B067 | 肝腎陰虛 | `APPROVE_CANONICAL` | proposed `pattern.liver_kidney_yin_deficiency` | Decision Pack §3. |
| B068 | 肝腎陰虛、肝陽上亢 | `HOLD_FOR_TING` | — | Multi-clause concept not explicitly resolved. |
| B069 | 肝腎陰虛、相火／虛火上炎 | `HOLD_FOR_TING` | — | Multi-clause concept not explicitly resolved. |
| B070 | 脾腎陽虛 | `ENRICH_EXISTING` | `pattern.spleen_kidney_yang_deficiency` | Frozen V1. |
| B071 | 脾腎陽虛、水濕內停 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B072 | 腎水上泛犯肺 | `HOLD_FOR_TING` | — | Organ/water mechanism not explicitly resolved. |
| B073 | 心陽虛、水氣凌心 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B074 | 肝火犯肺 | `APPROVE_CANONICAL` | proposed `pattern.liver_fire_scorching_lung` | Decision Pack §3. |
| B075 | 心腎陰虛 | `APPROVE_CANONICAL` | proposed `pattern.heart_kidney_yin_deficiency` | Explicitly distinct from 心腎不交. |
| B076 | 氣虛血瘀／氣虛血瘀阻絡 | `GRAPH_ONLY` | existing components; channel endpoint unresolved | Decision Pack Bi/root-branch composition. |
| B077 | 氣滯痰阻／氣鬱痰結 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B078 | 肝鬱痰氣交阻 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B079 | 風痰 | `APPROVE_CANONICAL` | proposed `pattern.wind_phlegm` | Mechanism-level clinical Pattern hub. |
| B080 | 濕痰／痰濕 | `ADD_ALIAS` | `pattern.phlegm_damp` | Approved alias §15. |
| B081 | 燥痰 | `TERMINOLOGY_REVIEW` | — | Decision Pack §7. |
| B082 | 脾虛生痰濕 | `HOLD_FOR_TING` | — | Progression not explicitly authorized for this concept. |
| B083 | 食積生痰 | `HOLD_FOR_TING` | — | Progression not explicitly authorized for this concept. |
| B084 | 血虛夾瘀 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B085 | 血虛寒凝 | `GRAPH_ONLY` | component Patterns/mechanisms | Decision Pack §4. |
| B086 | 熱與瘀血相結 | `HOLD_FOR_TING` | — | Generic combination not explicitly resolved. |
| B087 | 血熱妄行／迫血妄行 | `GRAPH_ONLY` | `pattern.blood_heat` + bleeding manifestation | Decision Pack §§10/12. |
| B088 | 陰虛火旺 | `GRAPH_ONLY` | Yin Deficiency → Deficiency Fire | Decision Pack §4. |
| B089 | 真寒假熱 | `APPROVE_CANONICAL` | proposed `pattern.true_cold_false_heat` | Decision Pack §8. |
| B090 | 寒熱錯雜 | `APPROVE_CANONICAL` | proposed `pattern.mixed_cold_heat` | Decision Pack §8. |
| B091 | 水飲內停／水濕泛濫 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B092 | 下焦水濕停滯 | `HOLD_FOR_TING` | — | Not explicitly resolved; location endpoint absent. |
| B093 | 風水相搏 | `TERMINOLOGY_REVIEW` | — | Decision Pack §7 Wind-Water. |
| B094 | 痰飲（generic） | `HOLD_FOR_TING` | — | Explicit namespace-boundary hold. |
| B095 | 津傷／津液虧損 | `GRAPH_ONLY` | unresolved fluid/substance state | Decision Pack §4. |
| B096 | 津液停滯 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| B097 | 肺熱傷津 | `HOLD_FOR_TING` | — | Proposed progression not explicitly resolved. |
| B098 | 胃火灼傷胃陰 | `HOLD_FOR_TING` | Existing endpoints, but semantic decision not granted | Not explicitly resolved. |
| B099 | 外風 | `REJECT_AS_PATTERN` | Existing taxonomy `pattern.wind_external` remains taxonomy | Decision Pack §7 rejects clinical Pattern identity. |
| B100 | 風寒 | `ENRICH_EXISTING` | `pattern.wind_cold` | Frozen V1. |
| B101 | 風熱 | `ENRICH_EXISTING` | `pattern.wind_heat` | Frozen V1. |
| B102 | 風寒束表、氣機不暢 | `HOLD_FOR_TING` | — | Formula-style compound not explicitly resolved. |
| B103 | 表寒裡熱 | `APPROVE_CANONICAL` | proposed `pattern.exterior_cold_interior_heat` | Decision Pack §8. |
| B104 | 風寒鬱閉化熱 | `HOLD_FOR_TING` | — | Transformation not explicitly resolved. |
| B105 | 溫燥傷肺 | `APPROVE_CANONICAL` | proposed `pattern.warm_dryness_attacking_lung` | Decision Pack §7. |
| B106 | 涼燥犯肺 | `APPROVE_CANONICAL` | proposed `pattern.cool_dryness_attacking_lung` | Decision Pack §7. |
| B107 | 風熱化燥／風熱夾燥 | `BROADER_NARROWER` | proposed relation to Wind-Heat and Dryness | Decision Pack approves 風熱兼燥 hierarchy review. |
| B108 | 暑濕 | `APPROVE_CANONICAL` | proposed `pattern.summerheat_dampness` | Decision Pack §7. |
| B109 | 濕熱初起／初犯 | `PROGRESSION_ONLY` | Damp-Heat stage statement | Decision Pack §7. |
| B110 | 下焦濕熱 | `ENRICH_EXISTING` | `pattern.damp_heat_lower_burner` | Frozen V1; San-Jiao framing may enrich. |
| B111 | 風寒濕痹 | `APPROVE_CANONICAL` | proposed `pattern.wind_cold_damp_bi` | Decision Pack §6. |
| B112 | 風濕痹阻 | `ENRICH_EXISTING` | `pattern.wind_damp_bi` | Decision Pack §6. |
| B113 | 風濕熱痹 | `BROADER_NARROWER` | compare `pattern.heat_bi` | Decision Pack §6. |
| B114 | 痹久化熱 | `HOLD_FOR_TING` | — | Progression not explicitly resolved. |
| B115 | 痰瘀痹阻 | `GRAPH_ONLY` | Phlegm + Blood Stasis + `tdis.bi_zheng` context | Decision Pack §6. |
| B116 | 氣滯血瘀痹阻 | `HOLD_FOR_TING` | — | Pack resolves 氣虛血瘀痹阻, not 氣滯血瘀痹阻. |
| B117 | 肝腎虧虛型痹證 | `TDIS_ONLY` | `tdis.bi_zheng` + existing deficiency Pattern(s) | Bi remains TCM disease/context family. |
| B118 | 氣血兩虛型痹證 | `TDIS_ONLY` | `tdis.bi_zheng` + `pattern.qi_blood_deficiency` | Bi remains TCM disease/context family. |
| B119 | 熱淋、石淋、氣淋、血淋、膏淋、勞淋 | `ENRICH_EXISTING` | six frozen V1 Lin Pattern IDs | `tdis.lin_zheng` remains separate disease. |
| B120 | 衝任不調 | `ENRICH_EXISTING` | `pattern.chong_ren_disharmony` | Frozen V1. |
| B121 | 衝任不足／衝任虛損 | `APPROVE_CANONICAL` | proposed `pattern.chong_ren_deficiency` | Decision Pack §12. |
| B122 | 衝任虛寒、氣血不足 | `GRAPH_ONLY` | Chong-Ren deficiency-Cold + Blood/Qi deficiency | Decision Pack §12. |
| B123 | 衝任虛寒、瘀血阻滯 | `GRAPH_ONLY` | Chong-Ren deficiency-Cold + Blood Stasis | Decision Pack §12. |
| B124 | 脾虛、衝任不固 | `GRAPH_ONLY` | Spleen deficiency + Chong instability | Decision Pack §12. |
| B125 | 衝任血熱 | `BROADER_NARROWER` | Blood Heat + unresolved Chong-Ren location | Decision Pack §12. |
| B126 | 肝火損傷衝任 | `HOLD_FOR_TING` | — | Damage semantic not explicitly resolved. |
| B127 | 胞宮虛寒 | `APPROVE_CANONICAL` | proposed `pattern.uterus_deficiency_cold` | Decision Pack §12. |
| B128 | 寒凝胞宮 | `APPROVE_CANONICAL` | proposed `pattern.cold_congealing_uterus` | Decision Pack §12 overrides graph-only recommendation. |
| B129 | 胞宮瘀血／瘀阻胞宮 | `APPROVE_CANONICAL` | proposed `pattern.uterus_blood_stasis` | Decision Pack §12 overrides location-only recommendation. |
| B130 | 氣滯血瘀（婦科／產後） | `CONTEXT_ONLY` | existing Pattern + gyne/postpartum context | Context does not change identity. |
| B131 | 脾陽不攝血、血熱迫血、血虛經少 | `HOLD_FOR_TING` | — | Grouped concept not explicitly resolved as one unit. |
| B132 | 產後血虛、產後血瘀、產後寒凝 | `CONTEXT_ONLY` | existing Patterns + postpartum context | Decision Pack §12. |
| B133 | 腎虛胎元不固、脾腎不足胎動不安、衝任不固 | `CONTEXT_ONLY` | existing/approved Patterns + pregnancy context | `TDIS_ENDPOINT_PENDING`. |

### 3B. Six Channels, Four Levels, San Jiao, and Eight Principles

| Ref | Concept | Final classification | Live/proposed ID | Authority note |
|---|---|---|---|---|
| G001 | 太陽中風 | `APPROVE_CANONICAL` | proposed `pattern.tai_yang_zhong_feng` | Decision Pack §9. |
| G002 | 太陽傷寒 | `APPROVE_CANONICAL` | proposed `pattern.tai_yang_shang_han` | Decision Pack §9; never alias Wind-Cold. |
| G003 | 陽明經證 | `APPROVE_CANONICAL` | proposed `pattern.yang_ming_channel` | Decision Pack §9. |
| G004 | 陽明腑證 | `APPROVE_CANONICAL` | proposed `pattern.yang_ming_fu` | Distinct from Large-Intestine Excess Heat. |
| G005 | 少陽證 | `APPROVE_CANONICAL` | proposed `pattern.shao_yang` | Decision Pack §9. |
| G006 | 太陰虛寒 | `APPROVE_CANONICAL` | proposed `pattern.tai_yin_deficiency_cold` | Never alias Spleen Yang Deficiency. |
| G007 | 少陰寒化 | `APPROVE_CANONICAL` | proposed `pattern.shao_yin_cold_transformation` | Never alias Kidney Yang Deficiency. |
| G008 | 少陰熱化 | `APPROVE_CANONICAL` | proposed `pattern.shao_yin_heat_transformation` | Never alias Heart-Kidney Yin Deficiency. |
| G009 | 厥陰寒熱錯雜 | `APPROVE_CANONICAL` | proposed `pattern.jue_yin_mixed_cold_heat` | Never alias generic Mixed Cold-Heat. |
| G010 | 衛分風熱 | `APPROVE_CANONICAL` | proposed `pattern.wei_stage_wind_heat` | Never alias Wind-Heat. |
| G011 | 氣分熱盛 | `APPROVE_CANONICAL` | proposed `pattern.qi_stage_heat` | Decision Pack §10. |
| G012 | 營分熱盛／熱入營分 | `APPROVE_CANONICAL` | proposed `pattern.ying_stage_heat` | Decision Pack §10. |
| G013 | 血分熱盛／熱入血分 | `APPROVE_CANONICAL` | proposed `pattern.xue_stage_heat` | Never alias generic Blood Heat. |
| G014 | 氣分濕熱 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.qi_stage_damp_heat` | Decision Pack §10. |
| G015 | 濕熱瀰漫三焦／三焦濕熱 | `APPROVE_CANONICAL` | proposed `pattern.san_jiao_damp_heat` | Decision Pack §11. |
| G016 | 中焦濕熱 | `LOCATION_ONLY` | `pattern.damp_heat_spleen_stomach` + unresolved middle-Jiao location | Decision Pack §11. |
| G017 | 下焦濕熱 | `ENRICH_EXISTING` | `pattern.damp_heat_lower_burner` | Exact V1 identity. |
| G018 | 太陽腑證／太陽蓄水 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.tai_yang_water_accumulation` | Terminology normalization is a dependency. |
| G019 | 太陽蓄血 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| G020 | 太陽少陽合病／併病 | `GRAPH_ONLY` | approved Tai-Yang + Shao-Yang endpoints | Decision Pack §9. |
| G021 | 少陽陽明合病 | `GRAPH_ONLY` | approved Shao-Yang + Yang-Ming endpoints | Decision Pack §9. |
| G022 | 厥陰寒證 | `HOLD_FOR_TING` | — | Explicit hold. |
| G023 | 厥陰熱證 | `HOLD_FOR_TING` | — | Explicit hold. |
| G024 | 衛分濕熱 | `APPROVE_CANONICAL_SUBTYPE` | proposed `pattern.wei_stage_damp_heat` | Source-stability dependency. |
| G025 | 氣分肺熱 | `BROADER_NARROWER` | Qi-stage Heat + Lung Heat framing | Decision Pack §10. |
| G026 | 氣分胃熱 | `BROADER_NARROWER` | compare `pattern.stomach_heat` | Never hard-alias. |
| G027 | 氣分腸熱 | `BROADER_NARROWER` | normalize against Qi-stage Intestinal Dry Heat | Decision Pack §10 terminology dependency. |
| G028 | 氣分膽熱／少陽膽熱 | `HOLD_FOR_TING` | — | Explicit hold. |
| G029 | 營分心包熱 | `HOLD_FOR_TING` | — | Pack approves 熱入心包 (B060), not a second identity. |
| G030 | 血分熱迫血妄行 | `GRAPH_ONLY` | Xue-stage Heat + bleeding manifestation | Decision Pack §10. |
| G031 | 血分熱與瘀結 | `GRAPH_ONLY` | Xue-stage Heat + Blood Stasis | Decision Pack §10. |
| G032 | 血分熱動風 | `PROGRESSION_ONLY` | Xue-stage Heat → Wind | Decision Pack §10. |
| G033 | 上焦熱證／上焦濕熱 | `LOCATION_ONLY` | Heat/Damp-Heat + unresolved upper-Jiao location | Pack explicitly resolves Upper-Jiao Heat; Damp-Heat wording gains no separate identity. |
| G034 | 上焦寒濕 | `LOCATION_ONLY` | Cold-Damp + unresolved upper-Jiao location | Decision Pack §11. |
| G035 | 中焦痰熱 | `LOCATION_ONLY` | Phlegm-Heat + unresolved middle-Jiao location | Decision Pack §11. |
| G036 | 中焦濕滯 | `LOCATION_ONLY` | Dampness + unresolved middle-Jiao location | Decision Pack §11. |
| G037 | 中焦陽虛 | `BROADER_NARROWER` | compare Spleen/Stomach Yang-deficiency Patterns | Decision Pack §11. |
| G038 | 中焦瘀血 | `LOCATION_ONLY` | Blood Stasis + unresolved middle-Jiao location | Decision Pack §11. |
| G039 | 下焦瘀血 | `LOCATION_ONLY` | Blood Stasis + unresolved lower-Jiao location | Decision Pack §11. |
| G040 | 下焦虛寒 | `BROADER_NARROWER` | compare Kidney/Spleen-Kidney Yang deficiency | Decision Pack §11. |
| G041 | 表裡俱熱 | `HOLD_FOR_TING` | — | Explicit hold. |
| G042 | 真熱假寒 | `HOLD_FOR_TING` | — | Explicit hold. |
| G043 | 虛實夾雜 | `GRAPH_ONLY` | deficiency + excess components | Decision Pack §8. |

### 3C. Extraordinary Vessels and Jing-Luo

| Ref | Concept | Final classification | Live/proposed ID | Authority note |
|---|---|---|---|---|
| H001 | 帶脈失約／帶脈失調 | `APPROVE_CANONICAL` | proposed `pattern.dai_mai_dysfunction` | Decision Pack §13. |
| H002 | 陰蹻脈失衡 | `APPROVE_CANONICAL` | proposed `pattern.yin_qiao_mai_imbalance` | Decision Pack §13. |
| H003 | 陽蹻脈失衡 | `APPROVE_CANONICAL` | proposed `pattern.yang_qiao_mai_imbalance` | Decision Pack §13. |
| H004 | 陽維脈失和 | `APPROVE_CANONICAL` | proposed `pattern.yang_wei_mai_disharmony` | Decision Pack §13. |
| H005 | 衝氣上逆 | `APPROVE_CANONICAL` | proposed `pattern.chong_mai_qi_rebellion` | Distinct from Stomach Qi Rebellion. |
| H006 | 經脈氣血痹阻 | `APPROVE_CANONICAL` | proposed `pattern.qi_blood_obstruction_channels` | Decision Pack §14. |
| H007 | 痰阻經絡 | `BROADER_NARROWER` | `pattern.phlegm` + unresolved channel endpoint | Decision Pack §14. |
| H008 | 瘀血阻絡／瘀阻經絡 | `BROADER_NARROWER` | `pattern.blood_stasis` + unresolved channel endpoint | Decision Pack §14. |
| H009 | 經筋拘急／經筋拘攣 | `CHANNEL_STATE_ONLY` | no canonical channel-state namespace | Decision Pack §14. |
| H010 | 衝任不足 | `APPROVE_CANONICAL` | same proposed `pattern.chong_ren_deficiency` as B121 | Duplicate cross-reference; excluded from counts. |
| H011 | 任脈虛損 | `REJECT_AS_PATTERN` | — | Decision Pack §13. |
| H012 | 督脈痹阻／督脈不通 | `HOLD_FOR_TING` | — | Explicit hold. |
| H013 | 陰維脈失和 | `HOLD_FOR_TING` | — | Explicit hold. |
| H014 | 寒凝經脈 | `BROADER_NARROWER` | Cold + unresolved channel endpoint | Decision Pack §14. |
| H015 | 風痰阻絡 | `BROADER_NARROWER` | approved Wind-Phlegm + unresolved channel endpoint | Decision Pack §14. |
| H016 | 經筋弛緩／不利 | `CHANNEL_STATE_ONLY` | no canonical channel-state namespace | Decision Pack §14. |
| H017 | 經脈熱盛 | `HOLD_FOR_TING` | — | Not explicitly resolved. |
| H018 | 任脈絡／督脈絡實證、虛證 | `CHANNEL_STATE_ONLY` | no canonical vessel/luo-state namespace | Decision Pack §14. |
| H019 | 十二正經虛實／氣血盛衰 | `CHANNEL_STATE_ONLY` | channel `code` exists; no canonical graph ID | Decision Pack §14. |
| H020 | 是動病／所生病 | `CHANNEL_STATE_ONLY` | no canonical channel-state namespace | Decision Pack §14. |
| H021 | 皮部／絡脈／經別病候 | `CHANNEL_STATE_ONLY` | no canonical channel-layer namespace | Decision Pack §14. |
| H022 | 奇經八脈交會穴／八脈交會配對 | `HOLD_FOR_TING` | — | Point-pair concept not explicitly resolved. |

### 3D. TCM disease and clinical context

| Ref | Concept | Final classification | Resolved endpoint/status | Authority note |
|---|---|---|---|---|
| I001 | 痹證／Bi syndrome | `TDIS_ONLY` | `tdis.bi_zheng` | Decision Pack’s illustrative `tdis.bi_syndrome` is not a live ID. |
| I002 | 痿證／Wei syndrome | `TDIS_ONLY` | `tdis.wei_zheng` | Live canonical endpoint. |
| I003 | 淋證／Lin syndrome | `TDIS_ONLY` | `tdis.lin_zheng` | Live canonical endpoint. |
| I004 | 不寐／insomnia | `TDIS_ONLY` | `tdis.bu_mei` | Live canonical endpoint. |
| I005 | 崩漏／月經過多等出血 context | `TDIS_ONLY` | `tdis.beng_lou` and related live menstrual `tdis.*` | Context does not define Pattern identity. |
| I006 | 帶下病 | `TDIS_ONLY` | `tdis.dai_xia_bing` | Live canonical endpoint. |
| I007 | 不孕／不育 | `TDIS_ONLY` | `tdis.bu_yun`, `tdis.bu_yu` | Keep sex-specific disease endpoints distinct. |
| I008 | 水腫 | `TDIS_ONLY` | `tdis.shui_zhong` | Disease is not a generic Water Pattern. |
| I009 | 胎動不安／先兆流產 context | `CONTEXT_ONLY` | `TDIS_ENDPOINT_PENDING` | No exact live canonical `tdis.*`; do not invent one. |
| I010 | 產後惡露不盡 context | `CONTEXT_ONLY` | `TDIS_ENDPOINT_PENDING` | No exact live canonical `tdis.*`. |
| I011 | 月經先期、後期、過多、過少、閉經、痛經 | `TDIS_ONLY` | matching live menstrual `tdis.*` records | Context layer only. |
| I012 | 麻木 | `TDIS_ONLY` | `tdis.ma_mu` | Live canonical endpoint. |
| I013 | 中風、顫證、面癱 | `TDIS_ONLY` | `tdis.zhong_feng`, `tdis.chan_zheng`, `tdis.mian_tan` | Live canonical endpoints. |
| I014 | Biomedical infertility, COPD, hypertension, etc. | `CONTEXT_ONLY` | canonical `cond.*` only when present | Biomedical diagnosis cannot determine Pattern identity. |
| I015 | Formula indication/syndrome strings | `HOLD_FOR_TING` | — | Not explicitly classified by the Decision Pack; never auto-promote. |

### 3E. Decision Pack directives not represented as separate 212-row concepts

These directives are applied without increasing the ledger or projected Pattern count:

- 熱痹 remains existing `pattern.heat_bi` → `ENRICH_EXISTING`; B113 separately reviews 風濕熱痹 as broader/narrower.
- 太陽陽明合病 → `GRAPH_ONLY`; no new ID. It was not a separate row in the v1 212 ledger.
- 少陽兼陽明裏實 is normalized under G021 → `GRAPH_ONLY`.
- 陽明津傷 is a `GRAPH_ONLY` stage/mechanism statement and is covered by the fluid-state handling of B095; it is not a second Pattern.
- 氣虛血瘀痹阻 is covered by B076 → `GRAPH_ONLY`; B116 is deliberately held because it says 氣滯, not 氣虛.
- 產後寒凝血瘀 is covered by B132 → `CONTEXT_ONLY`.
- 衝任虛損胎動不安 is covered by B133 → `CONTEXT_ONLY` with `TDIS_ENDPOINT_PENDING`.

`CROSS_SYSTEM_OVERLAP` has zero primary rows because the Decision Pack assigns the involved identities to canonical, broader/narrower, or enrichment classifications. The non-alias locks still require cross-system comparison/crosswalk handling and do not disappear.

## 4. Revised classification counts

H010 is excluded as the duplicate cross-reference to B121.

| Final classification | Count |
|---|---:|
| `APPROVE_CANONICAL` | 50 |
| `APPROVE_CANONICAL_SUBTYPE` | 7 |
| `ENRICH_EXISTING` | 34 |
| `ADD_ALIAS` | 8 |
| `BROADER_NARROWER` | 17 |
| `GRAPH_ONLY` | 14 |
| `PROGRESSION_ONLY` | 2 |
| `CROSS_SYSTEM_OVERLAP` | 0 |
| `LOCATION_ONLY` | 7 |
| `CHANNEL_STATE_ONLY` | 6 |
| `TDIS_ONLY` | 13 |
| `CONTEXT_ONLY` | 6 |
| `TERMINOLOGY_REVIEW` | 4 |
| `HOLD_FOR_TING` | 42 |
| `REJECT_AS_PATTERN` | 2 |
| **Total** | **212** |

## 5. Approved-candidate projected counts

Only `APPROVE_CANONICAL + APPROVE_CANONICAL_SUBTYPE` count as new Patterns:

- New canonical delta: `50 + 7 = 57`
- Projected registry total: `69 + 57 = 126`
  - taxonomy/category: `10 + 0 = 10`
  - clinical Patterns: `59 + 57 = 116`
- Projected library raw: `62 + 57 = 119`
  - active: `59 + 57 = 116`
  - deprecated: `3 + 0 = 3`
- Projected active reconciliation: `116/116`

Aliases, enrichment, broader/narrower, graph-only, progression, location, channel state, disease/context, terminology, hold, and reject classifications add zero Pattern IDs.

## 6. Live relation semantic audit

The live registry still contains 14 contracts only: condition→Pattern/TCM-disease/formula/point/medication, Pattern→formula/point/differential/symptom, comparison→member, clinical-case links, condition→symptom, TDIS→symptom, and symptom→Pattern inference. No relation type is added by this review.

| Proposed semantic | Closest existing live relation/field | Sufficient? | Real semantic gap? | Recommended action |
|---|---|---:|---:|---|
| Exact alias / lexical identity | `pattern_alias_map.json` | Yes, for exact identity only | No | Use only eight Decision Pack aliases in V2-A after string/source audit. |
| Pattern differential | `edge.pattern_differentials` | Yes | No | Reuse for genuine differentials; store once, never hand-mirror. |
| Comparison object membership | `edge.comparison_members` | Yes | No | Reuse in V2-H for display/comparison membership, not ontology identity. |
| Biomedical condition → Pattern | `edge.condition_patterns` | Yes, only for canonical `cond.*` | No | Reuse only when a live `cond.*` endpoint resolves; condition never determines Pattern identity. |
| Pattern → symptom | `edge.pattern_symptoms` | Yes | No | Reuse only with live `sym.*` IDs. |
| Symptom → Pattern inference | `edge.symptom_pattern_inference` | Yes, inferential only | No | Do not treat as reverse of Pattern→symptom. |
| Pattern → formula | `edge.pattern_formulas` | Yes | No | Reuse after formula IDs resolve. |
| Pattern → point | `edge.pattern_points` | Yes | No | Reuse after point IDs resolve. |
| Category membership | Ad hoc `members` / `member_of` fields | No | Yes | Keep review/staging only; decide whether fields are sufficient or a registered semantic is needed. |
| Broader / narrower / subtype | `edge.pattern_differentials` is closest | No | Yes | Do not overload differential; hold semantic edges until separate approval. |
| Progression / develops-into | Ad hoc `develops_into` field | No | Yes | Keep V2 review assertions staging-only; define authored side/reverse before any write. |
| Transformation / generates | None | No | Yes | No production edge; relation-governance decision required. |
| Damages / consumes / depletes | None | No | Yes | No production edge; do not encode as progression without approval. |
| Invades / affects organ | None | No | Yes | Blocked by both semantic gap and missing organ namespace. |
| Graph composition / multi-component Pattern | `edge.comparison_members` is closest display mechanism | No | Yes | Keep as structured review composition; do not mint flat Pattern or overload comparison. |
| Cross-system overlap / crosswalk | `edge.comparison_members` is closest | No | Yes | V2-H may compare records, but a semantic crosswalk requires separate approval. |
| Pattern ↔ TCM disease context | No live Pattern–TDIS relation | No | Yes | Keep context ledger only; do not repurpose condition or symptom relations. |
| Pattern ↔ channel/vessel | None | No | Yes | Blocked by missing canonical channel/vessel IDs and relation semantics. |
| Pattern ↔ Upper/Middle/Lower Jiao location | None | No | Yes | `LOCATION_ONLY`; wait for a canonical location namespace. |
| Pattern ↔ individual Six-Channel/Four-Level stage | `pattern_family` vocabulary only | No for individual stages | Yes | Family metadata may be used; explicit stage nodes/edges remain staging-only. |
| Channel-state attachment | None | No | Yes | Keep `CHANNEL_STATE_ONLY`; design outside Pattern identity work. |

True semantic gaps are therefore: hierarchy/subtype, progression/transformation/causation, multi-component composition, cross-system crosswalk, Pattern↔TDIS context, and Pattern↔organ/stage/channel/location. No expansion is authorized.

## 7. Endpoint audit

| Endpoint class | Live resolution | Status/action |
|---|---|---|
| Existing `pattern.*` | 69 registry records; 59 active clinical IDs | Resolved only for exact live IDs. |
| Proposed 57 `pattern.*` IDs | Not live | `STAGING_ONLY_ENDPOINT_UNRESOLVED` until an approved implementation batch creates and validates them. |
| TCM diseases | 75 live `tdis.*`; verified `tdis.bi_zheng`, `tdis.wei_zheng`, `tdis.lin_zheng`, `tdis.bu_mei`, `tdis.beng_lou`, `tdis.dai_xia_bing`, `tdis.bu_yun`, `tdis.bu_yu`, `tdis.shui_zhong`, `tdis.ma_mu`, `tdis.zhong_feng`, `tdis.chan_zheng`, `tdis.mian_tan` | Resolved for those exact IDs. `tdis.bi_syndrome`, `tdis.wei_syndrome`, and `tdis.insomnia` are not live IDs. |
| 胎動不安／先兆流產, 產後惡露不盡 TDIS | No exact live `tdis.*` | `TDIS_ENDPOINT_PENDING`; separate TCM-disease task. |
| Biomedical conditions | `edge.condition_patterns` requires `cond.*`; some live source records still use legacy `western_condition.*` | Resolve exact canonical `cond.*` per edge; otherwise `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Symptoms | Live `sym.*` data exists in `data/symptoms/symptoms.json` | Resolve every exact symptom ID before an edge. |
| Phlegm / Heat / Fire taxonomy | `pattern.phlegm`, `pattern.heat`, `pattern.fire` | Resolved taxonomy nodes, but not substitutes for clinical Patterns. |
| Dampness | No generic canonical endpoint | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. Damp-Heat and Phlegm-Damp are different entities. |
| Cold | No generic canonical endpoint | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Water / fluids / Jin-Ye | No generic canonical endpoint | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Blood substance | No generic Blood node | `STAGING_ONLY_ENDPOINT_UNRESOLVED`; Blood Deficiency/Heat/Stasis are separate Patterns. |
| Organs | No canonical `organ.*` registry | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. Unvalidated strings in cards are not endpoint authority. |
| Six-Channel/Four-Level stages | Family codes `liu_jing`, `wei_qi_ying_xue` exist; individual stage IDs do not | `STAGING_ONLY_ENDPOINT_UNRESOLVED` for stage edges. |
| Upper/Middle/Lower Jiao | Family code `san_jiao` exists; individual location IDs do not | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. Existing Lower-Jiao Damp-Heat is a Pattern, not a location node. |
| Primary channels | 12 records have `code` (`LU`…`LR`) but no graph `id` | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Extraordinary vessels | 8 records have `code` (`Du`, `Ren`, `Chong`, `Dai`, `Yangqiao`, `Yinqiao`, `Yangwei`, `Yinwei`) but no graph `id` | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Luo, sinew channel, cutaneous region, channel state | No canonical namespace | `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |
| Uterus / Chong-Ren location node | No separate canonical location namespace | Approved Pattern identities may include these terms, but external location edges remain `STAGING_ONLY_ENDPOINT_UNRESOLVED`. |

## 8. Remaining HOLD_FOR_TING

| Refs | Concepts |
|---|---|
| B008, B028 | 痰蒙／痰阻心竅 aliases; 脾不攝血 alias — omitted from approved alias list. |
| B011, B014, B020 | 小腸虛寒; 肺燥 umbrella; 痰飲停肺. |
| B035, B054 | 胃氣上逆; 腎陰虛火旺. |
| B068–B069, B071–B073 | 肝腎陰虛兼肝陽／虛火; 脾腎陽虛水停; 腎水犯肺; 水氣凌心. |
| B077–B078, B082–B084, B086 | 氣滯痰阻; 肝鬱痰氣; 脾虛生痰; 食積生痰; 血虛夾瘀; 熱瘀相結. |
| B091–B092, B094, B096–B098 | 水飲／水濕; 下焦水濕; generic 痰飲; 津液停滯; 肺熱傷津; 胃火傷陰. |
| B102, B104, B114, B116 | 風寒束表氣機不暢; 風寒化熱; 痹久化熱; 氣滯血瘀痹阻. |
| B126, B131 | 肝火損傷衝任; grouped menstrual mechanism concept. |
| G019, G022–G023, G028–G029 | 太陽蓄血; 厥陰寒／熱; 氣分膽熱; 營分心包熱. |
| G041–G042 | 表裡俱熱; 真熱假寒. |
| H012–H013, H017, H022 | 督脈痹阻; 陰維脈失和; 經脈熱盛; 奇經八脈交會穴／配對 concept. |
| `I015` | Formula indication/syndrome strings as a candidate class. |

Total: **42**. No proposed IDs are assigned to these rows.

## 9. Dependency-aware implementation plan

This is planning only. Every batch requires separate Ting authorization. Pattern deltas sum to `20 + 9 + 10 + 8 + 4 + 6 = 57`.

### V2-0 — Documentation hygiene

- **Exact scope:** correct only the stale V1 count note in `DECISIONS.md`; retain the frozen 69/62/59/3/59↔59 facts and link this v2 decision artifact.
- **Files expected to change:** `DECISIONS.md` only, in a separate documentation commit.
- **Dependencies:** confirm no concurrent owner is editing `DECISIONS.md`.
- **Pattern count delta:** `+0`.
- **Validator plan:** `git diff --check`; re-run read-only V1 registry/library audit.
- **Risk:** low, but governance wording must not imply implementation authorization.

### V2-A — V1 enrichment and true aliases

- **Exact enrichment scope:** B001–B006, B012–B013, B017, B025–B026, B029, B033, B038, B040, B042–B047, B051–B053, B055–B056, B070, B100–B101, B110/G017, B112, B119, B120 — all mapped to their existing live IDs in the ledger.
- **Exact alias scope:** 風寒犯肺 → `pattern.wind_cold_invading_lung`; 風熱犯肺 → `pattern.wind_heat_invading_lung`; 痰熱壅肺 → `pattern.phlegm_heat_in_lung`; 脾氣下陷 → `pattern.spleen_qi_sinking`; 脾胃濕熱 → `pattern.damp_heat_spleen_stomach`; 食積 → `pattern.food_stagnation`; 心脾氣血兩虛 → `pattern.heart_spleen_deficiency` only if mechanism matches; 濕痰 → `pattern.phlegm_damp`.
- **Files expected to change:** `data/pathology/pattern_library.json`, `data/config/pattern_alias_map.json`; generated artifacts only through the approved build owner/workflow.
- **Dependencies:** V2-0; source-string and alias collision audit; no shortening of existing cards.
- **Pattern count delta:** `+0`.
- **Validator plan:** baseline reconciliation audit; `validate-pattern-registry`, `validate-pattern-standard`, `build-data`, `validate-data`, `validate-content-junk`, `validate-interactions`, `git diff --check`; exact alias target-resolution check.
- **Risk:** medium—false aliasing is an identity error; B008/B028 remain excluded.

### V2-B — Core Zang-Fu and combined-organ Patterns

Exact proposed IDs (20):

1. 痰火擾心 — `pattern.phlegm_fire_disturbing_heart`
2. 痰熱蒙閉心竅 — `pattern.phlegm_heat_obstructing_heart_orifices`
3. 小腸實熱 — `pattern.small_intestine_excess_heat`
4. 大腸實熱 — `pattern.large_intestine_excess_heat`
5. 大腸津虧 — `pattern.large_intestine_fluid_deficiency`
6. 大腸濕熱 — `pattern.large_intestine_damp_heat`
7. 胃氣虛 — `pattern.stomach_qi_deficiency`
8. 膽氣虛 — `pattern.gallbladder_qi_deficiency`
9. 腎氣虛 — `pattern.kidney_qi_deficiency`
10. 腎陽虛水泛 — `pattern.kidney_yang_water_flooding`
11. 膀胱濕熱 — `pattern.bladder_damp_heat`
12. 膀胱虛寒 — `pattern.bladder_deficiency_cold`
13. 肺脾氣虛 — `pattern.lung_spleen_qi_deficiency`
14. 心肺氣虛 — `pattern.heart_lung_qi_deficiency`
15. 肺腎氣虛 — `pattern.lung_kidney_qi_deficiency`
16. 心肝血虛 — `pattern.heart_liver_blood_deficiency`
17. 心膽氣虛 — `pattern.heart_gallbladder_qi_deficiency`
18. 肝腎陰虛 — `pattern.liver_kidney_yin_deficiency`
19. 肝火犯肺 — `pattern.liver_fire_scorching_lung`
20. 心腎陰虛 — `pattern.heart_kidney_yin_deficiency`

- **Files expected to change:** `data/pathology/pattern_registry.json`, `data/pathology/pattern_library.json`; generated artifacts through approved build workflow.
- **Dependencies:** V2-A; proposed-ID collision audit; complete bilingual template; named sources; subtype parent validation for B010/B057/B059; Heart-Kidney non-merge lock.
- **Pattern count delta:** `+20` (`17 APPROVE_CANONICAL + 3 APPROVE_CANONICAL_SUBTYPE`).
- **Validator plan:** registry/library exact reconciliation; duplicate IDs; `validate-pattern-registry`, `validate-pattern-standard`, `build-data`, `validate-data`, `validate-content-junk`, `validate-interactions`, `git diff --check`; manual no-loss diff.
- **Risk:** high—combined-organ granularity, Gallbladder evidence, and subtype semantics.

### V2-C — Pathogen, Dryness, and selected mechanism Patterns

Exact proposed IDs (9):

1. 寒痰阻肺 — `pattern.cold_phlegm_obstructing_lung`
2. 風痰 — `pattern.wind_phlegm`
3. 真寒假熱 — `pattern.true_cold_false_heat`
4. 寒熱錯雜 — `pattern.mixed_cold_heat`
5. 表寒裡熱 — `pattern.exterior_cold_interior_heat`
6. 溫燥犯肺 — `pattern.warm_dryness_attacking_lung`
7. 涼燥犯肺 — `pattern.cool_dryness_attacking_lung`
8. 暑濕 — `pattern.summerheat_dampness`
9. 風寒濕痹 — `pattern.wind_cold_damp_bi`

- **Files expected to change:** Pattern registry/library; generated artifacts through approved build workflow.
- **Dependencies:** V2-B; pathogen family assignment; Dryness differentiation; `tdis.bi_zheng` kept as disease context, not Pattern parent.
- **Pattern count delta:** `+9`.
- **Validator plan:** same Pattern/build validators as V2-B plus differential coverage against Wind-Cold, Wind-Heat, Heat Bi, Wind-Damp Bi, Phlegm-Damp, and Phlegm-Heat.
- **Risk:** high—mixed Eight-Principle identities and Bi disease/Pattern boundary.

### V2-D — Six Channels

Exact proposed IDs (10):

1. 太陽中風 — `pattern.tai_yang_zhong_feng`
2. 太陽傷寒 — `pattern.tai_yang_shang_han`
3. 陽明經證 — `pattern.yang_ming_channel`
4. 陽明腑證 — `pattern.yang_ming_fu`
5. 少陽證 — `pattern.shao_yang`
6. 太陰虛寒 — `pattern.tai_yin_deficiency_cold`
7. 少陰寒化 — `pattern.shao_yin_cold_transformation`
8. 少陰熱化 — `pattern.shao_yin_heat_transformation`
9. 厥陰寒熱錯雜 — `pattern.jue_yin_mixed_cold_heat`
10. 太陽蓄水 — `pattern.tai_yang_water_accumulation`

- **Files expected to change:** Pattern registry/library; generated artifacts.
- **Dependencies:** V2-C; use existing family code `liu_jing`; normalize 太陽蓄水 terminology; enforce all cross-system non-alias locks.
- **Pattern count delta:** `+10` (`9 canonical + 1 subtype`).
- **Validator plan:** standard Pattern/build validators; family-vocabulary validation; explicit collision/differential checks against Wind-Cold, Spleen Yang Deficiency, Kidney Yang Deficiency, Heart-Kidney Yin Deficiency, and generic Mixed Cold-Heat.
- **Risk:** high—classical-stage identity must not be collapsed into Zang-Fu or pathogen Patterns.

### V2-E — Four Levels and San Jiao

Exact proposed IDs (8):

1. 衛分風熱 — `pattern.wei_stage_wind_heat`
2. 氣分熱 — `pattern.qi_stage_heat`
3. 營分熱 — `pattern.ying_stage_heat`
4. 血分熱 — `pattern.xue_stage_heat`
5. 氣分濕熱 — `pattern.qi_stage_damp_heat`
6. 衛分濕熱 — `pattern.wei_stage_damp_heat`
7. 三焦濕熱 — `pattern.san_jiao_damp_heat`
8. 熱入心包 — `pattern.heat_entering_pericardium`

- **Files expected to change:** Pattern registry/library; generated artifacts.
- **Dependencies:** V2-D; family codes `wei_qi_ying_xue` and `san_jiao`; source-stability gate for 衛分濕熱; no individual stage/location graph IDs; Xue-stage Heat ≠ Blood Heat.
- **Pattern count delta:** `+8` (`5 canonical + 3 subtypes`).
- **Validator plan:** standard Pattern/build validators; family checks; differential checks for Wind-Heat, Stomach Heat, Blood Heat, Phlegm-Misting Heart, and Lower-Jiao Damp-Heat.
- **Risk:** high—cross-system overlap and absent stage/location endpoint namespaces.

### V2-F — Gynecology, Chong-Ren, and Uterus

Exact proposed IDs (4):

1. 衝任虛損 — `pattern.chong_ren_deficiency`
2. 胞宮虛寒 — `pattern.uterus_deficiency_cold`
3. 寒凝胞宮 — `pattern.cold_congealing_uterus`
4. 胞宮血瘀 — `pattern.uterus_blood_stasis`

- **Files expected to change:** Pattern registry/library; generated artifacts.
- **Dependencies:** V2-E; keep `pattern.chong_ren_disharmony` distinct; pregnancy/postpartum contexts remain context-only; missing TDIS endpoints do not block Pattern cards.
- **Pattern count delta:** `+4`.
- **Validator plan:** standard Pattern/build validators; differential checks among Chong-Ren Disharmony/Deficiency, Uterus Deficiency-Cold/Cold Congealing, and generic Blood Stasis; no biomedical identity inference.
- **Risk:** high—location inside Pattern identity versus future location ontology; reproductive safety/source sensitivity.

### V2-G — Extraordinary Vessels and Jing-Luo

Exact proposed IDs (6):

1. 帶脈失調 — `pattern.dai_mai_dysfunction`
2. 陰蹻脈失調 — `pattern.yin_qiao_mai_imbalance`
3. 陽蹻脈失調 — `pattern.yang_qiao_mai_imbalance`
4. 陽維脈失調 — `pattern.yang_wei_mai_disharmony`
5. 衝脈氣逆 — `pattern.chong_mai_qi_rebellion`
6. 經絡氣血痹阻 — `pattern.qi_blood_obstruction_channels`

- **Files expected to change:** Pattern registry/library; generated artifacts. Do not edit channel records merely to make edges possible.
- **Dependencies:** V2-F; strong named sources; no invented vessel-specific tongue/pulse; current channel/vessel `code` values are not graph IDs.
- **Pattern count delta:** `+6`.
- **Validator plan:** standard Pattern/build validators; family `jing_luo`; differential checks against Stomach Qi Rebellion, Shao-Yang, Yang-Wei disharmony, Bi disease, and Wind-Phlegm; ensure no unresolved channel code is stored as a canonical graph target.
- **Risk:** highest clinical-evidence risk; extraordinary-vessel manifestations can easily become unsourced templates.

### V2-H — Differential comparison objects

- **Exact proposed comparison scope (15 objects; Pattern delta 0):**
  1. Stomach Heat ↔ Stomach Fire.
  2. Heart-Kidney Not Communicating ↔ Heart-Kidney Yin Deficiency.
  3. Kidney Yang Deficiency ↔ Kidney Yang Water Flooding.
  4. Phlegm Misting Heart ↔ Phlegm-Fire Disturbing Heart ↔ Phlegm-Heat Obstructing Heart Orifices.
  5. Wind-Damp Bi ↔ Heat Bi ↔ Wind-Cold-Damp Bi.
  6. Yang-Ming Channel ↔ Stomach Heat.
  7. Yang-Ming Fu ↔ Large-Intestine Excess Heat.
  8. Tai-Yang Shang-Han ↔ Wind-Cold.
  9. Wei-stage Wind-Heat ↔ Wind-Heat.
  10. Tai-Yin Deficiency-Cold ↔ Spleen Yang Deficiency.
  11. Shao-Yin Cold Transformation ↔ Kidney Yang Deficiency.
  12. Shao-Yin Heat Transformation ↔ Heart-Kidney Yin Deficiency.
  13. Xue-stage Heat ↔ Blood Heat.
  14. Shao-Yang ↔ Yang-Wei Mai Disharmony.
  15. Jue-Yin Mixed Cold-Heat ↔ generic Mixed Cold-Heat.
- **Files expected to change:** `data/knowledge/comparisons.json`; generated artifacts. Use `edge.comparison_members`; use `edge.pattern_differentials` only for true differential links.
- **Dependencies:** V2-B through V2-G endpoint creation and source-complete comparison rows.
- **Pattern count delta:** `+0`; proposed comparison-object delta `+15`.
- **Validator plan:** `validate-comparison-standard`, `validate-relations`, `validate-relation-registry`, build/data/interactions validators, endpoint resolution, symmetric-differential no-hand-mirror audit.
- **Risk:** medium-high—comparison membership must not be interpreted as identity, subtype, or crosswalk.

### V2-I — Relationship graph

- **Exact staged semantic scope:**
  - broader/narrower refs: B034, B037, B039, B041, B049, B107, B113, B125, G025–G027, G037, G040, H007–H008, H014–H015;
  - graph-only refs: B076, B085, B087–B088, B095, B115, B122–B124, G020–G021, G030–G031, G043;
  - progression-only refs: B109, G032;
  - location-only refs: G016, G033–G036, G038–G039;
  - channel-state-only refs: H009, H016, H018–H021;
  - TDIS/context refs: B117–B118, B130, B132–B133, I001–I014.
- **Proposed IDs:** none. Every endpoint must resolve to a live canonical ID first.
- **Files expected to change:** none until Ting separately approves relation semantics. If later approved: `data/config/relation_registry.json` only for sanctioned contracts, then the single authored-side canonical data files; never hand-write reverse edges.
- **Dependencies:** V2-H; all new Pattern endpoints live; TDIS/condition/symptom/channel/location audits; explicit authored-side/reverse rules; separate approval for every real semantic gap.
- **Pattern count delta:** `+0`.
- **Validator plan:** `validate-relation-registry`, `validate-relations`, full endpoint resolution, one-authored-side audit, reverse derivation audit, build/data/interactions validators, `git diff --check`.
- **Risk:** highest architectural risk. Current live relations are insufficient for most staged semantics; no relation type may be added by inference.

## 10. STOP

The revised review and plan stop here. No implementation, alias write, relation expansion, endpoint creation, schema modification, migration, or Pattern V2 commit is authorized by this artifact.

# AcuTing OS — Pattern V2 Final Canonical Decision Pack
## Human canonical gate for Codex

**Date:** 2026-08-08  
**Decision authority:** Ting + ChatGPT canonical review  
**Applies to:** Pattern V2 research corpus Batch 02–10 and Codex reconciliation work  
**Status:** AUTHORITATIVE REVIEW DECISIONS — NOT YET IMPLEMENTATION AUTHORIZATION

---

# 0. Authority and precedence

1. Live frozen V1 repository state remains the authority for existing IDs and current data.
2. This decision pack is the authority for V2 candidate classification decisions named here.
3. Batch 02–10 remain research/source evidence.
4. Older agent recommendations that conflict with this file are superseded.
5. Any candidate not explicitly resolved here remains `HOLD_FOR_TING`.

This file authorizes **reclassification and implementation planning only**, not production changes.

---

# 1. Frozen V1 boundary

```text
Registry total = 69
  taxonomy/category = 10
  clinical level:"pattern" = 59

Library raw = 62
  active canonical = 59
  deprecated historical = 3

Active clinical registry ↔ active library = 59/59
```

Known completion baseline includes commit `c8a5ea7`.

Locked V1 decisions:
- `pattern.stomach_heat` and `pattern.stomach_fire` remain distinct.
- `pattern.heart_kidney_not_communicating` is the canonical 心腎不交 identity.
- Heart-Kidney Yin Deficiency 心腎陰虛 is distinct from 心腎不交.
- the 3 deprecated records remain historical provenance.
- no V1 canonical ID is silently renamed or merged.

---

# 2. Decision vocabulary

```text
APPROVE_CANONICAL
APPROVE_CANONICAL_SUBTYPE
ENRICH_EXISTING
ADD_ALIAS
BROADER_NARROWER
GRAPH_ONLY
PROGRESSION_ONLY
CROSS_SYSTEM_OVERLAP
LOCATION_ONLY
CHANNEL_STATE_ONLY
TDIS_ONLY
CONTEXT_ONLY
TERMINOLOGY_REVIEW
HOLD_FOR_TING
REJECT_AS_PATTERN
```

---

# 3. Core Zang-Fu / combined-organ decisions

| Chinese | English | Decision | Notes |
|---|---|---|---|
| 腎氣虛 | Kidney Qi Deficiency | **APPROVE_CANONICAL** | Stable parent-level Kidney deficiency Pattern. |
| 肝腎陰虛 | Liver-Kidney Yin Deficiency | **APPROVE_CANONICAL** | Stable combined-organ Pattern. |
| 心腎陰虛 | Heart-Kidney Yin Deficiency | **APPROVE_CANONICAL** | Distinct from 心腎不交. |
| 心肝血虛 | Heart-Liver Blood Deficiency | **APPROVE_CANONICAL** | Stable combined-organ deficiency Pattern if source-complete. |
| 肺脾氣虛 | Lung-Spleen Qi Deficiency | **APPROVE_CANONICAL** | Stable combined-organ Pattern. |
| 肺腎氣虛 | Lung-Kidney Qi Deficiency | **APPROVE_CANONICAL** | Keep distinct from Kidney Failing to Grasp Qi. |
| 心肺氣虛 | Heart-Lung Qi Deficiency | **APPROVE_CANONICAL** | Stable combined-organ Pattern. |
| 心膽氣虛 | Heart-Gallbladder Qi Deficiency | **APPROVE_CANONICAL** | Stable combined-organ Pattern. |
| 肝火犯肺 | Liver Fire Scorching Lung | **APPROVE_CANONICAL** | Cross-organ Pattern. |
| 胃氣虛 | Stomach Qi Deficiency | **APPROVE_CANONICAL** | Stable Zang-Fu deficiency Pattern. |
| 膽氣虛 | Gallbladder Qi Deficiency | **APPROVE_CANONICAL** | Preserve if standard-source manifestations support it. |
| 大腸濕熱 | Large Intestine Damp-Heat | **APPROVE_CANONICAL** | Distinct bowel-location Pattern. |
| 大腸實熱 | Large Intestine Excess Heat | **APPROVE_CANONICAL** | Distinct from Yang Ming Fu. |
| 大腸津虧 | Large Intestine Fluid Deficiency | **APPROVE_CANONICAL** | Stable bowel-fluid deficiency Pattern. |
| 膀胱濕熱 | Bladder Damp-Heat | **APPROVE_CANONICAL** | Distinct from Lower Jiao Damp-Heat. |
| 寒濕困脾 | Cold-Damp Encumbering Spleen | **APPROVE_CANONICAL** | Stable Spleen Pattern. |
| 寒痰阻肺 | Cold-Phlegm Obstructing Lung | **APPROVE_CANONICAL** | Stable Lung Pattern. |
| 痰火擾心 | Phlegm-Fire Disturbing Heart | **APPROVE_CANONICAL** | Distinct from Phlegm Misting Heart. |
| 痰熱蒙閉心竅 | Phlegm-Heat Obstructing Heart Orifices | **APPROVE_CANONICAL** | Distinct closed-orifice/Heat presentation. |
| 腎陽虛水泛 | Kidney Yang Deficiency with Water Flooding | **APPROVE_CANONICAL_SUBTYPE** | Child of Kidney Yang Deficiency. |
| 風痰 | Wind-Phlegm | **APPROVE_CANONICAL** | Mechanism-level clinical Pattern hub. |

---

# 4. Zang-Fu / mechanism concepts not approved as flat canonicals yet

| Chinese | English | Decision | Reason |
|---|---|---|---|
| 胃寒 | Stomach Cold | **TERMINOLOGY_REVIEW** | Split Excess Cold Attacking Stomach vs Stomach Deficiency-Cold. |
| 胃氣上逆 | Rebellious Stomach Qi | **HOLD_FOR_TING** | Pattern vs functional mechanism boundary. |
| 津傷 / 津液不足 | Fluid Injury / Fluid Deficiency | **GRAPH_ONLY** | Substance-state/mechanism. |
| 胃津不足 | Stomach Fluid Deficiency | **BROADER_NARROWER** | Compare with existing Stomach Yin Deficiency. |
| 痰飲 | Tan Yin / Congested Fluids | **HOLD_FOR_TING** | Pattern vs fluid-pathology / TCM disease namespace. |
| 陰虛火旺 | Yin Deficiency with Fire Flaring | **GRAPH_ONLY** | Prefer Yin Deficiency → Deficiency Fire. |
| 胃絡瘀血 | Blood Stasis in Stomach | **BROADER_NARROWER** | Test Blood Stasis + Stomach location first. |
| 血虛寒凝 | Blood Deficiency with Cold Stagnation | **GRAPH_ONLY** | Prefer composition. |
| 大腸寒 / 大腸虛寒 | Large Intestine Cold / Deficiency-Cold | **TERMINOLOGY_REVIEW** | Distinguish Excess vs Deficiency-Cold. |
| 小腸虛寒 | Small Intestine Deficiency-Cold | **HOLD_FOR_TING** | Stronger evidence needed. |
| 小腸實熱 | Small Intestine Excess Heat | **APPROVE_CANONICAL_SUBTYPE** | Accept if source-complete and not duplicative. |
| 膀胱虛寒 | Bladder Deficiency-Cold | **APPROVE_CANONICAL_SUBTYPE** | Bladder-specific subtype if source-complete. |
| 膽腑濕熱 | Gallbladder Damp-Heat | **BROADER_NARROWER** | Compare with Liver-GB Damp-Heat. |

---

# 5. Liver cross-organ / subtype decisions

## 肝氣犯胃
**Decision:** `BROADER_NARROWER`

Do not hard-alias automatically to `pattern.liver_stomach_disharmony`.

Preferred ontology if V1 is broader:

```text
Liver-Stomach Disharmony 肝胃不和
    broader_than
Liver Qi Invading Stomach 肝氣犯胃
```

## 肝氣犯脾
**Decision:** `BROADER_NARROWER`

Compare against existing Liver-Spleen Disharmony rather than auto-aliasing.

---

# 6. Bi syndrome decisions

`Bi 痹` remains a TCM disease/context family, not an invented Pattern parent node.

```text
tdis.bi_syndrome
    may_have_pattern
      ├─ existing pattern.wind_damp_bi
      ├─ existing pattern.heat_bi
      ├─ Wind-Cold-Damp Bi
      └─ other approved Bi Patterns
```

| Chinese | English | Decision | Notes |
|---|---|---|---|
| 風寒濕痹 | Wind-Cold-Damp Bi | **APPROVE_CANONICAL** | Stable Bi Pattern. |
| 風濕熱痹 | Wind-Damp-Heat Bi | **BROADER_NARROWER** | Compare with existing `pattern.heat_bi`. |
| 風濕痹阻 | Wind-Damp Bi | **ENRICH_EXISTING** | Existing V1 Pattern. |
| 熱痹 | Heat Bi | **ENRICH_EXISTING** | Existing V1 Pattern. |
| 痰瘀痹阻 | Phlegm-Blood Stasis Bi Obstruction | **GRAPH_ONLY** | Composition + Bi context. |
| 氣虛血瘀痹阻 | Qi Deficiency + Blood Stasis Bi | **GRAPH_ONLY** | Root/branch composition. |

---

# 7. Exterior / seasonal / dryness decisions

| Chinese | English | Decision |
|---|---|---|
| 暑濕 | Summerheat-Dampness | **APPROVE_CANONICAL** |
| 溫燥犯肺 | Warm-Dryness Attacking Lung | **APPROVE_CANONICAL** |
| 涼燥犯肺 | Cool-Dryness Attacking Lung | **APPROVE_CANONICAL** |
| 風熱兼燥 | Wind-Heat with Dryness | **BROADER_NARROWER** |
| 外風 | External Wind | **REJECT_AS_PATTERN** |
| 濕熱初起 | Early Damp-Heat | **PROGRESSION_ONLY** |
| 風水 | Wind-Water | **TERMINOLOGY_REVIEW** |
| 燥痰 | Dry-Phlegm | **TERMINOLOGY_REVIEW** |

---

# 8. Eight-Principle compound decisions

| Chinese | English | Decision |
|---|---|---|
| 寒熱錯雜 | Mixed Cold and Heat | **APPROVE_CANONICAL** |
| 表寒裏熱 / 外寒裏熱 | Exterior Cold with Interior Heat | **APPROVE_CANONICAL** |
| 真寒假熱 | True Cold with False Heat | **APPROVE_CANONICAL** |
| 真熱假寒 | True Heat with False Cold | **HOLD_FOR_TING** |
| 表裏俱熱 / 表裏實熱 | Exterior-Interior Heat Excess | **HOLD_FOR_TING** |
| 虛實夾雜 | Mixed Deficiency and Excess | **GRAPH_ONLY** |

---

# 9. Six-Channel canonical decisions

The following nine are approved as first-class Pattern identities:

| Chinese | English | Decision |
|---|---|---|
| 太陽中風 | Tai Yang Zhong Feng | **APPROVE_CANONICAL** |
| 太陽傷寒 | Tai Yang Shang Han | **APPROVE_CANONICAL** |
| 陽明經證 | Yang Ming Channel Pattern | **APPROVE_CANONICAL** |
| 陽明腑證 | Yang Ming Fu-Organ Pattern | **APPROVE_CANONICAL** |
| 少陽證 | Shao Yang Pattern | **APPROVE_CANONICAL** |
| 太陰虛寒 | Tai Yin Deficiency-Cold | **APPROVE_CANONICAL** |
| 少陰寒化證 | Shao Yin Cold Transformation | **APPROVE_CANONICAL** |
| 少陰熱化證 | Shao Yin Heat Transformation | **APPROVE_CANONICAL** |
| 厥陰寒熱錯雜 | Jue Yin Mixed Cold and Heat | **APPROVE_CANONICAL** |

Other Six-Channel decisions:
- 太陽蓄水 / 太陽腑水蓄 → **APPROVE_CANONICAL_SUBTYPE** if terminology normalized.
- 太陽陽明合病 → **GRAPH_ONLY**
- 太陽少陽合病 → **GRAPH_ONLY**
- 少陽兼陽明裏實 → **GRAPH_ONLY**
- 厥陰寒 → **HOLD_FOR_TING**
- 厥陰熱 → **HOLD_FOR_TING**
- 陽明津傷 → **GRAPH_ONLY**

---

# 10. Four-Level / Wei-Qi-Ying-Xue decisions

| Chinese | English | Decision |
|---|---|---|
| 衛分風熱 | Wei-Stage Wind-Heat | **APPROVE_CANONICAL** |
| 氣分熱 | Qi-Stage Heat | **APPROVE_CANONICAL** |
| 營分熱 | Ying-Stage Heat | **APPROVE_CANONICAL** |
| 血分熱 | Xue-Stage Heat | **APPROVE_CANONICAL** |
| 氣分濕熱 | Qi-Stage Damp-Heat | **APPROVE_CANONICAL_SUBTYPE** |
| 衛分濕熱 | Wei-Stage Damp-Heat | **APPROVE_CANONICAL_SUBTYPE** if source-stable |
| 氣分肺熱 | Qi-Stage Lung Heat | **BROADER_NARROWER** |
| 氣分胃熱 | Qi-Stage Stomach Heat | **BROADER_NARROWER** |
| 氣分腸燥熱 | Qi-Stage Intestinal Dry Heat | **BROADER_NARROWER** |
| 氣分膽熱 | Qi-Stage Gallbladder Heat | **HOLD_FOR_TING** |
| 熱入心包 | Heat Entering Pericardium | **APPROVE_CANONICAL_SUBTYPE** |
| 血分熱迫血妄行 | Xue Heat with Reckless Bleeding | **GRAPH_ONLY** |
| 血分熱兼血瘀 | Xue Heat with Blood Stasis | **GRAPH_ONLY** |
| 血分熱動風 | Xue Heat Generating Wind | **PROGRESSION_ONLY** |

**Lock:** Xue-stage Heat 血分熱 ≠ generic Blood Heat 血熱.

---

# 11. San Jiao decisions

| Chinese | English | Decision |
|---|---|---|
| 三焦濕熱 | San Jiao Damp-Heat | **APPROVE_CANONICAL** |
| 中焦濕熱 | Middle Jiao Damp-Heat | **LOCATION_ONLY** |
| 下焦濕熱 | Lower Jiao Damp-Heat | **ENRICH_EXISTING** |
| 上焦熱 | Upper Jiao Heat | **LOCATION_ONLY** |
| 上焦寒濕 | Upper Jiao Cold-Damp | **LOCATION_ONLY** |
| 中焦痰熱 | Middle Jiao Phlegm-Heat | **LOCATION_ONLY** |
| 中焦濕滯 | Middle Jiao Damp Stagnation | **LOCATION_ONLY** |
| 中焦陽虛 | Middle Jiao Yang Deficiency | **BROADER_NARROWER** |
| 中焦血瘀 | Middle Jiao Blood Stasis | **LOCATION_ONLY** |
| 下焦血瘀 | Lower Jiao Blood Stasis | **LOCATION_ONLY** |
| 下焦虛寒 | Lower Jiao Deficiency-Cold | **BROADER_NARROWER** |

---

# 12. Gynecology / Chong-Ren / Uterus decisions

| Chinese | English | Decision |
|---|---|---|
| 衝任虛損 | Chong-Ren Deficiency | **APPROVE_CANONICAL** |
| 寒凝胞宮 | Cold Congealing the Uterus | **APPROVE_CANONICAL** |
| 胞宮虛寒 | Uterus Deficiency-Cold | **APPROVE_CANONICAL** |
| 胞宮血瘀 | Blood Stasis in the Uterus | **APPROVE_CANONICAL** |
| 衝任血熱 | Blood Heat in Chong-Ren | **BROADER_NARROWER** |
| 血熱妄行 | Blood Heat with Reckless Bleeding | **GRAPH_ONLY** |
| 脾虛衝脈不固 | Spleen Deficiency with Chong Instability | **GRAPH_ONLY** |
| 衝任虛寒兼血虛 | Chong-Ren Deficiency-Cold + Blood Deficiency | **GRAPH_ONLY** |
| 衝任虛寒兼血瘀 | Chong-Ren Deficiency-Cold + Blood Stasis | **GRAPH_ONLY** |
| 產後寒凝血瘀 | Postpartum Cold Blood Stasis | **CONTEXT_ONLY** |
| 產後血虛 | Postpartum Blood Deficiency | **CONTEXT_ONLY** |
| 產後血瘀 | Postpartum Blood Stasis | **CONTEXT_ONLY** |
| 腎虛胎元不固 | Kidney Deficiency with Fetal Instability | **CONTEXT_ONLY** |
| 衝任虛損胎動不安 | Chong-Ren Deficiency with Fetal Restlessness | **CONTEXT_ONLY** |

---

# 13. Extraordinary Vessel decisions

| Chinese | English | Decision |
|---|---|---|
| 帶脈失約 / 帶脈失調 | Dai Mai Dysfunction | **APPROVE_CANONICAL** |
| 陰蹻脈失調 | Yin Qiao Mai Imbalance | **APPROVE_CANONICAL** |
| 陽蹻脈失調 | Yang Qiao Mai Imbalance | **APPROVE_CANONICAL** |
| 陽維脈失調 | Yang Wei Mai Disharmony | **APPROVE_CANONICAL** |
| 衝氣上逆 / 衝脈氣逆 | Chong Mai Qi Rebellion | **APPROVE_CANONICAL** |
| 陰維脈失調 | Yin Wei Mai Disharmony | **HOLD_FOR_TING** |
| 督脈痹阻 / 督脈不利 | Du Mai Obstruction | **HOLD_FOR_TING** |
| 任脈虛 / 任脈不足 | Ren Mai Deficiency | **REJECT_AS_PATTERN** for now |

Do not invent vessel-specific tongue/pulse.

---

# 14. Channel / Jing-Luo decisions

| Chinese | English | Decision |
|---|---|---|
| 經絡氣血痹阻 | Qi-Blood Obstruction of the Channels | **APPROVE_CANONICAL** |
| 痰阻經絡 | Phlegm Obstructing the Channels | **BROADER_NARROWER** |
| 血瘀阻絡 | Blood Stasis Obstructing Channels | **BROADER_NARROWER** |
| 寒凝經脈 | Cold Obstructing Channels | **BROADER_NARROWER** |
| 風痰阻絡 | Wind-Phlegm Obstructing Channels | **BROADER_NARROWER** |

Structured channel-state only:
- 經筋拘急 Sinew-Channel Contraction → **CHANNEL_STATE_ONLY**
- 經筋弛緩 → **CHANNEL_STATE_ONLY**
- Luo excess/deficiency → **CHANNEL_STATE_ONLY**
- Shi-Dong / Suo-Sheng sets → **CHANNEL_STATE_ONLY**
- individual channel excess/deficiency → **CHANNEL_STATE_ONLY**
- cutaneous-region manifestations → **CHANNEL_STATE_ONLY**

---

# 15. Alias decisions

Approved aliases, assuming live Chinese identity matches:
- 濕痰 / Damp-Phlegm → existing Phlegm-Damp
- 食積 / Food Accumulation → existing Food Stagnation
- 痰熱壅肺 → existing Phlegm-Heat in Lung
- 脾胃濕熱 → existing Spleen-Stomach Damp-Heat
- 風熱犯肺 → existing Wind-Heat Invading Lung
- 風寒犯肺 → existing Wind-Cold Invading Lung
- 心脾氣血兩虛 → existing Heart-Spleen Deficiency if mechanism matches
- 脾氣下陷 → existing Spleen Qi Sinking / 中氣下陷

Not approved as hard aliases:
- 肝氣犯胃 → 肝胃不和
- 肝氣犯脾 → 肝脾不和

---

# 16. Cross-system non-alias locks

Never hard-alias:
- Yang Ming Jing ↔ Qi-stage Stomach Heat ↔ Stomach Heat
- Yang Ming Fu ↔ Qi-stage Intestinal Dry Heat ↔ Large Intestine Excess Heat
- Tai Yang Shang Han ↔ Wind-Cold
- Wei-stage Wind-Heat ↔ Wind-Heat
- Tai Yin Deficiency-Cold ↔ Spleen Yang Deficiency
- Shao Yin Cold ↔ Kidney Yang Deficiency
- Shao Yin Heat ↔ Heart-Kidney Yin Deficiency
- Xue-stage Heat ↔ Blood Heat
- Shao Yang ↔ Yang Wei Mai Disharmony
- Jue Yin Mixed Cold-Heat ↔ generic Mixed Cold and Heat

---

# 17. Relation-registry policy

No relation-registry expansion is approved yet.

Codex must produce:

```text
proposed semantic
closest existing live relation type
semantically sufficient?
real gap?
recommended action
```

Reuse live relation vocabulary wherever possible.

---

# 18. Endpoint namespace policy

Before any production graph edge, every endpoint must resolve to an existing canonical namespace/ID.

Possible endpoint classes:
- `pattern.*`
- `tdis.*`
- `cond.*`
- `sym.*`
- meridian/channel entity
- extraordinary-vessel entity
- taxonomy/mechanism node
- stage node
- location node

If no suitable endpoint exists, mark:
`STAGING_ONLY_ENDPOINT_UNRESOLVED`

Do not invent `pattern.*` IDs just to make graph edges work.

---

# 19. TCM disease endpoint policy

Missing `tdis.*` endpoints do not block Pattern identity work.

If missing:
- record proposed context,
- mark `TDIS_ENDPOINT_PENDING`,
- defer to a separate TCM Disease expansion task.

---

# 20. `DECISIONS.md`

Correct stale V1 count note as a separate documentation-only commit.

Do not mix this with V2 clinical implementation.

---

# 21. Preferred implementation sequence after Codex reclassification

1. V2-0 documentation hygiene
2. V2-A V1 enrichment + true aliases
3. V2-B high-confidence core Zang-Fu / combined-organ Patterns
4. V2-C pathogen / dryness / selected mechanism Patterns
5. V2-D Six Channels
6. V2-E Four Levels + San Jiao
7. V2-F Gynecology / Chong-Ren / Uterus
8. V2-G Extraordinary Vessels / Jing-Luo
9. V2-H differential comparison objects
10. V2-I relation graph

Relations come last, after endpoint identities are stable.

---

# 22. Codex next deliverable

Using this decision pack, Codex must produce:

`PATTERN_V2_CODEX_CANONICAL_REVIEW_v2.md`

Requirements:
1. preserve the verified 69/59/62/59/3 V1 baseline;
2. reclassify all 212 unique research concepts;
3. explicitly apply every decision in this file;
4. unmapped candidates become `HOLD_FOR_TING`;
5. compute revised classification counts;
6. projected counts use only `APPROVE_CANONICAL + APPROVE_CANONICAL_SUBTYPE`;
7. produce the live existing-vs-new relation semantic matrix;
8. resolve real endpoint IDs/namespaces where possible;
9. unresolved endpoints remain staging only;
10. propose small implementation batches with exact candidate lists and dependencies;
11. make no production data changes.

STOP after the corrected review.

---

# 23. No implementation authorization yet

Until Ting explicitly approves the revised Codex review:

```text
DO NOT:
- create new Pattern IDs
- edit registry/library
- add aliases
- add relation types
- create TCM disease endpoints
- write graph edges
- redesign schema
- bulk migrate data
```

This file is the human canonical gate, not the implementation green light.

## End

# AcuTing OS — Pattern V2-D Final Canonical Decision Slice
## Extracted handoff from the EXISTING authoritative Pattern V2 Final Canonical Decision Pack

**Date of handoff slice:** 2026-08-11  
**Upstream authority:** `Acuting_OS_Pattern_V2_Final_Canonical_Decision_Pack_2026-08-08.md`  
**Research evidence already exists:** Batch04 Gynecology/Chong-Ren/Jing; Batch07 Differentiation Systems; Batch08 Extraordinary Vessels/Channel System.  
**Status:** AUTHORITATIVE DECISION SLICE / NO NEW RESEARCH / NOT IMPLEMENTATION AUTHORIZATION

> This file does not invent new Pattern decisions. It extracts the V2-D-relevant decisions that were already made in the full Final Canonical Decision Pack so Fable does not have to re-research Batch04/07/08.

## A. Six Channels 六經

### APPROVE_CANONICAL
- 太陽中風 — Tai Yang Zhong Feng
- 太陽傷寒 — Tai Yang Shang Han
- 陽明經證 — Yang Ming Channel Pattern
- 陽明腑證 — Yang Ming Fu-Organ Pattern
- 少陽證 — Shao Yang Pattern
- 太陰虛寒 — Tai Yin Deficiency-Cold
- 少陰寒化證 — Shao Yin Cold Transformation
- 少陰熱化證 — Shao Yin Heat Transformation
- 厥陰寒熱錯雜 — Jue Yin Mixed Cold and Heat

### Other Six-Channel decisions
- 太陽蓄水 / 太陽腑水蓄 → `APPROVE_CANONICAL_SUBTYPE` if terminology normalized
- 太陽陽明合病 → `GRAPH_ONLY`
- 太陽少陽合病 → `GRAPH_ONLY`
- 少陽兼陽明裏實 → `GRAPH_ONLY`
- Source phrases that merely represent transformation, combination, fluid injury, or an unstable subtype remain graph/subtype/terminology review rather than automatic flat IDs.

### Lock
- `Yang Ming Jing` is not an alias of Stomach Heat/Fire.
- `Yang Ming Fu` is not an alias of Large Intestine Excess Heat.
- Six-Channel stage identity is part of the Pattern identity.

## B. Four Levels 衛氣營血

### APPROVE_CANONICAL
- 衛分風熱 — Wei-Stage Wind-Heat
- 氣分熱 — Qi-Stage Heat
- 營分熱 — Ying-Stage Heat
- 血分熱 — Xue-Stage Heat

### APPROVE_CANONICAL_SUBTYPE
- 氣分濕熱 — Qi-Stage Damp-Heat
- 衛分濕熱 — Wei-Stage Damp-Heat, only if source-stable
- 熱入心包 — Heat Entering Pericardium

### BROADER_NARROWER / HOLD / GRAPH / PROGRESSION
- 氣分肺熱 → `BROADER_NARROWER`
- 氣分胃熱 → `BROADER_NARROWER`
- 氣分腸燥熱 → `BROADER_NARROWER`
- 氣分膽熱 → `HOLD_FOR_TING`
- 血分熱迫血妄行 → `GRAPH_ONLY`
- 血分熱兼血瘀 → `GRAPH_ONLY`
- 血分熱動風 → `PROGRESSION_ONLY`

### Lock
`Xue-stage Heat 血分熱` ≠ generic `Blood Heat 血熱`.

## C. San Jiao 三焦

- 三焦濕熱 — San Jiao Damp-Heat → `APPROVE_CANONICAL`
- 中焦濕熱 — Middle Jiao Damp-Heat → `LOCATION_ONLY`
- 下焦濕熱 — Lower Jiao Damp-Heat → `ENRICH_EXISTING`
- 上焦熱 — Upper Jiao Heat → `LOCATION_ONLY`
- 上焦寒濕 — Upper Jiao Cold-Damp → `LOCATION_ONLY`
- 中焦痰熱 — Middle Jiao Phlegm-Heat → `LOCATION_ONLY`
- 中焦濕滯 — Middle Jiao Damp Stagnation → `LOCATION_ONLY`
- 中焦陽虛 — Middle Jiao Yang Deficiency → `BROADER_NARROWER`
- 中焦血瘀 — Middle Jiao Blood Stasis → `LOCATION_ONLY`
- 下焦血瘀 — Lower Jiao Blood Stasis → `LOCATION_ONLY`
- 下焦虛寒 — Lower Jiao Deficiency-Cold → `BROADER_NARROWER`

## D. Gynecology / Chong-Ren / Uterus 婦科・衝任・胞宮

### APPROVE_CANONICAL
- 衝任虛損 — Chong-Ren Deficiency
- 寒凝胞宮 — Cold Congealing the Uterus
- 胞宮虛寒 — Uterus Deficiency-Cold
- 胞宮血瘀 — Blood Stasis in the Uterus

### Other decisions
- 衝任血熱 — Blood Heat in Chong-Ren → `BROADER_NARROWER`
- 血熱妄行 — Blood Heat with Reckless Bleeding → `GRAPH_ONLY`
- 脾虛衝脈不固 — Spleen Deficiency with Chong Instability → `GRAPH_ONLY`
- 衝任虛寒兼血虛 → `GRAPH_ONLY`
- 衝任虛寒兼血瘀 → `GRAPH_ONLY`
- 產後寒凝血瘀 → `CONTEXT_ONLY`
- 產後血虛 → `CONTEXT_ONLY`
- 產後血瘀 → `CONTEXT_ONLY`
- 腎虛胎元不固 → `CONTEXT_ONLY`
- 衝任虛損胎動不安 → `CONTEXT_ONLY`

## E. Extraordinary Vessels 奇經八脈

### APPROVE_CANONICAL
- 帶脈失約 / 帶脈失調 — Dai Mai Dysfunction
- 陰蹻脈失調 — Yin Qiao Mai Imbalance
- 陽蹻脈失調 — Yang Qiao Mai Imbalance
- 陽維脈失調 — Yang Wei Mai Disharmony
- 衝氣上逆 / 衝脈氣逆 — Chong Mai Qi Rebellion

### HOLD / REJECT
- 陰維脈失調 — Yin Wei Mai Disharmony → `HOLD_FOR_TING`
- 督脈痹阻 / 督脈不利 — Du Mai Obstruction → `HOLD_FOR_TING`
- 任脈虛 / 任脈不足 — Ren Mai Deficiency → `REJECT_AS_PATTERN` for now

### Hard rule
Do not invent vessel-specific tongue or pulse data when the research corpus does not establish one.

## F. Jing-Luo / Channel state

- 經絡氣血痹阻 — Qi-Blood Obstruction of the Channels → `APPROVE_CANONICAL`
- 痰阻經絡 — Phlegm Obstructing the Channels → `BROADER_NARROWER`
- 血瘀阻絡 — Blood Stasis Obstructing Channels → `BROADER_NARROWER`
- 寒凝經脈 — Cold Obstructing Channels → `BROADER_NARROWER`
- 風痰阻絡 — Wind-Phlegm Obstructing Channels → `BROADER_NARROWER`

Keep these as structured channel state rather than ordinary flat Pattern cards:
- 經筋拘急
- 經筋弛緩
- Luo excess/deficiency
- Shi-Dong / Suo-Sheng sets
- individual channel excess/deficiency
- cutaneous-region manifestations

## G. Implementation sequence

The existing full decision pack's intended order remains:

1. V2-D Six Channels
2. V2-E Four Levels + San Jiao
3. V2-F Gynecology / Chong-Ren / Uterus
4. V2-G Extraordinary Vessels / Jing-Luo
5. differential comparison objects
6. relation graph last, after endpoints are stable

Before implementation:
- compare against CURRENT Pattern registry/library/aliases
- preserve frozen existing IDs
- resolve aliases/subtypes/graph-only concepts
- do not manufacture missing TDIS endpoints
- run Pattern + relation validators

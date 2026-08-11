# AcuTing OS — TCM Pattern Expansion Research Pack v0.7
## Batch 07 — Differentiation-System Expansion Pack
### 六經 → 衛氣營血 → 三焦 → 八綱
### Antigravity research handoff

**Date:** 2026-08-08  
**Research / extraction layer:** ChatGPT  
**Repository / canonicalization layer:** Antigravity  
**Status:** STAGING / CANONICAL REVIEW ONLY — do not bulk-create `pattern.*` IDs

---

# 0. Why this batch matters

The current AcuTing Pattern V1 baseline is heavily weighted toward Zang-Fu and general mechanism Patterns.

However, the user's school/course materials explicitly use multiple diagnostic systems in clinical assessment:

- Eight Principles
- Zang-Fu
- Six Differentiation / Channels
- Four Levels (Wei, Qi, Ying, Xue)
- Extraordinary Meridians

The existing AcuTing taxonomy already reserves controlled primary systems for:

```text
six_channels
wei_qi_ying_xue
san_jiao
```

while Eight Principles are intended mainly as **orthogonal classification tags**:

```text
exterior / interior
cold / heat
deficiency / excess
yin / yang
```

This batch prevents future AcuTing expansion from forcing classical febrile-disease and Cold-Damage Patterns into ordinary Zang-Fu cards.

---

# 1. System architecture rule

## 1.1 Six Channels 六經
Use `primary_system = six_channels` when the Pattern identity itself is a Shang Han Lun stage/pattern.

Examples:
- Tai Yang Zhong Feng
- Tai Yang Shang Han
- Yang Ming Jing
- Yang Ming Fu
- Shao Yang
- Tai Yin Deficiency-Cold
- Shao Yin Cold Transformation
- Shao Yin Heat Transformation
- Jue Yin Cold-Heat Complex

Do **not** alias these automatically to their closest Zang-Fu or Eight-Principle Pattern.

---

## 1.2 Four Levels 衛氣營血
Use `primary_system = wei_qi_ying_xue` when the Pattern identity is explicitly a Warm-Disease level.

Examples:
- Wei-stage Wind-Heat
- Qi-stage Heat
- Ying-stage Heat
- Xue-stage Heat

Do not collapse:
- Qi-level Stomach Heat → ordinary Stomach Heat
- Xue-stage Heat → generic Blood Heat

The stage carries additional disease-depth and progression meaning.

---

## 1.3 San Jiao 三焦
Use `primary_system = san_jiao` only when the Pattern is truly differentiated by Upper/Middle/Lower Jiao location or Warm-Disease fluid-pathway logic.

Important:
Sacred Lotus notes that San Jiao does **not** behave as a normal independent Zang-Fu organ with a separate organ Pattern set. Upper/Middle/Lower Jiao frequently describe the location/functions of the organs contained within them.

Therefore:
- `Middle Jiao Damp-Heat` may be canonical if source/clinical use is stable.
- `Middle Jiao Blood Stasis` is more likely Blood Stasis + location.
- `Upper Jiao Heat` may be a location/stage modifier.
- do not create a card for every phrase containing “Jiao.”

---

## 1.4 Eight Principles 八綱
AcuTing's current taxonomy treats Eight Principles primarily as **cross-cutting tags**, not a mandatory standalone primary folder.

Use:

```text
exterior
interior
cold
heat
deficiency
excess
yin
yang
```

to describe other canonical Patterns.

Only unusually stable compound Eight-Principle concepts such as:
- Exterior Cold + Interior Heat
- True Cold with False Heat
- True Heat with False Cold
- Mixed Cold and Heat

should enter canonical review as possible standalone clinical concepts.

---

# 2. Six-Channel Differentiation 六經辨證

## Theory backbone

Shen-Nong frames the Six-Meridian system as a way to identify the **stage, disease location, relative strength of pathogenic factors and body resistance, and transformation of Cold-Damage disease**.

Three Yang:
- Tai Yang 太陽
- Yang Ming 陽明
- Shao Yang 少陽

Three Yin:
- Tai Yin 太陰
- Shao Yin 少陰
- Jue Yin 厥陰

The system is dynamic. A Pattern should therefore support stage/progression relations rather than be treated as an isolated organ label.

Primary theory source:
https://new.shen-nong.com/articleDetails/2081

Clinical reference:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-six-stages-tcm

---

## SC01 — Tai Yang Zhong Feng
**Chinese:** 太陽中風  
**Preferred English:** Tai Yang Wind-Strike / Tai Yang Zhong Feng  
**System:** `six_channels`  
**Stage tag:** `tai_yang`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
External Wind-Cold affects the Tai Yang exterior while Ying and Wei are disharmonized. The pores are not tightly closed, so spontaneous sweating is present.

### Key signs
- fever with aversion to wind/cold
- spontaneous sweating
- headache
- stiff neck / upper back
- nasal congestion
- dry heaves may occur
- little or no thirst

### Tongue / pulse
- tongue often normal
- thin white moist coating
- floating, relaxed/moderate/soft pulse

### Treatment principle
Release the muscle layer/exterior; harmonize Ying and Wei.

### Formula anchor
- Gui Zhi Tang 桂枝湯

### Differential
**vs Tai Yang Shang Han**
- Zhong Feng: sweating, floating relaxed/moderate pulse
- Shang Han: no sweat, stronger chills/body aches, floating tight pulse

**vs generic Wind-Cold**
Tai Yang Zhong Feng is a **Six-Channel staged subtype**, not a synonym for all Wind-Cold presentations.

### Board/course relevance
High. Uploaded Bastyr formula materials explicitly describe Gui Zhi Tang as Wind-Cold Exterior Deficiency with Ying-Wei regulation.

---

## SC02 — Tai Yang Shang Han
**Chinese:** 太陽傷寒  
**Preferred English:** Tai Yang Cold Damage / Tai Yang Shang Han  
**System:** `six_channels`  
**Stage tag:** `tai_yang`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Wind-Cold constrains the Tai Yang exterior, closes the pores, obstructs Wei Qi and Lung diffusion.

### Key signs
- pronounced chills / aversion to cold
- fever
- **no sweating**
- headache
- generalized body aches
- neck/upper-back stiffness
- cough/wheezing may appear
- no particular thirst

### Tongue / pulse
- tongue pink/normal
- thin white moist coating
- floating, tight pulse

### Treatment principle
Release exterior; induce sweating appropriately; disperse Wind-Cold; restore Lung Qi diffusion.

### Formula anchors
- Ma Huang Tang 麻黃湯
- Ge Gen Tang 葛根湯 when neck/upper-back stiffness is prominent

### Differential
- Tai Yang Zhong Feng
- generic Wind-Cold
- Wind-Cold Attacking Lung

### Canonical note
Do not merge with `pattern.wind_cold`. Same pathogen, different diagnostic framework and stage identity.

---

## SC03 — Tai Yang Fu / Water Accumulation
**Chinese:** 太陽腑證 / 太陽蓄水證  
**Preferred English:** Tai Yang Fu Pattern — Water Accumulation  
**System:** `six_channels`  
**Stage tag:** `tai_yang`  
**Status:** `TERMINOLOGY_REVIEW` + `NEW_CANONICAL_CANDIDATE`

### Source-supported concept
Uploaded research/formula corpus maps Wu Ling San to:
- Tai Yang Biao-Fu / Tai Yang Fu
- water/fluid accumulation
- impaired water transformation

### Mechanism
Tai Yang exterior pathology disrupts Bladder Qi transformation and fluid movement, producing retained water.

### Clinical direction
Production card should verify the exact source-defined manifestations before finalization. Keep classical clues source-scoped rather than filling from memory.

### Formula anchor
- Wu Ling San 五苓散

### Canonical caution
Do not merge automatically with:
- Bladder Qi dysfunction
- generic Water Retention
- Kidney Yang Deficiency with Water Flooding

The **stage mechanism** is different.

---

## SC04 — Tai Yang–Yang Ming Combined Pattern
**Chinese:** 太陽陽明合病 / 太陽陽明並病  
**Preferred English:** Tai Yang–Yang Ming Combined Pattern  
**System:** `six_channels`  
**Stage tags:** `tai_yang`, `yang_ming`  
**Status:** `GRAPH_COMPOSITION` / `COMPOUND_STAGE_REVIEW`

### Formula anchors
- Chai Ge Jie Ji Tang 柴葛解肌湯
- Da Qing Long Tang 大青龍湯 contexts
- Hou Po Qi Wu Tang source comparison: unresolved exterior + developed interior excess

### Canonical recommendation
Prefer graph/stage coexistence unless a stable canonical compound Pattern is repeatedly supported.

Possible relation:
`Tai Yang` + `Yang Ming` → `concurrent_stage_pattern`

---

## SC05 — Tai Yang–Shao Yang Combined Pattern
**Chinese:** 太陽少陽合病 / 太陽少陽並病  
**Preferred English:** Tai Yang–Shao Yang Combined Pattern  
**System:** `six_channels`  
**Stage tags:** `tai_yang`, `shao_yang`  
**Status:** `GRAPH_COMPOSITION`

### Formula anchor
- Chai Hu Gui Zhi Tang 柴胡桂枝湯

### Source wording
Bastyr formula notes describe Shao Yang symptoms while the exterior has not completely resolved.

### Canonical recommendation
Likely better represented as:
- Tai Yang exterior remains
- Shao Yang half-exterior/half-interior develops

rather than a permanent standalone universal node.

---

## SC06 — Yang Ming Jing
**Chinese:** 陽明經證  
**Preferred English:** Yang Ming Channel Pattern  
**System:** `six_channels`  
**Stage tag:** `yang_ming`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Pathogenic Heat is strong in the Yang Ming channel/Qi level; Zheng Qi is also strong, producing intense Full Heat without bowel clumping as the defining feature.

### Key signs
Classic high-yield cluster:
- high fever
- profuse sweating
- intense thirst
- strong aversion to Heat
- restlessness

### Tongue / pulse
- red tongue
- yellow, dry coat
- large/flooding and rapid/forceful pulse

### Treatment principle
Clear intense Qi/Yang-Ming Heat; generate fluids.

### Formula anchor
- Bai Hu Tang 白虎湯

### Crosswalks
- Four Levels: Qi-stage Stomach Heat
- Zang-Fu: Stomach Heat/Fire may overlap clinically

### Critical ontology rule
Do not merge with `Stomach Fire`.  
Yang Ming Jing is a **Six-Channel stage identity**.

---

## SC07 — Yang Ming Fu
**Chinese:** 陽明腑證  
**Preferred English:** Yang Ming Fu-Organ Pattern  
**System:** `six_channels`  
**Stage tag:** `yang_ming`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Interior Yang Ming Heat combines with Dryness and binds/clumps in the intestines.

### Key signs
- severe constipation / dry stool
- abdominal fullness/distention
- abdominal pain, often worse with pressure
- tidal fever
- sweating of hands/feet
- thirst / dry mouth
- irritability or delirium in severe source descriptions

### Tongue / pulse
- red tongue, possible prickles
- dry yellow to black/dry coating
- deep, forceful, rapid pulse

### Treatment principle
Purge Heat accumulation and clumping from the bowel; preserve fluids.

### Formula anchors
- Da Cheng Qi Tang 大承氣湯
- Xiao Cheng Qi Tang 小承氣湯
- Tiao Wei Cheng Qi Tang 調胃承氣湯

### Differential
**vs Large Intestine Excess Heat**
Strong overlap exists, but Yang Ming Fu additionally carries Shang Han stage logic and the classic clumping/purgative framework.

**vs Qi-stage intestinal Dry Heat**
Four-Level staging uses a different febrile-disease ontology.

### Critical ontology rule
Keep system crosswalks, not hard aliases.

---

## SC08 — Yang Ming Fluid-Deficiency / Dryness Presentation
**Chinese:** 陽明津虧 / 陽明津傷  
**Preferred English:** Yang Ming Fluid-Deficiency/Dryness Presentation  
**System:** `six_channels`  
**Status:** `DO_NOT_PROMOTE_YET`

### Formula/source anchors
- Ma Zi Ren Wan-related source material
- Yang Ming Heat consuming fluids

### Canonical recommendation
Probably better as:
`Yang Ming Heat / Fu`
→ `damages_fluids`
rather than an independent canonical stage unless future source review supports a stable named syndrome.

---

## SC09 — Shao Yang Pattern
**Chinese:** 少陽證  
**Preferred English:** Shao Yang Pattern  
**System:** `six_channels`  
**Stage tag:** `shao_yang`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Pathogen is lodged between exterior and interior; Shao Yang pivot fails to course properly, affecting Gallbladder/San Jiao function and Stomach descent.

### Key signs
- alternating chills and fever
- bitter taste
- dry throat
- dizziness
- chest/hypochondriac fullness or discomfort
- poor appetite
- nausea / dry heaves / vomiting
- irritability

### Tongue / pulse
- tongue often normal/pink in basic course presentation
- thin white coat
- wiry pulse

### Treatment principle
Harmonize Shao Yang; support pivoting between exterior/interior; harmonize Stomach.

### Formula anchor
- Xiao Chai Hu Tang 小柴胡湯

### Differential
- Tai Yang: clear exterior pattern rather than alternating chills/fever
- Yang Ming: persistent interior Heat rather than alternating pattern
- Liver Qi Stagnation: may share wiry pulse/hypochondriac discomfort but lacks stage-fever pattern

---

## SC10 — Shao Yang with Yang Ming Interior Excess
**Chinese:** 少陽兼陽明裡實 / 少陽陽明合病  
**Preferred English:** Shao Yang with Yang Ming Interior Excess  
**System:** `six_channels`  
**Status:** `SUBTYPE_REVIEW` / `GRAPH_COMPOSITION`

### Formula anchor
- Da Chai Hu Tang 大柴胡湯

### Source-derived signs
- alternating fever/chills
- chest/hypochondriac fullness/pain
- bitter taste
- nausea / persistent vomiting
- focal epigastric hardness/fullness/pain
- constipation or burning diarrhea
- yellow coat
- wiry, forceful pulse

### Mechanism
Shao Yang disharmony coexists with developed Yang Ming interior Heat/clumping.

### Canonical recommendation
Prefer:
`Shao Yang`
+ `Yang Ming interior excess`
rather than a generic new “Shao Yang Fu” node unless standards/course usage supports it consistently.

---

## SC11 — Tai Yin Deficiency-Cold
**Chinese:** 太陰虛寒 / 太陰寒濕  
**Preferred English:** Tai Yin Deficiency-Cold  
**System:** `six_channels`  
**Stage tag:** `tai_yin`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Theory
Shen-Nong describes Tai Yin disease as interior, generally Cold, deficient and/or Damp, often involving weakened Middle Jiao.

### Source-derived signs
From Li Zhong Wan / Fu Zi Li Zhong Wan course and AD material:
- watery diarrhea
- nausea/vomiting
- poor appetite
- abdominal pain
- no particular thirst
- Middle Jiao Cold
- pale/flabby tongue
- white coating
- deep, thin/weak pulse
- slow/tight may occur in source-labeled Tai Yin Shi variant

### Treatment principle
Warm Middle Jiao; strengthen Spleen/Stomach; dispel Cold.

### Formula anchors
- Li Zhong Wan 理中丸
- Fu Zi Li Zhong Wan 附子理中丸

### Differential
- Spleen Yang Deficiency: similar physiology but Zang-Fu identity, not Shang Han stage
- Middle Jiao Deficiency-Cold: broader mechanism/location
- Shao Yin Cold: deeper systemic Yang weakness/collapse

---

## SC12 — Shao Yin Cold Transformation
**Chinese:** 少陰寒化證  
**Preferred English:** Shao Yin Cold Transformation  
**System:** `six_channels`  
**Stage tag:** `shao_yin`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Deep Shao Yin Yang deficiency/internal Cold with severe weakness of Zheng Qi.

### Key signs
Source/course cluster:
- extremely cold extremities
- aversion to cold
- lethargy / constant desire to sleep
- vomiting
- diarrhea with undigested food
- abdominal cold pain
- lack of thirst
- profound weakness

### Tongue / pulse
- pale tongue
- white slippery coating
- deep, thin, faint/minute pulse

### Treatment principle
Rescue and warm Yang; dispel internal Cold; support Middle.

### Formula anchor
- Si Ni Tang 四逆湯

### Secondary source
- Wu Zhu Yu Tang 吳茱萸湯 for a source-labeled Shao Yin Cold presentation with vomiting/rebellious Qi

### Differential
**vs Kidney Yang Deficiency**
Kidney Yang Deficiency can be chronic and organ-based. Shao Yin Cold is a **deep Six-Channel stage** and may represent far more severe systemic weakness.

---

## SC13 — Shao Yin Heat Transformation
**Chinese:** 少陰熱化證  
**Preferred English:** Shao Yin Heat Transformation  
**System:** `six_channels`  
**Stage tag:** `shao_yin`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Shao Yin Yin/fluid is damaged, allowing deficiency/internal Heat to disturb Heart-Shen.

### Key signs
Uploaded meridian/course source:
- vexation/restlessness
- inability to sleep
- dry mouth and throat
- red tongue with little coat
- thin, rapid pulse

### Treatment principle
Nourish Yin; clear Heat; harmonize Heart-Kidney.

### Formula anchor
- Huang Lian E Jiao Tang 黃連阿膠湯

### Secondary source
- Si Ni San is labeled Shao Yin Heat in the NCBAHM/AD corpus, but its mechanism is constrained Qi/interior Heat; preserve this as source-specific corroboration rather than the primary formula.

### Differential
- Kidney Yin Deficiency
- Heart-Kidney Yin Deficiency
- Heart-Kidney Not Communicating

Do not hard-alias. Shao Yin Heat is a Six-Channel stage concept.

---

## SC14 — Jue Yin Cold
**Chinese:** 厥陰寒證 / 厥陰肝寒  
**Preferred English:** Jue Yin Cold  
**System:** `six_channels`  
**Stage tag:** `jue_yin`  
**Status:** `SUBTYPE_REVIEW`

### Formula anchors
- Wu Zhu Yu Tang 吳茱萸湯
- Da Jian Zhong Tang source also labels Jue Yin Cold
- Dang Gui Si Ni Tang source labels Jue Yin Cold in channel/Blood-deficiency Cold context

### Canonical caution
“Jue Yin Cold” is broad. Future review should distinguish:
- Jue Yin Liver Cold with rebellion
- Jue Yin channel Cold / Blood deficiency
- mixed Jue Yin Cold-Heat

---

## SC15 — Jue Yin Heat
**Chinese:** 厥陰熱證  
**Preferred English:** Jue Yin Heat  
**System:** `six_channels`  
**Stage tag:** `jue_yin`  
**Status:** `SUBTYPE_REVIEW`

### Formula/source anchors
- Bai Hu Tang source labels Jue Yin Heat
- Si Ni San source labels Jue Yin Heat
- Zhen Gan Xi Feng Tang source includes Jue Yin Heat-type headache

### Canonical caution
Current formula corpus uses “Jue Yin Heat” across distinct mechanisms. Do not create a single flat card until terminology is cross-checked against stronger classical/standard sources.

---

## SC16 — Jue Yin Cold-and-Heat Complex
**Chinese:** 厥陰寒熱錯雜  
**Preferred English:** Jue Yin Mixed Cold and Heat  
**System:** `six_channels`  
**Stage tag:** `jue_yin`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Theory
Shen-Nong describes Jue Yin as a deep Six-Channel stage with complex Yin-Yang derangement, including mixed Cold and Heat.

### Key signs
Sacred Lotus / classical summary:
- alternating sensations of Cold and Heat
- thirst
- hunger but inability to eat
- vomiting after eating
- diarrhea may occur
- ascending hot/painful sensation in chest/epigastrium
- frequent urination may occur

### Tongue / pulse
Source-dependent:
- red papillae with slippery white coat in Sacred Lotus summary
- deep/hidden/wiry pulse

### Treatment principle
Warm and clear concurrently according to the exact Cold/Heat distribution; harmonize Jue Yin.

### Formula anchor
- Wu Mei Wan 烏梅丸

### Differential
- generic Mixed Cold and Heat / 寒熱錯雜
- Shao Yang alternating chills/fever
- Stomach-Intestine Cold-Heat disharmony treated by Ban Xia Xie Xin Tang

### Canonical rule
Keep `Jue Yin mixed Cold-Heat` distinct from generic Eight-Principle Cold-Heat mixture because the Six-Channel stage is part of the identity.

---

# 3. Six-Channel progression graph

Use only as directional **possibilities**, not mandatory linear disease progression.

```text
Tai Yang
  ↓ may transmit inward
Yang Ming / Shao Yang
  ↓
Tai Yin
  ↓
Shao Yin
  ↓
Jue Yin
```

But source theory emphasizes that:
- stages can coexist,
- transmission is not always linear,
- improper treatment can alter the pathway,
- constitutional strength affects stage expression.

### High-value relations
- Tai Yang Zhong Feng ↔ Tai Yang Shang Han = sibling subtypes
- Tai Yang → may_enter → Yang Ming
- Tai Yang → may_enter → Shao Yang
- Shao Yang + Yang Ming → concurrent stage pattern
- Tai Yin → deeper deficiency may progress toward Shao Yin
- Shao Yin Cold ↔ Shao Yin Heat = alternative transformation patterns, not simple severity steps
- Jue Yin may show Cold, Heat, or mixed Cold-Heat

---

# 4. Four Levels / Wei-Qi-Ying-Xue 衛氣營血辨證

## Theory backbone

Shen-Nong describes the Four Phases as four strata of Warm-Febrile disease:

1. Wei 衛
2. Qi 氣
3. Ying 營
4. Xue 血

They indicate disease **location, depth and severity**.

Source:
https://new.shen-nong.com/article/syndrome-differentiation-four-phases?lang=en

Sacred Lotus clinical reference:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-4-levels-tcm

### Ontology rule
`Wei → Qi → Ying → Xue` is an important progression model, but real cases may skip, overlap or reverse levels with treatment.

---

## WQYX01 — Wei-Stage Wind-Heat
**Chinese:** 衛分風熱 / 風熱犯衛  
**Preferred English:** Wei-Stage Wind-Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `wei`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Warm-Wind attacks the exterior and Lung-Wei system.

### Key signs
- fever more prominent than chills
- mild aversion to wind/cold
- headache
- cough
- sore throat
- slight thirst
- little or slight sweating

### Tongue / pulse
- red tip/sides possible
- thin white to yellow coat
- floating, rapid pulse

### Treatment principle
Release exterior with acrid-cool methods; disperse Wind-Heat; clear Heat; diffuse Lung.

### Formula anchors
- Yin Qiao San 銀翹散
- Sang Ju Yin 桑菊飲 for cough-predominant milder presentation

### Differential
**vs generic Wind-Heat**
Same pathogenic family, but Wei-stage explicitly belongs to Warm-Disease Four-Level staging.

**vs Wind-Heat Attacking Lung**
Lung-specific pattern is organ-focused; Wei-stage is stage-focused.

---

## WQYX02 — Wei-Stage Damp-Heat
**Chinese:** 衛分濕熱 / 濕溫初起  
**Preferred English:** Wei-Stage Damp-Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `wei`  
**Status:** `NEW_CANONICAL_CANDIDATE` / `STAGE_SUBTYPE_REVIEW`

### Formula anchor
- San Ren Tang 三仁湯

### Source wording
American Dragon / course:
- Damp-Heat early stage
- Wei Stage Damp-Heat
- Summerheat with Damp
- Qi-level Damp-Heat lodged broadly through San Jiao in course framing

### Treatment principle
Diffuse Qi; open Lung/Upper Jiao; aromatically transform Middle-Jiao Dampness; drain Lower-Jiao Dampness; clear Heat.

### Canonical caution
This is not identical to generic Damp-Heat.

---

## WQYX03 — Qi-Stage Heat
**Chinese:** 氣分熱  
**Preferred English:** Qi-Stage Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `NEW_CANONICAL_CANDIDATE` as umbrella or stage parent

### Theory
Warm pathogen has entered the interior. Pathogen and Zheng Qi are both strong, producing Full Interior Heat.

### Broad key signs
- high fever
- profuse sweating
- no chills / aversion to Heat
- intense thirst, preference for cold drinks
- restlessness/irritability
- red tongue
- yellow dry coat
- rapid, forceful pulse

### Treatment principle
Clear Qi-level Heat; generate fluids; treat organ/location subtype.

### Major subtypes
- Qi-stage Lung Heat
- Qi-stage Stomach Heat
- Qi-stage intestinal Dry Heat
- Qi-stage Gallbladder Heat
- Qi-stage Damp-Heat

### Canonical recommendation
Consider one stage-parent + location subtypes rather than flat duplication.

---

## WQYX04 — Qi-Stage Lung Heat
**Chinese:** 氣分肺熱  
**Preferred English:** Qi-Stage Lung Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `SUBTYPE_REVIEW`

### Signs
- high fever
- cough
- yellow/sticky sputum
- wheezing
- chest discomfort
- thirst

### Formula anchor
- Ma Xing Shi Gan Tang 麻杏石甘湯

### Differential
- ordinary Lung Heat
- Wind-Heat Attacking Lung
- Wei-stage Wind-Heat

---

## WQYX05 — Qi-Stage Stomach Heat
**Chinese:** 氣分胃熱  
**Preferred English:** Qi-Stage Stomach Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `SUBTYPE_REVIEW`

### Signs
- high fever
- profuse sweating
- intense thirst
- restlessness
- strong Heat signs

### Formula anchor
- Bai Hu Tang 白虎湯

### Crosswalk
- Six Channels: Yang Ming Jing
- Zang-Fu: Stomach Heat

### Critical rule
These are **cross-framework equivalents/overlaps**, not automatic aliases.

---

## WQYX06 — Qi-Stage Intestinal Dry Heat
**Chinese:** 氣分腸燥熱 / 氣分腑實熱結  
**Preferred English:** Qi-Stage Intestinal Dry Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `SUBTYPE_REVIEW`

### Formula anchors
- Da Cheng Qi Tang
- Tiao Wei Cheng Qi Tang
- Xiao Cheng Qi Tang

### Key signs
- constipation
- abdominal fullness/pain
- dry mouth/thirst
- high/tidal fever
- delirium/restlessness in severe cases
- dry yellow/black tongue coat
- deep forceful rapid pulse

### Crosswalk
- Six Channels: Yang Ming Fu
- Zang-Fu: Large Intestine Excess Heat

Do not collapse identities across systems.

---

## WQYX07 — Qi-Stage Gallbladder Heat
**Chinese:** 氣分膽熱  
**Preferred English:** Qi-Stage Gallbladder Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `DO_NOT_PROMOTE_YET` / `SOURCE_REVIEW`

### Formula/source anchors
- Liang Ge San source includes Qi Stage Gallbladder Heat
- Wen Dan Tang / Hao Qin Qing Dan Tang support GB Heat/Phlegm-Heat/Damp-Heat contexts

### Canonical caution
Current source corpus uses several overlapping GB/Shao-Yang/Phlegm-Heat labels. More source normalization is needed before promotion.

---

## WQYX08 — Qi-Stage Damp-Heat
**Chinese:** 氣分濕熱  
**Preferred English:** Qi-Stage Damp-Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `qi`  
**Status:** `NEW_CANONICAL_CANDIDATE` / `SUBTYPE_REVIEW`

### Formula anchors
- San Ren Tang
- Gan Lu Xiao Du Dan
- Lian Po Yin

### Source sublocations
- Spleen/Stomach
- Middle Jiao
- San Jiao
- Summerheat-Dampness

### Canonical recommendation
Stage + location may be separate dimensions:
`Qi-stage Damp-Heat`
with `middle_jiao` tag when appropriate.

---

## WQYX09 — Ying-Stage Heat
**Chinese:** 營分熱 / 熱入營分  
**Preferred English:** Ying-Stage Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `ying`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Warm Heat enters the nutritive level, affecting Blood-Ying and Heart/Shen, while injuring Yin.

### Key signs
Course/Sacred Lotus:
- high fever worse at night
- severe irritability/restlessness
- insomnia
- delirium / disturbed speech
- thirst but may only sip/rinse mouth
- indistinct erythema / rash may begin
- Shen disturbance

### Tongue / pulse
- scarlet/deep-red tongue
- dry/reduced coat
- thin, rapid pulse

### Treatment principle
Clear Ying Heat; relieve Fire toxin; nourish Yin; vent Heat toward Qi level when appropriate.

### Formula anchor
- Qing Ying Tang 清營湯

### Differential
- Qi-stage Heat: stronger Full Heat signs, yellow coat, less deep Shen/Blood involvement
- Xue-stage Heat: more bleeding, Wind and deeper Blood injury

---

## WQYX10 — Ying Heat Attacking Pericardium
**Chinese:** 營熱擾心包 / 熱入心包  
**Preferred English:** Ying Heat Attacking the Pericardium  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `ying`  
**Status:** `SUBTYPE_REVIEW`

### Formula/source anchor
- Qing Ying Tang source explicitly lists Ying Stage Heat Attacks the Pericardium

### Clinical direction
- high fever
- marked Shen disturbance
- delirium/confusion
- restlessness
- progression toward impaired consciousness

### Ontology note
May be:
`Ying-stage Heat`
→ `affects`
→ Pericardium

rather than a separate canonical ID, depending relation capabilities.

---

## WQYX11 — Xue-Stage Heat
**Chinese:** 血分熱 / 熱入血分  
**Preferred English:** Xue-Stage Heat  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `xue`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Core mechanism
Warm Heat penetrates the Blood level, stirring Blood, injuring Yin, disturbing Shen and potentially generating Internal Wind.

### Key signs
- severe/deep fever
- bleeding in traditional source descriptions
- rashes/purpura
- delirium / Shen disturbance
- possible spasms or tremors when Wind is generated

### Tongue / pulse
- deep red/scarlet/purple tongue
- possible prickles
- thin rapid, or wiry/thin depending complication

### Treatment principle
Cool Blood; clear Heat/toxin; nourish Yin; stop bleeding and dispel stasis when present.

### Formula anchor
- Xi Jiao Di Huang Tang 犀角地黃湯

### Critical differential
Do not merge with generic `Blood Heat`.  
Xue-stage Heat is a **Warm-Disease depth/stage Pattern**.

---

## WQYX12 — Xue-Stage Heat with Reckless Bleeding
**Chinese:** 血分熱迫血妄行  
**Preferred English:** Xue-Stage Heat with Reckless Bleeding  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `xue`  
**Status:** `SUBTYPE_REVIEW` / `PROGRESSION_RELATION`

### Formula anchor
- Xi Jiao Di Huang Tang

### Graph
`Xue-stage Heat`
→ `may_force_blood_out_of_vessels`
→ bleeding manifestations

Likely relation/subtype rather than a separate broad canonical card.

---

## WQYX13 — Xue-Stage Heat with Blood Stasis
**Chinese:** 血分熱兼血瘀  
**Preferred English:** Xue-Stage Heat with Blood Stasis  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `xue`  
**Status:** `GRAPH_COMPOSITION`

### Source anchor
- Xi Jiao Di Huang Tang explicitly lists Xue-stage Heat with Blood Stagnation and has Blood-stasis-dispersing action.

### Canonical recommendation
Represent:
`Xue-stage Heat`
+ `Blood Stasis`

rather than automatically creating a long compound ID.

---

## WQYX14 — Xue-Stage Heat Generating Wind
**Chinese:** 血分熱動風 / 熱極生風  
**Preferred English:** Xue-Stage Heat Generating Internal Wind  
**System:** `wei_qi_ying_xue`  
**Stage tag:** `xue`  
**Status:** `PROGRESSION_RELATION` / `SUBTYPE_REVIEW`

### Formula anchor
- Ling Jiao Gou Teng Tang 羚角鉤藤湯

### Graph
`Xue-stage Heat / Extreme Heat`
→ `generates`
→ `Internal Liver Wind`

This is an important cross-system relation:
Four Levels → Liver-Wind mechanism.

---

# 5. Four-Level progression graph

```text
Wei
  ↓
Qi
  ↓
Ying
  ↓
Xue
```

Use as **possible transmission**, not strict mandatory sequence.

### Important progression edges
- Wei-stage Wind-Heat → may_enter → Qi-stage Heat
- Qi-stage Heat → may_enter → Ying-stage Heat
- Ying-stage Heat → may_enter → Xue-stage Heat
- Ying-stage Heat → may_disturb → Pericardium/Shen
- Xue-stage Heat → may_cause → reckless bleeding
- Xue-stage Heat → may_generate → Internal Wind
- Xue-stage Heat → may_coexist_with → Blood Stasis

---

# 6. San Jiao Differentiation 三焦辨證

## Framework note

Sacred Lotus:
- Upper Jiao patterns broadly reflect Lung/Heart functions
- Middle Jiao reflects Spleen/Stomach
- Lower Jiao reflects Kidney/Bladder/Intestines
- San Jiao is strongly relevant to fluid transformation and distribution

Source:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-san-jiao-patterns-tcm

### AcuTing ontology implication
San Jiao should behave largely as:
- disease-depth/location dimension
- fluid/Qi pathway framework
- Warm-Disease/Damp-Heat differentiation axis

not as an excuse to duplicate every organ Pattern.

---

## SJ01 — San Jiao Damp-Heat
**Chinese:** 三焦濕熱  
**Preferred English:** San Jiao Damp-Heat  
**System:** `san_jiao`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Formula anchors
- San Ren Tang
- Long Dan Xie Gan Tang source explicitly lists San Jiao Damp-Heat

### Mechanism
Damp-Heat obstructs Qi and fluid movement through the burners; manifestations vary by dominant Jiao.

### Treatment direction
Move Qi; transform/drain Dampness; clear Heat; restore fluid pathways.

### Canonical note
Could serve as an umbrella with:
- Upper Jiao
- Middle Jiao
- Lower Jiao
location tags/subtypes.

---

## SJ02 — Upper Jiao Heat
**Chinese:** 上焦熱  
**Preferred English:** Upper Jiao Heat  
**System:** `san_jiao`  
**Status:** `LOCATION_MODIFIER_REVIEW`

### Formula/source anchors
- San Ren Tang source labels San Jiao Upper Jiao Heat
- Liang Ge San clears Upper Jiao while draining Middle/Lower Jiao
- Huang Lian Jie Du Tang clears toxin/Fire through all three Jiaos

### Canonical caution
Too broad to promote immediately.

Possible representations:
- Heat in Lung/Heart + `upper_jiao`
- Warm-Disease stage/location tag

---

## SJ03 — Upper Jiao Cold-Damp
**Chinese:** 上焦寒濕  
**Preferred English:** Upper Jiao Cold-Damp  
**System:** `san_jiao`  
**Status:** `DO_NOT_PROMOTE_YET`

### Source anchor
- Huo Xiang Zheng Qi San source: San Jiao Cold-Damp in Upper Jiao, alongside exterior Wind-Cold and Spleen/Stomach deficiency/Damp.

### Canonical caution
Current evidence is formula-source-specific. Needs cross-source corroboration.

---

## SJ04 — Middle Jiao Damp-Heat
**Chinese:** 中焦濕熱  
**Preferred English:** Middle Jiao Damp-Heat  
**System:** `san_jiao`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Formula anchors
- Gan Lu Xiao Du Dan
- Lian Po Yin
- San Ren Tang Middle-Jiao Damp transformation logic

### Key mechanism
Damp-Heat obstructs Spleen/Stomach Qi mechanism in the Middle Jiao.

### Clinical direction
- epigastric fullness/oppression
- nausea
- poor appetite
- heaviness
- sticky/greasy coating
- Heat signs mixed with Dampness

### Treatment principle
Clear Heat; transform Dampness; regulate Middle-Jiao Qi.

### Differential
**vs Spleen-Stomach Damp-Heat**
Potentially very close clinically. Difference is differentiation framework:
- San Jiao = location/pathway
- Zang-Fu = organ dysfunction

Canonical review should decide whether both cards add value or whether one is a cross-system mapping.

---

## SJ05 — Middle Jiao Phlegm-Heat
**Chinese:** 中焦痰熱  
**Preferred English:** Middle Jiao Phlegm-Heat  
**System:** `san_jiao`  
**Status:** `SUBTYPE_REVIEW`

### Source anchor
- Gan Lu Xiao Du Dan source labels San Jiao Middle Jiao Phlegm-Heat

### Recommendation
Likely:
`Phlegm-Heat`
+ `middle_jiao`
rather than an independent canonical Pattern.

---

## SJ06 — Middle Jiao Damp Stagnation
**Chinese:** 中焦濕滯  
**Preferred English:** Middle Jiao Damp Stagnation  
**System:** `san_jiao`  
**Status:** `LOCATION_MODIFIER_REVIEW`

### Formula anchors
- Gan Lu Xiao Du Dan
- Ping Wei San / Huo Xiang Zheng Qi San provide mechanism corroboration

### Recommendation
Could map to:
- Damp Stagnation
- Cold-Damp Encumbering Spleen
- Middle Jiao location

---

## SJ07 — Middle Jiao Yang Deficiency
**Chinese:** 中焦陽虛  
**Preferred English:** Middle Jiao Yang Deficiency  
**System:** `san_jiao`  
**Status:** `BROADER_NARROWER_REVIEW`

### Formula anchors
- Li Zhong Wan
- Da Jian Zhong Tang
- Huang Qi Jian Zhong Tang

### Canonical caution
Overlaps strongly with:
- Spleen Yang Deficiency
- Stomach Deficiency-Cold
- Spleen/Stomach Deficiency-Cold

Likely better as location/functional umbrella than an additional independent Pattern.

---

## SJ08 — Middle Jiao Blood Stasis
**Chinese:** 中焦血瘀  
**Preferred English:** Middle Jiao Blood Stasis  
**System:** `san_jiao`  
**Status:** `GRAPH_COMPOSITION`

### Formula anchor
- Dan Shen Yin / Stomach-Middle Jiao Blood stagnation source family

### Recommendation
`Blood Stasis`
+ `middle_jiao`

Do not create an ID solely because location is named.

---

## SJ09 — Lower Jiao Damp-Heat
**Chinese:** 下焦濕熱  
**Preferred English:** Lower Jiao Damp-Heat  
**System:** `san_jiao`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Formula anchors
- Er Miao San
- San Miao Wan
- Si Miao Wan
- Long Dan Xie Gan Tang
- Ge Gen Huang Qin Huang Lian Tang source
- Ba Zheng San/Bladder context

### Clinical use
Strong graph hub connecting:
- Bladder Damp-Heat
- Liver/GB Damp-Heat pouring downward
- genital/reproductive Damp-Heat
- Lin presentations
- lower-limb Damp-Heat/Bi/Wei contexts

### Canonical caution
Do not make `Lower Jiao Damp-Heat` synonymous with `Bladder Damp-Heat`.

---

## SJ10 — Lower Jiao Blood Stasis
**Chinese:** 下焦血瘀  
**Preferred English:** Lower Jiao Blood Stasis  
**System:** `san_jiao`  
**Status:** `GRAPH_COMPOSITION`

### Evidence family
Gyne/pelvic Blood-stasis formulas:
- Gui Zhi Fu Ling Wan
- Shao Fu Zhu Yu Tang
- Tao Hong Si Wu Tang
- Sheng Hua Tang postpartum context

### Recommendation
`Blood Stasis`
+ `lower_jiao`
+ specific organ/uterus relation when applicable.

---

## SJ11 — Lower Jiao Deficiency Cold
**Chinese:** 下焦虛寒  
**Preferred English:** Lower Jiao Deficiency-Cold  
**System:** `san_jiao`  
**Status:** `BROADER_NARROWER_REVIEW`

### Overlapping concepts
- Kidney Yang Deficiency
- Bladder Deficiency-Cold
- Spleen-Kidney Yang Deficiency
- Chong-Ren Deficiency-Cold
- Uterus Deficiency-Cold

### Recommendation
Do not promote until relation model can prevent redundancy.

---

# 7. San Jiao location graph

```text
Upper Jiao
  → Lung / Heart
  → dispersal of fluids / exterior interface

Middle Jiao
  → Spleen / Stomach
  → transformation, transport, Qi mechanism

Lower Jiao
  → Kidney / Bladder / Intestines / reproductive-pelvic contexts
  → drainage, excretion, storage, lower fluid pathways
```

Use the existing relation-registry vocabulary if equivalent relation types already exist.

---

# 8. Eight Principles 八綱辨證

## Theory backbone

Shen-Nong identifies four diagnostic pairs:

1. Exterior / Interior 表 / 裏
2. Cold / Heat 寒 / 熱
3. Deficiency / Excess 虛 / 實
4. Yin / Yang 陰 / 陽

Yin/Yang summarize the other axes:
- Interior + Cold + Deficiency generally trend Yin
- Exterior + Heat + Excess generally trend Yang

But real patterns may be mixed, transform, or show false signs.

Source:
https://new.shen-nong.com/article/eight-diagnostic-principles-chinese-medicine

Sacred Lotus:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-8-principles-ba-gong-tcm

---

## 8.1 Eight Principles as tags, not duplicate cards

Examples:

### Kidney Yang Deficiency
```text
interior
cold
deficiency
yang_deficiency
```

### Liver Fire
```text
interior
heat
excess
```

### Tai Yang Shang Han
```text
exterior
cold
excess
```

### Wind-Heat
```text
exterior
heat
excess
```

### Shao Yin Cold
```text
interior
cold
deficiency
```

Do not create separate generic `pattern.interior_heat_excess` cards for every Pattern already represented more specifically.

---

# 9. Eight-Principle compound canonical candidates

## EP01 — Exterior Cold Excess
**Chinese:** 表寒實證  
**Preferred English:** Exterior Cold Excess  
**Status:** `TAG_COMBINATION`

Typical mappings:
- Wind-Cold
- Tai Yang Shang Han

No new standalone card needed unless future ontology explicitly wants generic Eight-Principle summary Patterns.

---

## EP02 — Exterior Deficiency Wind-Cold
**Chinese:** 表虛風寒 / 太陽中風表虛  
**Preferred English:** Exterior Deficiency Wind-Cold  
**Status:** `SUBTYPE_OR_TAG_COMBINATION`

### Anchor
- Gui Zhi Tang

### Note
Useful differential concept but may remain a Tai Yang Zhong Feng subtype rather than an Eight-Principles canonical node.

---

## EP03 — Exterior Heat
**Chinese:** 表熱證  
**Preferred English:** Exterior Heat  
**Status:** `TAG_COMBINATION`

Typical mapping:
- Wind-Heat
- Wei-stage Wind-Heat

---

## EP04 — Interior Heat Excess
**Chinese:** 裏熱實證  
**Preferred English:** Interior Excess Heat  
**Status:** `TAG_COMBINATION`

Examples:
- Yang Ming Jing
- Yang Ming Fu
- Stomach Fire
- Lung Heat
- Large Intestine Heat

Do not duplicate these with a generic card unless the UI needs an educational parent/category.

---

## EP05 — Interior Cold Deficiency
**Chinese:** 裏虛寒證  
**Preferred English:** Interior Deficiency Cold  
**Status:** `TAG_COMBINATION`

Examples:
- Spleen Yang Deficiency
- Kidney Yang Deficiency
- Tai Yin Deficiency-Cold
- Shao Yin Cold
- Uterus Deficiency-Cold

---

## EP06 — Exterior Cold with Interior Heat
**Chinese:** 表寒裏熱  
**Preferred English:** Exterior Cold with Interior Heat  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Formula anchors
- Da Qing Long Tang
- Fang Feng Tong Sheng San source supports exterior/interior Heat configurations, but is not identical
- Chai Ge Jie Ji Tang supports unresolved exterior Cold transforming into interior Heat

### Canonical value
High because this is a stable mixed Eight-Principle configuration, not merely two unrelated tags.

### Differential
- Wind-Cold transforming to Heat: progression event
- Tai Yang–Yang Ming combined Pattern: Six-Channel identity
- simultaneous exterior/interior Heat: different nature

---

## EP07 — Exterior and Interior Heat Excess
**Chinese:** 表裏俱熱 / 表裏實熱  
**Preferred English:** Exterior-Interior Heat Excess  
**Status:** `NEW_CANONICAL_CANDIDATE` / `COMPOUND_REVIEW`

### Formula anchor
- Fang Feng Tong Sheng San

### Canonical caution
Could remain a compound Eight-Principles node if the repository wants general diagnostic abstractions.

---

## EP08 — Mixed Cold and Heat
**Chinese:** 寒熱錯雜  
**Preferred English:** Mixed Cold and Heat  
**Status:** `NEW_CANONICAL_CANDIDATE` as umbrella

### Formula anchors
- Ban Xia Xie Xin Tang — Stomach/Intestine disharmony with interacting Cold and Heat
- Wu Mei Wan — Jue Yin Cold-Heat complex

### Critical distinction
Generic `Mixed Cold and Heat` ≠ `Jue Yin Cold-and-Heat`.

Relationship:
`Jue Yin Cold-and-Heat` → subtype/cross-system realization of → `mixed Cold-Heat`

---

## EP09 — True Cold with False Heat
**Chinese:** 真寒假熱  
**Preferred English:** True Cold with False Heat  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Source anchor
- You Gui Yin source wording in the formula corpus
- Eight-Principles theory recognizes late-stage Cold covered by false Heat signs

### Mechanism
Severe interior Cold/Yang deficiency is the root, with outward false-Heat manifestations.

### Treatment principle
Treat the true Cold/root Yang deficiency; do not mistake superficial Heat signs for genuine Heat.

### Canonical caution
Needs authoritative symptom/tongue/pulse extraction before production card.

---

## EP10 — True Heat with False Cold
**Chinese:** 真熱假寒  
**Preferred English:** True Heat with False Cold  
**Status:** `NEW_CANONICAL_CANDIDATE` / `SOURCE_RESEARCH_REQUIRED`

### Theory support
Eight-Principles theory recognizes severe Heat that may show apparent Cold signs.

### Canonical caution
Do not build from generic textbook memory alone. Require direct accepted source packet before promotion.

---

## EP11 — Deficiency with Excess
**Chinese:** 虛實夾雜  
**Preferred English:** Mixed Deficiency and Excess  
**Status:** `GRAPH_COMPOSITION_OR_CATEGORY`

### Examples from user's formula corpus
- Qi deficiency + Blood stasis
- Spleen deficiency + Dampness
- Kidney deficiency below + Phlegm/Cold excess above
- Yin deficiency + Fire
- Liver-Kidney deficiency + Liver Yang/Wind

### Recommendation
This should generally be a **relationship/classification concept**, not a single universal clinical Pattern card.

---

# 10. Cross-system equivalence map — DO NOT use as aliases

| Six Channels | Four Levels | Zang-Fu / Mechanism | Relationship |
|---|---|---|---|
| Tai Yang Zhong Feng | — | Wind-Cold exterior deficiency | overlap / framework-specific |
| Tai Yang Shang Han | — | Wind-Cold exterior excess / Wind-Cold attacking Lung | overlap / framework-specific |
| Yang Ming Jing | Qi-stage Stomach Heat | Stomach Heat / Fire | strong crosswalk, not identity |
| Yang Ming Fu | Qi-stage intestinal Dry Heat | Large Intestine Excess Heat / Dry Heat | strong crosswalk |
| Shao Yang | — | GB Heat / Liver-GB disharmony | partial overlap |
| Tai Yin Deficiency-Cold | — | Spleen Yang Deficiency / Middle Jiao Cold | strong overlap |
| Shao Yin Cold | — | Kidney/Heart Yang deficiency, Yang collapse | deeper-stage overlap |
| Shao Yin Heat | — | Kidney Yin / Heart-Kidney Yin deficiency | partial overlap |
| Jue Yin Mixed Cold-Heat | — | generic Mixed Cold-Heat | narrower stage-specific concept |
| — | Wei-stage Wind-Heat | Wind-Heat | staged subtype |
| — | Qi-stage Lung Heat | Lung Heat | staged subtype |
| — | Ying-stage Heat | Heart/Pericardium Heat + Yin injury | not reducible to one Zang-Fu Pattern |
| — | Xue-stage Heat | Blood Heat + deep febrile stage | **not equivalent to generic Blood Heat** |

Antigravity should store this as cross-system relation evidence, not alias redirects.

---

# 11. Highest-priority canonical candidates from Batch 07

## Tier A — likely worth real Pattern cards if absent

### Six Channels
1. Tai Yang Zhong Feng 太陽中風
2. Tai Yang Shang Han 太陽傷寒
3. Yang Ming Jing 陽明經證
4. Yang Ming Fu 陽明腑證
5. Shao Yang 少陽證
6. Tai Yin Deficiency-Cold 太陰虛寒
7. Shao Yin Cold Transformation 少陰寒化
8. Shao Yin Heat Transformation 少陰熱化
9. Jue Yin Mixed Cold-Heat 厥陰寒熱錯雜

### Four Levels
10. Wei-stage Wind-Heat 衛分風熱
11. Qi-stage Heat 氣分熱
12. Ying-stage Heat 營分熱
13. Xue-stage Heat 血分熱
14. Qi-stage Damp-Heat 氣分濕熱

### San Jiao
15. San Jiao Damp-Heat 三焦濕熱
16. Middle Jiao Damp-Heat 中焦濕熱
17. Lower Jiao Damp-Heat 下焦濕熱

### Eight Principles / mixed
18. Exterior Cold with Interior Heat 表寒裏熱
19. Mixed Cold and Heat 寒熱錯雜
20. True Cold with False Heat 真寒假熱

---

## Tier B — subtype / relation-first review

- Tai Yang Fu / Water Accumulation
- Tai Yang–Yang Ming combined
- Tai Yang–Shao Yang combined
- Shao Yang + Yang Ming interior excess
- Jue Yin Cold
- Jue Yin Heat
- Wei-stage Damp-Heat
- Qi-stage Lung Heat
- Qi-stage Stomach Heat
- Qi-stage intestinal Dry Heat
- Ying Heat attacking Pericardium
- Xue Heat with bleeding
- Xue Heat generating Wind
- Upper Jiao Heat
- Middle Jiao Phlegm-Heat
- Upper Jiao Cold-Damp
- Lower Jiao Deficiency-Cold
- True Heat with False Cold

---

# 12. Antigravity canonical-review schema for Batch 07

Recommended staging rows:

```json
{
  "source_concept": "Yang Ming Jing",
  "name_zh": "陽明經證",
  "name_en": "Yang Ming Channel Pattern",
  "primary_system": "six_channels",
  "stage_tags": ["yang_ming"],
  "eight_principle_tags": ["interior", "heat", "excess"],
  "formula_anchors": ["Bai Hu Tang"],
  "cross_system_matches": [
    {
      "concept": "Qi-stage Stomach Heat",
      "relation": "crosswalk_overlap"
    },
    {
      "concept": "Stomach Heat",
      "relation": "clinical_overlap_not_alias"
    }
  ],
  "recommended_action": "new_canonical_if_absent",
  "confidence": "high"
}
```

---

# 13. Required relation concepts

Before Antigravity implements these candidates, inspect the existing `relation_registry.json` for the closest approved relation types.

High-value semantic relations needed:

- stage progression
- transformation
- concurrent stage
- cross-system overlap
- subtype
- affects organ/system
- location in Jiao
- generates Wind
- damages fluids/Yin
- causes bleeding

Use existing relation-registry vocabulary if equivalent relation types already exist.

---

# 14. Formula evidence index

## Six Channels
| Pattern | Formula anchors |
|---|---|
| Tai Yang Zhong Feng | Gui Zhi Tang |
| Tai Yang Shang Han | Ma Huang Tang; Ge Gen Tang |
| Tai Yang Fu / Water | Wu Ling San |
| Tai Yang–Yang Ming | Chai Ge Jie Ji Tang; Da Qing Long Tang / Hou Po Qi Wu Tang contexts |
| Tai Yang–Shao Yang | Chai Hu Gui Zhi Tang |
| Yang Ming Jing | Bai Hu Tang |
| Yang Ming Fu | Da Cheng Qi Tang; Xiao Cheng Qi Tang; Tiao Wei Cheng Qi Tang |
| Shao Yang | Xiao Chai Hu Tang |
| Shao Yang + Yang Ming | Da Chai Hu Tang |
| Tai Yin Deficiency-Cold | Li Zhong Wan; Fu Zi Li Zhong Wan |
| Shao Yin Cold | Si Ni Tang; Wu Zhu Yu Tang |
| Shao Yin Heat | Huang Lian E Jiao Tang; source-specific Si Ni San |
| Jue Yin Cold | Wu Zhu Yu Tang; Dang Gui Si Ni Tang; Da Jian Zhong Tang |
| Jue Yin Cold-Heat | Wu Mei Wan |

## Four Levels
| Pattern | Formula anchors |
|---|---|
| Wei-stage Wind-Heat | Yin Qiao San; Sang Ju Yin |
| Wei-stage Damp-Heat | San Ren Tang |
| Qi-stage Lung Heat | Ma Xing Shi Gan Tang |
| Qi-stage Stomach Heat | Bai Hu Tang |
| Qi-stage intestinal Dry Heat | Da Cheng Qi Tang; Tiao Wei Cheng Qi Tang |
| Qi-stage Damp-Heat | San Ren Tang; Gan Lu Xiao Du Dan; Lian Po Yin |
| Ying-stage Heat | Qing Ying Tang |
| Ying Heat attacking Pericardium | Qing Ying Tang |
| Xue-stage Heat | Xi Jiao Di Huang Tang |
| Xue Heat + bleeding/stasis | Xi Jiao Di Huang Tang |
| Xue Heat generating Wind | Ling Jiao Gou Teng Tang |

## San Jiao
| Pattern/location | Formula anchors |
|---|---|
| San Jiao Damp-Heat | San Ren Tang; Long Dan Xie Gan Tang |
| Upper Jiao Heat | San Ren Tang; Liang Ge San |
| Upper Jiao Cold-Damp | Huo Xiang Zheng Qi San |
| Middle Jiao Damp-Heat | Gan Lu Xiao Du Dan; Lian Po Yin; San Ren Tang logic |
| Middle Jiao Phlegm-Heat | Gan Lu Xiao Du Dan |
| Middle Jiao Yang Deficiency | Li Zhong Wan; Da Jian Zhong Tang; Huang Qi Jian Zhong Tang |
| Lower Jiao Damp-Heat | Er Miao San; San Miao Wan; Si Miao Wan; Long Dan Xie Gan Tang |
| Three-Jiao Fire/Toxin | Huang Lian Jie Du Tang |

---

# 15. Board/course relevance

The uploaded Bastyr clinical documentation material explicitly lists:
- Eight Principles
- Zang-Fu
- Six Differentiation / Channels
- Four Levels
- Extraordinary Meridians

as legitimate Acupuncture & Eastern Medicine assessment frameworks.

The user's 2026 NCBAHM / AD formula corpus repeatedly includes:
- Tai Yang
- Yang Ming
- Shao Yang
- Tai Yin
- Shao Yin
- Jue Yin
- Wei/Qi/Ying/Xue
- San Jiao

labels in formula syndromes.

Therefore these special-system Patterns should be modeled as first-class learning/clinical knowledge, not hidden aliases under Zang-Fu.

---

# 16. Major ontology warnings

## Warning A — Same symptoms, different frameworks
`Yang Ming Jing`, `Qi-stage Stomach Heat`, and `Stomach Heat` may share symptoms but are not automatically the same canonical entity.

## Warning B — Stage is part of identity
`Xue-stage Heat` is more specific than generic `Blood Heat`.

## Warning C — Disease progression is not always linear
Do not encode Wei → Qi → Ying → Xue or Tai Yang → ... → Jue Yin as guaranteed.

## Warning D — San Jiao often means location
Do not make dozens of `pattern.upper_jiao_*` nodes just because formula texts mention a Jiao.

## Warning E — Eight Principles are mostly tags
The current AcuTing taxonomy already expects Eight Principles to classify other Patterns rather than become a parallel pile of duplicate cards.

## Warning F — Formula syndrome wording is evidence, not canonical naming authority
Preserve the source phrase, normalize separately.

---

# 17. Recommended Antigravity workflow

For every Batch 07 candidate:

1. Search current registry by exact Chinese name.
2. Search library by Chinese and English names.
3. Search alias map.
4. Search source/staging/history.
5. Search formula relations.
6. Determine whether the candidate is:
   - true new stage Pattern
   - alias
   - subtype
   - cross-system overlap
   - progression relation
   - location modifier
   - compound stage
   - noncanonical source phrase
7. Assign exactly one primary differentiation system when canonical.
8. Add Eight-Principle tags as secondary dimensions.
9. Do not convert cross-system overlap into hard alias without review.
10. Preserve source-specific formula evidence.
11. Resolve formula IDs before production linkage.
12. Only add point links from accepted point sources, never infer from a formula alone.
13. Run Pattern and relation validators.
14. Produce a review report before bulk promotion.

---

# 18. Next research batch

## Batch 08 — Extraordinary Vessels / Channel-System Pattern Expansion

Recommended next scope:

### Extraordinary Vessels
- Chong Mai
- Ren Mai
- Du Mai
- Dai Mai
- Yin Qiao
- Yang Qiao
- Yin Wei
- Yang Wei

Distinguish:
- actual extraordinary-vessel Pattern
- channel symptom cluster
- gynecology/reproductive context
- point pairing strategy
- TCM disease association

### Twelve Channels / Channel Pathology
- channel Excess/Deficiency
- channel Cold/Heat
- channel Qi/Blood obstruction
- channel-based pain/numbness
- sinew-channel patterns
- Luo-vessel patterns

This should connect the Pattern ontology to the user's acupuncture-point and meridian libraries without converting every channel symptom into a Pattern card.

---

# 19. Source inventory

## User / project files
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.1_2026-08-08.md`
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.5_Batch05_Canonical_Candidate_Master_Map_2026-08-08.md`
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.6_Batch06_Formula_to_Pattern_Inversion_2026-08-08.md`
- `02_PATTERN_CLASSIFICATION_TAXONOMY.md`
- `Formulations Summary Chart.docx.md`
- `Herbal Formulations Comprehensive.docx.md`
- `American_Dragon_201_Formulas_Name_Actions_Syndromes.md`
- `American_Dragon_201_Formulas_Clinical_Manifestations.md`
- `NCBAHM_2026_AD_181_Formulas_Name_Actions_Syndromes.md`
- formula-card batches for purgative/harmonizing/warming/dampness formulas
- uploaded meridian notes containing Shao Yin Cold/Heat summaries
- Bastyr SOAP/charting lecture showing diagnostic-framework use

## Web theory / clinical references
### Shen-Nong — Six Meridians
https://new.shen-nong.com/articleDetails/2081

### Shen-Nong — Four Phases
https://new.shen-nong.com/article/syndrome-differentiation-four-phases?lang=en

### Shen-Nong — Eight Principles
https://new.shen-nong.com/article/eight-diagnostic-principles-chinese-medicine

### Sacred Lotus — Six Stages
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-six-stages-tcm

### Sacred Lotus — Four Levels
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-4-levels-tcm

### Sacred Lotus — San Jiao
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-san-jiao-patterns-tcm

### Sacred Lotus — Eight Principles
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-8-principles-ba-gong-tcm

---

## End of Batch 07

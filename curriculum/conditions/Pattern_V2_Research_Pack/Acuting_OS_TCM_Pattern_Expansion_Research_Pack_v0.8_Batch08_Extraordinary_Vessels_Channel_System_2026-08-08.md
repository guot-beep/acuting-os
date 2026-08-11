# AcuTing OS — TCM Pattern Expansion Research Pack v0.8
## Batch 08 — Extraordinary Vessels / Channel-System Pattern Expansion
### 奇經八脈 → 十二經脈病候 → 絡脈 → 經筋 → 皮部
### Antigravity research handoff

**Date:** 2026-08-08  
**Research / extraction layer:** ChatGPT  
**Repository / canonicalization layer:** Antigravity  
**Status:** STAGING / ONTOLOGY REVIEW ONLY — do not bulk-create `pattern.*` IDs

---

# 0. Who this pack is for

This file belongs to the **Antigravity / future Pattern V2 expansion workstream**.

It is not the Pattern V1 freeze packet.

Current division of labor:

```text
Sonnet / Claude
  → finish and freeze the current Pattern V1 canonical baseline
  → repository migration / validator / commit work

ChatGPT research packs (Batch 02–08)
  → source extraction
  → candidate ontology
  → aliases / subtypes / relationships
  → enough evidence for future expansion

Antigravity
  → consume these research packs later
  → compare against the live repository
  → canonicalize
  → build cards / relations / UI data
  → validate
```

So Batch 08 is primarily **for Antigravity**.

---

# 1. Why this batch needs a stricter ontology boundary

AcuTing already has separate data concepts for:

- acupuncture points
- meridians/channels
- TCM Patterns
- TCM diseases
- formulas
- relations

Channel-system data can easily become duplicated if every meridian indication is turned into a `pattern.*` card.

For Batch 08, distinguish five layers:

```text
1. vessel/channel entity
2. vessel/channel pathology pattern
3. symptom or trajectory manifestation
4. disease/context
5. point-treatment strategy
```

Example:

```text
Yang Qiao Mai
  = vessel entity

Yang Qiao dysfunction with 陰緩陽急
  = possible channel-pattern concept

insomnia
  = manifestation / TCM disease context

BL62
  = point relation

stroke
  = biomedical / TCM disease context
```

These are not interchangeable.

---

# 2. Primary classification rule

The current AcuTing Pattern taxonomy already has `jing_luo`.

Therefore:

- use `jing_luo` as the likely primary Pattern family for channel/vessel Patterns;
- do **not** invent a new production `extraordinary_vessel` primary system unless the live schema already supports it or Ting separately approves a schema extension;
- if needed, keep a staging-only secondary field such as:

```text
channel_subsystem:
  extraordinary_vessel
  primary_channel
  luo_vessel
  sinew_channel
  cutaneous_region
```

Antigravity must check the actual schema before implementation.

---

# 3. Extraordinary Vessel architecture

The eight extraordinary vessels are:

1. Chong Mai 衝脈
2. Ren Mai 任脈
3. Du Mai 督脈
4. Dai Mai 帶脈
5. Yin Qiao Mai 陰蹺脈
6. Yang Qiao Mai 陽蹺脈
7. Yin Wei Mai 陰維脈
8. Yang Wei Mai 陽維脈

## Critical rule

The existence of a vessel entity does **not** automatically justify a generic Pattern card named:

```text
Ren Mai Disorder
Du Mai Disorder
Chong Mai Disorder
...
```

Promote a Pattern only when there is a stable, clinically discriminable pathology concept.

---

# 4. Chong Mai 衝脈

## EV01 — Chong Mai Qi Rebellion
**Chinese:** 衝氣上逆 / 衝脈氣逆  
**Preferred English:** Chong Mai Qi Rebellion  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Direct source backbone
The user's Chong Mai source identifies:
- reproductive function
- menstrual disorders
- infertility
- abdominal pain / internal urgency
- Qi rebellion upward
- chest-abdominal pain
- Qi rushing upward toward the Heart

### Mechanism
Chong Mai Qi fails to descend/harmonize and surges upward through the abdomen and chest.

### Key candidate manifestations
- abdominal or epigastric urgency/pain
- Qi rising upward
- chest or epigastric discomfort
- palpitations / Heart-area rushing sensation in source context
- nausea/vomiting may accompany channel-route involvement

### Associated contexts
- 奔豚氣-like upward surging
- menstrual/reproductive disease contexts
- abdominal-pelvic disorders

### Canonical caution
Do not make all menstrual disease part of `Chong Mai Qi Rebellion`.

The upward-rebellion mechanism should be the identity discriminator.

### Point / vessel relation candidates
Source channel points include Chong–Kidney overlap through:
- KI12–KI21 region
- CV7 / Yin Jiao
- abdominal route

Resolve actual point IDs from the point registry at implementation time.

---

## EV02 — Chong Mai Deficiency / Chong-Ren Deficiency
**Chinese:** 衝脈不足 / 衝任虛損  
**Preferred English:** Chong Mai Deficiency / Chong-Ren Deficiency  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `CANONICAL_REVIEW_REQUIRED`

### Already extracted in Batch 04
Strong formula/course evidence exists for:
- Chong-Ren deficiency
- Chong-Ren deficiency-Cold
- Chong-Ren instability due Spleen deficiency
- Chong-Ren Heat
- Chong-Ren Blood stasis

### Canonical question
Should AcuTing use:

```text
pattern.chong_ren_deficiency
```

as the clinical node, with Chong and Ren vessel relations,

or separately model:

```text
Chong Mai Deficiency
Ren Mai Deficiency
```

?

### Recommendation
Prefer **Chong-Ren deficiency** as the clinical reproductive Pattern when the sources describe them jointly.

Do not split them solely because two vessel entities exist.

---

## EV03 — Chong Mai Reproductive Dysfunction
**Chinese:** 衝脈失調（經孕）  
**Status:** `TDIS_CONTEXT_ONLY` / `DO_NOT_PROMOTE_AS_GENERIC_PATTERN`

Menstrual irregularity, infertility, pregnancy loss, retained lochia and similar items belong primarily to TCM disease/context relations.

Recommended architecture:

```text
Chong Mai / Chong-Ren Pattern
   ↓ associated_with
tdis.menstrual_disorder
tdis.infertility
tdis.pregnancy_instability
```

---

# 5. Ren Mai 任脈

## Vessel role from user source
The user's Ren Mai material emphasizes:
- anterior midline
- lower abdominal and reproductive/urogenital disorders
- menstruation
- vaginal discharge
- infertility
- urinary difficulty
- seminal/sexual disorders
- abdominal/chest/throat involvement
- deficiency/collapse presentations at Ren points

---

## EV04 — Ren Mai Deficiency
**Chinese:** 任脈不足 / 任脈虛  
**Preferred English:** Ren Mai Deficiency  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `DO_NOT_PROMOTE_YET`

### Why hold
The user's Ren Mai file strongly supports vessel functions and indications, but it does not by itself provide a clean canonical syndrome package with:
- stable key-sign set
- tongue/pulse
- standardized treatment principle
- differential criteria

### Likely future relation cluster
Possible source-linked manifestations:
- reproductive weakness
- infertility
- chronic lower abdominal deficiency
- genital/urinary dysfunction
- constitutional deficiency

### Recommendation
Keep Ren Mai as a vessel entity and link known reproductive/deficiency Patterns to it until stronger syndrome-level evidence is assembled.

---

## EV05 — Ren Mai Luo Excess / Deficiency
**Chinese:** 任脈絡實 / 任脈絡虛  
**Status:** `CHANNEL_PATHOLOGY_LAYER`

The user's source gives an explicit Ren Luo pattern:

**Luo:** Jiuwei / CV15

- Excess: abdominal skin pain
- Deficiency: abdominal skin itching

This is excellent structured channel-pathology data, but not necessarily a general `pattern.*` card.

Recommended storage:

```text
channel_pathology:
  vessel: REN
  branch: luo
  excess:
    - abdominal skin pain
  deficiency:
    - abdominal skin itching
```

---

# 6. Du Mai 督脈

## Vessel role from user source
User materials describe Du Mai as:
- governing Yang vessels / Yang Qi
- related to the spine and brain
- neurologic and consciousness presentations
- spinal stiffness/pain
- reproductive/urogenital branches in traditional descriptions

---

## EV06 — Du Mai Constraint / Obstruction
**Chinese:** 督脈痹阻 / 督脈不利  
**Preferred English:** Du Mai Obstruction / Constraint  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `CANONICAL_REVIEW_REQUIRED`

### Potential discriminator
If a future Pattern card is created, it should require:
- dominant midline spinal/neck trajectory pathology
- stiffness/constraint or movement limitation
- clear Du Mai attribution

Do not use generic low-back pain alone.

### Source manifestations
- spinal stiffness
- lumbar-spinal pain
- neck stiffness
- opisthotonic/convulsive patterns appear in severe traditional descriptions

### Safety layer
Neurologic emergencies remain safety/referral content, not proof of a Du Mai Pattern.

---

## EV07 — Du Mai Luo Excess / Deficiency
**Chinese:** 督脈絡實 / 督脈絡虛  
**Status:** `CHANNEL_PATHOLOGY_LAYER`

Direct user-source distinction:

**Du Luo / Changqiang GV1**
- Excess: spinal stiffness
- Deficiency: heavy head, unstable swaying/dizziness

This is a strong example of why Luo-vessel pathology deserves structured storage outside the main Pattern card layer.

---

# 7. Dai Mai 帶脈

## EV08 — Dai Mai Dysfunction
**Chinese:** 帶脈失約 / 帶脈不固 / 帶脈失調  
**Preferred English:** Dai Mai Dysfunction  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `HIGH_PRIORITY_NEW_CANONICAL_CANDIDATE`

### Direct source backbone
The user's Dai Mai notes preserve classical/textbook material linking Dai Mai dysfunction with:
- abdominal fullness
- lumbar weakness/cold sensation “as if sitting in water”
- menstrual irregularity
- red/white vaginal discharge
- lower abdominal pain
- waist/hip pain
- weakness of lower limbs / Wei-type dysfunction when the girdling function fails

### Core mechanism
The Girdling Vessel fails to bind and regulate the longitudinal channels and pelvic/waist region.

### Key candidate signs
- abdominal fullness
- waist/lumbar weakness or laxity
- characteristic cold/heavy watery sensation around the waist
- abnormal vaginal discharge
- menstrual irregularity
- pelvic/lower-abdominal discomfort
- lower-limb weakness in relevant source contexts

### Treatment principle
Regulate/secure Dai Mai; treat underlying Dampness, deficiency, Heat or Cold according to the source pattern.

### Differential
**vs Spleen deficiency with Damp vaginal discharge**
- Dai Mai dysfunction requires vessel-binding/pelvic-waist pattern evidence, not discharge alone.

**vs Chong-Ren deficiency**
- Chong/Ren centers more on menstruation, Blood, fertility and uterine regulation.
- Dai Mai centers more on binding/girdling, discharge and waist-pelvic support.

### Formula relation
Wan Dai Tang may provide important evidence for:
- Spleen deficiency
- Liver constraint
- Dampness
- Dai Mai dysfunction

But do not make Wan Dai Tang proof that all Dai Mai dysfunction has the same root mechanism.

---

# 8. Yin Qiao Mai 陰蹺脈

## EV09 — Yin Qiao Imbalance
**Chinese:** 陰蹺脈失調 / 陽緩陰急  
**Preferred English:** Yin Qiao Mai Imbalance  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `HIGH_PRIORITY_NEW_CANONICAL_CANDIDATE`

### Direct source identity
The user's Yin Qiao source explicitly describes:
- governing opening/closing of the eyes
- regulating movement
- hypersomnia
- urinary retention/frequency
- **陽緩陰急**
- inner-side tightness with outer-side flaccidity

### Core movement discriminator
**Yang relaxed / Yin tense**
- lateral/external muscles relatively relaxed
- medial/internal muscles tense

### Key candidate manifestations
- hypersomnia / excessive sleepiness
- abnormal eye opening/closing
- medial lower-limb tension
- lateral lower-limb flaccidity
- gait/movement imbalance
- urinary dysfunction in source context

### Supporting areas
- gynecologic disorders
- throat dryness/pain
- eye disorders

These should remain supporting/context signs, not universal key signs.

### Differential
**vs Yang Qiao dysfunction**
- Yin Qiao: 陽緩陰急, hypersomnia tendency
- Yang Qiao: 陰緩陽急, insomnia/wakefulness tendency

### Point relation
User data strongly associates:
- KI6 Zhaohai
- KI8 Jiaoxin
- BL1 Jingming

with the vessel's clinical range.

---

# 9. Yang Qiao Mai 陽蹺脈

## EV10 — Yang Qiao Imbalance
**Chinese:** 陽蹺脈失調 / 陰緩陽急  
**Preferred English:** Yang Qiao Mai Imbalance  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `HIGH_PRIORITY_NEW_CANONICAL_CANDIDATE`

### Direct source identity
The user's Yang Qiao source explicitly describes:
- sleep/wake regulation
- eye opening/closing
- motor regulation
- insomnia
- **陰緩陽急**
- lateral tension with medial flaccidity

### Core movement discriminator
**Yin relaxed / Yang tense**
- medial/internal muscles relatively relaxed
- lateral/external muscles tight

### Key candidate manifestations
- insomnia / inability to settle into sleep
- excessive wakefulness
- lateral lower-limb tightness
- medial lower-limb laxity
- gait dysfunction
- lateral leg/ankle/heel pain
- shoulder-neck tension along the vessel route

### Supporting
- eye pain/redness
- facial deviation
- dizziness
- seizure/neurologic contexts in traditional indications

### Differential
**vs Yin Qiao**
Opposite medial/lateral tension pattern and opposite sleep tendency.

### Point relation
User source includes:
- BL62 Shenmai
- BL61 Pucan
- BL59 Fuyang
- multiple shoulder/face/eye meeting points

Implementation should use canonical point IDs, not Chinese strings.

---

# 10. Yin Wei Mai 陰維脈

## EV11 — Yin Wei Mai Disharmony
**Chinese:** 陰維脈失調  
**Preferred English:** Yin Wei Mai Disharmony  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `NEW_CANONICAL_CANDIDATE` / `SOURCE_REVIEW`

### Source backbone
User source:
- governs/interlinks Yin channels
- “mainly the interior”
- strongly associated with chest/abdomen/internal disorders
- Heart pain
- Stomach pain
- chest/abdominal pain
- hypochondriac fullness
- Qi constraint / emotional constraint
- throat/esophageal symptoms

### Mechanism candidate
Failure to coordinate Yin channels and internal Qi movement through chest/abdomen.

### Candidate key cluster
- chest/Heart pain
- epigastric/abdominal pain
- chest-hypochondriac fullness
- internal Qi constraint / upward rebellion

### Supporting/context
- vomiting
- acid regurgitation
- hiccup
- dysphagia/throat obstruction
- Plum-Pit Qi-type context

### Canonical caution
The symptom list is broad. A production Pattern should not simply copy all indications of every meeting point.

Need discriminators showing a coherent Yin-Wei/internal-Qi mechanism.

---

# 11. Yang Wei Mai 陽維脈

## EV12 — Yang Wei Mai Disharmony
**Chinese:** 陽維脈失調  
**Preferred English:** Yang Wei Mai Disharmony  
**Family:** `jing_luo`  
**Subsystem:** extraordinary vessel  
**Status:** `HIGH_PRIORITY_NEW_CANONICAL_CANDIDATE`

### Classical/source discriminator
User notes preserve the classical statement:

`陽維為病苦寒熱`

Core presentation:
- alternating or recurrent Cold/Heat
- aversion to cold + fever
- unresolved exterior-type disease
- head/neck/shoulder symptoms along the vessel

### Key candidate manifestations
- alternating chills and fever / cold-heat fluctuation
- exterior disorder that does not resolve cleanly
- headache
- dizziness
- neck stiffness
- shoulder/back pain

### Supporting route manifestations
- lateral leg/ankle pain
- hypochondriac pain/fullness
- eye/ear/nose symptoms

### Differential
**vs Shao Yang**
Both may involve alternating chills/fever.

Yang Wei requires:
- extraordinary-vessel attribution / route evidence
- Yang-channel linking/exterior framework

Shao Yang requires:
- Six-Channel pivot syndrome
- classic bitter taste, dry throat, hypochondriac fullness, nausea, wiry pulse cluster

Do not hard-alias.

---

# 12. Extraordinary Vessel candidate priority

## Tier A
1. Dai Mai Dysfunction 帶脈失約
2. Yin Qiao Imbalance 陰蹺脈失調 / 陽緩陰急
3. Yang Qiao Imbalance 陽蹺脈失調 / 陰緩陽急
4. Yang Wei Mai Disharmony 陽維脈失調
5. Chong Mai Qi Rebellion 衝氣上逆

## Tier B
6. Yin Wei Mai Disharmony 陰維脈失調
7. Du Mai Obstruction 督脈痹阻
8. Chong-Ren Deficiency 衝任虛損, already developed in Batch 04

## Hold
- generic Ren Mai Deficiency
- generic “Du Mai disorder”
- generic “Chong Mai reproductive dysfunction”
without stronger discriminating syndrome data

---

# 13. Extraordinary-vessel point-pair layer

The eight-vessel confluent-point pairings are highly useful for the acupuncture graph, but they should remain **point/vessel relations**, not Pattern identities.

Before implementation, Antigravity should verify against the existing point registry and accepted point sources.

Staging structure:

```text
extraordinary_vessel
  → opened_by_point
  → paired_with_vessel
  → paired_confluent_point
```

Do not store treatment point pairs by stuffing them into a Pattern's `typical_points` unless a Pattern source specifically supports that treatment.

---

# 14. Twelve Primary Channels 十二經脈

## Core ontology rule

The user's channel files contain several distinct kinds of knowledge:

- pathway
- organ linkage
- 是動病
- 所生病
- excess/deficiency tendencies
- channel-trajectory pain
- Luo vessel
- Jingjin
- cutaneous region
- point indications

These should not all be flattened into `pattern.*`.

Recommended architecture:

```text
meridian entity
  ├─ pathway
  ├─ functions
  ├─ shi_dong_bing
  ├─ suo_sheng_bing
  ├─ excess_features
  ├─ deficiency_features
  ├─ luo_pathology
  ├─ sinew_channel_pathology
  ├─ cutaneous_region
  └─ point relationships
```

Pattern cards should be reserved for reusable clinical pattern concepts.

---

# 15. Channel Pattern candidates

## CH01 — Channel Qi-Blood Obstruction
**Chinese:** 經絡氣血痹阻 / 經脈氣血不通  
**Preferred English:** Qi-Blood Obstruction of the Channels  
**Family:** `jing_luo`  
**Status:** `HIGH_PRIORITY_NEW_CANONICAL_CANDIDATE`

### Core mechanism
Qi/Blood flow is obstructed within channels/collaterals.

### Candidate manifestations
- fixed or moving pain depending mechanism
- numbness
- tingling
- heaviness
- restricted movement
- stiffness
- weakness distal to obstruction

### Modifiers
- Cold
- Heat
- Dampness
- Phlegm
- Blood Stasis
- Wind

### Graph-first design
Use one reusable obstruction hub:

```text
Channel Qi-Blood Obstruction
   + Cold
   + Damp
   + Phlegm
   + Blood Stasis
```

instead of creating every permutation as a new canonical card.

---

## CH02 — Channel Cold Obstruction
**Chinese:** 寒凝經脈 / 寒邪阻絡  
**Preferred English:** Cold Obstructing the Channels  
**Family:** `jing_luo`  
**Status:** `NEW_CANONICAL_CANDIDATE` / `SUBTYPE_REVIEW`

### Candidate discriminator
- pain/tightness
- worse Cold
- better warmth
- contraction
- reduced movement
- cold sensation along trajectory

### Relation
`Cold` → obstructs → channel Qi/Blood

---

## CH03 — Channel Heat
**Chinese:** 經脈鬱熱 / 熱在經絡  
**Preferred English:** Heat in the Channels  
**Family:** `jing_luo`  
**Status:** `DO_NOT_PROMOTE_YET`

Many meridian files include local Heat, swelling and pain under excess tendencies, but this may be better represented as:
- Heat Pattern
- affects_channel
- local manifestation

Need stronger canonical evidence before creating a generic Channel Heat Pattern.

---

## CH04 — Phlegm Obstructing Channels
**Chinese:** 痰阻經絡 / 痰濁阻絡  
**Preferred English:** Phlegm Obstructing the Channels  
**Family:** `jing_luo`  
**Status:** `NEW_CANONICAL_CANDIDATE`

Already supported in formula inversion:
- Xiao Huo Luo Dan
- Qian Zheng San
- Wind-Phlegm channel contexts

### Manifestation direction
- numbness
- heaviness
- weakness
- facial deviation in head/face channels
- persistent obstruction

### Graph
`Phlegm`
→ obstructs
→ `Channels / Collaterals`

---

## CH05 — Blood Stasis Obstructing Channels
**Chinese:** 血瘀阻絡  
**Preferred English:** Blood Stasis Obstructing the Channels  
**Family:** `jing_luo`  
**Status:** `NEW_CANONICAL_CANDIDATE`

### Source anchors
Formula inversion already identifies:
- Bu Yang Huan Wu Tang
- Shen Tong Zhu Yu Tang
- Xiao Huo Luo Dan contexts

### Key discriminator
- fixed/stabbing persistent pain
- numbness/weakness
- chronic obstruction
- purple/dusky signs when systemic Blood Stasis is present

### Graph
`Blood Stasis`
→ obstructs
→ channels/collaterals

---

## CH06 — Wind-Phlegm Obstructing Channels
**Chinese:** 風痰阻絡  
**Preferred English:** Wind-Phlegm Obstructing the Channels  
**Family:** `jing_luo`  
**Status:** `SUBTYPE_REVIEW`

### High-value contexts
- facial deviation
- numbness
- involuntary movement
- head/face or limb dysfunction

### Canonical question
Could remain:
`Wind-Phlegm`
+ `channel_obstruction`
rather than an additional long-form node.

---

# 16. 是動病 / 所生病 should not become one Pattern per channel

Examples in the user's files:

- Heart channel: thirst/dry throat, Heart pain, medial arm symptoms, palm Heat
- Small Intestine: throat/jaw/shoulder pain, ear/eye/cheek symptoms
- Kidney: cough, hemoptysis, throat, spinal, inner-leg, mental/restlessness symptoms
- Large Intestine: teeth/jaw/throat/nose + lateral arm trajectory

These are valuable classical channel-disease descriptors.

Recommended storage:

```text
meridian.HT
  shi_dong_bing[]
  suo_sheng_bing[]

meridian.SI
  shi_dong_bing[]
  suo_sheng_bing[]
```

Do not create:

```text
pattern.heart_channel_shi_dong
pattern.small_intestine_channel_suo_sheng
```

unless future curriculum/UI requirements specifically need those as educational entities.

---

# 17. Channel Excess / Deficiency

The user's channel notes often contain clinically useful “excess tendency” and “deficiency tendency” sections.

Example pattern:

```text
meridian.LI:
  excess:
    heat, swelling, tooth/throat pain, constipation...
  deficiency:
    cold, weakness, muscle atrophy, chronic diarrhea...
```

This should be represented as **channel state descriptors**, not automatically as independent Pattern cards.

Recommended fields:

```text
channel_state:
  channel_id
  state: excess | deficiency
  manifestations[]
  provenance[]
```

Only promote if multiple accepted sources define a stable syndrome with distinct treatment principles.

---

# 18. Luo Vessel 絡脈 pathology

## Why Luo pathology deserves its own structured layer

The user's Du, Ren and Bladder files preserve explicit classical-style Luo excess/deficiency distinctions.

Examples:

### Du Luo
- Excess: spinal stiffness
- Deficiency: heavy head / swaying instability

### Ren Luo
- Excess: abdominal skin pain
- Deficiency: abdominal skin itching

### Bladder Luo / Feiyang
- Excess: nasal congestion, discharge, head/back pain
- Deficiency: clear nasal discharge, epistaxis

These are **excellent graphable entities**.

Recommended data model:

```text
luo_pathology:
  channel_id
  luo_point_id
  state: excess | deficiency
  manifestations[]
  source
```

### Important
Do not inflate the main Pattern library with 15+ Luo excess/deficiency cards unless the learning UI later requires them.

---

# 19. Sinew Channels 經筋

## Core ontology

Jingjin pathology is primarily musculoskeletal and trajectory-based.

The user's Bladder sinew-channel notes show long chains of:
- binding/knotting at joints
- tendon/muscle continuity
- posterior-chain trajectory
- neck/back/heel/face involvement

Recommended Jingjin pathology dimensions:

```text
jingjin:
  channel
  pain
  contraction
  stiffness
  spasm
  flaccidity
  weakness
  restricted_rom
  trajectory_sites[]
```

---

## JT01 — Sinew Channel Contraction
**Chinese:** 經筋拘急  
**Preferred English:** Sinew-Channel Contraction  
**Family:** `jing_luo`  
**Subsystem:** sinew channel  
**Status:** `NEW_CANONICAL_CANDIDATE` / `MECHANISM_NODE`

### Discriminator
- contraction/tightness
- pain
- restricted ROM
- trajectory-based muscular/tendinous pattern

### Modifiers
- Cold
- Wind
- Dampness
- Heat
- trauma/stasis

---

## JT02 — Sinew Channel Flaccidity
**Chinese:** 經筋弛緩 / 經筋不利  
**Preferred English:** Sinew-Channel Flaccidity  
**Family:** `jing_luo`  
**Subsystem:** sinew channel  
**Status:** `CANONICAL_REVIEW_REQUIRED`

### Clinical direction
- weakness
- reduced support
- laxity
- impaired movement

### Differential
Do not equate with:
- Wei Syndrome
- neurologic weakness
- muscle atrophy

Those require separate disease/biomedical reasoning.

---

# 20. Cutaneous Regions 皮部

The cutaneous regions represent superficial expression and channel territory.

Recommended use:
- exterior pathogen location
- skin manifestation mapping
- sensory/temperature change
- palpation / dermatologic distribution

Do **not** create a generic Pattern card for each skin region.

Preferred architecture:

```text
cutaneous_region
  → belongs_to_channel
  → manifestations
  → exterior_pathogen_relation
```

---

# 21. Channel-based pain / numbness should be relations

AcuTing should avoid creating:

```text
pattern.LU_channel_pain
pattern.HT_channel_pain
pattern.SI_channel_pain
...
```

Instead:

```text
sym.pain
  → follows_channel
  → meridian.SI

sym.numbness
  → follows_channel
  → meridian.HT
```

and, when the mechanism is known:

```text
pattern.channel_qi_blood_obstruction
  → affects
  → meridian.SI
```

This keeps the ontology compact and graph-native.

---

# 22. Extraordinary Vessel vs TCM disease boundaries

## Sleep
- Yin Qiao / Yang Qiao imbalance can relate to sleep-wake dysfunction.
- insomnia itself remains symptom / disease context.
- do not equate every insomnia case with Yang Qiao pathology.

## Gynecology
- Chong / Ren / Dai can relate to menstrual, fertility, pregnancy and discharge disorders.
- these remain `tdis.*` contexts.
- underlying vessel Pattern must have discriminating evidence.

## Neurology
- Du / Qiao / Wei vessels include stroke, seizure, facial deviation and weakness in traditional indications.
- these are **not diagnostic equivalences**.
- safety/referral content must remain separate.

## Musculoskeletal
- trajectory pain can implicate primary channel, Jingjin, Qiao/Wei/Dai vessels.
- the same pain can fit multiple channel systems.
- do not infer a canonical vessel Pattern from one painful location.

---

# 23. Vessel relationship map

High-value graph relations:

```text
Chong Mai
  → related_to → menstruation / Blood / reproduction
  → shares_lower_origin_with → Ren / Du
  → may_show → Qi rebellion upward

Ren Mai
  → related_to → Yin channels / anterior midline / reproductive function

Du Mai
  → related_to → Yang channels / spine / brain

Dai Mai
  → binds → longitudinal channels
  → related_to → waist / pelvis / vaginal discharge

Yin Qiao
  → paired_function_with → Yang Qiao
  → regulates → sleep-wake / eye opening / medial-lateral tone

Yang Qiao
  → paired_function_with → Yin Qiao
  → regulates → sleep-wake / eye opening / medial-lateral tone

Yin Wei
  → links → Yin channels
  → emphasizes → interior / chest-abdomen

Yang Wei
  → links → Yang channels
  → emphasizes → exterior / cold-heat fluctuation
```

Use existing relation vocabulary where possible.

---

# 24. Highest-priority Batch 08 promotion queue

## Tier A
1. Dai Mai Dysfunction 帶脈失約
2. Yin Qiao Mai Imbalance 陰蹺脈失調
3. Yang Qiao Mai Imbalance 陽蹺脈失調
4. Yang Wei Mai Disharmony 陽維脈失調
5. Chong Mai Qi Rebellion 衝氣上逆
6. Channel Qi-Blood Obstruction 經絡氣血痹阻
7. Phlegm Obstructing Channels 痰阻經絡
8. Blood Stasis Obstructing Channels 血瘀阻絡
9. Sinew-Channel Contraction 經筋拘急

## Tier B
10. Yin Wei Mai Disharmony 陰維脈失調
11. Du Mai Obstruction 督脈痹阻
12. Cold Obstructing Channels 寒凝經脈
13. Sinew-Channel Flaccidity 經筋弛緩
14. Wind-Phlegm Obstructing Channels 風痰阻絡
15. Chong-Ren Deficiency 衝任虛損

## Structured layer, not main Pattern library by default
- Ren Luo excess/deficiency
- Du Luo excess/deficiency
- individual primary-channel excess/deficiency
- individual Shi-Dong / Suo-Sheng sets
- each Jingjin trajectory
- each cutaneous region

---

# 25. Suggested Antigravity staging schema

```json
{
  "candidate_id": "ev.yang_qiao_imbalance",
  "name_zh": "陽蹺脈失調",
  "name_en": "Yang Qiao Mai Imbalance",
  "primary_family": "jing_luo",
  "channel_subsystem": "extraordinary_vessel",
  "vessel_refs": ["YANG_QIAO"],
  "candidate_status": "new_canonical_if_absent",
  "identity_discriminators": [
    "陰緩陽急",
    "insomnia/wakefulness tendency",
    "lateral tightness with medial flaccidity"
  ],
  "supporting_manifestations": [
    "eye symptoms",
    "lateral lower-limb pain",
    "shoulder-neck tension"
  ],
  "tdis_contexts": [],
  "point_relation_candidates": ["BL62"],
  "source_files": [
    "陽蹺脈_完整整理.md"
  ],
  "notes": "Do not equate insomnia alone with Yang Qiao pathology."
}
```

---

# 26. Implementation rules for Antigravity

1. Read the live Pattern registry/library/alias maps first.
2. Read the meridian and acupoint registries before creating relations.
3. Use exact vessel/channel IDs already present.
4. Do not duplicate the meridian library inside Pattern cards.
5. A channel route is not a Pattern.
6. A point indication is not a Pattern.
7. A disease commonly treated by a vessel is not equivalent to vessel pathology.
8. Exact classical pathology statements deserve higher confidence than broad modern indication lists.
9. Separate:
   - classic text
   - textbook consensus
   - clinical interpretation
   - safety/red flags
10. Keep one primary Pattern family (`jing_luo`) unless schema says otherwise.
11. Prefer relations over giant compound Pattern IDs.
12. Do not create one Pattern per channel pain location.
13. Preserve Luo excess/deficiency as structured channel pathology.
14. Preserve Jingjin as a musculoskeletal channel subsystem.
15. Preserve TCM disease relations separately.
16. Resolve point IDs only against canonical point registry.
17. Never infer biomedical disease equivalence from channel indications.
18. Run relation and Pattern validators before commit.
19. Produce a candidate-review diff before promotion.

---

# 27. Source-quality guidance

The user's extraordinary-vessel files already mark source quality:

- **A:** classical/original text
- **B:** textbook consensus
- **C:** traditional clinical interpretation
- **D:** unverified direct disease mapping
- **Safety:** referral/red flags

Antigravity should preserve this hierarchy.

For canonical identity:
- A/B evidence can support Pattern discriminators.
- C can enrich manifestations/clinical notes.
- D should not establish canonical identity.
- Safety belongs to safety/referral layers.

---

# 28. Source inventory used for Batch 08

## User's extraordinary-vessel files
- `衝脈_完整整理.md`
- `任脈_CV_完整整理.md`
- `督脈_GV_完整整理.md`
- `帶脈_完整整理.md`
- `陰蹺脈_完整整理.md`
- `陽蹺脈_完整整理.md`
- `陰維脈_完整整理.md`
- `陽維脈_完整整理.md`

These files cite/organize material from sources such as:
- 《素問·骨空論》
- 《靈樞·脈度》
- 《靈樞·寒熱病》
- 《難經·二十八難》
- 《難經·二十九難》
- 《素問·痿論篇》
- 《經絡腧穴學》
- contemporary Chinese acupuncture textbooks

## User's primary-channel files
Representative files used for ontology design:
- `足太陽膀胱經_BL_完整整理.md`
- `手少陰心經_HT_整理.md`
- `手太陽小腸經_SI_整理.md`
- `手陽明大腸經_LI_整理.md`
- `足少陰腎經_KI_完整整理.md`
- `足太陰脾經_SP_整理.md`
- `手厥陰心包經_PC_完整整理.md`

These already preserve:
- 是動病
- 所生病
- excess / deficiency tendencies
- Luo pathology
- Jingjin
- cutaneous-region data

---

# 29. Next recommended research batch

## Batch 09 — Pattern ↔ Symptom ↔ Tongue ↔ Pulse Differential Matrix

Instead of extracting more names immediately, Batch 09 should create a **diagnostic discriminator layer** across the V2 candidate pool.

Recommended structure:

```text
Pattern candidate
→ must-have / high-weight signs
→ supporting signs
→ tongue
→ coating
→ pulse
→ key negative findings
→ nearest confusable Patterns
→ discriminator
→ source provenance
```

High-value comparison clusters:

### Heat / Fire
- Stomach Heat vs Stomach Fire
- Liver Fire vs Liver Yang Rising
- Heart Fire vs Phlegm-Fire Disturbing Heart
- Blood Heat vs Xue-stage Heat

### Exterior / stage
- Wind-Cold vs Tai Yang Shang Han
- Wind-Cold exterior deficiency vs Tai Yang Zhong Feng
- Wind-Heat vs Wei-stage Wind-Heat
- Lung Heat vs Qi-stage Lung Heat

### Deficiency
- Kidney Qi Deficiency vs Kidney Qi Not Firm
- Kidney Yin Deficiency vs Kidney Jing Deficiency
- Heart Blood Deficiency vs Heart Yin Deficiency
- Spleen Qi Deficiency vs Spleen Qi Sinking

### Channel/vessel
- Yin Qiao vs Yang Qiao imbalance
- Shao Yang vs Yang Wei disharmony
- Chong Qi Rebellion vs Liver Qi rebellion / Stomach Qi rebellion
- Dai Mai dysfunction vs Spleen-Damp vaginal discharge

This discriminator layer will reduce future canonical duplication and improve both board-study mode and clinical reasoning.

---

## End of Batch 08

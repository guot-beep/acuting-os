# AcuTing OS — TCM Pattern Expansion Research Pack v0.3
## Batch 03 — Full Zang-Fu Expansion Candidate Pack

**Date:** 2026-08-08  
**Research layer:** ChatGPT  
**Repository implementation layer:** Claude / Sonnet  
**Status:** Staging / canonical review only. **Do not bulk-create `pattern.*` IDs from this file.**

---

# 0. Scope and method

This batch expands the Zang-Fu candidate layer beyond the current 59-card V1 baseline.

It is designed to answer a future implementation question:

> “If this concept is not already represented in the canonical registry/library/alias graph, is there enough source-backed information to decide whether it deserves a Pattern card, an alias, a subtype relation, a progression relation, or only a source-context note?”

### Source stack used in this pass

**Primary clinical structure**
- Sacred Lotus Zang-Fu Pattern Differentiation pages

**Graph / aliases / progression cross-check**
- Me & Qi pattern pages where available

**Theory / classification cross-check**
- Shen-Nong Zang-Fu differentiation

**Formula and board anchors**
- User-uploaded American Dragon / NCBAHM 181/201 formula extractions
- User-uploaded AcuTing Pattern V1 / expansion packs

### Important ontology rule

A formula source using a phrase such as “X with Y” is **evidence for a relationship**, not automatic proof that `pattern.x_with_y` should become a standalone canonical node.

---

# 1. Canonical review statuses

- `likely_existing_core` — very likely already represented in the current 59; use this packet for alias/relationship enrichment, not duplication
- `distinct_candidate` — strong candidate for future canonical Pattern if absent
- `subtype_review` — likely narrower form of a broader Pattern
- `progression_review` — better modeled as A → progresses/transforms into → B unless the repo has a stable independent concept
- `combined_graph_preferred` — likely best represented by multiple canonical Patterns connected in graph
- `tdis_boundary_review` — wording may be TCM disease/context rather than Pattern
- `terminology_review` — normalize Chinese/English naming before promotion
- `source_context_only` — keep as provenance/context unless stronger support emerges

---

# 2. HEART / SMALL INTESTINE

## H01 — Heart Qi Deficiency · 心氣虛 · Xīn Qì Xū

**Status:** `likely_existing_core`

**Core mechanism**
Heart Qi is insufficient to propel Blood and support Heart/Shen function.

**Key signs**
- palpitations
- shortness of breath, especially with exertion
- fatigue / weakness
- spontaneous sweating
- pale or dull complexion
- symptoms worse with exertion

**Tongue / pulse**
- Tongue: pale
- Pulse: weak; may be deficient, especially at Heart position

**Treatment principle**
Tonify Heart Qi; support circulation and calm the Shen when needed.

**Formula anchors**
- Zhi Gan Cao Tang
- Sheng Mai San in combined Heart/Lung Qi-deficiency contexts

**Point candidates**
- HT-5
- PC-6
- BL-15
- REN-17
- ST-36

**Differential**
- Heart Blood Deficiency: more pale/dry Blood-deficiency signs and sleep/memory symptoms
- Heart Yang Deficiency: adds pronounced Cold signs
- Lung Qi Deficiency: respiratory/Wei-Qi picture dominates

**Progression**
Heart Qi Deficiency → may deepen into → Heart Yang Deficiency

**Sources**
- Sacred Lotus Heart Pattern Differentiation
- AD/NCBAHM: Zhi Gan Cao Tang → Heart Qi Deficiency

---

## H02 — Heart Yang Deficiency · 心陽虛 · Xīn Yáng Xū

**Status:** `likely_existing_core`

**Core mechanism**
Heart Qi deficiency progresses to loss of Yang warming/propelling function.

**Key signs**
- palpitations
- fatigue
- shortness of breath on exertion
- spontaneous sweating
- chest discomfort
- cold limbs / aversion to cold
- bright-pale complexion

**Tongue / pulse**
- Tongue: pale, swollen, wet
- Pulse: deep, weak; may become knotted in severe cases

**Treatment principle**
Warm and tonify Heart Yang; support Qi; restore circulation.

**Formula anchors**
- Zhi Gan Cao Tang in deficient pulse presentations
- Si Ni Tang when severe Yang collapse physiology is the source context
- Ling Gui Zhu Gan Tang when Water Qi insults Heart

**Point candidates**
- HT-5
- PC-6
- BL-15
- REN-17
- REN-6

**Differential**
- Heart Qi Deficiency: no marked Cold
- Kidney Yang Deficiency: lumbar, reproductive/urinary and water-metabolism signs dominate
- Heart Yang Collapse: acute/severe endpoint, not merely chronic deficiency

**Progression**
Heart Qi Deficiency → Heart Yang Deficiency → possible Yang-collapse presentation

**Source**
- Sacred Lotus Heart Pattern Differentiation

---

## H03 — Heart Blood Deficiency · 心血虛 · Xīn Xuè Xū

**Status:** `likely_existing_core`

**Core mechanism**
Heart/Shen lacks nourishment from Blood.

**Key signs**
- palpitations
- insomnia / difficulty staying asleep
- dream-disturbed sleep
- poor memory
- dizziness
- anxiety/restlessness of deficiency type
- pale complexion/lips

**Tongue / pulse**
- Tongue: pale, possibly thin/dry
- Pulse: thin/fine, weak

**Treatment principle**
Nourish Heart Blood; calm Shen.

**Formula anchors**
- Suan Zao Ren Tang
- Gui Pi Tang where Heart-Spleen deficiency is the root
- Gan Mai Da Zao Tang in source-specific Heart Blood deficiency presentations

**Differential**
- Heart Yin Deficiency: red tongue, Empty Heat, night sweating
- Heart Qi Deficiency: fatigue/SOB/sweating predominate
- Liver Blood Deficiency: eyes/sinews/menstrual/numbness signs predominate

**Source anchors**
- AD: Suan Zao Ren Tang → Heart Blood Deficiency
- AD: Gan Mai Da Zao Tang → Heart Blood Deficiency with Liver Qi Stagnation

---

## H04 — Heart Yin Deficiency · 心陰虛 · Xīn Yīn Xū

**Status:** `likely_existing_core`

**Core mechanism**
Heart Yin/Blood nourishment is depleted; deficiency Heat may disturb Shen.

**Key signs**
- palpitations
- insomnia
- anxiety/restlessness
- poor memory
- night sweats
- five-center heat / afternoon heat when Empty Heat develops
- dry mouth/throat at night

**Tongue / pulse**
- Tongue: red, reduced or absent coat
- Pulse: thin and rapid

**Treatment principle**
Nourish Heart Yin; clear deficiency Heat if present; calm Shen.

**Formula anchors**
- Tian Wang Bu Xin Dan
- Huang Lian E Jiao Tang in Heart/Kidney Yin-deficiency / Shao Yin Heat contexts
- Zhu Sha An Shen Wan only as source context for Heart Fire with Blood/Yin deficiency, not a generic Heart Yin deficiency formula

**Differential**
- Heart Blood Deficiency: pale rather than red tongue; no Empty Heat
- Heart Fire: full Excess Heat rather than depleted Yin
- Heart-Kidney Yin Deficiency: Kidney cluster is also present

---

## H05 — Heart Fire Blazing / Heart Fire Flaring Up · 心火亢盛 / 心火上炎 · Xīn Huǒ Kàng Shèng

**Status:** `likely_existing_core` / `terminology_review`

**Key signs**
- mental restlessness / agitation
- insomnia
- thirst
- mouth/tongue ulcers
- red face
- bitter taste may occur
- dark/scanty urine when Heat transfers downward

**Tongue / pulse**
- Tongue: red, especially tip; yellow coat possible
- Pulse: rapid, overflowing/forceful depending severity

**Treatment principle**
Clear Heart Fire; calm Shen; protect fluids.

**Formula anchors**
- Dao Chi San
- Zhu Sha An Shen Wan in Heart Fire with underlying Blood/Yin deficiency
- Liang Ge San in broader Upper/Middle Jiao Heat contexts

**Point candidates**
- HT-8
- HT-9
- PC-8
- DU-14
- REN-14

**Graph relation**
Heart Fire → may_transfer_to → Small Intestine Heat

**Source anchors**
- AD Dao Chi San: Heart Fire Flaring Up + Small Intestine Excess Heat
- AD Liang Ge San: Heart Fire Flaring Up

---

## H06 — Phlegm-Fire Disturbing Heart · 痰火擾心 · Tán Huǒ Rǎo Xīn

**Status:** `distinct_candidate`

**Core mechanism**
Phlegm obstructs clear Heart/Shen function while Heat/Fire agitates the mind.

**Key signs**
- agitation
- insomnia
- anxiety or mental restlessness
- chest oppression
- nausea/phlegm signs
- bitter taste / Heat signs
- severe presentations may involve confusion or manic behavior in traditional descriptions

**Tongue / pulse**
- Tongue: red with yellow greasy coat
- Pulse: slippery, rapid; may be wiry

**Treatment principle**
Clear Heat/Fire; transform Phlegm; regulate Qi; calm Shen.

**Formula anchors**
- Wen Dan Tang
- Ci Zhu Wan

**Differential**
- Heart Fire: lacks prominent Phlegm/greasy coat
- Phlegm Misting Heart: more turbidity/obstruction, less Heat
- Gallbladder-Stomach Disharmony with Phlegm-Heat: GI/Gallbladder cluster more prominent

**Relations**
Phlegm-Damp + Heat → may_form → Phlegm-Fire Disturbing Heart

**Source anchor**
- AD Wen Dan Tang → Phlegm-Fire Disturbs Heart

---

## H07 — Phlegm Misting / Obstructing Heart Orifices · 痰蒙心竅 / 痰阻心竅 · Tán Méng Xīn Qiào

**Status:** `distinct_candidate` / `terminology_review`

**Core mechanism**
Turbid Phlegm obstructs the Heart orifices and impairs clear consciousness/Shen.

**Clinical clue cluster**
- clouded consciousness
- confusion
- dull affect
- chest/phlegm signs
- greasy tongue coating
- slippery pulse

**Hot subtype**
Phlegm-Heat obstructing Heart orifices may add red tongue, yellow greasy coat, agitation, fever/Heat signs.

**Treatment principle**
Transform Phlegm; open orifices; clear Heat when Heat is present.

**Formula anchors**
- Ling Jiao Gou Teng Yin in AD source: Phlegm obstructing Heart orifice, tense/Yang-obstruction type
- opening-orifice formulas are source-context only and require safety-aware handling

**Ontology note**
Consider:
- broad `Phlegm Misting Heart`
- subtype `Phlegm-Heat Obstructing Heart Orifices`
rather than collapsing all presentations into one label.

---

## H08 — Small Intestine Excess Heat · 小腸實熱 / 小腸熱盛 · Xiǎo Cháng Shí Rè

**Status:** `distinct_candidate` if absent

**Core mechanism**
Excess Heat in the Small Intestine, often conceptually related to Heart Fire transmitting downward.

**Key signs**
- dark/scanty urine
- painful urination
- thirst
- irritability
- mouth/tongue sores when Heart Fire is part of the picture
- possible lower abdominal discomfort

**Tongue / pulse**
- Tongue: red, yellow coat
- Pulse: rapid

**Treatment principle**
Clear Heart/Small-Intestine Heat; promote urination.

**Formula anchors**
- Dao Chi San
- Ba Zheng San when Heat/Damp-Heat urinary obstruction dominates

**Graph**
Heart Fire → may_transfer_to → Small Intestine Excess Heat

**Source**
- AD Dao Chi San: Small Intestine Excess Heat; Heat in Heart and Small Intestine channels

---

## H09 — Small Intestine Deficiency Cold · 小腸虛寒 · Xiǎo Cháng Xū Hán

**Status:** `distinct_candidate`

**Core mechanism**
Small Intestine warming/separating function weakened by deficiency Cold, often overlapping Middle-Jiao/Spleen Yang deficiency.

**Clinical direction**
- chronic abdominal pain relieved by warmth/pressure
- borborygmus
- loose stools
- cold signs
- weak digestive function

**Tongue / pulse**
- Tongue: pale, wet
- Pulse: deep, weak, slow

**Treatment principle**
Warm and strengthen the Middle/Small Intestine; dispel deficiency Cold.

**Formula anchor**
- Li Zhong Wan source explicitly lists Small Intestine Deficiency Cold

**Ontology note**
Review whether this is independently useful or better treated as a Fu-organ manifestation of Middle Jiao / Spleen Yang deficiency.

---

# 3. LUNG / LARGE INTESTINE

## L01 — Lung Qi Deficiency · 肺氣虛 · Fèi Qì Xū

**Status:** `likely_existing_core`

**Core mechanism**
Lung Qi cannot adequately govern respiration, dispersing/descending, or Wei Qi.

**Key signs**
- weak cough
- shortness of breath
- weak/soft voice
- fatigue
- spontaneous sweating
- susceptibility to exterior illness
- symptoms worse with exertion

**Tongue / pulse**
- Tongue: pale
- Pulse: weak, especially Lung position

**Treatment principle**
Tonify Lung Qi; strengthen Wei Qi when needed.

**Formula anchors**
- Yu Ping Feng San
- Sheng Mai San when Qi + Yin deficiency is present
- Bu Fei-type formulas if present in repo corpus

**Point candidates**
- LU-9
- LU-7
- BL-13
- REN-17
- ST-36

**Differential**
Lung Yin Deficiency has dryness/Empty Heat; Spleen Qi Deficiency has stronger digestive signs.

**Sources**
- Sacred Lotus Lung patterns
- AD Yu Ping Feng San → Lung Qi Deficiency

---

## L02 — Lung Yin Deficiency · 肺陰虛 · Fèi Yīn Xū

**Status:** `likely_existing_core`

**Key signs**
- dry cough, little sputum
- dry throat/mouth
- hoarse voice
- night sweats or afternoon Heat if advanced
- possible blood-streaked sputum in traditional pattern descriptions

**Tongue / pulse**
- Tongue: red, dry, little/no coat
- Pulse: thin, rapid

**Treatment principle**
Nourish Lung Yin; moisten Lung; clear deficiency Heat if present.

**Formula anchors**
- Mai Men Dong Tang
- Sheng Mai San for Lung Qi and Yin deficiency
- Bai He Gu Jin Tang if present in formula registry

**Differential**
- Lung Dryness: may be exterior/seasonal and less constitutionally deficient
- Lung Heat: fuller Heat, yellow sputum
- Kidney-Lung Yin Deficiency: Kidney cluster present

---

## L03 — Lung Dryness · 肺燥 · Fèi Zào

**Status:** `distinct_candidate` or `broader_narrower_review`

**Core mechanism**
Dryness impairs Lung moistening and descending.

**Key signs**
- dry cough
- dry nose/throat
- scanty sticky sputum
- dry skin/mouth

**Tongue / pulse**
- Tongue: dry
- Pulse varies by Cold-Dryness vs Warm-Dryness

**Treatment principle**
Moisten Lung; generate fluids; release exterior when external Dryness is present.

**Formula anchors**
- Sang Xing Tang → Warm-Dryness / external Wind with Heat and Dryness
- Xing Su San → cool Dryness / mild Wind-Cold with Dryness
- Bei Mu Gua Lou San → Phlegm-Dryness

**Ontology note**
Likely needs subtypes:
- Warm-Dryness Attacking Lung 溫燥犯肺
- Cool-Dryness Attacking Lung 涼燥犯肺

---

## L04 — Wind-Cold Attacking Lung · 風寒犯肺 · Fēng Hán Fàn Fèi

**Status:** `distinct_candidate`

**Key signs**
- cough
- clear/white sputum
- aversion to cold
- body aches
- no sweat or mild sweat depending subtype
- nasal congestion / clear discharge

**Tongue / pulse**
- Tongue coat: thin white
- Pulse: floating, tight in excess Cold

**Treatment principle**
Release exterior; disperse Wind-Cold; diffuse Lung Qi.

**Formula anchors**
- Ma Huang Tang
- Xiao Qing Long Tang when thin mucus/water retention is prominent

**Differential**
- generic Wind-Cold exterior pattern
- Cold-Phlegm obstructing Lung
- Wind-Heat attacking Lung

---

## L05 — Wind-Heat Attacking Lung · 風熱犯肺 · Fēng Rè Fàn Fèi

**Status:** `distinct_candidate`

**Key signs**
- fever more than chills
- sore throat
- cough
- thirst
- yellow or sticky sputum may appear
- nasal congestion

**Tongue / pulse**
- Tongue: red edges/tip, thin yellow coat
- Pulse: floating, rapid

**Treatment principle**
Release exterior; disperse Wind-Heat; diffuse/clear Lung.

**Formula anchors**
- Yin Qiao San
- Sang Ju Yin
- Ma Xing Shi Gan Tang when Lung Heat/wheezing becomes more interior

**Point candidates**
- LI-4
- LI-11
- LU-5
- LU-7
- DU-14

**Source**
- Sacred Lotus Lung patterns
- user AD pattern extraction and formula corpus

---

## L06 — Phlegm-Damp Obstructing Lung · 痰濕阻肺 · Tán Shī Zǔ Fèi

**Status:** `likely_existing_core`

**Key signs**
- cough with copious white/thin or frothy sputum
- chest oppression/fullness
- wheezing/dyspnea
- nausea/dizziness may occur
- poor appetite / edema may coexist

**Tongue / pulse**
- Tongue: pink/pale; thick white greasy coat
- Pulse: slippery, possibly wiry

**Treatment principle**
Transform Phlegm; dry Dampness; strengthen Spleen; descend Lung Qi.

**Formula anchors**
- Er Chen Tang
- Su Zi Jiang Qi Tang
- Ling Gui Zhu Gan Tang depending fluid/root pattern

**Point candidates**
- LU-9
- ST-40
- REN-17
- REN-22
- ST-36
- BL-13
- BL-20

**Source**
- user `02_AD_PATTERN_SPLEEN_LUNG.md`

---

## L07 — Phlegm-Heat Obstructing Lung · 痰熱壅肺 · Tán Rè Yōng Fèi

**Status:** `distinct_candidate`

**Key signs**
- cough
- copious thick yellow sputum
- chest oppression
- wheezing / dyspnea
- thirst
- Heat signs

**Tongue / pulse**
- Tongue: red with yellow greasy coat
- Pulse: slippery, rapid

**Treatment principle**
Clear Lung Heat; transform Phlegm; descend Lung Qi.

**Formula anchors**
- Qing Qi Hua Tan Wan if present
- Ding Chuan Tang in appropriate source pattern
- Ma Xing Shi Gan Tang when Heat in Lung with wheezing but less Phlegm emphasis

**Differential**
- Lung Heat without substantial Phlegm
- Phlegm-Damp
- Wind-Heat attacking Lung

---

## L08 — Phlegm-Fluids / Thin Mucus Obstructing Lung · 痰飲停肺 / 水飲犯肺 · Tán Yǐn Tíng Fèi

**Status:** `distinct_candidate` / `terminology_review`

**Core mechanism**
Thin retained fluids obstruct Lung dispersing/descending.

**Key signs**
- cough
- copious thin watery sputum
- wheezing
- chest fullness
- possible edema/fluid signs

**Tongue / pulse**
- Tongue: pale, wet with white slippery coat
- Pulse: slippery; may be deep

**Treatment principle**
Warm/transform retained fluids where Cold predominates; restore Lung Qi movement.

**Formula anchors**
- Xiao Qing Long Tang
- Ling Gui Zhu Gan Tang
- Zhen Wu Tang when Kidney/Spleen Yang deficiency drives water flooding

**Ontology note**
Distinguish `Tan Yin 痰飲` fluid pathology from ordinary Phlegm-Damp.

---

## LI01 — Large Intestine Heat / Colon Excess Heat · 大腸實熱 · Dà Cháng Shí Rè

**Status:** `distinct_candidate`

**Key signs**
- constipation
- dry hard stools
- abdominal fullness/pain
- thirst
- fever or strong Heat signs in severe cases

**Tongue / pulse**
- Tongue: red with yellow/dry coat
- Pulse: full, rapid

**Treatment principle**
Clear/purge Heat; move stool; protect fluids when needed.

**Formula anchors**
- Da Cheng Qi Tang
- Xiao Cheng Qi Tang
- Liang Ge San in Upper/Middle Jiao Heat plus constipation contexts

**Source**
- AD/NCBAHM formula corpus explicitly lists Colon Excess Heat

---

## LI02 — Large Intestine Dryness / Fluid Deficiency · 大腸津虧 / 腸燥津虧 · Dà Cháng Jīn Kuī

**Status:** `distinct_candidate`

**Key signs**
- dry stools / constipation
- difficulty passing stool
- dryness
- often older, postpartum or chronic deficiency contexts in traditional differentiation

**Tongue / pulse**
- Tongue: dry
- Pulse: fine/choppy depending Blood/Fluid deficiency

**Treatment principle**
Nourish fluids; moisten intestines.

**Formula anchors**
- Ma Zi Ren Wan source: deficiency of fluid in Colon; dry Heat retention due Jin-Ye deficiency
- Run Chang Wan where Blood deficiency contributes

**Differential**
Colon Heat has more forceful Heat signs; Blood-deficiency constipation has stronger pallor/dizziness/menstrual clues.

---

## LI03 — Large Intestine Damp-Heat · 大腸濕熱 · Dà Cháng Shī Rè

**Status:** `distinct_candidate`

**Key signs**
- diarrhea or dysenteric stool
- urgency/tenesmus
- abdominal pain
- foul stools
- burning anus
- thirst without strong desire to drink when Dampness predominates

**Tongue / pulse**
- Tongue: red with yellow greasy coat
- Pulse: slippery, rapid

**Treatment principle**
Clear Heat; resolve Dampness; regulate Qi and intestines.

**Formula anchors**
- Shao Yao Tang
- Ge Gen Huang Qin Huang Lian Tang
- Da Cheng Qi Tang source includes San Jiao–Large Intestine Damp-Heat

---

## LI04 — Large Intestine Cold · 大腸寒 · Dà Cháng Hán

**Status:** `subtype_review`

**Key signs**
- abdominal pain
- loose stools/diarrhea
- cold signs
- pain relieved by warmth

**Tongue / pulse**
- Tongue: pale, wet
- Pulse: deep, slow/tight depending excess vs deficiency

**Formula anchor**
- Fu Zi Li Zhong Wan source explicitly lists Colon Cold

**Ontology note**
Separate:
- excess Cold invasion
- deficiency Cold from Spleen/Kidney Yang deficiency
if the source system supports both.

---

# 4. SPLEEN / STOMACH

## SP01 — Spleen Qi Deficiency · 脾氣虛 · Pí Qì Xū

**Status:** `likely_existing_core`

**Key signs**
- poor appetite
- abdominal distension after eating
- loose stools
- fatigue
- weak limbs
- pale complexion

**Tongue / pulse**
- Tongue: pale, swollen/teeth marks
- Pulse: weak

**Treatment principle**
Tonify Spleen Qi; strengthen transformation/transportation.

**Formula anchors**
- Si Jun Zi Tang
- Shen Ling Bai Zhu San when Dampness prominent
- Liu Jun Zi Tang when Phlegm-Damp also present

**Progression**
Spleen Qi Deficiency → may_generate → Dampness / Phlegm
Spleen Qi Deficiency → may_deepen_to → Spleen Yang Deficiency
Spleen Qi Deficiency → may_lead_to → Spleen Qi Sinking / Spleen Not Controlling Blood

**Source**
- Sacred Lotus Spleen patterns

---

## SP02 — Spleen Yang Deficiency · 脾陽虛 · Pí Yáng Xū

**Status:** `likely_existing_core`

**Key signs**
Spleen Qi deficiency signs plus:
- cold limbs
- abdominal pain better warmth/pressure
- watery stools
- edema
- chilliness

**Tongue / pulse**
- Tongue: pale, swollen, wet
- Pulse: deep, weak, slow

**Treatment principle**
Warm and tonify Spleen Yang.

**Formula anchors**
- Li Zhong Wan
- Fu Zi Li Zhong Wan
- Shi Pi Yin when edema from severe Spleen Yang deficiency

**Differential**
Kidney Yang deficiency has stronger low-back, urinary/reproductive signs.

---

## SP03 — Spleen Qi Sinking · 脾氣下陷 / 中氣下陷 · Pí Qì Xià Xiàn

**Status:** `likely_existing_core` / `terminology_review`

**Key signs**
- chronic Spleen Qi deficiency
- bearing-down sensation
- organ prolapse
- chronic diarrhea
- fatigue worse standing/exertion

**Tongue / pulse**
- Tongue: pale
- Pulse: weak, possibly deep

**Treatment principle**
Tonify Qi; raise Yang / lift sinking Qi.

**Formula anchor**
- Bu Zhong Yi Qi Tang → Central Qi sinking

---

## SP04 — Spleen Not Controlling Blood · 脾不統血 · Pí Bù Tǒng Xuè

**Status:** `likely_existing_core`

**Key signs**
- chronic bleeding tendency with Spleen Qi deficiency picture
- easy bruising
- heavy/prolonged menstrual bleeding
- blood in stool or other deficiency-type bleeding contexts
- fatigue, poor appetite

**Tongue / pulse**
- Tongue: pale
- Pulse: weak

**Treatment principle**
Tonify Spleen Qi; secure Blood.

**Formula anchors**
- Gui Pi Tang
- Bu Zhong Yi Qi Tang source explicitly lists Spleen not governing Blood
- Li Zhong Wan source includes bleeding from Spleen Yang deficiency

**Differential**
Blood Heat bleeding: red tongue/rapid pulse/Heat
Blood Stasis bleeding: dark/purple, clots/fixed pain

---

## SP05 — Cold-Damp Encumbering Spleen · 寒濕困脾 · Hán Shī Kùn Pí

**Status:** `likely_existing_core`

**Key signs**
- epigastric/abdominal fullness
- poor appetite
- nausea
- loose stools
- heaviness
- fatigue
- bland/sticky taste
- cold signs

**Tongue / pulse**
- Tongue: pale or normal; thick white greasy coat
- Pulse: slippery/soggy, slow

**Treatment principle**
Warm Middle; dry/transform Dampness; regulate Qi.

**Formula anchors**
- Ping Wei San
- Huo Xiang Zheng Qi Tang in exterior Wind-Cold + Middle-Jiao Damp context

---

## SP06 — Damp-Heat Invading Spleen / Spleen-Stomach Damp-Heat · 濕熱困脾 / 脾胃濕熱 · Shī Rè Kùn Pí

**Status:** `distinct_candidate` or `likely_existing_core`

**Key signs**
- epigastric fullness
- nausea
- poor appetite
- heaviness
- sticky sensation
- thirst without strong desire to drink
- loose/foul stools
- Heat signs

**Tongue / pulse**
- Tongue: red or normal-red with yellow greasy coat
- Pulse: slippery, rapid/soggy

**Treatment principle**
Clear Heat; resolve Dampness; regulate Middle Jiao.

**Formula anchors**
- San Ren Tang
- Gan Lu Xiao Du Dan
- Lian Po Yin
- Xiao Feng San source: Damp-Heat injuring Spleen

---

## ST01 — Stomach Qi Deficiency · 胃氣虛 · Wèi Qì Xū

**Status:** `distinct_candidate` if not already represented

**Key signs**
- poor appetite
- early satiety
- epigastric weakness/discomfort
- fatigue after eating
- nausea/vomiting tendency from weak descending function

**Tongue / pulse**
- Tongue: pale
- Pulse: weak

**Treatment principle**
Tonify Stomach Qi; harmonize and restore descending.

**Formula anchor**
- Liu Jun Zi Tang source explicitly lists Stomach Qi deficiency
- Ju Pi Zhu Ru Tang: Stomach Heat with Stomach Qi deficiency

**Differential**
Spleen Qi deficiency has stronger loose stools/heaviness; Stomach Yin deficiency has dryness.

---

## ST02 — Stomach Cold · 胃寒 · Wèi Hán

**Status:** `distinct_candidate`

**Key signs**
- acute or chronic epigastric pain
- pain relieved by warmth
- vomiting clear fluids
- no thirst / preference warm drinks
- cold limbs where deficiency Cold is present

**Tongue / pulse**
- Tongue: pale with white coat
- Pulse: deep, slow/tight

**Treatment principle**
Warm Stomach; dispel Cold; descend rebellious Qi.

**Formula anchors**
- Li Zhong Wan
- Liang Fu Wan
- Fu Zi Li Zhong Wan

**Ontology note**
Separate excess Cold invasion from Stomach Deficiency Cold if repo schema supports both.

---

## ST03 — Stomach Fire · 胃火熾盛 · Wèi Huǒ Chì Shèng

**Status:** `already_registered_cardless` per current identity audit; future full card candidate

**Core distinction locked in AcuTing**
Stomach Fire is retained separately from Stomach Heat because some sources distinguish Fire as the more intense Heat-stage manifestation, while other sources use the terms interchangeably.

**Key signs**
- intense thirst, preference for cold
- strong hunger / rapid hunger
- burning epigastrium
- foul breath
- swollen/bleeding gums
- mouth ulcers
- constipation
- severe Heat may injure collaterals

**Tongue / pulse**
- Tongue: red, yellow/dry coat
- Pulse: rapid, forceful

**Treatment principle**
Clear Stomach Heat; drain Fire; protect/nourish fluids and Yin.

**Formula anchors**
- Qing Wei San → Stomach Fire Blazing + Stomach Heat
- Yu Nu Jian → Stomach Heat with Yin deficiency due to Stomach Fire injuring Yin

**Relations**
Stomach Heat → may_intensify_to → Stomach Fire
Stomach Fire → may_damage → Stomach Yin / fluids

---

## ST04 — Stomach Yin Deficiency / Stomach Fluid Deficiency · 胃陰虛 / 胃津不足 · Wèi Yīn Xū / Wèi Jīn Bù Zú

**Status:** `distinct_candidate` / `terminology_review`

**Key signs**
- poor appetite but possible hunger without desire to eat
- dry mouth/throat
- epigastric discomfort
- dry retching
- constipation
- thirst in small sips
- dryness

**Tongue / pulse**
- Tongue: red, peeled or little/no coat, especially center
- Pulse: thin, possibly rapid

**Treatment principle**
Nourish Stomach Yin; generate fluids; restore descending.

**Formula anchors**
- Zhu Ye Shi Gao Tang → Stomach fluid deficiency / Qi-stage Heat injuring fluids
- Mai Men Dong Tang
- Yu Nu Jian when Stomach Heat/Fire has damaged Yin

**Ontology note**
`Stomach Fluid Deficiency` may be earlier/milder or synonymic depending source; preserve aliases/provenance.

---

## ST05 — Rebellious Stomach Qi · 胃氣上逆 · Wèi Qì Shàng Nì

**Status:** `distinct_candidate`

**Key signs**
- nausea
- vomiting
- belching
- hiccups
- reflux/regurgitation

**Tongue / pulse**
Varies by underlying Cold/Heat/Phlegm/Qi stagnation.

**Treatment principle**
Harmonize Stomach; direct rebellious Qi downward; treat root pattern.

**Formula anchors**
- Ju Pi Zhu Ru Tang
- Xuan Fu Dai Zhe Tang
- Ding Xiang Shi Di Tang depending Heat/deficiency/Cold contexts

**Ontology note**
This is a functional-direction Pattern and can coexist with Stomach Heat, Cold, Qi deficiency, Liver invading Stomach, Phlegm, etc. Graph-friendly.

---

## ST06 — Food Accumulation in Stomach · 食積胃脘 / 食滯胃腸 · Shí Jī Wèi Wǎn

**Status:** `distinct_candidate`

**Key signs**
- epigastric/abdominal fullness
- pain worse after eating
- foul belching
- sour regurgitation
- nausea/vomiting
- poor appetite
- foul stools

**Tongue / pulse**
- Tongue: thick greasy coat
- Pulse: slippery/full

**Treatment principle**
Reduce food accumulation; harmonize Stomach; move Qi.

**Formula anchor**
- Bao He Wan

**Relations**
Food accumulation → may_generate → Heat
Food accumulation → may_generate → Phlegm/Dampness

---

## ST07 — Blood Stasis in Stomach · 胃絡瘀血 / 胃腑血瘀 · Wèi Luò Yū Xuè

**Status:** `distinct_candidate`

**Key signs**
- fixed stabbing epigastric pain
- worse with pressure
- pain after eating
- dark blood vomiting / dark stool in traditional descriptions

**Tongue / pulse**
- Tongue: purple or purple spots in center
- Pulse: wiry or choppy

**Treatment principle**
Invigorate Blood; remove stasis; restore Stomach descending.

**Points**
- REN-10
- ST-21
- ST-34
- SP-10
- BL-17
- BL-18

**Relations**
Long-standing Stomach Fire / Liver Qi invading Stomach / Food Retention → may_contribute_to → Stomach Blood Stasis

**Source**
- Sacred Lotus Stomach Pattern Differentiation

---

# 5. LIVER / GALLBLADDER

## LV01 — Liver Qi Stagnation · 肝氣鬱結 · Gān Qì Yù Jié

**Status:** `likely_existing_core`

**Key signs**
- hypochondriac/chest distension
- frequent sighing
- emotional constraint, irritability
- lump sensation in throat possible
- menstrual irregularity / breast distension in relevant contexts
- symptoms fluctuate with emotion

**Tongue / pulse**
- Tongue: often normal or slightly dusky sides
- Pulse: wiry

**Treatment principle**
Soothe Liver; spread/regulate Qi.

**Formula anchors**
- Chai Hu Shu Gan San
- Xiao Yao San
- Yue Ju Wan

**Progression**
Liver Qi Stagnation → may_transform_into → Heat/Fire
Liver Qi Stagnation → may_invade → Stomach/Spleen
Liver Qi Stagnation + Phlegm → may_form → Phlegm-Qi binding

---

## LV02 — Liver Qi Invading Stomach · 肝氣犯胃 · Gān Qì Fàn Wèi

**Status:** `distinct_candidate`

**Key signs**
- epigastric pain/distension
- belching
- nausea
- reflux/vomiting
- symptoms linked with frustration/stress
- hypochondriac tension may accompany

**Tongue / pulse**
- Tongue may be normal or red sides if Heat develops
- Pulse: wiry

**Treatment principle**
Soothe Liver; regulate Qi; harmonize Stomach; descend rebellious Qi.

**Formula anchors**
- Chai Hu Shu Gan San
- Xiao Yao San
- Zuo Jin Wan when Heat/Fire is present
- Liang Fu Wan when Cold is concurrent

**Differential**
Stomach Qi Stagnation lacks clear Liver/emotional/hypochondriac cluster.

---

## LV03 — Liver Qi Invading Spleen / Liver-Spleen Disharmony · 肝脾不和 / 肝氣犯脾 · Gān Pí Bù Hé

**Status:** `distinct_candidate` or `broader_narrower_review`

**Key signs**
- alternating abdominal pain/distension
- loose stools triggered by stress/emotion
- poor appetite
- hypochondriac tension
- irritability/sighing

**Tongue / pulse**
- Tongue may be normal/pale depending Spleen deficiency
- Pulse: wiry, possibly weak

**Treatment principle**
Soothe Liver; strengthen Spleen; regulate Qi.

**Formula anchors**
- Tong Xie Yao Fang
- Si Ni San
- Xiao Yao San
- Chai Hu Gui Zhi Tang source: Liver-Spleen disharmony

---

## LV04 — Liver Blood Deficiency · 肝血虛 · Gān Xuè Xū

**Status:** `likely_existing_core`

**Key signs**
- dizziness
- blurred vision
- dry eyes
- numbness/tingling
- muscle cramps/spasms
- pale nails
- scanty/late menses where relevant

**Tongue / pulse**
- Tongue: pale, thin/dry
- Pulse: thin/choppy

**Treatment principle**
Nourish Liver Blood.

**Formula anchors**
- Si Wu Tang
- Suan Zao Ren Tang when Heart/Liver Blood deficiency
- Dang Gui Bu Xue Tang in Blood-deficiency contexts

**Progression**
Liver Blood Deficiency → may_generate → Internal Wind
Liver Blood Deficiency → may_contribute_to → Liver Yang Rising

---

## LV05 — Liver Yin Deficiency · 肝陰虛 · Gān Yīn Xū

**Status:** `likely_existing_core`

**Key signs**
- dry eyes
- dizziness
- tinnitus
- numbness/cramps
- irritability
- night sweats / Empty Heat when advanced
- dry throat

**Tongue / pulse**
- Tongue: red, little coat
- Pulse: thin, rapid/wiry

**Treatment principle**
Nourish Liver Yin; clear deficiency Heat if present.

**Formula anchors**
- Yi Guan Jian
- Da Bu Yin Wan in broader Liver/Kidney Yin-deficiency contexts

**Progression**
Liver Yin Deficiency → insufficient anchoring → Liver Yang Rising
Liver Yin Deficiency → may_generate → Empty Heat / Internal Wind

---

## LV06 — Liver Yang Rising · 肝陽上亢 · Gān Yáng Shàng Kàng

**Status:** `likely_existing_core`

**Core structure**
Root deficiency (often Liver/Kidney Yin or Blood) with ascending Yang branch.

**Key signs**
- headache, often temporal/vertex
- dizziness
- tinnitus
- irritability
- flushed face
- insomnia
- possible numbness

**Tongue / pulse**
- Tongue: red sides, may be peeled if Yin deficiency
- Pulse: wiry, forceful above; root may be thin

**Treatment principle**
Subdue Liver Yang; nourish Liver/Kidney Yin/Blood as root requires.

**Point candidates**
- LV-3
- GB-20
- GB-34
- KI-3
- BL-18
- BL-23
- GB-8 / GB-9 / Taiyang for source-specific headache locations

**Differential**
Liver Fire is full Excess and has stronger true Heat/dryness signs.

**Sources**
- Sacred Lotus Liver/Gallbladder page
- Me & Qi Liver Yang Rising

---

## LV07 — Liver Fire Blazing / Flaring Up · 肝火上炎 · Gān Huǒ Shàng Yán

**Status:** `canonical_overlap_review`

**Identity issue**
Current repo has historically held both `liver_fire` and library-only `liver_fire_flaring`; canonical review remains separate from this research pack.

**Key signs**
- severe headache
- red eyes
- bitter taste
- irritability/anger
- tinnitus
- thirst
- constipation
- dark urine
- hypochondriac pain

**Tongue / pulse**
- Tongue: red, especially sides; yellow/dry coat
- Pulse: wiry, rapid, forceful

**Treatment principle**
Clear/drain Liver Fire; regulate Liver Qi.

**Formula anchors**
- Long Dan Xie Gan Tang
- Da Chai Hu Tang in Liver/GB Fire contexts
- Zuo Jin Wan when Liver Fire invades Stomach

**Progression**
Liver Qi Stagnation → Heat → Liver Fire
Liver Fire → may_damage Yin
Liver Fire → may_generate Internal Wind

---

## LV08 — Liver Wind Stirring Internally · 肝風內動 · Gān Fēng Nèi Dòng

**Status:** `canonical_overlap_review`

**Ontology recommendation**
Treat “Liver Wind” as an umbrella mechanism only if useful, and preserve etiologic subtypes.

### Major source-backed subtypes
1. **Extreme Heat Generates Wind** 熱極生風
2. **Liver Yang / Fire Generates Wind** 肝陽化風 / 肝火生風
3. **Blood Deficiency Generates Wind** 血虛生風
4. **Yin Deficiency Generates Wind** 陰虛風動

**Key signs**
- tremor
- spasms
- convulsions
- dizziness
- numbness
- deviation or movement disorder depending subtype

**Tongue / pulse**
Subtype dependent:
- extreme Heat: red/crimson, rapid/wiry
- Blood deficiency: pale, thin
- Yin deficiency: red/peeled, thin rapid
- Yang rising: red sides, wiry

**Formula anchors**
- Ling Jiao Gou Teng Yin → extreme Heat generates Wind
- Tian Ma Gou Teng Yin → Liver Yang/Fire internal Wind
- Da Ding Feng Zhu → Yin-deficiency endogenous Wind
- Si Wu Tang → Blood deficiency generating Internal Wind

**Canonical note**
Do not flatten all subtypes into one symptom list without preserving mechanism.

---

## LV09 — Liver-Gallbladder Damp-Heat · 肝膽濕熱 · Gān Dǎn Shī Rè

**Status:** `distinct_candidate` or `likely_existing_core`

**Key signs**
- hypochondriac fullness/pain
- bitter taste
- nausea / poor appetite
- jaundice possible
- dark scanty urine
- heavy sensation
- genital/urogenital Damp-Heat signs may occur

**Tongue / pulse**
- Tongue: red with thick yellow greasy coat
- Pulse: wiry, slippery, rapid

**Treatment principle**
Clear Heat; drain Dampness; course Liver/GB.

**Formula anchors**
- Long Dan Xie Gan Tang
- Yin Chen Hao Tang
- Hao Qin Qing Dan Tang

**Progression**
Liver Qi Stagnation + Dampness + Heat → Liver/GB Damp-Heat
Liver/GB Damp-Heat → may_transform_to → Liver Fire
Liver/GB Damp-Heat → may_pour_down_to → Bladder Damp-Heat

**Sources**
- Sacred Lotus
- Me & Qi Liver and Gallbladder Damp-Heat

---

## GB01 — Gallbladder Deficiency / Gallbladder Qi Deficiency · 膽氣虛 · Dǎn Qì Xū

**Status:** `distinct_candidate`

**Key signs**
- timidity / easily startled
- indecisiveness
- poor sleep / dream disturbance
- palpitations in combined Heart-Gallbladder cases
- anxiety/fearfulness in traditional descriptions

**Tongue / pulse**
Often deficiency-type; source-specific.

**Treatment principle**
Tonify/support Gallbladder Qi; calm Shen; regulate Phlegm where present.

**Formula anchors**
- Ding Zhi Wan → Heart/Gallbladder Qi Deficiency
- Wen Dan Tang source includes Gallbladder Deficiency Heat, but do not conflate deficiency Heat with simple Qi deficiency

---

## GB02 — Gallbladder Damp-Heat · 膽腑濕熱 · Dǎn Fǔ Shī Rè

**Status:** `subtype_review`

**Key signs**
- bitter taste
- hypochondriac discomfort
- nausea/vomiting
- poor appetite
- jaundice
- yellow greasy coat
- wiry/slippery rapid pulse

**Treatment principle**
Clear GB Heat; resolve Dampness; harmonize Stomach/Shao Yang when relevant.

**Formula anchors**
- Hao Qin Qing Dan Tang
- Yin Chen Hao Tang
- Long Dan Xie Gan Tang

**Ontology note**
Review whether separate GB-only node adds value beyond Liver-Gallbladder Damp-Heat.

---

# 6. KIDNEY / BLADDER

## KI01 — Kidney Qi Deficiency · 腎氣虛 · Shèn Qì Xū

**Status:** `distinct_candidate` or `likely_existing_core`

**Key signs**
- low-back/knee weakness
- fatigue
- urinary frequency
- weak urinary control
- reproductive/sexual weakness in relevant contexts
- shortness of breath if Kidney fails to grasp Qi

**Tongue / pulse**
- Tongue: pale
- Pulse: deep, weak, especially chi positions

**Treatment principle**
Tonify Kidney Qi; secure lower orifices / grasp Qi depending subtype.

**Ontology note**
Important umbrella, but source traditions often split immediately into:
- Kidney Qi Not Firm
- Kidney Failing to Grasp Qi
- Kidney Yang deficiency

---

## KI02 — Kidney Qi Not Firm / Kidney Qi-Jing Gate Not Consolidated · 腎氣不固 · Shèn Qì Bù Gù

**Status:** `distinct_candidate`

**Key signs**
- frequent/clear urination
- urinary leakage
- nocturia
- seminal leakage
- reproductive essence leakage or chronic vaginal discharge depending context

**Tongue / pulse**
- Tongue: pale
- Pulse: deep, weak

**Treatment principle**
Tonify Kidney Qi; secure and astringe.

**Formula anchor**
- Jin Suo Gu Jing Wan → Kidney Yang deficiency with Kidney Qi/Jing Gate not consolidated

**Differential**
Kidney Yang deficiency adds stronger Cold; Bladder Damp-Heat has painful/burning dark urine.

---

## KI03 — Kidney Yang Deficiency · 腎陽虛 · Shèn Yáng Xū

**Status:** `likely_existing_core`

**Key signs**
- low-back/knee soreness and weakness
- cold limbs / aversion to cold
- fatigue
- urinary frequency/clear urine
- edema/fluid retention
- reproductive/sexual dysfunction in relevant contexts

**Tongue / pulse**
- Tongue: pale, swollen, wet
- Pulse: deep, weak, slow

**Treatment principle**
Warm and tonify Kidney Yang; support Ming Men; regulate water when needed.

**Formula anchors**
- Jin Gui Shen Qi Wan
- You Gui Wan / You Gui Yin
- Zhen Wu Tang when water flooding is prominent

**Progression**
Kidney Yang Deficiency → may_cause → Water Flooding
Kidney Yang Deficiency → may_affect → Spleen / Heart / Lung

---

## KI04 — Kidney Yin Deficiency · 腎陰虛 · Shèn Yīn Xū

**Status:** `likely_existing_core`

**Key signs**
- low-back/knee soreness
- tinnitus
- dizziness
- dry mouth/throat at night
- night sweats
- five-center heat
- afternoon flushing

**Tongue / pulse**
- Tongue: red, little/no coat
- Pulse: thin, rapid, deep

**Treatment principle**
Nourish Kidney Yin; clear deficiency Heat where present.

**Formula anchors**
- Liu Wei Di Huang Wan
- Zhi Bai Di Huang Wan when Fire flares
- Da Bu Yin Wan

**Progression**
Kidney Yin Deficiency → may_lead_to → Deficiency Fire
Kidney Yin Deficiency → may_fail_to_nourish → Liver Yin
Kidney Yin Deficiency → may_fail_to_anchor → Liver Yang

---

## KI05 — Kidney Yin Deficiency with Fire Flaring · 腎陰虛火旺 · Shèn Yīn Xū Huǒ Wàng

**Status:** `subtype_review`

**Key signs**
Kidney Yin deficiency cluster plus stronger:
- night sweats
- five-center Heat
- agitation
- dry throat
- possible bleeding/sexual/reproductive Heat signs depending context

**Tongue / pulse**
- Tongue: red, scant/no coat
- Pulse: thin, rapid

**Treatment principle**
Nourish Kidney Yin; clear deficiency Fire.

**Formula anchors**
- Zhi Bai Di Huang Wan
- Da Bu Yin Wan

**Ontology note**
Likely subtype of Kidney Yin deficiency, but clinically useful enough to preserve as canonical subtype if the ontology supports severity/Heat branches.

---

## KI06 — Kidney Jing / Essence Deficiency · 腎精不足 · Shèn Jīng Bù Zú

**Status:** `distinct_candidate`

**Core mechanism**
Kidney Essence insufficient to support growth, reproduction, marrow/brain/bone functions.

**Key signs**
Age/context dependent:
- developmental delay
- infertility/reproductive weakness
- premature aging
- weak bones/teeth
- poor memory
- dizziness/tinnitus
- hair changes

**Tongue / pulse**
Variable; can lean Yin or Yang deficiency depending presentation.

**Treatment principle**
Replenish Kidney Jing; support Kidney Yin/Yang according to presentation.

**Formula anchors**
- You Gui Wan / You Gui Yin replenish Jing
- Er Xian Tang source explicitly tonifies Kidney Jing
- Zuo Gui-type formulas if present

**Ontology note**
Do not make “Jing deficiency” merely an alias of Kidney Yin deficiency.

**Source**
- Sacred Lotus Kidney functions: Kidney stores Jing, governs growth/development/reproduction, marrow/bones.

---

## KI07 — Kidney Failing to Grasp Qi · 腎不納氣 · Shèn Bù Nà Qì

**Status:** `distinct_candidate`

**Key signs**
- chronic breathlessness
- difficulty inhaling
- dyspnea worse exertion
- weak low back/knees
- possible wheezing
- worse chronic respiratory patterns

**Tongue / pulse**
- Deficiency type; pale if Yang/Qi deficient, red if Yin deficient
- Pulse: deep, weak at Kidney positions

**Treatment principle**
Tonify Kidney; grasp Qi; support Lung.

**Formula anchors**
- Su Zi Jiang Qi Tang source: asthma with Kidney deficiency + Cold Phlegm
- Shen Qi / Ge Jie / Ren Shen Hu Tao-type formulas if present

**Graph**
Lung Qi Deficiency ↔ Kidney Failing to Grasp Qi often forms chronic Lung-Kidney deficiency axis.

---

## KI08 — Kidney Yang Deficiency with Water Flooding · 腎陽虛水泛 · Shèn Yáng Xū Shuǐ Fàn

**Status:** `distinct_candidate`

**Key signs**
- edema
- scanty urine or impaired water metabolism
- cold limbs
- low-back weakness
- heaviness
- possible dyspnea/palpitations if Water affects Lung/Heart

**Tongue / pulse**
- Tongue: pale, swollen, wet
- Pulse: deep, weak, slow

**Treatment principle**
Warm Kidney Yang; promote transformation of fluids; drain retained Water.

**Formula anchors**
- Zhen Wu Tang
- Jin Gui Shen Qi Wan in broader Kidney Yang deficiency fluid pathology

**Relations**
Kidney Yang Deficiency → causes → Water Flooding
Water Flooding → may_affect → Lung / Heart / Spleen

---

## BL01 — Bladder Damp-Heat · 膀胱濕熱 · Páng Guāng Shī Rè

**Status:** `likely_existing_core` or `distinct_candidate`

**Key signs**
- frequent urgent urination
- burning/painful urination
- dark/scanty urine
- cloudy urine
- lower abdominal discomfort
- stones/gravel possible in severe Damp accumulation

**Tongue / pulse**
- Tongue: red with sticky yellow coat
- Pulse: rapid, slippery, wiry at chi

**Treatment principle**
Clear Heat; resolve Dampness; open water passages.

**Formula anchors**
- Ba Zheng San
- Xiao Ji Yin Zi in Blood Lin/bleeding contexts

**Point candidates**
- REN-3
- BL-28
- SP-9
- SP-6
- BL-22

**Progression**
Liver/GB Damp-Heat → may_pour_down_to → Bladder Damp-Heat

**Source**
- Sacred Lotus Bladder patterns

---

## BL02 — Bladder Deficiency Cold · 膀胱虛寒 · Páng Guāng Xū Hán

**Status:** `distinct_candidate` / `terminology_review`

**Key signs**
- frequent clear urination
- urinary leakage
- nocturia
- cold lower abdomen
- weak stream/retention may occur depending failure of Qi transformation

**Tongue / pulse**
- Tongue: pale, wet
- Pulse: deep, weak, slow

**Treatment principle**
Warm and tonify Kidney/Bladder Qi transformation; secure urine.

**Ontology note**
May overlap strongly with Kidney Qi Not Firm and Kidney Yang deficiency. Promote only if the repo wants Fu-organ-specific patterns.

---

# 7. PERICARDIUM / SAN JIAO

## PC01 — Heat Entering Pericardium · 熱入心包 · Rè Rù Xīn Bāo

**Status:** `distinct_candidate` but **Wen-Bing system first**, not ordinary Zang-Fu

**Clinical context**
High-fever / consciousness-disturbance pattern in Warm Disease differentiation.

**Key signs**
- high fever
- impaired consciousness
- agitation/delirium
- possible convulsions when Wind develops

**Tongue / pulse**
- Tongue: red/crimson
- Pulse: rapid

**Treatment principle**
Clear Heat from Ying/Pericardium; open orifices according to pattern.

**Ontology note**
Prefer classification under Wen-Bing / Ying level rather than treating Pericardium as a generic organ Pattern.

---

## SJ01 — San Jiao Damp-Heat · 三焦濕熱 · Sān Jiāo Shī Rè

**Status:** `distinct_candidate` / `system_crosswalk_review`

**Evidence**
AD formula corpus uses:
- Long Dan Xie Gan Tang → San Jiao Damp-Heat
- San Ren Tang → Upper-Jiao Heat / Damp-Heat staging
- Gan Lu Xiao Du Dan → Middle-Jiao Damp / Damp-Heat
- Er Miao San / lower-jiao sources

**Sacred Lotus caution**
Sacred Lotus notes that San Jiao does not have independent organ patterns in the same sense as Zang-Fu; Upper/Middle/Lower Jiao patterns reflect contained organs and fluid/Qi functions.

**Ontology recommendation**
Keep San Jiao as a differentiation-system axis with location/stage relations:
- Upper Jiao
- Middle Jiao
- Lower Jiao
rather than mechanically creating every “San Jiao + pathology” phrase as a distinct organ card.

---

# 8. Cross-organ combined patterns identified for later Batch 04/05

The following are strongly supported but are deliberately not expanded fully here because they need graph/canonical comparison against the current 59:

- Heart-Lung Qi Deficiency 心肺氣虛
- Lung-Spleen Qi Deficiency 肺脾氣虛
- Lung-Kidney Qi Deficiency 肺腎氣虛
- Lung-Kidney Yin Deficiency 肺腎陰虛
- Heart-Spleen Deficiency 心脾兩虛 / 心脾氣血兩虛
- Heart-Kidney Yin Deficiency 心腎陰虛
- Heart-Kidney Not Communicating 心腎不交
- Heart-Gallbladder Qi Deficiency 心膽氣虛
- Liver-Spleen Disharmony 肝脾不和
- Liver Qi Invading Stomach 肝氣犯胃
- Liver Fire Scorching Lung 肝火犯肺
- Liver-Kidney Yin Deficiency 肝腎陰虛
- Liver-Kidney Yin Deficiency with Liver Yang Rising 肝腎陰虛肝陽上亢
- Liver-Kidney Yin Deficiency with Fire Flaring 肝腎陰虛火旺
- Spleen-Kidney Yang Deficiency 脾腎陽虛
- Spleen-Kidney Yang Deficiency with Water Flooding 脾腎陽虛水泛

---

# 9. High-value canonical candidates from this batch

If absent from the current registry/library/alias map, these deserve early V2 review:

1. `Heart Yang Deficiency` 心陽虛
2. `Phlegm-Fire Disturbing Heart` 痰火擾心
3. `Phlegm Misting/Obstructing Heart Orifices` 痰蒙心竅
4. `Small Intestine Excess Heat` 小腸實熱
5. `Small Intestine Deficiency Cold` 小腸虛寒
6. `Lung Dryness` 肺燥 with Warm/Cool Dryness subtypes
7. `Phlegm-Heat Obstructing Lung` 痰熱壅肺
8. `Phlegm-Fluids Obstructing Lung` 痰飲停肺
9. `Large Intestine Excess Heat` 大腸實熱
10. `Large Intestine Fluid Deficiency/Dryness` 大腸津虧
11. `Large Intestine Damp-Heat` 大腸濕熱
12. `Stomach Qi Deficiency` 胃氣虛
13. `Stomach Yin/Fluid Deficiency` 胃陰虛 / 胃津不足
14. `Rebellious Stomach Qi` 胃氣上逆
15. `Food Accumulation in Stomach` 食積胃脘
16. `Blood Stasis in Stomach` 胃絡瘀血
17. `Liver Qi Invading Stomach` 肝氣犯胃
18. `Liver-Spleen Disharmony` 肝脾不和
19. `Liver-Gallbladder Damp-Heat` 肝膽濕熱
20. `Gallbladder Qi Deficiency` 膽氣虛
21. `Kidney Qi Not Firm` 腎氣不固
22. `Kidney Jing Deficiency` 腎精不足
23. `Kidney Failing to Grasp Qi` 腎不納氣
24. `Kidney Yang Deficiency with Water Flooding` 腎陽虛水泛
25. `Bladder Damp-Heat` 膀胱濕熱
26. `Heat Entering Pericardium` 熱入心包, classified under Wen-Bing rather than generic Zang-Fu

---

# 10. Candidate relations to preserve

## Deficiency progression
- Heart Qi Deficiency → Heart Yang Deficiency
- Spleen Qi Deficiency → Spleen Yang Deficiency
- Kidney Qi Deficiency → Kidney Yang Deficiency in some chronic trajectories
- Liver Blood Deficiency → Liver Yin Deficiency in depletion contexts

## Pathogenic transformation
- Spleen Qi Deficiency → Dampness
- Dampness → Phlegm
- Liver Qi Stagnation → Heat → Fire
- Liver Fire / Liver Yang → Internal Wind
- Blood Deficiency → Internal Wind
- Stomach Heat → Stomach Fire
- Stomach Fire → damages Yin / fluids
- Lung Heat → damages fluids

## Organ overacting / transmission
- Liver Qi → invades Stomach
- Liver Qi → invades Spleen
- Liver Fire → scorches Lung
- Heart Fire → transfers to Small Intestine
- Liver/GB Damp-Heat → pours downward to Bladder
- Kidney Yang deficiency → Water Flooding → may affect Lung / Heart

## Functional-direction relations
- Stomach Qi → should descend; rebellion creates nausea/vomiting/belching
- Lung Qi → should descend/disperse; obstruction by Phlegm/Damp/Heat/Cold causes cough/dyspnea
- Spleen Qi → should ascend; deficiency may progress to sinking/prolapse
- Kidney → grasps Lung Qi; failure produces inspiratory weakness/dyspnea

---

# 11. Formula-to-Pattern anchors retained for future resolution

These are **names only** at the research stage. Claude should resolve to existing canonical `formula.*` IDs later.

- Zhi Gan Cao Tang → Heart Qi deficiency; mixed Qi/Blood/Yin deficiency
- Suan Zao Ren Tang → Heart Blood deficiency; Heart/Liver Blood deficiency
- Dao Chi San → Heart Fire; Small Intestine Excess Heat
- Wen Dan Tang → Phlegm-Fire disturbing Heart; GB/Stomach Phlegm-Heat
- Yu Ping Feng San → Lung Qi deficiency / Wei Qi deficiency
- Er Chen Tang → Phlegm-Damp obstructing Lung
- Xiao Qing Long Tang → Wind-Cold attacking Lung + thin mucus/fluid
- Da Cheng Qi Tang → Colon Excess Heat / Yang Ming Fu
- Ma Zi Ren Wan → Colon Heat + fluid deficiency / dry Heat retention
- Si Jun Zi Tang → Spleen Qi deficiency
- Shen Ling Bai Zhu San → Spleen Qi deficiency + Dampness; Lung-Spleen Qi deficiency
- Li Zhong Wan → Spleen Yang deficiency; Stomach Cold; SI deficiency Cold
- Bu Zhong Yi Qi Tang → Central Qi sinking; Spleen not governing Blood
- Ping Wei San → Cold-Damp / Damp stagnation Spleen-Stomach
- Qing Wei San → Stomach Fire + Stomach Heat
- Yu Nu Jian → Stomach Heat with Yin deficiency caused by Stomach Fire damaging Yin
- Chai Hu Shu Gan San → Liver Qi stagnation / Liver invading Stomach
- Xiao Yao San → Liver Qi stagnation invading Spleen/Stomach + Blood deficiency
- Long Dan Xie Gan Tang → Liver Fire; Liver/GB Damp-Heat; San Jiao Damp-Heat
- Hao Qin Qing Dan Tang → Gallbladder Damp-Heat / Shao Yang Damp-Heat-Phlegm
- Si Wu Tang → Liver Blood deficiency; Blood-deficiency Internal Wind
- Tian Ma Gou Teng Yin → Liver Yang/Fire generating Internal Wind
- Ling Jiao Gou Teng Yin → Extreme Heat generating Liver Wind
- Da Ding Feng Zhu → Yin-deficiency endogenous Wind
- Liu Wei Di Huang Wan → Kidney Yin deficiency
- Zhi Bai Di Huang Wan → Kidney Yin deficiency with Fire; Liver-Kidney Yin deficiency + Fire
- Jin Gui Shen Qi Wan → Kidney Yang deficiency
- You Gui Wan / You Gui Yin → Kidney Yang deficiency + Jing depletion
- Jin Suo Gu Jing Wan → Kidney Qi/Jing Gate not consolidated
- Zhen Wu Tang → Kidney Yang deficiency with Water Flooding
- Ba Zheng San → Bladder Damp-Heat
- Xiao Ji Yin Zi → Bladder Damp-Heat / Blood Lin / Heart Fire

---

# 12. Source provenance

## Sacred Lotus
- Heart patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-heart-patterns-tcm
- Lung patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-lung-patterns-tcm
- Spleen patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-spleen-patterns-tcm
- Stomach patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-stomach-patterns-tcm
- Liver/Gallbladder patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-liver-gallbladder-patterns-tcm
- Bladder patterns:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-bladder-patterns-tcm
- San Jiao:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-san-jiao-patterns-tcm
- General diagnosis index:
  https://www.sacredlotus.com/go/diagnosis-chinese-medicine

## Shen-Nong
- Zang-Fu syndrome differentiation:
  https://new.shen-nong.com/article/syndrome-differentiation-zang-fu-organs-chinese-medicine?lang=en

## Me & Qi representative graph/differential pages
- Liver & Gallbladder Damp-Heat:
  https://www.meandqi.com/knowledge-base/patterns/liver-and-gallbladder-damp-heat
- Liver Yang Rising:
  https://www.meandqi.com/knowledge-base/patterns/liver-yang-rising
- Heart and Kidney Yin Deficiency:
  https://www.meandqi.com/knowledge-base/patterns/heart-and-kidney-yin-deficiency
- Stomach Qi Stagnation:
  https://www.meandqi.com/knowledge-base/patterns/stomach-qi-stagnation

## User-uploaded formula/source corpus
- `NCBAHM_2026_AD_181_Formulas_Name_Actions_Syndromes.md`
- `American_Dragon_201_Formulas_Name_Actions_Syndromes.md`
- `02_AD_PATTERN_SPLEEN_LUNG.md`
- formula card batches 01–20
- Pattern V1 start-pack documents
- Condition/Pattern Source Mapping Spec

---

# 13. Handoff checklist for Claude

For each candidate in this file:

1. search exact Chinese name in registry/library/alias map
2. search English variants
3. search pinyin/legacy IDs
4. inspect relation registry
5. inspect formula references
6. classify:
   - existing canonical
   - alias
   - subtype
   - progression
   - broader/narrower
   - compound graph
   - distinct candidate
7. **do not create a new ID merely because the source phrase differs**
8. preserve field-level provenance
9. resolve formula/point IDs
10. run Pattern + relation validators
11. keep disease contexts in `tdis.*` / `cond.*` layers rather than converting them into Pattern equivalence

---

# 14. Next batch

**Batch 04 — Gynecology / Chong-Ren / Jing / reproductive Pattern expansion**

Planned extraction:
- Chong-Ren insufficiency
- Chong-Ren disharmony
- Chong-Ren Heat
- Chong-Ren Cold
- Chong-Ren Blood stasis
- Kidney Jing deficiency and reproductive subtypes
- Kidney Qi not firm in reproductive/urinary contexts
- Uterus Cold / Deficiency Cold
- Uterus Blood stasis
- Liver Qi stagnation affecting menstruation
- Blood Heat menstrual patterns
- Spleen not controlling Blood / Chong-Ren instability
- pregnancy/postpartum pattern wording
- strict separation of `tdis.*` gynecologic disease/context from `pattern.*`

---

## End of Batch 03

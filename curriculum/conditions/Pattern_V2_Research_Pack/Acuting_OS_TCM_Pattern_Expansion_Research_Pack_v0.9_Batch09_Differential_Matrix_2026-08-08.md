# AcuTing OS — TCM Pattern Expansion Research Pack v0.9
## Batch 09 — Pattern ↔ Symptom ↔ Tongue ↔ Pulse Differential Matrix
### Diagnostic discriminator layer for Antigravity

**Date:** 2026-08-08  
**Research / synthesis layer:** ChatGPT  
**Repository / implementation layer:** Antigravity  
**Status:** STAGING / DIFFERENTIAL-ENGINE DESIGN ONLY — do not bulk-create `pattern.*` IDs

---

# 0. Purpose

Batches 02–08 answered:

> What Pattern concepts exist, what systems do they belong to, and how might they relate?

Batch 09 answers a different question:

> **When two or more Patterns look similar, what findings actually separate them?**

This file is intended to become the evidence layer for:

- Pattern comparison tables
- board-exam differential review
- future AcuTing diagnostic reasoning
- search/ranking logic
- “why this Pattern instead of that Pattern?” explanations
- duplicate/canonical review

It should **not** become an automated diagnosis engine without a separate validation, safety and clinical-governance layer.

---

# 1. Differential data model

For every Pattern comparison, distinguish:

```text
identity_discriminators
high_weight_positive_signs
supporting_signs
tongue_body
tongue_coat
pulse
high_weight_negative_signs
root_mechanism
branch_mechanism
nearest_confusions
formula_anchors
source_confidence
```

## Recommended weight semantics

### Weight 5 — identity discriminator
A finding that strongly separates one Pattern from its nearest competitors.

Examples:
- 太陽中風: spontaneous sweating
- 太陽傷寒: no sweating + floating tight pulse
- 陽蹺失調: 陰緩陽急
- 陰蹺失調: 陽緩陰急

### Weight 4 — high-value positive
Strongly supports the Pattern but is not unique.

### Weight 3 — common/supportive
Useful, but shared by many related Patterns.

### Weight 2 — context
Can occur but should not determine identity.

### Weight 1 — weak association
Keep for provenance/display, not ranking.

### Negative discriminator
A finding whose presence should reduce confidence in a competing Pattern.

---

# 2. Scoring concept for future Antigravity staging

This is a **research scoring proposal**, not production clinical logic.

```text
pattern_match_score =
  Σ positive discriminator weights
  - Σ contradiction weights
  + tongue match
  + pulse match
  + mechanism compatibility
  + system/stage compatibility
```

Do not hard-code this into patient-facing diagnosis without validation.

For board-study mode, the same matrix can safely power:

```text
“Most likely Pattern”
“Which finding best differentiates A from B?”
“Why is this not Pattern C?”
```

---

# 3. Heat / Fire Differential Cluster

## HF01 — Stomach Heat vs Stomach Fire vs Stomach Yin Deficiency

| Feature | Stomach Heat 胃熱 | Stomach Fire 胃火熾盛 | Stomach Yin Deficiency 胃陰虛 |
|---|---|---|---|
| Core nature | Interior Heat, usually Excess | Stronger/intensified Stomach Heat → Fire | Deficiency, dryness, possible Empty Heat |
| Heat intensity | moderate–strong | **very strong** | mild/deficiency Heat |
| Epigastrium | hot/burning | **strong burning pain/Heat** | dull discomfort, dryness |
| Hunger | may increase | **消穀善飢 / strong rapid hunger** | hunger but may not want to eat |
| Thirst | thirst | **strong thirst, prefers cold** | dry mouth/throat, small sips |
| Mouth odor | possible | **foul breath strongly supportive** | not defining |
| Gums/teeth | may have Heat signs | **red/swollen/painful/bleeding gums, tooth Heat pain** | not defining |
| Constipation | possible | common from fluid damage | common from dryness |
| Tongue body | red | **red** | **red, often thin/dry** |
| Coat | yellow | yellow, may be dry/thick | **little/no coat, peeled center** |
| Pulse | rapid, slippery/full | **rapid, forceful/full/slippery** | **thin, possibly rapid** |
| Treatment | clear Stomach Heat | **drain Stomach Fire; protect fluids/Yin** | nourish Stomach Yin, generate fluids |
| Formula anchors | Bai Hu Tang contexts | Qing Wei San | Mai Men Dong Tang / fluid-nourishing family |
| Progression | may intensify → Fire | may damage → Yin/fluids | may arise after chronic Heat/Fire |
| Highest discriminator | Heat without full Fire severity | **gum/oral Fire + strong hunger + forceful Heat** | **peeled/scant coat + thin pulse + dryness** |

### Engine rule
Do **not** use `Stomach Heat` and `Stomach Fire` as hard aliases.

### Negative discriminators
- Peeled/scant coat + thin pulse lowers probability of pure Excess Stomach Fire.
- Strong foul breath, gum swelling/bleeding and forceful pulse lowers probability of isolated Stomach Yin deficiency.

---

## HF02 — Liver Fire vs Liver Yang Rising vs Internal Liver Wind

| Feature | Liver Fire 肝火上炎 | Liver Yang Rising 肝陽上亢 | Internal Liver Wind 肝風內動 |
|---|---|---|---|
| Root | Excess Heat/Fire, often Qi stagnation → Fire | Root deficiency with ascending Yang | Wind mechanism from Yang/Fire, extreme Heat, Blood/Yin deficiency |
| Headache | severe, bursting | throbbing/ascending | may occur but movement/neurologic signs dominate |
| Eyes | **red eyes** | blurred/dry possible | not defining |
| Bitter taste | **high-value** | less defining | not defining |
| Irritability | strong | common | may coexist |
| Tinnitus | loud/roaring | common | possible |
| Tremor | not core | may precede Wind | **core** |
| Convulsion/spasm | not core | not core | **core** |
| Numbness | possible | possible | **high-value** |
| Sudden collapse / deviation | possible only if progresses | not defining | **strong severe-context sign** |
| Tongue | red sides, yellow coat | red sides; coat may be scant if Yin deficient | subtype-dependent |
| Pulse | **wiry rapid forceful** | wiry; root may be thin | wiry; force/rapidness depends subtype |
| Formula anchor | Long Dan Xie Gan Tang | Tian Ma Gou Teng Yin contexts | Zhen Gan Xi Feng Tang / Tian Ma Gou Teng Yin / Ling Jiao Gou Teng Yin |
| Treatment | clear/drain Liver Fire | subdue Yang + nourish root | extinguish Wind + treat cause |
| Highest discriminator | **true Fire signs: red eyes, bitter taste, yellow coat** | **root-deficiency + ascending Yang without Wind movement** | **tremor/spasm/convulsion/deviation** |

### Important ontology rule
`Liver Wind` should remain broad. Future children may include:
- 肝陽化風
- 熱極生風
- 血虛生風
- 陰虛風動

---

## HF03 — Heart Fire vs Heart Yin Deficiency vs Phlegm-Fire Disturbing Heart vs Phlegm Misting Heart

| Feature | Heart Fire 心火亢盛 | Heart Yin Deficiency 心陰虛 | Phlegm-Fire Disturbing Heart 痰火擾心 | Phlegm Misting Heart 痰蒙心竅 |
|---|---|---|---|---|
| Nature | Excess Fire | Deficiency Heat | Phlegm + Heat/Fire | Phlegm/turbidity obstruction |
| Insomnia/agitation | strong | strong | **strong, often more agitated** | variable; dull/confused more typical |
| Mouth/tongue ulcers | **high-value** | not typical | possible | not typical |
| Thirst | strong | dry mouth at night | Heat thirst possible | not defining |
| Night sweats | not core | **high-value** | not core | no |
| Five-center Heat | no | **high-value** | no | no |
| Chest oppression/phlegm | no | no | **high-value** | **high-value** |
| Nausea / greasy coat | no | no | **common** | **common** |
| Confusion / clouded consciousness | severe Fire can disturb Shen | uncommon | possible in severe cases | **high-value** |
| Tongue | red tip, yellow coat | **red, little/no coat** | **red + yellow greasy coat** | greasy coat; tongue color depends Heat |
| Pulse | rapid, forceful | **thin rapid** | **slippery rapid, possibly wiry** | **slippery** |
| Formula anchor | Dao Chi San | Tian Wang Bu Xin Dan | Wen Dan Tang | opening-orifice / Phlegm-transforming family |
| Highest discriminator | **red tip + ulcers + full Heat** | **night sweat + scant coat + thin rapid pulse** | **agitated Shen + Phlegm + yellow greasy coat** | **turbid/clouded Shen + greasy coat** |

---

## HF04 — Generic Blood Heat vs Xue-Stage Heat

| Feature | Blood Heat 血熱 | Xue-Stage Heat 血分熱 |
|---|---|---|
| Framework | Blood/pathomechanism | **Warm-Disease depth/stage** |
| Fever severity | may or may not be major | **deep/severe febrile disease** |
| Bleeding | common | **common, often part of severe stage** |
| Rash/purpura | possible | strong traditional association |
| Shen disturbance | not required | **high-value** |
| Internal Wind | not required | may develop when extreme Heat generates Wind |
| Tongue | red/crimson | **deep red/scarlet/purple** |
| Pulse | rapid | thin rapid / wiry-thin depending complication |
| Formula anchor | Blood-cooling formulas | Xi Jiao Di Huang Tang |
| Highest discriminator | Blood-level Heat mechanism | **stage depth + severe fever + Shen/Blood injury** |

### Canonical rule
Never alias `Xue-stage Heat` to generic `Blood Heat`.

---

# 4. Exterior / Stage Differential Cluster

## EX01 — Wind-Cold vs Tai Yang Shang Han vs Tai Yang Zhong Feng

| Feature | Generic Wind-Cold 風寒 | Tai Yang Shang Han 太陽傷寒 | Tai Yang Zhong Feng 太陽中風 |
|---|---|---|---|
| Framework | Pathogenic-factor / exterior | **Six Channels** | **Six Channels** |
| Chills vs fever | chills > fever | **pronounced chills + fever** | fever + aversion to wind/cold |
| Sweat | classic excess type: none; broader Wind-Cold can vary | **NO SWEAT = identity discriminator** | **SPONTANEOUS SWEAT = identity discriminator** |
| Body aches | common | **strong** | milder |
| Neck stiffness | possible | common | common |
| Nasal clear discharge | common | possible | possible |
| Dry heaves | not defining | not defining | **classic supportive sign** |
| Tongue coat | thin white | thin white moist | thin white moist |
| Pulse | floating, often tight | **floating tight** | **floating relaxed/moderate/soft** |
| Formula | Ma Huang / Gui Zhi depending subtype | Ma Huang Tang | Gui Zhi Tang |
| Highest discriminator | broad pathogen family | **no sweat + tight pulse** | **sweat + relaxed pulse** |

### Engine warning
Do not rank Tai Yang subtype solely from the words “Wind-Cold.”  
Sweating and pulse quality carry more weight.

---

## EX02 — Wind-Heat vs Wei-Stage Wind-Heat vs Wind-Heat Attacking Lung

| Feature | Generic Wind-Heat 風熱 | Wei-Stage Wind-Heat 衛分風熱 | Wind-Heat Attacking Lung 風熱犯肺 |
|---|---|---|---|
| Framework | Exterior/pathogen | **Four Levels** | Zang-Fu/pathogen |
| Fever > chills | yes | yes | yes |
| Sore throat | common | common | common |
| Thirst | common | slight–moderate | common |
| Cough | may occur | common | **dominant** |
| Yellow/sticky sputum | possible | mild/early | **stronger** |
| Wei-stage context | not required | **required identity** | not required |
| Tongue | red tip/edges | red tip, thin white→yellow coat | red tip/edges, thin yellow |
| Pulse | floating rapid | floating rapid | floating rapid, may become stronger |
| Formula | Yin Qiao San | Yin Qiao San | Yin Qiao / Sang Ju depending presentation |
| Highest discriminator | broad exterior family | **Warm-Disease stage identity** | **Lung symptoms dominate** |

---

## EX03 — Yang Ming Jing vs Qi-Stage Stomach Heat vs Stomach Heat / Fire

| Feature | Yang Ming Jing 陽明經證 | Qi-Stage Stomach Heat 氣分胃熱 | Stomach Heat / Fire |
|---|---|---|---|
| Framework | **Six Channels** | **Four Levels** | Zang-Fu |
| High fever | **core** | **core** | may occur but not required |
| Profuse sweat | **core** | **core** | not defining |
| Great thirst | **core** | **core** | strong in Fire |
| Big/forceful pulse | **classic** | common | Fire may be forceful |
| GI/local gum signs | not required | not required | **gum/oral/epigastric signs more defining** |
| Stage identity | Yang Ming | Qi level | none |
| Formula | Bai Hu Tang | Bai Hu Tang | Qing Wei San / other Stomach formulas |
| Highest discriminator | **Six-Channel full-Heat stage** | **Four-Level full-Heat stage** | **organ-localizing signs** |

### Crosswalk rule
These may share one formula or symptom cluster.  
Shared formula ≠ canonical identity.

---

## EX04 — Yang Ming Fu vs Qi-Stage Intestinal Dry Heat vs Large Intestine Excess Heat

| Feature | Yang Ming Fu 陽明腑證 | Qi-stage Intestinal Dry Heat | Large Intestine Excess Heat |
|---|---|---|---|
| Framework | Six Channels | Four Levels | Zang-Fu |
| Constipation | **core** | **core** | core |
| Abdominal fullness/pain | **core** | core | core |
| Tidal fever | **high-value** | high in febrile context | not required |
| Delirium | severe stage | severe stage | not required |
| Dry yellow/black coat | **high-value** | high-value | yellow/dry possible |
| Pulse | deep forceful rapid | deep forceful rapid | full rapid |
| Formula | Cheng Qi Tang family | Cheng Qi Tang family | purgative Heat formulas |
| Highest discriminator | **Shang-Han clumping/stage identity** | **Warm-Disease Qi stage identity** | **organ Pattern without stage requirement** |

---

## EX05 — Shao Yang vs Yang Wei Mai Disharmony

| Feature | Shao Yang 少陽證 | Yang Wei Mai Disharmony 陽維脈失調 |
|---|---|---|
| Alternating chills/fever | **classic core** | **classical core** |
| Framework | Six Channels | Extraordinary Vessel |
| Bitter taste | **high-value** | not defining |
| Dry throat | **high-value** | not defining |
| Hypochondriac fullness | **high-value** | may occur |
| Nausea/dry heaves | **high-value** | not defining |
| Wiry pulse | **high-value** | source packet does not yet establish one stable pulse |
| Head/neck/shoulder trajectory | possible | **more important vessel-route clue** |
| Vessel/pathway evidence | no | **required for confidence** |
| Formula | Xiao Chai Hu Tang | vessel-point strategy, not formula-defined |
| Highest discriminator | **pivot syndrome + bitter taste + nausea + wiry pulse** | **Yang-vessel/exterior linking + route evidence** |

### Important
If only alternating chills/fever is present, evidence is insufficient to call Yang Wei pathology.

---

# 5. Deficiency Differential Cluster

## DEF01 — Kidney Qi Deficiency vs Kidney Qi Not Firm vs Kidney Yang Deficiency vs Kidney Jing Deficiency

| Feature | Kidney Qi Deficiency 腎氣虛 | Kidney Qi Not Firm 腎氣不固 | Kidney Yang Deficiency 腎陽虛 | Kidney Jing Deficiency 腎精不足 |
|---|---|---|---|---|
| Root | Kidney Qi weak | **securing function fails** | warming/transforming Yang weak | Essence insufficient |
| Low back/knee weakness | common | common | **common + Cold** | common |
| Urinary frequency | common | **high-value** | common, clear urine | possible |
| Leakage/incontinence | possible | **identity discriminator** | possible | not defining |
| Seminal/reproductive leakage | possible | **high-value** | sexual weakness more common | reproductive/developmental insufficiency |
| Cold limbs | no/weak | no/weak | **identity discriminator** | variable |
| Edema | no | no | **high-value** | no |
| Development/aging/bones/marrow | no | no | possible secondary | **identity discriminator** |
| Tongue | pale | pale | **pale swollen wet** | variable |
| Pulse | deep weak | deep weak | **deep weak slow** | deep/weak, subtype dependent |
| Formula anchors | generic Kidney Qi tonics | Jin Suo Gu Jing Wan | Jin Gui Shen Qi Wan | Jing-tonifying family |
| Highest discriminator | broad weakness | **failure to secure** | **Cold + water metabolism** | **development/reproduction/marrow/aging** |

---

## DEF02 — Kidney Qi Deficiency vs Kidney Failing to Grasp Qi

| Feature | Kidney Qi Deficiency | Kidney Failing to Grasp Qi 腎不納氣 |
|---|---|---|
| General Kidney weakness | yes | yes |
| Dyspnea | may occur | **core** |
| Difficulty inhaling | not defining | **identity discriminator** |
| Worse exertion | possible | common |
| Chronic Lung disease context | not required | strongly supportive |
| Low back/knee weakness | common | common |
| Pulse | deep weak | deep weak at chi; Lung axis context |
| Highest discriminator | broad Kidney Qi weakness | **inspiratory failure / chronic Lung-Kidney axis** |

---

## DEF03 — Heart Blood Deficiency vs Heart Yin Deficiency

| Feature | Heart Blood Deficiency 心血虛 | Heart Yin Deficiency 心陰虛 |
|---|---|---|
| Palpitations | yes | yes |
| Insomnia | yes | yes |
| Poor memory | common | common |
| Pale complexion | **high-value** | no |
| Night sweats | no | **high-value** |
| Five-center Heat | no | **high-value** |
| Dry mouth at night | no/mild | **high-value** |
| Tongue | **pale, thin/dry** | **red, little/no coat** |
| Pulse | **thin weak** | **thin rapid** |
| Formula | Suan Zao Ren Tang / Blood nourish | Tian Wang Bu Xin Dan |
| Highest discriminator | **pale + thin weak** | **red/scant coat + Empty Heat** |

---

## DEF04 — Spleen Qi Deficiency vs Spleen Qi Sinking vs Spleen Not Controlling Blood vs Spleen Yang Deficiency

| Feature | Spleen Qi Deficiency | Spleen Qi Sinking | Spleen Not Controlling Blood | Spleen Yang Deficiency |
|---|---|---|---|---|
| Poor appetite | core | core | common | core |
| Loose stool | core | common | possible | **watery/chronic** |
| Fatigue | core | core | core | core |
| Prolapse/bearing down | no | **identity discriminator** | no | possible secondary |
| Chronic bleeding/bruising | no | no | **identity discriminator** | may bleed if fails to hold |
| Cold limbs | no | no | no | **identity discriminator** |
| Edema | possible Dampness | no | no | **high-value** |
| Tongue | pale, teeth marks | pale | pale | **pale swollen wet** |
| Pulse | weak | weak/deep | weak | **deep weak slow** |
| Formula | Si Jun Zi Tang | Bu Zhong Yi Qi Tang | Gui Pi Tang | Li Zhong Wan |
| Highest discriminator | base digestive Qi weakness | **sinking/prolapse** | **bleeding from failure to hold** | **Cold + water signs** |

---

## DEF05 — Lung Qi Deficiency vs Lung Yin Deficiency vs Lung Dryness

| Feature | Lung Qi Deficiency 肺氣虛 | Lung Yin Deficiency 肺陰虛 | Lung Dryness 肺燥 |
|---|---|---|---|
| Cough | weak cough | dry cough | dry cough |
| Shortness of breath | **high-value** | may occur | not defining |
| Weak voice | **high-value** | hoarse/dry more likely | dry/hoarse |
| Spontaneous sweating | **high-value** | no | no |
| Dry throat/mouth | no | **high-value** | **high-value** |
| Night sweats | no | **high-value** | no unless Yin damaged |
| Seasonal/external dryness | no | no | **high-value** |
| Tongue | pale | **red, dry, scant coat** | dry; color depends warm/cool dryness |
| Pulse | weak | **thin rapid** | floating/rapid or other subtype-dependent |
| Highest discriminator | **weak respiration + sweating** | **chronic deficiency + Empty Heat** | **dryness mechanism / often seasonal-external** |

---

# 6. Damp / Phlegm Differential Cluster

## DP01 — Generic Damp-Heat vs Liver-GB Damp-Heat vs Bladder Damp-Heat vs Large Intestine Damp-Heat vs Spleen-Stomach Damp-Heat vs Lower Jiao Damp-Heat

| Feature | Generic Damp-Heat | Liver-GB Damp-Heat | Bladder Damp-Heat | LI Damp-Heat | Spleen-Stomach Damp-Heat | Lower Jiao Damp-Heat |
|---|---|---|---|---|---|---|
| Heaviness/stickiness | yes | yes | possible | yes | **strong** | yes |
| Bitter taste | possible | **high-value** | no | no | not defining | possible if Liver/GB source |
| Hypochondriac pain | no | **high-value** | no | no | no | no |
| Jaundice | no | **high-value** | no | no | no | possible context |
| Urinary burning/urgency | no | possible downward pour | **identity discriminator** | no | no | **high-value if urinary/repro lower Jiao** |
| Tenesmus/foul diarrhea | no | no | no | **identity discriminator** | loose/foul stool possible | possible |
| Epigastric fullness/nausea | possible | possible | no | possible | **identity discriminator cluster** | no |
| Genital/reproductive Damp signs | possible | common | possible | no | no | **common** |
| Tongue coat | yellow greasy | yellow greasy | yellow greasy | yellow greasy | yellow greasy | yellow greasy |
| Pulse | slippery/rapid | **wiry slippery rapid** | slippery rapid | slippery rapid | soggy/slippery rapid | slippery/rapid |
| Highest discriminator | generic mechanism | **GB/Liver signs** | **urinary tract signs** | **dysenteric bowel signs** | **Middle-Jiao digestive Damp signs** | **location framework** |

### Engine rule
Location/system evidence should outrank the shared “yellow greasy coat.”

---

## DP02 — Phlegm-Damp vs Wind-Phlegm vs Phlegm-Heat in Lung vs Phlegm-Fire Disturbing Heart

| Feature | Phlegm-Damp 痰濕 | Wind-Phlegm 風痰 | Phlegm-Heat Lung 痰熱壅肺 | Phlegm-Fire Heart 痰火擾心 |
|---|---|---|---|---|
| Copious sputum | common | variable | **yellow/thick** | chest/phlegm signs |
| Dizziness | common | **high-value** | possible | possible |
| Tremor/deviation | no | **high-value** | no | severe agitation possible |
| Cough/wheeze | possible if Lung | not defining | **identity discriminator** | no |
| Shen agitation | no | no | no | **identity discriminator** |
| Tongue coat | white greasy | greasy | **yellow greasy** | **yellow greasy + red tongue** |
| Pulse | slippery | slippery/wiry | **slippery rapid** | **slippery rapid/wiry** |
| Formula | Er Chen Tang | Ban Xia Bai Zhu Tian Ma Tang | Qing Qi Hua Tan / respiratory formula family | Wen Dan Tang |
| Highest discriminator | Damp-Phlegm base | **Wind movement** | **Lung Heat + yellow sputum** | **Shen disturbance + Phlegm-Fire** |

---

# 7. Gynecology / Chong-Ren Differential Cluster

## GYN-D01 — Chong-Ren Deficiency-Cold + Blood Deficiency vs Chong-Ren Deficiency-Cold + Blood Stasis vs Chong Instability from Spleen Deficiency vs Chong-Ren Blood Heat

| Feature | Chong-Ren deficiency-Cold + Blood deficiency | Chong-Ren deficiency-Cold + Blood stasis | Spleen deficiency → Chong instability | Chong-Ren Blood Heat |
|---|---|---|---|---|
| Blood color | **pale/thin** | pale/dark, may clot | **pale/thin** | **red/dark red** |
| Clots | usually absent | **high-value** | usually absent | may occur |
| Flow | spotting/heavy/continuous | irregular/prolonged | **flooding or continuous trickling** | continuous/early/heavy depending source |
| Lower abdominal Cold | common | **strong** | not defining | no |
| Fixed/stabbing pain | no | **high-value** | no | Heat pain possible |
| Low-back weakness | common | possible | possible | not defining |
| Spleen fatigue/appetite | possible | possible | **identity discriminator** | no |
| Heat/irritability | no | no | no | **high-value** |
| Tongue | pale | **dusky/pale-purple** | pale | **red** |
| Pulse | slow thin weak/frail | **deep slow thin/choppy** | thin weak | **rapid/wiry** |
| Formula | Jiao Ai Tang | Wen Jing Tang | Gu Chong Tang | Gu Jing Wan |
| Highest discriminator | **pale blood + no clot + deficiency-Cold** | **Cold + clot/stasis** | **Spleen-deficiency flooding** | **red/dark Heat bleeding** |

---

## GYN-D02 — Uterus Deficiency-Cold vs Cold Congealing Blood in Uterus vs Blood Stasis in Uterus

| Feature | Uterus Deficiency-Cold 胞宮虛寒 | Cold Congealing Blood 寒凝胞宮 | Uterus Blood Stasis 胞宮血瘀 |
|---|---|---|---|
| Root | deficiency Cold | Cold obstruction | Blood Stasis |
| Pain | dull/cold, better warmth/pressure | **Cold pain, better warmth** | **fixed/stabbing** |
| Clots | possible but not core | **common** | **common/dark** |
| Cold limbs/fatigue | **high-value** | variable | no |
| Masses | not defining | possible | **high-value in relevant gyne contexts** |
| Tongue | pale/wet | pale-purple/dusky | **purple / spots** |
| Pulse | deep weak slow | deep slow/choppy/tight | choppy/wiry |
| Formula | Ai Fu Nuan Gong Wan | Wen Jing Tang | Gui Zhi Fu Ling Wan |
| Highest discriminator | **deficiency systemic Cold** | **Cold as obstruction mechanism** | **stasis without requiring Cold** |

---

# 8. Channel / Extraordinary-Vessel Differential Cluster

## CH-D01 — Yin Qiao vs Yang Qiao

| Feature | Yin Qiao Mai Imbalance 陰蹺 | Yang Qiao Mai Imbalance 陽蹺 |
|---|---|---|
| Core muscular discriminator | **陽緩陰急** | **陰緩陽急** |
| Medial side | **tight/tense** | relaxed/flaccid |
| Lateral side | relaxed/flaccid | **tight/tense** |
| Sleep tendency | **hypersomnia/excess sleepiness** | **insomnia/excess wakefulness** |
| Eye opening/closing | impaired | impaired |
| Gait/movement | imbalance | imbalance |
| Tongue/pulse | **no stable vessel-specific tongue/pulse established in current packet** | **no stable vessel-specific tongue/pulse established in current packet** |
| Point anchor | KI6 | BL62 |
| Highest discriminator | **medial tightness + hypersomnia** | **lateral tightness + insomnia** |

### Critical rule
Do not invent tongue/pulse for these vessel Patterns.  
If a case has a root Zang-Fu Pattern, tongue/pulse may reflect that root rather than the vessel imbalance itself.

---

## CH-D02 — Shao Yang vs Yang Wei

| Feature | Shao Yang | Yang Wei |
|---|---|---|
| Alternating chills/fever | yes | yes |
| Bitter taste | **high-value** | not required |
| Dry throat | **high-value** | not required |
| Nausea/dry heaves | **high-value** | not required |
| Hypochondriac fullness | **high-value** | possible |
| Wiry pulse | **classic** | not established as vessel-specific |
| Head/neck/shoulder trajectory | possible | **important** |
| Exterior/Yang-channel linking | no | **important** |
| Highest discriminator | pivot syndrome cluster | vessel trajectory + Yang-linking evidence |

---

## CH-D03 — Chong Qi Rebellion vs Stomach Qi Rebellion vs Liver Qi Invading Stomach

| Feature | Chong Qi Rebellion 衝氣上逆 | Stomach Qi Rebellion 胃氣上逆 | Liver Qi Invading Stomach 肝氣犯胃 |
|---|---|---|---|
| Core direction | **surging upward from lower abdomen/chest** | Stomach Qi fails to descend | Liver Qi overacts on Stomach |
| Lower abdominal origin | **high-value** | no | no |
| Palpitations / rushing to Heart | **high-value source clue** | no | no |
| Nausea/vomiting | possible | **core** | core |
| Belching/hiccup | possible | **high-value** | common |
| Emotional trigger | not required | not required | **identity discriminator** |
| Hypochondriac tension | no | no | **high-value** |
| Wiry pulse | not established as vessel-specific | depends root | **high-value** |
| Tongue/pulse | root-pattern dependent | root-pattern dependent | Liver/root dependent |
| Highest discriminator | **lower-origin upward surging** | **pure descending failure** | **Liver/emotional/hypochondriac evidence** |

---

## CH-D04 — Dai Mai Dysfunction vs Spleen-Damp Vaginal Discharge

| Feature | Dai Mai Dysfunction 帶脈失約 | Spleen Deficiency + Damp discharge |
|---|---|---|
| Vaginal discharge | common | common |
| Waist/lumbar weakness | **high-value** | possible |
| Girdling/waist-pelvic sensation | **identity discriminator** | no |
| “as if sitting in water” / watery-cold waist sensation | **classical/source-specific discriminator** | no |
| Abdominal fullness | common | common |
| Lower-limb weakness | possible | possible |
| Spleen fatigue/appetite | may be root but not required | **high-value** |
| Tongue/pulse | no stable vessel-specific set yet | pale/swollen/greasy depending Damp-Spleen pattern |
| Formula relation | Wan Dai Tang can involve Dai dysfunction | Wan Dai Tang also tonifies Spleen/transforms Damp |
| Highest discriminator | **waist-girdling vessel evidence** | **digestive Spleen deficiency dominates** |

---

## CH-D05 — Generic Channel Qi-Blood Obstruction vs Blood Stasis Obstruction vs Phlegm Obstruction vs Cold Obstruction

| Feature | Qi-Blood Channel Obstruction | Blood Stasis Obstruction | Phlegm Obstruction | Cold Obstruction |
|---|---|---|---|---|
| Pain | common | **fixed/stabbing** | heaviness > stabbing | **tight/cold, better warmth** |
| Numbness | common | common | **high-value** | possible |
| Heaviness | possible | low | **high-value** | possible |
| Restricted ROM | common | common | common | **high-value** |
| Purple/dusky signs | no | **high-value** | no | pale/Cold |
| Greasy coat | no | no | **high-value** | no |
| Worse Cold | possible | possible | no | **identity discriminator** |
| Pulse | depends cause | choppy/wiry | slippery | tight/deep |
| Highest discriminator | umbrella | **fixed stasis signs** | **Phlegm/heaviness/slippery** | **Cold response** |

---

# 9. Six-Channel vs Zang-Fu Deep-Deficiency Cluster

## SYS-D01 — Tai Yin Deficiency-Cold vs Spleen Yang Deficiency

| Feature | Tai Yin Deficiency-Cold 太陰虛寒 | Spleen Yang Deficiency 脾陽虛 |
|---|---|---|
| Framework | **Six Channels** | Zang-Fu |
| Diarrhea | **core** | common |
| Abdominal pain | core | common |
| No thirst | **classic stage clue** | possible |
| Cold limbs | possible | **high-value** |
| Edema | not necessary | **high-value** |
| Chronic constitution | not required | common |
| Tongue | pale/flabby, white coat | pale swollen wet |
| Pulse | deep weak/thin | deep weak slow |
| Formula | Li Zhong Wan | Li Zhong Wan can overlap |
| Highest discriminator | **stage identity / acute-deep Middle pattern** | **organ-based chronic Yang failure** |

---

## SYS-D02 — Shao Yin Cold vs Kidney Yang Deficiency

| Feature | Shao Yin Cold 少陰寒化 | Kidney Yang Deficiency 腎陽虛 |
|---|---|---|
| Framework | Six Channels | Zang-Fu |
| Severity | **deep/severe systemic weakness** | chronic deficiency |
| Desire to sleep/lethargy | **classic high-value** | fatigue but not defining |
| Diarrhea with undigested food | **high-value** | possible |
| Extreme cold limbs | **high-value** | common |
| Edema | possible | **common/high-value** |
| Low-back/knee weakness | possible | **identity-supporting** |
| Tongue | pale, white slippery | pale swollen wet |
| Pulse | **deep minute/faint** | deep weak slow |
| Formula | Si Ni Tang | Jin Gui Shen Qi Wan |
| Highest discriminator | **collapse-depth Six-Channel picture** | **Kidney-organ chronic picture** |

---

## SYS-D03 — Shao Yin Heat vs Heart-Kidney Yin Deficiency vs Heart-Kidney Not Communicating

| Feature | Shao Yin Heat 少陰熱化 | Heart-Kidney Yin Deficiency 心腎陰虛 | Heart-Kidney Not Communicating 心腎不交 |
|---|---|---|---|
| Framework | Six Channels | Combined Zang-Fu deficiency | Functional Heart-Kidney disharmony |
| Insomnia/restlessness | **core** | common | **core** |
| Dry throat | **high-value** | common | common |
| Kidney weakness | possible | **high-value** | **high-value** |
| Night sweat/five-center Heat | possible | **high-value** | common |
| Heart Fire not descending / Kidney water not rising | not required | not defining | **identity mechanism** |
| Tongue | **red, little coat** | red, little/no coat | red, little coat |
| Pulse | **thin rapid** | thin rapid | thin rapid |
| Formula | Huang Lian E Jiao Tang | Yin-nourishing combined formulas | Jiao Tai Wan / Huang Lian E Jiao Tang / Tian Wang Bu Xin Dan contexts |
| Highest discriminator | **Six-Channel stage identity** | **dual-organ Yin deficiency** | **communication failure mechanism** |

### Engine warning
Symptoms alone may not separate these well.  
Mechanism and differentiation system must carry high weight.

---

# 10. High-value “key negative” examples

AcuTing should eventually store negative discriminators because they are often more useful than another long symptom list.

Examples:

| Pattern | Useful negative discriminator |
|---|---|
| Stomach Fire | no peeled/scant center coat as dominant feature |
| Stomach Yin Deficiency | no strongly forceful/full Heat pulse |
| Liver Fire | no tremor/convulsion as required core |
| Liver Wind | bitter taste/red eyes not required |
| Tai Yang Shang Han | spontaneous sweating argues against classic form |
| Tai Yang Zhong Feng | complete absence of sweat + tight pulse argues against classic form |
| Wind-Heat | strong clear watery discharge + tight pulse argues against |
| Kidney Qi Not Firm | pronounced edema/cold suggests Kidney Yang deficiency instead |
| Spleen Qi Sinking | bleeding without sinking/prolapse suggests Spleen-not-controlling-Blood instead |
| Phlegm-Damp | red tongue + yellow greasy coat + rapid pulse suggests Heat transformation |
| Yang Qiao | hypersomnia + medial tightness suggests Yin Qiao instead |
| Dai Mai Dysfunction | discharge alone without waist/pelvic vessel evidence is insufficient |
| Shao Yang | alternating chills/fever alone is insufficient; look for bitter taste/dry throat/hypochondriac/nausea cluster |

---

# 11. Tongue matrix principles

## 11.1 Tongue body carries mechanism
High-value distinctions:

```text
pale
  → Qi/Blood/Yang deficiency, Cold

red
  → Heat / Yin deficiency

deep red / scarlet
  → Ying/Xue Heat

purple / dusky
  → Blood Stasis / severe stagnation

swollen/wet
  → Yang deficiency / Damp/Water

thin/dry
  → Blood/Yin/fluid deficiency
```

## 11.2 Coat carries pathogen / fluid / depth information

```text
thin white
  → exterior / mild Cold

yellow
  → Heat

greasy
  → Dampness / Phlegm

dry
  → Heat consuming fluids / Dryness

little or no coat
  → Yin / Stomach fluid deficiency

peeled center
  → Stomach Yin/fluid deficiency strongly supported

black/dry
  → severe interior Heat/Dryness in context
```

### Engine rule
Tongue body and coating must be stored separately.  
Do not reduce “舌紅苔黃膩” into one uncontrolled free-text feature if structured fields are available.

---

# 12. Pulse matrix principles

High-yield pulse discriminators:

| Pulse | Strong differential value |
|---|---|
| floating | exterior |
| tight | Cold / pain / classic Tai Yang Shang Han |
| relaxed/moderate/soft | Tai Yang Zhong Feng / exterior deficiency context |
| rapid | Heat |
| slow | Cold |
| slippery | Phlegm, Damp, food, pregnancy/context |
| wiry | Liver, pain, Shao Yang, tension |
| thin | Blood/Yin deficiency |
| weak | Qi/Yang deficiency |
| deep | interior / deficiency |
| forceful/full | Excess |
| choppy | Blood deficiency/stasis |
| flooding/large | strong Yang Ming/Qi-level Heat |

### Important
Pulse should modify confidence, not become a rigid one-to-one diagnosis rule.

---

# 13. Differential-engine storage proposal

Recommended staging object:

```json
{
  "pattern_id": "candidate.pattern.stomach_fire",
  "identity_discriminators": [
    {
      "feature": "gingival_heat_inflammation_or_bleeding",
      "weight": 5,
      "source_scope": "stomach_fire"
    },
    {
      "feature": "strong_hunger",
      "weight": 4
    }
  ],
  "tongue": {
    "body": ["red"],
    "coat": ["yellow", "dry_if_severe"]
  },
  "pulse": [
    "rapid",
    "forceful_or_full",
    "slippery_possible"
  ],
  "negative_discriminators": [
    {
      "feature": "peeled_center_coat_with_thin_pulse",
      "points_against": true,
      "suggests": "stomach_yin_deficiency"
    }
  ],
  "nearest_differentials": [
    "pattern.stomach_heat",
    "candidate.pattern.stomach_yin_deficiency"
  ],
  "provenance": []
}
```

---

# 14. Comparison object proposal

The current repo already has comparison infrastructure.

Future V2 comparison data should support:

```json
{
  "comparison_id": "cmp.stomach_heat_fire_yin_def",
  "patterns": [
    "pattern.stomach_heat",
    "pattern.stomach_fire",
    "candidate.pattern.stomach_yin_deficiency"
  ],
  "dimensions": [
    "heat_intensity",
    "hunger",
    "thirst",
    "gum_signs",
    "tongue_coat",
    "pulse_strength",
    "root_mechanism"
  ],
  "exam_high_yield": true
}
```

Antigravity should inspect the existing comparison schema before adding any new object.

---

# 15. Board-exam high-yield discriminator queue

The following comparison sets are especially suitable for NCCAOM/NCBAHM-style review:

1. Tai Yang Zhong Feng vs Tai Yang Shang Han
2. Yang Ming Jing vs Yang Ming Fu
3. Shao Yin Cold vs Shao Yin Heat
4. Wind-Cold vs Wind-Heat
5. Liver Fire vs Liver Yang Rising
6. Heart Blood Deficiency vs Heart Yin Deficiency
7. Kidney Qi Deficiency vs Kidney Yang Deficiency
8. Kidney Qi Deficiency vs Kidney Qi Not Firm
9. Spleen Qi Deficiency vs Spleen Qi Sinking
10. Spleen Qi Deficiency vs Spleen Not Controlling Blood
11. Stomach Fire vs Stomach Yin Deficiency
12. Phlegm-Damp vs Phlegm-Heat
13. Liver-GB Damp-Heat vs Bladder Damp-Heat
14. Blood Heat vs Blood Stasis bleeding
15. Chong-Ren deficiency-Cold vs Chong-Ren Blood Heat
16. Yin Qiao vs Yang Qiao
17. Shao Yang vs Yang Wei
18. Blood Heat vs Xue-stage Heat

---

# 16. Clinical-reasoning high-yield queue

For future AcuTing clinical mode, prioritize clusters where several Patterns can plausibly explain the same chief complaint.

## Insomnia
- Heart Blood Deficiency
- Heart Yin Deficiency
- Heart-Kidney Not Communicating
- Liver Fire
- Phlegm-Fire Disturbing Heart
- Yang Qiao imbalance

## Dizziness / vertigo
- Liver Yang Rising
- Liver Fire
- Internal Liver Wind
- Wind-Phlegm
- Blood Deficiency
- Yin deficiency
- Shao Yang
- Yang Wei / Qiao context when trajectory evidence exists

## Cough
- Wind-Cold
- Wind-Heat
- Wind-Cold Attacking Lung
- Wind-Heat Attacking Lung
- Lung Heat
- Phlegm-Damp Lung
- Phlegm-Heat Lung
- Lung Qi Deficiency
- Lung Yin Deficiency
- Lung Dryness
- Kidney failing to grasp Qi

## Constipation
- Large Intestine Excess Heat
- Yang Ming Fu
- Qi-stage intestinal Dry Heat
- Large Intestine Fluid Deficiency
- Blood Deficiency
- Kidney Yang Deficiency
- Qi stagnation

## Uterine bleeding
- Spleen Not Controlling Blood
- Chong-Ren Deficiency-Cold + Blood deficiency
- Chong-Ren deficiency + stasis
- Chong-Ren Blood Heat
- Blood Heat
- Blood Stasis
- Spleen Yang deficiency failing to hold Blood

---

# 17. “Do not over-differentiate” rules

A differential matrix can also create fake distinctions if handled badly.

Do not force separate identities when:

1. Chinese canonical identity is the same and only English wording differs.
2. A symptom cluster is merely condition-specific enrichment of one Pattern.
3. The “difference” is only biomedical disease context.
4. The “difference” is only one formula's wording.
5. A location can be represented as a relation.
6. A stage/system crosswalk overlaps but remains framework-specific.
7. Extraordinary-vessel data has no stable syndrome-level discriminators yet.

---

# 18. Source-confidence rule

For each discriminator, future data should retain:

```text
A = classical/source text
B = textbook/board/course consensus
C = clinical interpretation
D = weak or one-source disease mapping
```

### Promotion guidance

**Identity discriminator**
- ideally A/B
- multiple B sources acceptable
- C alone should rarely define canonical identity

**Supporting sign**
- B/C acceptable

**Context relation**
- C acceptable with provenance

**Biomedical equivalence**
- never infer from TCM source wording alone

---

# 19. Antigravity work package from Batch 09

Antigravity should not immediately alter production cards.

First produce a review artifact:

```text
candidate
existing canonical ID?
nearest 3 confusions
identity discriminators
tongue
coat
pulse
negative discriminators
formula anchors
source count
source confidence
missing evidence
recommended comparison IDs
```

Then classify:

```text
ready_for_comparison
needs_more_source
duplicate_risk
system_crosswalk_only
insufficient_discriminators
```

---

# 20. Highest-priority comparison tables to build first

## Priority A
1. `cmp.stomach_heat_fire_yin_deficiency`
2. `cmp.liver_fire_yang_rising_wind`
3. `cmp.heart_fire_yin_phlegm_fire_phlegm_mist`
4. `cmp.wind_cold_taiyang_shanghan_zhongfeng`
5. `cmp.wind_heat_wei_stage_lung`
6. `cmp.yangming_jing_qi_stage_stomach_heat`
7. `cmp.yangming_fu_qi_stage_intestinal_heat_li_heat`
8. `cmp.kidney_qi_not_firm_yang_jing`
9. `cmp.spleen_qi_sinking_not_control_blood_yang`
10. `cmp.chongren_bleeding_patterns`

## Priority B
11. `cmp.lung_qi_yin_dryness`
12. `cmp.damp_heat_locations`
13. `cmp.phlegm_damp_wind_phlegm_heat`
14. `cmp.shao_yang_yang_wei`
15. `cmp.yin_qiao_yang_qiao`
16. `cmp.chong_qi_stomach_qi_liver_invading_stomach`
17. `cmp.dai_mai_vs_spleen_damp_discharge`
18. `cmp.blood_heat_vs_xue_stage_heat`
19. `cmp.taiyin_vs_spleen_yang_deficiency`
20. `cmp.shaoyin_cold_vs_kidney_yang_deficiency`

---

# 21. Next recommended batch

## Batch 10 — Pattern Relationship Graph Pack

Batch 10 should stop thinking in rows and start building graph semantics:

```text
causes
results_from
progresses_to
transforms_into
generates
damages
fails_to_nourish
fails_to_control
fails_to_descend
rebels_upward
invades
attacks
scorches
obstructs
binds_with
coexists_with
subtype_of
broader_than
crosswalk_overlap
located_in
affects
```

High-value graph families:

### Liver
Liver Qi Stagnation
→ Heat
→ Fire
→ may generate Wind
→ may damage Yin

### Spleen/Phlegm
Spleen Qi Deficiency
→ Dampness
→ Phlegm

### Kidney/Water
Kidney Yang Deficiency
→ Water Flooding
→ Lung / Heart involvement

### Stomach
Stomach Heat
→ Stomach Fire
→ damages Stomach Yin / fluids

### Febrile disease
Wei → Qi → Ying → Xue
Tai Yang → possible internal transmission

### Gynecology
Spleen deficiency → Chong instability
Cold → Blood Stasis in uterus
Liver Heat/Fire → disturbs Chong-Ren

### Channels
Blood Stasis / Phlegm / Cold
→ obstruct channels

This graph layer will be the foundation for:
- progression learning
- causal reasoning
- “what can this Pattern become?”
- “what caused this?”
- cross-system visualization

---

# 22. Source basis

Batch 09 synthesizes the source-backed content already packaged in:

- Batch 02 — combined/mechanism/channel candidates
- Batch 03 — full Zang-Fu expansion
- Batch 04 — gynecology / Chong-Ren / Jing
- Batch 05 — canonical-candidate map
- Batch 06 — formula-to-Pattern inversion
- Batch 07 — Six Channels / Four Levels / San Jiao / Eight Principles
- Batch 08 — Extraordinary Vessels / Channel-System
- Pattern V1 Canonical Gap Pack

Primary underlying source families already preserved in those packs include:
- Sacred Lotus
- Shen-Nong
- Me & Qi
- American Dragon
- NCBAHM 2026 formula corpus
- Bastyr course/formula materials
- user-curated extraordinary-vessel / meridian files

No new canonical IDs are authorized by Batch 09.

---

## End of Batch 09

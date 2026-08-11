# AcuTing OS — TCM Pattern Expansion Research Pack v0.4
## Batch 04 — Gynecology / Chong-Ren / Jing / Reproductive Pattern Candidates
### Antigravity handoff research pack

**Date:** 2026-08-08  
**Research/extraction layer:** ChatGPT  
**Implementation/canonicalization layer:** Antigravity / repository agent  
**Status:** SOURCE-BACKED STAGING ONLY — do not bulk-create `pattern.*` IDs

---

# 0. Purpose

This pack extracts gynecology/reproductive Pattern evidence from the user's uploaded course/formula corpus and reorganizes it for future AcuTing OS expansion.

It intentionally separates:

- reusable **Pattern concepts**
- **TCM disease / reproductive context** (`tdis.*`)
- formula-specific presentations
- progression / root-branch relationships
- candidate canonical IDs
- aliases / terminology variants
- items that should remain modifiers rather than become standalone Patterns

The goal is to let Antigravity concentrate on repository work:

1. compare candidates with current registry/library/aliases,
2. decide canonical vs alias vs subtype vs graph-composition,
3. resolve formula/point IDs,
4. create or enrich cards,
5. validate and commit.

---

# 1. Source rules

## Direct source-derived material in this batch

Primary uploaded evidence used:

- `Herbal Formulations Comprehensive.docx.md`
- `方剂学汇总_extracted.md`
- `CHM+Formulation+2+course+package+.pdf`
- `NCBAHM_2026_AD_181_Formulas_Name_Actions_Syndromes.md`
- `American_Dragon_201_Formulas_Name_Actions_Syndromes.md`
- formula-card batches, especially `01_...` and `10_...`
- existing AcuTing Pattern expansion batches

## Inference rule

Where a relationship is marked `RESEARCH INFERENCE`, it is a structural interpretation of source wording for knowledge-graph design and is **not** presented as a quoted/source-established canonical taxonomy.

---

# 2. Ontology boundary: gynecology disease/context is not automatically a Pattern

The source corpus frequently mixes:

- menstruation timing/flow problems
- uterine bleeding
- threatened miscarriage
- habitual miscarriage
- infertility
- postpartum bleeding
- retained lochia
- vaginal discharge
- menopause/perimenopause

with the underlying TCM pattern.

For AcuTing OS, preserve the distinction:

```text
tdis.irregular_menstruation
tdis.dysmenorrhea
tdis.uterine_bleeding
tdis.threatened_miscarriage
tdis.postpartum_retained_lochia
tdis.infertility
tdis.vaginal_discharge
        ↓ may_have_pattern
pattern.xxx
```

Do not manufacture:

```text
pattern.postpartum_bleeding_due_to_...
pattern.infertility_due_to_...
```

for every formula indication.

---

# 3. Chong-Ren core candidate family

## GYN01 — Chong-Ren Deficiency / Insufficiency
**Chinese:** 衝任虛損 / 衝任不足  
**Pinyin:** Chōng Rèn Xū Sǔn / Chōng Rèn Bù Zú  
**Status:** `distinct_candidate` + `terminology_review`

### Source-derived core
Uploaded course materials repeatedly describe **Chong and Ren deficiency** as failure to secure/govern uterine Blood, especially in chronic reproductive bleeding contexts.

### Clinical source anchors
- uterine bleeding
- excessive menstruation
- continuous spotting
- bleeding during pregnancy
- postpartum persistent bleeding
- weak/sore low back
- pale/dull complexion

### Tongue / pulse anchors
From Jiao Ai Tang source:
- pale tongue
- thin white coating
- slow, thin, frail/weak pulse

### Treatment direction
- nourish Blood
- stabilize Chong/Ren
- secure bleeding
- regulate menstruation
- calm fetus where pregnancy context applies

### Formula anchors
- Jiao Ai Tang
- Gu Chong Tang
- Gu Jing Wan, but with a Heat/Yin-deficiency subtype rather than generic Chong-Ren deficiency
- Wen Jing Tang, with deficiency-Cold + stasis

### Canonical caution
Do not collapse all Chong-Ren pathology into one card. The corpus clearly supports important subtypes:
- deficiency + Cold + Blood deficiency
- deficiency + Cold + Blood stasis
- deficiency due Spleen deficiency
- injury by Liver Fire / Heat
- instability in pregnancy context

---

## GYN02 — Chong-Ren Deficiency-Cold with Blood Deficiency
**Chinese:** 衝任虛寒兼血虛  
**Pinyin:** Chōng Rèn Xū Hán Jiān Xuè Xū  
**Status:** `distinct_candidate` or `compound_graph_preferred`

### Strong source
Jiao Ai Tang source explicitly describes:
- Chong & Ren cold and deficiency
- Blood deficiency
- uterine bleeding
- pale, thin blood without clots
- abdominal pain
- weak/sore low back
- dull/sallow complexion
- pale tongue with thin white coat
- slow, thin, frail pulse

### Treatment principle
- nourish Blood
- warm Chong/Ren / uterus
- stop bleeding
- regulate menstruation
- stabilize fetus when relevant

### Formula anchor
- Jiao Ai Tang

### Differential from other Chong-Ren bleeding patterns
**vs Wen Jing Tang pattern**
- Jiao Ai Tang: more Blood deficiency and bleeding; pale/thin blood, typically no clot
- Wen Jing Tang: stronger Cold + Blood stasis; clots and dusky/purple tongue more likely

**vs Gu Jing Wan pattern**
- Jiao Ai Tang: deficiency-Cold
- Gu Jing Wan: Heat / Yin deficiency / Liver Fire injuring Chong-Ren

### Graph option
Could be represented as:
`Chong-Ren Deficiency` + `Blood Deficiency` + `Deficiency Cold`
instead of one very long canonical ID.

---

## GYN03 — Chong-Ren Deficiency-Cold with Blood Stasis
**Chinese:** 衝任虛寒兼血瘀 / 衝任虛寒瘀阻  
**Pinyin:** Chōng Rèn Xū Hán Jiān Xuè Yū  
**Status:** `distinct_candidate` or `compound_graph_preferred`

### Strong source
Wen Jing Tang source:
- Chong/Ren empty/deficiency Cold
- Blood stagnation/stasis
- irregular menstruation
- prolonged/continuous flow
- intermenstrual bleeding
- lower abdominal pain/distention/cold
- infertility context
- pale/thin bleeding may include clots
- dusky/pale-purple tongue
- deep, slow, thin / weak / choppy pulse

### Treatment principle
- warm channels / menstruation
- dispel Cold
- nourish Blood
- move Blood and dispel stasis
- regulate menstruation

### Formula anchor
- Wen Jing Tang

### Differential
**Jiao Ai Tang**
- more deficiency + Blood deficiency + bleeding
- less stasis

**Ai Fu Nuan Gong Wan**
- source comparison says stronger general uterus deficiency-Cold / Qi-Blood deficiency infertility pattern; course notes Wen Jing Tang as stronger at warming the channels in that comparison

### Board/source importance
NCBAHM/AD source explicitly labels Wen Jing Tang:
> Blood stasis from Cold with Deficiency Cold of Chong and Ren

---

## GYN04 — Chong Deficiency due to Spleen Deficiency / Chong Instability from Spleen Qi Deficiency
**Chinese:** 脾虛衝脈不固 / 衝脈不固（脾虛）  
**Status:** `distinct_candidate` vs `compound_graph_preferred`

### Source-derived evidence
Course comparison table for Gu Chong Tang:
- tonifies Spleen
- stabilizes Chong
- indication: Chong deficiency due to Spleen deficiency
- bleeding: thin and pale
- flow: flooding / continuous trickling
- pulse: thin, weak, empty/large in course comparison wording

### Treatment principle
- tonify Spleen Qi
- stabilize Chong
- secure Blood / stop uterine bleeding

### Formula anchor
- Gu Chong Tang

### Canonical decision question
Could be:
1. a distinct gynecology Pattern, or
2. `Spleen Qi Deficiency / Spleen Not Controlling Blood` → causes → `Chong instability`

Do not decide solely from formula title.

---

## GYN05 — Chong-Ren Heat / Blood Heat in Chong-Ren
**Chinese:** 衝任血熱 / 衝任伏熱 / 血熱擾衝任  
**Status:** `distinct_candidate` + `terminology_review`

### Strong source
Gu Jing Wan formula materials:
- nourishes Yin
- clears deficiency Heat
- stabilizes Chong/Ren
- stops bleeding
- source patterns include **Blood Heat due to Heat in the Chong and Ren channels**
- continuous menstruation / uterine bleeding
- very red or dark-red blood
- possible clots
- red tongue
- rapid/wiry pulse

### Treatment principle
- clear Heat
- cool Blood
- nourish Yin where deficient
- stabilize Chong/Ren
- stop bleeding

### Formula anchor
- Gu Jing Wan

### Ontology caution
The uploaded materials contain both:
- Excess/Fire language
- Yin-deficiency / deficiency-Heat language

Do not flatten these into one mechanism without preserving the source-specific mixture.

---

## GYN06 — Liver Fire / Stagnant Heat Injuring Chong-Ren
**Chinese:** 肝火傷衝任 / 肝鬱化熱擾衝任  
**Status:** `progression_review` / `compound_graph_preferred`

### Strong source
Gu Jing Wan course material:
- Liver Fire injuring Chong and Ren
- Liver stagnant Heat disturbs Chong/Ren
- alternating trickling and flooding
- thick/sticky/clotted red or purple blood
- irritability
- lower abdominal pain
- dark urine
- red tongue with yellow coating
- rapid, wiry pulse

### Graph interpretation — RESEARCH INFERENCE
Potential representation:
`Liver Qi Stagnation`
→ transforms_to → `Liver Heat / Liver Fire`
→ disturbs → `Chong-Ren`
→ manifests_as → uterine bleeding

This may be more useful than creating a giant standalone canonical Pattern.

### Formula anchor
- Gu Jing Wan

---

# 4. Uterus / Bao Gong pattern candidates

## GYN07 — Uterus Deficiency-Cold
**Chinese:** 胞宮虛寒 / 子宮虛寒  
**Pinyin:** Bāo Gōng Xū Hán  
**Status:** `distinct_candidate`

### Source anchors
Course comparison under Wen Jing Tang references Ai Fu Nuan Gong Wan:
- Xu and Cold uterus
- profuse, clear vaginal discharge
- sallow complexion
- limb pain
- fatigue
- poor digestion
- irregular menses
- infertility for years
- cold abdominal pain
- described as Qi and Blood deficiency + Cold uterus causing infertility

### Treatment principle
- warm uterus
- dispel deficiency Cold
- tonify Qi/Blood as root pattern requires
- regulate menstruation

### Formula anchors
- Ai Fu Nuan Gong Wan
- Wen Jing Tang for Chong/Ren Cold + stasis rather than simple uterus deficiency-Cold

### Differential
- Chong-Ren Deficiency-Cold
- Kidney Yang Deficiency
- Blood Stasis due Cold

---

## GYN08 — Cold Congealing Blood in Uterus
**Chinese:** 寒凝胞宮 / 寒凝血瘀  
**Status:** `distinct_candidate` or `compound_graph_preferred`

### Source anchors
- Wen Jing Tang: deficiency Cold + Blood stagnation in Chong/Ren
- Sheng Hua Tang: postpartum Cold congeals Blood / Blood stasis
- course comparison: Blood stasis location uterus/Chong-Ren with Cold as associated pathogen

### Signs from source cluster
- lower abdominal pain worse with Cold
- better with warmth
- clots
- irregular menstruation
- postpartum retained lochia in postpartum context
- dusky/purple tongue possible
- slow/choppy/deep pulse depending deficiency

### Treatment principle
Warm channels/uterus; dispel Cold; invigorate Blood; remove stasis.

### Formula anchors
- Wen Jing Tang
- Sheng Hua Tang in postpartum context
- Ai Fu Nuan Gong Wan if deficiency is primary

---

## GYN09 — Blood Stasis in Uterus
**Chinese:** 胞宮血瘀 / 子宮血瘀  
**Status:** `distinct_candidate`

### Strong source boundary evidence
Course comparison identifies **uterus** as Blood-stasis location for Gui Zhi Fu Ling Wan.

Postpartum formula source:
- retained lochia
- dark-purple clotted discharge
- lower abdominal pain
- retained tissue fragments
- painful postpartum contractions
- infertility due fallopian obstruction as listed application

### Formula anchors
- Gui Zhi Fu Ling Wan
- Tao Hong Si Wu Tang
- Sheng Hua Tang, specifically postpartum Cold + stasis
- Shi Xiao San for stronger pure stasis pain in postpartum comparison

### Clinical manifestations
- fixed/stabbing lower abdominal pain
- clots
- dark/purple menstrual or lochial blood
- masses/lumps in some formula contexts
- purple/dusky tongue
- choppy/wiry pulse

### TCM disease boundaries
Endometriosis, fibroids, retained lochia, postpartum pain, infertility are contexts, not equivalent to this Pattern.

---

## GYN10 — Qi Stagnation with Blood Stasis in Gynecology
**Chinese:** 氣滯血瘀（婦科）  
**Status:** `likely_existing_core` / `context_relation`

### Source anchors
- Xiao Yao San and related formulas: Liver Qi stagnation, Blood deficiency, menstrual complaints
- Dan Shen Yin source: Qi stagnation + Blood stasis, includes dysmenorrhea with flank pain
- Blood-moving formula corpus repeatedly links Qi stagnation and Blood stasis

### Ontology recommendation
Do not create a gynecology-only duplicate if `Qi and Blood Stagnation` or `Blood Stasis` already exists.

Use relations:
`pattern.qi_stagnation`
+ `pattern.blood_stasis`
→ associated_with →
`tdis.dysmenorrhea`, `tdis.irregular_menstruation`, etc.

---

# 5. Liver-centered menstrual/reproductive candidates

## GYN11 — Liver Qi Stagnation Affecting Menstruation
**Chinese:** 肝氣鬱結（經病） / 肝鬱氣滯  
**Status:** `context_relation` to existing Liver Qi Stagnation

### Source-derived clues
Xiao Yao San / course source:
- hypochondriac pain
- headache/vertigo
- breast distention
- irregular menstruation
- PMS
- dysmenorrhea
- stress/emotional trigger
- wiry pulse
- possible Spleen weakness / Blood deficiency

### Treatment principle
Soothe Liver; move Qi; regulate menstruation; address Blood/Spleen deficiency if present.

### Formula anchors
- Xiao Yao San
- Jia Wei Xiao Yao San when Heat develops
- Chai Hu Shu Gan San in stronger Qi stagnation

### Canonical rule
Do not create `pattern.liver_qi_stagnation_menstrual` if `pattern.liver_qi_stagnation` already exists.

---

## GYN12 — Liver Qi Stagnation Turning to Heat with Spleen/Blood Deficiency
**Chinese:** 肝鬱化熱兼脾虛血虛  
**Status:** `compound_graph_preferred`

### Source
Jia Wei Xiao Yao San AD:
- Liver Qi Stagnation turning to Heat
- underlying Spleen and Blood Deficiency
- regulates menstruation

### Graph
`Liver Qi Stagnation`
→ transforms_to → `Heat`
coexists_with → `Spleen Qi Deficiency`
coexists_with → `Blood Deficiency`

### Formula anchor
- Jia Wei Xiao Yao San

### Why not automatically canonical
This is a highly compound formula-treatment profile. Better graph decomposition is likely.

---

## GYN13 — Liver-Spleen Disharmony with Menstrual Complaints
**Chinese:** 肝脾不和（經病）  
**Status:** `context_relation`

### Source
Si Ni San:
- Liver and Spleen Disharmony / Liver attacking Spleen
- costal or abdominal pain
- menstrual complaints

Xiao Yao San:
- Liver Qi stagnation invades Spleen
- Spleen deficiency
- irregular menstruation

### Canonical rule
Likely use existing `Liver-Spleen Disharmony` Pattern and connect to menstrual TCM disease contexts.

---

# 6. Kidney / Jing reproductive candidates

## GYN14 — Kidney Jing Deficiency with Reproductive Insufficiency
**Chinese:** 腎精不足（生殖）  
**Status:** `context_relation` to Kidney Jing Deficiency

### Source-derived support
Formula/course materials repeatedly associate Kidney/Jing tonification with:
- infertility
- reproductive weakness
- menstrual disorders
- threatened miscarriage support in Kidney-deficiency contexts

### Formula anchors
- Shou Tai Wan secures Kidney and calms fetus
- You Gui / Zuo Gui family where present
- Jing-tonifying formulas in broader corpus

### Canonical rule
Prefer one reusable `Kidney Jing Deficiency` Pattern, then reproductive relations, rather than a reproductive-only duplicate.

---

## GYN15 — Kidney Deficiency Failing to Secure Pregnancy
**Chinese:** 腎虛胎元不固 / 腎虛胎漏胎動  
**Status:** `tdis_boundary_review` + `compound_graph_preferred`

### Strong source
Shou Tai Wan course:
- stabilizes Kidney
- calms fetus
- low-back soreness/distention
- sensation of lower-abdominal collapse
- vaginal bleeding during pregnancy
- dizziness
- weak legs
- pale tongue
- slippery pulse

### Treatment principle
Tonify/stabilize Kidney; secure fetus.

### Formula anchor
- Shou Tai Wan

### Ontology caution
`Threatened miscarriage` belongs in disease/context layer.
Underlying reusable Pattern may be:
- Kidney Qi deficiency
- Kidney Qi not firm
- Kidney Jing deficiency

Do not promote `pregnancy bleeding from Kidney deficiency` as a standalone universal Pattern unless the canonical design explicitly wants pregnancy-specific TCM Pattern nodes.

---

## GYN16 — Kidney Qi Not Firm in Reproductive / Urinary Context
**Chinese:** 腎氣不固  
**Status:** `likely_existing_or_high_priority`

### Source relevance
The broader course corpus connects securing formulas with:
- leakage
- spermatorrhea
- frequent urination
- pregnancy instability depending formula/context

### Formula anchors
- Jin Suo Gu Jing Wan
- Sang Piao Xiao San for Heart-Kidney and essence leakage
- Shou Tai Wan in pregnancy context

### Graph use
Reusable Pattern node can connect to:
- urinary leakage
- spermatorrhea
- recurrent pregnancy instability TCM contexts

---

# 7. Bleeding-pattern family relevant to gynecology

## GYN17 — Spleen Not Controlling Blood
**Chinese:** 脾不統血  
**Status:** `likely_existing_core`

### Source-derived gynecology manifestations
- chronic uterine bleeding
- pale-red bleeding
- fatigue
- poor appetite
- sallow complexion
- weak pulse

### Formula anchors
- Gui Pi Tang
- Huang Tu Tang when Spleen Yang deficiency / deficiency Cold dominates
- Bu Zhong Yi Qi Tang when Qi sinking/prolapse is prominent
- Gu Chong Tang when Chong instability is emphasized

### Graph
Spleen Qi Deficiency
→ fails_to_hold → Blood
→ may_destabilize → Chong

---

## GYN18 — Spleen Yang Deficiency Causing Chronic Uterine Bleeding
**Chinese:** 脾陽虛失統血  
**Status:** `subtype_review`

### Source
Huang Tu Tang:
- Spleen Yang deficiency
- failure to govern Blood
- Empty Cold in Middle Jiao
- chronic bleeding
- abnormal uterine bleeding with pale-red blood
- cold extremities
- fatigue
- sallow complexion
- pale tongue / white coat
- deep thin weak pulse

### Treatment principle
Warm Yang; strengthen Spleen; nourish/secure Blood.

### Formula anchor
- Huang Tu Tang

### Canonical question
Could remain:
`Spleen Yang Deficiency` + `Spleen Not Controlling Blood`
rather than a separate long-form canonical Pattern.

---

## GYN19 — Blood Heat Causing Uterine Bleeding
**Chinese:** 血熱妄行（崩漏 / 經血）  
**Status:** `subtype_review`

### Source-derived features
Gu Jing Wan and course bleeding section:
- red/dark-red blood
- Heat signs
- red tongue
- rapid pulse
- chronic or continuous uterine bleeding depending source
- excess and deficiency Heat may both be involved in Gu Jing Wan teaching notes

### Formula anchors
- Gu Jing Wan
- heat-clearing stop-bleeding formulas from course corpus

### Differential
- Spleen not controlling Blood: pale, weak, deficiency
- Chong-Ren deficiency-Cold: pale thin blood, Cold
- Blood stasis: dark/purple clots + fixed pain

---

## GYN20 — Blood Deficiency with Menstrual Insufficiency
**Chinese:** 血虛經病  
**Status:** `context_relation`

### Source anchors
Si Wu Tang:
- mild Blood deficiency
- dysmenorrhea
- amenorrhea
- irregular menstruation
- infertility
- postpartum weakness
- insufficient lactation

### Canonical rule
Use reusable `Blood Deficiency` / `Liver Blood Deficiency` node and connect to reproductive conditions rather than creating a menstruation-only Pattern.

---

# 8. Dai Mai / vaginal-discharge boundary

## GYN21 — Dai Channel Dysfunction with Spleen Deficiency, Liver Qi Stagnation, Damp-Turbidity
**Chinese:** 帶脈失約 / 脾虛肝鬱濕濁下注  
**Status:** `canonical_review_required`

### Source
Wan Dai Tang NCBAHM/AD:
- tonifies Spleen/Middle Jiao
- spreads Liver Qi stagnation
- transforms Dampness
- stops vaginal discharge
- syndrome:
  - Spleen deficiency
  - Liver Qi stagnation
  - Damp/turbidity in Lower Jiao
  - Dai channel dysfunction

### Ontology options
A. Create a genuine Dai Mai / Extraordinary Vessel Pattern node if AcuTing supports extraordinary-vessel patterns.

B. Represent as graph composition:
`Spleen Qi Deficiency`
+ `Liver Qi Stagnation`
+ `Dampness`
→ affects → `Dai Mai`
→ manifests_as → `tdis.vaginal_discharge`

### Formula anchor
- Wan Dai Tang

### Important
Do not make biomedical vaginal infection/cervicitis etc equivalent to Dai Mai dysfunction.

---

# 9. Postpartum pattern candidates

## GYN22 — Postpartum Blood Stasis / Retained Lochia
**Chinese:** 產後血瘀 / 惡露不下（血瘀）  
**Status:** `tdis_boundary_review`

### Strong source
Sheng Hua Tang source:
- postpartum dark-purple clotted discharge
- lower abdominal pain
- retained lochia
- postpartum uterine contractions
- retained tissue fragments as listed application
- postpartum Cold congealing Blood

### Treatment direction
Move Blood; dispel stasis; warm Blood/Middle when Cold is present; nourish new Blood according to formula logic.

### Formula anchors
- Sheng Hua Tang
- Shi Xiao San for stronger pure stasis pain

### Canonical caution
`Postpartum retained lochia` should be a disease/context.
Underlying Pattern:
- Blood Stasis
- Cold-congealed Blood Stasis
- possible Blood deficiency as postpartum root

---

## GYN23 — Postpartum Blood Deficiency
**Chinese:** 產後血虛  
**Status:** `context_relation`

### Source anchors
- Si Wu Tang applications include postpartum weakness
- Ren Shen Yang Rong Tang / tonification formula corpus includes postpartum illness
- Blood-nourishing formulas in reproductive context

### Canonical rule
Do not create a postpartum-only Blood deficiency card.
Use `Blood Deficiency` / `Qi and Blood Deficiency` and connect to postpartum context.

---

## GYN24 — Postpartum Cold-Congealed Blood Stasis
**Chinese:** 產後寒凝血瘀  
**Status:** `compound_graph_preferred`

### Source
Sheng Hua Tang course comparison:
- postpartum Cold congeals Blood
- retained lochia + lower abdominal pain
- Sheng Hua Tang nourishes Blood and warms Middle
- Shi Xiao San is stronger pure stasis breaker

### Graph
`Postpartum context`
+ `Cold`
+ `Blood Stasis`

This is a textbook example of why clinical context should not generate a unique universal Pattern ID by itself.

---

# 10. Pregnancy / fetus-stabilization candidates

## GYN25 — Chong-Ren Deficiency with Fetal Restlessness
**Chinese:** 衝任虛損胎動不安  
**Status:** `tdis_boundary_review`

### Source
Jiao Ai Tang:
- Chong/Ren injury
- Blood deficiency + Cold
- bleeding
- abdominal pain
- restless fetus
- threatened/habitual miscarriage applications

### Reusable root pattern
- Chong-Ren Deficiency-Cold
- Blood Deficiency

### Context relation
→ may present in `tdis.threatened_miscarriage`

---

## GYN26 — Kidney Deficiency with Fetal Instability
**Chinese:** 腎虛胎元不固  
**Status:** `tdis_boundary_review`

### Source
Shou Tai Wan:
- stabilizes Kidney
- calms fetus
- pregnancy bleeding
- low-back soreness
- weak legs
- lower abdominal sinking/collapse sensation

### Reusable root pattern
- Kidney Qi/Jing deficiency
- Kidney Qi not firm

### Context
Threatened miscarriage / pregnancy bleeding

---

# 11. Menstrual timing/flow should be manifestations/TCM disease dimensions, not Patterns

The corpus repeatedly contains:

- early menstruation
- late menstruation
- prolonged menstruation
- continuous spotting
- flooding
- scanty menstruation
- amenorrhea
- irregular menstruation
- dysmenorrhea

These should usually live as:

- `tdis.*` entities,
- manifestation fields,
- discriminator dimensions,

not as Pattern identities.

Example:

```text
tdis.early_menstruation
   may_have_pattern:
   - Blood Heat
   - Yin Deficiency Heat
   - Qi Deficiency / Spleen not controlling Blood
   - Liver constraint transforming Heat
```

Actual mappings require source-by-source validation.

---

# 12. High-priority canonical candidates from Batch 04

These deserve early registry/library/alias comparison:

1. **Chong-Ren Deficiency / Insufficiency** — 衝任虛損
2. **Chong-Ren Deficiency-Cold** — 衝任虛寒
3. **Chong-Ren Deficiency-Cold with Blood Stasis** — 衝任虛寒血瘀
4. **Chong Instability due Spleen Deficiency** — 脾虛衝脈不固
5. **Chong-Ren Blood Heat / Heat injuring Chong-Ren** — 衝任血熱
6. **Uterus Deficiency-Cold** — 胞宮虛寒
7. **Cold Congealing Blood in Uterus** — 寒凝胞宮 / 寒凝血瘀
8. **Blood Stasis in Uterus** — 胞宮血瘀
9. **Dai Channel Dysfunction** — 帶脈失約, if extraordinary-vessel Patterns are in scope
10. **Kidney Qi Not Firm** — 腎氣不固, if not already canonical
11. **Kidney Jing Deficiency** — 腎精不足, if not already canonical

---

# 13. Strong candidates that probably belong to graph composition rather than standalone cards

- Liver Fire injuring Chong-Ren
- Liver Qi stagnation turning to Heat + Spleen deficiency + Blood deficiency
- Liver Qi stagnation affecting menstruation
- Spleen Yang deficiency causing uterine bleeding
- postpartum Cold-congealed Blood stasis
- Kidney deficiency causing fetal instability
- Chong-Ren deficiency causing threatened miscarriage
- Spleen deficiency + Liver Qi stagnation + Dampness affecting Dai Mai

These are clinically valuable relationships, but their complexity argues against automatic flat canonical IDs.

---

# 14. Differential matrix — uterine bleeding patterns from course source

| Pattern candidate | Blood quality / flow | Other clues | Tongue | Pulse | Formula anchor |
|---|---|---|---|---|---|
| Chong-Ren deficiency-Cold + Blood deficiency | pale, thin, usually no clots; spotting/heavy/continuous | weak sore low back, dull complexion, Cold | pale, thin white coat | slow, thin, weak/frail | Jiao Ai Tang |
| Chong-Ren deficiency-Cold + Blood stasis | pale/thin but may clot; irregular/prolonged | lower abdominal Cold/pain, infertility context | dusky/pale-purple | deep, slow, thin/choppy | Wen Jing Tang |
| Spleen deficiency → Chong instability | thin/pale; flooding/continuous trickling | fatigue, Spleen deficiency | pale | thin/weak | Gu Chong Tang |
| Heat / Liver Fire injuring Chong-Ren | dark/red, thick/sticky, possible dark clots; alternating trickle/flooding | irritability, lower abdominal pain, dark urine | red, yellow coat | rapid, wiry | Gu Jing Wan |
| Spleen Yang deficiency not controlling Blood | pale-red chronic bleeding | cold extremities, fatigue, sallow complexion | pale, white coat | deep, thin, weak | Huang Tu Tang |

**Important:** This table is reorganized directly from the uploaded course comparison materials; it is not a new universal gynecology taxonomy.

---

# 15. Formula-to-Pattern anchors

## Jiao Ai Tang
Pattern evidence:
- Chong/Ren deficiency-Cold
- Blood deficiency
- uterine bleeding
- fetal restlessness

## Wen Jing Tang
Pattern evidence:
- Chong/Ren deficiency-Cold
- Blood stasis from Cold
- menstrual disorder / infertility context

## Gu Chong Tang
Pattern evidence:
- Chong deficiency due Spleen deficiency
- instability / chronic uterine bleeding

## Gu Jing Wan
Pattern evidence:
- Blood Heat in Chong/Ren
- Yin deficiency Heat
- Liver Fire / constrained Heat injuring Chong/Ren

## Huang Tu Tang
Pattern evidence:
- Spleen Yang deficiency
- failure to govern Blood
- deficiency-Cold bleeding

## Shou Tai Wan
Pattern evidence:
- Kidney deficiency / Kidney instability
- fetus not secured

## Wan Dai Tang
Pattern evidence:
- Spleen deficiency
- Liver Qi stagnation
- Damp/turbidity in Lower Jiao
- Dai channel dysfunction

## Sheng Hua Tang
Pattern evidence:
- postpartum Cold
- Blood stasis
- retained lochia context

## Si Wu Tang
Pattern evidence:
- Blood deficiency
- menstrual/reproductive manifestations

## Xiao Yao San / Jia Wei Xiao Yao San
Pattern evidence:
- Liver Qi stagnation
- Spleen weakness
- Blood deficiency
- Heat transformation in Jia Wei variant
- menstrual complaints are contextual manifestations

---

# 16. Relationship candidates

## Chong-Ren
- Spleen Qi Deficiency → may_fail_to_secure → Chong
- Blood Deficiency → may_weaken → Chong/Ren
- Deficiency Cold → may_affect → Chong/Ren
- Cold → may_congeal → Blood → Stasis in Chong/Ren
- Liver Fire / Heat → may_injure → Chong/Ren
- Chong/Ren instability → may_manifest_as → uterine bleeding

## Kidney
- Kidney Qi/Jing Deficiency → may_fail_to_secure → pregnancy / reproductive function
- Kidney Qi Deficiency → may_progress_to_or_overlap → Kidney Qi Not Firm
- Kidney Jing Deficiency → may_manifest_in → infertility/reproductive weakness

## Liver/Blood
- Liver Qi Stagnation → may_cause → menstrual irregularity / distention/pain
- Liver Qi Stagnation → may_transform_into → Heat
- Qi Stagnation → may_lead_to → Blood Stasis
- Cold → may_congeal → Blood Stasis in uterus

## Spleen
- Spleen Qi Deficiency → fails_to_hold → Blood
- Spleen Yang Deficiency → adds → Deficiency Cold bleeding
- Spleen deficiency → may_generate → Dampness
- Spleen deficiency + Liver constraint + Dampness → may_affect → Dai Mai

---

# 17. Proposed Antigravity candidate-review table

Antigravity should produce a machine/repo-aware review table with:

| candidate | exact current registry match | library match | alias match | likely relation | action |
|---|---|---|---|---|---|
| 衝任虛損 | ? | ? | ? | canonical / umbrella | review |
| 衝任虛寒 | ? | ? | ? | subtype | review |
| 衝任虛寒血瘀 | ? | ? | ? | subtype / compound | review |
| 脾虛衝脈不固 | ? | ? | ? | graph composition | review |
| 衝任血熱 | ? | ? | ? | subtype | review |
| 胞宮虛寒 | ? | ? | ? | canonical | review |
| 寒凝胞宮 | ? | ? | ? | subtype / Blood stasis | review |
| 胞宮血瘀 | ? | ? | ? | canonical / location subtype | review |
| 帶脈失約 | ? | ? | ? | extraordinary-vessel | review |
| 腎精不足 | ? | ? | ? | canonical | review |
| 腎氣不固 | ? | ? | ? | canonical | review |

---

# 18. Antigravity implementation instructions

This pack is **not permission to add every candidate**.

For each candidate:

1. search current `pattern_registry.json`
2. search `pattern_library.json`
3. search `pattern_alias_map.json`
4. search relation registry
5. search TCM disease graph
6. search formula references
7. compare exact Chinese identity first
8. then compare English aliases
9. determine:
   - existing canonical
   - alias
   - subtype
   - broader/narrower
   - progression
   - compound graph
   - distinct candidate
   - TCM disease/context only
10. never create a pregnancy/postpartum/menstrual duplicate merely because a source formula is used in that context
11. preserve provenance
12. resolve formula IDs
13. resolve point IDs only from accepted source evidence
14. run validators
15. keep current canonical IDs immutable unless a separately approved migration decision exists

---

# 19. Source evidence index for this batch

### Jiao Ai Tang / Chong-Ren deficiency-Cold
Uploaded course source states:
- Chong & Ren cold and deficiency causing uterine bleeding
- Blood pale/thin without clots
- weak/sore low back
- pale tongue, thin white coat
- slow thin frail pulse
- threatened miscarriage / habitual miscarriage / postpartum persistent bleeding contexts

### Wen Jing Tang / Chong-Ren Cold + Blood stasis
Uploaded course source states:
- Chong & Ren empty Cold with Blood stagnation
- irregular/prolonged menstruation
- bleeding between periods
- lower abdominal Cold/pain
- infertility
- dusky tongue
- deep slow thin / choppy pulse

### Gu Chong Tang
Course comparison:
- tonify Spleen
- stabilize Chong
- Chong deficiency due Spleen deficiency
- pale/thin flooding or continuous trickling

### Gu Jing Wan
Course / formula sources:
- nourish Yin
- clear Heat / deficiency Heat
- stabilize Chong/Ren
- Blood Heat in Chong/Ren
- Liver Fire / stagnant Heat injuring Chong/Ren
- red/dark bleeding, possible clots
- red tongue
- rapid/wiry pulse

### Huang Tu Tang
Course source:
- Spleen Yang deficiency
- failure to govern Blood
- deficiency-Cold
- chronic uterine bleeding with pale-red blood
- cold extremities / fatigue
- pale tongue / white coat
- deep thin weak pulse

### Shou Tai Wan
Course source:
- stabilizes Kidney
- calms fetus
- low-back soreness
- lower abdominal sinking/collapse sensation
- vaginal bleeding during pregnancy
- dizziness
- weak legs
- pale tongue
- slippery pulse

### Wan Dai Tang
NCBAHM/AD:
- Spleen deficiency
- Liver Qi stagnation
- Damp/turbidity in Lower Jiao
- Dai channel dysfunction

### Sheng Hua Tang
Course source:
- postpartum Blood stasis
- Cold congealing Blood
- retained lochia
- lower abdominal pain
- dark-purple clotted discharge

---

# 20. Next recommended research batch

## Batch 05 — Alias / Duplicate / Canonical-Candidate Master Map

This should no longer be organ-system prose.

It should invert all current expansion research into a canonical-review table:

```text
source phrase
→ normalized Chinese
→ normalized English
→ existing `pattern.*` candidate
→ alias?
→ subtype?
→ progression?
→ graph composition?
→ TCM disease/context?
→ source count
→ formula anchors
→ canonical confidence
→ recommended action
```

This is the most useful next artifact for Antigravity before any large V2 expansion.

---

## End of Batch 04

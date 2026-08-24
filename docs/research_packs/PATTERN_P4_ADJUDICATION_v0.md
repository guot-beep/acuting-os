# Pattern P-4 Adjudication (2026-08-11, Sonnet)

Branch: `codex/pattern-p4-recs`, off true tip of `origin/codex/pattern-v2` (`f0c396e`
"T4 skeleton rule refinement..."). **Decision-prep document only — no data files
changed.** Recommendations for Ting/Fable to rule on; nothing here is
implementation-authorized.

Scope: the 88 unique `pat.*` ids P-3 could not match (`docs/research_packs/PATTERN_P3_LEDGER.md`
"P-4 review queue"), read from `data/config/pattern_alias_map.json`:

- `pending_registration` — 56 unique ids (58 records; 2 ids each carry 2 canon
  records: `陰虛火旺`, `脾胃虛弱`)
- `excluded_formula_patterns` — 32 unique ids = 30 `方證`/`類方證` (formula
  layer, D10 rule 5) + 2 CloudTCM catch-all buckets (`氣血不和`, `臟腑虛弱`)

Vocabulary reused from `docs/research_packs/PATTERN_V2D_FINAL_CANONICAL_DECISION_SLICE_2026-08-11.md`
(`APPROVE_CANONICAL` / `GRAPH_ONLY` / `HOLD_FOR_TING` / `BROADER_NARROWER` /
`LOCATION_ONLY`) is cited inline wherever a row overlaps a V2-D-ruled concept.

**Rule followed throughout**: `CREATE_CANONICAL` only where I can name the
pattern in standard 中醫診斷學/方劑學 teaching in one line. Anything I could
not confidently frame that way is `GRAPH_ONLY` or flagged uncertain — not
invented.

---

## Counts per recommendation bucket (88 ids total)

| Recommendation | Unique `pat.*` ids | Notes |
|---|---:|---|
| `CREATE_CANONICAL` | 27 ids → **25 proposed cards** | 2 consolidations (脾胃陽虛+脾胃虛寒; 脾虛濕困+脾虛濕阻) |
| `MAP_TO_EXISTING` | 21 | near-miss aliases P-3's exact-match bar correctly skipped |
| `GRAPH_ONLY` | 7 | combination/transformation states, one already V2-D-ruled `LOCATION_ONLY` |
| `RETIRE_AS_IMPORT_ARTIFACT` | 3 | `pat.1` (numeric junk) + 2 CloudTCM catch-all buckets |
| `FORMULA_LAYER` (confirmed, not re-litigated) | 30 | 方證/類方證, awaits formula-line integration |
| **Total** | **88** | matches P-3 ledger's queue exactly |

---

## Section 1 — `CREATE_CANONICAL` (25 cards, sorted by usage frequency)

Each row: legacy id(s) · name_zh · formula_zh · condition payload · proposed
slug · one-line textbook framing · why P-3 skipped it.

| legacy id(s) | name_zh | formula_zh | conditions (used_by) | proposed `pattern.<slug>` | textbook framing | why unmatched |
|---|---|---|---|---|---|---|
| `pat.脾胃陽虛` + `pat.脾胃虛寒`(consolidate) | 脾胃陽虛 / 脾胃虛寒證 | 腎著湯 / 黃芪建中湯 | 15 + 1 (lumbar/GI/resp mix) | `pattern.spleen_stomach_yang_deficiency` | Combined-organ Yang deficiency of Spleen and Stomach — cold limbs, loose stool, epigastric cold pain worse with cold/better with warmth; same structural class as the already-canonical `spleen_kidney_yang_deficiency`. | No `pattern.*` combines Spleen+Stomach yang; only `spleen_yang_deficiency` (single-organ) exists. Two legacy ids for one concept — 虛寒 is a synonym of 陽虛, consolidate as alias. |
| `pat.外感風濕` | 外感風濕 | 獨活寄生湯 | 14 (ortho/Bi-pattern conditions) | `pattern.wind_damp_invasion` | Exterior Wind-Damp invading channels/joints — heaviness, wandering soreness, worse in damp weather; the Wind-Damp-predominant member of the Bi differentiation set, distinct from cold-predominant `wind_cold_damp_bi` (id 89) because it lacks the cold-pain (痛痺) component. | `證`-stripped exact match against `風寒濕痺`/`風寒濕痹` fails (差一個「寒」字) — real clinical distinction, not a naming accident. |
| `pat.脾虛濕困` + `pat.脾虛濕阻`(consolidate) | 脾虛濕困 / 脾虛濕阻證 | 平胃散 / 參苓白朮散 | 10 + 1 | `pattern.spleen_deficiency_damp_encumbrance` | Deficiency-root Spleen Qi failing to transform fluids, damp accumulating internally — distinct root mechanism from the already-canonical `cold_damp_encumbering_spleen` (id 13, exogenous excess-type damp attacking a healthy spleen). | Root-cause axis (deficiency vs excess) that P-3's name-identity matcher cannot see; 困/阻 are near-synonyms of each other, consolidate. |
| `pat.痰瘀互結` | 痰瘀互結 | 身痛逐瘀湯 | 7 (ortho/resp/onco mix) | `pattern.phlegm_stasis_binding` | Two pathological products (phlegm + blood stasis) binding together — same structural class as the already-canonical `qi_stagnation_blood_stasis` (2-factor combined pattern), just phlegm instead of qi as the co-factor. Ubiquitous across TCM oncology/cardiology/orthopedics. | No combined phlegm+stasis card exists; only single-factor `phlegm` and `blood_stasis` generics. |
| `pat.痰氣互結` | 痰氣互結 | 旋覆代赭湯 | 5 (globus/nausea/depression) | `pattern.phlegm_qi_binding` | Phlegm and Qi stagnation binding in the throat/chest — the classic 梅核氣 (plum-pit qi) mechanism. | Same combined-pathology gap as above. |
| `pat.水飲內停` | 水飲內停 | 五苓散 | 4 | `pattern.water_fluid_retention` | Internal fluid accumulation from Yang failing to transform water — the general Tan-Yin (痰飲病) fluid-retention pattern, distinct from the Shang-Han-Lun-stage-specific `tai_yang_water_accumulation` (id 109). | Site/stage-specific existing card doesn't cover the general internal-medicine presentation. |
| `pat.陰虛火旺` (×2 records) | 陰虛火旺(證) | 黃連阿膠湯 / 知柏地黃丸 | 2 (insomnia/globus) | `pattern.yin_deficiency_fire_flaring` | Yin deficiency with flaring/effulgent Fire — one of the most-taught combined patterns in TCM (night sweats, malar flush, five-palm heat, insomnia); currently only the bare generic `yin_deficiency` (id 92) exists in canon. | Genuine gap — high-value, top execution priority despite low in-dataset usage count (ubiquity is real-world, not reflected by this project's condition sample). |
| `pat.血虛風燥` | 血虛風燥證 | 當歸飲子 | 2 (eczema/urticaria) | `pattern.blood_deficiency_wind_dryness` | Chronic Blood deficiency generating internal Wind-Dryness — core TCM dermatology pattern for chronic/dry itch conditions. | No dermatology-specific blood-deficiency pattern in canon; `liver_blood_deficiency` is a different clinical picture. |
| `pat.心胃火盛` | 心胃火盛 | 三黃瀉心湯 | 2 (gastritis/aphthous) | `pattern.heart_stomach_fire` | Combined Heart Fire + Stomach Fire — standard for aphthous ulcers/mouth sores, same structural class as the already-canonical `liver_fire_scorching_lung` (organ+organ fire combination). | No Heart+Stomach fire combination card exists. |
| `pat.水氣凌心` | 水氣凌心 | 苓桂朮甘湯 | 1 (hypothyroidism) | `pattern.water_qi_attacking_heart` | Water-Rheum assailing the Heart — classic palpitation/edema/heart-failure pattern, distinct from the existing generic `kidney_yang_deficiency_water_flooding` (not Heart-specific). | Site-specific gap; standard cardiology TCM pattern. |
| `pat.肝火犯胃` | 肝火犯胃 | 左金丸 | 1 (peptic ulcer) | `pattern.liver_fire_invading_stomach` | Liver Fire invading the Stomach — heartburn/acid reflux/epigastric burning with irritability; same "Organ Fire → X organ" naming convention as the already-canonical `liver_fire_scorching_lung`. | Direct structural gap next to an existing sibling pattern. |
| `pat.肺胃燥熱` | 肺胃燥熱證 | 玉女煎 | 1 (T2DM) | `pattern.lung_stomach_dryness_heat` | Lung-Stomach Dryness-Heat — classic 消渴 (wasting-thirst/diabetes) upper-and-middle-burner pattern. | Diabetes-specific gap, standard in 中醫内科學 消渴 chapter. |
| `pat.肺氣虛寒` | 肺氣虛寒證 | 玉屏風散合溫肺止流丹 | 1 (allergic rhinitis) | `pattern.lung_qi_deficiency_cold` | Lung Qi deficiency with Cold — chronic clear rhinorrhea/sneezing pattern in allergic rhinitis, distinct from bare `lung_qi_deficiency` (id 2) by the added cold-nature complication. | Same deficiency+complication precedent as existing `kidney_yang_deficiency_water_flooding`. |
| `pat.肺熱壅盛` | 肺熱壅盛 | 清上防風湯 | 1 (acne) | `pattern.lung_heat_excess` | Pure Lung Heat excess (no exterior wind, no phlegm) — parallel structure to the already-canonical `stomach_heat` (胃熱熾盛). | Gap next to existing sibling-organ heat-excess pattern. |
| `pat.胃寒` | 胃寒 | 附子理中湯 | 1 (nausea/vomiting) | `pattern.stomach_cold` | Simple Stomach Cold — basic textbook pattern, parallel to existing `stomach_heat`/`stomach_yin_deficiency`/`stomach_qi_deficiency` siblings. | Basic gap in an otherwise complete Stomach organ-pattern set. |
| `pat.風寒襲絡` | 風寒襲絡證 | 牽正散合小續命湯 | 1 (Bell's palsy) | `pattern.wind_cold_invading_collaterals` | Wind-Cold invading the facial channels/collaterals — the standard Bell's Palsy TCM pattern, channel-level (not generic exterior) per the precedent of the existing `cold_stagnation_liver_channel`. | High real-world value (Bell's palsy common); channel-specific site the generic `wind_cold` card doesn't capture. |
| `pat.氣秘` | 氣秘證 | 六磨湯 | 1 (constipation) | `pattern.qi_constipation` | Qi-stagnation constipation — one of the 3 standard subtypes (氣秘/熱秘/虛秘) in the 中醫内科學 便秘 differentiation system. | Part of a coherent 3-pattern textbook set, batch with the next two rows. |
| `pat.熱秘` | 熱秘證 | 麻子仁丸 | 1 (constipation) | `pattern.heat_constipation` | Heat-excess constipation — same 便秘 differentiation set. | Same set. |
| `pat.虛秘` | 虛秘證 | 黃芪湯 | 1 (constipation) | `pattern.deficiency_constipation` | Deficiency constipation (qi/blood insufficient to move stool) — same 便秘 differentiation set. | Same set. |
| `pat.脾約` | 脾約證 | 麻子仁丸 | 1 (hypothyroidism) | `pattern.spleen_constriction` | 脾約證 — Shang Han Lun Yang Ming pattern of Stomach heat drying intestinal fluid with spleen restriction, treated by Ma Zi Ren Wan; a distinct classical diagnosis from the general 便秘 set above (worth its own card, not folded into `heat_constipation`). | Named classical pattern, not a synonym of the internal-medicine constipation subtypes despite sharing a formula. |
| `pat.氣陰兩虛` | 氣陰兩虛 | 生脈飲 | 1 (aphthous ulcers) | `pattern.qi_yin_deficiency` | Qi and Yin dual deficiency — one of the most ubiquitous combined patterns across TCM internal medicine/oncology/cardiology (fatigue + dry mouth + weak pulse). | Surprising true gap — only single-factor `qi_deficiency`/`yin_deficiency` exist; likely highest real-world value of this whole batch despite in-dataset usage of 1. |
| `pat.熱毒熾盛` | 熱毒熾盛 | 普濟消毒飲 | 1 (acne) | `pattern.heat_toxin_blazing` | Heat-Toxin excess — standard dermatology/infectious-disease pattern, distinct from the bare `heat`/`fire` generics by the toxin (毒) component implying suppuration/spreading. | Common in dermatology, no toxin-specific card exists. |
| `pat.熱擾胸膈` | 熱擾胸膈 | 梔子豉湯 | 1 (circadian disorder) | `pattern.heat_disturbing_chest_diaphragm` | Zhi-Zi-Chi-Tang pattern — residual Heat lodging in chest/diaphragm after exterior resolution, causing restlessness/insomnia. Named classical Shang Han Lun pattern. | Distinct classical entity, not covered by any existing Heat card. |
| `pat.濕熱浸淫` | 濕熱浸淫證 | 消風散 | 1 (eczema) | `pattern.damp_heat_skin_invasion` | Damp-Heat pouring/infiltrating the skin — dermatology-specific Damp-Heat subtype, parallel to the existing site-specific Damp-Heat family (肝膽濕熱/大腸濕熱/膀胱濕熱/脾胃濕熱/下焦濕熱/三焦濕熱). | Follows the established site-specific Damp-Heat card precedent; skin site is the only one missing. |
| `pat.膽熱犯胃` | 膽熱犯胃證 | 溫膽湯 | 1 (GERD) | `pattern.gallbladder_heat_invading_stomach` | Gallbladder Heat invading the Stomach — standard GERD/bitter-taste pattern, same "Organ Heat → X organ" convention as `liver_fire_scorching_lung`. | Direct structural gap. |

### Proposed execution order (by clinical frequency / value, not just in-dataset count)

1. **Batch A — high in-dataset frequency (7–15× usage)**: `spleen_stomach_yang_deficiency`, `wind_damp_invasion`, `spleen_deficiency_damp_encumbrance`, `phlegm_stasis_binding`, `phlegm_qi_binding` (5 cards)
2. **Batch B — ubiquitous textbook patterns, low in-dataset count but high real-world frequency**: `yin_deficiency_fire_flaring`, `qi_yin_deficiency`, `blood_deficiency_wind_dryness`, `heart_stomach_fire` (4 cards) — these are core enough that Fable/Ting should not let the low `used_by` number deprioritize them.
3. **Batch C — organ-fire/heat structural-gap siblings** (fills out already-half-built families): `liver_fire_invading_stomach`, `lung_heat_excess`, `stomach_cold`, `gallbladder_heat_invading_stomach`, `damp_heat_skin_invasion`, `water_qi_attacking_heart`, `lung_stomach_dryness_heat`, `lung_qi_deficiency_cold`, `heat_toxin_blazing` (9 cards)
4. **Batch D — named classical/system sets**: the 便秘 3-set (`qi_constipation`/`heat_constipation`/`deficiency_constipation`) + `spleen_constriction`, `heat_disturbing_chest_diaphragm`, `wind_cold_invading_collaterals` (6 cards)

**Top-5 by clinical value** (for the report): `yin_deficiency_fire_flaring`, `qi_yin_deficiency`, `spleen_stomach_yang_deficiency`, `phlegm_stasis_binding`, `wind_damp_invasion`.

---

## Section 2 — `MAP_TO_EXISTING` (21 ids)

Each is a near-miss P-3's exact-name-identity bar correctly declined; formula
and clinical picture corroborate the same underlying pattern.

| legacy id | name_zh | formula_zh (used_by) | → target `pattern.*` | why P-3 skipped it | why I now think it maps |
|---|---|---|---|---|---|
| `pat.肝脾不調` | 肝脾不調 | 四逆散 (13) | `pattern.liver_spleen_disharmony` (肝脾不和) | 調≠和, fails string-exact match | Synonymous head character swap for the identical Liver-Spleen Disharmony mechanism; same formula family as the canon card would expect. |
| `pat.肝鬱脾虛` | 肝鬱脾虛證 | 痛瀉要方 (1) | `pattern.liver_spleen_disharmony` | Different name entirely | Textbook mechanism-level synonym of 肝脾不和 (Liver stagnation causing Spleen deficiency); Tong Xie Yao Fang is the classic formula for this exact presentation. |
| `pat.食傷脾胃` | 食傷脾胃 | 保和丸 (4) | `pattern.food_stagnation` (食滯胃脘, alias 食積) | Different name emphasis (injury vs stagnation) | 保和丸 is *the* classic Food Stagnation formula — the formula, not just the name, confirms identity. |
| `pat.心火旺盛` | 心火旺盛 | 導赤散 (2) | `pattern.heart_fire` (心火亢盛) | 旺盛≠亢盛 (both mean "excessive/blazing") | Pure synonym pair, same formula (Dao Chi San) as expected for Heart Fire. |
| `pat.心脈瘀阻` | 心脈瘀阻 | 血府逐瘀湯 (2) | `pattern.heart_blood_stasis` (心血瘀阻) | 脈≠血 in the string | Same mechanism (blood stasis obstructing the heart vessels), same formula class. |
| `pat.脾胃虛弱` (×2 records) | 脾胃虛弱(證) | 參苓白朮散 / 補中益氣湯 (2) | `pattern.spleen_qi_deficiency` (脾氣虛, alias 脾胃氣虛) | 虛弱≠氣虛 in the string | Target card's *existing* alias list already contains 脾胃氣虛 — 虛弱 is one more synonym for the same deficiency. |
| `pat.脾氣虛弱` | 脾氣虛弱證 | 補中益氣湯 (1) | `pattern.spleen_qi_deficiency` | Same reason | Same as above, direct duplicate concept. |
| `pat.濕熱瀰漫三焦` | 濕熱瀰漫三焦 | 黃連解毒湯 (2) | `pattern.san_jiao_damp_heat` (三焦濕熱, V2-D `APPROVE_CANONICAL`) | 瀰漫 is a descriptive modifier, not in the base string | Core concept identical (Damp-Heat filling/pervading the Triple Burner); V2-D already ruled the base pattern canonical. |
| `pat.少陰陰虛火旺` | 少陰陰虛火旺 | 黃連阿膠湯 (1) | `pattern.shao_yin_heat_transformation` (少陰熱化證, V2-D `APPROVE_CANONICAL`) | Extra 陰虛火旺 qualifier not in base string | Huang Lian E Jiao Tang is literally the classical formula that *defines* Shao Yin Heat Transformation — same Shang Han Lun entity by another name. |
| `pat.血瘀閉阻` | 血瘀閉阻 | 少腹逐瘀湯 (1) | `pattern.blood_stasis` (瘀血內阻, alias 血脈瘀阻) | 閉阻≠內阻 | Synonym pair; gynecological subtype of the same base pattern. |
| `pat.瘀血阻絡` | 瘀血阻絡證 | 桃紅四物湯 (1) | `pattern.blood_stasis` | Different modifier (阻絡 = "obstructing the collaterals") | Same base pattern, channel-level presentation. |
| `pat.肝胃氣滯` | 肝胃氣滯證 | 柴胡疏肝散 (1) | `pattern.liver_stomach_disharmony` (肝胃不和) | 氣滯≠不和 | Chai Hu Shu Gan San is the prototypical Liver-Qi-Invading-Stomach formula; textbooks treat 肝胃氣滯 and 肝胃不和 as the same clinical entity. |
| `pat.肝膽火盛` | 肝膽火盛證 | 龍膽瀉肝湯 (1) | `pattern.liver_fire` (肝火上炎, alias 肝經實火) | Gallbladder extension not in base string | Liver and Gallbladder are paired organs; alias list already includes 肝經實火 covering this extension; same formula (Long Dan Xie Gan Tang). |
| `pat.風熱相搏` | 風熱相搏證 | 消風散 (1) | `pattern.wind_heat` (風熱, alias 外感風熱/風熱犯表) | 相搏 descriptive modifier | Core Wind-Heat mechanism in a dermatology (urticaria) presentation. |
| `pat.氣血虛弱` | 氣血虛弱 | 八珍湯合牽正散 (1) | `pattern.qi_blood_deficiency` (氣血兩虛) | 虛弱≠兩虛 | Synonym pair for the identical dual-deficiency concept. |
| `pat.清陽不升` | 清陽不升 | 補中益氣湯 (1) | `pattern.spleen_qi_sinking` (中氣下陷, alias 脾氣下陷) | Different metaphor (clear-yang vs qi-sinking) for the same mechanism | Identical formula (Bu Zhong Yi Qi Tang) confirms same underlying pattern. |
| `pat.腎陰虧虛` | 腎陰虧虛證 | 六味地黃丸 (1) | `pattern.kidney_yin_deficiency` (腎陰虛) | 虧虛≠虛 modifier | Direct duplicate concept, canonical formula match. |
| `pat.腎精虧虛` | 腎精虧虛證 | 耳聾左慈丸 (1) | `pattern.kidney_essence_deficiency` (腎精不足) | 虧虛≠不足 | Direct duplicate concept. |
| `pat.痰濕中阻` | 痰濕中阻證 | 半夏白朮天麻湯 (1) | `pattern.phlegm_damp` (痰濕內蘊, alias 痰濕阻滯/濕痰內盛) | 中阻≠內蘊 | Ban Xia Bai Zhu Tian Ma Tang is *the* textbook formula for this exact vertigo/dizziness presentation of Phlegm-Damp in the middle burner. |
| `pat.肝血瘀滯` | 肝血瘀滯 | 溫經湯 (7) | `pattern.qi_stagnation_blood_stasis` (氣滯血瘀) | Liver-specific lead character vs the generic qi-lead name | Gynecological Liver-Blood-Stasis presentations are the standard clinical expression of 氣滯血瘀 in this domain; high usage (7×) reinforces confidence over a coincidental match. |
| `pat.肝腎不足` | 肝腎不足 | 左歸丸 (7) | `pattern.liver_kidney_yin_deficiency` (肝腎陰虛) | 不足 (general insufficiency) vs 陰虛 (yin-specific) | Zuo Gui Wan is a Kidney/Liver Yin-nourishing formula; in the ortho/eye conditions here 肝腎不足 is used as the loose-term equivalent of 肝腎陰虛. |

---

## Section 3 — `GRAPH_ONLY` (7 ids)

Combination or transformation states per V2-D's own criteria (`太陽陽明合病`,
`血分熱動風` etc. were all ruled `GRAPH_ONLY`/`PROGRESSION_ONLY` rather than
given flat cards) — not standalone diagnosable patterns with their own
tongue/pulse/symptom set independent of their component patterns.

| legacy id | name_zh | formula_zh (used_by) | rationale |
|---|---|---|---|
| `pat.燥氣傷肺` | 燥氣傷肺 | 清燥救肺湯 (5) | `BROADER_NARROWER` parent of the two already-canonical subtypes `warm_dryness_attacking_lung`(溫燥犯肺)/`cool_dryness_attacking_lung`(涼燥犯肺) — same treatment V2-D gave analogous generic-vs-subtype San-Jiao pairs. |
| `pat.下焦血瘀` | 下焦血瘀 | 抵當湯 (1) | V2-D §C already ruled `下焦血瘀 — Lower Jiao Blood Stasis → LOCATION_ONLY`; reusing that ruling verbatim, not re-litigating. |
| `pat.太陽病輕` | 太陽病輕證 | 桂枝麻黃各半湯 (1) | Mild combined/residual Six-Channel exterior state (Gui Zhi Ma Huang Ge Ban Tang syndrome) — same class as V2-D's `太陽陽明合病 → GRAPH_ONLY`; a combination-intensity state, not a distinct diagnosis. |
| `pat.肝鬱化火` | 肝鬱化火證 | 龍膽瀉肝湯 (1) | Transformation state bridging the already-canonical `liver_qi_stagnation`(肝氣鬱結) → `liver_fire`(肝火上炎); same class as V2-D's `血分熱動風 → PROGRESSION_ONLY`. **Flagging as borderline** — clinically this is taught with its own symptom/treatment-principle set (疏肝瀉火) more often than most V2-D progression examples; worth a second look from Ting rather than an automatic GRAPH_ONLY close. |
| `pat.肝鬱血虛` | 肝鬱血虛 | 桃紅四物湯 (1) | Combination of two already-canonical single patterns (`liver_qi_stagnation` + `liver_blood_deficiency`) in a gynecological presentation — no independent diagnostic entity beyond the sum of its parts. |
| `pat.風火上擾` | 風火上擾證 | 龍膽瀉肝湯 (1) | Combination of `liver_wind`(肝風內動) + `liver_fire`(肝火上炎) manifesting in the head/face (trigeminal neuralgia) — graph relation between two existing cards. |
| `pat.溼熱鬱滯經絡` | 溼熱鬱滯經絡證 | 五苓散 (1) | Uncertain/`HOLD`-leaning: plausible combination of `damp_heat`(濕熱) + `channel_qi_blood_obstruction`(經絡氣血痹阻, V2-D `APPROVE_CANONICAL`), but the paired formula (五苓散, a water-metabolism formula) doesn't clinically fit a damp-**heat** presentation — likely a canon data-quality issue upstream, not a naming issue. Flagging uncertain rather than creating a card on a shaky base. |

---

## Section 4 — `RETIRE_AS_IMPORT_ARTIFACT` (3 ids)

Stays frozen in the `pat.*` legacy namespace per constitution Rule 2 (不硬刪記錄) — never promoted, never deleted.

| legacy id | name_zh | reason |
|---|---|---|
| `pat.1` | "1" | Numeric placeholder, not a Chinese clinical term — CloudTCM import junk. |
| `pat.氣血不和` | 氣血不和證 | CloudTCM catch-all bucket (74 condition_ids attached indiscriminately) — Ting-delegated decision 2026-08-06, reused verbatim: "not a discriminating clinical pattern, never register." |
| `pat.臟腑虛弱` | 臟腑虛弱證 | Same catch-all bucket, same 2026-08-06 decision. |

No new judgment made here — reusing the standing decision already recorded in
`data/config/pattern_alias_map.json`'s `excluded_formula_patterns` reasons and
`docs/PATTERN_CARD_TEMPLATE.md` §2.

---

## Section 5 — The 30 already-ruled `方證` ids (confirmation only, no re-litigation)

Per task instruction: these await the **formula layer**, not the pattern
layer (D10 rule 5 — `方證`/`類方證` is a different diagnostic entity keyed to
a specific formula's classical indication, not a differentiable clinical
pattern). Table confirms membership and payload only.

| legacy id | name_zh | formula_zh | condition_ids |
|---|---|---|---:|
| `pat.當歸四逆湯` | 當歸四逆湯證 | 當歸四逆加吳茱萸生薑湯 | 11 |
| `pat.麻黃附子細辛湯` | 麻黃附子細辛湯證 | 麻黃附子細辛湯 | 7 |
| `pat.小柴胡湯` | 小柴胡湯證 | 小柴胡湯 | 7 |
| `pat.[通脈]四逆湯` | [通脈]四逆湯證 | 四逆湯 | 6 |
| `pat.真武湯` | 真武湯證 | 真武湯 | 6 |
| `pat.黃耆桂枝五物湯` | 黃耆桂枝五物湯證 | 黃耆桂枝五物湯 | 5 |
| `pat.葛根湯` | 葛根湯證 | 葛根湯 | 5 |
| `pat.柴胡桂枝湯` | 柴胡桂枝湯證 | 柴胡桂枝湯 | 5 |
| `pat.半夏瀉心湯` | 半夏瀉心湯證 | 半夏瀉心湯 | 5 |
| `pat.桂枝湯` | 桂枝湯證 | 桂枝湯 | 4 |
| `pat.吳茱萸湯` | 吳茱萸湯證 | 吳茱萸湯 | 4 |
| `pat.小青龍湯` | 小青龍湯證 | 小青龍湯 | 4 |
| `pat.五苓散` | 五苓散證 | 五苓散 | 4 |
| `pat.小建中湯類方` | 小建中湯類方證 | 當歸建中湯 | 3 |
| `pat.桂枝加葛根湯` | 桂枝加葛根湯證 | 桂枝加葛根湯 | 2 |
| `pat.大青龍湯` | 大青龍湯證 | 大青龍湯 | 2 |
| `pat.桂枝湯類方` | 桂枝湯類方證 | 桂枝加葛根湯 | 2 |
| `pat.麻黃湯類方` | 麻黃湯類方證 | 麻黃附子細辛湯 | 2 |
| `pat.柴胡湯類方` | 柴胡湯類方證 | 小柴胡湯 | 2 |
| `pat.雜病類方証` | 雜病類方証 | 吳茱萸湯 | 2 |
| `pat.四逆散` | 四逆散證 | 四逆散 | 2 |
| `pat.柴胡桂枝乾薑湯` | 柴胡桂枝乾薑湯證 | 柴胡桂枝乾薑湯 | 2 |
| `pat.麻黃湯` | 麻黃湯證 | 麻黃湯 | 2 |
| `pat.麻杏石甘湯` | 麻杏石甘湯證 | 麻杏石甘湯 | 2 |
| `pat.承氣湯` | 承氣湯證 | 大承氣湯 | 2 |
| `pat.炙甘草湯` | 炙甘草湯證 | 炙甘草湯 | 2 |
| `pat.理中湯` | 理中湯證 | 理中湯 | 1 |
| `pat.苓桂朮甘湯` | 苓桂朮甘湯證 | 苓桂朮甘湯 | 1 |
| `pat.越婢加朮湯` | 越婢加朮湯證 | 越婢加朮湯 | 1 |
| `pat.白虎湯` | 白虎湯證 | 白虎加人參湯 | 1 |

---

## Ambiguous / needs Ting's second look

1. **`pat.肝鬱化火`** (Section 3, GRAPH_ONLY) — closed as a transformation
   state per V2-D precedent, but it's taught with its own symptom/treatment-
   principle set more consistently than most V2-D progression examples.
2. **`pat.溼熱鬱滯經絡`** (Section 3, GRAPH_ONLY) — the paired formula (五苓散)
   doesn't clinically match a damp-**heat** label; may be an upstream canon
   data-quality issue rather than a genuine pattern, flagged not decided.
3. **Two consolidations** folded into single `CREATE_CANONICAL` cards
   (`脾胃陽虛`+`脾胃虛寒` → `spleen_stomach_yang_deficiency`; `脾虛濕困`+`脾虛濕阻`
   → `spleen_deficiency_damp_encumbrance`) — Ting should confirm the merge
   rather than two near-duplicate cards being built.
4. **`pat.外感風濕`** (CREATE_CANONICAL) — the closest existing card
   (`wind_cold_damp_bi`, id 89) differs only by the absence of the cold
   component; if Ting judges 風寒濕痺 minus 寒 is not clinically distinct
   enough to warrant its own card, this could instead become
   `MAP_TO_EXISTING` with a strong caveat noted on the card.

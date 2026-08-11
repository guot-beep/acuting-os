# AcuTing OS — TCM Pattern Expansion Research Pack v0.5
## Batch 05 — Alias / Duplicate / Canonical-Candidate Master Map
### Antigravity implementation handoff

**Date:** 2026-08-08  
**Research/extraction layer:** ChatGPT  
**Repository/canonicalization layer:** Antigravity  
**Status:** REVIEW MAP ONLY — do not bulk-create IDs

---

# 0. Why this file exists

Batches 02–04 extracted many source-backed Pattern phrases. This file **inverts** those notes into a canonicalization map so Antigravity can work efficiently against the live repository.

The central question is no longer:

> “What did the source call this?”

It is:

> “What should AcuTing OS do with this source phrase?”

Every row therefore aims to classify a source concept into one of these actions:

- `KEEP_EXISTING`
- `ENRICH_EXISTING`
- `ADD_ALIAS`
- `NEW_CANONICAL_CANDIDATE`
- `SUBTYPE_REVIEW`
- `BROADER_NARROWER_REVIEW`
- `PROGRESSION_RELATION`
- `GRAPH_COMPOSITION`
- `TDIS_CONTEXT_ONLY`
- `TERMINOLOGY_REVIEW`
- `DO_NOT_PROMOTE_YET`

No row is permission to create an ID without checking the current repository.

---

# 1. Locked / high-confidence V1 identity decisions

These decisions come from the current Pattern V1 audit and canonical review.

| Source / legacy phrase | Normalized concept | Known canonical target | Action | Confidence | Notes |
|---|---|---|---|---|---|
| 心腎不交 / Heart and Kidney Disharmony / Heart-Kidney Not Communicating | Heart-Kidney Not Communicating | `pattern.heart_kidney_not_communicating` | `KEEP_EXISTING` + migrate unique evidence from duplicate import | very high | `pattern.insomnia_heart_kidney_disharmony` is a duplicate authoring artifact, not a second clinical Pattern |
| 肝火上炎 / Liver Fire / Liver Fire Blazing / Liver Fire Flaring Upward | Liver Fire Blazing | `pattern.liver_fire` | `KEEP_EXISTING` + alias/evidence merge | very high | `pattern.liver_fire_flaring` is duplicate/context-specific authoring |
| 肝風內動 / Internal Liver Wind / Liver Wind Stirring Internally | Internal Liver Wind | `pattern.liver_wind` | `KEEP_EXISTING` + migrate unique severe/stroke-context evidence | high | etiologic Liver-Wind subtypes may later be separate, but generic `liver_wind_stirring` is not a distinct identity |
| 胃熱 / Stomach Heat | Stomach Heat | existing V1 `pattern.stomach_heat` | `KEEP_EXISTING` | high | retain separately from Stomach Fire |
| 胃火 / 胃火熾盛 / Stomach Fire | Stomach Fire | `pattern.stomach_fire` | `ENRICH_EXISTING` / build missing card | high | locked distinction: some sources treat synonymously, others use 火為熱之極; preserve both source traditions |
| 風寒 / Wind-Cold | Wind-Cold exterior Pattern | `pattern.wind_cold` | `ENRICH_EXISTING` / build missing card | high | broader than Lung-specific Wind-Cold Attacking Lung |
| 風熱 / Wind-Heat | Wind-Heat exterior Pattern | `pattern.wind_heat` | `ENRICH_EXISTING` / build missing card | high | broader than Lung-specific Wind-Heat Attacking Lung |

---

# 2. Master map — Zang-Fu core and combined Patterns

| Normalized Chinese | Preferred English | Candidate action | Existing-match hypothesis | Formula/source anchors | Key canonicalization note |
|---|---|---|---|---|---|
| 心氣虛 | Heart Qi Deficiency | `ENRICH_EXISTING` | likely current V1 | Zhi Gan Cao Tang; Sheng Mai San | reusable core Pattern |
| 心陽虛 | Heart Yang Deficiency | `NEW_CANONICAL_CANDIDATE` if absent | Heart Qi Deficiency is parent/progression | Zhi Gan Cao Tang; Ling Gui Zhu Gan Tang contexts | preserve Cold/Yang signs; do not merge into Heart Qi Deficiency |
| 心血虛 | Heart Blood Deficiency | `ENRICH_EXISTING` | likely current V1 | Suan Zao Ren Tang; Gui Pi Tang | reusable core Pattern |
| 心陰虛 | Heart Yin Deficiency | `ENRICH_EXISTING` | likely current V1 | Tian Wang Bu Xin Dan; Huang Lian E Jiao Tang | distinguish Blood deficiency and Heart Fire |
| 心火亢盛 / 心火上炎 | Heart Fire Blazing | `ENRICH_EXISTING` | likely current V1 | Dao Chi San; Liang Ge San | terminology aliases should converge on one canonical node |
| 痰火擾心 | Phlegm-Fire Disturbing Heart | `NEW_CANONICAL_CANDIDATE` if absent | may overlap Phlegm-Heat disturbing Shen | Wen Dan Tang; Ci Zhu Wan | strong distinct mixed mechanism |
| 痰蒙心竅 / 痰阻心竅 | Phlegm Misting/Obstructing Heart Orifices | `NEW_CANONICAL_CANDIDATE` | none assumed | opening-orifice / Ling Jiao Gou Teng source contexts | separate hot subtype from non-hot Phlegm obstruction if supported |
| 痰熱蒙閉心竅 | Phlegm-Heat Obstructing Heart Orifices | `SUBTYPE_REVIEW` | subtype of Phlegm Misting Heart | opening-orifice / Heat-Wind contexts | acute severity should not alone define identity |
| 小腸實熱 / 小腸熱盛 | Small Intestine Excess Heat | `NEW_CANONICAL_CANDIDATE` if absent | Heart Fire relation | Dao Chi San; Ba Zheng San | graph: Heart Fire may transfer to Small Intestine |
| 小腸虛寒 | Small Intestine Deficiency Cold | `SUBTYPE_REVIEW` | may overlap Spleen Yang / Middle-Jiao deficiency Cold | Li Zhong Wan | add only if Fu-organ specificity is useful |
| 肺氣虛 | Lung Qi Deficiency | `ENRICH_EXISTING` | likely current V1 | Yu Ping Feng San; Sheng Mai San | reusable core |
| 肺陰虛 | Lung Yin Deficiency | `ENRICH_EXISTING` | likely current V1 | Mai Men Dong Tang; Sheng Mai San | distinguish Lung Dryness |
| 肺燥 | Lung Dryness | `NEW_CANONICAL_CANDIDATE` / `BROADER_NARROWER_REVIEW` | may be umbrella | Sang Xing Tang; Xing Su San | likely umbrella with Warm-Dryness / Cool-Dryness subtypes |
| 風寒犯肺 | Wind-Cold Attacking Lung | `NEW_CANONICAL_CANDIDATE` if absent | narrower than `pattern.wind_cold` | Ma Huang Tang; Xiao Qing Long Tang | do not alias to generic Wind-Cold |
| 風熱犯肺 | Wind-Heat Attacking Lung | `NEW_CANONICAL_CANDIDATE` if absent | narrower than `pattern.wind_heat` | Yin Qiao San; Sang Ju Yin | do not alias to generic Wind-Heat |
| 痰濕阻肺 | Phlegm-Damp Obstructing Lung | `ENRICH_EXISTING` or `NEW_CANONICAL_CANDIDATE` | likely present in some form | Er Chen Tang; Su Zi Jiang Qi Tang | normalize aliases: Damp-Phlegm in Lung / Phlegm-Damp |
| 痰熱壅肺 | Phlegm-Heat Obstructing Lung | `NEW_CANONICAL_CANDIDATE` | distinct from Lung Heat | Ding Chuan Tang; Qing Qi Hua Tan contexts | strong respiratory Pattern |
| 寒痰阻肺 | Cold-Phlegm Obstructing Lung | `NEW_CANONICAL_CANDIDATE` | subtype of Phlegm in Lung | San Zi Yang Qin Tang | preserve Cold signs |
| 痰飲停肺 / 水飲犯肺 | Thin Mucus / Fluid Retention Obstructing Lung | `TERMINOLOGY_REVIEW` + `NEW_CANONICAL_CANDIDATE` | related to 痰飲 | Xiao Qing Long Tang; Ling Gui Zhu Gan Tang | normalize Tan-Yin vs ordinary Phlegm-Damp |
| 大腸實熱 | Large Intestine Excess Heat | `NEW_CANONICAL_CANDIDATE` | may overlap Yang Ming Fu | Da Cheng Qi Tang | distinguish organ Pattern from Six-Stage Yang Ming Fu |
| 大腸津虧 / 腸燥津虧 | Large Intestine Fluid Deficiency / Dryness | `NEW_CANONICAL_CANDIDATE` | none assumed | Ma Zi Ren Wan; Run Chang Wan | separate from full Excess Heat constipation |
| 大腸濕熱 | Large Intestine Damp-Heat | `NEW_CANONICAL_CANDIDATE` | none assumed | Shao Yao Tang; Ge Gen Qin Lian Tang | strong bowel Pattern |
| 大腸寒 | Large Intestine Cold | `SUBTYPE_REVIEW` | deficiency vs excess Cold must be separated | Fu Zi Li Zhong Wan | do not flatten two mechanisms |
| 脾氣虛 | Spleen Qi Deficiency | `ENRICH_EXISTING` | likely current V1 | Si Jun Zi Tang; Shen Ling Bai Zhu San | core |
| 脾陽虛 | Spleen Yang Deficiency | `ENRICH_EXISTING` | likely current V1 | Li Zhong Wan; Shi Pi Yin | core |
| 脾氣下陷 / 中氣下陷 | Spleen Qi Sinking | `ENRICH_EXISTING` or `ADD_ALIAS` | likely current V1 under Qi sinking | Bu Zhong Yi Qi Tang | normalize 中氣下陷 alias |
| 脾不統血 | Spleen Not Controlling Blood | `ENRICH_EXISTING` | likely current V1 | Gui Pi Tang; Huang Tu Tang | reusable bleeding Pattern |
| 寒濕困脾 | Cold-Damp Encumbering Spleen | `ENRICH_EXISTING` | known current library record | Ping Wei San; Huo Xiang Zheng Qi San | already registered during V1 identity cleanup |
| 脾胃濕熱 / 濕熱困脾 | Spleen-Stomach Damp-Heat | `NEW_CANONICAL_CANDIDATE` or `BROADER_NARROWER_REVIEW` | may overlap general Damp-Heat | San Ren Tang; Gan Lu Xiao Du Dan | clarify organ-specific vs pathogenic-factor node |
| 胃氣虛 | Stomach Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | none assumed | Liu Jun Zi Tang; Ju Pi Zhu Ru Tang | useful Fu-organ functional Pattern |
| 胃寒 | Stomach Cold | `NEW_CANONICAL_CANDIDATE` | none assumed | Li Zhong Wan; Liang Fu Wan | distinguish excess vs deficiency Cold if needed |
| 胃火熾盛 | Stomach Fire | `ENRICH_EXISTING` | `pattern.stomach_fire` | Qing Wei San; Yu Nu Jian | build true missing canonical card |
| 胃陰虛 / 胃津不足 | Stomach Yin / Fluid Deficiency | `TERMINOLOGY_REVIEW` | may be one node + alias or broader/narrower | Zhu Ye Shi Gao Tang; Mai Men Dong Tang | some sources distinguish Yin deficiency from fluid injury |
| 胃氣上逆 | Rebellious Stomach Qi | `NEW_CANONICAL_CANDIDATE` | none assumed | Ju Pi Zhu Ru Tang; Xuan Fu Dai Zhe Tang | functional-direction node, graph-friendly |
| 食積胃脘 / 食滯胃腸 | Food Accumulation | `NEW_CANONICAL_CANDIDATE` | may be general Food Stagnation | Bao He Wan | location-specific naming review |
| 胃絡瘀血 / 胃腑血瘀 | Blood Stasis in Stomach | `NEW_CANONICAL_CANDIDATE` | none assumed | Sacred Lotus; blood-moving context | location-specific Blood Stasis candidate |
| 肝氣鬱結 | Liver Qi Stagnation | `ENRICH_EXISTING` | likely current V1 | Xiao Yao San; Chai Hu Shu Gan San | core |
| 肝氣犯胃 | Liver Qi Invading Stomach | `NEW_CANONICAL_CANDIDATE` | none assumed | Chai Hu Shu Gan San; Zuo Jin Wan | high clinical/board value |
| 肝脾不和 / 肝氣犯脾 | Liver-Spleen Disharmony | `NEW_CANONICAL_CANDIDATE` or `ADD_ALIAS` | may already exist under liver attacking Spleen | Tong Xie Yao Fang; Si Ni San | normalize several common English names |
| 肝血虛 | Liver Blood Deficiency | `ENRICH_EXISTING` | likely current V1 | Si Wu Tang | core |
| 肝陰虛 | Liver Yin Deficiency | `ENRICH_EXISTING` | likely current V1 | Yi Guan Jian | core |
| 肝陽上亢 | Liver Yang Rising | `ENRICH_EXISTING` | likely current V1 | Tian Ma Gou Teng Yin contexts | preserve root-deficiency relation |
| 肝火上炎 | Liver Fire Blazing | `KEEP_EXISTING` | `pattern.liver_fire` | Long Dan Xie Gan Tang | merge duplicate import evidence only |
| 肝風內動 | Internal Liver Wind | `KEEP_EXISTING` | `pattern.liver_wind` | Zhen Gan Xi Feng Tang; Tian Ma Gou Teng Yin | umbrella mechanism; future etiologic subtypes |
| 肝膽濕熱 | Liver-Gallbladder Damp-Heat | `ENRICH_EXISTING` or `NEW_CANONICAL_CANDIDATE` | likely current V1 | Long Dan Xie Gan Tang; Hao Qin Qing Dan Tang | strong combined Pattern |
| 膽氣虛 | Gallbladder Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | none assumed | Ding Zhi Wan | distinguish Heart-Gallbladder Qi deficiency |
| 膽腑濕熱 | Gallbladder Damp-Heat | `SUBTYPE_REVIEW` | narrower than Liver-GB Damp-Heat | Hao Qin Qing Dan Tang | only promote if organ-specific distinction is useful |
| 腎氣虛 | Kidney Qi Deficiency | `NEW_CANONICAL_CANDIDATE` or `ENRICH_EXISTING` | likely some Kidney deficiency node exists | securing/grasping formulas | useful umbrella only if repo supports it |
| 腎氣不固 | Kidney Qi Not Firm | `NEW_CANONICAL_CANDIDATE` | none assumed | Jin Suo Gu Jing Wan; Shou Tai Wan contexts | strong reusable securing Pattern |
| 腎陽虛 | Kidney Yang Deficiency | `ENRICH_EXISTING` | likely current V1 | Jin Gui Shen Qi Wan; You Gui Wan | core |
| 腎陰虛 | Kidney Yin Deficiency | `ENRICH_EXISTING` | likely current V1 | Liu Wei Di Huang Wan | core |
| 腎陰虛火旺 | Kidney Yin Deficiency with Fire Flaring | `SUBTYPE_REVIEW` | child of Kidney Yin deficiency | Zhi Bai Di Huang Wan | likely clinically useful subtype |
| 腎精不足 | Kidney Jing Deficiency | `NEW_CANONICAL_CANDIDATE` | none assumed | You Gui/Zuo Gui/Jing tonics | do not alias to Kidney Yin deficiency |
| 腎不納氣 | Kidney Failing to Grasp Qi | `NEW_CANONICAL_CANDIDATE` | none assumed | Su Zi Jiang Qi Tang contexts | strong chronic Lung-Kidney Pattern |
| 腎陽虛水泛 | Kidney Yang Deficiency with Water Flooding | `NEW_CANONICAL_CANDIDATE` | none assumed | Zhen Wu Tang | strong classical compound |
| 膀胱濕熱 | Bladder Damp-Heat | `ENRICH_EXISTING` or `NEW_CANONICAL_CANDIDATE` | likely represented in Lin work | Ba Zheng San | distinguish from Lin disease subtypes |
| 膀胱虛寒 | Bladder Deficiency Cold | `SUBTYPE_REVIEW` | overlaps Kidney Qi Not Firm/Yang deficiency | securing/warming formulas | Fu-organ specificity review |
| 熱入心包 | Heat Entering Pericardium | `NEW_CANONICAL_CANDIDATE` under Wen-Bing | not generic Zang-Fu | warm-disease formula corpus | classify by Wen-Bing system |
| 三焦濕熱 | San Jiao Damp-Heat | `SYSTEM_CROSSWALK_REVIEW` | may be location/stage axis | San Ren Tang; Long Dan Xie Gan Tang | avoid treating San Jiao exactly like ordinary Zang-Fu |

---

# 3. Master map — combined Zang-Fu relationships

| Chinese | English | Candidate action | Graph alternative | Formula anchors | Note |
|---|---|---|---|---|---|
| 肺脾氣虛 | Lung-Spleen Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | Lung Qi Deficiency + Spleen Qi Deficiency | Shen Ling Bai Zhu San | strong combined-organ candidate |
| 心肺氣虛 | Heart-Lung Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | Heart Qi + Lung Qi deficiency | Sheng Mai San | strong combined candidate |
| 肺腎氣虛 | Lung-Kidney Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | Lung Qi Deficiency + Kidney Qi Deficiency | Sheng Mai San | distinguish Kidney failing to grasp Qi |
| 心脾氣血兩虛 / 心脾兩虛 | Heart-Spleen Deficiency | `ADD_ALIAS` / `BROADER_NARROWER_REVIEW` | Heart Blood/Qi + Spleen Qi | Gui Pi Tang | likely conventional combined Pattern; normalize wording |
| 心肝血虛 | Heart-Liver Blood Deficiency | `SUBTYPE_REVIEW` | Heart Blood + Liver Blood deficiency | blood-tonifying formulas | may be redundant as compound graph |
| 心膽氣虛 | Heart-Gallbladder Qi Deficiency | `NEW_CANONICAL_CANDIDATE` | Heart Qi + GB Qi deficiency | Ding Zhi Wan | strong Shen-specific candidate |
| 肝腎陰虛 | Liver-Kidney Yin Deficiency | `NEW_CANONICAL_CANDIDATE` or existing match | Liver Yin + Kidney Yin deficiency | Liu Wei/Zuo Gui/Yi Guan contexts | common combined deficiency |
| 肝腎陰虛兼肝陽上亢 | Liver-Kidney Yin Deficiency with Liver Yang Rising | `GRAPH_COMPOSITION` | base deficiency → Yang rising | Qi Ju Di Huang / Tian Ma Gou Teng contexts | avoid long flat ID unless repo deliberately supports it |
| 肝腎陰虛火旺 | Liver-Kidney Yin Deficiency with Fire Flaring | `GRAPH_COMPOSITION` / `SUBTYPE_REVIEW` | Yin deficiency → deficiency Fire | Zhi Bai Di Huang Wan; Da Bu Yin Wan | preserve source wording |
| 脾腎陽虛 | Spleen-Kidney Yang Deficiency | `NEW_CANONICAL_CANDIDATE` if absent | Spleen Yang + Kidney Yang deficiency | warming formulas | common combined root Pattern |
| 脾腎陽虛水泛 | Spleen-Kidney Yang Deficiency with Water Flooding | `NEW_CANONICAL_CANDIDATE` or `GRAPH_COMPOSITION` | dual Yang deficiency → water retention | Zhen Wu Tang; Shi Pi Yin | strong fluid-pathology combined Pattern |
| 腎陽虛水泛於肺 | Kidney Yang Deficiency with Water Flooding Lung | `SUBTYPE_REVIEW` | Kidney Yang deficiency → Water → Lung | Zhen Wu Tang | likely location branch, not new core node |
| 心陽不振水氣凌心 | Heart Yang Deficiency with Water Qi Insulting Heart | `NEW_CANONICAL_CANDIDATE` or `GRAPH_COMPOSITION` | Water retention affects Heart | Zhen Wu Tang; Ling Gui Zhu Gan Tang | clinically meaningful branch pattern |
| 肝火犯肺 / 肝火灼肺 | Liver Fire Scorching Lung | `NEW_CANONICAL_CANDIDATE` | Liver Fire → affects Lung | Xie Bai San contexts | cross-organ excess Pattern |
| 心腎陰虛 | Heart-Kidney Yin Deficiency | `NEW_CANONICAL_CANDIDATE` if absent | Heart Yin + Kidney Yin deficiency | Huang Lian E Jiao Tang contexts | **not** alias of 心腎不交 |
| 心腎不交 | Heart-Kidney Not Communicating | `KEEP_EXISTING` | Kidney Yin/water ↔ Heart Fire disharmony | Huang Lian E Jiao Tang; Jiao Tai Wan | canonical identity locked |

---

# 4. Master map — Qi, Blood, Phlegm, Damp, Heat, Cold, Fluids

| Chinese | English | Candidate action | Likely relation | Formula anchors | Note |
|---|---|---|---|---|---|
| 氣虛血瘀阻絡 | Qi Deficiency with Blood Stasis Obstructing Channels | `NEW_CANONICAL_CANDIDATE` / `GRAPH_COMPOSITION` | Qi deficiency → poor movement → stasis | Bu Yang Huan Wu Tang | strong post-stroke/sequelae pattern but context should not define identity |
| 氣滯痰阻 | Qi Stagnation with Phlegm Retention | `NEW_CANONICAL_CANDIDATE` | Qi + Phlegm | Ban Xia Hou Po Tang | useful mechanism node |
| 肝氣鬱結痰氣互結 | Liver Qi Stagnation with Phlegm-Qi Binding | `SUBTYPE_REVIEW` | Liver Qi stagnation + Qi-Phlegm binding | Ban Xia Hou Po Tang | likely compound relation |
| 痰火擾心 | Phlegm-Fire Disturbing Heart | `NEW_CANONICAL_CANDIDATE` | Phlegm + Fire + Heart/Shen | Wen Dan Tang | high priority |
| 痰濁阻絡 | Turbid Phlegm Obstructing Collaterals | `NEW_CANONICAL_CANDIDATE` | Phlegm → channels | Su He Xiang/opening-orifice contexts | neurologic/channel graph value |
| 風痰 | Wind-Phlegm | `BROADER_NARROWER_REVIEW` | Wind + Phlegm umbrella | Ban Xia Bai Zhu Tian Ma Tang | may have head/face/channel subtypes |
| 風痰阻絡 | Wind-Phlegm Obstructing Channels | `SUBTYPE_REVIEW` | child of Wind-Phlegm | Qian Zheng San | location-specific subtype |
| 濕痰 | Damp-Phlegm | `NEW_CANONICAL_CANDIDATE` or alias of generic Phlegm-Damp | Dampness → Phlegm | Er Chen Tang | normalize 痰濕 vs 濕痰 |
| 燥痰 / 燥痰阻肺 | Dry-Phlegm / Phlegm-Dryness | `TERMINOLOGY_REVIEW` | Dryness + Phlegm | Bei Mu Gua Lou San | source terminology varies |
| 脾氣虛生痰濕 | Spleen Qi Deficiency Generating Phlegm-Damp | `PROGRESSION_RELATION` | Spleen Qi deficiency → Damp → Phlegm | Shen Ling Bai Zhu San; Liu Jun Zi Tang | avoid giant canonical |
| 食積生痰 | Food Stagnation Generating Phlegm | `PROGRESSION_RELATION` / `TDIS_CONTEXT_ONLY` | food retention → Phlegm | San Zi Yang Qin Tang | modifier rather than core |
| 血虛血瘀 | Blood Deficiency with Blood Stasis | `GRAPH_COMPOSITION` | deficiency + stasis | gyne/postpartum corpus | may be useful only in context |
| 血虛寒凝 | Blood Deficiency with Cold Stagnation | `NEW_CANONICAL_CANDIDATE` | Blood deficiency + Cold | Dang Gui Si Ni Tang | strong classical mixed Pattern |
| 熱瘀互結 | Heat with Blood Stasis | `NEW_CANONICAL_CANDIDATE` / location subtype | Heat + stasis | Da Huang Mu Dan Tang | often organ/location-specific |
| 血熱妄行 | Blood Heat with Reckless Bleeding | `SUBTYPE_REVIEW` | Blood Heat → bleeding | Shi Hui San; Xi Jiao Di Huang Tang | distinguish generic Blood Heat |
| 陰虛火旺 | Yin Deficiency with Fire Flaring | `NEW_CANONICAL_CANDIDATE` or category+subtypes | deficiency Heat | Huang Lian E Jiao Tang; Gu Jing Wan | ontology-level decision needed |
| 真寒假熱 | True Cold with False Heat | `NEW_CANONICAL_CANDIDATE` | Eight Principles | You Gui Yin source wording | high board/theory value |
| 寒熱錯雜 | Mixed Cold and Heat | `NEW_CANONICAL_CANDIDATE` / `BROADER_NARROWER_REVIEW` | Eight Principles umbrella | Ban Xia Xie Xin Tang; Wu Mei Wan | may need location/system-specific children |
| 水濕停聚 / 水泛 | Water Retention / Water Flooding | `BROADER_NARROWER_REVIEW` | fluid-pathology umbrella | Wu Ling San; Zhen Wu Tang | distinguish root organ patterns |
| 下焦水停 | Lower Jiao Water Retention | `SUBTYPE_REVIEW` | location child | Wu Ling San | location modifier |
| 風水 / 風濕水腫 | Wind-Water / Wind-Damp Edema | `TERMINOLOGY_REVIEW` | pathogenic-factor + fluid | Fang Ji Huang Qi Tang | authoritative normalization needed |
| 痰飲 | Tan Yin / Congested Thin Fluids | `NEW_CANONICAL_CANDIDATE` | fluid-pathology family | Xiao Qing Long Tang; Ling Gui Zhu Gan Tang | boundary between TCM disease and Pattern must be checked |
| 津傷 / 津液不足 | Fluid Deficiency / Jin-Ye Injury | `NEW_CANONICAL_CANDIDATE` | fluid deficiency | Bai Hu Tang; Zhu Ye Shi Gao Tang; Sheng Mai San | distinguish Yin deficiency |
| 津液停滯 / 津液瘀滯 | Jin-Ye Stasis | `DO_NOT_PROMOTE_YET` | fluid stagnation wording | Jin Gui Shen Qi Wan; Zhen Wu Tang | source wording may be nonstandard |
| 肺熱傷津 | Lung Heat Consuming Fluids | `PROGRESSION_RELATION` | Lung Heat → fluid damage | Heat-clearing Lung formulas | graph edge usually preferable |
| 胃火傷陰 / 胃火傷津 | Stomach Fire Damaging Yin/Fluids | `PROGRESSION_RELATION` | Stomach Fire → Stomach Yin/fluid deficiency | Yu Nu Jian | preserve progression |

---

# 5. Master map — Exterior / pathogenic factors / Bi / channel

| Chinese | English | Candidate action | Existing-match hypothesis | Formula anchors | Note |
|---|---|---|---|---|---|
| 外風 | External Wind | `CATEGORY_OR_UMBRELLA_REVIEW` | current `pattern.wind_external` category exists | Chuan Xiong Cha Tiao San | do not automatically make clinical card if registry uses it as taxonomy only |
| 風寒 | Wind-Cold | `ENRICH_EXISTING` | `pattern.wind_cold` | Ma Huang Tang family | true missing canonical card in V1 |
| 風熱 | Wind-Heat | `ENRICH_EXISTING` | `pattern.wind_heat` | Yin Qiao San family | true missing canonical card in V1 |
| 風寒兼氣滯 | Wind-Cold with Qi Stagnation | `GRAPH_COMPOSITION` / `SUBTYPE_REVIEW` | Wind-Cold + Qi stagnation | Xiang Su San | likely modifier |
| 外寒裏熱 | Exterior Cold with Interior Heat | `NEW_CANONICAL_CANDIDATE` | Eight Principles | Da Qing Long Tang | classic mixed exterior-interior |
| 風寒化熱 | Wind-Cold Transforming into Heat | `PROGRESSION_RELATION` | Wind-Cold → Heat | Chai Ge Jie Ji Tang | transformation, not stable node |
| 溫燥犯肺 | Warm-Dryness Attacking Lung | `NEW_CANONICAL_CANDIDATE` | child of Lung Dryness/external Dryness | Sang Xing Tang | strong canonical subtype candidate |
| 涼燥犯肺 | Cool-Dryness Attacking Lung | `NEW_CANONICAL_CANDIDATE` if source-backed in repo | child of Lung Dryness | Xing Su San | pair with Warm-Dryness |
| 風熱兼燥 | Wind-Heat with Dryness | `ADD_ALIAS_OR_COMPOUND_REVIEW` | may map to Warm-Dryness | Sang Xing Tang | normalize before promotion |
| 暑濕 | Summerheat with Dampness | `NEW_CANONICAL_CANDIDATE` | pathogenic factor | Liu Yi San; San Ren Tang | strong seasonal Pattern |
| 濕熱初起 | Early Damp-Heat | `STAGE_MODIFIER` | Damp-Heat | San Ren Tang | not necessarily independent |
| 下焦濕熱 | Lower Jiao Damp-Heat | `NEW_CANONICAL_CANDIDATE` / `SYSTEM_CROSSWALK_REVIEW` | may overlap Bladder/Liver-GB Damp-Heat | Long Dan Xie Gan Tang | distinguish San Jiao location from organ pattern |
| 風寒濕痹 | Wind-Cold-Damp Bi | `NEW_CANONICAL_CANDIDATE` | Bi family | Du Huo Ji Sheng Tang | high board/clinical value |
| 風濕痹 | Wind-Damp Bi | `NEW_CANONICAL_CANDIDATE` or subtype | Bi family | Fang Ji Huang Qi Tang | review with generalized Wind-Damp |
| 風濕熱痹 | Wind-Damp-Heat Bi | `NEW_CANONICAL_CANDIDATE` | Bi family | Gui Zhi Shao Yao Zhi Mu Tang | strong transformed-Heat Bi |
| 風寒濕痹鬱久化熱 | Chronic Wind-Cold-Damp Bi Transforming to Heat | `PROGRESSION_RELATION` | Bi → Heat transformation | Gui Zhi Shao Yao Zhi Mu Tang | do not make long canonical by default |
| 痰瘀痹阻 | Phlegm-Blood Stasis Obstructing Channels | `NEW_CANONICAL_CANDIDATE` / `GRAPH_COMPOSITION` | Phlegm + Blood Stasis + channel | Xiao Huo Luo Dan | strong mixed obstruction |
| 氣血瘀滯痹阻 | Qi-Blood Stagnation Painful Obstruction | `NEW_CANONICAL_CANDIDATE` / `GRAPH_COMPOSITION` | Qi stagnation + Blood stasis | Shen Tong Zhu Yu Tang | clinically useful |
| 肝腎虧虛痹證 | Bi with Liver-Kidney Deficiency | `TDIS_CONTEXT_ONLY` / `GRAPH_COMPOSITION` | Bi disease + Liver/Kidney deficiency | Du Huo Ji Sheng Tang | likely `tdis.bi_syndrome` relation |
| 氣血虛痹 | Bi with Qi-Blood Deficiency | `TDIS_CONTEXT_ONLY` / `GRAPH_COMPOSITION` | Bi disease + deficiency | Du Huo Ji Sheng Tang | same boundary |

---

# 6. Master map — Wei / Lin / disease-boundary phrases

These phrases are clinically useful but often belong to TCM disease differentiation rather than the Pattern registry itself.

| Source phrase | Preferred representation | Action |
|---|---|---|
| 脾胃氣虛痿證 | `tdis.wei_syndrome` → may_have_pattern → Spleen/Stomach Qi Deficiency | `TDIS_CONTEXT_ONLY` |
| 肝腎虧虛痿證 | `tdis.wei_syndrome` → Liver/Kidney Deficiency | `TDIS_CONTEXT_ONLY` |
| 肺熱津傷痿證 | `tdis.wei_syndrome` → Lung Heat + Fluid Injury | `TDIS_CONTEXT_ONLY` |
| 氣虛血瘀痿證 | `tdis.wei_syndrome` → Qi Deficiency + Blood Stasis | `TDIS_CONTEXT_ONLY` |
| 熱淋 | Lin Syndrome Heat subtype | current V1 already has a Lin card; keep current identity until disease-vs-pattern architecture is deliberately revisited | `KEEP_V1_FOR_NOW` |
| 石淋 | Stone Lin | same | `KEEP_V1_FOR_NOW` |
| 氣淋（實證） | Qi Lin excess | same | `KEEP_V1_FOR_NOW` |
| 血淋（實熱證） | Blood Lin excess-Heat | same | `KEEP_V1_FOR_NOW` |
| 膏淋 | Cloudy Lin | same | `KEEP_V1_FOR_NOW` |
| 勞淋 | Fatigue Lin | same | `KEEP_V1_FOR_NOW` |

**Important:** the Lin cards were explicitly registered during the V1 reconciliation. Do not re-architect them during V2 candidate import unless Ting approves a broader TCM-disease refactor.

---

# 7. Master map — gynecology / Chong-Ren / Jing

| Chinese | Preferred English | Candidate action | Graph alternative | Formula anchors | Canonicalization note |
|---|---|---|---|---|---|
| 衝任虛損 / 衝任不足 | Chong-Ren Deficiency / Insufficiency | `NEW_CANONICAL_CANDIDATE` | umbrella for Chong-Ren deficiency subtypes | Jiao Ai Tang; Gu Chong Tang | strong gyne core candidate |
| 衝任虛寒兼血虛 | Chong-Ren Deficiency-Cold with Blood Deficiency | `SUBTYPE_REVIEW` / `GRAPH_COMPOSITION` | Chong-Ren deficiency + Cold + Blood deficiency | Jiao Ai Tang | useful formula-specific subtype |
| 衝任虛寒兼血瘀 | Chong-Ren Deficiency-Cold with Blood Stasis | `SUBTYPE_REVIEW` / `GRAPH_COMPOSITION` | Chong-Ren deficiency + Cold + stasis | Wen Jing Tang | strong classic subtype |
| 脾虛衝脈不固 | Chong Instability due Spleen Deficiency | `GRAPH_COMPOSITION` | Spleen Qi deficiency → fails to secure Chong | Gu Chong Tang | likely relation rather than long ID |
| 衝任血熱 / 衝任伏熱 | Blood Heat in Chong-Ren | `NEW_CANONICAL_CANDIDATE` / `SUBTYPE_REVIEW` | Blood Heat affects Chong-Ren | Gu Jing Wan | distinguish excess Heat and Yin-deficiency Heat source variants |
| 肝火傷衝任 / 肝鬱化熱擾衝任 | Liver Fire/Heat Injuring Chong-Ren | `PROGRESSION_RELATION` / `GRAPH_COMPOSITION` | Liver stagnation → Heat/Fire → Chong-Ren | Gu Jing Wan | do not make giant canonical by default |
| 胞宮虛寒 / 子宮虛寒 | Uterus Deficiency-Cold | `NEW_CANONICAL_CANDIDATE` | Kidney/Spleen deficiency may be root | Ai Fu Nuan Gong Wan | clinically useful reproductive Pattern |
| 寒凝胞宮 / 寒凝血瘀 | Cold Congealing Blood in Uterus | `NEW_CANONICAL_CANDIDATE` or subtype | Cold → Blood Stasis in uterus | Wen Jing Tang; Sheng Hua Tang | distinguish pure excess Cold vs deficiency-Cold |
| 胞宮血瘀 / 子宮血瘀 | Blood Stasis in Uterus | `NEW_CANONICAL_CANDIDATE` | location subtype of Blood Stasis | Gui Zhi Fu Ling Wan; Tao Hong Si Wu Tang | high gyne graph value |
| 氣滯血瘀（婦科） | Qi Stagnation with Blood Stasis, gyne context | `CONTEXT_RELATION` | generic Qi/Blood nodes → gyne TCM disease | Dan Shen Yin; blood-moving formulas | no gyne-only duplicate |
| 肝氣鬱結（經病） | Liver Qi Stagnation affecting menstruation | `CONTEXT_RELATION` | existing Liver Qi Stagnation → menstrual TCM disease | Xiao Yao San | do not duplicate |
| 肝鬱化熱兼脾虛血虛 | Liver Constraint Heat + Spleen/Blood Deficiency | `GRAPH_COMPOSITION` | multiple nodes | Jia Wei Xiao Yao San | formula profile, not clean single Pattern |
| 肝脾不和（經病） | Liver-Spleen Disharmony with menstrual context | `CONTEXT_RELATION` | Liver-Spleen Disharmony → menstrual disease | Si Ni San; Xiao Yao San | no menstrual-only node |
| 腎精不足（生殖） | Kidney Jing Deficiency in reproductive context | `CONTEXT_RELATION` / `NEW_CANONICAL_CANDIDATE` for generic Kidney Jing deficiency | generic Kidney Jing node | Jing-tonifying formulas | do not make reproductive duplicate |
| 腎虛胎元不固 | Kidney Deficiency Failing to Secure Pregnancy | `TDIS_CONTEXT_ONLY` / `GRAPH_COMPOSITION` | Kidney Qi/Jing deficiency → threatened miscarriage context | Shou Tai Wan | pregnancy is context |
| 腎氣不固 | Kidney Qi Not Firm | `NEW_CANONICAL_CANDIDATE` | reusable across urinary/reproductive contexts | Jin Suo Gu Jing Wan | strong generic node |
| 脾不統血 | Spleen Not Controlling Blood | `ENRICH_EXISTING` | generic reusable Pattern | Gui Pi Tang | gyne bleeding is context |
| 脾陽虛失統血 | Spleen Yang Deficiency Failing to Control Blood | `GRAPH_COMPOSITION` / `SUBTYPE_REVIEW` | Spleen Yang deficiency + not controlling Blood | Huang Tu Tang | likely two-node relation |
| 血熱妄行（崩漏） | Blood Heat causing uterine bleeding | `CONTEXT_RELATION` | generic Blood Heat/bleeding node → uterine bleeding | Gu Jing Wan | no uterine-only duplicate |
| 血虛經病 | Blood Deficiency with menstrual insufficiency | `CONTEXT_RELATION` | Blood Deficiency → amenorrhea/scanty/irregular menses | Si Wu Tang | no menstrual-only duplicate |
| 帶脈失約 | Dai Channel Dysfunction | `CANONICAL_REVIEW_REQUIRED` | Spleen deficiency + Liver constraint + Dampness → Dai Mai | Wan Dai Tang | depends on whether extraordinary-vessel Patterns are in scope |
| 產後血瘀 | Postpartum Blood Stasis | `TDIS_CONTEXT_ONLY` | Blood Stasis + postpartum context | Sheng Hua Tang | postpartum is context |
| 產後血虛 | Postpartum Blood Deficiency | `TDIS_CONTEXT_ONLY` | Blood Deficiency + postpartum context | Si Wu Tang | context only |
| 產後寒凝血瘀 | Postpartum Cold-Congealed Blood Stasis | `GRAPH_COMPOSITION` / `TDIS_CONTEXT_ONLY` | Cold + Blood Stasis + postpartum | Sheng Hua Tang | preserve source evidence |
| 衝任虛損胎動不安 | Chong-Ren Deficiency with Fetal Restlessness | `TDIS_CONTEXT_ONLY` | Chong-Ren Deficiency → threatened miscarriage context | Jiao Ai Tang | pregnancy context |
| 腎虛胎元不固 | Kidney Deficiency with Fetal Instability | `TDIS_CONTEXT_ONLY` | Kidney deficiency → threatened miscarriage | Shou Tai Wan | pregnancy context |

---

# 8. Alias normalization queue

These source phrases should be checked as aliases before any new ID is considered.

| Source wording variants | Normalize toward |
|---|---|
| 心腎不交 / 水火未濟 / 水火不交 / Heart-Kidney Disharmony / Heart-Kidney Not Communicating | Heart-Kidney Not Communicating |
| 肝火上炎 / 肝火亢盛 / 肝經實火 / Liver Fire / Liver Fire Blazing / Liver Fire Flaring Upward | Liver Fire Blazing |
| 肝風內動 / 內風 / Internal Liver Wind / Liver Wind Stirring Internally | Internal Liver Wind umbrella |
| 脾氣下陷 / 中氣下陷 | Spleen Qi Sinking / Central Qi Sinking |
| 脾不統血 / 脾不攝血 / Spleen Not Governing Blood | Spleen Not Controlling Blood |
| 痰濕 / 濕痰 / Phlegm-Damp / Damp-Phlegm | one normalized mechanism, with organ-specific children as needed |
| 胃陰虛 / 胃津不足 | terminology review: possibly one family with fluid-deficiency subtype |
| 肝脾不和 / 肝氣犯脾 / Liver Attacking Spleen | one family, exact subtype decision after repo comparison |
| 肝膽濕熱 / Liver and Gallbladder Damp-Heat | one canonical term |
| 胃熱 / 胃火 | **do not alias automatically**; preserve locked AcuTing distinction |
| 風寒 / 風寒犯肺 | **do not alias**; broader exterior Pattern vs Lung-specific Pattern |
| 風熱 / 風熱犯肺 | **do not alias**; broader exterior Pattern vs Lung-specific Pattern |
| 肺燥 / 溫燥犯肺 / 涼燥犯肺 | umbrella + subtype review |
| 痰飲 / 水飲 / Thin Mucus / Congested Fluids | authoritative terminology review |
| 衝任虛損 / 衝任不足 | likely alias family |
| 胞宮 / 子宮 in Pattern names | normalize Chinese display conventions, but preserve source wording in aliases/provenance |

---

# 9. “Do not create this as a standalone Pattern” queue

The following are better modeled as relationships, stages, or contexts unless stronger ontology evidence appears:

- Wind-Cold transforming into Heat
- Lung Heat consuming fluids
- Stomach Fire damaging Yin
- Spleen Qi Deficiency generating Dampness
- Dampness generating Phlegm
- Liver Qi Stagnation transforming into Heat
- Liver Fire generating Wind
- Blood Deficiency generating Wind
- Kidney Yang Deficiency causing Water Flooding Lung
- Wei Syndrome due to any underlying Pattern
- postpartum Blood deficiency
- postpartum Blood stasis
- pregnancy instability due to Kidney deficiency
- menstrual irregularity due to Liver Qi stagnation
- uterine bleeding due to Spleen not controlling Blood
- Spleen Yang deficiency + failure to control Blood
- Liver Heat/Fire injuring Chong-Ren
- highly compound “X + Y + Z” formula descriptions when component canonical nodes already exist

---

# 10. Highest-priority V2 candidate promotion queue

This is a **research priority**, not an instruction to add IDs.

## Tier A — likely high-value canonical additions if absent

1. Heart Yang Deficiency — 心陽虛
2. Phlegm-Fire Disturbing Heart — 痰火擾心
3. Phlegm Misting Heart Orifices — 痰蒙心竅
4. Small Intestine Excess Heat — 小腸實熱
5. Lung Dryness — 肺燥
6. Wind-Cold Attacking Lung — 風寒犯肺
7. Wind-Heat Attacking Lung — 風熱犯肺
8. Phlegm-Heat Obstructing Lung — 痰熱壅肺
9. Large Intestine Excess Heat — 大腸實熱
10. Large Intestine Fluid Deficiency — 大腸津虧
11. Large Intestine Damp-Heat — 大腸濕熱
12. Stomach Qi Deficiency — 胃氣虛
13. Rebellious Stomach Qi — 胃氣上逆
14. Food Accumulation — 食積
15. Liver Qi Invading Stomach — 肝氣犯胃
16. Liver-Spleen Disharmony — 肝脾不和
17. Gallbladder Qi Deficiency — 膽氣虛
18. Kidney Qi Not Firm — 腎氣不固
19. Kidney Jing Deficiency — 腎精不足
20. Kidney Failing to Grasp Qi — 腎不納氣
21. Kidney Yang Deficiency with Water Flooding — 腎陽虛水泛
22. Bladder Damp-Heat — 膀胱濕熱
23. Lung-Spleen Qi Deficiency — 肺脾氣虛
24. Heart-Lung Qi Deficiency — 心肺氣虛
25. Lung-Kidney Qi Deficiency — 肺腎氣虛
26. Heart-Gallbladder Qi Deficiency — 心膽氣虛
27. Liver Fire Scorching Lung — 肝火犯肺
28. Wind-Cold-Damp Bi — 風寒濕痹
29. Wind-Damp-Heat Bi — 風濕熱痹
30. Blood Deficiency with Cold Stagnation — 血虛寒凝
31. Fluid Deficiency / Jin-Ye Injury — 津傷 / 津液不足
32. Summerheat-Dampness — 暑濕
33. Chong-Ren Deficiency — 衝任虛損
34. Uterus Deficiency-Cold — 胞宮虛寒
35. Blood Stasis in Uterus — 胞宮血瘀

## Tier B — likely useful subtypes / ontology children

- Kidney Yin Deficiency with Fire Flaring
- Warm-Dryness Attacking Lung
- Cool-Dryness Attacking Lung
- Cold-Phlegm Obstructing Lung
- Wind-Phlegm
- Wind-Phlegm obstructing channels/head-face
- Gallbladder Damp-Heat
- Bladder Deficiency Cold
- Chong-Ren Deficiency-Cold
- Chong-Ren Deficiency-Cold with Blood Stasis
- Chong-Ren Blood Heat
- Cold Congealing Blood in Uterus

## Tier C — graph-first candidates

- Liver-Kidney Yin Deficiency with Liver Yang Rising
- Liver-Kidney Yin Deficiency with Fire Flaring
- Spleen-Kidney Yang Deficiency with Water Flooding
- Heart Yang deficiency with Water Qi affecting Heart
- Qi deficiency + Blood stasis obstructing channels
- Phlegm + Blood stasis channel obstruction
- Spleen deficiency → Chong instability
- Liver Fire → Chong-Ren injury
- postpartum Cold + Blood stasis

---

# 11. Recommended Antigravity output after consuming Batch 05

Antigravity should generate, but **not automatically execute**, a repo-aware decision table with these columns:

```text
candidate_id
name_zh
name_en
source_variants
current_registry_matches[]
current_library_matches[]
current_alias_matches[]
current_relation_matches[]
formula_anchor_ids[]
point_anchor_ids[]
tcmdisease_context_ids[]
biomedical_context_ids[]
recommended_action
recommended_parent_or_target
confidence
source_conflict
provenance[]
notes
```

### Allowed `recommended_action`

```text
existing_enrich
add_alias
new_canonical
subtype_of
broader_than
narrower_than
progresses_to
caused_by
affects
compound_graph
tdis_context_only
hold_for_review
```

---

# 12. Required safety rails for Antigravity

1. **Chinese identity first.** English wording differences alone must not generate duplicate IDs.
2. Check registry, library, aliases, decisions/history, and relation files before creating anything.
3. A formula indication is evidence, not ontology authority.
4. A biomedical condition link must never define Pattern identity.
5. Pregnancy, postpartum, menstruation, Wei, Lin, Bi and other clinical contexts need explicit disease-vs-pattern review.
6. Do not turn every `X with Y` formula phrase into a canonical node.
7. Prefer graph composition when independent components already exist.
8. Keep aliases separate from canonical names.
9. Preserve source-specific terminology in provenance even when normalized.
10. Never overwrite accepted V1 content just because a new source is more detailed.
11. Resolve formula and point references to existing canonical IDs before adding relations.
12. No mass-create script should run until the decision table is human-reviewed.

---

# 13. Current known V1 cleanup / expansion dependency

Before broad V2 promotion, V1 identity should reach the intended clean state already identified in the canonical audit:

- registry: 69 total
- category nodes: 10
- clinical `level:"pattern"` IDs: 59
- library target: 59 canonical cards
- no library-only duplicate IDs

The three true registered cardless patterns identified in the V1 audit are:

1. `pattern.stomach_fire`
2. `pattern.wind_cold`
3. `pattern.wind_heat`

These are **not V2 discoveries**. They are V1 canonical content gaps and should be completed from source-backed material before the final freeze.

---

# 14. Next research batch

## Batch 06 — Formula-to-Pattern Inversion Master Index

The next pack should invert the user's large formula corpus:

```text
Pattern candidate
→ all formulas that cite/support it
→ source count
→ exact source wording
→ board relevance
→ organ/system
→ whether formula evidence supports core Pattern vs subtype vs progression
```

This will let Antigravity rank future Pattern candidates by **source density**, rather than by whichever page happens to be processed first.

Recommended columns:

- normalized Pattern
- Chinese
- formula count
- formulas
- exact syndrome wordings
- source files
- NCBAHM/board flag
- AD flag
- course flag
- current canonical match
- recommended canonical action
- confidence

This becomes the evidence-density layer underneath the candidate ontology.

---

## End of Batch 05

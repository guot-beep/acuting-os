# AcuTing OS — Supplement Source Map Batch 01

**Status:** `RESEARCH STAGING / NOT CANONICAL`

Purpose: 在 `supp.*` 正式 card template / ID / validator 鎖定前，先建立不綁死 schema 的來源地圖與候選 inventory。

## Architecture guardrails
- Canonical namespace target is supp.* (never suppl.*).
- Knowledge/research staging only; not Patient/Case/Visit data.
- No PHI or patient-derived data.
- No supplement observation auto-creates TCM disease or pattern.
- Ingredient identity stays separate from commercial product/brand identity.
- No canonical promotion before template, ID rules, taxonomy, ingestion contract and validators are locked.
- Safety/interaction fields must be source-backed and distinguish unknown/not-reviewed from reviewed-and-none-found.
- Clinical exposure recording references supp.* through the existing snapshot + append-only event model.

## Taxonomy findings before bulk generation
- Most candidates fit the current 8 categories.
- Melatonin does not fit naturally.
- Glucosamine and chondroitin do not fit naturally.
- Resolve taxonomy gaps before bulk generation.

## Candidate inventory
| # | Candidate ID | English | 中文 | Candidate category | Source targets |
|---:|---|---|---|---|---|
| 1 | `supp.vitamin_a` | Vitamin A | 維生素A | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 2 | `supp.vitamin_b1_thiamin` | Thiamin (Vitamin B1) | 硫胺素（維生素B1） | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 3 | `supp.vitamin_b2_riboflavin` | Riboflavin (Vitamin B2) | 核黃素（維生素B2） | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 4 | `supp.vitamin_b3_niacin` | Niacin (Vitamin B3) | 菸鹼酸／菸鹼醯胺（維生素B3） | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 5 | `supp.vitamin_b6` | Vitamin B6 | 維生素B6 | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 6 | `supp.folate` | Folate / Folic Acid | 葉酸／葉酸鹽 | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 7 | `supp.vitamin_b12` | Vitamin B12 | 維生素B12 | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 8 | `supp.vitamin_c` | Vitamin C | 維生素C | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 9 | `supp.vitamin_d3` | Vitamin D3 (Cholecalciferol) | 維生素D3（膽鈣化醇） | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 10 | `supp.vitamin_e` | Vitamin E | 維生素E | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 11 | `supp.vitamin_k` | Vitamin K | 維生素K | `vitamins` | NIH_ODS_VITMIN, FDA_SUPP |
| 12 | `supp.calcium` | Calcium | 鈣 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 13 | `supp.iron` | Iron | 鐵 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 14 | `supp.magnesium` | Magnesium | 鎂 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 15 | `supp.zinc` | Zinc | 鋅 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 16 | `supp.selenium` | Selenium | 硒 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 17 | `supp.iodine` | Iodine | 碘 | `minerals` | NIH_ODS_VITMIN, FDA_SUPP |
| 18 | `supp.omega_3_fatty_acids` | Omega-3 Fatty Acids | Omega-3 脂肪酸 | `fatty_acids` | NIH_ODS, FDA_SUPP |
| 19 | `supp.coenzyme_q10` | Coenzyme Q10 (CoQ10) | 輔酶Q10（CoQ10） | `antioxidants_coenzymes` | NIH_ODS, NCCIH, FDA_SUPP |
| 20 | `supp.creatine` | Creatine | 肌酸 | `amino_acids_performance` | NIH_ODS, FDA_SUPP |
| 21 | `supp.probiotics` | Probiotics | 益生菌 | `probiotics` | NIH_ODS, NCCIH, FDA_SUPP |
| 22 | `supp.turmeric_curcumin` | Turmeric / Curcumin | 薑黃／薑黃素 | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 23 | `supp.ginkgo` | Ginkgo | 銀杏 | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 24 | `supp.ginseng_asian` | Asian Ginseng (Panax ginseng) | 亞洲人參／高麗參（Panax ginseng） | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 25 | `supp.echinacea` | Echinacea | 紫錐菊 | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 26 | `supp.garlic` | Garlic Supplement | 大蒜補充劑 | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 27 | `supp.st_johns_wort` | St. John's Wort | 聖約翰草 | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP, FDA_INGREDIENT_ALERTS |
| 28 | `supp.ashwagandha` | Ashwagandha | 南非醉茄（Ashwagandha） | `botanical_extracts` | NIH_ODS_BOTANICAL, NCCIH, FDA_SUPP |
| 29 | `supp.melatonin` | Melatonin | 褪黑激素 | `UNRESOLVED_CATEGORY` | NIH_ODS, NCCIH, FDA_SUPP |
| 30 | `supp.glucosamine` | Glucosamine | 葡萄糖胺 | `UNRESOLVED_CATEGORY` | NIH_ODS, NCCIH, FDA_SUPP |
| 31 | `supp.chondroitin` | Chondroitin | 軟骨素 | `UNRESOLVED_CATEGORY` | NIH_ODS, NCCIH, FDA_SUPP |
| 32 | `supp.multivitamin_mineral` | Multivitamin/mineral supplement | 綜合維生素／礦物質補充劑 | `multi_ingredient` | NIH_ODS, FDA_SUPP |

## Source policy
- NIH ODS / NCCIH: ingredient identity, health-professional context, safety and interaction source map.
- FDA: regulatory, safety alert and enforcement layer.
- Do not describe supplements as FDA-approved for safety/effectiveness.
- This pass intentionally does not fill efficacy, dose, contraindication, interaction, pregnancy or perioperative safety claims.

## Next ingestion gate
1. Fable locks supplement card template + identity rules.
2. Resolve taxonomy gaps, especially melatonin / glucosamine / chondroitin.
3. Convert selected candidates into the locked ingestion JSON schema.
4. Add validators for ID/category/source-status.
5. Antigravity bulk-fills only locked fields.
6. Safety and interaction enrichment remains source-backed and review-gated.

## Federal source map
- **NIH_ODS** — NIH Office of Dietary Supplements — Dietary Supplement Fact Sheets
  - Use: Primary federal source for ingredient identity, intake/safety context, and medication-interaction sections when an ingredient fact sheet exists.
  - URL: https://ods.od.nih.gov/factsheets/list-all/
- **NIH_ODS_VITMIN** — NIH ODS — Vitamin and Mineral Supplement Fact Sheets
  - Use: Primary federal source map for vitamins and minerals.
  - URL: https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/
- **NIH_ODS_BOTANICAL** — NIH ODS — Botanical Supplement Fact Sheets
  - Use: Federal source directory for botanicals, frequently routing to NCCIH.
  - URL: https://ods.od.nih.gov/factsheets/list-Botanicals/
- **NCCIH** — NIH NCCIH — Dietary and Herbal Supplements
  - Use: Primary federal source for botanical/supplement safety, evidence summaries, and interaction cautions.
  - URL: https://www.nccih.nih.gov/health/dietary-and-herbal-supplements
- **FDA_SUPP** — U.S. FDA — Dietary Supplements
  - Use: Regulatory/safety layer; FDA does not pre-approve supplements for safety/effectiveness. Use for alerts, unlawful ingredients, and post-market safety actions.
  - URL: https://www.fda.gov/food/dietary-supplements
- **FDA_INGREDIENT_ALERTS** — U.S. FDA — Information on Select Dietary Supplement Ingredients and Other Substances
  - Use: Safety/enforcement lookup for selected ingredients and substances.
  - URL: https://www.fda.gov/food/dietary-supplements/information-select-dietary-supplement-ingredients-and-other-substances

> No PHI or patient-derived data is included.
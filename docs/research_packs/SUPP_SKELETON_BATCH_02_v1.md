# SUPP SKELETON BATCH 02 v1

**RESEARCH STAGING / NOT CANONICAL**

CR-007. 18 additional supplement skeletons. Dose ranges are descriptive reference/study/common-product ranges, not prescribing instructions.

## `supp.vitamin_a` — Vitamin A / 維生素 A
- category: `vitamins`
- common_forms: retinyl palmitate, retinyl acetate, beta-carotene-containing products
- typical_dose_range: Adult RDA: 700–900 mcg RAE/day; adult UL for preformed vitamin A: 3,000 mcg RAE/day. Supplement content varies widely.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - Chronic excess preformed vitamin A can cause toxicity.
  - Pregnancy: high-dose preformed vitamin A is teratogenic; avoid excess unless specifically medically indicated.
  - Retinoid medications can create additive toxicity concerns.
- evidence_snapshot: Essential nutrient with established roles in vision, immunity, reproduction, and cellular differentiation; supplementation is primarily indicated when intake/status is inadequate.
- sources:
  - https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/

## `supp.vitamin_e` — Vitamin E (alpha-tocopherol) / 維生素 E
- category: `vitamins`
- common_forms: natural d-alpha-tocopherol, synthetic dl-alpha-tocopherol, mixed tocopherols
- typical_dose_range: Adult RDA: 15 mg/day alpha-tocopherol. Supplements often provide much more; adult UL from supplements is 1,000 mg/day alpha-tocopherol.
- interaction_focus: `{"anticoagulant": "known_bleeding_concern_high_dose", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - High-dose vitamin E can increase bleeding tendency.
  - Use caution with anticoagulant/antiplatelet therapy.
  - High-dose antioxidant supplementation can complicate some oncology treatment contexts; coordinate with oncology team.
- evidence_snapshot: Essential antioxidant nutrient; high-dose supplementation has not shown broad preventive benefit and can create safety concerns.
- sources:
  - https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/

## `supp.vitamin_k` — Vitamin K / 維生素 K
- category: `vitamins`
- common_forms: phylloquinone (K1), menaquinone-4 (MK-4), menaquinone-7 (MK-7)
- typical_dose_range: Adult AI: 90 mcg/day women and 120 mcg/day men. Supplement doses vary by K1/K2 form.
- interaction_focus: `{"anticoagulant": "major_known_warfarin_interaction", "immunosuppressant": "no_primary_class_flag", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - Major interaction with warfarin and related vitamin-K antagonist management; intake should be consistent and medically coordinated.
  - No established UL for natural K forms, but this does not remove drug-interaction risk.
- evidence_snapshot: Essential for normal coagulation protein activation and bone-related proteins; its clinical importance is strongly tied to anticoagulant management.
- sources:
  - https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/

## `supp.iron` — Iron / 鐵
- category: `minerals`
- common_forms: ferrous sulfate, ferrous gluconate, ferrous fumarate, iron bisglycinate, carbonyl iron
- typical_dose_range: Adult RDA varies by age/sex; common iron-only supplements provide ~18–65 mg elemental iron. Adult UL is 45 mg/day from all sources, though therapeutic dosing can exceed this under medical supervision.
- interaction_focus: `{"anticoagulant": "no_primary_class_flag", "immunosuppressant": "no_primary_class_flag", "thyroid_med": "known_absorption_interaction"}`
- key_safety_notes:
  - GI upset, constipation, nausea are common at higher doses.
  - Iron overdose is dangerous, especially in children.
  - Iron can impair levothyroxine absorption; separate dosing per thyroid-medication guidance.
  - Also interacts with several antibiotics and other medications.
- evidence_snapshot: Strong evidence for treatment of iron deficiency; routine use without indication can cause harm or obscure the reason for abnormal iron status.
- sources:
  - https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/

## `supp.selenium` — Selenium / 硒
- category: `minerals`
- common_forms: selenomethionine, selenium-enriched yeast, sodium selenite, sodium selenate
- typical_dose_range: Adult RDA: 55 mcg/day. Many supplements provide 50–200 mcg; selenium-only products may provide 100–400 mcg. Adult UL: 400 mcg/day.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "thyroid_biology_relevant_but_no_blanket_drug_rule"}`
- key_safety_notes:
  - Chronic excess can cause selenosis with hair/nail changes, GI symptoms, neurologic abnormalities and garlic-like breath odor.
  - No established role for high-dose selenium as a general cancer-prevention supplement.
- evidence_snapshot: Essential trace mineral in selenoproteins including antioxidant and thyroid-hormone metabolism pathways; more is not necessarily better.
- sources:
  - https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional/

## `supp.iodine` — Iodine / 碘
- category: `minerals`
- common_forms: potassium iodide, sodium iodide, kelp/seaweed-derived iodine
- typical_dose_range: Adult RDA: 150 mcg/day; pregnancy 220 mcg/day; lactation 290 mcg/day. Adult UL: 1,100 mcg/day.
- interaction_focus: `{"anticoagulant": "no_primary_class_flag", "immunosuppressant": "no_primary_class_flag", "thyroid_med": "major_clinical_context_flag"}`
- key_safety_notes:
  - Both deficiency and excess iodine can alter thyroid function.
  - High iodine intake can interact with thyroid disease management and thyroid-active drugs; clinician review is warranted.
  - Seaweed products can have highly variable iodine content.
- evidence_snapshot: Essential substrate for thyroid hormone synthesis; supplementation should respect baseline intake and thyroid context.
- sources:
  - https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/

## `supp.melatonin` — Melatonin / 褪黑激素
- category: `other_bioactives`
- common_forms: immediate-release tablets/capsules, extended-release, gummies/liquids
- typical_dose_range: No RDA. Common adult supplemental doses range roughly 0.5–5 mg near bedtime; research uses wider ranges. Product labeling accuracy is variable.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Short-term use appears relatively safe; long-term safety is less established.
  - Drowsiness, headache, dizziness, nausea can occur.
  - Product-content variability is a known concern.
  - Use caution with sedatives and in children without clinical guidance.
- evidence_snapshot: May help some circadian-timing disorders and jet lag; evidence does not support treating all chronic insomnia as a simple melatonin deficiency.
- sources:
  - https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know

## `supp.ashwagandha` — Ashwagandha (Withania somnifera) / 南非醉茄 / 印度人參
- category: `botanical_extracts`
- common_forms: root extract, root powder, root+leaf extract
- typical_dose_range: No standardized therapeutic dose. Many short-term trials use several hundred mg/day of standardized extract; formulations are not equivalent.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "known_theoretical_clinical_concern", "thyroid_med": "known_clinical_concern"}`
- key_safety_notes:
  - Rare liver injury has been reported.
  - Avoid in pregnancy; NCCIH advises against use in breastfeeding.
  - Not recommended before surgery or in autoimmune/thyroid disorders without clinical review.
  - Can interact with immunosuppressants, sedatives, anticonvulsants, diabetes/BP medicines, and thyroid hormone medications.
- evidence_snapshot: Some preparations may help stress or insomnia, but studies are small and heterogeneous; benefits should not be generalized across products.
- sources:
  - https://www.nccih.nih.gov/health/ashwagandha

## `supp.echinacea` — Echinacea / 紫錐菊
- category: `botanical_extracts`
- common_forms: E. purpurea extract, E. angustifolia extract, mixed-species products
- typical_dose_range: No universal standardized dose; studies use different species, plant parts, extracts, and dosing schedules.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "theoretical_concern", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Allergic reactions can occur and can be severe.
  - Theoretical interaction concern exists with immunosuppressants.
  - Possible liver-enzyme drug interactions are not fully resolved.
- evidence_snapshot: May slightly reduce the chance of catching a cold; evidence that it shortens an established cold is unclear.
- sources:
  - https://www.nccih.nih.gov/health/echinacea

## `supp.garlic` — Garlic supplement / 大蒜萃取物
- category: `botanical_extracts`
- common_forms: aged garlic extract, garlic powder tablets, garlic oil products
- typical_dose_range: No single standardized dose; study products vary substantially by preparation and sulfur-compound content.
- interaction_focus: `{"anticoagulant": "known_bleeding_concern", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - Garlic supplements may increase bleeding risk.
  - Important perioperative and anticoagulant/antiplatelet review.
  - GI symptoms and odor are common; raw topical garlic can burn skin.
- evidence_snapshot: May modestly reduce LDL cholesterol, blood pressure, or glucose in some populations, but effects are small and product-dependent.
- sources:
  - https://www.nccih.nih.gov/health/garlic

## `supp.st_johns_wort` — St. John's wort (Hypericum perforatum) / 聖約翰草
- category: `botanical_extracts`
- common_forms: standardized extract tablets/capsules, tincture/liquid extract
- typical_dose_range: No universal supplement standard. Depression trials often use standardized extracts in divided daily dosing; product hypericin/hyperforin content matters.
- interaction_focus: `{"anticoagulant": "major_known_interaction_warfarin", "immunosuppressant": "major_known_interaction_cyclosporine", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - High-priority interaction herb: induces drug-metabolizing pathways and can reduce effects of many critical medicines.
  - Can reduce warfarin, cyclosporine, oral contraceptive, HIV, oncology and other drug exposure.
  - Serotonergic combinations can cause serious serotonin-related toxicity.
  - Photosensitivity can occur.
- evidence_snapshot: May help some mild-to-moderate depressive symptoms, but interaction burden is unusually high and makes medication reconciliation essential.
- sources:
  - https://www.nccih.nih.gov/health/st-johns-wort

## `supp.glucosamine` — Glucosamine / 葡萄糖胺
- category: `other_bioactives`
- common_forms: glucosamine sulfate, glucosamine hydrochloride, glucosamine+chondroitin
- typical_dose_range: Common osteoarthritis studies use ~1,500 mg/day glucosamine; formulations and pharmaceutical-grade products differ.
- interaction_focus: `{"anticoagulant": "known_warfarin_case_signal", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - Evidence for knee osteoarthritis is inconsistent.
  - Warfarin interaction/INR elevation has been reported and should be reviewed.
  - Shellfish allergy concerns depend on product source/manufacturing rather than glucosamine molecule alone.
- evidence_snapshot: Substantial research exists, but guidelines disagree and results are inconsistent; product quality/formulation matters.
- sources:
  - https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know

## `supp.chondroitin` — Chondroitin sulfate / 軟骨素
- category: `other_bioactives`
- common_forms: chondroitin sulfate, glucosamine+chondroitin combinations
- typical_dose_range: Common osteoarthritis studies use roughly 800–1,200 mg/day; pharmaceutical-grade preparations are not necessarily equivalent to retail products.
- interaction_focus: `{"anticoagulant": "possible_bleeding_or_warfarin_concern", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "no_primary_class_flag"}`
- key_safety_notes:
  - Evidence and guideline recommendations are inconsistent.
  - Potential anticoagulant interaction/bleeding concern warrants review, especially in combination products.
- evidence_snapshot: May help pain/function in selected osteoarthritis studies, but results vary and expert guidelines disagree.
- sources:
  - https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know

## `supp.nac` — N-acetylcysteine (NAC) / N-乙醯半胱胺酸（NAC）
- category: `antioxidants_coenzymes`
- common_forms: capsules/tablets, powder
- typical_dose_range: No general RDA. Dietary-supplement studies often use ~600–1,200 mg/day, but indication-specific research varies.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - GI effects can occur.
  - NAC is also used as a medication in specific clinical settings; supplement and medical-use contexts should not be conflated.
  - Drug-interaction evidence is indication-specific and incomplete.
- evidence_snapshot: Biochemical precursor to glutathione with established medical uses as a drug; supplement evidence for general wellness is much less definitive.
- sources:
  - https://ods.od.nih.gov/factsheets/ImmuneFunction-HealthProfessional/

## `supp.glutathione` — Glutathione / 穀胱甘肽
- category: `antioxidants_coenzymes`
- common_forms: oral reduced glutathione, liposomal glutathione, sublingual products
- typical_dose_range: No RDA or standardized therapeutic oral dose. Human supplement studies use varied doses and formulations.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Oral bioavailability and clinical outcomes vary by formulation.
  - Interaction data with anticoagulants, immunosuppressants, and thyroid drugs are insufficient.
  - Do not extrapolate intravenous or disease-specific research to routine oral supplement use.
- evidence_snapshot: Important endogenous antioxidant, but evidence that routine oral supplementation produces meaningful clinical outcomes remains formulation- and indication-dependent.
- sources:
  - https://ods.od.nih.gov/factsheets/ImmuneFunction-HealthProfessional/

## `supp.green_tea_extract` — Green tea extract / 綠茶萃取物
- category: `botanical_extracts`
- common_forms: EGCG/catechin extract capsules, decaffeinated extract, caffeinated extract
- typical_dose_range: No universal safe/effective dose. Studies use varying catechin/EGCG amounts; concentrated extracts are not equivalent to brewed tea.
- interaction_focus: `{"anticoagulant": "product_dependent_vitamin_k_caffeine_context", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Rare liver injury has been reported, particularly with concentrated extracts.
  - High-dose green tea can reduce nadolol exposure; extract can alter atorvastatin exposure.
  - Caffeine-containing products add stimulant effects.
  - Medication interaction review is required.
- evidence_snapshot: May modestly affect LDL cholesterol or body weight in some studies; evidence for cancer prevention is inconsistent.
- sources:
  - https://www.nccih.nih.gov/health/green-tea

## `supp.elderberry` — Elderberry (Sambucus nigra) / 接骨木莓
- category: `botanical_extracts`
- common_forms: syrup, gummies, capsules/extracts
- typical_dose_range: No standardized therapeutic dose; clinical products vary widely in extract concentration and formulation.
- interaction_focus: `{"anticoagulant": "insufficient_specific_data", "immunosuppressant": "insufficient_specific_data", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Raw/unripe berries and some plant parts contain cyanogenic compounds and can cause GI toxicity; properly prepared products differ.
  - Medication-interaction data are limited.
  - Pregnancy/breastfeeding safety data are insufficient.
- evidence_snapshot: Preliminary evidence suggests possible symptom relief in some upper respiratory infections, but evidence is limited and does not support broad antiviral claims.
- sources:
  - https://www.nccih.nih.gov/health/elderberry

## `supp.asian_ginseng` — Asian ginseng (Panax ginseng) / 人參（亞洲人參）
- category: `botanical_extracts`
- common_forms: white ginseng root extract, red ginseng extract, standardized ginsenoside products
- typical_dose_range: No universal standardized dose; trials use varied extracts and ginsenoside content, often over weeks to a few months.
- interaction_focus: `{"anticoagulant": "possible_clotting_interaction", "immunosuppressant": "autoimmune_immunologic_context_flag", "thyroid_med": "insufficient_specific_data"}`
- key_safety_notes:
  - Insomnia is common.
  - May affect blood sugar and may interfere with blood clotting.
  - May worsen autoimmune disorders; medication interaction review is warranted.
  - Pregnancy safety is uncertain and some evidence raises concern.
- evidence_snapshot: Human evidence is mixed; possible small effects on fatigue or selected metabolic/sexual outcomes, but many trials are small and short.
- sources:
  - https://www.nccih.nih.gov/health/asian-ginseng

## Safety normalization rule
`insufficient_specific_data` and `no_primary_class_flag` are not equivalent to 'no interaction'. St. John's wort is a high-priority interaction outlier and should trigger medication reconciliation rather than a generic herb warning.
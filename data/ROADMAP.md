# AcuTing OS Data Roadmap

## Phase 1: Acupuncture Core

1. Build canonical `data/acupoints/361.json` from WHO point-location standards.
2. Migrate existing in-app points into the schema.
3. Finish channel by channel:
   - Complete: LU, LI, ST, SP, HT, SI.
   - In progress: BL.
   - Then KI1-KI27, PC1-PC9, TE/SJ1-TE/SJ23, GB1-GB44, LR1-LR14, CV1-CV24, GV1-GV28.
4. Add needling depth, angle, moxa, forbidden actions only after source validation.

## Phase 2: Anatomy and Safety

1. Map each acupoint to muscles, bones, nerves, and vessels.
2. Build `danger_zones.json` for pneumothorax, major vessels, major nerves, pregnancy cautions, local infection, and special technique risks.
3. Cross-check anatomy using TeachMeAnatomy first; use Kenhub and Visible Body as terminology/visual references.
4. Add Radiopaedia references for neck, thorax, abdomen, pelvis, and major limb cross-sections.
5. Use `data/sources/validation_matrix.json` to decide which sources validate each field.

## Phase 2B: Fixed 2D Regional Atlas

1. Use `data/visual_atlas/individual_2d_sources.json` to track no-login, license-clear image candidates.
2. Prioritize region maps: head/face, hand/wrist, forearm/elbow, foot/ankle, lower limb, chest/abdomen, back/lumbar/sacrum.
3. For each image, store source URL, license, attribution, local/remote path, and coordinate calibration.
4. Add a future UI mode for selecting one fixed 2D region map instead of relying only on whole-body maps.
5. Do not use AI-generated anatomy as a point-location source.

## Phase 3: NCCAOM

1. Import official Content Outline topics into `data/nccaom/high_yield.json`.
2. Tag acupoints as high-yield, safety-critical, channel-command, five-shu, xi-cleft, luo, yuan-source, back-shu, front-mu, confluent, and extra points.
3. Add quiz mode prompts and exam pearls.

## Phase 4: Evidence and Clinical Pearls

1. Add condition-level evidence summaries in `data/evidence/conditions.json`.
2. Add practical clinical pairing notes in `data/clinical_pearls/pearls.json`.
3. Use PubMed, PubMed systematic reviews, and Cochrane Reviews for evidence grading.
4. Keep evidence claims conservative and linked to source quality.

## Phase 5: Herbs, Pathology, Western Medicine, and Personal OS

1. Add single herbs and formulas after acupuncture core stabilizes.
   - Formula browse categories are seeded in `data/herbs/formula_categories.json`.
   - High-yield draft formulas are seeded in `data/herbs/high_yield_formula_seeds.json` and synced into `data/herbs/formulas.json`.
   - Formula safety flags are seeded in `data/herbs/formula_safety_flags.json` for medications, pregnancy, fertility, bleeding, cardiovascular, GI, respiratory, renal, hepatic, and red-flag review.
   - Next formula content batch: source-check composition, herb roles, classical source, actions, modifications, contraindications, and herb-drug cautions for each draft formula.
2. Keep Eastern and Western pathology separate:
   - `western_conditions`: biomedical diagnoses and clinical problems.
   - `eastern_diseases`: traditional disease names.
   - `tcm_patterns`: syndrome differentiation.
   - Relation tables connect overlap.
   - Fertility condition graph expansion is seeded in `data/pathology/condition_graph_expansion.json`.
   - `data/pathology/conditions.json` now syncs fertility-related Western conditions, Eastern disease categories, TCM pattern links, medication links, workflow links, and red flags.
3. Add Western medications as a separate English-first layer in `data/medications/`.
4. Build herb-drug and acupuncture-medication caution links only after source validation.
5. Build fertility workflow links first, because infertility care often needs acupuncture, herbs, Western diagnosis, Western medication, cycle timing, IUI/IVF coordination, and contraindication tracking.
   - Fertility workflow seed is in `data/clinical_cases/fertility_workflow_seed.json`.
   - Fertility-related medication records are seeded in `data/medications/western_medications.json`.
   - Workflow links include PCOS/ovulation induction, IUI, IVF stimulation/retrieval, and embryo transfer/luteal support.
6. Add Bastyr notes, personal notes, and social media ideas as separate personal layers.

## Phase 6: Clinical Case Notebook

1. Build `data/clinical_cases/` as a de-identified patient and case timeline layer.
2. Keep knowledge-base data separate from real case notes.
3. Link each case to:
   - Western conditions.
   - Eastern diseases.
   - TCM patterns.
   - Acupoints used per visit.
   - Formulas/herbs used per visit.
   - Western medications used during the same period.
   - Safety flags and contraindication checks.
4. Track outcomes over time using structured metrics, especially for fertility:
   - Cycle day and cycle phase.
   - Ovulation signs.
   - IUI/IVF phase.
   - Medication timing.
   - Symptoms, sleep, stress, digestion, pain, and adverse reactions.
5. Future UI goal: create a private case notebook with timeline view, visit entry form, and knowledge-base link picker.

## Phase 7: Billing and Insurance Coding Training

1. Build `data/billing/` as a documentation-to-coding training layer.
2. Keep SOAP notes, diagnosis codes, procedure/service codes, payer rules, and claim drafts separate.
3. Link billing drafts to visits after SOAP notes are completed.
4. Track documentation requirements:
   - Chief complaint.
   - Medical necessity support.
   - Services rendered.
   - Diagnosis code support.
   - Procedure code support.
   - Safety/contraindication review.
5. Store code systems and payer rules with effective dates, source references, and review dates.
6. Do not use billing drafts for real claim submission until validated by current official sources, clinic policy, supervisor, and billing staff.

## Phase 8: AcuTing Learn Public English Site

1. Build `data/learn/` as a public educational content layer separate from private AcuTing OS.
2. Use public Chinese TCM sites as category and page-structure inspiration only.
3. Rewrite and translate content into original English instead of copying full articles.
4. Cross-check each public page against:
   - WHO-style point-location standards.
   - NCCAOM content outline.
   - English patient-facing safety sources.
   - Evidence summaries and peer-reviewed literature when making condition claims.
   - Anatomy terminology sources.
5. Public content categories:
   - Acupuncture.
   - Master Tung / Tung points.
   - Auricular.
   - Herbs.
   - Formulas.
   - Conditions.
   - East-West Interactions.
   - NCCAOM / Learn.
6. Use `data/learn/public_knowledge_architecture.json` as the public site architecture seed:
   - Traditional acupuncture by channel, region, category, topic, and safety flag.
   - Tung points by zone, reaction area, clinical use, and technique.
   - Auricular points by anatomy, function, name, and code.
   - Formulas by category, pattern, condition, safety flag, and herb-drug caution.
7. Use `data/tung/` for Master Tung content:
   - `schema.json` defines Tung point fields.
   - `zones.json` defines 11, 22, 33, 44, 55, 66, 77, 88, 99, 1010, DT, and VT zone browsing.
   - Tung point content remains structure-only until source review.
8. Future UI goal: split the app into `AcuTing OS` private workspace and `AcuTing Learn` public-facing English website preview.

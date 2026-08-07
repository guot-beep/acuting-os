# Dataset Shortlist for AcuTing OS

Date: 2026-07-03  
Scope: shortlist only. No dataset has been downloaded or imported.

## Ground Rules

- Follow `docs/TCM_SOURCE_REGISTRY.md` section F: dataset foundation first, institution/library verification second, agent gap-filling last.
- Anything imported from open datasets must start as `review_status: "draft"`.
- Nothing can become `source_checked` until checked against institutional databases, WHO/textbook sources, or Ting-approved school materials.
- Network pharmacology and knowledge-graph relations are hypothesis/research layers. Wording must stay conservative: "research data suggests possible relation..." rather than treatment claims.
- This shortlist does not modify existing `data/` records.

## Quick Recommendation

| Priority | Dataset | Best Fit | Decision Needed |
|---|---|---|---|
| 1 | TCM-NER 中藥說明書實體識別 | CH herbs, Chinese patent medicine ingredients, effects, symptoms, contraindication vocabulary | Good first import candidate if Tianchi terms are acceptable. |
| 2 | TCM-QG 中醫文獻問題生成 | FOM/CH text snippets and QA pairs for study prompts, source vocabulary, classical/health-education excerpts | Useful for study/quiz layer, not canonical facts. |
| 3 | QASystemOnMedicalGraph | BIOM condition/symptom/drug relation draft layer | Useful for Western condition graph seeds only; license unclear. |
| 4 | Huatuo knowledge graph QA | BIOM broad QA relation mining, condition/drug/symptom search support | Apache-2.0, but too broad/noisy; use as lookup index, not clinical truth. |
| 5 | CMB Chinese-Medical-Benchmark | BIOM exam/case reasoning and possible case-workspace examples | Apache-2.0; useful for app testing and case/SOAP UX patterns, not TCM content. |
| Hold | Acupuncture / ACPL dataset from Mengqi index | ACPL | No direct acupuncture/acupoint dataset found in the README index. Use existing 361 + WHO/manual/institutional sources instead. |
| Hold | 中醫方劑知識庫 | Formulas | Mentioned in local registry F, but not confirmed inside Mengqi README. Need separate source/license check before import. |

## Candidate Details

### 1. TCM-NER 中藥說明書實體識別資料集

- Source index: `Mengqi97/chinese-medical-dataset`, section 13.
- Upstream: Tianchi dataset 86819.
- Dataset type: entity recognition over Chinese medicine package inserts.
- Size in index: 1,996 records.
- Format shown in README: JSON with `text` plus `annotations[]`.
- Fields visible in sample: `药品`, `药物成分`, `药物剂型`, `药物性味`, `中药功效`, `症状`, `人群`, `食物`, `食物分组`.
- Best fit:
  - CH herbs / Chinese patent medicine terminology.
  - Formula safety vocabulary and herb-drug/food caution prompts.
  - Draft extraction of ingredients, effects, symptoms, contraindication wording.
- Not good for:
  - Classical formula canon.
  - NCCAOM-ready formula actions.
  - Acupoints.
- License/access:
  - README links to Tianchi dataset page.
  - License not shown in Mengqi README. Must verify Tianchi terms before downloading.
- Import recommendation:
  - If approved, download raw files to `data/imports/tcm_ner/`.
  - Create normalized draft extracts under a new reviewed staging file, not directly into existing herbs/formulas.

### 2. TCM-QG 中醫文獻問題生成資料集

- Source index: `Mengqi97/chinese-medical-dataset`, section 14.
- Upstream: Tianchi dataset 86895.
- Dataset type: Chinese medicine text + manually annotated question/answer pairs.
- Size in index: 5,881 QA pairs from 3,500 text documents.
- Format shown in README: JSON-like records with `id`, `text`, question/answer annotations.
- Source texts named in README: `黃帝內經翻譯版`, `名醫百科中醫篇`, `中成藥用藥卷`, `慢性病養生保健科普知識`.
- Best fit:
  - FOM study prompts.
  - CH study/quiz content.
  - Draft glossary and educational QA generation.
  - Possible patient-education language after rewrite and review.
- Not good for:
  - Canonical formula composition.
  - Clinical decision rules.
  - Public content without rewrite/source review.
- License/access:
  - README links to Tianchi dataset page.
  - License not shown in Mengqi README. Must verify Tianchi terms before downloading.
- Import recommendation:
  - Keep as study/quiz source only.
  - Do not mix directly into `data/herbs/formulas.json` or clinical cases.

### 3. QASystemOnMedicalGraph

- Source index: `Mengqi97/chinese-medical-dataset`, section 10.
- Upstream: `zhihao-chen/QASystemOnMedicalGraph`.
- Dataset type: medical knowledge graph and QA system resources.
- Entities in index/upstream:
  - Disease 14,336
  - Alias 8,877
  - Symptom 5,622
  - Complication 3,201
  - Drug 4,625
  - Total entities 36,825
- Relations in index/upstream:
  - `HAS_SYMPTOM`, `HAS_DRUG`, complications, department, body part, aliases.
  - Upstream README says about 210,018 relations.
- Formats:
  - Vocabulary `.txt` files.
  - `disease.csv`.
  - Python/Neo4j project files.
- Best fit:
  - BIOM condition graph draft seeds.
  - Western condition aliases/symptom relations.
  - Patient-case search tags and red-flag vocabulary, after review.
- Not good for:
  - TCM pattern diagnosis.
  - Formula/herb truth.
  - Acupuncture content.
- License/access:
  - No explicit license visible from the GitHub page during this review.
  - Use only after license/terms are accepted by Ting.
- Import recommendation:
  - If approved, import only a small filtered condition/symptom subset first.
  - Mark all imported relations `review_status: "draft"` and `source_type: "open_kg_unverified"`.

### 4. Huatuo knowledge graph QA

- Source index: `Mengqi97/chinese-medical-dataset`, section 2.
- Upstream: Hugging Face `FreedomIntelligence/huatuo_knowledge_graph_qa`.
- Dataset type: QA pairs generated from medical knowledge graph entries.
- Size:
  - Mengqi index: 798,444.
  - Hugging Face viewer: default 798k rows, train/validation/test splits.
- Format:
  - Hugging Face page marks format as JSON.
  - Columns shown: `questions` sequence, `answers` sequence.
- License:
  - Hugging Face page lists `apache-2.0`.
- Best fit:
  - Broad BIOM lookup/search support.
  - Draft relation discovery for diseases, symptoms, drugs, tests.
  - Possible autocomplete/search synonyms after filtering.
- Not good for:
  - Authoritative clinical recommendations.
  - TCM formulas or acupoints.
  - Direct patient-facing content.
- Import recommendation:
  - Use only after a filter plan exists, because the dataset is broad/noisy.
  - Prefer deriving vocabulary/search indexes over importing long QA text.

### 5. CMB Chinese-Medical-Benchmark

- Source index: `Mengqi97/chinese-medical-dataset`, section 1.
- Upstream: `FreedomIntelligence/CMB`.
- Dataset type: Chinese medical exam benchmark and clinical cases.
- Size in Mengqi index:
  - CMB-Exam train/valid/test: 269,359 / 280 / 11,200.
  - CMB-Clin: 74 complex medical inquiries.
- Format:
  - GitHub/HuggingFace dataset loading.
  - Exam JSON-like records with `exam_type`, `exam_class`, `exam_subject`, `question`, `answer`, `question_type`, `option`.
  - Clinical case records with `title`, `description`, `QA_pairs`.
- License:
  - Upstream GitHub shows Apache-2.0.
- Best fit:
  - BIOM study/testing layer.
  - Case-workspace UX test examples after de-identification and rewrite.
  - Possible internal QA benchmark for app retrieval.
- Not good for:
  - TCM-specific knowledge.
  - Formula/herb/acupoint canonical content.
- Import recommendation:
  - Do not import into clinical case data as real cases.
  - Could later use a tiny transformed subset for UI smoke tests or quiz mode.

### 6. QABasedOnMedicalKnowledgeGraph

- Source index: `Mengqi97/chinese-medical-dataset`, section 9.
- Dataset type: broad medical knowledge graph entities and relation JSON.
- Entity examples in index:
  - Drug 3,828
  - Food 4,870
  - Producer 17,201
  - Symptom 5,998
  - Total entities around 44,111
- Relations:
  - `medical.json` with 8,808 records.
- Format:
  - `.txt` entity vocabulary files.
  - JSON relation records.
- Best fit:
  - BIOM condition/supporting vocabulary.
  - Food/drug/symptom relation exploration.
- Not good for:
  - TCM theory.
  - Classical formula content.
  - Clinical advice.
- License/access:
  - License not clearly visible from the Mengqi README snapshot.
- Import recommendation:
  - Lower priority than QASystemOnMedicalGraph and Huatuo KG QA.

### 7. 面向家庭常見疾病的知識圖譜

- Source index: `Mengqi97/chinese-medical-dataset`, section 19.
- Dataset type: common-disease knowledge graph.
- Size in index:
  - Entities 62,196.
  - Relations 543,673.
- Format:
  - Neo4j dump.
  - README says the index maintainer exported `entity.json` and `relation.json` via Baidu link.
- Data sources named in README:
  - `尋醫問藥` website.
  - 2020 CHIP Chinese medical text entity relation extraction source.
- Best fit:
  - BIOM condition/symptom/drug draft graph.
  - Search vocabulary, not clinical content.
- Not good for:
  - TCM content.
  - Public advice.
- License/access:
  - License not clearly visible. Data source terms need review.
- Import recommendation:
  - Hold unless Ting wants broad Western disease search support.

## Category Mapping

| AcuTing Area | Best Dataset Candidates | Recommendation |
|---|---|---|
| 方劑 Formulas | TCM-QG as study text only; TCM-NER for Chinese patent medicine signals; separate `中醫方劑知識庫` needed for formula canon | Do not import formulas yet from Mengqi alone. First verify the separate formula knowledge-base source/license. |
| 中藥 Herbs / Chinese patent medicine | TCM-NER, TCM-QG, Huatuo KG QA | Start with TCM-NER if Tianchi terms allow. Cross-check with HKBU/PolyU/CUHK institutional databases before source_checked. |
| 病症 Conditions / BIOM | QASystemOnMedicalGraph, Huatuo KG QA, CMB, common disease KG | Start small with QASystem condition/symptom vocabulary if license is acceptable. Keep relations draft. |
| 穴位 Acupoints / ACPL | No direct Mengqi candidate found | Keep current path: WHO/manual/institutional sources + existing 361 data. Use Chinese websites only as secondary cross-check. |
| FOM theory / study prompts | TCM-QG, CMB-Exam | Use for quiz/study prompts only; do not treat as canonical theory without source review. |

## Proposed Next Step After Ting Approval

1. Confirm licenses/terms for Tianchi TCM-NER and TCM-QG.
2. Decide whether to allow GitHub repos with unclear license into `data/imports/` as private draft-only raw material.
3. If approved, create `data/imports/README.md` with import rules, then download only the selected dataset(s).
4. Generate a raw import manifest with source URL, license/terms status, downloaded date, file hashes, and intended AcuTing target.
5. Do not transform into app data until Ting approves the manifest.

## Sources Reviewed

- `docs/TCM_SOURCE_REGISTRY.md`, section F.
- Mengqi97/chinese-medical-dataset README: https://github.com/Mengqi97/chinese-medical-dataset
- CMB upstream: https://github.com/FreedomIntelligence/CMB
- Huatuo KG QA: https://huggingface.co/datasets/FreedomIntelligence/huatuo_knowledge_graph_qa
- QASystemOnMedicalGraph upstream: https://github.com/zhihao-chen/QASystemOnMedicalGraph
- Tianchi TCM-NER page: https://tianchi.aliyun.com/dataset/86819
- Tianchi TCM-QG page: https://tianchi.aliyun.com/dataset/86895

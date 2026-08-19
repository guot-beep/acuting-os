# CR-010 Common-300 Detail Batch 04 — SOL

**Status:** RESEARCH STAGING / NOT CANONICAL / NO PHI  
**Source commit:** `aa170b9`  
**Selection:** exact live `DETAIL_PARTIAL` ranks **16–30**, continuing after Batch 03.  

## Exact live order

| Rank | ID | Condition | Score | Action |
|---:|---|---|---:|---|
| 16 | `cond.pid_chronic` | 慢性骨盆腔炎後遺 / Chronic Pelvic Inflammatory Disease Sequelae | 5 | fill pathology/etiology/risk/sources/relations |
| 17 | `cond.piriformis_syndrome` | 梨狀肌症候群 / Piriformis Syndrome | 5 | fill pathology/etiology/risk/sources/relations |
| 18 | `cond.pmdd` | 經前不悅症 / Premenstrual Dysphoric Disorder | 5 | fill pathology/etiology/risk/sources/relations |
| 19 | `cond.postpartum_hypolactation` | 產後缺乳 / Postpartum Lactation Insufficiency | 5 | fill pathology/etiology/risk/sources/relations |
| 20 | `cond.rotator_cuff` | 旋轉肌袖肌腱病變 / Rotator Cuff Tendinopathy | 5 | fill pathology/etiology/risk/sources/relations |
| 21 | `cond.secondary_dysmenorrhea` | 繼發性痛經 / Secondary Dysmenorrhea | 5 | fill pathology/etiology/risk/sources/relations |
| 22 | `cond.vulvovaginal_candidiasis` | 外陰陰道念珠菌症 / Vulvovaginal Candidiasis | 5 | fill pathology/etiology/risk/sources/relations |
| 23 | `cond.whiplash` | 揮鞭樣損傷 / Whiplash-Associated Disorder | 5 | fill pathology/etiology/risk/sources/relations |
| 24 | `cond.ankle_sprain` | 踝關節扭傷 / Ankle Sprain | 6 | preserve core; fill sources/relations only |
| 25 | `cond.chronic_pelvic_pain` | 慢性骨盆痛 / Chronic Pelvic Pain | 6 | preserve core; fill sources/relations only |
| 26 | `cond.cluster_headache` | 叢集性頭痛 / Cluster Headache | 6 | preserve core; fill sources/relations only |
| 27 | `cond.de_quervain_tenosynovitis` | 狄奎凡氏腱鞘炎 / De Quervain Tenosynovitis | 6 | preserve core; fill sources/relations only |
| 28 | `cond.female_infertility` | 女性不孕 / Female Infertility | 6 | preserve core; fill sources/relations only |
| 29 | `cond.male_infertility` | 男性不孕 / Male Infertility | 6 | preserve core; fill sources/relations only |
| 30 | `cond.myofascial_pain_syndrome` | 肌筋膜疼痛症候群 / Myofascial Pain Syndrome | 6 | preserve core; fill sources/relations only |

## Discipline

- All records are `EXISTING_ENRICH`; no new canonical IDs.
- Exact live IDs preserved: `cond.pmdd`, `cond.postpartum_hypolactation`, `cond.rotator_cuff`.
- Ranks 24–30 explicitly preserve existing pathology/etiology/risk content.
- `cond.chronic_pelvic_pain` has 11 unresolved crossrefs; no auto-resolution.
- TCM seeds remain `needs_textbook_source_review` and are not automatic merge targets.
- Western condition, TCM disease, and TCM pattern remain separate graph identities.

## Cards

### 16. 慢性骨盆腔炎後遺 | Chronic Pelvic Inflammatory Disease Sequelae

**ID:** `cond.pid_chronic`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 既往上生殖道發炎後可留下輸卵管損傷／沾黏、慢性骨盆痛、不孕或子宮外孕風險；此標籤不代表仍有活動性感染。

**Etiology candidate:** 起始背景為既往 PID；淋病與披衣菌重要，但 PID 可為多微生物性。

**TCM seed, textbook review required:** 下焦濕熱餘邪、氣滯、血瘀或虛實夾雜候選；需依現況辨證。

**Identity note:** Sequela identity; do not infer active infection.

**Sources:**
- CDC — Pelvic Inflammatory Disease (PID) - STI Treatment Guidelines: https://www.cdc.gov/std/treatment-guidelines/pid.htm

### 17. 梨狀肌症候群 | Piriformis Syndrome

**ID:** `cond.piriformis_syndrome`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 具爭議性的深臀區坐骨神經刺激／壓迫概念；常見臀痛、久坐誘發與深臀壓痛，但診斷標準未完全一致。

**Etiology candidate:** 提出機轉包括非椎間盤來源坐骨神經壓迫、局部解剖、外傷或反覆負荷，尚無單一確立機轉。

**TCM seed, textbook review required:** 經筋痹阻、氣血不暢、血瘀候選；神經定位仍屬西醫評估。

**Identity note:** Controversial diagnosis; preserve uncertainty.

**Sources:**
- PubMed systematic review — Four symptoms define the piriformis syndrome: https://pubmed.ncbi.nlm.nih.gov/28836092/

### 18. 經前不悅症 | Premenstrual Dysphoric Disorder

**ID:** `cond.pmdd`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 嚴重週期性經前疾患，情緒／行為／身體症狀隨月經週期出現並造成明顯困擾或功能受損。

**Etiology candidate:** 較可能是對正常卵巢類固醇波動的異常敏感與神經生物效應，而非單一結構病灶。

**TCM seed, textbook review required:** 肝鬱、肝脾不和、痰火、血虛或腎系候選，依週期與全身表現辨證。

**Identity note:** Specific cyclical disorder; not a loose PMS synonym.

**Sources:**
- ACOG — Management of Premenstrual Disorders: https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2023/12/management-of-premenstrual-disorders

### 19. 產後缺乳 | Postpartum Lactation Insufficiency

**ID:** `cond.postpartum_hypolactation`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 可指主觀或實際乳量／轉乳不足；需區分產乳不足與排乳／轉乳效率不佳，並同時評估母嬰。

**Etiology candidate:** 因素包括刺激／排乳不足、含乳或轉乳問題、泌乳延遲、母體生理／內分泌、部分藥物疾病與嬰兒因素。

**TCM seed, textbook review required:** 氣血不足、脾胃虛弱或肝鬱候選，依乳量、疲倦、情志、舌脈辨證。

**Identity note:** Infant intake/hydration/jaundice/weight trajectory is safety priority.

**Sources:**
- ACOG — Breastfeeding Challenges: https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2021/02/breastfeeding-challenges

### 20. 旋轉肌袖肌腱病變 | Rotator Cuff Tendinopathy

**ID:** `cond.rotator_cuff`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 旋轉肌袖肌腱疼痛／肌腱病變或肌腱炎，須與全層撕裂區分；反覆負荷可刺激肌腱與肩峰下結構。

**Etiology candidate:** 反覆過頭負荷、搬舉、年齡性退變與輕微外傷可參與。

**TCM seed, textbook review required:** 經筋痹阻、氣滯、血瘀或痹證候選，依起病、無力、寒熱與檢查辨證。

**Identity note:** Keep distinct from rotator-cuff tear.

**Sources:**
- AAOS / ASES — Shoulder Impingement/Rotator Cuff Tendinitis: https://orthoinfo.aaos.org/en/diseases--conditions/shoulder-impingementrotator-cuff-tendinitis

### 21. 繼發性痛經 | Secondary Dysmenorrhea

**ID:** `cond.secondary_dysmenorrhea`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 由生殖器官潛在疾病造成的經痛，不同於原發性經痛；可較早開始、持續更久或逐漸加重。

**Etiology candidate:** 原因可包括子宮內膜異位、腺肌症、肌瘤、PID 與部分結構／先天異常。

**TCM seed, textbook review required:** 氣滯、血瘀、寒凝、濕熱或虛證候選；西醫病因與中醫證型分開。

**Identity note:** Do not collapse into primary dysmenorrhea.

**Sources:**
- ACOG — Dysmenorrhea: Painful Periods: https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods

### 22. 外陰陰道念珠菌症 | Vulvovaginal Candidiasis

**ID:** `cond.vulvovaginal_candidiasis`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 多由 C. albicans 造成；搔癢、疼痛、排尿痛、性交痛與分泌物皆不具特異性，不能只靠症狀診斷。

**Etiology candidate:** Candida 造成症狀性感染；復發／複雜病例可涉及宿主因素或非 albicans 菌種，許多單純病例則無明確誘因。

**TCM seed, textbook review required:** 濕熱或虛證夾濕候選，依帶下、氣味、熱象、復發性與舌脈辨證。

**Identity note:** Usually not an STI; avoid STI inference from diagnosis alone.

**Sources:**
- CDC — Vulvovaginal Candidiasis - STI Treatment Guidelines: https://www.cdc.gov/std/treatment-guidelines/candidiasis.htm

### 23. 揮鞭樣損傷 | Whiplash-Associated Disorder

**ID:** `cond.whiplash`  
**Blockers:** `missing_western_pathology, missing_etiology, missing_risk_factors, missing_sources, missing_field_sources, structured_relation_gap`  

**Pathology candidate:** 加速－減速力量造成的頸椎及支持結構損傷；可有頸痛、僵硬、頭痛或神經症狀，但不能只用碰撞標籤推定嚴重度。

**Etiology candidate:** 最常見於汽車碰撞，也可見於跌倒、接觸運動或跳水。

**TCM seed, textbook review required:** 氣滯、血瘀、經筋損傷候選；神經與結構紅旗優先西醫評估。

**Identity note:** Trauma identity; preserve red-flag handling.

**Sources:**
- AAPM&R — Cervical Whiplash: https://now.aapmr.org/cervical-whiplash/

### 24. 踝關節扭傷 | Ankle Sprain

**ID:** `cond.ankle_sprain`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** AAOS supports ligament sprain, common inversion/lateral mechanism, prior-sprain recurrence risk, and chronic instability.

**TCM seed, textbook review required:** 氣血壅滯、血瘀、經筋損傷候選。

**Identity note:** Fill sources/relations only.

**Sources:**
- AAOS — Sprained Ankle: https://orthoinfo.aaos.org/en/diseases--conditions/sprained-ankle

### 25. 慢性骨盆痛 | Chronic Pelvic Pain

**ID:** `cond.chronic_pelvic_pain`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** ACOG supports a ≥6-month, often multifactorial syndrome spanning gynecologic, urinary, GI, musculoskeletal, and pain-processing contributors.

**TCM seed, textbook review required:** 氣滯、血瘀、濕熱、寒、虛或虛實夾雜候選。

**Identity note:** Umbrella syndrome; 11 unresolved crossrefs must not be auto-resolved.

**Sources:**
- ACOG — Chronic Pelvic Pain: https://www.acog.org/womens-health/faqs/chronic-pelvic-pain

### 26. 叢集性頭痛 | Cluster Headache

**ID:** `cond.cluster_headache`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** ICHD-3 is the diagnostic/classification anchor and supports placement among trigeminal autonomic cephalalgias.

**TCM seed, textbook review required:** 經絡、肝、痰、火、血瘀或虛證候選，與 ICHD 診斷分開。

**Identity note:** Preserve existing pathology/etiology.

**Sources:**
- IHS / ICHD-3 — 3.1 Cluster headache: https://ichd-3.org/3-trigeminal-autonomic-cephalalgias/3-1-cluster-headache/

### 27. 狄奎凡氏腱鞘炎 | De Quervain Tenosynovitis

**ID:** `cond.de_quervain_tenosynovitis`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** AAOS supports APL/EPB tendon-sheath irritation, pregnancy/postpartum association, and thumb/wrist loading as symptom aggravators.

**TCM seed, textbook review required:** 經筋痹阻、氣滯或血瘀候選。

**Identity note:** Preserve existing core detail.

**Sources:**
- AAOS — De Quervain's Tenosynovitis: https://orthoinfo.aaos.org/en/diseases--conditions/de-quervains-tendinosis/

### 28. 女性不孕 | Female Infertility

**ID:** `cond.female_infertility`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** ASRM supports a multifactorial evaluation including ovulation, reproductive-tract structure/patency, age/context, and semen evaluation when applicable.

**TCM seed, textbook review required:** 無固定單一證型；腎、沖任、肝、脾、氣血、痰濕、寒熱、瘀依個案判斷。

**Identity note:** Multifactorial umbrella; do not equate with one cause.

**Sources:**
- ASRM — Fertility evaluation of infertile women: committee opinion: https://www.asrm.org/practice-guidance/practice-committee-documents/fertility-evaluation-of-infertile-women-a-committee-opinion-2021/

### 29. 男性不孕 | Male Infertility

**ID:** `cond.male_infertility`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** AUA/ASRM guideline hosted by ASRM supports reproductive history, semen analysis, directed evaluation, and concurrent couple assessment.

**TCM seed, textbook review required:** 無固定單一證型；腎精、腎陰陽、肝氣、濕熱、痰、氣血與瘀依個案判斷。

**Identity note:** Multifactorial umbrella; preserve existing core detail.

**Sources:**
- ASRM / AUA — Diagnosis and treatment of infertility in men: guideline part I: https://www.asrm.org/practice-guidance/practice-committee-documents/diagnosis-and-treatment-of-infertility-in-men-auaasrm-guideline-part-i-2020/

### 30. 肌筋膜疼痛症候群 | Myofascial Pain Syndrome

**ID:** `cond.myofascial_pain_syndrome`  
**Blockers:** `missing_sources, missing_field_sources, structured_relation_gap`  

**Core-detail action:** preserve current pathology/etiology/risk factors.

**Source support:** AAPM&R describes regional myofascial pain/trigger-point features and chronic stretch/overload contributors; diagnostic/mechanistic uncertainty remains.

**TCM seed, textbook review required:** 氣滯、血瘀、經筋痹阻、痹證或虛證候選。

**Identity note:** Mechanisms/criteria debated; do not portray trigger points as a uniquely proven lesion.

**Sources:**
- AAPM&R — Myofascial Pain: https://now.aapmr.org/myofascial-pain/

# CR-010 Common-300 Detail Batch 03 — SOL

**Status:** RESEARCH STAGING / NOT CANONICAL / NO PHI  
**Source commit:** `aa170b9`  
**Selection:** first 15 `DETAIL_PARTIAL` records in the true live queue, preserving queue order.  

## Live state used

- full-detail: **77**
- partial: **85**
- skeleton: **343**
- source-reuse assets scanned: **1106**

## Merge contract

- All 15 are `EXISTING_ENRICH`.
- Preserve current `summary`, `western_context`, `red_flags`, and `acupuncture_scope` by default.
- Target the missing fields: `western_pathology`, `etiology`, `risk_factors`, `sources`, `field_sources`, `structured relations`.
- Every selected ID returned high-confidence reuse in the live reuse map, so prior assets must be reviewed before adding text.
- TCM material remains `needs_textbook_source_review`; no Western↔TCM equality.

## Exact live PARTIAL order

| Rank | ID | Condition | Live score |
|---:|---|---|---:|
| 1 | `cond.achilles_tendinopathy` | 阿基里斯腱病變 / Achilles Tendinopathy | 5/12 |
| 2 | `cond.acute_lumbar_sprain` | 急性腰扭傷 / Acute Lumbar Sprain | 5/12 |
| 3 | `cond.amenorrhea` | 繼發性閉經 / Secondary Amenorrhea | 5/12 |
| 4 | `cond.breech_presentation` | 胎位不正（艾灸文件情境） / Breech Presentation (moxibustion context) | 5/12 |
| 5 | `cond.diminished_ovarian_reserve` | 卵巢儲備功能下降 / Diminished Ovarian Reserve | 5/12 |
| 6 | `cond.hip_osteoarthritis` | 髖骨關節炎 / Hip Osteoarthritis | 5/12 |
| 7 | `cond.hyperemesis_gravidarum` | 妊娠劇吐（文件情境） / Nausea of Pregnancy / Hyperemesis (context) | 5/12 |
| 8 | `cond.ivf_support` | 試管嬰兒療程輔助（文件情境） / IVF/ART Adjunctive Support (context) | 5/12 |
| 9 | `cond.lateral_epicondylitis` | 網球肘 / Lateral Epicondylitis (Tennis Elbow) | 5/12 |
| 10 | `cond.luteal_phase_defect` | 黃體功能不足（文件情境） / Luteal Phase Deficiency (context) | 5/12 |
| 11 | `cond.medial_epicondylitis` | 高爾夫球肘 / Medial Epicondylitis (Golfer's Elbow) | 5/12 |
| 12 | `cond.meniscus_injury` | 半月板損傷（文件情境） / Meniscus Injury (context) | 5/12 |
| 13 | `cond.menopause_syndrome` | 更年期症候群 / Menopausal Syndrome | 5/12 |
| 14 | `cond.menorrhagia` | 月經過多 / Heavy Menstrual Bleeding | 5/12 |
| 15 | `cond.neck_pain_stiff` | 急性頸痛／落枕 / Acute Neck Pain / Stiff Neck | 5/12 |

## Research cards

### 1. 阿基里斯腱病變 | Achilles Tendinopathy

**ID:** `cond.achilles_tendinopathy`  
**Western pathology:** 反覆負荷可造成阿基里斯腱微小損傷、增厚、疼痛與承載能力下降；持續性病例屬慢性肌腱病變，不宜只視為一次性發炎。

**Etiology:** 多與累積性機械負荷，或活動需求突然超過肌腱可承受能力有關。

**Risk factors:** 跑跳或其他反覆肌腱負荷；訓練量或強度快速增加；反覆負荷之間恢復不足

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子：局部肌腱疼痛與僵硬可依起病、外傷、寒熱與檢查，考慮經筋痹阻、氣血不暢或瘀血等候選機轉。

**Sources:**
- AAOS — Sprains, Strains, and Other Soft-Tissue Injuries: https://orthoinfo.aaos.org/en/diseases--conditions/sprains-strains-and-other-soft-tissue-injuries

### 2. 急性腰扭傷 | Acute Lumbar Sprain

**ID:** `cond.acute_lumbar_sprain`  
**Western pathology:** 急性腰扭傷／拉傷是腰部韌帶、肌肉或肌腱的突然軟組織損傷，可造成局部疼痛、痙攣與活動受限，但本身不代表神經根或脊椎結構性疾病。

**Etiology:** 常見機轉包括突然搬重物、扭轉、跌倒或其他使腰部軟組織過度牽拉的急性負荷。

**Risk factors:** 突然搬重物或不良姿勢搬運；軀幹快速扭轉；運動或工作中的突發高負荷；身體承載能力不足或去訓練化可能增加易感性

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子：急性機械性腰傷可考慮氣滯血瘀、經筋損傷等候選機轉；若有紅旗仍以西醫評估優先。

**Sources:**
- AAOS — Sprains, Strains, and Other Soft-Tissue Injuries: https://orthoinfo.aaos.org/en/diseases--conditions/sprains-strains-and-other-soft-tissue-injuries
- NCCIH/NIH — Low-Back Pain and Complementary Health Approaches: https://www.nccih.nih.gov/health/low-back-pain-and-complementary-health-approaches-what-you-need-to-know

### 3. 繼發性閉經 | Secondary Amenorrhea

**ID:** `cond.amenorrhea`  
**Western pathology:** 繼發性閉經是原本已有月經後停止月經，屬多病因臨床表現，可來自生殖、內分泌、下視丘－腦下垂體、全身疾病、藥物或生理因素，而非單一病理機轉。

**Etiology:** 首先需排除懷孕；其他原因包括低體重或快速減重、飲食疾患、下視丘或腦下垂體問題、PCOS、甲狀腺疾病、原發性卵巢功能不全、壓力、慢性疾病，以及部分藥物或荷爾蒙避孕。

**Risk factors:** 低體重或快速減重；飲食疾患或過度運動；高度生理／心理壓力；PCOS、甲狀腺或腦下垂體疾病；原發性卵巢功能不全；特定慢性疾病或藥物

**TCM differential seed, textbook review required:** 僅作辨證研究種子。西醫繼發性閉經可與中醫閉經病名重疊，但仍需依個案辨證，可考慮腎虛、血虛、痰濕、血瘀或肝鬱等候選證機。

**Sources:**
- ACOG — Amenorrhea: Absence of Periods: https://www.acog.org/womens-health/faqs/amenorrhea-absence-of-periods

### 4. 胎位不正（艾灸文件情境） | Breech Presentation (moxibustion context)

**ID:** `cond.breech_presentation`  
**Western pathology:** 臀位屬胎兒先露方式，不是孕婦本身的疾病：接近足月時由臀部、足部或兩者先朝向產道，而不是頭部先露。

**Etiology:** 原因常無法確定；相關因素可包括多胎妊娠、羊水過多或過少、子宮形態異常或肌瘤，以及既往妊娠。

**Risk factors:** 多胎妊娠；羊水過多或過少；子宮形態異常或肌瘤；既往妊娠

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。傳統胎位不正與艾灸的討論只能作輔助，不能取代產科評估、孕週條件與分娩計畫。

**Identity note:** Obstetric presentation/context identity, not a disease process.

**Sources:**
- ACOG — If Your Baby Is Breech: https://www.acog.org/womens-health/faqs/if-your-baby-is-breech

### 5. 卵巢儲備功能下降 | Diminished Ovarian Reserve

**ID:** `cond.diminished_ovarian_reserve`  
**Western pathology:** 卵巢儲備功能下降主要描述剩餘卵母細胞數量或預期卵巢反應下降。卵巢儲備指標可預估刺激反應與取卵數，但不能獨立準確預測自然生育能力或活產。

**Etiology:** 卵母細胞數量會隨生殖老化下降，但同年齡個體間差異很大；DOR 也可在既往卵巢刺激反應不佳或儲備檢測異常時被辨識。

**Risk factors:** 生殖年齡增加；既往卵巢刺激反應不佳；AMH 偏低或 AFC 偏低等卵巢儲備檢測異常，需置於臨床情境解讀

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。DOR 不可直接等同單一「腎虛」；仍需依年齡、月經、體質、舌脈與共存因素考慮腎精不足、腎陰／腎陽、血虛或瘀血等候選證機。

**Sources:**
- ASRM — Testing and interpreting measures of ovarian reserve: a committee opinion: https://www.asrm.org/practice-guidance/practice-committee-documents/testing-and-interpreting-measures-of-ovarian-reserve-a-committee-opinion-2020/

### 6. 髖骨關節炎 | Hip Osteoarthritis

**ID:** `cond.hip_osteoarthritis`  
**Western pathology:** 髖骨關節炎是退化性關節疾病，關節軟骨逐漸磨損，可出現關節間隙變窄、表面粗糙與骨贅形成，進而造成疼痛與活動受限。

**Etiology:** 沒有單一病因，退化通常由年齡相關變化、機械負荷、遺傳與既往關節損傷等因素共同作用。

**Risk factors:** 年齡增加；骨關節炎家族史；既往髖關節損傷；肥胖；髖關節發育不良或先天結構異常

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。髖 OA 可在症狀層面與痹證重疊，但不能固定等同單一證型；仍應依病程、重著、寒熱、虛弱與瘀象辨證。

**Sources:**
- AAOS — Osteoarthritis of the Hip: https://orthoinfo.aaos.org/en/diseases--conditions/osteoarthritis-of-the-hip/

### 7. 妊娠劇吐（文件情境） | Nausea of Pregnancy / Hyperemesis (context)

**ID:** `cond.hyperemesis_gravidarum`  
**Western pathology:** 妊娠劇吐是妊娠噁心嘔吐的重症端，可造成明顯體重下降、脫水、電解質異常與營養缺乏。

**Etiology:** 確切病因屬多因素且尚未完全釐清；妊娠相關生物因素與個體易感性共同作用，持續嘔吐本身會造成脫水及代謝／營養併發症。

**Risk factors:** 既往妊娠曾有妊娠劇吐；多胎妊娠；族群研究亦發現較年輕孕齡與部分既存疾病相關

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。妊娠劇吐可與傳統妊娠惡阻病名有重疊，但仍需依實際表現辨證，可考慮胃氣上逆、痰濕、肝胃不和或脾胃虛弱等候選證機。

**Identity note:** Pregnancy complication/context. Conventional obstetric assessment takes priority for dehydration, weight loss, electrolyte disturbance, or inability to maintain intake.

**Sources:**
- ACOG — Morning Sickness: Nausea and Vomiting of Pregnancy: https://www.acog.org/womens-health/faqs/morning-sickness-nausea-and-vomiting-of-pregnancy
- PubMed / Acta Obstetricia et Gynecologica Scandinavica — Risk factors and recurrence of hyperemesis gravidarum: population-based cohort: https://pubmed.ncbi.nlm.nih.gov/39258527/

### 8. 試管嬰兒療程輔助（文件情境） | IVF/ART Adjunctive Support (context)

**ID:** `cond.ivf_support`  
**Western pathology:** 此紀錄代表 IVF／ART 周邊的輔助照護情境，而不是疾病。IVF 涉及控制性卵巢刺激、取卵、受精／胚胎培養與胚胎移植，因此「IVF 輔助」本身沒有單一病理機轉。

**Etiology:** 其病因應歸屬於接受 IVF 的不孕原因與療程背景，而不是「輔助照護」這個標籤本身。

**Risk factors:** 風險取決於原發不孕診斷、卵巢反應、年齡、療程方案與程序相關因素；不可僅從 IVF 輔助情境反推不孕原因

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。IVF 輔助照護沒有固定中醫證型，必須依個人的月經、體質、情志、睡眠、消化與療程階段實際資料辨證。

**Identity note:** Context identity, not a disease. ASRM reports fair evidence that acupuncture around embryo transfer does not improve IVF live-birth rates; do not claim fertility-outcome enhancement.

**Sources:**
- ASRM — Performing the embryo transfer: a guideline: https://www.asrm.org/practice-guidance/practice-committee-documents/performing-the-embryo-transfer-a-guideline-2017/

### 9. 網球肘 | Lateral Epicondylitis (Tennis Elbow)

**ID:** `cond.lateral_epicondylitis`  
**Western pathology:** 外上髁炎（網球肘）是外側肘部共同伸肌腱起點的過度使用性肌腱病，反覆微小損傷與肌腱退變／刺激造成負荷相關的外側肘痛。

**Etiology:** 反覆腕伸與抓握負荷若超過肌腱恢復能力即可發生，並不限於網球運動。

**Risk factors:** 反覆抓握或腕伸活動；職業或運動性過度使用；中年族群常見；前臂反覆負荷後恢復不足

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。肘外側局部痛可依痛性、外傷／過用、寒熱與檢查考慮經筋痹阻、氣滯、血瘀或痹證等候選機轉。

**Sources:**
- AAOS — Tennis Elbow (Lateral Epicondylitis): https://orthoinfo.aaos.org/en/diseases--conditions/tennis-elbow-lateral-epicondylitis/

### 10. 黃體功能不足（文件情境） | Luteal Phase Deficiency (context)

**ID:** `cond.luteal_phase_defect`  
**Western pathology:** 黃體期功能不足是一個仍具爭議的臨床概念，涉及黃體期長度或黃體酮支持異常。ASRM 強調目前沒有單一可靠的臨床確診檢驗，也未證實孤立性 LPD 能獨立造成不孕或反覆流產。

**Etiology:** 黃體功能異常可能繼發於影響促性腺激素分泌、濾泡發育、黃體功能或子宮內膜對黃體酮反應的各種狀況。

**Risk factors:** 下視丘－腦下垂體或其他內分泌異常；哺乳或會改變生殖荷爾蒙的特定疾病；肥胖與較高生殖年齡和黃體功能變化有關，但因果與臨床意義需個別判斷

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。這個具爭議的西醫概念不可直接轉成固定中醫證型；應依月經時序、量色、寒熱、疼痛、睡眠、體質、舌脈等再鑑別腎、脾、肝、血虛或血瘀等候選證機。

**Identity note:** Contested clinical construct; preserve ASRM uncertainty in the canonical card.

**Sources:**
- ASRM — Diagnosis and treatment of luteal phase deficiency: committee opinion: https://www.asrm.org/practice-guidance/practice-committee-documents/diagnosis-and-treatment-of-luteal-phase-deciency-a-committee-opinion-2021/

### 11. 高爾夫球肘 | Medial Epicondylitis (Golfer's Elbow)

**ID:** `cond.medial_epicondylitis`  
**Western pathology:** 內上髁炎（高爾夫球肘）是肘內側共同屈肌－旋前肌腱起點的過度使用性肌腱病，反覆負荷可損傷肌腱纖維並造成肘內側疼痛與壓痛。

**Etiology:** 反覆前臂屈曲、旋前、抓握、揮桿或搬運動作可使肌腱過載，高爾夫只是可能暴露之一。

**Risk factors:** 反覆抓握與腕屈／旋前工作；高爾夫或其他反覆前臂運動；職業性過度使用；反覆負荷間恢復不足

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。肘內側疼痛可依受傷機轉與整體表現考慮經筋痹阻、氣滯、血瘀或痹證等候選證機。

**Sources:**
- AAOS — Golf Injury Prevention – Golfer's Elbow section: https://orthoinfo.aaos.org/staying-healthy/golf-injury-prevention
- AAOS — Sprains, Strains, and Other Soft-Tissue Injuries: https://orthoinfo.aaos.org/en/diseases--conditions/sprains-strains-and-other-soft-tissue-injuries

### 12. 半月板損傷（文件情境） | Meniscus Injury (context)

**ID:** `cond.meniscus_injury`  
**Western pathology:** 半月板損傷是膝關節纖維軟骨撕裂或結構性受損；半月板負責分散負荷並協助穩定關節。損傷可為急性外傷性，也可為組織老化相關的退化性撕裂。

**Etiology:** 急性撕裂常見於轉身、切入或其他扭轉性損傷；退化的半月板隨年齡失去韌性後，較輕微的扭轉也可能造成撕裂。

**Risk factors:** 轉身／切入類運動或扭轉外傷；接觸性或非接觸性膝傷；年齡增加與半月板退化；可合併 ACL 等膝部損傷

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。外傷性膝痛腫可考慮氣血壅滯或血瘀；慢性退化性表現還可能涉及痹證或虛證候選，但半月板撕裂不可直接等同單一中醫證型。

**Sources:**
- AAOS — Meniscus Tears: https://orthoinfo.aaos.org/en/diseases--conditions/meniscus-tears/

### 13. 更年期症候群 | Menopausal Syndrome

**ID:** `cond.menopause_syndrome`  
**Western pathology:** 更年期轉變與卵巢荷爾蒙產生下降及波動有關，直到月經永久停止；可能出現血管舒縮、睡眠、情緒、泌尿生殖與月經型態改變，個體差異很大。

**Etiology:** 自然生殖老化與卵巢濾泡功能逐步下降推動此轉變；症狀部分來自雌激素變化及相關神經內分泌效應。

**Risk factors:** 隨年齡進入更年期轉變；症狀負擔個體差異大；手術或治療造成的卵巢功能喪失屬不同或加速的臨床情境

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。更年期症狀可與「絕經前後諸證」重疊，但證型仍須個別辨證，可考慮腎陰／腎陽不足、心腎不交、肝鬱、痰或瘀等候選證機。

**Sources:**
- ACOG — The Menopause Years: https://www.acog.org/womens-health/faqs/the-menopause-years

### 14. 月經過多 | Heavy Menstrual Bleeding

**ID:** `cond.menorrhagia`  
**Western pathology:** 月經過多屬異常子宮出血，指月經出血量或持續時間過多而影響健康或日常生活；它是多病因的出血表現，不是單一病理機轉。

**Etiology:** 可能原因包括排卵功能異常、子宮肌瘤或息肉、子宮腺肌症、出血性疾病、藥物以及其他子宮／內分泌因素；妊娠相關出血需走不同評估路徑。

**Risk factors:** 青春期或圍更年期排卵不規則；子宮肌瘤／息肉或腺肌症；出血性疾病；影響出血的藥物；新出現的大量出血需依個別情境評估

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。月經過多可與中醫「月經過多」病名重疊，但實際證型仍可包括脾氣不攝、血熱、血瘀或腎虛等，需依時序、色質、血塊、疼痛、舌脈判斷。

**Sources:**
- ACOG — Abnormal Uterine Bleeding: https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding

### 15. 急性頸痛／落枕 | Acute Neck Pain / Stiff Neck

**ID:** `cond.neck_pain_stiff`  
**Western pathology:** 急性頸痛與僵硬可來自頸部肌肉或韌帶拉傷／扭傷及其他機械性軟組織刺激；此症狀性診斷本身不能直接確定來源是肌肉、韌帶、椎間盤、關節、神經根或其他疾病。

**Etiology:** 常見機械誘因包括頸部突然異常屈伸／扭轉、跌倒、碰撞／揮鞭樣損傷，或持續姿勢負荷；部分患者另有頸椎退化性疾病作為替代或共同原因。

**Risk factors:** 近期外傷或碰撞；頸部突然大幅度動作；反覆／持續機械或姿勢負荷；隨年齡增加的頸椎退化可成為頸痛因素

**TCM differential seed, textbook review required:** 僅作中醫辨證研究種子。部分急性頸僵可與中醫「落枕」病名重疊，而風寒、氣滯血瘀或經筋痹阻等仍需依實際表現辨證。

**Sources:**
- AAOS — Neck Pain: https://orthoinfo.aaos.org/diseases--conditions/neck-pain
- AAOS — Neck Sprains and Strains: https://orthoinfo.aaos.org/diseases--conditions/neck-sprain/

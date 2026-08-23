# CR-010 Common-300 Detail Batch 02 — SOL

**Status:** RESEARCH STAGING / NOT CANONICAL / NO PHI

## Priority caveat

The requested Fable live PARTIAL ranking was **not repo-visible to SOL at generation time**. Latest visible handoff reports 505 cond.* records (209 content-layer + 296 skeleton), but does not expose the ordered PARTIAL list. Therefore this is a source-reuse-optimized prefetch batch. Fable should exact-scan and reorder/filter it against its local live audit before ingestion.

## P-4 adjudication

**CREATE_CANONICAL:** 外感風濕 / 風濕襲表證 is distinct from `pattern.wind_cold_damp_bi`.

Basis: 病位與主症群不同。外感風濕屬衛表受邪，以惡風、發熱、頭身困重酸楚為核心；風寒濕痹屬經絡痹阻，以肌肉骨節／關節疼痛、重著、屈伸不利為核心，不應當作「風寒濕痹減寒版」。

## Conditions

### 1. 支氣管擴張症 | Bronchiectasis
- Suggested ID only: `cond.bronchiectasis`
- Source group: `NHLBI_pulmonary`
- Overview: 支氣管擴張症是支氣管長期異常擴張與氣道損傷的慢性肺部疾病，常形成黏液滯留、反覆感染與進一步氣道損傷的循環。
- Diagnostic signs: 持續或每日咳嗽；大量痰液；反覆呼吸道感染或急性惡化；呼吸困難、喘鳴或胸痛；咳血需評估嚴重度與來源
- Tests: 詳細病史與肺部檢查；胸部 CT 用於確認支氣管擴張；痰液培養或其他感染評估；肺功能檢查；依情況尋找免疫、感染、遺傳或其他原發原因
- Treatment: 治療原發原因與肺部感染；促進氣道清除與排痰；降低急性惡化與併發症；特定患者需氧療、介入或手術評估
- TCM seed **needs textbook review**: 辨證研究種子：依咳嗽、痰量、胸悶、反覆感染與體質，可鑑別痰濕、痰熱、肺脾氣虛、肺陰不足等候選機轉；不與單一證型等同。
- Sources:
  - NHLBI/NIH — Bronchiectasis - Symptoms: https://www.nhlbi.nih.gov/health/bronchiectasis/symptoms
  - NHLBI/NIH — Bronchiectasis - Diagnosis: https://www.nhlbi.nih.gov/health/bronchiectasis/diagnosis
  - NHLBI/NIH — Bronchiectasis - Treatment: https://www.nhlbi.nih.gov/health/bronchiectasis/treatment

### 2. 肺結核 | Pulmonary tuberculosis / active tuberculosis disease
- Suggested ID only: `cond.tuberculosis`
- Source group: `CDC_respiratory_infectious`
- Overview: 結核病由結核分枝桿菌感染引起，活動性肺結核最常累及肺部並可經空氣傳播；潛伏感染與活動性疾病必須區分。
- Diagnostic signs: 咳嗽持續約三週或更久；胸痛；咳痰或咳血；發燒、夜汗、體重下降、食慾差或疲倦
- Tests: TB 血液檢測或皮膚試驗評估感染；胸部 X 光；痰液抹片、核酸檢測與培養；藥物敏感性檢測以指導活動性 TB 治療
- Treatment: 活動性 TB 需依公共衛生與感染科規範完成多藥療程；確認並管理傳染風險；依藥物敏感性、共病與治療反應調整方案；潛伏感染另依風險評估治療
- TCM seed **needs textbook review**: 辨證研究種子：結核感染不是中醫證型；若作傳統辨證，可依咳嗽、潮熱、盜汗、咳血、消瘦等實際表現再鑑別肺陰虛、陰虛火旺、氣陰兩虛等候選機轉。
- Sources:
  - CDC — Signs and Symptoms of Tuberculosis: https://www.cdc.gov/tb/signs-symptoms/index.html
  - CDC — Clinical Testing and Diagnosis for Tuberculosis: https://www.cdc.gov/tb/hcp/testing-diagnosis/index.html
  - CDC — Tuberculosis (TB): https://www.cdc.gov/tb/

### 3. 流行性感冒 | Influenza
- Suggested ID only: `cond.influenza`
- Source group: `CDC_respiratory_infectious`
- Overview: 流行性感冒是由 influenza virus 引起的急性傳染性呼吸道疾病，典型症狀常突然發作。
- Diagnostic signs: 突然發燒或畏寒；咳嗽、喉嚨痛、鼻症狀；肌肉痠痛、頭痛、疲倦；部分患者可沒有發燒
- Tests: 門診可依流行病學與臨床表現診斷；需要確認或住院時使用病毒檢測；分子檢測通常較抗原檢測敏感
- Treatment: 多數輕症以支持性照護為主；高風險、重症或住院患者及早評估抗病毒治療；監測肺炎、脫水或慢性病惡化；依現行 CDC/ACIP 指引預防與疫苗接種
- TCM seed **needs textbook review**: 辨證研究種子：流感病毒診斷不直接決定證型；應依惡寒、發熱、無汗或有汗、咽痛、咳嗽、口渴、舌脈等區分風寒、風熱、濕邪或其他外感候選證型。
- Sources:
  - CDC — Clinical Signs and Symptoms of Influenza: https://www.cdc.gov/flu/hcp/clinical-signs/index.html
  - CDC — Diagnosis for Flu: https://www.cdc.gov/flu/testing/index.html
  - CDC — Treatment of Flu: https://www.cdc.gov/flu/treatment/

### 4. 呼吸道融合病毒感染 | Respiratory syncytial virus (RSV) infection
- Suggested ID only: `cond.rsv_infection`
- Source group: `CDC_respiratory_infectious`
- Overview: RSV 是常見呼吸道病毒，通常造成類感冒症狀，但嬰幼兒、高齡者與特定高風險成人可能發展為嚴重下呼吸道疾病。
- Diagnostic signs: 流鼻水、鼻塞、咳嗽、打噴嚏；發燒、喘鳴、食慾下降；高風險成人可能呼吸困難或出現肺炎；嬰兒可僅有活動下降、易怒或呼吸困難
- Tests: 症狀缺乏特異性；NAAT/PCR 可高敏感度確認 RSV；抗原檢測亦可使用但通常敏感度較低
- Treatment: 多數感染以支持性照護為主；維持水分並處理發燒或疼痛；嚴重呼吸困難或脫水需升級照護；高風險族群預防依現行 CDC 免疫建議
- TCM seed **needs textbook review**: 辨證研究種子：RSV 不是固定證型；依鼻塞、咳嗽、喘、痰、發熱、食慾與舌脈區分外感、痰熱、痰濕、肺脾氣虛等候選機轉。
- Sources:
  - CDC — Symptoms and Care of RSV: https://www.cdc.gov/rsv/symptoms/index.html
  - CDC — Diagnostic Testing for RSV: https://www.cdc.gov/rsv/hcp/clinical-overview/diagnostic-testing.html
  - CDC — Clinical Overview of RSV: https://www.cdc.gov/rsv/hcp/clinical-overview/

### 5. 肺高壓 | Pulmonary hypertension
- Suggested ID only: `cond.pulmonary_hypertension`
- Source group: `NHLBI_pulmonary`
- Overview: 肺高壓是肺血管壓力異常升高的一組疾病，可增加右心負荷並最終造成右心功能受損。
- Diagnostic signs: 活動時呼吸困難；疲倦與無力；胸痛；頭暈或暈厥；腿部或腹部水腫；咳血屬高警訊表現
- Tests: 心臟超音波作初步評估；右心導管為確診與血流動力學分類的重要工具；心電圖、胸部影像、肺功能與血液檢查；依病因評估慢性血栓、左心或肺部疾病
- Treatment: 治療取決於肺高壓類型與病因；特定 PAH 使用肺血管標靶藥物；依情況使用氧療、利尿或其他支持療法；慢性血栓型可考慮手術或介入治療；進展性或重症需專科追蹤
- TCM seed **needs textbook review**: 辨證研究種子：肺高壓不可由「肺氣虛」直接替代；喘促、胸悶、心悸、水腫、紫紺等可依實際表現鑑別肺氣虛、心肺氣虛、痰飲、水濕、瘀血等候選機轉。
- Sources:
  - NHLBI/NIH — Pulmonary Hypertension - What Is: https://www.nhlbi.nih.gov/health/pulmonary-hypertension
  - NHLBI/NIH — Pulmonary Hypertension - Diagnosis: https://www.nhlbi.nih.gov/health/pulmonary-hypertension/diagnosis
  - NHLBI/NIH — Pulmonary Hypertension - Treatment: https://www.nhlbi.nih.gov/health/pulmonary-hypertension/treatment

### 6. 緊張型頭痛 | Tension-type headache
- Suggested ID only: `cond.tension_type_headache`
- Source group: `NINDS_neuro`
- Overview: 緊張型頭痛是常見原發性頭痛類型，典型為雙側、壓迫或緊箍感的輕至中度頭痛，通常不因一般日常活動明顯加劇。
- Diagnostic signs: 雙側壓迫或緊箍感；輕至中度疼痛；通常不因走路或一般活動明顯加重；可有頭皮、頸肩肌肉壓痛；需排除突然爆發、神經缺損或感染等次發性紅旗
- Tests: 主要依病史與神經學檢查；典型原發性頭痛通常不需特定影像；出現紅旗或非典型表現時依情況安排影像／其他檢查
- Treatment: 急性發作以適當止痛策略處理；避免止痛藥過度使用；頻繁或慢性者可考慮預防策略；處理睡眠、壓力、頸肩肌筋膜與其他誘發因素
- TCM seed **needs textbook review**: 辨證研究種子：頭痛病名與證型分開；依痛位、痛性、誘因、舌脈可鑑別風邪、肝陽、痰濕、血瘀、氣血不足等多種候選證型。
- Sources:
  - NINDS/NIH — Headache: https://www.ninds.nih.gov/node/667

### 7. 三叉神經痛 | Trigeminal neuralgia
- Suggested ID only: `cond.trigeminal_neuralgia`
- Source group: `NINDS_neuro`
- Overview: 三叉神經痛是三叉神經分布區出現反覆、短暫、劇烈電擊樣或刺痛樣顏面痛的神經病理性疼痛疾病。
- Diagnostic signs: 單側突發電擊樣顏面痛；發作短暫且反覆；觸摸、刷牙、咀嚼、說話或冷風可誘發；出現持續麻木、雙側症狀或其他神經缺損時需評估次發原因
- Tests: 病史與神經學檢查；MRI 用於尋找血管壓迫、腫瘤、多發性硬化等可能原因；非典型病例依臨床需要擴大檢查
- Treatment: 以神經病理性疼痛藥物為主要初始治療；監測療效與副作用；藥物無效或不能耐受時考慮神經外科／介入選項；持續追蹤是否有次發病因
- TCM seed **needs textbook review**: 辨證研究種子：面痛可依灼熱、冷痛、刺痛、誘因與舌脈鑑別風寒、風熱、胃火、肝火、痰瘀或氣血不足等候選機轉；不把三叉神經痛固定成單一證型。
- Sources:
  - NINDS/NIH — Trigeminal Neuralgia: https://www.ninds.nih.gov/health-information/disorders/trigeminal-neuralgia

### 8. 貝爾氏麻痺 | Bell's palsy
- Suggested ID only: `cond.bells_palsy`
- Source group: `NINDS_neuro`
- Overview: 貝爾氏麻痺是急性周邊型顏面神經麻痺，造成單側上、下臉部肌肉突然無力或癱瘓，診斷前需排除其他原因。
- Diagnostic signs: 單側額頭、眼瞼與口角均出現急性無力；閉眼不全；味覺或聲音敏感度可改變；若額頭保留、肢體無力、失語或其他中樞神經徵象需立即鑑別中風等原因
- Tests: 主要依臨床表現與神經學檢查；多數典型病例不需常規影像或實驗室檢查；漸進性、反覆或非典型顏面麻痺需進一步檢查其他原因
- Treatment: 早期常規治療以 corticosteroid 為核心；保護無法完全閉合的眼睛；依個案考慮其他治療與復健；若恢復不如預期或病程非典型需再評估
- TCM seed **needs textbook review**: 辨證研究種子：周邊面癱可依急性外感、肌肉鬆弛、疼痛、舌脈等鑑別風邪入絡、風寒、風熱、痰瘀阻絡、氣血不足等候選機轉。
- Sources:
  - NINDS/NIH — Bell's Palsy: https://www.ninds.nih.gov/health-information/disorders/bells-palsy

### 9. 腕隧道症候群 | Carpal tunnel syndrome
- Suggested ID only: `cond.carpal_tunnel_syndrome`
- Source group: `NINDS_neuro`
- Overview: 腕隧道症候群是正中神經在手腕腕隧道內受到壓迫所造成的常見單神經病變。
- Diagnostic signs: 拇指、食指、中指及無名指橈側麻木刺痛；夜間症狀常明顯；手部無力或容易掉東西；嚴重或長期病例可見魚際肌萎縮
- Tests: 病史與神經／肌骨檢查；神經傳導檢查與 EMG 可協助確認與分級；超音波可在部分情況評估正中神經與腕隧道；需鑑別頸椎神經根病變與其他神經病變
- Treatment: 減少誘發負荷並使用中立位手腕護具；視嚴重度考慮藥物或注射；持續神經缺損、肌萎縮或保守治療失敗時考慮減壓手術
- TCM seed **needs textbook review**: 辨證研究種子：腕部麻痛不等同單一痹證；可依疼痛、麻木、腫脹、寒熱、外傷與舌脈鑑別氣滯血瘀、痰濕、風寒濕痹或氣血不足等候選機轉。
- Sources:
  - NINDS/NIH — Peripheral Neuropathy: https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy

### 10. 周邊神經病變 | Peripheral neuropathy
- Suggested ID only: `cond.peripheral_neuropathy`
- Source group: `NINDS_neuro`
- Overview: 周邊神經病變是周邊神經系統受損的一大類疾病，可影響感覺、運動與自主神經功能。
- Diagnostic signs: 麻木、刺痛、灼痛或電擊樣疼痛；感覺下降或位置覺受損；肌肉無力、抽筋或萎縮；自主神經病變可出現出汗、血壓或腸胃異常
- Tests: 病史與完整神經學檢查；血液檢查尋找代謝、營養、感染或免疫原因；神經傳導檢查與 EMG；依病型使用影像、遺傳、自主神經或小纖維檢查
- Treatment: 治療可逆原發原因；保護感覺下降肢體並預防跌倒／傷口；依神經病理性疼痛選擇症狀治療；免疫性或壓迫性病因依特定機轉處理
- TCM seed **needs textbook review**: 辨證研究種子：麻木、灼痛、無力可來自不同證機；依病程與舌脈鑑別氣血不足、瘀血阻絡、痰濕、濕熱、肝腎不足等候選機轉。
- Sources:
  - NINDS/NIH — Peripheral Neuropathy: https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy

### 11. 癲癇 | Epilepsy
- Suggested ID only: `cond.epilepsy`
- Source group: `NINDS_neuro`
- Overview: 癲癇是一組以反覆非誘發性癲癇發作為特徵的神經系統疾病，需區分單次急性誘發性發作與癲癇。
- Diagnostic signs: 發作型態依受影響腦網路不同而異；可有意識改變、抽搐、感覺或行為異常；發作後可能混亂或疲倦；首次發作需排除低血糖、感染、中毒、腦中風等急性誘因
- Tests: 詳細發作病史與目擊者描述；神經學檢查；EEG；腦部 MRI/其他影像；依情況血液、代謝、遺傳或其他檢查
- Treatment: 依發作型態與個人因素選擇抗癲癇藥；強調規律服藥與安全教育；藥物難治型評估手術、神經刺激或其他專科治療；處理可逆誘因與共病
- TCM seed **needs textbook review**: 辨證研究種子：癲癇病名與中醫「癇病」可有臨床重疊但不自動等同；每次病例仍需依痰、風、火、瘀、虛等表現做證型鑑別。
- Sources:
  - NINDS/NIH — Epilepsy and Seizures: https://www.ninds.nih.gov/node/647

### 12. 良性陣發性姿勢性眩暈 | Benign paroxysmal positional vertigo (BPPV)
- Suggested ID only: `cond.bppv`
- Source group: `NIDCD_vestibular`
- Overview: BPPV 是常見周邊前庭疾病，由特定頭位改變誘發短暫而強烈的旋轉性眩暈。
- Diagnostic signs: 特定頭位誘發短暫旋轉感；翻身、抬頭或低頭常是誘因；發作間可接近正常；持續性神經缺損、嚴重步態異常、複視或新發頭痛需排除中樞原因
- Tests: 病史與位置誘發檢查；Dix-Hallpike 等測試依疑似半規管選用；觀察典型位置性眼震；非典型或有神經紅旗時進一步神經／影像評估
- Treatment: 以耳石復位術為主要治療，如 Epley maneuver；必要時重複復位；處理跌倒風險與短期活動安全；症狀型態改變時重新評估診斷
- TCM seed **needs textbook review**: 辨證研究種子：BPPV 是特定前庭診斷，不能直接等同「痰濕眩暈」；可依頭重、噁心、疲倦、舌脈等再鑑別痰濕、痰飲、氣血不足或肝陽等候選證型。
- Sources:
  - NIDCD/NIH — Balance Disorders: https://www.nidcd.nih.gov/health/balance-disorders
  - NIDCD/NIH — BPPV glossary: https://www.nidcd.nih.gov/glossary/benign-paroxysmal-positional-vertigo-bppv
  - NIDCD/NIH — Epley maneuver: https://www.nidcd.nih.gov/glossary/epley-maneuver

### 13. 梅尼爾氏症 | Ménière's disease
- Suggested ID only: `cond.menieres_disease`
- Source group: `NIDCD_vestibular`
- Overview: 梅尼爾氏症是內耳疾病，典型結合反覆自發性眩暈、波動性聽力下降、耳鳴與耳悶脹感。
- Diagnostic signs: 反覆自發性眩暈發作；低至中頻聽力下降；耳鳴；患耳脹滿感；需排除其他前庭與神經疾病
- Tests: 完整耳科與神經病史；聽力檢查；依診斷標準確認眩暈持續時間與波動性耳症狀；MRI/CT 可在特定情況排除其他病因
- Treatment: 目前無根治方法，目標是降低眩暈與維持功能；生活與飲食調整可作為部分患者的管理策略；症狀藥物、鼓室內治療或其他專科治療依嚴重度選用；難治重症可考慮手術性選項
- TCM seed **needs textbook review**: 辨證研究種子：梅尼爾氏症與眩暈證型不一一等同；依耳鳴、頭重、噁心、痰、情緒、疲倦、舌脈可鑑別痰濕、痰飲、肝陽、肝火、氣血不足或腎虛等候選機轉。
- Sources:
  - NIDCD/NIH — Ménière's Disease: https://www.nidcd.nih.gov/health/menieres-disease

### 14. 不寧腿症候群 | Restless legs syndrome
- Suggested ID only: `cond.restless_legs_syndrome`
- Source group: `NINDS_neuro`
- Overview: 不寧腿症候群是以休息時出現難以抗拒的移動腿部衝動與不適感為核心、活動後暫時改善且夜間較重的神經／睡眠相關疾病。
- Diagnostic signs: 休息時出現移動腿部的強烈衝動；伴隨爬行、拉扯、痠痛或其他不適感；活動可暫時緩解；傍晚或夜間較明顯；常干擾入睡與睡眠維持
- Tests: 主要為臨床診斷，沒有單一確診檢驗；評估病史、藥物與家族史；血液檢查評估鐵狀態、腎功能或其他可逆原因；必要時鑑別睡眠呼吸中止、周邊神經病變等
- Treatment: 先處理鐵缺乏與可逆誘因；規律睡眠、適度運動並減少可能惡化因素；中重度症狀依個案選擇藥物或裝置治療；長期多巴胺類治療需注意 augmentation
- TCM seed **needs textbook review**: 辨證研究種子：腿部躁動與不適可依夜間加重、麻木、抽動、疼痛及全身狀態鑑別血虛、陰虛、瘀血、痰濕或肝腎不足等候選機轉。
- Sources:
  - NINDS/NIH — Restless Legs Syndrome: https://www.ninds.nih.gov/health-information/disorders/restless-legs-syndrome

### 15. 前庭神經炎 | Vestibular neuritis
- Suggested ID only: `cond.vestibular_neuritis`
- Source group: `NIDCD_vestibular`
- Overview: 前庭神經炎是急性周邊前庭症候群的重要原因，典型造成持續性眩暈、噁心與步態不穩，但通常沒有新的聽力下降。
- Diagnostic signs: 突然出現持續數小時至數天的旋轉性眩暈；噁心、嘔吐與步態不穩；頭動會使症狀惡化但不是僅特定姿勢短暫誘發；新的聽力下降提示其他診斷；局灶神經缺損或嚴重中樞徵象需急查中風
- Tests: 完整神經與前庭檢查；眼震與頭脈衝等床邊檢查需由受訓臨床人員解讀；非典型或有中樞紅旗時安排腦部影像；必要時做聽力檢查協助鑑別
- Treatment: 急性期支持性處理噁心與眩暈；避免長期使用前庭抑制藥造成代償延遲；早期依耐受度進行前庭復健；診斷不確定或有中樞紅旗時優先急症評估
- TCM seed **needs textbook review**: 辨證研究種子：急性持續性眩暈不可直接視為痰濕；必須先排除中樞急症，再依噁心、頭重、口渴、寒熱、舌脈等鑑別痰飲、痰濕、風邪、肝陽等候選機轉。
- Sources:
  - NIDCD/NIH — Balance Disorders: https://www.nidcd.nih.gov/health/balance-disorders


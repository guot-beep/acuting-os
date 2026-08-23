# CR-010 Common-300 Condition Detail Batch 01 — SOL prefetch
**Status:** RESEARCH STAGING / NOT CANONICAL / NO PHI  
**Merge rule:** exact-scan current repo first; fill empty approved fields only; do not overwrite richer content; repo schema + DECISIONS + validators win.
## Why this is a prefetch batch
The two requested Fable live reports were not available as usable content in this run. Rather than stop, this pack pre-researches 12 conditions explicitly named in the current Common-300 candidate document, prioritizing authoritative-source reuse. **Do not treat the ordering below as the final repo maturity ranking.**
## Safety / architecture rules
- `cond.*` remains biomedical. TCM disease/pattern relations are multi-to-multi, never equality.
- TCM pathogenesis text below is a **differential seed**, not canonical content. Every card is flagged `needs_textbook_source_review`.
- No medication doses were added.
- Red-flag wording is concise research material; the canonical red-flag registry remains authoritative where wired.

## 1. 消化性潰瘍 | Peptic ulcer disease
- Suggested ID only: `cond.peptic_ulcer` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 消化性潰瘍是胃或十二指腸黏膜形成潰瘍，可併發出血、穿孔、穿透或胃／十二指腸阻塞。
- **Biomedical pathophysiology:** 主要機轉為幽門螺旋桿菌感染或非類固醇抗發炎藥造成黏膜防禦受損，使酸與胃蛋白酶相關損傷超過黏膜保護能力。
- **Diagnostic signs:** 上腹痛或不適；早飽或餐後飽脹；噁心、腹脹或打嗝；消化道出血可表現為吐血、黑便、貧血或血流動力學不穩定
- **Diagnostic tests:** 評估用藥史，尤其 NSAIDs，並詢問幽門螺旋桿菌病史；適當時以尿素呼氣或糞便檢測幽門螺旋桿菌；有適應症時做上消化道內視鏡與活檢；懷疑出血或併發症時評估 CBC 等檢驗
- **Treatment principles:** 以抑酸治療促進潰瘍癒合，常使用 PPI；確認並根除幽門螺旋桿菌感染；臨床可行時停用、減量或調整致潰瘍 NSAID；出血、穿孔、阻塞等併發症需緊急處理
- **TCM pathogenesis seed:** 僅作辨證研究種子，不建立「消化性潰瘍＝某一中醫病名／證型」的等同關係。臨床可依胃脘痛、嘈雜、反酸、黑便等實際表現，再鑑別肝胃不和、脾胃虛弱、瘀血阻絡等候選機轉。
- **Biomedical sources:**
  - NIDDK/NIH — Peptic Ulcers – Definition, symptoms, diagnosis, treatment: https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers
  - NIDDK/NIH — Diagnosis of Peptic Ulcers: https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers/diagnosis
  - NIDDK/NIH — Treatment for Peptic Ulcers: https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers/treatment

## 2. 膽結石 | Cholelithiasis (gallstones)
- Suggested ID only: `cond.cholelithiasis` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 膽結石是膽囊或膽道內形成的硬化物質，可無症狀，也可因結石阻塞膽道而造成膽絞痛與併發症。
- **Biomedical pathophysiology:** 當膽汁成分與膽囊功能促使膽固醇或色素物質析出時可形成結石；若造成膽道阻塞，可引起膽絞痛、膽囊炎、膽管炎或胰臟炎。
- **Diagnostic signs:** 上腹或右上腹陣發性疼痛，常與進食相關；可伴噁心或嘔吐；發燒、黃疸或持續劇烈疼痛提示可能已有併發症，而非單純膽絞痛
- **Diagnostic tests:** 腹部超音波是尋找膽結石的首選影像檢查；血液檢查可評估發炎、感染與肝膽／胰臟受累；懷疑膽管結石時可使用磁振或內視鏡膽道影像；ERCP 選擇性使用，亦可處理總膽管結石
- **Treatment principles:** 無症狀膽結石通常不需治療；有症狀膽結石常以膽囊切除術處理；膽道阻塞與併發症需及時處置；總膽管結石可使用 ERCP；特定膽固醇結石可有非手術選項，但並非常規首選
- **TCM pathogenesis seed:** 僅作辨證研究種子。可依脅痛、黃疸、噁心等實際表現鑑別肝膽氣滯、濕熱、痰濁或瘀阻等候選機轉，不把膽結石直接等同於單一中醫病名或證型。
- **Biomedical sources:**
  - NIDDK/NIH — Diagnosis of Gallstones: https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/diagnosis
  - NIDDK/NIH — Treatment for Gallstones: https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/treatment

## 3. 憩室病／憩室炎 | Diverticular disease / diverticulitis
- Suggested ID only: `cond.diverticular_disease` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 憩室症是結腸壁形成囊狀突出；當憩室造成症狀、出血、發炎或其他併發症時屬憩室病，其中憩室炎指憩室相關發炎。
- **Biomedical pathophysiology:** 憩室由結腸壁薄弱處向外突出形成；當憩室出血、發炎、穿孔、形成膿瘍或瘻管，或造成阻塞時便產生臨床症狀與併發症。
- **Diagnostic signs:** 下腹痛或絞痛；可有便祕、腹瀉或腹脹；憩室炎常出現較明顯的局部腹痛；直腸出血、發燒、腹膜刺激徵或全身性不適提示併發症風險
- **Diagnostic tests:** 病史與腹部理學檢查；視情況安排血液與糞便檢查；依臨床表現使用 CT、超音波或 MRI；急性問題處理後可用大腸鏡確認病變或排除其他疾病；亦可處理憩室出血
- **Treatment principles:** 依慢性症狀、急性憩室炎或併發症分層治療；部分單純性憩室炎可保守處理，並非每位患者都必須使用抗生素；重症或併發症可能需要住院、引流、內視鏡止血或手術；長期可依個別情況採取足量纖維與其他生活型態措施降低風險
- **TCM pathogenesis seed:** 僅作辨證研究種子。依腹痛、便祕、腹瀉、腹脹或出血等實際表現，可再鑑別腸腑氣滯、濕熱、瘀血或脾虛等候選機轉；不把憩室病當作單一中醫證型。
- **Biomedical sources:**
  - NIDDK/NIH — Diverticular Disease: https://www.niddk.nih.gov/health-information/digestive-diseases/diverticulosis-diverticulitis
  - NIDDK/NIH — Diagnosis of Diverticular Disease: https://www.niddk.nih.gov/health-information/digestive-diseases/diverticulosis-diverticulitis/diagnosis
  - NIDDK/NIH — Treatment for Diverticular Disease: https://www.niddk.nih.gov/health-information/digestive-diseases/diverticulosis-diverticulitis/treatment

## 4. 乳糜瀉 | Celiac disease
- Suggested ID only: `cond.celiac_disease` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 乳糜瀉是在遺傳易感族群中由飲食麩質觸發的免疫介導疾病，可損傷小腸黏膜，產生腸胃道及腸外表現。
- **Biomedical pathophysiology:** 麩質暴露引發異常免疫反應並損傷小腸黏膜，可造成絨毛損傷、吸收不良、營養缺乏與全身性表現。
- **Diagnostic signs:** 可見腹瀉、腹脹、腹痛等腸胃症狀；可有體重減輕或生長問題；腸外表現可包括貧血、骨骼問題、疱疹樣皮膚炎、口腔／牙齒或神經症狀；單靠症狀不足以確診
- **Diagnostic tests:** 血清學檢測，常以 tTG-IgA 並評估 IgA 狀態；有適應症時以小腸活檢確認診斷；一般應在患者仍攝取麩質時完成診斷檢測；特定情況可使用遺傳檢測協助排除或釐清
- **Treatment principles:** 終身嚴格無麩質飲食；由營養師協助辨識隱藏麩質並維持營養完整；評估與矯正營養缺乏並追蹤恢復；症狀持續時重新評估持續麩質暴露、其他診斷或難治型疾病
- **TCM pathogenesis seed:** 僅作辨證研究種子。長期腹瀉、腹脹、乏力與吸收不良可依個別表現鑑別脾氣虛、脾陽虛、濕困等候選機轉；不可把乳糜瀉本身等同於「脾虛」。
- **Biomedical sources:**
  - NIDDK/NIH — Diagnosis of Celiac Disease: https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/diagnosis
  - NIDDK/NIH — Celiac Disease Tests for Health Care Professionals: https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/digestive-diseases/celiac-disease-health-care-professionals
  - NIDDK/NIH — Treatment for Celiac Disease: https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/treatment

## 5. 乳糖不耐 | Lactose intolerance
- Suggested ID only: `cond.lactose_intolerance` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 乳糖不耐是因乳糖吸收不良，在攝取乳糖後出現消化症狀；只有乳糖吸收不良而沒有症狀，不等同於乳糖不耐。
- **Biomedical pathophysiology:** 小腸乳糖酶活性不足使乳糖無法完全消化；未吸收的乳糖進入結腸後被細菌發酵並增加腸腔滲透負荷，因此產生脹氣、腹痛與腹瀉。
- **Diagnostic signs:** 攝取乳糖後出現腹脹、腹瀉、排氣、噁心、腹痛或腸鳴；症狀程度依乳糖量與個人耐受度而異；需與牛奶蛋白過敏及其他腸胃疾病鑑別
- **Diagnostic tests:** 病史確認症狀與乳糖暴露的時間關係；減少乳糖的飲食試驗可協助評估；需要確認時可使用氫氣呼氣試驗；症狀持續或不典型時需評估其他原因
- **Treatment principles:** 依個人耐受度調整乳糖攝取，不應一律假設必須完全避免乳製品；乳糖酶產品可幫助部分患者；維持足夠鈣、維生素 D 與整體營養；若有可逆的小腸疾病，應處理原發原因
- **TCM pathogenesis seed:** 僅作辨證研究種子。乳製品後腹脹、腹瀉、腸鳴可依舌脈與全身狀態鑑別脾虛、寒濕、濕困或食積等候選機轉，而不是把乳糖不耐固定歸為單一證型。
- **Biomedical sources:**
  - NIDDK/NIH — Lactose Intolerance: https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance
  - NIDDK/NIH — Treatment for Lactose Intolerance: https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance/treatment
  - NIDDK/NIH — Eating, Diet, & Nutrition for Lactose Intolerance: https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance/eating-diet-nutrition

## 6. 急性胰臟炎 | Acute pancreatitis
- Suggested ID only: `cond.acute_pancreatitis` (exact repo scan required)
- Source family: `NIDDK_digestive`
- **Overview:** 急性胰臟炎是胰臟突然發炎，可從短期自限性疾病到伴隨局部或器官併發症的重症。
- **Biomedical pathophysiology:** 胰臟消化酵素過早活化與發炎途徑啟動造成胰臟損傷，嚴重時可引發全身性發炎。膽結石與大量飲酒是常見原因，也可能與藥物、代謝或遺傳因素有關。
- **Diagnostic signs:** 急性上腹痛，常可向背部放射；噁心與嘔吐；腹部壓痛；可見發燒或心搏過速；低血壓或器官功能障礙提示重症
- **Diagnostic tests:** 血清 lipase 和／或 amylase；血液檢查評估代謝、發炎、肝膽等線索；依病因與嚴重度使用超音波、CT、MRI/MRCP 或內視鏡超音波；評估膽結石、飲酒、藥物、高三酸甘油脂及其他病因
- **Treatment principles:** 急性胰臟炎屬需西醫評估與支持治療的急性疾病；依臨床情況給予補液、止痛、營養與監測；處理病因與併發症，包括膽道阻塞；重症、感染、壞死、器官衰竭或其他併發症需升級處置
- **TCM pathogenesis seed:** 僅作學習用辨證種子，急性胰臟炎不可由中醫辨證取代急診／住院評估。若作整合醫學研究，可依劇烈腹痛、脹滿、噁心、發熱等分別討論腑氣不通、濕熱、食積、氣滯血瘀等候選機轉。
- **Biomedical sources:**
  - NIDDK/NIH — Pancreatitis: https://www.niddk.nih.gov/health-information/digestive-diseases/pancreatitis
  - NIDDK/NIH — Diagnosis of Pancreatitis: https://www.niddk.nih.gov/health-information/digestive-diseases/pancreatitis/diagnosis
  - NIDDK/NIH — Treatment for Pancreatitis: https://www.niddk.nih.gov/health-information/digestive-diseases/pancreatitis/treatment

## 7. 肝硬化 | Cirrhosis
- Suggested ID only: `cond.cirrhosis` (exact repo scan required)
- Source family: `NIDDK_liver`
- **Overview:** 肝硬化是進展性肝臟纖維化，疤痕組織取代正常肝組織、扭曲肝臟結構並降低功能，可進一步造成門脈高壓與肝衰竭。
- **Biomedical pathophysiology:** 慢性肝損傷造成纖維化與再生結節，破壞肝內血流與正常肝細胞功能。常見病因包括酒精相關肝病、代謝性脂肪肝疾病與慢性病毒性肝炎。
- **Diagnostic signs:** 早期可能沒有症狀；可見疲倦、搔癢、黃疸、水腫、腹水或肌肉流失；門脈高壓可出現靜脈曲張或脾腫大等表現；意識混亂、睡眠或認知改變可能提示肝性腦病
- **Diagnostic tests:** 肝功能相關檢驗、膽紅素、白蛋白、CBC、凝血與病因檢查；超音波、CT、MRI 和／或彈性影像；診斷或病因仍不確定時可做肝活檢；依專科建議持續監測併發症
- **Treatment principles:** 處理原發病因以減緩進一步肝損傷；避免肝毒性暴露並管理營養與共病；預防與處理腹水、靜脈曲張、肝性腦病、感染與肝細胞癌等併發症；失代償或肝衰竭達適應症時轉介肝移植評估
- **TCM pathogenesis seed:** 僅作辨證研究種子。腹脹、腹水、脅痛、黃疸、乏力等可跨越積聚、鼓脹、黃疸等傳統病證範疇，常需從氣滯、濕、水、瘀以及肝脾腎虛損的複合演變辨證，不能以單一證型代替肝硬化診斷。
- **Biomedical sources:**
  - NIDDK/NIH — Cirrhosis: https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis
  - NIDDK/NIH — Diagnosis of Cirrhosis: https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/diagnosis
  - NIDDK/NIH — Treatment for Cirrhosis: https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/treatment

## 8. B 型肝炎 | Hepatitis B
- Suggested ID only: `cond.hepatitis_b` (exact repo scan required)
- Source family: `NIDDK_liver`
- **Overview:** B 型肝炎是 B 型肝炎病毒感染，可為急性感染，也可能轉為慢性；慢性感染可造成進行性肝損傷、肝硬化與肝癌。
- **Biomedical pathophysiology:** HBV 感染肝細胞後，肝損傷很大部分來自宿主免疫反應；持續病毒感染可造成慢性壞死性發炎與纖維化。
- **Diagnostic signs:** 許多感染者可能沒有症狀；可出現疲倦、食慾下降、噁心、腹部不適、深色尿或黃疸；慢性病可能先因肝功能異常或肝硬化併發症而被發現
- **Diagnostic tests:** 以 HBV 血清學檢查判定感染狀態；慢性感染時以 HBV DNA 與肝臟檢驗評估病毒活性與肝損傷；依情況安排影像或纖維化評估；慢性病需評估肝硬化與肝細胞癌風險
- **Treatment principles:** 急性 B 肝多以支持性治療為主，重症則需專科處理；並非每位慢性 B 肝患者都需要抗病毒治療；慢性 HBV 已造成或可能造成肝損傷時，抗病毒治療可降低疾病進展風險；需長期監測肝損傷與併發症
- **TCM pathogenesis seed:** 僅作辨證研究種子。病毒感染本身不是中醫證型；若有黃疸、脅痛、納差、乏力等，可依實際舌脈與病程鑑別濕熱、肝鬱脾虛、瘀阻或正虛等候選機轉。
- **Biomedical sources:**
  - NIDDK/NIH — Hepatitis B: https://www.niddk.nih.gov/health-information/liver-disease/viral-hepatitis/hepatitis-b

## 9. 慢性腎臟病 | Chronic kidney disease
- Suggested ID only: `cond.chronic_kidney_disease` (exact repo scan required)
- Source family: `NIDDK_kidney`
- **Overview:** 慢性腎臟病（CKD）是持續的腎臟結構損傷或腎功能下降，使血液過濾能力受損，並可能進展為腎衰竭及全身性併發症。
- **Biomedical pathophysiology:** 腎元持續受損與代償性過度過濾會逐步降低腎臟過濾能力。成人常見病因為糖尿病與高血壓，而 CKD 本身也增加心血管、血液、礦物質骨代謝與其他全身風險。
- **Diagnostic signs:** 早期 CKD 常無症狀；後期可出現水腫、疲倦、搔癢、食慾變化、高血壓或尿毒症症狀；糖尿病、高血壓、心血管疾病或腎衰竭家族史會提高風險
- **Diagnostic tests:** 血清 creatinine 與估算 eGFR；尿白蛋白／肌酸酐比值與尿液分析；需用時間證明慢性持續性，不能只依單次異常值；依臨床表現安排其他血液、影像與病因檢查
- **Treatment principles:** 找出並處理病因，追蹤 eGFR 與白蛋白尿趨勢；有高血壓或糖尿病時妥善控制；有適應症時使用腎臟保護性藥物，並審查腎毒性或需依腎功能調整的藥物；管理心血管風險與 CKD 併發症，適當時轉介腎臟專科
- **TCM pathogenesis seed:** 僅作辨證研究種子。CKD 不是「腎虛」的同義詞。水腫、乏力、納差、腰膝痠軟、尿量改變等需依病程鑑別脾腎虛損、濕濁、水濕、瘀血等複合候選機轉。
- **Biomedical sources:**
  - NIDDK/NIH — Chronic Kidney Disease: https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd
  - NIDDK/NIH — CKD Tests & Diagnosis: https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis
  - NIDDK/NIH — Identify & Manage Patients with CKD: https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/kidney-disease/identify-manage-patients

## 10. 腎結石 | Nephrolithiasis (kidney stones)
- Suggested ID only: `cond.nephrolithiasis` (exact repo scan required)
- Source family: `NIDDK_kidney`
- **Overview:** 腎結石是泌尿道內形成含礦物質的固體結石。小結石可能自行排出，但阻塞性結石可造成劇痛、出血、感染或尿路阻塞。
- **Biomedical pathophysiology:** 尿液過度飽和與晶體形成可產生鈣結石、尿酸結石、感染性磷酸銨鎂結石或胱胺酸結石。尿量不足、尿液化學環境、感染、代謝疾病、飲食與遺傳因素都會影響風險。
- **Diagnostic signs:** 側腹、背部、下腹或鼠蹊部劇烈疼痛；血尿；噁心或嘔吐；阻塞合併發燒／畏寒需警覺感染性尿路阻塞，須緊急評估
- **Diagnostic tests:** 尿液分析與相關尿液檢查；血液檢查腎功能與相關礦物質／代謝異常；影像定位結石並評估阻塞；反覆或高風險患者可考慮結石分析與 24 小時尿液評估
- **Treatment principles:** 依結石大小、位置與患者穩定度處理疼痛、水分與阻塞；感染性阻塞或腎功能受威脅時需緊急解除阻塞或其他處置；不易自行排出或已有併發症時使用泌尿科取石或碎石治療；依結石種類、尿液化學、水分、飲食與適應症藥物預防復發
- **TCM pathogenesis seed:** 僅作辨證研究種子。腎結石與傳統「石淋」可有症狀層面的重疊，但不可視為完全等同；臨床可依疼痛、血尿、排尿困難、口渴、舌脈等再鑑別下焦濕熱、氣滯、瘀阻或正虛等候選機轉。
- **Biomedical sources:**
  - NIDDK/NIH — Kidney Stones – Definition & Facts: https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/definition-facts
  - NIDDK/NIH — Diagnosis of Kidney Stones: https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/diagnosis
  - NIDDK/NIH — Treatment for Kidney Stones: https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones/treatment

## 11. 痛風 | Gout
- Suggested ID only: `cond.gout` (exact repo scan required)
- Source family: `NIAMS_msk`
- **Overview:** 痛風是高尿酸血症背景下，單鈉尿酸鹽晶體沉積於關節與組織所造成的發炎性關節炎。
- **Biomedical pathophysiology:** 持續尿酸過度飽和可促成晶體形成；晶體沉積會啟動強烈先天免疫發炎反應造成急性發作，長期沉積可形成痛風石並損傷關節結構。
- **Diagnostic signs:** 突然出現劇烈關節痛、腫、熱與發紅；早期發作常為單一關節；慢性痛風可形成痛風石；急性紅腫關節若臨床可能，須鑑別感染性關節炎
- **Diagnostic tests:** 血清尿酸可輔助評估，但單獨不能證明急性發作；關節液或痛風石抽吸找到尿酸鹽晶體具有高度特異性；特定情況可用超音波或雙能量 CT 顯示尿酸鹽沉積
- **Treatment principles:** 急性期以適當抗發炎治療控制發炎；反覆或具臨床重要性的痛風，有適應症時以降尿酸治療降低體內尿酸負荷；處理可調整的危險因子及腎臟／心代謝共病；長期以尿酸追蹤與用藥遵從支持維持控制
- **TCM pathogenesis seed:** 僅作辨證研究種子。急性紅腫熱痛可與濕熱痹阻等候選機轉重疊，慢性反覆期還可能見痰濁、瘀血、脾腎虛等組合；仍須依每次就診的實際表現辨證。
- **Biomedical sources:**
  - NIAMS/NIH — Gout: Diagnosis, Treatment, and Steps to Take: https://www.niams.nih.gov/health-topics/gout/diagnosis-treatment-and-steps-to-take

## 12. 骨質疏鬆症 | Osteoporosis
- Suggested ID only: `cond.osteoporosis` (exact repo scan required)
- Source family: `NIAMS_msk`
- **Overview:** 骨質疏鬆症是骨量下降和／或骨結構惡化的骨骼疾病，使骨強度降低並增加骨折風險。
- **Biomedical pathophysiology:** 骨重塑失衡，使骨吸收超過骨形成，導致骨密度下降與微結構受損。老化、停經、內分泌疾病、營養、活動不足及糖皮質激素等藥物均可影響風險。
- **Diagnostic signs:** 常在骨折前沒有明顯症狀；脆弱性骨折是重要臨床表現；身高變矮、後凸姿勢或背痛可能反映椎體壓迫性骨折；跌倒與平衡障礙會增加骨折風險
- **Diagnostic tests:** DXA 測量骨密度，常評估髖部與脊椎；評估既往骨折與整體骨折風險；適當時以針對性檢驗尋找次發原因；懷疑椎體或其他骨折時安排影像
- **Treatment principles:** 以足夠營養、安全的負重／肌力活動、跌倒預防及降低菸酒風險減少骨折；可處理的次發原因應一併治療；依骨折風險與個別因素選擇骨質疏鬆藥物；追蹤治療效果、遵從性與後續骨折風險
- **TCM pathogenesis seed:** 僅作辨證研究種子。骨質疏鬆不可簡化成「腎虛＝骨質疏鬆」；可依年齡、腰膝痠軟、疲乏、消化狀態、疼痛與舌脈，評估腎精不足、脾腎不足、瘀阻等候選機轉。
- **Biomedical sources:**
  - NIAMS/NIH — Osteoporosis: Diagnosis, Treatment, and Steps to Take: https://www.niams.nih.gov/health-topics/osteoporosis/diagnosis-treatment-and-steps-to-take

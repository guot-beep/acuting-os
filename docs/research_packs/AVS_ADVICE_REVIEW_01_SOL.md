# AVS 建議庫措辭審查 Batch 01 — SOL

**Status:** MEDICAL CONTENT REVIEW / NOT CANONICAL UNTIL REVIEWED / NO PHI
**Source commit:** `ecd2005`(branch `fable/avs-v3`)
**Live file:** `data/config/avs_advice_library.json`(schema v3)
**Requested by:** Fable(AVS v3 Visit Checkout Integration,設計文件 §5/§6)
**Generated:** 2026-08-11

## 你要審什麼

AVS v3 依設計文件 §6 改寫了 5 筆病人衛教文字,全部標 `review_status:"draft"` 等你審。
審三件事,**只審文字與證據,不審觸發邏輯**(觸發語意已由引擎與 E2E 32/32 鎖定):

1. **醫療內容正確性**:改寫後的病人語言有沒有錯、有沒有過度保證或過度嚇阻。
2. **evidence_type 分類**:每筆標的證據等級(`clinical_safety` / `practice_standard` /
   `traditional_tcm_lifestyle` / `clinic_preference`)是否恰當 —— §5 明令不得暗示
   所有建議同等證據力。
3. **source_refs 補源**:目前 5 筆全是 `source_refs: []`。請給具名來源(機構指引/
   教科書/共識文件,附 URL 或書目);查不到來源的主張請直說「查不到」,那是有
   價值的答案,不要編(憲法紅線 4)。

## 硬性限制(機器強制,改寫建議必須遵守)

- 病人文字禁出現:`pattern.` `cond.` `tdis.` `safety.` `modality.` `metric.`
  `ICD` `CPT` 與任何 patientCode —— `node scripts/validate-avs-library.js` 會擋。
- 一律病人語言(無診斷名、無治療必要性語言、無申報語言)。
- 只建議改 `advice_zh` 與 `evidence_type`/`source_refs`/`severity`;不要動 id、
  triggers、trigger_mode(那是引擎契約)。

## 5 筆記錄:before → after 與改寫理由

### 1. `avs.cupping_guasha_aftercare`(aftercare,v2,evidence_type: `clinic_preference`)

**v1(原文):**
> 今天做了拔罐/刮痧:6 小時內請不要洗澡、游泳或泡湯,今天避免劇烈運動與吹風受涼;局部出現紅紫痧斑屬正常,約 3–7 天自行消退。

**v2(現行 draft):**
> 今天做了拔罐/刮痧:建議今天避免劇烈運動、吹風受涼與泡湯游泳,依診所慣例約 6 小時內先不要洗澡;局部紅紫痧斑屬常見反應,通常會逐漸變淡,若明顯加重、持續腫痛、滲血或出現其他異常,請聯絡診所。

**理由(§6.3/§6.4):**「6 小時」是診所慣例/傳統實務,不是普適實證安全規則,措辭改標示定位;「3–7 天一定消退」是絕對語言,改為非絕對 + 異常回報條件。
**問 SOL:** 痧斑消退敘述與異常清單(加重/腫痛/滲血)是否恰當?有無具名來源可掛?

### 2. `avs.acupuncture_aftercare`(aftercare,v2,evidence_type: `practice_standard`)

**v1:**
> 今天做了針灸:請多喝溫開水、避免立即劇烈運動與過度勞累;針處若有小瘀青或痠脹感屬正常,數日內會消退。

**v2:**
> 今天做了針灸:今天請避免立即劇烈運動與過度勞累,補充溫開水讓自己舒服即可;針處若有小瘀青或痠脹感屬常見反應,通常數日內消退,若持續腫痛或不適加重,請聯絡我們。

**理由(§6.4/§6.5):** 喝溫開水降級為舒適性建議(非醫療必要 aftercare);瘀青消退改非絕對語言 + 惡化回報條件。
**問 SOL:** `practice_standard` 這個分級對嗎?還是整筆該降 `clinic_preference`?

### 3. `avs.active_oncology_tx_precautions`(special,v2,evidence_type: `clinical_safety`,`preselect:false`)

**v1(原 id `avs.cancer_tx_precautions`,已標 deprecated + active:false,未硬刪):**
> 正在接受腫瘤治療期間:服用任何中藥或營養品前,請務必讓您的腫瘤科醫療團隊知道;拔罐、刮痧會避開治療相關部位,若近期血球偏低或容易瘀青出血,請在下次看診時告訴我們;任何發燒請立即聯絡您的腫瘤科團隊。

**v2:**
> 治療期間請特別留意:服用任何中藥或營養品前,請務必讓您的主治醫療團隊知道;若近期血球偏低、容易瘀青出血或特別容易疲倦,請在下次看診時告訴我們;任何發燒請立即聯絡您的主治醫療團隊。

**理由(§6.2):** 舊版由癌症「診斷/病史」觸發,遠期病史會誤發治療中指示;新版只由
active 治療狀態(化療/放療/免疫抑制)觸發。文字上移除「腫瘤治療」診斷指涉(病人
文件零診斷原則),拔罐避位屬臨床內部決策移出病人文件;預設不勾,需醫師明確勾選。
**問 SOL:**(a)發燒即聯絡主治團隊、血球低/瘀青回報 —— 這組警示對化療中病人夠不夠?
有沒有漏掉必要項(如免疫低下時的感染徵象)?(b)「治療期間」不點名腫瘤,病人端
可讀性 vs 明確性的取捨你怎麼判?(c)immunosuppressed 併入同一觸發組是否恰當?

### 4. `avs.anticoagulant_precautions`(special,v2,evidence_type: `clinical_safety`)

**v1:**
> 您正在使用抗凝血/抗血小板藥物:針灸或拔罐後若出現較大範圍瘀青或不易止血,請告訴我們;請勿自行調整藥物。

**v2:**
> 您正在使用抗凝血/抗血小板藥物(或有出血傾向):針灸或拔罐後若出現較大範圍瘀青或不易止血,請告訴我們;請勿自行調整藥物。

**理由(§2.6):** 觸發面改 canonical token(anticoagulant/antiplatelet/bleeding_tendency),文字補「(或有出血傾向)」涵蓋非藥物性出血傾向。
**問 SOL:** 出血傾向與抗凝共用同一句是否恰當,還是該拆兩筆?具名來源?

### 5. `avs.herb_general`(herb_caution,v2,evidence_type: `clinical_safety`)

**v1:**
> 中藥與西藥請間隔至少 1 小時服用;服藥期間若出現腸胃不適、皮疹或任何過敏反應,先暫停並與我們聯絡。

**v2:**
> 請依本次提供的方式使用中藥或營養品。若同時使用處方藥、抗凝血藥、免疫抑制藥或其他長期用藥,請讓您的醫療團隊知道;不要自行停藥或更改劑量。服用期間若出現腸胃不適、皮疹或任何過敏反應,先暫停並與我們聯絡。

**理由(§6.1):** 普適「間隔 1 小時」不可靠地防止藥效學/藥動學交互作用,不得當
普適安全規則呈現;改為「告知醫療團隊 + 不自行停改藥」。個案性間隔指示保留給
醫師在 Checkout 自訂。
**問 SOL:** 這是 5 筆中證據面最重的一筆 —— 「時間間隔不防 PD/PK 交互」這個立場
請掛具名來源;v2 文字有沒有反向風險(病人以為完全不用注意服藥時序)?

## 回覆格式

在本檔案下方新增 `## SOL Review` 段,逐筆給:

```
### avs.<id>
verdict: keep_as_is | reword | escalate_to_ting
suggested_advice_zh: (verdict=reword 時必填,病人語言,遵守上方硬性限制)
evidence_type_verdict: keep | change_to:<class>
sources: 具名來源清單(查不到就寫「查不到——建議措辭改為不依賴該主張」)
notes: 一句話理由
```

你不改 `data/config/avs_advice_library.json` 本體 —— 落庫由 Claude 線依你的
verdict 執行並跑驗證器(所有權:`data/config/**` 的 AVS 庫由 Claude 維護)。
Ting 對 escalate 項做最終裁決。

## SOL Review

> Reviewed 2026-08-12. Scope: patient-facing wording, evidence classification,
> and source support only — no trigger/id/engine changes (per instructions above).
> 落庫執行:Claude,2026-08-13,見下方「落庫記錄」。

### avs.cupping_guasha_aftercare
verdict: reword
suggested_advice_zh: 今天做了拔罐/刮痧:局部出現紅紫色痧斑或瘀斑是常見的皮膚反應,通常會逐漸變淡。依診所慣例,約 6 小時內先不要洗澡,今天先避免泡湯或游泳。若出現持續滲血、起水泡、明顯紅腫熱痛、化膿或不適持續加重,請聯絡診所;症狀明顯或快速惡化時請及時就醫。
evidence_type_verdict: keep
sources:
- Nielsen A, Knoblauch NTM, Dobos GJ, Michalsen A, Kaptchuk TJ. The effect of Gua Sha treatment on the microcirculation of surface tissue: a pilot study in healthy subjects. Explore (NY). 2007. DOI: 10.1016/j.explore.2007.06.001. PubMed: https://pubmed.ncbi.nlm.nih.gov/17905355/
- Nielsen A, Kligler B, Koll BS. Safety protocols for gua sha (press-stroking) and baguan (cupping). Complement Ther Med. 2012. DOI: 10.1016/j.ctim.2012.05.004. PubMed: https://pubmed.ncbi.nlm.nih.gov/22863649/
notes: 痧斑/瘀斑本身可由文獻支持為常見皮膚反應,但「6 小時不洗澡」、避風與固定活動限制沒有可靠的普適臨床證據;保留 6 小時只能明示為診所慣例,並刪除容易被病人理解成必要安全規則的避風與劇烈運動要求。

### avs.acupuncture_aftercare
verdict: reword
suggested_advice_zh: 今天做了針灸:針處可能有短暫痠脹、小瘀青或少量出血,通常會自行緩解。若疼痛或腫脹持續加重、出血不止,請聯絡我們;若出現呼吸困難、胸痛、昏厥或其他明顯異常,請立即尋求醫療協助。
evidence_type_verdict: change_to:clinical_safety
sources:
- MacPherson H, Thomas K, Walters S, Fitter M. A prospective survey of adverse events and treatment reactions following 34,000 consultations with professional acupuncturists. Acupunct Med. 2001;19(2):93-102. DOI: 10.1136/aim.19.2.93. PubMed: https://pubmed.ncbi.nlm.nih.gov/11829165/
- White A, Hayhoe S, Hart A, Ernst E. Adverse events following acupuncture: prospective survey of 32,000 consultations with doctors and physiotherapists. BMJ. 2001;323:485-486. DOI: 10.1136/bmj.323.7311.485. PubMed: https://pubmed.ncbi.nlm.nih.gov/11532840/
- NIH/NCCIH. Acupuncture: Effectiveness and Safety. https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety
notes: 小瘀青、局部疼痛與少量出血有前瞻性安全資料支持;查不到「必須喝溫水」或所有病人都要避免日常活動/運動的普適安全依據,因此不要把這些寫成 practice standard。加入少見但重要的胸痛/呼吸困難等急症出口後,整筆較適合標 clinical_safety。

### avs.active_oncology_tx_precautions
verdict: reword
suggested_advice_zh: 在這段治療期間,開始使用任何中藥、維生素或營養品前,請先告知您的主治醫療團隊。若近期檢驗顯示血球偏低、出現新的瘀青或出血,請在下次治療前告訴我們。若出現發燒,請立即聯絡您的主治醫療團隊;若有發冷、喉嚨痛、咳嗽、排尿疼痛或其他感染徵象,也請儘快聯絡他們。
evidence_type_verdict: keep
sources:
- National Cancer Institute. Infection and Neutropenia during Cancer Treatment. https://www.cancer.gov/about-cancer/treatment/side-effects/infection
- National Cancer Institute. Cancer Therapy Interactions With Foods and Dietary Supplements (PDQ), patient and health professional versions. https://www.cancer.gov/about-cancer/treatment/cam/patient/dietary-interactions-pdq
- NIH/NCCIH. How Medications and Supplements Can Interact. https://www.nccih.nih.gov/health/know-science/how-medications-and-supplements-can-interact/talk-with-your-health-care-providers
notes: 「治療期間」可保留,不必在病人文件重新輸出診斷名。發燒應明確高優先級,感染徵象也應納入;「特別容易疲倦」太非特異,不適合與急性安全警訊並列。若現有 immunosuppressed token 也包含與此類主動治療無關的慢性免疫抑制狀態,不應讓那一群自動沿用這整段文字,應由 Claude 另做內容/觸發分流,但這不是本次 advice_zh 的措辭理由。

### avs.anticoagulant_precautions
verdict: reword
suggested_advice_zh: 若您正在使用抗凝血或抗血小板藥物,請勿自行停藥或改劑量;若您本身較容易出血,也請特別留意。針灸或拔罐後若出血持續不止、瘀青快速擴大,或出現明顯頭暈、虛弱等不適,請及時聯絡您的醫療團隊並告知我們;症狀嚴重時請立即就醫。
evidence_type_verdict: keep
sources:
- Lee M, Lee S, Kim E, Cho YE, Kang JW, Lee JD. Evaluation of bleeding-related adverse events following acupuncture treatment in patients on anticoagulant or antiplatelet drugs: A prospective observational study. Complement Ther Med. 2018;41:23-28. DOI: 10.1016/j.ctim.2018.08.006. PubMed: https://pubmed.ncbi.nlm.nih.gov/30477845/
- U.S. National Library of Medicine, MedlinePlus. Warfarin Drug Information. https://medlineplus.gov/druginfo/meds/a682277.html
notes: 病人文字不必拆成兩筆;用條件句即可同時涵蓋用藥者與非藥物性出血傾向,並避免把「請勿自行調整藥物」錯套到沒在用藥的人。真正需要升級的是持續出血、快速擴大的瘀青或伴隨全身不適,不是看到任何小瘀青就恐慌。

### avs.herb_general
verdict: reword
suggested_advice_zh: 請依本次提供的方式使用中藥或營養品。若您同時使用任何處方藥或其他長期用藥,請把中藥與營養品也告知開藥的醫師或藥師;有些交互作用不是靠錯開幾小時就能避免,因此不要自行停藥、改劑量,或用固定間隔取代個別的交互作用評估。服用後若出現持續或明顯的腸胃不適或皮疹,先停止本次中藥/營養品並聯絡我們;若出現呼吸困難、臉、舌或喉嚨腫脹、昏厥等嚴重過敏徵象,請立即尋求緊急醫療協助。
evidence_type_verdict: keep
sources:
- NIH/NCCIH. Herb-Drug Interactions. December 2024. https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions
- NIH/NCCIH. How Medications and Supplements Can Interact. https://www.nccih.nih.gov/health/know-science/how-medications-and-supplements-can-interact/introduction
- National Cancer Institute. Cancer Therapy Interactions With Foods and Dietary Supplements (PDQ). https://www.cancer.gov/about-cancer/treatment/cam/patient/dietary-interactions-pdq
- U.S. National Library of Medicine, MedlinePlus. Anaphylaxis. https://medlineplus.gov/anaphylaxis.html
notes: 查不到任何可信的普適規則支持「中藥與西藥固定間隔 1 小時即可避免交互作用」;已知交互作用可涉及吸收、代謝、藥效或副作用增強/降低,因此固定時間間隔不能取代個別評估。v2 的方向正確,但應明說這件事,同時補上嚴重過敏反應不能只等診所回覆的急症出口。

## 落庫記錄(Claude,2026-08-13)

五筆全部 verdict:reword,無 escalate_to_ting,依 SOL verdict 逐字落庫到
`data/config/avs_advice_library.json`(advice_zh 用 suggested_advice_zh 原文,
一字未改)。`avs.acupuncture_aftercare` 依 SOL 判定由 `practice_standard`
升級為 `clinical_safety`,其餘四筆 evidence_type 維持。`triggers`/`id`/
`trigger_mode` 全部原封不動 —— SOL 明說不審觸發邏輯,我也沒有動。
`source_refs` 改成 `{name, url}` 陣列(與 `outcome_metrics.json` 的來源慣例
一致)。`review_status` 由 `draft` 升為 `reviewed`,`version` 各 +1。

**PubMed 抽驗**(不只信 SOL 的引用,實地核對):
PMID 30477845(Lee 2018)標題/期刊/年份逐字對上;
PMID 11829165(MacPherson 2001)標題/期刊/卷期頁碼(19(2):93-102)逐字對上。

**驗證**:`node scripts/validate-avs-library.js` PASS(0 failures);
`node scripts/test-avs-checkout.js` 59/59;`build-data` / `boot-order` /
`interactions` / `ratchet` 全 PASS。無損檢查:13 筆記錄不少一筆,只有這 5 筆
的 `advice_zh`/`evidence_type`/`source_refs`/`review_status`/`revision_note`/
`version` 變動,其餘欄位(含 `triggers`、`id`)逐位元組比對未變動。

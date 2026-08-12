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

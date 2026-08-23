# COND_FULLDETAIL_EYESON_03 — 全細節病症卡人眼審查（第 62–92 筆，收尾）

狀態：**findings ledger + 修正紀錄。** 原始審查（本檔案 §0–§3 主文）沒有動
`data/**` 一個字元；下方修正狀態總覽是後續修正批次（`codex/cond-eyeson-fixes-3`）
補記的。
Branch：`codex/cond-eyeson-3`（自 `origin/codex/pattern-v2` tip `9abec04`）
日期：2026-08-12
接續：`COND_FULLDETAIL_EYESON_01.md`（1–30）與 `COND_FULLDETAIL_EYESON_02.md`（31–61）。
發現編號自 **F-37** 起、機械批次編號自 **B15** 起，延續前兩部分。

**本檔完成全細節 92 筆的覆蓋。§3 附三部分合併總表。**

## 修正狀態總覽（2026-08-12，branch `codex/cond-eyeson-fixes-3`）

| 批次/Finding | 狀態 | commit |
|---|---|---|
| B15 (4)：`&hellip;`／U+2025 → `…`（pcos/peptic_ulcer/tension_headache/tinnitus） | **FIXED** | `9fb98b9` |
| B16 (3)：`field_sources.acupuncture_scope_*` 改抄該欄自己的 `source`（primary_dysmenorrhea/rheumatoid_arthritis/trigeminal_neuralgia） | **FIXED**（= F-47A） | `9fb98b9` |
| B17 (1)：`cond.raynaud` `acupuncture_scope_en` can_treat/precautions 對調 | **FIXED**（= F-42） | `9fb98b9` |
| B18 (1)：`cond.tinnitus` `red_flags_zh[1].rationale` 英文片語改中文 | **FIXED** | `9fb98b9` |
| B19 (1)：`cond.tension_headache` `tcm_patterns[2].symptoms_zh` 簡體字形止血 | **FIXED** | `9fb98b9` |
| B20 (4)：四張頭痛卡 `import_artifacts[].reason` 假註記改寫 | **FIXED**（= F-46；僅改註記，四欄部落格原文本身仍 OPEN，需走 import_artifacts 流程） | `9fb98b9` |
| F-37 `cond.pcos`（SAFETY） | **RELOCATED**（`etiology_zh`/`etiology_en`/`western_pathology_zh`/`western_pathology_en` 四欄搬走留空，逐一驗證無可分離的 PCOS 專屬內容；`herb_formulas` 49 筆含抵當湯等破血逐瘀方，非 ledger 列為同一區塊，維持 OPEN 需 Ting 重新策展或整欄留空） | `8a26da9` |
| F-38 `cond.peptic_ulcer`（SAFETY） | **RELOCATED**（局部搬移，非整欄：`etiology_zh` 僅搬走決明子/附子理中湯自行用藥軼事二段，周邊寒熱辨證文字保留；`western_pathology_zh`/`_en` 僅搬走誤植 NIDDK 名下的胃藥藥理錯誤句；`field_sources.western_pathology_zh/_en` 改正為 cloudtcm.com。`瓜蒂散` 於 `herb_formulas` 維持 OPEN 需 Ting；`etiology_zh` 內「黃連黃芩快速降火」「半夏瀉心湯效果很快」療效宣稱與「心臟病其實是胃脘經絡阻塞」因果推論本批未動，仍 OPEN 需 Ting） | `8a26da9` |
| 孕期三張卡（`hyperemesis_gravidarum`/`ivf_support`/`luteal_phase_defect`） | **復核確認已止血**（F-19/F-21，`codex/cond-eyeson-fixes-2` 完成，未重做） | `29d3f8d`（merged `41e77c5`） |

---

## §0 範圍與方法

### 取樣（與前兩部分同一條指令）

```bash
node scripts/audit-cr010-condition-detail-maturity.js
# → tmp/cr010/cr010_condition_detail_maturity_live.json
#   live_condition_count 505 / full_detail_count 92 / partial 70 / skeleton 343
```

取 `maturity === "FULL_DETAIL_CANDIDATE"` 的 92 筆，依 **id 字母序**取第 **62–92** 筆
（`cond.myocardial_infarction` … `cond.vestibular_neuritis`，含派工單點名的
`cond.pcos` · `cond.myocardial_infarction` · `cond.pulmonary_embolism`）。
前 61 筆與第 1、2 部分逐字相符，已核對。

### 方法

每一筆從 `data/pathology/condition_canon_shortlist.json` 完整取出、格式化後**整份逐行讀完**
（31 筆共 ~7,400 行 / ~301 KB）。判準依派工單六項：
假中文/隱形英文 · 中英不忠實 · 臨床胡說 · 樣板句 · 錯位內容 · 來源紀律。

機器掃描只用來**量化已用眼睛確認的問題有多廣**，並**驗證每一條跨檔案主張**：

```bash
# 樣板治療區塊全庫散佈（2026-08-12 實測）
tcm_patterns 逐字等同「氣血不和證/八珍湯 + 臟腑虛弱證/補中益氣湯」：73 / 505（全細節 25、本批 5）
acupoint_protocols 逐字等同 ["足三里 (ST36)","合谷 (LI4)","三陰交 (SP6)","中脘 (CV12)"]：70 / 505（全細節 23）
herb_formulas 逐字等同 ["八珍湯","補中益氣湯","柴胡疏肝散"]：72 / 505（全細節 25）
# 第 2 部分記錄 74/71/73、全細節 26 —— 差的那 1 筆是 cond.breech_presentation，已於 e8843e1 止血

# 句子型樣板在本批的殘留
western_pathology_zh === "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"：全庫 31 筆，**本批 0 筆**
etiology_zh === "正氣不足，臟腑功能失調，氣血津液運化不利。"：全庫 31 筆，**本批 0 筆**

# 跨檔案驗證
data/herbs/formulas.json：224 筆 / 223 個 unique 中文名
data/pathology/pattern_registry.json：151 個 pattern id
本批 31 筆的 related_patterns **全部解析得到**（C6 = 0）
data/acupoints/point_id_manifest.json：925 個正規 point id
本批物件 shape 的 acupoint code：51 個 distinct，**沒有一個對得上 manifest**
```

### 保守原則

沿用前兩部分：只列**能引用原文並說出為什麼錯**的項目。純風格差異不列。
`red_flags` 舊式字串陣列 vs 五欄結構的混用屬 schema 演進，只在 §1 標註。
`import_artifacts` 裡已隔離的爬蟲原文**不重複計為缺陷**（那是正確處置的證據），
只在該處置本身有問題時才列（見 F-45、F-46）。

---

## §1 逐筆判定（31 筆）

| # | id | 判定 | 一行說明 |
|---|---|---|---|
| 62 | `cond.myocardial_infarction` | MINOR | `aliases_zh` 1 vs `aliases_en` 2；`western_context` 中英兩側都內嵌「不應對單一troponin切點做硬性規範」這種寫給編者的指示 |
| 63 | `cond.neck_pain_stiff` | **DEFECT** | 樣板治療區塊；急性落枕的穴位處方裡沒有任何一個頸部局部穴 |
| 64 | `cond.nephrolithiasis` | MINOR | `etiology_zh` 第一個字就是「危險因子包括…」——整欄是危險因子清單，與 `risk_factors` 重複 |
| 65 | `cond.neutropenia` | CLEAN | 純 NCI；治療三欄不存在（誠實留空）；紅旗五欄具名分頁 |
| 66 | `cond.osteoporosis` | **DEFECT** | 樣板治療區塊；同卡 `precautions` 才寫「避免高強度手法」，處方欄卻是通用四穴 |
| 67 | `cond.pcos` | **DEFECT（SAFETY）** | **本批最嚴重。** `etiology_zh` 是 3,500 字部落格文，內含 PCOS 病人自行停用荷爾蒙、把中藥從一天 1 次改 3 次「月經兩天後就來了」的軼事，且**中英全譯** |
| 68 | `cond.peptic_ulcer` | **DEFECT（SAFETY）** | 會員半夜胃痛「馬上去吃『附子理中湯』這種熱藥」的自行用藥軼事；`western_pathology_zh` 的胃藥藥理錯誤被掛在 NIDDK 名下 |
| 69 | `cond.peripheral_neuropathy` | **DEFECT** | 樣板治療區塊；`western_context` 中英兩側都內嵌 backtick 包住的 repo id |
| 70 | `cond.pneumothorax` | MINOR | 全批安全欄寫得最好的一張，但把兩條**針灸專屬**的風險因子與紅旗掛在 `NHLBI - Pleural Disorders` 名下 |
| 71 | `cond.polycythemia_vera` | MINOR | `can_treat` 填的是警語不是範圍（F-35 族第 2 例）；`aliases_zh` 1 vs `aliases_en` 2 |
| 72 | `cond.pots` | CLEAN | 明寫「不應將診斷簡化為『站立時脈搏變快』」；紅旗具名 NIH/PMC 共識回顧 |
| 73 | `cond.primary_dysmenorrhea` | **DEFECT** | 50 方傾倒含桃核承氣湯／少腹逐瘀湯／血府逐瘀湯，而同卡紅旗第 3 條正是「疑似懷孕合併劇痛」；12 個證型 blob 在痛經卡上條列「男性勃起障礙」「陰囊濕冷」 |
| 74 | `cond.pulmonary_embolism` | CLEAN | 紅旗六條全 `emergency` 且理由具體；範圍欄明寫不得建議自行停抗凝 |
| 75 | `cond.pulmonary_hypertension` | CLEAN | WHO 分類清楚；`etiology_*` 整組不存在（誠實留空，不硬填） |
| 76 | `cond.raynaud` | **DEFECT** | 樣板治療區塊；**`acupuncture_scope_en` 的 `can_treat` 與 `precautions` 兩欄內容互相對調**，安全警語跑到適應範圍欄 |
| 77 | `cond.restless_legs` | **DEFECT** | 樣板治療區塊；同卡 `risk_factors` 明列「妊娠，尤其第三孕期」，處方欄卻是合谷＋三陰交 |
| 78 | `cond.rheumatoid_arthritis` | **DEFECT** | 病因欄是共用的關節炎散文（`_en` 自承），內含「任何造疼痛的關節炎就會自動消失」；50 方含 9 首麻黃類外感方與烏頭湯 |
| 79 | `cond.rsv_infection` | CLEAN | 純 CDC；嬰兒呼吸暫停列 `emergency`；範圍欄明寫感染管制 |
| 80 | `cond.sciatica` | **DEFECT** | `import_artifacts` 與 `acupuncture_scope`（引 NICE NG59 反對意見）是全 92 筆最佳，但**搬走的部落格理論所生出的 34 穴／50 方仍留在 live 欄位**；`code: "BL31,32,33,34"` |
| 81 | `cond.sickle_cell_disease` | CLEAN | 明寫鐮狀細胞特徵不是疾病的別名；紅旗含 priapism 與急性胸症候群 |
| 82 | `cond.t2dm` | MINOR | 4 方 5 穴為人工策展且切題（胰俞 EX-B3／內庭／玉女煎），但 `evidence: label_derived` 沒有具名任何一張藥品標籤 |
| 83 | `cond.tension_headache` | **DEFECT** | `western_pathology_zh` 是未清洗部落格文、**無 `_en`、無 field_sources**，含無來源的「80%」與已被推翻的偏頭痛血管學說；`acupoint_protocols` 48 穴（全庫最大）；`evidence: guideline` 卻沒具名任何系統性回顧 |
| 84 | `cond.thrombocytopenia` | CLEAN | **明文拒絕虛構血小板門檻**（「不可套用未經驗證的通用血小板數值門檻」）——憲法紅線 4 的正面示範 |
| 85 | `cond.tinnitus` | MINOR | 治療三欄策展得最好（3 方 5 穴全為耳周穴），但 `classical_references_zh` 裡塞著「至少上百種中藥」的方劑清單；`_zh` 紅旗內出現英文片語 `treatment window` |
| 86 | `cond.transient_ischemic_attack` | CLEAN | 紅旗明寫「不應因神經學檢查恢復正常而以針灸繼續處置」——全批最具體的一條停手指令 |
| 87 | `cond.trigeminal_neuralgia` | MINOR | 3 方 5 穴策展良好，但 `red_flags` 只有一條，且那一條是「應接受醫療評估」而非停手條件；同卡自己說要用 MRI 排除次發病因，紅旗欄卻沒有 |
| 88 | `cond.tuberculosis_disease` | CLEAN | `herb_formulas: []` · `acupoint_protocols: []` · `related_patterns: []` ——誠實的空 |
| 89 | `cond.type_1_diabetes` | CLEAN | `can_treat` 一句「針灸無法取代胰島素治療」，比多數卡的長篇更清楚 |
| 90 | `cond.urticaria` | MINOR | 3 方 5 穴策展良好、紅旗含蕁麻疹血管炎；但古籍欄用 ASCII 直引號且引號巢狀錯位，無 `_en` |
| 91 | `cond.valvular_heart_disease` | MINOR | `etiology_zh` 與 `western_context` 中英兩側都內嵌「可能值得建立獨立的子記錄」這種編者指示；`_en` 兩處 "depending" 缺 "on" |
| 92 | `cond.vestibular_neuritis` | MINOR | 三條紅旗的 `source` 全是 `CR-010 pack diagnostic signs` / `treatment principles` —— 引用自己的研究包，不是可回溯的外部來源 |

**合計：CLEAN 10 · MINOR 10 · DEFECT 11。**（第 1 部分 10/8/12；第 2 部分 3/9/19）

> 本批 DEFECT 比例回落到第 1 部分的水準，原因與第 2 部分同一條規律的反面：
> **樣板治療區塊在字母序上的聚集在此段結束**（本批只剩 5 筆，是全族最後 5 筆）。
> 扣掉樣板族後，本批 26 筆為 CLEAN 10 · MINOR 10 · DEFECT 6，與前兩批同量級。

---

## §2 逐項發現（所有 MINOR / DEFECT）

嚴重度：**SAFETY**（可能直接導致病人受傷或延誤）· **CLINICAL**（臨床上錯，會誤導判斷）· **QUALITY**（可信度/可追溯性受損）

---

### F-37 · SAFETY · `cond.pcos` · `etiology_zh` / `etiology_en` / `western_pathology_zh`

**原文（`etiology_zh` 節錄，全欄約 3,500 字）：**

```
千言萬語不如直接舉一個例子，某會員被醫生診斷為多囊卵巢綜合症，年紀輕輕就停經了，
只能依賴荷爾蒙療法，持續服用了一年。

後來他心想，一直服用荷爾蒙不是辦法，就開始運用中藥，果然很有效。
…
後來別人告訴她，是因為吃中藥的量不夠多，因為她過去每天只吃1次中藥，
改吃一天3次之後，月經兩天後就來了。

她分享改善閉經的中藥組成其實很單純，就只有「四物湯」＋「香附」＋「桂枝」而已，
希望可以幫助到需要的人。
```

**為什麼錯：**

1. **直接抵銷同卡自己的 `co_management`。** 這張卡的 `acupuncture_scope_zh.co_management`
   寫的是「**不建議病人自行停用排卵誘導藥物、口服避孕藥或胰島素敏感化劑**」。
   同一張卡的病因欄，卻把一位病人「心想一直服用荷爾蒙不是辦法」而自行改用中藥，
   描述成成功案例。這比第 1 部分 F-02（`cond.depression`）更嚴重：
   那裡是引述醫院的話，這裡是**具體的停藥敘事加上成功結局**。
2. **無來源的劑量指導（憲法紅線 4）。** 「每天只吃1次…改吃一天3次之後，月經兩天後就來了」
   是劑量三倍化的建議，加上一個兩天見效的療效宣稱，然後補一句「希望可以幫助到需要的人」。
   `field_sources` 對 `etiology_zh` / `etiology_en` **完全沒有條目**
   （該欄只有 `risk_factors_*` 與 `acupuncture_scope_*` 四個 key）。3,500 字會渲染出去而不帶任何來源。
3. **`_en` 是逐段忠實全譯。** 這一點與 F-20（`cond.fibromyalgia`）相反 ——
   fibromyalgia 的 `_en` 把軼事濾掉了，這一筆沒有。**英文讀者會拿到一模一樣的停藥敘事。**
   中英不忠實在這裡不是缺陷，忠實才是。
4. **主題錯位（整筆等級）。** `etiology_zh` 與 `western_pathology_zh` 寫的都是
   **月經稀少／閉經**的泛論，不是 PCOS 的病因。整整 3,500 字裡沒有胰島素阻抗、
   沒有高雄性素、沒有 LH/FSH —— 而模板 §9「三條容易做錯的規則」第 2 條**正是拿 PCOS 當例子**：

   > 「PCOS 的病理生理要在西醫框架下站得住腳（胰島素阻抗、高雄激素、LH/FSH），
   > **不要用「腎虛痰濕」取代它**。」

   這張卡是那條規則的完整反例。
5. **假中文三處**（驗證器抓不到，只有眼睛能抓）：
   - 「月經稀少甚至**必經**的女性」——「閉經」之訛
   - 「**月**稀少或閉經的女性」——「月經稀少」掉字
   - 「最好的**法**就是多運動」——「方法」掉字
6. **簡體圈術語混入**：「多囊卵巢**綜合症**」（同卡 `name_zh` 是多囊性卵巢症**候群**）、
   「**下丘腦**」（同卡他處與台灣慣用為下視丘）。同卡兩套術語。
7. **無來源的實證宣稱**：「連現代醫學都研究發現，月經週期與心臟健康呈現正相關，
   月經不規律罹患心臟病的機率較高」——沒有任何出處。
8. **商業品牌汙染**：「雲端中醫」在 live 欄位出現多次。
9. `classical_references_zh` 用 ASCII 直引號 `"` 而非「」，含 `&hellip;`，無 `_en`。

**同筆的第二個安全問題（處方欄）：**

`herb_formulas` 49 筆傾倒，其中含 **抵當湯**（水蛭、虻蟲）· **下瘀血湯**（蟅蟲）·
**大黃蟅蟲丸** · **桃核承氣湯** · **少腹逐瘀湯** · **膈下逐瘀湯** · **血府逐瘀湯**
—— 七首破血逐瘀／攻下方，出現在一張**生育相關**、且自己的 `red_flags` 第 4 條就是
**「疑似懷孕」**的卡上，沒有任何孕期註記。

`tcm_patterns` 7 個 blob 是通用證型症狀辭典：**氣血兩虛、血虛、心脾兩虛、腎精不足
四個證型，在一張只有女性會得的卡上，各自條列「男性勃起障礙」。**

**建議修法：** 不適合小修。`etiology_zh/_en` 與 `western_pathology_zh/_en` 四欄整段搬
`import_artifacts`（`cond.sciatica`／`cond.frozen_shoulder` 已建立先例），依 NICHD 重寫；
`herb_formulas` 重新策展或整欄留空。**這一筆建議 Ting 先看過再動。**

---

### F-38 · SAFETY · `cond.peptic_ulcer` · `etiology_zh` / `western_pathology_zh`

**原文（`etiology_zh` 節錄）：**

```
2025年4月期間某會員分享，他在這個月開始著迷的喝決明子茶，幾乎每天都喝一大罐，
剛開始沒有感覺，漸漸的，她發現自己竟然會開始胃痛了。

有一天晚上，他睡到一半竟然胃脘痛醒來，他猜想這可能是肚子太寒造成的，
結果馬上去吃「附子理中湯」這種熱藥，結果沒想到幾分鐘之後就緩解了。
```

**為什麼錯：**

1. **無執照自行用藥軼事，而且用的是含附子的方。** 一位會員半夜胃痛、自行推斷病機、
   自行服用附子理中湯，被描述成幾分鐘見效的成功案例。這與第 2 部分 F-20
   （`cond.fibromyalgia` 的四逆湯軼事）同構，但發生在一張**紅旗四條全是
   吐血／黑便／穿孔／休克**的消化性潰瘍卡上：夜間上腹痛正是潰瘍出血或穿孔的表現，
   而卡片示範的是「自己吃熱藥」。
2. **`western_pathology_zh` 的藥理是錯的，而且掛在 NIDDK 名下。** 原文：

```
治療胃痛最簡單的方法，就是服用胃藥，是最常被運用的藥物之一。
然而，現代醫學發現胃藥就是中和胃酸的鹼性物質，長期服用會造成很多副作用。
```

   「胃藥就是中和胃酸的鹼性物質」把制酸劑與 PPI／H2 阻斷劑混為一談，而這張卡自己的
   `western_context_zh` 寫的標準治療是「制酸治療、根除幽門螺旋桿菌」。
   **關鍵在來源**：`field_sources.western_pathology_zh` 標的是 `["NIDDK — Peptic Ulcers"]`。
   NIDDK 沒有寫過「胃藥長期服用會造成很多副作用，所以中醫的寒熱框架可以補位」。
   這是第 1 部分 F-10 的**加重版**：F-10 是把針灸範圍掛給 NIH，這一筆是
   **把一段藥理錯誤掛給 NIH**，而且該段的 `_en` 還加碼寫成
   "supporting a complementary TCM heat/cold framework for prevention"。
3. **治療建議寫進病因欄並附療效宣稱**：「通常可以運用「黃連」、「黃芩」相關的中藥來快速降火」、
   「服用「半夏瀉心湯」改善效果很快」。
4. **臨床上危險的因果推論**：「古人對於胃痛與心臟痛常常一起綜合探討，
   **更認為心臟病其實是胃脘附近的經絡氣血阻塞所造成的**」——
   這張卡的紅旗四條全是出血／穿孔，**沒有任何一條要求對上腹痛排除急性冠心症**。
   卡片自己把胃痛與心痛連在一起，卻沒有把對應的安全條款補上。
5. **中英不忠實，錯在中文側**：`etiology_en` 是有距離的改寫，**完全沒有翻譯決明子／附子理中湯
   那一段軼事**；`western_pathology_en` 則忠實翻了胃藥那段並加碼。同一筆內兩種處理。
6. `source_type: "sourced_research_pack"`，但 `field_sources.etiology_*` 誠實標
   `cloudtcm.com disease record` —— **`source_type` 說謊，`field_sources` 說實話**
   （第 2 部分 F-20 同一觀察，本批第 3 例）。

**同筆的處方欄：** `herb_formulas` 50 筆傾倒，含 **瓜蒂散**（甜瓜蒂，**峻烈催吐**）。
在一張消化性潰瘍卡上列催吐方，是出血與穿孔的直接風險，清單裡沒有任何註記。
另有小承氣湯／調胃承氣湯／大黃附子湯三首攻下方。
`acupoint_protocols` 33 穴、物件 shape、非正規 code，含**極泉 HT01**（腋窩深部，同第 2 部分 F-36 觀察）。
`tcm_patterns` 11 個 blob 為通用辭典：**脾胃氣虛**在胃潰瘍卡上條列「月經不調」「遺精」「四肢癱」；
**氣滯血瘀**條列「子宮崩漏」。

**建議修法：** 同 F-37。**建議 Ting 先看過。**

---

### F-39 · CLINICAL · `cond.tension_headache` · `western_pathology_zh`（無 `_en`、無來源）

**原文（節錄，全欄約 700 字）：**

```
造成頭痛的實在太多了，例如：肌肉拉扯、發炎、外傷、血管病變、代謝異常、藥物副作用、
顱內疾患、五官或顱神經引起的各種頭痛。當一位病人去找醫師治療頭痛，這位醫師比病人頭更痛。
```

```
壓力性頭痛：這是最常見的頭痛，佔所有頭痛患者的80%。
```

```
偏頭痛：偏頭痛主要與腦部神經傳導物質失衡，導致腦部血管收縮有關，是相當複雜的一種頭痛。
```

```
像這種原因不明的症狀，最適合中醫的概念，畢竟這個問題也困擾了過去所有的中國人。
```

**為什麼錯：**

1. **這是第 2 部分 F-24（`cond.migraine`）的逐字重演，結構完全相同：**
   未清洗的部落格文 + **`western_pathology_en` 這個 key 根本不存在** +
   `field_sources` **完全沒有 `western_pathology_zh` 的條目**。
   700 字會渲染出去、只有中文、不帶任何來源。
2. **無來源的數字（憲法紅線 4）**：「佔所有頭痛患者的80%」。
3. **已被推翻的機轉當成事實**：「偏頭痛主要與腦部神經傳導物質失衡，導致腦部**血管收縮**有關」
   —— 血管學說在現代神經科已被三叉神經血管／皮質擴散抑制取代。
   而這一段是寫在一張 `content_source: ["ichd3", ...]` 的卡上。
4. **部落格語氣寫進病理生理欄**：「這位醫師比病人頭更痛」。
5. **「現代醫學解釋不了，所以最適合中醫」的修辭**，與 F-24（migraine）、
   第 2 部分 F-20（fibromyalgia）、本批 F-38（peptic_ulcer）四筆同一句型。

**同筆其他（皆已用眼睛確認）：**

- **`acupoint_protocols` 48 穴 —— 全庫最大的一份。** 物件 shape、非正規 code，
  含迎香 `LI20`、庫房 `ST14`、伏兔 `ST32`、環跳 `GB30`、委中 `BL40`、湧泉 `KI01`、聽宮 `SI19`。
- `herb_formulas` 50 筆傾倒，含大承氣湯／小承氣湯（攻下）、
  大青龍湯／麻黃湯／小青龍湯／射干麻黃湯／麻杏石甘湯／越婢湯／麻黃附子細辛湯（麻黃類）、
  四逆湯／乾薑附子湯／桂枝加附子湯（附子類）。一張良性原發性頭痛卡。
- **簡體字形混入 `_zh`**：`tcm_patterns[2].symptoms_zh` 的「苔薄白微**黄**」（繁體應作黃）。
  同第 2 部分 F-27（hypertension「臨床綜合征」）那一族。
- **`classical_references_zh` 第一句是「本文主要參考《中醫症狀鑑別診斷學》所撰寫而成。」**
  —— 那是部落格的出處聲明，不是古籍引文，被留在古籍欄的最前面。
  同欄另有 `&hellip;` ×2 與一個 `‥`（U+2025 兩點省略號）殘留：「氣血&hellip;‥思身半以上屬陽」。無 `_en`。
- **`acupuncture_scope.evidence: "guideline"`** —— **本批 31 筆唯一標 guideline 的一筆**，
  `note` 寫「部分系統性回顧支持…證據等級中等」，但 `source` 是
  `curriculum/conditions 課程講義 + AcuTing OS 整理（依 ICHD-3 及標準神經科文獻）`，
  **沒有具名任何一份系統性回顧**。模板 §5.6 對 `guideline` 的定義是「有臨床指引或系統性回顧支持」。
  對照組就在同一批裡：`cond.sciatica` 具名了 NICE NG59（而且結論對執業者不利），
  卻誠實把自己標成 `evidence: "unknown"`。**同一批、同一欄，兩種相反的紀律。**
- `field_sources` 只有 6 個 key，缺 summary／western_context／western_pathology／red_flags。

---

### F-40 · CLINICAL · `cond.rheumatoid_arthritis` · `etiology_zh` / `western_pathology_zh`

**原文（`etiology_zh` 節錄）：**

```
古人運用「溫陽化濕」的方法，讓寒氣與濕氣離開體內，體內經絡陽氣充足，運行自然通暢，
任何造疼痛的關節炎就會自動消失，這就是古人治療關節炎的基本原理。
```

```
這時候最好的方法，就是全身的經絡拍打，先讓自己的全身經絡疏通再說…
至於要精確拍打哪些經絡？其實運用經絡檢測，只要是紅色的就努力拍打即可，非常簡單。
```

**為什麼錯：**

1. **對類風濕性關節炎宣稱「自動消失」。** RA 是侵蝕性自體免疫疾病，
   同一張卡的 `western_context_zh` 自己寫「疾病修飾抗風濕藥物治療會改變預後」、
   `acupuncture_scope` 寫「不建議病人自行調整用藥」。病因欄卻說任何關節炎都會自動消失。
   （附帶：「任何**造**疼痛的關節炎」是「造成」掉字，假中文。）
2. **內容主題錯位，而且 `_en` 自己承認了。** `etiology_en` 結尾寫著：

```
(This essay is shared arthritis-family content, not written specifically for RA's
 autoimmune pathophysiology.)
```

   自承不等於已修 —— 卡片仍會照樣渲染，**而且這句自承本身就寫在讀者看得到的 `_en` 欄位裡**
   （第 2 部分 F-32 那一族）。內文實際上大量在講退化性關節炎與**痛風**
   （「為什麼痛風總是出現在大腳趾？」「痛風容易出現在男性、肥胖者…」）。
3. **無來源的保健食品清單**：`western_pathology_zh` 列「葡萄糖胺、膠原蛋白、魚油、
   甲基硫醯基甲烷(MSM)、薑黃…這些都是相當熱門也非常多人在使用」，
   `field_sources` 對這一欄標的是 `CloudTCM disease record`。
4. **「中醫也是屬於一種另類療法」** —— 把整個中醫層定位成 alternative therapy，
   寫在一張要給執業者看的卡上，與產品定位互相矛盾（列為觀察，不列為缺陷計數）。
5. **古籍引文的字形錯誤**：《症因脈治．痹證論》引文作「**陽氧多**，陰氣少」——
   應為「陽**氣**多」，「氧」是抓取訛字。同一段用 ASCII 直引號 `"` 切分四段引文，
   全部包在同一組「」內（第 2 部分 F-29B 同構）。

**同筆處方欄：** `herb_formulas` 50 筆含
**麻黃湯、大青龍湯、小青龍湯、麻杏石甘湯、越婢湯、越婢加朮湯、越婢加半夏湯、
射干麻黃湯、麻黃加朮湯、麻黃附子細辛湯、小青龍加石膏湯 —— 十一首麻黃類方**，
外加**烏頭湯**（生烏頭）、甘草附子湯／桂枝附子湯／附子湯（附子類）、生化湯（產後方）、
七釐散。無任何註記。`acupoint_protocols` 13 穴、物件 shape、非正規 code。
`field_sources.acupuncture_scope_*` 標 `NIAMS — Arthritis and Rheumatic Diseases`，
而該欄自己的 `source` 是 research pack（F-30 族，見 F-47）。

---

### F-41 · CLINICAL · 樣板治療區塊（本批 5 筆 —— **全族點名完成**）

**受影響（本批）：** `cond.neck_pain_stiff` · `cond.osteoporosis` ·
`cond.peripheral_neuropathy` · `cond.raynaud` · `cond.restless_legs`

**原文（5 筆與前兩部分的 20 筆逐字相同）：**

```json
"tcm_patterns": [
  {"pattern_zh": "氣血不和證", "formula_zh": "八珍湯",
   "acupoints_zh": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)"]},
  {"pattern_zh": "臟腑虛弱證", "formula_zh": "補中益氣湯",
   "acupoints_zh": ["中脘 (CV12)", "氣海 (CV6)", "脾俞 (BL20)"]}
],
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"],
"herb_formulas": ["八珍湯", "補中益氣湯", "柴胡疏肝散"]
```

**本批新增的四個觀察：**

1. **`cond.restless_legs` 是這一族最接近孕期風險的一筆。** 同卡 `risk_factors_zh[2]`：

```json
{"factor": "妊娠，尤其第三孕期", "direction": "increases", "modifiable": false,
 "source": "NIH/NCBI — Restless Legs Syndrome: Causes and Consequences (PMC)"}
```

   `etiology_zh` 也明列「鐵缺乏、腎衰竭、**妊娠**、周邊神經病變…可能誘發或加重症狀」。
   卡片自己把第三孕期指認為主要族群，處方欄卻是合谷＋三陰交。
   這不是產科卡，但**照這張卡執業，會把慎用穴用在第三孕期病人身上**。詳見 §3 的孕期族清單。
2. **`cond.raynaud` 自己打自己。** 同卡 `precautions` 寫
   「避免在缺血或已潰瘍的**手指**上進行侵入性局部針刺或拔罐」，
   而樣板處方的第二個穴就是**手上的合谷**。
3. **`cond.neck_pain_stiff` 的 `related_patterns` 是對的**
   （`pattern.wind_damp_bi`、`pattern.qi_stagnation_blood_stasis`，切題），
   `tcm_patterns` 卻寫「氣血不和證」。兩欄互相矛盾 —— 與第 1 部分 F-07.4（anxiety）、
   第 2 部分 F-25.1（influenza／menieres／menorrhagia）同一模式。
4. **局部穴缺席的模式在此收尾且完全一致**：落枕沒有頸部穴、骨質疏鬆的
   `precautions` 才剛講完「避免高強度手法」處方欄就給通用四穴、
   周邊神經病變沒有任何肢端穴、雷諾現象沒有八邪／十宣。

**全族收尾數字（機器可重現）：**

```
全庫 tcm_patterns 樣板：73 / 505    acupoint_protocols 樣板：70 / 505    herb_formulas 樣板：72 / 505
全細節 92 筆中：25 筆
  第 1 部分點名 8（其中 cond.breech_presentation 已於 e8843e1 止血 → 剩 7 筆仍在）
  第 2 部分點名 13
  本批點名 5
  7 + 13 + 5 = 25 ✓ 全細節層的樣板族**已全數具名**
```

（`acupoint_protocols` 少 2 筆是因為 `cond.gout` 與 `cond.chronic_low_back_pain` 該欄為 `[]`，
見第 1 部分 F-18 與第 2 部分 F-25.3。）

---

### F-42 · CLINICAL · `cond.raynaud` · `acupuncture_scope_en` 兩欄內容對調

**原文（並列）：**

```json
"acupuncture_scope_zh": {
  "can_treat":   "可作為輔助性照護以改善局部循環與症狀舒適度，不可取代續發性疾病的病因治療",
  "precautions": "避免在缺血或已潰瘍的手指上進行侵入性局部針刺或拔罐；新發持續性缺血須轉診血管評估"
}
"acupuncture_scope_en": {
  "can_treat":   "Avoid aggressive local needling/cupping on ischemic or ulcerated digits;
                  new persistent ischemia requires vascular assessment",
  "precautions": "May be adjunctive for local circulation and comfort but does not replace
                  treatment of the underlying cause of secondary disease"
}
```

**為什麼錯：**
兩欄的內容**整段互換**了 —— `_en` 的 `can_treat` 裝的是 `_zh` 的 `precautions`，反之亦然。

這不是翻譯強度落差（第 1 部分 F-15）也不是語意相反（第 2 部分 F-22），
是**欄位錯位**：模板 §5.6 定義 `can_treat` 是「這個病針灸的適應範圍」、
`precautions` 是「部位、深度、手法、體位的具體限制」。
英文讀者在「適應範圍」欄讀到一句禁令，在「注意事項」欄讀到一句許可。
`cond.raynaud` 的紅旗含組織壞死／壞疽，這一欄是安全層。

**建議修法：** `acupuncture_scope_en` 的 `can_treat` 與 `precautions` 兩個值對調即可。
純機械，可入即時修正批次（B17）。

---

### F-43 · CLINICAL · 未策展的抓取傾倒與峻毒方（本批 6 筆）

**受影響：** `cond.pcos`(49方) · `cond.peptic_ulcer`(50方/33穴) ·
`cond.primary_dysmenorrhea`(50/30) · `cond.rheumatoid_arthritis`(50/13) ·
`cond.sciatica`(50/34) · `cond.tension_headache`(50/48)

**A. 峻烈／有毒方出現在不相干的卡上且無任何註記（憲法紅線 4）**

```
cond.pcos                 → 抵當湯（水蛭虻蟲）· 下瘀血湯（蟅蟲）· 大黃蟅蟲丸 · 桃核承氣湯
                            · 少腹逐瘀湯 · 膈下逐瘀湯 · 血府逐瘀湯   ← 卡上紅旗含「疑似懷孕」
cond.peptic_ulcer         → 瓜蒂散（催吐）· 小承氣湯 · 調胃承氣湯 · 大黃附子湯 · 四逆湯
cond.primary_dysmenorrhea → 桃核承氣湯 · 少腹逐瘀湯 · 血府逐瘀湯 · 附子湯 · 附子理中湯
                            ← 卡上紅旗含「疑似懷孕合併劇痛需排除異位妊娠」
cond.rheumatoid_arthritis → 烏頭湯 · 甘草附子湯 · 桂枝附子湯 · 附子湯 · 生化湯 + 11 首麻黃類方
cond.sciatica             → 烏頭湯 · 烏頭桂枝湯 · 天雄散 · 大陷胸湯（甘遂）· 大黃蟅蟲丸
                            · 大黃附子湯 · 大活絡丹 · 續命湯
cond.tension_headache     → 大承氣湯 · 小承氣湯 · 四逆湯 · 乾薑附子湯 + 9 首麻黃類方
```

第 2 部分的結論在此完全成立並可再收緊：
**只要 `herb_formulas` 超過 ~25 筆，裡面就一定有峻毒方 —— 本批 6 筆，6 筆全中。**

**B. 清單內容與病種無關的例子（可直接引用）**

```
cond.rheumatoid_arthritis：麻黃湯、大青龍湯、小青龍湯、越婢湯、射干麻黃湯、麻杏石甘湯、
                          越婢加朮湯、越婢加半夏湯、麻黃加朮湯、小青龍加石膏湯、
                          麻黃附子細辛湯 —— 十一首麻黃類方，另有生化湯（產後方）
cond.primary_dysmenorrhea：金鎖固精丸（遺精）、七寶美髯丹（鬚髮）、還少丹、白虎加人參湯
cond.tension_headache    ：acupoint_protocols 含迎香LI20、庫房ST14、伏兔ST32、環跳GB30、
                          委中BL40、湧泉KI01、聽宮SI19 —— 48 穴中大量與頭痛無關
cond.pcos                ：tcm_patterns 的氣血兩虛／血虛／心脾兩虛／腎精不足
                          四證，全部條列「男性勃起障礙」
cond.primary_dysmenorrhea：tcm_patterns 的寒凝肝脈條列「陰囊濕冷」、
                          下焦濕熱條列「男性勃起障礙」、脾胃氣虛條列「遺精」
```

**C. 方名存在性（已逐一對照 `formulas.json` 224 筆 / 223 個 unique 中文名）**

本批 6 筆的 `herb_formulas` 共 **88 個 distinct 名稱在 formulas.json 查無**。
與第 2 部分同樣的分類原則：**「查無」＝本庫未建卡，不等於該方不存在**。
逐一目視後，**本批沒有發現任何新的「非方名」** —— 88 個全部是真實方名
（麻黃附子細辛湯、越婢湯、烏頭湯、天雄散、瓜蒂散、三痹湯、上中下通用痛風丸…），
只是未建卡，點進去會是死連結。散佈最廣的幾個：

| 名稱 | 出現於本批 |
|---|---|
| 理中湯 | pcos · peptic_ulcer · primary_dysmenorrhea · sciatica · tension_headache（5 卡） |
| 黃耆桂枝五物湯 | peptic_ulcer · rheumatoid_arthritis · sciatica · tension_headache（4 卡） |
| 麻黃附子細辛湯 · 越婢湯 · 越婢加朮湯 · 麻黃加朮湯 | rheumatoid_arthritis · sciatica · tension_headache（各 3 卡） |

**建議修法：** 同 F-25／F-26 —— 走 `import_artifacts` 流程整欄搬走。
方名建卡屬 `data/herbs/**`（方劑線）所有權，本線只能回報。

---

### F-44 · CLINICAL · `cond.primary_dysmenorrhea` · 生育情境卡的處方欄

**原文（`acupoint_protocols` 30 穴節錄）：**

```json
[{"name_zh":"三陰交","code":"SP06"}, {"name_zh":"合谷","code":"LI04"},
 {"name_zh":"至陰","code":"BL67"}, {"name_zh":"環跳","code":"GB30"},
 {"name_zh":"腕骨","code":"SI04"}, {"name_zh":"液門","code":"SJ02"}, …]
```

**紅旗第 3 條（同卡）：**

```json
"疑似懷孕合併劇痛需排除異位妊娠"
```

**為什麼列出來：**
這**不是**第 1 部分 F-01／第 2 部分 F-19 那組樣板處方 —— 它是 30 穴的抓取傾倒。
但結果相同且更難察覺：一張自己把「疑似懷孕」寫進紅旗的卡，
處方欄同時出現 **合谷（LI4）· 三陰交（SP6）· 至陰（BL67）** 三個穴。
至陰是所有教材中用於矯正胎位／催產的代表穴，出現在痛經卡上沒有任何條件說明。

**保守起見不列為 SAFETY 而列為 CLINICAL：** 原發性痛經本身不是妊娠情境，
三陰交與合谷在非孕期痛經是常規用穴。問題在於**這張卡同時涵蓋了懷孕鑑別**，
而 30 穴清單沒有任何孕期分流。與 F-41 的 `cond.restless_legs` 屬同一類
「非產科卡但涵蓋孕期族群」的風險。

**同筆其他：** 50 方傾倒（見 F-43）；12 個 `tcm_patterns` blob 為通用辭典（見 F-43B）；
`field_sources.acupuncture_scope_*` 標 `MedlinePlus — Period Pain`，
而該欄自己的 `source` 是 research pack（F-30 族，見 F-47）；
`classical_references_zh` 有內容、無 `_en`。

---

### F-45 · CLINICAL · `cond.sciatica` · 搬家做對了，搬家生出的欄位沒跟著清

**加分項必須先記錄。** 這一筆的 `import_artifacts` 是全 92 筆做得最完整的一件事：
把 CloudTCM 部落格原文（含「某會員…針了『靈骨穴』、『大白穴』之後，30秒內疼痛完全消失」、
「經方名家JT叔叔就曾經提到『麻黃附子細辛湯』＋『芍藥甘草湯』…」）**整段搬走**，
並以具名來源重建 `etiology_zh`（curriculum 課程講義）與 `western_pathology_zh`（MedlinePlus）。

`acupuncture_scope` 更是全 92 筆的標竿：

```json
"note": "英國 NICE NG59 明確建議不將針灸列為坐骨神經痛的常規治療選項；
         此為執業範圍謹慎建議，非 guideline-endorsed 療效主張"
"evidence": "unknown"
```

具名一份**結論對執業者不利**的指引，並且據此把自己標成 `unknown` 而不是 `guideline`。
全 92 筆只有這一筆與 `cond.ivf_support`（第 2 部分 F-21）做到這一點。

**為什麼仍是 DEFECT：**

被搬走的那篇部落格文，其論證核心是「腳三陽經的坐骨神經痛可以用**手三陰經**對應穴改善
（魚際穴、尺澤穴、少海穴…效果都是很好）」。**文章搬走了，這套理論生出來的穴位留在 live 欄位：**

```json
"acupoint_protocols": [ …, {"name_zh":"魚際","code":"LU10"}, {"name_zh":"尺澤","code":"LU05"},
  {"name_zh":"少海","code":"HT03"}, {"name_zh":"少府","code":"HT08"},
  {"name_zh":"中府","code":"LU01"}, {"name_zh":"肩髃","code":"LI15"},
  {"name_zh":"天宗","code":"SI11"}, {"name_zh":"曲垣","code":"SI13"}, … ]  // 共 34 穴
```

一張坐骨神經痛卡上有中府、肩髃、天宗、曲垣這些肩上肢穴。
**這是本次審查最有價值的流程發現：`import_artifacts` 只清了散文，沒有清散文的產物。**
F-43 那 6 筆的 50 方／30 穴，很可能全部屬於同一個未處理的層。

另有一個**新的 shape 違規**（前兩部分未見）：

```json
{"name_zh": "八髎", "code": "BL31,32,33,34"}
```

一個 `code` 欄位裡放四個逗號串接的代碼。這在任何格式下都不是一個 id，
`point_id_manifest.json`（925 個 id）解析不到，且無法用 F-17／F-36 的映射規則處理。

**`import_artifacts[].reason` 的問題見 F-46。**

---

### F-46 · QUALITY · `import_artifacts[].reason` 的假註記已擴大為 4 筆（headache 族）

**原文（4 筆逐字相同的尾句）：**

```
(western_pathology_zh on this record is separately C10-shared-verbatim boilerplate
 — out of scope for this batch, left untouched for the C10/batch-2 pass.)
```

**受影響（機器可重現，全庫）：**
`cond.tension_headache` · `cond.migraine` · `cond.cluster_headache` · `cond.migraine_vestibular`

**為什麼錯：**
第 2 部分 F-24.5 在 `cond.migraine` 上發現這一句是**假的** ——
該欄不是那句 31 筆共用的樣板句，是部落格敘事文。
本次確認**這不是單筆失誤，是同一批四張頭痛卡共用的一句假註記**。

後果具體且可預測：任何人照這條 ledger 去跑 C10 pass，會在這四筆上找不到預期的樣板句，
於是**四欄部落格全文一起被跳過**。其中 `cond.tension_headache` 與 `cond.migraine`
的該欄還同時是「無 `_en` + 無 field_sources」的狀態（F-39）。

**同族的第二個問題（延續第 2 部分 F-31）：**

```
"reason": "CloudTCM blog-narrative import junk (member anecdotes, ad embed codes,
           rhetorical blog voice) … Field cleared to an honest gap;
           no replacement content invented this batch."
```

全庫 **44 筆記錄 / 88 個 artifact，其中 64 個用這一句**（第 2 部分記錄 42 筆 / 34 句，期間已增長）。
句尾「Field cleared to an honest gap; no replacement content invented this batch」
對 `cond.sciatica` **是假的** —— 該筆兩欄都已用具名來源重建。
第 2 部分已就 `frozen_shoulder`／`knee_osteoarthritis`／`lumbar_disc_herniation` 三筆指出同一點，
`cond.sciatica` 是第 4 筆。

---

### F-47 · QUALITY · `field_sources` 把針灸相關內容掛給不談針灸的來源（本批 3 筆 + 1 個新變體）

**A. 既有型（F-10 / F-30 族），本批 3 筆：**

| id | `field_sources.acupuncture_scope_zh` | 該欄自己的 `source` |
|---|---|---|
| `cond.primary_dysmenorrhea` | `MedlinePlus — Period Pain` | `AcuTing OS Disease Knowledge Research Pack — Batch K …` |
| `cond.rheumatoid_arthritis` | `NIAMS — Arthritis and Rheumatic Diseases` | `AcuTing OS Disease Knowledge Research Pack — Batch I …` |
| `cond.trigeminal_neuralgia` | `NIDCR — Trigeminal Neuralgia` | `AcuTing OS Disease Knowledge Research Pack — Batch G …` |

**累計：第 1 部分 5 筆 + 第 2 部分 3 筆 + 本批 3 筆 = 11 筆。** 其餘 81 筆做法正確。
修法完全機械：把 `field_sources.acupuncture_scope_zh/_en` 改抄該欄自己的 `source` 值。

**B. 新變體 —— 把針灸專屬條目掛進 `risk_factors` 與 `red_flags`（`cond.pneumothorax`）：**

```json
{"factor": "近期胸部／鎖骨上方深刺針灸病史", "direction": "increases",
 "modifiable": true, "source": "NHLBI - Pleural Disorders"}
```

```json
{"finding": "近期胸部針灸、創傷或處置後新發胸痛或呼吸困難", "urgency_level": "emergency",
 "recommended_action": "立即醫療評估排除氣胸", "source": "NHLBI - Pleural Disorders Treatment"}
```

**這兩條的臨床內容是本批最有價值的安全條款之一** —— 氣胸是針灸最重要的醫源性併發症，
把它寫成危險因子與紅旗完全正確。**問題只在 source**：NHLBI 的 Pleural Disorders 頁面
沒有寫過針灸。F-10 族到目前為止只出現在 `acupuncture_scope_*`，
這是**第一次出現在 `risk_factors` 與 `red_flags`** —— 也就是安全層。
同卡 `acupuncture_scope.evidence: "label_derived"` 亦無任何藥品標籤（見 F-51）。

**建議修法：** B 需要具名一份真的談針灸氣胸的來源（WHO 針灸安全指引／不良事件系統性回顧），
或改標為 `clinical_judgment`。**內容不要動，只動 source。**

---

### F-48 · QUALITY · 內部編輯備註寫進讀者可見欄位（本批 4 筆）

**受影響：** `cond.myocardial_infarction` · `cond.peripheral_neuropathy` ·
`cond.valvular_heart_disease` · `cond.rheumatoid_arthritis`（見 F-40.2）

**原文：**

```
// cond.myocardial_infarction · western_context_en
"The card should not hard-code a single troponin cutoff because assays and clinical criteria vary."
// 同筆 _zh：「不應對單一troponin切點做硬性規範，因檢驗方式與臨床標準各有不同。」
```

```
// cond.peripheral_neuropathy · western_context_zh
「本卡已與既有的 `cond.diabetic_neuropathy` 並存，互為母子概念，非同一實體」
```

```
// cond.valvular_heart_disease · etiology_zh
「此為上位分類概念，主動脈瓣狹窄、二尖瓣逆流等個別瓣膜疾病，
  依現有正典涵蓋範圍與介面需求，可能值得建立獨立的子記錄。」
```

**為什麼錯：**
「The card should not…」「本卡已與既有的…並存」「依現有正典涵蓋範圍與**介面需求**」
是寫給**編者**的指示，不是寫給執業者的臨床脈絡。
`western_context_*` 與 `etiology_*` 依模板 §8.2 會渲染進大卡的「① 定義／② 病因病機／④ 診斷鑑別」。
`cond.peripheral_neuropathy` 那句還內嵌 backtick 包住的 repo id。

**累計：第 2 部分 2 筆（gallstone_disease · giant_cell_arteritis）+ 本批 4 筆 = 6 筆。**

**本批新增的觀察：** `cond.myocardial_infarction` 的這句**中英兩側都有**，
所以不是翻譯漏網，是原稿就寫進去的；`cond.valvular_heart_disease` 的 `_en` 同一句
還帶兩個文法錯誤（"depending current canonical coverage"、"depending valve and severity"，
兩處都缺 "on"）——`_en` 欄位的英文品質本身也是讀者看得到的。

---

### F-49 · QUALITY · `acupoint_protocols` 兩種 shape、兩套 code 格式（本批 5 筆）

**受影響：** `cond.tension_headache`(48) · `cond.sciatica`(34) · `cond.peptic_ulcer`(33) ·
`cond.primary_dysmenorrhea`(30) · `cond.rheumatoid_arthritis`(13)

**全庫：物件 shape 的 `acupoint_protocols` 共 49 / 505 筆**
（第 1 部分 4 筆 + 第 2 部分 7 筆 + 本批 5 筆 = 16 筆已具名）。

**本批的 51 個 distinct code，對照 `point_id_manifest.json`（925 個正規 id）：**

```
SP03 HT07 HT01 LV03 REN12 LV14 PC06 PC03 LI04 REN13 LU04 SJ05 SJ04 LU05 SI08 SI06
REN04 SP06 SP09 KI01 SP08 DU04 REN03 REN06 KI02 KI03 SP01 SJ03 SJ02 SI03 SI04 DU14
HT03 HT08 KI07 LV08 BL31,32,33,34 LU01 SJ23 DU20 SJ11 LV02 DU16 BL02 ST08 SI09 KI09
PC08 SP04 REN17 SJ10
→ 命中 manifest：0 / 51
```

映射規則（同 F-17／F-36）：`LV→LR` · `DU→GV` · `REN→CV` · `SJ→TE` · 去補零。
**新增例外：`BL31,32,33,34`（八髎）無法用映射規則處理**（見 F-45），需單獨決定表示法。

**注意：這一條不是要求改 id 格式，而是指出這 5 筆用的根本不是本專案的 id。**

---

### F-50 · QUALITY · 古籍欄：ASCII 引號、內容錯位、單邊（本批 7 筆）

**A. `classical_references_zh` 有內容、無 `classical_references_en`（C5，本批 7 筆）**

`cond.pcos` · `cond.peptic_ulcer` · `cond.primary_dysmenorrhea` ·
`cond.rheumatoid_arthritis` · `cond.tension_headache` · `cond.tinnitus` · `cond.urticaria`

**累計：第 1 部分 5 + 第 2 部分 8 + 本批 7 = 20 筆已具名。全庫實測 52 筆。**

**B. 古籍欄裝的不是古籍（`cond.tinnitus`，本批新型）**

```
註2: 耳鳴的辨證有：風熱襲肺、肝火上炎…可以改善耳鳴的中藥非常多，例如：桑菊飲、
當歸龍薈丸、天麻鉤藤飲、逍遙散、四物湯、耳聾左慈丸、天王補心丹、交泰丸、補中益氣湯、
二陳湯、通竅活血湯&hellip;等等至少上百種中藥。
```

這是一份**方劑清單加上一個無來源的「至少上百種中藥」宣稱**，被放在古籍出處欄位裡。
同一筆的治療三欄（3 方 5 穴，全為耳周穴）是本批策展得最好的 ——
被策展掉的內容跑到古籍欄去了。

同型另一筆：`cond.tension_headache` 的古籍欄第一句是
「本文主要參考《中醫症狀鑑別診斷學》所撰寫而成。」（見 F-39）。

**C. ASCII 直引號取代中文引號（本批 3 筆）**

```
// cond.urticaria — 引號巢狀錯位，無法判斷引文邊界
《中醫臨證備要》："溫熱病身熱不退，發出紅色小點，稱為"疹"與發斑原因相同。…"
```

`cond.pcos`（《蘭室秘藏》《濟陰綱目》）· `cond.urticaria`（《外感溫熱篇》《中醫臨證備要》）·
`cond.rheumatoid_arthritis`（《症因脈治》四段引文包在同一組「」內）。
第 2 部分 F-29B 在 `cond.frozen_shoulder` 記錄的是「兩本書混進同一組「」」，
`cond.urticaria` 更進一步：**引號內又出現同一種引號**，任何解析器都會斷錯。

**D. `&hellip;` 未解碼（本批 live 欄位 4 筆）**

`cond.pcos` · `cond.peptic_ulcer` · `cond.tension_headache`（另含一個 `‥` U+2025）· `cond.tinnitus`
（`cond.sciatica` 的 `&hellip;` 只在 `import_artifacts` 內，已隔離，不計）

**累計：第 1 部分 4 + 第 2 部分 3 + 本批 4 = 11 筆。**

---

### F-51 · QUALITY · `acupuncture_scope` 的分級與 `can_treat` 誤用（本批 4 筆）

**A. `evidence: "label_derived"` 但沒有任何藥品標籤（2 筆）**

| id | note 實際講的事 | 問題 |
|---|---|---|
| `cond.t2dm` | 「降血糖藥物調整涉及血糖控制安全」 | 方向對，但 `source` 只有 research pack／NIDDK，沒有具名任何一張標籤 |
| `cond.pneumothorax` | 「此為胸部／鎖骨上方深刺相關的安全謹慎建議」 | 這是**針刺解剖**風險，與藥品標籤無關，應為 `clinical_judgment` |

模板 §5.6 的範例要求 `dailymed:a454cd24#BOXED_WARNING` 這種粒度。
累計同族：第 1 部分 F-12（eczema）· 第 2 部分 F-27（hypertension）· 本批 2 筆 = **4 筆**。

**B. `evidence: "guideline"` 但沒有具名指引或系統性回顧（1 筆）**

`cond.tension_headache` —— 見 F-39。全 92 筆只有 3 筆標 `guideline`：
`cond.ivf_support`（具名 ASRM，第 2 部分 F-21）· `cond.hypertension`（第 2 部分 F-27，標 label_derived）·
本筆。**只有這一筆沒有具名任何東西。**

**C. `can_treat` 填的是警語不是範圍（1 筆，F-35 族第 2 例）**

```json
// cond.polycythemia_vera
"can_treat": "不得以針灸放血替代醫療性放血治療"
```

與第 2 部分 F-35（`cond.hemochromatosis`：「不得將針灸放血與醫療性放血混為一談」）
是**同一句話的兩個變體**，出現在兩張血液科卡上。
兩張卡都因此**從頭到尾沒有回答**「這個病針灸能做什麼、或該不該做」。
留空反而誠實（模板明寫 `unknown` 是正確初始值）。

---

### F-52 · QUALITY · red flags 的來源與內容品質（本批 5 筆）

**A. 不可回溯的通則（F-11 族，本批 1 筆）**

```json
// cond.tinnitus — 4 條中的 2 條
{"finding": "單側耳鳴合併不對稱聽力損失或平衡障礙", "source": "標準耳鼻喉科警示症狀原則"}
{"finding": "頭部外傷後新發耳鳴", "source": "標準耳鼻喉科警示症狀原則"}
```

與第 1 部分 F-11 的 `cond.allergic_rhinitis` **完全同一個字串**。
累計：allergic_rhinitis · dry_eye · eczema · tinnitus = **4 筆**。

**B. 引用自己的研究包當成來源（本批新型，1 筆）**

```json
// cond.vestibular_neuritis — 3 條全部
{"source": "CR-010 pack diagnostic signs + HINTS 文獻"}
{"source": "CR-010 pack diagnostic signs"}
{"source": "CR-010 pack treatment principles"}
```

「CR-010 pack」是本專案自己的研究包，「HINTS 文獻」沒有具名任何一篇。
這比 A 更難察覺，因為它看起來像有出處。內容本身正確（HINTS 用於區分中樞/周邊確實是標準做法）。

**C. 把來源機構的症狀清單整份搬進 red_flags（本批 1 筆）**

`cond.myocardial_infarction` 的五條紅旗是
「新發持續性胸悶或胸痛」「不明原因呼吸困難」「**冒冷汗**」「暈厥或近乎暈厥」「**嚴重虛弱**」，
全部標 `emergency`、全部標 `NHLBI - Heart Attack Symptoms`。
這是 NHLBI 症狀清單的直接移植，不是**鑑別性的**停手條件 ——
「冒冷汗」單獨一項標 emergency 會讓紅旗計數失去分辨力（模板 §8.1 小卡要顯示數量與最高等級）。
內容不錯，但這一欄的用途是「什麼時候該停手轉診」，不是「這個病有哪些症狀」。

**D. red_flags 只有一條而且那條不是紅旗（本批 1 筆）**

```json
// cond.trigeminal_neuralgia — 全部
["頻繁或持續性臉部疼痛，尤其一般止痛藥無效且牙科已排除牙源性原因時，應接受醫療評估"]
```

這是「該去看醫生」，不是停手條件。而同一張卡的 `western_context_zh` 自己寫著
「核磁共振有助排除**次發性病因**」、`risk_factors` 列「多發性硬化症病史」。
**卡片知道有次發性病因要排除，紅旗欄卻沒有把它寫成一條。**
（首發年齡偏輕、雙側、合併感覺缺損 → 疑 MS 或結構性病灶，這類條目全缺。）

**E. 非因子條目混入 `risk_factors`（第 2 部分 F-34 族，本批 0 筆）** —— 本批未發現，記錄為止。

---

### F-53 · QUALITY · `_en` / `_zh` 陣列長度不等 + `etiology` 與 `risk_factors` 重複

**A. aliases 長度不等（違反憲法紅線 5，本批 2 筆）**

```json
// cond.myocardial_infarction
"aliases_zh": ["心臟病發作"]                    // 1
"aliases_en": ["MI", "Heart Attack"]            // 2

// cond.polycythemia_vera
"aliases_zh": ["紅血球增多症（鑑別用）"]         // 1
"aliases_en": ["PV", "Erythrocytosis (differential context)"]   // 2
```

累計：第 2 部分 2 筆（functional_dyspepsia · giant_cell_arteritis）+ 本批 2 筆 = **4 筆**。
索引錯位：按 index 配對的消費端會把「心臟病發作」配到 "MI"，讓 "Heart Attack" 落單。

**次要**：`cond.polycythemia_vera` 的別名本身帶編者標記
（「（鑑別用）」／"(differential context)"），屬 F-48 族的輕度變體。

**B. `etiology_*` 實質是 `risk_factors` 清單（第 1 部分 F-14 族，本批 1 筆）**

```json
// cond.nephrolithiasis
"etiology_zh": "危險因子包括尿量過低、尿液化學成分異常、飲食、代謝性疾病、感染、
                藥物及遺傳因子，依結石成分而異。"
```

這一筆比第 1 部分的 `cond.aneurysm` 更明確 —— **病因欄的第一個詞就是「危險因子」**。
模板 §5.5 明定兩欄分工：病因病機回答「這個病怎麼發生的」（機轉），
危險因子回答「哪些人會得、我該問什麼」（問診用）。兩欄寫同一份清單等於少一欄。
（同卡 `western_pathology_zh` 才是真正的機轉：「結晶形成並聚集成石，遷移進入輸尿管時…」——
所以內容沒丟，只是放錯欄。）

---

## §3 統計與跨部分合併總表

### 判定分佈（本批 31 筆）

| 判定 | 筆數 | 佔比 | 第 1 部分 | 第 2 部分 |
|---|---|---|---|---|
| CLEAN | 10 | 32% | 10（33%）| 3（10%）|
| MINOR | 10 | 32% | 8（27%）| 9（29%）|
| DEFECT | 11 | 36% | 12（40%）| 19（61%）|

### 發現的嚴重度分佈（本批 17 條，F-37 – F-53）

| 嚴重度 | 條數 | 編號 |
|---|---|---|
| SAFETY | 2 | F-37, F-38 |
| CLINICAL | 7 | F-39, F-40, F-41, F-42, F-43, F-44, F-45 |
| QUALITY | 8 | F-46 – F-53 |

---

### ★ 全細節 92 筆最終總表

| 判定 | 第 1 部分 (1–30) | 第 2 部分 (31–61) | 第 3 部分 (62–92) | **合計 (92)** |
|---|---|---|---|---|
| CLEAN | 10 | 3 | 10 | **23（25%）** |
| MINOR | 8 | 9 | 10 | **27（29%）** |
| DEFECT | 12 | 19 | 11 | **42（46%）** |

**發現總數 53 條**（F-01 – F-53）：**SAFETY 7 · CLINICAL 20 · QUALITY 26。**

SAFETY 七條：
F-01 breech_presentation（已止血）· F-02 depression（已止血）· F-19 hyperemesis_gravidarum ·
F-20 fibromyalgia · F-21 ivf_support / luteal_phase_defect · **F-37 pcos** · **F-38 peptic_ulcer**。

---

### ★ 樣板治療區塊：全族清單（**25 筆，已全數具名**）

全庫 `tcm_patterns` 樣板 73 / 505，其中落在全細節 92 筆的 25 筆為：

| 第 1 部分（7 筆仍在 + 1 已止血） | 第 2 部分（13） | 第 3 部分（5） |
|---|---|---|
| `cond.achilles_tendinopathy` | `cond.gout` | `cond.neck_pain_stiff` |
| `cond.acute_lumbar_sprain` | `cond.hashimoto` | `cond.osteoporosis` |
| `cond.amenorrhea` | `cond.hip_osteoarthritis` | `cond.peripheral_neuropathy` |
| `cond.anxiety` | `cond.hyperemesis_gravidarum` | `cond.raynaud` |
| `cond.carpal_tunnel` | `cond.influenza` | `cond.restless_legs` |
| `cond.chronic_low_back_pain` | `cond.ivf_support` | |
| `cond.diminished_ovarian_reserve` | `cond.lateral_epicondylitis` | |
| ~~`cond.breech_presentation`~~（e8843e1 已止血）| `cond.luteal_phase_defect` | |
| | `cond.medial_epicondylitis` | |
| | `cond.menieres` · `cond.meniscus_injury` | |
| | `cond.menopause_syndrome` · `cond.menorrhagia` | |

**剩下的 48 筆樣板在 partial / skeleton 層，不在本次三批的審查範圍。**

---

### ★ 孕期／生育卡帶樣板處方：完整清單

派工單問的是「還有沒有第 5 張」。答案分兩層：

**第一層 —— 明確的妊娠情境卡（原 4 張，2026-08-12 fixes-3 復核：4/4 已止血）：**

| id | 狀態 | 卡片自己寫對的穴 |
|---|---|---|
| `cond.breech_presentation` | **已止血**（e8843e1） | 至陰 BL67（艾灸） |
| `cond.hyperemesis_gravidarum` | **已止血**（29d3f8d，merged 41e77c5） | 內關 PC6 |
| `cond.ivf_support` | **已止血**（29d3f8d，merged 41e77c5） | （ASRM：不可宣稱提升活產率） |
| `cond.luteal_phase_defect` | **已止血**（29d3f8d，merged 41e77c5） | （ASRM committee opinion） |

> **fixes-3 復核（2026-08-12）**：派工單指示「這 3 張已在 codex/cond-eyeson-fixes-2 相關
> —— 驗證是否完成，不要重做」。逐筆讀取 `data/pathology/condition_canon_shortlist.json`
> 確認：三筆的 `acupoint_protocols`／`herb_formulas`／`tcm_patterns` 現況皆為 `[]`
> （誠實留空），`import_artifacts` 各 3 筆（`acupoint_protocols`／`herb_formulas`／
> `tcm_patterns`，逐字保留原始樣板內容 + reason + `moved_at`）。**確認已完成，本批未重做。**

**本批 31 筆中沒有新的產科卡** —— `cond.pcos` 沒有 `acupoint_protocols` 欄位（誠實留空），
其餘 30 筆無 O 開頭 ICD。派工單的假設在這一點上是安全的。

**第二層 —— 非產科卡但自己指認孕期族群（本次新發現，需 Ting 判斷是否併入同一批）：**

| id | 樣板處方 | 卡片自己怎麼說 |
|---|---|---|
| **`cond.restless_legs`** | 合谷+三陰交（樣板） | `risk_factors`：「**妊娠，尤其第三孕期**」；`etiology`：「…**妊娠**…可能誘發或加重症狀」 |
| `cond.carpal_tunnel` | 合谷+三陰交（樣板） | `risk_factors`：「重複性手腕動作…、**妊娠**、糖尿病…可增加腕隧道內壓力」 |
| `cond.primary_dysmenorrhea` | 30 穴傾倒（非樣板）含 LI4+SP6+**BL67** | `red_flags`：「**疑似懷孕**合併劇痛需排除異位妊娠」 |

另有 9 張 `gyn_fertility` 卡帶完全相同的樣板處方（多在 partial 層，供全庫清理時參考）：
`menorrhagia` · `amenorrhea` · `diminished_ovarian_reserve` · `menopause_syndrome` ·
`postpartum_hypolactation` · `pid_chronic` · `vulvovaginal_candidiasis` · `pmdd` · `secondary_dysmenorrhea`。

---

### ★ 非方名／污染方名：完整清單（**4 個名稱、15 筆記錄，本批 0 新增**）

| 名稱 | 出現的卡（全庫，已逐一核對） | 判定 |
|---|---|---|
| **`鼻良湯`** | `cervical_spondylosis` · `migraine` · `migraine_vestibular` | 抓取斷詞殘片，非方名 |
| **`精氣神源`** | `male_infertility` · `lumbar_disc_herniation` · `erectile_dysfunction` | 非方名，疑保健食品商品名 |
| **`丹梔逍遙散(轉址)`** | `hyperthyroidism` · `palpitations` · `heart_failure` | 網站轉址標記併進方名 |
| **`[通脈]四逆湯證`** | `trigger_finger` · `knee_osteoarthritis` · `patellofemoral_pain` · `ankle_sprain` · `plantar_fasciitis` · `tmd` | 方括號標記併進證型名 |

**本批新增的一項證據（可直接結案）：**
`通脈四逆湯` 的**乾淨形式**出現在 11 筆記錄的 `herb_formulas` 裡
（`pcos` · `oligomenorrhea` · `thin_endometrium` · `tmd` · `chronic_diarrhea` · `nausea_vomiting` ·
`copd` · `chronic_cough` · `post_viral_cough` · `hypotension` · `aphthous_ulcers`），
而**帶方括號的形式只出現在 `tcm_patterns[].pattern_zh`**。
**`cond.tmd` 一筆同時帶兩種形式。**
→ 方括號不是資料本身的一部分，是**證型名抽取路徑**的殘留，
與 `herb_formulas` 抽取路徑無關。修法可以只針對 `tcm_patterns[].pattern_zh` 一個欄位。

機器掃描全庫 `herb_formulas` 與 `tcm_patterns` 內所有帶中英括號／方括號的名稱，
**除上述兩族外沒有第三族。**

---

### ★ 派工單指定測試：`herb_formulas` 長度品質訊號（本批 31 筆）

| `herb_formulas` 長度 | 筆數 | CLEAN | MINOR | DEFECT | 說明 |
|---|---|---|---|---|---|
| 欄位不存在 | 15 | 9 | 6 | **0** | 誠實留空 |
| `[]`（空陣列） | 1 | 1 | 0 | **0** | `tuberculosis_disease` |
| **3（＝樣板三方）** | 5 | 0 | 0 | **5** | F-41 全族 |
| **3（人工策展）** | 3 | 0 | 3 | **0** | `tinnitus` · `trigeminal_neuralgia` · `urticaria` |
| 4 | 1 | 0 | 1 | **0** | `t2dm` |
| 49–50 | 6 | 0 | 0 | **6** | F-43 全族 |

**測試結果：訊號在兩端成立，中段必須修正。**

1. **0 筆（含欄位不存在與 `[]`）→ 16 筆記錄，0 DEFECT。** 與第 2 部分一致。
2. **25–50 筆 → 6 筆記錄，6 DEFECT（100%）。** 第 2 部分是 7 筆 6 DEFECT，本批更乾淨。
3. **「3 筆 → DEFECT」這條規則在本批被證偽。** 第 2 部分記錄「3 筆 → 13 筆記錄，13 DEFECT」，
   本批出現 **3 筆記錄長度為 3 但完全乾淨**（`cond.tinnitus` 的龍膽瀉肝湯／耳聾左慈丸／益氣聰明湯、
   `cond.trigeminal_neuralgia` 的龍膽瀉肝湯／清胃散／桃紅四物湯、
   `cond.urticaria` 的消風散／玉屏風散／當歸飲子 —— 三組全部切題且穴位為病位局部穴）。

   **修正後的規則：判準不是「長度 3」，是「是否逐字等同
   `["八珍湯","補中益氣湯","柴胡疏肝散"]`」。** 這一點很重要，因為若照長度做批次清理，
   會誤傷本批這 3 筆全庫策展品質最好的記錄。

4. **最終可用的機器訊號（92 筆全層驗證）：**

```
herb_formulas 逐字 = 樣板三方        → DEFECT（25/25，100%）
herb_formulas 長度 >= 25            → DEFECT（13/13，100%，第2部分7 + 本批6）
herb_formulas 長度 0 或欄位不存在    → 0 DEFECT（22/22）
herb_formulas 長度 3–6 且非樣板      → 0 DEFECT（9/9，第2部分5 + 本批4）
```

**這四條合起來可以在不讀內容的情況下正確分類 69/92 筆。**
剩下 23 筆（本批 15 筆欄位不存在的純 NIH 卡在內）仍需人眼，
但缺陷全部落在 MINOR 層（來源紀律、雙語、編者備註），沒有 DEFECT。

**附帶驗證第 2 部分的 `source_type` 訊號：** 本批 31 筆中，
5 筆樣板記錄有 2 筆缺 `source_type`（`neck_pain_stiff` · `raynaud`），3 筆有 ——
第 2 部分「缺 source_type 是樣板族的堪用訊號（92 筆中 21 缺 / 26 樣板）」
在本批**不成立**。`herb_formulas` 的逐字比對才是可靠的那一個。

---

### 建議：立即修正批次（機械性、低風險、不需 Ting 判斷）

延續第 1 部分 B1–B6、第 2 部分 B7–B14：

| 批次 | 內容 | 筆數 | 說明 |
|---|---|---|---|
| **B15** | `&hellip;` → `…`（含 `cond.tension_headache` 的 `‥` U+2025） | 4 | F-50D。`pcos` · `peptic_ulcer` · `tension_headache` · `tinnitus`。**與 B2(4)+B8(3) 合併為 11 筆一批做** |
| **B16** | `field_sources.acupuncture_scope_*` 改抄該欄自己的 `source` | 3 | F-47A。`primary_dysmenorrhea` · `rheumatoid_arthritis` · `trigeminal_neuralgia`。**與 B1(5)+B7(3) 合併為 11 筆** |
| **B17** | `cond.raynaud`：`acupuncture_scope_en` 的 `can_treat` 與 `precautions` 兩個值對調 | 1 | F-42。安全欄位，值已存在同一筆內，純搬移 |
| **B18** | `cond.tinnitus`：`red_flags_zh[1].rationale` 的 `treatment window` 改中文 | 1 | F-52／憲法紅線 5（`_zh` 內不得有英文句子） |
| **B19** | `cond.tension_headache`：`tcm_patterns[2].symptoms_zh` 「苔薄白微**黄**」→「微**黃**」 | 1 | F-39。簡體字形，單字替換 |
| **B20** | 四張頭痛卡的 `import_artifacts[].reason` 移除「C10-shared-verbatim boilerplate」假註記 | 4 | F-46。`tension_headache` · `migraine` · `cluster_headache` · `migraine_vestibular`。**不改資料、只改註記，但不做這一步後續 C10 pass 會漏掉四欄部落格文** |

B15–B20 合計動 14 筆、全部單欄／單字替換或同筆內搬移。改完跑
`node scripts/build-data.js` + `node scripts/validate-condition-standard.js` +
`node scripts/validate-content-junk.js`。

---

### ★ 建議：需要 Ting 先看過再動（三部分合併的決策清單）

依「錯了會傷到人」→「錯了會誤導」→「錯了只是不好看」排序：

| # | 項目 | 為什麼要先問 | 來源 |
|---|---|---|---|
| **1** | **3 張妊娠／生育卡的處方欄** `hyperemesis_gravidarum` · `ivf_support` · `luteal_phase_defect` | 合谷＋三陰交在孕期／植入後情境。`breech_presentation` 的止血方式（三欄搬 artifacts + 留空）可照抄，但重建需 Ting 確認寫法 | F-01/F-19/F-21 |
| **2** | **`cond.pcos`**（3,500 字，含停用荷爾蒙軼事 + 中藥加量至 3 倍 + 中英全譯） | 涉及整欄留空；且 `_en` 也要一起處理（英文讀者拿到同一份） | **F-37** |
| **3** | **`cond.peptic_ulcer`**（附子理中湯自行用藥軼事 + 錯誤藥理掛 NIDDK 名下） | 同上；另需決定是否補「上腹痛排除急性冠心症」紅旗 | **F-38** |
| **4** | **`cond.fibromyalgia`**（「這是不需要找醫生的」「所有疼痛都瞬間消失了」） | 第 2 部分列為優先 2，仍未動 | F-20 |
| **5** | **`cond.restless_legs` / `cond.carpal_tunnel` 是否併入孕期批** | 兩張非產科卡自己把妊娠列為主要危險因子，處方欄卻是合谷＋三陰交。**這是新問題，Ting 需裁定範圍** | **F-41.1** |
| **6** | **`cond.heart_failure` 被清空且無 artifact 紀錄** | 模板 §3.5.5 點名的誤植文下落不明。若未搬到心律不整卡，屬紅線 3 不可逆損失。全庫僅 2 筆（另一筆 `cond.male_infertility`） | F-23.4 |
| **7** | **三張頭痛卡的 `western_pathology_zh`** `tension_headache`（無 `_en`、無來源）· `migraine`（同）· 另 2 筆待查 | 未清洗部落格文 + 無來源數字 + 已推翻的機轉。**B20 只是修註記，內容仍要走 import_artifacts 流程** | **F-39** / F-24 |
| **8** | **樣板治療區塊全庫清理（73 筆，全細節 25 筆已全數具名）** | 搬走 = 這些卡治療區塊全空。產品層取捨（誠實的空 vs 假的滿）。**優先序：孕期 3 張 > `cond.influenza`（治法方向錯）> 其餘** | F-07/F-25/**F-41** |
| **9** | **抓取傾倒 13 筆（≥25 方）** 第 2 部分 7 + 本批 6 | 每筆要搬 25–50 個方名與 8–48 個穴。`cond.sciatica` 證明了**只搬散文不夠 —— 散文生出的方穴也要一起搬** | F-26/**F-43**/**F-45** |
| **10** | **`cond.rheumatoid_arthritis`**（「任何造疼痛的關節炎就會自動消失」+ 11 首麻黃方） | 自體免疫卡上的治癒宣稱；`_en` 已自承主題錯位 | **F-40** |
| **11** | **不存在／污染的方名 4 族 15 筆** | 屬 `data/herbs/**` 與抓取層，本線只能回報。**新證據：`[通脈]` 只污染 `tcm_patterns[].pattern_zh` 一個欄位，修法可以很窄** | F-26A/**§3** |
| **12** | **`classical_references_en` 全缺（已具名 20 筆 / 全庫 52 筆）** | 翻譯古籍成本高。Ting 需決定：翻譯／暫留單邊記入豁免／整欄留空 | F-16/F-50A |
| **13** | **`import_artifacts[].reason` 樣板句（44 筆記錄 / 88 artifact，64 個共用一句）** | 要先決定 reason 的粒度規格；且其中對已重建的 4 筆是假的 | F-31/**F-46** |
| **14** | **`aliases` 長度不等 4 筆** | 補中文別名需要 Ting 決定用詞，不是純機械 | F-33/**F-53A** |
| **15** | **`acupoint_protocols` shape 與 code 映射（全庫 49 筆，已具名 16 筆）** | 映射規則清楚（`LV→LR` 等），但 `cond.sciatica` 的 `BL31,32,33,34`（八髎）需先決定表示法 | F-17/F-36/**F-49** |
| **16** | **內部編輯備註寫進讀者欄位 6 筆** | 兩句一起移到 PROJECT_LOG 或 `sources` 旁註記；`cond.valvular_heart_disease` 的 `_en` 另有文法錯誤 | F-32/**F-48** |
| **17** | **`cond.migraine` / `cond.tension_headache` 的 `category`** | 兩筆都標 `pain_msk`，而 `epilepsy`／`menieres`／`trigeminal_neuralgia` 標 `neuro` | F-24 |

---

### 未做（明確聲明）

- **全細節 92 筆已全數讀完**，但 partial 70 筆與 skeleton 343 筆完全未讀。
  樣板治療區塊在那兩層還有 **48 筆**未具名。
- 沒有查證每一條 red flag 的臨床正確性到原始文獻層級 —— 只查了**內部一致性**
  （中英是否一致、`source` 是否可回溯、`urgency_level` 是否與同卡其他條目自洽、
  卡片自己在別欄講的話有沒有被紅旗欄接住）。
- 沒有跑 `validate-condition-standard.js`：本次是純閱讀審查，
  且派工單指定驗證條件為「`git diff` 只有這一個新檔」。
- 方名存在性只對照 `data/herbs/formulas.json` 的 224 筆中文名與別名；
  **「查無」意思是本庫未建卡，不等於該方在中醫文獻中不存在。**
  本批 88 個「查無」名稱經逐一目視，**全部是真實方名**，
  與 `鼻良湯`／`精氣神源`／`丹梔逍遙散(轉址)` 那三個「不是方名」的情況不同。
- 穴位 code 只對照 `point_id_manifest.json` 的 925 個 id，未逐穴查證臨床適當性。

---

*本檔為 findings ledger。`data/**` 未修改，未 push。全細節 92 筆審查至此收尾。*

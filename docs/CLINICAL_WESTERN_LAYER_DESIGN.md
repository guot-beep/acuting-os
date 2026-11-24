# 病例西醫層設計:西醫檢查 × 用藥清單 × 中西藥交互

**狀態:僅設計,等 Ting 核准(DECISIONS 提案 D38)。** 這份文件沒有改任何 `data/**` 或 `js/**`。
**量測的版本:** `claude/suspicious-williams-968e01` @ `cfeff188`(= 2026-11-24 時的 `origin/main`)。
**怎麼重新量:** `node scripts/report-clinical-western-inventory.js`(唯讀、不讀病人資料;本文的每個數字都出自它)。
**和既有規則的關係:** 這是新的一條線,**不重開也不擴充 Safety Layer Phase 1(已凍結)**。
它沿用 D11(四套診斷命名空間)、D13(邊只存一側)、D15(`drug.*`)、D17 §5(一條用藥時序)、
D20(兩個軸)、D32(UI 凍結例外)、PHARM_CARD_TEMPLATE §0(安全欄位沒有來源就不存在)。
例子全部是虛構的。

---

## 0. 三件事,一句話說完

| 要做的事 | 現況一句話 | 主要缺什麼 |
|---|---|---|
| ① 西醫檢查/特殊測試 | **設計過(AM 線 §2.6,2026-07-22),資料 0 筆** | 檢查卡、SOAP 上可勾的檢查結果、「陽性 → 轉診」的有來源規則 |
| ② 病人用藥清單 | **已經有了**:病例層 `agentExposures`(D17 §5,有事件歷史) | 診前單沒讀它、看不出化療週期、病人沒有單一清單、重點族群的藥卡多半還沒建 |
| ③ 中西藥/針藥交互 | 藥卡上有 14 條標籤點名的植物藥,**只有 2 條連得到 `herb.*`** | 中藥這一側的交互紀錄、配對引擎、在病例和診前單上顯示 |

所以最快見效的是:**把已經有的東西接到畫面上**(第 0 期),不用新增任何內容就能抓到
「吃 warfarin 的病人這次開了血府逐瘀湯」這種情況。

---

## 1. 臨床上要回答的三個問題

1. **這個主訴該先做哪些檢查?陽性代表該轉診嗎?**
   (虛構例:膝痛數週、無法完全伸直 → McMurray / Thessaly / 關節線壓痛;
   真的卡住無法伸直 = 可能是桶柄狀撕裂 → 轉骨科評估,不要繼續扎好幾週。)
2. **這個病人現在在吃什麼?**(有效 / 停用 / 化療第幾週期 / IVF 哪一階段)
3. **我要開的方、要扎的針,跟這些藥有沒有已知的衝突?來源是什麼?**

系統的角色:**列出事實和來源,不做判斷、不擋處方。**
這是在修改一個刻意的立場 —— `app.js` 的補充劑安全備註寫著「不做交互作用比對 ——
系統不知道這個病人同時在吃什麼,判斷是醫師的」。現在系統**知道了**(用藥清單 + 處方都是結構化的),
所以提案改成:**列出配對與來源,判斷仍然是醫師的**(見 §8 問題 1)。

---

## 2. 盤點:哪些能用、哪些缺

`node scripts/report-clinical-western-inventory.js` 的輸出(節錄,完整欄位跑一次就有):

### 2.1 藥理層(`data/pharmacology/`)

| 項目 | 數字 | 能不能用 |
|---|---|---|
| `drug.*` 卡 | 59(全部 `draft`) | ✅ 用藥清單的選單已經用它 |
| 黑框警告 | 27/59 | ✅ 病例上已經會顯示 |
| 結構化西藥交互 `drug_interactions_graded` | 29/59 張卡,64 條 | 🟡 只有藥對藥 |
| 中藥交互 `herb_drug_interactions_graded` | 8/59 張卡,**14 條**;13 條有來源 | 🔴 **只有 2 條連到 `herb.*`**(warfarin × 人參、warfarin × 銀杏) |
| 那 12 條沒連的 | 全部是標籤點名的**非中藥**植物藥(聖約翰草 ×7、大蒜、紫錐花、白毛茛、CoQ10、clopidogrel 一條「未提及」) | 🟡 其中 4 種已有 `supp.*` id,可以機械式連上 |
| `integrative_clinical_flags`(受控 16 詞) | 31/59 | ✅ 可以拿來做「類別重疊」(§4.3) |
| `acupuncture_note_zh` | 20/59 | 🔴 藥卡頁有顯示,**病例頁沒有**(量測:`caseview.drug_acupuncture_note_rendered = false`) |
| `related_herb_ids` | 0/59 | — |
| DailyMed 驗證過的標籤 | 52 | ✅ 來源錨點可以機器驗 |
| 範圍清單 `drug_scope_manifest` | 85 筆,其中 **36 筆還沒建卡** | — |

**重點族群的藥卡覆蓋**(id 是手列的,不做模糊比對):

| 族群 | 有卡 | 缺的(舉例) |
|---|---|---|
| 抗凝/抗血小板 | **10/10** | — |
| IVF/生殖 | 4/10 | follitropin、menotropins、ganirelix、cetrorelix、leuprolide、hCG |
| 憂鬱/焦慮 | 4/10 | fluoxetine、duloxetine、venlafaxine、bupropion、mirtazapine、amitriptyline |
| 腸胃 | 3/8 | famotidine、mesalamine、infliximab、adalimumab、loperamide |
| **腫瘤(化療/內分泌/免疫)** | **1/13**(只有 letrozole) | tamoxifen、anastrozole、cyclophosphamide、doxorubicin、paclitaxel、cisplatin、carboplatin、5-FU、capecitabine、irinotecan、pembrolizumab、dexamethasone |
| 免疫抑制 | 1/6(只有 prednisone) | tacrolimus、cyclosporine、mycophenolate、methotrexate、azathioprine |

⚠️ 順帶發現:範圍清單有 `drug.clomiphene_citrate`(planned),但 `drug.clomiphene` 已經有卡。
照範圍清單建卡會做出重複卡(D21 那種事)。建卡前範圍清單要改指向既有 id。

### 2.2 中藥/方劑層

| 項目 | 數字 | 意義 |
|---|---|---|
| `herb.*` | 366 | — |
| 中藥卡上的交互欄位 | **完全沒有** | 交互作用目前只存在藥那一側 |
| `safety_flags` | 305/366 | ✅ `anticoagulant_review` 27、`bleeding_review` 37、`sedative_medication_review` 8、`blood_sugar_review` 15、`hypertension_review` 16、`medication_review` 22 |
| `formula.*` | 223;**221 首的組成帶 `herb_id`** | ✅ 方劑可以機械式展開成藥材,再去配對 |
| 方劑 `herb_drug_interactions_en` | 1/223(小柴胡湯 × 干擾素,有 PubMed 來源) | — |
| 方劑 `herb_drug_cautions` | 23/223 | 🟡 內容其實是旗標詞,不是交互紀錄 |

**American Dragon 201 首的「Herb/Drug Interactions」段**(`curriculum/formulas/…Interactions.md`):
25 首有這一段,共 40 句,**其中 39 句是「本方可減輕某藥副作用」這類好處宣稱**,
只有 1 句是警示(小柴胡湯 + 干擾素 → 間質性肺炎,庫裡已有,且已附 PubMed)。
→ 這份檔案**不能當交互作用安全來源**;那 39 句是「併用好處的宣稱」,多半出自動物或小型研究,
依憲法紅線 9(機轉 ≠ 療效)只能標成待查證的線索,而且**不准出現在警示區**(§4.1 的 `direction` 軸)。

### 2.3 診斷與檢查層

| 項目 | 數字 | 意義 |
|---|---|---|
| `cond.*` | 508(肌肉骨骼相關約 25 張,含 `cond.meniscus_injury`) | ✅ 檢查卡的「支持哪個診斷」連這裡 |
| 紅旗登錄 `red_flag_registry` | 233;分級 `emergency_referral` 45 / `urgent_referral` 98 / `routine_referral` 50 / **沒分級 40** | ✅ 轉診分級的詞彙直接沿用 |
| `sym.*` | 124(含 `sym.knee_pain`) | ✅ 檢查建議的觸發點 |
| 檢查卡 `exam.*` | **0(`data/anatomy/exams.json` 不存在)** | 🔴 |
| 解剖層 muscles/bones/nerves/vessels | 全部 0 | AM 線的骨架從沒開始填 |

⚠️ **最直接的例子:** `cond.meniscus_injury` 已經有一條紅旗「True locking with inability to extend
→ bucket-handle tear, refer for assessment」—— 正是 Ting 遇到的情況 —— 但它是 legacy 紀錄,
**沒有分級、沒有來源**。所以知識其實在庫裡,只是不夠格上畫面當轉診依據。第 1 期第一件事就是替它補來源。

### 2.4 病例(`app.js` / `js/`)與儲存

| 項目 | 現況 |
|---|---|
| 用藥清單 | `case.agentExposures[]`:`agentType` = `drug｜supplement`;`status` = `current｜stopped｜prn｜unknown`;劑量/頻率/起訖(粗略)/適應症/資訊來源/**只加不改的事件歷史**。病例頁每列已顯示該藥卡的黑框、禁忌、補充劑備註;查不到卡會寫「⃠ 未做安全檢查」(不會靜默) |
| 自由文字用藥 | `case.currentMeds`(診前單只讀這個);SOAP 的 `westernMeds` + `medicationLinks` |
| 處方 | SOAP 的 `formulaLinks` / `herbLinks` / `formulaHerbs`(自由文字) |
| 檢查 | SOAP 的 `objective` **只有自由文字**,沒有結構化檢查結果 |
| 診前單 | `js/preshift.js` 的抗凝判斷是**對文字跑 regex**(`warfarin|eliquis|…`),不讀 `agentExposures`;「可能遇到的問題」= 病人旗標 × 穴位卡注意事項(逐字引用) |
| 雲端 | D1 存的是整份病例 JSON(kv 值原樣)。**新增欄位不需要改 D1 schema**,但要過 D12/D30 的契約凍結閘門(對照表 + 基準 + fixture) |

---

## 3. 資料模型

### 3.1 檢查卡 `exam.*`(新命名空間,檔案 `data/exams/clinical_exams.json`)

**採用 AM 線 §2.6 的設計,改三個地方:**

1. **「支持什麼」連 `cond.*`,不另開 `injury.*`。** AM 線早於 D11;D11 定了診斷只有四套命名空間,
   `injury.*` 會變成第五套。半月板撕裂就是 `cond.meniscus_injury`。
2. **放 `data/exams/`,不放 `data/anatomy/`。** 這一層包含神經檢查、生命徵象之類,不只是骨科。
   (`data/exams/` 現在只有考綱 `ncbahm_bio_2026.json`;檔名分得開。)
3. **加上「陽性怎麼辦」**,並沿用紅旗登錄的轉診分級詞彙。

```json
{
  "id": "exam.mcmurray",
  "exam_type": "physical_test",
  "region": "knee",
  "name_en": "McMurray test", "name_zh": "McMurray 測試(中文名照來源,不自譯)",
  "screens_for_zh": "半月板撕裂", "screens_for_en": "Meniscal tear",
  "supports_condition_ids": ["cond.meniscus_injury"],
  "position_zh": "…", "procedure_zh": "…", "positive_finding_zh": "…",
  "position_en": "…", "procedure_en": "…", "positive_finding_en": "…",
  "if_positive": {
    "action_tier": "routine_referral",
    "text_zh": "…(只寫來源有寫的)", "text_en": "…",
    "sources": ["textbook:magee_7e#ch12", "url:https://www.orthoinfo.org/…"]
  },
  "do_not_perform_if_zh": ["…"],
  "accuracy": { "sensitivity": null, "specificity": null, "source": null },
  "cluster_id": "examcluster.meniscus_injury",
  "field_sources": { "procedure_en": ["…"], "positive_finding_en": ["…"] },
  "review_status": "draft"
}
```

```json
{
  "id": "examcluster.meniscus_injury",
  "condition_id": "cond.meniscus_injury",
  "exam_ids": ["exam.mcmurray", "exam.thessaly", "exam.joint_line_tenderness"],
  "interpretation_zh": "…(來源怎麼說就怎麼寫;不准自己訂幾項陽性才算)",
  "sources": ["…"], "review_status": "draft"
}
```

規則(全部由驗證器擋,不靠文字):
- `accuracy` 的數字沒有具名研究就是 `null`(AM 規則 1)。
- **陽性不是診斷**:`_zh` 欄位不准出現「確診/診斷為」;畫面一律寫「支持/不支持」。
- `if_positive.action_tier` 只能是 `emergency_referral｜urgent_referral｜routine_referral｜monitor`,
  而且**一定要有來源**;沒有來源就整個 `if_positive` 留空,畫面寫「轉診條件未查證」。
- 邊只存一側(D13):`supports_condition_ids` 存在檢查卡上;病症卡上的「相關檢查」在建置時推出來。

**來源優先序:** ① Ting 的 SWCS2/SWCS3 課件(放 `curriculum/western/`,現在是空的)
→ ② NCBAHM BIO 考綱書目裡的教科書(Bates' *Guide to Physical Examination*、Magee *Orthopedic Physical Assessment*,考綱 BIO-B「Physical examination」佔 14%)
→ ③ AAOS OrthoInfo(AM §4.1 已驗證可用)→ ④ Physiopedia 只當次級來源。

### 3.2 用藥清單:沿用 `agentExposures`,只加不改

D17 §5 已經定了「一條用藥時序」,所以**不另建第二套用藥清單**。只加這些(全部 additive、預設空):

| 欄位 | 值 | 為什麼 |
|---|---|---|
| `agentType` 新增 `herbal` | `agentId` 指向 `herb.*` / `formula.*` | 病人在別處拿的中藥(或自己買的)。**她自己開的方仍在 SOAP 處方欄**,不搬進來 |
| `scheduleType` | `''｜continuous｜cyclic｜course｜protocol` | 化療是週期性的,IVF 是療程階段,抗生素是一個療程 |
| `scheduleText` | 自由文字,如「第 3/6 週期,每 21 天」「拮抗劑療程第 7 天」 | **不解析成數字** —— 化療最低點的天數之類需要來源,不由系統推算 |
| `lastDoseApprox` / `nextDoseApprox` | 粗略日期(D4) | 診前單要顯示「上次輸注是哪天」 |
| `prescriberText` | 自由文字(如「腫瘤科」) | 有問題時要知道問誰;**不存人名** |

`status` 四個值不變。「化療中」= `status: current` + `scheduleType: cyclic`,不新增第五個狀態。

**病人層級的清單:不搬資料,用推的。** 同一個病人(同 `patientCode`)有好幾個病例時,
病人頁顯示所有病例 `agentExposures` 的聯集,每列標「來自病例 X」;
同一個 `agentId` 在兩個病例裡狀態不同時**兩列都顯示,並標「不一致」**,不自己挑一個(§8 問題 3)。

**自由文字的用藥(`currentMeds`)不自動解析**(既有規則)。改成「建議」:
用 `medication_alias_map` + 藥卡名稱/商品名找出提到的藥,顯示「加入用藥清單?」的按鈕,她按了才寫入 ——
跟 D35 分類建議同一個模式。

### 3.3 交互紀錄(兩個儲存處,一個推導出來的索引)

**現況的問題:** 交互作用存在藥卡上(標籤一份點名好幾種植物藥,所以本來就是藥那一側),
但非標籤來源(NCCIH、PubMed、MSKCC About Herbs、Chen & Chen)講的通常是
「某味中藥 × 某類藥」,放在藥卡上不自然。

**提案:**
- **A. 標籤來源的** → 照舊留在 `drug.*.herb_drug_interactions_graded`(藥那一側,不動)。
- **B. 非標籤來源的** → 新檔 `data/pharmacology/herb_drug_edges.json`,一條邊一筆:

```json
{
  "id": "hde.warfarin__dan_shen",
  "drug_side": "drug.warfarin",
  "herb_side": "herb.dan_shen",
  "direction": "caution",
  "mechanism_type": "pharmacodynamic",
  "evidence_level": "case_report",
  "effect_en": "…(轉錄來源)", "effect_zh": "…",
  "source_says_action_en": "…(只有來源寫了才填)",
  "sources": ["pmid:NNNNNNNN", "url:https://www.nccih.nih.gov/…"],
  "retrieved_at": "2026-12-xx",
  "review_status": "draft"
}
```

- **C. 建置時推出單一索引** `interactionIndex`(在 `data/generated/`),兩邊合成**同一種形狀**。
  畫面**只讀索引**,不直接讀 A 或 B。
  這是為了避開本庫最貴的那類缺陷(「一個欄位長出第二種形狀,渲染器只認一種」);
  閘門檢查 A 裡每一條能對到 id 的列都進了索引。

**兩個軸,不是一個(同 D20 的想法):**

| 軸 | 值 | 畫面上的意思 |
|---|---|---|
| `direction` | `caution`(警示)/ `co_use_claim`(併用好處的宣稱) | 只有 `caution` 進警示區。`co_use_claim` 收在「研究線索」,永遠不和警示同框 |
| `evidence_level` | `label_named` · `clinical_study` · `case_report` · `pharmacokinetic_study` · `in_vitro_animal` · `textbook_statement` | 顯示成標章;**系統不自己算嚴重度**(來源有寫才顯示) |

`drug_side` 也可以是 `drugclass.*`(例如整類抗凝藥),`herb_side` 也可以是 `formula.*` 或 `supp.*`。
**藥類 → 藥的擴充只在 `drugclass_id` 明確時做**,而且畫面寫「依藥類」。

---

## 4. 配對引擎(純函式,`js/interaction-check.js`)

輸入:病人目前的用藥(`agentExposures` 裡 `status ∈ {current, prn}`)+
這次或上次的處方(`formulaLinks` 展開成組成藥材 + `herbLinks`)+ 預定的穴位/針法。
輸出:一串**命中**,每條都帶兩側的身分和逐字來源。分三層,**分開顯示,絕不混在一起**:

### 4.1 A 層 — 有記載的配對
索引裡有 (drug 或其 drugclass) × (herb,或方中含的 herb,或 formula) 的 `caution` 列。
顯示:「warfarin × 丹參(在血府逐瘀湯裡)· 個案報告 · 來源 PubMed …」。

### 4.2 B 層 — 兩張卡各自寫了同一類風險(不是交互作用的宣稱)
藥卡的 `integrative_clinical_flags` × 中藥卡的 `safety_flags`,透過一張小對照表
`data/config/integrative_flag_crosswalk.json`(例:`bleeding_risk` ↔
`anticoagulant_review`、`bleeding_review`、`active_bleeding_medical_review`;
`sedation_dizziness` ↔ `sedative_medication_review`;`glucose_effects` ↔ `blood_sugar_review`)。
顯示措辭固定:「**兩張卡都提到出血風險** —— 藥卡寫『…』;中藥卡寫『…』」,兩句都是逐字引用,
沿用診前單「引文必須是原卡子字串」的閘門寫法。**絕不寫成「會交互作用」。**

虛構例:病人吃 warfarin(旗標 `bleeding_risk`),上次開血府逐瘀湯 → 12 味裡有 6 味帶
`anticoagulant_review`/`bleeding_review`,B 層會列出這 6 味。今天不用新增任何內容就能做到。

### 4.3 C 層 — 針刺與用藥/病情
- 藥卡的 `acupuncture_note_zh`(20/59)直接顯示在病例的那一列藥下面(現在沒顯示)。
- 診前單的「病人抗凝」改成:結構化用藥裡有 `bleeding_risk` 的藥 **或** 文字提到(原本的 regex 保留,
  標「文字提到」);兩個來源分開標,不合併成同一句。
- 腫瘤情境(`careContexts` 含腫瘤整合照護)的針刺注意(血小板低、嗜中性球低、淋巴水腫肢體):
  **要等有來源**(候選:SIO–ASCO 整合腫瘤指引),第 4 期再做,現在不寫任何門檻。

### 4.4 「沒命中」要怎麼說
- 藥沒有卡 → 「⃠ 未做安全檢查:知識庫沒有這張卡」(沿用現有措辭)。
- 有卡、索引裡沒配對 → 「**已比對 N 條有記載的配對,沒有符合;這不代表安全**」。
  不准出現「無交互作用」。
- 方劑查不到組成 → 「⃠ 此方沒有結構化組成,未比對」(223 首裡有 2 首)。

---

## 5. 畫面上出現在哪裡

| 位置 | 新增/改動 | 階段 |
|---|---|---|
| **病例頁 · 用藥與暴露區** | 每列藥加上:針刺注意(`acupuncture_note_zh`)、整合旗標標章、該藥的中藥交互列;化療/IVF 列顯示 `scheduleText` 與上次給藥日 | 0 / 2 |
| **病例頁 · 新的「交互檢查」卡** | 放在用藥區上方:目前用藥 × 最近一次處方的 A/B/C 命中;一層一個小標題 | 0 |
| **SOAP 表單 · 處方欄下方** | 選了方劑/中藥後即時列出命中(不擋存檔、不跳視窗) | 0 |
| **SOAP 表單 · 新的「西醫檢查 Exam」區** | 依主訴建議的檢查(§6)+ 每項一列:結果 陽性/陰性/不確定/沒做、左右側、備註;存成 `examFindings[]` | 1 |
| **SOAP 表單 · 轉診決定** | 有陽性且該檢查的 `if_positive` 有來源 → 顯示建議分級與來源,並要選:已轉診 / 已問 preceptor / 暫不轉(原因);存成 `referralDecision` | 1 |
| **診前單 ① 注意事項** | 加「目前用藥」:結構化清單(化療列附週期與上次給藥日),取代只截 160 字的自由文字 | 0 |
| **診前單 ③ 本次要問** | 「上次 McMurray 陽性 → 轉診了嗎?」;「這個主訴建議的檢查還沒做:…」 | 1 |
| **診前單 ④ 可能遇到的問題** | A/B/C 命中(用藥 × 上次處方、用藥 × 上次穴位) | 0 |
| **病人頁** | 所有病例用藥的聯集(§3.2) | 2 |
| **品質頁** | 「病例裡出現但沒有藥卡的藥」—— 執行時即時算、**不存檔、不進 git**;決定下一批建哪些藥卡 | 2 |

`examFindings[]` 形狀(SOAP 層,additive):
```json
{ "examId": "exam.mcmurray", "nameText": "", "result": "positive", "side": "R", "note": "" }
```
`result`:`''`(沒記)/ `positive` / `negative` / `equivocal` / `not_done`。`''` 跟 `not_done` 是兩回事(D4)。
`objective` 自由文字不動、也不自動解析。

---

## 6. 建議怎麼觸發(全部用推的,不存「主訴 → 檢查」清單)

```
主訴文字 / SOAP symptomLinks(sym.knee_pain)
   → 有這個 sym 的 cond(cond.sign_symptom_ids,已存在)
   → 支持這些 cond 的 exam(exam.supports_condition_ids)
   → 依 cond 分組顯示,附這些 cond 的紅旗(red_flag_registry,有分級、有來源的才顯示)
```
- 今天 `sym.knee_pain` → `cond.knee_osteoarthritis`、`cond.meniscus_injury`。
- 主訴只有自由文字時,用 sym 的名稱/別名去比對,顯示「文字提到『膝』」(跟診前單同一套作法)。
- 這是**建議清單,不是必做**;沒做不會出警告。

**「扎了好幾週沒進步」提醒(要 Ting 決定):** 系統可以算出事實 —— 同一主訴已經第 N 診、
最近幾次的成效判讀。但「幾週該轉診」是臨床門檻,沒有來源不准寫。提案:門檻由 Ting 自己在設定裡填
(跟 D37 採購假設同一個模式,畫面標「你的設定」),沒填就只顯示事實不提醒(§8 問題 4)。

---

## 7. 驗證器與閘門(用機器擋,不加規則文字)

| 閘門 | 擋什麼 | 備註 |
|---|---|---|
| `validate-exam-standard.js` | 必填欄位;`accuracy` 有數字就要有來源;`if_positive` 有分級就要有來源;`supports_condition_ids` 要指到沒退役的 `cond.*`;`_zh` 不准出現「確診」 | 新 |
| `validate-interaction-edges.js` | 每條邊至少 1 個能解析的來源(`dailymed:<setid>#SECTION` 的 setid 必須在驗證過的標籤清單裡、`pmid:` 是數字、網址在白名單);`direction`/`evidence_level` 在詞彙內;兩端 id 存在;沒有來源寫的就不准有 `severity` | 新 |
| `validate-interaction-index.js` | 藥卡上每條能對到 id 的中藥交互列,都進了建置索引(A 不會被 B 吃掉) | 新 —— 防「兩種形狀」 |
| `validate-interaction-render.js` | **渲染路徑的真值表**:虛構病例(warfarin + 血府逐瘀湯)→ 病例卡和診前單都出現命中與來源;拿掉來源 → 變「未查證」;未知藥 → 「未做安全檢查」不准靜默;`co_use_claim` 不准出現在警示區;「無交互作用」字樣零次 | 新,附突變測試 |
| `validate-exam-render.js` | 陽性 + 有來源的 `if_positive` → SOAP 出現轉診區塊;沒來源 → 「轉診條件未查證」 | 新 |
| 既有 `validate-clinical-contract-freeze` / `validate-sqlite-mapping-coverage` | 新欄位(`examFindings`、`referralDecision`、`scheduleType`…)必須登記到對照表 + 契約基準 + fixture | 沿用,不用改 |
| 既有 `validate-care-draft-phi` 類 | 所有 fixture 都是虛構病人 | 沿用 |
| `check-validation-ratchet.js` 新增三項 | `interaction_edges_without_source` = 0;`exam_unsourced_referral` = 0;`label_hdi_rows_unlinked`(目前 12)只准變少 | 擴充 |
| 既有 `validate-ui-freeze` | 動 `js/**` 的 commit 要寫凍結例外 + Ting 原話 | 沿用(D32) |

---

## 8. 給 Ting 的問題

1. **系統要不要做「配對」?** 提案:列出配對與來源,**不判斷嚴重度、不擋處方、不跳視窗**。
   (現在的程式碼刻意不做比對,這題要你點頭才改。)
2. **B 層(兩張卡各自寫了同一類風險)要不要顯示?** 它不是交互作用的證據,但能抓到
   「抗凝病人 × 活血藥」。提案:顯示,但措辭固定、跟 A 層分開。
3. **用藥清單:** 要維持病例層級(同病人多病例時推出聯集,衝突就標出來),還是要搬到病人層級?
   提案:先用推的,不搬資料。
4. **「扎了幾週沒進步」的提醒:** 要不要你自己設一個數字(例如同一主訴第 N 診成效都是「無變化」)?
   系統不會自己訂門檻。
5. **檢查卡第一批:** 提案先做膝、下背、肩約 15 項(McMurray、Thessaly、關節線壓痛、Lachman、
   前抽屜、外翻/內翻壓力、SLR、Slump、Neer、Hawkins–Kennedy、Empty can、Drop arm、
   Painful arc、Spurling、Phalen)。要換成 SWCS2 這學期教的清單嗎?
   能不能把 SWCS2 的講義放進 `curriculum/western/`(現在是空的)?那會是第一優先的來源。
6. **要不要把 MSKCC「About Herbs」登記成來源?** 腫瘤病人的中藥 × 化療交互,它是很常用的整理;
   目前 `PHARM_SOURCE_TIERS.md` 沒有它。(Natural Medicines 要付費,而且我們規定不能當唯一來源。)
7. **重點族群建藥卡的順序:** 提案 ① 腫瘤 12 張 → ② IVF 6 張 → ③ 免疫抑制 5 張 → ④ 憂鬱 6 張 → ⑤ 腸胃 5 張。
   你的病人裡哪一群最多,就先做哪一群。

---

## 9. 分期

| 期 | 內容 | 新內容? | 寫檔範圍 | 完成定義(數字) |
|---|---|---|---|---|
| **0 —— 先接線(約 1–2 天)** | ① 病例的藥列顯示 `acupuncture_note_zh` + 旗標 + 中藥交互列;② 配對引擎 A+B+C 層(純函式 + 真值表);③ 診前單讀結構化用藥、抗凝改成「結構化 或 文字提到」;④ 12 條標籤列裡有 4 種能機械式連到 `supp.*`(聖約翰草、大蒜、紫錐花、CoQ10) | 不用 | `js/interaction-check.js`(新)、`app.js`、`js/preshift.js`、`scripts/validate-interaction-*.js`、`data/config/integrative_flag_crosswalk.json`、建置索引 | `caseview.drug_acupuncture_note_rendered` true;`preshift.reads_agentExposures` true;虛構病例 warfarin + 血府逐瘀湯 → B 層 6 味命中;render 真值表全過 |
| **1 —— 檢查卡試做(約 1 週)** | ① 半月板那條 legacy 紅旗補來源 + 分級;② `exam.*` 15 項 + 3 個 cluster;③ SOAP「西醫檢查」區 + 轉診決定;④ 主訴 → 建議;⑤ 診前單「上次陽性,轉診了嗎」 | 15 張檢查卡(≤30/批) | `data/exams/clinical_exams.json`(新)、SOAP 表單、契約對照表 | 15/15 有 `procedure` 與 `positive_finding` 的來源;`if_positive` 有來源的張數照實報;`accuracy` 有數字的張數照實報(預期大多是 null) |
| **2 —— 重點族群藥卡 + 療程欄位(約 1–2 週)** | ① 34 張藥卡,照 PHARM §0 抄標籤(機械工作,可派出去);② `scheduleType`/`scheduleText`/給藥日;③ 病人頁用藥聯集;④ 品質頁「缺卡的藥」 | 34 張藥卡 | `data/pharmacology/drugs.json`、病例表單 | 每族群「有卡 x/y」比 §2.1 增加;每張卡的安全欄位都有 `verified_exact` 標籤 |
| **3 —— 非標籤交互邊(持續進行)** | `herb_drug_edges.json`:抗凝 × 活血藥、化療/內分泌治療 × 中藥(CYP、植物雌激素)、SSRI × 安神/鎮靜藥、免疫抑制劑 × CYP3A4 相關中藥、IVF 荷爾蒙 × … | 是 | 判斷型工作 → **Claude 做,Ting 逐條審**,不派給填充工具 | 每條都有來源;`co_use_claim` 與 `caution` 分開計數 |
| **4 —— 腫瘤針刺注意** | 血小板低/嗜中性球低/淋巴水腫肢體的針刺注意 | 是,而且只用指引來源 | 同上 | 數字門檻只有來源有寫才出現 |

第 0 期做完就能在診所用:抗凝病人 × 活血方、正在吃 SSRI 的病人 × 聖約翰草、
有卡的藥的針刺注意,都會出現在診前單上。

---

## 10. 這份設計刻意不做的事

- 不做嚴重度分數、不擋處方、不跳 `confirm()` 視窗。
- 不從機轉推交互作用(「丹參有抗血小板作用」≠「丹參與 clopidogrel 有交互作用的證據」—— 紅線 9)。
- 不把 American Dragon 那 39 句「併用好處」當成安全資料,也不當療效。
- 不建 `injury.*`、不建「主訴 → 檢查」對照表(全部用推的)。
- 不把任何病人用到的藥名、病人代號、病例內容寫進 git(「缺卡的藥」只在執行時算)。
- 不碰 Safety Layer Phase 1 的已凍結部分。

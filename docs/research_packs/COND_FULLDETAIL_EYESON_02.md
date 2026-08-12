# COND_FULLDETAIL_EYESON_02 — 全細節病症卡人眼審查（第 31–61 筆）

狀態：**findings ledger only. 本次沒有動 `data/**` 一個字元。**
Branch：`codex/cond-eyeson-2`（自 `origin/codex/pattern-v2` tip `c1587d1`）
日期：2026-08-12
接續：`COND_FULLDETAIL_EYESON_01.md`（第 1–30 筆）。發現編號自 **F-19** 起、
機械批次編號自 **B7** 起，延續第 1 部分。

---

## §0 範圍與方法

### 取樣（與第 1 部分同一條指令）

```bash
node scripts/audit-cr010-condition-detail-maturity.js
# → tmp/cr010/cr010_condition_detail_maturity_live.json
#   live_condition_count 505 / full_detail_count 92 / partial 70 / skeleton 343
```

取 `maturity === "FULL_DETAIL_CANDIDATE"` 的 92 筆，依 **id 字母序**取第 **31–61** 筆
（`cond.endometriosis` … `cond.migraine`）。前 30 筆與第 1 部分逐字相符，已核對。

### 方法

每一筆從 `data/pathology/condition_canon_shortlist.json` 完整取出、格式化後**整份逐行讀完**
（31 筆共 ~5,900 行 / ~290 KB）。判準依派工單六項：
假中文/隱形英文 · 中英不忠實 · 臨床胡說 · 樣板句 · 錯位內容 · 來源紀律。

機器掃描只用來**量化已用眼睛確認的問題有多廣**，並**驗證每一條跨檔案主張**
（方名是否存在、pattern id 是否解析得到、樣板全庫散佈）：

```bash
# 樣板治療區塊（第 1 部分 F-07 那一族）在本批的散佈
tcm_patterns 逐字等同「氣血不和證/八珍湯 + 臟腑虛弱證/補中益氣湯」：74 / 505 筆（本批 31 筆中 13 筆）
acupoint_protocols 逐字等同 ["足三里 (ST36)","合谷 (LI4)","三陰交 (SP6)","中脘 (CV12)"]：71 / 505（本批 12 筆）
herb_formulas 逐字等同 ["八珍湯","補中益氣湯","柴胡疏肝散"]：73 / 505（本批 13 筆）

# 全細節 92 筆中的樣板總數：26
#   第 1 部分已點名 8 筆 + 本批 13 筆 = 21，餘 5 筆落在第 62–92 筆

# 第 1 部分點名的句子型樣板，在本批的殘留
western_pathology_zh === "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"：全庫 31 筆，**本批 0 筆**
etiology_zh === "正氣不足，臟腑功能失調，氣血津液運化不利。"：全庫 31 筆，**本批 0 筆**
# （第 1 部分記錄的是 39 筆，現為 31 筆 —— 期間有 8 筆已被處理）

# 跨檔案驗證
data/herbs/formulas.json：224 筆 / 223 個 unique 中文方名
data/pathology/pattern_registry.json：151 個 pattern id
本批 31 筆的 related_patterns **全部解析得到**（C6 = 0）
```

### 保守原則

沿用第 1 部分：只列**能引用原文並說出為什麼錯**的項目。純風格差異不列。
`red_flags` 舊式字串陣列 vs 新式五欄結構的混用屬 schema 演進，只在 §1 標註。
`import_artifacts` 裡已隔離的爬蟲原文**不重複計為缺陷**（那是正確處置的證據），
只在該處置本身有問題時才列。

---

## §1 逐筆判定（31 筆）

| # | id | 判定 | 一行說明 |
|---|---|---|---|
| 31 | `cond.endometriosis` | **DEFECT** | 12 個未策展 tcm_patterns blob（心脾兩虛條列「男性勃起障礙」）+ 50 方 + 30 穴傾倒；NICHD 側乾淨 |
| 32 | `cond.epilepsy` | CLEAN | 純 NINDS；治療三欄**完全不存在**（誠實留空）；field_sources 正確指向 research pack |
| 33 | `cond.fibromyalgia` | **DEFECT（SAFETY）** | `etiology_zh` 內含「這是不需要找醫生的」與服四逆湯後「所有疼痛都瞬間消失了」的軼事；`超氧化物雙效酶` 為錯譯 |
| 34 | `cond.frozen_shoulder` | **DEFECT** | `import_artifacts` 處置是全批最佳範例，但 50 方傾倒含天雄散／三物備急丸／大陷胸湯等峻毒方無註記；古籍引文兩書混入同一組「」 |
| 35 | `cond.functional_dyspepsia` | MINOR | `aliases_zh` 1 筆 vs `aliases_en` 2 筆（違反紅線 5）；8 條 red_flags 無 `source` 亦無 field_sources |
| 36 | `cond.gallstone_disease` | MINOR | `western_context` 內嵌「may need separate cards」這類編輯備註與 `cond.gallbladder_dysfunction` id，屬內部備註寫進讀者欄位 |
| 37 | `cond.gerd` | MINOR | 古籍書名「噯氣**吵雜**吞酸」應為「嘈雜」；`classical_references_en` 缺 |
| 38 | `cond.giant_cell_arteritis` | MINOR | `aliases_zh` 1 vs `aliases_en` 2；`western_context_en` 留有「unless the current repo has a different convention」編輯指示 |
| 39 | `cond.gout` | **DEFECT** | 樣板治療區塊；`acupuncture_scope_zh.precautions` 寫「應謹慎積極治療」，`_en` 卻是 "Avoid aggressive treatment" —— 安全欄位中英相反 |
| 40 | `cond.graves_disease` | CLEAN | 純 NIDDK；治療三欄不存在；紅旗五欄具名分頁 |
| 41 | `cond.hashimoto` | **DEFECT** | 樣板治療區塊；NIDDK 側內容品質高，對比更刺眼 |
| 42 | `cond.heart_failure` | **DEFECT（SAFETY）** | 50 方傾倒含 `半夏麻黃湯`（含麻黃）；`丹梔逍遙散(轉址)` 方名帶網站轉址標記；`western_pathology_zh` 被清成 `""` 但**無 import_artifacts 紀錄** |
| 43 | `cond.hemochromatosis` | MINOR | `acupuncture_scope.can_treat` 填的是警語，整張卡沒有回答「針灸可以做到哪裡」 |
| 44 | `cond.hip_osteoarthritis` | **DEFECT** | 樣板治療區塊；髖關節炎的穴位處方裡沒有任何一個髖部局部穴 |
| 45 | `cond.hyperemesis_gravidarum` | **DEFECT（SAFETY）** | **本批最嚴重。** 妊娠卡的 `acupoint_protocols` 是合谷＋三陰交；卡片自己寫對的 PC6 不在清單裡 |
| 46 | `cond.hypertension` | MINOR | 同卡兩個診斷門檻：`summary` 130/80 vs `western_pathology` 140/90；`臨床綜合征` 為簡體用字 |
| 47 | `cond.ibs` | MINOR | `field_sources.acupuncture_scope_*` 掛給 NIDDK（F-10 族第 6 例）；`etiology_en` 夾帶 provenance 句而 `_zh` 無 |
| 48 | `cond.influenza` | **DEFECT** | 樣板治療區塊；急性外感給八珍湯／補中益氣湯，與同卡 `related_patterns` 的風熱犯肺直接矛盾 |
| 49 | `cond.insomnia` | MINOR | `etiology_zh` 「**心山**失養」為「心神」之訛（`_en` 寫的是 heart-spirit）；`classical_references_en` 缺 |
| 50 | `cond.ivf_support` | **DEFECT（SAFETY）** | `acupuncture_scope` 是全批最佳（ASRM `guideline` 級、明寫不得宣稱提升活產率），但處方欄仍是合谷＋三陰交 |
| 51 | `cond.knee_osteoarthritis` | **DEFECT** | 證型名 `[通脈]四逆湯證` 帶方括號標記；42 方含烏頭湯；29 穴含大量上肢穴 |
| 52 | `cond.lactose_intolerance` | CLEAN | 全批唯一使用 `direction: "decreases"`（歐洲裔為保護因子），符合模板 §5.5 |
| 53 | `cond.lateral_epicondylitis` | **DEFECT** | 樣板治療區塊；網球肘沒有任何肘部局部穴 |
| 54 | `cond.lumbar_disc_herniation` | **DEFECT** | `herb_formulas` 含 **`精氣神源`**（非方名，疑為商品名）；50 方中十餘首為麻黃類外感方 |
| 55 | `cond.luteal_phase_defect` | **DEFECT** | 樣板治療區塊（生育卡，合谷＋三陰交）；ASRM 側內容是全批誠實度最高的之一 |
| 56 | `cond.medial_epicondylitis` | **DEFECT** | 樣板治療區塊；同 53 |
| 57 | `cond.menieres` | **DEFECT** | 樣板治療區塊；眩暈耳鳴卡沒有翳風／聽宮／風池 |
| 58 | `cond.meniscus_injury` | **DEFECT** | 樣板治療區塊；半月板損傷沒有任何膝部局部穴 |
| 59 | `cond.menopause_syndrome` | **DEFECT** | 樣板治療區塊；`risk_factors` 混入「症狀負擔個體差異大」這種非因子條目並標 `direction: increases` |
| 60 | `cond.menorrhagia` | **DEFECT** | 樣板治療區塊；月經過多給補氣血溫補方，與同卡 `related_patterns` 的血熱／血瘀矛盾 |
| 61 | `cond.migraine` | **DEFECT** | `western_pathology_zh` 仍是未清洗部落格文（含 `[@ad:1]`、假中文「登可以」「環境因」）且**無 `_en`**；`herb_formulas` 末項為第 1 部分點名的不存在方名 `鼻良湯` |

**合計：CLEAN 3 · MINOR 9 · DEFECT 19。**（第 1 部分：10 / 8 / 12）

> 品質下降**不是**因為這一段的卡片被寫得更差，而是因為**樣板治療區塊在字母序上聚集**：
> 第 1 部分 30 筆中 8 筆，本批 31 筆中 13 筆。扣掉樣板族之後，
> 本批 18 筆的分佈是 CLEAN 3 · MINOR 9 · DEFECT 6，與第 1 部分同量級。

---

## §2 逐項發現（所有 MINOR / DEFECT）

嚴重度：**SAFETY**（可能直接導致病人受傷或延誤）· **CLINICAL**（臨床上錯，會誤導判斷）· **QUALITY**（可信度/可追溯性受損）

---

### F-19 · SAFETY · `cond.hyperemesis_gravidarum` · `acupoint_protocols` + `herb_formulas`

**原文：**

```json
"icd_hint": "O21",
"name_zh": "妊娠劇吐（文件情境）",
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"],
"herb_formulas": ["八珍湯", "補中益氣湯", "柴胡疏肝散"]
```

**為什麼錯：**
這是第 1 部分 **F-01（`cond.breech_presentation`）的逐字重演**，而且結構完全相同：

同一張卡的 `acupuncture_scope_zh` 自己寫對了：

```
precautions: "孕期針灸須依安全穴位與手法執行，避免可能催產之強刺激穴位"
can_treat:   "可作為輕中度孕吐症狀緩解之輔助照護（如內關等傳統止嘔運用）"
```

`_en` 更明確點名 `PC6`。但 **PC6（內關）完全不在 `acupoint_protocols` 裡**，
清單裡的是合谷（LI4）與三陰交（SP6）—— 標準教材中孕期禁針/慎針的代表穴組。
**唯一正確的穴只出現在散文欄位，慎用穴出現在結構化處方欄位**，
而模板 §8.1 規定小卡會渲染處方與關聯計數，錯誤會被放大到列表層。

方劑同理：柴胡疏肝散／八珍湯／補中益氣湯不是妊娠劇吐處方，且未經孕期適用性標註。

**建議修法：** 同 F-01。三欄樣板搬 `import_artifacts`，依 `acupuncture_scope` 既有內容
重建為 `["內關 (PC6)"]` 並註明孕期條件；方劑欄留空比留錯好。

**這一族現在有 4 張卡（全庫）：**
`cond.breech_presentation`（F-01）· `cond.hyperemesis_gravidarum`（本條）·
`cond.ivf_support`（F-21）· `cond.luteal_phase_defect`（F-21）。
四張都是妊娠／生育情境，四張的處方欄都是同一組合谷＋三陰交。
**如果只做一件事，做這四張。**

---

### F-20 · SAFETY · `cond.fibromyalgia` · `etiology_zh` / `western_pathology_zh`

**原文（`etiology_zh` 節錄，三處）：**

```
一條經絡阻塞時，只要針對該經絡長期拍打、刮痧、拔罐、推拿或按摩，經絡氣血自然就會疏通，
這是不需要找醫生的，也是最簡單的養生法！
```

```
他當場以「四逆湯」科學中藥讓她服用，這位女性竟然說全身都感到麻麻的，有細微的感覺在運作，
沒多久之後所有疼痛都瞬間消失了！
```

```
要印證這種全身痛其實很容易，只要在冷氣房裡面不穿衣服，待到全身發抖之後就很容易就可以印證。
```

**為什麼錯：**

1. **直接抵銷自己的紅旗欄**。同一張卡的 `red_flags_zh[1]` 是
   「發燒、體重減輕、關節腫脹、皮疹 → 排除發炎性/自體免疫疾病」。
   病因欄卻對讀者說廣泛性疼痛「不需要找醫生」。這比第 1 部分 F-02（`cond.depression`）
   的「你沒有病！」更直接 —— 那是引述醫院的話，這是本文的主張。
2. **無執照給藥軼事＋治癒宣稱**：一位會員當場讓陌生人服用四逆湯（附子、乾薑、炙甘草），
   並描述「所有疼痛都瞬間消失」。這是廣告文案，示範的是不安全行為
   （憲法紅線 9：不把不確定寫成確定）。
3. **教讀者刻意受寒**以「印證」病機。

**同筆的其他錯誤：**

- **錯譯**：`western_pathology_zh` 寫「缺乏鎂、硒、牛磺酸、褪黑激素、**超氧化物雙效酶**」。
  superoxide dismutase 的標準譯名是**超氧化物歧化酶**；「雙效酶」不是任何酵素的名字。
  而且這段被歸給「現代醫學推斷」，`field_sources` 只給 CloudTCM URL。
- **假中文（書名）**：`etiology_zh` 引「《諸病**派**候論．風疾諸**侯**》」——
  正名為《諸病**源**候論．風**病**諸**候**》。同筆 `classical_references_zh` 內
  「源」已修正、「諸侯」仍錯。
- **中英不忠實，錯在中文側**：`etiology_en` 完整改寫成有距離的敘述
  （"The source record's meridian-measurement observations link fibromyalgia to…"），
  **完全沒有翻譯上面三段**。`western_pathology_zh` 直說「最適合從中醫下手」，
  `_en` 則寫 "the record frames this… as particularly suited to"。中文比英文硬。
- **標籤汙染**：`western_pathology_zh` 保留「因此常有人說這是『公主病』」。
- `[@post:388]`、`&hellip;`、「雲端中醫某會員」皆在**live 欄位**，不在 `import_artifacts`。
- `source_type` 標 `sourced_research_pack`，但 `field_sources` 對 etiology／western_pathology
  誠實標了 CloudTCM URL —— **`source_type` 與實際來源不符**（見 §3）。
- `field_sources.acupuncture_scope_*` 標 `"NIAMS — Fibromyalgia"`，
  該欄自己的 `source` 是 research pack、`note` 自承查不到指引（F-10 族）。

**建議修法：** 不適合小修。兩欄整段搬 `import_artifacts`（`cond.frozen_shoulder`／
`cond.knee_osteoarthritis` 已建立先例），依 NIAMS 重寫。**建議 Ting 先看過。**

---

### F-21 · SAFETY · 樣板治療區塊落在妊娠／生育卡（本批 3 筆，全庫 4 筆）

**受影響（本批）：** `cond.hyperemesis_gravidarum`（F-19）·
`cond.ivf_support` · `cond.luteal_phase_defect`

**`cond.ivf_support` 的矛盾最完整：**

```json
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"]
```

```json
"acupuncture_scope_zh": {
  "can_treat": "…ASRM 指出目前尚無充分證據顯示胚胎移植前後施行針灸可提升活產率，
                不可宣稱針灸能改善 IVF 活產結果",
  "evidence": "guideline",
  "note": "…此為療效宣稱之上限，不是鼓勵介入的依據，卡片內容不得超出此結論"
}
```

**為什麼錯：**
這張卡的 `acupuncture_scope` 是**全批寫得最好的一欄**——
唯一標 `evidence: "guideline"` 並附上一份**結論對執業者不利**的具名指引，
還明文設定療效宣稱上限。然後同一張卡的處方欄，
在一個涵蓋胚胎植入後與黃體支持期（`red_flags` 明列「任何疑似異位妊娠徵象」）的情境下，
呈現合谷＋三陰交。**寫得最謹慎的欄位與最粗糙的欄位在同一張卡上。**

`cond.luteal_phase_defect` 同樣：ASRM committee opinion 被正確引用、
明寫「不可宣稱針灸能『治療』或『矯正』一項尚未有可靠確診檢驗的病理實體」，
處方欄仍是同一組。

**建議修法：** 與 F-19 同批處理。

---

### F-22 · CLINICAL · `cond.gout` · `acupuncture_scope_zh.precautions` 中英相反

**原文：**

```json
"acupuncture_scope_zh": {"precautions": "急性紅腫熱痛關節在感染排除前應謹慎積極治療；腎臟疾病與抗凝藥物會影響安全性"}
"acupuncture_scope_en": {"precautions": "Avoid aggressive treatment of acutely inflamed joint until infection excluded; kidney disease/anticoagulants influence safety"}
```

**為什麼錯：**
`_en` 說 **Avoid** aggressive treatment（不要積極治療）；
`_zh` 說「應**謹慎積極**治療」—— 讀起來是「要小心地積極治療」，語意相反。
從句構看是漏掉「避免」二字（應為「應**避免**積極治療」）。

這不是強度落差（第 1 部分 F-15 那一類），是**方向相反**，而且發生在
安全欄位、發生在一張紅旗第一條是「發燒合併關節症狀 → 立即轉診排除感染性關節炎」的卡上。
中文讀者拿到的指示，與英文讀者拿到的指示互相抵觸。

**建議修法：** `_zh` 改為「急性紅腫熱痛關節在感染排除前應**避免積極**治療」。
單欄兩字修改，可入即時修正批次。

---

### F-23 · CLINICAL · `cond.heart_failure` · `herb_formulas` + `tcm_patterns` + 被清空的欄位

**原文（`herb_formulas` 50 筆節錄）：**

```json
"herb_formulas": ["桂枝茯苓丸", "半夏麻黃湯", "大柴胡湯", …,
                  "桂枝去芍藥加蜀漆牡蠣龍骨救逆湯", …]
```

**為什麼錯：**

1. **`半夏麻黃湯` 出現在心臟衰竭的方劑清單。** 麻黃為擬交感神經作用藥材，
   心臟衰竭與心律不整是其公認的謹慎/禁忌情境。清單裡沒有任何註記。
   （另：`data/herbs/formulas.json` 224 筆中**查無「半夏麻黃湯」**；
   《金匱要略》原方名為半夏麻黃**丸**。名稱與存在性都對不上。）
2. **`桂枝去芍藥加蜀漆牡蠣龍骨救逆湯` 含蜀漆**（常山苗，催吐、有毒），亦查無此卡。
3. **方名帶網站轉址標記**：

```json
{"pattern_zh": "肝氣鬱結", "formula_zh": "丹梔逍遙散(轉址)", …}
```

   `(轉址)` 是抓取來源網頁的重導向註記，被當成方名的一部分存了下來。
   全庫另有 `cond.hyperthyroidism`、`cond.palpitations` 兩張卡帶同樣標記。
   （`丹梔逍遙散` 本身亦不在 formulas.json。）

4. **`western_pathology_zh` 被清成 `""`，但這張卡沒有 `import_artifacts`。**
   模板 §3.5.5 建立的流程是「先搬再清」。全庫 33 筆 `western_pathology_zh === ""`，
   其中 **31 筆有對應的 `import_artifacts` 紀錄，只有 2 筆沒有**：
   `cond.heart_failure` 與 `cond.male_infertility`。
   而 heart_failure 正是模板 §3.5.5 點名的那一筆
   （「**誤植**（heart_failure 裝著心律不整文）」）—— 依 §3.5.5 該文應**先搬到正確卡**再清。
   目前沒有任何欄位記錄它去了哪裡。`western_pathology_en` 這個 key 也不存在。

5. `tcm_patterns` 的 symptoms 是通用證型症狀辭典，不是本病症狀：
   心脾兩虛條列「男性勃起障礙」，炙甘草湯證條列「胎漏」「月經過多」。
6. `acupoint_protocols` 20 穴、物件 shape、非正規 code（`HT08`/`LU10`/`PC06`/`REN17`/`SP03`/`LV03`）。

**建議修法：** 4 需要先確認原文是否已存在於某張心律不整卡；若否，**這是不可逆損失，
須向 Ting 回報**（憲法紅線 3）。1–3 屬 `data/herbs/**` 所有權，本線只能回報。

---

### F-24 · CLINICAL · `cond.migraine` · `western_pathology_zh` 未清洗 + 無 `_en`

**原文（節錄，725 字全欄）：**

```
偏頭痛的原因至今仍沒有確切答案，對現代醫學而言是個謎，依然只能歸類於環境因、壓力或
遺傳因素所導致的。

然而，這種原因成謎的症狀，最適合從中醫理論來解釋，從上面的所有偏頭痛症狀，登可以輕易地
從中醫的經絡理論來理解。如果一個人長期偏頭痛不癒，從中醫理論來加以預防養生，成功的機率
會是很高的！[@ad:1]
```

**為什麼錯：**

1. **兩個假中文**在同一段：
   - 「環境**因**」掉字（應為環境因素）
   - 「**登**可以輕易地」—— 「登」是「都」或「就」的抓取訛字，無法讀通。
   兩者驗證器都抓不到，只有眼睛能抓（`CLAUDE.md` 第 2 條）。
2. `[@ad:1]` 廣告嵌入短碼在 **live 欄位**。
3. **無 `western_pathology_en`**（該 key 不存在）→ C5 雙語缺口，且缺的是英文側。
4. `field_sources` **完全沒有 `western_pathology_zh` 的條目** ——
   這 725 字會渲染出去而不帶任何來源。
5. **ledger 自述與事實不符（流程層問題）**：同筆 `import_artifacts[0].reason` 寫著

```
(western_pathology_zh on this record is separately C10-shared-verbatim boilerplate
 — out of scope for this batch, left untouched for the C10/batch-2 pass.)
```

   但這一欄**不是**那句 31 筆共用的樣板句，是 725 字的部落格敘事文。
   後續照這條 ledger 去跑 C10 pass 的人會找不到預期的東西，這一欄會被漏掉。

**同筆其他：**

- `herb_formulas` 末項為 **`鼻良湯`** —— 第 1 部分 F-06 在 `cond.cervical_spondylosis`
  點名的不存在方名。經核對 `formulas.json`（224 筆）確認查無，且**全庫共 3 張卡**帶此方名：
  `cond.cervical_spondylosis` · `cond.migraine` · `cond.migraine_vestibular`。
  **F-06 不是單筆造字，是同一個抓取批次的殘留，要當一族處理。**
- `tcm_patterns` 含麻黃附子細辛湯證、真武湯證，症狀清單為通用辭典
  （真武湯證在偏頭痛卡上條列「下肢水腫」「排尿困難」）。
- `acupoint_protocols` 27 穴、物件 shape、非正規 code，含地倉 `ST04`、聽宮 `SI19`、養老 `SI06`。
- `classical_references_zh` 有 `&hellip;`、無 `_en`。
- **分類**：`category: "pain_msk"`。偏頭痛的 `content_source` 是
  `standard_neurology_reference`、`related_eastern_diseases` 是 `tdis.tou_tong`，
  同批的 `cond.epilepsy`／`cond.menieres` 都是 `neuro`，
  全庫 `cond.trigeminal_neuralgia` 也是 `neuro`。
  （`cond.tension_headache` 同樣標 `pain_msk`，所以這是兩筆一致的選擇，
  不確定是不是刻意 —— **列為 Ting 決定項，不列為缺陷。**）

---

### F-25 · CLINICAL · 樣板治療區塊（本批 13 筆）

**受影響（本批 31 筆中）：**
`cond.gout` · `cond.hashimoto` · `cond.hip_osteoarthritis` · `cond.hyperemesis_gravidarum`（F-19）·
`cond.influenza` · `cond.ivf_support`（F-21）· `cond.lateral_epicondylitis` ·
`cond.luteal_phase_defect`（F-21）· `cond.medial_epicondylitis` · `cond.menieres` ·
`cond.meniscus_injury` · `cond.menopause_syndrome` · `cond.menorrhagia`

**原文（13 筆完全逐字相同，與第 1 部分 F-07 的 8 筆亦逐字相同）：**

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

**本批新增的三個觀察（第 1 部分沒有的）：**

1. **`cond.influenza` 的樣板不只是空話，是臨床上錯的方向。**
   流感是急性外感；同卡 `related_patterns` 正確填 `pattern.wind_heat_invading_lung`。
   樣板卻給八珍湯與補中益氣湯 —— **表邪未解而純補**，
   是中醫本身認定的治法錯誤（閉門留寇），不只是「內容較淺」。
   `related_patterns` 與 `tcm_patterns` 互相矛盾這一點，
   同見於 `cond.menieres`（registry 側是痰濕／肝陽上亢／腎精不足）、
   `cond.menorrhagia`（registry 側是脾不統血／血熱／血瘀，樣板卻給溫補）。

2. **局部穴缺席的模式完全一致**：
   髖關節炎沒有髖部穴、網球肘與高爾夫球肘沒有肘部穴、半月板損傷沒有膝部穴、
   梅尼爾氏症沒有翳風／聽宮／風池。與第 1 部分的腰扭傷、腕隧道同構。

3. **`cond.gout` 內部不一致**：`acupoint_protocols` 是 `[]`，
   `tcm_patterns` 裡卻有六個穴。同第 1 部分 F-18（`cond.chronic_low_back_pain`）。

**全庫數字（機器可重現）：**

```
tcm_patterns 樣板：74 / 505      acupoint_protocols 樣板：71 / 505      herb_formulas 樣板：73 / 505
全細節 92 筆中：26 筆（第 1 部分 8 + 本批 13 = 21 已點名，餘 5 在第 62–92 筆）
```

**建議修法：** 同第 1 部分 F-07 —— 三欄搬 `import_artifacts`、欄位留空、等待逐病策展。
**優先序：4 張妊娠／生育卡（F-19/F-21）> `cond.influenza`（治法方向錯）> 其餘。**

---

### F-26 · CLINICAL · 未策展的抓取傾倒：不存在的方名與峻毒方無註記（本批 7 筆）

**受影響：** `cond.endometriosis`(50方/30穴) · `cond.frozen_shoulder`(50/16) ·
`cond.heart_failure`(50/20) · `cond.knee_osteoarthritis`(42/29) ·
`cond.lumbar_disc_herniation`(50/28) · `cond.migraine`(50/27) · `cond.fibromyalgia`(25/8)

**A. 不存在於 `data/herbs/formulas.json` 的名稱（已逐一核對 224 筆）**

| 名稱 | 出現的卡 | 判定 |
|---|---|---|
| **`精氣神源`** | `cond.lumbar_disc_herniation` · `cond.male_infertility` · `cond.erectile_dysfunction` | **不是方名。** 三張卡都是「腎虛／男性」主題，字面與結構像保健食品商品名 |
| **`鼻良湯`** | `cond.cervical_spondylosis`（第1部分 F-06）· `cond.migraine` · `cond.migraine_vestibular` | 抓取斷詞殘片，第 1 部分已判定；本次確認為 **3 筆一族**，非單筆 |
| **`丹梔逍遙散(轉址)`** | `cond.heart_failure` · `cond.hyperthyroidism` · `cond.palpitations` | 網站轉址標記併進方名 |
| `脫敏湯` · `烏頭湯` · `三物備急丸` · `天雄散` · `正骨紫金丹` · `清上蠲痛湯` · `斑龍丸` · `大造丸` · `半夏麻黃湯` · `桂枝去芍藥加蜀漆牡蠣龍骨救逆湯` | 本批各卡 | 真實方名但**未建卡** → 點進去是死連結 |

**B. 峻烈／有毒方出現在不相干的卡上且無任何註記（憲法紅線 4）**

```
cond.frozen_shoulder      → 天雄散（天雄=烏頭類）· 三物備急丸（巴豆）· 大陷胸湯/丸（甘遂）
cond.knee_osteoarthritis  → 烏頭湯（生烏頭）
cond.heart_failure        → 半夏麻黃湯（麻黃，心衰謹慎）· 桂枝去芍藥加蜀漆…救逆湯（蜀漆）
```

第 1 部分在 `cond.chronic_gastritis` 記錄「本批唯一列出的毒性峻劑而無任何註記（十棗湯）」——
**本批顯示這不是唯一，而是抓取傾倒的常態**：只要 `herb_formulas` 超過 ~25 筆，
裡面就會有峻毒方，因為那是整個資料庫的傾倒而不是本病的清單。

**C. 清單內容與病種無關的例子（可直接引用）**

```
cond.lumbar_disc_herniation：麻黃湯、大青龍湯、小青龍湯、越婢湯、麻杏石甘湯、射干麻黃湯、
                            桂枝麻黃各半湯、小青龍加石膏湯、越婢加半夏湯 —— 九首呼吸道外感方
cond.knee_osteoarthritis   ：acupoint_protocols 含尺澤LU5、孔最LU6、曲澤PC3、少海HT3、
                            天井SJ10、小海SI8、支正SI7、曲池LI11、手三里LI10 —— 九個上肢穴
cond.endometriosis         ：herb_formulas 含金鎖固精丸（遺精）、七寶美髯丹（鬚髮）、
                            白虎加人參湯；tcm_patterns 的「下焦濕熱」條列「男性勃起障礙」
```

**建議修法：** 這 7 筆與第 1 部分的 4 筆屬同一族。方名問題屬 `data/herbs/**`
（方劑線）所有權，本線只能回報；欄位傾倒則同 F-25 走 `import_artifacts` 流程。

---

### F-27 · CLINICAL · `cond.hypertension` · 同卡兩個診斷門檻

**原文：**

```json
"summary_zh": "…（多數指引以收縮壓 ≥130 mmHg 或舒張壓 ≥80 mmHg 為異常門檻，各家標準略有差異）…"
"western_pathology_zh": "體循環動脈血壓持續升高（收縮壓≥140mmHg和/或舒張壓≥90mmHg）為特徵的臨床綜合征。"
```

**為什麼錯：**
同一張卡上兩個互相衝突的數字門檻，而且**兩邊的態度不同**：
`summary` 有保留（「各家標準略有差異」），`western_pathology` 是斷言。
`_en` 兩側逐字對應，所以中英一致 —— 錯的是卡內自洽性。
憲法紅線 4 要求數字必須具名來源；這兩欄的 `field_sources` 只有 summary 有
（`NHLBI — High Blood Pressure`），`western_pathology_zh` **沒有 field_sources 條目**。
被渲染出去時，讀者會在同一頁上讀到兩個門檻而不知道哪個算數。

**同筆其他：**

- 「臨床綜合**征**」：`征` 為簡體字形，繁體應作「症候群」或「綜合徵」。`_zh` 欄位裡的字形漂移。
- `etiology_zh` 是「肝陽上亢，肝腎陰虛，痰濕中阻，陰陽兩虛。」——
  這是**證型清單**，不是病因病機，而且逐字重複 `related_patterns`。
  模板 §5.5 要求 etiology 回答「這個病怎麼發生的」。
- `acupuncture_scope.evidence: "label_derived"`：`note` 講的是降壓藥驟停的反彈風險，
  方向上確實是從藥品標籤推導；但 `source` 只寫 research pack／NHLBI，
  **沒有具名任何一張標籤**（模板 §5.6 範例要求 `dailymed:…#BOXED_WARNING` 這種粒度）。
  這一條比第 1 部分 F-12（`cond.eczema`）輕，但屬同一族。

---

### F-28 · QUALITY · `cond.insomnia` · `etiology_zh` 「心山失養」

**原文：**

```json
"etiology_zh": "心山失養，情志所傷，飲食不節，病後體虛，致使陽不入陰、神不守舍。"
"etiology_en": "Malnourishment of the heart-spirit, emotional injury, irregular diet, and
                post-illness weakness, resulting in yang failing to enter yin and the spirit
                failing to stay settled in its residence."
```

**為什麼錯：**
「心**山**失養」不是任何中醫術語。`_en` 寫的是 **heart-spirit**，
所以原文應為「心**神**失養」——「神」被訛成字形相近的「山」。

這是本批最乾淨的「假中文」樣本：驗證器全綠、雙語成對、來源齊全，
但一位執業者打開卡片第一段就會讀到一個不存在的詞。
（`CLAUDE.md` 第 2 條：「假中文、隱形英文、樣板句只有眼睛抓得到。」）

**建議修法：** 「心山」→「心神」。單字替換，可入即時修正批次。

**同筆其他：** `classical_references_zh` 有內容、無 `_en`（C5）；
`《馮氏錦囊·卷十二》` 引文以「；」結尾，句子被截斷。

---

### F-29 · QUALITY · 古籍引文的字形與斷句錯誤（3 筆）

**A. `cond.gerd` — 書名章節錯字**

```json
"classical_references_zh": "《沈氏尊生書.噯氣吵雜吞酸惡心源流》：「吞酸者，鬱滯日久，…」"
```

「**吵雜**」（吵鬧）應為「**嘈雜**」—— 嘈雜是《雜病源流犀燭》該篇所論的中醫症狀名
（胃中空虛似飢非飢、似辣非辣的嘈擾感）。書名裡的症狀名寫錯字，
會讓這條引文在任何文獻檢索裡都找不到。

**B. `cond.frozen_shoulder` — 兩本書混進同一組「」**

```
《景岳全書》：「有濕熱之為病者，…當歸拈痛湯之類主之。其有熱甚者，如抽薪飲之類亦可暫用。
"《臨證指南醫案》徐靈胎評"肩臂背痛"項下載"痛定於肩背，此著痹之類，…煎藥不能取效也。」
```

《臨證指南醫案》的內容被包在《景岳全書》的引號裡，中間用的是 **ASCII 直引號 `"`**
而不是中文引號。結果是：一段《臨證指南醫案》的文字會被讀成《景岳全書》的原文。
這是引用歸屬錯誤，不只是標點問題。

**C. `&hellip;` 未解碼（本批 3 筆，live 欄位）**

`cond.fibromyalgia` · `cond.frozen_shoulder` · `cond.migraine`
（`cond.lumbar_disc_herniation` 的 `&hellip;` 只在 `import_artifacts` 內，已隔離）

第 1 部分 B2 批次列了 4 筆，本批再加 3 筆 → **累計 7 筆**。

---

### F-30 · QUALITY · `field_sources.acupuncture_scope_*` 掛給不談針灸的來源（本批 3 筆）

**受影響：** `cond.endometriosis` · `cond.fibromyalgia` · `cond.ibs`

**原文（以 `cond.ibs` 為例，同一筆內互相矛盾）：**

```json
"field_sources": {"acupuncture_scope_zh": ["NIDDK — Irritable Bowel Syndrome"]}
```

```json
"acupuncture_scope_zh": {
  "source": "AcuTing OS Disease Knowledge Research Pack — Batch H GI/Liver（依據 NIDDK 臨床資料整理）",
  "note": "尚未查到專屬於腸躁症的針灸療效臨床指引，此為執業範圍謹慎建議"
}
```

**為什麼錯：** 完全同第 1 部分 F-10 —— NIDDK／NIAMS／NICHD 沒有任何一頁寫過針灸執業範圍，
把該欄出處標成這些機構等於替 NIH 掛名一段它沒說過的話；
而同一筆記錄的欄內 `source` 與 `note` 已經誠實寫了真正的出處與「查不到」。

**累計：第 1 部分 5 筆 + 本批 3 筆 = 8 筆。** 其餘 23 筆做法正確。
修法完全機械：把 `field_sources.acupuncture_scope_zh/_en` 改抄該欄自己的 `source` 值。

---

### F-31 · QUALITY · `import_artifacts[].reason` 本身是樣板句，且對半數記錄不成立

**原文（34 筆逐字相同）：**

```json
"reason": "CloudTCM blog-narrative import junk (member anecdotes, ad embed codes,
           rhetorical blog voice) — not template-appropriate 病理生理/病因病機 content per
           CONDITION_CARD_TEMPLATE §3.5.5. Field cleared to an honest gap;
           no replacement content invented this batch."
```

**為什麼錯：**

1. **它是樣板句**（憲法紅線 6），34 筆共用。全庫有 `import_artifacts` 的記錄共 42 筆，
   其中 34 筆用這一句。`reason` 的用途是說明**這一筆**為什麼被搬，
   共用一句就等於沒說明。
2. **對其中相當一部分是假的。** 句尾寫「Field cleared to an honest gap;
   no replacement content invented this batch」，但至少
   `cond.frozen_shoulder`、`cond.knee_osteoarthritis`、`cond.lumbar_disc_herniation`
   三筆的 `etiology_zh` 與 `western_pathology_zh` **都填上了新的具名內容**
   （分別標 `curriculum TCM pathology course materials` 與 `AAOS OrthoInfo` / `NIAMS`）。
   欄位不是 honest gap，是已重建。ledger 說反了。
3. `cond.frozen_shoulder` 的 artifact 文字中殘留一個 **`\b`（BACKSPACE, U+0008）控制字元**
   （「也會影響到手部\b，這就是為什麼」）—— 已隔離，但屬同一批抓取殘渣。

**加分項必須記錄（與第 1 部分 F-06 的評語一致）：**
`cond.frozen_shoulder`、`cond.knee_osteoarthritis`、`cond.lumbar_disc_herniation`
三筆的處置是**本批做得最對的一件事** —— 先搬再清、附 reason 與 moved_at、
再以具名來源重建，重建後的 `etiology_zh` 品質明顯高於原文。其他汙染卡應照抄。

**第 1 部分 F-06 的一條 QUALITY 附註現已過期：**
該條指出 `reason` 引用的 `CONDITION_CARD_TEMPLATE §3.5.5` 不存在。
**§3.5.5 已於 2026-08-11 加入模板**（`### 3.5.5 import_artifacts`），交叉引用現在是正確的。

---

### F-32 · QUALITY · 內部編輯備註寫進讀者可見欄位（2 筆）

**受影響：** `cond.gallstone_disease` · `cond.giant_cell_arteritis`

**原文：**

```json
// cond.gallstone_disease · western_context_en
"Asymptomatic cholelithiasis, acute cholecystitis and common-bile-duct stones are different
 clinical states and may need separate cards. This card is distinct from the existing
 `cond.gallbladder_dysfunction` …"
```

```json
// cond.giant_cell_arteritis · western_context_en
"The card should therefore use GCA as the broader canonical biomedical identity while
 preserving \"temporal arteritis\" as an alias unless the current repo has a different convention."
```

**為什麼錯：**
「may need separate cards」「The card should therefore use…」「unless the current repo has
a different convention」是寫給**編者**的指示，不是寫給執業者的臨床脈絡。
`western_context_*` 依模板 §8.2 會渲染進大卡的「① 定義／④ 診斷鑑別」。
其中還內嵌了 backtick 包住的 id（`` `cond.gallbladder_dysfunction` ``），
那是 repo 內部識別碼，對讀者無意義。

`cond.gallstone_disease` 另有中英不對稱：「may need separate cards」在 `_zh` 沒有對應句
（`_zh` 只寫「是不同的臨床狀態」）。

**建議修法：** 兩句移到 `sources` 旁的註記或 PROJECT_LOG，臨床欄位只留臨床內容。

---

### F-33 · QUALITY · `_en` / `_zh` 陣列長度不等（2 筆，違反憲法紅線 5）

**受影響：** `cond.functional_dyspepsia` · `cond.giant_cell_arteritis`

```json
// cond.functional_dyspepsia
"aliases_zh": ["消化不良"]                          // 1
"aliases_en": ["Dyspepsia", "Indigestion"]          // 2

// cond.giant_cell_arteritis
"aliases_zh": ["顳動脈炎"]                          // 1
"aliases_en": ["Temporal Arteritis", "GCA"]         // 2
```

**為什麼錯：** 憲法紅線 5 與模板 §6：「陣列的 `_en` 長度必須等於 `_zh`，
**或者整個留空**。寧可整個留空，也不要半套錯位。」
目前是索引錯位：任何按 index 配對 zh/en 別名的消費端，都會把「消化不良」配到 "Dyspepsia"
而讓 "Indigestion" 落單；GCA 同理。

**建議修法：** `aliases_zh` 補到 2 筆（如「消化不良」+「胃脹氣不適」需 Ting 決定用詞；
GCA 可補「巨細胞動脈炎」的通用縮寫寫法），或依模板將 `aliases_en` 縮為 1 筆。
**用詞需要 Ting 決定，不是純機械。**

---

### F-34 · QUALITY · `risk_factors` 混入非因子條目（2 筆）

**受影響：** `cond.menopause_syndrome` · `cond.menorrhagia`

```json
// cond.menopause_syndrome
{"factor": "症狀負擔個體差異大", "direction": "increases", "modifiable": false}

// cond.menorrhagia
{"factor": "新出現的大量出血需依個別情境評估", "direction": "increases", "modifiable": false}
```

**為什麼錯：**
「症狀負擔個體差異大」是關於變異度的陳述，「需依個別情境評估」是照護指示。
兩者都不是因子，因此 `direction: "increases"`（增加什麼？）與 `modifiable: false`
在這兩條上沒有意義，只是為了填滿 schema 而填。

這與第 1 部分 F-09（`cond.diminished_ovarian_reserve` 把照護建議混進 `red_flags`）
是同一個模式的另一欄：**結構化欄位被當成自由文字欄位用**。
模板 §5.5 說 `modifiable` 是這一欄最實用的部分（分辨「該擔心」與「該做什麼」）；
混入非因子條目會稀釋這個分辨。

**同族但較輕：** `cond.functional_dyspepsia` 的 8 條 `red_flags` 全是舊式字串、
**沒有任何 `source`**，`field_sources` 也沒有 `red_flags` 條目。
內容本身正確（是 NIDDK 的 alarm features 清單），但依模板 §5 五欄規格與憲法第三條，
紅旗必須具名來源。

---

### F-35 · QUALITY · `acupuncture_scope.can_treat` 填的不是「可以做到哪裡」（1 筆）

**原文（`cond.hemochromatosis`）：**

```json
"acupuncture_scope_zh": {
  "can_treat": "不得將針灸放血與醫療性放血混為一談",
  "precautions": "須考量肝硬化、糖尿病、心臟疾病與治療狀態"
}
```

**為什麼錯：**
模板 §5.6 定義 `can_treat` 是「這個病針灸的適應範圍是什麼（症狀緩解／輔助／不適用）」。
這裡填的是一條警語，而且是 `precautions` 該講的話。
結果是這張卡**從頭到尾沒有回答**執業者最需要的問題：血色素沉著症的病人，針灸能做什麼、
或該不該做。留空反而誠實（模板明寫 `unknown` 是正確初始值）；填一句警語會讓欄位看起來已填。

對照本批寫得對的：`cond.acute_pancreatitis`（第 1 部分）、`cond.graves_disease`
（「僅作為輔助性照護，不可延誤生化診斷或治療」）、`cond.influenza`
（「不建議在未評估感染管制風險前提供常規面對面針灸治療急性傳染病」）——
都明確回答了「可以做到哪裡」。

---

### F-36 · QUALITY · `acupoint_protocols` 兩種 shape、兩套 code 格式（本批 7 筆）

**受影響：** `cond.endometriosis`(30) · `cond.knee_osteoarthritis`(29) ·
`cond.lumbar_disc_herniation`(28) · `cond.migraine`(27) · `cond.heart_failure`(20) ·
`cond.frozen_shoulder`(16) · `cond.fibromyalgia`(8)

**全庫：物件 shape 的 `acupoint_protocols` 共 49 / 505 筆**（第 1 部分點名 4 筆，本批 7 筆）。

**原文：**

```json
"acupoint_protocols": [
  {"name_zh": "期門", "code": "LV14"}, {"name_zh": "命門", "code": "DU04"},
  {"name_zh": "中極", "code": "REN03"}, {"name_zh": "外關", "code": "SJ05"},
  {"name_zh": "內關", "code": "PC06"}, {"name_zh": "合谷", "code": "LI04"}
]
```

**為什麼錯：** 同第 1 部分 F-17。`LV`/`DU`/`REN`/`SJ` 與補零（`LI04`/`SP06`/`PC06`/`KI01`）
不是本專案鎖定的格式（憲法紅線 1：`SP6` · `ex.hn3`），因此**接不上 `point_id_manifest.json`**。
同一欄位在同一份檔案裡有兩種型別，任何消費端都得寫兩套分支。

**注意：這一條不是要求改 id 格式，而是指出這 7 筆用的根本不是本專案的 id。**
映射規則：`LV→LR` · `DU→GV` · `REN→CV` · `SJ→TE` · 去補零。

**本批新增的安全觀察：** `cond.frozen_shoulder` 與 `cond.heart_failure` 的清單都含
**極泉（`HT01`）** —— 腋窩深部，鄰近腋動脈與臂神經叢，兩張卡的 `precautions` 都沒有提到它。
既然這兩欄是未策展傾倒，處置方式仍是整欄搬走（F-26），不是逐穴補註記。

---

## §3 統計與建議下一步

### 判定分佈（31 筆）

| 判定 | 筆數 | 佔比 | 第 1 部分對照 |
|---|---|---|---|
| CLEAN | 3 | 10% | 10（33%）|
| MINOR | 9 | 29% | 8（27%）|
| DEFECT | 19 | 61% | 12（40%）|

**兩批合計 61 筆：CLEAN 13 · MINOR 17 · DEFECT 31。**

### 發現的嚴重度分佈（本批 18 條，F-19 – F-36）

| 嚴重度 | 條數 | 編號 |
|---|---|---|
| SAFETY | 3 | F-19, F-20, F-21 |
| CLINICAL | 6 | F-22, F-23, F-24, F-25, F-26, F-27 |
| QUALITY | 9 | F-28 – F-36 |

### 來源族規則：**成立，但要降一層來看**

第 1 部分的結論是「卡片品質幾乎完全由來源族決定」。本批**證實了這條規則，
同時證明 `source_type` 這個欄位不是它的可靠代理**：

**成立的部分（record 層）：**

| 來源族 | 本批筆數 | 結果 |
|---|---|---|
| 純 NIH／學會 research pack，**治療三欄不存在** | 6（epilepsy · gallstone · GCA · graves · hemochromatosis · lactose）| **CLEAN 3 · MINOR 3，0 DEFECT** |
| 樣板治療區塊 | 13 | **13 全部 DEFECT** |
| 未清洗／未策展 CloudTCM 抓取 | 7 | **6 DEFECT · 1 MINOR** |
| 已策展的 CloudTCM（方穴 4–6 筆、正規 code） | 5（functional_dyspepsia · gerd · hypertension · ibs · insomnia）| **5 全部 MINOR，0 DEFECT** |

**這一批最有用的新結論：`herb_formulas` 的長度就是品質指標。**

```
0 筆    → 6 筆記錄，0 DEFECT（誠實留空）
3 筆    → 13 筆記錄，13 DEFECT（樣板）
4–6 筆  → 5 筆記錄，0 DEFECT（人工策展）
25–50 筆→ 7 筆記錄，6 DEFECT（抓取傾倒）
```

**不成立的部分（`source_type` 欄位層）：**

- `cond.fibromyalgia` 標 `sourced_research_pack`，但 `field_sources` 自承
  etiology／western_pathology 來自 CloudTCM，內容是含治癒宣稱的部落格文。
  **`source_type` 說謊，`field_sources` 說實話。** 逐欄位的 `field_sources` 才是可信的分族依據。
- 本批 13 筆樣板中，**12 筆完全沒有 `source_type` 欄位**（唯一例外 `cond.gout`）；
  18 筆非樣板則全部有。在全細節 92 筆這一層，
  **「缺 `source_type`」是樣板族的堪用機器訊號**（92 筆中 21 筆缺、26 筆為樣板）。
  全庫 505 筆則不成立（370 筆缺 source_type，多數是骨架卡）。

### 建議：立即修正批次（機械性、低風險、不需 Ting 判斷）

延續第 1 部分 B1–B6 的編號：

| 批次 | 內容 | 筆數 | 說明 |
|---|---|---|---|
| **B7** | `field_sources.acupuncture_scope_*` 改抄該欄自己的 `source` | 3 | F-30。endometriosis · fibromyalgia · ibs。**與第 1 部分 B1 的 5 筆合併成一批 8 筆做** |
| **B8** | `&hellip;` → `…` | 3 | F-29C。fibromyalgia · frozen_shoulder · migraine。**與 B2 的 4 筆合併成 7 筆** |
| **B9** | `cond.insomnia`：`etiology_zh` 「心山失養」→「心神失養」 | 1 | F-28。`_en` 已確認為 heart-spirit |
| **B10** | `cond.gout`：`acupuncture_scope_zh.precautions` 補「避免」二字，對齊 `_en` | 1 | F-22。安全欄位中英相反 |
| **B11** | `cond.gerd`：`classical_references_zh` 書名「吵雜」→「嘈雜」 | 1 | F-29A |
| **B12** | `cond.migraine`：`western_pathology_zh` 「環境因」→「環境因素」、「登可以」→「都可以」 | 1 | F-24。**注意：這只是止血，該欄整段仍需依 F-24 走 import_artifacts 流程** |
| **B13** | `cond.hypertension`：`western_pathology_zh` 「臨床綜合征」→「臨床綜合徵」 | 1 | F-27。簡體字形 |
| **B14** | `cond.frozen_shoulder` `import_artifacts[1].text` 移除 `\b`（U+0008）控制字元 | 1 | F-31.3 |

B7–B14 合計動 12 筆、全部單欄/單字替換。改完跑
`node scripts/build-data.js` + `node scripts/validate-condition-standard.js` +
`node scripts/validate-content-junk.js`。

### 建議：需要 Ting 先看過再動

| 項目 | 為什麼要先問 | 優先序 |
|---|---|---|
| **4 張妊娠／生育卡的處方欄（F-19/F-21 + 第 1 部分 F-01）** | `breech_presentation` · `hyperemesis_gravidarum` · `ivf_support` · `luteal_phase_defect` 四張的 `acupoint_protocols` 都是合谷＋三陰交。可先做「三欄搬 `import_artifacts` + 留空」的止血，但重建需 Ting 確認寫法 | **1** |
| **`cond.fibromyalgia`（F-20）** | 「這是不需要找醫生的」「所有疼痛都瞬間消失了」在 live 欄位。涉及整段內容留空，憲法第三條要求先問 | **2** |
| **`cond.heart_failure` 被清空且無 artifact 紀錄（F-23.4）** | 模板 §3.5.5 點名的誤植文現在下落不明。**若原文沒有被搬到心律不整卡，這是不可逆損失**（紅線 3）。須先確認再決定補救 | **3** |
| **`cond.migraine` `western_pathology_zh`（F-24）** | 725 字部落格文 + 無 `_en` + 無 field_sources；且該筆自己的 ledger 註記把它誤判為樣板句，會讓後續 C10 pass 漏掉 | **4** |
| **樣板治療區塊全庫清理（F-25）** | 全庫 74 筆（全細節 92 筆中 26 筆；兩批已點名 21 筆）。搬走 = 74 張卡的治療區塊全空。這是產品層取捨（誠實的空 vs 假的滿），不是實作決定。**`cond.influenza` 建議單獨提前**，因為它不只是空話，是治法方向錯 | 5 |
| **7 筆抓取傾倒（F-26）** | `frozen_shoulder`／`knee_osteoarthritis`／`lumbar_disc_herniation` 已建立 `import_artifacts` 先例可照抄，但每筆要搬 25–50 個方名與 8–30 個穴 | 6 |
| **不存在／污染的方名（F-26A）** | `精氣神源`（3 卡）· `鼻良湯`（3 卡）· `丹梔逍遙散(轉址)`（3 卡）· `[通脈]四逆湯證`（6 卡）。屬 `data/herbs/**` 與抓取層，**本線只能回報，不能改** | 7 |
| **`classical_references_en` 全缺（本批 8 筆）** | `endometriosis` · `fibromyalgia` · `frozen_shoulder` · `functional_dyspepsia` · `gerd` · `insomnia` · `lumbar_disc_herniation` · `migraine`。加第 1 部分 5 筆 = **13 筆**。翻譯古籍成本高，Ting 需決定：翻譯／暫留單邊記入豁免／整欄留空 | 8 |
| **`aliases` 長度不等（F-33，2 筆）** | 補中文別名需要 Ting 決定用詞，不是純機械 | 9 |
| **`import_artifacts[].reason` 樣板句（F-31）** | 34 筆共用一句，且對已重建內容的記錄是假的。修法要先決定 reason 的粒度規格 | 10 |
| **`cond.migraine` / `cond.tension_headache` 的 `category`（F-24）** | 兩筆都標 `pain_msk`，而 `epilepsy`／`menieres`／`trigeminal_neuralgia` 標 `neuro`。可能是刻意也可能是漏，**Ting 決定** | 11 |

### 未做（明確聲明）

- 沒有讀第 62–92 筆全細節記錄（餘 31 筆，含 `cond.pcos` · `cond.myocardial_infarction` ·
  `cond.pulmonary_embolism` 等；其中**尚有 5 筆樣板治療區塊**未點名）。
- 沒有查證每一條 red flag 的臨床正確性到原始文獻層級 —— 只查了**內部一致性**
  （中英是否一致、`source` 是否可回溯、`urgency_level` 是否與同卡其他條目自洽）。
- 沒有跑 `validate-condition-standard.js`：本次是純閱讀審查，
  且派工單指定驗證條件為「`git diff` 只有這一個新檔」。
- 方名存在性只對照 `data/herbs/formulas.json` 的 224 筆中文名與別名；
  「查無」意思是**本庫未建卡**，不等於該方在中醫文獻中不存在
  （`精氣神源`／`鼻良湯`／`丹梔逍遙散(轉址)` 三者另有正文論證，不只是「未建卡」）。

---

*本檔為 findings ledger。`data/**` 未修改，未 push。*

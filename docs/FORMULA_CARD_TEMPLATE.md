# 方劑卡樣板規範

**Status: DRAFT — 待 Ting 定案。** 與中藥卡(`docs/HERB_CARD_TEMPLATE.md`)、
穴位卡(`docs/ACUPOINT_CARD_TEMPLATE.md`)**同一套邏輯**,只是欄位不同。
機器檢查:`node scripts/validate-formula-standard.js`(F1–F9,`--worklist` 出清單)。

三張卡的關係:**中藥是零件、穴位是零件,方劑是組裝**。
所以方劑卡最核心的一區不是「功效」,而是**君臣佐使** —— 那是「為什麼這樣配」,
跟穴位卡的「配穴機理」是同一個東西。

---

## 0. 最高原則:**只加深,不刪除**

與另外兩張卡相同。既有的 173 方內容大多來自 CloudTCM,**有價值**,
問題是**放錯層、沒有結構、缺英文**。

| 動作 | 可不可以 |
|---|---|
| 把組成從 `pattern_indications_zh` 搬回 `composition` | ✅(現在真的有一方是這樣) |
| 把整段散文的 `actions_zh` 拆成逐條 | ✅ |
| 補上君臣佐使 | ✅ |
| **刪掉加減、方義、現代疾病、藥理、比較群組** | ❌ |
| 用短版覆蓋既有長版 | ❌ |

**唯一的例外**:內容明確錯置,或**亂碼**(見 §3 F9)。修正要在 commit 說明。

---

## 1. 卡片區塊(照這個順序)

| # | 區塊 | 來源欄位 | 必要性 |
|---|---|---|---|
| 1 | 標頭:方名 · 拼音 · 英文 · **出典** · ★考試星號 | `name_zh` `pinyin` `name_en` `source_classic` `exam_star` | 必 |
| 2 | 速覽格:分類 / 劑型 / 考試層級 / 比較群組 | `category` `tier` `comparison_group` | 必 |
| 3 | **💡 考試重點** | `exam_importance` `exam_pearl` | 必 |
| 4 | **組成與君臣佐使**(表格:角色 · 藥名 · 劑量 · 該藥在此方的作用) | `composition[]` | **必 —— 這是方劑卡的核心** |
| 5 | **功效**(中英逐條成對) | `actions_zh` + `actions_en` | 必 |
| 6 | **主治證候**(中英逐條成對) | `pattern_indications_zh` + `_en` | 必 |
| 7 | **辨證要點**(舌 · 脈 · 主症) | `syndromes_zh` `symptoms_zh` | 必 |
| 8 | **方義**(為什麼這樣配 —— 對應穴位卡的「配穴機理」) | `chinese_depth_track.fang_yi_zh` | 必 |
| 9 | **加減變化**(基礎方 → 加什麼 / 減什麼 → 治什麼) | `modifications_zh` `modifications_en` | 必 |
| 10 | **類方鑑別**(同群組互比) | `comparison_group` `related_formulas` | 必 |
| 11 | 現代應用疾病 | `modern_diseases_zh` `modern_clinical_use_tags` | 有就填 |
| 12 | 現代藥理 | `pharmacology_zh` | 有就填 |
| 13 | ⚠️ 注意事項與禁忌 | `contraindications_zh/en` `cautions_zh` `safety_flags` | 必 |
| 14 | 連結:單味藥 · 病證 · 證候 | `composition[].herb_id` `related_conditions` `tcm_pattern_ids` | 必(可留空待補) |
| 15 | 參考來源 | `field_sources` `sources` | 必 |

---

## 2. 四層分工(與另外兩張卡一致)

| 層 | 欄位 | 內容 | 長度 |
|---|---|---|---|
| 內容(英) | `actions_en` `pattern_indications_en` `modifications_en` | 課件原文,照抄不改寫 | 可長 |
| 內容(中) | `actions_zh` `pattern_indications_zh` `modifications_zh` | 結構化中文 | 可長 |
| **標籤** | `modern_clinical_use_tags` `study_tags` | 短標籤,搜尋與 chip | 2–6 字 |
| 身分 | `category` `tier` `comparison_group` `source_classic` | 分類與出典 | — |

**君臣佐使不是標籤也不是功效**,它是 `composition[].role_zh`,獨立一層。

---

## 3. 硬規則(validator 會擋)

| 規則 | 內容 |
|---|---|
| **F1** | `id` / `name_zh` / `pinyin` 必填 |
| **F2** | `id` 不可重複 |
| **F3** | 已整理的方:`_zh` 欄位有內容就必須有中文 |
| **F4** | 已整理的方:`_en` 陣列長度必須等於 `_zh`,**不確定就整個留空,絕不錯位** |
| **F5** | 已整理的方不可缺 `_en` |
| **F6** | 已整理的方:`composition` **每一味都要有 `herb_zh`** |
| **F7** | 已整理的方:`composition` **必須有君臣佐使**(至少一個 `role_zh`),且君藥只能有 1–2 味 |
| **F8** | 已整理的方:`actions_zh` **上限 8 條**(目標 3–5)。沒有下限 —— 來源只給一條就一條 |
| **F9** | **完全損毀的亂碼一律擋**(不分是否已整理)—— 爛掉的字不該出現在卡片上。**部分缺字但仍可讀**的只列 worklist,§0 不刪可讀內容 |

**為什麼 F3/F4/F6 只擋已整理的方**:匯入的英文常常是 2 條摘要對上 50 條
CloudTCM 全文,本來就不是要逐條配對的。對 58 個沒人整理過的方報錯只會讓
整面驗證牆掛掉。**一旦有人整理這張卡,逐條對齊就是硬合約。**

**「已整理」的定義**是 `field_sources.actions_zh` 存在,不是「有任何 field_sources」。
⚠️ 這一條是踩過兩次的坑:中藥卡用寬鬆定義爆出 755 個錯,穴位卡爆出 236 個。
**加來源標註 ≠ 有人照模板整理過。**

`review_status` AI 只能寫 `"draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

---

## 4. 來源優先序

**先框架、再內容**,與另外兩張卡相同。

| # | 來源 | 它決定什麼 | 進哪一欄 |
|---|---|---|---|
| **0** | **NCBAHM CH 考綱**(`curriculum/board/NCBAHM_CH_…pdf`) | **框架** —— 哪些方要做、`exam_importance` | `exam_importance` |
| **1** | **`curriculum/formulas/Formulations Summary Chart`** | **結構主幹** —— 君臣佐使、劑量、加減、actions、indications、舌脈 | `composition` `actions_en` `pattern_indications_en` `modifications_en` |
| **1** | `curriculum/formulas/Herbal Formulations Comprehensive` | 同上的深度版 | 補上面各欄 |
| **2** | `curriculum/formulas/臺灣中藥典第四版英文版` | 官方中英對照、劑量 | `name_en` `composition[].dose_range` |
| **3** | **CloudTCM**(115 方已有直連) | 中文深度:方義、現代疾病、藥理 | `chinese_depth_track` `modern_diseases_zh` `pharmacology_zh` |
| **4** | 順天堂濃縮顆粒對照 | 科學中藥劑量 | `composition[].granule_reference_g` |

⚠️ **CloudTCM 目前這個環境讀不到(gateway 403)**。既有內容是先前抓好的,照樣可用;
但**不准假裝現在查過**。要新增內容只能從 `curriculum/` 來。

---

## 5. Formulations Summary Chart 怎麼讀

它是**表格**,不是散文,結構跟十四經課件一模一樣:

```
Ma Huang Tang [麻黄汤]   Chief     Ma Huang   M  9    Ma Huang Jia Zhu Tang [5]  ● Bai Zhu 12
(Ephedra Decoction) [4]  Deputy    Gui Zhi    G  6    [Body Aches ← Damp Cold]
[Shang Han Lun]          Assistant Xing Ren   X  9    Da Qing Long Tang [7]      ● Ma Huang → 18
                         Envoy     Zhi Gan Cao Z 3
Actions: Releases Exterior Cold & Arrests Wheezing
Indications: Tai Yang Shang Han (Wind Cold Exterior Excess (Shi))
[Fever & chills NO sweating  Floating, tight pulse]
```

一列 = 一個方,欄位是:**方名[出典] · 角色 · 藥 · 劑量 · 類方 · 加 · 減**。

**不要用眼睛讀 PDF** —— 跟穴位課件同樣的多欄陷阱(曾經把桂枝的禁忌抓到麻黃底下)。
寫一支 `scripts/parse-formula-curriculum.py`,沿用
`scripts/parse-channel-curriculum.py` 的遞迴 XY-cut 與座標配對。

⚠️ 這份 PDF 有 `(cid:0)` 字元(未嵌入的箭頭字形),解析時要當作「→」處理,不要當內文。

---

## 6. 目前資料現況(2026-07-27 實測)

173 方。**沒有任何一方有 `field_sources`** —— 逐欄來源標註完全是零。

| 缺口 | 數量 |
|---|---|
| 缺君臣佐使 | **115/173** ← 最大的洞,也是方劑卡最核心的一區 |
| 缺加減變化 | 150/173 |
| 缺 `actions_en` | 92/173 |
| 缺出典 `source_classic` | 79/173 |
| 缺禁忌 | 86/173 |
| ~~亂碼 `????`~~ | ~~44/173~~ → **已清 0/173**(`scripts/clean-formula-mojibake.js`);另有 **34 方部分缺字仍可讀**,保留待人工修 |
| 中英未對齊 | actions 21 · pattern_indications 22 |

已經有的:CloudTCM 直連 115、比較群組 115、現代疾病 97、組成 152、劑量 94。

### 建議批次順序

跟穴位一樣一批一批做,先小批驗收:

1. **辛溫解表 8 方**(麻黃湯、桂枝湯、小青龍湯…)—— Summary Chart 第一章,對照最完整
2. 辛涼解表 → 瀉下 → 和解 → 清熱
3. 補益劑(課件有專門一份 `Formulas That Tonify 补益剂`)

~~先修 F9 亂碼~~ —— 已完成:`scripts/clean-formula-mojibake.js` 清掉 94 處
完全損毀的字串(涉及 23 方),保留 34 方的部分缺字(像「煎服���與藥後護理」,
只丟一兩個字、其餘可讀)給人工對照課件修。

---

## 7. 與另外兩張卡的連接

- `composition[].herb_zh` → 中藥卡(單味藥頁)
- `syndromes_zh` → `data/config/tcm_pattern_canon.json` 的 `pat.*`
  (**25 個方證已經帶 `formula_id` 指回方劑**,見證候 canon 的 `kind` 欄)
- `modern_diseases_zh` → `data/pathology/condition_canon_shortlist.json` 的 `cond.*`
- 穴位卡的 `tcm_pattern_ids` 與方劑走**同一套證候詞彙**,所以
  「這個證候用哪些穴、哪些方」是可以一起查的 —— 這是 §6.5 連接層的目的。

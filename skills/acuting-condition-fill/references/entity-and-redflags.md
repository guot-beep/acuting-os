# 兩個最容易做錯的判斷:entity_type 與 red flags

讀這份之前先讀 `docs/CONDITION_CARD_TEMPLATE.md`。這裡只講**判準**,不重複欄位表。

---

## 1. C3 — `entity_type`(**2026-08-06 已由 D11 + 機械腳本解決,此節降級為背景**)

> **不用再逐筆判了。** D11 定案「命名空間就是型別」:`cond.*` →
> `biomedical_condition`、`tdis.*` → `tcm_disease`,150 筆已由
> `scripts/fix-condition-pattern-mechanical.js` 批次填完,validator C3 檢查一致性。
> 以下判準只在**一種情況**還需要:你發現某筆 `cond.*` 其實是中醫病名或症狀
> —— 那不是改 `entity_type`,是**回報給 Ting**(它可能該搬家到 `tdis.*`,
> 而搬家是 D1 級的事,不是你做)。

### 原判準(背景保留)

只有兩個值:`biomedical_condition` · `tcm_disease`。

### 判準

問一個問題:**這個名稱是在哪一套診斷體系裡被定義出來的?**

| 值 | 判準 | 例 |
|---|---|---|
| `biomedical_condition` | 有西醫的診斷標準、檢驗/影像依據、ICD 編碼體系裡的位置 | 多囊性卵巢症候群 · 子宮內膜異位症 · 偏頭痛 · 甲狀腺低下 · 纖維肌痛症 |
| `tcm_disease` | 中醫典籍裡的病名,以症狀群定義,底下再分證型 | 痛經 · 不寐 · 眩暈 · 頭痛 · 淋證 · 痿證 |

### 三個容易混的情況

**① 同一個中文詞兩邊都用**
「高血壓」是西醫病名;「眩暈」是中醫病名。課件標題寫「Hypertension 高血壓」
不代表它是中醫病名 —— 看的是**定義來源**,不是有沒有中文。

**② 症狀 vs 病名**
「疲勞」是症狀,不是病名。若某筆記錄其實是症狀,**不要硬塞一個 entity_type**
—— 在 handoff 裡列出來,讓 Ting 決定是否移到症狀層。**寧可回報,不要猜。**

**③ 西醫病名但這個 repo 用中醫框架寫**
`entity_type` 標的是**這個實體本身是什麼**,不是我們怎麼寫它。
PCOS 就是 `biomedical_condition`,即使它的卡片上主要放證型。

### 現況提示

150 筆的 `category` 已經分好 12 類(`gyn_fertility` / `pain_msk` / `gi` /
`psych_sleep` / `respiratory` / `neuro` / `derm` / `endo_metabolic` / `cardio` /
`uro_renal` / `ent_eye` / `immune_misc`)。這些 category 名稱是**西醫系統別**,
所以絕大多數會是 `biomedical_condition` —— 但**不要用 category 自動推導**,
逐筆看名稱。中醫病名(痛經、不寐、淋證)散在裡面。

---

## 2. C4 — red flags 怎麼補(95 筆完全沒有)

**這是整個病症層最危險的欄位,也是最容易被虛構的欄位。**

一張沒有 red flags 的病症卡,等於沒有告訴讀者「什麼時候該停手轉診」。
而一張**編造** red flags 的卡片比空白更糟 —— 它會讓 Ting 在診所裡對一個
不存在的門檻產生信心。

### 結構(五欄,不要寫成散文)

```yaml
red_flags_zh:
  - finding: 雷鳴樣頭痛(數秒內達最痛)
    urgency_level: emergency
    recommended_action: 立即急診,不要治療
    rationale: 蜘蛛膜下腔出血的典型表現
    source: <確切出處>
```

`urgency_level` 只有五個值,不要發明新的:

```
emergency    立即急診
same_day     當日轉診
urgent       數日內轉診
routine      常規轉診
monitor      追蹤觀察
```

`red_flags_en` 要成對且**逐項對齊**(索引對齊原則:寧可整個留空,不要半套錯位)。

### 來源順序

1. **`curriculum/conditions/`** —— Ting 的課件常常直接有 red flag 段落
   (`Charting Normal PE.docx`、各科 handout)。這是第一選擇,而且是她考試會考的版本。
2. 該病症的**西醫臨床指引**(有確切連結才用)。
3. American Dragon / CloudTCM —— 中醫來源的紅旗通常較弱,拿到也要標明來源層級。

### 找不到怎麼辦

**不要留空,也不要編。** 寫成明確的來源缺口:

```yaml
red_flags_zh: []
red_flags_source_gap_zh: "已查課件(<檔名>)、American Dragon、CloudTCM,
  三者均無此病症的紅旗/轉診條目。查詢日期 2026-08-XX。待 Ting 從西醫科目補。"
```

這樣驗證器仍會記為 C4(它應該記),但**下一個人不會重複查一次**,
而且 Ting 看得到這是「查過沒有」而不是「沒查」。

### 絕對不可以做的四件事

1. **不要從別的病症搬紅旗過來。** 頭痛的紅旗不是暈眩的紅旗。
   (經外奇穴那批就發生過:扁桃體卡差點被移植其他經穴的主治。)
2. **不要把「禁忌」當成「紅旗」。** 禁忌是「這個治療不能用」,
   紅旗是「這個病人現在要離開你去別的地方」。兩件事。
3. **不要給數字**(血壓幾多、Hb 幾多、幾天)除非來源上有那個數字,並附上來源。
4. **不要用「若症狀持續請就醫」這種句子。** 200 筆共用一句話不是內容,
   是骨架穿了內容的衣服,而且它會毀掉覆蓋率量測 —— 比留空更糟,因為留空至少誠實。

---

## 3. 順手要做的事:`domain` 標籤

`docs/EXTERNAL_REVIEW_2026-08-02.md` A2 定的橫切專科詞彙(DECISIONS D8:
specialty 是 tag,不是容器)。填 red flags 時順手標:

```
pain_msk · healthy_aging · womens_health · neuro_rehab
gyn_fertility · sports · cosmetic · oncology_support
```

多選。一筆記錄可以同時是 `womens_health` + `gyn_fertility`。
**不要為此新建資料夾或分類容器** —— 它就是一個陣列欄位。

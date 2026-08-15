# 收集請求 B2:疼痛/肌骨 11 張條件卡的針灸處方(給 SOL)

**背景**:這 11 張卡的 `acupoint_protocols` 原本是全庫 67 張逐字相同的匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12),已搬進 `import_artifacts` 並清空。
規格與 `GYN_PROTOCOL_COLLECTION_REQUEST.md` 相同,以下只列**這一批的差異**。

**這批是診間最高頻,也是針灸實證最強的一塊** —— 所以標準要更嚴,不是更鬆。

---

## 要收集的 11 張

| id | 中文 | ICD hint |
|---|---|---|
| `cond.acute_lumbar_sprain` | 急性腰扭傷 | S39.012 |
| `cond.neck_pain_stiff` | 急性頸痛／落枕 | M54.2 |
| `cond.whiplash` | 揮鞭式頸部損傷 | S13.4 |
| `cond.rotator_cuff` | 旋轉肌袖肌腱病變 | M75.1 |
| `cond.lateral_epicondylitis` | 網球肘 | M77.1 |
| `cond.medial_epicondylitis` | 高爾夫球肘 | M77.0 |
| `cond.carpal_tunnel` | 腕隧道症候群 | G56.0 |
| `cond.meniscus_injury` | 半月板損傷 | S83.2 |
| `cond.achilles_tendinopathy` | 阿基里斯腱病變 | M76.6 |
| `cond.hip_osteoarthritis` | 髖骨關節炎 | M16 |
| `cond.piriformis_syndrome` | 梨狀肌症候群 | G57.0 |

---

## 這 11 張**已經有**的東西 —— 不要重寫

每一張都已具備:`acupuncture_scope_zh`(can_treat / precautions / co_management)、
`red_flags_zh`(各 3 條)。這些是既有內容,**本次不要覆蓋**。

例(`cond.carpal_tunnel`):
> can_treat:可作為輕度至中度症狀(未達持續肌萎縮或明顯運動功能缺損)之輔助照護…
> precautions:治療前確認是否已有大魚際肌萎縮…避免延誤神經傳導檢查與手術評估
> red flag:進行性大魚際肌萎縮或持續麻木 → 需神經傳導檢查與轉介,考慮手術減壓

**本次只要處方層**:`points`、`point_rationale_zh/_en`、`sources`、
`evidence_note_zh`、`condition_specific_cautions_zh`。
若你找到的資料與既有 scope 衝突,**不要自行改 scope**,請在回傳裡另開
`scope_conflict_note` 說明衝突點,由 Ting 裁決。

---

## 額外要收集的兩個欄位(這批專屬)

```json
"comparator": "sham | usual care | no treatment | active control(寫出對照組是什麼)",
"modality": "manual acupuncture | electroacupuncture | dry needling | 其他"
```

理由見下方陷阱 1 與 2。

---

## 這一批的六個陷阱

### 1. **乾針(dry needling)不是針灸** ⚠️ 最重要

肌骨疼痛的「針」相關文獻有很大一部分是**激痛點乾針**試驗 —— 那是不同的介入、
不同的理論基礎、在許多轄區是不同的執業範圍。
**把乾針的證據寫成針灸的證據,就是張冠李戴**,與本專案先前踩到的
「引用一份排除了該病的回顧」同一類錯誤。

每一筆來源都要填 `modality`。若某張卡只找得到乾針證據,請照實說 ——
那本身就是有用的結論(「針灸專屬證據不足,現有證據來自乾針」)。

### 2. **對照組決定了那個數字的意思**

肌骨疼痛領域,「針灸 vs 假針」與「針灸 vs 常規照護」的效果量差很多。
只寫「有效」而不寫對照組,等於沒有資訊。每筆來源都要填 `comparator`。

### 3. **11 張會自然收斂到「局部＋阿是穴」—— 那是另一種樣板**

這正是這批最大的風險:11 張都回「阿是穴＋鄰近經穴」,實質上等於把
剛清掉的樣板換個包裝送回來。**請說明每一張的取穴依據為何不同**:
受累結構(肌腱/滑囊/神經)、經絡循行、動作測試陽性點、急性 vs 慢性。

回傳後會**逐病比對**;高度雷同會被退回。

### 4. **阿是穴沒有代碼**

若處方核心是阿是穴,請用 `"code": "ASHI"` 並在 `role_zh` 說明定位方式
(哪一條肌肉、哪個動作誘發、如何確認),不要硬塞一個不相稱的標準穴號。
代碼對不上本庫 947 穴會被驗證器擋下。

### 5. **結構性損傷:先問「這張卡該不該有處方」**

`meniscus_injury`、`rotator_cuff`:撕裂需要影像與骨科評估,針灸是症狀輔助。
若來源只支持「保守期或術後的疼痛輔助」,請照實寫成那樣,
**不要寫成治療撕裂**。這兩張回傳 `points: []` 加一段說明,是完全可接受的結果。

### 6. **既有卡片的「查不到系統性回顧」不可信,請重查**

這 11 張的 `scope.note` 目前多半寫著「尚未於本次查證中確認…系統性回顧來源」。
**這種說法在本專案已經被推翻過一次**:胎位不正卡寫著查不到艾灸轉胎位的
系統性回顧,而 Cochrane CD003928 自 2005 年就存在、2023 年更新。

所以請把這 11 張當成**沒有前次結論**重新查。若確實不存在,請明說
「已檢索 X、Y、Z 資料庫,未找到」,並列出檢索過的來源 —— 那與「沒查到」不同。

---

## 交付

一個 JSON 檔,11 個物件,逐病分開。
**留空是合格結果**:11 張回來 4 張有處方、4 張只有乾針證據、3 張證據不足,
是誠實的結果。憑空生出 11 份配穴才是失敗。

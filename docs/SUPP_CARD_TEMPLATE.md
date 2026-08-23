# SUPP 卡模板 — `supp.*` 補充劑(v1,2026-08-11)

**驗證器:`scripts/validate-supp-standard.js`(待建——本模板先行,D14 順序:
詞彙表 ✅(supplement_category_vocabulary.json)→ 模板(本文件)→ 驗證器 → 記錄)**

姊妹文件:藥理六層 `docs/PHARM_CARD_TEMPLATE.md`(supp 與 drug 是**平行命名空間**,
D17 §1:分開,但同一 Pharmacology workspace 顯示)。命名空間拼法鎖定 `supp.*`
(D17——不是 suppl.*,不是 supplement.*)。

---

## §0 邊界(先讀這個)

| 不是 | 差別 | 去哪 |
|---|---|---|
| **不是 drug.***| 補充劑無處方藥的監管審批軸;但可與藥物交互——交互以「審閱旗標」記錄 | `drug.*` |
| **不是 herb.***| 中藥飲片/顆粒走 herb 線(含性味歸經);同一物質的「西式萃取物產品」(如 curcumin、ginkgo extract)才走 supp | `herb.*` |
| **不是臨床建議** | 卡片記「常見劑量範圍 + 來源」,不是給病人的劑量指示 | — |

**herb/supp 同源物質規則**:薑黃(herb.jiang_huang)與 curcumin(supp.curcumin)
是兩個實體,互相 `related_herb_id`/`related_supp_id` 連結(D13 單側儲存:存在
supp 側),絕不合併。

## §1 記錄形狀(骨架層;skeleton-first,D17/簡報 §2)

```json
{
  "id": "supp.magnesium",
  "name_zh": "鎂",
  "name_en": "Magnesium",
  "aliases": ["magnesium glycinate", "magnesium citrate"],
  "category": "minerals",
  "maturity": "skeleton",
  "common_forms_en": ["glycinate", "citrate", "oxide"],
  "typical_dose_range_en": "200-400 mg/day elemental",
  "dose_source": {"name": "NIH ODS", "url": "https://ods.od.nih.gov/..."},
  "key_safety_notes": [
    {"note_en": "High doses cause diarrhea; caution in renal impairment",
     "interaction_flags": ["bisphosphonates", "certain antibiotics (absorption)"],
     "source": {"name": "NIH ODS", "url": "..."}}
  ],
  "evidence_snapshot_en": "…1-2 句主要實證用途…",
  "evidence_source": {"name": "...", "url": "..."},
  "related_herb_id": null,
  "related_drugclass_review_flags": [],
  "sources": [],
  "review_status": "skeleton_unreviewed"
}
```

規則:
1. **maturity**:`skeleton | core | clinical_ready`——骨架層只求 id/雙語名/分類/
   劑型/劑量範圍/安全旗標/實證快照,各欄有來源;深度等臨床需求訊號(簡報 §2)。
   三級判定條件(2026-08-11 Ting 授權制定,依長期追蹤/病人衛教/herb
   interaction 三需求設計;逐項可機器檢查,升級時在 ledger 記據):
   - **skeleton**:如上。dose 可 null(來源不支持就誠實留空)。
   - **core**(可用於臨床追蹤與 chip 選):skeleton 全項 + ①
     `typical_dose_range_en` 非 null 且 `dose_source.url` 為驗證過的活連結
     (記 `verified` 日期);② `interaction_focus` 三大類(anticoagulant/
     immunosuppressant/thyroid)每格有明確 status(`insufficient_data` 也算
     明確,樣板句不算);③ `key_safety_notes` 含停用/就醫警訊至少一條,
     有來源;④ `evidence_snapshot_en` 註明證據等級或試驗名(如 AREDS2)。
   - **clinical_ready**(可印給病人/進 CARE 草稿):core 全項 + ①
     `patient_education_zh`(病人語言的用途/劑量/何時停/何時就醫,雙語)
     ;② herb interaction:`related_herb_id` 已審(有對應 herb 卡則必填,
     無則 ledger 記「查無對應」);③ interaction_focus 的 `known_concern`
     格全部有 note_en 說明機轉或臨床做法;④ `review_status` 為人工複核
     值(非 `skeleton_unreviewed`)。
   - 降級:任何來源被發現失效/不支持宣稱 → 立即降回上一級並在 ledger 記
     原因(先例:supp.lutein 2026-08-11)。
2. **每個事實旁掛來源**;無來源的欄位誠實留空/null,不填樣板句。
3. **interaction_flags 是審閱旗標不是斷言**:特別標抗凝血(warfarin 類)、
   免疫抑制、甲狀腺藥;CR-009 的 supp→drugclass 關係種子屬 staging,經審閱
   才能落到 `related_drugclass_review_flags`。
4. **category** 必須是 supplement_category_vocabulary.json 八分類之一。
5. 檔案位置:`data/supplements/supplements.json`(單檔起步,`records[]`);
   build-data 以既有 vocab 同模式掛 `supplementRecords` 入 bundle。
6. D1/D6 照舊:id 一經發行永不改;退場用 `review_status: "deprecated"`。
7. **interaction_focus**(2026-08-11 追認,已入 canon 36/36):
   `{classes: {anticoagulant|immunosuppressant|thyroid: {status, staged_label,
   note_en}}, focus_note_en}`;status 詞彙 = `known_concern | possible_concern |
   component_dependent | no_specific_flag_in_source | insufficient_data`。
   `staged_label` 保留 staging 包原字串(正規化可逆)。這是審閱旗標層,
   不是臨床斷言(同規則 3)。
8. **patient_education_zh/en**(clinical_ready 需求,additive):病人語言
   的用途/劑量/何時停/何時就醫;無人工複核前留空,絕不由 AI 樣板生成。

## §2 資料來源優先序

NIH ODS > Examine.com > Natural Medicines Database > 藥典/官方單張 >
綜述論文。staging 研究包(SUPP_SKELETON_BATCH_01/02)可作起點,
但每筆落 canon 前逐欄對照其 source URL 是否真的支持該句。

## §3 Clinical 端如何引用

`case.agentExposures[].agentId = "supp.*"`(D17 §5 ledger)。卡片存在與否
不阻擋記錄(nameText fallback);卡片建成後 UI 自動可 chip 選。
**絕不從補充劑使用推論任何診斷/證型**(D17 §6)。

## R2 Evidence 慣例(2026-08-11,三年藍圖 R2,全線統一)

帶主張的欄位(劑量、安全、療效、機轉、紅旗)必掛 **per-field 來源錨點 +
擷取日期**(`field_sources` 或本線等價欄位;格式參照 pharm 線
`dailymed:<setid>#<SECTION>` 的可機器解析精神)。無來源的欄位誠實留空。
新產卡即遵守;舊卡不回溯強制,由各線驗證器與 ratchet 自然收斂。

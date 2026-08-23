# PHARM_ENRICH_LEDGER — 藥理層 40 筆單藥卡補齊紀錄

**日期**：2026-08-11 · **分支**：`codex/pharm-enrich-a`（基底 `0b9d28c`）
**規格**：`docs/PHARM_CARD_TEMPLATE.md` §0/§2 · `docs/AI_CONSTITUTION.md`
**驗證**：`node scripts/validate-pharm-standard.js` → PASS，阻擋問題 0

---

## 一、方法：轉錄,不是判斷

模板 §0 的原則是把判斷題變成轉錄題。這一批照做:

1. 依 `dailymed_api_responses.json` 逐筆取出 setid,直接抓 SPL XML
   （`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/<setid>.xml`,2026-08-11）。
2. 依 LOINC 區段碼切出 MECHANISM OF ACTION (43679-0)、CLINICAL PHARMACOLOGY (34090-1)、
   PHARMACODYNAMICS (43681-6)、INDICATIONS (34067-9)、CONTRAINDICATIONS (34070-3)、
   ADVERSE REACTIONS (34084-4) 等,只從實際抓到的文字轉錄。
3. **填充器拒絕覆蓋非空欄位** —— 既有內容一律保留,只填空欄位。
4. 每一欄配 `field_sources: ["dailymed:<setid>#<SECTION>"]`,setid 由記錄本身帶入,不手打。

**40 筆中有 39 筆的標籤成功抓取並逐段閱讀。** 唯一失敗的是 hydrochlorothiazide(見下）。

---

## 二、逐欄位數字 before → after（分母 40）

| 欄位 | before | after |
|---|---|---|
| `mechanism_en` / `mechanism_zh` | 31 | **39** |
| `indications_en` / `indications_zh` | 35 | **40** |
| `contraindications_en` / `contraindications_zh` | 36 | **39** |
| `adverse_effects_en` | 25 | **38** |
| `adverse_effects_zh` | 24 | **38** |
| `site_of_action_en` / `site_of_action_zh` | 1 | **36** |
| `physiologic_effect_en` / `physiologic_effect_zh` | 1 | **38** |

一行重現:`node scripts/validate-pharm-standard.js` + 資料census（見 commit 訊息）。
`warnings_*`(24/23)與 `boxed_warning_en`(13)這一批未動。

寫入欄位總數:batch1 92 + batch2 47 + batch3 46 + batch4 18 = **203 個欄位值**。

---

## 三、來源缺口 —— 刻意留空的 4 筆（留空是答案,不是漏做）

### 1. `drug.mannitol` —— ⚠️ 來源不對藥（最嚴重的一筆）

記錄的 setid `5b44e248-4b7b-4777-954a-921c7b309944` 抓下來是
**Sorbitol-Mannitol 泌尿科灌洗液**,標籤明文寫著:

> `NOT FOR INJECTION BY USUAL PARENTERAL ROUTES.` / `FOR UROLOGIC IRRIGATION ONLY.`

其 CONTRAINDICATIONS 只有兩句(不可注射、無尿禁用),ADVERSE REACTIONS 講的是
灌洗液被血管吸收後的反應。這與本卡要教的**靜脈滲透性利尿劑**(腦水腫、降眼壓)
不是同一個臨床角色,而且成分含 sorbitol。

**因此本批不從該標籤填 `contraindications` 與 `adverse_effects`** ——
填了等於把灌洗液的安全資訊掛到靜脈用藥上,診所裡會被相信。
`validate-pharm-standard` 的成分比對之所以放行,是因為 `verifyStrictIngredientMatch`
只要求 active_ingredient 含 `mannitol`,而 `sorbitol` 不在 `forbiddenExtra` 清單裡。

**需要 Ting 指定一筆靜脈用 mannitol 的 setid 才能續填。**

### 2. `drug.aspirin` —— OTC Drug Facts 標籤,沒有機轉也沒有不良反應區段

setid `ac94cce3-…` 是 81 mg OTC 標籤。實際區段只有
`Do not use (50570-1)` / `WARNINGS` / `INDICATIONS` / `DOSAGE`。
沒有 CONTRAINDICATIONS、沒有 ADVERSE REACTIONS、沒有 BOXED WARNING、沒有 MOA。

故 `mechanism_*`、`adverse_effects_*`、`site_of_action_*`、`physiologic_effect_*` 留空。
需要一張處方藥標籤或另一具名來源。

### 3. `drug.carbamazepine` —— `site_of_action_*` 留空

標籤 MECHANISM OF ACTION 最後一句是 `The mechanism of action remains unknown.`,
全段沒有指名任何分子標的。憲法紅線 9(不把不確定寫成確定)。
`physiologic_effect_*` 有填,寫的是標籤實際描述的動物模式觀察,並保留「機轉未明」這句。

### 4. `drug.prednisone` —— `site_of_action_*` 留空

該標籤沒有獨立的 CLINICAL PHARMACOLOGY 區段（其藥理文字內嵌在 DESCRIPTION 裡,
故 `physiologic_effect_en` 的來源標為 `#DESCRIPTION`）。文字只說糖皮質素造成廣泛代謝
影響並改變免疫反應,**沒有指名糖皮質素受體**,故不填作用部位。

### 5. 標籤本身就說「機轉未明」而被原文保留的（有填,但保留 hedge）

| 藥 | 標籤原話 |
|---|---|
| `gabapentin` | 機轉未明;α2δ 次單元的高親和結合「與治療效果的關聯未知」 |
| `phenytoin` | 「thought to involve」電壓依賴性鈉通道阻斷 |
| `prazosin` | 降壓作用的確切機轉未知 |
| `propranolol` | 降壓機轉尚未確立 |
| `phenelzine` | 不確定臨床效果來自 MAO 抑制本身或其他作用 |
| `hydrochlorothiazide` | thiazide 降壓機轉未明 |
| `semaglutide` | 腎臟風險下降的機轉尚未確立 |
| `carbamazepine` | 機轉未明 |

這 8 筆的 `physiologic_effect_zh` 都把標籤的保留語氣一起翻出來,沒有替標籤把話講滿。

---

## 四、來源修正（已改,需 Ting 追認）

### 4.1 `drug.hydrochlorothiazide` 的 setid 已失效 → 換新

舊 setid `b7c9e05f-bc2d-4537-b452-fbcbb9f984a9` 的 SPL XML 端點 **回應 HTTP 404**。
（drugs.json 裡它的 `dailymed_url` 也與其他 39 筆不同,用的是 `lookup.cfm` 而非 `drugInfo.cfm`。）

以 DailyMed API 查 `drug_name=hydrochlorothiazide`,取**同一藥廠 (REMEDYREPACK INC.)**
的現行標籤 `31a3d1cb-0f52-4818-965d-7584374bb23e`（published 2026-08-07）,
抓 XML 確認活性成分只有 hydrochlorothiazide 一項,再據以填入禁忌與不良反應。

已同步更新 `dailymed_api_responses.json`、`dailymed_verified_labels_manifest.json`、
`drugs.json`,並在證據檔留下 `supersedes_setid` 與 `supersede_reason` 兩個欄位。
**該標籤無 BOXED WARNING 區段。**

### 4.2 `drug.aspirin` 的 `contraindications_en` 引用了不存在的區段

原 `field_sources.contraindications_en` 指向 `#CONTRAINDICATIONS`,
但這張 OTC 標籤沒有這個區段。已改指向實際存在的 `#DO_NOT_USE` 與 `#WARNINGS`,
並修正 `dailymed_api_responses.json` 裡 aspirin 的 `verified_sections`。
內容一個字都沒刪。

### 4.3 `drugclass.arbs` 缺 `prototype_drug_id`（單向連結）

`drug.losartan` 標了 `prototype_drug: true`,但 `drugclass.arbs` 是 33 個分類中
唯一沒有 `prototype_drug_id` 的。已補 `prototype_drug_id` 與
`representative_drug_ids` 為 `drug.losartan`,與其餘 32 個分類的慣例一致。

---

## 五、`dailymed_api_responses.json` 的區段清單與實際標籤不符（**未改,待 Ting 裁示**）

抓下 39 份 XML 後逐一比對「宣稱有的區段」vs「實際有的區段」,以下為宣稱有、實際沒有:

| 藥 | 宣稱有但標籤沒有 |
|---|---|
| `metoprolol` `spironolactone` `acetazolamide` `heparin` `amlodipine` `atorvastatin` `digoxin` `furosemide` | `BOXED_WARNING` |
| `albuterol` `prazosin` `propranolol` `clonidine` `disulfiram` `carbamazepine` `ethosuximide` `carbidopa_levodopa` `furosemide` `acetazolamide` | `USE_IN_SPECIFIC_POPULATIONS` |
| `prednisone` `atenolol` | `MECHANISM_OF_ACTION` |

**為什麼要在意**：`validate-pharm-standard.js` 的 P0 護欄是
「`boxed_warning_en` 有內容時,必須 `verified_sections` 含 `BOXED_WARNING`」。
清單多報,護欄對這 8 筆就是空的 —— 將來有人填一段編造的黑框警語,驗證器會放行。

**目前沒有造成實害**:這 8 筆的 `boxed_warning_en` 全部是空的（已逐筆確認）。

**沒有動手的理由**：修正驗證證據檔等於用我自己的抓取去覆寫別人的查證紀錄,
這正是 §0 想防的自我背書。aspirin 那一筆已改,是因為它有**現行的錯誤引用**
（活的缺陷),其餘是**潛在**的鬆動。請 Ting 裁示是否要我一次收緊。

---

## 六、分類/標的連結稽核（`drugclass_id` / `drugtarget_id` / `drugsystem_ids`）

驗證器統計:unresolved drug→class **0**、drug→target **0**、drug→system **0**、
class→target **0**、class→system **0**、reverse mismatch **0**、duplicate ids **0**。

人工再查三項:

1. **`drug.mannitol` 沒有 `drugtarget_id`** —— 其分類 `drugclass.osmotic_diuretics`
   也沒有。與模板 §5 表格一致（Mannitol 的標的欄就是「—」）。**不是錯誤,未改。**
2. **`drug.metoprolol` 的 `drugsystem_ids` 與三個同儕不一致** ——
   atenolol / propranolol / carvedilol 都是
   `[cardiovascular_renal, autonomic_nervous_system]`,只有 metoprolol 是
   `[cardiovascular_renal]`。看起來是漏標,但系統歸屬屬模板 §4 的「分層變更」= Ting 的權責,
   **未改,請裁示。**
3. **`representative_drug_ids` 未涵蓋全部成員**（arbs / beta1_selective_blockers /
   statins / nonselective_beta_blockers 各漏 1）—— 但這四類的慣例是只列 prototype,
   「representative」本來就不等於「窮舉」。**不是錯誤,未改。**

---

## 七、逐卡目視檢查

203 個寫入值全部人工過目,確認:
- `_zh` 沒有假中文、沒有機器回譯腔、沒有整段英文;縮寫沿用既有卡片慣例(`ACS`、`aPTT`、`NYHA`)。
- `_en`/`_zh` 陣列長度全部相等（驗證器 P5 亦為 0）。
- 沒有樣板句 —— 每一筆的機轉/生理效應都來自該藥自己的標籤,
  同分類的藥（如三個 P2Y12 抑制劑）措辭刻意不同,因為標籤本身就寫得不同
  （clopidogrel/prasugrel 不可逆、ticagrelor 可逆,且各自的起效與回復時間不同）。

另更新 14 筆已被本批填掉的 `gap_note_zh`,把已完成的子句換成「已於 2026-08-11 補入」,
保留仍為真的子句（交互作用、孕期、腎功能調整多數仍待補）。

---

## 八、給 Fable / Ting 的待決事項

1. **mannitol 需要一筆靜脈用標籤的 setid**（目前這筆是灌洗液,不能用）。
2. **aspirin 的 `contraindications` 第三項**「每日飲酒三杯以上」在標籤上屬於
   胃出血的**風險因子**,不是 `Do not use` 條目。要不要移到 `warnings`?
   （本批未動 —— 移動既有安全欄位內容超出「補空欄位」的範圍。）
3. **第五節的區段清單多報**要不要一次收緊。
4. **metoprolol 的 `drugsystem_ids`** 要不要補 `autonomic_nervous_system`。
5. `warnings_*`(24/40)、`boxed_warning_en`(13/40)、`pregnancy_lactation_*`、
   交互作用分級 —— 這幾類本批未做,是下一批的範圍。

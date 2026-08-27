# Implementation Gap Review — Task 10A–10D 決策審查

> **Review Date**: 2026-08-27
> **MEASURED TREE**: `origin/main` @ `96746c5f`（審查全程在此樹上實測；10A/10B/10C/10D 各自的 base SHA 見 §2）
> **ADDENDUM 1**: §4 G1 的「沙參」個案於 `origin/main` @ `b452eb39` 追加實測（來源：`frosty-yonath-0adbce-0b` session 回報，本審查逐項獨立複驗）
> **ADDENDUM 2（重要）**: 本報告初稿後，main 上出現 **D30**（`2f44501a`，2026-08-27）——**G2 已部分實作**。
> 於 `origin/main` @ `e388bcc3` 以負控實測重新定位殘餘缺口，**G2 由 `STILL_OPEN` 改判 `PARTIALLY_FIXED`**，
> 範圍大幅縮小但**仍為 P0**（負控證據見 §4 G2）。**本報告自身也是快照——引用前請先查 main 有沒有再動。**
> **Nature**: 決策審查（decision review）。**零生產程式碼變更、零正典資料變更、零新驗證器、零 schema 變更、零新 DECISIONS 條目。**
> **Core question**:「哪些 LOCKED 決策的實作缺口，真的會影響 Ting 9 月開始使用 AcuTing OS，而不是只是讓 repo 看起來不夠漂亮？」

---

## 1. Executive verdict

**四份稽核裡最響的幾個警報，今天多數已經不是問題了。真正該做工程的兩個缺口，兩份稽核都沒指到——它們在 app.js 的臨床輸入層，不在資料層。**

- **10A 的頭號數字（34 條 active→deprecated 引用）已經清乾淨**：今天實測 **0**，且有 `validate-retired-id-references.js` 在 CI 直接擋著。CLOSE。
- **10B 的 GAP-02（validate-relations 命名空間倒置）已在 `63301701` 修掉**。CLOSE。
- **10C 的破壞性 Merge 已在 R12（`707e3bf9`）修掉**，逐欄位合併，我逐行讀過程式碼確認。CLOSE——**但它沒有任何 CI 回歸測試**（見 G3）。
- **10D 的兩個結構性發現查無實據**：4 條 precedence chain 沒有任何一條在今天的畫面上藏住證據；`pattern_registry` 的「`source_type` 全 151 筆 DROPPED / `review_status` 37 筆 dropped」是**稽核腳本自己的方法瑕疵**，不是 bug（§5 有逐數字證明）。兩者都 CLOSE，而且**不該派工去「修」**——去修一個沒壞的 build，在 D25 剛把 pattern_registry 宣告為正本之後，是真的會弄壞資料的。

**真正開著的是這兩個，都在 9/05 之前咬人：**

1. **臨床輸入的 picker 沒有身分衛生**（G1）。今天 Ting 的病例/SOAP 下拉選單裡，**心腎不交、肝火上炎、肝風內動各出現兩次**——一次是 D16 已退役的 id，一次是正典 id，中文名一模一樣，只有英文譯名差一個字。西醫病名/中醫病名選單另外混進 12+6 筆 legacy namespace 記錄，其中 **9 筆與正典卡同名、3 筆連標籤都逐字相同**。這些欄位的文字框是 `hidden`，**picker 是唯一的鑄造路徑**——她選哪一個，哪一個 id 就永久寫進病歷。同一個病，一半記在 `cond.pcos`、一半記在 `western_condition.pcos`。<br>**這條缺口今天還在惡化**：08-27 南沙參獨立成卡之後，打「沙參」會跳出三列，第三列（唯一標籤為無修飾「沙參」的那列，也是開方時最自然的一點）是 D21 退役卡，畫面零標示；而它的重導只寫在散文裡，那段散文的立論當天就被推翻了。逐字證據見 §4 的 G1 附錄。
2. **臨床病例的 schema 白名單仍無守衛——D30 關了三個表面，漏掉第四個**（G2，**`PARTIALLY_FIXED`**）。
   `normalizeClinicalCase()` 是一個 **95 欄位的白名單建構器**，每次載入都跑、每次存檔都寫回。**白名單就是持久化 schema。**
   **D30（`2f44501a`，本報告初稿後落地）已經凍結三個表面**：`schema.sql`（29 表 / 356 欄）、匯出信封形狀、localStorage **key 名稱**。這是真的進展。
   **但那三個都是「檔案」，而真正寫入的是「程式碼」。** 負控實測：從 `normalizeClinicalCase` 刪掉 `allergyStatus` 一欄後，
   **D30 的新 gate 與另外四支臨床驗證器全部 exit 0**（§4 G2 有逐支輸出）。所以那條靜默刪除路徑**今天仍然開著**。
   好消息是工作量從「建一個 gate」縮成「替既有 gate 加第四個表面」。

兩個都不是「架構不夠漂亮」。第一個是**每一次看診都在發生的身分分裂**；第二個是**一次就不可回復的靜默資料刪除**。

**其餘全部進 P2 / WATCH / CLOSE。P0+P1 共 3 項（P0 = G1 + G2，P1 = G3），遠未用滿 5 項上限。**

> **2026-08-27 修訂（依 `AGENTS.md` 收斂，見 §7）**：初版把 G4（驗證器接線）排 P1，**已降為 P2**。
> 理由是 `AGENTS.md`「什麼時候停」明定到 9/5 的配比為**產品 75–80% / QA 20–25%**，
> 而 G4 是四項裡唯一**沒有使用者可見失敗**的純 QA 工作——按本報告自己的標準它勉強進 P1，
> 按配比規則就該讓位。**留在 P0/P1 的三項，每一項都有使用者可見失敗或硬日期。**

---

## 2. What changed since each audit

| 稽核 | Base SHA | 距今 | 關鍵變化 | 對稽核結論的影響 |
|---|---|---|---|---|
| **10A** Legacy Namespace / Retired ID | 2026-08-25 | 40+ commits | `D23`（08-26 LOCKED）裁定 legacy 診斷 id 歸位五桶；`3d25efd0`/`da06af0d` 執行懸空 id 重導；`validate-retired-id-references.js` 進 CI | **§4 的 34 條邊全數清零**（實測 0）。§3 的 154 筆 unresolved 大部分被 D23 裁定為「出處層保留，不遷移」，不再是未決架構債 |
| **10B** Validator Coverage Truth | `37cdbe67` (08-26) | 30+ commits | `63301701` 修掉 validate-relations 的命名空間倒置；D28/D29 新增（稽核的決策地圖只到 D27） | **GAP-02 CLOSE**。GAP-03/GAP-04 仍在，但**嚴重度需重新分級**（見 §5：13 支孤兒驗證器我全跑過，12 支綠燈） |
| **10C** Clinical Export Contract | `bcb8b7ae` (08-26) | Round 4 已納入 R12 | R12（`707e3bf9`）已在稽核 Round 4 內被實測確認 | Merge 破壞性 **CLOSE**。但稽核沒問的是「R12 有沒有守衛」——**答案是沒有**（G3） |
| **10D** Evidence / Provenance | `3ced3b32` (08-27) | 3 commits（皆未觸及相關檔） | `data/generated/knowledge_pat.js` 與 `pattern_registry.json` **自稽核 base 起零變動** | 因此「pattern_registry 欄位被 DROPPED」**不可能是後來修好的**——它從一開始就是量錯的（§5 有證明） |

### 2.1 本報告初稿之後 main 又動了（`96746c5f` → `e388bcc3`）

| commit | 內容 | 對本報告的影響 |
|---|---|---|
| **`2f44501a`** | **D30：D12 additive-only 從紀律變成閘門**。新 `scripts/validate-clinical-contract-freeze.js` 進 CI + 基準檔 `data/audits/clinical_contract_baseline.json`。凍結三表面：`schema.sql` 29 表/356 欄、匯出信封鍵與病例欄位型別、localStorage key 名稱（4 個） | **G2 `STILL_OPEN` → `PARTIALLY_FIXED`**。三個表面是真的關上了。**但 `normalizeClinicalCase`/`normalizeSoapNote` 的 179 個 key 不在其中**——負控實測仍可靜默刪欄（§4 G2） |
| `56fa6ca8` | D13 登記邊引用完整性 | 不影響本報告 |
| `e388bcc3` | D17 §5 保序契約進 CI | 不影響本報告 |

**這件事本身是本報告的方法教訓**：稽核是快照，**本報告也是**。D30 在初稿與定稿之間落地，
若不重新量測就會把一個已部分關閉的缺口當成全開來排序。引用本報告前請先查 main。

---

**方法註記**：本審查全部在 `origin/main @ 96746c5f` 的獨立 worktree 上實測，未動主 worktree 的 HEAD（多 session 共用）。審查期間 main 由 `1dc00cc4` 前進到 `96746c5f`（`herb.nan_sha_shen` 建卡 363→364、SOL 研究包落 staging），兩者皆不影響本報告任何數字。

---

## 3. Consolidated gap table

計分：`臨床/資料安全 ×5` + `日常工作流 ×4` + `違反 LOCKED 架構 ×4` + `長期維護/規模 ×3` + `證據信心 ×2` − `實作複雜度 ×2`（各項 0–5）。

| gap_id | 缺口 | 來源稽核 | 影響的 LOCKED 決策 | current_status | raw | bucket |
|---|---|---|---|---|---|---|
| **G1** | 臨床 picker 鑄造退役 id 與 legacy namespace id | 10A §3/§4 + 10B B/C（**兩份都只看到資料側，沒看到輸入側**） | D11 · D15 · D16 · D21 · D22 · D23 | `STILL_OPEN` | **75** | **P0** |
| **G2** | 病例 schema 白名單無守衛：**D30 關了 3 表面，`normalize*` 的 179 key 仍開** | 10C Q5/Q9 + 10B D12=PARTIAL | **D12**（2026-09-01） · **D30** · D17 | **`PARTIALLY_FIXED`**（D30 `2f44501a` 後重測） | **59** | **P0** |
| **G3** | R12 逐欄位 Merge 修復無 CI 回歸測試 | 10C Q8（稽核未問守衛） | D12 | `STILL_OPEN` | **57** | **P1** |
| **G4** | 12 支綠燈孤兒阻擋驗證器在 CI 外；NOTE tier 計數未進棘輪 | 10B GAP-03 + GAP-04 | D14 | `PARTIALLY_FIXED` | **33** | P2 ⟵ *初版排 P1，依 QA 配比降* |
| **G5** | 59/59 西藥卡的 DailyMed 官方標籤網址從不上畫面 | 10D §5A dark field | — | `STILL_OPEN` | **31** | P2 |
| **G6** | `case_count` 僅資訊性，信封無內部一致性檢查 | 10C Q10 | D12 | `STILL_OPEN` | **29** | P2 |
| **G7** | `validate-herb-canon` 紅燈（5825 筆內容 backlog） | 10B GAP-03 | — | `STILL_OPEN` | **21** | P2 |
| **G8** | D11 legacy 診斷 namespace 仍存在於 staging 檔 | 10A §3（154 筆） | D11 | `SUPERSEDED_BY_LATER_DECISION`（D23 明文保留） | — | WATCH |
| **G9** | 其餘 7 個 dark evidence 欄位 | 10D §5A | — | `STILL_OPEN`（無使用者影響） | — | WATCH |
| **G10** | 34 條 active→deprecated 引用 | 10A §4 | D16 · D21 · D22 | `FIXED_AFTER_AUDIT` | — | CLOSE |
| **G11** | GAP-02 validate-relations 命名空間倒置 | 10B GAP-02 | D11 · D15 | `FIXED_AFTER_AUDIT` (`63301701`) | — | CLOSE |
| **G12** | 同 ID 部分欄位 Merge 破壞性覆寫 | 10C Q8 | D12 | `FIXED_AFTER_AUDIT` (R12 `707e3bf9`) | — | CLOSE |
| **G13** | 4 條 precedence chain 遮蔽證據來源 | 10D §7 | D13 | **查無實據（refuted）** | — | CLOSE |
| **G14** | `pattern_registry` `source_type` 全數 DROPPED / `review_status` 37 筆 dropped | 10D §8 | D25 | **稽核方法瑕疵（false positive）** | — | CLOSE |
| **G15** | `review_status` vs `source_status` 語意重疊 | 10D §4 | — | `CLEARLY_DISTINCT`（不同軸，已有 vocab 驗證器在 CI） | — | CLOSE |

---

## 4. P0 / P1 — 逐項

### 🔴 G1 · 臨床 picker 鑄造退役 id 與 legacy namespace id — **P0**

**current-main evidence**（全部可一行重現，MEASURED TREE `96746c5f`）

`app.js` 的六個 picker 都沒有 `review_status === "deprecated"` 過濾，其中三個還主動 union 進 legacy staging 記錄：

| Picker | 來源 | 髒資料 |
|---|---|---|
| `patternPickerOptions` (app.js:8880) | `patternLibrary`（154） | **3 筆 deprecated** 全部上架 |
| `westernConditionPickerOptions` (app.js:8916) | `conditionCanon`（508）**∪ `conditions.records`（12 筆 `western_condition.*`）** | 12 筆 legacy 全上架，**4 筆與正典卡同名** |
| `easternDiseasePickerOptions` (app.js:8892) | `tdisRegistry`（160）**∪ `conditions.eastern_diseases`（6 筆 `eastern_disease.*`）** | 6 筆全上架，**5 筆與正典卡同名** |
| `herbPickerOptions` (app.js:8594) | `herbs`（364） | **4 筆 deprecated**（含 D21 的 `herb.sha_shen` 沙參） |
| `formulaPickerOptions` (app.js:8582) | `formulas`（223） | **4 筆 deprecated**（含 D22 的 `formula.bai_du_san` 敗毒散） |

**Ting 螢幕上實際看到的（逐字，label = `name_zh · name_en`）**：

```
心腎不交 · Heart and Kidney Disharmony      → pattern.insomnia_heart_kidney_disharmony   [DEPRECATED D16]
心腎不交 · Heart-Kidney Not Communicating   → pattern.heart_kidney_not_communicating     [正典]
肝火上炎 · Liver Fire Flaring Upward        → pattern.liver_fire_flaring                 [DEPRECATED D16]
肝火上炎 · Liver Fire Flaming Upward        → pattern.liver_fire                          [正典]
肝風內動 · Liver Wind Stirring Internally   → pattern.liver_wind_stirring                [DEPRECATED D16]
肝風內動 · Internal Liver Wind              → pattern.liver_wind                          [正典]

無排卵 · Anovulation                        → western_condition.anovulation  ／ cond.anovulation   ← 兩列逐字相同
卵巢儲備功能下降 · Diminished Ovarian Reserve → western_condition.diminished_ovarian_reserve ／ cond.…  ← 兩列逐字相同
月經不調 · Yue Jing Bu Tiao                 → eastern_disease.irregular_menstruation ／ tdis.yue_jing_bu_tiao ← 兩列逐字相同
```

**為什麼這是 P0，不是整潔問題**

- `enhanceLinkField()`（app.js:9469+）把原本的 textarea 設成 `hidden = true`，換成一個只能從清單選取的 combobox。**picker 是這些欄位唯一的鑄造路徑**——沒有自由輸入的逃生口，也沒有任何視覺線索能讓 Ting 分辨那兩列。3 組證型是**失眠、頭痛、眩暈最常用的三個證**。
- **同一份檔案裡，正確寫法已經存在——只是沒套到 picker 上。**
  `patternDifferentialVocab()`（app.js:6748）的註解白紙黑字寫「證型清單刻意用跟 patternPickerOptions **同一批來源**」，
  而它**有**過濾：`return p.review_status !== "deprecated";`。
  實測六個 picker（`pattern` / `westernCondition` / `easternDisease` / `herb` / `formula` / `symptom`）**deprecated 過濾命中數全部為 0**。
  所以這不是「缺一個功能」，是**同一份檔案裡兩個宣稱同源的清單，一個過濾、一個不過濾**——
  修法就是把 6748 行那個 predicate 抄過去，風險極低。
- **這正是 D15/D17 已經裁決過、而且已經修過一次的錯**。`medicationPickerOptions()` 原本讀 12 筆 `med.*` legacy stub，`INDEPENDENT_AUDIT_2026-08-11` #3 抓到後修掉，app.js:8930 的註解白紙黑字寫著：「D15/D17 gate: a Visit saved after the migration **must never MINT** a new `med.*` reference; `med.*` is compatibility-only」。**同一條 gate 從來沒有套用到證型/病名/中藥/方劑的 picker。**
- D23 明文允許 staging 檔保留 `western_condition.*`（「那是出處層，D11 允許」）——**保留在資料層是對的，把它端到臨床輸入選單上不是**。這兩件事被混為一談了。
- **具體失敗**：Ting 在 9/05 把同一個多囊病人記成 `cond.pcos`，下一診記成 `western_condition.pcos`；把心腎不交的失眠記成退役 id。之後任何 cohort 查詢、任何 SQLite 遷移、任何「這個證型我用過幾次」的統計，都會少算一半。
- **deprecated 記錄沒有機器可讀的 replaced_by**：三筆退役證型的重導只寫在 `deprecated_note_zh` 的散文裡（實測：無 `replaced_by`/`replacement_id` 欄位）。**所以拖越久，事後清理越不可能機械化**——得靠人重讀那三段中文。

#### G1 附錄 · 「沙參」個案 —— 散文重導會腐爛，而且沒有任何機制會告訴你它腐爛了

*（MEASURED TREE `b452eb39`。由 `frosty-yonath-0adbce-0b` session 提報，本審查逐項獨立複驗，另發現兩項該 session 未提及的延伸。）*

Ting 在 `20c2bf0d`（2026-08-27）裁定南北沙參基原不同（桔梗科 Adenophora vs 傘形科 Glehnia），新建 `herb.nan_sha_shen`（herbs 363→364）。**副作用當天就發生了。**

實跑 `herbPickerOptions` 的過濾邏輯（`o.terms.includes(q)`，**無排序**，原始順序取前 8）——Ting 打「沙參」，畫面逐字如下：

```
1. 北沙參 · Bei Sha Shen   ->  herb.bei_sha_shen    [draft]
2. 南沙參 · Nan Sha Shen   ->  herb.nan_sha_shen    [draft，今天新建]
3. 沙參  · Sha Shen        ->  herb.sha_shen        [DEPRECATED D21，畫面零標示]
```

**第 3 列是唯一標籤為無修飾「沙參」的那一列——也就是開方時不想指定基原的人最自然會點的那一列——而它是退役卡。**

三件延伸事實：

1. **`herb.sha_shen` 的重導確實只活在散文裡**：`replaced_by` / `canonical_id` / `superseded_by` / `redirect_to` / `replacement_id` / `merged_into` **六個欄位全部 undefined**（實測）。
2. **那段散文今天失效了。** `deprecated_note_zh` 逐字寫著：「…不含任何南沙參（Adenophora，Radix Adenophorae）專屬臨床內容，**故未另立南沙參封存記錄**」。`herb.nan_sha_shen` 今天存在。**這條註記的立論已被 tree 本身推翻，而沒有任何驗證器會發現**——`validate-retired-id-references.js` 只檢查有沒有人引用退役 id，不檢查退役理由是否還成立。
3. **picker 的 `terms` 不含 `aliases_zh`**（實測：`terms` 只串 `name_zh + pinyin + name_en + id`）。`herb.bei_sha_shen` 的 `aliases_zh` 正是 `["沙參"]`——D21 把泛稱併進去的那一步——**但搜尋不到它**。所以 D21 的重導在資料層做完了，在輸入層完全沒生效。

**還有已經烙進資料、但可能不是 Ting 明確裁過的事——全庫實測是兩處，不是一處。**

**分母**（`origin/main` @ `0b01c258` 全庫實測）：223 方、**1,639 條 composition 列**，其中指向沙參類 `herb_id` 的**共 3 列**，全部指向 `herb.bei_sha_shen`；**指向退役 `herb.sha_shen` 的 0 列、指向 `herb.nan_sha_shen` 的 0 列**。三列全景如下（第二處由 `frosty-yonath-0adbce-0b` 提報、分母由該 session 補齊，本審查逐項複驗；第三列對照組由本審查點名）：

| 方 | 位置 / 角色 | `herb_id` | `name_zh` | `name_en` | `pharmaceutical_latin` | 判定 |
|---|---|---|---|---|---|---|
| `sha_shen_mai_men_dong_tang` | `composition[0]` 君 | `herb.bei_sha_shen` | 沙參 | Glehniae / **Adenophorae** | Rx. **Adenophorae**/Glehniae | ⚠️ 四欄三說 |
| `yi_guan_jian` | `composition[2]` 佐 | `herb.bei_sha_shen` | 沙參 | Glehniae / **Adenophorae** | Rx. **Adenophorae**/Glehniae | ⚠️ 四欄三說 |
| `sang_xing_tang` | `composition[5]` 佐 | `herb.bei_sha_shen` | 北沙參 | Glehnia Root | Rx. Glehniae | ✅ 一致，**樹內既有範本** |

前兩列各自同時宣稱四件事、彼此三說：**id 指北沙參**、**中文寫泛稱**、**英文寫「北/南」**、**拉丁寫「南/北」**——`pharmaceutical_latin` 的南北順序與同列 `name_en` **相反**，而那個混寫學名正是 D21 註記明文說「依 Ting 裁定明確排除、未遷入」的那一個。

兩點補充：

- **一貫煎指北的旁證不是方名。** `formula.yi_guan_jian` 的 `name_en` 是 "Linking Decoction"，不含任何基原線索（實測）。它指北的根據是 `herb.bei_sha_shen.related_formulas` 已列 `formula.yi_guan_jian`（實測為真）。所以**兩處的 `herb_id` 都有旁證，都不該動**；要動的是三個顯示欄。
- **`sang_xing_tang` 那列不是第三個缺陷，是對照組。** 它證明一致的列在樹內已經存在——所以修法是「照 `sang_xing_tang` 的形狀對齊」，不是憑空發明慣例。這把待裁項從開放式問題縮成二選一：**泛稱「沙參」在方劑裡要嘛顯示為北沙參（照對照組對齊），要嘛維持泛稱但拉丁學名須單一化**。

分母帶出兩個對「該不該現在裁」有用的結論：

- **要改的是 3 列裡的 2 列——這是小修，不是工程。** Ting 裁完當天就能改完，不必排批次、不必開 fill 線。**所以這一項沒有「等有空再裁」的理由**：裁定成本遠高於執行成本。
- **0 列指向退役的 `herb.sha_shen`**——這是方劑線用**不同掃法**對「存量乾淨」得出的獨立佐證（與 G10 的 19 條邊 / 10,374 條邊真陰性同結論）。**再次印證上方的口徑：存量 0，流量未關。** 順帶也確認新建的南沙參卡 `related_formulas` 留空是正確的——樹裡本來就沒有方引用它，不是漏掛。

**排序依賴**：這兩處顯示欄的修正**要等**下方裁定 ①（泛稱歸屬），因為它們的 `name_zh` 正是泛稱問題的落點——拆成兩次裁會生出新的不一致。狀態：**已定位、範圍封閉（全庫 1,639 列中僅此 2 列）、等裁定**。

**這就是為什麼 G1 的修法不能只是「補一個 `replaced_by` 欄位」。** 「方劑裡寫『沙參』時預設哪一味」是臨床裁定，不是技術重構——而在 Ting 裁定之前，picker 每天都在把那張退役卡端到她面前。**這一項的過濾（把 deprecated 撤下選單）不需要等裁定，可以先做；重導目標的裁定另計。**

**formula picker 的同類噪音**（實測 4 筆全部上架）：

```
敗毒散 · Bai Du San                      -> formula.bai_du_san                    [D22 退役]
羚角鉤藤飲 · Ling Jiao Gou Teng Yin      -> formula.ling_jiao_gou_teng_yin        [退役]
都氣丸(匯入重複殘根) · du qi wan          -> formula.du_qi_wan_import_stub         [退役]
復元活血湯(匯入重複殘根) · fu yuan huo…   -> formula.fu_yuan_huo_xue_tang_import_stub [退役]
```

後兩列把「(匯入重複殘根)」這個內部維運字串直接印在臨床輸入選單上。

**⚠️ 敘述精度（讀這段的人請照這個口徑講）**：**存量 0，流量未關。**
資料層指向退役卡的活引用**今天是 0**——`validate-retired-id-references.js` PASS，另一 session 同日照 active/deprecated 分桶重跑 19 條邊 / 10,374 條邊亦得 **0，真陰性**（見 G10）。
G1 講的**不是**「退役 id 污染了資料」——那句話會被上面那組數字直接打臉。G1 講的是**輸入層還能鑄造新的退役引用**：清存量的驗證器問的是「**有沒有人引用**」，不問「**還能不能新引用**」。存量乾淨與流量沒關上，兩件事同時為真，而後者從 9/05 起每天都在開著。

**現有守衛覆蓋**：零。`validate-retired-id-references.js` 只掃 `data/**`，不掃 app.js 的 picker，也不掃 localStorage——**它掃的是水位，不是水龍頭。**
**scope**：小。三個 picker 加 `.filter(r => r.review_status !== "deprecated")`；兩個 picker 移除 legacy union（照 med.* 前例）；補一支驗證器斷言「picker 來源不得含 deprecated / legacy namespace」。
**dependencies**：`eastern_disease.threatened_miscarriage_context` 與 8 筆 `western_condition.*_context` 在正典側沒有雙胞胎——D23 已裁定 C3 四個 `_context` 併入本病卡、C4 三個療程階段撤下，執行時照 D23 走即可，**不需要 Ting 再裁一次**。
**延後 3 個月**：9/05–12/05 三個月的真實病歷會混著兩套 id 與退役 id。D12 從 9/01 起凍結為 additive-only，屆時清理必須寫遷移腳本（D12 明文要求），而重導表得從那幾段中文散文重建——**而散文會腐爛：沙參個案（下方附錄）證明一段重導註記可以在一次無關的裁定當天失效，且零機制會察覺。** 拖三個月，等於拖著一份會自己過期、沒人看守的重導表去做遷移。**現在改是一行過濾；三個月後是一次遷移加一次考古。**

---

### 🔴 G2 · 病例 schema 白名單無守衛：D30 關了三個表面，第四個（`normalize*` 的 179 key）仍開 — **P0**（`PARTIALLY_FIXED`）

**current-main evidence**

```
app.js:2000  AcuTingClinicalStore.load().map(normalizeClinicalCase)   ← 每次載入都跑
app.js:2021  parsed.map(normalizeClinicalCase)
app.js:5819  function normalizeClinicalCase(value) { return { ...95 個具名欄位... } }   ← 全新建構物件
app.js       persistClinicalCases() → AcuTingClinicalStore.save(clinicalCases)          ← 把正規化後的寫回
```

`normalizeClinicalCase` **回傳一個全新建構的物件**——不是 `{...value, ...}`。任何不在那 95 個 key 裡的欄位，在 load→save 一圈之後就不存在了。`normalizeSoapNote` 同樣是 **84 個 key 的白名單**。

**因此：那 179 個 key 就是 Ting 臨床資料的持久化 schema，而它只是 app.js 裡的兩段物件字面量。**

- **D12（LOCKED 2026-08-06，2026-09-01 生效）**規定 `schema.sql`、localStorage 格式、匯出格式從該日起 **additive-only：欄位可加，不可改名、不可改型、不可移除**。

#### D30 已經關掉三個表面（本報告初稿之後落地，`2f44501a`）

`scripts/validate-clinical-contract-freeze.js` 已進 CI（實測 PASS），基準檔 `data/audits/clinical_contract_baseline.json`，凍結：

1. `schema.sql` —— 29 表 / 356 欄（含型別）
2. 匯出形狀 —— 信封鍵 + 病例欄位型別（以 `sample_export_fixture.json` 為存證）
3. localStorage **key 名稱** —— 4 個（`app.js` + `js/clinical-store.js` 聯集）

判定規則正確（新增放行／移除・改型別 FAIL／`--update` 拒絕追認破壞），負控 6/6。**這是真的進展，不該被低估。**

#### 但第四個表面沒關 —— 而那是唯一真正寫入的那個

**三個被凍結的表面都是「檔案」；實際把物件寫進 localStorage 的是「程式碼」，也就是那 179 個 key。**
`sample_export_fixture.json` 是一份**靜態committed 檔**，不會因為 `normalizeClinicalCase` 少一個 key 而改變；
`schema.sql` 是 SQLite 遷移的目標，不是今天 localStorage 的寫入器；表面 3 凍的是**儲存鍵名**，不是**病例欄位名**。

**負控實測**（`origin/main` @ `e388bcc3`，獨立 worktree，測完已還原）——
從 `normalizeClinicalCase` 刪掉 `allergyStatus:` 一行，即 G2 描述的靜默刪除情境：

```
scripts/validate-clinical-contract-freeze.js   → PASS — 契約表面與基準一致。   exit 0   ← D30 的新 gate
scripts/validate-clinical-case-standard.js     → exit 0
scripts/validate-clinical-invariants.js        → exit 0
scripts/test-export-envelope-shapes.js         → exit 0
scripts/validate-clinical-store-phi-boundary.js→ exit 0
```

**五支全綠。** `grep normalizeClinicalCase scripts/validate-clinical-contract-freeze.js` → **0 命中**：
新 gate 完全沒有讀那兩個 normalizer。**所以那條靜默刪欄的路徑今天仍然開著。**

- **失敗長什麼樣**：任何 agent 或 merge 把 `allergyStatus` 改名成 `allergy_status`、或順手刪掉一個看起來沒人用的欄位——Ting 下次開 app、按任何一次存檔，那個欄位在她瀏覽器裡唯一的那份資料就消失了。**沒有 alert、沒有 console error、git diff 只顯示 app.js 動了一行、驗證器全綠。**
- **這個 repo 有這個 failure class 的前科**：merge 整份吃掉 `knowledge.js` 並靜默回退 main 側 UI；panel 重寫靜默掉了 detailSection。今天還有另一個 session 正在同一個 repo 上改共用檔案。**app.js 正是被 merge 弄壞過的那個檔。**

**現有守衛覆蓋**：D30 的 gate 關了三個表面（見上），但**四支既有臨床驗證器＋D30 gate 對白名單刪欄全部不響**（負控 5/5 綠）。
**scope**：**因 D30 而大幅縮小——從「建一個 gate」變成「替既有 gate 加第四個表面」。**
在 `validate-clinical-contract-freeze.js` 加一段：從 `app.js` 解析 `normalizeClinicalCase`／`normalizeSoapNote` 的
key 清單（兩段物件字面量，正則或輕量 AST 皆可），寫進既有基準檔的新區塊，沿用它已經寫好的
「新增放行／移除・改型別 FAIL／`--update` 拒絕追認」判定與 `--force-rebaseline` 逃生口。
**判定邏輯、基準檔格式、CI 接線、負控框架全部已經存在，只需要多餵一個表面。**
**dependencies**：無。**建議由 D30 的作者接手**——他最清楚那支 gate 的內部結構，且負控框架是他寫的。
**延後 3 個月**：凍結日 9/01 過去、真實病歷 9/05 進來。之後每一次白名單編輯都是一次無聲的俄羅斯輪盤，而**被刪掉的資料沒有第二份拷貝**——D7 明定臨床資料不進 git。這是 PLAN 自己說「唯一無法回填的資產」。

---

### 🟠 G3 · R12 逐欄位 Merge 修復無 CI 回歸測試 — **P1**

**current-main evidence**：R12 的修復在 `app.js:11100–11120`，逐行讀過，正確——用 `imported[i]` 的原始物件做 `hasOwnProperty` 判斷（不是用 normalize 補完後的 `inc`），這個細節是對的。

但：

```
掃過 scripts/**：只有兩支腳本會執行 app.js::importClinicalCases
  scripts/audit-clinical-export-contract.js       inCI = 0     ← Fixture 9 / 9b（R12 的證明）在這裡
  scripts/validate-clinical-store-phi-boundary.js inCI = 1     ← 不碰 merge 語意
scripts/test-export-envelope-shapes.js（在 CI）：grep 'merge|partial|R12' → 0 命中
```

**Task 10C 花了四輪找出的那個破壞性資料遺失 bug，修好之後沒有任何 CI 守衛。** 唯一證明它還活著的東西是一支 MANUAL_ONLY 的稽核腳本。任何一次 merge 把那 12 行還原回 `byId.set(inc.id, inc)`，CI 全綠。

**具體失敗**：Ting 匯入一份只填了部分欄位的備份做 Merge，以為「只新增/延伸」（UI 對話框就是這樣寫的），結果既有病例被清空。這正是 10C 找到的那個 bug——**它只是暫時不在了，不是被守住了**。
**scope**：小。把 `audit-clinical-export-contract.js --self-test` 的 Fixture 9/9b 提升成一支 CI 呼叫的測試（或直接把該稽核的 `--self-test` 接進 CI）。
**延後 3 個月**：復發機率隨 app.js 的 merge 次數線性上升，而復發時使用者看到的是「合併成功」。

---

### ⚪ G4 · 12 支綠燈孤兒驗證器在 CI 外；NOTE tier 計數未進棘輪 — **P2**（初版排 P1）

**我把 10B 的 13 支孤兒驗證器全部實跑了一次**（這是 10B 沒做、而它決定了這個缺口該排 P1 還是 P0）：

| 結果 | 支數 |
|---|---|
| 綠燈、fail-closed、**不在 CI** | **12** |
| 紅燈 exit 1 | 1 —— `validate-herb-canon`（5825 筆 `channels_entered`/`modern_use_tags` 空值，是**內容 backlog**，不是結構缺陷） |

**結論修正 10B**：GAP-03 **不是「13 個隱藏的紅燈」**。12 支今天全綠——意思是它們現在**沒有抓到任何東西，但也沒有在守任何東西**。真正的風險是腐化：`check-formula-no-loss`、`check-today-survives`、`validate-no-boilerplate`、`validate-pattern-registry` 這些是「不准退步」型的守衛，放在 CI 外等於**它們什麼時候被推紅都沒人知道**。

**GAP-04 需要重新描述**：10B 標成 `POSSIBLE_FALSE_GREEN` 是**言過其實**。那 4 個 NOTE tier 步驟是刻意設計，workflow 裡逐條寫了畢業條件與基準清單。但有一個真缺口：`.github/workflows/validate.yml` 的註解寫著「不准偷偷變大」，而那一步永遠 exit 0、**也不在 `check-validation-ratchet.js` 裡**（棘輪只涵蓋 conditions/patterns/tdis/symptoms/naming/encoding/formula-correctness/formula-dose-staging 八層）。所以 formula composition signatures、formula safety predicates P1–P4/P6、herb integrity HB-4/5/6/8/9/10/11/12、field shape census 的計數**可以無聲成長**，違反 workflow 自己寫下的承諾。

**scope**：小。12 支綠燈的接進 CI（或棘輪）；NOTE tier 的四組計數寫進 `validation_baseline.json` 走既有棘輪。`validate-herb-canon` **不要接**——接了 CI 永遠紅，一週內就會被關掉（workflow 註解自己講過這個道理）。
**延後 3 個月**：無使用者可見失敗，純腐化風險。但成本極低。

**為什麼降 P2**：`AGENTS.md`「什麼時候停」明定到 9/5 的配比為**產品 75–80% / QA 20–25%**。
G1/G2/G3 已經佔滿 QA 側（G2/G3 是安全 gate，不可讓），而 G4 是四項裡**唯一沒有使用者可見失敗**的。
同段還有一條:「MED 以下記進待辦，不擋 landing、不開新輪」——G4 連 MED 都算不上，它是腐化預防。
**9/05 之後成本一樣低，那時再做。**

---

## 5. WATCH / CLOSE

### CLOSE — 已修好或不再相關

| gap | 判定與證據 |
|---|---|
| **G10** 34 條 active→deprecated 引用 | `node scripts/validate-retired-id-references.js` → **PASS，0 active references**；12 筆退役 id 各自只剩自身宣告。10A §4 列的 34 條（symptoms.json 18 條、tdis_registry 5 條、formulas 8 條…）**實測全部歸零**。generated bundle 每個退役 id 出現 2 次＝它自己的記錄（D6 不硬刪），**非引用**。CI 直接擋。 |
| **G11** GAP-02 命名空間倒置 | `63301701` 修掉：`addId()` 改收 prefix 陣列，並把 `condition_canon_shortlist`（508）+ `tdis_registry` 載為參照來源。12 個 hard failure → exit 0。**倒置消失**。 |
| **G12** 同 ID Merge 破壞性覆寫 | R12 `707e3bf9` 已實作且正確（見 G3）。**行為面 CLOSE，守衛面開在 G3。** |
| **G13** 4 條 precedence chain | **逐條查證，無一遮蔽證據**：① `app.js:478` `sources \|\| cloudtcm_url` 是 fallback，而 `cloudtcm_url` 在 `js/knowledge.js:601/1113/1161-1168` 獨立渲染成自己的連結；② `js/knowledge.js:1300` 是「卡片頭部主要參考連結挑一個」的**刻意設計**（上方 15 行有註解說明為什麼），被跳過的 `american_dragon_url`/`sources` 都另有渲染點；③ `legacy/app.js:147` — **該檔未被任何 HTML 載入**（實測 0 命中），死碼；④ `scripts/report-formula-completeness.js` 是報表腳本，不是 runtime。**今天沒有任何證據來源因為非預期優先序而看不到。** |
| **G14** `pattern_registry` 欄位被 DROPPED / TRANSFORMED | **稽核自己的方法瑕疵，逐數字可證。** 實測：把 generated bundle 載進 sandbox 比對 `K.patternRegistry` ↔ 正典 → **151/151 記錄，`source_type` dropped = 0，`review_status` dropped = 0**。原因在 `scripts/audit-evidence-provenance-fragmentation.js:64-65`——`pattern_library` 與 `pattern_registry` 被指派同一個 `family: "patterns"`，所以稽核拿 registry 的記錄去比對 **library 的 bundle 切片**。對數字：library 154 筆裡有 117 筆帶 `review_status`，其中 3 筆是不在 registry 裡的 D16 退役卡 → 117−3 = **114 verbatim**，151−114 = **37 dropped**；library **0 筆**帶 `source_type` → **151 全 DROPPED**。**與稽核報告的數字逐字吻合。** 又：`knowledge_pat.js` 與 `pattern_registry.json` **自稽核 base `3ced3b32` 起零變動**，所以不可能是後來修好的。<br>⚠️ **不要派工去修。** D25 剛把 pattern_registry 宣告為手工正本、builder 降級（`--write` 已實測會 loudly 拒絕）。針對一個不存在的 bug 去動這條線，是 D25 §Why 量化過的那 38 筆 V2 記錄／171 個欄位的風險。 |
| **G15** `review_status` vs `source_status` | 10D 自己判 `CLEARLY_DISTINCT`（618 筆共存記錄，REVIEW_STATE vs VERIFICATION_STATE 兩個不同軸），且 `validate-review-status-vocab.js` 已在 CI。**不是碎片化，是兩個欄位。** |

### WATCH — 已被守住／已被裁定，只監看

| gap | 判定 |
|---|---|
| **G8** D11 legacy 診斷 namespace（`western_condition.*` 184、`eastern_disease.*` 96、`symptom.*` 12、`pat.*`） | **`SUPERSEDED_BY_LATER_DECISION`。** D23 明文：「staging（pathology/conditions.json、condition_graph_expansion、clinical_cases 種子）照 D15 med.* 前例**保留原樣**——那是出處層，D11 允許」。`pat.*` 的 411 筆多數是 `pattern_alias_map` / `tcm_pattern_canon` 的**別名條目**（D23 明文「舊 id 進 aliases」）。361.json 的 127 refs / 32 unique **實測 32/32 都能解析**（tcm_pattern_canon + pattern_library），畫面上不會出現暗連結。<br>**唯一還開著的是輸入側，已獨立列為 G1。** 資料層不動。 |
| **G9** 其餘 7 個 dark evidence 欄位 | `original_shape`/`source_field`（herbs 各 289，劑量正規化的出處軌跡）、`content_source`（condition_canon 130）、`safety_review`(1)、`herb_pair_source_note_zh`(1)、`source_hierarchy`(1)、`D_clinical_evidence`(1)。**都是稽核軌跡欄位，沒有使用者可見失敗。** 保留成本為零（D6）。不要為了「覆蓋率」去接線。 |
| **G5**（P2） DailyMed 網址 | 59/59 西藥卡帶 `dailymed_url`（FDA 官方標籤頁），**畫面只印標籤標題不給連結**（`js/knowledge.js:1326` 只讀 `dailymed_label_title`）。Ting 想核對一條交互作用時沒有路徑可點。**1 行的修法**，併進任何一次西藥卡的工作即可。 |
| **G6**（P2） `case_count` | `unwrapV1CasesPayload` 確認只驗 `Array.isArray(parsed.cases)`，不比長度。**但要誠實**：真正被截斷的檔案會先在 `JSON.parse` 失敗（fail-closed 已驗證），所以現實觸發面窄——只有結構合法但計數錯誤的檔（手工編輯／未來的產生器 bug）。加檢查很便宜，但別排在 G1–G4 前面。 |
| **G7**（P2） `validate-herb-canon` 紅燈 | 5825 筆 `channels_entered`/`modern_use_tags` 空值。**這是內容 backlog，屬 fill 線，不是工程缺口。** 接進 CI 會讓 build 永遠紅。要接的話先走棘輪。 |

---

## 6. Recommended execution order

**只有兩個東西必須在 9/05 之前落地。其餘照序。**

| # | 工作 | 為什麼是這個順序 | 期限 |
|---|---|---|---|
| **1** | **G1 · picker 身分衛生** | 每一次看診都在發生；改動最小；D15 的前例已經在同一份檔案裡示範過怎麼修。**先做這個，因為它是唯一一個「每天都在製造新髒資料」的缺口** | **9/05 前（硬性）** |
| **2** | **G2 · 替 D30 的 gate 加第四個表面（`normalize*` 179 key）** | 凍結日 9/01。D30 已關三面、判定邏輯與負控框架都在，**只差這一面**——而它正是唯一真正寫入 localStorage 的那個 | **9/01 前（硬性）** |
| **3** | **G3 · R12 回歸測試進 CI** | 與 #2 同一個 D12 執行面，同一批做省一次上下文。**建議與 #2 合成一張卡** | 9/05 前 |
| **4** | G4 / G5 / G6 / G7（全部 P2） | **9/05 之前不做。** G4 純腐化防護，成本 9/05 之後一樣低；其餘併入各自線的下一次工作，不獨立派工 | 9/05 後 |

**明確不要做的三件事**（比要做的更重要）：

1. **不要動 `pattern_registry` 的 build 路徑**（G14 是假警報，D25 量化過重生成會毀 38 筆記錄）。
2. **不要遷移 staging 檔的 legacy namespace**（G8，D23 明文保留）。修輸入側就好。
3. **不要把 `validate-herb-canon` 接進 CI**（G7，5825 筆內容 backlog，會逼出關掉 gate 的壓力）。

---

## 7. Agent assignment

> **前提（2026-08-27，Ting）：Codex 額度不足；Sonnet 5 與 Opus 5 可用。**
> 這不是自由分派——`AGENTS.md`「安全 gate 的驗證分工」對這個情境已有成文處置，下表照它排。

### 7.1 成文約束（`AGENTS.md`，不是本報告的意見）

| 階段 | 誰 |
|---|---|
| 攻擊面清單 | **SOL** |
| **執行對抗測試** | **Codex，或隔離的 Opus subagent** |
| 修復 | 實作線（**reviewer 不改產品碼**） |
| 例行迴歸 | CI |

三條硬規則，下表全部遵守：

1. **「安全 gate 改完，自測綠不算數」**——G2/G3 屬持久層／不可變歷史，**實作者不得自測交差**。
2. **「自家 subagent 與實作者同源，共用盲點風險較高」**——所以**實作者與對抗測試者不得是同一個 agent**。
   Opus 可用不代表可以「Opus 實作 + Opus 覆測」：那是共用盲點的**最大值**，比 Codex 缺額本身更危險。
   打破迴圈的是 SOL 那一步，**不能省**。
3. **「Codex token 只花在當下擋住 landing 的那一個 gate」**——四項裡**只有 G2 有硬日期（D12，9/01）**，
   殘額全押 G2 的對抗測試，G1/G4 一滴不用。

### 7.2 分派

| # | 工作 | Owner | 理由 |
|---|---|---|---|
| **1a** | G1 · 裁定哪些 legacy 記錄撤下、`_context` 照 D23 併去哪 | **Claude** | 語意判斷 |
| **1b** | G1 · 實作（deprecated 過濾＋移除 legacy union＋新驗證器＋測試） | **Sonnet 5**，可自主落地 | **非安全 gate**（不碰 PHI／持久格式）。Sonnet 自主落地已有 Ting 2026-08-14 裁示：驗證後 rebase→ff-merge→push，不必等 |
| **2a** | G2 · **確認第四表面之後是否還有第五個**（列舉持久化寫入路徑是否窮盡） | **Opus 5** | 判斷密度最高的一步。**D30 已經示範了這個風險是真的**：它關了三個「檔案」表面，漏掉唯一真正寫入的「程式碼」表面。漏一條 → **閘門帶洞卻看起來完整**。Opus 花在這裡，不是花在 G1 |
| **2b** | G2 · 替 `validate-clinical-contract-freeze.js` 加第四表面 | **建議 D30 作者**（`2f44501a`，Fable 5）；否則 Sonnet 5 | 判定邏輯／基準格式／CI 接線／負控框架都是他寫的，接手成本最低 |
| **2c** | G2 · **對抗測試** | **隔離 Opus subagent，且不得是 2a／2b 那一個** | `AGENTS.md`：安全 gate 自測綠不算數；執行者與測試者不得同源。**至少要跑本報告 §4 G2 那個負控**（刪一個 key，gate 必須 FAIL） |
| **3** | G3 · R12 回歸測試進 CI | **Sonnet 5**，與 #2 同批 | 純測試搬遷，無語意判斷。它本身就是分工表「每個 bug 變永久 fixture」那一列 |
| **4** | G4（**已降 P2**） | — | **9/05 前不做**，見 §4 G4 的降級理由 |
| — | 落地後逐列確定性複跑 | **ANTIGRAVITY** | 只給「12 支各跑一次、貼 exit code 與 defect 數」這類確定性核對。**不要給它 app.js**——判斷型任務有編造前科（`modern_functions_en` 整批打回） |
| — | **本報告的反向查核（唯一一輪）** | **SOL** | §5 推翻了 10D 兩個結論（G13/G14）與 10B 一個分級（GAP-04）。**推翻稽核結論的人不該是唯一驗證它的人。** 派工單：`docs/research_packs/GAP_REVIEW_REVERSE_CHECK_REQUEST_SOL.md` |

### 7.3 SOL 只有一輪（修訂初版）

初版在此處排了**兩輪** SOL（現在反向查核 ＋ 落地後驗收）——**那違反 `AGENTS.md` 的
VALIDATION FRONTIER FROZEN**：「一個 milestone 只允許一次 independent audit……
任何 agent 不得自行對同一 milestone 再開一輪。」

**收斂為一輪，且用在現在。** 理由：本報告推翻了三個已接受的結論，若排序錯了，
整個 9/05 衝刺會建錯東西——**在花工程之前查，槓桿遠高於事後驗收**。
落地後改跑「針對該 blocker 的 regression」（＝ CI fixture，見 #3），那是 CI 的職權，不是 SOL 的。

> **這也是為什麼 Opus 可用反而讓 SOL 那一輪更該送**：Opus 實作、Opus 覆測，
> 共用盲點最大，SOL 是唯一的外部視角。

---

### 附：G1 落地前 Ting 需裁的兩件事（**都不阻擋 1b 的 deprecated 過濾**）

① 退役卡要不要補 machine-readable `replaced_by`，還是繼續只留 `deprecated_note_zh` 散文
（沙參個案已證明散文會腐爛且無人發現）。
② **臨床題**：方劑裡寫泛稱「沙參」時預設哪一味？D21 的重導目標寫死成北沙參，是南沙參尚未獨立時的裁定。
落點是**全庫 1,639 列中的 2 列**（`sha_shen_mai_men_dong_tang` 君、`yi_guan_jian` 佐），
兩處 `herb_id` 都有旁證不動，要動的是三個顯示欄；`sang_xing_tang` 是樹內既有的一致範本，
**所以這是二選一，不是開放題**。
③ 那兩處顯示欄的修正**要等** ②（它們的 `name_zh` 正是泛稱的落點，分兩次裁會生新的不一致）；
**picker 撤 deprecated 不等任何一項。**

<details><summary>初版 §7 的分派（Codex 充足時，存查）</summary>

| # | 工作 | Owner |
|---|---|---|
| 1 | G1 | Claude → 裁定；Codex → 實作 |
| 2 | G2 | Claude → 設計邊界；Codex → 實作 |
| 3 | G3 | Codex |
| 4 | G4（時列 P1） | Codex → 接線；ANTIGRAVITY → 複跑 |
| — | #1/#2 落地後驗收 | SOL（**此輪已依 FRONTIER FROZEN 取消**） |

原 G1 理由全文：「哪些 legacy 記錄該從選單撤下、`_context` 系列照 D23 併到哪張卡」是語意判斷（Claude）。撤下 union + deprecated 過濾 + 新驗證器 + 測試是實作（Codex）。**過濾本身不需要等 Ting**</details>

## 附錄 · 數字重現指令

```bash
# G1 — picker 髒資料
node -e 'const f=require("fs");const l=JSON.parse(f.readFileSync("data/pathology/pattern_library.json","utf8")).records;l.filter(r=>r.review_status==="deprecated").forEach(d=>l.filter(r=>r.id!==d.id&&r.name_zh===d.name_zh).forEach(t=>console.log(d.name_zh,"|",d.id,"[dep] vs",t.id)))'

# G1 附錄 — 重現 Ting 打「沙參」看到的三列（含退役卡,畫面零標示）
node -e 'const h=JSON.parse(require("fs").readFileSync("data/herbs/herb_canon_shortlist.json","utf8")).records;h.map(r=>({l:`${r.name_zh||r.id}${r.pinyin?" · "+r.pinyin:""}`,t:`${r.name_zh||""} ${r.pinyin||""} ${r.name_en||""} ${r.id}`.toLowerCase(),id:r.id,d:r.review_status==="deprecated"})).filter(o=>o.t.includes("沙參")).slice(0,8).forEach((o,i)=>console.log(`${i+1}. ${o.l} -> ${o.id}${o.d?"  [DEPRECATED]":""}`))'

# G1 附錄 — 退役卡的重導欄位全部不存在(六個都應為 undefined)
node -e 'const s=JSON.parse(require("fs").readFileSync("data/herbs/herb_canon_shortlist.json","utf8")).records.find(r=>r.id==="herb.sha_shen");["replaced_by","canonical_id","superseded_by","redirect_to","replacement_id","merged_into"].forEach(k=>console.log(k,"=",JSON.stringify(s[k])))'

# G1 — legacy union 重疊
node -e 'const f=require("fs");const c=JSON.parse(f.readFileSync("data/pathology/condition_canon_shortlist.json","utf8")).records;const g=JSON.parse(f.readFileSync("data/pathology/conditions.json","utf8"));const m=new Map(c.map(r=>[r.name_zh,r.id]));g.records.forEach(r=>{const t=m.get(r.name_zh);if(t)console.log(r.name_zh,r.id,"==",t)})'

# G2 — 白名單欄位數
awk "NR>=$(grep -n 'function normalizeClinicalCase' app.js | cut -d: -f1)" app.js | awk '/^}/{exit}{print}' | grep -cE '^\s+[a-zA-Z]+:'   # → 95

# G3 — 誰執行 importClinicalCases、誰在 CI
for s in $(grep -rln 'importClinicalCases' scripts/*.js); do echo "$(basename $s) inCI=$(grep -c "node scripts/$(basename $s)" .github/workflows/validate.yml)"; done

# G10 — 退役引用歸零
node scripts/validate-retired-id-references.js

# G14 — pattern_registry 實際存活率（應為 151/151，0 dropped）
# 見本次審查的 sandbox 比對腳本；核心：載入 data/generated/knowledge_*.js → K.patternRegistry ↔ data/pathology/pattern_registry.json 逐 id 比對
```

---

**本報告零資料異動、零程式碼異動。** 下一步等 Ting 裁定執行順序，以及 G1 的那一個 `replaced_by` 問題。

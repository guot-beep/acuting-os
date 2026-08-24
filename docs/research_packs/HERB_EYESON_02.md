# HERB_EYESON_02 — 中藥卡人眼審查第二批（十八反/十九畏對造 10 + 剩餘毒藥族 12 + 高曝光 8 = 30 味）

狀態：**findings ledger，只讀。本輪沒有動 `data/**` 一個字元。**
Branch：`codex/herb-eyeson-2`（自 `origin/codex/pattern-v2` tip `8d24349`）
日期：2026-08-12
對象：`data/herbs/herb_canon_shortlist.json`（**358 筆 records**）
上游：`HERB_EYESON_01`（30 味，2 CLEAN / 15 MINOR / 13 DEFECT，findings H-01…H-24、HB-1…HB-12）

**本批不重複立案的批次一全庫級缺陷**（只更新計數，見 §3.1）：
H-01 假劑量渲染（已於 `2ea39fc` 修為「待補」）· H-02 食療用量欄 · H-03 `related_formulas`
指向不含該藥的方 · H-06 機械生成 placeholder 英文 · H-11/H-12 禁忌欄與英文安全欄缺失 ·
H-16 `clinical_use_note` 被 CloudTCM 原文佔住。
甘草樣板句仍然 0 命中，**批次一的陰性結論成立，本輪未再檢**。

---

## §0 取樣、方法、與可重現指令

### 取樣原則（派工單三條，逐條交代）

**第一段 — 剩餘的 `safety_flags` 毒藥族。** 全庫 300 筆帶 `safety_flags`；以
「硬安全 slug」（`toxic|very_toxic|toxicity_review|heavy_metal_review|not_for_self_treatment|
urgent_red_flag_review|special_preparation_required|obsolete_substance|dose_preparation_review|
incompatibility_review|eighteen_incompatibilities_li_lu|ncbahm_appendix_d|pregnancy_contraindicat*`）
解析得 **56 筆，扣掉批次一已讀的 16 筆，剩 40 筆未讀**。本批取其中 12 筆
（巴豆・天南星・川楝子・苦楝皮・檳榔・苦參・吳茱萸・何首烏・硫黃・川木通・犀角・麝香），
優先取毒性最高（`toxic`+`very_toxic` 只有巴豆一筆）與批次一明文排除的
`chuan_mu_tong`（川木通，批次一 §0 註明「另存，未納入」）。

**第二段 — 十八反／十九畏的「對造卡」，這是本批的主軸。**
批次一 H-04 發現甘遂與甘草對同一組配伍講反方向，並判定「這是一個 class」。
要證明是不是 class，就不能再隨機抽樣，必須**成對取**：對每一組已知配伍，
把「批次一讀過的那一側」的對造抓出來讀。以 `id` slug 解析：

| 配伍組 | 批次一已讀側 | 本批取的對造側 | 卡片存在？ |
|---|---|---|---|
| 烏頭 反 半夏・瓜蔞・貝母・白及・白蘞 | `fu_zi` `chuan_wu` `cao_wu` `ban_xia` | `gua_lou` `chuan_bei_mu` `zhe_bei_mu` `bai_ji` | 4/4 存在；**`bai_lian`（白蘞）不存在** |
| 甘草 反 甘遂・京大戟・芫花・海藻 | `gan_cao` `zhi_gan_cao` `gan_sui` | `hai_zao` | 1/1；**`jing_da_ji` `yuan_hua` 不存在** |
| 十九畏 人參 畏 五靈脂 | `ren_shen` | `wu_ling_zhi` | 1/1 |
| 十九畏 丁香 畏 鬱金 | —（兩側都未讀） | `ding_xiang` `yu_jin` | 2/2 |
| 藜蘆 反 人參・沙參・丹參・玄參・細辛・芍藥 | `ren_shen` `xi_xin` `bai_shao` | `dan_shen` `xuan_shen` | 2/2；**`li_lu`（藜蘆）不存在** |

→ **10 味**。子字串陷阱同批次一的警告：`da_ji` 解析到的是 **`herb.da_ji`＝大薊**（薊科止血藥），
**不是十八反的京大戟（Euphorbia）**；`bai_ji` 是白及、`bai_jie_zi` 是白芥子、
`bai_jiang_can` 是白僵蠶、`bai_ji_li` 是白蒺藜 —— 四個都會被 `bai_ji` 子字串誤撈。

**第三段 — 補到 30，取 formulas.json composition 出現方數最高、批次一未覆蓋者：**

```
黃芩 28 · 川芎 27 · 生地黃 27 · 熟地黃 26 · 陳皮 25 · 桂枝 21 · 黃連 19 · 柴胡 18
```
→ **8 味**。

**派工單第 3 條（至少 3 張 `card_grade` 高或 `review_status` 超過 draft）：實際取到 10 張。**
`card_grade: template` **6 張**（海藻・巴豆・天南星・陳皮・桂枝・柴胡；全庫 template 只有 85 張、
gold 1 張已被批次一讀掉）；`review_status ≠ draft` **4 張**
（五靈脂・鬱金・丹參・川芎 = `source_checked`；麝香 = `sourced_cloudtcm_record`）。
這 10 張是本批最重要的對照組 —— **結論是「宣稱等級」與品質的相關性是雙向的，見 §3.4。**

### 這 30 筆

```
herb.gua_lou herb.chuan_bei_mu herb.zhe_bei_mu herb.bai_ji herb.hai_zao
herb.wu_ling_zhi herb.yu_jin herb.ding_xiang herb.dan_shen herb.xuan_shen
herb.ba_dou herb.tian_nan_xing herb.chuan_lian_zi herb.ku_lian_pi herb.bing_lang
herb.ku_shen herb.wu_zhu_yu herb.he_shou_wu herb.liu_huang herb.chuan_mu_tong
herb.xi_jiao herb.she_xiang
herb.huang_qin herb.chuan_xiong herb.sheng_di_huang herb.shu_di_huang herb.chen_pi
herb.gui_zhi herb.huang_lian herb.chai_hu
```
與批次一的 30 筆**零重疊**；兩批合計 **60/358（16.8%）**。

### 方法

同批次一：每一筆整筆取出、攤平成逐欄文字後逐行讀完（含 `english_exam_track`、
`chinese_depth_track`、`safety_info`、兩套劑量欄、`field_sources` 鍵名）。
30 張卡攤平後共 **約 600 KB**。`modern_functions_detail_zh`（CloudTCM 藥理長文，
本批最大的單一欄位）另以「跨卡藥名出現次數 vs 本卡藥名出現次數」機器比對檢查錯位 ——
**這一招在本批直接抓到浙貝母（§2 H-26）**，是批次一沒有的手法。

機器掃描只用來**量化已經用眼睛確認過的問題有多廣**，不作為發現來源。

### 判級規則與保守原則

沿用批次一：**DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷；
**MINOR** = 只有 QUALITY 級；**CLEAN** = 引不出任何一條。
只列能引用原文、並說出為什麼錯的項目。**不代寫替代內容。**

### 開讀前的兩件事

**（一）批次一的 HB-1 已經落地，本輪確認。** `js/knowledge.js:1551` 現在是
`dose.standard_daily_g || "待補"`，同行 `props.part_used_zh || "待補"`，
上方 1542–1550 留了紅線 4 的說明註解。假的 `6~15g` 不再顯示。
**但 H-01 的資料側缺口原封不動**：本批 30 味有 **18 味**沒有
`dosage_g.standard_daily_g`（全庫仍 200/358，其中 17 張帶 toxic 類 flag），
這 18 味現在顯示「待補」，而真實劑量就躺在渲染器讀不到的 `dosage` 欄裡。
→ **HB-2（渲染器補讀 `dosage`）從「優化」升級成「止血後的必要收尾」。**

**（二）驗證器現況（本輪只跑不改）**

```
node scripts/validate-herb-standard.js   → PASS — no structural defects
node scripts/validate-content-junk.js    → PASS — no scraped header tokens, no encoding anomalies in _zh fields
```
下面 §2 的 22 條，**一條都沒有被擋下來**。包含 H-26（浙貝母整張卡是川貝母的複製件）
與 H-31（黃連的注意事項欄寫「每日 12g 未見副作用」）。

---

## §1 逐卡判級

| # | id | 中文 | grade / rs | 判級 | 一句話 |
|---|---|---|---|---|---|
| 1 | `herb.gua_lou` | 瓜蔞 | partial/draft | **DEFECT** | `clinical_use_note` 開頭是「**瓜簍**是中藥」（壞字），同欄兩處「**幹**薑／**幹**漆」；食療「9～15克，**可調整至30克**」= 入藥上限 2 倍；反烏頭只在 `cautions_zh`，`contraindications_zh` 不存在 |
| 2 | `herb.chuan_bei_mu` | 川貝母 | partial/draft | **DEFECT** | `modern_functions_zh[0] 降血糖`，同卡 `modern_functions_detail_zh[5]` 寫「川貝母鹼具有**升高血糖**的作用」；十八反寫成「**減弱藥效**」（H-04 同型） |
| 3 | `herb.zhe_bei_mu` | 浙貝母 | partial/draft | **DEFECT** | **整張卡是川貝母的複製件**：5/5 `cautions_zh` 主詞寫「川貝母」、6/6 藥理長文全在講川貝母；`properties_taste_temp` 是英文佔位句且**會直接渲染成性味** |
| 4 | `herb.bai_ji` | 白及 | partial/draft | **DEFECT** | `functions_zh[1] 活血化瘀` 出現在一味收斂止血藥上；同卡三種寫法 白及／**白笈**／**白芨**；3 筆 `related_formulas` 全不含本味，且全庫含白及的方是 0 首 |
| 5 | `herb.hai_zao` | 海藻 | **template**/draft | **CLEAN** | 十八反反甘草寫在 `contraindications_zh[0]`，與甘草卡方向一致 —— **本批唯一互相對得上的配伍組**；唯一小疵見 H-35 |
| 6 | `herb.wu_ling_zhi` | 五靈脂 | partial/**source_checked** | **DEFECT** | 同一組配伍在同一張卡上出現三種關係詞：`cautions_zh[0] 反人參`、`safety_info.contraindications_zh[0] 畏人參`、`safety_info.cautions_zh[0] 五靈脂**反畏**人參`；且與人參卡方向相反 |
| 7 | `herb.yu_jin` | 鬱金 | partial/**source_checked** | **DEFECT** | 別名串含「**烏頭**」；`cautions_zh` 兩處寫「鬱金**性溫**」與本卡 `寒` 相反；同卡 `孕婦禁用` 與 `孕婦慎用` 並存；來源分裂（識別欄 CloudTCM 1257、注意事項欄 1235）；9 筆 `related_formulas` 全錯 |
| 8 | `herb.ding_xiang` | 丁香 | partial/draft | **DEFECT** | `properties_taste_temp 辛、無毒、**熱**、**溫**`；`cautions_zh[2]` 叫「脾胃虛寒者避免使用」——那正是本味的主治；記錄 1-3克，`dosage_g` 不存在 |
| 9 | `herb.dan_shen` | 丹參 | partial/**source_checked** | **DEFECT** | `functions_zh` 11 條含 `止血`＋`活血化瘀`＋`補氣`＋`保肝`，而 `actions_en` 只有 4 條（對應的是 `traditional_functions_zh`）；`cautions_zh[4]` 的機轉與結論自相矛盾（見 H-30） |
| 10 | `herb.xuan_shen` | 玄參 | partial/draft | **DEFECT** | `functions_zh[4] 利水消腫`（非本味功效）；`cautions_zh[1]` 是未加註的古文「餌之噎人喉，**喪人目**」；反藜蘆在慎用欄，禁忌欄不存在；全卡 0 條英文 |
| 11 | `herb.ba_dou` | 巴豆 | **template**/draft | **CLEAN** | 全庫毒藥卡的標竿：0.1–0.3g 巴豆霜、不可煎、限 1–2 劑、孕哺禁、中英 5/5，`related_formulas_note` 誠實說明為何留空 |
| 12 | `herb.tian_nan_xing` | 天南星 | **template**/draft | **DEFECT** | `dosage_g` 是**字串**不是物件，渲染器 `dose.standard_daily_g` 取不到 → 卡片顯示「待補」，而 `3–10g（僅限炮製品）` 就在同一欄；食療用量範圍 `3-6克` |
| 13 | `herb.chuan_lian_zi` | 川楝子 | partial/draft | **DEFECT** | `孕婦和哺乳期婦女禁用` 在 `cautions_zh`，`contraindications_zh` 不存在；帶 `liver_disease_review` 但全卡無肝毒性敘述；`functions_zh[3] 益腸胃` |
| 14 | `herb.ku_lian_pi` | 苦楝皮 | partial/draft | **DEFECT** | `clinical_use_note` 宣稱本味抑制**人免疫缺陷病毒、鼠疫桿菌、炭疽桿菌**，並把細菌列進「抗真菌作用」；同欄性味歸經與本卡三處不符（H-27） |
| 15 | `herb.bing_lang` | 檳榔 | partial/draft | **DEFECT** | 食療用量範圍 `3-6克（**日常消食**）`＋`modern_functions_zh[1] **減肥減重**`，全卡 0 字提及口腔癌/嚼食致癌（H-28） |
| 16 | `herb.ku_shen` | 苦參 | partial/draft | **DEFECT** | `functions_zh[3] 生津止渴` 與同卡 `cautions_zh[3]`「本品苦寒**傷胃、傷陰**」相反；`clinical_use_note` 含 `補血養肝` 污染標籤；禁忌欄不存在 |
| 17 | `herb.wu_zhu_yu` | 吳茱萸 | partial/draft | **DEFECT** | 8 條 `contraindications_zh` ＋ 6 條 `cautions_zh` **全部 14 條沒有一個孕字**，而同卡 `modern_functions_zh[10]` 就是「**興奮子宮**」（H-29） |
| 18 | `herb.he_shou_wu` | 何首烏 | partial/draft | **DEFECT** | 帶 `liver_disease_review`＋`toxicity_review`，卻把 `保肝` 列為功效、`保肝利膽` 列為現代藥理，全卡 0 字肝損傷；食療 6-15克 > 入藥 6-12克 |
| 19 | `herb.liu_huang` | 硫黃 | partial/draft | **CLEAN** | 外用與內服劑量/安全完全分開，經皮吸收過量風險寫進禁忌，中英 4/4・8/8・5/5・3/3 全對齊 |
| 20 | `herb.chuan_mu_tong` | 川木通 | partial/draft | **CLEAN** | 品種混淆處理典範：關木通毒性明標為「品種差異、不可套用」，促乳古方的穿山甲主動標為保育禁藥 |
| 21 | `herb.xi_jiao` | 犀角 | partial/draft | **CLEAN** | `review_notes_zh` 明寫課件那行 Bitter/salty/cold 是**水牛角**的、拒絕搬進犀角，性味歸經整組留空；7/7 `related_formulas` 全部正確、0 漏 |
| 22 | `herb.she_xiang` | 麝香 | partial/**sourced_cloudtcm_record** | **DEFECT** | 全卡 29 欄、`field_sources` 是 `{}`、`safety_flags` 整欄不存在、無任何劑量欄；`public_safe: true`（H-33） |
| 23 | `herb.huang_qin` | 黃芩 | partial/draft | **DEFECT** | `functions_zh` 13 條含 `瀉下`・`利水`；`安胎` 是本味功效卻同時寫「孕婦慎用：可能對胎兒造成影響」且無證型限定；禁忌欄不存在；31 筆 `related_formulas` 有 19 筆不含黃芩 |
| 24 | `herb.chuan_xiong` | 川芎 | partial/**source_checked** | **DEFECT** | `functions_zh[5] 補血`・`[6] 強筋骨`；`cautions_zh[1]` 與 `[6]` 逐字重複；`channels_zh` 寫**心包經**、`tcm_properties.meridian_tropism_zh` 寫**心經**；來源分裂 988/997，且 988 同時被赤芍卡宣稱 |
| 25 | `herb.sheng_di_huang` | 生地黃 | partial/draft | **DEFECT** | `functions_zh[2] 補血`（那是熟地的功效，是板考最常見的鑑別題）；`畏蕪荑（**柳絮**）` 註錯基原；銅鐵器接觸「可能**損傷腎臟**」查無來源；食療 10-30克 > 入藥 9-15克 |
| 26 | `herb.shu_di_huang` | 熟地黃 | partial/draft | MINOR | `cautions_zh[2]`「勿用銅鐵器…以免影響腎臟功能，甚至導致**白髮脫落**」——與本味主治「須發早白」正相反；`功效` 含 `滋補養生`・`延緩衰老`；禁忌欄不存在 |
| 27 | `herb.chen_pi` | 陳皮 | **template**/draft | MINOR | 本批 CloudTCM 系最好的卡之一：中英 4/4・9/9・2/2・5/5，`clinical_use_note` 是真正的鑑別筆記（陳皮 vs 青皮）；唯一疵：`modern_functions_zh[2] 升高血壓` 沒有配套注意 |
| 28 | `herb.gui_zhi` | 桂枝 | **template**/draft | **DEFECT** | `clinical_use_note` 寫「發汗解表,**風寒表實證**」，與同卡 `indications_zh[0]` 的「風寒**表虛**」和 `exam_pearl` 的「表虛有汗亦可用」相反 —— 正是本味最常考的那一題；`safety_review_pending` 是**字串**不是布林 |
| 29 | `herb.huang_lian` | 黃連 | partial/draft | **DEFECT** | `cautions_zh[3]`：「成人每日服用 **12g**，連續 3 周，或連續服用總量達 **100g**，均未見副作用。」——同卡 `dosage.一般建議` 是 **2-5克**（H-31） |
| 30 | `herb.chai_hu` | 柴胡 | **template**/draft | MINOR | 本批來源紀律最好的 CloudTCM 系卡（禁忌逐條標來源、注射劑與煎劑分層、孕期標為「CloudTCM 有、課件/AD 無」的來源差異）；疵在 `clinical_use_note` 仍是原文傾倒且含 `平肝息風`，與本卡「肝陽上亢禁用」相反 |

**CLEAN 5 · MINOR 3 · DEFECT 22。**

分佈：**5 張 CLEAN 全部是 Codex/Claude 的模板級補卡**
（`full_card_verified_multi_source` ×2、`multi_source_curriculum_cloudtcm_american_dragon` ×1、
`formula_ingredient_gap_fill` ×1、無 `source_type` ×1）；
**22 張 DEFECT 有 20 張是 `sourced_cloudtcm_record`**（CloudTCM 原樣落地層）。
批次一是 13 DEFECT / 11 張 CloudTCM。**兩批合計 35 DEFECT，31 張出自同一層。**

---

## §2 逐條 findings（接續 H-25）

### H-25 — 十八反／十九畏是一個**方向與詞彙都不受控**的欄位族 · **SAFETY**

批次一 H-04 記錄了甘遂/甘草一組方向相反，並判斷「這是一個 class」。
本批把已知配伍的**對造卡成對取出**，結論是：**是 class，而且比批次一看到的更亂。**
以「十八反|十九畏|相反|反烏頭|反甘草|反藜蘆|畏」全庫檢索，逐組列出兩側原文：

**（A）烏頭 反 貝母 —— 兩側方向不一致，且「反」被講成療效問題**

- `herb.chuan_wu` `clinical_use_note`（批次一已讀，正確）：
  > 「…十八反（半夏、瓜蔞、貝母、白及、白蘞）。」
- `herb.chuan_bei_mu` `cautions_zh[1]`：
  > 「不宜與烏頭類藥材同用。 原因：川貝母與烏頭類藥材存在相反藥性，同時服用會**減弱藥效**或產生不良反應。」
- `herb.gua_lou` `cautions_zh[5]`（同一組配伍，方向正確）：
  > 「反烏頭：瓜蔞性寒滑，烏頭性大熱，兩藥相配易引起**毒性反應**。」

同一組十八反，貝母側寫「減弱藥效」、瓜蔞側寫「毒性反應」。
**與批次一 H-04（甘遂寫「降低瀉下作用」、甘草寫「禁止同用」）完全同型 —— 第二個實例，class 成立。**

**（B）同一組配伍在不同卡上落在不同欄位（禁忌 vs 慎用）**

| 卡 | 欄位 | 原文 |
|---|---|---|
| `herb.gua_lou`（瓜蔞） | `cautions_zh[5]` | 反烏頭：… |
| `herb.gua_lou_pi`（栝樓皮） | **`contraindications_zh[2]`** | 與烏頭類相反，不可同用。 |
| `herb.gua_lou_ren`（栝樓仁） | **`contraindications_zh[3]`** | 與烏頭類相反，不可同用。 |
| `herb.bai_ji`（白及） | `cautions_zh[3]` | 反烏頭。（《蜀本草》） |
| `herb.tian_hua_fen`（天花粉） | `cautions_zh[1]` | 脾胃虛寒大便滑洩者忌服：反烏頭。 |

同一株植物的三個藥用部位（瓜蔞・栝樓皮・栝樓仁），同一句十八反，
**一個在慎用格、兩個在禁忌格**。天花粉那條更把十八反黏在一句與它無關的脾胃虛寒句尾。

**（C）十九畏 —— 兩張卡各自宣稱自己是「畏」的一方，且英譯把 `畏` 譯成 `antagonize`**

| 卡 | 欄位 | 原文 |
|---|---|---|
| `herb.ren_shen`（批次一已讀） | `contraindications_zh[1]` | 十九畏：**畏五靈脂**，禁止同用（五靈脂阻礙人參吸收）。 |
| `herb.wu_ling_zhi` | `safety_info.contraindications_zh[0]` | **畏人參**（十九畏禁忌） |
| `herb.wu_ling_zhi` | `cautions_zh[0]` | **反人參** |
| `herb.wu_ling_zhi` | `safety_info.cautions_zh[0]` | 「五靈脂**反畏**人參（Wu Ling Zhi **antagonizes** Ren Shen），嚴禁同方！」 |
| `herb.wu_ling_zhi` | `safety_info.toxicity_zh` | 「無毒。**畏人參**（**人參畏五靈脂** - 十九畏！），嚴禁同用！」 |

最後一條在同一個句子裡同時寫了兩個方向。
`反畏` 不是七情裡的詞；`antagonizes` 是 `相反` 的英譯，不是 `畏`。
丁香/鬱金組完全同型：

| 卡 | 欄位 | 原文 |
|---|---|---|
| `herb.ding_xiang` | `contraindications_zh[0]` | **畏鬱金**，熱病及陰虛內熱者忌服。 |
| `herb.ding_xiang` | `contraindications_zh[1]` | 不可見火，**畏鬱金**。（同卡重複） |
| `herb.yu_jin` | `safety_info.contraindications_zh[0]` | **畏丁香**（十九畏） |
| `herb.yu_jin` | `safety_info.toxicity_zh` | 「無毒。**畏丁香**（**丁香畏鬱金** - 十九畏），不可同用！」 |
| `herb.yu_jin` | `safety_info.cautions_zh[0]` | 「鬱金**反畏**丁香（Yu Jin **counteracts** Ding Xiang），臨床嚴禁二者同方！」 |

**（D）唯一對得上的一組：甘草 反 海藻。**

- `herb.gan_cao` `contraindications_zh[0]`（批次一）：「十八反：反甘遂、京大戟、芫花、海藻，禁止同用。」
- `herb.hai_zao` `contraindications_zh[0]`（本批）：「與甘草相反，不可同用。」
  ＋ `exam_pearl`：「看到甘草同用要警覺十八反。」

**兩側都在禁忌欄、方向一致、都標了十八反 —— 全庫目前唯一乾淨的一組。**
它也是 §1 五張 CLEAN 之一、`source_type: full_card_verified_multi_source`。

**（E）順帶：炙甘草的那一條漏了否定詞。**
`herb.zhi_gan_cao` `contraindications_zh[3]`：

> 「**同用**甘遂、大戟、海藻、芫花（十八反）」

同卡 `cautions_zh[2]` 寫的是正確的「**不可與**甘遂、大戟、海藻、芫花同用（十八反）」。
禁忌格渲染的是前者 —— 一句字面上叫人合用的話，出現在寫著「禁忌症」的框裡。
批次一把炙甘草判為 DEFECT（`card_grade: gold` 但無 `field_sources`），**這一條沒有被抓到。**

**（F）`畏` 的語意在全庫是不受控的**：本批與鄰卡並列 ——
`herb.sheng_di_huang`「畏蕪荑…會**削弱**生地黃的功效」、
`herb.ze_xie`「畏海蛤、文蛤…可能**導致中毒**」、
`herb.chuan_xiong`「惡黃連…以免**降低療效**」。
同一個關係詞，一處是療效減弱、一處是中毒。

### H-26 — 浙貝母整張卡是川貝母的複製件 · **CLINICAL**

`herb.zhe_bei_mu` 的 5 條 `cautions_zh` **主詞全部是「川貝母」**：

> `[0]` 脾胃虛寒及寒痰、濕痰者慎服。 原因：**川貝母**性涼，容易損傷脾胃虛寒者的脾胃…
> `[1]` 不宜與烏頭類藥材同用。 原因：**川貝母**與烏頭類藥材存在相反藥性…
> `[2]` 脾胃虛寒者不宜。 原因：**川貝母**性涼…
> `[3]` 腹瀉或腹脹者不宜。 原因：**川貝母**具有潤滑**用**…（比川貝母卡的「潤滑作用」少一字）
> `[4]` 孕婦、哺乳期婦女慎用。 原因：**川貝母**具有一定的刺激性…

6 條 `modern_functions_detail_zh` 藥理長文全在講川貝母的成分
（川貝鹼・川貝皁苷・川貝素・川貝黃酮・湖北貝母），**「浙貝母」三個字在全卡藥理文中 0 次**。
機器計數：本卡自身藥名出現 **0 次**，川貝母出現 **31 次**。
`functions_zh` 8 條與川貝母卡逐字相同，包含 `安神`。

臨床後果具體且是板考核心：川貝 vs 浙貝的鑑別點就是**川貝甘潤偏潤肺（虛勞燥咳）、
浙貝苦寒偏清熱散結（外感瘡癰）**。這張卡把兩味藥的差別整個抹掉了。

同卡另有三處英文佔位句落在中文欄位（憲法第五條）：

> `properties_taste_temp` = `Draft: warm/cool/bitter/acrid depending on herb; verify individual taste and temperature.`
> `clinical_use_note` = `Draft study context: respiratory tags are documentation/search aids, not treatment claims.`
> `chinese_depth_track.summary_zh` = `Draft Chinese-depth note pending CloudTCM or institutional Chinese source review.`

**第一條會實際顯示在卡片上。** `js/knowledge.js:1540` 是
`props.four_natures_zh || usableText(record.properties_taste_temp || record.taste_temperature_zh) || "待補"`；
本卡 `tcm_properties` 不存在 → `props = {}`；`usableText`（同檔 439–442 行）
只過濾 `??` 與 U+FFFD，英文句照過。
**所以浙貝母卡的「性味」欄目前顯示的是一句英文佔位句，內容還是「depending on herb」——
在一張單味藥卡上。** 這是本批唯一一條已確認「肉眼可見於卡片」的缺陷。

### H-27 — `clinical_use_note` 不只是傾倒，還會**推翻本卡的性味歸經** · **CLINICAL**

批次一 H-16 記錄了 182 筆 `clinical_use_note` 逐字等於 CloudTCM summary，
H-08 記錄了木通的學習筆記與本卡歸經矛盾。本批確認**後者也是 class，不是孤例**：

`herb.ku_lian_pi`（苦楝皮）`clinical_use_note`：

> 「苦楝皮，為楝科植物苦楝的樹皮。…**苦、辛，平。有小毒。歸肝、大腸經。**」

同卡自己的欄位：`properties_taste_temp` = **`苦、寒、有毒`**；
`channels_zh` = **`脾經、胃經、肝經`**。
→ 溫度（平 vs 寒）、毒性等級（小毒 vs 有毒）、歸經（肝大腸 vs 脾胃肝）**三項全部相反**。

`herb.gui_zhi`（桂枝，`card_grade: template`）`clinical_use_note`：

> 「桂枝是中藥…功效:發汗解表,**風寒表實證**,辛溫行散…」

同卡 `indications_zh[0]` = 「風寒**表虛**、營衛不和（汗出惡風）——配 白芍、生薑、大棗」；
`exam_pearl` = 「比較麻黃：桂枝偏解肌、調和營衛，**表虛有汗亦可用**」。
→ **模板第 11.5 區的必填學習筆記，寫的是本味最常考那一題的錯誤答案。**

`herb.chai_hu`（柴胡，`card_grade: template`）`clinical_use_note` 含 `平肝息風`，
同卡 `contraindications_zh[2]` 是「肝火或肝陽上亢上衝頭面者**禁用**（American Dragon）」。

本批 30 味中 `clinical_use_note` 逐字等於 `chinese_depth_track.summary_zh` 的有 **21 味**
（批次一 13 味；全庫 182）。**兩批合計 34/60。**

### H-28 — 檳榔：食療劑量＋減肥標籤，全卡無致癌警語 · **SAFETY**

`herb.bing_lang` `dosage`：

> `一般建議`：`3-10克`
> `食療用量範圍`：**`3-6克（日常消食）`**
> `特殊說明`：`驅蟲用量較大，可達**30-60克**，需在醫師指導下使用；單味驅蟲時需空腹服用`

`modern_functions_zh`：`["抗菌抗病毒", "**減肥減重**", "抗發炎"]`

`safety_flags` 有 `toxicity_review` 與 `gi_red_flags`。
以 `癌|致癌|口腔|嚼|檳榔子|IARC` 全卡檢索：**0 命中**。
6 條 `cautions_zh` 講的是氣虛下陷、心臟病、高血壓、胃潰瘍、精神病；
孕婦那條只寫「檳榔中含有有害物質，會影響胎兒或嬰兒的健康」——**沒有禁/慎的動詞**。
`contraindications_zh` 不存在。

這是批次一 H-02（食療用量欄）在本批的最壞案例，而且方向和全蠍不同：
全蠍那條至少標了「用量過大可能導致中毒」；
**檳榔這張卡同時給了「日常消食」的每日食用量、一個減重的功效標籤，和零句致癌敘述。**
`夾在中間的 30-60克` 因為 `dosage_g` 不存在，同樣不會顯示。

同族本批另兩筆：
- `herb.he_shou_wu`（何首烏）：食療 `6-15克` > 入藥 `6-12克`，卡上帶
  `liver_disease_review` + `toxicity_review`，而 `functions_zh[9] 保肝`、
  `modern_functions_zh[3] 保肝利膽`，**全卡 0 字肝損傷**。
- `herb.tian_nan_xing`（天南星）：食療 `3-6克`，同卡 `cautions` 原文塊列
  「嚴重者可出現昏迷，驚厥／窒息，呼吸停止」。

全庫食療上限 > 入藥上限的筆數：**75**（批次一報 77；差 2 筆來自本輪改用
「取字串中最大數字」的解析法，把 `3-5段（約10-30克）` 這類混合單位算進來的口徑差，
非資料變動）。本批命中 6 筆：瓜蔞・鬱金・何首烏・黃芩・生地黃・熟地黃。

### H-29 — 吳茱萸：全卡 14 條安全敘述無一個孕字，同卡卻列「興奮子宮」 · **SAFETY**

`herb.wu_zhu_yu` `safety_flags[0] = pregnancy_review`。
`contraindications_zh` 8 條（全部是古籍證型排除：陰虛火旺、胃火、血虛有火…）、
`cautions_zh` 6 條（腸虛泄、走氣動火昏目發瘡、陰虛、脾胃虛弱、中毒、抗凝血交互）。
以 `孕|妊娠|哺乳` 檢索這 14 條：**0 命中**。
而同卡 `modern_functions_zh[10]` 就是 **`興奮子宮`**。

**本卡自己提供了孕期風險的機轉，安全欄卻一個字都沒有。**
與批次一 H-15（當歸帶 `pregnancy_review`、14 條安全敘述無孕字）同型，
但當歸至少沒有在卡上寫「興奮子宮」。

同卡 `cautions_zh[1]` 是未加註的古文片語：「走氣、動火、昏目、發瘡。」
（`herb.xuan_shen` `cautions_zh[1]`「使用時勿令犯銅，**餌之噎人喉，喪人目**」同型。）

本批 30 味中「安全欄完全沒有孕期敘述」的：吳茱萸 1 味。
「禁/慎級語句只落在 `cautions_zh`、`contraindications_zh` 整欄不存在」的：**15 味**
（瓜蔞・川貝母・浙貝母・白及・玄參・川楝子・苦楝皮・檳榔・苦參・何首烏・麝香・黃芩・生地黃・熟地黃・黃連），
全庫 198/358（與批次一同數，本批未新增計算）。

### H-30 — 現代藥理標籤與同卡的注意事項／原文互相打臉 · **CLINICAL**

三個實例，都在渲染欄位上：

**（1）川貝母：降血糖 vs 升高血糖。**
`modern_functions_zh[0]` = `降血糖`（會渲染成一個藥理標籤）；
同卡 `modern_functions_detail_zh[5].analysis_zh`（同一個 CloudTCM 來源）：

> 「**對血糖的影響：** 川貝母鹼具有**升高血糖**的作用。在兔子的實驗中，靜脈注射 7.5mg/kg 的川貝母鹼，
> 可以觀察到血糖顯著升高，且此作用能持續超過 2 小時。」

同一張卡，標籤說降、證據說升。（浙貝母卡因為是複製件，同樣帶這一對。）

**（2）丹參：降血壓標籤 vs 高血壓禁用，且理由自我矛盾。**
`modern_functions_zh[8]` = `降血壓`；`cautions_zh[4]`：

> 「血壓過高者忌用：丹參**擴張血管**，血壓過高者使用恐導致**血壓進一步升高**。」

前半句的機轉（擴張血管）推不出後半句的結論（血壓升高），
而且與同卡的 `降血壓` 標籤方向相反。

**（3）何首烏：保肝標籤 vs `liver_disease_review` flag。** 見 H-28。

同族但只到 QUALITY 級：`herb.chen_pi` `modern_functions_zh[2] = 升高血壓`
（陳皮是本批第二好的卡，此條沒有任何配套注意）；
`herb.ku_shen` `modern_functions_zh[5] = 抗心律失常`（苦參鹼的心臟毒性是已知議題，
本卡把心律相關作用只寫成一個療效標籤，無風險側敘述）。

### H-31 — 黃連的「注意事項」欄裡有一句給藥許可 · **SAFETY**

`herb.huang_lian` `cautions_zh[3]`：

> 「成人每日服用 **12g**，連續 **3 周**，或連續服用總量達 **100g**，均**未見副作用**。」

同卡 `dosage.一般建議` 是 **`2-5克`**，`特殊說明` 是「研末沖服用量減半；脾胃虛寒者忌用」。
→ **卡片標題寫「慎用與副作用」的那一格裡，有一句話告訴讀者
本味的 2.4–6 倍日劑量、連續三週是安全的。**
`dosage_g` 不存在，所以劑量格現在顯示「待補」（HB-1 之後），
使用者唯一看得到的具體數字就是這句 12g。

同欄 `[4]`–`[7]` 是小檗鹼注射劑的毒性資料（過敏性休克、血小板減少），
與煎劑口服混在同一個陣列裡未分層 —— 對照組是 `herb.chai_hu` `cautions_zh[3]`，
明確寫「此為**注射劑**安全資訊，**不等同煎劑**常規禁忌」。**同一種問題，一張卡處理了，一張沒有。**

### H-32 — `functions_zh`（渲染唯一真相）被污染，而乾淨的版本躺在備援欄 · **CLINICAL**

模板 §「功效欄位的唯一真相是 `functions_zh`」，並點名麻黃出過
「`functions_zh` 與 `traditional_functions_zh` 不一致」的問題。本批四張卡是同一個病，
而且**乾淨的那一份就在同一張卡上**：

| id | `functions_zh`（渲染） | `traditional_functions_zh`（備援，正確） | `actions_en` 對齊誰 |
|---|---|---|---|
| `herb.yu_jin` 鬱金 | 9 條，含 `止血`＋`活血化瘀`（相反）、`化腐生肌`、`保肝`、`利膽` | 4 條：活血止痛・行氣解鬱・清心涼血・利膽退黃 | **4 條，對齊備援欄** |
| `herb.dan_shen` 丹參 | 11 條，含 `止血`＋`活血化瘀`、`補氣`、`保肝` | 4 條：活血祛瘀・涼血消癰・清心除煩・養血安神 | **4 條，對齊備援欄** |
| `herb.chuan_xiong` 川芎 | 7 條，含 `補血`、`強筋骨`、`燥濕` | 2 條：活血行氣・祛風止痛 | **2 條，對齊備援欄** |
| `herb.wu_ling_zhi` 五靈脂 | 1 條（合併串） | 2 條：活血止痛・化瘀止血 | 2 條 |

四張卡都是 `review_status: source_checked`。
結果是中英標籤長度不等（9/4・11/4・7/2・1/2），違反憲法第五條；
渲染時 `functions_zh` 出 9 個中文標籤配 4 個英文，**逐項配對必然錯位**。
全庫 `functions_zh` 長度 ≠ `actions_en` 長度：**32 筆**；
`functions_zh` 有值而 `actions_en` 整欄不存在：**177 筆**（本批 15 味）。

其餘「功效欄放進非本味功效」的本批實例（無備援欄可比對）：
`herb.bai_ji` 白及 `活血化瘀`（收斂止血藥）·
`herb.sheng_di_huang` 生地黃 `補血`（那是熟地）·
`herb.xuan_shen` 玄參 `利水消腫` ·
`herb.ku_shen` 苦參 `生津止渴`＋`平喘止喘` ·
`herb.huang_qin` 黃芩 `瀉下`＋`利水` · `herb.huang_lian` 黃連 `止血`＋`解痙` ·
`herb.chuan_lian_zi` 川楝子 `益腸胃` · `herb.he_shou_wu` 何首烏 `補氣` ·
`herb.shu_di_huang` 熟地黃 `滋補養生`＋`延緩衰老`。
本批 `functions_zh` > 6 條的有 **12 味**（黃芩 13、丹參 11、何首烏 11、苦參 10、黃連 9、鬱金 9…）。

### H-33 — 麝香：29 個欄位、`field_sources` 空、無 `safety_flags`、無劑量、`public_safe: true` · **SAFETY**

`herb.she_xiang` 是本批最單薄的卡。整筆內容：

> `functions_zh[0]` = 開竅醒神、活血通經、止痛（一條合併串）
> `indications_zh[0]` = 開竅醒神；活血通經；止痛（與功效逐字重複）
> `cautions_zh[0]` = **孕婦禁用**
> `condition_tags_zh` = `[]` · `field_sources` = `{}` · `safety_flags` **整欄不存在**
> `dosage` 不存在 · `dosage_g` 不存在
> `public_safe` = **`true`** · `review_status` = **`sourced_cloudtcm_record`**
> `exact_source_url` = `https://www.americandragon.com`（裸網域，非條目頁）

四個問題疊在一起：
1. **麝香是 CITES 附錄 I 保育物種**。同批的犀角與穿山甲都帶
   `prohibited_endangered_species`＋`obsolete_substance`＋`ncbahm_appendix_d` 三個 flag、
   `public_safe: false`、且有完整替代策略。**麝香一個都沒有。**
2. `孕婦禁用`（絕對禁忌）落在 `cautions_zh`（慎用格），`contraindications_zh` 不存在。
3. 無任何劑量欄。麝香是全材料藥裡劑量最小的一群之一，HB-1 之前這張卡顯示 `6~15g`；
   HB-1 之後顯示「待補」—— **但這張卡本來就沒有任何劑量可補**，屬 H-01 的「空對空」子集。
4. `review_status` 填的是一個 `source_type` 的值。全庫 41 筆這樣填。

`public_safe === true` 全庫 **53 筆**，其中包含 `herb.she_xiang`（麝香）、
`herb.wu_ling_zhi`（五靈脂）、`herb.ling_yang_jiao`（羚羊角，CITES）、
`herb.shan_dou_gen`（山豆根，有毒）、`herb.lu_hui`（蘆薈）、`herb.fan_xie_ye`（番瀉葉）。
`public_safe` 三態分佈：`false` 286 · `true` 53 · **欄位不存在 19**
（本批的 `herb.zhe_bei_mu`、`herb.chuan_mu_tong` 在內）。
批次一 H-07 已把「欄位不存在」列為送 Ting 的三態指針問題；**本批給出全庫數字：19。**

### H-34 — 21 張卡的 `field_sources` 指向與識別欄不同的 CloudTCM 條目，其中 6 個 id 被兩張卡同時宣稱 · **來源紀律**

模板 §2.5：「逐欄引用 + 顯示引用，`field_sources` 每欄一筆，網站用完整 URL」。
本批讀到鬱金的 `field_sources` 時發現：性味/歸經/功效/主治/對藥指向
`https://cloudtcm.com/herb/1257`，但 **`cautions_zh`、`modern_functions_zh`、
`modern_functions_detail_zh` 三欄指向 `https://cloudtcm.com/herb/1235`**。
機器展開全庫，這是 **21 張卡**的共同形態（`exact_source_url` 與 `cloudtcm_url` 也同步分裂）：

```
生薑 1171/6 · 豬苓 1269/1248 · 澤瀉 1242/1239 · 薏苡仁 1263/1229 · 車前子 991/985
滑石 1060/1075 · 川芎 988/997 · 延胡索 1256/1225 · 鬱金 1257/1235 · 丹參 999/1009
紅花 1070/1066 · 王不留行 1225/1197 · 莪朮 1012/1026 · 三棱 1154/1150 · 雞血藤 1075/1514
五味子 1247/1204 · 乳香 1151/1149 · 沒藥 1118/1119 · 益母草 1260/1227 · 澤蘭 1243/1238
肉豆蔻 1150/12610
```
**21 張裡有 20 張是 `review_status: source_checked`** —— 也就是說，
這個形態幾乎完全重疊於「被標記為已核源」的那一群。

更嚴重的是 **id 撞號**：至少 6 個 CloudTCM id 被兩張不同的中藥卡同時宣稱為自己的來源頁 ——

| CloudTCM id | 宣稱它的卡 |
|---|---|
| 988 | **赤芍**（`cloudtcm_url`）與 **川芎**（`cloudtcm_url`） |
| 1060 | **海藻**（`source_urls[0]`）與 **滑石**（`cloudtcm_url`） |
| 1075 | **滑石**（foreign）與 **雞血藤**（`cloudtcm_url`） |
| 1248 | **豬苓**（foreign）與 **烏梅** |
| 1225 | **延胡索**（`cloudtcm_url`）與 **王不留行**（`cloudtcm_url`） |
| 1150 | **三棱**（foreign）與 **肉豆蔻**（`cloudtcm_url`） |

一個 id 只能對應 CloudTCM 上的一味藥，所以每一組撞號代表**至少有一張卡的整份逐欄來源錨點指向別的藥**。

鬱金這張卡給出了這個問題的臨床代價：來自 1235 的 `cautions_zh` 有兩條寫
「**鬱金性溫**」（`[2]` 胃虛血虛者忌服、`[7]` 腸胃不適患者禁用），
而本卡 `properties_taste_temp` 是 `辛、寒、苦`、`tcm_properties.four_natures_zh` 是 `寒`。
**性溫是薑黃的性質，不是鬱金的**；同卡藥理長文提到「薑黃」8 次。
`herb.chuan_xiong` 同型（識別 988，注意事項/藥理 997，而 988 又被赤芍宣稱）。

本 ledger 不判定哪一張卡是對的 —— 那要開頁核對，屬 Ting/RV1。
只記錄：**`field_sources` 目前不能被當成可信的來源錨點，21 張卡分裂、6 個 id 撞號。**

### H-35 — 欄位型別漂移：`dosage_g` 是字串、`tcm_properties` 是字串、`safety_review_pending` 是字串 · **QUALITY→SAFETY 前置**

批次一 H-20 記錄了 `dosage` 一欄四種形狀。本批把型別檢查推到**其他安全相關欄位**，
發現同型問題，而且其中一個有可見後果：

**（1）`dosage_g` 是字串（全庫 7 張）** ——
`herb.ma_huang`（麻黃）· `herb.ban_xia`（半夏）· **`herb.tian_nan_xing`（天南星）** ·
`herb.jie_geng`（桔梗）· `herb.xuan_fu_hua`（旋覆花）· `herb.bai_jie_zi`（白芥子）· `herb.bai_fu_zi`（白附子）。

渲染器 `js/knowledge.js` 是 `dose = record.dosage_g || {}` 再取 `dose.standard_daily_g`。
**字串上取 `.standard_daily_g` 得 `undefined`**，於是 HB-1 之後這 7 張卡的劑量格顯示「待補」，
而真正的劑量就在那個字串裡：

> `herb.tian_nan_xing.dosage_g` = `"3–10g（僅限炮製品；膽南星 2–5g）"`

天南星帶 `toxicity_review` + `dose_preparation_review`，`card_grade: template`。
**一張把「僅限炮製品」寫進劑量欄的毒藥卡，因為型別錯了，那句話一個字都到不了卡片上。**
麻黃、半夏、白附子三張也在這 7 張裡，全部是安全相關藥。
這 7 張**不在**批次一 H-01 的「200 筆缺 `standard_daily_g`」統計裡（欄位存在），
所以是一個**未被計數過的獨立子集**。

**（2）`tcm_properties` 是字串（全庫 10 張）** —— 含本批的 `herb.chuan_mu_tong`：

> `tcm_properties` = `"苦，微寒/涼；課件作 bitter, cool；Extra Herbs 作 bitter, slightly cold；American Dragon / CloudTCM 亦以苦寒或微寒為主。"`

渲染器 `props.four_natures_zh` 取到 `undefined` → 回退到 `record.properties_taste_temp`，
剛好也是對的，所以**目前沒有可見損害** —— 但這是靠回退鏈救回來的，不是靠資料正確。

**（3）`safety_review_pending` 型別三分：布林 58 · 字串 14 · 欄位不存在 286。**
本批的 `herb.ba_dou`、`herb.chuan_mu_tong` 是 `true`（布林）；
`herb.gui_zhi` 是字串：

> `safety_review_pending` = `"課件與 American Dragon 對妊娠／經量過多的禁忌強度不同，已並列，須 Ting 優先審核。"`

任何寫成 `if (r.safety_review_pending === true)` 的 predicate 會漏掉這 14 張；
寫成 truthiness 的會把 14 張連同 58 張一起收進來。**同一個欄位不能既是旗標又是說明文字。**

### H-36 — 三種壞字：`_zh` 欄位裡的形近字、簡繁轉換殘留、與註錯基原 · **QUALITY**

批次一 H-15 抓到當歸的「惡**葛蒲**」（菖蒲的壞字），並指出中英長度檢查抓不到。
本批四個新實例，全部只有讀中文才看得見：

| 卡 | 欄位 | 原文 | 應為 |
|---|---|---|---|
| `herb.gua_lou` 瓜蔞 | `clinical_use_note`（＝`summary_zh`） | 「**瓜簍**是中藥，別名:…」 | 瓜蔞 |
| `herb.gua_lou` 瓜蔞 | `cautions_zh[3]` `[4]` | 「惡**幹薑**」「畏牛膝、**幹漆**」 | 乾薑／乾漆（簡繁轉換：幹≠乾） |
| `herb.bai_ji` 白及 | `clinical_use_note`・`cautions` 標題・藥理文 ×2 | 「**白笈**是中藥」／「**白芨**的抗潰瘍作用」 | 白及（同卡三種寫法並存） |
| `herb.sheng_di_huang` 生地黃 | `cautions_zh[4]` | 「畏蕪荑（**柳絮**）」 | 蕪荑 = 榆科榆樹種子發酵品，非柳絮 |

模板 §1.5 的藥名自動連結靠 `name_zh` + `aliases_zh` 建索引：
**瓜簍、白笈、幹薑、幹漆永遠連不上**，而 `herb.bai_ji` 的 `aliases_zh` 是 `[]`。

同族但性質不同的一條：`herb.yu_jin`（鬱金）的別名串裡有 **`烏頭`**：

> `clinical_use_note` = 「鬱金是中藥，別名:白絲郁金,五帝足,黃鬱,馬蒁,郁金,**烏頭**,黃郁,白絲鬱金,鬱金,玉金…」

烏頭是十八反的核心毒藥。所幸本卡 `aliases_zh` 是 `[]`，索引不吃這一串，
**但它會照原樣顯示在必填的學習筆記區。**

### H-37 — 苦楝皮的學習筆記是機器生成的藥效清單，宣稱抑制 HIV、鼠疫與炭疽 · **SAFETY / 來源紀律**

`herb.ku_lian_pi` `clinical_use_note`（＝`chinese_depth_track.summary_zh`，
`field_sources` 指向 `https://cloudtcm.com/herb/6540`）節錄：

> 「**抗病毒作用** 苦楝皮水煎液對流感病毒、腮腺炎病毒、麻疹病毒、水痘病毒、單純皰疹病毒、
> 乙型肝炎病毒、丙型肝炎病毒、**人免疫缺陷病毒**等均有抑制作用。」
>
> 「**抗真菌作用** 苦楝皮水煎液對白色念珠菌、黑麴黴菌、毛黴菌、麴黴菌、青黴菌、紅色毛黴菌、
> 石膏樣毛黴菌、黑真菌、**分枝桿菌、結核桿菌、炭疽桿菌、鼠疫桿菌、結核桿菌、淋病雙球菌**等均有抑制作用。」

兩個各自獨立的問題：
1. **內容**：宣稱一味驅蟲藥的水煎液抑制 HIV、鼠疫桿菌、炭疽桿菌。憲法第九條
   「不把不確定寫成確定（機轉 ≠ 療效、動物研究 ≠ 臨床證據）」。
2. **結構**：「抗真菌」段落列的 6 個菌名（分枝桿菌、結核桿菌、炭疽桿菌、鼠疫桿菌、
   結核桿菌、淋病雙球菌）**全是細菌，而且與上一段「抗菌作用」的清單逐字重複**，
   連「結核桿菌」在同一行出現兩次都照抄。這是模板填空式生成的殘留，不是抄錄自研究。

同卡 `functions_zh` 的 `止血`・`止癢`・`利尿` 三條就是從這段文字收割上來的（苦楝皮是驅蟲藥）。
`cautions_zh` 只有一條「孕婦及肝病患者忌用」，`contraindications_zh` 不存在，
而 `safety_flags` 有 `not_for_self_treatment` + `toxicity_review` + `dose_preparation_review`。

**這一條與批次一的樣板句掃描不同族**：批次一證明了「散文欄位沒有被 ≥5 張卡共用的樣板句」，
本條是**單張卡內部的模板填空**，跨卡掃描抓不到。

### H-38 — 十八反/十九畏點名的對造藥，有 6 味在 358 筆裡沒有卡 · **CLINICAL（缺口）**

批次一 H-24 記錄了水蛭缺卡。本批以「文本裡被點名為配伍禁忌對象」為判準展開，
發現這是一個**系統性缺口**，而且缺的正好是十八反的核心：

| 藥名 | 卡片 | 被幾張卡的禁忌/慎用/考點欄點名 | 點名者 |
|---|---|---|---|
| **藜蘆** | **不存在** | **13** | 防風・細辛・黃芩・玄參・赤芍・川芎・丹參・人參・黨參・白芍・西洋參・虎杖・巴豆 |
| **白蘞** | **不存在** | 4 | 附子・制川烏・制草烏・海螵蛸 |
| **芫花** | **不存在** | 2 | 甘草・炙甘草 |
| **京大戟** | **不存在** | 1 | 甘草 |
| **牽牛子** | **不存在** | 1 | 巴豆 |
| **蕪荑** | **不存在** | 1 | 生地黃 |

十八反的三大組（烏頭組、甘草組、藜蘆組），**藜蘆組的主角完全沒有卡**，
而它被 13 張卡點名 —— 是全庫被點名最多的「不存在的藥」。
後果有三層：
1. 模板 §1.5 的藥名自動連結對這 6 個名字永遠是死鏈，學生點不開。
2. 反向查不到：使用者無法從藜蘆卡看到「哪些藥反藜蘆」。
3. HB-4 那類「連結必須指向存在的記錄」的 predicate 若擴及配伍對象，這 6 個會全數報錯。

**陷阱提醒（供下一批）**：`herb.da_ji` 是**大薊**（薊科，涼血止血），
**不是**十八反的**京大戟**（大戟科，峻下逐水）。用中文子字串搜 `大戟` 會落空，
搜 `大薊` 會撈到錯的藥。批次一的「一律以 id slug 解析」在這裡不夠，
因為**正確的那味藥根本沒有 id**。

### H-39 — `condition_tags_zh` 被一整條功效串佔住，或整欄空白 · **QUALITY**

模板 §9：`condition_tags_zh` 是「病名症狀索引標籤（中英成對，點了會全站搜尋該症狀）」。
本批 30 味的分佈：

- **整欄空或不存在 7 味**：瓜蔞・川貝母・玄參・檳榔・吳茱萸・麝香・黃芩。
- **只有 1 條、且那一條是把功效句串起來的長字串 8 味**，例如：

| id | `condition_tags_zh[0]` |
|---|---|
| `herb.bai_ji` 白及 | `收斂止血消腫生肌` |
| `herb.ku_shen` 苦參 | `清熱燥濕殺蟲利尿` |
| `herb.huang_lian` 黃連 | `清熱燥濕瀉火解毒` |
| `herb.sheng_di_huang` 生地黃 | `清熱涼血養陰生津` |
| `herb.shu_di_huang` 熟地黃 | `補血養陰填精益髓` |
| `herb.chuan_lian_zi` 川楝子 | `行氣止痛殺蟲療癬` |
| `herb.zhe_bei_mu` 浙貝母 | `清熱化痰散結消癰` |
| `herb.ku_lian_pi` 苦楝皮 | `殺蟲療癬` |

這些字串點下去會用整句去全站搜尋，**必然 0 命中**，功能等於壞掉。
全庫 `condition_tags_zh` 只有 1 條且長度 ≥8 的：**94 筆**。
對照組是同批的 `herb.hai_zao`（10 條）、`herb.chai_hu`（10 條）、
`herb.chen_pi`（9 條）、`herb.chuan_mu_tong`（9 條）—— **都是模板級補卡，都中英成對。**

### H-40 — 性味欄自相矛盾的第二個形態：溫＋熱並列 · **CLINICAL**

批次一 H-10 用「有毒＋無毒」與「寒/涼＋溫/熱」兩個判準掃出 11 筆。
本批讀到丁香時發現漏了一個形態 —— **同時出現 `溫` 與 `熱`（兩個不同的溫度等級）**：

| id | `properties_taste_temp` |
|---|---|
| `herb.ding_xiang` 丁香 | `辛、無毒、**熱**、**溫**` |
| `herb.gan_jiang` 乾薑 | `**溫**、辛、苦、**熱**` |
| `herb.rou_gui` 肉桂 | `**大熱**、甘、辛、**溫**` |
| `herb.hua_jiao` 花椒 | `**溫**、辛、苦、無毒、小毒、有毒、**大熱**`（已在 H-10 的 11 筆內） |

新增 **3 筆**（丁香・乾薑・肉桂），H-10 的全庫數應由 11 修正為 **14**。
HB-6 的 predicate 需要補這一條規則。

### H-41 — 安全陣列裡的逐字重複條目 · **QUALITY**

`herb.chuan_xiong` `cautions_zh[1]` 與 `cautions_zh[6]`：

> 「上盛下虛者忌服：上盛下虛者服用川芎會加重上盛的症狀，如頭暈、頭痛加劇。」

兩條完全相同，中間隔了 4 條。同卡 `[3]` 與 `[5]` 也都寫了「惡黃連」。
`herb.ding_xiang` `contraindications_zh[0]` 與 `[1]` 都寫「畏鬱金」。
批次一 H-21（蒼耳子：禁忌欄是慎用欄的逐字副本）是跨欄重複，
**本條是同欄內重複** —— HB-10 的 predicate 需要同時涵蓋兩種。

### H-42 — 兩套劑量欄數值互相矛盾（批次一的陰性結論在本批被推翻） · **SAFETY**

批次一 §3.2 明確寫：「兩套並存的 20 筆中，數值互相矛盾的 **0 筆**」。
本批出現反例：

`herb.yu_jin`（鬱金）：
> `dosage.一般建議` = **`3-10克`**
> `dosage_g.standard_daily_g` = **`6 ~ 12g`**

下限差 2 倍（3 vs 6）、上限差 20%（10 vs 12），兩欄都掛著 `field_sources`。
渲染器讀 `dosage_g` → 卡片顯示 6~12g；記錄裡的 3-10克 讀不到。
（同卡 `食療用量範圍` 是第三個數字 `6-12克`。）

本批兩套並存的 13 筆中，只有鬱金一筆矛盾；其餘 12 筆 `dosage_g` 是 `dosage` 的摘要或並記。
**所以批次一的結論不是錯的，是樣本沒撞到 —— 但「兩套劑量欄不會打架」不能再當作前提。**

---

## §3 總結、census、HB 系列候選、與層級可靠度的回答

### §3.1 數字（每一格都能由 `herb_canon_shortlist.json` ＋ §2 判準重算）

| 指標 | 本批 30 味 | 批次一 30 味 | 全庫 358 筆 |
|---|---|---|---|
| CLEAN / MINOR / DEFECT | **5 / 3 / 22** | 2 / 15 / 13 | — |
| findings 條數 | 18（H-25…H-42） | 24（H-01…H-24） | — |
| 其中 SAFETY | 8（H-25, H-28, H-29, H-31, H-33, H-35, H-37, H-42） | 8 | — |
| 其中 CLINICAL | 5（H-26, H-27, H-30, H-32, H-38, H-40 → 6） | 5 | — |
| DEFECT 卡中 `source_type: sourced_cloudtcm_record` | **20 / 22** | 11 / 13 | 全庫 41 筆 `review_status` 用此值 |
| 缺 `dosage_g.standard_daily_g`（現顯示「待補」） | **18** | 11 | **200 / 358**（toxic 類 flag 17） |
| **`dosage_g` 型別是字串（未被 200 筆統計到）** | **1**（天南星） | — | **7**（麻黃・半夏・天南星・桔梗・旋覆花・白芥子・白附子） |
| `dosage` 帶 `食療用量範圍` | 17 | 17 | 179 / 358 |
| 食療上限 > 一般建議上限 | **6** | 3 | **75**（批次一報 77，口徑差見 H-28） |
| `related_formulas` 指向不含該藥的方 | **123 / 244 條（50.4%）** | 144 / 433 條（33.3%） | 864 / 1666 條・225 卡 |
| `related_formulas` 死 id | **0** | — | 3 |
| `contraindications_zh` 與 `safety_info` 皆空 | **15** | 4 | 198 / 358 |
| `cautions_zh` 有值但 `cautions_en` 不存在 | **21** | 11 | 216 / 358 |
| `functions_zh` 有值但 `actions_en` 不存在 | **15** | — | **177 / 358** |
| `functions_zh` 長度 ≠ `actions_en` 長度 | **4** | — | **32** |
| `functions_zh` > 6 條 | **12** | — | 72（驗證器既有 Note） |
| `clinical_use_note` ≡ CloudTCM summary 逐字 | **21** | 13 | 182 |
| `condition_tags_zh` 空或不存在 | **7** | — | — |
| `condition_tags_zh` 只有 1 條且長度 ≥8（功效串） | **8** | — | **94** |
| `properties_taste_temp` 自相矛盾 | 0（新形態 1：丁香） | 3 | **14**（H-10 的 11 ＋ H-40 的 3） |
| `field_sources` 引用外來 CloudTCM id | **3**（鬱金・丹參・川芎） | — | **21**（其中 20 張 `source_checked`） |
| CloudTCM id 被兩張卡同時宣稱 | — | — | **≥6 組** |
| `public_safe === true` | **2**（五靈脂・麝香） | — | **53**；欄位不存在 **19** |
| `safety_review_pending` 型別 | 布林 2 / 字串 1 / 缺 27 | — | 布林 58 / **字串 14** / 缺 286 |
| `review_status ≠ draft` | **5** | 6 | source_checked 37・sourced_cloudtcm_record 41・reviewed 1・draft_reviewed 1・undefined 5 |
| 驗證器判定 | — | — | `validate-herb-standard.js` **PASS**・`validate-content-junk.js` **PASS** |

### §3.2 這 30 味的 dose-field shape census

| `dosage` 形狀 | n | ids |
|---|---|---|
| **SERIALIZED-JSON**（`"{\"一般建議\":…}"` 字串） | **20** | gua_lou chuan_bei_mu bai_ji yu_jin ding_xiang dan_shen xuan_shen tian_nan_xing chuan_lian_zi ku_lian_pi bing_lang ku_shen wu_zhu_yu he_shou_wu huang_qin chuan_xiong sheng_di_huang shu_di_huang chen_pi huang_lian |
| 真物件 | 6 | hai_zao ba_dou chuan_mu_tong xi_jiao（空 `{}`） gui_zhi chai_hu |
| 純字串 | 1 | liu_huang |
| 不存在 | 3 | zhe_bei_mu wu_ling_zhi she_xiang |

批次一是 15 / 11 / 3 / 1。**兩批合計 60 味：序列化 JSON 35、真物件 17、純字串 4、不存在 4。**
序列化 JSON 是主流形狀，佔 58%。

物件鍵組合（本批 8 種，批次一 7 種，**兩批無一種完全重複以外的收斂跡象**）：
`一般建議|食療用量範圍|特殊說明`（20，全部是序列化字串）·
`min_g|max_g|unit|route`（1：hai_zao，**批次一沒見過的形狀**）·
`standard_daily_g|topical_g|maximum_duration_note_zh|source_note_zh`（1：ba_dou）·
`standard|granules|notes`（1：chuan_mu_tong，**新形狀**）·
`decoction_g|特殊說明`（1：gui_zhi）·
`standard_daily_g|food_therapy_g|tincture|preparation_zh|preparation_en`（1：chai_hu，**新形狀**）·
空物件 `{}`（1：xi_jiao）。

第二套 `dosage_g`：30 味中 **13 筆存在且為物件**、**1 筆存在但是字串**（tian_nan_xing）、
**16 筆不存在**。兩套並存 **13 筆**，其中數值矛盾 **1 筆**（鬱金，H-42）。
`dosage_g` 鍵組合本批 9 種：`standard_daily_g|course_dose_g|cloudtcm_dose_g|source_note` ·
`standard_daily_g|granule_dose_g|preparation_note_zh`（3） · `standard_daily_g|granule_dose_g` ·
`standard_daily_g|source_note|granule_dose_g|granule_note` ·
`standard_daily_g|course_dose_g|ad_dose_g|cloudtcm_dose_g|source_note` ·
`standard_daily_g|historical_formula_dose_g|substitute_dose_g|source_note` ·
`standard_daily_g|ad_dose_g|source_note` · `standard_daily_g`（單鍵） ·
`standard_daily_g|granule_dose_g|note_zh|note_en`。

**一致性判定**：`standard_daily_g` 是唯一被渲染器讀的鍵，也是唯一在 13 個物件裡都出現的鍵 ——
**這是全庫劑量欄唯一的收斂點，HB-2 應以它為錨。**

### §3.3 中藥層是不是比方劑層可靠？——派工單指定的問題，逐項回答

**批次一的結論是：中藥卡的劑量是對的（川烏/草烏 1.5–3g），方劑 composition 列是錯的（180g）。
本批 30 味的結論是：這個結論在「數值本身」層面成立，但不能推廣成「中藥層是可靠的一層」。**

**（1）數值層面 —— 中藥層仍然沒有出現方劑層那種量級錯誤。成立。**

本批 30 味的 `dosage` / `dosage_g` 逐筆核讀，**沒有任何一筆出現
「丸散批次總重被填成湯劑日劑量」那個形態**（那是 180g 錯誤的機制）。
毒藥的數字都在合理範圍且多半標了來源與限制：

| id | 記錄裡的劑量 | 是否標限制 |
|---|---|---|
| `herb.ba_dou` 巴豆 | `巴豆霜入丸散 0.1–0.3g；不可入湯煎` | ✔ 另註「課件明列限 1–2 劑」「生品 0.5–1g 可致死」 |
| `herb.liu_huang` 硫黃 | `內服 1–3g，粉末丸劑`（AD 1–6g 並記） | ✔ 外用/內服分開，經皮吸收風險入禁忌 |
| `herb.tian_nan_xing` 天南星 | `3–10g（僅限炮製品；膽南星 2–5g）` | ✔ 但型別錯導致顯示不出（H-35） |
| `herb.xi_jiao` 犀角 | `不適用——現代禁用，不得開立` | ✔ 歷史用量與替代用量分欄並記 |
| `herb.chuan_mu_tong` 川木通 | `3–6g（課件、CloudTCM）/ 3–10g（AD）` | ✔ 關木通毒性明標為品種差異 |

**→ 派工單的問題「這是否跨 30 味成立」：成立。中藥層沒有反向污染方劑層的證據，
在本批同樣找不到。**

**（2）但「可靠」在三個維度上不成立，而且其中兩個是本批新發現的。**

**維度 A — 中藥層的劑量正確，卻到不了使用者眼前。**
- HB-1 之前：200 張卡顯示編造的 `6~15g`（批次一 H-01）。
- HB-1 之後：同樣這 200 張顯示「待補」，其中 **154 張的真實劑量就在渲染器不讀的 `dosage` 欄裡**。
- 再加上本批新發現的 **7 張 `dosage_g` 型別是字串**（含天南星、麻黃、半夏、白附子），
  這 7 張的劑量欄位存在、內容正確、型別錯誤，同樣顯示「待補」。

**→ 中藥層的劑量資料是對的，但可見度是壞的。方劑層的錯誤是「顯示了錯的數字」，
中藥層的錯誤是「有對的數字但不顯示」。兩者不能用「哪一層更可靠」比較 —— 是不同的失效模式。**

**維度 B — 中藥層在「配伍禁忌」上比方劑層更不可靠，這是本批的新結論。**
方劑層的 composition 至少是結構化的（herb_id + 劑量）。
中藥層的十八反/十九畏是**自由文字**，本批證明它在四個方向上失控（H-25）：
方向反轉（五靈脂/人參、鬱金/丁香）、關係詞混用（反/畏/反畏 同卡三種）、
語意反轉（十八反寫成「減弱藥效」）、欄位錯置（同一句話在瓜蔞是慎用、在栝樓皮是禁忌）。
**加上 H-38 的 6 味對造藥沒有卡（藜蘆被 13 張卡點名），
中藥層目前無法回答「A 和 B 能不能同用」這個問題，即使兩張卡都在。**

**維度 C — 「已核源」標記與品質負相關，這是本批最違反直覺的發現。**
`review_status: source_checked` 的 4 張（五靈脂・鬱金・丹參・川芎）**全部判 DEFECT**，
而且全部命中 H-32（`functions_zh` 被污染、`actions_en` 對齊備援欄）
與 H-34（`field_sources` 引用外來 CloudTCM id）。
全庫 21 張「來源分裂」卡中 **20 張是 `source_checked`**。
反過來，5 張 CLEAN 全部是 `review_status: draft` 的模板級補卡。

**→ 決定卡片品質的不是 `review_status`，是 `source_type`。**

| `source_type` | 本批張數 | CLEAN | DEFECT |
|---|---|---|---|
| `full_card_verified_multi_source` | 3（海藻・巴豆・陳皮） | 2 | 0 |
| `multi_source_curriculum_cloudtcm_american_dragon` | 1（硫黃） | 1 | 0 |
| `formula_ingredient_gap_fill` | 1（犀角） | 1 | 0 |
| 無 `source_type` | 1（川木通） | 1 | 0 |
| **`sourced_cloudtcm_record`** | **24** | **0** | **20** |

**兩批合計：CloudTCM 原樣落地層 = 31/35 的 DEFECT 來源；
Codex/Claude 模板級補卡 = 7/7 的 CLEAN 來源（批次一 2 張 ＋ 本批 5 張）。**

**（3）最終答案。**

> **中藥層在「數值」上是兩層裡較可靠的那一層 —— 這個結論成立，並且本批 30 味沒有找到任何反例。
> 但「中藥層可靠」是錯的說法。正確的說法是：**
> **中藥層裡由 Codex/Claude 依模板逐欄建的那 ~90 張卡是可靠的；
> `sourced_cloudtcm_record` 的那 ~240 張不是，而且它們正是方劑層 composition 的上游名稱來源。**
>
> **沒有找到任何「方劑層是對的、中藥層是錯的」的反例** —— 這一點對權威層的判定很重要：
> 修方劑層不會污染中藥層，反向也不會。兩層的缺陷是獨立的，要分別修。

### §3.4 HB 系列候選（接續 HB-13）

**可機械執行、判準已寫死、不需臨床判斷：**

| # | 內容 | 影響 | 性質 | 備註 |
|---|---|---|---|---|
| **HB-13** | `dosage_g` 必須是物件。7 張是字串，渲染器讀不到，其中 4 張是安全相關藥（麻黃・半夏・天南星・白附子） | 7 卡 | **blocking 候選・止血級** | 純型別，無臨床判斷。修法是把字串搬進 `dosage_g.standard_daily_g`（搬遷，非刪除） |
| **HB-14** | 新 predicate：`tcm_properties` 必須是物件或不存在（10 張是字串）；`safety_review_pending` 必須是布林或不存在（14 張是字串） | 24 卡 | blocking 候選 | H-35。字串內容要先搬到 `*_source_note_zh` 再改型別 |
| **HB-15** | 新 predicate：`condition_tags_zh` 若只有 1 條且長度 ≥8 且不含標點 ⇒ 報「功效串誤填為索引標籤」 | **94** | warn | H-39。改寫需臨床判斷，predicate 只負責報 |
| **HB-16** | 新 predicate：`functions_zh` 與 `actions_en` 皆非空時長度必須相等（32 張不等）；`functions_zh` 非空而 `actions_en` 不存在 ⇒ warn（177 張） | 32 blocking + 177 warn | H-32。憲法第五條的機器化 | 長度不等是**渲染錯位**，比缺英文嚴重 |
| **HB-17** | 新 predicate：`field_sources` / `source_urls` / `cloudtcm_url` / `exact_source_url` 裡出現的 CloudTCM herb id 必須唯一（21 張分裂、≥6 組撞號） | 21 卡 | **blocking 候選** | H-34。純機器可判；哪一個 id 才對要開頁核，屬 Ting |
| **HB-18** | 擴充 HB-6：`properties_taste_temp` 不得同時含 `溫` 與 `熱\|大熱`（新增 3 筆：丁香・乾薑・肉桂） | 14（原 11 ＋ 3） | warn→blocking | H-40 |
| **HB-19** | 擴充 HB-10：同一陣列內不得有逐字相同的條目（川芎 `cautions_zh[1]≡[6]`、丁香 `contraindications_zh[0]≡[1]` 皆寫「畏鬱金」） | ≥3 | warn | H-41 |
| **HB-20** | 新 predicate：任一 `_zh` 欄位或 `clinical_use_note` / `properties_taste_temp` 的字串完全不含 CJK ⇒ 報「英文落在中文欄」 | 本批 4（浙貝母 3・川木通 1）＋ `modern_pharmacology[].analysis_zh` 5 卡 | blocking 候選 | H-26。**浙貝母那條會實際顯示成性味** |
| **HB-21** | 新 predicate：`cautions_zh` / `contraindications_zh` 裡出現的藥名，若在 358 筆裡查無對應記錄 ⇒ 報「配伍對象缺卡」 | 6 味被點名 22 次 | warn | H-38。建卡屬新內容，須 Ting 排批次 |
| **HB-22** | 新 predicate：`dosage` 與 `dosage_g.standard_daily_g` 的數值區間不得矛盾（鬱金 3-10 vs 6-12） | 1 已確認，需全庫跑 | warn | H-42。批次一的 0 已被推翻 |
| **HB-23** | 新 predicate：`review_status === "source_checked"` ⇒ `field_sources` 的所有 CloudTCM id 必須與 `cloudtcm_url` 一致 | 20 卡 | blocking 候選 | H-34 ＋ §3.3 維度 C。「已核源」的定義應該至少包含這一條 |

**HB-2 的優先度調整**：批次一列為第二順位。HB-1 落地後，
**200 張卡的劑量格現在是「待補」，其中 154 張的真值在 `dosage`、7 張在字串型 `dosage_g`。
建議 HB-13（型別，7 張，一次搬遷）先做 —— 它比 HB-2 小一個數量級，
而且 7 張裡 4 張是毒藥/安全藥，止血效益最高。**

**必須送 Ting、AI 不得自行處理（憲法第四條）：**

1. **H-25 的配伍方向裁定** —— 五靈脂/人參、鬱金/丁香、川貝母的「減弱藥效」三處要改成
   哪個方向、用哪個關係詞，需要權威來源。本 ledger 只指出兩側互相矛盾。
2. **H-26 浙貝母整卡重建** —— 5 條 cautions ＋ 6 篇藥理全是川貝母的。
   刪除屬刪除、重寫屬新內容，兩者都要 Ting。**這張卡目前不應被視為浙貝母的資料。**
3. **H-28 檳榔的致癌警語** —— 全庫查無，補寫需權威來源；
   同時要裁定「食療用量範圍 3-6克（日常消食）」與「減肥減重」標籤是否移除（屬刪除）。
4. **H-29 吳茱萸的孕期資訊** —— 目前完全沒有，補寫需來源。
5. **H-31 黃連的「每日 12g 未見副作用」** —— 這句話是來源原文還是誤植？
   保留（移到「來源記載」欄）或移除，都要裁定。**在裁定前，這是本批最該優先處理的單一句子。**
6. **H-33 麝香的 CITES 狀態與 `public_safe: true`** —— 是否比照犀角/穿山甲加
   `prohibited_endangered_species` 等 flag，屬新內容。
7. **H-34 的 21 組來源分裂與 6 組 id 撞號** —— 每一組要開 CloudTCM 頁核對誰是誰，
   AI 不得自行二選一。
8. **H-37 苦楝皮的 HIV/鼠疫/炭疽段落** —— 移除屬刪除。
9. **H-38 的 6 味缺卡（藜蘆優先）** —— 是否納入下一批。
10. **H-27 的 `clinical_use_note`** —— 34/60 已讀卡是原文傾倒，其中桂枝/苦楝皮/柴胡
    三張的內容與本卡其他欄位相反。改寫需臨床判斷。

### §3.5 兩批合併的 Ting 清單（依「會不會傷到人」排序，不依發現順序）

**第一級 — 使用者現在打開卡片就會看到錯的東西**

1. **黃連 `cautions_zh[3]`**：注意事項欄寫著「每日 12g，連續 3 周…均未見副作用」，
   本卡建議量 2-5克。（H-31）
2. **浙貝母整張卡**：性味欄顯示一句英文佔位句；5 條注意事項與 6 篇藥理全是川貝母的。（H-26）
3. **檳榔**：食療 3-6克「日常消食」＋「減肥減重」功效標籤，全卡 0 字致癌。（H-28）
4. **苦楝皮 `clinical_use_note`**：宣稱抑制 HIV、鼠疫桿菌、炭疽桿菌，並把細菌列為真菌。（H-37）
5. **何首烏**：`liver_disease_review` flag ＋ `保肝` 功效標籤 ＋ 食療 6-15克 > 入藥 6-12克，
   全卡 0 字肝損傷。（H-28）
6. **桂枝學習筆記寫「風寒表實證」**，與本卡主治「表虛」和考點「表虛有汗亦可用」相反。（H-27）

**第二級 — 安全欄位的結構性缺口（不是單句錯，是整格空或放錯格）**

7. **`contraindications_zh` 整欄不存在 198/358**；兩批 60 味中 19 味命中，
   其中檳榔、苦楝皮、麝香、川楝子、苦參、大黃、芒硝、甘遂、全蠍全是毒藥/峻藥。（H-11 + 本批）
8. **吳茱萸 14 條安全敘述無孕字，同卡列「興奮子宮」**；當歸同型。（H-29 + H-15）
9. **麝香**：無 `safety_flags`、無劑量、`field_sources` 空、`public_safe: true`，CITES 附錄 I。（H-33）
10. **`cautions_en` 缺失 216/358**，缺的集中在毒藥族。（H-12）

**第三級 — 劑量的可見度（HB-1 已止血，資料側未收斂）**

11. **200 張卡的劑量格顯示「待補」**，其中 154 張真值在渲染器不讀的 `dosage`。（H-01 + HB-2）
12. **7 張 `dosage_g` 是字串**（麻黃・半夏・天南星・桔梗・旋覆花・白芥子・白附子），
    型別錯導致同樣顯示「待補」。（H-35 + HB-13）
13. **食療用量範圍 179 張，其中 75 張上限高於入藥上限**，含毒藥。（H-02）

**第四級 — 配伍禁忌整族不可信**

14. **十八反/十九畏方向、詞彙、欄位三重失控**；目前只有甘草/海藻一組對得上。（H-25 + H-04）
15. **6 味配伍對造藥缺卡，藜蘆被 13 張卡點名。**（H-38 + H-24 水蛭）
16. **炙甘草 `contraindications_zh[3]` 漏了否定詞**，字面讀成叫人合用。（H-25E）

**第五級 — 來源紀律（決定上面所有東西能不能被查證）**

17. **21 張卡的 `field_sources` 引用外來 CloudTCM id，≥6 個 id 被兩張卡同時宣稱**；
    20/21 是 `review_status: source_checked`。（H-34）
18. **`review_status` 與品質負相關；決定品質的是 `source_type`。**
    CloudTCM 原樣落地層 = 31/35 DEFECT 的來源；模板級補卡 = 7/7 CLEAN 的來源。（§3.3 維度 C）
19. **`related_formulas` 864/1666 條指向不含該藥的方**；本批命中率 50.4%，比批次一的 33.3% 高。（H-03）
20. **`clinical_use_note` 34/60 是 CloudTCM 原文傾倒**，其中 3 張的內容與本卡其他欄位相反。（H-16 + H-27）

### §3.6 下一批建議

兩批讀了 60/358（16.8%）。以本批 22/30 DEFECT 的命中率，繼續隨機讀已經不划算 ——
**問題不在於還沒讀到哪一張，在於 `sourced_cloudtcm_record` 那一整層。**

1. **不要再讀 30 味。** 本批已經證明 `source_type` 是最強的預測因子：
   CloudTCM 落地層 24 張讀出 20 張 DEFECT、0 張 CLEAN。再讀 30 張只會得到同樣的比例。
2. **先跑 HB-13 / HB-17 / HB-20 三支 predicate**（型別、來源 id 唯一、中文欄裡的英文）——
   三支都是純機械、無臨床判斷，合計覆蓋 7 + 21 + 9 = 37 張卡，
   而且都會抓到「肉眼才看得見」那一類。這是把眼讀成果轉成機器防線的最直接一步。
3. **對 `sourced_cloudtcm_record` 那 ~240 張做一次全層掃描而非抽樣**，
   判準用本批已經寫死的 6 條：`functions_zh` vs `traditional_functions_zh` 不一致 ·
   `condition_tags_zh` 功效串 · `clinical_use_note` ≡ summary ·
   `contraindications_zh` 缺 · `field_sources` id 分裂 · 食療 > 入藥。
   全層數字比再讀 30 張更能讓 Ting 決定「這一層是修還是重建」。
4. **`herb_pairs.json`（489KB）兩批仍然完全沒讀。** 模板第 10 區的正本在那裡，
   而 H-25 證明卡片層的配伍敘述不可信 —— **對藥的正本是否也有同樣的方向問題，
   目前是未知數，而它是唯一可能救回配伍族的地方。**

---

**本輪 `git status` 於 ledger 寫入前為空；除本檔外沒有新增、修改或刪除任何檔案。
未執行 `git add`、未 commit、未 push。**

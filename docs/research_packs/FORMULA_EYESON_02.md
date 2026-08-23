# FORMULA_EYESON_02 — 方劑卡人眼審查第二批（慎用藥安全盤點 30 方）

狀態：**findings ledger（唯讀）。本輪沒有動 `data/**` 一個字元。**
Branch：`codex/formula-eyeson-2`（自 `origin/codex/pattern-v2` tip `83b7f59`）
日期：2026-08-12
對象：`data/herbs/formulas.json`（224 筆 records）
前一批：`docs/research_packs/FORMULA_EYESON_01.md`（F-01…F-24 / FB-1…FB-13 / 已讀 31 卡）
下游收件人：`data/research_staging/CONTENT_REQUEST_FORMULA_CAUTION_HERB_COVERAGE.md`（本 ledger §3 的覆蓋矩陣直接補進該 CR 的 B 段）

⚠️ **已備案、本批不重複計數的兩族**：`herb_zh`/`name_zh` 拼音化（batch 1 記 251 筆）、
逐味「健脾和中，調和諸藥。」樣板（batch 1 記 158 筆）。本批只在**它落在慎用藥上**時引用，
並註明那是安全後果，不是新的一族。批中若見已修好的紀錄，視為併行 session 落地，非本 ledger 的矛盾。

---

## §0 取樣與方法

### 選卡條件（派工單優先序，可一行重現）

派工單第 1 序：組成含 **附子/川烏/草烏 · 麻黃 · 大黃/芒硝 · 細辛 · 朱砂/雄黃 ·
全蠍/蜈蚣/水蛭 · 桃仁/紅花/三稜/莪朮** 任一族。
掃全庫 224 筆、扣掉 batch 1 已讀的 31 筆、扣掉 `composition` 為空者，
**符合者 50 筆**（batch 1 已把所有 `links > 0` 的高曝光方取完，這 50 筆的 links 全為 0，
因此第 2 序改用「警訊藥族數 desc → exam_star desc → nccaom_high_yield desc → id asc」）。

從 50 筆取 30 筆，取法：

| 層 | 條件 | 取得 |
|---|---|---|
| A | 派工單點名的起手方 | 大承氣湯 · 定喘湯 · 附子理中丸 · 涼膈散 · 獨活寄生湯（5） |
| B | 跨 2–3 個警訊藥族（一卡驗多族） | 大黃附子湯(附子+大黃+細辛) · 溫脾湯 · 烏梅丸 · 再造散 · 紫雪丹 · 桂枝芍藥知母湯 · 復元活血湯 · 防风通圣散（8） |
| C | 礦物毒藥族（朱砂/雄黃，全庫最集中的毒性缺口） | 安宮牛黃丸 · 至寶丹 · 磁朱丸 · 蘇合香丸（4） |
| D | 蟲類藥族（全庫僅此一卡有全蠍/蜈蚣族且有組成） | 牽正散（1） |
| E | 附子族其餘 high_yield ★ 方 | 四逆湯 · 真武湯 · 參附湯 · 實脾飲 · 腎氣丸（5） |
| F | 麻黃族其餘 | 麻杏石甘湯 · 陽和湯 · 大青龍湯（3） |
| G | 大黃/芒硝族其餘（承氣三方留兩方作對照） | 小承氣湯（1） |
| H | 桃仁族臨床高曝光（產後） | 生化湯（1） |
| I | **交叉核對對照組** | 桂枝茯苓丸 + 茯苓丸（2）— 選卡掃描時發現前者 `composition` 疑為後者，特意成對取讀以確認（結論見 F-32） |

**最終 30 個 id**

```
formula.da_huang_fu_zi_tang   formula.wen_pi_tang            formula.wu_mei_wan
formula.zai_zao_san           formula.zi_xue_dan             formula.gui_zhi_shao_yao_zhi_mu_tang
formula.fu_yuan_huo_xue_tang  formula.fang_feng_tong_sheng_san formula.da_cheng_qi_tang
formula.ding_chuan_tang       formula.fu_zi_li_zhong_wan     formula.liang_ge_san
formula.du_huo_ji_sheng_tang  formula.an_gong_niu_huang_wan  formula.zhi_bao_dan
formula.ci_zhu_wan            formula.su_he_xiang_wan        formula.qian_zheng_san
formula.si_ni_tang            formula.zhen_wu_tang           formula.shen_fu_tang
formula.shi_pi_yin            formula.shen_qi_wan            formula.ma_xing_shi_gan_tang
formula.yang_he_tang          formula.da_qing_long_tang      formula.xiao_cheng_qi_tang
formula.sheng_hua_tang        formula.gui_zhi_fu_ling_wan    formula.fu_ling_wan
```

**落選但值得記錄的一筆**：`formula.mu_li_san` 牡蠣散在自動掃描中命中「麻黃」，
逐字讀後確認組成是 **麻黃根**（`herb.ma_huang_gen`，止汗藥，非麻黃），**假陽性，已排除**。
下一批做同類掃描的人請把 `麻黃根` 加進排除字串，否則會重複踩。

### 方法

每筆從 `data/herbs/formulas.json` 整筆取出、攤平成逐欄文字後**整份逐行讀完**
（含 `composition[]` 每一味的六個功效欄、`english_exam_track`、`chinese_depth_track`、
`action_profile`、`field_sources`、`correction_note`）。
`modern_applications_zh` / `treats_zh` / `symptoms_zh` 這三個 CloudTCM/AD 關鍵字長列
（本批共 4,484 行）另存成中英逐條並排檔全數過目，不抽樣。

機器掃描**只用來量化已經用眼睛確認過的問題有多廣**。§2、§3 每一個數字都能被
「讀 `data/herbs/formulas.json` + 本節寫明的判準」一次重算，判準逐條寫在各 finding 內。

### 判級規則（沿用 batch 1）

- **DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷
- **MINOR** = 只有 QUALITY 級
- **CLEAN** = 引不出任何一條

### 慎用藥覆蓋的三態定義（本批新增，餵給 CONTENT_REQUEST）

| 級 | 定義 |
|---|---|
| **present** | 該藥的招牌警告以**可搜尋的字串**出現在安全欄（`contraindications_*` / `cautions_*` / `safety_flags` / `clinical_pearls`），**且中英同時有** |
| **partial** | 只出現在單一語言、或只出現在非安全欄（`pharmacology_zh` / `chinese_depth_track.notes_zh` / `composition[].in_formula_en`）、或只講了一半（有孕期沒毒性、有毒性沒劑量上限） |
| **absent** | 全卡 grep 不到任何一個字 |

**本 ledger 沒有替任何一張卡寫入警告文字**（憲法第四條）。只分類缺口。

---

## §1 逐卡判定

| # | id | 卡 | 警訊藥 | 判定 | 一句話 |
|---|---|---|---|---|---|
| 1 | `da_huang_fu_zi_tang` | 大黃附子湯 | 附子 大黃 細辛 | **DEFECT** | 三族警訊藥同卡，孕期／附子毒性／細辛劑量**一個字都沒有**；細辛 `dose_g: 1-6g` 是藥典上限兩倍；細辛功效欄是「和中健脾，調和諸藥。」 |
| 2 | `wen_pi_tang` | 溫脾湯 | 附子 大黃 | **DEFECT** | 溫下方卻把君藥大黃的中文功效寫成「**瀉熱**通便」（en 是 "while the formula warms deficiency-cold"）；含附子＋大黃而無孕期、無毒性 |
| 3 | `wu_mei_wan` | 烏梅丸 | 附子 細辛 | **DEFECT** | **細辛 `dose_g: "1-28g"`**（藥典 1–3g 的九倍）；花椒功效欄字面是「緩解，緩解。」；`contraindications` zh 4／en 3 |
| 4 | `zai_zao_san` | 再造散 | 附子 細辛 | **DEFECT** | `contraindications_en` `cautions_en` **皆為空陣列且無 zh 對應欄**——含附子＋細辛的卡完全沒有禁忌；細辛功效欄是樣板句 |
| 5 | `zi_xue_dan` | 紫雪丹 | 芒硝 硃砂（＋犀角 青木香） | **DEFECT** | **`public_safe: true`**；硃砂功效欄字面是「清熱瀉火， **，**。」；青木香（馬兜鈴）中文欄全空而英文寫著 unsafe；`pattern_indications_zh[0]` 是「炎證」 |
| 6 | `gui_zhi_shao_yao_zhi_mu_tang` | 桂枝芍藥知母湯 | 附子 麻黃 | **DEFECT** | 附子＋麻黃同卡，`contraindications_zh` `_en` `cautions_en` **三欄皆空**；附子 `dose_g: "0.5-15g"`（30 倍幅）；麻黃功效欄是樣板句 |
| 7 | `fu_yuan_huo_xue_tang` | 復元活血湯 | 大黃 桃仁 紅花 | **DEFECT** | `cautions_en` 對同一種病人同時說「Use with caution」與「Contraindicated…for those with for those with」；桃仁／紅花／大黃三味 `actions_zh` 全是樣板句；穿山甲 `herb_id` 為空 |
| 8 | `fang_feng_tong_sheng_san` | 防风通圣散 | 麻黃 芒硝 | **DEFECT** | `name_zh` 是**簡體**「防风通圣散」；麻黃列為君藥而功效欄是樣板句；甘草 `dose_g: "3-60g"`、滑石 `"9-90g"` |
| 9 | `da_cheng_qi_tang` | 大承氣湯 | 大黃 芒硝 | **DEFECT** | `contraindications` zh 12／en 10；枳實功效欄樣板句；`safety_flags: []`；「生大黃後下」只出現在 `pharmacology_zh`，不在安全欄 |
| 10 | `ding_chuan_tang` | 定喘湯 | 麻黃 | **DEFECT** | `actions_zh` **67 條**、內容是 CloudTCM 整篇文章；`pattern_indications_zh` 講的是**別的方**（提到石膏、細辛、四物、真中/類中）；`actions_en` 是「Action: 咳嗽」這種中文；`contraindications_en` 空陣列 |
| 11 | `fu_zi_li_zhong_wan` | 附子理中丸 | 附子 | **DEFECT** | **`public_safe: true` 且 `review_status: "sourced_cloudtcm_record"`**；附子毒性警告只在 `in_formula_en`，中文欄無；附子 `dose_g: ".5-15g"` |
| 12 | `liang_ge_san` | 涼膈散 | 大黃 芒硝 | **DEFECT** | **`public_safe: true`**；同一來源句在 `contraindications_zh` 是「**禁**用」、在 `cautions_zh` 是「**慎**用」（孕婦與體虛各一組）；芒硝與君藥連翹的功效欄都是樣板句 |
| 13 | `du_huo_ji_sheng_tang` | 獨活寄生湯 | 細辛 | **DEFECT** | 細辛 `dose_g: "1-6g"`；細辛功效欄只剩「化痰降逆。」（丟掉祛風散寒止痛＝它在痺證方裡的理由）；君藥獨活功效欄是「緩急止痛。」；`english_exam_track.pattern_indications_zh` 有「兼與證」 |
| 14 | `an_gong_niu_huang_wan` | 安宮牛黃丸 | 硃砂 雄黃 | **DEFECT** | **雄黃 `dose_g: "1-30g"`（藥典上限 0.1g，約 300 倍）**、硃砂 `.5-30g`、麝香 `.25-7.5g`；雄黃中文功效欄是「健脾和中，調和諸藥。」——但這是本批 `safety_flags` 做得最好的一卡（見 F-45） |
| 15 | `zhi_bao_dan` | 至寶丹 | 雄黃 | **DEFECT** | **雄黃 `dose_g: "30g"`（單一值，非範圍）**且中文功效欄是「燥濕健脾。」；`action_profile` 列的 13 味與 `composition` 的 6 味**完全不相干**；孕期在同卡同時是「禁用」「慎用」 |
| 16 | `ci_zhu_wan` | 磁朱丸 | 硃砂 | **DEFECT** | 硃砂 `dose_g: "3-30g"`（60 倍）且**三個中文功效欄全空**，汞毒警告只在英文；`safety_flags` 欄不存在 |
| 17 | `su_he_xiang_wan` | 蘇合香丸 | 硃砂（＋犀角） | **DEFECT** | 硃砂 `.5-60g`、冰片 `.5-30g`，且九味共用同一個 `-60g` 上限（機器產物）；硃砂中文欄全空；溫開劑的 `actions_zh[4]` 仍是「**清熱**化痰」 |
| 18 | `qian_zheng_san` | 牽正散 | 全蠍（＋白附子） | **DEFECT** | `contraindications_en[3]`：「**Bai Fu Zi and Wu Gong are toxic. Do not exceed a dosage of 6gt.**」——**蜈蚣不在本方組成**，而同卡中文正確寫的是白附子與全蠍；中文毒性敘述是本批最完整的一段（見 F-45） |
| 19 | `si_ni_tang` | 四逆湯 | 附子（含生附子列） | **DEFECT** | `composition[1]` 是**生附子**，中文三欄全空，「Unprocessed aconite is highly toxic」只在英文；全卡安全欄無孕期、無毒性；`applications_zh[11]` 寫「各種癌症輔助治療…有輔助效果」 |
| 20 | `zhen_wu_tang` | 真武湯 | 附子 | **DEFECT** | 同一句在 `contraindications_zh` 是「禁用」、`cautions_zh` 是「慎用」；`contraindications_en[0]` 字面只有「Heat conditions.」沒有方向詞；附子無孕期、無毒性、無先煎 |
| 21 | `shen_fu_tang` | 參附湯 | 附子 | **DEFECT** | **`public_safe: true`，且 `contraindications` / `cautions` 四欄全部不存在**；`actions_zh` 字面是 `["氣,陽", "溫中與補益心與腎陽於"]` |
| 22 | `shi_pi_yin` | 實脾飲 | 附子 | **DEFECT** | **`public_safe: true`，安全欄同樣全部不存在**；`actions_zh[0]` 字面是「溫中陽,健脾益氣,氣與促進於」；十味藥的 `dose_g` 一律「4-30g」 |
| 23 | `shen_qi_wan` | 腎氣丸 | 附子 | **DEFECT** | **`public_safe: true`**；`herb_drug_interactions_en` 放的是 prednisone 療效主張；`cautions_en` 7／`cautions_zh` 6（多的那條是 `for those with for those with`）；與 `formula.jin_gui_shen_qi_wan` **組成逐字相同**（F-41） |
| 24 | `ma_xing_shi_gan_tang` | 麻杏石甘湯 | 麻黃 | **DEFECT** | 含麻黃而孕期／心血管／交互作用**全無**，`safety_flags: []`；`pharmacology_zh` 有 ACE2／新冠機轉主張且無 `field_sources`；`contraindications` zh 6／en 4 |
| 25 | `yang_he_tang` | 陽和湯 | 麻黃 | **DEFECT** | **`public_safe: true`**；`contraindications_en` 有「Do not alter the dosage of Ma Huang」四條，`contraindications_zh` **只有三條——被丟掉的正是麻黃那條**；麻黃功效欄是樣板句 |
| 26 | `da_qing_long_tang` | 大青龍湯 | 麻黃（本批最高劑量 6-18g） | **DEFECT** | `herb_drug_interactions_en` 是「reduced the adverse effects of interferon」——干擾素**效益**主張出現在第三張卡（F-30）；君藥麻黃功效欄寫「止咳化痰。」；無孕期、無心血管 |
| 27 | `xiao_cheng_qi_tang` | 小承氣湯 | 大黃 | **DEFECT** | `pattern_indications_zh[0]` 把 "Relatively mild Colon Excess Heat" 譯成「**過度證**」——方向相反；`herb_drug_interactions_en` 是鴉片類便秘的療效主張；`notes_zh` 有 `&ldquo;` `&rdquo;` 殘留 |
| 28 | `sheng_hua_tang` | 生化湯 | 桃仁 | **DEFECT** | 桃仁功效欄是「和中健脾，調和諸藥。」；`treats_zh` 把 "Vaginal bleeding during pregnancy" 與 "Unpleasant symptoms during pregnancy" 雙雙譯成「（妊娠期）」——而同卡禁忌寫著孕婦禁用；`actions_zh[0][1]` 重複 |
| 29 | `gui_zhi_fu_ling_wan` | 桂枝茯苓丸 | （組成應有桃仁，實際列芒硝） | **DEFECT** | **整張組成表是茯苓丸的**（茯苓/枳殼/制半夏/芒硝，逐欄逐值相同），英文功效與主治亦然；本方真正的組成只活在 `action_profile`（桂枝赤芍丹皮茯苓桃仁 各 9g）。詳 F-32 |
| 30 | `fu_ling_wan` | 茯苓丸 | 芒硝 | **DEFECT** | 芒硝功效欄樣板句、枳殼「，緩解。」、`pattern_indications_en` 有 "Middke" 錯字；含芒硝而**無孕期**；`taiwan_pharmacopeia_zh: "Yes (THP p.133)"` |

**CLEAN 0 / MINOR 0 / DEFECT 30。**

（batch 1 是 0/1/30。兩批合計 61 卡，CLEAN 0。）

---

## §2 findings（接續 batch 1 的 F 編號）

嚴重度：**SAFETY**（影響用藥安全判斷）／**CLINICAL**（臨床或考試內容錯誤）／
**QUALITY**（可讀性、欄位形狀、來源紀律）。

---

### F-25 毒性礦物與慎用藥的 `dose_g` 上限高出藥典 2–300 倍 — **SAFETY**

`composition[].dose_g` 目前存的是「這味藥在某個資料源見過的最寬區間」，不是這個方的量
（batch 1 F-13 的同一根因）。**落在毒藥上時，它變成一個可以照抄的致死劑量。**

| 卡 | 藥 | `dose_g` 原值 | 藥典常用上限 | 倍數 |
|---|---|---|---|---|
| 至寶丹 | **雄黃**（硫化砷） | `"30g"` ← 單一值，不是範圍 | 0.05–0.1g | **~300×** |
| 安宮牛黃丸 | **雄黃** | `"1-30g"` | 0.05–0.1g | **~300×** |
| 蘇合香丸 | **硃砂**（硫化汞） | `".5-60g"` | 0.1–0.5g | **~120×** |
| 蘇合香丸 | 冰片 | `".5-30g"` | ~0.3g | ~100× |
| 安宮牛黃丸 | **硃砂** | `".5-30g"` | 0.1–0.5g | ~60× |
| 磁朱丸 | **硃砂** | `"3-30g"` | 0.1–0.5g | ~60× |
| 安宮牛黃丸 | 麝香 | `".25-7.5g"` | ~0.1g | ~75× |
| 紫雪丹 | 麝香 | `"0.3-0.8g"` | ~0.1g | ~8× |
| 烏梅丸 | **細辛** | `"1-28g"` | 1–3g（「細辛不過錢」） | **~9×** |
| 大黃附子湯 / 獨活寄生湯 | 細辛 | `"1-6g"` | 1–3g | 2× |

**重現**：對 30 筆的 `composition[]`，取 `dose_g` 尾端數字與上表藥典上限相比。

**同族形狀問題（同一個生成器的指紋）**：

- **實脾飲**十三味中十味的 `dose_g` **完全相同**：`"4-30g"`（附子、炮薑、茯苓、白朮、木瓜、厚朴、木香、大腹皮、檳榔、草果）。
- **蘇合香丸**九味共用上限 `-60g`（安息香、木香、檀香、沉香、丁香、香附、蓽茇、白朮、訶子）。
- 單位被寫進克數欄：實脾飲 `生薑 "5 slices"` / `大棗 "1 piece"`、四逆湯 `生附子 "1 piece"`、
  至寶丹 `金箔/銀箔 "50 leaves"`、涼膈散 `蜂蜜 "not specified"`。
- 卡內自相矛盾：四逆湯 `附子 dose_g "9g"` vs 同卡 `action_profile.groups_herbs.溫裡[0] = "附子 6g"`。

**建議**：不能機械修（要方的劑量就得回課件）。**但毒性礦物那七列應優先從渲染層下架**，
因為那不是「不精確」，是「照著會出事」。屬 Ting 裁定 + CONTENT_REQUEST B 段（朱砂/雄黃列）。

---

### F-26 毒性警告只存在於英文；同一列的中文是空字串或 `**，**` — **SAFETY**

英文匯入層對毒藥／瀕危藥有 markdown 標註（`**Potentially toxic**`、`**Obsolete/toxic**`、
`**Aristolochia is unsafe/obsolete**`）。中譯腳本把 `**` 之間的內容整段吃掉，
留下標點骨架或空字串。**結果是：中文讀者看不到毒性，英文讀者看得到。**

**`**` 殘骸（全庫 7 列，本批 5 列）**

```
formula.an_gong_niu_huang_wan  硃砂  in_formula_zh = "清熱瀉火， **，**。"
      en = "Sedates Heart/Shen … **Cinnabar/mercury is obsolete/toxic.**"
formula.zi_xue_dan            硃砂  in_formula_zh = "清熱瀉火， **，**。"
formula.an_gong_niu_huang_wan Xi Jiao in_formula_zh = "涼血止血， **，**。"
formula.zi_xue_dan            Xi Jiao in_formula_zh = "涼血止血， **，**。"
formula.zhi_bao_dan         (Xi Jiao) in_formula_zh = "替代藥材，涼血止血， **，**。"
```

**中文三欄全空、英文帶毒性字樣（全庫 8 列，本批 6 列）**

| 卡 | 藥 | `in_formula_en` |
|---|---|---|
| 四逆湯 | **(生附子)** | `AD lists this only for a critical condition. **Unprocessed aconite is highly toxic; historical/source data only.**` |
| 磁朱丸 | **硃砂** | `… **Cinnabar/mercury is obsolete/toxic; historical source data only.**` |
| 蘇合香丸 | **硃砂** | `… **Obsolete/toxic mercury source ingredient.**` |
| 紫雪丹 | **(青木香)** | `AD lists historically and calls it generally the incorrect herb; **Aristolochia is unsafe/obsolete.**` |
| 紫雪丹 | 羚羊角 | `… **Endangered/obsolete source ingredient.**` |
| 蘇合香丸 | Xi Jiao | `… **Endangered; AD states no longer used.**` |

紫雪丹那一列尤其該看：**青木香＝馬兜鈴科**，batch 1 F-04 點名的龍膽瀉肝湯／八正散木通缺口，
在這裡是「英文有寫、中文整格空白」的第二種形態——不是沒查到，是**查到了但中譯掉了**。

**重現**：`composition[]` 中 `in_formula_en` 含 `toxic|obsolete|endangered|unsafe`
且 `in_formula_zh` 為空或含 `**` 的列。

---

### F-27 樣板句「健脾和中，調和諸藥。」落在慎用藥上：本批 17 列 / 13 卡 — **SAFETY**

batch 1 F-08 已備案這一族的規模（全庫 259 列 / 125 筆）。本批只補一件事：
**在慎用藥上，它把毒藥描述成緩和的調和藥。**

限定「`herb_zh` 含 附子/川烏/草烏/麻黃/大黃/芒硝/細辛/朱砂/硃砂/雄黃/全蠍/蜈蚣/水蛭/桃仁/紅花/三稜/莪朮/麝香/白附子」
且 `in_formula_zh|actions_zh|role_reason_zh` 任一等於兩句樣板之一 →
**全庫 35 列，本批 17 列**：

| 卡 | 藥 | 中文樣板 | 同列英文 |
|---|---|---|---|
| **安宮牛黃丸** | **雄黃**（砷） | 健脾和中，調和諸藥。 | Dislodges Phlegm, resolves toxicity … **Toxic mineral; source data only.** |
| 安宮牛黃丸 | 麝香 | 和中健脾，調和諸藥。 | Aromatically opens Orifices and revives Shen. |
| 紫雪丹 / 蘇合香丸 | 麝香 | 和中健脾／健脾和中，調和諸藥。 | Opens Orifices and restores consciousness. |
| **定喘湯** | **麻黃（君）** | 健脾和中，調和諸藥。 | Induces sweating…Diffuses Lung qi and calms wheezing |
| **陽和湯** | **麻黃** | 健脾和中，調和諸藥。 | Releases Exterior and warms/disperses Cold. |
| **防风通圣散** | **麻黃（君）** | 健脾和中，調和諸藥。 | Releases Exterior, moves Lung Qi, stops wheeze… |
| **桂枝芍藥知母湯** | **麻黃（臣）** | 健脾和中，調和諸藥。 | Releases Exterior, disperses Cold, promotes urination… |
| **再造散** | **細辛** | 健脾和中，調和諸藥。 | Disperses Wind-Cold and warms channels. |
| **大黃附子湯** | **細辛** | 和中健脾，調和諸藥。 | Expels Cold and disperses accumulation. |
| **生化湯** | **桃仁** | 和中健脾，調和諸藥。 | Breaks Blood Stasis and invigorates circulation. |
| 復元活血湯 | 桃仁 · 紅花 · 酒洗大黃 | 和中健脾／健脾和中，調和諸藥。（僅 `actions_zh`，`in_formula_zh` 是對的） | Breaks Blood Stasis… / Invigorates Blood… / Drains accumulation… |
| **涼膈散** | **芒硝** | 健脾和中，調和諸藥。 | Softens hardness, purges Heat and assists downward drainage. |
| 桂枝茯苓丸 / 茯苓丸 | 芒硝 | 健脾和中，調和諸藥。 | Softens hardness and purges/loosens accumulated Phlegm… |

**同一列自相矛盾的變體**（`in_formula_zh` 對、`actions_zh` 是樣板）本批 4 卡：
復元活血湯（3 味）、實脾飲（炮薑，且英文那句正是「moderates Fu Zi toxicity」）、
生化湯（炮薑）、蘇合香丸（香附）、防风通圣散（荊芥）。
**渲染層讀哪一個，決定卡片說的是對的還是錯的**——與 batch 1 F-08 同一個未決問題。

其餘同族形狀（本批 7 列 / 全庫 40 列）：`in_formula_zh` 以「，緩解。」結尾，
最極端的是烏梅丸花椒 **`"緩解，緩解。"`**（整格只有這四個字）與紫雪丹硝石 **`"緩解。"`**。

---

### F-28 孕期禁忌：30 卡中 13 卡兩種語言都查不到「孕 / pregnan」 — **SAFETY（覆蓋缺口）**

判準：`contraindications_zh + cautions_zh` 全文含「孕」，或 `contraindications_en + cautions_en`
全文含 `pregnan`。兩者皆無 = absent。

**absent 13 卡**（括號內是該卡的孕期相關警訊藥）：

```
da_huang_fu_zi_tang(附子+大黃+細辛)   wen_pi_tang(附子+大黃)
zai_zao_san(附子+細辛)                gui_zhi_shao_yao_zhi_mu_tang(附子+麻黃)
ding_chuan_tang(麻黃)                 si_ni_tang(附子)
zhen_wu_tang(附子)                    shen_fu_tang(附子)
shi_pi_yin(附子)                      ma_xing_shi_gan_tang(麻黃)
yang_he_tang(麻黃)                    da_qing_long_tang(麻黃)
fu_ling_wan(芒硝)
```

**present 17 卡**（zh 與 en 都有）。

三個值得單獨看的形態：

1. **陽和湯**：`contraindications_en` 四條、`contraindications_zh` **三條**，
   被丟掉的正是 `"Do not alter the dosage of Hb. Ephedrae Ma Huang."`
   （它還活在 `cautions_zh[3]`「麻黃劑量不可任意增減」，但兩個陣列不同步）。
2. **小承氣湯**：`contraindications_zh` 4／`_en` 2，**多出來的中文兩條裡有「哺乳期婦女、小兒」**——
   全批唯一提到哺乳的卡，而英文讀者看不到。
3. **生化湯**：唯一同時有「孕婦禁用」與「有出血傾向或活動性出血疾病者禁用」的卡，
   是本批桃仁族覆蓋的正確樣板。

---

### F-29 附子族：炮製要求／先煎／烏頭鹼／心律不整，11 卡全數 absent — **SAFETY（覆蓋缺口）**

本批含附子（含生附子列）的 11 卡：
`da_huang_fu_zi_tang wen_pi_tang wu_mei_wan zai_zao_san gui_zhi_shao_yao_zhi_mu_tang
fu_zi_li_zhong_wan si_ni_tang zhen_wu_tang shen_fu_tang shi_pi_yin shen_qi_wan`

- 安全欄（`contraindications_*` / `cautions_*` / `safety_flags`）中出現「烏頭」「先煎」「久煎」
  「毒」「心律」「aconitine」任一字串的：**0 / 11**。
- `safety_flags` 有內容的：**0 / 11**（欄位多數根本不存在）。
- 唯一的毒性字樣在 `composition[].in_formula_en` 的 markdown 標註
  （`**Potentially toxic; processed form required.**` / `**…processing/dose matter.**`），
  **同列中文一律沒有**（F-26）。
- 唯一的中文毒性敘述在 **四逆湯 `chinese_depth_track.notes_zh`**：
  「原方是運用「生附子」，這是有強大毒性的。近代中醫師運用四逆湯，都是運用科學中藥…」——
  **partial**：講了，但講在深度區塊，不在安全欄，不會進安全篩選。

batch 1 F-04 已對金匱腎氣丸記過同一缺口。本批把它從 1 卡擴到 **12 卡**（含 batch 1 那張）。

---

### F-30 麻黃族：心血管／交互作用全數 absent，且「干擾素效益」主張擴散到第三張卡 — **SAFETY**

本批含麻黃的 6 卡：
`gui_zhi_shao_yao_zhi_mu_tang fang_feng_tong_sheng_san ding_chuan_tang
ma_xing_shi_gan_tang yang_he_tang da_qing_long_tang`

- 安全欄含「高血壓／心臟／心律／甲亢／青光眼／失眠／運動禁藥／MAOI／擬交感」任一：**0 / 6**。
- `safety_flags` 有內容：**0 / 6**。`herb_drug_cautions` 有內容：**0 / 6**。
- 唯一與麻黃有關的安全句是陽和湯的「麻黃劑量不可任意增減」，而它被排除在 `contraindications_zh` 之外（F-28）。

**干擾素方向問題（CONTENT_REQUEST §C 的直接證據擴大）**

CONTENT_REQUEST 記的是兩張卡：麻黃湯帶效益主張、小柴胡湯帶危害訊號。**本批找到第三張**：

```
formula.da_qing_long_tang.herb_drug_interactions_en[0] =
  "Concurrent use of this formula reduced the adverse effects of interferon in hepatitis C patients."
```

與 `formula.ma_huang_tang` 的
`"This formula may reduce the adverse effects of interferon in hepatitis C patients."`
是同一句的變體。也就是說：**兩張含麻黃的卡把干擾素寫成「本方減輕其副作用」，
一張（小柴胡湯）把干擾素寫成間質性肺炎訊號**，三張互不指涉。
CONTENT_REQUEST §C 請把 `da_qing_long_tang` 一併納入待查清單。

---

### F-31 `public_safe: true` 的七張卡，其中兩張連禁忌欄都不存在 — **SAFETY／治理（止血候選）**

batch 1 F-19 已把大黃牡丹湯與葛根湯降回 false（commit `1379063`）。本批命中 **7 筆**：

| id | 卡 | `review_status` | `contraindications_zh` | `actions_zh` |
|---|---|---|---|---|
| `shen_fu_tang` | 參附湯（含附子） | `sourced_cloudtcm_record` | **欄位不存在** | `["氣,陽", "溫中與補益心與腎陽於"]` |
| `shi_pi_yin` | 實脾飲（含附子） | `sourced_cloudtcm_record` | **欄位不存在** | `["溫中陽,健脾益氣,氣與促進於", "溫中腎與燥濕健脾陽"]` |
| `zi_xue_dan` | 紫雪丹（硃砂＋犀角＋青木香） | `draft` | 3（`_en` 4） | 5（`pattern_indications_zh[0]` = 「炎證」） |
| `fu_zi_li_zhong_wan` | 附子理中丸 | `sourced_cloudtcm_record` | 4 | 4 |
| `liang_ge_san` | 涼膈散（大黃＋芒硝） | `draft` | 3（禁用／慎用自相矛盾，見 F-35） | 2 |
| `shen_qi_wan` | 腎氣丸（含附子） | `sourced_cloudtcm_record` | 6 | 1 |
| `yang_he_tang` | 陽和湯（含麻黃） | `sourced_cloudtcm_record` | 3（漏掉麻黃那條） | 4 |

**最該立刻下架的兩張是參附湯與實脾飲**：它們同時滿足
（a）`public_safe: true`、（b）含制附子、（c）**整張卡沒有任何禁忌或慎用欄位**、
（d）`actions_zh` 是無法閱讀的字串。參附湯還是回陽固脫的急救方。
判準與 batch 1 F-19 的葛根湯（空功效＋含麻黃＋public）**完全同型**，
那一張已經被裁定要下架，這兩張比它更嚴重（葛根湯至少有結構性說明的禁忌欄）。

全庫 `public_safe: true` = **58**（batch 1 記 60，差 2 = 已下架的兩張）。
`review_status` 非 draft/skeleton：本批 10 筆。

---

### F-32 桂枝茯苓丸的整張組成表是茯苓丸的（逐欄逐值相同） — **SAFETY/CLINICAL（本批最嚴重）**

```
formula.gui_zhi_fu_ling_wan.composition
  [0] 茯苓   6g  君
  [1] 枳殼   3g  臣
  [2] 制半夏 9g  佐
  [3] 芒硝   3g  佐

formula.fu_ling_wan.composition
  [0] 茯苓   6g  君
  [1] 枳殼   3g  臣
  [2] 制半夏 9g  佐
  [3] 芒硝   3g  佐
```

兩筆的 `herb_zh` / `dose_g` / `role_zh` / `in_formula_zh` / `in_formula_en` **逐字相同**。
汙染不只在組成：

- `gui_zhi_fu_ling_wan.actions_en = ["Dries Dampness","Moves Qi","Transforms Phlegm"]` ← 茯苓丸的
- `gui_zhi_fu_ling_wan.pattern_indications_en[0] = "Phlegm-Dampness in the Middke Jiao"`
  ← 茯苓丸的，連 `Middke` 這個錯字都一起搬過來
- `gui_zhi_fu_ling_wan.category_zh = "祛痰劑"`（茯苓丸的分類），而 `category = "理血劑 / Regulate Blood"`
- `english_exam_track.pattern_indications_zh[0] = "痰-濕inMiddkeJiao證"`（英文碎片留在 `_zh`）

**本方真正的內容還在，散在三處**：
`actions_zh = ["活血化瘀","緩消癥塊"]`、
`pattern_indications_zh = ["婦人宿症、瘀血阻滯胞宮證","產後惡露不盡、腹痛拒按證"]`、
以及 **`action_profile.groups_herbs`：桂枝 9g／赤芍 9g／牡丹皮 9g／茯苓 9g／桃仁 9g**
——那才是桂枝茯苓丸。

**臨床後果**：一張 `on_board_list: true`、`exam_star: 1` 的婦科方，
組成表列出**本方沒有的芒硝**（瀉下礦物鹽，孕婦禁），
而**漏掉本方真正需要警戒的桃仁**（破血，孕婦禁）。
同卡的禁忌欄寫的是桂枝茯苓丸的「有故無殞」孕期論述（品質很好，見 F-45），
所以**卡片一邊講孕期怎麼用桃仁類方、一邊在成分表印芒硝**。

**重現**：把每筆 `composition` 壓成 `herb_zh|dose_g` 簽章比對，全庫只有兩組重複，
另一組是 `shen_qi_wan == jin_gui_shen_qi_wan`（F-41）。

---

### F-33 定喘湯：`actions_zh` 是 67 條 CloudTCM 全文，`pattern_indications` 是別的方 — **CLINICAL**

- `actions_zh` **67 條**（F8 上限是 8；全庫超標的只有 2 筆，這是其中之一）。
  前 35 條每條以字面 `:` 開頭，內容是整篇文章的段落，例如
  `actions_zh[0] = ":組成及藥物分析"`、`actions_zh[24] = ":加減應用："`、
  `actions_zh[34] = ":醫家觀點比較"`——**網頁章節標題進了功效欄**（教訓 1 同族）。
- `actions_en` 的內容是**中文**：`["Action: 咳嗽","Action: 氣喘","Action: 胸悶"]`，
  `english_exam_track.actions_en` 35 條全部是 `"Action: <中文>"`。（紅線 5 的反向違反；全庫 8 筆，本批 2 筆）
- **`pattern_indications_zh` 講的是別的方**：

  > `[0]` 「調和派：也有醫家持調和態度，如汪昂認為此方雖有爭議…**費伯雄則認為方中四物俱備，
  > 不可謂無血藥，但建議減去石膏、細辛。**」
  > `[4]` 「關於真中與類中：林佩琴提出「真中」和「類中」的概念，並認為定喘湯適用於「真中」之風邪在經。」

  定喘湯的組成裡**沒有石膏、沒有細辛、沒有四物**，也不是中風方。
  「四物俱備／石膏／細辛／真中類中」是**大秦艽湯**條下的歷代爭議。整段是接錯方。
- 更麻煩的是 `composition[1]`：`herb_zh = "銀杏"`、無 `herb_id`，而同卡自己的 `actions_zh` 全文
  一律寫「**白果**：斂肺定喘」。其 `elucidation_zh` 描述的是**銀杏葉**
  （「銀杏葉能清熱解毒、擴張支氣管」）並把定喘湯組成說成「包括麻黃、杏仁、半夏、厚朴、甘草、
  生薑、細辛以及銀杏」——又一段別的方。白果／銀杏葉是兩種不同藥材，白果本身有毒性
  （銀杏毒素，生食中毒），全卡無任何提示。
- `contraindications_en` 是**空陣列**（`contraindications_zh` 有 3 條）。
  `cautions_zh[0]` 是把三條用 `\n` 黏成的**單一字串**，與 `contraindications_zh` 的三元素陣列形狀不同。
- `category = "理氣劑 / Regulate Qi"`、`comparison_group = "qi_regulation"`、
  `related_formulas` 四筆全是理氣劑，但 `category_zh = "祛痰劑"`。分類層自相矛盾。

**這是本批最壞的單卡**，而且它是派工單點名的起手方。

---

### F-34 參附湯／實脾飲的 `actions_zh` 是無法閱讀的字串，且卡片是 public — **SAFETY/CLINICAL**

```
formula.shen_fu_tang.actions_zh  = ["氣,陽", "溫中與補益心與腎陽於"]
formula.shen_fu_tang.actions_en  = ["Strongly augments Yuan Qi, rescues Yang from collapse",
                                    "Warms and tonifies Heart and Kidney Yang in critical emergencies"]

formula.shi_pi_yin.actions_zh    = ["溫中陽,健脾益氣,氣與促進於", "溫中腎與燥濕健脾陽"]
formula.shi_pi_yin.actions_en    = ["Warms Yang, strengthens Spleen, moves Qi and promotes urination",
                                    "Warms Kidneys and dries Dampness for severe Yang Deficiency edema"]
```

生成方式看得出來是**逐詞替換英文後把殘餘連接詞留下**（batch 1 F-07 的同一支腳本，
但那批的殘骸在 `english_exam_track`，這兩張是在 **record 層**，也就是沒有乾淨的正本可以鏡射）。
「氣,陽」是兩個字加一個半形逗號，「促進於」「腎陽於」不是中文詞。

兩張都 `public_safe: true`（F-31）。**§1 區塊 5「功效」是必填區塊**，
所以卡片上這一格印的就是這些字。

---

### F-35 同一張卡的 `contraindications_zh` 說「禁用」、`cautions_zh` 說「慎用」 — **SAFETY**

batch 1 F-03 記的是英文側（`Use with caution` 被腳本改寫成 `Contraindicated`）。
本批發現**中文側的鏡像**：同一條英文原句被分別譯進兩個陣列，強度卻不同。

| 卡 | 英文原句 | `contraindications_zh` | `cautions_zh` |
|---|---|---|---|
| **涼膈散** | `"Weak patients."` | 體虛者**禁**用 | 體虛者**慎**用 |
| **涼膈散** | `"Pregnancy."` | 孕婦**禁**用 | 孕婦**慎**用 |
| **真武湯** | `"Heat conditions."` | 熱證者**禁**用 | 熱證者**慎**用 |
| **真武湯** | `"Water accumulation due only to Excess conditions."` | 純屬實證所致水腫者**禁**用 | 純屬實證所致水腫者**慎**用 |
| **獨活寄生湯** | `"Contraindicated for Bi syndrome marked by strong Excess or Damp-Heat."` | 痹證之屬濕熱實證者**忌**用。 | 痹證之屬濕熱實證者**禁**用 |

**根因看得出來**：英文原文（涼膈散、真武湯）是**沒有方向詞的名詞片語**
（`"Weak patients."` / `"Pregnancy."` / `"Heat conditions."`），
中譯時方向由譯者補，兩次補得不一樣。
`contraindications_en[0] = "Heat conditions."` 這種寫法本身就是問題：
英文讀者拿到的是一個沒有動詞的名詞，方向只能靠欄位名推測。

**至寶丹**是更亂的版本：`contraindications_zh` **8 條**、`_en` 7 條，
`[0]` 與 `[4]` 都是「孕婦禁用」（重複），`[7]` 又寫「孕婦**慎**用」，
而 `cautions_zh[0]` = 孕婦禁用、`cautions_zh[4]` = 孕婦慎用。
**同一張卡對孕婦同時說禁用（兩次）與慎用（兩次）。**

---

### F-36 牽正散的英文毒性警告點名了本方沒有的藥 — **SAFETY**

```
formula.qian_zheng_san.composition = [白附子(君), 白殭蠶(佐), 全蠍(佐)]

contraindications_en[3] = "Bai Fu Zi and Wu Gong are toxic. Do not exceed a dosage of 6gt."
cautions_en[3]          = 同上
```

**蜈蚣（Wu Gong）不在本方組成裡。** 同一張卡的中文寫的是正確的兩味：

```
contraindications_zh[2] = "方中白附子和全蠍有一定的毒性，用量宜慎。…"
cautions_zh[3]          = "白附子與全蠍有毒，劑量不可超過6克"
```

也就是 zh/en 長度都是 5、逐索引對得上，**但第 3 條講的是不同的藥**——
batch 1 F-02 說的「長度相同但語義錯位，驗證器 F4 抓不到」的新實例。
`6gt` 還是個錯字（`6g`）。

附帶：白附子（Rz. Typhonii）與附子（Rx. Aconiti）是兩種不同的毒藥，
本卡 `herb_id: herb.bai_fu_zi` 是對的，但 `herb_zh: "Zhi Bai Fu Zi"` 是拼音，
在中文介面上兩者更容易混淆。

---

### F-37 `herb_drug_interactions_en` 裝的是療效主張（本批 3 筆，全是新增實例） — **SAFETY**

batch 1 F-06 記過六味地黃丸與加味逍遙散。本批三筆，全部無 `field_sources`：

```
formula.shen_qi_wan:
  "This formula may be effective in treating side effects and adverse reactions, including
   dizziness, weight gain, perspiration and emotional disturbances associated with
   long-term prednisone use."

formula.xiao_cheng_qi_tang:
  "This formula has been shown to be effective at relieving constipation and nausea caused by
   excessive use of opioid analgesics."

formula.da_qing_long_tang:
  "Concurrent use of this formula reduced the adverse effects of interferon in hepatitis C patients."
```

三句都是「本方可以改善某西藥的副作用」，放在**藥物交互作用**欄。
執業者打開交互作用欄想看的是「這個方跟病人在吃的藥會不會打架」，
拿到的是「這個方可以用來治那個藥的副作用」——**方向相反**。
`shen_qi_wan` 那句尤其危險，因為長期類固醇病人正是最需要看交互作用的一群。

本批 `herb_drug_interactions_en` 有內容的就這三筆，**三筆全屬此族**。

---

### F-38 `english_exam_track.pattern_indications_zh` 的假中文，並出現方向相反的譯法 — **CLINICAL**

`english_exam_track.source_note` 自己寫著「渲染層優先讀本區」。
degenerate 條目判準（開頭是 `-`／`與`／`兼`／`所致之`，或含三個以上連續拉丁字母，
或整條 ≤3 字）：**全庫 47 筆，本批 9 筆**。

| 卡 | 原文 |
|---|---|
| 至寶丹 | `["-痰熱證","中暑證","-證","-證","與所致之痰熱證"]` |
| 蘇合香丸 | `["-所致之阻-證","所致之證","所致之證"]` |
| 安宮牛黃丸 | `["-證","-證","所致之-證"]` |
| 獨活寄生湯 | `["兼與證","兼氣血兩虛證","痿證病"]` |
| 牽正散 | `["-證","-阻經頭與證"]` |
| 桂枝茯苓丸 | `["痰-濕inMiddkeJiao證"]` ← 英文原文碎片留在 `_zh` |
| 烏梅丸 | `["與證"]` |
| **小承氣湯** | `["過度證","初期證"]` |
| **四逆湯** | `["過度證"]` |

**最該優先處理的是「過度證」**，因為它不只是不通順，**方向是反的**：

```
小承氣湯 pattern_indications_en[0] = "Relatively mild Colon Excess Heat"
小承氣湯 pattern_indications_zh[0] = "過度證"          ← 「過度」＝ excessive
四逆湯   pattern_indications_en[4] = "Excess use of diaphoretics in Tai Yang Stage leading to loss of Yang"
四逆湯   english_exam_track.pattern_indications_zh[4] = "過度證"
```

小承氣湯是承氣三方裡**最輕**的一方，它跟大承氣湯的鑑別（輕／重）正是考點；
卡片把「相對輕證」印成「過度證」，等於把鑑別點反過來寫。
`小承氣湯` 的 record 層與 `english_exam_track` 兩處都是「過度證」，沒有乾淨的正本。

---

### F-39 `_zh` 玻璃殘骸：孕期相關條目塌成同一個字串 — **CLINICAL**

batch 1 F-09 記過全庫規模（93 筆 / 345 條）。本批的 16 條殘骸（每條在
`modern_applications_zh` 與 `treats_zh` 各出現一次，共 32 行）中，
**最刺眼的是孕期那一族又出現了，而且落在孕婦禁用的方上**：

| 卡 | 英文原文 | 中文結果 |
|---|---|---|
| **生化湯** | `Vaginal bleeding during pregnancy` | **（妊娠期）** |
| **生化湯** | `Unpleasant symptoms during pregnancy` | **（妊娠期）** |
| 真武湯 | `Pain in the midline and back during pregnancy` | （妊娠期） |
| 腎氣丸 | `Dysuria during pregnancy` | （妊娠期） |
| 腎氣丸 | `Acute myelitis (inflammation of the spinal cord)` | `( )` |
| 腎氣丸 | `Amyotrophic lateral sclerosis (ALS)` | `()` |
| 腎氣丸 | `Post-surgical urinary incontinence` | `- 尿失禁` |
| 腎氣丸 | `Chronic Functional Immuno-Deficiency Syndrome (CFIDS)` | `- ()` |
| 真武湯 | `Chronic obstructive pulmonary disease (COPD)` | `()` |
| 大承氣湯 / 小承氣湯 | `Early-stage dysentery` | `- 痢疾` |
| 大承氣湯 / 小承氣湯 | `Pneumonia (especially in children)` | `( )` |
| 蘇合香丸 | `Thoraco-abdominal distention with chills due to breathing in of dirt and noxious air` | `-腹脹` |
| 桂枝芍藥知母湯 | `Arthralgia (Wandering Bi)` | `( )` |

**生化湯那兩條是本批的代表**：一張 `contraindications_zh[2] = "孕婦禁用"` 的卡，
在「可改善疾病」清單裡印了兩個「（妊娠期）」——其中一條的原文是**妊娠期陰道出血**。
中文讀者看到的是「生化湯 → （妊娠期）」。

`treats_zh` 與 `modern_applications_zh` 逐字相同：**本批 26/30**（batch 1 記全庫 197 筆），
所以每一條殘骸都被印兩次。FB-4 若落地可省一半工。

---

### F-40 組成不完整、`action_profile` 與 `composition` 講不同的方 — **CLINICAL**

- **至寶丹** `composition` 只有 6 味（水牛角、犀角、牛黃、雄黃、金箔、銀箔），
  缺硃砂、玳瑁、琥珀、麝香、龍腦、安息香。而同卡 `action_profile.groups_herbs` 列的是
  **茯神 40g、滑石 30g、陳皮 30g、莪朮 30g、木香 30g、三棱 30g、青皮 25g、白朮 40g、
  山藥 40g、益智仁 25g、甘草 30g、麝香 5g、遠志 40g**（`herb_count: 13`）——
  **十三味沒有一味出現在 composition 裡**，那一組是一個消積類的方。
  也就是「本方分量分布」這一區在講另一張卡。
- **桂枝茯苓丸**：反過來，`action_profile` 是對的、`composition` 是錯的（F-32）。
- `composition[].herb_id` 為空字串：本批 3 列
  （生化湯 炮薑、實脾飲 炮薑、**復元活血湯 穿山甲**）／全庫 10 列。
  穿山甲那列 `actions_zh` 與 `role_reason_zh` 也是空字串，
  而英文寫著 `**obsolete/protected animal substance in modern practice**`——
  CITES 附錄一物種的說明在中文側整格空白（F-26 同族）。

---

### F-41 同一個方兩筆記錄：`shen_qi_wan` 與 `jin_gui_shen_qi_wan` — **QUALITY／治理**

`composition` 簽章（`herb_zh|dose_g` 逐味）**完全相同**：

```
熟地黃|8-30g // 山茱萸|4-20g // 山藥|4-15g // 制附子|1-15g //
(桂枝)|1-9g // (肉桂)|3-5g // 澤瀉|3-15g // 茯苓|3-15g // 牡丹皮|3-15g
```

`jin_gui_shen_qi_wan` 是 batch 1 讀過的第 11 筆（links 8、`nccaom_high_yield: true`、
`on_board_list: false`）；`shen_qi_wan` 是本批第 23 筆（`public_safe: true`、
`on_board_list: true`、`exam_star: 1`）。兩筆的 `exam_importance` 互相矛盾
（一筆寫「非考綱」、一筆寫「★ 官方應試方劑」），而它們是同一個方。
病歷若掛到不同 id，統計會分裂。**需要 Ting 裁定合併方向**（紅線 2：退役用 `deprecated`，不硬刪）。

---

### F-42 已過期的施工註記仍留在卡上，與現況矛盾 — **QUALITY**

batch 1 F-18 記過膈下逐瘀湯的 `composition_cleared_note` 過期。本批 8 筆／全庫 50 筆：

- `composition_cleared_note = "原本的組成是方名去掉劑型後綴，並非真實藥材"`
  仍留在 **參附湯(2 味)、腎氣丸(9 味)、實脾飲(13 味)、陽和湯(7 味)** 上，
  而這四張的組成都已經是真實藥材。
- `needs_fill = "骨架記錄：僅有考綱的官方方名。組成、君臣佐使、功效、主治、禁忌全部待從
  curriculum/formulas 補齊"` 仍留在 **大青龍湯(7 味)、防风通圣散(18 味)、復元活血湯(8 味)、
  桂枝芍藥知母湯(9 味)** 上，四張都已有完整組成、君臣佐使與功效。
  其中 `da_qing_long_tang` 與 `gui_zhi_shao_yao_zhi_mu_tang` 的 `review_status` 還是 `"skeleton"`，
  以「骨架」的身分帶著完整內容，任何以 `review_status` 篩選的流程都會漏掉它們。

同族：`source_classic = ""`（大青龍湯、桂枝芍藥知母湯、復元活血湯、防风通圣散——
四張都是有明確出典的經方）。

---

### F-43 HTML entity 殘留新實例（FB-11 之後又出現一筆） — **QUALITY**

batch 1 FB-11 清掉了 `&hellip;`（`xiao_chai_hu_tang`，commit `4a028d4`）。
全庫重掃 `&(ldquo|rdquo|hellip|nbsp|amp|quot|lsquo|rsquo);` → **現存 1 筆**：

```
formula.xiao_cheng_qi_tang.chinese_depth_track.notes_zh 末句：
  「註1:趙艷,王彥剛,高婧珊,等.從&ldquo;臟腑別通&rdquo;理論再議脾約證[J].中醫學報,2025」
```

FB-11 只處理了 `&hellip;`，`&ldquo;/&rdquo;` 不在那次的樣式裡。

同族欄位誤用：`xiao_cheng_qi_tang.modern_research_zh[0]` 整條是一串參考文獻
（`"註2:尹東閣,杜豫吉,孔佳輝,等.經典名方小承氣湯對胃黏膜的保護作用…"`），
不是研究結論；它是 `applications_zh[0]` 末尾 `(註2)` 的註腳被拆成獨立欄位。

---

### F-44 無來源的藥理主張（batch 1 F-15(b) 同族，本批新增） — **CLINICAL**

- **麻杏石甘湯** `pharmacology_zh`（無 `field_sources.pharmacology_zh`）：
  > 「近年研究發現，麻杏石甘湯能降低肺組織中**血管緊張素轉化酶2（ACE2）**的表達
  > （這可能是其干擾新冠病毒的機制之一）…」

  同卡 `applications_zh[1]` 列「新型冠狀病毒感染」「肺癌化療輔助治療」，
  開頭寫「若分析超過2000篇期刊論文」而無任何引用。
- **四逆湯** `applications_zh[11]`：
  > 「各種癌症輔助治療：多數癌症最後都是落於三陰病…對於癌症治療**有輔助效果**。」

  同欄 `[8]` 還把「長期難以治癒的吐血、牙齒流血、便血」列為適應症——
  一個大辛大熱的回陽方被列為慢性出血的用方，而全卡沒有相應的出血警語。
- **大承氣湯** `chinese_depth_track.notes_zh` 是一段醫話軼事
  （張錫純鄰居服兩劑大承氣湯不瀉、劉肅亭加一味威靈仙即通），
  與 batch 1 F-23 桂枝湯「汗出過多加威靈仙」是同一個來源味道，兩處都需要查證。

---

### F-45 做對的地方（供 CONTENT_REQUEST 與後續批次照抄） — **正面**

慎用藥覆蓋做得最好的四個樣板，都不是機器產的：

1. **安宮牛黃丸 `safety_flags`** —— 本批唯一非空的 `safety_flags`，而且是**逐項可機讀**的：
   ```
   ["toxic_mineral_review","realgar_arsenic_review","cinnabar_mercury_review",
    "pregnancy_contraindicated","emergency_formula","professional_supervision_required"]
   ```
   加上 `clinical_pearls[2]`「含雄黃、硃砂，美國臨床須視為毒性礦物審核項」、
   `clinical_use_note`「僅作內部學習與來源追蹤，不作自行用藥建議」、
   `english_exam_track.notes[0]`「American Dragon exact formula page not found in this review pass;
   do not cite AD as a formula source for this card」（誠實記錄查無來源）。
   **這是 CONTENT_REQUEST B 段想要的成品長相**，建議直接當 flag 詞彙表的種子。
   （唯一的洞是 §F-25 的劑量與 §F-27 的雄黃樣板句——旗標對了，欄位內容沒跟上。）

2. **牽正散 `contraindications_zh[2][3]`** —— 本批最完整的中文毒性敘述，
   而且四個要素齊備（毒性、劑量上限、不宜久服、須醫師辨證指導、炮製減毒、配伍減副作用）：
   > 「方中白附子和全蠍有一定的毒性，用量宜慎。…必須在中醫師的辨證論治指導下使用，
   > 嚴格控制劑量，且不宜久服。臨床上常使用經過炮製的藥材以減低毒性…」

   問題只在英文側點錯了藥（F-36）。**中文是可用的正本。**

3. **桂枝茯苓丸 `contraindications_zh`** —— 孕期論述有分寸、有古典依據、有停藥條件：
   > 「本方爲活血化淤消癥之方，如正常妊娠下血者則當慎之，孕婦及產後必須格外小心。僅用於有血瘀者。」
   > 「…雖屬有故無須（＝有故無殞），但仍需注意中病即止，不可過服。若陰道下血反多，
   > 腰痠腹痛較甚，則非本方所宜，當辨而治之。」

   `field_sources.contraindications_en[0]` 註明「Claude 逐條忠實翻譯既有 contraindications_zh」——
   翻譯方向被記下來了，這是 R2 慣例該有的樣子。（唯一的洞是組成表接錯，F-32。）

4. **烏梅丸 `correction_note`** —— batch 1 F-24 讚許的葛根湯格式，在這裡被完整重演：
   11 條原始 `actions_zh` 一字未刪、逐條寫明去向（併入哪一條功效／移到主治／
   「非 SOL 三條功效之一，留存於 english_exam_track」），並註明 `source_classic`
   從《傷寒雜病論》改為篇目是「同一書的更精確出處，非改寫」。**先搬再改，順序正確。**
   **蘇合香丸 `correction_note`** 同樣誠實：記下 `actions_zh` 原誤作「清熱解表、調理氣血」
   （溫開劑寫成清熱）已依課件更正，並主動指出「課件標 4 味君藥，與 F7『君藥 1-2 味』不符，
   需 Ting 裁定，故本卡尚未列為已整理」——**發現規則衝突就停下來問**（憲法第三部分）。
   （但 F-27 指出更正後的 `actions_zh[4]` 仍是「清熱化痰」，方向錯誤沒清乾淨。）

其他做對的：
- **四逆湯 `chinese_depth_track.fang_yi_zh`** 引《本經疏證》卷10 原文解釋薑附相配，
  是本批中文深度層品質最高的一段。
- **大承氣湯 `pharmacology_zh`** 寫明「久煎時會使瀉下成份破壞…故本方用生大黃，并宜後下」——
  **本批唯一寫到煎法要求的地方**（可惜不在安全欄，判為 partial）。
- **涼膈散 / 參附湯 `field_sources.exact_source_url`** 帶著 FB-10 的修正說明與原值，
  修改可追溯。

---

## §3 總結、慎用藥覆蓋矩陣、下一步

### 數字（每一格都能由 `data/herbs/formulas.json` + §2 的判準重算）

| 指標 | 本批 30 筆 | 全庫 224 筆 |
|---|---|---|
| CLEAN / MINOR / DEFECT | 0 / 0 / 30 | — |
| findings 條數 | 21（F-25…F-45） | — |
| 其中 SAFETY | 9（F-25…F-32, F-35, F-36, F-37） | — |
| 其中 CLINICAL | 7 | — |
| 其中 QUALITY | 4 | — |
| `contraindications` zh/en 長度不等 | 8 | **54** |
| `cautions` zh/en 長度不等 | 2 | **21** |
| **有組成但 `contraindications_zh` 與 `cautions_zh` 皆無** | **4** | **34** |
| `safety_flags` 空或不存在（有組成） | **29/30** | **198** |
| `"for those with for those with"` | 2 | 14 |
| 慎用藥列帶樣板句 | **17 列 / 13 卡** | 35 列 |
| `in_formula_zh` 以「，緩解。」結尾 | 7 列 | 40 列 |
| 毒藥列中文全空、英文有毒性字樣 | **6 列** | 8 列 |
| 中文欄含 `**` markdown 殘骸 | 5 列 | 7 列 |
| `english_exam_track.pattern_indications_zh` 殘骸 | 9 筆 | 47 筆 |
| `_en` 陣列內含中文 | 2 筆（定喘湯 46 條） | 8 筆 |
| `actions_zh` > 8 條（F8 上限） | 1（定喘湯 67 條） | 2 |
| `treats_zh` ≡ `modern_applications_zh` | 26/30 | — |
| `composition[].herb_id` 為空 | 3 列 | 10 列 |
| 過期 `needs_fill` / `composition_cleared_note` | 8 | **50** |
| `public_safe: true` | **7** | **58** |
| `review_status` 非 draft/skeleton | 10 | — |
| HTML entity 殘留 | 1 | 1 |
| 組成簽章重複的方對 | 2 對 | 2 對 |

### 慎用藥覆蓋矩陣（藥 × 卡 × present/partial/absent）

判準見 §0。**「招牌警告」逐藥的定義取自 CONTENT_REQUEST B 段的九列。**

#### 附子／川烏（招牌：炮製要求 · 劑量上限與久煎/先煎 · 孕婦禁 · 心律不整 · 中毒徵象）

| 卡 | 炮製/先煎 | 劑量上限 | 孕婦 | 心律/毒性徵象 | 總評 |
|---|---|---|---|---|---|
| 大黃附子湯 | absent | absent | **absent** | absent | **absent** |
| 溫脾湯 | absent | absent | **absent** | absent | **absent** |
| 烏梅丸 | partial（`in_formula_en` 有 "processed form required"，zh 無） | absent | present | absent | **partial** |
| 再造散 | absent | absent | **absent**（禁忌欄整個是空陣列） | absent | **absent** |
| 桂枝芍藥知母湯 | partial（僅 en） | absent | **absent**（禁忌三欄皆空） | absent | **partial** |
| 附子理中丸 | partial（僅 en） | absent | present | absent | **partial** |
| 四逆湯 | partial（僅 `notes_zh`，且是生附子） | absent | **absent** | absent | **partial** |
| 真武湯 | absent | absent | **absent** | absent | **absent** |
| 參附湯 | absent | absent | **absent**（無安全欄） | absent | **absent** |
| 實脾飲 | partial（`炮薑 in_formula_en` 寫 "moderates Fu Zi toxicity"，zh 為樣板句） | absent | **absent**（無安全欄） | absent | **absent** |
| 腎氣丸 | absent | absent | present | absent | **partial** |

→ **11 卡：present 0 · partial 5 · absent 6。先煎/久煎 0/11，心律不整 0/11。**

#### 麻黃（招牌：心血管/甲亢/青光眼/失眠 · 孕婦 · 運動禁藥 · MAOI/擬交感/咖啡因交互）

| 卡 | 心血管 | 孕婦 | 交互作用 | 總評 |
|---|---|---|---|---|
| 桂枝芍藥知母湯 | absent | **absent** | absent | **absent** |
| 防风通圣散 | absent | present | absent | **partial** |
| 定喘湯 | absent | **absent** | absent | **absent** |
| 麻杏石甘湯 | absent | **absent** | absent | **absent** |
| 陽和湯 | absent | **absent** | partial（`cautions_zh` 有「麻黃劑量不可任意增減」，但被排除在 `contraindications_zh` 外） | **partial** |
| 大青龍湯 | absent | **absent** | **wrong-direction**（干擾素效益主張，F-30） | **absent** |

→ **6 卡：present 0 · partial 2 · absent 4。心血管 0/6，麻黃素交互 0/6。**
（batch 1 的麻黃湯、小青龍湯、葛根湯合計後，麻黃族全 9 卡仍是 present 0。）

#### 大黃／芒硝（招牌：孕婦 · 哺乳 · 月經期 · 脾胃虛寒 · 久服依賴）

| 卡 | 孕婦 | 哺乳 | 月經期 | 脾胃虛寒 | 久服 | 總評 |
|---|---|---|---|---|---|---|
| 大黃附子湯 | **absent** | absent | absent | present（虛寒者禁用） | absent | **partial** |
| 溫脾湯 | **absent** | absent | absent | absent | absent | **absent** |
| 大承氣湯 | present | absent | absent | present | present（中病即止） | **partial** |
| 小承氣湯 | present | **present（zh 獨有）** | absent | present | absent | **partial** |
| 涼膈散 | present（但禁/慎矛盾） | absent | absent | present | present（去大黃） | **partial** |
| 防风通圣散 | present | absent | absent | present（虛證禁用） | absent | **partial** |
| 復元活血湯 | present | absent | absent | present | absent | **partial** |
| 紫雪丹 | present | absent | absent | absent | present | **partial** |
| 桂枝茯苓丸 | present | absent | absent | absent | present | **partial** |
| 茯苓丸 | **absent** | absent | absent | present | present | **partial** |

→ **10 卡：present 0 · partial 8 · absent 2。哺乳 1/10，月經期 0/10。**

#### 細辛（招牌：劑量上限爭議「細辛不過錢」· 馬兜鈴酸現況）

| 卡 | 劑量上限 | 馬兜鈴酸 | 卡上 `dose_g` | 總評 |
|---|---|---|---|---|
| 大黃附子湯 | absent | absent | `1-6g` | **absent** |
| 烏梅丸 | absent | absent | **`1-28g`** | **absent** |
| 再造散 | absent | absent | `3g` | **absent** |
| 獨活寄生湯 | absent | absent | `1-6g` | **absent** |

→ **4 卡全 absent。馬兜鈴酸 0/4**（與 batch 1 的木通缺口同一個洞）。
附註：紫雪丹的 `(青木香)` 是馬兜鈴科，英文寫了 `unsafe/obsolete`、**中文整格空白**。

#### 朱砂／雄黃（招牌：重金屬 · 台灣/美國法規現況 · 不可加熱 · 不可久服）

| 卡 | 重金屬字樣 | 法規現況 | 加熱/久服 | 劑量 | 總評 |
|---|---|---|---|---|---|
| 安宮牛黃丸 | **present**（`safety_flags` realgar_arsenic / cinnabar_mercury） | present（`clinical_pearls[2]` 美國毒性礦物審核） | present | **wrong**（雄黃 1-30g） | **partial（旗標 present，劑量錯）** |
| 紫雪丹 | partial（只寫「硃砂不宜大量或長期服用」，無汞字） | absent | present | **wrong**（硃砂 0.9-2g、麝香 0.3-0.8g） | **partial** |
| 至寶丹 | absent（`safety_flags: []`，雄黃在中文是「燥濕健脾。」） | absent | present（不可加熱、不宜長期） | **wrong**（雄黃 30g） | **partial** |
| 磁朱丸 | absent（中文三欄全空） | absent | partial（「長期治療宜謹慎」） | **wrong**（硃砂 3-30g） | **absent** |
| 蘇合香丸 | absent（中文三欄全空） | absent | present（不宜大量或長期） | **wrong**（硃砂 .5-60g） | **partial** |

→ **5 卡：present 0 · partial 4 · absent 1。汞/砷字樣只有 1/5，法規現況只有 1/5，
劑量 5/5 錯。**

#### 全蠍／蜈蚣／水蛭（招牌：孕婦禁 · 過敏 · 劑量）

| 卡 | 孕婦 | 過敏 | 劑量 | 總評 |
|---|---|---|---|---|
| 牽正散（全蠍） | present | absent | present（zh「不可超過6克」；en 點錯藥，F-36） | **partial** |

→ **1 卡 partial。全庫其餘蟲類藥方本批未取樣（見「下一批」）。**

#### 桃仁／紅花／三稜／莪朮（招牌：孕婦禁 · 出血傾向/抗凝併用）

| 卡 | 孕婦 | 出血/抗凝 | 總評 |
|---|---|---|---|
| 復元活血湯（桃仁+紅花） | present | absent | **partial** |
| 生化湯（桃仁） | present | **present**（「有出血傾向或活動性出血疾病者禁用」） | **present** |
| 桂枝茯苓丸（組成表無桃仁，F-32） | present | absent | **partial（且組成不可信）** |

→ **3 卡：present 1 · partial 2 · absent 0。生化湯是全批唯一 present。**

#### 半夏／甘草（CONTENT_REQUEST 也列了，本批順帶盤點）

- **半夏**（定喘湯、桂枝茯苓丸、茯苓丸）：炮製別禁忌 0/3、孕婦 1/3、十八反（與烏頭類）**0/3**。
  注意 **烏梅丸同時含制附子**、**桂枝芍藥知母湯同時含附子**——若日後加減涉及半夏，
  十八反是必須有的機讀旗標，目前全庫沒有這個欄位。
- **甘草**（本批 14 卡含甘草/炙甘草）：假性醛固酮增多、與利尿劑/強心苷交互 **0/14**。
  防风通圣散 `甘草 dose_g "3-60g"`（60g 長期＝典型假性醛固酮增多劑量）。

### FB 系列（機械批次候選，接續 batch 1 的 FB-13）

| id | 內容 | 影響範圍 | 風險 | 備註 |
|---|---|---|---|---|
| **FB-14** | 毒性礦物／慎用藥 `dose_g` 超出藥典上限的 worklist（判準：§F-25 的對照表） | 本批 14 列，全庫待掃 | 低（只讀） | **建議與 FB-19 一起最先做** |
| **FB-15** | `composition[].*_zh` 含 `**` 或為空而 `*_en` 帶 toxic/obsolete/endangered/unsafe 的 worklist | 15 列（7+8） | 低（只讀） | **不可自動翻**——譯文屬安全主張，須具名來源 |
| **FB-16** | `&ldquo;/&rdquo;` 殘留 1 筆（`xiao_cheng_qi_tang`） | 1 筆 | 低 | FB-11 的樣式沒涵蓋，純機械 |
| **FB-17** | 過期 `needs_fill` / `composition_cleared_note`（組成已填滿者） | 50 筆 | 中（屬刪除，須 Ting 過目） | 同批可修 `review_status: "skeleton"` 但內容完整的 2 筆 |
| **FB-18** | `treats_zh` ≡ `modern_applications_zh` 的重複層（延伸 FB-4） | 本批 26/30 | 低（可先只改渲染） | 決定保留哪一份，殘骸就只需修一次 |
| **FB-19** | `public_safe: true` 的 7 筆降回 false | 7 筆 | 低（旗標翻轉）／**須 Ting 核可** | **參附湯與實脾飲最急**：public + 附子 + 零禁忌欄 + 亂碼功效 |
| **FB-20** | 組成簽章重複偵測固化成 `scripts/` 檢查 | 現有 2 對 | 低 | 這次靠它抓到 F-32；沒有它下次還是靠運氣 |
| **FB-21** | 「機器產生的假區間」偵測（同一卡多味 `dose_g` 完全相同，或上限一律 `-60g`/`-30g`） | 本批 2 卡 19 味 | 低（只讀） | 與 FB-14 共用輸出格式 |
| **FB-22** | `dose_g` 內含非克單位字串（`piece` `slices` `leaves` `not specified`）的 worklist | 本批 6 列 | 低（只讀） | batch 1 F-13 的「枚被當成克」同族 |
| **FB-23** | `taiwan_pharmacopeia_zh` 值為 `"Yes"` / `"Yes (THP p.133)"`（延伸 FB-13） | 本批 3 筆 | 低 | — |
| **FB-24** | `english_exam_track.pattern_indications_zh` 殘骸 worklist（判準：§F-38） | 47 筆 | 低（只讀） | **「過度證」兩筆優先**（方向相反） |

### Ting-review（不能機械做，接續 batch 1 的九項）

10. **F-25 毒性礦物劑量**：雄黃 30g、硃砂 60g 這一族要「先從渲染層下架」還是「等 SOL 回來的藥典值」？
    在有正確值之前，卡片上印什麼？
11. **F-26 毒性警告的中譯**：英文的 `**Potentially toxic**` 標註是誰寫的、算不算來源？
    可不可以逐條忠實中譯（像 2026-08-11 那批安全欄中譯的做法），還是要等 SOL 的 B 段？
12. **F-32 桂枝茯苓丸**：`composition` 要用 `action_profile` 的五味（桂枝/赤芍/丹皮/茯苓/桃仁 各 9g）
    復原，還是清空等課件？**紅線 3：先搬再改**——現有的錯組成要先存進 `correction_note`。
13. **F-33 定喘湯**：67 條 `actions_zh` 與接錯的 `pattern_indications_zh` 要整區清空還是搬到 notes？
    `銀杏` vs `白果` 是打錯字還是真的用錯藥材？
14. **F-35 禁用 vs 慎用**：來源是無方向詞的名詞片語（`"Pregnancy."`），
    中譯要一律取嚴（禁用）還是一律標「來源未註明強度」？
15. **F-36 牽正散英文點錯藥**：`Wu Gong` 是 American Dragon 原文錯誤還是匯入錯誤？
    （這決定是修卡還是標來源缺陷。）
16. **F-37 交互作用欄的療效主張**：3 筆要清空（同 FB-3 的處理）還是搬到 `modern_research_en`？
17. **F-41 腎氣丸 / 金匱腎氣丸**：哪一筆是正本？另一筆 `review_status: "deprecated"`？
    兩筆的 `exam_importance` 目前互相矛盾。
18. **半夏＋烏頭類十八反**：全庫沒有任何機讀欄位承接配伍禁忌。要不要在 `safety_flags`
    加一個 `eighteen_incompatibles_review`？（屬 schema 變更，須先過 BLUEPRINT。）

### 給 CONTENT_REQUEST 的一句話

`CONTENT_REQUEST_FORMULA_CAUTION_HERB_COVERAGE.md` 的 B 段（逐藥標準禁忌句）**優先序建議調整為**：

1. **朱砂／雄黃**——不只缺敘述，連劑量都錯 300 倍，是唯一「照著做會死人」的一族（5 卡）。
2. **附子**——11 卡全數缺先煎與心律不整，是本批數量最大的洞。
3. **麻黃**——6 卡全數缺心血管，且干擾素方向問題已擴散到 3 張卡（§C 請加入 `da_qing_long_tang`）。
4. **細辛**——4 卡全缺，且劑量爭議在卡上表現為 `1-28g` 這種不可用的值。
5. 大黃/芒硝、桃仁/紅花——已有孕期覆蓋，缺的是哺乳、月經期、出血/抗凝。

A 段（麻黃湯中英不對稱）維持最急；本批新增**陽和湯**是同型的第二例
（`contraindications_en` 4 條、`_zh` 3 條，掉的那條正是麻黃劑量）。

### 建議的下一個動作

1. **先做 FB-19 的止血**：`shen_fu_tang` 與 `shi_pi_yin` 降回 `public_safe: false`。
   理由與 batch 1 對葛根湯的裁定完全同型，而這兩張更嚴重（連禁忌欄都不存在）。
2. 接著跑零風險的只讀項：**FB-14 / FB-15 / FB-21 / FB-22 / FB-24**，
   四份 worklist 一起交給 Ting 與 SOL（FB-14/15 直接對應 CONTENT_REQUEST B 段）。
3. **FB-20 固化成 `scripts/`**：組成簽章重複偵測。F-32 這種錯誤靠人眼是撞見的，
   靠腳本是每次都抓得到。
4. 第三批眼睛審查建議取**剩下的 20 筆慎用藥卡**（`fang_ji_huang_qi_tang` 之外的
   水蛭/三稜/莪朮族、`bu_yang_huan_wu_tang` `tong_qiao_huo_xue_tang` `wei_jing_tang` `run_chang_wan`
   桃仁族，以及 `you_gui_wan` `you_gui_yin` `huang_tu_tang` `shi_pi_san` 附子族），
   把 §0 的 50 筆母體讀完；讀完之後慎用藥覆蓋矩陣就是全庫級的，可以直接當驗證器的判準。

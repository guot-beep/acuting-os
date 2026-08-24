# HERB_EYESON_01 — 中藥卡人眼審查（慎用藥全族 21 + 高曝光 9 = 30 味）

狀態：**findings ledger，只讀。本輪沒有動 `data/**` 一個字元。**
Branch：`codex/herb-eyeson-1`（自 `origin/codex/pattern-v2` tip `eeb089c`）
日期：2026-08-12
對象：`data/herbs/herb_canon_shortlist.json`（**358 筆 records**）
上游：`FORMULA_EYESON_01/02/03`（方劑層 224 筆，三批合計 0 CLEAN / 2 MINOR / 84 DEFECT）

---

## §0 取樣、方法、與本層的三個前提問題

### 派工單指定的兩段取樣（可一行重現）

**第一段 — 慎用藥族，一律以 `id` slug 解析，不用中文子字串。**
方劑層已證明子字串掃描會漏掉拼音化的列，且 `麻黃根 ≠ 麻黃`。實際解析結果：

| 族 | slug | 命中 |
|---|---|---|
| 附子族 | `fu_zi` `chuan_wu` `cao_wu` | 3/3（附子・制川烏・制草烏） |
| 麻黃 | `ma_huang` | 1/1（麻黃）— **`ma_huang_gen`（麻黃根）另存，未納入** |
| 大黃/芒硝 | `da_huang` `mang_xiao` | 2/2 |
| 細辛 | `xi_xin` | 1/1 |
| 馬兜鈴風險 | `mu_tong` `qing_mu_xiang` | 2/2 — **`chuan_mu_tong`（川木通）另存，未納入** |
| 硃砂/雄黃 | `zhu_sha` `xiong_huang` | 2/2 |
| 蟲類/水蛭 | `quan_xie` `wu_gong` `shui_zhi` | **2/3 — `herb.shui_zhi`（水蛭）在 358 筆中不存在** |
| 破血 | `tao_ren` `hong_hua` `san_leng` `e_zhu` | 4/4 |
| 其他 | `gan_sui` `cang_er_zi` `ban_xia` `ying_su_ke` | 4/4 |

→ **21 味**（水蛭缺卡，見 H-24）。

子字串陷阱實測（列出來是為了讓下一批不要再踩）：
`fu_zi` 子字串會多撈 `lai_fu_zi`（萊菔子）、`bai_fu_zi`（白附子）、`di_fu_zi`（地膚子）；
`tao_ren` 會多撈 `he_tao_ren`（核桃仁）；`mu_tong` 會多撈 `chuan_mu_tong`。
**四個都不是慎用藥，四個都會被中文/拼音子字串掃描誤判。**

**第二段 — 補到 30，依 `data/herbs/formulas.json` composition 的 `herb_id` 出現方數排序：**

```
炙甘草 59 · 甘草 56 · 茯苓 49 · 當歸 48 · 人參 46 · 生薑 46 · 白芍 42 · 大棗 37 · 白朮 34
```
（半夏 31 已在第一段族內，不重複計。）→ **9 味**。

### 這 30 筆

```
herb.fu_zi herb.chuan_wu herb.cao_wu herb.ma_huang herb.da_huang herb.mang_xiao
herb.xi_xin herb.mu_tong herb.qing_mu_xiang herb.zhu_sha herb.xiong_huang
herb.quan_xie herb.wu_gong herb.tao_ren herb.hong_hua herb.san_leng herb.e_zhu
herb.gan_sui herb.cang_er_zi herb.ban_xia herb.ying_su_ke
herb.zhi_gan_cao herb.gan_cao herb.fu_ling herb.dang_gui herb.ren_shen
herb.sheng_jiang herb.bai_shao herb.da_zao herb.bai_zhu
```

### 方法

每一筆整筆取出、攤平成逐欄文字後**整份逐行讀完**（含 `english_exam_track`、
`chinese_depth_track`、`safety_info`、`dosage` / `dosage_g` 兩套劑量欄、
`field_sources` 鍵名），不是抽樣、不是 grep。
`modern_functions_detail_zh`（CloudTCM 藥理長文）另以跨卡藥名比對檢查錯位。

機器掃描只用來**量化已經用眼睛確認過的問題有多廣**。

### 判級規則（沿用方劑層）

- **DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷
- **MINOR** = 只有 QUALITY 級
- **CLEAN** = 引不出任何一條

### 保守原則

只列能引用原文、並說出為什麼錯的項目。**不代寫替代內容** —— 誠實的空白勝過發明的文字。

### 開讀前必須先講的一件事：本層的缺陷驗證器全部看不到

```
node scripts/validate-herb-standard.js   → PASS — no structural defects
node scripts/validate-content-junk.js    → PASS — no scraped header tokens, no encoding anomalies in _zh fields
```
下面 §2 的 24 條，**沒有一條被這兩支擋下來**。這正是 CLAUDE.md 那句
「驗證器 PASS ≠ 沒有損失」的實例：本批全部靠肉眼。

---

## §1 逐卡判級

| # | id | 中文 | 判級 | 一句話 |
|---|---|---|---|---|
| 1 | `herb.fu_zi` | 附子 | **DEFECT** | `dosage.食療用量範圍 "3-9克"` 把附子當食療；`contraindications_en`/`cautions_en`/`condition_tags_en` 三欄不存在，英文側只剩 `Review toxicity review before clinical use.` 這類自動生成句 |
| 2 | `herb.chuan_wu` | 制川烏 | MINOR | 全庫最佳安全卡之一（先煎 30–60 分鐘、抗心律不整藥名、十八反、孕禁俱全）；`related_formulas: []` 但小活絡丹確實含本味 |
| 3 | `herb.cao_wu` | 制草烏 | MINOR | 同上；同樣漏 `formula.xiao_huo_luo_dan` |
| 4 | `herb.ma_huang` | 麻黃 | **DEFECT** | 記錄寫 `1.5–10g` 但卡片顯示 `6~15g`（H-01）；`related_formulas` 11 筆中 7 筆不含麻黃，且漏掉葛根湯、大青龍湯、陽和湯 |
| 5 | `herb.da_huang` | 大黃 | **DEFECT** | `properties_taste_temp: 甘、苦、有毒、寒、無毒`（有毒與無毒並存）；`contraindications_zh` 整欄不存在；食療 10–30g > 入藥 3–9g |
| 6 | `herb.mang_xiao` | 芒硝 | **DEFECT** | `properties_taste_temp` 九個詞裡同時有「無毒」「小毒」「寒」「大寒」；孕婦禁用只寫在 `dosage.特殊說明`，禁忌欄不存在 |
| 7 | `herb.xi_xin` | 細辛 | **DEFECT** | 內容是本批最好的（1–3g、上限 5g、十八反反藜蘆、中英 6/6 與 10/10 齊全），但卡片顯示 `6~15g`，直接踩破自己寫的「絕不可超過 5g」；全卡無馬兜鈴酸字樣 |
| 8 | `herb.mu_tong` | 木通 | **DEFECT** | `functions_zh` 含「補血養肝」（非本味功效）；`clinical_use_note` 寫「歸肺、大腸、膀胱經」與本卡 `channels_zh`（心・小腸・膀胱）矛盾 |
| 9 | `herb.qing_mu_xiang` | 青木香 | **CLEAN** | 典範：明確區分「本味來源只寫不安全/已廢用」與「同屬他藥的毒理」，並拒絕外推 |
| 10 | `herb.zhu_sha` | 硃砂 | **DEFECT** | 記錄 `內服 0.1–0.5g`，卡片顯示 `6~15g`（最高 **150×**）；`contraindications_en`/`cautions_en` 不存在 |
| 11 | `herb.xiong_huang` | 雄黃 | **DEFECT** | 記錄 `內服 0.05–0.1g`，卡片顯示 `6~15g`（最高 **300×**）；英文安全欄不存在 |
| 12 | `herb.quan_xie` | 全蠍 | **DEFECT** | `dosage.食療用量範圍` 寫油炸全蠍每次 5–8 隻、每週 2–3 次；`contraindications_zh` 不存在，孕婦只降級為「慎用」 |
| 13 | `herb.wu_gong` | 蜈蚣 | MINOR | 模板級好卡（中英 4/4、孕禁、肝功能、劑量三源並記）；`related_formulas` 唯一一筆大定風珠不含蜈蚣 |
| 14 | `herb.tao_ren` | 桃仁 | MINOR | `functions_zh` 整欄不存在（靠 `traditional_functions_zh` 備援，正是模板點名的麻黃舊病）；模板明令已刪除的 `primary_actions_en` 復活且欄內混中文 |
| 15 | `herb.hong_hua` | 紅花 | MINOR | `review_status: source_checked`（AI 只能寫 draft）；`properties_taste_temp 辛、苦、溫` 與 `tcm_properties.five_flavors_zh ["辛"]` 不一致 |
| 16 | `herb.san_leng` | 三棱 | **DEFECT** | `cautions_zh[6]` 寫「柑橘科植物過敏」（三棱是黑三棱科）；`properties_taste_temp` 同時有溫/涼/平；4 筆 `related_formulas` **無一含本味** |
| 17 | `herb.e_zhu` | 莪朮 | **DEFECT** | `functions_zh` 含「健脾胃」；`modern_functions_zh` 把「抗早孕」列為藥理功效；4 筆 `related_formulas` 與三棱**逐字相同且無一含本味** |
| 18 | `herb.gan_sui` | 甘遂 | **DEFECT** | 十八反「甘草反甘遂」被寫成「降低甘遂的瀉下作用」（把毒性禁忌講成療效減弱）；食療 0.5–1 克；`condition_tags_zh` 只有一條功效串 |
| 19 | `herb.cang_er_zi` | 蒼耳子 | MINOR | 中英 2/2 與 7/7 齊全；但 `contraindications_zh` 兩條都是 `cautions_zh` 的逐字副本，禁/慎兩格顯示同一句 |
| 20 | `herb.ban_xia` | 半夏 | MINOR | 內容強（反烏頭、生品只外用、孕期三源分歧並記）；卡片顯示 `6~15g`；`related_formulas` 26 筆中 5 筆不含半夏 |
| 21 | `herb.ying_su_ke` | 罌粟殼 | **CLEAN** | 典範：明寫「全 curriculum 查無成癮性字樣，依憲法不代為填入」，並標 `source_gap_no_addiction_warning` |
| 22 | `herb.zhi_gan_cao` | 炙甘草 | **DEFECT** | `card_grade: gold` 但 `field_sources` 是空物件；`review_status: "reviewed"`（詞彙表外）；59 首方含本味，只列 8 首 |
| 23 | `herb.gan_cao` | 甘草 | MINOR | 十八反四味齊全、中英 3/3 與 5/5，是本批標竿；舊 `cautions` 原文塊仍留著「假性醛固酮**減少**症」的錯字版 |
| 24 | `herb.fu_ling` | 茯苓 | MINOR | `clinical_use_note` 是 CloudTCM 原文傾倒；`cautions_en` 兩條標了 `[⚠ source self-contradiction]`，中文同索引兩條沒有 |
| 25 | `herb.dang_gui` | 當歸 | **DEFECT** | `cautions_zh[1]`「惡**葛蒲**」（菖蒲的壞字）；`cautions_zh[5]`「不適合補的人，會出現長痘痘。」；全卡安全欄無孕字 |
| 26 | `herb.ren_shen` | 人參 | MINOR | 十八反＋十九畏＋收縮壓 >180 禁用，內容全庫最完整之一；只有食療用量範圍樣板 |
| 27 | `herb.sheng_jiang` | 生薑 | MINOR | `cautions_zh` 只有一條、且是誠實的「查無可核實數字」宣告（好）；`clinical_use_note` 仍是含「減肥減重」的 CloudTCM 傾倒 |
| 28 | `herb.bai_shao` | 白芍 | MINOR | 十八反反藜蘆、中英 3/3 齊全；只有食療用量範圍樣板 |
| 29 | `herb.da_zao` | 大棗 | MINOR | 中英 3/3 與 2/2 齊全；只有食療用量範圍樣板 |
| 30 | `herb.bai_zhu` | 白朮 | MINOR | 中英 3/3 與 3/3、warfarin/aspirin 具名；只有食療用量範圍樣板 |

**CLEAN 2 · MINOR 15 · DEFECT 13。**

值得注意的分佈：兩張 CLEAN 都是 Claude 為補 F12 缺口新建、且**主動宣告來源缺口**的卡；
13 張 DEFECT 裡有 11 張 `source_type: sourced_cloudtcm_record`（CloudTCM 原樣落地層）。

---

## §2 逐條 findings

### H-01 — 卡片對 200/358 味顯示硬寫死的 `6~15g`，覆蓋記錄裡的真實劑量 · **SAFETY**

`js/knowledge.js:1542`：

```js
${detailSection("常用劑量", "Standard & Granule Dose", `<p><strong>生藥日服量：</strong>${esc(dose.standard_daily_g || "6~15g")}</p>...
```

`dose = record.dosage_g || {}`。只要 `dosage_g.standard_daily_g` 不存在，卡片就顯示
**`6~15g`** —— 一個沒有任何來源、對每一味藥都相同的數字。全庫 **200/358** 筆走這條路徑，
其中 `safety_flags` 帶 `toxic` 的有 **17** 筆。本批 30 味中 **11** 筆命中：

| id | 記錄裡的真實劑量 | 卡片顯示 | 倍數 |
|---|---|---|---|
| `herb.xiong_huang` | `內服 0.05–0.1g，入丸散用；外用適量。` | `6~15g` | **最高 300×** |
| `herb.zhu_sha` | `內服 0.1–0.5g，只入丸散，不入湯劑。` | `6~15g` | **最高 150×** |
| `herb.gan_sui` | `0.5-1.5克` | `6~15g` | 最高 30× |
| `herb.xi_xin` | `1–3g`、`最大量 5g（課件：絕不可超過）` | `6~15g` | 直接踩破自己的上限 |
| `herb.quan_xie` | `3-6克`（研末 0.6–1 克） | `6~15g` | 2.5× |
| `herb.fu_zi` | `3-15克` | `6~15g` | 下限翻倍 |
| `herb.ma_huang` | `1.5–10g` | `6~15g` | 上限 1.5× |
| `herb.ban_xia` `herb.da_huang` `herb.mang_xiao` `herb.cang_er_zi` | 見 §3 census | `6~15g` | — |

雄黃 300× 與硃砂 150× 這兩個倍率，**與方劑層記錄的「雄黃 30g ≈300×、硃砂 .5-60g」同一量級**。
直接違反憲法紅線第四條「劑量絕不虛構數字，必須具名來源」。
**建議修法**：`dose.standard_daily_g` 缺值時顯示「待補」，不顯示任何數字。
（`js/**` 是 Claude 的路徑，這條修得動；本輪只讀，未改。）
同行 `props.part_used_zh || "根 / 果實 / 全草"` 是同型的捏造預設值，一併記錄。

### H-02 — `dosage` 內建「食療用量範圍」欄，把毒藥列成食療劑量 · **SAFETY**

179/358 筆的 `dosage` 帶 `食療用量範圍`，其中 10 筆落在慎用藥族上：

| id | `一般建議` | `食療用量範圍` |
|---|---|---|
| `herb.fu_zi`（附子） | `3-15克` | **`3-9克`** |
| `herb.gan_sui`（甘遂） | `0.5-1.5克` | **`0.5-1克`** |
| `herb.quan_xie`（全蠍） | `內服煎湯，常用劑量為3-6克。研末吞服，每次0.6-1克。` | **`作為食療（如油炸），每次不宜超過5-8只，一周食用2-3次為宜。`** |
| `herb.mu_tong`（木通） | `3-6克` | **`3-9克`（食療高於入藥）** |
| `herb.da_huang`（大黃） | `3-9克（入藥）` | **`3-5段（約10-30克）`（食療高於入藥）** |
| `herb.mang_xiao`（芒硝） | `6-12克` | `3-9克` |
| `herb.cang_er_zi`（蒼耳子） | `3-10克` | `3-6克` |
| `herb.hong_hua` `herb.san_leng` `herb.e_zhu` | `3-10克` | `3-9克` |

全蠍那條最刺眼：同一張卡的 `safety_flags` 寫著 `not_for_self_treatment` 與
`urgent_red_flag_review`，`dosage.特殊說明` 寫著「用量過大可能導致中毒」，
卻同時給了油炸全蠍的每週食用頻率。
芒硝那條自我矛盾：同一個物件的 `特殊說明` 寫「孕婦禁用；脾胃虛寒者忌用」。
全庫另有 **77 筆**（含上表 3 筆）的食療上限 > 一般建議上限。
`field_sources.dosage` 都指向 CloudTCM 單味頁 —— 這是**消費者食療欄位被整段當成處方劑量落地**。
**建議**：`食療用量範圍` 不應與處方劑量同欄呈現；毒藥卡上應整條移除或改標為「非處方用途，僅記錄來源原文」。此為刪除/搬遷，須先過 Ting。

### H-03 — `related_formulas` 全庫 864/1666 條指向不含該藥的方 · **CLINICAL**

判準：`related_formulas` 裡的方，其 `composition` 既無 `herb_id === 本卡 id`，
`herb_zh` 也不含本卡 `name_zh`。全庫 **1666 條連結中 864 條命中，225/358 張卡受影響，
另有 3 條指向不存在的 formula id**。本批 30 味中 **144/433**。

最極端的幾筆：

- `herb.san_leng`（三棱）與 `herb.e_zhu`（莪朮）各列 4 首，**兩者陣列逐字相同**
  （血府逐瘀湯・桂枝茯苓丸・桃紅四物湯・至寶丹），**無一含這兩味**；而 formulas.json 裡
  含三棱/莪朮的方是 0 首 —— 也就是說這 8 條連結全是憑空的。
- `herb.gan_sui`（甘遂）列大承氣湯・麻子仁丸・小陷胸湯，三首都不含甘遂；
  **真正含甘遂的大陷胸湯反而沒列**。
- `herb.fu_zi`（附子）15 首中 8 首不含附子，包括**白虎湯**（石膏知母甘草粳米，5 味）、
  六味地黃丸、四逆散、痛瀉要方。
- `herb.quan_xie`（全蠍）4 首中 3 首不含全蠍（含補陽還五湯）。
- `herb.wu_gong`（蜈蚣）唯一一首大定風珠不含蜈蚣。

「磁鐵方」排行（被掛在最多張不含它的藥卡上）：
桂枝茯苓丸 29 · 二陳湯 26 · 越鞠丸 23 · 溫膽湯 21 · 消風散 19 · 一貫煎 19 · 痛瀉要方 19。
這個分佈不是零星筆誤，是某次以「同分類/同章節」而非「組成含有」生成連結的殘留。

`herb.chuan_wu` 的 `related_formulas_note` 明確把這個欄位定義成「含本味的方」
（「matching local formula IDs were not present in the current formula canon,
so no dead formula links were added」），所以語義沒有歧義。

**反向缺口同樣大**：`herb.zhi_gan_cao` 有 59 首方含它、只列 8 首（漏 52）；
生薑漏 25、茯苓漏 24、當歸漏 23、人參漏 22、大棗漏 20、白芍漏 20。

### H-04 — 甘遂卡把十八反講成「療效減弱」 · **SAFETY**

`herb.gan_sui` `cautions_zh[1]`：

> 「與甘草同用不宜：甘遂與甘草同用，會產生相反的藥性，**降低甘遂的瀉下作用**。」

甘草反甘遂是十八反裡最經典的一組，臨床意義是**毒性增強**，不是瀉下作用減弱。
本條把一個毒性禁忌敘述成療效問題，且**全卡沒有「十八反」三個字**。
對照組：同批的 `herb.gan_cao` `contraindications_zh[0]` 寫得完全正確 ——
「十八反：反甘遂、京大戟、芫花、海藻，禁止同用。」
**同一組配伍，兩張卡一對一錯，方向相反。**
（不代寫修正文字；建議做法是把甘遂側改為引用甘草卡已核讀的敘述，或標 `safety_review_pending` 送 Ting。）

### H-05 — 三棱卡的過敏警語指錯科屬 · **SAFETY**

`herb.san_leng` `cautions_zh[6]`：

> 「對三稜或其他**柑橘科**植物過敏者應避免使用。」

三棱是黑三棱科（Sparganiaceae）；卡片自己的 `image` 指向 `Sparganium_erectum`，
`name_en` 寫 `Sparganium / Bur-reed Rhizome`。**柑橘科（Rutaceae）與本味無關** ——
這句看起來是從陳皮/枳實/青皮一類柑橘科藥搬過來的。
臨床後果是雙向的：柑橘過敏者被誤導避開三棱，真正的過敏原沒有被標。

### H-06 — 附子的英文安全欄由 `safety_flags` slug 機械展開，且三個英文欄不存在 · **SAFETY**

`herb.fu_zi.english_exam_track.contraindications`：

> `["Review toxicity review before clinical use.","Review cardiac review before clinical use.","Review pregnancy review before clinical use.","Review not for self treatment before clinical use.","Review dose preparation review before clinical use.","Review incompatibility review before clinical use."]`

這是把 `safety_flags` 的 slug（`toxicity_review` → "toxicity review"）套進
`Review ___ before clinical use.` 生成的，連 `not for self treatment` 這種不成句的都照套。
同卡 `english_exam_track.indications` 是
`"Pattern documentation context only; verify against Bensky before source_checked."`。

同時 `contraindications_en`、`cautions_en`、`condition_tags_en` **三欄整個不存在**，
而 `cautions_zh` 有 8 條（含「正常人口服烏頭鹼 0.2mg 即可發生中毒反應，3-5mg 可致死亡」）。
**附子中文側有致死劑量，英文側只有六句自動生成的空話。**
本卡有 `field_sources`，依模板 §2「0b 模板級記錄必須全雙語（E6 FAIL）」應被擋下 —— 沒有。

全庫這類 placeholder 英文：**200 張卡 / 713 條**。本批 30 味中 21 味命中
（fu_zi 9・gan_sui 8・quan_xie 8・da_huang 7・mang_xiao 7・mu_tong 7・ban_xia 7・fu_ling 4，其餘各 1）。

### H-07 — 硃砂 / 雄黃：中文有汞砷警語，英文安全欄整個不存在 · **SAFETY**

`herb.xiong_huang` `cautions_zh[1]`：

> 「⚠️ 忌火煅。加熱後氧化為三氧化二砷（砒霜），毒性劇增 —— 這是本品最重要的一條炮製禁忌。」

`herb.zhu_sha` `cautions_zh[1]`：「⚠️ 忌火煅。加熱析出汞，毒性劇增。」

兩張卡的 `contraindications_en` 與 `cautions_en` **都不存在**（zh 3/4 條、en 0 條）。
方劑層 §3.1 記「朱砂/雄黃 6 卡：汞/砷字樣 1/6」—— 本層的中文其實寫得比方劑層好，
**但它進不了英文側，也（因 H-01）配著一個 6~15g 的假劑量一起顯示。**
兩卡 `public_safe` 欄位**不存在**（既非 true 也非 false），不會被 `public_safe === true` 的
下架 predicate 掃到，也不會被 `=== false` 的白名單掃到。

### H-08 — 木通：功效欄有他藥內容，學習筆記與自己的歸經互相矛盾 · **CLINICAL**

`herb.mu_tong.functions_zh`（10 條）第 3 條：**「補血養肝」**。
木通是苦寒利水通淋藥，不補血、不養肝；同卡 `traditional_functions_zh`
（利尿通淋・清心火・通經下乳）與 `actions_en`（3 條）都沒有這一條。

同卡 `clinical_use_note`（＝模板第 11.5 區「學習筆記」，必填欄）是百科式傾倒，且寫：

> 「木通味苦、辛，性寒。歸**肺、大腸、膀胱**經。」

但本卡 `channels_zh` 是 **心經・小腸經・膀胱經**，`tcm_properties.meridian_tropism_zh` 是
**膀胱經・心經・小腸經**，`properties_taste_temp` 是 **微苦、淡**（不是苦、辛）。
**同一張卡的歸經與性味，學習筆記說一套、性味歸經欄說另一套。**
本卡 `review_status: source_checked`（AI 不得寫入的值，見 H-14）。

附帶：`dosage_g.preparation_note_zh` 寫著
「必須使用川木通或白木通；關木通含有馬兜鈴酸具腎毒性，已被禁用」，
但渲染器只讀 `dose.standard_daily_g` 與 `dose.granule_dose_g`，**這句不會顯示**。
（同卡的 `safety_info.toxicity_zh` 版本會顯示，所以本項僅記為欄位選擇問題，不記為完全不可見。）

### H-09 — 細辛：全卡無馬兜鈴酸字樣 · **SAFETY（缺口，非錯誤）**

`herb.xi_xin` 是本批安全內容最完整的卡（1–3g、`最大量 5g（課件：絕不可超過）`、
`忌與藜蘆同用（十八反）`、中英 6/6 與 10/10）。
但以 `馬兜鈴|马兜铃|aristoloch` 全文檢索本卡：**0 命中**。
全庫提到馬兜鈴酸的只有 5 張卡（防己・木通・漢防己・川木通・青木香），細辛不在內。

方劑層 §3.1 記「細辛 8 卡全 absent，馬兜鈴酸 0/8」—— 現在可以回答為什麼：
**單味藥層本身就沒有這條資訊，方劑層無從繼承。**
依憲法第四條，本 ledger **不代為補寫**細辛的馬兜鈴酸敘述；這是要送 Ting 配權威來源的缺口。
（`herb.qing_mu_xiang` 的 `cautions_zh[1]` 已示範了正確寫法：明確記錄
「NCBAHM 2026 考綱的馬兜鈴酸相關列名為關木通、廣防己、馬兜鈴」，並標明本味不在該清單上。）

### H-10 — 性味欄自相矛盾（有毒＋無毒、寒＋溫並列） · **CLINICAL**

全庫 **11 筆**，本批 3 筆：

| id | `properties_taste_temp` 原文 |
|---|---|
| `herb.da_huang` | `甘、苦、有毒、寒、無毒` |
| `herb.mang_xiao` | `辛、甘、苦、寒、無毒、鹹、小毒、大寒、微甘` |
| `herb.san_leng` | `溫、甘、辛、苦、澀、無毒、涼、平` |

這是多來源標籤未去重直接串接的結果。三棱同卡另有一個乾淨的
`taste_temperature_zh: 苦, 辛, 平` 與 `tcm_properties.four_natures_zh: 平` ——
**同一張卡三個欄位給三個不同答案**，而渲染器讀的是
`props.four_natures_zh || record.properties_taste_temp`，所以顯示哪一個取決於 `tcm_properties` 有沒有填。

### H-11 — 大黃 / 芒硝 / 甘遂 / 全蠍：`contraindications_zh` 整欄不存在 · **SAFETY**

模板 §2「0a 禁忌症必填（E7 FAIL）」：`contraindications_zh` 是獨立欄位，**不能用 `cautions_zh` 代替**。
本批四味峻藥該欄不存在（`safety_info` 裡也沒有）：

| id | contra_zh | contra_en | caut_zh | caut_en | 孕婦資訊實際落在哪 |
|---|---|---|---|---|---|
| `herb.da_huang` | 不存在 | 不存在 | 7 | 不存在 | `cautions_zh[2]`，且只寫「**慎用**」 |
| `herb.mang_xiao` | 不存在 | 不存在 | 7 | 不存在 | `dosage.特殊說明`（劑量欄） |
| `herb.gan_sui` | 不存在 | 不存在 | 5 | 不存在 | `cautions_zh[0]` 與 `dosage.特殊說明` |
| `herb.quan_xie` | 不存在 | 不存在 | 4 | 不存在 | `cautions_zh[1]`，只寫「**慎用**」 |

大黃與全蠍把孕期從「禁用」降級成「慎用」，芒硝把它放進劑量欄。
全庫 `contraindications_zh` 與 `safety_info.contraindications_zh` 皆空的卡：**198/358**。

### H-12 — `cautions_en` 缺失：本批 11/30，全庫 216/358 · **QUALITY→CLINICAL**

`cautions_zh` 有內容、`cautions_en` 不存在的 30 味清單：
`fu_zi da_huang mang_xiao mu_tong zhu_sha xiong_huang quan_xie hong_hua san_leng e_zhu gan_sui`
—— **11 味全部是慎用藥族**，9 味帶 `toxic` 或 `toxicity_review`。
補進去的 19 味（含所有高曝光藥）反而中英齊全。
憲法第五條要求 `_en` 長度等於 `_zh` 否則整個留空；此處是「整個留空」的合法形態，
但**留空的正好是毒性最高的一群**，實務上等於英文使用者看不到毒性警告。

### H-13 — 炙甘草：`card_grade: gold` 卻沒有任何 `field_sources` · **QUALITY**

`herb.zhi_gan_cao` 是全庫**唯一**一張 `card_grade: "gold"`，而
`field_sources` 是 `{}`（0 個鍵）、`exam_importance` 是空字串、`exam_pearl` 空、
`review_status: "reviewed"` —— `reviewed` 不在全庫其餘 357 筆用的值域內
（draft 273 / sourced_cloudtcm_record 41 / source_checked 37 / draft_reviewed 1 / undefined 5）。

同卡另帶四個方劑線欄位名：`applications_zh` `applications_en`
`modern_research_zh` `modern_research_en` —— `modern_research_en` 正是方劑層
FB-3 處理過的欄位，出現在中藥卡上屬結構外洩。
內容本身沒有錯（十八反四味齊全、中英 4/4），問題全在「宣稱等級」與「舉證」不相稱：
R2 Evidence 慣例要求帶主張的欄位掛 per-field 來源錨點，這張卡一個都沒有。

### H-14 — 五味 `review_status: source_checked` / 一味 `reviewed`，AI 只能寫 draft · **QUALITY**

模板 §2.7 與憲法：AI 只能寫 `review_status:"draft"`，`source_checked` 由 Ting 的 RV1 流程升級。
本批違規 6 筆：`mu_tong` `tao_ren` `hong_hua` `san_leng` `e_zhu`（source_checked）、
`zhi_gan_cao`（reviewed）。全庫 `source_checked` 共 37 筆。
這不是純流程問題 —— `herb.mu_tong` 掛著 `source_checked`，同時帶著 H-08 的兩項內容錯誤，
**升級標記正好蓋在最不該被信任的卡上**。

### H-15 — 當歸：安全欄有壞字與消費者部落格語句 · **QUALITY**

`herb.dang_gui` `cautions_zh[1]`：

> 「惡**葛蒲**、海藻、牡蒙。」

「葛蒲」是「菖蒲」的壞字。值得注意的是配對的 `cautions_en[1]` 寫
`Antagonised by Chang Pu, Hai Zao and Mu Meng` —— **英譯已經默默改對了，中文原字沒改**，
所以這個錯字不會被中英長度檢查或英文閱讀抓到，只有讀中文才看得見。
（模板 §1.5 的藥名自動連結靠 `name_zh` + `aliases_zh` 建索引，「葛蒲」永遠連不上菖蒲。）

同欄 `cautions_zh[5]`：

> 「不適合補的人，會出現長痘痘。」

這是消費者衛教語氣，出現在一張 `card_grade: template`、`_en` 逐條對齊的卡的安全欄。

同卡 `safety_flags` 有 `pregnancy_review`，但 `contraindications_zh`(4) 與 `cautions_zh`(10)
**全部 14 條沒有一個孕/妊娠字** —— 一味活血調經藥的孕期資訊完全不在安全欄。

### H-16 — `clinical_use_note`（必填學習筆記）被 CloudTCM 原文塊佔住 · **QUALITY**

模板 §11.5 要求 `clinical_use_note` 寫「這味藥如何辨識與記憶」，明文說**不是把功效主治重貼一次**。
全庫 **182 筆**的 `clinical_use_note` 與 `chinese_depth_track.summary_zh` **逐字相同**；
其中 **154 筆**是 `<藥名>是中藥，別名:…` 開頭的 CloudTCM 傾倒。
本批 13 筆命中（`sheng_jiang da_huang mang_xiao gan_sui fu_ling mu_tong fu_zi hong_hua e_zhu san_leng ban_xia quan_xie dang_gui`）。

實例，`herb.fu_zi`：

> 「附子是中藥，別名:淡附片,熟附片,附片,厚附片,黑附片,制附片,生附片,川附片, 功效:回陽救逆…溫裡溫中,補陽,止痛,**降血糖**,升高血壓,抗潰瘍作用,**補氣**,散風寒…等等。」

`降血糖`、`補氣` 都不在本卡 `functions_zh`（回陽救逆・補火助陽・散寒除濕溫經止痛）裡。
`herb.sheng_jiang` 的同欄含「**減肥減重**」。
對照組：`herb.bai_shao`、`herb.bai_zhu`、`herb.ren_shen`、`herb.gan_cao`、`herb.wu_gong`
的 `clinical_use_note` 都是真正的辨識/鑑別筆記 —— **模板做得到，只是這 182 筆沒做。**

### H-17 — `functions_zh` 混入現代藥理，且遠超模板 2–6 條上限 · **QUALITY**

模板 §2.2：`functions_zh` **只放傳統功效**，現代藥理放 `modern_functions_zh`；模板級硬性 2–6 條。

| id | `functions_zh` 條數 | 混入的現代藥理／錯位條目 |
|---|---|---|
| `herb.da_huang` | 12 | 保肝・利膽・清熱利尿 |
| `herb.mu_tong` | 10 | 降血壓相關 ＋ **補血養肝**（H-08） |
| `herb.mang_xiao` | 9 | **活絡止痛**（非芒硝功效） |
| `herb.e_zhu` | 5 | **健脾胃**（莪朮破血破氣，不補脾） |
| `herb.quan_xie` | 5 | **去風止痙** 與 **息風止痙** 同時列（同義重複，用字不一） |

舊 `functions` 欄（非渲染來源）更嚴重：附子 18 條含「抗心律失常・升高血壓・提升免疫力」，
麻黃 18 條含「降血糖・抗菌」，甘草 27 條。
驗證器的既有 Note 已量化到這一族：「63 record(s) list 0-1 actions (under-listed),
72 list >6 (raw dumps), 223 in the 2-6 range」—— 是 Note，不是 FAIL。

### H-18 — 莪朮把「抗早孕」列為藥理功效 · **CLINICAL**

`herb.e_zhu.modern_functions_zh[6]`：**`抗早孕`**。
同卡 `safety_info.contraindications_zh` 是「孕婦禁用（引發子宮收縮流產）」。
把終止早期妊娠當成一條中性的藥理功效標籤，與同卡的孕期絕對禁忌並列，
在一個沒有 `_en` 對照（本卡 `modern_functions_en` 不存在）的欄位裡，是會被誤讀成適應症的寫法。

### H-19 — 三棱與莪朮的劑量說明逐字相同 · **QUALITY（樣板句）**

兩張卡的 `dosage.特殊說明` 完全相同：

> 「醋制可增強止痛作用；孕婦禁用；氣血虛弱者慎用」

`食療用量範圍` 同為 `3-9克`，`一般建議` 同為 `3-10克`，
`dosage_g.standard_daily_g` 同為 `3 ~ 10g`，`related_formulas` 四筆逐字相同（H-03）。
兩味藥的區別（三棱主破血、莪朮主破氣）在 `safety_info.cautions_zh` 裡寫得很清楚，
**但劑量與方劑欄是整組複製的。**

**全庫樣板句掃描結果（重要陰性）**：以 `clinical_use_note` `exam_pearl` `pao_zhi_notes_zh`
`classical_text_zh/_en` `tcm_properties` `properties_taste_temp` `modern_pharmacology_zh`
`exam_importance` ＋ 11 個陣列欄跑跨卡逐字重複，**共用者 ≥5 張卡的字串只有 47 條，
且全部是合法的標籤詞**（`Anti-inflammatory activity` ×20、`Antioxidant activity` ×20、
`Insomnia` ×7、`陰虛有熱者禁用。` ×7、`Contraindicated during pregnancy.` ×6…）。
**散文欄位沒有任何一條被 ≥5 張卡共用。** 三棱/莪朮這組是 2 張卡的局部複製，不是全庫樣板。

### H-20 — `dosage` 一個欄位四種形狀，且渲染器一種都不讀 · **QUALITY→SAFETY 前置**

見 §3 census。`dosage` 在 30 味裡有四種形狀（序列化 JSON 15 / 物件 11 / 純字串 3 / 不存在 1），
全庫 **175 筆是序列化 JSON 字串**、111 筆是真物件、60 筆不存在、12 筆純字串。
更關鍵的是：**`js/knowledge.js` 只讀 `record.dosage_g`，完全不讀 `record.dosage`。**

所以 `herb.zhu_sha` 的 `dosage: "內服 0.1–0.5g，只入丸散，不入湯劑。"`
與 `herb.xi_xin` 的 `最大量: "5g（課件：絕不可超過）"` **都不會出現在卡片上**，
而卡片同時顯示 H-01 的 `6~15g`。
兩套劑量欄同時存在的有 20/30 筆；`dosage_g` 完全不存在的有 9/30。

這一條解釋了為什麼 `dosage` 的形狀問題（派工單 §「175 個序列化 JSON、grep 找不到消費者」）
一直沒被發現：**沒有消費者，所以沒有人會因為它壞掉而看到錯誤** —— 直到 H-01 把
「沒有消費者」變成「顯示一個捏造的常數」。

### H-21 — 蒼耳子：禁忌欄是慎用欄的逐字子集 · **QUALITY**

`herb.cang_er_zi.contraindications_zh`（2 條）與 `cautions_zh`（7 條）的第 [0]、[3] 條
**逐字相同**：

> `[0]` 血虛體質者忌服：蒼耳子性溫，血虛者服用後易導致頭暈、頭痛等不適。
> `[1]` 孕婦、哺乳期婦女禁服：蒼耳子中的成分可能會影響胎兒或嬰兒的健康，因此孕婦和哺乳期婦女應禁用。

模板 §2.0a：「禁用/忌服」（絕對禁忌）和「慎服/慎用」（相對注意）是不同的臨床判斷，
**卡片也分兩格顯示**。目前兩格會顯示同樣兩句話。
方劑層 §3.2 的 P5 predicate（同主題詞不得同時搭 禁用 與 慎用）在中藥層是同型問題，
只是這裡更直接：不是矛盾，是重複。

### H-22 — 茯苓：英文側標了來源自相矛盾，中文側沒標 · **QUALITY（方向罕見）**

`herb.fu_ling.cautions_en[4]` 與 `[10]`：

> `[4]` **[⚠ source self-contradiction]** Not suitable for constitutional deficiency-cold… — the source calls this a 'warming tonic' action although it lists the herb as neutral/slightly cool elsewhere.
> `[10]` **[⚠ source self-contradiction]** Said to be unsuitable in diarrhea because of an 'astringent' action — yet the same source lists diarrhea from damp as an indication. Verify before use.

同索引的 `cautions_zh[4]`、`cautions_zh[10]` 是未加註的原句
（「體質虛寒、肝腎不足、胃寒食慾不振者不宜服用：茯苓的**溫補作用**可能加重這些症狀。」
「腹瀉者不宜服用：茯苓有**收斂止瀉**的作用，腹瀉者服用可能加重腹瀉症狀。」）。
茯苓性平、且本卡 `indications_zh[0]` 正是「水濕內停:小便不利、水腫、**泄瀉**」。
中英長度 12/12 對齊，所以任何長度檢查都會通過；
**中文讀者拿到未標記的矛盾敘述，英文讀者拿到標記過的。**
（`safety_review_pending` 欄有記這件事，是好紀律；問題只在警語沒有進中文陣列。）

### H-23 — 甘草舊 `cautions` 原文塊保留著已修正的錯字版本 · **QUALITY**

`herb.gan_cao` 的舊 `cautions`（未結構化的原文塊）：

> 「長期高劑量服用甘草甜素（每日超過 500mg，連續服用 1 個月），可能產生「假性醛固酮**減少**症」。」

curated 過的 `cautions_zh[2]` 是正確的：「…可能產生假性醛固酮**增多**症。」
渲染器讀 `cautions_zh`，所以顯示的是對的；但錯的版本仍在記錄裡，
`clinical_use_note` 與 `exam_pearl` 也都寫「增多症」。
這一族（舊 `cautions` 原文塊 vs curated `cautions_zh`）在本批 CloudTCM 卡上普遍存在，
是未來任何「回填/重跑」動作的地雷 —— 若有人以 `cautions` 為真值重生 `cautions_zh`，錯字會回來。

### H-24 — `herb.shui_zhi`（水蛭）缺卡 · **CLINICAL（缺口）**

派工單點名的蟲類/水蛭族三味中，`herb.shui_zhi` 在 358 筆裡不存在
（以 `水蛭`、`shui zhi`、id 含 `shui` 三種方式檢索，只命中
`herb.shui_niu_jiao` 水牛角 與 `herb.han_shui_shi` 寒水石）。
水蛭是 NCBAHM 範圍內的破血逐瘀藥、孕婦禁用、且有明確抗凝交互作用議題。
本 ledger 不建卡；記錄為缺卡，交 Ting 決定是否納入下一批。
（`herb.san_leng`、`herb.e_zhu` 則是有卡但 formulas.json 裡 0 首方含它們 —— 見 H-03。）

---

## §3 總結、census、機械批次候選、與「方劑層缺陷是否源自本層」

### §3.1 數字（每一格都能由 `herb_canon_shortlist.json` ＋ §2 判準重算）

| 指標 | 本批 30 味 | 全庫 358 筆 |
|---|---|---|
| CLEAN / MINOR / DEFECT | **2 / 15 / 13** | — |
| findings 條數 | 24（H-01…H-24） | — |
| 其中 SAFETY | 8（H-01, H-02, H-04, H-05, H-06, H-07, H-09, H-11） | — |
| 其中 CLINICAL | 5（H-03, H-08, H-10, H-18, H-24） | — |
| 其中 QUALITY | 11 | — |
| **卡片顯示硬寫死 `6~15g`** | **11** | **200 / 358**（其中 `toxic` flag 17） |
| `dosage` 帶 `食療用量範圍` | 17 | **179 / 358**（食療上限 > 一般建議上限：**77**） |
| `related_formulas` 指向不含該藥的方 | **144 / 433 條** | **864 / 1666 條・225 卡**（＋3 條死 id） |
| `related_formulas` 反向缺口（含該藥卻沒列） | 炙甘草 52・生薑 25・茯苓 24 | — |
| `english_exam_track` placeholder 英文 | 21 味 | **200 卡 / 713 條** |
| `clinical_use_note` ≡ CloudTCM summary 逐字 | 13 | **182**（其中 `…是中藥，別名:` 開頭 **154**） |
| `contraindications_zh` 與 `safety_info` 皆空 | 4 | **198 / 358** |
| `cautions_zh` 有值但 `cautions_en` 不存在 | **11（全部是慎用藥）** | **216 / 358** |
| `properties_taste_temp` 自相矛盾（有毒＋無毒 或 寒＋溫） | 3 | **11** |
| `review_status` ≠ `draft` | 6 | source_checked 37・sourced_cloudtcm_record 41・reviewed 1・draft_reviewed 1・undefined 5 |
| `primary_actions_en`（模板明令已刪） | 1（桃仁） | **6** |
| 非模板欄 `safety_info` | 6 | **46**（其中 34 筆同時沒有頂層 `contraindications_zh`） |
| 提及馬兜鈴酸的卡 | 2（木通・青木香） | **5**（＋防己・漢防己・川木通；**細辛不在內**） |
| 散文欄位被 ≥5 卡共用的樣板句 | **0** | **0** |
| 驗證器判定 | — | `validate-herb-standard.js` **PASS**・`validate-content-junk.js` **PASS** |

### §3.2 這 30 味的 dose-field shape census

| `dosage` 形狀 | n | ids |
|---|---|---|
| **SERIALIZED-JSON**（`"{\"一般建議\":…}"` 字串） | **15** | fu_zi da_huang mang_xiao mu_tong quan_xie hong_hua san_leng e_zhu gan_sui cang_er_zi gan_cao ren_shen bai_shao da_zao bai_zhu |
| 真物件 | 11 | chuan_wu cao_wu ma_huang xi_xin qing_mu_xiang wu_gong ban_xia ying_su_ke fu_ling dang_gui sheng_jiang |
| 純字串 | 3 | zhu_sha xiong_huang zhi_gan_cao |
| 不存在 | 1 | tao_ren |

物件形狀本身也不統一，30 味裡就出現 7 種鍵組合：
`一般建議|食療用量範圍|特殊說明`（15）·`standard_daily_g|tincture|source_note_zh`（2）·
`decoction_g|特殊說明`（2）·`decoction_g|食療用量範圍|特殊說明`（2）·
`decoction_g|tincture_ml|特殊說明`（1）·`decoction_g|最大量|特殊說明`（1）·
`standard_daily_g|powder|source_note_zh`（1）·空物件 `{}`（2：qing_mu_xiang, ying_su_ke）。

第二套劑量欄 `dosage_g`：30 味中 **21 筆存在**、其中 **19 筆**有 `standard_daily_g`；
**20 筆兩套並存**、**9 筆只有 `dosage` 沒有 `dosage_g`**（＝ H-01 的受害者）。
`dosage_g` 全庫另有 **193 筆不存在**、35 種不同鍵組合。

**一致性判定**：兩套並存的 20 筆中，數值互相矛盾的 0 筆
（`dosage_g` 多半是 `dosage` 的摘要，例如麻黃 `1.5–10g` 兩邊一致）。
**問題不是兩套打架，是渲染器只認其中一套，而另一套是唯一有毒藥限量的地方。**
沒有任何一筆是「丸散批次重量被填成湯劑劑量」—— 那個形態（川烏/草烏 180g）
只出現在 `formulas.json` 的 composition 列，中藥卡本身
（`herb.chuan_wu`：`1.5–3g（課件）；AD 1.5–9g，需先煎30–60分鐘`）是對的。

### §3.3 方劑層的三個缺陷，有沒有源自本層？逐條回答

**（1）劑量不合理 —— 部分源自本層，且本層的版本更嚴重、尚未修。**

- 方劑層記的具體數字（川烏 180g、草烏 180g）**不是**從中藥卡繼承的：
  `herb.chuan_wu` / `herb.cao_wu` 寫的是 1.5–3g 並要求先煎 30–60 分鐘。
  那些 180g 是 `formulas.json` composition 自己的資料，本層無責。
- **但同一個缺陷類別在本層獨立存在，而且是全庫級的**：H-01 讓 200/358 張卡
  顯示無來源的 `6~15g`。方劑層記「雄黃 30g ≈300×、硃砂 .5-60g」；
  本層 `herb.xiong_huang` 記錄 0.05–0.1g、卡片顯示 6~15g = **最高 300×**；
  `herb.zhu_sha` 記錄 0.1–0.5g、卡片顯示 6~15g = **最高 150×**。
  **兩層的倍率量級一致，藥也一致。** 方劑層把它當成「該方的劑量填錯」修掉了，
  中藥層的同名藥仍在對每一個讀卡的人顯示同一個數量級的錯誤。
- 另有一個方劑層完全沒有的來源：H-02 的 `食療用量範圍`，
  把附子、甘遂、全蠍、木通列成食療劑量，179/358 卡。

→ **答案：具體數字不源自本層；缺陷類別源自本層且未收斂。修方劑不會修到它。**

**（2）「健脾和中，調和諸藥。」樣板句 —— 不源自本層，證據明確。**

以四個變體（`健脾和中，調和諸藥。` / `和中健脾，調和諸藥。` / `緩急止痛。` /
`Tonifies Qi and harmonizes ingredients.`）對 358 筆全記錄逐字檢索：**四個全部 0 命中。**
「調和諸藥」四字只出現在 **3 張卡**：`herb.gan_cao`、`herb.zhi_gan_cao`、`herb.da_zao`
（大棗作「緩和藥性（調和諸藥）」）—— 三張都是這句話**臨床上本來就成立**的藥。
再以跨卡逐字重複掃描全部散文欄位：**被 ≥5 張卡共用的字串 0 條。**

→ **答案：不源自本層。這 191 列 / 58 卡是方劑 composition 生成階段的產物，
中藥層乾淨。方劑層清完就是清完了，不會從中藥層回流。**

**（3）`_zh` 欄位裡的羅馬拼音值 —— 不源自本層。**

對 30 味的 18 個 `_zh` / 中文語意欄位（`functions_zh` `indications_zh`
`condition_tags_zh` `modern_functions_zh` `cautions_zh` `contraindications_zh`
`channels_zh` `category_zh` `aliases_zh` `pao_zhi_notes_zh` `classical_text_zh`
`tcm_properties` `clinical_use_note` `modern_pharmacology_zh` `exam_pearl`
`exam_importance` `properties_taste_temp` `traditional_functions_zh`）
逐項檢查「不含任何 CJK 字元」：**命中 4 條，全部在 `exam_pearl`**
（chuan_wu / cao_wu / wu_gong / tao_ren 的 `💡 Board pearl: …`）。
`exam_pearl` 不是 `_zh` 後綴欄位、且模板把它定義為考點提示（中英皆可），
**所以真正的 `_zh` 欄位裡羅馬拼音值 = 0。**

→ **答案：不源自本層。** 但本層有一個**同性質、規模更大**的孿生缺陷：
H-06 的 713 條機械生成 placeholder 英文（200 卡）。
方劑層清掉的是「中文欄裡的英文」，本層要清的是「英文欄裡的非內容」。

### §3.4 機械批次候選（HB 系列）vs 必須送 Ting

**可機械執行、判準已寫死、不需臨床判斷：**

| # | 內容 | 影響 | 性質 | 備註 |
|---|---|---|---|---|
| **HB-1** | `js/knowledge.js:1542` 的 `\|\| "6~15g"` 改為顯示「待補」；同行 `\|\| "根 / 果實 / 全草"` 同理 | 200 卡 | **止血級・改 js 不改 data** | 最高優先。`js/**` 是 Claude 路徑，一行改動，不動任何記錄 |
| **HB-2** | 渲染器補讀 `record.dosage`（在 `dosage_g.standard_daily_g` 缺席時），至少讓 `最大量`／`內服 0.1–0.5g` 這類欄位可見 | 見 H-20 | 只讀 data、改 js | 需先定 `dosage` 四種形狀的解析順序（跨線 field-shape 公約，見 `FIELD_SHAPE_CONSISTENCY_BASELINE.md`） |
| **HB-3** | `related_formulas` 逐筆驗證：對每張卡剔除 composition 不含本味的 id，並補上含本味卻沒列的 id | 864 條剔除 ＋ 大量補回 | **剔除＝刪除，須先過 Ting**；補回可先做 | 建議拆成 HB-3a（只補，不刪）與 HB-3b（刪，待裁定） |
| **HB-4** | 新驗證器 predicate：`related_formulas` 每一 id 必須在 `formulas.json` 存在且 composition 含本卡 id | — | blocking 候選 | 純機械，無臨床知識 |
| **HB-5** | 新 predicate：`safety_flags` 含 `toxic\|toxicity_review\|heavy_metal_review` ⇒ `contraindications_zh` 非空 且 `dosage_g.standard_daily_g` 非空 | 現況違反 ≥17 | blocking 候選 | 方劑層 P1 的中藥層對應 |
| **HB-6** | 新 predicate：`properties_taste_temp` 不得同時含 `有毒\|小毒\|大毒` 與 `無毒`，或同時含 `寒\|涼` 與 `溫\|熱` | 11 | warn→blocking | H-10 |
| **HB-7** | 新 predicate：`english_exam_track` 任一字串符合 `/^Review .+ before clinical use\.$/`、`/verify against Bensky before source_checked/`、`/^Draft: /`、`/Pattern documentation context only/` ⇒ 報「非內容佔位英文」 | 200 卡 / 713 條 | warn | 清空屬刪除，須 Ting |
| **HB-8** | 新 predicate：`review_status` 只允許 `draft\|source_checked\|deprecated`；AI 提交只能是 `draft` | `reviewed` 1・`draft_reviewed` 1・undefined 5 | blocking | H-14 |
| **HB-9** | 新 predicate：`card_grade === "gold"` ⇒ `field_sources` 非空 | 1（炙甘草） | blocking | H-13 |
| **HB-10** | 新 predicate：`contraindications_zh` 與 `cautions_zh` 不得有逐字相同的條目 | ≥1（蒼耳子） | warn | H-21 |
| **HB-11** | `clinical_use_note` 逐字等於 `chinese_depth_track.summary_zh` ⇒ 報「學習筆記未撰寫」 | 182 | warn | 改寫需臨床判斷，predicate 只負責報 |
| **HB-12** | `primary_actions_en` 存在 ⇒ 報（模板明令已刪除） | 6 | warn | H-14 同族 |

**必須送 Ting、AI 不得自行處理（憲法第四條「查不到就停下來回報，不要編」）：**

1. **H-09 細辛的馬兜鈴酸** —— 全庫無此資訊，補寫需權威來源。
2. **H-04 甘遂十八反的敘述方向** —— 要改成「毒性增強」需來源；本 ledger 只指出與甘草卡矛盾。
3. **H-05 三棱柑橘科過敏** —— 刪除或更正都需來源判定。
4. **H-02 `食療用量範圍` 的處置** —— 整欄移除屬刪除；且要決定「食療欄位是否應該存在於處方系統」。
5. **H-11 四味峻藥的禁忌欄** —— 從 `cautions_zh` 升級或新寫，是臨床判斷（大黃/全蠍的孕期究竟禁還是慎）。
6. **H-15 當歸的孕期資訊** —— 目前完全沒有，補寫需來源。
7. **H-18 莪朮「抗早孕」** —— 保留為藥理事實還是移除，需裁定。
8. **H-24 水蛭缺卡** —— 是否納入下一批。
9. **H-07 硃砂/雄黃的 `public_safe` 欄位不存在** —— 三態指針問題，需先定「欄位不存在」的語意。

### §3.5 下一批建議

本批只讀了 30/358（8.4%）。以本批命中率外推，最該優先的不是「再讀 30 味」，而是：

1. **先做 HB-1**（一行改動，止住 200 卡的假劑量），再談內容。
2. 下一批眼讀對象建議取 **`safety_flags` 帶 `toxic` 但本批未讀的 6 味**
   （苦參・吳茱萸・川楝子・天南星・苦楝皮・檳榔 —— 全部命中 H-01），
   加上 **`safety_info` 影子欄位那 34 張**（桃仁/紅花/三棱/莪朮已讀，尚有 30 張未讀）。
3. `herb_pairs.json`（489KB）本批完全沒讀 —— 模板第 10 區的正本在那裡，
   而本批 30 味中 `key_pairs` 非空的只有 5 味，無法判斷是「已有正式對藥記錄」還是「沒查」。

---

**本輪 `git status` 於 ledger 寫入前為空；除本檔外沒有新增、修改或刪除任何檔案。**

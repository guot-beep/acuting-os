# HERB_CLOUDTCM_LAYER_SCAN — CloudTCM 原樣落地層全層掃描（247 張，非抽樣）

狀態：**findings ledger + 一支量測腳本。沒有動 `data/**` 一個字元。**
Branch：`codex/herb-cloudtcm-layer-scan`（自 `origin/codex/pattern-v2` tip `263745c`）
日期：2026-08-12
對象：`data/herbs/herb_canon_shortlist.json` 中 `source_type === "sourced_cloudtcm_record"` 的 **247 / 358 張（69.0%）**
腳本：`scripts/audit-herb-cloudtcm-layer.js`（**一次性量測工具，永遠 exit 0，不進 CI**）
上游：`HERB_EYESON_01`（30 味，H-01…H-24）· `HERB_EYESON_02`（30 味，H-25…H-42）

## 為什麼是全層而不是再抽 30 味

批次二自己的結論：`source_type` 是最強的品質預測因子（CloudTCM 落地層 24 張讀出 20 張
DEFECT、0 張 CLEAN；模板級補卡 7/7 CLEAN），而 `review_status` 與品質**負**相關。
兩批合計 35 張 DEFECT，31 張出自這一層。再隨機讀 30 張只會重現同一個比例。
所以本輪不讀卡，**把兩批眼讀已經硬化的判準寫成 predicate，一次跑遍 247 張**，
讓「修 vs 重建」這個決定建立在全層數字上。

一行重現：

```bash
node scripts/audit-herb-cloudtcm-layer.js            # 摘要
node scripts/audit-herb-cloudtcm-layer.js --detail   # 逐卡明細
node scripts/audit-herb-cloudtcm-layer.js --all      # 不限層，掃全 358 筆
```

（`--json <path>` 可輸出機器可讀結果。注意 `tmp/` **不在 .gitignore**，別把它寫進 repo。）

---

## §0 判準與安全子集的定義

**安全子集**＝`safety_flags` 帶 `toxic|very_toxic|toxicity_review|heavy_metal_review`
任一硬毒性 slug。`pregnancy_review`、`bleeding_review` 這類不算 —— 要回答的問題是
「哪些命中發生在毒藥上」，不是「哪些卡有任何安全標記」。
**本層 17 張**：細辛・蒼耳子・苦參・甘遂・木通・附子・吳茱萸・川楝子・半夏・天南星・
杏仁・款冬花・全蠍・何首烏・苦楝皮・檳榔・肉豆蔻。

**散文欄**的定義（C1/C3/C4 共用）：`clinical_use_note` `exam_pearl` `exam_importance`
`cautions_zh` `contraindications_zh` 舊 `cautions` 原文塊 `indications_zh` `pao_zhi_notes_zh`
`classical_text_zh` `modern_pharmacology_zh` `chinese_depth_track.summary_zh`
`modern_functions_detail_zh[].analysis_zh` `safety_info.*`。

---

## §1 六條判準的全層數字

| 判準 | 受影響卡 | 佔本層 247 | 其中毒藥卡 | 佔毒藥 17 |
|---|---|---|---|---|
| **C1 錯藥內容** | **7** | 2.8% | 0 | 0.0% |
| **C2 來源 id** | **43** | 17.4% | 3 | 17.6% |
| **C3 內部矛盾** | **35** | 14.2% | 2 | 11.8% |
| **C4 劑量一致** | **94** | 38.1% | 5 | 29.4% |
| **C5 配伍安全** | **15** | 6.1% | 3 | 17.6% |
| **C6 佔位英文** | **126** | 51.0% | **13** | **76.5%** |

命中條數分佈：`0:72  1:69  2:74  3:25  4:7  5:0  6:0`

**驗證器現況（本輪只跑不改）**：下面每一條都沒有被任何一支現行驗證器擋下來。

```
node scripts/build-data.js                       → 無 diff
node scripts/validate-herb-standard.js           → PASS
node scripts/validate-content-junk.js            → PASS
node scripts/validate-herb-integrity-predicates.js → PASS（graduated gate 未升級）
（綠燈 job 全 27 支 validator 逐支跑過，全 PASS）
```

---

## §2 逐條判準：predicate、數字、可引用的原文

### C1 — 錯藥內容：本卡藥名在散文裡輸給另一個藥名 · **7 張**

**predicate**：把本卡散文攤平後**逐字非重疊掃描藥名（長名優先，避免 `川貝母` 被切成 `貝母`）**。
`own` = 本卡 `name_zh` + `aliases_zh` 的出現次數；`intruder` = 其他藥名中出現最多者。
命中條件：`intruder ≥ 3` 且 `intruder > own`。分三級：
A（own = 0）· B（intruder ≥ 2×own）· C（intruder > own 但未達 2 倍，邊緣）。

| 級 | 卡 | 自身 | 入侵者 | 倍率 | 機器分類 | **開卡讀過的結論** |
|---|---|---|---|---|---|---|
| A | `herb.su_zi` 蘇子 | 0 | 紫蘇子 60 | 60× | same_drug_two_cards | **同一味藥兩張卡**（`herb.zi_su_zi` 也存在） |
| A | `herb.zhe_bei_mu` 浙貝母 | 0 | 川貝母 31 | 31× | distinct_card | **真・錯藥內容**（＝批次二 H-26，本掃描獨立重現） |
| B | `herb.zhi_ke` 枳殼 | 3 | 枳實 30 | 10× | distinct_card | **真・錯藥內容（新發現）**，見下 |
| B | `herb.wu_zei_gu` 烏賊骨 | 2 | 海螵蛸 28 | 14× | distinct_card | **同一味藥兩張卡**（Cuttlebone / Cuttlefish Bone） |
| B | `herb.qian_cao` 茜草 | 9 | 茜草根 27 | 3× | same_drug_two_cards | **同一味藥兩張卡**（`herb.qian_cao_gen`） |
| C | `herb.bai_ji` 白及 | 16 | 白芨 18 | 1.1× | no_card_variant | 異體字（批次二 H-36 已立案） |
| C | `herb.wu_ling_zhi` 五靈脂 | 5 | 人參 6 | 1.2× | distinct_card | C5 的副產物（配伍句反覆點名人參），非錯藥內容 |

**新發現：`herb.zhi_ke`（枳殼）帶的是枳實的內容。** 枳殼與枳實是不同的藥
（成熟果實 vs 幼果，`name_en` 各為 `Bitter Orange Mature Fruit` / `Immature Fruit`，
兩張卡各有 CloudTCM id 1244 / 1246），而枳殼卡：

> `cautions_zh[0]`：「虛體久病者禁用：虛證體質或長期患病者，不宜服用**枳實**，以免損傷正氣。」
> `cautions_zh[1]`：「孕婦忌用：**枳實**具有收斂作用…」
> `modern_functions_detail_zh[0]`：「**枳實**的現代藥理研究顯示…」
> `clinical_use_note`：`Draft study context: traditionally associated with qi stagnation…`（英文佔位句）

**與浙貝母同型、同批次的失效模式**：兩張卡都同時帶
`properties_taste_temp = "Draft: warm/cool/bitter/acrid depending on herb; …"`
（`263745c` 的 commit message 點名的正是這兩張）。
**「同名族的相鄰卡互相抄」是一個 class，不是浙貝母一個個案。**

**另一個獨立的 class：同一味藥兩張卡。** 蘇子/紫蘇子、烏賊骨/海螵蛸、茜草/茜草根
三組，每組都是「內容寫在其中一張、卡名掛在另一張」。這在兩批眼讀裡沒有出現過
（眼讀是逐卡讀，看不見跨卡重複）。`herb.hai_piao_xiao` 是
`full_card_verified_multi_source`、`related_formulas: []`；
`herb.wu_zei_gu` 是本層卡、有 3 筆方 —— **兩張卡都活著，方劑連到的是哪一張要 Ting 裁定。**

**這條判準看不到的**：（1）錯藥內容如果**沒有留下藥名**（例如把甲藥的主治改寫成不具名的
敘述）完全掃不到；（2）`aliases_zh` 若被污染（塞進別的藥名），`own` 會被灌水而漏報；
（3）門檻 3 次是為了不把「鑑別筆記提到相似藥一兩次」誤判（陳皮 vs 青皮），
代價是**只提 1–2 次的錯藥內容一律漏掉**。

### C2 — CloudTCM id 完整性 · **43 張**（毒藥 3）

**C2a　`field_sources` 引用與本卡主 id 不同的 CloudTCM id：21 張**（毒藥 1）
與批次二 H-34 的 21 張**逐張相同**，且分裂形態完全一致 ——
分裂的永遠是 `modern_functions_zh` / `modern_functions_detail_zh` / `cautions_zh` 這三欄：

```
生薑 1171/6 · 豬苓 1269/1248 · 澤瀉 1242/1239 · 薏苡仁 1263/1229 · 車前子 991/985
滑石 1060/1075 · 川芎 988/997 · 延胡索 1256/1225 · 鬱金 1257/1235 · 丹參 999/1009
紅花 1070/1066 · 王不留行 1225/1197 · 莪朮 1012/1026 · 三棱 1154/1150 · 雞血藤 1075/1514
五味子 1247/1204 · 乳香 1151/1149 · 沒藥 1118/1119 · 益母草 1260/1227 · 澤蘭 1243/1238
肉豆蔻 1150/12610
```

**C2a2　`cloudtcm_url` 與 `exact_source_url` 本身就指向不同 id：21 張。**

**C2b　同一個 CloudTCM id 被兩張以上的卡宣稱：23 組**
（批次二只用手工比對，報 ≥6 組；全層跑出 23 組）。
其中 **16 組是「兩張卡都把它當成自己的主識別頁」**（`cloudtcm_url` / `exact_source_url`）：

| id | 宣稱者 | 性質 |
|---|---|---|
| 964 | 柏子仁 ⟷ 萹蓄 | 兩味完全無關的藥 |
| 986 | 陳皮 ⟷ 川牛膝 | 無關 |
| 987 | 赤石脂 ⟷ 沉香 | 無關 |
| 988 | 赤芍 ⟷ 川芎 | 無關（H-34 已記） |
| 1012 | 莪朮 ⟷ 黨參 | 無關 |
| 1031 | 茯苓 ⟷ 茯神 | 同株不同部位 |
| 1062 | 何首烏 ⟷ 虎杖 | 無關 |
| 1123 | 木通 ⟷ 川木通 | 品種混淆族 |
| 1148 | 肉桂 ⟷ 瞿麥 | 無關 |
| 1151 | 三七 ⟷ 乳香 | 無關 |
| 1154 | 三棱 ⟷ 桑椹 | 無關 |
| 1211 | 桃仁 ⟷ 西洋參 | 無關 |
| 1218 | 小茴香 ⟷ 通草 | 無關 |
| 1247 | 梔子 ⟷ 五味子 | 無關 |
| 1249 | 竹茹 ⟷ 五靈脂 | 無關 |
| 1309 | 制川烏 ⟷ 制草烏 | 同族 |

另 7 組是非主識別欄的引用撞號，含 **1058 烏賊骨 ⟷ 海螵蛸**、
**1783 瓜蔞 ⟷ 栝樓皮 ⟷ 栝樓仁**（三張卡搶同一個 id）、1060 滑石 ⟷ 海藻、
1075 滑石 ⟷ 雞血藤、1150 三棱 ⟷ 肉豆蔻、1225 延胡索 ⟷ 王不留行、1248 豬苓 ⟷ 烏梅。

一個 id 只對應 CloudTCM 上的一味藥，所以**每一組撞號代表至少一張卡的整份逐欄來源錨點指向別的藥。**
「柏子仁 ⟷ 萹蓄」「陳皮 ⟷ 川牛膝」「三七 ⟷ 乳香」這種完全無關的配對，
不可能是抓錯同名藥 —— 是抓取階段的 id 對位整段錯位。

**這條判準看不到的**：**哪一張卡才是對的。** 那要開 CloudTCM 頁核對，屬 Ting/RV1。
本掃描只證明 `field_sources` 現在不能被當成可信的來源錨點。

### C3 — 內部矛盾 · **35 張**（毒藥 2）

| 子判準 | 卡數 | 毒藥 |
|---|---|---|
| `ptt_toxicity`（性味欄同時有 有毒/小毒/大毒 與 無毒） | 7 | 0 |
| `ptt_temperature`（同時有 寒/涼 與 溫/熱） | 4 | 0 |
| `ptt_temp_grade`（同時有 溫 與 熱/大熱，＝ H-40 的新形態） | 4 | 0 |
| `prose_temp_polar`（散文宣稱的性與本卡結構欄**寒熱相反**） | 5 | 0 |
| `prose_temp_neutral`（一邊平、一邊寒或溫） | 10 | 1 |
| `prose_channels`（散文 `歸…經` 出現本卡 `channels_zh` 沒有的經） | 11 | 2 |
| `prose_toxicity`（散文毒性等級 ≠ 本卡性味欄毒性等級） | 1 | 1 |

`properties_taste_temp` 三個子判準的**去重卡數 = 14**（淡豆豉・赤芍・大黃・芒硝・乾薑・
肉桂・丁香・枳實・三棱・龜板・花椒・葶藶子・太子參・烏賊骨）——
與批次二 §3.1 修正後的全庫 14 **完全一致，而且 14 張全部落在這一層**。
現行 `validate-herb-integrity-predicates.js` 的 HB-6 只認前兩個形態，報 11；
HB-18（溫＋熱）尚未落地，所以另外 3 張目前無人看守。

**散文推翻結構欄**，5 張極性相反的：佩蘭・鬱金・瓜蔞・代赭石・百部。

> `herb.yin_chai_hu`（銀柴胡）`clinical_use_note`：「銀柴胡味**苦、辛**，性微寒。歸**肝、膽、脾**經。
> 具有**清熱燥濕、疏肝利膽、和胃降逆**的功效。」
> 同卡 `channels_zh` = 肝經・胃經；`properties_taste_temp` = 微寒、**甘**、無毒。
> —— 這段寫的是**柴胡**的性味歸經與功效，不是銀柴胡（甘微寒、退虛熱涼血）。
> 這是 C1 抓不到的錯藥內容：整段沒有出現「柴胡」以外的藥名，而「柴胡」是本卡名的子字串。

> `herb.ba_ji_tian`（巴戟天）`clinical_use_note`：「歸**腎、脾**經」；本卡 `channels_zh` = 腎經・**肝**經。

> `herb.ku_lian_pi`（苦楝皮）`clinical_use_note`：「苦、辛，**平**。有**小毒**。歸**肝、大腸**經。」
> 本卡 `properties_taste_temp` = 苦、寒、**有毒**；`channels_zh` = 脾經・胃經・肝經。
> 溫度、毒性等級、歸經**三項全部相反**（批次二 H-27，全層掃描重現）。

**這條判準看不到的**：（1）散文沒有用 `性X` / `歸…經` 這種可解析句型時（例如把歸經寫成
「入肺」）掃不到；（2)「本卡結構欄是錯的、散文是對的」與反過來，機器分不出來 ——
只報**兩者不一致**；（3）功效層面的矛盾（`功效` 欄放進非本味功效，H-32）不在 C3 判準內。

### C4 — 劑量一致性 · **94 張**（毒藥 5）

| 子判準 | 卡數 | 毒藥 |
|---|---|---|
| `food_over_medicinal`（食療上限 > 入藥上限） | **72** | 2 |
| `two_dose_fields_ceiling_conflict`（兩套劑量欄**上限**不一致 ≥1.2 倍或區間不相交） | **14** | 0 |
| `two_dose_fields_floor_conflict`（只有下限差 ≥2 倍） | 4 | 1 |
| `prose_dose_over_ceiling`（臨床/安全散文裡的克數 > 本卡入藥上限） | **7** | 2 |
| `dose_note_over_ceiling`（`dosage.特殊說明` 裡的克數 > 本卡入藥上限） | 7 | 1 |
| `pharm_essay_dose_over_ceiling`（藥理長文裡的實驗劑量，**不計入 headline**） | 5 | 0 |

**兩套劑量欄的上限打架 14 張** —— 批次二 H-42 只找到鬱金一張，並寫下
「批次一的『0 筆矛盾』不是錯，是樣本沒撞到」。全層數字是 **14**。
渲染器只讀 `dosage_g`，所以這 14 張讀者看到的上限與記錄裡的另一套不同。

**散文克數超過本卡上限的 7 張**（逐條可引用）：

| 卡 | 本卡上限 | 散文數字 | 原文 |
|---|---|---|---|
| `herb.huang_lian` 黃連 | 5g | **12g / 100g** | `cautions_zh[3]`「成人每日服用 12g，連續 3 周，或連續服用總量達 100g，均未見副作用。」（H-31，全層重現） |
| `herb.mu_tong` 木通 [毒] | 6g | **60g** | `safety_info.cautions_zh[0]`「過量使用關木通（>60g）可引起急性腎衰竭！」 |
| `herb.xi_xin` 細辛 [毒] | 3g | 5g | `exam_pearl`「1–3g，最多 5g」—— 這一筆是**卡自己並記了課件上限**，不是錯，但機器分不出來 |
| `herb.chan_tui` 蟬蛻 | 10g | **30g** | `cautions`「煎服或研末沖服，止痙須大量 30g。」 |
| `herb.qian_cao` 茜草 | 12g | **30g ×7 次** | `clinical_use_note`「治療吐血、衄血：茜草根 30 克，水煎服，每日 1 劑」等七條 |
| `herb.wei_ling_xian` 威靈仙 | 10g | **30g** | `clinical_use_note`「消魚骨：用本品 30 克（加醋）」 |
| `herb.gao_liang_jiang` 高良薑 | 6g | 10/15/**30g** | `clinical_use_note`「熬膏：取高良薑片 30 克…每次 10-15 克，每日 2 次」 |

`dose_note_over_ceiling` 的 7 張裡，**檳榔（毒）**最刺眼：`一般建議 3-10克`，
`特殊說明` 卻寫「驅蟲用量較大，可達 **30-60 克**」——而它 `dosage_g` 不存在，
所以那句話 HB-1 之後也到不了卡片上（批次二 H-28）。
其餘：麥芽 60-120克・艾葉 30-50克・雞血藤 60克・百合 60克・仙鶴草 30-60克・板藍根 30克。

**這條判準看不到的**：（1）**47 張卡根本沒有可解析的入藥上限**（`dosage` / `dosage_g`
都取不出克數），對它們 C4 的三個「超過上限」子判準是全盲的 —— 好消息是這 47 張裡
毒藥 0 張；（2）判準只比較**數字大小**，不看給藥途徑（外用 vs 內服）、劑型（丸散 vs 湯劑）
與適應症（回乳 vs 消食），所以麥芽 60-120克 這類**臨床上正確的大劑量特例**也會命中；
（3）`mg`、`g/kg`（動物實驗每公斤劑量）已明確排除，這是刻意的 ——
不排除的話 CloudTCM 藥理長文會把這一格洗成雜訊（未排除時是 35 張/105 條，排除後 7 張）。

### C5 — 配伍安全（十八反 / 十九畏）· **15 張**（毒藥 3）

**predicate**：從安全欄與學習筆記切句，抓 `反X`／`畏X`／`惡X`（含頓號串接
「反甘遂、京大戟、芫花、海藻」）；句子明講十八反/十九畏/相反/相畏但沒有關係詞緊接藥名時
（「與甘草相反，不可同用」），退而收句中的已知藥名。
藥名比對用**全庫 358 個 `name_zh` + `aliases_zh`，外加一份十八反/十九畏經典成員詞彙表**
（只用於辨識字串，不寫入任何資料）—— 因為 C5 要回答的正是「被點名的對造藥有沒有卡」。

**（a）語意反轉：把十八反講成療效減弱 —— 5 條 / 3 張**

> `herb.gan_sui` 甘遂 `cautions_zh` ＋舊 `cautions`：
> 「與甘草同用不宜：甘遂與甘草同用，會產生**相反的藥性**，**降低甘遂的瀉下作用**。」
> `herb.chuan_bei_mu` 川貝母 `cautions_zh` ＋舊 `cautions`：
> 「原因：川貝母與烏頭類藥材存在**相反藥性**，同時服用會**減弱藥效**或產生不良反應。」
> `herb.zhe_bei_mu` 浙貝母 `cautions_zh`：**同一句話**（因為整張卡是川貝母的複製件）。

判準刻意**只收 `十八反|相反|反X` 的句子，不收 `惡X`** —— 相惡在七情裡本來就是
「功效減弱」，把它算進來是誤判（例如川芎「惡黃連…以免降低療效」是對的）。
全層只有這 3 張，兩批眼讀猜到的 2 個實例之外沒有第三個獨立來源。

**（b）同一張卡對同一個對造用了多個關係詞 —— 2 組**

| 卡 | 對造 | 關係詞 | 落在哪些欄 |
|---|---|---|---|
| `herb.wu_ling_zhi` 五靈脂 | 人參 | **反 ＋ 畏** | `cautions_zh` · `safety_info.toxicity_zh` · `safety_info.contraindications_zh` · `safety_info.cautions_zh` |
| `herb.chuan_xiong` 川芎 | 黃連 | **惡 ＋ 畏** | `cautions_zh` · 舊 `cautions` |

**（c）方向反轉：兩側都自稱「畏」對方 —— 2 組**

| 組 | A 側欄位 | B 側欄位 |
|---|---|---|
| 丁香 ⟷ 鬱金 | `contraindications_zh`「畏鬱金」（同卡重複 2 條） | `safety_info.*`「畏丁香」＋「丁香畏鬱金」同句雙向 |
| 人參 ⟷ 五靈脂 | `contraindications_zh`「畏五靈脂」 | `cautions_zh`「反人參」＋`safety_info`「畏人參（人參畏五靈脂）」 |

**（d）pair-level agreement —— 兩側互相點名 15 組，兩側完全對得上 1 組**

「對得上」的定義（三條全滿足）：關係詞集合相同 ＋ **兩側都寫在 `contraindications_zh`**
＋ 兩側都沒有語意反轉。

> ✔ **甘草 ⟷ 海藻**（反）—— 全層唯一。與批次二 H-25(D) 的手工結論**完全一致**。

不合格的 14 組：天花粉/制川烏・甘遂/甘草・丁香/鬱金・白及/制川烏・半夏/制川烏・
川貝母/制川烏・浙貝母/制川烏・瓜蔞/制川烏・人參/五靈脂・制草烏/半夏・制草烏/天花粉・
制草烏/川貝母・制草烏/浙貝母・制草烏/白及。
**烏頭組（制川烏 6 組 ＋ 制草烏 5 組 = 11 組）全部不合格** —— 烏頭側寫在
`clinical_use_note` 的十八反列舉裡，對造側寫在 `cautions_zh`，欄位不對稱。

**（e）被點名為配伍對造、全庫查無卡的藥 —— 8 個名字**

| 名字 | 本層點名卡數 | 全庫（本判準） | 全庫（純字串出現） |
|---|---|---|---|
| **藜蘆** | 6 | 9 | **15** |
| 白蘞 | 2 | 4 | 5 |
| 貝母（屬名，川貝/浙貝各有卡） | 2 | 3 | — |
| 芫花 | 1 | 3 | 4 |
| 白芨（＝白及的異體字） | 1 | 2 | — |
| 蕪荑 · 海蛤 · 文蛤 | 各 1 | 各 1 | 各 1 |
| 京大戟 | 0（只在非本層的甘草卡） | 1 | 1 |
| 牽牛子 | 0（只在非本層的巴豆卡） | 1 | 1 |

批次二 H-38 報藜蘆被 13 張卡點名。本掃描的嚴格 predicate（要求 `反藜蘆` 或十八反句）
得 9 張；放寬成整筆記錄的純字串比對得 **15 張**（防風・細辛・柴胡・黃芩・玄參・赤芍・
川芎・丹參・人參・黨參・白芍・前胡・西洋參・虎杖・巴豆）。
**三個數字都指向同一件事：全庫被點名最多的藥沒有卡。** 差異來自 predicate 嚴格度，不是資料變動。

**這條判準看不到的**：（1）**沒有寫出來的配伍禁忌**（漏記）完全掃不到 ——
只能查已寫的那些互不互相矛盾；（2）`herb_pairs.json`（489KB）**本輪仍然沒讀**，
模板第 10 區的正本在那裡，卡片層的配伍敘述不可信之後，對藥正本是否也有同樣的方向問題**仍是未知數**；
（3）關係詞緊接藥名的抽取法，對「不宜與烏頭類藥材同用」這種**不具名的類名**只能靠詞彙表命中，
詞彙表以外的寫法會漏。

### C6 — 佔位/樣板英文 · **126 張 / 511 條**（毒藥 13 = 毒藥子集的 76.5%）

**predicate 直接複製 `js/knowledge.js` 的 `usableText`**：

```js
/^(draft:|review .+ before clinical use\.?$|verify against .+ before |pattern documentation context only)/i
```

命中 = **渲染時整條被丟掉，所以那個欄位在卡片上現在是空白**。逐欄位：

| 欄位 | 條數 |
|---|---|
| `english_exam_track.contraindications[]` | **257** |
| `english_exam_track.properties_taste_temp` | 126 |
| `english_exam_track.indications[]` | 126 |
| **頂層 `properties_taste_temp`** | **2** |

頂層那 2 條就是 `herb.zhe_bei_mu` 與 `herb.zhi_ke` ——
`263745c` 之前它們的「性味」格顯示的是一句英文佔位句，現在顯示「待補」。
**這兩張同時也是 C1 的兩張真・錯藥內容卡。**

另有 **194 張 / 237 條**同批匯入語出現在**句中**而非句首
（`Pairings depend on formula context; verify against Bensky before source_checked.` 這類），
`usableText` 的 `^` 錨定放行，**目前仍會照原樣渲染給讀者**。

毒藥 17 張裡 **13 張**的英文安全欄是這種佔位句（＝現在是空白）：甘遂・木通・附子・
吳茱萸・川楝子・半夏・天南星・杏仁・款冬花・全蠍・苦楝皮・檳榔・肉豆蔻。
批次一 H-06/H-12 的判斷在全層成立：**留空的正好是毒性最高的一群。**

**這條判準看不到的**：（1）佔位句被人工改寫成「看起來像內容」的空話（例如
`Transform phlegm or stop cough pattern context`）不在這四個 pattern 裡，**一條都抓不到**；
（2）它只算英文，中文側的同型空話沒有等價 predicate。

---

## §3 「零命中」到底代表什麼 —— 交叉檢查

六條判準零命中 **72 張（29.1%）**。但零命中 ≠ 乾淨。
把兩批眼讀已立案、**本腳本六條判準完全不碰**的七類拿來交叉比對（同樣只算這 247 張）：

| 已立案的缺陷類 | 本層卡數 | 其中落在「六條零命中」那 72 張裡 |
|---|---|---|
| H-16 `clinical_use_note` ≡ `chinese_depth_track.summary_zh`（學習筆記未撰寫） | **182** | 21 |
| H-11 `contraindications_zh` 與 `safety_info` 皆空 | **177** | 54 |
| H-12 `cautions_zh` 有值但 `cautions_en` 不存在 | **214** | 57 |
| H-39 `condition_tags_zh` 只有 1 條功效串（點下去必然 0 命中） | 94 | 31 |
| H-17 `functions_zh` > 6 條（原始倒貨） | 72 | 7 |
| H-32 `functions_zh` 與 `actions_en` 長度不等（渲染必錯位） | 32 | 5 |
| H-03 `related_formulas` 指向不含本味的方（或死 id） | **209** | 45 |

> **六條零命中「且」上列七類也全部沒中的：3 張 = 1.2%**
> `herb.bo_he`（薄荷）· `herb.xin_yi`（辛夷）· `herb.gao_ben`（藁本）

這三張都開卡讀過。薄荷是 `card_grade: template`、`updated_by: Codex`、
`contraindications_zh` 7 條逐條標 American Dragon、`cautions_en` 對齊、
`safety_review_pending` 明寫「CloudTCM 的孕期/腎/腸胃禁忌本次未找到課件或 AD 依據，
未作為本安全欄來源」——**這是誠實宣告來源缺口的寫法，不是 CloudTCM 原樣落地。**
辛夷同理（`clinical_use_note` 是真正的鑑別筆記：「跟白芷、細辛的分工…花蕾有絨毛必須包煎」）；
藁本中英 2/2・3/3・3/3・4/4 全對齊，`exam_pearl` 寫的是分經頭痛的鑑別
（藁本巔頂／白芷陽明／羌活太陽／川芎少陽），是真正的學習筆記。

**但「全零」仍然不等於無瑕**：藁本的 `contraindications_zh` 與 `cautions_zh` 逐字相同
（HB-10 那一類，本輪十三條判準沒有納入），且 `public_safe: true` 與模板 §3.5 的固定值
`false` 不符（辛夷同）。**這三張是本層的天花板，不是滿分。**

**也就是說：這一層真正「原樣落地且沒被動過」的卡，乾淨率接近 0。**

### 層內分層：被重新策展過的卡 vs 純匯入的卡

| 分組 | 張數 | 六條零命中 | ≥3 條命中 | 十三條全零 |
|---|---|---|---|---|
| `card_grade: partial` | 214 | 57（26.6%） | **31** | **0** |
| `card_grade: template` | 33 | 15（**45.5%**） | **1** | **3** |
| 帶 `updated_by`/`authored_by` | 9 | 5（55.6%） | 0 | 1 |
| 沒有（純匯入） | 238 | 67（28.2%） | 32 | 2 |

`card_grade` 在這一層是有訊號的：**33 張 template 卡貢獻了全部 3 張全乾淨卡、
只貢獻 1 張 ≥3 命中卡**；214 張 partial 卡貢獻 31 張 ≥3、0 張全乾淨。
這與兩批眼讀的結論同向並且更精確：**決定品質的不是 `review_status`，
也不只是 `source_type`，而是「這張卡有沒有被人依模板重新策展過」。**

---

## §4 Ting 要決定的那一題：逐卡修，還是整層重新取源？

**先把工作量切成兩堆（腳本直接算的）：**

| 堆 | 內容 | 卡數 | 毒藥 |
|---|---|---|---|
| **A. 批次可修**（判準已寫死，不必回頭核來源頁） | C6 佔位英文 126 · C4 食療>入藥 72 · 禁忌欄空 177 · `cautions_en` 缺 214 · condition_tags 功效串 94 · 中英長度不等 32 | **聯集 224** | 15 |
| **B. 必須開 CloudTCM 原頁才修得動**（誰是誰、哪個數字對、哪個方向對） | C1 7 · C2 43 · C3 散文矛盾 22 · C4 非食療類 32 · C5 15 | **聯集 85（34.4%）** | 8 |
| A 與 B 都沒中 | — | 16 | — |

### 支持「逐卡修」的證據

1. **要回頭核來源頁的只有 85 張（34.4%），不是 247 張。** 另外 139 張的問題純粹是
   欄位缺失、佔位句、食療欄、型別——這些不需要任何臨床判斷或重新取源，
   判準已經寫死在本腳本與兩批 ledger 裡。
2. **毒藥子集只有 17 張，其中要回頭核來源的 8 張。** 止血面的工作量是個位數卡片，
   一批就做得完。
3. **內容本身多半是有的、只是放錯格或沒進英文側。** C6 那 511 條佔位英文對應的
   中文欄大部分有內容；H-11 的 177 張「禁忌欄空」多半有 `cautions_zh`。
   **重新取源不會把這些變好——CloudTCM 頁本來就沒有分禁/慎兩欄。**
4. **本層有 72 張六條零命中，其中 15 張是 template 級。** 整層丟掉會連這些一起丟。

### 支持「整層重新取源」的證據

1. **六條 + 七類全零的只有 3 張 = 1.2%。** 「不能丟的乾淨卡」實際上只有 3 張，
   而且這 3 張的乾淨來自**已經被 Codex 重新策展過**，不是來自 CloudTCM 匯入本身。
   換句話說：**這一層作為「原樣落地」的產物，成品良率接近 0。**
2. **來源錨點本身不可信。** 43 張卡（17.4%）的 CloudTCM id 是分裂或撞號的，
   其中 16 組是兩張卡搶同一個主識別頁。**逐卡修的第一步是「打開它的來源頁」，
   而這 43 張的來源頁位址本身就是錯的** —— 對它們而言「修」和「重新取源」是同一件事。
3. **錯藥內容不是孤例。** 浙貝母／枳殼是同一批匯入、同一種失效（相鄰同名族互抄），
   加上銀柴胡（C3 抓到、C1 抓不到）與三組「同一味藥兩張卡」，
   代表**匯入階段的對位機制是壞的，不是個別頁面抄錯**。壞掉的對位會產生
   本掃描六條判準抓不到的錯（見下）。
4. **≥3 條命中的 32 張（13.0%）**，逐張走 A+B 兩種修法的成本已經高於重建一張模板卡。

### 我的答案（用上面的數字，不是意見）

> **不是二選一，是要按 `card_grade` 與 C2 切三刀：**
>
> **① 43 張 C2 命中卡（來源 id 分裂/撞號）→ 必須重新取源。** 對它們而言
> 「逐卡修」不成立，因為修的第一動作就要用到一個錯的 URL。這一堆是**重建**。
>
> **② 剩下的 204 張 → 逐卡修，但「修」的定義是「依模板重新策展」，不是「補欄位」。**
> 證據是 §3 的分層表：33 張 template 卡的品質與 214 張 partial 卡差一個量級，
> 而 template 卡用的是同一批 CloudTCM 原始素材。**素材可用，落地方式不可用。**
> 批次可修的那 224 張裡，絕大多數會在重新策展的過程中順手解決。
>
> **③ 17 張毒藥卡（其中 13 張英文安全欄現在是空白、8 張要回頭核來源）
> → 不論走哪條路都應該先做，而且是唯一應該現在就排批次的一堆。**
>
> **不要做的事：把 247 張整層 deprecate 重抓。** 那會丟掉 33 張 template 卡與
> 已經逐欄標好 `field_sources` 的部分，而重抓解決不了 H-11（禁忌/慎用分欄）、
> H-12（英文側）、H-39（索引標籤）這三類——**CloudTCM 來源本身就沒有這些欄位。**

---

## §5 這六條 predicate 看不見的東西（總表）

逐條的盲點寫在 §2 各節末，這裡只列**跨判準的結構性盲點**：

1. **不具名的錯藥內容。** C1 靠藥名計數，銀柴胡那種「整段是柴胡的內容但沒出現第二個藥名」
   要靠 C3 的歸經比對才碰得到；如果連歸經都被一起換掉（＝內部自洽的錯），**六條全盲**。
2. **漏記。** 六條全部是「已寫的東西互相矛盾」型判準。
   「檳榔全卡 0 字致癌」「吳茱萸 14 條安全敘述 0 個孕字」「細辛全卡 0 字馬兜鈴酸」
   這一類**該有而沒有**的缺口，機器無從得知，只有人讀著課件才發現。
3. **哪一邊才是對的。** C2 知道 21 張來源分裂、C3 知道散文與結構欄矛盾、
   C5 知道兩側方向相反 —— **一律不判定誰對**。那要開來源頁，屬 Ting/RV1。
4. **臨床合理性。** C4 只比數字大小，不看途徑/劑型/適應症；
   麥芽回乳 60-120克、艾葉外用 30-50克這種正確的特例照樣命中。
5. **`herb_pairs.json` 完全沒讀**（三批累計）。C5 只掃卡片層的自由文字。
6. **中文側的樣板空話**沒有等價於 C6 的 predicate。
7. **`related_formulas` 的反向缺口**（含該藥卻沒列）不在本輪任何判準內；
   H-03 的交叉檢查只算了正向（列了卻不含）。

---

## §6 腳本與驗證

`scripts/audit-herb-cloudtcm-layer.js` —— **audit tool，不是 gate**：

- 永遠 `exit 0`；**沒有、也不應該**接進 `.github/workflows/validate.yml`。
- 只讀 `data/herbs/herb_canon_shortlist.json` 與 `data/herbs/formulas.json`（交叉檢查用）。
- `--detail` 逐卡明細 · `--json <path>` 機器可讀 · `--all` 掃全 358 筆（非本層對照組）。
- 六條判準與交叉檢查的七類，predicate 全部寫在檔案內並附註為什麼這樣寫
  （特別是 C4 為什麼排除 `g/kg`、C5 為什麼不收 `惡`）。

本輪驗證輸出：

```
node scripts/audit-herb-cloudtcm-layer.js        → exit 0
node scripts/build-data.js                       → 無 diff（git status 只有本腳本與本檔）
綠燈 job 的 27 支 validator 逐支執行             → 全 PASS
  boot-order relations point-ids data interactions content-junk red-flag-registry
  gyn-legacy-migration b123-legacy-migration red-flag-wiring red-flag-runtime
  crosswalk-mappings acupoint-standard extra-point-standard herb-standard
  formula-standard formula-safety-predicates herb-integrity-predicates
  comparison-standard symptom-standard pharm-standard relation-registry
  clinical-case-standard clinical-invariants avs-library
  field-shape-consistency check-validation-ratchet
```

### 建議接續的 predicate（HB 系列，接 HB-23）

| # | 內容 | 影響 | 性質 |
|---|---|---|---|
| **HB-24** | `properties_taste_temp` 溫＋熱形態（＝ HB-18，本掃描確認全庫 14 張全在本層） | 3 張未看守 | 擴充現有 HB-6 |
| **HB-25** | 一張卡的散文 `歸…經` 與 `channels_zh` 不一致 ⇒ 報 | 11 張 | warn |
| **HB-26** | 兩套劑量欄**上限**不一致 ⇒ 報（HB-22 的收緊版，只看上限） | 14 張 | warn→blocking |
| **HB-27** | `usableText` 的四個 pattern 出現在**句中**（非句首）⇒ 報「佔位句正在渲染」 | 194 張/237 條 | warn |
| **HB-28** | 同一味藥兩張卡（`name_en` 或 id slug 互為子字串）⇒ 報 | ≥3 組 | warn，須 Ting 裁定併卡 |

（HB-17/HB-20/HB-23 已在批次二提出，本掃描的 C2b/C6 給了它們全層數字。）

---

**本輪 `git status`：只新增 `scripts/audit-herb-cloudtcm-layer.js` 與本檔。
`data/**` 零改動，未 `git add`，未 commit，未 push。**

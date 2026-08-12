# FORMULA_SAFETY_PREDICATE_BASELINE — P1/P2/P3/P4/P6 的今日基線

狀態：**baseline ledger（唯讀）。本輪沒有動 `data/herbs/**` 一個字元。**
Branch：`codex/formula-safety-predicates`（自 `origin/codex/pattern-v2` tip `ff1903e`）
日期：2026-08-12
資料：`data/herbs/formulas.json`，**224 筆 records**（222 筆有 `composition`、
40 筆 `public_safe: true`、69 筆組成含慎用藥）

判準來源：`docs/research_packs/FORMULA_EYESON_03.md` §3.1 慎用藥覆蓋矩陣 ＋ §3.2 predicate 表。
實作：`scripts/validate-formula-safety-predicates.js`
慎用藥名單：`data/config/formula_caution_herbs.json`

**一行重現**（下面每一個數字都由這一行產出，沒有手抄）：

```bash
node scripts/validate-formula-safety-predicates.js            # 人類可讀
node scripts/validate-formula-safety-predicates.js --worklist # 加 P4 條目層 452 條
node scripts/validate-formula-safety-predicates.js --json     # 機讀
```

---

## §0 這五條 predicate 能保證什麼、不能保證什麼

能保證的只有三件事：**不空 · 不亂 · 有方向**。

不能保證的是**臨床正確性**。附子卡有沒有寫先煎與心律、木通卡有沒有寫馬兜鈴酸、
大黃族有沒有寫哺乳與月經期——EYESON_03 §3.1 用人眼數過（63 卡母體，**present 只有生化湯 1 張**），
而那一層要等 `CONTENT_REQUEST` §B 的逐藥標準句連同具名來源落地，
驗證器才能從「有沒有字串」升級到「有沒有正確的字串」。
在那之前，一張卡可以五條全過而臨床上仍然是沉默的。憲法第四條：查不到就停下來回報，不要編。

**覆蓋誠實度（今日重掃）**

| 項目 | 數字 | 含意 |
|---|---|---|
| `composition[].herb_zh` 純拉丁字母 | **102 列 / 57 卡** | 中文子字串掃描的假陰性來源（F-46）。本腳本以 `herb_id` 為主鍵，**這 102 列仍可判**。 |
| `composition[].herb_id` 為空 | **14 列 / 14 卡** | **真正不可判**——P1 無法斷定這些卡含不含慎用藥。（ledger 記 10 列，本輪重掃 14。） |
| 組成表接錯方的卡（F-47） | 見 `validate-formula-composition-signatures.js` | 連 `herb_id` 都救不了；`formula.xie_xin_tang` 掛著半夏瀉心湯的表，沒有大黃列可比對。**本腳本看不見這一類。** |

所以「P1: 10 筆違反」的正確讀法是「**組成表讀得到的卡裡**有 10 筆含慎用藥而安全欄零字串」，
不是「全庫只有 10 筆慎用藥卡是沉默的」。

---

## §1 逐條計數與 CI 級別

| # | predicate | 今日違反 | CI 級別 | 為什麼 |
|---|---|---|---|---|
| **P1** | 組成含慎用藥 ⇒ 安全欄至少一條非空字串 | **10 卡** | **NOTE** | 非零。要清必須寫出警告文字，而文字需要具名來源（§3.5 T5），不是本批能做的。 |
| **P2** | `public_safe: true` ∧ 組成非空 ⇒ 同上 | **10 卡** | **NOTE** | 非零。ledger 記 17，其後 FB-26 round 3（`ff1903e`）等三次下架把 `public_safe` 從 51 降到 40，**重掃得 10**，恰為 §3.3 的 C 級 10 筆。 |
| **P3** | `public_safe: true` ⇒ `actions_zh` 無亂碼 | **5 卡** | **NOTE** | 非零。ledger 記 11 筆 public 亂碼卡，下架後**重掃得 5**。 |
| **P4** | 安全欄每一條須含方向詞 | **卡層 7 卡**（條目層 452 條 / 114 卡） | **NOTE** | 非零。卡層是可畢業的那一層；條目層 452 條是內容工程，不是閘門。 |
| **P6** | `role_zh` 全等於 君/臣/佐/使 | **6 列 / 6 卡** | **NOTE** | 非零。ledger 只點名 1 筆（蒼耳子散），重掃得 6。 |

**五條全部 NOTE，因為五條全部非零。** 預設呼叫永遠 exit 0；CI 步驟只是把數字印在每一次 run 上。
理由與 `validate-formula-composition-signatures.js` 同型，也是憲法 ratchet 存在的理由：
今天就把一條非零的閘門接上 `exit 1`，等於用一個沒人被指派去修的 backlog 去擋所有 merge，
那道閘門一週內會被關掉。

**逐條畢業**：`--blocking` 接逗號清單，一條歸零就把它加進 CI 的 flag：

```bash
node scripts/validate-formula-safety-predicates.js --blocking=P6
node scripts/validate-formula-safety-predicates.js --blocking=P2,P6
```

| # | 畢業條件 | 卡在哪 | 難度 |
|---|---|---|---|
| P1 | §2.1 的 10 卡各自有 ≥1 條安全字串，或 `deprecated` | 需要具名來源才能寫警告文字（T5） | 高（內容） |
| P2 | §2.2 的 10 卡填內容或翻 `public_safe: false`（= FB-26 C 級裁定） | 只是旗標翻轉，須 Ting 核可 | **最低** |
| P3 | §2.3 的 5 卡清乾淨或下架（FB-30 / §3.3） | 這些卡**沒有乾淨的中文正本**（唯一完整內容在 `actions_en`），下架比重寫快 | 中 |
| P4 | **只看卡層**。條目層 452 條永久 NOTE，除非 T20 另有裁定 | §2.4 的 7 卡把佔位內容搬到對的欄位（憲法第三條：**先搬再改**） | 中 |
| P6 | §2.6 的 6 列改成四值之一 | 純詞彙，不需新來源；但檔案是 `data/herbs/**`，屬方劑線 | 低 |

**不准用來畢業的做法**：刪 `data/config/formula_caution_herbs.json` 裡的 slug 讓 P1 歸零；
放寬 P4 的方向詞表讓 452 變小。數字要往下走，不是判準往下走。

---

## §2 逐條違反清單（remediation worklist）

### §2.1 P1 — 組成含慎用藥而安全欄四欄零字串（10 卡）

| # | id | 卡 | 命中的慎用藥 slug | 族 | `public_safe` |
|---|---|---|---|---|---|
| 1 | `formula.cang_er_zi_san` | 蒼耳子散 | `cang_er_zi` | other_toxic | false |
| 2 | `formula.zeng_ye_cheng_qi_tang` | 增液承氣湯 | `da_huang` `mang_xiao` | rhubarb_mirabilite | false |
| 3 | `formula.run_chang_wan` | 潤腸丸 | `tao_ren` | blood_breaking | false |
| 4 | `formula.shen_fu_tang` | 參附湯 | `fu_zi` | aconite | false |
| 5 | `formula.you_gui_yin` | 右歸飲 | `fu_zi` | aconite | false |
| 6 | `formula.shi_pi_yin` | 實脾飲 | `fu_zi` | aconite | false |
| 7 | `formula.huang_tu_tang` | 黃土湯 | `fu_zi` | aconite | false |
| 8 | **`formula.gui_zhi_shao_yao_zhi_mu_tang`** | 桂枝芍藥知母湯 | `ma_huang` `fu_zi` | ephedra + aconite | false |
| 9 | **`formula.zai_zao_san`** | 再造散 | `fu_zi` `xi_xin` | aconite + asarum | false |
| 10 | `formula.tong_qiao_huo_xue_tang` | 通竅活血湯 | `hong_hua` | blood_breaking | false |

**「安全欄零字串」的原文長什麼樣**：沒有原文可引用——**這一條的「原文」就是缺席本身**。
四個欄位在這 10 卡上有兩種缺席型態，逐卡混用（判準只看非空字串總數，兩種等價）：

```
cang_er_zi_san               C_zh=undef  C_en=undef  K_zh=undef  K_en=undef   ← 四個 key 都不存在
zeng_ye_cheng_qi_tang        C_zh=undef  C_en=undef  K_zh=undef  K_en=undef
run_chang_wan                C_zh=undef  C_en=undef  K_zh=undef  K_en=undef
shen_fu_tang                 C_zh=undef  C_en=undef  K_zh=undef  K_en=undef
shi_pi_yin                   C_zh=undef  C_en=undef  K_zh=undef  K_en=undef
you_gui_yin                  C_zh=undef  C_en=[]     K_zh=undef  K_en=[]      ← 混：兩個空陣列
zai_zao_san                  C_zh=undef  C_en=[]     K_zh=undef  K_en=[]         （ledger §3.1 記的「禁忌欄空陣列」型）
tong_qiao_huo_xue_tang       C_zh=undef  C_en=[]     K_zh=undef  K_en=[]
huang_tu_tang                C_zh=[]     C_en=[]     K_zh=[]     K_en=undef   ← 三個空陣列
gui_zhi_shao_yao_zhi_mu_tang C_zh=[]     C_en=[]     K_zh=undef  K_en=[]
```

（`C_` = `contraindications_`、`K_` = `cautions_`。）

三點值得注意：

1. **10 筆全部 `public_safe: false`**——FB-19/FB-26 三輪下架已經把 P1 與 P2 的交集清空了。
   也就是說今天 P1 擋的是「病人看不到、但庫裡仍然沉默」的卡，不是止血級，是覆蓋級。
2. **8 與 9 兩筆不在 EYESON_03 §1 的 25 筆逐卡清單裡**，是 predicate 固化之後才浮出來的——
   §3.1 矩陣把桂枝芍藥知母湯記為 partial（「僅 en」）、再造散記為 absent（「禁忌欄空陣列」），
   而機器判準看的是四欄非空字串總數，兩者都歸零。**這正是「不再靠人眼撞見」的意思。**
3. `da_huang`＋`mang_xiao`（增液承氣湯）與 `fu_zi`＋`ma_huang`（桂枝芍藥知母湯）是雙族卡，
   §3.1 的兩個矩陣區塊各記一次，這裡只記一張卡。

### §2.2 P2 — `public_safe: true` ∧ 組成非空 ∧ 安全欄零字串（10 卡）

`public_safe: true` 今日共 **40 筆**（ledger 記 51，其後下架 11 筆）。違反的 10 筆：

| # | id | 卡 | 味數 | 對到 EYESON_03 §3.3 |
|---|---|---|---|---|
| 1 | `formula.xiang_su_san` | 香蘇散 | 4 | C 級 |
| 2 | `formula.dang_gui_liu_huang_tang` | 當歸六黃湯 | 9 | C 級 |
| 3 | `formula.liu_yi_san` | 六一散 | 2 | C 級（**同時違反 P3、P6**） |
| 4 | `formula.ji_chuan_jian` | 濟川煎 | 6 | C 級（**同時違反 P3**） |
| 5 | `formula.xiang_sha_liu_jun_zi_tang` | 香砂六君子湯 | 9 | C 級 |
| 6 | `formula.zuo_gui_yin` | 左歸飲 | 6 | C 級 |
| 7 | `formula.gua_lou_xie_bai_ban_xia_tang` | 瓜蔞薤白半夏湯 | 4 | C 級（**同時違反 P3**；含半夏，T18 十八反） |
| 8 | `formula.ju_pi_zhu_ru_tang` | 橘皮竹茹湯 | 6 | C 級（**同時違反 P3**） |
| 9 | `formula.ling_gui_zhu_gan_tang` | 苓桂朮甘湯 | 4 | C 級（**同時違反 P3**） |
| 10 | `formula.san_zi_yang_qin_tang` | 三子養親湯 | 3 | C 級（**同時違反 P6**） |

**10 = §3.3 的 C 級 10 筆，一筆不多一筆不少**（17 − A/B 已下架的 7 = 10）。
換句話說 **P2 今天的畢業條件就是 FB-26 的 C 級裁定**，不需要任何新內容。
10 筆之中 **5 筆同時是 P3 違反**（功效欄印亂碼），這 5 筆在卡片上是「沒有禁忌 ＋ 功效讀不懂」。

### §2.3 P3 — `public_safe: true` 而 `actions_zh` 亂碼（5 卡）

全庫亂碼母體 **22 卡 / 83 條**（與 EYESON_03 F-49 的 22/83 逐數字相符——
判準必須同時接受半形與全形逗號才對得上，`bei_mu_gua_lou_san` 的 `"理氣寬中,與氣"` 是那一列）。
其中仍 public 的 5 卡：

| id | 卡 | `actions_zh` 原文 | 命中的規則 |
|---|---|---|---|
| `formula.liu_yi_san` | 六一散 | `"-熱與於濕邪"` | 以冒號/破折號起首 |
| `formula.ji_chuan_jian` | 濟川煎 | `"溫中腎，於於與"` | 逗號後接孤立的「於/與」 |
| `formula.gua_lou_xie_bai_ban_xia_tang` | 瓜蔞薤白半夏湯 | `"陽，氣與止於"` | 以「於/與」結尾 |
| `formula.ju_pi_zhu_ru_tang` | 橘皮竹茹湯 | `"胃熱與補益胃氣於"` | 以「於/與」結尾 |
| `formula.ling_gui_zhu_gan_tang` | 苓桂朮甘湯 | `"溫中陽,化痰降逆-,健脾益氣與於"` / `"溫中痰-與"` | 以「於/與」結尾（2 條） |

**5 卡全部同時是 P2 違反**（見 §2.2）。卡片 §1 區塊 5「功效」印出來的就是這些字。
F-49 已記：這些卡**沒有乾淨的中文正本**可以鏡射，唯一完整的內容在 `actions_en`，
所以修法要 Ting 定（FB-30 / T13）。

### §2.4 P4 — 安全欄有字串、但沒有一條含方向詞（卡層 7 卡）

這是矩陣真正的付款。這 7 卡的安全欄**通得過任何長度檢查**（`contraindications_zh.length > 0`），
但四欄合起來**沒有一條在說「誰不能吃」**——所以它們實際上與 §2.1/§2.2 的零字串卡同型，
只是零字串換成了佔位內容。

| # | id | 卡 | `public_safe` | 條數 | 佔位內容原文（`contraindications_zh[0]`） | 佔位型態 |
|---|---|---|---|---|---|---|
| 1 | `formula.chai_hu_jia_long_gu_mu_li_tang` | 柴胡加龍骨牡蠣湯 | false | 2 | 「原方第五味為鉛丹（一兩半）。鉛丹為含鉛礦物藥，現代不入藥、不調劑，本方組成表只列 11 味可調劑藥材；鉛丹原文保存於本筆 `historical_ingredients_omitted` 欄位，以免原方樣貌被靜默抹去。」 | **來源說明**（F-57） |
| 2 | `formula.huang_lian_e_jiao_tang` | 黃連阿膠湯 | false | 3 | 「本方證的病機是正虛邪實，所以一面用苦寒瀉火，一面以酸甘滋陰。如果體內虛多邪少，則非本方所宜！」 | **病機解說** |
| 3 | **`formula.qing_gu_san`** | 清骨散 | **true** | 4 | 「陰虛嚴重者，宜加滋陰藥」 | **加減建議** |
| 4 | **`formula.er_miao_san`** | 二妙散 | **true** | 4 | 「肺熱或肝腎虛者，宜加減使用」 | **加減建議** |
| 5 | **`formula.si_miao_wan`** | 四妙丸 | **true** | 4 | 「肺熱或肝腎虛者，宜加減使用」 | **加減建議** |
| 6 | `formula.ding_zhi_wan` | 定志丸 | undefined | 4 | 「陰血虛者宜加減使用」 | **加減建議** |
| 7 | `formula.zeng_ye_tang` | 增液湯 | undefined | 4 | 「本方僅適用於熱燥嚴重傷陰耗津所致之便秘」 | **適應症反述** |

兩件事必須寫下來：

1. **第 3/4/5 三筆是 `public_safe: true`。P2 看不見它們**（四欄有字串），
   **P4 看得見**。也就是說 §2.2 的 10 筆不是 public 卡沉默的全部——加上這三筆是 **13 筆**。
   這正是 ledger 說「沒有 P4，F-57 那種卡會永遠通過」的意思，而且它抓到的比 ledger 預期的多。
2. **「加減建議」是 F-57 之外的第四種佔位型態**。EYESON_03 F-57 記了三種
   （療效主張、來源說明、飲食建議），本輪固化後浮出第四種：
   **「宜加減使用」——那是配伍指示，不是禁忌**。7 筆裡佔 4 筆，是最大的一族。
   修法同憲法第三條：**先搬到 `modifications_zh` / `clinical_use_note` 之類的對的欄位，再改原欄位**，
   順序反了就會忘記搬。

**第 1 筆的判準註記**：`contraindications_en[0]` 寫著 `"...lists only the 11 dispensable ingredients"`。
EYESON_03 §3.2 的 P4 英文方向詞表列了裸的 `only`——**照抄會讓這條 predicate 放過它當初被寫來抓的那張卡**。
本實作因此**刻意不採用 `only`**，並在腳本 header 註明。同理 `忌食` 不算方向詞
（那是 `yin_chen_hao_tang.contraindications_zh[2]` 的飲食建議型態，是要被抓的，不是要放過的）。

**條目層（452 條 / 114 卡，永久 NOTE）**：個別條目沒有方向詞、但同卡另有條目有。
噪音大是結構性的——`contraindications_en` 的簡短條目如 `"Yang Ming Fu pattern."`
`"True Cold with False Heat."` 是**真的禁忌**，方向由**欄位名**承載而不是由句子承載。
分佈最重的前幾筆：`wu_ling_san` 19 · `ba_zheng_san` 12 · `ci_zhu_wan` 12 ·
`fang_ji_huang_qi_tang` 10 · `bu_yang_huan_wu_tang` 9。全表用 `--worklist` 取。
這一層要不要動，是 §3.5 **T20** 的題目，不是本腳本能裁定的。

### §2.5 （P5 未實作）

§3.2 的 P5（同一主題詞同時搭配「禁用」與「慎用」）本批未實作。
理由：F-51 已證明它的**根因在產生端**（`cautions_en` 在 163/224 筆上是 `contraindications_en` 的逐字拷貝），
在 T8 裁定 `cautions_*` 是不是獨立欄位之前，寫一條在譯文層數矛盾的 predicate
會把一個必然產物報成 N 筆隨機缺陷。列在此以說明「不是漏掉，是刻意不做」。

### §2.6 P6 — `role_zh` 不是 君/臣/佐/使 全等（6 列 / 6 卡）

| # | id | 卡 | 藥 | `role_zh` 原值 |
|---|---|---|---|---|
| 1 | `formula.jing_fang_bai_du_san` | 荊防敗毒散 | 桔梗 | `"佐使"` |
| 2 | `formula.chai_ge_jie_ji_tang` | 柴葛解肌湯 | 桔梗 | `"佐使"` |
| 3 | `formula.cang_er_zi_san` | 蒼耳子散 | 薄荷 | `"佐使"` |
| 4 | `formula.liu_yi_san` | 六一散 | 甘草 | `"臣使"` |
| 5 | `formula.shi_quan_da_bu_tang` | 十全大補湯 | 肉桂 | `"佐使"` |
| 6 | `formula.san_zi_yang_qin_tang` | 三子養親湯 | 萊菔子 | `"佐使"` |

ledger 只點名第 3 筆；固化後是 **6 筆**，且**兩種值**（`"佐使"` ×5、`"臣使"` ×1）。

**為什麼既有的 F7 檢查抓不到**：`scripts/validate-formula-standard.js:124` 的
`ROLE_OK = /^(君|臣|佐|使|chief|deputy|assistant|envoy)/i` 是**前綴**正則，
`"佐使"` 命中 `^佐` 就通過。F-59 寫明「判準要寫死是**全等**」，本 predicate 就是那個全等。

**空值不算違反**：`role_zh` 缺席或空字串是**合法**的。
`chai_hu_jia_long_gu_mu_li_tang` 11 味裡 10 味留空，因為《傷寒論》原文不指派君臣佐使、
SOL 也未裁定——留空是誠實的答案，編一個角色不是。憲法第四條。

---

## §3 這份基線之後要看的數字

再跑一次上面那一行指令，把數字對到這張表；**任何一格變大都是退步**：

| predicate | 2026-08-12 基線 | 今天 |
|---|---|---|
| P1 | **10** 卡 | |
| P2 | **10** 卡 | |
| P3 | **5** 卡（全庫亂碼母體 22 卡 / 83 條） | |
| P4 卡層 | **7** 卡 | |
| P4 條目層 | **452** 條 / 114 卡 | |
| P6 | **6** 列 / 6 卡 | |
| `public_safe: true` | **40** 筆 | |
| 組成含慎用藥 | **69** 卡 | |
| `herb_id` 為空（不可判） | **14** 列 / 14 卡 | |
| `herb_zh` 純拉丁（可判但不可中文掃描） | **102** 列 / 57 卡 | |

**交集提醒**：P2 的 10 筆裡有 5 筆同時違反 P3、2 筆同時違反 P6；
P4 卡層的 7 筆裡有 3 筆是 `public_safe: true` 而 P2 看不見。
把 P2 清成 0 不等於 public 卡都有禁忌了——**P2 ∪ P4卡層(public) 才是「病人看得到而安全欄實質為空」的全集，今天是 13 筆。**

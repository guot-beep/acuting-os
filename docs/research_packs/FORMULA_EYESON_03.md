# FORMULA_EYESON_03 — 方劑卡人眼審查第三批（慎用藥母體收尾 21 方 + 高曝光補讀 4 方）

狀態：**findings ledger（唯讀）。本輪沒有動 `data/**` 一個字元。**
Branch：`codex/formula-eyeson-3`（自 `origin/codex/pattern-v2` tip `dab9ae8`）
日期：2026-08-12
對象：`data/herbs/formulas.json`（224 筆 records，其中 222 筆有 `composition`）
前兩批：`FORMULA_EYESON_01.md`（F-01…F-24 / FB-1…FB-13 / 31 卡）、
`FORMULA_EYESON_02.md`（F-25…F-45 / FB-14…FB-24 / 30 卡）
本批 F 編號自 **F-46** 起、FB 編號自 **FB-25** 起。

⚠️ **已備案、本批不重複計數的兩族**：`herb_zh`/`name_zh` 拼音化、
逐味「健脾和中，調和諸藥。」樣板。本批只在（a）它落在慎用藥上、
或（b）它造成**新的**機械後果（見 F-46 掃描盲點、F-52 清除不全）時引用。

⚠️ **已下架的 9 筆 `public_safe` 不重複列**：`da_huang_mu_dan_tang` `ge_gen_tang`（F-19，`1379063`）、
`shen_fu_tang` `shi_pi_yin` `zi_xue_dan` `liang_ge_san` `fu_zi_li_zhong_wan` `shen_qi_wan` `yang_he_tang`
（FB-19 round 2，`a040080`）。本批只報**新的**候選。
本輪重掃 `public_safe === true` = **51**（batch 1 記 60、batch 2 記 58，60−9=51，對得上）。

---

## §0 取樣與方法

### 剩餘慎用藥母體是怎麼算出來的（可一行重現）

派工單估「約 20 筆待讀」。實際掃描結果與 batch 2 的母體數字**對不起來**，
原因值得單獨記一條（F-46），這裡先寫過程：

**第一次掃描（照 batch 2 的做法，用 `composition[].herb_zh` 的中文子字串）**

判準：`composition[].herb_zh|name_zh` 含
`附子/川烏/草烏/烏頭 · 麻黃 · 大黃/芒硝 · 細辛 · 朱砂/硃砂/雄黃 · 全蠍/蜈蚣/水蛭 · 桃仁/紅花/三稜/莪朮`
任一，**先把 `麻黃根` 換成佔位符再比對**（batch 2 的 `mu_li_san` 假陽性教訓）。

結果：慎用藥母體 **61 筆**，其中已讀 61 卡中有 **42 筆**是慎用藥卡
（batch 1 貢獻 12 筆、batch 2 貢獻 30 筆），**未讀 19 筆**。

**第二次掃描（改用 `composition[].herb_id` slug + 拼音 fallback）**

多抓到 **2 筆**，兩筆都在最高風險的族：

| id | 卡 | 藥 | 為什麼第一次沒抓到 |
|---|---|---|---|
| `formula.xiao_huo_luo_dan` | 小活絡丹 | **制川烏（臣）＋制草烏（君）** | `herb_zh` 是 `"Zhi Chuan Wu"` / `"Zhi Cao Wu"`（拼音），中文子字串比對必然落空；`herb_id` 是對的（`herb.chuan_wu` / `herb.cao_wu`） |
| `formula.zhu_sha_an_shen_wan` | 朱砂安神丸 | **硃砂（君）** | `herb_zh` 是 `"Shui Fei Zhu Sha"`；`herb_id` 是 `herb.zhu_sha` |

→ **修正後的慎用藥母體 = 63 筆，未讀 = 21 筆。**

**這 21 筆全部讀完**（母體歸零）。因不足 25，依派工單補讀 4 筆最高曝光的未讀卡。

### 補讀 4 筆的取法

未讀的 144 筆非慎用藥卡，`condition_links + related_conditions + western_condition_links +
modern_application_condition_ids` **全部為 0**（batch 1 已把所有 links > 0 的取完），
所以「most condition-linked」在這一層沒有鑑別力。改用**實際病人曝光度**排序：

```
排序鍵 = public_safe === true（今天就會被病人看到）
       → 安全欄字串總數 === 0（看得到但沒有任何禁忌）
       → exam_star desc → 組成味數 desc → id asc
```

依此取 4 筆，並優先挑臨床風險型態互異的：

| id | 卡 | 為什麼是這 4 筆 |
|---|---|---|
| `formula.shou_tai_wan` | 壽胎丸 | public + **孕期安胎方**（主治含「胎漏下血」），安全欄四個全部不存在 |
| `formula.cang_er_zi_san` | 蒼耳子散 | public + 君藥**蒼耳子有肝毒性**（過量中毒有文獻），安全欄四個全部不存在 |
| `formula.chai_hu_gui_zhi_tang` | 柴胡桂枝湯 | public + **小柴胡湯合方**（batch 1 F-04 的干擾素／間質性肺炎訊號直接適用），安全欄四個全部不存在 |
| `formula.qing_wen_bai_du_yin` | 清瘟敗毒飲 | public + 14 味大寒急重方（石膏 60–120g、水牛角 30–120g），安全欄四個全部不存在 |

### 本批 25 個 id

```
# 慎用藥母體剩餘 21 筆
formula.jiu_wei_qiang_huo_tang   formula.shao_yao_tang        formula.tiao_wei_cheng_qi_tang
formula.zeng_ye_cheng_qi_tang    formula.ma_zi_ren_wan        formula.run_chang_wan
formula.dang_gui_si_ni_tang      formula.you_gui_wan          formula.you_gui_yin
formula.chai_hu_jia_long_gu_mu_li_tang                        formula.bu_yang_huan_wu_tang
formula.shi_hui_san              formula.yin_chen_hao_tang    formula.chuan_xiong_cha_tiao_san
formula.xiao_huo_luo_dan         formula.huang_tu_tang        formula.shi_pi_san
formula.wei_jing_tang            formula.tong_qiao_huo_xue_tang
formula.da_xian_xiong_tang       formula.zhu_sha_an_shen_wan
# 高曝光補讀 4 筆
formula.shou_tai_wan             formula.chai_hu_gui_zhi_tang
formula.cang_er_zi_san           formula.qing_wen_bai_du_yin
```

**下一批做同類掃描的人請注意**：batch 2 的教訓是「`麻黃根` 不是麻黃」（假陽性），
本批的教訓是**假陰性**——`herb_zh` 拼音化的 102 列 / 57 卡會讓任何中文子字串掃描漏掉，
**必須以 `herb_id` slug 為主鍵、`herb_zh` 為輔**。再加一條：組成表接錯方的卡
（F-47）連 `herb_id` 都救不了，因為那張表根本是別的方的。

### 方法

每筆從 `data/herbs/formulas.json` 整筆取出、攤平成逐欄文字後**整份逐行讀完**
（含 `composition[]` 每一味的六個功效欄、`english_exam_track`、`chinese_depth_track`、
`action_profile`、`field_sources`、`correction_note`）。
`modern_applications_zh` / `treats_zh` / `symptoms_zh` / `modern_diseases_zh` / `syndromes_zh`
另存成中英並排檔（本批 2,776 行）過目。

機器掃描**只用來量化已經用眼睛確認過的問題有多廣**。§2、§3 每一個數字都能被
「讀 `data/herbs/formulas.json` + 本節寫明的判準」一次重算。

### 判級規則（沿用 batch 1/2）

- **DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷
- **MINOR** = 只有 QUALITY 級
- **CLEAN** = 引不出任何一條

### 慎用藥覆蓋三態定義（沿用 batch 2 §0，供 §3 矩陣使用）

| 級 | 定義 |
|---|---|
| **present** | 該藥的招牌警告以**可搜尋字串**出現在安全欄（`contraindications_*` / `cautions_*` / `safety_flags` / `clinical_pearls`），**且中英同時有** |
| **partial** | 只出現在單一語言、或只出現在非安全欄、或只講了一半 |
| **absent** | 全卡 grep 不到任何一個字 |

**本 ledger 沒有替任何一張卡寫入警告文字**（憲法第四條）。只分類缺口、只引用原文。

---

## §1 逐卡判定

| # | id | 卡 | 警訊藥 | 判定 | 一句話 |
|---|---|---|---|---|---|
| 1 | `jiu_wei_qiang_huo_tang` | 九味羌活湯 | 細辛 | **DEFECT** | 細辛 `dose_g: "1-6g"`（藥典 1–3g 兩倍）而全卡無劑量警語；`contraindications_zh` 兩條互為改寫的重複句；`taiwan_pharmacopeia_zh: "Yes (THP p.129)"` |
| 2 | `shao_yao_tang` | 芍藥湯 | 大黃 | **DEFECT** | **`public_safe: true`** 含大黃而**無孕期**（禁忌 2/2 只講虛寒久痢與表證）；`pattern_indications_zh[1]` 又是「蠱毒 / 蠱證」；`contraindications_en` 與 `cautions_en` 逐字相同 |
| 3 | `tiao_wei_cheng_qi_tang` | 調胃承氣湯 | 大黃 芒硝 | **MINOR** | 本批安全欄品質最好的承氣方（孕期中英對齊、體虛須加補益），缺的是哺乳／月經／`safety_flags`；芒硝標「佐」（標準為臣） |
| 4 | `zeng_ye_cheng_qi_tang` | 增液承氣湯 | 大黃 芒硝 | **DEFECT** | **`public_safe: true` 且禁忌／慎用四欄全部不存在**；`actions_zh = ["滋陰養陰，熱與", "於與於陽於熱"]`；芒硝中文功效欄被樣板清除後留空 |
| 5 | `ma_zi_ren_wan` | 麻子仁丸 | 大黃 | **DEFECT** | 同卡 `contraindications_zh[0]`「孕婦**禁**用」與 `[3]`「孕婦**慎**用」並存；zh 7／en 3，中文獨有的「需要驗尿者不宜服用」英文讀者看不到；`herb_drug_interactions_en` 是療效主張 |
| 6 | `run_chang_wan` | 潤腸丸 | 桃仁 | **DEFECT** | **`public_safe: true` 且安全欄四個全部不存在**，含桃仁、主治「產後習慣性便秘」；`actions_zh = ["於於，補血養血與陰", "於血,氣與軟堅"]`；君藥麻子仁仍帶「和中健脾，調和諸藥。」而同卡 `correction_note` 只清了桃仁 |
| 7 | `dang_gui_si_ni_tang` | 當歸四逆湯 | 細辛（＋**木通**） | **DEFECT** | **`composition[6]` 是「木通」——本方第七味應為通草**；全卡無馬兜鈴酸；細辛 `1.5-9g` 且功效欄寫「緩急止痛。」；`contraindications_en[1]/[2]` 對同一件事同時說 caution 與 Contraindicated |
| 8 | `you_gui_wan` | 右歸丸 | 附子 | **DEFECT** | 制附子 `3-18g` 為君而孕期／毒性／先煎全無；`herb_drug_interactions_en` 是「逆轉類固醇免疫抑制」的療效主張；`Chao Shan Yao` `Chao Gou Qi Zi` 拼音化 |
| 9 | `you_gui_yin` | 右歸飲 | 附子 | **DEFECT** | **`public_safe: true`，`contraindications_zh/en` `cautions_zh/en` 四欄全部不存在**（含制附子）；`pulse_en = "ain, sore low"`；同卡既寫「★ 2026 NCBAHM 官方大綱必考首選」又寫「不在應試範圍」 |
| 10 | `chai_hu_jia_long_gu_mu_li_tang` | 柴胡加龍骨牡蠣湯 | 大黃 | **DEFECT** | **`public_safe: true`，而唯一的 `contraindications_zh[0]` 講的是鉛丹為什麼被移出組成表——那是來源說明不是禁忌**；含大黃而無孕期；但鉛丹的處理本身是全庫典範（見 F-56） |
| 11 | `bu_yang_huan_wu_tang` | 補陽還五湯 | 桃仁 紅花 | **DEFECT** | **全庫唯一寫到 aspirin／warfarin 併用出血風險的卡，而它是中文獨有**（zh 12／en 8）；`safety_flags: []`、`herb_drug_cautions: []`；`pharmacology_zh` 無 `field_sources` |
| 12 | `shi_hui_san` | 十灰散 | 大黃 | **DEFECT** | 含大黃、茜草、牡丹皮而**全卡無孕期**；`actions_zh[0]` 與 `[1]` 都是「涼血止血」（對到兩條不同英文）；zh 4／en 3；十味「燒炭存性」只寫在禁忌欄長句裡，無炮製欄 |
| 13 | `yin_chen_hao_tang` | 茵陳蒿湯 | 大黃 | **DEFECT** | `contraindications_zh` 3／`_en` 2 且**內容互不對應**——英文那兩條的忠實中譯躺在 `cautions_zh`，`contraindications_zh` 是另一套 CloudTCM 文字（含一條飲食建議） |
| 14 | `chuan_xiong_cha_tiao_san` | 川芎茶調散 | 細辛 | **DEFECT** | **君藥標成薄荷、川芎標臣**——方名裡的那味藥不是君；細辛 `1-10g`；白芷／羌活／細辛三味的 `in_formula_zh` 同為「緩急止痛。」；`pattern_indications_zh[0] = "外證"` |
| 15 | `xiao_huo_luo_dan` | 小活絡丹 | **川烏 草烏** | **DEFECT** | **制草烏（君）與制川烏（臣）`dose_g` 皆為 `"180g"`**；全卡無烏頭鹼／先煎／心律；`public_safe: true`；`herb_zh` 拼音化使它逃過 batch 2 的掃描 |
| 16 | `huang_tu_tang` | 黃土湯 | 附子 | **DEFECT** | `actions_zh` 是佔位符「黃土湯：**清熱解表、調理氣血**」×2（黃土湯是溫陽止血方）；**禁忌／慎用／`safety_flags` 全空**而含附子 9g；生地黃與黃芩的 `in_formula_en` 都寫著甘草的「Tonifies Qi and harmonizes ingredients.」 |
| 17 | `shi_pi_san` | 實脾散 | 附子 | **DEFECT** | 與 batch 2 已讀的 `shi_pi_yin` **是同一個方的第二筆記錄**（差別只在「炮薑」vs 拼音「Pao Jiang」）；十味 `dose_g` 一律 `4-30g`；禁忌只有「陽水者禁用」一條，無孕期無毒性 |
| 18 | `wei_jing_tang` | 葦莖湯 | 桃仁 | **DEFECT** | 同一句英文 `"Pregnancy."` 被譯成 `contraindications_zh[0]`「孕婦**禁**用」與 `cautions_zh[0]`「孕婦**慎**用」；含桃仁而無出血／抗凝 |
| 19 | `tong_qiao_huo_xue_tang` | 通竅活血湯 | 紅花 | **DEFECT** | **組成只有 3 味**（赤芍、紅花、黃酒），漏掉川芎、桃仁、麝香、老蔥、生薑、紅棗；黃酒 `herb_zh = "—"`、`dose_g = "250g"`；**安全欄四個全空** |
| 20 | `da_xian_xiong_tang` | 大陷胸湯 | 大黃 芒硝（＋**甘遂**） | **DEFECT** | 君藥**甘遂**（峻下逐水，本批毒性最高的一味）三個中文功效欄皆為空字串，`in_formula_en` 才寫著 `**Potentially toxic; strict dosing required.**`；禁忌 4/4 對齊且含孕期，是本批安全欄形狀最好的毒藥卡 |
| 21 | `zhu_sha_an_shen_wan` | 朱砂安神丸 | **硃砂** | **DEFECT** | 硃砂 `dose_g: "3-15g"`（藥典 0.1–0.5g，約 **30 倍**）；`in_formula_zh = "清熱瀉火， **，**。"`（F-26 殘骸）；**但禁忌欄寫著「朱砂現已不再使用，須以適當藥物替代」——中英俱全，是全庫礦物毒藥法規現況寫得最清楚的一張** |
| 22 | `shou_tai_wan` | 壽胎丸 | （補讀） | **DEFECT** | **`public_safe: true`，安全欄四欄全部不存在**，而它是治「胎漏下血、習慣性流產」的孕期方；`actions_zh = ["補益腎，補血養血與", "肝/腎與"]`；菟絲子 `120g`、阿膠 `60g` 進了 `decoction_reference_g` |
| 23 | `chai_hu_gui_zhi_tang` | 柴胡桂枝湯 | （補讀） | **DEFECT** | **`public_safe: true`，安全欄四欄全部不存在**，而本方＝小柴胡湯＋桂枝湯，batch 1 F-04 的干擾素／間質性肺炎訊號一個字都沒有；`actions_zh = ["調和陽與陽", "風-寒與調和營衛", "理氣寬中與緩解與"]`；組成層卻是本批品質最高的一份（見 F-56） |
| 24 | `cang_er_zi_san` | 蒼耳子散 | （補讀，蒼耳子） | **DEFECT** | **`public_safe: true`，安全欄四欄全部不存在**，君藥蒼耳子有肝毒性；`actions_zh = ["風與", "止與緩解"]`；辛夷 `classical_amount_text = "half分"`；蒼耳子**連 `dose_g` / `dose_range` 都沒有**；薄荷 `role_zh = "佐使"`（F7 只允許四值之一） |
| 25 | `qing_wen_bai_du_yin` | 清瘟敗毒飲 | （補讀） | **DEFECT** | **`public_safe: true`，安全欄四欄全部不存在**（14 味大寒急重方）；**14 味中 11 味 `role_zh = "使"`**；**9 味的 `in_formula_en` 是「Tonifies Qi and harmonizes ingredients.」**——英文側樣板句 |

**CLEAN 0 / MINOR 1 / DEFECT 24。**

三批合計 **86 卡：CLEAN 0 / MINOR 2 / DEFECT 84。**
慎用藥母體 **63 筆全部讀完**（batch 1 12 ＋ batch 2 30 ＋ batch 3 21）。

---

## §2 findings（接續 batch 2 的 F-45）

嚴重度：**SAFETY**（影響用藥安全判斷）／**CLINICAL**（臨床或考試內容錯誤）／
**QUALITY**（可讀性、欄位形狀、來源紀律）。

---

### F-46 拼音化的 `herb_zh` 讓慎用藥掃描產生假陰性，兩張最毒的卡因此漏掉兩批 — **SAFETY／方法論**

batch 1 把 `herb_zh` 拼音化備案成「品質問題」（251 筆），batch 2 沿用中文子字串掃描。
本批發現它是**安全掃描的盲點**：

```
formula.xiao_huo_luo_dan.composition[0].herb_zh = "Zhi Cao Wu"   herb_id = "herb.cao_wu"   role_zh = "君"
formula.xiao_huo_luo_dan.composition[1].herb_zh = "Zhi Chuan Wu" herb_id = "herb.chuan_wu" role_zh = "臣"
formula.zhu_sha_an_shen_wan.composition[0].herb_zh = "Shui Fei Zhu Sha" herb_id = "herb.zhu_sha" role_zh = "君"
```

任何以「組成含 附子/川烏/草烏/朱砂…」為判準的中文比對，都會判定這兩張卡**不含慎用藥**。
它們是川烏＋草烏同方、以及硃砂為君的兩張卡——**正好是母體裡最該先看的兩張**。

**規模**：`composition[].herb_zh` 只有拉丁字母、無中日韓字：**全庫 102 列 / 57 卡**。

**重現**：`composition[]` 中 `/[A-Za-z]/.test(herb_zh) && !/[一-鿿]/.test(herb_zh)` 的列。

**建議**：任何安全性掃描（含未來的驗證器 predicate）**一律以 `herb_id` slug 為主鍵**。
`herb_zh` 是顯示層，不能當索引。FB-25。

---

### F-47 `formula.xie_xin_tang` 的整張組成表是半夏瀉心湯的，而它 `public_safe: true` — **SAFETY（本批最嚴重）**

batch 2 F-32 找到桂枝茯苓丸帶著茯苓丸的組成。本批把偵測固化後發現**全庫有 7 對**，
其中這一對最危險：

```
formula.xie_xin_tang         名 瀉心湯    public_safe: true  exam_star 1  on_board_list true
  composition = 制半夏6-12g / 乾薑2-12g / 黃芩3-10g / 黃連1-6g / 人參3-10g / 大棗3g / 炙甘草3-9g
formula.ban_xia_xie_xin_tang 名 半夏瀉心湯 public_safe: false review_status draft
  composition = 制半夏6-12g / 乾薑2-12g / 黃芩3-10g / 黃連1-6g / 人參3-10g / 大棗3g / 炙甘草3-9g
```

逐味 `herb_zh` 與 `dose_g` **完全相同**。

**瀉心湯（＝大黃黃連瀉心湯／三黃瀉心湯，《金匱要略》）是大黃、黃連、黃芩三味。**
這張卡的組成表**沒有大黃**，卻多了半夏、乾薑、人參、大棗、炙甘草。後果有三層：

1. 一張 `on_board_list: true` `exam_star: 1` 的考綱方，組成表是別的方的。
2. **本卡是慎用藥卡（含大黃），但任何以 `composition` 為判準的慎用藥掃描都看不見它**
   ——F-46 是 `herb_zh` 型別造成的假陰性，這是**整張表接錯方**造成的假陰性，
   後者連 `herb_id` 都救不了。本 ledger 的 63 筆母體因此**可能仍是低估**。
3. 卡上 `actions_zh[2] = "燥濕便秘"` —— 不是功效語（「燥濕」＋「便秘」黏成一詞）。

**全庫 7 對組成簽章重複**（`herb_zh|dose_g` 逐味壓成簽章比對）：

| 對 | 性質 | 危險點 |
|---|---|---|
| `xie_xin_tang` == `ban_xia_xie_xin_tang` | **接錯方**（不同方） | public 卡漏掉大黃，見上 |
| `ren_shen_bai_du_san` == `bai_du_san` | **接錯方**（差一味人參，兩邊都列人參） | `ren_shen_bai_du_san` public+★，`actions_zh = ["氣與,風-寒-濕邪與於","氣與","於與"]`；乾淨的功效在**非 public 的** `bai_du_san` 上 |
| `gui_zhi_fu_ling_wan` == `fu_ling_wan` | 接錯方（batch 2 F-32） | 已記錄 |
| `shen_qi_wan` == `jin_gui_shen_qi_wan` | 同方兩筆（batch 2 F-41） | 已記錄 |
| `shi_pi_san` == `shi_pi_yin`（僅差炮薑/`Pao Jiang`，簽章不同但逐欄同源） | 同方兩筆 | 兩筆的 `exam_star` 一 0 一 1 |
| `xi_jiao_di_huang_tang` == `xi_jiao_di_huang_wan` | 同方兩筆（湯/丸） | 丸那筆 `review_status: "skeleton"` 卻 `on_board_list: true` `exam_star: 1` |
| `yu_nv_jian` == `yu_nu_jian` | **同方兩個 id 拼法**（nv / nu） | `yu_nv_jian` public+功效乾淨但 star 0 board false；`yu_nu_jian` board true star 1 但 `actions_zh` 是 38 條 CloudTCM 全文 |
| `ling_jiao_gou_teng_tang` == `ling_jiao_gou_teng_yin` | 同方兩筆，且 `_yin` 的 `name_zh` 寫「羚角鉤藤**丸**」 | `_yin` 是 skeleton＋board true＋star 1，`actions_zh` 是佔位符（見 F-48） |

**紅線 1（id 即外鍵）**：`yu_nv_jian` / `yu_nu_jian` 是同一個方的兩個 id，病歷掛哪一個都合法，
統計會分裂。**這需要 Ting 裁定，不能機械合併。**

**重現**：把每筆 `composition` 壓成 `herb_zh|dose_g` 逐味簽章，找重複。
batch 2 記「全庫只有兩組」，本批重掃得 **7 組**——差異可能是併行 session 落地所致，
但無論如何**這個檢查必須固化成 `scripts/`**（FB-20 仍 OPEN），靠人眼是撞見的。

---

### F-48 佔位符功效「<方名>：清熱解表、調理氣血」與方性相反 — **CLINICAL**

```
formula.huang_tu_tang.actions_zh       = [":黃土湯：清熱解表、調理氣血", "黃土湯：清熱解表、調理氣血"]
formula.ling_jiao_gou_teng_yin.actions_zh = [":本方：清熱解表、調理氣血", "本方：清熱解表、調理氣血"]
```

- **黃土湯**是溫陽健脾、養血止血方（灶心土君、附子臣），**不是解表方**；
- **羚角鉤藤湯**是涼肝息風方，也不是解表方；
- batch 2 F-45 記過 `su_he_xiang_wan.correction_note` 寫著「`actions_zh` 原誤作
  **清熱解表、調理氣血**，已依課件更正」——所以這是**同一支腳本的同一個預設字串**，
  當時只改了一張卡。

兩筆都帶前導 `:`，且同一句出現兩次（一次帶冒號、一次不帶），與 batch 2 F-33 定喘湯的
`":組成及藥物分析"` 是同一個解析器指紋。

**重現**：`actions_zh` 或 `actions_en` 任一條含 `清熱解表、調理氣血` → 全庫 **2 筆**。

---

### F-49 record 層的 `actions_zh` 亂碼，落在 `public_safe: true` 的卡上 — **SAFETY/CLINICAL**

batch 2 F-34 記過參附湯／實脾飲兩筆（已下架）。本批發現這一族**還有 20 筆**，
而且**多數仍是 public**。§1 區塊 5「功效」是必填區塊，卡片上印的就是這些字。

判準（機械可重現）：`actions_zh` 任一條符合下列之一 ——
以 `:`／`：`／`-` 開頭；含 `，於，`／`，與，` 這種孤立連接詞；以 `於`／`與` 起訖；
長度 ≤3 且含 `於與/，`；含中文-斜線-中文片段。

**全庫 22 卡 / 83 條**，本批命中 6 卡。全部 22 卡：

```
cang_er_zi_san* ren_shen_bai_du_san* liu_yi_san* zeng_ye_cheng_qi_tang* run_chang_wan*
ji_chuan_jian* chai_hu_gui_zhi_tang* shen_fu_tang tao_hong_si_wu_tang shou_tai_wan*
gua_lou_xie_bai_ban_xia_tang* ju_pi_zhu_ru_tang* shi_pi_yin ling_gui_zhu_gan_tang*
bei_mu_gua_lou_san ding_chuan_tang gu_chong_tang huang_tu_tang xuan_fu_dai_zhe_tang
yu_nu_jian du_qi_wan ling_jiao_gou_teng_yin
                                    （* = 目前 public_safe: true，共 11 筆）
```

**最刺眼的四條原文**（全部 public）：

| 卡 | `actions_zh` 原文 | 對應 `actions_en` |
|---|---|---|
| **壽胎丸** | `["補益腎，補血養血與", "肝/腎與"]` | Tonifies Kidneys, secures root, nourishes Blood and secures fetus / Augments Liver-Kidney Essence for restless fetus and habitual miscarriage |
| **蒼耳子散** | `["風與", "止與緩解"]` | Dispels Wind and unblocks the nasal passages / Stops nasal discharge and relieves headache |
| **增液承氣湯** | `["滋陰養陰，熱與", "於與於陽於熱"]` | Nourishes Yin, generates fluids, purges Heat and unblocks bowels / Increases fluids to moisten dryness and drain Yangming Heat accumulation |
| **潤腸丸** | `["於於，補血養血與陰", "於血,氣與軟堅"]` | Moistens Intestines, unblocks bowel movements, nourishes Blood and Yin / Invigorates Blood, moves Qi and softens dry constipation |

`"肝/腎與"` 是四個字元、`"風與"` 是兩個字元。**這些卡沒有乾淨的正本可以鏡射**
（不像 batch 1 F-07 的 `english_exam_track` 殘骸，record 層還有好的）——
唯一完整的內容在 `actions_en`。

---

### F-50 `public_safe: true` 而安全欄四個全部沒有任何字串：17 筆 — **SAFETY／治理（止血候選）**

判準：`public_safe === true` ∧ `composition` 非空 ∧
`contraindications_zh + contraindications_en + cautions_zh + cautions_en` 的非空字串總數 **= 0**。

**全庫 17 筆**（本批讀了 7 筆，標 ✔）：

| id | 卡 | 味數 | 慎用藥 | `actions_zh` 可讀？ |
|---|---|---|---|---|
| ✔ `shou_tai_wan` | 壽胎丸 | 4 | —（**孕期安胎方**） | **否**（F-49） |
| ✔ `cang_er_zi_san` | 蒼耳子散 | 4 | 蒼耳子（肝毒性） | **否**（F-49） |
| ✔ `run_chang_wan` | 潤腸丸 | 5 | **桃仁** | **否**（F-49） |
| ✔ `zeng_ye_cheng_qi_tang` | 增液承氣湯 | 5 | **大黃＋芒硝** | **否**（F-49） |
| ✔ `you_gui_yin` | 右歸飲 | 8 | **制附子** | 是 |
| ✔ `chai_hu_gui_zhi_tang` | 柴胡桂枝湯 | 9 | —（小柴胡湯合方） | **否**（F-49） |
| ✔ `qing_wen_bai_du_yin` | 清瘟敗毒飲 | 14 | —（石膏 60-120g） | 是 |
| `xiang_su_san` | 香蘇散 | 4 | — | 是 |
| `liu_yi_san` | 六一散 | 2 | — | **否**（F-49） |
| `ling_gui_zhu_gan_tang` | 苓桂朮甘湯 | 4 | — | **否**（F-49） |
| `gua_lou_xie_bai_ban_xia_tang` | 瓜蔞薤白半夏湯 | 4 | 半夏 | **否**（F-49） |
| `san_zi_yang_qin_tang` | 三子養親湯 | 3 | — | 是 |
| `ju_pi_zhu_ru_tang` | 橘皮竹茹湯 | 6 | — | **否**（F-49） |
| `ji_chuan_jian` | 濟川煎 | 6 | — | **否**（F-49） |
| `zuo_gui_yin` | 左歸飲 | 6 | — | 是 |
| `dang_gui_liu_huang_tang` | 當歸六黃湯 | 9 | — | 是 |
| `xiang_sha_liu_jun_zi_tang` | 香砂六君子湯 | 9 | — | 是 |

**其中同時「含慎用藥」的 5 筆**（`run_chang_wan` `zeng_ye_cheng_qi_tang` `you_gui_yin`
`cang_er_zi_san` `tong_qiao_huo_xue_tang`，後者非 public 但同樣零安全欄）
與 batch 2 已下架的 `shen_fu_tang` / `shi_pi_yin` **完全同型**：
public ＋ 慎用藥 ＋ 零禁忌欄（＋ 多數還有亂碼功效）。

**另外三筆該一起看，理由不同但同等嚴重**：

- **`shou_tai_wan`**：不含名單上的慎用藥，但**它是給孕婦的**。
  `pattern_indications_zh = ["腎虛胎動不安、胎漏下血證", "習慣性流產（滑胎）腎虛證"]`。
  一張處理妊娠出血的卡，安全欄不存在、功效欄印「肝/腎與」。
- **`chai_hu_gui_zhi_tang`**：`composition` 明寫本方是小柴胡湯＋桂枝湯合方
  （逐味 `role_reason_zh` 都寫著「來自小柴胡湯」）。batch 1 F-04 對小柴胡湯記的
  干擾素→間質性肺炎訊號，在這張合方卡上**一個字都沒有**。
  **母方的安全欄不會自動繼承到合方卡**——這是全庫沒有處理過的一類。
- **`qing_wen_bai_du_yin`**：石膏 60–120g、水牛角 30–120g 的氣血兩燔急重方，
  `review_status: "draft"`、無任何禁忌。`clinical_use_note` 裡其實寫了
  「石膏、水牛角先煎15至20分鐘…脈沉細數者劑量增至1.5至2倍」——**煎法與劑量調整寫在服法欄，不在安全欄**（判 partial）。

**建議（FB-26）**：這 17 筆全部降回 `public_safe: false`，
理由與 batch 1 對葛根湯、batch 2 對參附湯／實脾飲的裁定完全同型。**須 Ting 核可。**

---

### F-51 三種「禁用 vs 慎用」矛盾都出自同一個機制：`cautions_en` 是 `contraindications_en` 的逐字拷貝 — **SAFETY**

batch 1 F-03 記英文側（腳本把 `Use with caution` 改寫成 `Contraindicated` 沒去重）、
batch 2 F-35 記中文側（同一句英文被譯進兩個陣列，強度補得不一樣）。
本批找到**根因**：

**`contraindications_en` 與 `cautions_en` 逐字相同（同長度、`JSON.stringify` 相等）：全庫 163/224。**

也就是說 `cautions_en` 在四分之三的記錄上**不是獨立來源**，是 `contraindications_en` 的拷貝。
所以：

1. 中譯腳本跑兩次、把同一句英文譯進兩個中文陣列，**方向詞由譯者補、兩次補得不一樣**
   → F-35 的「禁用/慎用」矛盾是**必然產物**，不是偶發。
2. 任何「取 `cautions` 為較弱、`contraindications` 為較強」的渲染或篩選邏輯，
   在這 163 筆上是**在同一份資料上假裝有兩級強度**。

**本批的新實例**：

| 卡 | 英文原句 | `contraindications_zh` | `cautions_zh` |
|---|---|---|---|
| **葦莖湯** | `"Pregnancy."` | 孕婦**禁**用 | 孕婦**慎**用 |
| **麻子仁丸** | `"Contraindicated during pregnancy."` | `[0]` 孕婦**禁**用 **＋ `[3]`「…孕婦慎用」** | 孕婦**禁**用 |

麻子仁丸那一筆更麻煩：**矛盾在同一個陣列內**（`contraindications_zh[0]` vs `[3]`），
`[3]` 是另一段 CloudTCM 長句「本方雖為潤腸緩下之劑，但含有攻下破滯之品，故年老體虛，
津虧血少者，不宜常服，**孕婦慎用**。」——中英長度檢查（zh 7／en 3）抓得到長度不等，
但抓不到「同一張卡對孕婦說了兩種強度」。

**還有一種英文側的新形態**（不含重複前綴，所以 batch 1 F-03 的字串搜尋抓不到）：

```
formula.dang_gui_si_ni_tang.contraindications_en[1] = "Use with caution during Spring and Summer or in warm climates."
formula.dang_gui_si_ni_tang.contraindications_en[2] = "Contraindicated for those with during Spring and Summer or in warm climates."
```

`[2]` 是 `[1]` 被同一支腳本加上 `Contraindicated for those with ` 前綴的產物
（所以讀起來是 `for those with during Spring…`，語法壞掉），
**同一張卡對同一種情境同時說 caution 與 contraindicated**。
`"for those with for those with"` 的搜尋抓不到它，因為只出現一次。

**重現**：`/Contraindicated for those with (during|when|if|in )/` → 這一族的補充判準。

---

### F-52 2026-08-12 的樣板句清除只清了名單上的藥，同一張卡上其他藥的同一句還在 — **QUALITY/SAFETY**

`correction_note` 帶「樣板句清除」的卡：**全庫 101 筆**，格式完全正確
（保存原文、說明理由、留空不編、憲法第三條「先搬再改」）。**做法是對的。**

但清除是**逐藥**做的，不是逐字串做的：

**101 筆中有 49 筆，同一張卡上另一味藥仍逐字帶著「健脾和中，調和諸藥。」／
「和中健脾，調和諸藥。」——共 111 列。**

本批直接讀到的實例：

| 卡 | 已清 | **仍留著** |
|---|---|---|
| `run_chang_wan` | 桃仁 | **麻子仁（君藥）** |
| `cang_er_zi_san` | 蒼耳子、白芷、薄荷 | **辛夷（臣藥）** |
| `chuan_xiong_cha_tiao_san` | （見 note） | **荊芥** |
| `bu_yang_huan_wu_tang` | （見 note） | **桃仁、紅花** ← 慎用藥本身 |
| `ma_zi_ren_wan` | 枳實 | 杏仁、(蜂蜜) |
| `ba_zheng_san` | （見 note） | **萹蓄、制大黃** ← 慎用藥本身 |
| `an_gong_niu_huang_wan` / `zi_xue_dan` | （見 note） | **麝香**（batch 2 F-27 已點名） |
| `tao_he_cheng_qi_tang` / `ge_xia_zhu_yu_tang` / `shen_tong_zhu_yu_tang` / `fu_yuan_huo_xue_tang` | （見 note） | **桃仁、紅花** |

也就是說 **batch 1 F-08 與 batch 2 F-27 點名的慎用藥樣板句，有一部分至今仍在**，
而卡片上已經掛著一張「本卡樣板句已清除」的 `correction_note`——
**看 note 會以為處理完了。**

**現況數字**（重掃）：
- 「健脾和中，調和諸藥。」／「和中健脾，調和諸藥。」仍在：**191 列 / 58 卡**
  （batch 1 記 259 列 / 125 卡，故已清約 68 列 / 67 卡）。
- 其中落在慎用藥列上的：見 §3 矩陣。

**另有第二個樣板家族，完全沒被清除過**：

**`in_formula_zh` 逐字等於「緩急止痛。」而該味不是甘草也不是芍藥：全庫 28 列 / 22 卡。**
「緩急止痛」是甘草／芍藥的功效。本批命中：

```
chuan_xiong_cha_tiao_san  白芷 · 羌活 · 細辛   ← 三味不同的藥，同一句
dang_gui_si_ni_tang       細辛                ← 細辛在本方的理由是溫經散寒，不是緩急止痛
xiao_huo_luo_dan          制草烏(君) · 制川烏(臣) · 沒藥
tong_qiao_huo_xue_tang    紅花
```

**安全含意與 F-08/F-27 完全相同**：制川烏、制草烏、細辛、紅花是孕期／毒性需警戒的藥，
中文卡把它們描述成「緩急止痛」的緩和藥。

**建議（FB-27）**：樣板句清除應以**字串**為判準跑全庫一次，不是以藥名清單；
並把「緩急止痛。」加進樣式。與 FB-2 / FB-12 同屬「刪除」，須 Ting 過目。

---

### F-53 英文側也有樣板句：「Tonifies Qi and harmonizes ingredients.」35 列 / 8 卡 — **CLINICAL**

前兩批都把英文匯入層當成乾淨的正本（batch 1 §3「有具名來源錨點的欄位是乾淨的」）。
本批發現英文側有**鏡像的同一個病**：

**`composition[].in_formula_en` / `actions_en` 逐字等於 `"Tonifies Qi and harmonizes ingredients."`
——全庫 35 列 / 8 卡。**

```
qing_wen_bai_du_yin(9)  tian_wang_bu_xin_dan(7)  ding_chuan_tang(6)  gu_chong_tang(5)
bei_mu_gua_lou_san(4)   huang_tu_tang(2)  tao_hong_si_wu_tang(1)  xuan_fu_dai_zhe_tang(1)
```

**清瘟敗毒飲**是最完整的樣本：14 味中 **9 味**（生地黃、牡丹皮、赤芍、玄參、黃連、黃芩、
梔子、連翹、淡竹葉）的英文功效欄都是這一句。它們沒有一味是補氣藥，
本方也不是補氣方——這是甘草／人參的描述被複製到九味清熱涼血藥上。

**黃土湯**更直接：生地黃與黃芩的 `in_formula_en` 都是這一句，而灶心土（君）的
`in_formula_en` 是 `"Assists formula in releasing exterior and harmonizing Middle Jiao."`
——灶心土是溫中止血藥，不解表。**該卡的英文側與中文側是同一個佔位符的兩種語言版本**
（中文側是 F-48 的「清熱解表、調理氣血」）。

**後果**：batch 1 F-08 / batch 2 F-27 的建議都是「中文樣板句可以清空，卡片回退顯示
既有的英文 `in_formula_en`」——**在這 8 卡上，回退顯示的英文也是錯的**。
`run_chang_wan` / `cang_er_zi_san` / `huang_tu_tang` 三張卡的 `correction_note` 都明寫
「卡片回退顯示各味既有的英文 in_formula_en」；`huang_tu_tang` 那張回退到的正是這句樣板。

**重現**：`composition[]` 中 `in_formula_en|actions_en|role_reason_en` 逐字等於該句的列。

---

### F-54 木通全庫 7 卡，馬兜鈴酸 0/7；其中一卡是「本來不該有木通」 — **SAFETY（覆蓋缺口，收尾）**

batch 1 F-04 對龍膽瀉肝湯與八正散記了木通／馬兜鈴酸缺口。本批把它掃完：

| 卡 | `herb_zh` | `dose_g` | 安全欄含 馬兜鈴／aristo／腎損 |
|---|---|---|---|
| `dao_chi_san` 導赤散 | 木通 | 3-12g | **否** |
| `long_dan_xie_gan_tang` 龍膽瀉肝湯 | 木通 | 3-9g | **否** |
| **`dang_gui_si_ni_tang` 當歸四逆湯** | 木通 | 3-9g | **否** |
| `ba_zheng_san` 八正散 | 木通 | 3-10g | **否** |
| `xiao_feng_san` 消風散 | 木通 | 1.5-6g | **否** |
| `gan_lu_xiao_du_dan` 甘露消毒丹 | 木通 | 5-12g | **否** |
| `xiao_ji_yin_zi` 小薊飲子 | 木通 | 3-15g | **否** |

→ **7/7 absent。** 加上 batch 2 F-26 的紫雪丹「(青木香)」（馬兜鈴科，英文寫著
`**Aristolochia is unsafe/obsolete.**`、中文整格空白），馬兜鈴科在全庫是
**8 張卡、0 個中文警語**。

**當歸四逆湯那一筆另有一層問題**：本方第七味的通行組成是**通草**（Medulla Tetrapanacis），
不是木通。卡上 `herb_id = herb.mu_tong`、`in_formula_zh = "清熱利尿，通經下乳。"`
（那是木通的功效），所以**整列是木通、不是誤植的名字**。
同一個 repo 裡 `san_ren_tang` 的通草是對的（`通草`），可見詞彙表分得清，是這一列填錯藥。

**這條落在 `dose_g` 之外**：不管劑量對不對，**藥選錯了**。屬 Ting-review。

---

### F-55 劑量量級檢查：本批新增 4 條數量級異常，另有兩類「丸散批量寫進湯劑欄」 — **SAFETY**

沿用 batch 2 F-25 的做法。**本 ledger 不撰寫任何更正劑量**，只引用原文並標出倍數依據。

**(a) 數量級異常**

| 卡 | 藥 | 欄位與原值 | 該藥常用日劑量 | 倍數 |
|---|---|---|---|---|
| **小活絡丹** | **制草烏（君）** | `dose_g: "180g"`、`decoction_reference_g: "180g"` | 1.5–3g | **~60–120×** |
| **小活絡丹** | **制川烏（臣）** | `dose_g: "180g"`、`decoction_reference_g: "180g"` | 1.5–3g | **~60–120×** |
| **朱砂安神丸** | **硃砂（君）** | `dose_g: "3-15g"` | 0.1–0.5g | **~30×** |
| **川芎茶調散** | 細辛 | `dose_g: "1-10g"` | 1–3g（「細辛不過錢」） | ~3.3× |
| 當歸四逆湯 | 細辛 | `dose_g: "1.5-9g"` | 1–3g | ~3× |
| 九味羌活湯 | 細辛 | `dose_g: "1-6g"` | 1–3g | 2× |

小活絡丹那兩列與 batch 2 的至寶丹雄黃 `"30g"`、蘇合香丸硃砂 `".5-60g"` 是**同一類**：
**丸散的整批藥材重量被寫進了逐日湯劑劑量欄。**
本卡自己的 `clinical_use_note` 就寫著：「本方研末為丸，以蜂蜜製成，**每次3公克**，一日二次」
——也就是說正確的服用量是每次 3 g **全方**，而組成表印的是單味 180 g。
`decoction_reference_g`（湯劑參考克數）欄位名稱本身就宣告這是可以直接煎的量。

**同型（本批新增）**：

```
formula.shou_tai_wan  菟絲子 dose_g/decoction_reference_g = "120g"（原方四兩）
formula.shou_tai_wan  桑寄生 · 續斷 · 阿膠 = "60g"（原方二兩）
                      ← 同卡 clinical_use_note 明寫「阿膠（原方用量60公克）」，
                        也就是卡片知道那是丸劑原方量，卻仍放進湯劑欄
formula.tong_qiao_huo_xue_tang  黃酒 dose_g = "250g"（且 herb_zh = "—"）
```

**(b) 機器產生的假區間**（batch 2 F-25 同族，本批新增）

- `shi_pi_san`：十三味中十味 `dose_g` 完全相同 `"4-30g"`（與 batch 2 的 `shi_pi_yin` 逐值相同）。
- `ren_shen_bai_du_san` / `bai_du_san`：十三味中十味 `"2-30g"`，黨參 `"6-90g"`。
- `bu_yang_huan_wu_tang`：桃仁與紅花皆 `"0.5-9g"`（18 倍幅），而同卡 `action_profile` 寫「桃仁 3g／紅花 3g」。
- `you_gui_yin`：熟地黃 `"6-60g"`（10 倍幅）。
- `wei_jing_tang`：蘆根 `"10-60g"`。

**(c) 單位進了克數欄**（FB-22 同族，本批新增）
`shi_pi_san` 生薑 `"5 slices"`、大棗 `"1 piece"`。

**(d) 完全沒有劑量的慎用/毒性藥列**
`cang_er_zi_san` 的君藥**蒼耳子沒有 `dose_g`、也沒有 `dose_range`**（只有
`decoction_reference_g: "9g"`）。F6 規定已整理的方每一味都要有 `dose_range`。
同卡的古方量換算也不自洽：蒼耳子「二錢五分」→9g、白芷「一兩」→9g、薄荷「5錢」→3g
——**二錢五分與一兩換算成同一個 9g，原方 4:1 的比例被壓平成 1:1**（模板特性 C：比例就是方）。
辛夷的 `classical_amount_text` 字面是 **`"half分"`**（英文字混進中文古方量欄）。

---

### F-56 做對的地方（本批新增，供照抄） — **正面**

1. **`chai_hu_jia_long_gu_mu_li_tang` 的鉛丹處理 —— 全庫最好的「有毒古方成分」樣板。**
   ```
   historical_ingredients_omitted[0].herb_zh = "鉛丹"
     .herb_id_status = "no_canon_entry — 中藥庫無此記錄，且現代不作藥用，故不建卡、不進 composition"
     .classical_amount_text = "一兩半"
     .position_in_source_zh = "《傷寒論》第107條原方 12 味中的第 5 味"
     .modern_status_zh = "現代不入藥、不調劑 —— 鉛丹主成分為四氧化三鉛（Pb3O4），有鉛毒"
     .source = 《傷寒論·辨太陽病脈證並治下》第107條 + FORMULA_4_BLOCKERS_SOL.md §1
   ```
   `correction_note` 另逐項保存了被搬離的原值（截斷的一味組成、錯層的「健脾和中」、
   欄位標籤被當成值的 `"原典份量"`、三個無來源的逐味克數），並寫明
   「《傷寒論》原文不指派君臣佐使，SOL 亦未裁定…其餘 10 味留空不編」。
   **這是 batch 1 F-24 葛根湯格式的最完整實現，建議直接寫進 `FORMULA_CARD_TEMPLATE.md` §0。**
   （唯一的洞：`contraindications_zh` 只有這一條來源說明，見 F-57。）

2. **`bu_yang_huan_wu_tang.contraindications_zh[11]` —— 全庫唯一寫到具體西藥的出血警語。**
   > 「出血風險（特別是與西藥併用時）：…如果患者正在服用抗血小板藥（如**阿司匹林**）或
   > 抗凝血劑（如**華法林**），再疊加使用強效的活血中藥，會顯著增加出血的風險，
   > 如牙齦出血、皮下瘀青、甚至內出血。這點務必告知醫師，並**密切監測凝血功能**。」

   桃仁/紅花族的「出血/抗凝」欄位，三批下來只有這一張是真正 present。
   **但它是中文獨有**（zh 12／en 8），而且 `safety_flags: []`、`herb_drug_cautions: []`
   ——所以任何機讀的安全篩選都看不到它。**內容做對了，欄位沒跟上。**

3. **`zhu_sha_an_shen_wan` 的礦物法規現況 —— 中英俱全。**
   ```
   contraindications_en[0] = "Cinnabaris Zhu Sha is no longer used appropriate substitutions must be made."
   contraindications_zh[0] = "朱砂現已不再使用，須以適當藥物替代"
   contraindications_en/zh[3] = 孩童或老年患者禁用 / [4] 不宜長期服用
   ```
   batch 2 的礦物毒藥五卡（安宮牛黃丸／紫雪丹／至寶丹／磁朱丸／蘇合香丸）
   「法規現況」只有 1/5 present。這張是第 2 個。
   （洞：同卡 `dose_g` 仍是 `3-15g`，也就是**一邊說不再使用、一邊印著 30 倍藥典的劑量**；
   且 `in_formula_zh = "清熱瀉火， **，**。"` 是 F-26 殘骸。）

4. **`chai_hu_gui_zhi_tang` 的組成層 —— 本批品質最高。**
   逐味 `role_reason_zh` 寫明「來自小柴胡湯（課件 Table92）」「本方在小柴胡湯基礎上加
   桂枝湯君臣藥對，課件列為 Add chief pair of Gui Zhi Tang」，
   劑量欄誠實標註 `"3-10g（外感）/9-15g（痹痛）— 藥材通用範圍，課件未列本方專屬劑量"`，
   `field_sources.composition` 指到 Table92,94 並註明「非本方專屬古方劑量」。
   **這正是模板特性 B/C 想要的長相。**（洞：安全欄不存在、`actions_zh` 亂碼，F-49/F-50。）

5. **`shao_yao_tang.field_sources.composition`**：
   `curriculum/herbs/方剂学汇总_extracted.md#Table178（芍藥湯 君臣佐使表，9 味核對一致）`
   ——**寫明「核對一致」與味數**，是 R2 慣例該有的樣子。

6. **FB-10 的修正是可追溯的**：`run_chang_wan` / `zeng_ye_cheng_qi_tang` /
   `cang_er_zi_san` / `chai_hu_gui_zhi_tang` / `chai_hu_jia_long_gu_mu_li_tang` 的
   `field_sources.exact_source_url` 都保存了原錯值、新值與理由。**修改可追溯，這是對的。**

---

### F-57 安全欄被來源說明佔用，長度檢查因此誤判為「有禁忌」 — **SAFETY／驗證器盲點**

```
formula.chai_hu_jia_long_gu_mu_li_tang   public_safe: true   組成含 大黃二兩
contraindications_zh = ["原方第五味為鉛丹（一兩半）。鉛丹為含鉛礦物藥，現代不入藥、不調劑，
  本方組成表只列 11 味可調劑藥材；鉛丹原文保存於本筆 historical_ingredients_omitted 欄位，
  以免原方樣貌被靜默抹去。"]
contraindications_en = [同一段的英譯]
cautions_zh / cautions_en / safety_flags = 不存在
```

這段文字**本身是模範**（F-56），但它被放在 `contraindications_zh`。後果：

- 任何「`contraindications_zh.length > 0` ⇒ 這張卡有禁忌」的檢查（含 F-50 的判準本身、
  以及 `public_safe` 的任何未來閘門）**會判定這張卡通過**。
- 卡片 §1 區塊 14「⚠️ 注意事項與禁忌」印出來的是一段組成沿革說明。
- **本方真正的禁忌（含大黃、孕期、瀉下）一條都沒有。**

這是 batch 1 F-06（療效主張佔住禁忌欄）的第三種形態：
[1] 療效主張佔位、[2] 來源說明佔位、[3] 飲食建議佔位
（`yin_chen_hao_tang.contraindications_zh[2] = "服用期間應注意飲食清淡，忌食辛辣油膩之物。"`）。

**驗證器含意**：`contraindications` 的檢查**不能只數長度**，
必須至少要求條目含方向詞（禁用／忌用／慎用／不宜／contraindicated／caution／avoid）。
見 §3 的 predicate。

---

### F-58 `herb_drug_interactions_en` 的療效主張再增 2 筆，干擾素名單增至 4 卡 — **SAFETY**

batch 1 F-06（2 筆）、batch 2 F-37（3 筆）。本批 2 筆，兩筆皆無 `field_sources`：

```
formula.you_gui_wan:
  "This formula has been shown to be effective in reversing corticosteroid-induced immune suppression."
formula.ma_zi_ren_wan:
  "This formula can eliminate constipation caused by anti-psychotic drugs."
```

`you_gui_wan` 那句與 batch 2 記的 `shen_qi_wan`（prednisone 副作用）是同一族——
**兩張腎陽虛方都在交互作用欄寫「本方可以治類固醇的副作用」**。
累計此族 **7 筆**：`liu_wei_di_huang_wan` `jia_wei_xiao_yao_san`（batch 1）、
`shen_qi_wan` `xiao_cheng_qi_tang` `da_qing_long_tang`（batch 2）、
`you_gui_wan` `ma_zi_ren_wan`（batch 3）。

**干擾素名單（派工單第 5 項）——本批擴到 4 卡**：

| 卡 | 欄位 | 原文 | 方向 |
|---|---|---|---|
| `ma_huang_tang` | `herb_drug_interactions_en` | "This formula may reduce the adverse effects of interferon in hepatitis C patients." | **效益** |
| `da_qing_long_tang` | `herb_drug_interactions_en` | "Concurrent use of this formula reduced the adverse effects of interferon in hepatitis C patients." | **效益** |
| **`shi_quan_da_bu_tang`（新）** | **`modern_research_en`** | 含 interferon（在研究欄，非交互作用欄） | **效益／研究** |
| `xiao_chai_hu_tang` | `modern_research_en` ＋ `herb_drug_interactions_en` | "Acute Pneumonitis maybe associated with interferon in combination with this formula." | **危害** |

**重現**：`/interferon/i` 掃全記錄 → 全庫 **4 筆**。
三張說「本方減輕干擾素副作用」、一張說「本方與干擾素併用可能致間質性肺炎」，
四張**互不指涉**。`shi_quan_da_bu_tang` 是 batch 2 已下架的九筆之一，
但它仍帶著這條，請 CONTENT_REQUEST §C 一併納入。

---

### F-59 君臣佐使：方名裡的那味藥不是君；一卡 11 味標「使」 — **CLINICAL（考點）**

batch 1 F-14 記了四君子湯白朮/茯苓對調、六君子湯雙君藥。本批兩條更明顯：

- **`chuan_xiong_cha_tiao_san` 川芎茶調散**：`薄荷 role_zh: 君`、`川芎 role_zh: 臣`。
  **方名第一個字就是川芎**，標準組成以川芎為君（上行頭目、祛風止痛）。
  薄荷在本方是佐（清利頭目）。這是 §1 區塊 4「卡片核心」印反的。
- **`qing_wen_bai_du_yin` 清瘟敗毒飲**：14 味中
  `石膏 君 · 知母 臣 · 甘草 佐 · 其餘 11 味全部 使`
  （水牛角、生地黃、牡丹皮、赤芍、玄參、黃連、黃芩、梔子、連翹、桔梗、淡竹葉）。
  本方是白虎湯＋犀角地黃湯＋黃連解毒湯三方合方，水牛角／生地／黃連是臣藥層。
  **F7 只規定「君藥 1–2 味」，沒有規定使藥上限，所以驗證器不擋。**
- `tiao_wei_cheng_qi_tang`：芒硝標 `佐`（標準為臣，與大黃相須為調胃承氣的核心藥對）。
- `cang_er_zi_san`：薄荷 `role_zh = "佐使"` —— **第五個值**。
  F7 寫明「角色只能是 君/臣/佐/使」，`"佐使"` 是兩個字連寫，
  逐字比對會判為未知角色，`includes` 比對則會誤判為合法。判準要寫死是**全等**。

---

### F-60 考試身分欄自我矛盾：同一張卡既是「必考首選」又「不在應試範圍」 — **QUALITY**

batch 1 F-20 記的是「`nccaom_high_yield: true` 但 `on_board_list: false`」（31 筆）。
本批看到它在同一張卡上的**逐字形態**：

```
formula.you_gui_yin:
  ncbahm_2026_official = true
  tier_zh      = "國考超高頻必考首選 ★★★★★"
  exam_rating  = "★ 2026 NCBAHM 官方大綱必考首選"
  clinical_frequency = "臨床極高頻常用處方"
  nccaom_high_yield  = true
  ——
  on_board_list = false
  exam_star     = 0
  exam_importance = "非 NCBAHM 2026 CH 考綱 Appendix C 列表方劑 —— 臨床與課程用，不在應試範圍"
```

上半段五個欄位與下半段三個欄位**逐字互相否定**，而且**只有下半段有 `field_sources`**
（指向考綱 PDF）。上半段四個最高級形容詞欄位沒有任何來源。

**重現**：`tier_zh` 含 `★★★★★` ∧ `on_board_list === false` → **全庫 10 筆**
（本批 `you_gui_yin`、`chai_hu_jia_long_gu_mu_li_tang`）。

---

### F-61 其餘同族形狀（本批數字，接續前兩批） — **QUALITY**

| 項目 | 判準 | 全庫 | 本批 |
|---|---|---|---|
| `taiwan_pharmacopeia_zh` 以 `"Yes"` 開頭 | 字串前綴 | **31** | 2（`jiu_wei_qiang_huo_tang` `chuan_xiong_cha_tiao_san`） |
| 過期 `composition_cleared_note`（組成非空） | 兩欄同時成立 | **22** | 4 |
| 過期 `needs_fill`（組成非空） | 同上 | **28** | 0 |
| `exact_source_url = /formula/99` 未修 | 字串相等 | **20**（FB-10 剩餘） | 4（`qing_wen_bai_du_yin` `you_gui_yin` `shou_tai_wan` `xiao_huo_luo_dan`） |
| `image_url` 共用同一張圖 | 含 `20230323112201303` | **58** | 10 |
| `ba_fa_zh` 存英文樣板句 | 含 `No single Ba Fa` | **96** | 8 |
| `condition_tags_zh === ["體質調理"]` | 陣列相等 | **54** | 10 |
| `review_status: "skeleton"` 但組成非空 | 兩欄同時成立 | **11** | 0（`ling_jiao_gou_teng_yin` `xi_jiao_di_huang_wan` 在 F-47 的重複對裡） |
| `_en` 陣列含中日韓字 | 正則 | **4 筆**（`ding_chuan_tang` ×2、`wu_mei_wan`、`chai_hu_jia_long_gu_mu_li_tang`） | 1 |
| `formula_song_source_zh` 剩餘值 | 分佈 | `出自汪昂《湯頭歌訣》×26` · `出自王清任《醫林改錯》×1` · `出自汪昂《湯头歌訣》×1`（簡體「头」） | — |
| 有方歌但無 `source_classic`（年代不可查） | 兩欄 | **7** | 1（`chai_hu_gui_zhi_tang`） |

**方歌補一條**：FB-5 已刪掉 10 筆年代不可能的出處，`出自汪昂《醫林改錯》` 也已消失（好）。
但**剩下的 26 筆仍無法逐首驗證**，例如 `chai_hu_gui_zhi_tang` 的
「柴胡桂枝合兩方，太陽少陽合病康。」掛「出自汪昂《湯頭歌訣》」而該卡**沒有 `source_classic`**
——年代判準（FB-5 的機械判準）在缺 `source_classic` 的 7 筆上無法運作。
`jiu_wei_qiang_huo_tang` 的 `source_classic = 《此事難知》`（元·王好古）早於 1694，年代可成立。

`ling_jiao_gou_teng_yin` 另有 **id / `name_zh` 三方不符**：
id 是 `_yin`（飲）、`name_zh` 是「羚角鉤藤**丸**」、同族的 `ling_jiao_gou_teng_tang`
`name_zh` 是「羚角鉤藤**湯**」——原方是《通俗傷寒論》的**湯**。

---

## §3 總結、LIBRARY-COMPLETE 覆蓋矩陣、下一步

### 數字（每一格都能由 `data/herbs/formulas.json` + §2 的判準重算）

| 指標 | 本批 25 筆 | 全庫 224 筆 |
|---|---|---|
| CLEAN / MINOR / DEFECT | 0 / 1 / 24 | 三批合計 0 / 2 / 84 |
| findings 條數 | 16（F-46…F-61） | — |
| 其中 SAFETY | 9（F-46, F-47, F-49, F-50, F-51, F-54, F-55, F-57, F-58） | — |
| 其中 CLINICAL | 4（F-48, F-53, F-59, ＋F-52 兼） | — |
| 其中 QUALITY | 3（F-52, F-60, F-61） | — |
| **慎用藥母體（修正後）** | 本批讀完剩餘 21 | **63**（batch1 12＋batch2 30＋batch3 21） |
| `herb_zh` 純拉丁字母（掃描盲點） | 6 卡 | **102 列 / 57 卡** |
| 組成簽章重複的方對 | 本批直接讀到 2 對 | **7 對**（batch 2 記 2 對） |
| **`public_safe: true` ∧ 安全欄零字串** | **7** | **17** |
| `public_safe: true` | 12 | **51**（已下架 9 筆後） |
| record 層 `actions_zh` 亂碼 | 6 卡 | **22 卡 / 83 條**（其中 11 卡仍 public） |
| `contraindications_en` ≡ `cautions_en` 逐字 | — | **163** |
| `contraindications` zh/en 長度不等 | 6 | **54** |
| `cautions` zh/en 長度不等 | 1 | **26** |
| 「健脾和中/和中健脾，調和諸藥。」仍在 | 6 卡 | **191 列 / 58 卡**（batch 1 記 259/125） |
| **清除 note 已掛、同卡仍有殘留** | 6 卡 | **111 列 / 49 卡**（共 101 卡有該 note） |
| **「緩急止痛。」樣板（非甘草/芍藥）** | 4 卡 | **28 列 / 22 卡**（**未曾被任何批次清除**） |
| **英文側樣板 `Tonifies Qi and harmonizes ingredients.`** | 2 卡 | **35 列 / 8 卡** |
| 木通卡（馬兜鈴酸 0 覆蓋） | 1 | **7** |
| interferon 提及 | 0 | **4**（3 效益 / 1 危害） |
| `herb_drug_interactions_en` 是療效主張 | 2 | 三批累計 **7** |
| `safety_flags` 非空 | 0/25 | **24/224** |
| `tier_zh ★★★★★` ∧ `on_board_list false` | 2 | **10** |
| `taiwan_pharmacopeia_zh` = `"Yes*"` | 2 | **31** |
| `exact_source_url = /formula/99` | 4 | **20** |
| `review_status` 分佈 | — | draft 147 / sourced_cloudtcm_record 43 / sourced_ad_record 21 / skeleton 11 / deprecated 2 |

---

## §3.1 LIBRARY-COMPLETE 慎用藥覆蓋矩陣

**母體＝全庫 63 張慎用藥卡（三批全部讀完）。** 三態定義見 §0。
batch 1 的 12 卡本來只有 F-04 的散列敘述，本節依同一判準補齊成矩陣行。

### 附子／川烏／草烏（招牌：炮製要求 · 先煎/久煎 · 劑量上限 · 孕婦禁 · 心律不整/中毒徵象）

| 卡 | 批 | 炮製/先煎 | 劑量上限 | 孕婦 | 心律/毒性徵象 | 總評 |
|---|---|---|---|---|---|---|
| 金匱腎氣丸 | 1 | absent | absent | present | absent | **partial** |
| 大黃附子湯 | 2 | absent | absent | absent | absent | **absent** |
| 溫脾湯 | 2 | absent | absent | absent | absent | **absent** |
| 烏梅丸 | 2 | partial（僅 en） | absent | present | absent | **partial** |
| 再造散 | 2 | absent | absent | absent（禁忌欄空陣列） | absent | **absent** |
| 桂枝芍藥知母湯 | 2 | partial（僅 en） | absent | absent（三欄皆空） | absent | **partial** |
| 附子理中丸 | 2 | partial（僅 en） | absent | present | absent | **partial** |
| 四逆湯（生附子） | 2 | partial（僅 `notes_zh`） | absent | absent | absent | **partial** |
| 真武湯 | 2 | absent | absent | absent | absent | **absent** |
| 參附湯 | 2 | absent | absent | absent（無安全欄） | absent | **absent** |
| 實脾飲 | 2 | partial（僅 en「moderates Fu Zi toxicity」） | absent | absent（無安全欄） | absent | **absent** |
| 腎氣丸 | 2 | absent | absent | present | absent | **partial** |
| **小活絡丹（川烏＋草烏）** | **3** | partial（僅 `in_formula_en`「Potentially toxic; processed source material only.」） | **wrong（180g × 2 味）** | present | absent | **partial** |
| **右歸丸** | **3** | absent | absent | absent | absent | **absent** |
| **右歸飲** | **3** | absent | absent | absent（**四欄不存在**） | absent | **absent** |
| **黃土湯** | **3** | absent | absent | absent（**禁忌/慎用/flags 全空**） | absent | **absent** |
| **實脾散** | **3** | absent | absent | absent | absent | **absent** |

→ **17 卡：present 0 · partial 7 · absent 10。先煎/久煎 0/17，心律不整 0/17，劑量上限 0/17（1 筆 wrong）。**

### 麻黃（招牌：心血管/高血壓/甲亢/青光眼 · 孕婦 · 運動禁藥 · MAOI/擬交感/咖啡因交互）

| 卡 | 批 | 心血管 | 孕婦 | 交互作用 | 總評 |
|---|---|---|---|---|---|
| 麻黃湯 | 1 | partial（`safety_flags` 有 hypertension/cardiac_review，但中英禁忌 15/11 不對稱） | partial（僅 zh） | **wrong-direction**（干擾素效益主張佔住交互作用欄） | **partial** |
| 小青龍湯 | 1 | absent（`safety_flags: []`） | partial（僅 zh） | absent | **partial** |
| 葛根湯 | 1 | absent | absent（禁忌欄是結構性說明） | absent | **absent** |
| 桂枝芍藥知母湯 | 2 | absent | absent | absent | **absent** |
| 防风通圣散 | 2 | absent | present | absent | **partial** |
| 定喘湯 | 2 | absent | absent | absent | **absent** |
| 麻杏石甘湯 | 2 | absent | absent | absent | **absent** |
| 陽和湯 | 2 | absent | absent | partial（「麻黃劑量不可任意增減」只在 `cautions_zh`） | **partial** |
| 大青龍湯 | 2 | absent | absent | **wrong-direction**（干擾素效益） | **absent** |

→ **9 卡：present 0 · partial 4 · absent 5。心血管 present 0/9，麻黃素交互 present 0/9，干擾素方向錯 2/9。**
（本批未新增麻黃卡；麻黃族母體已完整。）

### 大黃／芒硝（招牌：孕婦 · 哺乳 · 月經期 · 脾胃虛寒 · 久服依賴）

| 卡 | 批 | 孕婦 | 哺乳 | 月經期 | 脾胃虛寒 | 久服 | 總評 |
|---|---|---|---|---|---|---|---|
| 大黃牡丹湯 | 1 | present | absent | absent | absent | absent | **partial** |
| 桃核承氣湯 | 1 | present（但中英順序顛倒） | absent | absent | present | absent | **partial** |
| 八正散 | 1 | present | absent | absent | present | present | **partial** |
| 大柴胡湯 | 1 | **absent**（全卡無「孕」字） | absent | absent | partial | absent | **absent** |
| 大黃附子湯 | 2 | absent | absent | absent | present | absent | **partial** |
| 溫脾湯 | 2 | absent | absent | absent | absent | absent | **absent** |
| 大承氣湯 | 2 | present | absent | absent | present | present | **partial** |
| 小承氣湯 | 2 | present | **present（zh 獨有）** | absent | present | absent | **partial** |
| 涼膈散 | 2 | present（禁/慎矛盾） | absent | absent | present | present | **partial** |
| 防风通圣散 | 2 | present | absent | absent | present | absent | **partial** |
| 復元活血湯 | 2 | present | absent | absent | present | absent | **partial** |
| 紫雪丹 | 2 | present | absent | absent | absent | present | **partial** |
| 桂枝茯苓丸 | 2 | present | absent | absent | absent | present | **partial** |
| 茯苓丸 | 2 | absent | absent | absent | present | present | **partial** |
| **芍藥湯** | **3** | **absent** | absent | absent | present（虛寒久痢禁用） | absent | **partial** |
| **調胃承氣湯** | **3** | **present（中英對齊）** | absent | absent | present（體虛極慎） | absent | **partial** |
| **增液承氣湯** | **3** | absent（**四欄不存在**） | absent | absent | absent | absent | **absent** |
| **麻子仁丸** | **3** | present（但同陣列內禁/慎矛盾） | absent | absent | present | present（不宜久服） | **partial** |
| **柴胡加龍骨牡蠣湯** | **3** | absent（禁忌欄是來源說明，F-57） | absent | absent | absent | absent | **absent** |
| **十灰散** | **3** | **absent** | absent | absent | present（虛寒出血禁用） | present（血止即停） | **partial** |
| **茵陳蒿湯** | **3** | partial（en 說「Da Huang 孕期極慎」；zh 在 `cautions_zh`） | absent | absent | present | absent | **partial** |
| **大陷胸湯** | **3** | **present（中英 4/4 對齊）** | absent | absent | present（體虛禁用） | present（中病即止） | **partial** |
| **瀉心湯**（組成表接錯方，F-47） | **3** | 不可評 —— **組成表沒有大黃** | — | — | — | — | **組成不可信** |

→ **23 卡：present 0 · partial 17 · absent 3 · 不可評 1。哺乳 1/23，月經期 0/23。**

### 細辛（招牌：劑量上限「細辛不過錢」· 馬兜鈴酸現況）

| 卡 | 批 | 劑量上限警語 | 馬兜鈴酸 | 卡上 `dose_g` | 總評 |
|---|---|---|---|---|---|
| 小青龍湯 | 1 | absent | absent | `3-9g` | **absent** |
| 大黃附子湯 | 2 | absent | absent | `1-6g` | **absent** |
| 烏梅丸 | 2 | absent | absent | **`1-28g`** | **absent** |
| 再造散 | 2 | absent | absent | `3g` | **absent** |
| 獨活寄生湯 | 2 | absent | absent | `1-6g` | **absent** |
| **九味羌活湯** | **3** | absent | absent | `1-6g` | **absent** |
| **當歸四逆湯** | **3** | absent | absent | `1.5-9g` | **absent** |
| **川芎茶調散** | **3** | absent | absent | **`1-10g`** | **absent** |

→ **8 卡全 absent。劑量上限 0/8，馬兜鈴酸 0/8。**

### 木通／青木香（馬兜鈴科；招牌：馬兜鈴酸 · 關木通 vs 川木通取代 · 腎損傷）

| 卡 | 批 | 馬兜鈴酸/腎損 | `dose_g` | 總評 |
|---|---|---|---|---|
| 龍膽瀉肝湯 | 1 | absent | `3-9g` | **absent** |
| 八正散 | 1 | absent | `3-10g` | **absent** |
| 紫雪丹（青木香） | 2 | **partial**（`in_formula_en` 寫 `**Aristolochia is unsafe/obsolete.**`，中文整格空白） | — | **partial** |
| **當歸四逆湯** | **3** | absent，**且本方第七味應為通草，卡上是木通（藥選錯，F-54）** | `3-9g` | **absent＋wrong herb** |
| 導赤散 | 未讀* | absent | `3-12g` | **absent** |
| 消風散 | 未讀* | absent | `1.5-6g` | **absent** |
| 甘露消毒丹 | 未讀* | absent | `5-12g` | **absent** |
| 小薊飲子 | 未讀* | absent | `3-15g` | **absent** |

\* 這四張未經眼睛讀完，只做了機械 grep（安全欄無馬兜鈴/aristo/腎損字串）。列在此以完成矩陣，判級標註來源等級。

→ **8 卡：present 0 · partial 1 · absent 7。**

### 朱砂／雄黃（招牌：重金屬（汞/砷）· 法規現況 · 不可加熱 · 不可久服 · 劑量）

| 卡 | 批 | 重金屬字樣 | 法規現況 | 加熱/久服 | 劑量 | 總評 |
|---|---|---|---|---|---|---|
| 安宮牛黃丸 | 2 | **present**（`safety_flags` realgar_arsenic / cinnabar_mercury） | present | present | **wrong**（雄黃 1-30g） | **partial** |
| 紫雪丹 | 2 | partial（無「汞」字） | absent | present | **wrong** | **partial** |
| 至寶丹 | 2 | absent（雄黃中文寫「燥濕健脾。」） | absent | present | **wrong**（雄黃 30g） | **partial** |
| 磁朱丸 | 2 | absent（中文三欄全空） | absent | partial | **wrong**（硃砂 3-30g） | **absent** |
| 蘇合香丸 | 2 | absent（中文三欄全空） | absent | present | **wrong**（硃砂 .5-60g） | **partial** |
| **朱砂安神丸** | **3** | partial（中英都寫「不再使用/no longer used」，但無「汞」/mercury 字） | **present（中英俱全）** | present（不宜長期＋孩童老年禁用） | **wrong**（硃砂 3-15g，~30×） | **partial（本族最佳）** |

→ **6 卡：present 0 · partial 5 · absent 1。汞/砷字樣 1/6，法規現況 2/6，劑量 6/6 錯。**

### 全蠍／蜈蚣／水蛭（招牌：孕婦禁 · 過敏 · 劑量）

| 卡 | 批 | 孕婦 | 過敏 | 劑量 | 總評 |
|---|---|---|---|---|---|
| 牽正散（全蠍） | 2 | present | absent | present（zh「不超過6克」；en 點錯藥為蜈蚣，F-36） | **partial** |

→ **1 卡 partial。全庫僅此一卡有此族且組成非空（本批掃描確認）。**

### 桃仁／紅花／三稜／莪朮（招牌：孕婦禁 · 出血傾向/抗凝併用）

| 卡 | 批 | 孕婦 | 出血/抗凝 | 總評 |
|---|---|---|---|---|
| 桃紅四物湯 | 1 | partial（zh 說忌用、en 只說 requires review） | partial（en 提 anticoagulants，zh 無） | **partial** |
| 血府逐瘀湯 | 1 | present | absent | **partial** |
| 膈下逐瘀湯 | 1 | present（禁忌只此一條） | absent | **partial** |
| 身痛逐瘀湯 | 1 | present（禁忌只此一條） | absent | **partial** |
| 桃核承氣湯 | 1 | present（中英順序顛倒） | absent | **partial** |
| 復元活血湯 | 2 | present | absent | **partial** |
| 生化湯 | 2 | present | **present**（「有出血傾向或活動性出血疾病者禁用」） | **present** |
| 桂枝茯苓丸 | 2 | present | absent | **partial（組成不可信）** |
| **補陽還五湯** | **3** | present（`cautions_zh[5]`） | **present—but-zh-only**（aspirin/warfarin/監測凝血，`contraindications_zh[11]`；en 8 條沒有） | **partial（內容全庫最佳，但單語）** |
| **潤腸丸** | **3** | absent（**四欄不存在**） | absent | **absent** |
| **葦莖湯** | **3** | present（但禁/慎矛盾） | absent | **partial** |
| **通竅活血湯** | **3** | absent（**四欄不存在**） | absent | **absent** |

→ **12 卡：present 1 · partial 8 · absent 2 · 組成不可信 1。抗凝藥名 present 僅 1/12（且單語）。**

### 其他在讀卡過程中撞見、不在派工單名單但同等級的毒性藥（記錄不評級）

| 卡 | 藥 | 現況 |
|---|---|---|
| 大陷胸湯 | **甘遂**（峻下逐水，君藥） | `in_formula_zh/actions_zh/role_reason_zh` 皆為**空字串**；`in_formula_en` 有 `**Potentially toxic; strict dosing required.**`（F-26 同族） |
| 蒼耳子散 | **蒼耳子**（肝毒性，君藥） | 安全欄四個不存在；**連 `dose_g`/`dose_range` 都沒有** |
| 芍藥湯 · 實脾散 | **檳榔**（IARC Group 1） | 兩卡皆無任何說明 |
| 柴胡加龍骨牡蠣湯 | **鉛丹**（已正確移出，F-56） | **典範** |

### 三批合計的族級結論

| 族 | 卡數 | present | partial | absent | 最嚴重的單一缺口 |
|---|---|---|---|---|---|
| 附子/川烏/草烏 | 17 | **0** | 7 | 10 | 先煎/久煎 **0/17**、心律不整 **0/17** |
| 麻黃 | 9 | **0** | 4 | 5 | 心血管 **0/9**、麻黃素交互 **0/9** |
| 大黃/芒硝 | 23 | **0** | 17 | 3(+1) | 哺乳 **1/23**、月經期 **0/23** |
| 細辛 | 8 | **0** | 0 | 8 | 劑量上限 **0/8**（卡上有 1-28g、1-10g） |
| 木通/青木香 | 8 | **0** | 1 | 7 | 馬兜鈴酸 **0/8**（＋1 筆藥本身選錯） |
| 朱砂/雄黃 | 6 | **0** | 5 | 1 | 劑量 **6/6 錯**（30–300×） |
| 全蠍/蜈蚣/水蛭 | 1 | 0 | 1 | 0 | 英文點錯藥 |
| 桃仁/紅花/三稜/莪朮 | 12 | **1** | 8 | 2(+1) | 抗凝藥名 **1/12** 且單語 |
| **合計（去重後 63 卡）** | **63** | **1** | — | — | **present 只有生化湯一張** |

---

## §3.2 這個矩陣可以變成什麼驗證器 predicate（機器實際能查的部分）

矩陣的「招牌警告內容對不對」不能機器判（那需要來源），但**下列 9 條可以純機械判定**，
判準已逐條寫死，不需要任何臨床知識：

| # | predicate | 現況違反數 | 嚴重度 |
|---|---|---|---|
| **P1** | 卡有 `composition` ∧ 任一味 `herb_id` ∈ 慎用藥 slug 集合（`fu_zi chuan_wu cao_wu ma_huang da_huang mang_xiao xi_xin zhu_sha xiong_huang quan_xie wu_gong shui_zhi tao_ren hong_hua san_leng e_zhu gan_sui mu_tong cang_er_zi`）**⇒** `contraindications_zh + contraindications_en + cautions_zh + cautions_en` 非空字串總數 > 0 | **10** | **blocking** |
| **P2** | `public_safe === true` ∧ `composition` 非空 **⇒** 同上非空字串總數 > 0 | **17** | **blocking** |
| **P3** | `public_safe === true` **⇒** `actions_zh` 每一條都不符合 F-49 的亂碼判準（不以 `:`／`：`／`-` 開頭；不以 `於`／`與` 起訖；不含 `，於`／`，與` 孤立連接詞；不含中文-斜線-中文） | **11** | **blocking** |
| **P4** | `contraindications_zh` / `cautions_zh` 的每一條**必須含方向詞**（`禁用｜忌用｜忌服｜慎用｜不宜｜不可｜勿`）或英文對應（`contraindicat｜caution｜avoid｜do not｜only`）。純敘述句（來源說明、飲食建議、療效主張）不算禁忌 | 至少 3（`chai_hu_jia_long_gu_mu_li_tang` `yin_chen_hao_tang[2]`＋F-06 族 7 筆的 en 側） | **warn → blocking** |
| **P5** | 同一張卡的 `contraindications_zh ∪ cautions_zh` 中，**同一主題詞**（`孕`／`體虛`／`熱證`／`陰虛`）不得同時搭配 `禁用｜忌用` 與 `慎用` | ≥ 8（涼膈散2 · 真武湯2 · 獨活寄生湯 · 葦莖湯 · 麻子仁丸 · 至寶丹2） | **warn** |
| **P6** | `composition[].role_zh` 必須**全等**於 `君｜臣｜佐｜使` 四者之一（不是 `includes`） | ≥1（`cang_er_zi_san` 的 `"佐使"`；`chai_hu_jia_long_gu_mu_li_tang` 10 味缺值屬合法留空） | **blocking** |
| **P7** | 組成簽章（`herb_id\|dose_g` 逐味）在全庫唯一；重複即報 | **7 對** | **blocking**（FB-20） |
| **P8** | `composition[].in_formula_zh / actions_zh / role_reason_zh` 不得逐字等於樣板集合 `{健脾和中，調和諸藥。／和中健脾，調和諸藥。／緩急止痛。（非甘草非芍藥時）}`；`in_formula_en / actions_en` 不得逐字等於 `Tonifies Qi and harmonizes ingredients.`（非甘草非人參時） | 191 + 28 + 35 列 | **warn**（清空屬刪除，須 Ting） |
| **P9** | 慎用藥掃描與上述 P1 **一律以 `herb_id` 為主鍵**；若某列 `herb_id` 為空且 `herb_zh` 為純拉丁字母 ⇒ 報「無法判定是否為慎用藥」 | 102 列 / 57 卡（其中 `herb_id` 為空的 10 列才是真正不可判） | **warn** |

**P1–P3 是止血級**：它們不要求任何人寫出正確的警告文字，只要求
「含慎用藥或對外公開的卡，安全欄不得為空、功效欄不得是亂碼」。
這三條今天就可以擋，而且擋下的正好是 §3.3 的下架名單。

**P4 是這個矩陣真正的價值**：它把「有沒有禁忌」從**長度檢查**升級成**語義形狀檢查**。
沒有 P4，F-57 那種「來源說明佔住禁忌欄」的卡會永遠通過。

**矩陣裡機器判不了、必須靠來源的部分**（誠實列出）：
逐藥的「招牌警告內容」（先煎、心律不整、馬兜鈴酸、哺乳、月經期、抗凝藥名）
是否真的寫對——那要 CONTENT_REQUEST B 段的逐藥標準句先落地，
驗證器才能從「有沒有字串」升級到「有沒有正確的字串」。
在那之前，P1–P4 只能保證**不空、不亂、有方向**。

---

## §3.3 新的 `public_safe` 下架候選（不含已下架的 9 筆）

**A 級（public ＋ 慎用藥 ＋ 安全欄零字串）——與已裁定下架的參附湯/實脾飲完全同型：**

```
formula.run_chang_wan          潤腸丸（桃仁；主治產後便秘）
formula.zeng_ye_cheng_qi_tang  增液承氣湯（大黃＋芒硝）
formula.you_gui_yin            右歸飲（制附子）
formula.cang_er_zi_san         蒼耳子散（蒼耳子，肝毒性；且君藥無劑量欄）
formula.xiao_huo_luo_dan       小活絡丹（制川烏＋制草烏，dose_g 180g×2）※ 有 3 條禁忌，
                               但劑量欄是 60–120 倍，屬「有禁忌卻印致死量」
formula.xie_xin_tang           瀉心湯（組成表是半夏瀉心湯的，F-47；本方應含大黃）
```

**B 級（public ＋ 安全欄零字串，無名單上的慎用藥但臨床風險等價）：**

```
formula.shou_tai_wan           壽胎丸 —— 孕期安胎方，主治含「胎漏下血」
formula.chai_hu_gui_zhi_tang   柴胡桂枝湯 —— 小柴胡湯合方，干擾素訊號零覆蓋
formula.qing_wen_bai_du_yin    清瘟敗毒飲 —— 14 味大寒急重方，石膏 60-120g
formula.chai_hu_jia_long_gu_mu_li_tang 柴胡加龍骨牡蠣湯 —— 含大黃，禁忌欄只有一段來源說明
formula.ren_shen_bai_du_san    人參敗毒散 —— `actions_zh` 亂碼，乾淨版本在非 public 的 bai_du_san
```

**C 級（public ＋ 安全欄零字串，一般方）：**

```
formula.xiang_su_san   formula.liu_yi_san   formula.ling_gui_zhu_gan_tang
formula.gua_lou_xie_bai_ban_xia_tang   formula.san_zi_yang_qin_tang
formula.ju_pi_zhu_ru_tang   formula.ji_chuan_jian   formula.zuo_gui_yin
formula.dang_gui_liu_huang_tang   formula.xiang_sha_liu_jun_zi_tang
```

合計 **A 6 ＋ B 5 ＋ C 10 = 21 筆**（A/B 有 2 筆重疊入 C 的統計已扣除；
純以 P2 判定為 17 筆，另加 `xiao_huo_luo_dan` `xie_xin_tang` `chai_hu_jia_long_gu_mu_li_tang`
`ren_shen_bai_du_san` 四筆屬「有字串但字串不是禁忌／組成不可信」）。

**建議優先序**：A 級今天下架（判準與 batch 1/2 的裁定同型，不需新規則）；
B 級同批下架，理由寫在 §3.3；C 級可與 P2 的固化一起處理。

---

## §3.4 FB 系列（機械批次候選，接續 batch 2 的 FB-24）

| id | 內容 | 影響範圍 | 風險 | 備註 |
|---|---|---|---|---|
| **FB-25** | 把所有慎用藥掃描改成以 `herb_id` slug 為主鍵，並輸出「`herb_id` 為空且 `herb_zh` 純拉丁」的不可判列 | 102 列 / 57 卡 | 低（只讀） | **前置於所有其他安全批次**；F-46 |
| **FB-26** | §3.3 的 A＋B 共 11 筆 `public_safe` 降回 false | 11 筆 | 低（旗標翻轉）／**須 Ting 核可** | **最急**；C 級 10 筆同批或次批 |
| **FB-27** | 樣板句清除改以**字串**為判準跑全庫，並把「緩急止痛。」與英文側 `Tonifies Qi and harmonizes ingredients.` 加進樣式 | 191＋28＋35 列 | 中（屬刪除，須 Ting 過目） | **101 卡已掛清除 note，其中 49 卡仍有殘留**——現況比「還沒做」更危險，因為 note 看起來像做完了 |
| **FB-28** | 組成簽章重複偵測固化成 `scripts/`（＝ FB-20，本批把它從 2 對推到 7 對，證明非固化不可） | 7 對 | 低 | 併 P7 |
| **FB-29** | `contraindications_en ≡ cautions_en` 的 163 筆列 worklist：決定 `cautions` 是否為獨立欄位 | 163 筆 | 低（只讀） | F-51 的根因；不解決這個，禁/慎矛盾會一直生成 |
| **FB-30** | record 層 `actions_zh` 亂碼 22 卡 / 83 條 worklist（判準 §F-49） | 22 卡 | 低（只讀） | 這些卡**沒有乾淨的中文正本**，唯一完整內容在 `actions_en`，修法要 Ting 定 |
| **FB-31** | 佔位符 `<方名>：清熱解表、調理氣血` 2 筆 | 2 筆 | 低 | F-48；`su_he_xiang_wan` 的處理方式可照抄 |
| **FB-32** | 丸散批量寫進 `decoction_reference_g` 的偵測（同卡 `clinical_use_note` 含「研末為丸/為散/每次 N 公克」而 `dose_g` ≥ 60g） | 至少 4 卡（小活絡丹、壽胎丸、至寶丹、安宮牛黃丸） | 低（只讀） | 與 FB-14 共用輸出格式 |
| **FB-33** | `role_zh` 全等檢查（P6）＋「使藥數 > 3」的 warn | ≥1 blocking，`qing_wen_bai_du_yin` 11 味使藥 | 低 | 需先與 Ting 確認使藥上限要不要進 F7 |
| **FB-34** | 剩餘 20 筆 `exact_source_url = /formula/99`（FB-10 收尾） | 20 筆 | 低 | 本批 4 筆在內；需外部來源 |
| **FB-35** | `tier_zh ★★★★★` ∧ `on_board_list false` 的 10 筆列 worklist（無來源的最高級形容詞欄位 vs 有來源的考綱欄位） | 10 筆 | 低（只讀） | F-60 |

---

## §3.5 Ting-review 合併清單（三批全部未決項）

**batch 1 的 9 項（F-01 F-04 F-07 F-10 F-13 F-14 F-15b F-19 F-24）與
batch 2 的 9 項（10–18）狀態不變，以下合併去重、依「今天會不會傷人」重排。**

### 第一級 — 今天就會被病人看到

| # | 項目 | 來源 | 現況 |
|---|---|---|---|
| **T1** | **`public_safe` 閘門**：21 筆新候選（§3.3）。閘門條件建議 = P1 ∧ P2 ∧ P3 ∧ P4 | batch1 F-19 · batch2 F-31 · **batch3 F-50** | 已下架 9 筆，剩 51 筆 public，其中 17 筆安全欄零字串 |
| **T2** | **`formula.xie_xin_tang` 組成表是半夏瀉心湯的** —— 要用 `correction_note` 保存錯值後清空等課件，還是依《金匱》三味重建？（紅線 3：先搬再改） | **batch3 F-47** | public ＋ board ＋ ★，且本方應含大黃 |
| **T3** | **毒性礦物與烏頭類劑量**：雄黃 30g／硃砂 .5-60g／**制川烏＋制草烏 180g**／硃砂安神丸 3-15g。在有正確值之前，卡片上印什麼？ | batch2 F-25 · **batch3 F-55** | 6/6 礦物卡劑量錯；小活絡丹是新的最高倍數 |
| **T4** | **`formula.yu_nv_jian` / `yu_nu_jian` 是同一個方的兩個 id**（紅線 1：id 即外鍵）。哪一筆是正本？另一筆 `deprecated`？ 同題：`shen_qi_wan`/`jin_gui_shen_qi_wan`、`shi_pi_san`/`shi_pi_yin`、`xi_jiao_di_huang_tang`/`_wan`、`ling_jiao_gou_teng_tang`/`_yin`、`ren_shen_bai_du_san`/`bai_du_san` | batch2 F-41 · **batch3 F-47** | **6 對同方雙記錄 ＋ 2 對接錯方** |

### 第二級 — 內容正確性，需要指定來源才能填

| # | 項目 | 來源 | 現況 |
|---|---|---|---|
| **T5** | **慎用藥覆蓋缺口**（§3.1 矩陣）。憲法第四條：**不准編**。需先指定來源（藥典？Bensky？課件？） | batch1 F-04 · batch2 F-28/29/30 · **batch3 §3.1** | **63 卡母體讀完，present 只有生化湯 1 張** |
| **T6** | **`dang_gui_si_ni_tang` 的第七味是木通還是通草？** 這不是劑量問題，是**藥選錯**。同時決定 8 張馬兜鈴科卡要不要加旗標 | **batch3 F-54** | 木通 7 卡 + 青木香 1 卡，馬兜鈴酸 0/8 |
| **T7** | **中英安全欄哪一邊為正本**：八珍湯/六君子湯/大柴胡湯/桃紅四物湯（batch1）＋ **`bu_yang_huan_wu_tang` 的抗凝警語（中文獨有、全庫唯一）** ＋ `ma_zi_ren_wan` 的驗尿條 ＋ `xiao_cheng_qi_tang` 的哺乳條 | batch1 F-01 · **batch3 F-56.2** | 54 筆長度不等；**最好的安全內容偏偏是單語的** |
| **T8** | **`cautions_*` 是不是獨立欄位**（163 筆與 `contraindications_en` 逐字相同）。若不是，禁/慎矛盾應在**產生端**修，不是在譯文修 | **batch3 F-51** | 這是 F-03 / F-35 的共同根因 |
| **T9** | **`herb_drug_interactions_en` 的 7 筆療效主張**要清空還是搬到 `modern_research_en`？（同 FB-3 的處理） | batch1 F-06 · batch2 F-37 · **batch3 F-58** | 累計 7 筆 |
| **T10** | **干擾素 4 卡**（3 效益 / 1 危害 / 互不指涉）要怎麼統一。`shi_quan_da_bu_tang` 為新增 | batch2 F-30 · **batch3 F-58** | CONTENT_REQUEST §C |
| **T11** | **君臣佐使**：四君子湯白朮/茯苓對調、六君子湯雙君藥（batch1）＋ **川芎茶調散薄荷為君**、**清瘟敗毒飲 11 味使藥**、蘇合香丸 4 味君藥（batch2） | batch1 F-14 · batch2 F-45.4 · **batch3 F-59** | F7 無使藥上限、無 `role_zh` 全等檢查 |
| **T12** | **`dose_g` 的定義**：是「這個方的量」還是「這味藥的常用範圍」？現在兩種混在一起，且丸散批量也進了同一欄 | batch1 F-13 · batch2 F-25 · **batch3 F-55** | `shi_pi_san` 十味同值、`ren_shen_bai_du_san` 十味同值 |

### 第三級 — 結構與治理

| # | 項目 | 來源 | 現況 |
|---|---|---|---|
| **T13** | **渲染層讀 record 層還是 `english_exam_track`**（決定假中文修哪一邊） | batch1 F-07 | 未決；本批 F-49 的 22 卡在 **record 層**，沒有乾淨正本 |
| **T14** | **樣板句清除的完成定義**：現行 `correction_note` 的做法正確，但清除以藥名清單為判準，49 卡漏清。要不要改成字串判準重跑？ | **batch3 F-52** | 101 卡有 note、49 卡仍殘留、111 列 |
| **T15** | **英文側樣板句**（35 列 / 8 卡）：中文清空後「回退顯示英文」的策略在這 8 卡上會顯示錯的英文 | **batch3 F-53** | 直接推翻 F-08/F-27 的建議前提 |
| **T16** | **`actions_zh` 逐詞查表**（麻黃湯「清瀉肺熱」等 4 條） | batch1 F-10 | 未決 |
| **T17** | **無來源藥理**（桑菊飲、麻杏石甘湯 ACE2、**補陽還五湯**）要整段標 unsourced 還是移出渲染 | batch1 F-15b · batch2 F-44 · **batch3 F-56.2** | 未決 |
| **T18** | **半夏＋烏頭類十八反**：全庫無機讀欄位承接配伍禁忌。本批新增 `chai_hu_gui_zhi_tang`（半夏，且 public）、`gua_lou_xie_bai_ban_xia_tang`（半夏，public） | batch2 §18 | schema 變更，須先過 BLUEPRINT |
| **T19** | **`correction_note` 格式寫進 `FORMULA_CARD_TEMPLATE.md` §0**：葛根湯（batch1 F-24）→ 烏梅丸（batch2 F-45.4）→ **柴胡加龍骨牡蠣湯的 `historical_ingredients_omitted`（batch3 F-56.1）** 是三次演進，第三版最完整 | batch1 #9 · **batch3 F-56.1** | 建議直接定案 |
| **T20** | **安全欄不得被非禁忌內容佔用**（P4）。三種形態：療效主張、來源說明、飲食建議 | batch1 F-06 · **batch3 F-57** | 影響所有既有的長度檢查 |
| **T21** | 其餘沿用未決：`treats_zh`/`modern_applications_zh` 二選一（FB-4/FB-18）、`ba_fa_zh` 96 筆英文（FB-12）、`taiwan_pharmacopeia_zh "Yes"` 31 筆（FB-13/23/`本批 F-61`）、`for those with for those with` 20 條（FB-2）、方歌逐首比對 26 筆 | batch1/2 | 未決 |

---

## §3.6 建議的下一個動作

1. **FB-26 止血**：§3.3 A＋B 共 11 筆 `public_safe` 降回 false。
   判準與 batch 1（葛根湯）、batch 2（參附湯/實脾飲）的既有裁定**完全同型**，
   不需要任何新規則，也不需要任何新內容。其中 `shou_tai_wan`（孕期安胎方，
   零禁忌欄＋亂碼功效）與 `xie_xin_tang`（組成表是別的方的）最急。
2. **把 P1 / P2 / P3 固化成 `scripts/`**（三條 blocking predicate）。
   它們不要求任何人寫出正確的警告文字，只要求「含慎用藥或對外公開的卡，
   安全欄不得為空、功效欄不得是亂碼」。這三條擋下的正好是第 1 項的名單，
   固化之後這一類就不會再靠人眼撞見。
3. **FB-25 先跑**：慎用藥掃描全面改用 `herb_id`。
   本批證明中文子字串掃描會漏掉川烏＋草烏同方與硃砂為君兩張卡；
   F-47 進一步證明**組成表接錯方的卡連 `herb_id` 都救不了**，
   所以 FB-28（組成簽章重複偵測，＝ FB-20）必須同批做，否則母體數字永遠不可信。
4. **FB-27 重跑樣板句清除（改字串判準）**：現況是 101 張卡掛著「已清除」的 note、
   其中 49 張仍有殘留，**這比沒清更危險**——包括補陽還五湯的桃仁與紅花、
   八正散的制大黃、安宮牛黃丸的麝香這些慎用藥列。
5. **慎用藥母體已歸零**：§3.1 是 LIBRARY-COMPLETE 的矩陣，可以直接補進
   `CONTENT_REQUEST_FORMULA_CAUTION_HERB_COVERAGE.md` 的 B 段。
   B 段優先序建議在 batch 2 的基礎上調整為：
   **(1) 朱砂/雄黃/烏頭類劑量**（6+2 卡，唯一「照著做會出事」的一族，
   本批新增小活絡丹 180g×2）→ **(2) 附子先煎與心律**（17 卡，數量最大）→
   **(3) 麻黃心血管**（9 卡）→ **(4) 細辛劑量上限**（8 卡全 absent）→
   **(5) 木通/青木香馬兜鈴酸**（8 卡全 absent，且當歸四逆湯可能是選錯藥）→
   **(6) 大黃族的哺乳與月經期**（23 卡，哺乳 1/23、月經期 0/23）→
   **(7) 桃仁/紅花的抗凝**（12 卡，內容範本已存在於補陽還五湯，缺的是把它變成雙語與旗標）。
6. **第四批眼睛審查**：慎用藥母體已讀完，建議改軸——
   取 §3.3 C 級的 10 筆 public 卡 ＋ F-49 剩餘的 16 卡亂碼功效卡 ＋ F-47 七對重複裡未讀的
   `bai_du_san` `xie_xin_tang` `yu_nu_jian` `ling_jiao_gou_teng_yin` `xi_jiao_di_huang_wan`，
   把「public 卡」與「重複/接錯方卡」兩個母體也收尾。

# FORMULA_EYESON_01 — 方劑卡人眼審查（高曝光 30 方 + 1 筆補讀）

狀態：**findings ledger only.** 本輪沒有動 `data/**` 一個字元。
Branch：`codex/formula-eyeson-1`（自 `origin/codex/pattern-v2` tip `4beab0e`）
日期：2026-08-12
對象：`data/herbs/formulas.json`（224 筆 records）

---

## §0 取樣與方法

### 取樣規則（可用一行指令重現）

母體 `nccaom_high_yield === true` 共 **194/224** 筆，遠多於 30，因此依派工單的
「臨床曝光度」排序後取前 30：

```
排序鍵 = (condition_links + related_conditions + western_condition_links
          + modern_application_condition_ids 的總條數) desc
       → exam_star desc
       → 該方所含「知名警訊藥」種類數 desc（麻黃/附子/大黃/桃仁/紅花/全蠍/蜈蚣/朱砂）
       → id asc
```

第三層 tiebreak 是為了讓派工單第 5 軸（禁忌覆蓋）有足夠樣本；排名 1–24 全部由
連結數決定，25–30 才用到警訊藥數。

**外加 1 筆補讀（不計入 30）**：`formula.ge_gen_tang` —— 派工單點名它是
「升麻葛根湯-measles 接錯方」那一族的樣本，不看它等於漏掉派工單指定的檢查點。

### 這 31 筆

| # | id | 中文 | links | ★ | 警訊藥 |
|---|---|---|---|---|---|
| 1 | `formula.wen_jing_tang` | 溫經湯 | 12 | 1 | — |
| 2 | `formula.gui_pi_tang` | 歸脾湯 | 11 | 1 | — |
| 3 | `formula.liu_wei_di_huang_wan` | 六味地黃丸 | 10 | 1 | — |
| 4 | `formula.si_wu_tang` | 四物湯 | 10 | 1 | — |
| 5 | `formula.xiao_yao_san` | 逍遙散 | 10 | 1 | — |
| 6 | `formula.tao_hong_si_wu_tang` | 桃紅四物湯 | 9 | 1 | 桃仁 紅花 |
| 7 | `formula.ba_zhen_tang` | 八珍湯 | 9 | 1 | — |
| 8 | `formula.xue_fu_zhu_yu_tang` | 血府逐瘀湯 | 8 | 1 | 桃仁 紅花 |
| 9 | `formula.jia_wei_xiao_yao_san` | 加味逍遙散 | 8 | 1 | — |
| 10 | `formula.tian_wang_bu_xin_dan` | 天王補心丹 | 8 | 1 | （古方朱砂） |
| 11 | `formula.jin_gui_shen_qi_wan` | 金匱腎氣丸 | 8 | 0 | 附子 |
| 12 | `formula.bu_zhong_yi_qi_tang` | 補中益氣湯 | 7 | 1 | — |
| 13 | `formula.long_dan_xie_gan_tang` | 龍膽瀉肝湯 | 7 | 1 | （木通） |
| 14 | `formula.er_chen_tang` | 二陳湯 | 7 | 0 | — |
| 15 | `formula.ban_xia_xie_xin_tang` | 半夏瀉心湯 | 6 | 1 | — |
| 16 | `formula.liu_jun_zi_tang` | 六君子湯 | 6 | 1 | — |
| 17 | `formula.ping_wei_san` | 平胃散 | 6 | 1 | — |
| 18 | `formula.gui_zhi_tang` | 桂枝湯 | 5 | 1 | — |
| 19 | `formula.si_jun_zi_tang` | 四君子湯 | 5 | 1 | — |
| 20 | `formula.ma_huang_tang` | 麻黃湯 | 4 | 1 | 麻黃 |
| 21 | `formula.sang_ju_yin` | 桑菊飲 | 4 | 1 | — |
| 22 | `formula.xiao_chai_hu_tang` | 小柴胡湯 | 4 | 1 | — |
| 23 | `formula.yin_qiao_san` | 銀翹散 | 4 | 1 | — |
| 24 | `formula.xiao_qing_long_tang` | 小青龍湯 | 2 | 1 | 麻黃（+細辛） |
| 25 | `formula.da_huang_mu_dan_tang` | 大黃牡丹湯 | 0 | 1 | 大黃 桃仁 |
| 26 | `formula.ge_xia_zhu_yu_tang` | 膈下逐瘀湯 | 0 | 1 | 桃仁 紅花 |
| 27 | `formula.shen_tong_zhu_yu_tang` | 身痛逐瘀湯 | 0 | 1 | 桃仁 紅花 |
| 28 | `formula.tao_he_cheng_qi_tang` | 桃核承氣湯 | 0 | 1 | 大黃 桃仁 |
| 29 | `formula.ba_zheng_san` | 八正散 | 0 | 1 | 大黃（+木通） |
| 30 | `formula.da_chai_hu_tang` | 大柴胡湯 | 0 | 1 | 大黃 |
| +1 | `formula.ge_gen_tang` | 葛根湯 | 0 | 1 | 麻黃 |

差一名落選、值得下一批優先補的：大承氣湯、定喘湯、附子理中丸、涼膈散。

### 方法

每一筆從 `data/herbs/formulas.json` 整筆取出、攤平成逐欄文字後**整份逐行讀完**
（含 `composition[]` 每一味、`english_exam_track`、`chinese_depth_track`、
`field_sources`），不是抽樣、不是 grep。判準依派工單六軸。

機器掃描**只用來量化已經用眼睛確認過的問題有多廣**，不用來取代閱讀。所有數字
出自 `scripts` 之外的一次性掃描（本 ledger §3 附重現方式）。

### 保守原則

只列**能引用原文並說出為什麼錯**的項目。純風格差異不列。
派工單已備案的兩族（`herb_zh`/`name_zh` 拼音化 251 筆、逐味
「健脾和中，調和諸藥。」樣板 158 筆）**只標註本批命中的位置與它造成的臨床後果，
不重新計數**。

### 判級規則

- **DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷（安全欄不忠實／內容錯位／
  假中文佔住必填欄／劑量不合理／禁忌漏掉該藥的招牌警告）
- **MINOR** = 只有 QUALITY 級（錯字、標點、欄位形狀）
- **CLEAN** = 引不出任何一條

**DEFECT 不等於整張卡不能用。** 這 31 筆多數的英文層與 `fang_yi_zh` 是好的；
定級看的是「有沒有一條會讓 2026-09-05 之後看診的人做錯事」。

---

## §1 逐卡判定

| # | 卡 | 判定 | 一句話 |
|---|---|---|---|
| 1 | 溫經湯 | **DEFECT** | `contraindications_zh` 2 條 vs `_en` 1 條，多出來的「虛熱明顯者宜慎用」英文讀者看不到 |
| 2 | 歸脾湯 | **DEFECT** | 遠志 `herb_zh: "Zhi Yuan Zhi"` 且三個中文功效欄全空；大棗 `dose_g: 1-3g` 是「枚」被當成「克」 |
| 3 | 六味地黃丸 | **DEFECT** | 禁忌欄內文缺字（「補**牌**」「味厚**潰**膩」）；方歌掛汪昂但《小兒藥證直訣》晚於《湯頭歌訣》所收 |
| 4 | 四物湯 | **DEFECT** | 禁忌 zh 9 / en 7，逐條配對整體位移兩格；`cautions_en` 同一件事出現「慎用」與「禁用」兩個版本 |
| 5 | 逍遙散 | **DEFECT** | `english_exam_track.pattern_indications_zh` 是「與證／兼證／與兼，與骨骨蒸證」——而渲染層優先讀這一區 |
| 6 | 桃紅四物湯 | **DEFECT** | `actions_zh` = 「與血」「於血與」；`pattern_indications_zh` 塞了 18 條方義＋加減；zh 說孕婦忌用、en 只說 requires review |
| 7 | 八珍湯 | **DEFECT** | 禁忌中英三條對一條、內容完全不同，且 zh 說「脾胃**陽虛**者不適宜」與 en 的「Heat or Excess」反向 |
| 8 | 血府逐瘀湯 | **DEFECT** | 方歌出處寫「汪昂《醫林改錯》」——《醫林改錯》是王清任的書；歌訣本身漏牛膝、桃字重複 |
| 9 | 加味逍遙散 | **DEFECT** | 兩條「本方可能有效治療…」的療效敘述被放在 `contraindications_zh/en` 裡 |
| 10 | 天王補心丹 | **DEFECT** | 硃砂毒性警告只有中文；`english_exam_track.contraindications_en` 是空陣列；逐味說明提到方中沒有的黃連、黃芩、黃芪 |
| 11 | 金匱腎氣丸 | **DEFECT** | 含制附子 1–15g，全卡無附子毒性／先煎／烏頭鹼任何一字 |
| 12 | 補中益氣湯 | **DEFECT** | 主治列「蠱毒 / 蠱證」；`modern_applications_zh` 出現字面為「, ( )」的條目 |
| 13 | 龍膽瀉肝湯 | **DEFECT** | 含木通而全卡無馬兜鈴酸／關木通取代／腎損傷任何一字；當歸尾中文說「活血破瘀」與同卡方義「防苦寒傷陰」相反 |
| 14 | 二陳湯 | **DEFECT** | `english_exam_track.pattern_indications_zh[0]` 是蘇子降氣湯的證，其餘四條是「-證」；方歌有烏梅、組成沒有 |
| 15 | 半夏瀉心湯 | **DEFECT** | 現代應用整段在講甘草瀉心湯治白塞氏症，並寫「具有奇效」 |
| 16 | 六君子湯 | **DEFECT** | 藥理寫「能強烈、持久地興奮家兔子宮」，同卡現代應用卻列妊娠期咳嗽／水腫，`safety_flags` 無 pregnancy |
| 17 | 平胃散 | **DEFECT** | en[1]「Use caution during pregnancy」對到的 zh[1] 完全沒提孕婦；現代應用列「Induction of labor」 |
| 18 | 桂枝湯 | **DEFECT** | `pattern_focus_en` / `ad_syndromes_en` 是「Chest Bi 胸痺」；同卡四處舌象互相矛盾 |
| 19 | 四君子湯 | **DEFECT** | 白朮標佐、茯苓標臣（君臣佐使對調）；`actions_zh[0]` 把 Tonifies Qi 譯成「補益氣血」 |
| 20 | 麻黃湯 | **DEFECT** | 中文禁忌 15 條、英文只有 11 條，孕婦／嚴重心臟病／亡血家三條只有中文；君藥麻黃三個中文功效欄全空 |
| 21 | 桑菊飲 | **DEFECT** | 君藥桑葉中文功效寫「健脾和中，調和諸藥。」；藥理段有「連翹…對腺鼠疫耶爾森氏菌具有抑制作用」「菊花…對小鼠金銀花素致咳」 |
| 22 | 小柴胡湯 | **DEFECT** | 間質性肺炎／干擾素這條全世界最有名的安全訊號，被拆成中文一句模糊的「可能引起…肺炎」＋英文一句在別的欄位，兩邊互不指涉 |
| 23 | 銀翹散 | **DEFECT** | `actions_zh` 把衛分方寫成「清熱涼血」「涼血解毒」；10 味中 5 味的 `actions_zh` 是樣板句 |
| 24 | 小青龍湯 | **DEFECT** | 含麻黃＋細辛而 `safety_flags` 與 `herb_drug_cautions` 都是空陣列；細辛 `dose_g: 3-9g` |
| 25 | 大黃牡丹湯 | **DEFECT** | 「Ruptured appendicitis with peritonitis」同時是現代應用與禁忌；且 `public_safe: true` |
| 26 | 膈下逐瘀湯 | **DEFECT** | `exact_source_url` 指到大黃牡丹湯的 CloudTCM 頁；`review_status` 不是 draft 卻 `public_safe: true` |
| 27 | 身痛逐瘀湯 | **DEFECT** | 同上（同一組 crosswire＋public_safe），禁忌只有「孕婦禁用」一條 |
| 28 | 桃核承氣湯 | **DEFECT** | 禁忌中英**順序顛倒**（en[0] 表證未解 ↔ zh[0] 孕婦禁用），長度相同所以驗證器抓不到 |
| 29 | 八正散 | **DEFECT** | 木通為君而無馬兜鈴酸警告；禁忌 zh 8 條內部自相矛盾；方歌漏大黃、「扁蓄」與組成「萹蓄」不同字 |
| 30 | 大柴胡湯 | **DEFECT** | 含大黃、枳實而全卡無孕婦禁忌；大棗 `dose_g: "3-12pc"` 把「枚」寫進克數欄 |
| +1 | 葛根湯 | **MINOR** | **接錯方已被正確修好且誠實記錄**（見 F-24）；殘留：`public_safe: true` 但功效／主治／禁忌四欄全空且含麻黃 |

**CLEAN 0 / MINOR 1 / DEFECT 30。**

---

## §2 findings

嚴重度：**SAFETY**（會影響用藥安全判斷）／**CLINICAL**（臨床或考試內容錯誤）／
**QUALITY**（可讀性、欄位形狀、來源紀律）。

---

### F-01 中英安全欄不忠實：同一欄兩種語言講不同的事 — **SAFETY**

派工單點名的 `cond.gout` 掉「避免」那一族，在方劑線是**系統性**的。

**最強證據（八珍湯）**

| 欄位 | 內容 |
|---|---|
| `contraindications_en` | `["Contraindicated for those with Heat or Excess conditions."]` |
| `contraindications_zh` | `["感冒時不適合吃補，服用會加重感冒症狀。", "月經來潮時容易造成經血量增加。", "脾胃陽虛者，不適宜服用，應先去寒不宜補"]` |

三條中文沒有一條對應那條英文。zh[2] 說「脾胃**陽虛**者不適宜」，與 en 的
「Heat or Excess」是相反方向；而那條英文的忠實中譯其實躺在**另一個欄位**
`cautions_zh: ["熱證或實證者禁用"]`。

**同族其他實例**

- **六君子湯**：`contraindications_en` 是七項清單（high fever / Yin Deficiency Heat /
  Qi Stagnation / Body Fluid Deficiency / irritability / thirst / constipation），
  `contraindications_zh` 只有一句「本方性較溫燥，真陰虧損者忌用」——同樣地，
  英文的忠實中譯在 `cautions_zh`。
- **大柴胡湯**：en「Contraindicated for those with Spleen and Stomach Deficiencies.」
  vs zh「非實證者慎用」——內容不同，強度也不同（contraindicated ↔ 慎用）。
- **桃紅四物湯**：zh `cautions_zh: ["月經過多、出血性疾病及孕婦忌用"]`，
  en 只有 `contraindications_en: ["Pregnancy, heavy bleeding, anticoagulants,
  surgery/procedure timing, or anemia requires review"]`。中文說**孕婦忌用**，
  英文說**需要評估**。這是含桃仁＋紅花的方。

**為什麼是安全級**：卡片雙語並列，英文讀者拿到的禁忌與中文讀者拿到的不是同一份。

**建議**：不要靠翻譯補齊——先確認每條的**來源歸屬**（哪一條出自 AD、哪一條出自
CloudTCM），把不同來源的條目**分欄**而不是混在同一個陣列裡，再逐條配對。需 Ting 裁定。

---

### F-02 安全欄陣列長度／順序不對齊 — **SAFETY**

`contraindications_zh`.length ≠ `_en`.length：**全庫 52/224，本批 14/31**

```
ma_huang_tang[15/11]  si_wu_tang[9/7]      ba_zheng_san[8/5]   xiao_qing_long_tang[8/7]
xiao_chai_hu_tang[6/7] ba_zhen_tang[3/1]   gui_pi_tang[3/2]    xiao_yao_san[3/2]
yin_qiao_san[3/2]     er_chen_tang[2/1]    sang_ju_yin[2/1]    da_chai_hu_tang[2/1]
tian_wang_bu_xin_dan[2/1] wen_jing_tang[2/1]
```

`cautions_zh` vs `cautions_en`：**全庫 18/224，本批 7/31**（見 F-03）。

**更危險的變體：長度相同但索引錯位，驗證器 F4 抓不到。**

- **桃核承氣湯** — `contraindications_en = ["Contraindicated for those with Exterior
  symptoms still present.", "Contraindicated during pregnancy."]`；
  `contraindications_zh = ["孕婦忌：因本方為破血下瘀之劑，故孕婦禁用。",
  "如有外感症狀 必須先解表 表證未解者，當先解表，而後用本方。"]`
  → **順序整個顛倒**。逐索引並排渲染時，「Contraindicated for those with Exterior
  symptoms still present」旁邊印的是「孕婦…禁用」。
- **平胃散** — en[1] = "Use caution during pregnancy."；
  zh[1] = 「全方以燥濕為主，行氣為輔，然本方總以苦燥為用，惟有濕有滯者宜之，
  即吳昆所謂『惟濕土太過者能用之』」。長度 2:2 通過檢查，但 zh[1] 一個字都沒提孕婦
  （孕婦兩字被塞在 zh[0] 一長句的中段）。

**建議（FB-1，機械可做）**：先產出「長度不等」與「zh/en 首詞語義不匹配」的 worklist，
**不自動修**——安全欄的重排必須人看過。

---

### F-03 `cautions_en` 內同一件事同時是「慎用」與「禁用」 — **SAFETY**

字串 `"Contraindicated for those with for those with …"`（`for those with` 重複兩次）
**全庫 14 筆記錄、20 條**；本批 6 筆：
`si_wu_tang(1) xiao_yao_san(1) jin_gui_shen_qi_wan(1) liu_jun_zi_tang(1)
xiao_qing_long_tang(1) xiao_chai_hu_tang(4)`

**小柴胡湯**是最嚴重的：`cautions_en` 11 條，其中 [3]–[6] 是
`Use with caution for those with Liver Yang Rising / hypertension / hematemesis due
to Yin Deficiency / Yin and/or Blood Deficiency`，而 [7]–[10] 是同樣四件事被寫成
`Contraditated…`（原文：`"Contraindicated for those with for those with Liver Yang
Rising."` 等）。**同一張卡對同一種病人同時說「慎用」和「禁用」，四次。**
`cautions_zh` 只有 5 條。

成因看得出來是某支腳本把 `"Use with caution for those with X"` 改寫成
`"Contraindicated for those with " + 原句`，忘了先切掉前綴，且**沒有去重**，
所以既升級了強度又留下了語法殘骸。

**建議（FB-2，機械可做）**：這 20 條是純機械產物，可整批刪除重複條並還原強度——
但「刪除」屬於憲法要先問 Ting 的動作，請以 worklist 形式送審後執行。

---

### F-04 禁忌覆蓋：招牌警訊藥的招牌警告不在卡上 — **SAFETY（gap，不自行補內容）**

派工單第 5 軸。以下都是**引不到任何一個字**，不是寫得不好：

| 卡 | 藥 | 卡上寫了什麼 | 缺什麼 |
|---|---|---|---|
| **龍膽瀉肝湯** | 木通（`Caul. Akebiae`，君） | `safety_flags: [cold_digestive_weakness, liver_disease_review, pregnancy_review, medication_review]`；禁忌三條全是脾胃虛寒／陰虛／不宜久服 | 馬兜鈴酸、關木通 vs 川木通取代、腎損傷——**一個字都沒有**，`safety_flags` 也沒有腎 |
| **八正散** | 木通（君）＋滑石＋制大黃 | `safety_flags: []` | 同上，且連一個 flag 都沒有 |
| **金匱腎氣丸** | 制附子 `dose_g: 1-15g` | 禁忌六條：陰虛／胃腸虛弱／腹水／腹瀉／面赤／孕婦 | 附子毒性、烏頭鹼、**先煎**要求、心律不整風險 |
| **小青龍湯** | 麻黃＋細辛 | `safety_flags: []`、`herb_drug_cautions: []` | 全部。連麻黃湯有的 `hypertension_review / cardiac_review / stimulant_medication_review` 都沒有 |
| **大柴胡湯** | 大黃＋枳實 | `safety_flags: []`、禁忌一條「非實證者慎用」 | 孕婦——全卡沒有「孕」字 |
| **麻黃湯** | 麻黃 | `herb_drug_interactions_en: ["This formula may reduce the adverse effects of interferon in hepatitis C patients."]` | 麻黃素本身的交互作用（MAOI、擬交感神經藥、強心苷）一條都沒有；交互作用欄放的是一句**療效**主張 |
| **小柴胡湯** | — | `contraindications_zh[5]: "長期服用可能引起頭痛、頭暈，牙齦出血、肺炎"`（**只有中文**）；`herb_drug_interactions_en[0]: "Acute Pneumonitis maybe associated with interferon in combination with this formula."`（**只有英文**） | 兩句講的是同一件事（干擾素併用→間質性肺炎，日本 1990 年代死亡通報），卻分屬兩個欄位、兩種語言、互不指涉；`safety_flags` 無肺部或干擾素項 |

`safety_flags` 為空但有組成的記錄：**全庫 198/224**，本批 8 筆
（`xiao_qing_long_tang ge_gen_tang da_huang_mu_dan_tang da_chai_hu_tang
ge_xia_zhu_yu_tang shen_tong_zhu_yu_tang ba_zheng_san tao_he_cheng_qi_tang`）。
也就是**機器可讀的安全層在絕大多數方上是空的**。

**建議**：這是 Ting-review 項，不是機械批次。憲法第四條「劑量、毒性、孕期、藥物交互
絕不虛構」——本 ledger **沒有**替任何一張卡寫入警告，只列出缺口。

---

### F-05 「Ruptured appendicitis with peritonitis」同時是適應症與禁忌 — **SAFETY**

`formula.da_huang_mu_dan_tang`：

- `modern_applications_en[2] = "Ruptured appendicitis with peritonitis"`
  （另有 `[33] Peritonitis`、`[29] Periappendicular abscess`、`[43] Hepatic abscess`、
  `[57] Intestinal obstruction`）
- `contraindications_en[1] = "Contraindicated for those with appendicitis with peritonitis."`

同一張卡把腹膜炎同時放進「這個方治什麼」與「這個方不可以用在誰身上」。
而且這張卡 `public_safe: true`（本批只有 4 筆是 true）。

---

### F-06 治療／研究主張被放進禁忌與交互作用欄 — **SAFETY**

- **加味逍遙散** `contraindications_en[2][3]`：
  `"This formula may reduce tremors caused by antipsychotic-induced Parkinson's
  disease."` / `"This formula may be effective in treating menopausal symptoms
  induced by gonadotropin-releasing hormone agonist therapy without a negative
  effect on serum estradiol levels."`
  兩句都被忠實中譯進 `contraindications_zh[2][3]`。翻開禁忌欄看到的是兩條適應症。
  同樣兩句**也**正確地存在 `herb_drug_interactions_en` —— 也就是搬過去了但沒從
  禁忌欄拿掉。
- **四物湯 / 金匱腎氣丸 / 半夏瀉心湯**：`herb_drug_interactions_en` 與
  `modern_research_en` **內容完全相同**（全庫 5 筆，本批 3 筆）。
  四物湯的內容是 `"...reduce recovery time in penicillin induced dermatitis."` /
  `"...reduce scopolamine-induced spatial cognitive deficits."` —— 動物藥理被當成
  藥物交互作用。而 `field_sources.modern_research_en` 自己寫著「原誤列於禁忌欄，已搬移」，
  可見搬了一半。
- **六味地黃丸** `herb_drug_interactions_en[0]`：
  `"This formula has shown to induce marked improvement in patients who are
  undergoing chemotherapy."` —— 無來源的療效主張，佔住交互作用欄。

**建議（FB-3）**：`herb_drug_interactions_en === modern_research_en` 的 5 筆可機械清空
交互作用欄（內容不會流失，正本在 modern_research_en）；加味逍遙散那兩條需人工判斷
要不要保留在 interactions。

---

### F-07 假中文佔住必填欄，而且渲染層優先讀它 — **SAFETY/CLINICAL**

`english_exam_track.source_note` 自己寫著：「**渲染層優先讀本區**，清 record 層不夠。」
但這一區的中文正是壞得最徹底的。

**`english_exam_track.pattern_indications_zh` 殘骸條目：全庫 45 條**。本批命中：

| 卡 | 原文 |
|---|---|
| 逍遙散 | `["肝氣鬱滯證","肝氣鬱滯證與證","肝氣鬱滯證兼證","與證","兼證","與兼，與骨骨蒸證","蠱毒 / 蠱證"]` |
| 二陳湯 | `["上實下虛、痰流壅肺咳嗽喘逆證","-證","-證","-兼證","-證"]` |
| 半夏瀉心湯 | `["與兼與證","兼證","濕熱證","蠱毒 / 蠱證"]` |
| 小柴胡湯 | `["少陽病證","蠱毒 / 蠱證","肝氣鬱滯證兼證","，與/證"]` |
| 加味逍遙散 | `["肝氣鬱滯證兼與證","蠱毒 / 蠱證"]` |

「與證」「兼證」「，與/證」「-證」不是中文詞，是 glossary 替換把英文字換掉之後
留下的連接詞。**二陳湯那一條更嚴重**：`[0] "上實下虛、痰流壅肺咳嗽喘逆證"` 是
**蘇子降氣湯**的證，不是二陳湯的（二陳湯 record 層的
`pattern_indications_zh: ["濕痰咳嗽噁心嘔吐證","脾胃不和咳嗽痰多證"]` 是對的）。

**`english_exam_track.actions_zh`（功效，§1 區塊 5 必填）**

- 桃紅四物湯：`["與血", "於血與"]`（record 層也一樣壞）
- 天王補心丹：`["陰", "血", "補益理氣"]`（record 層是好的：滋陰養血／補心安神／清熱除煩）

一位執業者在診間打開桃紅四物湯，功效欄印的是「與血 / 於血與」。

**建議**：先確認渲染層到底讀哪一區（`app.js`），再決定是把 record 層鏡射過去還是
把壞的整區清空。**屬 Ting 裁定**（憲法第三條：不用短的覆蓋長的、不清空有內容的欄位——
但這些「內容」不是內容）。

---

### F-08 逐味中文功效與同一味的英文相反，且落在君臣藥上 — **CLINICAL/SAFETY**

派工單已備案的樣板句族（`健脾和中，調和諸藥。` / `和中健脾，調和諸藥。`），
本批命中 **15/31 筆、共 259 個 composition row（全庫 125 筆記錄）**。這裡只補一件
備案時沒說的事：**它落在關鍵藥上時，講的是與同一列英文相反的話。**

| 卡 | 藥 | `in_formula_zh` | 同一列 `in_formula_en` |
|---|---|---|---|
| 血府逐瘀湯 | 桃仁（**君**） | 和中健脾，調和諸藥。 | Breaks Blood Stasis and invigorates circulation. |
| 血府逐瘀湯 | 紅花（**臣**） | 緩急止痛。 | Invigorates Blood, dispels Stasis and relieves pain. |
| 桑菊飲 | 桑葉（**君**） | 健脾和中，調和諸藥。 | Disperses Wind-Heat, clears Lung Heat and moistens Lung Dryness. |
| 小青龍湯 | 細辛（**臣**） | 健脾和中，調和諸藥。 | Warms Lung, disperses Cold and transforms thin mucus. |
| 大黃牡丹湯 | 芒硝（**臣**） | 和中健脾，調和諸藥。 | Purges, softens hardness and moistens Dryness. |
| 桃核承氣湯 | 桃仁（**君**） | 和中健脾，調和諸藥。 | Breaks up Blood Stasis and invigorates Blood. |
| 八正散 | 制大黃 | 和中健脾，調和諸藥。（`actions_zh`） | Clears Damp-Heat through stool. |
| 逍遙散 / 加味逍遙散 | 薄荷 | 和中健脾，調和諸藥。 | Disperses constrained Liver Qi and clears mild Heat. |
| 銀翹散 | 荊芥 | 和中健脾，調和諸藥。 | Disperses Wind and releases Exterior. |
| 大柴胡湯 | 枳實 | 健脾和中，調和諸藥。 | Breaks Qi Stagnation… |

**安全含意**：桃仁、紅花、芒硝、大黃、細辛都是孕期／體虛需警戒的藥。中文卡把它們
描述成「和中健脾、調和諸藥」的緩和藥。

**同一列自相矛盾的變體**（`in_formula_zh` 對、`actions_zh` 是樣板）：
銀翹散 10 味中有 5 味如此（牛蒡子、薄荷、淡豆豉→健脾和中；連翹、淡竹葉→清熱瀉火），
桑菊飲的薄荷、膈下逐瘀湯的桃仁與紅花、平胃散的蒼朮與厚朴亦同。
**渲染層讀哪一個，決定卡片說的是對的還是錯的。**

其餘同族形狀問題（皆可機械掃出）：
- `in_formula_zh` 以「，緩解。」結尾（截斷）：**全庫 31 列 / 31 筆**，本批 6 筆
  （`ma_huang_tang sang_ju_yin tao_hong_si_wu_tang xue_fu_zhu_yu_tang
  ge_xia_zhu_yu_tang ping_wei_san`）。例：麻黃湯杏仁「化痰降逆，**緩解。**」
- 三個中文功效欄全空但有 `herb_zh`：**全庫 32 列 / 13 筆**，本批 5 筆。
  最刺眼的是 **麻黃湯的君藥麻黃**（樣板記錄本身）與**桃紅四物湯的川芎、紅花**。
- 天王補心丹 13 味中 7 味帶同一句錯的「補氣，調和諸藥。」（含生地黃、玄參、天門冬），
  另有「滲濕利水，**健旺**。」（茯苓）、「補益，健脾益氣，補益。」（人參）。

---

### F-09 `_zh` 欄位裡的英文：5792 條 — **CLINICAL**

憲法紅線 5：「`_zh` 欄位裡不准出現英文句子。」

| 欄位 | 帶英文條目的記錄數 | 英文條目數 |
|---|---|---|
| `modern_applications_zh` | 196/224 | **5792** |
| `treats_zh` | 196/224 | **5792**（與上者 197 筆完全相同，是同一份資料的第二份拷貝） |
| `contraindications_zh` | 2 | 3 |
| `cautions_zh` | 2 | 3 |

翻譯是逐條 glossary 替換做的，查不到就留英文。**問題不只是留英文，是查得到的那些
被翻壞了**：

- 玻璃殘骸（`()`、`( )`、`（妊娠期）`、開頭多一個 `-`）：**全庫 93 筆記錄 / 345 條**，本批 16 筆
- 八珍湯：`"Irritability during pregnancy"` → **`（妊娠期）`**；
  `"Metrorrhagia during pregnancy"` → **`（妊娠期）`**；
  `"Vaginal bleeding during pregnancy"` → **`（妊娠期）`**。
  三條不同的孕期狀況（其中一條是妊娠出血）全部塌成同一個字串「（妊娠期）」。
- 補中益氣湯：`"Myelitis, acute (inflammation of the spinal cord)"` → **`, ( )`**
  （字面就是一個逗號與一對括號）；`"Lin Syndrome due to Qi Deficiency (Lao Lin)"` → `( )`
- 六君子湯：`"Toxemia during pregnancy"`（子癇前症）→ `（妊娠期）`
- 六味地黃丸：`"Post-stroke sequelae"` → `-中風`（變成中風本身）；
  `"Atrophic gastritis"` → `胃炎`（掉了「萎縮性」）
- 歸脾湯：`"Aplastic anemia"` → `貧血`（掉了「再生障礙性」）；
  `"Insomnia associated with AIDS/HIV"` → `失眠 愛滋病 / 免疫功能低下`（兩個詞黏在一起）
- 四物湯：`Vascular headache` / `Neurogenic headache` / `Headache due to trauma`
  三條全部塌成 `頭痛`

**建議（FB-4）**：`treats_zh` 與 `modern_applications_zh` 197 筆完全相同——先決定
保留哪一個、另一個停止渲染，可省一半工。殘骸條目（345 條）可機械列 worklist；
**塌譯**（「（妊娠期）」「胃炎」「貧血」）必須人看，因為它們看起來是合法中文。

---

### F-10 `actions_zh` 是逐詞查表產生的，會產生與方性相反的功效 — **CLINICAL**

`actions_en[i]` → `actions_zh[i]` 的對應在全庫是**一對一固定**的，不看方：

```
"Clears Heat"        -> 清熱瀉火   ×33
"Alleviates pain"    -> 緩急止痛   ×19
"Tonifies Qi"        -> 補益氣血   ×14
"Nourishes the Blood"-> 養血       ×12
"Regulates Qi"       -> 理氣寬中   ×9
"Relieves toxicity"  -> 涼血解毒   ×7
"Pacifies the Liver" -> 平肝息風   ×2
"Clears the Lungs"   -> 清瀉肺熱   ×2
```

後果：

- **麻黃湯** `actions_zh[2] = 清瀉肺熱`（en: "Clears the Lungs"）。麻黃湯是辛溫解表方，
  同一張卡的 `contraindications_zh[4]` 就寫著「**風熱者禁用**」。功效欄說它清肺熱，
  禁忌欄說熱證不能用。（同族另一筆：麻杏石甘湯，那筆是對的。）
- **逍遙散／加味逍遙散** `actions_zh[0] = 平肝息風`（en: "Pacifies the Liver"）。
  平肝息風是天麻鉤藤飲一族的功效；逍遙散是疏肝健脾。
- **四君子湯／六君子湯** `actions_zh[0] = 補益氣血`（en: "Tonifies Qi"）。四君子湯不補血。
  這條錯誤跟著同一張卡的 `pharmacology_zh` 結論「不僅有補氣之功，而且有補血之力，
  故為補氣與雙補氣血的基礎要方」一起出現，兩邊互相加強。全庫 14 方受影響
  （含理中丸、玉屏風散、當歸補血湯、補陽還五湯）。
- **銀翹散** `actions_zh = [疏散風熱, 清熱涼血, 涼血解毒]`（en: Disperses Wind-Heat /
  Cools Heat / Relieves toxicity）。銀翹散是衛分方，三條裡兩條寫成血分。

另有 `actions_zh` 內部重複條目：全庫 15 筆（本批：八正散 `["清熱瀉火","瀉火解毒",
"利水通淋","利水通淋"]`、大黃牡丹湯 `[..."散結消腫","消腫散結"]`）。

**建議**：這一族**不能機械修**——正確譯法要看方。列 worklist 給 Ting，優先處理上面四條。

---

### F-11 內容錯位：別的方的臨床文字 — **CLINICAL**

派工單第 6 軸。除了 F-07 的二陳湯之外：

- **桂枝湯** `pattern_focus_en = ["Painful Obstruction of the Chest", "Chest Bi"]`，
  且 `ad_syndromes_en` 與之完全相同。胸痺是瓜蔞薤白劑的證。同卡
  `pattern_indications_en` 是對的（Wind-Cold / Tai Yang Zhong Feng）。
  `related_conditions` 也只掛了 `pattern.spleen_qi_deficiency`，沒有任何表證連結。
- **半夏瀉心湯** `applications_zh[2]` 整段在講**甘草瀉心湯**：
  「甘草瀉心湯方劑治尤其可改善各種自律神經失調症狀…尤其是『白塞氏綜合症』…
  治療效果很好。」`chinese_depth_track.notes_zh` 亦然：「甘草瀉心湯對於口腔潰瘍(嘴破)、
  陰部潰爛**具有奇效**。」在半夏瀉心湯的現代應用區裡推薦另一個方，並下未經限定的療效斷言。
- **天王補心丹** 逐味 `elucidation_zh` 描述的是**不存在於本方的藥**：
  柏子仁條：「天王補心丹中含有**黃連、黃芩**等清熱燥濕之品」；
  五味子條：「可與方中其他補腎藥物如**黃芪**、茯苓等相輔相成」。
  本方組成 13 味中沒有黃連、黃芩、黃芪。
- **溫經湯** `syndromes_zh` 含「**當歸四逆湯證**」；**補中益氣湯** `syndromes_zh` 含
  「**脾約證**」（麻子仁丸的方證）；四物湯含「心脾兩虛」「脾不統血」（歸脾湯的）。
  `syndromes_zh` 整欄是 CloudTCM 關鍵字關聯，不是本方證候。
- **「Gu Syndrome」→「蠱毒 / 蠱證」**：補中益氣湯、四君子湯、小柴胡湯、半夏瀉心湯、
  逍遙散、加味逍遙散的 `pattern_indications_zh` 都出現這一條。American Dragon 的
  Gu Syndrome 是現代慢性感染／腸道菌相概念，譯成古典「蠱毒（中蠱毒）」是把主治
  寫成了「中毒」。

---

### F-12 方歌：出處欄是假的，內容也被改寫 — **CLINICAL（考試內容）**

`formula_song_source_zh` 全庫只有四個值：

```
出自汪昂《湯頭歌訣》 ×35
出自汪昂《醫林改錯》 ×1     ← 《醫林改錯》是王清任的書
出自王清任《醫林改錯》 ×1   ← 同一族的正確寫法，可見 repo 知道
出自汪昂《湯头歌訣》 ×1     ← 簡體「头」
```

**年代上不可能成立的 10 筆**（汪昂 1615–約 1699；`source_classic` 是他之後或
《湯頭歌訣》未收的書）：

```
銀翹散(《溫病條辨》1798)  桑菊飲(《溫病條辨》)  血府逐瘀湯(《醫林改錯》1830)
導赤散(《小兒藥證直訣》)  龍膽瀉肝湯(《醫宗金鑑》)  四君子湯(《聖濟總錄》)
補中益氣湯(《脾胃論》)    八珍湯(《瑞竹堂經驗方》)  六味地黃丸(《小兒藥証直訣》)
歸脾湯(《濟生方》)
```

《溫病條辨》成書於 1798，《湯頭歌訣》成書於 1694 —— 一本 1694 年的書不可能收
1798 年才出現的方歌。這條可以純機械判定，不需要比對歌訣原文。

**內容本身也有可引用的損壞**（與出處問題獨立）：

- **血府逐瘀湯**：「血府逐瘀歸地**桃**，紅花川芎赤芍**桃**。柴胡枳殼桔甘草，活血化瘀胸痛消。」
  —— 「桃」在第一、二句句尾各出現一次，而**牛膝（引血下行的關鍵佐藥）完全沒出現**。
- **龍膽瀉肝湯**：末句「肝家實火濕熱消除」是**八個字**，前三句都是七字。破格即非原文。
- **葛根湯**：「葛根湯內麻黃**黃**」——「黃」重複。
- **八正散**：「八正木通與車前，**扁蓄**瞿麥滑石研。」組成用的是「**萹**蓄」（不同字），
  且歌訣裡沒有大黃，而組成有制大黃。
- **二陳湯**：「二陳湯用半夏陳，茯苓甘草薑**梅**引。」——「梅」＝烏梅，
  但 `composition` 六味裡沒有烏梅。**方歌與組成互相矛盾**（派工單第 4 軸）。
- **平胃散**：方歌寫「蒼**術**」，組成寫「炒蒼**朮**」——不同字，搜尋對不起來。
- **麻黃湯**的方歌與汪昂原文一致（「麻黃湯中用桂枝，杏仁甘草四般施，發熱惡寒頭項痛，
  喘而無汗宜服之」）。**所以出處欄不是一律錯，而是真假混在一起、外觀無法分辨** ——
  這比全錯更危險，因為背錯的人不會懷疑。

**建議（FB-5，機械可做的部分）**：把上述 10 筆的 `formula_song_source_zh`
依 §1.1 規則「不知道出處就不要填這個欄位」刪除（方歌本身保留）。
內容比對需要 Ting 或有紙本《湯頭歌訣》的人做。

---

### F-13 劑量：範圍是藥物層級的上下限，不是這個方的量 — **CLINICAL**

模板特性 C：「比例就是方。」目前 `dose_g` / `decoction_reference_g` 多數不是方的劑量。

**可引用的證據**

- **歸脾湯** `大棗 dose_g: "1-3g"` —— 來源是「1–3 **枚**」，單位被當成克。
  同一張卡的 `action_profile.groups_herbs` 寫「大棗 12g」。**同一味藥同一張卡差 4–12 倍。**
  對照：麻黃湯 `formula_family[0].change` 正確寫「大棗 4**枚**」；
  大柴胡湯 `dose_g: "3-12pc"`（把單位寫進值裡，是全庫唯二承認單位的一列）。
- **溫經湯** 麥門冬 `dose_g: "4-9g"`，但同卡 `action_profile` 寫「麥門冬 **18g**」——
  超出自己宣告的範圍一倍。
- **四物湯** 四味的 `dose_g` 上限（21 / 15 / 12 / 9）與 `action_profile` 的值
  （熟地 21g、白芍 15g、當歸 12g、川芎 6g）逐一相同，可見 `dose_g` 上限是從
  `action_profile` 機械推出來的，不是查來的。而同卡 `modifications_zh[1]` 說
  「四物湯中藥材劑量原則上是**等分**」——與 21:15:12:6 矛盾。
- **補中益氣湯** 當歸 `dose_g: "0.6-12g"`、黃耆 `"1.5-30g"`、炙甘草 `"1-15g"`。
  0.6g 是李東垣原方的「二分」，12g 是現代量；把兩套制度的端點拼成一個 20 倍寬的
  「範圍」，在診間不可用。
- **天王補心丹** 五味子 `dose_range: "18g"`（藥典常用 2–6g），
  `action_profile.total_g: 166`（丸劑）。
- **小青龍湯** 細辛 `dose_g: "3-9g"` —— 「細辛不過錢」與藥典 1–3g 的三倍，
  且該卡 `safety_flags: []`。

**反例（做對的）**：六味地黃丸 24:12:12:9:9:9（三補三瀉的經典比例）落在各自
`dose_g` 範圍內；桑菊飲 桑葉 7.5g 對得上《溫病條辨》二錢五分；葛根湯逐味帶
`classical_amount_text: 《臺灣中藥典》第四版 THP 433 官方組成（每日總服用量 28.0 公克）`
並在 `field_sources.composition` 指到頁碼——**這是本批劑量欄的正確樣板。**

單一數值（非範圍）的劑量列：全庫 172 列 / 45 筆；本批含二陳湯橘紅 `"15g"`、
半夏瀉心湯大棗 `"3g"`。

---

### F-14 君臣佐使錯 — **CLINICAL（考點）**

- **四君子湯**：`白朮 role_zh: 佐`、`茯苓 role_zh: 臣`。標準是人參君、**白朮臣、茯苓佐**、
  炙甘草使。這是模板特性 A 的示範方，也是最基礎的考題。
- **六君子湯**：`人參 role_zh: 君` **且** `陳皮 role_zh: 君`。F7 允許 1–2 味君藥所以
  驗證器不擋，但陳皮在補氣方裡不是君。
- **替代藥的角色與被替代者不同**：歸脾湯／八珍湯／四君子湯／六君子湯／補中益氣湯的
  `(黨參)` 都標 `is_alternate: true` 卻掛「臣」，而它替代的人參掛「君」。
  換藥之後方裡沒有君藥。
- **葛根湯**：`composition` 完全沒有 `role_zh` —— 但 `correction_note` 誠實寫明
  「全 repo 查無葛根湯的君臣佐使來源…不自行指派，待 Ting 指認」。**這是正確做法。**

---

### F-15 藥理段：OCR 損壞 + 無來源 + 不可能的主張 — **CLINICAL/QUALITY**

`pharmacology_zh` 在本批 12 筆有內容，**沒有任何一筆有 `field_sources.pharmacology_zh`**。
內容分兩族：

**(a) 舊 OCR 稿，逐字損壞**（模板 §0「部分缺字仍可讀的不刪，列 worklist」）

| 卡 | 原文片段 | 應為 |
|---|---|---|
| 六味地黃丸 | 「山藥」含「粘液質、澱粉**梅（去木換酉）**」 | 澱粉**酶**（編輯指示外洩到內文） |
| 六味地黃丸 | 「山茱萸**咁**等」／「腎為**先大**之本」／「對後**肚**滋補腎陰法」 | 苷／先天／後世 |
| 歸脾湯 | 「人參、黃耆、**茯爷**」「**白才**、大棗」「**白尤**、當歸」「**素亂**的神經過程」「良好**形響**」 | 茯苓／白朮／白朮／紊亂／影響 |
| 逍遙散 | 「**匹**氯化碳」「壞**處**減輕」「子宮重**最**明顯」「沖劑**沒**膏」「**司**使胃液」「高香**華**酸」 | 四／壞死／重量／浸膏／可／高香草酸 |
| 四君子湯 | 「五臟六**陰**」「**五肵**六腑」「水谷**褚**微」「面色**矮**白」「語聲低**飲**」 | 六腑／五臟／精微／㿠白／低微 |
| 小柴胡湯 | 「**黃苓**」×4 | 黃**芩**（「黃苓」是另一個字串，搜尋不到） |
| 半夏瀉心湯 | 「乾**蓋**」「血管**本**滑肌」×2 | 乾薑／平滑肌 |
| 補中益氣湯 | 「菸**檢**酸」「**膀恍**平滑肌」「降低**時香草酚**濃度」 | 菸鹼酸／膀胱／—— |
| 小青龍湯 | 「豚鼠**雕體**氣管**干**滑肌」「痙**樂**性收縮」「離體**免**耳」 | 離體／平滑／痙攣／兔耳 |
| 銀翹散 | 「多種細菌及**病苺**」「感染甲型流感**病**大鼠」 | 病毒／病毒 |
| 龍膽瀉肝湯 | 「有**明圍**的抑制作用」「乙型鏈球**齒**」 | 明顯／鏈球菌 |

**(b) 新寫的稿，看起來乾淨但內容不可能成立**

桑菊飲 `pharmacology_zh`：
> 「連翹提取物對**腺鼠疫耶爾森氏菌**具有抑制作用。」
> 「菊花提取物對小鼠**金銀花素致咳**具有止咳作用。」
> 「桑葉提取物對小鼠**氯化氨**致咳…」「桑葉提取物對大鼠**熱源性**致熱…」

鼠疫桿菌與桑菊飲無關；「金銀花素」不是致咳劑（金銀花是另一味中藥）；
「氯化氨」應為濃氨水；「熱源性」應為致熱原。這一段是生成物，不是文獻摘要，
且無 `field_sources`。加味逍遙散／平胃散的藥理段格式類似（分子路徑、TGF-β1/Smad、
5-FU 增效），同樣無來源。

平胃散那一段還含一條**未被任何安全欄承接的不良發現**：
「而正常大鼠給予平胃散後正常腸道屏障功能**有損傷**」。

**建議（FB-6）**：(a) 族純機械可列 worklist（逐字比對候選字），修正需人眼；
(b) 族屬「無來源的主張」，依 R2 慣例應**整段標記為 unsourced 或移出渲染**，需 Ting 裁定。

---

### F-16 部落格／行銷文字與未限定療效斷言 — **CLINICAL**

- **歸脾湯** `chinese_depth_track.notes_zh`：
  「歸脾湯是一個相當熱門的中藥方劑，在 Google Trend 是熱門中藥，尤其是台灣與香港地區
  最愛搜尋。原因無他，就是因為**此中藥很有效**！」
- **四物湯** `chinese_depth_track.notes_zh`：整段推介《沈氏女科600年：女人會養不會老》
  一書，並稱「會建議她們回家自行熬煮四物湯，不僅價格低廉且**療效顯著**」。
- **小柴胡湯** `applications_zh[0]`：「千年以來小柴胡湯應用非常廣泛，**可以說就是治萬病**，
  …歸納統計超過 3000 篇以上期刊論文」（無引用）。同欄 [6] 列
  「新型冠狀病毒感染（COVID-19）及其後遺症」而無證據分級。
- **半夏瀉心湯**：「具有奇效」（見 F-11）。
- **小青龍湯** `pharmacology_zh`：「**防癌效應**：小鼠致癌抑制實驗表明，本方具有較為明顯
  的抑制癌腫形成的作用。」（動物研究直接寫成療效，違反憲法第九條）

同族形狀問題：`applications_zh` 尾端殘留章節標題
（半夏瀉心湯 `[6] "現代中醫對於半夏瀉心湯的運用"`、小柴胡湯 `notes_zh` 末句
「過去千年來小柴胡湯的應用非常廣泛」）——與教訓 1 的「其他功效」標題汙染同一族。
小柴胡湯 `applications_zh` 還有分類標籤與內容黏在一起
（「惡性腫瘤及其併發症原發性肝癌」缺冒號），全段共 6 處。

---

### F-17 `&hellip;` 與標點殘骸 — **QUALITY**

- HTML entity 殘留：全庫 **1 筆**，即 `xiao_chai_hu_tang`
  （`chinese_depth_track.zhu_zhi_zh`：「熱與血結**&hellip;&hellip;**經水不當斷而斷」）。
  COND ledger F-16 修過條件線的同一族，方劑線這 1 筆漏了。
- 半夏瀉心湯 `contraindications_zh[0]` 用全形間隔號當句號：
  「…心下痞滿**．**不宜使用。」
- 四物湯 `modifications_zh[0]` 內含字面標記：「可以加人參、黃芪**〔字損〕**藥物來補氣」
- 平胃散 `contraindications_zh[0]`：「本方辛苦溫燥，易**傷止耗**陰」（安全欄內錯字）
- 六味地黃丸 `contraindications_zh[0]`：「山藥、茯苓之補**牌**助運」「熟地味厚**潰**膩」
  （安全欄內錯字 ×2）
- 血府逐瘀湯 `symptoms_zh[23..27]`：`["唇","結膜","指甲","面色","鞏膜可暗紫，並可脫髮。"]`
  —— 一句話被以「、」切成 5 條，前 4 條是沒有謂語的身體部位。
  同內容在 `clinical_manifestations_zh` 是完整一句。
- 四君子湯 `contraindications_zh[1]` 混用半形逗號：「虛熱、高熱**,**或煩躁口渴便秘並見者**,**非經加減不用」

---

### F-18 出處與識別欄位交叉汙染 — **QUALITY/來源紀律**

- **`exact_source_url` 指到別的方**：全庫 **59 筆**的 `exact_source_url` 是
  `https://cloudtcm.com/formula/99`（＝大黃牡丹湯的頁面）而自己的 `cloudtcm_id` 不是 99。
  本批 4 筆：`ge_gen_tang(id=260)`、`ge_xia_zhu_yu_tang(id=571)`、
  `shen_tong_zhu_yu_tang(id=120)`、`da_huang_mu_dan_tang(id=undefined)`。
- **同一張圖被 58 筆共用**：`image_url = zhongyifangji.com/upload/202303/20230323112201303.jpg`
  出現在 58 筆記錄上（本批 4 筆）。
- **`name_en` 存的是拼音**：全庫 9 筆，本批 **6 筆**
  （`gui_zhi_tang ma_huang_tang xiao_qing_long_tang yin_qiao_san sang_ju_yin
  long_dan_xie_gan_tang`）。真正的英文名在 `board_name_en` / `name_en_translated`。
  §1 區塊 1（標頭）因此印拼音。
- **`comparison_group` 存的是分類字串**：同樣那 6 筆，值為
  `"解表劑 / Release Exterior"`、`"清熱劑 / Clear Heat"`，與 `category` 相同。
  §1 區塊 11「類方鑑別」因此把整個分類當成鑑別群組。其他卡用的是
  `liver_spleen` / `blood_stasis` 這種 slug。
- **`ba_fa_zh` 存英文**：全庫 96 筆，本批 8 筆，值為
  `"No single Ba Fa assigned mechanically; use the formula-specific actions/pattern
  and course chapter framing."` —— `_zh` 欄位裡的英文樣板句（紅線 5 + 紅線 6 雙違）。
- **`taiwan_pharmacopeia_zh` 存 "Yes"**：全庫 31 筆，本批 7 筆
  （其他卡是 `"No. 10"`、`"No. 159 (THP p.134)"`）。
- **`course_level_en` 存查無訊息**：大黃牡丹湯
  `"Not found in the uploaded Formulations 1/2 master knowledge-level lists."`
- **`condition_tags_zh` 是通用佔位**：大黃牡丹湯與葛根湯都是 `["體質調理"]` /
  `["Constitutional Regulation"]`，與方無關（一個是急性腸癰方，一個是解表方）。
- **relation id 拼錯**：桂枝湯 `key_pairs[1] = "pair.sheng_jiang__da_zhao"`，
  `key_pairs_note_en` 亦寫 `"Sheng Jiang with Da Zhao"`；麻黃湯
  `formula_family[0].change_en` 寫 `"Da Zhao 4 pieces"`。大棗是 **Da Zao**。
  紅線 1：id 拼錯＝外鍵斷。
- **膈下逐瘀湯 `composition_cleared_note`** 仍寫「原本的組成是方名去掉劑型後綴，
  並非真實藥材」，但該卡 `composition` 現有 12 味真實藥材——註記已過期，與現況矛盾。

---

### F-19 `review_status` / `public_safe` 越過草稿閘門 — **SAFETY/治理**

憲法第三部分：「新內容：`review_status:"draft"`，Ting 在 app 裡審。」
`review_status` AI 只能寫 `"draft"`。

實際分佈：
```
draft 147 | sourced_cloudtcm_record 43 | sourced_ad_record 21 | skeleton 11 | deprecated 2
```
**64 筆的 `review_status` 存的是來源型別，不是狀態。** 本批命中 3 筆
（大黃牡丹湯、膈下逐瘀湯、身痛逐瘀湯），而這 3 筆同時 `public_safe: true`。

`public_safe: true` 全庫 **60 筆**；本批 4 筆
（`da_huang_mu_dan_tang ge_xia_zhu_yu_tang shen_tong_zhu_yu_tang ge_gen_tang`）。
其中：

- **大黃牡丹湯**：public，且把腹膜炎列為適應症（F-05）
- **葛根湯**：public，`actions_zh` / `actions_en` / `pattern_indications_zh` /
  `pattern_indications_en` / `pattern_focus_en` **全部是空陣列**，
  `contraindications_zh/en` 是「待補來源」的結構性說明，而本方含麻黃。
  一張沒有功效、沒有主治、沒有禁忌的含麻黃卡被標記為可公開。

**建議**：`public_safe` 的閘門條件應該至少要求
（有 `actions_zh` ∧ 有 `contraindications_zh` ∧ `review_status === "draft"` 以外的
 Ting 核可狀態）。屬 Ting 裁定 + 可能要動 `scripts/`（非本線可寫）。

---

### F-20 高頻旗標互相矛盾 — **QUALITY**

`nccaom_high_yield === true` 但 `on_board_list === false`：全庫 **31 筆**，
本批 2 筆（`jin_gui_shen_qi_wan`、`er_chen_tang`）。這兩筆的 `exam_importance` 寫著
「**非** NCBAHM 2026 CH 考綱 Appendix C 列表方劑 —— 臨床與課程用，不在應試範圍」、
`exam_star: 0`，卻同時 `nccaom_high_yield: true`。以 high_yield 篩選複習清單的人
會拿到 31 個不在考綱上的方。

另有無來源的最高級形容詞欄位：`tier_zh: "國考超高頻必考首選 ★★★★★"`、
`clinical_frequency: "臨床極高頻常用處方"`（本批 4 筆），`field_sources` 無對應項。

---

### F-21 §1 必填區塊的空洞 — **QUALITY（覆蓋率，非缺陷）**

| 區塊 | 本批狀況 |
|---|---|
| 9 方義 `chinese_depth_track.fang_yi_zh` | 31 筆中 **19 筆為空**（含麻黃湯、桂枝湯、血府逐瘀湯、天王補心丹、金匱腎氣丸、八珍湯、桃紅四物湯） |
| 10 方劑家族 `formula_family` | 31 筆中 **2 筆有值**（桂枝湯 4 條、麻黃湯 1 條）。龍膽瀉肝湯有 1 條但**指向自己**（`formula_id: formula.long_dan_xie_gan_tang`、`relation: 同類`、`change: ["原方結構"]`）——通過 F11 但不帶任何資訊，且 §6 要求 `change` 必須寫劑量 |
| 12 現代應用 `applications_zh` | 多數卡靠 `modern_applications_zh`（CloudTCM/AD 關鍵字表）撐場，而模板 §7 明講「不要拿它當現代應用」 |

---

### F-22 舌脈：同一張卡四個版本 — **CLINICAL**

- **桂枝湯**：`tongue_zh: "正常"`／`tongue_en: "Pale-red tongue with a thin, white,
  moist coating"`／`coating_zh: "白潤"`／`indications[0].tongue_zh: "苔薄白"`／
  `glance.plain_indications_zh[3]: "苔薄白脈浮緩"`。record 層說舌象正常，
  其他三處說薄白潤。
- **麻黃湯**：`tongue_zh: "粉紅"` vs `indications[0].tongue_zh: "苔薄白"`；
  且 `tongue_en` / `pulse_en` 在這筆是**陣列** `["T: thin, white coating"]`
  （保留了課件表格的欄位前綴 `T: `），而其他卡是字串。
  同欄位跨記錄型別不一致＝教訓 9 的董氏奇穴當機模式。
- 舌脈欄形狀共有三種：`tongue_zh` 單獨、`tongue_zh` + `coating_zh` 分離、
  以及補中益氣湯的 `tongue_zh: "舌淡;苔薄白"`（合併在一格）。

---

### F-23 內部矛盾的加減 — **CLINICAL**

**桂枝湯**同一張卡對「汗出過多」給了兩個不同答案：
- `modifications_zh[2]`：「汗出過多不止 → 重用白芍，加**威靈仙**」
- `formula_family[3]`：「桂枝加**附子**湯 … 發汗太過，漏汗不止、惡風、小便難、四肢微急」

威靈仙止汗非標準配伍，需查證來源；兩區至少要一致。

---

### F-24 做對的地方（供後續批次照抄） — **正面**

派工單點名的「升麻葛根湯-measles 接錯方」在 `formula.ge_gen_tang` **已經被正確處理**，
而且處理方式是本 ledger 見過最好的：

- `correction_note` 逐項保存了被移除的原內容（組成、功效中英、主治中英、
  pattern_focus_en），並註明「正本仍完整存放於 `formula.sheng_ma_ge_gen_tang`」
  且經比對確認四句英文逐字保留——**先搬再改，順序正確**（憲法第三條）。
- 組成改依《臺灣中藥典》第四版 p.635（THP 433）官方組成與官方劑量，
  `field_sources.composition` 指到頁碼。
- 君臣佐使**不自行指派**：「全 repo 查無葛根湯的君臣佐使來源…待 Ting 指認」。
- 功效與主治**誠實留空**：「原內容既然是別的方的，就不能留在這裡…依憲法
  『查不到就留空』」。
- 禁忌四欄改成結構性說明而非捏造：「本方含麻黃。原載禁忌欄位經查證屬升麻葛根湯之
  誤植，已移除；本方禁忌待補充來源。」

其他做對的：
- **金匱腎氣丸** `cloudtcm_link_note`：「CloudTCM 頁名為「八味地黃丸」——即金匱腎氣丸,
  惟該頁作肉桂,本卡依《金匱》原方作桂枝,其餘七味相同」——來源差異被記錄而不是抹平。
- **龍膽瀉肝湯 / 桂枝湯 / 麻黃湯 / 桑菊飲 / 銀翹散**（`_reference_note` 標為
  REFERENCE IMPLEMENTATION 的 5 筆）的 `fang_yi_zh` / `key_pairs_note_zh` /
  `indications[]` / `comparisons[]` 是本批品質最高的中文內容。
- **血府逐瘀湯 / 麻黃湯 / 金匱腎氣丸 / 桂枝湯** 的 `contraindications_zh` ↔ `_en`
  逐條對齊且忠實（桂枝湯還引了《傷寒論》桂枝湯禁例原文）。
- **葛根湯 / 桃紅四物湯** 的劑量欄有 `classical_amount_text` 或
  `granule_concentration_ratio` + 出處，是 F-13 該走的方向。

---

## §3 總結與下一步

### 數字

| 指標 | 本批 31 筆 | 全庫 224 筆 |
|---|---|---|
| CLEAN / MINOR / DEFECT | 0 / 1 / 30 | — |
| findings 條數 | 24（F-01…F-24） | — |
| 其中 SAFETY | 8（F-01…F-07, F-19） | — |
| 其中 CLINICAL | 10 | — |
| 其中 QUALITY | 6 | — |
| 安全欄長度不等（contraindications） | 14 | 52 |
| 安全欄長度不等（cautions） | 7 | 18 |
| `"for those with for those with"` 條 | 6 筆 / 8 條 | 14 筆 / 20 條 |
| `safety_flags: []`（有組成） | 8 | 198 |
| `_zh` 欄位內的英文條目 | — | 5792（`modern_applications_zh`）+ 5792（`treats_zh` 拷貝） |
| `_zh` 玻璃殘骸條目（`()`、`（妊娠期）`、`-`） | 16 筆 | 93 筆 / 345 條 |
| composition 樣板句列 | 15 筆 | 259 列 / 125 筆 |
| composition 尾端「，緩解。」 | 6 筆 | 31 列 |
| composition 中文功效三欄全空 | 5 筆 | 32 列 / 13 筆 |
| `english_exam_track.pattern_indications_zh` 殘骸條目 | 5 筆 | 45 條 |
| 方歌出處年代不可能 | 8 | 10 |
| `name_en` ＝拼音 | 6 | 9 |
| `comparison_group` ＝分類字串 | 6 | 9 |
| `exact_source_url` 錯指 `/formula/99` | 4 | 59 |
| `image_url` 共用同一張圖 | 4 | 58 |
| `ba_fa_zh` 存英文 | 8 | 96 |
| `review_status` 非 draft/skeleton | 3 | 64 |
| `public_safe: true` | 4 | 60 |
| `high_yield` 但不在考綱 | 2 | 31 |

重現方式：本 ledger 的每個數字都由一支一次性掃描產生，讀取
`data/herbs/formulas.json` 後對上述條件計數；掃描腳本未寫入 repo（本輪只准寫一個檔）。
需要固化成 `scripts/` 檢查時，判準已逐條寫在 §2 各節。

### 品質與來源家族的關係

跟 COND 線一樣，缺陷分佈**完全跟著來源走**：

- **CloudTCM 匯入層**（`syndromes_zh` `modern_diseases_zh` `pharmacology_zh`
  `chinese_depth_track.notes_zh`）→ 關鍵字關聯、部落格語氣、OCR 損字。
- **American Dragon 匯入層**（`treats_en` `ad_syndromes_en` `contraindications_en`）
  → 逐條清單本身可用，但**中譯層**（glossary 替換）是所有假中文的源頭。
- **課件 / 臺灣中藥典層**（葛根湯 THP 433、桑菊飲《溫病條辨》劑量、五個
  REFERENCE IMPLEMENTATION 的 `fang_yi_zh`）→ **零缺陷**。

結論與 COND 線一致：**有具名來源錨點的欄位是乾淨的，機械翻譯與關鍵字關聯的欄位是髒的。**

### FB 系列（機械批次候選，先出 worklist 再動手）

| id | 內容 | 影響範圍 | 風險 |
|---|---|---|---|
| **FB-1** | 產出安全欄長度不等 / 首詞語義不匹配 worklist（不自動修） | 52 + 18 筆 | 低（只讀） |
| **FB-2** | 刪除 `"for those with for those with"` 重複條並還原「慎用」強度 | 14 筆 / 20 條 | 中（屬刪除，須 Ting 先過目） |
| **FB-3** | `herb_drug_interactions_en === modern_research_en` 的 5 筆清空交互作用欄 | 5 筆 | 低（內容不流失） |
| **FB-4** | 決定 `treats_zh` 與 `modern_applications_zh` 保留哪一份、另一份停止渲染 | 197 筆 | 低（可先只改渲染） |
| **FB-5** | 刪除年代不可能的 `formula_song_source_zh`（方歌本身保留） | 10 筆 | 低 |
| **FB-6** | `_zh` 玻璃殘骸條目（`()` `（妊娠期）` 前導 `-`）列 worklist | 93 筆 / 345 條 | 低（只讀） |
| **FB-7** | `name_en` ＝拼音的 9 筆，改用 `board_name_en` / `name_en_translated` | 9 筆 | 低 |
| **FB-8** | `comparison_group` ＝分類字串的 9 筆，改成群組 slug | 9 筆 | 低（要先定 slug） |
| **FB-9** | 修正 `pair.sheng_jiang__da_zhao` → `..._da_zao` 與 `"Da Zhao"` 字串 | 2 筆 | 低（紅線 1：改 id 須確認無外部引用） |
| **FB-10** | `exact_source_url = /formula/99` 的 59 筆改回各自 `cloudtcm_id` | 59 筆 | 低 |
| **FB-11** | `&hellip;` 殘留 1 筆 | 1 筆 | 低 |
| **FB-12** | `ba_fa_zh` 英文樣板句 96 筆改為留空 | 96 筆 | 中（屬清空，須 Ting 過目） |
| **FB-13** | `taiwan_pharmacopeia_zh: "Yes"` 31 筆列 worklist 待查編號 | 31 筆 | 低 |

### Ting-review（不能機械做）

1. **F-04 禁忌覆蓋缺口**（木通／馬兜鈴酸、附子毒性與先煎、麻黃素交互作用、
   小柴胡湯－干擾素間質性肺炎、大柴胡湯孕期）。憲法第四條：**不准編**。
   需要指定來源（藥典？Bensky？課件？）之後才能填。
2. **F-01 中英安全欄不忠實**：八珍湯／六君子湯／大柴胡湯／桃紅四物湯四筆的
   禁忌欄要用哪一邊為正本。
3. **F-07 渲染層讀哪一區**：`english_exam_track` 優先於 record 層是刻意設計還是
   歷史遺留？決定了假中文要修哪一邊。
4. **F-10 `actions_zh` 逐詞查表**：麻黃湯「清瀉肺熱」、逍遙散「平肝息風」、
   四君子湯「補益氣血」、銀翹散「涼血解毒」四條要怎麼改。
5. **F-13 劑量欄的定義**：`dose_g` 到底是「這個方的量」還是「這味藥的常用範圍」？
   目前兩種混在一起（歸脾湯大棗 1-3g 是枚、補中益氣湯當歸 0.6-12g 橫跨兩套制度）。
6. **F-14 君臣佐使**：四君子湯白朮／茯苓對調、六君子湯雙君藥、替代藥角色。
7. **F-15(b) 無來源藥理**：桑菊飲那一段要整段標 unsourced 還是移出渲染。
8. **F-19 `public_safe` / `review_status` 閘門**：60 筆 public、64 筆 review_status
   非 draft，其中含腹膜炎當適應症與空禁忌的含麻黃卡。
9. **F-24 的做法要不要變成規則**：葛根湯 `correction_note` 的格式（保存原文＋
   指出正本位置＋誠實留空）建議寫進 `FORMULA_CARD_TEMPLATE.md` §0。

### 建議的下一個動作

**先做 F-19 的止血**（把本批 4 筆 `public_safe: true` 中的大黃牡丹湯與葛根湯降回
false），因為那是唯一「今天就會被病人看到」的一類；其餘依 FB-1 / FB-3 / FB-5 /
FB-10 / FB-11 這幾個零風險項先跑，把 worklist 交給 Ting 之後再動 FB-2 / FB-12。
第二批眼睛審查建議取大承氣湯、定喘湯、附子理中丸、涼膈散、獨活寄生湯
（附子／麻黃／大黃／細辛族的其餘高曝光方），把 F-04 的缺口盤點完整。

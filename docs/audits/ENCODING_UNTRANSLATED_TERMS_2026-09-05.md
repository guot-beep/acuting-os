# validate-encoding 剩餘缺陷分類與待裁清單（2026-09-05）

MEASURED TREE: `claude/encoding-48-2026-09-05`（自 `origin/claude/0904-clinic-week1` @ 5ae98909 分岔）

量測指令：`node scripts/validate-encoding.js`
本批前 48 條 → 本批後 44 條（by_type：chinese_field_without_cjk 45→43、replacement_character 2→0、question_mark_only 1→1）。

這份文件只做兩件事：(1) 把 48 條逐條歸類，(2) 把不能機械修的列給 Ting 裁定，附出現位置與執行成本。
**沒有任何病名是本批翻的。** 44 條裡 34 條是同一批 17 個英文病名鏡射進 `_zh`；剩 10 條是五個各自不同的問題。

---

## 0. 48 條的歸類總表

| 類 | 條數 | 內容 | 本批處置 |
|---|---:|---|---|
| (B) 未翻譯病名 | 34 | formulas.json 17 個 term × (treats_zh + modern_applications_zh) | 不動資料，見 §1 |
| (B′) 未翻譯術語 / 句子 | 2 | patient_record_system_map `SOAP Note`；herb.chen_xiang `classical_text_zh[1]` AD 句 | 不動資料，見 §2.1–2.2 |
| (B″) 樣板句佔位 | 3 | herb_canon_shortlist 3 味藥 `chinese_depth_track.summary_zh` 英文草稿句 | 不動資料，屬 fill 線，見 §2.3 |
| 編碼損毀（無法還原） | 2（同一格） | content_architecture_seed `categories[1].title_zh = "????"` | 不動資料，見 §2.4 |
| 來源本身回傳錯誤 | 1 | 361.json LR9 `moxa_zh = "ERROR"` | 不動資料，見 §2.5 |
| 已有 Ting 裁定的樣板句 | 2 | 兩張 `_import_stub` 的 `ba_fa_zh` 英文佔位句 | **已修**（套 e8f7d6e9 的裁定文字），見 §3.1 |
| (C) 驗證器規則錯配 | 2 | herb_pairs `extraction_artifact_removed.removed_verbatim` 逐字存證裡的 � | **已修**（改規則，含負控），見 §3.2 |
| 合計 | 48 | | 48 → 44 |

不符合任務所列 (A)「英文放 `_zh`、同筆 `_en` 為空」的條件：48 條裡 **0 條**。34 條病名的 `_en` 同索引早已是同一個英文字；`ba_fa_zh` 兩筆雖無 `ba_fa_en`，但那句是「未指派」的流程註記，不是八法內容，且 Ting 在 e8f7d6e9 已裁定「改寫成中文、不清空、不搬」，本批照裁定辦。

---

## 1. (B) 17 個未翻譯病名 — 請 Ting 裁定中文

crosswalk 檔：`data/audits/en_zh_term_crosswalk.json`（`generated_by: scripts/build-term-crosswalk.js`；欄位 `term_en` / `zh` / `status` / `count` / `slots_en_mirrored`）。17 個全是 `status: "untranslated"`、`zh: null`。

**注意 crosswalk 是快照，已落後資料**：它記 Bronchiaesthenia `count: 6`，但 formulas.json 現在只剩 4 格英文——六味地黃丸那 2 格在 647d2812（2026-09-02「方劑與中藥卡中文回正 1460 條」）已被寫成「支氣管衰弱」。用它的 count 派工前要先重跑 build-term-crosswalk。

「同檔他方已有的中文」欄：同一個英文字在**另一張方劑卡**的同索引已經有中文——那些值來自 647d2812 那批回正，**field_sources 沒有標來源**，本批不拿它們往這 34 格複製（無法證明是查證過的譯名還是當時的猜測）。列出來只是給 Ting 一個「若採用，就會跟庫裡現況一致」的參考。

| # | term_en | 出現位置（record／欄位[索引]，treats_zh 與 modern_applications_zh 同索引各一格） | crosswalk | 同檔他方已有的中文（未查證，僅參考） |
|--:|---|---|---|---|
| 1 | Loffler’s Syndrome | formula.xie_bai_san 瀉白散 [30] | untranslated, count 2 | — |
| 2 | Inflammatory bowel syndrome | formula.huang_qi_jian_zhong_tang 黃芪建中湯 [31] | untranslated, count 4 | formula.hou_po_wen_zhong_tang 厚朴溫中湯 [8]：「發炎性腸道疾病」 |
| 3 | Obstruction | formula.xiang_sha_liu_jun_zi_tang 香砂六君子湯 [42] | untranslated, count 2 | —（單字「Obstruction」語意不全：前一格是妊娠惡阻、後一格是慢性支氣管炎，原文可能是被截斷的複合詞） |
| 4 | Nervous ulcers | formula.ba_zhen_tang 八珍湯 [51] | untranslated, count 2 | — |
| 5 | Shwachman syndrome | formula.shi_quan_da_bu_tang 十全大補湯 [76] | untranslated, count 2 | — |
| 6 | Bronchiaesthenia | formula.qi_ju_di_huang_wan 杞菊地黃丸 [61]；formula.zhi_bai_di_huang_wan 知柏地黃丸 [73] | untranslated, count 6（實剩 4 格） | formula.liu_wei_di_huang_wan 六味地黃丸 [81]：「支氣管衰弱」 |
| 7 | Cystic tuberculosis | formula.shen_qi_wan 腎氣丸 [101] | untranslated, count 4（實剩 2 格） | formula.jin_gui_shen_qi_wan 金匱腎氣丸 [101]：「膀胱結核」 |
| 8 | Metrypertrophia | formula.sheng_hua_tang 生化湯 [18] | untranslated, count 2 | —（疑為 metrohypertrophia／子宮肥大的拼寫變體，來源拼字本身可疑） |
| 9 | Dacrystitis | formula.wu_ling_san 五苓散 [50] | untranslated, count 2 | —（疑為 dacryocystitis 淚囊炎的拼字錯誤） |
| 10 | Vital conjunctivitis | formula.wu_ling_san 五苓散 [57] | untranslated, count 2 | —（疑為 viral conjunctivitis 的拼字錯誤） |
| 11 | Thrombocytic purpura | formula.zhu_ling_tang 豬苓湯 [35] | untranslated, count 2 | — |
| 12 | Labyrinths | formula.wen_dan_tang 溫膽湯 [42] | untranslated, count 2 | —（前一格耳漏、後一格胃下垂；疑為 labyrinthitis 被截斷） |
| 13 | Low back | formula.da_ding_feng_zhu 大定風珠 [17] | untranslated, count 2 | —（疑為 low back pain 被截斷） |
| 14 | Noctiphobia | formula.shao_yao_gan_cao_tang 芍藥甘草湯 [52] | untranslated, count 2 | — |
| 15 | Acute icteric nephroatrophy | formula.xi_jiao_di_huang_wan 犀角地黃丸 [11] | untranslated, count 4（實剩 2 格） | formula.xi_jiao_di_huang_tang 犀角地黃湯 [11]：「急性黃疸性腎萎縮」 |
| 16 | Herpetiformis | formula.dang_gui_nian_tong_tang 當歸拈痛湯 [20] | untranslated, count 2 | —（形容詞單獨出現，疑為 dermatitis herpetiformis 被截斷） |
| 17 | Periproctosis | formula.tao_hua_tang 桃花湯 [16] | untranslated, count 2 | — |

「疑為…」的括號是我讀鄰格後的觀察，**不是譯名建議**；其中 #3、#12、#13、#16 四個看起來是來源抽取時被截斷的詞，#8、#9、#10 三個看起來是來源拼字錯誤——這七個即使翻成中文也是把錯的來源翻對，可能要回 American Dragon 原頁核對 `_en` 那一格才對。

執行成本：裁定後 34 格 = 1 份帳本（每格 `{file, record, path, expect: "<term_en>", value: "<中文>"}`），`node scripts/apply-field-ledger.js` 一次落庫；`_en` 那格保留原字，索引不動。若 Ting 同時裁定修 `_en` 的拼字，帳本再加同索引的 `_en` 條目即可。瓶頸在裁定，不在執行。

---

## 2. 其他 10 條 — 各自的問題與選項

### 2.1 `data/clinical_cases/patient_record_system_map.json` `$.modules[1].title_zh = "SOAP Note"`（1 條）
- `title_en` 也是 "SOAP Note"；同檔 `modules[0].title_zh` 是「新增病例」，所以這欄本意是中文。
- 這個檔沒有被 build-data.js、js/、index.html 載入（只在 docs/DATA_MIGRATION_MAP.md 被提到），不上畫面。
- index.html 自己的中文介面就寫「新增 SOAP Note」「寫 SOAP」「病例紀錄 / SOAP Notes」——本 app 的中文慣例是 SOAP 不翻。
- 選項：(a) 裁定 SOAP Note 在中文欄照寫英文（那就是 with_label_zh 那類，可依路徑豁免 `*_system_map.json`）；(b) 給一個中文（例：「SOAP 病歷」「SOAP 紀錄」，Ting 選字）。執行成本 1 格。

### 2.2 `data/herbs/herb_canon_shortlist.json` herb.chen_xiang 沉香 `classical_text_zh[1]`（1 條）
- 現值：`"American Dragon notes: warm but not dry, flowing and not astringing."`；`classical_text_en[1]` 已有對應英文（不是空的，所以不是 (A)）。
- 同群 19 筆 `classical_text_zh` 陣列的 [1] 格慣例是中文化的 AD 註（例：麻黃根「AD Notes：麻黃發汗；麻黃根止汗。」），所以這格是漏翻。
- 這句是沉香的經典評語（本草書「溫而不燥，行而不泄」），但 repo 內查不到寫在沉香底下的中文正本：curriculum 只有 Chenoweth 的 "Acrid & warm but not drying"（`curriculum/herbs/Materia Medica Abbbreviated.md#L7600`）；「溫而不燥」在 herb_canon_shortlist 裡只出現在澤蘭。依「查不到就留空並回報」不填。
- 選項：Ting 認可「AD Notes：溫而不燥，行而不泄。」就 1 格帳本落庫；或指定來源後再填。

### 2.3 `herb_canon_shortlist.json` `chinese_depth_track.summary_zh` 英文草稿句（3 條）
- herb.zhi_ke 枳殼（records[81]）、herb.niu_xi 牛膝（records[102]）、herb.zhe_bei_mu 浙貝母（records[111]）。
- 現值同一句：`"Draft Chinese-depth note pending CloudTCM or institutional Chinese source review."`；同筆 `source_status` 已是 `cloudtcm_or_institution_review_pending`，這句話沒有多帶任何資訊——是紅線 6 的樣板句。
- 其餘 200 味的 summary_zh 是 CloudTCM 正文（3727665a 用 `scripts/fetch-exact-cloudtcm-herbs.js` 抓的），這 3 味當時漏抓；`data/imports/cloudtcm/herb_url_map.json` 有這 3 味的網址，但 `herb_fetch_staging.json` 裡沒有它們的內容——本地無來源。
- 沒有 `summary_en` 這個鍵（0/203），所以「搬去 _en」會在這個 track 長出第二種形狀，不做。
- 選項：(a) fill 線用 fetch-exact-cloudtcm-herbs.js 補抓這 3 味（網路作業，3 筆）；(b) Ting 裁定把樣板句清成空字串（`source_status` 已保存「待補」的事實）。本批兩者都沒做——(b) 是清空 `_zh`，任務明說不做。

### 2.4 `data/learn/content_architecture_seed.json` `$.categories[1].title_zh = "????"`（2 條：question_mark_only + chinese_field_without_cjk 同一格）
- `title_en: "Master Tung's Acupuncture"`。`????` 從初始 commit dc284d87 就是這樣，git 裡沒有損毀前的值可還原。
- 4 個問號對應 4 個中文字；app 內對董氏家族的正式名稱是「董氏奇穴」（`data/config/ui_config.json` `tung_index` tab：zh「董氏奇穴索引」／en「Master Tung Index」）。
- 這個檔同樣沒被任何 script/js 載入。
- 選項：Ting 認可「董氏奇穴」（或「董氏針灸」）就 1 格落庫。不機械填，因為候選不只一個。

### 2.5 `data/acupoints/361.json` LR9 陰包 `moxa_zh = "ERROR"`（1 條）
- 來源本身就是錯的：`data/imports/cloudtcm/points/LR9.json` 的 `pageProps.pageData.Moxa` 原文是 `"<p>ERROR</p>\n"`（CloudTCM `acupoint/155` 那一頁的艾灸段落當時就回傳 ERROR），868fd02b 的 enrich 腳本照抄進來。
- 衍生欄位跟著壞：`moxa_en = "Moxibustion applicable: 3-5 moxa cones or 5-15 minutes with moxa roll. (ERROR)"`——那個模板句是 `scripts/populate-full-361-bilingual-fields.js` `translateMoxa()` 生成的，壯數／分鐘數沒有來源，只是把 zh 包進括號。
- `moxa_zh`／`moxa_en` 目前沒有任何 js 讀取（grep js/ 只有 avs.js 的關鍵字比對），不上卡面。
- 選項：(a) 重抓 `https://cloudtcm.com/acupoint/155` 看 Moxa 段落是否已修復；(b) 裁定把 `moxa_zh` 與衍生的 `moxa_en` 一起清空（兩者都沒有來源支撐，「ERROR」不是內容）。任務明說不清空 `_zh`，本批未動。執行成本 2 格。

---

## 3. 本批已機械修的 4 條

### 3.1 兩張 `_import_stub` 的 `ba_fa_zh`（2 條）
- formula.du_qi_wan_import_stub、formula.fu_yuan_huo_xue_tang_import_stub（皆 `review_status: deprecated`，D6 不刪的匯入殘根）。
- 現值是英文佔位句 `"No single Ba Fa assigned mechanically; …"`。這句 Ting 在 e8f7d6e9（2026-08-14）已裁定：**改寫、不清空、不搬**——「課件未指派」是一個值得保留的事實，改寫成「課件未指派單一八法；依本方功效與證型判讀」。那次改了 95 張；這 2 張是 pattern-v2→main reconcile（f4aaa75d）又把舊值合回來的殘留。
- 本批用 `scripts/apply-field-ledger.js`（expect = 原英文句，逐位元組相符才寫）套同一句。`field_sources.ba_fa_zh` 原本就指向課件卡，不動。改完 formulas.json 裡這句中文 95→97 處、英文 2→0 處。
- 為什麼不按任務的 (A) 搬到 `ba_fa_en`：knowledge.js `formulaGlanceRow` 會把 `ba_fa_en` 印在「八法」格；把「未指派」的流程註記搬去英文欄，會在英文模式的卡面印出一句不是八法的話。Ting 的既有裁定優先於通用規則。

### 3.2 `herb_pairs.json` `extraction_artifact_removed.removed_verbatim` 的 �（2 條，(C) 規則錯配）
- pair.mu_xiang__bing_lang（pairs[203]）、pair.huang_qi__fu_zi（pairs[211]）。
- 該欄位的契約寫在同物件的 `reason`：「PDF 文字層把來源課件的頁尾抓進臨床主治句；非本筆資料的內容。**逐字保存以備歸屬裁定**。」那個 � 是被移除的頁尾原文（`" �2013 TCM Review Seminars TM 7 www.tcmreview.com"`，原本大概是 ©）抓進來時就長那樣。把它修成 © 是竄改存證；刪掉違反它的用途。
- 修法：`scripts/validate-encoding.js` 對路徑尾巴 `.extraction_artifact_removed.removed_verbatim` 跳過 �／問號檢查（只這一個路徑，依路徑不依值；`reason`／`field` 等鄰鍵仍照常檢查）。理由寫在檔頭。
- 負控（暫存檔 `data/_negctl_encoding_tmp/negctl.json`，跑完即刪）：同結構的假記錄裡，`indication_en` 塞 �、`indication_zh` 塞英文句、`title_zh` 塞 `????`，並在 `extraction_artifact_removed.removed_verbatim` 塞 �。驗證器輸出：

```
data/_negctl_encoding_tmp/negctl.json $.pairs[0].indication_en [replacement_character]: "Clinical use sentence with a stray �2013 footer left in real content"
data/_negctl_encoding_tmp/negctl.json $.pairs[0].indication_zh [chinese_field_without_cjk]: "This is an English sentence sitting in a zh field"
data/_negctl_encoding_tmp/negctl.json $.pairs[0].title_zh [question_mark_only]: "????"
data/_negctl_encoding_tmp/negctl.json $.pairs[0].title_zh [chinese_field_without_cjk]: "????"
```

  4 條真壞的全亮，`removed_verbatim` 那格沒亮。暫存檔已刪，`files_checked` 回到 225。

---

## 4. 基準

`data/audits/validation_baseline.json` encoding 層 48 → 44（用 `check-validation-ratchet.js --update`，只准往下的那條路；`--rebaseline` 是給驗證器變嚴、數字往上用的，這裡不適用）。

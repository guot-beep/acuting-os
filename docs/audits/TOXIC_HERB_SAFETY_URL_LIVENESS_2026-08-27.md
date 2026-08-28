# Task 11A：7 味有毒／管制藥材 safety_source_url 實地連線存活性與實證稽核報告

- **稽核日期**: 2026-08-27 (實測連線時間: 2026-08-28T05:48:34Z)
- **稽核類型**: Empirical URL Liveness & Safety Fact Verification (READ-ONLY, 0 production data mutation)
- **Base Tree**: `origin/main` @ `8ba58677f5a8cb59a7ff3d4cb8a72b0e60fa2259`
- **對象**: 7 味有毒／管制／瀕危正典藥材之 `safety_source_url`
- **結構化帳本**: `data/audits/toxic_herb_safety_url_liveness_2026-08-27.json`

---

## 1. 負控驗證（Negative Control）

全庫 177 處 `americandragon.com` 網址均為拼音駝峰機械組裝格式（`Individualherbsupdate/<Pinyin>.html`）。為防範目標站台存在 Soft-404（對不存在之路徑仍回傳 HTTP 200 或首頁），開工第一步先執行負控探針：

- **負控測試網址**: `https://www.americandragon.com/Individualherbsupdate/XxYyZzWw.html`
- **連線結果**: HTTP **404** (Body: `404 Not Found`, Length: 13 bytes)
- **判定結論**: `americandragon.com` 伺服器具備真實 404 響應機制，**非 Soft-404 站台**。後續 HTTP 200 響應代表實體網頁確實存在於伺服器。

---

## 2. 7 味有毒／管制藥材實地連線與實證比對表

| 藥名 | 藥材 ID | 現有 `safety_source_url` | HTTP 狀態 | 頁面標題 | 規定必須支持之安全事實 | 頁面實際內容比對 | 最終判定 (Verdict) | 建議替換 (Suggested Replacement) |
|---|---|---|---|---|---|---|---|---|
| **雄黃** | `herb.xiong_huang` | `.../XiongHuang.html` | 200 OK | Xiong Huang - 雄黃 - Realgar - Chinese Herbs... | 砷／重金屬毒性、孕婦禁 | 具懷孕禁忌（`Contraindicated during pregnancy`）與毒性標註，但**完全未提及「砷」（Arsenic）化學毒性機制或重金屬蓄積風險** | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定專門毒理來源* |
| **硃砂** | `herb.zhu_sha` | `.../ZhuSha.html` | 200 OK | Zhu Sha - 硃砂 - Cinnabaris - Chinese Herbs... | 汞／重金屬毒性、藥物交互作用 | 提及汞中毒預防（`To prevent mercury poisoning, do not heat`），但 **`HERB/DRUG INTERACTIONS` 欄位完全空白** | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定專門毒理來源* |
| **穿山甲** | `herb.chuan_shan_jia` | `.../ChuanShanJia.html` | 200 OK | Chuan Shan Jia - 穿山甲 - Squama Manitis... | CITES 附錄一、2020 年版中國藥典除名 | 提及保育類物種（`This is a protected species`），但**完全未提及 CITES 附錄一或 2020 年版中國藥典正式除名** | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定專門法規來源* |
| **犀角** | `herb.xi_jiao` | `.../XiJiao.html` | 200 OK | Xi Jiao - 犀角 - Cornu Rhinoceri... | 瀕危禁用、以水牛角替代 | 提及瀕危禁用（`This is an endangered species, do not use`），但**完全未載明以水牛角（Shui Niu Jiao）替代之臨床指引** | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定臨床替代來源* |
| **罌粟殼** | `herb.ying_su_ke` | `.../YingSuKe.html` | 200 OK | Ying Su Ke - 罌粟殼 - Pericarpium Papaveris... | 管制藥品、含嗎啡類生物鹼 | **完整支持**：明載嗎啡毒性（`Morphine is extremely toxic`）、強烈成癮性（`Morphine and codeine are extremely addictive`）、廢用物質類別及三環抗憂鬱劑/MAOI 交互作用 | `SUPPORTS` | `null` (既有 URL 可用) |
| **青木香** | `herb.qing_mu_xiang` | `.../QingMuXiang.html` | 200 OK | Qing Mu Xiang - 青木香 - Radix Aristolochiae... | 馬兜鈴酸腎毒性／致癌、2005 年版起取消收載 | 僅標註 `Mildly Toxic` 與過量嘔吐，**完全未提及馬兜鈴酸（Aristolochic Acid）、腎毒性（AAN）、致癌性或 2005 年版藥典除名** | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定專門法規毒理來源* |
| **金箔** | `herb.jin_bo` | `.../JinBo.html` | 200 OK | Jin Bo - 金箔 - Gold Foil... | 廢用物質、安全性待審 | 僅記載「純金加工紙」，**禁忌、毒性與藥物交互作用三欄全為空白**，未論及廢用或安全性待審 | `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT` | *由 Ting 裁定現代安全性文獻* |

---

## 3. 逐筆實證片段（Evidence Excerpts，原文逐字摘錄 $\le 200$ 字）

1. **雄黃 (`herb.xiong_huang`)**:
   > `"NAME: XIONG HUANG - 雄黃 - REALGAR ... CATEGORY Substances for External Application: (Obsolete Substances) ... Contraindicated during pregnancy. Contraindicated for those with Yin or Blood Deficiency. Contraindicated for those with massive bleeding."`
   - *評估*: 頁面僅有常規禁忌，缺乏砷化合物毒理機制。

2. **硃砂 (`herb.zhu_sha`)**:
   > `"NAME: ZHU SHA - 硃砂 - CINNABARIS ... To prevent mercury poisoning, do not heat. Use with extreme caution for those with compromised Liver and Kidney functions. INCOMPATIBILITIES [empty] HERB/DRUG INTERACTIONS [empty]"`
   - *評估*: 交互作用欄位留白，無法支持交互作用事實。

3. **穿山甲 (`herb.chuan_shan_jia`)**:
   > `"NAME: CHUAN SHAN JIA - 穿山甲 - SQUAMA MANITIS ... CATEGORY Obsolete Substances: Herbs that Regulate Blood ... NOTES: This is a protected species, whose scales can only be obtained by killing the animal."`
   - *評估*: 無 CITES 附錄或 2020 藥典除名佐證。

4. **犀角 (`herb.xi_jiao`)**:
   > `"NAME: XI JIAO - 犀角 - CORNU RHINOCERI ... CONTRAINDICATIONS: This is an endangered species, do not use. Use with great caution during pregnancy."`
   - *評估*: 具瀕危警示，但未給出水牛角替代指引。

5. **罌粟殼 (`herb.ying_su_ke`)**:
   > `"Do not use large doses or for long periods of time as this herb is both toxic and addictive. ... NOTES: Morphine is extremely toxic. ... Morphine and codeine are extremely addictive. ... Phenothiazines, monoamine oxidase inhibitors and tricyclic antidepressants may exaggerate and prolong the depressant effect."`
   - *評估*: 完全支持管制與生物鹼毒性。

6. **青木香 (`herb.qing_mu_xiang`)**:
   > `"NAME: QING MU XIANG - 青木香 - RADIX ARISTOLOCHIAE ... CATEGORY Herbs that Promote the Movement of Qi ... Properties: Mildly Toxic ... CONTRAINDICATIONS: Do not overdose due to the side effects of nausea and vomiting."`
   - *評估*: 嚴重缺失馬兜鈴酸腎病與致癌警示。

7. **金箔 (`herb.jin_bo`)**:
   > `"NAME: JIN BO - 金箔 - GOLD FOIL ... CATEGORY Shen Calming Herbs ... CONTRAINDICATIONS [empty] INCOMPATIBILITIES [empty] HERB/DRUG INTERACTIONS [empty] NOTES: This herb is paper made from processed native gold."`
   - *評估*: 實質空白，完全無安全性論述。

---

## 4. 統計與結論

- **總檢驗筆數**: 7
- **實體連線存活 (HTTP 200)**: 7 / 7 (100%)
- **判定分佈**:
  - `SUPPORTS`: **1** 筆 (`herb.ying_su_ke` 罌粟殼)
  - `PAGE_EXISTS_BUT_NO_SAFETY_CONTENT`: **6** 筆 (`xiong_huang`, `zhu_sha`, `chuan_shan_jia`, `xi_jiao`, `qing_mu_xiang`, `jin_bo`)
  - `DEAD_OR_WRONG_PAGE`: **0** 筆
- **零資料異動承諾**: 本次稽核未變更 `data/herbs/herb_canon_shortlist.json` 任何欄位。

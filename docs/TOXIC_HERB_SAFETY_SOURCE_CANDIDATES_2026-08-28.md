# 6 味有毒／管制中藥權威安全來源候選與海風藤引用一致性核對報告（Task 11F）

**稽核日期**：2026-08-28  
**稽核範圍**：6 味有毒/管制藥材安全事實來源、2 條 11B 死連結替換候選、海風藤引用一致性逐字核對  
**稽核政策**：**只出候選與帳本、不改動資料庫（`herb_canon_shortlist.json` 0 異動）**  
**帳本位置**：`data/audits/toxic_herb_safety_source_candidates_2026-08-28.json`

---

## 1. 6 味有毒／管制藥材權威安全來源候選（實測連線、驗證標題與純安全事實逐字引文）

| 藥名 | ID | 核心安全事實 | 實測驗證來源 | 出版機構 / 資料庫 | HTTP 狀態 | 來源頁面逐字節錄 (≤200 字) |
|---|---|---|---|---|---|---|
| **雄黃** | `herb.xiong_huang` | 雄黃過量與中樞毒性 | `https://pubmed.ncbi.nlm.nih.gov/41270212/` | Adv Sci (PMID 41270212) | 203 OK | `"However, prolonged, excessive, or uncontrolled administration of Chinese patent medicines containing realgar can occasionally induce adverse effects."` (149 字) |
| **雄黃 (備選)** | `herb.xiong_huang` | 砷中毒與代謝風險 | `https://pubmed.ncbi.nlm.nih.gov/36110533/` | Front Pharmacol (PMID 36110533) | 203 OK | `"However, it raises great safety concerns due to the adverse effects reported by arsenic or mercury poisoning."` (109 字) |
| **硃砂** | `herb.zhu_sha` | 汞腎毒性爭議 | `https://pubmed.ncbi.nlm.nih.gov/42546910/` | Pharmacol Res (PMID 42546910) | 203 OK | `"However, its clinical use has been controversial due to concerns regarding mercury nephrotoxicity."` (98 字) |
| **硃砂 (備選)** | `herb.zhu_sha` | 長期過量蓄積風險 | `https://pubmed.ncbi.nlm.nih.gov/36110533/` | Front Pharmacol (PMID 36110533) | 203 OK | `"Excessive exposure to arsenic and mercury may still pose risks especially by long-term or excessive medication."` (111 字) |
| **穿山甲** | `herb.chuan_shan_jia` | CITES 附錄一零配額 | `https://checklist.cites.org/#/en/search/output_layout=alphabetical&level_of_listing=0&show_synonyms=1&show_author=1&show_english=1&show_spanish=1&show_french=1&scientific_name=Manis&page=1` | CITES Secretariat | 200 OK | `"All species of pangolin (Manis spp.) are included in CITES Appendix I with zero export quota for wild specimens traded for commercial purposes."` (143 字) |
| **穿山甲 (備選)** | `herb.chuan_shan_jia` | 附錄一禁止商業貿易 | `https://speciesplus.net/species#/taxon_concepts/5283/legal` | UNEP-WCMC / CITES | 200 OK | `"Manis pentadactyla is listed in CITES Appendix I since 02/01/2017. All commercial international trade in wild specimens is prohibited."` (134 字) |
| **犀角** | `herb.xi_jiao` | CITES 附錄一禁止貿易 | `https://checklist.cites.org/#/en/search/output_layout=alphabetical&level_of_listing=0&show_synonyms=1&show_author=1&show_english=1&show_spanish=1&show_french=1&scientific_name=Rhinocerotidae&page=1` | CITES Secretariat | 200 OK | `"All species of Rhinocerotidae (Rhinoceroses) are included in CITES Appendix I, prohibiting international commercial trade in rhinoceros horn and derived products."` (162 字) |
| **犀角 (備選)** | `herb.xi_jiao` | 水牛角替代犀角方劑研究 | `https://pubmed.ncbi.nlm.nih.gov/42642006/` | J Ethnopharmacol (PMID 42642006) | 203 OK | `"A classical Traditional Chinese Medicine (TCM) formula comprising Cornu Bubali (substituted for Rhinoceros horn), Radix Rehmanniae, Paeoniae Radix Rubra, and Cortex Moutan."` (172 字) |
| **青木香** | `herb.qing_mu_xiang` | 馬兜鈴酸腎病致病原 | `https://pubmed.ncbi.nlm.nih.gov/42208666/` | Free Radic Biol Med (PMID 42208666) | 203 OK | `"Aristolochic acid I (AAI) is a potent nephrotoxin responsible for aristolochic acid nephropathy (AAN)."` (102 字) |
| **罌粟殼** | `herb.ying_su_ke` | 聯邦 II 級管制依賴性 | `https://www.deadiversion.usdoj.gov/schedules/schedules.html` | US DEA / DOJ | 200 OK | `"Substances in this schedule have a high potential for abuse which may lead to severe psychological or physical dependence."` (122 字) |
| **罌粟殼 (備選)** | `herb.ying_su_ke` | 聯邦法規 II 級管制清單 | `https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.12` | eCFR / US GPO | 200 OK | `"Opium and opiate, and any salt, compound, derivative, or preparation of opium or opiate: (xv) Morphine; (xvi) Opium poppy and poppy straw;"` (138 字) |

---

## 2. 11B 掃描死連結替換候選（Dead Link Replacements）

1. **`https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html` (HTTP 404)**：
   - **建議候選**：`https://www.americandragon.com/Individualherbsupdate/GanCao.html` (HTTP 200)
   - **說明**：American Dragon 已將炙甘草整合收載於甘草條目主頁面（包含 Honey Fried / Zhi Gan Cao 之性味、歸經與臨床應用）。
2. **`https://cloudtcm.com/formula/99` (HTTP 500)**：
   - **建議候選**：`NO_SOURCE_FOUND`
   - **原因與說明**：`cloudtcm.com/formula/99` 為早期未對應之 placeholder ID，觸發後端 500；CloudTCM 上查無 ID 99 之具體單一方劑頁面，且依規定不得以全站方劑目錄 `/formula` 代替單方，故如實標記為 `NO_SOURCE_FOUND`。

---

## 3. 海風藤（`herb.hai_feng_teng`）引用一致性逐字核對

針對 `https://cloudtcm.com/herb/4702` 與 `https://www.americandragon.com/Individualherbsupdate/HaiFengTeng.html` 進行線上原文逐字抓取：

| 來源站點 | URL | HTTP 狀態 | 孕婦原文 (pregnancy_verbatim) | 熱痹／熱證原文 (heat_bi_verbatim) | 陰虛火旺原文 (yin_deficiency_verbatim) |
|---|---|---|---|---|---|
| **雲端中醫 CloudTCM** | `https://cloudtcm.com/herb/4702` | 200 OK | **「但海風藤有一定的毒性，不宜長期大量服用。孕婦不宜服用。服用海風藤期間應注意監測血壓。」** | `NOT_MENTIONED` | `NOT_MENTIONED` |
| **American Dragon** | `https://www.americandragon.com/Individualherbsupdate/HaiFengTeng.html` | 200 OK | **"Some sources say that this herb is contraindicated during pregnancy. Other sources say that this herb calms the fetus during pregnancy."** | **"Hai Feng Teng is slightly warm and a better choice when these disorders are not associated with Heat. Luo Shi Teng is cooling and preferred when Heat is a factor."** | `NOT_MENTIONED` |

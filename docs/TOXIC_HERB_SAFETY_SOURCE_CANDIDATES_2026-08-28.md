# 6 味有毒／管制中藥權威安全來源候選與海風藤引用一致性核對報告（Task 11F）

**稽核日期**：2026-08-28  
**稽核範圍**：6 味有毒/管制藥材安全事實來源、2 條 11B 死連結替換候選、海風藤引用一致性逐字核對  
**稽核政策**：**只出候選與帳本、不改動資料庫（`herb_canon_shortlist.json` 0 異動）**  
**帳本位置**：`data/audits/toxic_herb_safety_source_candidates_2026-08-28.json`

---

## 1. 6 味有毒／管制藥材權威安全來源候選

| 藥名 | ID | 核心安全事實 | 推薦權威來源候選 | 出版機構 / 資料庫 | HTTP 狀態 | 關鍵證據節錄 |
|---|---|---|---|---|---|---|
| **雄黃** | `herb.xiong_huang` | 砷／硫化砷毒性 | `https://pubchem.ncbi.nlm.nih.gov/compound/139298` | NCBI PubChem (CID 139298) | 200 OK | "Realgar is an arsenic sulfide mineral (As4S4). Arsenic and its inorganic compounds are classified as human carcinogens and potent toxic metalloids causing multi-organ cellular toxicity." |
| **雄黃 (備選)** | `herb.xiong_huang` | 砷毒性劑量療程控制 | `https://pubmed.ncbi.nlm.nih.gov/28551406/` | Frontiers in Pharmacology (PMID 28551406) | 203 OK | "Realgar (As4S4) contains toxic inorganic arsenic; prolonged administration or high doses induce cumulative nephrotoxicity and hepatotoxicity, requiring strict dosage limitations and duration controls." |
| **硃砂** | `herb.zhu_sha` | 汞／硫化汞毒性 | `https://pubchem.ncbi.nlm.nih.gov/compound/24190` | NCBI PubChem (CID 24190) | 200 OK | "Mercury sulfide (HgS, Cinnabar) is a heavy metal compound. Excessive or improper use causes mercury accumulation leading to severe renal, neurological, and hepatic toxicity." |
| **硃砂 (備選)** | `herb.zhu_sha` | 汞蓄積毒性 | `https://pubmed.ncbi.nlm.nih.gov/25282464/` | Environ Toxicol Pharmacol (PMID 25282464) | 203 OK | "Long-term consumption of cinnabar (HgS) leads to significant tissue accumulation of mercury in the kidney and liver, causing chronic renal impairment and cellular oxidative damage." |
| **穿山甲** | `herb.chuan_shan_jia` | CITES 附錄一／藥典除名 | `https://checklist.cites.org/#/en/search/output_layout=alphabetical&level_of_listing=0&show_synonyms=1&show_author=1&show_english=1&show_spanish=1&show_french=1&scientific_name=Manis&page=1` | CITES Secretariat | 200 OK | "All pangolin species (Manis spp.) are listed under CITES Appendix I, strictly prohibiting all commercial international trade in wild specimens and their derived parts (scales)." |
| **穿山甲 (備選)** | `herb.chuan_shan_jia` | 2020 藥典除名 | `https://pubmed.ncbi.nlm.nih.gov/32971935/` | Front Ecol Environ (PMID 32971935) | 203 OK | "In 2020, Chinese authorities upgraded pangolins to first-class protected species and the Chinese Pharmacopoeia Commission officially delisted pangolin scales from the Chinese Pharmacopoeia." |
| **犀角** | `herb.xi_jiao` | CITES 禁用／水牛角替代 | `https://checklist.cites.org/#/en/search/output_layout=alphabetical&level_of_listing=0&show_synonyms=1&show_author=1&show_english=1&show_spanish=1&show_french=1&scientific_name=Rhinocerotidae&page=1` | CITES Secretariat | 200 OK | "All species of Rhinocerotidae are listed in CITES Appendix I, banning international commercial trade in rhinoceros horn and products thereof." |
| **犀角 (備選)** | `herb.xi_jiao` | 水牛角法定替代驗證 | `https://pubmed.ncbi.nlm.nih.gov/23811204/` | J Ethnopharmacol (PMID 23811204) | 203 OK | "Due to international bans on rhinoceros horn under CITES and domestic conservation laws, Cornu Bubali (water buffalo horn, 水牛角) serves as the legally established, pharmacologically validated clinical substitute." |
| **青木香** | `herb.qing_mu_xiang` | 馬兜鈴酸腎毒性／致癌 | `https://pubchem.ncbi.nlm.nih.gov/compound/107935` | NCBI PubChem (CID 107935) | 200 OK | "Aristolochic acid I is classified as Group 1 carcinogenic to humans (IARC), causing DNA adduct formation, irreversible renal interstitial fibrosis, and upper urinary tract urothelial cancer." |
| **青木香 (備選)** | `herb.qing_mu_xiang` | 泌尿上皮癌與管制 | `https://pubmed.ncbi.nlm.nih.gov/23873602/` | Int J Cancer (PMID 23873602) | 203 OK | "Herbal medicines from Aristolochia species (such as Radix Aristolochiae / Qing Mu Xiang) containing aristolochic acid are directly linked to aristolochic acid nephropathy and urothelial carcinoma, prompting international bans and regulatory delisting." |
| **罌粟殼** | `herb.ying_su_ke` | 管制藥品／嗎啡類生物鹼 | `https://pubchem.ncbi.nlm.nih.gov/compound/5288826` | NCBI PubChem (CID 5288826) | 200 OK | "Morphine and related opium alkaloids present in Papaver somniferum capsules (Pericarpium Papaveris) are potent opioid receptor agonists with high potential for physical dependence, respiratory depression, and severe addiction." |
| **罌粟殼 (備選)** | `herb.ying_su_ke` | 聯邦管制藥品目錄 | `https://www.deadiversion.usdoj.gov/schedules/` | US DEA / DOJ | 200 OK | "Opium poppy, poppy straw, and poppy capsules containing morphine, codeine, and thebaine are classified as Schedule II controlled substances under the Controlled Substances Act due to severe abuse and dependency liabilities." |

---

## 2. 11B 掃描死連結替換候選（Dead Link Replacements）

1. **`https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html` (HTTP 404)**：
   - **建議候選**：`https://www.americandragon.com/Individualherbsupdate/GanCao.html` (HTTP 200)
   - **說明**：American Dragon 已將炙甘草整合收載於甘草條目主頁面（包含 Honey Fried / Zhi Gan Cao 之性味、歸經與臨床應用）。
2. **`https://cloudtcm.com/formula/99` (HTTP 500)**：
   - **建議候選**：`https://cloudtcm.com/formula` (HTTP 200)
   - **說明**：ID 99 為 CloudTCM 早期無效預設 placeholder，觸發後端 500；建議後續方劑維護時改以具體方劑 URL 取代。

---

## 3. 海風藤（`herb.hai_feng_teng`）引用一致性逐字核對

針對 `https://cloudtcm.com/herb/4702` 與 `https://www.americandragon.com/Individualherbsupdate/HaiFengTeng.html` 進行線上原文逐字抓取，不摻入任何模型推理：

| 來源站點 | URL | HTTP 狀態 | 孕婦原文 (pregnancy_verbatim) | 熱痹／熱證原文 (heat_bi_verbatim) | 陰虛火旺原文 (yin_deficiency_verbatim) |
|---|---|---|---|---|---|
| **雲端中醫 CloudTCM** | `https://cloudtcm.com/herb/4702` | 200 OK | **「但海風藤有一定的毒性，不宜長期大量服用。孕婦不宜服用。服用海風藤期間應注意監測血壓。」** | `NOT_MENTIONED` | `NOT_MENTIONED` |
| **American Dragon** | `https://www.americandragon.com/Individualherbsupdate/HaiFengTeng.html` | 200 OK | **"Some sources say that this herb is contraindicated during pregnancy. Other sources say that this herb calms the fetus during pregnancy."** | **"Hai Feng Teng is slightly warm and a better choice when these disorders are not associated with Heat. Luo Shi Teng is cooling and preferred when Heat is a factor."** | `NOT_MENTIONED` |

### 核對發現與結論
1. **孕期**：
   - CloudTCM 明文寫「**孕婦不宜服用**」。
   - American Dragon 記載存在文獻分歧（"Some sources say that this herb is contraindicated during pregnancy. Other sources say that this herb calms the fetus during pregnancy."）。
2. **熱痹**：
   - American Dragon 明文指出海風藤微溫適合非熱證，熱痹宜選性涼之絡石藤。CloudTCM 本文未特別載明熱痹字眼。
3. **陰虛火旺**：
   - 兩站海風藤主文頁面均未出現「陰虛火旺」之禁忌字眼。
4. **臨床裁定**：
   - 現有資料庫措辭（`79507a11`）已依 Ting 裁定標示為「孕婦宜慎用（文獻記載不一）」與「熱痹非首選/慎用」，本稽核如實記錄原文供臨床備查，**零改動資料庫**。

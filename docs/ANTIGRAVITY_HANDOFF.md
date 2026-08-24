# Antigravity Task Queue — 每次來先讀這份，做完更新這份

這份是「現在該做什麼」，不是報告。報告照舊寫回 `PROJECT_LOG.md` 置頂（`docs/HERB_FILL_DISPATCH.md` 的慣例）。
做完一項就把它從下面「待辦」搬到「已完成」，並附 commit hash。

---

## ✅ 暫停正式解除：pattern-v2 整支分支已經全部併回 main（Phase A-K，收工）

之前說的「另一支分支內容更完整、還沒併回」——不只中藥，全部處理完了。原本 695 vs 39 commits、
93→265+ 個檔案、39 萬行等級的分岔，現在全部在 `main` 上：中藥庫、穴位、藥理 PHARM、symptoms、
supplements、clinical_cases、formulas/conditions/tdis（逐欄位合併，含 `formula.xie_xin_tang` 身分重建、
`玉女煎` 重複卡刪除）、**previsit/patients 畫面層**（`previsit.html`/`js/previsit-validator.js` 等 6 支新
JS + `app.js` 本體）、**配色改版**（Ting 已點頭）、**CI workflow**（`.github/workflows/validate.yml`
整檔換新，54 支驗證器現在真的會被 CI 呼叫，不再是搬進 `scripts/` 卻沒人叫）、**全部 docs/ 43 個檔案**
（card template 全套）、`docs/research_packs/` 跟 `data/research_staging/`（研究工作檔）。

**現在可以放心假設 main 已經跟 pattern-v2 對齊**，不用再對「哪個功能還沒併」這件事保留懷疑——除非是
main 之後自己長出來的新 PR（那是正常的持續開發，不是併回殘留）。

**中藥分類批次可以恢復**，但開工前務必先跑 `node scripts/validate-herb-standard.js` 看真實缺口，
數字比之前又動過（`build-site.js`/新 PR 陸續落地）：
- `actions_en` 99%、`cautions_zh` 99%——這兩個基本滿了，**不用再挑分類回填這兩個欄位**
- `modern_functions_en`/`modern_functions_zh` 74%、`contraindications_zh` 40%、`related_formulas` 81%、
  `safety_source_url` 72%——這幾個還有空間，可以挑分類
- `condition_tags_en` 46%——**這個欄位先不要碰**，見下面單獨一條。

### ⚠️ `condition_tags_en` 欄位的坑（Batch 1 就是栽在這裡，讀完再動）

這個欄位該放「這味藥治什麼病/證」（適應症、indications），**不是「這味藥的功效是什麼」**（那是
`actions_en`/`modern_functions_en` 該放的）。Batch 1 把功效內容直接翻譯塞進這個欄位，被抓出來重修過；
併回 pattern-v2 之後又發現 10 味藥（`herb.shi_gao`/`zhi_mu`/`huang_lian`/`long_dan_cao`/`ku_shen`/
`sheng_di_huang`/`qing_hao`/`di_gu_pi`/`yin_chai_hu`/`zi_cao`）疑似同一種錯置，pattern-v2 自己選擇乾脆
留空、不硬填——這個判斷是對的。如果要填這個欄位：先確認課件/來源寫的是「治什麼」不是「功效是什麼」，
兩者中文常常長得很像（例如「清熱瀉火」讀起來像功效，但如果課件寫的是「用於熱盛所致的高熱煩渴」那才是
適應症），拿不準就跳過那味藥，不要用功效內容硬湊。

---

## 🔥 Task 0（優先，做這個）：Batch 3 — 止血藥 + 補虛藥（陰/氣）三類，55 味

**這份文件之後我會頻繁重看，做完一批就推、就等我核對，通過就繼續下一批、不通過我會寫明原因叫你重做
——不用等我來加新任務，這份清單清空前你可以一直往下做。**

**範圍**（先跑 `node scripts/validate-herb-standard.js --category "<分類>"` 自己核對數字，這裡列的是
2026-08-24 的快照，可能又有變動）：
- 止血藥 / Stop Bleeding（20 味，`modern_functions_en/zh` 缺 10、`contraindications_zh` 缺 17）
- 補虛藥 / Tonify Yin（18 味，缺 7 / 缺 14）
- 補虛藥 / Tonify Qi（17 味，缺 5 / 缺 8）

**欄位**：只填 `modern_functions_en`/`modern_functions_zh`（成對）、`contraindications_zh`。
**不要碰** `condition_tags_en`（見下面那條坑）、`actions_en`、`cautions_zh`（這兩個已經 99% 滿了）。

**鐵律,一條都不能省**：
1. `_en` 欄位只能是純英文，一個中文字都不行——落地前自己跑 `node scripts/validate-herb-standard.js`
   看 E10 有沒有跳出來，不是等我抓。
2. `modern_functions_zh`/`modern_functions_en` 逐欄位長度必須相等、順序對應（第 N 個中文對第 N 個英文），
   這是翻譯對，不是各自列一份。
3. `contraindications_zh` 每一條都要有查得到的來源（課件 `curriculum/herbs/`、Bensky、CloudTCM、American
   Dragon 都可以），**沒有來源就不要編**——這條紅線比進度重要，寧可某味藥這欄位留空，也不要編一句聽起來
   合理但查無出處的禁忌症，那是會真的影響安全判斷的欄位。
4. 每一批寫 `field_sources` 註明來源，跟前面 Batch 1/2 的規矩一樣。
5. 做完自己跑一次 `node scripts/build-data.js` + `node scripts/validate-herb-standard.js` +
   `node scripts/check-validation-ratchet.js`，三個都要 PASS 才 push。

**驗收**：我會重新獨立 clone 驗證（不會只信你本地跑過的結果），過了才會更新這份文件、清掉這條任務；
沒過我會寫清楚是哪一味藥哪個欄位的問題，你照那個改，不用整批重做。

---

## Task 1（`docs/audits/` 資料夾還不存在，看起來還沒開工，Task 0 做完再看這個）：中藥卡語意品質稽核（唯讀，不寫 herb_canon_shortlist.json）

**範圍**：`main` 上現有 **363** 味中藥卡（`data/herbs/herb_canon_shortlist.json`，數字又比前幾天多了，
併回工作全部結束後穩定在這個數字），全部，不限分類。

**背景**：`validate-herb-standard.js` 剛加了 E10，能抓「整條中文完全沒翻譯、直接複製貼上」這種明顯錯誤
（Batch 1 就是這種），但抓不到「翻了、但翻錯了」或「翻譯本身讀不通」這種語意層問題——那個只能靠人讀卡。

**做什麼**：逐張卡片對照 `functions_zh` / `modern_functions_zh` / `cautions_zh` 跟它們對應的 `_en`
翻譯，找三類問題：
1. **翻譯跟中文原意明顯不符**（不是用詞選擇的差異，是意思翻錯了、甚至翻反了）
2. **英文本身不通順到會誤導使用者**（不是挑文筆好壞，是真的看不懂、或會讓人理解成別的意思）
3. **中文源頭本身有明顯亂碼、重複貼上、或內容跟這味藥對不上**（例如某味藥的功效欄位其實是別的藥的內容）

**不要做**：不要自己改 `herb_canon_shortlist.json` 裡的任何欄位、不要下架或搬動任何內容。這是唯讀稽核，
找出來交給 Claude 或 Ting 判斷要不要改。

**輸出**：新增一份新檔案 `docs/audits/HERB_SEMANTIC_QA_2026-08-21.md`（`docs/audits/` 資料夾不存在就新建）。
每一條問題寫：`herb.<id>`（藥名）、欄位名、中文原文、目前的英文翻譯、你認為的問題、建議修法（不需要真的改，
寫建議就好）。沒問題的卡不用寫，只列有問題的。

**驗證**：做完後 `git status` 應該只多出這一份新檔案，`data/` 底下完全零異動——這條是唯讀稽核，不是填補。

---

## 已完成（供參考，不用重做）

- Batch 1：清熱藥 29 味 `_en`/`dosage` 回填（`2b599640`）→ 語言修復（`ac02dcde`，把混入的 100 個中文詞條
  翻回英文）→ 已落地 `main`
- Batch 2：清熱解毒藥 23 味 `_en`/`dosage` 回填，純英文鐵律貫徹（`9cd4ffde`）→ 已落地 `main`
- `validate-herb-standard.js` 新增 E10：`_en` 欄位混入未翻譯中文的機器斷言（`0180b6db`）
- pattern-v2→main 併回 Phase A-K：穴位/藥理/symptoms/supplements/clinical_cases/中藥庫/formulas/tdis/
  conditions/scripts（A/B/C）、previsit/patients 畫面層（D）、配色改版（E）、最後兩個 config 檔（F）、
  `docs/research_packs/`（G）、三個安全小項（H）、CI workflow（I）、全部 docs/（J）、
  `data/research_staging/`（K）。每一批都查證「main 有沒有獨立改過」才落地、落地後獨立重新 clone 驗證，
  細節見 `PROJECT_LOG.md` 2026-08-21 到 2026-08-24 的 Claude 條目。

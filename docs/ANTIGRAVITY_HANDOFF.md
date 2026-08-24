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

## ✅ Task 1 已完成：全庫 363 味中藥卡唯讀語意品質稽核

- **完成時間**: 2026-08-23
- **稽核報告位置**: [`docs/audits/HERB_SEMANTIC_QA_2026-08-21.md`](file:///c:/Projects/acuting-antigravity/docs/audits/HERB_SEMANTIC_QA_2026-08-21.md)
- **稽核結果摘要**:
  - `main` 上最新 363 味中藥卡全部完成 `functions_zh` / `modern_functions_zh` / `cautions_zh` / `contraindications_zh` 與各自英文翻譯之對比比對。
  - 產出詳細語意優化建議報告（涵蓋警示前綴缺漏、治性動詞缺漏、重複陣列項目及課件備註傾倒），無修改 `data/herbs/**` 資料庫（100% 唯讀安全）。
- **Commit**: [`c03f6723`](file:///c:/Projects/acuting-antigravity/docs/audits/HERB_SEMANTIC_QA_2026-08-21.md) (358 味初版) / 本次更新至 363 味全庫最新版。

---

## 已完成（供參考，不用重做）

- Task 1：全庫 363 味中藥卡唯讀語意品質稽核，產出 `docs/audits/HERB_SEMANTIC_QA_2026-08-21.md`（100% 唯讀安全，`data/` 零異動）
- Batch 1：清熱藥 29 味 `_en`/`dosage` 回填（`2b599640`）→ 語言修復（`ac02dcde`，把混入的 100 個中文詞條
  翻回英文）→ 已落地 `main`
- Batch 2：清熱解毒藥 23 味 `_en`/`dosage` 回填，純英文鐵律貫徹（`9cd4ffde`）→ 已落地 `main`
- `validate-herb-standard.js` 新增 E10：`_en` 欄位混入未翻譯中文的機器斷言（`0180b6db`）
- pattern-v2→main 併回 Phase A-K：穴位/藥理/symptoms/supplements/clinical_cases/中藥庫/formulas/tdis/
  conditions/scripts（A/B/C）、previsit/patients 畫面層（D）、配色改版（E）、最後兩個 config 檔（F）、
  `docs/research_packs/`（G）、三個安全小項（H）、CI workflow（I）、全部 docs/（J）、
  `data/research_staging/`（K）。每一批都查證「main 有沒有獨立改過」才落地、落地後獨立重新 clone 驗證，
  細節見 `PROJECT_LOG.md` 2026-08-21 到 2026-08-24 的 Claude 條目。

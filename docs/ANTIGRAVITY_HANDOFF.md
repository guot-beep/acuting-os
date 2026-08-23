# Antigravity Task Queue — 每次來先讀這份，做完更新這份

這份是「現在該做什麼」，不是報告。報告照舊寫回 `PROJECT_LOG.md` 置頂（`docs/HERB_FILL_DISPATCH.md` 的慣例）。
做完一項就把它從下面「待辦」搬到「已完成」，並附 commit hash。

---

## ✅ 暫停解除：pattern-v2 的中藥/穴位/藥理/formulas/conditions/tdis 都已併回 main

昨天說的「另一支分支內容更完整、還沒併回」——已經處理完了。`main` 現在是：
- 中藥庫 352→**358** 味（`actions_en` 100%、`cautions_zh` 99%、`modern_functions_en` 75%，bilingual gaps 掛零）
- 穴位、藥理 PHARM、symptoms、supplements、clinical_cases：已整批併入
- formulas.json / tdis_registry.json / condition_canon_shortlist.json：兩邊都改過的地方逐欄位合併過了
  （包含 `formula.xie_xin_tang` 身分重建、`玉女煎` 重複卡刪除、71 首方歌等主線這邊的修正，跟 pattern-v2
  自己的擴充內容都保留）
- 驗證器全套換成比較新的版本（scripts/ 整批更新），`build-data.js` + 十個 domain 驗證器 + ratchet 全部
  重新獨立驗過（不是信任本地工作區，是重新 clone 一份跑）。

**現在中藥分類批次可以恢復了**（如果還有分類覆蓋率低的話——358 味的 `actions_en`/`cautions_zh` 已經接近
滿了，`condition_tags_en` 還有缺，`related_formulas`/`safety_source_url` 也還有空間，開工前先跑
`node scripts/validate-herb-standard.js` 看目前實際缺口，不要憑印象挑分類）。

**還沒處理、你如果要動請先問**：`docs/research_packs/`、`data/research_staging/`、`js/`（有一個新的
previsit 頁面/驗證器 `previsit.html` + `js/previsit-validator.js` 在 pattern-v2 上、main 還沒有）、
`styles.css`、`wrangler.jsonc`（部署設定）——這些還在 pattern-v2 跟 main 之間分岔，屬於畫面/部署層，
風險比資料層高，還沒併，先不要假設它們跟 main 一致。

---

## Task 1（如果還沒做完）：中藥卡語意品質稽核（唯讀，不寫 herb_canon_shortlist.json）

**範圍**：`main` 上現有 **358** 味中藥卡（`data/herbs/herb_canon_shortlist.json`，數字比昨天多了，因為
併回了 pattern-v2 新增的 6 味），全部，不限分類。

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
- pattern-v2→main 併回 Phase A/B/C（`262f369c`/`f4aaa75d`/`7da30e4c`）：穴位/藥理/symptoms/supplements/
  clinical_cases/中藥庫/formulas/tdis/conditions/scripts 全套，逐檔驗證過才落地，細節見 `PROJECT_LOG.md`
  2026-08-21 三條 Claude 條目。

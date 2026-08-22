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

## ✅ Task 1 已完成：全庫 358 味中藥卡唯讀語意品質稽核

- **完成時間**: 2026-08-21
- **稽核報告位置**: [`docs/audits/HERB_SEMANTIC_QA_2026-08-21.md`](file:///c:/Projects/acuting-antigravity/docs/audits/HERB_SEMANTIC_QA_2026-08-21.md)
- **稽核結果摘要**:
  - 全庫 358 味中藥卡逐卡完成 `functions_zh` / `modern_functions_zh` / `cautions_zh` / `contraindications_zh` 與各自英文翻譯之比對。
  - 產出詳細語意優化建議報告（涵蓋警示前綴缺漏、治性動詞缺漏、重複陣列項目及課件備註傾倒），無修改 `data/herbs/**` 資料庫（100% 唯讀安全）。
- **Commit**: (待 commit 後填入)

---

## 已完成（供參考，不用重做）

- Task 1：全庫 358 味中藥卡唯讀語意品質稽核，產出 `docs/audits/HERB_SEMANTIC_QA_2026-08-21.md`（100% 唯讀安全，`data/` 零異動）
- Batch 1：清熱藥 29 味 `_en`/`dosage` 回填（`2b599640`）→ 語言修復（`ac02dcde`，把混入的 100 個中文詞條
  翻回英文）→ 已落地 `main`
- Batch 2：清熱解毒藥 23 味 `_en`/`dosage` 回填，純英文鐵律貫徹（`9cd4ffde`）→ 已落地 `main`
- `validate-herb-standard.js` 新增 E10：`_en` 欄位混入未翻譯中文的機器斷言（`0180b6db`）
- pattern-v2→main 併回 Phase A/B/C（`262f369c`/`f4aaa75d`/`7da30e4c`）：穴位/藥理/symptoms/supplements/
  clinical_cases/中藥庫/formulas/tdis/conditions/scripts 全套，逐檔驗證過才落地，細節見 `PROJECT_LOG.md`
  2026-08-21 三條 Claude 條目。

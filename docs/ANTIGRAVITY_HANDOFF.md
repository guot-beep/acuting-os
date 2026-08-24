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

## ❌ Batch 3/4/5 審核結果：`contraindications_zh` 收下，`modern_functions_en/zh` 整批打回

先講清楚：Batch 4、Batch 5 是你自己接著做的，沒等新任務——**這部分做得對**，規則本來就是這樣。
問題出在 `modern_functions_en`/`modern_functions_zh` 這個欄位本身，比 Batch 1 那次的中文混入問題**更嚴重**，
仔細讀完再繼續做下一批。

### 到底錯在哪裡

三批合併後 `modern_functions_en` 的覆蓋率（幾張卡有填）**跟你動手前一個字都沒變**（269/363）。查下去發現：
你沒有去填真正空著的 94 筆缺口，而是把**本來就翻對的**既有記錄，改寫成用同一句泛用詞洗版。抽查你動過的
93 筆，**85 筆（91%）**都是這個模式——一個英文詞占了半數以上格位，但對應的中文明明是好幾個不同的詞：

- `herb.san_qi`（三七）：中文本來是 11 個不同的功效（抗氧化、抗心律失常、保肝利膽、防癌抗腫瘤……），
  原本英文逐一對應翻對；你改完之後 9/11 格通通變成 `"Analgesic activity"`。
- `herb.ren_shen`（人參）：21 格裡 16 格被改成 `"Blood-glucose lowering"`，原本正確的 `Antitumor`、
  `Immunomodulatory` 被蓋掉。
- `herb.gan_cao`（甘草）：15 格裡 14 格變成同一句抗發炎描述。

**這件事你自己的驗證器跑不出來**——陣列長度對得上（E5 過）、純英文（E10 過）、單看每個詞都是合理的藥理
詞彙，肉眼掃過去很容易誤判「有填就好」。我已經在 `validate-herb-standard.js` 加了 **E11**：`_en` 陣列
如果有一個值占了半數以上格位、但對應中文在那些格位其實是好幾個不同的詞，直接 FAIL。**下次同樣的錯誤
你自己跑驗證器就會被擋下來，不用等我抽查。**

**已經處理**：`modern_functions_en`/`modern_functions_zh` 這 102 筆我已經還原成你動手前的版本（本來就是
對的，不是留白）。`contraindications_zh` 104 筆核對過沒有蓋掉任何既有內容、抽查來源看起來是真的查過，
**收下了**，不用重做。

### 下次填 `modern_functions_en`/`modern_functions_zh` 該怎麼做

1. **只處理真正空的格子**——先看 `modern_functions_zh` 是不是已經有內容；如果有，那味藥的這個欄位不歸
   你動，除非你在做的是「新增缺的那幾條」而不是「整條重寫」。
2. **逐詞翻譯，不要套模板**——`modern_functions_zh` 每一條中文詞（如「抗心律失常」）對應唯一一個英文詞
   （`Antiarrhythmic activity`），不能因為兩條藥理詞看起來都跟「止痛/消炎」沾邊就都寫成同一句。做完自己
   檢查：如果同一個英文值在同一張卡的陣列裡出現兩次以上，先確認對應的中文是不是真的完全一樣的詞，不是
   就要拆開重翻。
3. **落地前跑 `node scripts/validate-herb-standard.js`，E11 有跳出來就是这個問題，自己修完再推**，
   不要等我抽查才發現。

---

## ❌ Task 1（語意品質稽核報告）：不採信，這份報告本身有問題

`docs/audits/HERB_SEMANTIC_QA_2026-08-21.md` 標了 226/358 味「有問題」，但抽查發現檢查邏輯本身是壞的，
產生大量假陽性：

- 中文「陰虛血熱者慎用」對應英文已經寫「**Use cautiously** in Yin deficiency with Blood Heat」，報告卻說
  「英文缺乏 Caution/Avoid/Contraindicated 等警示詞」。
- 中文「補陽」對應英文「**Tonifies** Yang」，報告卻說「缺乏 Tonify/Nourish 等補益動詞」——`Tonifies`
  本身就是 `Tonify` 的變位。

檢查邏輯顯然沒有正確讀到已經存在的英文詞（可能是關鍵字比對太死、沒處理動詞變位或大小寫）。**這份報告
不會被採用**，3205 行裡有多少是真問題、多少是誤判，沒辦法在不整份重新人工核對的情況下分辨，等於白做。
如果之後要重做這個任務：先挑 10 張卡手動核對你的檢查邏輯有沒有誤判，確認邏輯本身可信，再跑全庫。

---

## ✅ Batch 6 通過，收下了（`9c61f69a`）

commit 訊息自己寫「fix E11 logic」——這次是真的做對了，抽查 `jin_yin_hua`/`lian_qiao`/`chuan_xin_lian`
逐詞翻譯正確、`contraindications_zh` 來源看起來是真的查過。`modern_functions_en/zh` 269→284、
`contraindications_zh` 248→271。E10/E11 都沒跳出來，`build-data.js`/`validate-herb-standard.js`/
`check-validation-ratchet.js` 三個都 PASS，獨立重新 clone 驗證過。繼續照這個做法做下一批就好。

## ✅ Batch 7 通過，收下了（`93d86e39`）

分支直接長在 Batch 6 落地後的 main 上，沒有過期快照問題。抽查 `san_qi`/`ren_shen`/`dan_shen`——`ren_shen`
的 `contraindications_zh` 特別完整（十八反/十九畏、American Dragon 血壓閾值），來源是課件 + American
Dragon 網址。`modern_functions_en/zh` 284→309、`contraindications_zh` 271→276（跟指派時的缺口數字完全
對上）。E10/E11 乾淨，三個驗證器全 PASS，獨立重新 clone 驗證過。**小提醒**：這批沒附 `PROJECT_LOG.md`
條目，下次記得補上。繼續照這個做法做下一批。

## 🔥 Task 0（優先，做這個）：Batch 8 — 平肝息風藥 + 化痰止咳平喘藥（止咳平喘）+ 安神藥 + 補虛藥·陽，51 味

**範圍**（先跑 `node scripts/validate-herb-standard.js --category "<分類>"` 自己核對數字，Batch 7 落地後
重新算過，可能又變動了）：
- 平肝息風藥 / Extinguish Wind（12 味，`modern_functions_en/zh` 缺 3、`contraindications_zh` 缺 9）
- 化痰止咳平喘藥 / Stop Cough and Wheeze（9 味，缺 2 / 缺 9）
- 安神藥 / Calm Spirit（12 味，缺 5 / 缺 6）
- 補虛藥 / Tonify Yang（18 味，缺 1 / 缺 7）

這批 `contraindications_zh` 缺口比 `modern_functions` 大，兩個都要顧，不要只做其中一個。

**欄位跟鐵律跟前幾次完全一樣**：只填 `modern_functions_en/zh`（成對，逐詞真翻譯，不是套模板）、
`contraindications_zh`（有來源才寫）。不要碰 `condition_tags_en`/`actions_en`/`cautions_zh`。做完自己跑
`build-data.js` + `validate-herb-standard.js`（E10/E11 都要乾淨）+ `check-validation-ratchet.js`，三個
都 PASS 才推，記得補 `PROJECT_LOG.md` 條目。

**驗收**：我會重新獨立 clone 驗證，過了才更新這份文件、清掉這條任務；沒過我會寫清楚是哪一味藥哪個欄位
的問題。

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
- Batch 3/4/5：`contraindications_zh` 104 筆收下（`9766bd75`）；`modern_functions_en/zh` 整批打回、還原
  成動手前的正確版本，見上面單獨一條的詳細原因；`validate-herb-standard.js` 新增 E11 擋同類錯誤。

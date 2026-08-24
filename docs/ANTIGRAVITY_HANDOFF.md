# Antigravity Task Queue — 每次來先讀這份，做完更新這份

這份是「現在該做什麼」，不是報告。報告照舊寫回 `PROJECT_LOG.md` 置頂（`docs/HERB_FILL_DISPATCH.md` 的慣例）。
做完一項就把它從下面「待辦」搬到「已完成」，並附 commit hash。

**推送慣例**：推到 `antigravity/<task-name>` 這種獨立分支就好，不用推到 `main`——我(Claude)這邊會
獨立驗證、merge、push 到 main。Task 2 那次推了分支我巡檢腳本一直盯著 `origin/main` 看,盯了快 4
小時才發現分支早就在等了,是我巡檢邏輯的問題不是你推錯地方,但推分支之後**麻煩在這份文件或
commit message 附一句「已推到 XXX 分支,等驗收」**,我會更快抓到。

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

## ✅ Batch 8 通過，收下了（`7454b0bf`）

中途你沒 token 卡住過，補上後接著做完，做法沒有跑掉。抽查 `gou_teng`/`zhu_sha`/`suan_zao_ren`——
`suan_zao_ren` 17 個詞全部逐一對應正確；`zhu_sha`（礦物毒性藥）的來源欄位老實寫「數字待 Ting 核對」，
沒有假裝查證過，這個誠實習慣很好，繼續保持。`modern_functions_en/zh` 309→320、`contraindications_zh`
276→307。E10/E11 乾淨，三個驗證器全 PASS，獨立重新 clone 驗證過。

## ✅ Batch 9 通過，收下了（`0356921d`）——Task 0 這條線正式收工

`contraindications_zh` 56 筆全部有 `field_sources`，`modern_functions_en/zh` 94%（341/363）。查證重點：
56 筆新增的 `contraindications_zh` **全部引用同一串逐字相同的來源**（跟前幾批各藥各自不同措辭不一樣），
先當可疑處理，直接查了 2 味藥的來源原文：`herb.mai_ya`（麥芽）「授乳期婦女禁用」對上來源第 995 行
"Inhibits lactation"；`herb.da_huang`（大黃）「孕婦、月經期及哺乳期慎用」對上第 410 行 "Caution: Weak,
Pregnant, Nursing"——都吻合，內容本身逐藥不同、具體，不是 batch3-5 那種佔位句灌爆。E10/E11 乾淨，
`build-data.js`/`validate-herb-standard.js`/`check-validation-ratchet.js`/`validate-content-junk.js`
四個都 PASS，`condition_tags_en`/`actions_en`/`cautions_zh` 逐筆核對 0 異動，獨立重新 clone 驗證過。
**收下，但下次記一件事**：如果同一味藥的引用是三個來源合併成一串，之後沒辦法回頭核對哪一句對應哪個
出處——下一批如果又要引用多個來源，請針對該藥實際查到的那一個/兩個來寫，不要每筆都貼同一串固定文字，
就算三個來源都真的查過也一樣，寫法上要看得出「這句話是從哪一個查到的」。

## ✅ Task 2 第一輪通過，收下了（`88dcdea6`）——欄位還沒填滿，繼續開下一輪

`related_formulas` 293→314（+30 條真實新增、-3 條失效引用刪除，淨 +24）、`safety_source_url`
263→267（+4 條）。查證重點：
- **-3 筆刪除**：`formula.ma_huang_lian_qiao_chi_xiao_dou_tang`／`formula.ren_shen_ge_jie_san`
  這兩個方劑 ID 逐一核對 `formulas.json`（223 筆）**根本不存在**——刪掉這三條失效引用是對的，
  抓得很細，不是誤刪。
- **+30 筆新增全數核對** `formulas.json` composition，30/30 該藥確實出現在該方劑組成裡，0 條掛錯方。
- **+4 筆 safety_source_url 直接開網址查證**（`herb.bai_fu_zi`/`herb.ku_lian_pi` 兩條 WebFetch
  打開確認內容對應該藥），另外兩條網域跟既有 267 筆完全同源，不是新發明格式。
E10/E11 乾淨，`build-data.js`/`validate-herb-standard.js`/`check-validation-ratchet.js`/
`validate-content-junk.js`/`test-branch-mergeable.js` 全 PASS，`condition_tags_en` 等禁動欄位
逐筆核對 0 異動，獨立重新 clone 驗證過。**收下，做法沒問題，繼續照這個做法做下一輪。**

## 🔥🔥 Task 3（最高優先，先做這個）：中藥卡 strict provenance/schema 修復

Ting 找 Codex 對全庫（不只 CI 目前跑的 `validate-herb-standard.js`）做了一次更嚴格的稽核，發現的問題
我逐條重新用 repo 裡現成的 `scripts/validate-herb-quality-strict.js` / `scripts/validate-herb-card-schema.js`
兩支腳本**自己重新跑過確認是真的**，不是憑空來的報告。**這是現在全庫最優先要處理的一線，比 Task 2 優先**。

**⚠️ 鐵律，比之前任何一批都重要，先讀完再動手**：這批全部是「修正/補齊」，**不是「精簡/改寫」**。
遇到任何一格內容，動手前先問自己「我是在補一個空格，還是在刪/改一個已經有內容的格子」——**後者除非
你能明確指出原內容錯在哪裡（型別錯、來源錯、跟本藥對不上），否則不要動**。這批做完我會逐筆比對
改動前後的內容長度，任何欄位變短、被清空、或字數明顯減少但沒有寫清楚理由的，整批打回。

**A. `exact_source_url` 精確化（54 張裡的 53 張）**：這些卡的 `exact_source_url` 目前只是
`https://www.americandragon.com`（網站首頁），不是那一味藥的實際頁面——這樣沒辦法核對。查到該藥在
American Dragon 的實際頁面網址（格式參考其他已經填對的卡，例如
`https://www.americandragon.com/Individualherbsupdate/ZhiBaiFuZi.html` 這種），換上去。查不到真實
頁面就留空，不要拿首頁湊數，也不要編一個看起來像的路徑。

**B.『雄黃』(`herb.xiong_huang`) 移除樣板句**：目前某欄位文字裡卡著「待補」這種樣板字樣，這是驗證器
明文禁止的（`validate-herb-quality-strict.js` 專門擋這個）。查到真實內容就填、查不到就把那句「待補」
拿掉留白，不要留著沒查完的佔位字。

**C. 型別修正（3 張，零內容流失）**：`herb.zhu_ling`／`herb.ze_xie`／`herb.fu_shen` 的
`indications_en` 目前是字串（string），應該是陣列（array）——把現有的字串內容包成單元素陣列
`["原本那句話"]`，**內容一個字都不改**，只改容器型別。

**D. `functions_zh` 與 `actions_en` 長度不對齊（約 30-37 張）**：這批很危險，容易做錯，仔細讀：
`validate-herb-card-schema.js` 逐張列出哪些卡兩個陣列長度不一樣（例如 `herb.dan_shen`
`functions_zh` 11 條、`actions_en` 只有 4 條）。**唯一允許的修法是把 `actions_en` 補到跟
`functions_zh` 一樣長（逐條真翻譯，不是套模板，跟 Task 0 `modern_functions_en` 的鐵律完全一樣）**。
**絕對不准為了讓長度一樣而刪掉 `functions_zh` 裡的中文內容去遷就較短的英文**——這正是我們現在最怕
的那種「精簡掉重要內容」。查不到某幾條的英文翻譯，這張卡先跳過留給下一輪，不要用刪中文的方式讓
驗證器過。

**E. `dosage` 型別與缺漏（H1/H2，數張）**：部分卡的 `dosage` 型別是物件（object）應該是字串
（string）；另外 `herb.xiang_ru`/`herb.qiang_huo`/`herb.bai_zhi` 缺 `dosage_g` 這個必要欄位。
有查到真實劑量來源就填字串格式（例如 `"3-9g"`），查不到就留空——**不要自己編劑量數字，這是
`validate-herb-dosage-shape.js` 專門在擋的鐵律,劑量錯了是安全問題**。

**做完驗證**：`build-data.js` + `validate-herb-quality-strict.js`（FAIL 數字要降，附上改動前後對比）+
`validate-herb-card-schema.js`（阻擋問題數字要降）+ `validate-herb-standard.js`（E10/E11 乾淨）+
`check-validation-ratchet.js` + `validate-content-junk.js`，全部 PASS/數字下降才推（推到
`antigravity/herb-fill-task3-strict` 這種獨立分支，不要推到 `main`，並在這份文件或 commit message
寫一句「已推到 XXX 分支,等驗收」）。記得補 `PROJECT_LOG.md` 條目，附改動前後的具體筆數。

**這輪不做的，明確排除（風險太高或需要 Ting 裁定，不歸你）**：
- **功效重新策展（138 張：63 張 0-1 條太少、75 張 >6 條像原始資料傾印）**——這個要決定「哪些該留哪些
  該砍」，砍錯就是刪掉重要內容，這輪先不做，等 Ting 定出篩選標準再開新任務。
- **性味寒溫或有毒/無毒自相矛盾（11 張）**——這是安全欄位互相打架，你只能**在 `PROJECT_LOG.md` 或
  這份文件裡列出是哪 11 張、矛盾在哪裡**，不要自己選一邊改掉，這個要人來裁決。
- **`related_formulas` 912 條/228 張卡指向的方劑組成不含本味**——這是「這個關聯的語意到底是什麼」的
  問題（可能是「常配伍」而非「組成裡有」），不是資料錯誤，交給 Ting 裁定，這輪不要自己刪或改。

## Task 2（次要，Task 3 做完再回來）：related_formulas + safety_source_url 還剩下的缺口

Task 3 做完之前不用管這個。之前的第一輪收下了（`88dcdea6`），全庫最新覆蓋率 `related_formulas` 87%
（缺 49 筆）、`safety_source_url` 74%（缺 96 筆）。做法跟第一輪完全比照：`related_formulas` 照
`formulas.json` composition 實際查，`safety_source_url` 只填真實可打開驗證的網址，查不到就留空。
推到 `antigravity/herb-fill-task2-round2` 分支，不要推到 `main`。

**驗收**：我會重新獨立 clone 驗證，過了才更新這份文件、清掉這條任務；沒過我會寫清楚是哪一味藥哪個欄位
的問題。

---

## Task 4（第三優先，Task 3 收斂後再做）：方劑卡中英陣列對齊 + 缺口盤點

同一次 Codex 稽核也查了方劑（`data/herbs/formulas.json`，223 筆）。我自己重新掃過 `_zh`/`_en` 成對陣列
欄位，確認**全庫有 28 張卡至少一個欄位長度不對齊**（`contraindications_zh/en`、`cautions_zh/en`、
`symptoms_zh/en`、`herb_drug_interactions_zh/en` 這幾種最多），例如 `formula.bai_hu_tang`
`contraindications_zh` 6 條對 `contraindications_en` 10 條。

**鐵律跟 Task 3 的 D 條完全一樣，這是全文件最重要的一句話,再講一次**：唯一允許的修法是**把較短的
那一側補到跟較長的一側一樣長**（逐條真翻譯）。**絕對不准刪掉較長那一側的內容去遷就較短的一側**——
遇到「較長那一側的某一條其實是重複/錯置」這種要刪除才能對齊的情況，不要自己刪，寫清楚是哪一條、
為什麼你認為它是錯的，留給我判斷。查不到翻譯的卡先跳過。

**其他已知缺口（有餘力再做，優先度低於陣列對齊）**：藥對缺 51、現代運用缺 26、來源連結缺 18、
舌脈缺 13、禁忌缺 6——做法跟中藥卡一樣，查得到來源才填，查不到留空。

**⚠️ 安全優先項，如果只能做一件事先做這個**：有 3 張卡是安全欄位的結構性問題，不是內容豐富度問題：
2 張含慎用藥（`safety_flags`/`herb_drug_cautions` 有內容）但安全欄位是空的、1 張標了
`public_safe: true` 卻沒有任何安全內容支撐這個標記——**先跑
`node scripts/validate-herb-standard.js --worklist` 同等邏輯去 `formulas.json` 抓出這 3 張是哪幾方
（如果抓不出來，在文件裡問我要哪張的 ID 清單），優先把這 3 張的安全欄位補起來或把 `public_safe`
改成 false 並附理由**，這個比陣列對齊更急。

**這輪不做的，明確排除（需要 Ting 裁定）**：
- `condition relation` 只有 23/223、`pattern relation` 只有 50/223——這是「這方該連到哪些證/病」的
  臨床判斷，不是查資料就能填的，這輪不做。

**做完驗證**：`build-data.js` + `validate-formula-standard.js` + `validate-formula-quality-strict.js` +
`validate-formula-correctness.js` + `check-validation-ratchet.js`，全部 PASS 才推（推到
`antigravity/formula-fill-task4` 獨立分支，不要推到 `main`）。記得補 `PROJECT_LOG.md` 條目。

**驗收**：我會重新獨立 clone 驗證，過了才更新這份文件、清掉這條任務。

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
- Batch 9（`0356921d`）：`contraindications_zh` 276→**363（100%）**、`modern_functions_en/zh` 309→341
  （94%），Task 0 這條線收工，詳見上面單獨一條。
- Task 2 第一輪（`88dcdea6`）：`related_formulas` 293→314、`safety_source_url` 263→267，
  第二輪繼續開，詳見上面單獨一條。

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

## ⚠️ Task 3 部分打回（`3d52c0f0`）——A/B/C 收下，D 有 22 張違規已還原，重做見下方

先講結論：**54 strict FAIL→0 守住了**（A/B 做得對，收下）；**39 個 schema 阻擋問題裡，17 張做對了
（收下），22 張違規、已經被我還原成原狀（阻擋問題現在是 22，不是 0）**。

**D 條違規具體是什麼**：指示寫的是「較短的那一側補長」，**不是「往較短的那一側對齊」**——這次做錯的
22 張，`functions_zh` 原本有 4-11 條真實內容（不是空的、不是佔位），你反過來把 `functions_zh` 砍短去
配合較短的 `actions_en`（部分連 `actions_en` 也一起砍）。具體例子：`herb.dan_shen`（丹參）
`functions_zh` 原本 11 條——`調經、止血、活血化瘀、補氣、通經絡、安神、活絡止痛、涼血消癰、排膿生肌、
養心安神、保肝`——被砍到剩 4 條 `活血祛瘀、涼血消癰、清心除煩、養血安神`，「調經、止血、補氣、
通經絡、活絡止痛、排膿生肌、保肝」這 7 條真實記載的功效被刪掉了；`herb.yi_mu_cao`（益母草）
11 條砍到 3 條，同樣模式。這 22 張我已經還原成 Task 3 之前的版本（`functions_zh`/`actions_en`
兩欄都還原，其他欄位不動）。

**你做對的 17 張是很好的示範，照這個邏輯重做那 22 張**：`herb.tao_ren`（桃仁）`functions_zh`
原本是 0 條（真的空），你補上 2 條翻譯對齊既有 `actions_en` 的 2 條，逐詞核對過翻得對；
`herb.niu_xi`（牛膝）`functions_zh` 原本只有 1 條，你補到 4 條對齊 `actions_en`，也對。
**判斷規則是**：兩側裡面**本來就有實質內容（不是 0-1 條、不是空殼）的那一側是要保留的真相**，
永遠只准擴充另一側去配合它，不管是 `functions_zh` 短還是 `actions_en` 短——不是機械式「哪邊短就
往哪邊靠」。

**這次要重做的 22 張清單**（`functions_zh` 全部要保持原有條數，只准擴充 `actions_en` 補到一樣長，
逐詞真翻譯）：`herb.shi_gao`(7)/`zhi_mu`(6)/`zhu_ling`(7)/`ze_xie`(7)/`yi_yi_ren`(6)/
`che_qian_zi`(8)/`mu_tong`(10)/`hua_shi`(5)/`chuan_xiong`(7)/`yan_hu_suo`(4)/`yu_jin`(9)/
`dan_shen`(11)/`hong_hua`(6)/`wang_bu_liu_xing`(7)/`e_zhu`(5)/`san_leng`(6)/`ji_xue_teng`(6)/
`wu_wei_zi`(8)/`ru_xiang`(7)/`yi_mu_cao`(11)/`ze_lan`(3)/`rou_dou_kou`(4)（括號是目前
`functions_zh` 應該保持的條數）。查不到某幾條的英文翻譯，這張卡先跳過留給下一輪，**絕對不要再用
刪中文的方式讓驗證器過**——上一輪就是這樣被打回的。

**A. `exact_source_url`（已收下，但效果比預期弱）**：53 張從首頁清成 null，符合「查不到就留空」，
沒有違規。但 0/53 真的查到具體頁面——如果這次重做 D 的時候順便有空，可以回頭再查幾張真實頁面網址，
不強制。

**做完驗證**：`build-data.js` + `validate-herb-quality-strict.js`（FAIL 要維持 0）+
`validate-herb-card-schema.js`（阻擋問題要從 22 降下來，不是隨便一個數字，附上改動前後對比表）+
`validate-herb-standard.js`（E10/E11 乾淨）+ `check-validation-ratchet.js` + `validate-content-junk.js`，
全部 PASS/數字下降才推（推到 `antigravity/herb-fill-task3-round2` 這種獨立分支，不要推到 `main`，
並在這份文件或 commit message 寫一句「已推到 XXX 分支,等驗收」）。記得補 `PROJECT_LOG.md` 條目，
附改動前後的具體筆數。

**這輪不做的，明確排除（風險太高或需要 Ting 裁定，不歸你）**：
- **功效重新策展（138 張：63 張 0-1 條太少、75 張 >6 條像原始資料傾印）**——這個要決定「哪些該留哪些
  該砍」，砍錯就是刪掉重要內容，這輪先不做，等 Ting 定出篩選標準再開新任務。
- **性味寒溫或有毒/無毒自相矛盾（11 張）**——這是安全欄位互相打架，你只能**在 `PROJECT_LOG.md` 或
  這份文件裡列出是哪 11 張、矛盾在哪裡**，不要自己選一邊改掉，這個要人來裁決。
- **`related_formulas` 912 條/228 張卡指向的方劑組成不含本味**——這是「這個關聯的語意到底是什麼」的
  問題（可能是「常配伍」而非「組成裡有」），不是資料錯誤，交給 Ting 裁定，這輪不要自己刪或改。

## ✅ Task 2 收工（`4fa8e761`）——related_formulas/safety_source_url 已達可驗證資料的極限

第二輪只新增 1 筆（`herb.bi_yu_san` 補上 `formula.hao_qin_qing_dan_tang`，查證是一個「方中方」關係，
正確識別，不是誤填），`safety_source_url` 0 筆新增——你自己在 commit message 裡老實寫「盤點剩餘 96
筆缺口皆無公開可驗證網址，依規定嚴格保持留空」，沒有為了衝數字硬湊或編網址，這個判斷是對的。
`related_formulas` 87%、`safety_source_url` 74% 就是目前可驗證資料的天花板了，**這條線正式收工，
不用再回來看**。全部驗證器 PASS，`condition_tags_en` 等禁動欄位 0 異動，收下了。

---

## ✅ Task 4 收工（`a1c2d2de`）——39 張逐字核對帳本 0 落差，左歸飲誠實留空，沒有重犯

Round 2 改用現成的 `CONTRA_ALIGN_PROPOSALS_2026-08-19.json` 帳本重做，我**機器逐筆核對**（不是抽
查）：39 張卡的 `contraindications_zh`/`contraindications_en` 跟帳本的 `zh`/`en_proposed`
**逐字比對，0 筆不符**——完全照已審帳本套用，沒有自己改寫或新增。帳本裡另外 15 條現況跟帳本快照
不一致，你正確地跳過沒硬套。`formula.zuo_gui_yin`（左歸飲，上一輪虛構安全內容+假引用那張）這輪
`cautions_zh`/`contraindications_zh` 正確地維持空白——課件本身沒有這個欄位的來源，誠實留空，
不是為了衝優先度硬生內容。逐欄位比對確認除了 `contraindications_zh/en/field_sources` 三個欄位，
**其餘欄位 0 異動**。驗證器全 PASS。**收下，做法比原本要求的更嚴謹（直接核對已審帳本逐字套用，
不是自己重新翻譯判斷），Task 4 這條線正式收工，上一輪虛構+假引用的問題完全沒有重犯。**

---

## Task 5（第四優先，Task 3/4 收斂後再做）：方劑家族/關聯全庫擴充（board exam 高頻考點）

Ting 直接反映：血府逐瘀湯明明有 4 個同源姊妹方（膈下逐瘀湯/少腹逐瘀湯/身痛逐瘀湯/通竅活血湯，同屬
王清任《醫林改錯》，依身體部位分治）卻互相沒連結，查了發現這不是單一個案——**223 個方劑裡
`formula_family`（精確加減關係）只有 41 張有、`related_formulas`（泛用關聯）只有 113 張有**，
board exam 常考「方劑鑑別」「同名加減方辨證」，這塊覆蓋率明顯不足。血府逐瘀湯家族那 5 張我
（Claude）已經直接補上了，不用你做，這裡指派的是**全庫剩下的部分**。

**先看這支既有腳本，不要重新發明**：`scripts/apply-formula-family.js` 讀
`docs/research_packs/FORMULA_FAMILY_PROPOSALS_2026-08-19.json` 這種帳本格式（32 個基礎方、75 條，
`方剂学汇总` 640 表全掃出來的，每條 `change` 裡的劑量數字都逐字對得上來源 `evidence_quote`）——**這
32 個已經全部套用過了**，你要做的是照同樣的帳本格式（`relation`/`change`/`name_zh`/`evidence_quote`）
**產出下一批新帳本**，涵蓋 `formula_family` 目前還是空的其他方劑（優先找有明確經典加減關係的，
例如「XX湯加XX」「XX湯去XX加XX」這種命名慣例，或課件裡明確寫「本方為 XX 之加減」的）。

**做法**：
1. 掃 `curriculum/formulas/` 底下的 `方剂学汇总` 系列跟 `09_Formula_Cards_*` 系列，找還沒建
   `formula_family` 的方劑裡有沒有明確記載的加減方/姊妹方關係。
2. 產出新帳本 `docs/research_packs/FORMULA_FAMILY_PROPOSALS_<今天日期>.json`，格式完全比照舊帳本
   （`family_proposals` 陣列，每條 `base_formula_id` + `entries`，每個 entry 要有 `relation`
   （加/減/倍/合方）、`change`（逐味劑量變化，每個數字要能在 `evidence_quote` 裡逐字找到）、
   `name_zh`、`indication_zh`、`source`）。**查無明確加減關係的方劑就跳過，不要為了湊數編一個
   看起來合理的加減**。
3. 對於像血府逐瘀湯家族這種「同作者/同主題但不是嚴格加減關係」的姊妹方，用 `related_formulas`
   （不是 `formula_family`）互相連結，格式比照我剛才對逐瘀湯家族的修法：`Set` 併集加入，
   **絕對不刪除任一方現有的 `related_formulas` 內容**，附 `field_sources.related_formulas`
   引用具體來源（章節/頁碼/課件檔名，不要只寫「課件」兩個字）。
4. 帳本產出後**先跑 `node scripts/apply-formula-family.js`（dry-run，不加 `--apply`）**確認機器
   審計過關（formula_id 對得上、change 數字對得上來源），我看過帳本沒問題才會請你加 `--apply` 落庫，
   或你自己跑完 `--apply` 後照下面驗證跑完再推。

**做完驗證**：`build-data.js` + `validate-formula-standard.js` + `validate-formula-quality-strict.js` +
`check-validation-ratchet.js` + `validate-relations.js`，全部 PASS 才推（推到
`antigravity/formula-family-task5` 獨立分支，不要推到 `main`）。記得補 `PROJECT_LOG.md` 條目，
附這輪新增了幾個方劑家族/幾條關聯。

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
- Task 2 第一輪（`88dcdea6`）：`related_formulas` 293→314、`safety_source_url` 263→267。
- Task 2 第二輪（`4fa8e761`）：`related_formulas` 314→315、`safety_source_url` 不動,
  達可驗證資料極限,Task 2 這條線收工,詳見上面單獨一條。
- 王清任逐瘀湯家族 5 方互相連結（Claude 直接做,不是 antigravity）：`related_formulas` 純新增,
  詳見上面單獨一條;順帶發現全庫 `formula_family`/`related_formulas` 覆蓋率不足,開了 Task 5。

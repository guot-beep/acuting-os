# 獨立第三方架構審計 INDEPENDENT AUDIT — 2026-08-11

**Auditor**: 獨立 Fable 5 instance(未參與本系統任何建設,無立場包袱)
**受審 endpoint**: `origin/codex/pattern-v2` @ `bc8a7a4`(含 C2b FINAL GO 鏈 `7493d03`)
**方法**: 讀規則文件與三年藍圖 → 逐行走查 clinical 程式碼(app.js / js/clinical-store.js /
index.html / previsit.html)→ 親手抽樣 8 條知識線 30+ 筆記錄 → 自寫掃描器對照驗證器輸出 →
實跑 validate-content-junk / validate-formula-standard / check-validation-ratchet。
所有 file:line 與數字都是本審計當場親測,可重現。

---

## 執行判決(三句)

這個系統的**紀律基礎是真的**——D1–D17 的 one-way-door 分析、C2b 的八輪對抗審計、
skeleton 誠實標記,都經得起獨立檢驗,不是文件表演。但**嚴謹度分配嚴重不對稱**:
migration 路徑是堡壘,而每天要用的儲存寫入路徑、備份一致性、與 9/5 當天的實際看診
流程存在數個未被任何 gate 覆蓋的真缺陷——其中「pointer 切換後備份匯出凍結」與
「一 code 一 case 硬擋」兩項,會在開診第一個月直接傷到 Ting。三年藍圖的
「零新表、只需 R1–R4」結論過度自滿:它審的是 schema 形狀,漏掉的是 runtime 契約
與資料耐久性——這兩樣才是 90 天內最可能出事的地方。

---

## 維度一:架構健全度(6 層藍圖與 R1–R4)

**成立的部分**(親測確認,非轉述):

- 六層分層本身正確,「投影不建表」的原則有真實範例支撐:`getOutcomeHistory()`
  (js/clinical-store.js:189)確實已是 OutcomeSeries 投影;`derivePatientsFromCases()`
  (:238)確實是零持久化的 Patient 衍生層。
- Append-only 事件不是口號:`applyExposureChange()`(js/clinical-store.js:66)是唯一
  變更路徑、`exposureHistoryExtends()`(:122)逐 index 結構比對、import merge 走
  `findImportHistoryViolations()`(app.js:7973)。API 保證,不是 UI 紀律。
- 遷移鏈 fail-closed 品質高:`restoreV2Envelope()`(js/clinical-store.js:351)的
  cleanup-before-swap 順序、`verifyStagingObject()`(:441)的 plan 錨定 + 雙向
  referential lock,都對得上 R5–R8 審計紀錄裡的反例。

**incumbent 漏掉的(這是本審計最重要的一段)**:

1. **Pointer 切換後的 runtime 契約是空白**。app 的讀寫路徑
   `loadClinicalCases()`/`persistClinicalCases()`(app.js:1481/1500)**完全不看
   pointer**,永遠讀寫 v1 key;只有 export/import(app.js:7931/8004)看 pointer。
   後果:一旦按 FINAL GO 執行真機 pointer switch,之後每次看診寫入 v1,而
   `exportClinicalCases()` 匯出的是**凍結在遷移當天的 staging**(app.js:7933-7942),
   且 `markCasesBackedUp()`(app.js:7953)照樣重置備份提醒——**系統會一邊丟失
   新病歷的備份,一邊告訴 Ting「已備份」**。P4 checklist(AI_REVIEW_FEEDBACK.md
   §5)驗的全是遷移當下的資料等價,沒有任何一條測「切換後新寫一筆 → 匯出 →
   新筆在匯出檔裡」。R1–R4 四個保留點沒有一個碰到這裡。
2. **P4 checklist 第 5 節要求抽查「Patient picker」——但 app.js 裡不存在 patient
   picker**(全檔 grep 為零)。審計者假設了一個沒有的 UI。真機日這條驗收必然失敗
   或被跳過。
3. **儲存耐久性不在任何層**。`save()`(js/clinical-store.js:44)以 `null, 2`
   pretty-print 全陣列寫入 localStorage:體積約 ×1.5,而 localStorage 配額
   ~5–10MB、file:// origin 資料可被「清除瀏覽資料」一鍵抹除。藍圖把 SQLite 排在
   12–24m,對這中間 1–2 年真實病歷只靠手動匯出這件事無任何補強設計。
4. **寫入失敗無任何處理**。`persistClinicalCases()` 到 `localStorage.setItem` 全程
   無 try/catch:QuotaExceeded 或任何寫入例外時,in-memory 已更新、UI 顯示已存、
   dialog 不關、無錯誤訊息,重新整理即丟資料。與 migration 路徑的 fail-closed
   哲學完全相反——**同一個系統,兩種工程標準**。

R1(schemaVersion 顯式化)方向對但太小;R2/R3/R4 皆合理。四個保留點該是六個:
補「R5 pointer-switch runtime 契約」與「R6 儲存健康(配額監測+寫入驗證)」。

## 維度二:9/5 臨床就緒度(實際走查 day-one 流程)

以「新病人 → intake → SOAP → outcome → 回診」走真實程式碼:

- **新病人建 case**:`saveCaseFromForm`(app.js:7356)欄位齊全、D4 粗化正確
  (birthYearMonth→birthYear 降階)。**但 app.js:7424 硬擋同 patientCode 第二個
  case**(「這個 patient code 已存在,請改用不同代碼」)。回診病人帶第二主訴 =
  無法開第二個 case;alert 文案甚至**引導 Ting 鑄造假 code**——那會永久污染
  未來 patient 合併(patientId = sha256(patientCode),D1 不可逆)。C2b 遷移完成
  也不解此擋(UI 未改)。這是 day-one 功能缺陷,不是 nice-to-have。
- **SOAP 表單**(index.html:709-820):~40 個欄位 + 三組 repeatable rows。有做對的:
  primary/secondary pattern combobox 的 demote/promote 邏輯(app.js:7022-7039)、
  27 個 numeric metric 自動生成表單、週期欄位收合。但「上次就診」面板**明文
  reference only, never auto-filled**——而 DECISIONS.md 自己把「copy from last visit
  pre-fill」列為第二高 ROI UX。慢性病回診 Plan 段(用穴/方/手法/留針)幾乎全複述,
  9pm 逐字重打是 workflow abandonment 的標準配方。incumbent 自己的決策文件說要做,
  UI 卻反著做,且無任何決策紀錄解釋這個反轉。
- **Medication 連結違反 D15 自己的 gate**:`medicationPickerOptions()`(app.js:6993)
  只讀 `medications.records` = 12 筆 `med.*` staging 空殼(D15 原文:12/12
  contraindications 空),而 40 張全 SPL 轉錄的 `drug.*` 卡(pharmDrugs,
  build-data.js:147 已入 bundle)**在臨床 UI 完全不可選**。D15/D17 明定「遷移後
  新 Visit 不得產生新 med.* 引用」——現在的 picker 只能產生 med.* 引用。
- **表單 placeholder 教錯 id 格式**:index.html SOAP 表單 `westernConditionLinks`
  placeholder 是 `condition.pcos`(正典為 `cond.*`)、`easternDiseaseLinks` 是
  `disease.infertility`(正典 `tdis.*`)、`medicationLinks` 是 `med.letrozole`
  (正典 `drug.*`)。combobox 選的人沒事,手打的人存進去的是永遠 resolve 不到的
  死 id。
- **Pre-visit**:previsit.html 零依賴、不落地任何儲存的設計正確;但(a)入口
  至今未裁定(contract §5,距開診 <4 週),(b)病人手機 JSON → 診所電腦的傳輸
  通道未定義(QR 給誰掃?桌機無相機),(c)匯入用 `window.prompt()`
  (app.js:7706)單行輸入框貼多 KB JSON,勉強能用但很糟。
- **好的部分要記錄**:Visit Brief(app.js:6637)、泳道圖 D4 粗化空心點
  (app.js:6559-6621)、CARE readiness 的「AE 無列永不 ok」(app.js:6516)、備份
  nudge(app.js:1550)都是誠實且低調的好設計。`deleteCurrentCase`(app.js:7442)
  單一 confirm 即永久刪除整個 case 含全部 SOAP——對真病歷建議改 archive。

**判決:knowledge 查詢側可以開診;clinical 記錄側在修掉 case 擋、med picker、
寫入錯誤處理之前,是「能用但會受傷」。**

## 維度三:資料品質實查(親眼抽樣,不信 ledger)

抽樣 8 線 30+ 筆(formula.gui_zhi_tang / zuo_gui_wan / du_huo_ji_sheng_tang、
cond.pcos / hemochromatosis / cerebral_palsy、tdis.gan_mao / beng_lou / zi_zhong、
pattern.lung_qi_deficiency / tai_yang_cold_damage、sym.headache / hot_flash /
wasting、supp.vitamin_d3 / asian_ginseng、drug.enoxaparin / disulfiram 等):

- **內容層品質真實地好**。tdis.gan_mao 的 pathomechanism 甚至誠實註明「氣虛感冒
  等證型 id 詞彙表暫未收錄」;cond.hemochromatosis red_flags 帶結構化
  urgency/action/source;drug.enoxaparin boxed warning 是真 SPL 轉錄;skeleton
  記錄(cond.cerebral_palsy 8/10 欄)誠實標 skeleton 不裝滿。抽樣範圍內
  **無假中文、無樣板內容層**。ledger 的自我報告在抽樣範圍內與實物相符。
- **但驗證器抓不到的東西確實存在,親測三項**:
  1. **U+FFFD mojibake 活在正典方劑檔**:formulas.json:40475(「黃芪��藥物」)、
     :57625(「由於��舌為心之苗」),共 4 個 replacement char;
     `validate-content-junk` 對此 **PASS**(它只掃 scraped header tokens)。
     herb_canon_shortlist.json:17904 另有一個西里爾字母 ф 混入。sym.headache 的
     головache 靠眼睛抓到了,同類損傷在方劑線還躺著。
  2. **Boilerplate 劑量穿著來源外衣**:163 筆方劑引 sunten.com.tw,其中 **58 筆
     劑量句 byte-identical 為「6.0g～12.0g」**。58 個不同方劑共用同一劑量範圍,
     這是憲法紅線 6(樣板句)與紅線 4(劑量必須具名來源)之間的灰色地帶——
     有 URL、但不是 per-formula 事實。驗證器視為已填。
  3. formula 線 10 個 blocking defect 是誠實記帳(F6 截斷、F12 斷鏈),與
     handoff #18 宣稱一致——此處 ledger 沒有撒謊。
- ratchet PASS 的語意要看清:它保證「不變差」,不保證「好」。cond 線 blocking
  425 全是既有債,數字誠實,但 425 是 425。

## 維度四:90 天風險登記(依傷害機率 × 不可逆度排序)

1. **備份凍結陷阱(pointer switch 後)** — 若按 FINAL GO 執行 C2b 而不先修
   runtime 契約,之後每筆新病歷都不在匯出備份裡,且系統宣稱已備份。瀏覽器資料
   一旦出事 = 遷移日之後全部真病歷無備份。證據見維度一第 1 點。
2. **localStorage 單副本 + 手動備份**:真病歷唯一副本住在一個 Edge profile 的
   file:// origin 裡,「清除瀏覽資料」、profile 損毀、Windows 重設都是全損事件;
   防線只有 7 天 banner 和每 10 次存檔的 confirm。DECISIONS sequencing 明文要求
   「開診前一個假期完成 SQLite + daily backup rotation」——沒有發生,藍圖改口
   12–24m,無決策紀錄。
3. **假 patient code 鑄造**:一 code 一 case 硬擋(app.js:7424)+ 回診病人第二
   主訴 = Ting 被迫發明 P-2026-001b 之類的代碼;patientId 是 code 的 hash,污染
   不可逆。發生機率:開診第一個月接近必然。
4. **Workflow abandonment**:40 欄 SOAP、Plan 段無 copy-forward、metric 要逐格填。
   MBC 文獻(incumbent 自引)的第一死因就是記錄負擔。一旦 Ting 開始「今天先不
   記,週末補」,整個 learning loop 的資料源就斷了。
5. **Branch 拓撲**:main 落後 codex/pattern-v2 **202 commits** 且互有分叉
   (ca2c45b 只在 main)。這個 repo 有被洗掉兩次的前科 + 「merges clobber
   knowledge.js」的已知模式;全部臨床系統住在未落地的長壽分支上,一次錯誤合併
   或一個照舊規則 push HEAD:main 的 agent 就是第三次事故。

(次級:med picker 空殼卡在臨床畫面被引用 → 錯誤安全資訊面;mojibake 已在
正典檔;previsit 入口 4 週內未定。)

## 維度五:多 agent 生產系統批判

- **C2b 審計迴圈不是表演,這點必須還它公道**:R5 抓到 UI import 繞過 verify
  (app.js:7500 當時直寫 staging)、R6 抓到 unhandled rejection、R7 抓到 cleanup
  吞錯回 ok:true(js/clinical-store.js:356 當時)、R8 才放行——四輪每輪都是
  真 bug,對應修正都在現行程式碼裡查得到。獨立反例注入 + endpoint blob 鎖定
  是業界水準的對抗審計。
- **但嚴謹度是點狀的,不是面狀的**:同一時期,沒有任何 gate 看過
  `persistClinicalCases` 的裸 setItem、med picker 的 D15 違規、或 index.html 的
  死 placeholder。審計火力全部打在「Codex 被指到的那個點」,沒有人負責掃射面。
- **單點故障 = Fable 整合位**:所有合併、所有跨線裁決、所有 handoff 都經一個
  角色;SOL/Codex/Sonnet 互不直接通訊,靠 Ting 在多個 chat app 之間人肉搬運。
  CR-010 撞號事件(AI_WORK_HANDOFF #18)已示範這個通道會出錯——修法(repo 為
  唯一 CR 註冊處)是對的,但同構風險仍在:**規則住在 repo,狀態住在對話裡**。
- **眼讀紀律真實但不可規模化**:головache 是眼睛抓的,4 個 U+FFFD 就漏了。
  應該機器化的(encoding 掃描)還在靠眼睛,這與「rules diet: 機器強制優先」的
  自我認知矛盾。
- 每小時 SOL 審查 + 每批 Codex 覆核 + 三份 ledger 的 ceremony,對一個單人使用的
  系統是重稅。C2b 值得;對 20 筆 symptom 卡的批次,值得懷疑。

## 維度六:該停止的過度投資

1. **停止繼續加固 C2b**。八輪夠了,FINAL GO 已發;現在每多一輪 R9 的邊際價值
   趨零,而真正的洞(切換後 runtime)不在它的鏡頭裡。
2. **停止在 0 真實病例時打磨發表管線**。CARE readiness 徽章、CHM-CARE 61 項對映、
   CR-013 逐項驗證——全部在服務一篇 2027 年才可能存在的 case report。9/5 前這些
   工時應全數轉去 day-one 流程缺陷。
3. **暫停 cond 骨架繼續衝量(505→2000)**。骨架無上限是 Ting 的裁定,尊重;但
   90 天內病例掛得上的索引 505 已綽綽有餘,增量骨架的邊際效益遠低於清 425 筆
   既有 blocking 債或 300 detail。
4. **降低低風險內容批次的審查 ceremony**。skeleton 批次走 validator + ratchet
   即可,不需要 per-batch 人工往返;把 SOL/Codex 火力留給安全欄位與臨床層。
5. **停止用眼睛做 encoding QA**——一小時把 U+FFFD/西里爾/希臘字掃描加進
   validate-content-junk,永久退役這項眼力活。

---

## TOP-10 修正清單(優先序;分工按 model-routing:Fable 設計/路由,Sonnet 實作定案設計,Codex 覆核高風險)

| # | 修正 | 為什麼 | 工作量 | 誰 |
|---|---|---|---|---|
| 1 | **C2b 真機日前先裁定 pointer-switch runtime 契約**:最簡方案 = 不切 pointer(patients 留作衍生視圖,遷移演練照做但 pointer 留 v1),直到 v2 成為真實讀寫路徑;或 persist 時同步刷新 staging.cases | 堵掉備份凍結陷阱(風險 #1);目前 FINAL GO 授權的操作會製造它 | 決策 0.5 天 + patch 半天 | Fable 決策 → Sonnet;Codex 一輪覆核 |
| 2 | **放開一 code 一 case 硬擋**(app.js:7424):同 code 二 case 改為 confirm + 沿用既有 demographics | 風險 #3;開診第一個月必撞;D5 本來就定一 patient 多 case | 半天(含 derivePatients 迴歸測試) | Sonnet |
| 3 | **persistClinicalCases 寫入防護**:try/catch + 讀回驗證 + 失敗時醒目警示並觸發即時匯出;QuotaExceeded 專屬訊息 | 日常寫入路徑目前是全系統唯一裸奔的地方 | 半天 | Sonnet |
| 4 | **Plan 段 copy-from-last-visit**(點選帶入用穴/方/手法/留針,帶入後仍可改) | DECISIONS 自列最高 ROI;直接對抗 abandonment(風險 #4) | 1 天 | Fable 契約 → Sonnet |
| 5 | **med picker 換 drug.***:讀 pharmDrugs(40 卡),med.* 僅作 legacy 顯示;同步修 index.html 三處死 placeholder(cond.*/tdis.*/drug.*) | D15/D17 的 gate 現在被自家 UI 違反;12 筆空殼卡是錯誤安全資訊面 | 半天 | Sonnet |
| 6 | **encoding 掃描進 validate-content-junk**(U+FFFD、西里爾、希臘、� escape)+ 修 formulas.json:40475/:57625 兩處 | 眼讀教訓機器化;現有 4 個活損傷 | 0.5 天 | Sonnet(修字請 Ting 或查 curriculum 確認原文) |
| 7 | **previsit 入口裁定 + prompt() 換 dialog+textarea**;定義病人→診所的傳輸通道(建議:診所平板同 LAN 直開 file,或 workers.dev + 手輸短碼) | 距 9/5 <4 週,P1 標「已落地」但實際不可用 | 決策 + 1 天 | Ting 裁定入口;Sonnet 實作 |
| 8 | **branch 收斂**:codex/pattern-v2 → main 一次性落地(cherry-pick ca2c45b 先),之後回到短分支節奏 | 風險 #5;202 commits 未落地 + 前科兩次 | 半天(需 Ting 在場按 knowledge.js diff 紀律) | Fable + Ting |
| 9 | **Sunten 58 筆同劑量句降級**:標為 vendor-generic 參考(單一 config 註記),不再算 per-formula 已填劑量;逐方真實劑量走 curriculum 補 | 紅線 4/6 的灰色地帶;現在是「看起來有劑量」 | 1 天腳本 + 內容批次另計 | Fable 裁定 → 內容線 |
| 10 | **備份自動化**:每日自動匯出輪替(File System Access API 或啟動時自動下載)取代 confirm nudge;與 Ting 做一次真實 restore 演練 | 風險 #2;手動備份紀律撐不了三年 | 1–2 天 | Fable 設計 → Sonnet |

9/5 前必做:#1 #2 #3 #5 #7(合計 ≈ 4 個工作天)。#4 #6 #8 強烈建議。#9 #10 可到 9 月中。

## 與 incumbent 藍圖的明確 DISAGREEMENTS

1. **「最大風險是 over-engineering」——不對。** 最大風險是工程火力錯置:migration
   八輪審計的同時,日常寫入零防護、備份契約有洞。正確的結論不是「別再蓋」,
   而是「把蓋城牆的人調去修水管」。
2. **SQLite 12–24m 是對 DECISIONS 的無聲毀約。** DECISIONS sequencing 白紙黑字:
   「One semester before clinic: localStorage → SQLite…deadline is the vacation
   BEFORE clinic, not day-one of clinic」+ daily backup rotation。藍圖改成
   「12-24m,病例量或多裝置需求出現」,無任何決策紀錄承認這個反轉。可以晚,
   但要誠實記帳,且晚的代價(風險 #2)要有補償控制(#10)。
3. **「八個接口全靠投影/既有紀律,零今日動作」少算了兩個**:pointer-switch
   runtime 契約與 storage health 不在八個接口裡,也不在 R1–R4 裡,而它們比
   EvidenceClaim 或 CohortQuery 早三年出事。
4. **「P1 診前手機頁已落地」是紙面落地**:入口未定、傳輸通道未定、匯入 UI 是
   prompt()。落地的定義應該是「一個真病人能走完」。
5. **P4 checklist 引用不存在的 UI**(Patient picker)——顯示 FINAL GO 鏈驗證的
   是 store 層,對 app 層的想像未經對照。不影響遷移資料安全,但影響「FINAL GO」
   四個字給人的完成度錯覺。

---

## 第三方結論給 Ting

我是外面請來、沒有參與蓋這棟房子的審計者。看完的結論:

1. 你們的地基是真材實料——規則有人遵守、審計抓到真問題、內容抽查沒有造假。
2. 但現在最危險的不是地基,是三個日常會踩到的洞:
   病歷搬家(C2b)之後備份會悄悄不含新病歷;
   老病人回來看第二個病,系統不讓開新病歷,會逼你發明假代碼;
   存檔失敗時系統不會告訴你,畫面看起來存了,其實沒有。
3. 這三個洞加上「入口還沒定的診前頁」,修完大約四個工作天。
   **開診前只求這四天,其他都可以等。**
4. C2b 真機搬家先不要按下去,等第 1 項修完再搬。
5. 病歷只存在瀏覽器裡,等於全部家當放在一個抽屜。九月內請把
   「每天自動備份」做起來,並真的演練一次還原。
6. 內容庫可以放心用來念書;方劑劑量那格有 58 筆是通用值不是專方值,
   開藥時以課本為準。
7. 發表工具、骨架衝量、更多審計輪次——都是好東西,但都排在看診順手之後。

---

*本文件為唯一交付物;分支 `codex/independent-audit`,未推送。所有數字可用
文中指令與 file:line 重現。*

# Dry Clinic Log — End-to-End 演練紀錄

Status: **IN PROGRESS**(Fable 親跑,2026-08-11 起,Ting 指派)
動線:新病人 → intake → SOAP(針+藥)→ AVS → 診前頁往返 → 回診第二主訴(多 case)
→ 病人縱貫頁核對總帳 → export/restore 演練 → 月審。
每個摩擦點分級:**[9/5 前必修]** / **[可後補]** / **[僅開發環境]**。

環境:localhost:8361(dev server),v1 store(pointer 未切換),QA store 33 案起跑,
以 `DRY-2026-001` 前綴建立演練病人,不清庫(貼近「新病人進入已有資料的系統」)。

---

## Step 1:新病人 intake(新增病例)— 完成 ✅

53 欄 intake 表單(含 demographics、過敏、用藥、月經史、種族、主訴、現病史、
先前治療、既往史、三個知識庫 picker、safety flags、goals、summary)全數走過,
儲存成功(33→34 案),知識連結正確落地:`cond.insomnia` / `tdis.bu_mei` /
`pattern.liver_depression_transforming_fire`。

### 摩擦點

1. **[可後補] link-picker 無障礙缺失**:選項是純 `<div class="link-picker-option">`,
   無 ARIA role/listbox 語意 → 輔助技術(含自動化)完全看不到選項。
2. **[9/5 前必修] link-picker 無鍵盤操作**:輸入後按 Enter 不會選取第一個選項,
   無上下鍵導航。臨床打字流會被迫每個診斷都伸手拿滑鼠;每診多花數十秒。
   建議:Enter 選第一項、↑↓ 移動、Esc 關閉。
3. **[9/5 前必修] safetyFlags 天真逗號切分**:輸入
   「偶服 lorazepam(鎮靜劑,注意電針/放鬆反應疊加);青黴素過敏」被存成兩條破碎旗標
   `偶服 lorazepam(鎮靜劑` / `注意電針/放鬆反應疊加);青黴素過敏`。
   安全旗標是要在治療前一眼掃的東西,破碎=誤讀風險。
   建議:只以分號/換行切分,或至少括號內逗號不切。
4. **[可後補] 對話框超長無分區導航**:caseDialog 內容高 5246px(SOAP 8477px),
   一路捲到底。建議側欄錨點或分段摺疊(基本資料/病史/診斷/安全)。

## Step 2:SOAP(針+藥)— 第一次嘗試被重載摧毀,重打完成 ✅(見 #6)

60 欄 SOAP。已驗證:主證型 picker 單選肝鬱化火 OK;穴位 picker 含經外奇穴
(安眠 EX-HN16 找得到)+ 7 穴連結 OK;方劑 picker 加味逍遙散 OK;
數值 metric 欄位(sleep_hours/stress/mood/energy/sleep_quality/sleep_onset_minutes/
night_wakings/pain_score)可填。

### 摩擦點

5. **[9/5 前必修] drug.* 收藏與臨床頻率脫節**:40 張藥卡是藥理課清單
   (利尿劑/抗凝/心血管/抗癲癇為主)。失眠病人的 lorazepam 查無此藥;
   **fertility 工作流自己指名的 letrozole / clomiphene / metformin / progesterone
   全部沒有卡**。Zolpidem、SSRI、NSAID、PPI 也全缺。
   建議:按「Ting 診所高頻處方」補一批 20-30 卡(生殖 + 睡眠/情緒 + 止痛 + 消化),
   沿用 DailyMed SPL 轉錄管線。
6. **[9/5 前必修] 表單無草稿保護**:SOAP 填到一半頁面被重載(dev server 重啟觸發),
   整份 60 欄未存資料歸零。真診所對應情境:誤按 F5 / 瀏覽器崩潰 / 分頁誤關
   / 電腦休眠 → 最多半小時病歷白打。
   建議:對話框 input 事件節流寫入 `localStorage` 草稿(per case+visit),
   重開對話框時偵測草稿並提示還原;儲存成功後清除。
7. **[9/5 前必修+寫入遷移文件] localhost ≠ 127.0.0.1 = 兩個病人資料庫**:
   同一台機器、同一個 app,`localhost:8361` 與 `127.0.0.1:8361` 的 localStorage
   互不相通,無任何警示。真機情境:Ting 若某天用 127.0.0.1(或書籤不同)開診,
   會看到「病人全部消失」的假象,或更糟——在兩邊各記一半。
   C2b 遷移契約同樣 per-origin,pointer 也會分裂。
   建議:app 啟動時偵測 hostname 非 canonical(如非 localhost)就顯著橫幅警告;
   真機部署文件明定唯一入口 URL(含書籤設定步驟)。
8. **[僅開發環境] visit date 預設值時區偏移**:今天 08-11,date 欄預設 08-12
   (UTC 換日)。若真機時區設定正確可能不重現,但建議用本地日期 API 產生預設值。
   (與 #7 一樣屬「環境陷阱」類,真機驗收清單應包含日期欄 spot-check。)

## 事故報告:store 毀損與救回(2026-08-11,演練中真實發生)

**經過**:W1 實作 agent 在共用瀏覽器面板驗證 UI 時,分頁被面板靜默重指回
live origin(localhost:8361),其種子腳本 `fetch('/tmp-qa-seed.json')` 在
live origin 上 404,而腳本**先 setItem 後驗證**,把字串 `"not found"` 直接寫進
`acuting-clinical-cases-v1` —— 34 案(33 QA + DRY)瞬間全毀。

**救回**:一個毀損前載入的分頁還活著,記憶體內仍有完整 state。攔截
`URL.createObjectURL` + 觸發 app 自己的「匯出病例」,從記憶體取回 139,885
字元完整 JSON,以 v1 格式(裸陣列 pretty-print)回寫,重載驗證 34 案復原。

**教訓(全部進規則/工程)**:
9. **[9/5 前必修] v1 load() fails-soft 是資料毀滅鏈**(js/clinical-store.js:102-107):
   corrupt store → 靜默回傳 `[]` → app 顯示 0 cases(無警示、無鎖)→
   下一次任何存檔把可救回的位元組永久蓋掉。v2 路徑 fail-loud(readStagingEnvelopeOrThrow),
   v1 必須同等:「不存在→[]」與「存在但壞→丟錯+唯讀鎖」要分開。
   今天能救回純屬僥倖(恰有未重載分頁)。→ 待 W1 合併後由 Fable 修
   (同檔案,避免衝突)。
10. **[規則] agent 瀏覽器紀律**:共用面板的分頁 origin 會被其他 session 改變;
    任何 localStorage 寫入前必須同一個腳本內重驗 `location.origin`,
    且**先驗證 payload 再 setItem**(fetch 404 body 直接入庫就是這次的肇因)。
    Agent 驗證一律用自己 port 的隔離 server。
11. **[價值確認] 匯出即保險**:救援路徑=app 自己的匯出功能。真診所版的
    「立即匯出」每日習慣 + 自動備份(acuting-backup-meta-v1 已有雛形)
    是最後防線,遷移文件應把「開診前先匯出」寫成 SOP。

## 系統性觀察(非單一摩擦)

- **知識連結體驗是這個 OS 的靈魂,目前資料面 > 介面面**:picker 找得到
  cond/tdis/pattern/formula/acupoint(含奇穴)——供給已經到位;
  但鍵盤流(#2)與藥卡覆蓋(#5)讓「每診 30 秒內完成連結」尚未成立。
- **「貼上診前資料」按鈕已在 SOAP 對話框內**(previsit 往返的接點),Step 4 測。

## Step 3:AVS 產生 — 完成 ✅(v3 WIP 版)

用 DRY 病例真實 SOAP 跑 `scripts/generate-avs.js`(當時工作樹為 AVS v3 半成品,
其後已落 commit「AVS Phase E」)。**命中**:拔罐+針灸 aftercare 自動觸發、
壓力→放鬆建議、紅旗段、追蹤指標自我觀察、頁尾免責、零 patientCode/診斷碼。

12. **[9/5 前必修] followUp 全文直印進病人文件**:SOAP followUp 寫的內部推理
    「若入睡持續 >60 分鐘,考慮加梔子豉湯思路或調整穴方」原封不動印給病人
    (含方名=專有名詞,且洩漏「若無效就改方」的內部判斷)。
    建議:AVS 只取回診日期/病人指示,臨床 planning 另欄或過濾。
13. **[9/5 前必修→AVS v3 owner] 中藥服用指示段消失**:case 有加味逍遙散
    (formulaHerbs+formulaLinks 俱在),v3 當時版本沒有渲染服藥指示段
    (Ting 明點的需求)。請 AVS v3 線在 Phase E 之後驗證此段回歸。

## Step 4:診前頁往返 — 完成 ✅

previsit.html 填寫→產生 acuting-previsit-v1 payload→SOAP「貼上診前資料」:
指標正確預填(pain 4/sleep 6.5/PGIC 2)、主觀敘述帶〔診前自填〕前綴合併。
- **[可後補]** 匯入用 `prompt()`:真機可用,但無法貼多行預覽、headless 不可測,
  建議改 dialog+textarea。
- 診前 payload 的 patientPerspective 欄位未見落入 SOAP 對應欄(待查對映)。

## Step 5:多 case — 完成 ✅

同碼開第二主訴(經前頭痛):多 case 確認框正確跳出
(「此代碼已有 1 筆病例…要為同一位病人開新病例嗎?」),35 案、DRY 佔 2。

## 回診 SOAP #2 + Outcome Tracking 實戰 — 完成 ✅

診前資料匯入後補齊 S/O/A/P、換穴(去 GB21 加 PC6)、判定 improved。
**Outcome 面板(CG8 v1)實戰通過**:疼痛 6→4↓、睡眠 5.5→6.5↑、壓力 8→6↓、
情緒 4→6↑、入睡 75→40↓、夜醒 3→2↓、PGIC 2,增好/減好方向箭頭全對。

14. **[9/5 前必修] 存檔靜默失敗無錯誤提示**:night_wakings 填 1.5(病人說
    「夜醒 1-2 次」很自然會填 1.5)被 step=1 擋下,但**畫面無任何錯誤訊息**,
    按儲存就是沒反應。臨床下最危險的 UX:以為存了其實沒存。
    建議:儲存失敗時捲動到第一個 invalid 欄位+紅框+訊息條。
15. **[可後補] Outcome 面板標籤印出整段內部語意註解**(「與 stress_level 分開:
    壓力是外在負荷…」),應該用短標籤。

## Step 6:病人縱貫頁(W1)— 完成 ✅

W1 合併後以真 store(34 病人/35 案)實測:病人列表排序正確(DRY 最近就診
2026-08-14 置頂、2 cases、9 metrics)、縱貫頁頭卡(consent 未詢問)、
Case 清單帶 readiness 徽章(63%/11%)、跨 case 警訊聚合(2 條,原樣呈現
包括 #3 的破碎旗標 —— 正確不代為判斷)、用藥總帳、PHI 紀律句。31/31+60/60 未動。

16. **[9/5 前必修] currentMeds 自由文字不入用藥總帳**:intake 只有 currentMeds
    文字欄,結構化 agentExposures 要在別處另填 → 縱貫頁總帳顯示「0 agents」
    而病人實際服 lorazepam+魚油。安全價值最高的視圖低報用藥。
    建議:intake 加結構化用藥列,或總帳附註顯示各 case currentMeds 原文。

## Step 7:export / restore — 完成 ✅

匯出 35 案(148,921 字元)。壞 payload(非陣列)→ 大聲拒絕+庫零變動;
完整匯出 merge 回灌 → 冪等(35→35)。匯入雙模式(merge 安全預設/restore
災難復原+自動備份)+ append-only 歷史防護符合設計。

## Step 8:月審 — 完成 ✅

`practice-audit.js`:病人/就診/outcome 完成率/常用穴方證型/知識缺口,全部渲染。
`evidence-debt.js`:正確算出 formula.jia_wei_xiao_yao_san 缺 modifications_zh
的研究債分數。兩者輸出去識別化(ids only)。

## 修復狀態(2026-08-11 當日)

- ✅ **#9 v1 fail-loud**:R15 落地(rehearsal 65/65),corrupt store 鎖唯讀、raw bytes 保留,瀏覽器實證。
- ✅ **#6 草稿保護**:case/SOAP 對話框節流草稿 + 還原/捨棄橫幅,重載實測還原成功。
- ✅ **#14 存檔靜默失敗**:可見錯誤列+紅框+捲動+輸入即清除(初版有 fieldset 選擇器 bug,實測抓到後修正)。
- ✅ **#3 safetyFlags 切分**:改分號/換行,括號內逗號保留,實測通過。
- ✅ **#15 metric 長標籤**:CG8 表格+glance 卡+visit-brief 差值列三處全改短標籤(後兩處是實測追出來的)。
- ✅ **#2 picker 鍵盤流**:↑↓ 環繞導航、Enter 選取(無高亮取第一項)、Esc 只關選單不關對話框,活庫實測;附帶 #1 的 ARIA(combobox/listbox/option)。
- ✅ **#16 用藥總帳低報**:縱貫頁+case 詳情總帳新增「未結構化(intake 原文)」區,DRY 病例的 lorazepam+魚油現身,活庫實測。
- ✅ **#5 藥卡批**:19 卡落地(40→59):生殖 5(letrozole/clomiphene/metformin/
  progesterone/estradiol)+ 睡眠情緒 6 + 止痛 5 + 消化 3,全部 DailyMed
  verified_exact,off-label 誠實標註(生殖藥標籤禁忌孕婦=核准適應症的人為產物,
  已文件化防誤讀);新增 2 個 drugsystem + 15 class + 9 target 待 Ting 過目
  (各帶 note_zh);dry-clinic 演練用的 lorazepam 現在查得到了。
- ✅ **#7 origin 警示**:127.0.0.1 開啟即紅色警示橫幅(兩 origin 實測),
  DEPLOY_CLOUDFLARE.md 加「單一入口網址+開診前先匯出」SOP。
- ✅ **#8 日期時區**:visit/start date 預設改本地日曆日(localDateISO),
  晚診不再預設成明天;實測於本地 08-11 晚(UTC 已 08-12)顯示正確。
- ✅ **#12 followUp 洩漏**(2026-08-25 修:`buildDraftSnapshot` 不再自動把
  `note.followUp` 帶進 `followUpSnapshot`——那格是醫師寫給自己看的臨床規劃
  文字,舊版直接照印給病人,含方名與「若無效就改方」的內部判斷。改成草稿
  一律空白起手,逼醫師自己打一句病人看得懂的話;結帳畫面該欄位旁加了
  ⚠ 警示文字。`scripts/test-avs-checkout.js` 新增迴歸鎖定斷言。**同日補第二處**:
  `scripts/generate-avs.js`(CLI v1)自己組 HTML、不經過 `AVS.renderPatientHtml`,
  是獨立程式碼路徑,原本也直讀 `note.followUp`,同一個洩漏、當時漏修。改讀
  `note.avsFollowUp`,與同檔其餘 `avs*` 慣例一致;新增子行程回歸鎖(真的跑一次
  CLI,不只測函式),已驗證還原修法會讓新斷言失敗、確認不是空跑。)
- ✅ **#13 中藥服用指示段**(2026-08-27 正式關閉):用當初的加味逍遙散 repro
  (formulaHerbs+formulaLinks 俱在)打到端產物層——`renderPatientHtml` 含
  「調理品怎麼吃」段+方名、`renderPatientText` 同;含反向鎖(沒開中藥不得
  無中生有)。鎖進 `scripts/test-avs-checkout.js`(118/118),不是跑一次就走。
- ⏳ 未正式關閉:#4 對話框分區導航(可後補;9/01 凍結前若無時間即進 backlog)。
  **9/2 必修清單全數關閉。**

## 結論(給 Ting 的排序建議)

9/5 前必修(依風險排序):**#9 v1 fail-loud**(資料毀滅鏈,Fable 接手)>
**#6 表單草稿保護**(半小時病歷白打)> **#14 存檔靜默失敗**(以為存了沒存)>
**#3 safetyFlags 切分**(安全旗標破碎)> **#12 followUp 洩漏**(病人文件)>
**#16 用藥總帳低報** > **#5 藥卡臨床頻率補批** > **#2 picker 鍵盤流** >
**#7 canonical origin 警示**(寫入真機部署 SOP)。
其餘(#1/#4/#8/#13/#15/prompt())可後補。整體判斷:**核心動線(建案→SOAP→
診前→AVS→多 case→縱貫→匯出還原→月審)全部走得通**,9/5 開診阻塞點
都是可修的 UX/防護層,不是架構問題。

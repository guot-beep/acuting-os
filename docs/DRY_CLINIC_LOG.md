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

## 系統性觀察(非單一摩擦)

- **知識連結體驗是這個 OS 的靈魂,目前資料面 > 介面面**:picker 找得到
  cond/tdis/pattern/formula/acupoint(含奇穴)——供給已經到位;
  但鍵盤流(#2)與藥卡覆蓋(#5)讓「每診 30 秒內完成連結」尚未成立。
- **「貼上診前資料」按鈕已在 SOAP 對話框內**(previsit 往返的接點),Step 4 測。

## 待跑

- [ ] Step 3:AVS 產生(用 DRY-2026-001 的實際 SOAP)
- [ ] Step 4:診前頁往返(previsit.html → 貼上診前資料)
- [ ] Step 5:回診 SOAP #2 + 第二主訴(多 case 同 patientCode)
- [ ] Step 6:病人縱貫頁核對總帳(等 W1 合併)
- [ ] Step 7:export / restore 演練(v1 匯出→匯入)
- [ ] Step 8:月審(practice-audit / evidence-debt)

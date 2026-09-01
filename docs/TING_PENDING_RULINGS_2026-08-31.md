# 待 Ting 裁定 — 2026-08-31 累積

每一條都寫成「選項 + 我的建議 + 不裁定的後果」,妳回一個字母就行。
**沒有一條是急的**;開診那兩天可以完全不看這份。

---

## A 群:安全層的可查詢性(這批新出現的)

背景:`safety_flags` 是安全層的**結構化索引**,用來回答「哪些藥孕婦禁用 /
有腎毒性 / 在十八反名單」。全庫 915 次使用有 414 次不在受控詞彙裡,
Sonnet 正在收斂。收斂過程中撞出下面這幾條需要妳定。

### A1 · 防己與漢防己的馬兜鈴酸標記(**安全相關,建議優先**)

兩張卡現在都掛著 `aristolochic_acid_risk`,但**它們卡上的文字是在警告
「避免馬兜鈴酸來源/品種」,不是說自己含**。防己(粉防己 Stephania)與
漢防己是安全品種;含馬兜鈴酸的是廣防己、木防己那一類。

同一個問題我已經在木通/川木通擋下來了(SOL 的 A2 裁定包明文寫:
不可把關木通的毒性寫成正品木通的固有屬性)。但防己這兩張是**既有標記**,
不在這批範圍,不該順手改。

- **(a) 改成 `species_confusion_aristolochic`**(=會被含馬兜鈴酸的品種冒充)
  ← **我建議這個**,與木通/川木通一致,而且符合卡上文字
- (b) 維持 `aristolochic_acid_risk` 不動
- (c) 兩個都掛

不裁定的後果:「查哪些藥有馬兜鈴酸風險」會撈到兩味安全的藥,
而真正該撈到的青木香剛被撤下。方向相反的答案比查不到糟。

### A2 · 器官專一的毒性要不要各自立 slug

`cardiotoxicity`、`neurotoxicity`、`arrhythmia_risk`、
`pseudoaldosteronism_long_term`、`liver_injury_high_dose_caution` 現在都是
未登記值。壓進通用的 `toxicity_review` 就問不出「哪些藥有心臟毒性」——
而附子那組正是烏頭鹼的心臟毒性。

- **(a) 各自立 slug**(心臟毒性 / 神經毒性 / 肝損傷…)← 我建議
- (b) 全部併進 `toxicity_review`,器官細節留散文
- (c) 先原狀不動

### A3 · 「氣虛」「血虛」沒有對應 slug

詞彙表有陰虛(本批要新增)、寒證、熱象、痰證,但沒有氣虛與血虛。
現在有 6 個值卡在這裡(`qi_deficiency_caution`、
`blood_deficiency_contraindication`、`qi_blood_deficiency_caution`…)。

- (a) 立 `qi_deficiency_review` + `blood_deficiency_review`
- (b) 血虛併進陰虛(**我不建議** —— 陰虛≠血虛,併了就分不開)
- (c) 原狀不動

### A4 · 稽核註記該不該待在 safety_flags

這些值不是臨床禁忌,是資料維運紀錄:
`no_strict_contraindication_found`(查無明確禁忌)、
`cloudtcm_exact_page_missing`、`american_dragon_not_verified`、
`legacy_alias_record_exists`、`not_a_canonical_materia_medica_entry`
(白酒/金箔/粳米那類「這不是正式藥材」)。

- **(a) 搬到獨立的稽核欄位**,safety_flags 只放臨床安全 ← 我建議
- (b) 留著,反正渲染器會照印
- (c) 原狀不動

放著的後果:任何「這味藥有幾個安全旗標」的統計都會被稽核註記灌水。

### A5 · 明顯放錯欄位的兩筆

`hot_acrid`(那是性味:熱、辛)、`emergency_formula`(那是方劑用途:急救方)。
搬走是內容決定,所以問妳。

- **(a) 搬到正確欄位**,原值進 `import_artifacts` ← 我建議
- (b) 留著

### A6 · 「管制藥品」要不要專屬 slug

罌粟殼現在的旗標是一句自由中文「管制藥品:含嗎啡類生物鹼」。
Sonnet 建議改成 `toxicity_review` + `not_for_self_treatment`。
但「這是管制藥品」是**法規身分**,和毒性、和不宜自行使用都不是同一件事。

- (a) 立 `controlled_substance` slug
- **(b) 照 Sonnet 的建議,用既有兩個 slug** ← 我建議(全庫只有一張卡,
  為一張卡立 slug 不划算;真的需要時再立)

---

## A+ · 開診前的兩個操作提醒(不用裁定,但要知道)

### 兩個分頁的問題已經修好了(2026-09-01)

先前:同一台機器開兩個分頁(一頁查方劑、一頁寫病歷),**後存的那頁會靜默
洗掉前一頁的病例** —— 存檔還回傳成功,畫面上看不出來。我實測重現後修好了。

現在的行為:第二個分頁存檔時會被擋下,跳出「拒絕寫入」的警告,而且
**那一頁的內容會自動備份**到 `acuting-clinical-conflict-backup`,一個字都不會丟。
照警告裡的指示做(先在另一頁匯出備份,再重新載入本頁)就好。

**還是建議只開一個分頁寫病歷。** 修好的是「不再靜默遺失」,不是「兩頁可以同時寫」。

### 離線:目前沒有離線能力

線上站是 Cloudflare Pages,**沒有 service worker**,所以在完全沒訊號的地方
「重新開啟」網頁會失敗。已經開著的分頁不受影響(app 是純前端 + localStorage,
載入之後不需要網路)。

實務上的做法:**看診前先把頁面開好,不要關掉**。
真正的解法是加 service worker,但那是快取層的改動、出名地難纏,
凍結期(9/01 起)不該做,列 backlog。

### 開診前手機實測(2026-09-01,375×812)

走過的路徑與結果:

| 檢查 | 結果 |
|---|---|
| 頁面橫向溢出 | ✓ 沒有,也沒有元素超出視窗寬 |
| 導覽按鈕觸控高度 | ✓ 都 ≥36px |
| 病例區、新增病例編輯器 | ✓ 打得開,表單寬度在視窗內,59 個欄位沒有被切到畫面外 |
| 草稿自動存檔 | ✓ 打字後 1 秒寫入 `acuting-draft-case-v1` |
| 草稿還原(模擬鎖屏/分頁被回收) | ✓ 重新載入後橫幅出現、按還原欄位填得回來 |
| 存檔失敗(配額滿/隱私模式) | ✓ 大聲 alert「資料尚未寫入!請立即匯出備份」 |
| console 錯誤 | ✓ 無(一次 ERR_INSUFFICIENT_RESOURCES 是我反覆導航造成的,重載即 200) |

### 凍結期不動、開診後再看的兩件(backlog)

1. **15 個 checkbox 的標籤只有 21px 高**(手機建議 44px)。點文字可以勾,
   但小。這是易用性不是缺陷 —— 凍結存在的理由正是擋掉「順手改一下更好」,
   所以我沒動。
2. **首頁影片每次載入都會拉 2.4MB**。`preload="metadata"` 有設(有人想過),
   但 `autoplay` 會蓋過它。診間用手機時這是實際的流量成本。
   改法很小(拿掉 autoplay 或加 `media` 條件),但同樣是凍結期不該做的介面改動。

---

## B 群:先前累積、還沒回覆的

### B1 · 青木香的索引不對齊(來自 8/31 撤下裁定)

`functions_zh` 與 `actions_en` 長度不符,`herb_card_schema` 棘輪因此
長駐在 1。替一味**已撤下**的藥補寫適應症英文,方向與撤下相反,
所以我沒補,原因寫進了 `deprecated_note_zh`。

- **(a) 維持不對齊,棘輪長駐 1** ← 我建議(1 是誠實的數字)
- (b) 補齊英文讓棘輪歸零

### B2 · SQLite vs 手機電腦同步(**這條會影響妳明天做什麼**)

如果妳想搬 SQLite 的真正原因是「手機和電腦各一份病例」,
**SQLite 解決不了** —— 檔案在哪台機器資料就在哪台。
要共用需要伺服器(Cloudflare D1),那會把病例放到妳電腦以外,
是 D7 現在刻意不做的隱私邊界。

- (a) 只做本機 SQLite(明天的流程就是這個),同步問題另外談
- (b) 開一條 D1 的評估線 —— 需要一次獨立的隱私裁定
- (c) 兩邊都先不動,繼續用匯出/匯入 JSON 搬

詳見 `docs/SQLITE_RUNBOOK_2026-09-01.md`。

### B3 · 部署網址沒有寫在 repo 裡

線上站是 Cloudflare Pages,鎖在 Zero Trust 後面(妳的 email + 一次性 PIN)。
專案的 `*.pages.dev` 網址**只存在於 Cloudflare 後台**,repo 裡沒有。
後果:任何人(包括妳換裝置時)都得回後台翻;AI session 也無法驗線上版,
只能驗本機服務與 `dist/` 產物。

- **(a) 把網址寫進 DEPLOYMENT.md** ← 我建議,30 秒的事
- (b) 不寫(維持只有妳知道)

### B4 · 那個只有妳能做的 30 秒任務(還沒做)

在線上版瀏覽器 console 跑 `scripts/inventory-workflow-links.js`,把輸出貼回來。
它是 `soap.workflowLink` 這個欄位能不能進 SQLite 的**唯一**卡點 ——
對照表把它標成 `no_destination_yet` 且 `data_loss_risk: high`,
影子匯出遇到有值就會整支停下來。

貼之前順手看一下 invalid 那一欄,萬一那個欄位曾被當草稿欄用過。

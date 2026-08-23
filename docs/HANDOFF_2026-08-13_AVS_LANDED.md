# 交接補充 — AVS 落庫完成 + 一個小 bug

補在早上那份 `HANDOFF_2026-08-13_MORNING.md` 之後,涵蓋你去跑 Dry Clinic 期間我做的兩件事。

---

## 1. SOL 的 AVS 醫囑審核已落庫(交接單裡欠的最後一項)

`AVS_ADVICE_REVIEW_01_SOL_REVIEWED.md` 的 5 筆全部 verdict:`reword`,沒有
`escalate_to_ting`,所以照分工直接落庫,不需要等你裁決。

**我只做機械落庫,措辭一個字沒改** —— 直接用 SOL 的 `suggested_advice_zh`。
`avs.acupuncture_aftercare` 的 evidence_type 由 `practice_standard` 升到
`clinical_safety`(SOL 判定,有前瞻性安全調查支持這個等級)。triggers/id 一個
字都沒動,SOL 自己說明不審那個。

PubMed 抽驗兩筆核對:Lee 2018(抗凝血相關出血事件)、MacPherson 2001(34,000
診安全調查),標題/期刊/卷期頁碼逐字對上。`validate-avs-library.js` 0 failures,
`test-avs-checkout.js` 59/59。無損檢查:13 筆記錄不少一筆,只有這 5 筆的
`advice_zh`/`evidence_type`/`source_refs`/`review_status`/`revision_note`/
`version` 變動。

完整記錄在 `docs/research_packs/AVS_ADVICE_REVIEW_01_SOL.md`(SOL 原始回覆
+ 我的落庫記錄,可回溯)。commit `526f048b`。

---

## 2. 首頁「繼續上次」卡片日期差一天 —— 已修

`PROJECT_LOG.md` 2026-08-12 那條記過但標「不擋此輪」的 backlog:本地晚上
08-12,卡片顯示 08-13。不需要你判斷,順手修了。

跟前一晚修的泳道軸標籤是**反方向的同一類錯**:那邊是日曆日被當瞬間解析
(早一天);這裡是**瞬間被當日曆日切**——`updatedAt` 存的是 UTC 瞬間,卡片
直接切 ISO 字串前 10 碼當日期,UTC-7 晚上 5 點後 UTC 已經跨到隔天。改用既有
的 `localDateISO()` 轉回本地日曆日。

實測:模擬本地 18:00 存檔 → 舊寫法顯示「明天」,新寫法顯示正確日期。
commit `4e5ac3df`。

---

## 3. 現在的狀態

P1–P4 全部落地(Visit Brief、Timeline、Practice Audit、Safety Visibility),
SOL 兩份審核(metric 來源、AVS 醫囑)都收斂了。**現在真正卡住 P0 Core Loop
的,只剩你的 Dry Clinic Top 5。**

工作樹乾淨(`curriculum/` 與 `tmp/` 是其他 agent 的東西,沒碰)。過程中撞到
一次跟其他並行 session 的暫態競爭(`js/knowledge.js`/`styles.css` 瞬間顯示
dirty,幾秒後自己消失)——那是別人的 build 正在跑,不是我的變更,已確認乾淨。

> 這條後來被你「先別管我測試了,你繼續做進程」取消 —— 見 §4,
> 我又動了 `app.js`/`index.html`。

---

## 4. 你說「別管我測試,繼續做進程」之後,做了一件 P6 CHM-CARE 的事

**Case Report Readiness 面板現在可以真的產生草稿了。**

`docs/CARE_READINESS_MAP_v0.md` 早就定義好對映表,病例詳情的徽章也早就顯示
`N/M · 百分比` —— 但「可以生成了」旁邊沒有生成的按鈕。`scripts/
generate-care-draft.js` 這支 CLI 工具本來就能產生完整的 CARE 2013 +
STRICTA 2010 草稿,只是要離開 app、手動匯出、下指令、指定 case id 才能用。

把計算層抽到 `js/care-draft.js`(瀏覽器和 CLI 共用,跟上次 practice-audit.js
同一個模式),CLI 改成薄包裝。**抽出前後逐字位元組比對確認輸出完全相同**,
不是只看結構。病例詳情的 Case Report Readiness 面板現在多一顆「產生草稿」
按鈕,點了直接下載 `.md`。

誠實規則照搬:patientCode 只在標頭註解、出生年月只出年齡層、每個缺的欄位
明寫〔缺:...〕、發表同意沒過會有 ⚠️ 但照常生成。實測含針刺/證型/療效判定/
病人視角的虛構病例:草稿正文完全沒有 patientCode(逐行掃描確認),34 項
缺項的空病例點下去不會炸。

commit `5adcaa11`。CLI self-test 6/6、既有全部 validator 皆 PASS。

工作樹目前只有另一個並行 session 在改 `js/knowledge.js`(穴位英文卡片內容),
不是我的東西,沒碰。

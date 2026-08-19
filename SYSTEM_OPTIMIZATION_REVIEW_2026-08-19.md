# AcuTing OS 全系統檢測報告 — 以 5–20 年使用為尺度

日期：2026-08-19 ｜ 基準：main@cc53597（PR #60 合併點）
方法：8 個獨立唯讀調查線並行（臨床安全、醫學知識體系、資料架構、應用工程、維運保全、法規執業、現況實測、完整性批判），共 510 次工具呼叫。**每個數字都附重現指令或檔案位置；調查全程唯讀，未改動任何資料。**
發起：Ting 指示「用專業醫生跟專業系統人員的思維檢測這個 OS，以未來 5 到 20 年使用，哪裡可以再優化」。

本報告與 `ARCHITECTURE_AUDIT.md`（2026-07-01，資訊架構）、`docs/NORTH_STAR.md`（三地平線路線圖）互補：**不重複它們已規劃的事，只報告計畫之外的風險、計畫與現實的落差、以及 5–20 年尺度才會顯形的慢性病。**

---

## 一、總體判斷

**骨架是專業級的，血肉有系統性風險，最大的敵人是時間。**

這個系統有三樣東西超出多數專業團隊的水準：(1) 治理設計——憲法紅線、缺陷棘輪、逐欄位 field_sources、append-only 決策留痕；(2) 結構紀律——925 個 id 零衝突、3,378 條跨線引用零懸空、方劑組成 1,634/1,635 herb_id 全解析、build 可重現且被 CI 看守；(3) 誠實文化——禁假數字、事故驗屍寫進 PROJECT_LOG 與程式註解。**這三樣是 20 年資產，本報告的所有建議都不動它們。**

但以「未來 5–20 年天天用、將來拿它看病人」的標準檢測，有五個結構性問題：

1. **信任軸已經失靈**：全部 361 穴、221 方停在 draft，review_status 碎裂成 16 種自由文字值（拼錯的 `sourced_checked` 272 筆比正確的 `source_checked` 131 筆多一倍）；而草稿以 +27.5 筆/天生產、臨床內容人審畢業 ≈ 0——任何純審核端方案都追不上這個速率差。
2. **安全層恰好是最弱的一層**：tdis 紅旗 75/75 全空、conditions 71/150 空；361 穴安全欄位的來源標記是整批蓋章且錯置（WHO 定位標準掛在禁忌欄上）；英文安全警語雙鍵分裂且 71/71 內容分歧；safety_flags 詞彙 256/294 不在詞彙表、孕期一個概念 7+ 種拼法；方劑劑量 9/221。
3. **「被洗掉兩次」的通道至今全開**：main 分支零保護（92+ 條分支全部 protected:false）、force-push 可行、agent 直推 main 有前例；GitHub 是唯一異地備份、單一帳號單點；git 全史只剩 85 commits（11 天）而 PROJECT_LOG 記錄 56 個 session——歷史截斷本身就是事故的化石。**今天（2026-08-19）Clinical 線 688 commits ahead / 27 behind、與 main 同改 formulas.json 的局面，正是同一失敗類別的現行實例。**
4. **系統沒有日曆軸**：679 個 ICD-10 碼六週後（2026-09-30）全數過期無人監測；安全知識全是 2026-07 的單次快照、無任何重驗機制；CI 用已 EOL 的 Node 20、無排程觸發；12,330 個外部 URL 是佐證與點位圖的唯一載體。知識庫只規劃了「累積」，沒有規劃「過期」。
5. **兩條憲法級承諾已被實務架空**：「任何未來渲染器只靠 import script 就能重建」——實際上 cautions 合併順序、needling 多型、curated/derived 之辨等關鍵語意只活在 app.js 與 build 腳本裡；「公開內容走 public_ready 白名單」——實際上 acuting.com 文章與 play.acuting.com 遊戲已由 repo 外的平行管線持續發表，全庫 public_ready = 0 筆。

---

## 二、不要動的東西（八線一致認定的強項）

| 資產 | 為什麼是 20 年資產 |
|---|---|
| 零第三方依賴（303 支 scripts 全用 Node 內建；app 無框架） | 20 年壽命最好的保單；Node 大版本升級實際風險極低 |
| 憲法紅線 4（安全數字絕不虛構、兩源並記）+ E2 模型分級 | 全庫安全的地基；LI4 三源並列證明做得到 |
| 棘輪機制（缺陷只降不升、--rebaseline 留痕） | 小團隊治理的正確發明——該擴散（encoding、樣板句、draft 總數），不該改 |
| relation_registry 14 種邊 + field_sources 三大線 361/361、221/221、352/352 覆蓋 | 未來任何遷移的外鍵藍圖與 provenance 原料 |
| red_flag_registry 的結構（trigger+tier+逐條 quote+retrieved_at） | 全庫最好的安全資料模式，應成為所有安全欄位升級的目標格式 |
| drug.warfarin 卡（DailyMed 逐條引用、拒絕擴張解釋） | 其餘 84 張藥卡該複製的原型 |
| 穴位線做法（361/361 全欄位、中英陣列 0 錯位） | 這條線的工法應原樣複製到其他線 |
| DECISIONS.md append-only 單向門 + PROJECT_LOG 回報紀律 | git 歷史被洗掉後唯一倖存的機構記憶 |
| build-data 內容 digest 決定性 + CI staleness gate + build-site quarantine fail-fast | 「工具替人記規矩」模式——應擴張，不應改變 |
| UI 誠實性（status pill、「不可作臨床依據」聲明、RV1 審核條） | 信任軸修好後它們立即生效 |

---

## 三、TOP-10 優先行動（已去重收斂；其餘進第五節 backlog）

八線合計約 80 條發現、逾 30 個新機制。**對一人＋AI 的專案，全部都做的結局是多數爛尾**——以下十條按（能防止不可逆損失 × 成本低 × 擋住正在發生的事）排序，S=半天內、M=1-3 天、L=一週以上：

| # | 行動 | 為什麼是前十 | 量 |
|---|---|---|---|
| 1 | **main 分支保護**：GitHub Pro（$4/月）開 main 禁 force-push、必走 PR、required check 綁 validate 的 green+ratchet 兩個 job；另加 CI 規則——PR 動到 `scripts/validate-*`、`check-*`、`validation_baseline.json` 即要求 Ting 本人 review | 兩次洗掉事件的通道至今全開；gate 和 gatekeeper 目前是同一批 agent 在寫（F4/E5 降級有前例）。今天 Clinical 併行局面下最急 | S |
| 2 | **3-2-1 備份**：update.bat 尾端加 `git bundle create ... --all` 到第二顆硬碟（每月留檔）；加第二個免費私有遠端（GitLab/Codeberg）進 push 腳本；本機未追蹤的 curriculum 壓縮檔納入版控 | GitHub 帳號是唯一異地副本的單點；「force-push 汙染 + 本機 pull 同步」= 全損 | S |
| 3 | **病例持久化三修**（不等 SQLite）：loadClinicalCases 損壞時另存 corrupt-鍵再回傳空、persistClinicalCases 包 try/catch 失敗即警告+自動匯出、importClinicalCases 改 id+updatedAt 合併（抄 notes.js）；順手給「我的臨床筆記」加匯出鈕（exportNotes 已實作、UI 無入口） | 病歷是唯一無法從任何來源重建的資料；三個資料毀滅口全在 SQLite 落地前的橋接期，而 Ting 現在就在用 | S |
| 4 | **review_status 詞彙收斂**：Ting 一次裁定 16 種值的語意映射（`sourced_checked`×272 是否=source_checked？`sourced_cloudtcm_record`×41 應歸 needs_source_review？）→ 一支 migration + 全線 enum validator 進 CI green | 信任軸是全系統唯一的「能不能信這張卡」機關，也是 H3 公開白名單的地基；每天都在長大 | S |
| 5 | **361.json 安全欄位雙鍵手術**：71 筆 cautions_en/cautionsEn 分歧以具體字句勝樣板句合併（LI4 的「孕期嚴禁」只在其中一份！）；七組位元組相同的 camelCase 雙胞胎（point_identity/exam_pearl/…×361）直接刪除；validator 加「camelCase 禁令」 | 英文模式下孕忌警語可能被樣板句遮蔽；今天刪雙胞胎是一小時，等它們分歧後是逐筆人工裁決 | S |
| 6 | **紅旗 Ting 供源備援路徑**：不等 egress allowlist——以她手上教科書/課件為具名來源，AI 起草、Ting 逐筆審，先補 tdis 75 筆各至少一條 urgent 級紅旗，再補 conditions 71 | 眩暈/頭痛/胸痺底下藏著中風、SAH、心梗；病名層 0% 紅旗是全庫最大單一安全缺口，目前唯一計畫（等環境放行）可能永遠不發生 | M |
| 7 | **encoding + 樣板句上鎖**：validate-encoding（今日實測 13,232 筆：`--summary-only`）進棘輪鎖天花板；方劑樣板句家族（「和中健脾，調和諸藥。」×191 等 281 欄位）做成 generic map + 棘輪——清除照原計畫等派工，**鎖不用等清除** | 13,536→13,232 的下降曲線沒有防回退保護；事故史證明驗證器全 PASS 時污染照樣進庫 | S |
| 8 | **ICD 到期監測**：validate-crosswalk-mappings.js 加 10 行（effective_to < today 即 FAIL）；docs 記年度儀式（每年 10 月跑 fill-icd-labels.js）；117 個無版本碼補版本欄 | 679/796 碼 2026-09-30 全數過期（剩 6 週）；ICD 每年換版 ×20 年，無監測=過期碼無聲留庫 | S |
| 9 | **產審速率的節流閥**：ratchet 加「draft 總數天花板」（現值 3,562）；安全欄位驗證從整卡拆出（herb 已有 safety_review_pending 欄可正式化），目標「畢業前安全欄位全數過人眼」而非全卡；每月 PROJECT_LOG 固定記 draft/source_checked 兩條曲線 | 實測 11 天 draft +303、臨床內容人審畢業 0（source_checked 51→131 全來自 ICD 匯入機器蓋章）；曲線不可見就永遠發散 | S |
| 10 | **收斂機制本身**：本報告第五節即 backlog；另立兩頁文件——`MAINTENANCE_CALENDAR.md`（把各線提出的年度/月度/季度儀式收成一張表，標注 全自動/純人工/需AI）與 `DEGRADED_MODE.md`（AI 斷供時什麼自動運轉、什麼安全凍結、Ting 徒手能做什麼） | AI 勞動力是 20 年計畫未申報的單點依賴（Antigravity 斷 token 已發生過）；30+ 個新儀式若無日曆與降級模式，本身就是下一個失敗模式 | S |

**與現行 Clinical 合併的關係**：#1、#2 應在 Clinical→main 整合**之前或同時**落地（整合正是最容易發生整檔覆蓋的時刻）；#5 的雙鍵手術應在整合**之後**做，避免衝突。

---

## 四、逐面向發現（去重後全表）

嚴重度：🔴 critical ｜ 🟠 high ｜ 🟡 medium ｜ ⚪ low。時距：now / 1-5y / 5-20y。
（多線重複命中的發現已合併，並標注 [多線]。）

### A. 臨床安全（醫師視角）

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| A1 | 🔴 now | 病名層紅旗大面積空白 [多線]：tdis 75/75、conditions 71/150 無紅旗；修復被 egress 封死且無備援 | validation_baseline：T4:75、C4:71；PROJECT_LOG 自承「眩暈/頭痛/胸痺底下藏著中風、SAH、心梗」 | TOP-10 #6 |
| A2 | 🔴 now | 361 穴安全欄位 provenance 是整批蓋章且錯置：field_sources.cautions_zh 361/361 一字不差 `["CloudTCM","WHO SAPL 2008"]`——WHO SAPL 是定位標準，不含禁忌內容；contraindications 361/361 無 field_sources | `node -e "...d[JSON.stringify(x.field_sources?.cautions_zh)]..."` → 單一值×361 | 一次性腳本改為誠實標記（batch_stamped 註記）；validator 加 blanket-stamp 偵測（同值覆蓋 >50% 記錄即報警） |
| A3 | 🟠 now | 方劑樣板句家族仍有 281 欄位在庫、無機器鎖：「和中健脾，調和諸藥。」×191/58 方等，甘草類功效蓋在青蒿、細辛、芒硝上 | 2026-08-19 實測；formula 樣板句不在任何棘輪 | TOP-10 #7 |
| A4 | 🟠 now | safety_flags 受控詞彙崩壞 [多線]：256/294 個 flag 不在詞彙表；孕期 7+ 種拼法（pregnancy_review×188、_contraindication×8、_contraindicated×7…）；穿山甲的 flag 欄裝著整句中文 | 實測 herb_canon_shortlist 對 safety_flag_vocabulary | 詞彙表加 severity 軸（contraindicated/caution/review）；alias-merge migration；enum 檢查進棘輪。**安全旗標是未來診間過濾唯一永遠顯示的東西，必須是全庫最乾淨的詞彙，現在是最髒的** |
| A5 | 🟠 now | 錯字與事實錯誤穿過全部驗證器、落在最高風險位置：CV8 禁針警語「神願」（應為神闕）；BL1 針法「想外側」（應為向）；BL1 pearls 寫睛明屬小腸經（同記錄 channel_zh 明明是膀胱經） | 實測 /神願/ 命中 | safety-first 人工核讀隊列：眼區/頸/胸背/禁針穴 30-40 個先行，一晚一經絡，用既有 RV1；加 lint：pearls 中經絡名與 channel_zh 矛盾即報警 |
| A6 | 🟠 1-5y | 藥物交互層 5/85：僅 warfarin 一張 label_verified；formula 端 herb_drug_cautions 23/221 且全是 flag 複製、0 筆提及真實藥名；validate-interactions.js 實為 UI 接線檢查，名稱誤導 | drug_scope_manifest 實測 | P1 抗凝 9 張今年完成（DailyMed 引用是機械工作）；validate-interactions.js 改名 validate-ui-wiring.js |
| A7 | 🟠 5-20y | 證據老化零機制：acupoints fetched_at 361/361 全是 2026-07；全 repo 無 verified_at/next_review 概念；來源只有 URL 無版次 | grep 實測 | 升 source_checked 時強制 verified_at+source_edition；年度 report-stale-safety.js（安全欄位 >3 年即列出）；DECISIONS 記重驗週期 |
| A8 | 🟡 now | 半成品安全欄位比空白誤導：danger 欄只填 28/361 且漏掉 GB21/ST9/BL1；renderer 在董氏/耳穴安全槽位生成樣板句（違反紅線 6 的 runtime 版） | app.js:271、:334 | 裁定 danger 欄命運（補完或併入 contraindications 記 DECISIONS）；renderer fallback 改誠實樣式 |
| A9 | 🟡 1-5y | 孕期安全只存在自由文字：315/361 穴含「孕」字全在 contraindications 散文裡，無結構化層——未來「病例標記懷孕→自動比對針方」做不出來 | grep 實測 | pregnancy_point_registry.json（禁/慎/可三級+來源，先收 20-30 經典孕忌穴，是抽取不是新研究） |
| A10 | 🟡 1-5y | 十八反十九畏無機器檢查：關係型已定義、藥卡文字有記，但沒有東西掃 1,635 條組成 | herb_pair_relations.json:67 | incompatibility_pairs.json（一小時錄入）+ validator：組成含 pair 而無 flag 即缺陷（注意甘遂半夏湯類故意用反藥→規則是「必須帶說明」非「禁止」） |
| A11 | 🟡 1-5y | 眼區等最高危穴刺深是單源深值：BL1「直刺0.5–1寸」僅 CloudTCM 系一源（英文教科書多為 0.3–0.5 起步）——紅線 4 在最需要它的地方空轉 | 對照組 LI4 三源並列證明做得到 | 高危穴 30-40 個「雙源刺深」小批次，優先級高於其餘 320 穴的一般查證 |
| A12 | ⚪ now | red_flag_registry 226 筆全未人審、40/191 接線引用 not_found | validate-red-flag-runtime RT6 | 40 筆 not_found 進 Ting 審核佇列；registry 的 evidence 結構宣告為安全欄位升級目標格式 |

### B. 醫學知識體系（醫師視角）

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| B1 | 🔴 now | 全庫臨床內容凍結在 draft、驗證吞吐≈0 [多線]：361 穴/221 方全 draft；js/review.js 落地但零產出；NORTH_STAR 宣稱 loop「running」與現實不符 | review_status 分佈實測；critic 實測 source_checked 增量全來自 ICD 機器蓋章 | TOP-10 #9；畢業單位降為「欄位」；若一年後某線仍 0 畢業，承認其 review_status 是裝飾並記 DECISIONS |
| B2 | 🔴 now | 98/150 條件卡含跨病種逐字複製的樣板文：子宮內膜異位卡裝著「月經不調」病因文（同段文字 7 卡共用）；447 缺陷被 ratchet 基線「合法化」後在卡上隱形 | C10=189 defects/98 records；自測逐字重複 | 渲染層先隔離（C10 命中欄位加「多病共用文字」灰底標示）；修復從 7 筆婦科群集開始；ratchet 加規則：誤導型缺陷需下降時間表，不適用「不變多即可」 |
| B3 | 🟠 now | 病→方 2,914 條邊 37% 斷鏈且用中文名字串非 ID：210 首被點名的方不在庫（八味地黃丸 32 邊、白虎加人參湯 26…全是臨床核心）| 自測 condition_canon herb_formulas 解析率 1,840/2,914 | formula_alias_map + migration 轉 {formula_id, name_zh_raw}；**210 首按邊數排序=實測臨床需求清單**，取代憑感覺的擴充順序 |
| B4 | 🟠 now | 辨證中間層是斷的：症狀實體 3 筆、tdis 43/75 空殼、條件卡裡數百個症狀只是字串——「畏寒+脈沉細有哪些證型」無法回答 | symptoms.json records=3 | 先解決覆蓋數不做屬性軸：從條件卡症狀字串做頻率統計→前 100 高頻建實體回填；tdis 43 空殼按引用次數補 |
| B5 | 🟠 now | ICD 時限炸彈 [多線]：679 碼 2026-09-30 過期；林昭庚《中西醫病名對照大辭典》為指定 A 級來源、13 個月 0/150 落地 | crosswalk 實測；TCM_SOURCE_REGISTRY:12 | TOP-10 #8；林昭庚辭典改為新條件卡必填核對步驟 |
| B6 | 🟠 1-5y | 英文側系統性落後：199/352 藥無英文功效、cautions 中文-only 216/352——考試與未來病歷都是英文，翻譯負擔發生在考場和診間 | validate-herb-standard notes | 分級：安全欄位英文升棘輪；NCBAHM 140 味優先；新內容一律中英同批 |
| B7 | 🟠 1-5y | 給藥層整層缺失：煎服法 3/221、顆粒換算 45 列/10 方、劑量調整 9/221；無小兒/腎肝功能內容；無任何設計文件規劃此層——**這是「學習資料庫」與「執業資料庫」的分水嶺** | formulas.json 實測 | 30 首「執業方」子集補四欄（preparation/administration/granule_reference_g 帶品牌濃縮比+來源/dose_adjustment 三句話）；schema 規則：顆粒換算必帶 concentration_ratio 與品牌，**無源的換算數字比沒有更危險** |
| B8 | 🟡 1-5y | 來源層級在欄位層不可辨識：5,114 條 herb 來源引用中 cloudtcm 51%、curriculum 29% 混在同一陣列，tier 只存在 markdown 表格 | herb.ma_huang field_sources 三源合併一欄 | source_tier_map.json（URL pattern→tier，30 行）+ 唯讀報告；critic 補充：同檔加 tradition 軸（tw_curriculum/us_board/prc/tung）——考試要美系答案、臨床回台系師承，兩需求都靠它 |
| B9 | 🟡 1-5y | 證型治療層 40% 缺口：typical_formulas 53/91、typical_points 62/91；registry 十個最高頻傘型證（氣虛/陰虛/濕熱…）沒有 library 卡——樞紐只進不出 | pattern_library 實測 | 先補 10 傘型證卡（被引最密、投報最高）；用唯讀腳本從條件卡 728 對 pattern+formula 反推候選回填 |
| B10 | 🟡 1-5y | 考試層：3/4 科考綱有 PDF 無結構化；drill 素材欄位不均（穴位 nccaom_high_yield 僅 7/361）；「drill 引擎純 renderer 無資料工作」的前提實測不成立 | data/exams 僅 BIO 一檔 | 考綱結構化提前做：三科 PDF→json（一天）；ACPL 綱優先回填穴位標記 |
| B11 | 🟡 1-5y | Outcome 詞彙偏生育專科：22 指標 9 個 fertility，MSK（她條件層最大類 30 筆）只有 pain_score，無 ODI/NDI/PSFS 類功能量表——**id 不可改名意味著現在不加、以後的案例補不回來** | outcome_metrics.json 實測 | 趁病例量=0 加 8-12 個 MSK/功能指標（PSFS 對小診所最務實且無版權疑慮）；一個下午換 20 年資料可比性 |
| B12 | 🟡 1-5y | 三個「臨床智慧累積層」全零筆：clinical_pearls 0、personal_notes 0、lifestyle 層（owner 批准標 NOW）13 個月無檔案——教科書內容誰都能重建，她 20 年的 pearls 才是不可取代的 | 實測 records=0×3 | 診斷=輸入路徑太重：app 卡片上加「記一條 pearl」框（localStorage→RV1 既有匯出管道入庫）；lifestyle 先落 10 筆已在用的衛教內容 |
| B13 | 🟡 5-20y | Schema 熵累積 [多線]：herb 115 欄位名（6 個功效同義欄）、formula 142、acupoint 96；孤兒欄位（functions_en 1 筆）是代理實驗化石 | 實測欄位名計數 | field_canon.json 宣告正名+deprecated 別名；validator：新欄位必須登記——凍結熵的增長，不做大重構 |

### C. 資料架構（系統工程師視角）

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| C1 | 🔴 now | review_status 碎裂 16 種值 [四線同報] | 見 TOP-10 #4 | TOP-10 #4 |
| C2 | 🔴 now | 英文安全警語雙份且矛盾：cautions_en/cautionsEn 71 筆共存 100% 分歧；84 筆 cautionsEn 只有 3 種字串=樣板句；renderer 從不讀 cautions_en——294 筆真實英文警語是死資料 | LI4 孕忌只在其中一份 | TOP-10 #5 |
| C3 | 🟠 now | 361.json 七組欄位存雙份（camelCase/snake_case ×361，今日位元組相同）——cautionsEn 已示範這個模式必然走向分裂 | 實測七組 0 歧異、一組 100% 歧異 | TOP-10 #5 後段 |
| C4 | 🟠 now | D10 證型單一命名空間已被穴位線違反：127 條引用全指向被降級的 `pat.中文` 命名空間、與 pattern_registry 交集=0；build-data 把降級 canon 打包進 runtime 制度化這筆債 | 361.json tcm_pattern_ids 前綴分佈 {pat:127} | alias map 補到 134/134→migration 改寫 127 條→build-data 移除 tcmPatternCanon bundle→validator 對齊 C6 |
| C5 | 🟠 1-5y | 「只靠 import script 就能重建」已被架空：cautions 四欄 union 順序、needling 354 字串/7 物件多型、key_conditions(人工) vs related_conditions(機器) 之辨——全部只活在 app.js/build 腳本 | adapt361Record 約 100 行是事實上的 schema 統一層 | data/SCHEMA_MANIFEST.json（每線：檔案、包裝鍵、正名欄位、廢欄位、渲染語意註記），validator 與 app 讀同一份；配季度 drill-cold-import.js 冷啟動演練（JSON→SQLite→抽查 20 卡） |
| C6 | 🟠 now | 同一 formula id 寄居 2-3 檔且已歧異：115 個雙宿 id 中 9 筆 name_en 不同；組成反正規化漂移 242 筆（含 name_zh="(Chao Xing Ren)" 級髒資料）；炮製只在名字字串裡——生半夏/制半夏是毒性等級差異 | entity_registry entities_in_multiple_files | validator 加「多宿 id 共同欄位必須一致」；canon_shortlist 降級為 id+tier 索引；composition 加 pao_zhi_zh 結構化欄位 |
| C7 | 🟡 now | entity_registry 非決定性（built_at 時間戳）、CI 不驗證、漏登第二陣列實體、12% unclassified；committed 版已過期一個月（4,621 vs 重建 6,038） | 實測重跑 diff | built_at 改 digest；CI 加 staleness 步驟；pickArray 走訪全部命中陣列；裸碼歸類 point |
| C8 | 🟡 now | 爬蟲原料佔 repo 過半且永久入史：ad_cache 2,252 檔 66MB、imports 47MB（formula_url_map.json 38.9MB 含 1,036 U+FFFD）、tungs_website_raw 18.8MB（BOM 損壞不可解析） | git ls-files 實測 | 移外部封存（R2/Release asset），repo 留 manifest+sha256；不重寫歷史，止血新增量 |
| C9 | 🟡 1-5y | H3 公開白名單只看 status 不看 provenance：cloudtcm_detail 346/361、ad_syndromes_en 212/221 已織入正典記錄——status 擋得住私筆記，擋不住 CloudTCM 逐字段落 | field_sources 資料在、規則不存在 | 出口規格加第二軸：爬取來源欄位一律排除或改寫後標 rewritten；BLUEPRINT:16「無版權疑慮」補「僅限私用」限定語 |
| C10 | 🟡 1-5y | 瀏覽器全載模型無觸發條款：payload 23.8MB/15 檔、knowledge_data.js 11.8MB 以 +0.77MB/12天逼近 Cloudflare 25MiB 硬上限；build-site 只 warn 不 fail | 實測 dist | build-site >23MiB 改 exit 1；NORTH_STAR 觸發表補「單資產 >20MB 或手機首載 >2s → 按線拆 JSON fetch」 |
| C11 | 🟡 1-5y | 一線一巨檔 × 多代理並行寫：formulas.json 4.2MB 在 11 天 23 個版本；merge 衝突整檔爆炸、diff 淹沒、blame 失效——**今天 Clinical 688-ahead 同改此檔即現行實例** | git rev-list --objects 實測 | 只拆唯一高衝突檔：formulas.json → formulas/<id>.json + build 聚合（10 行改動）；其他低併發檔維持現狀 |
| C12 | ⚪ 5-20y | 陳舊遷移殘骸誤導未來：data/pathology/schema.sql 建模早於 D11 四命名空間、與現行資料不符卻以 schema 之名住在 data/；conditions.json 殘留 eastern_disease.* 舊前綴 6 筆 | 實測 | schema.sql 加檔頭「HISTORICAL DRAFT — do not implement」或移 docs/archive |

### D. 應用工程（前端、效能、測試、安全）

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| D1 | 🔴 now | 病例持久化三個資料毀滅口 [多線]：損壞即歸零（catch→[]→下次儲存覆寫原 blob）、quota 錯誤無承接（「假儲存成功」）、匯入整批覆蓋無確認；匯出檔無 schema version | app.js:1312-1325、5769-5788 | TOP-10 #3（30 行內的手術，不等 SQLite） |
| D2 | 🟠 now | 穴位編輯功能今天就是壞的：persist() 快照 ≥12MB（UTF-16）必超配額；全 repo 無任何程式碼寫入 isUserEdited→編輯即使存成也被下次載入丟棄；且與病例共用同一 origin 配額 | grep isUserEdited 僅 2 讀取點 0 寫入點 | 二選一：移除編輯入口宣告唯讀（個人層走 notes）或改差異儲存+設旗標+try/catch |
| D3 | 🟠 now | 瀏覽器同步解析 20.9MB JS、12 個 script 無 defer；其中 617KB 是 runtime 過濾丟棄的死資料（embedded 層 254/256 筆與 361 重疊——NORTH_STAR H1.1 只做了 runtime 半邊，build 仍照常輸出） | 實測 app_data.js 重疊計數 | 立即：build 端停止輸出 254 筆死記錄；中期：knowledge_data 按 workspace 拆檔 fetch |
| D4 | 🟠 1-5y | App 零自動化測試：CI 只有 node --check；headless QA 全是一次性人肉操作未留腳本；app.js 註解已記載兩次「整頁空白」級靜默故障；無 window.onerror 承接 | validate.yml；grep 實測 | scripts/smoke-app.js 一個檔案 6 條斷言（Playwright headless）進 CI；+10 行 onerror→紅 banner，把「靜默」從故障型態裡刪掉 |
| D5 | 🟠 1-5y | XSS 防線純人工 escape 無 CSP 後盾，已有漏網 sink（app.js:3458 code-pill、:2419 data-branch）；資料是持續攝入的半信任爬取內容；localStorage 裡是臨床病例 | dist 無 _headers | 修 2 sink（5 分鐘）→inline handler 改委派→dist/_headers 加 CSP（build-site 順手產生）→憲法加一條「插值必過 esc」 |
| D6 | 🟡 now | 「我的臨床筆記」匯出被註解宣告 not optional 但 UI 無匯出鈕（唯一觸發方式是 DevTools console）；CS1 備份提醒不覆蓋筆記與審查判定 | grep exportNotes 引用點 | TOP-10 #3 尾段：一行 HTML+一行綁定；三層備份狀態併入 CS1 banner |
| D7 | 🟡 1-5y | 零離線能力+未申請 persistent storage：診間斷網/Access 驗證失敗即整站不可用；Safari ITP 7 天未使用可清 localStorage——**純靜態 15 檔是最容易做到全離線的架構，不做等於白放棄 vanilla 決策最大紅利** | grep serviceWorker=0 | ~60 行 service worker（precache 清單 build-site 已算出）+ navigator.storage.persist() 一行 + manifest 讓 iPad 進主畫面 |
| D8 | 🟡 now | build-site 資產抽取 regex 盲區：poster 屬性沒被複製→正式站首頁 video poster 404；quarantine 檢查與複製器共用同一盲區 | 實測 regex 只匹配 src/href | regex 擴為 src|href|poster|content+srcset+CSS url()；尾端自檢：dist 內死引用 exit 1 |
| D9 | 🟡 1-5y | 病例 PHI-adjacent 欄位明文存 localStorage 與匯出檔：出生年月+職業+起始日期組合在小城市可重識別；Access 保護網站不保護裝置 | normalizeClinicalCase 欄位清單 | 文件層：裝置必須全碟加密（零程式碼最大收益）；匯出改 WebCrypto AES-GCM（~40 行）；寫進 SQLite 遷移驗收條件 |
| D10 | 🟡 5-20y | Vanilla 隱形接縫缺護欄：DOM 元素當狀態容器（detachedFilterState）、init 順序靠註解、esc×4 份/modeText×2 份重複實作、knowledge.js 單一 2782 行 IIFE 每實體手刻 panel——**決策仍成立，缺的是護欄不是框架** | app.js:558-579 | js/util.js 收斂 esc（XSS 修補點集中）；filter 狀態改明確物件；新實體卡走宣告式 card-spec 渲染器（只用於新增，不回頭重寫） |
| D11 | ⚪ 5-20y | 工具鏈單機化：無 engines pin（CI Node 20 已 EOL、本機 22）；環境知識散在 CLAUDE.md 散文與硬編碼 C:\ 路徑 | start-local.bat:8-9 | .nvmrc pin；docs/MACHINE_SETUP.md（裸 Windows→可 build 可 push 的完整步驟，半小時重建環境） |

### E. 維運與資料保全

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| E1 | 🔴 now | main 零保護、兩次洗掉通道全開 [多線] | 92 條分支 protected:false；check-today-survives.js 自述 merge 11f37a9 事故；PROJECT_LOG:176 agent 直推 main | TOP-10 #1 |
| E2 | 🔴 now | 備份拓撲兩份熱副本互為唯一、單帳號單點；curriculum 未追蹤壓縮檔零副本 | git remote -v 僅 origin；全 repo 無備份腳本 | TOP-10 #2 |
| E3 | 🟠 now | 內容流失防線只護方劑一層且不在 CI：no-loss 單檔（formulas.json）、手動跑；快照在 repo 內 agent 可寫（跑 --save 即可祝聖損失）；check-today-survives 是凍結的歷史清單——**重演 8/07 奇穴覆蓋今天照樣全綠** | grep validate.yml 零命中 | 推廣成全 data 層 CI job：PR 每個變動 JSON 對 merge-base 比三數字（記錄數/CJK 字元數/非空欄位數），下降即 fail 除非帶 loss-approved 標記（~100 行，邏輯從 no-loss 抽出） |
| E4 | 🟠 now | gate 和 gatekeeper 同一批 agent 在寫：棘輪基準只比對 PR 自帶版本（同 PR 改壞資料+改高基準=全綠）；F4/E5 驗證器降級有前例；無 CODEOWNERS | check-validation-ratchet.js 讀 checkout 內 baseline | TOP-10 #1 後段：CI 對照 origin/main 的 baseline；動 validate-*/baseline 的 PR 標記需 Ting review |
| E5 | 🟠 now | encoding 13,232 筆完全沒有 gate [多線]：不在 green 不在棘輪；13,536→13,232 的投資無防回退保護；scripts/translate-safety-terms.js 含 9 個 NUL bytes 已被 commit | `node scripts/validate-encoding.js --summary-only` | TOP-10 #7 |
| E6 | 🟠 1-5y | PHI 防護只認路徑不認檔名、一鍵推送用 git add -A：病例匯出檔（acuting-clinical-cases-*.json）落 Downloads→「暫放」進專案資料夾→桌面捷徑→入永久 git 歷史，三層防護恰好都繞過這條最可能路徑 | git check-ignore 實測 NOT-IGNORED | 三行修補：.gitignore + CI glob + push 腳本前置檢查；每季跑 GitHub secret scanning |
| E7 | 🟠 5-20y | 79MB 版權教材+45MB 爬取語料與知識庫同倉：一個 visibility 開關之差；版權停權會連坐唯一備份；「public export 白名單」腳本尚不存在（是計畫不是機制） | build-site QUARANTINED 只防部署一條路徑 | 拆 acuting-corpus 私有第二 repo（路徑約定引用）；主 repo 從今以後乾淨、不重寫歷史 |
| E8 | 🟡 now | scripts/ 303 支、近 11 天只動 19 支：一次性與長青混住、無封存無清單；「可原樣重跑」文化 × 已演進三個月的 schema = 地雷 | ls+git log 實測 | 照抄 docs/archive 成功模式：scripts/archive/ + MANIFEST.md 一行登記（用途/長青|一次性/最後驗證日）；憲法加「跑完同 commit 移入 archive」 |
| E9 | 🟡 now | 92 條殘留遠端分支=92 份舊資料快照、本機兩個工作資料夾共用一 repo——製造下一次 divergence 的地形還在 | update.bat:47-52 自述 | 每季 10 分鐘儀式：已合併分支刪除、保存點改 git tag archive/*（tag 不可被 checkout 寫入）；Antigravity 資料夾唯讀化 |
| E10 | 🟡 1-5y | generated 大檔進版控高頻重寫：knowledge_data.js 11 天 39 版、52/85 commits 觸及 generated；外推 ~250MB+/年 packed——迫使未來全員 shallow clone，災難恢復（8/07 式考古）變慢變難 | git rev-list 實測 | Cloudflare build command 改為 build-data+build-site 部署端現做；.gitignore data/generated；CI gate 反轉為「不得提交」 |
| E11 | 🟡 1-5y | CI 時代衰變：Node 20 已 EOL（2026-04）、actions@v4 終將棄用、無排程觸發——執業後低頻推送期，「CI 因棄用失效」與「急需 CI 的修復」會同一天發生 | validate.yml | 月度 schedule cron（免費金絲雀，紅了 GitHub 寄信）；年度「換電池」儀式（node-version+actions 各改一個數字） |
| E12 | 🟡 1-5y | Cloudflare Access 是唯一門鎖但設定只存在儀表板：誤刪/改名/政策過期→整庫立即全網公開且無人知曉（門後是含爬取內容的完整 draft 庫） | DEPLOYMENT.md:129 手動說明 | Access 設定快照存 DEPLOYMENT.md；月度 cron 加 3 行 curl 檢查回應是否 302 到 cloudflareaccess.com，200 即 fail |
| E13 | 🟡 5-20y | 治理耐久性：憲法逐條核對，只有一小半有機器強制；已被繞過的實例成列（「不准寫 100%」次日 10+ commit 違反、F4/E5 降級、直推 main）——**20 年換三代 AI 工具後，活下來的規則只有 CI 裡的規則** | AI_CONSTITUTION 逐條 vs validate.yml | 三條高傷害規則機器化：所有權（分支前綴×路徑白名單 job）、紅線 2/3（E3 的內容不減 gate）、先問 Ting（E4 的 required review）；憲法每條旁標 [CI] 或 [紀律] |
| E14 | ⚪ 1-5y | 「真病人開始」是一條沒有日期沒有守門人的線：學生→執業是漸進的，最可能失敗不是忘了做而是「每一筆都覺得還不算真病人」 | NORTH_STAR H2 無觸發定義 | DECISIONS 加 10 行觸發器：「第一筆非本人/非同學 SOAP 存檔之日，cases 遷移自動成為最高優先、期限 30 天」；CS1 banner 偵測到即升級為倒數 |

### F. 未來執業與法規

| # | 嚴重度 | 發現 | 關鍵證據 | 建議 |
|---|---|---|---|---|
| F1 | 🔴 1-5y | 「去識別化、無隱私疑慮」是自我安慰：visit_date 全日期+生年月+生育週期時間線在小診所人群可再識別=PHI；唯一 H2 規格（MIGRATION_LOCALSTORAGE_TO_SQLITE.md）對 encrypt/backup/retention 零字；「.db 永不進 git」= 最不可替代的病歷被排除在唯一備份機制之外 | grep 實測；匯出檔含全 visit dates 違反自家 CONDITIONS_INTEROP 檢查表 | §7.3 四需求搬進 MIGRATION 成驗收條件（SQLCipher 或全碟加密前置檢查、加密匯出、PHI_POSTURE.md 一頁、修 BLUEPRINT 措辭）——**錯誤的自我認知是下游決策的毒源** |
| F2 | 🔴 1-5y | 病歷的法律角色未決：正式病歷或影子紀錄？現設計兩者皆不合格——SOAP 可一鍵硬刪、就地編輯不留痕、無簽署/附註/保存年限；D6 保護知識記錄永不硬刪，臨床記錄反而沒有對等保護 | deleteCurrentSoap 單 confirm 即永久刪 | 現在寫一條 DECISIONS 裁定角色；若當正式病歷：revisions append-only 表+signed_at 鎖定+soft-delete 三件事（一週內、全 additive） |
| F3 | 🟠 1-5y | 沒有診間模式：draft 治療建議與已驗證內容同權重呈現；以實測驗證速度外推，開業日 >90% 仍是 draft——「診間裡沒有人讀徽章」，過濾必須是模式不是標籤 | grep clinic_mode=0 | 第三種 content mode「clinic」：非 source_checked 治療建議摺疊灰化（紅旗與禁忌永遠顯示）；配合安全欄位級畢業（TOP-10 #9）讓「畢業前安全層全過人眼」變成做得到的目標 |
| F4 | 🟠 1-5y | 「中西藥交互安全第一」沒有可查詢的資料形狀：relation_registry 14 種邊沒有一種是 herb×drug；診間真實查詢是反向的（「病人吃 apixaban，這張方哪裡有問題」），自由文字回答不了 | registry edges 全列表 | 現在只做詞彙與形狀（一天）：註冊 edge.herb_drug_interactions（herb_id × drug_class_id × severity × evidence_level × source——對類不對藥）；新交互內容直接進結構 |
| F5 | 🟡 1-5y | 藥材法規狀態無資料模型：禁用資訊寫在名字裡（"Pangolin Scales (banned)"）、塞在 flag 欄的整句中文；vocabulary 無 regulatory 類——無法回答「這張方在我執業的州有沒有不能用的藥」，法規變更時無法批次盤點 | 實測 | additive 加 regulatory_status:[{jurisdiction,status,basis,source,checked_at}]，先種 10-15 味已知者；與 ICD 儀式同月年檢 |
| F6 | 🟡 1-5y | 保險文件層缺 plan-of-care 實體：schema 能記單診記不了治療計畫（頻率×期程×功能目標×re-eval 到期）；outcome 全是自評無效度化功能量表——Medicare CLBP 給付明文要求 demonstrated improvement | schema.sql 無對應表 | additive 三件：treatment_plans 表、metric.odi/ndi/psfs、doc_req.re_evaluation+functional_progress |
| F7 | 🟡 5-20y | 12,330 個外部 URL 是佐證與點位圖唯一載體：cloudtcm 13,607 引用、tung 站 9,792、熱鏈圖 2,097 張——站點改版/消失=已驗證記錄的佐證死鏈+診間點位圖空白 | 實測 distinct URL | 窄修不推翻無圖決策：RV1 通過時順手提交 web.archive.org 快照存進 field_sources（只為 source_checked 做）；「診間關鍵圖」~100 張授權本地化或自繪 SVG；年度死鏈抽樣 |
| F8 | ⚪ 5-20y | 承繼與失能情境零覆蓋：docs 62 份全是給 AI 的接手指南，沒有一份給人類；病歷保管人義務在只有本人打得開的加密庫裡無法履行 | grep recovery/restore=0 | 半天寫 CONTINUITY.md（給非技術人類）：資料在哪三處、病歷怎麼開與匯出 PDF、帳號清單、密碼管理器緊急存取；開業時指定 records custodian |
| F9 | ⚪ 1-5y | 知情同意只有一個空欄位：實習診所（covered entity）的病歷帶回私人系統受站方政策約束；未來教學/發表需病人層級同意紀錄 | consent_scope TEXT 空 | consent_scope 結構化（treatment/education/deidentified_teaching/research + date + form_version）；visits.setting 必填+站方政策確認紀律 |

### G. 現況實測（2026-08-19 快照，供未來對照）

- **驗證器**：15 支重跑，12 PASS、3 FAIL——conditions 447 blocking（=ratchet 基線）、tdis 75（=基線）、encoding 13,232（**不在任何 gate**）。build-data 重跑零 diff（可重現）。
- **實體量**：標準穴 361 / 奇穴 72 / 董氏 277 / 耳穴 203（ear ns 215 id）/ 頭皮 22 → runtime 947 點；藥 352（模板級 216…按 herb 線口徑另計）、方 221（方歌 98、劑量 9）、證型 91、conditions 150（clean 26）、tdis 75（clean 0）、症狀 3、鑑別 43、藥理 15。
- **體積**：repo 383MB（.git pack 106.3MiB、僅 85 commits/11 天）；data/ 117MB/564 JSON；generated 21MB；dist 23.8MB/15 檔。
- **git**：85 commits 全在 2026-08-08 後；PROJECT_LOG 記 2026-07-26 起 56 session（Codex 34 / Claude 21 / Antigravity 1）——歷史截斷即兩次洗掉事故的物證；單一 remote。
- **懸空引用**：35 筆藥材引用不存在的 BASTYR 考綱、1 筆 NCCAOM——有講義就入庫，沒有就改 citation，然後把此警告升為阻擋。
- **小而典型**：validate-no-boilerplate.js:47 硬編碼「all 201 formulas」（實際 221）且不在任何 CI tier——「強制驗證器輸出著錯誤數字而沒人跑它」正是本專案最忌諱的失敗模式縮影。
- **計數歧義**：同名不同母體（conditions 150 vs 12、patterns 91/98/8、ear 215/203）——驗證器輸出標籤附上母體檔名即可解（一次 grep+改字串）。

### H. 完整性批判（第八視角補充）

| # | 嚴重度 | 發現 | 建議 |
|---|---|---|---|
| H1 | 🟠 now | **acuting.com 公開管線已在治理之外運轉**：全庫 public_ready=0，但公開衛教文章（acuting-journal skill：即時研究即時發表、嵌 TikTok）與 play.acuting.com 遊戲內容持續產出，不經任何驗證器/紅旗/來源棘輪；兩個 skill 檔只存在帳號同步目錄、無版本控制。執照後以執業者名義發布的健康主張屬受規管專業廣告 | DECISIONS 裁定公開文章定位（衛教+免責、不含劑量/刺深/操作指示）；journal skill 加一步「有對應卡片必引其 field_sources 並記 record id」；兩個 skill 檔 commit 進對應網站 repo |
| H2 | 🟠 now | 產審速率算術 [已併入 TOP-10 #9]：draft +27.5/天 vs 臨床人審 ≈0；source_checked 51→131 全來自 ICD 匯入機器蓋章——信任標籤正被非人審管線稀釋 | draft 天花板+月度雙曲線；半年後仍發散就正式裁決「哪些線永遠不追求驗證」 |
| H3 | 🟠 1-5y | AI 勞動力是未申報的單點依賴：token 斷供已發生過（Antigravity）；本報告新增的全部儀式都默認 AI 執行者存在；20 年成本曲線幾乎全是 AI 訂閱卻無一字記載 | DEGRADED_MODE.md 三層（零 AI 自動運轉/安全凍結/Ting 徒手最小維護）——TOP-10 #10 |
| H4 | 🟡 now | 使用行為零遙測：app 不記錄 Ting 開過哪些卡，所有「她最常讀」「高頻先補」的排序其實都是猜的——審核吞吐是最稀缺資源，火力無法瞄準 | ~20 行本機瀏覽記錄（localStorage 環形 5,000 筆）；三個月後「最常開 100 卡 × review_status」表=RV1 佇列的正確排序。純本機零外洩 |
| H5 | 🟡 1-5y | 全域搜尋缺整個辨證層且拼音零容錯：patterns/tdis/symptoms/comparisons/medications/紅旗全不可搜；"he gu"/帶聲調查不到合谷——**內容 10x 後，查不到=不存在** | unifiedSearch 照現有 pick() 模式加四組（各~10 行）；normalizePinyin（去空格聲調）雙向套用；NORTH_STAR 觸發表補召回觸發器 |
| H6 | 🟡 5-20y | 來源橫跨四個傳統（台課綱/CloudTCM 2,444、董氏 1,083、美系 296+考綱 407、大陸 220）但 schema 無 tradition 軸：242 筆組成漂移中有多少是學派差而非錯字，無法區分；考前要美系答案、執業回台系師承，兩需求都落不了地 | source_tier_map.json 同檔加 tradition 欄（URL pattern 推斷 90%）；紅線 4 雙存時順手標 tradition |
| H7 | 🟡 5-20y | 程式碼公車係數：「app 可替換」從未演練；7,031+2,782 行的隱性知識（script 標籤→全域、init 順序、合併語意）只活在無持久記憶的 AI 會話裡 | docs/CODE_MAP.md 半天；年度「可替換演練」：新 session 只讀 data/+CODE_MAP 重建單線最小渲染頁——與 C5 冷啟動演練合起來才真正驗證憲法法則 |
| H8 | ⚪ now | 審計建議過載本身是風險 [已內建為本報告結構]：80 條發現、30+ 新機制對一人專案的結局是高價值被稀釋 | TOP-10 之外全部視為 backlog，**明文接受多數永遠不做** |

批判者抽查裁決：8 項最重的跨線發現逐一 CONFIRMED（review_status 碎裂 272/131、cautions 雙鍵 71/71 分歧、ICD 679 碼、tdis 75/75 連欄位都不存在、isUserEdited 零寫入點、no-boilerplate 硬編碼、git 85 commits 單 remote、驗證吞吐≈0 且增量全是機器蓋章）。**零 REFUTED。**

---

## 五、跨面向根因（五個主題，一個根因解多條發現）

1. **信任標籤與現實脫鉤**（≥4 線命中：C1 status 碎裂、A4 flags 崩壞、A2 blanket stamping、H2 機器蓋章稀釋）——共同根因：**狀態值無 enum 強制 + 晉升無儀式**。一套詞彙表+enum validator+晉升紀律（verified_at+edition）同時解掉約五條發現。
2. **生產與驗證速率失衡**（B1、F3、H2）——根因不是審太慢，是**產太快且無節流閥**。解法在生產端（draft 天花板）+ 降低畢業單位（欄位級）+ 讓曲線可見（月度雙數字）。
3. **雙份真相**（C2/C3 雙鍵、C6 多宿、C7 registry 過期、E10 generated 進 git、D3 embedded 死資料）——根因：**衍生物與正本同倉且無 single-writer 宣告**。解法：刪副本、降級索引、generated 出 git、SCHEMA_MANIFEST 宣告每個欄位的唯一真相。
4. **系統沒有日曆軸**（B5 ICD、A7 證據老化、E11 CI 衰變、F7 URL 腐蝕、D11 Node EOL）——知識庫只規劃累積沒規劃過期。解法：一份 MAINTENANCE_CALENDAR + CI 月度 cron 當金絲雀，讓時間性檢查自動找上門而不是靠人記得。
5. **規則的牙齒問題**（E1/E3/E4/E13、H1 治理外管線）——本專案自己的歷史證明：**寫在文件裡的規則平均壽命以天計，活過每次事故的只有 CI 裡的規則**。解法：三條高傷害規則機器化（所有權、內容不減、先問 Ting），其餘明文接受靠紀律。

---

## 六、時間軸視角

**現在（→2026 年底）**：TOP-10 全部屬於這一格——它們共同的特徵是「正在發生或六週內到期」：分支保護與備份（Clinical 整合期正是最危險的時刻）、病例三修、ICD 到期、encoding 上鎖、紅旗備援路徑。

**1–5 年（在學→執照→初診所)**：clinic mode 與安全欄位級畢業（F3）、給藥層 30 首執業方（B7）、herb×drug edge 形狀（F4）、病歷法律角色裁定與 append-only（F2）、PHI posture 與加密（F1、D9）、SQLite 遷移（既有計畫，補加密驗收）、離線 service worker（D7）、smoke test（D4）、payload 拆分（C10/D3）、搜尋補辨證層（H5）。**這一格的主題：從「學習資料庫」跨到「執業資料庫」的每一道分水嶺都要在真病人之前過。**

**5–20 年（成熟執業）**：證據重驗週期成為慣性（A7）、tradition 軸支撐跨學派（H6）、URL 佐證存檔化（F7）、承繼文件與 records custodian（F8）、治理規則的機器化存量決定品質體系還剩多少（E13）、「app 可替換」年度演練保持真實（H7）。**這一格的主題：對抗熵——知識過期、連結腐蝕、規則蒸發、單人依賴。**

---

## 七、維護日曆草案（收斂各線提出的儀式）

| 頻率 | 儀式 | 屬性 |
|---|---|---|
| 每月 | CI schedule cron（金絲雀：validator 全套 + Access 302 檢查 + 未來 stale 檢查） | 全自動 |
| 每月 | PROJECT_LOG 記 draft/source_checked 雙曲線；git bundle 冷備份留檔 | 半自動 |
| 每季 | 分支清理儀式（合併者刪、保存點轉 tag）；scripts 封存巡檢；GitHub secret scanning | 需 AI 或 30 分人工 |
| 每季 | 冷啟動演練 drill-cold-import.js（JSON→SQLite→抽查 20 卡） | 需 AI |
| 每年 10 月 | ICD 換版（fill-icd-labels.js --apply）+ 藥材法規狀態年檢 | 需 AI，Ting 審 |
| 每年 | CI 換電池（Node LTS、actions major）；死鏈抽樣；report-stale-safety（安全欄位 >3 年清單）；「app 可替換」演練；從零恢復演練 | 需 AI |

---

## 八、即時協調狀態附錄（2026-08-19 晚間，存證供接手者）

本報告寫作當下，repo 正處於雙線併行狀態，**它本身就是 C11/E1/E3 發現的現行實例**：

- **main@cc53597**：PR #60（全系統優化：驗證器缺陷分批下修）已合併。
- **Clinical 線 = `codex/pattern-v2`**，HEAD `01307c6`，PR #59（draft，標題自述 CI gate vehicle / do not merge yet）：689 commits、353 檔、+345,555/−7,013；merge base 停在 `1ff208b`（behind main 27 commits）。**exact HEAD 無 combined status/workflow run**（branch push 不觸發 validate——Codex R14 已審計此缺口，正是 E1 required-check 建議要修的）。
- **Ting 當晚裁定**（存證）：PAUSE Clinical 的 formula/herb canonical 寫入與 PR #59 landing；main@cc53597 正常整合進 Clinical，`formulas.json`、`herb_canon_shortlist.json` **逐欄解衝突不得整檔 ours/theirs**；驗證瀉心湯身分（大黃/黃連/黃芩，main 的重建不得被舊卡蓋回）；新 contraindications backfill 中混入的炮製/煎服法/急救給藥指示（三子養親湯、旋覆代赭湯、參附湯）拆到 preparation/administration/cautions，禁忌欄只留真正的禁止/不宜/慎用——**此問題正是 B7（給藥層欄位缺失導致內容無處可放）與紅線 3 的交會**；拆分後重建 generated、在新 exact SHA 跑全 CI + 15/15 對帳 + 代表卡 smoke，才評估 PR #59。CONTINUE：非重疊 UI、research staging、main 上的第二輪內容工作。CODEX AUDIT：merge 無損、瀉心湯身分、29 張 contraindications 語義分類、exact-head CI。
- **Ting 對另一線總結的數字修正**（該總結不在 main，正本應由 Clinical 線 session 套用；此處存證防止讀到舊狀態）：① commit 數以 `git rev-list --count f5443aac..HEAD` 實測為準（前段 22+加時 7 應為 29 非 28）；② 裁決佇列 E 段過期——actions_en 已達 358/358 應刪除；contraindications_zh 已達 218/224 應改「剩 6 方」；方歌現況 130/224、仍缺 94（其中 12 首白名單來源未找到、3 首疑訛字暫扣）；③ agent 數量表述依實際 dispatch ledger 統一（「剩三個」vs「四條研究線」vs「5 個唯讀」不一致）；④ 「17+8 項裁決」拆為「17 項主裁決＋8 項研究暫扣」或另列 F 段。
- **Ting 裁定的下一場順序**（存證）：A1–A6 歸屬錯誤（尤其 xie_xin_tang）→ B7–B9 重複/退役 → D13 20 方禁忌語言對齊 → 補剩餘 6 方禁忌 → 方歌第三波與 94 方缺口分類 → 最後才做 knowledge_data.js 載入效能改造。

**本報告的 TOP-10 與上述整合的時序關係**：#1 分支保護、#2 備份應在整合前/同時；#5 雙鍵手術、#7 上鎖應在整合後（避免衝突）；其餘與整合無依賴。

---

## 九、重現方法

所有計數的重現指令（在 main@cc53597 工作樹執行）：

```bash
# 驗證器現況
node scripts/build-data.js && git status --porcelain -- data/generated   # 應為空
node scripts/validate-encoding.js --summary-only                          # issues: 13232
node scripts/check-validation-ratchet.js                                  # conditions 447 / tdis 75 基線
# review_status 碎裂
node -e "const g=require('glob');..."   # 或逐檔：grep -ho '\"review_status\": \"[^\"]*\"' data/**/*.json | sort | uniq -c
# 361 雙鍵與 blanket stamp
node -e "const a=require('./data/acupoints/361.json');const d={};a.forEach(x=>{const k=JSON.stringify(x.field_sources?.cautions_zh);d[k]=(d[k]||0)+1});console.log(d)"
node -e "const a=require('./data/acupoints/361.json');let n=0;a.forEach(x=>{if(x.cautions_en&&x.cautionsEn&&JSON.stringify(x.cautions_en)!==JSON.stringify([x.cautionsEn]))n++});console.log(n)"
# 樣板句家族
node -e "const r=require('./data/herbs/formulas.json').records;const s='和中健脾，調和諸藥。';let n=0;for(const f of r)for(const c of(f.composition||[]))for(const k of['in_formula_zh','actions_zh','role_reason_zh'])if(c[k]===s)n++;console.log(n)"
# ICD 到期
node -e "const c=require('./data/interop/condition_crosswalk.json');let n=0,m=0;for(const r of c.records)for(const x of(r.icd10||[])){if(x.effective_to==='2026-09-30')n++;if(!x.release)m++}console.log(n,m)"   # 679 117
# 分支保護（GitHub API）：list_branches → 全部 protected:false
# git 健康
git count-objects -vH ; git rev-list --all --count ; git remote -v
```

完整的八線調查原始輸出（含每條發現的全部證據路徑）存於本次 session 的 workflow journal；本文件是其去重收斂版。

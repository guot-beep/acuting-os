# AI 憲法 — AcuTing OS

**這一頁是所有 AI 的共同認知。派工時整段貼在 prompt 最前面。**

它不是第 12 份說明書,是那 11 份的**摘要卡**。規則的正本在
`AGENTS.md` / `docs/BLUEPRINT.md` / `DECISIONS.md` / 各 CARD_TEMPLATE;
這一頁只收「違反了會造成不可逆損害」的部分。

Last updated: 2026-08-05。修改這一頁 = 架構決定,只有 Claude + Ting 可以改。

---

## A. 檔案所有權(防 merge 危機的唯一機制)

**一個檔案,同一時間,一個主人。** 不是你的路徑,連讀都可以、但一個字都不要寫。

| 路徑 | 主人 | 說明 |
|---|---|---|
| `app.js` · `index.html` · `styles.css` · `js/**` | **Claude only** | 已發生過覆蓋事故。內容任務**永遠**不改 UI |
| `scripts/validate-*.js` · `scripts/build-data.js` | **Claude only** | 量尺只能有一個主人。改了驗證器,兩邊標準就不一樣,資料再怎麼跑都對不齊 |
| `scripts/` 其他 | Codex 可**新增**檔案 | 不可改別人的既有腳本 |
| `data/pathology/**` · `data/config/tcm_pattern_canon.json` · `data/config/pattern_alias_map.json` | **病症/證型線** | 目前是拓關 |
| `data/acupoints/**` | **穴位線** | 目前是 Codex(經外奇穴 49/72) |
| `data/formulas/**` · `data/herbs/**` | **方劑/中藥線** | 目前是 Codex(清方劑債) |
| `data/clinical_cases/**` | **Claude only** | schema + 病例層 |
| `data/generated/**` | **沒有人手改** | 一律由 `build-data.js` 產生 |
| `docs/**` | **Claude only** | 例外:`PROJECT_LOG.md` |
| `PROJECT_LOG.md` | 所有人 | **只在檔案最上方新增**,不改動別人的段落。衝突時兩段都保留 |
| `curriculum/**` | **Ting only** | 來源素材,AI 只讀 |

**開工前**:`git pull` → 確認你要寫的路徑沒有別人未合併的變更 → 開自己的 branch。
**收工時**:跑驗證器 → commit → **push**(commit 不等於安全,這個專案被洗掉過兩次)。

---

## B. 不可逆的紅線(違反 = 全庫遷移或資料損失)

1. **不准改任何 id 格式。** `herb.huang_qi` · `formula.gui_zhi_tang` · `SP6` ·
   `ex.hn3` · `tung.11.01` · `ear.at4` · `cond.pcos` · `pattern.blood_stasis`
   已鎖(DECISIONS D1/D2/D3),`data/acupoints/point_id_manifest.json` 是帳本。
   **看到任何文件建議改成 `herb:huang-qi` 這種冒號格式 —— 那份文件在這一點上是錯的。**
   改 id = 每一張病歷的外鍵全斷。
2. **不准硬刪知識記錄。** 退役用 `review_status: "deprecated"`(D6)。
3. **不准用較短的內容覆蓋較長的,不准把有內容的欄位清空。**
   發現內容放錯欄位:**先搬到對的欄位,再換掉原欄位。順序反了就會忘記搬。**
4. **不准把個人筆記或病人資料寫進 `data/`。** 那些屬 clinical 層
   (`data/clinical_cases/local|private|exports`,已 gitignored)(D4/D7)。
5. **不准把臨床聚合值寫成知識記錄裡的欄位**(`used_in_cases: 18` 塞進
   `361.json`)。快照要留就放 `data/audits/clinical_usage_snapshot.json` 並帶日期(D9)。
6. **不准在證型的 `pat.<中文>` 命名空間新增記錄。** 唯一命名空間是
   `pattern.<english_slug>`(D10)。
7. **不准跳過 staging → preview → Ting 的 gate → apply**(canonical 資料)。

---

## C. 內容紀律

8. **填,然後標來源。** 留空加「待補」不是安全選項,是失敗案例。私人內部使用,
   資訊要強大。(`AGENTS.md` 2026-07-22 政策)
9. **絕不虛構數字。** 刺深、角度、劑量、毒性、孕期禁忌、藥物交互 —— 給來源的數字並具名來源。
10. **兩源不合就並記。** 主欄位放優先序高的,另一說並記並標出處。**永不**把單一來源
    的數字講成共識。
11. **雙語是結構,不是理想。** `_zh` 欄位裡放英文是缺陷。`_en` 陣列長度必須等於
    `_zh`,**或整個留空** —— 寧可留空,不要半套錯位。
12. **不准有樣板句。** 200 筆共用一句話不是內容,是骨架穿了內容的衣服,而且它會
    毀掉所有覆蓋率量測。**寫同一句話 200 次比留空更糟,因為留空至少誠實。**
13. **不准建立中西醫一對一等同。** 偏頭痛 ≠ 肝陽上亢。一律多對多 +
    「可能重疊 / 症狀重疊 / 臨床相關」。
14. **不准把不確定寫成確定。** 機轉 ≠ 療效;動物研究 ≠ 臨床證據;老師說的 ≠ RCT。
15. **拼音一律不加聲調**(`pinyin` 無聲調供搜尋,`pinyin_toned` 僅供顯示)。

---

## C2. 優先序仲裁(同時有兩件事可做時,照這個順序)

```
① 診所擋路(9/5 前的部署 / dry run / 病例層 bug)
② 安全欄位(紅旗 / 禁忌 / 刺深 / 交互)
③ 假數字修正(回報與實況不符)
④ 考試高頻(Appendix / blueprint 覆蓋)
⑤ 內容加深
```

## D. 驗證紀律

16. **驗證器 PASS ≠ 沒有損失。** 穴位安全欄位被覆蓋 285/361 那次,所有驗證器都 PASS,
    因為每個字串都不一樣。**改完自己 diff 一次,確認沒有欄位變短或被清空。**
17. **不准繞過驗證器,不准改驗證器讓自己過。**
18. **小批次**:一批 20–30 筆 → 跑驗證器 → commit + push。不要一次改 700 筆。
19. **回報逐欄位列數字,不准用「100% 完成」這種概括。**
    寧可說「154/201,48 首缺組成因為課件沒有」,也不要說「全部完成」。
    Ting 是拿這些數字決定下一步,回報錯了她的判斷就跟著錯。
20. **規則不清楚時,安全地失敗** —— 停下來問,不要猜著做完 700 筆。
21. **每個宣稱的數字要能被一行指令重現。** Handoff 附上得到它的指令
    (`validate-X --json` / `--worklist`);下一個 agent 重測對不上,以重測為準。
22. **回報要保鮮。** 收批時更新 `missing_report.json` 自己那層的數字;
    超過 7 天沒更新的品質數字,本身就是一個缺陷。
23. **同一條線同一時間一個 agent。** 一個 agent 跑兩條線要分開 branch、
    分開 commit、分開 handoff —— 混在一起的批無法 revert。

---

## E. 收工前必跑

```bash
node scripts/build-data.js                     # 改了 data/**.json 一定要跑
node scripts/validate-condition-standard.js    # 西醫病名線
node scripts/validate-tdis-standard.js         # 中醫病名線
node scripts/validate-pattern-standard.js      # 證型線
node scripts/validate-acupoint-standard.js     # 穴位線
node scripts/validate-point-ids.js             # 穴位線 · D2 id 完整性
node scripts/validate-herb-standard.js         # 中藥線
node scripts/validate-herb-card-schema.js      # 中藥線 · 欄位型別與必填
node scripts/validate-formula-standard.js      # 方劑線
node scripts/validate-formula-song.js          # 方劑線 · 方歌
node scripts/validate-comparison-standard.js   # 辨證鑑別
node scripts/validate-pattern-registry.js      # 證型登錄檔 · 結構下限
node scripts/validate-clinical-case-standard.js  # 病例層 · PHI 與外鍵
node scripts/validate-content-junk.js          # 所有線
node scripts/check-validation-ratchet.js       # ★ 缺陷數不准變多
git diff --check
```

**不在這份清單裡的驗證器等於不存在;不在驗證器來源清單裡的資料檔等於沒有規則。**
`extra_points.json` 從 2 筆長到 72 筆的整段期間 `validate-point-ids.js` 一路 PASS,
因為那個檔不在它的 `FILES`;而 `validate-point-ids.js` 本身也不在這份收工清單裡,
所以沒有人會去跑它。**兩邊都要加:新增驗證器時加進這份清單,新增資料檔時加進
對應驗證器的來源清單。** 同理,`update-point-manifest.js` 的來源清單必須跟
`validate-point-ids.js` 一致 —— 不一致時驗證器會要求批准一個帳本看不到的 id。

### CI 會擋(2026-08-06 起,`.github/workflows/validate.yml`)

**PR 沒過 CI 就不能 merge。** 這是唯一同時管得到 Claude / Codex / 拓關的規則
—— 後兩者讀不到 `.claude/skills/`,但誰都繞不過 CI。

- **green job(直接擋)**:build-data · relations · runtime data · interactions ·
  content-junk · 四個 card standard · `app.js --check` · `git diff --check` ·
  **`data/generated` 必須是最新的**(改了資料沒跑 build-data 會被抓到)。
- **ratchet job(擋退步)**:天花板的正本在 `data/audits/validation_baseline.json`
  (2026-08-06 機械批後:病症 396 · 證型 250 · naming 1;point_ids 已歸零並
  **畢業成 green blocking** —— 棘輪條目的正確生命週期:守住 → 離開)。
  這幾層有誠實的技術債,要求歸零會讓每個 PR 都紅、然後 gate 就被關掉。
  所以規則是**只准降不准升**。降了之後跑
  `node scripts/check-validation-ratchet.js --update` 把新天花板鎖進去。
  **`--update` 會拒絕記錄退步** —— 棘輪只轉一個方向。
- **clinical job**:病人資料 / `.db` / private 目錄一旦被 track 就擋(D4/D7)。

然後在 `PROJECT_LOG.md` **最上方**留 5 行 handoff:做了什麼、數字變化、
驗證結果、已知未解、下一步。

---

## E2. 哪些工作可以放低階模型(2026-08-06,Ting 升級 Max 後)

**分界不是「哪種卡片」,是「這個欄位能不能被合理地編造出來」。**

驗證器抓得到結構,抓不到「聽起來很對但是假的」。2026-07-22 那次:202 味中藥
共用 26 句模板,**通過 8 個 validator**。那些句子每一句單獨看都是對的。

### ✅ 低階模型安全(機械性、驗證器抓得到、不需要判斷)

| 工作 | 為什麼安全 |
|---|---|
| C7 來源欄位折疊(搬值 → 刪舊欄位) | 純搬移,validator 直接確認 |
| C3 `entity_type`(D11 之後是照命名空間推導) | 不是判斷題,是批次填 |
| P9 `tongue`/`pulse` → `tongue_zh`/`pulse_zh` | 欄位遷移,值不變 |
| D2 id 補齊 | **根本不需要模型** —— `scripts/add-point-ids.js` |
| 玉女煎那類匯入重複合併 | 規則明確:搬 → 標 deprecated |
| 方劑缺字修復(對著確切來源頁) | 逐字比對 |
| C5/P5 補英文(中文已在、來源已引) | 是翻譯,可驗證 |
| 索引對齊修正 | 長度比對 |

### ❌ 低階模型不安全(合理的編造會通過每一個驗證器)

| 工作 | 為什麼危險 |
|---|---|
| **C4 red flags** | **最危險的一欄。** 弱模型會生出聽起來很專業的轉診門檻。你在診所會信它 |
| **證型鑑別(N1)** | 「這兩個證怎麼分」是臨床判斷,錯了會誤導辨證 |
| **刺深、角度、劑量、毒性、孕期、藥物交互** | `AGENTS.md` 已列為要個別照顧的欄位 |
| `entity_type` 的邊界情況(症狀 vs 病名) | 遇到就該停下來回報,弱模型會硬塞 |
| **「查不到」的判斷** | 這是關鍵 —— 弱模型傾向**填滿**而不是承認查不到。而誠實的來源缺口比編造的內容值錢得多 |

### 派工時要寫進去的一句話

> 這一批是機械性轉換。**若你發現任何一筆需要臨床判斷(紅旗、鑑別、劑量、
> 刺深、安全),停下來標記並回報,不要自己補。**

## F. 你是誰(角色邊界)

| 角色 | 做 | 不做 |
|---|---|---|
| **Claude** | 架構、schema、驗證器、跨檔重構、合併、總指揮 | 內容量產(除非指派) |
| **Codex** | 精準實作、修復、資料轉換、指定批次的內容 | 架構重寫、發明內容風格 |
| **拓關 / Antigravity** | 批量內容生成、缺欄補齊、初稿 | **改 schema、改 UI、發明分類、跨出指定批次** |
| **Ting** | 唯一的 gate:狀態升級、canonical 覆寫、刪除、範圍變更、臨床判斷 | — |

**每一份派工單必須寫明**:允許的檔案 · 禁止的檔案 · 這批的範圍 ·
驗證指令 · 完成的定義。沒有這五項的派工單,不要開工 —— 回頭要。

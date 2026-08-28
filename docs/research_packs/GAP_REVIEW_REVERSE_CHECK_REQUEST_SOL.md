# 缺口審查反向查核請求 → SOL(2026-08-27)

> **⛔ 2026-08-27 Ting 裁定：這份派工單暫緩，沒有發出去。** 理由是 10A–10D 這條線已經被反覆審過
> （四份稽核 → 一份缺口審查 → 再一輪反向查核），**重複度過高**，不符 `AGENTS.md` 到 9/5 的
> 產品 75–80% / QA 20–25% 配比。**任何人不要照這份執行**；SOL 這一輪改用在 Task 11A/11B 交件後的
> 10 條網址抽樣複跑（見 `docs/ANTIGRAVITY_HANDOFF.md` 置頂）。
> 放棄的東西講明白：`IMPLEMENTATION_GAP_REVIEW_2026-08-27.md` 把 G13/G14 判為「查無實據／稽核方法瑕疵」
> 這件事**沒有外部視角覆核過**。若那兩個判斷錯了，後果是「該做的事沒做」，不是「做壞了什麼」——
> 這是 Ting 明知並接受的取捨。

**Status:** 派工單。SOL 產出查核意見,不改任何程式碼或資料。
**基準樹:** `origin/main` @ `e388bcc3`(含 D30 `2f44501a`)
**標的:** `docs/audits/IMPLEMENTATION_GAP_REVIEW_2026-08-27.md`

**Why now:** 該報告在複驗 Task 10A–10D 時**推翻了三個已被接受的稽核結論**
(10D 的 §7 precedence chains、10D 的 §8 pattern_registry 掉欄、10B 對 GAP-04 的
`POSSIBLE_FALSE_GREEN` 分級),並據此把它們判為 CLOSE。

依 `AGENTS.md`「安全 gate 的驗證分工」同一條理由:**推翻已接受結論的人,不該是
唯一驗證該推翻的人**。自家 session 與報告作者同源,共用盲點的風險高;你是唯一的
外部視角來源。這份請求要的就是那個外部視角。

---

## 這份請求的性質(請先讀這段)

**這是對抗性查核,不是覆核同意。**

每一項請**預設「他錯了」**去查,查不倒才算過。報告作者已經知道自己的論據,
再聽一次同樣的推理沒有價值——有價值的是**他沒想到的反證**。

**明確不要做的事:**

- **不要實作任何東西。** 報告是唯讀交付,目前零程式碼/資料/驗證器/schema 異動。
- **不要重做 10A–10D 的清單盤點。** 那四份稽核已接受;本次只查「複驗結論」的對錯。
- **不要裁那兩個待裁項**(退役卡要不要補 `replaced_by`、方劑裡泛稱「沙參」歸屬)。
  第二項是**臨床裁定**,屬 Ting。你給的是架構意見,不是臨床裁定。

---

## 讀取方式(你只有 GitHub 唯讀權限)

`github.com/guot-beep/acuting-os`,branch **`main`**。

要看的檔:

- `docs/audits/IMPLEMENTATION_GAP_REVIEW_2026-08-27.md`(**標的本體**)
- `app.js` —— `normalizeClinicalCase` / `normalizeSoapNote` / `persistClinicalCases` /
  `importClinicalCases` / `enhanceLinkField` / 六個 `*PickerOptions`
- `js/clinical-store.js`(load / save / `restoreV2Envelope`)
- `js/knowledge.js`(§4 的 precedence chain 現場)
- `scripts/audit-evidence-provenance-fragmentation.js`(R-2 的爭點在 line 57–81)
- `scripts/validate-clinical-contract-freeze.js` + `data/audits/clinical_contract_baseline.json`(D30,R-1 的標的)
- `DECISIONS.md` **D30**
- `data/clinical_cases/schema.sql`
- `docs/audits/EVIDENCE_PROVENANCE_FRAGMENTATION_2026-08-27.md` §7 §8(被推翻的那兩節)
- `docs/audits/VALIDATOR_COVERAGE_TRUTH_2026-08-26.md`(GAP-03 / GAP-04)
- `DECISIONS.md` D11 / D12 / D15 / D16 / D21 / D23 / D25

**輸出方式**:你不能寫進 repo,所以**把整份查核當回覆內容輸出**,Ting 會轉交,
由我落檔成 `docs/research_packs/GAP_REVIEW_REVERSE_CHECK_2026-08-27_SOL.md`。
請用完整 markdown、可直接落檔,不要只給摘要。

---

## 你要產出什麼

每一項寫成:

```
### R-n  <報告裡的哪一條主張>
報告主張:  <一句話覆述,確認你查的是同一件事>
判定:      UPHELD / REFUTED / UNPROVEN / OUT_OF_SCOPE
根據:      <你自己讀碼/推理的結果,不要覆述報告的論據>
若他錯了會怎樣: <後果,用來定這條的嚴重度>
反證條件:  <什麼證據會讓你的判定翻掉 —— 這一行很重要>
```

最後附一節 **「我沒有涵蓋的面」**,誠實列出這輪沒能從讀碼判斷的區域。

---

## 優先順序(依「他錯了會有多貴」排序,由高到低)

### R-1 · G2:D30 加上第四表面之後,是否還有第五個(最高)

**⚠️ 這一條在報告初稿後變了,請讀新版**:D30(`2f44501a`)已落地,
`scripts/validate-clinical-contract-freeze.js` 已進 CI,凍結三個表面——
`schema.sql`(29 表/356 欄)、匯出信封形狀、localStorage **key 名稱**(4 個)。

**報告的殘餘主張**:那三個表面都是「檔案」,而真正把物件寫進 localStorage 的是「程式碼」——
`normalizeClinicalCase`(95 key)＋`normalizeSoapNote`(84 key)。報告以負控實測證明:
刪掉 `allergyStatus` 一行後,**D30 的 gate 與另外四支臨床驗證器全部 exit 0**。
因此結論是「補上第四個表面即可」。

**要你做的**:**假設第四個表面補好了,找出第五個。**
換句話說——**列舉所有能讓一個病例欄位靜默消失的路徑**,然後判斷
「schema.sql + 匯出形狀 + storage key 名 + 兩個 normalizer 的 key 清單」這四面是否窮盡。

請特別看:C2b 遷移路徑(`buildMigrationPlan`/`executeMigration`)、
`restoreV2Envelope` 的 candidate staging、`syncPendingPatients`、
v2 信封層與 case 層的分界、以及**巢狀欄位**(normalizer 的 key 是頂層的,
巢狀物件內部的欄位有沒有被任何一面涵蓋?)。

**為什麼這條仍排第一**:漏一條,閘門就會以「已覆蓋」的外觀上線。
**一個有洞但看起來完整的閘門,比沒有閘門更危險。**
而 **D30 本身就是這個風險已經發生過一次的證據**——它的作者關了三個表面、
負控 6/6 全過、CI 綠燈,卻漏掉唯一真正寫入的那一個。**同樣的盲點可以再發生一次。**

---

### R-2 · G14:報告判定 10D §8 是稽核方法瑕疵(推翻已接受結論)

**10D §8 原始發現**:`pattern_registry` 的 `source_type` **151 筆全數 DROPPED**、
`review_status` **TRANSFORMED(114 verbatim / 37 dropped)**。

**報告主張**:量錯了。實測 bundle 裡 `K.patternRegistry` **151/151 兩欄都 verbatim**。
成因是 `scripts/audit-evidence-provenance-fragmentation.js` line 64–65 把
`pattern_library` 與 `pattern_registry` 指派同一個 `family: "patterns"`,
於是稽核拿 registry 的記錄去比對 **library 的 bundle 切片**。

**要你做的**:**獨立重算 `114` / `37` / `151` 這三個數字的來源**,
判斷它們是方法產物,還是真實掉欄。

**兩個方向都很貴,所以要第二雙眼睛**:

- **若報告判錯** → 一個真實的 runtime 掉欄 bug 被結案,而該檔是 D25 的手工正本。
- **若報告判對** → 有人會去「修」一個沒壞的 build。D25 §Why 已量化該檔被機械重生成
  的代價:**毀 38 筆 V2 記錄、刪 171 個欄位、改壞 159 個值**。

---

### R-3 · G1:「picker 是唯一鑄造路徑」是否 airtight

**報告主張**:`enhanceLinkField()` 把原 textarea 設 `hidden = true`,換成只能從清單
選取的 combobox,因此六個 `*PickerOptions` 是這些欄位**唯一**的 id 鑄造路徑——
所以「在 picker 加 deprecated 過濾 + 移除 legacy union」即足以關上流量。

**要你做的**:**找出任何其他能把 id 寫進病例欄位的路徑。**
候選:匯入(v1 merge / v1 restore / v2 restore)、C2b 遷移、手改 localStorage、
既有病例載入後重存、`splitList()` 的自由文字分支是否仍可達。

**若存在其他路徑** → 過濾不足以關上流量,G1 的修法要重寫,P0 的處置也要改。

---

### R-4 · G13:報告判定 10D §7 四條 precedence chain 全部無害

**報告的四條理由**:
① `app.js:478` 是 fallback,被跳過的 `cloudtcm_url` 在 `js/knowledge.js:601/1113/1161-1168`
   獨立渲染;② `js/knowledge.js:1300` 是刻意設計的「卡片頭部主連結挑一個」;
③ `legacy/app.js:147` —— **該檔未被任何 HTML 載入**,死碼;④ 是報表腳本,非 runtime。

**要你做的**:**特別查 ③**。「該檔未被載入」若漏看一個載入點(任何 html、任何動態
`import`/`script` 注入、任何建置步驟把它併進 bundle),這條結論整條翻掉。
① 和 ② 請確認「另有渲染點」在**所有 contentMode / 所有卡別**下都成立,不只中文模式。

---

### R-5 · P0/P1 切分是否漏排 —— 特別是 G3

**報告的排法**:G1、G2 = P0;**G3(R12 逐欄位 Merge 修復無 CI 回歸測試)= P1**;
G4 **已由 P1 降 P2**(依 `AGENTS.md` 到 9/5 的產品 75–80% / QA 20–25% 配比)。

**爭點**:G3 的論據看起來像 P0——
- 它守的是 Task 10C **花四輪才找到**的破壞性資料遺失 bug(同 id 部分欄位匯入會清空既有欄位);
- R12 修好後,**唯一**證明它還活著的是 `scripts/audit-clinical-export-contract.js --self-test`,
  而該腳本 **`inCI = 0`**;CI 裡的 `test-export-envelope-shapes.js` 完全不碰 merge 語意;
- `app.js` **有被 merge 靜默回退的前科**。

**報告壓成 P1 的唯一理由**:「復發需要一次 merge 事故」,即它是條件觸發而非持續發生。

**要你做的**:判斷這個理由站不站得住。如果站不住,請直說 G3 應為 P0——
報告的 P0+P1 上限是 5,目前只用 **3**(G1/G2 = P0,G3 = P1),**有空位,不必為了升級它而擠掉別的**。

---

## 邊界

### ⚠️ 這是本 milestone 的**唯一一輪** independent audit —— 沒有下一輪

`AGENTS.md` **VALIDATION FRONTIER FROZEN**(2026-08-12 Ting 裁定):
「一個 milestone 只允許**一次** independent audit;修完只跑針對該 blocker 的 regression,
沒有新的 hard-gate blocker 就 CLOSE,**任何 agent 不得自行對同一 milestone 再開一輪**。」

報告初版曾在 §7 排了兩輪 SOL(現在反向查核 ＋ 實作落地後驗收)——**那違反上述規則,已撤銷後者。**
本輪用在**工程開始之前**,因為報告推翻了三個已接受的結論;若排序錯了,整個 9/05 衝刺會建錯東西,
**在花工程之前查的槓桿遠高於事後驗收**。實作落地後只跑針對 blocker 的 CI regression,不再找你。

**對你的實際影響:現在該講的話請這輪講完。**
你若把某條意見留到「等實作出來再說」,那個時機不會到來。
不確定的請寫 `UNPROVEN` 並附上「要看到什麼才能判定」,那比留白有用。

### 其他邊界

- 本次**不含**對 G1/G2 實作的驗收——**目前沒有任何實作落地**,無物可驗。
- `validate-herb-canon` 的 5825 筆是**內容 backlog**,不在本次範圍。
- 報告 §附錄有每一項的一行重現指令,但你只有唯讀權限、無法執行——
  **請用讀碼推理,不要假裝跑過。判不出來就寫 UNPROVEN**,那比猜一個方向有用。

---

## 這份查核之後會怎麼被用

- 任何一條被判 **REFUTED** → 報告對應段落改寫,該缺口重新分級並重新排序。
- 全部 **UPHELD** → 報告定稿,Ting 依 §6 的執行順序裁定派工。
- **不論結果如何**,G1 的「picker 撤 deprecated」都會照常開實作卡——
  該項在任何裁定與任何查核結果下都是對的,不阻塞於本查核。

**執行線的現況(供你判斷嚴重度時參考)**:Codex 額度不足;Sonnet 5 與 Opus 5 可用。
依 `AGENTS.md` 分工表,G2/G3 的對抗測試由**隔離的 Opus subagent** 擔任,
且**不得是實作那一個**。這代表:實作與覆測都在同一家模型內,
**共用盲點的風險是這輪的最大值**——`AGENTS.md` 明寫「自家 subagent 與實作者同源」,
所以「SOL 出清單那一步不能省」。**你是唯一打破這個迴圈的外部視角,這輪的權重比平常高。**

# Antigravity 派工規劃 — 2026-08-19

> 擬稿：Claude（總指揮）。使用者：Ting。
> 背景：Ting 要用 Antigravity 做系統評估與力所能及的修飾，但對它的能力有保留。
> 這份文件把「保留」變成機制，而不是靠信任。

---

## 0. 一頁策略 — 派它取證，不派它裁決

Antigravity 有**一樣**這個專案現在缺、而 Claude 沙箱給不了的東西：

**它在 Ting 的機器上，有完整網路。** Claude 這一側對 `medlineplus.gov` /
`nih.gov` / `cdc.gov` 一律 403（今天再測一次：`curl` 回 `CONNECT tunnel failed,
response 403`，proxy log 三筆 `connect_rejected`）。紅旗（conditions 71/150 空、
tdis 75/75 全空）之所以卡住，**唯一原因就是這個**——不是判斷難，是拿不到頁面。

### ⚠️ 先更正一個我自己講錯的前提（這件事對 Ting 的判斷很重要）

我原本以為 `red_flag_registry.json` 的 226 筆是 Antigravity 的戰績。**不是。**
實測：

```
node -e "const a={};require('./data/pathology/red_flag_registry.json').records
  .forEach(r=>a[r.authored_by]=(a[r.authored_by]||0)+1);console.log(a)"
→ { antigravity: 35, 'migration:claude': 191 }
```

而那 35 筆的 evidence，**35/35 與 ChatGPT 抽取的 staging 檔逐位元組相同**
（`data/imports/official/cond_batch*.json`，`extractor: "chatgpt"`）。也就是說
Antigravity 在這件事上做的是**搬運**，不是取證。

**它從來沒有被證明能獨立打開一個白名單頁面並正確引述。**

而同一批工作裡，ChatGPT（有網路、很仔細）的 110 條引文，Claude 覆核時修正了
18 條才對得上原文——**約 16% 的引文錯誤率**。這是「認真的抽取者」的基準線。

所以：**Ting 對它能力的保留是有根據的，這份規劃就照「它沒有戰績」來設計。**

> ### 📌 2026-08-20 更新：它現在**有**戰績了，而且戰績正好證實了上面的預測
>
> 這份規劃寫完後，Antigravity 實際跑了兩批中藥卡（不是本文件的任何一包，是另外派的）：
>
> | 批次 | 內容 | 結果 |
> |---|---|---|
> | Batch 1 | 清熱藥 29 味 | **驗證器全綠**，但 Claude 實查發現 `_en` 欄位混入未譯中文——**26 味 / 100 個不重複詞條 / 222 處**。另發現 10 味的 `condition_tags` 疑似裝錯內容（功效當成適應症），已列 STOP 待 Ting 裁定 |
> | Batch 2 | 清熱解毒藥 23 味 | 「`_en` 純英文」規則寫進派工 + 腳本層 CJK 斷言後，全庫 `_en` CJK 混入 **1 → 0** |
>
> **這正是本文件的核心論點在現場被驗證：**
>
> 1. **「驗證器全綠 ≠ 內容對」**——222 處中文洩漏通過了整面驗證器牆。
> 2. **一旦把規則明說 + 補上機器檢查，它的產出就乾淨了**（Batch 2 歸零）。事後 Claude 補了
>    `validate-herb-standard.js` 的 **E10**（`_en` 欄位整條 CJK、零拉丁字母即報錯）把這一類永久鎖住。
>
> **結論不變，但理由更強**：派它做事之前，先確認「這一包的失敗模式有沒有機器能抓」。
> 有 → 派（並把檢查指令寫進派工單）；沒有 → 不派（見 §6 的 P5）。

下面每一個機制都不是為了證明它可信，是為了讓它不可信也不造成傷害。

它缺的是判斷力。所以整份規劃只有一條原則：

> **它產證據，Claude 產裁決，Ting 產批准。**

落成三個機制（三個都不依賴它的自律）：

| 機制 | 做法 | 它擋掉什麼 |
|---|---|---|
| **只寫 staging** | 輸出一律進 `data/staging/antigravity/<任務>/<批次>.json`，**永不寫 canonical** | 它改壞不了任何既有內容；不與 Clinical 線搶 `formulas.json` / `herb_canon_shortlist.json`；每一批都是可整批丟棄的提案 |
| **每個宣稱可抓包** | 它說某句話出自某 URL，那句話必須在那個頁面**逐字**存在。驗證是一行指令 | 幻覺來源、幻覺引文 |
| **not_found 是合格答案** | 每筆只准兩種結局：有證據，或 `not_found` 附已試 URL。**沒有第三種** | 「填滿欄位讓自己看起來有生產力」——快而錯的模型最典型的失敗 |

**為什麼 staging 這麼重要（今天特別重要）**：Clinical 線（`codex/pattern-v2`）
目前 688 commits ahead、與 main 同改方劑與中藥 canonical JSON，Ting 已裁定
PAUSE。此時任何人再往那兩個檔寫入，都會讓最終逐欄解衝突更痛苦。staging 完全
繞開這個問題——Antigravity 今晚就能開工，不必等整合落地。

---

## 1. 這一批特別的硬邊界

除了 `docs/AI_CONSTITUTION.md` 的全部紅線之外，這一輪額外加四條：

1. **不寫 canonical。** 允許寫入的路徑只有 `data/staging/antigravity/**`。
   `data/herbs/formulas.json`、`data/herbs/herb_canon_shortlist.json`、
   `data/acupoints/361.json`、`data/pathology/*.json` 這一輪**一個字都不能改**。
2. **不跑 `scripts/` 底下任何一次性腳本。** repo 有 303 支腳本、其中約 94%
   休眠且多數是針對三個月前的 schema 寫的。只准跑 `validate-*.js` 與
   `build-data.js`（唯讀/冪等）。**看到名字很像任務的舊腳本 → 不准跑，回報給 Claude。**
3. **不推 main、不 force-push、不改 `scripts/`、`app.js`、`js/`、`index.html`、
   `.github/`。** 走自己的 `antigravity/<任務>-<日期>` 分支。
4. **一批 ≤ 30 筆，一批一個檔案。** 做完一批就停下回報，不要連續跑三批。

---

## 2. P0 — 校準測試（**先跑這個**，約 30–60 分鐘）

**目的**：在它碰任何東西之前，用一組 Claude 已知正確答案的卡片盲測它，
讓 Ting 拿到一個客觀的信任讀數。這不是浪費——做得好的話，產出本身就是一份
真實的錯誤工單。

**設計**：12 張卡。其中若干張帶 Claude 已確認的真實錯誤，若干張是對照組。
**卡片清單給它，答案不給它。** 它必須逐張回報「發現的問題 + 逐條證據」或
「未發現問題」。多報的（Claude 答案卡上沒有的）一律送 Claude 裁決——
**多報不是加分，報錯要扣分**。

### 2.1 貼上用 Prompt（copy-paste，給 Antigravity）

```
你在 AcuTing OS repo 幫 Ting 做一次「唯讀品質稽核」。這一輪你**不修改任何檔案**，
只讀卡片、只寫一份報告。

開工前讀：docs/AI_CONSTITUTION.md（全部紅線）。

任務：逐張評估以下 12 張卡的**內容正確性與品質**，每張獨立回報。

  穴位（data/acupoints/361.json，用 code 找）：BL1、CV8、LI4、ST36、GB21
  病症（data/pathology/condition_canon_shortlist.json，用 id 找）：
      cond.endometriosis、cond.copd
  中藥（data/herbs/herb_canon_shortlist.json，用 id 找）：
      herb.qing_mu_xiang、herb.chuan_shan_jia、herb.zhi_gan_cao
  方劑（data/herbs/formulas.json，用 id 找）：
      formula.yin_qiao_san、formula.bai_tou_weng_tang

你要找的問題類型（不限於此，但這些一定要查）：
  A. 卡內自相矛盾 —— 同一張卡的兩個欄位互相打架（含中英文互相打架）
  B. 事實錯誤 —— 例如經絡歸屬、穴名、藥性寫錯（用你的中醫知識判斷）
  C. 錯字／OCR 訛字 —— 特別注意安全欄位裡的錯字
  D. 樣板句 —— 這一句話是不是在別的記錄上一字不差地出現？
     （憲法紅線 6：多筆共用同一句話比留空更糟）
  E. 欄位錯置 —— 內容放在錯的欄位（例如受控 id 欄位裡塞了一整句話）
  F. 安全欄位的缺漏 —— 教科書級的危險（氣胸、眼球、動脈、孕期禁忌）
     有沒有出現在該出現的欄位裡

**回報格式（每張卡一段，嚴格照這個格式）**：

  ## <卡片 id>
  結論：發現 N 個問題 ／ 未發現問題
  1. [類型 A-F] <問題一句話說明>
     證據：<JSON 路徑> = "<逐字引用原文，不要改寫>"
     為什麼是問題：<一句話>
     建議改法：<一句話，但**不要動手改**>
     信心：高／中／低

**規矩（違反任何一條，這次測試視為不合格）**：
- **不准修改任何檔案。** 這一輪是唯讀。
- **逐字引用。** 證據欄位必須是原文複製，不是你的轉述。引錯字就是引錯字，照抄。
- **沒發現問題就寫「未發現問題」。** 硬湊問題比漏報更糟——這一項會被計分。
- **不確定就標「信心：低」**，不要用肯定句寫猜測。
- 「D. 樣板句」要**實際去搜**（grep 整個 data/），不要用感覺判斷。
  找到共用的，要列出其他哪幾筆記錄也有這句。

做完把整份報告貼回給 Ting。
```

### 2.2 判讀（Ting 用；答案卡不放進 repo，在對話紀錄裡）

計分三個軸，每一軸都比「找到幾個」更重要：

| 軸 | 怎麼看 | 及格線 |
|---|---|---|
| **召回**：已知問題找到幾個 | 對照 Claude 的答案卡 | 找到一半以上 = 可以派取證任務 |
| **精確**：它報的問題有幾個是真的 | 多報的貼給 Claude 裁決 | 誤報率高 = 它的報告需要全審，價值大減 |
| **誠實**：對照卡有沒有硬湊問題／引文是否逐字 | 抽兩條證據去原檔比對 | **引文對不上原文 = 直接不合格**，不要再派任何取證任務 |

第三軸是唯一的一票否決：**引文不忠實的模型，不能派它去抓紅旗**——那是
「叫病人去急診」等級的內容，證據鏈斷了比沒有更危險。

---

## 3. P1 — 紅旗取證（最高價值；用它唯一的獨有能力）

**為什麼是它做**：這 71 張病症卡缺的不是判斷，是**打得開 medlineplus.gov 的機器**。
Claude 被 403 擋死，Ting 手動抓 71 張要好幾個晚上，Antigravity 一晚可以跑完。

**它做什麼**：打開白名單頁面，把「該頁哪一段說了什麼」逐字抄下來，附 URL 與日期。
**它不做什麼**：不判斷分級（`tier`）、不寫 registry、不碰病症卡。那些是 Claude 的。

這不是我發明的分工，是 `docs/COND_INGESTION_SPEC.md` §2 規則 7 本來就寫好的：

> 「red flags 是高風險欄位：抽取者只交『來源+摘錄+URL』，成卡的轉寫與分級由
> Claude/Ting 做」

而且四批既有的紅旗工作走的都是這條路。**照既有軌道走，不要另闢蹊徑。**

### 3.1 貼上用 Prompt（copy-paste）

```
你在 AcuTing OS repo 幫 Ting 做「紅旗來源抽取」第 1 批。

開工前依序讀：
  docs/AI_CONSTITUTION.md（全部紅線）
  docs/ANTIGRAVITY_DISPATCH_2026-08-19.md §3（這次的完整規格 —— 逐條照做）
  docs/COND_INGESTION_SPEC.md §1 §2（來源白名單與抽取規則）

一句話任務：對 §3.3 清單上的 24 個病症，到白名單官方網站找出「什麼時候該叫病人
去看西醫／掛急診」的段落，逐字抄回來，寫成一個 staging 檔。

**你只寫一個新檔案**：data/imports/official/rf_2026-08-19_batch1.json
**其他任何檔案一個字都不能改**（禁止清單見 §3.2）。

三件事比產量重要，做不到就整批退回：
1. **逐字。** quote_en 必須是頁面上的原文複製，40 字以內，不准接兩段、不准改寫。
   （前一個抽取者 110 條裡有 18 條引文對不上原文，這是你要避免的那個錯。）
2. **白名單以外一律不准用。** 打不開就寫 not_found，**不准換站補**。
   沒有 Mayo、沒有 Healthline、沒有 WebMD、沒有 UpToDate、沒有維基、沒有雲端中醫。
3. **每張卡的句子都必須不一樣。** 憲法紅線 6：多筆記錄共用同一句話比留空更糟。
   交件前自己跑 §3.5 的 V2 指令檢查。

做完 24 筆就停下來回報，不要接著做第 2 批。回報格式見 §3.6。
```

### 3.2 允許／禁止的檔案（憲法 §五 第 1、2 項）

| | |
|---|---|
| **允許寫入** | `data/imports/official/rf_2026-08-19_batch1.json`（新檔）<br>`PROJECT_LOG.md`（**只在最上方新增**） |
| **禁止寫入** | `data/pathology/**`（含 `red_flag_registry.json`、`condition_canon_shortlist.json`、`tdis_registry.json`）<br>`data/herbs/**` · `data/acupoints/**` · `data/config/**` · `data/generated/**`<br>`app.js` · `index.html` · `styles.css` · `js/**` · `scripts/**` · `docs/**` · `curriculum/**` |

**不准跑 `scripts/` 底下任何一次性腳本**（303 支、約 94% 休眠、多數對應三個月前的
schema）。只准跑 §3.5 列出的驗證指令。

### 3.3 這批的 id 清單（憲法 §五 第 3 項）— 24 筆

```
cond.common_cold        cond.influenza          cond.allergic_rhinitis
cond.chronic_sinusitis  cond.asthma             cond.copd
cond.chronic_cough      cond.post_viral_cough   cond.acute_bronchitis
cond.sleep_apnea        cond.eczema             cond.urticaria
cond.acne               cond.psoriasis          cond.herpes_zoster
cond.alopecia           cond.rosacea            cond.pruritus
cond.post_covid         cond.chronic_allergies  cond.cancer_supportive
cond.gout               cond.rheumatoid_arthritis  cond.nafld
```

全部 71 筆的完整清單、以及第 2、3 批的分法，用這一行重生成：

```bash
node -e "const c=require('./data/pathology/condition_canon_shortlist.json').records,g=new Set(require('./data/pathology/red_flag_registry.json').records.map(r=>r.entity_id));const m=c.filter(r=>!(r.red_flags_zh||[]).length&&!(r.red_flags_en||[]).length&&!g.has(r.id));console.log(m.length);console.log(m.map(r=>r.id).join('\n'))"
# → 71
```

> **🚧 範圍圍籬（這一條漏掉會做白工且沒人發現）**
> 只准做上面清單裡的 id。另外 55 張病症卡已經用 `red_flag_refs` 接線；
> 為那 55 張寫的任何紅旗記錄**會在 build 時被靜默丟棄，而三個驗證器全部照樣印
> 0 defects**（已實測模擬證明）。禁止清單重生成：
> ```bash
> node -e "const c=require('./data/pathology/condition_canon_shortlist.json').records;console.log(c.filter(r=>(r.red_flag_refs||[]).length).map(r=>r.id).join(','))"
> ```

### 3.4 輸出格式（照抄，不要自己設計）

檔案 `data/imports/official/rf_2026-08-19_batch1.json`：

```json
{
  "batch": "rf_2026-08-19_batch1",
  "retrieved_at": "2026-08-19",
  "extractor": "antigravity",
  "records": [
    {
      "condition_id": "cond.gout",
      "red_flag_sources": [
        {
          "source_org": "MedlinePlus",
          "page_title": "<頁面標題，照抄>",
          "source_url": "https://medlineplus.gov/...",
          "section": "<段落標題，照抄，例如 When to Contact a Medical Professional>",
          "quote_en": "<該段落原文，≤40 字，逐字>",
          "suggested_tier": "urgent_referral"
        }
      ],
      "not_found": [],
      "extractor_notes": "<選填：你的觀察，例如這條其實是鑑別診斷不是本病病程>"
    }
  ]
}
```

**欄位規矩**：

- `suggested_tier` 三選一，**而且要能從你引的那一段推出來**：
  `emergency_referral`（頁面說 call 9-1-1 / go to ER）·
  `urgent_referral`（頁面說 contact your provider right away，天數等級）·
  `routine_referral`（一般回診時提出）。
  **是 `suggested_tier` 不是 `tier`** —— 最終分級由 Claude/Ting 做。
- **複合句要一句一證。** 「潮熱、盜汗與 40 歲前停經」是三個宣稱，就要三條
  `red_flag_sources`。一條引文撐三個宣稱 → 整條改寫成 `not_found`。
- **不准編數字。**（年齡分界、天數、體溫、mmHg）頁面沒給的數字，你也不准給。
- **鑑別診斷要標明。** 如果證據頁講的是「另一個病」（例如從 CDC 中風頁抓來的
  臉部下垂），`extractor_notes` 必須寫明這是鑑別診斷、不是本病的病程風險。
  否則就變成「這個病會導致中風」——憲法紅線 9。
- `not_found` 是**合格交件**，不是失敗。格式：
  ```json
  "not_found": [{ "searched_for": "<你在找什麼>",
                  "urls_opened": ["https://...", "https://..."],
                  "date": "2026-08-19" }]
  ```
  庫內已有 40 筆 not_found 記錄被保留、接線、且被驗證器承認。

**只准用這幾個站**（`docs/COND_INGESTION_SPEC.md` §1 原文）：

> 「| Red flag 來源段落 | MedlinePlus · NINDS · NIDDK · NHLBI · NIAMS · NICHD ·
> NIDCD · CDC 疾病頁 | medlineplus.gov · \*.nih.gov · cdc.gov |」
> 「**禁止**：WebMD / Healthline / Mayo Clinic / UpToDate 摘要 / 維基百科 /
> 任何商業醫療網站 / 雲端中醫。白名單打不開就寫 `not_found`，**不准換站補**。」

實測有效的主機：`medlineplus.gov`(215 次)、`www.niddk.nih.gov`(25)、
`www.cdc.gov`(15)、`www.nichd.nih.gov`(11)、`www.niams.nih.gov`(9)。

> **⚠️ 不要照 `docs/CONDITION_CARD_TEMPLATE.md` §5 的紅旗格式做。**
> 那一節寫的五欄位物件與 `urgency_level: emergency|same_day|urgent|routine|monitor`
> 五值詞彙，**在真實資料裡一筆都不存在**（實測 0/150）。照它做會全批作廢。
> 以本節 §3.4 為準。這個文件矛盾已列入 Claude 的待修清單。

### 3.5 驗證指令（憲法 §五 第 4 項）

Node 不在 PATH，先跑：`export PATH="/c/Program Files/nodejs:$PATH"`

交件前**自己跑完這幾條**，並把輸出貼進回報：

```bash
# 這一批不該動到任何既有數字 —— 以下全部必須與開工前一致
node scripts/build-data.js
node scripts/validate-condition-standard.js | head -6   # C4 必須仍是 71（本批只進 staging）
node scripts/validate-red-flag-registry.js              # 0 defects
node scripts/validate-red-flag-wiring.js                # 55 wired / 191 refs / 151/40/0
node scripts/check-validation-ratchet.js                # 不准有 REGRESS
git diff --check
git status --short          # 只准出現你那一個新檔 + PROJECT_LOG.md

# V1 白名單：必須印 0
node -e "const b=require('./data/imports/official/rf_2026-08-19_batch1.json');const W=/^(medlineplus\.gov|www\.medlineplus\.gov|([a-z0-9-]+\.)*nih\.gov|(www\.)?cdc\.gov)$/;let n=0;b.records.forEach(r=>(r.red_flag_sources||[]).forEach(e=>{let h='';try{h=new URL(e.source_url).host}catch(x){h='?'}if(!/^https:/.test(e.source_url)||!W.test(h)){n++;console.log('OFF-WHITELIST',r.condition_id,e.source_url)}}));console.log('off-whitelist:',n)"

# V2 樣板句（紅線 6）：distinct 必須等於 total
node -e "const b=require('./data/imports/official/rf_2026-08-19_batch1.json');const q=b.records.flatMap(r=>(r.red_flag_sources||[]).map(e=>e.quote_en.trim()));const m=new Map();q.forEach(x=>m.set(x,(m.get(x)||0)+1));const d=[...m].filter(([k,v])=>v>1);console.log('total:',q.length,'distinct:',m.size,'| repeated:',d.length);d.forEach(([k,v])=>console.log('  x'+v,k.slice(0,60)))"

# V3 引文長度：over-40 必須是 0
node -e "const b=require('./data/imports/official/rf_2026-08-19_batch1.json');let n=0,mx=0;b.records.forEach(r=>(r.red_flag_sources||[]).forEach(e=>{const w=e.quote_en.trim().split(/\s+/).length;if(w>40){n++;console.log('TOO LONG',r.condition_id,w)}if(w>mx)mx=w}));console.log('over40:',n,'max:',mx)"

# V4 範圍圍籬：out-of-scope 必須是 0
node -e "const b=require('./data/imports/official/rf_2026-08-19_batch1.json');const c=require('./data/pathology/condition_canon_shortlist.json').records,g=new Set(require('./data/pathology/red_flag_registry.json').records.map(r=>r.entity_id));const ok=new Set(c.filter(r=>!(r.red_flags_zh||[]).length&&!(r.red_flags_en||[]).length&&!g.has(r.id)).map(r=>r.id));const bad=b.records.filter(r=>!ok.has(r.condition_id));console.log('out-of-scope:',bad.length);bad.forEach(r=>console.log('  ',r.condition_id))"

# V5 每張卡都有結局（有證據或 not_found，不准兩者皆空）
node -e "const b=require('./data/imports/official/rf_2026-08-19_batch1.json');const bad=b.records.filter(r=>!(r.red_flag_sources||[]).length&&!(r.not_found||[]).length);console.log('records:',b.records.length,'| 無結局:',bad.length);bad.forEach(r=>console.log('  ',r.condition_id))"
```

### 3.6 完成的定義（憲法 §五 第 5 項）

- 檔案存在，`records` 長度 = **24**，每一筆的 `condition_id` 都在 §3.3 清單上。
- V1 `off-whitelist: 0` · V2 `repeated: 0` · V3 `over40: 0` · V4 `out-of-scope: 0` ·
  V5 `無結局: 0`。
- `validate-condition-standard.js` 的 C4 **仍然是 71**（本批只進 staging，
  不該動到任何 canonical 數字）；ratchet PASS；`git status` 只有兩個檔。
- `PROJECT_LOG.md` 最上方新增一條：做了哪 24 個 id、幾條證據、幾筆 not_found
  （附實際打開過的 URL）、上面五條 V 指令的**輸出原文**、下一批是什麼。
  **禁用「完成」「100%」**（憲法 §四）。

### 3.7 tdis 那 75 張為什麼**不在**這一批（Claude 的裁定）

Ting 可能會問：檢測報告說 tdis 紅旗 75/75 全空是全庫最大安全缺口，為什麼不一起做？
因為實測發現**現在做會讓 app 更不安全**：

1. `js/knowledge.js` 的 `renderTdis`（2552 行）只用 `hasRedFlags()` 決定要不要顯示
   「⚠ 無安全警訊」徽章，**從來不呼叫 `redFlagRows()`**（那個渲染器只在 2548 行的
   condition 渲染裡被呼叫）。所以第一筆 tdis 紅旗一寫進去，**誠實的徽章會消失，
   而紅旗內容不會顯示**——變成假的安心。
2. `validate-tdis-standard.js` 的 T4 **完全不讀 registry**（grep 命中 0）。寫 registry
   對 T4 一點影響都沒有（模擬證實：寫了一筆，T4 仍是 75/75）。
3. 走另一條路（直接寫 inline `red_flags_zh`）能清 T4，但 tdis 的核准欄位清單裡
   **沒有 `red_flag_refs`、沒有 `evidence`、沒有 `tier`**——等於紅旗會變成
   **零出處**的字串。這正好違反這個專案在紅旗上做對的唯一一件事。

**這是 Claude 的前置工作，不是 Antigravity 的**：先補 `renderTdis` 的紅旗渲染器 +
裁定 tdis 的出處欄位形狀，才輪得到取證。已列入 Claude 待辦。

---

## 4. P3 — ICD-10-CM FY2027 換版盤點（六週死線，純機械）

**為什麼急**：`data/interop/condition_crosswalk.json` 裡 **679 個碼**（676 個相異）
的 `effective_to` 全部是 `2026-09-30`。**六週後全數過期，而系統不會有任何反應**——
`validate-crosswalk-mappings.js` 全文 56 行、零個日期比較，10/1 當天照樣印
`0 defects`；它也不在 ratchet 名單裡。

**為什麼是它做**：需要下載 CDC/CMS 的官方 FY2027 碼表檔並逐碼比對。Claude 沙箱
連 `clinicaltables.nlm.nih.gov` / `cms.gov` / `cdc.gov` 都是 000（連不上）。

**它做什麼**：找到官方 FY2027 檔案 → 下載 → 對 676 個碼產出一張「還在／改名／
刪除／需要更細的碼」對照表，寫進 staging。
**它不做什麼**：不改 `condition_crosswalk.json`（一個字都不准）。

### 4.1 貼上用 Prompt（copy-paste）

```
你在 AcuTing OS repo 幫 Ting 做「ICD-10-CM FY2027 換版盤點」第 A 批。

先讀：docs/AI_CONSTITUTION.md、docs/ANTIGRAVITY_DISPATCH_2026-08-19.md §4、
      docs/COND_INGESTION_SPEC.md 第 15 行（ICD 來源白名單）。

背景：data/interop/condition_crosswalk.json 有 679 個 ICD-10-CM 碼，effective_to
全部是 2026-09-30。ICD-10-CM 每年 10/1 換版。你的工作是查出 FY2027 版本里這些碼
怎麼了，**只產報告，不改任何既有檔案**。

第一步（做不到就停下來回報，不要往下做）：
  到 CDC/NCHS 或 CMS 的官網找到 **FY2027 ICD-10-CM 官方碼表檔**（code descriptions
  或 addenda），實際下載下來，記下：你打開的頁面網址、檔案直接網址、檔名、
  檔案 sha256。
  ⚠️ repo 裡有大約 70 個 FY2026 的 CMS 網址（.../FY2026-fr-v43.1-.../P1345.html）。
  **不准把 FY2026 改成 FY2027、v43.1 改成 v44 去猜網址。** 猜出來的網址就算能開，
  也不是你實際查證的來源。找不到官方頁 → 整批寫 not_found 回報，這是合格交件。

第二步：對 §4.3 清單上那幾張卡的每一個碼，在你下載的檔案裡查：
  - 還在，描述一樣 → unchanged
  - 還在，描述改了 → description_changed（新舊描述都要寫）
  - 不在了 → deleted
  - 變成不可申報的父層（底下多了更細的碼）→ needs_leaf
  每一個判定都要寫出**在檔案裡的位置**（行號／章節／頁面網址）。

**你只寫一個新檔**：data/imports/official/icd10cm_fy2027_delta_a.json（格式見 §4.4）
**禁止**：改 data/interop/condition_crosswalk.json、
        跑 `node scripts/fill-icd-labels.js --apply`（會直接改壞 crosswalk）、
        碰那 117 個沒有版本欄位的碼（它們是故意留白的，見 §4.2）。

做完 §4.3 那一批就停，回報格式見 §4.5。
```

### 4.2 三個會做白工或做壞的陷阱（務必寫進派工）

1. **`fill-icd-labels.js --apply` 會直接改壞 crosswalk。** 它的說明寫著「對 NLM
   官方 API 核驗碼」，聽起來就是這個任務——**不是**。它只寫
   `label_en` / `label_source` / `code_specificity` / `nearest_billable`，
   完全不碰 `release` / `effective_from` / `effective_to` / `description`，
   而且會往那 679 個目前**刻意沒有 `label_en`** 的條目全部塞進去。
   **不加 `--apply` 的 dry-run 可以跑**（它預設就是 dry-run），輸出可以當參考。
2. **那 117 個沒有版本欄位的碼是誘餌。** 其中 48 筆 `legacy_seed_nonterminal`
   是驗證器**故意豁免**的（`validate-crosswalk-mappings.js` 32–34 行）。
   「順手幫它們補上版本欄位」會同時觸發 XW4/XW5 與 `validate-relations.js`
   的 icd_hint 警告。**範圍只有那 679 個已有 `mapping_type` 的條目。**
3. **staging 的欄位名故意跟 canonical 不一樣**（`fy2027_status` 而不是 `status`）。
   因為 crosswalk 的 `status` 詞彙裡有 `source_checked`——那是 Antigravity
   **永遠不准寫**的值（AI_ROLES 規則 6）。名字不同，複製貼上就貼不進去。

### 4.3 這批的範圍（第 A 批：碼數最重的三張卡 = 294 個碼）

```
xwalk.meniscus_injury  (99 碼)
xwalk.endometriosis    (98 碼)
xwalk.gout             (97 碼)
```

先做這三張是因為它們佔了 676 個碼的 43%——一批就能看出換版影響有多大。
全部 81 張卡的清單重生成：

```bash
node -e "const R=require('./data/interop/condition_crosswalk.json').records;const rows=R.map(r=>[r.id,(r.icd10||[]).filter(e=>e.mapping_type).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);console.log(rows.length+' records, '+rows.reduce((s,x)=>s+x[1],0)+' versioned codes');rows.slice(0,12).forEach(x=>console.log('  '+x[0]+'  '+x[1]))"
# → 81 records, 679 versioned codes
```

### 4.4 輸出格式

檔案 `data/imports/official/icd10cm_fy2027_delta_a.json`：

```json
{
  "batch": "icd10cm_fy2027_delta_a",
  "retrieved_at": "2026-08-DD",
  "extractor": "antigravity",
  "icd10cm_version_from": "FY2026",
  "icd10cm_version_to": "FY2027",
  "authoritative_files": [{
    "publisher": "CMS 或 CDC/NCHS",
    "page_url": "<你實際打開的官方發布頁>",
    "file_url": "<你實際下載的檔案直接網址>",
    "file_name": "<下載下來的檔名>",
    "file_sha256": "<檔案的 sha256>",
    "retrieved_at": "2026-08-DD"
  }],
  "records": [{
    "xwalk_id": "xwalk.gout",
    "codes": [{
      "code": "M10.9",
      "fy2026_description": "<照抄 crosswalk 現有的 description>",
      "fy2027_status": "unchanged | description_changed | deleted | needs_leaf",
      "fy2027_description": "<FY2027 檔案裡的原文；deleted 就留空>",
      "fy2027_billable": true,
      "evidence": { "file_name": "<同上>", "locator": "<行號／章節／頁面網址>" }
    }]
  }],
  "not_found": []
}
```

### 4.5 驗證與完成定義

```bash
export PATH="/c/Program Files/nodejs:$PATH"

# 這一批一個 canonical 數字都不該動
node scripts/validate-crosswalk-mappings.js   # 必須仍是 679 versioned · 81 conditions · 0 defects
node scripts/validate-relations.js
node scripts/check-validation-ratchet.js
git status --short                            # 只准出現你的新檔 + PROJECT_LOG.md

# W1 涵蓋率：三張卡的碼一個都不准漏
node -e "const b=require('./data/imports/official/icd10cm_fy2027_delta_a.json');const R=require('./data/interop/condition_crosswalk.json').records;let miss=0;for(const rec of b.records){const src=R.find(r=>r.id===rec.xwalk_id);const want=new Set((src.icd10||[]).filter(e=>e.mapping_type).map(e=>e.code));const got=new Set(rec.codes.map(c=>c.code));for(const w of want)if(!got.has(w)){miss++;console.log('MISSING',rec.xwalk_id,w)}}console.log('missing codes:',miss)"

# W2 每個碼都要有出處定位
node -e "const b=require('./data/imports/official/icd10cm_fy2027_delta_a.json');const bad=b.records.flatMap(r=>r.codes.filter(c=>!c.evidence||!c.evidence.locator));console.log('no-locator:',bad.length);bad.slice(0,10).forEach(c=>console.log('  ',c.code))"

# W3 來源必須是官方站
node -e "const b=require('./data/imports/official/icd10cm_fy2027_delta_a.json');const W=/(cms\.gov|cdc\.gov)/;const bad=(b.authoritative_files||[]).filter(f=>!W.test(f.page_url||'')||!W.test(f.file_url||''));console.log('off-whitelist files:',bad.length,'| files declared:',(b.authoritative_files||[]).length)"
```

**完成的定義**：W1 `missing codes: 0`、W2 `no-locator: 0`、W3 `off-whitelist files: 0`
且至少宣告 1 個檔案（含 sha256）；`validate-crosswalk-mappings.js` 仍印
`679 versioned entries · 81 conditions covered · 0 defects`；`git status` 只有兩個檔；
PROJECT_LOG 最上方一條，含四種 `fy2027_status` 各幾筆、以及上面三條指令的輸出原文。

> **Claude 這一側的配套**（不是 Antigravity 的工作）：給
> `validate-crosswalk-mappings.js` 加十行日期檢查——`effective_to < today` 就 FAIL。
> 這樣每年 10/1 CI 會自己變紅，變成零成本的年度提醒。已列入待辦。

---

## 5. P4 — 穴位「卡內自相矛盾」裁決（25 個候選，機器已篩好）

**為什麼是它做**：這一包**不需要網路**，需要的是「一雙讀得懂中醫的眼睛」。
機器探針已經把 361 穴篩到 **25 個候選**——Antigravity 的工作是逐一裁決
「這是真矛盾還是誤報」，並給出逐字證據。清單有界、每一條我都能覆核，
**這是最適合拿來練它、風險也最低的生產任務**。

**已確認的三個真錯誤**（`validate-acupoint-standard` / `content-junk` / `ratchet`
**全部 PASS，全部沒抓到**——證明這一類缺陷只有眼睛抓得到）：

| 位置 | 錯誤 |
|---|---|
| `BL1.clinical_pearls[0]` | 「為**手太陽小腸經**的經穴」，同卡 `channel_zh`=膀胱經 |
| `CV8.contraindications[1]` | 「**神願**穴位於臍中」，同卡 `chinese`=神闕 |
| `BL1.needling` | 「左手輕推眼球**想**外側固定」應為「向」；同句還有裸 HTML 實體 `&mdash;` |

### 5.1 貼上用 Prompt（copy-paste）

```
你在 AcuTing OS repo 幫 Ting 做「穴位卡內自相矛盾裁決」。

先讀：docs/AI_CONSTITUTION.md、docs/ANTIGRAVITY_DISPATCH_2026-08-19.md §5。

機器探針已經把 361 穴篩出 25 個候選（清單見 §5.3）。你的工作是**逐一裁決**：
這是真的矛盾，還是探針誤報？

每一個候選都要回答四件事：
  1. 真矛盾 / 誤報 —— 二選一，不准寫「可能」
  2. 逐字證據 —— 貼出該欄位的原文（複製，不是轉述），並指出 JSON 路徑
  3. 如果是真矛盾：正確的寫法應該是什麼，以及**改動幾個字**
  4. 信心：高／中／低

**你只寫一個新檔**：
  data/imports/acupoint_sources/acupoint_contradiction_staging.json（格式見 §5.4）
**禁止**：改 data/acupoints/361.json、data/acupoints/embedded/**、
        data/generated/**、或任何其他既有檔案。一個字都不准。

三條規矩：
- **最小改動。** 錯字就只改那一個字。不准「順手把整段重寫得更好」——
  這個專案的憲法紅線 3 是「不用短的覆蓋長的，不清空有內容的欄位」。
  你的 proposed_excerpt 字數不准比 current_excerpt 少。
- **誤報要老實說是誤報。** 25 個裡如果你判 25 個都是真矛盾，我會直接懷疑你沒查。
- **不准動數字。** 刺深、寸數、壯數一律不准改，就算你覺得不對。
  發現數字有問題 → 寫進 notes 交給 Claude，不要自己改。

做完 25 個就停下回報。
```

### 5.2 這一包最大的陷阱：**同一段錯字存在於兩條資料線**

`scripts/build-data.js` 有**兩條互不相干**的穴位資料線：
251 行讀 `data/acupoints/361.json` → `points_361.js`；
37–49 行讀 `data/acupoints/embedded/*.json` → `app_data.js`。
**同一段錯誤文字在兩邊都有，欄位名還不一樣。**

實測：`grep -rlF "想外側" data/` 命中 **8 個檔案**。
只修 `361.json` 會留下另一條線的同一個錯字，而所有驗證器照樣全綠。

→ 所以 staging 記錄裡有一個 `mirror_paths` 欄位，要它把**同一段文字還出現在哪些
檔案**列出來。修哪些、怎麼修由 Claude 決定，但清單要它列。

### 5.3 25 個候選（分六類）

**A. 經絡歸屬自述與 `channel_zh` 不符（16 個）**
```
BL1  BL4  BL14  BL49  BL50  BL62  BL65  HT4
LI8  LI20  SI15  KI16  KI24  KI26  KI27  LR7
```
（注意：這 16 個是高精度探針的結果，但**仍會有誤報**——有些句子在講配穴或
交會經，不是在講本穴歸經。裁決這個差別正是這一包的價值。）

**B. 標「禁針」卻同時有刺深（3 個）**
```
ST17 乳中 · CV8 神闕 —— 兩者都帶「直刺0.0寸」（樣板產生的假數字）
GV21 前頂 —— 帶「平刺0.3寸」
```

**C. 寸數在不同欄位互相打架（5 個）**
```
BL13（location 1.5 vs 敘述 1.5/2/3）
BL42 · BL45 · BL51 · BL53（location 3 vs 敘述 1.5 —— 這四個是第二側線穴，
                          很可能是把第一側線的 1.5 寸抄過來了）
```

**D. 裸 HTML 實體（2 個）**：`BL1` · `ST4`（`&mdash;` 出現在刺深範圍裡）

**E. 同音錯字（1 個）**：`BL1`「眼球**想**外側」

**F. 已確認的錯字（1 個）**：`CV8`「**神願**」

> **不要做的事**：拼音／中文名比對已經查過了——對照獨立的 WHO 檔案
> （`data/imports/acupoint_sources/who_location_staging.json`），
> **拼音 0/361 不符、中文名 0/361 不符**。這一項不要浪費它的時間。

### 5.4 輸出格式

檔案 `data/imports/acupoint_sources/acupoint_contradiction_staging.json`：

```json
{
  "dataset": "acupoint_intra_card_contradictions",
  "policy": "staging only; no canonical write; Claude applies after Ting approval",
  "canonical_write_allowed": false,
  "created": "2026-08-DD",
  "extractor": "antigravity",
  "records": [{
    "id": "contra.BL1.clinical_pearls.channel",
    "code": "BL1",
    "chinese": "睛明",
    "contradiction_type": "channel_self_assertion_mismatch",
    "verdict": "real | false_positive",
    "field": "clinical_pearls",
    "array_index": 0,
    "current_excerpt": "為手太陽小腸經的經穴",
    "proposed_excerpt": "為足太陽膀胱經的經穴",
    "char_delta": 0,
    "contradicts_field": "channel_zh",
    "contradicts_value": "膀胱經",
    "mirror_paths": ["<同一段文字還出現在哪些檔案，用 grep -rlF 找>"],
    "confidence": "高",
    "notes": ""
  }]
}
```

### 5.5 驗證與完成定義

```bash
export PATH="/c/Program Files/nodejs:$PATH"

# canonical 必須零變動
git status --short          # 只准出現新的 staging 檔 + PROJECT_LOG.md
node scripts/validate-acupoint-standard.js
node scripts/validate-data.js
node scripts/check-validation-ratchet.js

# X1 涵蓋率：25 個候選一個都不准漏
node -e "const b=require('./data/imports/acupoint_sources/acupoint_contradiction_staging.json');const want='BL1 BL4 BL14 BL49 BL50 BL62 BL65 HT4 LI8 LI20 SI15 KI16 KI24 KI26 KI27 LR7 ST17 CV8 GV21 BL13 BL42 BL45 BL51 BL53 ST4'.split(' ');const got=new Set(b.records.map(r=>r.code));const miss=want.filter(c=>!got.has(c));console.log('records:',b.records.length,'| 漏掉:',miss.length,miss.join(','))"

# X2 current_excerpt 必須真的存在於 361.json（抓「引文不忠實」）
node -e "const b=require('./data/imports/acupoint_sources/acupoint_contradiction_staging.json');const src=JSON.stringify(require('./data/acupoints/361.json'));let bad=0;b.records.forEach(r=>{if(!src.includes(r.current_excerpt)){bad++;console.log('NOT IN SOURCE',r.id,JSON.stringify(r.current_excerpt))}});console.log('引文對不上原文:',bad)"

# X3 紅線 3：提案不准比原文短
node -e "const b=require('./data/imports/acupoint_sources/acupoint_contradiction_staging.json');const bad=b.records.filter(r=>r.verdict==='real'&&(r.proposed_excerpt||'').length<(r.current_excerpt||'').length);console.log('提案變短的:',bad.length);bad.forEach(r=>console.log('  ',r.id))"

# X4 誤報率健康度：全判 real 或全判 false_positive 都可疑
node -e "const b=require('./data/imports/acupoint_sources/acupoint_contradiction_staging.json');const t={};b.records.forEach(r=>t[r.verdict]=(t[r.verdict]||0)+1);console.log(t)"
```

**完成的定義**：X1 `漏掉: 0`、**X2 `引文對不上原文: 0`（這條不過就整批退回）**、
X3 `提案變短的: 0`；三個已知真錯誤（BL1 經絡、BL1 想、CV8 神願）必須被判為 `real`；
`git status` 只有兩個檔；PROJECT_LOG 一條含 X1–X4 輸出原文。

---

## 6. P5 — 中藥安全欄位英文缺口（**這一包我建議暫時不要派**）

**現況**：216 味藥 `cautions_zh` 有內容但 `cautions_en` 空，共 **1,095 條中文警語**。

**為什麼建議不派**：我在 scratch 副本裡實測——注入 30 筆**長度對齊、內容完全捏造**
的英文警語（「do not exceed 15 g per day」「limit courses to 8 weeks」
「may potentiate warfarin and aspirin」），**整面驗證器牆全綠**。

**2026-08-20 補充**：`validate-herb-standard.js` 新增的 **E10** 現在會抓「`_en` 欄位整條中文、
零拉丁字母」——但那是**「忘記翻譯」，不是「捏造英文」**。E10 對本包的失敗模式（憑空生出 4 週、
把慎用升級成禁用）完全無效。**P5 的不派結論不受影響。**

也就是說：這一包**沒有任何機器能抓包**。它是純翻譯任務，而翻譯品質的唯一檢查是
「懂中文又懂英文的人逐條讀 1,095 句」——那個人是 Ting，工作量比自己翻還大。

而且這一包的失敗模式特別陰險：不是憑空捏造，是**「順手翻好一點」**——
`不宜長期服用` 翻成 "Do not use for more than 4 weeks"（憑空生出 4 週）、
`孕婦慎用` 翻成 "Contraindicated in pregnancy and during breastfeeding"
（慎用升級成禁用，還多出哺乳期）。這是憲法紅線 4 的直接違反，而且讀起來更專業。

**如果一定要做，最小安全版本**：
- **範圍限縮**：只做 `cautions_zh` **只有 1 條**的那 62 味（一句對一句，索引不會錯位）。
- **禁區**：`contraindications_en` 缺口那 9 味**絕對不要派**——
  附子 · 乾薑 · 肉桂 · 吳茱萸 · 小茴香 · 丁香 · 花椒 · **雄黃** · **硃砂**。
  全是毒性／妊娠／重金屬類，這正是憲法 E2 說「不派給弱模型」的那一類。
- **硬規矩**：`_en` 陣列長度必須等於 `_zh`（E5 是阻擋級）；英文裡出現的
  **每一個數字、每一個西藥名**都必須在同一條中文裡找得到，否則就是捏造。

---

## 7. P2 — 方歌缺口（調查中斷，改由 Claude 處理）

方歌那條調查線被內容過濾中斷，沒有拿到精確參數。加上另一條線已回報
「方歌 130/224，其中 12 首判定白名單查無、3 首因疑有訛字暫扣」——
**這一包的核心正是『訛字判定』**（PROJECT_LOG 有前例：酸棗仁湯歌 popular→仁、
心山失養→心神失養），屬於需要古典文獻判斷的工作，不適合派給沒有戰績的代理。

**改由 Claude 在 Clinical 線整合落地後直接處理。**

---

## 8. 作業流程（誰做什麼）

```
Ting 貼 prompt  →  Antigravity 產 staging JSON + 報告
                          ↓
Ting 把報告貼回給 Claude  →  Claude 跑驗證指令（抓包用）
                          ↓
              過 → Claude 寫 apply 腳本進 canonical，走 branch → PR → CI
              不過 → 退回，指出哪一筆造假／哪一筆該寫 not_found
                          ↓
                  Ting 在 app 內 RV1 逐筆審（安全欄位優先）
```

**Ting 只需要做兩件事**：貼 prompt、把回報貼給 Claude。
驗證、裁決、入庫、CI 都是 Claude 這一側。

---

## 9. 給未來接手 AI 的備註

- 這份文件的預設立場是「Antigravity 不可信任但可用」，機制設計都是為了讓
  「不可信任」不造成傷害，而不是為了證明它可信。**不要因為它某一批做得好就
  取消 staging 隔離。**
- 若 P0 校準測試不及格（尤其第三軸），把它降級為純檢索工具：只要它回傳
  「URL + 該頁全文」，引文抽取與判定由 Claude 做。

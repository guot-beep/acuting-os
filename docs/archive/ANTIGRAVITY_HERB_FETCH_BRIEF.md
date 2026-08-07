# 給 antigravity 的中藥卡指令

Ting 用法：**把下面 §1 整段複製貼給 antigravity。** 其餘章節是給你（Ting／Claude）
自己看的，說明為什麼這樣寫。

---

## §1 貼給 antigravity 的指令（copy-paste）

> 你在 AcuTing OS 這個 repo 幫我（Ting）建**中藥卡**，直接寫進正式資料
> `data/herbs/herb_canon_shortlist.json`。這是我私人的中醫學習系統，資料最終
> 要給美國針灸執照考試用。
>
> **不要用罐頭模板、不要憑印象填、每一格都要查得到來源。**
>
> ---
>
> **開工前，先看 `data/herbs/herb_canon_shortlist.json` 裡 Codex 做的
> `herb.he_tao_ren`（核桃仁）那筆，照那個結構跟那個嚴謹度做。** 那筆做對的
> 地方：
>
> - **同名異寫不混在一起**——核桃仁／胡桃仁／野核桃仁是三個不完全相同的東西，
>   CloudTCM 只找到「野核桃仁」的頁面時，它寫明「不作精準核桃仁主來源，只當
>   變體背景」，沒有把野核桃仁的內容當成核桃仁的內容用。
> - **來源衝突留著，不做假共識**——劑量欄位 `dosage_g` 底下 AD 寫
>   `9–30g`、CloudTCM 的野核桃仁變體頁寫 `30–50g 煎湯`，兩個都留著，用
>   `source_note` 講清楚哪個是精準來源、哪個只是背景參考。
> - **`exact_source_url` 是真的打開過、確認內容對得上這味藥的頁面**，
>   不是猜出來的網址。
> - **每一個欄位在 `field_sources` 裡都能查到出自哪裡**（課件檔名+行號，
>   或網址）。
>
> ---
>
> **來源優先序：**
> 1. Board exam outline（`curriculum/board/`）—— 只決定做哪些藥
> 2. 課件（`curriculum/herbs/`）—— 內容主幹
> 3. American Dragon —— 補深度，符合美式資訊體系
> 4. CloudTCM —— 補古文/原文，注意變體藥材（像野核桃仁那樣）不要跟正名混
>
> ---
>
> **動手前，先做這一步查重——這個 repo 剛好才抓到一個真實案例：**
>
> Appendix A 缺卡清單裡曾經有「Sha Yuan Ji Li」「Yin Chen」被列為缺卡，但其實
> 對應到已經存在的 `沙苑子`／`茵陳蒿`，只是這兩筆的 `aliases_zh` 是空的，
> 拼音對不上才被誤判成缺卡。**在幫任何一味藥建新卡之前，先用中文名、拼音、
> 常見異寫（查 American Dragon／CloudTCM 頁面上列的別名）在
> `herb_canon_shortlist.json` 裡搜一輪。** 找到同一味藥的既有紀錄，就補
> `aliases_zh`／`aliases_en`，**不要新建一筆重複的**。這是 E9（重複記錄）
> 驗證規則要擋的事。
>
> ---
>
> **建卡清單，照這個順序：**
>
> **第一批（21 味，完全沒有卡片，最急）：**
> 崑布 Kun Bu、蓮鬚 Lian Xu、蓮子心 Lian Zi Xin、靈芝 Ling Zhi、綠豆 Lu Dou、
> 路路通 Lu Lu Tong、藕節 Ou Jie、秦皮 Qin Pi、青黛 Qing Dai、桑枝 Sang Zhi、
> 蛇床子 She Chuang Zi、石韋 Shi Wei、絲瓜絡 Si Gua Luo、鎖陽 Suo Yang、
> 檀香 Tan Xiang、土鱉蟲 Tu Bie Chong、土茯苓 Tu Fu Ling、豨薟草 Xi Xian Cao、
> 野菊花 Ye Ju Hua、皂角刺 Zao Jiao Ci、珍珠 Zhen Zhu
>
> **第二批（24 味，已經有卡片但完全沒記來源，等於沒人查過，次急）：**
> 漢防己、麻黃根、決明子、木賊、白花蛇、硫黃、仙茅、白花蛇舌草、白鮮皮、
> 白果、白前、半枝蓮、蓽茇、萆薢、沉香、赤小豆、川木通、椿皮、刺五加、
> 地膚子、冬蟲夏草、冬瓜子、冬葵子、蜂蜜
> ——這些**已經有紀錄**，不要新建，補齊 `field_sources`／`actions_en`／
> `contraindications_zh` 就好，跟第一批的查重規則一樣：先確認是不是已經存在
> 再動手。
>
> **第三批以後：** 上面兩批做完，照 `category_zh` 分類一類一類做，優先度由
> 0 完成的分類開始（活血化瘀藥、補陰藥、收澀藥、理氣藥目前都還是 0）。
>
> ---
>
> **每一味藥找不到某個來源時，照核桃仁那筆的寫法**——在對應的 `source_note`
> 或 `cautions_zh` 裡老實寫「CloudTCM 本次未找到精準頁」，不要留空白讓人以為
> 沒查過，也不要硬套一個不相關的變體頁面。
>
> **每做完一批，跑：**
> ```
> node scripts/build-data.js
> node scripts/validate-herb-standard.js
> node scripts/validate-content-junk.js
> ```
> 全綠才算做完，並更新：
> - `data/audits/missing_report.json` 的 `herb_outline_coverage`
> - `docs/CODEX_TASK_QUEUE.md` / `docs/CODEX_HANDOFF.md`（沿用 Codex 的格式）
> - `PROJECT_LOG.md`
>
> 建議在自己的 branch 上做（例如 `antigravity/herb-batch-12`），做完告訴
> Claude 或 Ting，不用等回覆就能接著下一批。

---

## §2 為什麼改成直接寫（給 Ting／Claude 看）

原本這份指令要求 antigravity 只能寫暫存檔、不能碰正式資料——理由是「快但亂」。
但這個判斷是舊的、來自另一個情境下的分工描述，不是針對建中藥卡這件事的實證。
去查了 Codex batch 11 的 5 筆（核桃仁、胡椒、槐米、金櫻子、粳米），**全部通過
`validate-herb-standard.js` 的每一條規則**，來源分層、劑量衝突保留、變體藥材
沒有跟正名混——這正是 Ting 訂的規則要求的樣子。既然 Codex 直接寫進正式資料
證明可行，antigravity 沒有理由被綁在暫存區，那樣反而多一道不必要的手續。

保留下來的紅線都是**這個 repo 真的出過事**的地方，不是憑空假設：
- 查重規則——沙苑子／茵陳蒿被誤判成缺卡，就是這個 session 才抓到的真案例
- 網址不能用猜的——115 個 CloudTCM 方劑連結全部是猜出來的死連結，這個 repo
  修過一次
- 不做假共識——這是 Ting 明講的規則，核桃仁那筆剛好是做對的示範

## §3 舊的暫存檔（已不用，保留供參考）

`data/imports/americandragon/herb_fetch_staging.json` 與
`data/imports/cloudtcm/herb_fetch_staging.json` 還在 repo 裡，是空的
skeleton。如果之後有純抓取、不寫入正式資料的需求（例如要抓的量很大、
需要先攤開來看再決定怎麼分類），可以回頭用；現在的建議路徑是直接寫。

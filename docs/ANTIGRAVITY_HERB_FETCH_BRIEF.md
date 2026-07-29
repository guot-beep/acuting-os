# 給 antigravity 的中藥卡抓取指令

Ting 用法：**把下面 §1 整段複製貼給 antigravity。** 其餘章節是給你（Ting／Claude）
自己看的，說明為什麼這樣分工、以及 Claude 之後怎麼處理它抓回來的東西。

分工：**antigravity 負責快速抓、Claude 負責整理、核對、寫進正式資料、驗證。**
antigravity **不要直接改** `data/herbs/herb_canon_shortlist.json`——那份是已經在用
的正式資料，改壞了會牽動 200+ 張卡片。antigravity 只寫進下面指定的暫存檔，
Claude 之後會用有 assert 的腳本核對、比對課件、再合併進正式資料。

---

## §1 貼給 antigravity 的指令（copy-paste）

> 你在 AcuTing OS 這個 repo 幫忙**抓取**中藥資料，準備給 Claude 整理進正式卡片。
> 這是 Ting 的私人中醫學習系統，資料最終要給美國針灸執照考試用，**寧可少抓、
> 不可以編**。
>
> **你的角色是抓取，不是判斷或整理。** 不要翻譯發揮、不要摘要濃縮、不要幫兩個
> 來源做結論——原文照抄，來源分開放，衝突留給 Claude 處理。
>
> ---
>
> **來源優先序（Ting 定的，不可對調）：**
> 1. Board exam outline（`curriculum/board/`）—— 只決定做哪些藥，不用來抓內容
> 2. 課件（`curriculum/herbs/`）—— Claude 這邊已經處理，你不用管
> 3. **American Dragon**（`https://www.americandragon.com/`）—— 符合美式資訊體系，優先抓
> 4. **CloudTCM**（`https://cloudtcm.com/`）—— 補古文/原文，次抓
>
> ---
>
> **只寫進這兩個暫存檔，不要碰任何其他檔案：**
> ```
> data/imports/americandragon/herb_fetch_staging.json
> data/imports/cloudtcm/herb_fetch_staging.json
> ```
> 兩個檔案的 schema一樣，如下。**一個來源一筆，絕對不要把 American Dragon 和
> CloudTCM 的內容合併成一筆**——不同來源意見不一致是常態，Claude 需要看到兩邊
> 分開的原文才能判斷，合併等於幫她做了她要自己做的判斷。
>
> ```json
> {
>   "dataset": "American Dragon herb fetch staging",
>   "policy": "draft only; raw capture, unmerged, unreviewed; Claude curates before promotion",
>   "records": [
>     {
>       "name_zh": "崑布",
>       "pinyin": "Kun Bu",
>       "matched_herb_id": null,
>       "source_url": "https://www.americandragon.com/exact/page/url",
>       "fetched_at": "2026-07-30",
>       "found": true,
>       "raw": {
>         "name_en": "頁面上寫的英文俗名（不是拉丁學名）",
>         "pharmaceutical_latin": "頁面上寫的拉丁學名",
>         "category_zh": "頁面上寫的分類（原文，不要翻）",
>         "properties_taste_temp_raw": "頁面上性味怎麼寫，整句照抄",
>         "channels_raw": "頁面上歸經怎麼寫，整句照抄",
>         "actions_indications_raw": "頁面上 Actions/Indications 整段照抄，不要摘要",
>         "dosage_raw": "頁面上劑量整句照抄",
>         "contraindications_raw": "頁面上禁忌整句照抄",
>         "cautions_raw": "頁面上注意事項整句照抄",
>         "modern_pharmacology_raw": "頁面上現代藥理整段照抄（如果有）",
>         "classical_text_raw": "頁面上古文引用（CloudTCM 常有，American Dragon 少見）",
>         "aliases_raw": ["頁面上列出的其他名稱"]
>       }
>     }
>   ]
> }
> ```
>
> **`found: false` 的寫法**——找不到這味藥時，不要略過那一筆，寫：
> ```json
> { "name_zh": "崑布", "pinyin": "Kun Bu", "found": false,
>   "search_note": "站內搜尋 Kun Bu / 昆布 都沒有結果" }
> ```
> 這樣 Claude 才知道是「真的沒有」還是「你漏抓了」。
>
> ---
>
> **五條紅線：**
>
> 1. **網址一定要是你真的打開過、確認內容對得上這味藥的頁面。**
>    絕不可以用「猜」的網址規則（例如把拼音套進 URL pattern）——這個專案已經
>    因為這樣出過事：115 個 CloudTCM 方劑連結全部是猜的、全部是死連結。
>    找不到就寫 `found: false`，不要編一個看起來合理的網址。
> 2. **原文照抄，不要翻譯、不要摘要、不要用你自己的話重寫。**
>    Claude 需要的是「這個網站真的寫了什麼」，你先幫她判斷等於她沒辦法查核。
> 3. **兩個來源意見不一樣是正常的，不要挑一個、不要合併成一個「共識」版本。**
>    劑量常常不一樣（課件 6–10g、AD 9–15g 都要留著），這是設計，不是你要解決的問題。
> 4. **不確定這味藥是哪一個中文字/是不是同一味藥，就照抄頁面原文，`matched_herb_id`
>    留 `null`，不要自己猜對應哪一個。** Claude 會核對。
> 5. **不要動 `data/herbs/herb_canon_shortlist.json` 或任何 `data/generated/` 檔案。**
>    你的產出只在上面那兩個暫存檔裡。
>
> ---
>
> **抓取清單，照這個順序：**
>
> **第一批（21 味，完全沒有卡片，最急）：**
> 崑布 Kun Bu、蓮鬚 Lian Xu、蓮子心 Lian Zi Xin、靈芝 Ling Zhi、綠豆 Lu Dou、
> 路路通 Lu Lu Tong、藕節 Ou Jie、秦皮 Qin Pi、青黛 Qing Dai、桑枝 Sang Zhi、
> 蛇床子 She Chuang Zi、石韋 Shi Wei、絲瓜絡 Si Gua Luo、鎖陽 Suo Yang、
> 檀香 Tan Xiang、土鱉蟲 Tu Bie Chong、土茯苓 Tu Fu Ling、豨薟草 Xi Xian Cao、
> 野菊花 Ye Ju Hua、皂角刺 Zao Jiao Ci、珍珠 Zhen Zhu
>
> **第二批（24 味，已經有卡片但完全沒記來源，等於沒人查過，次急）：**
> 漢防己 Han Fang Ji、麻黃根 Ma Huang Gen、決明子 Jue Ming Zi、木賊 Mu Zei、
> 白花蛇 Bai Hua She、硫黃 Liu Huang、仙茅 Xian Mao、白花蛇舌草 Bai Hua She She Cao、
> 白鮮皮 Bai Xian Pi、白果 Bai Guo、白前 Bai Qian、半枝蓮 Ban Zhi Lian、
> 蓽茇 Bi Ba、萆薢 Bi Xie、沉香 Chen Xiang、赤小豆 Chi Xiao Dou、
> 川木通 Chuan Mu Tong、椿皮 Chun Pi、刺五加 Ci Wu Jia、地膚子 Di Fu Zi、
> 冬蟲夏草 Dong Chong Xia Cao、冬瓜子 Dong Gua Zi、冬葵子 Dong Kui Zi、蜂蜜 Feng Mi
>
> **第三批以後：** 上面兩批做完還有時間的話，照分類一類一類抓，優先度由 0 完成
> 的分類開始（活血化瘀藥 17 味、補陰藥 15 味、收澀藥 14 味、理氣藥 13 味都還是
> 0/完成）。完整分類清單和每類還缺幾味在
> `data/herbs/herb_canon_shortlist.json` 的 `category_zh` 欄位裡都查得到，
> 你可以自己讀那個檔案列出清單，不用等 Claude 給。
>
> ---
>
> **做完跟 Claude 說一聲，附上你抓了幾味、幾筆 `found:false`。不用等她回覆再繼續
> 抓下一批。**

---

## §2 為什麼這樣寫（給 Ting／Claude 看）

跟 `CLAUDE_PROJECT_BRIEF.md` 的差別：那份是給另一個 Claude project 做**完整判斷
+ 寫入正式資料**；這份只要 antigravity 做**抓取**，因為：

- antigravity 「很快速抓東西但很亂」——把它限制在暫存檔，正式資料的寫入權留給
  Claude 的 guarded 腳本（`curate-*.js` 那種帶 assert、寫不進去就 exit 1 的），
  這樣亂也亂在暫存區，不會污染 306 張已經在用的卡片。
- 兩個來源分開存、不合併——這是 Ting 明講的規則（不要合併成假共識），也是
  之後 Claude 寫 `curate-*.js` 時要保留劑量差異（`6–10g（課件）/ 9–15g（AD、
  CloudTCM）`）的資料前提。合併了就回不去了。
- 五條紅線裡第一條特別強調「網址不能用猜的」，因為這個 repo 剛好才修過一次
  一模一樣的錯——115 個 CloudTCM 方劑連結全部是把自己的 id 套進網址規則造出來
  的，全部死連結。這個坑不能再踩一次。

## §3 Claude 收到暫存檔之後要做的事

1. 讀 `data/imports/americandragon/herb_fetch_staging.json` 和
   `data/imports/cloudtcm/herb_fetch_staging.json`。
2. 對每一味藥，跟課件（`curriculum/herbs/`）交叉核對——課件是主幹，AD/CloudTCM
   補深度，三方衝突時比照 `formula_tag_glossary.json` 的做法，**留差異不造假共識**。
3. 寫一支像 `curate-warm-interior-herbs.js` 那樣的 guarded 腳本，把暫存檔內容
   轉成 `herb_canon_shortlist.json` 的正式欄位，每一句英文都 assert 能在暫存檔
   的 `raw` 欄位裡找到對應，中英逐條對齊，`contraindications_zh` 有值才能升
   `card_grade: "template"`。
4. 跑 `node scripts/build-data.js` + 全部驗證器 + `build-site.js`。
5. 更新 `data/audits/missing_report.json` 的 `herb_outline_coverage`。
6. **`found: false` 的藥不要因為「AD/CloudTCM 都沒有」就放棄**——課件如果有，
   照課件先做 `card_grade: "partial"`，來源欄位如實記「American Dragon 站內查無
   此頁、CloudTCM 站內查無此頁」，不要留空白讓人以為沒查過。

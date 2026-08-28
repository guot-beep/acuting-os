# 資料→畫面「靜默降級」全掃描 — 2026-08-28

唯讀稽核產物,**不是規則**。起因:同一週抓到三次同型缺陷後,Ting 裁「掃一次」。
共同型態是**查表失敗時不出聲**——資料層驗證器全綠,畫面已經在騙人。

## 掃描方法(兩層,缺一不可)
1. **靜態**:對 `js/**` + `app.js`(10 檔約 2 萬行)掃 7 種降級型態,命中 153 處。
2. **實測**:靜態命中大多是合法的(表單 `?.value || ""` 那類)。**真正要看的是「現在實際踩到 fallback 的次數」**,
   所以逐一拿 bundle 的實際值去比對詞彙表、拿實際引用去比對登記表。

> **掃描器自己會犯同一個病。** 本次初版把 `RF_TIER_CLASS` 抽出 0 個 key(它是單行物件字面量,
> 而抽取器用了行首錨點),於是 193 筆紅旗 tier 全被報成「查不到」——一份看起來很有說服力、
> 實際上全錯的報告。**抽取器抓 0 筆一律當失敗**,這條規則本身就是同週 Appendix B 解析器踩過的坑。

## 一、詞彙表(enum → 文字):查不到就原樣印
| 詞彙表 | 鍵數 | 對應資料欄 | 實測查不到 |
|---|---|---|---|
| `STATUS_LABEL` | 5 | `review_status`(12 個集合 1780 次) | **0**(同日修完並上 gate) |
| `BASIS_LABEL` | 5 | `composition[].dose_basis` | 0 |
| `RF_TIER_CLASS` | 3 | 紅旗 `tier`(193 次) | 0 —— 初版誤報,眼讀原始碼確認 |
| `FORMULA_CATEGORY_DESC` | 19 | 分類**中文標籤**(非 `category_id`) | 6 個分類沒有說明文字 |
`FORMULA_CATEGORY_DESC` 缺的 6 個(解表劑－辛溫/辛涼解表、清熱劑－清氣分熱/清熱解毒/清臟腑熱、未分類)
**只是 chip 少了 tooltip,不會印生 enum**,列出來供判斷要不要補。

## 二、跨卡引用(id → 名稱):三種畫面後果都遇到了
先修掉兩個量測誤差才看得到真值:症狀有**記錄 + 分類軸兩層**登記表(只比記錄會把 12 個分類 id
報成懸空,158 次假警報);另有 3 個字串是欄位路徑/歷史註記不是 id(前批已裁定不動)。修正後:

| 命名空間 | 引用次數 | 解析不到 |
|---|---|---|
| pattern / supp | 3743 / 36 | **0** |
| sym | 773 | 3 |
| cond | 1193 | 7 |
| tdis | 859 | 3 |
| drug | 85 | 6 |
| herb | 2960 | 23 |
| formula | 3168 | 23 |

**但「懸空」不等於「畫面壞掉」——要看那個欄位渲不渲染、以及查不到時做什麼。**
逐欄位讀 `js/knowledge.js` 原始碼確認行為:

| 欄位 | 引用 | 懸空 | 查不到時畫面上發生什麼 |
|---|---|---|---|
| `formulas.key_pairs` | 25 | **15** | **靜默丟掉**(`.filter(Boolean)`,knowledge.js:397) |
| `patternLibrary.typical_formulas` | 207 | 5 | 證型大卡代表方 |
| `herbPairs.herbs` | 715 | 3 | **印 id 去前綴的 slug**,不是藥名(knowledge.js:375) |
| `herbPairs.found_in_formulas` | 262 | 9 | 目前未渲染(純資料整潔問題) |
| `herbs.related_formulas` | 1703 | 0 | — |
| `formulas.related_formulas` | 417 | 0 | — |

另有一類本次未觸發但機制存在:`relationButton(id, formulaLabel(id))`
**不檢查目標存不存在就渲染成可點按鈕**,標籤還把 id 美化成「Jiao tai wan」——
一旦 `related_formulas` 出現懸空就會變成**看起來活的死連結**。目前那兩欄是 0,靠的是運氣不是機制。

## 三、最嚴重的一處:3 張方劑卡的策展藥對整份消失
`formulas.key_pairs` 25 條引用裡 15 條懸空,分佈 8 張卡:
| 方劑 | key_pairs | 靜默丟掉 |
|---|---|---|
| `formula.huang_lian_jie_du_tang` | 3 | **3(全丟)** |
| `formula.dao_chi_san` | 2 | **2(全丟)** |
| `formula.long_dan_xie_gan_tang` | 3 | **3(全丟)** |
| `formula.yin_qiao_san` | 4 | 2 |
| `formula.gui_zhi_tang` | 3 | 2 |
| `formula.xiao_qing_long_tang` | 3 | 1 |
| `formula.sang_ju_yin` | 3 | 1 |
| `formula.bai_hu_tang` | 2 | 1 |
**全丟的那 3 張最糟**:`explicit.length === 0` 會讓那一區改走「依組成推得」的候選清單,
畫面上標著「依組成推得」,**看起來像這張卡本來就沒有策展過藥對**。

逐條查能不能對回既有記錄:**15 條裡只有 1 條**(`pair.xi_xin__gan_jiang__wu_wei_zi`
→ 既有 `pair.gan_jiang__xi_xin__wu_wei_zi`,只是成員排序不同)。
另 3 條引用的藥味根本不在正典(`herb.da_zhao`/`herb.shao_yao`/`herb.geng_mi`——
其中 da_zhao、geng_mi 正是前批「懸空 id 治理」重導過的雙胞胎,方劑這一側沒跟著改)。
其餘 11 條是**藥對記錄真的還沒建**。

## 本批已做的兩件事
1. **讓它不要再靜默**:`formulaPairsSection` 改成把解析不到的 id 列在畫面上
   (「本方另列了 N 條藥對,但那些藥對記錄尚未建立」+ 警示色左框)。
   眼讀確認:龍膽瀉肝湯列出 3 條、桂枝湯列出 2 條。
2. **上 gate**:`scripts/validate-rendered-reference-resolution.js`,每個會渲染的引用欄位一個上限,
   **只准變少**。負向測試:注入一條懸空引用 → FAIL;還原 → PASS。
   盯數量不盯名單,因為懸空 id 會換人不換數量。

## 待 Ting 決定
1. 那 15 條:**1 條改 id 排序即可**;3 條要先處理藥味雙胞胎(da_zhao/shao_yao/geng_mi);
   11 條要建藥對記錄(黃連解毒湯、導赤散、龍膽瀉肝湯那幾組都是考科常見對藥)。
2. `relationButton` 要不要一律檢查目標存在?現在是 0 懸空所以沒事,但那是運氣。
3. `FORMULA_CATEGORY_DESC` 缺的 6 個分類說明要不要補。


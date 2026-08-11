# 方劑卡樣板規範

**Status: 定案（Ting 2026-07-28 逐項確認過）。** 每一個方都照這張做。
樣板記錄:`formula.ma_huang_tang`(麻黃湯)。改樣板 = 先問 Ting。

**要開工填方劑的人請先看 `docs/FORMULA_FILL_DISPATCH.md`** —— 那份講怎麼開工、
紅線在哪、現在缺什麼；這份是規範本體。
機器檢查:`node scripts/validate-formula-standard.js`(F1–F12,`--worklist` 出清單)。

姊妹文件:`docs/HERB_CARD_TEMPLATE.md`(中藥,E1–E9)、
`docs/ACUPOINT_CARD_TEMPLATE.md`(穴位,A1–A9)。

---

# 第一部分:前兩張卡教會我們的事

這份規範不是從零開始寫的。中藥卡(260 味)跟穴位卡(361 穴,已完成 97 穴)
一路踩過的坑,**每一個都變成這裡的一條規則**。先講經驗,再講規則,
因為規則沒有理由就會被繞過。

## 教訓 1 · 問題從來不是「沒東西」,是「東西放錯地方」

一開始以為資料庫是空的,實際上 Antigravity 已經把約 48 個欄位填到接近 100%。
真正的缺陷全部是**錯層**:

- ST17 乳中的**禁針令被寫成「功效」** —— Ting 一眼看出來:「怎麼是那個 應該在禁忌裡面？」
- 杜仲被歸到**開竅藥** —— 多欄 PDF 壓平時把左欄的分類標題黏到右欄的藥名上
- 麻黃湯的**組成被寫進 `pattern_indications_zh`**
- 「其他功效」這個**網頁區塊標題**混進 109 味藥的功效陣列
- 「…類辨證」這個 **CloudTCM 頁面章節名**混進 35 個標籤,害「陽痿」跟
  「陽痿類辨證」變成兩個不同的詞

> **→ 方劑卡的對應規則:§0「只加深,不刪除」+ §3 F10「錯層自動偵測」。**
> 整理的動作是**重新歸位**,不是重寫覆蓋。

## 教訓 2 · 標籤層一旦被覆蓋就毀了,而且不會有人發現

整理 LU/LI 時我把 `action_tags` 直接設成 `functions`,等於用整句功效
覆蓋掉原本 2–6 字的短標籤。Ting 抓到:「標籤沒有中英文標籤 不知道對以後搜尋會不會有影響」
—— 有,搜尋當場變差,而且**在畫面上看起來沒事**,因為卡片照樣顯示文字。

> **→ 方劑卡的對應規則:§2 四層分工。**
> 內容層(可長)、標籤層(2–6 字)、身分層、關係層,**四層互不取代**。

## 教訓 3 · 中英對齊必須用 assert 擋,不能靠人細心

穴位卡曾經 **352/361 穴**的 `_en` 陣列跟 `_zh` 長度不同 —— 英文會整排錯位,
第 3 條中文配到第 3 條英文卻是在講別的事。這種錯**看畫面看不出來**,
因為兩邊都有內容。

ST 那批我自己寫的中文層被腳本擋下 9 次,SP 那批擋下 3 次。**每一次都是我寫錯。**

> **→ 方劑卡的對應規則:§3 F4,以及所有寫入腳本必須有 alignment assert,
> 對不上就 `process.exit(1)` 不寫檔。**

## 教訓 4 · 「已整理」的定義寫鬆一次,驗證器就爆炸一次

這個坑踩了**兩次**:

| 何時 | 寬鬆定義 | 後果 |
|---|---|---|
| 穴位卡 | 「有任何 `field_sources`」 | 加考試星號寫入 `field_sources.exam_star`,145 個沒整理的穴變成「已整理」→ **236 個錯** |
| 中藥卡 | 「有任何 `field_sources`」 | 加來源標註到 217 味,全部變成「已整理」→ **755 個錯** |

**標註出處 ≠ 有人照模板整理過。**

> **→ 方劑卡的對應規則:§3「已整理」= `field_sources.actions_zh` 存在,
> 就這一個欄位,寫死。**

## 教訓 5 · 規則設下限會逼人湊數,設上限才有用

穴位卡的 A6 原本要求功效 3–8 條。結果:
- LU4/LU8/LU11 課件只給 **2 條**,為了過檢查就得掰第 3 條
- 下限降到 2 之後,SP16 腹哀課件只給 **1 條**(「調理腸道」),又卡住

**湊數正是這條規則本來要防的事。** 最後下限整個拿掉,只留上限 8。

> **→ 方劑卡的對應規則:§3 F8 只有上限,沒有下限。條數少的列 worklist 給人看,不擋。**

## 教訓 6 · 沒有來源就留空,不要半翻譯

1786 個英文標籤長這樣:`活血 (TCM Action)` —— 中文原字加一個分類詞,
不是翻譯。它們藏了很久,因為卡片一次只顯示一種語言,**改成雙語 chip 才暴露**。

處理原則:查 glossary,查不到就**整格留空**,不半翻。
後來 glossary 補到 625 條,571 格空白才填起來。

同一個原則也用在證候 canon:140 個證候的 `name_en` **全部留空**,
因為沒有來源可翻,硬翻 140 個等於造一套假詞彙。

> **→ 方劑卡的對應規則:§2「英文一律查對照表,查不到留空」。**

## 教訓 7 · 來源的重點標記,勝過我的判斷

SP4 公孫我自己給了考試星號,理由是「八脈交會明顯是重點」。腳本擋下來:
課件沒標星號。規範寫的是**課件的星號就是老師標的考點,不用自己判斷**,
所以星號改回 0,八脈交會的重要性改寫進考點文字裡。

反過來 SP21 大包課件**有**星號,但星號打在拼音上(`Da Bao*`)不在代碼上,
解析器讀不到 —— 那是解析器要修,不是我可以自由心證。

> **→ 方劑卡的對應規則:§4 來源優先序,考綱決定範圍、課件決定內容,
> 兩者都不是我的意見。**

## 教訓 8 · 多欄 PDF 不能用眼睛讀

杜仲事件的根因:PDF 有四欄,文字抽取按 PDF 內部順序而不是視覺順序,
左欄的 `[21] Aromatic, Open Orifices` 跟右欄的 `• Du Zhong [W]` 黏成一行。

解法是**遞迴 XY-cut**:找空白間隔切欄,在跨欄標題底下橫切,
再用**座標**把每一條配回它所屬的那一格。LU 經 11 穴逐條比對人工謄寫,全對。

> **→ 方劑卡的對應規則:§5,Formulations Summary Chart 一定要寫解析器,
> 不准用眼睛讀。**

## 教訓 9 · 渲染層是卡片的一部分

- 76 個穴位早就有 `point_identity_zh` 跟 `exam_pearl`,**但沒有任何程式碼渲染它們**
  —— 卡片上最值得看的兩樣東西是隱形的
- 反過來,`evidence` 跟 `modern_research_zh` 在 **348/361 穴**是同一段文字,
  卡片用兩個不同標題印了兩次
- 董氏奇穴整個分頁打不開,因為一個欄位在某個資料源是陣列、在另一個是字串

> **→ 方劑卡的對應規則:§1 的區塊表就是渲染契約。
> 新增欄位必須同時更新渲染與搜尋索引,否則等於沒做。**

## 教訓 10 · 推導出來的連結不是查過的來源

American Dragon 的網址可以從拼音推出來(`Má Huáng` → `MaHuang.html`),
59 個已有的全部符合這個規則。但**推得出網址 ≠ 那頁存在 ≠ 內容出自那裡**。
所以那 201 個推導的連結標 `derived`、卡片寫「未驗證連結」、
**絕不寫進 `field_sources`**。

CloudTCM 相反:有 202 筆精確名稱比對的驗證紀錄,那是**查過的**,所以可以當來源。

> **→ 方劑卡的對應規則:§4 每個來源標明「驗證等級」。**

---

# 第二部分:方劑跟前兩張卡不一樣的地方

**中藥是零件,穴位是零件,方劑是組裝。** 這句話決定了整張卡的設計。

| | 中藥卡 | 穴位卡 | **方劑卡** |
|---|---|---|---|
| 核心問題 | 這味藥做什麼 | 這個穴治什麼 | **為什麼是這幾味、這個比例** |
| 有沒有內部結構 | 沒有 | 沒有 | **有 —— 君臣佐使** |
| 有沒有家族 | 沒有 | 沒有 | **有 —— 基礎方 + 加減衍生方** |
| 劑量意義 | 絕對值 | 針深 | **相對比例才是方** |
| 出典 | 部分 | 沒有 | **必要 —— 傷寒論/金匱/溫病** |

四個方劑獨有的特性,前兩張卡完全沒有,所以要新設計:

### 特性 A · 君臣佐使是「關係」不是「屬性」

穴位有「原穴」「郄穴」這種身分,但那是**這個穴自己**的屬性。
君臣佐使不是 —— 麻黃在麻黃湯是君藥,在麻杏石甘湯是臣。
**同一味藥在不同方裡角色不同。**

所以它必須存在 `composition[].role_zh`(方裡面),
**不可以**存在藥的記錄上。這一條寫成 F7。

### 特性 B · 方有家族,而且家族關係本身就是考點

```
麻黃湯 ──┬─ 加白朮 → 麻黃加朮湯   [身痛 ← 寒濕]
         ├─ 加石膏 → 大青龍湯     [兼內熱]
         └─ 減桂枝 → 三拗湯       [輕證初起]
桂枝湯 ──┬─ 加葛根 → 桂枝加葛根湯 [項背強]
         └─ 倍芍藥 → 桂枝加芍藥湯
```

現在 `related_formulas` 只是一串 id,**丟掉了「加了什麼、為什麼」**——
而那正是這一區唯一有價值的東西。跟穴位卡的教訓一樣:
「不要把配穴壓縮成一行穴名清單」。

所以新增結構化欄位 `formula_family`(§6),**這是這張卡最重要的新設計**。

### 特性 C · 比例就是方

桂枝湯 → 桂枝加芍藥湯,**只有芍藥從 9g 變 18g**,方名跟主治就變了。
劑量不是附註,是方的定義的一部分,所以 `dose_range` 進 F6 必填。

而且台灣臨床有**兩套劑量制**:湯劑克數 vs 科學中藥濃縮顆粒。
資料裡已經有 `decoction_reference_g` / `granule_reference_g` / 濃縮比,要保留。

### 特性 D · 方劑卡是三張卡的交會點

```
方劑卡 ──composition[].herb_id──→ 中藥卡
       ──syndromes_zh──→ 證候 canon ←──tcm_pattern_ids── 穴位卡
       ──modern_diseases_zh──→ 病證 canon ←──related_conditions── 穴位卡
```

證候 canon 裡 **25 個方證已經帶 `formula_id` 指回方劑**。
所以「這個證候用哪些穴、哪些方」是可以一起查的 —— 這是整個系統的目的,
方劑卡是它的樞紐。**連結欄位現在就要定下來,資料可以留空。**

---

# 第三部分:規範本文

## §0 最高原則:只加深,不刪除

| 動作 | 可不可以 |
|---|---|
| 把組成從 `pattern_indications_zh` 搬回 `composition` | ✅(真的有一方是這樣) |
| 把整段散文的 `actions_zh` 拆成逐條 | ✅ |
| 補上君臣佐使、補上加減的「加了什麼」 | ✅ |
| **刪掉加減、方義、現代疾病、藥理、比較群組、逐味 `elucidation_zh`** | ❌ |
| 用短版覆蓋既有長版 | ❌ |
| 因為「看起來亂」就整欄清空 | ❌ |

**兩個例外**:內容明確錯置(教訓 1),或**完全損毀的亂碼**(F9)。
兩者都要在 commit 說明改了什麼、為什麼。
⚠️ 部分缺字但仍可讀的**不刪**(像「煎服���與藥後護理」)—— 列 worklist 人工修。

## §1 卡片區塊(照這個順序,不多不少)

前 7 區是「掃一眼就能背」,8 之後是「要細讀」—— 與另外兩張卡一致。

| # | 區塊 | 來源欄位 | 必要性 |
|---|---|---|---|
| 1 | 標頭:方名 · 拼音 · 英文 · **出典** · ★考試星號 | `name_zh` `pinyin` `name_en` `source_classic` `exam_star` | 必 |
| 2 | 速覽格:分類 / 學習層級 / 鑑別群組 / 味數 | `category` `tier` `comparison_group` | 必 |
| 2b | **方歌**(背誦用韻文) | `formula_song_zh` `formula_song_source_zh` | 有就填,沒有整區不顯示 |
| 3 | **💡 考試重點**(★★ 轉紅底) | `exam_importance` `exam_pearl` | 必 |
| 4 | **組成與君臣佐使 · 方劑分析**(角色 · 藥名 · **本方功效** · **原方用量** · **科學中藥用量**) | `composition[]` | **必 —— 卡片核心** |
| 4b | **原方**(這個方是誰的加減) | `derived_from` | 衍生方必填 |
| 5 | **功效**(中英逐條成對) | `actions_zh` + `actions_en` | 必 |
| 6 | **主治證候**(中英逐條成對) | `pattern_indications_zh` + `_en` | 必 |
| 7 | **辨證要點**(**舌 · 脈** · 主症)| `tongue_zh` `pulse_zh` `symptoms_zh` | 必 |
| 8 | **標籤**(短標籤,點擊全站搜尋) | `modern_clinical_use_tags` `study_tags` | 必 |
| 9 | **方義**(為什麼這樣配) | `chinese_depth_track.fang_yi_zh` | 必 |
| 10 | **方劑家族**(基礎方 → 加/減什麼 → 治什麼) | `formula_family` | **必(§6 新結構)** |
| 11 | **類方鑑別**(同群組互比) | `comparison_group` `compare_with` | 必 |
| 12 | **現代應用**(這個方現在治什麼)| `applications_zh/en` | **必** |
| 13 | **現代藥理** | `modern_research_zh/en` | 有就填 |
| 13b | CloudTCM 可改善疾病(**關鍵字關聯，非臨床應用**) | `modern_diseases_zh` | 有就填，但要標明性質 |
| 14 | ⚠️ 注意事項與禁忌 | `contraindications_zh/en` `cautions_zh` `safety_flags` | 必 |
| 15 | 連結:單味藥 · 病證 · 證候 | `composition[].herb_id` `related_conditions` `tcm_pattern_ids` | 必(可留空) |
| 16 | 參考來源 | `field_sources` `sources` | 必 |

**空的區塊不顯示**,不要印「待補」——「待補」是給還沒做的方用的。

### §1.1 方歌欄位規格(Ting 2026-07-30 定案)

| 欄位 | 型別 | 說明 |
|---|---|---|
| `formula_song_zh` | string | 方歌全文。分句用 `\n` 斷行,渲染時轉 `<br>`。**保留原文標點**(,。),不要改寫、不要精簡。 |
| `formula_song_source_zh` | string | 出處,例如「出自汪昂《湯頭歌訣》」。**不知道出處就不要填這個欄位**,但方歌本身還是可以留。 |
| `field_sources.formula_song_zh` | string[] | 實際抓到的來源(書名或網址)。 |

規則:

1. **沒有就不要建欄位**。這一區「有才顯示」,寫 `""`、`"待補"`、`null` 都算污染——渲染層判斷的是有沒有內容,填了空字串跟沒填沒差,但會讓覆蓋率統計失真。
2. **一方多歌就選一個主的,其餘放 `formula_song_alt_zh`(string[])**。不要把兩首黏成一段。
3. 方歌是韻文,**逐字照抄**。這跟功效欄位不同——功效可以整理,方歌改一個字就不押韻、背起來就錯了。
4. 常見來源:汪昂《湯頭歌訣》、陳修園《長沙方歌括》、《醫方集解》,以及 CloudTCM 方劑頁。**標明是哪一本**,因為同一方在不同書的方歌不一樣。

## §2 四層分工(教訓 2、6)

| 層 | 欄位 | 內容 | 長度 |
|---|---|---|---|
| 內容(英) | `actions_en` `pattern_indications_en` `modifications_en` | 課件原文,**照抄不改寫** | 可長 |
| 內容(中) | `actions_zh` `pattern_indications_zh` | 結構化中文 | 可長 |
| **標籤** | `modern_clinical_use_tags` `study_tags` | **短標籤**,搜尋與 chip | 2–6 字 |
| 身分 | `category` `tier` `comparison_group` `source_classic` | 分類與出典 | — |
| **關係** | `composition[].role_zh` `formula_family` `compare_with` | 方跟藥、方跟方 | — |

**君臣佐使既不是標籤也不是功效**,它是關係層。
英文一律查 `data/config/formula_tag_glossary.json`(比照
`acupoint_tag_glossary.json` 建立);查不到**整格留空,不半翻**。

## §3 硬規則(validator 會擋)

| 規則 | 內容 |
|---|---|
| **F1** | `id` / `name_zh` / `pinyin` 必填 |
| **F2** | `id` 不可重複 |
| **F3** | 已整理的方:`_zh` 欄位有內容就必須有中文 |
| **F4** | 已整理的方:`_en` 長度必須等於 `_zh`,**不確定就整個留空,絕不錯位**(教訓 3) |
| **F5** | 已整理的方不可缺 `_en` |
| **F6** | 已整理的方:`composition` 每一味都要有 `herb_zh` **與 `dose_range`**(特性 C) |
| **F7** | 已整理的方:`composition` **必須有君臣佐使**,君藥 1–2 味,且角色只能是 君/臣/佐/使 |
| **F8** | 已整理的方:`actions_zh` **上限 8 條**(目標 3–5)。**沒有下限**(教訓 5) |
| **F9** | **完全損毀的亂碼一律擋**(不分是否已整理);部分缺字仍可讀的只列 worklist |
| **F10** | **錯層偵測**:`pattern_indications_zh` 不可含「組成:」開頭的條目;`actions_zh` 不可含禁忌語(禁用/忌服/孕婦);標籤欄不可出現超過 12 字的整句(教訓 1、2) |
| **F11** | `formula_family` 的每個條目必須有 `change`(加了/減了什麼)與 `formula_id` 或 `name_zh`,**不可只有方名清單**(特性 B) |
| **F12** | `composition[].herb_zh` 必須存在於 `herb_canon_shortlist.json`,否則報未知藥材(特性 D 的連結契約)。已整理的方若帶 `composition_suspect` 也擋 |

**「已整理」的定義**是 `field_sources.actions_zh` 存在,**就這一個欄位**。
⚠️ 教訓 4:寫鬆過兩次,分別爆 236 個與 755 個錯。

**為什麼 F3/F4/F6/F7 只擋已整理的方**:匯入的英文常常是 2 條摘要對上 50 條
CloudTCM 全文,本來就不是要逐條配對的。對 58 個沒人整理過的方報錯,
只會讓整面驗證牆掛掉,然後大家開始習慣紅字 —— 那比沒有檢查更糟。
**一旦有人整理這張卡,逐條對齊就是硬合約。**

`review_status` AI 只能寫 `"draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

## §4 來源優先序與驗證等級(教訓 7、10)

**先框架、再內容。** 考綱決定**做哪些方、什麼是考點**;課件與網站決定**寫什麼**。

| # | 來源 | 驗證等級 | 它決定什麼 | 進哪一欄 |
|---|---|---|---|---|
| **0** | **NCBAHM CH 考綱** | ✅ repo 內 | **框架** —— 哪些方先做、`exam_importance` | `exam_importance` |
| **1** | **Formulations Summary Chart** | ✅ repo 內 | **結構主幹** —— 君臣佐使、劑量、加減、actions、indications、舌脈 | `composition` `actions_en` `pattern_indications_en` `formula_family` `tongue_zh` `pulse_zh` |
| **1** | Herbal Formulations Comprehensive | ✅ repo 內 | 同上的深度版 | 補上面各欄 |
| **2** | 臺灣中藥典第四版英文版 | ✅ repo 內 | 官方中英對照、劑量 | `name_en` `dose_range` |
| **3** | **CloudTCM**(115 方已有直連) | ⚠️ **驗證過的連結,但現在讀不到** | 中文深度:方義、現代疾病、藥理 | `chinese_depth_track` `modern_diseases_zh` |
| **4** | 順天堂濃縮顆粒 | ⚠️ 推導 | 科學中藥劑量 | `granule_reference_g` |

⚠️ **CloudTCM / American Dragon / atlas 這個環境全部讀不到(gateway 403)**。
既有內容是先前抓好的,照樣可用;**但不准假裝現在查過**。
要新增內容只能從 `curriculum/` 來。**推導出來的連結不寫進 `field_sources`。**

**逐欄 `field_sources`**:課件用 `curriculum/formulas/<檔>#p<N>`,網站用完整 URL。
**沒實際核讀過的來源不得列名。**

## §5 Formulations Summary Chart 怎麼讀(教訓 8)

它是**表格**,結構跟十四經課件一模一樣:

```
Ma Huang Tang [麻黄汤]   Chief     Ma Huang    M 9   Ma Huang Jia Zhu Tang [5]  ● Bai Zhu 12
(Ephedra Decoction) [4]  Deputy    Gui Zhi     G 6   [Body Aches ← Damp Cold]
[Shang Han Lun]          Assistant Xing Ren    X 9   Da Qing Long Tang [7]      ● Ma Huang → 18
                         Envoy     Zhi Gan Cao Z 3
Actions: Releases Exterior Cold & Arrests Wheezing
Indications: Tai Yang Shang Han (Wind Cold Exterior Excess (Shi))
[Fever & chills NO sweating   Floating, tight pulse]
```

一列 = 一個方。欄位:**方名[出典] · 角色 · 藥 · 劑量 · 類方 · 加 · 減**。
最後那行方括號裡就是 **舌脈**,直接進 `tongue_zh` / `pulse_zh`。

**寫 `scripts/parse-formula-curriculum.py`**,沿用
`scripts/parse-channel-curriculum.py` 的遞迴 XY-cut 與座標配對。要處理的坑:

1. ⚠️ `(cid:0)` 是**未嵌入的箭頭字形**,當「→」處理,不要當內文
2. 角色欄的縮寫(`M` `G` `X` `Z`)是藥名首字母,是**版面標記不是資料**,丟掉
3. 加減欄的 `●` 是條目符號,跟課件的 `•` 一樣要當分隔符
4. 一個方跨多列,**用方名那一格的 y 座標當錨點**,跟穴位解析器同樣做法
5. 寫完必須**逐條比對人工謄寫至少一章**才算通過 —— LU 經就是這樣驗的

## §6 `formula_family` —— 新結構(特性 B)

現在 `related_formulas` 是 `["formula.ma_huang_tang", ...]`,
**丟掉了「加了什麼、為什麼」**,而那是這一區唯一有價值的東西。
(跟穴位卡同一個教訓:不要把配穴壓縮成一行穴名清單。)

**目標格式**:

```json
"formula_family": [
  {
    "relation": "加",
    "formula_id": "formula.ma_huang_jia_zhu_tang",
    "name_zh": "麻黃加朮湯",
    "change": ["+白朮 12g"],
    "indication_zh": "身痛,寒濕在表",
    "source": "curriculum/formulas/Formulations Summary Chart.docx.pdf#p1"
  },
  {
    "relation": "減",
    "name_zh": "三拗湯",
    "change": ["−桂枝"],
    "indication_zh": "風寒輕證初起"
  },
  {
    "relation": "倍",
    "name_zh": "桂枝加芍藥湯",
    "change": ["芍藥 9g → 18g"],
    "indication_zh": "太陽病誤下,腹滿時痛"
  }
]
```

`relation` 只能是 **加 / 減 / 倍 / 合方 / 同類**。
`change` 是陣列,**必須寫劑量**(特性 C)。
F11 會擋只有方名沒有 `change` 的條目。

### 反向連結 `derived_from`(Ting 定案:很需要)

`formula_family` 寫在**基礎方**上,所以打開大青龍湯時完全看不出它是麻黃湯的加減 ——
而那是關於它最有用的一件事,本身也是考點。

`scripts/link-formula-family-back.js` 把基礎方的每一條 family 條目**鏡射**到衍生方
的 `derived_from`,欄位全部從基礎方複製,所以兩邊永遠不會講不一樣的話;
基礎方改了就重跑一次重新同步。**不在這裡自己寫任何內容。**

家族裡提到但資料庫沒有的方**只報告不建立** —— 麻黃湯的四個衍生方目前全都沒有記錄,
這正好指出資料庫缺什麼。

### 君臣佐使那一欄是「方劑分析」(Ting 定案)

它跟中藥卡本身的功效**是分開的兩件事**:

- **本方功效** = 這味藥在**這個方裡**做什麼(`composition[].in_formula_zh` / `role_reason_zh`)
- **劑量** = **原方用量** + **科學中藥濃縮顆粒用量**,兩套都要
- 中藥卡的功效 = 這味藥**自己**能做什麼

杏仁單用是降肺氣;杏仁在麻黃湯裡是**佐藥**,跟麻黃一宣一降。這兩句話都要,而且不能互相取代。

## §7 目前資料現況(2026-07-28,201 方 —— 最新數字見 `docs/HANDOFF_2026-07-28.md`)

| 缺口 | 數量 |
|---|---|
| **缺君臣佐使** | **115/173** ← 最大的洞,也是卡片核心 |
| **組成是假的**(方名被當成藥材) | **36 方已清空 + 14 方標記可疑** ← F12 抓到的 |
| 缺加減變化 | 150/173 |
| 缺 `actions_en` | 92/173 |
| 缺出典 `source_classic` | 79/173 |
| 缺禁忌 | 86/173 |
| `field_sources` | **0/173** |
| 單味藥連結 `herb_id` | **0/173** |
| 舌脈獨立欄位 | **0/173**(混在 `symptoms_zh` 裡) |
| ~~完全損毀的亂碼~~ | ~~44/173~~ → **已清 0**(`clean-formula-mojibake.js`) |
| 部分缺字仍可讀 | 34/173,**保留待人工修** |
| 中英未對齊 | 58/173 |

已經有的:CloudTCM 直連 115 · 鑑別群組 115(32 群)· 現代疾病 97 ·
組成 **116**(清掉 36 個假組成後的真實數字)· 劑量 94 ·
逐味 `elucidation_zh`(這個很有價值,直接進 §1 第 4 區)

⚠️ **F12 抓到的假組成**:36 個方的 `composition` 是**方名去掉劑型後綴**當成藥材
(`瀉心湯` → `["瀉心"]`、`左歸飲` → `["左歸"]`),已清空。
另外 **14 個是同樣的截斷,但那一味剛好是真藥材**(`葛根湯` → `["葛根"]`)——
不能清(會丟掉唯一正確的那味),已標 `composition_suspect`,
**卡片必須顯示警告而不是斷言組成**,等課件解析補齊。

### 建議批次順序

跟穴位一樣一批一批做,先小批驗收:

1. **辛溫解表 8 方**(麻黃湯、桂枝湯、小青龍湯…)—— Summary Chart 第一章,
   對照最完整,而且家族關係最豐富,適合驗證 `formula_family` 這個新結構
2. 辛涼解表 → 瀉下 → 和解 → 清熱
3. 補益劑(課件有專門一份 `Formulas That Tonify 补益剂`)

### 考綱缺的 28 方(Ting 定案:要補)

`scripts/add-missing-board-formulas.js` 已建立 **28 筆骨架記錄**,
`review_status: "skeleton"`,帶 `needs_fill` 說明。每一筆只帶兩個來源真的講過的東西:

- `name_en` / `pinyin` ← 考綱 Appendix C(官方)
- `name_zh` ← **課件裡拼音旁邊就寫著中文的**才拿(16 筆),
  其餘 **12 筆 `name_zh` 留空**,不自己音譯 —— F1 對 skeleton 豁免這一欄,改列 worklist 等 Ting 指認
- `source_classic` ← 課件標了出典的

**組成一律留空。** 從方名推測組成正是把「瀉心」寫進瀉心湯成分表的那個錯。
之後由 Codex / Antigravity 依這份模板做交叉比對填充。

### 現代應用從哪來

`curriculum/formulas/Herbal Formulations Comprehensive` 每個方都有:
**Applications**(這個方現在治什麼)、**Modern research**(藥理)、
**Administration**(服法)、以及一張 Rank/Herb/Amount/**Properties**/**Channels**/Notes 表。

⚠️ **不要拿 CloudTCM 的 `modern_diseases_zh` 當現代應用** ——
麻黃湯那一欄列著「系統性紅斑性狼瘡」「心肌梗塞」,那是關鍵字關聯不是臨床應用。
兩者**各自成欄、各自標來源**,卡片上也分開顯示。

**做法**:一批一支腳本(`scripts/curate-<分類>-formulas.js`),
中文層寫在腳本裡、英文一律由解析器讀出,腳本自己 assert:
中英條數對齊、每個英文字都出現在該方的課件原文裡、
`composition[].herb_zh` 都在中藥庫裡。對不上就拒絕寫入 —— 跟 SP 那批同樣做法。

## §8 三張卡的連接契約(特性 D)

```
方劑卡 ──composition[].herb_id──→ 中藥卡(單味藥頁)
       ──syndromes_zh──→ 證候 canon ←──tcm_pattern_ids── 穴位卡
       ──modern_diseases_zh──→ 病證 canon ←──related_conditions── 穴位卡
       ──compare_with──→ 同群組類方(格式同穴位卡 §6.5 C)
```

- 證候 canon(`data/config/tcm_pattern_canon.json`)140 個證候,
  其中 **25 個方證已經帶 `formula_id` 指回方劑**(`kind: "方證"`)
- 穴位卡的 `tcm_pattern_ids` 與方劑走**同一套證候詞彙**
- **搜尋契約**:新增可搜欄位時要同步更新 `app.js` 的 `unifiedSearch`。
  穴位卡曾經漏掉標籤與身分,害辛苦翻譯的 151 個標籤搜不到(教訓 9)。

## R2 Evidence 慣例(2026-08-11,三年藍圖 R2,全線統一)

帶主張的欄位(劑量、安全、療效、機轉、紅旗)必掛 **per-field 來源錨點 +
擷取日期**(`field_sources` 或本線等價欄位;格式參照 pharm 線
`dailymed:<setid>#<SECTION>` 的可機器解析精神)。無來源的欄位誠實留空。
新產卡即遵守;舊卡不回溯強制,由各線驗證器與 ratchet 自然收斂。

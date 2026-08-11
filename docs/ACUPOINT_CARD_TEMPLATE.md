# 穴位卡樣板【定案】 — ST36 足三里 + PC6 內關

**Status: FINAL(Ting 定案 2026-07-27,版面與雙語層 2026-07-30 修訂)。**
每一個穴位都照這張做。
樣板記錄:**`ST36`(足三里)**= 五輸穴／強壯大穴代表、**`PC6`(內關)**= 絡穴／
八脈交會、且有明確神經安全考點的代表、`ST17`(乳中)= 絕對禁針的特例。
改樣板 = 先問 Ting。

**為什麼樣板是兩個穴而不是一個**:ST36 是「功效極廣」型,PC6 是「特定穴屬性
複雜 + 解剖風險明確」型。兩者需要的欄位組合不同,一個樣板蓋不住 361 穴的變化。
做新卡時**挑性質相近的那一個對照**。

與中藥卡(`docs/HERB_CARD_TEMPLATE.md`)**同一套邏輯**,只是欄位不同。
機器檢查:`node scripts/validate-acupoint-standard.js`(A1–A14,`--worklist` 出清單)。

Ting 定案時的三句話:

> 「**原本的內容可以留下來渲染** —— 大多是以前收集的權威網站內容,
> 只是放在不同主題下面、或者不夠有架構。」
> 「**配穴的地方肯定是需要的**,可以更具體化,但這部分不能刪掉。」
> 「board exam outline 很重要。課件 note、eLotus、AcuPoints、CloudTCM
> 都可以補強這個架構。」

---

## 0. 最高原則:**只加深,不刪除**

既有的 361 穴內容**幾乎全部是有價值的**。問題從來不是「內容爛」,而是
**放錯層、沒有結構、缺英文**。所以整理的動作是**重新歸位**,不是重寫覆蓋。

| 動作 | 可不可以 |
|---|---|
| 把整句功效搬到正確欄位 | ✅ |
| 把混在功效裡的「募穴」搬到身分欄 | ✅ |
| 補上缺的英文 | ✅ |
| **刪掉配穴、臨床要點、現代研究、艾灸、按摩、古籍、解剖** | ❌ **絕對不可以** |
| 用短版覆蓋既有的長版內容 | ❌ |
| 因為「看起來亂」就整欄清空 | ❌ |

⚠️ **踩過的坑**:整理 LU/LI 時把 `action_tags` 直接設成 `functions`,
等於用整句功效覆蓋掉原本的短標籤 —— 搜尋與篩選 chip 當場變差。
那些短標籤是從權威網站搬來的,**品質很好,要留**。

**唯一的例外**:內容明確錯置(例:把禁令寫成功效 —— ST17 就是),
或是共用套話禁忌(A8)。那要改正,但必須在 commit 說明改了什麼、為什麼。

---

## 1. 卡片區塊(照這個順序,不多不少)—— 2026-07-30 重排

**順序原則:照臨床動作順序,不是照資料被加進來的順序。**
先找到穴 → 下針 → 為什麼重要 → 治什麼 → 配什麼 → 連到哪 → 來源。

原本是 16 個獨立區塊,壓成 **7 個功能群**(Ting 2026-07-30:
「整個介面跟欄位很亂 要重新整頓」「有點太亂太冗長」)。

| # | 區塊群 | 來源欄位 | 必要性 |
|---|---|---|---|
| **0** | 標頭 + 速覽格:代碼 · 中文名 · 拼音 · 英文 · ★星號 / 經絡 · 部位 · 針法 · 艾灸 | `code` `chinese` `pinyin` `english` `exam_star` `channel_zh` `region` | 必 |
| **1** | **定位・取穴・解剖**(定位 / 骨度分寸 / 歸經部位 / **解剖層次**) | `location_zh/_en` `cun_measurement` `anatomy_zh/_en` | 必 |
| **2** | **針法・艾灸・安全**(深度/角度數字 + **注意事項禁忌併入此區**) | `acumethod_zh/_en` `needling` `moxa_zh/_en` `contraindications` `cautions_zh/_en` | 必 |
| **3** | **我的臨床筆記** | localStorage(`js/notes.js`),**不進 JSON** | 自動 |
| **4** | **特定穴身分 + 💡考試重點**(Big picture 標註) | `point_categories` `five_shu_element` `point_identity_zh/_en` `exam_star` `exam_pearl(_en)` `exam_importance(_en)` | 必 |
| **5** | **功效 → 主治病症 → 標籤**(三層,逐項中英成對) | `functions_zh/_en` `indications_zh/_en` `action_tags_zh/_en` `disease_tags_zh/_en` | 必 |
| **6** | **常用配穴與臨床應用** | `combine_points_zh` **`combine_points_en`** `clinical_pearls` | **必(Ting 指定保留)** |
| **7** | **連結・鑑別**(折疊;病症按系統分組) | `related_conditions` `tcm_pattern_ids` `compare_with` | 有就填 |
| **8** | 現代研究 / 古籍 / 穴名沿革別名 / 圖像 / **參考來源** | `modern_research_zh/_en` `classical_refs` `name_intro_zh` `other_names_zh` `visual_links` `field_sources` `sources` | 必 |

### 為什麼定位排第一(不要再改回去)
舊版把定位排在**第 8 個**,前面塞了特定穴、考點、功效、主治、標籤、連結、
基本介紹七個區塊。學一個穴第一件事永遠是「它在哪」;而且**取穴和下針是同一個
動作**,所以針法必須緊接定位 —— 舊版針法排第 11,離定位很遠。

### 為什麼注意事項併進針法(不要再拆出去)
Ting 2026-07-30:「注意事項挺多重要的內容啊」。舊版把它排在**第 15 區**,
接近卡片底部 —— 安全提醒放在沒人滑到的位置等於不存在。現在跟針法同一區,
下針前一定看到。

### 為什麼解剖從「現代研究」搬到「定位」
Ting 2026-07-30:「現代研究/臨床提醒那裡資訊也很雜,居然還有穴位解剖構造,
應該放前面 location 的地方才是」。解剖是取穴與安全的依據,不是研究文獻。
**同一份解剖內容過去在兩個區塊各印一次**,現在只在定位區出現。

**絕對禁針的穴(ST17 乳中)是特例**:第 5 區(功效/主治/標籤)**留空**,
禁令只出現在 4(紅色 chip + 考點)與 2(針法安全區)。空的區塊**不顯示**,
不要印「待補」—— 「待補」是給還沒做的穴用的,對「絕不能治療」的穴是誤導。

---

## 2. 四層分工(不可再混)

課件筆記是英文,所以**英文欄承載課件原文**;中文欄是結構化後的版本。
**標籤與全文是兩層不同的東西**,不可互相取代:

| 層 | 欄位 | 內容 | 長度 |
|---|---|---|---|
| 內容(英) | `functions_en` `indications_en` | 課件原文,**照抄不改寫** | 可長 |
| 內容(中) | `functions_zh` `indications_zh` | 結構化中文,帶配伍 | 可長 |
| **標籤(中)** | `action_tags_zh` `disease_tags_zh` | **短標籤**,搜尋與 chip 用 | 2–6 字 |
| **標籤(英)** | `action_tags_en` `disease_tags_en` | 查 glossary,不自己翻 | 短 |
| 身分 | `point_identity_zh/en` | 五輸、原絡郄募、八會、交會、下合 | — |

英文標籤一律查 **`data/config/acupoint_tag_glossary.json`**。glossary 沒有的詞
**先加進去**再用;該欄寧可整個留空,也不要半翻 —— 半翻會讓後面所有標籤錯位。
身分詞(井滎輸經合、原絡郄募、下合穴)**不可放進 `action_tags`**,
「募穴」不是穴位做的事。

---

## 2.5 中英文都要有版面(Ting 定案 2026-07-30)

Ting:「然後這張卡片沒有做英文版面」「中英文標籤好,而且英文版也好」。

**「有 `_en` 欄位」不等於「有英文版面」。** 曾經的狀況是:資料裡有英文,
但渲染器只翻譯區塊標題,內文照印中文;或者根本沒有對應的 `_en` 欄位可放。

### 必須成對的欄位(全部)
```
location_zh/_en          anatomy_zh/_en           acumethod_zh/_en
moxa_zh/_en              massage_zh/_en           combine_points_zh/_en
modern_research_zh/_en   functions_zh/_en         indications_zh/_en
action_tags_zh/_en       disease_tags_zh/_en      point_identity_zh/_en
cautions_zh/_en          exam_pearl(_en)          exam_importance(_en)
```

⚠️ **英文欄位缺漏時渲染器會 fallback 顯示中文** —— 畫面不會壞,但等於沒有
英文版。**不要靠看畫面判斷做完了沒**,要直接檢查欄位是否存在。

### 英文內容來源優先序(Ting 2026-07-30 指定:eLotus/MasterTung 在 AcuPoints 前面)
1. **eLotus / MasterTung**(`mastertungacupuncture.org`)
2. **American Dragon**(`americandragon.com/Points/<CODE>.html`)—— Ting:
   「AD 的 Point 也寫得極好而且工整,每一個位子都可以找到相對應的資訊」
3. **AcuPoints.org**(`acupoints.org/<code>-acupuncture-point/`)
4. 課件本身就是英文,可直接用作 `functions_en` / `indications_en` 主幹

---

## 2.6 我的臨床筆記(`js/notes.js`)—— Ting 定案 2026-07-30

Ting:「注意事項挺多重要的內容啊,可不可以開一個欄位類似筆記之類的,
中藥、穴位、方劑都有,這樣提供我自己做臨床筆記」。

**絕對不寫進 `data/**.json`。** 三個理由:
1. 那些檔案帶來源標註,個人臨床觀察沒有 source URL、也不該有
2. `scripts/build-data.js` 會重新生成,寫進去會被蓋掉
3. 有來源的內容和無來源的個人心得混在一起,以後分不出哪個可信

存 localStorage(跟 RV1 驗證紀錄同一套機制),key 用 `kind:id`:
`point:ST36`、`herb:herb.he_tao_ren`、`formula:formula.ma_huang_tang`。
**id 不可變(DECISIONS D2),所以卡片內容被重寫時筆記照樣掛得住** ——
這正是現在在做的事。

有匯出/匯入:localStorage 會被「清除網站資料」清掉,累積幾個月的臨床觀察
不能就這樣不見。匯出檔標明私人,**與 RV1 那份「可安心 commit」的驗證檔分開**。

---

## 2.7 來源一律具名,不露網址(Ting 定案 2026-07-30)

Ting:「下面的參考來源應該要做成網站 link,然後只是指名哪個網站,
不要露出醜醜的地址,跟中藥卡一樣才對」。

- 顯示成**具名 chip**:`eLotus CORE` / `American Dragon` / `雲端中醫 CloudTCM`,
  網址只放在 `href`,**不在畫面上出現**
- 課件顯示成 `📘 課件 <檔名> p<頁>` badge,不做成死連結
- **一個網站一個 chip**,不是一頁一個
- 不准出現沒有實際核讀的來源名稱(同 `HERB_RECORD_STANDARD.md` §4.5)

舊版印的是 `English source: https://www.acupoints.org/st36-acupuncture-point/`
這種純文字,又長又不能點。

---

## 2.8 病症分類用查表,不寫進穴位記錄

`related_conditions` 只存 `cond.*` id 陣列。分類(婦科/疼痛/消化…)
**不寫進穴位記錄**,渲染時用 id 去查
`data/pathology/condition_canon_shortlist.json` 的 `category`,
標籤來自 `data/config/condition_category_vocabulary.json`(12 類)。

**為什麼不寫進穴位記錄**:ST36 有 112 個關聯病症。若每個穴位各自存一份分類,
以後病症模組改分類就要回頭改 361 筆,一定會有幾筆對不上。
查表則自動同步。每類各自折疊,避免 112 個 chip 排成一面牆。

---

## 2.9 拼音**不要**加聲調(Ting 定案 2026-07-30,推翻先前規則)

Ting:「其實我不喜歡拼音有聲調,因為這樣搜尋打拼音很難找。」

**她說的是對的,先前寫「拼音要帶聲調」是錯的規則。** `pinyin` 是統一搜尋實際
比對的欄位(見 §6.5A 可搜清單),一旦寫成 `Zú Sān Lǐ`,打 `zusanli` 就搜不到 ——
而打拼音正是最常用的找穴方式。

| 欄位 | 內容 | 用途 |
|---|---|---|
| `pinyin` | `Zusanli`(**無聲調**) | 搜尋比對,保持現狀 |
| `pinyin_toned` | `Zú Sān Lǐ` | 只給畫面顯示用,**目前沒有需求,不必建立** |

**不要**為了「看起來專業」去把 342 個穴的 `pinyin` 加上聲調 —— 那會直接弄壞搜尋。
validator 現在只把無聲調數量列為參考資訊,不當缺口。

---

## 3. 硬規則(validator 會擋)

| 規則 | 內容 |
|---|---|
| **A1** | `code` / `chinese` / `pinyin` 必填 |
| **A2** | 代碼不可重複 |
| **A3** | `_zh` 欄位有內容就必須有中文(曾有 11 個腎經穴的 `cautions_zh` 是英文) |
| **A4** | `_en` 陣列長度必須等於 `_zh`,**不確定就整個留空,絕不錯位** |
| **A5** | 已整理的穴不可缺 `_en` |
| **A6** | `functions_zh` **上限 8 條**(目標 4–6);有 16 條要精煉。**沒有下限** —— 課件真的只給 2 條就 2 條(LU4/LU8/LU11)、只給 1 條就 1 條(SP16 腹哀「調理腸道」),**不要湊**。條數偏少會出現在 `--worklist` 供 Ting 複查,但不擋 |
| **A7** | 針法**必含深度/角度數字** —— 安全欄位 |
| **A8** | 禁忌必須**穴位專屬**,共用套話(「局部皮膚破損或感染時避開」)= FAIL。**但「共用」不等於「套話」** —— 見下方修訂 |
| **A10** | 標籤殘留匯入鷹架(`心痛 (Indication)`)= FAIL(全穴適用) |
| **A11** | `_en` 陣列裡出現中文 = FAIL(全穴適用)。半套翻譯比空的更糟,卡片會把它當英文層渲染 |
| **A12** | `review_status` 必須是 `draft`／`source_checked`／`deprecated`(模板級才擋) |
| **A14** | **安全欄位裡是針法指示而不是風險 = FAIL**(全穴適用) |

### A8 的修訂(2026-07-30)—— 這條規則曾經在要求刪掉氣胸警告

A8 原本把「≥10 穴共用的字串」一律視為套話。實際跑下去,它掃進了:

```
10 穴共用：⚠️ 深刺可能刺穿肺造成氣胸（課件明列）—— 斜刺 0.3–0.5 吋
10 穴共用：⚠️ 嚴禁深刺以免氣胸。
14 穴共用：不可深刺。
14 穴共用：孕婦慎用。
```

**這些會重複,是因為同一個真實風險本來就適用於多個胸背穴。** 規則照字面執行
就是在要求 agent 刪掉 20 個穴的氣胸警告來換綠燈 —— 和這條規則的目的完全相反,
而且**很可能就是 12 經那批安全內容被清掉的原因之一**。

現在的判準:**內容有沒有指名解剖結構／器官風險／孕期／出血**。
有就豁免(不管重複幾次);只有「對任何針刺都成立的空話」才算套話:

```
套話(該刪)：局部皮膚破損時避開。／局部皮膚破損或感染時避開。
真風險(留)：胸骨面淺薄，不可深刺。／背部避免深刺。／出血傾向者慎點刺。
```

### A14 —— 安全欄位必須寫風險,不是寫怎麼下針

12 經那批把定位＋深度寫進了 `contraindications`／`cautions_zh`(285/361 穴),
其中 **206 穴變成只有深度數字、完全沒有警語**:

```
KI8 禁忌 =「復溜前 0.5 寸脛骨內側緣後方，直刺 0.5-0.8 寸。」
    原本 =「孕期、生殖治療期間、使用抗凝血藥物…須由合格臨床人員操作」
```

A8 抓不到,因為每個穴寫的字串都不一樣(各自含自己的定位深度),**看起來就很「穴位專屬」**。
A14 補這個洞:安全欄位只講「在哪、多深」就是放錯欄位,深度屬於 `acumethod_zh`。

⚠️ **把深度寫成「限制」是正確的安全內容,A14 不擋**:
「頸部針刺深度控制在 0.3–0.5 吋」「深刺可能傷及肺」「直刺不超過 0.3 吋」
「近肺區域需斜刺或淺刺,避免深刺」都是對的。A14 第一版判太嚴,誤標了 4 筆
這種內容 —— 那會逼人刪掉真警語來換綠燈,已放寬。

**A6/A7 的例外**:禁忌寫著「絕對禁針 / NEVER needled」的穴自動豁免 ——
對一個絕不能針的穴要求針刺深度,等於違背這條規則本身要保護的東西。

**「已整理」的定義**是 `field_sources.functions_zh` 存在,不是「有任何
field_sources」。加考試星號會替 145 個還沒整理的穴寫入 `field_sources.exam_star`,
用寬鬆定義會讓它們全部被當成已整理而爆出 236 個錯。

**安全不可降級**:既有的氣胸/深刺/避開動脈警告只能**加強或補充**,
不可刪除或改弱。課件的深度數字**加在既有針法後面**,不是覆蓋。

`review_status` AI 只能寫 `"draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

---

## 4. 來源優先序與交叉對照

**先框架、再內容。** 考綱決定**做什麼、什麼是考點**;課件與網站決定**寫什麼**。
順序不可對調 —— outline 是**範圍不是教材**,不要拿它的條列當主治。

| # | 來源 | 它決定什麼 | 進哪一欄 |
|---|---|---|---|
| **0** | **Board exam outline**(`curriculum/board/`,NCBAHM 2026 ACPL 現行版)| **框架** —— 哪些穴先做、`exam_importance` 怎麼標 | `exam_importance` |
| **1** | **`curriculum/acupoints/`** 課件(14 條經絡講義 + Techniques + AP Point Book) | **內容主幹**,英文照抄 | `functions_en` `indications_en` `point_identity` `needling` `contraindications` `exam_pearl` |
| **2** | **eLotus** | 課件沒講到的臨床深度、針法細節 | 補 `indications` `needling` `clinical_pearls` |
| **3** | **AcuPoints.org** | 英文定位與圖解對照 | `location_en` `visual_links` |
| **4** | **CloudTCM 雲端中醫** | 中文深度、配穴、現代研究、艾灸按摩 | `combine_points_zh` `modern_research_zh` `moxa_zh` `massage_zh` |
| **5** | WHO Standard Acupuncture Point Locations | 定位標準 | `location_zh` |

### 交叉對照怎麼做(每一穴)

1. **查考綱**:這穴在不在範圍?課件有沒有標 `*` / `**`?
   → 決定 `exam_star` 與 `exam_importance`。**課件的星號就是老師標的考點**,
   不用自己判斷什麼是重點。
2. **跑解析器**取課件原文,**不要用眼睛讀 PDF**:
   ```
   python3 scripts/parse-channel-curriculum.py "curriculum/acupoints/<檔>.pdf" --code ST36
   ```
   四欄表格攤平讀會**張冠李戴**(LI12–LI16 的功效在版面上連成一片)。
   解析器用座標配對,不靠閱讀順序。
3. **寫中文層**,逐項對齊解析器的英文。**條數不合就是有一邊寫錯** ——
   腳本要 assert 擋下(ST 那批擋下我 9 個),不要硬塞。
4. **既有的 CloudTCM 內容留著** —— 配穴、現代研究、艾灸、按摩不動。
   課件與網站衝突 → **兩個都記、標出處**,絕不擅自二選一。
5. **逐欄 `field_sources`**:課件用 `curriculum/acupoints/<file>#p<N>`,
   網站用完整 URL。**沒實際核讀過的來源不得列名。**

⚠️ **網路存取視環境而定,不要假設。** 2026-07-27 寫這份時的環境讀不到
CloudTCM / American Dragon(403);2026-07-30 的環境**可以**,ST36/PC6 的英文層
就是那時實際開頁抓的。**開工前先測一次**:抓得到就抓,抓不到就標「待對照」,
**兩種情況都不准假裝查過**。既有的 CloudTCM 內容是先前抓好的,照樣可用。

⚠️ **CloudTCM 有頁面自相矛盾的案例。** 桑枝(`/herb/1157`)的「基本資訊」頁寫
苦平歸肝經(與課件、AD 一致),但同一頁的「傳統功效」段落卻寫疏散風熱、清肺潤燥、
歸肺肝經 —— 讀起來是桑葉/桑白皮的內容。**同一個來源內部打架時,以與課件/AD
一致的那一段為準,並在 `source_note` 寫明排除了哪一段、為什麼。**

### 董氏奇穴另一套來源
1. <https://www.tungs-acupuncture.com/> 2. eLotus
資料在 `data/tung/`,**不混進 `361.json`**,也不要拿十四經取穴邏輯套董氏分區。

---

## 5. 配穴的寫法(Ting 指定必留,格式要更具體)

**現況**:361 穴**全部**有 `combine_points_zh`(ST36 有 672 字),多為
CloudTCM 搬來的敘述,已渲染成「常用配穴與臨床應用」卡片。**這些不可刪。**

**目標格式**(新做或改寫時照這個結構;既有的逐步遷移,不急著全改):

```
一· 足三里 配 天樞、三陰交、腎俞、行間
   【主治】腹痛、便祕
   【各穴角色】天樞＝大腸募穴；三陰交＝脾肝腎交會；腎俞＝腎背俞穴；行間＝肝經滎穴
   【機理】補益脾腎之氣，調節肝脾功能，從根本改善症狀
   【出處】CloudTCM
```

四欄:**配穴組 → 主治 → 各穴角色 → 機理**,出處另標。
穴名會自動連結到單穴頁,寫全名即可。

**不要**把配穴壓縮成一行穴名清單 —— 那會丟掉「為什麼這樣配」,
而那正是這一區最有價值的地方。

---

## 6. 樣板欄位清單(ST36 到位的欄位)

**身分與考試**:`code` `chinese` `pinyin` `english` `channel_zh/en` `region`
`point_categories` `point_identity_zh/en` `exam_star` `exam_importance` `exam_pearl`

**內容**:`functions_zh/en` `indications_zh/en`

**標籤**:`action_tags_zh/en` `disease_tags_zh/en`

**定位針法**:`location_zh/en` `cun_measurement` `anatomy_zh` `needling`
`acumethod_zh/en` `moxa_zh` `massage_zh`

**臨床(既有,必留)**:`combine_points_zh` `clinical_pearls`
`modern_research_zh` `cloudtcm_detail` `classical_refs`

**安全**:`contraindications` `cautions_zh/en` `danger`

**來源**:`field_sources`(逐欄)`sources` `visual_links` `review_status`

---

## 6.5 連接層(複習 / 病例 / 搜尋)—— Ting 定案 2026-07-27

卡片不只是拿來讀的,還要能**複習、連病例、被搜到**。這三件事各需要一個欄位,
現在**先把欄位與頁面位置定下來,資料可以留空,以後補**。

### (A) 搜尋契約 —— 已完成

穴位搜尋**必須**索引下列欄位。標籤保持短的理由就是為了被搜到與被連接,
如果不索引,短標籤就沒有意義:

```
code · chinese · name_en · pinyin · channel · region
functions_zh · functions_en · indications_zh
action_tags_zh/en · disease_tags_zh/en      ← 短標籤
point_identity_zh/en                          ← 「郄穴」「八脈交會」搜得到
other_names_zh                                ← 別名，「虎口」找得到合谷
```

⚠️ 曾經漏掉:標籤、身分、別名都不在索引裡,所以辛苦翻譯的 151 個標籤
搜尋搜不到,「郄穴」「八脈交會」「虎口」全部 0 筆。新增可搜欄位時要同步更新
`app.js` 的 `unifiedSearch` 與這份清單。

### (B) 病例連接 —— 兩套詞彙都掛(Ting 定案)

| 欄位 | 指向 | 現況 |
|---|---|---|
| `related_conditions` | `data/pathology/condition_canon_shortlist.json` 的 `cond.*` | **待補** |
| `tcm_pattern_ids` | `data/config/tcm_pattern_canon.json` 的 `pat.*` | **待補** |

**為什麼兩套都要**:病例寫的是主訴與西醫病名(方便從病例找穴),但推理路徑是
**病 → 證 → 穴**。只掛病名會失去辨證層;只掛證候則從病例查不到。

中醫證候 canon **已經建好**:`data/config/tcm_pattern_canon.json`,140 個證候,
由 `scripts/build-tcm-pattern-canon.js` 從病證庫既有的 `tcm_patterns` 抽出,
每個帶代表方與關聯病證。**英文名全部留空** —— 沒來源不翻譯,等 Ting 的
中醫/西醫筆記進來再補。其中 **25 個是方證不是證候**(桂枝湯證、小柴胡湯證…),
已在 `note` 標註,待 Ting 決定是否改掛方劑。

⚠️ **代碼格式不一致**:病證庫的敘述文字寫 `SP08`、`SP06`、`DU04`,
穴位庫是 `SP8`、`SP6`、`GV4`。**直接 join 會全部落空** —— 建連結時必須先正規化
(去前導零、DU→GV、REN→CV、UB→BL、SJ→TE、KD→KI、LV→LR)。

### (C) 複習對比 —— `compare_with`

考點裡最有用的是**對比**,但現在是散文,App 無法生對照表也搜不到:

> 「頭痛分經:白芷走陽明,羌活走太陽,藁本走巔頂,川芎走少陽。」

目標欄位(**只在有對比價值的穴填,不強制**):

```json
"compare_with": [
  { "codes": ["LU5", "LU10"], "axis": "清熱緩急", "note": "LU10 偏清而急主咽痛；LU5 偏降而廣主水道與痹痛" },
  { "codes": ["ST37", "ST39"], "axis": "下合穴分工", "note": "上巨虛主大腸、下巨虛主小腸" }
]
```

現況:LU/LI/ST 76 穴的對比都寫在 `exam_pearl` 散文裡。**先不強制抽取** ——
等考點寫得夠多再回頭結構化,現在強制填會變成為填而填。

**驗證**:三項都由 `validate-acupoint-standard.js` **報告而不擋**
(覆蓋率會列在摘要),因為它們是「以後補」而不是「現在缺」。

## 6.8 交給 Antigravity 做批次時的紅線(Ting 2026-07-30)

Ting:「讓 Antigravity 大量把穴位資訊補下來,但要求它『每批小範圍、可驗證』,
不要一次亂改 700 多筆。你可以一邊複習,一邊抓錯。」

1. **一批一條經**(或半條)。做完跑驗證器 + 讓 Ting 抽查,再進下一批。
2. **只碰 `data/acupoints/`**,絕不碰 `app.js`、`js/`、`index.html`、`scripts/`、
   schema —— 已經發生過覆蓋事故(見 `AI_ROLES.md`)。
3. **新欄位一律 `_zh`/`_en` 成對**,不要自創命名法。
4. **驗證器全綠不等於做完。** validator 只檢查它認得的欄位,**不會**告訴你
   英文欄位漏了、內容重複、或分類放錯。
   **拿新卡的欄位清單跟 ST36/PC6 逐欄比對才算做完。**
   > 前車之鑑:中藥卡 batch12 只跑了 validator 就當作完成,結果 10 個
   > record-level metadata 欄位全部漏掉,validator 照樣全綠 —— 是 Ting 肉眼
   > 比對才抓到的。

### 已知的全庫問題(做批次時會遇到,不是你造成的)

| 問題 | 規模 | 說明 |
|---|---|---|
| `evidence` = `modern_research_zh` 逐字重複 | 348/361 | CloudTCM 匯入造成;渲染器已擋住不重複印,資料層仍重複 |
| 缺 `needling` | ~150 | 見 `CODEX_TASK_QUEUE.md` Track D5 |
| 缺英文三欄 | ~35 | 同上 |
| `action_tags_zh` 混入病系標籤 | 待統計 | 「消化系統疾病」不是功效;PC6/ST36 已清 |
| 中英錯位 | 418 | `BLUEPRINT.md` §3 已記錄 |
| ~~未帶聲調拼音~~ | — | **已撤銷,見 §2.9。`pinyin` 保持無聲調是正確狀態,不要去加** |

### 2026-07-30 修掉的渲染缺陷(不要在資料層繞過它們)

這些是**程式**問題,已修;列出來是為了讓之後的內容批次不要為了「繞過畫面怪怪的」
而去改資料:

1. `regionEn()` 掃描定位全文找關鍵字,ST36 定位裡的「犢**鼻**」讓它判定成
   Head and face —— **所有以犢鼻為標誌的腿部穴都會標錯區域**。已改成優先讀
   `region` 欄位。
2. `pointFunctionsSection()` 在英文模式仍印中英雙行(只有標題翻譯)。
3. `shortTechnique()` 無條件先讀 `acumethod_zh`,英文模式的針法摘要永遠是中文。
4. 解剖同時在「取穴方法」與「現代研究」兩區印出。
5. `FIVE_SHU_ELEMENT_ZH` 是 `const` 且宣告位置在渲染之後 —— **直接用連結開啟
   五輸穴頁面(`#point/ST36`,也就是「複製分頁連結」那條路)會撞 TDZ 並中斷整個
   初始化,整頁死掉**,要重新載入不帶 hash 才會活。已改成 hoisted function。

---

## 7. 批次順序與開工

照經絡,一次一條:

**LU → LI → ST → SP → HT → SI → BL → KI → PC → TE → GB → LR → CV → GV**

已完成:**LU(11)、LI(20)、ST(45)= 76 穴**。

```bash
# 1. 看這條經缺什麼
node scripts/validate-acupoint-standard.js --worklist --channel SP --all
# 2. 取課件原文（座標配對，不靠閱讀順序）
python3 scripts/parse-channel-curriculum.py "curriculum/acupoints/4 SPLEEN...pdf" --json /tmp/sp.json
# 3. 寫中文層 + 身分 + 安全 + 考點；英文從 JSON 讀，逐項 assert 對齊
# 4. 驗證
node scripts/build-data.js && node scripts/validate-acupoint-standard.js
# 5. 考試星號（課件的 * / **）
node scripts/mark-exam-stars.js --apply
```

每批完成 = Ting 可在 App 內用 RV1 逐穴掃驗證。

## R2 Evidence 慣例(2026-08-11,三年藍圖 R2,全線統一)

帶主張的欄位(劑量、安全、療效、機轉、紅旗)必掛 **per-field 來源錨點 +
擷取日期**(`field_sources` 或本線等價欄位;格式參照 pharm 線
`dailymed:<setid>#<SECTION>` 的可機器解析精神)。無來源的欄位誠實留空。
新產卡即遵守;舊卡不回溯強制,由各線驗證器與 ratchet 自然收斂。

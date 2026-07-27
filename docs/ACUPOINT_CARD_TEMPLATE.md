# 穴位卡樣板【定案】 — ST36 足三里

**Status: FINAL(Ting 定案 2026-07-27)。** 每一個穴位都照這張做。
樣板記錄:`ST36`(足三里)、`ST17`(乳中,絕對禁針的特例)。改樣板 = 先問 Ting。

與中藥卡(`docs/HERB_CARD_TEMPLATE.md`)**同一套邏輯**,只是欄位不同。
機器檢查:`node scripts/validate-acupoint-standard.js`(A1–A8,`--worklist` 出清單)。

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

## 1. 卡片區塊(照這個順序,不多不少)

前 7 區是「掃一眼就能背」層,8 之後是「要細讀」層 —— 與中藥卡的
Glance / Study 兩層邏輯一致。

| # | 區塊 | 來源欄位 | 必要性 |
|---|---|---|---|
| 1 | 標頭:代碼 · 中文名 · 拼音 · 英文 · **★考試星號** | `code` `chinese` `pinyin` `english` `exam_star` | 必 |
| 2 | 速覽格:所屬經絡 / 部位 / 針刺手法 / 艾灸 | `channel_zh` `region` `needling` `moxa_zh` | 必 |
| 3 | **特定穴身分**(一排:分類 badge + 課件身分) | `point_categories` + `point_identity_zh/en` | 必 |
| 4 | **💡 考試重點**(★★ 轉紅底) | `exam_importance` `exam_pearl` | 必 |
| 5 | **功效**(中文粗體 + 課件英文對照,逐項成對) | `functions_zh` + `functions_en` | 必 |
| 6 | **主治病症**(同上成對;「標題 —— 細項」自動拆行) | `indications_zh` + `indications_en` | 必 |
| 7 | **標籤**(短標籤,點擊全站搜尋) | `action_tags_zh/en` `disease_tags_zh/en` | 必 |
| 8 | 基本介紹(穴名釋義、別名) | `name_intro_zh` `other_names_zh` | 有就填 |
| 9 | 取穴方法(定位 / **骨度分寸** / 歸經部位 / 解剖) | `location_zh` `cun_measurement` `anatomy_zh` | 必 |
| 10 | 圖像與取穴圖解(外部連結,**不存圖檔**) | `visual_links` `diagram_urls_*` | 有就填 |
| 11 | **常用配穴與臨床應用** | `combine_points_zh` `clinical_pearls` | **必(Ting 指定保留)** |
| 12 | 針刺與艾灸(**深度/角度數字**) | `needling` `acumethod_zh` `moxa_zh` `massage_zh` | 必 |
| 13 | 現代研究 / 臨床提醒 | `modern_research_zh` `cloudtcm_detail` `evidence` | 有就填 |
| 14 | 古籍記載 | `classical_refs` | 有就填 |
| 15 | ⚠️ 注意事項與禁忌 | `contraindications` `cautions_zh/en` | 必 |
| 16 | 參考來源 | `field_sources` `sources` | 必 |

**絕對禁針的穴(ST17 乳中)是特例**:5、6、7 區**留空**,禁令只出現在
3(紅色 chip)、4(考點)、15(禁忌)。空的區塊**不顯示**,不要印「待補」——
「待補」是給還沒做的穴用的,對「絕不能治療」的穴是誤導。

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

## 3. 硬規則(validator 會擋)

| 規則 | 內容 |
|---|---|
| **A1** | `code` / `chinese` / `pinyin` 必填 |
| **A2** | 代碼不可重複 |
| **A3** | `_zh` 欄位有內容就必須有中文(曾有 11 個腎經穴的 `cautions_zh` 是英文) |
| **A4** | `_en` 陣列長度必須等於 `_zh`,**不確定就整個留空,絕不錯位** |
| **A5** | 已整理的穴不可缺 `_en` |
| **A6** | `functions_zh` **2–8 條**(目標 4–6)。真的只有 2 條就 2 條(LU4/LU8/LU11),**不要湊**;有 16 條要精煉 |
| **A7** | 針法**必含深度/角度數字** —— 安全欄位 |
| **A8** | 禁忌必須**穴位專屬**,共用套話(「局部皮膚破損或感染時避開」)= FAIL |

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

⚠️ 目前這個環境**讀不到 CloudTCM / American Dragon(403)**。讀不到就標
「待對照」,**不准假裝查過**。既有的 CloudTCM 內容是先前抓好的,照樣可用。

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

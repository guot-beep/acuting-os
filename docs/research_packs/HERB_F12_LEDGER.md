# HERB F12 LEDGER — formula→herb 參照缺口

分支 `codex/herb-f12-gap`（自 `codex/pattern-v2` 7c1a4ef 開出）。
本檔記錄 F12「composition 有 N 味不在中藥庫」的逐味處置與判斷理由。
**只加深不刪除**：本工作全程未刪除、未縮短任何既有欄位。

---

## 0. 驗證器實際怎麼判 F12（先確認，再動手）

`scripts/validate-formula-standard.js` 的 F12 對每一筆 composition entry 判定：

```js
const unknown = comp
  .filter((c) => !(c && c.herb_id && herbIds.has(String(c.herb_id).trim())))
  .map((c) => String(c?.herb_zh || "").trim())
  .filter((n) => n && !herbNames.has(n));
```

`herbNames` = 中藥庫每筆的 `name_zh` **加上** `aliases_zh`（逐字串比對）；
`herbIds` = 每筆的 `id`。所以一列要「不算缺」有兩條路：

1. `herb_zh` 字串精確等於某筆的 `name_zh` 或某個 `aliases_zh`；**或**
2. `herb_id` 指到庫裡真實存在的 id。

驗證器原始碼自己寫明第 2 條是刻意設計：

> 制半夏, 薑炒厚朴 and (黨參) are correct on a formula card — the processing and
> the substitution marker are clinical information, and rewriting them to the base
> herb would delete it. What matters is that the row links somewhere.

**所以「加 alias 能不能清 F12」的答案是：中文別名可以，羅馬拼音不行**
（拼音寫進 `aliases_zh` 會是假中文，卡片會顯示英文字串，違反憲法五）。

---

## 1. 起始盤點（7c1a4ef，動手前）

一行指令重現：
`node scripts/validate-formula-standard.js --all 2>&1 | grep -c F12`

| 量 | 數字 |
|---|---|
| F12 錯誤行（= 被標記的方劑數） | **60** |
| 查無的 composition entry 數（template-grade） | **82** |
| 查無的 composition entry 數（全部方劑） | 86 |
| **unique 查無字串（template-grade）** | **66** |
| unique 查無字串（全部方劑） | 67 |
| `validate-formula-standard` blocking 總數 | 88 |
| 中藥庫記錄數 | 330 |

派工單說「65 F12 warnings」；實測是 **60 行 / 82 筆 / 66 個 unique 字串**。
差異來自同一味藥重複出現在多個方劑（例：`Xi Jiao` 出現 6 次、`Geng Mi` 5 次）。

### 1.1 最重要的結構性發現

這 66 個「查不到的藥」裡，**過半根本不是缺藥，而是 `herb_zh` 欄位裡寫了羅馬拼音**。
同一味藥在不同方劑同時以兩種形態出現，證據很直接：

| 中文形態 | 羅馬拼音形態 | 實際同一味 |
|---|---|---|
| `僵蠶`（普濟消毒飲） | `Jiang Can`（牽正散） | 是 |
| `白酒`（瓜蔞薤白白酒湯） | `Bai Jiu`（炙甘草湯） | 是 |
| `炮薑`（生化湯等 3 方） | `Pao Jiang`（陽和湯等 2 方） | 是 |
| `穿山甲`（復元活血湯） | `Zhi Chuan Shan Jia`（仙方活命飲） | 是 |
| `雞子黃`（黃連阿膠湯） | `Ji Zi Huang`（大定風珠） | 是 |
| `棕櫚皮` / `棕櫚炭` | — | 是（同一基原、兩種炮製） |

而且其中好幾味**中藥庫早就有卡**，只是 composition 那一列沒連上：

- `Geng Mi` ×5 → 庫裡是 `herb.jing_mi`「粳米」（拼音記作 Jing Mi，同字異讀）
- `Bai Ji Li` / `Chao Bai Ji Li` → 庫裡是 `herb.bai_ji_li`「白蒺藜」
- `Zhi Cao Wu` → 庫裡 `herb.cao_wu` 的 `name_zh` **就是**「制草烏」
- `Zhi Chuan Wu` → 庫裡 `herb.chuan_wu` 的 `name_zh` **就是**「制川烏」

**判斷**：這類不該再建一張重複的卡（會造成雙胞胎記錄，違反 E9 精神），
應該把那一列連回既有記錄。這正是驗證器第 2 條路的設計用途。

---

## 2. Batch 1 — 參照連結與真別名（不含任何新臨床內容）

commit 只動兩件事：composition 的 `herb_id`、以及 4 筆真別名。
**沒有新增任何性味、功效、劑量、安全敘述**，所以不需要新來源；
每一列的顯示名（炮製名／部位名）原字不動地保留。

### 2.1 加中文別名（4 筆）— 這類本來就是同一味藥的另一個名字

| 記錄 | 加入 `aliases_zh` | 加入 `aliases_en` | 理由 |
|---|---|---|---|
| `herb.niu_xi` 牛膝 | 懷牛膝 | Huai Niu Xi | 懷慶（河南）道地產牛膝，同一藥的道地名 |
| `herb.huo_ma_ren` 火麻仁 | 麻子仁 | Ma Zi Ren | 火麻仁的古典別名（麻子仁丸即用此名） |
| `herb.bai_jiang_can` 白僵蠶 | 僵蠶 | Jiang Can | 白僵蠶的通用簡稱 |
| `herb.hua_jiao` 花椒 | 川椒 | Chuan Jiao | 花椒的產地別名 |

四筆原本 `aliases_zh` 都是 `[]` 且無 `aliases_en`，加完 `_zh`/`_en` 皆為 1:1。

### 2.2 加 `herb_id` 連結（30 筆 composition entry，橫跨 25 個方劑）

顯示名保留，只補連結。分三類：

**(a) 炮製變體**（處理方式是臨床資訊，不能改寫成基原名）
`Ju Chao Zhi Ke`(麩炒枳殼)→`herb.zhi_ke`；`Chao Bai Ji Li`→`herb.bai_ji_li`；
`Su Zhi Long Gu`(酥炙龍骨)→`herb.long_gu`；`Su Jiu Gui Ban`(酥炙龜板)→`herb.gui_ban`；
`Shui Fei Zhu Sha`(水飛硃砂)→`herb.zhu_sha`；`酒洗大黃`→`herb.da_huang`；
`酒洗知母`→`herb.zhi_mu`；`薑半夏`→`herb.ban_xia`；`荊芥穗炭`→`herb.jing_jie`

**(b) 部位變體**（同一基原的不同用部）
`Sheng Jiang Pi`(生薑皮)→`herb.sheng_jiang`；`Fu Ling Pi`(茯苓皮)→`herb.fu_ling`；
`赤茯苓`→`herb.fu_ling`；`當歸身`→`herb.dang_gui`；`Jing Jie Sui`(荊芥穗)→`herb.jing_jie`

**(c) 純書寫／拼音變體**（庫裡已有同一味）
`Geng Mi`×5→`herb.jing_mi`；`Chuan Jiao`×2→`herb.hua_jiao`；
`Bai Ji Li`→`herb.bai_ji_li`；`Zhi Cao Wu`→`herb.cao_wu`；`Zhi Chuan Wu`→`herb.chuan_wu`；
`Jiang Can`/`僵蠶`→`herb.bai_jiang_can`；`懷牛膝`→`herb.niu_xi`；
`津蒼朮`→`herb.cang_zhu`；`麻子仁`→`herb.huo_ma_ren`

### 2.3 順手修掉的一個空指標

`formula.run_chang_wan` 的「麻子仁」原本帶 `herb_id: "herb.ma_zi_ren"`，
但**庫裡沒有這個 id**（330 個 id 裡查無），是斷掉的外鍵，卡片點不開。
改指到實際存在的 `herb.huo_ma_ren`。這不是改 id 格式（憲法紅線一），
是把指向空處的參照修成指向實體；原顯示名「麻子仁」一字未動。

### 2.4 Batch 1 結果

| 量 | before | after |
|---|---|---|
| F12 錯誤行 | 60 | **40** |
| `validate-formula-standard` blocking 總數 | 88 | **68** |
| 中藥庫記錄數 | 330 | 330（本批不建卡） |
| `validate-herb-standard` | PASS | PASS |
| `validate-content-junk` | PASS | PASS |
| `check-validation-ratchet` | PASS | PASS |
| `validate-relations` | passed | passed |

`git diff` 形狀核對：`formulas.json` 只有 30 行 `herb_id` 增減（同一 key 的值變更），
`herb_canon_shortlist.json` 只有 4 處 `aliases_zh` 與 4 處新增 `aliases_en`。
沒有任何欄位變短或被清空。

---

## 3. Batch 2 — 13 張新卡（食材／賦形／課件無專論者為主）

先做了兩份課件全文清查（curriculum/**.md，唯讀），確認每一味到底有沒有來源，
再決定建卡或連結。**沒有來源的欄位一律留空**，不用他書推補、不寫樣板句。

### 3.1 課件覆蓋度盤點（決定卡片深度的依據）

| 來源等級 | 味 |
|---|---|
| **THP 4th ed. 有完整專論**（性味/歸經/功效/用量齊全） | 石榴皮、天葵子、化橘紅 |
| 只有方劑組成行（無性味歸經） | 糯稻根、白酒、黃酒、雞子黃、梨皮、棕櫚皮、豬脊髓、小麥、竹葉 |
| 只有課程區塊給了性味 | 綠茶（cold, bitter） |

因此 **13 張卡全部 `card_grade: "partial"`，沒有一張宣稱 template 級**：
template 級會觸發 E7（禁忌症必填），而這 13 味沒有任何一個來源列出禁忌——
宣稱 template 就等於逼自己編禁忌。這是刻意的降級，不是漏做。

### 3.2 逐卡處置

| id | 中文 | category | 有來源的欄位 | 刻意留空 |
|---|---|---|---|---|
| `herb.shi_liu_pi` | 石榴皮 | 收澀藥 | 性味歸經功效用量（THP） | 禁忌 |
| `herb.tian_kui_zi` | 天葵子 | 清熱解毒 | 性味歸經功效用量（THP） | 禁忌 |
| `herb.hua_ju_hong` | 化橘紅 | 理氣藥 | 性味歸經功效用量（THP） | 禁忌 |
| `herb.nuo_dao_gen` | 糯稻根 | 收澀藥 | 功效、方中 5g | 性味、歸經、禁忌 |
| `herb.bai_jiu` | 白酒 | （藥引） | 功效、三方用量 | 性味、歸經、禁忌 |
| `herb.huang_jiu` | 黃酒 | （藥引） | 功效、方中用量 | 性味、歸經、禁忌 |
| `herb.ji_zi_huang` | 雞子黃 | 補陰藥 | 功效、2 枚、煎服法 | 性味、歸經、禁忌 |
| `herb.lu_cha` | 綠茶 | 清熱瀉火 | 性味、功效、2–12g | 歸經、禁忌 |
| `herb.li_pi` | 梨皮 | 止咳平喘 | 功效、1–6g | 性味、歸經、禁忌 |
| `herb.zong_lu_pi` | 棕櫚皮 | 收斂止血 | 功效、6–10g | 性味、歸經、禁忌 |
| `herb.zhu_ji_sui` | 豬脊髓 | 補陰藥 | 歸經（督、腎）、功效、25–50g、製法 | 性味、禁忌 |
| `herb.xiao_mai` | 小麥 | 補氣藥 | 歸經（心）、功效、9–60g | 性味、禁忌 |
| `herb.zhu_ye` | 竹葉 | 清熱瀉火 | 歸經（心、小腸）、功效、2–15g | 性味、禁忌 |

### 3.3 這批的判斷call（每一個都可能被推翻，理由寫在這裡）

**(a) 白酒／黃酒／雞子黃／豬脊髓／綠茶／梨皮 = 食材或賦形，不是正典本草。**
卡片 `category_zh` 直接寫「藥引（賦形）」，`clinical_use_note` 第一句就講明
「這張卡記的是藥引，不是本草專論」。但 `category`（正典欄）必須是分類正典的 32 個
值之一才能通過 E3，所以掛了最接近的正典分類（酒→溫裡藥）。**正典 category 是為了
過校驗，不是宣稱課件把酒列為溫裡藥**——這個落差已寫進卡片的 `source_note_zh`。
如果 Ting 認為正典分類不該被這樣借用，正解是在
`data/config/herb_category_canon.json` 加一個「藥引／賦形」類，那是改設定檔，
不在本次派工範圍，所以沒有動。

**(b) 小麥沒有併進浮小麥。** 甘麥大棗湯**同一張課件卡的兩個區塊互相矛盾**：
AD 表列君藥為小麥（Xiao Mai, 9–60g），Bastyr/Chenoweth 區塊列為浮小麥
（Fu Xiao Mai, 9–15g）；AD 表又把浮小麥列為小麥的替代藥。而且 AD 把小麥的拉丁名
寫成 `Fr. Tritici Levis`——那是浮小麥的拉丁名。依憲法「兩源不合就並記」，
建了獨立的小麥卡並把衝突原文寫進 `cautions_zh`，**沒有替兩邊選一邊**，
`safety_flags` 標 `source_conflict_unresolved`，等 Ting/RV1 裁決。

**(c) 竹葉沒有併進淡竹葉，也沒有搬淡竹葉的性味。**
課件 M.M.1 herb list 與 Chenoweth 功效索引把 Zhu Ye 與 Dan Zhu Ye **分列兩條**；
而竹葉石膏湯的組成資料實際用的是**淡竹葉（君）**，`(Zhu Ye)` 只列為替代藥。
竹葉自己沒有專論，所以性味留空。**把淡竹葉的「甘淡寒」填進竹葉卡，會做出一張
看起來完整、其實無來源的假卡**——這正是憲法要擋的東西。

**(d) 「地葵子」是資料端的錯字。** `formula.wu_wei_xiao_du_yin` 的 composition
寫 `地葵子`，但拼音欄寫 `Tian Kui Zi`、拉丁寫 `Sm. Semiaquilegiae`——正名是**天葵子**。
`地葵子` 三個字在整個 curriculum/ 查無。危險的是庫裡另有 `herb.di_fu_zi`（地膚子，
別名「地葵」）與 `herb.dong_kui_zi`（冬葵子，別名「葵子」），三者名字互相干擾。
處置：建 `herb.tian_kui_zi` 並把該列 `herb_id` 指過去，**沒有改動顯示名「地葵子」**
（改顯示名等於替 Ting 決定原始資料是錯的）。錯字本身列入下方待辦。

**(e) 豬脊髓的拼音。** 課件寫 `Zhu Ji Shui`，但「髓」的無聲調拼音是 `sui`。
id 與 `pinyin` 採正字 `Zhu Ji Sui`（憲法八），課件寫法保留在
`tcm_properties.source_note_zh` 與 ledger，composition 那一列以 `herb_id` 連結。

**(f) 棕櫚炭沒有另建卡**，以炮製變體連回 `herb.zong_lu_pi`，並把「棕櫚炭」
列入其 `aliases_zh`（十灰散方名的「灰」就是炭，兩者本為一物兩製）。

### 3.4 Batch 2 結果

| 量 | before | after |
|---|---|---|
| F12 錯誤行 | 40 | **25** |
| `validate-formula-standard` blocking 總數 | 68 | **53** |
| **中藥庫記錄數** | **330** | **343** |
| `validate-herb-standard` | PASS | PASS |
| `validate-content-junk` | PASS | PASS |
| `check-validation-ratchet` | PASS | PASS |
| `validate-relations` | passed | passed |

`git diff --numstat`：`herb_canon_shortlist.json` **1980 插入 / 0 刪除**（純新增，
既有 330 筆一個字沒動）；`formulas.json` 13 插入 / 13 刪除（全是 `herb_id` 值變更）。

---

## 4. 待處理 — 送 Ting 決定，本次刻意沒做

以下三項不是「還沒做完」，是**做了會超出派工範圍或需要臨床裁決**：

1. **`碧玉散` 不是單味藥，F12 清不掉。** 蒿芩清膽湯的 composition 有一列
   `碧玉散`，但課件證實它是**方中方**（滑石:甘草:青黛 = 6:1:1，六一散加青黛的變方）。
   F12 只接受 `herb_id`，不接受 `formula_id`，所以除非替它建一張假的「單味藥」卡，
   否則清不掉——**建假卡不做**。正解是驗證器允許 composition 連 formula，或
   Ting 決定把它拆成三味。列為資料模型缺口。
2. **兩列 `herb_zh` 是「—」。** `formula.shi_xiao_san`（英文 `Wine or vinegar`）與
   `formula.tong_qiao_huo_xue_tang`（英文 `Rice Wine`, 250g）。後者指向明確可連黃酒，
   但**前者「酒或醋」本身就是二選一的敘述**，硬連會替來源做決定。兩列都保留未連，
   建議 Ting 直接把顯示名補成中文。
3. **`Jiang Shi`（良附丸，6g）未連。** 課件把英文標為 `Rz. Zingiberis`（＝乾薑），
   但良附丸的傳統服法是以**薑汁**送服，拼音 `Jiang Shi` 疑為 `Jiang Zhi`（薑汁）之誤。
   乾薑與生薑是不同的臨床判斷，**查不到確據就不連**（憲法：「查不到」是有價值的答案）。
4. **`荊芥穗` 目前連回 `herb.jing_jie`**（Batch 1），但 THP 其實有
   `NEPETAE SPICA 荊芥穗` 獨立專論（性味歸經與荊芥相同，功效多「hemostatic」、
   用量上限 10g vs 11.5g）。連結不算錯（顯示名保留、可查得到），但更好的做法是
   另建荊芥穗卡。列為後續加深項，不是缺陷。
5. **既有 `herb.bai_ji_li` 的別名陣列本來就不對齊**：`aliases_zh` 3 筆 vs
   `aliases_en` 4 筆。這是本次動工前就有的，驗證器不檢查 aliases 所以沒被抓到。
   **沒有動它**——修法是刪一筆英文或補一筆中文別名，兩者都需要判斷，且不在派工範圍。

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

## 3. 待處理 — 需要建新卡或需要來源確認的字串

（Batch 2 起逐項填入處置與來源）

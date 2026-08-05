# 證型卡片模板(TCM Pattern Card Template)

適用:`data/pathology/pattern_registry.json`(ID 權威)、
`data/pathology/pattern_library.json`(內容層)。

**驗證器:`node scripts/validate-pattern-standard.js --worklist --all`**

搭配閱讀:病症卡看 `docs/CONDITION_CARD_TEMPLATE.md`,規則總則看
`docs/AI_CONSTITUTION.md`,命名空間看 `DECISIONS.md` D10。

Last updated: 2026-08-06(Claude,在 Antigravity 開始量產證型前寫)。

---

## §0 現況評分(2026-08-06 實測,50 筆 `pattern_library`)

先講清楚現在的東西**哪裡好、哪裡不能用**,免得下一輪把好的也砍掉。

| 面向 | 分數 | 實測依據 |
|---|---|---|
| 結構分層 | **7/10** | registry(id 權威)/ library(內容)兩層分離是對的,欄位命名一致 |
| **內容真實性** | **6/10** | 主症、舌、脈、治則 **50/50 全部有內容**,而且 `treatment_principle` **50 筆全不重複** —— 這代表是逐筆寫的,不是套模板。**比 2026-07 中藥那次好很多** |
| **來源** | **0/10** | **50 筆沒有任何一筆有來源欄位。** 一個字都沒有 |
| **雙語** | **3/10** | 名稱與治則有雙語;`key_signs` **0/50 有英文**;舌脈**根本沒有英文欄位** |
| **關係** | **0/10** | `typical_points` **0/50**、`typical_formulas` **0/50** —— 欄位存在但全是空陣列。**證型連不到任何治療** |
| 安全 | **0/10** | 沒有禁忌 / 慎用 / 誤治後果欄位 |
| 鑑別 | **0/10** | 沒有「與最相近的 2–3 個證型怎麼分」—— 而這是證型卡**唯一不可取代的價值** |

**總評:當骨架 6/10,當臨床可用卡 2.5/10。**

`pattern_registry` 的 61 筆全部 `source_type: "derived_from_usage"` ——
它是從病症引用反推出來的,**沒有臨床權威**,只能當索引用。

### 結論:不是重寫,是補

Antigravity 寫的**內容本身不差**,壞的是四件事:
**沒來源、沒英文、沒連結、沒安全與鑑別**。
所以這份模板的重點放在補那四樣,**既有的主症/舌/脈/治則一律保留**
(§0 只加深不刪除)。

---

## §1 五步必跑流程

1. **先跑驗證器**,看這張卡目前的缺陷碼。
2. **來源階層**:`curriculum/`(Ting 課件,Tier-1)→ 標準教材
   (中基/中診/方劑學)→ American Dragon / CloudTCM 精確頁。
   **證型是教科書知識,必須有出處。** 現在 0/50 有來源,這是最大的洞。
3. **逐欄位填,逐欄位標來源**(`field_sources`)。
4. **雙語成對**,陣列索引對齊,寧可整個留空也不要半套錯位。
5. **再跑驗證器 + 自己 diff**,確認沒有欄位變短或被清空。

---

## §2 ID 與命名空間(D10,已鎖)

- 唯一格式:`pattern.<english_slug>` —— 小寫、底線、**純 ASCII**。
- **不准在 `pat.<中文>` 命名空間新增任何記錄。** 中文字進 id 在這個 repo 是
  已知地雷(`docs/ENCODING_TRIAGE.md` 的 mojibake 史)。
- 既有 `pat.*` 透過 `data/config/pattern_alias_map.json` 對應,**不刪不改 id**。
- **`方證`(桂枝湯證、麻黃湯類方證)不是證型。** alias map 已排除 30 筆;
  它們屬方劑層,不要登記進 registry。
- 新登記證型前先跑 `node scripts/build-pattern-alias-map.js` 看它是不是已經在
  `pending_registration` 裡,以及**被幾筆病症引用**(依此排優先序)。

> **待登記前兩名要停一下**:`氣血不和證`(74×)與`臟腑虛弱證`(74×)是
> CloudTCM 的萬用桶,不是有鑑別意義的證型。**登記它們會產生兩個連到半個資料庫
> 的巨型節點。** 不要自己決定 —— 回報給 Ting。

---

## §3 小卡 / 大卡(同一份資料,兩種呈現)

**最重要的設計規則:小卡的欄位是大卡欄位的「子集」,不是另一組欄位。**
一筆資料、一套 schema、兩種渲染。**絕不為小卡新增專用欄位** ——
那會變成兩份 schema,而兩份 schema 必然分岔。

### 3.1 小卡 Preview(搜尋結果、列表、關聯區塊)

只放「認得出來 + 決定要不要點進去」需要的東西:

```
[證型]  肺氣虛  Lung Qi Deficiency  fèi qì xū
臟腑辨證 · 虛證 · 肺
主症:咳喘無力 · 氣短聲低 · 自汗畏風
舌淡苔白 · 脈弱
治則:補益肺氣
關聯:12 病症 · 6 穴 · 3 方          [draft]
```

小卡用的欄位(全部來自大卡):
`name_zh` · `name_en` · `pinyin` · `pattern_family` · `eight_principles` 摘要 ·
`zang_fu` · `key_signs_zh` **前 3 條** · `tongue_zh` · `pulse_zh` ·
`treatment_principle_zh` · 關聯計數 · `review_status`

**小卡不放**:病機、鑑別、加減、禁忌、來源。那些是點進去才看的。

### 3.2 大卡 Detail(單頁細讀)

段落順序固定,缺的段落不顯示(不要留空殼標題):

```
① 辨識      八綱定位 · 臟腑 · 氣血津液 · 別名
② 病機      為什麼會這樣 · 常見成因 · 傳變
③ 表現      主症 · 次症 · 舌 · 脈 · 情志 · 體質
④ 鑑別 ★    與最相近的 2–3 個證型怎麼分（最有價值的一段）
⑤ 治療      治則治法 · 代表方+加減 · 主穴+配穴 · 生活調攝
⑥ 安全      禁忌 · 慎用 · 誤治後果
⑦ 關聯      相關病症（多對多，不等同）
⑧ 來源      逐欄位出處
```

---

## §4 欄位表(驗證器的 approved 清單)

不在這張表裡的欄位一律是 **P8 未經核准的欄位**。要加欄位:先改這份文件,
再改驗證器,最後才改資料 —— 順序不能反。

### 4.1 身分(必填)

| 欄位 | 說明 | 小卡 |
|---|---|---|
| `id` | `pattern.<english_slug>`,永不改 | — |
| `name_zh` / `name_en` | 雙語證型名 | ✅ |
| `pinyin` | **不加聲調**(搜尋用);`pinyin_toned` 僅供顯示 | ✅ |
| `aliases_zh` / `aliases_en` | 別名,成對 | — |
| `pattern_family` | 辨證體系:`八綱` \| `臟腑` \| `氣血津液` \| `六經` \| `衛氣營血` \| `三焦` \| `經絡` | ✅ |
| `review_status` | `draft` \| `source_checked` \| `deprecated` | ✅ |
| `authored_by` | `owner` \| `model_draft` | — |

### 4.2 辨識定位

| 欄位 | 說明 | 小卡 |
|---|---|---|
| `eight_principles` | 物件:`{interior_exterior, cold_heat, deficiency_excess, yin_yang}`,每項值為固定枚舉或 `null` | ✅ 摘要 |
| `zang_fu` | 涉及臟腑,陣列 | ✅ |
| `qi_blood_fluid` | 氣/血/津液/精 的病變,陣列 | — |
| `root_or_branch` | `root`(本) \| `branch`(標) \| `both` | — |

### 4.3 病機(雙語成對)

| 欄位對 | 說明 |
|---|---|
| `mechanism_zh` / `mechanism_en` | 病機:為什麼會出現這組症狀 |
| `common_causes_zh` / `common_causes_en` | 常見成因(外感/情志/飲食/勞倦/久病)|
| `progression_zh` / `progression_en` | 傳變:會發展成什麼、由什麼發展而來 |

### 4.4 表現(雙語成對 —— **目前最大的缺口**)

| 欄位對 | 現況 | 說明 |
|---|---|---|
| `key_signs_zh` / **`key_signs_en`** | 50/50 · **0/50** | 主症,3–6 條,索引對齊 |
| `supporting_signs_zh` / `supporting_signs_en` | 0/50 | 次症 |
| **`tongue_zh` / `tongue_en`** | 舊欄位叫 `tongue`,**沒有英文** | 舌質 + 舌苔要分別寫全(「舌淡」不夠,要「舌淡苔白」) |
| **`pulse_zh` / `pulse_en`** | 舊欄位叫 `pulse`,**沒有英文** | 脈象 |
| `emotional_features_zh` / `_en` | — | 情志特徵 |

> **舊欄位 `tongue` / `pulse` 的遷移:先把值搬進 `tongue_zh` / `pulse_zh`,
> 再移除舊欄位。順序不能反,一反就會忘記搬。**

### 4.5 鑑別 ★(證型卡唯一不可取代的價值)

```yaml
differential_patterns:
  - pattern_id: pattern.lung_yin_deficiency
    distinguishing_zh: 肺陰虛見乾咳少痰、午後潮熱;肺氣虛以無力、自汗為主,無虛熱象
    distinguishing_en: ...
    tongue_difference_zh: 陰虛舌紅少苔;氣虛舌淡苔白
    pulse_difference_zh: 陰虛脈細數;氣虛脈弱
    source: <出處>
```

每個證型至少列 **2 個**最容易混淆的鄰居。`pattern_id` 必須解析得到(P6)。
**這一段做好,整個資料庫才從字典變成辨證工具。**

### 4.6 治療(關係一律用 id,不放內容)

| 欄位 | 指向 | 現況 |
|---|---|---|
| `treatment_principle_zh` / `_en` | 治則治法 | ✅ 50/50,品質好,保留 |
| `typical_formulas` | `formula.*` | **0/50 —— 全空** |
| `formula_modifications_zh` / `_en` | 加減變化 | — |
| `typical_points` | 穴位 code | **0/50 —— 全空** |
| `point_rationale_zh` / `_en` | 為什麼選這組穴 | — |
| `lifestyle_zh` / `_en` | 生活調攝、食療 | — |

### 4.7 安全(**目前 0/50**)

| 欄位對 | 說明 |
|---|---|
| `contraindications_zh` / `_en` | 這個證型不能用什麼(如陰虛忌溫燥) |
| `cautions_zh` / `_en` | 慎用 |
| `mistreatment_consequence_zh` / `_en` | 誤治後果(如虛證誤攻導致什麼) |

### 4.8 關聯與來源

| 欄位 | 說明 |
|---|---|
| ~~`related_conditions`~~ | **已退役,不准手填(D13)。** 它是 `cond.related_patterns` 的反向 —— 反向一律衍生(`pattern_registry.used_by_conditions`),手填兩邊必然分岔。手填會被 validator 記為 P8 |
| `sources` | **唯一正典來源欄位** |
| `field_sources` | 逐欄位出處 |
| `legacy_ids` | 對應到的 `pat.*` 舊 id(來自 alias map) |

---

## §5 驗證器錯誤碼

```bash
node scripts/validate-pattern-standard.js --worklist --all
node scripts/validate-pattern-standard.js --worklist --family 臟腑
```

| 碼 | 意義 |
|---|---|
| P1 | 缺核心身分(id / name_zh / name_en / pattern_family) |
| P2 | 重複 id |
| P3 | id 不是 `pattern.<ascii_slug>`(含用了 `pat.` 舊命名空間) |
| **P4** | **沒有任何來源**(`sources` 與 `field_sources` 皆空) |
| P5 | `_zh` 有內容但 `_en` 空(或反向) |
| P6 | `differential_patterns` / `related_conditions` 的 id 解析不到 |
| P7 | 陣列 `_en` 與 `_zh` 長度不一致(索引錯位) |
| P8 | 未經核准的欄位 |
| P9 | 舌或脈只有舊的無語言欄位(`tongue` / `pulse`)尚未遷移 |
| N1 | 沒有鑑別(`differential_patterns` 空)—— 提示,不擋 |
| N2 | 沒有任何治療連結(`typical_points` 與 `typical_formulas` 皆空)—— 提示 |

---

## §6 DON'T

1. **不要刪既有的主症/舌/脈/治則。** 它們是逐筆寫的真內容(治則 50 筆全不重複),
   要做的是**補來源、補英文、補連結、補安全**。
2. **不要在 `pat.<中文>` 命名空間新增記錄。**
3. **不要把方證登記成證型。**
4. **不要為小卡新增專用欄位** —— 小卡是大卡的子集。
5. **不要憑記憶寫證型內容。** 證型是教科書知識,要有出處;
   兩本教材不合就兩個都記並註明。
6. **不要把證型與西醫病名一對一等同。** 多對多 + 「可能重疊」。
7. **不要自己決定要不要登記 `氣血不和證` / `臟腑虛弱證`** —— 回報給 Ting。
8. **不要用一句話套 50 筆。** 200 筆共用一句不是內容,而且比留空更糟。

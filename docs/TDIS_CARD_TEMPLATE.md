# 中醫病名卡片模板(TCM Disease Card Template)

適用:`data/pathology/tdis_registry.json`(75 筆中醫病名)。

**驗證器:`node scripts/validate-tdis-standard.js --worklist --all`**

姊妹文件:西醫病名看 `docs/CONDITION_CARD_TEMPLATE.md`,證型看
`docs/PATTERN_CARD_TEMPLATE.md`,規則總則看 `docs/AI_CONSTITUTION.md`。
命名空間分工看 `DECISIONS.md` **D11**,四件必備部件看 **D14**。

Last updated: 2026-08-06(Claude,補上 D14 四件裡 `tdis.*` 缺的模板)。

---

## §0 現況(2026-08-06 實測,不是宣稱)

**75 筆記錄,每一筆只有 5 個欄位:**

```
id · name_zh · pinyin · name_en · classical_source_hint
```

| 面向 | 評分 | 依據 |
|---|---|---|
| 身分層 | **9/10** | 75/75 有 id、雙語名、拼音;**0 個 id 格式錯誤**;**拼音 0 筆帶聲調**(符合 CLAUDE.md) |
| 連結完整性 | **9/10** | 70/75 被至少一筆病症引用,**0 條懸空連結** |
| 分類 | **3/10** | `classical_source_hint` 是自由文字,**22 種寫法**,而且混了三種東西(見 §2) |
| **內容** | **0/10** | **沒有任何臨床欄位** —— 沒有定義、病因病機、主症、辨證分型、治法、red flags |

**一句話:這是一份很乾淨的索引,不是卡片。** 它的 id 層做得比其他層都好
(這也是為什麼病症的 `related_eastern_diseases` 全部解析得到),
但它從來沒有內容層。

> **所以這份模板的第一個作用不是規範既有內容,是宣告「內容還沒開始」。**
> 不要把 75 筆有名字沒內容的記錄回報成「中醫病名已完成」。

---

## §1 中醫病名是什麼(以及它不是什麼)

```
tdis.*   中醫病名   感冒 · 咳嗽 · 喘證 · 胃痛 · 痛經 · 不寐
```

**以症狀群定義的典籍病名,底下再分證型。** 三條界線:

| 不是 | 為什麼 | 去哪 |
|---|---|---|
| **不是證型** | 頭痛(病)底下有肝陽上亢、血虛、痰濕(證)。一病多證 | `pattern.*` |
| **不是西醫病名** | 眩暈 ≠ 梅尼埃病。多對多,不等同 | `cond.*` |
| **不是症狀** | 「頭痛」當病名時是一個完整的辨證單元;當症狀時只是一個觀察 | `sym.*`(未建) |

**最重要的臨床安全規則**(與 `cond.*` 同):**不准一對一等同。**

```
❌ 眩暈 = 梅尼埃病
✅ 眩暈 → 可能重疊 → 梅尼埃病 / 高血壓 / 貧血 / 椎基底動脈供血不足
```

---

## §2 分類:`taxonomy_id`,不是 `classical_source_hint`

現有的 `classical_source_hint` 有 22 種寫法,而且**把三種不同的東西塞在同一欄**:

```
中醫內科學·脾胃     ← 教科書章節（其實是「科別+系」分類）
金匱要略·婦人       ← 典籍出處
針灸治療學          ← 來源書名，根本不是病名分類
```

**拆成兩欄**(這是 22 種寫法的根因):

| 欄位 | 意義 | 值 |
|---|---|---|
| `taxonomy_id` | **科別 + 系的分類** | 來自 `data/config/tcm_disease_taxonomy.json`(11 大類 × 34 子類),ASCII id |
| `classical_source` | **典籍出處** | 自由文字但要具體(`金匱要略·婦人妊娠病脈證并治`),沒有就留空 |

`taxonomy_id` 範例:`tdx.internal_medicine.spleen_stomach_gastrointestinal` ·
`tdx.gynecology_obstetrics.menstrual_disorders` · `tdx.ent.nose`

> **「針灸治療學」那 5 筆(面癱／口僻・落枕・肩凝症・牙痛・面痛)要依病本身
> 重新歸類**,不是照抄來源書名。面癱→內科·經絡肢體;牙痛→口腔科;
> 落枕/肩凝→骨傷科。這是判斷題,填充時逐筆決定並記來源。

---

## §3 小卡 / 大卡

**規則同其他三套:小卡欄位是大卡的子集,絕不為小卡新增專用欄位。**

### 3.1 小卡 Preview

```
[中醫病名]  眩暈  Dizziness / Vertigo  xuanyun
內科 · 肝膽病症
主症:頭暈目眩 · 視物旋轉 · 甚則欲仆
常見證型:肝陽上亢 · 氣血虧虛 · 腎精不足 · 痰濕中阻   ⚠ 2 red flags
4 證型 · 6 穴 · 3 方                                    [draft]
```

小卡欄位:`name_zh` / `name_en` / `pinyin` · `taxonomy_id` 的雙語標籤 ·
`key_manifestations_zh` **前 3 條** · `related_patterns` 名稱 ·
**red flag 數量與最高 urgency** · 關聯計數 · `review_status`

### 3.2 大卡 Detail(段落順序固定,缺的段落不顯示)

```
① 定義      名稱 · 別名 · 分類 · 典籍出處 · 一段話定義
② 病因病機   外感/內傷/情志/飲食/勞倦/體質 → 病機 → 傳變
③ 臨床表現   主症 · 次症 · 病位 · 病性
④ 辨證分型 ★ 底下有哪些證型（連 pattern.*，這是中醫病名卡的核心）
⑤ 安全 ★    red flags · 西醫急症鑑別 · 轉診條件
⑥ 治療原則   治法總綱（各證的具體方穴在證型卡上，這裡只做連結）
⑦ 關聯      西醫病名（多對多，不等同）· 相似中醫病名的鑑別
⑧ 來源      逐欄位出處
```

**④ 是這張卡不可取代的價值** —— 沒有辨證分型的中醫病名卡等於一本字典的詞條。
**⑤ 排在治療之前**,理由同 `cond.*`:讀者該先知道什麼時候不要治。

---

## §4 欄位表(驗證器 T8 的依據)

不在表內 = T8。要加欄位:先改這份文件 → 改驗證器 → 才改資料。

### 4.1 身分(必填,現有 75 筆已具備)

| 欄位 | 說明 | 現況 |
|---|---|---|
| `id` | `tdis.<pinyin_slug>`,ASCII,永不改(D1) | ✅ 75/75 |
| `name_zh` / `name_en` | 雙語病名 | ✅ 75/75 |
| `pinyin` | **不加聲調**(搜尋用);`pinyin_toned` 僅供顯示 | ✅ 75/75 無聲調 |
| `aliases_zh` / `aliases_en` | 別名(病名同義最多,例:油風／斑禿) | ⬜ |
| **`taxonomy_id`** | 見 §2 | ⬜ **待遷移** |
| `classical_source` | 典籍出處,與分類分開 | ⬜ **待拆分** |
| `review_status` | `draft` \| `source_checked` \| `deprecated` | ⬜ |
| `authored_by` | `owner` \| `model_draft` | ⬜ |

### 4.2 內容(雙語成對,單邊填 = T5/T9)

| 欄位對 | 說明 |
|---|---|
| `definition_zh` / `_en` | 一段話定義 |
| `etiology_zh` / `_en` | 病因(外感/內傷/情志/飲食/勞倦/體質)|
| `pathomechanism_zh` / `_en` | 病機與傳變 |
| `key_manifestations_zh` / `_en` | 主症,3–6 條,索引對齊 |
| `associated_manifestations_zh` / `_en` | 次症 |
| `disease_location_zh` / `_en` | 病位(臟腑/經絡)|
| **`red_flags_zh` / `_en`** | **安全,見 §5** |
| `treatment_principle_zh` / `_en` | 治法總綱 |
| `classical_references_zh` / `_en` | 條文引用 |

### 4.3 關係(一律 id;反向一律衍生,D13)

| 欄位 | 指向 | 說明 |
|---|---|---|
| `related_patterns` | `pattern.*` | **辨證分型 —— 這張卡的核心** |
| `differential_diseases` | `tdis.*` | 與相似中醫病名怎麼分 |
| `typical_formulas` / `typical_points` | `formula.*` / point id | 總綱層,細節在證型卡 |

> ~~`used_by_conditions`~~ ~~`related_conditions`~~ **不准手填** —— 兩者都是
> `cond.related_eastern_diseases` 的反向,一律衍生(D13)。手填 = T8。
> (related_conditions 於 2026-08-26 自本表退役:relation_registry 08-06 就把
> 這條邊的儲存側判給 cond.*,退役時 0/160 已填,零成本,同
> pattern_library.related_conditions 先例。)

### 4.4 來源

`sources`(唯一正典來源欄位)· `field_sources`(逐欄位出處)· `source_type`

---

## §5 Red flags —— 中醫病名**更**需要,不是更不需要

眩暈、頭痛、胸痺、中風先兆這類中醫病名底下,藏著中風、蜘蛛膜下腔出血、
心肌梗塞。**病人是拿著中醫病名來的,危險卻是西醫的。**

結構同 `cond.*`(五欄,五級 urgency):

```yaml
red_flags_zh:
  - finding: 眩暈伴單側肢體無力或言語不清
    urgency_level: emergency          # emergency|same_day|urgent|routine|monitor
    recommended_action: 立即急診,不要治療
    rationale: 中風/TIA 的典型表現
    source: <確切出處>
```

查不到就寫明來源缺口(查過哪些、日期、結果),**不要留空,更不要編**。

---

## §6 驗證器錯誤碼

```bash
node scripts/validate-tdis-standard.js --worklist --all
node scripts/validate-tdis-standard.js --worklist --taxonomy tdx.gynecology_obstetrics
```

| 碼 | 意義 |
|---|---|
| T1 | 缺核心身分(id / name_zh / name_en / pinyin) |
| T2 | 重複 id |
| T3 | id 不是 `tdis.<ascii_slug>` |
| **T4** | **沒有 red flags(安全)** |
| T5 / T9 | `_zh` 有內容但 `_en` 空(或反向) |
| T6 | 關係 id 解析不到 |
| T7 | 陣列 `_en` 與 `_zh` 長度不一致 |
| T8 | 未經核准的欄位(含手填衍生欄位) |
| **T10** | **`taxonomy_id` 缺失或不在詞彙表**;或仍在用 `classical_source_hint` |
| T11 | `pinyin` 帶聲調 |
| N1 | 沒有辨證分型(`related_patterns` 空)—— 提示 |
| N2 | 沒有任何臨床內容(定義/病因/主症全空)—— 提示 |

---

## §7 DON'T

1. **不要把中醫病名卡寫成證型卡。** 各證的舌脈方穴在證型卡上,這裡只列出
   有哪些證型並連過去。重複寫 = 兩份會分岔。
2. **不要建立與西醫病名的一對一等同。**
3. **不要手填 `used_by_conditions`** —— 反向一律衍生(D13)。
4. **不要照抄 `classical_source_hint`** —— 分類與典籍出處要拆兩欄(§2)。
5. **不要跳過 red flags。**(§5)
6. **不要把 75 筆有名字沒內容回報成「完成」。**(§0)
7. **拼音不加聲調。**

## R2 Evidence 慣例(2026-08-11,三年藍圖 R2,全線統一)

帶主張的欄位(劑量、安全、療效、機轉、紅旗)必掛 **per-field 來源錨點 +
擷取日期**(`field_sources` 或本線等價欄位;格式參照 pharm 線
`dailymed:<setid>#<SECTION>` 的可機器解析精神)。無來源的欄位誠實留空。
新產卡即遵守;舊卡不回溯強制,由各線驗證器與 ratchet 自然收斂。

## T4 與骨架層(2026-08-11,鏡像 CONDITION 模板「C4 與骨架層」)

純骨架卡(`review_status: "skeleton"` 且無任何內容欄:definition/etiology/
pathomechanism/manifestations/related_patterns/red_flags;classical_source 屬出處可帶)
不主張內容 → T4 改計 N4(note,不阻擋)。一旦加入任何內容欄位,T4 立即
全力適用 —— 「有定義但沒紅旗」正是 T4 要抓的狀態(眩暈底下藏中風)。
骨架卡必含:id/雙語名/pinyin/taxonomy_id/aliases(成對)/review_status。

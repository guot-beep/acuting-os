# Herb Record Standard(中藥資料規範 — 機器可檢查)

Ting 2026-07-25:「感覺還不夠系統,請制定更規範,然後大家都可以遵照。」
這份是**唯一的中藥欄位規範**。它不是建議 — `scripts/validate-herb-standard.js`
會強制檢查,任何 AI 的中藥批次必須全綠才能 push。

檔案:`data/herbs/herb_canon_shortlist.json`(266 味)。

## 1. 正典欄位(canonical fields)

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | string | `herb.<pinyin_snake>`,不可改不可刪 |
| `name_zh` / `name_en` / `pinyin` | string | 必填;pinyin **帶聲調**(Dù Zhòng,不是 Du Zhong)— 新填/改到的一律帶調 |
| `category` | string | **必須**出自 `data/config/herb_category_canon.json` 的 `categories`;要新分類 → 先經 Claude 加進 canon,再用 |
| `properties_taste_temp` | string | 性味+溫度,如「辛、微苦、溫」 |
| `channels_zh` | array | 歸經,如 ["肺經","膀胱經"] |
| `functions_zh` | array | **只放傳統功效**(發汗解表…)。現代藥理絕不混進來 |
| `modern_functions_zh` | array | **只放現代藥理**(抗發炎…) |
| `indications_zh` | array | 主治 |
| `condition_tags_zh` | array | 病症標籤(卡片會配英文對照) |
| `dosage` | object | 有來源才填;**絕不編數字**。缺 = 留空 + 待補 |
| `cautions_zh` | array | 禁忌/注意(安全欄位,優先審) |
| `safety_flags` | array | 安全旗標 |
| `related_formulas` | array | 方劑 id 連結 |
| `exact_source_url` / `safety_source_url` | string | 逐筆出處;curriculum 用 `curriculum/herbs/<file>#p<N>` |
| `review_status` | string | AI 只能寫 `"draft"`;`source_checked` 只由 Ting 的 RV1 流程升級 |

**通則**:每欄雙語精神(`_zh` 欄位有內容就必須含中文 — validator E4 直接 FAIL);
不可覆蓋更豐富的舊值(只加深不變薄);`data/generated/` 不手改。

## 2. 舊欄位(legacy — 唯讀,不再往裡填)

| 舊欄位 | 問題 | 正典去向 |
|---|---|---|
| `functions` | 傳統+現代藥理混在一起 | 拆進 `functions_zh` / `modern_functions_zh` |
| `category_zh` | 另一套教材分類(發散風寒藥…) | 保留作參考;`category` 用 canon(alias 表可自動對映) |
| `channels_entered` | 與 `channels_zh` 重複 | 用 `channels_zh` |
| `taste_temperature_zh` | 只有 61 筆、與 properties 重複 | 用 `properties_taste_temp` |

## 3. 強制工具(the enforcement)

| 工具 | 何時跑 | 作用 |
|---|---|---|
| `node scripts/validate-herb-standard.js` | 每個中藥批次後(必) | E1-E4 結構缺陷 = FAIL;並印各欄位誠實覆蓋率 |
| `node scripts/normalize-herb-categories.js [--apply]` | 分類亂掉時 | 只動 `category`:變體→正典、缺的從 `category_zh` 對映補上 |
| 原有 validator 牆 | 同前 | build-data / content-quality / content-junk / herb-canon / encoding |

## 4. 目前誠實基線(2026-07-25,normalize 後)

category 100% · functions_zh 98% · cautions_zh 98% · dosage 74% ·
modern_functions_zh 74% · properties 76% · **帶聲調拼音只有 57/266** ·
已源審核 57/266。缺口就是接下來批次的工作清單(照 board outline 分類順序)。

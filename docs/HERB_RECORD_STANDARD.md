# Herb Record Standard(中藥資料規範 — 機器可檢查)

Ting 2026-07-25:「感覺還不夠系統,請制定更規範,然後大家都可以遵照。」
這份是**唯一的中藥欄位規範**。它不是建議 — `scripts/validate-herb-standard.js`
會強制檢查,任何 AI 的中藥批次必須全綠才能 push。

檔案:`data/herbs/herb_canon_shortlist.json`(266 味)。
卡片版面與區塊順序定案於 **`docs/HERB_CARD_TEMPLATE.md`**(樣板:`herb.du_zhong`)。

## 1. 正典欄位(canonical fields)

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | string | `herb.<pinyin_snake>`,不可改不可刪 |
| `name_zh` / `name_en` / `pinyin` | string | 必填；`name_en` 是拼音旁的英文 common name，**不得放 pharmaceutical Latin**；pinyin **帶聲調**(Dù Zhòng,不是 Du Zhong)— 新填/改到的一律帶調 |
| `pharmaceutical_latin` | string | 必填；正式拉丁藥名，獨立顯示於標頭下一排，不得拿來取代 `name_en` |
| `category` | string | **必須**出自 `data/config/herb_category_canon.json` 的 `categories`;要新分類 → 先經 Claude 加進 canon,再用 |
| `properties_taste_temp` | string | 性味+溫度,如「辛、微苦、溫」 |
| `channels_zh` | array | 歸經,如 ["肺經","膀胱經"] |
| `functions_zh` | array | **只放傳統功效**(發汗解表…)。現代藥理絕不混進來 |
| `modern_functions_zh` | array | **只放現代藥理**(抗發炎…)；不設筆數上限，來源有幾則有效資料就完整保留 |
| `indications_zh` | array | 主治；不設筆數上限，不得把 8 則有區別的主治硬縮成 3–5 則 |
| `condition_tags_zh` / `condition_tags_en` | array | 病症標籤 **中英成對** |
| `modern_functions_en` | array | 現代藥理英文,與 `modern_functions_zh` **逐項對齊** |
| `cautions_en` | array | 注意事項英文,與 `cautions_zh` **逐項對齊** |
| `actions_en` | array | 英文功效;若要與 `functions_zh` 配對顯示則**長度必須相同**,否則卡片只顯示中文標籤 + 另列英文清單 |
| `dosage` | object | 有來源才填;**絕不編數字**。缺 = 留空 + 待補 |
| `contraindications_zh` / `_en` | array | **禁忌(絕對):禁用/忌服/不得服。必填,E7 擋** |
| `cautions_zh` / `_en` | array | 慎用(相對):慎服、注意、交互作用 |
| `safety_flags` | array | 安全旗標 |
| `related_formulas` | array | 方劑 id 連結 |
| `key_pairs` | array | 已有 `herb_pairs.json` 正式對藥時留空，避免遮住完整彩色卡；不得用簡版覆蓋正式對藥 |
| `source_citations` | array | 卡片底部實際顯示的來源；每筆含具名 `name`、可選 `url`、`scope` |
| `exact_source_url` / `safety_source_url` | string | 逐筆出處;curriculum 用 `curriculum/herbs/<file>#p<N>` |
| `review_status` | string | AI 只能寫 `"draft"`;`source_checked` 只由 Ting 的 RV1 流程升級 |

**數量規則：**3–5 條的濃縮目標只適用於傳統功效 `functions_zh`。
`indications_zh`、`modern_functions_zh` 與逐項對齊的 `modern_functions_en`
均不設上限。只有完全同義、沒有新增證型、症狀、用途、機制或研究資訊的重複項
可以合併；其餘全部保留並逐欄標註來源。

**中英標籤鐵則**:`_en` 陣列必須與對應 `_zh` **同長度、同順序**(index-aligned)。
長度不合 = validator E5 直接 FAIL —— 因為錯位會讓每個標籤都配到別人的英文
(Antigravity 之前的 Insomnia/Palpitations 錯位就是這樣來的)。寧可整個 `_en`
留空(卡片會只顯示中文),也不要半套錯位。

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

## 4.5 來源誠實鐵則(Ting 2026-07-25)

1. **卡片上不准出現沒有實際引用的來源名稱。** 曾經硬寫在版面上的
   「Bastyr Slide / NCBAHM 國考 / Chinese Medicine Atlas & NCCAOM actions」
   都是假標籤(內容其實來自課件或雲端中醫)—— 已全部移除。標題只能寫欄位是
   什麼,**來源一律由 `field_sources` / `source_urls` 渲染出來**。
2. **每個來源都要有名字**:不准再出現「Source 1」。URL 依網域顯示
   (雲端中醫 CloudTCM / American Dragon / Chinese Medicine Atlas),課件顯示
   「📘 課件 <檔名> p<頁>」。
3. `field_sources` 負責逐欄溯源，但外部 URL 不會自動全部顯示。凡實際核讀的
   CloudTCM、American Dragon、Chinese Medicine Atlas 或圖像來源，必須同步
   寫入具名 `source_citations`（或至少 `source_urls`）；未核讀不得列名。
4. 考試相關敘述(exam_importance / exam_pearl)必須寫**依據哪一版大綱**;
   現行為 **NCBAHM 2026**，不得再寫成 NCCAOM。

## 4.6 對藥完整卡規則(Ting 2026-07-26)

1. 正式對藥寫入 `data/herbs/herb_pairs.json`，不是只塞一段 `key_pairs` 理由。
2. 每筆必填：`relation`（相須／相使等）、`pair_meaning_zh/_en`、
   `indication_zh/_en`、`caution_zh/_en`、`sources`。
3. 主治與注意保留為獨立欄位，讓卡片以不同顏色顯示；不得合併進配伍理由。
4. 若該藥已有正式 pair records，單味藥記錄的 `key_pairs` 留空，讓渲染器使用
   完整彩色卡；否則簡略卡會遮住主治、注意與七情關係。
5. `exam_importance` / `exam_pearl` 照常保留，但不能取代對藥主治與注意。
6. 對藥筆數以實際來源為準，沒有「每味只留一則」的限制。必須檢查課件
   pairing / major combinations、NCBAHM 對藥及已核讀的專業來源；有幾組重要、
   可溯源的對藥就建立幾筆，不得只取第一組或把不同配伍合併。
7. A+B 與 B+A 是同一筆正式 pair record，避免反向重複；渲染器會讓它同時出現
   在 A、B 兩味藥卡。只有來源確實只支持一組時，卡片才只有一則。

## 5. 待補的深度層(next passes)

- **毒性/交互作用**:CloudTCM 與 American Dragon 都有更深的 toxicity、
  herb–drug interaction 資料,需有瀏覽能力的 agent 對照後填入
  (`safety_review_pending` 欄位標記,樣板見 `herb.du_zhong`)。
- **中英標籤補齊**:目前 `modern_functions_en` 缺 195 筆、`condition_tags_en`
  缺 171 筆、`cautions_en` 缺 261 筆 —— 這是接下來批次的明確工作量。
- **帶聲調拼音**:208 筆待補。

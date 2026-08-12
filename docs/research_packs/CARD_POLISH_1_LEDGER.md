# CARD_POLISH_1 — 跨線卡片品質修整帳本

Branch `codex/card-polish-1`（自 `origin/codex/pattern-v2` @ `aa170b9`）。
範圍：**品質修整，不是內容補寫**。抽樣逐筆讀，機械掃描輔助定位。
原則：只加深不刪除；有疑慮就記帳不動手；ZERO 虛構內容。

---

## 0. 抽樣方法（可重現）

種子 `20260811`，PRNG = mulberry32。做法：取該線全部 `id` → 字串升冪排序 →
用種子化 Fisher–Yates 洗牌 → 取前 15 筆。同一份腳本重跑必得同一組 id。

| 線 | 檔案 | 母體 | 抽樣 |
|---|---|---|---|
| cond | `data/pathology/condition_canon_shortlist.json` | 505 | 15 |
| tdis | `data/pathology/tdis_registry.json` | 159 | 15 |
| pattern | `data/pathology/pattern_library.json` | 154 | 15 |
| sym | `data/symptoms/symptoms.json` | 102 | 15 |
| herb | `data/herbs/herb_canon_shortlist.json` | 358 | 15 |
| formula | `data/herbs/formulas.json` | 224 | 15 |
| supp | `data/supplements/supplements.json` | 36 | 15 |
| drug | `data/pharmacology/drugs.json` | 40 | 15 |

母體數與派工單完全一致（505/159/154/102/358/224/36/40）。

---

## 1. 已修（逐筆）

### herb（herb_canon_shortlist.json）

| # | id | 欄位 | before → after | 為何無歧義 |
|---|---|---|---|---|
| 1 | `herb.xi_xin` | `modern_functions_detail_zh[3].analysis_zh` | `…影響免疫細胞的活性，**从而减轻炎症反应。**` → `…活性，**從而減輕炎症反應。**` | 全段其餘 100% 正體（「炎症反應」在同段前文已出現正體寫法）；僅末句整句掉回簡體，屬生成漂移，字對字轉換，語意零變動 |
| 2 | `herb.shu_di_huang` | `modern_functions_detail_zh[6].analysis_zh` | `…可能有助于增強紅細胞的**清**免疫複合物的功能，从而辅助免疫调节。` → `…有助於增強紅細胞的**清除**免疫複合物的功能，從而輔助免疫調節。` | 同一段落上一行的項目標題即為「**清除免疫複合物：**」，同句又寫「參與清除循環中的免疫複合物」——脫字為「除」無第二種讀法。其餘為簡→正字對字 |
| 3 | `herb.shu_di_huang` | 同上（末句） | `总而言之，…增强細胞免疫功能…在整体上对免疫系统发挥一定的调节作用。` → `總而言之，…增強細胞免疫功能…在整體上對免疫系統發揮一定的調節作用。` | 同 #1，整句簡體尾巴，字對字 |
| 4 | `herb.huang_qin` | `clinical_use_note` **與** `chinese_depth_track.summary_zh`（2 處同字串） | `…清熱涼血,安胎**,,**降血糖,…` → `…安胎**,**降血糖,…` | 逗號重複，是串接時的空項；刪一個分隔符不動任何詞條 |

### formula（formulas.json）

| # | id | 欄位 | before → after | 為何無歧義 |
|---|---|---|---|---|
| 5 | `formula.dan_shen_yin` | `name_zh` | `丹参饮` → `丹參飲` | 全 `data/` 內 `丹參` 661 次 vs `丹参` 3 次，其餘 2 次都在 `data/imports/cloudtcm/`（未整理的原始簡體匯入，非本線）。此為 curated 資料中唯一一筆，明確離群 |
| 6 | `formula.zhen_ren_yang_zang_tang` | `composition[5].name_zh` | `Zhi Ying Su Ke` → `炙罌粟殼` | 同一物件的 `herb_zh` 已是 `炙罌粟殼`，`pinyin`/`pinyin_toned` 另存拼音（無資訊損失）；同檔其他 composition 皆 `name_zh == herb_zh`（如 `制附子`、`厚朴`）。**注意：這是 133 筆同類問題中唯一「同筆內已有正確中文可回填」者**，其餘見 §3.1 |

### sym（symptoms.json）

| # | id | 欄位 | before → after | 為何無歧義 |
|---|---|---|---|---|
| 7 | `sym.knee_pain` | `aliases_en[2]`（對應 `aliases_zh[2]` = `膝軟`） | `Knee ache` → `Knee weakness` | `_zh` 為準：`軟` 是「痠軟無力」不是「痛」。本 repo 既有慣例把 `軟` 譯為 weak（`腰膝痠軟` → `Aching, weak lower back and knees`／`sore weak low back and knees`）。且同陣列 `膝蓋痛` 已譯 `Sore knee`，原譯讓兩條別名同義並丟失「無力」語意 |

修改後 `git diff --stat`：`formulas.json` 4 ++--、`herb_canon_shortlist.json` 8 ++--、
`symptoms.json` 2 ++--、`knowledge_data.js`（build 產出）。無任何欄位被清空或變短
（唯二字元減少來自重複逗號；#2 反而 +1 字「除」）。

---

## 2. 掃描到但**判定為誤報、刻意不動**（避免把對的改錯）

這節同等重要——機械掃描會把下列正確內容標成缺陷，若照改就是製造損害。

| 樣態 | 實例 | 為何不動 |
|---|---|---|
| `厚朴` → 誤判 `厚樸` | `formula.san_ren_tang` `composition[2]`、`formula.hou_po_wen_zhong_tang` `name_zh` | `朴`(pò) 在「厚朴」是正字，`樸` 是另一字。全 `data/` `厚朴` 2672 vs `厚樸` 16——**反而那 16 筆過度轉換才是錯的**（見 §3.4） |
| `跌仆`/`暈仆` → 誤判 `僕` | `tdis.xuan_yun` `definition_zh`、`tdis.yao_tong` `etiology_zh`/`pathomechanism_zh` | `仆`(pū，仆倒) 與 `僕`(pú，僕人) 是不同字，此處正確 |
| 希臘字母 → 誤判 OCR 混種字 | `herb.huang_qin`/`xi_xin`/`xuan_shen`/`yin_chen_hao`/`ai_ye` 共 9 處：`NF-κB`、`TNF-α`、`IL-6`、`β細胞`、`γ` | 全部是正規科學符號，非 `головache` 類污染。本次抽樣**未發現任何真正的西里爾/希臘混種字** |
| `_en` 內含中文 → 誤判 | `tdis.luo_zhen` `definition_en` `Stiff Neck (落枕) refers to…`、`tdis.tai_wei_bu_zheng`、`tdis.jing_duan_qian_hou`、`pattern.phlegm_qi_binding` `mechanism_en`（梅核氣） | 括號內中文病名是刻意的雙語對照，不是污染 |
| `_en` 內含中文（來源欄） | formula 13 處 `field_sources.*_en[0]`，如 `curriculum/formulas/06_…_祛濕劑.md` | 是**真實檔名/引用路徑**，改了就指不到檔案 |
| Markdown `**` | herb `modern_functions_detail_zh[].analysis_zh` 大量、`drug.enoxaparin` `acupuncture_note_zh` | 長文欄位刻意用 markdown 排版，屬設計 |

---

## 3. 只記帳、**不動手**（系統性問題，超出 15 筆抽樣的修整範圍）

### 3.1 composition `name_zh` 存羅馬拼音而非中文 — formula 線 133/1810（7.3%）

`formulas.json` 內 `"name_zh"` 共 1810 筆，其中 133 筆值為純拉丁拼音。
高頻者：`Xi Jiao`×6、`Pao Jiang`×5、`Geng Mi`×5、`Jin Bo`×3、`Dang Gui Wei`×3、
`Chao Shan Yao`×3、`Chao Huang Qin`×3、`Chao Bai Shao`×3。

**關鍵差別**：這 133 筆裡絕大多數連 `herb_zh` 也是拼音（例：`herb.xi_jiao` 的
`herb_zh` 與 `name_zh` 同為 `Xi Jiao`），**筆內沒有中文可回填**，補中文＝虛構，
故一律不動。只有 `zhen_ren_yang_zang_tang` `composition[5]` 的 `herb_zh` 存有
`炙罌粟殼`，才在 §1 #6 修掉。**建議 Ting/Fable 開一條專線處理其餘 132 筆。**

### 3.2 `_zh`/`_en` 陣列長度不等 — 憲法紅線 5，formula 31 處 / herb 4 處（僅抽樣內）

憲法：「`_en` 陣列長度必須等於 `_zh`，否則整個留空。」
**修這個只有兩條路：刪 `_en` 多出來的項（＝刪除）或補 `_zh`（＝虛構）——兩條都違規，
故全部不動、交 Ting 裁決。**

formula（31）：
- `gui_zhi_tang`：`contraindications` 3/4、`cautions` 1/4、`symptoms` 9/8、`field_sources.pattern_indications` 1/2、`field_sources.modifications` 2/1、`field_sources.contraindications` 2/1
- `xie_xin_tang`：`actions` 3/4、`pattern_indications` 3/4
- `xiao_jian_zhong_tang`：`contraindications` 1/3、`cautions` 1/3
- `huang_qi_jian_zhong_tang`：`pattern_indications` 1/4、`cautions` 1/3、`contraindications` 1/3
- `zhen_ren_yang_zang_tang`：`contraindications` 2/6、`cautions` 2/6
- `san_ren_tang`：`contraindications` 3/1、`cautions` 0/1
- `bai_du_san`：`pattern_indications` 1/3、`contraindications` 4/5、`cautions` 4/5
- `wu_mei_wan`：`pattern_indications` 1/4、`contraindications` 1/3、`cautions` 1/3
- `dan_shen_yin`：`contraindications` 1/2、`cautions` 1/2
- `xie_huang_san`：`contraindications` 0/2、`cautions` 0/2
- `jing_fang_bai_du_san`：`cautions` 0/1
- `hou_po_wen_zhong_tang`：`cautions` 0/1
- `fu_yuan_huo_xue_tang_import_stub`：`cautions` 1/5、`contraindications` 1/5

herb（4）：`chuan_wu` `aliases` 4/3、`chuan_wu` `field_sources.indications` 3/2、
`bai_qian` `aliases` 3/2、`lian_xu` `aliases` 4/1。

**注意集中在 `contraindications` / `cautions`——是安全欄位，`_zh` 比 `_en` 短代表
中文使用者看到的禁忌比英文少。**

### 3.3 樣板句（憲法紅線 6）— 依派工單只標記不批改

herb 線（最嚴重，數字為全線筆數）：
- `english_exam_track.common_pairings[]`：`Pairings depend on formula context; verify against Bensky before source_checked.` — **147 筆**
- `english_exam_track.indications[]`：`Pattern documentation context only; verify against Bensky before source_checked.` — **127 筆**
- `english_exam_track.contraindications[]`：`Review pregnancy review before clinical use.` — **125 筆**（且句子本身語法壞掉：`Review … review`；又是禁忌欄）
- `english_exam_track.properties_taste_temp`：`Mostly bitter/sweet/cold depending on herb. Draft pending Bensky verification.` — **23 筆**。**這句不只是佔位，是錯的內容**：把「隨藥而異」當成事實敘述蓋在 23 味不同的藥上
- `name_header_note_zh`：`中文/拼音旁為 common name；下一行拉丁藥名。` — 77 筆（UI 說明，可能屬刻意）

formula 線：
- `ba_fa_zh`：`No single Ba Fa assigned mechanically; use the formula-specific actions/pattern and course chapter framing.` — **96 筆。這是英文句子塞在 `_zh` 欄位，直接違反憲法紅線 5（「`_zh` 欄位裡不准出現英文句子」）**
- `composition[].actions_zh`：`清熱解毒，祛痰止咳，緩急止痛，調和諸藥。` — 51 筆（同為甘草，重複可能合理，僅列出）
- `exam_importance`：`★ NCBAHM 2026 CH 考綱 Appendix C…` — 169 筆（考綱標籤，研判刻意）

cond / tdis 線：`red_flags_en[].recommended_action` 高度重複——
cond：`Immediate emergency care` 55、`Immediate emergency evaluation` 22、`Refer for evaluation` 16、`Immediate medical evaluation` 12；
tdis：`Seek prompt medical evaluation` 24、`Recommend medical evaluation` 18、`Seek emergency care immediately` 8。
研判屬**受控詞彙**而非樣板句，但四種說法語意重疊（`Immediate emergency care` vs
`Immediate emergency evaluation` vs `Immediate medical evaluation`），建議收斂成固定枚舉。

sym 線：`clinical_attributes.quality.why`：`symptom_quality 為疼痛性質詞彙，不適用` — 31 筆（結構性說明，研判刻意）。

### 3.4 正／簡體慣例在各線不一致 — 需要 Ting 的專案級裁決，本次不碰

以 `data/**.json` 全域計數：

| 字對 | 計數 | 判讀 |
|---|---|---|
| `痹` vs `痺` | **4130 vs 2457** | 兩者都大量存在，`痹` 反而是多數。**不是離群錯字，是慣例未統一**，不可單改抽樣那幾筆 |
| `疱` vs `皰` | **214 vs 232** | 近 50/50 分裂，同上 |
| `厚朴` vs `厚樸` | 2672 vs 16 | `厚朴` 正確；那 **16 筆 `厚樸` 是過度簡→正轉換造成的錯字**，建議另開單清掉 |
| `丹參` vs `丹参` | 661 vs 3 | 明確離群，已修 curated 那 1 筆（§1 #5） |

### 3.5 中文夾半形標點 `,` `;` `:` — 各線慣例不同，只有離群線值得修

CJK 字元之間的半形 vs 全形標點計數：

| 線 | 半形 | 全形 | 半形占比 |
|---|---|---|---|
| sym | 0 | 2327 | 0.0% |
| cond | 38 | 13148 | 0.3% |
| formula | 162 | 12745 | 1.3% |
| tdis | 111 | 1609 | 6.5% |
| herb | 5005 | 31042 | 13.9% |
| **pattern** | **1500** | 1072 | **58.3%** |
| **drug** | **272** | 178 | **60.4%** |
| **supp** | **6** | 0 | **100%** |

pattern / drug / supp 是**以半形為主的自有慣例**，不是缺陷，不可「修正」；
cond / sym / formula / tdis 的半形才是離群。但即使離群線，逐筆改動仍是全線工程
（例：`tdis.yao_tong` `pathomechanism_zh` 一句內同時有全形 `、` 與半形 `;` `,`），
超出 15 筆抽樣範圍，**本次不動，列給 Ting 決定要不要開正規化單**。

### 3.6 同一 `_zh` 對到四種不同 `_en` — pattern 線 `pulse_en`

`pulse_zh` 為 `脈弦滑數` 的三筆記錄，英譯各不相同：

| id | `pulse_en` |
|---|---|
| `pattern.liver_gallbladder_damp_heat`（抽樣內） | `Wiry, rapid or slippery, rapid pulse` |
| （line 6755） | `Wiry, slippery, and rapid pulse` |
| （line 14635） | `Wiry-slippery-rapid pulse` |

全線另有 `Wiry or slippery, rapid pulse`、`Wiry rapid or slippery rapid pulse`、
`Wiry-slippery pulse` 等寫法。抽樣那筆的 `rapid` 出現兩次又多一個 `or`，
最不貼合 `弦滑數`（弦=wiry、滑=slippery、數=rapid 三個並列）。

**但沒有改**：`弦滑數` 是否可讀作「弦數 或 滑數」需要原始教材佐證，
且這是全線 `pulse_en` 用語統一的問題（六種寫法），改一筆只會讓不一致更難追。
建議另開一張 `pulse_en` 正規化單，一次收斂。

### 3.7 `dosage` 欄位存的是「JSON 字串」而非物件 — herb 線

`herb.huang_qin` / `xuan_shen` / `yin_chen_hao` / `ai_ye` / `shu_di_huang` /
`mai_men_dong` 的 `dosage` 是一個**字串**，內容為縮排過的 JSON 文字：
`"{\n  \"一般建議\": \"3-10克\",\n  \"食療用量範圍\": …}"`。
屬資料形狀問題（不是文字髒污），改動會牽動讀取端，不在修整範圍。

---

## 4. ⚠ 安全相關 — 不修，請 Ting / Fable 判讀

### 4.1【最高優先】`formula.zhen_ren_yang_zang_tang` `composition[5]` 炙罌粟殼 劑量 `6-108g`

```
"herb_zh": "炙罌粟殼",  "herb_en": "Per. Papaveris",
"dose_g": "6-108g",     "decoction_reference_g": "6-108g",
"herb_id": "",
```

**罌粟殼（鴉片罌粟果殼，含嗎啡類生物鹼）標為上限 108 g。** 常用文獻劑量在
個位數克級。`6-108g` 形狀像解析錯誤（例如 `6-10.8g` 被吃掉小數點，或兩個
範圍被串接）。依憲法紅線 4「劑量絕不虛構數字，必須具名來源」，**我不推測、不改**，
但這個數字若被前端直接顯示給學生／臨床使用者，風險很高。**請優先處置。**

附帶：同筆 `herb_id` 為空字串（其他成分如 `制附子` 有 `herb.fu_zi`），
中藥庫連結斷開——與 formula 驗證器基線的 F12 類缺陷同源。

### 4.2 `formula.zhen_ren_yang_zang_tang` `composition[5]` 中文功效欄內容遺失〔字損〕

```
"in_formula_zh": "斂肺澀腸，止痛。"          ← 完整
"actions_zh":    "緩急止痛， **，**。"        ← 損壞
"role_reason_zh":"緩急止痛， **，**。"        ← 損壞
"actions_en":    "Astringes intestines, stabilizes Lower Jiao and relieves pain.
                  **Obsolete/restricted substance in modern practice.**"
```

`**，**` 是 markdown 粗體標記留著、**中間內容被清空**。英文版保有
「**Obsolete/restricted substance in modern practice**（現代已廢用／受管制）」
這句警語，**中文版完全看不到**——這是中文使用者少掉一條管制物質警示。
內容無法從上下文唯一還原（`in_formula_zh` 只涵蓋部分語意），依規則
**標記〔字損〕、不臆補**。

### 4.3 `_zh` 安全欄位普遍短於 `_en`

見 §3.2：`contraindications_zh` / `cautions_zh` 在多筆 formula 短於英文版
（如 `zhen_ren_yang_zang_tang` 2 vs 6、`fu_yuan_huo_xue_tang_import_stub` 1 vs 5、
`wu_mei_wan` 1 vs 3、`xie_huang_san` 0 vs 2）。
**中文使用者看到的禁忌／注意事項比英文使用者少**，這是系統性的安全落差，非單筆問題。

### 4.4 `drug.mannitol` — 來源標籤不是同一個臨床角色（記錄本身已自陳）

`gap_note_zh` 自己寫著：

> ⚠️ 來源不對藥:本筆記錄的 setid 5b44e248… 是「Sorbitol-Mannitol 泌尿科灌洗液」標籤,
> 標籤首行即為「NOT FOR INJECTION BY USUAL PARENTERAL ROUTES / FOR UROLOGIC
> IRRIGATION ONLY」,且含 sorbitol 為共同成分。這與本卡要教的靜脈滲透性利尿劑
> (腦水腫、眼壓)不是同一個臨床角色

**記錄誠實揭露了這件事，這是好的做法**，但缺陷仍然存在：這張卡教的是靜脈用滲透性
利尿劑（降腦壓／眼壓），引用的卻是**明文禁止注射**的泌尿科灌洗液標籤。
不屬文字髒污，不在修整範圍，但請 Ting/Fable 排入換源。

### 4.5 `herb.chuan_wu`（制川烏）— 內容正確，僅記錄以便複查

安全敘述完整且謹慎（炮製、先煎、孕禁、陰虛/熱痛禁、心律不整風險、十八反具名列出
半夏／瓜蔞／貝母／白及／白蘞）。**無需修改**，列此僅因該藥高毒性、值得 Ting 複驗。

### 4.6 `drug.enoxaparin` `acupuncture_note_zh` — 內容正確，值得保留為範例

該註記明確區分「標籤講的是硬膜外／脊椎穿刺，**不是針灸**」，並寫
「標籤未給任何針灸門檻，不要自行推導一個」。**完全符合憲法紅線 9（不把不確定寫成確定）**，
是全樣本中安全寫作品質最好的一筆。不動。

---

## 5. 逐線判讀

| 線 | 抽樣 | 已修 | 記帳未修 | 逐筆讀後判讀 |
|---|---|---|---|---|
| cond | 15/505 | 0 | 2 類 | 未見假中文／亂碼／簡體。`latin_in_zh` 43 處全屬來源引用與 ICD 代碼，非違規。`red_flags_en[].recommended_action` 四種說法語意重疊（§3.3） |
| tdis | 15/159 | 0 | 2 類 | 品質高。`definition_en` 用 `Xuan Yun (眩暈) is…` 雙語對照為刻意設計。`跌仆`/`暈仆` 用字正確。僅半形標點離群（§3.5） |
| pattern | 15/154 | 0 | 2 類 | `_zh`/`_en` 忠實、陣列齊長、機轉敘述紮實。唯 `pulse_en` 全線用語分歧（§3.6）。半形標點為該線自有慣例（58.3%），非缺陷 |
| sym | 15/102 | **1** | 1 類 | 品質最高的一線。`definition_zh` 會主動寫「是主訴而非診斷」，紅旗臨床正確。僅 `膝軟` 一處誤譯（已修） |
| herb | 15/358 | **4** | 5 類 | 長文 `analysis_zh` 有簡體尾巴（已修 2 筆）。最大問題是 `english_exam_track` 樣板句 147/127/125/23 筆（§3.3） |
| formula | 15/224 | **2** | 5 類 | 問題最集中：`_zh`/`_en` 陣列不等 31 處、`ba_fa_zh` 英文句 96 筆、`name_zh` 存拼音 133 筆、罌粟殼卡兩項安全問題（§4.1／§4.2） |
| supp | 15/36 | 0 | 0 | **本次唯一零缺陷的線。** `maturity: skeleton` 誠實標示，`insufficient_data` 與 `no_specific_flag_in_source` 分得很清楚；`supp.lutein` 甚至記錄了「原引用是目錄索引頁、未真正查到一手來源，故降級」——示範級的來源紀律 |
| drug | 15/40 | 0 | 2 類 | 內容品質好，`latin_in_zh` 33 處全是藥名／口訣／基因型（`HLA-B*1502`），非違規。`gap_note_zh` 會自陳缺口。唯 `mannitol` 來源不對藥（§4.4） |

合計：**抽樣 120 筆，修 7 筆，記帳未修 12 類**（其中 6 項安全相關）。

## 6. 抽樣 id 清單（供重跑核對）

- **cond**：pertussis, adenomyosis, neurogenic_bladder, superficial_thrombophlebitis, trichotillomania, chronic_bronchitis, valvular_heart_disease, primary_biliary_cholangitis, mitral_regurgitation, lichen_planus, pulmonary_hypertension, laryngopharyngeal_reflux, testicular_torsion, ibs, chronic_open_angle_glaucoma
- **tdis**：li_ji, luo_zhen, ji_zhi, jing_duan_qian_hou, tai_wei_bu_zheng, xuan_yun, xiao_ke, e_kou_chuang, zhong_shu, yin_yang, jing_xing_xie_xie, dong_chuang, yao_tong, luo_li, shi_wen
- **pattern**：liver_gallbladder_damp_heat, bladder_deficiency_cold, wei_stage_wind_heat, kidney_yin_deficiency, warm_dryness_attacking_lung, shao_yin_heat_transformation, stomach_qi_deficiency, phlegm_misting_heart, blood_deficiency_wind_dryness, fatigue_lin, heart_lung_qi_deficiency, heart_gallbladder_qi_deficiency, phlegm_qi_binding, qi_lin_excess, blood_stasis
- **sym**：knee_pain, abdominal_pain, intermenstrual_bleeding, hiccup, wheezing, cold_sweating, dry_mouth, weakness, sore_throat, nocturia, regurgitation, bradykinesia, globus_sensation, palpitations, heat_intolerance
- **herb**：hu_jiao, chuan_xin_lian, qing_mu_xiang, huang_qin, wu_yao, shu_di_huang, mai_men_dong, bai_qian, lian_xu, xuan_shen, xi_xin, chuan_wu, ai_ye, zhu_ji_sui, yin_chen_hao
- **formula**：huang_qi_jian_zhong_tang, xie_huang_san, gui_zhi_tang, san_ren_tang, wu_mei_wan, xiao_jian_zhong_tang, hou_po_wen_zhong_tang, fu_yuan_huo_xue_tang_import_stub, bai_du_san, dan_shen_yin, shou_tai_wan, zhen_ren_yang_zang_tang, jing_fang_bai_du_san, xie_xin_tang, run_chang_wan
- **supp**：lutein, nac, echinacea, glutathione, creatine, coq10, nr, ashwagandha, glucosamine, folate, chondroitin, nmn, curcumin, green_tea_extract, b_complex
- **drug**：lisinopril, atorvastatin, enoxaparin, semaglutide, hydrochlorothiazide, carvedilol, mannitol, carbidopa_levodopa, acetazolamide, carbamazepine, propranolol, furosemide, ethosuximide, phenytoin, atropine

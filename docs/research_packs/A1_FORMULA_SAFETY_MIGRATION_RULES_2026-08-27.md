# A1 FORMULA SAFETY MIGRATION RULES — 163 張 duplicated safety fields 遷移規則

**Date:** 2026-08-27  
**Status:** NOT CANONICAL · NO PHI · MACHINE-EXECUTABLE RULE SPEC  
**Target defect:** formula cards where `contraindications_en` and `cautions_en` are byte-identical or semantically duplicated.

---

# 1. 核心策略

對 duplicated pair，不相信「原欄位位置」；只相信：

1. 原句本身是否有明確方向詞；
2. 該方向是否有可追溯來源；
3. 方向是否能以 controlled vocabulary 無損表示；
4. 中英文是否一致；
5. source scope 是否被保留。

**沒有方向詞不猜；沒有來源不寫 canonical；方向衝突不硬分。**

---

# 2. Machine pipeline

```text
INPUT card
  ↓
normalize arrays without changing raw text
  ↓
detect exact duplicated contra/caution items
  ↓
segment only at strong boundaries (array item / bullet / sentence / explicit semicolon)
  ↓
for each segment:
    detect negation/uncertainty first
    detect hard-prohibition patterns
    detect caution/conditional patterns
    detect mixed-direction patterns
    detect provenance + source scope
  ↓
classify:
    contraindications | cautions | needs_review
  ↓
run bilingual parity check
  ↓
run provenance gate
  ↓
canonical-write only if all gates pass
```

---

# 3. Preprocessing rules

## 3.1 Preserve raw

永遠保留：

- `raw_text`
- `raw_field`
- `raw_index`
- `card_id`

Normalization 只供比對，不回寫原文：

- Unicode normalization；
- trim leading/trailing whitespace；
- collapse repeated spaces；
- English lowercasing only for classifier；
- 不移除否定詞；
- 不把 `avoid`、`not recommended` 等改寫成其他方向。

## 3.2 Segmentation

可以自動切：

- 原本不同 array item；
- bullets/newlines；
- `。` / `.` 在明確句尾；
- `；` / `;` 只有在兩側皆像完整 safety clause 時。

不得只因 comma / `、` 就切，避免把「對象＋條件＋理由」拆碎。

---

# 4. 判定優先序

classifier 優先序固定：

1. `negated_or_uncertain_direction`
2. `mixed_direction_or_context`
3. `regulatory_nonclinical_context`
4. `ambiguous_direction`
5. `hard_prohibition`
6. `conditional_caution`
7. `no_direction_token`

否定／不確定與不可安全拆分的 mixed context 直接 `needs_review`；純 regulatory context 必須先於一般 `prohibited` hard-match 判定，避免把禁賽規則誤做臨床禁忌；ambiguous avoidance 也不得落入 hard-match。

---

# 5. 自動歸入 contraindications 的條件

只有以下全部成立才 auto-classify：

1. segment 命中 hard-prohibition controlled phrase；
2. 沒命中 negation / uncertainty；
3. 沒同時命中 caution direction；
4. target state 可被抽出或至少能保留原句；
5. 若要 canonical write，另須通過 provenance gate。

### 允許自動 hard-match 的英文

- `contraindicated in`
- `is contraindicated`
- `are contraindicated`
- `do not use`
- `must not be used`
- `must not use`
- `prohibited`（但 regulatory/anti-doping context 先分流）
- `must not be combined with`
- `must not exceed`
- `do not exceed`

### 允許自動 hard-match 的中文

- `禁用`
- `忌用`
- `不得使用`
- `不可使用`
- `嚴禁`
- `禁服`
- `禁止與…同用`
- `禁止配伍`
- `不得超過`
- `不可超過`

### 不列入 auto hard-match

- `should not be used`
- `不宜使用`
- `應避免`
- `最好避免`

原因：這些語句在來源中可能是強建議、也可能是近似禁止，機器不應替來源升級。

---

# 6. 自動歸入 cautions 的條件

命中下列 controlled phrases，且沒有 hard/negation/mixed 問題：

### English

- `use with caution`
- `use caution`
- `caution is advised`
- `requires monitoring`
- `monitor closely`
- `requires dose adjustment`
- `dose reduction`
- `avoid high-dose use`
- `avoid prolonged use`
- `short-term use only`
- `use only under ... supervision`
- `risk-benefit assessment`
- `benefit outweighs risk`
- `requires ... processing before use`
- `requires ... preparation before use`
- `not recommended`
- `avoid unless`
- `athlete restriction`
- `anti-doping`
- `regulatory restriction`

### 中文

- `慎用`
- `慎服`
- `宜慎`
- `謹慎使用`
- `需監測`
- `密切監測`
- `需調整劑量`
- `減量`
- `避免大劑量`
- `不宜大劑量`
- `不宜久服`
- `避免久服`
- `短期使用`
- `需專業人員評估`
- `需醫師指導`
- `指導下使用`
- `需權衡風險效益`
- `效益大於風險`
- `需炮製後使用`
- `需按規定炮製`
- `需先煎`
- `不建議`
- `應避免，除非`
- `運動員限制`
- `禁賽`
- `法規限制`

---

# 7. `needs_review` 觸發表

| review_reason | 機器條件 | 不可做的事 |
|---|---|---|
| `no_direction_token` | 有風險描述但無 controlled direction | 不根據疾病、毒性或模型常識猜方向 |
| `mixed_direction_tokens` | 同一不可安全拆分 segment 同時有 hard + caution | 不以「較嚴重者優先」自動蓋掉另一方向 |
| `negated_direction` | `not contraindicated`、`no contraindication`、`非禁用` 等 | 不因看見字根 contraindicat/禁 就誤歸禁用 |
| `uncertain_direction` | `contraindications unknown`、`禁忌不明` 等 | 不生成任何安全方向 |
| `ambiguous_avoidance` | `should not use`、`不宜使用`、`應避免` 且無更明確詞 | 不自動升級成 contraindication |
| `missing_provenance` | 找不到逐條支持方向的 source_ref/locator | 不 canonical write |
| `source_scope_unclear` | 來源談 ingredient/component，但文字像 formula-level | 不升格整方 |
| `cross_language_direction_conflict` | zh/en 對應 assertion direction_id 不同 | 不各自寫入不同安全欄 |
| `conditional_threshold_unbound` | `high dose/long term/above limit` 但 threshold/條件無法保留 | 不改成「此方禁用」 |
| `canonical_relation_unresolved` | 十八反/十九畏文字提到配伍，但 relation ref 對不上 | 不手抄成新的 canonical 事實 |
| `regulatory_vs_clinical_mixed` | 一句把禁賽與臨床禁忌混在一起 | 不把法規限制渲染成 patient contraindication |

---

# 8. 163 張 duplicated pair 的具體決策表

對每張卡的每個 duplicated segment：

| Legacy text state | Action | Target |
|---|---|---|
| 明確 hard token，無 conflict | 去重，只留一份 | `contraindications_*` staging |
| 明確 caution token，無 conflict | 去重，只留一份 | `cautions_*` staging |
| hard + caution 可安全切成兩個完整句 | 句級拆分，各自保留 raw offsets | 各自對應欄 |
| hard + caution 混在同一句、無法安全切 | 不分 | `needs_review` |
| 無方向詞 | 不分 | `needs_review` |
| `avoid / should not / 不宜 / 應避免`，無更明確來源語意 | 不升級 | `needs_review` 或 controlled caution（只有詞彙表明確覆蓋的句式才 auto） |
| 方向明確但無逐條來源 | 可產生 migration staging record，但 `canonical_write_eligible=false` | `needs_review: missing_provenance` |
| zh/en 方向不同 | 不互相翻譯補救 | `needs_review` |
| ingredient-derived 警告寫成「本方禁用」 | 保留警告方向但降回 ingredient scope，需 source-backed rewrite | `needs_review` 直到 scope 修正 |
| canonical incompatibility relation 可解析 | 生成 UI projection/ref，不複製 canonical pair text | 由 relation direction 決定顯示欄 |

### 關鍵：duplicated pair 不以 legacy field name 決勝

如果相同英文同時存在於 `contraindications_en` 與 `cautions_en`：

- 不因為它曾出現在 `contraindications_en` 就判禁用；
- 不因為它也在 `cautions_en` 就判慎用；
- 只看 text direction + source；
- 去重本身不是「方向升級」，但**若原句沒有明確方向，禁止利用欄位位置補方向**。

---

# 9. Provenance gate

`direction_classifiable = true` 不等於 `canonical_write_eligible = true`。

canonical write 必須同時滿足：

```text
controlled direction recognized
AND source_ref exists
AND source_locator supports the direction
AND source_level valid
AND subject_scope consistent with source_level
AND bilingual parity passes (if both languages are emitted)
AND no unresolved canonical_relation issue
```

不滿足者只能留 research staging / review queue。

---

# 10. 邊界案例 migration 裁法

## 10.1 十八反／十九畏

- 先解析 structured relation；
- 可解析：文字只是 UI projection，帶 `canonical_relation_ref`，方向繼承 relation；
- 不可解析：`needs_review: canonical_relation_unresolved`；
- 不從 legacy sentence 重新創造 pair。

## 10.2 孕婦

- `contraindicated in pregnancy` / `孕婦禁用` → contraindications；
- `use with caution in pregnancy` / `孕婦慎用` → cautions；
- `not recommended during pregnancy` / `孕期不建議` → cautions；
- `pregnancy safety not established` 若沒有使用方向 → needs_review；
- 不因 target_state 是 pregnancy 就自動提高嚴重度。

## 10.3 大劑量／久服

- `avoid prolonged use` / `不宜久服` → cautions；
- `do not exceed X` → `exposure_limit_prohibited`，hard direction 只作用於 `exposure > X`；
- `long-term toxicity has been reported` 但無方向 → needs_review。

## 10.4 炮製

- `requires processing before use` → cautions；
- `unprocessed form must not be used` → contraindications，target_state=unprocessed form。

## 10.5 運動員／法規

- anti-doping / restricted competition use / regulatory restriction → cautions；
- 必須標 `reason_type=regulatory_nonclinical`；
- 不可用 clinical contraindication 詞彙渲染。

---

# 11. 建議輸出欄位

每個 migration staging record：

```json
{
  "card_id": "formula.example",
  "language": "en",
  "raw_field": "contraindications_en|cautions_en",
  "raw_index": 0,
  "raw_text": "...",
  "normalized_text": "...",
  "classification": "contraindications|cautions|needs_review",
  "direction_id": "...|null",
  "target_state": "...|null",
  "reason": "...|null",
  "source_level": "formula-specific|ingredient-derived|modern-component|null",
  "subject_scope": "formula|ingredient|component|null",
  "subject_ref": "...|null",
  "source_ref": "...|null",
  "source_locator": "...|null",
  "canonical_relation_ref": "...|null",
  "canonical_write_eligible": false,
  "review_reasons": []
}
```

---

# 12. Negative rules

以下行為一律禁止：

1. 看見「孕婦」→ 自動禁用。
2. 看見「肝腎衰竭」→ 自動禁用。
3. 看見 `avoid` → 翻成「禁用」。
4. 看見 `不宜` → 翻成 `contraindicated`。
5. ingredient/component 警告 → 改寫成整方禁忌。
6. 十八反／十九畏文字 → 重新建立一份 pair truth。
7. legacy 欄位名 → 當作方向真值。
8. 無來源句子 → 為了填滿欄位而補理由或補方向。

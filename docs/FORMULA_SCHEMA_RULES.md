# Formula Schema & Naming Rules (for formula_canon_shortlist.json → formulas)

Reviewed/approved by Claude on Ting's behalf, 2026-07-03. Codex: follow these before filling content.

## 1. Add these fields to every shortlist record (before filling content)

| Field | Rule | Example |
|---|---|---|
| id | `formula.<pinyin_snake>` — stable key for links | `formula.gui_zhi_tang` |
| tier | `"core"` (current 115) or `"expanded"` (future) | `core` |
| review_status | `draft` until dual-track verified, then `source_checked` | `draft` |

Keep existing: name_zh, name_en, pinyin, category, source_hint, comparison_group,
modern_clinical_use_tags[], related_conditions[], related_formulas[], clinical_use_note.

## 2. Naming / vocabulary rules

- **modern_clinical_use_tags[]**: English snake_case modern condition/symptom slugs.
  Controlled starter vocab: pcos, ibs, insomnia, pms, gerd, uri, dysmenorrhea, menopause,
  anxiety, depression, eczema, migraine, hypertension, allergic_rhinitis, constipation,
  chronic_fatigue, infertility, amenorrhea, common_cold, cough. Extend as needed, always snake_case.
- **related_conditions[]**: reference existing IDs from data/pathology/conditions.json
  (`western_condition.*`, `eastern_disease.*`, `pattern.*`). Do NOT invent free text.
- **related_formulas[]**: reference other formula `id`s (`formula.*`), never names.
- **comparison_group**: one primary snake_case theme slug (a formula belongs to one group).

## 3. Comparison group starter map (差異鑑別組)

| group slug | formulas to differentiate |
|---|---|
| exterior_wind_cold | 桂枝湯, 麻黃湯, 九味羌活湯 |
| exterior_wind_heat | 銀翹散, 桑菊飲 |
| shaoyang_harmonize | 小柴胡湯, 大柴胡湯 |
| liver_spleen | 逍遙散, 痛瀉要方 |
| qi_tonify | 四君子湯, 補中益氣湯, 參苓白朮散 |
| blood_tonify | 四物湯, 當歸補血湯 |
| qi_blood_tonify | 八珍湯, 十全大補湯, 歸脾湯 |
| yin_tonify | 六味地黃丸, 知柏地黃丸, 左歸丸 |
| yang_tonify | 腎氣丸, 右歸丸 |
| clear_heat_qi | 白虎湯, 竹葉石膏湯 |
| damp_heat_lower | 龍膽瀉肝湯, 八正散 |
| blood_stasis | 血府逐瘀湯, 桃紅四物湯, 桂枝茯苓丸 |
| phlegm_damp | 二陳湯, 溫膽湯 |
| calm_spirit | 天王補心丹, 酸棗仁湯, 甘麥大棗湯 |

(Extend to cover all 115; each formula gets exactly one comparison_group.)

## 4. Content-integrity rules (Ting's hard requirement)

- Dual-track content: English (exam) layer from Bensky *Formulas & Strategies* / *Materia Medica*
  + Deadman where relevant → mark source_checked. Chinese (depth) from CloudTCM /formula, 萬方 → draft.
- Dose tracks must remain separate: classical source amount, raw-herb/decoction
  reference grams, and concentrated-granule reference grams. Granule entries
  require concentration ratio/brand, dose scope, source, and review status;
  never auto-convert them from raw-herb grams.
- **Framing, never medical claims:**
  - modern_clinical_use_tags / related_conditions → UI shows "相關 / 傳統用於 / 研究方向",
    NOT "treats / cures".
  - related_formulas → "比較 / 鑑別 / 可參考方向", NEVER "auto-substitute" or a treatment guarantee.
- No overmedical claims; educational information, not clinical prescription.

## 5. Sequence

1. Add id + tier to all 115 (mechanical, no content).
2. Assign comparison_group to all 115 (use map above + extend).
3. Fill dual-track content for the existing 23 FIRST (prove pipeline), each with sources + review_status.
4. Ting reviews the 23 → then expand.
5. Every step: node scripts/validate-data.js + validate-interactions.js; update REBUILD_HANDOFF.md.

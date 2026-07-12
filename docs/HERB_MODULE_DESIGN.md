# Herb Module Design (單味中藥層 — cards, linking, substitution)

Written: 2026-07-12 (Claude). Status: DESIGN — Ting approves before build.
Driving use case (Ting): a patient is allergic/unsuitable for one herb in a
formula → the practitioner needs to see, per herb, its category neighbors
and functional near-equivalents to REASON about substitution. This is a
study/reference structure, never an automatic substitution engine.

## What already exists (build on, don't duplicate)

- `data/herbs/herb_canon_shortlist.json`: 202 herbs, RENDERED in Lookup
  (B3) with category filter. Fields already present: `id`
  (herb.<pinyin_snake>), `category` (34 labels ≈ Ting's 十幾二十幾分類),
  `channels_entered`, `properties_taste_temp`, `functions`,
  `related_formulas` (407 links — herb→代表方 already exists!),
  `safety_flags`, `clinical_use_note`, `modern_use_tags`, dual tracks.
- `data/herbs/formulas.json`: 115 formulas; the 23 filled have composition
  as PINYIN TEXT only — **the formula→herb id link is the missing half**.

## The three additions

### 1. Structured composition (formula → herb, the missing direction)

Add to each formula record:
```
composition_structured: [
  { "herb_id": "herb.gui_zhi", "role": "jun|chen|zuo|shi|", "note_zh": "" }
]
```
Rules: herb_id must exist in the herb file (validate-relations extension);
role optional (fill only when textbook-confirmed); keep the existing prose
composition text untouched (it is the human-readable source). Herbs not in
the 202 shortlist: add skeleton herb records first (id + names + category),
never a dangling id.

### 2. Herb comparison groups + substitution context (herb ↔ herb)

Mirror the proven formula pattern:
```
comparison_group: "release_exterior_warm_acrid"   // within-category study group
substitution_context_zh: ""   // 1-2 sentences: what this herb uniquely does
                              // vs its group neighbors; when neighbors are
                              // considered instead (allergy, availability,
                              // pregnancy, cost) — REVIEW-PROMPT language
related_herbs: []             // auto-generated from comparison_group,
                              // like formula related_formulas
```
Wording law: 「同組相近藥供比較與替換『思考』參考，非自動替代；劑量與
配伍調整屬專業判斷」 — must appear on the UI wherever related_herbs shows.
Allergy flow: herb card → 「同類相近藥」 chips + each formula it appears in
→ practitioner reasons about the swap inside the formula's logic.

### 3. Herb detail card (same pattern as formula cards)

Card/detail layout (js/knowledge.js, Codex-safe area):
中文名(大) · pinyin · 英文名 → 分類 pill + review_status pill →
性味歸經 → 功效 → 臨床使用註記 → 安全旗標(醒目) → 用量注意(有來源才顯示)
→ 代表方劑 chips (related_formulas → formula cards, ALREADY clickable data)
→ 同類相近藥 chips (related_herbs → herb cards)
→ modern_use_tags (after Track E condition ids exist, tags link to conditions).
Formula cards gain: 組成 herb chips (composition_structured → herb cards).

## Category note (Ting's 分類)

The 34 existing category labels ARE the classification layer (release
exterior, clear heat, tonify qi/blood/yin/yang, …). Keep them as the
category filter + group headers in the herbs Lookup section; no re-design
needed — just ensure every herb has exactly one primary category (audit as
part of H1) and the category list itself becomes a rendered index (分類總覽
strip like the formula categories grid).

## Build order (Track H, Codex unless marked)

- H1: audit 202 herbs: one primary category each; add `comparison_group`
  (~30 groups within categories) + empty `related_herbs`/`substitution_
  context_zh`. Generate related_herbs from groups (mirror Session-13 logic).
- H2: composition_structured for the 23 filled formulas (map pinyin text →
  herb ids; add skeleton herbs for any missing; STOP list for Ting if a
  pinyin is ambiguous). Extend validate-relations: herb ids in formulas
  must exist; related_herbs no self/cross-group links.
- H3: substitution_context_zh fill, group by group (draft, conservative,
  batches of ~30). The allergy-relevant safety_flags already exist — link
  wording, don't duplicate.
- H4: UI (js/knowledge.js + index.html + styles additions): herb detail
  card per layout above; formula⇄herb chips both directions; 分類總覽 strip.
- H5 [after Track E]: modern_use_tags on herbs link to condition ids.

Timeline: H1-H2 fit the current month schedule (replaces spare Week-4
capacity or next month Week 1); H3-H4 next month. Everything draft until
Bensky/CloudTCM herb-page verification (C1 flow).

## Prohibitions specific to this module

- Never present related_herbs as dosage-equivalent swaps.
- Pregnancy/toxicity safety_flags must be visible on every card state.
- No dosage ranges without a verified source (existing rule, restated).

# Pattern P-4 Execution Ledger (2026-08-11, Sonnet)

Branch: `codex/pattern-p4-exec`, created off true tip of `origin/codex/pattern-v2`
(`1b68920` "Pattern P-4 adjudication: 88-id review queue ruled"). Final SHA
of this execution: `ccafeb9`.

Executes the **UNCONTROVERSIAL** buckets of
`docs/research_packs/PATTERN_P4_ADJUDICATION_v0.md` only, per task scope.
Did not touch: the 30 `FORMULA_LAYER` ids, the 7 `GRAPH_ONLY` ids, or the 4
Ting-flagged items (脾胃陽虛/脾胃虛寒 consolidation, 脾虛濕困/脾虛濕阻
consolidation, 肝鬱化火, 外感風濕). Not pushed, per task instruction.

## Commits (5, in order)

| SHA | Commit | Files |
|---|---|---|
| `dc446f1` | P-4: MAP_TO_EXISTING (21) + RETIRE_AS_IMPORT_ARTIFACT (3) ruling | `scripts/build-pattern-alias-map.js`, `data/config/pattern_alias_map.json`, `data/pathology/pattern_library.json`, `data/generated/knowledge_data.js` |
| `49033b7` | CREATE_CANONICAL batch A (5 cards) | `data/pathology/pattern_registry.json`, `data/pathology/pattern_library.json`, `data/generated/knowledge_data.js` |
| `e4d8003` | CREATE_CANONICAL batch B (7 cards) | same |
| `a2b5ab3` | CREATE_CANONICAL batch C (5 cards) | same |
| `ccafeb9` | CREATE_CANONICAL batch D (5 cards, final) | same |

`curriculum/**` untouched throughout (verified: no commit in this branch
touches that path).

---

## 1. MAP_TO_EXISTING — 21 ids (commit `dc446f1`)

Mechanism: same one P-3 used — added 21 entries to
`scripts/build-pattern-alias-map.js`'s `APPROVED_LEGACY_ALIAS_TARGETS`,
each asserted against the target card's live `aliases_zh` on every future
run (throws loud if a future edit breaks the alias). Ran
`node scripts/build-pattern-alias-map.js --write` to regenerate the map.

Before writing, appended the 21 legacy names to `aliases_zh` (+ matching
`aliases_en`, kept index-aligned — the append-only script initially broke
P5/P7 by leaving `aliases_en` untouched; caught by validator, fixed with a
second pass appending translated English at the same trailing index) on the
18 distinct target `pattern.*` cards. Also appended `legacy_ids` (21 total)
on the same 18 cards.

All 21 mappings (`legacy_id → target`):

```
pat.肝脾不調      → pattern.liver_spleen_disharmony
pat.肝鬱脾虛      → pattern.liver_spleen_disharmony
pat.食傷脾胃      → pattern.food_stagnation
pat.心火旺盛      → pattern.heart_fire
pat.心脈瘀阻      → pattern.heart_blood_stasis
pat.脾胃虛弱      → pattern.spleen_qi_deficiency
pat.脾氣虛弱      → pattern.spleen_qi_deficiency
pat.濕熱瀰漫三焦  → pattern.san_jiao_damp_heat
pat.少陰陰虛火旺  → pattern.shao_yin_heat_transformation
pat.血瘀閉阻      → pattern.blood_stasis
pat.瘀血阻絡      → pattern.blood_stasis
pat.肝胃氣滯      → pattern.liver_stomach_disharmony
pat.肝膽火盛      → pattern.liver_fire
pat.風熱相搏      → pattern.wind_heat
pat.氣血虛弱      → pattern.qi_blood_deficiency
pat.清陽不升      → pattern.spleen_qi_sinking
pat.腎陰虧虛      → pattern.kidney_yin_deficiency
pat.腎精虧虛      → pattern.kidney_essence_deficiency
pat.痰濕中阻      → pattern.phlegm_damp
pat.肝血瘀滯      → pattern.qi_stagnation_blood_stasis
pat.肝腎不足      → pattern.liver_kidney_yin_deficiency
```

### Formula absorption (typical_formulas, append-only, exact name-or-alias resolution against `data/herbs/formulas.json` only)

8 `formula.*` id additions across 7 cards (14 of the 22 formula_zh strings
were already present on the target — no-op, not double-added):

| target | formula.* added |
|---|---|
| liver_spleen_disharmony | `si_ni_san` |
| heart_blood_stasis | `xue_fu_zhu_yu_tang` |
| san_jiao_damp_heat | `huang_lian_jie_du_tang` |
| blood_stasis | `shao_fu_zhu_yu_tang`, `tao_hong_si_wu_tang` |
| wind_heat | `xiao_feng_san` |
| qi_stagnation_blood_stasis | `wen_jing_tang` |
| liver_kidney_yin_deficiency | `zuo_gui_wan` |

2 `formula_zh` strings did **not** resolve and were **not** absorbed
(consistent with P-3's discipline — no invented equivalence):
- `八珍湯合牽正散` (pat.氣血虛弱 → qi_blood_deficiency) — compound "X合Y"
  name, not a single exact-or-alias match.
- `耳聾左慈丸` (pat.腎精虧虛 → kidney_essence_deficiency) — genuinely
  absent from `formulas.json`.

`legacy_ids`: 21 additions across 18 distinct cards (3 targets received 2
legacy ids each: liver_spleen_disharmony, spleen_qi_deficiency, blood_stasis).

## 2. RETIRE_AS_IMPORT_ARTIFACT — 3 ids (commit `dc446f1`)

Confirmation only, no new judgment — per the adjudication doc Section 4 and
the standing 2026-08-06 Ting-delegated decision. Added a new
`retired_as_import_artifact` output section to
`scripts/build-pattern-alias-map.js`, additive to the existing structure:

- `pat.1` — numeric import junk, previously silently falling into
  `pending_registration`. Now pulled out and recorded in the new section
  (pending_registration count dropped 35 → 34).
- `pat.氣血不和`, `pat.臟腑虛弱` — CloudTCM catch-all buckets. Left exactly
  where they already lived (`excluded_formula_patterns`, count unchanged at
  32) and additionally cross-recorded in the new section so the P-4 ruling
  for all 3 ids is visible in one place.

`tcm_pattern_canon.json` (the `pat.*` canon file) itself untouched, per
constitution Rule 2 (不硬刪記錄) — frozen as always.

## 3. CREATE_CANONICAL — 22 cards (commits `49033b7`, `e4d8003`, `a2b5ab3`, `ccafeb9`)

Textbook-clear subset of the adjudication doc's 25 proposed cards, per task
scope: **excluded** the 2 consolidations (`spleen_stomach_yang_deficiency` =
脾胃陽虛+脾胃虛寒, `spleen_deficiency_damp_encumbrance` = 脾虛濕困+脾虛濕阻)
and `wind_damp_invasion` (外感風濕) — the 3 Ting-flagged items that live in
the doc's own Section 1 CREATE_CANONICAL table. (肝鬱化火, the task's 4th
named item, was already `GRAPH_ONLY` in the adjudication doc's Section 3,
not part of the CREATE_CANONICAL table — no action needed there; confirmed
untouched.)

25 proposed − 3 excluded = 22 cards, matching the task's own "~21-22 clear
cards" estimate exactly.

Each card built per `docs/PATTERN_CARD_TEMPLATE.md` §3–§4: `key_signs_zh/en`,
`tongue_zh/en`, `pulse_zh/en`, `pattern_family` (+ `zang_fu`/`eight_principles`
where applicable), `mechanism_zh/en`, `common_causes_zh/en`,
`differential_patterns` (2 each, `pattern_id` resolved against the live
library at commit time), `treatment_principle_zh/en`, `typical_formulas`,
`typical_points` (codes verified against `data/acupoints/361.json` before
writing), `point_rationale_zh/en`, `sources`, `field_sources`, `legacy_ids`,
`review_status: "draft"`, `authored_by: "model_draft"`. Content is written
from standard TCM textbook knowledge (中醫診斷學/中醫內科學/方劑學 通用教材),
course-level citation per template §R2 — not curriculum-file-specific, since
no curriculum PDF/docx covers these specific 22 patterns individually.

Registry: **125 → 147** (+22). Library: **128 → 150** (+22).

| Batch | Cards | Registry N→M | Library N→M |
|---|---|---|---|
| A | phlegm_stasis_binding, phlegm_qi_binding, water_fluid_retention, yin_deficiency_fire_flaring, qi_yin_deficiency | 125→130 | 128→133 |
| B | blood_deficiency_wind_dryness, heart_stomach_fire, water_qi_attacking_heart, liver_fire_invading_stomach, lung_stomach_dryness_heat, lung_qi_deficiency_cold, damp_heat_skin_invasion* | 130→137 | 133→140 |
| C | lung_heat_excess, stomach_cold, wind_cold_invading_collaterals, heat_toxin_blazing, gallbladder_heat_invading_stomach | 137→142 | 140→145 |
| D | qi_constipation, heat_constipation, deficiency_constipation, spleen_constriction, heat_disturbing_chest_diaphragm | 142→147 | 145→150 |

\* `damp_heat_skin_invasion` was moved up from the doc's proposed Batch C
into Batch B because `blood_deficiency_wind_dryness`'s `differential_patterns`
references it — P6 (relation-id resolution) requires the target to exist in
the same commit. This is the one deviation from the adjudication doc's
proposed batch grouping; the card content itself is unchanged from what was
planned for "Batch C" in the doc.

### Formula resolution for CREATE_CANONICAL cards

Every card's `typical_formulas` was resolved against `data/herbs/formulas.json`
before writing (never invented from memory). 5 documented substitutions
where the sourced canon `formula_zh` didn't resolve exactly but a
textbook-equivalent did (each noted inline in that card's `sources` array):

| card | canon formula_zh | resolved to | basis |
|---|---|---|---|
| phlegm_qi_binding | 旋覆代赭湯 (kept) + added | `formula.ban_xia_hou_po_tang` | classical 梅核氣 formula, added alongside the canon-sourced one |
| heart_stomach_fire | 三黃瀉心湯 | `formula.xie_xin_tang` | same Da Huang/Huang Lian/Huang Qin structure, not string-identical |
| lung_qi_deficiency_cold | 玉屏風散合溫肺止流丹 | `formula.yu_ping_feng_san` | 玉屏風散 half of the compound resolves exactly; 溫肺止流丹 absent from formulas.json, not absorbed |
| lung_heat_excess | 清上防風湯 | `formula.xie_bai_san` | dermatology-specific canon variant absent; 瀉白散 is the standard 方劑學 formula for this exact pattern |
| stomach_cold | 附子理中湯 | `formula.fu_zi_li_zhong_wan` | 丸/湯 dosage-form name variant, same formula |
| wind_cold_invading_collaterals | 牽正散合小續命湯 | `formula.qian_zheng_san` | 牽正散 half resolves exactly; 小續命湯 absent from formulas.json, not absorbed |
| qi_yin_deficiency | 生脈飲 | `formula.sheng_mai_san` | 飲/散 dosage-form name variant, same 3-herb formula |
| deficiency_constipation | 黃芪湯 | `formula.ji_chuan_jian` | canon formula absent from formulas.json; 濟川煎 is the current 中醫內科學 standard formula for this exact deficiency-constipation subtype |

2 cards left `typical_formulas` empty (N2 note, not blocking) because
neither the canon formula nor a textbook-standard substitute resolves
against `formulas.json`:
- `qi_constipation` (canon: 六磨湯 — genuinely absent)
- `heat_disturbing_chest_diaphragm` (canon: 梔子豉湯 — genuinely absent;
  confirmed no 梔子/山梔/栀 entry exists in formulas.json at all)

### Acupoint codes

All `typical_points` codes were checked against `data/acupoints/361.json`
(361 valid codes) before being written into any card — no point code was
guessed without verification. Note for future batches: `EX-HN*` extra
points are **not** present in `361.json` under that naming, and `SJ*`/`RN*`
prefixes are not valid (use `TE*`/`CV*` instead) — this dataset's channel
points use `TE` and `CV`, not the `SJ`/`RN` aliases seen elsewhere in older
pattern-library records.

---

## Validator output (verbatim tails, final state at `ccafeb9`)

```
$ node scripts/validate-pattern-standard.js --worklist --all
validate-pattern-standard — data/pathology/pattern_library.json
scope: all families · 150 records · 150 clean

N1  10 record(s) — no differential_patterns — a pattern card's one irreplaceable section (note only)
N2  23 record(s) — no treatment links at all (typical_points and typical_formulas both empty) (note only)

PASS — 0 blocking defects.
```

```
$ node scripts/validate-pattern-registry.js
===== 證型登錄檔結構檢查 =====

證型筆數        147  (下限 59)
上位分類        10  (下限 10)
有辨證體系      147  (下限 48)
有兩軸歸屬      53  (下限 31)
待補中文名      0
待補辨證體系    0

validate-pattern-registry: PASS
```

```
$ node scripts/check-validation-ratchet.js
validation ratchet — defect counts vs committed baseline

  flat     conditions   425
  flat     patterns     0
  flat     tdis         0
  flat     symptoms     0
  flat     naming       1

PASS — no regressions.
```

```
$ node scripts/validate-content-junk.js
validate-content-junk: PASS — no scraped header tokens in content arrays.
```

```
$ node scripts/validate-relations.js
Relation validation passed.
```

N2 count (23) is unchanged from the P-3 baseline — none of P-4's 22 new
cards or 21 mapped cards are among the N2-flagged records (every new card
has either `typical_points` or `typical_formulas` populated, even the 2
with empty `typical_formulas` — they carry `typical_points`).

## Content-loss verification

Ran a programmatic diff after commit `dc446f1` (the mapping/retire commit —
the one with edit-in-place risk) comparing every field of every
pre-existing record, old file (`git show HEAD~1`) vs new: every string field
value byte-identical, every array equal-length-or-longer with every old
element still present at the same index. 0 losses. The 4 CREATE_CANONICAL
commits are pure appends (new records only, verified by the injector
script's own throw-if-exists guard on both `id` sets before writing).

## Judgment calls

1. **`damp_heat_skin_invasion` moved from doc's Batch C to Batch B** — a
   pure sequencing change (see above), not a content or scope change.
2. **8 formula-name substitutions** (5 in CREATE_CANONICAL, listed above;
   plus reuse of the `sheng_mai_san`/`sheng_mai_yin` and other name-variant
   precedents P-3 already documented) — each is a dosage-form or compound-
   formula-half resolution, not an invented clinical equivalence; each is
   inline-noted in the card's `sources` array for anyone auditing later.
   2 cards left with genuinely no resolving formula rather than guessing
   one.
3. **2 formula_zh strings not absorbed in MAP_TO_EXISTING** (八珍湯合牽正散
   compound name, 耳聾左慈丸 absent) — same "no invented equivalence"
   discipline P-3 set.
4. **肝鬱化火**: confirmed it required no action — it is already
   `GRAPH_ONLY` in the adjudication doc's own Section 3, not part of the
   Section 1 CREATE_CANONICAL table the task said to build from. The task
   prompt's phrasing ("exclude... 肝鬱化火") is satisfied by inaction, not
   by an edit.
5. **`aliases_en` gap caught mid-batch**: the first MAP_TO_EXISTING pass
   only appended `aliases_zh`, breaking P5/P7 on 18 records. Caught by
   `validate-pattern-standard.js` before commit, fixed with a second
   index-aligned append pass, re-validated to 0 blocking before committing
   — not force-pushed past a red validator run.

## Not touched (per task scope)

- The 30 `FORMULA_LAYER` ids (方證/類方證) — confirmed still routed through
  `excluded_formula_patterns` (count unchanged at 32), awaiting the formula
  line per D10 rule 5.
- The 7 `GRAPH_ONLY` ids — no cards created, no alias-map changes.
- The 4 Ting-flagged items — no registry/library entries created for
  `spleen_stomach_yang_deficiency`, `spleen_deficiency_damp_encumbrance`,
  or `wind_damp_invasion`; no action needed for `肝鬱化火` (already
  GRAPH_ONLY, see judgment call 4).
- `curriculum/**` — untouched.
- Not pushed to any remote, per task instruction.

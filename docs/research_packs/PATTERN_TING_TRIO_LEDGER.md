# Pattern Ting Trio Execution Ledger (2026-08-11, Sonnet)

Branch: `codex/pattern-ting-trio`, created off true tip of `origin/codex/pattern-v2`
(`795bdbb` "P-4 exec merge finalize: pattern library 128->150 ... rebuild
bundle"). Registry 147 / library 150 confirmed at branch point.

Executes the three Ting-approved rulings on the P-4 flagged/borderline items
in `docs/research_packs/PATTERN_P4_ADJUDICATION_v0.md` §"Ambiguous / needs
Ting's second look" items 1 and 3, per the task's own numbered rulings.
Does **not** touch `外感風濕` (item 4 in the same section — awaiting SOL's
definition ruling per task instruction).

## Rulings executed

1. **APPROVED consolidation** — 脾胃陽虛 (`pat.脾胃陽虛`) + 脾胃虛寒
   (`pat.脾胃虛寒`) → one card `pattern.spleen_stomach_yang_deficiency`.
2. **APPROVED consolidation** — 脾虛濕困 (`pat.脾虛濕困`) + 脾虛濕阻
   (`pat.脾虛濕阻`) → one card `pattern.spleen_deficiency_damp_encumbrance`.
3. **APPROVED flat card, overriding the adjudication doc's GRAPH_ONLY
   recommendation** — 肝鬱化火 (`pat.肝鬱化火`) → full card
   `pattern.liver_depression_transforming_fire`. Ting's override rationale
   (recorded on the card itself, `mechanism_zh`/`mechanism_en` and `sources`):
   it is taught with its own key-signs/tongue/pulse/treatment-principle set
   (疏肝瀉火) distinct from both `liver_qi_stagnation` and `liver_fire`, not
   merely a bare transition link between the two.

## Registry (147 → 150, +3)

Same shape as the P-4 CREATE_CANONICAL batch (`source_type:
"pattern_ting_trio_2026_08_11"`, `level: "pattern"`, `system: "zang_fu"`,
`used_by_conditions: 0` — new registry-side ids, condition-side linkage is a
future step): 3 new records appended to `data/pathology/pattern_registry.json`,
each carrying a `registration_note_zh` citing this ledger and the
adjudication doc.

## Library (150 → 153, +3)

Each card built per `docs/PATTERN_CARD_TEMPLATE.md` §3–§4, matching the
depth/shape of sibling `zang_fu` cards (`spleen_kidney_yang_deficiency`,
`spleen_yang_deficiency`, `cold_damp_encumbering_spleen`, `liver_qi_stagnation`,
`liver_fire`) used as structural reference: `key_signs_zh/en`, `tongue_zh/en`,
`pulse_zh/en`, `supporting_signs_zh/en`, `pattern_family`, `zang_fu`,
`eight_principles`, `mechanism_zh/en`, `common_causes_zh/en`,
`progression_zh/en`, `differential_patterns` (2 each, `pattern_id` resolved
against the live library at write time), `treatment_principle_zh/en`,
`typical_formulas`, `typical_points`, `point_rationale_zh/en`, `sources`,
`field_sources`, `legacy_ids`, `aliases_zh/en` (consolidation cards only),
`review_status: "draft"`, `authored_by: "model_draft"`. Content is written
from standard TCM textbook knowledge (中醫診斷學/中醫內科學/方劑學 通用教材),
course-level citation per template §R2 — same discipline as the P-4 exec
batch, since no curriculum PDF/docx covers these 3 patterns individually.

| Card | `name_zh` (canonical) | `aliases_zh` (non-canonical legacy name) | `legacy_ids` |
|---|---|---|---|
| `pattern.spleen_stomach_yang_deficiency` | 脾胃陽虛 | 脾胃虛寒證 | `pat.脾胃陽虛`, `pat.脾胃虛寒` |
| `pattern.spleen_deficiency_damp_encumbrance` | 脾虛濕困 | 脾虛濕阻證 | `pat.脾虛濕困`, `pat.脾虛濕阻` |
| `pattern.liver_depression_transforming_fire` | 肝鬱化火 | (none — single legacy id) | `pat.肝鬱化火` |

Canonical name chosen as the higher-usage legacy name in each consolidation
pair (脾胃陽虛 15× vs 脾胃虛寒證 1×; 脾虛濕困 10× vs 脾虛濕阻證 1×,
`used_by_condition_blobs` counts from the adjudication doc / alias map),
per the pre-consolidation ledger precedent (`pattern.spleen_qi_deficiency`
absorbing 4 legacy names the same way).

### Formula resolution (verified against `data/herbs/formulas.json` and the built bundle before linking, per task instruction)

| card | task-specified family | canon `formula_zh` (adjudication doc) | resolved `typical_formulas` | note |
|---|---|---|---|---|
| `spleen_stomach_yang_deficiency` | 理中湯類 | 腎著湯 / 黃芪建中湯 | `formula.li_zhong_wan`, `formula.fu_zi_li_zhong_wan`, `formula.huang_qi_jian_zhong_tang` | 腎著湯 absent from `formulas.json` (not absorbed, consistent with P-3/P-4 no-invented-equivalence discipline); 黃芪建中湯 resolved exactly; 理中丸/附子理中丸 added as the standard 理中湯類 formulas per task instruction |
| `spleen_deficiency_damp_encumbrance` | 參苓白朮散類 | 平胃散 / 參苓白朮散 | `formula.shen_ling_bai_zhu_san`, `formula.ping_wei_san` | both resolve exactly; 參苓白朮散 promoted primary per task instruction |
| `liver_depression_transforming_fire` | 丹梔逍遙散類 | 龍膽瀉肝湯 (from `pat.肝鬱化火`'s canon record — a pure excess-fire formula better suited to `pattern.liver_fire`) | `formula.jia_wei_xiao_yao_san` | 丹梔逍遙散 is a well-known name variant of 加味逍遙散 (Xiao Yao San + Mu Dan Pi + Zhi Zi) — same formula, not string-identical; resolved against `formulas.json`, not invented |

All 6 resolved `formula.*` ids confirmed present in `data/generated/knowledge_data.js`
(the built bundle) after `node scripts/build-data.js` — 223 formula records,
all 6 ids `true`.

### Acupoint codes

All `typical_points` codes checked against `data/acupoints/361.json` (361
valid codes) before writing:

- `spleen_stomach_yang_deficiency`: `CV12`, `CV4`, `ST36`, `SP3`, `SP6`, `BL20`, `BL21`
- `spleen_deficiency_damp_encumbrance`: `SP9`, `SP6`, `ST36`, `CV12`, `BL20`, `BL21`, `SP3`
- `liver_depression_transforming_fire`: `LR2`, `LR3`, `LR14`, `GB34`, `LI4`, `SP6`

All 13 distinct codes confirmed present in `361.json`.

## Alias mechanism (`data/config/pattern_alias_map.json`, `scripts/build-pattern-alias-map.js`)

Same mechanism as the P-4 MAP_TO_EXISTING batch: 2 new entries added to
`APPROVED_LEGACY_ALIAS_TARGETS` for the non-canonical-name half of each
consolidation pair (the canonical-name half resolves automatically via the
script's exact-name `canonicalByName` match against the new registry/library
records, same as `肝鬱化火` needed no explicit entry):

```
pat.脾胃虛寒  → pattern.spleen_stomach_yang_deficiency   (explicit, aliases_zh-asserted)
pat.脾虛濕阻  → pattern.spleen_deficiency_damp_encumbrance (explicit, aliases_zh-asserted)
pat.脾胃陽虛  → pattern.spleen_stomach_yang_deficiency   (automatic, exact name_zh match)
pat.脾虛濕困  → pattern.spleen_deficiency_damp_encumbrance (automatic, exact name_zh match)
pat.肝鬱化火  → pattern.liver_depression_transforming_fire (automatic, exact name_zh match)
```

`aliases_zh` appended to the target cards first (脾胃虛寒證, 脾虛濕阻證), then
`node scripts/build-pattern-alias-map.js --write` run — the script's own
assertion (`Approved alias ... is not present on ...`) re-verifies the
alias exists on every future run.

### Incidental fix discovered while regenerating

Running the generator surfaced that `data/config/pattern_alias_map.json`
had **not** been regenerated since before the P-4 CREATE_CANONICAL batch
(`795bdbb`'s own 22 new cards) was committed — its stored `counts` reflected
a stale `library=128`-era state, not the `library=150` state actually on
disk. Regenerating (required for this task's own 5 mappings to take effect)
mechanically picked up **22 additional pre-existing exact-name matches**
that were already true but unreflected in the map (e.g. `pat.陰虛火旺` →
`pattern.yin_deficiency_fire_flaring`, `pat.氣陰兩虛` → `pattern.qi_yin_deficiency`,
`pat.痰瘀互結` → `pattern.phlegm_stasis_binding`, and 19 others from the same
batch). This is a pure, deterministic, no-judgment catch-up derived entirely
from data already committed at the branch point — not new content, not
scope creep. Verified via before/after diff: 0 `aliases` removed, only
additions; `excluded_formula_patterns` (32) and `retired_as_import_artifact`
(3) counts unchanged.

`pending_registration`: **34 → 7** (27 removed: 22 incidental catch-up +
5 from this task's rulings). Remaining 7 = `外感風濕` (untouched, 1×) + the
6 other `GRAPH_ONLY` items from the adjudication doc's Section 3 (unchanged,
untouched).

`mapped`: **67 → 94** (+27, same breakdown).

## Validator output (verbatim tails, final state)

```
$ node scripts/validate-pattern-standard.js --worklist --all
validate-pattern-standard — data/pathology/pattern_library.json
scope: all families · 153 records · 153 clean

N1  10 record(s) — no differential_patterns — a pattern card's one irreplaceable section (note only)
N2  23 record(s) — no treatment links at all (typical_points and typical_formulas both empty) (note only)

PASS — 0 blocking defects.
```

```
$ node scripts/validate-pattern-registry.js
===== 證型登錄檔結構檢查 =====

證型筆數        150  (下限 59)
上位分類        10  (下限 10)
有辨證體系      150  (下限 48)
有兩軸歸屬      53  (下限 31)
待補中文名      0
待補辨證體系    0

validate-pattern-registry: PASS
```

```
$ node scripts/check-validation-ratchet.js
validation ratchet — defect counts vs committed baseline

  flat     conditions   306
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
(pre-existing warnings unrelated to this batch — 2 crosswalk ICD-10 disagreements,
31 comparison-record skeletons — unchanged by this batch, not pattern-line issues.)

N1/N2 counts (10/23) are unchanged from the pre-branch baseline — none of
the 3 new cards are among the N1 or N2-flagged records (every new card has
both `differential_patterns` (2 each) and `typical_formulas`/`typical_points`
populated).

## Content-loss verification

Diffed every pre-existing record (registry + library) old (`795bdbb`) vs new:
byte-identical for every field on every pre-existing record; the only
changes are 3 pure-append new records per file (guarded by an
existence-check `throw` in the injector script before writing) plus the 3
existing library records that received an appended `aliases_zh`/`aliases_en`
entry (`spleen_stomach_yang_deficiency`/`spleen_deficiency_damp_encumbrance`
are new records themselves, so this applies to none of the pre-existing
150 — no pre-existing record's `aliases_zh` was touched, since the two
non-canonical legacy names attach to the *new* consolidated cards, not to
any pre-existing one).

## Not touched (per task scope)

- `外感風濕` (`pat.外感風濕`) — left in `pending_registration`, awaiting SOL's
  definition ruling, per explicit task instruction.
- `curriculum/**` — untouched.
- No push — per task instruction, one commit only, explicit paths.

## Files changed

- `data/pathology/pattern_registry.json` (147 → 150 records)
- `data/pathology/pattern_library.json` (150 → 153 records)
- `scripts/build-pattern-alias-map.js` (+2 `APPROVED_LEGACY_ALIAS_TARGETS` entries, +comment)
- `data/config/pattern_alias_map.json` (regenerated — 5 task mappings + 22 incidental catch-up, see above)
- `data/generated/knowledge_data.js`, `data/generated/app_data.js`, and other `build-data.js` outputs (rebuilt)
- `docs/research_packs/PATTERN_TING_TRIO_LEDGER.md` (this file, new)

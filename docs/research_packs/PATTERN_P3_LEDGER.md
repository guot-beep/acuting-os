# Pattern P-3 Ledger (2026-08-11, Sonnet)

Branch: `codex/pattern-p3`, off true tip of `origin/codex/pattern-v2` (`da100ab`
"T4 skeleton-tier carve-out for tdis line"). Executes P-3 only, per
`docs/PATTERN_LINE_RECONCILIATION_v0.md`.

## What this batch did

1. Regenerated `data/config/pattern_alias_map.json` via the existing
   `scripts/build-pattern-alias-map.js` (it already existed but was stale —
   built against the pre-P1/P2 91/98-card library; `canonical_namespace_ids`
   was 101, now 128). Re-running it against the current 128-card library
   fixed two latent bugs for free (see "Data-quality findings" below) and
   picked up `pat.少陰寒化` for free since P-2 built its target card.
2. Added 3 verified alias-based matches to the script's existing
   `APPROVED_LEGACY_ALIAS_TARGETS` mechanism (the script's own established,
   safety-checked path for name-identity matches that go through
   `aliases_zh` instead of `name_zh` — each entry is asserted against the
   target's `aliases_zh` on every run, so a future data edit that breaks the
   alias fails loud, not silent).
3. Absorbed `formula_zh` from the 140 canon records into the 46 matched
   `pattern.*` cards' `typical_formulas` (append-only, exact-name-or-alias
   resolution against `data/herbs/formulas.json` only — no invented
   equivalences except one documented trad/simp character-set exception).
4. Wrote `legacy_ids` (an already-approved §4.8 field) on every matched card.
5. Did **not** write `condition_ids` anywhere — see "condition_ids
   disposition" below; this is the deliberate, template-driven call the task
   flagged as needing a check first.

## Matching methodology (honest match, no invented equivalence)

A confident match required `name_zh` identity (exact string, checked against
**both** `pattern_registry.json.name_zh` — the id authority — and
`pattern_library.json.name_zh` — the content layer; these two occasionally
disagree for the same id, e.g. `pattern.stomach_heat` is `胃熱熾盛` in the
library but `胃熱` in the registry, and `胃熱` is what the canon uses) with
the trailing `證`/`证` normalized, deduplicated against `deprecated` library
records so a retired duplicate card never creates a false ambiguity, **plus**
3 explicit `aliases_zh`-verified promotions. Everything else is "no
confident match" and went to `pending_registration` or
`excluded_formula_patterns`, not guessed.

## Numbers (of 140 canon records)

| Bucket | Records | Unique `pat.*` ids |
|---|---|---|
| **Matched → absorbed** | 50 | 46 |
| Unmatched — no name match (pending_registration) | 58 | 56 |
| Unmatched — 方證/類方證, formula layer not pattern layer | 30 | 30 |
| Unmatched — CloudTCM catch-all bucket (氣血不和/臟腑虛弱) | 2 | 2 |
| **Total** | **140** | **134** (140 − 6 duplicate ids) |

`kind` field breakdown: 證候 115 / 方證 25. Note the 30 formula-layer
exclusions is **more** than the 25 `kind:"方證"` records — the script (and
D10 rule 5, per `docs/CONDITION_CARD_TEMPLATE.md` §4) also excludes 5
records tagged `kind:"證候"` whose `name_zh` ends in 類方證 (小建中湯類方證,
桂枝湯類方證, 麻黃湯類方證, 柴胡湯類方證, 雜病類方証) — these are
formula-class group headings, not diagnosable patterns, and the canon's own
`kind` field is acknowledged in the script's comments as unreliable for
that distinction.

Reproduce: `node scripts/build-pattern-alias-map.js` (dry run, prints the
same counts).

## Fields absorbed vs ledger-deferred

- **`typical_formulas`**: 19 `formula.*` id additions across 19 cards (append
  only — verified programmatically post-write that every pre-existing array
  item and string field value from every record is still present in the new
  file; 0 losses). 14 formula refs were already present on the target card
  (no-op, not double-added). 15 `formula_zh` strings did not resolve to any
  `formula.*` id and were **not** absorbed — see "Unresolved formula names"
  below.
- **`legacy_ids`**: 46 additions (one per matched `pat.*` id; 45 distinct
  cards touched because `pat.脾胃氣虛` and `pat.脾氣虛` both map to
  `pattern.spleen_qi_deficiency`).
- **`condition_ids`**: **0 written to any card.** See disposition below —
  all 46 matched cards' would-be condition links are recorded only in
  `pattern_alias_map.json` (via the `pat.*` id, which still carries its full
  `condition_ids` array in `tcm_pattern_canon.json`, untouched) and in this
  ledger.

## condition_ids disposition (the check the task asked for)

`docs/PATTERN_CARD_TEMPLATE.md` §4.8 is explicit: `related_conditions` is
**retired** — "不准手填(D13)。它是 `cond.related_patterns` 的反向 ——反向一律
衍生... 手填會被 validator 記為 P8". There is a *different*, still-approved
field with cond.* shape, `related_biomedical_condition_ids` (§4.9, already
in use on 20 pre-existing records), but §4.9's own header says: **"新記錄一
律用 §4.1–4.8 的正典欄位,不要再用這一組寫新資料"** — new data must not be
written into the §4.9 v1.0-import vocabulary group; it is legacy-only,
integration direction still undecided by Ting.

So: neither the approved-for-new-writes canonical field (`related_conditions`,
retired/derived-only) nor the shape-compatible legacy field
(`related_biomedical_condition_ids`, frozen against new writes) is a valid
target. Per the task's own C8-style instruction, this is exactly the "not
approved → ledger only" branch. Condition-link counts by matched pattern
(from the matched `pat.*` record's `condition_ids.length`, union across
duplicate-id records):

| pattern.* | via pat.* | condition_ids count |
|---|---|---|
| pattern.liver_qi_stagnation | 肝氣鬱結 | 36 |
| pattern.qi_stagnation_blood_stasis | 氣滯血瘀 | 32 |
| pattern.kidney_yang_deficiency | 腎陽虛 | 26 |
| pattern.qi_blood_deficiency | 氣血兩虛 | 21 |
| pattern.heart_spleen_deficiency | 心脾兩虛 (×2 ids) | 18 |
| pattern.spleen_kidney_yang_deficiency | 脾腎陽虛 | 16 |
| pattern.damp_heat_lower_burner | 下焦濕熱 | 16 |
| pattern.kidney_yin_deficiency | 腎陰虛 | 14 |
| pattern.wind_cold | 外感風寒 (alias) | 10 |
| pattern.kidney_essence_deficiency | 腎精不足 (×2 ids) | 9 |
| pattern.liver_blood_deficiency | 肝血虛 | 9 |
| pattern.spleen_qi_deficiency | 脾胃氣虛 (alias) + 脾氣虛 | 9 + 6 |
| pattern.liver_fire | 肝火上炎 | 8 |
| … | (remaining 33 matched patterns, 1–7 condition_ids each) | see `data/config/tcm_pattern_canon.json` via the `pat.*` id in `pattern_alias_map.json.aliases` |

Full per-pattern counts are reproducible: for every key in
`pattern_alias_map.json.aliases`, look up that `pat.*` id in
`tcm_pattern_canon.json.records` and read `condition_ids.length`. Not
duplicating all 46 rows here since the map file is the source of truth and
this ledger would drift from it.

**Recommendation for whoever unblocks this next**: either (a) Ting decides
`related_biomedical_condition_ids` is the integration target and lifts the
§4.9 write-freeze for this one field, or (b) a new `related_condition_ids`
field is proposed, added to the template §4.6/4.8, the validator's
`APPROVED` set, and *then* filled — schema-before-data, per the constitution.
Both are out of scope for P-3.

## Unresolved formula names (15 `formula_zh` strings, no `formula.*` id)

Every one of these was searched exact **and** via `aliases_zh` in
`data/herbs/formulas.json` (224 records) and genuinely does not resolve.
Left alone — not absorbed, not guessed:

| pat.* | formula_zh | note |
|---|---|---|
| 腎陽虛, 脾腎陽虛 | 八味地黃丸 | classic alt-name for 金匱腎氣丸/腎氣丸 (both exist as `formula.jin_gui_shen_qi_wan` / `formula.shen_qi_wan`) but the two are different ids and the canon string matches neither exactly — ambiguous which one to alias, deferred rather than guessed. `pattern.kidney_yang_deficiency` already has `jin_gui_shen_qi_wan` so this one is moot; `pattern.spleen_kidney_yang_deficiency` does not. |
| 下焦濕熱 | 四妙散 | `formula.si_miao_wan` (四妙丸) exists — same herbs, different dosage-form name in the source data. Not string-identical, deferred. |
| 外感風寒 | 麻黃附子細辛湯 | genuinely absent from formulas.json under any name/alias (this is also a `pat.麻黃附子細辛湯` 方證 entry excluded separately — see excluded list) |
| 外感風熱 | 黃連上清丸 | genuinely absent |
| 心腎不交 | 交泰丸 | **not in formulas.json at all**, despite `formula.jiao_tai_wan` being referenced as an id on the now-*deprecated* `pattern.insomnia_heart_kidney_disharmony` card (pre-existing dangling reference on a deprecated record, out of P-3 scope to fix) |
| 腎氣虛 | 斑龍丸 | genuinely absent |
| 脾陽虛 | 安中散 | genuinely absent |
| 腎氣不固 | 麥味地黃丸 | genuinely absent |
| 氣虛 | 順氣和中湯 | genuinely absent |
| 肝胃不和 | 柴胡疏肝湯 | likely the same formula as 柴胡疏肝散 (`formula.chai_hu_shu_gan_san`, already added to this card via the pattern's *other* duplicate canon record which used the 散 name) — not re-guessed as a second id, the pattern already got the formula link through its sibling record |
| 心血虛 | 養心湯 | genuinely absent |
| 心陽虛 | 桂枝甘草湯 | genuinely absent (2-herb formula, never entered into formulas.json) |
| 風寒濕痹 | 三痹湯 | genuinely absent |
| 心陰虛 | 生脈飲 | `formula.sheng_mai_san` (生脈散) exists — same 3-herb formula under a 飲/散 name variant, not string-identical, deferred |

One documented exception was made, **not** a guess: `葛根黃芩黃連湯`
(traditional, from canon) resolved to `formula.ge_gen_huang_qin_huang_lian_tang`
whose `name_zh` is stored as `葛根黄芩黄连汤` (simplified) in
`formulas.json` — this is a character-set encoding difference for the
identical formula name, not a terminology judgment, so it was treated as a
match and added to `pattern.large_intestine_damp_heat`.

## Data-quality findings surfaced while regenerating the alias map

1. `pattern_library.json` has 3 pairs of records sharing the same `name_zh`
   where one twin is `review_status: "deprecated"`:
   `肝火上炎` (pattern.liver_fire / pattern.liver_fire_flaring),
   `心腎不交` (pattern.heart_kidney_not_communicating /
   pattern.insomnia_heart_kidney_disharmony), `肝風內動` (pattern.liver_wind /
   pattern.liver_wind_stirring). My first hand-rolled matching pass (before
   finding the existing script) flagged these as ambiguous multi-matches
   because it didn't check `review_status`. The official script correctly
   dedupes against deprecated records. No action needed — flagging for
   awareness only, since a future script that doesn't check `review_status`
   would reintroduce the same false ambiguity.
2. `data/pathology/pattern_registry.json.name_zh` and
   `data/pathology/pattern_library.json.name_zh` disagree for at least 2 ids
   (`pattern.cold_stagnation_liver_channel`: 寒凝肝脈 vs 寒滯肝脈;
   `pattern.stomach_heat`: 胃熱 vs 胃熱熾盛). Both resolved correctly here
   because the matching script checks both files, but this drift is worth a
   separate cleanup pass — out of scope for P-3.
3. `formula.jiao_tai_wan` is referenced by a *deprecated* pattern card
   (`pattern.insomnia_heart_kidney_disharmony`) but does not exist in
   `data/herbs/formulas.json`. Pre-existing, not introduced by P-3, not
   fixed (the card is deprecated so it doesn't fail `validate-relations.js`,
   which is presumably why it was never caught).

## P-4 review queue (unmatched, 90 records / 88 unique ids)

Full itemized lists with reasons already live in
`data/config/pattern_alias_map.json`:

- **`pending_registration`** (56 unique ids, 58 records): no `name_zh`
  match found anywhere in `pattern_registry.json` or `pattern_library.json`
  (exact, `證`-stripped, or the 3 approved aliases). Sorted by
  `used_by_condition_blobs` — highest-value registration targets first:
  脾胃陽虛 (15×), 外感風濕 (14×), 肝脾不調 (13×), 脾虛濕困 (10×), 肝血瘀滯
  (7×), 肝腎不足 (7×), 痰瘀互結 (7×), and 49 more down to 1×.
- **`excluded_formula_patterns`** (32 unique ids, 32 records): reason is one
  of two, per record: (a) `氣血不和`/`臟腑虛弱` — CloudTCM catch-all bucket,
  **explicitly requiring Ting's decision per `docs/PATTERN_CARD_TEMPLATE.md`
  §2** ("待登記前兩名要停一下... 不要自己決定,回報給 Ting") — flagging here
  again per that instruction, not deciding it; (b) 30 records — 方證/類方證,
  belongs to the formula layer per D10 rule 4/5, not the pattern registry.

No new judgment calls were made on the review queue beyond what the script
already encodes (I verified its classification logic against the template
and constitution rather than re-deciding case by case). The 2 catch-all
bucket entries remain flagged for Ting exactly as the template requires —
not silently skipped, not silently registered.

## Validator output (verbatim tails)

```
$ node scripts/validate-pattern-standard.js --worklist --all
validate-pattern-standard — data/pathology/pattern_library.json
scope: all families · 128 records · 128 clean

N1  10 record(s) — no differential_patterns — a pattern card's one irreplaceable section (note only)
N2  23 record(s) — no treatment links at all (typical_points and typical_formulas both empty) (note only)

PASS — 0 blocking defects.
```

```
$ node scripts/validate-pattern-registry.js
證型筆數        125  (下限 59)
上位分類        10  (下限 10)
有辨證體系      125  (下限 48)
有兩軸歸屬      53  (下限 31)
待補中文名      0
待補辨證體系    0
validate-pattern-registry: PASS
```

```
$ node scripts/check-validation-ratchet.js
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
[... pre-existing comparisons.json SKELETON notices, unrelated to pattern line ...]
Relation validation passed.
```

N2 dropped from the P1/P2 baseline of 29 to 23 (6 cards gained their first
treatment link via this batch's `typical_formulas` absorption). N1 unchanged
at 10 (P-3 did not touch `differential_patterns`, out of scope).

## Content-loss verification

Ran a programmatic diff (not just the validator) comparing every field of
every pre-existing record, old file vs new: every string field value is
byte-identical, every array is equal-length-or-longer with every old element
still present by deep-equality. 0 losses. (`git diff --stat` shows 60
deletion lines / 222 addition lines — all 60 are trailing-comma churn from
array/object insertions, confirmed line-by-line against the addition that
caused each one.)

## Judgment calls (summary, cross-referenced above)

1. Regenerated a stale `pattern_alias_map.json` via its own existing,
   already-reviewed generator script rather than reinventing the matching
   logic — safer than a from-scratch script since the existing one already
   encodes the `review_status` dedup, both-file name-authority check, and
   D10 rule 5 formula-pattern exclusion logic correctly.
2. Added 3 alias-based matches to the script's existing
   `APPROVED_LEGACY_ALIAS_TARGETS` curated list (外感風寒→wind_cold,
   脾胃氣虛→spleen_qi_deficiency, 外感風熱→wind_heat), each asserted against
   the target's live `aliases_zh` on every future run.
3. One trad/simp character-variant formula-name exception
   (葛根黃芩黃連湯/葛根黄芩黄连汤), documented inline in the absorption
   script logic and here — not a terminology judgment, a character-encoding
   identity.
4. Declined to guess 8 plausible-but-not-string-identical formula synonyms
   (八味地黃丸/金匱腎氣丸, 四妙散/四妙丸, 柴胡疏肝湯/散, 生脈飲/散) —
   listed in "Unresolved formula names" for a future formula-line pass
   rather than silently equated.
5. `condition_ids`: none written anywhere; template §4.8/§4.9 conflict
   surfaced and flagged for Ting rather than resolved unilaterally (see
   disposition section).
6. Left the two CloudTCM catch-all buckets exactly where the script already
   routes them (excluded, flagged for Ting) — did not re-litigate a decision
   the template says is not mine to make.

# Pattern P-1/P-2 Ledger (2026-08-11, Sonnet)

Branch: `codex/pattern-p1-p2`, off true tip of `origin/codex/pattern-v2` (`7f2acf2`
"Tdis C merge finalize"). Two commits, NOT pushed:

- `1079fe0` P-1
- `ce849ed` P-2

## P-1 — the 10 registry ids with no library card

Diff registry (98) vs library (91) at start: exactly the 10 ids required by
`validate-pattern-registry.js`'s `REQUIRED_CATEGORIES` floor, all `level:
"category"` umbrella nodes whose `members` already had library cards
(qi_deficiency, blood_deficiency, yin_deficiency, yang_deficiency, heat, fire,
damp_heat, phlegm, wind_external, kidney_deficiency).

Judgment call: registry's own `category_note_zh` says these are "差別卡標題,
不適合單獨作為辨證結論" (differential-heading nodes, not standalone diagnostic
conclusions). Built full content cards per template using standard 中醫基礎理論/
中醫診斷學 course material, but pointed each `differential_patterns` at the
pattern's real diagnosable member subtypes rather than unrelated neighbors —
that's the actually useful "how do you tell these apart" content for a category
node. `pattern.kidney_deficiency` has `tongue_zh`/`pulse_zh` left blank by
design: yin/yang subtypes run opposite thermal directions, so fixing one would
misdirect diagnosis (documented in its `mechanism_zh`).

## P-2 — V2-D APPROVE_CANONICAL / APPROVE_CANONICAL_SUBTYPE coverage

Exact-scanned every name in `PATTERN_V2D_FINAL_CANONICAL_DECISION_SLICE_2026-08-11.md`
under an `APPROVE_CANONICAL` or `APPROVE_CANONICAL_SUBTYPE` heading against
registry+library ids and `name_zh` (98+91 baseline). Result: **all 27 were
missing** — none pre-existed under either namespace, and `pattern_alias_map.json`
`pending_registration` (60 CloudTCM-usage-derived entries) had only one overlap
(少陰寒化 → `pat.少陰寒化`, linked via `legacy_ids`).

| Section | Slice count | Built | Deferred | Reason |
|---|---|---|---|---|
| A. Six Channels | 9 canonical + 1 subtype = 10 | 10 | 0 | — |
| B. Four Levels | 4 canonical + 3 subtype = 7 | 6 | 1 | 衛分濕熱: slice's own "only if source-stable" caveat — standard 溫病學 places damp-heat progression under San Jiao (吳鞠通三焦辨證), not 衛氣營血; mixing the two schemes for this one term is not stable terminology across texts. Not built, not silently dropped. |
| C. San Jiao | 1 canonical (rest LOCATION_ONLY/ENRICH_EXISTING/BROADER_NARROWER) | 1 | 0 | The other 10 San Jiao entries are intentionally out of scope — task said APPROVE_CANONICAL + APPROVE_CANONICAL_SUBTYPE only. |
| D. Gynecology/Chong-Ren | 4 canonical | 4 | 0 | — |
| E. Extraordinary Vessels | 5 canonical (帶脈/衝氣上逆 each has 2 name variants = same pattern, alias'd) | 5 | 0 | Hard rule honored: no invented vessel-specific tongue/pulse where the corpus doesn't establish one — left blank on all 5. |
| F. Jing-Luo | 1 canonical (rest BROADER_NARROWER) | 1 | 0 | — |
| **Total** | **28 name-slots (27 distinct patterns)** | **27** | **1** | |

Already-existed (built vs already-existed vs deferred, per report format): **0
already existed** — the entire 27-pattern approved list was a clean gap.

### Judgment calls made without going back to Ting

1. **衛分濕熱 deferred** — see table above. Documented in the P-2 commit message
   and here rather than silently built or silently dropped.
2. **Gynecology family assignment** — `pattern_family_vocabulary.json` has no
   "婦科/衝任" system. Used `qi_xue_jin_ye` for all 4 Chong-Ren/Uterus patterns,
   matching the existing precedent `pattern.chong_ren_disharmony` (registry
   `system: qi_xue_jin_ye`). Chong/Ren's extraordinary-vessel identity is noted
   in each card's `mechanism_zh` rather than forcing a second controlled-vocab
   field that doesn't exist.
3. **Extraordinary Vessels + Jing-Luo family** — used `jing_luo` (經絡辨證),
   the closest controlled-vocab fit per its own scope text ("以經絡循行定位").
4. **太陽蓄水 terminology normalized** to 太陽蓄水證 / "Tai Yang Water
   Accumulation Pattern" per the slice's conditional approval, with 太陽腑水蓄
   recorded as `aliases_zh`.
5. **No formula for 衝氣上逆 (奔豚氣)** — no Ben Tun Tang / Gui Zhi Jia Gui
   Tang id exists in `data/herbs/formulas.json`. Left `typical_formulas` empty
   rather than substitute an inexact formula; `typical_points` (SP4+PC6
   confluent pair) still populated.
6. **No formula for the 3 non-Chong-Mai Extraordinary Vessel patterns**
   (帶脈失約 has `formula.wan_dai_tang`; 陰蹻/陽蹻/陽維 have none) — standard
   texts treat these primarily via acupuncture (confluent-point pairs), not a
   named formula. `typical_formulas` left empty on those 3, honest rather than
   invented.
7. **Xue-Stage Heat vs generic `pattern.blood_heat`** — V2-D Lock rule made
   explicit as the first differential entry, citing the Lock by name.
8. **Yang Ming Jing vs Yang Ming Fu** — V2-D Lock rule made explicit in
   `yang_ming_channel_heat`'s differential against `yang_ming_fu_organ_excess`.

## Numbers (reproduce with the commands below)

- registry: 98 → 125 (+27, P-2 only; P-1 ids pre-existed in registry)
- library: 91 → 128 (+10 P-1, +27 P-2)
- `node scripts/validate-pattern-standard.js --worklist --all` → **128/128
  clean, 0 blocking defects** (N1=10, N2=29, both pre-existing counts,
  unchanged by either batch)
- `node scripts/validate-pattern-registry.js` → PASS (125 records, 10
  categories, 125/125 have `system`, 53/125 have `member_of`)
- `node scripts/check-validation-ratchet.js` → PASS, patterns flat at 0
- `node scripts/validate-content-junk.js` → PASS
- `node scripts/validate-relations.js` → "Relation validation passed."

## Not done (P-3/P-4, next slot)

`pat.*` → `pattern.*` alias absorption (formula_zh/condition_ids lift into
matching pattern.* cards) and the remaining ~107 undecided `pat.*` records are
P-3/P-4 per the reconciliation plan — out of this batch's scope.

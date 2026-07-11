# Encoding Validation Findings

Generated: 2026-07-11 after pulling `0259258`.

## Scope

This file records the first run of `scripts/validate-encoding.js` on the latest
main branch after Claude's D3 document merge and BL mojibake repair.

The validator is report-only. No data was auto-fixed.

## Summary

Command:

```powershell
node scripts/validate-encoding.js --summary-only
```

Result: FAIL because existing data still contains encoding / placeholder issues.

```json
{
  "files_checked": 439,
  "issues": 798,
  "by_type": {
    "question_mark_only": 325,
    "chinese_field_without_cjk": 403,
    "question_mark_damage": 8,
    "replacement_character": 62
  }
}
```

## Main Affected Files

| File | Issues | Notes |
|---|---:|---|
| `data/herbs/formulas.json` | 367 | Many Chinese formula fields contain literal question-mark damage. Requires source-aware formula repair, not automatic replacement. |
| `data/herbs/herb_canon_shortlist.json` | 202 | `summary_zh` placeholder text is currently English in Chinese-depth fields. This is a data-quality finding, not mojibake. |
| `data/sources/source_registry.json` | 123 | Source category/name/use labels include question-mark damage from an earlier encoding issue. |
| `data/imports/cloudtcm/*` | 62+ | Some raw/staging CloudTCM strings contain replacement characters from source/import decoding. Keep staged until reviewed. |
| `data/pathology/conditions.json` | 15 | Some western condition / TCM pattern Chinese names contain question-mark damage. |
| `data/pathology/condition_graph_expansion.json` | 15 | Same family as `conditions.json`; should be repaired in the pathology graph track. |
| `data/acupoints/361.json` | 7 | Remaining BL61-BL67 `needling.technique` question-mark strings. `361.json` is currently frozen pending Ting §A/§B decisions. |
| `data/learn/content_architecture_seed.json` | 2 | One category Chinese title has question-mark damage. |

## Notes

- Claude's D3 merge reduced `data/acupoints/361.json` findings from the previous 20 down to 7, but the BL61-BL67 technique strings still need a later approved repair.
- `data/acupoints/schema.json` and `data/clinical_cases/patient_record_system_map.json` produce small findings because English descriptor text appears under `*_zh` style keys. These may be false positives or schema/design cleanup items.
- The validator intentionally exits `1` when findings exist. Until the existing backlog is repaired or explicitly allowlisted, treat this as a guard/report step rather than a green standard gate.
- Do not mass-repair Chinese fields from memory. Repair by domain batch with source context and Ting approval where clinical/safety wording is involved.

## Recommended Repair Order

1. `data/sources/source_registry.json` because it is small and source labels are visible in the Sources workspace.
2. `data/pathology/conditions.json` and `data/pathology/condition_graph_expansion.json` together, keeping IDs stable.
3. Remaining BL61-BL67 `needling.technique` fields in `data/acupoints/361.json`, only after Ting §A/§B decisions.
4. `data/herbs/formulas.json` as part of the formula reconciliation / B1-B2 workflow.
5. `data/herbs/herb_canon_shortlist.json` placeholders after deciding whether `summary_zh` should be empty, Chinese draft, or renamed to a pending-note field.

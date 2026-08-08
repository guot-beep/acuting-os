# AcuTing OS — TCM Pattern V1 Complete Master Pack

**Prepared:** 2026-08-08  
**Purpose:** Complete the CURRENT canonical AcuTing OS TCM Pattern library as a stable V1 baseline in one implementation workstream.

## Key conclusion

American Dragon does **not** publish a clean, deduplicated master list of unique TCM Patterns.

Its public Conditions Index contains roughly 426 distinct linked condition-page targets (the index link ids span 22–447), and many pages contain multiple TCM pattern blocks. The same pattern often appears on many pages and may be worded differently by context.

Therefore:

```text
AD condition-page headings ≠ AcuTing canonical pattern universe
```

The project should NOT import every AD heading as a new canonical Pattern.

The correct one-time completion target is:

```text
CURRENT AcuTing canonical pattern.* registry
→ audit every record
→ classify every record
→ enrich every record
→ resolve formula / point links
→ preserve provenance
→ stage unmatched AD concepts separately
→ 0 unreviewed current canonical cards
→ freeze Pattern V1
```

## Files

1. `00_SCOPE_AND_DECISIONS.md`
2. `01_PATTERN_V1_CARD_SCHEMA.md`
3. `02_PATTERN_CLASSIFICATION_TAXONOMY.md`
4. `03_SOURCE_HIERARCHY_AND_FIELD_POLICY.md`
5. `04_AD_DISCOVERY_AND_EXTRACTION_POLICY.md`
6. `05_AD_SPECIAL_DIFFERENTIATION_SYSTEMS.md`
7. `06_PATTERN_V1_COMPLETENESS_GATE.md`
8. `07_SONNET5_MASTER_PROMPT.md`
9. Existing AD enrichment batches copied into `ad_batches/`

## Execution

Give the **whole folder or ZIP** to Sonnet 5.

Then paste the contents of:

`07_SONNET5_MASTER_PROMPT.md`

Sonnet should process the entire current canonical Pattern library in one workstream. It may use internal batches and checkpoints, but should not ask the user for permission after each normal batch.

## Non-goals

This project does NOT:

- redefine `cond.*`
- redefine `tdis.*`
- build `sym.*`
- redesign the clinical case workflow
- create ICD-10 mappings
- use American Dragon as a biomedical red-flag source
- import every source phrase as a canonical Pattern
- rename existing `pattern.*` IDs

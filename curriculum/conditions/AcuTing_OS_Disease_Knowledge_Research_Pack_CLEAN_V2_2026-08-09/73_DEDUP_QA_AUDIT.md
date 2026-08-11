# Deduplication and QA Audit — Clean V2

**Date:** 2026-08-09  
**Purpose:** machine-check the clean research pack before final packaging.

## Pre-final QA results

```yaml
forbidden_variant_filenames:
  pattern:
    - "(1)"
    - "(2)"
    - "UPDATED"
  found: 0

duplicate_basenames: 0
empty_markdown_files: 0
exact_duplicate_content_hash_groups: 0

western_full_research:
  candidate_ids: 93
  duplicate_candidate_ids: 0

tdis_full_research:
  identities: 75
  duplicate_full_entry_ids: 0

crosswalk:
  relation_rows: 230
  duplicate_exact_source_target_pairs: 0
```

## What "duplicate" means in this audit

### Removed / prohibited

```text
same final topic stored as:
  file.md
  file(1).md
  file(2).md
  file_UPDATED.md

identical file content under different names

same Western candidate_id authored as two full research cards

same tdis.* identity authored as two full research cards

same exact crosswalk source -> target pair repeated in multiple batches
```

### Not considered a duplicate

```text
a disease mentioned as a differential inside another disease card

a TDIS identity referenced as a relation target in multiple Western cards

a symptom candidate reused across many diseases

an index file that points to research batches without repeating their full contents

a QA / readiness / source-ledger file with a different operational purpose
```

## Structural QA rule

The numbering system is modular, not sequential-completeness numbering:

```text
00-04 foundation
05-19 Western
20-39 TCM
40-59 crosswalk/relation
60-69 endpoint/safety/identity/source
70-89 audit/readiness
90 final handoff
```

Unused numbers are reserved and are **not** missing files.

## Final packaging rule

Only the contents of the Clean V2 working set may enter the final ZIP.

Explicitly exclude:

```text
old ZIPs
old package folders
90_..._(1)/(2) variants
60/70 UPDATED variants
source-upload duplicate filenames
temporary clean_v2_work path name
```

## QA conclusion

```yaml
dedup_status: PASS
identity_duplication_status: PASS
crosswalk_exact_pair_duplication_status: PASS
empty_file_status: PASS
filename_hygiene_status: PASS
ready_for_final_packaging: true
```

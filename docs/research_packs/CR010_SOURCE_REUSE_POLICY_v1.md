# CR-010 Source Reuse Policy v1

**Do not research a condition merely because its current card is thin.**

Known prior asset families to check first:
- `00_DISEASE_KNOWLEDGE_CURRENT_STATE_AUDIT*`
- `01_WESTERN_CONDITION_GAP_MASTERLIST*`
- `03_COND_TDIS_PATTERN_RELATION_GAP_AUDIT*`
- `71_BOARD_COVERAGE_RESIDUAL_GAPS*`
- `90_INGESTION_QUEUE_AND_HANDOFF*`
- CLEAN_V2 disease knowledge packs
- current `docs/research_packs/`
- current `data/research_staging/`

The reuse-map script searches the repo conservatively:
- exact `cond.*` mention → HIGH confidence
- exact normalized English name → MEDIUM confidence
- exact normalized Chinese name → MEDIUM confidence

It does not auto-merge identities and does not mutate canonical data.

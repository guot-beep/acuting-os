# A3 JS Twins Diff Summary

Date: 2026-07-12

Task: CODEX_TASK_QUEUE A3 preview/gate for generating hand-maintained `.js` twins from their JSON sources.

## Scope

Generated targets:
- `data/tung/point_index.js` from `data/tung/point_index.json`
- `data/auricular/gb93_index.js` from `data/auricular/gb93_index.json`
- `data/auricular/gb93_worklist.js` from `data/auricular/gb93_worklist.json`

Build script changed:
- `scripts/build-data.js`

Generated runtime files refreshed by build:
- `data/generated/app_data.js`
- `data/generated/knowledge_data.js`

## Data Equivalence Check

After running `scripts/build-data.js`, each generated JS payload was evaluated and compared to its JSON source.

Result:
- `data/tung/point_index.js`: MATCH
- `data/auricular/gb93_index.js`: MATCH
- `data/auricular/gb93_worklist.js`: MATCH

No JSON data difference was detected between the `.json` source and generated `.js` twin payloads.

## Git Diff Summary

`git diff --numstat` for generated twin/build files:

| File | Added | Deleted | Notes |
| --- | ---: | ---: | --- |
| `scripts/build-data.js` | 25 | 8 | Adds shared JSON read/write helpers and twin generation. |
| `data/tung/point_index.js` | 0 | 0 | Generated output matches existing tracked content. |
| `data/auricular/gb93_index.js` | 164 | 27 | Formatting/wrapper normalization from JSON source; payload is equivalent. |
| `data/auricular/gb93_worklist.js` | 110 | 22 | Formatting/wrapper normalization from JSON source; payload is equivalent. |

`data/generated/app_data.js` and `data/generated/knowledge_data.js` were refreshed by `scripts/build-data.js`; their meaningful data payloads are unchanged apart from build output regeneration.

## Gate Decision

Ting approved continuing past the gate on 2026-07-12 ("把能做的做到極致...之後再一次性給 Claude 跟我審核").

Post-gate completion:
- `docs/DATA_MIGRATION_MAP.md` now marks the three `.js` twins as generated from their `.json` sources.
- Standard validation was run.
- This summary remains available for Claude review.

## Protected Areas

Not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- `app.js`
- `js/router.js`
- `js/knowledge.js`
- `styles.css` point-detail-mode
- `data/sources/cloudtcm_point_map.json`
- `scripts/validate-data.js` IGNORED_FIELDS
- `legacy/`

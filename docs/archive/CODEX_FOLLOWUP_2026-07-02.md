# Codex Follow-up Handoff -- 2026-07-02

## Goal

Verify Claude Phase 1 handoff and update the existing interaction audit so it
understands the new workspace router.

## Files Changed

- `scripts/validate-interactions.js`
- `docs/VALIDATION_LOG.md`
- `docs/CODEX_FOLLOWUP_2026-07-02.md`

## What Changed

- `#ws/<workspace>` links are no longer treated as missing HTML IDs.
- The interaction audit now checks that `js/router.js` exists when workspace
  routes are present.
- The audit also checks that the router contains `#ws/` and `data-workspace`
  handling.

## Why

Phase 1 changed top navigation from direct section anchors to workspace routes.
The app behavior was valid, but the old validation script still expected every
hash link to target an element ID.

## Validation Run

- `node --check app.js` -- PASS
- `node --check js/router.js` -- PASS
- `node scripts/validate-data.js` -- PASS
- `node scripts/validate-interactions.js` -- PASS

## Result

- Data validation still confirms 681 default points are deep-equal between
  legacy and current app.
- No duplicate point codes.
- Interaction audit passes with 0 failures and 0 warnings.

## Notes For Next Agent

- Git status is readable from Codex after Phase 1. No git repair was needed for
  these checks.
- Ting should still manually export browser localStorage data from the app:
  acupoint JSON and clinical cases JSON.
- Do not commit private clinical exports if they contain identifiable data.

## Phase 2 Starter -- Schema Planning Only

Goal:
- Start Phase 2 without touching search/runtime code while another agent is
  debugging search.
- Define the 361.json schema unification map before any merge script or record
  edits.

Files changed:
- `docs/DATA_MIGRATION_MAP.md`
- `data/acupoints/MIGRATION_NOTES.md`

What changed:
- Added current acupoint data counts:
  - embedded unique codes: 237
  - embedded standard-channel codes: 235
  - current 361.json records: 210
  - embedded standard codes missing from 361.json: 25
- Identified missing 361 records: KI1, KI2, KI4-KI27.
- Added explicit embedded-app-schema to canonical-361-schema field map.
- Added merge precedence and validation requirements.

Validation:
- `node scripts/validate-data.js` -- PASS
- `node scripts/validate-interactions.js` -- PASS

Important:
- No data records were merged.
- No generated files were rebuilt.
- No runtime/search/UI code was changed.

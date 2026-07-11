# Validation Log

## 2026-07-11 -- B2 formula merge + Lookup rendering

Scope:
- Applied approved formula merge into `data/herbs/formulas.json`.
- Preserved 23 content-bearing formula records.
- Added 92 draft skeleton formula records from `formula_canon_shortlist.json`.
- Rebuilt `data/generated/knowledge_data.js`.
- Updated Lookup formula renderer to show 115 formulas with search, category filter, and compact draft skeleton rows.

Commands:
- `node --check scripts/merge-formulas-preview.js` -> PASS
- `node --check js/knowledge.js` -> PASS
- `node scripts/build-data.js` -> PASS (`knowledge_data.js` formulas: 115)
- `node scripts/validate-data.js` -> PASS
- `node scripts/validate-interactions.js` -> PASS
- `node scripts/validate-relations.js` -> PASS
- `node scripts/validate-herbal-links.js` -> PASS
- `node scripts/validate-herb-canon.js` -> PASS

Result:
- `data/herbs/formulas.json`: 115 records, 23 content-bearing, 92 draft skeletons, 0 duplicate IDs.
- `validate-encoding` remains an expected backlog failure and was not used as a blocker.

## 2026-07-02 — Phase 1 (Claude)

Commands:
- `node --check app.js` → PASS
- `node --check js/router.js` → PASS
- `node scripts/extract-embedded-data.js` → 15 datasets extracted
  (starter 16, professional 45, LU 7, LI 17, ST 41, SP 19, HT 8, SI 18,
   BL 58, KI 27, auricular 29; i18n: locations 45, glossary 72,
   functions 81, patterns 139)
- `node scripts/build-data.js` → data/generated/app_data.js built
- `node scripts/validate-data.js` →
  - defaultPoints count identical: **681**
  - defaultPoints deep-equal legacy vs current: **PASS**
  - duplicate point codes: **none**
  - prefix counts: LU11 LI20 ST45 SP21 HT9 SI19 BL67 KI27 PC9 TE23 GB44
    LR14 CV24 GV28 EX2 + auricular/Tung index records
- jsdom full-page smoke test → **11/11 PASS**
  (default home; 14 sections tagged; workspace switch; #point/LU5 deep link
   renders LU5 detail; legacy anchor #caseWorkspace routes to cases;
   cards render; resultCount shows 681 total)

Not yet verified: real-browser manual pass on Windows (Ting), git repair.

## 2026-07-02 -- Codex follow-up

Reason:
- Phase 1 introduced `#ws/<workspace>` routes. The old interaction audit treated
  them as missing element IDs.

Change:
- Updated `scripts/validate-interactions.js` to exempt `#ws/` routes from normal
  ID-anchor checks and verify that `js/router.js` exists with `#ws/` and
  `data-workspace` handling.

Commands:
- `node scripts/validate-interactions.js` -> PASS
- `node scripts/validate-data.js` -> PASS

Result:
- Interaction audit: 0 failures, 0 warnings.
- Data validation: 681 default points deep-equal between legacy and current app;
  no duplicate point codes.

## 2026-07-02 -- Phase 2 starter documentation

Scope:
- Documentation only. No runtime code, generated files, or acupoint records were
  changed.

Commands:
- `node scripts/validate-data.js` -> PASS
- `node scripts/validate-interactions.js` -> PASS

Result:
- 681 default points remain deep-equal between legacy and current app.
- Interaction audit remains clean.

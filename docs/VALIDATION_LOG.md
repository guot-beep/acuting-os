# Validation Log

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

# AcuTing OS Rebuild Plan

Owner: Ting. Executors: Claude (architecture + high-risk surgery) + Codex (implementation tasks).
Updated: 2026-07-02

## North Star

AcuTing OS = private study & clinical-prep operating system.
The app can be replaced; the knowledge data must never be lost.
Data lives in `data/**.json` (source of truth). App code only renders it.

## Target Information Architecture

Top navigation = 6 workspaces, one visible at a time:

| Workspace | Contains | Sections (current ids) |
|---|---|---|
| Home 首頁 | dashboard, module launcher, roadmap (secondary) | home-hero, contentLibrary, systemRoadmap |
| Lookup 查詢 | acupoints, auricular, Tung, formulas, conditions | acupointDirectory, directoryLayout, formulaSection, conditionGraph |
| Cases 病例 | patient records, SOAP, fertility, billing scaffold | patientSystem, caseWorkspace, billingSection, fertilityWorkflow |
| Quality 品質 | database health, missing records, worklists | databaseHealth |
| Sources 來源 | source registry, citation tracking | sourceSection |
| Learn 公開 | future public English content (planning only) | learnSection |

Routing: `js/router.js`. `#ws/<name>` switches workspace; `#point/<CODE>` and all
old section anchors still work (router auto-activates the owning workspace).

## Data Pipeline (established 2026-07-02)

```
data/**/embedded/*.json   ← humans/agents edit these (source of truth)
        │  node scripts/build-data.js
        ▼
data/generated/app_data.js  ← machine-written, loaded by index.html before app.js
        ▼
app.js reads globalThis.ACUTING_APP_DATA.*
```

Never edit `data/generated/*` by hand. Never re-embed data into app.js.

## Phases

### Phase 1 — Data liberation + workspace shell  ✅ DONE (Claude, 2026-07-02)
- legacy/ freeze, extraction of 15 embedded datasets, build/validate scripts,
  app.js rewire (8,785 → 3,266 lines), workspace nav + router.
- See docs/REBUILD_HANDOFF.md for details.

### Phase 2 — Structure & real data wiring (Codex)
1. Unify acupoint schema: merge `data/acupoints/embedded/*.json` into
   `data/acupoints/361.json` as the single canonical acupoint file
   (see docs/DATA_MIGRATION_MAP.md; keep field-mapping notes in
   data/acupoints/MIGRATION_NOTES.md).
2. Move remaining small configs out of app.js: `standardChannelAudit`,
   `channelPrefixMeta`, `directoryRegionGroups`, `directoryTopics`,
   `earPointAnchors`, `earAnatomyLabelData`, `auricularZonePositions`
   → data/ + build-data.js.
3. Generate `data/tung/point_index.js` and `data/auricular/gb93_*.js` from their
   .json files inside build-data.js, then delete the hand-maintained .js copies
   (requires Ting's approval before deleting).
4. Wire `data/herbs/formulas.json` (23 records) into formulaSection as a real
   searchable list; replace scaffold HTML with an honest empty/partial state.
5. Wire `data/pathology/conditions.json` (6 records) into conditionGraph.
6. Wire `data/sources/source_registry.json` (19 sources) into sourceSection.
7. Quality workspace reads `data/audits/missing_report.json` live.
8. Home dashboard: trim to search + module launcher + next-task card.

### Phase 3 — Professional pages & public split (Codex, after Phase 2)
1. Formula / condition detail pages (like point detail pages).
2. Cases workflow polish: timeline view, fertility sub-flow, billing scaffold.
3. Content status model everywhere: draft / index_only / needs_source_review /
   source_checked / private_clinical_note / public_ready.
4. Learn workspace: public export rules; only source_checked/public_ready
   content may be exported; no private notes in exports.
5. Complete PC/TE/GB/LR/CV/GV point content (data work, channel by channel).
6. Mobile: one-workspace-at-a-time UX refinement.

## Safety Rules (unchanged)
- Never delete data files without Ting's explicit approval.
- Never remove fields without a migration plan written in DATA_MIGRATION_MAP.md.
- Keep private clinical notes separated from public Learn content.
- No identifiable patient information anywhere.
- After every change: run scripts/validate-data.js, update
  docs/REBUILD_HANDOFF.md and docs/VALIDATION_LOG.md.

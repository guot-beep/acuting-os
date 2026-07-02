# AcuTing OS Architecture Audit

Date: 2026-07-01

Purpose: turn AcuTing OS from a growing collection of useful pieces into a coherent product system. This document is the decision map for what should exist, what should be merged, what should be visually downgraded, and what should become a future module.

## Core Diagnosis

The current project feels confusing because several different products are living on one page:

- A bilingual acupuncture atlas.
- A clinical case notebook.
- A data-quality dashboard.
- A public English education site draft.
- A formula/herb/pathology knowledge graph.
- A future billing and insurance documentation workflow.
- A roadmap for work that is not ready yet.

All of these are valid, but they cannot share the same visual priority. The main architectural problem is not lack of content. The problem is unclear hierarchy.

## Product North Star

AcuTing OS should become a private professional operating system for study and clinical preparation, with a clean path to later publish selected English content.

Primary jobs:

1. Fast lookup: find acupoints, auricular points, Tung points, formulas, conditions, and sources.
2. Clinical recording: enter de-identified patient cases and SOAP notes.
3. Relationship mapping: connect western conditions, TCM patterns, points, formulas, medications, safety flags, and fertility workflow stages.
4. Quality control: track source status, missing fields, draft records, and public-readiness.
5. Public handoff: separate private bilingual notes from future AcuTing Learn English pages.

## Recommended Information Architecture

### Level 1: Main Navigation

Keep the top navigation small. These should be daily-use destinations:

- Dashboard
- Lookup
- Cases
- Graph
- Quality
- Sources

Do not put every future idea in the top navigation. Roadmap, public site planning, and billing scaffolds should be accessible but visually secondary.

### Level 2: Lookup

Lookup should contain the searchable knowledge database.

Modules:

- Standard Acupoints
- Auricular Points
- Master Tung
- Formulas
- Herbs
- Conditions
- Sources

Current issue:
Acupoints, auricular, Tung, formulas, and conditions currently appear in separate areas and also as roadmap cards. This creates duplicate architecture.

Decision:
Use one `Lookup` workspace with tabs or filters. Auricular and Tung should be filtered views inside the acupoint directory unless they become large enough to justify their own dedicated pages.

### Level 3: Clinical

Clinical should be separated from study lookup.

Modules:

- Patient Records
- SOAP Notes
- Treatment Timeline
- Fertility Workflow
- Billing Documentation Scaffold

Current issue:
Patient Records, Cases, Fertility, and Billing are spread across homepage cards, sections, and hot links.

Decision:
Make one `Clinical` or `Cases` workspace. Billing and fertility can be sub-sections, not top-level peers.

### Level 4: Quality

Quality is not daily lookup. It is the project management layer.

Modules:

- Database Health
- Missing Standard Points
- Missing English Locations
- Missing Needling/Safety
- GB93 Worklist
- Source Review Queue
- Public-Ready Queue

Current issue:
Database Health competes visually with learning and clinical modules.

Decision:
Keep Database Health, but make it a utility dashboard. It should not look like a primary content module.

### Level 5: Public

Public content is future-facing and must be separated from private notes.

Modules:

- AcuTing Learn
- Public English Acupoint Articles
- Public Formula Articles
- Public Source Registry
- Handoff Notes for acuting.com

Current issue:
Private bilingual content and public English planning are visually mixed.

Decision:
Public content should be a `Public` or `Publish` workspace, or a roadmap subsection. It should never imply that draft/index-only content is ready for clinical or public use.

## Current Section Decisions

| Current Section | Keep | Change |
|---|---:|---|
| Hero Dashboard | Yes | Keep search-first, reduce secondary status clutter later. |
| Content Library | Yes | Convert into true module launcher; avoid duplicating Roadmap. |
| Database Health | Yes | Move visually under Quality. It should guide work, not compete with Lookup. |
| Roadmap | Yes, secondary | Keep compact. Never duplicate actual modules. |
| Patient System | Yes | Merge with Case Workspace as one Clinical area over time. |
| Billing Section | Yes, submodule | Keep under Clinical, not equal to core lookup. |
| Fertility Workflow | Yes, submodule | Belongs under Clinical + Graph, not a primary standalone module. |
| Formula Section | Yes | Needs real formula records and search/filter later. |
| Condition Graph | Yes | Needs graph model and condition detail pages later. |
| Learn Section | Yes, secondary | Mark as public planning, not active lookup. |
| Sources | Yes | Keep source registry; later add source status fields. |
| Case Workspace | Yes | Should become the main Clinical workspace. |
| Acupoint Directory | Yes | Core product. Continue improving list/detail model. |

## Interaction Rules

Every clickable item must be one of four types:

1. Navigation: moves to a real section or page.
2. Filter shortcut: applies a visible filter chip.
3. Action: opens a dialog, exports/imports, copies, saves, or changes state.
4. External reference: opens a source link in a new tab.

Anything else should not look clickable.

Required UI feedback:

- Navigation must show the destination with target highlight or active state.
- Filter shortcuts must show removable filter chips.
- Actions must show success/failure feedback.
- Detail-page navigation must preserve a clear return path.

## Data Architecture

The project should use stable entities and relationships instead of one-off text blocks.

Core entities:

- `Acupoint`
- `AuricularPoint`
- `TungPoint`
- `Formula`
- `Herb`
- `WesternCondition`
- `TraditionalDisease`
- `TcmPattern`
- `Medication`
- `SafetyFlag`
- `Source`
- `PatientCase`
- `SoapNote`
- `TreatmentSession`

Core relationships:

- Acupoint -> Pattern
- Acupoint -> Condition
- Acupoint -> Formula
- Formula -> Pattern
- Formula -> Herb
- Formula -> SafetyFlag
- WesternCondition -> TraditionalDisease
- WesternCondition -> TcmPattern
- PatientCase -> WesternCondition
- PatientCase -> TcmPattern
- SoapNote -> Acupoint
- SoapNote -> Formula
- SoapNote -> Medication
- Source -> Entity

## Content Status Model

Every knowledge record should eventually have:

- `draft`
- `index_only`
- `needs_source_review`
- `source_checked`
- `student_note`
- `private_clinical_note`
- `public_ready`

Public pages should only use `source_checked` or `public_ready` content.

## Visual System Direction

The visual design should become quieter and more operational.

Rules:

- Lookup pages: dense, searchable, filter-first.
- Detail pages: article-like, source-aware, with clear status strip.
- Clinical pages: utilitarian, form-first, no decorative cards.
- Quality pages: dashboard style, counts and work queues.
- Roadmap/public planning: visually secondary.

Avoid:

- Multiple card grids that feel equivalent.
- Future-roadmap cards mixed with active tools.
- Decorative sections that do not change user workflow.
- Large repeated explanations on the main path.

## Mobile Architecture

Mobile should prioritize:

1. Search.
2. Module switcher.
3. Current state.
4. Results.
5. Detail page.

Mobile risks:

- Too many stacked sections.
- Tables becoming unreadable.
- Quicknav pills becoming long.
- Clinical forms competing with reference content.

Decision:
Mobile should eventually use one visible workspace at a time. Long homepage scrolling is acceptable for now, but not as the final architecture.

## Rebuild Strategy

Do not rewrite the whole app at once. Use staged cleanup.

### Phase 1: Trust

Goal: nothing clickable feels fake.

Tasks:

- Keep expanding `scripts/validate-interactions.js`.
- Finish point detail action audit.
- Ensure every module card is navigation, filter, action, or external reference.
- Add empty states for modules that are scaffolds.

### Phase 2: Structure

Goal: reduce one-page sprawl.

Tasks:

- Group sections into `Lookup`, `Clinical`, `Quality`, `Public`.
- Convert roadmap/public planning into a secondary area.
- Decide whether Billing and Fertility stay as sections or move into Case Workspace.

### Phase 3: Data Model

Goal: make content maintainable.

Tasks:

- Formalize JSON schemas by entity.
- Add status fields.
- Add source fields consistently.
- Add relationship records instead of repeated prose.

### Phase 4: Professional Pages

Goal: make each major object have a real page.

Tasks:

- Acupoint detail pages.
- Formula detail pages.
- Condition detail pages.
- Case detail pages.
- Source detail or registry pages.

### Phase 5: Public Split

Goal: prepare acuting.com without contaminating private notes.

Tasks:

- Define public export rules.
- Hide private notes.
- Require source-checked/public-ready status.
- Create English-only public preview.

## Immediate Next Decisions

1. Make `Lookup`, `Clinical`, `Quality`, and `Public` the mental model for all future UI.
2. Continue fixing interactions before adding more content.
3. Treat formulas and conditions as database modules, not static info sections.
4. Keep public content clearly separated from private study/clinical notes.
5. Use `PROJECT_LOG.md` as the daily work memory and this file as the architecture decision map.


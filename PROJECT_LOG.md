# AcuTing OS Project Log

Use this file as the first-read context before each daily optimization session. After each session, add a new entry with date, scope, files changed, validation, commit hash, and next task.

## Daily Operating Rule

1. Read `PROJECT_LOG.md`.
2. Check git status.
3. Make one coherent source-aware improvement batch.
4. Validate JS/JSON/HTML as relevant.
5. Commit the change.
6. Add a new log entry.

## Fixed Weekly Optimization Schedule

- Monday: standard 361 acupoints, missing content filters, English locations, needling, safety.
- Tuesday: auricular GB93 indexing, candidate verification, external visual links.
- Wednesday: Master Tung index, zone organization, source and visual links.
- Thursday: formulas, herbs, patterns, contraindications, English public drafts.
- Friday: pathology graph, western medications, fertility workflows, TCM/biomed links.
- Saturday: clinical case notebook, SOAP templates, billing/documentation workflow.
- Sunday: UI/mobile polish, source registry, validation, backlog planning.

## Log Entries

### 2026-07-01

Scope: Hash-jump destination context and stale duplicate CSS cleanup.

Changes:
- Added visible `:target` highlighting for major section destinations so card/hash jumps provide clear visual feedback.
- Added `scroll-margin-top` to major sections, the acupoint search panel, and the clinical case workspace so section headings are not hidden by sticky navigation after jumps.
- Removed stale CSS for the deleted duplicate `public-architecture` and `tung-zone-section` planning sections.
- Updated `scripts/validate-interactions.js` to require target-context CSS, scroll offset support, and absence of the old duplicate section classes.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that adds hash-jump destination context.

Next:
- Continue checking whether dense modules need a more precise sub-navigation layer, especially Formula, Condition Graph, Source Registry, and Case Workspace.

### 2026-07-01

Scope: Dynamic main module active state.

Changes:
- Removed the hard-coded `active` state from the AcuTing OS top module chips.
- Added dynamic module navigation state derived from the current URL hash.
- Point pages and acupoint workspace now highlight Acupuncture; case workspace highlights Patient Records; fertility workflow maps to Conditions.
- Added `aria-current="page"` to the active module chip for clearer navigation semantics.
- Updated `scripts/validate-interactions.js` to fail if module chips hard-code active state or lose the dynamic active-state hooks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that fixes dynamic module navigation state.

Next:
- Continue the interaction audit by checking secondary module cards and plain hash jumps for visible section context, especially dense sections where a jump alone can feel like a broken or fake action.

### 2026-07-01

Scope: Visible acupoint filter state.

Changes:
- Added an `activeFilterSummary` area under the acupoint search filters.
- The directory now shows active search, channel, region, pattern, body-group, and topic filters as clearable chips.
- Added a clear-all control so topic shortcuts such as Auricular Index and Master Tung Index are visible and reversible.
- Added mobile styling so filter chips wrap into readable full-width rows on small screens.
- Updated `scripts/validate-interactions.js` to require the visible active-filter UI and clear-filter hooks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- `430c19f Show active acupoint filters`

Next:
- Continue reducing fake or unclear interactions by auditing remaining clickable cards for visible state changes, especially module cards that apply hidden filters or jump to dense sections.

### 2026-07-01

Scope: Push workflow validation gate.

Changes:
- Updated `push-acuting.ps1` so the desktop/GitHub sync workflow runs validation before staging, committing, and pushing.
- Added Node.js discovery for the bundled Codex runtime Node first, then PATH `node`.
- The push workflow now runs `node --check app.js` and `scripts/validate-interactions.js`.
- Updated `README.md` to document the validation gate.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.
- `push-acuting.ps1` PowerShell parse check passed.

Commit:
- This entry is part of the commit that adds the push validation gate.

Next:
- Continue UI quality work by adding visible active-filter labels in the acupoint directory.

### 2026-07-01

Scope: Interaction contract validation script.

Changes:
- Added `scripts/validate-interactions.js` as a reusable local audit for fake buttons, broken hash links, invalid directory shortcuts, missing patient action-card handlers, removed duplicate section IDs, and acupoint detail-page hooks.
- Documented the validation command in `README.md`.
- Updated `DESIGN_OPTIMIZATION_PLAN.md` to reference the concrete validation script.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed.
- Interaction audit result: 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that adds the interaction validation script.

Next:
- Add the interaction audit to future update workflow before every UI/navigation commit.

### 2026-07-01

Scope: Product design critique and optimization plan.

Changes:
- Added `DESIGN_OPTIMIZATION_PLAN.md` as the long-term design and architecture direction for AcuTing OS.
- Defined current UX, information architecture, visual hierarchy, mobile, bilingual/public-mode, and content-status problems.
- Added Codex-specific optimization methods: product design audit loop, interaction contract audit, knowledge schema audit, content-mode separation, and mobile-first regression pass.

Validation:
- Product Design user-context preflight was run; no saved Product Design context exists yet.
- This was a planning/documentation update, not an implementation change.

Commit:
- This entry is part of the commit that adds the design optimization plan.

Next:
- Turn the interaction contract audit into a reusable local validation script so fake buttons and broken shortcuts are caught automatically.

### 2026-07-01

Scope: Patient action-card behavior cleanup.

Changes:
- Converted the Patient Record `Treatment Tracking` card from a plain `#caseWorkspace` jump into a handled action via `patientTrackLink`.
- The tracking card now clears case search, refreshes the case list, and scrolls to the clinical case workspace.
- Added a validation audit that flags patient action cards pointing to `#caseWorkspace` without a matching JS handler.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 35 internal links resolve to existing IDs.
- Directory-topic shortcut audit passed for `auricular_index` and `tung_index`.
- Patient action-card audit passed: `patientNewCaseLink`, `patientSoapLink`, and `patientTrackLink` all have handlers.

Commit:
- This entry is part of the commit that removes the remaining fake patient tracking action.

Next:
- Audit remaining non-patient cards and decide whether each card is a true navigation action, a true filter action, or should be downgraded to a non-clickable information card.

### 2026-07-01

Scope: Duplicate architecture reduction.

Changes:
- Removed the top-level `Public Learn` navigation item so planning content no longer competes with daily working modules.
- Replaced the large `Public Architecture` and `Master Tung Zone` sections with one compact `systemRoadmap` planning section.
- Kept Roadmap links functional: Public Learn, Master Tung filter, Auricular filter, Formulas, Conditions, and Sources.
- Added `roadmap-card` styling and responsive behavior.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 35 internal links resolve to existing IDs.
- Directory-topic shortcut audit passed: `auricular_index` and `tung_index` resolve to known JS topic IDs.
- Confirmed old `publicArchitecture` and `tungZoneSection` IDs are no longer present.

Commit:
- This entry is part of the commit that reduces duplicate homepage architecture.

Next:
- Audit visible text encoding and card hierarchy. Several strings still display as mojibake in PowerShell output; browser rendering should be checked directly before making broad text edits.

### 2026-07-01

Scope: Homepage and module-entry cleanup.

Changes:
- Replaced vague/fake module links with direct module targets for Formulas, Conditions, Billing, and Billing quick access.
- Added a real `billingSection` with documentation workflow cards instead of sending Billing links to a hidden/self-referential anchor.
- Converted Auricular and Master Tung entry cards into true directory-topic shortcuts using `data-directory-topic-link`.
- Removed the obsolete `data-library-search` shortcut handler after all related HTML shortcuts were removed.
- Kept acupoint detail-mode cleanup centralized through `clearPointDetailHash()`.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 36 internal hash links resolve to existing IDs.
- Confirmed no remaining `data-library-search` shortcuts and no stale `#formulaLibrary` or `#pathologyLibrary` links.
- Confirmed `billingSection` exists and directory-topic shortcuts are registered for `auricular_index` and `tung_index`.

Commit:
- This entry is part of the commit that cleans homepage/module navigation.

Next:
- Continue by auditing the visible wording and card hierarchy: remove or merge modules that duplicate the same purpose, especially Content Library vs Public Architecture vs Tung Zone.

### 2026-07-01

Scope: Acupoint navigation and layout bug fix.

Changes:
- Split the acupoint area into two explicit states: directory/list mode and individual point article mode.
- Individual point pages now appear only when the URL uses `#point/{code}`.
- Added a back-to-directory control on individual acupoint pages.
- Fixed hash navigation so leaving a point page returns the UI to list mode.
- Updated top navigation targets so Auricular filters the acupoint directory, Pathology goes to the condition graph, Formulas goes to the formula section, and Billing goes to a real documentation anchor.
- Added missing `pathologyAnchor` and `billingAnchor` targets.
- Adjusted desktop and mobile CSS to reduce top navigation overflow and prevent point sidebars from overlapping article content.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: all non-point hash links resolve to existing page IDs.
- Playwright package was available, but browser executable was not installed, so screenshot automation could not run in this environment.

Commit:
- This entry is part of the commit that fixes acupoint navigation and layout reliability.

Next:
- Continue reducing duplicate content architecture: audit each homepage/library card and decide whether it should be a real module, a filter shortcut, or removed.

### 2026-07-01

Scope: GitHub Pages preparation.

Changes:
- Added `.nojekyll` so GitHub Pages serves AcuTing OS as a static app without Jekyll processing.
- Updated `DEPLOYMENT.md` with the expected Pages URL and exact GitHub Pages settings.

Validation:
- Confirmed the repo root contains `index.html`.
- Confirmed local repository is connected to `https://github.com/guot-beep/acuting-os.git`.
- GitHub CLI is not installed in this environment, so Pages must be enabled from GitHub Settings unless another authenticated tool is added later.

Commit:
- This entry is part of the commit that prepares GitHub Pages.

Next:
- Enable GitHub Pages in GitHub: Settings > Pages > Deploy from branch > main > root.

### 2026-07-01

Scope: Persistent project log workflow.

Changes:
- Added this `PROJECT_LOG.md` file as the first-read context for future AcuTing OS work sessions.
- Captured the fixed weekly optimization schedule so daily work can continue without re-discovering project direction.
- Summarized the current repository state and recent acupoint, auricular, Master Tung, source-link, UI, GitHub, and clinical-note work.
- Updated the daily automation instruction to read this log first and append a session entry after future optimization work.

Validation:
- Confirmed the log contains operating rules, weekly schedule, current state, and historical entries.

Commit:
- This entry is part of the commit that creates the persistent project log.

Next:
- Continue the weekly plan from the current day, then append a new entry with changes, validation, commit, and next task.

### 2026-07-01

Scope: Daily automation structure.

Changes:
- Updated the daily heartbeat automation to follow a fixed weekly optimization schedule.
- Established the rule that each session should be practical, source-aware, validated, and committed.

Validation:
- Automation updated in Codex app.

Commit:
- Not applicable; automation update is stored in the Codex app, not the repo.

Next:
- Add a persistent repo log so future sessions can read prior work before changing files.

### 2026-06-30

Scope: GB93 auricular indexing.

Changes:
- Verified acupun GB93 pages for `AT1`, `AT2`, and `AT3`.
- Promoted verified antitragus GB93 records into `data/auricular/gb93_index.json` and `.js`.
- GB93 coverage increased from `10/93` to `13/93`.
- Removed promoted candidates from `data/auricular/gb93_worklist.json` and `.js`.
- Updated app parsing so GB93 records can use `pinyin` and aliases.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_index.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.
- HTML still has no embedded images or canvas.

Commit:
- `575c7cf Promote verified GB93 antitragus points`

Next:
- Continue GB93 verification. `SC1-SC5` returned incomplete source fields, so prioritize `CO1-CO3` or `HX1-HX7`.

### 2026-06-30

Scope: GB93 promotion workflow.

Changes:
- Added GB93 promotion checklist to the worklist files.
- Displayed promotion checklist in the Database Health GB93 panel.
- Checklist requires confirmed code, Chinese name, English name or translation, auricular zone, visual URL, and `index_only` status until clinical details are checked.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.
- HTML still has no embedded images or canvas.

Commit:
- `3af16b5 Add GB93 promotion checklist`

Next:
- Use the checklist before promoting each GB93 candidate into `gb93_index`.

### 2026-06-29

Scope: GB93 verification links.

Changes:
- Added `GB93 Candidate Links / 耳穴候選查證` panel to Database Health.
- Rendered candidate codes as external acupun links.
- Kept candidates separate from formal point records.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- HTML still has no embedded images or canvas.

Commit:
- `eda1e62 Add GB93 candidate verification links`

Next:
- Open candidate links and promote only source-verified records.

### 2026-06-27

Scope: GB93 worklist.

Changes:
- Added `data/auricular/gb93_worklist.json` and `.js`.
- Created 25 candidate codes for next GB93 verification batch.
- Added Database Health display for GB93 next batch.
- Added GB93 verification queue text.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.

Commit:
- `61e5540 Add GB93 verification worklist`

Next:
- Promote verified candidates into `gb93_index`.

### 2026-06-26

Scope: GB93 coverage tracking.

Changes:
- Added `expected_total: 93` and `current_indexed` to GB93 index files.
- Added `GB93 coverage` card to Database Health.
- Added `GB93待校對 / GB93 Drafts` directory filter.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_index.js` syntax check passed.
- JSON parse checks passed.

Commit:
- `8286bbf Track auricular GB93 coverage`

Next:
- Increase coverage beyond `10/93` through source-verified promotion.

### Earlier Project State Summary

Completed before this log file:
- Built AcuTing OS as a static HTML/CSS/JS app.
- Added private GitHub setup and desktop push/open shortcuts.
- Added individual point routing via `#point/CODE`.
- Added 361 standard-channel placeholder coverage so every standard point has a page.
- Added Master Tung public navigation index with 277 index-only records.
- Added initial auricular records and GB93 scaffold.
- Removed embedded image/canvas dependency and switched to external visual reference links.
- Added source registry, data quality dashboard, missing-content filters, visual coverage, and mobile-friendly layout improvements.
- Added clinical case/SOAP/billing/pathology/herbal data architecture seeds.

Current repo state as of this log:
- Local `main` is ahead of `origin/main` by multiple commits. Push with the desktop shortcut when ready.
- GB93 index is `13/93`.
- Master Tung index has 277 index-only records.
- Standard 361 point pages exist, but many are placeholders or need source review.

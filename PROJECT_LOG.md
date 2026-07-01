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

# AcuTing OS Design Optimization Plan

Date: 2026-07-01

Purpose: define the UX, information architecture, visual design, and Codex workflow standards for turning AcuTing OS from a rough knowledge dump into a professional clinical learning database.

## Product Goal

AcuTing OS should feel like a professional bilingual clinical reference system, not a long web page with many similar cards.

Primary users:
- A student preparing for NCCAOM.
- A soon-to-be clinician recording de-identified cases.
- A future public English content owner preparing AcuTing Learn.

Primary tasks:
- Find an acupoint quickly.
- Open a reliable individual point page.
- Filter by channel, body region, topic, auricular points, or Master Tung records.
- Record and review SOAP/case notes.
- Connect conditions, formulas, medications, safety cautions, and treatment workflows.
- Track what is source-checked versus draft/index-only.

## Current Design Problems

### 1. Information Architecture Is Still Too Flat

Problem:
The app has many sections at the same visual level: Library, Database Health, Roadmap, Patient Records, Billing, Fertility, Formulas, Conditions, Sources, Acupoint Directory. Some are daily-use modules, some are planning notes, and some are data-quality dashboards.

Why it matters:
A knowledge database must separate daily lookup, clinical recording, content management, and future planning. When everything looks equally important, the user cannot tell where to start.

Direction:
Use four primary zones:
- `Lookup`: Acupoints, auricular, Master Tung, formulas, conditions.
- `Clinical`: cases, SOAP, fertility workflow, billing documentation.
- `Quality`: database health, missing fields, source status.
- `Roadmap`: public English site, future content layers, architecture notes.

### 2. Clickable Cards Need Clear Contracts

Problem:
Some cards used to look like buttons but only jumped to a nearby area or performed vague search behavior. This weakens trust.

Current progress:
- Acupoint cards now open `#point/{code}` pages.
- Patient action cards now have explicit handlers.
- Auricular and Tung cards now apply topic filters.
- Billing now has a real section.

Remaining standard:
Every clickable card must be one of:
- Navigation: goes to a real section.
- Filter shortcut: applies a visible filter state.
- Action: opens a dialog, starts a form, exports/imports, or changes state.

If a card only explains future plans, it should be a non-clickable article card.

### 3. Acupoint Browsing Needs Stronger State Clarity

Problem:
The app has directory filters, detail pages, cards, and historical body/ear map logic. If these are shown together, the interface feels crowded and fake.

Direction:
- Directory mode: show filters and card list.
- Point detail mode: show one article page, related points, pairings, source links.
- Quality mode: show missing fields and source-review queues.

Next UI goal:
Add visible state labels:
- `Directory`
- `Point page`
- `Filtered: Auricular`
- `Filtered: Master Tung`
- `Draft/index-only`

### 4. Visual Hierarchy Needs More Discipline

Problem:
Many cards share similar weight, border, spacing, and typography. The user sees many boxes but not a clear path.

Direction:
- Primary actions should be larger and fewer.
- Secondary planning content should be visually quieter.
- Data-quality and roadmap sections should not compete with lookup/workflow modules.
- Use tighter, utilitarian dashboard styling for clinical tools.

Recommended homepage hierarchy:
1. Global search.
2. Six primary modules: Acupoints, Cases, Conditions, Formulas, Billing, Sources/Quality.
3. Recent/next work status.
4. Roadmap collapsed or visually secondary.

### 5. Bilingual and Public Modes Need Separate Rules

Problem:
The app has a bilingual private mode and future English public mode, but the visible UI still mixes them conceptually.

Direction:
- Private bilingual mode: study notes, draft records, source-review labels, Chinese/English parallel text.
- Public English mode: only source-checked, rewritten, publication-safe content.

Design rule:
Never let public mode imply that draft/index-only content is clinically authoritative.

### 6. Content Status Needs To Be Visible Near Every Record

Problem:
Users need to know whether a point is source-checked, placeholder, draft, index-only, public-ready, or private-only.

Direction:
Every detail page should show a compact status strip:
- Source status.
- Last reviewed.
- Missing fields.
- Visual link available.
- Safety notes available.

This is more important than decorative visuals.

### 7. Mobile Needs Task-First Layout

Problem:
Mobile users need lookup and clinical entry. Long stacked sections can become hard to use.

Direction:
- Sticky bottom or top compact module navigation.
- Search-first layout.
- Cards should be scannable with code, Chinese name, English name, status, and one action.
- Detail pages should collapse related points below the main article.

### 8. Text Encoding And Copy Quality Need A Pass

Problem:
Some terminal output shows mojibake. Browser rendering must be checked before broad text edits, but the risk is real.

Direction:
- Verify actual browser rendering.
- If mojibake appears in browser, normalize files to UTF-8 and repair visible strings section by section.
- Do not rewrite all clinical content in one large batch.

## Recommended Codex Workflow For This Type Of Website

### Method 1: Product Design Audit Loop

Use when judging UX, navigation, visual hierarchy, or accessibility.

Process:
1. Capture screenshots of key states.
2. Audit task entry, information architecture, hierarchy, interactions, trust, accessibility, and responsive layout.
3. Turn findings into a prioritized fix list.
4. Implement one coherent batch.
5. Validate with link audit, JS check, and screenshots if available.
6. Update `PROJECT_LOG.md`.

Best for:
- Homepage redesign.
- Acupoint detail page layout.
- Mobile usability.
- Removing fake buttons.

### Method 2: Interaction Contract Audit

Use when the user says buttons or links feel fake.

Rules:
- Every clickable element must have a clear contract.
- `href="#section"` must point to an existing section.
- `data-*` shortcut must have a JS handler.
- Action cards must either open a dialog, apply a filter, change state, or navigate to a real module.

Automated checks:
- Hash-link target audit.
- `data-directory-topic-link` topic audit.
- Action-card handler audit.

### Method 3: Knowledge Schema Audit

Use for database quality.

Check each record type:
- Required fields.
- Draft/source status.
- Missing location.
- Missing English location.
- Missing technique.
- Missing safety.
- Missing source.
- Missing visual reference link.

Best for:
- 361 standard points.
- GB93 auricular points.
- Master Tung index records.
- Formulas and herbs.

### Method 4: Content Mode Separation

Use before public release.

Rules:
- Private bilingual mode can show draft/index-only records.
- Public English mode should hide or clearly label unreviewed content.
- Public content must be rewritten and source-aligned.

Best for:
- Future acuting.com handoff.
- GitHub Pages preview.
- AcuTing Learn English content.

### Method 5: Mobile-First Regression Pass

Use after layout changes.

Check:
- 390px width.
- No horizontal overflow.
- Buttons large enough to tap.
- Search and filters visible.
- Detail page readable.
- Dialogs fit screen.

## Suggested Optimization Roadmap

### Phase 1: Trust And Navigation

Goal:
No fake buttons, no broken links, no confusing duplicate sections.

Tasks:
- Finish card/action contract audit for all clickable cards.
- Add visible active filter labels.
- Add a simpler top navigation structure.
- Add automated local validation script.

### Phase 2: Professional Knowledge Browser

Goal:
Make acupoint lookup feel like a real atlas/database.

Tasks:
- Improve acupoint directory scanning.
- Add status strips to point pages.
- Add related-point and pairing quality labels.
- Add source and visual-link availability indicators.

### Phase 3: Clinical Notebook

Goal:
Make case/SOAP entry usable in clinic training.

Tasks:
- Improve case list and empty states.
- Add visit timeline clarity.
- Add charting completeness checklist.
- Add billing documentation readiness flags.

### Phase 4: Data Quality Dashboard

Goal:
Make daily content improvement measurable.

Tasks:
- Show missing-field counts by system.
- Prioritize next work queue.
- Add source-review and public-ready status.
- Add validation script output summary.

### Phase 5: Public English Layer

Goal:
Prepare clean public content without mixing private study notes.

Tasks:
- Separate private/public content visibility.
- Add publication status fields.
- Add English-only page preview.
- Create public handoff checklist for acuting.com.

## Design Standards Going Forward

- Fewer primary modules.
- Every clickable thing has a real behavior.
- Draft content is visibly marked.
- Clinical tools look utilitarian, not decorative.
- Knowledge pages prioritize scan speed.
- External visual links are preferred over generated diagrams.
- Mobile layout is required, not optional.
- Every optimization session updates `PROJECT_LOG.md`.


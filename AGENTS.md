# Repository Guidelines

## Project Purpose

This project is AcuTing OS, a private/static TCM and acupuncture learning web app for Ting. It is for study, review, acupuncture point lookup, herbs, pathology, clinical cases, billing references, and future learning tools.

This is separate from any public-facing AcuTing clinic/brand website. Do not treat this repo as a marketing website.

The priority is accuracy, organization, fast lookup, bilingual study support, and safe preservation of study data.

## Project Structure & Module Organization

This is a static AcuTing OS web app. The main entry point is `index.html`, with behavior in `app.js` and styling in `styles.css`. Structured content lives under `data/`, grouped by domain: `data/acupoints/`, `data/herbs/`, `data/pathology/`, `data/clinical_cases/`, `data/billing/`, and related reference layers. Validation tooling is in `scripts/`. Project notes, deployment guidance, and handoff docs are kept in top-level Markdown files such as `README.md`, `DEPLOYMENT.md`, and `PROJECT_LOG.md`.

## Build, Test, and Development Commands

No build step is required. Open `index.html` directly in a browser for local use.

Run the interaction audit after navigation, filter, card, or acupoint-detail changes:

```powershell
node scripts/validate-interactions.js
```

If the bundled Codex Node runtime is needed, use the path documented in `README.md`. For one-click validation, commit, and push, run `push-acuting.bat` from the project folder.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and vanilla JavaScript. Keep indentation consistent with nearby code, and prefer descriptive camelCase names for JavaScript variables and functions. Use kebab-case for CSS classes and stable, readable `id` anchors because navigation depends on hash links. Data files should remain valid JSON and follow existing field names such as `code`, `nameZh`, `nameEn`, `location`, `functions`, `cautions`, and `sources`.

## TCM Study Content Rules

When working with TCM, acupuncture, herbs, pathology, or clinical case content:

- Preserve important study details.
- Keep Chinese and English terminology when available.
- Do not simplify away board-relevant information.
- Do not invent point facts, herb facts, indications, cautions, or case details.
- If information is uncertain, mark it as needing verification instead of guessing.
- Separate TCM theory from Western medical facts when relevant.
- Maintain existing field names and data patterns unless a migration plan is approved.

## Data Safety Rules

The `data/` folder is the knowledge base of this app. Treat it as high-value study data.

Do not:

- delete JSON records
- rename existing fields
- restructure data files
- remove bilingual fields
- overwrite clinical case content
- merge or split data files
- change IDs, anchors, or codes used by navigation/search

unless Ting explicitly approves.

Before any large data migration, propose:

1. What will change
2. Why it is needed
3. Backup plan
4. Validation plan
5. Rollback plan

## Development Workflow for Codex

Before editing important files, especially `app.js`, `styles.css`, `index.html`, or anything under `data/`:

1. Inspect the relevant files.
2. Explain the current structure in simple language.
3. Propose a small safe plan.
4. Wait for approval before large changes.

When editing:

- Make small, reviewable changes.
- Preserve existing working functionality.
- Avoid unnecessary dependencies.
- Do not deploy or push unless explicitly approved.
- Run `node scripts/validate-interactions.js` after navigation, filter, card, or acupoint-detail changes.

## Refactor Rules

This project may need systematic refactoring over time because `index.html`, `app.js`, and `styles.css` may grow too large.

Refactoring must be done gradually and safely.

Before refactoring:

1. Inspect current structure.
2. Identify the specific maintainability problem.
3. Explain the proposed change.
4. Classify risk as low, medium, or high.
5. Wait for Ting's approval before medium or high-risk changes.

Rules:

- Do not rewrite the whole app in one pass.
- Do not introduce a framework unless explicitly approved.
- Do not split files unless the new structure is clearly explained.
- Preserve all existing navigation, hash links, search, filters, cards, and detail views.
- Run `node scripts/validate-interactions.js` after any navigation, filter, card, or acupoint-detail change.
- After each refactor phase, provide a Handoff Summary.

Preferred refactor phases:

1. Clean comments, remove duplication, and organize sections.
2. Separate reusable rendering logic.
3. Split large JavaScript logic into small modules if safe.
4. Improve data validation and schemas.
5. Only consider larger architecture changes after the app is stable.

Never treat refactoring as cosmetic. Refactoring should make the project easier to maintain without breaking study functionality.

## Testing Guidelines

The primary automated check is `scripts/validate-interactions.js`. It verifies internal hash links, directory topic shortcuts, case-workspace handlers, quick navigation anchors, target styling hooks, and acupoint detail hooks. Run it before committing UI, navigation, or data-linking changes. When editing JSON data, also open the app and spot-check search, filters, and detail views for the changed records.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects, for example `Add dense module quick navigation` or `Show active acupoint filters`. Keep commit messages concise and focused on the user-visible change. Pull requests should include a brief summary, validation results, affected areas, and screenshots for visual UI changes. Link related issues or project notes when applicable.

## Security & Configuration Tips

Do not commit identifiable patient information, exported real case files, insurance data, phone numbers, addresses, or full patient names. Use de-identified `patient_code` values only. Keep private AcuTing OS clinical notes separate from future public AcuTing Learn content.

## Required Handoff Summary

At the end of every meaningful task, provide:

1. Files changed:
2. What changed:
3. Why it changed:
4. Validation run:
5. What Ting should manually test:
6. Risks or things to watch:
7. Next recommended action:
8. Should this be added to Daily Handoff or Project Dashboard?

If a task is not completed, clearly say what remains unresolved.

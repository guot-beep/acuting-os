# Repository Guidelines

> ## BLUEPRINT 2026-07-25 — READ docs/BLUEPRINT.md FIRST
> The site's direction is now **settled and canonical** in `docs/BLUEPRINT.md`:
> purpose (private study system + case tracking for US licenses, 中西醫結合,
> future diet/lifestyle layer), the final architecture (atlas shell, one topic =
> one page, panel-only nav, honest Quality reporting), the page contract, and
> the 10-week roadmap to "usable". The architecture has been reworked three
> times — **do not reinvent it**. Architecture changes go through Claude;
> direction changes come only from Ting.

> ## AI CONSTITUTION 2026-08-05 — READ docs/AI_CONSTITUTION.md BEFORE TOUCHING ANYTHING
> One page: **§A file ownership** (the only thing that prevents merge crises —
> one file, one owner, at one time), **§B seven irreversible red lines**,
> §C content discipline, §D validation discipline, §F role boundaries.
> Paste it whole at the top of every dispatch. It is the summary card for the
> other rule documents, not a twelfth one — the正本 stay in this file,
> `docs/BLUEPRINT.md`, `DECISIONS.md`, and the CARD_TEMPLATEs.

> ## EXTRA-POINT REFINEMENT WORKFLOW
> For any `data/acupoints/extra_points.json` audit, correction, or enrichment task,
> read and follow `skills/acuting-extra-point-refinement/SKILL.md`. When Ting supplies
> school/library book pages, also follow that skill's `references/print-book-intake.md`.

> ## CONDITION / PATTERN FILL WORKFLOW 2026-08-05
> For any `data/pathology/**` condition (西醫病名 / 中醫病名) or pattern (證型)
> task, read and follow `skills/acuting-condition-fill/SKILL.md`. Format lives in
> `docs/CONDITION_CARD_TEMPLATE.md`; the machine wall is
> `scripts/validate-condition-standard.js`. **Blocking prerequisite:** patterns
> currently span two incompatible id namespaces — build
> `data/config/pattern_alias_map.json` first (DECISIONS **D10**) before writing
> any pattern link.

> ## AI ROLES 2026-07-24 — READ docs/AI_ROLES.md FIRST
> Antigravity = generation. Codex = QA/validation. Claude = command/architecture
> + escalation. Ting = final in-app review. Full standing prompts + copy-paste
> dispatch lines in `docs/AI_ROLES.md`. This governs who does what; the content
> policy below governs how the filling is done.

> ## CONTENT POLICY CHANGED 2026-07-22 — READ THIS BEFORE FILLING ANYTHING
>
> Ting's instruction, verbatim: 「你應該直接填上 然後標註來源就好 …
> 我審核太嚴格導致資訊近來太少 我這是內部使用不公開 所以我需要資訊強大」
>
> **The old default was wrong and is retired.** Leaving a field empty with a
> 待補 / "pending review" placeholder is no longer the safe choice — it is the
> failure case. An empty dosage field is not safer than a sourced one; it just
> moves the lookup somewhere untracked. This app is **private, internal, not
> public**, and it is a study tool, not a patient-facing service.
>
> **New default: FILL IT, then cite where it came from.**
>
> 1. **Fill every field you can from a professional source.** Dosage, 性味歸經,
>    functions, indications, contraindications, modern clinical application —
>    all of it. Per-record content, never a category-level template.
> 2. **Cite per field.** Each filled value carries the source it came from.
>    Provenance is the safety mechanism, not emptiness. In clinic Ting needs to
>    know *what she is leaning on*, and a blank tells her nothing.
> 3. **Bilingual is required, not optional.** 中文 and English content, not an
>    English placeholder sitting in a `_zh` field.
> 4. **No boilerplate. Ever.** If 200 records share one sentence, that is not
>    content — it is a skeleton wearing content's clothes, and it defeats every
>    coverage measurement. Writing the same sentence 200 times is worse than
>    leaving it empty, because empty is at least honest.
> 5. **`review_status` labels, it does not block.** Draft content renders, with
>    its badge. Ting reviews it in-app while studying (RV1).
>
> **The only things that still get individual care** — and note that "care"
> means *fill it, cite it, and flag it*, NOT leave it blank:
> needling depth and angle, herb toxicity and maximum dose, pregnancy and
> paediatric cautions, and drug–herb interactions. Give the source's number and
> name the source. Never invent a number, and never present a single source's
> figure as if it were consensus when sources disagree — record the
> disagreement instead.
>
> **Applies to Codex too.** Stop producing staging previews that wait for a
> gate. Fill, cite, ship, let Ting review in the app.

> **READ `DECISIONS.md` (repo root) FIRST.** It records the one-way-door
> architecture decisions (ID immutability + namespacing, de-identification
> posture, schema cardinality, the JSON-knowledge / SQLite-clinical split,
> never-hard-delete). Do NOT "improve" or refactor any ID format, schema
> relation, or the storage split without re-reading it — a tidy-looking
> change there is a full-database migration for Ting.

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

## Codex / Claude Repo Handoff Protocol

Use the GitHub repo as the shared mailbox between Codex, Claude, and Ting. Ting should make decisions and approve gates, not act as a manual copy/paste relay for routine handoffs.

At the start of each meaningful Codex session:

1. Check `git status`.
2. Read `PROJECT_LOG.md`, `docs/CODEX_TASK_QUEUE.md`, and `docs/CODEX_HANDOFF.md` if present.
3. Confirm protected/frozen areas from the latest task instructions before editing.

At the end of every meaningful Codex task:

1. Leave the working tree clean.
2. Either commit and push the completed coherent change, or create a clearly named stash such as `git stash push -m "b2-formula-wip"` if the work is intentionally not ready to commit.
3. Do not leave uncommitted changes hanging in the working tree.
4. Update `docs/CODEX_HANDOFF.md` with a concise machine-readable/latest-first report for Claude.
5. Continue to give Ting a brief final summary, including a pasteable "給 Claude 的話", but the repo handoff is the source of truth.

`docs/CODEX_HANDOFF.md` entries should include:

- date/time and agent
- branch and commit hash, or named stash
- task ID / title
- files changed
- validation run and results
- protected areas explicitly not touched
- known risks / manual checks needed
- next recommended action

Claude's morning review may read `docs/CODEX_HANDOFF.md`, validate the pushed commit, and write the next task back into `docs/CODEX_TASK_QUEUE.md`. Codex should then pull, read the queue, and continue from the repo state instead of relying on Ting to relay every detail.

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

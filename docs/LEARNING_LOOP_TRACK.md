# AcuTing OS — Learning Loop Track (Brief Supplement)

Status: owner-approved as a shared brief supplement (2026-07-13). Depends on
and does NOT override: `docs/NORTH_STAR.md`, `docs/EXTERNAL_REVIEW_2026-07.md`
(the ENGINEERING_BRIEF reconciliation), `DECISIONS.md`. For Claude Code,
Codex, and any collaborating AI agent.

How to use: read this AFTER NORTH_STAR and the external-review reconciliation.
This track adds knowledge *shapes* and learning *loops* on top of the existing
record system. It introduces almost no new architecture — every item lands on
the existing JSON knowledge layer or the existing clinical
`data/clinical_cases/schema.sql`.

## Why this track exists

The system is organized by the *shape of the data* (points, formulas,
conditions). Expert clinicians don't store knowledge that way. Expertise lives
in three loops the system currently lacks:

1. **Contrast** — experts index by how things *differ* (辨證 / differential
   diagnosis is fundamentally comparison), not by isolated entries.
2. **Reflection** — the 醫案「按語」tradition: structured reflection is what
   turns experience into expertise. 100 unreflected cases are 100 repetitions.
3. **Recall** — knowledge saved to a system is not knowledge saved to a brain.
   Exams and clinic use only what's in the head; the system must actively push
   knowledge back to the owner.

The owner is a TCM student ~3 years from graduation recording de-identified
practice cases. The payoff is a brain and a database both loaded on graduation
day (this is the same "record every practice case now" thesis as DECISIONS.md's
sequencing section).

## Hard constraints (inherited — do not violate)

- Single user. No auth, no server, no cloud DB.
- Knowledge goes in Git (JSON, source of truth). **Patients never go in Git.**
  Clinical data stays in the gitignored dirs / the future SQLite `.db`
  (`.gitignore` already blocks `*.db`, `*.sqlite`, clinical dirs — 2026-07-13).
- JSON = authoritative knowledge; SQLite = derived query layer rebuilt from
  JSON. `ON DELETE RESTRICT`, never CASCADE on clinical relations (DECISIONS D7).
- One-way doors are already closed and machine-enforced (DECISIONS D2/D3/D4/D6):
  opaque immutable namespaced ids, homonym `__source` rule, de-identification
  habit, "when in doubt, many not one," and knowledge is never hard-deleted.
  This track must respect them — e.g. a `comparison` record's id is immutable
  (D1) and it is retired via `review_status="deprecated"`, never deleted (D6).
- **Never author clinical content from model memory** — no needling depths,
  doses, point locations, ICD codes, and especially not LL4 `discriminators`.
  EXCEPTION (owner-authorized source-assisted drafts): the owner MAY authorize
  an agent to draft LL3/LL4 discriminator content FROM cited sources (official
  medical references + the owner's own class/clinic notes). Such fills must
  stay `authored_by="model_draft"`, `review_status="draft"`, `public_safe:false`,
  carry `source_urls`/`source_type`, and NEVER contain the danger-zone facts
  above (needling depth/dose/point location/ICD from memory). They remain draft
  until the owner reviews against class materials. (Precedent: cmp.pcos_patterns,
  Codex source-assisted fill authorized by Ting, reviewed by Claude 2026-07-14.)
- Low friction is survival. Every field added here is OPTIONAL and must not slow
  routine SOAP entry. Progressive disclosure by default.

## Repo landing map + phase gates (reconciliation — read before implementing)

Each item lands on an existing surface. UI-touching parts are gated behind the
Phase 2 runtime-adapter merge (app.js / index.html are frozen until then) and
sequenced with the CS-track in `docs/EXTERNAL_REVIEW_2026-07.md`.

| Item | Lands on | Can start | Gated by |
|---|---|---|---|
| LL1 按語 fields | `schema.sql` `visits` (+ SOAP UI) | schema fields NOW | UI: Phase 2 merge → CS-track |
| LL2 outcome verdict + review page | `schema.sql` (+ review UI) | enum field NOW | UI: Phase 2 merge |
| LL3 `comparison` record type | NEW JSON knowledge file + build-data + validate-relations | data + validator NOW | render: knowledge.js UI later |
| LL4 evidence + illness-script fields | additive JSON keys on conditions/patterns | field convention NOW | fill: owner-only, lazy (never model) |
| LL5 SRS review queue | SQLite (gitignored) + card templates in JSON | design only | SQLite store (H2) + Phase 4 autocomplete |
| LL6 same-pattern case resurfacing | SQLite clinical FKs (+ SOAP sidebar) | design only | Phase 2 FK migration / SQLite store |

New shared field introduced by this track: **`authored_by`** (`owner` |
`model_draft`), a sibling of the existing `review_status` / `source_status`
ladder. Model-drafted content is always `authored_by="model_draft"`,
`status="draft"`, and visibly flagged in the UI. Backfill lazily; existing
records without it are treated as `owner` unless known otherwise.

## The work — 6 items, ordered by ROI

### LL1 — 按語: structured reflection fields on each visit ⭐ do first
The soul of a 醫案 is the reasoning and the follow-up, not the prescription.
Add three OPTIONAL free-text fields to `visits`:
- `differential_considered` — other patterns/diagnoses on the table this visit
  and why they were set aside.
- `reflection` — the 按語: what was learned, what surprised, what to watch.
- `if_ineffective_plan` — a falsifiable next step written at prescription time;
  a testable prediction the owner checks at the return visit.

Why now: ~1 hour of schema work, three years of compounding; zero friction
(optional, collapsed). Turns every practice case into deliberate practice.
DO: a collapsible「臨床推理 / 按語」section, closed by default.
DON'T: make them required; don't pre-fill with model text.
Repo note: add the 3 columns to `schema.sql` now; the SOAP form UI is frozen
(index.html/app.js) → wire it as a CS-track item after the Phase 2 merge.

### LL2 — outcome verdict + a dedicated "cases to learn from" review page
Error cases (誤案) teach more than successes, but nothing collects failure on
purpose.
- Add `outcome_verdict` to `visits` (or `cases`):
  `improved | no_change | worsened | lost_followup`.
- A review view filtering to `no_change | worsened` across the whole database.

DON'T frame it as a "failure wall" — frame it as「值得學習的病例」. Tone decides
whether the owner keeps using it.
Repo note: enum field → `schema.sql` now; review view → UI, after Phase 2 merge.

### LL3 — a `comparison` knowledge record type (contrast tables first-class)
辨證 is comparison; the highest-frequency pre-exam and in-clinic artifact is the
contrast table (e.g. 失眠: 心脾兩虛 vs 心腎不交 vs 肝鬱化火). Add a knowledge
record type in the JSON layer:

```json
{
  "id": "cmp.insomnia_patterns",
  "type": "comparison",
  "title_zh": "失眠常見證型鑑別",
  "compares": ["pattern.heart_spleen_deficiency",
               "pattern.heart_kidney_disharmony",
               "pattern.liver_fire"],
  "dimensions": ["主症", "舌", "脈", "兼症", "治法", "代表方"],
  "cells": { "...": "..." },
  "status": "draft",
  "authored_by": "owner"
}
```

- `id` is `cmp.<slug>`, opaque + immutable (D1); retire via
  `review_status="deprecated"` (D6), never delete.
- Every id in `compares` (and any point/formula referenced in `cells`) MUST
  resolve — extend `validate-relations.js` (the existing referential-integrity
  validator) to check `comparison` records.
- Render as a real side-by-side table, not prose.

DO: reuse the existing JSON layer + build-data.js + validators. DON'T: invent a
second knowledge store — these are knowledge records like any other.
Repo note: NEW file (e.g. `data/knowledge/comparisons.json`) + build-data wiring
+ validator can land NOW; the table renderer is a knowledge.js UI task after.

### LL4 — evidence grade + illness-script fields on knowledge records
Small additive fields, no restructuring:
- `evidence` on knowledge records:
  `classic_text | textbook | rct | teacher_said | my_observation`. Three years
  on, "a teacher said" and "an RCT showed" carry different weight — unlabeled,
  the owner forgets why they believed it.
- Grow `conditions` / `patterns` toward illness-script shape:
  `typical_presentation`, `discriminators` (how it separates from its 2–3
  nearest look-alikes), `triggers` (the cue-cluster that should bring it to
  mind). Experts index by triggers, not disease names.

DO: add keys, backfill lazily during normal knowledge maintenance.
DON'T: batch-fill from model memory — especially `discriminators`, which is
clinically load-bearing (AGENTS.md + the constraint above).

### LL5 — spaced-repetition review queue, cards from the owner's own cases
No method beats SRS against the forgetting curve — but this must NOT become
"another flashcard app for memorizing points." The differentiator: cards are
generated from the owner's OWN visits/knowledge ("last month's phlegm-damp PCOS
case — which point group?" / "this tongue + symptom cluster — what pattern?").
Self-referential, situated cards vastly outperform textbook cards.
- A `review_queue` table with a simple SM-2 scheduler (~½ day).
- Scheduling data is derived/personal → SQLite layer, gitignored. Card
  *templates* (generation rules) may live in the knowledge layer.
DON'T: pull clinical card content into anything committed to Git.
Serves the 3-year horizon (國考 / NCCAOM). Gate: after the SQLite store (H2) +
Phase 4 autocomplete.

### LL6 — case resurfacing: surface prior same-pattern cases on SOAP entry
When the owner opens a new SOAP and selects a pattern, the sidebar auto-surfaces
all past cases of that pattern + points used + `outcome_verdict`. This is
case-based reasoning — the actual shape of expert reasoning — and the everyday
UI for the query that justifies the whole system ("what have I done for
phlegm-damp PCOS, and did it work?"). Plus a homepage「今天複習」box: 3 due
cards (LL5) + 1 random past case.
DON'T attempt before the string-links → FK migration; on string links it can't
work reliably. Gate: after Phase 2 foreign keys / the SQLite clinical store.

## Priority order

```
LL1  按語 reflection fields          ← do first, ~1h, closes while doors are open
LL2  outcome verdict + 誤案 page     ← field-level, do early
LL3  comparison record type          ← highest pre-exam value
LL5  SRS queue + cards from cases     ← after Phase 4 autocomplete + SQLite
LL6  same-pattern case resurfacing    ← after Phase 2 foreign keys
LL4  evidence grade + illness script  ← lazy/ongoing, no rush
```

## Acceptance criteria

- [ ] LL1 fields exist, optional, collapsed by default; a visit saves with all
      three empty.
- [ ] LL2 verdict enum saved; review page lists `no_change|worsened` across all
      cases.
- [ ] LL3 comparison records validate through the existing validator; render as
      a table.
- [ ] LL4 `evidence` + illness-script keys defined; owner-filled, never
      model-batch-filled.
- [ ] LL5 due cards schedule via SM-2; card content never enters Git.
- [ ] LL6 selecting a pattern in a new SOAP surfaces prior same-pattern cases
      with outcomes.
- [ ] No new field is required; routine SOAP entry time is unchanged.
- [ ] `git status --porcelain | grep -Ei 'case|patient|soap|\.db'` returns
      empty after any commit.

## Agent working agreement (same as the main brief)

- Plan before code; print the file list you'll change and wait for owner
  approval.
- One item at a time; no opportunistic refactors.
- Respect frozen files (`app.js`, `index.html`) — batch UI-touching items per
  the CS-track sequencing.
- New model-drafted content: `authored_by="model_draft"`, `status="draft"`,
  visibly flagged.

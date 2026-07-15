# External Engineering Review — Reconciliation (2026-07-13)

An external AI produced an "Engineering Brief" reviewing AcuTing OS.
Ting asked Claude to assess it and adopt what is sound. This file records
the verdict per recommendation and how each maps onto the project's
existing plan (EXECUTION_PLAN.md, NORTH_STAR.md, AGENTS.md). The brief's
raw text is not committed verbatim because parts conflict with those docs;
this reconciliation is the authoritative reading.

## Overall

High-quality review with the right instincts (clinical-data survival, low
input friction, referential integrity). Much of it **validates existing
project design** — notably `data/clinical_cases/schema.sql` already defines
a de-identified, FK-based relational case schema very close to the brief's
Phase 2. Two recommendations are declined as written (see Reject).

## Verdict table

| Brief item | Verdict | Notes / mapping |
|---|---|---|
| 0.1 `.gitignore` clinical patterns | **ADOPTED 2026-07-13** | Added `*.db*`, `*.sqlite*`, `/clinical/`, `*.phi.*`. Deliberately did NOT add `cases*.json`/`soap*.json` globs — they collide with tracked de-identified templates. Verified with `git check-ignore`. |
| 0.2 git history PHI audit | **DONE — clean** | Only templates/schema/sample are tracked (`case_template`, `soap_note_template`, `schema.sql`, `sample_deidentified_case.json` = `example_not_real_patient`). No real PHI ever committed. No history rewrite needed. |
| 0.3 backup-age banner + export nudge | **ADOPT — queued** | Matches NORTH_STAR §H2 "export discipline (automated reminder)". Touches app.js/index.html → do AFTER the Phase 2 runtime-adapter PR merges (freeze). High value, low risk. |
| 0.4 fix hardcoded stat numbers | **ADOPT — queued** | CONFIRMED real: index.html hardcodes 202 herbs, 4 workflow seeds, 12 meds, 115 formulas, 15 & 409 safety flags, 407 links (line refs in task). Some already runtime (`standardCount`). Drift risk is real. Wire to runtime counts; touches index.html → after Phase 2 merge. |
| Phase 1 localStorage → SQLite file | **ADAPT / sequence** | Right problem (NORTH_STAR names localStorage as the #1 debt) but the project sequences the durable store for Horizon 2 (during school, before real patients), with the 0.3 banner as the now-mitigation. Bump to now ONLY if Ting is already recording real (not training) cases. Apply SQLite to the CLINICAL layer only. |
| Phase 2 relational clinical schema + FK | **ALREADY ALIGNED** | `data/clinical_cases/schema.sql` already does this (patients/cases/visits + junctions, `PRAGMA foreign_keys=ON`, IDs into the knowledge graph). Fold in the brief's good additions: a structured `outcomes` table (metric/value/unit) and `visit_patterns.is_primary` so multiple co-existing patterns per visit are first-class. |
| Knowledge layer → SQLite `.db` | **REJECT (keep JSON)** | The brief's own rule is "knowledge goes in Git." A binary `.db` is the WORST format for git review/diff/export; JSON-as-source-of-truth (NORTH_STAR §2) serves the brief's OWN goal better. Integrity is already enforced by `validate-relations.js` (extended 2026-07-13 for the crosswalk). SQLite is for the clinical layer, not knowledge. |
| Phase 3 Vite + Svelte full rewrite | **REJECT as written** | Violates NORTH_STAR §6.7 (no full-app rewrites) and §4 (framework for one view, not a rewrite). The valid underlying concern — index.html content duplication + 11 load-order-coupled globals — is addressed incrementally (data-driven cards, ES-module boundaries) without a framework. The brief itself marks this opt-in. |
| Phase 4 input friction (all 7) | **ADOPT — highest clinical-UX priority** | Aligns with EXECUTION_PLAN Phase 4–5. Especially 4.1 (combobox autocomplete so IDs are never hand-typed — the current SOAP form's biggest defect), 4.2 point protocols/templates, 4.3 carry-forward from last visit, 4.4 progressive disclosure, 4.5 structured outcome entry, 4.7 case timeline. These are what keep the tool from being abandoned. |
| DO-NOT-TOUCH list | **ADOPT — already our policy** | Matches AGENTS.md + NORTH_STAR §6. Good catch: "don't delete the clinical SOAP domain fields (tongue/pulse/pathomechanism/…)" — a generalist would; they are the clinical value. |
| §5 "never invent clinical content" | **ADOPT — with one honest flag** | Matches AGENTS.md. TENSION: the 2026-07-13 E3 gyn fill was model-authored draft (condition summaries + conservative refer-out red_flags), all `status=draft`. The brief's danger zone is point locations / needling depths / herb doses / ICD codes from memory — none of which E3 touched. Ting to decide whether even condition-level study summaries must be owner-authored, or may stay as clearly-labelled draft. |

## Concrete follow-ups written into the plan

Added to EXECUTION_PLAN / CODEX_TASK_QUEUE as a new "Clinical safety & UX"
track (gated behind Phase 2 merge where they touch app.js/index.html):

- CS1 backup-age banner + every-10-saves export nudge (0.3)
- CS2 replace hardcoded index.html stats with runtime counts (0.4)
- CS3 fold `outcomes` table + `visit_patterns.is_primary` into schema.sql
- CS4 SOAP link fields → autocomplete comboboxes (Phase 4.1) — Claude-owned
- CS5 case timeline + structured outcome charting (Phase 4.5/4.7)
- (H2) durable clinical store on schema.sql via SQLite-WASM + File System
  Access — the NORTH_STAR §H2 storage upgrade, when real-patient volume nears.

## One-line synthesis

Knowledge stays JSON-in-Git (validated, exportable, reviewable). The
clinical layer graduates to the already-drafted relational SQLite schema
when the storage upgrade lands. Input friction is the real risk — kill
ID-typing first. No framework rewrite; no knowledge in a binary blob.

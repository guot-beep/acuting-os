# AcuTing OS — Specialty & Education Track (Brief Supplement)

Status: owner-approved as a shared brief supplement (2026-07-15). Depends on and
does NOT override: `docs/NORTH_STAR.md`, `docs/EXTERNAL_REVIEW_2026-07.md`,
`DECISIONS.md`, `docs/LEARNING_LOOP_TRACK.md`. For Claude Code, Codex, and any
collaborating AI agent.

This track adds specialty knowledge (sports-medicine / cosmetic acupuncture),
mentor pearls (師承), integrative TCM+biomed cases, and lifestyle / patient
education — all on the existing JSON knowledge layer or the clinical schema.

---

## Repo reconciliation & landing map (read before implementing)

The governing principle — **specialty is a cross-cutting `domain` TAG, never a
per-specialty container** — is a one-way door and is recorded as **DECISIONS
D8**. It is the same insight already used by the conditions crosswalk and the
point-category tags: multi-select tags, one canonical record, filter by tag.

Per-item landing + phase gates + which agent's lane:

| Item | Lands on | Can start | Gate / owner |
|---|---|---|---|
| SE0-A `domain` tag (all knowledge records) | additive JSON key + a `domain` vocabulary file | vocab file NOW | ROLLOUT is CROSS-CUTTING (touches points/formulas/herbs/conditions/comparisons) → coordinate; do NOT bulk-add to another agent's files unilaterally |
| SE0-B provenance block | additive keys; partly exists (records already carry `source_urls`/`source_type`/`review_status`) | align NOW | reuse the `evidence` enum already defined in LEARNING_LOOP; don't duplicate existing source fields |
| SE7 inbox (fast capture) | new `status: "inbox"` value + a capture UI | UI after design | app.js (Claude lane); links use CS4 autocomplete (done) |
| SE4 `pearl` | NEW JSON knowledge file + validator + render | data+validator NOW | render distinct from verified (knowledge.js) |
| SE5 `lifestyle` | NEW JSON knowledge file + validator | data+validator NOW | links to `pattern.*` (validate-relations extension) |
| SE6 integrative case block | `schema.sql` + SOAP UI | schema NOW | REUSES LL1 fields (already added) + CS3 schema (visit_outcomes / visit_tcm_patterns already exist) |
| SE1 `protocol` | NEW JSON knowledge file + validator | data+validator NOW | stages reference points/techniques (FK-checked) |
| SE2 `anatomy` (safety) | NEW JSON knowledge file | schema NOW | **owner-authored ONLY** — never model-fill facial danger-zone depths/locations |
| SE3 `technique` | NEW JSON knowledge file | data NOW | referenceable from points/protocols/visits |

New shared vocabulary values this track introduces (fold into existing systems,
don't invent parallels):
- `authored_by` — already introduced (LEARNING_LOOP reconciliation): `owner` |
  `model_draft`.
- `status: "inbox"` — a NEW rung BELOW `draft` for 5-second captures. The ladder
  becomes: `inbox` → `draft` → `source_checked` → `verified` (+ `deprecated`
  tombstone per D6). Record it in the status vocabulary when SE7 lands.
- `evidence` enum — reuse LEARNING_LOOP's: `classic_text | textbook | rct |
  teacher_said | my_observation`.

Safety + de-id reconciliation:
- The danger-zone rule (no needling depth / dose / point-or-anatomy location /
  ICD from model memory) already binds via AGENTS.md + DECISIONS; SE2 anatomy
  and SE1 protocol depth fields are the highest-risk surface — owner-authored or
  empty `draft` only. The DECISIONS-D6/LL "no model discriminators" precedent
  applies here too.
- Photos / clinical media → gitignored `/clinical/private/` only. The current
  `.gitignore` blocks `data/clinical_cases/private|exports|local/`, `*.db*`,
  `*.sqlite*`, `*.phi.*`. Before any media lands, add media patterns
  (`*.jpg/*.jpeg/*.png/*.heic` under clinical dirs, and `/clinical/`) so the
  acceptance-criterion grep (`...|photo|\.db`) can stay green.

Coordination note: SE0-A ("add `domain` to EVERY knowledge record") spans files
several agents own (Codex owns comparisons/herbs/formulas fills). Roll it out as
an additive, adds-only migration each file-owner runs in their lane, or as a
single Ting-sequenced batch — never as one agent silently rewriting another's
canonical files. Claim it in CODEX_HANDOFF before starting.

Everything below is the owner's brief, verbatim.

---

## The governing principle (read this first — it decides everything below)

**A specialty is a TAG, not a new room.**

The intuition when learning sports-medicine or cosmetic acupuncture is to open a
"Sports Medicine section" and a "Cosmetic section." **Do not.** ST36 is used in
internal medicine, in sports medicine, and in cosmetic work. Per-specialty rooms
would duplicate ST36 three times; the three copies drift and contradict within a
year, and the validator can no longer keep them consistent.

Instead: **specialty is a cross-cutting, multi-select `domain` tag on records —
never a container.** One ST36 record, tagged `["internal","sports","cosmetic"]`.
Queries filter by tag: "give me everything sports-medicine-related (points /
formulas / techniques / cases)."

**This is a single-way door.** Defining specialty as a tag now = a one-second
decision. Discovering in three years that it was built as rooms and needing to
merge = a full-database operation. **Decide it now, this way.**

| Ask | Where it lives |
|---|---|
| Specialty study (sports / cosmetic) | Knowledge layer: `domain` tag + a few new record types |
| Mentor experience (師承) | Knowledge layer: new `pearl` type + a fast inbox |
| Integrative TCM+biomed cases | Clinical layer: a new block in `visits`/`cases`, no new tables |
| Lifestyle / patient education | Knowledge layer: new `lifestyle` type, linked to patterns |

## Inherited constraints (do not violate)

- Single user, self-use, private, local-only. No auth, no server, no cloud DB,
  no public exposure.
- Copyright is not a concern (private, non-public). Summaries + links are still
  preferred over pasting full articles — for retrieval quality and signal.
- De-identification still applies fully. Private ≠ unregulated: clinical content
  is PHI. `patient_code` only, birth year-month only, no identifying details in
  free text or filenames. Before/after photos and any clinical media live only
  in `/clinical/private/` (gitignored), never in the knowledge layer.
- JSON = authoritative knowledge (in git); clinical = SQLite/private
  (gitignored). New knowledge types are JSON records under the existing build +
  validator + status ladder.
- Single-way doors already closed (DECISIONS): opaque immutable namespaced IDs,
  "when in doubt, many not one," free-text de-id habit. Respect them.
- Never author clinical content from model memory — no needling depths, doses,
  point/anatomy locations, facial danger-zone depths. Model-drafted content is
  `authored_by='model_draft'`, `status='draft'`, visibly flagged.
- Low friction is survival. New fields are optional; routine entry speed
  unchanged; two-speed input (see INBOX below).

## Cross-cutting additions (apply to ALL knowledge records)

### SE0-A — `domain` tag (multi-select)
Add `domain: []` to every knowledge record. Controlled vocabulary, extensible:
`internal | gyn_fertility | sports | cosmetic | pain | ...`. Learning a new
specialty = adding a value to this vocabulary, never opening a new store.

### SE0-B — provenance block (on all knowledge records)
Add a consistent source block: `source` (author/teacher/site), `source_url`,
`retrieved_date`, `evidence` (`classic_text | textbook | rct | teacher_said |
my_observation` — same enum as LEARNING_LOOP_TRACK).

## New knowledge record types

All follow the existing pattern: JSON source of truth, opaque namespaced IDs,
referential integrity via the validator, `status` ladder, `authored_by`. Model
must not auto-fill safety-load-bearing fields.

### SE1 — `protocol` (multi-session course template) ⭐ most important new type
Cosmetic acupuncture is "an 8–12 session course, each session progressing";
sports rehab is "acute → subacute → functional recovery." Single-visit
differentiation can't hold an ordered, multi-session, advancement-gated
structure. The existing workflow seeds are the seedling — formalize it.

```json
{
  "id": "protocol.facial_rejuvenation_v1",
  "type": "protocol",
  "domain": ["cosmetic"],
  "title_zh": "面部針灸療程",
  "stages": [
    { "name": "初期", "sessions": "1-3", "focus": "...",
      "points": ["ST3","LI4"], "techniques": ["tech.facial_lift"],
      "advance_when": "..." }
  ],
  "expected_course": "8-12 次 / 每週 1-2 次",
  "status": "draft", "authored_by": "owner", "evidence": "teacher_said"
}
```

### SE2 — `anatomy` (structures, danger zones) — safety-critical
Sports medicine needs muscles / trigger points / movement tests; cosmetic needs
facial vessels & nerves and danger zones (needling depth, arteries to avoid).
Independent type so points and protocols can reference it.
**DO NOT** populate facial danger-zone depths or locations from model memory —
owner-authored or empty `draft` only. A plausible-wrong facial needling depth is
a patient-safety issue.

### SE3 — `technique` (manual methods / devices)
Dry needling, e-stim parameters, cupping, facial lifting techniques, etc.
Promotes technique from "a field inside a point" to a reusable record.
Referenceable from points, protocols, and visits.

### SE4 — `pearl` (mentor / 師承 experience)
The soul is provenance + credibility, not the content itself.

```json
{
  "id": "pearl.20260714_lin_bells_palsy",
  "type": "pearl",
  "domain": ["sports"],
  "content": "面癱療程後期加某穴以...",
  "teacher": "林老師", "context": "臨床跟診 2026-07",
  "my_verification": "尚未親自驗證 / 已在 N 例觀察到...",
  "links": { "conditions": ["condition.bells_palsy"], "points": ["..."] },
  "evidence": "teacher_said", "authored_by": "owner",
  "status": "inbox"
}
```

Rendered distinctly from verified knowledge — a mentor's aphorism must never look
as authoritative as a classic text in the UI. Three years on, the owner must be
able to tell "heard but unverified" from "verified."

### SE5 — `lifestyle` (养生 / patient education)
Content the owner will hand to patients, and reference at diagnosis time.

```json
{
  "id": "lifestyle.phlegm_damp_diet",
  "type": "lifestyle",
  "domain": ["internal"],
  "title_zh": "痰濕體質飲食作息建議",
  "applies_to": { "patterns": ["pattern.phlegm_damp"] },
  "guidance": "...",
  "interactions": "涼性飲食 × 某西藥；含維生素K食療 × 抗凝血劑 → 提醒",
  "source": "...", "source_url": "...", "retrieved_date": "2026-07-14",
  "evidence": "textbook", "authored_by": "owner", "status": "draft"
}
```

Must carry: applicable pattern/constitution (linked), `evidence`, and
drug/supplement interaction cautions. Patient-facing output stays within the
owner's licensed scope and shows its credibility level.

## Clinical layer: integrative TCM + biomed cases (SE6)

**No new tables.** Integrative cases differ from pure-TCM cases by a parallel
biomedical line and a coordination logic. Add to `visits`/`cases`:
- Biomedical parallel block — Western dx, imaging/labs, current Western meds / PT
  / injections (extend existing `western_meds`).
- Coordination & timing — the hard, valuable part: who does what, in what order
  ("acupuncture N days after a steroid injection," "avoid which techniques during
  IVF stimulation," "adjust needling under anticoagulation"). The owner's most
  valuable long-term asset.
- Integrative reasoning — reuse LEARNING_LOOP LL1 fields:
  `differential_considered`, `reflection`, `if_ineffective_plan`.

`outcomes` gains specialty metrics (`facial_symmetry`, `skin_texture` for
cosmetic; ROM / pain / function for sports), charted over `visit_date`.
Before/after photos → `/clinical/private/` only, never git, no identifying info
in filenames.

## Two-speed input — the INBOX (SE7) — friction is the real failure mode

Pearls happen standing next to a teacher; web finds happen mid-scroll. You cannot
fill ten fields in the moment.
- Fast capture: one line of text → saved with `status: inbox`, five seconds, no
  required links. Without this, ~80% of mentor pearls are lost.
- Full structuring: return in the evening to add links, provenance, domain,
  promote `status`.
- All "link to point/formula/pattern" fields use the Phase 4 autocomplete —
  never hand-typed IDs.

## Priority order

```
SE0-A domain tag                 ← single-way door, do NOW with schema work
SE0-B provenance block           ← do NOW alongside SE0-A
SE7   inbox (fast capture)       ← do early; unlocks pearls & web capture
SE4   pearl type                 ← pairs with SE7
SE5   lifestyle type             ← high everyday value; links to patterns
SE6   integrative case block     ← after Phase 2 FKs; reuses LL1 fields
SE1   protocol type              ← when starting cosmetic/sports study
SE2   anatomy type (safety)      ← with SE1; owner-authored only
SE3   technique type             ← with SE1
```

## Acceptance criteria

- [ ] `domain` is multi-select on all knowledge records; filtering returns
      cross-type results (points+formulas+techniques+cases).
- [ ] No per-specialty duplicate of any shared record exists.
- [ ] Provenance block present on all knowledge records; web items carry url +
      retrieved_date + evidence.
- [ ] Inbox capture saves a valid record in ≤ 5s with only a text body;
      promotable later.
- [ ] `pearl` renders visually distinct from verified knowledge.
- [ ] `lifestyle` links to patterns and surfaces on matching cases (LL6).
- [ ] Integrative case block added with no new tables; reuses LL1 fields.
- [ ] `protocol`/`anatomy`/`technique` validate through the existing validator;
      danger-zone/depth fields are never model-authored.
- [ ] All new fields optional; routine SOAP entry time unchanged.
- [ ] `git status --porcelain | grep -Ei 'case|patient|soap|photo|\.db'` empty
      after any commit.

## Agent working agreement (unchanged)

- Plan before code; print the file list you'll change; wait for owner approval.
- One item at a time; no opportunistic refactors; respect frozen files.
- Learning a new specialty = one new `domain` value + at most one or two new
  types. Never open a new silo.
- Model-drafted content: `authored_by='model_draft'`, `status='draft'`, visibly
  flagged; never author safety-load-bearing clinical fields.

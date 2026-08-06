# AcuTing OS — Architecture Decisions (one-way doors)

READ THIS BEFORE ANY WORK. These are the decisions that are expensive or
impossible to reverse once real clinical data accumulates. The window to
change them cheaply is NOW, while cases are disposable practice data — it
closes permanently when Ting starts seeing real patients (~graduation).

Format per decision: **what is locked · why · current state in repo ·
reconsider only if**. Status: `LOCKED` = agreed + true; `PROPOSED` =
recommended, awaiting Ting's ratification (do not execute a migration to
satisfy a PROPOSED item without her go-ahead).

Origin: external engineering review (2026-07) + Claude reconciliation, see
docs/EXTERNAL_REVIEW_2026-07.md. Agents that want to "clean up" or
"improve" any ID format, schema relation, or the storage split must stop
and re-read this file first — a tidy-looking refactor here is a full-DB
migration for Ting.

---

## D1 — IDs are opaque, immutable, decoupled from display  · LOCKED (principle)

- **What:** an entity id (`formula.xiao_yao_san`, `SP6`, a point code) is a
  permanent key. It NEVER changes once it exists. Renaming a concept =
  UPDATE its `name_zh` / `name_en` field, NEVER its id. Changing an id is a
  whole-database migration of every clinical relation that references it.
- **Why:** every SOAP note's junction rows point at these ids. Stable ids
  are the one thing the clinical layer cannot tolerate churning.
- **Current state:** standard points use international codes (SP6) — stable,
  fine. Formula/herb/condition/pattern ids are prefixed slugs — fine.
- **Reconsider only if:** never for existing ids. New id schemes apply to
  new entities only.

## D2 — Namespace the non-standard point families  · LOCKED (2026-07-13, Ting: "統一命名")

- **What:** every acupoint carries a stable, namespaced `id`, ADDED as a new
  field. The display `code` is NOT changed — approach A, so URLs, prefix
  matchers, and the UI keep working. Clinical foreign keys reference `id`.
- **The locked scheme (pure function of code):**
  - standard channel : `id === code` (SP6 — international code is stable)
  - extra point EX-* : `ex.hn3` (strip `EX-`, lowercase)
  - Master Tung : `tung.11.01` / `tung.DT.01` — these ALREADY existed;
    kept verbatim per D1 (277 points, untouched by the migration)
  - auricular : `ear.at4` / `ear.sm` (strip `EAR-`, lowercase)
- **Why the split code vs id:** the app uses `code` as id + display + URL
  key (`#point/AT4`) + regex prefix matchers. Renaming `code` would break
  all of that and needs frozen app.js edits. Adding a decoupled `id`
  (D1's own principle) gets the stable namespaced key with zero runtime risk.
- **How it was done:** `scripts/add-point-ids.js` (adds-only, respects
  pre-existing ids, asserts distinct code → distinct id). 681 points → 681
  unique ids, 0 collisions (the GB93 `AT4` and embedded `AT4` are the same
  point and correctly share `ear.at4`). `scripts/validate-point-ids.js`
  now enforces this every run — a bare non-standard id fails the build.
- **Reconsider only if:** never for existing ids. The `code` display values
  could still be cosmetically changed later (approach B) but that is a
  separate app.js task, not an id change.

## D3 — Formula/herb homonym disambiguation rule  · LOCKED (2026-07-13, Ting delegated)

- **What:** how same-name-different-source entities are distinguished.
- **Rule:**
  - Base id = `formula.<pinyin_slug>` / `herb.<pinyin_slug>` (lowercase,
    underscores). No qualifier when the name has no homonym.
  - Homonyms (distinct entities sharing a `name_zh`) are disambiguated by
    classical SOURCE with a DOUBLE-underscore qualifier:
    `formula.wen_jing_tang__jinkui` vs `formula.wen_jing_tang__furen`.
  - The source token comes from a controlled abbreviation list (seed;
    extend the list, never invent ad hoc):
    `jinkui` 金匱要略 · `shanghan` 傷寒論 · `furen` 婦人大全良方 ·
    `heji` 太平惠民和劑局方 · `jingyue` 景岳全書 · `piwei` 脾胃論 ·
    `waike` 外科正宗 · `wenbing` 溫病條辨.
- **D1 interaction:** never re-id an existing entity. If a base id is
  already taken unqualified and a homonym later appears, the NEWCOMER takes
  `__<source>`; the existing id is grandfathered. For names with well-known
  homonyms (溫經湯, 理中丸/湯 families, …) qualify BOTH from the first entry
  so neither is privileged — decide at entry time, not retroactively.
- **Enforcement:** `scripts/validate-naming.js` fails the build if two
  records share a `name_zh` without both being `__`-qualified, or if a
  `__` token is not in the source list. Passes trivially today (0 homonyms
  in the 115 formulas / 202 herbs) — it exists to catch the FIRST collision
  the day C2/H content fills introduce it.
- **Reconsider only if:** the source-abbreviation list may grow; the `__`
  convention itself is LOCKED.

## D4 — De-identification is a habit, not just a schema  · LOCKED

- **What:** `patient_code` format is `P-YYYY-NNN` and carries NO patient
  information (no birthday, no initials encoded in it — that is
  re-identification). Dates stored as year or year-month only, never full
  DOB. AND: free-text fields (chief complaint, HPI, notes) must never
  contain names, employers, schools, or identifying detail — this is the
  real leak vector and it is a discipline built during the practice years.
- **Why:** clean structured fields are worthless if the free text names "the
  teacher at XX Elementary". The 3-year practice window is where this
  becomes muscle memory before it protects a real patient.
- **Current state:** schema.sql + templates use `P-2026-001` ✓;
  `birth_year` only ✓. Free-text discipline is a habit, not enforceable in
  code — the SOAP UI may show a subtle reminder (CS-track), nothing more.
- **Coarsen, never falsify** (added 2026-07-29 — Ting asked whether to record
  sex reversed and age minus ten). **No.** De-identification means removing
  or blurring identifiers, never writing a false clinical fact:
  - Sex and age are **clinically load-bearing**. Sex flips whole reasoning
    branches (月經/孕產/更年期 vs 前列腺); age sets 腎氣 stage, dosing, and
    red-flag weight (new-onset back pain at 65 ≠ at 55; postmenopausal
    bleeding is a red flag only if she is postmenopausal). Falsified, the
    three-year dataset teaches Ting the wrong patterns — it destroys exactly
    the asset the sequencing section says cannot be back-filled.
  - It buys no privacy she needs. Sex + an age band identify nobody. What
    identifies is name, full DOB, address, employer, school, MRN, and
    identifying free text — all already handled above, and real cases live
    in gitignored dirs / the future `.db` (D7), never in git.
  - A remembered transform is itself a hazard: one forgotten reversal and the
    dataset is silently half-reversed, which is worse than either choice.
  - **If more protection is wanted, coarsen:** age band (35–39) or keep the
    existing `birth_year`-only field; keep sex accurate; stay strict on free
    text; and avoid recording rare identifying combinations in prose.
- **Reconsider only if:** never. This is a HIPAA-posture door.

## D5 — Schema cardinality: choose MANY when in doubt  · LOCKED (principle)

- **What:** relationships default to many-to-many via junction tables.
  Locked cardinalities: one visit → many patterns (with `is_primary`), one
  case → many western conditions, one visit → many formulas, one visit →
  many outcome rows (metric/value/unit, structured, never a free-text blob).
- **Why:** collapsing many→one later is free; expanding one→many later is a
  migration. A visit with co-existing 肝鬱脾虛 + 腎陰虛 must be first-class.
- **Current state:** `data/clinical_cases/schema.sql` already uses junction
  tables + `PRAGMA foreign_keys=ON`. Fold in a structured `outcomes` table
  and `visit_patterns.is_primary` (CS3).
- **Reconsider only if:** never downgrade an existing many-to-many.

## D6 — Knowledge records are never hard-deleted  · LOCKED (2026-07-13)

- **What:** a knowledge entity that has ever existed is retired via
  `review_status="deprecated"`, never removed. Clinical notes reference
  these ids forever.
- **Why:** three years out, an agent "cleaning up" an old auricular point
  silently breaks a real SOAP note's foreign key.
- **Done:**
  - Status backfilled: every point now has a `review_status`
    (`scripts/backfill-point-status.js`, adds-only floor "draft" — the 235
    unlabeled 361 records + 29 auricular; GB93 `source_checked` and Tung
    `index_only` were left untouched).
  - A point id ledger `data/acupoints/point_id_manifest.json` (681 ids)
    records every id that has ever existed; regenerated deliberately via
    `scripts/update-point-manifest.js --write`.
  - `scripts/validate-point-ids.js` now FAILS the build if a manifest id has
    vanished from the data (hard delete) or a new id is unlisted. Verified
    by injecting a phantom id → validator failed as intended. Pairs with the
    D7 rebuild pre-flight when the clinical store lands.
- **How to retire a point:** set `review_status="deprecated"` (it stays in
  the data and the manifest, still counts). To genuinely add a new permanent
  point: add it, then run `update-point-manifest.js --write` to ratify.
- **Reconsider only if:** never allow silent hard-delete.

## D7 — Storage split: JSON knowledge (git) + SQLite clinical (gitignored)  · LOCKED

- **What:** the knowledge layer stays JSON-as-source-of-truth in git
  (diffable, reviewable, exportable, public-safe). The clinical layer lives
  in a SQLite `.db` that is NEVER committed. A build step loads the JSON
  knowledge into derived, gitignored tables inside the same `.db` so the
  clinical foreign keys have real targets.
- **Why:** the two layers have opposite natures — knowledge is low-write /
  diff-is-the-value / public; clinical is high-write / needs transactions /
  never public. One store would cripple one layer. (A binary `.db` for
  knowledge would also defeat the "knowledge goes in git" rule.)
- **Guard rails:** `ON DELETE RESTRICT` on clinical→knowledge FKs (never
  CASCADE-delete clinical rows); a rebuild pre-flight that ABORTS and
  reports if any id a clinical row references is missing from the new JSON.
- **Current state:** knowledge = JSON + validators ✓ (this is already the
  architecture). schema.sql = the clinical target ✓. The derived-tables
  build bridge is not built yet (H2 storage upgrade).
- **Reconsider only if:** never merge the two layers into one store.

## D8 — Specialty is a cross-cutting `domain` TAG, never a container  · LOCKED (2026-07-15)

- **What:** a specialty / practice area (internal, gyn_fertility, sports,
  cosmetic, pain, …) is a multi-select `domain: []` tag on ONE canonical
  record — never a per-specialty section/store/duplicate. ST36 is one record
  tagged `["internal","sports","cosmetic"]`, not three copies.
- **Why:** per-specialty rooms duplicate shared records; the copies drift and
  contradict within a year and the validator can't keep them consistent.
  Learning a new specialty = adding one value to the `domain` vocabulary.
- **Current state:** no `domain` field yet. Introduce a controlled `domain`
  vocabulary file + add `domain: []` additively to knowledge records.
- **Reconsider only if:** never build a per-specialty container. Deciding
  this now is one second; retrofitting after per-specialty rooms exist is a
  full-DB merge. Source: docs/SPECIALTY_EDUCATION_TRACK.md (owner-endorsed).

## D9 — Clinical usage stats: runtime by default; a snapshot may be committed, but NEVER as a field inside a canonical knowledge record  · LOCKED (2026-07-29, Ting)

- **What:** the case↔knowledge reverse index ("SP6 — used in 18 cases / 42
  visits / most common patterns…") is computed at render time from the
  clinical store. Persisting a snapshot **is allowed** — Ting's call: these
  are counts and approximations, they name nobody, and she records no names.
  The snapshot goes in its own dated derived file
  (`data/audits/clinical_usage_snapshot.json`, alongside
  `missing_report.json`). What is **never** allowed is writing the aggregate
  as a field *inside* a canonical knowledge record
  (`used_in_cases` in `data/acupoints/361.json`, `case_count` on a herb, …).
- **Why not inside the canonical record** (this is an engineering reason, not
  a privacy one):
  1. **It goes stale silently.** The number is wrong the moment the next
     visit is recorded. A card reading "18 cases" when it is 25 is exactly
     the fake-number failure AGENTS.md calls 最重罪. A dated snapshot file
     cannot lie the same way — it says "as of 2026-07-29".
  2. **It dirties canonical knowledge on every clinic day.** The knowledge
     layer's value is that its diffs mean something (D7). Aggregates
     recomputed weekly would bury real content diffs in churn.
- **Privacy (corrected 2026-07-29 — the original draft of this decision
  overstated it):** the aggregates are **not** identifying, and D4 still
  holds where it matters (at entry: no names in free text, `P-YYYY-NNN`,
  year-only dates). The residual risk is narrow and belongs to the FUTURE
  PUBLIC export only (NORTH_STAR H3): a small-n cell on a public page
  ("used in 1 case" + a condition) can re-identify. **Rule:** the public
  export suppresses cells with n < 5; the private app shows every n, and
  always displays the n itself.
- **Current state:** no reverse index and no snapshot file exist yet. Panel
  spec + snapshot shape live in `docs/CLINICAL_GRAPH_TRACK.md` (CG4/CG5).
  Same shape applies to the clinical-layer search index (CG13): built at
  runtime, never inside a knowledge record.
- **Also settled by the same review (not a new door, a naming clarification):**
  the Patient → Episode → Visit shape Ting wants is ALREADY
  `patients → cases → visits` in `schema.sql`. "Episode" = an existing `case`
  row. Do NOT add an `episodes` table or rename `cases` — that is a D1/D5
  full-DB migration that buys no new capability.
- **Reconsider only if:** never write clinical aggregates into git. If runtime
  computation ever gets slow, the cache goes in the clinical (gitignored)
  store, never in `data/`.

## D10 — One pattern namespace: `pattern.<english_slug>`  · LOCKED (2026-08-05, before the conditions/patterns fill sprint)

- **What:** every TCM pattern id is `pattern.<english_slug>` — lowercase, ASCII,
  underscores. `data/pathology/pattern_registry.json` is the ID authority: a
  pattern id must be registered there before anything may reference it.
  `pattern_library.json` is the content layer keyed by the same id.
  `data/config/tcm_pattern_canon.json` is **demoted to import staging** — it is
  not canon despite the filename.
- **The problem this closes (measured 2026-08-05):** the same clinical concept
  exists three times in three shapes.
  - `pattern_registry.json` — 61 ids, `pattern.blood_stasis`
  - `pattern_library.json` — 50 ids, same namespace (48 overlap with registry)
  - `tcm_pattern_canon.json` — 140 records / 134 unique ids, **`pat.氣血不和`**
    (Chinese characters in the id, different prefix) — **0 overlap with the
    registry namespace.** Two independent universes.
  - and on the 150 condition records: `related_patterns` (445 links, 48 unique,
    **all resolve**) coexists with `tcm_patterns` (728 **inline blobs**, no ids,
    **none resolve** — raw scrape, not relations).
- **Why now and not later:** the conditions/patterns fill sprint is starting.
  Filling 150 conditions' pattern links across two namespaces means every link
  is a coin flip; reconciling afterwards is a full-DB migration touching every
  condition record. **One day now, one month later.**
- **The rules:**
  1. `pattern.<english_slug>` is the only namespace. No new `pat.*` records.
  2. Chinese characters never go in an id — this repo has a documented mojibake
     history (`docs/ENCODING_TRIAGE.md`); a Chinese id is a future encoding bug.
  3. Existing `pat.*` records are **not deleted and not re-id'd** (D1/D6). They
     get an alias map: `data/config/pattern_alias_map.json`
     (`pat.氣滯血瘀 → pattern.qi_stagnation_blood_stasis`).
  4. `tcm_patterns` inline blobs stay as provenance (§0 只加深不刪除) but are
     **never** used for navigation. Navigation reads `related_patterns` only.
     Lifting a blob into a registered pattern is the actual fill work; the
     condition validator's N1 note counts what is left.
  5. `方證` (桂枝湯證, 25 records in the canon file) is **not** the same entity
     as `證候` (肝氣鬱結, 115 records). Formula-patterns belong to the formula
     layer, not the pattern registry.
- **Enforcement:** `scripts/validate-condition-standard.js` C6 fails when a
  `related_patterns` id does not resolve in registry ∪ library.
- **Reconsider only if:** never re-id an existing pattern. The alias map may
  grow; the namespace is LOCKED.

## D11 — Four canonical diagnostic namespaces; the namespace IS the entity type  · LOCKED (2026-08-06, Ting asked "是四套 ID 嗎?")

- **What:** diagnosis-side knowledge has exactly **four** canonical namespaces.
  An entity's namespace *is* its type — no record carries a type field that can
  disagree with its own id.

  | Namespace | 中文 | What it is | Today |
  |---|---|---|---|
  | `cond.*` | 西醫病名 | Biomedical condition — has diagnostic criteria, labs/imaging, an ICD position | **150** ✅ |
  | `tdis.*` | 中醫病名 | TCM disease — a classical illness name defined by a symptom cluster (感冒·咳嗽·喘證·胃痛) | **75** ✅ |
  | `pattern.*` | 證型 | Syndrome differentiation conclusion — a snapshot of the pathomechanism (肝陽上亢) | **61 registry / 50 library** ✅ |
  | `sym.*` | 症狀/體徵 | Symptom or sign — a single observation (頭痛·口苦·惡寒) | **0 — not built** ❌ |

- **Ting's framing was right with one correction.** She proposed
  "condition = 西醫病名, pattern = 中醫". `cond.*` = 西醫病名 is correct. But
  **`pattern` is not 中醫病名** — 中醫病名 is `tdis.*`, which already exists
  with 75 records and `classical_source_hint` (中醫內科學·肺系 …), and the 150
  conditions already link to it via `related_eastern_diseases` (70 unique ids).
- **Why 病名 and 證型 must never share a namespace:** 辨證論治 is built on
  一病多證 / 同證異病. 頭痛 has 肝陽上亢 / 血虛 / 痰濕 under it; 肝陽上亢 appears
  under 頭痛 / 眩暈 / 高血壓 / 耳鳴. Collapsing them destroys that many-to-many
  structure — and that structure *is* the diagnostic logic. This is the same
  error as `Migraine = 肝陽上亢`, one level up.
- **Symptoms are ONE namespace, not two.** 頭痛 and "headache" are one
  observation in two languages, unlike 病名 (where the TCM and biomedical
  entities are genuinely different concepts) and unlike 證型 (which has no
  biomedical counterpart at all). Splitting `sym.*` by tradition would double
  every mapping for no gain. TCM-specific observations (口苦, 舌淡, 脈弦) are
  carried by a `tradition: biomedical | tcm | both` **tag**, not a second id space.
- **Cross-namespace homonyms are two entities** (D3's rule, one level up). Three
  Chinese names exist in both `cond.*` and `tdis.*` today — 月經過多, 月經過少,
  痔瘡. Each keeps its own id in its own namespace and they are linked, never
  merged. Same string ≠ same entity.
- **Import layers are NOT namespaces.** `cloudtcm.disease_entry.*` (190),
  `cloudtcm.disease_category.*` (14), and anything else harvested are
  **provenance handles**. They may never appear in a relation field
  (`related_patterns`, `related_eastern_diseases`, `differential_patterns`, …).
  Their value is surfaced *on* the canonical card:
  - the exact page URL → into `sources` (never deleted — it is the link Ting
    wants kept),
  - `image_url` → a `cloudtcm_ref` block on the card. **190/190 CloudTCM
    entries carry an image**, which is the concrete visualisation Ting values.
  - Ting's instruction, verbatim: 「可以整合入那個四套 不用單獨自己雲端中醫一套
    只是雲端中醫有的 可以寫入訊息跟 link」.
- **Consequence for the condition validator:** `entity_type` is derived from the
  namespace and validated for agreement (`cond.*` → `biomedical_condition`,
  `tdis.*` → `tcm_disease`), never chosen freely. A `cond.*` record labelled
  `tcm_disease` would create a second home for TCM diseases and is a defect.
- **Reconsider only if:** never merge two of the four. `sym.*` may be built when
  a real consumer needs it (the symptom→pattern search); until then its absence
  is honest, not a gap to paper over.

## D12 — Clinical-layer stability contract: additive-only from 2026-09-01  · LOCKED (2026-08-06, Ting delegated the call to Claude: 「你決定吧」)

- **What:** from 9/01, `data/clinical_cases/schema.sql`, the case localStorage
  format (`acuting-clinical-cases-v1`), and the export-file format are
  **additive-only**: fields may be added, never renamed, retyped, or removed.
  A breaking change requires a migration script exercised on test data first.
- **Why:** Ting starts at the clinic 9/05. From that day the localStorage holds
  real (de-identified) cases — the asset the sequencing section calls the one
  thing that cannot be back-filled. A renamed field is silent data loss. The
  UI freeze (ROADMAP 9/01) protects the shell; this protects the data. Both.
- **Scope note:** the knowledge layer is NOT frozen — content sprints continue
  through September untouched. Only the case-data contract freezes.
- **Reconsider only if:** the H2 localStorage→SQLite migration — which is
  itself the planned, scripted exception this rule demands.

## D13 — Every graph edge is stored on one side and derived on the other  · LOCKED (2026-08-06, Ting: 「雙向連接…最好在目前還算草創的時候就設定好」)

- **What:** a bidirectional link is ONE stored edge plus a derived reverse —
  never two hand-maintained fields. `data/config/relation_registry.json` is the
  authority: it names every edge field, which side stores it, and how the
  reverse is derived. CG4's reverse index, the future graph UI, and validators
  enumerate edges from that file. A link field that is not registered there is
  invisible to the graph — adding an edge = template + registry + validator.
- **Why now (Ting's own reasoning):** both templates already carried both sides
  (`cond.related_patterns` AND `pattern.related_conditions`). The moment agents
  fill both, the two sides disagree within a batch and no validator can say
  which is right. On 2026-08-06 exactly 0/50 patterns had `related_conditions`
  filled — retiring the hand-filled reverse cost nothing. A month into the fill
  sprint it would have been a reconciliation project.
- **Direction rules:**
  - knowledge → knowledge: reverse derived at BUILD time
    (`pattern_registry.used_by_conditions` is the existing example).
  - clinical → knowledge: reverse derived at RUNTIME only (D9). Never persisted
    into knowledge records.
  - symmetric edges (差異鑑別, comparison membership): stored once where
    authored, rendered on both — never hand-mirrored.
- **Reconsider only if:** never hand-maintain both sides. New derived fields may
  be added freely; they are build artifacts, not authored content.

## D14 — Every namespace is built the same four ways  · LOCKED (2026-08-06, Ting: 「那四套也可以依照這樣建構」)

- **What:** each of the four diagnostic namespaces (D11) — and any namespace
  added later — is complete only when it has all four of:

  | # | Part | Answers | Enforced by |
  |---|---|---|---|
  | 1 | **Controlled vocabulary** | how are these records classified? | the validator rejects an unlisted value |
  | 2 | **Card template** | what fields exist, what do they mean? | it IS the approved-field list |
  | 3 | **Standard validator** | which records fall short, by which code? | `--worklist` + CI ratchet |
  | 4 | **Import/staging layer** | what exists in the world that we lack? | source-tiered, never canon |

- **Why the four are inseparable:** each one fails without the others. A
  vocabulary nobody validates becomes free text — `tdis_registry` spelled one
  taxonomy 22 ways. A template with no validator is advisory, and advisory
  rules produced 202 herbs sharing 26 sentences. A validator with no template
  has no authority to point at. And an import layer with no staging discipline
  becomes 535 empty records (the 知源 index, had it been imported as canon).
- **The import layer's job is a gap map, not content.** It is source-tiered,
  its translations stay `*_draft`, and it may never appear in a relation field
  (D11). Records are born when someone fills them from a real source.
- **Build order matters:** vocabulary → template → validator → *then* content.
  Every incident in `PROJECT_LOG` traces to content arriving before its
  yardstick.
- **Status 2026-08-06:**
  - `cond.*` ✅ all four
  - `pattern.*` ✅ all four (`pattern_family_vocabulary.json` closed the gap)
  - `tdis.*` — vocabulary ✅ (`tcm_disease_taxonomy.json`), staging ✅
    (`imports/zhiyuan`), **template ❌, validator ❌**
  - `sym.*` — nothing, deliberately (D11: build it when a real consumer needs it)
- **Reconsider only if:** never fill a namespace that is missing part 1, 2 or 3.

---

## Sequencing (from the review) — do the painful things NOW

- **Now (painful-to-change):** ratify D2/D3 and, if namespacing, migrate
  while data is disposable; backfill D6 status + validator; keep D4/D5/D7
  discipline. Run the whole pipeline end-to-end on practice cases:
  record → store → relate → query "SP6 results in phlegm-damp cases".
- **The single most-regretted-if-skipped item:** from now, record EVERY
  practice case through the real schema + real flow. 3 years × weekly cases
  = hundreds of consistent, queryable pattern-diagnosis records by
  graduation — a dataset (and a record of Ting's own diagnostic evolution)
  that cannot be back-filled later.
- **One semester before clinic:** localStorage → SQLite migration (deadline
  is the vacation BEFORE clinic, not day-one of clinic); Tauri packaging;
  daily backup rotation.
- **After clinic starts (add-on):** billing/CPT/ICD layer, timeline charts,
  any public-content ideas.

## Highest-ROI UX (do first, does not touch storage/schema/freezes)

Autocomplete comboboxes for point/formula selection so an internal id is
NEVER hand-typed (type 逍遙 / xiaoyao / XYS → pick → store
`xiao_yao_san`). This is frequency × pain maxed out, it turns referential
integrity from "caught after the fact" into physically-impossible-to-break,
and it is what makes recording every practice case low-friction enough to
actually sustain for three years. Then: "copy from last visit" pre-fill.

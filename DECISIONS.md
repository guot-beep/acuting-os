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
  | `pattern.*` | 證型 | Syndrome differentiation conclusion — a snapshot of the pathomechanism (肝陽上亢) | **69 registry (10 taxonomy + 59 clinical) / 62 library raw (59 active + 3 deprecated); active reconciliation 59/59** ✅ |
  | `sym.*` | 症狀/體徵 | Symptom or sign — a single observation (頭痛·口苦·惡寒) | **0 records; vocabulary + template + validator built 2026-08-06** |

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
  - `tdis.*` ✅ all four (`TDIS_CARD_TEMPLATE.md` + `validate-tdis-standard.js`
    shipped; `classical_source_hint` split into `taxonomy_id` +
    `classical_source`, 61/75 auto-assigned, 14 left for a human pass)
  - `sym.*` ✅ all four (2026-08-06). The consumer D11 was waiting for arrived:
    CloudTCM's 129 symptom entries had source pages and diagrams and nowhere to
    live. Vocabulary, template and validator now exist; records are still 0 —
    correctly built and honestly empty.
- **All four ratchet layers are now in CI**: conditions 577 · patterns 250 ·
  tdis 103 · naming 1.
- **Reconsider only if:** never fill a namespace that is missing part 1, 2 or 3.

## D16 — Three duplicate-import Pattern ids retired (deprecated, not deleted) into their canonical counterparts  · LOCKED (2026-08-08, Ting + ChatGPT canonical review, during the Pattern V1 completion project)

- **What:** three `pattern.*` library records, all created 2026-08-02 by
  condition-specific batch scripts (`scripts/build_next_batch_patterns.js`,
  `scripts/build_hypertension_patterns.js`) before `pattern_registry.json`
  existed as the id authority (D10), were found to duplicate an
  already-registered canonical pattern under the same Chinese name:

  | Retired id (deprecated, kept in file) | Canonical id (kept) | Shared name |
  |---|---|---|
  | `pattern.insomnia_heart_kidney_disharmony` | `pattern.heart_kidney_not_communicating` | 心腎不交 |
  | `pattern.liver_fire_flaring` | `pattern.liver_fire` | 肝火上炎 |
  | `pattern.liver_wind_stirring` | `pattern.liver_wind` | 肝風內動 |

  These were never registered in `pattern_registry.json` and had zero
  downstream references anywhere in the repo (alias map, relation registry,
  comparisons, condition shortlist, entity registry — confirmed by exhaustive
  grep before this decision). The registered counterparts each have 2–10 real
  condition links and, for two of the three, an alias-map entry.
- **Why not just delete them:** D6 (`docs/AI_CONSTITUTION.md`) — no hard
  delete, ever. `review_status: "deprecated"` is the existing mechanism, so
  it is reused here rather than inventing a new one. Each retired record
  carries a new `deprecated_note_zh` (added to `docs/PATTERN_CARD_TEMPLATE.md`
  §4.1 and the validator's `APPROVED` set as part of this decision) naming the
  canonical replacement and this decision.
- **`pattern.liver_wind_stirring` nuance (the one genuinely closer call):**
  its `related_biomedical_condition_ids` pointed at stroke/TIA/hypertensive
  crisis while `pattern.liver_wind`'s registered usage is Parkinson's/tremor —
  different biomedical contexts. Decision: biomedical condition context does
  not define TCM Pattern identity (both are 肝風內動 by name and mechanism);
  the acute/stroke-context material is preserved as evidence on the canonical
  record, not as grounds for a separate id. Future ontology work may split
  Liver Wind by etiology (肝陽化風 / 熱極生風 / 血虛生風 / 陰虛風動), but
  `liver_wind_stirring`'s own canonical name (肝風內動) was not specific
  enough to serve as one of those subtypes.
- **What was migrated (additive only, canonical content never overwritten):**
  aliases, pinyin, unique supporting signs, unique points, unique sources,
  `related_tcm_disease_ids`/`related_biomedical_condition_ids`, `tag_ids`, and
  an `exam_pearls_zh` note — onto the canonical record. One broken formula
  reference was corrected during merge (`formula.huang_lian_a_jiao_tang` does
  not exist; it is the same formula as the existing `formula.huang_lian_e_jiao_tang`,
  an 阿膠 romanization variant — the corrected id was merged forward). One
  formula candidate, 交泰丸 (Jiao Tai Wan), does not exist in
  `data/herbs/formulas.json` and was **not** added as a fabricated id — it is
  named in the canonical record's `exam_pearls_zh` as an unresolved candidate
  for whoever registers that formula next.
- **What did NOT change:** no id was renamed, merged, or hard-deleted; no
  alias-map entries were added (`data/config/pattern_alias_map.json` is
  machine-generated by `scripts/build-pattern-alias-map.js` and its documented
  policy scope is `pat.<中文>` legacy ids specifically — this decision uses
  `review_status`/`deprecated_note_zh` instead of stretching that file's scope
  or hand-editing a generated artifact). The "internal note, not a clinical
  distinction" `differential_patterns` entries that the Pattern V1 workstream
  had added to flag these three pairs for review were removed from both sides
  of each pair — they are resolved, not open questions, as of this decision.
- **Frozen Pattern V1 count baseline (verified 2026-08-08):**
  - Registry = **69**: 10 taxonomy/category + 59 clinical Patterns.
  - Library = **62 raw**: 59 active + 3 `deprecated` historical records.
  - Active clinical registry ↔ active library reconciliation = **59/59**.
  - The raw library count intentionally includes the three deprecated records
    because D6 forbids removing historical array entries.
- **Reconsider only if:** a future source directly contradicts treating any
  of these three as the same Pattern as its canonical counterpart — in which
  case un-deprecate and re-differentiate, do not re-delete evidence.

## D15 — `drug.*` is the medication namespace; the 12 `med.*` records are migrated into it now  · LOCKED (2026-08-06, before pharmacology content starts)

- **What:** the pharmacology layer's ingredient-level namespace is
  `drug.<generic_slug>` (`docs/PHARM_CARD_TEMPLATE.md` L4). The 12 existing
  `med.*` records in `data/medications/western_medications.json` are **not** a
  second namespace — they are re-issued as `drug.*` and `med.*` is retired via
  an alias map, exactly as `pat.*` was under D10.
- **Why this had to be decided today:** the pharmacology template landed
  (77327f8) proposing `drug.*` while `med.*` already existed and was already
  referenced. Two namespaces for one concept is precisely the defect D10 spent
  a day undoing for patterns — and the window to fix it costs nothing right
  now for a measured reason:

  | Referencing surface | `med.*` refs | Cost to migrate |
  |---|---|---|
  | `data/clinical_cases/fertility_workflow_seed.json` | 12 | seed/template file, no real cases |
  | `data/clinical_cases/sample_deidentified_case.json` | 1 | sample record |
  | `cond.*` `medication_links` | **0/150** | none |
  | real clinical cases | **0** — clinic starts 2026-09-05 | none |

  **Total: 13 references, all in template/sample files, none in a real case.**
  After 9/5 every migration touches Ting's actual patient records.
- **The rules:**
  1. `drug.<generic_slug>` — ingredient level, ASCII, one card per generic
     (D1: never re-id once issued).
  2. `med.*` ids are **not deleted** (D6). `data/config/medication_alias_map.json`
     maps `med.letrozole → drug.letrozole`; the clinical layer resolves through
     it so any record written before the migration keeps working.
  3. `data/medications/western_medications.json` becomes an **import/staging
     file** for the pharmacology layer, not canon — its 12 records have
     `major_contraindications` and `common_adverse_effects` empty 12/12, so
     they are a name list, not cards.
  4. `drugclass.*` and `drugtarget.*` follow the same ASCII rule.
- **Ownership** (the other open question in that commit): `data/pharmacology/**`
  belongs to the pharmacology line, added to `AI_CONSTITUTION.md` §A. It is a
  separate path from `data/medications/**` (staging) and from every other
  line's directory, so it can run in parallel without a merge surface.
- **Reconsider only if:** never. A second medication namespace after 9/5 is a
  migration of real clinical records.

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

## D17 — Clinical Data Capture V2 namespaces and model rules  · LOCKED (2026-08-10, Ting, final low-token checkpoint)

Context: `docs/CLINICAL_DATA_CAPTURE_V2_DIRECTION_2026-08-10.md` (direction) and
`docs/CLINICAL_LAYERS_RECONCILIATION_2026-08-10.md` (repo reconciliation).

1. **New canonical namespaces** — exactly `supp.*` (supplements — **NOT `suppl.*`**,
   overriding the V2 direction doc's §6 spelling), `life.*` (lifestyle factors),
   `exposure.*` (environmental/toxic exposures), `adverse_event.*`, `modality.*`.
   Examples: `supp.vitamin_d3`, `supp.coq10`, `supp.magnesium`, `supp.creatine`.
   No variants (`suppl.*`, `supplement.*`, `ae.*`) — the namespace IS the type (D11).
2. **Medications** — reconfirms D15: new identities are `drug.*`; `med.*` records are
   NEVER destructively deleted — legacy/migration aliases toward `drug.*` via
   `medication_alias_map.json`. Migration gate: after it, new real Clinical Visits
   must not create new `med.*` references.
3. **`sym.*` and `metric.*` are NOT competing namespaces.** `sym.*` = symptom/clinical
   finding; `metric.*` = measurement instrument or tracked value.
   (sym.headache ↔ metric.pain_score; sym.insomnia ↔ metric.sleep_quality +
   metric.sleep_duration_hours.) Visit observations must let a symptom/finding
   optionally link to one or more measurements. Never collapse one into the other.
   This resolves the sym_id fork flagged in `data/clinical_cases/schema.sql`.
4. **Visit TCM pattern roles** — MVP supports `primary` | `secondary`; schema stays
   future-compatible with `root` | `branch` (reserved, not blocked). Visit pattern
   records eventually support `confidence`.
5. **One coherent exposure timeline** — Patient/Case baseline exposure and Visit-level
   changes belong to ONE longitudinal model that can reconstruct the timeline
   (baseline coffee 3 cups/day + Visit #4 "changed to 1 cup/day"). Applies to
   `drug.*`, `supp.*`, `life.*`, `exposure.*`. Never two disconnected systems.
6. **Observation ≠ interpretation** — lifestyle/exposure data is observed behavior;
   it never auto-converts into a TCM diagnosis or pattern, and suspected exposure
   never becomes confirmed poisoning. Pattern conclusions are entered only by the
   practitioner at Case/Visit level.
- **Reconsider only if:** never merge the namespaces or auto-diagnose; naming spelling
  is final once the first `supp.*` record is issued (D1).

## D19 — TCM Pattern V1 frozen  · LOCKED (2026-08-08, Ting approved after the ChatGPT canonical review)

> 編號註記(2026-08-12 整合時):本決定原記為 D17,與同編號的
> 「D17 Clinical Data Capture V2 namespaces」(2026-08-10)撞號 —— 後者已被
> 四份文件以 D17 §5/§6 引用,故保留其編號,本決定改列 D19。決定內容未更動。
> 舊引用「D17 TCM Pattern V1 frozen」= 現 D19。

- **What:** the `pattern.*` namespace's V1 completion pass (per
  `docs/PATTERN_CARD_TEMPLATE.md`, run against every canonical Pattern) is
  done. Frozen state, verified programmatically at freeze time:

  | | Count |
  |---|---|
  | Registry total (`pattern_registry.json`) | 69 |
  | — taxonomy/category nodes (`level:"category"`) | 10 |
  | — canonical clinical ids (`level:"pattern"`) | 59 |
  | Library total (`pattern_library.json`, raw) | 62 |
  | — active canonical Pattern cards | 59 |
  | — deprecated historical import records (D16) | 3 |
  | Active library ids resolving exactly once to a registry clinical id | 59/59 |
  | Active library − registry clinical | 0 |
  | Registry clinical − active library | 0 |

  `validate-pattern-standard`: 62/62 records clean, 0 blocking defects.
  `validate-pattern-registry`: PASS. `validate-content-junk`: PASS.
  `check-validation-ratchet`: PASS, no regressions (patterns 220 → 0 over the
  V1 project).
- **Canonical completion baseline commit:** `c8a5ea7` — "Pattern V1: build the
  3 final canonical cards -- stomach_fire, wind_cold, wind_heat -- 59/59
  active identity reconciled." Anyone auditing "what did V1 actually ship"
  diffs against this commit.
- **What "frozen" means going forward:**
  1. New Pattern work is **V2 expansion**, not a silent V1 edit. A new
     `pattern.*` id, a reclassification of an existing one, or a schema
     change to `docs/PATTERN_CARD_TEMPLATE.md` all count as V2 and should say
     so in the commit message — they do not retroactively change what V1 was.
  2. No canonical V1 id is renamed, merged, redirected, or deleted without an
     explicit migration decision recorded here (same standard as D1/D6/D10).
  3. The 3 deprecated records from D16 (`pattern.insomnia_heart_kidney_disharmony`,
     `pattern.liver_fire_flaring`, `pattern.liver_wind_stirring`) stay
     `review_status: "deprecated"` in `pattern_library.json` — not deleted,
     not un-deprecated without a new decision.
  4. The 10 records still missing `differential_patterns` (`N1`, non-blocking)
     are a known, accepted V1 gap — fill them only when a real source
     supports a real distinguishing comparison, never by inventing one to
     close the count.
  5. The duplicated `cmp.insomnia_patterns` block in `data/knowledge/comparisons.json`
     (flagged during the D16 reference audit) is explicitly **out of scope**
     of this freeze — a separate, unapproved cleanup item.
- **Reconsider only if:** a future canonical review finds a genuine identity
  defect in the frozen 59 (a real duplicate, a real classification error) —
  fix via a dated decision here, the same process D16 used, not a silent edit.

## D18 — SQLite 時程正式修訂 · LOCKED(Ting 裁定接受,2026-08-11)

**背景**:上方「One semester before clinic」段將 localStorage→SQLite 遷移
deadline 訂在開診前假期。實際 2026-08 的工程順序是:C2b Patient 遷移鏈
(8 輪審計)+ 可逆 export/import + 每日備份紀律優先;SQLite 未動。
三年藍圖(2026-08-11)把 SQLite 排在 12-24m。INDEPENDENT_AUDIT_2026-08-11
正確指出:這是對本檔既有決策的**未記錄偏離**。本條就是那份記錄。

**提案**:正式修訂為 —— 9/5 前不做 SQLite;條件觸發制:病例量 ≥50、或
多裝置需求出現、或 localStorage 容量壓力實測浮現,三者任一即啟動遷移
(照 C2b 同款 plan→shadow→verify→pointer→rollback 流程;
localstorage_sqlite_mapping.json 持續逐欄維護是本提案的前提紀律)。

**理由**:(1) 開診前最後三週的風險預算應花在已知高風險面(C2b runtime
契約、日常寫入路徑防護),不是引入新儲存引擎;(2) localStorage +
fail-loud 持久層 + v2 export + Git 外備份已覆蓋單機單人期的資料安全;
(3) mapping 檔的維護讓延後不增加未來遷移成本。

**Ting 裁定(2026-08-11)**:✅ 接受修訂 —— 9/5 前不做 SQLite;條件觸發制生效(病例 ≥50 / 多裝置需求 / 容量壓力,任一即啟動)。
> **更正(2026-08-26,Ting)**:實際進診所日為 **9/2**,非 9/5。本條與全庫
> 各處「9/5 前不做 SQLite」讀作「9/2 前不做」;條件觸發制不變。D12 的
> 9/01 additive-only 凍結仍在進診所之前,不受影響。

## D20 — Outcome metric 的判讀分兩個軸,不是一個 · LOCKED(2026-08-13,Ting:「兩個軸留著」)

**鎖住什麼**:`data/clinical_cases/outcome_metrics.json` 的每一筆記錄,對
「這個數字怎麼判讀」保留**兩個彼此獨立**的欄位群,任何人不得把它們合併回一個:

| 欄位 | 只回答這個問題 |
|---|---|
| `interpretation_status` + `source` + `interpretation_en` | **變化多少算臨床有意義**(MCID)有沒有具名來源 |
| `reference_range{ text_zh, text_en, scope, source }` | **什麼算正常** / 診斷依據 / 證據標準 |
| `instrument_source` | **量表本身**的出處 |

`interpretation_status` 維持三態:`sourced` / `no_published_threshold` /
`source_pending`,而且它**只**描述第一列那個問題。

**為什麼**:2026-08-13 SOL 查證 17 筆待辦時,建議把 13 筆標成 `sourced`。
照做會出事,而它自己的結論就是證據 —— `cycle_length` 是「FIGO 24–38 天正常
**有來源**,但沒有 change-from-baseline MCID」。兩個不同的問題被壓進同一個
欄位,而 `scripts/validate-metric-interpretation.js` 正是靠這個欄位決定
**這筆記錄能不能寫數字**。一旦標成 `sourced`,守門就失效,下一個人寫
「週期縮短 5 天算改善」不會有任何東西擋。

SOL 自己列的四條防呆註記,全部是同一種失敗:情境限定的切點被抄成全域規則。
內膜 ≤7 mm(IVF 預後,辨別力很弱)、卵泡尺寸(自然週期 vs 促排完全不同)、
Rome IV <3 次/週(是多項診斷條件之一)、潮熱 50%(病人層級)vs FDA 2/day
(組間療效門檻)。

**這條的一般形式,值得記住**:*一個用來守門的欄位,一旦同時回答兩個問題,
守門就失效。* 不是資料不整齊的問題,是規則被繞過的問題。

**repo 現況(2026-08-13)**:27 筆 —— `sourced` 10 / `no_published_threshold`
17 / `source_pending` 0。7 筆帶 `reference_range`,`scope` 全部非空。
3 筆的量表出處已從 `source` 分流到 `instrument_source`。
validator 強制:`reference_range` 必須有自己的 `source`;**文字裡有數字就
必須有 `scope`**;非 `sourced` 的記錄不得在 `source` 放東西。
負面對照 4/4 擋住,含「內膜 8 mm 以上即適合著床」。

**只有在這種情況下重新考慮**:出現第三種判讀問題,而它既不是「改善幅度」
也不是「正常範圍」—— 那時是**再加一個軸**,不是把現有兩個合併。
合併的代價是守門失效,那是不可逆的:錯的閾值一旦寫進病歷判讀畫面,
後面看到的人會把它當標準。

## D21 — 四組中藥重複匯入卡退役(deprecated,非刪除),合併進正典藥典名 · LOCKED(2026-08-14,SOL 鑑定 + Ting 裁定「四組照建議 沙參方案A」)

**機制沿用 D16**(pattern 線的 dedup migration):additive-only 合併進正典
記錄,退役卡 `review_status` 改 `"deprecated"` 並加一句 `deprecated_note_zh`
說明,整筆留在 `herb_canon_shortlist.json`(D6 不硬刪),全庫引用改指向正典
id,退役 id 本身不變(D1)。herb 線資料形狀與 pattern 線不同(無
`differential_patterns` 互斥欄、無現成 `deprecated_note_zh` 欄位),故新增
該欄位進 `docs/HERB_CARD_TEMPLATE.md` §3.6,`validate-herb-standard.js`
沒有 pattern 線那種 APPROVED 欄位白名單,不需要額外註冊。

**四組**(SOL 鑑定重複,Ting 裁定逐組執行):

| 退役 id(留檔) | 正典 id(藥典名) | 共同藥材 |
|---|---|---|
| `herb.qian_cao_gen` | `herb.qian_cao` | 茜草 Rubiae Radix et Rhizoma |
| `herb.han_lian_cao` | `herb.mo_han_lian` | 墨旱蓮 Ecliptae Herba |
| `herb.wu_zei_gu` | `herb.hai_piao_xiao` | 海螵蛸 Sepiae Endoconcha |
| `herb.sha_shen`（方案 A） | `herb.bei_sha_shen` | 北沙參 Glehnia littoralis |

- **茜草組**:正典本已較完整,只把「茜草根」併入 `aliases_zh`、
  「順天堂藥材」併入 `study_tags`;退役卡的裸網域 source_urls 未帶新事實,
  未遷移。
- **墨旱蓮組(反向案例)**:退役卡 `herb.han_lian_cao` 內容反而比正典
  `herb.mo_han_lian` 完整(functions_zh/modern_functions_zh+_en/
  modern_functions_detail_zh/clinical_use_note/dosage/safety_flags/
  related_formulas/field_sources 皆缺或較短)。**archive-before-replace**:
  正典原本較短的 functions_zh/cautions_zh/_en/source_urls/exact_source_url
  先寫進正典自己的 `import_artifacts`,再用退役卡的較完整版本取代;「旱蓮草」
  「金陵草」「蓮子草」併入 `aliases_zh`。這是本次唯一一組「新 id 是正典、
  舊 id 內容較完整」的反向案例,merge 方向不是機械地「保留正典所有欄位」,
  而是逐欄比較長短。
- **海螵蛸組**:退役卡獨有的 `related_formulas`(3 個,正典原欄位是空的)
  與 `modern_functions_detail_zh`(2 則完整分析,正典原無此欄)遷入;
  歸經兩源不合(退役卡:脾經、腎經;正典採用 AD+課件版:腎經、肝經、胃經)
  依「兩源不合就並記」加註在正典 `tcm_properties.source_note_zh`,未覆蓋
  主欄位。「烏賊骨」「墨魚骨」正典 aliases_zh 已有,確認無需再加。
- **沙參組(方案 A,特別條款)**:retire 前逐欄檢查 `herb.sha_shen` 有無
  南沙參(Adenophora)專屬內容 —— **檢查結果:沒有**,功效/主治/禁忌皆為
  `herb.bei_sha_shen` 既有內容子集,故未另立南沙參封存記錄。
  `name_en: "Glehniae / Adenophorae Radix"`(北/南沙參拉丁學名混寫)
  依裁定明確排除,未遷入,`herb.bei_sha_shen` 維持自身 `"Glehnia Root"`。
  「沙參」併入 `aliases_zh`。`related_formulas` 僅遷移
  `formula.sha_shen_mai_men_dong_tang`(其 composition 確實列
  `herb_id: "herb.sha_shen"`,可查證);退役卡另列的
  `formula.bai_he_gu_jin_tang`、`formula.mai_men_dong_tang` 經核對兩方劑
  composition 皆未列沙參,判定未查證,未遷移。

**全庫引用改指向**(退役 id → 正典 id,共 9 處):

| 檔案 | 處數 | 明細 |
|---|---|---|
| `data/herbs/formulas.json`(composition `herb_id`) | 5 | `formula.shi_hui_san`、`formula.gu_chong_tang`(茜草根→茜草 ×2)；`formula.er_zhi_wan`(旱蓮草→墨旱蓮)；`formula.yi_guan_jian`、`formula.sha_shen_mai_men_dong_tang`(沙參→北沙參 ×2) |
| `data/herbs/herb_pairs.json`(`pairs[].herbs[]`) | 2 | `pair.han_lian_cao__nu_zhen_zi`、`pair.mai_men_dong__sha_shen` |
| `data/imports/cloudtcm/herb_url_map.json`(`entries[].herb_id`) | 2 | 旱蓮草→墨旱蓮(cloudtcm_id 1320)、烏賊骨→海螵蛸(cloudtcm_id 1058) |

`herb.wu_zei_gu` 在 `formulas.json`/`herb_pairs.json` 內原本零引用(全庫掃描
確認)。退役卡的 `id` 欄位本身不改(僅存在於它自己的記錄裡,D1)。

**未動的**:`data/knowledge/comparisons.json`、`data/config/relation_registry.json`
全庫掃描零命中,未觸碰。`herb.nan_sha_shen`(南沙參)在 `herb_pairs.json`
一筆藥對裡被引用,但**從未存在**於 `herb_canon_shortlist.json`——這是
本次審查發現的既有缺口,與本決定的四組合併無關,不在此次範圍內處理,
記錄於此供之後建卡。

**驗證(2026-08-14)**:`validate-herb-standard.js` 358 筆 PASS、0 structural
defect(合併前後記錄數不變,D6 不硬刪);`validate-formula-standard.js`
PASS(composition 查無藥材維持 1 味次 `formula.huang_tu_tang` 的「灶心土」,
與本次四組合併無關,合併前後不變);`check-validation-ratchet.js` PASS 無
新增缺陷;`validate-content-junk.js` 既有 baseline 警告不變。全庫退役 id
殘留掃描:四個退役 id 除自己記錄的 `id` 欄位外,`data/**` 零殘留。

**只有在這種情況下重新考慮**:未來查到 `herb.sha_shen` 或其他退役記錄其實
帶有南沙參專屬臨床內容 —— 那時是取消 deprecated、另立南沙參正典卡,不是
回頭改寫已合併的內容。

## D22 — 敗毒散(formula.bai_du_san)併入人參敗毒散,為同方 · LOCKED(2026-08-26,Ting:「敗毒散照 D3 併入人參敗毒散 基線降 0」)

- **What**:`formula.bai_du_san`(敗毒散)與 `formula.ren_shen_bai_du_san`
  (人參敗毒散,《太平惠民和劑局方》)為同方 —— 兩卡組成 13 味一致。
  退役卡維持 `review_status: "deprecated"` 並補上 deprecated_note_zh
  (它先前被標 deprecated 卻無 note、無 DECISIONS 記錄,正是
  validate-retired-id-references 基線那 10 筆的成因);
  `formula_canon_shortlist.json` 的同 id active 副本一併標 deprecated。
- **機制沿用 D16/D21**:additive-only 合併 —— 正典 21 個空欄位自退役卡
  遷入(ba_fa/cautions/clinical_manifestations/treats/modern_applications/
  雙軌 track/THP 編號等),遷移欄位的 field_sources 一併帶過,正典原有
  內容零覆蓋。全庫引用改指向:formulas.json 與 formula_canon_shortlist
  各 4 筆 related_formulas(風寒解表五方 clique)、
  `cmp.exterior_wind_cold` compares 1 筆。
- **順帶修正**:遷入的 treats_zh/modern_applications_zh 有 6 個純英文詞
  (退役卡上的既有缺陷,搬進 active 卡被 encoding ratchet 擋下 +13)——
  已補標準中文(瘡瘍初起/風濕/眼疾/神經痛/虛弱/滑囊炎),英文原文
  保留在平行 _en 欄位;THP 編號補「臺灣中藥典」前綴。
- **驗證**:validate-retired-id-references 0 殘留,ratchet 基線 10 → 0;
  formula-standard/content-junk/herb-standard PASS。
- **Reconsider only if**:未來查到 `formula.bai_du_san` 卡曾承載
  「非人參敗毒散」的獨立方義(如荊防敗毒散被誤併)—— 屆時取消 deprecated
  另立正典,不回頭改寫已合併內容(D16 同款條款)。

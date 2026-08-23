# AcuTing OS — North Star & Architecture Evolution Map

Written: 2026-07-12 (Claude, at Ting's request). Audience: every AI
collaborator (Claude, Codex, future agents) and Ting herself.
This is the STRATEGIC map. Tactical tasks live in CODEX_TASK_QUEUE.md;
daily memory lives in PROJECT_LOG.md; hard rules live in AGENTS.md.
When any of those conflicts with this document on direction, this document
wins on direction and AGENTS.md wins on safety.

## 1. What this project is (and is not)

AcuTing OS is Ting's private clinical-learning operating system:
NCCAOM prep, bilingual TCM knowledge base, and de-identified clinical
case recording — one person, one browser, no server.

It is NOT (yet): a public website, a multi-user product, a medical device,
or a marketing site. AcuTing Learn (public English content) is a future
EXPORT of this system, never a mode of it.

## 2. The one architectural law

**The app is replaceable; the data is not.**
All knowledge lives in `data/**.json` — versioned, validated, source-
attributed, status-labeled. Any future renderer (framework app, mobile,
public site, SQL-backed service) must be buildable from these files by an
import script alone. Every decision below serves this law.

Corollaries every agent must respect:
- Stable IDs forever: point codes (LI4), formula ids (formula.gui_zhi_tang),
  herb ids. Renames are migrations with plans, never edits.
- Content status is part of the data: draft / index_only /
  needs_source_review / source_checked / private_clinical_note /
  public_ready. No agent promotes status without per-record human review.
- Every imported text keeps its per-record source URL.
- Staging → preview/diff → Ting's gate → apply. Never skip the gate for
  canonical files.

## 3. Three horizons — anchored to Ting's 5-year plan

Ting's frame: ~3 years of school, then ~2 years establishing practice.
The horizons map onto that life timeline. Development milestones inside
H1 are counted in months; the horizons themselves are counted in years.

| Life stage | Horizon | AcuTing OS role |
|---|---|---|
| School years 1–3 | H1 | trusted bilingual study database + NCCAOM drill engine |
| Late school → boards | H1→H2 | exam sprint tools; cases practice on de-identified training encounters |
| Graduation years 4–5 | H2 | clinic-ready: durable case records, documentation workflows |
| Year 5+ (established) | H3 | AcuTing Learn public site; clinic-facing content |

The build order below already matches this: everything school-critical
lands first; clinic infrastructure matures during school so it is proven
before real patients; public content is last because it depends on
source_checked maturity that accumulates over the school years.

### Horizon 1 — "School-usable" (now → deep into school years)
Goal: Ting studies and drills from AcuTing OS daily, trusting what she sees.

1. **Runtime adapter** (Claude-owned, next big surgery): app renders
   `data/acupoints/361.json` as the single acupoint source; retire the
   legacy embedded layer + deep-equal migration gate. Includes CODEX A4
   (config extraction) in the same operation. This is the last step that
   makes the completed 361 layer visible.
2. **Source-verification loop** (running): CloudTCM cross-check queues
   (CLOUDTCM_HIGH_RISK_DIFFS §A/§B first), then WHO SAPL location pass,
   channel by channel → records graduate draft → source_checked.
3. Encoding backlog triage (Codex): classify the 798 findings into real
   damage vs false positives; repair real ones via guarded scripts.
4. Formula/herb content deepening on the now-rendered 115/202 records —
   fill skeletons in reviewed batches (C2 pattern).

### Horizon 2 — "Clinic-ready" (built during school, proven by graduation)
Goal: real clinical workflow support ready BEFORE Ting's first real patient.

1. **Cases storage upgrade** — the ONE known architectural debt.
   localStorage is acceptable for practice notes only. Before real
   patient volume: adopt export-discipline (automated reminder + JSON to
   private cloud) as the bridge, then move cases to a durable local store
   (SQLite file or File System Access API). Knowledge base is untouched
   by this — it is a swap of the cases persistence module only.
2. **Quiz / drill mode** built FROM the knowledge JSON (points, formulas,
   herbs already have the fields). NCCAOM-shaped: by channel, by category,
   by comparison_group. This is a pure renderer feature — no data change.
3. **Relationship graph UI**: conditions ↔ patterns ↔ points ↔ formulas ↔
   medications, powered by the already-validated relation files. If the
   interaction complexity demands it, THIS is the feature that may justify
   introducing a framework — scoped to the graph view only, not a rewrite.
4. Billing/fertility documentation workflows mature inside Cases.

### Horizon 3 — "Outward" (graduation years and beyond)
1. **AcuTing Learn**: static public English site EXPORTED from records
   with status public_ready only. Separate repo/host; a build script
   filters and transforms — private notes physically cannot leak because
   the export whitelist is status-based.
2. Mobile: the same static app on private hosting already works on phones;
   invest in mobile UX only after H1/H2 content is trusted.
3. Multi-device case sync — only if clinic reality demands it; that is the
   first (and only) point where a small server/DB becomes justified.

## 4. Technology decision rules (when to add what)

| Trigger | Then adopt | Not before |
|---|---|---|
| Search feels slow (>50ms perceived) | prebuilt index (minisearch) | SQL |
| Real patient volume begins | cases → SQLite/file store | any server |
| One feature's UI outgrows vanilla JS | framework for THAT view | app rewrite |
| Learn goes public | static export pipeline | CMS/backend |
| Multi-user or multi-device write | small server + auth | before then, never |

Default answer to "should we add infrastructure?" is NO until a trigger
fires. The project's edge is curated data + discipline, not tech stack.

## 5. Collaboration model for AI agents

- **Claude**: architecture, app.js/router surgery, merge conflict
  resolution, review-gate design, cross-agent integration. Writes task
  specs others execute.
- **Codex (and similar implementers)**: batch content work, data wiring,
  validators, scripts, UI sections — always from a written task spec
  (CODEX_TASK_QUEUE pattern: files-to-touch, protected areas, validation,
  done-criteria, gates).
- **Ting**: the only authority for gates — status promotions, canonical
  overwrites, deletions, scope changes, and anything clinical-judgment.
- Coordination rules learned the hard way (2026-07 divergence incidents):
  ONE writer per file area at a time; pull latest main before starting;
  never commit to main directly when a branch/PR flow is active; the agent
  that owns integration (Claude) resolves cross-agent merges.

## 6. Permanent prohibitions (all agents, all time)

1. Never delete or restructure data files without Ting's explicit approval
   and a written migration plan.
2. Never promote review_status/source_status in bulk.
3. Never mix private clinical/study content into public Learn exports.
4. Never store identifiable patient information anywhere in the repo.
5. Never bypass staging → preview → gate → apply for canonical data.
6. Needling/safety fields are study references — wording must never read
   as operating instructions, and high-risk points keep explicit warnings.
7. No full-app rewrites. Evolution is incremental, verified, reversible.

## 7. How to pick up work (any future agent)

1. Read PROJECT_LOG.md top entry → current state.
2. Read CODEX_TASK_QUEUE.md → open tasks and gates.
3. Check `git log --oneline -5` on main → last landed work.
4. Do ONE coherent batch, validate (scripts/validate-*.js), update the log,
   push via the active branch/PR flow.
5. If your work touches app.js, js/, or index.html structure — stop and
   confirm it is a Claude-designated task first.
6. For knowledge-shape / learning-loop work (contrast tables, 按語 reflection,
   recall/SRS, illness scripts), read docs/LEARNING_LOOP_TRACK.md — the
   owner-approved brief supplement that layers those loops on the existing
   record system without overriding this document.
7. For specialty study (sports / cosmetic), mentor pearls (師承), lifestyle /
   patient education, or integrative TCM+biomed cases, read
   docs/SPECIALTY_EDUCATION_TRACK.md — specialty is a cross-cutting `domain`
   TAG, never a per-specialty container (DECISIONS D8).
8. For case↔knowledge bidirectional links ("used in 18 cases" panels), the
   patient/episode/visit hub UI, outcome-metric vocabulary, reflection
   prompts, the review queue's seven sources, or clinical-layer search, read
   docs/CLINICAL_GRAPH_TRACK.md — owner direction 2026-07-29. It also carries
   the reverse-index guard rail (DECISIONS D9) and the new evaluation weights
   (data structure 20% / search 18% / case-knowledge links 18% / visual 4%).

## 2026-08-11 — Ting 定案的專案目標(Fable×SOL 共識,Ting 蓋章)

> 上課/閱讀 → 知識卡 → 臨床使用 → 病人 outcome → practice audit →
> 發現知識缺口 → 自動補研究 → 回到更好的臨床決策與複習。

這不是「中醫版 EHR」。AcuTing OS 的終點是 Ting 的**第二醫學大腦 + 臨床記憶 +
個人研究系統**。所有優化以三個問題衡量(不以功能數):
少輸入一次了嗎?少查一次資料了嗎?這次看診產生的資料,下次學習、追蹤、研究能不能再利用?

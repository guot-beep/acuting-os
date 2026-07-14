# AcuTing OS — Standing Execution Plan

Written: 2026-07-12 (Claude, final session handoff). Per Ting's instruction,
this is THE ordered plan all agents follow until Ting or a Claude
architecture session revises it.

Document chain (read in this order when starting any session):
1. PROJECT_LOG.md (top entry) — what just happened
2. This file — what to do next, in order
3. docs/CODEX_TASK_QUEUE.md — the task's detailed spec
4. docs/NORTH_STAR.md — direction + permanent rules
5. AGENTS.md — safety rules (always wins on safety)
   (also read: DECISIONS.md — locked one-way doors;
   docs/LEARNING_LOOP_TRACK.md — knowledge-shape / learning-loop supplement)

## Rules of engagement (all agents, standing)

- Work strictly in the phase order below. Do not skip ahead.
- Anything marked [TING] waits for her decision — no exceptions.
- Anything marked [CLAUDE] needs a Claude session (app.js / integration /
  merge-conflict work). Codex does not attempt these unless Ting
  explicitly reassigns in writing.
- If a needed task is not in this plan or the queue: write a proposal into
  PROJECT_LOG, do NOT execute, wait for Ting.
- Every session: pull main first, one coherent batch, validate, log, push
  via branch/PR. Never commit directly to main while a PR flow is active.
- Sign log entries (Codex / Claude-B / Claude).

## Phase 1 — CloudTCM verification closure (now)

1.1 [TING] Adjudicate docs/CLOUDTCM_HIGH_RISK_DIFFS.md §A (15 location
    conflicts) + §B (9 depth conflicts). Verdict per record: keep ours /
    adopt CloudTCM / needs WHO-textbook check.
1.2 [CODEX] Apply Ting's §A/§B verdicts via a guarded one-off script
    (pattern: scripts/repair-mojibake-bl.js — verify current value before
    replacing, stamp provenance, dry-run then --apply, diff summary).
1.3 [TING] Approve §D (26 missing safety phrases) as APPEND-ONLY.
    [CODEX] Append them (never replace existing caution text).
1.4 [TING, optional] Approve batch adoption of the 272 wording-only
    CloudTCM location texts. [CODEX] Apply with a preview+diff first.
1.5 [CODEX] §C method conflicts (25): prepare a per-record worksheet with
    recommendation column; hand to Ting like §A/§B.

## Phase 2 — Runtime adapter [CLAUDE]

Execute docs/RUNTIME_ADAPTER_SPEC.md exactly. Prerequisite: Ting's
approval to retire the legacy deep-equal gate (spec step 1).
During this phase: freeze app.js, index.html, scripts/build-data.js for
all other agents. After it lands: the full 361 layer is live in the app.

## Phase 3 — Data hygiene + trust deepening

3.1 [CODEX] Encoding backlog triage: classify the 798 validate-encoding
    findings into (a) real damage, (b) false positives (pinyin/EN fields
    caught by the rule), (c) rule fixes needed. Report only; repairs are
    separate gated batches. Then allowlist/fix so validate-encoding can
    become a blocking check.
3.2 [CODEX] Track E conditions module (per CONDITIONS_MODULE_DESIGN):
    patterns → condition shortlist → category fill batches. PREREQUISITE
    for all 現代應用 content anywhere (Ting's dependency rule).
3.2b [CODEX] C2: fill the 92 formula skeletons — classical content first;
    modern_clinical_use_tags/related_conditions only AFTER Track E ids
    exist (batches of ~15, encoding guard between batches).
3.3 [CODEX] Herb content deepening on the rendered 202 (same pattern).
3.4 [TING+any] C1 source-check pilot when Bensky/school materials are
    available: 20–30 high-yield records draft → source_checked, one by one.
3.5 [CODEX] WHO SAPL location verification channel by channel (LU first),
    marking location fields source_checked per Ting-confirmed batch.

## Phase 4 — Study tools (H1 completion, school years)

4.1 [CLAUDE design → CODEX build] Quiz/drill mode reading the knowledge
    JSON: by channel, by category, by comparison_group; NCCAOM-shaped.
    Pure renderer feature — zero data changes.
4.2 [CODEX] Point/formula/herb detail-page status strips (review_status
    visible on every record — the content-status model made visible).
4.3 [CLAUDE] Cases UX: dialog segmentation per docs/CASE_SOAP_FLOW_REVIEW.md;
    Cases workspace reorder (working area above scaffolds).

## Phase 5 — Clinic readiness (H2, before first real patient)

5.1 [TING decision] Cases storage upgrade per NORTH_STAR §3-H2: export
    discipline first, durable local store when practice begins.
5.2 [CLAUDE design → CODEX build] Relationship graph UI from the validated
    relation files.
5.3 Billing/fertility workflow maturation inside Cases.

## Phase 6 — Outward (H3, graduation years)

AcuTing Learn static export (public_ready records only), per NORTH_STAR.
Do not start any public-facing work before Phase 3 trust is substantially
complete.

## Codex one-month self-serve schedule (2026-07-13 → 2026-08-10)

Ting's instruction: a month of queued work Codex does whenever he has
time. Rules: one slot per session, in order; if a slot is blocked by a
[TING] gate, SKIP to the next unblocked slot and note the skip in the log;
never touch the standing freezes below. Each slot ends with the standard
validators + a signed log entry.

### Week 1 — verification support + hygiene
- W1-1  §C worksheet: build the 25 method-conflict review sheet with a
        recommendation column (like §A/§B format) → docs, no data changes.
- W1-2  Encoding triage part 1: classify the 798 findings for
        data/herbs/formulas.json (367) — real damage vs false positive vs
        rule-fix; report only.
- W1-3  Encoding triage part 2: herb_canon_shortlist (202) +
        source_registry (123) same treatment.
- W1-4  Encoding triage part 3: remaining files; propose allowlist rules
        so validate-encoding can become blocking. STOP for Ting approval
        of the allowlist.
- W1-5  If Ting's §A/§B verdicts arrived: apply via guarded script (1.2).
        Else skip.

### Week 2 — conditions module first (Ting's dependency rule)
現代應用 content on points/formulas may ONLY reference condition ids —
so Track E runs before formula modern-use writing.
- W2-1  E1: pattern library skeleton (~50 records per
        CONDITIONS_MODULE_DESIGN). Requires Ting's design approval; if
        not yet given, ask once in the log and skip forward.
- W2-2  E2: 150-condition shortlist skeleton (ids/names/categories/
        icd_hint only). STOP for Ting scope review.
- W2-3..W2-5  C2 formula skeleton fills, CLASSICAL content only
        (組成/功效/主治/加減/禁忌 — 3 batches of ~30). Leave
        modern_clinical_use_tags / related_conditions EMPTY until Track E
        condition ids exist.

### Week 3 — conditions fill + herb deepening + WHO prep
- W3-0  If Ting approved the E2 scope: E3 first fill batch —
        gyn_fertility 25 conditions with red_flags + bidirectional 中西
        mappings. Else skip.
- W3-1..W3-3  Herb content deepening on the rendered 202: strengthen
        clinical_use_note + safety_flags for the ~75 already-filled
        records first, then the category-scaffold ones; 3 batches.
- W3-4  WHO SAPL verification worksheet: per-channel checklist docs
        (LU/LI first) listing each point's location_zh/location_en for
        side-by-side manual check — worksheet only, no status changes.
- W3-5  If Ting approved §D: append the 26 missing safety phrases.
        Else skip.

### Week 4 — UI polish inside Codex-safe areas
- W4-1  Status strips: show review_status/source_status pill on formula
        and herb cards in js/knowledge.js (Codex-owned since B2/B3).
        Do NOT touch app.js point pages — that waits for Phase 2.
- W4-2  Lookup empty/loading states + result-count consistency pass for
        the formula/herb sections.
- W4-3  VALIDATION_LOG.md consolidation: one summary table of all
        validators, what they cover, when last green.
- W4-4  DATA_MIGRATION_MAP refresh with everything the month changed.
- W4-5  Month-end handoff: single log entry summarizing the month,
        remaining skips, and what needs Ting/Claude next.

If all slots complete early: propose (do not start) next-month slots in
PROJECT_LOG and stop.

## Standing freezes (until the responsible phase)

- data/acupoints/361.json: only Phase-1 verdict applications and gated
  batches may touch it.
- app.js / index.html / build-data.js: frozen for Codex until Phase 2 lands.
- docs/CLOUDTCM_*: maintained by the Phase-1 flow only.
- legacy/, data/generated/ by hand: never.

# AcuTing OS Disease Knowledge Research Pack — CLEAN V2

**Date:** 2026-08-09

This is the deduplicated, expanded research/source pack for AcuTing OS disease knowledge work.

## What changed from the earlier pack

```text
removed duplicate variants
removed UPDATED / (1) / (2) naming
kept one final file per topic
expanded Western full research to 93 entries
expanded TCM Disease full research to 75 registered identities
expanded crosswalk research to 230 unique source->target atoms
rewrote stale foundation counts
added explicit indexes
added endpoint, safety, identity, source, readiness and QA files
added a final residual Board-gap queue instead of pretending research is complete
```

## Numbering

The numbering is modular:

```text
00-04  foundation / audits / masterlists
05-19  Western Condition research + index
20-39  TCM Disease research + TCM operational queues
40-59  crosswalk / relation research + guardrails
60-69  endpoint / safety / identity / source governance
70-89  schema / Board residual / readiness / QA
90     final handoff
```

Unused numbers are intentionally reserved. A jump such as `32 -> 40` or `63 -> 70` does **not** mean a missing file.

## Recommended reading order

```text
README
00
04
19
30
50
60
61
62
63
70
71
72
73
90
```

Open individual research batches only when working on that system.

## Non-negotiable ontology rule

```text
Western Condition != TCM Disease != Pattern != Symptom
```

A relation is not an identity equality.

## Non-negotiable ingestion rule

Research `candidate_id` values are staging only. Exact current repo identity/alias reconciliation comes first.

## P0 blockers

```text
TDIS canonical library path mismatch
sym.fever / sym.edema source-of-truth reconciliation
current Western canonical exact scan
```

## QA status

See `73_DEDUP_QA_AUDIT.md`.

The final pack is designed to contain no duplicate filename variants and no duplicate full-card identities.

# 00 — Scope and Locked Decisions

## 1. One-time goal

Create a stable **TCM Pattern V1** for every Pattern that is canonical in the live repository at execution time.

The UI currently reports 59 Pattern cards, but the repository is the source of truth. Historical snapshots show schema drift between registry/library/staging, so Sonnet must count and reconcile the CURRENT state before edits.

## 2. Locked canonical namespace

The only canonical Pattern namespace is:

```text
pattern.<english_slug>
```

Rules:

- existing canonical IDs are immutable
- ASCII lowercase + underscore
- do not create `pat.*`
- do not put Chinese characters in IDs
- `pattern_registry.json` is the ID authority
- `pattern_library.json` is the content layer
- old `tcm_pattern_canon.json` is staging/import evidence, not ID authority
- alias-map old source IDs to canonical IDs when appropriate
- never re-ID a Pattern merely for cosmetic consistency

## 3. Why this project is enrichment, not rewrite

Historical project audit found that the existing Pattern content was not empty. The core signs/tongue/pulse/treatment principles had been individually authored, while major gaps were:

- source provenance
- English key signs
- classification
- differential content
- formula links
- point links

Preserve valid existing content and deepen it.

## 4. Four diagnostic namespaces remain separate

```text
cond.*      biomedical condition
tdis.*      TCM disease
pattern.*   TCM differentiation pattern
sym.*       symptom/sign/observation
```

Do not merge them.

Pattern V1 completion must not turn a TCM Pattern into a TCM disease or a Western diagnosis.

## 5. Relationship law

Graph edges are authored on one side only according to the repository relation registry. Reverse links are derived.

Do NOT add a hand-maintained `related_conditions` array to Pattern cards merely because American Dragon lists the Pattern under many condition pages.

AD disease-page placement belongs to provenance/context unless an approved canonical relation already exists.

## 6. Current UI

The existing Pattern detail modal can be kept.

The data architecture may be extended additively when needed, but do not perform a visual rewrite merely to complete Pattern data.

## 7. Definition of one-time completion

“One-time” means:

- every current canonical Pattern audited
- every current canonical Pattern classified
- every required V1 field populated when reliable source evidence exists
- unsupported fields explicitly marked `not_supported` / `partial`, not hallucinated
- all source provenance retained
- all formula/point links resolve
- remaining AD-only concepts captured in staging
- validators pass
- current Pattern V1 can then be frozen

Future work should add new evidence or case-derived relationships, not repeatedly fill obvious basic holes.

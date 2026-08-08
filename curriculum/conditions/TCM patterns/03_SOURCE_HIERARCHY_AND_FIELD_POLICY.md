# 03 — Source Hierarchy and Field Policy

## Core rule

No single source should control the entire Pattern card.

Use each source for what it is strongest at.

---

# Tier / role matrix

| Card field | Preferred source role |
|---|---|
| Canonical ID | AcuTing `pattern_registry.json` only |
| Canonical Chinese/English name | current AcuTing decisions + accepted course/standard terminology |
| Classification | accepted TCM differentiation systems + current repo decisions |
| Etiology & pathomechanism | course/textbook/reference material already accepted by the project |
| Clinical manifestations | existing content + American Dragon + course/textbook corroboration |
| Tongue / coat / pulse | course/textbook + American Dragon |
| Treatment principle | current accepted AcuTing wording + course/textbook; AD corroboration |
| Formula candidates | existing AcuTing formula DB + AD formula pages/condition pages + course material |
| Point candidates | existing AcuTing point DB + AD + course material |
| Differential / exam pearls | course + board material + source-derived comparison |
| Board scope | NCBAHM 2026 + course materials |
| Biomedical safety | NOT part of AD Pattern enrichment; separate authoritative biomedical workflow |

---

# American Dragon

Best for:

- manifestations
- tongue
- coating
- pulse
- treatment-principle corroboration
- formula candidates
- point candidates
- source-associated clinical contexts

Weak / unsuitable as sole authority for:

- canonical ontology
- official pattern naming
- biomedical red flags
- ICD
- Western diagnosis equivalence
- emergency referral
- drug interaction rules

---

# Existing formula master data

The project already contains American Dragon formula syndromes and course formula material.

Use it as a powerful cross-check:

```text
formula → syndrome wording
formula → treatment action
formula → tongue/pulse/course indication
```

But remember:

```text
formula indication syndrome ≠ automatically a canonical Pattern
```

The formula data can:

- corroborate a Pattern
- resolve formula links
- identify missing staging candidates
- strengthen differential notes

It must not mass-expand the canonical Pattern universe without review.

---

# NCBAHM / board content

Use for:

- board scope
- official exam relevance
- exam-level distinctions when explicitly supported
- formula-pattern associations in board content

Do not treat an NCBAHM content outline as a full clinical textbook.

---

# CloudTCM

Keep exact source links and source categories.

Useful for:

- corroborative manifestations
- source taxonomy perspective
- traditional-source pointers
- source-page provenance

Do not recreate CloudTCM as a canonical diagnostic universe.

---

# Conflict policy

When sources differ:

1. preserve the current accepted canonical content
2. record the alternate source wording/context
3. do not silently average or reconcile
4. use source-scoped notes
5. flag true semantic conflict for review

Examples:

- one source says pulse is weak; another says deep-thready in a specific condition context
- one source uses “Heart Fire” while another uses “Heart Fire Blazing”
- formula candidates vary by disease context

These are not automatically errors.

# 06 — Pattern V1 Completeness Gate

Pattern V1 is complete only when EVERY current canonical Pattern has been audited.

## Hard gates

### Identity
- [ ] canonical ID unchanged
- [ ] Chinese name reviewed
- [ ] English name reviewed
- [ ] aliases normalized where useful

### Classification
- [ ] primary system assigned
- [ ] secondary tags reviewed
- [ ] Awaiting classification = 0

### Clinical content
- [ ] key signs bilingual
- [ ] supporting signs evaluated
- [ ] tongue evaluated
- [ ] coating evaluated
- [ ] pulse evaluated
- [ ] treatment principle bilingual

### Mechanism
- [ ] etiology/pathomechanism populated if reliable source exists
- [ ] otherwise explicitly partial / unsupported, never invented

### Differentiation
- [ ] nearest-confusion Patterns evaluated
- [ ] at least one differentiator where clinically meaningful
- [ ] all comparison IDs resolve

### Treatment links
- [ ] formula candidates evaluated
- [ ] formula IDs resolve
- [ ] point candidates evaluated
- [ ] point IDs resolve
- [ ] context-specific recommendations not flattened into universal rules

### Relations
- [ ] relation-registry policy followed
- [ ] no hand-maintained forbidden reverse relation
- [ ] no Western condition = TCM Pattern equivalence

### Provenance
- [ ] sources present
- [ ] exact AD URLs retained where used
- [ ] field/block provenance retained when schema supports it

### Quality
- [ ] no invented data to fill blanks
- [ ] no source conflict silently overwritten
- [ ] validators pass
- [ ] build-data passes
- [ ] encoding/content-junk checks pass
- [ ] git diff --check passes
- [ ] Pattern count does not accidentally shrink/grow

---

# Completeness states

Recommended semantic states:

```text
complete
partial_source_gap
not_applicable
blocked_ambiguity
```

Do not equate `partial_source_gap` with failure if reliable evidence genuinely is unavailable.

---

# Final report matrix

Sonnet should report every canonical Pattern:

| Pattern ID | Primary system | Core manifestations | Tongue/coat | Pulse | Mechanism | Differential | Formula | Points | Sources | V1 |
|---|---|---|---|---|---|---|---|---|---|---|

No current canonical Pattern may disappear from the final table.

---

# Freeze decision

Pattern V1 may be frozen when:

```text
100% current canonical patterns audited
0 awaiting classification
0 broken canonical links
0 unintended ID changes
0 silent content loss
all validators green or pre-existing failures explicitly unchanged
```

Some cards may retain `partial_source_gap` for a truly unsupported optional field, provided the gap is explicit and the card is otherwise structurally complete.

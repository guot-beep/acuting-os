# Relation Ingestion Readiness Rules

A staged relation atom is ready for canonical ingestion only when:

```yaml
source_endpoint_resolves: true
target_endpoint_resolves: true
source_namespace_correct: true
target_namespace_correct: true
identity_equality_not_implied: true
current_relation_vocabulary_match: true
provenance_attached: true
reverse_link_policy_known: true
safety_semantics_preserved: true
```

If either endpoint is missing, route it to the endpoint/identity queue rather than fabricating an ID.

If a UI needs the reverse direction, derive it whenever architecture permits rather than maintaining two manually independent truths.

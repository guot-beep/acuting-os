# Condition <-> TCM Disease Crosswalk Batch E - GI / Liver

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 24  
**Rule:** research semantics below are not permission to create new canonical edge types. Resolve both endpoints and map to CURRENT relation vocabulary at ingestion.

## Guardrail

```text
Western Condition != TCM Disease != Pattern != Symptom
association != equivalence
one authored direction + derived reverse preferred
```

# Relation atoms

| # | Source | Target | Staging relation | Endpoint status | Confidence | Guardrail |
|---:|---|---|---|---|---|---|
| 1 | `appendicitis candidate` | `tdis.fu_tong` | `DIFFERENTIAL_CONTEXT` | TDIS exists | high | acute RLQ pain needs surgical differential |
| 2 | `appendicitis candidate` | `sym.abdominal_pain` | `manifestation` | sym missing | high | core |
| 3 | `gastritis candidate` | `tdis.wei_tong` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | gastritis is one of many 胃痛 causes |
| 4 | `gastritis candidate` | `tdis.ou_tu` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | nausea/vomiting phenotype |
| 5 | `PUD candidate` | `tdis.wei_tong` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | not identity equality |
| 6 | `PUD candidate` | `bleeding` | `complication manifestation` | granularity review | high | GI bleed safety |
| 7 | `IBS candidate` | `tdis.fu_tong` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | abdominal pain |
| 8 | `IBS candidate` | `tdis.xie_xie` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | high | IBS-D only |
| 9 | `IBS candidate` | `tdis.bian_mi` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | high | IBS-C only |
| 10 | `IBD parent` | `tdis.xie_xie` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | diarrhea phenotype only |
| 11 | `IBD parent` | `tdis.fu_tong` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | pain phenotype |
| 12 | `IBD parent` | `sym.diarrhea` | `manifestation` | sym missing | high | high reuse |
| 13 | `acute pancreatitis candidate` | `tdis.fu_tong` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium-high | severe epigastric pain is emergency context |
| 14 | `acute pancreatitis candidate` | `sym.vomiting` | `manifestation` | sym missing | high | common |
| 15 | `gallstone disease candidate` | `tdis.xie_tong` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | RUQ/hypochondriac pain context |
| 16 | `gallstone disease candidate` | `tdis.huang_dan` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | obstruction only |
| 17 | `bowel obstruction candidate` | `tdis.fu_tong` | `DIFFERENTIAL_CONTEXT` | TDIS exists | high | acute abdomen |
| 18 | `bowel obstruction candidate` | `tdis.ou_tu` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | vomiting common |
| 19 | `bowel obstruction candidate` | `tdis.bian_mi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | obstipation is not ordinary constipation |
| 20 | `cirrhosis candidate` | `tdis.shui_zhong` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | ascites/edema context |
| 21 | `cirrhosis candidate` | `tdis.huang_dan` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | jaundice context |
| 22 | `viral hepatitis parent` | `tdis.huang_dan` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium | jaundice not universal |
| 23 | `viral hepatitis parent` | `sym.fatigue` | `manifestation` | EXISTS | medium | nonspecific |
| 24 | `colorectal cancer candidate` | `tdis.bian_mi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low-medium | new bowel change must not be normalized |


# Safety / semantic clusters

## Acute abdomen

`tdis.fu_tong` should act as a gateway to appendicitis, obstruction, pancreatitis, ectopic pregnancy and other acute-abdomen causes.

## GI bleeding

A shared bleeding endpoint/safety object is safer than duplicating thresholds across PUD, cirrhosis, colorectal disease and gynecology.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 24
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```

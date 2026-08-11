# Condition <-> TCM Disease Crosswalk Batch D - Emergency / Vascular

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
| 1 | `DVT candidate` | `sym.unilateral_leg_swelling` | `manifestation` | sym missing | high | generic edema alone loses laterality |
| 2 | `DVT candidate` | `sym.leg_pain` | `manifestation` | sym missing | medium-high | nonspecific |
| 3 | `DVT candidate` | `PE candidate` | `VTE_RELATED_CONDITION` | both staging | high | related states, not same identity |
| 4 | `DVT candidate` | `tdis.shui_zhong` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low-medium | unilateral DVT swelling must not normalize to generic 水腫 |
| 5 | `PE candidate` | `sym.dyspnea` | `manifestation` | sym missing | high | core emergency symptom |
| 6 | `PE candidate` | `sym.chest_pain` | `manifestation` | sym missing | high | core emergency symptom |
| 7 | `PE candidate` | `sym.syncope` | `manifestation` | sym missing | medium-high | severity context |
| 8 | `PE candidate` | `tdis.chuan_zheng` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | acute dyspnea requires PE triage |
| 9 | `PE candidate` | `tdis.xiong_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | acute chest pain triage |
| 10 | `MI candidate` | `sym.chest_pain` | `manifestation` | sym missing | high | classic but not universal |
| 11 | `MI candidate` | `sym.dyspnea` | `manifestation` | sym missing | high | may be anginal equivalent |
| 12 | `MI candidate` | `tdis.xiong_bi` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | ontology remains distinct |
| 13 | `MI candidate` | `tdis.xin_ji` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | arrhythmic/palpitation context only |
| 14 | `angina candidate` | `tdis.xiong_bi` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | not identity equality |
| 15 | `angina candidate` | `sym.chest_pain` | `manifestation` | sym missing | high | core syndrome |
| 16 | `aortic aneurysm candidate` | `sym.back_pain` | `manifestation` | sym missing | medium | location dependent |
| 17 | `aortic aneurysm candidate` | `sym.abdominal_pain` | `manifestation` | sym missing | medium | AAA context |
| 18 | `aortic aneurysm candidate` | `tdis.xiong_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low-medium | thoracic pain only |
| 19 | `TIA candidate` | `cond.stroke` | `HIGH_VALUE_WARNING_RELATION` | stroke exists | high | TIA warns of stroke but is distinct |
| 20 | `TIA candidate` | `sym.speech_difficulty` | `manifestation` | sym missing | high | focal neuro deficit |
| 21 | `TIA candidate` | `sym.acute_visual_loss` | `manifestation` | sym missing | high | retinal/cerebral ischemia context |
| 22 | `GCA candidate` | `sym.headache` | `manifestation` | EXISTS | high | new headache age-context important |
| 23 | `GCA candidate` | `sym.acute_visual_loss` | `emergency manifestation` | sym missing | high | vision-threatening ischemia |
| 24 | `pneumothorax candidate` | `tdis.chuan_zheng` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium-high | acute post-needling dyspnea safety |


# Safety / semantic clusters

## Acute chest pain

MI, angina, PE, aortic disease and pneumothorax share symptom surfaces. `tdis.xiong_bi` must route into, not suppress, biomedical emergency triage.

## VTE

DVT and PE belong to the same VTE family but are distinct clinical states; reverse links should be derived rather than duplicatively authored.

## Acute focal neurologic deficit

TIA and stroke require the same emergency-recognition surface even when symptoms resolve.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 24
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```

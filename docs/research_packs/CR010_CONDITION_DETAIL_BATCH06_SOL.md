# CR-010 Common-300 Detail Batch 06 — SOL

- Source commit: `2ddced2`
- Scope: live ranks 46–60, 15 exact IDs, copied from the repo live queue.
- Merge policy: PRESERVE_EXISTING / EXISTING_ENRICH.
- Safety: NO PHI, NOT CANONICAL, no cross-reference auto-resolution.
- Every condition includes bilingual summary, context, pathology, etiology, structured risk factors, structured red flags, acupuncture scope, sources, and field_sources.
- Acupuncture evidence is `unknown` unless a condition-specific efficacy guideline is verified. An NCI clinical-trial page for CIPN was reviewed as research context but was not upgraded to a guideline claim.

## Authorities used

NHLBI (central sleep apnea, chronic bronchitis); CDC (cerebral palsy, cervicitis, chronic hepatitis C); AAO-HNSF/ENT Health (cerumen impaction); NCI (cervical dysplasia, CIPN); RCOG/SMFM (cervical insufficiency); American Migraine Foundation (cervicogenic headache); NEI (open-angle glaucoma); NIDDK (chronic pancreatitis); AUA (chronic scrotal pain); Society for Vascular Surgery (chronic venous insufficiency); NINDS (CIDP). Exact URLs are embedded per record and in field_sources.

## Known limits

- The live queue file's summary still reports the pre-Batch-05 maturity counts. This pack uses it only for exact rank/ID ordering. Current repo log reports full_detail 115 after Batch 05.
- No TCM pattern, formula, acupoint, or condition cross-reference was resolved automatically.
- Staging content requires ingestion-owner review before canonical merge.

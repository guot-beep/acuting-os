# C2.1 Formula Content Probe Summary

Status: `draft_review_gate`

This probe tests field-level sourcing and preview behavior only. No staging
record has been applied to `data/herbs/formulas.json`, and the preview tool has
no apply mode.

## Coverage

| Formula | Staged fields | Staged items | Evidence shape | Deliberately not staged |
| --- | ---: | ---: | --- | --- |
| Da Chai Hu Tang | 8 | 21 | Direct Ting formula note + HKBU + Taiwan MOHW | Dose, modern links, review promotion |
| Si Ni San | 3 | 8 | HKBU + Taiwan MOHW | Exam track, contraindications, dose, modern links |
| Tong Xie Yao Fang | 5 | 13 | HKBU formula facts + Ting FOM/diarrhea comparison context | Contraindications, dose, modern links |
| Gan Mai Da Zao Tang | 3 | 7 | Taiwan MOHW + HKBU additional-formula record | Exam track, modern condition links, dose |
| Suan Zao Ren Tang | 5 | 15 | HKBU formula facts + Ting insomnia comparison context | Contraindications, modern condition links, dose |
| **Total** | **24** | **64** | Five review-only records | **0 canonical writes** |

## Source Boundaries

- Institutional formula records support identity, composition, actions, and
  classical pattern indications.
- A direct Ting formula page supports formula-specific exam wording when one
  exists.
- Condition or foundations course notes support only the comparison context
  they explicitly contain; they are not treated as full formula monographs.
- Missing evidence remains an empty field. Indirect search hits are not used
  to manufacture a complete-looking record.
- All records remain `draft`; Bensky textbook verification is still pending.

## Preview Results

| Batch | Conflicts | Canonical writes |
| --- | ---: | ---: |
| `c2_1_probe_da_chai_hu_tang` | 0 | 0 |
| `c2_1_probe_si_ni_san` | 0 | 0 |
| `c2_1_probe_tong_xie_yao_fang` | 0 | 0 |
| `c2_1_probe_gan_mai_da_zao_tang` | 0 | 0 |
| `c2_1_probe_suan_zao_ren_tang` | 0 | 0 |

## Review Gate

Before any apply-capable path is designed, Ting/Claude should decide:

1. Whether institutional-only records may populate classical fields while
   exam-track fields stay empty.
2. Whether condition-course notes may populate narrowly scoped exam comparison
   fields when no direct formula monograph exists.
3. How field-level source evidence will persist beside canonical values.
4. Whether the 24-field / 64-item probe is accepted as the model for C2.1.

No expansion beyond this five-formula probe is authorized by this report.

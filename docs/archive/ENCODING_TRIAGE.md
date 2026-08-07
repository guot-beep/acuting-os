# Encoding Triage

Generated: 2026-07-11T22:53:34.664Z

## Scope

Baseline is `HEAD` after `19bfa9e`, not the current dirty working tree. This avoids mixing the uncommitted formula B2 work into the encoding audit.

Frozen / excluded from repair today:
- `data/acupoints/361.json` repair is frozen pending Ting Section A/B / CloudTCM D3 gates.
- `docs/CLOUDTCM_*` is frozen.
- `data/imports/cloudtcm/*` replacement-character findings remain staging/import findings, not repair targets today.
- English placeholder fields are content-completion work, not mojibake repair.

## Class Counts

| Class | Count | Decision |
|---|---:|---|
| 1. question_mark_damage / question_mark_only | 333 | True damage; audited for git recoverability. |
| 2. replacement_char | 62 | Staging/import issue in CloudTCM raw/staging; do not repair today. |
| 3. chinese_field_without_cjk | 403 | Mostly English placeholders in Chinese-labeled fields; content-completion backlog, not encoding repair. |
| Total findings | 798 | Matches validate-encoding baseline. |

## Class 1: Question-Mark Damage Recoverability

Git-history audit method: for each affected file, inspect tracked history with `git log --follow -- <file>` and compare each current JSON path against prior committed versions. A field is considered git-recoverable only if an older committed value at the same JSON path contains CJK text and no question-mark damage.

| File | Findings | Git recoverable | Not recoverable | Repair decision |
|---|---:|---:|---:|---|
| `data/acupoints/361.json` | 7 | 0 | 7 | Frozen; no git source found |
| `data/herbs/formulas.json` | 184 | 0 | 184 | External/source-aware refill required |
| `data/learn/content_architecture_seed.json` | 1 | 0 | 1 | External/source-aware refill required |
| `data/pathology/condition_graph_expansion.json` | 9 | 0 | 9 | External/source-aware refill required |
| `data/pathology/conditions.json` | 9 | 0 | 9 | External/source-aware refill required |
| `data/sources/source_registry.json` | 123 | 0 | 123 | External/source-aware refill required |

### Git-Recoverable Fields

None. B2 repair does not start today because there are no clearly git-recoverable question-mark fields.

### Not Git-Recoverable Fields

These fields appear to have entered the repository already damaged or without a prior correct Chinese value at the same JSON path. They need source-aware refill, not git restore.

#### data/acupoints/361.json

Summary: 7/7 not git-recoverable. Oldest bad commit(s) observed: dc284d8.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$[60].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[61].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[62].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[63].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[64].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[65].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |
| `$[66].needling.technique` | question_mark_only | `?????????????????` | `dc284d8` |

#### data/herbs/formulas.json

Summary: 184/184 not git-recoverable. Oldest bad commit(s) observed: a0ea722.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$.records[0].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[0].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[0].modifications_zh[0]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[0].modifications_zh[1]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[0].contraindications_zh[0]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[0].contraindications_zh[1]` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[0].pattern_indications_zh[0]` | question_mark_only | `???????` | `a0ea722` |
| `$.records[0].pattern_indications_zh[1]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[0].chinese_depth_track.fang_yi_zh` | question_mark_only | `????????????????????????????????` | `a0ea722` |
| `$.records[0].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[1].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[1].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[1].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[1].modifications_zh[1]` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[1].contraindications_zh[0]` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[1].pattern_indications_zh[0]` | question_mark_only | `???????` | `a0ea722` |
| `$.records[1].pattern_indications_zh[1]` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[1].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[1].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[2].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[2].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[2].modifications_zh[0]` | question_mark_only | `???????????` | `a0ea722` |
| `$.records[2].modifications_zh[1]` | question_mark_damage | `??????????/????` | `a0ea722` |
| `$.records[2].contraindications_zh[0]` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[2].pattern_indications_zh[0]` | question_mark_only | `??????` | `a0ea722` |
| `$.records[2].pattern_indications_zh[1]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[2].chinese_depth_track.fang_yi_zh` | question_mark_only | `???????????????????????????????????` | `a0ea722` |
| `$.records[2].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[3].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[3].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[3].modifications_zh[0]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[3].modifications_zh[1]` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[3].contraindications_zh[0]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[3].pattern_indications_zh[0]` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[3].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????????` | `a0ea722` |
| `$.records[3].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[4].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[4].modifications_zh[0]` | question_mark_only | `???????????` | `a0ea722` |
| `$.records[4].modifications_zh[1]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[4].contraindications_zh[0]` | question_mark_only | `??????????????????????` | `a0ea722` |
| `$.records[4].pattern_indications_zh[0]` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[4].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????????????????` | `a0ea722` |
| `$.records[4].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[5].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[5].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[5].modifications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[5].modifications_zh[1]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[5].contraindications_zh[0]` | question_mark_only | `????????????????????` | `a0ea722` |
| `$.records[5].pattern_indications_zh[0]` | question_mark_only | `??????????` | `a0ea722` |
| `$.records[5].chinese_depth_track.fang_yi_zh` | question_mark_only | `?????????????????????????????????????` | `a0ea722` |
| `$.records[5].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[6].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[6].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[6].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[6].modifications_zh[1]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[6].contraindications_zh[0]` | question_mark_only | `??????????????????????` | `a0ea722` |
| `$.records[6].pattern_indications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[6].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[6].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[7].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[7].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[7].modifications_zh[1]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[7].contraindications_zh[0]` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[7].pattern_indications_zh[0]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[7].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[7].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `????????????????` | `a0ea722` |
| `$.records[8].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[8].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[8].actions_zh[2]` | question_mark_only | `????` | `a0ea722` |
| `$.records[8].modifications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[8].modifications_zh[1]` | question_mark_only | `??????????` | `a0ea722` |
| `$.records[8].contraindications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[8].pattern_indications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[8].chinese_depth_track.fang_yi_zh` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[8].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[9].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[9].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[9].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[9].modifications_zh[1]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[9].contraindications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[9].pattern_indications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[9].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????????????` | `a0ea722` |
| `$.records[9].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `????????????????` | `a0ea722` |
| `$.records[10].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[10].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[10].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[10].modifications_zh[1]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[10].contraindications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[10].pattern_indications_zh[0]` | question_mark_only | `??????????????????????` | `a0ea722` |
| `$.records[10].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[10].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????????????` | `a0ea722` |
| `$.records[11].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[11].modifications_zh[0]` | question_mark_only | `???????????` | `a0ea722` |
| `$.records[11].modifications_zh[1]` | question_mark_only | `????????????????` | `a0ea722` |
| `$.records[11].contraindications_zh[0]` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[11].pattern_indications_zh[0]` | question_mark_only | `????????????????` | `a0ea722` |
| `$.records[11].chinese_depth_track.fang_yi_zh` | question_mark_only | `?????????????????????????????` | `a0ea722` |
| `$.records[11].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[12].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[12].modifications_zh[0]` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[12].modifications_zh[1]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[12].contraindications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[12].pattern_indications_zh[0]` | question_mark_only | `????????` | `a0ea722` |
| `$.records[12].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????` | `a0ea722` |
| `$.records[12].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[13].actions_zh[0]` | question_mark_only | `?????` | `a0ea722` |
| `$.records[13].modifications_zh[0]` | question_mark_only | `???????????` | `a0ea722` |
| `$.records[13].modifications_zh[1]` | question_mark_damage | `???????/???????` | `a0ea722` |
| `$.records[13].contraindications_zh[0]` | question_mark_damage | `????????/????????????` | `a0ea722` |
| `$.records[13].pattern_indications_zh[0]` | question_mark_only | `????????` | `a0ea722` |
| `$.records[13].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????????????????` | `a0ea722` |
| `$.records[13].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[14].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[14].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[14].modifications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[14].modifications_zh[1]` | question_mark_only | `?????????????????` | `a0ea722` |
| `$.records[14].contraindications_zh[0]` | question_mark_only | `????????????????????` | `a0ea722` |
| `$.records[14].pattern_indications_zh[0]` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[14].chinese_depth_track.fang_yi_zh` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[14].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[15].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[15].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[15].modifications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[15].modifications_zh[1]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[15].contraindications_zh[0]` | question_mark_only | `???????????????????????????` | `a0ea722` |
| `$.records[15].pattern_indications_zh[0]` | question_mark_only | `????????????????????` | `a0ea722` |
| `$.records[15].chinese_depth_track.fang_yi_zh` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[15].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????????????` | `a0ea722` |
| `$.records[16].actions_zh[0]` | question_mark_only | `??????` | `a0ea722` |
| `$.records[16].actions_zh[1]` | question_mark_only | `??????` | `a0ea722` |
| `$.records[16].modifications_zh[0]` | question_mark_damage | `??/??????????????????` | `a0ea722` |
| `$.records[16].contraindications_zh[0]` | question_mark_only | `????????????????????????????` | `a0ea722` |
| `$.records[16].pattern_indications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[16].chinese_depth_track.fang_yi_zh` | question_mark_only | `????????????????????????????????????????????` | `a0ea722` |
| `$.records[16].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????????` | `a0ea722` |
| `$.records[17].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[17].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[17].actions_zh[2]` | question_mark_only | `????` | `a0ea722` |
| `$.records[17].modifications_zh[0]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[17].modifications_zh[1]` | question_mark_only | `??????????` | `a0ea722` |
| `$.records[17].contraindications_zh[0]` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[17].pattern_indications_zh[0]` | question_mark_only | `????????????????????` | `a0ea722` |
| `$.records[17].chinese_depth_track.fang_yi_zh` | question_mark_only | `????????????????????????????????` | `a0ea722` |
| `$.records[17].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[18].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[18].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[18].modifications_zh[0]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[18].modifications_zh[1]` | question_mark_only | `??????????` | `a0ea722` |
| `$.records[18].contraindications_zh[0]` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[18].pattern_indications_zh[0]` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[18].chinese_depth_track.fang_yi_zh` | question_mark_only | `?????????????????????????????` | `a0ea722` |
| `$.records[18].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[19].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[19].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[19].modifications_zh[0]` | question_mark_only | `???????????` | `a0ea722` |
| `$.records[19].modifications_zh[1]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[19].contraindications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[19].pattern_indications_zh[0]` | question_mark_only | `??????????????????????` | `a0ea722` |
| `$.records[19].chinese_depth_track.fang_yi_zh` | question_mark_only | `??????????????????????????????????` | `a0ea722` |
| `$.records[19].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[20].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[20].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[20].actions_zh[2]` | question_mark_only | `??` | `a0ea722` |
| `$.records[20].modifications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[20].contraindications_zh[0]` | question_mark_only | `????????????????????????` | `a0ea722` |
| `$.records[20].pattern_indications_zh[0]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[20].chinese_depth_track.fang_yi_zh` | question_mark_only | `?????????????????????????` | `a0ea722` |
| `$.records[20].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[21].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[21].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[21].modifications_zh[0]` | question_mark_only | `??????????????` | `a0ea722` |
| `$.records[21].modifications_zh[1]` | question_mark_only | `??????????` | `a0ea722` |
| `$.records[21].contraindications_zh[0]` | question_mark_only | `???????????????????????` | `a0ea722` |
| `$.records[21].pattern_indications_zh[0]` | question_mark_only | `?????????` | `a0ea722` |
| `$.records[21].chinese_depth_track.fang_yi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[21].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `???????????????????` | `a0ea722` |
| `$.records[22].actions_zh[0]` | question_mark_only | `????` | `a0ea722` |
| `$.records[22].actions_zh[1]` | question_mark_only | `????` | `a0ea722` |
| `$.records[22].modifications_zh[0]` | question_mark_only | `???????????????` | `a0ea722` |
| `$.records[22].modifications_zh[1]` | question_mark_only | `????????????` | `a0ea722` |
| `$.records[22].contraindications_zh[0]` | question_mark_only | `?????????????????????????????` | `a0ea722` |
| `$.records[22].pattern_indications_zh[0]` | question_mark_only | `?????????????` | `a0ea722` |
| `$.records[22].chinese_depth_track.fang_yi_zh` | question_mark_only | `????????????????????????????????????????????` | `a0ea722` |
| `$.records[22].chinese_depth_track.zhu_zhi_zh` | question_mark_only | `??????????????????????` | `a0ea722` |

#### data/learn/content_architecture_seed.json

Summary: 1/1 not git-recoverable. Oldest bad commit(s) observed: dc284d8.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$.categories[1].title_zh` | question_mark_only | `????` | `dc284d8` |

#### data/pathology/condition_graph_expansion.json

Summary: 9/9 not git-recoverable. Oldest bad commit(s) observed: 4e1b6fc.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$.western_conditions[6].name_zh` | question_mark_only | `?????????` | `4e1b6fc` |
| `$.western_conditions[7].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.western_conditions[8].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.western_conditions[9].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.western_conditions[10].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.western_conditions[11].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.tcm_patterns[5].name_zh` | question_mark_only | `??` | `4e1b6fc` |
| `$.tcm_patterns[6].name_zh` | question_mark_only | `??` | `4e1b6fc` |
| `$.tcm_patterns[7].name_zh` | question_mark_only | `??` | `4e1b6fc` |

#### data/pathology/conditions.json

Summary: 9/9 not git-recoverable. Oldest bad commit(s) observed: 4e1b6fc.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$.records[6].name_zh` | question_mark_only | `?????????` | `4e1b6fc` |
| `$.records[7].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.records[8].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.records[9].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.records[10].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.records[11].name_zh` | question_mark_only | `????????` | `4e1b6fc` |
| `$.tcm_patterns[5].name_zh` | question_mark_only | `??` | `4e1b6fc` |
| `$.tcm_patterns[6].name_zh` | question_mark_only | `??` | `4e1b6fc` |
| `$.tcm_patterns[7].name_zh` | question_mark_only | `??` | `4e1b6fc` |

#### data/sources/source_registry.json

Summary: 123/123 not git-recoverable. Oldest bad commit(s) observed: e2e5b02.

| JSON path | Type | Current value | Oldest bad commit |
|---|---|---|---|
| `$.sources[0].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[1].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[2].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[3].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[3].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[4].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[5].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[6].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[7].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[7].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[7].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[8].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[9].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[10].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[11].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[12].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[12].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[12].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[12].category[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[13].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[13].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[14].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[14].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[14].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[14].category[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[15].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[15].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[16].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[16].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[16].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[16].category[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[17].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[17].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[17].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[17].category[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[18].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[18].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[19].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[20].name` | question_mark_only | `????????????` | `e2e5b02` |
| `$.sources[20].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[20].primary_use[0]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[20].primary_use[1]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[20].primary_use[2]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[21].name` | question_mark_only | `???????????????????` | `e2e5b02` |
| `$.sources[21].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[22].name` | question_mark_only | `???????` | `e2e5b02` |
| `$.sources[22].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[22].primary_use[0]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[22].primary_use[1]` | question_mark_only | `??????` | `e2e5b02` |
| `$.sources[23].name` | question_mark_damage | `????? / ??????` | `e2e5b02` |
| `$.sources[23].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].category[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].primary_use[3]` | question_mark_only | `???` | `e2e5b02` |
| `$.sources[23].primary_use[4]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[23].primary_use[5]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].name` | question_mark_damage | `??????????????????, cckf.org?` | `e2e5b02` |
| `$.sources[24].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].primary_use[1]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[24].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].primary_use[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[24].primary_use[4]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[24].primary_use[5]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[25].name` | question_mark_damage | `TCMIP ?????????` | `e2e5b02` |
| `$.sources[25].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[25].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[25].primary_use[0]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[25].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[25].primary_use[2]` | question_mark_only | `??????` | `e2e5b02` |
| `$.sources[25].primary_use[3]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[26].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[26].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[26].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[26].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[26].primary_use[3]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[27].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].primary_use[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[27].primary_use[4]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[28].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].primary_use[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[28].primary_use[4]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[29].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].primary_use[3]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[29].primary_use[4]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[30].name` | question_mark_only | `???????????` | `e2e5b02` |
| `$.sources[30].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[30].primary_use[0]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[30].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[30].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].category[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].category[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].primary_use[3]` | question_mark_only | `???` | `e2e5b02` |
| `$.sources[31].primary_use[4]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[31].primary_use[5]` | question_mark_only | `????` | `e2e5b02` |
| `$.sources[32].name` | question_mark_damage | `????? / ???????` | `e2e5b02` |
| `$.sources[32].category[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[32].primary_use[0]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[32].primary_use[1]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[32].primary_use[2]` | question_mark_only | `??` | `e2e5b02` |
| `$.sources[32].primary_use[3]` | question_mark_only | `????` | `e2e5b02` |

## Class 2: Replacement Characters

These are U+FFFD replacement-character findings, currently concentrated in CloudTCM import raw/staging data. They are excluded from today repair because imports are staging and gated by D3 review.

| File | Count |
|---|---:|
| `data/imports/cloudtcm/staging_points.json` | 13 |
| `data/imports/cloudtcm/points/LI1.json` | 3 |
| `data/imports/cloudtcm/points/LI2.json` | 2 |
| `data/imports/cloudtcm/points/LU2.json` | 2 |
| `data/imports/cloudtcm/points/LU5.json` | 2 |
| `data/imports/cloudtcm/points/BL17.json` | 1 |
| `data/imports/cloudtcm/points/BL21.json` | 1 |
| `data/imports/cloudtcm/points/BL51.json` | 1 |
| `data/imports/cloudtcm/points/BL56.json` | 1 |
| `data/imports/cloudtcm/points/BL9.json` | 1 |
| `data/imports/cloudtcm/points/CV13.json` | 1 |
| `data/imports/cloudtcm/points/CV15.json` | 1 |
| `data/imports/cloudtcm/points/CV21.json` | 1 |
| `data/imports/cloudtcm/points/CV5.json` | 1 |
| `data/imports/cloudtcm/points/CV8.json` | 1 |
| `data/imports/cloudtcm/points/GB23.json` | 1 |
| `data/imports/cloudtcm/points/GB4.json` | 1 |
| `data/imports/cloudtcm/points/GB43.json` | 1 |
| `data/imports/cloudtcm/points/GB5.json` | 1 |
| `data/imports/cloudtcm/points/GV12.json` | 1 |
| `data/imports/cloudtcm/points/GV19.json` | 1 |
| `data/imports/cloudtcm/points/HT3.json` | 1 |
| `data/imports/cloudtcm/points/KI17.json` | 1 |
| `data/imports/cloudtcm/points/KI21.json` | 1 |
| `data/imports/cloudtcm/points/LI10.json` | 1 |
| `data/imports/cloudtcm/points/LI4.json` | 1 |
| `data/imports/cloudtcm/points/LR3.json` | 1 |
| `data/imports/cloudtcm/points/LU1.json` | 1 |
| `data/imports/cloudtcm/points/LU11.json` | 1 |
| `data/imports/cloudtcm/points/LU4.json` | 1 |
| `data/imports/cloudtcm/points/LU6.json` | 1 |
| `data/imports/cloudtcm/points/LU7.json` | 1 |
| `data/imports/cloudtcm/points/LU8.json` | 1 |
| `data/imports/cloudtcm/points/PC1.json` | 1 |
| `data/imports/cloudtcm/points/SI2.json` | 1 |
| `data/imports/cloudtcm/points/SI6.json` | 1 |
| `data/imports/cloudtcm/points/SP20.json` | 1 |
| `data/imports/cloudtcm/points/SP6.json` | 1 |
| `data/imports/cloudtcm/points/ST32.json` | 1 |
| `data/imports/cloudtcm/points/ST38.json` | 1 |
| `data/imports/cloudtcm/points/ST4.json` | 1 |
| `data/imports/cloudtcm/points/ST9.json` | 1 |
| `data/imports/cloudtcm/points/TE19.json` | 1 |
| `data/imports/cloudtcm/points/TE20.json` | 1 |
| `data/imports/cloudtcm/points/TE21.json` | 1 |

## Class 3: Chinese-Labeled Field Without CJK

These are not necessarily encoding damage. Most are English placeholders in Chinese-depth fields or schema/design text. They belong to content-completion / schema cleanup, not mojibake repair.

| File | Count | Workstream |
|---|---:|---|
| `data/herbs/herb_canon_shortlist.json` | 202 | Herb Chinese-depth content completion |
| `data/herbs/formulas.json` | 183 | Formula Chinese content repair/fill, source-aware |
| `data/pathology/condition_graph_expansion.json` | 6 | Content completion / field naming review |
| `data/pathology/conditions.json` | 6 | Content completion / field naming review |
| `data/acupoints/schema.json` | 4 | Likely false positive / schema wording review |
| `data/clinical_cases/patient_record_system_map.json` | 1 | Likely false positive / schema wording review |
| `data/learn/content_architecture_seed.json` | 1 | Content completion / field naming review |

## B2 Decision

Do not start B2 today. The audit found zero clearly git-recoverable question-mark fields. Any actual repair would require external/source-aware refill or a separate gated decision, and several affected areas are explicitly frozen.

## Next Recommended Actions

1. Keep `validate-encoding` as the baseline guard.
2. After the exam / freeze window, repair small source-aware files first: `data/sources/source_registry.json`, then pathology names.
3. Treat formula Chinese `???` fields as part of the formula content/source-check workflow, not git restore.
4. Leave CloudTCM import replacement chars to the D3 gated review process.

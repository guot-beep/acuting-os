# Acupoint Protocol Anatomy Summary

Review-only extraction from peer-reviewed human-study tables. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points checked | 361 |
| Source table rows | 12 |
| Unique points | 11 |
| Fill-empty field proposals | 8 |
| Proposed values | 12 |
| Cross-source conflicts | 1 |
| Withheld/existing-field skips | 2 |
| Canonical writes | 0 |

## Fill-Empty Proposals

| Point | Field | Proposed values | Sources |
| --- | --- | --- | --- |
| `LI4` 合谷 | `muscles` | first dorsal interosseous muscle<br>second lumbrical muscle<br>adductor pollicis muscle | `wu_pcos_acupuncture_protocol_2013` |
| `PC6` 內關 | `muscles` | flexor digitorum superficialis muscle | `wu_pcos_acupuncture_protocol_2013` |
| `SP6` 三陰交 | `muscles` | flexor digitorum longus muscle<br>tibialis posterior muscle | `wu_pcos_acupuncture_protocol_2013` |
| `SP9` 陰陵泉 | `muscles` | gastrocnemius muscle | `wu_pcos_acupuncture_protocol_2013` |
| `ST25` 天樞 | `muscles` | rectus abdominis muscle | `wu_pcos_acupuncture_protocol_2013` |
| `ST29` 歸來 | `muscles` | rectus abdominis muscle | `wu_pcos_acupuncture_protocol_2013` |
| `ST36` 足三里 | `muscles` | tibialis anterior muscle | `takahashi_lower_limb_hemodynamics_2012` |
| `ST36` 足三里 | `nerves` | lateral cutaneous nerve of the calf<br>deep fibular nerve | `takahashi_lower_limb_hemodynamics_2012` |

## Extracted Study Table

| Point | Protocol tissue/path | Segmental innervation | Conflict status |
| --- | --- | --- | --- |
| `CV3` 中極 | fibrous tissue; linea alba (wu_pcos_acupuncture_protocol_2013) | L1 | none |
| `CV6` 氣海 | fibrous tissue; linea alba (wu_pcos_acupuncture_protocol_2013) | T11 | none |
| `GV20` 百會 | epicranial aponeurosis (wu_pcos_acupuncture_protocol_2013) | C2-C3; trigeminal nerve | none |
| `LI4` 合谷 | first dorsal interosseous muscle; second lumbrical muscle; adductor pollicis muscle (wu_pcos_acupuncture_protocol_2013) | C8; T1 | none |
| `LR3` 太衝 | first dorsal interosseous muscle (wu_pcos_acupuncture_protocol_2013)<br>extensor digitorum brevis muscle (takahashi_lower_limb_hemodynamics_2012) | S2-S3; cutaneous L5; muscle L5; muscle S1 | cross_source_review_required |
| `PC6` 內關 | flexor digitorum superficialis muscle (wu_pcos_acupuncture_protocol_2013) | C8; T1 | none |
| `SP6` 三陰交 | flexor digitorum longus muscle; tibialis posterior muscle (wu_pcos_acupuncture_protocol_2013) | L4-L5; S1-S2 | none |
| `SP9` 陰陵泉 | gastrocnemius muscle (wu_pcos_acupuncture_protocol_2013) | S1-S2 | none |
| `ST25` 天樞 | rectus abdominis muscle (wu_pcos_acupuncture_protocol_2013) | T6-T12 | none |
| `ST29` 歸來 | rectus abdominis muscle (wu_pcos_acupuncture_protocol_2013) | T6-T12 | none |
| `ST36` 足三里 | tibialis anterior muscle (takahashi_lower_limb_hemodynamics_2012) | cutaneous L5; cutaneous S1; cutaneous S2; muscle L4; muscle L5 | none |

## Conflict Kept Visible

`LR3` is withheld from muscle and nerve fill proposals. The PCOS trial protocol names the first dorsal interosseous muscle, while the lower-limb haemodynamic study names extensor digitorum brevis and a different innervation description. This may reflect localization, insertion path, depth, or reporting differences; it must not be mechanically normalized.

## Gate

These data describe the tissue path used in particular human studies. Review each muscle or nerve proposal against an approved professional anatomy text before any later canonical apply step. No efficacy or universal needling-depth statement is authorized.

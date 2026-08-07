# Acupoint Anatomy Fill Diff Summary

Fill-empty, review-only preview. Canonical writes: **0**. Apply mode is intentionally unsupported.

## Summary

| Metric | Count |
| --- | ---: |
| Canonical points checked | 361 |
| Raw source candidates | 41 |
| Fill-empty field proposals | 34 |
| Proposed values | 38 |
| Affected points | 28 |
| Existing non-empty field skips | 3 |
| Conflicts | 0 |
| Canonical writes | 0 |

## Proposed Empty-Field Fills

| Point | Field | Proposed values | Sources |
| --- | --- | --- | --- |
| `BL40` 委中 | `nerves` | tibial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `BL54` 秩邊 | `nerves` | sciatic nerve | `stuber_radial_nerve_ultrasound_2019` |
| `CV22` 天突 | `vessels` | brachiocephalic vein | `zhang_cv22_st11_cadaver_2007` |
| `GB20` 風池 | `danger` | Source-identified anatomy review: major neck vessels. Review internal jugular/common carotid region and needle direction; no universal safe depth is staged. | `lin_mri_neck_shoulder_depth_2015` |
| `GB21` 肩井 | `danger` | Source-identified anatomy review: pleural membrane. Pneumothorax-focused review; angle and direction materially change risk. | `lin_mri_neck_shoulder_depth_2015` |
| `GB34` 陽陵泉 | `nerves` | peroneal nerve | `stuber_radial_nerve_ultrasound_2019` |
| `GV20` 百會 | `danger` | Source-identified anatomy review: parietal foramina; emissary veins; greater occipital nerves; occipital vessels. Stage as anatomy candidates only; proximity does not imply efficacy or a universal insertion rule. | `lee_gv20_anatomy_2023` |
| `GV20` 百會 | `nerves` | greater occipital nerves | `lee_gv20_anatomy_2023` |
| `GV20` 百會 | `vessels` | emissary veins<br>occipital vessels | `lee_gv20_anatomy_2023` |
| `HT7` 神門 | `nerves` | ulnar nerve | `stuber_radial_nerve_ultrasound_2019` |
| `KI3` 太谿 | `nerves` | tibial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `LI11` 曲池 | `nerves` | radial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `LI18` 扶突 | `danger` | Source-identified anatomy review: major neck vessels. Review major neck vessels and individual anatomy before any technique-field proposal. | `lin_mri_neck_shoulder_depth_2015` |
| `LU1` 中府 | `nerves` | brachial plexus | `stuber_radial_nerve_ultrasound_2019` |
| `LU2` 雲門 | `nerves` | brachial plexus | `stuber_radial_nerve_ultrasound_2019` |
| `LU5` 尺澤 | `nerves` | radial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `LU7` 列缺 | `nerves` | superficial radial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `LU9` 太淵 | `nerves` | superficial radial nerve | `stuber_radial_nerve_ultrasound_2019` |
| `PC3` 曲澤 | `nerves` | median nerve | `stuber_radial_nerve_ultrasound_2019` |
| `PC6` 內關 | `nerves` | median nerve | `stuber_radial_nerve_ultrasound_2019` |
| `SI8` 小海 | `nerves` | ulnar nerve | `stuber_radial_nerve_ultrasound_2019` |
| `SI14` 肩外俞 | `danger` | Source-identified anatomy review: pleural membrane. Pneumothorax-focused review; this posterior shoulder region is not fully protected by scapula. | `lin_mri_neck_shoulder_depth_2015` |
| `SI15` 肩中俞 | `danger` | Source-identified anatomy review: pleural membrane. Pneumothorax-focused review; this posterior shoulder region is not fully protected by scapula. | `lin_mri_neck_shoulder_depth_2015` |
| `SI16` 天窗 | `danger` | Source-identified anatomy review: major neck vessels. Review major neck vessels and individual anatomy before any technique-field proposal. | `lin_mri_neck_shoulder_depth_2015` |
| `SI17` 天容 | `danger` | Source-identified anatomy review: major neck vessels. Review major neck vessels and individual anatomy before any technique-field proposal. | `lin_mri_neck_shoulder_depth_2015` |
| `SP9` 陰陵泉 | `nerves` | saphenous nerve | `stuber_radial_nerve_ultrasound_2019` |
| `SP12` 衝門 | `nerves` | femoral nerve | `stuber_radial_nerve_ultrasound_2019` |
| `ST9` 人迎 | `danger` | Source-identified anatomy review: sternocleidomastoid muscle; common carotid artery; thyroid cartilage. Review the point's relationship to the common carotid artery and adjacent neck structures before any anatomy-field proposal.<br>Source-identified anatomy review: internal jugular vein; common carotid artery. Review carotid sheath structures; no universal safe depth is staged. | `kim_ultrasound_44_points_2017`<br>`lin_mri_neck_shoulder_depth_2015` |
| `ST9` 人迎 | `muscles` | sternocleidomastoid muscle | `kim_ultrasound_44_points_2017` |
| `ST9` 人迎 | `vessels` | common carotid artery<br>internal jugular vein | `kim_ultrasound_44_points_2017`<br>`lin_mri_neck_shoulder_depth_2015` |
| `ST11` 氣舍 | `danger` | Source-identified anatomy review: internal jugular vein; common carotid artery; vagus nerve. Abstract-level cadaver finding; verify full text and professional technique guidance before canonical use. | `zhang_cv22_st11_cadaver_2007` |
| `ST11` 氣舍 | `nerves` | vagus nerve | `zhang_cv22_st11_cadaver_2007` |
| `ST11` 氣舍 | `vessels` | internal jugular vein<br>common carotid artery | `zhang_cv22_st11_cadaver_2007` |
| `TE16` 天牖 | `danger` | Source-identified anatomy review: major neck vessels. Review major neck vessels and individual anatomy before any technique-field proposal. | `lin_mri_neck_shoulder_depth_2015` |

## Interpretation

- Peripheral-nerve candidates are point-proximity anatomy relationships explicitly named by the source.
- Vessels and muscle candidates are limited to point-specific structures named in the cited articles.
- The `danger` proposals preserve the source finding as a review prompt. They do not prescribe angle, depth, or treatment.
- Existing non-empty arrays are untouched and listed in the JSON preview for later comparison.

## Gate

Ting or a qualified reviewer should approve each field proposal before a separate conflict-refusing apply script is considered. This preview does not authorize changes to `361.json`.

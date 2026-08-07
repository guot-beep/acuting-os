# BL61-BL67 Encoding Repair Preview

Generated: 2026-07-11T05:41:20.340Z

This is a gated preview only. It does not modify `data/acupoints/361.json`.

## Summary

- Affected codes: BL61, BL62, BL63, BL64, BL65, BL66, BL67
- Proposed concise repairs: 3
- Fields needing manual rewrite/removal decision: 13

## Why This Matters

These fields contain literal `????`, which means the canonical text is unreadable. This is different from a normal CloudTCM wording difference.

## Proposed Repairs

These are small candidate repairs for fields where a concise safe replacement is possible.

| code | zh | field | current damaged value | proposed replacement |
|---|---|---|---|---|
| BL61 | 僕參 | location_zh | ???????????? BL60 ????????????? | 足外側，外踝後下方，崑崙（BL60）直下 2 寸，跟部外側赤白肉際處。 |
| BL67 | 至陰 | location_zh | ??????????? 0.1 ??? | 足小趾末節外側，距趾甲角 0.1 寸處。 |
| BL67 | 至陰 | contraindications | ?????????????????????/????????? | 孕期慎用或禁用強刺激；胎位調整相關用法需由受訓專業人員評估。 |

## Needs Manual Rewrite

These are study-note fields such as `clinical_pearls` and `danger`. They should not be blindly replaced with CloudTCM prose.

| code | zh | field | current damaged value | note |
|---|---|---|---|---|
| BL61 | 僕參 | clinical_pearls | ????????????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL61 | 僕參 | danger | ?????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL62 | 申脈 | clinical_pearls | ????????????? SI3 ??????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL62 | 申脈 | danger | ???????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL63 | 金門 | clinical_pearls | ???????????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL63 | 金門 | danger | ??????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL64 | 京骨 | clinical_pearls | ???????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL65 | 束骨 | clinical_pearls | ??????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL65 | 束骨 | danger | ??????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL66 | 足通谷 | clinical_pearls | ?????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL66 | 足通谷 | danger | ???????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL67 | 至陰 | clinical_pearls | ??????????????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |
| BL67 | 至陰 | danger | ????????????????????? | No direct safe replacement proposed. This is a study-note field and should be rewritten or removed after Ting review. |

## Recommended Gate

If Ting approves, apply only the proposed repairs first:

- BL61 `location_zh`
- BL67 `location_zh`
- BL67 `contraindications`

Then separately decide whether the unreadable `clinical_pearls` and `danger` fields should be rewritten, emptied with a review note, or reconstructed from another source.

Machine-readable preview: docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.json

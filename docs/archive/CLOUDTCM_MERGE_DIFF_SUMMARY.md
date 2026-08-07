# CloudTCM Merge Diff Summary (D3 gate)

Generated: 2026-07-11T00:46:47.060Z
Staging: 361 records · Canonical 361.json: 361 records · Unknown codes: 0

## Counts by field

| canonical field | FILL (empty→filled) | MATCH | DIFFER | staging empty |
|---|---|---|---|---|
| location_zh | 0 | 1 | 360 | 0 |
| needling | 0 | 7 | 354 | 0 |
| functions_zh | 0 | 0 | 348 | 13 |
| indications_zh | 0 | 0 | 348 | 13 |
| contraindications | 0 | 1 | 43 | 317 |

## How to read this

- **FILL**: only these are written by `--apply-approved` (empty fields only).
- **MATCH**: model draft agrees with CloudTCM after normalization — good
  cross-check signal; candidates for a future status upgrade.
- **DIFFER**: wording differs (expected for prose). Review priority:
  1. **location_zh** differences — positioning facts must agree.
  2. **needling** differences — depth/direction/safety facts must agree.
  3. functions/indications differences are usually vocabulary breadth, lower risk.
- Nothing in DIFFER is auto-resolved. CloudTCM text stays in staging as the
  reference; per-record human review decides any replacement.

## Sample DIFFER — location_zh (first 10)

- **BL1**
  - 現有: 目內眥內上方凹陷處。
  - CloudTCM: 面部，目內眥角稍上方凹陷處，當上瞼部眼眶內側緣與眼球之間空隙部
- **BL10**
  - 現有: 後髮際上約 0.5 寸，斜方肌外側凹陷處。
  - CloudTCM: 項後髮際，斜方肌外緣凹陷處，當後髮際正中旁開1.3寸
- **BL11**
  - 現有: 背部，第 1 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 背部第一胸椎棘突下（陶道）旁開1.5寸處
- **BL12**
  - 現有: 背部，第 2 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 背部第二胸椎棘突下旁開1.5寸處，約與肩胛骨上角相平
- **BL13**
  - 現有: 第 3 胸椎棘突下，旁開 1.5 寸。
  - CloudTCM: 背部第三胸椎棘突下（身柱）旁開1.5寸處
- **BL14**
  - 現有: 背部，第 4 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 背部第四胸椎棘突下旁開1.5寸處
- **BL15**
  - 現有: 背部，第 5 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 心俞穴位於第五胸椎棘突、旁開1.5寸。取穴時一般可以采用正坐或俯臥姿勢。
- **BL16**
  - 現有: 背部，第 6 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 背部第六胸椎棘突下（靈台）旁開1.5寸處
- **BL17**
  - 現有: 第 7 胸椎棘突下，旁開 1.5 寸。
  - CloudTCM: 背部第七胸椎棘突下（至陽）旁開1.5寸處
- **BL18**
  - 現有: 背部，第 9 胸椎棘突下，後正中線旁開 1.5 寸。
  - CloudTCM: 背部第九胸椎棘突下（筋縮）旁開1.5寸

## Sample DIFFER — needling (first 10)

- **BL1**
  - 現有: 閉目，沿眶緣緩慢直刺或略向內上方刺 0.3-0.5 寸；不可提插捻轉過強，避開眼球。
  - CloudTCM: 囑患者閉目，醫者左手輕推眼球想外側固定，右手緩慢進針，緊靠眶緣直刺0.5&mdash;1寸，不捻轉提插。局部酸脹，針感可擴散至眼球及周圍。出針時注意用棉球按壓針孔片刻，避免造成內出血。禁灸。
- **BL10**
  - 現有: 直刺或向下斜刺 0.5-0.8 寸；深部近延髓區，禁深刺與強刺激。
  - CloudTCM: 橫刺0.5-0.8寸
- **BL11**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 橫刺0.5-0.7寸
- **BL12**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL13**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL14**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL15**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL16**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL17**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；不可深直刺，胸背部深刺有氣胸風險。
  - CloudTCM: 斜刺0.5-0.7寸
- **BL18**
  - 現有: 向脊柱方向斜刺 0.5-0.8 寸；背部不可深直刺，需注意氣胸風險與臟器深部結構。
  - CloudTCM: 斜刺0.5-0.7寸

Full detail: docs/CLOUDTCM_MERGE_PREVIEW.json

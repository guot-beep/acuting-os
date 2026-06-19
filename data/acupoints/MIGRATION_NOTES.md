# Acupoint Data Migration Notes

## 2026-06-14

Migrated the current in-app standard-channel acupoint records into `data/acupoints/361.json`.

- Total migrated records: 50
- Included: LU1-LU11, selected LI, ST, SP, HT, SI, BL, KI, PC, TE, GB, LR, CV, GV points already present in the app.
- Excluded from this canonical 361 file for now:
  - Auricular points, which remain a separate auricular dataset candidate.
  - Extra points such as Yintang and Taiyang, which should later go into an extra-points dataset.

Important: migrated records preserve the app's current educational content, but each record still needs progressive validation against WHO Standard Acupuncture Point Locations and other registered sources before being treated as canonical.

## 2026-06-15

Added missing Large Intestine channel records to the in-app dataset and re-synced `data/acupoints/361.json`.

- Added to app: LI1, LI2, LI3, LI5, LI6, LI7, LI8, LI9, LI10, LI12, LI13, LI14, LI15, LI16, LI17, LI18, LI19.
- Already present: LI4, LI11, LI20.
- Current canonical dataset count: 67 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 294 remaining.
- Next recommended standard channel batch: ST1-ST45.

Added missing Stomach channel records to the in-app dataset and re-synced `data/acupoints/361.json`.

- Added to app: ST1-ST24, ST26-ST35, ST37-ST39, ST41-ST43, ST45.
- Already present: ST25, ST36, ST40, ST44.
- Current canonical 361 dataset count: 108 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 253 remaining.
- Excluded from the 361 layer during sync: EX-HN3, EX-HN5. These belong in the future extra-points layer.
- Next recommended standard channel batch: SP1-SP21.

Added missing Spleen and Heart channel records to the in-app dataset and re-synced `data/acupoints/361.json`.

- Added to app: SP1-SP8, SP11-SP21.
- Already present: SP9, SP10.
- Added to app: HT1-HT6, HT8-HT9.
- Already present: HT7.
- Current canonical 361 dataset count: 134 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 227 remaining.
- Next recommended standard channel batch: SI1-SI19.

Added missing Small Intestine channel records to the in-app dataset and re-synced `data/acupoints/361.json`.

- Added to app: SI1, SI2, SI4-SI19.
- Already present: SI3.
- Current canonical 361 dataset count: 152 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 209 remaining.
- Next recommended standard channel batch: BL1-BL67.

Added the first Bladder channel segment and re-synced `data/acupoints/361.json`.

- Added to app: BL1-BL9, BL11, BL12, BL14, BL15, BL16, BL18, BL19.
- Already present in this segment: BL10, BL13, BL17.
- Current canonical 361 dataset count: 168 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 193 remaining.
- Next recommended standard channel batch: BL21-BL31.

Added the lumbosacral Bladder channel segment and re-synced `data/acupoints/361.json`.

- Added to app: BL21, BL22, BL24, BL26-BL31, BL33-BL39.
- Already present in this segment: BL23, BL25, BL32, BL40.
- Current canonical 361 dataset count: 184 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 177 remaining.
- Current Bladder channel coverage: 41 of 67.
- Next recommended standard channel batch: BL41-BL59.

Added the outer Bladder line and posterior leg segment, then re-synced `data/acupoints/361.json`.

- Added to app: BL41-BL59.
- Already present after this segment: BL60.
- Current canonical 361 dataset count: 203 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 158 remaining.
- Current Bladder channel coverage: 60 of 67.
- Next recommended standard channel batch: BL61-BL67.

Completed the Bladder channel foot segment and re-synced `data/acupoints/361.json`.

- Added to app: BL61-BL67.
- Current canonical 361 dataset count: 210 records.
- Missing standard-channel acupoints now tracked in `data/audits/missing_report.json`: 151 remaining.
- Current Bladder channel coverage: 67 of 67.
- Next recommended standard channel batch: KI1-KI27.

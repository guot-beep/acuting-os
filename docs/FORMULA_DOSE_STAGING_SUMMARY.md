# Formula Dose Staging Summary

Date: 2026-07-17  
Status: `draft` / staging only / no canonical merge

## First Batch

| Formula | HKBU source | Composition rows | Gram references | Pending/non-gram | Sun Ten U.S. |
|---|---|---:|---:|---:|---|
| 桂枝湯 Gui Zhi Tang | F00002 | 5 | 5 | 0 | SKU 212, granules |
| 麻黃湯 Ma Huang Tang | F00001 | 4 | 4 | 0 | Not found in reviewed public catalog |
| 銀翹散 Yin Qiao San | F00008 | 10 | 9 | 1 | SKU 440, granules |
| 小柴胡湯 Xiao Chai Hu Tang | F00026 | 7 | 6 | 1 | SKU 564, granules |
| 逍遙散 Xiao Yao San | F00031 | 8 | 6 | 2 | SKU 826, granules |
| **Total** |  | **34** | **30** | **4** | **4 product records** |

## Review Findings

- All five records remain `draft`. No values were written to
  `data/herbs/formulas.json`.
- The 30 numeric values are transcriptions of the reviewed HKBU formula pages.
  They are formula-source references, not individualized prescriptions.
- 桂枝湯 大棗 is preserved exactly as the page displays it (`十二枚 (3g)`) and
  is flagged for unit review before any merge.
- 小柴胡湯 大棗 remains a non-gram reference (`4枚`); it was not converted.
- 銀翹散 蘆根 and 逍遙散 薄荷/生薑 have no dose copied because the reviewed
  source line did not provide one in the same composition context.
- 竹葉 and 牛蒡子 currently have no matching stable `herb.*` ID in the 202-herb
  shortlist. Their formula rows are retained with `herb_id: null` for later
  vocabulary review; no new IDs were invented.
- Sun Ten public pages establish product identity, SKU, dosage form, ingredient
  list, and certain allergen notices. They do not provide a public serving-gram
  recommendation for these records.
- Therefore all concentrated-granule serving grams remain `null`. Bottle size,
  extraction ratio, and raw-herb reference grams were not used to calculate a
  dose.

## Approval Gate

Before a canonical merge, Ting/Claude should review:

1. Whether HKBU's displayed modern gram equivalents should populate
   `decoction_reference_g` or remain source-note-only.
2. The 桂枝湯 大棗 unit anomaly.
3. Whether 竹葉 and 牛蒡子 should be added to the herb canon through the normal
   immutable-ID approval path.
4. Whether authenticated Sun Ten labels or practitioner documentation can
   supply product-specific serving grams and frequency.
5. A field-level merge preview with zero overwrites of non-empty canonical
   values.


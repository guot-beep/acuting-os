# Herb Visual Link Preview - hvl_2_exterior_cool_five_probe

Staging file: `data/imports/herb_visual_links/hvl_2_exterior_cool_five_probe.json`

Review-only exact-page mapping. No canonical herb data was modified, and this tool has no apply mode.

## Summary

- herbs: 5
- exact visual links: 10
- source families per herb: 2 (CloudTCM + HKBU)
- conflicts: 0
- canonical writes: 0
- review status: draft

## Exact Page Matches

| Herb | Source | Database type | Exact page | Identity caveat |
| --- | --- | --- | --- | --- |
| `herb.bo_he` 薄荷 Bo He | cloudtcm_herb | herb_profile | [雲端中醫：薄荷圖文頁](https://cloudtcm.com/herb/pharm/975) | CloudTCM displays the pinyin as Bao He; canonical study romanization is Bo He. Chinese name and botanical/pharmaceutical identity match. |
| `herb.bo_he` 薄荷 Bo He | hkbu_mmid | medicinal_material_image | [香港浸大：薄荷藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00261) | This is the dried aerial portion; distinguish it from mint distillate, oil, and unrelated mint-named herbs. |
| `herb.chan_tui` 蟬蛻 Chan Tui | cloudtcm_herb | herb_profile | [雲端中醫：蟬蛻圖文頁](https://cloudtcm.com/herb/983) | The medicinal material is the sloughed exoskeleton, not the living insect or internal body. |
| `herb.chan_tui` 蟬蛻 Chan Tui | hkbu_mmid | medicinal_material_image | [香港浸大：蟬蛻藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00370) | Whole-shell integrity and cleaned dried-material appearance differ from fragmented retail material. |
| `herb.sang_ye` 桑葉 Sang Ye | cloudtcm_herb | herb_profile | [雲端中醫：桑葉圖文頁](https://cloudtcm.com/herb/pharm/1156) | Keep the dried leaf distinct from Sang Ye Zhi juice, Sang Ye Lu distillate, and other mulberry parts. |
| `herb.sang_ye` 桑葉 Sang Ye | hkbu_mmid | medicinal_material_image | [香港浸大：桑葉藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00334) | Processed fried or honey-prepared Sang Ye can differ in color and appearance from the raw dried leaf. |
| `herb.ju_hua` 菊花 Ju Hua | cloudtcm_herb | herb_profile | [雲端中醫：菊花圖文頁](https://cloudtcm.com/herb/1079) | Do not confuse the flower-head record with Ju Hua Ye, Ju Hua Gen, Ye Ju Hua, or other compound names. |
| `herb.ju_hua` 菊花 Ju Hua | hkbu_mmid | medicinal_material_image | [香港浸大：菊花藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00306) | Hang Ju, Bo Ju, Gong Ju, and Chu Ju differ in regional processing and appearance within this same material record. |
| `herb.ge_gen` 葛根 Ge Gen | cloudtcm_herb | herb_profile | [雲端中醫：葛根圖文頁](https://cloudtcm.com/herb/pharm/1043) | CloudTCM groups botanical identity broadly; distinguish Ge Gen/Pueraria lobata from Fen Ge/Pueraria thomsonii in material study. |
| `herb.ge_gen` 葛根 Ge Gen | hkbu_mmid | medicinal_material_image | [香港浸大：葛根藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00063) | This HKBU record is Pueraria lobata and should not be substituted visually for the separate Fen Ge material. |

## Gate

Ting/Claude should spot-check the ten pages and the homonym/medicinal-part caveats before any canonical merge or UI override is designed.

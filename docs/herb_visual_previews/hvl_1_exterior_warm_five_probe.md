# Herb Visual Link Preview - hvl_1_exterior_warm_five_probe

Staging file: `data/imports/herb_visual_links/hvl_1_exterior_warm_five_probe.json`

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
| `herb.ma_huang` 麻黃 Ma Huang | cloudtcm_herb | herb_profile | [雲端中醫：麻黃圖文頁](https://cloudtcm.com/herb/pharm/1) | CloudTCM is a Chinese-depth study reference, not the English board-exam authority. |
| `herb.ma_huang` 麻黃 Ma Huang | hkbu_mmid | medicinal_material_image | [香港浸大：麻黃藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00278) | Prepared slices and microscopic views may differ from the whole dried stem shown in other references. |
| `herb.gui_zhi` 桂枝 Gui Zhi | cloudtcm_herb | herb_profile | [雲端中醫：桂枝圖文頁](https://cloudtcm.com/herb/pharm/2) | Verify twig identity separately from Rou Gui bark and other Cinnamomum materials. |
| `herb.gui_zhi` 桂枝 Gui Zhi | hkbu_mmid | medicinal_material_image | [香港浸大：桂枝藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00138) | This record is the dried tender twig; it must not be treated as Rou Gui bark. |
| `herb.zi_su_ye` 紫蘇葉 Zi Su Ye | cloudtcm_herb | herb_profile | [雲端中醫：紫蘇葉圖文頁](https://cloudtcm.com/herb/pharm/1253) | Keep the leaf distinct from Zi Su Zi seed and Zi Su Geng stem records. |
| `herb.zi_su_ye` 紫蘇葉 Zi Su Ye | hkbu_mmid | medicinal_material_image | [香港浸大：紫蘇葉藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00338) | Dried leaves may include small stem fragments; distinguish the medicinal part from Zi Su Geng. |
| `herb.jing_jie` 荊芥 Jing Jie | cloudtcm_herb | herb_profile | [雲端中醫：荊芥圖文頁](https://cloudtcm.com/herb/1091) | Do not confuse this record with similarly named Jia Jing Jie, Hong Jing Jie, or Tu Jing Jie pages. |
| `herb.jing_jie` 荊芥 Jing Jie | hkbu_mmid | medicinal_material_image | [香港浸大：荊芥藥材圖像](https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?pid=B00274) | The database record is the dried aerial portion; Jing Jie Sui flower spikes require separate identification context. |
| `herb.fang_feng` 防風 Fang Feng | cloudtcm_herb | herb_profile | [雲端中醫：防風圖文頁](https://cloudtcm.com/herb/1028) | Do not confuse the base herb with Shi Fang Feng, Yun Fang Feng, or Xiu Qiu Fang Feng records. |
| `herb.fang_feng` 防風 Fang Feng | hkbu_mpid | medicinal_plant_image | [香港浸大：防風藥用植物圖像](https://sys01.lib.hkbu.edu.hk/cmed/mpid/detail.php?herb_id=D00118) | This is the medicinal-plant image record rather than an MMID prepared-material record. |

## Gate

Ting/Claude should spot-check the ten pages and the homonym/medicinal-part caveats before any canonical merge or UI override is designed.

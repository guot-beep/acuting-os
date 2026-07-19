# Formula Chinese Depth Preview - c2_2_cloudtcm_five_formula_probe

Staging file: `data/imports/formula_chinese_depth/c2_2_cloudtcm_five_formula_probe.json`

Review-only Chinese depth layer. No canonical formula data was modified, and this tool has no apply mode.

## Summary

- formulas: 5
- fields: 15
- staged items: 25
- conflicts: 0
- canonical writes: 0
- review status: draft

## Source Matching

| Formula | CloudTCM match | Caveats |
| --- | --- | --- |
| `formula.da_chai_hu_tang` 大柴胡湯 | [formula/35](https://cloudtcm.com/formula/35) | 頁面同時收錄多個同名古方，僅採用《傷寒論》八味條目。<br>頁面現代疾病與藥理敘述未納入本批。 |
| `formula.si_ni_san` 四逆散 | [formula/78](https://cloudtcm.com/formula/78) | 頁面含現代疾病列表與經絡推論，未納入本批。<br>四逆散不可與四逆湯的陽虛寒厥概念混同。 |
| `formula.tong_xie_yao_fang` 痛瀉要方 | [formula/563](https://cloudtcm.com/formula/563) | 頁面列出的合方與加減只作學習比較，不轉成處方建議。<br>頁面現代疾病及經絡檢測敘述未納入本批。 |
| `formula.gan_mai_da_zao_tang` 甘麥大棗湯 | [formula/89](https://cloudtcm.com/formula/89) | 頁面部分藥味解釋誤提麥冬，與其基本資訊的浮小麥三味方不一致；該段未採用。<br>頁面現代精神疾病、藥理與療效語句未納入本批。 |
| `formula.suan_zao_ren_tang` 酸棗仁湯 | [formula/270](https://cloudtcm.com/formula/270) | 頁面對個別藥物寒熱與作用有前後不一致或過度延伸處，只採用與機構來源一致的高層方義。<br>頁面現代疾病、藥理與療效語句未納入本批。 |

## Field Preview

| Formula | Field | Items | Sources |
| --- | --- | ---: | --- |
| `formula.da_chai_hu_tang` 大柴胡湯 | `chinese_depth_track.fang_yi_zh` | 1 | [雲端中醫－大柴胡湯](https://cloudtcm.com/formula/35) (方劑組成解釋；《傷寒論》同名條目)<br>[香港浸會大學中醫藥學院－大柴胡湯](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00027&lang=eng) (Combination and Action) |
| `formula.da_chai_hu_tang` 大柴胡湯 | `chinese_depth_track.zhu_zhi_zh` | 1 | [雲端中醫－大柴胡湯](https://cloudtcm.com/formula/35) (《傷寒論》同名條目；主治功效)<br>[香港浸會大學中醫藥學院－大柴胡湯](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00027&lang=eng) (Indication and essential pattern differentiation) |
| `formula.da_chai_hu_tang` 大柴胡湯 | `chinese_depth_track.notes_zh` | 3 | [雲端中醫－大柴胡湯](https://cloudtcm.com/formula/35) (相同名稱方劑；方劑介紹)<br>[Ting Bastyr learning note－Da Chai Hu Tang](https://app.notion.com/p/37747f6dea3581979bcadb471b071dde) (Exam Comparison) |
| `formula.si_ni_san` 四逆散 | `chinese_depth_track.fang_yi_zh` | 1 | [雲端中醫－四逆散](https://cloudtcm.com/formula/78) (方劑介紹；方劑配方組成)<br>[香港浸會大學中醫藥學院－四逆散](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00030&lang=eng&page=1&sort=name_cht_order) (Combination and Action) |
| `formula.si_ni_san` 四逆散 | `chinese_depth_track.zhu_zhi_zh` | 1 | [雲端中醫－四逆散](https://cloudtcm.com/formula/78) (方劑介紹；主治功效)<br>[台灣衛生福利部中醫藥司－四逆散](https://dep.mohw.gov.tw/DOCMAP/fp-866-5664-108.html) (效能與適應症) |
| `formula.si_ni_san` 四逆散 | `chinese_depth_track.notes_zh` | 3 | [雲端中醫－四逆散](https://cloudtcm.com/formula/78) (方劑介紹)<br>[香港浸會大學中醫藥學院－四逆散](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00030&lang=eng&page=1&sort=name_cht_order) (Indication and essential pattern differentiation) |
| `formula.tong_xie_yao_fang` 痛瀉要方 | `chinese_depth_track.fang_yi_zh` | 1 | [雲端中醫－痛瀉要方](https://cloudtcm.com/formula/563) (方劑組成解釋；方劑介紹)<br>[香港浸會大學中醫藥學院－痛瀉要方](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00032&lang=eng&sort=name_cht_order) (Combination and Action) |
| `formula.tong_xie_yao_fang` 痛瀉要方 | `chinese_depth_track.zhu_zhi_zh` | 1 | [雲端中醫－痛瀉要方](https://cloudtcm.com/formula/563) (主治功效；方劑介紹)<br>[香港浸會大學中醫藥學院－痛瀉要方](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00032&lang=eng&sort=name_cht_order) (Indication and essential pattern differentiation) |
| `formula.tong_xie_yao_fang` 痛瀉要方 | `chinese_depth_track.notes_zh` | 3 | [雲端中醫－痛瀉要方](https://cloudtcm.com/formula/563) (方劑介紹；加減法參考)<br>[Ting FOM / diarrhea comparison notes](https://app.notion.com/p/37947f6dea3581ad8b5bfae444780f9f) (Liver overacting on Spleen comparison context) |
| `formula.gan_mai_da_zao_tang` 甘麥大棗湯 | `chinese_depth_track.fang_yi_zh` | 1 | [雲端中醫－甘麥大棗湯](https://cloudtcm.com/formula/89) (基本資訊；方劑介紹（排除誤提麥冬的段落）)<br>[台灣衛生福利部中醫藥司－甘麥大棗湯](https://dep.mohw.gov.tw/DOCMAP/fp-866-7146-108.html) (處方與效能) |
| `formula.gan_mai_da_zao_tang` 甘麥大棗湯 | `chinese_depth_track.zhu_zhi_zh` | 1 | [雲端中醫－甘麥大棗湯](https://cloudtcm.com/formula/89) (相同名稱方劑－《金匱》條目；方劑介紹)<br>[台灣衛生福利部中醫藥司－甘麥大棗湯](https://dep.mohw.gov.tw/DOCMAP/fp-866-7146-108.html) (適應症) |
| `formula.gan_mai_da_zao_tang` 甘麥大棗湯 | `chinese_depth_track.notes_zh` | 3 | [雲端中醫－甘麥大棗湯](https://cloudtcm.com/formula/89) (方劑介紹；基本資訊)<br>[香港浸會大學中醫藥學院－甘麥大棗湯附方記錄](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00097&lang=eng&sort=name_cht_order) (Additional formula record) |
| `formula.suan_zao_ren_tang` 酸棗仁湯 | `chinese_depth_track.fang_yi_zh` | 1 | [雲端中醫－酸棗仁湯](https://cloudtcm.com/formula/270) (方劑介紹；方劑組成解釋（僅採機構來源可交叉核對部分）)<br>[香港浸會大學中醫藥學院－酸棗仁湯](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00097&lang=eng&qs_type=%E5%AE%89%E7%A5%9E%E5%8A%91&sort=name_cht_order) (Combination and Action) |
| `formula.suan_zao_ren_tang` 酸棗仁湯 | `chinese_depth_track.zhu_zhi_zh` | 1 | [雲端中醫－酸棗仁湯](https://cloudtcm.com/formula/270) (方劑介紹；主治功效)<br>[香港浸會大學中醫藥學院－酸棗仁湯](https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00097&lang=eng&qs_type=%E5%AE%89%E7%A5%9E%E5%8A%91&sort=name_cht_order) (Indication and essential pattern differentiation) |
| `formula.suan_zao_ren_tang` 酸棗仁湯 | `chinese_depth_track.notes_zh` | 3 | [雲端中醫－酸棗仁湯](https://cloudtcm.com/formula/270) (方劑介紹；方劑比較)<br>[Ting insomnia comparison note](https://app.notion.com/p/38147f6dea358185b847ce2d782288ad) (Pattern comparison context) |

## American Dragon Collection Status

- status: `manual_browser_review_required`
- reason: Automated access returned a verification challenge, and search did not expose reliable exact formula pages for this batch.
- action: Open exact formula pages in a normal browser, verify formula identity, then add separately sourced English-practitioner notes in a later review-only staging batch. Do not infer URLs or content.

## Gate

Ting/Claude must review the wording, source caveats, and field-level evidence model before any canonical apply path is designed.

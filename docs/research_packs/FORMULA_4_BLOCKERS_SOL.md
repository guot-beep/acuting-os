# Formula 4 blockers — SOL content ruling

**Status:** research answer / not canonical. No schema change is authorized here.

## 1. 柴胡加龍骨牡蠣湯

**Source:** 張仲景，《傷寒論·辨太陽病脈證並治下》，第 107 條。

原條文：「傷寒八九日，下之，胸滿煩驚，小便不利，譫語，一身盡重，不可轉側者，柴胡加龍骨牡蠣湯主之。」

| 藥味 | 原方相對量 | English | Modern handling |
|---|---:|---|---|
| 柴胡 | 四兩 | Bupleurum root | retained |
| 龍骨 | 一兩半 | Dragon bone | retained |
| 黃芩 | 一兩半 | Scutellaria root | retained |
| 生薑 | 一兩半 | Fresh ginger | retained |
| 鉛丹 | 一兩半 | Red lead | **omit in modern practice because of lead toxicity** |
| 人參 | 一兩半 | Ginseng | retained |
| 桂枝 | 一兩半 | Cinnamon twig | retained |
| 茯苓 | 一兩半 | Poria | retained |
| 半夏 | 二合半（洗） | Pinellia | retained with lawful processing |
| 大黃 | 二兩 | Rhubarb root/rhizome | retained when indicated |
| 牡蠣 | 一兩半（熬） | Oyster shell | retained |
| 大棗 | 六枚（擘） | Jujube | retained |

The source text and 12-ingredient composition, including 鉛丹, are also reproduced by Zhongshan Hospital of TCM and China Academy of Chinese Medical Sciences clinicians. The canonical card should retain 鉛丹 as a historical ingredient but mark it omitted/prohibited in modern dispensing; it must not silently disappear from the classical composition. No modern gram doses are supplied because the sources reviewed do not establish one universal conversion.

## 2. 烏梅丸 actions canonicalization

**Primary source:** 張仲景，《傷寒論·辨厥陰病脈證並治》，烏梅丸條。 **Institutional secondary source:** 國家中醫藥研究所〈烏梅丸的現代研究新知〉.

Recommended canonical list (≤8):

1. 溫臟 / warms the zang organs
2. 安蛔 / quiets roundworms
3. 止痛（蛔厥腹痛語境） / relieves pain in the roundworm-reversal pattern
4. 主蛔厥 / treats the classical roundworm-reversal presentation
5. 可用於久利（依原文語境） / may address chronic diarrhea in the classical textual context

For a strict **actions-only** field, use only items 1–3. Items 4–5 are indications, not actions. The 11 American Dragon items should not be copied into actions: symptom manifestations, modern extensions, and overlapping phrases must be moved to indications/clinical manifestations or omitted pending separate sourcing.

## 3. 大建中湯 hierarchy

**Primary source:** 張仲景，《金匱要略·腹滿寒疝宿食病脈證治》第十；composition: 蜀椒二合、乾薑四兩、人參二兩、膠飴一升. The classical text gives composition and preparation, **not a monarch–minister–assistant–envoy hierarchy**.

**Important disagreement:** modern formula analyses are not uniform. One common analysis makes 膠飴 the monarch, 蜀椒+乾薑 ministers, 人參 assistant; another teaching analysis makes 蜀椒 the monarch, 乾薑 minister, 人參 assistant, 膠飴 assistant/envoy. Therefore the repo must not store the latter as if it were classical fact.

Recommended CI-safe ruling:

- If the schema permits attribution: store both analyses with source attribution and hierarchy_status: disputed_modern_analysis.
- If the schema allows one hierarchy only: use the hierarchy from Ting's designated course textbook and cite edition/page; until that source is supplied, preserve the composition and mark hierarchy unresolved.
- Do **not** claim 《金匱要略》 itself assigns these roles.

A source located during this review explicitly lists 膠飴 as monarch, 蜀椒+乾薑 as ministers, 人參 as assistant, demonstrating that the requested 蜀椒-monarch arrangement is not uncontested.

## 4. 蒿芩清膽湯 / 碧玉散 schema opinion

Prefer a formula-in-formula component object that preserves both the nested identity formula.bi_yu_san and its expanded ingredients (滑石、甘草、青黛). Treating 碧玉散 as a single herb-like ingredient would blur entity type and make interaction/safety traversal harder. This is an engineering recommendation only; Ting's schema ruling remains required.

## Sources

- 《傷寒論·辨太陽病脈證並治下》第107條（柴胡加龍骨牡蠣湯）.
- 《傷寒論·辨厥陰病脈證並治》（烏梅丸）.
- 《金匱要略·腹滿寒疝宿食病脈證治》第十（大建中湯）.
- 國家中醫藥研究所，〈烏梅丸的現代研究新知〉: https://www.nricm.edu.tw/p/406-1000-7453%2Cr11.php?Lang=zh-tw
- 中山市中醫院，〈賴海標教授運用柴胡加龍骨牡蠣湯加減治療中風案〉: https://www.zsszyy.com/article.php?articleAction=display&articleId=239126&tack=laihaibiao
- EC Way，〈大建中湯〉（modern hierarchy example: 膠飴君、蜀椒/乾薑臣、人參佐）: https://ecway.hk/prescription/dajianzhongsoup

# 中藥卡劑量:扣住的 35 張對照表(等 Ting 逐張裁)

**MEASURED TREE: main @ 9614df3c + 並列顯示(本 commit)**　重現:`node scripts/validate-herb-dosage-shape.js`(D6 行;閘門含退役卡故數字各多 1–2)

未退役 360 張:已整理 167、參考範圍 110、扣住 35、無資料 48。

這張表只列資料裡**已經有**的字,沒有新增或修改任何數字。「藥用原文」就是放行後卡片會顯示的字;食療原文無論怎麼裁都不會顯示。

裁定欄請填:**放**(顯示參考範圍,照樣標「單一來源,未經藥典核對」)/ **扣**(維持待補)/ **查**(要另找具名來源)。

## 性味欄寫著有毒或小毒(18 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 1 | 細辛 | 課件：1–3g（標註「Know this!!!」）〔unclear〕;5g（課件：絕不可超過）〔unclear〕 | 課件 | — | 辛、溫、有毒 | toxicity_review、dose_preparation_review |  |
| 2 | 蒼耳子 | 3-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/977) | 3-6克 | 辛、苦、溫、有毒 | toxicity_review |  |
| 3 | 赤芍 | 6-12克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/988) | 5-10克 | 甘、苦、平、澀、微寒、無毒、酸、鹹、涼、小毒 ⚠同欄並寫有毒與無毒 | — |  |
| 4 | 大黃 | 3-9克（入藥）〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1002) | 3-5段（約10-30克） | 甘、苦、有毒、寒、無毒 ⚠同欄並寫有毒與無毒 | dietary_exceeds_medicinal |  |
| 5 | 甘遂 | 0.5-1.5克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1040) | 0.5-1克 | 苦、寒、有毒 | toxicity_review、not_for_self_treatment、dose_preparation_review |  |
| 6 | 威靈仙 | 6-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1199) | 6-12克 | 辛、微苦、溫、鹹、小毒 | dietary_exceeds_medicinal |  |
| 7 | 防己 | 煎湯內服，每日6～10克。〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/4057) | 3～9克（視體質及病症調整） | 辛、苦、平、寒、小毒 | aristolochic_acid_risk_pending_ting_review |  |
| 8 | 附子 | 3-15克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1037) | 3-9克 | 辛、甘、大熱、有毒 | toxicity_review、not_for_self_treatment、dose_preparation_review |  |
| 9 | 吳茱萸 | 1-3克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1207) | 1-3克 | 辛、熱、苦、小毒 | toxicity_review、dose_preparation_review |  |
| 10 | 川楝子 | 3-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/993) | 3-6克 | 苦、小毒、寒 | toxicity_review、dose_preparation_review |  |
| 11 | 艾葉 | 3-9克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/944) | 6-12克（內服煎湯） | 辛、苦、溫、小毒 | dietary_exceeds_medicinal |  |
| 12 | 杏仁 | 內服：煎湯，3-10g〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/3) | — | 苦、微溫、有小毒 | toxicity_review |  |
| 13 | 全蠍 | 內服煎湯，常用劑量為3-6克〔decoction〕;研末吞服，每次0.6-1克。〔powder〕 | [CloudTCM](https://cloudtcm.com/herb/1525) | 作為食療（如油炸），每次不宜超過5-8只，一周食用2-3次為宜。 | 辛、有毒、平 | toxicity_review、not_for_self_treatment、urgent_red_flag_review、dose_preparation_review / dietary_exceeds_medicinal |  |
| 14 | 龜板 | 9-24克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1056) | 9-15克 | 甘、平、有毒、無毒、鹹 ⚠同欄並寫有毒與無毒 | — |  |
| 15 | 花椒 | 2-5克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/992) | 2-6克 | 溫、辛、苦、無毒、小毒、有毒、大熱 ⚠同欄並寫有毒與無毒 | dietary_exceeds_medicinal |  |
| 16 | 使君子 | 6-9克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1180) | 3-6克（小兒酌減） | 甘、溫、小毒、有毒 | — |  |
| 17 | 苦楝皮 | 內服：煎湯，6-15g，鮮品15-30g〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/6540) | — | 苦、寒、有毒 | toxicity_review、not_for_self_treatment、dose_preparation_review |  |
| 18 | 葶藶子 | 內服：煎湯，3-10克〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/1519) | 1.5-5克，須嚴格遵從醫囑，不可過量。 | 辛、苦、寒、有毒、無毒 ⚠同欄並寫有毒與無毒 | — |  |

## 帶安全旗標(9 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 19 | 苦參 | 內服：煎湯，3-10g〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/1781) | — | 苦、寒 | toxicity_review |  |
| 20 | 款冬花 | 煎湯內服，每日5-10克〔decoction〕 | [CloudTCM](https://cloudtcm.com/herb/1518) | 3-9克 | 辛、微苦、溫 | toxicity_review |  |
| 21 | 石菖蒲 | 3-9克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1176) | 3-6克 | 辛、苦、微溫 | urgent_red_flag_review |  |
| 22 | 鉤藤 | 3-12克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1049) | 6-10克 | 甘、苦、微寒、涼 | urgent_red_flag_review |  |
| 23 | 天麻 | 3-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1192) | 6-12克 | 甘、辛、平、無毒 | urgent_red_flag_review / dietary_exceeds_medicinal |  |
| 24 | 地龍 | 5-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1017) | 3-9克 | 寒、鹹 | urgent_red_flag_review |  |
| 25 | 何首烏 | 6-12克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1062) | 6-15克 | 甘、苦、微溫、澀 | toxicity_review / dietary_exceeds_medicinal |  |
| 26 | 檳榔 | 3-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/974) | 3-6克（日常消食） | 辛、苦、溫 | toxicity_review、dose_preparation_review |  |
| 27 | 白僵蠶 | 5-10克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1087) | 3-9克 | 平、辛、鹹 | urgent_red_flag_review |  |

## 給法矛盾(4 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 28 | 芒硝 | 6-12克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1117) | 3-9克 | 辛、甘、苦、寒、無毒、鹹、小毒、大寒、微甘 ⚠同欄並寫有毒與無毒 | route_contradiction |  |
| 29 | 阿膠 | 6-12克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1025) | 5-10克 | 平、甘 | route_contradiction |  |
| 30 | 鹿角膠 | 3-6克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1110) | 3-9克 | 溫、甘、鹹、無毒 | dietary_exceeds_medicinal、route_contradiction |  |
| 31 | 鹿茸 | 1-3克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1111) | 1-2克 | 甘、溫、鹹 | route_contradiction |  |

## 出處寫明待核對(2 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 32 | 雄黃 | 內服 0.05–0.1g，入丸散用〔pill〕 | 中華人民共和國藥典（一部）礦物藥項下用量；毒性與炮製禁忌為該類藥通行記載。⚠️ 數字待 Ting 以手邊藥典核對後升級。 | — | 辛，溫；有毒 | toxicity_review、not_for_self_treatment、dose_preparation_review、heavy_metal_quality_review |  |
| 33 | 硃砂 | 內服 0.1–0.5g，只入丸散，不入湯劑。〔pill〕 | 中華人民共和國藥典（一部）礦物藥項下用量；毒性與炮製禁忌為該類藥通行記載。⚠️ 數字待 Ting 以手邊藥典核對後升級。 | — | 甘，微寒；有毒 | toxicity_review、not_for_self_treatment、dose_preparation_review、heavy_metal_quality_review |  |

## 具名列管(SAFETY_HOLD)(1 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 34 | 蘇合香 | 9-15克〔unclear〕 | [CloudTCM](https://cloudtcm.com/herb/1185) | 10-30克 | 辛、甘、無毒、溫 | not_for_self_treatment、urgent_red_flag_review / dietary_exceeds_medicinal、magnitude_suspicious |  |

## 沒有可辨識的藥用數字(1 張)

| # | 藥名 | 藥用原文(資料) | 出處 | 食療原文(不顯示) | 性味欄 | 旗標 | 裁定 |
|---|---|---|---|---|---|---|---|
| 35 | 代赭石 | — | — | — | 苦、寒、無毒、甘、平 | heavy_metal_quality_review |  |

# CLINICAL V2 SELECTOR / VOCABULARY PACK v0

Status: **RESEARCH STAGING / NOT CANONICAL**

Use for UI selector scaffolding and gap review. Before ingestion, dedupe against existing canonical registries.

## `life.*`

| Candidate ID | English | 中文 |
|---|---|---|
| `life.sleep_schedule` | Sleep schedule | 睡眠作息 |
| `life.sleep_duration` | Sleep duration | 睡眠時數 |
| `life.caffeine` | Caffeine intake | 咖啡因攝取 |
| `life.alcohol` | Alcohol use | 酒精使用 |
| `life.nicotine` | Nicotine use | 尼古丁使用 |
| `life.exercise` | Exercise | 運動 |
| `life.sedentary_time` | Sedentary time | 久坐時間 |
| `life.hydration` | Hydration | 飲水 |
| `life.late_meals` | Late meals | 晚餐過晚 |
| `life.raw_cold_foods` | Raw/cold foods | 生冷食物 |
| `life.hot_beverages` | Very hot beverages | 過熱飲品 |
| `life.spicy_food` | Spicy food | 辛辣食物 |
| `life.processed_food` | Processed food | 加工食品 |
| `life.sugar_intake` | Sugar intake | 糖攝取 |
| `life.fasting` | Fasting | 禁食/斷食 |
| `life.raw_seafood` | Raw seafood | 生食海鮮 |
| `life.meal_regularities` | Meal regularity | 進餐規律 |
| `life.screen_before_bed` | Screen use before bed | 睡前螢幕使用 |
| `life.stress_load` | Perceived stress load | 自覺壓力 |
| `life.outdoor_activity` | Outdoor activity | 戶外活動 |
| `life.resistance_training` | Resistance training | 阻力訓練 |
| `life.aerobic_activity` | Aerobic activity | 有氧活動 |
| `life.work_schedule` | Work schedule | 工作作息 |
| `life.travel_jetlag` | Travel/jet lag | 旅行/時差 |

## `exposure.*`

| Candidate ID | English | 中文 |
|---|---|---|
| `exposure.wildfire_smoke` | Wildfire smoke | 野火煙霧 |
| `exposure.mold` | Mold exposure | 黴菌暴露 |
| `exposure.lead` | Lead exposure | 鉛暴露 |
| `exposure.mercury` | Mercury exposure | 汞暴露 |
| `exposure.pesticide` | Pesticide exposure | 農藥暴露 |
| `exposure.solvent` | Solvent exposure | 溶劑暴露 |
| `exposure.occupational_dust` | Occupational dust | 職業粉塵 |
| `exposure.carbon_monoxide` | Carbon monoxide | 一氧化碳 |
| `exposure.secondhand_smoke` | Secondhand smoke | 二手菸 |
| `exposure.air_pollution` | Air pollution | 空氣污染 |
| `exposure.chemical_fumes` | Chemical fumes | 化學煙霧 |
| `exposure.extreme_heat` | Extreme heat | 極端高溫 |
| `exposure.extreme_cold` | Extreme cold | 極端低溫 |
| `exposure.noise` | High noise exposure | 高噪音暴露 |

Recommended status vocabulary:
- suspected
- patient_reported
- confirmed
- historical
- ongoing
- resolved/ended where appropriate

Never silently promote suspected → confirmed.

## `adverse_event.*`

| Candidate ID | English | 中文 |
|---|---|---|
| `adverse_event.dizziness` | Dizziness | 頭暈 |
| `adverse_event.needling_pain` | Needling pain | 針刺疼痛 |
| `adverse_event.bruising` | Bruising | 瘀青 |
| `adverse_event.post_treatment_fatigue` | Post-treatment fatigue | 治療後疲勞 |
| `adverse_event.nausea` | Nausea | 噁心 |
| `adverse_event.headache_after_treatment` | Headache after treatment | 治療後頭痛 |
| `adverse_event.anxiety` | Anxiety | 焦慮 |
| `adverse_event.cupping_blister` | Cupping blister | 拔罐水泡 |
| `adverse_event.fainting` | Fainting/syncope | 暈厥 |
| `adverse_event.minor_bleeding` | Minor bleeding | 少量出血 |
| `adverse_event.skin_irritation` | Skin irritation | 皮膚刺激 |
| `adverse_event.burn` | Burn | 燙傷 |

Suggested fields:
- severity
- related intervention/modality
- patientReported
- onset/resolution text/date if known
- provenance
- resolved

Do not auto-assert causality.

## `modality.*`

| Candidate ID | English | 中文 |
|---|---|---|
| `modality.acupuncture` | Acupuncture | 針刺 |
| `modality.electroacupuncture` | Electroacupuncture | 電針 |
| `modality.cupping` | Cupping | 拔罐 |
| `modality.gua_sha` | Gua sha | 刮痧 |
| `modality.moxibustion` | Moxibustion | 艾灸 |
| `modality.tuina` | Tui na | 推拿 |
| `modality.ear_acupuncture` | Auricular acupuncture | 耳針 |
| `modality.scalp_acupuncture` | Scalp acupuncture | 頭皮針 |
| `modality.heat_therapy` | Heat therapy | 熱療 |
| `modality.exercise_therapy` | Exercise therapy | 運動治療 |
| `modality.dietary_counseling` | Dietary counseling | 飲食衛教 |
| `modality.herbal_formula` | Herbal formula | 中藥方劑 |

## UI rules

- allow search by English/Chinese/alias
- allow unknown/free-text note without forcing a canonical candidate
- do not make candidate vocabulary authoritative just because it appears in a dropdown
- keep selector data separate from Visit narrative

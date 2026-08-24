# SYM + METRIC SEED CANDIDATES v0

Status: **RESEARCH STAGING / NOT CANONICAL**

`sym.*` is identity; `metric.*` is longitudinal measurement. They may coexist.

## Symptom candidates

| ID | English | 中文 |
|---|---|---|
| sym.headache | Headache | 頭痛 |
| sym.neck_pain | Neck pain | 頸痛 |
| sym.shoulder_pain | Shoulder pain | 肩痛 |
| sym.low_back_pain | Low back pain | 下背痛 |
| sym.knee_pain | Knee pain | 膝痛 |
| sym.dizziness | Dizziness | 頭暈 |
| sym.vertigo | Vertigo | 眩暈 |
| sym.tinnitus | Tinnitus | 耳鳴 |
| sym.insomnia | Insomnia | 失眠 |
| sym.fatigue | Fatigue | 疲勞 |
| sym.palpitations | Palpitations | 心悸 |
| sym.shortness_of_breath | Shortness of breath | 呼吸急促 |
| sym.cough | Cough | 咳嗽 |
| sym.nausea | Nausea | 噁心 |
| sym.abdominal_bloating | Abdominal bloating | 腹脹 |
| sym.abdominal_pain | Abdominal pain | 腹痛 |
| sym.constipation | Constipation | 便秘 |
| sym.diarrhea | Diarrhea | 腹瀉 |
| sym.reflux | Reflux symptoms | 胃食道逆流症狀 |
| sym.poor_appetite | Poor appetite | 食慾不振 |
| sym.hot_flash | Hot flash | 潮熱 |
| sym.dysmenorrhea | Dysmenorrhea | 痛經 |
| sym.heavy_menstrual_bleeding | Heavy menstrual bleeding | 月經過多 |
| sym.nasal_congestion | Nasal congestion | 鼻塞 |
| sym.pruritus | Pruritus | 搔癢 |
| sym.muscle_cramp | Muscle cramp | 肌肉抽筋 |
| sym.numbness | Numbness | 麻木 |
| sym.weakness | Weakness | 無力 |

## Metric candidates

| ID | English | 中文 | Scale/unit |
|---|---|---|---|
| metric.pain_score | Pain score | 疼痛分數 | 0-10 |
| metric.sleep_quality | Sleep quality | 睡眠品質 | ordinal_or_numeric |
| metric.sleep_duration_hours | Sleep duration | 睡眠時數 | hours |
| metric.sleep_onset_latency_min | Sleep onset latency | 入睡時間 | minutes |
| metric.night_awakenings | Night awakenings | 夜間醒來次數 | count |
| metric.fatigue_score | Fatigue score | 疲勞分數 | numeric |
| metric.bowel_movements_per_week | Bowel movements/week | 每週排便次數 | per_week |
| metric.stool_form_bristol | Bristol stool type | Bristol 糞便分類 | 1-7 |
| metric.hot_flash_count_day | Hot flashes/day | 每日潮熱次數 | per_day |
| metric.range_of_motion_deg | Range of motion | 關節活動度 | degrees |

Rules: do not force every symptom to have a metric; allow multiple metrics per symptom; preserve missing/unknown rather than coercing to zero.
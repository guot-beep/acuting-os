# SYM SEED RESEARCH BATCH B v1

**RESEARCH STAGING / NOT CANONICAL**

CR-001. 28 candidate `sym.*` records. Repo schema/DECISIONS override this staging pack.

## Classification note
All 28 current candidates have a recognizable biomedical symptom/finding term, so under the requested rule they classify as `both`, not TCM-only.

## Records
### `sym.headache` — Headache / 頭痛
- tradition: `both`
- western_term: headache
- body_region: `head_face`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden explosive/worst-ever headache; focal neurologic deficit; fever with stiff neck; post-trauma headache
  - sources: https://medlineplus.gov/ency/patientinstructions/000424.htm; https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.neck_pain` — Neck pain / 頸痛
- tradition: `both`
- western_term: neck pain
- body_region: `musculoskeletal`
- related_metric_ids: `metric.range_of_motion_deg`
- red_flags:
  - Major trauma, new limb weakness/numbness, gait change, fever/meningismus, or severe sudden pain requires urgent evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm; https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.shoulder_pain` — Shoulder pain / 肩痛
- tradition: `both`
- western_term: shoulder pain
- body_region: `musculoskeletal`
- related_metric_ids: `metric.range_of_motion_deg`
- red_flags:
  - Shoulder discomfort with chest pain, dyspnea, diaphoresis, syncope, or major trauma can indicate non-musculoskeletal emergency
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.low_back_pain` — Low back pain / 下背痛
- tradition: `both`
- western_term: low back pain
- body_region: `musculoskeletal`
- related_metric_ids: `metric.range_of_motion_deg`
- red_flags:
  - New bowel/bladder dysfunction, saddle anesthesia, major/progressive weakness, fever, cancer/infection context, or major trauma are red flags
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.knee_pain` — Knee pain / 膝痛
- tradition: `both`
- western_term: knee pain
- body_region: `musculoskeletal`
- related_metric_ids: `metric.range_of_motion_deg`
- red_flags:
  - Hot swollen joint with fever, inability to bear weight after major injury, or neurovascular compromise needs urgent assessment
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.dizziness` — Dizziness / 頭暈
- tradition: `both`
- western_term: dizziness
- body_region: `neuro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden dizziness with unilateral weakness/numbness, speech/vision change, severe headache, or inability to walk can be stroke
  - sources: https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.vertigo` — Vertigo / 眩暈
- tradition: `both`
- western_term: vertigo
- body_region: `neuro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - New focal neurologic deficit, severe headache, diplopia, dysarthria, or inability to walk raises concern for central cause/stroke
  - sources: https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.tinnitus` — Tinnitus / 耳鳴
- tradition: `both`
- western_term: tinnitus
- body_region: `ears_nose_throat`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden severe hearing loss with tinnitus, new neurologic deficit, or pulsatile tinnitus warrants prompt medical assessment
  - sources: https://medlineplus.gov/ency/article/003044.htm

### `sym.insomnia` — Insomnia / 失眠
- tradition: `both`
- western_term: insomnia
- body_region: `sleep_energy_mood`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Severe insomnia with suicidality, mania/psychosis, dangerous impairment, or substance withdrawal requires urgent evaluation
  - sources: https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.fatigue` — Fatigue / 疲勞
- tradition: `both`
- western_term: fatigue
- body_region: `sleep_energy_mood`
- related_metric_ids: `metric.fatigue_score`
- red_flags:
  - Fatigue with chest pain, severe dyspnea, syncope, major bleeding, high fever, or acute neurologic change requires urgent evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm; https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.palpitations` — Palpitations / 心悸
- tradition: `both`
- western_term: palpitations
- body_region: `chest_cardio`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Palpitations with syncope/presyncope, chest pain, severe dyspnea, or sustained hemodynamic instability are urgent
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.shortness_of_breath` — Shortness of breath / 呼吸急促
- tradition: `both`
- western_term: dyspnea
- body_region: `respiratory`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Severe or sudden breathing difficulty, cyanosis, chest pain, altered mental status, or inability to speak normally is emergency-level
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.cough` — Cough / 咳嗽
- tradition: `both`
- western_term: cough
- body_region: `respiratory`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Hemoptysis, severe dyspnea, cyanosis, chest pain, or persistent high fever are red flags
  - sources: https://medlineplus.gov/ency/patientinstructions/000593.htm; https://medlineplus.gov/ency/article/001927.htm

### `sym.nausea` — Nausea / 噁心
- tradition: `both`
- western_term: nausea
- body_region: `digestive`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Persistent vomiting, hematemesis, severe abdominal pain, altered mental status, or significant dehydration require urgent assessment
  - sources: https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.abdominal_bloating` — Abdominal bloating / 腹脹
- tradition: `both`
- western_term: abdominal bloating
- body_region: `digestive`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Marked distension with severe pain, persistent vomiting, inability to pass stool/gas, GI bleeding, or shock symptoms is concerning for obstruction/acute abdomen
  - sources: https://medlineplus.gov/ency/article/001927.htm; https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.abdominal_pain` — Abdominal pain / 腹痛
- tradition: `both`
- western_term: abdominal pain
- body_region: `digestive`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden/severe pain, rigid abdomen, GI bleeding, syncope, pregnancy with severe pain/bleeding, or persistent vomiting are red flags
  - sources: https://medlineplus.gov/ency/article/001927.htm; https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.constipation` — Constipation / 便秘
- tradition: `both`
- western_term: constipation
- body_region: `digestive`
- related_metric_ids: `metric.stool_form_bristol`
- red_flags:
  - Constipation with severe distension/pain, vomiting, inability to pass gas, GI bleeding, or systemic illness needs urgent evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.diarrhea` — Diarrhea / 腹瀉
- tradition: `both`
- western_term: diarrhea
- body_region: `digestive`
- related_metric_ids: `metric.stool_form_bristol`
- red_flags:
  - Bloody/black stool, severe dehydration, persistent vomiting, severe abdominal pain, or high fever warrants urgent assessment
  - sources: https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.reflux` — Reflux symptoms / 胃食道逆流症狀
- tradition: `both`
- western_term: gastroesophageal reflux symptoms
- body_region: `digestive`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Dysphagia/odynophagia, GI bleeding, progressive weight loss, recurrent vomiting, or chest pain concerning for cardiac disease are alarm features
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.poor_appetite` — Poor appetite / 食慾不振
- tradition: `both`
- western_term: decreased appetite
- body_region: `digestive`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Unintentional major weight loss, dehydration, GI bleeding, severe depression/suicidality, or systemic illness requires further evaluation
  - sources: https://medlineplus.gov/ency/patientinstructions/000593.htm

### `sym.hot_flash` — Hot flash / 潮熱
- tradition: `both`
- western_term: hot flash/vasomotor symptom
- body_region: `gyn_repro`
- related_metric_ids: `metric.hot_flash_count_day`
- red_flags:
  - New flushing with syncope, chest pain, severe palpitations, unexplained weight loss/fever, or atypical onset should prompt broader evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.dysmenorrhea` — Dysmenorrhea / 痛經
- tradition: `both`
- western_term: dysmenorrhea
- body_region: `gyn_repro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden severe pelvic pain, pregnancy possibility, syncope, fever, or heavy bleeding requires urgent evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.heavy_menstrual_bleeding` — Heavy menstrual bleeding / 月經過多
- tradition: `both`
- western_term: heavy menstrual bleeding
- body_region: `gyn_repro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Soaking bleeding with dizziness/syncope, dyspnea, chest pain, pregnancy, or hemodynamic symptoms is urgent
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.nasal_congestion` — Nasal congestion / 鼻塞
- tradition: `both`
- western_term: nasal congestion
- body_region: `ears_nose_throat`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Airway compromise, facial/orbital swelling, altered mental status, severe headache with fever, or persistent unilateral bloody discharge needs evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.pruritus` — Pruritus / 搔癢
- tradition: `both`
- western_term: pruritus
- body_region: `skin`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Pruritus with facial/tongue swelling, hives plus breathing difficulty, jaundice/systemic illness, or blistering rash can be serious
  - sources: https://medlineplus.gov/ency/article/001927.htm

### `sym.muscle_cramp` — Muscle cramp / 肌肉抽筋
- tradition: `both`
- western_term: muscle cramp
- body_region: `musculoskeletal`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Cramp with marked unilateral swelling, progressive weakness, dark urine after exertion, chest symptoms, or neurologic deficit needs evaluation
  - sources: https://medlineplus.gov/ency/article/001927.htm; https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.numbness` — Numbness / 麻木
- tradition: `both`
- western_term: numbness/paresthesia
- body_region: `neuro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden unilateral numbness, especially with weakness, speech/vision change, dizziness, or severe headache, can be stroke
  - sources: https://www.cdc.gov/stroke/signs-symptoms/index.html

### `sym.weakness` — Weakness / 無力
- tradition: `both`
- western_term: weakness
- body_region: `neuro`
- related_metric_ids: none in CR-002 new-metric set
- red_flags:
  - Sudden unilateral weakness, facial droop, speech/vision change, severe headache, or inability to walk can be stroke
  - sources: https://www.cdc.gov/stroke/signs-symptoms/index.html

## Source-policy note
These are triage associations for a seed vocabulary, not diagnostic rules. Red flags intentionally favor high-sensitivity safety prompts. Clinical workflow should not infer diagnoses automatically from a selected symptom.
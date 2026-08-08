# AD Pattern Enrichment 01 — Heart / Shen 心與神志

**Use:** enrich existing AcuTing `pattern.*` cards only.  
**Source type:** American Dragon secondary reference.  
**Do not treat AD condition-page placement as Western-disease equivalence.**

## 心氣虛 · Heart Qi Deficiency

- **Canonical ID:** `pattern.heart_qi_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 氣短，活動後較明顯 — Shortness of breath, worse with exertion
- 自汗 — Spontaneous daytime sweating
- 疲倦乏力 — Fatigue and weakness
- 面色淡白 — Pale complexion
- 胸中窒悶或氣塞感 — Stifling/suffocating chest sensation

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡，常可見胖嫩 — Pale, may be swollen
- **Coating 苔:** 白或薄白 — White / thin white

### Pulse 脈象
- **Pulse 脈:** 虛弱；可見大而無力或間歇 — Weak; sometimes large-weak or intermittent

### Treatment Principle 治則
- 補益心氣 / Reinforce and strengthen Heart Qi

### Formula Link Candidates 方劑連結候選
- `Si Jun Zi Tang`
- `Bao Yuan Tang / Bao Yuan Dan`
- `Zhi Gan Cao Tang`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `PC-6`
- `REN-6`
- `REN-14`
- `REN-17`
- `ST-36`
- `UB-15`

### American Dragon Sources
- https://www.americandragon.com/conditions/Weakness.html

### Import / Review Note
- AD pages sometimes label the Heart-Qi/Heart-Yang boundary inconsistently. Preserve the current AcuTing pattern identity and use manifestations as supporting evidence, not as an excuse to merge two patterns.

---

## 心陽虛 · Heart Yang Deficiency

- **Canonical ID:** `pattern.heart_yang_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 氣短 — Shortness of breath
- 日間自汗 — Spontaneous daytime sweating
- 勞累後加重 — Worse after exertion/fatigue
- 四肢冷、畏寒 — Cold limbs / chills
- 疲勞與虛弱 — Fatigue and weakness
- 胸中窒悶 — Stifling sensation in the chest
- 面色蒼白，較重時可見青紫傾向 — Pale complexion; cyanotic tendency described in severe contexts
- 情緒低落可伴隨 — Depression may accompany

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡、胖或腫 — Pale and swollen
- **Coating 苔:** 白 — White

### Pulse 脈象
- **Pulse 脈:** 細弱、弱；部分情境可見結代/間歇 — Thready/weak; knotted or intermittent in some contexts

### Treatment Principle 治則
- 溫補／扶助心陽；保留目前 AcuTing 的「溫補心陽」作 canonical wording / Warm and support Heart Yang

### Formula Link Candidates 方劑連結候選
- `Bao Yuan Tang / Bao Yuan Dan`
- `Zhi Gan Cao Tang`
- `Gui Zhi Gan Cao Long Gu Mu Li Tang (context candidate)`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `PC-6`
- `REN-14`
- `REN-17`
- `ST-36`
- `UB-15`

### American Dragon Sources
- https://www.americandragon.com/conditions/Weakness.html
- https://www.americandragon.com/conditions/CoronaryHeartDisease.html

### Import / Review Note
- Do not overwrite the current Chinese treatment principle with an awkward literal translation from AD.
- Formula candidates vary by AD clinical page; keep source-scoped provenance.

---

## 心血虛 · Heart Blood Deficiency

- **Canonical ID:** `pattern.heart_blood_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 失眠、多夢 — Insomnia and profuse dreaming
- 易驚 — Easily startled
- 焦慮／煩躁 — Anxiety or irritability
- 健忘 — Poor memory
- 眩暈 — Dizziness
- 面色與唇色淡 — Pale face and lips

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡 — Pale
- **Coating 苔:** 未穩定列出／多頁不一定標示 — Not consistently specified

### Pulse 脈象
- **Pulse 脈:** 細弱 — Thready and weak

### Treatment Principle 治則
- 養心血、安心神 / Nourish Heart Blood and calm the Shen

### Formula Link Candidates 方劑連結候選
- `Suan Zao Ren Tang`
- `Zhi Gan Cao Tang`
- `Dang Gui Bu Xue Tang (context candidate)`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `PC-6`
- `REN-4`
- `REN-14`
- `SP-6`
- `ST-36`
- `UB-15`
- `UB-17`
- `UB-20`

### American Dragon Sources
- https://www.americandragon.com/conditions/Weakness.html
- https://www.americandragon.com/conditions/Schizophrenia.html

### Import / Review Note
- Do not let the psychiatric condition page name become a biomedical mapping. Use only the Pattern block.

---

## 心陰虛 · Heart Yin Deficiency

- **Canonical ID:** `pattern.heart_yin_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 煩躁、易驚 — Irritability and easy startling
- 失眠多夢 — Insomnia with dreaming
- 健忘 — Poor memory
- 低熱或午後虛熱 — Low-grade deficiency heat
- 盜汗 — Night sweats
- 五心煩熱 — Five-center heat
- 口乾、咽乾、口渴 — Dry mouth/throat and thirst
- 顴紅 — Malar flush

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 紅、乾 — Red and dry
- **Coating 苔:** 少苔或無苔 — Little or no coating

### Pulse 脈象
- **Pulse 脈:** 細數 — Thready and rapid

### Treatment Principle 治則
- 滋心陰、清虛熱、安心神 / Nourish Heart Yin, clear deficiency heat, calm Shen

### Formula Link Candidates 方劑連結候選
- `Tian Wang Bu Xin Dan`

### Acupoint Link Candidates 穴位連結候選
- `HT-5`
- `HT-6`
- `HT-7`
- `PC-5`
- `PC-6`
- `PC-7`
- `REN-14`
- `SP-6`
- `UB-15`

### American Dragon Sources
- https://www.americandragon.com/conditions/Weakness.html

### Import / Review Note
- Good candidate to populate the currently sparse Tongue/Pulse fields if the existing card is empty.

---

## 心火亢盛／心火上炎 · Heart Fire

- **Canonical ID:** `pattern.heart_fire` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 失眠、難入睡、多夢或惡夢 — Insomnia, difficulty falling asleep, disturbed dreams
- 煩躁、激動、焦慮 — Restlessness, agitation, anxiety
- 心悸 — Palpitations
- 口舌糜爛或潰瘍疼痛 — Painful mouth/tongue ulcers
- 口渴喜冷飲 — Thirst for cold drinks
- 易怒、面紅 — Irritability and flushed face
- 口苦 — Bitter taste
- 小便短赤；部分情境可見尿痛或血尿 — Scant dark urine; dysuria/hematuria in some contexts

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 紅，舌尖更紅，可見舌尖潰瘍 — Red with redder tip; tip ulcers may occur
- **Coating 苔:** 正常或黃 — Normal or yellow

### Pulse 脈象
- **Pulse 脈:** 洪/實數傾向 — Excess and rapid

### Treatment Principle 治則
- 清心瀉火、安神 / Clear Heart heat, drain fire, calm Shen

### Formula Link Candidates 方劑連結候選
- `Dao Chi San`
- `Zhu Sha An Shen Wan (context candidate)`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `HT-8`
- `PC-7`
- `PC-8`
- `UB-15`

### American Dragon Sources
- https://www.americandragon.com/conditions/PanicDisorder.html
- https://americandragon.com/conditions/Fatigue.html

### Import / Review Note
- Use current repo terminology to decide whether the canonical card is 心火亢盛, 心火上炎, or another accepted label. Do not create duplicates.

---

## 心腎陰虛／心腎不交相關證候 · Heart and Kidney Yin Deficiency / Heart-Kidney Disharmony context

- **Canonical ID:** `pattern.heart_kidney_yin_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 失眠多夢 — Insomnia with much dreaming
- 心悸、易驚 — Palpitations and easy startling
- 健忘 — Poor memory
- 眩暈、耳鳴 — Dizziness and tinnitus
- 腰痠、腿膝無力 — Low-back soreness and weak legs/knees
- 潮熱、盜汗 — Tidal fever and night sweats
- 口乾、顴紅 — Dry mouth and red cheeks
- 遺精／早洩等腎系表現可見 — Spermatorrhea/premature ejaculation may occur

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 紅 — Red
- **Coating 苔:** 少苔或無苔 — Little or no coating

### Pulse 脈象
- **Pulse 脈:** 細數 — Thready and rapid

### Treatment Principle 治則
- 滋養心腎之陰、清虛火、交通心腎 / Nourish Heart-Kidney Yin, reduce deficiency fire, restore Heart-Kidney communication

### Formula Link Candidates 方劑連結候選
- `Jiao Tai Wan`
- `Tian Wang Bu Xin Dan`
- `Liu Wei Di Huang Wan`
- `Mai Wei Di Huang Wan`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `KI-3`
- `PC-6`
- `PC-7`
- `UB-15`
- `UB-23`

### American Dragon Sources
- https://www.americandragon.com/conditions/Weakness.html
- https://www.americandragon.com/conditions/Anemia.html
- https://www.americandragon.com/conditions/CoronaryHeartDisease.html

### Import / Review Note
- Important: 'Heart and Kidney Yin Deficiency' and 'Heart-Kidney not communicating' are not automatically identical namespaces. Match the existing AcuTing concept deliberately.

---

## 心脾兩虛／心血脾氣虛 · Heart Blood and Spleen Qi Deficiency

- **Canonical ID:** `pattern.heart_spleen_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 失眠多夢、易驚 — Insomnia, dreams, easy startling
- 健忘 — Poor memory
- 四肢倦怠 — Tired limbs
- 食慾差 — Poor appetite
- 脘腹脹滿 — Epigastric/abdominal fullness
- 便溏 — Loose stools
- 面色萎黃 — Sallow complexion
- 月經量少、色淡，或崩漏／閉經等血失所養或不攝表現 — Menstrual abnormalities may accompany

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡 — Pale
- **Coating 苔:** 通常不特異／來源頁未固定 — Not consistently specified

### Pulse 脈象
- **Pulse 脈:** 細弱 — Thready and weak

### Treatment Principle 治則
- 補益心脾、益氣養血 / Reinforce Heart and Spleen; benefit Qi and nourish Blood

### Formula Link Candidates 方劑連結候選
- `Gui Pi Tang`
- `Dang Gui Bu Xue Tang + Si Wu Tang (source context)`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `REN-4`
- `SP-1`
- `SP-6`
- `ST-36`
- `UB-15`
- `UB-20`

### American Dragon Sources
- https://www.americandragon.com/conditions/Anemia.html
- https://www.americandragon.com/conditions/Weakness.html

### Import / Review Note
- Resolve the exact existing name. Some AD pages call this Spleen Qi and Heart Blood Deficiency.

---

## 心肺氣虛 · Heart and Lung Qi Deficiency

- **Canonical ID:** `pattern.heart_lung_qi_deficiency` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 心悸 — Palpitations
- 氣短、喘 — Shortness of breath / asthma tendency
- 咳嗽聲低無力 — Soft weak cough
- 清稀痰 — Clear watery sputum
- 胸中窒悶 — Stifling sensation in chest
- 自汗 — Spontaneous weak sweating
- 勞累後加劇 — Worse with exertion
- 聲音低弱、易感冒 — Weak voice and easy colds
- 面色白而少華 — Pale/shiny-white complexion

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡 — Pale
- **Coating 苔:** 薄白 — Thin white

### Pulse 脈象
- **Pulse 脈:** 弱或細弱 — Weak or thready-weak

### Treatment Principle 治則
- 補益心肺之氣 / Reinforce and benefit Heart and Lung Qi

### Formula Link Candidates 方劑連結候選
- `Bao Yuan Tang`
- `Bu Fei Tang`
- `Si Jun Zi Tang`
- `Sheng Mai San`
- `Zhi Gan Cao Tang`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `LU-9`
- `REN-17`
- `UB-13`
- `UB-15`

### American Dragon Sources
- https://americandragon.com/conditions/Dyspnea.html
- https://americandragon.com/conditions/Bronchitis.html

### Import / Review Note
- Formula and point links are source-context candidates; resolve existing IDs before authoring relations.

---

## 痰火擾心 · Phlegm-Fire Disturbs the Heart

- **Canonical ID:** `pattern.phlegm_fire_disturbs_heart` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 煩躁不安 — Irritability/restlessness
- 心悸 — Palpitations
- 口苦 — Bitter taste
- 失眠多夢 — Insomnia and vivid/profuse dreams
- 眩暈 — Dizziness
- 易驚 — Easily startled
- 胸悶 — Chest stuffiness
- 較重情境可見神志擾亂 — More severe contexts may include disturbed mental state

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 紅或舌尖紅 — Red / red tip
- **Coating 苔:** 黃膩 — Yellow and greasy

### Pulse 脈象
- **Pulse 脈:** 滑數有力，可兼弦 — Slippery, rapid, excess; may be wiry

### Treatment Principle 治則
- 清心化痰／豁痰，安神 / Clear Heart heat, transform or break through phlegm, calm Shen

### Formula Link Candidates 方劑連結候選
- `Wen Dan Tang`
- `Gun Tan Wan`
- `Dang Tan Tang`

### Acupoint Link Candidates 穴位連結候選
- `HT-7`
- `PC-5`
- `PC-6`
- `PC-7`
- `PC-8`
- `REN-14`
- `ST-40`
- `UB-15`

### American Dragon Sources
- https://www.americandragon.com/conditions/Insanity.html

### Import / Review Note
- Do not import the page title as a modern psychiatric diagnosis relation.

---

## 痰蒙心竅 · Phlegm Misting/Confusing the Heart Orifices

- **Canonical ID:** `pattern.phlegm_misting_heart_orifices` **only if this exact ID already exists in `pattern_registry.json`; otherwise MATCH/STAGE, do not create it automatically.**
- **AD role:** secondary clinical enrichment source

### Clinical Manifestations 臨床表現
- 神志昏蒙或意識混濁 — Mental confusion/clouded consciousness
- 自言自語、表情呆滯、行為異常 — Talking to oneself, blank expression, odd behavior
- 較重可昏厥或倒地 — Possible loss of consciousness/falling in severe contexts
- 喉中痰鳴 — Gurgling phlegm sound in throat
- 可伴胸悶、噁心、眩暈 — Chest oppression, nausea, vertigo may accompany

### Tongue / Coat 舌象 / 苔
- **Tongue 舌:** 淡紅或正常偏淡 — Pink
- **Coating 苔:** 白膩 — White and greasy

### Pulse 脈象
- **Pulse 脈:** 滑，或沉滑兼弦 — Slippery; sometimes deep-slippery/wiry

### Treatment Principle 治則
- 化痰開竅 / Clear phlegm and open the orifices

### Formula Link Candidates 方劑連結候選
- `Dao Tan Tang`

### Acupoint Link Candidates 穴位連結候選
- `DU-16`
- `DU-26`
- `HT-7`
- `PC-5`
- `ST-40`
- `UB-15`
- `UB-18`
- `UB-20`
- `UB-62`

### American Dragon Sources
- https://americandragon.com/conditions/Dyspnea.html
- https://www.americandragon.com/conditions/Schizophrenia.html

### Import / Review Note
- This Pattern can include altered consciousness. Do not use AD alone to author emergency/red-flag rules; biomedical safety review is separate.

---

# TCM Disease Biomedical Safety Overlay Queue

**Purpose:** prevent TCM disease names from hiding biomedical emergencies.

## Highest-value shared overlays

```text
胸痺 -> acute chest pain / ACS / MI / PE / aortic disease / pneumothorax
喘證 / 哮病 -> acute dyspnea / asthma attack / PE / pneumothorax / HF
眩暈 -> stroke/TIA / arrhythmia / severe orthostasis / vestibular emergency
頭痛 -> stroke/SAH context / GCA / infection when phenotype warrants
耳鳴耳聾 -> sudden sensorineural hearing loss / neurologic-vascular causes
目暗昏花 -> retinal detachment / acute angle closure / GCA / stroke
腹痛 -> appendicitis / obstruction / pancreatitis / ectopic pregnancy / vascular emergency
崩漏 -> pregnancy bleeding / hemodynamic instability / anemia / coagulopathy
水腫 -> HF / renal/liver disease / unilateral DVT
癃閉 -> acute urinary retention / cauda equina
乳蛾 -> airway/deep-neck infection red flags
```

Safety overlays should be relation/safety objects, not inserted into `bing_ji` as if they were TCM mechanism.

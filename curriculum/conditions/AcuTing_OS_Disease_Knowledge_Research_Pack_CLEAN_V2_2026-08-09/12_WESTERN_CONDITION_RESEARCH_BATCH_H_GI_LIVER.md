# Western Condition Research Batch H - Gastrointestinal / Liver

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 10  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Appendicitis · 闌尾炎

## Identity
```yaml
candidate_id: cond.appendicitis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Appendicitis is inflammation of the appendix, usually from luminal obstruction, and is a common cause of acute abdominal pain requiring urgent evaluation.

### `clinical_definition` [CANONICAL_NOW]
Untreated appendicitis can perforate, causing abscess or peritonitis.

### `etiology` [CANONICAL_NOW]
Obstruction by lymphoid swelling, fecal material or other causes can initiate inflammation and infection.

### `pathophysiology` [CANONICAL_NOW]
Luminal obstruction increases pressure, impairs blood flow and promotes bacterial overgrowth; ischemia and perforation can follow.

### `presentation_clinical` [CANONICAL_NOW]
Pain often begins near the umbilicus and migrates to right lower abdomen, with anorexia, nausea/vomiting and fever; atypical presentations occur.

### `key_features` [CANONICAL_NOW]
- acute abdomen
- migration to RLQ is classic but not universal
- perforation risk
- imaging/labs support diagnosis

### `red_flags` [CANONICAL_NOW]
Worsening localized pain, guarding/rigidity, high fever, sepsis, pregnancy or significant systemic illness requires urgent/emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
History/exam, CBC/urinalysis and ultrasound or CT depending age/pregnancy/context.

### `differential_diagnosis` [CANONICAL_NOW]
- gastroenteritis
- kidney stone
- ectopic pregnancy
- PID
- ovarian torsion
- Crohn disease

### `western_treatment` [CANONICAL_NOW]
Appendectomy is standard for many patients; selected uncomplicated cases may be managed with antibiotics under surgical/medical guidance.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat undiagnosed acute RLQ pain as Qi stagnation. Acute appendicitis is referral/emergency territory.

## Proposed relations [DERIVED_RELATION]
- sym.abdominal_pain candidate
- tdis.fu_tong differential context

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Appendicitis — https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 02. Gastritis / Gastropathy · 胃炎／胃黏膜病變

## Identity
```yaml
candidate_id: cond.gastritis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Gastritis is inflammation of the stomach lining; gastropathy is stomach-lining damage with little or no inflammation.

### `clinical_definition` [CANONICAL_NOW]
These are distinct pathological concepts and should not be treated as synonyms for dyspepsia or GERD.

### `etiology` [CANONICAL_NOW]
H. pylori, NSAIDs, alcohol, bile reflux, autoimmune disease and critical illness are important causes depending subtype.

### `pathophysiology` [CANONICAL_NOW]
Mucosal injury/inflammation reduces protective mechanisms and can lead to erosions, bleeding or atrophy.

### `presentation_clinical` [CANONICAL_NOW]
Upper abdominal discomfort, nausea/vomiting, early satiety or no symptoms; erosive disease can cause GI bleeding.

### `key_features` [CANONICAL_NOW]
- cause-specific
- H. pylori and NSAID exposure are high-yield
- can be asymptomatic
- bleeding is a complication

### `red_flags` [CANONICAL_NOW]
Hematemesis, melena, hemodynamic symptoms, severe persistent pain, significant anemia or weight loss needs prompt evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
History, H. pylori testing, CBC and endoscopy/biopsy when indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- peptic ulcer disease
- GERD
- functional dyspepsia
- pancreatobiliary disease
- cardiac ischemia

### `western_treatment` [CANONICAL_NOW]
Remove/treat cause, acid suppression when appropriate, eradicate H. pylori if present, and manage bleeding/atrophy complications.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptoms only after red flags are excluded; NSAID/anticoagulant history matters.

## Proposed relations [DERIVED_RELATION]
- tdis.wei_tong contextual
- nausea/epigastric_pain endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Gastritis & Gastropathy — https://www.niddk.nih.gov/health-information/digestive-diseases/gastritis-gastropathy
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 03. Peptic Ulcer Disease · 消化性潰瘍

## Identity
```yaml
candidate_id: cond.peptic_ulcer_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Peptic ulcer disease is an open sore in the stomach or duodenal lining, most commonly associated with H. pylori infection or NSAID exposure.

### `clinical_definition` [CANONICAL_NOW]
PUD is distinct from gastritis and GERD; complications include bleeding, perforation and gastric outlet obstruction.

### `etiology` [CANONICAL_NOW]
H. pylori and NSAIDs are major causes; other hypersecretory or medication/systemic contexts are less common.

### `pathophysiology` [CANONICAL_NOW]
Mucosal defense is overwhelmed by acid/peptic injury, producing focal ulceration.

### `presentation_clinical` [CANONICAL_NOW]
Burning/gnawing epigastric pain, nausea or early satiety may occur; some ulcers first present with bleeding.

### `key_features` [CANONICAL_NOW]
- gastric or duodenal ulcer
- H. pylori/NSAIDs
- bleeding/perforation risk
- endoscopy often central in high-risk cases

### `red_flags` [CANONICAL_NOW]
Hematemesis, melena, sudden severe rigid-abdomen pain, syncope or hemodynamic instability needs emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
H. pylori testing, CBC and upper endoscopy based on age/risk/red flags; imaging for suspected perforation.

### `differential_diagnosis` [CANONICAL_NOW]
- gastritis
- GERD
- pancreatitis
- biliary disease
- gastric cancer

### `western_treatment` [CANONICAL_NOW]
Acid suppression, H. pylori eradication, NSAID modification and endoscopic/surgical management of complications.

### `acupuncture_role` [CANONICAL_NOW]
Never treat active GI bleeding or suspected perforation. Adjunctive care only once medically stable.

## Proposed relations [DERIVED_RELATION]
- tdis.wei_tong
- GI_bleeding endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Peptic Ulcers — https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Irritable Bowel Syndrome · 腸躁症

## Identity
```yaml
candidate_id: cond.irritable_bowel_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
IBS is a disorder of gut-brain interaction characterized by recurrent abdominal pain associated with altered bowel habits without structural disease explaining the symptoms.

### `clinical_definition` [CANONICAL_NOW]
IBS is not inflammatory bowel disease and is not diagnosed solely by exclusion without symptom-pattern criteria.

### `etiology` [CANONICAL_NOW]
Multifactorial mechanisms include altered motility, visceral sensitivity, gut-brain signaling, microbiome and postinfectious changes.

### `pathophysiology` [CANONICAL_NOW]
Disordered sensory/motor processing produces pain and bowel-pattern changes despite no single structural lesion.

### `presentation_clinical` [CANONICAL_NOW]
Abdominal pain with constipation, diarrhea or mixed bowel pattern, bloating and symptom fluctuation.

### `key_features` [CANONICAL_NOW]
- disorder of gut-brain interaction
- IBS-C/IBS-D/mixed subtypes
- alarm features require alternate diagnosis
- IBD is distinct

### `red_flags` [CANONICAL_NOW]
GI bleeding, weight loss, nocturnal progressive symptoms, anemia, fever, family history of colorectal cancer/IBD or late new onset warrants evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical symptom criteria plus limited testing to exclude celiac disease, inflammation or other conditions when indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- IBD
- celiac disease
- colorectal cancer
- infection
- thyroid disease

### `western_treatment` [CANONICAL_NOW]
Dietary strategies, fiber based on subtype, gut-directed medicines, psychological/behavioral therapies and symptom-specific management.

### `acupuncture_role` [CANONICAL_NOW]
Reasonable adjunctive symptom role after alarm features are evaluated; track stool pattern and pain rather than assuming one TCM mechanism.

## Proposed relations [DERIVED_RELATION]
- tdis.fu_tong/xie_xie/bian_mi contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — IBS — https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should IBS-C/D/M be structured subtypes?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Inflammatory Bowel Disease (IBD) Parent · 發炎性腸道疾病

## Identity
```yaml
candidate_id: cond.inflammatory_bowel_disease
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Inflammatory bowel disease is a chronic immune-mediated intestinal inflammatory disease family whose major forms are Crohn disease and ulcerative colitis.

### `clinical_definition` [CANONICAL_NOW]
IBD is a parent identity and must remain distinct from IBS. Crohn disease and ulcerative colitis may warrant separate canonical child cards.

### `etiology` [CANONICAL_NOW]
Cause is multifactorial, involving immune dysregulation, genetics, microbiome and environmental factors.

### `pathophysiology` [CANONICAL_NOW]
Persistent inappropriate intestinal inflammation damages mucosa and, in Crohn disease, can involve deeper/transmural layers and any GI segment.

### `presentation_clinical` [CANONICAL_NOW]
Diarrhea, abdominal pain, blood in stool, urgency, weight loss, fatigue and extraintestinal manifestations can occur.

### `key_features` [CANONICAL_NOW]
- Crohn vs ulcerative colitis
- IBD != IBS
- chronic relapsing inflammation
- bleeding, obstruction/fistula/toxic colitis complications

### `red_flags` [CANONICAL_NOW]
Severe bleeding, dehydration, toxic megacolon signs, peritonitis, obstruction, fever/sepsis or rapidly worsening disease requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Labs/stool inflammatory markers plus endoscopy with biopsy and imaging; infection must be excluded.

### `differential_diagnosis` [CANONICAL_NOW]
- IBS
- infectious colitis
- celiac disease
- ischemic colitis
- colorectal cancer

### `western_treatment` [CANONICAL_NOW]
Anti-inflammatory, immunomodulatory and biologic/small-molecule therapies; surgery is needed for selected complications or refractory disease.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only, especially for stable symptoms; consider immunosuppression, anemia, infection risk and active flare severity.

## Proposed relations [DERIVED_RELATION]
- diarrhea/abdominal_pain/bleeding endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Ulcerative Colitis — https://www.niddk.nih.gov/health-information/digestive-diseases/ulcerative-colitis
- NIDDK — Crohn's Disease — https://www.niddk.nih.gov/health-information/digestive-diseases/crohns-disease
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Are Crohn and UC already separate cards? Parent may be navigational only.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 06. Acute Pancreatitis · 急性胰臟炎

## Identity
```yaml
candidate_id: cond.acute_pancreatitis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Acute pancreatitis is sudden inflammation of the pancreas that ranges from self-limited disease to systemic organ failure.

### `clinical_definition` [CANONICAL_NOW]
Acute pancreatitis is distinct from chronic pancreatitis and from nonspecific epigastric pain.

### `etiology` [CANONICAL_NOW]
Gallstones and alcohol are common causes; hypertriglyceridemia, medications, procedures and other causes also occur.

### `pathophysiology` [CANONICAL_NOW]
Premature activation of digestive enzymes and inflammatory pathways injures pancreatic tissue and can trigger systemic inflammation.

### `presentation_clinical` [CANONICAL_NOW]
Severe upper abdominal pain often radiating to the back, nausea/vomiting and tenderness.

### `key_features` [CANONICAL_NOW]
- acute severe epigastric pain
- lipase supports diagnosis
- gallstones/alcohol common
- organ failure defines severe disease

### `red_flags` [CANONICAL_NOW]
Shock, hypoxia, persistent organ failure, sepsis, severe dehydration or biliary obstruction/cholangitis needs hospital care.

### `diagnosis_methods` [CANONICAL_NOW]
Typical pain plus elevated pancreatic enzymes and/or imaging; ultrasound evaluates gallstones.

### `differential_diagnosis` [CANONICAL_NOW]
- peptic ulcer perforation
- biliary colic/cholecystitis
- MI
- aortic disease
- bowel ischemia

### `western_treatment` [CANONICAL_NOW]
Hospital supportive care with fluids, analgesia, nutrition and cause-specific management; procedures for biliary obstruction/complications as indicated.

### `acupuncture_role` [CANONICAL_NOW]
Not a routine acupuncture presentation during acute illness; severe abdominal pain warrants biomedical diagnosis first.

## Proposed relations [DERIVED_RELATION]
- sym.abdominal_pain/vomiting
- tdis.fu_tong differential

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Pancreatitis — https://www.niddk.nih.gov/health-information/digestive-diseases/pancreatitis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Gallstones / Gallbladder Disease · 膽結石／膽囊疾病

## Identity
```yaml
candidate_id: cond.gallstone_disease
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Gallstones are hardened deposits in the gallbladder that may be asymptomatic or cause biliary colic and complications such as cholecystitis, cholangitis or pancreatitis.

### `clinical_definition` [CANONICAL_NOW]
Asymptomatic cholelithiasis, acute cholecystitis and common-bile-duct stones are different clinical states and may need separate cards.

### `etiology` [CANONICAL_NOW]
Stone formation reflects cholesterol or pigment supersaturation, gallbladder stasis and other risk factors.

### `pathophysiology` [CANONICAL_NOW]
A stone intermittently or persistently obstructs the cystic or common bile duct, causing pain, inflammation or infection.

### `presentation_clinical` [CANONICAL_NOW]
Right upper abdominal/epigastric pain after meals, nausea/vomiting; fever or jaundice suggests complications.

### `key_features` [CANONICAL_NOW]
- many stones asymptomatic
- biliary colic vs cholecystitis distinction
- fever/jaundice change urgency
- ultrasound is first-line

### `red_flags` [CANONICAL_NOW]
Fever, jaundice, persistent RUQ pain, hypotension/confusion or pancreatitis symptoms need urgent evaluation for cholecystitis/cholangitis/obstruction.

### `diagnosis_methods` [CANONICAL_NOW]
Ultrasound and labs; MRCP/ERCP or other imaging when common duct disease suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- peptic disease
- hepatitis
- pancreatitis
- MI
- right lower-lung disease

### `western_treatment` [CANONICAL_NOW]
Asymptomatic stones may need no treatment; symptomatic disease often treated with cholecystectomy; ERCP for duct stones/cholangitis as appropriate.

### `acupuncture_role` [CANONICAL_NOW]
Stable biliary dyspepsia support only after diagnosis; do not delay surgical/emergency evaluation of acute cholecystitis or cholangitis.

## Proposed relations [DERIVED_RELATION]
- tdis.xie_tong/huang_dan contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Gallstones — https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Separate cholelithiasis, cholecystitis and choledocholithiasis?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 08. Intestinal Obstruction · 腸阻塞

## Identity
```yaml
candidate_id: cond.bowel_obstruction
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Intestinal obstruction is partial or complete blockage preventing normal passage of intestinal contents and gas.

### `clinical_definition` [CANONICAL_NOW]
Mechanical obstruction is distinct from ileus or intestinal pseudo-obstruction, though presentations overlap.

### `etiology` [CANONICAL_NOW]
Adhesions, hernias, tumors, volvulus, intussusception, strictures and other mechanical causes occur; ileus has functional causes.

### `pathophysiology` [CANONICAL_NOW]
Proximal accumulation of fluid/gas distends bowel, impairs absorption and can compromise blood flow, causing ischemia/perforation.

### `presentation_clinical` [CANONICAL_NOW]
Crampy abdominal pain, distension, vomiting and inability to pass stool/gas; severity/location varies.

### `key_features` [CANONICAL_NOW]
- mechanical vs functional distinction
- obstipation + vomiting/distension
- strangulation/ischemia dangerous
- imaging central

### `red_flags` [CANONICAL_NOW]
Peritonitis, continuous severe pain, fever, tachycardia, shock, GI bleeding or suspected strangulation/perforation requires emergency surgery assessment.

### `diagnosis_methods` [CANONICAL_NOW]
History/exam, labs and abdominal CT/X-ray; evaluate cause and ischemia.

### `differential_diagnosis` [CANONICAL_NOW]
- ileus/pseudo-obstruction
- gastroenteritis
- constipation
- appendicitis
- mesenteric ischemia

### `western_treatment` [CANONICAL_NOW]
Bowel rest, IV fluids/decompression and cause-specific surgery or endoscopic treatment; antibiotics if ischemia/perforation/infection concern.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat acute obstruction as simple constipation. Emergency/urgent biomedical care comes first.

## Proposed relations [DERIVED_RELATION]
- vomiting/abdominal_pain/constipation endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Intestinal Pseudo-obstruction (boundary) — https://www.niddk.nih.gov/health-information/digestive-diseases/intestinal-pseudo-obstruction
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Need mechanical obstruction source expansion during ingest.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 09. Cirrhosis · 肝硬化

## Identity
```yaml
candidate_id: cond.cirrhosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Cirrhosis is advanced chronic liver scarring that distorts liver architecture and impairs hepatic function and portal blood flow.

### `clinical_definition` [CANONICAL_NOW]
Cirrhosis is the final common pathway of many chronic liver diseases and is distinct from uncomplicated fatty liver or acute hepatitis.

### `etiology` [CANONICAL_NOW]
Alcohol-associated liver disease, chronic hepatitis B/C, metabolic dysfunction-associated steatotic liver disease, autoimmune/cholestatic and genetic diseases.

### `pathophysiology` [CANONICAL_NOW]
Repeated injury causes fibrosis and nodular regeneration, portal hypertension and loss of hepatic synthetic/detoxification function.

### `presentation_clinical` [CANONICAL_NOW]
May be silent until advanced; fatigue, jaundice, ascites/edema, bruising/bleeding, pruritus, confusion and variceal bleeding can occur.

### `key_features` [CANONICAL_NOW]
- irreversible advanced fibrosis often
- portal hypertension
- decompensation: ascites, variceal bleed, encephalopathy
- HCC surveillance

### `red_flags` [CANONICAL_NOW]
Hematemesis/melena, confusion/encephalopathy, fever with ascites, severe jaundice, shock or acute kidney injury requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Labs, imaging/elastography and cause evaluation; biopsy selected; assess complications and liver cancer risk.

### `differential_diagnosis` [CANONICAL_NOW]
- acute hepatitis
- heart-failure congestion
- noncirrhotic portal hypertension
- biliary obstruction

### `western_treatment` [CANONICAL_NOW]
Treat cause, avoid hepatotoxins/alcohol, manage portal-hypertension complications, surveillance and transplant evaluation for decompensated disease.

### `acupuncture_role` [CANONICAL_NOW]
Bleeding risk, thrombocytopenia, ascites, infection and encephalopathy affect safety. Avoid aggressive needling/cupping in decompensated disease.

## Proposed relations [DERIVED_RELATION]
- tdis.huang_dan/shui_zhong contextual
- bleeding/edema endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Cirrhosis — https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 10. Viral Hepatitis Parent · 病毒性肝炎

## Identity
```yaml
candidate_id: cond.viral_hepatitis
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Viral hepatitis is liver inflammation caused by hepatitis viruses, with major types A, B, C, D and E differing in transmission, chronicity and treatment.

### `clinical_definition` [CANONICAL_NOW]
This parent should not erase type-specific disease. Hepatitis B and C can become chronic; hepatitis A usually causes acute self-limited infection.

### `etiology` [CANONICAL_NOW]
Specific hepatitis viruses transmitted through fecal-oral, blood/body-fluid, perinatal or other routes depending type.

### `pathophysiology` [CANONICAL_NOW]
Viral infection and immune response injure hepatocytes; chronic HBV/HCV can lead to fibrosis, cirrhosis and hepatocellular carcinoma.

### `presentation_clinical` [CANONICAL_NOW]
May be asymptomatic or cause fatigue, nausea, abdominal discomfort, dark urine and jaundice; chronic disease may remain silent.

### `key_features` [CANONICAL_NOW]
- type-specific transmission
- acute vs chronic distinction
- HBV/HCV can cause cirrhosis/HCC
- serology/PCR type-specific

### `red_flags` [CANONICAL_NOW]
Acute liver failure with confusion, coagulopathy, severe jaundice or hypoglycemia requires emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Type-specific serologic and nucleic-acid tests plus liver enzymes/function assessment.

### `differential_diagnosis` [CANONICAL_NOW]
- drug-induced liver injury
- autoimmune hepatitis
- biliary obstruction
- alcohol-related hepatitis

### `western_treatment` [CANONICAL_NOW]
Type-specific: supportive care for many acute infections; antivirals for chronic HBV/HCV and selected other contexts; vaccination prevents A/B.

### `acupuncture_role` [CANONICAL_NOW]
Use standard precautions; acupuncture does not treat viral clearance. Consider bleeding/liver-function status and infection-control requirements.

## Proposed relations [DERIVED_RELATION]
- tdis.huang_dan contextual
- cirrhosis/HCC complication

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Viral Hepatitis — https://www.niddk.nih.gov/health-information/liver-disease/viral-hepatitis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Use parent plus HBV/HCV child cards or individual cards only?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

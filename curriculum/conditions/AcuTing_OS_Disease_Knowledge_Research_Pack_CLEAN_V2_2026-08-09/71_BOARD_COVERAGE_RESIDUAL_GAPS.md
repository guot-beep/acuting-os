# Board Coverage Residual Gaps — Clean V2

**Date:** 2026-08-09  
**Purpose:** actionable queue of what is still thin **after** expanding Western full research to 93 entries.  
**This file is not a duplicate of `04`;** `04` summarizes current coverage, while `71` lists the remaining work.

## P0 / P1 remaining disease-family work

### Cardiovascular

```text
arrhythmia parent and key subtypes:
  atrial fibrillation
  SVT
  ventricular arrhythmia
  bradyarrhythmia / heart block

atherosclerosis / coronary artery disease parent
peripheral arterial disease
orthostatic hypotension
cardiomyopathy family
infective endocarditis
pericarditis
aortic dissection if not modeled under aneurysm
```

### Endocrine / metabolic

```text
metabolic syndrome
obesity Western biomedical card if absent
hyperparathyroidism / hypoparathyroidism
pituitary disorders
diabetes complications:
  hypoglycemia
  DKA
  HHS
```

### Hematology

```text
bleeding/coagulation-disorder parent
hemophilia / von Willebrand disease
leukemia / marrow-failure differential if Board scope requires
```

### GI / liver

```text
diverticular disease
celiac disease
SIBO
hiatal hernia
peritonitis
hemorrhoids Western card
colorectal polyps
chronic pancreatitis
nonalcoholic/metabolic steatotic liver disease
```

### Neurology

```text
Alzheimer disease / dementia
migraine subtypes beyond existing endpoint
cluster headache
tension-type headache
concussion / TBI
sciatica / radiculopathy expansion
restless legs syndrome
postherpetic neuralgia
vestibular neuritis / BPPV exact coverage
```

### Pulmonary

```text
interstitial lung disease
pleural effusion
anaphylaxis / acute airway emergency
```

### Dermatology

```text
atopic dermatitis / eczema Western card
urticaria
cellulitis
tinea / fungal skin disease
burns
skin cancer / suspicious lesion pathway
```

### ENT / ophthalmology

```text
BPPV
vestibular neuritis
hearing-loss subtypes
otitis externa
strep pharyngitis / peritonsillar abscess
cataract
macular degeneration
diabetic retinopathy
conjunctivitis / keratitis / uveitis
```

### Mental / neurodevelopmental

```text
bipolar disorder
schizophrenia / psychotic disorders
autism spectrum disorder
panic disorder
specific substance-use disorders
suicidal ideation as safety state rather than ordinary Condition card
```

### Reproductive / pregnancy

```text
adenomyosis
PID
ovarian torsion
ovarian cyst/mass
menopause Western parent
infertility Western parent + male/female cause model
mastitis
pregnancy loss / miscarriage
gestational diabetes
preterm labor / placenta-related emergencies
```

### Infectious

```text
foodborne disease
parasitic disease
gonorrhea / chlamydia
hepatitis type-specific cards
pneumococcal / meningococcal emergencies as clinically useful
```

### Genetics

```text
additional connective-tissue syndromes
inherited cancer syndromes if clinic/Board value justifies
other Board-listed genetic conditions
```

### Oncology

```text
gynecologic cancers
hematologic malignancies
skin cancer
treatment-toxicities as reusable supportive-care objects
```

## P0 non-disease competency gaps

Board readiness also requires:

```text
physical-exam findings
lab/test interpretation
medication adverse effects/interactions
emergency management
infection control
professional responsibilities
communication/referral
```

Disease cards alone cannot complete Biomedicine Board coverage.

## Prioritization rule

Rank future research by:

```yaml
1_board_explicit_or_parent: high
2_emergency_referral_value: high
3_common_clinic_relevance: high
4_crosswalk_reuse: high
5_pharmacology_link_value: medium_high
6_identity_stability: required
```

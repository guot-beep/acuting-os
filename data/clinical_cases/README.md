# Clinical Case Layer

This folder is for de-identified clinical case tracking. It connects real case notes to the AcuTing OS knowledge graph without mixing individual patient data into general medical knowledge.

## Core Rule

Knowledge base records describe general concepts:

- Western condition
- Eastern disease
- TCM pattern
- Acupoint
- Formula
- Herb
- Western medication
- Safety caution

Clinical case records describe one real patient timeline:

- Baseline presentation
- Diagnoses and patterns assigned in this case
- Each visit
- Acupuncture used at each visit
- Formulas/herbs used at each visit
- Western medications used during the same period
- Outcomes and changes over time

## SOAP Structure

Each visit should be charted first as a TCM-oriented SOAP note:

- `S - Subjective`: chief complaint, change since last visit, pain, sleep, energy, mood, digestion, bowel, urination, menstrual/fertility update, medication changes, red flags.
- `O - Objective`: observation, tongue, pulse, palpation, channel findings, ROM/orthopedic tests, patient-reported labs or imaging.
- `A - Assessment`: Western condition links, Eastern disease links, TCM pattern links, TCM diagnosis text, treatment principle, progress assessment, safety assessment.
- `P - Plan`: acupuncture principle, points, technique, retention time, moxa/e-stim, formula/herbs, Western medication context, homecare, follow-up, referral or supervisor question.

Structured tables such as `visit_acupuncture`, `visit_formulas`, `visit_western_medications`, and `visit_outcomes` should support the SOAP note, not replace it.

## Privacy Rule

Use `patient_code` instead of full legal name. Avoid storing full date of birth, address, phone, email, insurance ID, or other identifying details unless the system is later upgraded with proper privacy and security controls.

## Recommended Workflow

1. Create a `patient_code`.
2. Create a case, such as `infertility_pcos_2026`.
3. Add baseline intake.
4. Link the case to Western conditions, Eastern diseases, and TCM patterns.
5. Add one visit record per treatment.
6. Add a SOAP note for each visit.
7. Add acupuncture, formulas/herbs, Western medications, and outcomes under that visit.
8. Track changes over time instead of overwriting old notes.

## Most Useful Future Searches

- Cases linked to PCOS and infertility.
- Cases with Phlegm-Damp Obstruction that used SP6, ST36, CV4, or specific formulas.
- Patients using Letrozole, Clomiphene, Metformin, progesterone, anticoagulants, or thyroid medication.
- Outcomes after 3, 6, or 12 visits.
- Cycle phase-specific treatment response.
- Safety flags such as pregnancy, anticoagulants, severe pain, fever, abnormal bleeding, or IVF clinic restrictions.

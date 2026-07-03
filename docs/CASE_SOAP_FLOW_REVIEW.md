# Case / SOAP Flow Review

Date: 2026-07-03  
Status: review and design notes only; no app changes in this step.

## Short Answer

Yes: the current logic should stay as:

1. Create a de-identified case first.
2. Add SOAP notes under that case.
3. Use SOAP notes for each visit/treatment.
4. Use treatment tracking and billing-ready documentation as later views over the same visit data.

This is the right direction. A SOAP note needs a parent case because SOAP is a visit-level record. The case is the stable patient timeline and baseline intake.

## Current Structure

### Case Layer

Stored in localStorage as `clinicalCases[]`.

Current app fields:

- `patientCode`
- `caseTitle`
- `caseCategory`
- `status`
- `startDate`
- `birthYear`
- `sex`
- `occupation`
- `chiefComplaint`
- `historyPresent`
- `pastHistory`
- `allergies`
- `currentMeds`
- `westernConditions[]`
- `easternDiseases[]`
- `tcmPatterns[]`
- `safetyFlags[]`
- `summary`
- `soapNotes[]`

Purpose:

- Identify the case without direct patient identity.
- Store baseline presentation.
- Store case-wide conditions/patterns/safety flags.
- Hold the SOAP timeline.

### SOAP Layer

Stored in localStorage as `clinicalCases[].soapNotes[]`.

Current app fields:

- Visit context: `visitDate`, `visitNumber`, `cycleDay`, `fertilityPhase`, `workflowLink`, `cyclePhase`
- Links: `westernConditionLinks`, `easternDiseaseLinks`, `tcmPatternLinks`, `safetyFlagLinks`
- SOAP text: `subjective`, `objective`, `assessment`, `plan`
- TCM diagnosis: `tongueBody`, `tongueCoating`, `pulse`, `tcmPattern`, `pathomechanism`, `treatmentPrinciple`
- Treatment: `pointsUsed`, `acupointLinks`, `retentionMinutes`, `technique`, `formulaHerbs`, `formulaLinks`
- Context/outcomes: `westernMeds`, `medicationLinks`, `outcomes`, `outcomeMetricLinks`, `advice`, `followUp`

Purpose:

- Record one visit.
- Track changes since last visit.
- Record actual treatment and response.
- Preserve searchable links to points, formulas, meds, outcomes, patterns, and safety flags.

## What Belongs Where

### Case Should Store Stable Baseline

Use case fields for information that describes the whole case and does not change every visit.

Good case-level fields:

- Patient code
- Main case title
- Care category
- Case status
- Start date
- Birth year / sex / occupation
- Chief complaint at intake
- History of present illness
- Past medical history
- Allergies
- Current medication list at intake
- Baseline Western conditions
- Baseline Eastern disease names
- Working TCM patterns
- Major safety flags
- Short case summary

### SOAP Should Store Visit-Level Changes

Use SOAP fields for anything that can change every visit.

Good SOAP-level fields:

- Today's symptoms
- Change since last visit
- Pain / sleep / energy / mood today
- Digestion / bowel / urination today
- Menstrual / fertility update for this cycle or visit
- Medication changes since last visit
- Tongue / pulse today
- Today's pattern and pathomechanism
- Today's treatment principle
- Points used today
- Needling / moxa / e-stim / retention
- Formula or herb actually used today
- Patient response
- Outcome change
- Advice and next plan

## Field Clarifications

### Patient code

This is the de-identified patient handle. It should not be a real name.

Example:

- `P-2026-001`
- `FERT-2026-003`
- `PAIN-2026-002`

### Case title

This should be a short human-readable case label, not a full summary.

Good examples:

- `PCOS fertility support`
- `Rectal bleeding and digestive upset`
- `Chronic neck pain with stress`
- `Insomnia with palpitations`

Avoid putting the full history here.

### Category

Category should be a simple routing tag, not the diagnosis.

Recommended controlled values:

- `fertility`
- `pain`
- `digestive`
- `sleep`
- `stress_mood`
- `respiratory`
- `gynecology`
- `dermatology`
- `internal_medicine`
- `general`

If the UI stays free-text for now, use these as conventions.

### Summary

Summary should be the case-wide snapshot. It is not SOAP.

Recommended summary content:

- One-line baseline summary.
- Main treatment goal.
- Key safety caveat.
- Current state if the case is active.

Example:

```text
Baseline: rectal bleeding this week with nausea and fatigue; prior major bleeding history in 2019 per patient report. Goal: track safety/red flags, digestive symptoms, and referral questions while using conservative supportive care documentation.
```

Summary should not hold every visit update. Visit updates belong in SOAP.

## Recommended Intake Flow

The current form fields are useful, but the form would feel better if grouped like this:

### 1. Identity

- Patient code
- Case title
- Category
- Status
- Start date

### 2. Background

- Birth year
- Sex
- Occupation
- Allergies
- Current meds

### 3. Presenting Problem

- Chief complaint
- History of present illness
- Past medical history

### 4. Diagnosis / Pattern Links

- Western conditions
- Eastern diseases
- Working TCM patterns
- Safety flags

### 5. Case Summary / Goal

- Summary
- Primary goal, if added later

This would make the form feel like intake, not a random table.

## Recommended SOAP Flow

The current SOAP fields are mostly right. The future UI could group them like this:

### 1. Visit Context

- Visit date
- Visit number
- Cycle day
- Cycle phase
- Fertility phase
- Workflow link

### 2. S - Subjective

- Symptoms and changes
- Pain / sleep / energy / mood
- Digestion / bowel / urination
- Menstrual / fertility update
- Medication/supplement update
- Red flags

### 3. O - Objective

- Observation
- Tongue
- Pulse
- Palpation / ROM
- Patient-reported labs or imaging

### 4. A - Assessment

- Western condition links
- Eastern disease links
- Pattern links
- Current TCM pattern
- Pathomechanism
- Safety assessment

### 5. P - Plan

- Treatment principle
- Acupuncture points
- Technique / retention / moxa / e-stim
- Formula / herbs
- Western medication context
- Advice
- Follow-up

## Is This the Current TCM SOAP?

Mostly yes.

The current app SOAP is already TCM-oriented because it includes:

- S/O/A/P text
- Tongue body
- Tongue coating
- Pulse
- Pattern
- Pathomechanism
- Treatment principle
- Points
- Formula/herbs
- Cycle/fertility workflow fields
- Links to patterns, conditions, formulas, points, medications, and outcomes

The main issue is not the data model. The main issue is UX:

- The form is long.
- It is not visually grouped enough.
- Some fields look like technical IDs before the user has a workflow.
- Case intake and SOAP visit fields need clearer mental separation.

## Suggested Future Changes

Low-risk UI changes after Ting approval:

1. Group the case dialog into titled sections.
2. Rename `Category` helper text to "routing tag, not diagnosis".
3. Add placeholder examples for Summary.
4. Move link/id fields in SOAP behind an "Advanced links" section.
5. Add a small note above SOAP: "SOAP is per visit; case summary is baseline."
6. Add a primary goal field to case intake.
7. Add a red flag / referral question field to case intake.

Medium-risk changes after real export/backup:

1. Add structured nested `baseline` object matching `data/clinical_cases/case_template.json`.
2. Add structured nested SOAP objects matching `data/clinical_cases/soap_note_template.json`.
3. Add migrations for existing localStorage cases.

## Immediate Recommendation

Do not enter many real cases yet.

Before real data entry, do one UI cleanup pass:

- Keep the current storage fields.
- Reorder and visually group the case form.
- Reorder and visually group the SOAP form.
- Add helper text that explains what belongs in Case vs SOAP.
- Preserve backward compatibility with the current localStorage shape.

That gives Ting a smoother workflow without risky data migration.

# Pathology Layer Design

AcuTing OS separates Western diagnoses, East Asian medicine disease names, TCM patterns, medications, acupuncture strategies, and herbal strategies into distinct entities. Overlap is handled by relation tables instead of merging concepts into one record.

## Design Rule

- Western condition = biomedical diagnosis or clinical problem, such as PCOS, endometriosis, unexplained infertility, hypothyroidism.
- Eastern disease = traditional disease category, such as infertility, delayed menstruation, dysmenorrhea, amenorrhea.
- TCM pattern = treatment logic, such as Kidney deficiency, Liver qi stagnation, Phlegm-damp obstruction, Blood stasis.
- Medication = Western drug or drug class, stored separately in English-first format.
- Treatment strategy = acupuncture, herbs, lifestyle, referral, or co-management note linked through relation tables.

## Why Not One Table?

One Western disease can map to many TCM diseases and patterns. One TCM pattern can appear across many Western diseases. For example, PCOS may connect to infertility, irregular menstruation, Kidney deficiency, Phlegm-damp, Liver qi stagnation, and Blood stasis. A single table would either duplicate data or flatten clinical reasoning too much.

## Recommended Query Flow

1. Search Western condition.
2. Show related Eastern disease categories.
3. Show likely TCM patterns with confidence/source notes.
4. Show related Western medication classes.
5. Show acupuncture/herbal support notes, contraindications, and interaction cautions.
6. Show fertility-specific workflow if the condition belongs to reproductive medicine.

This is educational scaffolding. Drug interactions, pregnancy safety, infertility protocols, and herb-drug risks must be validated against current professional references before clinical use.

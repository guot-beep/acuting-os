# Formula Content Staging

This directory is the review-only input layer for C2 classical formula
content. Canonical `data/herbs/formulas.json` is never edited directly from a
staging file.

## Staging Shape

```json
{
  "dataset": "formula_content_fill_staging",
  "batch": "c2_1_probe",
  "review_status": "draft",
  "records": [
    {
      "id": "formula.example",
      "review_status": "draft",
      "fields": {
        "actions_en": {
          "value": ["Source-backed draft wording"],
          "sources": [
            {
              "title": "Source title",
              "url": "https://example.org/source",
              "locator": "chapter or section"
            }
          ]
        }
      }
    }
  ]
}
```

Run:

```powershell
node scripts/preview-formula-content-fill.js data/imports/formula_content/<batch>.json --write-report
```

The preview rejects unknown formulas, populated canonical targets, unsupported
fields, missing sources, non-draft status, damaged text, dose fields, modern
use fields, and condition links. It has no apply mode. Preview reports are
written to `docs/formula_content_previews/` for Ting/Claude review.

## C2 Boundary

Allowed fields are composition, English actions, pattern indications,
modifications, contraindications, safety flags, and their English exam-track
counterparts. Dose data belongs to `data/imports/formula_doses/`. Existing
question-mark damage belongs to the frozen source-aware repair lane. Modern
condition links and review promotion are outside C2.

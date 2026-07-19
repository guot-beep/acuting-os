# Formula Chinese Depth Staging

This directory is the review-only B-layer for Chinese formula explanations.
It complements the A-layer classical/exam staging under
`data/imports/formula_content/`.

Rules:

- Keep every record `draft`.
- Match the exact formula by name, classical identity, and composition before
  extracting any summary.
- Summarize; do not copy long source passages.
- Record source inconsistencies in `source_match.caveats`.
- Do not stage modern disease links, treatment claims, doses, or
  `source_checked` promotion.
- American Dragon content requires a human browser review while its automated
  access challenge remains active.
- Canonical `data/herbs/formulas.json` is not modified by this lane.

Preview command:

```powershell
node scripts/preview-formula-chinese-depth.js data/imports/formula_chinese_depth/<batch>.json --write-report
```

The preview tool has no apply mode.

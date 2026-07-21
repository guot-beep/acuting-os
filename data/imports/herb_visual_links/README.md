# Herb Visual Link Staging

Review-only staging for exact external image-reference pages used by the
Materia Medica cards.

Rules:

- Canonical herb IDs are immutable and must already exist in
  `data/herbs/herb_canon_shortlist.json`.
- Each staged page must match the herb's Chinese name and pinyin. Botanical,
  pharmaceutical, or English identity is recorded as an additional check.
- CloudTCM numeric IDs are never inferred. Only directly verified herb pages
  may be staged.
- HKBU records may come from the Chinese Medicinal Material Images Database
  (`mmid`) or Medicinal Plant Images Database (`mpid`); the database type must
  be labelled accurately.
- Staging remains `draft` and has no apply path. Ting/Claude must review a
  generated preview before exact links are considered for canonical data.
- External images are identification/study references, not treatment claims.

Preview command:

```powershell
node scripts/preview-herb-visual-links.js data/imports/herb_visual_links/hvl_1_exterior_warm_five_probe.json --write-report
```

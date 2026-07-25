# curriculum/herbs — Ting's Tier-1 herb sources

Three Chenoweth course files (2026-07-25). These integrate the key points from
Ting's herb documents — treat them as the **primary extraction source** for
herb cards, per docs/CONTENT_PIPELINE.md. Private repo only.

| File | What it holds | Cite as |
|---|---|---|
| `pinyin_latin_herb_list.xlsx` / `.csv` | 356 herbs: Pinyin · Pharmaceutical Latin · plant part · common English name | `curriculum/herbs/pinyin_latin_herb_list.csv#<row>` |
| `herb_functions_chenoweth.pdf` / `.md` | Alphabetical herb → function-category list (the 30+ 功效 categories) | `curriculum/herbs/herb_functions_chenoweth.pdf#p<N>` |
| `materia_medica_abbreviated_chenoweth.pdf` / `.md` | Per-herb study core: toned pinyin, 中文, taste/temp, channels, indications **with pairings (s = 配伍)**, dosage, cautions, WM pharmacology | `curriculum/herbs/materia_medica_abbreviated_chenoweth.pdf#p<N>` |

`.md` / `.csv` are the text extractions — every AI reads those; PDFs stay as
the authoritative originals for layout/verification.

## How these map onto the herb card (HERB_FORMULA_CARD_SPEC)

- Glance layer: toned pinyin + 中文 + common name (xlsx + materia) ✓
- properties.taste/temperature/channels ← materia `[LU, UB]` blocks
- actions_indications (nested) ← materia bullets; pairings (s …) feed
  major_combinations
- dosage ← materia "Dosage: X–Y grams" (never invent when absent)
- contraindications / cautions ← materia "Contraindicated/Caution" lines
- modern_pharmacology ← materia "WM:" lines
- category ← functions list + materia [N] section headers
- Cross-check/deepen with Tier-2 (CloudTCM, American Dragon, atlas) and record
  both sides when they disagree.

Priority order: **board exam outline first** (Ting 2026-07-25) — exam-scope
herbs before completeness.

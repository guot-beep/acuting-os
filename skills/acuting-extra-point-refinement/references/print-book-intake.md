# Print-book intake

Inspect the actual page image, PDF, or text before changing a card. Record author/editor, full title, edition, publisher/year when visible, page numbers, point heading/code exactly as printed, language, and whether content is transcribed, translated, or paraphrased. Mark missing bibliography instead of guessing; do not claim the whole book was reviewed when only selected pages were supplied.

## Citation convention

Add a compact citation to `field_sources.print_books`:

```json
"print_books": [
  "Author. Title. 2nd ed. Publisher; 2024. pp. 123-124. Page images supplied by Ting and inspected 2026-08-09."
]
```

Repeat page-specific citations in affected field arrays, for example:

```json
"technique": [
  "Author, Title, 2nd ed., p. 124: perpendicular 0.5-0.8 cun"
]
```

Do not commit copyrighted scans or long excerpts unless Ting explicitly requests it and has permission. Store structured paraphrases and concise quotations.

## Conflicts and safety

- Keep book codes, locations, techniques, moxa, actions, indications, combinations, and cautions source-specific.
- Present conflicts with eLotus, AD, curriculum, or legacy content side by side; never choose silently.
- A newer edition does not automatically override Board scope or another professional source.
- A pregnancy-related indication does not establish pregnancy safety.
- A printed technique number without anatomy or stopping rules remains incomplete.
- Cite the exact book page in `anatomy`, `technique`, and `cautions` when it supplies a safety boundary.

If pages are missing or unreadable, ask Ting only for the title/copyright page, the point entry, and any referenced safety/technique page. Continue other points while waiting when safe.

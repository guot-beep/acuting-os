# curriculum/ — Ting's primary source materials (private, canonical)

This folder is the **Tier-1 authoritative source** for content generation. Every
AI (Antigravity / Codex / Claude) extracts from here **first**, then supplements
with authoritative public sites (Tier 2/3, see `docs/CONTENT_PIPELINE.md`).

Why it lives in the repo: so all agents work from the *same* material and the
same understanding — not each from a different web page. Private repo only;
these are copyrighted course materials for Ting's personal study and MUST NOT be
published to AcuTing.com or any public build.

## Where to drop what
- `herbs/`     — 中藥 course notes, materia medica tables, teacher handouts
- `formulas/`  — 方劑 notes, composition/modification tables
- `acupoints/` — 針灸 notes (channel/head/ear/balance/sports/cosmetic)
- `western/`   — 西醫 pathology / pharmacology / red-flag references (next sem)

## Accepted formats (prefer text-extractable)
- **Best:** `.md` / `.txt` (paste notes directly — instantly usable by every AI)
- OK: `.pdf` (AIs extract text; keep filenames descriptive, e.g. `ma-huang-lecture.pdf`)
- Images (`.png/.jpg` of a slide/table): last resort — add a short `.md` beside it
  transcribing the key facts, because not every agent can read the image.

## How AIs must cite it
When a value comes from here, record its provenance as
`curriculum/<path>#<page-or-section>` in the record's `field_sources`, exactly
like a URL. Ting's teacher material outranks web sources when they disagree, but
disagreements are still recorded (never silently dropped).

# Design QA - Formula and Herb Study Cards

Status: PASS
Date: 2026-07-17
Surface: `#ws/lookup` formula and single-herb records

## Design fit

- Reuses the existing AcuTing OS warm-white, ink-green, and gold visual language.
- Keeps the Lookup workspace dense and study-oriented; no landing-page or marketing treatment was introduced.
- Uses bilingual hierarchy consistently: Chinese name, pinyin, English name, category, stable ID, and review status.
- Keeps unreviewed content visibly marked `draft` and states that the card is private study reference, not medical advice.

## Interaction QA

- Formula and herb list cards open their corresponding detail card.
- Formula tabs switch between exam core, composition, clinical context, and safety/sources.
- Herb tabs switch between exam core, clinical context, pairing/differentiation, and safety/sources.
- Formula composition herb links open the matching `herb.*` card when a stable ID match exists.
- Herb related-formula links open the matching `formula.*` card.
- Existing `????` and U+FFFD damaged fields are suppressed instead of rendered as study content.

## Responsive QA

- Desktop dialog: 980 px maximum width, no horizontal overflow.
- Mobile test: 390 x 844 px, dialog width 374.4 px, no dialog horizontal overflow.
- Mobile tabs intentionally scroll horizontally; body content and relation chips remain inside the dialog.
- No browser console warnings or errors were present during interaction testing.

## Accessibility QA

- Detail card uses a native modal `dialog` with an accessible label.
- Study sections use headings; tab controls use `tablist`, `tab`, `tabpanel`, `aria-controls`, and `aria-labelledby` semantics.
- Buttons and links retain visible keyboard focus styles.

## Findings

- P0: none
- P1: none
- P2: none
- Residual content risk: most records remain draft skeletons; the card correctly shows pending states until source-backed content is added.

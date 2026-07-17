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
- Formula cards present exam core, composition, clinical context, and safety/sources as one continuous study page.
- Herb cards present exam core, clinical context, pairing/differentiation, and safety/sources as one continuous study page.
- Desktop cards use the same hero, fact-grid, long-form article, and sticky related-navigation rhythm as acupoint detail pages.
- Quick-navigation buttons scroll to each study section without hiding the other sections.
- Formula composition herb links open the matching `herb.*` card when a stable ID match exists.
- Herb related-formula links open the matching `formula.*` card.
- Existing `????` and U+FFFD damaged fields are suppressed instead of rendered as study content.

## Responsive QA

- Desktop dialog: 1120 px maximum width, no horizontal overflow at 1280 x 720.
- Mobile rules collapse the four hero facts to two columns and move the status sidebar above the article; the redundant quick-navigation box is hidden.
- Body content and relation chips remain constrained by min-width and overflow-wrap rules.
- Formula-to-herb navigation was re-tested after the long-card conversion.

## Accessibility QA

- Detail card uses a native modal `dialog` with an accessible label.
- Study sections use hierarchical headings and semantic `main`, `section`, and `aside` landmarks.
- Quick-navigation controls are real buttons; buttons and links retain visible keyboard focus styles.

## Findings

- P0: none
- P1: none
- P2: none
- Residual content risk: most records remain draft skeletons; the card correctly shows pending states until source-backed content is added.

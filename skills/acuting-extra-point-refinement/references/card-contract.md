# Extra-point card contract

## Required paired content

Retain the schema and provide substantive bilingual content for:

- `location` / `locationEn`
- `anatomyZh` / `anatomyEn`
- `techniqueNotes`, `acumethodZh` / `acumethodEn`
- `moxaZh` / `moxaEn`
- `functionsZhList` / `functionsEnList` (aligned; maximum eight)
- `pointIdentityZh` / `pointIdentityEn`
- `patterns` / `patternsEn`
- `action_tags_zh` / `action_tags_en`
- `disease_tags_zh` / `disease_tags_en`
- `cautions` / `cautionsEn`
- `combinePointsZh` / `combinePointsEn`
- `exam_importance` / `exam_importance_en`
- `exam_pearl` / `exam_pearl_en`
- `clinical_pearls` / `clinical_pearls_en`
- `nameIntroZh` / `nameIntroEn`
- `sources`, `visualLinks`, `evidence`, `reviewStatus`, `field_sources`

Use `exam_star: 0` unless a course source explicitly supplies a star; Board inclusion alone does not create one.

## Required provenance

`field_sources` needs non-empty arrays for `board_scope`, `curriculum`, `elotus`, `american_dragon`, `location`, `anatomy`, `technique`, `moxibustion`, `functions`, `indications`, `combinations`, `cautions`, `nomenclature`, and `link_check`.

When Ting supplies a book, also add `print_books` with full citations. Repeat the book/page citation in each affected field array for field-specific provenance.

## Source-gap language

Use explicit statements such as:

- `source-gap note: no dedicated <point> entry found under curriculum/acupoints`
- `<URL>: <pinyin> absent from index`
- `unverified legacy value: ...; not confirmed by an exact four-source page`
- `source silence must not be interpreted as absence of risk`

Do not write “verified” when the exact page was not opened. Do not use a generic URL to satisfy a presence check.

## Safety reconciliation

For each technique, capture source, direction, depth/quantity/time, indication-specific variant, and stated caution. Then record relevant missing anatomy, stopping rules, bloodletting antisepsis/hemostasis, moxa method/skin safety, and special-population protocols. Avoid generic boilerplate.

## Evidence paragraph

Summarize the four required layers in order, followed by optional print sources and CloudTCM. State what each contributed, what conflicted, and what remained legacy or absent. WHO is not point-specific proof unless directly supported.

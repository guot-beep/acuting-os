# Western Medication Layer

Western medications stay in their own layer. They should not be stored inside TCM pattern records or herbal formula records.

## Why Separate?

- One medication can be used for multiple biomedical conditions.
- One biomedical condition can use many medication classes.
- Herb-drug interactions belong between medication and herb/formula layers.
- Fertility protocols often depend on cycle phase, monitoring, and clinic instructions.

## Minimum Fields

- `id`
- `generic_name_en`
- `brand_names_en`
- `drug_class_en`
- `common_uses_en`
- `fertility_use_en`
- `major_contraindications_en`
- `common_adverse_effects_en`
- `herb_interaction_watch_en`
- `acupuncture_caution_en`
- `pregnancy_lactation_note_en`
- `source_notes`
- `updated_at`

## Fertility Priority List

Start with medication classes commonly encountered in reproductive medicine workflows:

- Letrozole
- Clomiphene citrate
- Gonadotropins
- hCG trigger medications
- GnRH agonists
- GnRH antagonists
- Progesterone support
- Estrogen support
- Metformin
- Levothyroxine
- Cabergoline or bromocriptine
- Low-dose aspirin
- Anticoagulants such as heparin or enoxaparin

Each medication entry needs current professional-source validation before clinical use.

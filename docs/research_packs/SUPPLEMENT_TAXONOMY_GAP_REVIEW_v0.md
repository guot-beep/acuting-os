# AcuTing OS — Supplement Taxonomy Gap Review v0

**Status:** `DESIGN INPUT / NOT CANONICAL`

## Why this exists

The current supplement category vocabulary is a useful V0 seed, but a 2,000-card inventory will encounter ingredients that do not fit naturally into the existing eight categories. This note is intentionally upstream of canonical ingestion so the bulk pipeline does not fossilize forced classifications.

## Existing category vocabulary

- `vitamins`
- `minerals`
- `botanical_extracts`
- `fatty_acids`
- `amino_acids_performance`
- `probiotics`
- `antioxidants_coenzymes`
- `multi_ingredient`

## Gaps already exposed by Batch 01

### 1. Bioactive / hormone-like compounds

Examples:
- `supp.melatonin`

Problem:
- Not a vitamin, mineral, botanical, fatty acid, probiotic, amino-acid/performance ingredient, coenzyme, or multi-ingredient formula.

Candidate solution:
- add a broad category such as `other_bioactives` rather than a one-off `sleep_supplements` category.

Reason:
- category should describe ingredient class, not claimed use.

### 2. Joint / connective-tissue compounds

Examples:
- `supp.glucosamine`
- `supp.chondroitin`

Problem:
- Forced placement in `amino_acids_performance` or `multi_ingredient` would be semantically misleading.

Candidate solution:
- either `structural_compounds` / `connective_tissue_compounds`
- or place them under a sufficiently broad `other_bioactives` class if the OS prefers a smaller top-level taxonomy.

### 3. Enzymes

Federal dietary-supplement definitions include enzymes as dietary ingredients.

Likely future examples:
- lactase
- digestive-enzyme products
- bromelain / papain may need a rule because they can also be botanical-derived enzymes.

Candidate solution:
- `enzymes`

### 4. Fiber / prebiotic substrates

Likely future examples:
- psyllium
- inulin
- resistant starch / prebiotic blends

These are not probiotics and should not be forced into the probiotic category.

Candidate solution:
- `fiber_prebiotics`

### 5. Performance compounds broader than amino acids

The current `amino_acids_performance` label conflates chemical identity with use-case.

Example already in Batch 01:
- creatine is commonly grouped with sports/performance supplements but is not simply an amino-acid card.

Candidate decision:
- either rename to `sports_performance`
- or split `amino_acids` and `sports_performance`.

Do not rename an existing canonical category after large-scale ingestion without a migration map.

## Recommended top-level design principle

Prefer **ingredient-class taxonomy** over marketing/indication taxonomy.

Good:
- vitamin
- mineral
- botanical
- fatty acid
- probiotic
- enzyme
- fiber/prebiotic
- other bioactive

Avoid as primary category:
- sleep
- immunity
- weight loss
- anti-aging
- women's health
- energy

Those belong in future tags / use-context / evidence fields, not canonical identity classification.

## Candidate V1 category set for Fable review

This is a proposal only:

1. `vitamins`
2. `minerals`
3. `botanical_extracts`
4. `fatty_acids`
5. `amino_acids`
6. `sports_performance`
7. `probiotics`
8. `fiber_prebiotics`
9. `enzymes`
10. `antioxidants_coenzymes`
11. `other_bioactives`
12. `multi_ingredient`

Alternative conservative option:
keep the existing eight and add only:
- `enzymes`
- `fiber_prebiotics`
- `other_bioactives`

This smaller change is probably safer before the first bulk ingestion.

## Architecture constraints

- Category is Knowledge Card metadata, not a clinical diagnosis.
- Category never auto-creates `cond.*`, `tdis.*`, or `pattern.*`.
- Commercial products / blends should remain distinct from single-ingredient identity.
- `supp.*` remains the canonical namespace.
- Clinical Patient/Case/Visit exposure history references `supp.*`; it does not own supplement identity.
- No PHI belongs in this taxonomy.
- Any category rename after ingestion requires an explicit compatibility/migration map.

## Source-policy note

U.S. federal dietary-supplement definitions encompass more than vitamins/minerals/botanicals, including amino acids, enzymes and other dietary substances. This note uses that breadth only to identify taxonomy coverage gaps; it does not imply efficacy or safety.

## Recommendation

Before Antigravity begins bulk generation:

1. Fable locks the top-level taxonomy.
2. Lock the supplement card identity/template.
3. Add category validator.
4. Then generate the 2,000-card skeleton inventory.
5. Enrich high-demand / board / safety-critical cards later.


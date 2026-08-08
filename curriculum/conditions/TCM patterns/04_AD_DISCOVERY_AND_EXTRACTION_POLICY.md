# 04 — American Dragon Discovery and Extraction Policy

## 1. There is no clean AD Pattern Index

American Dragon publishes a large Conditions Index. At capture time, the index is explicitly marked “Incomplete” and contains roughly 426 distinct linked condition-page targets.

Each condition page can contain:

- GENERAL
- one or many TCM Pattern headings
- Clinical Manifestations
- Treatment Principle
- Herb Formulas
- Points
- Tongue / coating / pulse embedded in manifestation text

The same TCM Pattern may appear under many conditions.

Therefore an exact “number of unique AD Patterns” cannot be read from the site without crawling and deduplicating all Pattern headings.

Do not invent a number.

---

# 2. Completion strategy

For CURRENT AcuTing canonical Patterns:

```text
for each current pattern.*
    search exact canonical English name
    search known aliases
    search AD Conditions pages
    search existing AD formula-syndrome dataset
    collect all relevant source contexts
    deduplicate stable core features
    preserve contextual variants
    enrich existing card
```

For AD concepts not in current canonical registry:

```text
stage as candidate
do not create canonical ID
```

---

# 3. Stable core vs context

When a Pattern appears on several AD pages:

### Core

Features repeatedly consistent across sources/pages:

```text
key manifestations
typical tongue
typical coating
typical pulse
treatment principle
```

### Contextual

Features tied to a specific AD page:

```text
disease-specific manifestation
formula modification
special point set
unusual severe feature
biomedical context
```

Keep contextual material source-scoped.

---

# 4. Source record

For every AD page used, retain:

```yaml
source:
  publisher: American Dragon
  page_title:
  url:
  source_scope: condition_pattern_block | formula_syndrome_block
```

---

# 5. Suggested search patterns

Examples:

```text
site:americandragon.com/conditions "HEART YANG DEFICIENCY"
site:americandragon.com/conditions "LIVER QI STAGNATION"
site:americandragon.com/conditions "TAI YANG SHANG HAN"
site:americandragon.com/conditions "YING STAGE HEAT"
site:americandragon.com/conditions "LOWER JIAO"
```

Search both canonical and common AD aliases.

---

# 6. Key AD URLs captured in this research pass

General index:

- https://www.americandragon.com/ConditionsIndex2.html

High-density Pattern pages:

- https://www.americandragon.com/conditions/Weakness.html
- https://www.americandragon.com/conditions/Anorxia.html
- https://www.americandragon.com/conditions/KidneyFailure.html
- https://www.americandragon.com/conditions/Anemia.html
- https://www.americandragon.com/conditions/Insanity.html
- https://www.americandragon.com/conditions/Stress.html
- https://www.americandragon.com/conditions/Pyelonephritis.html
- https://www.americandragon.com/conditions/Arthralgia.html
- https://www.americandragon.com/conditions/LupusErythematosus.html
- https://www.americandragon.com/conditions/Epistaxis.html
- https://www.americandragon.com/conditions/Strangury.html
- https://www.americandragon.com/conditions/AnginaPectoris.html
- https://www.americandragon.com/conditions/PelvicInflammatoryDisease.html
- https://www.americandragon.com/conditions/RheumaticFever.html
- https://www.americandragon.com/conditions/Dyspnea.html
- https://www.americandragon.com/conditions/Gangrene.html
- https://www.americandragon.com/conditions/Dizziness.html
- https://www.americandragon.com/conditions/SoreThroat.html

These are discovery anchors, not an exhaustive source list.

---

# 7. Existing first-pass enrichment

The included `ad_batches/` folder contains 54 entries representing 53 unique proposed Pattern IDs because `pattern.phlegm_damp` appeared in two source-oriented batches.

These files are **enrichment evidence**, not proof that all 53 IDs exist in the current registry.

Sonnet must intersect them with the live canonical registry.

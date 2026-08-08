# AcuTing OS — TCM Pattern V1 Source Stack v2

**Date:** 2026-08-08  
**Purpose:** Replace an AD-first extraction strategy with a multi-source Pattern completion strategy.

---

# 1. Source priority

## Tier 0 — Canonical terminology / classification authority

### GB/T 16751.2-2021
中医临床诊疗术语 第2部分：证候  
Use for:
- canonical Chinese Pattern terminology
- normalized Pattern naming
- terminology review

Official:
https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=C71A9DAD24CB1252F12439D1F045DA6A

### GB/T 15657-2021
中医病证分类与代码  
Use for:
- TCM disease/pattern classification and code cross-reference
- terminology normalization

Official:
https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=41FD9D06E5BE4F84EA1D8D07101BED2C

### GB/T 46940-2025
中医药 中医临床术语系统分类框架  
Effective 2026-04-01.

Use as a current reference for the architecture of TCM clinical terminology systems.

Official:
https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=422C459E72161A195B68B2DAF45EC791

Do not make external standard codes the AcuTing canonical ID.

---

# 2. Primary clinical Pattern source — Sacred Lotus

Main diagnosis index:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/

Why it is valuable:

Sacred Lotus is unusually close to the structure required by the current AcuTing Pattern modal.

Pattern pages commonly contain:

```text
Pattern name
Signs
Tongue
Pulse
Etiology / Pathology
Treatment Principle
Acupuncture Points
Method
```

The site also organizes TCM differentiation by:

```text
Zang-Fu
combined Zang-Fu patterns
Qi / Blood / Fluids
Eight Principles
Six Stages
Four Levels
San Jiao
tongue
pulse
```

Recommended use:

```text
Etiology / pathology        HIGH VALUE
Key manifestations          HIGH VALUE
Tongue                      HIGH VALUE
Pulse                       HIGH VALUE
Treatment principle         HIGH VALUE
Acupuncture points          HIGH VALUE
Differential structure      HIGH VALUE
Classification              STRONG SUPPORT
```

Important pages:

Heart:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-heart-patterns-tcm

Spleen:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-spleen-patterns-tcm

Liver / Gallbladder:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-liver-gallbladder-patterns-tcm

Bladder:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-fu-bladder-patterns-tcm

Combined patterns:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/zang-zu-combined-patterns-tcm

Qi / Blood / Fluids:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/differentiation-syndromes-qi-blood-fluids-tcm

Tongue:
https://www.sacredlotus.com/go/diagnosis-chinese-medicine/get/tongue-diagnosis-chinese-medicine

Source note:
Sacred Lotus states its TCM reference material draws on teachers, class notes including Five Branches University, and standard TCM books including Maciocia, Huang Di Nei Jing translations, The Web That Has No Weaver, and other sources.

Use as a professional educational secondary source, not as the canonical naming authority.

---

# 3. Primary graph/detail source — Me & Qi

Pattern library path:
https://www.meandqi.com/knowledge-base/patterns/

Me & Qi is particularly useful because individual Pattern pages commonly expose:

```text
Chinese name
Pinyin
English aliases
Pattern nature
Affects / organs
Key signs
Supporting symptoms
Tongue
Pulse
Causes
Precursor patterns
Progression / can-develop-into
Differential discussion
Formulas
Acupuncture points
Related conditions
Broader category
classification tags
```

Examples:

Liver Qi Stagnation:
https://www.meandqi.com/knowledge-base/patterns/liver-qi-stagnation

Heart Qi Deficiency:
https://www.meandqi.com/knowledge-base/patterns/heart-qi-deficiency

Heart Yang Deficiency:
https://www.meandqi.com/knowledge-base/patterns/heart-yang-deficiency

Kidney Yin Deficiency:
https://www.meandqi.com/knowledge-base/patterns/kidney-yin-deficiency

Kidney / Liver Yin Deficiency:
https://www.meandqi.com/knowledge-base/patterns/kidney-and-liver-yin-deficiency

Recommended use:

```text
Aliases / Pinyin             VERY HIGH VALUE
Key manifestations           VERY HIGH VALUE
Differential discussion      VERY HIGH VALUE
Pattern hierarchy            VERY HIGH VALUE
Precursor / progression      HIGH VALUE
Related concepts             HIGH VALUE
Formula candidates           HIGH VALUE
Point candidates             HIGH VALUE
Tongue / pulse               HIGH VALUE
```

Caution:

- modern editorial synthesis
- commercial herbal-product site
- related Western conditions are contextual associations, not equivalence
- do not copy prose wholesale
- do not let the site create new canonical Pattern IDs automatically

Use its relationship structure as evidence and inspiration for AcuTing's graph, not as a foreign ontology to import wholesale.

---

# 4. Theory / classification cross-check — Shen-Nong

Main diagnostic principles:
https://new.shen-nong.com/article/principles-methods-diagnosis-traditional-chinese-medicine?lang=en

Zang-Fu differentiation:
https://new.shen-nong.com/article/syndrome-differentiation-zang-fu-organs-chinese-medicine?lang=en

Eight Principles:
https://shen-nong.com/eight-principles/

Why use it:

Shen-Nong is especially useful for the reasoning architecture behind syndrome differentiation.

It discusses:

```text
Eight Principles
Zang-Fu
Twelve Meridians
Six Meridians
Four Phases / Levels
diagnostic principles
pattern evolution
general deficiency/excess/cold/heat logic
```

Recommended use:

```text
Classification architecture      HIGH VALUE
Etiology/pathomechanism logic     HIGH VALUE
Eight Principles                 VERY HIGH VALUE
Six-channel / warm-disease frame HIGH VALUE
General differentiation rules    HIGH VALUE
```

It is less consistently formatted as an individual-card database than Sacred Lotus or Me & Qi.

---

# 5. Secondary treatment/context source — American Dragon

Keep American Dragon, but move it down one layer.

Best uses:

```text
manifestation corroboration
tongue / coating / pulse corroboration
formula candidates
acupuncture-point candidates
condition-specific Pattern contexts
exact source pages
```

Do not use AD alone for:

```text
canonical terminology
classification
etiology/pathomechanism
Western diagnosis equivalence
biomedical safety
```

---

# 6. Existing AcuTing sources

Always check existing project data before external research:

```text
current pattern_library
current pattern_registry
course notes
Bastyr materials
NCBAHM 2026 outline
formula master data
CloudTCM provenance
existing Pattern comparisons
```

Existing accepted non-empty content must not be overwritten merely because an external website phrases it differently.

---

# 7. Recommended field-by-field extraction strategy

| Pattern card field | Primary | Cross-check |
|---|---|---|
| canonical Chinese name | GB/T / existing repo | Me & Qi aliases |
| English name | existing repo / accepted textbook | Me & Qi |
| Pinyin | Me & Qi | other accepted source |
| classification | GB/T + Shen-Nong + Sacred Lotus | Me & Qi taxonomy |
| etiology | Sacred Lotus + accepted course/textbook | Shen-Nong / Me & Qi |
| pathomechanism | Sacred Lotus + accepted course/textbook | Shen-Nong / Me & Qi |
| key signs | Sacred Lotus + Me & Qi | AD |
| supporting signs | Me & Qi + Sacred Lotus | AD |
| tongue | Sacred Lotus | Me & Qi + AD |
| coating | Sacred Lotus | Me & Qi + AD |
| pulse | Sacred Lotus | Me & Qi + AD |
| differential | Me & Qi + Sacred Lotus | existing course comparisons |
| treatment principle | Sacred Lotus + existing repo | AD |
| formulas | Me & Qi + AD + existing formula DB | course/formula master |
| points | Sacred Lotus + Me & Qi + AD | existing point DB |
| progression | Me & Qi | course/textbook |
| board pearls | NCBAHM/course only | textbook |
| biomedical context | source-context only | relation review |
| safety | separate biomedical authoritative workflow | never AD-only |

---

# 8. Extraction rule

Do not copy long source prose.

For each current canonical Pattern:

```text
1. preserve existing accepted AcuTing content
2. retrieve Sacred Lotus page/section if available
3. retrieve Me & Qi Pattern page if available
4. retrieve Shen-Nong framework/content when useful
5. retrieve AD for formula/point/context corroboration
6. compare sources
7. synthesize concise bilingual original wording
8. attach exact source URLs
9. retain disagreements as source-context notes
10. do not fabricate a value merely to reach completeness
```

---

# 9. Why this stack is better than AD-only

Example: Heart Yang Deficiency

Sacred Lotus supplies:

```text
Signs
Tongue
Pulse
Etiology
Treatment Principle
Points
```

Me & Qi supplies:

```text
Chinese
Pinyin
aliases
key signs
progression from Heart Qi Deficiency
differential from Heart Qi Deficiency
hierarchy / affects
treatment relationships
```

American Dragon supplies:

```text
additional condition contexts
formula candidates
point candidates
manifestation corroboration
```

Together this is substantially stronger than extracting one AD block and trying to infer the rest.

---

# 10. Pattern V1 rule

AcuTing Pattern V1 should use a multi-source synthesized card, not a mirror of any one external site.

The external websites are evidence layers.

The AcuTing canonical Pattern remains:

```text
pattern.<existing_english_slug>
```

and is controlled by AcuTing's registry, decisions, validators, and source policy.

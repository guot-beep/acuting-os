# 02 — Pattern Classification Taxonomy

## Problem being solved

The current UI reports a large “Awaiting classification” group. Pattern V1 must end with:

```text
Awaiting classification = 0
```

Classification must be controlled and multi-axis.

---

# 1. Primary differentiation system

Use ONE reviewed primary system per canonical Pattern.

Controlled starter set:

| Key | 中文 | English | Typical examples |
|---|---|---|---|
| `zang_fu` | 臟腑辨證 | Zang-Fu Differentiation | Heart Yang Deficiency, Liver Qi Stagnation |
| `qi_blood_body_fluid` | 氣血津液辨證 | Qi, Blood & Body Fluid Differentiation | Qi Deficiency, Blood Stasis |
| `pathogenic_factor_mechanism` | 病邪／病機辨證 | Pathogenic Factor / Mechanism | Wind-Cold, Damp-Heat, Food Stagnation |
| `six_channels` | 六經辨證 | Six-Channel Differentiation | Tai Yang Shang Han, Shao Yang |
| `wei_qi_ying_xue` | 衛氣營血辨證 | Wei-Qi-Ying-Xue Differentiation | Ying Stage Heat, Xue Stage Heat |
| `san_jiao` | 三焦辨證 | San Jiao Differentiation | Upper Jiao Damp-Heat, Middle Jiao Damp-Heat |
| `channel_bi` | 經絡／痹證辨證 | Channel / Bi Differentiation | Wind-Damp-Heat Bi, channel obstruction patterns |

Do not add `channel_bi` merely because a Pattern causes pain. Use it only when the Pattern itself is fundamentally a channel/Bi pattern.

If the actual current registry contains a legitimate pattern system not represented here, add one controlled value only after documenting why the existing set cannot represent it.

---

# 2. Zang-Fu families

Secondary tags may include:

```text
heart
small_intestine
lung
large_intestine
spleen
stomach
liver
gallbladder
kidney
bladder
pericardium
san_jiao
```

Multi-organ Pattern:

```text
Liver-Kidney Yin Deficiency

primary_system = zang_fu
family_tags = [liver, kidney]
```

Do NOT leave combined organ Patterns unclassified.

---

# 3. Eight Principles as orthogonal tags

Eight Principles usually should NOT be the only primary folder.

Use controlled secondary tags:

```text
exterior
interior

cold
heat

deficiency
excess

yin
yang
```

Examples:

```text
Kidney Yang Deficiency
→ interior + deficiency + cold + yang

Heart Yin Deficiency
→ interior + deficiency + heat + yin

Damp-Heat in Liver/Gallbladder
→ interior + excess + heat
```

Be cautious with `yin` / `yang` when it merely repeats the Pattern name without adding useful classification.

---

# 4. Substance / mechanism tags

Useful controlled tags:

```text
qi_deficiency
qi_stagnation
qi_sinking
qi_rebellion

blood_deficiency
blood_stasis
blood_heat
blood_cold

yin_deficiency
yang_deficiency
jing_deficiency

fluid_deficiency
fluid_retention
phlegm
phlegm_damp
phlegm_heat
water_retention
```

---

# 5. Pathogenic-factor tags

Use only when central to the Pattern:

```text
wind
cold
heat
fire
dampness
dryness
summerheat
food_stagnation
toxicity
```

Do not equate all redness with `heat`, or all pain with `stasis`.

---

# 6. Stage/system tags

For special systems:

### Six Channels

```text
tai_yang
yang_ming
shao_yang
tai_yin
shao_yin
jue_yin
```

Allow compound stage tags only when the canonical Pattern itself is a compound stage Pattern.

### Wei-Qi-Ying-Xue

```text
wei
qi
ying
xue
```

### San Jiao

```text
upper_jiao
middle_jiao
lower_jiao
```

---

# 7. Display grouping

Recommended UI:

```text
證型 TCM Patterns 59

▶ 臟腑辨證 Zang-Fu
▶ 氣血津液辨證 Qi, Blood & Body Fluids
▶ 病邪／病機 Pathogenic Factors & Mechanisms
▶ 六經辨證 Six Channels
▶ 衛氣營血 Wei-Qi-Ying-Xue
▶ 三焦辨證 San Jiao
▶ 經絡／痹證 Channel & Bi
```

Hide empty groups if desired, but keep controlled vocabulary available.

Within Zang-Fu:

```text
Heart
Lung
Spleen
Liver
Kidney
Stomach/Fu
Combined organs
```

Do not create duplicate card copies for subgroups. Grouping is a view over one canonical entity.

---

# 8. Acceptance

Every current canonical Pattern must have:

- exactly one reviewed `primary_system`
- appropriate secondary tags
- no `awaiting_classification`
- no invented taxonomy merely to avoid nulls

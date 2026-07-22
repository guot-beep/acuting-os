# Card redesign V2 — herbs and formulas

Triggered by Ting: 「這一點要重新設計了 因為是大改動」, after reviewing
`chinesemedicineatlas.com`. Her brief:

- that site goes in **a very important resource position** — its layout and
  information design are the model
- formulas should follow it too, **but its formula content is thinner than we
  need**
- ours must be **broader**: 中西醫對照 and 現代應用 included
- depth still comes **primarily from CloudTCM**, then arranged bilingually with
  the 中西醫 layer and the other links

Supersedes the layout parts of `HERB_FORMULA_CARD_SPEC.md` §0. The depth and
sourcing rules in that file still stand.

---

## 1. Why the Atlas cards work — the two things we were not doing

**A. Three tiers of progressive disclosure.** Our current card is one wall of
text, which reads as cluttered and thin simultaneously. The Atlas splits into:

1. **Index card** — category, 中文, English, toned pinyin, a plain-language
   "most often used for…" paragraph, and for formulas the herb roster as chips.
2. **Vitals row** — pill tags carrying the five or six facts you need instantly:
   `TEMP Warm` · `TASTE Acrid, Slightly Bitter` · `AFFECTS Qi, Yang` ·
   `PART stem` · `DOSE 2–9g`.
3. **Detail sections** — ACTIONS (bulleted), INDICATIONS (prose), COMMON
   CONDITIONS (tags), SAFETY (tinted box).

**B. Visual encoding instead of prose.** Two of their components replace text
with something scannable, and this is the part worth copying most:

- **Meridian ring** — the twelve channels laid out in a circle with the entered
  ones highlighted, and a count in the centre. "歸肺、膀胱經" becomes a shape.
- **Herb profile radar** — axes for HEAT, TONIFY, MOVING, DRYING, COOLING,
  PUNGENCY, BREADTH, POTENCY. Two herbs can be compared *by silhouette*
  instead of by reading two paragraphs.

The radar is the one that needs new data — see §4. It is also the single
biggest functional win available, because 相似藥鑑別 is exactly a
"how do these two differ" question.

---

## 2. Herb card V2 — section order

```
┌ image (botanical illustration, external link only — no copied images)
│ CATEGORY banner            解表 · RELEASE EXTERIOR
├────────────────────────────────────────────────
│ Herb #n · plant
│ Ephedra                                  ← English common name, large
│ Má Huáng  麻黃                            ← toned pinyin + 繁體
│ Also: Ma Huang Herb                      ← aliases
│ Herba Ephedrae · Ephedra sinica          ← pharmaceutical + botanical
├ VITALS pills ─────────────────────────────────
│ TEMP 溫 Warm │ TASTE 辛微苦 Acrid, Slightly Bitter │ AFFECTS 氣、陽 Qi, Yang
│ PART 莖 stem │ DOSE 1.5–10g │ CHANNELS LU · BL
├ ACTIONS 功效         bulleted, bilingual
├ INDICATIONS 主治     nested action → pattern → clinical picture (our depth,
│                      richer than the Atlas prose paragraph)
├ COMMON CONDITIONS    plain-language tag pills, linked to the condition canon
├ 中西醫對照            ← OURS, the Atlas has nothing like it
├ 現代應用 / 藥理        ← OURS
├ 藥對 pairs            ← OURS, chips to pair records
├ 隨證用法              processing form by purpose (生用/蜜炙/麻黃絨)
├ SAFETY (tinted)      toxicity · contraindications · herb-drug interactions
├ 相關方劑              formula chips
├ HERB PROFILE radar   §4
├ MERIDIAN ring        §5
└ EXTERNAL LINKS       CloudTCM direct · American Dragon · Atlas
```

Sections marked **OURS** are the reason this is not just a clone: the Atlas is
a beautiful materia medica index, but it has no 中西醫 crosswalk, no modern
application layer, and no pair layer.

## 3. Formula card V2

The Atlas formula pages are the strongest thing in the screenshots and we
should follow them closely, then go further.

**Adopt directly:**

- **Plain-language opener.** "Most often used for the early stages of a cold or
  flu with strong chills, no sweating and aching muscles — when the body needs
  a powerful push to expel the pathogen outward." One sentence, no jargon, and
  it tells you when to reach for it. Required field: `plain_summary_zh/en`.
- **HERB ROSTER — 君臣佐使, colour-coded**, each row: thumbnail, the 君/臣/佐/使
  character badge, pinyin name, English + 中文, and **a one-line reason for that
  herb's role** ("Descends Lung Qi, stops wheezing and cough"). That last line
  is what turns a composition list into teaching material.
  Colours: 君 red · 臣 blue · 佐 green · 使 gold.
- **CONSTITUTIONAL TYPES** as tag pills (Qi Deficiency, Yang Deficiency).
- **INDICATIONS & PATTERN** as one dense line naming the pattern then the signs
  — "Wind-Cold Excess (Tai Yang): strong chills, mild fever, absence of
  sweating, headache, body aches, stiff neck, wheezing, floating tight pulse."
- **CONTRAINDICATIONS in red**, directly under indications, not buried.

**Add beyond them** — this is where ours must be broader:

- 加減 modifications (their pages do not carry this; it is the clinical core)
- 藥對 chips — which pairs do the work in this formula
- 中西醫對照 + 現代應用 linked to the condition canon
- 相似方鑑別 — 麻黃湯 vs 桂枝湯 sits right there in their own data
  (表實無汗 vs 表虛有汗) but they never draw the comparison
- per-herb **dose**, which their roster omits entirely
- source text 《傷寒論》

## 4. New data required: the herb profile radar

Eight numeric axes, 0–10. This data does not exist anywhere in the repo and
cannot be scraped — it has to be assigned.

| axis | meaning |
| --- | --- |
| HEAT | warming strength |
| COOLING | cooling strength |
| TONIFY | supplementing strength |
| MOVING | moving/dispersing strength |
| DRYING | drying vs moistening |
| PUNGENCY | acrid/dispersing quality |
| POTENCY | overall strength of action |
| BREADTH | narrow-specific vs broad-acting |

**Honest constraint:** these are interpretive, not facts from a source. So they
are marked `authored_by: model_draft`, `axis_basis` records what they were
derived from (性味 + 功效 + dose range), and they are explicitly **not**
promotable to `source_checked` — they are a visualisation aid, and the card
must say so. Never let a radar shape override a written contraindication.

Start with one category (解表藥, 10 herbs) so relative scaling is calibrated
within a group before spreading.

## 5. Meridian ring

Pure derived rendering from `channels_entered` — no new data. Twelve positions
in fixed order (LU LI ST SP HT SI BL KI PC TB GB LV), entered channels
highlighted, count in the centre. Reuses the channel abbreviations already
added in the glance layer.

Same component works on the acupoint cards, where it is arguably more useful.

## 6. Build order

| Step | Work | Depends on |
| --- | --- | --- |
| V2-1 | vitals pill row + toned pinyin + channel abbreviations | glance fields (done) |
| V2-2 | meridian ring component | nothing — derived |
| V2-3 | formula herb roster with 君臣佐使 colours, per-herb dose and role reason | formula schema §4 of the spec |
| V2-4 | plain_summary on every herb and formula | content fill |
| V2-5 | 中西醫對照 + 現代應用 sections wired to the condition canon | condition canon fill |
| V2-6 | 藥對 chips on both cards | herb_pairs.json (seeded) |
| V2-7 | herb profile radar, 解表藥 first | §4 axis data |
| V2-8 | 相似方/相似藥 comparison view | comparison groups (already exist, gated) |

V2-2 is free and immediately visible. V2-3 makes the formula cards genuinely
useful. V2-7 is the flashiest but depends on assigned data, so it goes last.

## 7. Images

The Atlas uses botanical illustrations. Repo policy is links only — no copied
images. Options, in order of preference: link out to the source page; or use
public-domain botanical plates (older botanical illustrations are frequently
out of copyright) with the plate's provenance recorded per image. Do not copy
the Atlas's own image files.

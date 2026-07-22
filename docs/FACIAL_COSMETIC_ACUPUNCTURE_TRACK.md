# Facial & Cosmetic Acupuncture — track design (FA)

Second specialty track, alongside `docs/SPORTS_MEDICINE_ACUPUNCTURE_LEARNING_TRACK.md`.
Target: the FACE certification, plus the clinical scope Ting named — 提升、
祛斑、增強氣色、中風口角歪斜、眼瞼下垂、青春痘 — each linked to 中西醫病名,
解剖定位 and 穴位.

Substrate: `docs/ANATOMY_MOVEMENT_TRACK_DESIGN.md` (AM).

---

## 1. The strategic finding: these two certifications share one engine

FACE = **Facial Applications for Cosmetic Enhancement**, run by the Academy of
Advanced Cosmetic Facial Acupuncture with Pacific College. Open to licensed
acupuncturists and advanced Pacific College students; roughly 146 hours of
NCCAOM/CA PDA CEUs including safety and ethics; faculty listed as Shellie
Goldstein, **Matt Callison**, Yueying Li, Kaitlin Fitzgerald, Deirdre Courtney
and Daniela Turley. *(Surfaced by search 2026-07-22, not yet opened.)*

Matt Callison is also the founder of the Sports Medicine Acupuncture
Certification. The same anatomy-first method underlies both.

**Design consequence: do not build two systems.** The face is a *region module*
of the same anatomy engine — muscles, attachments, innervation, points,
conditions, assessment. One substrate, two region modules, two condition sets.
Building AM once serves both certifications, which roughly halves the work.

---

## 2. What already exists (measured)

| Piece | State |
| --- | --- |
| Facial/head acupoints | **36 points**, complete bilingual content (ST1–ST7, BL1–BL8, GB1/2/10–14, TE17–22, LI19/20, SI18/19, GV20/25–28, CV24) |
| 顏面神經麻痺 Bell's palsy | `cond.bells_palsy` exists, category `neuro` |
| 痤瘡 acne | `cond.acne` exists, category `derm` |
| 酒糟、濕疹、斑禿 | exist, category `derm` |
| Condition crosswalk | 150 records, **ICD-10 100% seeded** |
| `derm` / `ent_eye` categories | exist |
| Facial muscles / bones | **nothing** |
| 黃褐斑 melasma, 眼瞼下垂 ptosis | **missing from the canon** |
| Cosmetic goals (提升／氣色) | **nothing, and see §4 — they must not be added as diseases** |

So "深度連結中西醫病名" is not a from-scratch build: the crosswalk exists and
several of the conditions she named are already in it with ICD codes. What is
missing is the facial anatomy layer and the aesthetic-goal layer.

---

## 3. Facial anatomy needs three things ordinary muscles do not

The AM muscle schema mostly transfers, but the face is genuinely different in
three ways, and each has direct clinical consequence.

### 3.1 Facial expression muscles insert into **skin**, not bone

Almost alone in the body, the muscles of facial expression attach to the
dermis. That is why facial technique is superficial and often threaded along
the muscle, and why "origin and insertion" as taught for limb muscles does not
transfer cleanly.

```json
"attachment_type": "dermal",   // dermal | bone | mixed
"insertion_zh": "止於口角皮膚與黏膜（非骨性止點）"
```

Without this field the schema silently misrepresents the entire face.

### 3.2 Cranial nerve split — CN VII vs CN V

```json
"innervation": { "cranial_nerve": "CN VII", "branch": "buccal", "function": "motor" }
```

- **CN VII (facial)** — motor to the muscles of *expression*
- **CN V (trigeminal)** — sensory to the face, motor to the muscles of
  *mastication* (masseter, temporalis)

This is not trivia. It is the anatomy that explains why Bell's palsy affects
expression but not chewing, and why masseter and temporalis behave as a
separate functional group. Every facial muscle record carries it.

### 3.3 Facial danger zones — safety-load, gated

Periocular needling, the facial and angular vessels, and the supraorbital /
infraorbital / mental foramina. Treated exactly like needling depth in the AM
track: staged with structures and review prompts, **never with a depth number
generated from memory**, and gated on Ting.

Facial bones stay thin and landmark-focused: frontal, nasal, zygomatic,
maxilla, mandible, plus the three foramina.

---

## 4. The one architectural decision that matters most: 病 ≠ 美容目標

Ting's list mixes two categories that must not share a table.

**Medical conditions** — real diagnoses, real ICD-10, go in the existing
crosswalk:

| 中醫 | Western | ICD-10 (to verify per record) |
| --- | --- | --- |
| 面癱／口眼喎斜 | Bell's palsy | already in canon |
| 痤瘡 | Acne vulgaris | already in canon |
| 黃褐斑 | Melasma | **to add** |
| 眼瞼下垂 | Blepharoptosis | **to add** |
| 酒糟 | Rosacea | already in canon |

**Aesthetic goals** — 提升、增強氣色、細紋. These are **not diseases**. They get
their own layer with **no ICD code field at all**:

```json
{
  "id": "aesthetic.lifting",
  "name_zh": "提升／緊緻",
  "name_en": "Lifting and firming",
  "goal_type": "aesthetic",
  "tcm_reasoning_zh": "氣血不足以濡養肌腠、中氣下陷則肌肉鬆弛",
  "related_patterns": ["pattern.qi_deficiency", "pattern.spleen_qi_sinking"],
  "target_muscles": [],
  "claim_class": "traditional_rationale",
  "evidence_note_zh": "此為中醫理論依據，非療效宣稱",
  "icd10": null
}
```

Two reasons this separation is non-negotiable:

1. **Data integrity.** Forcing 提升 into a disease crosswalk means inventing an
   ICD code for something that is not a disease. The crosswalk's value is that
   its codes are real.
2. **Billing and compliance.** Coding a cosmetic goal with a disease ICD is
   insurance fraud, not a modelling choice. The schema should make it
   impossible to do by accident. `goal_type: aesthetic` records carry no
   billing fields, full stop.

`claim_class` (`traditional_rationale` | `mechanism_hypothesis` |
`clinical_study`) exists because cosmetic efficacy claims are regulated
advertising in most jurisdictions. NORTH_STAR Phase 6 has a public export path
for `public_ready` records — a 祛斑 efficacy claim reaching a public page is a
real risk, not a hypothetical one. **Aesthetic-goal records default to
`public_ready: false` and only Ting can flip that, per record.**

---

## 5. The clinical discrimination this track must teach first

Ting listed **中風口角歪斜** and 面癱 together. Separating them is the single
most important thing this track can teach, and it is a safety issue:

| | Peripheral (Bell's palsy, CN VII) | Central (stroke, UMN) |
| --- | --- | --- |
| Forehead / brow | **involved** — cannot raise brow, cannot close eye | **spared** — brow still works |
| Onset | hours to days | sudden |
| Other signs | usually isolated | limb weakness, speech, vision |
| Action | treatable | **emergency referral — not an acupuncture case** |

Forehead sparing is the discriminator, because the upper face has bilateral
cortical innervation. A sudden facial droop with a *working* forehead is a
possible stroke and goes to emergency care.

This becomes a **required contrast pair** in the Learning Loop track, and the
`referral_triggers` field on both records must carry it. It is also the
strongest argument for why this track needs the assessment layer (AM §2.6) and
not just point recipes.

---

## 6. Deep linking — what connects to what

The chain Ting asked for, per facial topic:

```
美容項目/病名 → 證型 → 相關臉部肌肉 → 該肌肉的穴位 → 解剖定位與危險區
                  ↘ 中西醫病名對照（僅限真正的病）→ ICD-10
```

Every hop already has a home: patterns exist, the crosswalk exists, points
exist, the muscle layer is AM. The new links are:

- `aesthetic_goals.json` — the cosmetic layer (§4)
- `facial_muscle_point_links.json` — which points overlie/reach which facial
  muscle, reusing AM §2.4's junction shape with `relation` and `layer`
- facial entries in the muscle canon, with §3's three extra fields

Bidirectional throughout, as everywhere else: tap 顴大肌 → the points over it,
its innervation, the goals and conditions it participates in; tap 提升 → the
muscles, points and patterns involved.

---

## 7. Sequencing

| Step | Work | Gate |
| --- | --- | --- |
| FA0 | facial muscle canon (~18 muscles) + facial bones/landmarks, ids and names only | none |
| FA1 | attachment_type, cranial nerve innervation, actions | study-tier draft |
| FA2 | add 黃褐斑 and 眼瞼下垂 to the condition canon with verified ICD-10 | Ting confirms codes |
| FA3 | `aesthetic_goals.json` — 提升／祛斑／氣色／細紋, `public_ready: false` | Ting per record |
| FA4 | facial point ↔ muscle junctions for the 36 existing points | study-tier draft |
| FA5 | facial danger zones | **gated, safety-load** |
| FA6 | Bell's vs central palsy contrast pair + referral triggers | **gated — safety** |

FA0 is ~18 muscles. This is a small, closeable track, unlike the sports one.

---

## 8. Open questions

1. FACE enrolment requires a licence or advanced Pacific College standing —
   is this a post-graduation goal? It affects whether FA is built now or
   parked as structure.
2. 祛斑: melasma, post-inflammatory hyperpigmentation and freckles are
   different conditions with different prognoses. Treat 祛斑 as one aesthetic
   goal, or split by underlying diagnosis? (I recommend splitting — the
   prognosis difference is clinically real.)
3. Chinese-language source for facial anatomy and 美容針灸 — still unresolved,
   same as the AM and SMA tracks. Ting picks or I bring verified candidates.

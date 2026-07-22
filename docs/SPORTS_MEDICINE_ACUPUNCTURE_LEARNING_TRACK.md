# Sports Medicine Acupuncture — learning track design (SMA)

Ting will be studying acupuncture sports medicine. This designs the subject's
learning blueprint and what the site must become to support it.

Companion to `docs/ANATOMY_MOVEMENT_TRACK_DESIGN.md` (AM), which is the
substrate this track stands on, and to `docs/LEARNING_LOOP_TRACK.md`, which is
the method.

Status: DESIGN. Verification status of every external source is stated
explicitly in §6 — most were surfaced by search and not yet opened.

---

## 1. What the subject actually is

Sports medicine acupuncture is not "acupuncture, but for athletes". It is a
distinct reasoning method with four pillars, and the site needs all four or
the subject collapses into either dry needling or generic point recipes.

**Pillar 1 — 經筋 sinew channels (the classical scaffold).**
The twelve jingjin are the classical channel system for muscle and connective
tissue: broader and more superficial than the primary channels, converging at
muscle attachments, and the traditional framework for 經筋病 — musculoskeletal
and postural disorders. This is what makes the subject *Chinese medicine*
rather than needling with an anatomy chart.

**Pillar 2 — functional anatomy.**
Origin, insertion, action, innervation. Already designed as the AM track.

**Pillar 3 — motor points (the modern bridge).**
The point where the nerve enters the muscle belly. Motor points and acupoints
frequently coincide but are **not the same thing**, and conflating them is the
most common error in this material. This is the layer Matt Callison's work
codified in North America.

**Pillar 4 — assessment.**
Postural and movement assessment, plus orthopaedic special tests — already
designed as AM §2.6.

**The method that links them**, as described in the literature surveyed:
identify which muscles are overactive (excess) and which are inhibited
(deficient) along a sinew channel, needle the motor points of the muscles
involved, and add distal points along the corresponding channel. That single
sentence is the reasoning target of the whole track — everything below exists
to make that sentence executable.

---

## 2. Honest gap analysis — what Ting already has

Measured against the four pillars:

| Pillar | Current state | Verdict |
| --- | --- | --- |
| 經筋 sinew channels | **0 records.** `grep 經筋` over `data/` returns nothing. | **The single biggest gap.** Highest leverage item in this design. |
| Functional anatomy | `muscles/bones/nerves/vessels` fields exist, 0% filled; AM track designed; Codex staging has ~11 sourced muscles | Designed, not built |
| Motor points | Nothing | Missing layer |
| Assessment | AM §2.6 designed | Designed, not built |
| Points themselves | 361/361 complete with functions/indications both languages | **Done** |
| Region axis | `region` filled 361/361 — but **79 distinct values** (胸部/腹部/前臂/上背/背部…) | Present but too granular to study by |
| Outcome capture | SOAP has `outcome_verdict`, reflection fields, case timeline | **Done, and unusually well suited to this subject — see §4.5** |

The encouraging read: the expensive half (361 points, bilingual content, case
system, review tooling) already exists. What is missing is the connective
tissue — literally.

---

## 3. The learning blueprint

Ordered by dependency, not by interest. Each phase is usable on its own.

### Phase 0 — Anatomy substrate *(AM0–AM2)*
Muscles with origin, insertion, action, innervation. Nothing else in this
subject is learnable without it: a motor point is meaningless if you do not
know where the muscle belly is, and 經筋 pathways are described by muscle
attachments.

### Phase 1 — 經筋 pathways
Learn the twelve sinew channels as pathways over muscles she now knows. This
phase is high-yield because it **reuses the channel knowledge she already has**
— each jingjin parallels a primary channel she has already studied, so it is
extension, not new memorisation.

Study form: for each jingjin, its route, the muscles it covers, its attachment
convergences, and its classical 經筋病 presentation.

### Phase 2 — Region modules
Switch from channel-first to **region-first**. This is how the subject is
actually taught — the SMAC programme is structured as Spinal Column → Lower
Extremity → Neck/Shoulder/Upper Extremity. Working region by region means
anatomy, sinew channel, motor points, assessment and injuries are learned
*together* for one body area, which is how they are used clinically.

Suggested order (matching the established programme): spine and posture →
lower extremity → neck, shoulder and upper extremity.

### Phase 3 — Assessment
Postural assessment, movement screening, orthopaedic special tests, and the
referral triggers. Deliberately after Phase 2: a special test is meaningless
without knowing the structure it stresses.

### Phase 4 — Integration through cases
Real cases in the existing Cases workspace, using the Learning Loop: predict
before treating, record the outcome verdict, review what did not work.

**Do not run these strictly in series.** Phases 0–1 are prerequisites, but
Phase 4 should start as soon as Phase 2 covers one region — the loop is the
learning mechanism, not the graduation exam.

---

## 4. What the site must become

### 4.1 經筋 layer — `data/anatomy/sinew_channels.json`

```json
{
  "id": "jingjin.foot_taiyang",
  "name_zh": "足太陽經筋",
  "name_en": "Foot Taiyang sinew channel",
  "parallel_channel": "BL",
  "pathway_zh": "…",
  "muscles": ["muscle.gastrocnemius", "muscle.erector_spinae", "…"],
  "convergence_points_zh": ["…"],
  "classical_presentation_zh": "…",
  "modern_correlate_note_zh": "與淺背線（superficial back line）的對應為現代詮釋，非古典原文",
  "sources": [],
  "review_status": "draft"
}
```

The `modern_correlate_note` field is deliberate. Myofascial-line correlations
are a **modern interpretation**, useful and increasingly published, but not
classical text. Marking the seam keeps the two honest — and keeps her able to
answer "is that in the 靈樞, or is that Myers?" which is exactly the kind of
question a board examiner or a sceptical colleague asks.

Bidirectional, like everything else: click a sinew channel → its muscles and
points; click a muscle → which sinew channel it belongs to.

### 4.2 Motor point layer — on the muscle record

```json
"motor_point": {
  "location_zh": "…",
  "nearest_acupoint": "ST36",
  "coincides_with_acupoint": false,
  "source_id": null,
  "review_status": "draft"
}
```

`coincides_with_acupoint` as an explicit boolean, not an inference. The whole
value of this field is refusing to blur motor point and acupoint — a chart
that silently equates them teaches the error.

### 4.3 Region rollup — `data/config/study_regions.json`

`region` is filled on all 361 points but has 79 values, which is a tag set,
not a study axis. Add a rollup mapping those 79 to ~10 study regions
(spine/posture, neck, shoulder, upper arm/elbow, forearm/wrist/hand,
trunk, hip/pelvis, thigh/knee, lower leg, foot/ankle).

Cheap — no new point data, just a grouping — and it unlocks Phase 2's
region-first study mode plus a region filter beside the existing 特定穴 filter.

### 4.4 Study modes

- **Region mode**: pick a region → its points, muscles, sinew channels,
  common injuries and relevant tests on one screen.
- **Sinew channel mode**: pick a jingjin → route, muscles, points, 經筋病.
- **Reasoning drill**: given a presentation, work outward — which movement is
  limited → which muscles → excess or inhibited → which motor points and
  distal points. This drills the §1 method rather than testing recall.
- **Contrast pairs** (from the Learning Loop track): 經筋病 vs 經脈病;
  tendinopathy vs tear; motor point vs acupoint; excess vs inhibited muscle.
  The confusable pairs are where this subject is actually hard.

### 4.5 Why this specialty is the best training ground for the Learning Loop

Worth stating plainly, because it changes how much the loop is worth here.

Musculoskeletal cases produce **feedback within the same session**: range of
motion and pain change immediately and are measurable. Compare fertility,
where a verdict takes cycles. The existing `outcome_verdict` and reflection
fields, which have to wait months to teach anything in the gyn track, will
teach something the same afternoon here.

Concretely: the `if_ineffective_plan` field — write the prediction before
needling, check it at the end of the session. That is a complete learning loop
in one visit. This specialty should therefore be where the Learning Loop track
is proven out first.

### 4.6 Bilingual, structurally enforced

Per Ting's instruction that the knowledge links be 中英文: every record in this
track carries `name_zh` + `name_en`, and `knowledge_links` must contain **at
least one zh-language and one en-language source** before it can leave `draft`.
This is a validator rule, not a note — a record with English links only fails
the bilingual check and stays visibly incomplete.

This matters more here than elsewhere: the classical material (經筋、經筋病) is
best in Chinese, and the functional anatomy and assessment material is best in
English. Neither language covers this subject alone.

---

## 5. Data layers summary

| Layer | File | Depends on |
| --- | --- | --- |
| Muscles / bones / movements | AM §2.1–2.3 | — |
| Point ↔ muscle junction | AM §2.4 | muscles |
| Sinew channels | `data/anatomy/sinew_channels.json` | muscles |
| Motor points | field on muscle record | muscles |
| Study regions | `data/config/study_regions.json` | — (rollup of existing `region`) |
| Injuries + pathology | AM §2.5, §2.7 | muscles, movements |
| Exams | AM §2.6 | injuries |

Order to build: study regions (cheapest, immediate benefit) → muscles →
sinew channels → motor points → injuries → exams.

---

## 6. Resources — with honest verification status

**Verified (actually fetched):**

- **AAOS OrthoInfo** — official patient-education site of the American Academy
  of Orthopaedic Surgeons; stable per-condition URLs. Note the host moved:
  `orthoinfo.aaos.org` now 301s to `www.orthoinfo.org`. English only.

**Already in `source_registry.json`:** TeachMeAnatomy (tier A), Kenhub (tier
A), Visible Body (tier A, paid/institutional), Radiopaedia (tier A-).

**Surfaced by search, corroborated across multiple results, NOT yet opened:**

- **Sports Medicine Acupuncture Certification (SMAC)** / AcuSport Education,
  founded by Matt Callison — the established programme in this field, four
  modules taught by region (Spinal Column; Lower Extremity; Neck, Shoulder and
  Upper Extremity), webinar plus live format. This is the most likely formal
  path if Ting wants certification, and its module structure is what §3's
  Phase 2 ordering follows.
- **Callison publications** — *The Motor Point Manual*, *Motor Point Index*,
  *Sports Medicine Acupuncture* textbook, and the *Motor Point and Acupuncture
  Meridian Chart*. The chart in particular is the natural reference for §4.2.
- **"Correlation Between the Sinew Channels with the Myofascial System,
  Pathology, and Treatment"** — Journal of Acupuncture and Meridian Studies
  (Springer). A peer-reviewed bridge between 經筋 and myofascial anatomy;
  strongest candidate source for §4.1's `modern_correlate_note`.
- **Journal of Chinese Medicine** — article on using the jing jin for
  musculoskeletal conditions.
- **sinewchannels.com** ("Anatomy of the Sinew Channels") and the **British
  Acupuncture Council** article on discovering the sinew channels.

**Still missing: a Chinese-language source for this specialty.** The classical
經筋 material should be sourced in Chinese (靈樞·經筋 and modern TCM
musculoskeletal texts), and §4.6 makes that structurally required. Ting to
pick, or I bring a verified candidate list.

Every one of these gets a registry entry with tier, language and licensing
note before use, and the links-only rule applies throughout.

---

## 7. Open questions for Ting

1. Is SMAC certification an actual goal, or is this study-for-practice? It
   changes whether the site should mirror their module structure exactly or
   stay organised her own way.
2. Do you already own any Callison material? The Motor Point Index would let
   §4.2 be sourced properly rather than left empty.
3. Should I verify and register the §6 unopened sources now, or wait until
   Phase 0 anatomy is actually built and the sources are needed?

None of these block the first step, which is §4.3's region rollup — pure
regrouping of data that already exists.

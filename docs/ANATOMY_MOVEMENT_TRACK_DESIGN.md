# Anatomy & Movement Track (AM) — design

Goal, in Ting's words: from an acupoint, see which muscle or bone the needle
relates to; from that muscle, see where it attaches, which movement it drives,
and which movement/sports injuries that pattern is associated with — with
image references on Chinese and English anatomy sites.

Status: DESIGN ONLY. No data written, no canonical field added yet.
Owner: Claude (design) → Codex (fill pipeline) → Ting (per-tier review).

---

## 1. The one decision that shapes everything: a muscle is a record, not a string

The current `361.json` carries `muscles: []`, `bones: []`, `nerves: []`,
`vessels: []` as free lists (all 0% filled). Do **not** fill them as name
strings. Two concrete reasons, both already observed in this repo:

**Collision.** In Codex's `33882b5` protocol staging, LI4 and LR3 both carry
the string `"first dorsal interosseous muscle"`. They are different muscles —
the hand one is C8/T1 via the ulnar nerve, the foot one is S2–S3 via the
lateral plantar nerve. The staging is correct about both. Any grouping or
merge keyed on the name would silently fuse them.

**Duplication.** Origin, insertion, action, innervation and injury
associations are properties of the *muscle*, not of the point. Tibialis
anterior relates to several points; storing its origin on each of them means
correcting the same fact in several places, and guarantees drift.

So: muscles, bones and movements become their own canon layers with stable
namespaced ids (DECISIONS D1/D2), and points *reference* them (D5: many, not
one). This is the same shape the repo already uses for herbs and formulas.

```
muscle.tibialis_anterior
muscle.interosseous_dorsalis_1_hand     ← hand/foot encoded in the id,
muscle.interosseous_dorsalis_1_foot     ← not left to a shared name string
bone.tibia
move.ankle_dorsiflexion
injury.medial_tibial_stress_syndrome
```

---

## 2. Layers

### 2.1 `data/anatomy/muscles.json` — muscle canon

```json
{
  "id": "muscle.tibialis_anterior",
  "name_en": "Tibialis anterior",
  "name_zh": "脛骨前肌",
  "name_latin": "musculus tibialis anterior",
  "region": "lower_leg_anterior",
  "origin_en": "Lateral condyle and proximal half of the lateral tibial surface, interosseous membrane",
  "origin_zh": "脛骨外髁與脛骨外側面上半、骨間膜",
  "insertion_en": "Medial cuneiform and base of the first metatarsal",
  "insertion_zh": "內側楔骨與第一蹠骨底",
  "actions": ["move.ankle_dorsiflexion", "move.foot_inversion"],
  "innervation": { "nerve": "deep fibular nerve", "segments": ["L4", "L5"] },
  "antagonists": ["muscle.gastrocnemius", "muscle.soleus"],
  "palpation_note_zh": "踝背屈抗阻時，脛骨前緣外側可見隆起的肌腹",
  "visual_links": [ /* see §4 */ ],
  "sources": ["teachmeanatomy", "kenhub"],
  "review_status": "draft"
}
```

Scope note: acupoints do not touch every muscle in the body. The set of
muscles the 361 points actually relate to is roughly 100–150 — a finite,
closeable list, not an anatomy textbook.

### 2.2 `data/anatomy/bones.json` — bone/landmark canon

Same shape, smaller. Bones matter here mostly as **landmarks** (styloid
process, tibial tuberosity) and as **attachment targets** referenced by the
muscle records. Keep it thin; do not model the whole skeleton.

### 2.3 `data/config/movement_vocabulary.json` — controlled movement terms

Mirrors the existing `point_category_vocabulary.json` pattern.

```json
{ "id": "move.ankle_dorsiflexion", "joint": "ankle",
  "name_en": "Ankle dorsiflexion", "name_zh": "踝背屈",
  "plane": "sagittal" }
```

This vocabulary is what makes the feature *queryable* rather than just
readable. Without it, "dorsiflexion" / "踝背屈" / "背屈" are three strings and
nothing can be grouped.

### 2.4 `data/anatomy/point_muscle_links.json` — the junction

A flat list on the point is not enough, because the relationship differs:

```json
{
  "point_id": "ST36",
  "muscle_id": "muscle.tibialis_anterior",
  "layer": "superficial",
  "relation": "passes_through",
  "source_id": "takahashi_lower_limb_hemodynamics_2012",
  "review_status": "draft"
}
```

- `layer`: `superficial` | `intermediate` | `deep`
- `relation`: `passes_through` | `overlies` | `adjacent` | `attaches_near`

`relation` carries real weight. "The needle passes through it" and "it lies
next to it" are different claims — different for safety, and different for
whether the point is plausibly relevant to that muscle's dysfunction.
Collapsing them into one list loses exactly the distinction Ting is after.

### 2.5 `data/anatomy/movement_injuries.json` — the injury layer, kept separate

```json
{
  "id": "injury.medial_tibial_stress_syndrome",
  "name_en": "Medial tibial stress syndrome (shin splints)",
  "name_zh": "脛骨內側應力症候群（脛前疼痛）",
  "involved_muscles": ["muscle.tibialis_posterior", "muscle.soleus"],
  "aggravating_movements": ["move.ankle_plantarflexion", "move.foot_eversion"],
  "typical_presentation_zh": "…",
  "red_flags_zh": ["夜間痛或休息痛、局部點壓劇痛 → 需排除應力性骨折"],
  "sources": [],
  "review_status": "draft"
}
```

**This is a separate layer on purpose, and it is the one that needs the
strictest sourcing.** Muscle origin/insertion is textbook anatomy. "This
injury involves these muscles" is still anatomy, but one step closer to a
clinical claim, and it is where a plausible-sounding but wrong association
would do the most damage. Injury records get their own status ladder and do
not inherit a muscle record's status.

### 2.6 `data/anatomy/exams.json` — examination canon (physical tests + imaging)

Added at Ting's request: she will be learning **how to test an injury**, so
"which Western examination applies here" is knowledge the track must carry.

An exam is its own record, not a field on the injury, for the same reason a
muscle is: the relationship is many-to-many. Lachman supports ACL rupture;
McMurray supports meniscal tear; a single injury usually has several tests,
and a single test appears under several diagnoses.

```json
{
  "id": "exam.lachman",
  "exam_type": "physical_test",
  "name_en": "Lachman test",
  "name_zh": "拉赫曼測試",
  "region": "knee",
  "position_zh": "仰臥，膝屈約 20–30 度",
  "procedure_zh": "一手固定股骨遠端，另一手握脛骨近端前拉",
  "positive_finding_zh": "脛骨前移過多且終末阻力軟弱／消失",
  "suggests": ["injury.acl_rupture"],
  "accuracy": { "sensitivity": null, "specificity": null, "source_id": null },
  "cautions_zh": ["急性期劇痛或疑似骨折時不做誘發性測試"],
  "sources": [],
  "review_status": "draft"
}
```

`exam_type` covers both halves of 西醫檢查:

- `physical_test` — orthopaedic special tests
- `imaging` — X-ray / ultrasound / MRI, with what each modality actually shows
  for that tissue (Radiopaedia is already in the source registry for this)
- `lab` — reserved; rarely relevant here but keeps the field honest

**Two rules for this layer, both non-negotiable:**

1. **`accuracy` is null until sourced.** Sensitivity and specificity are
   numeric clinical claims. They come from a cited study or they stay null.
   Never from model memory, never "approximately".
2. **A positive test is not a diagnosis.** Orthopaedic special tests perform
   poorly in isolation; they are interpreted in clusters and in context. The
   schema reflects this — see `exam_clusters` below — and the UI says
   「支持／不支持」, never 「確診」.

```json
{ "id": "cluster.subacromial_impingement",
  "injury_id": "injury.subacromial_impingement",
  "exams": ["exam.neer", "exam.hawkins_kennedy", "exam.painful_arc"],
  "interpretation_zh": "多項同時陽性才較有意義；單一測試陽性不足以判定",
  "source_id": null, "review_status": "draft" }
```

### 2.7 Pathology fields on the injury record

Ting also asked for the 病理 layer — what is actually happening in the tissue.
These go on the injury record from §2.5:

```json
{
  "tissue_type": "tendon",
  "pathology_mechanism_zh": "慢性過度使用導致肌腱退化性變化（tendinosis），而非典型發炎",
  "stage": "chronic",
  "healing_timeline_zh": "肌腱血流少，修復以月計，與肌肉拉傷不同",
  "referral_triggers_zh": ["夜間痛／休息痛", "外傷後無法負重", "神經症狀"]
}
```

`pathology_mechanism` matters more than it looks. "Tendinitis vs tendinosis"
changes what treatment is even rational, and it is exactly the kind of thing a
study tool should make visible rather than flatten into a name.

`referral_triggers` is the safety-critical field of this whole track: when to
stop and send the patient for imaging or an orthopaedic opinion. It is
required on every injury record — an injury record with an empty
`referral_triggers` does not pass review.

---

## 3. What the app derives vs what it stores

The chain Ting described is:

```
穴位 → (junction) → 肌肉 → 起止點 / 動作 → (movement) → 損傷
```

**Store** each hop. **Derive** the end-to-end path at render time. Never
persist a `point → injury` field.

Reason: a derived path can be shown with its reasoning visible ("ST36 過脛骨前
肌 → 該肌負責踝背屈 → 相關損傷：…"), and it stays correct when any hop is
corrected. A stored `point.treats_injuries` list is an unsourced clinical
claim that will rot the moment a junction changes.

**Framing requirement.** The derived path is displayed as *anatomical
reasoning*, not as an indication list. Wording in the UI should say
「解剖上相關」/ "anatomically related", never 「主治」/ "treats". The existing
indications field remains the only place that makes treatment claims, and it
keeps its own sourcing. This is a hard line, not a style preference.

---

## 4. Image references — links only, per existing policy

`source_registry.json` already carries `teachmeanatomy`, `kenhub`,
`visible_body` and `radiopaedia`, all `source_group: B_anatomy`, and their
notes already say do not copy images or scrape wholesale. Visible Body is
additionally marked `paid_or_institutional_reference`. So this track inherits
the repo's established rule, the same one Codex's herb visual links follow:
**external links only, no embedded images.**

Improvement over the herb implementation: for herbs there is no derivable
per-record URL, so those links fall back to Google site-scoped search (I noted
this in the `5af7892` review). Muscles are different — TeachMeAnatomy and
Kenhub have stable per-muscle pages, so this track should use a
`data/anatomy/muscle_visual_map.json` holding **direct, verified URLs**, with
scoped search only as the fallback for records that lack one.

```json
{ "muscle_id": "muscle.tibialis_anterior",
  "links": [
    { "source_id": "teachmeanatomy", "url": "...", "label_zh": "起止點與作用圖", "link_status": "direct" },
    { "source_id": "kenhub", "url": "...", "label_zh": "肌肉圖譜", "link_status": "direct" }
  ] }
```

Every URL must be fetched and confirmed to resolve before it is committed —
a dead link in a study tool is worse than no link.

**Chinese-language source: unresolved.** The registry has no zh anatomy site
yet, and I am not going to invent one. Ting picks it (or approves a candidate
list), it gets a registry entry with a tier and licensing note like every
other source, and only then does it get URLs. Until then the zh labels point
at the same en pages — honest, and it does not block the track.

### 4.1 Injury/exam source candidates (Ting: "運動損傷這個醫學應該有很多正式中英文官網")

Correct, and it changes §6: the injury layer's blocker was assumed to be
"wait for Ting's textbooks", but public authoritative sources exist. Findings
so far — **verification status is stated honestly per row**:

| Candidate | Language | Status | Note |
| --- | --- | --- | --- |
| AAOS OrthoInfo | en | **VERIFIED 2026-07-22** | Official patient-education site of the American Academy of Orthopaedic Surgeons. Stable per-condition URLs, e.g. `/diseases--conditions/patellofemoral-pain-syndrome/`. **Host moved**: `orthoinfo.aaos.org` 301s to `www.orthoinfo.org` — register the new host. No zh version found. |
| 中國醫藥大學附設醫院 衛教單張 | zh-TW | **CANDIDATE — not yet opened** | Surfaced in search with per-condition pages (`/HealthEdus/Detail?no=4895` 網球肘, `no=5245` 足底筋膜炎). Fits this project unusually well (integrative TCM+Western teaching hospital). URL ids are opaque `no=` params, so it **requires the URL map from §4** — it cannot be derived from a name. |
| 台灣運動傷害防護學會 (tats.org.tw) | zh-TW | **CANDIDATE — not yet opened** | Professional body under 教育部體育署/衛福部 supervision. May be org-level rather than per-condition; needs checking before registering. |
| 臺灣運動物理治療學會 (taiwansportspt.org.tw) | zh-TW | **CANDIDATE — not yet opened** | Same caveat. |
| Physiopedia | en | **CANDIDATE — not yet opened** | Strong per-test coverage for special tests; wiki-model, so tier B at best, and each page's own citations matter more than the page. |
| Radiopaedia | en | already registered | Tier A-, already in `source_registry.json` for imaging. Natural home for `exam_type: imaging`. |

Before any of these is used: open it, confirm it resolves and is per-condition,
register it with tier + language + licensing note like every other source.
Same links-only rule — no copied images or text.

---

## 5. UI

**Point detail** gains an 「解剖與運動 Anatomy & movement」 section, placed
after 取穴方法 and before 主治病症 (anatomy informs location; it must not read
as an indication):

- muscles listed in layer order, each a chip showing relation
  （淺層・穿過 / 深層・鄰近）
- bone landmarks
- innervation, carried over from Codex's staging
- each muscle chip opens the muscle card

**Muscle card** (new detail view, same shell as the herb/formula study card):
name zh/en/latin · 起點 · 止點 · 動作 (as movement chips) · 神經支配 ·
拮抗肌 · 觸診提示 · 圖像連結 · **經過此肌肉的穴位** (bidirectional) ·
相關運動損傷 (each with its red flags).

**Bidirectional browsing throughout** — the same thing Ting asked for with
特定穴 ("按原穴就出現所有原穴"): click 脛骨前肌 → every point related to it;
click 踝背屈 → every muscle performing it and every point on those muscles.
This is why §2.3's controlled vocabulary is not optional.

**RV1 review controls** mount on muscle and injury cards from day one, so this
track is reviewable while studying rather than through a worksheet.

---

## 6. Fill strategy — why this track should not queue behind a gate

Muscle origin, insertion, action and innervation is the **lowest-risk content
in the repository**. It is stable textbook anatomy, it is not a treatment
claim, it does not vary by patient, and an error is immediately visible to
anyone who has taken the class. It is the natural pilot for the study-field
tier proposed in `CODEX_HANDOFF.md`: fill as `draft`, render immediately with
the status badge, review opportunistically through RV1.

The injury layer (§2.5) does **not** get that treatment. It stays gated.

Codex's `33882b5` protocol staging already emits muscle candidates with
segmental innervation but has nowhere to land them. This design gives that
output a destination — and note §2.4's `source_id`, which lets a
protocol-derived link stay labelled as protocol-derived rather than being
promoted to general anatomy.

Suggested order:

| Step | Work | Gate |
| --- | --- | --- |
| AM0 | vocabularies: `movement_vocabulary.json`, muscle id scheme | none (structure only) |
| AM1 | muscle canon skeleton for the ~100–150 muscles points touch (ids + names, no content) | none |
| AM2 | origin / insertion / actions / innervation fill, in batches | study-tier: draft renders |
| AM3 | `point_muscle_links.json`, seeded from Codex's staging + WHO locations | study-tier |
| AM4 | visual URL map, every link fetch-verified | none (links only) |
| AM5 | UI: anatomy section + muscle card + bidirectional browsing | none |
| AM6 | injury layer (incl. pathology fields §2.7) | sourced from §4.1 registry, **Ting reviews per record via RV1** |
| AM7 | exam canon §2.6 — physical tests + imaging | as AM6; `accuracy` numbers stay null until individually sourced |
| AM8 | injury ↔ exam junctions and clusters | as AM6 |

AM0–AM1 are pure structure and can start immediately without any content
decision.

AM6–AM8 no longer wait on Ting's own textbooks — §4.1 establishes that
authoritative public sources exist in both languages. What they still require
is **per-record sourcing and per-record review**, which RV1 now makes cheap.
The distinction that matters: these records may be *drafted* from registered
public sources without a blocking gate, but they render as `draft` with the
status badge, and `accuracy` numbers plus `referral_triggers` get individual
attention because those are the fields that can actually hurt someone.

---

## 7. Validators this track needs

Following the existing suite's pattern (one validator per invariant):

- `validate-anatomy-ids` — every `muscle.*` / `bone.*` / `move.*` id resolves;
  no duplicate ids; hand/foot style homonyms are distinct ids, never distinct
  records sharing a `name_en`
- `validate-anatomy-links` — every junction references a real point and a real
  muscle; `layer` and `relation` come from the allowed sets
- `validate-movement-vocabulary` — every `actions[]` entry resolves to the
  vocabulary; every vocabulary term is used or explicitly marked reserved
- extend `validate-encoding` coverage to the new files

---

## 8. Open questions for Ting

1. Chinese-language source: shall I open and verify the §4.1 candidates
   (CMUH 衛教單張 looks the most promising — per-condition and integrative)
   and bring back the ones that hold up, with licensing notes?
2. Bone layer: keep it to landmarks only, as proposed, or model attachments
   properly for the injury reasoning later? (§2.2)
3. Exam layer depth: full procedure text per test, or start with
   name + positive finding + what it suggests and deepen later? (§2.6)

None of these block AM0–AM1.

## 9. Scope note

This track now spans anatomy → movement → injury → pathology → examination.
That is a lot, and it is genuinely useful, but it is also the point where a
design can quietly become a second project. Two guards:

- The muscle/bone/movement layers (AM0–AM5) stand alone. If the injury and
  exam layers never get filled, the anatomy feature is still complete and
  useful on its own.
- The exam layer is scoped to **regions the acupoints actually reach**. This
  is a study companion for an acupuncture practice, not an orthopaedic
  examination textbook.

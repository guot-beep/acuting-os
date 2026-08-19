# SYM Batch E Ledger — Gap Sweep

Branch `codex/sym-batch-e`, based on `origin/codex/pattern-v2` tip `4ed39e4`
("R2: evidence convention"). Each agent appends its own dated section below;
do not edit another agent's section.

---

## 2026-08-11 — Sonnet, Batch E (demand-driven gap sweep, 77 → 102)

### Setup

- `git fetch origin codex/pattern-v2` → tip `4ed39e4` confirmed to include R2
  evidence convention commit.
- Branch `codex/sym-batch-e` created from `origin/codex/pattern-v2` at that
  exact SHA (worktree was clean, no stale branch to reset).
- Read `docs/AI_CONSTITUTION.md`, `docs/SYMPTOM_CARD_TEMPLATE.md` (incl. R2
  Evidence 慣例 appended 2026-08-11), `docs/research_packs/RESEARCH_ASSET_INDEX_2026-08-11.md`,
  `docs/research_packs/DO_NOT_USE_SUPERSEDED_ASSETS.md`.

### 1. Gap inventory method

Scanned `data/pathology/condition_canon_shortlist.json` (209 records) and
`data/pathology/tdis_registry.json` (75 records) against the 77 existing
`sym.*` records (name_zh/name_en/aliases_zh/aliases_en lookup).

**Finding: the condition side contributed zero gap candidates.**
`sign_symptom_ids` is present on 76/209 `cond.*` records, and all 34 distinct
values used across those records are literal `sym.*` ids that already
resolve to real existing records — no unresolved ids, no free-text tokens.

**All real demand comes from the tdis side.** `key_manifestations_zh/en`
(free-text parallel arrays, not ids) is present on 41/75 `tdis.*` records
(~200 zh phrases). `key_manifestation_ids` (literal ids) is present on only
3/75 records and is essentially unused. 34/75 tdis records have neither
field — a structural gap noted but out of scope for this batch (would require
tdis-line ownership, not sym-line).

Ranked the ~40 unmatched manifestation phrases (after discarding pure
trigger/timing/relief descriptors and reclassifying genuine near-synonyms of
existing cards as honest matches — e.g. 胃脘疼痛→sym.epigastric_pain,
腰部…疼痛→sym.low_back_pain) by count of distinct tdis.* records referencing
each concept.

**Top demand (built this batch):**

| concept | demand | example tdis refs |
|---|---|---|
| 脅痛 hypochondriac pain | 5 | tdis.xie_tong, tdis.yu_zheng, tdis.mei_he_qi, tdis.tun_suan, tdis.huang_dan |
| 咽痛 sore throat | 4 | tdis.gan_mao, tdis.ke_sou, tdis.ru_e, tdis.bi_yuan |
| 咽癢 throat itch | 3 | tdis.gan_mao, tdis.ke_sou, tdis.bi_qiu |
| 健忘 poor memory | 3 | tdis.jian_wang, tdis.bu_mei, tdis.yu_zheng |
| 不能平臥 orthopnea | 3 | tdis.xiao_bing, tdis.chuan_zheng, tdis.xiong_bi |
| 噴嚏 sneezing | 2 | tdis.gan_mao, tdis.bi_qiu |
| 面色無華 sallow complexion | 2 | tdis.bian_mi, tdis.xu_lao |
| 言語謇澀 slurred speech | 2 | tdis.zhong_feng, tdis.chan_zheng |
| 形體消瘦 wasting | 2 | tdis.xiao_ke, tdis.xu_lao |
| 喉中哮鳴 wheeze/rattle | 2 | tdis.xiao_bing, tdis.chuan_zheng |
| 肢體僵硬 limb stiffness | 2 | tdis.chan_zheng, tdis.bi_zheng |
| 冷汗淋漓 profuse cold sweat | 2 | tdis.xiong_bi, tdis.tong_jing |
| 痞滿 epigastric fullness | 1 | tdis.pi_man |
| 半身不遂 hemiplegia | 1 | tdis.zhong_feng |
| 口眼喎斜 facial deviation | 1 | tdis.zhong_feng |
| 神志不清 altered consciousness | 1 | tdis.zhong_feng |
| 黃疸 jaundice | 1 | tdis.huang_dan |
| 便血 bloody stool | 1 | tdis.zhi_chuang |
| 肛門腫物脫出 rectal prolapse | 1 | tdis.zhi_chuang |
| 肢體關節疼痛 polyarthralgia | 1 | tdis.bi_zheng |
| 肌肉萎縮 muscle atrophy | 1 | tdis.wei_zheng |
| 不能隨意運動 flaccid paralysis | 1 | tdis.wei_zheng |
| 皮膚枯槁 withered skin | 1 | tdis.wei_zheng |
| 聽力減退 hearing loss | 1 | tdis.er_ming_er_long |
| 動作遲緩 bradykinesia | 1 | tdis.chan_zheng |

25 concepts, matching the "top ~25" target.

### 2. 反胃 alias collision — not touched

Confirmed (not fixed, per instructions — pending Ting):
- `sym.nausea.aliases_zh` = `["想吐", "反胃", "噁心感"]`
- `sym.vomiting.aliases_zh` = `["吐", "作嘔", "反胃"]`
Both still carry 反胃 simultaneously. Batch E did not add any new alias that
touches this collision.

### 3. Cards built (77 → 102)

25 new full `sym.*` records, all `review_status: "draft"`,
`safety_review_status` set per-card based on actual sourced red-flag
findings (23 `specific_red_flags_present`, 1 `no_specific_red_flags_identified`
[sym.sneezing, MedlinePlus explicitly states sneezing is rarely serious],
1 `shared_flags_linked` [sym.bradykinesia — no dedicated red-flag escalation
list found in the sourced literature; referenced generic `neurologic_red_flags`
rather than inventing symptom-specific content]).

New ids: `sym.hypochondriac_pain`, `sym.sore_throat`, `sym.throat_itching`,
`sym.poor_memory`, `sym.orthopnea`, `sym.sneezing`, `sym.sallow_complexion`,
`sym.slurred_speech`, `sym.wasting`, `sym.wheezing`, `sym.limb_stiffness`,
`sym.cold_sweating`, `sym.epigastric_fullness`, `sym.hemiplegia`,
`sym.facial_deviation`, `sym.altered_consciousness`, `sym.jaundice`,
`sym.bloody_stool`, `sym.rectal_prolapse`, `sym.polyarthralgia`,
`sym.muscle_atrophy`, `sym.flaccid_paralysis`, `sym.withered_skin`,
`sym.hearing_loss`, `sym.bradykinesia`.

Duplicate-scanned all 25 new ids/name_zh/aliases_zh against the 77 existing
records before writing (script-checked, zero collisions) and against each
other. None are name variants of existing cards.

`taxonomy_ids` assigned per `symptom_taxonomy.json`'s 13 categories;
`tradition` set to `"both"` for all 25 following the template's §1 test
("does biomedicine have a term describing the phenomenon, even informally?")
— every one of the 25 has at least an informal biomedical descriptive term,
even where (e.g. sym.throat_itching, sym.sallow_complexion, sym.withered_skin)
biomedicine has no single unified diagnostic entity for it.

`supporting_measurements` linked only on genuine matches against the 27
`outcome_metrics.json` records: `sym.hypochondriac_pain` → `metric.pain_score`,
`sym.polyarthralgia` → `metric.pain_score`, `sym.limb_stiffness` →
`metric.range_of_motion_deg`, `sym.flaccid_paralysis` →
`metric.range_of_motion_deg`. All other 21 cards left unlinked — no genuine
semantic match exists among the 27 metrics (no weight/confusion/hearing
metric etc.). PGIC was not symptom-anchored anywhere, per instructions.

### 4. Provenance — staged vs. direct-sourced

All 25 cards are **freshly researched this session**, not staged from any
research pack — the RESEARCH_ASSET_INDEX has no symptom-red-flag pack that
covers this specific gap list. Three parallel research subagents (8/8/9
symptom split) gathered clinical definitions and red flags via WebSearch/
WebFetch against MedlinePlus, StatPearls/NCBI Bookshelf, Cleveland Clinic,
NHS, AAO-HNS, and Parkinson's Foundation — every citation carries a real URL
+ "retrieved 2026-08-11" per the R2 evidence convention (`field_sources`
carries the per-field anchor).

**Honesty flags carried into the cards rather than silently resolved:**
- `sym.poor_memory`, `sym.hemiplegia`, `sym.facial_deviation`: Mayo Clinic /
  stroke.org / American Stroke Association pages returned HTTP 403 to direct
  WebFetch (bot protection). Content is corroborated via consistent indexed
  search excerpts of the same real, live URLs, but not personally rendered —
  each card's `safety_review_sources` / `sources` says this explicitly and
  flags it for manual verification rather than claiming full confirmation.
- `sym.limb_stiffness`: an initially-found Mayo Clinic RA page also 403'd; I
  directly re-verified the RA morning-stiffness claim against
  `https://www.nhs.uk/conditions/rheumatoid-arthritis/symptoms/` myself
  (fetched successfully) and used that instead of the unverified Mayo citation.
- `sym.muscle_atrophy`: one MedlinePlus supplementary detail was
  search-summary sourced, not independently re-fetched; flagged in
  `field_sources`.
- `sym.rectal_prolapse`: swapped an unverified PMC review citation for a
  cross-reference to the already-directly-fetched StatPearls Rectal Bleeding
  page (same claim, stronger sourcing).
- `sym.bradykinesia`: no red-flag escalation list exists in the sourced
  literature (Parkinson's Foundation frames it as a diagnostic hallmark, not
  an accompanying-feature list). Rather than inventing one, used
  `safety_review_status: "shared_flags_linked"` → `safety_flags:
  ["neurologic_red_flags"]`, with `red_flags_zh/en` left empty and the gap
  stated explicitly in `field_sources`.
- `sym.sallow_complexion`: no dedicated biomedical source names "sallow" as
  a formal sign; the anemia/liver/thyroid correlation is real (NHS) but the
  term itself is not biomedically formalized. Flagged as the weakest-sourced
  card in the batch rather than presented as equally solid.

### 5. Data corruption spotted, not fixed (out of batch scope)

`sym.headache` (pre-existing, not part of this batch) contains a garbled
mixed-script token in `differentiation_zh[1].distinguishing`: "多有головache
久病或外傷史" (Cyrillic + English fragment mid-Chinese-sentence). Flagged via
`spawn_task` rather than edited directly, since it is outside this batch's id
list and the constitution's file-ownership rule requires staying within the
worklist.

### 6. Validator output (verbatim tails)

```
$ node scripts/build-data.js
...
Built data/generated/knowledge_data.js
{"formulas":224,"herbs":358,"conditions":12,"eastern":6,"patterns":8,"sources":43,"comparisons":41,"symptoms":102,"relation_edges":14,"audit_missing":0}
```

```
$ node scripts/validate-symptom-standard.js --worklist --all
validate-symptom-standard — data/symptoms/symptoms.json
scope: all · 102 records · 102 clean

N3  4 record(s) — red flag "吞嚥困難或吞嚥疼痛 → 需進一步檢查排除食道狹窄…" appears verbatim on 2 records — consolidation candidate. If review agrees it is generic, add it to data/config/generic_red_flag_map.json; do NOT simply reword it. (note only)

PASS — 0 blocking defects.
```

(The N3 note is pre-existing — both verbatim-duplicate lines are on two
records that predate this batch, lines 4939/5125 of the pre-batch file. No
card in this batch reuses that phrase.)

```
$ node scripts/validate-symptom-standard.js --json
{
  "file": "data/symptoms/symptoms.json",
  "scope": "all",
  "records": 102,
  "clean": 102,
  "defects": 0,
  "by_code": {},
  "notes": { "N3": 4 }
}
```

```
$ node scripts/validate-content-junk.js
validate-content-junk: PASS — no scraped header tokens in content arrays.
```

```
$ node scripts/validate-relations.js
...
Relation validation passed.
```
(pre-existing comparisons/crosswalk skeleton warnings in the tail are
unrelated to this batch — no `data/knowledge/comparisons.json` or
`data/interop/condition_crosswalk.json` file was touched)

```
$ node scripts/check-validation-ratchet.js
validation ratchet — defect counts vs committed baseline

  flat     conditions   425
  flat     patterns     0
  flat     tdis         34
  flat     symptoms     0
  flat     naming       1

PASS — no regressions.
```

### 7. Self-diff check

`git diff --stat`: `data/symptoms/symptoms.json` +4066/-2 lines (net pure
addition — the 2 removed lines are inside the two-array-element→three
alignment fixes for `sym.jaundice`/`sym.muscle_atrophy`/`sym.bradykinesia`
aliases_en, each replaced with a longer 3-element array, not shortened) and
`data/generated/knowledge_data.js` regenerated (symptoms count 77→102).
`git diff --check`: clean, no whitespace errors. No existing record's field
was shortened or emptied.

### 8. Ambiguities for Ting

1. Three biomedical entities in this batch actually split one TCM term into
   two distinct biomedical sub-entities (noted in each card's definition,
   not flattened): `sym.wheezing` (wheeze vs. stridor by airway location),
   `sym.limb_stiffness` (Parkinsonian rigidity vs. inflammatory joint
   stiffness), `sym.facial_deviation` (peripheral Bell's palsy vs. central
   stroke-related droop, forehead-sparing as the bedside discriminator).
2. `sym.bradykinesia` has an empty `red_flags_zh/en` by design (see §4) —
   this is intentional honesty, not an oversight; worth Ting's eyes since
   it's the only "shared_flags_linked" card in the batch.
3. `sym.epigastric_fullness` (痞滿) and the pre-existing `sym.abdominal_bloating`
   (腹脹) are adjacent but distinct per TCM convention (epigastric/upper vs.
   general/lower, non-tender fullness vs. distension) — kept separate per
   the gap inventory's own distinction; flag if Ting wants them merged.
4. The 34/75 `tdis.*` records with neither `key_manifestation_ids` nor
   `key_manifestations_zh/en` are a real structural gap but belong to the
   tdis line's ownership, not sym — noted, not touched.

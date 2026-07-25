# Content Pipeline — the one shared process every AI follows

Ting: 「這個流程要系統化，這樣大家在同一個認知裡比較好作業。」

This is the single contract for **how any record (herb, formula, acupoint,
condition, …) gets built and verified.** Read this before generating content,
alongside `docs/AI_ROLES.md` (who does what) and the per-domain schema spec.

---

## 1. Source hierarchy (highest authority first)

| Tier | Source | Role | How to cite |
|---|---|---|---|
| **1** | **`curriculum/`** — Ting's teacher materials | Primary. Aligns to what she is actually examined/taught on. Outranks web sources on disagreement. | `curriculum/<path>#<section>` |
| **1** | **Board exam outline** (NCCAOM / CALE scope) | Defines *which fields matter* and the exam-relevant framing. | name the outline + section |
| **2** | **CloudTCM** (`cloudtcm.com`) | 中文 depth: 性味歸經 / 傳統+現代功效 / 用量 / 炮製 / 化學成分 / 相關方劑 / 可改善疾病 | exact record URL |
| **2** | **American Dragon** (`americandragon.com`) | English clinical depth; **nested** 功效→證型→臨床表現 | page URL |
| **2** | **chinesemedicineatlas** | Glance-layer presentation only (toned pinyin, channel abbrev, plain-English indications) | page URL |
| **3** | Western refs (next sem) | Pathology / pharmacology / red flags, drug–herb interactions | PubMed / textbook + page |

Rule: **extract Tier 1 first, then cross-check/deepen with Tier 2.** Where two
sources disagree, record **both** with attribution — never silently pick one.
Dosage and safety numbers are never invented; if unsourced, leave empty + flag.

## 2. The workflow for every record

1. **Extract** the Tier-1 facts from `curriculum/` (and the exam outline scope).
2. **Cross-check + deepen** against Tier-2 sites, filling the full field spec.
3. **Bilingual, per field** — real 中文 AND English; a `_zh` field with English
   is a defect, not a draft.
4. **Tag** with the native tag arrays (functions_zh, modern_functions_zh, …) for
   filtering; tone-marked pinyin; channel abbreviations.
5. **Cite per field** in `field_sources` (Tier-1 path or URL).
6. **`review_status: "draft"`**, then it enters Ting's review.
7. **Ting verifies in-app (RV1 ✓/!)** → export verdicts →
   `scripts/apply-review-verdicts.js` promotes them to `source_checked`.
   The Quality page 各層進度總表 tracks 製作(made) vs 驗證(verified).

Field-level spec: **`docs/HERB_FORMULA_CARD_SPEC.md`** (herbs + formulas, the
two-layer Glance/Study design). New domains get their own spec doc, same shape.

## 3. Domain roadmap (same pipeline, one at a time)

| Order | Domain | Schema / data home | Status |
|---|---|---|---|
| now | 中藥 Single herbs | `data/herbs/herb_canon_shortlist.json` | filling (made ~98%, verified ~57/266) |
| next | 方劑 Formulas | `data/herbs/formulas.json` | started (~88% made, 0 verified) |
| next | 病症 Conditions (中西病名互標) | `data/pathology/…` | made, 0 verified |
| next | 辨證鑑別 Comparisons (病理 + advanced therapeutics 對照表) | `data/knowledge/comparisons.json` | skeletons |
| then | 擴增穴位: 頭穴 / 耳穴 / 平衡針法 / 運動醫學 / 美容針法 | `data/acupoints/…`, `data/tung/…`, new sets | partial |
| next sem | 西醫 病理 / 藥理 | `curriculum/western/` → `data/pathology/…`, new herb-drug tables | not started |
| next sem | 西醫 Red flags / 轉診 | condition records `red_flags_*` | partial |

## 4. Clinical North Star (fill content *for this purpose*)

Ting practices TCM herbs + acupuncture in the US. Content should serve:
read the **Western diagnosis**, then use TCM to **assist** the patient —
1) **中西藥物相互影響** (herb–drug interactions) — safety first;
2) **針灸 + 西醫治療搭配**，減輕 side effects;
3) 之外再處理**主要症狀**;
4) 長期目標 **治本、調理體質**.

So safety-critical fields (herb–drug interactions, red flags, contraindications,
needling depth) are always priority-review, and every record should connect
toward: pattern → point/herb/formula → Western condition → cautions.

## 5. Boundaries (unchanged, see AI_ROLES.md)

Antigravity generates into `data/` **only** — never `js/`, `app.js`,
`index.html`, `scripts/`, or schema. Those are Claude's. This exists because a
`js/knowledge.js` edit once silently wiped Claude's UI code. Content ↔ code stay
in separate lanes.

# Conditions Interop Design — 中西醫病名對照 × ICD-10/CPT × 病例輸入

Written: 2026-07-12 (Claude, at Ting's request). Status: DESIGN — Ting
approves before any data/UI work starts.

Read together with: docs/CONDITIONS_MODULE_DESIGN.md (the base three-entity
model — this document EXTENDS it, it does not replace it), NORTH_STAR.md
(§2 data law, §6 prohibitions), AGENTS.md (safety rules).

## 1. Goal and hard boundaries

Goal: a bilingual study + documentation layer that connects
中醫病名 ↔ 西醫病名 ↔ 證型 ↔ 病例紀錄, extensible toward ICD-10, CPT and
insurance documentation as Ting's practice matures (H2/H3 horizons).

Hard boundaries (permanent, same spirit as NORTH_STAR §6):

1. This is a **health-adjunct reference and documentation aid** — never
   formal diagnosis. Every rendered surface carries the safety phrases in §8.
2. Mappings are **study/documentation references**, not claims of clinical
   equivalence. 對照 ≠ 等同.
3. Coding fields (ICD-10/CPT) are **documentation hints**, not billing
   truth. Billing-grade coding waits for H2 clinic reality and a compliant
   store (§7).
4. No identifiable patient data in this repo or in exported content — ever.

## 2. Authority sources (中西醫病名對照基礎)

| Layer | Authority | Usage rule |
|---|---|---|
| 中醫病名 ↔ 西醫病名 | 衛生福利部國家中醫藥研究所《中西醫病名對照大辭典》 (MOHW National Research Institute of Chinese Medicine, "Dictionary of Chinese-Western Medicine Disease Name Cross-references") | THE zh-side mapping authority. Record MAPPINGS + per-record entry citation (`dictionary_ref`). Never bulk-copy dictionary prose — copyright; our text stays original. |
| 西醫病名 coding | ICD-10-CM (US NCCAOM/practice context; Taiwan also uses ICD-10-CM since 2016 — one code list serves both) | `icd10[]` structured field, §4. |
| 證型/病名 study content | 中醫內科學/婦科學 textbook level (existing rule) | unchanged from CONDITIONS_MODULE_DESIGN. |
| Future billing | CPT (AMA, licensed) — acupuncture codes 97810/97811/97813/97814 + E/M | RESERVED fields only (§4); no CPT descriptors stored until licensing is sorted. Codes themselves (numbers) are fine as references. |

Source-registry action: add the 大辭典 as a source record in
`data/sources/source_registry.json` (task E-I1) so every `dictionary_ref`
can cite it by source id.

## 3. Architecture: one new layer, nothing rebuilt

The three entities (WesternCondition 150 / TraditionalDisease 75 /
TcmPattern 50) already exist and stay EXACTLY as designed. Interop data
lives in a **sidecar crosswalk layer**, not inside the entity files:

```
data/pathology/condition_canon_shortlist.json   (150 cond.*)   ← unchanged
data/pathology/tdis_registry.json               (75 tdis.*)    ← unchanged
data/pathology/pattern_library.json             (50 pattern.*) ← unchanged
data/interop/condition_crosswalk.json           (NEW: xwalk records)
data/interop/cpt_reference.json                 (NEW, future H2: code list)
data/tags/tag_vocabulary.json                   (as already designed)
```

Why sidecar: coding/insurance data churns on a different cadence than
clinical study content, is jurisdiction-specific, and must be swappable
without touching the 150-condition canon (data law: app replaceable,
data files stable). One crosswalk record per condition id; the entity
files never learn about CPT or insurers.

## 4. Crosswalk schema (資料庫欄位設計 — new fields)

### condition_crosswalk.json record
```
id: "xwalk.<cond slug>"          // stable
condition_id: "cond.<slug>"      // FK → canon shortlist (validated)
icd10: [                         // structured, replaces reliance on icd_hint
  { code: "E28.2", label_en: "", primary: true, note_zh: "" }
]
tcm_dictionary_refs: [           // 《中西醫病名對照大辭典》 mappings
  { tdis_id: "tdis.<slug>",      // FK → tdis_registry (validated)
    dictionary_ref: "",          // entry/page citation in the 大辭典
    direction: "both|w2e|e2w",   // mapping directionality per dictionary
    note_zh: "" }                // nuance, e.g. partial overlap only
]
cpt_placeholder: []              // RESERVED — empty until H2; will hold
                                 //   { code, context_note } refs only
insurance_placeholder: {}        // RESERVED — empty object until H2;
                                 //   future: payer/plan documentation notes
documentation_note_zh: ""        // charting language hints (documentation
                                 //   wording only — never treatment advice)
review_status: "draft"           // same ladder as everything else
sources: []                      // source-registry ids incl. the 大辭典
```

Rules:
- `condition_id` and every `tdis_id` MUST exist (validate-relations
  extension — same pattern as tag integrity).
- `icd_hint` on the canon shortlist stays (cheap display); the crosswalk
  `icd10[]` is the structured truth. A validator warns when they disagree.
- Empty `cpt_placeholder` / `insurance_placeholder` are REQUIRED to exist
  in every record from day one — that is what "預留" means here: the
  schema is fixed now so future fills never need a migration.
- The existing `related_eastern_diseases[]` on canon records remains the
  quick study link; `tcm_dictionary_refs[]` is the AUDITED subset with a
  dictionary citation. E-I3 reconciles the two (they should converge).

### tdis_registry addition (one optional field, additive)
```
dictionary_ref: ""   // the 大辭典 entry citation for this 中醫病名 itself
```
Additive optional field = allowed without migration per AGENTS.md.

## 5. 症狀輸入表單欄位 (symptom intake — extends the case form)

The case/SOAP form already captures chief complaint, HPI, menstrual
history, tongue/pulse, etc. The intake extension adds STRUCTURED fields
so cases connect to the conditions layer (this is what powers M3
suggestions and future insurance documentation):

```
intake_structured: {
  symptom_tags: []            // tag ids from tag_vocabulary (multi-select)
  body_regions: []            // controlled list reused from point regions
  onset: ""                   // free text + date
  severity_0_10: null
  aggravating_zh: "", relieving_zh: ""
  red_flag_screen: [          // auto-generated from the red_flags[] of
    { flag_zh: "", present: false, action_note: "" }   //  every suspected condition
  ]
  suspected_conditions: []    // cond ids (picker with zh/en search)
  suspected_tdis: []          // tdis ids
  suspected_patterns: []      // pattern ids
  icd10_draft: []             // optional, copied from crosswalk on pick —
                              //   documentation draft, label "非請款依據"
}
```

Behavior rules:
- Picking a suspected condition AUTO-SURFACES its red_flags as a
  mandatory screen checklist — the safety design IS the form design.
- All pickers search bilingual (name_zh, name_en, aliases, pinyin).
- Everything remains editable free text alongside — structure assists,
  never blocks, real charting.
- UI wiring happens only after Phase 2 merge (app.js freeze) and is a
  [CLAUDE design → CODEX build] item like other form work.

## 6. Superseding the old 12-condition file (and its 亂碼)

Current state: `data/pathology/conditions.json` (12 records + 6/9/8
eastern/pattern stubs) is what the APP renders today; it predates Track E
and contains 9 mojibake `name_zh` strings (6 fertility-context condition
names + 3 pattern names), duplicated in `condition_graph_expansion.json`.
The new Track E files are clean — the damage is ONLY in the legacy pair.

Two-step plan:

1. **Immediate gated repair (E-I0)**: guarded script
   `scripts/repair-mojibake-pathology.js` (verify-current-value →
   dry-run preview → Ting approves replacement table → `--apply` →
   provenance stamp). Replacement table in §6.1. The originals are NOT
   git-recoverable (B1 triage: git-recoverable=0), so these are
   re-authored labels, which is why Ting's approval is the gate.
2. **Migration (E6, later)**: when conditionGraph UI rewires to the canon
   150, `conditions.json` becomes a legacy file (kept, marked superseded
   in DATA_MIGRATION_MAP) — no deletion without Ting's approval.

### 6.1 Proposed replacement table (Ting approves each line)

| file(s) | record id | name_en (intact) | damaged | proposed name_zh |
|---|---|---|---|---|
| both | western_condition.insulin_resistance | Insulin Resistance Context | ????????? | 胰島素阻抗背景 |
| both | western_condition.male_factor_context | Male Factor Context | ???????? | 男性因素不孕背景 |
| both | western_condition.ovulatory_factor_context | Ovulatory Factor Context | ???????? | 排卵因素不孕背景 |
| both | western_condition.ivf_cycle | IVF Cycle Context | ???????? | 試管嬰兒療程背景 |
| both | western_condition.embryo_transfer | Embryo Transfer Context | ???????? | 胚胎植入背景 |
| both | western_condition.luteal_support | Luteal Support Context | ???????? | 黃體期支持背景 |
| both | pattern.damp_heat | Damp-Heat | ?? | 濕熱 |
| both | pattern.yin_deficiency | Yin Deficiency | ?? | 陰虛 |
| both | pattern.blood_deficiency | Blood Deficiency | ?? | 血虛 |

The three pattern names are standard TCM terms (2 chars ↔ 2 `?` — exact).
The six condition labels are re-authored; 背景 renders name_en "Context"
consistently. IDs never change; only display text.

## 7. HIPAA 與隱私處理注意事項

Current legal reality: single-user local study tool, de-identified
training encounters, no server → HIPAA covered-entity obligations do not
attach yet. But the DESIGN treats HIPAA as the target so H2 needs no
rework:

1. **De-identification checklist = the 18 HIPAA identifiers.** Nothing in
   the repo or exports may contain: names, addresses below state, dates
   (except year) tied to a person, phone/fax, email, SSN/MRN/insurance
   member IDs, account numbers, license/vehicle/device IDs, URLs/IPs,
   biometrics, face photos, or any unique identifying attribute.
   `patient_code` pseudonyms only (already AGENTS.md law).
2. **Insurance fields store codes and plan-type context only** — never
   member IDs, group numbers, or claims — until a compliant store exists.
3. **localStorage is practice-notes-grade only** (NORTH_STAR H2 debt).
   Before real patients: durable local store with (a) export discipline,
   (b) encryption at rest, (c) backup + retention plan, (d) access
   logging if ever multi-device.
4. **Any future sync/cloud step requires a BAA-capable vendor** — that is
   the trigger line in NORTH_STAR §4 ("multi-device write → small server
   + auth"), now with the compliance rider attached.
5. **AI processing rule**: no PHI is ever sent to any AI service. Agents
   work on the knowledge base and de-identified structures only. Case
   content stays local.

## 8. AI 回答格式模板 + 安全提示語

### 8.1 Standard answer template (for any AI-generated study answer
rendered in or exported from the system)

```
【中醫觀點 TCM view】     病名(tdis) + 證型鑑別 (pattern ids + one-line notes)
【西醫語境 Western context】 documentation language only ("commonly managed
                          with…", never "treat with…")
【對照 Crosswalk】        cond ↔ tdis mapping + dictionary_ref + icd10 hint
【紅旗 Red flags】        the condition's red_flags[], verbatim, always shown
【來源 Sources】          source ids + review_status label (draft /
                          needs_source_review / source_checked)
【安全提示 Safety】        fixed phrase block below, never truncated
```

Rules: every block labels its status; missing data says 待補/pending, is
never invented (AGENTS.md law); no dosage or needling instructions phrased
as directives, anywhere.

### 8.2 Fixed safety phrases (安全提示語 — wording is canon; copy verbatim)

zh: 「本內容為學習與文件紀錄參考，非醫療診斷、治療建議或請款依據。
症狀惡化、出現紅旗徵象或緊急狀況，請立即就醫。」

en: "Study and documentation reference only — not medical diagnosis,
treatment advice, or a billing determination. Seek immediate medical care
for red-flag signs, worsening symptoms, or emergencies."

Red-flag line template:
zh: 「⚠ 紅旗徵象：{flag}。此情況需優先轉介/就醫評估。」
en: "⚠ Red flag: {flag}. Prioritize medical referral/evaluation."

## 9. Build order + Codex progress protocol

Order (plugs into EXECUTION_PLAN Phase 3; E-I tasks interleave with E3
fills; nothing here unblocks 現代應用 content early — Ting's dependency
rule stands):

| # | Task | Owner | Gate |
|---|---|---|---|
| E-I0 | Mojibake repair via guarded script (§6.1 table) | CODEX (script exists, dry-run verified) | Ting approves table |
| E-I1 | 大辭典 source-registry record + citation policy note | CODEX | none (additive) |
| E-I2 | `data/interop/condition_crosswalk.json` skeleton: 150 records, icd10[] seeded from icd_hint, empty placeholders present | CODEX | Ting approves this design |
| E-I3 | `tcm_dictionary_refs` fill batches (category order, gyn first) citing the 大辭典 entry by entry; reconcile with related_eastern_diseases | CODEX + Ting has the dictionary | per-batch review |
| E-I4 | validate-relations extension: crosswalk FK integrity + icd_hint/icd10 agreement warning | CODEX | none |
| E-I5 | Intake form structured fields (§5) | CLAUDE design done here → CODEX build | after Phase 2 merge (app.js freeze lifts) |
| E-I6 | conditionGraph UI reads canon 150 + crosswalk; conditions.json marked superseded | CODEX (UI in knowledge.js area) | after E3 gyn batch renders |

Progress tracking (so Ting never has to ask "where are we"):
- Every E-I/E task ends with: validators green → `docs/CODEX_TASK_STATUS.md`
  row updated (the overlay Codex already maintains) → `docs/CODEX_HANDOFF.md`
  entry. That pair IS the progress dashboard.
- Batch tasks (E-I3, E3) additionally keep a per-category checklist table
  inside CODEX_TASK_STATUS (gyn 25 → msk 30 → …) with counts done/total.

## 10. Gates summary (what Ting must approve, in order)

1. This design document (structure + schemas + §8 wording).
2. §6.1 replacement table → then E-I0 `--apply` runs.
3. E-I2 skeleton output (spot-check 5 records).
4. Each E-I3/E3 fill batch, per existing batch-review flow.

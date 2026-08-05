# Antigravity Output Validation Protocol

Status: active QA protocol for Codex after Antigravity bulk generation.

Purpose: Antigravity can generate large batches quickly, but validator PASS does not prove there was no content loss, field collapse, or source overclaim. Codex must verify generated batches before reporting them as usable.

## 1. Required validation layers

### V0 — Scope and source-map check

- Identify the changed domain: acupoints, herbs, formulas, conditions, UI, or generated data.
- Confirm which records changed.
- Confirm no protected files were touched unless the task explicitly allowed it.
- Treat untracked curriculum files as source uploads, not app data, unless Ting asks to import them.

### V1 — Standard validators

Run the relevant validators, but do not stop there.

- Acupoints: `validate-acupoint-standard.js --worklist --all`
- Herbs: `validate-herb-standard.js`, `validate-content-junk.js`, `validate-herb-card-schema.js` when applicable
- Formulas: `validate-formula-standard.js`, `validate-formula-song.js` when applicable
- UI/navigation: `validate-interactions.js`
- Always run `build-data.js` after data changes and never hand-edit `data/generated/*`.

### V2 — Content-loss audit

Claude rule: validator PASS is not enough.

For every Antigravity batch, Codex must inspect the diff or compare against the pre-batch commit for:

- previously non-empty fields becoming empty;
- long content replaced by shorter generic content;
- safety/contraindication fields overwritten by needling/action text;
- `actions` mixed with `indications`;
- modern applications or pharmacology deleted instead of moved to the correct field;
- `_zh` and `_en` arrays becoming misaligned;
- source URLs added without evidence that the page was actually checked;
- exact source links replaced by generic domain links.

If a field is wrong-layered, move it first, then replace the original field. Do not delete first.

### V3 — Exam Core source hierarchy

Every refined card must have a structured exam layer. Source priority:

Use the correct source lane for the domain. Do not mix herb/formula sources with acupoint sources.

For herbs and formulas:

1. NCBAHM / board outline — decides board scope, exam status, Appendix A/B/C membership, named high-yield herbs/formulas, and required herb pairs.
2. Chenoweth / course curriculum — primary content authority for actions, indications, formula analysis, role hierarchy, exam pearls, classroom emphasis, and source page numbers.
3. American Dragon — English clinical detail, pairings, cautions, comparisons, and safety notes when the exact page is confirmed.
4. CloudTCM — Chinese clinical depth and exact record links when the exact page is confirmed by name.
5. eLotus is not a routine herb/formula source. Do not cite eLotus on herbs/formulas unless Ting explicitly provides or approves an exact relevant page.

For acupoints:

1. NCBAHM / board outline — decides board scope, exam status, and priority.
2. Chenoweth / course curriculum — primary content authority for functions, indications, point identity, exam pearls, and class emphasis.
3. eLotus — supplement location, needling, anatomical safety, and visual/detail support when the exact point page is confirmed.
4. American Dragon — supplement point functions, indications, location, cautions, and comparison detail when the exact point page is confirmed.
5. CloudTCM — supplement Chinese clinical depth, indications, and exact point-page links when the exact point page is confirmed.
6. External point sources do not override the board outline or course material; when sources disagree, keep both and label the source difference.

Required rule: if an external source is not actually reviewed, do not list it as a source. Use `待補 / not reviewed` rather than a guessed URL.

### V4 — Structured enrichment checklist

When Codex finds a weak Antigravity card, fix the card according to its template instead of only logging the defect.

For acupoints:

- exam pearl / board focus;
- functions and indications separated;
- needling, moxa, safety, contraindications;
- source links: eLotus, American Dragon, and CloudTCM only if exact point pages are confirmed;
- point identity and comparison notes.

For herbs:

- name header: Chinese, pinyin, common English name, Latin line;
- actions and indications separated and bilingual;
- properties vs channels kept separate;
- dose ranges with source differences preserved;
- contraindications vs cautions separated;
- modern pharmacology only if source-backed;
- NCBAHM Appendix B / AD / curriculum pairings.

For formulas:

- composition with herb IDs when local cards exist;
- chief/deputy/assistant/envoy roles with dose and role rationale;
- actions and indications bilingual and aligned;
- tongue/pulse and pattern differentiation;
- formula family and related formulas;
- exam pearl based on outline + course;
- cautions/contraindications, toxicity, pregnancy, US clinical restrictions.

### V5 — Report exact counts

Final reports must use exact numbers, not “100% done” unless the count and validator are named.

Example acceptable wording:

- “Acupoints: `validate-acupoint-standard.js --worklist --all` reports 361/361 template-grade, 0 worklist defects.”
- “Herbs: 327 cards exist, 304/304 NCBAHM Appendix A coverage, but only 79 template-grade per current quality layer.”
- “Formulas: 201 records; formula-standard validator PASS/FAIL with exact defects listed.”

## 2. Current active findings as of 2026-08-01

- Antigravity acupoint claim was rechecked by Codex: `validate-acupoint-standard.js --worklist --all` PASS, 361/361 template-grade, 0 worklist defects.
- Quality data was stale at 97/361 and was corrected to 361/361. Verified remains 1 because RV1 is Ting/manual review only.
- Formula validator initially failed F7 on three formulas because too many herbs were tagged as Chief:
  - `formula.an_gong_niu_huang_wan`
  - `formula.zi_xue_dan`
  - `formula.fang_feng_tong_sheng_san`
- Codex corrected only the role hierarchy for those three formulas, preserved composition and dose, added source notes, rebuilt generated data, and `validate-formula-standard.js` now passes with 0 blocking defects.

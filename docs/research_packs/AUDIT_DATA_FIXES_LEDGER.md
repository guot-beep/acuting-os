# Audit Data Fixes Ledger — INDEPENDENT_AUDIT_2026-08-11 data-quality section

Branch: `codex/audit-data-fixes` off `origin/codex/pattern-v2` (includes `602e075`).
Source: `docs/INDEPENDENT_AUDIT_2026-08-11.md`, Dimension 3 + TOP-10 items #6 and #9.

---

## Fix 1 — mojibake (3 characters fixed, all confirmed unambiguous or honestly marked)

### 1a. `data/herbs/formulas.json` line 40475 — `formula.si_wu_tang.modifications_zh[1]` — AMBIGUOUS, marked honestly

Before:
> "...若有氣虛的症狀，可以加人參、黃芪`<U+FFFD><U+FFFD>`藥物來補氣並幫助生血..."

After:
> "...若有氣虛的症狀，可以加人參、黃芪〔字損〕藥物來補氣並幫助生血..."

Two consecutive U+FFFD sit between "黃芪" and "藥物". Meaning is clear either way
("medicines such as ginseng and astragalus"), but the *exact* missing
character is genuinely ambiguous between at least two equally plausible
single-character connectors ("等" / "類") — neither has any other occurrence
in this corpus in the same sentence shape (`X、Y[?]藥物`) to disambiguate by
local convention, and `git log --all -p -- data/herbs/formulas.json` shows
the corruption present since the string was first introduced (no clean
prior revision to recover from). Per instructions: replaced with the honest
gap marker `〔字損〕` rather than guessed. Not a dosage/toxicity field (red
line 4 does not apply), but still didn't want to invent a Chinese character.

### 1b. `data/herbs/formulas.json` line 57625 — `formula.tian_wang_bu_xin_dan.pattern_indications_zh[4]` — UNAMBIGUOUS, fixed

Before:
> "由於`<U+FFFD><U+FFFD>`舌為心之苗」，心陰不足時，體內陰虧血少、虛熱內擾而陰虛火旺，所以舌紅少苔、脈細而數。"

After:
> "由於「舌為心之苗」，心陰不足時，體內陰虧血少、虛熱內擾而陰虛火旺，所以舌紅少苔、脈細而數。"

"舌為心之苗" (the tongue is the sprout/offshoot of the Heart) is a fixed,
extremely well-known TCM proverb, always quoted with brackets. The corrupted
line has the closing 」 but not the opening 「 — the 2 U+FFFD sit exactly
where the opening bracket belongs. Confirmed unambiguous two ways:
(1) `git log --all -p -- data/herbs/formulas.json` surfaces another, distinct
sentence in this file's history using the identical convention:
"古人認為「舌為心之苗」，當心臟的火氣太盛時..." — same idiom, same brackets.
(2) the phrase is a standard TCM classic-text quotation with no plausible
alternative reading. Fixed to 「.

### 1c. `data/herbs/herb_canon_shortlist.json` line 17904 — `herb.huo_ma_ren.modern_functions_detail_zh[0].analysis_zh` — UNAMBIGUOUS, fixed

Before:
> "...火麻仁蛋白能顯著提升巨噬細胞（M`ф`）的吞噬能力..." (Cyrillic ф, U+0444)

After:
> "...火麻仁蛋白能顯著提升巨噬細胞（Mφ）的吞噬能力..." (Greek φ, U+03C6)

"Mφ" (M-phi) is the standard biology abbreviation for macrophage
(巨噬細胞). The Cyrillic "ф" (U+0444) is visually near-identical to Greek
"φ" (U+03C6) in most fonts — classic homoglyph mojibake, almost certainly
from a copy/paste or OCR step that substituted the wrong Unicode block.
Fixed to the correct Greek letter.

**Not found**: no U+FFFD or Cyrillic character remains anywhere in either
file after these 3 fixes (verified by full-file scan, see Fix 2 below —
the same scan now runs in CI).

---

## Fix 2 — `scripts/validate-content-junk.js` extended (two new checks)

### 2a. Encoding anomaly check (blocking, exit 1)

Recursively walks every record in the 5 files already in `CONTENT_FILES`
(`herb_canon_shortlist.json`, `formulas.json`, `361.json`,
`condition_canon_shortlist.json`, `pattern_library.json`). Once traversal
enters a key ending in `_zh` (at any depth — covers nested shapes like
`modern_functions_detail_zh[].analysis_zh`, not just top-level arrays),
every string leaf underneath is checked for:

- **U+FFFD** — always flagged. Unambiguous decode failure, no legitimate use.
- **Cyrillic (U+0400–U+04FF)** — always flagged. Zero legitimate use in this
  Traditional/Simplified Chinese medical corpus; this is exactly the defect
  class that produced the `ф`/`φ` bug in 1c above.

Before the Fix-1 edits: 4 live U+FFFD (formulas.json) + 1 live Cyrillic
(herb_canon_shortlist.json) — reproduced with a throwaway copy of the
pre-fix files, see "Verification" below. After Fix 1 + this extension:
**0 findings**, so making both checks *blocking* introduces no regression
(confirmed with `node scripts/validate-content-junk.js`, exit 0).

**Greek (U+0370–U+03FF) is deliberately NOT flagged.** This corpus uses
Greek letters extensively and correctly for pharmacology notation — verified
490 real instances across just `herb_canon_shortlist.json` (475) and
`formulas.json` (13) alone, e.g. `TNF-α`, `IL-1β`, `γ-胺基丁酸(GABA)`,
`α-葡萄糖苷酶`, `β受體`, `μL`. I tried two adjacency heuristics before
concluding a Greek check has no signal here:
- ±6-character window containing Latin/digit → still 177 false positives
  in `herb_canon_shortlist.json` alone (things like `β細胞`, `α受體`,
  `γ-胺基丁酸` where the nearest Latin token is outside the window or
  absent entirely — that's the *normal* way this corpus writes about
  receptors/cytokines, not an anomaly).
- Latin/digit anywhere in the whole containing string → still 42–43 false
  positives (e.g. `herb.zi_su_ye`, `herb.shi_gao`, `cond.parkinsons`
  "α-突觸核蛋白" = alpha-synuclein, all legitimate).
- Zero true positives found by either heuristic beyond the Cyrillic case
  already caught above.

Decision: flagging Greek would be pure noise (0 signal / 40+ false
positives per file) and would train whoever runs this validator to ignore
its warnings — worse than not checking at all. Documented in the script's
header comment. If a future incident specifically confuses Greek letters,
it needs a narrower signal (a known-confusable character list, e.g. Cyrillic
у/х/р/е/о/с/а impersonating Latin — but that's exactly what the Cyrillic
check already catches) — not a blanket "any Greek" rule.

### 2b. Shared-verbatim-dosage detector (warn-only, exit 0)

Scans every string field of every record (not scoped to `_zh` — the hit
field, `clinical_use_note`, is not `_zh`-suffixed) for a dosage-range clause
matching `\d+(\.\d+)?g[～~-]\d+(\.\d+)?g[^。]*。` (captures from the numeric
range through the end of that sentence), groups identical clauses across
records, and warns (does not fail the build) on any clause shared by ≥10
distinct record ids.

Current result: **1 clause, 58 records** — exact match to the audit's
count. Two slightly different lead-in phrases both reduce to the same
verbatim tail:

- `"順天堂濃縮顆粒（官網：https://www.sunten.com.tw/）參考成人日服量：6.0g～12.0g，分次開水送服。"`
- `"順天堂濃縮顆粒（官網：https://www.sunten.com.tw/）成人每日服用參考：6.0g～12.0g，分次開水送服。"`

— both end in the byte-identical clause `"6.0g～12.0g，分次開水送服。"`,
which is what the detector groups on.

**58 formula ids (future per-formula dosage sourcing batch, NOT edited this
batch per instructions):**

```
formula.xiang_su_san, formula.jing_fang_bai_du_san, formula.chai_ge_jie_ji_tang,
formula.ge_gen_tang, formula.sheng_ma_ge_gen_tang, formula.cang_er_zi_san,
formula.ren_shen_bai_du_san, formula.jia_jian_wei_rui_tang, formula.xie_xin_tang,
formula.liang_ge_san, formula.xie_bai_san, formula.yu_nv_jian, formula.shao_yao_tang,
formula.bai_tou_weng_tang, formula.qing_gu_san, formula.dang_gui_liu_huang_tang,
formula.liu_yi_san, formula.wu_wei_xiao_du_yin, formula.qing_wen_bai_du_yin,
formula.zeng_ye_cheng_qi_tang, formula.da_huang_mu_dan_tang, formula.run_chang_wan,
formula.ji_chuan_jian, formula.chai_hu_gui_zhi_tang, formula.fu_zi_li_zhong_wan,
formula.huang_qi_jian_zhong_tang, formula.shen_fu_tang, formula.xiang_sha_liu_jun_zi_tang,
formula.ren_shen_yang_rong_tang, formula.jiao_ai_tang, formula.shi_quan_da_bu_tang,
formula.taishan_pan_shi_san, formula.zuo_gui_yin, formula.you_gui_yin,
formula.qi_ju_di_huang_wan, formula.zhi_bai_di_huang_wan, formula.shen_qi_wan,
formula.jin_suo_gu_jing_wan, formula.sang_piao_xiao_san, formula.suo_quan_wan,
formula.shou_tai_wan, formula.chai_hu_jia_long_gu_mu_li_tang,
formula.gua_lou_xie_bai_ban_xia_tang, formula.ju_pi_zhu_ru_tang,
formula.ge_xia_zhu_yu_tang, formula.shao_fu_zhu_yu_tang, formula.shen_tong_zhu_yu_tang,
formula.er_miao_san, formula.si_miao_wan, formula.shi_pi_yin,
formula.ling_gui_zhu_gan_tang, formula.san_zi_yang_qin_tang, formula.xiao_huo_luo_dan,
formula.sang_xing_tang, formula.sha_shen_mai_men_dong_tang, formula.zhi_sou_san,
formula.zi_xue_dan, formula.yang_he_tang
```

**Not fixed this batch** (per task instructions — needs real per-formula
sourcing from curriculum, not a script edit). Field: `clinical_use_note` on
each of the 58 `formula.*` records in `data/herbs/formulas.json`.

Why warn, not blocking: making this blocking would fail CI on 58 pre-existing
records with no code-only remedy available this batch (the fix requires a
curriculum-sourced content batch, out of scope here) — exactly the case the
task flagged as "warn-level is fine if blocking would regress [something]".
It doesn't touch `check-validation-ratchet.js`'s tracked baseline (content-junk
is a standalone GREEN gate, not one of the ratcheted layers), so this is a
pure severity choice, not a ratchet workaround.

---

## Verification (numbers, reproducible)

```
node scripts/build-data.js                    → exit 0
node scripts/validate-formula-standard.js      → 10 blocking defects (unchanged from
                                                  audit-cited baseline — F5/F6/F7/F8/F12,
                                                  "誠實記帳", pre-existing, out of scope)
node scripts/validate-herb-standard.js         → PASS — no structural defects.
node scripts/validate-content-junk.js          → before Fix 1: 4 U+FFFD (formulas.json)
                                                  + 1 Cyrillic (herb_canon_shortlist.json)
                                                  after Fix 1 + Fix 2: 0 junk tokens,
                                                  0 encoding anomalies (blocking, exit 0);
                                                  1 dosage clause × 58 records (warn, exit 0)
node scripts/check-validation-ratchet.js       → PASS — no regressions (conditions 294,
                                                  patterns 0, tdis 0, symptoms 0, naming 1 —
                                                  all pre-existing baselines, untouched)
node scripts/validate-relations.js             → exit 0 (pre-existing warnings unrelated
                                                  to this batch — condition_crosswalk icd10
                                                  mismatches, comparison skeletons)
git diff --check                               → clean, no whitespace errors
```

Blocking-path test (not committed): temporarily injected one U+FFFD and one
Cyrillic string into a scratch copy of `formulas.json`, confirmed
`validate-content-junk.js` reports both with file/id/field/type and exits 1,
then restored the real file from a backup and re-ran clean (exit 0) before
committing anything.

## Files touched this batch

- `data/herbs/formulas.json` — 2 mojibake fixes (lines 40475, 57625)
- `data/herbs/herb_canon_shortlist.json` — 1 mojibake fix (line 17904)
- `data/generated/knowledge_data.js` — rebuilt via `node scripts/build-data.js`
  (generated file, content hash changed to reflect the 3 source fixes)
- `scripts/validate-content-junk.js` — extended with encoding-anomaly
  (blocking) and shared-verbatim-dosage (warn) checks
- `docs/research_packs/AUDIT_DATA_FIXES_LEDGER.md` — this file

`curriculum/**` untouched (read-only per constitution; also currently shows
as deleted in `git status` from an unrelated pre-existing working-tree state
— not touched or restored by this batch, out of scope).

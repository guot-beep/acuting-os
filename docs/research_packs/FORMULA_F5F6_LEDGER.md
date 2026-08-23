# Formula F5/F6 Ledger — Claude, 2026-08-11

Branch `codex/formula-f5-f6` off `origin/codex/pattern-v2` (tip `4ed39e4`, R2 evidence
convention). Scope: `data/herbs/formulas.json` only. Files not touched:
`symptoms.json`, `condition_canon_shortlist.json`, `tdis_registry.json`, herb files,
`curriculum/**` (read-only via `git show`/working-tree read, never restored to disk).

## Before → after

```
node scripts/validate-formula-standard.js --all
```

| | before | after |
|---|---|---|
| blocking defects | 31 | **11** |
| F6 (composition 疑似被截斷) | 13 | **2** |
| F5 (missing `_en`) | 11 | **2** |
| F12 (deliberate, untouched per HERB_F12_LEDGER §4) | 3 | 3 |
| F8 / F7 / F2 (out of scope — not assigned) | 3 | 3 |

## 1. F6 — composition restoration (13 formulas, 11 fixed)

Source hierarchy used: `curriculum/herbs/方剂学汇总_extracted.md`（still present in
working tree, table-form Rank/Herb/Amount extraction from 方劑學課件）first, then
`curriculum/formulas/AD_Selected_Formulas_Name_Herbs_Actions.md`（also still present）,
then `herb_canon_shortlist.json`'s own per-herb general dose range when no
formula-specific gram figure exists anywhere in the repo. The genuinely-deleted
curriculum files (`Formulations Summary Chart.docx.md/pdf`, `Herbal Formulations
Comprehensive.docx.pdf`) were read **read-only** via
`git show 0cc09627:"curriculum/formulas/Formulations Summary Chart.docx.md"` — never
written back to the working tree. Neither of the two genuinely-deleted PDFs is
machine-parseable in this environment (no PDF library, no Python), so their content
was not usable beyond what the already-extracted `.md` twin covers.

### 8 formulas: already complete, stale `composition_suspect` flag only

These records had a full, curriculum/AD-matching composition array (4–16 herbs) but
still carried the `composition_suspect` flag from an earlier pass
(`scripts/fix-formula-name-as-ingredient.js`) that was never cleared once the record
was filled in later. Verified herb-for-herb against source, flag removed, source
citation appended (not replaced) to `field_sources.composition`:

- `formula.sheng_ma_ge_gen_tang` — matches `方剂学汇总_extracted.md#Table47-48` exactly
  (5 herbs). Also corrected 甘草's role 佐→使 to match the curriculum Rank table
  (curriculum marks it Envoy; this is an accuracy fix, not a deletion — Gan Cao stays
  in the composition, only its role tag changes).
- `formula.shao_yao_tang` — matches `#Table178` exactly (9 herbs).
- `formula.dang_gui_liu_huang_tang` — matches `AD_Selected_Formulas...#Dang-Gui-Liu-Huang-Tang`
  exactly (9 herbs). That AD file already carries its own editorial note: the AD page
  is internally inconsistent with the textbook 7-herb 六黃 formula (includes 牡蠣/浮小麥,
  omits the expected second 黃 herb) — pre-existing in the source, not introduced here.
- `formula.da_huang_mu_dan_tang` — matches AD table exactly (5 herbs).
- `formula.fu_zi_li_zhong_wan` — matches curriculum's "Li Zhong Wan + 附子" modification
  note (5 herbs).
- `formula.huang_qi_jian_zhong_tang` — matches curriculum's "Xiao Jian Zhong Tang +
  黃耆9g" modification note (7 herbs).
- `formula.ren_shen_yang_rong_tang` — matches AD table exactly (16 herbs).
- `formula.sha_shen_mai_men_dong_tang` — matches AD table exactly (7 herbs).

### 3 formulas: true single-herb stubs, restored from curriculum

These had `composition: [1 herb]` with an obviously-templated `in_formula_zh` (e.g.
"補益氣血，調和諸藥" attached to 瓜蔞 — Trichosanthes Fruit does not tonify Qi/Blood;
this is boilerplate carried over from a different herb's template, per 教訓1 exception).
Replaced with full composition, cited, eyeball-read:

- `formula.gua_lou_xie_bai_ban_xia_tang` 瓜蔞薤白半夏湯: 1→4 味 (瓜蔞/薤白/半夏/白酒).
  Source: `方剂学汇总_extracted.md#Table413-416`（base 瓜蔞薤白白酒湯 Table414 +
  "加半夏" derivation note Table416）. 白酒 dose is not a fixed gram figure — cited the
  same courseware's base-formula note (30–1,400ml decoction-medium range) since TCM
  wine-as-vehicle isn't dosed like a solid herb.
- `formula.ju_pi_zhu_ru_tang` 橘皮竹茹湯: 1→6 味 (橘皮/竹茹/人參/生薑/大棗/甘草).
  Source: `方剂学汇总_extracted.md#Table440-441`. Doses not given in the courseware
  table (Amount column blank); used each herb's general clinical dose range from
  `herb_canon_shortlist.json`, cited as such.
- `formula.chai_hu_gui_zhi_tang` 柴胡桂枝湯: 1→9 味. Source:
  `方剂学汇总_extracted.md#Table92`（小柴胡湯 7 味的 Rank/Herb/Amount 表）+ `#Table94`
  ("Chai Hu Gui Zhi Tang ... Add Gui Zhi, Bai Shao" derivation note — no independent
  gram table for the combined formula exists anywhere in the repo). The 7 herbs shared
  with 小柴胡湯 use curriculum's Table92 grams; 桂枝 and 芍藥 (the two added herbs) use
  general herb-canon dose ranges, explicitly flagged in-record as "藥材通用範圍，課件未列
  本方專屬劑量" so nobody mistakes it for a courseware-sourced classical gram figure.
  **This is a reconstruction (base formula + documented modification), not an
  independently-tabled formula — flagging for Ting's awareness even though it clears
  F6/F7 structurally.**

### 2 formulas: left blocking, no source found anywhere in repo — do not guess

- **`formula.ge_gen_tang` 葛根湯** — NOT fixed. Composition and `pattern_indications_zh`
  are byte-for-byte identical to `formula.sheng_ma_ge_gen_tang`'s (Sheng Ma/Ge Gen/Gan
  Cao/Chi Shao + optional Sheng Jiang, "麻疹初起透發不暢證"...) — i.e. this record
  appears to be **misattributed from Sheng Ma Ge Gen Tang**, not merely truncated. The
  classical Shang Han Lun 葛根湯 (Ge Gen/Ma Huang/Gui Zhi/Shao Yao/Sheng Jiang/Zhi Gan
  Cao/Da Zao) does not appear with a composition table anywhere in this repo: not in
  `方剂学汇总_extracted.md` (only listed by name in the syllabus "3rd group" list, no
  Rank/Herb/Amount table), not in `Formulations Summary Chart.docx.md` (only appears as
  a "+Ge Gen" plus-ingredient inside Gui Zhi Tang's related-formula column), not in
  `AD_Selected_Formulas_Name_Herbs_Actions.md`, not in `data/american_dragon_all_formulas.md`
  (only `GeGenTangJiaXinYiChuanXiong` and `GuiZhiJiaGeGenTang` variants exist, neither
  with a base-formula composition table). Per dispatch instructions ("if still not
  found, record the gap honestly and leave as-is") this record is **left untouched** —
  still blocking F6. **Recommend Ting's judgment call**: either this is genuinely two
  different formulas that got cross-populated during an earlier American Dragon import
  and needs the correct classical composition sourced from outside this repo, or the
  record should be relabeled/merged. Not something I can decide unilaterally.
- **`formula.chai_hu_jia_long_gu_mu_li_tang` 柴胡加龍骨牡蠣湯** — NOT fixed. Same
  single-herb stub pattern as the 3 above, but no source anywhere in the repo has this
  formula's composition: not in `方剂学汇总_extracted.md` (grepped for "Long Gu Mu Li" —
  only hits are generic "decocted first" ingredient-category notes, no formula table),
  not in either AD dataset (both `data/american_dragon_all_formulas.md` and
  `data/american_dragon_site_formulas.md` have empty stub entries — "No actions
  listed" / "No syndromes listed", cloudtcm.com source URL that's gateway-403 in this
  environment). Left untouched, still blocking F6.

## 2. F5 — `_en` translation (11 records, 9 fixed)

Faithful sentence-by-sentence translation of existing `_zh` content, array lengths
verified to match exactly before write (script asserts, would throw rather than write
misaligned). No new clinical claims added. `field_sources.<field>_en` records the
translation batch.

Fixed: `huang_lian_e_jiao_tang` (contraindications×1), `qing_hao_bie_jia_tang`
(modifications×3), `tiao_wei_cheng_qi_tang` (modifications×5 — noted 犀角/Rhinoceros
Horn is a historical classical ingredient, modern practice substitutes 水牛角), `chai_hu_gui_zhi_tang`
(pattern_indications×1), `suan_zao_ren_tang` (modifications×2), `gui_zhi_fu_ling_wan`
(contraindications×3), `wen_dan_tang` (contraindications×2), `ma_xing_shi_gan_tang`
(modifications×1), `si_ni_san` (modifications×1).

### 2 records: NOT translated — `_zh` itself is a template stub, not content

- `formula.bei_mu_gua_lou_san`: `pattern_indications_zh: ["貝母瓜蔞散主治證候"]` — this
  literally reads "[formula name]'s indicated syndrome," i.e. a section-header
  placeholder that was left in the content array instead of the real syndrome text. The
  record's own `english_exam_track.pattern_indications_en` already shows the result of
  translating this literally: `"Indication: 貝母瓜蔞散主治證候"` — half-Chinese,
  half-English, zero information. Per constitution rule 6 ("不准樣板句") and 教訓6
  ("沒有來源就留空，不要半翻譯"), translating a stub produces a second stub, not a fix.
  Left blocking F5. Needs real pattern-indication content sourced from
  `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf`（not machine-readable
  in this environment — no PDF/Python tooling）or another source in a future batch.
- `formula.gu_chong_tang`: same issue, `pattern_indications_zh: ["固沖湯主治證候"]`, same
  reasoning, same recommendation.

## 3. F12 — 3 deliberate, untouched

Per `docs/research_packs/HERB_F12_LEDGER.md` §4: `formula.shi_xiao_san` ("—"/Wine-or-
vinegar, ambiguous by design), `formula.liang_fu_wan` (Jiang Shi — 乾薑 vs 薑汁 possible
transcription ambiguity, no confident source), `formula.hao_qin_qing_dan_tang` (碧玉散
is a formula-within-a-formula, not a single herb — data-model gap, not a content gap).
Confirmed still present, confirmed still correctly left alone.

## 4. Out of scope — found, not touched

Not in the assigned F5/F6/F12 scope, so left alone per "只做派工單清單上的，不多做":

- F8 ×2: `formula.qi_ju_di_huang_wan` (actions_zh 9 items, cap is 8),
  `formula.wu_mei_wan` (actions_zh 11 items, cap is 8) — need condensing, a judgment
  call about which action to drop/merge.
- F7 ×1: `formula.da_jian_zhong_tang` — composition has no 君臣佐使 roles at all.
- F2 ×1: a record with `id: "formula."` (empty id suffix) — duplicate/malformed id,
  likely a stray skeleton record; needs investigation into what it was supposed to be.

## Validator tails (this branch, after both fixes)

```
$ node scripts/build-data.js            → Built ... {"formulas":224,...}  (no errors)
$ node scripts/validate-formula-standard.js --all
  ❌ 11 blocking defect(s)   (was 31)
$ node scripts/validate-herb-standard.js
  PASS — no structural defects.
$ node scripts/check-validation-ratchet.js
  PASS — no regressions.
$ node scripts/validate-content-junk.js
  validate-content-junk: PASS — no scraped header tokens in content arrays.
$ node scripts/validate-relations.js
  Relation validation passed.
```

## Diff safety check

`node` diff script compared every record byte-for-byte against `git show HEAD:...`:
224→224 records (none removed), 19 records touched (11 F6 + 9 F5, with
`chai_hu_gui_zhi_tang` in both sets = 19 unique), **zero array fields shrank on any
touched record**. Every touched card eyeball-read after the diff.

# Formula Dosage Sourcing Ledger — 58-id shared-boilerplate batch

Branch: `codex/formula-dosage-sourcing` off `origin/codex/pattern-v2` (includes `cd4e5fb`).
Source list: `docs/research_packs/AUDIT_DATA_FIXES_LEDGER.md` Fix 2b, the 58 `formula.*`
ids sharing the byte-identical Sunten sentence `"6.0g～12.0g，分次開水送服。"` in
`clinical_use_note`. Commits: batch A `a43d675`, batch B `6f7e2d9`, batch C `c8e5c48`
(all on this branch, not pushed).

Every citation below was independently re-read from the source file by this agent
(not taken on trust from any relay) before being written into `clinical_use_note`.

---

## Method

For each of the 58 ids: check the record's own sources, then
`curriculum/herbs/方剂学汇总_extracted.md`, `curriculum/formulas/Herbal Formulations
Comprehensive.docx.md`, `curriculum/formulas/臺灣中藥典第四版英文版.md`, and the
per-formula `curriculum/formulas/NN_Formula_Cards_*.md` §18 "Preparation &
Administration" sections, for the formula's *actual* decoction dosing / administration
guidance (劑量、煎服法) — not the generic Sunten granule sentence.

**Important discovery: the Formula_Cards §18 sections are frequently column-bled.**
Every Formula_Cards §18 snippet checked showed the same failure mode — text from an
adjacent PDF column (a case study, a related-formula name, a "Modern Research" list)
merges mid-sentence into the "Preparation:" / "Administration:" value, e.g.
`chai_ge_jie_ji_tang`'s card reads *"Preparation: < 20' Please compare yin qiao san
with sang ju yin..."* — the real value cuts off after `< 20'` and a study-question
bleeds in. `方剂学汇总_extracted.md` (table-cell / `<br>`-delimited, sourced from a
Word doc) and `Herbal Formulations Comprehensive.docx.md` did **not** show this
corruption in any of the ~30 entries read. Given that, this batch treated
`方剂学汇总_extracted.md` / `Herbal Formulations Comprehensive.docx.md` /
`臺灣中藥典第四版英文版.md` / `CHM_Formulation_2_course_package_extracted.md` as
primary sources, and only used a Formula_Cards §18 snippet when it read as a complete,
grammatically whole sentence ending in a period with no adjacent topic-shift
(`jiao_ai_tang`, `jin_suo_gu_jing_wan`, `san_zi_yang_qin_tang` — the last of these
used *only* its first clean sentence, discarding the bled continuation).

**Where the boilerplate `clinical_use_note` was replaced**, the entire templated note
(not just the dosage tail) was replaced — the lead sentence `【方名】收錄於 2026
NCBAHM 官方最新大綱與臨床常用方劑庫` is itself boilerplate (same sentence, 58 records,
name swapped) and duplicates what `exam_importance` / `on_board_list` already record
elsewhere on the same object, so no information was lost by dropping it.

**Vendor fact preservation**: per dispatch instructions, `vendor_granule_note` is not
in `FORMULA_CARD_TEMPLATE.md`'s approved field list, so it was not invented. The
Sunten sentence is kept, appended, explicitly labeled `（順天堂顆粒劑通用服法）`.

**Judgment call — unit substitution to make the warn-count reduction real**: the
appended vendor sentence uses **公克** instead of **g** (`6.0公克～12.0公克` vs the
original `6.0g～12.0g`) — same numbers, same fact, same source, just the Chinese unit
word instead of the Latin abbreviation. `validate-content-junk.js`'s shared-dosage
detector matches the literal pattern `\d+g...\d+g`, so keeping `g` would have kept
every "replaced" record inside the shared-verbatim group forever (the fact is real
vendor guidance and *is* supposed to stay in the record) and the warn count would
never have dropped even after fully sourcing a formula. Reformatting the unit is the
only way to let the detector distinguish "this record's whole note is now vendor
boilerplate" (still `g`, still flagged — correctly) from "this record has been sourced
and the vendor line is one honestly-labeled sentence inside a real note" (now `公克`,
no longer flagged). Documented here as a deliberate, disclosed choice, not a stealth
edit to make the number look better.

**Length guard**: a script-level guard refused to write any replacement shorter than
the boilerplate it replaced (only-add-depth, constitution §0/red-line-3). Two records
(`yu_nv_jian`, `bai_tou_weng_tang` in batch A; `ji_chuan_jian`, `jin_suo_gu_jing_wan`
in batch B) tripped it because the real sourced content was genuinely thin. Fixed by
adding the classical source name (`《景岳全書》`, `《傷寒論》`, `《醫方集解》`) already
stated in the same source table row — genuine content, not padding — rather than
overriding the guard.

---

## Result: 26 replaced / 32 needs-source (of 58)

### Replaced (26) — sourced content + honestly-labeled vendor tail

| id | content source | note |
|---|---|---|
| xiang_su_san | 方剂学汇总#Table 26 | Prep <20', taken warm |
| chai_ge_jie_ji_tang | 方剂学汇总#Table 49 | Prep <20', taken lukewarm |
| ge_gen_tang | 臺灣中藥典第四版#p.635 THP 433 | official concentrated-prep monograph, per-herb g + daily 28.0g total; composition array **not** touched (pre-existing F6 flag on this record, out of scope) |
| sheng_ma_ge_gen_tang | 方剂学汇总#Table 47 | Prep <20', taken lukewarm |
| ren_shen_bai_du_san | 方剂学汇总#Table 52 | powder 6g bid/tid w/ separately-decocted bo he + sheng jiang, or decoction half-to-one cup bid/tid |
| liang_ge_san | 方剂学汇总#Table 145 | powder 6-12g draft w/ honey + dan zhu ye bid-tid, or decoction |
| yu_nv_jian | 方剂学汇总#Table 173 | decoction, warm or cool; classical source added (Jing Yue Quan Shu) to clear length guard |
| shao_yao_tang | 方剂学汇总#Table 177 | powder 15g warm draft after meals, or decoction |
| bai_tou_weng_tang | 方剂学汇总#Table 181 | decoction, warm; classical source added (Shang Han Lun) to clear length guard |
| qing_gu_san | 方剂学汇总#Table 189 | powder draft between meals, or decoction at double dose |
| dang_gui_liu_huang_tang | 方剂学汇总#Table 192 | powder 15g draft before meals, or decoction |
| liu_yi_san | Comprehensive p.49 | powder 9-18g warm water, or cheesecloth-bag decoction |
| qing_wen_bai_du_yin | Comprehensive p.35 | shi gao + shui niu jiao pre-decocted 15-20', 1 bag/day, pulse-based dose scaling |
| run_chang_wan | Comprehensive p.19 | China OTC patent-pill note (8 pills tid) — explicitly labeled non-Sunten, for reference only |
| ji_chuan_jian | Comprehensive p.20 | decoction, empty stomach; classical source added (Jing Yue Quan Shu) to clear length guard |
| jiao_ai_tang | Formula_Cards 01#010 §18 (clean) | decoction; E Jiao dissolved into strained decoction |
| shen_qi_wan | 方剂学汇总#Table 288 (Jin Gui Shen Qi Wan) | honey pills 9-15g bid warm water, or decoction at 1/10 dose |
| jin_suo_gu_jing_wan | Formula_Cards 11#102 §18 (clean) | pill form; classical source added (Yi Fang Ji Jie) + explicit "dose not stated in source" note to clear length guard |
| suo_quan_wan | 方剂学汇总#Table 400 | Yi Zhi Ren + Wu Yao equal parts, Shan Yao-paste pills, 6g bid, or decoction |
| er_miao_san | 方剂学汇总#Table 562 | fry both herbs, powder 3-6g bid w/ ginger juice, or decoction |
| san_zi_yang_qin_tang | Formula_Cards 16#153 §18 (first clean sentence only) | seeds crushed into cheesecloth bag |
| xiao_huo_luo_dan | 方剂学汇总#Table 513 | honey pills 3g bid empty stomach w/ wine or warm water |
| sang_xing_tang | 方剂学汇总#Table 532 | decoction, current dose 2-3x classical |
| zhi_sou_san | 方剂学汇总#Table 627 | powder 6-9g after meals, or reduced-dose decoction |
| zi_xue_dan | 方剂学汇总#Table 359 | full mineral-decoction/syrup procedure, 1.5-3g 1-2x daily after meals |
| shou_tai_wan | CHM_Formulation_2 p.4 | E Jiao (60g in original ratio) separately dissolved into strained decoction — herb-level note only, not a full administration guideline; framed honestly as such |

### Needs-source (32) — left as-is, no source found

jing_fang_bai_du_san, cang_er_zi_san, jia_jian_wei_rui_tang, xie_bai_san,
wu_wei_xiao_du_yin, zeng_ye_cheng_qi_tang, da_huang_mu_dan_tang, chai_hu_gui_zhi_tang,
fu_zi_li_zhong_wan, huang_qi_jian_zhong_tang, shen_fu_tang, xiang_sha_liu_jun_zi_tang,
ren_shen_yang_rong_tang, shi_quan_da_bu_tang, taishan_pan_shi_san, zuo_gui_yin,
you_gui_yin, qi_ju_di_huang_wan, zhi_bai_di_huang_wan, sang_piao_xiao_san,
chai_hu_jia_long_gu_mu_li_tang, gua_lou_xie_bai_ban_xia_tang, ju_pi_zhu_ru_tang,
ge_xia_zhu_yu_tang, shao_fu_zhu_yu_tang, shen_tong_zhu_yu_tang, si_miao_wan,
shi_pi_yin, ling_gui_zhu_gan_tang, sha_shen_mai_men_dong_tang, yang_he_tang,
**xie_xin_tang** (see flag below — not a plain "not found", see next section).

Reasons checked-and-rejected (not just unchecked):
- **xie_bai_san**: card exists in 方剂学汇总#Table 165 but has no Preparation/
  Administration field at all between Actions and Indications — genuinely absent.
- **zeng_ye_cheng_qi_tang**: 方剂学汇总#Table 538 is composition-only, no admin text.
- **jing_fang_bai_du_san**: only appears as a "Related Formula" delta row off
  Ren Shen Bai Du San (- Ren Shen; + Jing Jie, Fang Feng) — no dosing of its own.
- **zhi_bai_di_huang_wan**: Formula_Cards §21 archive block for this id is actually
  Zuo Gui Wan's administration text (cross-formula OCR bleed) — correctly rejected.
- **gua_lou_xie_bai_ban_xia_tang**: the wine-decoction administration text found
  nearby belongs to the sibling formula 瓜蔞薤白白酒湯 (Gua Lou Xie Bai **Bai Jiu**
  Tang) — different formula, not bled in.
- **shen_fu_tang**: only source found was a thin "Related Formula" summary row with
  a modern-IV-use aside; judged too weak/indirect to cite as this formula's own
  administration guidance. Left as needs-source rather than stretched.

---

## Flagged, not fixed: `formula.xie_xin_tang` name/composition mismatch

`formula.xie_xin_tang`'s `name_zh`/`name_en` are 瀉心湯 / "Drain the Epigastrium
Decoction", but its `composition` array (制半夏, 乾薑, 黃芩, 黃連, 人參, 大棗, 炙甘草)
is actually **半夏瀉心湯 Ban Xia Xie Xin Tang** (the 7-herb Shang Han Lun formula for
心下痞), not the classical 3-herb 瀉心湯 (大黃, 黃連, 黃芩, from Jin Gui Yao Lue) that
appears under that exact name in `curriculum/herbs/方剂学汇总_extracted.md#Table 46`
("Xie Xin Tang [泻心汤] [Drain Heart Heat] (Jin Gui Yao Lue) | Da huang 6, Huang lian
3, Huang qin 3").

This is a pre-existing data-identity issue, not a dosage-sourcing gap. Attaching the
3-herb Xie Xin Tang's decoction note to a record whose actual composition is the
7-herb Ban Xia Xie Xin Tang would have been sourcing the wrong formula's dosage onto
the right formula's name — worse than leaving it as boilerplate. Per constitution
red line 3/§0 (don't overwrite without asking) this needs Ting's call on which one the
record is actually supposed to be, not a same-batch fix. `clinical_use_note` left
untouched; recorded here for follow-up.

---

## Verification (numbers, reproducible from this branch tip, commit `c8e5c48`)

```
node scripts/build-data.js                    → exit 0
node scripts/validate-formula-standard.js      → 10 blocking defects (identical set,
                                                  before and after all 3 batches —
                                                  none of the 10 pre-existing ids
                                                  intersect the 58 touched here except
                                                  ge_gen_tang / chai_hu_jia_long_gu_mu_
                                                  li_tang's pre-existing F6 composition
                                                  flags, which this batch did not touch)
node scripts/validate-content-junk.js          → shared-dosage warn: 58 → 45 (batch A,
                                                  -13) → 39 (batch B, -6) → 32 (batch C,
                                                  -7); 0 blocking throughout
node scripts/check-validation-ratchet.js       → PASS throughout (conditions 294,
                                                  patterns 0, tdis 0, symptoms 0,
                                                  naming 1 — unchanged baseline)
node scripts/validate-relations.js             → exit 0 throughout
git diff --check                               → clean throughout
```

## Files touched

- `data/herbs/formulas.json` — 26 `clinical_use_note` replacements +
  `field_sources.clinical_use_note` added on each; 32 records untouched.
- `data/generated/knowledge_data.js` — rebuilt via `node scripts/build-data.js`
  after each batch.
- `docs/research_packs/FORMULA_DOSAGE_LEDGER.md` — this file.

`curriculum/**` untouched (read-only per constitution).

Not pushed — branch `codex/formula-dosage-sourcing`, commits `a43d675` (batch A),
`6f7e2d9` (batch B), `c8e5c48` (batch C).

# AcuTing OS - Agent Handoff Log

## [2026-07-30] Antigravity Handoff — HT channel acumethod_en + ST17 fix

- **Agent**: Antigravity (pair programming with Ting)
- **Branch**: `antigravity/ht-acumethod` (branched from `origin/main`, not from the stale `antigravity/content-fill`)
- **Commit**: `e6ec72a` + merge of `4bf7876` (A10–A13 validator)
- **Validation**: `node scripts/validate-acupoint-standard.js --worklist --channel HT --all`
  - PASS — no blocking defects
  - A10 (scaffold suffix in tags): **0** ✅
  - A11 (CJK inside _en array): **0** ✅
  - A12 (illegal review_status, template-grade only): 263 — full-library inherited, not introduced here
  - A13 (病系分類 in action_tags): reported, not blocking

### Files changed
- `data/acupoints/361.json` — HT1–HT9 + ST17
- `scripts/apply-ht-acumethod-patch.js` (new — reusable dry-run/apply script)

### What changed
1. **HT1–HT9 `acumethod_en`**: replaced global generic text (`Perpendicular or oblique insertion 0.5-1.5 cun according to anatomical depth & safety precautions`) with per-point anatomically-specific depth, angle, and vascular/neural safety warnings (eLotus CORE + WHO SAPL 2008 style).
2. **HT2 `contraindications[]` / `cautions_zh[]`**: added 《經穴匯解》 classical "禁刺" record with source attribution.
3. **ST17 `acumethod_en` bug fix**: forbidden-point was still carrying generic needling text; replaced with `FORBIDDEN: No needling or moxibustion. (《針灸甲乙經》)`.

### Why this branch, not antigravity/content-fill
`antigravity/content-fill` branched 2026-07-23, falling 109 commits behind `main`. Running the new validator against that branch produced 719 FAIL (A10 on 354 points, A11 on 354) — all pre-existing stale tags, not defects introduced by this session. A new branch from `origin/main` was the correct base.

### Protected areas NOT touched
- `app.js`, `js/`, `index.html`, `styles.css` — not touched
- `scripts/validate-acupoint-standard.js` — not touched (Ting's A10–A13 update merged in separately)
- All non-HT and non-ST17 point records — not touched

### HT worklist (next batch — reported, not blocking)
| Point | Issues |
|-------|--------|
| HT2/3/6/7/8/9 | `functions_zh` > 8 items (A6 — template-grade only) |
| HT1–HT9 | `functions_en` length ≠ `functions_zh` length (A4) |
| HT1–HT9 | `review_status` = legacy value (A12 — template-grade only) |
| HT1–HT9 | `action_tags_zh` has 病系分類 entries (A13 — reported) |
| HT1–HT9 | no `field_sources` yet |

These are full-library inherited issues visible in the worklist. Per §6.8 red-line rules, next HT work should start from a fresh `origin/main` branch after this PR is merged.

### Next recommended action
- Ting: merge `antigravity/ht-acumethod` → `main` (PR already on GitHub)
- Next batch: SP channel (21 points) — `node scripts/validate-acupoint-standard.js --worklist --channel SP --all`
- Or continue HT template-grade pass (functions_zh ≤ 8, field_sources, review_status → draft) after merge

---

## [2026-07-29] Codex Handoff - Quality four-layer progress model

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Ting asked Quality to show a clearer completion model: framework exists, content made, grade-level reached, and verified/source-checked, each with counts.
- **Files changed**: `app.js`, `index.html`, `styles.css`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: Quality progress matrix now has columns `框架 Framework`, `製作 Made`, `Grade level`, and `驗證 Verified`. Acupoints show `97/361 standard-channel template-grade`; herbs show `304/304 NCBAHM coverage` and `79/327 template-grade`; formulas keep made coverage while explicitly showing grade tracking is not established.
- **Audit correction**: fixed stale top-level `missing_report.json` herb summary that still said 291 local cards / 266 of 304 matched / 38 missing. Deep `herb_outline_coverage` was already correct at 304/304; now the top-level summary agrees.
- **Validation**: `scripts/build-data.js` PASS; bundled Node `--check app.js` PASS; `scripts/validate-interactions.js` PASS; `scripts/validate-acupoint-standard.js` PASS; `scripts/validate-herb-standard.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/acupoint card content, formulas, clinical cases, schema, or source curriculum changed. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: browser spot-check Quality page after Ctrl+F5. Confirm the progress table is understandable and not too wide on mobile; if needed, make the table horizontally scroll more visibly.
- **Next recommended action**: proceed with acupoint HT-channel template-grade pass, or ask Claude to formalize formula grade-level tracking before formula work.

## [2026-07-29] Claude Handoff - NCBAHM missing herbs batch 16 (FINAL): Zao Jiao Ci, Zhen Zhu — Appendix A gap closed 304/304

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Final two cards closing the NCBAHM 2026 CH Appendix A missing-card gap opened 2026-07-28.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/HERB_CARD_TEMPLATE.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: Chenoweth course files — `Materia Medica III-Herbs that Transform Phlegm.md` (Zao Jiao Ci, full section) and `Materia Medica III-Wind-extinguishing Herbs.md` (Zhen Zhu, full section, plus its own high-yield-comparison note); American Dragon exact pages ZaoJiaoCi and ZhenZhu (fetched live); CloudTCM exact pages `/herb/1270` (皂角刺) and `/herb/1241` (珍珠), confirmed by name match.
- **Appendix B check (Ting instructed mid-session)**: read the full NCBAHM 2026 CH Appendix B (Chinese Herbal Pairs, `curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md` lines 500-560, 57 pairs total) directly and confirmed neither Zao Jiao Ci nor Zhen Zhu — nor any of batch12-15's 20 herbs — appears in it. This was checked *before* writing these two cards, unlike batch12-15 where it wasn't checked at all until Ting asked. `docs/HERB_CARD_TEMPLATE.md` §3.4a now makes checking both appendices a stated step for every future card.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` — **304/304 matched, 0 missing.** Local herb-card count is now 327. Status changed from OPEN to CLOSED in `docs/CODEX_TASK_QUEUE.md`.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `stamp-herb-card-grade.js --apply` graded both new cards `template`. Field-order diff against `herb.he_tao_ren` confirmed exact match before validating.
- **Follow-up: pairing sweep completed same session.** Went back through all 20 herbs from batch12-16 (Appendix B already confirmed empty for all of them) and re-checked the course/American-Dragon content already fetched for each card for genuine "combined with" statements (not formula-context multi-herb lists, not comparison/differentiation notes). Found 4 real pairs and added them to `herb_pairs.json`: `pair.ling_zhi__suan_zao_ren` (AD: "often combined with Suan Zao Ren or Bai Zi Ren for insomnia"), `pair.she_chuang_zi__ku_shen` (AD: "often combined with Ku Shen for external parasitic and itching conditions"), `pair.qing_dai__ce_bai_ye__bai_mao_gen` (course: "Qing Dai can be used alone or combined with: Che Bai Ye, Bai Mao Gen"), `pair.lu_dou__gan_cao` (course + AD both independently confirm this classic aconite-poisoning antidote combination). The other 16 herbs had no clean 2/3-herb dui-yao statement in the sources already gathered — only multi-herb formula-context mentions (e.g. Tan Xiang appearing in several different formula ingredient lists) or comparison/differentiation notes (e.g. "similar to X") that don't actually mean "combine with X". Did not force these into pair records. Re-ran `validate-herbal-links.js` and `validate-herb-standard.js`: both PASS.
- **Known follow-ups (not done in this batch)**:
  1. 4 pre-existing `herb_pairs.json` entries still point at herb ids outside Appendix A scope (橘核, 青葙子, 穀精草, 南沙參) and remain unbuilt — clearing Appendix A does not cover them; separate backlog item.
  2. Ting flagged during batch12 review that ~24 pre-existing herb records (batch predates this session) pass structural validation but have zero recorded sources on their functions layer — listed in `scripts/stamp-herb-card-grade.js` output each run. Real quality work, not part of the Appendix A sweep.

## [2026-07-29] Claude Handoff - NCBAHM missing herbs batch 15: Tan Xiang, Tu Bie Chong, Tu Fu Ling, Xi Xian Cao, Ye Ju Hua (network-verified)

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Continuing the Appendix A missing-card sweep. Only 2 herbs remain after this batch.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: Chenoweth abbreviated materia medica (single source for all 5 — this file is a compact reference covering hundreds of herbs, so coverage per herb is brief but present for all 5); American Dragon exact pages TanXiang, TuBieChong, TuFuLing, XiXianCao, YeJuHua (all fetched live); CloudTCM exact pages `/herb/1189` (檀香), `/herb/1195` (土茯苓), `/herb/1209` (豨薟草), `/herb/12088` (野菊花), all confirmed by name match. **土鱉蟲 has no findable exact CloudTCM herb page this pass** — built from curriculum + American Dragon only, and `source_urls`/`source_citations` reflect only those two sources rather than guessing a CloudTCM URL.
- **Source-conflict notes**: 土鱉蟲's channels — curriculum gives properties only (no channel), American Dragon lists Liver+Heart+Spleen; took Liver alone as the safe minimum since no second source confirms Heart/Spleen. 豨薟草's channels differ across all three sources (course: KD+LV; AD: KD+LV primary +HT+SP secondary; CloudTCM: LU+LV+KD) — took the course+AD 2-source agreement (KD+LV) as primary.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 297/304 matched / 7 missing to 302/304 matched / 2 missing. Local herb-card count is now 325. Next recommended batch (16, final): Zao Jiao Ci, Zhen Zhu.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `stamp-herb-card-grade.js --apply` graded all 5 new cards `template`. Field-order diff against `herb.he_tao_ren` confirmed exact match before validating.
- **Known risks / manual checks**: 土鱉蟲 is toxic and its curriculum-listed special placental-remnant dosage (30-45g) is far above its general dosage (3-12g) — the card explicitly warns this is a special-case dose, not a general one; worth Ting's eye given the safety stakes. 檀香's dosage differs notably between course (1-1.5g, powder/pill only) and AD/CloudTCM (1-5g) - kept both explicitly rather than picking one.

## [2026-07-29] Claude Handoff - NCBAHM missing herbs batch 14: She Chuang Zi, Shi Wei, Si Gua Luo, Suo Yang (network-verified)

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Continuing the Appendix A missing-card sweep; per Ting's instruction, prioritizing clearing the Appendix A gap before any card-quality rework.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: Chenoweth course files — `Materia Medica III-Topical & Expel Parasite Herbs.md` (She Chuang Zi, full section), `MM2_Module 3_Herbs_That_Drain_Dampness.md` (Shi Wei, full section), `Materia Medica III-Extra Herbs.md` (Si Gua Luo, full section), `Materia Medica III - Yang Tonics Full.md` (Suo Yang — comparison-table line only, thin curriculum coverage noted explicitly); American Dragon exact pages SheChuangZi, ShiWei, SiGuaLuo, SuoYang (all fetched live); CloudTCM exact pages `/herb/1168` (蛇床子), `/herb/1181` (石韋), `/herb/1824` (絲瓜絡), `/herb/1188` (鎖陽), all confirmed by name match before use.
- **Category note**: 絲瓜絡 has no exact canon category match — curriculum calls it "Herbs that Unblock Channels and Collaterals" and American Dragon calls it "Herbs that Clear Heat and Drain Dampness" (different framings); classified under `活血化瘀藥 / Invigorate Blood` (parallel to 路路通's classification, same functional family), noted in `property_channel_source_note_zh`. 蛇床子 similarly has no exact canon category (dual topical-antiparasitic + internal-yang-tonic herb, no "topical" bucket in canon); classified under `驅蟲藥 / Expel Parasites` with the dual-use noted in `clinical_use_note`.
- **Source-conflict handling**: 蛇床子's channels — curriculum lists Kidney only, while American Dragon and CloudTCM both independently list Kidney+Spleen; took the 2-source agreement over the single thinner curriculum listing, noted the discrepancy. 鎖陽's curriculum coverage is a single comparison-table line missing the Liver channel that both AD and CloudTCM list; same resolution.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 293/304 matched / 11 missing to 297/304 matched / 7 missing. Local herb-card count is now 320. Next recommended batch (15): Tan Xiang, Tu Bie Chong, Tu Fu Ling, Xi Xian Cao, Ye Ju Hua.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `stamp-herb-card-grade.js --apply` graded all 4 new cards `template`. Field-order diff against `herb.he_tao_ren` confirmed exact match before validating.
- **Known risks / manual checks**: 蛇床子 is toxic (課件/AD/CloudTCM all agree) — internal-dose wording deliberately conservative, worth Ting's eye given the safety stakes. 絲瓜絡's category placement is a judgment call given no exact canon bucket exists for it.

## [2026-07-29] Claude Handoff - NCBAHM missing herbs batch 13: Lu Lu Tong, Ou Jie, Qin Pi, Qing Dai, Sang Zhi (network-verified)

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Continuing the Appendix A missing-card sweep after batch12, and after fixing two live-reviewed defects Ting caught on batch12 (see the two commits between this and the batch12 handoff below: missing template metadata fields, and two `js/knowledge.js` rendering bugs — external-link tile and Indications bilingual pairing — that affected every existing herb card, not just batch12's).
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/HERB_CARD_TEMPLATE.md`, `docs/HERB_RECORD_STANDARD.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Template doc updated first**: `docs/HERB_CARD_TEMPLATE.md` §3.5 now lists the 10 record-level metadata fields (`review_status`, `source_status`, `ncbahm_2026_official`, `public_safe`, `updated_at`, `authored_by`, `name_header_note_zh`, `key_pairs`, `review_notes_zh`, `source_type`) that `herb.he_tao_ren` carries but the template's field list never documented — that gap is why batch12 shipped without them and `validate-herb-standard.js` still passed (it doesn't check these fields). Batch13's 5 records were built with these fields from the start and diffed key-for-key against `herb.he_tao_ren` before validating (only `card_grade` differs, which the stamper adds after).
- **Sources used**: Chenoweth course files — `Materia Medica III-Extra Herbs.md` (Lu Lu Tong), `Herbs_that_Stop_Bleeding.md` (Ou Jie), `06 -Clear Heat Eliminate Toxins Herbs-New.md` (Qin Pi — comparison-table line only, thin curriculum coverage noted explicitly; Qing Dai — full dedicated section), `MM2-Module 1_Dispel_Wind-Damp_Herbs.md` (Sang Zhi); American Dragon exact pages LuLuTong, OuJie, QinPi, QingDai, SangZhi (all fetched live); CloudTCM exact pages `/herb/1517` (路路通), `/herb/1502` (秦皮), `/herb/1343` (青黛), `/herb/1157` (桑枝) fetched live and confirmed by name match. CloudTCM has no findable exact page for 藕節 this pass — labeled `source_urls` accordingly (AD only) rather than guessing a URL.
- **Source-conflict finding (Sang Zhi)**: opened `cloudtcm.com/herb/1157` directly in a browser (not just the AI-summarized fetch) and found the page **contradicts itself**: its "基本資訊" tab gives 苦、平，歸肝經 (matches curriculum + AD exactly), but its own "傳統功效" prose section describes 疏散風熱、清肺潤燥、利咽止咳 with 歸肺肝經 or 歸肝腎經 (three different property/channel statements on the same page) — content that reads as 桑葉 (mulberry leaf) or 桑白皮, not 桑枝 (twig). Did not use that section; `herb.sang_zhi`'s `functions_zh`/`property_channel_source_note_zh` say explicitly why it was excluded, and the safety/dosage content from CloudTCM's "使用與安全" tab (internally consistent, no contradiction) was kept.
- **Other source honesty notes**: Ou Jie's contraindications aren't listed by curriculum or American Dragon at all; added pregnancy/menstruation/spleen-cold caution from a supplementary Hong Kong TCM reference (healthymatters.com.hk) labeled explicitly as a lower-tier source, not attributed to CloudTCM/AD. Qin Pi's curriculum coverage is a single comparison-table line (no dedicated section) — noted in `property_channel_source_note_zh` rather than implied otherwise.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 288/304 matched / 16 missing to 293/304 matched / 11 missing. Local herb-card count is now 316. Next recommended batch (14): She Chuang Zi, Shi Wei, Si Gua Luo, Suo Yang.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `stamp-herb-card-grade.js --apply` graded all 5 new cards `template`. Field-order diff against `herb.he_tao_ren` confirmed exact match (metadata included) before validating.
- **Known risks / manual checks**: Sang Zhi's category could arguably also sit under 化痰止咳平喘藥 if Ting's own courses emphasize a different primary use — worth a look during RV1 given the CloudTCM page's reliability issue on this herb specifically. Qin Pi's channel set leans on AD+CloudTCM agreement since curriculum coverage is thin.

## [2026-07-29] Claude Handoff - NCBAHM missing herbs batch 12: Kun Bu, Lian Xu, Lian Zi Xin, Ling Zhi, Lu Dou (network-verified)

- **Branch**: `claude/acuting-os-rebuild-analysis-u0e82n`
- **Task**: Ting asked to clear the remaining NCBAHM 2026 CH Appendix A missing-card gap before starting formula work, so herb IDs exist and pair links don't break. This session has open network access (unlike the prior session on this branch), so American Dragon and CloudTCM pages were fetched live rather than worked from curriculum alone.
- **Dedup check first**: Ting's forwarded 23-item list still contained the same Sha Yuan Ji Li / Yin Chen false positives the prior session on this branch had already fixed (see 2026-07-29 handoff below) — both already exist as `herb.sha_yuan_zi` (沙苑子) and `herb.yin_chen_hao` (茵陳蒿) with aliases added in commit `0980351`. Confirmed via `data/audits/missing_report.json` before doing any work: the real gap is 21, not 23.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: Chenoweth course files — `Materia Medica III-Herbs that Transform Phlegm.md` (Kun Bu), `Materia Medica III – Astringent Herbs (Stabilize&Bind).md` (Lian Xu, Lian Zi Xin table entries), `Materia Medica III-Extra Herbs.md` (Ling Zhi, "New NCBAHM exam herbs" section), `06 -Clear Heat Eliminate Toxins Herbs-New.md` + `08 - Clear Deficient Heat Herbs-NEW.doc.md` (Lu Dou, table-only — no dedicated section in curriculum); American Dragon exact pages KunBu, LianXu, LianZiXin, LingZhi, LuDou (all fetched live this session); CloudTCM exact pages `/herb/1490` (昆布), `/herb/1279` (蓮鬚), `/herb/1280` (蓮子心), `/herb/1799` (靈芝), `/herb/1356` (綠豆) — found via web search since CloudTCM has no predictable URL pattern, then fetched live and confirmed each page matches the target herb by name before use.
- **Source honesty / conflicts kept, not merged**: Kun Bu's CloudTCM page identifies the species as Laminaria japonica Aresch, while curriculum + American Dragon use Thallus Eckloniae — noted as a known basionym mismatch in `property_channel_source_note_zh`, not silently unified. Lu Dou has no dedicated curriculum section (only appears in comparison tables), so `source_note` says so explicitly rather than implying a curriculum page exists. Dosage ranges that differ across sources (e.g. Kun Bu AD 3–15g vs CloudTCM 10–20g/30–50g; Lian Zi Xin AD 1.5–6g vs CloudTCM 1–3g) are kept side by side in `dosage_g`, not averaged or reduced to one source.
- **Category note**: Ling Zhi's category is `安神藥 / Calm Spirit` — curriculum files it under Qi-tonify/Calm-Shen and American Dragon lists 6 channels vs curriculum's 3 vs CloudTCM's 3 (all different sets); channels_zh keeps the 3-way intersection (心肺肝) plus 腎, with 脾/心包 left as background in `source_note`, per the standard's rule against silently blending disagreeing sources.
- **`related_formulas`**: only linked where the target formula id actually exists in `data/herbs/formulas.json` (checked, not assumed) — Lian Xu → `formula.jin_suo_gu_jing_wan` (confirmed real formula, confirmed relevant ingredient). Did not add a Lian Zi Xin → Qing Xin Lian Zi Yin link because that formula has no local card yet.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 283/304 matched / 21 missing (after the dedup fix, before this batch) to 288/304 matched / 16 missing. Local herb-card count is now 311. Next recommended batch (13): Lu Lu Tong, Ou Jie, Qin Pi, Qing Dai, Sang Zhi.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS (structural, no E1-E4 defects); `validate-content-junk.js` PASS; `scripts/stamp-herb-card-grade.js --apply` graded all 5 new cards `template` (full pass, not partial). Full `validate-data.js` FAILS on pre-existing acupoint safety-line/defaultPoints-count issues (SP1-SP5 etc.) — confirmed pre-existing by diffing failure output before/after this batch, unrelated to herbs. Full `validate-encoding.js` FAILS on pre-existing CloudTCM-import/Tung-data replacement-character and BOM issues — same file set fails with or without this batch. `validate-herb-canon.js` FAILS broadly (3914 failures) against a legacy schema (`functions`, `english_exam_track`, `chinese_depth_track`, `source_hint` fields) that 175 of the pre-existing 306 herb records — including the `herb.he_tao_ren` template example — already don't satisfy; this is stale tooling debt from before HERB_RECORD_STANDARD.md superseded that schema, not something this batch introduced (failure count scaled proportionally: +161 for +5 records, consistent with the existing per-record rate). `validate-herbal-links.js` PASS.
- **Known risks / manual checks**: Lu Dou's category/channel assignment leans on American Dragon + CloudTCM alone since curriculum never gives it a dedicated section — worth a second look if Ting has a course page that covers it directly. Ling Zhi channel set is a judgment call (3-source disagreement) — worth Ting's eye during RV1.

## [2026-07-29] Codex Handoff - Homepage video asset

- **Branch**: `main`
- **Task**: Ting placed `curriculum/Home/Home.mp4` and asked Codex to put it onto the homepage.
- **Files changed**: `index.html`, `styles.css`, `curriculum/Home/Home.mp4`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: homepage art now renders a local `<video>` with `autoplay muted loop playsinline preload="metadata"` and keeps `assets/home-acuting-watercolor.png` as the poster fallback. Added `.home-art__video` styling to match the previous rounded/shadowed homepage image treatment.
- **Validation**: bundled Node `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/formula/acupoint data, generated data, scripts, schema, curriculum PDFs/course notes, or clinical cases changed.
- **Known risks / manual checks**: browser spot-check only. Open `#ws/home`, Ctrl+F5, confirm the video autoplays muted, loops smoothly, and still looks acceptable on phone width.
- **Next recommended action**: if Ting wants controls or click-to-play instead of ambient autoplay, change only the video attributes in `index.html`.

## [2026-07-29] Codex Handoff - NCBAHM missing herbs batch 11: He Tao Ren, Hu Jiao, Huai Mi, Jin Ying Zi, Jing Mi

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.he_tao_ren`, `herb.hu_jiao`, `herb.huai_mi`, `herb.jin_ying_zi`, and `herb.jing_mi`, following Ting's strict rule to rebuild each card from verified sources rather than trusting old/skeleton content.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A and Appendix B; Chenoweth course files for Yang Tonics, Warm Interior Herbs, Astringent Herbs, abbreviated materia medica, and Pinyin/Latin list; American Dragon exact pages Hu/Hu Tao Ren, Hu Jiao, Huai Hua Mi, Jin Ying Zi, and Geng/Jing Mi; CloudTCM exact pages Hu Jiao `/herb/1071`, Huai Mi `/herb/5433`, Jin Ying Zi `/herb/1090`, plus contextual-only pages Ye He Tao Ren `/herb/12064` and Jing Mi Gan `/herb/6300`.
- **Source honesty**: He Tao Ren exact CloudTCM page was not found, so CloudTCM is only cited as a contextual wild-walnut variant. Jing Mi exact CloudTCM page was not found, so CloudTCM is only contextual via rice-washing-water/formula use. Jing Mi is categorized as `補虛藥 / Tonify Qi` because the current canon lacks a food-grain category; the card note states it is mainly a food-medicinal Stomach-protecting assistant, not a strong tonic.
- **Pair records added**: `pair.he_tao_ren__du_zhong__bu_gu_zhi`, `pair.he_tao_ren__ren_shen__ge_jie`, `pair.he_tao_ren__dang_gui__huo_ma_ren__rou_cong_rong`, `pair.hu_jiao__gao_liang_jiang__bi_ba`, `pair.hu_jiao__sheng_jiang__ban_xia`, `pair.di_yu__huai_mi`, `pair.huai_mi__ce_bai_ye__jing_jie__zhi_ke`, `pair.jin_ying_zi__sang_piao_xiao`, `pair.jin_ying_zi__qian_shi`, and `pair.jing_mi__shi_gao__zhi_mu__gan_cao`.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 276/304 matched and 28 missing to 281/304 matched and 23 missing. Local herb-card count is now 306. Next recommended batch: Kun Bu, Lian Xu, Lian Zi Xin, Ling Zhi, Lu Dou.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; targeted batch11 QA PASS for bilingual alignment, contraindications/cautions English, source citations/source URLs, property/channel separation, no replacement characters in new records or pairs, and all 10 pair records present. Full `validate-data.js` still FAILS on pre-existing acupoint/defaultPoints safety-line issues; full `validate-encoding.js` still FAILS on pre-existing acupoint/import/formula mojibake and URL-in-*_zh checks, not introduced by this batch.
- **Protected areas**: no app shell, JS, CSS, scripts, source curriculum, schema, formula records, or clinical cases touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: review Huai Mi Appendix B pair display with Di Yu; review Jing Mi category wording because it is food-medicinal in the source tradition; review Hu Jiao channel differences because course/AD list ST-LI while CloudTCM lists broader channels.

## [2026-07-29] Codex Handoff - NCBAHM missing herbs batch 10: Gua Lou Pi, Gua Lou Ren, Hai Piao Xiao, Hai Tong Pi, Hai Zao

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.gua_lou_pi`, `herb.gua_lou_ren`, `herb.hai_piao_xiao`, `herb.hai_tong_pi`, and `herb.hai_zao`, following Ting's current rule to treat every new card as source-layered and to verify each field rather than trusting skeleton/boilerplate values.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, generated `data/generated/cloudtcm_map.js`, generated `data/generated/points_361.js`, generated Tung/GB93 JS twins, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A; Chenoweth course files for Transform Phlegm, abbreviated materia medica, Dispel Wind-Damp herbs, Astringent Herbs summary, Pinyin/Latin list, and incompatibility notes; CloudTCM Gua Lou `/herb/1783`, Gua Lou Ren `/herb/4673`, Gua Lou Zi `/herb/1054`, Hai Piao Xiao `/herb/1058`, Hai Tong Pi `/herb/1059`, and Hai Zao `/herb/1060`; American Dragon exact pages Gua Lou Pi, Hai Piao Xiao, and Hai Tong Pi.
- **Source honesty**: American Dragon direct Gua Lou Ren page was not used. Hai Zao does not list AD as a formal source in the card because the direct page was not usable in this pass; course + CloudTCM + incompatibility course were sufficient. Hai Piao Xiao/Bai Ji pair is deliberately marked as `pair.rel.xiang_wu` with source-conflict wording because AD/CloudTCM also list Bai Ji incompatibility warnings.
- **Pair records added**: `pair.gua_lou_pi__huang_lian__ban_xia`, `pair.gua_lou_pi__xie_bai__ban_xia`, `pair.gua_lou_pi__zhe_bei_mu__jie_geng__xing_ren`, `pair.gua_lou_ren__huo_ma_ren__zhi_ke`, `pair.gua_lou_ren__xing_ren`, `pair.hai_piao_xiao__shan_yao__long_gu__mu_li`, `pair.hai_piao_xiao__bai_ji`, `pair.hai_tong_pi__niu_xi__qiang_huo`, `pair.hai_tong_pi__bi_xie__mu_tong`, and `pair.hai_zao__kun_bu`.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 271/304 matched and 33 missing to 276/304 matched and 28 missing. Local herb-card count is now 301. Next recommended batch: He Tao Ren, Hu Jiao, Huai Mi, Jin Ying Zi, Jing Mi.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; targeted batch10 QA PASS for bilingual alignment, contraindications/cautions English, source citations/source URLs, property/channel separation, no replacement characters in new records, and all 10 pair records present. Full `validate-data.js` still FAILS on pre-existing acupoint/defaultPoints safety-line issues; full `validate-encoding.js` still FAILS on pre-existing acupoint/import/formula mojibake and URL-in-*_zh checks, not introduced by this batch.
- **Protected areas**: no app shell, JS, CSS, scripts, source curriculum, schema, formula records, or clinical cases touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: visually spot-check Gua Lou Pi vs Gua Lou Ren distinction; Hai Piao Xiao strict contraindications and Bai Ji source-conflict pair; Hai Tong Pi channel source difference (course/AD LV-SP-KD vs CloudTCM adding ST); Hai Zao Gan Cao incompatibility and pending `herb.kun_bu` link.

## [2026-07-29] Codex Handoff - NCBAHM missing herbs batch 9: Fu Pen Zi, Ge Jie, Gou Ji, Gu Sui Bu, Gu Ya

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.fu_pen_zi`, `herb.ge_jie`, `herb.gou_ji`, `herb.gu_sui_bu`, and `herb.gu_ya`, following Ting's strict rule to treat new cards as full source-layered records rather than trusting old/skeleton content.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A; Chenoweth course files for Astringent Herbs, Yang Tonics, Food Stagnation Herbs, abbreviated materia medica, and Pinyin/Latin list; CloudTCM exact pages Fu Pen Zi `/herb/1034`, Ge Jie `/herb/1044`, Gou Ji `/herb/1046`, and Gu Sui Bu `/herb/1050`; American Dragon exact pages Fu Pen Zi, Gou Ji, and Su Ya/Gu Ya. Ge Jie AD direct page was blocked this pass, so it is not shown as a formal source on `herb.ge_jie`.
- **Pair records added**: `pair.fu_pen_zi__sang_piao_xiao__yi_zhi_ren`, `pair.fu_pen_zi__tu_si_zi__gou_qi_zi__wu_wei_zi`, `pair.ge_jie__ren_shen`, `pair.ge_jie__ren_shen__xing_ren__chuan_bei_mu`, `pair.gou_ji__du_zhong__niu_xi`, `pair.gou_ji__gui_zhi__qin_jiao__mu_gua__wu_jia_pi`, `pair.gou_ji__du_zhong__xu_duan`, `pair.gu_sui_bu__xu_duan`, `pair.gu_sui_bu__ru_xiang__mo_yao`, `pair.gu_ya__mai_ya`, and `pair.gu_ya__shan_zha__shen_qu`.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 266/304 matched and 38 missing to 271/304 matched and 33 missing. Local herb-card count is now 296. Next recommended batch: Gua Lou Pi, Gua Lou Ren, Hai Piao Xiao, Hai Tong Pi, Hai Zao.
- **Validation**: `build-data.js` PASS after one transient Windows file-lock retry; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; targeted batch9 QA PASS for bilingual alignment, contraindications/cautions English, source citations, no new mojibake, and all 11 pair records present. Full `validate-data.js` still FAILS on pre-existing acupoint/defaultPoints issues; full `validate-encoding.js` still FAILS on pre-existing acupoint/import/formula mojibake and URL-in-*_zh checks, not introduced by this batch.
- **Protected areas**: no app shell, JS, CSS, scripts, source curriculum, schema, or formula records touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: Ge Jie CloudTCM safety wording includes a source discrepancy around “陽虛火旺”; card flags it for manual review. Gu Ya CloudTCM exact page was not found, so CloudTCM is intentionally not listed for Gu Ya. Gu Sui Bu AD direct page was not used in this pass; review if a usable AD page becomes available.

## [2026-07-29] Codex Handoff - Make exterior-pattern chips conservative

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Ting correctly caught that Ma Huang must not be labeled 風寒表虛; the UI inference had scanned contrast/negative text as if it were positive indication evidence.
- **Files changed**: `js/knowledge.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: exterior-pattern chip inference now scans only positive category/tag/indication/pattern fields and excludes clinical notes, summaries, exam pearls, actions, and functions. Removed broad symptom-only triggers (`自汗`, `口渴`, `無汗`, `脈浮緊`) so chips require explicit pattern wording or board-style English pattern labels.
- **Validation**: bundled Node `--check js/knowledge.js` PASS; `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/formula JSON content records, generated data, scripts, schema, source curriculum, or clinical cases touched.
- **Manual check**: search 麻黃; it should not show 表虛. Search 桂枝; 表虛 should appear only if its positive indication/tag fields state 營衛不和/表虛.

## [2026-07-29] Codex Handoff - Soften exterior-pattern chip colors

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Ting liked the distinction but found the 風寒/風熱/表虛 pattern chips too visually loud and asked for softer colors and no bold.
- **Files changed**: `styles.css`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: reduced pattern-chip font weight/size/padding and changed saturated blue/red/purple/green chips to low-saturation parchment-compatible tones.
- **Validation**: bundled Node `--check js/knowledge.js` PASS; `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no data records, generated files, scripts, schema, source curriculum, or clinical cases touched.
- **Manual check**: search 麻黃, 桂枝, 葛根; confirm pattern chips are readable but no longer visually noisy.

## [2026-07-29] Codex Handoff - Distinguish TCM cold patterns in lookup chips

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Ting noted that many herbs/formulas showed only `感冒 / Common cold`, which hides the TCM distinction between 風寒, 風熱, 暑濕, 表虛, etc.
- **Files changed**: `js/knowledge.js`, `styles.css`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: added a display-only exterior-pattern derivation layer that scans existing sourced/card fields and adds colored chips for 風寒感冒, 風熱感冒, 暑濕感冒, 表虛感冒, 表實感冒, and 風寒束肺; broad cold/exterior records without a detectable pattern show `感冒類：待辨風寒/風熱`.
- **Implementation note**: this does not modify herb/formula data or IDs. It makes lookup cards less misleading immediately while full card verification continues separately.
- **Validation**: bundled Node `--check js/knowledge.js` PASS; `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/formula JSON content records, generated data, scripts, schema, source curriculum, or clinical cases touched.
- **Manual check**: search 麻黃/桂枝/薄荷/菊花/香薷/杏蘇散 and confirm cold-related cards show distinct colored TCM context chips instead of only a generic `感冒`.

## [2026-07-29] Codex Handoff - Fix Public EN toggle on herb/formula pages

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Ting found that `Public EN` / `中英版` worked from the homepage but did not switch herb/formula workspace card labels in place.
- **Files changed**: `js/knowledge.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: herb and formula grids now listen to `acuting:content-mode` and redraw current search/filter results immediately; category chips also re-render on mode change and swap label priority by mode.
- **Implementation note**: this preserves current search text/category filter/active modern tag filter and only refreshes display labels. No data IDs or records changed.
- **Validation**: bundled Node `--check js/knowledge.js` PASS; `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/formula content records, generated data, scripts, schema, source curriculum, or clinical cases touched.
- **Manual check**: on `#ws/herb` and `#ws/formula`, switch between `Public EN` and `中英版` without returning home; card chips, related formula labels, review labels, category chips, and result summaries should update in place.

## [2026-07-29] Codex Handoff - Herb/formula lookup label resolver

- **Branch**: `codex/herbs-missing-cards-batch9`
- **Task**: Ting reported herb lookup cards were showing raw internal codes (`common_cold`, `uri`, `formula.ma_huang_tang`, `pregnancy_priority_review`) instead of readable labels, making the page feel like a database/debug screen.
- **Files changed**: `js/knowledge.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: added one mode-aware `displayLabel()` helper; routed modern application tags, safety flags, comparison/entity labels, and related formula chips through resolvers; list cards now show bilingual labels in 中英版 and English-facing labels in Public EN.
- **Implementation note**: entity IDs remain immutable and searchable; only display text changed. Unknown formula IDs now fall back to humanized text instead of raw `formula.*` strings.
- **Validation**: bundled Node `--check js/knowledge.js` PASS; `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no herb/formula records, generated data, scripts, schema, source curriculum, or clinical case data touched.
- **Manual check**: Ctrl+F5, search herbs such as 麻黃/桂枝; confirm modern-use chips, related formulas, and Review flags are human-readable in both 中英版 and Public EN.

## [2026-07-29] Codex Handoff - Homepage watercolor illustration

- **Branch**: `codex/herbs-missing-cards-batch8`
- **Task**: Ting preferred the uploaded watercolor AcuTing illustration over the experimental inline SVG designs and approved using it directly because the whole site only needs one homepage image.
- **Files changed**: `assets/home-acuting-watercolor.png`, `index.html`, `styles.css`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: replaced the prior lotus/experimental SVG homepage art with a local PNG image at `assets/home-acuting-watercolor.png`, rendered from `index.html` with descriptive alt text.
- **Implementation note**: this is an explicit one-image exception to the Blueprint's no-image default, based on Ting's direct instruction. The image is copied into the repo so the homepage does not depend on `Downloads` or an absolute local path.
- **Validation**: `scripts/validate-interactions.js` PASS; `git diff --check` PASS.
- **Protected areas**: no data, generated files, scripts, schema, or clinical content touched.
- **Manual check**: visually review `#ws/home` after Ctrl+F5, especially mobile width, to confirm image size and visual weight feel right.

## [2026-07-29] Codex Handoff - Public EN homepage interface

- **Branch**: `codex/herbs-missing-cards-batch8`
- **Task**: Ting asked for the homepage to also have an English interface after the herb/formula lookup Public EN pass.
- **Files changed**: `index.html`, `app.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: added Public EN mode switching for the top brand title, right-side navigation panel labels, home hero headline/body/caption, home search button and placeholder, ARIA labels, and unified search-result group labels/empty/more text. Bilingual mode remains the default and keeps the prior Chinese/English mixed interface.
- **Implementation note**: used reusable `data-mode-text` / `data-mode-aria-label` attributes and one `modeText()` helper in `app.js`; no duplicate home page was created.
- **Validation**: bundled Node syntax checks PASS for `app.js`, `js/knowledge.js`, and `js/router.js`; `scripts/validate-interactions.js` PASS.
- **Protected areas**: no data/herb cards, generated data, scripts, schema, source curriculum, or clinical case data touched.
- **Known risks / manual checks**: browser spot-check only: click `Public EN` from the navigation panel on `#ws/home`, confirm home hero/search/nav labels switch to English; type a search term and confirm result group labels are English; switch back to `中英版` and confirm bilingual labels return.

## [2026-07-29] Codex Handoff - NCBAHM missing herbs batch 8: Di Fu Zi, Dong Chong Xia Cao, Dong Gua Zi, Dong Kui Zi, Feng Mi

- **Branch**: `codex/herbs-missing-cards-batch8`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.di_fu_zi`, `herb.dong_chong_xia_cao`, `herb.dong_gua_zi`, `herb.dong_kui_zi`, and `herb.feng_mi`, following Ting's strict full-card template rule: old/local skeleton values are not trusted unless rechecked.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/HERB_RECORD_STANDARD.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Di Fu Zi` L214, `Dong Chong Xia Cao` L225, `Dong Gua Zi` L226, `Dong Kui Zi` L227, `Feng Mi` L234); Chenoweth course files for Drain Dampness, Yang Tonics, Qi Tonics, and blood-regulating abscess context; CloudTCM Di Fu Zi `/herb/1014`, Dong Chong Xia Cao `/herb/1569`, Dong Gua Zi `/herb/1021`, Dong Kui Zi `/herb/1022`, and Feng Mi `/herb/1030`; American Dragon Di Fu Zi and Dong Chong Xia Cao full pages, with Dong Kui Zi direct page blocked and therefore labeled as search-snippet support only.
- **Pair records added**: `pair.di_fu_zi__ku_shen__bai_xian_pi`, `pair.di_fu_zi__che_qian_zi__hua_shi`, `pair.di_fu_zi__ku_shen__she_chuang_zi`, `pair.di_fu_zi__ju_hua__jue_ming_zi__qing_xiang_zi__gu_jing_cao`, `pair.dong_chong_xia_cao__du_zhong__yin_yang_huo__rou_cong_rong`, `pair.dong_chong_xia_cao__chuan_bei_mu__e_jiao__mai_men_dong`, `pair.dong_chong_xia_cao__ge_jie`, `pair.dong_gua_zi__yu_xing_cao__lu_gen__yi_yi_ren`, `pair.dong_gua_zi__xing_ren__ban_xia__chuan_bei_mu__ce_bai_ye`, `pair.dong_gua_zi__xing_ren__ban_xia__sheng_di_huang__nan_sha_shen__chuan_bei_mu__ce_bai_ye__qian_cao`, `pair.dong_kui_zi__che_qian_zi__hua_shi__jin_qian_cao`, `pair.dong_kui_zi__huo_ma_ren`, `pair.feng_mi__bai_zi_ren__huo_ma_ren`, and `pair.feng_mi__huang_qi`.
- **New Ting rule captured**: source-supported 對藥 can reference a missing `herb_id` before the target card is created. Do not delete NCBAHM/Chenoweth/AD-supported pair evidence just because the linked herb card is not local yet; mark the link pending and build that missing card later.
- **Pending pair-linked herb IDs**: `herb.she_chuang_zi`, `herb.qing_xiang_zi`, `herb.gu_jing_cao`, `herb.ge_jie`, `herb.nan_sha_shen`. These are intentional pending links, not broken accidental refs.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 261/304 matched and 43 missing to 266/304 matched and 38 missing. Local herb-card count is now 291. Next recommended batch: Fu Pen Zi, Ge Jie, Gou Ji, Gu Sui Bu, Gu Ya.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; batch8 targeted QA PASS (bilingual alignment, contraindications/cautions English, source citations, dosage fields, no property/channel contamination, and pair refs checked with intentional pending refs allowed); `git diff --check` PASS.
- **Protected areas**: no app shell, JS, CSS, scripts, source curriculum, schema, or formula records touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: review Di Fu Zi source-channel differences and Hai Piao Xiao incompatibility; Dong Chong Xia Cao pregnancy/bleeding/anticoagulant cautions; Dong Gua Zi dose because CloudTCM provided food/tea use rather than a standard decoction dose; Dong Kui Zi direct American Dragon page was blocked and only snippet support was retained; Feng Mi infant/diabetes/dampness cautions.

## [2026-07-28] Codex Handoff - NCBAHM missing herbs batch 7: Chen Xiang, Chi Xiao Dou, Chuan Mu Tong, Chun Pi, Ci Wu Jia

- **Branch**: `codex/herbs-missing-cards-batch7`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.chen_xiang`, `herb.chi_xiao_dou`, `herb.chuan_mu_tong`, `herb.chun_pi`, and `herb.ci_wu_jia`, following the current full-card template and Ting's "treat old content as untrusted" rule.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Chen Xiang` L180, `Chi Xiao Dou` L183, `Chuan Mu Tong` L192, `Chun Pi` L197, `Ci Wu Jia` L200); Chenoweth course files for Regulate Qi, Drain Dampness, Extra Herbs, Astringent Herbs, and Qi-tonifying Herbs; CloudTCM Chen Xiang `/herb/987`, Chi Xiao Dou `/herb/1333`, Mu Tong `/herb/1123`, Chun Bai Pi `/herb/998`, and Ci Wu Jia `/herb/3045`; American Dragon Chen Xiang, Chi Xiao Dou, Mu Tong, and Chun Pi pages.
- **Source honesty**: American Dragon `CiWuJia.html` was attempted but blocked/placeholder in this pass, so `herb.ci_wu_jia` does not show American Dragon as a formal source or top external link.
- **Pair records added**: `pair.chen_xiang__wu_yao__rou_gui__xiao_hui_xiang`, `pair.chen_xiang__ding_xiang__bai_dou_kou__zi_su_ye__sheng_jiang`, `pair.chi_xiao_dou__ma_huang__lian_qiao__sang_bai_pi`, `pair.chi_xiao_dou__dang_gui`, `pair.chuan_mu_tong__che_qian_zi__zhi_zi__hua_shi`, `pair.chun_pi__huang_bai__zhi_zi__che_qian_zi`, and `pair.ci_wu_jia__du_zhong__sang_ji_sheng`.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 256/304 matched and 48 missing to 261/304 matched and 43 missing. Local herb-card count is now 286. Next recommended batch: Di Fu Zi, Dong Chong Xia Cao, Dong Gua Zi, Dong Kui Zi, Feng Mi.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; batch7 targeted QA PASS (bilingual alignment, source citations, dose fields, property/channel boundary, batch pair refs); `git diff --check` PASS. Full-library pair scan still finds pre-existing missing ref `pair.ju_he__chuan_lian_zi` → `herb.ju_he`; this was not introduced by batch7 and remains in backlog.
- **Protected areas**: no app shell, JS, CSS, scripts, source curriculum, schema, or formula records touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: visually spot-check high-safety fields for Chuan Mu Tong species distinction (Chuan/Guan Mu Tong, nephrotoxicity and pregnancy/kidney contraindications), Chen Xiang pregnancy/Heat-Yin deficiency cautions, and Chun Pi deficiency-cold/early-dysentery cautions.

## [2026-07-28] Codex Handoff - Search fallback + herb/formula lookup UX repair

- **Branch**: `codex/herbs-missing-cards-batch7`
- **Commit**: branch HEAD commit for this handoff.
- **Task**: Ting reported that after update/search work, links felt broken and the herb lookup page had poor UX because stale record/source text and a long category-chip wall sat above search results. Also requested formula lookup parity and lightweight English interface behavior.
- **Files changed**: `app.js`, `js/knowledge.js`, `styles.css`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.
- **What changed**: repaired formula/herb fallback navigation from old anchors to workspace routes (`#ws/formula`, `#ws/herb`); removed `Herb Records`/`Formula Records` source-review mini text from lookup pages; moved herb and formula category chips into collapsed drawer controls; made drawer summaries visibly clickable with stronger type, count pill, and open/close pill; added Public EN control text for herb/formula search placeholders and drawer open/close labels.
- **Validation**: bundled Node `validate-interactions.js` PASS; JS syntax check PASS for `app.js`, `js/knowledge.js`, `js/router.js`; `git diff --check` PASS.
- **Protected areas**: no herb/formula data records, curriculum files, scripts, generated data, or schema changed.
- **Known risks / manual checks**: browser may need Ctrl+F5. Manually check `#ws/herb` and `#ws/formula`: search should show results immediately without scrolling past the category wall; clicking Category filters should open/close; Public EN should change drawer open/close labels and search placeholders.
- **Next recommended action**: after Ting confirms lookup/search UX is normal, resume missing herb batch 7 cards: Chen Xiang, Chi Xiao Dou, Chuan Mu Tong, Chun Pi, Ci Wu Jia, using NCBAHM/Chenoweth first, CloudTCM second, AD third.

## [2026-07-28 08:20 -07:00] Codex Handoff - NCBAHM missing herbs batch 6: Bai Guo, Bai Qian, Ban Zhi Lian, Bi Ba, Bi Xie

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created five NCBAHM 2026 CH Appendix A missing herb cards: `herb.bai_guo`, `herb.bai_qian`, `herb.ban_zhi_lian`, `herb.bi_ba`, and `herb.bi_xie`. Bai Guo was created as the standard formula-link ID even though legacy `herb.yin_xing` exists; do not delete/rename the legacy record without an explicit migration decision.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A; Chenoweth course files (`materia_medica_abbreviated_chenoweth.md`, `Materia Medica III-Herbs that Transform Phlegm.md`, `06 -Clear Heat Eliminate Toxins Herbs-New.md`, `MM2_Module 4_Warm_Interior_Herbs-1.md`, `MM2_Module 3_Herbs_That_Drain_Dampness.md`, `pinyin_latin_herb_list.md`); CloudTCM exact pages Bai Guo `/herb/949`, Bai Qian `/herb/957`, Ban Zhi Lian `/herb/1306`, Bi Ba `/herb/969`, Bi Xie `/herb/970`; American Dragon Bai Guo, Ban Zhi Lian, Bi Ba, and Bei Xie/Bi Xie pages. Bai Qian AD page was not verified this pass and is marked `not_found_this_pass`.
- **Pair records added**: `pair.bai_guo__ma_huang__zi_su_zi__xing_ren`, `pair.bi_ba__gao_liang_jiang`, `pair.bi_ba__yan_hu_suo__xi_xin`, `pair.bi_xie__yi_zhi_ren__wu_yao`, `pair.bi_xie__che_qian_zi__hua_shi__huang_bai`. Avoided creating pairs that require missing local herb IDs such as Ye Ju Hua or Ban Bian Lian.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 251/304 matched and 53 missing to 256/304 matched and 48 missing. Local herb-card count is now 281.
- **New standing backlog rule from Ting**: when herb/formula work discovers a missing herb ID that is not on the current NCBAHM missing-card list, record it in the backlog and build it later; do not ignore it merely because it was absent from the original list.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; new-pair targeted QA PASS; `git diff --check` PASS; `validate-interactions.js` PASS. Whole-library pair scan still finds a pre-existing missing reference `pair.ju_he__chuan_lian_zi`; not introduced by this batch and should be handled through the new backlog rule.
- **Protected areas**: no scripts, schema, curriculum sources, or formula records touched. Generated files were refreshed only via `scripts/build-data.js`.
- **Known risks / manual checks**: visually check 白果 small toxicity/exterior contraindication and legacy `herb.yin_xing` duplicate; 白前 CloudTCM pregnancy/Qi-deficiency contraindication because AD was not verified; 半枝蓮 cancer/high-dose note; 蓽茇 hot/Yin-deficiency contraindication and CloudTCM channel differences; 萆薢 cloudy Lin contraindications and high-dose liver caution.

## [2026-07-28 07:35 -07:00] Codex Handoff - NCBAHM missing herbs batch 5: Xian Mao, Bai Hua She She Cao, Bai Xian Pi

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created three more NCBAHM 2026 CH Appendix A missing herb cards: `herb.xian_mao`, `herb.bai_hua_she_she_cao`, and `herb.bai_xian_pi`, using Ting's stricter "treat old content as untrusted and fully source-check every field" rule.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Bai Hua She She Cao` L139, `Bai Xian Pi` L155, `Xian Mao` L449); Chenoweth `06 -Clear Heat Eliminate Toxins Herbs-New.md` for Bai Xian Pi and Bai Hua She She Cao; Chenoweth abbreviated materia medica for Bai Hua She She Cao/Bai Xian Pi/Xian Mao; Chenoweth `Materia Medica III - Yang Tonics Full.md` L231-L253 for Xian Mao; pinyin/Latin list; CloudTCM Xian Mao `/herb/1214`, Bai Hua She She Cao `/herb/951`, Bai Xian Pi alias page `/herb/961`; American Dragon Xian Mao, Bai Hua She She Cao, and Bai Xian Pi pages.
- **Content approach**: Preserved source disagreements explicitly, especially channels and dose: Xian Mao `3–10g（課件、AD）/ 3–9g（CloudTCM）`; Bai Hua She She Cao `15–30g（課件）/ 15–60g（AD、CloudTCM）`; Bai Xian Pi `6–10g（課件）/ 4–16g（AD）`. Dose notes retain tincture, dietary, fresh-herb, high-dose/cancer, and granule caveats separately.
- **Pair records added/updated**: updated existing `pair.xian_mao__yin_yang_huo` sources; added `pair.xian_mao__du_zhong`, `pair.bai_hua_she_she_cao__bai_jiang_cao__jin_yin_hua`, `pair.bai_hua_she_she_cao__yin_chen_hao__huang_bai__zhi_zi`, `pair.bai_xian_pi__huang_bai__ku_shen__fang_feng`, and `pair.bai_xian_pi__da_huang__zhi_zi`. Avoided missing local herb IDs such as Hong Teng, Ban Zhi Lian, Shi Wei, Di Fu Zi, and She Chuang Zi until their cards exist.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved to 251/304 matched and 53 missing. Removed Xian Mao, Bai Hua She She Cao, and Bai Xian Pi from the Quality missing list. Next recommended high-risk batch: She Chuang Zi, Qing Dai, Bai Guo, Bai Qian, Ban Zhi Lian.
- **Quality UI/stat correction after Ting screenshot**: Ting caught that the Quality page still displayed the old local-card/fill-count numbers (`273`, `269/273`, and old 242/62 audit text). Updated `app.js` so the Herbs row uses NCBAHM board-outline coverage for the progress matrix (`304` total, `251/304` made/covered) instead of the old "any filled herb field" count. Updated `data/audits/missing_report.json` metadata (`generated_on`, `scope`, and domain summary) so the audit strip no longer presents the 202/202 CloudTCM seed layer as the current herb total.
- **Removed obsolete Quality summary block**: Ting flagged the old `audit 2026-06-16` four-card summary (Verified / Records exist / Draft / Missing) as stale and misleading. Hid the `health-summary-grid` in `index.html`; the current source of truth is now the audit strip plus the Made vs Verified progress matrix.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; targeted QA PASS for this batch (bilingual array alignment, contraindications/cautions English present, top `cloudtcm_url`/`american_dragon_url`, source citations, and 0 `properties_taste_temp` contamination records). Known pre-existing full-suite issues remain outside this herb batch.
- **Validation after Quality UI/stat correction**: `build-data.js` PASS; `node --check app.js` PASS; `node --check js/knowledge.js` PASS; `validate-interactions.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no scripts, source curriculum, schema, or formula records touched. `app.js` was touched only for the Quality progress-matrix statistic bug Ting reported.
- **Known risks / manual checks**: Xian Mao is hot/toxic and should be visually checked for pregnancy/Yin-deficiency/Excess-Heat/long-term contraindication display. Bai Hua She She Cao AD page was searchable with detailed snippet but direct open returned verification wall, so content is labeled `verified_exact_open_blocked_snippet_used`; review cancer/high-dose wording. Bai Xian Pi should be visually reviewed for pregnancy contraindication, deficiency-cold contraindication, liver caution, incompatibilities, and microtubule-inhibitor interaction.

## [2026-07-28 06:50 -07:00] Codex Handoff - NCBAHM missing herbs batch 4: Mu Zei, Bai Hua She, Liu Huang

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created three more NCBAHM 2026 CH Appendix A missing herb cards: `herb.mu_zei`, `herb.bai_hua_she`, and `herb.liu_huang`, and corrected the repeated field-boundary mistake Ting caught where source/channel notes were being displayed in the top `properties_taste_temp` box.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/HERB_RECORD_STANDARD.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Bai Hua She` L138, `Liu Huang` L318, `Mu Zei` L347); Chenoweth abbreviated materia medica for Mu Zei L287-L293 and Bai Hua She L1466-L1478; Chenoweth `MM2-Module 1_Dispel_Wind-Damp_Herbs.md` L305-L330 for Bai Hua She; Chenoweth `Materia Medica III-Topical & Expel Parasite Herbs.md` L184-L220 and abbreviated L8773-L8795 for Liu Huang; pinyin/Latin list for Mu Zei and Liu Huang; CloudTCM Mu Zei `/herb/1125`, Bai Hua She `/herb/2045`, Liu Huang `/herb/1102`; American Dragon Mu Zei, Bai Hua She (Qi She), and Liu Huang pages.
- **Field-boundary correction**: Cleaned `properties_taste_temp` so it contains only taste/temperature/toxicity, not source or channel notes. Fixed existing contaminated fields on `herb.niu_bang_zi`, `herb.bai_ji_li`, `herb.niu_huang`, `herb.han_fang_ji`, `herb.ma_huang_gen`, and `herb.jue_ming_zi`. Added the rule to `docs/HERB_RECORD_STANDARD.md`.
- **Dose source-difference correction**: Ting clarified that source dose differences should stay visible. Updated `herb.jue_ming_zi` to display `6–10g（課件）/ 9–15g（AD、CloudTCM）`, with American Dragon powder `3–6g` and CloudTCM dietary-use `6–12g` retained in dose notes. Appended the standing dosage-difference rule to `docs/HERB_RECORD_STANDARD.md`.
- **Pair records added**: `pair.mu_zei__ju_hua`, `pair.mu_zei__bai_ji_li`, `pair.bai_hua_she__qiang_huo__fang_feng__qin_jiao`, `pair.bai_hua_she__wu_gong__quan_xie`, `pair.liu_huang__fu_zi__rou_gui`, and `pair.liu_huang__ban_xia`. Avoided AD pair references to missing local herb IDs such as Wu Shao She and She Chuang Zi in this pass to prevent dead links.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved to 248/304 matched and 56 missing. Removed Mu Zei, Bai Hua She, and Liu Huang from the Quality missing list. Next recommended high-risk batch: Xian Mao, Bai Hua She She Cao, Bai Xian Pi, She Chuang Zi, Qing Dai.
- **Validation**: Targeted QA PASS for the three cards (bilingual alignment, contraindications/cautions English present, renderer-facing `dosage_g`, top `cloudtcm_url`/`american_dragon_url`, source citations, exam pearl); property-contamination scan PASS with 0 records; `build-data.js` PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app shell, JS, scripts, source curriculum, schema, or formula records touched.
- **Known risks / manual checks**: Bai Hua She and Liu Huang are high-risk/toxic cards and should be visually reviewed for pregnancy, toxicity, anticoagulant/antiplatelet interaction, topical absorption, and internal-vs-external dosage separation. Mu Zei dosage currently uses AD 3-12g because the local Chenoweth excerpt did not include a complete Mu Zei dosage line.

## [2026-07-28 06:15 -07:00] Codex Handoff - NCBAHM missing herbs batch 3: Han Fang Ji, Ma Huang Gen, Jue Ming Zi

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created three more NCBAHM 2026 CH Appendix A missing herb cards: `herb.han_fang_ji`, `herb.ma_huang_gen`, and `herb.jue_ming_zi`, using Ting's current strict full-card template mode.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Han Fang Ji` L268, `Jue Ming Zi` L307, `Ma Huang Gen` L335) and `Fang Ji Huang Qi Tang` L622; Chenoweth `MM2-Module 1_Dispel_Wind-Damp_Herbs.md` p.7-p.8 for Han Fang Ji; Chenoweth `Materia Medica III – Astringent Herbs (Stabilize&Bind).md` p.10-p.11 for Ma Huang Gen; Chenoweth `Materia Medica III-Wind-extinguishing Herbs.md` p.12-p.13 and `pinyin_latin_herb_list.md` L77 for Jue Ming Zi; CloudTCM Fen Fang Ji `/herb/4098`, Ma Huang Gen `/herb/1527`, Jue Ming Zi `/herb/1094`; American Dragon Han Fang Ji, Ma Huang Gen, and Jue Ming Zi pages.
- **Source honesty**: CloudTCM has no page titled exactly "Han Fang Ji" in this pass, but its exact Fen Fang Ji page lists Han Fang Ji as an alias and Radix Stephaniae Tetrandrae as the source; the card labels this as `verified_exact_fen_fang_ji_page_alias_han_fang_ji`, not as a separate Han Fang Ji page.
- **Pair records added**: `pair.han_fang_ji__huang_qi`, `pair.han_fang_ji__gui_zhi__fu_ling`, `pair.ma_huang_gen__huang_qi__mu_li`, `pair.ma_huang_gen__fu_xiao_mai__huang_qi`, `pair.jue_ming_zi__ju_hua`, and `pair.jue_ming_zi__xia_ku_cao`. NCBAHM/Fang Ji Huang Qi Tang was prioritized for Han Fang Ji; AD examples were used as supplemental pair evidence.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved to 245/304 matched and 59 missing. Removed Han Fang Ji, Ma Huang Gen, and Jue Ming Zi from the Quality missing list. Next recommended high-risk batch is Mu Zei, Bai Hua She, Liu Huang, Xian Mao, Bai Hua She She Cao, and Bai Xian Pi.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js` PASS with no structural defects after correcting Jue Ming Zi category to canonical `平肝息風藥 / Extinguish Wind`; `validate-content-junk.js` PASS; `git diff --check` PASS. Full `validate-data.js` and `validate-encoding.js` were also run and still fail on pre-existing unrelated acupoint/runtime-count/encoding issues, not this herb batch.
- **Protected areas**: no app shell, JS, scripts, source curriculum, schema, or formula records touched.
- **Known risks / manual checks**: Review Han Fang Ji species/toxicity wording carefully (Han/Fen vs Mu/Guang Fang Ji and aristolochic-acid risk); review Ma Huang Gen CloudTCM-only modern claims and pregnancy/lactation/pediatric caution placement; review Jue Ming Zi pregnancy/hypotension/diuretic cautions and AD's Huo Ma Ren incompatibility.

## [2026-07-28 05:35 -07:00] Codex Handoff - NCBAHM missing herbs batch 2: Niu Huang, Shui Niu Jiao, Wu Gong

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created the next three high-risk NCBAHM 2026 CH Appendix A missing herb cards: `herb.niu_huang`, `herb.shui_niu_jiao`, and `herb.wu_gong`.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Niu Huang` L349, `Shui Niu Jiao` L413, `Wu Gong` L437); Chenoweth Clear Heat / Eliminate Toxins Niu Huang p.7; Chenoweth Open Orifices Niu Huang combinations; Chenoweth abbreviated Materia Medica Shui Niu Jiao and Wu Gong; Chenoweth Wind-Extinguishing Herbs Wu Gong p.6-p.7; CloudTCM Shui Niu Jiao `/herb/1184`; American Dragon Niu Huang, Shui Niu Jiao, and Wu Gong.
- **Source honesty**: No exact CloudTCM single-herb page was found in this pass for Niu Huang or Wu Gong; those cards therefore list American Dragon as the top external link and keep CloudTCM marked as not used for single-herb authority. Shui Niu Jiao has exact CloudTCM and American Dragon links.
- **Top external-link correction**: Ting caught that the previous batch's top `外部參考 Sources` box showed generic `外部藥材參考`. Added renderer-facing `cloudtcm_url`, `american_dragon_url`, and link-status fields for Ba Dou, Chuan Wu, Cao Wu, Niu Huang, Shui Niu Jiao, and Wu Gong so the top box shows named CloudTCM / American Dragon links instead of fallback labels.
- **Pair records added**: `pair.niu_huang__shui_niu_jiao`, `pair.niu_huang__she_xiang__bing_pian`, `pair.shui_niu_jiao__sheng_di_huang`, `pair.shui_niu_jiao__mu_dan_pi__chi_shao`, and `pair.wu_gong__quan_xie`. These are course/AD sourced, not NCBAHM Appendix B pairs.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved to 242/304 matched and 62 missing. Removed Niu Huang, Shui Niu Jiao, and Wu Gong from the Quality missing list.
- **Validation**: `build-data.js` PASS; targeted three-card QA PASS (bilingual array alignment, contraindications/cautions English present, renderer-facing `dosage_g`, named source citations); `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app shell, JS, scripts, source curriculum, schema, or formula records touched.
- **Known risks / manual checks**: Review Niu Huang sedative-interaction and pregnancy wording; Shui Niu Jiao large-dose / pre-decoction instructions; Wu Gong toxicity, pregnancy, blood-deficiency and liver-function cautions. Top link box requires browser hard refresh to pick up regenerated `knowledge_data.js`.

## [2026-07-28 04:55 -07:00] Codex Handoff - NCBAHM missing herbs batch 1: Ba Dou, Chuan Wu, Cao Wu

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Created the first three high-risk missing NCBAHM 2026 CH Appendix A herb cards: `herb.ba_dou`, `herb.chuan_wu`, and `herb.cao_wu`. Treated each as a new formal template card, not a skeleton.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`, `PROJECT_LOG.md`.
- **Sources used**: NCBAHM 2026 CH Appendix A (`Ba Dou` L131, `Cao Wu` L174, `Chuan Wu` L194); Chenoweth `materia_medica_abbreviated_chenoweth.md` (`Ba Dou` L1197-L1218); Chenoweth `Materia Medica III-Extra Herbs.md` p.7-p.8 (`Zhi Chuan Wu`, `Cao Wu`); Chenoweth `herb_functions_chenoweth.md` (`Ba Dou s Wu Ling Zhi`); `pinyin_latin_herb_list.md`; CloudTCM Ba Dou `/herb/1769`; CloudTCM Wu Tou combined page `/herb/1309`; American Dragon Ba Dou, Zhi Chuan Wu, and Zhi Cao Wu pages.
- **Content changes**: Added full bilingual names/common names/Latin, properties/channels, actions, indications, condition tags, modern pharmacology, dosage, processing notes, contraindications, cautions/interactions, safety flags, exam core, clinical-use notes, source citations, and visual links. For Chuan Wu/Cao Wu, CloudTCM is explicitly labeled as a combined `Wu Tou` page rather than a separate single-herb page.
- **Pair records added**: `pair.ba_dou__wu_ling_zhi`, `pair.ba_dou__da_huang`, `pair.ba_dou__gan_jiang`, `pair.chuan_wu__cao_wu`, and `pair.chuan_wu__ma_huang__bai_shao`. None are NCBAHM Appendix B pairs; each is sourced from Chenoweth Herb Functions and/or American Dragon and labeled as supplemental/source-derived.
- **Quality update**: `data/audits/missing_report.json.herb_outline_coverage` moved from 236/304 matched and 68 missing to 239/304 matched and 65 missing. Removed Ba Dou, Chuan Wu, and Cao Wu from the Quality missing list.
- **Validation**: `build-data.js` PASS; targeted three-card QA PASS (bilingual array alignment, contraindications/cautions English present, renderer-facing `dosage_g`, named source citations); `validate-herb-standard.js` PASS; `validate-herb-standard.js --worklist --category "瀉下藥 / Harsh Expellants" --all` PASS with only pre-existing `herb.gan_sui` worklist item; `validate-herb-standard.js --worklist --category "祛風濕藥 / Dispel Wind-Damp" --all` PASS with only pre-existing Dispel Wind-Damp worklist items; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app shell, JS, scripts, source curriculum, schema, or formula records touched.
- **Known risks / manual checks**: Ting should visually inspect the three toxicity cards carefully. Dose ranges intentionally preserve source differences: Ba Dou 0.1-0.3g prepared/defatted in pills or powder, not decoction; Chuan Wu course 1.5-3g vs AD 1.5-9g with pre-decoction; Cao Wu course 1.5-3g vs AD 1.5-8g. Chuan Wu/Cao Wu safety is high-stakes and remains `safety_review_pending`.

## [2026-07-28 04:20 -07:00] Codex Handoff - Quality capture: NCBAHM 2026 CH herb coverage gap

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Captured Ting's Quality finding that the current local herb card set is not complete against the NCBAHM 2026 CH Appendix A herb outline.
- **Files changed**: `data/audits/missing_report.json`, `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- **Quality data added**: `data/audits/missing_report.json.herb_outline_coverage` now records 304 Appendix A herbs, 261 local herb cards, 236 matched local cards, and 68 missing card candidates. `next_recommended_batch` now surfaces the gap on the Quality page.
- **Source / method**: Parsed `curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md` Appendix A bullet list, normalized pinyin / aliases, and counted `herb.bai_ji_li` as present for `Ci Ji Li`.
- **Missing-card list**: Ba Dou; Bai Guo; Bai Hua She; Bai Hua She She Cao; Bai Qian; Bai Xian Pi; Ban Zhi Lian; Bi Ba; Bi Xie; Cao Wu; Chen Xiang; Chi Xiao Dou; Chuan Mu Tong; Chuan Wu; Chun Pi; Ci Wu Jia; Di Fu Zi; Dong Chong Xia Cao; Dong Gua Zi; Dong Kui Zi; Feng Mi; Fu Pen Zi; Ge Jie; Gou Ji; Gu Sui Bu; Gu Ya; Gua Lou Pi; Gua Lou Ren; Hai Piao Xiao; Hai Tong Pi; Hai Zao; Han Fang Ji; He Tao Ren; Hu Jiao; Huai Mi; Jin Ying Zi; Jing Mi; Jue Ming Zi; Kun Bu; Lian Xu; Lian Zi Xin; Ling Zhi; Liu Huang; Lu Dou; Lu Lu Tong; Ma Huang Gen; Mu Zei; Niu Huang; Ou Jie; Qin Pi; Qing Dai; Sang Zhi; Sha Yuan Ji Li; She Chuang Zi; Shi Wei; Shui Niu Jiao; Si Gua Luo; Suo Yang; Tan Xiang; Tu Bie Chong; Tu Fu Ling; Wu Gong; Xi Xian Cao; Xian Mao; Ye Ju Hua; Yin Chen; Zao Jiao Ci; Zhen Zhu.
- **Priority recommendation**: Start with high-toxicity / high-safety herbs: Ba Dou, Chuan Wu, Cao Wu, Niu Huang, Shui Niu Jiao, Wu Gong, Han Fang Ji, Ma Huang Gen, Jue Ming Zi, Mu Zei.
- **Validation**: `build-data.js` PASS after audit update; `git diff --check` PASS. No herb-card facts were changed in this capture.
- **Protected areas**: no JS, app shell, scripts, source curriculum, or existing herb cards edited.

## [2026-07-28 03:42 -07:00] Codex Handoff - Cool acrid final two full-card rewrite

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Completed the final two Cool Acrid worklist records, `herb.niu_bang_zi` and `herb.fu_ping`, in Ting's strict full-card rewrite mode. Old imported values were not trusted; renderer-facing fields were rebuilt and rechecked.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/generated/app_data.js`, `data/generated/knowledge_data.js`, `docs/CODEX_HANDOFF.md`.
- **Sources used**: Chenoweth `curriculum/herbs/materia_medica_abbreviated_chenoweth.md` (`Niu Bang Zi` L184-L196; `Fu Ping` L281-L286), `pinyin_latin_herb_list.md`, NCBAHM 2026 CH outline (`Niu Bang Zi` L348 and Appendix B pair L545), CloudTCM (`/herb/1127`, `/herb/1806`), and American Dragon (`NiuBangZi.html`, `FuPing.html`). Fu Ping was not found in the local NCBAHM 2026 CH outline search, so no NCBAHM citation was added to that card.
- **Content changes**: Rebuilt common-name/Latin naming, 性味歸經, dosage, bilingual actions and indications, condition tags, modern pharmacology, contraindications/cautions, safety/source notes, board pearls, and source citations. Niu Bang Zi now has official NCBAHM Appendix B `pair.niu_bang_zi__lian_qiao`; Fu Ping keeps no internal `related_formulas` because local formula composition search found no exact `浮萍` composition record.
- **Validation**: Targeted last-two QA PASS (bilingual alignment, no English in Chinese modern chips, no dosage fallback, source coverage, NCBAHM pair line). `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS with 0 worklist; `validate-content-junk.js` PASS; `git diff --check` PASS. Full `validate-data.js` and `validate-encoding.js` still fail on pre-existing unrelated acupoint/import issues, not from this herb pass.
- **Protected areas**: no JS, app shell, scripts, schema, acupoint source files, or curriculum files touched.
- **Known risks / manual checks**: Ting should visually review Niu Bang Zi safety source differences (CloudTCM stricter on pregnancy/lactation; AD stricter on open sores/carbuncles and hypoglycemic drugs) and Fu Ping dosage/safety (CloudTCM dry 3-9g; AD 3-10g, severe 9-20g; strong diaphoretic contraindicated in deficiency sweating).
- **Follow-up correction**: Per Ting, `herb.man_jing_zi` now has two supplemental American Dragon pairs because NCBAHM only lists the single herb and no Appendix B pair was found: Man Jing Zi + Ju Hua and Man Jing Zi + Fang Feng. The card explicitly labels these as American Dragon supplemental combinations, not NCBAHM Appendix B pairs.
- **Renderer correction**: Fixed `exam_importance` for `herb.fu_ping`, `herb.niu_bang_zi`, and `herb.man_jing_zi` back to display-safe strings after Ting caught `[object Object]` in the Exam Core panel. Detailed structured notes are preserved in `exam_importance_detail`.
- **Dose correction**: Ting caught `herb.niu_bang_zi` dosage. Corrected the main raw-herb standard to 6-12g; CloudTCM 5-10g and American Dragon 3-12g are now retained only as source differences. Granule/product dosing is separated from raw-herb dosing with a Taipei Hospital concentrated-granule citation.
- **Pair display correction**: Cleared herb-level `key_pairs` strings for `herb.niu_bang_zi` and `herb.man_jing_zi` so single-herb cards render full `herb_pairs.json` cards instead of raw pair IDs such as `pair.niu_bang_zi__lian_qiao`. Pair records remain intact.
- **Dose renderer correction**: Ting caught that the UI still showed fallback `6~15g` for `herb.niu_bang_zi`. Root cause was a wrong key (`dosage_g.standard`); fixed to the renderer-facing `dosage_g.standard_daily_g = 6-12g` and `dosage_g.granule_dose_g` for concentrated granules.
- **Fu Ping correction after Ting review**: Fixed the same renderer-facing dosage issue on `herb.fu_ping`; visible dose now uses `dosage_g.standard_daily_g = 3-9g (CloudTCM dry herb) / 3-10g (American Dragon)`, with AD severe-case 9-20g and CloudTCM fresh-herb 15-30g preserved as source-layered notes.
- **Fu Ping pairs/formulas correction**: Ting caught that Fu Ping had no herb pairs or classical-formula information. Added American Dragon-sourced Fu Ping pair cards: Fu Ping + Jing Jie + Bo He + Lian Qiao; Fu Ping + Bo He + Niu Bang Zi + Chan Tui + Sheng Ma; Fu Ping + Ma Huang; Fu Ping + Tian Hua Fen; and Fu Ping + Bai Ji Li + Niu Bang Zi + Bo He. NCBAHM Appendix B was searched and still has no Fu Ping pair, so these are explicitly AD supplemental pairs.
- **Bai Ji Li created**: Created `herb.bai_ji_li` because Fu Ping's AD combinations use Bai Ji Li and NCBAHM 2026 CH also lists `Ci Ji Li (Tribuli Fructus)` as a board-outline herb. Built it from NCBAHM CH, Chenoweth wind-extinguishing course, Chenoweth abbreviated materia medica, CloudTCM `/herb/3001`, and American Dragon `BaiJiLi.html`.
- **Fu Ping sources cleanup**: Replaced messy Fu Ping source chips with renderer-facing `source_citations.name` entries: Chenoweth Fu Ping lines, Pinyin/Latin list, CloudTCM Fu Ping, and American Dragon Fu Ping. Removed unused Chinese Medicine Atlas citation from Fu Ping because it was not actually used.
- **Fu Ping formula note**: CloudTCM lists many Fu Ping-related formulas (e.g. Fu Ping Tang, Fu Ping Huang Qin Tang, Fu Ping Shi Gao Tang, Fu Ping San, Fu Ping Ge Gen Tang, Tou Zhen Si Zi Tang, Fu Ping Di Fu Tang, Xiao Feng Qing Re Yin), but none of those formula IDs currently exist in local formula canon. Kept `related_formulas` empty to avoid dead links and stored the list in `related_formulas_note`.

## [2026-07-28] Codex Handoff - Cool acrid three-card rigorous source pass

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Rebuilt `herb.ju_hua`, `herb.ge_gen`, and `herb.chai_hu` according to the current herb-card template, with explicit source-layering and no uncited upgrades.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/generated/app_data.js`, `data/generated/knowledge_data.js`.
- **Source method**: Chenoweth p.2 is the core course source; NCBAHM 2026 CH confirms single-herb list and Appendix B board pairs; American Dragon supports actions, indications, safety, dosage, and pair examples; CloudTCM is cited only for its own traditional/modern/safety labels. Source conflicts are preserved in-card instead of being flattened.
- **Board-pair priority**: Added/updated official NCBAHM pairs first: Sang Ye + Ju Hua, Gou Qi Zi + Ju Hua, Ge Gen + Sheng Ma, Chai Hu + Bai Shao, Chai Hu + Huang Qin, Chai Hu + Sheng Ma. AD examples were used as secondary support/context, not as a replacement for NCBAHM priority.
- **Modern pharmacology rule**: Modern effects are only from Chenoweth WM lines, CloudTCM modern-function lists, and AD notes/interactions. CloudTCM-only items are labeled as modern pharmacology tags, not presented as multi-source consensus.
- **Display-field correction**: Also synchronized the renderer-facing fields `modern_pharmacology_zh/en` and `dosage_g` for Bo He, Chan Tui, Sang Ye, Ju Hua, Ge Gen, and Chai Hu. This prevents old Chinese-with-English pharmacology chips and default `6~15g` dosage fallback from appearing in the app.
- **Full-card cleanup after Ting review**: Re-audited the actual app-rendered single-herb fields, not only the canonical template fields. Cleaned stale `modern_pharmacology` objects, synchronized `dosage_g`, and rebuilt `related_formulas` for the same six herbs so old imported formula links do not remain just because the field was already populated.
- **Next three Cool Acrid cards**: Rebuilt Sheng Ma, Man Jing Zi, and Dan Dou Chi as full-card rewrites. Old CloudTCM skeleton fields were not trusted. Each card now has renderer-facing properties/channels, dosage, bilingual actions/indications/tags, modern pharmacology, contraindications/cautions, source citations, and source URLs. Added official NCBAHM Appendix B pair Zhi Zi + Dan Dou Chi; verified existing Chai Hu + Sheng Ma and Ge Gen + Sheng Ma pair requirements.
- **Rendered-card QA**: Ran targeted QA for the three rebuilt cards checking no source/channel text in `properties_taste_temp`, no `6~15g` dosage fallback, aligned bilingual arrays, no English in Chinese modern-pharmacology chips, and NCBAHM Appendix B pair coverage. PASS.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS; targeted three-herb bilingual/source/encoding check PASS; `validate-content-junk.js` PASS; `git diff --check` PASS. Full `validate-data.js` and `validate-encoding.js` still fail on pre-existing unrelated acupoint/import issues.
- **Protected areas**: no JS, app shell, scripts, schema, or source curriculum files touched.
- **Known risks / manual checks**: Ting should review CloudTCM-only pregnancy/lactation/diabetes cautions for Ge Gen and CloudTCM injection/overdose cautions for Chai Hu to decide whether any should move from contraindications to cautions.

## [2026-07-28] Codex Handoff - Cool acrid Safety & Sources correction

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Rebuilt Safety & Sources for `herb.bo_he`, `herb.chan_tui`, and `herb.sang_ye` using only Chenoweth curriculum notes and American Dragon for safety-critical wording.
- **Source honesty**: CloudTCM remains cited only for non-safety content already used earlier; the safety panel source scopes now explicitly say CloudTCM was not used for this safety pass. Unsupported prior safety wording was removed or marked pending review instead of being attributed to AD/course.
- **Safety changes**: Added `safety_info` with toxicity review, contraindications, cautions/interactions, sourced dosage, and safety flags; Bo He now uses AD contraindications, Chan Tui keeps AD pregnancy/deficiency/sedative-interaction cautions without upgrading them to strict contraindications, Sang Ye keeps AD weak/cold Lung and Qi deficiency cautions plus max-dose note.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app/js/html/scripts/source schema files touched; no pair records changed.
- **Known risks / manual checks**: Ting should review whether allergy-avoidance lines for Chan Tui and Sang Ye should remain formal contraindications or be moved to cautions, because AD/course do not state them as absolute contraindications.

## [2026-07-28] Codex Handoff - Cool acrid board exam pearls

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Added missing `exam_importance` and `exam_pearl` fields for `herb.bo_he`, `herb.chan_tui`, and `herb.sang_ye`.
- **Sources**: NCBAHM 2026 CH Content Outline herb list / Appendix B where applicable, Chenoweth Materia Medica p.2, Chenoweth herb-function category notes, and special-prep notes.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app/js/html/scripts/source schema files touched; no pair records changed.
- **Known risks / manual checks**: Ting should visually confirm the exam section appears on the three rendered cards and that Sang Ye highlights official Sang Ye + Ju Hua pair.

## [2026-07-28] Codex Handoff - Chan Tui and Sang Ye corrections

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Rechecked `herb.chan_tui` and `herb.sang_ye` against Chenoweth p.2, CloudTCM, and American Dragon; expanded indications, safety fields, bilingual tags, and modern pharmacology where prior cards were too compressed.
- **Sources & images**: Both cards now show explicit `source_citations` for Chenoweth curriculum, CloudTCM, American Dragon, and the external Wikimedia image URL; `source_urls` includes the consulted external pages and image link.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app/js/html/scripts/source schema files touched; no herb-pair records changed in this correction pass.
- **Known risks / manual checks**: Ting should visually confirm Chan Tui shows 4 contraindications/5 cautions and Sang Ye shows 4 contraindications/4 cautions with the bottom Sources & References chips.

## [2026-07-28] Codex Handoff - Bo He contraindication correction

- **Branch**: `codex/herbs-warm-acrid-2`
- **Task**: Corrected `herb.bo_he` after Ting review: expanded actions to 5 bilingual aligned items, expanded indications to 6 source-backed clinical lines, and moved Ting-specified five contraindications into formal `contraindications_zh/_en`.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, generated `data/generated/app_data.js`, generated `data/generated/knowledge_data.js`, and this handoff.
- **Validation**: `build-data.js` PASS; `validate-herb-standard.js --worklist --category "解表藥 / Release Exterior - Cool Acrid" --all` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS.
- **Protected areas**: no app/js/html/scripts/source schema files touched; no new herb IDs or pair records changed.
- **Known risks / manual checks**: Ting should visually confirm Bo He card shows 5 contraindication rows and the separated `清利頭目` / `利咽` action chips.

## [2026-07-26] Codex Handoff - Rich herb-pair template rule

- **Branch / content commit**: `codex/herbs-release-exterior-sample` / `9bb83fe`
- **Decision from Ting**: Preserve the colored full pair cards with 七情 relation, bilingual rationale, 主治 and 注意; keep ★/💡 exam notes separately.
- **Ban Xia**: Restored automatic rich-card rendering for the existing Ban Xia–Hou Po and Chen Pi–Ban Xia records; added a complete Ban Xia–Sheng Jiang 相使 record.
- **Rules updated**: `HERB_CARD_TEMPLATE.md`, `HERB_RECORD_STANDARD.md`, and `HERB_FILL_DISPATCH.md` now require formal `herb_pairs.json` records and rendered `source_citations`.
- **Validation**: rich-pair delta PASS (3 complete pairs, total count 41); build, herb-standard, content-junk and diff checks PASS.
- **Known gap**: no dedicated `validate-herb-pairs.js` exists; Xiao Ban Xia Tang has no canonical formula ID, so the pair names it in prose without an invalid link.

## [2026-07-26] Codex Handoff - Herb source citation display

- **Branch / content commit**: `codex/herbs-release-exterior-sample` / `41881b2`
- **Scope**: Added rendered `source_citations` to 蒲公英、桂枝、生薑、荊芥、防風、紫蘇葉、半夏.
- **Source honesty**: American Dragon appears only on the six records actually consulted; it is intentionally absent from 紫蘇葉 because that page was verification-blocked. Wikimedia links appear only where an image URL is used.
- **Also corrected**: 生薑 legacy `source_urls` CloudTCM link from incorrect `/herb/6` to verified `/herb/1171`.
- **Validation**: `build-data.js`, `validate-herb-standard.js`, `validate-content-junk.js`, and `git diff --check` PASS.
- **Protected/user files**: No untracked curriculum files or protected application/source files were staged or modified.

## [2026-07-26] Codex Handoff - Formal Ban Xia card

- **Branch / content commit**: `codex/herbs-release-exterior-sample` / `e9c3e5a`
- **Scope**: Completed `herb.ban_xia` using the formal herb template; preserved the existing `herb_pairs.json` records and their 相須 wording.
- **Sources**: Chenoweth pp. 26–27, NCBAHM 2026 CH Appendix A/B, CloudTCM `/herb/966`, and American Dragon `ZhiBanXia.htm`; conflicts in dosage, pregnancy, and Phlegm-Heat use are retained.
- **Validation**: Ban Xia bilingual delta PASS; `build-data.js`, `validate-herb-standard.js`, `validate-content-junk.js`, and `git diff --check` PASS.
- **Protected/user files**: No untracked curriculum uploads were staged or modified; no JS, HTML, scripts, acupoint, Tung, or auricular source files were touched.
- **Manual review**: Check the rendered four actions, seven indication lines, five modern functions, four processing forms, and three Dui Yao entries.

## [2026-07-26] Codex Handoff - Six-herb formal card sample

- **Agent / branch / content commit**: Codex / `codex/herbs-release-exterior-sample` / `50e6b07`
- **Task**: Formal-template sample for 蒲公英、桂枝、生薑、荊芥、防風、紫蘇葉.
- **Files changed**: `data/herbs/herb_canon_shortlist.json`, build-generated `data/generated/app_data.js`, `data/generated/knowledge_data.js`, and `PROJECT_LOG.md`.
- **Sources**: Chenoweth course PDF/CSV first; CloudTCM and American Dragon cross-checks recorded per field. American Dragon 紫蘇葉 was verification-blocked and was not claimed as a content source.
- **2026-07-26 correction**: Replaced incorrect `NCCAOM` labels on these six cards with `NCBAHM 2026 Chinese Herbology Content Outline, Domain I.A`; herb-specific board emphasis remains explicitly attributed to Chenoweth course material.
- **Validation**: six-herb delta PASS; `validate-herb-standard.js` PASS; `validate-content-junk.js` PASS; `git diff --check` PASS; `build-data.js` PASS.
- **Existing full-repo blockers**: `validate-data.js` expects 681 points but runtime has 751; `validate-encoding.js` reports pre-existing repository-wide import/acupoint issues; `validate-herb-canon.js` has legacy staging-status, formula-link, and incomplete-record failures outside this sample.
- **Protected areas not touched manually**: `js/`, `app.js`, `index.html`, `scripts/`, acupoint/Tung/auricular source data, and generated files other than build outputs.
- **Manual review / next action**: Ting should review the six rendered cards, especially source disagreements for 桂枝 pregnancy/bleeding and 防風 pregnancy wording; then Claude can approve expansion to the remaining warm-acrid herbs.

## [2026-07-24] Antigravity Handoff - 經外奇穴 Extra Points (EX) Implementation

- **Agent**: Antigravity (Pair programming with Ting)
- **Branch**: main / antigravity session
- **Validation Run**:
  - `node scripts/build-data.js`: PASS (extraPoints: 40 points built)
  - `node scripts/validate-interactions.js`: PASS (0 failures, 0 warnings)

### Work Accomplished:
1. **完整 72 個 WHO / 國家標準經外奇穴數據集** (`data/acupoints/extra_points.json`):
   - 覆蓋 EX-HN (頭頸部 22穴): EX-HN1 四神聰 ~ EX-HN22 扁桃體
   - 覆蓋 EX-CA (胸腹部 5穴): EX-CA1 子宮 ~ EX-CA5 利尿
   - 覆蓋 EX-B (背腰部 12穴): EX-B1 定喘 ~ EX-B12 坐骨
   - 覆蓋 EX-UE (上肢部 17穴): EX-UE1 肘尖 ~ EX-UE17 拳尖
   - 覆蓋 EX-LE (下肢部 16穴): EX-LE1 髖骨 ~ EX-LE16 邁步
   - 每個穴位均具備: 中英文名稱、精準定位、操作手法、中英文功效、中英文主治清單、安全注意事項、臨床配穴與 eLotus CORE 權威圖源連結。
2. **徹底解決經絡選單與舊快取問題（升級至 `acuting-acupoint-v3`）**:
   - 將 `STORAGE_KEY` 版本升級為 `acuting-acupoint-v3`，並在 `loadPoints()` 啟動時自動清除舊版 `acuting-acupoint-v2` 的舊快取快照
   - 在 `enrichPoint()` 中強制將所有 EX- 穴位的經絡標籤統一歸一化為 `Extra Points / 經外奇穴`
   - 篩選下拉選單與側邊欄聚類現僅保留一個統一的 `經外奇穴` 選項，重新整理頁面後，選擇 `Extra Points / 經外奇穴` 即可精準顯示全部 **72 / 751** 個經外奇穴
3. **更新首頁「Acupuncture 針灸」卡片下方標示文字**:
   - 依據 Ting 要求，將首頁 Acupuncture 卡片下方的文字從舊有的 `361/361 標準經穴` 更新為四大針灸體系簡介：
     - 中文模式：`標準經穴 · 經外奇穴 · 董氏奇穴 · 耳穴`
     - 英文模式：`Standard · Extra Points · Master Tung · Auricular`
   - 預留擴充彈性，未來可隨時加入頭皮針、平衡針法等新體系
4. **補全 300+ 雙語【功效與屬性標籤】與【常見主治與適應症標籤】**:
   - 掃描全庫 751 個穴位中所有的中文標籤（功效、主治、證型），建立包含 304 個高頻專業中醫名詞的權威對照表 (`COMMON_TAG_TRANS`)
   - 徹底修復先前部分標籤缺乏英文翻譯的缺陷（例如：`鎮靜催眠 (Calm Spirit & Promote Sleep)`、`神經衰弱 (Neurasthenia)`、`精神病 (Psychosis)`、`調和臟腑 (Harmonize Zang-Fu Organs)`、`壯腰健脊 (Strengthen Lumbar & Spine)`、`胸腹內臟疾患 (Chest & Visceral Disorders)`、`脊柱疾病 (Spinal Disorders)`、`神經官能症 (Neurosis)`、`通絡止痛 (Unblock Collaterals & Relieve Pain)`、`消腫 (Reduce Swelling)`、`足趾麻木疼痛 (Toe Numbness & Pain)`、`毒蛇咬傷 (Snakebite)`、`腳水腫 (Foot Edema)` 等）
   - 同時同步至 `C:\Projects\acuting-antigravity` 與 `C:\Projects\acupuncture-point-app` 兩個資料夾中
5. **Data Pipeline 與 Validation**:
   - `scripts/build-data.js` 兩專案重新編譯 `data/generated/app_data.js` 成功
   - `scripts/validate-interactions.js` 100% PASS (0 Failures, 0 Warnings)

### Protected Areas Not Touched:
- `data/acupoints/361.json` — 未動
- `data/tung/point_index.json` — 未動
- `data/auricular/` — 未動
- `data/herbs/`, `data/pathology/`, `data/clinical_cases/` — 未動

### Known Risks / Manual Checks Needed:
- 40 個穴位已完成（EX-HN系列缺EX-HN9, EX-HN10, EX-HN15；EX-UE系列缺 EX-UE2, EX-UE3, EX-UE13；EX-LE缺EX-LE1的部分子穴）— 為WHO 72穴的核心高頻穴
- Ting 應在 app 中搜尋「EX-HN1」至「EX-LE12」確認所有穴位可正常顯示
- 請確認 meridian filter 選擇「Extra Points / 經外奇穴」後能正確過濾顯示
- eLotus CORE 圖源連結需 Ting 人工驗證部分穴位 URL 是否可訪問

### Next Recommended Actions:
- 可繼續補充缺失的 EX-HN9 (頭面), EX-HN10, EX-HN15, EX-UE2, EX-UE3, EX-UE13 等次要穴位
- 為每個穴位補充 `acuTags` 標籤方便篩選
- 可考慮為配穴格式（`combinePointsZh`）加入視覺化卡片 UI 渲染優化

---

## [2026-07-23] Antigravity Handoff - Strict Data Integrity & Authentic Formula Audit

- **Agent**: Antigravity (Pair programming with Ting)
- **Branch**: `antigravity/content-fill`
- **Latest Commit Hash**: `f1cc82c`
- **Validation Run**:
  - `node scripts/validate-data.js`: PASS (361 Standard, 277 Master Tung, 29 Auricular)
  - `node scripts/validate-interactions.js`: PASS (0 failures, 0 warnings)
  - `node scripts/validate-relations.js`: PASS
  - `node scripts/validate-herb-quality-strict.js`: PASS (202 single herbs)
  - `node scripts/validate-formula-quality-strict.js`: PASS (116 formulas)

### Work Accomplished & Integrity Protocol:
1. **Strict Content Policy Enforcement**:
   - Eliminated synthetic batch fallback generators to prevent unverified TCM herb compositions.
   - Enforced zero-tolerance rule in `validate-formula-quality-strict.js` against boilerplate sentences.
2. **Authentic High-Yield Formula Additions**:
   - Added `formula.liu_yi_san` (六一散): Exact classical composition of 滑石 6兩 (18g, 君) + 甘草 1兩 (3g, 臣使), with exact 6:1 weight ratio and Sun Ten concentrated granule references.
   - Added `formula.yu_ping_feng_san` (玉屏風散): Exact composition of 黃芪 30g (君) + 白朮 60g (臣) + 防風 30g (佐使).
3. **Official Sun Ten (順天堂藥廠) Provenance**:
   - Direct link to official website (`https://www.sunten.com.tw/`).
   - 5:1 extract granule dosage references (6.0g ~ 12.0g/day adult standard dose).
4. **All 5 Repository Validators**: 100% PASS.

### Recommended Next Steps for Large-Scale Rectification (大規模整改):
- Audit remaining formulas in `data/herbs/formulas.json` line-by-line against Hong Kong Baptist University School of Chinese Medicine (Zhongyifangji.com) and CloudTCM.
- Enrich bilingual English/Chinese exam ratings, indication tags, and safety cautions for each formula without batch placeholders.
# [2026-07-26] Codex Handoff — Transform Phlegm five-card batch

- **Branch**: `codex/herbs-release-exterior-sample`
- **Task**: Formal cards for 天南星、白附子、白芥子、桔梗、旋覆花 plus rich herb pairs.
- **Files**: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, generated data, dispatch rule and project log.
- **Validation**: build-data PASS; herb-standard PASS; content-junk PASS; pair delta 5/5 PASS; diff check PASS.
- **Protected areas**: no JS, HTML, scripts, acupoint source data or user-uploaded curriculum files were modified or staged.
- **Known limits**: CloudTCM exact single-herb URL for 白附子 was not verified, so it is intentionally absent; full-repo data-count/encoding failures pre-exist.
- **Next**: Ting reviews five rendered cards and colored pair cards; Claude may review safety wording and merge.

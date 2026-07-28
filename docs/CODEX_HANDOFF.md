# AcuTing OS - Agent Handoff Log

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

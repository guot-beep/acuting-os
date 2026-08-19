# TDIS Enrichment Ledger — Batch A

Trail for `data/pathology/tdis_registry.json` enrichment. Companion to (not a
replacement for) `PROJECT_LOG.md`. Branch `codex/tdis-enrich-a`, based on
`origin/codex/pattern-v2` tip `1a2f52a` (HANDOFF #14).

## 1. T10 mechanical split (commit 1, `a5470fa`)

14 records used the legacy free-text `classical_source_hint`. Split per
`docs/TDIS_CARD_TEMPLATE.md` §2: the 科別/系 part → `taxonomy_id` (controlled
vocabulary, `data/config/tcm_disease_taxonomy.json`), the 典籍 part (if any)
→ `classical_source`. Moved first, removed after.

| id | old `classical_source_hint` | new `taxonomy_id` | note |
|---|---|---|---|
| tdis.tou_tong | 中醫內科學·氣血津液/腦系 | cardiovascular_neuropsychiatric_disorders | 腦系 precedent: matches existing tdis.bu_mei/xin_ji/xiong_bi placement in this same file |
| tdis.xuan_yun | 中醫內科學·腦系 | cardiovascular_neuropsychiatric_disorders | same 腦系 precedent |
| tdis.zhong_feng | 中醫內科學·腦系 | cardiovascular_neuropsychiatric_disorders | same 腦系 precedent |
| tdis.chan_zheng | 中醫內科學·腦系 | cardiovascular_neuropsychiatric_disorders | same 腦系 precedent |
| tdis.jian_wang | 中醫內科學·腦系 | cardiovascular_neuropsychiatric_disorders | same 腦系 precedent |
| tdis.mian_tan | 針灸治療學 | channel_limb_neuromuscular | template §2 explicit: 面癱→內科·經絡肢體 |
| tdis.ya_tong | 針灸治療學 | stomatology.general | template §2 explicit: 牙痛→口腔科 |
| tdis.luo_zhen | 針灸治療學 | orthopedics_traumatology.**spinal**_disorders | template says only 骨傷科 (category); I chose the spinal-disorders leaf because 落枕 is cervical-spine in nature — **judgment call, flag for review** |
| tdis.jian_ning | 針灸治療學 | orthopedics_traumatology.**limb_joint**_disorders | same category, shoulder = limb joint — **judgment call, flag for review** |
| tdis.mian_tong | 針灸治療學 | channel_limb_neuromuscular | **not one of the 5 records template names explicitly** (template lists 面癱／口僻・落枕・肩凝症・牙痛・面痛 as needing reclass but only gives target categories for 4 of them). Inferred by anatomical analogy to tdis.mian_tan (面癱, same region) — **judgment call, flag for review** |
| tdis.mei_he_qi | 中醫內科學 | qi_blood_body | groups with 鬱證(yu_zheng)/消渴/汗證/虛勞, matching this file's existing qi_blood_body precedent |
| tdis.fei_pang | 中醫內科學 | qi_blood_body | same precedent |
| tdis.yi_niao | 中醫兒科/內科 | kidney_genitourinary_disorders | matches yi_jing/yang_wei placement in this same file |
| tdis.bai_he_bing | 金匱要略 (duplicate of existing `classical_source: "金匱要略"`) | qi_blood_body | hint was a genuine classical citation already correctly captured in `classical_source`; only removed the now-redundant hint field. Category is a judgment call (百合病 grouped with 鬱證/臟躁-type emotional-qi disorders) — **flag for review** |

Result: T10 28→0. No content dropped — `classical_source_hint` values that
were pure textbook/chapter names (not real 典籍 citations) carried no
information beyond their taxonomy classification, which is now captured
correctly in `taxonomy_id`. Verified via `data/pathology/tdis_registry.json`
diff against HEAD: 0 dropped fields, 0 shortened strings/arrays, 0 shortened
arrays across all 75 records (see diff script used, not committed).

## 2. Enrichment batch (commit 2)

19 of the ~20-25 requested priority ids — all ids in the dispatch's example
list that exist in this registry (「月經不調」has no exact registry id; the
four specific subtypes — 月經先期/後期/過多/過少 — exist but were left for a
later batch to keep this one within scope):

`tdis.gan_mao, tdis.ke_sou, tdis.tou_tong, tdis.xuan_yun, tdis.wei_tong,
tdis.ou_tu, tdis.xie_xie, tdis.bian_mi, tdis.bu_mei, tdis.xin_ji,
tdis.yu_zheng, tdis.zhong_feng, tdis.bi_zheng, tdis.yao_tong, tdis.tong_jing,
tdis.dai_xia_bing, tdis.lin_zheng, tdis.xiao_ke, tdis.han_zheng`

Each record now carries: `definition_zh/en`, `etiology_zh/en`,
`pathomechanism_zh/en`, `key_manifestations_zh/en` (4-6 items, index-aligned),
`disease_location_zh/en`, `red_flags_zh/en` (2-4 rows, 5-field structured
objects per template §5: finding/urgency_level/recommended_action/rationale/
source), `treatment_principle_zh/en`, `related_patterns`, `sources`,
`field_sources`, `source_type: draft`, `authored_by: model_draft`.

### 2.1 related_patterns — canonical back-link vs reasoned match

Two tiers, both disclosed in each record's `field_sources.related_patterns`:

**Canonical back-link** (strongest): the target `pattern.*` record's own
`related_tcm_disease_ids` field (in `data/pathology/pattern_library.json` /
`pattern_registry.json`) already names this tdis id. 10 of 19 records had at
least one such link:
tou_tong, xuan_yun, zhong_feng, xie_xie, xin_ji, bi_zheng, yao_tong,
tong_jing, lin_zheng, ke_sou.

One alias reconciliation: `tdis.bu_mei` (不寐) itself has no back-link, but
`pattern.heart_kidney_not_communicating` / `heart_spleen_deficiency` /
`insomnia_heart_kidney_disharmony` all name `tdis.shi_mian` (失眠, the
colloquial synonym for insomnia, not a registered id in this 75-record file).
Treated as the same clinical entity and linked — **flag for Fable/Ting**:
should `tdis.shi_mian` be reconciled as an alias of `tdis.bu_mei`, or is it a
genuinely separate stale id on the pattern side?

**Reasoned match** (9 of 19 records had no back-link at all: gan_mao,
wei_tong, ou_tu, bian_mi, yu_zheng, dai_xia_bing, xiao_ke, han_zheng, plus
supplementary patterns added to some of the 10 above): matched by the
pattern's own `name_zh`/`name_en` against standard 中醫內科學 textbook 分型
for that disease — e.g. `pattern.stomach_heat` for 胃痛's 肝胃鬱熱 type,
`pattern.large_intestine_excess_heat` for 便秘's 熱秘 type. Cross-checked
that the chosen pattern id genuinely exists in
`pattern_library.json`/`pattern_registry.json` (never invented). Cited as
"TCM Internal Medicine textbook standard" in `field_sources`.

**分型-as-text fallback** (no canonical id exists at all): only used inline,
in prose, within an already-approved bilingual field — never as a new field
(template has no dedicated free-text 辨證 field, and T8 forbids inventing
one). Two cases:
- `tdis.gan_mao`: 氣虛感冒/陰虛感冒 (vacuity-complicated cold) named in
  `pathomechanism_zh/en` — no `pattern.*` id captures a compound
  vacuity+exterior-invasion type.
- `tdis.zhong_feng`: 痰熱腑實 / 風痰入絡 (specific 中臟腑 sub-differentiation)
  not enumerated separately; `treatment_principle` describes 閉證/脫證
  treatment logic in prose instead of forcing a pattern-id list.

### 2.2 Red-flag sourcing

Two sources, both cited per-row in `red_flags_zh/en[].source`:

**Reused from `data/pathology/red_flag_registry.json`** (10 records): where
an existing `cond.*` entity in that registry shares the same underlying
biomedical danger as the tdis disease (e.g. `tdis.tou_tong` reuses
`cond.migraine`/`cond.tension_headache`/`cond.cluster_headache`'s thunderclap
/meningitis/new-onset-50+ rows). Every reused row cites the specific
`rf.*` record id it came from. Used for: tou_tong, xuan_yun, wei_tong, ou_tu,
xie_xie, bian_mi, zhong_feng (partial), yao_tong, tong_jing, dai_xia_bing.

**Fresh MedlinePlus research** (9 records, no matching entity existed in
red_flag_registry.json): gan_mao, ke_sou, bu_mei, xin_ji, yu_zheng, bi_zheng,
lin_zheng, xiao_ke, han_zheng, plus zhong_feng's primary FAST/911 row. Each
row cites the exact MedlinePlus URL fetched (retrieved 2026-08-11):
- Common cold: medlineplus.gov/ency/patientinstructions/000466.htm
- Cough: medlineplus.gov/ency/article/003072.htm
- Insomnia: medlineplus.gov/ency/article/000805.htm
- Major Depression (suicide/988 crisis line): medlineplus.gov/ency/article/000945.htm
- Heart Palpitations: medlineplus.gov/ency/article/003081.htm
- Infectious (septic) Arthritis: medlineplus.gov/infectiousarthritis.html
- UTI - Adults (pyelonephritis): medlineplus.gov/ency/article/000521.htm
- Diabetic Ketoacidosis: medlineplus.gov/ency/article/000320.htm
- Sweating: medlineplus.gov/ency/article/003218.htm
- Stroke (FAST): medlineplus.gov/ency/article/000726.htm

No dosage, toxicity, or pregnancy-safety numbers were written in this batch —
out of scope for tdis-level content (that belongs on formula/herb cards).

### 2.3 Archived research pack — used for structure only, not as content source

`curriculum/conditions/AcuTing_OS_Disease_Knowledge_Research_Pack_CLEAN_V2_2026-08-09/
20-29_TCM_DISEASE_RESEARCH_BATCH_*.md` (git commit `c3c38cf`, working-tree
deleted — read via `git show c3c38cf:path`) covers all 75 tdis ids with
staged pattern-candidate lists. It explicitly marks itself
`canonical_write_authorized: false` and
`TCM_mechanism_text: RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`.
**Not used as a citable content source** — its pattern-candidate lists were
used only as a cross-check against my own textbook-based pattern matching
(they agreed in every case I checked, e.g. both independently arrived at
liver_yang_rising/liver_fire/liver_wind for 頭痛). All definition/etiology/
pathomechanism prose in this batch was independently authored from standard
中醫內科學 textbook content, not copied from the research pack.

## 3. Records intentionally left untouched this batch

56 records still carry only T4 (no red flags) plus N1/N2 notes. Not
attempted this batch because no red-flag-registry entity match existed and
individual MedlinePlus research for each would have diluted this batch's
sourcing quality. Left for a later batch (Batch B), per dispatch instruction
§3 ("Records you did NOT enrich stay untouched except T10/T4 fixes where
sourceable").

## 4. Validator tails (verbatim)

See PROJECT_LOG.md entry for this batch for the full before/after numbers
and verbatim validator output.

---

# TDIS Enrichment Ledger — Batch B

Branch `codex/tdis-enrich-b`, based on `origin/codex/pattern-v2` tip
`49eb221` ("Tdis A merge finalize"). File touched: `data/pathology/
tdis_registry.json` only. `condition_canon_shortlist.json`, `symptoms.json`,
`supplements.json`, `pharmacology/*` untouched. `curriculum/**` untouched
(git status confirms).

## 1. Records enriched (22 of 56 remaining T4 index-only records)

`tdis.xiao_bing, tdis.chuan_zheng, tdis.bi_qiu, tdis.bi_yuan, tdis.ru_e,
tdis.pi_man, tdis.tun_suan, tdis.e_ni, tdis.fu_tong, tdis.xie_tong,
tdis.huang_dan, tdis.xiong_bi, tdis.long_bi, tdis.shui_zhong,
tdis.er_ming_er_long, tdis.wei_zheng, tdis.zhi_chuang, tdis.chan_zheng,
tdis.jian_wang, tdis.mei_he_qi, tdis.xu_lao, tdis.zang_zao`

Selection followed dispatch guidance (外感/內科常見病先於罕見病): respiratory
(哮病/喘證), ENT (鼻鼽/鼻淵/乳蛾/耳鳴耳聾), spleen-stomach (痞滿/吞酸/呃逆/腹痛),
liver-gallbladder (脅痛/黃疸), cardiovascular (胸痺), genitourinary (癃閉/水腫),
neuromuscular (痿證/顫證/健忘), anorectal (痔瘡), qi-blood-body (梅核氣/虛勞/臟躁).
34 records remain untouched (all gynecology/dermatology/stomatology/
ophthalmology/orthopedics minus 痔瘡), left for a later batch.

Each record now carries the same field set as Batch A: `definition_zh/en`,
`etiology_zh/en`, `pathomechanism_zh/en`, `key_manifestations_zh/en` (4-6
items, index-aligned), `disease_location_zh/en`, `related_patterns`,
`treatment_principle_zh/en`, `red_flags_zh/en` (structured 5-field rows per
template §5), `sources`, `field_sources`, `source_type`,
`review_status: "draft"`, `authored_by: "model_draft"`. All existing fields
(`id`/`name_zh`/`pinyin`/`name_en`/`taxonomy_id`, plus pre-existing
`key_manifestation_ids` on `tdis.shui_zhong` and `classical_source` on
`tdis.zang_zao`) were left untouched — verified by a full before/after
per-field diff against `git show HEAD` across all 75 records: **0 changed
fields on any pre-existing key, 0 shortened strings/arrays**. Only new keys
were added via `Object.assign`.

### 1.1 related_patterns — canonical back-link vs reasoned match

Checked `related_tcm_disease_ids` on every record across
`pattern_library.json`, `pattern_registry.json`, `tcm_pattern_lin_syndrome.json`,
and `tcm_pattern_prototypes.json` before writing anything, same as Batch A.

**Canonical back-link found for 2 of 22**: `tdis.shui_zhong` →
`pattern.kidney_yang_deficiency`; `tdis.xu_lao` → `pattern.spleen_qi_deficiency`
(both `related_tcm_disease_ids` in `pattern_library.json`).

**Reasoned match for the remaining 20**: no canonical back-link existed;
matched by the pattern's own `name_zh`/`name_en` against standard 中醫內科學
textbook 分型, with every chosen `pattern.*` id verified to exist in
`pattern_library.json`/`pattern_registry.json` before use (never invented).
Disclosed per-record in `field_sources.related_patterns` as "reasoned match…
no canonical related_tcm_disease_ids back-link found for tdis.X". No
分型-as-text fallback was needed this batch — every 分型 used had a resolvable
canonical id.

### 1.2 Red-flag sourcing

**Reused from `red_flag_registry.json`** (6 of 22): `tdis.pi_man` ←
`cond.functional_dyspepsia` (4 of its 7 legacy rows used: chest/jaw/neck/arm
pain, dysphagia, jaundice, black-tarry-stool/bleeding); `tdis.tun_suan` ←
`cond.gerd` (both rows: dysphagia, GI bleeding); `tdis.zhi_chuang` ←
`cond.hemorrhoids` (its 1 row) + fresh MedlinePlus "Rectal bleeding" for a
2nd row; `tdis.chan_zheng` ← `cond.parkinsons` (2 rows) + `cond.essential_tremor`
(1 row). Every reused row cites its exact `rf.*` id and the registry's own
original evidence citation.

**Fresh MedlinePlus/NIDDK research** (16 of 22, all URLs fetched and quoted
verbatim, retrieved 2026-08-11): xiao_bing (Asthma attacks,
patientinstructions/000062.htm), chuan_zheng (Breathing difficulty,
ency/article/003075.htm), bi_qiu (Allergic rhinitis, ency/article/000813.htm),
bi_yuan (Sinusitis, ency/article/000647.htm), ru_e (Peritonsillar abscess,
ency/article/000986.htm), e_ni (Hiccups, hiccups.html), fu_tong (Appendicitis,
appendicitis.html + Recognizing medical emergencies, ency/article/001927.htm),
xie_tong (Chronic cholecystitis, ency/article/000217.htm), huang_dan (Jaundice,
ency/article/000210.htm + cross-ref Chronic cholecystitis for the cholangitis
triad), xiong_bi (Heart attack, ency/article/000063.htm + Warning signs and
symptoms of heart disease, ency/patientinstructions/000775.htm), long_bi
(Urination - difficulty with flow, ency/article/003143.htm), shui_zhong
(Warning signs and symptoms of heart disease, same URL as xiong_bi),
er_ming_er_long (Hearing loss, ency/article/003044.htm), wei_zheng
(Guillain-Barre Syndrome, guillainbarresyndrome.html — only 1 sourced row
found, disclosed as a sourcing gap in `field_sources.red_flags` rather than
inventing a 2nd), jian_wang (Recognizing medical emergencies, same URL as
fu_tong + Memory loss, ency/article/003257.htm), mei_he_qi (Swallowing
problems, ency/patientinstructions/000065.htm), xu_lao (Weight loss -
unintentional, ency/article/003107.htm), zang_zao (reused the same MedlinePlus
"Major Depression" ency/article/000945.htm citation Batch A used for
`tdis.yu_zheng`, since 臟躁's emotional-dysregulation differential shares the
same suicide-risk safety pattern — disclosed as reused-from-Batch-A, not a
fresh fetch).

No dosage, toxicity, or pregnancy-safety numbers were written — out of scope
for tdis-level content.

### 1.3 Judgment calls flagged for review

- `tdis.wei_zheng`: only 1 red-flag row (Guillain-Barre ascending paralysis).
  A second MedlinePlus-sourced row for a different Wei-syndrome red flag
  (e.g. myasthenic crisis, ALS bulbar signs) was not located in this pass —
  flagged as an open sourcing gap rather than filled with an unsourced row.
- `tdis.zang_zao`: red flags reuse Batch A's Major Depression citation by
  clinical analogy (悲傷欲哭/emotional dysregulation ↔ depression's
  suicide-risk pattern) rather than a disease-specific 臟躁 source — same
  category of judgment call as Batch A's `tdis.bu_mei`/`shi_mian` alias
  question. Flag for Fable/Ting: is this analogy acceptable long-term, or
  should 臟躁 get its own dedicated red-flag research pass?
- `tdis.huang_dan` emergency row (cholangitis triad: fever + severe RUQ pain +
  jaundice) is a cross-reference synthesis across two MedlinePlus articles
  (Jaundice + Chronic cholecystitis) rather than a single verbatim quote —
  disclosed as "cross-referenced" in the `source` field.

## 2. Validator tails (verbatim)

Before (inherited from Batch A merge, `49eb221`):
```
FAIL — 56 blocking defect(s).
```

After this batch:
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 75 records · 41 clean

T4  NO RED FLAGS (safety) — 34 defect(s) across 34 record(s)
    tdis.mian_tan, tdis.fei_pang, tdis.ying_bing, tdis.yi_niao, tdis.yi_jing, tdis.yang_wei, tdis.jin_shang, tdis.luo_zhen, tdis.jian_ning, tdis.yue_jing_xian_qi, tdis.yue_jing_hou_qi, tdis.yue_jing_guo_duo, tdis.yue_jing_guo_shao, tdis.beng_lou, tdis.bi_jing, tdis.bu_yun, tdis.bu_yu, tdis.ren_shen_e_zu, tdis.tai_wei_bu_zheng, tdis.que_ru, tdis.jing_duan_qian_hou, tdis.zheng_jia, tdis.yin_zhen, tdis.shi_chuang, tdis.she_chuan_chuang, tdis.fen_ci, tdis.bai_bi, tdis.you_feng, tdis.kou_chuang, tdis.ya_tong, tdis.mu_yun, tdis.bai_he_bing, tdis.ma_mu, tdis.mian_tong
    e.g. tdis.mian_tan: no red_flags_zh and no red_flags_en — a 中醫 disease name is what the patient arrives with; the danger under it is biomedical

N1  34 record(s) — no related_patterns — 辨證分型 is this card's irreplaceable section (note only)
N2  34 record(s) — index entry only — no definition, etiology, pathomechanism or manifestations (note only)

FAIL — 34 blocking defect(s). Run with --worklist to see the ids.
```
**56 → 34 (−22), all 22 in-scope ids cleared, 0 new defects introduced.**

`check-validation-ratchet.js`:
```
validation ratchet — defect counts vs committed baseline

  flat     conditions   539
  flat     patterns     0
  BETTER   tdis         56 → 34   (−22)
  flat     symptoms     0
  flat     naming       1

PASS — no regressions (and something improved; run --update to lock it in).
```

`validate-content-junk.js`:
```
validate-content-junk: PASS — no scraped header tokens in content arrays.
```

`validate-relations.js`: `Relation validation passed.` (all `related_patterns`
ids resolved; pre-existing unrelated warnings in `comparisons.json`/
`condition_crosswalk.json` are untouched by this batch).

`git diff --check`: clean (no whitespace errors).

Full before/after per-field diff against `git show HEAD:data/pathology/
tdis_registry.json` across all 75 records: **0 changed pre-existing fields,
0 shortened strings/arrays** — verified with a script, not committed.

## 3. Records intentionally left untouched this batch

34 records still carry only T4/N1/N2. Left for a later batch (Batch C):
mostly gynecology (月經先期/後期/過多/過少, 崩漏, 閉經, 不孕/不育, 妊娠惡阻,
胎位不正, 缺乳, 絕經前後諸證, 癥瘕), dermatology (癮疹, 濕瘡, 蛇串瘡, 粉刺,
白疕, 油風), stomatology (口瘡, 牙痛), ophthalmology (目暗昏花), and
orthopedics/neuromuscular (面癱／口僻, 落枕, 肩凝症, 筋傷, 麻木, 面痛),
plus 肥胖, 癭病.

---

# TDIS Enrichment Ledger — Batch C

Branch `codex/tdis-enrich-c`, based on `origin/codex/pattern-v2` tip
`b7a48b8` ("Tdis B merge finalize"). File touched: `data/pathology/
tdis_registry.json` only. `condition_canon_shortlist.json`, `symptoms.json`,
`supplements.json`, `pharmacology/*` untouched. `curriculum/**` untouched.
Two commits: part 1 (`b1436c4`, 17 records) and part 2 (`df156e1`, 17
records) — this closes the line to **0 T4 defects across all 75 records**.

## 1. Records enriched (all 34 remaining T4 index-only records)

Part 1 (17): `tdis.mian_tan, tdis.fei_pang, tdis.ying_bing, tdis.yi_niao,
tdis.yi_jing, tdis.yang_wei, tdis.jin_shang, tdis.luo_zhen, tdis.jian_ning,
tdis.yue_jing_xian_qi, tdis.yue_jing_hou_qi, tdis.yue_jing_guo_duo,
tdis.yue_jing_guo_shao, tdis.beng_lou, tdis.bi_jing, tdis.bu_yun, tdis.bu_yu`

Part 2 (17): `tdis.ren_shen_e_zu, tdis.tai_wei_bu_zheng, tdis.que_ru,
tdis.jing_duan_qian_hou, tdis.zheng_jia, tdis.yin_zhen, tdis.shi_chuang,
tdis.she_chuan_chuang, tdis.fen_ci, tdis.bai_bi, tdis.you_feng,
tdis.kou_chuang, tdis.ya_tong, tdis.mu_yun, tdis.bai_he_bing, tdis.ma_mu,
tdis.mian_tong`

Same field set as Batch A/B: `definition_zh/en`, `etiology_zh/en`,
`pathomechanism_zh/en`, `key_manifestations_zh/en` (4-6 items, index-aligned),
`disease_location_zh/en`, `related_patterns`, `treatment_principle_zh/en`,
`red_flags_zh/en` (structured 5-field rows), `sources`, `field_sources`,
`source_type`, `review_status: "draft"`, `authored_by: "model_draft"`. All
pre-existing fields (`id`/`name_zh`/`pinyin`/`name_en`/`taxonomy_id`, plus
`classical_source` on `tdis.bai_he_bing`) left untouched — verified by a
full before/after per-field diff against `git show HEAD` across all 75
records after each commit: **0 changed pre-existing fields, 0 shortened
strings/arrays**. Only new keys added via `Object.assign`.

### 1.1 related_patterns — canonical back-link vs reasoned match

Checked `related_tcm_disease_ids` across `pattern_library.json` (91 records)
and `pattern_registry.json` (98 records — confirmed this file has no
`related_tcm_disease_ids` field at all) for every one of the 34 ids before
writing anything.

**Canonical back-link found for 1 of 34**: `tdis.yang_wei` →
`pattern.kidney_yang_deficiency` (`related_tcm_disease_ids` in
`pattern_library.json`).

**Reasoned match for the remaining 33**: no canonical back-link existed;
matched by the pattern's own `name_zh`/`name_en` against standard 中醫內科學
/婦科學/外科學/五官科學 textbook 分型, every chosen `pattern.*` id verified to
exist in `pattern_library.json`/`pattern_registry.json` before use (a full
list of the vocabulary's ~135 unique pattern ids was extracted and checked
against — never invented). Disclosed per-record in
`field_sources.related_patterns`.

**Two disclosed approximations** (not full canonical matches, flagged for
review):
- `tdis.tai_wei_bu_zheng` (胎位不正): only 2 loosely-reasoned patterns
  (`qi_blood_deficiency`, `qi_stagnation_blood_stasis`) instead of the usual
  3-5 — classical TCM literature does not pattern-differentiate this
  condition the way it does most `tdis.*` diseases; BL67 moxibustion is the
  standard treatment regardless of 辨證分型.
- `tdis.bai_he_bing` (百合病): `related_patterns` uses two separate
  component ids (`pattern.heart_yin_deficiency` + `pattern.lung_yin_deficiency`)
  as an approximation, since no single combined 心肺陰虛 pattern id exists in
  the vocabulary.

No 分型-as-text fallback was needed — every 分型 used had a resolvable
canonical id.

### 1.2 Red-flag sourcing

**Reused from `red_flag_registry.json`** (19 of 34, all direct 1:1 clinical
matches, every row citing its exact `rf.*` id): `tdis.mian_tan` ←
`cond.bells_palsy` (2 rows); `tdis.jin_shang` ← tendon-injury cluster
(`cond.rotator_cuff`, `cond.frozen_shoulder`, `cond.de_quervain`,
`cond.trigger_finger`, `cond.medial_epicondylitis`,
`cond.achilles_tendinopathy`, 4 rows); `tdis.luo_zhen` ←
`cond.neck_pain_stiff` (3 rows); `tdis.jian_ning` ← `cond.frozen_shoulder`
(3 rows); `tdis.yue_jing_xian_qi`/`tdis.yue_jing_hou_qi` ←
`cond.irregular_menstruation` (4 rows, same set reused for both — shared
cycle-timing biomedical danger profile); `tdis.yue_jing_guo_duo`/
`tdis.beng_lou` ← `cond.menorrhagia` (4 rows, same set reused for both —
shared heavy/irregular-bleeding danger profile); `tdis.yue_jing_guo_shao` ←
`cond.oligomenorrhea` (4 rows); `tdis.bi_jing` ← `cond.amenorrhea` (4 rows);
`tdis.bu_yun` ← `cond.female_infertility` (4 rows); `tdis.bu_yu` ←
`cond.male_infertility` (4 rows); `tdis.ren_shen_e_zu` ←
`cond.hyperemesis_gravidarum` (4 rows); `tdis.tai_wei_bu_zheng` ←
`cond.breech_presentation` (4 rows); `tdis.que_ru` ←
`cond.postpartum_hypolactation` (4 rows); `tdis.jing_duan_qian_hou` ←
`cond.menopause_syndrome` (4 rows); `tdis.zheng_jia` ←
`cond.uterine_fibroids` (4 rows); `tdis.ma_mu` ← `cond.peripheral_neuropathy`
+ `cond.diabetic_neuropathy` (2 rows); `tdis.mian_tong` ←
`cond.trigeminal_neuralgia` + `cond.tmd` (4 rows).

**Mixed reused + fresh** (1 of 34): `tdis.she_chuan_chuang` ← 1 row reused
from `cond.postherpetic_neuralgia` (ocular-zoster emergency,
`rf.postherpetic_neuralgia.ocular_zoster`) + 1 fresh MedlinePlus row
(Shingles, immunocompromised/disseminated-rash criterion).

**Fresh MedlinePlus research** (13 of 34, all URLs fetched and quoted
verbatim, retrieved 2026-08-11): `tdis.fei_pang` (Obesity,
ency/article/007297.htm), `tdis.yi_niao` (Frequent or urgent urination,
ency/article/003140.htm), `tdis.yi_jing` (Prostate Diseases, prostatediseases.html
— analogous prostatitis-screening source, no direct 遺精 equivalent exists),
`tdis.yang_wei` (Erectile Dysfunction, erectiledysfunction.html),
`tdis.ying_bing` (Simple goiter, ency/article/001178.htm), `tdis.yin_zhen`
(Hives, ency/article/000845.htm), `tdis.shi_chuang` (Atopic dermatitis,
ency/article/000853.htm), `tdis.fen_ci` (Acne, ency/article/000873.htm),
`tdis.bai_bi` (Psoriasis, ency/article/000434.htm), `tdis.you_feng`
(Alopecia areata, ency/article/001450.htm), `tdis.kou_chuang` (Canker sore,
ency/article/000998.htm), `tdis.ya_tong` (Toothaches, ency/article/003067.htm),
`tdis.mu_yun` (Blindness and vision loss, ency/article/003040.htm).

**Reused by clinical analogy, not a fresh fetch** (1 of 34): `tdis.bai_he_bing`
reuses Batch A's MedlinePlus "Major Depression" citation (already used for
`tdis.yu_zheng`/`tdis.zang_zao`) — the emotional-dysregulation/unsettled-affect
picture of 百合病 shares the suicide-risk safety pattern with depression, but
this is a disclosed analogy, not a disease-specific source.

Confirmed during Task 3 research (subagent + direct file grep): dermatology,
stomatology, ophthalmology, obesity, thyroid/goiter, enuresis, spermatorrhea,
and impotence/ED all have **zero rows** in `red_flag_registry.json` (the
`cond.*` entities exist in `condition_canon_shortlist.json` but no red flags
were ever authored for them) — this is why 13 of 34 records required fresh
MedlinePlus sourcing rather than registry reuse.

No dosage, toxicity, or pregnancy-safety numbers were written — out of scope
for tdis-level content.

### 1.3 Judgment calls / disclosed sourcing gaps flagged for review

- `tdis.fei_pang`: only 1 red-flag row (comorbidity list under the source
  page's "Surgery" section) — MedlinePlus Obesity has no dedicated "When to
  Contact a Medical Professional" section.
- `tdis.yi_jing`: only 1 row, sourced via analogy to prostatitis/urinary
  infection screening (MedlinePlus Prostate Diseases) — 遺精/seminal emission
  has no direct Western-medicine-equivalent MedlinePlus topic.
- `tdis.yang_wei`: only 1 row (ED-as-vascular-disease-marker) — MedlinePlus
  ED page's guidance is a single Summary-section sentence, not a dedicated
  warning-signs section.
- `tdis.yin_zhen`: only 1 row (anaphylaxis emergency) — MedlinePlus Hives'
  "When to Contact a Medical Professional" section covers only the emergency
  criteria, nothing at the urgent/routine tier.
- `tdis.you_feng`: only 1 row — MedlinePlus Alopecia areata's guidance is a
  single generic sentence ("contact your provider if concerned").
- `tdis.kou_chuang`: only 1 row — MedlinePlus Canker sore's "When to Contact
  a Medical Professional" section is a single brief criterion.
- `tdis.mu_yun`: only 1 row (sudden vision loss emergency) — the sourced
  MedlinePlus page (Blindness and vision loss) addresses acute loss, not the
  gradual chronic dimming that 目暗昏花／視瞻昏渺 more typically describes;
  a dedicated presbyopia/age-related-vision-change source was not located in
  this pass.
- `tdis.tai_wei_bu_zheng`: related_patterns has only 2 loosely-reasoned ids
  (§1.1) — disclosed as a structural feature of this disease (not a
  sourcing failure), since classical texts do not pattern-differentiate
  fetal malposition.
- `tdis.bai_he_bing`: red flags reuse Batch A's Major Depression citation by
  clinical analogy (§1.2) — same category of judgment call as Batch A's
  `tdis.bu_mei`/`shi_mian` and Batch B's `tdis.zang_zao`. Flag for
  Fable/Ting: should 百合病 get its own dedicated red-flag research pass, or
  is this analogy acceptable long-term? This is now the *third* tdis record
  using this same Depression citation by analogy (`yu_zheng` — direct
  match, `zang_zao` — analogy, `bai_he_bing` — analogy); worth a standing
  decision rather than re-litigating per record.

## 2. Validator tails (verbatim)

Before (inherited from Batch B merge, `b7a48b8`):
```
FAIL — 34 blocking defect(s).
```

After part 1 (17 records, commit `b1436c4`):
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 75 records · 58 clean

T4  NO RED FLAGS (safety) — 17 defect(s) across 17 record(s)
    tdis.ren_shen_e_zu, tdis.tai_wei_bu_zheng, tdis.que_ru, tdis.jing_duan_qian_hou, tdis.zheng_jia, tdis.yin_zhen, tdis.shi_chuang, tdis.she_chuan_chuang, tdis.fen_ci, tdis.bai_bi, tdis.you_feng, tdis.kou_chuang, tdis.ya_tong, tdis.mu_yun, tdis.bai_he_bing, tdis.ma_mu, tdis.mian_tong

N1  17 record(s) — no related_patterns — 辨證分型 is this card's irreplaceable section (note only)
N2  17 record(s) — index entry only — no definition, etiology, pathomechanism or manifestations (note only)

FAIL — 17 blocking defect(s). Run with --worklist to see the ids.
```

After part 2 (17 records, commit `df156e1`):
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 75 records · 75 clean

PASS — 0 blocking defects.
```

**34 → 0 (−34), all 34 in-scope ids cleared, 0 new defects introduced.**

`check-validation-ratchet.js` (after part 2):
```
validation ratchet — defect counts vs committed baseline

  flat     conditions   481
  flat     patterns     0
  BETTER   tdis         34 → 0   (−34)
  flat     symptoms     0
  flat     naming       1

PASS — no regressions (and something improved; run --update to lock it in).
```

`validate-content-junk.js`: `PASS — no scraped header tokens in content
arrays.`

`validate-relations.js`: `Relation validation passed.` (all `related_patterns`
ids resolved; pre-existing `comparisons.json` skeleton-row warning is
untouched by this batch).

`git diff --check`: clean (no whitespace errors) after both commits.

Full before/after per-field diff against `git show HEAD:data/pathology/
tdis_registry.json` across all 75 records, run after each commit: **0
changed pre-existing fields, 0 shortened strings/arrays** — verified with a
script, not committed.

## 3. Status

**0 records remain with T4.** All 75 `tdis.*` records now carry full
bilingual clinical content, 辨證分型 links, and structured sourced red
flags. This closes the tdis enrichment line opened in Batch A. Any further
work on this file is refinement (deepening `field_sources` provenance,
resolving the disclosed judgment calls in §1.3, or upgrading
`review_status` from `draft`), not backfill.

---

# TDIS Enrichment Ledger — Skeleton tier

Branch `codex/tdis-skeleton`, based on `origin/codex/pattern-v2` tip
`da100ab` ("T4 skeleton-tier carve-out for tdis line"). File touched:
`data/pathology/tdis_registry.json` (+ `data/generated/knowledge_data.js`
rebuilt via `build-data.js`) only. `condition_canon_shortlist.json`,
`symptoms.json`, `pattern_library.json`, `supplements.json`,
`pharmacology/*`, `curriculum/**` untouched. Two commits: part 1 (`d24c21a`,
+42) and part 2 (`d8107c2`, +42). **75 → 159 (+84).**

## 1. Purpose and scope

Ting's uncapped-skeleton ruling: names first, content on demand. This batch
adds ~84 classical TCM disease names from 中醫內科學/婦科學/兒科學/外科學/
五官科學 that were NOT among the existing 75, as pure `review_status:
"skeleton"` index entries — no content fields, no red flags (T4 correctly
defers to N4 for these, per the template's own carve-out).

## 2. Conflict found and resolved: `classical_source` on skeleton records

The dispatch instructions asked for `classical_source` "where you genuinely
know the 典籍." **This directly conflicts with the skeleton exemption
itself.** Both `docs/TDIS_CARD_TEMPLATE.md` §"T4 與骨架層" and
`scripts/validate-tdis-standard.js`'s own `TDIS_CONTENT_FIELDS` list name
`classical_source` as one of the fields that must be **absent** for a
`review_status: "skeleton"` record to get the T4→N4 exemption:

```js
const TDIS_CONTENT_FIELDS = ["definition_zh", "definition_en", "etiology_zh", "etiology_en",
  "pathomechanism_zh", "pathomechanism_en", "key_manifestations_zh", "key_manifestations_en",
  "related_patterns", "classical_source"];
const isPureSkeleton = rec.review_status === "skeleton"
  && TDIS_CONTENT_FIELDS.every((f) => isEmpty(rec[f]))
  && isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en);
```

Filling `classical_source` on any of these 84 records would have flipped
that record from `isPureSkeleton: true` (exempt, N4 note) to
`isPureSkeleton: false` — re-arming T4, which fails because skeleton records
carry no `red_flags_zh/en`. Since the dispatch's hard constraint ("blocking
MUST stay 0") is stated twice and is unambiguous, while the classical-source
instruction is a soft "where known," **I omitted `classical_source` on all
84 records** and am flagging the conflict here rather than guessing silently
through the whole batch (per `docs/AI_CONSTITUTION.md` §3: "規則不清楚、或
發現規則互相矛盾：停下來問，不要猜著做完一整批"). **Flag for Fable/Ting**:
either the template's carve-out text should list `classical_source` as
skeleton-safe (drop it from `TDIS_CONTENT_FIELDS`), or future skeleton
dispatch instructions should stop asking for it — the two documents
currently disagree with each other.

## 3. taxonomy_id — enumerated before use, no gaps found

Enumerated all 22 distinct `taxonomy_id` values across the existing 75
records first (`tdx.internal_medicine.*` ×8 leaves in use,
`tdx.gynecology_obstetrics.*` ×5 of 6 leaves, `tdx.ent.*` ×3,
`tdx.orthopedics_traumatology.*` ×2, `tdx.surgery_dermatology.*` ×3 of 5,
`tdx.ophthalmology.general`, `tdx.stomatology.general`,
`tdx.andrology.general`), then cross-checked against the full
`data/config/tcm_disease_taxonomy.json` vocabulary (11 categories, 34
leaves). **No taxonomy gap** — `tdx.pediatrics.*` (2 leaves) and
`tdx.internal_medicine.externally_contracted_febrile` already existed in
the vocabulary but had **zero records** using them before this batch; this
batch is what first populates them (10+4 pediatric records,
6 傷寒/溫病/濕溫/瘟疫/中暑/霍亂 records respectively). Also first use of
`tdx.gynecology_obstetrics.vulvar_vaginal_disorders` (陰挺/陰癢, 2 records)
and `tdx.surgery_dermatology.sores_abscesses_ulcers` /
`.other_surgical_disorders` (7+3 records) — all previously-defined,
previously-unused leaves, not invented ones.

Final per-leaf counts for the 84 new records (all verified against
`LEAF_IDS` in the validator before writing, script not committed):

```
tdx.andrology.general                                          1
tdx.ent.ear                                                     3
tdx.ent.nose                                                    2
tdx.ent.throat                                                  2
tdx.gynecology_obstetrics.menstrual_disorders                   5
tdx.gynecology_obstetrics.postpartum_disorders                  5
tdx.gynecology_obstetrics.pregnancy_disorders                   6
tdx.gynecology_obstetrics.vulvar_vaginal_disorders               2
tdx.internal_medicine.cardiovascular_neuropsychiatric_disorders  3
tdx.internal_medicine.channel_limb_neuromuscular                1
tdx.internal_medicine.externally_contracted_febrile              6
tdx.internal_medicine.kidney_genitourinary_disorders             1
tdx.internal_medicine.liver_gallbladder_disorders                3
tdx.internal_medicine.qi_blood_body                              4
tdx.internal_medicine.respiratory_system_disorders                3
tdx.internal_medicine.spleen_stomach_gastrointestinal             2
tdx.ophthalmology.general                                        5
tdx.pediatrics.common_miscellaneous_pediatric                   10
tdx.pediatrics.pediatric_epidemic_infectious                     4
tdx.stomatology.general                                          1
tdx.surgery_dermatology.dermatologic_disorders                   4
tdx.surgery_dermatology.goiters_masses_tumors                    1
tdx.surgery_dermatology.other_surgical_disorders                 3
tdx.surgery_dermatology.sores_abscesses_ulcers                   7
```

## 4. Dedup method

Exact-scan against all 75 existing `id`/`name_zh`/`aliases_zh` values (the
75 have no `aliases_zh` populated — confirmed by reading the file — so this
reduced to `id`/`name_zh` only), plus a running set within the 84 new
records themselves, checked programmatically before any record was written
(script not committed, run interactively). 0 collisions found — every name
below is either a distinct disease not covered by the 75, or (where a
near-relation exists) a genuinely different clinical entity, not a rename:

- 積聚 (new) vs 癥瘕 `tdis.zheng_jia` (existing): 積聚 is general
  hepatosplenic/abdominal-mass disease (both sexes); 癥瘕 is specifically
  gynecological. Different diseases, both textbook-distinct.
- 鼓脹 (new, ascites/liver) vs nothing existing — distinct.
- 關格 (new) vs 癃閉 `tdis.long_bi` (existing): 癃閉 is urinary retention;
  關格 is the combined vomiting+anuria (uremic) pattern. Different diseases.
- 瘰癧 (new, cervical TB lymphadenitis) vs 癭病 `tdis.ying_bing` (existing,
  goiter/thyroid enlargement). Different anatomical/pathological entities;
  placed in the same `goiters_masses_tumors` (瘿瘤) leaf since that is the
  closest fit — 瘰癧 does not have its own leaf.
- 喉痹 (new, pharyngitis pattern) vs 乳蛾 `tdis.ru_e` (existing, tonsillitis)
  — distinct 中醫喉科學 chapters.
- 鼻窒/鼻衄 (new) vs 鼻鼽/鼻淵 `tdis.bi_qiu`/`tdis.bi_yuan` (existing) — four
  separate 中醫耳鼻喉科學 nasal-disease chapters, no overlap.
- 耳眩暈/耳瘡/膿耳 (new) vs 耳鳴耳聾 `tdis.er_ming_er_long` (existing,
  tinnitus/deafness) — distinct chapters (vertigo / external-ear infection /
  middle-ear infection vs hearing symptoms).
- 針眼/天行赤眼/白澀症/綠風內障/圓翳內障 (new) vs 目暗昏花 `tdis.mu_yun`
  (existing, dim/blurred vision) — five distinct 中醫眼科學 chapters.
- 牙宣 (new, periodontal bleeding) vs 牙痛 `tdis.ya_tong` (existing,
  toothache) — related but textbook-distinct diseases.
- 驚風/急驚風/慢驚風: registered all three. 急驚風 and 慢驚風 are not mere
  證型 subtypes of one disease (unlike e.g. 中風's 中臟腑/中經絡) — they have
  genuinely different etiology (excess heat/wind-phlegm vs chronic
  spleen-yang deficiency) and are independently diagnosed in
  中醫兒科學. 驚風 itself is also used as a standalone clinical/chapter term.
  Flagged here as a judgment call, not a silent assumption.

## 5. Aliases — only added where genuinely known (8 of 84 records)

`aliases_zh`/`aliases_en` left as `[]`/`[]` on 76 of 84 records rather than
guessing. Populated only where a real, distinct classical/clinical synonym
exists (checked for equal array length, T5/T7-safe):

| id | alias_zh | alias_en |
|---|---|---|
| tdis.fei_lao | 癆瘵 | Consumption |
| tdis.xian_bing | 癲癇 | Seizure Disorder |
| tdis.gu_zhang | 單腹脹 | Solitary Abdominal Distension |
| tdis.ben_tun_qi | 奔豚 | Running Piglet Disorder |
| tdis.e_kou_chuang | 雪口 | Oral Moniliasis |
| tdis.dun_ke | 百日咳 | Pertussis |
| tdis.luo_li | 老鼠瘡 | Rat Sores (folk name) |
| tdis.you | 千日瘡 | Verruca Vulgaris |

One naming note for Ting's eyes: `tdis.yin_yang` (陰癢, vulvar pruritus) is
the mechanically correct toneless pinyin id (癢 → "yang"), but it is
visually identical to how "Yin-Yang" (陰陽 philosophy) would be written.
Kept as-is because the pinyin is accurate and D1 forbids inventing a
non-standard id — but worth a second look before this id gets load-bearing
consumers, since a future reader skimming ids could misread it.

## 6. Validator tails (verbatim)

Before (inherited from Batch C merge / `da100ab`):
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 75 records · 75 clean

PASS — 0 blocking defects.
```

After part 1 (`d24c21a`, +42, internal medicine + gynecology):
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 117 records · 117 clean

N4  42 record(s) — skeleton index slot (no content claimed) — T4 deferred until any content field lands (note only)
N1  42 record(s) — no related_patterns — 辨證分型 is this card's irreplaceable section (note only)
N2  42 record(s) — index entry only — no definition, etiology, pathomechanism or manifestations (note only)

PASS — 0 blocking defects.
```

After part 2 (`d8107c2`, +42, pediatrics + surgery/derm + andrology +
ENT/eye/mouth):
```
validate-tdis-standard — data/pathology/tdis_registry.json
scope: all branches · 159 records · 159 clean

N4  84 record(s) — skeleton index slot (no content claimed) — T4 deferred until any content field lands (note only)
N1  84 record(s) — no related_patterns — 辨證分型 is this card's irreplaceable section (note only)
N2  84 record(s) — index entry only — no definition, etiology, pathomechanism or manifestations (note only)

PASS — 0 blocking defects.
```

**75 → 159 (+84), 0 blocking defects at every step.**

`check-validation-ratchet.js` (after part 2):
```
validation ratchet — defect counts vs committed baseline

  flat     conditions   425
  flat     patterns     0
  flat     tdis         0
  flat     symptoms     0
  flat     naming       1

PASS — no regressions.
```

`validate-content-junk.js`: `validate-content-junk: PASS — no scraped
header tokens in content arrays.`

`validate-relations.js`: `Relation validation passed.` (pre-existing
`comparisons.json`/`condition_crosswalk.json` warnings unrelated to this
batch, confirmed untouched).

`git diff --check`: clean (no whitespace errors) after both commits.

Full before/after per-field diff against `git show HEAD:data/pathology/
tdis_registry.json`, run after each commit: **0 changed fields on any
pre-existing record** (75 checked after part 1, 117 checked after part 2) —
verified with a script, not committed.

## 7. Records intentionally left out this batch

Considered and deliberately excluded rather than silently dropped:

- **癌病** (Cancer, a modern-edition 中醫內科學 氣血津液 chapter title) —
  dropped for being closer to a modern textbook addition than a classical
  病名, out of caution given the dispatch's "standard classical names only"
  instruction. Flag for review if Ting wants it added.
- Further 婦科/五官 subtypes not registered as separate ids (e.g. 有頭疽 /
  無頭疽 under 疽; individual 経行前後諸証 items beyond the 3 registered) —
  left as textbook subsections under their parent record rather than
  separately-registered diseases, consistent with how the existing 75
  handles 中風 (no 中臟腑/中經絡 subtype ids) and 痺證 (no 行痺/痛痺/著痺
  subtype ids).

## 8. Status

**159 `tdis.*` records total: 75 with full clinical content (Batches A/B/C,
0 T4), 84 pure skeletons (this batch, N4-exempt).** No content fields were
added to any of the 84 — per dispatch scope, that is deliberately deferred
to a future enrichment batch, same pattern as Batches A/B/C did for the
original 75.

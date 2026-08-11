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

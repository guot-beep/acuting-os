# CLASSICAL_REFS_ATTRIBUTION_SCAN — `classical_references_*` 歸屬掃描

Date: 2026-08-12 · Branch `codex/classical-refs-scan` (from `origin/codex/pattern-v2` @ `c8c02a9a`)
Scope: `data/pathology/condition_canon_shortlist.json`, 505 records. **READ-ONLY** — no `data/**` byte was changed.

Trigger: `docs/research_packs/COND_GYN_FILL_ASSESSMENT.md` §9/§10.3 — the eyes-on read of two gyn
cards found `classical_references_zh` carrying another disease's classical quotations. Every archive
and cleanup pass in this repo so far scoped `etiology` and `western_pathology` only. This field has
never been swept.

Why it matters more than an empty field: an empty field is honestly empty. A 《慎齋遺書》 citation
reads as provenance — it tells the reader "a classic said this about *this* disease". When the
citation is about a different disease, the card is not incomplete, it is **wrong with a source
attached**.

---

## §0 Method + counts

### 0.1 Enumeration

```
node -e "const r=require('./data/pathology/condition_canon_shortlist.json').records;const f=x=>x&&String(x).trim();console.log('records',r.length,'| classical_references_zh filled',r.filter(x=>f(x.classical_references_zh)).length,'| _en filled',r.filter(x=>f(x.classical_references_en)).length);"
→ records 505 | classical_references_zh filled 52 | _en filled 0
```

| | count |
|---|---|
| records in file | **505** |
| `classical_references_zh` non-empty | **52** |
| `classical_references_en` non-empty | **0** |
| records where the `classical_references_en` **key exists at all** | **0** |
| field type | 52/52 `string` (never an array) |
| total zh characters in the field across the corpus | 16,785 (min 63 / median 300 / max 1,907) |

By category (52 filled / category total):

| category | filled | total | |
|---|---|---|---|
| gyn_fertility | 12 | 48 | |
| pain_msk | 8 | 52 | |
| gi | 7 | 48 | |
| uro_renal | 6 | 38 | |
| respiratory | 4 | 36 | |
| ent_eye | 4 | 40 | |
| psych_sleep | 3 | 42 | |
| derm | 3 | 38 | |
| immune_misc | 3 | 40 | |
| neuro | 2 | 43 | |
| endo_metabolic | 0 | 40 | |
| cardio | 0 | 40 | |

All 52 filled records are `review_status: "draft"`, `source_type` CloudTCM-import lineage.

### 0.2 A structural note the template already predicted

`docs/CONDITION_CARD_TEMPLATE.md` §"兩種 entity_type" puts `classical_references_*` in the
**`tcm_disease` column** — it is the TCM-disease card's dedicated field, the counterpart to
`icd_hint` / `western_context_*` on the biomedical side.

But `condition_canon_shortlist.json` holds **505/505 `biomedical_condition`** records — there is no
`tcm_disease` record in this file at all, and `tdis_registry.json` (159 records) has
**0/159 with `classical_references_zh`**. So every one of these 52 quotations is sitting on a
biomedical card, and the field that was designed to hold them is empty everywhere it exists.

That is not itself the attribution bug, but it explains the shape of the bug: a classical passage
was attached to whichever *biomedical* card was nearest, rather than to the TCM disease it names.

### 0.3 Classification method

For each of the 52 I read the whole passage against the record's own `name_zh`, `aliases_zh`,
`related_eastern_diseases` (resolved to `name_zh` via `tdis_registry.json`), and `summary_zh`.

Rule applied, per the brief: **WRONG-TOPIC only when I can quote the mismatching disease term.**
Where the passage names a disease that is a *declared* `related_eastern_diseases` link of the card
but is not the card's own identity, the class is ADJACENT, not WRONG-TOPIC. Where the passage names
no disease specific enough to attribute either way, the class is UNVERIFIABLE.

| class | records |
|---|---|
| **MATCHES** | **28** |
| **WRONG-TOPIC** | **10** |
| **ADJACENT-BUT-NOT-THE-SAME** | **11** |
| **UNVERIFIABLE** | **3** |
| total | 52 |

**21 of 52 (40.4%) carry a passage that is not about the card's own disease.**

### 0.4 The duplicate finding, which was not in the brief

The single strongest signal is not semantic — it is that **the same passage block is pasted on
multiple cards**.

```
node -e "const r=require('./data/pathology/condition_canon_shortlist.json').records;const n=s=>s.replace(/&[a-z]+;/g,'').replace(/[^一-鿿]/g,'');const m=new Map();for(const x of r){const v=x.classical_references_zh;if(!v||!v.trim())continue;const k=n(v);m.set(k,(m.get(k)||[]).concat(x.id));}const g=[...m.values()].filter(a=>a.length>1);console.log('dup groups',g.length,'records in them',g.reduce((a,b)=>a+b.length,0));g.forEach(a=>console.log(' ',a.length+'x',a.join(', ')));"
→ dup groups 11 records in them 29
```

- **8 groups / 22 records** are byte-identical after stripping only whitespace + HTML entities.
- **11 groups / 29 records** are identical after also normalizing punctuation (`…` vs `&hellip;`,
  `「」` vs `"`).
- Only **34 distinct passage blocks** exist across the 52 filled records.

**29 of 52 (55.8%) of this field's content is a copy of another card's.** Inside a group of *n*
cards, at most one can be the true home, so **at least 18 of those 29 are misattributed by
construction** — before any reading. That is also constitution red line 6 (樣板句) in its literal
form: one 65-character quotation is doing duty on seven different diseases.

| n | group members |
|---|---|
| 7 | endometriosis, primary_dysmenorrhea, pms, irregular_menstruation, female_infertility, recurrent_pregnancy_loss, chronic_pelvic_pain |
| 3 | pcos, oligomenorrhea, thin_endometrium |
| 3 | copd, chronic_cough, post_viral_cough |
| 2 | **male_infertility, erectile_dysfunction** |
| 2 | **bph, chronic_prostatitis** |
| 2 | **depression, cancer_supportive** |
| 2 | migraine, migraine_vestibular |
| 2 | insomnia, circadian_disorder |
| 2 | urticaria, chronic_allergies |
| 2 | tinnitus, hearing_loss |
| 2 | tension_headache, cluster_headache |

---

## §1 Per-record classification (52)

`dup` = member of a duplicate-block group. `own hit` = a disease term from the card's own
name/aliases/`related_eastern_diseases` that literally appears in the passage.

| # | id | cat | class | own hit | passage's disease term |
|---|---|---|---|---|---|
| 1 | `cond.pcos` | gyn | **ADJACENT** dup | — | 血枯經絕 / 月事不來（閉經）; 經水少 |
| 2 | `cond.endometriosis` | gyn | **WRONG-TOPIC** dup | — | 枯閉（閉經）; 月經或早或遲 |
| 3 | `cond.uterine_fibroids` | gyn | MATCHES | 癥瘕 | 癥積 |
| 4 | `cond.primary_dysmenorrhea` | gyn | **WRONG-TOPIC** dup | — | 枯閉; 或早或遲 |
| 5 | `cond.pms` | gyn | **WRONG-TOPIC** dup | — | 枯閉; 或早或遲 |
| 6 | `cond.irregular_menstruation` | gyn | MATCHES dup | — (see §2.4) | 或早或遲 = 月經先期/後期 ✔ |
| 7 | `cond.oligomenorrhea` | gyn | **ADJACENT** dup | — | 血枯經絕（閉經）+ 經水少 ✔ mixed |
| 8 | `cond.female_infertility` | gyn | **ADJACENT** dup | — | 枯閉（閉經） |
| 9 | `cond.male_infertility` | gyn | **WRONG-TOPIC** dup | — | **陽痿 / 陰痿不起 / 痿證** |
| 10 | `cond.recurrent_pregnancy_loss` | gyn | **WRONG-TOPIC** dup | — | 枯閉; 或早或遲 |
| 11 | `cond.chronic_pelvic_pain` | gyn | **WRONG-TOPIC** dup | — | 枯閉; 或早或遲 |
| 12 | `cond.thin_endometrium` | gyn | **ADJACENT** dup | — | 血枯經絕（閉經）+ 月水不利 |
| 13 | `cond.lumbar_disc_herniation` | msk | MATCHES | 腰痛 | 腰痛 |
| 14 | `cond.cervical_spondylosis` | msk | MATCHES | — | 頸項強痛 / 項強 ✔ |
| 15 | `cond.frozen_shoulder` | msk | MATCHES | — | 肩臂痛 / 肩不舉 / 肩胛筋緩 ✔ |
| 16 | `cond.fibromyalgia` | msk | MATCHES | — | 體痛 / 一身盡痛 ✔ |
| 17 | `cond.tension_headache` | msk | **UNVERIFIABLE** dup | 頭痛 | 頭痛（泛稱，含真頭痛/頭風/厥逆） |
| 18 | `cond.migraine` | msk | MATCHES dup | 偏頭痛 | 偏頭痛 |
| 19 | `cond.cluster_headache` | msk | **UNVERIFIABLE** dup | 頭痛 | 同 #17 逐字 |
| 20 | `cond.rheumatoid_arthritis` | msk | MATCHES | — | 行痹/痛痹/著痹/熱痹（痺證變體字） ✔ |
| 21 | `cond.gerd` | gi | MATCHES | 吞酸 | 吞酸 |
| 22 | `cond.functional_dyspepsia` | gi | **WRONG-TOPIC** | — | **小兒病癖 / 疳 / 積滯（小兒科）** |
| 23 | `cond.chronic_gastritis` | gi | MATCHES | 嘈雜/心嘈/痞滿 | 嘈雜 / 痞滿 |
| 24 | `cond.peptic_ulcer` | gi | MATCHES | 胃脘痛 | 胃脘痛 |
| 25 | `cond.chronic_diarrhea` | gi | MATCHES | 泄瀉 | 泄瀉 |
| 26 | `cond.nausea_vomiting` | gi | MATCHES | 嘔吐 | 嘔吐（但含 1,907 字本草綱目藥物目錄，見 §3） |
| 27 | `cond.hemorrhoids` | gi | MATCHES | — | 痔 / 痔漏 ✔ |
| 28 | `cond.insomnia` | psych | MATCHES dup | 不寐 | 不寐 |
| 29 | `cond.depression` | psych | **ADJACENT** dup | — | 臟躁（**胎前**證下） |
| 30 | `cond.circadian_disorder` | psych | **ADJACENT** dup | 不寐 | 不寐（= #28 逐字） |
| 31 | `cond.asthma` | resp | MATCHES | 氣喘/哮喘 | 喘證 / 哮喘 |
| 32 | `cond.copd` | resp | MATCHES dup | 咳嗽 | 咳嗽 |
| 33 | `cond.chronic_cough` | resp | MATCHES dup | 咳嗽 | 咳嗽 |
| 34 | `cond.post_viral_cough` | resp | MATCHES dup | 咳嗽 | 咳嗽 |
| 35 | `cond.bells_palsy` | neuro | MATCHES | 口眼歪斜/口僻 | 口喎 / 口僻 |
| 36 | `cond.migraine_vestibular` | neuro | **ADJACENT** dup | 眩暈/頭痛 | 偏頭痛（= #18 逐字） |
| 37 | `cond.urticaria` | derm | **ADJACENT** dup | — | 溫熱病斑疹（非癮疹） |
| 38 | `cond.acne` | derm | MATCHES | 粉刺 | 肺風粉刺 |
| 39 | `cond.herpes_zoster` | derm | MATCHES | 蛇串瘡 | 纏腰火丹 / 蛇串瘡 |
| 40 | `cond.recurrent_uti` | uro | **WRONG-TOPIC** | — | **小便不通 / 癃閉（含導尿法）** |
| 41 | `cond.overactive_bladder` | uro | MATCHES | — | 小便不禁 / 小便數 ✔ |
| 42 | `cond.bph` | uro | **WRONG-TOPIC** dup | — | **白濁 / 精濁 / 慢性前列腺炎** |
| 43 | `cond.chronic_prostatitis` | uro | MATCHES dup | — | 精濁 = 慢性攝護腺炎古名 ✔ |
| 44 | `cond.erectile_dysfunction` | uro | MATCHES dup | 陽痿 | 陽痿 |
| 45 | `cond.nocturnal_enuresis` | uro | MATCHES | 遺尿 | 遺尿 |
| 46 | `cond.tinnitus` | ent | MATCHES dup | 耳鳴 | 耳鳴 / 耳聾（但為編者註，見 §3） |
| 47 | `cond.hearing_loss` | ent | **ADJACENT** dup | — | 註2 全篇為**耳鳴**辨證 |
| 48 | `cond.eye_strain` | ent | **UNVERIFIABLE** | — | 白澀症 / 奪精（泛眼病） |
| 49 | `cond.aphthous_ulcers` | ent | MATCHES | 口瘡 | 口瘡 / 口糜 |
| 50 | `cond.post_covid` | immune | **ADJACENT** dup | 咳嗽 | 喘證（= #31 逐字，喘證非本卡連結） |
| 51 | `cond.chronic_allergies` | immune | **ADJACENT** dup | — | 溫熱病斑疹（= #37 逐字） |
| 52 | `cond.cancer_supportive` | immune | **WRONG-TOPIC** dup | — | **臟躁（胎前證下）** |

---

## §2 WRONG-TOPIC and ADJACENT — verbatim, with true-home identification

Ordering: worst first. "Only copy" = the true-home card's `classical_references_zh` is **absent**,
so the passage must be **MOVED** (搬), not dropped. "Duplicate" = the true-home card already
carries the identical block, so this copy can be **archived to `import_artifacts` and cleared**.

### 2.1 `cond.male_infertility` — WRONG-TOPIC — DUPLICATE

Card: 男性不育症 / Male Factor Infertility, `related_eastern_diseases: ["tdis.bu_yu"]` (不育).
Field carries three 陽痿 (impotence) passages, complete and unmixed:

> 《慎齋遺書.陽痿》：「一人二十七八，奇實鰥居，鬱鬱不樂，遂成**痿證**，終年**不舉**。…」
>
> 《沈氏尊生書.前陰後陰病源流》：「失志之人，抑鬱傷肝，肝木不能疏達，亦致**陰痿不起**。…」
>
> 《古今醫案按.**陽痿**》：「一少年新婚，欲交媾，女子阻之，乃逆其意，遂**陰痿不舉**者五七日。」

Mismatching disease term: **陽痿 / 陰痿 / 痿證** — none of which is 不育. Two of the three source
citations name 陽痿 in the *chapter title itself*.

**True home: `cond.erectile_dysfunction`** (勃起功能障礙, `aliases_zh: ["陽痿"]`,
`related_eastern_diseases: ["tdis.yang_wei"]`). It **already carries this block byte-identically**.
→ **duplicate; drop-with-archive**, nothing is lost.

The sharpest part: this branch's own `acupuncture_scope.precautions` on this same card warns
against substituting erectile-dysfunction material for male-infertility material. The card argues
against itself in two adjacent fields.

### 2.2 `cond.bph` — WRONG-TOPIC — DUPLICATE

Card: 良性攝護腺增生 / BPH, `related_eastern_diseases: ["tdis.long_bi","tdis.lin_zheng"]` (癃閉/淋證).
The block is entirely 白濁/精濁 (turbid urethral discharge = classical chronic prostatitis), and
closes with a modern editorial sentence:

> 《證治要訣·**白濁**》曰：」**白濁**甚&hellip;&hellip;此**精濁**窒塞竅道而結。」
>
> 《證治匯補·下竅門·便濁·附**精濁**》云：「**精濁**者，因敗精流於尿竅，滯而難出。」
>
> 清代葉天士在《臨證指南醫案·淋濁》中的一則案例後評論道：「若房勞強忍…」
> **上述文獻都強調了瘀阻在慢性前列腺炎發病中的重要性。**

Mismatching disease term: **白濁 / 精濁 / 慢性前列腺炎**, versus 癃閉 (BPH's own TCM link).
The last sentence is not a classical citation at all — it is a modern article's summary line, and it
names 慢性前列腺炎 outright.

**True home: `cond.chronic_prostatitis`** (攝護腺炎（含慢性攝護腺炎／慢性骨盆疼痛症候群）), which
carries this block byte-identically and for which 精濁 is the correct classical name.
→ **duplicate; drop-with-archive.**

Also carries 16 zero-width characters and 6 `&hellip;` (§3).

### 2.3 `cond.cancer_supportive` — WRONG-TOPIC — DUPLICATE

Card: 腫瘤支持照護（輔助文件情境）, `related_eastern_diseases: ["tdis.xu_lao","tdis.ou_tu"]`.
Third passage is an **antepartum** 臟躁 discussion from a gynaecology text:

> 《女科經綸/**胎前證下**》：「無故悲傷屬肺病，**臟躁**者，肺之臟躁也。**胎前**氣血壅養胎元，則津液不能充潤，
> 而肺為之燥，肺燥當補母，故有甘草大棗以補脾…」

Mismatching disease term: **臟躁 · 胎前** (pregnancy) on an oncology supportive-care card.
The whole block is byte-identical to `cond.depression`'s.

**True home:** the two 《靈樞·本神》 emotional-injury passages belong with `cond.depression`
(鬱證) where they already sit; the 女科經綸 胎前臟躁 passage belongs to a 臟躁/妊娠 card —
`tdis.zang_zao` exists in `tdis_registry.json`, but **no card in the 505 canon claims 臟躁 as its
identity** (`cond.pms` links it as one of two secondary links). → on `cond.cancer_supportive` the
block is a **duplicate; drop-with-archive**. The 胎前臟躁 passage's own misplacement on
`cond.depression` is §2.10.

### 2.4 The 景岳全書·婦人規 seven-card block — 5× WRONG-TOPIC, 1× ADJACENT, 1 true home

One 63-character string, byte-identical, on **seven** gyn cards:

> 《景岳全書.婦人規》：「凡欲念不遂，沉思積鬱，心脾氣結致傷衝任之源，而腎氣日消，
> **輕則或早或遲，重則漸成枯閉**，此宜兼治心脾腎。」

The passage's named outcomes are **月經或早或遲** (early/late cycle) and **枯閉** (amenorrhea).

| card | own identity | class | why |
|---|---|---|---|
| `cond.irregular_menstruation` | 月經不調 ← `tdis.yue_jing_xian_qi` 月經先期 + `tdis.yue_jing_hou_qi` 月經後期 | **MATCHES — true home** | 「或早或遲」 *is* 先期/後期 |
| `cond.endometriosis` | 子宮內膜異位症 / 痛經·癥瘕·不孕 | WRONG-TOPIC | quote names neither 痛經 nor 癥瘕 |
| `cond.primary_dysmenorrhea` | 原發性痛經 / 痛經 | WRONG-TOPIC | 痛經 absent from quote |
| `cond.pms` | 經前症候群 / 鬱證·臟躁 | WRONG-TOPIC | 經前諸證 absent from quote |
| `cond.recurrent_pregnancy_loss` | 習慣性流產 | WRONG-TOPIC | 滑胎/墮胎 absent; quote is pre-conception cycle |
| `cond.chronic_pelvic_pain` | 慢性骨盆腔疼痛 / 腹痛·癥瘕 | WRONG-TOPIC | 腹痛 absent from quote |
| `cond.female_infertility` | 女性不孕症 / 不孕 | ADJACENT | 枯閉 is a *cause* of 不孕, not 不孕 itself |

**True home `cond.irregular_menstruation` already carries it.** → the other six are
**duplicates; drop-with-archive**, no content lost. This is the single cheapest remediation in the
whole sweep: six fields cleared, zero research required.

### 2.5 The 蘭室秘藏 血枯經絕 three-card block — 3× ADJACENT, true home is EMPTY

> 《蘭室秘藏．婦人門》："婦人脾胃久虛…而致**經水斷絕不行**…血海枯竭，**病名曰血枯經絕**。…
> 故《內經》云：**月事不來者，胞脈閉也**。…今氣上迫肺，心氣不得下通，故**月事不來**也。"
>
> 《濟陰綱目．調經門》："…言**經水少**，不如前者何也？…亡其津液，故令**經水反少**。"
> 《女科經綸．月經門》："…尺脈來而斷絕者，**月水不利**…"

Two different diseases inside one block: **血枯經絕 / 月事不來 = 閉經 (amenorrhea)** in para 1,
**經水少 / 月水不利 = 月經過少** in para 2.

| card | own links | class |
|---|---|---|
| `cond.pcos` | 月經後期, **閉經**, 不孕 | ADJACENT — 閉經 is a declared link but not the card's identity |
| `cond.oligomenorrhea` | **月經過少**, 月經後期 | ADJACENT — para 2 is correct here, para 1 (閉經) is not |
| `cond.thin_endometrium` | 月經過少, 不孕 | ADJACENT — neither paragraph is about 內膜厚度 |

**True home for para 1: `cond.amenorrhea`** (繼發性閉經, `related_eastern_diseases: ["tdis.bi_jing"]`).
Verified: `'classical_references_zh' in cond.amenorrhea → false`. **This is the only copy of the
血枯經絕 passage in the corpus — it must be MOVED, not dropped.**
Para 2 (經水少) has its correct home in `cond.oligomenorrhea`, where it already is.

This is the case the COND_GYN_FILL_ASSESSMENT flagged on `cond.thin_endometrium`; the sweep shows it
is a three-card group, and that the destination card is standing empty.

### 2.6 `cond.recurrent_uti` — WRONG-TOPIC — ONLY COPY, must be MOVED

Card: 反覆泌尿道感染（文件情境）, `related_eastern_diseases: ["tdis.lin_zheng"]` (淋證).
All three passages are 小便不通 (urinary retention), including a catheterisation technique:

> 《丹溪心法.**小便不通**》：「**小便不通**，有氣虛、血虛、有痰、風閉、實熱。…」
>
> 《辨證錄.**小便不通門**》：「人有**小便不通，點滴不能出**，急悶欲死…」
>
> 《備急千金要方.膀胱腑》中記載**導尿法**：「…**小便不通**…以蔥葉除尖頭，內陰莖孔中深三寸，微用口吹之…」

Mismatching disease term: **小便不通 / 癃閉**, versus the card's own 淋證 (painful frequent
urination). In classical nosology these are explicitly contrasted, not synonyms.

**True home: `cond.urinary_retention`** (非阻塞性尿滯留（文件情境）,
`related_eastern_diseases: ["tdis.long_bi"]` 癃閉). Verified:
`'classical_references_zh' in cond.urinary_retention → false`.
→ **only copy; MOVE.** Dropping it would lose the 千金要方 catheterisation passage entirely.

### 2.7 `cond.functional_dyspepsia` — WRONG-TOPIC — ONLY COPY, no destination in this file

Card: 功能性消化不良 (adult Rome-criteria FD), links 痞滿 / 胃痛.
Passage 1 (《壽世保元》 胃氣為本) is on-topic. Passages 2 and 3 are **paediatric**:

> 《**小兒**藥證直訣．腹中有癖》：「**小兒**病癖，由**乳食**不消，伏在腹中…不早治，必成**疳**。…
> 鮮不瘦而成**疳**矣。」
>
> 《**嬰童**百問．**積滯**》：「**小兒**有**積滯**，面目黃腫…然有**乳積**、**食積**，須當明辨之。
> **吐乳、瀉乳**…是為**乳積**。…合用木香丸主之，檳榔丸亦可用…」

Mismatching disease terms: **小兒積滯 / 疳 / 乳積** — an infant feeding-accumulation syndrome with
its own formulas, on an adult functional-dyspepsia card.

**True home:** `tdis.ji_zhi` (積滯) exists in `tdis_registry.json`, but **no record in the 505-card
canon claims 積滯 / 疳 / paediatric accumulation as its identity** (grep for 積滯|疳|小兒 over
`name_zh`/`name_en` returns nothing). → **only copy, no in-file destination.** Archive to
`import_artifacts` with the destination named as `tdis.ji_zhi`, pending that line's card.

### 2.8 `cond.urticaria` + 2.9 `cond.chronic_allergies` — ADJACENT — one block, two cards

> 《外感溫熱篇》："若夾**斑帶疹**…然**斑**屬血者恒多，**疹**屬氣者不少…"
>
> 《中醫臨證備要》："**溫熱病身熱不退，發出紅色小點**，稱為"**疹**"與**發斑**原因相同。
> 但**斑**最重，**疹**稍輕…"

This is 溫病 **斑疹** — the febrile exanthem of a warm-disease course — not **癮疹** (urticaria,
`tdis.yin_zhen`, the declared link of both cards). The second quote defines it explicitly as
「溫熱病身熱不退，發出紅色小點」, which is not a wheal that resolves in 24 hours.

`cond.urticaria` is the closer of the two; `cond.chronic_allergies` (鼻鼽/癮疹) holds the identical
copy. → `cond.chronic_allergies` is a **duplicate; drop-with-archive**. `cond.urticaria`'s copy
needs Ting: it is not urticaria, but there is no 斑疹/溫病 card in the canon to move it to.

### 2.10 `cond.depression` — ADJACENT (one passage WRONG-TOPIC)

Passages 1–2 (《靈樞·本神》 情志傷神) are legitimate 鬱證 mechanism material. Passage 3 is the
antepartum 臟躁 quote reproduced in §2.3 — 胎前 material on a major-depression card.
→ passage-level relocation, not a whole-field clear. Needs Ting (no 臟躁 card exists).

### 2.11 `cond.hearing_loss` — ADJACENT

Card: 感音神經性聽損. Note 2 of the block is entirely about **耳鳴**:

> 註2: **耳鳴**的辨證有：風熱襲肺、肝火上炎…可以改善**耳鳴**的中藥很多，例如：桑菊飲…
> 等等至少上百種中藥。

`cond.tinnitus` holds the identical block and is the correct home for 註2.
The third paragraph (《雜病源流犀燭》 耳聾/重聽) is correct on the hearing-loss card and is the
only part that is. → split, not a clean drop. Needs a hand.

### 2.12 `cond.migraine_vestibular` / `cond.circadian_disorder` / `cond.post_covid` — ADJACENT, all duplicates

Three cards whose entire block is another card's, verbatim:

| card | block belongs to | passage's disease |
|---|---|---|
| `cond.migraine_vestibular` (前庭性偏頭痛) | `cond.migraine` | 「頭半邊痛者…此**偏頭痛**也」 — 偏頭痛, no vestibular/眩暈 content |
| `cond.circadian_disorder` (晝夜節律睡眠障礙) | `cond.insomnia` | 「**不寐**雖病有不一…」 — 不寐, no circadian content |
| `cond.post_covid` (新冠後症候群) | `cond.asthma` | 「傷寒**喘**…**哮以聲響名，喘以氣息言**」 — 喘證/哮證; 喘證 is not even a declared link of this card |

All three: **duplicates; drop-with-archive.** No content lost.

### 2.13 The three MATCHES-but-duplicated groups (no attribution error, still red line 6)

`copd` / `chronic_cough` / `post_viral_cough` share one 307-char 咳嗽 block; `tension_headache` /
`cluster_headache` share one 587-char 頭痛 block. Each card legitimately links 咳嗽 / 頭痛, so no
card is *wrong* — but one string doing duty on three diseases is boilerplate by the constitution's
definition, and it makes the field's coverage number meaningless. Reported, not classified as an
attribution error.

---

## §3 Mechanical junk — counts

```
node -e "const r=require('./data/pathology/condition_canon_shortlist.json').records.filter(x=>x.classical_references_zh);console.log('with HTML entity',r.filter(x=>/&[a-zA-Z]+;/.test(x.classical_references_zh)).length,'| with zero-width',r.filter(x=>/[\u200b\u200c\u200d\ufeff]/.test(x.classical_references_zh)).length,'| with straight quote',r.filter(x=>/\x22/.test(x.classical_references_zh)).length);"
→ with HTML entity 13 | with zero-width 2 | with straight quote 9
```

| defect | records | occurrences | ids |
|---|---|---|---|
| **HTML entity** (all `&hellip;`) | **13** | **32** | oligomenorrhea, thin_endometrium, cluster_headache, chronic_diarrhea(×7), nausea_vomiting, migraine_vestibular, herpes_zoster(×2), recurrent_uti, bph(×6), chronic_prostatitis(×6), hearing_loss(×2), eye_strain, post_covid |
| doubled `&hellip;&hellip;` | 3 | — | herpes_zoster, bph, chronic_prostatitis |
| **zero-width chars** (U+200B) | **2** | **32** | bph(16), chronic_prostatitis(16) |
| **straight ASCII `"` used as Chinese quote** | **9** | **44** | pcos, uterine_fibroids, oligomenorrhea, thin_endometrium, frozen_shoulder, rheumatoid_arthritis, bells_palsy, urticaria, chronic_allergies |
| 「」 and `"` mixed inside one record | 3 | — | frozen_shoulder, rheumatoid_arthritis, bells_palsy |
| **C0 control / DEL / bidi** | **0** | 0 | — |
| **HTML tags** | **0** | 0 | — |
| **English sentences inside `_zh`** | **0** | 0 | the only Latin runs are `hellip` inside the entities |
| romanization / pinyin | 0 | 0 | — |
| **`_zh`/`_en` length mismatch** | **n/a** | — | `_en` does not exist on any of 505 records (§0.1) |

Non-citation content sitting in a citation field:

| defect | records | ids |
|---|---|---|
| scrape provenance sentence 「本文主要參考《中醫症狀鑑別診斷學》所撰寫而成。」 | 2 | tension_headache, cluster_headache |
| editor's notes 「註1:」「註2:」 instead of a citation | 2 | tinnitus, hearing_loss |
| modern editorial gloss 「上述文獻都強調了…」 | 2 | bph, chronic_prostatitis |
| herb-shopping paragraph 「可以改善耳鳴的中藥很多，例如：…至少上百種中藥」 | 2 | tinnitus, hearing_loss |
| mainland-usage term 前列腺 (canon uses 攝護腺) | 2 | bph, chronic_prostatitis |
| non-standard orthography 溼 / 爲 / 嶽 / 慾 (simplified→traditional conversion residue) | 2 | bph, chronic_prostatitis |
| 1,907-char 《本草綱目》 herb catalogue pasted as a "reference"; ends mid-sentence 「或同半夏丸服。」 | 1 | nausea_vomiting |
| block ends mid-sentence with an unclosed quote | 1 | nausea_vomiting （「大吐，渴飲水者即死，童便飲之，最妙。） |

---

## §4 Validator gap + proposed predicate

### 4.1 What the validators see today: **nothing**

`grep -c classical_references scripts/validate-condition-standard.js` → **2**. Both are membership
lines, neither is a check:

- line 100 — inside `CONTENT_FIELDS`, the set that makes the key a *legal* field name (C8 unknown-key check).
- line 267 — inside `SKELETON_CONTENT_FIELDS`, which only decides whether C4 (red-flags) applies.

`classical_references_zh` / `_en` is **not** in `BILINGUAL_PAIRS` (lines 144–153), so **C5/C9 never
fire** — that is why 52 zh-only records produce 0 defects. There is no shape check, no length check,
no content check, and `validate-content-junk.js` has no rule that this field's `&hellip;` or
zero-width characters would trip (its ENCODING check looks for U+FFFD and Cyrillic; its CONTROL
check for C0/DEL/bidi — this field has 0 of each).

**Plainly: the field is entirely unvalidated. All 52 filled records are invisible to every gate in
the repo, and the corpus-wide blocking count for conditions is 4 — none of them here.**

### 4.2 Candidate predicates, measured against the §1 classification

Ground truth = the 52-record classification in §1 (MATCHES 28 / WRONG 10 / ADJACENT 11 / UNVER 3).
A flag is a **true positive** if the record is WRONG-TOPIC or ADJACENT; a **false positive** if it is
MATCHES **or** UNVERIFIABLE (strict scoring — UNVERIFIABLE is not a confirmed error, so counting it
as a hit would flatter the number).

| predicate | flagged | TP | FP | **FP rate** | recall on the 21 | catches `male_infertility` | catches `thin_endometrium` |
|---|---|---|---|---|---|---|---|
| **P1** normalized `classical_references_zh` shared with ≥1 other record | 29 | 18 | 11 | **37.9 %** | 85.7 % | ✔ | ✔ |
| **P2** no disease term from the card's own `name_zh`/`aliases_zh`/`related_eastern_diseases`→`name_zh` appears literally in the passage | 27 | 18 | 9 | **33.3 %** | 85.7 % | ✔ | ✔ |
| **P3 = P1 ∧ P2** | **18** | **16** | **2** | **11.1 %** | 76.2 % | ✔ | ✔ |

P1 measured at **group** level instead of record level: 11 groups, **9 contain ≥1 misattribution**
→ group-level FP **2/11 = 18.2 %** (the two clean groups are 咳嗽×3 and 頭痛×2, which are still
red-line-6 boilerplate even though nobody is wrong).

**Recommended: P3, warn-level (an `N`-code, not a `C`-code).**

```
flag record R when
  (a) normalize(R.classical_references_zh) equals that of ≥1 other record   // normalize = strip &entities, keep CJK only
  AND
  (b) no term in { R.name_zh, R.aliases_zh[], tdis_registry[R.related_eastern_diseases[]].name_zh }
      of length ≥2 occurs as a literal substring of R.classical_references_zh
```

- **11.1 % false-positive rate** — 2 of 18 flags: `cond.irregular_menstruation` (the 景岳 quote's
  true home; it says 「或早或遲」, never the literal string 月經先期) and `cond.chronic_prostatitis`
  (精濁 is the correct classical name but is not in the card's `aliases_zh`). **Both false positives
  are fixable from the card side** — adding 月經先期/月經後期 as `aliases_zh` on the first and 精濁 on
  the second would take P3's FP rate to **0/16**, and both are true content improvements
  independent of this check.
- **Catches both known hits.** `cond.male_infertility` and `cond.thin_endometrium` are both flagged.
- Misses 5 of 21 (`functional_dyspepsia`, `recurrent_uti`, `circadian_disorder`,
  `migraine_vestibular`, `post_covid`) — all cases where the passage is unique to the card, or where
  the card declares the passage's disease as a secondary link. No mechanical rule reaches those; they
  need a reader.

Why not P2 alone despite the same recall: its 9 false positives are all **classical-synonym gaps**
(頸椎病 vs 頸項強痛, 痔瘡 vs 痔, 遺尿 vs 小便不禁, 肩凝症 vs 肩不舉, 痺 vs 痹 variant characters,
目暗昏花 vs 白澀症). Closing them would require authoring a classical-synonym table — that is content
work wearing a validator's clothes, and it would drift.

**Also recommended, separately and unconditionally: P1 as a standalone boilerplate report.**
It needs no vocabulary at all, is 100 % reproducible, and 29/52 (55.8 %) of this field is a copy.
That number alone is the argument for the remediation batches below.

### 4.3 Second, zero-ambiguity check worth adding at the same time

Add `["classical_references_zh", "classical_references_en"]` to `BILINGUAL_PAIRS` **only after** a
decision on whether this field should be bilingual at all. Adding it today creates **52 new C5
defects** in one line and would break `check-validation-ratchet.js`. That is a Ting decision, not a
validator decision — a classical Chinese passage arguably should not have an `_en` twin at all, in
which case the correct fix is a documented carve-out in the template, not 52 translations.

---

## §5 Recommended remediation batches

### Batch A — mechanical, no clinical judgment, safe to automate (12 records)

Entity/character cleanup only; not one character of meaning changes.

1. `&hellip;` → `…` on 13 records (32 occurrences); collapse `&hellip;&hellip;` → `……` on 3.
2. Strip 32 U+200B zero-width characters from `cond.bph` + `cond.chronic_prostatitis`.
3. Normalize straight `"` → 「」 on 9 records (44 occurrences), preserving nesting.

Reproducible before/after count: the §3 one-liner must go to `0 | 0 | 0`.
Note the two known 前列腺/溼/爲 orthography records are *not* in this batch — replacing 前列腺 with
攝護腺 inside a quoted modern sentence changes quoted text and needs a decision.

### Batch B — duplicate drop-with-archive, destination already holds the content (11 records)

For each: move the block to `import_artifacts` with `{field, text, reason, true_home}` per template
§3.5.5, then clear `classical_references_zh`. Nothing is lost — the true home already carries the
identical block.

| record | true home (already carries it) |
|---|---|
| `cond.male_infertility` | `cond.erectile_dysfunction` |
| `cond.bph` | `cond.chronic_prostatitis` |
| `cond.cancer_supportive` | `cond.depression` |
| `cond.endometriosis` | `cond.irregular_menstruation` |
| `cond.primary_dysmenorrhea` | `cond.irregular_menstruation` |
| `cond.pms` | `cond.irregular_menstruation` |
| `cond.recurrent_pregnancy_loss` | `cond.irregular_menstruation` |
| `cond.chronic_pelvic_pain` | `cond.irregular_menstruation` |
| `cond.migraine_vestibular` | `cond.migraine` |
| `cond.circadian_disorder` | `cond.insomnia` |
| `cond.post_covid` | `cond.asthma` |
| `cond.chronic_allergies` | `cond.urticaria` (itself ADJACENT — see Batch D) |

(12 rows; `cond.chronic_allergies` is listed here for the mechanics but its destination is itself
unsound, so hold it with Batch D. **Batch B as safe-to-execute = 11 records.**)

Expected result: `classical_references_zh` filled 52 → 41; duplicate groups 11 → 4;
records-in-duplicate-groups 29 → 12.

### Batch C — MOVE, destination card is empty (2 records, needs care not judgment)

| passage | from | to | destination state |
|---|---|---|---|
| 《蘭室秘藏．婦人門》 血枯經絕 / 月事不來 | `cond.pcos`, `cond.oligomenorrhea`, `cond.thin_endometrium` (3 copies, 1 unique passage) | **`cond.amenorrhea`** | `classical_references_zh` **absent** |
| 《丹溪心法.小便不通》 + 《辨證錄.小便不通門》 + 《備急千金要方》導尿法 | `cond.recurrent_uti` (only copy) | **`cond.urinary_retention`** | `classical_references_zh` **absent** |

**Move first, then clear the source** (constitution §二.3). Order reversed = the passage is gone.
`cond.oligomenorrhea` keeps its 濟陰綱目/女科經綸 經水少 paragraph — this is a *split*, not a whole-field move.

### Batch D — needs Ting (7 records)

Cannot be resolved without a decision about what the canon should contain:

1. **`cond.urticaria` + `cond.chronic_allergies`** — the 溫病斑疹 block is not 癮疹, and there is
   **no 斑疹/溫病發疹 card in the 505 canon** to move it to. Create one, retire the passage, or accept it?
2. **`cond.functional_dyspepsia`** — 小兒積滯/疳 passages; `tdis.ji_zhi` exists in
   `tdis_registry.json` but no canon card claims it. Archive with the tdis id named, or hold?
3. **`cond.depression`** — passage-level split: keep the two 靈樞·本神 quotes, relocate the
   女科經綸 胎前臟躁 passage; no 臟躁 card exists.
4. **`cond.hearing_loss`** — passage-level split: 註2 (耳鳴 辨證) belongs to `cond.tinnitus`
   (which already has it); 《雜病源流犀燭》 耳聾/重聽 stays.
5. **`cond.tinnitus` + `cond.hearing_loss`** — the 註1/註2 editor's notes and the herb-shopping
   paragraph are not classical citations at all. Do they move to `import_artifacts` wholesale?
6. **`cond.nausea_vomiting`** — 1,907 chars of 《本草綱目》 herb catalogue truncated mid-sentence.
   Not a citation; a scrape. Archive it?
7. **The bilingual question (§4.3)** — should `classical_references_*` be a bilingual pair at all?
   Adding it to `BILINGUAL_PAIRS` today = +52 C5 in one commit.

### Batch E — validator work (Claude's path, after A–C land)

Add P3 as a warn-level `N`-code plus P1 as a standalone duplicate report to
`validate-condition-standard.js`. Measured on today's corpus: P3 flags 18, 16 true, **11.1 % FP**;
after Batches B+C it should flag ≤5. Do **not** land it as a blocking `C`-code — the two false
positives are card-side vocabulary gaps, and a gate that fails on a correct card gets switched off.

---

## §6 Numbers this ledger stands behind

| claim | one-line reproduction |
|---|---|
| 505 records, 52 with `classical_references_zh`, 0 with `_en` | §0.1 |
| 11 duplicate groups / 29 records / 34 distinct blocks | §0.4 |
| 13 HTML-entity / 2 zero-width / 9 straight-quote records | §3 |
| 0 control chars, 0 HTML tags, 0 English sentences, 0 romanization | §3 |
| validator mentions the field twice, checks it zero times | `grep -n classical_references scripts/validate-condition-standard.js` → lines 100, 267 |
| WRONG-TOPIC 10 · ADJACENT 11 · MATCHES 28 · UNVERIFIABLE 3 | §1, eyes-on, one row per record |

No `data/**` file was modified by this pass. No replacement citation was authored.

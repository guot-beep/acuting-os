# Herb & Formula card — target quality spec

Ting's bar, verbatim: 「我的卡片應該是中英文並行 然後資料豐富 中藥方劑至少有
cloud tcm american dragon 的水平以上」

Purpose of this file: define "good enough" as something measurable, so that
"complete" can never again mean "the field is not empty".

---

## 0. Two layers, not one — the mistake the current cards make

Ting, on `chinesemedicineatlas.com`: 「這個網站的標籤跟英文 還有圖片都很好
沒有太多雜亂 剛剛好的內容」.

That site is not competing with CloudTCM or American Dragon on depth — it is a
different **layer**, and getting that separation right is most of what makes a
card feel good rather than cluttered:

- **Glance layer** — what you read while scanning 200 herbs. The Atlas card is
  exactly: category banner, English common name, **tone-marked pinyin
  (Má Huáng, not "Ma Huang")**, 中文, one temperature token, **channel
  abbreviations (LU · BL)**, and **three plain-language indications**
  ("common cold, asthma, bronchitis") — everyday English, deliberately not
  pattern terminology.
- **Study layer** — CloudTCM + American Dragon depth: nested indications,
  dosage, processing, interactions, pairs, comparisons.

Our current cards mix the two into one wall of text, which is why they read as
cluttered *and* thin at the same time. Every record therefore carries a
`glance` block alongside the study fields.

Three things the Atlas has that we had none of: tone-marked pinyin, channel
abbreviations, and plain-language indications. All three are now required.

(Note: the Atlas uses 简体 and covers 102 herbs; this repo is 繁體 and 202.
Adopt the presentation, keep our character set and coverage.)

## 1. The two benchmark sources

Both fetched and confirmed 2026-07-22 against 麻黃 / Ma Huang.

**CloudTCM** (`cloudtcm.com/herb/<id>`, 麻黃 = `/herb/1`) — Chinese depth.
Ten sections: 基本資訊、性味歸經、傳統功效、現代功效、運用方法與用量、炮製、
注意事項及副作用、化學成分(40+ 化合物)、相關方劑(60+)、可改善疾病(50+).

**American Dragon** (`americandragon.com`) — English clinical depth.
NAME / Pharmaceutical Latin / Common English / CATEGORY / PROPERTIES /
ACTIONS AND INDICATIONS / CONTRAINDICATIONS, INCOMPATIBILITIES AND HERB-DRUG
INTERACTIONS / MAJOR COMBINATIONS / NOTES.

**They agree on facts our record got wrong.** Both give 麻黃 as 辛、**微苦**、溫
and dose 1.5–10g. Our record says "Acrid; warm" with no dosage field at all.
Two independent sources agreeing is exactly the provenance we should be
recording.

**The structural lesson from American Dragon:** its indications are not a flat
list. They nest 功效 → 證型 → 臨床表現 — "Induces sweating and releases the
Exterior" → "Wind-Cold Invades the Lung" → "anhidrosis, chills, fever,
headache, tight floating pulse". A flat indication list cannot teach pattern
differentiation. Our schema must nest.

---

## 2. The design flaw this exposes

The gap is **not only that fields are empty — we do not have the fields.**
Filling every existing herb field to perfection would still not reach either
benchmark, because the schema has no dosage, no 炮製, no 化學成分, no modern
pharmacology, and no treatable-conditions link.

**So: expand the schema first, then fill.** Same applies to formulas.

---

## 3. Target herb record

Every content field is bilingual. A `_zh` field containing English is a defect,
not a draft.

```jsonc
{
  "id": "herb.ma_huang",
  "name_zh": "麻黃", "name_en": "Ephedra", "pinyin": "Ma Huang",
  "pharmaceutical_latin": "Herba Ephedrae",
  "botanical_name": "Ephedra sinica",
  "aliases_zh": [], "aliases_en": [],
  "category_zh": "解表藥－發散風寒", "category_en": "Release Exterior - Warm Acrid",

  "properties": {
    "taste_zh": ["辛", "微苦"], "taste_en": ["Acrid", "Slightly bitter"],
    "temperature_zh": "溫", "temperature_en": "Warm",
    "channels_zh": ["肺經", "膀胱經"], "channels_en": ["Lung", "Bladder"],
    "sources": ["cloudtcm_herb_pages", "american_dragon"]        // NEW: both agree
  },

  "dosage": {                                                    // NEW - did not exist
    "decoction_g": "1.5-10",
    "other_forms_zh": "或入丸、散", "other_forms_en": "Tincture 1-3ml; pills, powders",
    "notes_zh": "", "sources": []
  },

  "actions_indications": [                                       // NEW SHAPE - nested
    {
      "action_zh": "發汗解表", "action_en": "Induces sweating, releases the exterior",
      "patterns": [
        { "pattern_zh": "風寒束表(風寒犯肺)", "pattern_en": "Wind-Cold invades the Lung",
          "clinical_picture_zh": "無汗、惡寒、發熱、頭痛、脈浮緊",
          "clinical_picture_en": "Anhidrosis, chills, fever, headache, tight floating pulse" }
      ],
      "sources": []
    }
  ],

  "modern_pharmacology_zh": ["發汗", "鎮咳", "利尿", "抗炎", "抗菌", "鎮痛", "降血糖"],
  "modern_pharmacology_en": [],                                  // NEW
  "chemical_composition": [],                                    // NEW
  "processing": [                                                // NEW - 炮製
    { "method_zh": "蜜炙", "method_en": "Honey fried",
      "effect_on_action_zh": "", "effect_on_action_en": "" }
  ],
  "contraindications_zh": [], "contraindications_en": [],
  "herb_drug_interactions": [],                                  // NEW
  "toxicity_note_zh": "", "toxicity_note_en": "",
  "major_combinations": [                                        // NEW - 配伍
    { "with": "herb.gui_zhi", "purpose_zh": "", "purpose_en": "", "sources": [] }
  ],
  "comparisons": [],                                             // NEW - 相似藥鑑別
  "related_formulas": [],                                        // target: tens, not one
  "treatable_conditions": [],                                    // NEW - link to condition canon
  "field_sources": {},                                           // per-field provenance
  "review_status": "draft"
}
```

## 4. Target formula record

Everything the herb card gets, the formula card gets too — Ting: 「同樣的方劑也要有
這個 加劑量隨證增減 對藥 還有中英文」.

```jsonc
{
  "id": "formula.ma_huang_tang",
  "name_zh": "麻黃湯", "name_en": "Ephedra Decoction", "pinyin_toned": "Má Huáng Tāng",
  "source_text_zh": "《傷寒論》", "source_text_en": "Shang Han Lun",
  "category_zh": "辛溫解表劑", "category_en": "Formulas that Release the Exterior - Warm Acrid",

  "glance": { /* same scan layer as herbs: category banner, toned pinyin, 3 plain indications */ },

  "composition": [                       // per-herb dose AND role, never a name list
    { "herb_id": "herb.ma_huang", "dose_g": "9", "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "發汗解表、宣肺平喘", "role_reason_en": "..." },
    { "herb_id": "herb.gui_zhi", "dose_g": "6", "role_zh": "臣", "role_en": "Deputy" },
    { "herb_id": "herb.xing_ren", "dose_g": "9", "role_zh": "佐", "role_en": "Assistant" },
    { "herb_id": "herb.zhi_gan_cao", "dose_g": "3", "role_zh": "使", "role_en": "Envoy" }
  ],

  "key_pairs": ["pair.ma_huang__gui_zhi", "pair.ma_huang__xing_ren"],   // 對藥 - see §4.1

  "fang_yi_zh": "…", "fang_yi_en": "…",          // 方義 - why this structure works
  "actions_zh": [], "actions_en": [],
  "indications": [ /* nested action -> pattern -> clinical picture, as for herbs */ ],
  "tongue_zh": "", "pulse_zh": "", "tongue_en": "", "pulse_en": "",

  "modifications": [                     // 加減 / 隨證增減 - REQUIRED, this is the clinical core
    { "if_zh": "喘甚", "if_en": "Marked wheezing",
      "change_zh": "加重杏仁，或加蘇子", "change_en": "Increase Xing Ren, or add Su Zi",
      "sources": [] },
    { "if_zh": "兼裡熱、煩躁", "if_en": "With interior heat and restlessness",
      "change_zh": "加石膏（即大青龍湯法）", "change_en": "Add Shi Gao - the Da Qing Long Tang method",
      "sources": [] }
  ],
  "dose_adjustment_note_zh": "",         // whole-formula scaling: 體虛減量、兒童按體重
  "dose_adjustment_note_en": "",

  "contraindications_zh": [], "contraindications_en": [],
  "modern_applications": [],             // link to condition canon ids, not free text
  "comparisons": [                       // 相似方鑑別
    { "with": "formula.gui_zhi_tang", "differentiator_zh": "表實無汗 vs 表虛有汗",
      "differentiator_en": "Exterior excess without sweating vs exterior deficiency with sweating" }
  ],
  "external_links": [], "field_sources": {}, "review_status": "draft"
}
```

### 4.1 對藥 in formulas — why the pair layer exists

Herb pairs are **not** a field on the herb. They are their own records
(`data/herbs/herb_pairs.json`), because a pair belongs to both herbs, carries
its own meaning, and is the unit formulas are built and taught from. The real
chain is **方劑 → 藥對 → 單味藥**, navigable in every direction.

Each pair carries a 七情配伍 relation id from
`data/config/herb_pair_relations.json` (單行/相須/相使/相畏/相殺/相惡/相反).
The relation is what makes it a 藥對 rather than two names side by side.
相反 is flagged `safety_critical` — the 十八反/十九畏 are combining
contraindications, not notes.

The worked example that teaches formula logic: 麻黃配桂枝 (相須) points the
formula at cold; 麻黃配石膏 (相使) points it at heat. Same Ma Huang — the
partner sets the direction.

### 4.2 隨證增減 on both cards

For **herbs** the adjustment usually runs through the processing form, and both
benchmarks state it directly: 發汗解表宜生用、平喘止咳多炙用、麻黃絨多用於兒科.
For **formulas** it runs through `modifications` (加減) plus whole-formula dose
scaling. Both are required fields, and every entry cites its source — dosage is
a safety-load field, so no invented numbers, ever.

---

## 5. How this gets verified from now on

Ting's instruction: final verification must compare against at least one
external professional site, not only internal self-checks.

1. `node scripts/validate-content-quality.js` — catches empty, 待補 filler,
   copy-pasted template values, Chinese fields with no Chinese, and thin text.
2. **External benchmark spot-check** — take a record, open the same record on
   CloudTCM and on American Dragon, and compare section by section. Report what
   they have that we do not. A layer is not "done" while a benchmark source has
   whole sections we lack.
3. Where two sources disagree, record both with attribution. Never silently
   pick one, and never present one source's number as consensus.

## 6. Baseline at the time of writing

From the quality validator, 2026-07-22:

| layer | substantive |
| --- | --- |
| acupoints functions/indications | 93–98% (genuinely good) |
| acupoints contraindications | 70% (107 records share a template) |
| acupoints muscles / nerves / clinical_pearls | 0% / 0% / 2% |
| herbs — every field | **0%** |
| formulas composition | 20% (23/115) |
| formulas everything else | 0% |
| conditions | 17% (25/150) |
| **overall** | **36%** |

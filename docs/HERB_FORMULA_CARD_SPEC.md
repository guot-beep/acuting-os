# Herb & Formula card — target quality spec

Ting's bar, verbatim: 「我的卡片應該是中英文並行 然後資料豐富 中藥方劑至少有
cloud tcm american dragon 的水平以上」

Purpose of this file: define "good enough" as something measurable, so that
"complete" can never again mean "the field is not empty".

---

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

Same principle. Minimum sections: 組成(with each herb's dose and role
君臣佐使)、方義、功用、主治(nested by pattern)、加減、禁忌、
現代應用、出處/來源方書、相似方鑑別 — bilingual throughout.

The `composition` entry needs per-herb dose and role, not just a name list:

```jsonc
{ "herb_id": "herb.ma_huang", "dose_g": "9", "role_zh": "君", "role_en": "Chief" }
```

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

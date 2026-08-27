# AcuTing OS — 慎用藥禁忌覆蓋缺口查源包（SOL）

**Status:** `NOT CANONICAL`  
**Privacy:** `NO PHI`  
**Date:** 2026-08-27  
**Repo context:** `guot-beep/acuting-os` / `codex/pattern-v2`

> 原則：寧缺勿造。凡未找到足夠權威來源者，保留 `evidence_pending`，不以模型常識補齊。

## 0. 先給結論：四個最重要的修正

1. **麻黃湯中英不對稱可以補，但四條不是同一來源層級。**「瘡家／衄家／亡血家、外感表虛自汗」是方劑層/《傷寒論》禁汗脈絡；「陰虛盜汗」直接查到的是麻黃單味藥慎用；「高血壓/心衰、孕期」是麻黃/麻黃鹼現代成分級安全規則。不能假裝四條都來自同一個 Bensky 或《傷寒論》段落。
2. **E 段三個“超量”不能直接用單味日劑量覆蓋。** 至寶丹雄黃 30 g、蘇合香丸朱砂 60 g/100 g、烏梅丸細辛 18 g 都存在整批製方來源。真正的資料問題是 `dose_g` 混用了 `formula batch amount`、`per-unit exposure`、`adult daily herb dose`。
3. **Interferon 三張卡必須分流。** 麻黃湯/大青龍湯的“減輕 IFN 副作用”有 2002 小型研究背景，但不應放在交互作用安全欄；小柴胡湯 + interferon 則是 PMDA 明確禁忌，方向完全不同。
4. **十八反/十九畏應新增結構化 herb–herb 關係欄。** `contraindications` 可以作 UI 文案，但 canonical 關係不應只存在自由文字。

## A. 麻黃湯：缺失英文安全句與來源歸屬

| Topic | 建議中文 canonical candidate | 建議英文 canonical candidate | Provenance | Source |
|---|---|---|---|---|
| exterior_deficiency_spontaneous_sweating | 外感表虚自汗者禁用麻黄汤；本方为辛温发汗峻剂，适用于表实无汗证。 | Contraindicated in exterior-deficiency patterns with spontaneous sweating; Ma Huang Tang is a strong warming diaphoretic formula intended for exterior-excess patterns without sweating. | formula-specific textbook | [S01] |
| yin_deficiency_night_sweats | 阴虚盗汗者慎用麻黄。若将此条显示在麻黄汤卡，应标注为“由君药麻黄导出的成分级安全规则”，而非伪装成《伤寒论》麻黄汤原文。 | Use Ma Huang with caution in Yin-deficiency night sweating. If surfaced on the Ma Huang Tang card, label this as an ingredient-derived safety rule rather than a formula-specific Shang Han Lun contraindication. | ingredient-specific textbook | [S02] |
| sore_epistaxis_blood_loss_constitutions | 《伤寒论》相关禁汗条文及现代方剂教材均将瘡家、衄家、亡血家列为虽有表寒亦不宜发汗/禁用麻黄汤的情形。 | Classical diaphoresis prohibitions and modern formula teaching treat patients with recurrent sores/ulcerative lesions (chuang-jia), recurrent epistaxis (nü-jia), or significant prior blood loss/blood deficiency (wang-xue-jia) as inappropriate for strong diaphoresis with Ma Huang Tang even when exterior cold is present. | formula-specific classical/textbook | [S01] |
| cardiovascular | 高血压、心力衰竭者禁用麻黄；有显著心脏病或心律失常风险者应避免或仅在专业医疗评估下使用含麻黄方。 | Ma Huang is contraindicated in hypertension and heart failure in the cited TCM textbook reference; patients with significant heart disease or arrhythmia risk should avoid ephedra-containing formulas or use them only under qualified clinical review. | ingredient-derived modern safety | [S02], [S03] |
| pregnancy | 含麻黄/麻黄碱制剂在孕期应避免；该规则来自麻黄/麻黄碱的现代安全资料，而非本次查到的《伤寒论》麻黄汤原方禁忌。 | Avoid ephedra/ephedrine-containing formulas during pregnancy. This is an ingredient-derived modern safety rule, not a formula-specific contraindication located in the classical Ma Huang Tang text. | ingredient-derived modern safety | [S03], [S04] |

### A-1. 重要歸屬判定

- **「表虛自汗」**：可直接歸入麻黃湯方劑使用注意。[S01]
- **「陰虛盜汗」**：本次直接查到的是麻黃單味藥注意事項。[S02] 若顯示在麻黃湯卡，應標 `ingredient-derived`。
- **「瘡家、衄家、亡血家」**：方劑教材明確把它們放在《傷寒論》禁汗脈絡。[S01] 英譯建議保留 classical label，不要簡化成 generic 'skin infection'.
- **「嚴重心臟病/高血壓、孕婦」**：本次最可追溯的證據是麻黃/ephedra 現代安全資料，而非古典麻黃湯條文。[S02][S03][S04]
- **Bensky**：本次沒有取得可核頁碼/版次的 *Formulas & Strategies* 原文，因此**不填一個看似漂亮但不可追溯的 Bensky 引文**。

## B. 慎用藥標準敘述（可重用規則）

### 麻黄 / Ephedra

**中文：**
- 表虚自汗、阴虚盗汗慎用；高血压、心衰禁用；失眠者慎用。
- 有心脏病、青光眼或甲状腺功能亢进者应避免使用或先经专业评估。
- 孕期及哺乳期视为不安全，应避免。
- 与MAOI并用可导致高血压危象；与digoxin并用可增加心律失常风险；与CNS刺激剂或β-肾上腺素能激动剂可叠加刺激/毒性。
- 咖啡因可叠加刺激作用；不应把“咖啡因”为禁药写入卡片，因2026 WADA将咖啡因列为监测而非禁用。
- 运动员：ephedrine/methylephedrine在比赛期间尿浓度超过10 µg/mL时为禁用物质。

**English:**
- Use caution in spontaneous sweating from exterior deficiency or Yin-deficiency night sweating; the cited TCM textbook lists hypertension and heart failure as contraindications and insomnia as a caution.
- Avoid or obtain specialist review in heart disease, glaucoma, or hyperthyroidism.
- Avoid during pregnancy and breastfeeding.
- MAO inhibitors may precipitate hypertensive crisis; digoxin may increase arrhythmia risk; CNS stimulants and beta-adrenergic agonists may have additive stimulant/toxic effects.
- Caffeine may add stimulant effects. Do not label caffeine itself as prohibited: in 2026 it is on WADA's Monitoring Program, not the Prohibited List.
- Athletes: ephedrine and methylephedrine are prohibited in competition when the urine concentration of either exceeds 10 µg/mL.

**Sources:** [S02], [S03], [S04], [S05], [S06]

**Do not auto-infer:** Do not turn all cardiovascular disease into one undifferentiated absolute contraindication; severity/context matters.

### 附子 / 制川乌 / 制草乌 — processed aconites

**中文：**
- 附子：3–15 g，先煎、久煎；孕妇慎用。
- 制川乌：1.5–3 g，先煎、久煎；孕妇慎用。
- 制草乌：1.5–3 g，宜先煎、久煎；本包找到的当前临床资料支持该剂量与煎煮要求，但孕期措辞在不同/不同年代来源间不应机械合并。
- 过量、炮制不当或煎煮不足可致乌头类中毒；可见口舌/四肢麻木、恶心呕吐、头晕、呼吸困难、心律失常、低血压等，严重可危及生命。
- 与半夏类同用的“不宜同用”在2025药典单味条目中明确存在，应作为结构化药-药配伍禁忌。

**English:**
- Fu Zi: 3–15 g; decoct first and for a prolonged period; pregnancy: use with caution.
- Prepared Chuan Wu: 1.5–3 g; decoct first and for a prolonged period; pregnancy: use with caution.
- Prepared Cao Wu: 1.5–3 g and prolonged pre-decoction are supported by the located references, but pregnancy wording should not be mechanically harmonized across editions/sources without direct current-monograph verification.
- Overdose, improper processing, or inadequate decoction can cause aconite poisoning with oral/limb numbness, nausea/vomiting, dizziness, dyspnea, arrhythmia, hypotension, and potentially fatal toxicity.
- The 2025 monographs explicitly state incompatibility with Ban Xia and several other traditional incompatible herbs; store this as a structured herb–herb restriction.

**Sources:** [S07], [S08], [S09], [S10], [S31]

**分歧：** The request's blanket 'pregnancy prohibited' is too strong. 2025 ChP wording for Fu Zi and prepared Chuan Wu is 慎用, not 禁用. Preserve herb-specific wording.

### 大黄 / 芒硝

**中文：**
- 大黄：3–15 g；脾胃虚弱者慎用；孕妇、月经期、哺乳期慎用；作泻下时不宜久煎。
- 大黄作为刺激性泻药长期使用存在肠功能紊乱/泻药依赖风险，因此“久服致依赖”应限定到泻下用途，不宜泛化成所有炮制品/所有适应证。
- 芒硝：6–12 g，通常溶入煎成的汤液；孕妇慎用；2025药典并未在该条目中写哺乳期、月经期或脾胃虚寒。

**English:**
- Da Huang: 3–15 g; use caution in weak Spleen/Stomach and during pregnancy, menstruation, and lactation; do not decoct for long when a purgative effect is intended.
- For stimulant-laxative use, prolonged rhubarb use should be avoided because bowel dysfunction/laxative dependence can occur; do not generalize this sentence to every processed rhubarb use.
- Mang Xiao: 6–12 g, generally dissolved into the finished decoction; use caution in pregnancy. The 2025 monograph located here does not itself state menstruation, lactation, or Spleen/Stomach-deficiency cautions.

**Sources:** [S11], [S12], [S13], [S14]

**Do not auto-infer:** Do not copy Da Huang pregnancy/lactation/menses wording onto Mang Xiao.

### 桃仁 / 红花 / 三棱 / 莪术

**中文：**
- 桃仁：5–10 g，孕妇慎用。
- 红花：3–10 g，孕妇慎用。
- 三棱：5–10 g，孕妇禁用。
- 莪术：6–9 g，孕妇禁用。

**English:**
- Tao Ren: 5–10 g; use caution in pregnancy.
- Hong Hua: 3–10 g; use caution in pregnancy.
- San Leng: 5–10 g; contraindicated in pregnancy.
- E Zhu: 6–9 g; contraindicated in pregnancy.

**Sources:** [S15], [S16], [S17], [S18]

**Evidence pending / 不自動套用：** A blanket hard interaction 'contraindicated with anticoagulants' was not located at the requested pharmacopoeia/textbook authority level in this pass. Do not mechanically add it as a canonical contraindication. Create a separate interaction-evidence task if desired.

### 全蝎 / 蜈蚣 / 水蛭

**中文：**
- 全蝎：3–6 g，有毒，孕妇禁用。
- 水蛭：1–3 g，有小毒，孕妇禁用。
- 蜈蚣：本次找到的药典旧版镜像为3–5 g、有毒、孕妇禁用；写回canonical前应再用2025纸本/网络版复核。

**English:**
- Quan Xie: 3–6 g; toxic; contraindicated in pregnancy.
- Shui Zhi: 1–3 g; slightly toxic; contraindicated in pregnancy.
- Wu Gong: the located legacy pharmacopoeia mirror states 3–5 g, toxic, and contraindicated in pregnancy; verify against the 2025 monograph before canonical ingestion.

**Sources:** [S19], [S20], [S21], [S45]

**Evidence pending / 不自動套用：** A generic 'allergy' sentence was not present in the located pharmacopoeial monographs. Do not fabricate one as a standard class contraindication.

### 朱砂 / 雄黄

**中文：**
- 朱砂（HgS）：2025中国药典0.1–0.5 g，多入丸散，不宜入煎；有毒；不宜大量服用，也不宜少量久服；孕妇及肝肾功能不全者禁用。
- 雄黄（As2S2）：2025中国药典0.05–0.1 g，入丸散；有毒；内服宜慎、不可久用；孕妇禁用。
- 台湾：朱砂自2005-05-01起禁止中药用制造、调剂、输入、输出、贩卖或陈列。雄黄并非同样的全面禁用；含雄黄制剂须标示“本品不宜长期使用”。
- 美国：本次没有找到以“朱砂/雄黄药名”为对象的全国性等价全面禁令。FDA对含汞/砷的未批准传统药产品及重金属风险可采取警告、召回/进口措施；因此美国栏应写为产品与监管分类依赖，而不是简单写“美国禁用”。

**English:**
- Zhu Sha (HgS): ChP 2025 dose 0.1–0.5 g, usually in pills/powders and not decocted; toxic; avoid large doses or prolonged low-dose use; contraindicated in pregnancy and hepatic/renal insufficiency.
- Xiong Huang (As2S2): ChP 2025 dose 0.05–0.1 g in pills/powders; toxic; internal use requires caution, prolonged use is prohibited, and pregnancy is contraindicated.
- Taiwan: cinnabar/Zhu Sha has been prohibited for TCM manufacture, dispensing, import/export, sale, or display since 2005-05-01. Realgar/Xiong Huang is not under the same blanket prohibition; products containing it must carry a 'not for long-term use' warning.
- United States: this search did not locate a nationwide herb-name blanket ban equivalent to Taiwan's cinnabar rule. FDA can act against unapproved traditional drug products and products posing mercury/arsenic heavy-metal risks. Record U.S. status as product/regulatory-category dependent, not simply 'banned'.

**Sources:** [S22], [S23], [S24], [S25], [S26]

### 细辛

**中文：**
- 2025中国药典：细辛限根及根茎；煎服1–3 g，散剂每次0.5–1 g；马兜铃酸I不得过0.001%。
- “细辛不过钱”是历史毒性用量警语，不应被编码为一个跨剂型、跨时代的绝对现代法规上限；现代药典已经给出剂型化用量。
- 马兜铃酸风险与品种、药用部位、原料质量及制备/检测控制相关，不能把“3g”误写成马兜铃酸安全阈值。
- 台湾2026再次重申：药用部位用根部；细辛原料/制剂须依规定检验；浓缩制剂应以水煎煮，传统制剂所用细辛亦需先水煎处理或采用合规浓缩制剂。

**English:**
- ChP 2025 restricts Xi Xin to roots/rhizomes, with 1–3 g for decoction and 0.5–1 g per powder dose, and an aristolochic acid I limit of ≤0.001%.
- The historical maxim 'Xi Xin should not exceed one qian' should not be encoded as an absolute modern maximum across all dosage forms; the modern pharmacopoeia gives dosage-form-specific limits.
- Aristolochic-acid risk is driven by species/plant part/raw-material quality and manufacturing/testing controls; do not treat 3 g as an aristolochic-acid safety threshold.
- Taiwan's 2026 notice again requires the root as the medicinal part and specific testing/manufacturing controls, including water-decoction processing for concentrated and traditional preparations.

**Sources:** [S27], [S28], [S30]

**分歧：** Traditional historical dosing maxim vs modern pharmacopoeial dosage-form-specific standard. Preserve both as separate provenance, not competing numeric values in one dose field.

### 半夏

**中文：**
- 生半夏有毒；内服一般炮制后使用，3–9 g；生品内服宜慎。
- 法半夏、姜半夏均为3–9 g。
- 2025中国药典明确：半夏/法半夏/姜半夏不宜与川乌、制川乌、草乌、制草乌、附子同用。

**English:**
- Raw Ban Xia is toxic; for internal use it is generally processed first, 3–9 g, and raw internal use requires caution.
- Fa Ban Xia and Jiang Ban Xia are both 3–9 g in the cited 2025 monographs.
- ChP 2025 explicitly states that Ban Xia and its cited processed forms should not be used together with Chuan Wu, prepared Chuan Wu, Cao Wu, prepared Cao Wu, or Fu Zi.

**Sources:** [S31], [S32], [S33]

**Evidence pending / 不自動套用：** The 2025 Ban Xia monographs located in this pass do not provide a general pregnancy contraindication. Do not auto-add one merely because the task request expected it.

### 甘草 / Licorice

**中文：**
- 长期或较高暴露的甘草/甘草酸可致假性醛固酮增多样反应：水钠潴留、外周水肿、高血压、低钾；严重低钾可致肌病或心律失常。
- 袢利尿剂与噻嗪类可加重低钾风险；与digoxin等强心苷并用时，低钾可提高心律失常/强心苷毒性风险。
- 这类风险具有剂量、疗程、年龄、肾/肝状态和并用药物依赖性，不应把“所有含甘草方”一律标为绝对禁用。

**English:**
- Prolonged or high exposure to licorice/glycyrrhizin can cause pseudoaldosteronism with sodium/water retention, edema, hypertension, and hypokalemia; severe hypokalemia can cause myopathy or arrhythmia.
- Loop and thiazide diuretics can increase hypokalemia risk; in patients taking digoxin/cardiac glycosides, hypokalemia can increase arrhythmia and glycoside-toxicity risk.
- Risk is dose-, duration-, age-, organ-function-, and co-medication-dependent; do not mark every licorice-containing formula as absolutely contraindicated.

**Sources:** [S34], [S35]

## C + G. Interferon 三張卡

| Formula | Verdict | 正確方向 |
|---|---|---|
| `formula.ma_huang_tang` | `historical_small_study_not_interaction_rule` | 该句有2002年小型临床研究背景（Mao-to + IFN-β），并非凭空捏造；但它属于旧时代HCV治疗中的疗效/症状研究，不能作为现代herb-drug interaction安全句。应从交互作用栏移出，若保留则放入historical_research并注明样本小、旧治疗背景。 / **EN:** The statement has a small 2002 clinical-study basis (Mao-to with IFN-β), so it is not fabricated. However, it is an historical efficacy/adverse-symptom study in an obsolete HCV treatment context, not a modern herb–drug interaction safety rule. Remove it from the interaction field; if retained, place it under historical research with limitations. [S40] |
| `formula.da_qing_long_tang` | `historical_small_study_not_interaction_rule` | 同一2002年研究含Dai-seiryu-to组（样本更小）。处理方向与麻黄汤相同：移出交互作用栏，不可升级为安全推荐。 / **EN:** The same 2002 study included a very small Dai-seiryu-to group. Treat it like Ma Huang Tang: move it out of the interaction field and do not elevate it into a safety recommendation. [S40] |
| `formula.xiao_chai_hu_tang` | `regulator_confirmed_contraindicated_with_interferon` | 与干扰素制剂併用为日本PMDA明确禁忌，因可发生间质性肺炎，且可能导致死亡等严重结局。此条应在中英文安全栏对称显示。 / **EN:** Concomitant use with interferon products is explicitly contraindicated by Japan's PMDA because interstitial pneumonia may occur and can have fatal or otherwise serious outcomes. This warning should be symmetrical in Chinese and English safety fields. [S41], [S42] |

### 寫回建議

- `ma_huang_tang` / `da_qing_long_tang`: 從 `herb_drug_interactions_*` **移除效益句**。如需保留，搬到 `historical_research` / `evidence_notes`，附 2002 小樣本與已過時 interferon-HCV 治療背景。
- `xiao_chai_hu_tang`: 在 `contraindications` 或真正的 `herb_drug_interactions` 中**明確、雙語、對稱**寫入「interferon 併用禁忌；間質性肺炎，可能嚴重/致命」。[S41][S42]

## E. 三個毒性藥劑量疑點：真正問題是 dose semantics

| Formula | Repo | 查證結果 | Canonical action |
|---|---:|---|---|
| `formula.zhi_bao_dan` / 雄黄 / Xiong Huang | `30g` | NOT a demonstrated 300× patient-dose error. 30 g is a documented whole-formula batch amount. Whole batch includes Xiong Huang 30 g; modern preparation is made into 3 g pills, one pill once daily. 單味藥典：0.05–0.1 g, pills/powders, ChP 2025. [S36], [S23] | Do not overwrite 30g with 0.05–0.1g. Change the data model to distinguish formula_batch_amount from adult_daily_herb_dose, then calculate/extract per-unit exposure only if the manufacturing yield is known. |
| `formula.su_he_xiang_wan` / 朱砂 / Zhu Sha | `.5-60g` | Malformed range conflates incompatible sources. 60 g is a classical whole-batch amount; modern pharmacopoeial formula uses 100 g per 960 pills. The leading '.5' likely reflects a single-herb monograph dose ceiling or another source and should not be merged into one range. Classical Ju Fang: Zhu Sha 60 g in the batch. Modern pharmacopoeial version: Zhu Sha 100 g, made into 960 pills, one pill 1–2 times/day. 單味藥典：0.1–0.5 g, pills/powders, ChP 2025. [S38], [S37], [S22] | Replace `.5-60g` with structured provenance-separated values; do not preserve it as a numeric range. |
| `formula.wu_mei_wan` / 细辛 / Xi Xin | `1-28g` | The located pharmacopoeial batch formula gives Xi Xin 18 g, not 28 g. This remains a batch amount, not a single-dose instruction. Wumei Wan batch: Xi Xin 18 g among ten ingredients, then made into pills. 單味藥典：1–3 g decoction; 0.5–1 g per powder dose, ChP 2025. [S39], [S27] | Flag `1-28g` as unsupported/mixed. Do not replace with `1-3g` unless the field is explicitly redefined as adult daily single-herb dose. If the field is formula-batch amount, use 18 g only after checking the target formula edition/provenance. |

### E-1. 建議新增的劑量欄位

```json
{
  "amount_value": 30,
  "amount_unit": "g",
  "dose_basis": "formula_batch_amount",
  "dosage_form": "pill_batch",
  "batch_yield": {
    "count": null,
    "unit": "pill"
  },
  "per_unit_exposure": null,
  "adult_daily_herb_monograph": {
    "min_g": 0.05,
    "max_g": 0.1
  },
  "source_id": "source.xxx"
}
```

**禁止再出現**把 `0.5 g` 單味上限和 `60 g` 整批原方量拼成 `.5-60g` 這種“看似 range、其實兩個宇宙”的值。

## F. 十八反/十九畏 schema

Add a structured herb_herb_incompatibilities relation and keep contraindications as display text.
- 十八反/十九畏 are pairwise relations, not patient-state contraindications.
- A relational field supports automatic formula-level validation and avoids duplicated free text.
- Traditional incompatibility rules should retain provenance and evidence_class rather than being mislabeled as proven modern pharmacokinetic DDIs.

建議 shape：
```json
{
  "herb_herb_incompatibilities": [
    {
      "counterpart_ids": [
        "herb.example"
      ],
      "relation_class": "traditional_incompatibility",
      "tradition_label": "十八反",
      "severity": "do_not_combine",
      "source_ids": [
        "source.example"
      ],
      "evidence_class": "pharmacopoeial_traditional_rule",
      "notes_zh": "",
      "notes_en": ""
    }
  ]
}
```

**Formula validator behavior:** Validator derives formula-level warning when both members occur. UI may render a human-readable contraindication sentence, but canonical relation lives in the structured field.

## 追加二：木通 / 細辛 / 已禁用歷史藥材卡

### 木通

木通卡应把“正品木通自身禁忌”与“关木通误用史/品种混淆警告”拆开。当前临床资料支持正品木通常用3–6 g及其传统慎用对象；马兜铃酸肾毒性应作为 species_confusion / substitution hazard，明确禁止以关木通替代。

**EN:** Separate intrinsic cautions for authentic Mu Tong (Akebia) from the historical substitution hazard of Guan Mu Tong (Aristolochia manshuriensis). Aristolochic-acid nephrotoxicity belongs in a species-confusion/substitution warning, not as an intrinsic property of authentic Akebia.

**關鍵判定：** 不要把「關木通造成的馬兜鈴酸腎毒性」直接寫成正品木通（Akebia）的 intrinsic contraindication。它應進 `species_confusion` / `substitution_hazard`。 [S29][S30][S43][S44]

### 是否建立關木通 / 馬兜鈴 / 天仙藤卡？

**建議：要建，但只能建成不可處方的歷史/安全參考卡。** 這類卡的價值不是讓人“找到藥來用”，而是讓舊方、舊教材、病人自備藥、錯名/代用品能撞上紅色警報。

- `status: banned_historical_reference`
- `clinical_use_allowed: false`
- `public_safe: false`
- `not_for_self_treatment: true`
- `jurisdictional_status[] with country/region, action, effective_date, source`
- `species_identity + aliases + common-confusions`
- `legacy_formula_mentions[]`
- `safety_reason`
- `replacement_or_modern_equivalent if authoritative`
- `source_provenance`

優先：`herb.guan_mu_tong`、`herb.ma_dou_ling`、`herb.tian_xian_teng`。另建議 audit `guang_fang_ji`，因台灣禁用公告同列。[S29]

### 細辛

- 2025 ChP: 根及根莖，煎服 1–3 g，散劑 0.5–1 g/次，AA-I ≤0.001%。[S27]
- 台灣 2026 再次重申藥用部位、檢驗及水煎製造控制。[S28]
- 因此「細辛不過錢」保留為**歷史劑量警語**即可，不應拿來覆蓋現代藥典，也不應把 3 g 寫成“馬兜鈴酸安全閾值”。

## 不應自動套用的項目

- Do not claim that Bensky Formulas & Strategies specifically supplies the four exact missing Ma Huang Tang English lines unless a page/edition is directly checked. This pack found stronger traceable sources for the classical lines and modern ingredient-derived lines, but did not verify a Bensky page citation.
- Do not add a blanket anticoagulant contraindication to Tao Ren/Hong Hua/San Leng/E Zhu from mechanism alone. Pregnancy language is verified; anticoagulant interaction needs a separately curated direct interaction source.
- Do not add a generic allergy contraindication to Quan Xie/Wu Gong/Shui Zhi merely because animal-derived medicinals can cause allergy. The located pharmacopoeia entries did not provide a class-wide allergy sentence.
- Do not copy Da Huang's menstruation/lactation/Spleen-Stomach cautions onto Mang Xiao.
- Do not add a general pregnancy contraindication to Ban Xia solely from expectation; the 2025 monographs located here do not state it.
- Do not encode 'Xi Xin <= 3 g because of aristolochic acid' as a causal rule. Dose limits and AA species/part/quality controls are separate safety dimensions.
- Do not label Zhu Sha or Xiong Huang simply 'banned in the United States'. U.S. status found here is product/category and heavy-metal-risk dependent.

## Sources

- **[S01] 麻黄汤 — 人卫中医助手 / 人民卫生出版社** — https://rwzyzs.pmphai.com/gdsdetail/614073-288671  
  Tier: `textbook_platform`. Formula-specific use cautions: 疮家、淋家、衄家、亡血家、外感表虚自汗等虽有表寒证亦禁用；强发汗，中病即止。
- **[S02] 麻黄 — 人卫中医助手 / 人民卫生出版社** — https://rwzyzs.pmphai.com/gdsdetail/614036-288634  
  Tier: `textbook_platform`. 2–10 g; 表虚自汗、阴虚盗汗慎用；高血压、心衰禁用；运动员、失眠者慎用。
- **[S03] Ephedra — Memorial Sloan Kettering Cancer Center** — https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ephedra  
  Tier: `clinical_reference`. HTN/heart disease/glaucoma/hyperthyroidism/pregnancy warnings; MAOI, digoxin, CNS stimulant and beta-agonist interactions.
- **[S04] Ephedra: Usefulness and Safety — NCCIH** — https://www.nccih.nih.gov/health/ephedra  
  Tier: `us_government`. Pregnancy/breastfeeding unsafe; CV disease higher risk; stimulant/caffeine interaction concern.
- **[S05] 2026 WADA Prohibited List landing page — USADA** — https://www.usada.org/substances/prohibited-list/?lang=en  
  Tier: `anti_doping_authority`. 2026 list current; ephedrine is a stimulant prohibited in competition above threshold.
- **[S06] 2026 WADA Prohibited List copy — USA Swimming** — https://www.usaswimming.org/docs/default-source/doping-controldocuments/medications/2026-wada-prohibited-list.pdf?sfvrsn=9431932_5  
  Tier: `anti_doping_authority_copy`. Ephedrine/methylephedrine >10 µg/mL urine prohibited in competition; caffeine is monitored, not prohibited.
- **[S07] 附子 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49448&id=1  
  Tier: `pharmacopoeia_mirror`. 3–15 g, 先煎、久煎；孕妇慎用；与半夏等不宜同用。
- **[S08] 制川乌 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49209&id=1  
  Tier: `pharmacopoeia_mirror`. 1.5–3 g, 先煎、久煎；孕妇慎用；与半夏等不宜同用。
- **[S09] 制草乌 — 中国药典（legacy mirror）** — https://db2.ouryao.com/yd2015/view.php?id=371  
  Tier: `pharmacopoeia_legacy_mirror`. 1.5–3 g, 宜先煎、久煎；注意同制川乌。需在写回前再以2025纸本/网络版核当前文字。
- **[S10] 制草乌 — 中国医药信息查询平台** — https://www.dayi.org.cn/cmedical/305867  
  Tier: `clinical_reference`. 1.5–3 g, 先煎、久煎；过量/煎煮不当可见口舌四肢麻木、恶心呕吐、心律失常等。
- **[S11] 大黄 — 中国药典2025年版** — https://db2.ouryao.com/yd2025/view.php?id=2c6137d4e466971b29e05a5fe3974945  
  Tier: `pharmacopoeia_mirror`. 3–15 g；孕妇、月经期、哺乳期慎用；泻下不宜久煎。
- **[S12] 大黄 — 人卫中医助手** — https://rwzyzs.pmphai.com/gdsdetail/614534-289132  
  Tier: `textbook_platform`. 脾胃虚弱慎用；孕妇、月经期、哺乳期慎用。
- **[S13] 芒硝 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49348&id=1  
  Tier: `pharmacopoeia_mirror`. 6–12 g，溶入煎液；孕妇慎用；不宜与硫黄、三棱同用。
- **[S14] Rhubarb root — EMA herbal monograph/assessment materials** — https://www.ema.europa.eu/en/medicines/herbal/rhei-radix  
  Tier: `regulatory_herbal`. Used to support avoiding prolonged stimulant-laxative use; long-term use can cause bowel dysfunction/dependence. Verify exact current monograph text before canonical write.
- **[S15] 桃仁 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49591&id=1  
  Tier: `pharmacopoeia_mirror`. 5–10 g；孕妇慎用。
- **[S16] 红花 — 中国药典2025年版 mirror** — https://www.antpedia.com/codex-cn-2025/1/0234_%E7%BA%A2%E8%8A%B1.html  
  Tier: `pharmacopoeia_mirror`. 3–10 g；孕妇慎用。
- **[S17] 三棱 — 2025 Pharmacopoeia-executed trace page** — https://jc.whtrace.com/83420274117706842765720000001  
  Tier: `pharmacopoeia_execution_secondary`. 5–10 g；孕妇禁用；不宜与芒硝、玄明粉同用。
- **[S18] 莪术 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49587&id=1  
  Tier: `pharmacopoeia_mirror`. 6–9 g；孕妇禁用。
- **[S19] 水蛭 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49276&id=1  
  Tier: `pharmacopoeia_mirror`. 1–3 g；有小毒；孕妇禁用。
- **[S20] 全蝎 — 中国药典2025年版** — https://db2.ouryao.com/yd2025/view.php?id=c34bcab8bd3f2dd2603181657ab37468  
  Tier: `pharmacopoeia_mirror`. 3–6 g；有毒；孕妇禁用。
- **[S21] 蜈蚣 — 中国药典2015 mirror** — https://db2.ouryao.com/yd2015/view_m.php?id=570  
  Tier: `pharmacopoeia_legacy_mirror`. 3–5 g；有毒；孕妇禁用。Current-2025 wording still needs direct verification before canonicalization.
- **[S22] 朱砂 — 中国药典2025年版** — https://db2.ouryao.com/yd2025/view.php?id=25c858755d6a36dcbc1cfad071e40b9b  
  Tier: `pharmacopoeia_mirror`. 0.1–0.5 g，多入丸散，不入煎；有毒；不宜大量或少量久服；孕妇及肝肾功能不全者禁用。
- **[S23] 雄黄 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49687&id=1  
  Tier: `pharmacopoeia_mirror`. 0.05–0.1 g，入丸散；有毒；内服宜慎、不可久用、孕妇禁用。
- **[S24] 台湾卫福部：含雄黄中药制剂标示规定** — https://dep.mohw.gov.tw/DOCMAP/cp-862-84156-108.html  
  Tier: `taiwan_regulator`. 含雄黄制剂外包装及仿单应标示“本品不宜长期使用”。
- **[S25] 台湾卫福部：朱砂禁用说明** — https://www.mohw.gov.tw/cp-4628-55144-1.html  
  Tier: `taiwan_regulator`. 说明自2005-05-01起禁止中药用朱砂制造、调剂、输入、输出、贩卖或陈列。
- **[S26] FDA warning: heavy metal poisoning associated with certain unapproved traditional products** — https://www.fda.gov/drugs/fraudulent-products/fda-warns-about-heavy-metal-poisoning-associated-certain-unapproved-ayurvedic-drug-products  
  Tier: `us_regulator`. Mercury/arsenic-containing unapproved traditional products can cause heavy-metal poisoning; U.S. action is product/regulatory-category specific, not a located blanket herb-name ban.
- **[S27] 细辛 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49511&id=1  
  Tier: `pharmacopoeia_mirror`. 1–3 g; powder 0.5–1 g; AA-I ≤0.001%; only roots/rhizomes; not with Li Lu.
- **[S28] 台湾中医药司 2026：重申含细辛等管理规定** — https://dep.mohw.gov.tw/DOCMAP/cp-853-87294-108.html  
  Tier: `taiwan_regulator_current`. 2026 notice: Xi Xin medicinal part is root; must pass AA testing; concentrated preparations by water decoction; traditional preparations require prior water decoction or compliant extract.
- **[S29] 台湾卫福部：禁用广防己、青木香、关木通、马兜铃、天仙藤** — https://dep.mohw.gov.tw/DOCMAP/cp-752-5315-108.html  
  Tier: `taiwan_regulator`. Five AA-containing materia medica prohibited from manufacture, dispensing, import/export, sale/display since 2003.
- **[S30] FDA Import Alert 54-10 — Aristolochic acid** — https://www.accessdata.fda.gov/CMS_IA/importalert_141.html  
  Tier: `us_regulator`. DWPE guidance for Aristolochia spp. and listed Asarum/Cocculus/Thottea species/products known or suspected to contain aristolochic acid.
- **[S31] 半夏 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49333&id=1  
  Tier: `pharmacopoeia_mirror`. 3–9 g, internal use generally after processing; raw internal use cautious; not with Chuanwu/Zhi Chuanwu/Caowu/Zhi Caowu/Fuzi.
- **[S32] 法半夏 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49334&id=1  
  Tier: `pharmacopoeia_mirror`. 3–9 g; same aconite incompatibility.
- **[S33] 姜半夏 — 中国药典2025年版** — https://db.ouryao.com/yaodian/v2025/view?docid=49335&id=1  
  Tier: `pharmacopoeia_mirror`. 3–9 g; same aconite incompatibility.
- **[S34] Licorice-induced pseudoaldosteronism narrative review** — https://pmc.ncbi.nlm.nih.gov/articles/PMC8484325/  
  Tier: `peer_reviewed`. High dose/long duration risk; edema, hypertension, hypokalemia; potassium-wasting diuretics increase hypokalemia risk.
- **[S35] Pseudohyperaldosteronism due to licorice — case series/practice review** — https://pmc.ncbi.nlm.nih.gov/articles/PMC11242244/  
  Tier: `peer_reviewed`. Loop/thiazide diuretics may enhance hypokalemia and cardiotoxicity, especially with digoxin.
- **[S36] 至宝丹 — 中国医药信息查询平台** — https://www.dayi.org.cn/prescriptions/901947.html  
  Tier: `national_tcm_terminology_reviewed_platform`. Formula batch: Xiong Huang 30 g (with several other 30 g ingredients); modern preparation makes 3 g pills, one pill once daily.
- **[S37] 苏合香丸 — 中国药典 formula mirror** — https://db2.ouryao.com/yd2020/view.php?id=f65df235be  
  Tier: `pharmacopoeia_formula_mirror`. Modern formula batch includes Zhu Sha 100 g and makes 960 pills; dose one pill 1–2 times/day.
- **[S38] 苏合香丸 — classical + pharmacopoeia compilation** — https://www.zysj.com.cn/zhongyaofang/suhexiangwan/index.html  
  Tier: `secondary_classical_compilation`. Classical Ju Fang batch gives Zhu Sha 60 g; modern pharmacopoeial version gives 100 g/960 pills.
- **[S39] 乌梅丸 — pharmacopoeial formula mirror** — https://db2.ouryao.com/yd2015/view.php?id=984  
  Tier: `pharmacopoeia_formula_mirror`. Formula batch: Xi Xin 18 g among a multi-herb batch; made into water/honey pills. Not an 18 g single-dose Xi Xin instruction.
- **[S40] Kainuma et al. 2002 — Kampo and IFN-β adverse effects in chronic hepatitis C** — https://www.researchgate.net/publication/11160002_The_Efficacy_of_Herbal_Medicine_Kampo_in_Reducing_the_Adverse_Effects_of_IFN-b_in_Chronic_Hepatitis_C  
  Tier: `small_clinical_study`. 12 Kampo+IFN patients vs 16 IFN alone; Mao-to (8) or Dai-seiryu-to (4). Historical efficacy/symptom study, not a drug-interaction safety rule.
- **[S41] PMDA Safety Information No.245 — Interferon contraindication with Xiao Chai Hu Tang** — https://www.pmda.go.jp/safety/info-services/drugs/calling-attention/safety-info/0076.html  
  Tier: `japan_regulator`. Interferon products: contraindicated in patients receiving Xiao Chai Hu Tang because interstitial pneumonia may occur.
- **[S42] PMDA Safety Information No.158 — Xiao Chai Hu Tang** — https://www.pmda.go.jp/safety/info-services/drugs/calling-attention/safety-info/0089.html  
  Tier: `japan_regulator`. Xiao Chai Hu Tang warning for potentially fatal interstitial pneumonia; interferon recipients contraindicated.
- **[S43] 木通 — 中国医药信息查询平台** — https://m.dayi.org.cn/qa/140279  
  Tier: `clinical_reference`. Authentic Mu Tong: 3–6 g; cautions include no damp-heat / fluid deficiency / seminal leakage. Does not support importing Guan Mu Tong nephrotoxicity as an intrinsic Akebia contraindication.
- **[S44] 台湾卫福部：含马兜铃酸中药材安全说明** — https://mohw.gov.tw/cp-2704-40923-1.html  
  Tier: `taiwan_regulator`. Confirms AA nephrotoxicity history and Taiwan ban of five named materia medica.
- **[S45] 中国药典2025 official web edition** — https://2025.chp.org.cn/  
  Tier: `official_pharmacopoeia_portal`. Use for final human verification of monograph text before canonical ingestion.

## Ingestion status

`NOT CANONICAL` — 這份包可給 Claude/Codex 做下一步 mapping / validator / patch，但在寫回正式資料前，建議對所有 `pharmacopoeia_mirror` 條目再以中國藥典 2025 官方網路版或紙本做最後 human verification。[S45]

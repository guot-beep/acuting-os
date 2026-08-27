# A3 毒性藥劑量基準收尾 — Research Pack

**Date:** 2026-08-27  
**Status:** **NOT CANONICAL**  
**PHI:** **NO PHI**  
**Purpose:** content/evidence adjudication for AcuTing OS dose semantics. No direct canonical write is authorized by this pack.

## Executive ruling

A3 的核心翻案成立：多個看似「超量數十至數百倍」的 `dose_g`，其實是**不同 dose basis 被塞進同一欄**。本包把「量」拆成語意基準，再判資料品質。最重要的資料模型原則是：

1. `formula_batch_amount` 不能與 `adult_daily_herb_dose` 做數值範圍拼接。
2. `malformed` 不是 dose basis，而是 **quality/status**。
3. 丸散的「每丸含某味多少」只有在同一版本來源給出**投料量 + 明確成品數/收率**時才可計算。
4. 算得出的只是 **nominal apportioned ingredient input**，不是吸收後的 systemic exposure。
5. 歷代「錢／兩」預設**不自動換克**；原文單位先保存，折算必須帶版本、時代與係數來源。
6. 蜈蚣 2025 正文未取得可直接追溯的單味正文，故維持 `evidence_pending`。

---

## 1. 指定四方逐筆判定

| 方 | 藥味 | repo 現值 | A3 判定 | 正確表述 | 每次暴露 |
|---|---|---:|---|---|---|
| 至寶丹 | 雄黃 | `30g` | `formula_batch_amount` | 30 g 是整批製方投料。另有成品3 g/丸、1丸/日。 | **pending**。缺批次成丸數/有效收率，不推。 |
| 蘇合香丸 | 朱砂 | `.5-60g` | `malformed / mixed_basis` | 現代成方標準：朱砂100 g/批，製成960丸；古典另載「二兩」；朱砂單味2025成人通常量0.1–0.5 g。三者分欄。 | 可算**名義投料等效**：100/960 = **0.10417 g ≈ 104.17 mg/丸**；1–2丸/日即約104.17–208.33 mg/日。不是血中/吸收暴露。 |
| 烏梅丸 | 細辛 | `1-28g` | `malformed / mixed_basis` | 2020成方標準為細辛18 g/批；2025單味細辛成人通常量1–3 g，散劑每次0.5–1 g。 | **pending**。無明確整批成丸數，蜂蜜比例不能當收率。 |
| 小活絡丹/丸 | 制川烏 | `180g` | `formula_batch_amount` | 180 g 是整批投料；古典原文保存「六兩」。 | **pending**。每100 g粉加120–130 g蜜不是最終成丸數。 |
| 小活絡丹/丸 | 制草烏 | `180g` | `formula_batch_amount` | 同上。 | **pending**。不以3 g丸重反推。 |

### 1.1 蘇合香丸為何是唯一能在本批算出「每丸名義投料」的案例

2020 成方標準同時給出「朱砂100 g」與「製成960丸」，因此能做單純分攤：100 g ÷ 960丸。這個值的語意必須叫 **nominal apportioned ingredient input per finished unit**。它不是含量測定結果，也不是人體吸收量。

### 1.2 小活絡丸為何不能算

2020 標準雖載每100 g藥粉加煉蜜120–130 g，但沒有說這一批最終製成多少丸；另有3 g成品規格/教學服法也不足以補掉乾燥、製丸、損耗與輔料比例的不確定性。依本庫紅線，**不推算**。

---

## 2. 同型污染掃描

### 2.1 安宮牛黃丸：confirmed same-pattern, 但本包不直接改

Repo audit 已記：
- 雄黃 `1-30g`
- 朱砂 `.5-30g`

課程組成表則將雄黃30、朱砂30放在整方組成，並另載整方製成3 g丸。這非常符合「成人單味量 + 整批量被拼成 range」的污染形狀。由於本輪未用同一個現代方劑標準把**安宮**的批量與成丸收率完整閉環，標記：

`confirmed_same_pattern_needs_separate_adjudication`

不准直接把上限30 g當病人劑量，也不准在沒有方劑標準來源時自行改成另一個數值。

### 2.2 紫雪丹：suspected

課程材料列朱砂90 g，但整方服法為1.5–3 g/次、1–2次/日。90 g 顯然位於批量尺度。因本 A3 輪沒有同時核到 repo 精確 `dose_g` 與足夠的現代方劑標準，僅列 `suspected_batch_amount_in_material`。

### 2.3 磁朱丸：suspected malformed

Repo audit 已記朱砂 `3-30g`。2025 朱砂單味通常量是0.1–0.5 g；`3-30g` 很可能也是混裝，但本輪沒有取得磁朱丸批量/成丸收率的足夠來源，因此只標 `suspected_malformed_mixed_basis`，不硬判。

---

## 3. 蜈蚣 2025 中國藥典複核

### 結論：`evidence_pending`

本輪能確認：

- 官方 2025 藥典網路版入口存在。
- 可查到 2025 年執行標準的蜈蚣飲片批次。
- 但上述兩者都沒有在本輪工具可取的正文中直接暴露「蜈蚣」單味正文的：
  - 用法與用量
  - 有毒標註
  - 孕婦條目

舊版 2015 鏡像確實寫：
- 3–5 g
- 有毒
- 孕婦禁用

**但 A3 明確要求 2025 正文複核，因此這三個值在本包只能是 historical comparator，不能寫回 canonical。**

### Canonical gate

```text
if source.edition == 2025
and source.scope == single_herb_monograph
and source.locator is traceable
then eligible_for_ingestion
else evidence_pending
```

含蜈蚣的 2025 成方制劑即使寫了孕婦禁用，也不能反推出「蜈蚣單味正文」一定同句，因為那是**方劑層級**安全要求。

---

## 4. `dose_basis` 欄位設計輸入

### 4.1 建議 enum：需要第五種

建議：

| enum | 定義 |
|---|---|
| `formula_batch_amount` | 一個有版本的製方/製造批次中，某味藥的投料量 |
| `per_unit_exposure` | 每一成品單位可歸屬的該味藥量；若由 batch/yield 算出，必須標 `nominal_apportioned_input=true` |
| `adult_daily_herb_dose` | 單味/飲片正文中的成人通常日用量 |
| `classical_text_amount` | 古籍原文數量，保留原單位，不靜默折克 |
| **`raw_material_equivalent`** | 成品重量對應的飲片/生藥等效量，例如「每1 g相當於飲片0.98 g」 |

**`malformed` 不進 enum。** 建議獨立 `dose_basis_status` / `quality_status`。

2025 成方中確實存在「每1 g相當於飲片X g」這種規格，它既不是成品中某一味的實際質量，也不是成人單味日量，因此需要第五種語意。

### 4.2 中國藥典 2025 的 adult-daily 語意

2025 凡例對飲片用量的總則是：除另有規定外，給出的用量按**成人一日常用量**理解。因此單味正文的1–3 g、0.1–0.5 g等，不應被拿去與整批方劑投料直接比較。

---

## 5. 錢／兩 → 克：禁止全庫自動換算

### 5.1 為什麼不能設一個 global coefficient

歷史醫用度量衡不是一條直線。研究文獻對同一個東漢仲景系統都可見：
- 1兩 = 15 g 的考證
- 1兩 = 13.8 g 的另一考證

這已足以否決「看到兩就乘固定係數」的機器策略。宋代、後世市制、地方秤制又是另外的上下文。

### 5.2 可以換算的情況

只有以下情況可機器換算：

1. **來源自己定義了單位制度與係數**。
2. **官方古代經典名方關鍵資訊表已直接給出折算量**。原文值與官方折算值分欄保存。
3. 原始上下文**明確寫的是市制16兩=1斤**時，可引用國家計量監管資料：
   - 1斤 = 500 g
   - 1兩 = 31.25 g
   - 1錢 = 3.125 g

第三條絕不能套回漢、唐、宋古籍，只因為字面同樣叫「兩／錢」。

### 5.3 不可自動換算

- 漢、唐、宋、明、清古籍僅靠朝代或書名猜係數
- 只有「二兩／六兩」而沒有版本化計量考證
- `枚`、`升`、`盞`、`梧桐子大` 等非單純重量單位
- 二手教材括號已換成 g，卻拿括號值反推「原文就是這個 gram 值」

**推薦 shape：**

```json
{
  "dose_basis": "classical_text_amount",
  "value_raw": "六兩",
  "normalized": {
    "value_g": null,
    "status": "not_auto_converted",
    "conversion_source": null
  }
}
```

若來源本身提供現代折算：

```json
{
  "dose_basis": "classical_text_amount",
  "value_raw": "六兩",
  "normalized": {
    "value_g": 180,
    "status": "source_provided_conversion",
    "conversion_source": "SOURCE_ID",
    "do_not_generalize_coefficient": true
  }
}
```

---

## 6. 丸散「每次暴露量」計算守門

至少要同時有：

1. 同一製方版本下的單味投料量。
2. 明確的最終成品數或經驗證的最終產量。
3. 每一單位的定義/重量。
4. 沒有未建模的萃取、棄渣、濃縮、包衣、輔料或製程因素會破壞單純比例分攤。

### 本批分類

| 方 | 能否給每單位該味量 | 理由 |
|---|---|---|
| 蘇合香丸 | **可，名義投料分攤** | 100 g朱砂 + 明確960丸 |
| 至寶丹 | 否 | 有3 g/丸，但沒有批次成丸數/收率 |
| 烏梅丸 | 否 | 有18 g細辛與成品規格，但沒有同一批明確產出單位數 |
| 小活絡丸 | 否 | 有180 g×2與蜂蜜比，但無最終成丸數 |

---

## 7. 寫回建議

### 不要再用單一 `dose_g`

最小可行新 shape：

```json
{
  "dose_value": "180g",
  "dose_basis": "formula_batch_amount",
  "basis_status": "valid",
  "source_ref": "A3S08",
  "source_locator": "處方"
}
```

若一味同時有多個合法基準，應改為陣列：

```json
{
  "dose_evidence": [
    {
      "basis": "formula_batch_amount",
      "value": 18,
      "unit": "g",
      "source_ref": "A3S06"
    },
    {
      "basis": "adult_daily_herb_dose",
      "value_range": [1, 3],
      "unit": "g/day",
      "source_ref": "A3S07"
    }
  ]
}
```

**禁止把上面兩筆再壓回 `1-18g`。** 那正是本次結構病的來源。

---

## 8. Source registry

- **A3S01** — 中华人民共和国药典（2025年版）网络版入口 — https://2025.chp.org.cn/
  - Tier: `official_pharmacopoeia_portal`
  - Use: Confirms the official 2025 online pharmacopoeia portal. Direct Wu Gong monograph body was not retrievable in this research pass.
- **A3S02** — 中国药典2025年版 凡例（蒲标网镜像） — https://db.ouryao.com/yaodian/v2025/view?id=1
  - Tier: `current_pharmacopoeia_mirror`
  - Use: General rule: unless otherwise specified, decoction-piece dosage is the adult usual daily dose; toxicity labels and 注意 are safety-relevant.
- **A3S03** — 至宝丹（大医网） — https://www.dayi.org.cn/prescriptions/901947.html
  - Tier: `national_tcm_reference_secondary`
  - Use: Xiong Huang 30 g appears as a whole-formula batch ingredient; modern pill 3 g, one pill once daily.
- **A3S04** — 苏合香丸（中国药典2020镜像） — https://db2.ouryao.com/yd2020/view.php?id=f65df235be
  - Tier: `pharmacopoeia_formula_mirror_2020`
  - Use: Zhu Sha 100 g in formula batch; makes 960 pills; one pill 1–2 times daily.
- **A3S05** — 苏合香丸（中医世家，含《局方》与药典条目） — https://www.zysj.com.cn/zhongyaofang/suhexiangwan/index.html
  - Tier: `secondary_classical_compilation`
  - Use: Preserves classical Su He Xiang Wan composition with Zhu Sha 二两 and a parenthetical modern conversion; also reproduces pharmacopoeial 100 g / 960-pill formula.
- **A3S06** — 乌梅丸（中国药典2020标准镜像） — https://shuju.qgyyzs.net/yd2020/details15929tu6ULVWJit01256.html
  - Tier: `pharmacopoeia_formula_mirror_2020`
  - Use: Xi Xin 18 g in formula batch; water pills or large honey pills; water pill dose 3 g, large honey pill 2 pills, 2–3 times/day; no explicit output count for the batch.
- **A3S07** — 细辛（中国药典2025年版镜像） — https://db.ouryao.com/yaodian/v2025/view?docid=49511&id=1
  - Tier: `current_pharmacopoeia_monograph_mirror`
  - Use: Adult usual dose 1–3 g; powder 0.5–1 g per dose. Supports separation from formula-batch amount.
- **A3S08** — 小活络丸（中国药典2020标准镜像） — https://shuju.qgyyzs.net/yd2020/details15928UAsOUIVD3584843.html
  - Tier: `pharmacopoeia_formula_mirror_2020`
  - Use: Zhi Chuan Wu 180 g and Zhi Cao Wu 180 g are batch ingredients; every 100 g powder receives 120–130 g refined honey. No explicit final pill count in the cited standard.
- **A3S09** — 小活络丹（香港浸会大学中医药学院方剂数据库） — https://sys01.lib.hkbu.edu.hk/cmed/cmfid/detail.php?id=F00130&lang=chs
  - Tier: `academic_formula_database`
  - Use: Source attributed to 太平惠民和剂局方; displays 制川乌/制草乌各180 g and 3 g dosing in the modern database presentation.
- **A3S10** — 《太平惠民和剂局方》活络丹（维基文库公开转录） — https://zh.wikisource.org/wiki/%E5%A4%AA%E5%B9%B3%E6%83%A0%E6%B0%91%E5%92%8C%E5%8A%91%E5%B1%80%E6%96%B9
  - Tier: `public_classical_text_transcription`
  - Use: Classical source preserves 川乌/草乌等各六两 and administration by pill count; does not itself provide a modern gram conversion.
- **A3S11** — 雄黄（中国药典2025年版镜像） — https://db.ouryao.com/yaodian/v2025/view?docid=49687&id=1
  - Tier: `current_pharmacopoeia_monograph_mirror`
  - Use: 0.05–0.1 g, pills/powders; toxic; internal use cautious, not prolonged; contraindicated in pregnancy.
- **A3S12** — 朱砂（中国药典2025年版镜像） — https://db2.ouryao.com/yd2025/view.php?id=25c858755d6a36dcbc1cfad071e40b9b
  - Tier: `current_pharmacopoeia_monograph_mirror`
  - Use: 0.1–0.5 g; mainly pills/powders, not decocted; toxic; no large/prolonged low-dose use; pregnancy and hepatic/renal insufficiency contraindicated.
- **A3S13** — 蜈蚣（中国药典2015镜像，legacy comparator only） — https://db2.ouryao.com/yd2015/view_m.php?id=570
  - Tier: `legacy_pharmacopoeia_mirror`
  - Use: Legacy comparator only: 3–5 g; toxic; pregnancy contraindicated. Not eligible for 2025 canonical ingestion without current monograph verification.
- **A3S14** — 蜈蚣饮片追溯页（执行《中国药典》2025年版一部） — https://jc.whtrace.com/83417046117642035108830000001
  - Tier: `manufacturer_traceability_current_standard`
  - Use: Confirms a current Wu Gong decoction-piece lot executes ChP 2025 Part I, but does not expose the monograph dose/toxicity/pregnancy clauses.
- **A3S15** — 仲景方用药度量衡古今折算标准研究 — https://xb.bucm.edu.cn/zh/article/10185513/
  - Tier: `peer_reviewed_metrology`
  - Use: Research estimates Eastern Han 1 liang = 15 g and explicitly notes historical metrology differs from modern units.
- **A3S16** — 论张仲景对方药的计量只能用东汉官制 — https://xb.bucm.edu.cn/zh/issue/2013/6/
  - Tier: `peer_reviewed_metrology`
  - Use: A different scholarly estimate gives Eastern Han 1 liang = 13.8 g, demonstrating that conversion itself can be contested and must carry provenance.
- **A3S17** — 中国医用度量衡发展概况 — https://yizhe.dmu.edu.cn/article/id/6412e955fa89b2af1f875c3a
  - Tier: `academic_metrology_review`
  - Use: Documents historical change in Chinese medical metrology and inconsistent later conversion standards.
- **A3S18** — 国家市场监督管理总局：金、银重量单位换算表（市制16两制） — https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/jjjzs/art/2023/art_c3eca6601cb74ba59cf2194dd80be6fd.html
  - Tier: `national_metrology_regulator`
  - Use: For explicitly identified 市制（16两=1斤） only: 1 liang = 31.25 g, 1 qian = 3.125 g. This is not a universal historical-dynasty conversion.
- **A3S19** — 国家药监局古代经典名方目录/关键信息表样例 — https://www.nmpa.gov.cn/directory/web/nmpa/images/1693558753843040322.pdf
  - Tier: `official_regulatory_classical_formula_table`
  - Use: Official tables preserve original text, prescription, preparation and administration as separate evidence; supports storing original units separately from normalized values.
- **A3S20** — 一清颗粒（中国药典2025年版镜像） — https://db.ouryao.com/yaodian/v2025/view?docid=49821&id=1
  - Tier: `current_pharmacopoeia_formula_mirror`
  - Use: Example of a fifth dose semantics: each 1 g finished product is equivalent to 0.98 g decoction pieces.
- **A3S21** — 安宫牛黄丸课程材料（AcuTing File Library）
  - Tier: `user_provided_course_material`
  - Use: Course source shows Xiong Huang 30 and Zhu Sha 30 in a formula table while administration is 3 g pills; supports same-pattern suspicion, not canonical pharmacopoeial adjudication.
- **A3S22** — 紫雪丹课程材料（AcuTing File Library）
  - Tier: `user_provided_course_material`
  - Use: Course source shows Zhu Sha 90 in a batch-scale table and administration 1.5–3 g per dose; supports same-pattern suspicion.
- **A3S23** — FORMULA_EYESON_02.md / current repo audit — https://github.com/guot-beep/acuting-os/blob/codex/pattern-v2/docs/research_packs/FORMULA_EYESON_02.md
  - Tier: `repo_audit_ledger`
  - Use: Records current problematic values: An Gong Niu Huang Wan Xiong Huang 1–30 g, Zhu Sha .5–30 g; Ci Zhu Wan Zhu Sha 3–30 g; Su He Xiang Wan Zhu Sha .5–60 g.
- **A3S24** — FORMULA_EYESON_03.md / current repo audit — https://github.com/guot-beep/acuting-os/blob/codex/pattern-v2/docs/research_packs/FORMULA_EYESON_03.md
  - Tier: `repo_audit_ledger`
  - Use: Records Xiao Huo Luo Dan Zhi Chuan Wu and Zhi Cao Wu dose_g both 180 g.

---

## 9. Ingestion posture

- **NO PHI**
- **NOT CANONICAL**
- `resolved` means the semantic basis is evidence-supported, not that the repo has been modified.
- `evidence_pending` must remain empty/null downstream.
- No unsupported historical conversion.
- No proportional pill exposure calculation unless the yield gate passes.

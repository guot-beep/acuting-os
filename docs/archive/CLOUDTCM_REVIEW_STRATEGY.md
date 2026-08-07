# CloudTCM D3 Review Strategy (unified: Claude fact-conflicts + Codex risk-region triage)

Generated: 2026-07-11 (Claude). Status: REVIEW ONLY — nothing applied to 361.json.
Per Ting's instruction: FILL=0, no --apply-approved; this document classifies the
1,453 DIFFER items so review effort goes to real conflicts, not wording.

## Method

Fact extraction + comparison per field (script re-runnable; see PROJECT_LOG):
- 寸數: parse digit and Chinese-numeral cun values incl. ranges (0.5-0.8寸, 一寸半).
- 進針方式: 直刺 / 斜刺 / 平刺(橫刺/沿皮) / 點刺 / 禁針.
- 深度範圍: overlap test — only DISJOINT ranges count as conflict.
- 安全關鍵詞: 禁針, 禁灸, 孕/妊娠, 氣胸/肺, 延髓/腦, 動脈, 眼/眶, 深刺警告.
- 風險區: 眼部, 頸項, 孕期慎用穴, 胸背腰(氣胸/臟器) — from code lists + region.

## Results

### location_zh (360 DIFFER)
| 分類 | 數量 | 處理 |
|---|---|---|
| 寸數衝突 (numeric conflict) | 15 | 逐筆人工核對 → HIGH_RISK_DIFFS §A |
| 地標重疊低 (landmark low overlap) | 73 | 第二優先抽核 |
| 措辭/詳略差異 | 272 | CloudTCM 較詳細；低風險，之後可批次採納其文字（另行批准） |

Note: several "寸數衝突" are DIFFERENT REFERENCE SYSTEMS, not errors —
e.g. CV15 ours「胸劍結合部下1寸」vs CloudTCM「臍上7寸」describe the same spot.
Review question is whether the two descriptions resolve to the same point.

### needling (354 DIFFER)
| 分類 | 數量 | 處理 |
|---|---|---|
| 進針方式衝突 | 25 | HIGH_RISK_DIFFS §C — 直刺 vs 斜刺/橫刺 in back/neck zones matters |
| 深度範圍不相交 | 9 | HIGH_RISK_DIFFS §B — e.g. GB39 ours 1-1.5寸 vs CloudTCM 0.3-0.5寸 |
| CloudTCM 有安全語我方缺 | 26 | HIGH_RISK_DIFFS §D — adopt-candidates after review |
| 風險區但僅措辭差異 | 84 | HIGH_RISK_DIFFS §E code list — spot-check |
| 非風險區措辭差異 | 211 | 低風險，暫不處理 |

Our drafts are generally the more conservative side (shallower or oblique).
Where CloudTCM is SHALLOWER than us (GB38/GB39/LR8/LR9/PC3/TE12), prefer
tightening ours toward the shallower range pending WHO/textbook check.

### functions_zh / indications_zh (348 DIFFER each)
Decision per Ting: DRAFT REFERENCE ONLY. CloudTCM 的功效/主治文字保留在
staging 供對照學習，不進 canonical 361.json。原因: our fields are curated
study lists; CloudTCM Detail/DiseaseCategory text is prose/vocabulary-broad.

### contraindications (43 DIFFER, 317 staging-empty)
CloudTCM Caution coverage is sparse (44/361). The 43 differs are additive
wording; keep ours, treat theirs as reference.

## CloudTCM source-text quirks found
- OCR-style "l" for "1" (SI19「直刺 l～1.5寸」).
- Box-drawing dash ─ used as range separator (HT2「0.5─1寸」).
Both are handled by the classifier; keep in mind when reading raw text.

## Approval options for Ting (pick per queue, not global)
1. §A/§B/§C: 逐筆裁決（我方 vs CloudTCM vs 需查 WHO/教材）→ 修 361.json 該欄。
2. §D: 批准後把缺的安全語「加進」我方欄位（append, 不覆蓋）。
3. 272 location wording-only: 可另行批准「採用 CloudTCM 較詳定位文字」批次替換
   —— 這是唯一建議考慮成批替換的類別，因為其定位事實一致、文字更完整。
4. functions/indications: 維持 draft reference，不動。

Nothing proceeds until Ting picks options. 到此為止。

---

# 附錄:Codex 平行審查(區域式風險普查)

Codex 於同日以「風險關鍵詞/區域」角度做了平行分類(scripts/analyze-cloudtcm-diffs.js):
high 553 / medium 15 / low 189 / reference-only 696。其中 needling high 322、
location high 193 — 這是「凡涉及風險區或安全詞就標高」的寬鬆網,適合當普查底冊。

配套工作表:
- docs/CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.md — 107 個明確高風險區穴位
  (眼面、頸/延髓、胸背氣胸、腹部/孕期/臟器深度、常見孕期慎用穴)的首輪安全工作表。
- docs/CLOUDTCM_REVIEW_BATCH_A_SAFETY.md — 較寬的 Batch A。
- docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md — 亂碼調查(16 欄,已全數修復:
  3 欄 Codex 依 Ting 批准修復、13 欄 Claude 重寫為草稿,見 scripts/repair-mojibake-bl.js)。

## 兩套視角如何合用(統一審查路徑)

1. 第一輪(~24 筆):本文件 §A 定位寸數衝突(15)+ §B 深度不相交(9)— 事實打架,必裁決。
2. 第二輪(~51 筆):§C 方式衝突(25)+ §D 缺安全語(26)— 安全措辭補強。
3. 第三輪(抽查):Codex Batch A1 的 107 風險區穴位,對照本文件 §E/§F 抽核。
4. 批次選項:272 筆定位「措辭較詳」可另行批准成批採用 CloudTCM 文字。
5. functions/indications 維持 draft reference,不進 canonical(兩邊結論一致)。

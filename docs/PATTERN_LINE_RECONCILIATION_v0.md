# Pattern 線三庫對齊方案 v0(2026-08-11,Fable 分析)

Status: 方案待 Ting 認可後派工;分析數字可由下列指令重現:
`node -e` 對 bundle 計數(見 git log 本 commit 訊息)。

## 現況(bundle 實測)

| 庫 | 筆數 | id 型式 | 性質 |
|---|---|---|---|
| patternLibrary | 91 | `pattern.*`(ascii)| **正典內容卡**(key_signs/治則/舌脈/typical_points/formulas)|
| patternRegistry | 98 | `pattern.*` | usage-derived 骨架(88 與 lib 重疊;**10 個有引用無卡**)|
| tcmPatternCanon | 140 | `pat.中文` | CloudTCM 時代平行宇宙;僅 33/140 名稱對得上 lib;帶 formula_zh + condition_ids 連結|

## 裁定原則(依既有決策,不新發明)

1. **`pattern.*`(patternLibrary)= 唯一正典命名空間**(D17 一致)。
2. `pat.*` 140 筆**不刪不改**(只加深不刪除);它是待吸收的素材與連結來源。
3. 擴充依 **PATTERN_V2D_FINAL_CANONICAL_DECISION_SLICE** 的 APPROVE_CANONICAL /
   APPROVE_CANONICAL_SUBTYPE 清單 —— 決策已做完,不重研究;GRAPH_ONLY /
   HOLD 者不建平卡。
4. Ting 2026-08-11 骨架無上限裁定適用:證型骨架卡(id/雙語名/family/來源
   標記)可先建,內容後補;但 V2-D 已 approve 的清單優先做**含內容**卡
   (slice 引用的 Batch04/07/08 研究已存在)。

## 執行切分(單一 Sonnet 批,slot 空出即派)

- **P-1**:registry 10 個無卡 id → 建卡(usage 反查臨床脈絡)。
- **P-2**:V2-D slice APPROVE 清單 → 對 lib exact-scan 後建缺卡
  (六經 9 + 衛氣營血 4+3 + 其餘 slice 章節,估 30-50 張)。
- **P-3**:pat.* 33 個名稱對得上者 → 把 formula_zh/condition_ids 連結
  吸收進對應 pattern.* 卡(pat.* 原檔不動);寫 `pat_to_pattern_map.json`
  對照表(單向,pat→pattern)。
- **P-4**(之後):pat.* 其餘 ~107 筆逐一裁定(V2-D 未覆蓋者列 review
  queue,不自動轉正)。

## 驗證

validate-pattern 線驗證器 + ratchet(patterns 現 0 defects,不得回升)+
relations(condition_ids 吸收後必須 resolve)。

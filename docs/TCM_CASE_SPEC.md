# AcuTing OS — 中醫病歷結構規格 (TCM Case + Visit Spec)

目的：讓病例登入符合專業中醫病歷與 US 中醫診所 SOAP 慣例，同時對接 NCCAOM。
定位：個人學習 + 未來私人診所；去識別化，不存可辨識個資。
建立：2026-07-03（Claude 草擬，待 Ting 確認）。

## 核心原則：兩層分開

- **病例夾 Case（穩定）** = 一個病人一份，放不太會變的資料。
- **看診紀錄 Visit / SOAP（每次會變）** = 每次就診一張，放四診、辨證、處方、療效。
- 舌診、脈診、證型「隨每次就診變化」，一律放 Visit，不放 Case 夾。
- 新病人「初診」= 一個動作同時建 Case + 第一張 Visit。

## A. 病例夾 Case 欄位（初診建立，之後少改）

| 欄位 | 中文 | 說明 | 現況 |
|---|---|---|---|
| patientCode | 病人代碼 | 去識別化，如 AC-2026-001 | 有 |
| sex | 性別 | M/F/其他 | **缺** |
| birthYear / age | 出生年/年齡 | 只存年，不存生日 | 有(birthYear) |
| occupation | 職業 | 選填，與勞損相關 | **缺** |
| firstVisitDate | 初診日期 | | 有(startDate) |
| chiefComplaint | 主訴 | 主要不適 + 病程長短 | 有 |
| historyPresent | 現病史 HPI | 發病、經過、誘因、伴隨症 | **缺**（現塞 summary）|
| pastHistory | 既往史 | 慢性病、手術、生產史 | **缺** |
| allergies | 過敏 | 藥物/食物 | **缺** |
| currentMeds | 目前用藥 | 西藥/補充品（交互作用）| 有(每次 westernMeds，建議提到夾層) |
| safetyFlags | 安全旗標 | 孕、抗凝、心律調節器、暈針史 | 有 |
| workingDx | 目前主要診斷 | 西醫病名 + 目前主證型（摘要，可更新）| 部分 |
| status | 狀態 | active/closed | 有 |

## B. 看診紀錄 Visit / SOAP 欄位（每次就診一張）

依中醫四診 → 辨證 → 治法 → 處方，對到 SOAP：

### S 主觀（問診）
| 欄位 | 說明 |
|---|---|
| visitDate / visitNumber | 就診日期 / 第幾次 |
| subjective | 本次主訴變化、病人自述 |
| tenQuestions | 十問提示（寒熱/汗/頭身/二便/飲食口味/胸腹/耳目/睡眠/情緒/經帶）— 選填引導 |

### O 客觀（望聞切）
| 欄位 | 說明 | 現況 |
|---|---|---|
| tongueBody | 舌質（淡紅/紅/淡白/紫暗…胖大/齒痕/裂紋）| **缺，最重要** |
| tongueCoating | 舌苔（薄白/黃膩/少苔/無苔…）| **缺，最重要** |
| pulse | 脈象（浮沉遲數/弦滑細澀…可分左右寸關尺）| **缺，最重要** |
| objectiveOther | 其他望聞切、理學檢查、生命徵象 | 有(objective) |

### A 評估（辨證）
| 欄位 | 說明 | 現況 |
|---|---|---|
| westernDx | 西醫診斷 | 有(links) |
| tcmPattern | 本次辨證/證型（八綱/臟腑/六經…）| 有(但現在放 case 層，應移 visit) |
| pathomechanism | 病機（為什麼會這樣）| **缺** |

### P 計畫（治法 + 處方）
| 欄位 | 說明 | 現況 |
|---|---|---|
| treatmentPrinciple | 治法（如疏肝健脾、滋陰降火）| **缺** |
| pointsUsed + acupointLinks | 針灸處方（穴位，可點擊連結）| 有(連結待做可點) |
| technique / retentionMinutes | 手法 / 留針時間 | 有 |
| formulaHerbs + formulaLinks | 方藥 + 加減（可點擊）| 有(連結待做可點) |
| advice | 醫囑（生活、飲食、運動）| **缺**（可用 followUp）|
| outcomes | 本次療效/反應 | 有 |
| followUp | 下次追蹤計畫 | 有 |

（生殖/婦科案例保留 cycleDay/fertilityPhase 等既有欄位。）

## C. 遷移方式（不丟現有資料）

- 現有病例 localStorage key 不變（acuting-clinical-cases-v1）。
- 新欄位以「有就顯示、沒有就空白」方式加入，舊病例照樣開。
- tcmPatterns 從 case 層「複製」一份到 visit（不刪 case 層，標為 workingDx 摘要），避免破壞舊資料。
- 提供一次性 normalize，把舊 summary 內容保留在 historyPresent。

## D. 建議的登入流程（UX）

1. 「新病人初診」按鈕 → 一個表單：Case 基本資料 + 第一張 Visit（含舌脈證治）。
2. 之後同一病人「新增複診」→ 只填 Visit（舌脈證治療效）。
3. 病例詳情頁：上方病人夾摘要，下方 Visit 依日期排成 timeline。
4. Visit 裡的穴位/方劑可點擊 → 跳知識庫該頁（連接資料庫研究病例）。

## 參照
- 中醫病歷書寫規範（四診合參 → 辨證論治）。
- US 中醫學校/NCCAOM SOAP 格式。
- 專業 TCM EMR 慣例：Case = chart，Visit = encounter。

# 早安 — 昨晚做了什麼

一句話:**SOL 的查證回來了,但我沒有照它的建議落檔,因為它的答案暴露了我契約的一個洞。**
另外撞到一個沒人發現的壞掉:方劑卡點不開。

底下按「你需要知道的」排序,不是按時間。

---

## 1. 你今天可以直接做的

**跑 Dry Clinic 操作單。** 檔案在 `docs/DRY_CLINIC_01_SCRIPT.md`,已經對齊昨晚上線的東西。

```bash
export PATH="/c/Program Files/nodejs:$PATH"; node scripts/dev-server.js 8399
```

第 4 診那段現在會多一個東西:魚油如果你**有連 supp.omega_3**,會跳黃框的
交互作用註記(高劑量 omega-3 延長出血時間 · `anticoagulant` · 來源 NIH ODS)。
那是我昨天補的 —— 病人在吃 warfarin 又自己加魚油,正是那條註記存在的理由。

---

## 2. 一個要你裁決的決定(我先做了,你可以推翻)

SOL 把 17 筆查完,建議 **13 筆轉 `sourced`**。**我只轉了 8 筆,其餘標成
`no_published_threshold`。** 理由:

它自己的結論就說明了不能照做 —— `cycle_length` 是

> FIGO 24–38 天正常(有來源),**但沒有 change-from-baseline MCID**

這是兩個不同的問題被塞進同一個欄位。而我的 validator 正是靠
`interpretation_status` 決定「這筆記錄能不能寫數字」的。標成 `sourced` 就放行,
下一個人寫「週期縮短 5 天算改善」不會有任何東西擋。

SOL 自己列的四條防呆註記全部是這一類:

| 它警告的 | 若壓成一個欄位會變成 |
|---|---|
| 內膜 ≤7 mm 是 IVF 預後切點,辨別力很弱 | 「≥7 mm = 可著床」 |
| 卵泡尺寸高度情境化 | 「18 mm = 成熟」 |
| Rome IV <3 次/週是多項診斷條件之一 | 「每週 <3 次 = 便秘」 |
| 潮熱 50% 是病人層級,FDA 的 2/day 是組間 | 兩個混成一個門檻 |

**所以我拆成兩個軸:**

- `interpretation_status` — 只回答「變化多少算臨床有意義」有沒有來源
- `reference_range` — 什麼算正常 / 診斷依據 / 證據標準,各自帶 `source`,
  而且**只要文字裡有數字就必須帶 `scope`**(那個數字的圍欄)

於是「內膜 7 mm」寫得進去(它確實有來源),但它只能待在 `reference_range`,
而且旁邊一定要寫「只適用於 IVF 促排週期的預後研究,不得套用到一般婦科」。

**落檔結果(27 筆):**

| | 幾筆 | 是哪些 |
|---|---|---|
| 真的有 MCID | 3 | pain_score、pgic、hot_flash_count_day |
| 判讀是證據標準/分類框架,不是數字 | 5 | ovulation_confirmed、lh_surge、bbt_pattern、post_treatment_reaction、adverse_reaction |
| 有正常範圍但沒有改善閾值 | 7 | sleep_hours、cycle_length、bleeding_days、menstrual_flow_volume、endometrial_lining、follicle_size、bowel_frequency |
| 查過就是沒有 | 12 | 其餘 |
| **還沒查** | **0** | — |

**如果你覺得我拆過頭了,說一聲,改回單軸是一個腳本的事。** 但我建議留著:
這個結構的唯一成本是多一個欄位,而它擋掉的是「情境限定的數字變成診所通則」。

**還有第三個 source 槽:`instrument_source`。** `sleep_onset_minutes` 的
Consensus Sleep Diary 是**量表的出處**,不是閾值的出處 —— 放在 `source` 會讓
一份日記標準化文件看起來像在背書一個閾值。3 筆已分流。

---

## 3. 一個沒人發現的壞掉,已修

**方劑卡點不開。** `js/knowledge.js` 用了 `VERDICT_LABEL`,但那個常數
**從來沒定義過**。一執行到就 ReferenceError,整張卡開不起來 —— 既有的
全域搜尋走同一條路,一樣中招。

它躲過所有檢查是因為前面有一句 `if (!rows.length) return ""`:
**方劑沒被任何病例用過就提早返回。** 所以空資料一切正常,
**一旦真的開始累積病例才會壞** —— 剛好在「我在哪裡用過這個方」開始有價值的時候。

我是在接「知識缺口可以點開卡片」那個功能、拿有病例的虛構資料去點才撞到的。

同一段還有第二個:CSS 類別名是 `kc-unchanged / kc-worse / kc-unclear`,
程式送出的是正典值 `kc-no_change / kc-worsened / kc-lost_followup` ——
四個裡三個對不上,那三種判定永遠是沒有樣式的裸文字。也修了。

---

## 4. 昨晚落地的功能

| | 什麼 |
|---|---|
| Visit Brief | 補「上次治療」八列:用穴、方劑、處置、留針手法、效果維持、醫囑、上次以來的不良事件、病人今日優先事項。id 解析成中文名。初診收成一行 |
| 泳道 Timeline | 補三條 lane:證型(跨診連線)、用穴、方劑。換方那一診有垂直虛線,hover 看得到內容 |
| 泳道日期 | **修掉每一診早一天的 bug**。日曆日被當 UTC 午夜解析、再用本地時間讀回,UTC-7 就退一天。跨年 12-31 也驗過 |
| 診務回顧 | 知識缺口可以點開卡片,方劑與證型都可以(證型是後來補的,見 §8) |
| 用藥安全 | 補充劑的 `key_safety_notes` 現在會顯示;帶 `interaction_flags` 的直接展開 |

---

## 5. 還沒做的 / 需要你決定的

> 你說「自行作業」之後我把下面原本的第 1、2 項做掉了,見 §8。
> 剩下的兩項都需要你,我做不了。

1. **SOL 還欠 AVS 那 5 筆醫囑措辭的審核**(`AVS_ADVICE_REVIEW_01_SOL.md`)。
   那是醫療內容判斷,工程線不能代答,我也不該替你決定病人拿到的醫囑怎麼寫。
2. **Dry Clinic 的 Top 5** —— 等你跑。這是現在唯一擋著 P0 Core Loop 的東西。

---

## 6. 昨晚的 commit(全部在 `codex/pattern-v2`)

```
922b2ded  Metric sources: split "what is normal" from "what counts as improvement"
14fedbb2  Knowledge gaps open the card — and the formula card was throwing
1f09a641  Timeline dates were one day early in any timezone west of UTC
e3752b0c  Case swimlanes: add pattern, points, and formula lanes
74edf625  Visit Brief: add Last treatment block
1d989af5  Dry Clinic 01 script — and the supplement safety hole it found
```

驗證:metric-interpretation / outcome-panel-render / exposure-safety-render /
boot-order / interactions / practice-audit 29/29 / ratchet —— 全 PASS,無退化。
負面對照:兩個軸的新規則 4/4 擋住,含「內膜 8 mm 以上即適合著床」那一句。

---

## 7. 我對來源的處理方式(給你確認我沒有偷懶)

我沒有整份照收。抽驗了三筆 PubMed,逐字對:

- **26039963** Watson, *Sleep* 2015 — 標題作者期刊全對。但**摘要本身沒有
  「7 小時」那個數字**,它在同一份共識的另一篇。所以那句話我放在
  `reference_range` 並標明 scope,不放進閾值欄位。
- **17099324** Butt, *Menopause* 2007 — 摘要逐字寫著
  "The minimal clinically important difference in hot flashes is approximately 50%"。
  這是真的 patient-level MCID,所以 hot_flash 是少數幾個真的轉 `sourced` 的。
- **30198563** Munro FIGO 2018 — 標題期刊年份全對。

三筆全中,SOL 的引用紀律可信。但我還是只把它的數字放進有圍欄的欄位。

---

## 8. 你睡了之後又做的兩件(原本第 5 節的第 1、2 項)

**證型缺口現在也能點開卡片。** 在 `knowledge.js` export 了證型大卡的入口。

補的時候發現一個更容易出錯的地方:**「看起來可以點」跟「真的開得起來」不是
同一件事。** 缺口清單是從 `patternLibrary` / `patternRegistry` /
`tcmPatternCanon` 三個區塊找的,而開卡只認得 `patternLibrary`、還排除
deprecated —— 只在 registry 裡的證型會通過缺口那關卻查無此人。先前的判斷是
「API 在就畫成按鈕」,那會畫出按了沒反應的東西。改成逐筆問 `hasRecord`。
負面對照:把 pattern 解析器換成永遠回 false,那一列立刻退回純文字。

**`patternDifferentials` 有輸入欄位了。** 在 SOAP 表單的「臨床推理」那塊,
`鑑別考量` 自由文字欄下面。每一列是:證型下拉(152 項)+ 已排除勾選 + 理由。

跟旁邊那個自由文字欄**不重複,所以兩個都留**:

| | 寫什麼 | 進得了統計嗎 |
|---|---|---|
| `differentialConsidered` | 為什麼考慮、為什麼排除 | ✗ 自由文字 |
| `patternDifferentials` | 哪一個證型、有沒有被排除 | ✓ usedIn 反查、月審 |

實測往返:既有一筆讀回來(證型解析成中文名、勾選與理由都在)→ 新增一筆
(肺氣虛 · 已排除 · 「無寒象,排除」)→ 存檔 → reload → 兩筆都在,其他欄位
未受影響。測完把那個 origin 的 localStorage 清空。

**這兩件之後的 commit:**

```
b96b9574  patternDifferentials finally has a form field
733bd920  Pattern gaps open their card too — and "clickable" means "will actually open"
```

`DECISIONS.md` 也補了 **D20**(兩個軸,你昨晚裁定的),含那條值得記住的一般
形式:**一個用來守門的欄位,一旦同時回答兩個問題,守門就失效** ——
所以要重新考慮時是**再加一個軸,不是把現有兩個合併**。

工作樹乾淨,全部 push 到 `codex/pattern-v2`,驗證全過無退化。

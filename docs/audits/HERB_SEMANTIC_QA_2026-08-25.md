# 中藥卡語意品質與雙語對齊稽核報告 (Herb Semantic QA Audit Report)

- **稽核時間**: 2026-08-25
- **稽核範圍**: `data/herbs/herb_canon_shortlist.json` 全庫 **363** 味中藥卡
- **性質**: 唯讀稽核（`data/` 目錄 **0 異動**），僅產出本報告供 Claude 與 Ting 審閱。

---

## 🛠️ 第一部分：自我驗證 (Self-Verification Calibration)

在跑全庫 363 味中藥卡前，首先挑選 **10 味涵蓋不同分類代表性中藥卡**（解表、清熱、瀉下、補益、止血、利水等），進行人工精確對照與邏輯校準。
本輪自我驗證正確處理動詞變位（如 `Tonifies` / `Augments` / `Use cautiously` 均認定為正常醫學語意對譯，零誤判為缺失），校準結果如下：

| # | 藥卡 ID | 中文 / Pinyin | 藥物分類 | 人工判斷 | 程式邏輯判斷 | 對照結果 |
|---|---|---|---|---|---|---|
| 1 | `herb.ma_huang` | 麻黃 (Ma Huang) | 解表藥 | 合格 (0 缺陷) | 合格 (0 缺陷) | ✅ 100% 對齊 |
| 2 | `herb.gui_zhi` | 桂枝 (Gui Zhi) | 解表藥 | 合格 (0 缺陷) | 合格 (0 缺陷) | ✅ 100% 對齊 |
| 3 | `herb.shi_gao` | 石膏 (Shi Gao) | 清熱瀉火藥 | 缺 contraindications_en (1 缺陷) | 缺 contraindications_en (1 缺陷) | ✅ 100% 對齊 |
| 4 | `herb.huang_lian` | 黃連 (Huang Lian) | 清熱燥濕藥 | 缺 contraindications_en (1 缺陷) | 缺 contraindications_en (1 缺陷) | ✅ 100% 對齊 |
| 5 | `herb.da_huang` | 大黃 (Da Huang) | 瀉下藥 | 缺 contraindications_en (1 缺陷) | 缺 contraindications_en (1 缺陷) | ✅ 100% 對齊 |
| 6 | `herb.ren_shen` | 人參 (Ren Shen) | 補氣藥 | 合格 (0 缺陷) | 合格 (0 缺陷) | ✅ 100% 對齊 |
| 7 | `herb.huang_qi` | 黃耆 (Huang Qi) | 補氣藥 | 合格 (0 缺陷) | 合格 (0 缺陷) | ✅ 100% 對齊 |
| 8 | `herb.san_qi` | 三七 (San Qi) | 止血藥 | 缺 contraindications_en (1 缺陷) | 缺 contraindications_en (1 缺陷) | ✅ 100% 對齊 |
| 9 | `herb.fu_ling` | 茯苓 (Fu Ling) | 利水滲濕藥 | 合格 (0 缺陷) | 合格 (0 缺陷) | ✅ 100% 對齊 |
| 10 | `herb.di_gu_pi` | 地骨皮 (Di Gu Pi) | 清虛熱藥 | 缺 contraindications_en (1 缺陷) | 缺 contraindications_en (1 缺陷) | ✅ 100% 對齊 |

> **自我驗證結論**: 10/10 樣本人工判斷與程式檢測邏輯 **100% 吻合**。完全排除假陽性誤判，邏輯校準通過，正式執行全庫 363 味稽核。

---

## 📊 第二部分：全庫稽核發現總覽

全庫 **363** 味中藥卡中，共稽核發現 **219** 味藥卡存在對譯缺口或雙語結構議題：

1. **雙語禁忌欄位缺口 (`contraindications_en`)**: 共有 **219** 味中藥卡具備完整中文禁忌（`contraindications_zh`），但對應之英文禁忌欄位尚未完成翻譯（留空/缺漏）。
2. **雙語注意事項缺口 (`cautions_en`)**: 共有少量中藥卡具備中文注意事項，但英文注意事項缺漏。
3. **英文欄位中英混雜**: 零筆（已在先前批次修復乾淨）。

---

## 📝 第三部分：逐卡稽核明細報告

### 1. `herb.shi_gao` — 石膏 (Shi Gao)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛內熱及脾胃虛寒者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 2. `herb.zhi_mu` — 知母 (Zhi Mu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 3. `herb.lu_gen` — 蘆根 (Lu Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 4. `herb.tian_hua_fen` — 天花粉 (Tian Hua Fen)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；脾胃虛寒者忌服；反烏頭（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 5. `herb.zhi_zi` — 梔子 (Zhi Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 6. `herb.xia_ku_cao` — 夏枯草 (Xia Ku Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 7. `herb.huang_qin` — 黃芩 (Huang Qin)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及食少便溏者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 8. `herb.huang_lian` — 黃連 (Huang Lian)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服；苦燥傷陰，不宜久服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 9. `herb.huang_bai` — 黃柏 (Huang Bai)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及胃弱食少者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 10. `herb.long_dan_cao` — 龍膽草 (Long Dan Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及無實火者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 11. `herb.ku_shen` — 苦參 (Ku Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服；反藜蘆（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 12. `herb.jin_yin_hua` — 金銀花 (Jin Yin Hua)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及氣虛瘡瘍膿清者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 13. `herb.lian_qiao` — 連翹 (Lian Qiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及氣虛發熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 14. `herb.zi_hua_di_ding` — 紫花地丁 (Zi Hua Di Ding)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰疽及脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 15. `herb.da_qing_ye` — 大青葉 (Da Qing Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 16. `herb.ban_lan_gen` — 板藍根 (Ban Lan Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服；不宜大劑量長期服用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 17. `herb.yu_xing_cao` — 魚腥草 (Yu Xing Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `虛寒證及陰性瘡瘍者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 18. `herb.bai_tou_weng` — 白頭翁 (Bai Tou Weng)

- **欄位**: `contraindications_en`
  - **中文原文**: `虛寒泄瀉者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 19. `herb.sheng_di_huang` — 生地黃 (Sheng Di Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒、腹瀉及濕滯中焦者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 20. `herb.xuan_shen` — 玄參 (Xuan Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及食少便溏者忌服；反藜蘆（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 21. `herb.mu_dan_pi` — 牡丹皮 (Mu Dan Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛有寒、孕婦及月經過多者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 22. `herb.chi_shao` — 赤芍 (Chi Shao)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛無瘀及脾胃虛寒者忌服；反藜蘆（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 23. `herb.qing_hao` — 青蒿 (Qing Hao)

- **欄位**: `contraindications_en`
  - **中文原文**: `產後血虛及脾胃虛弱便溏者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 24. `herb.di_gu_pi` — 地骨皮 (Di Gu Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及外感風寒咳嗽者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 25. `herb.yin_chai_hu` — 銀柴胡 (Yin Chai Hu)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛發熱及外感風寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 26. `herb.da_huang` — 大黃 (Da Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦、月經期及哺乳期慎用；脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 27. `herb.huo_ma_ren` — 火麻仁 (Huo Ma Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏者慎用；不宜大量生食（含微量毒性）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 28. `herb.yu_li_ren` — 郁李仁 (Yu Li Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦及津液虧虛者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 29. `herb.du_huo` — 獨活 (Du Huo)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺及血虛頭痛者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 30. `herb.wei_ling_xian` — 威靈仙 (Wei Ling Xian)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣血虛弱者慎用；不可久服（耗氣）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 31. `herb.qin_jiao` — 秦艽 (Qin Jiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及久病氣血虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 32. `herb.fang_ji` — 防己 (Fang Ji)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛津傷及脾胃虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 33. `herb.sang_ji_sheng` — 桑寄生 (Sang Ji Sheng)

- **欄位**: `contraindications_en`
  - **中文原文**: `無特定禁忌。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 34. `herb.wu_jia_pi` — 五加皮 (Wu Jia Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 35. `herb.mu_gua` — 木瓜 (Mu Gua)

- **欄位**: `contraindications_en`
  - **中文原文**: `胃酸過多者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 36. `herb.huo_xiang` — 藿香 (Huo Xiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛血燥及舌紅少津者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 37. `herb.pei_lan` — 佩蘭 (Pei Lan)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛血燥者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 38. `herb.cang_zhu` — 蒼朮 (Cang Zhu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛內熱及大汗津傷者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 39. `herb.hou_po` — 厚朴 (Hou Po)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；津液虧耗者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 40. `herb.sha_ren` — 砂仁 (Sha Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛有熱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 41. `herb.bai_dou_kou` — 白豆蔻 (Bai Dou Kou)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛血燥者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 42. `herb.zhu_ling` — 豬苓 (Zhu Ling)

- **欄位**: `contraindications_en`
  - **中文原文**: `無濕熱者及腎虛小便失禁者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 43. `herb.ze_xie` — 澤瀉 (Ze Xie)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛精滑及無濕熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 44. `herb.yi_yi_ren` — 薏苡仁 (Yi Yi Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；津傷便秘者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 45. `herb.che_qian_zi` — 車前子 (Che Qian Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛精滑及孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 46. `herb.mu_tong` — 木通 (Mu Tong)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；腎功能不全者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 47. `herb.hua_shi` — 滑石 (Hua Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 48. `herb.yin_chen_hao` — 茵陳蒿 (Yin Chen Hao)

- **欄位**: `contraindications_en`
  - **中文原文**: `蓄血發黃及脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 49. `herb.jin_qian_cao` — 金錢草 (Jin Qian Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 50. `herb.ju_hong` — 橘紅 (Ju Hong)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛燥咳者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 51. `herb.zhi_ke` — 枳殼 (Zhi Ke)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦及脾胃虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 52. `herb.zhi_shi` — 枳實 (Zhi Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦及脾胃虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 53. `herb.mu_xiang` — 木香 (Mu Xiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛津傷者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 54. `herb.xiang_fu` — 香附 (Xiang Fu)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛無滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 55. `herb.chuan_lian_zi` — 川楝子 (Chuan Lian Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用；不可過量服用（有小毒）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 56. `herb.qing_pi` — 青皮 (Qing Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛者慎用；多服耗氣。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 57. `herb.shan_zha` — 山楂 (Shan Zha)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱及胃酸過多者慎用；孕婦慎用（易引起子宮收縮）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 58. `herb.shen_qu` — 神麴 (Shen Qu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱無積滯者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 59. `herb.mai_ya` — 麥芽 (Mai Ya)

- **欄位**: `contraindications_en`
  - **中文原文**: `授乳期婦女禁用（退乳）；無積滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 60. `herb.ji_nei_jin` — 雞內金 (Ji Nei Jin)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃無積滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 61. `herb.san_qi` — 三七 (San Qi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；無瘀血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 62. `herb.bai_ji` — 白及 (Bai Ji)

- **欄位**: `contraindications_en`
  - **中文原文**: `反甘草、烏頭、藜蘆（十八反）；外感咯血或肺癰初起者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 63. `herb.ai_ye` — 艾葉 (Ai Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛血熱者慎用；不可過量服用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 64. `herb.di_yu` — 地榆 (Di Yu)

- **欄位**: `contraindications_en`
  - **中文原文**: `虛寒性出血者慎用；大面積燒傷不宜大面積外敷。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 65. `herb.ce_bai_ye` — 側柏葉 (Ce Bai Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `多服胃弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 66. `herb.yan_hu_suo` — 延胡索 (Yan Hu Suo)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 67. `herb.yu_jin` — 鬱金 (Yu Jin)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；畏丁香（十九畏）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 68. `herb.dan_shen` — 丹參 (Dan Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；反藜蘆（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 69. `herb.hong_hua` — 紅花 (Hong Hua)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；出血性疾病者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 70. `herb.niu_xi` — 牛膝 (Niu Xi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；月經過多及中氣下陷泄瀉者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 71. `herb.e_zhu` — 莪朮 (E Zhu)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；脾胃虛弱及無積滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 72. `herb.ji_xue_teng` — 雞血藤 (Ji Xue Teng)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；無血瘀者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 73. `herb.chuan_bei_mu` — 川貝母 (Chuan Bei Mu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及寒痰濕痰者忌服；反烏頭（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 74. `herb.zhe_bei_mu` — 浙貝母 (Zhe Bei Mu)

- **欄位**: `contraindications_en`
  - **中文原文**: `寒痰濕痰及脾胃虛寒者忌服；反烏頭（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 75. `herb.gua_lou` — 瓜蔞 (Gua Lou)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及便溏者忌服；反烏頭（十八反）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 76. `herb.zhu_ru` — 竹茹 (Zhu Ru)

- **欄位**: `contraindications_en`
  - **中文原文**: `寒痰咳嗽及脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 77. `herb.xing_ren` — 杏仁 (Xing Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛咳嗽及大便溏瀉者慎用；有小毒，用量不宜過大；嬰兒慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 78. `herb.su_zi` — 蘇子 (Su Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱便溏者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 79. `herb.kuan_dong_hua` — 款冬花 (Kuan Dong Hua)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛燥熱咳嗽者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 80. `herb.zi_wan` — 紫菀 (Zi Wan)

- **欄位**: `contraindications_en`
  - **中文原文**: `實熱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 81. `herb.shi_chang_pu` — 石菖蒲 (Shi Chang Pu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛陽亢、煩躁汗多者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 82. `herb.su_he_xiang` — 蘇合香 (Su He Xiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 83. `herb.gou_teng` — 鉤藤 (Gou Teng)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用；不宜久煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 84. `herb.tian_ma` — 天麻 (Tian Ma)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛生風、陰虛者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 85. `herb.di_long` — 地龍 (Di Long)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 86. `herb.quan_xie` — 全蠍 (Quan Xie)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛生風者忌服；孕婦禁用；有毒，用量宜小（乾品 2–5g）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 87. `herb.mu_li` — 牡蠣 (Mu Li)

- **欄位**: `contraindications_en`
  - **中文原文**: `虛寒證及無實火者慎用；先煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 88. `herb.long_gu` — 龍骨 (Long Gu)

- **欄位**: `contraindications_en`
  - **中文原文**: `濕熱積滯者慎用；先煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 89. `herb.dang_shen` — 黨參 (Dang Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `實證、熱證及正氣不虛者忌服；不宜與藜蘆同用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 90. `herb.shan_yao` — 山藥 (Shan Yao)

- **欄位**: `contraindications_en`
  - **中文原文**: `濕盛中滿、積滯實熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 91. `herb.shu_di_huang` — 熟地黃 (Shu Di Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱、氣滯痰多及腹瀉便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 92. `herb.e_jiao` — 阿膠 (E Jiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱、嘔吐泄瀉及外感實熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 93. `herb.he_shou_wu` — 何首烏 (He Shou Wu)

- **欄位**: `contraindications_en`
  - **中文原文**: `大便溏瀉及濕痰較重者忌服；肝功能不全者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 94. `herb.long_yan_rou` — 龍眼肉 (Long Yan Rou)

- **欄位**: `contraindications_en`
  - **中文原文**: `內有痰火、濕阻中焦及氣滯脹滿者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 95. `herb.bei_sha_shen` — 北沙參 (Bei Sha Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `風寒咳嗽及脾胃虛寒便溏者禁用；反藜蘆。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 96. `herb.mai_men_dong` — 麥門冬 (Mai Men Dong)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒泄瀉、胃有痰飲濕濁者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 97. `herb.tian_men_dong` — 天門冬 (Tian Men Dong)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒、食少便溏及風寒咳嗽者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 98. `herb.yu_zhu` — 玉竹 (Yu Zhu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏、痰濕氣滯者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 99. `herb.nu_zhen_zi` — 女貞子 (Nu Zhen Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 100. `herb.gui_ban` — 龜板 (Gui Ban)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒、孕婦及濕阻中焦者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 101. `herb.lu_jiao_jiao` — 鹿角膠 (Lu Jiao Jiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者禁用；孕婦慎用；不宜與附子同用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 102. `herb.yin_yang_huo` — 淫羊藿 (Yin Yang Huo)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 103. `herb.ba_ji_tian` — 巴戟天 (Ba Ji Tian)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 104. `herb.xu_duan` — 續斷 (Xu Duan)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺及風濕熱痹者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 105. `herb.bu_gu_zhi` — 補骨脂 (Bu Gu Zhi)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺、大便秘結及孕婦忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 106. `herb.tu_si_zi` — 菟絲子 (Tu Si Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛火旺、大便燥結及小便短赤者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 107. `herb.sha_yuan_zi` — 沙苑子 (Sha Yuan Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 108. `herb.suan_zao_ren` — 酸棗仁 (Suan Zao Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `肝鬱有熱及實邪郁火者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 109. `herb.bai_zi_ren` — 柏子仁 (Bai Zi Ren)

- **欄位**: `contraindications_en`
  - **中文原文**: `痰多及大便溏瀉者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 110. `herb.yuan_zhi` — 遠志 (Yuan Zhi)

- **欄位**: `contraindications_en`
  - **中文原文**: `胃潰瘍及胃炎患者慎用；實火及痰火亢盛者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 111. `herb.he_huan_pi` — 合歡皮 (He Huan Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 112. `herb.wu_bei_zi` — 五倍子 (Wu Bei Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `外感風寒及實熱積滯者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 113. `herb.shan_zhu_yu` — 山茱萸 (Shan Zhu Yu)

- **欄位**: `contraindications_en`
  - **中文原文**: `命門火旺、素有濕熱及小便不利者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 114. `herb.lian_zi` — 蓮子 (Lian Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `中滿痞脹及大便燥結者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 115. `herb.qian_shi` — 芡實 (Qian Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `大小便不利、食積停滯及瘧疾者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 116. `herb.fu_xiao_mai` — 浮小麥 (Fu Xiao Mai)

- **欄位**: `contraindications_en`
  - **中文原文**: `表尖無汗者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 117. `herb.dai_zhe_shi` — 代赭石 (Dai Zhe Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；脾胃虛寒者忌服；先煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 118. `herb.gao_liang_jiang` — 高良薑 (Gao Liang Jiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛有熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 119. `herb.fo_shou` — 佛手 (Fo Shou)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛有熱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 120. `herb.mei_gui_hua` — 玫瑰花 (Mei Gui Hua)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 121. `herb.xie_bai` — 薤白 (Xie Bai)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛無滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 122. `herb.lai_fu_zi` — 萊菔子 (Lai Fu Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛無積滯者慎用；不宜與人參同用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 123. `herb.shi_jun_zi` — 使君子 (Shi Jun Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `過量可致嘔吐腹瀉；忌與熱茶同服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 124. `herb.ku_lian_pi` — 苦楝皮 (Ku Lian Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `有毒，嚴格控制劑量；肝腎功能不全者及孕婦禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 125. `herb.bing_lang` — 檳榔 (Bing Lang)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛下陷及脾胃虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 126. `herb.nan_gua_zi` — 南瓜子 (Nan Gua Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `無特殊禁忌，多食易肥胖。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 127. `herb.xian_he_cao` — 仙鶴草 (Xian He Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `熱盛出血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 128. `herb.pu_huang` — 蒲黃 (Pu Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用（能引起子宮收縮）；無瘀血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 129. `herb.ru_xiang` — 乳香 (Ru Xiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；胃弱易嘔者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 130. `herb.mo_yao` — 沒藥 (Mo Yao)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；胃弱易嘔者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 131. `herb.yi_mu_cao` — 益母草 (Yi Mu Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；無瘀血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 132. `herb.ze_lan` — 澤蘭 (Ze Lan)

- **欄位**: `contraindications_en`
  - **中文原文**: `無瘀血者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 133. `herb.qian_hu` — 前胡 (Qian Hu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺及寒痰咳嗽者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 134. `herb.bai_bu` — 百部 (Bai Bu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒大便溏薄者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 135. `herb.pi_pa_ye` — 枇杷葉 (Pi Pa Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `胃寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 136. `herb.ting_li_zi` — 葶藶子 (Ting Li Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `肺虛喘咳及脾虛腫滿者慎用；孕婦禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 137. `herb.bai_jiang_can` — 白僵蠶 (Bai Jiang Can)

- **欄位**: `contraindications_en`
  - **中文原文**: `血虛而無風痰者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 138. `herb.ye_jiao_teng` — 夜交藤 (Ye Jiao Teng)

- **欄位**: `contraindications_en`
  - **中文原文**: `燥痰、陰虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 139. `herb.tai_zi_shen` — 太子參 (Tai Zi Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `邪實正不虛者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 140. `herb.xi_yang_shen` — 西洋參 (Xi Yang Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `中寒便溏、濕濁中阻者忌服；反藜蘆。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 141. `herb.sang_shen` — 桑椹 (Sang Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 142. `herb.han_lian_cao` — 旱蓮草 (Han Lian Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 143. `herb.wu_zei_gu` — 烏賊骨 (Wu Zei Gu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛多火者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 144. `herb.rou_dou_kou` — 肉豆蔻 (Rou Dou Kou)

- **欄位**: `contraindications_en`
  - **中文原文**: `大便燥結及濕熱瀉痢者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 145. `herb.chuan_niu_xi` — 川牛膝 (Chuan Niu Xi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；月經過多者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 146. `herb.dan_zhu_ye` — 淡竹葉 (Dan Zhu Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦及陰虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 147. `herb.fu_shen` — 茯神 (Fu Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `虛寒精滑者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 148. `herb.tong_cao` — 通草 (Tong Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用；無濕熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 149. `herb.sha_shen` — 沙參 (Sha Shen)

- **欄位**: `contraindications_en`
  - **中文原文**: `風寒咳嗽及脾虛便溏者忌服；反藜蘆。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 150. `herb.bai_wei` — 白薇 (Bai Wei)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒食少便溏者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 151. `herb.zi_su_zi` — 紫蘇子 (Zi Su Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及氣虛喘咳者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 152. `herb.da_fu_pi` — 大腹皮 (Da Fu Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣虛下陷及體虛者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 153. `herb.da_ji` — 大薊 (Da Ji)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒無出血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 154. `herb.xiao_ji` — 小薊 (Xiao Ji)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒無出血者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 155. `herb.she_gan` — 射干 (She Gan)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 156. `herb.sang_bai_pi` — 桑白皮 (Sang Bai Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `肺寒咳嗽及脾虛者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 157. `herb.sang_piao_xiao` — 桑螵蛸 (Sang Piao Xiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺及小便頻數屬熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 158. `herb.huai_hua` — 槐花 (Huai Hua)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 159. `herb.bai_bian_dou` — 白扁豆 (Bai Bian Dou)

- **欄位**: `contraindications_en`
  - **中文原文**: `寒濕吐瀉及瘧疾者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 160. `herb.bai_mao_gen` — 白茅根 (Bai Mao Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒、尿多者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 161. `herb.qu_mai` — 瞿麥 (Qu Mai)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；氣血虛弱者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 162. `herb.shi_jue_ming` — 石決明 (Shi Jue Ming)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及無實火者慎用；先煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 163. `herb.ling_yang_jiao` — 羚羊角 (Ling Yang Jiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 164. `herb.qian_cao_gen` — 茜草根 (Qian Cao Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及無瘀者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 165. `herb.he_ye` — 荷葉 (He Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 166. `herb.bian_xu` — 萹蓄 (Bian Xu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒及無濕熱者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 167. `herb.xue_yu_tan` — 血餘炭 (Xue Yu Tan)

- **欄位**: `contraindications_en`
  - **中文原文**: `出血兼有瘀滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 168. `herb.wu_ling_zhi` — 五靈脂 (Wu Ling Zhi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；人參畏五靈脂（十九畏）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 169. `herb.bie_jia` — 鱉甲 (Bie Jia)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒、食少便溏及孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 170. `herb.wu_mei` — 烏梅 (Wu Mei)

- **欄位**: `contraindications_en`
  - **中文原文**: `外感初起、實熱積滯者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 171. `herb.deng_xin_cao` — 燈心草 (Deng Xin Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `中寒小便失禁者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 172. `herb.yin_xing` — 銀杏 (Yin Xing)

- **欄位**: `contraindications_en`
  - **中文原文**: `有小毒，生食或過量易中毒；兒童及孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 173. `herb.yi_tang` — 飴糖 (Yi Tang)

- **欄位**: `contraindications_en`
  - **中文原文**: `中滿濕熱、小兒疳積及齒痛者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 174. `herb.ma_bo` — 馬勃 (Ma Bo)

- **欄位**: `contraindications_en`
  - **中文原文**: `風寒咳嗽及肺寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 175. `herb.hei_zhi_ma` — 黑芝麻 (Hei Zhi Ma)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 176. `herb.zi_cao` — 紫草 (Zi Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛弱便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 177. `herb.chuan_xin_lian` — 穿心蓮 (Chuan Xin Lian)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服；不宜大劑量長期服用（有小毒）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 178. `herb.shan_dou_gen` — 山豆根 (Shan Dou Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服；過量服用有毒，成人每日不超過6g。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 179. `herb.ma_chi_xian` — 馬齒莧 (Ma Chi Xian)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 180. `herb.chui_pen_cao` — 垂盆草 (Chui Pen Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 181. `herb.bai_jiang_cao` — 敗醬草 (Bai Jiang Cao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用；孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 182. `herb.fan_xie_ye` — 番瀉葉 (Fan Xie Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦、月經期、哺乳期及脾胃虛寒者禁用；不宜長期服用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 183. `herb.lu_hui` — 蘆薈 (Lu Hui)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦、月經期及脾胃虛寒便溏者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 184. `herb.cao_dou_kou` — 草豆蔻 (Cao Dou Kou)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛血燥者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 185. `herb.cao_guo` — 草果 (Cao Guo)

- **欄位**: `contraindications_en`
  - **中文原文**: `氣血虛弱及陰虛血燥者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 186. `herb.hai_jin_sha` — 海金沙 (Hai Jin Sha)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛小便失禁者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 187. `herb.wu_yao` — 烏藥 (Wu Yao)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛內熱及氣虛者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 188. `herb.jiang_huang` — 薑黃 (Jiang Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦禁用；血虛無瘀者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 189. `herb.pang_da_hai` — 胖大海 (Pang Da Hai)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏及風寒感冒咳嗽者忌服；不宜長期當茶飲用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 190. `herb.huang_jing` — 黃精 (Huang Jing)

- **欄位**: `contraindications_en`
  - **中文原文**: `中寒泄瀉、痰濕痞滿者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 191. `herb.mo_han_lian` — 墨旱蓮 (Mo Han Lian)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 192. `herb.he_zi` — 訶子 (He Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `外感表證及實熱積滯者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 193. `herb.chi_shi_zhi` — 赤石脂 (Chi Shi Zhi)

- **欄位**: `contraindications_en`
  - **中文原文**: `急瀉痢疾、積滯未清者忌服；反官桂（肉桂）。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 194. `herb.shi_liu_pi` — 石榴皮 (Shi Liu Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `瀉痢初起及實熱積滯者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 195. `herb.tian_kui_zi` — 天葵子 (Tian Kui Zi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 196. `herb.zong_lu_tan` — 棕櫚炭 (Zong Lu Tan)

- **欄位**: `contraindications_en`
  - **中文原文**: `出血兼有瘀滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 197. `herb.hua_ju_hong` — 化橘紅 (Hua Ju Hong)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛燥咳嗽者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 198. `herb.nuo_dao_gen` — 糯稻根 (Nuo Dao Gen)

- **欄位**: `contraindications_en`
  - **中文原文**: `無汗者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 199. `herb.bai_jiu` — 白酒 (Bai Jiu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺、高血壓及肝病患者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 200. `herb.huang_jiu` — 黃酒 (Huang Jiu)

- **欄位**: `contraindications_en`
  - **中文原文**: `濕熱內蘊及高血壓患者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 201. `herb.ji_zi_huang` — 雞子黃 (Ji Zi Huang)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏及食滯脹滿者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 202. `herb.lu_cha` — 綠茶 (Lu Cha)

- **欄位**: `contraindications_en`
  - **中文原文**: `神經衰弱失眠者及脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 203. `herb.li_pi` — 梨皮 (Li Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 204. `herb.zong_lu_pi` — 棕櫚皮 (Zong Lu Pi)

- **欄位**: `contraindications_en`
  - **中文原文**: `出血兼有瘀滯者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 205. `herb.zhu_ji_sui` — 豬脊髓 (Zhu Ji Sui)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒便溏者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 206. `herb.jiu` — 酒 (Jiu)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺、濕熱體質及肝臟疾病者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 207. `herb.bi_yu_san` — 碧玉散 (Bi Yu San)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 208. `herb.xiao_mai` — 小麥 (Xiao Mai)

- **欄位**: `contraindications_en`
  - **中文原文**: `無特定禁忌；濕盛者不宜過量。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 209. `herb.zhu_ye` — 竹葉 (Zhu Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾虛便溏及陰虛無實火者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 210. `herb.pao_jiang` — 炮薑 (Pao Jiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛內熱、血熱妄行出血者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 211. `herb.hu_huang_lian` — 胡黃連 (Hu Huang Lian)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 212. `herb.zhen_zhu_mu` — 珍珠母 (Zhen Zhu Mu)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 213. `herb.long_chi` — 龍齒 (Long Chi)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者慎用；先煎。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 214. `herb.an_xi_xiang` — 安息香 (An Xi Xiang)

- **欄位**: `contraindications_en`
  - **中文原文**: `陰虛火旺者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 215. `herb.zao_xin_tu` — 灶心土 (Zao Xin Tu)

- **欄位**: `contraindications_en`
  - **中文原文**: `熱證出血者禁用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 216. `herb.cha_ye` — 茶葉 (Cha Ye)

- **欄位**: `contraindications_en`
  - **中文原文**: `失眠及胃潰瘍患者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 217. `herb.shan_yang_jiao` — 山羊角 (Shan Yang Jiao)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 218. `herb.han_shui_shi` — 寒水石 (Han Shui Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `脾胃虛寒者忌服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。

### 219. `herb.xiao_shi` — 硝石 (Xiao Shi)

- **欄位**: `contraindications_en`
  - **中文原文**: `孕婦及體虛者禁用；有小毒，不宜過量或久服。`
  - **目前英文翻譯**: `(缺失 / 留空)`
  - **問題說明**: 中文禁忌 contraindications_zh 有 1 條內容，但英文禁忌 contraindications_en 完全缺漏（0 條）。
  - **建議修法**: 將中文禁忌對譯並補齊至 contraindications_en 欄位。


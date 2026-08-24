# 中藥卡語意與品質稽核報告 (HERB SEMANTIC QA AUDIT)

- **稽核時間**: 2026-08-24
- **稽核範圍**: 全庫 363 味中藥卡 (canonical `data/herbs/herb_canon_shortlist.json`)
- **稽核屬性**: 唯讀檢查 (Read-Only Audit)，未修改任何 canonical 資料。
- **假陽性過濾**: 採用靈活詞幹匹配與動詞變位處理 (e.g. "Tonifies" 視為 "Tonify", "Use cautiously" 視為 "Caution")，排除合規項目。

---

## 稽核結果總覽

全庫 363 味中藥卡經語意與結構雙向對照稽核，共發現 **10** 個真實品質與翻譯缺陷。詳情如下：

| ID | 藥名 | 欄位 | 中文原文 | 目前英文翻譯 | 判定問題 | 建議修法 |
|---|---|---|---|---|---|---|
| `herb.huo_ma_ren` | 火麻仁 (Huo Ma Ren) | `cautions_zh[0] / cautions_en[0]` | 發芽為毒品：火麻仁為大麻種子，發芽後含有精神活性物質，屬毒品。 | Sprouted seeds are a controlled substance — Huo Ma Ren is Cannabis seed; once sprouted it contains psychoactive substances and is classified as a controlled substance. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.huo_ma_ren` | 火麻仁 (Huo Ma Ren) | `cautions_zh[1] / cautions_en[1]` | 忌諱藥材：《本草經集註》記載火麻仁畏牡蠣、白薇，惡茯苓。 | Herb interactions (Bencao Jing Jizhu) — antagonistic to Mu Li (Oyster Shell) and Bai Wei; mutually inhibiting with Fu Ling. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.yu_li_ren` | 郁李仁 (Yu Li Ren) | `cautions_zh[2] / cautions_en[2]` | 忌牛、馬肉：鬱李仁與牛、馬肉相剋，食用後可能引起腹痛、嘔吐等不適症狀。 | Mutually restrains beef and horse meat — concurrent consumption may cause abdominal pain, vomiting, and other discomfort. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.tian_nan_xing` | 天南星 (Tian Nan Xing) | `cautions_zh[0] / cautions_en[0]` | 本品有毒，內服必須使用專業炮製品。 | Internal use requires a professionally processed preparation. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.jie_geng` | 桔梗 (Jie Geng) | `cautions_zh[0] / cautions_en[0]` | 本品升散，氣機上逆者慎用。 | Its ascending and dispersing nature may aggravate rebellious Qi. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.shi_chang_pu` | 石菖蒲 (Shi Chang Pu) | `cautions_zh[1] / cautions_en[1]` | 忌配伍： 秦艽、秦皮為石菖蒲之使。 | Compatibility note: Qin Jiao and Qin Pi serve as its assistant (xiang shi) herbs. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.xu_duan` | 續斷 (Xu Duan) | `cautions_zh[1] / cautions_en[1]` | 惡雷丸：續斷忌與雷丸同用，雷丸具有散寒止痛的功效，可能與續斷的溫補功效相抵觸。 | Mutually inhibiting with Lei Wan — Xu Duan should not be combined with Lei Wan; Lei Wan's Cold-dispersing, pain-relieving action may conflict with Xu Duan's warming tonic effect. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.xian_he_cao` | 仙鶴草 (Xian He Cao) | `cautions_zh[5] / cautions_en[5]` | 長期大量使用者忌用：恐造成腎功能損害。 | Not for prolonged or high-dose use — may cause renal impairment. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.bai_jie_zi` | 白芥子 (Bai Jie Zi) | `cautions_zh[0] / cautions_en[0]` | 生品可能刺激胃腸，敏感者慎用。 | The raw seed can irritate the gastrointestinal tract. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |
| `herb.liu_huang` | 硫黃 (Liu Huang) | `cautions_zh[1] / cautions_en[1]` | AD notes：硫黃偏治癬與瘙癢，熱性使其不適合陽性熱毒紅腫瘡瘍。 | American Dragon notes Liu Huang is better for tinea and itching lesions, but its hot nature makes it unsuitable for Yang-type hot lesions. | 中文含明確警示/禁忌/慎用，但英文翻譯缺乏對應警示詞 (Caution/Avoid/Contraindicated/Warning) | 修改英文翻譯加入警示詞 (例: "Use with caution in ...") |

---
*報告生成時間: 2026-08-24. 依據 docs/ANTIGRAVITY_HANDOFF.md Task 1 規範產出。*

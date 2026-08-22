# 中藥卡全庫語意品質稽核報告 (Herb Semantic QA Audit)

- **稽核日期**: 2026-08-21
- **稽核範圍**: `main` 分支全庫 **358 味中藥卡** (`data/herbs/herb_canon_shortlist.json`)
- **稽核目標**: 唯讀檢查 `functions_zh` / `modern_functions_zh` / `cautions_zh` / `contraindications_zh` 與對應 `_en` 翻譯間之語意忠實度、警示動詞缺漏、極度不通順英文、重複陣列項目及中文源頭傾倒。
- **執行屬性**: **唯讀稽核**（`data/herbs/**` 檔案零異動）。

---

## 摘要與統計

- 審核中藥卡總數：**358 味**
- 發現有語意品質改進空間之藥卡數：**226 味**
- 主要問題分類統計：
  1. **禁忌/注意英文欠缺警示前綴 (Caution / Avoid / Contraindicated Missing)**: 英文僅列出病因/體質名詞（如 "Spontaneous sweating"），未含 "Use with caution in..." 或 "Contraindicated in..."，易引起安全閱讀疑慮。
  2. **功效英文缺乏治性動詞 (Action Verb Missing in English)**: 中文含「止/平/清/瀉/補/養」，英文動作僅寫出病症/名詞（或缺乏 Clear/Stop/Tonify 等主要動詞）。
  3. **現代藥理/禁忌陣列存在完全重複項目 (Duplicate Items in Array)**: 部分藥卡在匯入或合併過程中有相同英文/中文短語重複出現。
  4. **中文功效欄位包含課件文章/備註傾倒 (Text/Note Dumping in `functions_zh`)**: 功效標籤欄混入整句課件註釋。

---

## 詳細疑義與建議修訂清單

### herb.ai_ye (艾葉)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛血熱者慎用：艾葉性味苦辛溫，具有溫經散寒、止血安胎的功效，但陰虛血熱者服用後容易出現熱象加重、煩躁失眠等情況，因此應慎用。`
  - **目前英文**: `Use cautiously in Yin deficiency with Blood Heat — its warm, acrid nature that warms the menses and stops bleeding may aggravate Heat signs and cause restlessness or insomnia.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

### herb.ba_dou (巴豆)

- **欄位**: `cautions_en`
  - **中文原文**: `與牽牛子相反/不相容；課件與 AD/CloudTCM 均列此配伍禁忌。`
  - **目前英文**: `Incompatible with Qian Niu Zi / Semen Pharbitidis; listed by the course, AD, and CloudTCM.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `祛痰利咽、開閉通竅`
  - **目前英文**: `Breaks up clogged Phlegm, benefits the throat, and opens obstruction`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Breaks up clogged Phlegm, benefits the throat, and opens obstruction" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 祛痰利咽、開閉通竅"。

### herb.ba_ji_tian (巴戟天)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎壯陽`
  - **目前英文**: `Tonifies the Kidneys and fortifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys and fortifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎壯陽"。

### herb.bai_bian_dou (白扁豆)

- **欄位**: `cautions_en`
  - **中文原文**: `患寒熱者慎用`
  - **目前英文**: `Use cautiously in those with chills and fever.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_fu_zi (白附子)

- **欄位**: `actions_en`
  - **中文原文**: `解毒散結`
  - **目前英文**: `Resolve toxicity and dissipate nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Resolve toxicity and dissipate nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 解毒散結"。

### herb.bai_hua_she_she_cao (白花蛇舌草)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用；過度寒涼可能引起消化不良或腹瀉（CloudTCM）。`
  - **目前英文**: `Use cautiously in Spleen/Stomach deficiency-cold; excessive cold nature may cause indigestion or diarrhea (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎臟病患者慎用；其利尿方向可能增加腎臟負擔（CloudTCM）。`
  - **目前英文**: `Use cautiously in kidney disease; the diuretic direction may burden the kidneys (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_ji (白及)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱、便溏者應慎用。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency with loose stools.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_jiang_can (白僵蠶)

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎不足者應慎用，過量使用可能導致脾胃失和、肝鬱氣滯。`
  - **目前英文**: `Use cautiously in Liver-Kidney insufficiency — excessive use may cause Spleen-Stomach disharmony and Liver-Qi stagnation.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質者慎用，應在醫生的指導下使用。`
  - **目前英文**: `Use cautiously in those with allergies — use under a physician's guidance.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

- **欄位**: `actions_en`
  - **中文原文**: `化痰散結`
  - **目前英文**: `Transforms Phlegm and dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Transforms Phlegm and dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 化痰散結"。

### herb.bai_jie_zi (白芥子)

- **欄位**: `cautions_en`
  - **中文原文**: `生品可能刺激胃腸，敏感者慎用。`
  - **目前英文**: `The raw seed can irritate the gastrointestinal tract.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `利氣散結`
  - **目前英文**: `Move Qi and dissipate nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Move Qi and dissipate nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 利氣散結"。

### herb.bai_jiu (白酒)

- **欄位**: `actions_en`
  - **中文原文**: `作藥引，助藥力布散`
  - **目前英文**: `Serves as a vehicle that carries and distributes the other herbs`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Serves as a vehicle that carries and distributes the other herbs" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 作藥引，助藥力布散"。

### herb.bai_mao_gen (白茅根)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_qian (白前)

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓或正在使用降壓藥者慎用，CloudTCM 提及可能與降壓方向疊加。`
  - **目前英文**: `Use cautiously in hypertension or with antihypertensive drugs because CloudTCM notes possible additive blood-pressure effects.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_shao (白芍)

- **欄位**: `contraindications_en`
  - **中文原文**: `十八反：反藜蘆，禁止同用。`
  - **目前英文**: `Eighteen Incompatibilities: incompatible with Li Lu (Veratrum) — never combine.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

### herb.bai_tou_weng (白頭翁)

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者慎用。`
  - **目前英文**: `Use cautiously in hypertension.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `低血糖患者慎用。`
  - **目前英文**: `Use cautiously in hypoglycemia.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_wei (白薇)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bai_xian_pi (白鮮皮)

- **欄位**: `actions_en`
  - **中文原文**: `兼清濕熱痹與濕熱黃疸方向。`
  - **目前英文**: `Also addresses Damp-Heat Bi and Damp-Heat jaundice directions.`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Also addresses Damp-Heat Bi and Damp-Heat jaundice directions." 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 兼清濕熱痹與濕熱黃疸方向。"。

### herb.bai_zi_ren (柏子仁)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女、嬰幼兒和小兒慎用：柏子仁對孕婦、哺乳期婦女、嬰幼兒和小兒的身體可能會造成影響，應謹慎使用。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, infants, and young children — Bai Zi Ren may affect these populations; use with care.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者應慎用：柏子仁具有降血壓作用，高血壓患者應在醫師指導下使用。`
  - **目前英文**: `Use cautiously in hypertension — Bai Zi Ren has a blood-pressure-lowering effect; use under physician guidance.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.ban_lan_gen (板藍根)

- **欄位**: `cautions_en`
  - **中文原文**: `腎功能不全者慎用：鉀離子會增加腎臟負擔。`
  - **目前英文**: `Use cautiously in renal impairment — its potassium ion content burdens the kidneys.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝功能不全者慎用：銅離子會增加肝臟負擔。`
  - **目前英文**: `Use cautiously in hepatic impairment — its copper ion content burdens the liver.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.ban_xia (半夏)

- **欄位**: `contraindications_en`
  - **中文原文**: `禁止與烏頭類同用。`
  - **目前英文**: `Incompatible with all forms of Aconite.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

- **欄位**: `actions_en`
  - **中文原文**: `消痞散結`
  - **目前英文**: `Dissipate nodules and reduce focal distention`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipate nodules and reduce focal distention" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 消痞散結"。

### herb.bi_ba (蓽茇)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱者慎用；若出現口乾、便秘或火熱症狀需停用審核。`
  - **目前英文**: `Use cautiously with Spleen/Stomach weakness; stop and review if dryness, constipation, or Heat signs appear.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bian_xu (萹蓄)

- **欄位**: `actions_en`
  - **中文原文**: `利尿通淋、殺蟲止癢`
  - **目前英文**: `Clear Lower Jiao Damp-Heat`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Clear Lower Jiao Damp-Heat" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 利尿通淋、殺蟲止癢"。

### herb.bie_jia (鱉甲)

- **欄位**: `actions_en`
  - **中文原文**: `滋陰潛陽、軟堅散結`
  - **目前英文**: `Nourishes Yin and subdues Yang; softens hardness and dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Nourishes Yin and subdues Yang; softens hardness and dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 滋陰潛陽、軟堅散結"。

### herb.bing_pian (冰片)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.bu_gu_zhi (補骨脂)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.cang_er_zi (蒼耳子)

- **欄位**: `actions_en`
  - **中文原文**: `通鼻竅，止痛`
  - **目前英文**: `Open the nasal orifices and alleviate pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Open the nasal orifices and alleviate pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 通鼻竅，止痛"。

### herb.cang_zhu (蒼朮)

- **欄位**: `cautions_en`
  - **中文原文**: `血虛怯弱及七情氣悶者慎用，誤服會耗氣血、燥津液，加重虛火及痞悶（《醫學入門》）`
  - **目前英文**: `Use cautiously in Blood deficiency with timidity/weakness and Qi stagnation from the seven emotions — mistaken use can deplete Qi and Blood, dry fluids, and worsen deficiency Fire and focal distension (*Yi Xue Ru Men*).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer activity`
  - **目前英文**: `Anti-ulcer activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.ce_bai_ye (側柏葉)

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能不全者慎用：側柏葉中的活性成分可能對肝臟和腎臟產生負面影響，肝腎功能不全者應避免長期大量使用。`
  - **目前英文**: `Use cautiously in hepatic or renal insufficiency — its active constituents may adversely affect the liver and kidneys with prolonged heavy use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.che_qian_zi (車前子)

- **欄位**: `actions_en`
  - **中文原文**: `清熱瀉火`
  - **目前英文**: `Promote Urination to Solidify Stool`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Promote Urination to Solidify Stool" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 清熱瀉火"。

- **欄位**: `actions_en`
  - **中文原文**: `止咳化痰`
  - **目前英文**: `Clear Liver Heat & Benefit Eyes`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Clear Liver Heat & Benefit Eyes" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 止咳化痰"。

### herb.chen_pi (陳皮)

- **欄位**: `cautions_en`
  - **中文原文**: `American Dragon：實熱、熱痰、燥熱咳嗽或津液不足者慎用。`
  - **目前英文**: `American Dragon: use cautiously with Excess Heat, Hot Phlegm, dry-heat cough, or fluid deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer`
  - **目前英文**: `Anti-ulcer`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.chen_xiang (沉香)

- **欄位**: `actions_en`
  - **中文原文**: `行氣止痛`
  - **目前英文**: `Moves Qi and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Moves Qi and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 行氣止痛"。

### herb.chi_shao (赤芍)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒患者慎用：清熱解毒，可能傷脾胃。`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold — its Heat-clearing, toxin-resolving action may damage the Spleen and Stomach.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎不足患者慎用：活血化瘀，可能傷肝腎。`
  - **目前英文**: `Use cautiously in Liver-Kidney deficiency — its blood-invigorating, stasis-dispersing action may damage the Liver and Kidneys.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

- **欄位**: `actions_en`
  - **中文原文**: `散瘀止痛`
  - **目前英文**: `Dissipates stasis and relieves pain`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates stasis and relieves pain" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散瘀止痛"。

### herb.chuan_bei_mu (川貝母)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女慎用。 原因：川貝母具有一定的刺激性，對孕婦和哺乳期婦女過量使用可能會對胎兒或嬰兒造成影響。`
  - **目前英文**: `Use cautiously in pregnancy and lactation — its mild irritant properties may affect the fetus or infant with overuse.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.chuan_niu_xi (川牛膝)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.chuan_shan_jia (穿山甲)

- **欄位**: `contraindications_en`
  - **中文原文**: `**現代禁用**：穿山甲為保育類動物，課件標「obsolete/protected animal substance in modern practice」、「Anteater (pangolin) scales [endangered species]」。`
  - **目前英文**: `**Prohibited in modern practice**: the pangolin is a protected species; the coursework marks the substance as obsolete/protected in modern practice and labels it anteater (pangolin) scales [endangered species].`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

### herb.chuan_xin_lian (穿心蓮)

- **欄位**: `cautions_en`
  - **中文原文**: `胃寒者慎用`
  - **目前英文**: `Use cautiously in Stomach Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.chuan_xiong (川芎)

- **欄位**: `cautions_zh`
  - **中文原文**: `上盛下虛者忌服：上盛下虛者服用川芎會加重上盛的症狀，如頭暈、頭痛加劇。`
  - **目前英文**: `上盛下虛者忌服：上盛下虛者服用川芎會加重上盛的症狀，如頭暈、頭痛加劇。`
  - **問題分析**: 欄位 cautions_zh 中存在完全重複的詞條 "上盛下虛者忌服：上盛下虛者服用川芎會加重上盛的症狀，如頭暈、頭痛加劇。"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `cautions_en`
  - **中文原文**: `Contraindicated in upper excess with lower deficiency — use may worsen upper excess symptoms such as dizziness and intensified headache.`
  - **目前英文**: `Contraindicated in upper excess with lower deficiency — use may worsen upper excess symptoms such as dizziness and intensified headache.`
  - **問題分析**: 欄位 cautions_en 中存在完全重複的詞條 "Contraindicated in upper excess with lower deficiency — use may worsen upper excess symptoms such as dizziness and intensified headache."。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.chun_pi (椿皮)

- **欄位**: `cautions_en`
  - **中文原文**: `皮膚敏感或皮膚病史者外用慎用。`
  - **目前英文**: `Use external preparations cautiously in sensitive skin or prior skin disease.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `澀腸止瀉止痢`
  - **目前英文**: `Binds the intestines and stops diarrhea/dysentery`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Binds the intestines and stops diarrhea/dysentery" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 澀腸止瀉止痢"。

### herb.da_fu_pi (大腹皮)

- **欄位**: `cautions_en`
  - **中文原文**: `氣虛體弱者慎用`
  - **目前英文**: `Use cautiously in Qi deficiency with general weakness.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.da_huang (大黃)

- **欄位**: `cautions_en`
  - **中文原文**: `婦女孕產期：活血化瘀，恐傷胎氣或陰血，慎用。`
  - **目前英文**: `Use cautiously during pregnancy and postpartum — its blood-invigorating action may injure fetal Qi or Yin-Blood.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.da_ji (大薊)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `涼血止血、散瘀消腫`
  - **目前英文**: `Cools the Blood and stops bleeding; dissipates stasis and reduces swelling`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Cools the Blood and stops bleeding; dissipates stasis and reduces swelling" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 涼血止血、散瘀消腫"。

### herb.da_zao (大棗)

- **欄位**: `cautions_en`
  - **中文原文**: `American Dragon：濕盛或食積者慎用。`
  - **目前英文**: `American Dragon: use carefully with excess Dampness or food stagnation.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.dan_dou_chi (淡豆豉)

- **欄位**: `actions_en`
  - **中文原文**: `和中除滿`
  - **目前英文**: `Harmonize the Middle and Relieve Chest Oppression`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Harmonize the Middle and Relieve Chest Oppression" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 和中除滿"。

### herb.dan_shen (丹參)

- **欄位**: `cautions_en`
  - **中文原文**: `無瘀血者慎服：丹參具有活血化瘀的作用，若非瘀血證狀，應慎用。`
  - **目前英文**: `Use cautiously without Blood stasis — Dan Shen invigorates the Blood and dispels stasis, and should be used cautiously absent a Blood-stasis pattern.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `丹參可能擴張血管並降低血壓,低血壓患者慎用;使用丹參注射製劑時尤應監測血壓。`
  - **目前英文**: `Dan Shen may dilate blood vessels and lower blood pressure; use cautiously in hypotension. Blood pressure should be monitored especially closely when using Dan Shen injectable preparations.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `止血`
  - **目前英文**: `Cool Blood & Reduce Sores/Abscesses`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Cool Blood & Reduce Sores/Abscesses" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 止血"。

### herb.dan_zhu_ye (淡竹葉)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.dang_gui (當歸)

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

### herb.dang_shen (黨參)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `血熱者慎用。`
  - **目前英文**: `Use cautiously in Blood-Heat.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `糖尿病患者慎用。`
  - **目前英文**: `Use cautiously in diabetes.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦及哺乳期婦女慎用。`
  - **目前英文**: `Use cautiously in pregnancy and lactation.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `長期大量使用者慎用。`
  - **目前英文**: `Use cautiously with prolonged, high-dose use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `安神益智`
  - **目前英文**: `Calms the spirit and boosts the intellect`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Calms the spirit and boosts the intellect" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 安神益智"。

### herb.deng_xin_cao (燈心草)

- **欄位**: `actions_en`
  - **中文原文**: `清心火、利小便`
  - **目前英文**: `Promote Urination & Unblock Lin`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Promote Urination & Unblock Lin" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 清心火、利小便"。

### herb.di_fu_zi (地膚子)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期、兒童、老人或體質虛弱者慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, children, elders, or weak constitution (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.di_gu_pi (地骨皮)

- **欄位**: `cautions_en`
  - **中文原文**: `腎功能不全者慎用：腎功能不全者使用地骨皮易加重腎臟負擔。`
  - **目前英文**: `Use cautiously in impaired renal function — Di Gu Pi may increase the burden on the kidneys.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `水腫患者慎用：水腫患者使用地骨皮易加重水腫情況。`
  - **目前英文**: `Use cautiously in patients with edema — Di Gu Pi may worsen the edema.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `消化道潰瘍患者慎用：消化道潰瘍患者使用地骨皮易加重潰瘍情況。`
  - **目前英文**: `Use cautiously in peptic ulcer disease — Di Gu Pi may aggravate the ulcer.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.di_long (地龍)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女、小兒、老年人應慎用：此類人羣體質較弱，使用地龍時需特別注意，應在醫師指導下使用。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, children, and the elderly — these populations have a weaker constitution, so Di Long should be used with particular care and under a physician's guidance.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.di_yu (地榆)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.dong_chong_xia_cao (冬蟲夏草)

- **欄位**: `cautions_en`
  - **中文原文**: `出血性疾病或正在使用抗凝/抗血小板藥者慎用；CloudTCM 列可能增加出血風險。`
  - **目前英文**: `Use cautiously in bleeding disorders or with anticoagulant/antiplatelet drugs; CloudTCM lists potential bleeding-risk concerns.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補肺益腎、止咳平喘`
  - **目前英文**: `Tonifies the Lung and Kidney and stops cough and wheezing`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Lung and Kidney and stops cough and wheezing" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補肺益腎、止咳平喘"。

- **欄位**: `actions_en`
  - **中文原文**: `扶正補虛、止汗`
  - **目前英文**: `Supports deficiency recovery and helps stop sweating`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Supports deficiency recovery and helps stop sweating" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 扶正補虛、止汗"。

### herb.dong_gua_zi (冬瓜子)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒、便溏者慎用甘寒潤利之品。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency Cold or loose stools because it is sweet-cold and moistening.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.du_huo (獨活)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.du_zhong (杜仲)

- **欄位**: `cautions_en`
  - **中文原文**: `忌與蛇皮、元參同用。`
  - **目前英文**: `Incompatible with snake skin (She Pi) and Xuan Shen.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補肝腎`
  - **目前英文**: `Tonifies the Liver & Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver & Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補肝腎"。

### herb.e_jiao (阿膠)

- **欄位**: `cautions_en`
  - **中文原文**: `脾虛弱、胃虛弱便溏者慎用：阿膠性滋膩，有礙消化。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency with loose stools — E Jiao's rich, cloying nature can impair digestion.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者慎用：阿膠中含有豐富的鉀元素，長期服用可能導致血壓升高。`
  - **目前英文**: `Use cautiously in hypertension — E Jiao's high potassium content may raise blood pressure with prolonged use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質患者慎用：阿膠中含有蛋白質和多種氨基酸，容易引起過敏反應。`
  - **目前英文**: `Use cautiously in those with an allergic constitution — E Jiao's protein and amino-acid content may trigger allergic reactions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.fang_feng (防風)

- **欄位**: `actions_en`
  - **中文原文**: `祛風止痙`
  - **目前英文**: `Relieve Spasms & Tetanus Convulsions`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Relieve Spasms & Tetanus Convulsions" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 祛風止痙"。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉止血`
  - **目前英文**: `Stop Diarrhea & Stop Bleeding`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stop Diarrhea & Stop Bleeding" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉止血"。

### herb.fang_ji (防己)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.feng_mi (蜂蜜)

- **欄位**: `cautions_en`
  - **中文原文**: `糖尿病患者慎用並需控制量（CloudTCM）。`
  - **目前英文**: `Use cautiously and control intake in diabetes (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補中緩急止痛`
  - **目前英文**: `Tonifies the Middle, relaxes urgency, and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Tonifies the Middle, relaxes urgency, and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 補中緩急止痛"。

### herb.fo_shou (佛手)

- **欄位**: `cautions_en`
  - **中文原文**: `痢久氣虛者慎用。`
  - **目前英文**: `Use cautiously in chronic dysentery with Qi deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.fu_ling (茯苓)

- **欄位**: `contraindications_en`
  - **中文原文**: `腎虛、小便自利或失禁者不得服`
  - **目前英文**: `Not to be taken with Kidney deficiency, unrestrained or incontinent urination`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

### herb.fu_pen_zi (覆盆子)

- **欄位**: `cautions_en`
  - **中文原文**: `腎病患者或需限制鉀者慎用，CloudTCM 提醒過量食用可能增加鉀負荷。`
  - **目前英文**: `Use cautiously in kidney disease or potassium restriction; CloudTCM notes high dietary intake may increase potassium burden.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒、便溏或消化不良者慎用過量食療。`
  - **目前英文**: `Use excessive dietary amounts cautiously in Spleen-Stomach deficiency Cold, loose stools, or indigestion.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `益腎固精縮尿`
  - **目前英文**: `Tonifies the Kidneys, secures essence, and reduces urination`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys, secures essence, and reduces urination" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益腎固精縮尿"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎明目`
  - **目前英文**: `Tonifies Liver and Kidney and improves vision`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Liver and Kidney and improves vision" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎明目"。

### herb.fu_ping (浮萍)

- **欄位**: `cautions_en`
  - **中文原文**: `陽虛水腫者慎用（American Dragon）。`
  - **目前英文**: `Use cautiously for edema due to Yang deficiency according to American Dragon.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎臟病患者慎用、孕婦慎用；CloudTCM 並列過量可能導致中毒。`
  - **目前英文**: `Use cautiously in kidney disease and pregnancy; CloudTCM also states that overdose may cause toxicity.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.fu_shen (茯神)

- **欄位**: `cautions_en`
  - **中文原文**: `無濕熱者慎用`
  - **目前英文**: `Use cautiously without Damp-Heat.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.fu_xiao_mai (浮小麥)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.fu_zi (附子)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `散寒除濕、溫經止痛`
  - **目前英文**: `Disperses cold-dampness, warms the channels and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Disperses cold-dampness, warms the channels and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 散寒除濕、溫經止痛"。

### herb.gan_cao (甘草)

- **欄位**: `contraindications_en`
  - **中文原文**: `十八反：反甘遂、京大戟、芫花、海藻，禁止同用。`
  - **目前英文**: `Eighteen Incompatibilities: incompatible with Gan Sui, Jing Da Ji, Yuan Hua and Hai Zao — never combine.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

- **欄位**: `actions_en`
  - **中文原文**: `祛痰止咳、潤肺`
  - **目前英文**: `Moistens the Lungs, resolves Phlegm and stops coughing`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Moistens the Lungs, resolves Phlegm and stops coughing" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 祛痰止咳、潤肺"。

- **欄位**: `actions_en`
  - **中文原文**: `緩急止痛`
  - **目前英文**: `Moderates spasms and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Moderates spasms and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 緩急止痛"。

### herb.gan_jiang (乾薑)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛內熱、陰虛咳嗽吐血、表虛有熱汗出、臟毒下血、因熱嘔惡、火熱腹痛等症狀者慎用。`
  - **目前英文**: `Use cautiously in Yin deficiency with internal Heat, Yin-deficiency cough with hematemesis, Exterior deficiency with Heat and sweating, toxic Heat with rectal bleeding, Heat-type nausea, and Fire-Heat abdominal pain.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer activity`
  - **目前英文**: `Anti-ulcer activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `溫中散寒`
  - **目前英文**: `Warms the middle Jiāo`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Warms the middle Jiāo" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 溫中散寒"。

### herb.gan_sui (甘遂)

- **欄位**: `actions_en`
  - **中文原文**: `消腫散結`
  - **目前英文**: `Reduces swelling and dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Reduces swelling and dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 消腫散結"。

### herb.gao_liang_jiang (高良薑)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

### herb.ge_gen (葛根)

- **欄位**: `actions_en`
  - **中文原文**: `升陽止瀉`
  - **目前英文**: `Raise Yang and Stop Diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Raise Yang and Stop Diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 升陽止瀉"。

### herb.ge_jie (蛤蚧)

- **欄位**: `actions_en`
  - **中文原文**: `補肺益腎、納氣定喘`
  - **目前英文**: `Tonifies Lung and Kidney, helps the Kidneys grasp Qi, and calms wheezing`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Lung and Kidney, helps the Kidneys grasp Qi, and calms wheezing" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補肺益腎、納氣定喘"。

### herb.gou_ji (狗脊)

- **欄位**: `actions_en`
  - **中文原文**: `溫腎固攝、止遺泄`
  - **目前英文**: `Warms and stabilizes the Kidneys to prevent leakage`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Warms and stabilizes the Kidneys to prevent leakage" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 溫腎固攝、止遺泄"。

### herb.gou_qi_zi (枸杞子)

- **欄位**: `cautions_en`
  - **中文原文**: `元陽氣衰、陰虛精滑之人慎用。`
  - **目前英文**: `Use cautiously in declining original Yang Qi and Yin deficiency with seminal slippage.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.gou_teng (鉤藤)

- **欄位**: `cautions_en`
  - **中文原文**: `哺乳婦女慎用：鈎藤的成分可能會通過乳汁傳遞給嬰兒，建議哺乳婦女在使用前諮詢醫師。`
  - **目前英文**: `Use cautiously while breastfeeding — its constituents may pass to the infant through breast milk; consult a physician before use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `兒童慎用：鈎藤的安全性對於兒童尚未明確，建議兒童在使用前諮詢醫師。`
  - **目前英文**: `Use cautiously in children — safety in children has not been established; consult a physician before use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.gu_sui_bu (骨碎補)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦與哺乳期慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in pregnancy and lactation (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎功能不全、血小板減少症、消化系統或腸道疾病者慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in renal insufficiency, thrombocytopenia, and digestive or intestinal disease (CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.gua_lou (瓜蔞)

- **欄位**: `cautions_en`
  - **中文原文**: `配伍禁忌： 惡幹薑：瓜蔞性寒滑，幹薑性溫熱，兩藥相配會抵消功效。`
  - **目前英文**: `Combination incompatibility — mutually inhibiting with Gan Jiang (Dried Ginger): Gua Lou's cold, slippery nature and Gan Jiang's warm-hot nature cancel each other's effects.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.gua_lou_ren (栝樓仁)

- **欄位**: `cautions_en`
  - **中文原文**: `過量可致腹瀉，腸胃虛弱者慎用。`
  - **目前英文**: `Overuse may cause diarrhea; use cautiously in weak digestion.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.gui_ban (龜板)

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.hai_piao_xiao (海螵蛸)

- **欄位**: `actions_en`
  - **中文原文**: `制酸止痛`
  - **目前英文**: `Controls acidity and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Controls acidity and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 制酸止痛"。

### herb.han_fang_ji (漢防己)

- **欄位**: `actions_en`
  - **中文原文**: `祛風濕止痛，偏風濕熱痺、紅腫熱痛。`
  - **目前英文**: `Expels Wind-Damp and alleviates pain, especially Wind-Damp-Heat Bi with hot, red, swollen joints.`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Expels Wind-Damp and alleviates pain, especially Wind-Damp-Heat Bi with hot, red, swollen joints." 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 祛風濕止痛，偏風濕熱痺、紅腫熱痛。"。

- **欄位**: `actions_en`
  - **中文原文**: `與木防己/廣防己須辨：漢防己偏利水消腫，木防己偏祛風濕止痛但毒性風險高。`
  - **目前英文**: `Differentiate Han/Fen Fang Ji from Mu/Guang Fang Ji: Han Fang Ji emphasizes edema and urination; Mu/Guang Fang Ji emphasizes Bi pain but carries aristolochic-acid toxicity risk.`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Differentiate Han/Fen Fang Ji from Mu/Guang Fang Ji: Han Fang Ji emphasizes edema and urination; Mu/Guang Fang Ji emphasizes Bi pain but carries aristolochic-acid toxicity risk." 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 與木防己/廣防己須辨：漢防己偏利水消腫，木防己偏祛風濕止痛但毒性風險高。"。

### herb.han_lian_cao (旱蓮草)

- **欄位**: `cautions_en`
  - **中文原文**: `腎虛體弱者慎用 原因：旱蓮草具有利尿作用，過量使用可能對腎臟產生負擔。`
  - **目前英文**: `Use cautiously in Kidney deficiency with a weak constitution — Han Lian Cao's diuretic action may burden the kidneys if overused.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `胃腸虛寒者慎用 原因：旱蓮草性寒涼，容易傷胃，引起胃部不適。`
  - **目前英文**: `Use cautiously in Deficiency-Cold of the Stomach-Intestines — Han Lian Cao's Cold nature can easily injure the Stomach and cause discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女及小兒慎用 原因：尚未有足夠的臨牀研究證據支持其安全性。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, and children — clinical evidence supporting safety in these populations is insufficient.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.han_shui_shi (寒水石)

- **欄位**: `functions_zh`
  - **中文原文**: `利咽、清熱消腫（課件寒水石自身條目：Sore throat, Red eyes (burning); Skin: Burns, sores, oral ulcers）`
  - **目前英文**: `Clears Heat and drains Fire; Relieves irritability and thirst; Benefits the throat and clears Heat swelling (course entry: sore throat, red eyes [burning]; skin: burns, sores, oral ulcers)`
  - **問題分析**: 功效欄位包含課件說明/備註文字（文章或備註傾倒）。
  - **建議修法**: 精簡提煉短標籤，說明移至 notes_zh 或 clinical_use_note。

- **欄位**: `actions_en`
  - **中文原文**: `除煩止渴`
  - **目前英文**: `Relieves irritability and thirst`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Relieves irritability and thirst" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 除煩止渴"。

### herb.he_shou_wu (何首烏)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛火旺者慎用。`
  - **目前英文**: `Use cautiously in Yin deficiency with Fire blazing.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者慎用。`
  - **目前英文**: `Use cautiously in hypertension.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.he_tao_ren (核桃仁)

- **欄位**: `cautions_en`
  - **中文原文**: `AD 列有抗凝與溶栓作用；服用 warfarin、heparin、aspirin、clopidogrel 等抗凝/抗血小板藥者慎用。`
  - **目前英文**: `American Dragon lists anticoagulant and thrombolytic effects; use cautiously with warfarin, heparin, aspirin, clopidogrel, and other anticoagulant/antiplatelet drugs.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.he_ye (荷葉)

- **欄位**: `cautions_en`
  - **中文原文**: `無濕熱者慎用`
  - **目前英文**: `Use cautiously in the absence of Damp-Heat.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.hei_zhi_ma (黑芝麻)

- **欄位**: `actions_en`
  - **中文原文**: `補肝腎、益精血、潤腸通便`
  - **目前英文**: `Tonifies the Liver and Kidneys; boosts Essence and Blood; moistens the intestines and unblocks the bowels`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys; boosts Essence and Blood; moistens the intestines and unblocks the bowels" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補肝腎、益精血、潤腸通便"。

### herb.hu_jiao (胡椒)

- **欄位**: `cautions_en`
  - **中文原文**: `胃潰瘍、口乾、熱性咳嗽或火熱體質慎用。`
  - **目前英文**: `Use cautiously in gastric ulcer, dry mouth, Hot cough, or Heat constitution.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.hua_jiao (花椒)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `溫中止痛`
  - **目前英文**: `Warms the middle jiao, alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Warms the middle jiao, alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 溫中止痛"。

### herb.hua_shi (滑石)

- **欄位**: `actions_en`
  - **中文原文**: `清熱利尿`
  - **目前英文**: `Promote Urination & Unblock Lin`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Promote Urination & Unblock Lin" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 清熱利尿"。

### herb.huai_hua (槐花)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.huai_mi (槐米)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用。`
  - **目前英文**: `Use cautiously in Spleen/Stomach deficiency-cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `脾氣虛所致崩漏/子宮出血者慎用，需分清補攝與涼血。`
  - **目前英文**: `Use cautiously for uterine bleeding due to Spleen Qi deficiency; distinguish tonifying containment from cooling Blood.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.huang_bai (黃柏)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Antifungal activity`
  - **目前英文**: `Antifungal activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Antifungal activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.huang_jiu (黃酒)

- **欄位**: `actions_en`
  - **中文原文**: `作藥引，助藥力布散與循行`
  - **目前英文**: `Serves as a vehicle that promotes circulation and distribution of the formula`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Serves as a vehicle that promotes circulation and distribution of the formula" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 作藥引，助藥力布散與循行"。

### herb.huang_lian (黃連)

- **欄位**: `cautions_en`
  - **中文原文**: `本品苦燥傷津，陰虛津傷者慎用。`
  - **目前英文**: `Bitter and drying, damages fluids — use cautiously in Yin deficiency with fluid damage.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer activity`
  - **目前英文**: `Anti-ulcer activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.huang_qin (黃芩)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用：可能對胎兒造成影響。`
  - **目前英文**: `Use cautiously in pregnancy — may affect the fetus.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `哺乳期婦女慎用：可能透過乳汁影響嬰兒。`
  - **目前英文**: `Use cautiously during lactation — may affect the infant through breast milk.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.huo_ma_ren (火麻仁)

- **欄位**: `cautions_en`
  - **中文原文**: `忌諱藥材：《本草經集註》記載火麻仁畏牡蠣、白薇，惡茯苓。`
  - **目前英文**: `Herb interactions (Bencao Jing Jizhu) — antagonistic to Mu Li (Oyster Shell) and Bai Wei; mutually inhibiting with Fu Ling.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.ji_nei_jin (雞內金)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用：雞內金具有促進子宮收縮的作用，孕婦服用可能會導致流產或早產。`
  - **目前英文**: `Use cautiously in pregnancy — Ji Nei Jin may promote uterine contraction, risking miscarriage or premature birth.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `胃腸虛寒者慎用：雞內金具有刺激胃腸蠕動的作用，胃腸虛寒者服用可能會加重腹瀉症狀。`
  - **目前英文**: `Use cautiously in Deficiency-Cold of the stomach and intestines — Ji Nei Jin stimulates gastrointestinal motility and may aggravate diarrhea.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質者慎用：雞內金有一定的毒性，過敏體質者服用可能會引起過敏反應。`
  - **目前英文**: `Use cautiously in those with allergic constitutions — Ji Nei Jin has some toxicity and may trigger allergic reactions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.ji_xue_teng (雞血藤)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛火亢者慎用：因雞血藤性偏溫熱，陰虛火亢者容易出現虛火上炎的症狀，若服用雞血藤可能會加重其病情。`
  - **目前英文**: `Use cautiously in Yin deficiency with Fire hyperactivity — Ji Xue Teng is warm-natured; in Yin deficiency with Fire hyperactivity it may aggravate deficiency-Fire flaring symptoms.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.ji_zi_huang (雞子黃)

- **欄位**: `actions_en`
  - **中文原文**: `熄虛風、除煩安神`
  - **目前英文**: `Extinguishes deficiency Wind and calms irritability`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Extinguishes deficiency Wind and calms irritability" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 熄虛風、除煩安神"。

### herb.jiang_huang (薑黃)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `破血行氣、通經止痛`
  - **目前英文**: `Break Blood Stasis & Promote Qi Movement`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Break Blood Stasis & Promote Qi Movement" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 破血行氣、通經止痛"。

### herb.jie_geng (桔梗)

- **欄位**: `cautions_en`
  - **中文原文**: `本品升散，氣機上逆者慎用。`
  - **目前英文**: `Its ascending and dispersing nature may aggravate rebellious Qi.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.jin_yin_hua (金銀花)

- **欄位**: `cautions_en`
  - **中文原文**: `腸胃不適者應慎用金銀花，因為其成分可能刺激腸胃系統，加重不適症狀。`
  - **目前英文**: `Use cautiously in gastrointestinal discomfort — constituents may irritate the digestive tract and worsen symptoms.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.jin_ying_zi (金櫻子)

- **欄位**: `cautions_en`
  - **中文原文**: `心衰、胃酸過多、孕期與產後婦女慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in heart failure, hyperacidity, pregnancy, and postpartum according to CloudTCM.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `澀腸止瀉`
  - **目前英文**: `Astringes the Intestines and stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Astringes the Intestines and stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 澀腸止瀉"。

### herb.ju_hong (橘紅)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.ku_lian_pi (苦楝皮)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.ku_shen (苦參)

- **欄位**: `cautions_en`
  - **中文原文**: `胃弱者應慎用。`
  - **目前英文**: `Use cautiously in a weak Stomach.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.kuan_dong_hua (款冬花)

- **欄位**: `cautions_en`
  - **中文原文**: `款冬花辛、微苦,溫;陰虛勞嗽、咯血者慎用。`
  - **目前英文**: `Kuan Dong Hua is acrid, slightly bitter, and warm; use cautiously in Yin-deficiency consumptive cough and hemoptysis.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用：款冬花活血化瘀，可能對胎兒不利。`
  - **目前英文**: `Use cautiously in pregnancy — Kuan Dong Hua invigorates the Blood and dispels stasis, which may be unfavorable for the fetus.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `結石患者慎用：款冬花利尿，可能引起結石移動。`
  - **目前英文**: `Use cautiously in patients with stones — Kuan Dong Hua’s diuretic action may cause stone movement.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質者慎用：款冬花可能引起過敏反應。`
  - **目前英文**: `Use cautiously in allergy-prone constitutions — Kuan Dong Hua may provoke allergic reactions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `低血壓患者慎用：款冬花降壓，會加重低血壓。`
  - **目前英文**: `Use cautiously in hypotension — Kuan Dong Hua lowers blood pressure and may worsen hypotension.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能不全者慎用：款冬花可能加重肝腎功能不全。`
  - **目前英文**: `Use cautiously in Liver or Kidney insufficiency — Kuan Dong Hua may worsen Liver or Kidney insufficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.lai_fu_zi (萊菔子)

- **欄位**: `cautions_en`
  - **中文原文**: `氣虛者慎用：萊菔子辛散耗氣，氣虛者使用後可能加重氣虛症狀。`
  - **目前英文**: `Use cautiously in Qi deficiency — Lai Fu Zi's acrid, dispersing nature can deplete Qi and worsen Qi deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `無食積痰滯者慎用：萊菔子主治食積痰滯，若無食積痰滯症狀，使用後可能無效或產生不適。`
  - **目前英文**: `Use cautiously without Food stagnation and Phlegm — Lai Fu Zi is indicated for Food stagnation with Phlegm accumulation; without these signs it may be ineffective or cause discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.lian_qiao (連翹)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱者慎用：連翹性苦寒，過度食用可能損傷脾胃，導致腹瀉、嘔吐等症狀。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency — Forsythia's bitter-cold nature can damage the Spleen and Stomach with overuse, causing diarrhea and vomiting.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `氣虛發熱者慎用：連翹清熱解毒，但會耗損氣血，氣虛發熱者不宜服用。`
  - **目前英文**: `Use cautiously in Qi deficiency fever — clearing Heat and resolving toxicity further depletes Qi and Blood, which is unsuitable in this pattern.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `脾虛泄瀉者慎用：連翹性寒，會加重脾虛泄瀉的症狀。`
  - **目前英文**: `Use cautiously in Spleen-deficiency diarrhea — its cold nature worsens diarrhea from Spleen deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腹瀉、嘔吐者慎用：連翹清熱解毒，但會損傷脾胃，導致腹瀉、嘔吐等症狀。`
  - **目前英文**: `Use cautiously in diarrhea and vomiting — clearing Heat and resolving toxicity may damage the Spleen and Stomach, worsening diarrhea and vomiting.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `虛寒者慎用：連翹性寒，虛寒者服用後容易出現寒中之患。`
  - **目前英文**: `Use cautiously in Deficiency-Cold — its cold nature can easily generate Interior Cold in this population.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女和小孩慎用：連翹性寒，孕婦、哺乳期婦女和小孩服用後容易出現寒中之患。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, and children — its cold nature can easily generate Interior Cold in these populations.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能不全者慎用：連翹清熱解毒，但會耗損肝腎，肝腎功能不全者不宜服用。`
  - **目前英文**: `Use cautiously in hepatic or renal impairment — clearing Heat and resolving toxicity further depletes the Liver and Kidneys, which is unsuitable with impaired function.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎結石患者慎用：連翹清熱利尿，腎結石患者服用後容易加重病情。`
  - **目前英文**: `Use cautiously in kidney stones — its Heat-clearing, diuretic action may worsen the condition.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `急性胃腸炎患者慎用：連翹清熱解毒，但會損傷脾胃，急性胃腸炎患者不宜服用。`
  - **目前英文**: `Use cautiously in acute gastroenteritis — clearing Heat and resolving toxicity may damage the Spleen and Stomach.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `對連翹過敏者慎用：連翹過敏者服用後容易出現過敏反應。`
  - **目前英文**: `Use cautiously in those allergic to Forsythia — allergic reactions may occur with use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `與抗凝血劑、降血糖藥等藥物慎用：連翹會與這些藥物產生不良反應，使用時應謹慎。`
  - **目前英文**: `Use cautiously with anticoagulants, hypoglycemic drugs, and similar medications — adverse interactions may occur.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

- **欄位**: `actions_en`
  - **中文原文**: `消腫散結`
  - **目前英文**: `Reduces swelling and dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Reduces swelling and dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 消腫散結"。

### herb.lian_zi (蓮子)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.ling_zhi (靈芝)

- **欄位**: `cautions_en`
  - **中文原文**: `實證者慎用（課件、CloudTCM）。`
  - **目前英文**: `Use cautiously in Excess conditions (course material, CloudTCM).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣安神`
  - **目前英文**: `Tonifies Qi and calms the Shen (Spirit)`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi and calms the Shen (Spirit)" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣安神"。

### herb.long_chi (龍齒)

- **欄位**: `actions_en`
  - **中文原文**: `平肝潛陽`
  - **目前英文**: `Pacifies the Liver and anchors ascendant Yang`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Pacifies the Liver and anchors ascendant Yang" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 平肝潛陽"。

### herb.long_dan_cao (龍膽草)

- **欄位**: `cautions_en`
  - **中文原文**: `出血性疾病者慎用：龍膽草含有抗血小板聚集作用的成分，出血性疾病患者服用後可能增加出血風險。`
  - **目前英文**: `Use cautiously in bleeding disorders — antiplatelet-aggregation constituents may increase bleeding risk.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝功能不全者慎用：龍膽草的成分需要經肝臟代謝，肝功能不全者服用後可能對肝臟造成負擔。`
  - **目前英文**: `Use cautiously in hepatic impairment — constituents require hepatic metabolism and may burden an impaired liver.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.long_gu (龍骨)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.long_yan_rou (龍眼肉)

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.lu_cha (綠茶)

- **欄位**: `actions_en`
  - **中文原文**: `作送服藥引，制諸風藥之升散`
  - **目前英文**: `Serves as the traditional vehicle, restraining the upward-dispersing Wind herbs`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Serves as the traditional vehicle, restraining the upward-dispersing Wind herbs" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 作送服藥引，制諸風藥之升散"。

### herb.lu_jiao_jiao (鹿角膠)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎益精`
  - **目前英文**: `Tonifies the Kidneys and boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys and boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎益精"。

### herb.lu_rong (鹿茸)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.mai_men_dong (麥門冬)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.mang_xiao (芒硝)

- **欄位**: `cautions_en`
  - **中文原文**: `低血鉀症慎用：芒硝也會導致低血鉀，因此低血鉀症患者應慎用或遵醫囑使用。`
  - **目前英文**: `Use cautiously in hypokalemia — Mang Xiao may further lower potassium levels; use only under medical supervision.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `血容量不足者慎用：芒硝會導致脫水，可能加重血容量不足的情況，因此血容量不足者應慎用。`
  - **目前英文**: `Use cautiously in hypovolemia — its dehydrating effect may worsen low blood volume.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.mei_gui_hua (玫瑰花)

- **欄位**: `actions_en`
  - **中文原文**: `活血散瘀`
  - **目前英文**: `Invigorates the Blood and dissipates stasis`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Invigorates the Blood and dissipates stasis" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 活血散瘀"。

### herb.mo_han_lian (墨旱蓮)

- **欄位**: `cautions_en`
  - **中文原文**: `腎虛體弱者慎用 原因：旱蓮草具有利尿作用，過量使用可能對腎臟產生負擔。`
  - **目前英文**: `Use cautiously in Kidney deficiency with a weak constitution — Han Lian Cao's diuretic action may burden the kidneys if overused.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `胃腸虛寒者慎用 原因：旱蓮草性寒涼，容易傷胃，引起胃部不適。`
  - **目前英文**: `Use cautiously in Deficiency-Cold of the Stomach-Intestines — Han Lian Cao's Cold nature can easily injure the Stomach and cause discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女及小兒慎用 原因：尚未有足夠的臨牀研究證據支持其安全性。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, and children — clinical evidence supporting safety in these populations is insufficient.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.mo_yao (沒藥)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.mu_dan_pi (牡丹皮)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱患者慎用。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質者慎用。`
  - **目前英文**: `Use cautiously in those with an allergic constitution.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `忌與某些藥物同用，例如阿司匹林、華法林等藥物。`
  - **目前英文**: `Incompatible with certain medications, such as aspirin and warfarin.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.mu_tong (木通)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `清熱瀉火`
  - **目前英文**: `Promote Urination & Unblock Lin`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Promote Urination & Unblock Lin" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 清熱瀉火"。

- **欄位**: `actions_en`
  - **中文原文**: `補血養肝`
  - **目前英文**: `Unblock Channels & Promote Lactation`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Unblock Channels & Promote Lactation" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血養肝"。

### herb.mu_xiang (木香)

- **欄位**: `cautions_en`
  - **中文原文**: `肺虛有熱者慎用：因木香性溫，恐加重肺熱症狀。`
  - **目前英文**: `Use cautiously in Lung deficiency with Heat — Mu Xiang's warm nature may aggravate Lung-Heat symptoms.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `熱盛體質慎用：因木香溫熱，熱盛體質者服用恐加重熱盛症狀。`
  - **目前英文**: `Use cautiously in a Heat-excess constitution — Mu Xiang's warm-hot nature may worsen Heat-excess symptoms.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女慎用：因木香溫熱，孕婦、哺乳期婦女長期大量服用恐對胎兒及嬰兒不利。`
  - **目前英文**: `Use cautiously in pregnancy and lactation — Mu Xiang's warm-hot nature, taken long-term or in high doses, may be unfavorable for the fetus or infant.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.mu_zei (木賊)

- **欄位**: `actions_en`
  - **中文原文**: `兼有輕度止血與利尿方向，但考試核心仍是風熱眼科。`
  - **目前英文**: `Has mild hemostatic and diuretic directions, but the exam core remains Wind-Heat eye disorders.`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Has mild hemostatic and diuretic directions, but the exam core remains Wind-Heat eye disorders." 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 兼有輕度止血與利尿方向，但考試核心仍是風熱眼科。"。

### herb.niu_bang_zi (牛蒡子)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱、脾胃濕寒、腹瀉者慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in Spleen/Stomach weakness, Spleen/Stomach Damp-Cold, or diarrhea according to CloudTCM.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `解毒消腫、透疹止癢`
  - **目前英文**: `Resolve toxicity, reduce swelling, and vent rashes`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Resolve toxicity, reduce swelling, and vent rashes" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 解毒消腫、透疹止癢"。

### herb.niu_xi (牛膝)

- **欄位**: `actions_en`
  - **中文原文**: `逐瘀通經、補肝腎、強筋骨、利尿通淋、引血下行`
  - **目前英文**: `Invigorate Blood & Unblock Menses`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Invigorate Blood & Unblock Menses" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 逐瘀通經、補肝腎、強筋骨、利尿通淋、引血下行"。

### herb.nu_zhen_zi (女貞子)

- **欄位**: `cautions_en`
  - **中文原文**: `心血管疾病患者慎用：女貞子具有降血壓和心臟刺激作用，心律失常或高血壓患者使用不當易引發心血管不適。`
  - **目前英文**: `Use cautiously in cardiovascular disease — Nu Zhen Zi's blood-pressure-lowering and cardiac-stimulating effects may cause discomfort in arrhythmia or hypertension.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.pao_jiang (炮薑)

- **欄位**: `actions_en`
  - **中文原文**: `溫中止瀉`
  - **目前英文**: `Warms the middle and stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Warms the middle and stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 溫中止瀉"。

### herb.pu_gong_ying (蒲公英)

- **欄位**: `actions_en`
  - **中文原文**: `消腫散結`
  - **目前英文**: `Reduce abscesses and dissipate nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Reduce abscesses and dissipate nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 消腫散結"。

### herb.pu_huang (蒲黃)

- **欄位**: `cautions_en`
  - **中文原文**: `蒲黃甘、平;孕婦慎用。`
  - **目前英文**: `Pu Huang is sweet and neutral; use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `心悸、失眠者慎用：蒲黃興奮中樞神經，會造成心悸、失眠。`
  - **目前英文**: `Use cautiously in palpitations and insomnia — Pu Huang stimulates the central nervous system and may cause palpitations and insomnia.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.qian_cao_gen (茜草根)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.qian_hu (前胡)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛咳嗽者慎用`
  - **目前英文**: `Use cautiously in Yin-deficiency cough.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Cardiovascular-protective activity`
  - **目前英文**: `Cardiovascular-protective activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Cardiovascular-protective activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.qian_shi (芡實)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

### herb.qin_jiao (秦艽)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.qing_hao (青蒿)

- **欄位**: `cautions_en`
  - **中文原文**: `產後血虛、內寒作瀉、飲食停滯泄瀉者慎用：產後脾胃虛弱，食用青蒿會加重虛寒，並使腹瀉更嚴重。`
  - **目前英文**: `Use cautiously in postpartum Blood deficiency, internal-Cold diarrhea, or diarrhea from food stagnation — postpartum Spleen-Stomach weakness can be worsened by Qing Hao's Cold nature, aggravating the diarrhea.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `胃虛者慎用：青蒿寒涼，胃虛者服用後容易引起胃痛、腹瀉等不適。`
  - **目前英文**: `Use cautiously in Stomach deficiency — Qing Hao's Cold, cool nature can cause stomach pain, diarrhea, and other discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `青蒿素不良反應：頭痛、腹痛、噁心、嘔吐、皮疹等，過敏體質或相關疾病患者應慎用。`
  - **目前英文**: `Artemisinin adverse reactions include headache, abdominal pain, nausea, vomiting, and rash — use cautiously in those with an allergic constitution or related conditions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎臟和肝臟功能不良者應慎用：因青蒿可能加重這些器官的負擔。`
  - **目前英文**: `Use cautiously in impaired renal or hepatic function — Qing Hao may increase the burden on these organs.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.qing_pi (青皮)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用：青皮溫辛性質容易刺激脾胃，加重脾胃虛寒症狀。`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold — Qing Pi's warm-acrid nature can irritate the Spleen-Stomach and worsen the pattern.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `服用血液稀釋藥、抗血小板藥者慎用：青皮具有抗凝血作用，過量食用可能會影響藥物療效。`
  - **目前英文**: `Use cautiously with anticoagulant or antiplatelet drugs — Qing Pi has anticoagulant activity and excessive use may affect drug efficacy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.quan_xie (全蠍)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.ren_shen (人參)

- **欄位**: `contraindications_en`
  - **中文原文**: `十八反：反藜蘆，禁止同用。`
  - **目前英文**: `Eighteen Incompatibilities: incompatible with Li Lu (Veratrum) — never combine.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

- **欄位**: `contraindications_en`
  - **中文原文**: `十九畏：畏五靈脂，禁止同用（五靈脂阻礙人參吸收）。`
  - **目前英文**: `Nineteen Antagonisms: antagonized by Wu Ling Zhi, which blocks absorption — never combine.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

- **欄位**: `actions_en`
  - **中文原文**: `大補元氣`
  - **目前英文**: `Powerfully tonifies the Yuan (Source) Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Powerfully tonifies the Yuan (Source) Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 大補元氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補脾益肺`
  - **目前英文**: `Tonifies Spleen, Stomach and Lung Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Spleen, Stomach and Lung Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補脾益肺"。

- **欄位**: `actions_en`
  - **中文原文**: `安神益智`
  - **目前英文**: `Tonifies Heart Qi and calms the Spirit`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Heart Qi and calms the Spirit" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 安神益智"。

### herb.rou_cong_rong (肉蓯蓉)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎益精`
  - **目前英文**: `Tonifies the Kidneys and boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys and boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎益精"。

### herb.rou_dou_kou (肉豆蔻)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Binds intestines and stops diarrhea`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Binds intestines and stops diarrhea" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

### herb.rou_gui (肉桂)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer activity`
  - **目前英文**: `Anti-ulcer activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `散寒止痛`
  - **目前英文**: `Disperses cold and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Disperses cold and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 散寒止痛"。

### herb.ru_xiang (乳香)

- **欄位**: `cautions_en`
  - **中文原文**: `胃弱者慎用：乳香氣味較濁，胃弱者服用恐加重不適。`
  - **目前英文**: `Use cautiously in weak Stomach — Ru Xiang has a strong, turbid odor; use in weak Stomach may worsen discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.san_qi (三七)

- **欄位**: `cautions_en`
  - **中文原文**: `抗凝血藥物者慎用：三七具有抗凝血作用，與抗凝血藥物併用可能會增加出血風險。`
  - **目前英文**: `Use cautiously with anticoagulant medications — its anticoagulant activity may increase bleeding risk when combined.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `正在服用防止血栓形成、防治中風、水楊酸類藥物者慎用：三七抗凝血作用與此類藥物併用恐加重出血風險。`
  - **目前英文**: `Use cautiously with antithrombotic, stroke-prevention, or salicylate medications — its anticoagulant activity may compound bleeding risk when combined.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

### herb.sang_bai_pi (桑白皮)

- **欄位**: `cautions_en`
  - **中文原文**: `肺寒無火者慎用`
  - **目前英文**: `Use cautiously in Lung Cold without Fire.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.sang_ji_sheng (桑寄生)

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.sang_piao_xiao (桑螵蛸)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛火旺者慎用`
  - **目前英文**: `Use cautiously in Yin deficiency with Fire blazing.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `固精縮尿、補腎助陽`
  - **目前英文**: `Secures Essence and reduces urination; tonifies the Kidneys and assists Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Secures Essence and reduces urination; tonifies the Kidneys and assists Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 固精縮尿、補腎助陽"。

### herb.sang_shen (桑椹)

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.sha_ren (砂仁)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.sha_yuan_zi (沙苑子)

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者應慎用：沙苑子具有降壓作用，高血壓患者應在醫生的指導下使用。`
  - **目前英文**: `Use cautiously in hypertension — Sha Yuan Zi has a blood-pressure-lowering action; use under medical supervision.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.shan_yang_jiao (山羊角)

- **欄位**: `functions_zh`
  - **中文原文**: `鎮肝，治肝陽上亢/肝火上炎之眩暈、抽搐、目赤腫痛（課件山羊角自身條目：效同羚羊角而力緩，需 2–3 倍劑量）`
  - **目前英文**: `Pacifies the Liver and extinguishes Wind, clearing Liver Heat (used as a substitute for Ling Yang Jiao); Calms and sedates the Liver for ascendant Liver Yang/Fire with dizziness, vertigo, convulsions, and red/swollen/painful eyes (course entry: functions similar to Ling Yang Jiao but milder, requiring a 2–3x dose)`
  - **問題分析**: 功效欄位包含課件說明/備註文字（文章或備註傾倒）。
  - **建議修法**: 精簡提煉短標籤，說明移至 notes_zh 或 clinical_use_note。

- **欄位**: `actions_en`
  - **中文原文**: `平肝息風、清肝熱（作羚羊角替代）`
  - **目前英文**: `Pacifies the Liver and extinguishes Wind, clearing Liver Heat (used as a substitute for Ling Yang Jiao)`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Pacifies the Liver and extinguishes Wind, clearing Liver Heat (used as a substitute for Ling Yang Jiao)" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 平肝息風、清肝熱（作羚羊角替代）"。

### herb.shan_yao (山藥)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎澀精`
  - **目前英文**: `Tonifies the Kidneys and astringes Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys and astringes Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎澀精"。

### herb.shan_zha (山楂)

- **欄位**: `cautions_en`
  - **中文原文**: `腹瀉者慎用。`
  - **目前英文**: `Use cautiously in diarrhea.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腸胃功能不良者慎用。`
  - **目前英文**: `Use cautiously in poor gastrointestinal function.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `低血糖患者慎用。`
  - **目前英文**: `Use cautiously in hypoglycemia.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能不良者慎用。`
  - **目前英文**: `Use cautiously in impaired liver or kidney function.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用。`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Antihypertensive activity`
  - **目前英文**: `Antihypertensive activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Antihypertensive activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.shan_zhu_yu (山茱萸)

- **欄位**: `cautions_en`
  - **中文原文**: `與含茴香精或血栓溶解藥物的西藥同用應在醫師指導下慎用。`
  - **目前英文**: `Concurrent use with fennel-extract preparations or thrombolytic medications should be under physician guidance and used cautiously.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

### herb.she_gan (射干)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.shen_qu (神麴)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱、消化不良者慎用：神麴雖有健脾胃功效，但過量服用會刺激胃腸道粘膜，加重消化不良症狀。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency with indigestion — although Shen Qu strengthens the Spleen and Stomach, excessive use can irritate the gastrointestinal mucosa and worsen indigestion.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.sheng_di_huang (生地黃)

- **欄位**: `cautions_en`
  - **中文原文**: `忌蘿蔔、蔥白、韭白、薤白：生地黃與這些辛溫燥熱的食物同用時，會抵消其滋陰潤燥的功效，甚至引起上火。`
  - **目前英文**: `Incompatible with radish, scallion white, chive white, and Xie Bai — combining with these pungent, warm, drying foods cancels its Yin-nourishing, moistening action and may even provoke Heat.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

### herb.shi_chang_pu (石菖蒲)

- **欄位**: `cautions_en`
  - **中文原文**: `忌配伍： 秦艽、秦皮為石菖蒲之使。`
  - **目前英文**: `Compatibility note: Qin Jiao and Qin Pi serve as its assistant (xiang shi) herbs.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `有病症慎用： 有高血壓、心血管疾病、肝臟疾病等病症的人應慎用石菖蒲。`
  - **目前英文**: `Use cautiously in hypertension, cardiovascular disease, liver disease, and similar conditions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.shi_gao (石膏)

- **欄位**: `actions_en`
  - **中文原文**: `清熱瀉火`
  - **目前英文**: `Relieve Irritability & Quench Thirst`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Relieve Irritability & Quench Thirst" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 清熱瀉火"。

- **欄位**: `actions_en`
  - **中文原文**: `止咳平喘`
  - **目前英文**: `Astringe Wounds & Promote Tissue Growth`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Astringe Wounds & Promote Tissue Growth" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 止咳平喘"。

### herb.shi_hu (石斛)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

### herb.shi_jue_ming (石決明)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.shi_jun_zi (使君子)

- **欄位**: `cautions_en`
  - **中文原文**: `大量服用慎用：大量服用使君子可能會引起呃逆、眩暈、嘔吐等反應。`
  - **目前英文**: `Use cautiously with large doses — high doses of Shi Jun Zi may cause hiccup, dizziness, or vomiting.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.shi_liu_pi (石榴皮)

- **欄位**: `actions_en`
  - **中文原文**: `澀腸止瀉`
  - **目前英文**: `Astringes the intestines and stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Astringes the intestines and stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 澀腸止瀉"。

### herb.shu_di_huang (熟地黃)

- **欄位**: `cautions_en`
  - **中文原文**: `中滿痰盛者慎用：中滿痰盛者服用熟地黃，可能會加重胸悶、痰多等症狀。`
  - **目前英文**: `Use cautiously in Middle-Burner fullness with profuse Phlegm — Shu Di Huang may worsen the chest oppression and phlegm.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補血`
  - **目前英文**: `Tonifies the Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補血"。

- **欄位**: `actions_en`
  - **中文原文**: `益精`
  - **目前英文**: `Boosts Essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.shui_niu_jiao (水牛角)

- **欄位**: `cautions_en`
  - **中文原文**: `兒童、哺乳期、體弱者慎用（CloudTCM）。`
  - **目前英文**: `Use cautiously in children, lactation, and weak patients per CloudTCM.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `犀角為禁用瀕危動物藥；本品是替代品，勿混用或尋求犀角。`
  - **目前英文**: `Rhinoceros horn is prohibited/endangered; Shui Niu Jiao is the substitute and should not be confused with or replaced by Xi Jiao.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.su_he_xiang (蘇合香)

- **欄位**: `cautions_en`
  - **中文原文**: `容易過敏者慎用：蘇合香氣味強烈，容易引起過敏反應，對香氣過敏者應注意使用。`
  - **目前英文**: `Use cautiously in those prone to allergy — Su He Xiang's strong aroma can easily trigger allergic reactions; those sensitive to fragrance should use it with care.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦、哺乳期婦女和小兒慎用：蘇合香氣味刺激，辛溫性質，孕婦、哺乳期婦女和小兒體質較為敏感，使用時應謹慎。`
  - **目前英文**: `Use cautiously in pregnancy, lactation, and children — Su He Xiang's pungent, acrid-warm nature calls for care in these more sensitive populations.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `腎功能不全者慎用：蘇合香有行氣活血、利尿消腫的作用，腎功能不全者使用可能會加重腎臟負擔，應謹慎使用。`
  - **目前英文**: `Use cautiously in renal insufficiency — Su He Xiang moves Qi, invigorates Blood, and promotes urination to reduce swelling; use may increase the burden on impaired kidneys.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.su_zi (蘇子)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用：紫蘇子性味辛溫，有活血化瘀的作用，孕婦服用可能會導致流產。`
  - **目前英文**: `Use cautiously in pregnancy — Su Zi is acrid and warm with a Blood-invigorating, stasis-resolving action that may cause miscarriage.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.suan_zao_ren (酸棗仁)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.suo_yang (鎖陽)

- **欄位**: `actions_en`
  - **中文原文**: `補腎陽`
  - **目前英文**: `Tonifies Kidney Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Kidney Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎陽"。

- **欄位**: `actions_en`
  - **中文原文**: `益精血`
  - **目前英文**: `Boosts Essence and Blood`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts Essence and Blood" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益精血"。

### herb.tai_zi_shen (太子參)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.tian_hua_fen (天花粉)

- **欄位**: `cautions_en`
  - **中文原文**: `過敏體質者慎用：可能會引起過敏反應。`
  - **目前英文**: `Use cautiously in allergy-prone individuals — may cause allergic reactions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `慢性腸胃疾病患者慎用：具有收斂作用，可能會加重病情。`
  - **目前英文**: `Use cautiously in chronic gastrointestinal disease — its astringent action may aggravate the condition.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.tian_ma (天麻)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Cardiovascular-protective activity`
  - **目前英文**: `Cardiovascular-protective activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Cardiovascular-protective activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.tian_men_dong (天門冬)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.tian_nan_xing (天南星)

- **欄位**: `actions_en`
  - **中文原文**: `外用散結消腫止痛`
  - **目前英文**: `Dissipate nodules, reduce swelling and relieve pain externally`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipate nodules, reduce swelling and relieve pain externally" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 外用散結消腫止痛"。

### herb.tong_cao (通草)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.tu_si_zi (菟絲子)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.wang_bu_liu_xing (王不留行)

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能較弱者應慎用：王不留行含有一些生物鹼類的成分，肝腎功能較弱者應謹慎使用。`
  - **目前英文**: `Use cautiously in weak liver or kidney function — Wang Bu Liu Xing contains alkaloid constituents; use cautiously in those with weak liver or kidney function.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `胃部疾病患者應慎用：王不留行具有一定的刺激作用，胃潰瘍、十二指腸潰瘍等胃部疾病患者應謹慎使用。`
  - **目前英文**: `Use cautiously in gastric disease — Wang Bu Liu Xing has a degree of irritant action; use cautiously in peptic ulcer, duodenal ulcer, and other gastric conditions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.wu_bei_zi (五倍子)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.wu_gong (蜈蚣)

- **欄位**: `actions_en`
  - **中文原文**: `攻毒散結`
  - **目前英文**: `Attacks toxins and dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Attacks toxins and dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 攻毒散結"。

### herb.wu_jia_pi (五加皮)

- **欄位**: `cautions_en`
  - **中文原文**: `患有高血壓、心血管疾病、肝臟疾病等病症的人士應慎用：五加皮可能會影響藥物效果或加重病情。`
  - **目前英文**: `Use cautiously in hypertension, cardiovascular disease, liver disease, and similar conditions — Wu Jia Pi may affect medication efficacy or aggravate these conditions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.wu_mei (烏梅)

- **欄位**: `actions_en`
  - **中文原文**: `斂肺止咳、澀腸止瀉、生津止渴、安蛔`
  - **目前英文**: `Astringes Lung and stops chronic cough`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Astringes Lung and stops chronic cough" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 斂肺止咳、澀腸止瀉、生津止渴、安蛔"。

### herb.wu_wei_zi (五味子)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Stabilizes and binds leakage of essence`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Stabilizes and binds leakage of essence" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Stops spontaneous and night sweating`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Stops spontaneous and night sweating" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

- **欄位**: `actions_en`
  - **中文原文**: `止咳化痰`
  - **目前英文**: `Generates fluids and alleviates thirst`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Generates fluids and alleviates thirst" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 止咳化痰"。

### herb.wu_zhu_yu (吳茱萸)

- **欄位**: `cautions_en`
  - **中文原文**: `一切陰虛之證及五臟六腑有熱無寒之人慎用。`
  - **目前英文**: `Use cautiously in all patterns of Yin deficiency and in those with Heat but no Cold in the five Zang and six Fu organs.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Anti-ulcer activity`
  - **目前英文**: `Anti-ulcer activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Anti-ulcer activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `溫中散寒止痛`
  - **目前英文**: `Warms the middle, disperses cold, and alleviates pain`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Warms the middle, disperses cold, and alleviates pain" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 溫中散寒止痛"。

- **欄位**: `actions_en`
  - **中文原文**: `降逆止嘔`
  - **目前英文**: `Redirects rebellious qi downward`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Redirects rebellious qi downward" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 降逆止嘔"。

### herb.xi_jiao (犀角)

- **欄位**: `contraindications_en`
  - **中文原文**: `**現代禁用**：犀為瀕危保育物種，課件明確記載安宮牛黃丸「Rhinoceros horn is obsolete/endangered and not used」、蘇合香丸「Endangered; AD states no longer used」。`
  - **目前英文**: `**Prohibited in modern practice**: rhinoceros is an endangered protected species; the coursework states for An Gong Niu Huang Wan that rhinoceros horn is obsolete/endangered and not used, and for Su He Xiang Wan that it is endangered and per American Dragon no longer used.`
  - **問題分析**: 中文禁忌症明確標註「禁用」，但英文缺乏 Contraindicated 前綴，有安全誤導風險。
  - **建議修法**: 英文應改為 "Contraindicated in..."。

### herb.xi_xin (細辛)

- **欄位**: `cautions_en`
  - **中文原文**: `忌與藜蘆同用。`
  - **目前英文**: `Incompatible with Li Lu (Veratrum).`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.xi_yang_shen (西洋參)

- **欄位**: `cautions_en`
  - **中文原文**: `免疫系統過度活躍的患者應慎用，如炎症性腸病等，因西洋參會進一步增強免疫力，可能加重症狀。`
  - **目前英文**: `Use cautiously in overactive immune conditions such as inflammatory bowel disease — it may further enhance immunity and aggravate symptoms.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `嚴重心臟病患者應慎用西洋參，因其具有強心作用，可能加重心臟負擔。`
  - **目前英文**: `Use cautiously in severe heart disease — its cardiotonic action may increase cardiac burden.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.xia_ku_cao (夏枯草)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱者慎用：夏枯草性涼，脾胃虛弱者服用後易引起腹瀉等不適。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency — its cool nature may cause diarrhea and other discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `體質虛寒者不宜使用：夏枯草性涼，易損傷陽氣，體質虛寒者應慎用。`
  - **目前英文**: `Not suitable in Deficiency-Cold constitutions — its cool nature can readily injure Yang Qi.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.xian_he_cao (仙鶴草)

- **欄位**: `cautions_en`
  - **中文原文**: `長期大量使用者忌用：恐造成腎功能損害。`
  - **目前英文**: `Not for prolonged or high-dose use — may cause renal impairment.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.xian_mao (仙茅)

- **欄位**: `actions_en`
  - **中文原文**: `祛寒除濕，通痹止痛。`
  - **目前英文**: `Dispels Cold-Damp and unblocks painful obstruction.`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Dispels Cold-Damp and unblocks painful obstruction." 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 祛寒除濕，通痹止痛。"。

### herb.xiang_fu (香附)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.xiao_hui_xiang (小茴香)

- **欄位**: `cautions_en`
  - **中文原文**: `胃、腎有熱者慎用：茴香性溫，胃、腎有熱者服用後可能加重胃痛、嘔吐、尿頻等熱症。`
  - **目前英文**: `Use cautiously in Stomach or Kidney Heat — Xiao Hui Xiang is warm in nature, and taking it in Stomach or Kidney Heat may aggravate stomach pain, vomiting, urinary frequency, and other Heat signs.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.xiao_ji (小薊)

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛寒者慎用`
  - **目前英文**: `Use cautiously in Spleen-Stomach Deficiency-Cold.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.xiao_mai (小麥)

- **欄位**: `actions_en`
  - **中文原文**: `養心安神、除煩`
  - **目前英文**: `Nourishes Heart Qi, calms the Spirit and relieves irritability`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Nourishes Heart Qi, calms the Spirit and relieves irritability" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 養心安神、除煩"。

### herb.xie_bai (薤白)

- **欄位**: `cautions_en`
  - **中文原文**: `薤白辛、苦,溫;陰虛及發熱者慎用。`
  - **目前英文**: `Xie Bai is acrid, bitter, and warm; use cautiously in Yin deficiency and in fever.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

### herb.xing_ren (杏仁)

- **欄位**: `cautions_en`
  - **中文原文**: `小毒慎用：用量過大可能中毒。`
  - **目前英文**: `Use cautiously — mildly toxic; excessive dosage may cause poisoning.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.xu_duan (續斷)

- **欄位**: `cautions_en`
  - **中文原文**: `惡雷丸：續斷忌與雷丸同用，雷丸具有散寒止痛的功效，可能與續斷的溫補功效相抵觸。`
  - **目前英文**: `Mutually inhibiting with Lei Wan — Xu Duan should not be combined with Lei Wan; Lei Wan's Cold-dispersing, pain-relieving action may conflict with Xu Duan's warming tonic effect.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補益肝腎`
  - **目前英文**: `Tonifies the Liver and Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Liver and Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補益肝腎"。

### herb.xuan_fu_hua (旋覆花)

- **欄位**: `cautions_en`
  - **中文原文**: `體虛便溏者慎用。`
  - **目前英文**: `Use cautiously in debilitated patients with loose stools.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.xuan_shen (玄參)

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.yan_hu_suo (延胡索)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用：延胡索對孕婦可能產生不良影響，使用時應諮詢醫師。`
  - **目前英文**: `Use cautiously in pregnancy — Yan Hu Suo may adversely affect pregnancy; consult a physician before use.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `肝腎功能不全及心律失常者慎用：患有肝腎功能不全或心律失常等疾病的患者，應在醫師指導下使用延胡索。`
  - **目前英文**: `Use cautiously in hepatic or renal insufficiency and arrhythmia — patients with these conditions should use Yan Hu Suo only under medical supervision.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.yi_mu_cao (益母草)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛血少慎用：益母草具有活血化瘀的功效，陰虛血少者服用後可能會加重血虛症狀。`
  - **目前英文**: `Use cautiously in Yin deficiency with scanty Blood — Yi Mu Cao invigorates Blood and dispels stasis; use may worsen Blood deficiency in this pattern.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `月經過多者慎用：月經過多者服用益母草可能會加重月經過多的情況。`
  - **目前英文**: `Use cautiously in heavy menstrual flow — use may worsen heavy menstrual flow.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `體質虛弱、脾虛泄瀉者慎用：益母草有利水作用，體質虛弱、脾虛泄瀉者服用後可能會加重症狀。`
  - **目前英文**: `Use cautiously in weak constitution or Spleen-deficiency diarrhea — Yi Mu Cao has a diuretic action; use may worsen symptoms in these patterns.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `與某些藥物合用時慎用：益母草有促進藥物吸收的作用，與某些藥物同時使用可能會增加藥物副作用或影響療效。`
  - **目前英文**: `Use cautiously with certain medications — Yi Mu Cao may promote drug absorption; concurrent use with certain medications may increase side effects or affect efficacy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.yi_tang (飴糖)

- **欄位**: `actions_en`
  - **中文原文**: `緩中補虛、生津潤燥`
  - **目前英文**: `Moderates the Middle and tonifies deficiency; generates fluids and moistens dryness`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Moderates the Middle and tonifies deficiency; generates fluids and moistens dryness" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 緩中補虛、生津潤燥"。

### herb.yi_yi_ren (薏苡仁)

- **欄位**: `cautions_en`
  - **中文原文**: `糖尿病患者慎用：薏苡仁中含有一定量的澱粉質，糖尿病患者在使用薏苡仁時應謹慎，以避免影響血糖水平。`
  - **目前英文**: `Use cautiously in diabetes — Yi Yi Ren contains starch that may affect blood glucose levels.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.yi_zhi_ren (益智仁)

- **欄位**: `cautions_en`
  - **中文原文**: `腸胃疾病患者慎用：易致腹瀉、脹氣等不適。`
  - **目前英文**: `Use cautiously in gastrointestinal disease — may readily cause diarrhea, bloating, and other discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `高血壓患者慎用：可能增加血壓。`
  - **目前英文**: `Use cautiously in hypertension — may raise blood pressure.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.yin_chen_hao (茵陳蒿)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.yin_yang_huo (淫羊藿)

- **欄位**: `actions_en`
  - **中文原文**: `補陽`
  - **目前英文**: `Tonifies Yang`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Yang" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補陽"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

- **欄位**: `actions_en`
  - **中文原文**: `補腎`
  - **目前英文**: `Tonifies the Kidneys`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Kidneys" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補腎"。

### herb.ying_su_ke (罌粟殼)

- **欄位**: `actions_en`
  - **中文原文**: `澀腸止瀉`
  - **目前英文**: `Astringes the intestines and stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Astringes the intestines and stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 澀腸止瀉"。

### herb.yu_jin (鬱金)

- **欄位**: `cautions_en`
  - **中文原文**: `鬱金辛、苦,寒;陰虛失血及無氣滯血瘀者慎服,孕婦慎用。`
  - **目前英文**: `Yu Jin is acrid, bitter, and cold; use cautiously in Yin deficiency with bleeding and in the absence of Qi stagnation and Blood stasis; use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.yu_li_ren (郁李仁)

- **欄位**: `cautions_en`
  - **中文原文**: `郁李仁辛、苦、甘,平,質潤滑利;脾虛便溏者及孕婦慎用。`
  - **目前英文**: `Yu Li Ren is acrid, bitter, and sweet, neutral, moist and sliding in nature; use cautiously in Spleen deficiency with loose stools and in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `忌牛、馬肉：鬱李仁與牛、馬肉相剋，食用後可能引起腹痛、嘔吐等不適症狀。`
  - **目前英文**: `Mutually restrains beef and horse meat — concurrent consumption may cause abdominal pain, vomiting, and other discomfort.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.yu_xing_cao (魚腥草)

- **欄位**: `cautions_en`
  - **中文原文**: `患有胃潰瘍、十二指腸潰瘍者慎用，因魚腥草會刺激胃酸分泌，加重病情。`
  - **目前英文**: `Use cautiously in peptic or duodenal ulcer — it may stimulate gastric acid secretion and worsen the condition.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.yu_zhu (玉竹)

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.yuan_zhi (遠志)

- **欄位**: `cautions_en`
  - **中文原文**: `腎臟功能不全的患者慎用。`
  - **目前英文**: `Use cautiously in renal insufficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `益智`
  - **目前英文**: `Boosts the intellect`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Boosts the intellect" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益智"。

### herb.ze_lan (澤蘭)

- **欄位**: `cautions_en`
  - **中文原文**: `無瘀血者慎服：澤蘭具有活血化瘀的作用，無瘀血者慎用。`
  - **目前英文**: `Use cautiously without Blood stasis — Ze Lan invigorates Blood and dispels stasis; use cautiously in the absence of Blood stasis.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.ze_xie (澤瀉)

- **欄位**: `actions_en`
  - **中文原文**: `澀精止遺`
  - **目前英文**: `Drain Lower Jiao Damp-Heat`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Drain Lower Jiao Damp-Heat" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 澀精止遺"。

### herb.zhe_bei_mu (浙貝母)

- **欄位**: `cautions_en`
  - **中文原文**: `浙貝母苦寒,脾胃虛寒及寒痰、濕痰者慎用。`
  - **目前英文**: `Zhe Bei Mu is bitter and cold; use cautiously in Spleen-Stomach Deficiency-Cold and in Cold-Phlegm or Damp-Phlegm patterns.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `散結`
  - **目前英文**: `Dissipates nodules`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Dissipates nodules" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 散結"。

### herb.zhen_zhu_mu (珍珠母)

- **欄位**: `functions_zh`
  - **中文原文**: `清肝明目（課件：與石決明功效相近，列為第二線用藥）`
  - **目前英文**: `Pacifies the Liver and anchors ascendant Yang; Calms the Spirit and settles fright; Clears the Liver and improves vision (course entry: similar to abalone shell, ranked as a second-line herb); Promotes healing and reduces itching (topical use for eczema and non-healing sores); Neutralizes stomach acid and relieves pain (similar to Mu Li; for peptic ulcer/acid regurgitation and stomach pain)`
  - **問題分析**: 功效欄位包含課件說明/備註文字（文章或備註傾倒）。
  - **建議修法**: 精簡提煉短標籤，說明移至 notes_zh 或 clinical_use_note。

- **欄位**: `actions_en`
  - **中文原文**: `平肝潛陽`
  - **目前英文**: `Pacifies the Liver and anchors ascendant Yang`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Pacifies the Liver and anchors ascendant Yang" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 平肝潛陽"。

- **欄位**: `actions_en`
  - **中文原文**: `收斂生肌、止癢（外用治濕疹、久不癒瘡瘍）`
  - **目前英文**: `Promotes healing and reduces itching (topical use for eczema and non-healing sores)`
  - **問題分析**: 中文功效包含「止/平/安/定/瀉」，但英文動作 "Promotes healing and reduces itching (topical use for eczema and non-healing sores)" 缺乏相對應的治止動詞。
  - **建議修法**: 建議改為明確動詞短語，如 "Relieve / Stop / Calm 收斂生肌、止癢（外用治濕疹、久不癒瘡瘍）"。

### herb.zhi_gan_cao (炙甘草)

- **欄位**: `actions_en`
  - **中文原文**: `補脾和胃`
  - **目前英文**: `Tonifies the Spleen and harmonizes the Stomach`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies the Spleen and harmonizes the Stomach" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補脾和胃"。

- **欄位**: `actions_en`
  - **中文原文**: `益氣復脈`
  - **目前英文**: `Tonifies Qi and restores the pulse`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi and restores the pulse" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 益氣復脈"。

### herb.zhi_ke (枳殼)

- **欄位**: `cautions_en`
  - **中文原文**: `孕婦慎用。`
  - **目前英文**: `Use cautiously in pregnancy.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `脾胃虛弱及氣虛者慎用。`
  - **目前英文**: `Use cautiously in Spleen-Stomach deficiency and Qi deficiency.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.zhi_mu (知母)

- **欄位**: `cautions_en`
  - **中文原文**: `脾虛便溏者慎用：知母性涼，容易傷脾胃，對於脾虛便溏者使用不當，可能會引起腹瀉等不良反應。`
  - **目前英文**: `Use cautiously in Spleen deficiency with loose stools — Zhi Mu's cool nature can readily injure the Spleen and Stomach; improper use may cause diarrhea and other adverse reactions.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

- **欄位**: `cautions_en`
  - **中文原文**: `結石患者慎用：知母具有利尿作用，容易促進結石的形成，對於結石患者使用不當，可能會加重病情。`
  - **目前英文**: `Use cautiously in patients with stones — Zhi Mu's diuretic action may promote stone formation; improper use may worsen the condition.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.zhi_shi (枳實)

- **欄位**: `actions_en`
  - **中文原文**: `止瀉`
  - **目前英文**: `Stops diarrhea`
  - **問題分析**: 中文功效包含「清/瀉/祛/除/散」，但英文動作 "Stops diarrhea" 缺乏 Clear / Drain / Dispel / Expel / Disperse 等清祛動詞。
  - **建議修法**: 建議修正英文為 "Clear / Dispel / Drain 止瀉"。

- **欄位**: `actions_en`
  - **中文原文**: `補氣`
  - **目前英文**: `Tonifies Qi`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Tonifies Qi" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 補氣"。

### herb.zhi_zi (梔子)

- **欄位**: `modern_functions_en`
  - **中文原文**: `Analgesic activity`
  - **目前英文**: `Analgesic activity`
  - **問題分析**: 欄位 modern_functions_en 中存在完全重複的詞條 "Analgesic activity"。
  - **建議修法**: 刪除重複詞條，保持標籤簡潔專一。

### herb.zhu_ji_sui (豬脊髓)

- **欄位**: `actions_en`
  - **中文原文**: `填精補髓`
  - **目前英文**: `Replenishes Jing and fills the marrow`
  - **問題分析**: 中文功效包含「補/益/養/滋」，但英文動作 "Replenishes Jing and fills the marrow" 缺乏 Tonify / Nourish / Supplement / Enrich 等補益動詞。
  - **建議修法**: 建議修正英文為 "Tonify / Nourish 填精補髓"。

### herb.zi_su_ye (紫蘇葉)

- **欄位**: `cautions_en`
  - **中文原文**: `陰虛而見寒熱、惡寒或頭痛者慎用；火升嘔吐者亦慎用。`
  - **目前英文**: `Use cautiously for Yin deficiency presenting with chills-fever, aversion to cold or headache, and for vomiting from flaring Fire.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

### herb.zi_su_zi (紫蘇子)

- **欄位**: `cautions_en`
  - **中文原文**: `脾虛便溏者慎用`
  - **目前英文**: `Use cautiously in Spleen deficiency with loose stools.`
  - **問題分析**: 中文禁忌包含「慎用/禁用/忌」，但對應英文缺乏 Caution / Avoid / Contraindicated 等警示詞。
  - **建議修法**: 英文應補上 "Use with caution in..." 或 "Contraindicated in..." 前綴。

---

## 結語與後續處理建議

1. 本報告為唯讀稽核結果，已完全遵循「唯讀不改 `herb_canon_shortlist.json`」原則。
2. 建議後續交由 Claude 或 Ting 批次檢視上述疑義，並透過腳本統一將 Missing Caution Prefixes（補齊 "Use with caution in..." 前綴）及刪除重複陣列項（Deduplication）進行安全修正。

# CR-010 正式需求單 v1 — 西醫病名「常用 300」detail 素材

發單:Fable(Ting 授權轉交)。**單一系列:只做這一單,做完才有下一單。**
交付物 = **研究素材包(MD)**,不是最終 JSON —— 卡片落庫由 Sonnet 照模板+驗證器做,
你的工作是把「有據可查的內容素材」按下述結構備齊。

## 背景(自帶脈絡,不需讀 repo)

AcuTing OS 的西醫病名庫(`cond.*`)現有 **209 張卡**(id 清單以
`data/pathology/condition_canon_shortlist.json` 於 GitHub `guot-beep/acuting-os`
branch `codex/pattern-v2` 最新版為準)。雙層目標:骨架無上限(另批處理,與你無關)、
**常用 300 張要完整內容** —— 你supply的就是這個 detail 層的素材。

## 你要交付的東西

**每批 20–25 個病名一個 MD 檔**,檔名 `CR010_DETAIL_BATCH_<NN>_v1.md`,
每個病名一節,含以下小節(缺哪節就明寫「查無,查過:<來源清單>」,不要編):

1. **識別**:中文名(臺灣慣用)、英文名、常用別名(中英成對)、ICD-10 code。
2. **一段話定義**(中文;英文可由中文忠實翻譯,你給中文為主即可)。
3. **西醫脈絡與病理生理**:機轉、受影響結構、關鍵路徑(荷爾蒙/神經/發炎)。
4. **危險因子**(逐條結構化):
   `factor(具體因子)· direction(increases|decreases)· modifiable(true|false)· source`
5. **Red flags(最重要,逐條結構化,絕不虛構)**:
   `finding(具體發現)· urgency_level(emergency|same_day|urgent|routine|monitor)·
   recommended_action · rationale · source`
6. **針灸範圍三件套**(供 acupuncture_scope 欄位):
   `can_treat(適應範圍:症狀緩解/輔助/不適用)· precautions(部位/深度/體位限制)·
   co_management(該跟誰配合;只能寫「聯絡開藥醫師」,永不寫「建議停藥」)`
   每條標證據級:`guideline | label_derived | course | clinical_judgment | unknown`
   (unknown 是合法初始值,不是缺陷 —— 寧可 unknown 不要編)。
7. **常見證型傾向**(選填):此病臨床上**可能重疊**的中醫證型(肝陽上亢等,
   中文名即可)。**多對多,絕無等同** —— 禁止「X 病 = Y 證」句式。
8. **主要症狀**(前 3–5 個,問診視角)。

## 來源紀律(硬規則)

- 每一個事實條目附:**來源名 + URL + 擷取日期 + 支持該句的原文短句**。
- 優先序:臨床指引/官方(NICE/AHA/ACOG/UpToDate 類)> MedlinePlus/CDC/NIH >
  教科書 > 綜述。**紅旗與療效宣稱只准用前兩級。**
- URL 必須當下真的打得開且原文真的支持該句(我們剛燒掉一個引用目錄頁
  冒充來源的案例,會逐條抽查)。
- 機轉 ≠ 療效;動物研究 ≠ 臨床證據;相關 ≠ 因果。

## 範圍與順序

1. **先做 delta 計算**:對 209 張現有卡,列出 (a) 哪些已有 detail 不用做、
   (b) 哪些是骨架要補素材、(c) 常用 300 裡還缺哪些名字。以你的臨床常用度
   判斷排批次:第一批 = 門診最常見(高血壓/糖尿病/GERD/失眠/過敏性鼻炎級)。
2. 每批交付後停,等 Fable 驗收回饋再做下一批(批間可修規格)。
3. 目標總量:直到常用 300 的 detail 素材齊。

## 驗收標準(Fable 逐批檢查)

- [ ] 紅旗每條五欄齊 + 前兩級來源
- [ ] 危險因子每條四欄齊
- [ ] 無「等同」句式、無因果語言、無療效誇大
- [ ] 抽查 URL 打得開且原文支持
- [ ] 查無的小節誠實標記查過的來源

交付位置:ZIP 或 MD 直接給 Ting,存 `C:\Projects\acupuncture-point-app-pattern-v2\`
慣例位置;Fable 自取。

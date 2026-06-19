# AcuTing OS / 針灸穴位資料庫 Acupoint Atlas

## GitHub / Mobile / Public Site Boundary

- This project is GitHub-ready as a private repository workspace.
- A private GitHub repo is useful for backup and collaboration, but phone access requires a hosted website URL.
- For private phone access, deploy this static app to a protected URL through Vercel, Cloudflare Pages, Netlify, or an acuting.com private staging workflow.
- The future public English website should be treated as `AcuTing Learn`, separate from private AcuTing OS clinical notes.
- The acuting.com public workflow can use `PUBLIC_HANDOFF_FOR_ACUTING_COM.md` and `data/learn/public_knowledge_architecture.json` as the handoff map.
- Do not commit or publish identifiable patient information.

Deployment notes: `DEPLOYMENT.md`


這是一個可直接在瀏覽器使用的本地 HTML 小工具，也是 AcuTing OS 的第一階段。短期目標是建立專業中英雙語針灸穴位資料庫；長期目標是整合 Acupuncture、Herbal formulas、Pathology、NCCAOM、Bastyr、Clinical Pearls、Social Media Ideas 與 Personal Notes。

## AcuTing OS 資料層

目前採用分層資料庫設計，避免把定位、解剖、考試重點、實證和個人筆記混在一起。

```text
data/
  acupoints/
    361.json
    schema.json
  anatomy/
    muscles.json
    bones.json
    nerves.json
    vessels.json
    danger_zones.json
  nccaom/
    high_yield.json
  evidence/
    conditions.json
  visual_atlas/
    individual_2d_sources.json
  clinical_pearls/
    pearls.json
  herbs/
    formulas.json
    single_herbs.json
  pathology/
    conditions.json
  bastyr/
    notes.json
  social_media/
    ideas.json
  personal_notes/
    notes.json
  sources/
    source_registry.json
```

### Source Tiers

- 第一層 Authority Core：WHO Standard Acupuncture Point Locations，負責 361 穴、經絡、標準定位、國際代碼、骨性標誌與骨度分寸。
- 第二層 Anatomy：TeachMeAnatomy，負責肌肉、神經、血管與危險區域。
- 第三層 Anatomy Reference：Kenhub，作為漂亮圖片、英文解剖名詞與學習輔助參考，不整站抓取。
- 第四層 Clinical Imaging：Radiopaedia，日後用於 CT/MRI/橫切面解剖與診所進階理解。
- NCCAOM Layer：官方 Content Outline，用於 Board Focus、High Yield、Exam Pearls、Quiz Mode。
- Evidence Layer：Evidence Based Acupuncture，用於 condition、evidence、systematic review、clinical use。
- Herbal Layer：American Dragon 可作中藥/方劑中英文參考，但不作唯一來源。
- Visual Atlas Layer：Wikimedia、Gray's Anatomy、Anatomography，用於固定平面 2D 個別部位圖，例如頭面、手腕、足踝、胸腹、背腰骶。

來源、用途與擷取欄位記錄在 `data/sources/source_registry.json`。

## 使用方式

1. 直接打開 `index.html`。
2. 用搜尋框查中文、英文、代碼、位置、功效或證型。
3. 使用「穴道大全」依經絡、身體部位、常用臨床主題瀏覽穴位。
4. 點選穴位卡片進入單穴文章頁。
5. 用「新增穴位」或「編輯」更新資料。
6. 用「匯出 JSON」備份資料。
7. 用「匯入 JSON」把備份資料或整理好的穴位資料放回 app。

## 資料保存

編輯後的資料會存在目前瀏覽器的本機儲存空間。若換瀏覽器、清除瀏覽資料或換電腦，請先匯出 JSON 備份。

## 注意

內建資料是學習與索引用途，位置與功效需由合格中醫、針灸或相關專業訓練判讀，不能取代診斷或治療。

## 參考來源方向

內建資料以標準穴位命名、常見教學定位、傳統功能與安全提醒整理，文字經過重新撰寫，避免直接複製單一來源。

- WHO / Western Pacific Region acupuncture nomenclature and point-location standardization
- AcuPoints.org English acupoint and meridian index: https://www.acupoints.org/
- CloudTCM acupuncture point database: https://cloudtcm.com/acupoint
- Auricular therapy review and ear microsystem background: https://pmc.ncbi.nlm.nih.gov/articles/PMC4499168/
- Auriculotherapy overview and safety/evidence caveats: https://en.wikipedia.org/wiki/Auriculotherapy
- 93 耳針國標文字後設資料（陳擎文老師工作小組）: https://acupun.site/point_list_Ear93GB.aspx?pointId=AT4
- A+醫學百科《針灸學/耳針療法》耳廓解剖、耳穴分布與耳針操作參考: https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95
- Human anatomical regions image used for front/back reference: https://en.wikipedia.org/wiki/List_of_human_anatomical_regions
- NIH NCCIH acupuncture safety and evidence overview
- Memorial Sloan Kettering and academic medical center acupressure patient-education materials
- Common Traditional Chinese Medicine acupoint teaching references
- Clinical anatomy and palpation-based localization

## 更新建議

若要建立更完整的學習資料庫，建議每次新增資料時至少保留這些欄位：

- `code`: 標準穴位代碼，例如 `LI4`
- `nameZh`: 中文名
- `nameEn`: 英文名
- `pinyin`: 拼音
- `meridian`: 經絡，中英並列
- `location`: 定位，優先使用標準骨度分寸與解剖標誌
- `locationEn`: 英文定位
- `anatomy`: 解剖名詞中英對照，例如 `胸鎖乳突肌 = sternocleidomastoid muscle`
- `functions`: 傳統功能
- `functionsEn`: 英文功效
- `patterns`: 常見證型
- `patternsEn`: 英文證型
- `evidence`: 現代醫學或研究提醒
- `techniqueNotes`: 手法建議，整合針刺深度、角度/方向、手法、補瀉、艾灸與禁忌
- `cautions`: 禁忌與安全注意
- `sources`: 資料來源網址

操作欄位屬於高風險臨床資訊，前台先用一個 `techniqueNotes` 欄位保持簡潔；底層 schema 仍可保留深度、角度、補瀉、艾灸等細分欄位，等逐穴核對專業教材、授權資料庫或正式訓練內容後再填。

## 資料庫更新進度

目前採取「逐條經絡完成」策略，避免一次匯入大量粗糙資料。

- 缺失盤點：`data/audits/missing_report.json` 已建立，目前標準 361 穴資料層有 210 筆，尚缺 151 筆；下一批建議 KI1-KI27。
- 圖像策略：目前已停止製作與內嵌穴位圖片、人體圖、耳穴圖與 canvas 視覺模型。AcuTing OS 先專注資料庫、分類、單穴文章頁、病例系統與手機友善介面；需要看圖時使用外部來源連結。
- 肺經 Lung / LU：已補齊 LU1-LU11，其中 LU2、LU3、LU4、LU6、LU8、LU10、LU11 已於本輪新增中英文定位、功效、證型、安全提醒與來源。
- 大腸經 Large Intestine / LI：已補齊 LI1-LI20，其中 LI1、LI2、LI3、LI5、LI6、LI7、LI8、LI9、LI10、LI12、LI13、LI14、LI15、LI16、LI17、LI18、LI19 已於本輪新增。
- 胃經 Stomach / ST：已補齊 ST1-ST45，其中 ST1-ST24、ST26-ST35、ST37-ST39、ST41-ST43、ST45 已於本輪新增。
- 脾經 Spleen / SP：已補齊 SP1-SP21，其中 SP1-SP8、SP11-SP21 已於本輪新增。
- 心經 Heart / HT：已補齊 HT1-HT9，其中 HT1-HT6、HT8-HT9 已於本輪新增。
- 小腸經 Small Intestine / SI：已補齊 SI1-SI19，其中 SI1-SI2、SI4-SI19 已於本輪新增。
- 膀胱經 Bladder / BL：已補強 BL1-BL67；目前 BL 已收錄 67/67，膀胱經完成。
- `data/acupoints/361.json`：已從目前 app 內建資料遷移 203 筆標準經穴，狀態為 `in_progress`，後續需逐筆用 WHO 與註冊來源驗證。
- 任脈 CV、督脈 GV：已收錄常用穴，尚未完整補齊全線。
- 耳穴 Auricular：已建立獨立分類、標準耳廓解剖詞彙與部分常用耳穴。
- 經外奇穴 Extra Points：已收錄印堂、太陽，後續可擴充四神聰、夾脊、定喘等。
- 董氏奇穴 / Master Tung：目前只確認到董景昌與 Master Tung 系統資料線索，尚未找到可直接批量整理的完整專業資料庫；下一步需補可靠來源。

建議下一批：腎經 KI1-KI27，補齊足底、內踝、下肢內側、腹胸部與鎖骨下段。

## Clinical Cases 病例紀錄

首頁已新增 `Clinical Cases / 病例紀錄` 工作區。第一版支援本機新增去識別化病例、搜尋病例、新增 SOAP note、查看 SOAP 時間線，以及獨立匯出/匯入病例 JSON。正式臨床使用前仍需注意隱私與資料備份；目前建議只使用 patient code，不輸入完整姓名、電話、地址、保險資料等直接識別資訊。

## AcuTing Learn 公開英文網站方向

已新增 `data/learn/` 作為未來公開英文學術網站資料層。此層可參考公開中醫網站的分類和頁面結構，但內容需重新翻譯、改寫並與英文權威來源交叉驗證，不直接整站照搬。建議把 `AcuTing OS` 保持為私人病例/學習系統，`AcuTing Learn` 則作為未來診所外放的英文教育內容。

## 耳穴資料

耳穴資料使用 `Auricular / 耳穴` 作為經絡分類。內建耳穴包含神門、交感、零點、內分泌、皮質下、腎上腺、肺、心、肝、腎、脾、胃、大腸、口、飢點、枕、眼、耳尖、頸椎、腰椎、膝、肩、子宮、膈、膀胱、氣管、咽喉、外鼻、降壓溝等常用點。皮質下已開始改用 93 耳針國標代碼 `AT4`，並保留外部來源連結，不在 app 內嵌圖片。

耳穴定位在不同學派與圖譜中可能略有差異，請以學習索引使用；耳豆、耳貼、耳針或刺絡操作需注意皮膚狀態、過敏、感染與專業訓練。

耳穴資料欄位會逐步對齊 93 耳針國標網站寫法：`standardCode` 保存國標/國際代碼，`standardRegion` 保存耳穴大區，`standardZone` 保存分區，`aliases` 保存別名。詳細頁會呈現代碼、中文名、英文名、定位、主治、手法與外部來源連結。

耳穴分布規律目前參考耳廓「倒置胎兒」概念整理：頭面部多在耳垂，上肢多在耳舟，軀幹與下肢多在對耳輪及其上下腳，臟腑多集中在耳甲艇與耳甲腔。後續補資料時會把每個耳穴逐步對應到這些分區。

### 耳廓標準解剖名稱

目前耳穴模組採用下列中英文對照作為標準詞彙：耳輪 = Helix、耳舟 = Scaphoid Fossa、對耳輪 = AntiHelix、三角窩 = Triangle Fossa、耳屏 = Tragus、對耳屏 = Antitragus、耳甲腔 = Inferior Concha、耳甲艇 = Superior Concha、耳垂 = Lobe、屏間切跡 = Intertragal Notch、屏上切跡 = Supratragal Notch、耳廓背面 = Posterior Surface。

## 視覺與圖片策略

AcuTing OS 目前不內嵌圖片、不使用 canvas 人體圖、不製作 AI 圖像。原因是穴位與耳穴定位需要高度精準，未審核圖像容易造成學習誤差。現階段採用：

- 文字資料庫
- 分類瀏覽
- 單穴文章頁
- 外部來源連結
- 手機友善版面

若日後取得正式授權、定位精準且經審核的 atlas 資產，再另開獨立 visual atlas layer。

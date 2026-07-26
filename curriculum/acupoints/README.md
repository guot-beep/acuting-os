# curriculum/acupoints — Ting 的針灸課件(Tier-1)

放這裡的檔案是穴位優化的**最高權威來源**,凡是與 CloudTCM/eLotus 衝突,
以課件為準(但兩者都要記錄,標明出處)。私人 repo,不會進部署(`dist/` 只含
`index.html` 引用到的檔案)。

## 放什麼
- 針灸課堂講義、穴位表、定位圖說明(14 條經絡各一份)
- 針法/手法課件(Techniques 1–3、Advanced Techniques)
- 特定穴整理(五輸、原絡、俞募、八會、交會…)、奇經八脈、經別/經筋
- 之後的頭皮針、耳針、平衡針、運動醫學、美容針法課件

**不放這裡**(依 `../README.md` 的「一份檔案只放一個資料夾」):
- 考綱本身(NCBAHM / CALE outline)→ `../board/`
- 病例討論(Case Study …)→ `../cases/`

## 這批課件的角色
1–14 號經絡 PDF 是**穴位卡的內容主幹**;Techniques 系列補的是針法(A7 的深度/
角度數字要以課件為準,不可被網路來源蓋掉);`Divergent, muscle and primary`
補的是經別/經筋/正經的關係,屬於背景知識,主要餵 `exam_pearl`。

## 格式
- **最好**:`.md` / `.txt`(直接貼文字,所有 AI 立刻可用)
- 可以:`.pdf`(檔名取清楚,例如 `acupuncture-points-lecture.pdf`)
- 圖片截圖:下策,請旁邊附一個 `.md` 把重點文字打出來

放好後我(Claude)會做**文字抽取**(像中藥那三份一樣產生 `.md`),
讓不能讀 PDF 的 AI 也能用同一份來源。

## 引用格式
`curriculum/acupoints/<file>#p<頁碼>`,寫進該欄位的 `field_sources`。

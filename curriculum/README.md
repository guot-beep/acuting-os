# curriculum/ — Ting's primary source materials (private, canonical)

This folder is the **Tier-1 authoritative source** for content generation. Every
AI (Antigravity / Codex / Claude) extracts from here **first**, then supplements
with authoritative public sites (Tier 2/3, see `docs/CONTENT_PIPELINE.md`).

Why it lives in the repo: so all agents work from the *same* material and the
same understanding — not each from a different web page. Private repo only;
these are copyrighted course materials for Ting's personal study and MUST NOT be
published to AcuTing.com or any public build.

---

## 一份檔案只放一個資料夾

最重要的規則。一堂講「不寐」的課會同時講到穴位、中藥、飲食 —— **不要複製成三份**
放進三個資料夾。它的主題是「病」,就放 `conditions/`,穴位和中藥的關聯由
`curriculum/INDEX.md`(`node scripts/index-curriculum.js` 產生)和卡片裡的
`field_sources` 串起來,**不是靠複製檔案**。複製 = 之後改了一份、另外兩份變舊,
沒有人知道哪份是對的。

### 放哪?問這一句

> 這份文件教的是**一個東西**、**一個人的問題**、還是**一條原則**?

| 它教的是 | 放這裡 |
|---|---|
| **一個東西** — 某味藥、某個方、某個穴 | `herbs/` `formulas/` `acupoints/` |
| **一個人的問題** — 教科書式的病證 / 具體某個病人 | `conditions/` / `cases/` |
| **一條原則** — 理論、診斷、西醫基礎、吃與作息 | `theory/` `western/` `lifestyle/` |
| **考試範圍本身** — outline、題庫、複習表 | `board/` |

邊界案例:
- 「淋證概論」放 `conditions/` — 雖然是中藥課教的,它談的是病。
- 「食物四性表」放 `lifestyle/` — 雖然列的是食材,它談的是怎麼吃。
- 「十八反十九畏」放 `herbs/` — 它談的是藥與藥之間,還是東西。
- 「經絡學總論」放 `theory/`;「LU 經穴位表」放 `acupoints/`。

真的兩邊都像 → 放**你之後會去翻它的那個資料夾**,然後在 `INDEX.md` 看得到就行。
選錯不是災難,複製才是。

---

## 資料夾地圖

| 資料夾 | 收什麼 | 餵養哪個卡片 |
|---|---|---|
| `herbs/` | 中藥課件、materia medica、拼音拉丁表、配伍禁忌 | 中藥卡 |
| `formulas/` | 方劑組成、加減、比較表 | 方劑卡 |
| `acupoints/` | 穴位定位、主治、針法、特定穴、耳針/頭針/平衡針 | 穴位卡 |
| `conditions/` | **病證課(中西醫結合)** — 病因病機、辨證分型、治法治則、中西醫對照 | 病證卡(核心) |
| `cases/` | **病例討論、臨床見習、跟診紀錄** — 具體某個人 | 病例庫 + 病證卡的臨床實例 |
| `lifestyle/` | **食療、飲食宜忌、作息、養生、營養學** — 地域/季節/年齡差異 | 未來的飲食生活建議層 |
| `theory/` | 基礎理論、四診、經絡學總論、醫古文 | 跨卡片的背景知識 |
| `western/` | 解剖、生理、病理、藥理、red flag、檢驗值 | 中西醫結合欄位 + 用藥安全 |
| `board/` | 考試 outline、題庫、複習清單 | 決定**做的順序**,不是內容本身 |

### 什麼時候再往下分一層
一個資料夾超過約 30 個檔就分。分法照**科別**,不照學期或課號
(學期會過去,科別不會):

```
conditions/
  內科/  婦科/  兒科/  骨傷/  皮膚/  五官/  神志/
cases/
  2026-spring-clinic/   ← 病例照「哪一輪跟診」分,找得回來
lifestyle/
  食療/  季節/  年齡族群/
```

30 個檔以下就攤平放,不要提早分 —— `herbs/` 現在 40 檔攤平,搜尋照樣好用。

---

## 病例課(`cases/`)特別注意

這是唯一一個可能出現**真實病人**的資料夾。學校的病例課件常留著年齡、日期、
甚至姓名縮寫。放進來之前把身份資訊拿掉(年齡層與性別留著,那是辨證要用的):

```
case_不寐_60F_更年期.md      ✅ 主證 + 年齡層 + 性別
case_王X明_2026-03-14.md      ❌ 姓名 + 就診日期
```

檔名帶主證,以後 `INDEX.md` 和搜尋才找得到。repo 是私有的,但去識別化是為了
你之後可以安心把某個病例當教材用、或給其他 AI 讀。

---

## 收得下的格式(愈能抽文字愈好)
- **最好:** `.md` / `.txt`(直接貼筆記 —— 每個 AI 立刻讀得到)
- 可以: `.pdf`(AI 抽文字;檔名寫清楚,例 `ma-huang-lecture.pdf`)
- 圖片(`.png/.jpg` 的投影片或表格):最後手段 —— 旁邊加一個 `.md` 把重點打字
  下來,因為不是每個 agent 讀得了圖。

丟完 PDF 後跑這兩行:

```bash
python3 scripts/extract-curriculum-text.py   # 產生同名 .md(頁碼 = ## p.N)
node scripts/index-curriculum.js             # 更新 INDEX.md,列出還缺文字版的檔
```

沒有文字版的 PDF 對半數 agent 等於不存在。抽完之後看 `INDEX.md` 的「文字版」欄:
還是 ⚠️ 的表示那份是掃描檔,抽不出字,要人工把重點打進去。

## AI 怎麼引用
值從這裡來,就在該筆記錄的 `field_sources` 寫
`curriculum/<path>#<page-or-section>`,跟 URL 一樣的寫法。Ting 的老師課件與網路
來源衝突時以課件為準,但**衝突照樣兩邊都記**(絕不安靜地丟掉一邊)。

⚠️ 抽 PDF 文字有兩個真實踩過的坑:

1. **段落順序 ≠ 視覺順序**。麻黃附近抓到的「Contraindications: Pregnancy…」
   實際上屬於**桂枝**。grep 出來的東西一定要回頭確認它掛在哪一味藥/哪一個穴
   底下,尤其是安全性欄位。
2. **多欄版面會把左右欄黏成一行**。`Herb Functions.pdf` 攤平後會出現
   `[21] Aromatic, Open Orifices • Du Zhong [W]` —— 杜仲是補陽藥,跟開竅
   完全無關,標題在左欄、藥在右欄。抽取腳本現在會偵測這種版面並改用逐欄
   重讀(XY-cut),但殘留的行仍會在該 `.md` 開頭標 🚨。**看到 🚨 就不要只憑
   單一行判斷歸屬**,要找整段連續的清單。

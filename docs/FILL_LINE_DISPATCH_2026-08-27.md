# Fill 線派工包 — 2026-08-27(Ting 裁定執行的內容側)

裁定出處:`TING_RULING_SHEET_2026-08-27` + Ting 逐項回覆(2026-08-27)。
本包是**已裁定**工作的執行單,不是提案;順序即優先序。每批完成:
相關 validator 全 PASS + `check-validation-ratchet.js` 無回歸 + 小批 push。
執行者:Codex / Antigravity(內容)、SOL(查證)。機械/gate 側已由 Claude 完成
(見 main 上 2026-08-27 各 commit),勿重做。

## 1. A13(b) · 17 張毒藥 CloudTCM 卡重整【最優先——傷人面】

範圍:**只做毒藥子集 17 張**,其餘 230 張 CloudTCM 卡 9/9 後另議(Ting 明裁)。
方法照 `docs/research_packs/HERB_CLOUDTCM_LAYER_SCAN.md`:以 33 張 template 卡
的整理流程為準;其中 3 張來源 URL 本身錯掛者**必須先重新取源**。
特別注意:佔位英文 13/17、劑量散文超上限 5/17。逐張完成後
`validate-herb-standard` + `validate-content-junk` + 開卡片眼睛讀
(假中文/隱形英文只有眼睛抓得到)。浙貝母(A11 已封存留白)排本批之後
的重寫佇列。

## 2. C3(a) · 古籍引用歸位 + 一張 tdis 骨架

Spec 全在 `docs/research_packs/CLASSICAL_REFS_ATTRIBUTION_SCAN.md` §2
(逐段 verdict:duplicate → 封存清除;only-copy → 搬家不丟):

- **臟躁**:`tdis.zang_zao` 已存在 —— 《女科經綸·胎前證下》臟躁段自
  `cond.cancer_supportive`(WRONG-TOPIC 重複)封存清除;true home 歸
  `tdis.zang_zao`(該段為胎前語境,歸卡時保留語境註記)。
- **積滯**:`tdis.ji_zhi` 已存在 —— 照掃描檔對應段落同法歸位。
- **斑疹**:無卡。**鑄 `tdis.ban_zhen`(斑疹,溫病發疹類)skeleton**
  (照 D23 骨架規格:review_status="skeleton"、taxonomy 掛溫病/外感類、
  零內容宣稱),把「溫熱病斑疹」段(現重複掛在 cond.urticaria #37 與
  cond.chronic_allergies #51,皆 ADJACENT)歸入,兩張 cond 卡原位封存清除。
- 其餘 4 項照掃描檔各自 verdict 執行(#40 recurrent_uti 的癃閉段等)。

## 3. A18-3 · pattern.phlegm_misting_heart 補第二個鑑別

模板要求至少 2 個 differential;現只有痰火擾心。候選:痰濁蒙蔽清竅/中風閉證。
需新寫鑑別文字 —— 具名來源(統編《中醫診斷學》層級即可,照 A18-1 裁定:
教材通說樣板句為合法 source 類型,日後抽查)。

## 4. A1(a) · 方劑安全欄重設計 → 交 SOL

163/224 張 `contraindications_en` 與 `cautions_en` 逐位元組相同 —— 結構性缺陷。
SOL 任務:定義兩欄語意邊界(「禁用=方向詞絕對」vs「慎用=條件詞」)+ 填寫
規則;規則回來後 Sonnet 批次重灌。援引 D20:一個欄位答兩個問題就守不住。
**注意 Ting 已另裁 A2:`data/research_staging/CONTENT_REQUEST_FORMULA_CAUTION_HERB_COVERAGE.md`
由 Ting 親自貼給 SOL —— 兩案可同一次交付。**

## 5. C4 · 74 張卡樣板治療區塊清除(誠實留白)

裁定:清掉。分批(20-30/批)+ 封存進 import_artifacts + ratchet 盯著
conditions 數字只准降。清單來源:樣板句掃描(content_quality 線)。

## 6. A12(a) 後半 · 檳榔卡致癌性補寫 → SOL 查證

先行部分已完成(食療欄+public_safe 下架維持)。SOL 補:IARC Group 1、
口腔癌/口腔黏膜下纖維化敘述(具名來源);回來後 fill 線寫卡+刪減肥功效。

## 憲法提醒

只加深不刪除;移動=封存(`import_artifacts`,新寫統一
`{original_field,text,reason,moved_at,ruling}` 形——B2(a) 裁定);
兩源不合就並記;沒來源就留白。報告逐欄位列數字,禁用「完成/100%」。

# Learn 學習狀態層契約(2026-08-27)

**狀態:契約已定,內容未建。** 這份只定邊界與形狀,不建任何學習資料 ——
建了也沒用:Ting 的考試準備要等她真的開始用才知道需要什麼。
先定契約的理由只有一個:**避免未來為了 Learn 的方便而扭曲 canonical 知識層。**

## 0. 一句話規則

> **醫學事實 ≠ 學習狀態。** 前者是「黃耆補氣」,對誰都一樣、永遠為真;
> 後者是「Ting 這張卡答錯過 3 次、下次該在 9/14 複習」,只對一個人成立、
> 每天都在變。兩者不共用一列資料,永不互相污染。

## 1. 為什麼這條要先定

D8(specialty 是 tag 不是容器)已經教過一次:**為某個用途複製一份知識,
一年內兩份會漂移,而驗證器分不出哪份是對的。** Learn 有完全相同的誘惑 ——
「考試要考的欄位跟臨床要的不一樣,不如另存一份考試版」。那條路的終點是
同一張黃耆卡有兩個不同的功效敘述。

反方向的誘惑同樣要擋:**不得為了記錄學習狀態而在 canonical 記錄上加欄位。**
`herb.huang_qi.wrong_count` 這種欄位會讓知識層的 diff 每天被學習行為洗版,
而 D7 的整個價值就在於知識層的 diff 有意義。與 D9(臨床統計永不寫進正典)
同一條規矩,只是換一個來源。

## 2. 邊界

| | Canonical 知識層 | Learn 學習狀態層 |
|---|---|---|
| 位置 | `data/**`(git,公開安全) | 使用者本機(localStorage → 未來 SQLite),**不進 git** |
| 對象 | 所有人相同 | 單一使用者 |
| 變更頻率 | 低,每次變更都該被 review | 每次複習都變 |
| 引用方向 | **不知道 Learn 存在** | 以 canonical id 指向知識層 |
| 刪除語意 | 永不硬刪(D6) | 可整批清除(重設學習進度是正當操作) |

**引用是單向的。** Learn 記錄帶 `canonical_id`;canonical 記錄不帶任何
learn 欄位。要在卡片上顯示「這張你答錯過 3 次」,在 **render 時 join**,
不寫進資料 —— 與 D9 的 CG4 反向索引同一個模式。

## 3. 最小形狀(等真的要建時照這個)

```
learn_item        一個可被練習的單位
  id              learn.item.<uuid>
  canonical_id    指向 herb.* / formula.* / point / cond.* …(必填,必須解析得到)
  item_type       recall | recognition | differentiation | clinical_scenario
  prompt_source   derived_from_card | authored   ← 題目是從卡片衍生還是另寫的

learn_state       某個使用者對某個 item 的狀態(單機單人期 = 只有一份)
  item_id
  seen_count / wrong_count / last_result
  last_reviewed_at / next_review_at
  confidence      self_reported 1-5(病人自述式,不是系統推算的分數)

learn_session     一次練習
  id / started_at / ended_at / item_ids[]
```

`board_domains[]` 這類**考科歸屬**是例外:它描述的是「這個知識點屬於哪一科」,
對所有人相同,屬於知識事實 —— 可以放 canonical 記錄。分界線是
**「換一個人答案會不會變」**:會變的是狀態,不會變的是事實。

## 4. 現在不做

- 不建 item、不寫題目、不設 spaced repetition 演算法參數
- 不動任何 canonical 記錄加欄位
- 不接 UI

D14 的順序在這裡同樣適用:契約 → 形狀 → 驗證 → 才有內容。這份是第一步,
第二步等 Ting 開始準備考試時,由她的實際用法決定,不由這份文件預先想像。

## 5. 既有的 `data/learn/**` 是另一件事

那裡放的是**公開內容發布**架構(public_articles / publication_modes /
content_migration_workflow)—— 對外文章的來源與發布規則,不是學習狀態。
兩者都叫 learn 是命名巧合;若未來造成混淆,學習狀態層另取前綴(如 `study.*`),
**不改既有的 `learn.*`**(D1:id 永不改名)。

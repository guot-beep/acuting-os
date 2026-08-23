# 裁決佇列 — 2026-08-19 八小時優化場次

一句話一項,細節在各連結包。**優先順序:歸屬錯誤 > 安全內容 > 語言/覆蓋。**

## A. 歸屬錯誤(先看,會誤導讀卡的人)

1. **瀉心湯 formula.xie_xin_tang 名實不符**:卡片組成(制半夏、乾薑、芩、連、參、棗、草)
   = 《傷寒論》半夏瀉心湯;其 actions 的英文又與半夏瀉心湯共用。兩條線獨立撞出同一結論
   (PI_ACTIONS_ALIGN_HELD §attribution + SOURCE_CLASSIC_WEB conflict)。
   裁:這張卡到底是三黃瀉心湯還是半夏瀉心湯的重複?
2. **桂枝茯苓丸掛著二陳湯的 PI+actions 英文**(含 "Middke" 錯字)→ PI_ACTIONS_ALIGN_HELD。
3. **定喘湯 zh 疑為大秦艽湯評註**(去石膏細辛、「四物俱備」——定喘湯無此藥)→ 同上。
4. **黃土湯/羚角鉤藤丸 樣板假內容**(「清熱解表、調理氣血」兩方共用換名)；羚角鉤藤**丸**
   疑為羚角鉤藤**湯**重複空殼 → 同上。
5. **gui_zhi_tang.related_conditions 含 pattern.spleen_qi_deficiency**——桂枝湯↔脾氣虛
   疑錯置(2026-07-02 formula_pattern_links 草稿期資料)。
6. **茯苓丸出典**:卡片組成是指迷茯苓丸,課件寫《金匱要略》疑與桂枝茯苓丸混
   → SOURCE_CLASSIC(curriculum) SUSPECT。柴胡桂枝湯課件寫金匱、通行本出傷寒論 146 條,同包。

## B. 重複記錄 / 狀態(id 與退役是紅線,只有 Ting 能裁)

7. **玉女煎兩筆**:formula.yu_nv_jian(雙語內容豐)vs formula.yu_nu_jian(有出典/比較組)
   — naming ratchet 唯一缺陷。裁合併方向。
8. **敗毒散 formula.bai_du_san** 與 ren_shen_bai_du_san 對應同一張卡片 077。
9. **兩個匯入殘根 stub**(du_qi_wan_import_stub、fu_yuan_huo_xue_tang_import_stub,無組成)
   — 是否 review_status: deprecated。

## C. 出典 conflict(SOURCE_CLASSIC_WEB_PROPOSALS conflict 欄)

10. 知柏地黃丸《医方考》vs《醫宗金鑑》兩源不合(兩個都已記)。
11. 二仙湯/定志丸/补肺汤:同名多版本,依組成比對選版的理由在帳本 note。
12. 珍珠母丸:白名單只查得現代書;人參養榮湯課件書名異文(He Ji Ju **Tang**)。

## D. 對齊與連結覆蓋(內容在,等放行)

13. **contraindications 20 方**(orphan_en 套用即消失/damaged_zh 待確認)
    → CONTRA_ALIGN_HELD_FOR_RULING.md,裁法寫在包頭。
14. **PI/actions 58 筆**(既有 en 是意譯,忠實化=覆蓋)→ PI_ACTIONS_ALIGN_HELD_FOR_RULING.md。
15. **穴位證候配伍孤證 264 條** → ACUPOINT_PATTERN_LINKS_HELD_FOR_REVIEW.md。
16. **方劑 syndromes_zh 層 218 條**(標籤層雜訊風險)→ FORMULA_PATTERN_LINKS_SYNDROMES_HELD.md。
17. **AP Point Book 22 組複習對比**已落庫但單獨 commit(7bf67729),評級降就 revert。

## E. 排程建議(不是裁決,是下一步)

- 方劑 related_conditions 23/224:repo 無可反向接的策展源(tdis/conditions 不引用方劑),
  要嘛 Ting 策展、要嘛先做 tdis 治療連結(pattern-standard N2:23 證型零治療連結同根)。
- 中藥線 contraindications_zh 35%、actions_en 51%:依分工屬 Antigravity 回填佇列。
- 效能:knowledge_data.js 16MB + points_361.js 5.9MB 同步載入,值得排 BLUEPRINT 一節。
- BASTYR 考綱被 37 筆中藥引用但 curriculum/board/ 沒有該檔:請上傳或改敘述。
- tdis 84 筆 index-only、方歌缺(本場次收尾中)。

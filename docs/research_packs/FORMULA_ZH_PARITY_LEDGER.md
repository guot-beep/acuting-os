# FORMULA_ZH_PARITY_LEDGER — 方劑安全欄位中文補譯

Branch `codex/formula-zh-safety-parity`（自 `origin/codex/pattern-v2` @ `7b23d0c`）。
範圍：`contraindications_zh` / `cautions_zh` / `herb_drug_cautions_zh` 落後 `_en` 的欄位，
忠實翻譯既有已核准英文內容，**不新增未查證主張**。只加深不刪除。

---

## 0. 派工單「31 筆」數字更正 —— 重要，先讀這段

派工單引用 `CARD_POLISH_1_LEDGER.md §3.2`「formula 31 處」，原文寫的是
**15 筆抽樣裡的 31 個「欄位處」**（13 筆記錄、跨 `actions`/`pattern_indications`/
`contraindications`/`cautions`/`field_sources.*` 多種欄位），**不是全庫 31 筆記錄**，
也不是專指安全欄位。

本次開工先對全庫 224 筆方劑、專門針對
`contraindications_zh/en`、`cautions_zh/en`、`herb_drug_cautions_zh/en`
三類欄位重新掃描（`_en` 有條目、`_zh` 缺，即長度 `_zh < _en`），結果：

```
node scripts/build-data.js 後掃描 data/herbs/formulas.json
全庫記錄數：224
命中「_en 有 _zh 缺」的記錄數：170 筆
命中的欄位處數：291 處
```

即：**真實缺口是 170 筆／291 處，不是 31 筆。** 這個數字給 Ting／Fable 排下一批用；
本次完成下方第 1 節的 13 筆（來自 `CARD_POLISH_1_LEDGER` 已具名、已核過的樣本
＋其唯一關聯記錄 `formula.fu_yuan_huo_xue_tang`）。

**處理後重新掃描**：170 → **159 筆**（−11，完全補齊）、291 → **269 處**（−22）。
不是 170−13＝157／291−24＝267 —— 因為 `formula.fu_yuan_huo_xue_tang` 與其
`_import_stub` 兩筆各有 1 個 junk-blocked 破損英文條目（見第 2 節）刻意不譯，
兩筆仍留在缺口清單裡（差距從 1/5、1/5 縮小到 4/5、4/5），
因此完全清除的記錄數是 11 筆而非 13 筆。剩餘 159 筆清單見第 3 節
（`node` 一行指令可重現，見附錄腳本）。

---

## 1. 本批已譯（13 筆，逐筆列 before → after）

只動 `contraindications_zh` / `cautions_zh`；`herb_drug_cautions_zh/en` 在這 13 筆
均無缺口（無需處理）。每筆的 `field_sources.contraindications_zh` /
`field_sources.cautions_zh` 都新增一條翻譯出處註記，格式：
「中文譯自本筆記錄既有 `contraindications_en`/`cautions_en`（原始英文出處：…）。
本次僅補忠實中譯，未新增未查證主張 — 2026-08-11」。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 1 | `formula.gui_zhi_tang` | contraindications | 3/4 | **4/4** | 既有 3 條重排對齊英文順序（未改字），新增「暑天或天候炎熱時宜謹慎使用」譯自 en[3] |
| 1 | `formula.gui_zhi_tang` | cautions | 1/4 | **4/4** | cautions_en 與 contraindications_en 逐字相同（既有資料狀態），比照補譯 3 條 |
| 2 | `formula.xiao_jian_zhong_tang` | contraindications | 1/3 | **3/3** | 既有合併句拆為對應 3 條（陰虛火旺／嘔吐蛔蟲去甘味／中滿加減），無資訊刪除 |
| 2 | `formula.xiao_jian_zhong_tang` | cautions | 1/3 | **3/3** | 既有「陰虛內熱者禁用」保留，補譯 2 條 |
| 3 | `formula.huang_qi_jian_zhong_tang` | contraindications | 1/3 | **3/3** | 同上模式（與小建中湯共用英文來源） |
| 3 | `formula.huang_qi_jian_zhong_tang` | cautions | 1/3 | **3/3** | 同上 |
| 4 | `formula.zhen_ren_yang_zang_tang` | contraindications | 2/6 | **6/6** | 補譯 4 條（熱毒未清／氣滯／瀉痢初起／忌口）。**composition[5] 的〔字損〕損毀（actions_zh/role_reason_zh）本次未動，見第 4 節** |
| 4 | `formula.zhen_ren_yang_zang_tang` | cautions | 2/6 | **6/6** | 同上，cautions_en 與 contraindications_en 逐字相同 |
| 5 | `formula.san_ren_tang` | cautions | 0/1 | **1/1** | 新譯「本方僅適用於濕重於熱的濕熱證」。**contraindications 未動**：zh(3) > en(1) 為反方向落差，不在本次「_en 有 _zh 缺」範圍 |
| 6 | `formula.bai_du_san` | contraindications | 4/5 | **5/5** | 補譯「陰虛外感者禁用」對應 en[3]，插入正確位置 |
| 6 | `formula.bai_du_san` | cautions | 4/5 | **5/5** | 同上 |
| 7 | `formula.wu_mei_wan` | contraindications | 1/3 | **4/3**⚠️ | 補譯 3 條後，既有《傷寒論》飲食禁忌條目（與英文三條皆無對應）保留於陣列末尾 —— 中文反而多 1 條，是刻意保留不刪除，非缺陷 |
| 7 | `formula.wu_mei_wan` | cautions | 1/3 | **3/3** | 既有「孕婦慎用」對應 en[2]，補譯 en[0]/en[1] 後恰好對齊 |
| 8 | `formula.dan_shen_yin` | contraindications | 1/2 | **2/2** | 補譯「有出血傾向或出血病史者禁用」 |
| 8 | `formula.dan_shen_yin` | cautions | 1/2 | **2/2** | 同上 |
| 9 | `formula.xie_huang_san` | contraindications | 0/2 | **2/2** | 全新譯（skeleton 記錄但 `field_sources.actions_zh` 已存在，屬 template-grade）：胃陰虛／先天氣虛弄舌 |
| 9 | `formula.xie_huang_san` | cautions | 0/2 | **2/2** | 同上 |
| 10 | `formula.jing_fang_bai_du_san` | contraindications | 0/1 | **1/1** | 新譯「熱證者禁用」 |
| 10 | `formula.jing_fang_bai_du_san` | cautions | 0/1 | **1/1** | 同上 |
| 11 | `formula.hou_po_wen_zhong_tang` | contraindications | 0/1 | **1/1** | 新譯「兼氣虛或胃陰虛之腹脹、腹痛者禁用」 |
| 11 | `formula.hou_po_wen_zhong_tang` | cautions | 0/1 | **1/1** | 同上 |
| 12 | `formula.fu_yuan_huo_xue_tang`（正式記錄，非 stub） | contraindications | 2/4 | **4/4** | 補譯「若服用本方導致腹瀉未能痊癒，宜改用他方」「體虛氣血不足者禁用」，既有 2 條重排對齊 |
| 12 | `formula.fu_yuan_huo_xue_tang` | cautions | 1/5 | **4/5**⚠️ | en[4]「Contraindicated for those with **for those with** Spleen Deficiency.」文法重複破損、與 en[3] 語意重複 → **junk-blocked，不翻譯**，見第 2 節 |
| 13 | `formula.fu_yuan_huo_xue_tang_import_stub`（`review_status: deprecated`，派工單具名） | contraindications | 1/5 | **4/5**⚠️ | 與 #12 同一組破損 en[4] junk-blocked；其餘 4 條比照 #12 補譯（stub 已依既有 `id_fix_note` 標記為退役重複記錄，內容仍同步更新，不刪除） |
| 13 | `formula.fu_yuan_huo_xue_tang_import_stub` | cautions | 1/5 | **4/5**⚠️ | 同上 |

**本批合計：13 筆記錄、24 個欄位、新增 30 條忠實翻譯**（不含既有條目重排）。

---

## 2. Junk-blocked（依派工單例外條款，不翻譯，留不對齊）

| id | 欄位 | 破損 en 條目 | 判定理由 |
|---|---|---|---|
| `formula.fu_yuan_huo_xue_tang` | `cautions_en[4]` | `"Contraindicated for those with for those with Spleen Deficiency."` | 「for those with」重複兩次，文法明顯破損；且與同陣列 en[3]「Use with caution for those with Spleen Deficiency.」語意重複（僅程度詞從 caution 變 contraindicated）。翻譯破損英文等於把資料損壞洗成看起來正常的中文，故不譯，留 zh(4)/en(5) 不對齊 |
| `formula.fu_yuan_huo_xue_tang_import_stub` | `contraindications_en[4]` / `cautions_en[4]` | 同上（stub 與正式記錄的英文陣列逐字相同） | 同上 |

未發現本批 13 筆內有派工單所述「Review pregnancy review before clinical use.」樣板句
那一類（那一類目前查到集中在 `herb_canon_shortlist.json` 的 `english_exam_track.contraindications`，
不在 `formulas.json`）。

---

## 3. 記帳未動：全庫剩餘缺口清單（170 筆 → 本批處理後 → 159 筆）

**parity-break 記錄數：31（派工單誤引數字）→ 170（全庫真實數字）→ 159（本批後剩餘）。**

以下是**本批修改並跑過 `build-data.js` 之後**重新掃描的實際輸出（非事先推算），
含 `formula.fu_yuan_huo_xue_tang` 與 `_import_stub` 兩筆因 junk-blocked 條目
（第 2 節）縮小但未清零的殘餘缺口。格式 `contraindications:zh/en, cautions:zh/en`：

```
formula.ma_huang_tang contraindications:4/11, cautions:6/11
formula.xiao_qing_long_tang contraindications:4/7, cautions:2/8
formula.jiu_wei_qiang_huo_tang cautions:0/2
formula.yin_qiao_san cautions:0/2
formula.sang_ju_yin cautions:0/1
formula.chai_ge_jie_ji_tang cautions:0/3
formula.sheng_ma_ge_gen_tang contraindications:0/4, cautions:0/4
formula.jia_jian_wei_rui_tang contraindications:0/1, cautions:0/1
formula.bai_hu_tang contraindications:4/7, cautions:0/7
formula.zhu_ye_shi_gao_tang contraindications:2/4, cautions:0/4
formula.huang_lian_jie_du_tang cautions:0/3
formula.liang_ge_san contraindications:2/3, cautions:2/3
formula.qing_ying_tang contraindications:0/1, cautions:0/1
formula.xi_jiao_di_huang_tang contraindications:0/3, cautions:0/3
formula.dao_chi_san cautions:1/2
formula.long_dan_xie_gan_tang cautions:2/3
formula.qing_wei_san contraindications:1/2, cautions:0/2
formula.xie_bai_san contraindications:0/2, cautions:0/2
formula.yu_nv_jian contraindications:0/1, cautions:0/1
formula.shao_yao_tang contraindications:0/2, cautions:0/2
formula.bai_tou_weng_tang contraindications:1/2, cautions:1/2
formula.qing_hao_bie_jia_tang contraindications:1/2, cautions:0/2
formula.qing_gu_san contraindications:0/1, cautions:0/1
formula.wu_wei_xiao_du_yin contraindications:2/3, cautions:2/3
formula.da_cheng_qi_tang contraindications:2/10, cautions:1/10
formula.xiao_cheng_qi_tang cautions:1/2
formula.tiao_wei_cheng_qi_tang cautions:1/2
formula.da_huang_mu_dan_tang contraindications:1/6, cautions:1/6
formula.ma_zi_ren_wan cautions:1/3
formula.xiao_chai_hu_tang contraindications:3/7, cautions:2/11
formula.xiao_yao_san contraindications:1/2, cautions:1/3
formula.jia_wei_xiao_yao_san contraindications:1/4, cautions:1/4
formula.tong_xie_yao_fang cautions:0/2
formula.ban_xia_xie_xin_tang cautions:0/2
formula.li_zhong_wan cautions:2/4
formula.fu_zi_li_zhong_wan contraindications:2/4, cautions:2/4
formula.si_ni_tang cautions:0/2
formula.wu_zhu_yu_tang contraindications:1/3, cautions:0/3
formula.dang_gui_si_ni_tang contraindications:1/3, cautions:1/3
formula.si_jun_zi_tang cautions:0/2
formula.liu_jun_zi_tang cautions:0/2
formula.shen_ling_bai_zhu_san contraindications:1/4, cautions:1/5
formula.yu_ping_feng_san contraindications:1/2, cautions:0/2
formula.sheng_mai_san cautions:0/4
formula.ren_shen_yang_rong_tang contraindications:0/1, cautions:0/1
formula.si_wu_tang cautions:1/8
formula.tao_hong_si_wu_tang contraindications:0/1
formula.jiao_ai_tang contraindications:0/1, cautions:0/1
formula.dang_gui_bu_xue_tang contraindications:1/2, cautions:1/2
formula.ba_zhen_tang cautions:0/1
formula.shi_quan_da_bu_tang cautions:0/1
formula.taishan_pan_shi_san contraindications:0/1, cautions:0/1
formula.liu_wei_di_huang_wan contraindications:1/3, cautions:1/3
formula.zuo_gui_wan contraindications:1/3, cautions:0/4
formula.you_gui_wan cautions:0/2
formula.qi_ju_di_huang_wan contraindications:1/2, cautions:1/2
formula.zhi_bai_di_huang_wan contraindications:1/2, cautions:1/2
formula.shen_qi_wan contraindications:4/6, cautions:4/7
formula.jin_gui_shen_qi_wan cautions:4/7
formula.zhi_gan_cao_tang cautions:1/3
formula.yi_guan_jian cautions:0/1
formula.mu_li_san contraindications:0/1, cautions:0/1
formula.si_shen_wan contraindications:0/2, cautions:0/2
formula.jin_suo_gu_jing_wan contraindications:1/4, cautions:1/4
formula.sang_piao_xiao_san contraindications:1/2, cautions:1/2
formula.suo_quan_wan contraindications:0/1, cautions:0/1
formula.yue_ju_wan cautions:0/1
formula.chai_hu_shu_gan_san contraindications:0/1, cautions:0/1
formula.ban_xia_hou_po_tang contraindications:1/3, cautions:1/3
formula.su_zi_jiang_qi_tang cautions:0/2
formula.xue_fu_zhu_yu_tang contraindications:3/4, cautions:1/4
formula.bu_yang_huan_wu_tang contraindications:4/8, cautions:2/8
formula.sheng_hua_tang contraindications:1/5, cautions:1/5
formula.shi_hui_san contraindications:1/3, cautions:0/3
formula.wen_jing_tang cautions:0/1
formula.ge_xia_zhu_yu_tang contraindications:1/2, cautions:1/3
formula.shao_fu_zhu_yu_tang contraindications:1/2, cautions:1/2
formula.ping_wei_san cautions:0/2
formula.huo_xiang_zheng_qi_san cautions:0/3
formula.wu_ling_san contraindications:3/8, cautions:0/8
formula.zhu_ling_tang contraindications:1/3, cautions:0/3
formula.er_miao_san contraindications:0/1, cautions:0/1
formula.si_miao_wan contraindications:0/1, cautions:0/1
formula.zhen_wu_tang contraindications:1/2, cautions:1/2
formula.fang_ji_huang_qi_tang cautions:0/3
formula.yin_chen_hao_tang cautions:0/2
formula.ba_zheng_san contraindications:3/5, cautions:2/5
formula.er_chen_tang cautions:0/1
formula.ban_xia_bai_zhu_tian_ma_tang cautions:0/2
formula.xiao_xian_xiong_tang cautions:0/1
formula.chuan_xiong_cha_tiao_san contraindications:1/4, cautions:0/4
formula.xiao_feng_san cautions:0/2
formula.tian_ma_gou_teng_yin cautions:0/1
formula.zhen_gan_xi_feng_tang contraindications:4/5, cautions:4/5
formula.xiao_huo_luo_dan contraindications:2/3, cautions:2/3
formula.bao_he_wan contraindications:1/2
formula.jian_pi_wan contraindications:0/1, cautions:0/1
formula.sha_shen_mai_men_dong_tang contraindications:0/1, cautions:0/1
formula.zhi_sou_san contraindications:0/4, cautions:0/4
formula.an_gong_niu_huang_wan cautions:1/2
formula.zi_xue_dan contraindications:1/4, cautions:1/4
formula.zhi_bao_dan contraindications:1/7, cautions:3/7
formula.yang_he_tang contraindications:1/4, cautions:1/4
formula.gui_pi_tang cautions:1/2
formula.bai_he_gu_jin_tang contraindications:2/3, cautions:0/3
formula.da_ding_feng_zhu contraindications:0/2, cautions:0/2
formula.du_huo_ji_sheng_tang contraindications:1/3, cautions:1/3
formula.gan_lu_xiao_du_dan cautions:0/1
formula.huai_hua_san cautions:1/4
formula.lian_po_yin contraindications:0/2, cautions:0/2
formula.ling_jiao_gou_teng_tang cautions:0/1
formula.ma_xing_shi_gan_tang contraindications:3/4, cautions:0/4
formula.mai_men_dong_tang contraindications:1/4, cautions:1/6
formula.pu_ji_xiao_du_yin cautions:0/1
formula.qian_zheng_san contraindications:3/5, cautions:1/5
formula.qing_zao_jiu_fei_tang contraindications:1/2, cautions:1/2
formula.shi_pi_san contraindications:0/1, cautions:0/1
formula.shi_xiao_san contraindications:1/2, cautions:1/3
formula.si_ni_san cautions:0/1
formula.su_he_xiang_wan contraindications:1/4, cautions:1/4
formula.tao_he_cheng_qi_tang cautions:1/2
formula.wan_dai_tang cautions:0/1
formula.xing_su_san contraindications:0/1, cautions:0/1
formula.zhi_shi_xie_bai_gui_zhi_tang contraindications:0/2, cautions:0/2
formula.zuo_jin_wan contraindications:2/3, cautions:1/3
formula.da_bu_yin_wan contraindications:0/3, cautions:0/3
formula.da_qing_long_tang contraindications:2/8, cautions:2/8
formula.dang_gui_shao_yao_san contraindications:0/1
formula.ding_zhi_wan contraindications:0/1, cautions:0/1
formula.er_zhi_wan contraindications:0/3, cautions:0/3
formula.fang_feng_tong_sheng_san contraindications:1/3, cautions:1/3
formula.fu_yuan_huo_xue_tang cautions:4/5
formula.ge_gen_huang_qin_huang_lian_tang contraindications:0/1, cautions:0/1
formula.gu_jing_wan contraindications:1/3, cautions:1/3
formula.jin_ling_zi_san contraindications:0/2, cautions:1/2
formula.liang_fu_wan contraindications:1/5, cautions:1/5
formula.nuan_gan_jian contraindications:0/1, cautions:0/1
formula.qiang_huo_sheng_shi_tang contraindications:1/6, cautions:1/6
formula.tian_tai_wu_yao_san contraindications:1/2, cautions:1/2
formula.wu_pi_san contraindications:0/2, cautions:0/2
formula.xi_jiao_di_huang_wan contraindications:0/3, cautions:0/3
formula.xiao_ji_yin_zi contraindications:1/3, cautions:1/3
formula.zeng_ye_tang contraindications:0/1, cautions:0/1
formula.xian_fang_huo_ming_yin contraindications:0/4, cautions:0/6
formula.si_miao_yong_an_tang contraindications:0/2, cautions:0/2
formula.dang_gui_nian_tong_tang contraindications:0/2, cautions:0/2
formula.jiu_xian_san contraindications:0/2, cautions:0/2
formula.tao_hua_tang contraindications:0/1, cautions:0/1
formula.gua_lou_xie_bai_bai_jiu_tang contraindications:1/4, cautions:1/4
formula.da_xian_xiong_tang contraindications:1/4, cautions:1/4
formula.da_huang_fu_zi_tang contraindications:1/2, cautions:1/2
formula.wen_pi_tang contraindications:0/1, cautions:0/1
formula.hao_qin_qing_dan_tang contraindications:0/1, cautions:0/1
formula.fu_ling_wan contraindications:0/2, cautions:0/2
formula.zhu_sha_an_shen_wan contraindications:1/5, cautions:1/5
formula.zhen_zhu_mu_wan contraindications:0/2, cautions:0/2
formula.ci_zhu_wan contraindications:1/5, cautions:1/5
formula.du_qi_wan_import_stub contraindications:1/3, cautions:1/3
formula.fu_yuan_huo_xue_tang_import_stub contraindications:4/5, cautions:4/5
```

（159 筆，欄位處數 269，來自本批修改並跑過 `build-data.js` 後的實際重新掃描，
非事先推算。）

---

## 4. 安全相關但本次刻意不動（沿用 CARD_POLISH_1_LEDGER 既有記帳）

- `formula.zhen_ren_yang_zang_tang` `composition[5]`（炙罌粟殼）`dose_g: "6-108g"`
  疑似解析錯誤，劑量異常高。**依派工單指示不動**，等 Ting 裁決。見
  `CARD_POLISH_1_LEDGER.md §4.1`。
- `formula.zhen_ren_yang_zang_tang` `composition[5]` 的 `actions_zh` / `role_reason_zh`
  為 `"緩急止痛， ，。"`〔字損〕，英文版保有「Obsolete/restricted substance in
  modern practice」管制物質警語但中文版看不到。**本次未觸碰**（不臆補），
  見 `CARD_POLISH_1_LEDGER.md §4.2`。本次只翻譯了同筆記錄的
  `contraindications_zh`/`cautions_zh`（與該〔字損〕欄位無關）。

---

## 附錄：可重現指令

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node scripts/build-data.js
node scripts/validate-formula-standard.js      # 中英未對齊 / 有禁忌 兩行數字
node scripts/check-validation-ratchet.js       # PASS — no regressions
node scripts/validate-content-junk.js          # PASS（既有 32 筆劑量樣板句無關本次）
node scripts/validate-relations.js
```

全庫掃描腳本（重新產生第 0/3 節數字）：檢查 `data/herbs/formulas.json` 的
`records[]`，對 `["contraindications","cautions","herb_drug_cautions"]` 三個欄位組，
比較 `arr(r[f+"_zh"]).length < arr(r[f+"_en"]).length`。

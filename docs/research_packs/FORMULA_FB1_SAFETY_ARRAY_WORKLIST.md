# FORMULA_FB1_SAFETY_ARRAY_WORKLIST — 安全欄長度/語義配對 worklist

狀態：**worklist only — 本檔案不修改 data/herbs/formulas.json 任何一個字元。**
來源：docs/research_packs/FORMULA_EYESON_01.md F-01/F-02，§3 FB-1（"低（只讀）"）。
產生日期：2026-08-12。範圍：`data/herbs/formulas.json` 全庫 224 筆。

重現方式：本檔案由一次性掃描腳本產生（腳本本身未寫入 repo，判準完整寫在下面每一節）；
任何人可用同樣的長度比對 / 關鍵字比對邏輯重新產生同一份清單。

**這份 worklist 不建議自動修——F-02 已指出「長度相同但索引錯位」的變體驗證器抓不到，
安全欄的重排必須人看過（桃核承氣湯 zh/en 順序整個顛倒、平胃散孕婦兩字被塞在別的索引），
逐筆判斷交給 Ting。**

⚠️ **與原 ledger 數字的差異**：FORMULA_EYESON_01.md §2 F-02 / §3 總結表寫的是「contraindications 52 筆、
cautions 18 筆」。本次對同一個 commit（1379063）重新掃描 `data/herbs/formulas.json` 用同一條長度比對邏輯
（`Array.isArray(zh) && Array.isArray(en) && zh.length !== en.length`）得到的是 **contraindications 54 筆、
cautions 21 筆**（已對 1379063 這個 commit 直接重跑驗證，非本批次修改造成）。照實回報，不回填成
ledger 原文的 52/18；差異原因未查（ledger 未附腳本，無法逐步比對判準是否相同）。

---

## §1 `contraindications_zh`.length ≠ `contraindications_en`.length — 54 筆

| id | 中文名 | zh 條數 | en 條數 |
|---|---|---|---|
| formula.ma_huang_tang | 麻黃湯 | 15 | 11 |
| formula.xiao_qing_long_tang | 小青龍湯 | 8 | 7 |
| formula.yin_qiao_san | 銀翹散 | 3 | 2 |
| formula.sang_ju_yin | 桑菊飲 | 2 | 1 |
| formula.bai_hu_tang | 白虎湯 | 6 | 7 |
| formula.zhu_ye_shi_gao_tang | 竹葉石膏湯 | 3 | 4 |
| formula.qing_wei_san | 清胃散 | 3 | 2 |
| formula.da_cheng_qi_tang | 大承氣湯 | 12 | 10 |
| formula.xiao_cheng_qi_tang | 小承氣湯 | 4 | 2 |
| formula.ma_zi_ren_wan | 麻子仁丸 | 7 | 3 |
| formula.xiao_chai_hu_tang | 小柴胡湯 | 6 | 7 |
| formula.da_chai_hu_tang | 大柴胡湯 | 2 | 1 |
| formula.xiao_yao_san | 逍遙散 | 3 | 2 |
| formula.tong_xie_yao_fang | 痛瀉要方 | 4 | 2 |
| formula.wu_zhu_yu_tang | 吳茱萸湯 | 2 | 3 |
| formula.dang_gui_si_ni_tang | 當歸四逆湯 | 2 | 3 |
| formula.shen_ling_bai_zhu_san | 參苓白朮散 | 5 | 4 |
| formula.yu_ping_feng_san | 玉屏風散 | 3 | 2 |
| formula.si_wu_tang | 四物湯 | 9 | 7 |
| formula.ba_zhen_tang | 八珍湯 | 3 | 1 |
| formula.zuo_gui_wan | 左歸丸 | 4 | 3 |
| formula.yi_guan_jian | 一貫煎 | 3 | 1 |
| formula.tian_wang_bu_xin_dan | 天王補心丹 | 2 | 1 |
| formula.ban_xia_hou_po_tang | 半夏厚朴湯 | 4 | 3 |
| formula.bu_yang_huan_wu_tang | 補陽還五湯 | 12 | 8 |
| formula.sheng_hua_tang | 生化湯 | 6 | 5 |
| formula.shi_hui_san | 十灰散 | 4 | 3 |
| formula.wen_jing_tang | 溫經湯 | 2 | 1 |
| formula.huo_xiang_zheng_qi_san | 藿香正氣散 | 5 | 3 |
| formula.wu_ling_san | 五苓散 | 11 | 8 |
| formula.zhu_ling_tang | 豬苓湯 | 4 | 3 |
| formula.san_ren_tang | 三仁湯 | 3 | 1 |
| formula.fang_ji_huang_qi_tang | 防己黃耆湯 | 5 | 3 |
| formula.yin_chen_hao_tang | 茵陳蒿湯 | 3 | 2 |
| formula.ba_zheng_san | 八正散 | 8 | 5 |
| formula.er_chen_tang | 二陳湯 | 2 | 1 |
| formula.chuan_xiong_cha_tiao_san | 川芎茶調散 | 1 | 4 |
| formula.bao_he_wan | 保和丸 | 3 | 2 |
| formula.an_gong_niu_huang_wan | 安宮牛黃丸 | 4 | 2 |
| formula.zhi_bao_dan | 至寶丹 | 8 | 7 |
| formula.gui_pi_tang | 歸脾湯 | 3 | 2 |
| formula.ding_chuan_tang | 定喘湯 | 3 | 0 |
| formula.gan_lu_xiao_du_dan | 甘露消毒丹 | 2 | 1 |
| formula.huai_hua_san | 槐花散 | 4 | 3 |
| formula.ling_jiao_gou_teng_tang | 羚角鉤藤湯 | 4 | 1 |
| formula.ma_xing_shi_gan_tang | 麻杏石甘湯 | 6 | 4 |
| formula.qing_zao_jiu_fei_tang | 清燥救肺湯 | 3 | 2 |
| formula.shi_xiao_san | 失笑散 | 1 | 2 |
| formula.wan_dai_tang | 完帶湯 | 2 | 1 |
| formula.wu_mei_wan | 烏梅丸 | 4 | 3 |
| formula.yu_nu_jian | 玉女煎 | 3 | 0 |
| formula.zuo_jin_wan | 左金丸 | 4 | 3 |
| formula.er_zhi_wan | 二至丸 | 2 | 3 |
| formula.fu_yuan_huo_xue_tang_import_stub | 復元活血湯(匯入重複殘根) | 4 | 5 |

## §2 `cautions_zh`.length ≠ `cautions_en`.length — 21 筆

| id | 中文名 | zh 條數 | en 條數 |
|---|---|---|---|
| formula.xiao_qing_long_tang | 小青龍湯 | 7 | 8 |
| formula.huang_lian_e_jiao_tang | 黃連阿膠湯 | 1 | 0 |
| formula.xiao_chai_hu_tang | 小柴胡湯 | 5 | 11 |
| formula.xiao_yao_san | 逍遙散 | 2 | 3 |
| formula.dang_gui_si_ni_tang | 當歸四逆湯 | 2 | 3 |
| formula.liu_jun_zi_tang | 六君子湯 | 1 | 2 |
| formula.shen_ling_bai_zhu_san | 參苓白朮散 | 4 | 5 |
| formula.si_wu_tang | 四物湯 | 7 | 8 |
| formula.zuo_gui_wan | 左歸丸 | 3 | 4 |
| formula.shen_qi_wan | 腎氣丸 | 6 | 7 |
| formula.jin_gui_shen_qi_wan | 金匱腎氣丸 | 6 | 7 |
| formula.suan_zao_ren_tang | 酸棗仁湯 | 1 | 0 |
| formula.ge_xia_zhu_yu_tang | 膈下逐瘀湯 | 2 | 3 |
| formula.wen_dan_tang | 溫膽湯 | 2 | 0 |
| formula.huai_hua_san | 槐花散 | 3 | 4 |
| formula.mai_men_dong_tang | 麥門冬湯 | 4 | 6 |
| formula.shi_xiao_san | 失笑散 | 2 | 3 |
| formula.er_zhi_wan | 二至丸 | 2 | 3 |
| formula.fu_yuan_huo_xue_tang | 復元活血湯 | 4 | 5 |
| formula.xian_fang_huo_ming_yin | 仙方活命飲 | 4 | 6 |
| formula.fu_yuan_huo_xue_tang_import_stub | 復元活血湯(匯入重複殘根) | 4 | 5 |

## §3 `contraindications` 長度相同但孕期關鍵字索引不對齊 — 4 筆

判準：zh 陣列裡含「孕/妊娠/懷孕/經期/經潮」的索引集合，與 en 陣列裡含 `/pregnan/i` 的索引集合不同
（可能是真的錯位，也可能是其中一邊沒有翻到、不一定是同一件事——需要人看過各筆的實際文字才能判定）。

### formula.gui_zhi_fu_ling_wan（桂枝茯苓丸）

- zh 孕期關鍵字索引：[0,1] → ["本方爲活血化淤消癥之方，如正常妊娠下血者則當慎之，孕婦及產後必須格外小心。僅用於有血瘀者。","如婦人宿有癥病又懷孕者，用本方爲良益之法，但用法應從小晝開始，不知漸加，使之下癥而不傷胎。"]
- en pregnancy 索引：[0,1,2] → ["This formula invigorates the Blood, resolves stasis and reduces masses; use with caution for vaginal bleeding during a normal pregnancy — pregnant and postpartum patients require extra caution. Use only in patients with confirmed Blood stasis.","For a woman with a pre-existing abdominal mass who later becomes pregnant, this formula may be used beneficially, but dosing should start small and be increased gradually, so as to reduce the mass without harming the fetus.","Although classical precedent permits use in pregnancy when there is a genuine indication ('having a reason, therefore no harm'), the formula should still be stopped once the condition resolves and not overused. If vaginal bleeding increases, or lower-back soreness and abdominal pain become more severe, this formula is not appropriate and the case should be re-differentiated and treated accordingly."]

### formula.ge_xia_zhu_yu_tang（膈下逐瘀湯）

- zh 孕期關鍵字索引：[0,1] → ["月經期間宜謹慎使用","孕婦禁用"]
- en pregnancy 索引：[1] → ["Contraindicated during pregnancy."]

### formula.ping_wei_san（平胃散）

- zh 孕期關鍵字索引：[0] → ["本方辛苦溫燥，易傷止耗陰，故陰虛氣滯、脾胃虛弱者以及孕婦不宜使用"]
- en pregnancy 索引：[1] → ["Use caution during pregnancy."]

### formula.tao_he_cheng_qi_tang（桃核承氣湯）

- zh 孕期關鍵字索引：[0] → ["孕婦忌：因本方為破血下瘀之劑，故孕婦禁用。"]
- en pregnancy 索引：[1] → ["Contraindicated during pregnancy."]


## §4 `cautions` 長度相同但孕期關鍵字索引不對齊 — 0 筆

---

## 數字重現

```
contraindications 長度不等：54 筆
cautions 長度不等：21 筆
contraindications 孕期關鍵字索引不對齊（長度相同）：4 筆
cautions 孕期關鍵字索引不對齊（長度相同）：0 筆
```

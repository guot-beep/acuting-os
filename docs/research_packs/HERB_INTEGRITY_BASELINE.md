# HERB_INTEGRITY_BASELINE — HB-4/5/6/8/9/10/11/12 的今日基線

狀態：**baseline ledger（唯讀）。本輪沒有動 `data/herbs/**` 一個字元。**
Branch：`codex/herb-integrity-predicates`（自 `origin/codex/pattern-v2` tip `8d24349`）
資料：`data/herbs/herb_canon_shortlist.json`，**358 筆 records**、
**1666 條 `related_formulas` 連結**；交叉比對 `data/herbs/formulas.json`（**224 筆**）。

判準來源：`docs/research_packs/HERB_EYESON_01.md` §3.4 HB 系列（24 findings 的機械化子集）。
實作：`scripts/validate-herb-integrity-predicates.js`

**一行重現**（下面每一個數字都由這一行產出，沒有手抄）：

```bash
node scripts/validate-herb-integrity-predicates.js            # 人類可讀
node scripts/validate-herb-integrity-predicates.js --worklist # 印出 HB-4b 全部 907 條、HB-11 全部 182 筆 id
node scripts/validate-herb-integrity-predicates.js --json     # 機讀（本文件的資料來源）
```

---

## §0 這八條 predicate 能保證什麼、不能保證什麼

能保證的只有結構層面：**連結解析得到 · 欄位存在 · 兩個字串是否相同 · enum 值在不在允許清單裡**。

不能保證**臨床正確性**。細辛卡可以八條全過，同時全卡查無「馬兜鈴酸」三個字
（HERB_EYESON_01.md H-09）——這條事實的缺席，本腳本沒有能力知道，因為它沒有醫學知識，
只能比對記錄裡已經存在的欄位。那一層要等具名來源落地才能升級。憲法第四條：
查不到就停下來回報，不要編。這裡沒有任何欄位被本腳本改寫或代寫。

## §0.5 與派工單「預期數字」不一致的兩條，逐一交代

**HB-4**：派工單／`docs/TING_DECISION_QUEUE.md` C6 引用「864/1666」。本腳本按 mission 文字
**字面定義**（`herb_id` 精確比對，不含中文子字串備援）重新量測得 **910**（3 條 dead_id ＋
907 條 no_herb_in_comp）。改用 HERB_EYESON_01 的 H-03 原方法（`herb_id` 或
`herb_zh` 雙向子字串備援）重新跑，得到 **862 條 / 225 張卡**——卡數與 ledger 的
「225 張卡受影響」**完全吻合**，連結數在 2 條之內。三條 dead_id 也與 ledger
「另有 3 條指向不存在的 formula id」一致。結論：225 卡的量級是同一次量測，
862–864 極可能是同一個數字；本腳本仍採用 mission 文字指定的字面定義（僅 `herb_id`），
因為那是較保守的失敗模式（即使 `herb_zh` 子字串救得回，仍先報出來），並把
「zh 可救回」的 48 條另外標記，避免有人把 910 誤讀成「910 條已確認的內容錯誤」。

**HB-8**：派工單寫「Expected: reviewed ×1, draft_reviewed ×1, undefined ×5」（共 7）。
全庫按 predicate 字面 enum（`draft` / `source_checked` / `deprecated`）重新量測得 **48**，
多出的 41 筆全部是 `sourced_cloudtcm_record`——而 HERB_EYESON_01.md 自己的 §3.1 census
早就在同一句話裡列出「source_checked 37・**sourced_cloudtcm_record 41**・reviewed 1・
draft_reviewed 1・undefined 5」。派工單的「7」讀起來像是 30 卡樣本裡 H-14 那條**不同的、
更窄的 predicate**（「review_status ≠ draft」，是流程違規，不是 enum 外）的數字，
不是這條 predicate 對全庫字面 enum 的量測。本腳本按 mission 文字定義的 enum 對全庫量測，
報 48；`sourced_cloudtcm_record` 是否該併入允許清單（它標記的是一個真實、獨立的來源類別：
CloudTCM 批次匯入）不是本腳本能決定的，留給 Ting。

---

## §1 逐條計數與 CI 級別

| # | predicate | 今日違反 | CI 級別 | 為什麼 |
|---|---|---|---|---|
| **HB-4** | `related_formulas` 每一 id 存在且該方 composition 含本味 `herb_id` | **910 條**（dead_id 3・no_herb_in_comp 907，229 卡受影響） | **NOTE** | 非零；no_herb_in_comp 半支另外卡在 C6 未裁定，dead_id 半支可獨立畢業 |
| **HB-5** | 慎用藥 flag ⇒ 禁忌欄非空 且 標準劑量非空 | **19 筆** | **NOTE** | 非零；派工單「≥17 expected」，實測 19，方向一致 |
| **HB-6** | `properties_taste_temp` 不得同時含毒性/無毒 或 寒/溫 | **11 筆** | **NOTE** | 非零；與派工單「11 expected」完全吻合 |
| **HB-8** | `review_status` ∈ {draft, source_checked, deprecated} | **48 筆** | **NOTE** | 非零；見 §0.5，與派工單期望值不同，已交代原因 |
| **HB-9** | `card_grade === gold` ⇒ `field_sources` 非空 | **1 筆**（炙甘草） | **NOTE** | 非零；與派工單「1 expected」完全吻合 |
| **HB-10** | `contraindications_zh` 與 `cautions_zh` 不得逐字重複 | **7 筆** | **NOTE** | 非零；派工單「≥1 expected（蒼耳子）」，實測 7，蒼耳子在內 |
| **HB-11** | `clinical_use_note` ≡ `chinese_depth_track.summary_zh` | **182 筆** | **NOTE** | 非零；與派工單「182 expected」完全吻合 |
| **HB-12** | `primary_actions_en` 非空存在 | **6 筆** | **NOTE** | 非零；與派工單「6 expected」完全吻合 |

**八條全部 NOTE，因為八條全部非零。** 預設呼叫永遠 exit 0；CI 步驟只是把數字印在每一次 run 上。
理由與兩支 formula-layer 腳本同型：今天把一條非零的閘門接上 `exit 1`，
等於用一個沒人被指派去修的 backlog 去擋所有 merge，那道閘門一週內會被關掉。

**逐條畢業**：`--blocking` 接逗號清單，一條歸零就把它加進 CI 的 flag：

```bash
node scripts/validate-herb-integrity-predicates.js --blocking=HB-9
node scripts/validate-herb-integrity-predicates.js --blocking=HB-6,HB-9
```

| # | 畢業條件 | 卡在哪 |
|---|---|---|
| HB-4 | no_herb_in_comp 半支**卡在 C6**（`docs/TING_DECISION_QUEUE.md`）——欄位語意未裁定前無法定義「0 違反」。dead_id 半支（3 條）獨立畢業，不受 C6 影響 | C6 裁定 + 3 條連結修正 |
| HB-5 | 19 筆各自補上禁忌欄與標準劑量 | 內容工程，需具名來源（憲法第四條） |
| HB-6 | 11 筆 `properties_taste_temp` 去重 | 純整理，`data/herbs/**` 屬方劑/中藥線 |
| HB-8 | 6 筆明確錯誤（undefined/reviewed/draft_reviewed）修正 ＋ `sourced_cloudtcm_record`（41 筆）是否併入允許清單需要 Ting 一次裁定 | 一則裁定影響 41/48 |
| HB-9 | 炙甘草補齊與 gold 等級相稱的 `field_sources`，或降級 | 內容工程 |
| HB-10 | 7 筆從其中一欄移除重複條目（禁用 vs 慎用是臨床判斷） | 需臨床判斷，非本腳本可決定 |
| HB-11 | 182 筆改寫為真正的辨識/鑑別筆記（模板 §11.5） | 內容工程量體，非單批可清零 |
| HB-12 | 6 筆移除 `primary_actions_en`（模板已刪除此欄） | 純刪除欄位，`data/herbs/**` 屬中藥線 |

**不准用來畢業的做法**：放寬 HB-6/HB-10 的判準讓計數變小；把 HB-8 的允許 enum
悄悄加大到涵蓋所有出現值；用 herb_zh 備援吃掉 HB-4 的 no_herb_in_comp 而不等 C6 裁定。
數字要往下走，不是判準往下走。

---

## §2 逐條違反清單（remediation worklist）

### HB-4a — dead_id（3 條，formula id 不存在，任何 C6 裁定下都是壞連結）

| herb id | 中文 | 指向的 formula id（不存在） |
|---|---|---|
| chi_xiao_dou | 赤小豆 | formula.ma_huang_lian_qiao_chi_xiao_dou_tang |
| ge_jie | 蛤蚧 | formula.ren_shen_ge_jie_san |
| he_tao_ren | 核桃仁 | formula.ren_shen_ge_jie_san |

### HB-4b — no_herb_in_comp（907 條，formula 存在但 composition 不含本味；依賴 C6 裁定）

`[herb_zh 可救回]` = 若改用 herb_zh 子字串比對，這一條會被判定「含本味」——即該 formula 的 composition 列缺 `herb_id`但 `herb_zh` 對得上，是連結側資料缺口，不是必然的內容錯誤。

| herb id | 中文 | -> formula id | formula 中文 | herb_zh 可救回 |
|---|---|---|---|---|
| ma_huang | 麻黃 | gui_zhi_tang | 桂枝湯 |  |
| ma_huang | 麻黃 | yu_ping_feng_san | 玉屏風散 |  |
| ma_huang | 麻黃 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| ma_huang | 麻黃 | zhen_wu_tang | 真武湯 |  |
| ma_huang | 麻黃 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| ma_huang | 麻黃 | qian_zheng_san | 牽正散 |  |
| ma_huang | 麻黃 | xing_su_san | 杏蘇散 |  |
| gui_zhi | 桂枝 | tiao_wei_cheng_qi_tang | 調胃承氣湯 |  |
| gui_zhi | 桂枝 | xiao_chai_hu_tang | 小柴胡湯 |  |
| gui_zhi | 桂枝 | yu_ping_feng_san | 玉屏風散 |  |
| gui_zhi | 桂枝 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| gui_zhi | 桂枝 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| gui_zhi | 桂枝 | zhu_ling_tang | 豬苓湯 |  |
| gui_zhi | 桂枝 | zhen_wu_tang | 真武湯 |  |
| gui_zhi | 桂枝 | ding_chuan_tang | 定喘湯 |  |
| gui_zhi | 桂枝 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| gui_zhi | 桂枝 | si_ni_san | 四逆散 |  |
| sheng_jiang | 生薑 | ban_xia_xie_xin_tang | 半夏瀉心湯 |  |
| sheng_jiang | 生薑 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| sheng_jiang | 生薑 | shen_ling_bai_zhu_san | 參苓白朮散 |  |
| sheng_jiang | 生薑 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| sheng_jiang | 生薑 | ding_chuan_tang | 定喘湯 |  |
| sheng_jiang | 生薑 | mai_men_dong_tang | 麥門冬湯 |  |
| sheng_jiang | 生薑 | wu_mei_wan | 烏梅丸 |  |
| xiang_ru | 香薷 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| xiang_ru | 香薷 | san_ren_tang | 三仁湯 |  |
| jing_jie | 荊芥 | sang_ju_yin | 桑菊飲 |  |
| jing_jie | 荊芥 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| fang_feng | 防風 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| fang_feng | 防風 | wu_ling_san | 五苓散 |  |
| fang_feng | 防風 | huai_hua_san | 槐花散 |  |
| fang_feng | 防風 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| fang_feng | 防風 | qian_zheng_san | 牽正散 |  |
| qiang_huo | 羌活 | xiao_feng_san | 消風散 |  |
| qiang_huo | 羌活 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| qiang_huo | 羌活 | qian_zheng_san | 牽正散 |  |
| bai_zhi | 白芷 | yue_ju_wan | 越鞠丸 |  |
| bai_zhi | 白芷 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| xi_xin | 細辛 | bai_hu_tang | 白虎湯 |  |
| xi_xin | 細辛 | liu_jun_zi_tang | 六君子湯 |  |
| xi_xin | 細辛 | wu_ling_san | 五苓散 |  |
| xi_xin | 細辛 | zhen_wu_tang | 真武湯 |  |
| xi_xin | 細辛 | ding_chuan_tang | 定喘湯 |  |
| cang_er_zi | 蒼耳子 | wu_ling_san | 五苓散 |  |
| shi_gao | 石膏 | ma_huang_tang | 麻黃湯 |  |
| shi_gao | 石膏 | xiao_qing_long_tang | 小青龍湯 |  |
| shi_gao | 石膏 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| shi_gao | 石膏 | sang_ju_yin | 桑菊飲 |  |
| shi_gao | 石膏 | yi_guan_jian | 一貫煎 |  |
| shi_gao | 石膏 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| shi_gao | 石膏 | san_ren_tang | 三仁湯 |  |
| shi_gao | 石膏 | er_chen_tang | 二陳湯 |  |
| shi_gao | 石膏 | ding_chuan_tang | 定喘湯 |  |
| shi_gao | 石膏 | mai_men_dong_tang | 麥門冬湯 |  |
| zhi_mu | 知母 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| zhi_mu | 知母 | yin_qiao_san | 銀翹散 |  |
| zhi_mu | 知母 | sang_ju_yin | 桑菊飲 |  |
| zhi_mu | 知母 | zhu_ye_shi_gao_tang | 竹葉石膏湯 |  |
| zhi_mu | 知母 | yi_guan_jian | 一貫煎 |  |
| zhi_mu | 知母 | san_ren_tang | 三仁湯 |  |
| zhi_mu | 知母 | ding_chuan_tang | 定喘湯 |  |
| zhi_mu | 知母 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| lu_gen | 蘆根 | bai_hu_tang | 白虎湯 |  |
| tian_hua_fen | 天花粉 | yin_qiao_san | 銀翹散 |  |
| tian_hua_fen | 天花粉 | sang_ju_yin | 桑菊飲 |  |
| tian_hua_fen | 天花粉 | bai_hu_tang | 白虎湯 |  |
| tian_hua_fen | 天花粉 | xiao_chai_hu_tang | 小柴胡湯 |  |
| tian_hua_fen | 天花粉 | san_ren_tang | 三仁湯 |  |
| zhi_zi | 梔子 | yin_qiao_san | 銀翹散 |  |
| zhi_zi | 梔子 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| zhi_zi | 梔子 | da_chai_hu_tang | 大柴胡湯 |  |
| zhi_zi | 梔子 | xiao_yao_san | 逍遙散 |  |
| zhi_zi | 梔子 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| zhi_zi | 梔子 | zhu_ling_tang | 豬苓湯 |  |
| zhi_zi | 梔子 | xiao_feng_san | 消風散 |  |
| zhi_zi | 梔子 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| zhi_zi | 梔子 | si_ni_san | 四逆散 |  |
| xia_ku_cao | 夏枯草 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| xia_ku_cao | 夏枯草 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| huang_qin | 黃芩 | yin_qiao_san | 銀翹散 |  |
| huang_qin | 黃芩 | sang_ju_yin | 桑菊飲 |  |
| huang_qin | 黃芩 | bai_hu_tang | 白虎湯 |  |
| huang_qin | 黃芩 | qing_wei_san | 清胃散 |  |
| huang_qin | 黃芩 | da_cheng_qi_tang | 大承氣湯 |  |
| huang_qin | 黃芩 | xiao_yao_san | 逍遙散 |  |
| huang_qin | 黃芩 | si_wu_tang | 四物湯 |  |
| huang_qin | 黃芩 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| huang_qin | 黃芩 | yue_ju_wan | 越鞠丸 |  |
| huang_qin | 黃芩 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| huang_qin | 黃芩 | ping_wei_san | 平胃散 |  |
| huang_qin | 黃芩 | san_ren_tang | 三仁湯 |  |
| huang_qin | 黃芩 | ba_zheng_san | 八正散 |  |
| huang_qin | 黃芩 | xiao_feng_san | 消風散 |  |
| huang_qin | 黃芩 | bao_he_wan | 保和丸 |  |
| huang_qin | 黃芩 | bai_he_gu_jin_tang | 百合固金湯 |  |
| huang_qin | 黃芩 | huai_hua_san | 槐花散 |  |
| huang_qin | 黃芩 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| huang_qin | 黃芩 | qian_zheng_san | 牽正散 |  |
| huang_lian | 黃連 | bai_hu_tang | 白虎湯 |  |
| huang_lian | 黃連 | tiao_wei_cheng_qi_tang | 調胃承氣湯 |  |
| huang_lian | 黃連 | da_chai_hu_tang | 大柴胡湯 |  |
| huang_lian | 黃連 | tong_xie_yao_fang | 痛瀉要方 |  |
| huang_lian | 黃連 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| huang_lian | 黃連 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| huang_lian | 黃連 | yue_ju_wan | 越鞠丸 |  |
| huang_lian | 黃連 | ping_wei_san | 平胃散 |  |
| huang_lian | 黃連 | san_ren_tang | 三仁湯 |  |
| huang_lian | 黃連 | zhen_wu_tang | 真武湯 |  |
| huang_lian | 黃連 | wen_dan_tang | 溫膽湯 |  |
| huang_lian | 黃連 | bao_he_wan | 保和丸 |  |
| huang_lian | 黃連 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| huang_lian | 黃連 | huai_hua_san | 槐花散 |  |
| huang_bai | 黃柏 | bai_hu_tang | 白虎湯 |  |
| huang_bai | 黃柏 | ba_zheng_san | 八正散 |  |
| huang_bai | 黃柏 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| huang_bai | 黃柏 | huai_hua_san | 槐花散 |  |
| huang_bai | 黃柏 | wan_dai_tang | 完帶湯 |  |
| huang_bai | 黃柏 | zuo_jin_wan | 左金丸 |  |
| long_dan_cao | 龍膽草 | bai_hu_tang | 白虎湯 |  |
| long_dan_cao | 龍膽草 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| long_dan_cao | 龍膽草 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| jin_yin_hua | 金銀花 | sang_ju_yin | 桑菊飲 |  |
| jin_yin_hua | 金銀花 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| jin_yin_hua | 金銀花 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| lian_qiao | 連翹 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| lian_qiao | 連翹 | san_ren_tang | 三仁湯 |  |
| lian_qiao | 連翹 | zhen_wu_tang | 真武湯 |  |
| lian_qiao | 連翹 | xiao_feng_san | 消風散 |  |
| lian_qiao | 連翹 | qian_zheng_san | 牽正散 |  |
| pu_gong_ying | 蒲公英 | da_chai_hu_tang | 大柴胡湯 |  |
| zi_hua_di_ding | 紫花地丁 | yin_qiao_san | 銀翹散 |  |
| ban_lan_gen | 板藍根 | sang_ju_yin | 桑菊飲 |  |
| ban_lan_gen | 板藍根 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| bai_tou_weng | 白頭翁 | tong_xie_yao_fang | 痛瀉要方 |  |
| sheng_di_huang | 生地黃 | yin_qiao_san | 銀翹散 |  |
| sheng_di_huang | 生地黃 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| sheng_di_huang | 生地黃 | suan_zao_ren_tang | 酸棗仁湯 |  |
| sheng_di_huang | 生地黃 | gui_pi_tang | 歸脾湯 |  |
| xuan_shen | 玄參 | yin_qiao_san | 銀翹散 |  |
| xuan_shen | 玄參 | sang_ju_yin | 桑菊飲 |  |
| xuan_shen | 玄參 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| xuan_shen | 玄參 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| xuan_shen | 玄參 | ma_zi_ren_wan | 麻子仁丸 |  |
| xuan_shen | 玄參 | yi_guan_jian | 一貫煎 |  |
| xuan_shen | 玄參 | suan_zao_ren_tang | 酸棗仁湯 |  |
| xuan_shen | 玄參 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| mu_dan_pi | 牡丹皮 | xiao_yao_san | 逍遙散 |  |
| mu_dan_pi | 牡丹皮 | zuo_gui_wan | 左歸丸 |  |
| mu_dan_pi | 牡丹皮 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| mu_dan_pi | 牡丹皮 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| mu_dan_pi | 牡丹皮 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| chi_shao | 赤芍 | xiao_yao_san | 逍遙散 |  |
| chi_shao | 赤芍 | si_wu_tang | 四物湯 |  |
| chi_shao | 赤芍 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| chi_shao | 赤芍 | yue_ju_wan | 越鞠丸 |  |
| chi_shao | 赤芍 | wen_jing_tang | 溫經湯 |  |
| chi_shao | 赤芍 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| chi_shao | 赤芍 | xiao_feng_san | 消風散 |  |
| chi_shao | 赤芍 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| di_gu_pi | 地骨皮 | qing_hao_bie_jia_tang | 青蒿鱉甲湯 |  |
| di_gu_pi | 地骨皮 | zuo_gui_wan | 左歸丸 |  |
| di_gu_pi | 地骨皮 | yi_guan_jian | 一貫煎 |  |
| da_huang | 大黃 | bai_hu_tang | 白虎湯 |  |
| da_huang | 大黃 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| da_huang | 大黃 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| da_huang | 大黃 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| da_huang | 大黃 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| da_huang | 大黃 | xiao_feng_san | 消風散 |  |
| da_huang | 大黃 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| da_huang | 大黃 | bao_he_wan | 保和丸 |  |
| da_huang | 大黃 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| da_huang | 大黃 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| da_huang | 大黃 | wu_mei_wan | 烏梅丸 |  |
| mang_xiao | 芒硝 | ma_zi_ren_wan | 麻子仁丸 |  |
| mang_xiao | 芒硝 | xiao_cheng_qi_tang | 小承氣湯 |  |
| mang_xiao | 芒硝 | da_chai_hu_tang | 大柴胡湯 |  |
| mang_xiao | 芒硝 | er_chen_tang | 二陳湯 |  |
| mang_xiao | 芒硝 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| mang_xiao | 芒硝 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| mang_xiao | 芒硝 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| mang_xiao | 芒硝 | wu_mei_wan | 烏梅丸 |  |
| huo_ma_ren | 火麻仁 | da_cheng_qi_tang | 大承氣湯 |  |
| yu_li_ren | 郁李仁 | da_cheng_qi_tang | 大承氣湯 |  |
| yu_li_ren | 郁李仁 | ma_zi_ren_wan | 麻子仁丸 |  |
| gan_sui | 甘遂 | da_cheng_qi_tang | 大承氣湯 |  |
| gan_sui | 甘遂 | ma_zi_ren_wan | 麻子仁丸 |  |
| gan_sui | 甘遂 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| du_huo | 獨活 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| wei_ling_xian | 威靈仙 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| wei_ling_xian | 威靈仙 | xiao_feng_san | 消風散 |  |
| wei_ling_xian | 威靈仙 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| wei_ling_xian | 威靈仙 | da_cheng_qi_tang | 大承氣湯 |  |
| wei_ling_xian | 威靈仙 | wu_ling_san | 五苓散 |  |
| qin_jiao | 秦艽 | ding_chuan_tang | 定喘湯 |  |
| qin_jiao | 秦艽 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| fang_ji | 防己 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| fang_ji | 防己 | xiao_feng_san | 消風散 |  |
| fang_ji | 防己 | wu_ling_san | 五苓散 |  |
| fang_ji | 防己 | fang_ji_huang_qi_tang | 防己黃耆湯 | 是 |
| wu_jia_pi | 五加皮 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| wu_jia_pi | 五加皮 | xiao_feng_san | 消風散 |  |
| mu_gua | 木瓜 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| mu_gua | 木瓜 | xiao_feng_san | 消風散 |  |
| mu_gua | 木瓜 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| mu_gua | 木瓜 | wu_ling_san | 五苓散 |  |
| huo_xiang | 藿香 | yin_qiao_san | 銀翹散 |  |
| huo_xiang | 藿香 | san_ren_tang | 三仁湯 |  |
| huo_xiang | 藿香 | xiao_feng_san | 消風散 |  |
| pei_lan | 佩蘭 | ping_wei_san | 平胃散 |  |
| pei_lan | 佩蘭 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| pei_lan | 佩蘭 | san_ren_tang | 三仁湯 |  |
| cang_zhu | 蒼朮 | tong_xie_yao_fang | 痛瀉要方 |  |
| cang_zhu | 蒼朮 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| cang_zhu | 蒼朮 | san_ren_tang | 三仁湯 |  |
| cang_zhu | 蒼朮 | ba_zheng_san | 八正散 |  |
| cang_zhu | 蒼朮 | er_chen_tang | 二陳湯 |  |
| cang_zhu | 蒼朮 | wen_dan_tang | 溫膽湯 |  |
| cang_zhu | 蒼朮 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| cang_zhu | 蒼朮 | bao_he_wan | 保和丸 |  |
| cang_zhu | 蒼朮 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| hou_po | 厚朴 | ma_huang_tang | 麻黃湯 |  |
| hou_po | 厚朴 | tiao_wei_cheng_qi_tang | 調胃承氣湯 |  |
| hou_po | 厚朴 | yue_ju_wan | 越鞠丸 |  |
| hou_po | 厚朴 | xiao_feng_san | 消風散 |  |
| hou_po | 厚朴 | bao_he_wan | 保和丸 |  |
| hou_po | 厚朴 | ding_chuan_tang | 定喘湯 |  |
| sha_ren | 砂仁 | ping_wei_san | 平胃散 |  |
| sha_ren | 砂仁 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| sha_ren | 砂仁 | liu_jun_zi_tang | 六君子湯 |  |
| sha_ren | 砂仁 | yue_ju_wan | 越鞠丸 |  |
| sha_ren | 砂仁 | bai_he_gu_jin_tang | 百合固金湯 |  |
| bai_dou_kou | 白豆蔻 | ping_wei_san | 平胃散 |  |
| bai_dou_kou | 白豆蔻 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| fu_ling | 茯苓 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| fu_ling | 茯苓 | xiao_chai_hu_tang | 小柴胡湯 |  |
| fu_ling | 茯苓 | tong_xie_yao_fang | 痛瀉要方 |  |
| fu_ling | 茯苓 | zuo_gui_wan | 左歸丸 |  |
| fu_ling | 茯苓 | you_gui_wan | 右歸丸 |  |
| fu_ling | 茯苓 | yue_ju_wan | 越鞠丸 |  |
| fu_ling | 茯苓 | ping_wei_san | 平胃散 |  |
| fu_ling | 茯苓 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| fu_ling | 茯苓 | xiao_feng_san | 消風散 |  |
| fu_ling | 茯苓 | zhi_bao_dan | 至寶丹 |  |
| fu_ling | 茯苓 | si_ni_san | 四逆散 |  |
| fu_ling | 茯苓 | wu_mei_wan | 烏梅丸 |  |
| zhu_ling | 豬苓 | ba_zheng_san | 八正散 |  |
| zhu_ling | 豬苓 | fang_ji_huang_qi_tang | 防己黃耆湯 |  |
| ze_xie | 澤瀉 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| ze_xie | 澤瀉 | zuo_gui_wan | 左歸丸 |  |
| ze_xie | 澤瀉 | you_gui_wan | 右歸丸 |  |
| ze_xie | 澤瀉 | yue_ju_wan | 越鞠丸 |  |
| ze_xie | 澤瀉 | ping_wei_san | 平胃散 |  |
| ze_xie | 澤瀉 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| yi_yi_ren | 薏苡仁 | wu_ling_san | 五苓散 |  |
| yi_yi_ren | 薏苡仁 | zhu_ling_tang | 豬苓湯 |  |
| yi_yi_ren | 薏苡仁 | ba_zheng_san | 八正散 |  |
| yi_yi_ren | 薏苡仁 | tong_xie_yao_fang | 痛瀉要方 |  |
| yi_yi_ren | 薏苡仁 | yi_guan_jian | 一貫煎 |  |
| yi_yi_ren | 薏苡仁 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| yi_yi_ren | 薏苡仁 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| che_qian_zi | 車前子 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| che_qian_zi | 車前子 | tong_xie_yao_fang | 痛瀉要方 |  |
| che_qian_zi | 車前子 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| che_qian_zi | 車前子 | wu_ling_san | 五苓散 |  |
| che_qian_zi | 車前子 | zhu_ling_tang | 豬苓湯 |  |
| che_qian_zi | 車前子 | xiao_feng_san | 消風散 |  |
| mu_tong | 木通 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| mu_tong | 木通 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| hua_shi | 滑石 | wu_ling_san | 五苓散 |  |
| hua_shi | 滑石 | zhi_bao_dan | 至寶丹 |  |
| yin_chen_hao | 茵陳蒿 | wu_ling_san | 五苓散 |  |
| yin_chen_hao | 茵陳蒿 | zhu_ling_tang | 豬苓湯 |  |
| yin_chen_hao | 茵陳蒿 | ba_zheng_san | 八正散 |  |
| jin_qian_cao | 金錢草 | wu_ling_san | 五苓散 |  |
| jin_qian_cao | 金錢草 | zhu_ling_tang | 豬苓湯 |  |
| jin_qian_cao | 金錢草 | ba_zheng_san | 八正散 |  |
| jin_qian_cao | 金錢草 | da_chai_hu_tang | 大柴胡湯 |  |
| jin_qian_cao | 金錢草 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| fu_zi | 附子 | bai_hu_tang | 白虎湯 |  |
| fu_zi | 附子 | tong_xie_yao_fang | 痛瀉要方 |  |
| fu_zi | 附子 | liu_jun_zi_tang | 六君子湯 |  |
| fu_zi | 附子 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| fu_zi | 附子 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| fu_zi | 附子 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| fu_zi | 附子 | du_huo_ji_sheng_tang | 獨活寄生湯 |  |
| fu_zi | 附子 | qian_zheng_san | 牽正散 | 是 |
| fu_zi | 附子 | si_ni_san | 四逆散 |  |
| gan_jiang | 乾薑 | xiao_chai_hu_tang | 小柴胡湯 |  |
| gan_jiang | 乾薑 | sheng_hua_tang | 生化湯 |  |
| gan_jiang | 乾薑 | ping_wei_san | 平胃散 |  |
| gan_jiang | 乾薑 | zhen_wu_tang | 真武湯 |  |
| gan_jiang | 乾薑 | wen_dan_tang | 溫膽湯 |  |
| gan_jiang | 乾薑 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| gan_jiang | 乾薑 | jian_pi_wan | 健脾丸 |  |
| gan_jiang | 乾薑 | si_ni_san | 四逆散 |  |
| rou_gui | 肉桂 | li_zhong_wan | 理中丸 |  |
| rou_gui | 肉桂 | si_ni_tang | 四逆湯 |  |
| rou_gui | 肉桂 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| rou_gui | 肉桂 | si_wu_tang | 四物湯 |  |
| rou_gui | 肉桂 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| rou_gui | 肉桂 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| rou_gui | 肉桂 | sheng_hua_tang | 生化湯 |  |
| rou_gui | 肉桂 | wen_jing_tang | 溫經湯 |  |
| wu_zhu_yu | 吳茱萸 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| wu_zhu_yu | 吳茱萸 | si_wu_tang | 四物湯 |  |
| wu_zhu_yu | 吳茱萸 | wen_dan_tang | 溫膽湯 |  |
| wu_zhu_yu | 吳茱萸 | wu_mei_wan | 烏梅丸 |  |
| xiao_hui_xiang | 小茴香 | li_zhong_wan | 理中丸 |  |
| xiao_hui_xiang | 小茴香 | si_ni_tang | 四逆湯 |  |
| xiao_hui_xiang | 小茴香 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| xiao_hui_xiang | 小茴香 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| xiao_hui_xiang | 小茴香 | wen_jing_tang | 溫經湯 |  |
| ding_xiang | 丁香 | li_zhong_wan | 理中丸 |  |
| ding_xiang | 丁香 | si_ni_tang | 四逆湯 |  |
| ding_xiang | 丁香 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| ju_hong | 橘紅 | yue_ju_wan | 越鞠丸 |  |
| ju_hong | 橘紅 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| ju_hong | 橘紅 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| chen_pi | 陳皮 | xiao_yao_san | 逍遙散 |  |
| chen_pi | 陳皮 | jia_wei_xiao_yao_san | 加味逍遙散 |  |
| chen_pi | 陳皮 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| chen_pi | 陳皮 | wu_ling_san | 五苓散 |  |
| chen_pi | 陳皮 | xiao_feng_san | 消風散 |  |
| chen_pi | 陳皮 | zhi_bao_dan | 至寶丹 |  |
| chen_pi | 陳皮 | bai_he_gu_jin_tang | 百合固金湯 |  |
| zhi_ke | 枳殼 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| zhi_ke | 枳殼 | da_chai_hu_tang | 大柴胡湯 |  |
| zhi_ke | 枳殼 | tong_xie_yao_fang | 痛瀉要方 |  |
| zhi_ke | 枳殼 | bu_zhong_yi_qi_tang | 補中益氣湯 |  |
| zhi_ke | 枳殼 | yue_ju_wan | 越鞠丸 |  |
| zhi_ke | 枳殼 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| zhi_ke | 枳殼 | er_chen_tang | 二陳湯 |  |
| zhi_ke | 枳殼 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| zhi_ke | 枳殼 | ding_chuan_tang | 定喘湯 |  |
| zhi_shi | 枳實 | yue_ju_wan | 越鞠丸 |  |
| zhi_shi | 枳實 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| zhi_shi | 枳實 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| zhi_shi | 枳實 | tiao_wei_cheng_qi_tang | 調胃承氣湯 |  |
| zhi_shi | 枳實 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| zhi_shi | 枳實 | ping_wei_san | 平胃散 |  |
| zhi_shi | 枳實 | er_chen_tang | 二陳湯 |  |
| zhi_shi | 枳實 | bao_he_wan | 保和丸 |  |
| zhi_shi | 枳實 | zhi_bao_dan | 至寶丹 |  |
| zhi_shi | 枳實 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| mu_xiang | 木香 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| mu_xiang | 木香 | da_chai_hu_tang | 大柴胡湯 |  |
| mu_xiang | 木香 | tong_xie_yao_fang | 痛瀉要方 |  |
| mu_xiang | 木香 | xiao_jian_zhong_tang | 小建中湯 |  |
| mu_xiang | 木香 | liu_jun_zi_tang | 六君子湯 |  |
| mu_xiang | 木香 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| mu_xiang | 木香 | yue_ju_wan | 越鞠丸 |  |
| mu_xiang | 木香 | sheng_hua_tang | 生化湯 |  |
| mu_xiang | 木香 | ping_wei_san | 平胃散 |  |
| mu_xiang | 木香 | bao_he_wan | 保和丸 |  |
| mu_xiang | 木香 | zhi_bao_dan | 至寶丹 |  |
| xiang_fu | 香附 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| xiang_fu | 香附 | xiao_yao_san | 逍遙散 |  |
| xiang_fu | 香附 | jia_wei_xiao_yao_san | 加味逍遙散 |  |
| xiang_fu | 香附 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| xiang_fu | 香附 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| xiang_fu | 香附 | yi_guan_jian | 一貫煎 |  |
| xiang_fu | 香附 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| xiang_fu | 香附 | wen_jing_tang | 溫經湯 |  |
| xiang_fu | 香附 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| xiang_fu | 香附 | ping_wei_san | 平胃散 |  |
| xiang_fu | 香附 | er_chen_tang | 二陳湯 |  |
| xiang_fu | 香附 | wen_dan_tang | 溫膽湯 |  |
| xiang_fu | 香附 | bao_he_wan | 保和丸 |  |
| xiang_fu | 香附 | si_ni_san | 四逆散 |  |
| chuan_lian_zi | 川楝子 | yue_ju_wan | 越鞠丸 |  |
| chuan_lian_zi | 川楝子 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| chuan_lian_zi | 川楝子 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| chuan_lian_zi | 川楝子 | da_chai_hu_tang | 大柴胡湯 |  |
| chuan_lian_zi | 川楝子 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| chuan_lian_zi | 川楝子 | si_ni_san | 四逆散 |  |
| qing_pi | 青皮 | yue_ju_wan | 越鞠丸 |  |
| qing_pi | 青皮 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| qing_pi | 青皮 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| qing_pi | 青皮 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| qing_pi | 青皮 | zhi_bao_dan | 至寶丹 |  |
| shan_zha | 山楂 | tong_xie_yao_fang | 痛瀉要方 |  |
| shan_zha | 山楂 | yue_ju_wan | 越鞠丸 |  |
| shan_zha | 山楂 | er_chen_tang | 二陳湯 |  |
| shen_qu | 神麴 | er_chen_tang | 二陳湯 |  |
| shen_qu | 神麴 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| mai_ya | 麥芽 | tong_xie_yao_fang | 痛瀉要方 |  |
| mai_ya | 麥芽 | xiao_jian_zhong_tang | 小建中湯 |  |
| mai_ya | 麥芽 | yue_ju_wan | 越鞠丸 |  |
| mai_ya | 麥芽 | ping_wei_san | 平胃散 |  |
| mai_ya | 麥芽 | er_chen_tang | 二陳湯 |  |
| mai_ya | 麥芽 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| ji_nei_jin | 雞內金 | bao_he_wan | 保和丸 |  |
| ji_nei_jin | 雞內金 | jian_pi_wan | 健脾丸 |  |
| ji_nei_jin | 雞內金 | da_chai_hu_tang | 大柴胡湯 |  |
| ji_nei_jin | 雞內金 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| san_qi | 三七 | shi_hui_san | 十灰散 |  |
| san_qi | 三七 | huai_hua_san | 槐花散 |  |
| san_qi | 三七 | huang_tu_tang | 黃土湯 |  |
| bai_ji | 白及 | shi_hui_san | 十灰散 |  |
| bai_ji | 白及 | huai_hua_san | 槐花散 |  |
| bai_ji | 白及 | huang_tu_tang | 黃土湯 |  |
| ai_ye | 艾葉 | shi_hui_san | 十灰散 |  |
| ai_ye | 艾葉 | huai_hua_san | 槐花散 |  |
| ai_ye | 艾葉 | huang_tu_tang | 黃土湯 |  |
| ai_ye | 艾葉 | ma_huang_tang | 麻黃湯 |  |
| ai_ye | 艾葉 | si_wu_tang | 四物湯 |  |
| ai_ye | 艾葉 | wen_jing_tang | 溫經湯 |  |
| di_yu | 地榆 | shi_hui_san | 十灰散 |  |
| di_yu | 地榆 | huai_hua_san | 槐花散 |  |
| di_yu | 地榆 | huang_tu_tang | 黃土湯 |  |
| di_yu | 地榆 | ma_zi_ren_wan | 麻子仁丸 |  |
| di_yu | 地榆 | tong_xie_yao_fang | 痛瀉要方 |  |
| ce_bai_ye | 側柏葉 | huang_tu_tang | 黃土湯 |  |
| chuan_xiong | 川芎 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| chuan_xiong | 川芎 | xiao_feng_san | 消風散 |  |
| yan_hu_suo | 延胡索 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| yan_hu_suo | 延胡索 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| yan_hu_suo | 延胡索 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| yan_hu_suo | 延胡索 | da_chai_hu_tang | 大柴胡湯 |  |
| yan_hu_suo | 延胡索 | tong_xie_yao_fang | 痛瀉要方 |  |
| yan_hu_suo | 延胡索 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| yu_jin | 鬱金 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| yu_jin | 鬱金 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| yu_jin | 鬱金 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| yu_jin | 鬱金 | yin_qiao_san | 銀翹散 |  |
| yu_jin | 鬱金 | da_chai_hu_tang | 大柴胡湯 |  |
| yu_jin | 鬱金 | suan_zao_ren_tang | 酸棗仁湯 |  |
| yu_jin | 鬱金 | yue_ju_wan | 越鞠丸 |  |
| yu_jin | 鬱金 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| yu_jin | 鬱金 | si_ni_san | 四逆散 |  |
| dan_shen | 丹參 | xiao_yao_san | 逍遙散 |  |
| dan_shen | 丹參 | si_wu_tang | 四物湯 |  |
| dan_shen | 丹參 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| dan_shen | 丹參 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| tao_ren | 桃仁 | tiao_wei_cheng_qi_tang | 調胃承氣湯 |  |
| tao_ren | 桃仁 | ma_zi_ren_wan | 麻子仁丸 |  |
| tao_ren | 桃仁 | si_wu_tang | 四物湯 |  |
| tao_ren | 桃仁 | yue_ju_wan | 越鞠丸 |  |
| tao_ren | 桃仁 | wen_jing_tang | 溫經湯 |  |
| tao_ren | 桃仁 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| hong_hua | 紅花 | si_wu_tang | 四物湯 |  |
| hong_hua | 紅花 | yue_ju_wan | 越鞠丸 |  |
| hong_hua | 紅花 | wen_jing_tang | 溫經湯 |  |
| hong_hua | 紅花 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| hong_hua | 紅花 | tao_he_cheng_qi_tang | 桃核承氣湯 |  |
| niu_xi | 牛膝 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| niu_xi | 牛膝 | zuo_gui_wan | 左歸丸 | 是 |
| niu_xi | 牛膝 | yi_guan_jian | 一貫煎 |  |
| niu_xi | 牛膝 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| niu_xi | 牛膝 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| niu_xi | 牛膝 | tian_ma_gou_teng_yin | 天麻鉤藤飲 | 是 |
| wang_bu_liu_xing | 王不留行 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| wang_bu_liu_xing | 王不留行 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| wang_bu_liu_xing | 王不留行 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| e_zhu | 莪朮 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| e_zhu | 莪朮 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| e_zhu | 莪朮 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| e_zhu | 莪朮 | zhi_bao_dan | 至寶丹 |  |
| san_leng | 三棱 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| san_leng | 三棱 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| san_leng | 三棱 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| san_leng | 三棱 | zhi_bao_dan | 至寶丹 |  |
| ji_xue_teng | 雞血藤 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| ji_xue_teng | 雞血藤 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| ji_xue_teng | 雞血藤 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| ji_xue_teng | 雞血藤 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| ban_xia | 半夏 | bai_hu_tang | 白虎湯 |  |
| ban_xia | 半夏 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| ban_xia | 半夏 | ping_wei_san | 平胃散 |  |
| ban_xia | 半夏 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| ban_xia | 半夏 | wu_mei_wan | 烏梅丸 |  |
| tian_nan_xing | 天南星 | er_chen_tang | 二陳湯 |  |
| tian_nan_xing | 天南星 | wen_dan_tang | 溫膽湯 |  |
| tian_nan_xing | 天南星 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| tian_nan_xing | 天南星 | yue_ju_wan | 越鞠丸 |  |
| tian_nan_xing | 天南星 | qian_zheng_san | 牽正散 |  |
| jie_geng | 桔梗 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| jie_geng | 桔梗 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| jie_geng | 桔梗 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| jie_geng | 桔梗 | qian_zheng_san | 牽正散 |  |
| chuan_bei_mu | 川貝母 | er_chen_tang | 二陳湯 |  |
| chuan_bei_mu | 川貝母 | wen_dan_tang | 溫膽湯 |  |
| zhe_bei_mu | 浙貝母 | er_chen_tang | 二陳湯 |  |
| zhe_bei_mu | 浙貝母 | wen_dan_tang | 溫膽湯 |  |
| zhe_bei_mu | 浙貝母 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| gua_lou | 瓜蔞 | er_chen_tang | 二陳湯 |  |
| gua_lou | 瓜蔞 | wen_dan_tang | 溫膽湯 |  |
| gua_lou | 瓜蔞 | sang_ju_yin | 桑菊飲 |  |
| gua_lou | 瓜蔞 | xiao_chai_hu_tang | 小柴胡湯 |  |
| gua_lou | 瓜蔞 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| gua_lou | 瓜蔞 | qing_zao_jiu_fei_tang | 清燥救肺湯 |  |
| zhu_ru | 竹茹 | er_chen_tang | 二陳湯 |  |
| zhu_ru | 竹茹 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| zhu_ru | 竹茹 | bai_hu_tang | 白虎湯 |  |
| zhu_ru | 竹茹 | da_chai_hu_tang | 大柴胡湯 |  |
| zhu_ru | 竹茹 | mai_men_dong_tang | 麥門冬湯 |  |
| xing_ren | 杏仁 | yin_qiao_san | 銀翹散 |  |
| xing_ren | 杏仁 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| xing_ren | 杏仁 | er_chen_tang | 二陳湯 |  |
| xing_ren | 杏仁 | bai_he_gu_jin_tang | 百合固金湯 |  |
| xing_ren | 杏仁 | tao_he_cheng_qi_tang | 桃核承氣湯 |  |
| su_zi | 蘇子 | er_chen_tang | 二陳湯 |  |
| su_zi | 蘇子 | wen_dan_tang | 溫膽湯 |  |
| su_zi | 蘇子 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| su_zi | 蘇子 | su_zi_jiang_qi_tang | 蘇子降氣湯 | 是 |
| su_zi | 蘇子 | san_zi_yang_qin_tang | 三子養親湯 | 是 |
| su_zi | 蘇子 | ding_chuan_tang | 定喘湯 | 是 |
| su_zi | 蘇子 | xing_su_san | 杏蘇散 |  |
| kuan_dong_hua | 款冬花 | er_chen_tang | 二陳湯 |  |
| kuan_dong_hua | 款冬花 | wen_dan_tang | 溫膽湯 |  |
| kuan_dong_hua | 款冬花 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| kuan_dong_hua | 款冬花 | bai_he_gu_jin_tang | 百合固金湯 |  |
| kuan_dong_hua | 款冬花 | mai_men_dong_tang | 麥門冬湯 |  |
| zi_wan | 紫菀 | er_chen_tang | 二陳湯 |  |
| zi_wan | 紫菀 | wen_dan_tang | 溫膽湯 |  |
| zi_wan | 紫菀 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| zi_wan | 紫菀 | ding_chuan_tang | 定喘湯 |  |
| shi_chang_pu | 石菖蒲 | an_gong_niu_huang_wan | 安宮牛黃丸 |  |
| shi_chang_pu | 石菖蒲 | su_he_xiang_wan | 蘇合香丸 |  |
| shi_chang_pu | 石菖蒲 | suan_zao_ren_tang | 酸棗仁湯 |  |
| shi_chang_pu | 石菖蒲 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| shi_chang_pu | 石菖蒲 | san_ren_tang | 三仁湯 |  |
| su_he_xiang | 蘇合香 | an_gong_niu_huang_wan | 安宮牛黃丸 |  |
| tian_ma | 天麻 | ling_jiao_gou_teng_tang | 羚角鉤藤湯 |  |
| di_long | 地龍 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| di_long | 地龍 | ling_jiao_gou_teng_tang | 羚角鉤藤湯 |  |
| di_long | 地龍 | qian_zheng_san | 牽正散 |  |
| quan_xie | 全蠍 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| quan_xie | 全蠍 | ling_jiao_gou_teng_tang | 羚角鉤藤湯 |  |
| quan_xie | 全蠍 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| mu_li | 牡蠣 | suan_zao_ren_tang | 酸棗仁湯 |  |
| mu_li | 牡蠣 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| mu_li | 牡蠣 | gan_mai_da_zao_tang | 甘麥大棗湯 |  |
| mu_li | 牡蠣 | xiao_chai_hu_tang | 小柴胡湯 |  |
| mu_li | 牡蠣 | yu_ping_feng_san | 玉屏風散 |  |
| mu_li | 牡蠣 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| mu_li | 牡蠣 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| long_gu | 龍骨 | suan_zao_ren_tang | 酸棗仁湯 |  |
| long_gu | 龍骨 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| long_gu | 龍骨 | gan_mai_da_zao_tang | 甘麥大棗湯 |  |
| long_gu | 龍骨 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| ren_shen | 人參 | bai_hu_tang | 白虎湯 |  |
| ren_shen | 人參 | da_chai_hu_tang | 大柴胡湯 |  |
| ren_shen | 人參 | si_wu_tang | 四物湯 |  |
| ren_shen | 人參 | zuo_gui_wan | 左歸丸 |  |
| ren_shen | 人參 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| ren_shen | 人參 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| ren_shen | 人參 | ping_wei_san | 平胃散 |  |
| ren_shen | 人參 | wu_ling_san | 五苓散 |  |
| ren_shen | 人參 | wen_dan_tang | 溫膽湯 |  |
| ren_shen | 人參 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| ren_shen | 人參 | xiao_feng_san | 消風散 |  |
| ren_shen | 人參 | zhi_bao_dan | 至寶丹 |  |
| ren_shen | 人參 | huai_hua_san | 槐花散 |  |
| ren_shen | 人參 | tao_he_cheng_qi_tang | 桃核承氣湯 |  |
| dang_shen | 黨參 | tong_xie_yao_fang | 痛瀉要方 |  |
| dang_shen | 黨參 | ban_xia_xie_xin_tang | 半夏瀉心湯 |  |
| dang_shen | 黨參 | xiao_jian_zhong_tang | 小建中湯 |  |
| dang_shen | 黨參 | suan_zao_ren_tang | 酸棗仁湯 |  |
| dang_shen | 黨參 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| dang_shen | 黨參 | zhen_wu_tang | 真武湯 |  |
| dang_shen | 黨參 | bao_he_wan | 保和丸 |  |
| huang_qi | 黃耆 | xiao_jian_zhong_tang | 小建中湯 |  |
| huang_qi | 黃耆 | ban_xia_bai_zhu_tian_ma_tang | 半夏白朮天麻湯 |  |
| huang_qi | 黃耆 | huai_hua_san | 槐花散 |  |
| huang_qi | 黃耆 | qian_zheng_san | 牽正散 |  |
| bai_zhu | 白朮 | ma_huang_tang | 麻黃湯 |  |
| bai_zhu | 白朮 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| bai_zhu | 白朮 | xiao_jian_zhong_tang | 小建中湯 |  |
| bai_zhu | 白朮 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| bai_zhu | 白朮 | zhu_ling_tang | 豬苓湯 |  |
| bai_zhu | 白朮 | er_chen_tang | 二陳湯 |  |
| bai_zhu | 白朮 | bao_he_wan | 保和丸 |  |
| bai_zhu | 白朮 | zhi_bao_dan | 至寶丹 |  |
| bai_zhu | 白朮 | huai_hua_san | 槐花散 |  |
| bai_zhu | 白朮 | wu_mei_wan | 烏梅丸 |  |
| shan_yao | 山藥 | tong_xie_yao_fang | 痛瀉要方 |  |
| shan_yao | 山藥 | zhi_bao_dan | 至寶丹 |  |
| gan_cao | 甘草 | gui_zhi_tang | 桂枝湯 | 是 |
| gan_cao | 甘草 | ma_huang_tang | 麻黃湯 | 是 |
| gan_cao | 甘草 | si_jun_zi_tang | 四君子湯 | 是 |
| gan_cao | 甘草 | xiao_qing_long_tang | 小青龍湯 | 是 |
| gan_cao | 甘草 | xiang_su_san | 香蘇散 | 是 |
| gan_cao | 甘草 | jia_jian_wei_rui_tang | 加減葳蕤湯 | 是 |
| gan_cao | 甘草 | bai_hu_tang | 白虎湯 | 是 |
| gan_cao | 甘草 | zhu_ye_shi_gao_tang | 竹葉石膏湯 | 是 |
| gan_cao | 甘草 | xiao_chai_hu_tang | 小柴胡湯 | 是 |
| gan_cao | 甘草 | da_chai_hu_tang | 大柴胡湯 |  |
| gan_cao | 甘草 | xiao_yao_san | 逍遙散 | 是 |
| gan_cao | 甘草 | jia_wei_xiao_yao_san | 加味逍遙散 | 是 |
| gan_cao | 甘草 | tong_xie_yao_fang | 痛瀉要方 |  |
| gan_cao | 甘草 | ban_xia_xie_xin_tang | 半夏瀉心湯 | 是 |
| gan_cao | 甘草 | xiao_jian_zhong_tang | 小建中湯 | 是 |
| gan_cao | 甘草 | si_ni_tang | 四逆湯 | 是 |
| gan_cao | 甘草 | dang_gui_si_ni_tang | 當歸四逆湯 | 是 |
| gan_cao | 甘草 | liu_jun_zi_tang | 六君子湯 | 是 |
| gan_cao | 甘草 | shen_ling_bai_zhu_san | 參苓白朮散 | 是 |
| gan_cao | 甘草 | bu_zhong_yi_qi_tang | 補中益氣湯 | 是 |
| gan_cao | 甘草 | si_wu_tang | 四物湯 |  |
| gan_cao | 甘草 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| gan_cao | 甘草 | ba_zhen_tang | 八珍湯 | 是 |
| gan_cao | 甘草 | shi_quan_da_bu_tang | 十全大補湯 | 是 |
| gan_cao | 甘草 | zhi_gan_cao_tang | 炙甘草湯 | 是 |
| gan_cao | 甘草 | yi_guan_jian | 一貫煎 |  |
| gan_cao | 甘草 | sheng_hua_tang | 生化湯 | 是 |
| gan_cao | 甘草 | ping_wei_san | 平胃散 | 是 |
| gan_cao | 甘草 | huo_xiang_zheng_qi_san | 藿香正氣散 | 是 |
| gan_cao | 甘草 | zhen_wu_tang | 真武湯 |  |
| gan_cao | 甘草 | fang_ji_huang_qi_tang | 防己黃耆湯 | 是 |
| gan_cao | 甘草 | er_chen_tang | 二陳湯 | 是 |
| gan_cao | 甘草 | wen_dan_tang | 溫膽湯 | 是 |
| gan_cao | 甘草 | chuan_xiong_cha_tiao_san | 川芎茶調散 | 是 |
| gan_cao | 甘草 | bao_he_wan | 保和丸 |  |
| gan_cao | 甘草 | zhi_bao_dan | 至寶丹 |  |
| gan_cao | 甘草 | gui_pi_tang | 歸脾湯 | 是 |
| gan_cao | 甘草 | du_huo_ji_sheng_tang | 獨活寄生湯 | 是 |
| gan_cao | 甘草 | huai_hua_san | 槐花散 |  |
| gan_cao | 甘草 | ma_xing_shi_gan_tang | 麻杏石甘湯 | 是 |
| gan_cao | 甘草 | qian_zheng_san | 牽正散 |  |
| gan_cao | 甘草 | si_ni_san | 四逆散 | 是 |
| gan_cao | 甘草 | tao_he_cheng_qi_tang | 桃核承氣湯 | 是 |
| gan_cao | 甘草 | wu_mei_wan | 烏梅丸 |  |
| da_zao | 大棗 | shen_ling_bai_zhu_san | 參苓白朮散 |  |
| da_zao | 大棗 | suan_zao_ren_tang | 酸棗仁湯 |  |
| bai_shao | 白芍 | suan_zao_ren_tang | 酸棗仁湯 |  |
| bai_shao | 白芍 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| bai_shao | 白芍 | gui_pi_tang | 歸脾湯 |  |
| bai_shao | 白芍 | wu_mei_wan | 烏梅丸 |  |
| dang_gui | 當歸 | ma_zi_ren_wan | 麻子仁丸 |  |
| dang_gui | 當歸 | xiao_jian_zhong_tang | 小建中湯 |  |
| dang_gui | 當歸 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| dang_gui | 當歸 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| dang_gui | 當歸 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| dang_gui | 當歸 | ding_chuan_tang | 定喘湯 |  |
| dang_gui | 當歸 | huai_hua_san | 槐花散 |  |
| dang_gui | 當歸 | pu_ji_xiao_du_yin | 普濟消毒飲 |  |
| dang_gui | 當歸 | qian_zheng_san | 牽正散 |  |
| shu_di_huang | 熟地黃 | yi_guan_jian | 一貫煎 |  |
| e_jiao | 阿膠 | si_wu_tang | 四物湯 |  |
| he_shou_wu | 何首烏 | si_wu_tang | 四物湯 |  |
| he_shou_wu | 何首烏 | gui_pi_tang | 歸脾湯 |  |
| he_shou_wu | 何首烏 | ba_zhen_tang | 八珍湯 |  |
| he_shou_wu | 何首烏 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| long_yan_rou | 龍眼肉 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| bei_sha_shen | 北沙參 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| bei_sha_shen | 北沙參 | yi_guan_jian | 一貫煎 | 是 |
| bei_sha_shen | 北沙參 | zuo_gui_wan | 左歸丸 |  |
| mai_men_dong | 麥門冬 | bai_hu_tang | 白虎湯 |  |
| mai_men_dong | 麥門冬 | zuo_gui_wan | 左歸丸 |  |
| shi_hu | 石斛 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| shi_hu | 石斛 | yi_guan_jian | 一貫煎 |  |
| shi_hu | 石斛 | zuo_gui_wan | 左歸丸 |  |
| shi_hu | 石斛 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| shi_hu | 石斛 | ma_zi_ren_wan | 麻子仁丸 |  |
| yu_zhu | 玉竹 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| yu_zhu | 玉竹 | yi_guan_jian | 一貫煎 |  |
| yu_zhu | 玉竹 | zuo_gui_wan | 左歸丸 |  |
| yu_zhu | 玉竹 | sang_ju_yin | 桑菊飲 |  |
| yu_zhu | 玉竹 | mai_men_dong_tang | 麥門冬湯 |  |
| bai_he | 百合 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| bai_he | 百合 | yi_guan_jian | 一貫煎 |  |
| bai_he | 百合 | zuo_gui_wan | 左歸丸 |  |
| bai_he | 百合 | zhu_ye_shi_gao_tang | 竹葉石膏湯 |  |
| gou_qi_zi | 枸杞子 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| nu_zhen_zi | 女貞子 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| nu_zhen_zi | 女貞子 | yi_guan_jian | 一貫煎 |  |
| nu_zhen_zi | 女貞子 | zuo_gui_wan | 左歸丸 |  |
| nu_zhen_zi | 女貞子 | wen_jing_tang | 溫經湯 |  |
| nu_zhen_zi | 女貞子 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| gui_ban | 龜板 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| gui_ban | 龜板 | yi_guan_jian | 一貫煎 |  |
| gui_ban | 龜板 | zuo_gui_wan | 左歸丸 | 是 |
| lu_jiao_jiao | 鹿角膠 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| lu_rong | 鹿茸 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| lu_rong | 鹿茸 | you_gui_wan | 右歸丸 |  |
| yin_yang_huo | 淫羊藿 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| yin_yang_huo | 淫羊藿 | you_gui_wan | 右歸丸 |  |
| ba_ji_tian | 巴戟天 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| ba_ji_tian | 巴戟天 | you_gui_wan | 右歸丸 |  |
| ba_ji_tian | 巴戟天 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| ba_ji_tian | 巴戟天 | wen_jing_tang | 溫經湯 |  |
| du_zhong | 杜仲 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| du_zhong | 杜仲 | qian_zheng_san | 牽正散 |  |
| xu_duan | 續斷 | si_wu_tang | 四物湯 |  |
| bu_gu_zhi | 補骨脂 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| bu_gu_zhi | 補骨脂 | you_gui_wan | 右歸丸 |  |
| bu_gu_zhi | 補骨脂 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| tu_si_zi | 菟絲子 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| sha_yuan_zi | 沙苑子 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| sha_yuan_zi | 沙苑子 | you_gui_wan | 右歸丸 |  |
| suan_zao_ren | 酸棗仁 | zhi_gan_cao_tang | 炙甘草湯 |  |
| suan_zao_ren | 酸棗仁 | gan_mai_da_zao_tang | 甘麥大棗湯 |  |
| suan_zao_ren | 酸棗仁 | wen_dan_tang | 溫膽湯 |  |
| suan_zao_ren | 酸棗仁 | wan_dai_tang | 完帶湯 |  |
| bai_zi_ren | 柏子仁 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| yuan_zhi | 遠志 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| yuan_zhi | 遠志 | sheng_hua_tang | 生化湯 |  |
| yuan_zhi | 遠志 | wen_dan_tang | 溫膽湯 |  |
| yuan_zhi | 遠志 | zhi_bao_dan | 至寶丹 |  |
| he_huan_pi | 合歡皮 | suan_zao_ren_tang | 酸棗仁湯 |  |
| he_huan_pi | 合歡皮 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| he_huan_pi | 合歡皮 | gan_mai_da_zao_tang | 甘麥大棗湯 |  |
| wu_wei_zi | 五味子 | xiao_chai_hu_tang | 小柴胡湯 |  |
| wu_wei_zi | 五味子 | suan_zao_ren_tang | 酸棗仁湯 |  |
| wu_wei_zi | 五味子 | zhen_wu_tang | 真武湯 |  |
| wu_wei_zi | 五味子 | bai_he_gu_jin_tang | 百合固金湯 |  |
| wu_wei_zi | 五味子 | si_ni_san | 四逆散 |  |
| wu_bei_zi | 五倍子 | mu_li_san | 牡蠣散 |  |
| wu_bei_zi | 五倍子 | zhen_ren_yang_zang_tang | 真人養臟湯 |  |
| wu_bei_zi | 五倍子 | si_shen_wan | 四神丸 |  |
| shan_zhu_yu | 山茱萸 | wu_mei_wan | 烏梅丸 |  |
| lian_zi | 蓮子 | mu_li_san | 牡蠣散 |  |
| lian_zi | 蓮子 | zhen_ren_yang_zang_tang | 真人養臟湯 |  |
| lian_zi | 蓮子 | si_shen_wan | 四神丸 |  |
| lian_zi | 蓮子 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| lian_zi | 蓮子 | tong_xie_yao_fang | 痛瀉要方 |  |
| qian_shi | 芡實 | mu_li_san | 牡蠣散 |  |
| qian_shi | 芡實 | zhen_ren_yang_zang_tang | 真人養臟湯 |  |
| qian_shi | 芡實 | si_shen_wan | 四神丸 |  |
| qian_shi | 芡實 | shen_ling_bai_zhu_san | 參苓白朮散 |  |
| qian_shi | 芡實 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| fu_xiao_mai | 浮小麥 | zhen_ren_yang_zang_tang | 真人養臟湯 |  |
| fu_xiao_mai | 浮小麥 | si_shen_wan | 四神丸 |  |
| fu_xiao_mai | 浮小麥 | yu_ping_feng_san | 玉屏風散 |  |
| fu_xiao_mai | 浮小麥 | suan_zao_ren_tang | 酸棗仁湯 |  |
| dai_zhe_shi | 代赭石 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| dai_zhe_shi | 代赭石 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| xuan_fu_hua | 旋覆花 | er_chen_tang | 二陳湯 |  |
| xuan_fu_hua | 旋覆花 | wen_dan_tang | 溫膽湯 |  |
| xuan_fu_hua | 旋覆花 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| xuan_fu_hua | 旋覆花 | da_chai_hu_tang | 大柴胡湯 |  |
| gao_liang_jiang | 高良薑 | li_zhong_wan | 理中丸 |  |
| gao_liang_jiang | 高良薑 | si_ni_tang | 四逆湯 |  |
| gao_liang_jiang | 高良薑 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| hua_jiao | 花椒 | li_zhong_wan | 理中丸 |  |
| hua_jiao | 花椒 | si_ni_tang | 四逆湯 |  |
| hua_jiao | 花椒 | wu_zhu_yu_tang | 吳茱萸湯 |  |
| hua_jiao | 花椒 | xiao_jian_zhong_tang | 小建中湯 |  |
| fo_shou | 佛手 | yue_ju_wan | 越鞠丸 |  |
| fo_shou | 佛手 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| fo_shou | 佛手 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| mei_gui_hua | 玫瑰花 | yue_ju_wan | 越鞠丸 |  |
| mei_gui_hua | 玫瑰花 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| mei_gui_hua | 玫瑰花 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| mei_gui_hua | 玫瑰花 | yi_guan_jian | 一貫煎 |  |
| xie_bai | 薤白 | yue_ju_wan | 越鞠丸 |  |
| xie_bai | 薤白 | chai_hu_shu_gan_san | 柴胡疏肝散 |  |
| xie_bai | 薤白 | ban_xia_hou_po_tang | 半夏厚朴湯 |  |
| xie_bai | 薤白 | si_ni_san | 四逆散 |  |
| lai_fu_zi | 萊菔子 | jian_pi_wan | 健脾丸 |  |
| lai_fu_zi | 萊菔子 | ping_wei_san | 平胃散 |  |
| shi_jun_zi | 使君子 | wu_mei_wan | 烏梅丸 |  |
| ku_lian_pi | 苦楝皮 | wu_mei_wan | 烏梅丸 |  |
| bing_lang | 檳榔 | wu_mei_wan | 烏梅丸 |  |
| bing_lang | 檳榔 | huang_lian_jie_du_tang | 黃連解毒湯 |  |
| bing_lang | 檳榔 | ping_wei_san | 平胃散 |  |
| bing_lang | 檳榔 | bao_he_wan | 保和丸 |  |
| nan_gua_zi | 南瓜子 | wu_mei_wan | 烏梅丸 |  |
| xian_he_cao | 仙鶴草 | shi_hui_san | 十灰散 |  |
| xian_he_cao | 仙鶴草 | huai_hua_san | 槐花散 |  |
| xian_he_cao | 仙鶴草 | huang_tu_tang | 黃土湯 |  |
| xian_he_cao | 仙鶴草 | bai_he_gu_jin_tang | 百合固金湯 |  |
| pu_huang | 蒲黃 | shi_hui_san | 十灰散 |  |
| pu_huang | 蒲黃 | huai_hua_san | 槐花散 |  |
| pu_huang | 蒲黃 | huang_tu_tang | 黃土湯 |  |
| pu_huang | 蒲黃 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| qian_cao | 茜草 | shi_hui_san | 十灰散 | 是 |
| qian_cao | 茜草 | huai_hua_san | 槐花散 |  |
| qian_cao | 茜草 | huang_tu_tang | 黃土湯 |  |
| qian_cao | 茜草 | sang_ju_yin | 桑菊飲 |  |
| qian_cao | 茜草 | shi_xiao_san | 失笑散 |  |
| ru_xiang | 乳香 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| ru_xiang | 乳香 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| ru_xiang | 乳香 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| mo_yao | 沒藥 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| mo_yao | 沒藥 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| mo_yao | 沒藥 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| yi_mu_cao | 益母草 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| yi_mu_cao | 益母草 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| yi_mu_cao | 益母草 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| yi_mu_cao | 益母草 | bu_zhong_yi_qi_tang | 補中益氣湯 |  |
| yi_mu_cao | 益母草 | wen_jing_tang | 溫經湯 |  |
| yi_mu_cao | 益母草 | xiao_feng_san | 消風散 |  |
| yi_mu_cao | 益母草 | shi_xiao_san | 失笑散 |  |
| ze_lan | 澤蘭 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| ze_lan | 澤蘭 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| ze_lan | 澤蘭 | tao_hong_si_wu_tang | 桃紅四物湯 |  |
| bai_jie_zi | 白芥子 | er_chen_tang | 二陳湯 |  |
| bai_jie_zi | 白芥子 | wen_dan_tang | 溫膽湯 |  |
| bai_jie_zi | 白芥子 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| qian_hu | 前胡 | er_chen_tang | 二陳湯 |  |
| qian_hu | 前胡 | wen_dan_tang | 溫膽湯 |  |
| qian_hu | 前胡 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| bai_bu | 百部 | er_chen_tang | 二陳湯 |  |
| bai_bu | 百部 | wen_dan_tang | 溫膽湯 |  |
| bai_bu | 百部 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| bai_bu | 百部 | mai_men_dong_tang | 麥門冬湯 |  |
| pi_pa_ye | 枇杷葉 | er_chen_tang | 二陳湯 |  |
| pi_pa_ye | 枇杷葉 | wen_dan_tang | 溫膽湯 |  |
| pi_pa_ye | 枇杷葉 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| pi_pa_ye | 枇杷葉 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| ting_li_zi | 葶藶子 | er_chen_tang | 二陳湯 |  |
| ting_li_zi | 葶藶子 | wen_dan_tang | 溫膽湯 |  |
| ting_li_zi | 葶藶子 | bei_mu_gua_lou_san | 貝母瓜蔞散 |  |
| ting_li_zi | 葶藶子 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| bai_jiang_can | 白僵蠶 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| bai_jiang_can | 白僵蠶 | ling_jiao_gou_teng_tang | 羚角鉤藤湯 |  |
| ye_jiao_teng | 夜交藤 | suan_zao_ren_tang | 酸棗仁湯 |  |
| ye_jiao_teng | 夜交藤 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| ye_jiao_teng | 夜交藤 | gan_mai_da_zao_tang | 甘麥大棗湯 |  |
| ye_jiao_teng | 夜交藤 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| tai_zi_shen | 太子參 | si_jun_zi_tang | 四君子湯 |  |
| tai_zi_shen | 太子參 | bu_zhong_yi_qi_tang | 補中益氣湯 |  |
| tai_zi_shen | 太子參 | sheng_mai_san | 生脈散 |  |
| xi_yang_shen | 西洋參 | si_jun_zi_tang | 四君子湯 |  |
| xi_yang_shen | 西洋參 | bu_zhong_yi_qi_tang | 補中益氣湯 |  |
| xi_yang_shen | 西洋參 | mai_men_dong_tang | 麥門冬湯 |  |
| xi_yang_shen | 西洋參 | qing_zao_jiu_fei_tang | 清燥救肺湯 |  |
| sang_shen | 桑椹 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| sang_shen | 桑椹 | yi_guan_jian | 一貫煎 |  |
| sang_shen | 桑椹 | zuo_gui_wan | 左歸丸 |  |
| han_lian_cao | 旱蓮草 | liu_wei_di_huang_wan | 六味地黃丸 |  |
| han_lian_cao | 旱蓮草 | yi_guan_jian | 一貫煎 |  |
| han_lian_cao | 旱蓮草 | zuo_gui_wan | 左歸丸 |  |
| han_lian_cao | 旱蓮草 | tong_xie_yao_fang | 痛瀉要方 |  |
| han_lian_cao | 旱蓮草 | wen_jing_tang | 溫經湯 |  |
| rou_cong_rong | 肉蓯蓉 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| rou_cong_rong | 肉蓯蓉 | you_gui_wan | 右歸丸 |  |
| rou_cong_rong | 肉蓯蓉 | zuo_gui_wan | 左歸丸 |  |
| yi_zhi_ren | 益智仁 | jin_gui_shen_qi_wan | 金匱腎氣丸 |  |
| yi_zhi_ren | 益智仁 | you_gui_wan | 右歸丸 |  |
| yi_zhi_ren | 益智仁 | zhi_bao_dan | 至寶丹 |  |
| wu_zei_gu | 烏賊骨 | mu_li_san | 牡蠣散 |  |
| wu_zei_gu | 烏賊骨 | zhen_ren_yang_zang_tang | 真人養臟湯 |  |
| wu_zei_gu | 烏賊骨 | si_shen_wan | 四神丸 |  |
| rou_dou_kou | 肉豆蔻 | mu_li_san | 牡蠣散 |  |
| chuan_niu_xi | 川牛膝 | du_huo_ji_sheng_tang | 獨活寄生湯 | 是 |
| fu_shen | 茯神 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| fu_shen | 茯神 | huang_lian_e_jiao_tang | 黃連阿膠湯 |  |
| fu_shen | 茯神 | zhi_bao_dan | 至寶丹 |  |
| tong_cao | 通草 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| tong_cao | 通草 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| sha_shen | 沙參 | bai_he_gu_jin_tang | 百合固金湯 |  |
| sha_shen | 沙參 | mai_men_dong_tang | 麥門冬湯 |  |
| bai_wei | 白薇 | qing_hao_bie_jia_tang | 青蒿鱉甲湯 |  |
| da_fu_pi | 大腹皮 | wu_ling_san | 五苓散 |  |
| da_ji | 大薊 | zhu_ling_tang | 豬苓湯 |  |
| xiao_ji | 小薊 | zhu_ling_tang | 豬苓湯 |  |
| sang_bai_pi | 桑白皮 | sang_ju_yin | 桑菊飲 |  |
| sang_bai_pi | 桑白皮 | wu_ling_san | 五苓散 |  |
| sang_bai_pi | 桑白皮 | bai_he_gu_jin_tang | 百合固金湯 |  |
| sang_bai_pi | 桑白皮 | ma_xing_shi_gan_tang | 麻杏石甘湯 |  |
| sang_bai_pi | 桑白皮 | qing_zao_jiu_fei_tang | 清燥救肺湯 |  |
| sang_piao_xiao | 桑螵蛸 | zhen_wu_tang | 真武湯 |  |
| huai_hua | 槐花 | ma_zi_ren_wan | 麻子仁丸 |  |
| huai_hua | 槐花 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| bai_bian_dou | 白扁豆 | tong_xie_yao_fang | 痛瀉要方 |  |
| bai_mao_gen | 白茅根 | yin_qiao_san | 銀翹散 |  |
| bai_mao_gen | 白茅根 | sang_ju_yin | 桑菊飲 |  |
| bai_mao_gen | 白茅根 | zhu_ling_tang | 豬苓湯 |  |
| bai_mao_gen | 白茅根 | bai_he_gu_jin_tang | 百合固金湯 |  |
| bai_mao_gen | 白茅根 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| shi_jue_ming | 石決明 | bu_yang_huan_wu_tang | 補陽還五湯 |  |
| ling_yang_jiao | 羚羊角 | bai_hu_tang | 白虎湯 |  |
| ling_yang_jiao | 羚羊角 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| ling_yang_jiao | 羚羊角 | qing_zao_jiu_fei_tang | 清燥救肺湯 |  |
| qian_cao_gen | 茜草根 | sang_ju_yin | 桑菊飲 |  |
| qian_cao_gen | 茜草根 | shi_xiao_san | 失笑散 |  |
| he_ye | 荷葉 | bai_hu_tang | 白虎湯 |  |
| bian_xu | 萹蓄 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| xue_yu_tan | 血餘炭 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| xue_yu_tan | 血餘炭 | shi_xiao_san | 失笑散 |  |
| wu_ling_zhi | 五靈脂 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| bie_jia | 鱉甲 | yi_guan_jian | 一貫煎 |  |
| bie_jia | 鱉甲 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| wu_mei | 烏梅 | qing_hao_bie_jia_tang | 青蒿鱉甲湯 |  |
| wu_mei | 烏梅 | er_chen_tang | 二陳湯 |  |
| cong_bai | 蔥白 | bai_hu_tang | 白虎湯 |  |
| yin_xing | 銀杏 | ding_chuan_tang | 定喘湯 | 是 |
| she_xiang | 麝香 | zhi_bao_dan | 至寶丹 |  |
| zi_cao | 紫草 | xiao_feng_san | 消風散 |  |
| shan_dou_gen | 山豆根 | gan_lu_xiao_du_dan | 甘露消毒丹 |  |
| fan_xie_ye | 番瀉葉 | huo_xiang_zheng_qi_san | 藿香正氣散 |  |
| fan_xie_ye | 番瀉葉 | wu_ling_san | 五苓散 |  |
| cao_dou_kou | 草豆蔻 | ping_wei_san | 平胃散 |  |
| cao_guo | 草果 | san_ren_tang | 三仁湯 |  |
| hai_jin_sha | 海金沙 | da_chai_hu_tang | 大柴胡湯 |  |
| wu_yao | 烏藥 | dang_gui_si_ni_tang | 當歸四逆湯 |  |
| wu_yao | 烏藥 | xue_fu_zhu_yu_tang | 血府逐瘀湯 |  |
| wu_yao | 烏藥 | wen_jing_tang | 溫經湯 |  |
| wu_yao | 烏藥 | gui_zhi_fu_ling_wan | 桂枝茯苓丸 |  |
| wu_yao | 烏藥 | ping_wei_san | 平胃散 |  |
| wu_yao | 烏藥 | qian_zheng_san | 牽正散 |  |
| jiang_huang | 薑黃 | jiu_wei_qiang_huo_tang | 九味羌活湯 |  |
| ci_shi | 磁石 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| ci_shi | 磁石 | tian_ma_gou_teng_yin | 天麻鉤藤飲 |  |
| wu_gong | 蜈蚣 | da_ding_feng_zhu | 大定風珠 |  |
| bai_guo | 白果 | ding_chuan_tang | 定喘湯 |  |
| chen_xiang | 沉香 | su_zi_jiang_qi_tang | 蘇子降氣湯 |  |
| chuan_mu_tong | 川木通 | dao_chi_san | 導赤散 | 是 |
| chuan_mu_tong | 川木通 | ba_zheng_san | 八正散 | 是 |
| gua_lou_pi | 栝樓皮 | xiao_xian_xiong_tang | 小陷胸湯 |  |
| gua_lou_pi | 栝樓皮 | gua_lou_xie_bai_ban_xia_tang | 瓜蔞薤白半夏湯 |  |
| huai_mi | 槐米 | huai_hua_san | 槐花散 |  |
| zhi_gan_cao | 炙甘草 | gan_mai_da_zao_tang | 甘麥大棗湯 | 是 |
| zhu_sha | 硃砂 | tian_wang_bu_xin_dan | 天王補心丹 |  |
| an_xi_xiang | 安息香 | zhi_bao_dan | 至寶丹 |  |

### HB-5 — 慎用藥卻缺禁忌欄或缺標準劑量（19）

| herb id | 中文 | safety_flags | contraindications_zh 空 | dosage_g.standard_daily_g 空 |
|---|---|---|---|---|
| xi_xin | 細辛 | toxicity_review, pregnancy_review, kidney_disease_review, dose_preparation_review | false | true |
| cang_er_zi | 蒼耳子 | toxicity_review, pregnancy_review | false | true |
| ku_shen | 苦參 | pregnancy_review, toxicity_review | true | true |
| gan_sui | 甘遂 | toxicity_review, pregnancy_review, not_for_self_treatment, dehydration_electrolyte_review, dose_preparation_review | true | true |
| mu_tong | 木通 | pregnancy_review, kidney_disease_review, toxicity_review, dose_preparation_review | true | false |
| fu_zi | 附子 | toxicity_review, cardiac_review, pregnancy_review, not_for_self_treatment, dose_preparation_review, incompatibility_review | false | true |
| wu_zhu_yu | 吳茱萸 | pregnancy_review, toxicity_review, dose_preparation_review | false | true |
| chuan_lian_zi | 川楝子 | toxicity_review, pregnancy_review, liver_disease_review, dose_preparation_review | true | true |
| ban_xia | 半夏 | toxicity_review, pregnancy_review, dose_preparation_review, incompatibility_review | false | true |
| tian_nan_xing | 天南星 | toxicity_review, pregnancy_review, dose_preparation_review | false | true |
| xing_ren | 杏仁 | toxicity_review, pregnancy_review | true | true |
| kuan_dong_hua | 款冬花 | pregnancy_review, toxicity_review | true | true |
| quan_xie | 全蠍 | toxicity_review, pregnancy_review, not_for_self_treatment, urgent_red_flag_review, dose_preparation_review | true | true |
| he_shou_wu | 何首烏 | liver_disease_review, toxicity_review, pregnancy_review | true | true |
| ku_lian_pi | 苦楝皮 | toxicity_review, pregnancy_review, not_for_self_treatment, dose_preparation_review | true | true |
| bing_lang | 檳榔 | pregnancy_review, gi_red_flags, toxicity_review, dose_preparation_review | true | true |
| rou_dou_kou | 肉豆蔻 | pregnancy_review, toxicity_review | true | false |
| xiong_huang | 雄黃 | toxicity_review, pregnancy_review, not_for_self_treatment, dose_preparation_review, heavy_metal_review | false | true |
| zhu_sha | 硃砂 | toxicity_review, pregnancy_review, not_for_self_treatment, dose_preparation_review, heavy_metal_review, medication_review | false | true |

### HB-6 — properties_taste_temp 自相矛盾（有毒+無毒 或 寒+溫，11）

| herb id | 中文 | properties_taste_temp | 衝突類型 |
|---|---|---|---|
| dan_dou_chi | 淡豆豉 | 「甘、微苦、辛，寒或溫」 | 寒+溫 |
| chi_shao | 赤芍 | 「甘、苦、平、澀、微寒、無毒、酸、鹹、涼、小毒」 | 有毒+無毒 |
| da_huang | 大黃 | 「甘、苦、有毒、寒、無毒」 | 有毒+無毒 |
| mang_xiao | 芒硝 | 「辛、甘、苦、寒、無毒、鹹、小毒、大寒、微甘」 | 有毒+無毒 |
| zhi_shi | 枳實 | 「辛、寒、苦、溫、酸」 | 寒+溫 |
| san_leng | 三棱 | 「溫、甘、辛、苦、澀、無毒、涼、平」 | 寒+溫 |
| gui_ban | 龜板 | 「甘、平、有毒、無毒、鹹」 | 有毒+無毒 |
| hua_jiao | 花椒 | 「溫、辛、苦、無毒、小毒、有毒、大熱」 | 有毒+無毒 |
| ting_li_zi | 葶藶子 | 「辛、苦、寒、有毒、無毒」 | 有毒+無毒 |
| tai_zi_shen | 太子參 | 「甘、微苦、平、微溫、微寒、無毒」 | 寒+溫 |
| wu_zei_gu | 烏賊骨 | 「微溫、澀、有毒、鹹、無毒」 | 有毒+無毒 |

### HB-8 — review_status 不在 draft/source_checked/deprecated（48）

分布：draft=273、source_checked=37、sourced_cloudtcm_record=41、draft_reviewed=1、(undefined)=5、reviewed=1

| herb id | 中文 | review_status |
|---|---|---|
| dan_zhu_ye | 淡竹葉 | sourced_cloudtcm_record |
| sha_shen | 沙參 | sourced_cloudtcm_record |
| bai_wei | 白薇 | sourced_cloudtcm_record |
| zi_su_zi | 紫蘇子 | sourced_cloudtcm_record |
| da_fu_pi | 大腹皮 | sourced_cloudtcm_record |
| da_ji | 大薊 | sourced_cloudtcm_record |
| xiao_ji | 小薊 | sourced_cloudtcm_record |
| she_gan | 射干 | sourced_cloudtcm_record |
| sang_bai_pi | 桑白皮 | sourced_cloudtcm_record |
| sang_piao_xiao | 桑螵蛸 | sourced_cloudtcm_record |
| huai_hua | 槐花 | sourced_cloudtcm_record |
| bai_bian_dou | 白扁豆 | sourced_cloudtcm_record |
| bai_mao_gen | 白茅根 | sourced_cloudtcm_record |
| shi_jue_ming | 石決明 | sourced_cloudtcm_record |
| ling_yang_jiao | 羚羊角 | sourced_cloudtcm_record |
| qian_cao_gen | 茜草根 | sourced_cloudtcm_record |
| he_ye | 荷葉 | sourced_cloudtcm_record |
| xue_yu_tan | 血餘炭 | sourced_cloudtcm_record |
| bie_jia | 鱉甲 | sourced_cloudtcm_record |
| yin_xing | 銀杏 | sourced_cloudtcm_record |
| yi_tang | 飴糖 | sourced_cloudtcm_record |
| ma_bo | 馬勃 | sourced_cloudtcm_record |
| she_xiang | 麝香 | sourced_cloudtcm_record |
| hei_zhi_ma | 黑芝麻 | sourced_cloudtcm_record |
| zi_cao | 紫草 | sourced_cloudtcm_record |
| chuan_xin_lian | 穿心蓮 | sourced_cloudtcm_record |
| shan_dou_gen | 山豆根 | sourced_cloudtcm_record |
| ma_chi_xian | 馬齒莧 | sourced_cloudtcm_record |
| chui_pen_cao | 垂盆草 | sourced_cloudtcm_record |
| bai_jiang_cao | 敗醬草 | sourced_cloudtcm_record |
| fan_xie_ye | 番瀉葉 | sourced_cloudtcm_record |
| lu_hui | 蘆薈 | sourced_cloudtcm_record |
| cao_dou_kou | 草豆蔻 | sourced_cloudtcm_record |
| cao_guo | 草果 | sourced_cloudtcm_record |
| hai_jin_sha | 海金沙 | sourced_cloudtcm_record |
| wu_yao | 烏藥 | sourced_cloudtcm_record |
| pang_da_hai | 胖大海 | sourced_cloudtcm_record |
| ci_shi | 磁石 | sourced_cloudtcm_record |
| bing_pian | 冰片 | sourced_cloudtcm_record |
| huang_jing | 黃精 | sourced_cloudtcm_record |
| mo_han_lian | 墨旱蓮 | sourced_cloudtcm_record |
| bai_ji_li | 白蒺藜 | draft_reviewed |
| bai_guo | 白果 | (undefined) |
| bai_qian | 白前 | (undefined) |
| ban_zhi_lian | 半枝蓮 | (undefined) |
| bi_ba | 蓽茇 | (undefined) |
| bi_xie | 萆薢 | (undefined) |
| zhi_gan_cao | 炙甘草 | reviewed |

### HB-9 — card_grade=gold 卻 field_sources 空（1）

| herb id | 中文 | card_grade | field_sources |
|---|---|---|---|
| zhi_gan_cao | 炙甘草 | gold | {} |

### HB-10 — contraindications_zh 與 cautions_zh 逐字重複（7）

**xiang_ru（香薷）**
- 「表虛者忌服。」
- 「火盛氣虛、陰虛有熱者禁用。」
- 「孕婦忌用。」

**qiang_huo（羌活）**
- 「脾胃虛弱者不宜服：羌活性味辛散，脾胃虛弱者服用後容易加重脾胃虛弱的情況，應避免使用。」
- 「血虛痺痛，陰虛頭痛者慎用：羌活有活血祛風的作用，血虛痺痛、陰虛頭痛者服用後可能會加重症狀，應慎用。」

**bai_zhi（白芷）**
- 「嘔吐因火者禁用：白芷性溫熱，會加重火氣，導致嘔吐加劇。」
- 「漏下赤白陰虛火熾血熱者勿用：白芷會加重陰虛血熱的症狀，導致漏下赤白或血熱加劇。」
- 「陰虛血熱者忌服：白芷性溫熱，會加重陰虛血熱的症狀。」
- 「惡旋覆花：白芷與旋覆花相惡，同時使用會降低療效。」
- 「寒凍、陽虛火熄、血熱上亢者禁用：白芷屬溫熱性中藥，不適用於這些體質的人士。」
- 「孕婦和哺乳期婦女避免使用：白芷可能會影響胎兒發育或乳汁分泌。」

**cang_er_zi（蒼耳子）**
- 「血虛體質者忌服：蒼耳子性溫，血虛者服用後易導致頭暈、頭痛等不適。」
- 「孕婦、哺乳期婦女禁服：蒼耳子中的成分可能會影響胎兒或嬰兒的健康，因此孕婦和哺乳期婦女應禁用。」

**xin_yi（辛夷）**
- 「氣虛者忌服：因辛夷花性偏溫熱，氣虛者服用恐會耗傷元氣。」
- 「血虛火熾者忌服：辛夷花可活血化瘀，血虛火熾者服用恐會加重火氣，導致頭腦疼痛。」
- 「齒痛屬胃火者忌服：辛夷花可刺激咽喉，且具有溫熱性，齒痛屬胃火者服用恐會加劇疼痛。」
- 「孕婦忌服：辛夷花具有舒筋活血、促進血液循環的作用，孕婦服用可能影響胎兒健康。」

**cong_bai（蔥白）**
- 「表虛多汗者忌用」

**gao_ben（藁本）**
- 「陰虛血頭痛忌服」

### HB-11 — clinical_use_note 與 chinese_depth_track.summary_zh 逐字相同（182，學習筆記未撰寫）

只列 id/中文（逐字內容見各卡 `clinical_use_note`，通常是 CloudTCM 傾倒式簡介，起首多為「<藥名>是中藥，別名:…」）：

| herb id | 中文 |
|---|---|
| gui_zhi | 桂枝 |
| zi_su_ye | 紫蘇葉 |
| sheng_jiang | 生薑 |
| jing_jie | 荊芥 |
| fang_feng | 防風 |
| ju_hua | 菊花 |
| ge_gen | 葛根 |
| chai_hu | 柴胡 |
| sheng_ma | 升麻 |
| man_jing_zi | 蔓荊子 |
| dan_dou_chi | 淡豆豉 |
| shi_gao | 石膏 |
| zhi_mu | 知母 |
| lu_gen | 蘆根 |
| tian_hua_fen | 天花粉 |
| zhi_zi | 梔子 |
| xia_ku_cao | 夏枯草 |
| huang_qin | 黃芩 |
| huang_lian | 黃連 |
| huang_bai | 黃柏 |
| long_dan_cao | 龍膽草 |
| ku_shen | 苦參 |
| jin_yin_hua | 金銀花 |
| lian_qiao | 連翹 |
| pu_gong_ying | 蒲公英 |
| zi_hua_di_ding | 紫花地丁 |
| da_qing_ye | 大青葉 |
| ban_lan_gen | 板藍根 |
| yu_xing_cao | 魚腥草 |
| bai_tou_weng | 白頭翁 |
| sheng_di_huang | 生地黃 |
| xuan_shen | 玄參 |
| mu_dan_pi | 牡丹皮 |
| chi_shao | 赤芍 |
| qing_hao | 青蒿 |
| di_gu_pi | 地骨皮 |
| yin_chai_hu | 銀柴胡 |
| da_huang | 大黃 |
| mang_xiao | 芒硝 |
| huo_ma_ren | 火麻仁 |
| yu_li_ren | 郁李仁 |
| gan_sui | 甘遂 |
| du_huo | 獨活 |
| wei_ling_xian | 威靈仙 |
| qin_jiao | 秦艽 |
| fang_ji | 防己 |
| sang_ji_sheng | 桑寄生 |
| wu_jia_pi | 五加皮 |
| mu_gua | 木瓜 |
| huo_xiang | 藿香 |
| pei_lan | 佩蘭 |
| cang_zhu | 蒼朮 |
| hou_po | 厚朴 |
| sha_ren | 砂仁 |
| bai_dou_kou | 白豆蔻 |
| fu_ling | 茯苓 |
| zhu_ling | 豬苓 |
| ze_xie | 澤瀉 |
| yi_yi_ren | 薏苡仁 |
| che_qian_zi | 車前子 |
| mu_tong | 木通 |
| hua_shi | 滑石 |
| yin_chen_hao | 茵陳蒿 |
| jin_qian_cao | 金錢草 |
| fu_zi | 附子 |
| gan_jiang | 乾薑 |
| rou_gui | 肉桂 |
| wu_zhu_yu | 吳茱萸 |
| xiao_hui_xiang | 小茴香 |
| ding_xiang | 丁香 |
| ju_hong | 橘紅 |
| zhi_shi | 枳實 |
| mu_xiang | 木香 |
| xiang_fu | 香附 |
| chuan_lian_zi | 川楝子 |
| qing_pi | 青皮 |
| shan_zha | 山楂 |
| shen_qu | 神麴 |
| mai_ya | 麥芽 |
| ji_nei_jin | 雞內金 |
| san_qi | 三七 |
| bai_ji | 白及 |
| ai_ye | 艾葉 |
| di_yu | 地榆 |
| ce_bai_ye | 側柏葉 |
| chuan_xiong | 川芎 |
| yan_hu_suo | 延胡索 |
| yu_jin | 鬱金 |
| dan_shen | 丹參 |
| hong_hua | 紅花 |
| wang_bu_liu_xing | 王不留行 |
| e_zhu | 莪朮 |
| san_leng | 三棱 |
| ji_xue_teng | 雞血藤 |
| ban_xia | 半夏 |
| tian_nan_xing | 天南星 |
| jie_geng | 桔梗 |
| chuan_bei_mu | 川貝母 |
| gua_lou | 瓜蔞 |
| zhu_ru | 竹茹 |
| xing_ren | 杏仁 |
| su_zi | 蘇子 |
| kuan_dong_hua | 款冬花 |
| zi_wan | 紫菀 |
| shi_chang_pu | 石菖蒲 |
| su_he_xiang | 蘇合香 |
| gou_teng | 鉤藤 |
| tian_ma | 天麻 |
| di_long | 地龍 |
| quan_xie | 全蠍 |
| mu_li | 牡蠣 |
| long_gu | 龍骨 |
| dang_shen | 黨參 |
| huang_qi | 黃耆 |
| shan_yao | 山藥 |
| dang_gui | 當歸 |
| shu_di_huang | 熟地黃 |
| e_jiao | 阿膠 |
| he_shou_wu | 何首烏 |
| long_yan_rou | 龍眼肉 |
| bei_sha_shen | 北沙參 |
| mai_men_dong | 麥門冬 |
| tian_men_dong | 天門冬 |
| shi_hu | 石斛 |
| yu_zhu | 玉竹 |
| bai_he | 百合 |
| gou_qi_zi | 枸杞子 |
| nu_zhen_zi | 女貞子 |
| gui_ban | 龜板 |
| lu_jiao_jiao | 鹿角膠 |
| lu_rong | 鹿茸 |
| yin_yang_huo | 淫羊藿 |
| ba_ji_tian | 巴戟天 |
| du_zhong | 杜仲 |
| xu_duan | 續斷 |
| bu_gu_zhi | 補骨脂 |
| tu_si_zi | 菟絲子 |
| sha_yuan_zi | 沙苑子 |
| suan_zao_ren | 酸棗仁 |
| bai_zi_ren | 柏子仁 |
| yuan_zhi | 遠志 |
| he_huan_pi | 合歡皮 |
| wu_wei_zi | 五味子 |
| wu_bei_zi | 五倍子 |
| shan_zhu_yu | 山茱萸 |
| lian_zi | 蓮子 |
| qian_shi | 芡實 |
| fu_xiao_mai | 浮小麥 |
| dai_zhe_shi | 代赭石 |
| xuan_fu_hua | 旋覆花 |
| gao_liang_jiang | 高良薑 |
| hua_jiao | 花椒 |
| fo_shou | 佛手 |
| mei_gui_hua | 玫瑰花 |
| xie_bai | 薤白 |
| lai_fu_zi | 萊菔子 |
| shi_jun_zi | 使君子 |
| ku_lian_pi | 苦楝皮 |
| bing_lang | 檳榔 |
| nan_gua_zi | 南瓜子 |
| xian_he_cao | 仙鶴草 |
| pu_huang | 蒲黃 |
| qian_cao | 茜草 |
| ru_xiang | 乳香 |
| mo_yao | 沒藥 |
| yi_mu_cao | 益母草 |
| ze_lan | 澤蘭 |
| bai_jie_zi | 白芥子 |
| qian_hu | 前胡 |
| bai_bu | 百部 |
| pi_pa_ye | 枇杷葉 |
| ting_li_zi | 葶藶子 |
| bai_jiang_can | 白僵蠶 |
| ye_jiao_teng | 夜交藤 |
| tai_zi_shen | 太子參 |
| xi_yang_shen | 西洋參 |
| sang_shen | 桑椹 |
| han_lian_cao | 旱蓮草 |
| rou_cong_rong | 肉蓯蓉 |
| yi_zhi_ren | 益智仁 |
| wu_zei_gu | 烏賊骨 |
| rou_dou_kou | 肉豆蔻 |

### HB-12 — primary_actions_en 復活（模板已刪除此欄，6）

**tao_ren（桃仁）**
- 「1. Invigorates blood and removes blood stasis (婦科月經不調、痛經、產後腹痛、跌打、肺癰腸癰要藥)」
- 「2. Moistens the Intestines and unblocks the bowels (津枯腸燥便秘要藥)」

**wu_wei_zi（五味子）**
- 「1. Astringes Lung qi and stops cough/wheezing」
- 「2. Stabilizes and binds leakage of essence」
- 「3. Stops spontaneous and night sweating」
- 「4. Generates fluids and alleviates thirst」
- 「5. Calms the Shen」

**rou_dou_kou（肉豆蔻）**
- 「1. Warms middle burner」
- 「2. Binds intestines and stops diarrhea」
- 「3. Moves qi and alleviates pain」

**wu_mei（烏梅）**
- 「1. Astringes Lung and stops chronic cough」
- 「2. Binds intestines and stops chronic diarrhea」
- 「3. Generates fluids」
- 「4. Expels roundworms and alleviates pain」

**he_zi（訶子）**
- 「1. Astringes/restrains Lung and benefits voice」
- 「2. Binds intestines and stops diarrhea」

**chi_shi_zhi（赤石脂）**
- 「1. Strongly binds Intestines; stops diarrhea」
- 「2. Stops bleeding」
- 「3. Promotes healing of sores (topical)」

---

本文件由 `node scripts/validate-herb-integrity-predicates.js --worklist --json` 的輸出程式化生成，
沒有手抄數字。`git status` 於本檔寫入前，除本輪新增的 `scripts/validate-herb-integrity-predicates.js`、
`.github/workflows/validate.yml` 的一段插入、與本檔外，沒有其他變更。

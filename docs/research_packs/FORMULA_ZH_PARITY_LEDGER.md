# FORMULA_ZH_PARITY_LEDGER — 方劑安全欄位中文補譯

Branch `codex/formula-zh-safety-parity`（自 `origin/codex/pattern-v2` @ `7b23d0c`）；
批次 3 在 `codex/formula-zh-parity-3`（自 `origin/codex/pattern-v2` @ `0805e6a`）；
批次 4 在 `codex/formula-zh-parity-4`（自 `origin/codex/pattern-v2` @ `9429ada`）；
批次 5 在 `codex/formula-zh-parity-5`（自 `origin/codex/pattern-v2` @ `7e510ab`）。
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

## 1b. 本批已譯（批次 2，22 筆，2026-08-11）

延續同一規則：只動 `contraindications_zh` / `cautions_zh`；忠實翻譯既有已核准
`_en` 內容，不新增未查證主張，不刪除既有中文。取自 §3（批次 1 後）清單最前
22 筆，跳過第 2 節已記帳的 2 筆 junk-blocked 記錄
（`formula.fu_yuan_huo_xue_tang` / `_import_stub`，兩筆都排在清單很後段，
本批天然未觸及）。

**對齊做法**：英文條目逐條配對既有中文（能對上的重排到對應位置，未改字）；
缺口才新譯。部分方劑既有中文是「一句話涵蓋多條英文」的既成翻譯
（如白虎湯「白虎四禁」一句已涵蓋英文 4 條脈診禁忌），**不拆句**，
只在缺口處新增未涵蓋的條目——因此下表 after 計數會小於 `_en` 長度，
是內容涵蓋完整但條數未 1:1 的刻意結果，非缺陷（驗證器 F4 對此不擋，
見 `scripts/validate-formula-standard.js` 2026-08-07 註解：長度不等時渲染層
分開顯示兩份清單，不會錯位配對）。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 14 | `formula.ma_huang_tang` | contraindications | 4/11 | **15/11** | 新譯 11 條插入陣列前段對齊英文順序；既有 4 條（表虛自汗／瘡家衄家／心臟病高血壓／孕婦）與此 11 條 AD 清單非同一來源，保留於陣列末尾不刪除 |
| 14 | `formula.ma_huang_tang` | cautions | 6/11 | **11/11** | 既有 6 條（風熱／脈弱／體虛／小便頻多／高血壓／短期）已是 en[4,5,6,7,8,10] 的忠實譯文，重排對齊後插入缺口 en[0,1,2,3,9] 五條新譯，**完全對齊** |
| 15 | `formula.xiao_qing_long_tang` | contraindications | 4/7 | **8/7** | 既有 4 條對齊 en[3,4,6]（陰虛乾咳／黃稠痰／高血壓）後插入 en[0,1,2,5] 四條新譯；既有「孕婦慎用」（非此清單內容）保留於末尾 |
| 15 | `formula.xiao_qing_long_tang` | cautions | 2/8 | **7/8**⚠️ | 既有 2 條對齊 en[0,1] 後補譯 en[2,3,4,5,6] 五條；en[7]「Contraindicated for those with **for those with** hypertension.」與 en[6] 語意重複且文法破損 → junk-blocked 不譯，見第 2 節新增列 |
| 16 | `formula.jiu_wei_qiang_huo_tang` | cautions | 0/2 | **2/2** | 全新譯：溫病者禁用／陰虛者宜特別謹慎。contraindications 原已 2/2 對齊，本次未動 |
| 17 | `formula.yin_qiao_san` | cautions | 0/2 | **2/2** | 全新譯。contraindications 原已 3 條（多於英文 2 條），本次未動 |
| 18 | `formula.sang_ju_yin` | cautions | 0/1 | **1/1** | 全新譯。contraindications 原已 2 條，本次未動 |
| 19 | `formula.chai_ge_jie_ji_tang` | cautions | 0/3 | **3/3** | cautions_en 與 contraindications_en 逐字相同，比照既有 contraindications_zh 忠實譯文填入 |
| 20 | `formula.sheng_ma_ge_gen_tang` | contraindications | 0/4 | **4/4** | 全新譯（本方自身麻疹禁忌內容，與 formula.ge_gen_tang 之前誤植無關，見同日 Task 1 修正） |
| 20 | `formula.sheng_ma_ge_gen_tang` | cautions | 0/4 | **4/4** | 同上，cautions_en 與 contraindications_en 逐字相同 |
| 21 | `formula.jia_jian_wei_rui_tang` | contraindications | 0/1 | **1/1** | 全新譯：非陰虛之表證者禁用 |
| 21 | `formula.jia_jian_wei_rui_tang` | cautions | 0/1 | **1/1** | 同上 |
| 22 | `formula.bai_hu_tang` | contraindications | 4/7 | **6/7**⚠️ | 既有「白虎四禁」一句已涵蓋 en[3,4,5,6] 四條；新增 en[0]（脾胃陰虛發熱兼自汗倦怠惡風脈浮虛）、en[2]（陽明腑實證）兩條。內容涵蓋完整，計數未達 7 因白虎四禁未拆句 |
| 22 | `formula.bai_hu_tang` | cautions | 0/7 | **7/7** | 全新逐條譯（不沿用「白虎四禁」合併句），**完全對齊** |
| 23 | `formula.zhu_ye_shi_gao_tang` | contraindications | 2/4 | **3/4**⚠️ | 既有 2 句合併已涵蓋 en[0,1,2]；新增 1 條對應 en[3]（痰濕內蘊胸悶乾嘔苔黃膩）。內容涵蓋完整，計數未達 4 因前 3 條未拆句 |
| 23 | `formula.zhu_ye_shi_gao_tang` | cautions | 0/4 | **4/4** | 全新逐條譯，**完全對齊** |
| 24 | `formula.huang_lian_jie_du_tang` | cautions | 0/3 | **3/3** | 全新譯。contraindications 原已 3/3 對齊，本次未動 |
| 25 | `formula.liang_ge_san` | contraindications | 2/3 | **3/3** | 插入 en[0]（便秘已解或見輕微腹痛／便中帶膿／體力減退，宜減量或去大黃）於陣列首位，**完全對齊** |
| 25 | `formula.liang_ge_san` | cautions | 2/3 | **3/3** | 同上（慎用語氣），**完全對齊** |
| 26 | `formula.qing_ying_tang` | contraindications | 0/1 | **1/1** | 全新譯：濕邪內蘊、舌苔白滑者禁用 |
| 26 | `formula.qing_ying_tang` | cautions | 0/1 | **1/1** | 同上 |
| 27 | `formula.xi_jiao_di_huang_tang` | contraindications | 0/3 | **3/3** | 全新逐條譯（陽虛出血／脾胃虛弱出血／外傷出血），**完全對齊**。⚠️ 舊清單（本文件批次 1 版本 §3）誤將此記錄與 `formula.xi_jiao_di_huang_wan`（不同 id，方名相近）列成同一行兩次，本次重新掃描已分開，見下方第 3 節更正說明 |
| 27 | `formula.xi_jiao_di_huang_tang` | cautions | 0/3 | **3/3** | 同上 |
| 28 | `formula.dao_chi_san` | cautions | 1/2 | **2/2** | 既有「脾胃虛弱者慎用」對齊 en[0]，補譯 en[1]（反覆性口瘡未必適用），**完全對齊**。contraindications 原已 2/2，本次未動 |
| 29 | `formula.long_dan_xie_gan_tang` | cautions | 2/3 | **3/3** | 既有 2 條對齊 en[1,2]，補譯 en[0]（脾胃虛寒者慎用）插入首位，**完全對齊**。contraindications 原已 3/3，本次未動 |
| 30 | `formula.qing_wei_san` | contraindications | 1/2 | **3/2**⚠️ | 新增 2 條逐條譯（風寒牙痛／腎虛牙齒牙齦問題）；既有合併句（風火牙痛/腎虛火炎）保留於末尾不刪除——⚠️ 該既有句寫「風火」而英文原文是「Wind-Cold」，此為既有翻譯本身的用詞落差，本次未改寫既有句（只加深不覆寫），列此供 Ting 核對 |
| 30 | `formula.qing_wei_san` | cautions | 0/2 | **2/2** | 全新逐條譯，**完全對齊** |
| 31 | `formula.xie_bai_san` | contraindications | 0/2 | **2/2** | 全新譯，**完全對齊** |
| 31 | `formula.xie_bai_san` | cautions | 0/2 | **2/2** | 同上 |
| 32 | `formula.yu_nv_jian` | contraindications | 0/1 | **1/1** | 全新譯：腹瀉或大便溏薄者禁用 |
| 32 | `formula.yu_nv_jian` | cautions | 0/1 | **1/1** | 同上 |
| 33 | `formula.shao_yao_tang` | contraindications | 0/2 | **2/2** | 全新譯：虛寒久痢者禁用／表證未解者禁用，**完全對齊** |
| 33 | `formula.shao_yao_tang` | cautions | 0/2 | **2/2** | 同上 |
| 34 | `formula.bai_tou_weng_tang` | contraindications | 1/2 | **2/2** | 既有「不宜長期服用」對齊 en[0]，補譯 en[1]（脾胃陽虛者禁用），**完全對齊** |
| 34 | `formula.bai_tou_weng_tang` | cautions | 1/2 | **2/2** | 同上 |
| 35 | `formula.qing_hao_bie_jia_tang` | contraindications | 1/2 | **2/2** | 既有「溫病早期忌服」對齊 en[0]，補譯 en[1]（陰虛肝風內動抽搐痙攣者禁用），**完全對齊** |
| 35 | `formula.qing_hao_bie_jia_tang` | cautions | 0/2 | **2/2** | 全新譯，同上兩條，**完全對齊** |

**本批合計：22 筆記錄、37 個欄位、新增約 60 條忠實翻譯**（不含既有條目重排與延用同源譯文）。

---

## 1c. 本批已譯（批次 3，30 筆，2026-08-11）

延續同一規則：只動 `contraindications_zh` / `cautions_zh`；忠實翻譯既有已核准
`_en` 內容，不新增未查證主張，不刪除既有中文。

**「下 25–30 筆」的取法說明**：§3（批次 2 後）清單最前 3 筆
（`formula.xiao_qing_long_tang` / `formula.bai_hu_tang` / `formula.zhu_ye_shi_gao_tang`）
本次重新檢視後**刻意跳過**——這 3 筆不是待譯缺口，是批次 2 §1b 已記帳的
「內容已涵蓋但條數未 1:1」終態（合併句已覆蓋全部英文概念，或唯一剩餘缺口是
junk-blocked 條目），繼續對它們動作只會製造重複翻譯或翻譯垃圾英文，不是新增覆蓋率。
因此本批實際取自清單第 4–33 筆（`formula.qing_gu_san` 起算），共 30 筆記錄。

**對齊做法**：與批次 2 相同——英文條目逐條配對既有中文（能對上的重排到對應位置，
未改字）；缺口才新譯；既有的段落式/合併句中文（無法拆句對應單一英文條目者）
保留在陣列末尾，視為未匹配的既有內容（只加深不刪除）。部分記錄的
`cautions_en` 與 `contraindications_en` 逐字相同（常見於本批的補益劑），比照批次
1/2 做法，直接沿用同一組譯文。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 36 | `formula.qing_gu_san` | contraindications | 0/1 | **1/1** | 全新譯：陰虛嚴重者，宜加滋陰藥 |
| 36 | `formula.qing_gu_san` | cautions | 0/1 | **1/1** | 同上 |
| 37 | `formula.wu_wei_xiao_du_yin` | contraindications | 2/3 | **3/3** | 既有 2 條對齊 en[1,2]，插入新譯 en[0]（陰證瘡癤者禁用）於首位，**完全對齊** |
| 37 | `formula.wu_wei_xiao_du_yin` | cautions | 2/3 | **3/3** | 同上 |
| 38 | `formula.da_cheng_qi_tang` | contraindications | 2/10 | **12/10**⚠️ | 既有 2 條為段落式摘要，未逐條對應任一英文條目，保留於陣列末尾；新譯 10 條逐條對齊英文（孕婦禁用／邪在衛分太陽/心下痞硬/面赤/脾胃虛弱食少/不能食/少陽頻嘔/裡寒脈遲/自汗小便自利/體虛極慎用加補益），**完全覆蓋**，計數 12 因保留既有段落而多於 10 |
| 38 | `formula.da_cheng_qi_tang` | cautions | 1/10 | **10/10** | 既有「孕婦禁用」對齊 en[0]，其餘 9 條全新譯，**完全對齊** |
| 39 | `formula.xiao_cheng_qi_tang` | contraindications | 2/2 | 2/2（未動） | 既有 2 條為段落式摘要（副作用說明），計數已達 2，不在本次欄位處範圍內；為配合 cautions 對齊，新譯 2 條插入陣列前段，計數變為 **4/2**⚠️，既有 2 條保留末尾 |
| 39 | `formula.xiao_cheng_qi_tang` | cautions | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1]（體虛者僅於必要時使用，並加補益之品），**完全對齊** |
| 40 | `formula.tiao_wei_cheng_qi_tang` | cautions | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1]（沿用 contraindications_zh 既有「體虛者須極慎用,宜加補益之品」同句），**完全對齊**。contraindications 原已 2/2，本次未動 |
| 41 | `formula.da_huang_mu_dan_tang` | contraindications | 1/6 | **6/6** | 全新逐條譯（壞疽性/腹膜炎/嬰兒/寄生蟲性闌尾炎／孕婦／體虛老年），**完全對齊** |
| 41 | `formula.da_huang_mu_dan_tang` | cautions | 1/6 | **6/6** | 同上（en 完全相同），**完全對齊** |
| 42 | `formula.ma_zi_ren_wan` | contraindications | 4/3 | **7/3**⚠️ | 既有 4 條為段落式內容（過敏／久服／驗尿等，非此 3 條英文來源），保留於陣列末尾；新譯 3 條插入前段對齊英文（孕婦禁用／血虛便秘宜加減／體質甚虛宜加減） |
| 42 | `formula.ma_zi_ren_wan` | cautions | 1/3 | **3/3** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1,2]，**完全對齊** |
| 43 | `formula.xiao_chai_hu_tang` | contraindications | 3/7 | **6/7**⚠️ | 既有「肝陽上亢，高血壓，陰虛吐血慎用」一句已合併涵蓋 en[3,4,5]；既有「柴胡升散…禁用」對齊 en[6]；新譯 en[0,1,2]（上實下虛/肝火/牙齦出血）；既有「長期服用可能引起頭痛…」段落式內容非此英文來源，保留末尾。內容涵蓋完整，計數未達 7 因合併句未拆 |
| 43 | `formula.xiao_chai_hu_tang` | cautions | 2/11 | **5/11**⚠️ | 既有「肝火者禁用」「牙齦出血者禁用」對齊 en[1,2]；新譯 en[0] 及合併 en[3-5]、對齊 en[6]（沿用 contraindications 同句譯文）。**cautions_en[7-10] 為 4 個「for those with for those with」破損重複條目 → junk-blocked，不譯，見第 2 節新增列**。內容涵蓋完整（7 個真實英文概念全部覆蓋），計數 5/11 為扣除 4 筆垃圾後的終態 |
| 44 | `formula.xiao_yao_san` | contraindications | 1/2 | **3/2**⚠️ | 新譯 2 條插入前段對齊英文（孕婦慎用／肝腎陰虛兼氣滯者慎用）；既有評論式中文（心理釋壓段落）非此英文來源，保留末尾 |
| 44 | `formula.xiao_yao_san` | cautions | 1/3 | **2/3**⚠️ | 既有「孕婦慎用」對齊 en[0]，補譯 en[1]。**cautions_en[2] 為「for those with for those with」破損重複（複製 en[1]）→ junk-blocked，見第 2 節新增列**。內容涵蓋完整，終態 2/3 |
| 45 | `formula.jia_wei_xiao_yao_san` | contraindications | 1/4 | **4/4** | 既有「孕婦慎用」對齊 en[0]，補譯 en[1,2,3]（素體虛寒禁用／可能減輕抗精神病藥物誘發帕金森氏症震顫／可能改善促性腺激素釋放激素促效劑療法所致更年期症狀），**完全對齊**。⚠️ en[2,3] 為臨床研究陳述而非安全警語，內容本身如此，僅忠實翻譯未改寫，供 Ting 核對欄位歸屬是否合適 |
| 45 | `formula.jia_wei_xiao_yao_san` | cautions | 1/4 | **4/4** | 同上（en 完全相同），**完全對齊** |
| 46 | `formula.tong_xie_yao_fang` | contraindications | 2/2 | 2/2（未動） | 既有 2 條為段落式評論，計數已達 2，不在本次欄位處範圍；為配合 cautions 對齊新譯 2 條插入前段，計數變為 **4/2**⚠️，既有 2 條保留末尾 |
| 46 | `formula.tong_xie_yao_fang` | cautions | 0/2 | **2/2** | 全新逐條譯（食積所致腹瀉者禁用／防風劑量不可任意增加），**完全對齊** |
| 47 | `formula.ban_xia_xie_xin_tang` | cautions | 0/2 | **2/2** | 全新逐條譯（氣滯食積或痰熱蘊結所致心下痞滿者禁用／陰虛所致噁心嘔吐者禁用），**完全對齊**。contraindications 原已 2/2，本次未動（未在缺口清單內，不動） |
| 48 | `formula.li_zhong_wan` | cautions | 2/4 | **4/4** | 既有「陰虛者禁用」「孕婦慎用」對齊 en[1,2]，補譯 en[0,3]（外感風邪發熱者禁用／霍亂吐瀉止後即當停藥，沿用 contraindications_zh 既有同句譯文），**完全對齊**。contraindications 原已 4/4，本次未動 |
| 49 | `formula.fu_zi_li_zhong_wan` | contraindications | 2/4 | **4/4** | 既有「陰虛者禁用」「孕婦禁用」對齊 en[2,3]，新譯 en[0,1]（外感發熱者禁用／霍亂吐瀉止後即當停藥），**完全對齊** |
| 49 | `formula.fu_zi_li_zhong_wan` | cautions | 2/4 | **4/4** | 同上（en 完全相同），**完全對齊** |
| 50 | `formula.si_ni_tang` | cautions | 0/2 | **2/2** | 全新逐條譯（真熱假寒者禁用〔四肢冷、渴喜冷飲、小便色深、舌紅苔黃〕／手足轉溫後應立即停藥），**完全對齊**。contraindications 原已 2/2（段落式），本次未動 |
| 51 | `formula.wu_zhu_yu_tang` | contraindications | 1/3 | **2/3**⚠️ | 新譯 en[0]（嘔吐甚劇者，藥宜冷服）插入首位；既有合併句已涵蓋 en[1,2]（因熱而致的嘔吐反酸/胃熱嘔吐/陰虛嘔吐/肝陽上亢頭痛），保留不拆。內容涵蓋完整，計數未達 3 因合併句未拆 |
| 51 | `formula.wu_zhu_yu_tang` | cautions | 0/3 | **3/3** | 全新逐條譯（不沿用合併句），**完全對齊** |
| 52 | `formula.dang_gui_si_ni_tang` | contraindications | 1/3 | **2/3**⚠️ | 既有「陰虛火旺者禁用」對齊 en[0]，新譯 en[1]（春夏或溫暖氣候慎用）。**en[2]「Contraindicated for those with during Spring and Summer or in warm climates.」文法破損（"for those with during" 不成句）且與 en[1] 語意重複 → junk-blocked，見第 2 節新增列**。終態 2/3 |
| 52 | `formula.dang_gui_si_ni_tang` | cautions | 1/3 | **2/3**⚠️ | 同上（en 完全相同，同一垃圾條目），終態 2/3 |
| 53 | `formula.si_jun_zi_tang` | cautions | 0/2 | **2/2** | 沿用 contraindications_zh 既有兩句譯文（en 完全相同），**完全對齊**。contraindications 原已 2/2，本次未動 |
| 54 | `formula.liu_jun_zi_tang` | cautions | 0/2 | **1/2**⚠️ | 全新譯 en[0]（高熱、陰虛燥熱、氣滯、津液不足、煩躁、口渴或便秘者慎用）。**en[1]「Contraindicated for those with for those with a high fever, …」破損重複（複製 en[0]）→ junk-blocked，見第 2 節新增列**。終態 1/2。contraindications 原已 1/1，本次未動 |
| 55 | `formula.shen_ling_bai_zhu_san` | contraindications | 1/4 | **5/4**⚠️ | 新譯 4 條插入前段對齊英文（實證者禁用／兼陰虛內熱宜加減／孕婦慎用／表裡有熱者慎用）；既有飲食宜忌句非此英文來源，保留末尾 |
| 55 | `formula.shen_ling_bai_zhu_san` | cautions | 1/5 | **4/5**⚠️ | 既有「孕婦慎用」對齊 en[2]，補譯 en[0,1,3]。**en[4]「for those with for those with Exterior or Interior Heat conditions.」破損重複（複製 en[3]）→ junk-blocked，見第 2 節新增列**。終態 4/5 |
| 56 | `formula.yu_ping_feng_san` | contraindications | 1/2 | **3/2**⚠️ | 新譯 2 條插入前段對齊英文（實證者禁用／陰虛盜汗者禁用）；既有評論式中文非 1:1 對應，保留末尾 |
| 56 | `formula.yu_ping_feng_san` | cautions | 0/2 | **2/2** | 全新逐條譯，**完全對齊** |
| 57 | `formula.sheng_mai_san` | cautions | 0/4 | **4/4** | 沿用 contraindications_zh 既有 4 句譯文（en 完全相同），**完全對齊**。contraindications 原已 4/4，本次未動 |
| 58 | `formula.ren_shen_yang_rong_tang` | contraindications | 0/1 | **1/1** | 全新譯：氣血兩虛兼明顯寒象者禁用 |
| 58 | `formula.ren_shen_yang_rong_tang` | cautions | 0/1 | **1/1** | 同上 |
| 59 | `formula.si_wu_tang` | cautions | 1/8 | **7/8**⚠️ | 既有「孕婦慎用」對齊 en[6]，其餘 en[0-5] 六條沿用 contraindications_zh 既有逐字相同譯文（急性嚴重失血/嚴重虛弱呼吸費力/素體脾陽虛加減/脫水/脾胃虛弱慎用熟地滋膩/氣血暴脫）。**en[7]「for those with for those with Spleen and Stomach Deficiency due to…」破損重複（複製 en[4]）→ junk-blocked，本批新發現，見第 2 節新增列**。終態 7/8。contraindications 原已 8/7（超額），本次未動 |
| 60 | `formula.tao_hong_si_wu_tang` | contraindications | 0/1 | **1/1** | 全新譯：懷孕、大量出血、使用抗凝血劑者、手術／療程前後時機、或貧血者，用藥前須審慎評估。⚠️ 原文為現代安全審查式清單句（非古典方書語氣），忠實直譯未改寫語氣 |
| 61 | `formula.jiao_ai_tang` | contraindications | 0/1 | **1/1** | 全新譯：血熱者禁用 |
| 61 | `formula.jiao_ai_tang` | cautions | 0/1 | **1/1** | 同上 |
| 62 | `formula.dang_gui_bu_xue_tang` | contraindications | 1/2 | **2/2** | 既有「陰虛潮熱者，慎用本方。」對齊 en[0]，補譯 en[1]（實證者禁用），**完全對齊** |
| 62 | `formula.dang_gui_bu_xue_tang` | cautions | 1/2 | **2/2** | 既有「實證者禁用」對齊 en[1]，補譯 en[0]（陰虛潮熱者禁用，措辭與 contraindications 的「慎用」略異，因忠實對應各自欄位英文的「Contraindicated」語氣），**完全對齊** |
| 63 | `formula.ba_zhen_tang` | cautions | 0/1 | **1/1** | 全新譯：熱證或實證者禁用。contraindications 原已 3/1（超額段落式），本次未動 |
| 64 | `formula.shi_quan_da_bu_tang` | cautions | 0/1 | **1/1** | 沿用 contraindications_zh 既有同句譯文（en 幾乎相同，僅 disorders/conditions 措辭差異），**完全對齊**。contraindications 原已 1/1，本次未動 |
| 65 | `formula.taishan_pan_shi_san` | contraindications | 0/1 | **1/1** | 全新譯：服用本方期間，宜避免情緒過度波動、飲酒及酸、辣、燥熱食物 |
| 65 | `formula.taishan_pan_shi_san` | cautions | 0/1 | **1/1** | 同上 |

**本批合計：30 筆記錄、49 個欄位、新增約 65 條忠實翻譯**（不含既有條目重排與延用同源譯文）。
23 筆記錄本批後兩欄位皆與英文完全對齊或涵蓋完整（自缺口清單中完全移除）。

---

## 1d. 本批已譯（批次 4，30 筆，2026-08-11）

延續同一規則：只動 `contraindications_zh` / `cautions_zh`；忠實翻譯既有已核准
`_en` 內容，不新增未查證主張，不刪除既有中文。

**「下 30 筆」的取法說明**：§3（批次 3 後）清單前 10 筆
（`xiao_qing_long_tang`／`bai_hu_tang`／`zhu_ye_shi_gao_tang`／`xiao_chai_hu_tang`／
`xiao_yao_san`／`wu_zhu_yu_tang`／`dang_gui_si_ni_tang`／`liu_jun_zi_tang`／
`shen_ling_bai_zhu_san`／`si_wu_tang`）本次重新檢視後**刻意跳過**——這 10 筆全部是
批次 3 §1c 已記帳的終態（junk-blocked 或合併句已完整涵蓋英文概念），繼續動它們
只會製造重複翻譯，不是新增覆蓋率。因此本批實際取自清單第 11–40 筆
（`liu_wei_di_huang_wan` 起算），共 30 筆記錄。

**對齊做法**：與批次 1–3 相同。既有中文若是能對應單一英文條目的短句，保留在對應
位置（不重譯）；既有中文若是段落式／合併多概念的長句（無法拆句對應單一英文
索引者），視為既有內容整段保留在陣列末尾，另在陣列前段插入逐條新譯覆蓋全部
英文概念（同一方法用於批次 3 的 `da_cheng_qi_tang`／`ma_zi_ren_wan` 等筆）。
兩個欄位 `_en` 逐字相同時（本批常見於補益劑／理血劑），直接沿用同一組譯文。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 66 | `formula.liu_wei_di_huang_wan` | contraindications | 1/3 | **3/3** | 既有句對齊 en[0]，補譯 en[1]（濕邪偏盛地區宜謹慎）於中段，既有 cautions 的「陽虛者禁用」移入對齊 en[2]，**完全對齊** |
| 66 | `formula.liu_wei_di_huang_wan` | cautions | 1/3 | **3/3** | en 與 contraindications 逐字相同，沿用同一組譯文，**完全對齊** |
| 67 | `formula.zuo_gui_wan` | contraindications | 1/3 | **4/3**⚠️ | 新譯 3 條逐條對齊英文（脾胃虛弱宜加減／熱盛禁用／不宜久服）插入前段；既有合併句（久服易滯脾礙胃）非單一索引對應，保留末尾 |
| 67 | `formula.zuo_gui_wan` | cautions | 0/4 | **3/4**⚠️ | 全新逐條譯（同上 3 條）。**cautions_en[3]「Contraindicated for those with and modify for those with Spleen and Stomach Deficiency.」文法破損（重複合併兩種強度語氣）→ junk-blocked，見第 2 節新增列**。終態 3/4 |
| 68 | `formula.you_gui_wan` | cautions | 0/2 | **2/2** | en 與 contraindications 逐字相同，沿用既有 contraindications_zh 兩句譯文，**完全對齊**。contraindications 原已 2/2，本次未動 |
| 69 | `formula.qi_ju_di_huang_wan` | contraindications | 1/2 | **2/2** | 既有「陽虛者禁用」對齊 en[1]，補譯 en[0]（脾虛泄瀉消化不良舌苔白膩宜謹慎）插入首位，**完全對齊** |
| 69 | `formula.qi_ju_di_huang_wan` | cautions | 1/2 | **2/2** | 同上，**完全對齊** |
| 70 | `formula.zhi_bai_di_huang_wan` | contraindications | 1/2 | **2/2** | 同 qi_ju_di_huang_wan 模式（en 完全相同），**完全對齊** |
| 70 | `formula.zhi_bai_di_huang_wan` | cautions | 1/2 | **2/2** | 同上 |
| 71 | `formula.shen_qi_wan` | contraindications | 4/6 | **6/6** | 既有 4 條對齊 en[2-5]，補譯 en[0,1]（陰虛口乾咽燥舌紅無苔／胃腸虛弱）插入首位，**完全對齊** |
| 71 | `formula.shen_qi_wan` | cautions | 4/7 | **6/7**⚠️ | 補譯同上 2 條後與既有 4 條合併對齊 en[0-5]。**cautions_en[6]「Contraindicated for those with for those with gastrointestinal weakness.」複製 en[1] 之破損重複 → junk-blocked，見第 2 節新增列**。終態 6/7 |
| 72 | `formula.jin_gui_shen_qi_wan` | cautions | 4/7 | **6/7**⚠️ | 既有 4 條對齊 en[2-5]，補譯 en[0,1]（沿用本筆記錄 contraindications_zh 既有譯文）插入首位。**cautions_en[6] 與 shen_qi_wan 同一破損重複句 → junk-blocked，見第 2 節新增列**。終態 6/7。contraindications 原已 6/6，本次未動 |
| 73 | `formula.zhi_gan_cao_tang` | cautions | 1/3 | **3/3** | 既有「陰虛內熱者禁用」對齊 en[0]，補譯 en[1,2]（腹瀉嚴重者禁用，en[1]/en[2] 除句尾句號外逐字相同，比照忠實譯兩次），**完全對齊**。contraindications 原已 2/2（既有句涵蓋陰虛概念），本次未動 |
| 74 | `formula.yi_guan_jian` | cautions | 0/1 | **1/1** | 全新譯：痰飲或痰濕停滯所致胸痛者禁用。contraindications 原已 3/1（既有段落已涵蓋此概念），本次未動 |
| 75 | `formula.mu_li_san` | contraindications | 0/1 | **1/1** | 全新譯：陰陽虛脫、大汗淋漓如油者禁用 |
| 75 | `formula.mu_li_san` | cautions | 0/1 | **1/1** | 同上 |
| 76 | `formula.si_shen_wan` | contraindications | 0/2 | **2/2** | 全新逐條譯（胃腸積滯者禁用／服用本方期間忌食生冷食物），**完全對齊** |
| 76 | `formula.si_shen_wan` | cautions | 0/2 | **2/2** | 同上 |
| 77 | `formula.jin_suo_gu_jing_wan` | contraindications | 1/4 | **4/4** | 既有「下焦濕熱者禁用」對齊 en[0]，補譯 en[1,2,3]（腎火熾盛宜加減／外感者禁用／忌辛辣避房事），**完全對齊** |
| 77 | `formula.jin_suo_gu_jing_wan` | cautions | 1/4 | **4/4** | 同上 |
| 78 | `formula.sang_piao_xiao_san` | contraindications | 1/2 | **2/2** | 既有「下焦濕熱者禁用」對齊 en[0]，補譯 en[1]（下焦有火者禁用），**完全對齊** |
| 78 | `formula.sang_piao_xiao_san` | cautions | 1/2 | **2/2** | 同上 |
| 79 | `formula.suo_quan_wan` | contraindications | 0/1 | **1/1** | 全新譯：服用本方期間，不宜食用辛辣等刺激性食物 |
| 79 | `formula.suo_quan_wan` | cautions | 0/1 | **1/1** | 同上 |
| 80 | `formula.yue_ju_wan` | cautions | 0/1 | **1/1** | en 與 contraindications 逐字相同，沿用既有「因虛引起的鬱症不適用」，**完全對齊**。contraindications 原已 1/1，本次未動 |
| 81 | `formula.chai_hu_shu_gan_san` | contraindications | 0/1 | **1/1** | 全新譯：陰虛有熱者，不宜未經加減逕用本方 |
| 81 | `formula.chai_hu_shu_gan_san` | cautions | 0/1 | **1/1** | 同上 |
| 82 | `formula.ban_xia_hou_po_tang` | contraindications | 1/3 | **4/3**⚠️ | 新譯 3 條逐條對齊英文（肺陰虛胸痛顴紅口苦舌紅少苔／氣滯化熱／不宜長期服用）插入前段；既有合併句（辛溫苦燥、痰氣互結無熱者適用）非單一索引對應，保留末尾 |
| 82 | `formula.ban_xia_hou_po_tang` | cautions | 1/3 | **3/3** | 既有「不宜長期服用」對齊 en[2]，補譯 en[0,1] 插入前段，**完全對齊** |
| 83 | `formula.su_zi_jiang_qi_tang` | cautions | 0/2 | **2/2** | 全新逐條譯（肺腎虛喘無外邪者禁用／肺熱痰喘者禁用），**完全對齊**。contraindications 原已 2/2（既有段落已涵蓋兩概念），本次未動 |
| 84 | `formula.xue_fu_zhu_yu_tang` | contraindications | 3/4 | **4/4** | 既有 3 條對齊 en[0,1,3]，補譯 en[2]（體質虛弱者禁用）插入對應位置，**完全對齊** |
| 84 | `formula.xue_fu_zhu_yu_tang` | cautions | 1/4 | **4/4** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1,2,3]，**完全對齊** |
| 85 | `formula.bu_yang_huan_wu_tang` | contraindications | 4/8 | **12/8**⚠️ | 新譯 8 條逐條對齊英文（腦出血後立即禁用／中風脈大有力或弦有力／陰虛／血熱／痰阻／孕婦／須確認神志清醒體溫正常／須確認出血已止脈象緩和）插入前段，**完全覆蓋**；既有 4 條（急性期絕對禁用合併句／高血壓陰虛血熱合併句／久服維持療效段落／西藥併用出血風險段落）均為段落式或與此 8 條主題部分重疊但無法拆句對應，保留末尾。計數 12 因保留既有段落而多於 8 |
| 85 | `formula.bu_yang_huan_wu_tang` | cautions | 2/8 | **8/8** | 既有「陰虛者禁用」「孕婦禁用」對齊 en[2,5]，補譯 en[0,1,3,4,6,7] 插入對應位置，**完全對齊** |
| 86 | `formula.sheng_hua_tang` | contraindications | 1/5 | **6/5**⚠️ | 新譯 5 條逐條對齊英文，插入前段，**完全覆蓋**；既有 1 條段落式評論（產後血虛寒凝適用、不可濫作補養劑）保留末尾 |
| 86 | `formula.sheng_hua_tang` | cautions | 1/5 | **5/5** | 既有「孕婦禁用」對齊 en[2]，補譯 en[0,1,3,4] 插入對應位置，**完全對齊** |
| 87 | `formula.shi_hui_san` | contraindications | 1/3 | **4/3**⚠️ | 新譯 3 條逐條對齊英文（血止後應立即停藥／治療期間應安靜臥床／虛寒性出血者禁用）插入前段；既有段落式內容（急則治標、燒炭存性）保留末尾 |
| 87 | `formula.shi_hui_san` | cautions | 0/3 | **3/3** | 全新逐條譯（同上 3 條），**完全對齊** |
| 88 | `formula.wen_jing_tang` | cautions | 0/1 | **1/1** | en 與 contraindications[0] 逐字相同，沿用既有「血瘀實症而致的腹部腫塊勿用」，**完全對齊**。contraindications 原已 2/1（另有 1 條額外既有內容），本次未動 |
| 89 | `formula.ge_xia_zhu_yu_tang` | contraindications | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[1]，補譯 en[0]（月經期間宜謹慎使用）插入首位，**完全對齊** |
| 89 | `formula.ge_xia_zhu_yu_tang` | cautions | 1/3 | **2/3**⚠️ | 補譯同上 1 條後對齊 en[0,1]。**cautions_en[2]「Contraindicated for those with during menstruation.」文法破損（"for those with during" 不成句）→ junk-blocked，見第 2 節新增列**。終態 2/3 |
| 90 | `formula.shao_fu_zhu_yu_tang` | contraindications | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1]（血虛所致點滴出血者不宜使用），**完全對齊** |
| 90 | `formula.shao_fu_zhu_yu_tang` | cautions | 1/2 | **2/2** | 同上 |
| 91 | `formula.ping_wei_san` | cautions | 0/2 | **2/2** | 全新逐條譯（陰虛或血虛者宜大幅加減使用／孕婦宜謹慎使用），**完全對齊**。contraindications 原已 2/2（既有段落已涵蓋兩概念），本次未動 |
| 92 | `formula.huo_xiang_zheng_qi_san` | cautions | 0/3 | **3/3** | 全新逐條譯，**完全對齊**。contraindications 原已 5/3（既有段落已涵蓋概念），本次未動 |
| 93 | `formula.wu_ling_san` | contraindications | 3/8 | **11/8**⚠️ | 新譯 8 條逐條對齊英文（含 en[5-7] 三個簡短片段「Excessive vomiting/diarrhea」「Damp-Heat Accumulation」，忠實譯為對應簡短句）插入前段，**完全覆蓋**；既有 3 條段落式內容（劑量時間、久服、煎法）保留末尾 |
| 93 | `formula.wu_ling_san` | cautions | 0/8 | **8/8** | 全新逐條譯（同上 8 條），**完全對齊** |
| 94 | `formula.zhu_ling_tang` | contraindications | 1/3 | **4/3**⚠️ | 新譯 3 條逐條對齊英文（含簡短片段 en[0]「Without Heat.」譯為「無熱象者不宜使用」）插入前段；既有段落式內容（引《傷寒論》陽明病多汗禁用猪苓湯）保留末尾 |
| 94 | `formula.zhu_ling_tang` | cautions | 0/3 | **3/3** | 全新逐條譯（同上 3 條），**完全對齊** |
| 95 | `formula.er_miao_san` | contraindications | 0/1 | **1/1** | 全新譯：肺熱或肝腎虛者，宜加減使用 |
| 95 | `formula.er_miao_san` | cautions | 0/1 | **1/1** | 同上 |

**本批合計：30 筆記錄、51 個欄位、新增約 70 條忠實翻譯**（不含既有條目重排與延用同源譯文）。
26 筆記錄本批後完全脫離缺口清單（25 筆兩欄位皆對齊或涵蓋完整，`zhi_gan_cao_tang`
另有 1 筆 contraindications 本就不在缺口範圍）；4 筆（`zuo_gui_wan`／`shen_qi_wan`／
`jin_gui_shen_qi_wan`／`ge_xia_zhu_yu_tang`）因本批新發現的 junk-blocked 條目縮小但
未清零，為批次 4 的終態（非未做）。

⚠️ 過程中發現並修正一次自己的轉錄失誤：`bu_yang_huan_wu_tang` 既有段落草稿階段
誤植了一個西里爾字母（「凝血功能」誤打成「凝血функ能」），已於套用前用逐字自查
腳本比對原文抓出修正，**未寫入檔案**；`liu_wei_di_huang_wan`／`sheng_hua_tang`
既有段落轉錄時的空格/錯字（原始資料本身的「補牌」「潰膩」「血塊痛」前後空格）
由 apply 腳本的 multiset 斷言擋下兩次，修正為逐字符合原文後才寫入——過程見本節末
的方法論說明，非資料品質問題。

---

## 1e. 本批已譯（批次 5，30 筆，2026-08-11）

延續同一規則：只動 `contraindications_zh` / `cautions_zh`；忠實翻譯既有已核准
`_en` 內容，不新增未查證主張，不刪除既有中文。分支
`codex/formula-zh-parity-5`（自 `origin/codex/pattern-v2` @ `7e510ab`）。

**「下 30 筆」的取法說明**：§3（批次 4 後）清單前 14 筆
（`xiao_qing_long_tang`／`bai_hu_tang`／`zhu_ye_shi_gao_tang`／`xiao_chai_hu_tang`／
`xiao_yao_san`／`wu_zhu_yu_tang`／`dang_gui_si_ni_tang`／`liu_jun_zi_tang`／
`shen_ling_bai_zhu_san`／`si_wu_tang`／`zuo_gui_wan`／`shen_qi_wan`／
`jin_gui_shen_qi_wan`／`ge_xia_zhu_yu_tang`）本次重新檢視後**刻意跳過**——全部是
批次 3／4 已記帳的終態（junk-blocked 或合併句已完整涵蓋英文概念），繼續動它們
只會製造重複翻譯，不是新增覆蓋率。因此本批實際取自清單第 15–44 筆
（`si_miao_wan` 起算），共 30 筆記錄。

**對齊做法**：與批次 1–4 相同。既有中文若能對應單一英文條目，保留在對應位置
（不重譯）；段落式／合併多概念的既有中文，視為既有內容整段保留在陣列末尾，
另在陣列前段插入逐條新譯覆蓋全部英文概念。兩欄位 `_en` 逐字相同時，直接沿用
同一組譯文。**本批新確認一條翻譯原則**（源自批次 3 `dang_gui_bu_xue_tang` 先例，
本批全面套用）：逐條翻譯的語氣以該條**英文自身的動詞強度**為準——英文寫
"Contraindicated for those with X" 一律譯「X者禁用」，英文寫"Use with/use caution
for those with X" 一律譯「X者慎用」，**與該條目存放在哪個欄位（陣列）無關**；
只有英文本身是不帶動詞的裸片語（如"Pregnancy."／"Deficiency Cold."）時，才依欄位
名稱給預設語氣（`contraindications_zh`→禁用，`cautions_zh`→慎用）。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 96 | `formula.si_miao_wan` | contraindications | 0/1 | **1/1** | 全新譯：肺熱或肝腎虛者，宜加減使用（沿用批次 4 `er_miao_san` 同源英文的既有譯法） |
| 96 | `formula.si_miao_wan` | cautions | 0/1 | **1/1** | 同上 |
| 97 | `formula.zhen_wu_tang` | contraindications | 1/2 | **2/2** | 既有「熱證者禁用」對齊 en[0]，補譯 en[1]（純屬實證所致水腫者禁用），**完全對齊** |
| 97 | `formula.zhen_wu_tang` | cautions | 1/2 | **2/2** | 既有「熱證者慎用」對齊 en[0]，補譯 en[1]（純屬實證所致水腫者慎用），**完全對齊** |
| 98 | `formula.fang_ji_huang_qi_tang` | cautions | 0/3 | **3/3** | 全新逐條譯（急性實證水腫／濕邪困遏衛陽／過量服用致噁心食慾不振），**完全對齊**。contraindications 原已 5/3（既有段落已涵蓋概念），本次未動 |
| 99 | `formula.yin_chen_hao_tang` | cautions | 0/2 | **2/2** | 全新譯（陰黃者禁用／孕婦使用大黃宜格外謹慎），**完全對齊**。contraindications 原已 3/2，本次未動 |
| 100 | `formula.ba_zheng_san` | contraindications | 3/5 | **8/5**⚠️ | 新譯 5 條逐條對齊英文（久病淋證／孕婦／長期服用致虛弱心悸頭暈食慾不振／久病體虛／虛寒）插入前段，**完全覆蓋**；既有 3 條為段落式/合併內容，非單一索引對應，保留末尾 |
| 100 | `formula.ba_zheng_san` | cautions | 2/5 | **5/5** | 既有「孕婦慎用」「虛寒者慎用」對齊 en[1]/en[4]，重排後插入缺口 en[0,2,3] 三條新譯，**完全對齊** |
| 101 | `formula.er_chen_tang` | cautions | 0/1 | **1/1** | 全新譯：肺陰虛咳嗽者禁用（英文本身「Contraindicated」語氣，禁用非慎用）。contraindications 原已 2/1，本次未動 |
| 102 | `formula.ban_xia_bai_zhu_tian_ma_tang` | cautions | 0/2 | **2/2** | 全新逐條譯，**完全對齊**。contraindications 原已 2/2，本次未動 |
| 103 | `formula.xiao_xian_xiong_tang` | cautions | 0/1 | **1/1** | 全新譯：脾胃虛弱明顯者禁用。contraindications 原已 1/1，本次未動 |
| 104 | `formula.chuan_xiong_cha_tiao_san` | contraindications | 1/4 | 1/4（未動） | 既有一句「導致頭痛的原因很多…對於氣虛、血虛、或肝腎陰虛、肝陽上亢、肝風內動等引起的頭痛，均不宜使用」已合併涵蓋全部 4 條英文概念（en[0]肝陽上亢/en[1]肝風/en[2]腎肝陰虛/en[3]氣血兩虛），**內容完全涵蓋，本次判定為新發現的「合併句已完整涵蓋」終態，比照批次 2 `bai_hu_tang` 先例不再拆句翻譯**，故本欄位刻意不動；見第 3 節末新增觀察 |
| 104 | `formula.chuan_xiong_cha_tiao_san` | cautions | 0/4 | **4/4** | 沿用 en 相同內容但 cautions 欄位原為空，比照批次 2 `bai_hu_tang` cautions 先例（「不沿用合併句」）全新逐條譯，**完全對齊** |
| 105 | `formula.xiao_feng_san` | cautions | 0/2 | **2/2** | 全新逐條譯，**完全對齊**。contraindications 原已 2/2，本次未動 |
| 106 | `formula.tian_ma_gou_teng_yin` | cautions | 0/1 | **1/1** | 全新譯：陰虛風動證者禁用（依英文「Contraindicated」語氣定調，與既有 contraindications_zh 的「慎用」措辭不同，忠實對應各自欄位英文——同批次 3 `dang_gui_bu_xue_tang` 先例）。contraindications 原已 1/1，本次未動 |
| 107 | `formula.zhen_gan_xi_feng_tang` | contraindications | 4/5 | **5/5** | 既有 4 條對齊 en[0-3]，補譯 en[4]（痰濕壅盛者慎用）插入末位，**完全對齊** |
| 107 | `formula.zhen_gan_xi_feng_tang` | cautions | 4/5 | **5/5** | 同上（en 完全相同），**完全對齊** |
| 108 | `formula.xiao_huo_luo_dan` | contraindications | 2/3 | **3/3** | 既有 2 條對齊 en[1,2]，補譯 en[0]（本方藥性峻烈溫燥，僅適用於體質較強者）插入首位，**完全對齊** |
| 108 | `formula.xiao_huo_luo_dan` | cautions | 2/3 | **3/3** | 同上（en 完全相同），**完全對齊** |
| 109 | `formula.bao_he_wan` | contraindications | 1/2 | **3/2**⚠️ | 新譯 2 條逐條對齊英文（脾虛者禁用／孕婦慎用，沿用既有 cautions_zh 同源譯文）插入前段；既有段落式內容保留末尾。cautions 原已 2/2，本次未動 |
| 110 | `formula.jian_pi_wan` | contraindications | 0/1 | **1/1** | 全新譯：因飲食不潔或暴飲暴食所致急性食積者禁用，**完全對齊** |
| 110 | `formula.jian_pi_wan` | cautions | 0/1 | **1/1** | 同上（en 完全相同，兩欄位皆依英文「Contraindicated」語氣譯為禁用） |
| 111 | `formula.sha_shen_mai_men_dong_tang` | contraindications | 0/1 | **1/1** | 全新譯：熱盛傷津者禁用，**完全對齊** |
| 111 | `formula.sha_shen_mai_men_dong_tang` | cautions | 0/1 | **1/1** | 同上 |
| 112 | `formula.zhi_sou_san` | contraindications | 0/4 | **4/4** | 全新逐條譯（陰虛/肺熱/痰熱咳嗽者禁用；痰中帶血者宜格外謹慎），**完全對齊** |
| 112 | `formula.zhi_sou_san` | cautions | 0/4 | **4/4** | 同上（en 完全相同） |
| 113 | `formula.an_gong_niu_huang_wan` | cautions | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1]（硃砂不宜大量服用或加熱使用），**完全對齊**。contraindications 原已 4/2，本次未動 |
| 114 | `formula.zi_xue_dan` | contraindications | 1/4 | **4/4** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1,2,3]（神志恢復清醒後應即停藥／硃砂不宜大量或長期服用／過量服用副作用），**完全對齊** |
| 114 | `formula.zi_xue_dan` | cautions | 1/4 | **4/4** | 同上（en 完全相同） |
| 115 | `formula.zhi_bao_dan` | contraindications | 1/7 | **8/7**⚠️ | 新譯 7 條逐條對齊英文（孕婦/陰虛/陽盛/肝陽昏迷禁用；孕婦〔重複條目〕；不宜久服；不可加熱）插入前段，**完全覆蓋**；既有段落式內容保留末尾 |
| 115 | `formula.zhi_bao_dan` | cautions | 3/7 | **7/7** | 既有 3 條對齊 en[0,1,4]，補譯 en[2,3,5,6] 四條並重排，**完全對齊** |
| 116 | `formula.yang_he_tang` | contraindications | 1/4 | **4/4** | 既有「陰虛者禁用」對齊 en[1]，補譯 en[0,2,3]（陽證瘡瘍腫毒/腫瘍潰久未癒禁用；麻黃劑量不可任意增減），**完全對齊** |
| 116 | `formula.yang_he_tang` | cautions | 1/4 | **4/4** | 同上（en 完全相同） |
| 117 | `formula.gui_pi_tang` | cautions | 1/2 | **2/2** | 既有「裡熱者禁用」對齊 en[0]，補譯 en[1]（陰虛有熱者禁用，依英文「Contraindicated」語氣，非慎用），**完全對齊**。contraindications 原已 3/2，本次未動 |
| 118 | `formula.bai_he_gu_jin_tang` | contraindications | 2/3 | **3/3** | 既有 1 句合併涵蓋 en[0,1]，新譯 en[2]（食積者宜謹慎使用）插入中段；既有飲食宜忌句保留末尾 |
| 118 | `formula.bai_he_gu_jin_tang` | cautions | 0/3 | **3/3** | 全新逐條譯（不沿用合併句），**完全對齊** |
| 119 | `formula.da_ding_feng_zhu` | contraindications | 0/2 | **2/2** | 全新逐條譯，**完全對齊** |
| 119 | `formula.da_ding_feng_zhu` | cautions | 0/2 | **2/2** | 同上（en 完全相同） |
| 120 | `formula.du_huo_ji_sheng_tang` | contraindications | 1/3 | **3/3** | 既有「痹證之屬濕熱實證者忌用」對齊 en[0]，補譯 en[1,2]（肝腎陰虛所致痹證者禁用／孕婦慎用），**完全對齊** |
| 120 | `formula.du_huo_ji_sheng_tang` | cautions | 1/3 | **3/3** | 既有「孕婦慎用」對齊 en[2]，補譯 en[0,1]（痹證之屬濕熱實證者禁用／肝腎陰虛所致痹證者禁用）插入前段，**完全對齊** |
| 121 | `formula.gan_lu_xiao_du_dan` | cautions | 0/1 | **1/1** | 全新譯：陰虛明顯者慎用（英文「Significant underlying Yin Deficiency」為裸片語，依欄位慎用語氣）。contraindications 原已 2/1，本次未動 |
| 122 | `formula.huai_hua_san` | cautions | 1/4 | **3/4**⚠️ | 既有「不宜長期服用」對齊 en[0]，補譯 en[1]（中焦虛寒者慎用，英文「Use with caution」語氣）/ en[2]（氣虛或陰虛所致便血者禁用，英文「Contraindicated」語氣）。**en[3]「Contraindicated for those with for those with Middle Jiao Deficiency Cold.」複製 en[1] 之破損重複 → junk-blocked，本批新發現，見第 2 節新增列**。終態 3/4 |
| 123 | `formula.lian_po_yin` | contraindications | 0/2 | **2/2** | 全新逐條譯（本方僅適用於濕熱型霍亂／寒濕者禁用），**完全對齊** |
| 123 | `formula.lian_po_yin` | cautions | 0/2 | **2/2** | 同上（en 完全相同） |
| 124 | `formula.ling_jiao_gou_teng_tang` | cautions | 0/1 | **1/1** | 全新譯：虛風內動者禁用。contraindications 原已 4/1（段落式），本次未動 |
| 125 | `formula.ma_xing_shi_gan_tang` | contraindications | 3/4 | **6/4**⚠️ | 新譯 3 條逐條對齊英文（氣虛邪戀者禁用／體質虛弱之小兒與老年人禁用／久病初癒調養期者禁用）插入前段對齊 en[1,2,3]；既有 3 條段落式內容保留末尾，**完全覆蓋** |
| 125 | `formula.ma_xing_shi_gan_tang` | cautions | 0/4 | **4/4** | 全新逐條譯（不沿用既有段落），**完全對齊** |

**本批合計：30 筆記錄、46 個欄位、新增約 70 條忠實翻譯**（不含既有條目重排與延用同源譯文）。
28 筆記錄本批後完全脫離缺口清單（兩欄位皆對齊或涵蓋完整）；2 筆
（`chuan_xiong_cha_tiao_san`／`huai_hua_san`）因合併句已涵蓋概念（前者）或本批新
發現的 junk-blocked 條目（後者）縮小但未清零，為批次 5 的終態（非未做）。

**批次 5 觀察一：新確認的語氣規則**——本批系統性套用「逐條語氣依英文動詞強度，
不依欄位名稱」原則（見上方說明），導致部分記錄的 `cautions_zh` 出現「禁用」字樣
（因對應英文寫的是「Contraindicated」而非「Use with caution」）。這不是誤譯，是
忠實對應每條英文自身語氣；批次 3 `dang_gui_bu_xue_tang` 已有先例（"措辭與
contraindications 的『慎用』略異，因忠實對應各自欄位英文的『Contraindicated』
語氣"）。

**批次 5 觀察二：新發現一筆「合併句已完整涵蓋」終態**——`chuan_xiong_cha_tiao_san`
的既有 `contraindications_zh[0]` 一句已合併涵蓋全部 4 條英文概念（與批次 2
`bai_hu_tang`／`zhu_ye_shi_gao_tang`、批次 3 `xiao_chai_hu_tang`／`xiao_yao_san`／
`wu_zhu_yu_tang`／`dang_gui_si_ni_tang` 同類），本次判定為終態、刻意不觸碰
`contraindications_zh`。**下一批（批次 6）應在取「下 N 筆」時比照批次 3/4 慣例跳過
此欄位**，避免製造重複翻譯。

⚠️ 過程中 apply 腳本的 multiset 斷言全數通過（30 筆記錄、46 個欄位處皆一次通過），
未發現需腳本擋下的轉錄失誤。

---

## 1f. 本批已譯（批次 6，30 筆，2026-08-11）

延續同一規則：只動 `contraindications_zh` / `cautions_zh`；忠實翻譯既有已核准
`_en` 內容，不新增未查證主張，不刪除既有中文。分支
`codex/formula-zh-parity-6`（自 `origin/codex/pattern-v2` @ `7c173c0`）。

**「下 30 筆」的取法說明**：§3（批次 5 後）清單前 16 筆
（`xiao_qing_long_tang`／`bai_hu_tang`／`zhu_ye_shi_gao_tang`／`xiao_chai_hu_tang`／
`xiao_yao_san`／`wu_zhu_yu_tang`／`dang_gui_si_ni_tang`／`liu_jun_zi_tang`／
`shen_ling_bai_zhu_san`／`si_wu_tang`／`zuo_gui_wan`／`shen_qi_wan`／
`jin_gui_shen_qi_wan`／`ge_xia_zhu_yu_tang`／`chuan_xiong_cha_tiao_san`／
`huai_hua_san`）本次重新檢視後**刻意跳過**——全部是批次 3／4／5 已記帳的終態
（junk-blocked 或合併句已完整涵蓋英文概念），繼續動它們只會製造重複翻譯，不是
新增覆蓋率。清單第 17 筆（`formula.mai_men_dong_tang`）起算取 30 筆時，
`formula.fu_yuan_huo_xue_tang`（清單第 36 筆、批次 1 已記帳的 junk-blocked 終態
cautions:4/5）同樣**刻意跳過**，改取清單第 47 筆（`formula.zeng_ye_tang`）遞補，
維持整數 30 筆。因此本批實際處理：`mai_men_dong_tang` 起、跳過
`fu_yuan_huo_xue_tang`、至 `zeng_ye_tang` 止，共 30 筆記錄。

**對齊做法**：與批次 1–5 相同。既有中文若能對應單一英文條目，保留在對應位置
（不重譯）；段落式／合併多概念的既有中文，視為既有內容整段保留在陣列末尾，
另在陣列前段插入逐條新譯覆蓋全部英文概念。兩欄位 `_en` 逐字相同時，直接沿用
同一組譯文。逐條語氣依批次 5 確立的規則：跟隨該條英文自身動詞強度
（"Contraindicated"→禁用，"Use with/use caution"→慎用），與存放的欄位陣列無關；
裸片語（無動詞，如「Pregnancy.」）才依欄位名稱給預設語氣。

| # | id | 欄位 | before (zh/en) | after (zh/en) | 備註 |
|---|---|---|---|---|---|
| 126 | `formula.mai_men_dong_tang` | contraindications | 1/4 | **4/4** | 既有「肺痿病…屬於虛寒者，不宜使用本方」對齊 en[3]，補譯 en[0,1,2]（風寒或熱邪咳嗽呃逆慎用／濕邪禁用／表熱高熱煩躁慎用）插入前段，**完全對齊** |
| 126 | `formula.mai_men_dong_tang` | cautions | 1/6 | **4/6**⚠️ | 既有「濕者禁用」對齊 en[1]，補譯 en[0,2,3]（沿用 contraindications 同源譯文）。**cautions_en[4]/[5] 為「for those with for those with」破損重複（分別複製 en[0]／en[2]）→ junk-blocked，本批新發現，見第 2 節新增列**。終態 4/6 |
| 127 | `formula.pu_ji_xiao_du_yin` | cautions | 0/1 | **1/1** | 全新譯：陰虛者慎用。contraindications 原已 1/1（既有較長既成譯文已涵蓋），本次未動 |
| 128 | `formula.qian_zheng_san` | contraindications | 3/5 | **5/5** | 新譯 2 條插入首尾（本方僅適用於風寒夾痰中風／孕婦禁用）；既有 3 條段落式內容（涵蓋肝風內動、氣虛血瘀、白附子全蠍毒性）保留中段不動，**完全覆蓋** |
| 128 | `formula.qian_zheng_san` | cautions | 1/5 | **5/5** | 既有「孕婦禁用」對齊 en[4]，全新逐條譯 en[0,1,2,3]（胃虛寒吞酸／肝膽血虛脅痛／白附子全蠍劑量），**完全對齊** |
| 129 | `formula.qing_zao_jiu_fei_tang` | contraindications | 1/2 | **3/2**⚠️ | 新譯 2 條插入前段對齊英文（無表證之虛證者禁用／脾虛者慎用，沿用既有 cautions_zh 同源譯文）；既有「原方使用煅石膏…」段落式內容非此英文來源，保留末尾 |
| 129 | `formula.qing_zao_jiu_fei_tang` | cautions | 1/2 | **2/2** | 既有「脾虛者慎用」對齊 en[1]，補譯 en[0]（無表證之虛證者禁用）插入首位，**完全對齊** |
| 130 | `formula.shi_pi_san` | contraindications | 0/1 | **1/1** | 全新譯：陽水者禁用 |
| 130 | `formula.shi_pi_san` | cautions | 0/1 | **1/1** | 同上 |
| 131 | `formula.shi_xiao_san` | contraindications | 1/2 | 1/2（未動） | 既有單句「本方孕婦禁用，脾胃虛弱及婦女月經期慎用。」已合併涵蓋 en[0]（孕婦）與 en[1]（脾胃虛弱）兩條英文概念，比照批次 2 `bai_hu_tang`／批次 5 `chuan_xiong_cha_tiao_san` 先例，判定為「合併句已完整涵蓋」終態，刻意不拆句翻譯 |
| 131 | `formula.shi_xiao_san` | cautions | 1/3 | **2/3**⚠️ | 既有「孕婦禁用」對齊 en[0]，補譯 en[1]（脾胃虛弱者慎用）。**cautions_en[2]「Contraindicated for those with for those with Stomach Deficiency.」複製 en[1] 之破損重複 → junk-blocked，本批新發現，見第 2 節新增列**。終態 2/3 |
| 132 | `formula.si_ni_san` | cautions | 0/1 | **1/1** | 全新譯：因其他原因所致四肢厥冷者禁用。contraindications 原已 1/1，本次未動 |
| 133 | `formula.su_he_xiang_wan` | contraindications | 1/4 | **4/4** | 既有「孕婦禁用」對齊 en[0]，補譯 en[1,2,3]（熱閉證禁用／脫證禁用／硃砂不宜大量或長期服用），**完全對齊** |
| 133 | `formula.su_he_xiang_wan` | cautions | 1/4 | **4/4** | 同上（en 完全相同），**完全對齊** |
| 134 | `formula.tao_he_cheng_qi_tang` | cautions | 1/2 | **2/2** | 既有「孕婦禁用」對齊 en[1]，補譯 en[0]（沿用既有 contraindications_zh 同源「表證未解者當先解表」譯文）插入首位，**完全對齊**。contraindications 原已 2/2（順序與 en 相反但計數已對齊），本次未動 |
| 135 | `formula.wan_dai_tang` | cautions | 0/1 | **1/1** | 全新譯：帶下色黃夾血質稠黏膩或有臭味，因肝鬱化熱或濕熱下注所致者禁用本方。contraindications 原已 2/1（既有兩句已涵蓋此概念），本次未動 |
| 136 | `formula.xing_su_san` | contraindications | 0/1 | **1/1** | 全新譯：溫燥或風熱者禁用 |
| 136 | `formula.xing_su_san` | cautions | 0/1 | **1/1** | 同上 |
| 137 | `formula.zhi_shi_xie_bai_gui_zhi_tang` | contraindications | 0/2 | **2/2** | 全新逐條譯（因肺癆痰熱所致胸痛者禁用／不宜長期服用），**完全對齊** |
| 137 | `formula.zhi_shi_xie_bai_gui_zhi_tang` | cautions | 0/2 | **2/2** | 同上 |
| 138 | `formula.zuo_jin_wan` | contraindications | 2/3 | **4/3**⚠️ | 新譯 2 條插入末段（因肝膽血虛所致脅痛者禁用／孕婦禁用）；既有 2 條（劑量比例／虛寒嘔吐忌用）保留前段不動 |
| 138 | `formula.zuo_jin_wan` | cautions | 1/3 | **3/3** | 既有「孕婦慎用」對齊 en[2]（裸片語依欄位慎用語氣），全新逐條譯 en[0,1]（胃虛寒吞酸慎用／肝膽血虛脅痛慎用），**完全對齊** |
| 139 | `formula.da_bu_yin_wan` | contraindications | 0/3 | **3/3** | 全新逐條譯（實火者禁用／食慾不振大便溏薄者慎用／服藥期間應避免辛辣刺激性食物），**完全對齊** |
| 139 | `formula.da_bu_yin_wan` | cautions | 0/3 | **3/3** | 同上 |
| 140 | `formula.da_qing_long_tang` | contraindications | 2/8 | **8/8** | 既有「陽虛者禁用」「陰血虛者禁用」對齊 en[2,5]，補譯 en[0,1,3,4,6,7] 六條插入對應位置，**完全對齊** |
| 140 | `formula.da_qing_long_tang` | cautions | 2/8 | **8/8** | 同上（en 完全相同），**完全對齊** |
| 141 | `formula.dang_gui_shao_yao_san` | contraindications | 0/1 | **1/1** | 全新譯：孕婦慎用（沿用既有 cautions_zh 同源譯文）。cautions 原已 1/1，本次未動 |
| 142 | `formula.ding_zhi_wan` | contraindications | 0/1 | **1/1** | 全新譯：陰血虛者宜加減使用 |
| 142 | `formula.ding_zhi_wan` | cautions | 0/1 | **1/1** | 同上 |
| 143 | `formula.er_zhi_wan` | contraindications | 0/3 | **2/3**⚠️ | 全新逐條譯 en[0,1]（消化功能弱者慎用／濕熱內侵所致痿證者禁用）。**contraindications_en[2]「Contraindicated for those with for those with weak digestion.」複製 en[0] 之破損重複 → junk-blocked，本批新發現，見第 2 節新增列**。終態 2/3 |
| 143 | `formula.er_zhi_wan` | cautions | 0/3 | **2/3**⚠️ | 同上（en 完全相同，同一垃圾條目），終態 2/3 |
| 144 | `formula.fang_feng_tong_sheng_san` | contraindications | 1/3 | **3/3** | 既有「孕婦禁用」對齊 en[1]，補譯 en[0,2]（虛證者禁用／消化敏感者慎用），**完全對齊** |
| 144 | `formula.fang_feng_tong_sheng_san` | cautions | 1/3 | **3/3** | 同上（en 完全相同），**完全對齊** |
| 145 | `formula.ge_gen_huang_qin_huang_lian_tang` | contraindications | 0/1 | **1/1** | 全新譯：痢疾或腹瀉而無發熱、脈遲沉（虛寒證）者禁用 |
| 145 | `formula.ge_gen_huang_qin_huang_lian_tang` | cautions | 0/1 | **1/1** | 同上 |
| 146 | `formula.gu_jing_wan` | contraindications | 1/3 | **3/3** | 既有「氣虛者禁用」對齊 en[2]，補譯 en[0,1]（因血瘀所致血熱者禁用／血瘀者禁用）插入前段，**完全對齊** |
| 146 | `formula.gu_jing_wan` | cautions | 1/3 | **3/3** | 同上（en 完全相同），**完全對齊** |
| 147 | `formula.jin_ling_zi_san` | contraindications | 0/2 | **2/2** | 既有 cautions_zh「孕婦慎用」同源譯文沿用對齊 en[0]，新譯 en[1]（因寒邪所致肺氣鬱滯疼痛者禁用），**完全對齊** |
| 147 | `formula.jin_ling_zi_san` | cautions | 1/2 | **2/2** | 既有「孕婦慎用」對齊 en[0]，補譯 en[1]，**完全對齊** |
| 148 | `formula.liang_fu_wan` | contraindications | 1/5 | **5/5** | 既有「孕婦禁用」對齊 en[4]，補譯 en[0,1,2,3]（肝胃火盛腹痛／津液不足／出血／舌質暗紅），**完全對齊** |
| 148 | `formula.liang_fu_wan` | cautions | 1/5 | **5/5** | 同上（en 完全相同），**完全對齊** |
| 149 | `formula.nuan_gan_jian` | contraindications | 0/1 | **1/1** | 全新譯：因下焦濕熱所致陰囊紅腫熱痛者禁用 |
| 149 | `formula.nuan_gan_jian` | cautions | 0/1 | **1/1** | 同上 |
| 150 | `formula.qiang_huo_sheng_shi_tang` | contraindications | 1/6 | **6/6** | 既有「風熱者禁用」對齊 en[4]，補譯 en[0,1,2,3,5]（體弱虛證／素體陰虛／熱證／體虛／大量服用汗出過多傷津耗陽），**完全對齊** |
| 150 | `formula.qiang_huo_sheng_shi_tang` | cautions | 1/6 | **6/6** | 同上（en 完全相同），**完全對齊** |
| 151 | `formula.tian_tai_wu_yao_san` | contraindications | 1/2 | **2/2** | 既有「濕熱者禁用」對齊 en[0]，補譯 en[1]（不宜與補氣藥同服），**完全對齊** |
| 151 | `formula.tian_tai_wu_yao_san` | cautions | 1/2 | **2/2** | 同上，**完全對齊** |
| 152 | `formula.wu_pi_san` | contraindications | 0/2 | **2/2** | 全新逐條譯（脾虛甚者宜配伍健脾藥／服藥期間忌食不易消化的食物），**完全對齊** |
| 152 | `formula.wu_pi_san` | cautions | 0/2 | **2/2** | 同上 |
| 153 | `formula.xi_jiao_di_huang_wan` | contraindications | 0/3 | **3/3** | 全新逐條譯（陽虛所致出血／脾胃虛弱所致出血／外傷所致出血者禁用），比照批次 2 姊妹方 `xi_jiao_di_huang_tang` 既有用語，兩欄位皆用「禁用」語氣（en 為裸片語，兩欄位 en 完全相同時延續既有沿用同一譯文的做法，未套用「裸片語依欄位分流」規則，避免同源英文在兩欄位產生語意不一致），**完全對齊** |
| 153 | `formula.xi_jiao_di_huang_wan` | cautions | 0/3 | **3/3** | 同上（沿用同一組譯文） |
| 154 | `formula.xiao_ji_yin_zi` | contraindications | 1/3 | **3/3** | 既有「孕婦禁用」對齊 en[1]，補譯 en[0,2]（因氣虛所致血淋尿痛者禁用／慢性病證者禁用），**完全對齊** |
| 154 | `formula.xiao_ji_yin_zi` | cautions | 1/3 | **3/3** | 同上（en 完全相同），**完全對齊** |
| 155 | `formula.zeng_ye_tang` | contraindications | 0/1 | **1/1** | 全新譯：本方僅適用於熱燥嚴重傷陰耗津所致之便秘 |
| 155 | `formula.zeng_ye_tang` | cautions | 0/1 | **1/1** | 同上 |

**本批合計：30 筆記錄、54 個欄位、新增約 65 條忠實翻譯**（不含既有條目重排與延用同源譯文）。
27 筆記錄本批後完全脫離缺口清單（兩欄位皆對齊或涵蓋完整）；3 筆
（`mai_men_dong_tang`／`shi_xiao_san`／`er_zhi_wan`）因本批新發現的
junk-blocked 條目縮小但未清零，或合併句已完整涵蓋（`shi_xiao_san`
contraindications）而刻意不動，為批次 6 的終態（非未做）。

**批次 6 觀察一：`xi_jiao_di_huang_wan` 的裸片語語氣選擇**——`contraindications_en`
與 `cautions_en` 完全相同的 3 條裸片語（`"Bleeding due to X."`，無「Contraindicated」
／「Use with caution」動詞），若嚴格套用批次 5 訂下的「裸片語依欄位名稱給預設語氣」
規則，兩欄位理論上應分別譯成「…禁用」與「…慎用」。但檢視既有先例（批次 3–5 多筆
`cautions_en 與 contraindications_en 逐字相同` 記錄，如 `da_bu_yin_wan`／`liang_fu_wan`
本身），慣例做法是兩欄位直接沿用同一組譯文（「同上」），而非為同一句英文在兩個
欄位造出不同語氣的中文。本批延續「en 完全相同時兩欄位沿用同一譯文」這個更常見、
影響筆數更多的慣例，並比照批次 2 已定案的姊妹方 `formula.xi_jiao_di_huang_tang`
用語（陽虛出血／脾胃虛弱出血／外傷出血，兩欄位皆禁用）保持全庫用詞一致。
「裸片語依欄位分流」規則保留給批次 5 原始情境——**單一欄位**新譯裸片語、另一欄位
已有既存內容或本就不需要比較的情況（如批次 5 `gan_lu_xiao_du_dan`）。

⚠️ 過程中 apply 腳本的 multiset 斷言全數通過（30 筆記錄、54 個欄位處皆一次通過），
未發現需腳本擋下的轉錄失誤。

---

## 2. Junk-blocked（依派工單例外條款，不翻譯，留不對齊）

| id | 欄位 | 破損 en 條目 | 判定理由 |
|---|---|---|---|
| `formula.fu_yuan_huo_xue_tang` | `cautions_en[4]` | `"Contraindicated for those with for those with Spleen Deficiency."` | 「for those with」重複兩次，文法明顯破損；且與同陣列 en[3]「Use with caution for those with Spleen Deficiency.」語意重複（僅程度詞從 caution 變 contraindicated）。翻譯破損英文等於把資料損壞洗成看起來正常的中文，故不譯，留 zh(4)/en(5) 不對齊 |
| `formula.fu_yuan_huo_xue_tang_import_stub` | `contraindications_en[4]` / `cautions_en[4]` | 同上（stub 與正式記錄的英文陣列逐字相同） | 同上 |
| `formula.xiao_qing_long_tang` | `cautions_en[7]` | `"Contraindicated for those with for those with hypertension."` | 同一破損模式：「for those with」重複兩次，且與同陣列 en[6]「Use with caution for those with hypertension.」語意重複。不譯，留 zh(7)/en(8) 不對齊。批次 2 新增 — 2026-08-11 |
| `formula.xiao_chai_hu_tang` | `cautions_en[7]`～`cautions_en[10]`（4 條） | `"Contraindicated for those with for those with Liver Yang Rising."` 等 4 條，逐一複製 en[3]～en[6] | 同一破損模式，4 條連續重複。不譯，留 zh(5)/en(11) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.xiao_yao_san` | `cautions_en[2]` | `"Contraindicated for those with for those with Qi Stagnation with underlying Liver and Kidney Yin Deficiency."` | 複製 en[1]，同一破損模式。不譯，留 zh(2)/en(3) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.dang_gui_si_ni_tang` | `contraindications_en[2]` / `cautions_en[2]`（同一句，兩欄位皆有） | `"Contraindicated for those with during Spring and Summer or in warm climates."` | 不同的破損樣式：「for those with during」文法不成句，且與同陣列前一條「Use with caution during Spring and Summer or in warm climates.」語意重複（僅程度詞從 caution 變 contraindicated，句構被錯誤合併）。判定為同一類「escalation 自動轉換破損」，不譯。留 zh(2)/en(3) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.liu_jun_zi_tang` | `cautions_en[1]` | `"Contraindicated for those with for those with a high fever, Yin Deficiency Heat, Qi Stagnation, Body Fluid Deficiency, irritability, thirst or constipation."` | 複製 en[0]，同一破損模式。不譯，留 zh(1)/en(2) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.shen_ling_bai_zhu_san` | `cautions_en[4]` | `"Contraindicated for those with for those with Exterior or Interior Heat conditions."` | 複製 en[3]，同一破損模式。不譯，留 zh(4)/en(5) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.si_wu_tang` | `cautions_en[7]` | `"Contraindicated for those with for those with Spleen and Stomach Deficiency due to the Stagnating nature of Shu Di Huang."` | 複製 en[4]，同一破損模式。不譯，留 zh(7)/en(8) 不對齊。批次 3 新增 — 2026-08-11 |
| `formula.shen_qi_wan` | `cautions_en[6]` | `"Contraindicated for those with for those with gastrointestinal weakness."` | 複製 en[1]，同一破損模式。不譯，留 zh(6)/en(7) 不對齊。批次 4 新增 — 2026-08-11 |
| `formula.jin_gui_shen_qi_wan` | `cautions_en[6]` | `"Contraindicated for those with for those with gastrointestinal weakness."` | 與 `shen_qi_wan` 逐字相同的破損句（兩方 cautions_en 陣列本身逐字相同）。不譯，留 zh(6)/en(7) 不對齊。批次 4 新增 — 2026-08-11 |
| `formula.ge_xia_zhu_yu_tang` | `cautions_en[2]` | `"Contraindicated for those with during menstruation."` | 「for those with during」文法不成句，且與同陣列 en[0]「Use with caution during menstruation.」語意重複（程度詞從 caution 變 contraindicated，句構被錯誤合併）——與批次 3 `dang_gui_si_ni_tang` 同一類「escalation 自動轉換破損」。不譯，留 zh(2)/en(3) 不對齊。批次 4 新增 — 2026-08-11 |
| `formula.zuo_gui_wan` | `cautions_en[3]` | `"Contraindicated for those with and modify for those with Spleen and Stomach Deficiency."` | 新的破損子樣式：「for those with and modify for those with」把 en[0]「Use with caution **and modify** for those with Spleen and Stomach Deficiency.」的動詞片語與升級句式錯誤黏接，文法不通、與 en[0] 語意重複。判定為同一類「escalation 自動轉換破損」的變體。不譯，留 zh(3)/en(4) 不對齊。批次 4 新增 — 2026-08-11 |
| `formula.huai_hua_san` | `cautions_en[3]` | `"Contraindicated for those with for those with Middle Jiao Deficiency Cold."` | 「for those with」重複兩次的標準破損模式，複製 en[1]「Use with caution for those with Middle Jiao Deficiency Cold.」。不譯，留 zh(3)/en(4) 不對齊。批次 5 新增 — 2026-08-11 |
| `formula.mai_men_dong_tang` | `cautions_en[4]` / `cautions_en[5]`（2 條） | `"Contraindicated for those with for those with cough or hiccup due to Wind-Cold or Heat."`／`"Contraindicated for those with for those with high fever and irritability due to Exterior Heat."` | 標準「for those with for those with」重複模式，分別複製 en[0]／en[2]。不譯，留 zh(4)/en(6) 不對齊。批次 6 新增 — 2026-08-11 |
| `formula.shi_xiao_san` | `cautions_en[2]` | `"Contraindicated for those with for those with Stomach Deficiency."` | 複製 en[1]，同一破損模式。不譯，留 zh(2)/en(3) 不對齊。批次 6 新增 — 2026-08-11 |
| `formula.er_zhi_wan` | `contraindications_en[2]` / `cautions_en[2]`（同一句，兩欄位皆有） | `"Contraindicated for those with for those with weak digestion."` | 複製 en[0]，同一破損模式，兩欄位 en 陣列逐字相同故兩處皆有。不譯，留 zh(2)/en(3) 不對齊。批次 6 新增 — 2026-08-11 |

未發現本批 22 筆內有派工單所述「Review pregnancy review before clinical use.」樣板句
那一類（那一類目前查到集中在 `herb_canon_shortlist.json` 的 `english_exam_track.contraindications`，
不在 `formulas.json`）。

**批次 3 觀察**：本批發現的 6 筆新 junk-blocked 記錄全部同一種「escalation 自動轉換破損」
模式——原始資料似乎曾對每一條 `"Use with caution for those with X"` 自動產生一條加重版
`"Contraindicated for those with X"`，但轉換腳本把介系詞片語重複黏接（`for those with for
those with X` 或 `for those with during X`），產生語意重複、文法不通的條目。這類條目全部落在
`cautions_en` 陣列尾端（或緊接在被複製的來源條目之後），與正常條目在同一陣列內混雜，
不易一次性用腳本掃描排除，逐筆人工核對後不譯。

**批次 4 觀察**：本批新發現 4 筆同樣屬於「escalation 自動轉換破損」家族，其中
`shen_qi_wan`／`jin_gui_shen_qi_wan` 是同一破損句在兩個姊妹方（腎氣丸／金匱腎氣丸，
英文陣列本就逐字共用）各出現一次；`zuo_gui_wan` 是一個新的子樣式（`for those with and
modify for those with`，介系詞片語與動詞片語錯誤合併），判定原則相同（文法不通 + 與
同陣列前一條語意重複）不譯。累計至批次 4，同一破損家族已在 10 筆記錄、12 個欄位處
出現，全部集中在 `cautions_en`（僅 `dang_gui_si_ni_tang` 例外同時出現在
`contraindications_en`）。

**批次 5 觀察**：本批新發現 1 筆（`huai_hua_san`），同樣是標準「for those with for
those with」重複模式，複製 en[1]。累計至批次 5，同一破損家族已在 11 筆記錄、
13 個欄位處出現，全部集中在 `cautions_en`（僅 `dang_gui_si_ni_tang` 例外同時出現在
`contraindications_en`）。

**批次 6 觀察**：本批新發現 3 筆，共 4 個欄位處，同樣是標準「for those with for
those with」重複模式：`mai_men_dong_tang`（2 條，複製 en[0]／en[2]，是本破損家族目前
發現單一記錄內破損條目數最多的案例）、`shi_xiao_san`（1 條，複製 en[1]）、
`er_zhi_wan`（1 條，因 `contraindications_en` 與 `cautions_en` 逐字相同的陣列，
同一破損句同時出現在兩個欄位）。累計至批次 6，同一破損家族已在 14 筆記錄、
17 個欄位處出現，`er_zhi_wan` 是繼 `dang_gui_si_ni_tang` 之後第二筆同時出現在
`contraindications_en` 與 `cautions_en` 兩欄位的案例。

---

## 3. 記帳未動：全庫剩餘缺口清單（159 筆 → 批次 2 後 140 筆 → 批次 3 後 117 筆 → 批次 4 後 91 筆 → 批次 5 後 63 筆 → 批次 6 後 36 筆）

**parity-break 記錄數：31（派工單誤引數字）→ 170（全庫真實數字）→ 159（批次 1 後）→ 140（批次 2 後）→ 117（批次 3 後）→ 91（批次 4 後）→ 63（批次 5 後）→ 36（批次 6 後）。**
**欄位處數：291 → 269（批次 1 後）→ 235（批次 2 後）→ 198（批次 3 後）→ 151（批次 4 後）→ 106（批次 5 後）→ 56（批次 6 後）。**

以下是**本批（批次 6）修改並跑過 `build-data.js` 之後**重新掃描的實際輸出（非事先推算，
腳本見附錄）。掃描邏輯不變：`_en` 有內容且 `_zh` 長度 < `_en` 長度即列入。清單前 16 筆
（`xiao_qing_long_tang`／`bai_hu_tang`／`zhu_ye_shi_gao_tang`／`xiao_chai_hu_tang`／
`xiao_yao_san`／`wu_zhu_yu_tang`／`dang_gui_si_ni_tang`／`liu_jun_zi_tang`／
`shen_ling_bai_zhu_san`／`si_wu_tang`／`zuo_gui_wan`／`shen_qi_wan`／
`jin_gui_shen_qi_wan`／`ge_xia_zhu_yu_tang`／`chuan_xiong_cha_tiao_san`／`huai_hua_san`）
與批次 5 完全相同，本批刻意跳過未再處理——見第 1f 節「下 30 筆的取法說明」，它們是
批次 3／4／5 已記帳的終態（合併句已涵蓋英文概念，或唯一剩餘缺口是 junk-blocked 條目）。
`formula.mai_men_dong_tang`／`formula.shi_xiao_san`／`formula.er_zhi_wan` 三筆本批已處理，
因本批新發現的 junk-blocked 條目（第 2 節）縮小但未清零，或合併句已完整涵蓋
（`shi_xiao_san` contraindications）而刻意不動，三筆仍列在清單中，為批次 6 的終態
（非未做）。`formula.fu_yuan_huo_xue_tang` 與 `_import_stub` 兩筆維持批次 1 的
junk-blocked 終態未變，本批依 §1f 取法說明刻意跳過未再處理。**下一批（批次 7）應在
取「下 N 筆」時從清單第 21 筆（`formula.xian_fang_huo_ming_yin`）起算**——清單第
17–20 筆（`mai_men_dong_tang`／`shi_xiao_san`／`er_zhi_wan`／`fu_yuan_huo_xue_tang`）
全部是已記帳的 junk-blocked／合併句終態，第 21 筆起才是尚未處理過的全新缺口
（`_import_stub` 排在清單最末位，同樣是終態，取「下 N 筆」時一併跳過）。
格式 `contraindications:zh/en, cautions:zh/en`：

```
formula.xiao_qing_long_tang cautions:7/8
formula.bai_hu_tang contraindications:6/7
formula.zhu_ye_shi_gao_tang contraindications:3/4
formula.xiao_chai_hu_tang contraindications:6/7, cautions:5/11
formula.xiao_yao_san cautions:2/3
formula.wu_zhu_yu_tang contraindications:2/3
formula.dang_gui_si_ni_tang contraindications:2/3, cautions:2/3
formula.liu_jun_zi_tang cautions:1/2
formula.shen_ling_bai_zhu_san cautions:4/5
formula.si_wu_tang cautions:7/8
formula.zuo_gui_wan cautions:3/4
formula.shen_qi_wan cautions:6/7
formula.jin_gui_shen_qi_wan cautions:6/7
formula.ge_xia_zhu_yu_tang cautions:2/3
formula.chuan_xiong_cha_tiao_san contraindications:1/4
formula.huai_hua_san cautions:3/4
formula.mai_men_dong_tang cautions:4/6
formula.shi_xiao_san contraindications:1/2, cautions:2/3
formula.er_zhi_wan contraindications:2/3, cautions:2/3
formula.fu_yuan_huo_xue_tang cautions:4/5
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

（36 筆，欄位處數 56，來自本批（批次 6）修改並跑過 `build-data.js` 後的實際重新掃描，
非事先推算，可用附錄指令重現。）

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

# key_pairs / herb_pairs 雙軌缺口帳本 — 2026-08-27

唯讀掃描產物,**不是規則**。重現:`node scripts/validate-herb-pair-render.js`(數字)與
本檔頂部的量測樹標記。單味藥卡「經典對藥」有兩個來源,這份帳本量它們的缺口與重疊。

MEASURED TREE: 見同批 PROJECT_LOG 條目。herbs 364 / herb_pairs 218。

## 一、兩側現況

| 項目 | 數 |
|---|---|
| 單味藥卡總數 | 364 |
| 有手寫 `key_pairs` 的藥 | 52 味 / 94 條 |
| 其中同時有結構化藥對記錄(修前整段被蓋) | 36 味 / 109 條 |
| 無手寫 `key_pairs` 的藥 | 312 味 —— **走 herbPairsSection,藥對照常顯示,無缺口** |

> 修前渲染端是 `keyPairs || herbPairsSection(record)`。所以「312 味 key_pairs 空」不是缺口,
> 真正丟內容的是那 36 味「已填」的卡。2026-08-27 改成併集後修復。

## 二、缺口分桶(以「卡上看不看得到藥對」為準,非以欄位空不空)

| 桶 | 味數 | ★NCBAHM | 狀況 |
|---|---|---|---|
| A | 137 | 20 | 有二味藥對記錄,卡上已顯示;手寫欄空不影響畫面 |
| B | 48 | 11 | 只出現在多味組合裡,卡上已顯示該組合 |
| C | 127 | 16 | **完全沒有藥對記錄,卡上「經典對藥」整段不顯示** |

C 桶才是真缺口。★NCBAHM 官方 16 味(建議優先):

- `herb.lian_xu` 蓮鬚 — 收澀藥 / Stabilize and Bind
- `herb.lian_zi_xin` 蓮子心 — 清熱藥 / Clear Heat - Drain Fire
- `herb.lu_lu_tong` 路路通 — 活血化瘀藥 / Invigorate Blood
- `herb.ou_jie` 藕節 — 止血藥 / Stop Bleeding
- `herb.qin_pi` 秦皮 — 清熱藥 / Clear Heat - Dry Damp
- `herb.sang_zhi` 桑枝 — 祛風濕藥 / Dispel Wind-Damp
- `herb.shi_wei` 石韋 — 利水滲濕藥 / Drain Dampness
- `herb.si_gua_luo` 絲瓜絡 — 活血化瘀藥 / Invigorate Blood
- `herb.suo_yang` 鎖陽 — 補虛藥 / Tonify Yang
- `herb.tan_xiang` 檀香 — 理氣藥 / Regulate Qi
- `herb.tu_bie_chong` 土鱉蟲 — 活血化瘀藥 / Invigorate Blood
- `herb.tu_fu_ling` 土茯苓 — 清熱藥 / Clear Heat - Resolve Toxicity
- `herb.xi_xian_cao` 豨薟草 — 祛風濕藥 / Dispel Wind-Damp
- `herb.ye_ju_hua` 野菊花 — 清熱藥 / Clear Heat - Resolve Toxicity
- `herb.zao_jiao_ci` 皂角刺 — 化痰止咳平喘藥 / Transform Phlegm - Warm
- `herb.zhen_zhu` 珍珠 — 安神藥 / Calm Spirit

非★ 111 味清單見 `key_pairs_gap_ledger.json`。

## 三、反方向缺口:只活在卡上的對藥(藥對層查無)

嚴格集合相等判定下,94 條手寫條目裡有 **65 條**在 `herb_pairs.json` 找不到對應記錄,
其中 **51 條明示為考綱官方對藥**(2026 NCBAHM Appendix B / Bastyr),分布 34 味。

這些只以自由文字存在:沒有七情 relation、沒有主治/注意欄、進不了藥對頁、方劑卡也帶不出來。
把它們補成 `herb_pairs.json` 記錄是本帳本裡**價值最高的內容工作**。

| # | 藥 | 卡上標籤 |
|---|---|---|
| 1 | 香薷 | 香薷 + 厚朴 + 白扁豆 (2026 NCBAHM Appendix B 官方對藥) |
| 2 | 羌活 | 羌活 + 防風 (2026 NCBAHM Appendix B 官方對藥) |
| 3 | 白芷 | 白芷 + 蒼耳子 + 辛夷 (2026 NCBAHM Appendix B 官方對藥) |
| 4 | 白芷 | 白芷 + 川芎 (2026 NCBAHM Appendix B 官方對藥) |
| 5 | 細辛 | 細辛 + 麻黃 + 附子 (2026 NCBAHM Appendix B 官方對藥) |
| 6 | 蒼耳子 | 蒼耳子 + 辛夷 + 白芷 + 薄荷 (2026 NCBAHM Appendix B 官方對藥) |
| 7 | 豬苓 | 豬苓 + 茯苓 + 澤瀉 (Bastyr / NCBAHM 官方對藥) |
| 8 | 豬苓 | 豬苓 + 阿膠 + 滑石 (Bastyr 官方對藥) |
| 9 | 澤瀉 | 澤瀉 + 白朮 (Bastyr / NCBAHM 官方對藥) |
| 10 | 澤瀉 | 澤瀉 + 茯苓 + 豬苓 (Bastyr 官方對藥) |
| 11 | 薏苡仁 | 薏苡仁 + 葦莖 + 冬瓜子 + 桃仁 (Bastyr 官方對藥) |
| 12 | 薏苡仁 | 薏苡仁 + 敗醬草 + 附子 (Bastyr 官方對藥) |
| 13 | 車前子 | 車前子 + 木通 + 滑石 + 大黃 (Bastyr 官方對藥) |
| 14 | 車前子 | 車前子 + 白朮 + 茯苓 (Bastyr 官方對藥) |
| 15 | 木通 | 木通 + 生地黃 + 竹葉 + 甘草 (Bastyr 官方對藥) |
| 16 | 川芎 | 川芎 + 白芷 + 細辛 (Bastyr 官方對藥) |
| 17 | 延胡索 | 延胡索 + 當歸 + 川芎 + 香附 (Bastyr 官方對藥) |
| 18 | 鬱金 | 鬱金 + 石菖蒲 (Bastyr 官方對藥) |
| 19 | 鬱金 | 鬱金 + 茵陳 + 金錢草 (Bastyr 官方對藥) |
| 20 | 丹參 | 丹參 + 檀香 + 砂仁 (Bastyr / NCBAHM 官方對藥) |
| 21 | 丹參 | 丹參 + 紅花 + 桃仁 (Bastyr 官方對藥) |
| 22 | 桃仁 | 桃仁 + 大黃 + 牡丹皮 (Bastyr 官方對藥) |
| 23 | 桃仁 | 桃仁 + 葦莖 + 冬瓜子 + 薏苡仁 (Bastyr 官方對藥) |
| 24 | 紅花 | 紅花 + 當歸 + 川芎 + 赤芍 (Bastyr 官方對藥) |
| 25 | 牛膝 | 懷牛膝 + 杜仲 + 續斷 (Bastyr 官方對藥) |
| 26 | 牛膝 | 懷牛膝 + 代赭石 + 生白芍 (Bastyr 官方對藥) |
| 27 | 王不留行 | 王不留行 + 穿山甲 + 木通 + 豬蹄 (Bastyr 官方對藥) |
| 28 | 雞血藤 | 雞血藤 + 當歸 + 川芎 + 熟地黃 (Bastyr 官方對藥) |
| 29 | 雞血藤 | 雞血藤 + 桑寄生 + 獨活 (Bastyr 官方對藥) |
| 30 | 益母草 | 益母草 + 當歸 + 白芍 + 川芎 (Bastyr 官方對藥) |
| 31 | 益母草 | 益母草 + 炮薑 + 山楂 (Bastyr 官方對藥) |
| 32 | 澤蘭 | 澤蘭 + 益母草 (Bastyr 官方對藥) |
| 33 | 肉豆蔻 | 肉豆蔻 + 補骨脂 + 五味子 + 吳茱萸 (Bastyr 官方對藥) |
| 34 | 肉豆蔻 | 肉豆蔻 + 木香 (Bastyr 官方對藥) |
| 35 | 川牛膝 | 川牛膝 + 當歸 + 赤芍 + 紅花 (Bastyr 官方對藥) |
| 36 | 茯神 | 茯神 + 酸棗仁 + 遠志 (Bastyr / NCBAHM 官方對藥) |
| 37 | 茯神 | 茯神 + 人參 + 龍齒 + 遠志 (Bastyr 官方對藥) |
| 38 | 茯神 | 茯神 + 白朮 + 茯苓 (Bastyr 官方對藥) |
| 39 | 通草 | 通草 + 王不留行 + 豬蹄 (Bastyr 官方對藥) |
| 40 | 瞿麥 | 瞿麥 + 萹蓄 + 木通 (Bastyr 官方對藥) |
| 41 | 萹蓄 | 萹蓄 + 瞿麥 + 木通 + 滑石 (Bastyr 官方對藥) |
| 42 | 五靈脂 | 五靈脂 + 蒲黃 (Bastyr / NCBAHM 官方對藥) |
| 43 | 烏梅 | 烏梅 + 細辛 + 干薑 + 黃連 + 附子 (Bastyr 官方對藥) |
| 44 | 燈心草 | 燈心草 + 淡竹葉 (Bastyr 官方對藥) |
| 45 | 薑黃 | 薑黃 + 羌活 + 桑枝 + 海風藤 (Bastyr 官方對藥) |
| 46 | 虎杖 | 虎杖 + 茵陳 + 金錢草 (Bastyr 官方對藥) |
| 47 | 虎杖 | 虎杖 + 黃芩 + 石膏 (Bastyr 官方對藥) |
| 48 | 訶子 | 訶子 + 桔梗 + 甘草 (Bastyr 官方對藥) |
| 49 | 訶子 | 訶子 + 嬰粟殼 + 肉豆蔻 (Bastyr 官方對藥) |
| 50 | 赤石脂 | 赤石脂 + 乾薑 + 粳米 (Bastyr 官方對藥) |
| 51 | 赤石脂 | 赤石脂 + 禹餘糧 (Bastyr 官方對藥) |

## 四、建議順序

1. ~~渲染端併集~~ — 2026-08-27 已落地,109 條中 79 條回到畫面(30 條判定重複濾掉)。
2. 第三節 51 條考綱官方對藥 → 補成 herb_pairs 記錄(34 味,建議分 2 批)。
3. C 桶 ★16 味新建藥對(需查來源)。
4. C 桶非★ 111 味最後。
5. A/B 桶不需動作 —— 畫面上本來就有,手寫欄空不是缺陷。

# SOL 查源任務三：中藥劑量逐筆查證（受控暫存稿）

日期：2026-08-14  
Repo：`guot-beep/acuting-os`  
Branch：`codex/pattern-v2`（唯讀）  
Blob SHA：`2a5474689169f70a038894e84175abe5e306dcd4`

## 執行結論

本稿**不可交給 Fable 機械寫入**。指定分支已完成逐筆枚舉，但本次公開可存取來源只確認了 2025 年版《中國藥典》的頒布、實施日期與官方資料庫入口，未取得可逐字核對的 2025 年版一部各品種正文。因此沒有把 2020 版文字、搜尋摘要、商業網站「常用量」或模型記憶冒充為 2025 藥典原文。

- repo 實際 `records`：358（檔內舊 `batch_summary.total_records` 仍寫 327）
- `dosage` 空值：69，不是任務單所寫 70
- A 組：19；其中 `herb.zhe_bei_mu` 同時是 A 組與空值組
- 唯一待查記錄：87
- 可安全自動寫入的新值：0
- 應進裁定佇列：0（尚無 2025 正文，不能正式判定）
- `verification_blocked`：87

## 可採信的版本層來源

1. 國家藥監局、國家衛生健康委，〈關於頒布 2025 年版《中華人民共和國藥典》的公告（2025 年第29號）〉，2025-03-25。https://www.nmpa.gov.cn/xxgk/fgwj/gzwj/gzwjyp/20250325183810122.html
2. 國家藥監局，〈關於實施 2025 年版《中華人民共和國藥典》有關事宜的公告（2025 年第32號）〉，2025-03-25；2025-10-01 起施行。https://www.nmpa.gov.cn/xxgk/fgwj/gzwj/gzwjyp/20250325184202175.html
3. 國家藥典委員會，《中華人民共和國藥典》官方資料庫入口。https://ydz.chp.org.cn/

上述來源能證明版本與官方入口，**不能代替各品種正文的「用法與用量」引文**。

## A 組：repo 現值與待覆核狀態

| id | repo 現值（原樣保留） | 2025 判定 | 特殊註記 |
|---|---|---|---|
| herb.ku_shen | `內服：煎湯，3-10g；或入丸、散。外用：適量……` | verification_blocked | 尚未取得 2025 正文 |
| herb.gan_sui | `0.5-1.5克；必須醋制後使用；入丸散劑，不入湯劑` | verification_blocked | 毒性／炮製／給法須逐字核對 |
| herb.mu_tong | `3-6克；食療3-9克` | verification_blocked | 必須核對藥典基原；不得與關木通混同 |
| herb.fu_zi | `3-15克；制附子；先煎30-60分鐘` | verification_blocked | 必須分生品與炮製品；不可先行合併 |
| herb.wu_zhu_yu | `1-3克` | verification_blocked | 尚未取得 2025 正文 |
| herb.chuan_lian_zi | `3-10克` | verification_blocked | 有小毒與炮製敘述須核對 |
| herb.chuan_bei_mu | `3-9克；研末1-3克` | verification_blocked | 不得借用浙貝母劑量 |
| herb.zhe_bei_mu | 空 | verification_blocked | 同時列入 B 組 |
| herb.gua_lou | `9～15克；可調整至30克` | verification_blocked | 「可調整至30克」不可在無正文下保留為藥典值 |
| herb.xing_ren | `3-10g` | verification_blocked | 需確認藥典品名／炮製與毒性注意 |
| herb.kuan_dong_hua | `5-10克；食療3-9克` | verification_blocked | 尚未取得 2025 正文 |
| herb.su_he_xiang | `9-15克；入湯劑常規煎煮` | **SAFETY_HOLD** | 芳香開竅藥卻被寫成克級湯劑，須優先以正文覆核；在覆核前不得沿用 |
| herb.quan_xie | `煎湯3-6克；研末0.6-1克；另列食療5-8只` | verification_blocked | 「食療」內容不得視為藥典劑量 |
| herb.he_shou_wu | `6-12克；補益用制品、潤腸用生品` | verification_blocked | 必須把何首烏／制何首烏分列，不得一欄合併 |
| herb.ku_lian_pi | `6-15g，鮮品15-30g` | verification_blocked | 有毒品種，須逐字核對給法與注意 |
| herb.bing_lang | `3-10克；驅蟲30-60克` | verification_blocked | 大劑量與給法須逐字核對 |
| herb.rou_dou_kou | `煎湯3~9g；研末1~3g` | verification_blocked | 必須核對煨製要求 |
| herb.xiong_huang | `內服 0.05–0.1g，入丸散用；外用適量。` | verification_blocked | 形式看似微量丸散，但未核對 2025 正文；禁止改成湯劑克數 |
| herb.zhu_sha | `內服 0.1–0.5g，只入丸散，不入湯劑。` | verification_blocked | 形式看似微量丸散，但未核對 2025 正文；禁止改成湯劑克數 |

## B 組：`dosage` 空值逐筆枚舉

以下 69 筆全部維持空值；在取得 2025 一部正文或合格教材完整書目、版次、頁碼前，`new_value` 一律不得產生。

| id | 中文名 | 狀態 |
|---|---|---|
| herb.zhi_ke | 枳殼 | verification_blocked |
| herb.tao_ren | 桃仁 | verification_blocked |
| herb.niu_xi | 牛膝 | verification_blocked |
| herb.zhe_bei_mu | 浙貝母 | verification_blocked |
| herb.chuan_niu_xi | 川牛膝 | verification_blocked |
| herb.dan_zhu_ye | 淡竹葉 | verification_blocked |
| herb.fu_shen | 茯神 | verification_blocked |
| herb.tong_cao | 通草 | verification_blocked |
| herb.sha_shen | 沙參 | verification_blocked：名稱合併南／北沙參，不能借值 |
| herb.bai_wei | 白薇 | verification_blocked |
| herb.zi_su_zi | 紫蘇子 | verification_blocked |
| herb.xin_yi | 辛夷 | verification_blocked |
| herb.da_fu_pi | 大腹皮 | verification_blocked |
| herb.da_ji | 大薊 | verification_blocked |
| herb.xiao_ji | 小薊 | verification_blocked |
| herb.she_gan | 射干 | verification_blocked |
| herb.sang_bai_pi | 桑白皮 | verification_blocked |
| herb.sang_piao_xiao | 桑螵蛸 | verification_blocked |
| herb.huai_hua | 槐花 | verification_blocked |
| herb.bai_bian_dou | 白扁豆 | verification_blocked |
| herb.bai_mao_gen | 白茅根 | verification_blocked |
| herb.qu_mai | 瞿麥 | verification_blocked |
| herb.shi_jue_ming | 石決明 | verification_blocked |
| herb.ling_yang_jiao | 羚羊角 | verification_blocked：另須核對法規／保育狀態 |
| herb.qian_cao_gen | 茜草根 | verification_blocked：須核對藥典正式品名 |
| herb.he_ye | 荷葉 | verification_blocked |
| herb.bian_xu | 萹蓄 | verification_blocked |
| herb.xue_yu_tan | 血餘炭 | verification_blocked |
| herb.wu_ling_zhi | 五靈脂 | verification_blocked |
| herb.bie_jia | 鱉甲 | verification_blocked |
| herb.wu_mei | 烏梅 | verification_blocked |
| herb.deng_xin_cao | 燈心草 | verification_blocked |
| herb.cong_bai | 蔥白 | verification_blocked |
| herb.yin_xing | 銀杏 | verification_blocked：須核對正式品名是否為白果／銀杏葉，不能混用 |
| herb.yi_tang | 飴糖 | verification_blocked |
| herb.ma_bo | 馬勃 | verification_blocked |
| herb.she_xiang | 麝香 | verification_blocked：特殊給法與保育／來源要求須核對 |
| herb.hei_zhi_ma | 黑芝麻 | verification_blocked |
| herb.gao_ben | 藁本 | verification_blocked |
| herb.zi_cao | 紫草 | verification_blocked |
| herb.chuan_xin_lian | 穿心蓮 | verification_blocked |
| herb.shan_dou_gen | 山豆根 | verification_blocked |
| herb.ma_chi_xian | 馬齒莧 | verification_blocked |
| herb.chui_pen_cao | 垂盆草 | verification_blocked |
| herb.bai_jiang_cao | 敗醬草 | verification_blocked |
| herb.fan_xie_ye | 番瀉葉 | verification_blocked：給法與禁忌須逐字核對 |
| herb.lu_hui | 蘆薈 | verification_blocked：特殊給法須逐字核對 |
| herb.cao_dou_kou | 草豆蔻 | verification_blocked |
| herb.cao_guo | 草果 | verification_blocked |
| herb.hai_jin_sha | 海金沙 | verification_blocked：包煎等給法須核對 |
| herb.wu_yao | 烏藥 | verification_blocked |
| herb.jiang_huang | 薑黃 | verification_blocked |
| herb.pang_da_hai | 胖大海 | verification_blocked |
| herb.ci_shi | 磁石 | verification_blocked：先煎等給法須核對 |
| herb.bing_pian | 冰片 | verification_blocked：不可產生湯劑劑量 |
| herb.huang_jing | 黃精 | verification_blocked |
| herb.hu_zhang | 虎杖 | verification_blocked |
| herb.he_zi | 訶子 | verification_blocked |
| herb.chi_shi_zhi | 赤石脂 | verification_blocked |
| herb.bai_jiu | 白酒 | no_source_candidate：非 canonical 單味藥條目，維持空 |
| herb.huang_jiu | 黃酒 | no_source_candidate：方中載體，維持空 |
| herb.ji_zi_huang | 雞子黃 | no_source_candidate：課件以枚計且非 canonical 單味藥條目 |
| herb.xi_jiao | 犀角 | prohibited/obsolete：不得建立現代內服劑量 |
| herb.pao_jiang | 炮薑 | verification_blocked：不得借乾薑劑量 |
| herb.ying_su_ke | 罌粟殼 | restricted/obsolete：不得從歷史方量建立現代劑量 |
| herb.chuan_shan_jia | 穿山甲 | prohibited/obsolete：不得建立現代內服劑量 |
| herb.qing_mu_xiang | 青木香 | unsafe/obsolete：不得借木香劑量或建立現代內服劑量 |
| herb.jin_bo | 金箔 | obsolete/noncanonical：維持空 |
| herb.yin_bo | 銀箔 | obsolete/noncanonical：維持空 |

## 統計（僅代表本次可核實程度）

| 指標 | 數量 |
|---|---:|
| A 組一致 | 0（未取得正文，不能判定） |
| A 組正式偏差 | 0（未取得正文，不能判定） |
| A 組 SAFETY_HOLD | 1（蘇合香；疑似嚴重給法／量級問題，尚待正文裁定） |
| A 組 verification_blocked | 19 |
| B 組新增可寫入值 | 0 |
| B 組維持空 | 69 |
| B 組明確禁止／廢用／非 canonical 候選 | 10 |

## 解除阻塞所需材料

需提供可合法查閱的《中華人民共和國藥典》2025 年版一部正文（紙本掃描、已授權電子版或官方資料庫可讀頁）。取得後應逐條擷取：品名、版本頁碼／官方條目定位、「用法與用量」逐字原文、「注意」逐字原文，以及飲片／炮製品差異。未取得前，Fable 應保持所有 B 組 `dosage` 為空，A 組不自動修改。

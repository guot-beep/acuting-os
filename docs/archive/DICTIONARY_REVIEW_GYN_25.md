# 辭典核對表 — 婦科第一批 25 病名 (Dictionary review worksheet — gyn batch 1)

Generated 2026-07-16 by Claude from
condition_canon_shortlist.json + tdis_registry.json + condition_crosswalk.json.
**用途**: 拿《中西醫病名對照大辭典》(林昭庚 主編) 逐條核對。此表由 repo 現有
資料產生，Claude 無法存取辭典本身；請 Ting 在「辭典中醫病名」欄填入辭典的對應、
在「一致?」欄打勾/標差異，之後再由 agent 依裁決更新 crosswalk (仍為 draft，
逐條 source_checked)。權威規則見 CONDITIONS_MODULE_DESIGN 的 Verification
authority 段：辭典在病名對應上為準。

| # | 西醫病名 (zh / en) | ICD-10 | 現有中醫病名對照 (repo) | 辭典中醫病名 (Ting 填) | 一致? | 備註 |
|---|---|---|---|---|---|---|
| 1 | 多囊性卵巢症候群 / Polycystic Ovary Syndrome | E28.2 | 月經後期（Yuejing Houqi）、閉經（Bijing）、不孕（Buyun） |  | ☐ | |
| 2 | 子宮內膜異位症 / Endometriosis | N80 | 痛經（Tongjing）、癥瘕（Zhengjia）、不孕（Buyun） |  | ☐ | |
| 3 | 子宮肌瘤 / Uterine Fibroids | D25 | 癥瘕（Zhengjia）、月經過多（Yuejing Guoduo） |  | ☐ | |
| 4 | 原發性痛經 / Primary Dysmenorrhea | N94.4 | 痛經（Tongjing） |  | ☐ | |
| 5 | 經前症候群 / Premenstrual Syndrome | N94.3 | 鬱證（Yuzheng）、臟躁（Zangzao） |  | ☐ | |
| 6 | 月經不調 / Irregular Menstruation | N92.6 | 月經先期（Yuejing Xianqi）、月經後期（Yuejing Houqi） |  | ☐ | |
| 7 | 月經過多 / Heavy Menstrual Bleeding | N92.0 | 月經過多（Yuejing Guoduo）、崩漏（Benglou） |  | ☐ | |
| 8 | 月經過少 / Scanty/Infrequent Menstruation | N91.5 | 月經過少（Yuejing Guoshao）、月經後期（Yuejing Houqi） |  | ☐ | |
| 9 | 繼發性閉經 / Secondary Amenorrhea | N91.1 | 閉經（Bijing） |  | ☐ | |
| 10 | 女性不孕症 / Female Infertility | N97 | 不孕（Buyun） |  | ☐ | |
| 11 | 男性不育症 / Male Factor Infertility | N46 | 不育（Buyu） |  | ☐ | |
| 12 | 卵巢儲備功能下降 / Diminished Ovarian Reserve | E28.3 | 不孕（Buyun）、月經過少（Yuejing Guoshao） |  | ☐ | |
| 13 | 試管嬰兒療程輔助（文件情境） / IVF/ART Adjunctive Support (context) | Z31.83 | 不孕（Buyun） |  | ☐ | |
| 14 | 習慣性流產（文件情境） / Recurrent Pregnancy Loss (context) | N96 | 不孕（Buyun） |  | ☐ | |
| 15 | 黃體功能不足（文件情境） / Luteal Phase Deficiency (context) | E28.8 | 不孕（Buyun）、月經先期（Yuejing Xianqi） |  | ☐ | |
| 16 | 更年期症候群 / Menopausal Syndrome | N95.1 | 絕經前後諸證（Jingduan Qianhou Zhuzheng） |  | ☐ | |
| 17 | 妊娠劇吐（文件情境） / Nausea of Pregnancy / Hyperemesis (context) | O21 | 妊娠惡阻（Renshen Ezu） |  | ☐ | |
| 18 | 胎位不正（艾灸文件情境） / Breech Presentation (moxibustion context) | O32.1 | 胎位不正（Taiwei Buzheng） |  | ☐ | |
| 19 | 產後缺乳 / Insufficient Lactation | O92.4 | 缺乳（Queru） |  | ☐ | |
| 20 | 慢性骨盆腔疼痛 / Chronic Pelvic Pain | R10.2 | 腹痛（Futong）、癥瘕（Zhengjia） |  | ☐ | |
| 21 | 慢性骨盆腔炎後遺（文件情境） / Chronic PID Sequelae (context) | N73.1 | 帶下病（Daixiabing）、腹痛（Futong） |  | ☐ | |
| 22 | 外陰陰道念珠菌感染（文件情境） / Vulvovaginal Candidiasis (context) | B37.3 | 帶下病（Daixiabing） |  | ☐ | |
| 23 | 子宮內膜偏薄（文件情境） / Thin Endometrial Lining (context) | N85.8 | 月經過少（Yuejing Guoshao）、不孕（Buyun） |  | ☐ | |
| 24 | 經前不悅症（文件情境） / Premenstrual Dysphoric Disorder (context) | F32.81 | 鬱證（Yuzheng）、臟躁（Zangzao） |  | ☐ | |
| 25 | 繼發性痛經 / Secondary Dysmenorrhea | N94.5 | 痛經（Tongjing）、癥瘕（Zhengjia） |  | ☐ | |

## 裁決後的動作 (agent, 待 Ting 逐條核對)

- 「一致」→ 該 crosswalk 記錄的 tcm_dictionary_refs 填入 tdis_id + dictionary_ref (冊/頁)，review_status 可升 source_checked。
- 「辭典多出對應」→ 新增 tdis 到 related_eastern_diseases + tcm_dictionary_refs。
- 「repo 多出、辭典無」→ 保留但標 note (repo 依教材/臨床，非辭典)。
- 全程 draft → 逐條 source_checked，不批量升級 (NORTH_STAR §6)。

現有中醫病名 tdis id 對照（供填表參考）:

- `tdis.beng_lou` = 崩漏 / Flooding and Trickling
- `tdis.bi_jing` = 閉經 / Amenorrhea
- `tdis.bu_yu` = 不育 / Infertility (male)
- `tdis.bu_yun` = 不孕 / Infertility (female)
- `tdis.dai_xia_bing` = 帶下病 / Vaginal Discharge Disease
- `tdis.fu_tong` = 腹痛 / Abdominal Pain
- `tdis.jing_duan_qian_hou` = 絕經前後諸證 / Perimenopausal Syndrome
- `tdis.que_ru` = 缺乳 / Insufficient Lactation
- `tdis.ren_shen_e_zu` = 妊娠惡阻 / Morning Sickness
- `tdis.tai_wei_bu_zheng` = 胎位不正 / Fetal Malposition
- `tdis.tong_jing` = 痛經 / Dysmenorrhea
- `tdis.yu_zheng` = 鬱證 / Depression Pattern Disease
- `tdis.yue_jing_guo_duo` = 月經過多 / Heavy Menstruation
- `tdis.yue_jing_guo_shao` = 月經過少 / Scanty Menstruation
- `tdis.yue_jing_hou_qi` = 月經後期 / Delayed Menstruation
- `tdis.yue_jing_xian_qi` = 月經先期 / Early Menstruation
- `tdis.zang_zao` = 臟躁 / Visceral Agitation
- `tdis.zheng_jia` = 癥瘕 / Abdominal Masses (gyn)

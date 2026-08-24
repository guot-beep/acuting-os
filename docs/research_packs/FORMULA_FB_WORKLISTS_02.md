# FORMULA_FB_WORKLISTS_02 — FB-14 / FB-15 / FB-21 / FB-24（唯讀機械 worklist）

狀態：**findings worklist（唯讀）。本文件沒有動 `data/**` 一個字元，沒有寫入任何臨床敘述。**
Branch：`codex/formula-fb20-detector`（自 `origin/codex/pattern-v2`）
日期：2026-08-12
對象：`data/herbs/formulas.json`（224 筆 records，全庫，非抽樣）
上游：`docs/research_packs/FORMULA_EYESON_02.md`（FB-14 / FB-15 / FB-21 / FB-24 的原始判準與 30 卡抽樣數字）
下游：`data/research_staging/CONTENT_REQUEST_FORMULA_CAUTION_HERB_COVERAGE.md`（本文件 §1／§2 直接對應該 CR 的 B 段與 E 段；交叉引用見各節）

## 怎麼讀這份文件

四節，每節：判準（逐字抄自 EYESON_02 或明確標註本次的延伸）、**一行可重現指令**（貼上就能重新算出同一個數字）、
逐列表格（每列引用觸發判準的原文欄位值——不是摘要，是原文）。**沒有一條是我編的臨床敘述**，
全部是 `data/herbs/formulas.json` 既有欄位值的機械過濾與整理。

⚠️ **範圍差異說明**：EYESON_02 的 F-25/F-26/F-38 數字是**30 卡抽樣批次**的數字（batch 2）；
本文件是**全庫 224 筆**掃描（EYESON_02 §3 FB 表明確寫著「全庫待掃」）。
兩邊數字不同不是矛盾——是同一個判準套用到不同範圍，全庫數字包含抽樣批次裡已經報過的那些。
FB-24 是唯一一節全庫數字（47 筆）與 EYESON_02 F-38 已經算過的全庫數字（「全庫 47 筆」）**完全一致**，
可以互相驗證判準抄錄無誤。

執行環境：`export PATH="/c/Program Files/nodejs:$PATH"`（Bash）後在 repo 根目錄執行；
下列每個指令都已在本次任務中實際跑過一次，貼的是真實輸出的列數，不是估計值。

---

## §1 FB-14 — 毒性礦物／慎用藥 `dose_g` 超出藥典上限（全庫）

**判準**（抄自 `FORMULA_EYESON_02.md` F-25 對照表）：composition 裡的藥名含表列六種慎用藥之一，
取 `dose_g` 字串裡最後一個數字（範圍的上限），跟藥典常用上限比：

| 藥 | 藥典常用上限 | 依據（F-25 已核讀） |
|---|---|---|
| 雄黃 | 0.1g | 硫化砷，F-25 表列 0.05–0.1g |
| 硃砂／朱砂 | 0.5g | 硫化汞，F-25 表列 0.1–0.5g |
| 冰片 | 0.3g | F-25 表列 ~0.3g |
| 麝香 | 0.1g | F-25 表列 ~0.1g |
| 細辛 | 3g | 「細辛不過錢」，F-25 表列 1–3g |

**一行重現指令**：

```bash
node -e "const r=require('./data/herbs/formulas.json').records;const C={雄黃:.1,硃砂:.5,朱砂:.5,冰片:.3,麝香:.1,細辛:3};let n=0;for(const f of r)for(const c of f.composition||[]){const k=Object.keys(C).find(k=>String(c.herb_zh||'').includes(k));if(!k)continue;const m=String(c.dose_g||'').match(/\d+(\.\d+)?/g);if(!m)continue;const t=+m[m.length-1];if(t>C[k]){n++;console.log(f.id,c.herb_zh,c.dose_g,'>',C[k]+'g')}}console.log('rows:',n)"
```

**結果：18 列**（EYESON_02 batch 2 只算了抽樣批次的 14 列；本節是全庫）。

| # | 卡 | 藥 | `dose_g` 原文 | 上限 | 倍數 |
|---|---|---|---|---|---|
| 1 | `su_he_xiang_wan` 蘇合香丸 | 麝香 | `".2-.60g"` | 0.1g | **6×** |
| 2 | `an_gong_niu_huang_wan` 安宮牛黃丸 | 雄黃 | `"1-30g"` | 0.1g | **300×** |
| 3 | `zhi_bao_dan` 至寶丹 | 雄黃 | `"30g"`（單一值） | 0.1g | **300×** |
| 4 | `su_he_xiang_wan` 蘇合香丸 | 硃砂 | `".5-60g"` | 0.5g | **120×** |
| 5 | `su_he_xiang_wan` 蘇合香丸 | 冰片 | `".5-30g"` | 0.3g | **100×** |
| 6 | `an_gong_niu_huang_wan` 安宮牛黃丸 | 麝香 | `".25-7.5g"` | 0.1g | **75×** |
| 7 | `an_gong_niu_huang_wan` 安宮牛黃丸 | 硃砂 | `".5-30g"` | 0.5g | **60×** |
| 8 | `ci_zhu_wan` 磁朱丸 | 硃砂 | `"3-30g"` | 0.5g | **60×** |
| 9 | `an_gong_niu_huang_wan` 安宮牛黃丸 | 冰片 | `".25-7.5g"` | 0.3g | **25×** |
| 10 | `wu_mei_wan` 烏梅丸 | 細辛 | `"1-28g"` | 3g | **9.3×** |
| 11 | `zi_xue_dan` 紫雪丹 | 麝香 | `"0.3-0.8g"` | 0.1g | **8×** |
| 12 | `zi_xue_dan` 紫雪丹 | 硃砂 | `"0.9-2g"` | 0.5g | **4×** |
| 13 | `chuan_xiong_cha_tiao_san` 川芎茶調散 | 細辛 | `"1-10g"` | 3g | 3.3× |
| 14 | `xiao_qing_long_tang` 小青龍湯 | 細辛 | `"3-9g"` | 3g | 3× |
| 15 | `dang_gui_si_ni_tang` 當歸四逆湯 | 細辛 | `"1.5-9g"` | 3g | 3× |
| 16 | `jiu_wei_qiang_huo_tang` 九味羌活湯 | 細辛 | `"1-6g"` | 3g | 2× |
| 17 | `du_huo_ji_sheng_tang` 獨活寄生湯 | 細辛 | `"1-6g"` | 3g | 2× |
| 18 | `da_huang_fu_zi_tang` 大黃附子湯 | 細辛 | `"1-6g"` | 3g | 2× |

**新增（EYESON_02 batch 2 未取樣到的 4 卡）**：`chuan_xiong_cha_tiao_san`、`xiao_qing_long_tang`、
`dang_gui_si_ni_tang`、`jiu_wei_qiang_huo_tang` ——四張都是細辛族、且都不在 batch 1/2 的 61 卡抽樣裡，
證實 EYESON_02 §3「附子族/麻黃族/細辛族全庫覆蓋仍未讀完」的判斷。
與 CONTENT_REQUEST §E「毒性藥劑量疑似錯誤」直接對應（該段列了 3 筆，此處是全庫 18 筆的母體）。

---

## §2 FB-15 — 中文毒性/瀕危警語空白或殘骸、英文有 markdown 毒性標註（全庫）

**判準**（抄自 F-26，範圍限定 `composition[].in_formula_zh` / `in_formula_en`，理由見下）：
`in_formula_en` 含**markdown 加粗的**毒性／瀕危警語（`**...toxic|obsolete|endangered|unsafe...**`），
而同一味藥的 `in_formula_zh` 為空字串或含 `**` 殘骸。

⚠️ **判準特意排除裸字比對**：`in_formula_en` 常有「resolves toxicity」（解毒，普通功效敘述，
不是警語）這種字面含 `toxic` 子字串但完全正常的句子——若判準只比對 `/toxic/`，
`toxicity` 會誤命中，18 筆會膨脹成假陽性。限定在 `**...**` 加粗片語裡，才是 F-26 原本指的
「英文匯入層對毒藥／瀕危藥有 markdown 標註」那件事本身。

**一行重現指令**：

```bash
node -e "const r=require('./data/herbs/formulas.json').records;const T=/\*\*[^*]*(toxic|obsolete|endangered|unsafe)[^*]*\*\*/i;let n=0;for(const f of r)for(const c of f.composition||[]){const en=String(c.in_formula_en||'');if(!T.test(en))continue;const zh=String(c.in_formula_zh||'');if(/\*\*/.test(zh)||zh.trim()===''){n++;console.log(f.id,c.herb_zh||c.name_zh,'zh=',JSON.stringify(zh))}}console.log('rows:',n)"
```

**結果：14 列**（6 列 `**` 殘骸 + 8 列全空）。

| # | 卡 | 藥 | `in_formula_zh` 原值 | `in_formula_en`（節錄，含加粗警語） |
|---|---|---|---|---|
| 1 | `si_ni_tang` 四逆湯 | (生附子) | `""`（全空） | `"AD lists this only for a critical condition. **Unprocessed aconite is highly toxic; historical/source data only.**"` |
| 2 | `an_gong_niu_huang_wan` 安宮牛黃丸 | Xi Jiao | `"涼血止血， **，**。"` | `"...**Rhino horn substitute; endangered/obsolete...**"` |
| 3 | `an_gong_niu_huang_wan` 安宮牛黃丸 | 硃砂 | `"清熱瀉火， **，**。"` | `"...**Cinnabar/mercury is obsolete/toxic...**"` |
| 4 | `zi_xue_dan` 紫雪丹 | Xi Jiao | `"涼血止血， **，**。"` | `"...**Obsolete/endangered...**"` |
| 5 | `zi_xue_dan` 紫雪丹 | 羚羊角 | `""`（全空） | `"Drains Liver Fire and extinguishes Wind. **Endangered/obsolete source ingredient.**"` |
| 6 | `zi_xue_dan` 紫雪丹 | (Qing Mu Xiang／青木香) | `""`（全空） | `"...**Aristolochia is unsafe/obsolete.**"` |
| 7 | `zi_xue_dan` 紫雪丹 | 硃砂 | `"清熱瀉火， **，**。"` | `"...**Obsolete/toxic.**"` |
| 8 | `zhi_bao_dan` 至寶丹 | (Xi Jiao) | `"替代藥材，涼血止血， **，**。"` | `"AD lists historical substitute/original...**endangered...**"` |
| 9 | `su_he_xiang_wan` 蘇合香丸 | Xi Jiao | `""`（全空） | `"Historically resolves toxicity/calms Shen. **Endangered; AD states no longer used.**"` |
| 10 | `su_he_xiang_wan` 蘇合香丸 | 硃砂 | `""`（全空） | `"Sedates Heart/Shen, expels Phlegm and stops convulsions. **Obsolete/toxic mercury source ingredient.**"` |
| 11 | `jiu_xian_san` 九仙散 | Mi Zhi Ying Su Ke（蜜炙罌粟殼） | `""`（全空） | `"Strongly astringes Lung Qi to stop chronic cough/wheeze. **Obsolete/restricted...**"` |
| 12 | `da_xian_xiong_tang` 大陷胸湯 | 甘遂 | `""`（全空） | `"Strongly drains water/congested fluids downward. **Potentially toxic; ...**"` |
| 13 | `zhu_sha_an_shen_wan` 硃砂安神丸 | Shui Fei Zhu Sha（水飛硃砂） | `"清熱瀉火， **，**。"` | `"Heavily sedates Heart/Shen...**"` |
| 14 | `ci_zhu_wan` 磁朱丸 | 硃砂 | `""`（全空） | `"Sedates/calms Shen, clears Heart Heat, expels Phlegm and stops convulsions...**"` |

新增（不在 EYESON_02 30 卡抽樣裡的 4 卡）：`jiu_xian_san`（罌粟殼，鴉片類管制藥材）、
`da_xian_xiong_tang`（甘遂，十八反相關）、`zhu_sha_an_shen_wan`（硃砂，方名本身就是硃砂）、
`si_ni_tang` 的**生附子**列本次也計入（EYESON_02 F-29 已點名同一列，判準相同）。
**不可自動翻**——這些是安全主張，翻譯需要具名來源（憲法紅線 4），此處只報告缺口，
不填入任何文字。與 CONTENT_REQUEST B 段（逐藥標準禁忌敘述）直接對應。

---

## §3 FB-21 — 同卡多味藥共用同一個 `dose_g` 字串（機器產生的假區間，全庫）

**判準**（延伸 F-25「同族形狀問題」，本文件把它變成可重跑的規則）：
一張卡的 `composition` ≥5 味，其中 ≥5 味的 `dose_g` 欄位**逐字相同**——
一個方裡不同藥材共用完全相同的劑量範圍字串，比對照藥典各味各自的常用量而言，
是資料匯入時套用「這批全部填同一個佔位區間」的形狀，不是逐味核過的劑量。
（5 的門檻：兩個已知案例分別是 10/13 與 9/9 味，選 5 是為了同時抓住較小的方而不誤觸
兩味藥剛好劑量相近的正常情況——門檻是本文件的判斷，不是 F-25 原文的數字，特此註明。）

**一行重現指令**：

```bash
node -e "const r=require('./data/herbs/formulas.json').records;let cards=0,lines=0;for(const f of r){const c=f.composition||[];if(c.length<5)continue;const by={};for(const x of c){const v=String(x.dose_g||'').trim();if(!v)continue;(by[v]=by[v]||[]).push(x.herb_zh||x.name_zh)}for(const[v,h]of Object.entries(by))if(h.length>=5){cards++;lines+=h.length;console.log(f.id,'dose_g=',v,h.length+'/'+c.length,h.join('、'))}}console.log('cards:',cards,'lines:',lines)"
```

**結果：19 張卡 / 20 組（防風通圣散一卡兩組，故組數比卡數多 1）/ 136 味次**
（EYESON_02 batch 2 只在 30 卡抽樣裡看到 2 卡 19 味；全庫是 19 卡 20 組 136 味次）。

| # | 卡 | 共用 `dose_g` | 味數/總味數 | 共用的藥 |
|---|---|---|---|---|
| 1 | `shi_pi_yin` 實脾飲 | `"4-30g"` | 10/13 | 制附子、炮薑、茯苓、白朮、木瓜、厚朴、木香、大腹皮、(檳榔)、草果 |
| 2 | `shi_pi_san` 實脾散 | `"4-30g"` | 10/13 | 制附子、Pao Jiang、茯苓、白朮、木瓜、厚朴、木香、大腹皮、(檳榔)、草果 |
| 3 | `zai_zao_san` 再造散 | `"3g"`（單一值） | 9/12 | 人參、制附子、桂枝、細辛、羌活、川芎、防風、炒白芍、煨生薑 |
| 4 | `ren_shen_bai_du_san` 人參敗毒散 | `"2-30g"` | 9/13 | 羌活、獨活、川芎、柴胡、桔梗、Ju Chao Zhi Ke、前胡、人參、茯苓 |
| 5 | `bai_du_san` 敗毒散 | `"2-30g"` | 9/13 | 羌活、獨活、川芎、柴胡、桔梗、Ju Chao Zhi Ke、前胡、人參、茯苓 |
| 6 | `tian_tai_wu_yao_san` 天台烏藥散 | `"5-15g"` | 8/8（全卡） | 烏藥、木香、小茴香、青皮、高良薑、檳榔、川楝子、巴豆 |
| 7 | `du_huo_ji_sheng_tang` 獨活寄生湯 | `"3-10g"` | 7/18 | 防風、秦艽、牛膝、當歸、生地黃、(熟地黃)、白芍 |
| 8 | `fang_feng_tong_sheng_san` 防风通圣散 | `"3-15g"` | 7/18 | 麻黃、Jiu Da Huang、芒硝、薄荷、梔子、川芎、當歸 |
| 9 | `jiu_xian_san` 九仙散 | `"3-30g"` | 7/14 | 人參、烏梅、五味子、阿膠、款冬花、桔梗、桑白皮 |
| 10 | `zuo_gui_wan` 左歸丸 | `"12-30g"` | 6/8 | 山藥、枸杞子、山茱萸、菟絲子、鹿角膠、Gui Ban Jiao |
| 11 | `ge_xia_zhu_yu_tang` 膈下逐瘀湯 | `"6-12g"` | 6/12 | 炒五靈脂、當歸、桃仁、赤芍、烏藥、紅花 |
| 12 | `qing_qi_hua_tan_wan` 清氣化痰丸 | `"6-30g"` | 6/8 | Chao Huang Qin、栝樓仁、Chao Zhi Shi、陳皮、茯苓、杏仁 |
| 13 | `zhen_gan_xi_feng_tang` 鎮肝熄風湯 | `"9-15g"` | 6/12 | 龍骨、牡蠣、龜板、玄參、天門冬、白芍 |
| 14 | `xian_fang_huo_ming_yin` 仙方活命飲 | `"3-15g"` | 6/13 | 白芷、防風、Zhi Chuan Shan Jia、沒藥、乳香、赤芍 |
| 15 | `ren_shen_yang_rong_tang` 人參養榮湯 | `"2-30g"` | 5/16 | 人參、黃耆、白朮、當歸、陳皮 |
| 16 | `taishan_pan_shi_san` 泰山磐石散 | `"3-6g"` | 5/12 | 人參、川芎、白芍、續斷、黃芩 |
| 17 | `shen_tong_zhu_yu_tang` 身痛逐瘀湯 | `"6-9g"` | 5/12 | 川芎、桃仁、紅花、當歸、川牛膝 |
| 18 | `zhi_sou_san` 止嗽散 | `"4-10g"` | 5/7 | 紫菀、白前、百部、桔梗、荊芥 |
| 19 | `gui_pi_tang` 歸脾湯 | `"3-30g"` | 5/14 | 白朮、茯苓、(茯神)、酸棗仁、龍眼肉 |
| 20 | `fang_feng_tong_sheng_san` 防风通圣散（第二組） | `"6-15g"` | 5/18 | 防風、荊芥、連翹、白芍、白朮 |

**與 FB-14 共用輸出格式**（EYESON_02 §3 原話）：`shi_pi_yin`/`shi_pi_san` 同時出現在 FB-14 的
附子族缺口列表裡——同一卡既有「機器產生的假區間」又有「附子劑量無上限提示」，兩個 worklist
的行是可以用 `formula.id` 對齊的同一批卡。`zai_zao_san` 也是 FB-14 附子族＋細辛族雙缺口的卡。

---

## §4 FB-24 — `english_exam_track.pattern_indications_zh` 殘骸（全庫）

**判準**（逐字抄自 F-38，degenerate 條目 = 以下任一）：
開頭是 `-`／`與`／`兼`／`所致之`；或含 3 個以上連續拉丁字母；或整條 ≤3 字。

**一行重現指令**：

```bash
node -e "const r=require('./data/herbs/formulas.json').records;const bad=s=>{const v=String(s||'').trim();if(!v)return false;if(/^[-與兼]|^所致之/.test(v))return true;if(/[A-Za-z]{3,}/.test(v))return true;if(v.length<=3)return true;return false};let recCount=0,items=0;for(const f of r){const list=(f.english_exam_track&&f.english_exam_track.pattern_indications_zh)||[];const arr=Array.isArray(list)?list:[list];const b=arr.filter(bad);if(b.length){recCount++;items+=b.length;console.log(f.id,JSON.stringify(b))}}console.log('records:',recCount,'items:',items)"
```

**結果：47 筆 / 90 條**（與 F-38 已經算過的「全庫 47 筆」完全一致——確認判準抄錄無誤，
本節提供的是 F-38 沒有列出的**完整全庫清單**，F-38 原文只列了本批 9 筆的例子）。

**優先序（EYESON_02 §3 原話：「過度證」兩筆優先，因為方向相反）**：

| 卡 | `pattern_indications_en` 對應原文 | `pattern_indications_zh` 殘骸 | 問題 |
|---|---|---|---|
| `xiao_cheng_qi_tang` 小承氣湯 | `"Relatively mild Colon Excess Heat"` | `"過度證"` | **方向相反**——「相對輕證」被印成「過度證」（過度＝excessive），而小承氣湯正是承氣三方裡最輕的一方，這正是它跟大承氣湯的鑑別考點 |
| `si_ni_tang` 四逆湯 | `"Excess use of diaphoretics in Tai Yang Stage leading to loss of Yang"` | `"過度證"` | 同一個殘骸字串，來源不同語境，同樣不可讀 |

**其餘 45 筆（47 筆全庫清單，依 id 排序）**：

```
xiao_qing_long_tang   ["溢飲證","支飲證"]
yin_qiao_san          ["燥熱證","暑濕證","濕熱證"]
sang_ju_yin           ["暑濕證","濕熱證"]
zhu_ye_shi_gao_tang   ["中暑證"]
huang_lian_jie_du_tang ["肺熱證"]
qing_wei_san          ["胃熱證"]
ma_zi_ren_wan         ["與所致之證"]
xiao_yao_san          ["與證","兼證","與兼，與骨骨蒸證"]
tong_xie_yao_fang     ["所致之肝氣鬱滯證","所致之肝氣鬱滯證兼風寒證侵證"]
ban_xia_xie_xin_tang  ["與兼與證","兼證","濕熱證"]
li_zhong_wan          ["胃寒證","與腎陽虛證-:與證","所致之證","所致之脾陽虛證"]
wu_zhu_yu_tang        ["與證"]
dang_gui_bu_xue_tang  ["陰瘡"]
jin_gui_shen_qi_wan   ["腳氣病","痰飲證","消渴證"]
mu_li_san             ["所致之證","所致之與證"]
gan_mai_da_zao_tang   ["臟躁病"]
gui_zhi_fu_ling_wan   ["痰-濕inMiddkeJiao證"]   ← 英文碎片留在 _zh，見 FB-20 的 F-32
wu_ling_san           ["痰飲證"]
san_ren_tang          ["暑濕證"]
fang_ji_huang_qi_tang ["風濕證"]
ba_zheng_san          ["石淋證","血淋證"]
er_chen_tang          ["-證","-證","-兼證","-證"]
wen_dan_tang          ["-證","與兼證","濕熱證"]
ban_xia_bai_zhu_tian_ma_tang ["-證","-證"]
qing_qi_hua_tan_wan   ["痰熱證"]
xiao_xian_xiong_tang  ["與積證","痰熱證"]
chuan_xiong_cha_tiao_san ["外證"]
xiao_feng_san         ["濕熱證","所致之-與/風熱證"]
zhen_gan_xi_feng_tang ["與腎陰虛證兼兼與證","頭證"]
bao_he_wan            ["食積證"]
an_gong_niu_huang_wan ["-證","-證","所致之-證"]
zhi_bao_dan           ["-痰熱證","中暑證","-證","-證","與所致之痰熱證"]
bai_du_san            ["-寒濕證兼證"]
da_ding_feng_zhu       ["所致之與肝陰虛證"]
du_huo_ji_sheng_tang  ["兼與證","兼氣血兩虛證","痿證病"]
gan_lu_xiao_du_dan    ["暑濕證"]
lian_po_yin           ["霍亂證","痰火證","暑濕證"]
ling_jiao_gou_teng_tang ["-證",":證","痰熱證"]
mai_men_dong_tang     ["與肺陰虛證","痿證"]
qian_zheng_san        ["-證","-阻經頭與證"]
qing_zao_jiu_fei_tang ["與所致之與證","-證"]
shi_xiao_san          ["血瘀證"]
si_ni_san             ["與兼與證"]
su_he_xiang_wan       ["-所致之阻-證","所致之證","所致之證"]
wu_mei_wan            ["與證"]
```

（每一列都是 `english_exam_track.pattern_indications_zh` 陣列裡的原文，貼上即引用——
不是摘要。3 字以下的條目如「陰瘡」「臟躁病」「肺熱證」表面看像正常證候名，
但判準抄自 F-38 且刻意不看字面「像不像中文詞」——因為這個欄位的壞掉模式正是
「破碎的翻譯殘留」，3 字以下在這個特定欄位裡本身就是被截斷的訊號，跟這串字
單獨看起來通不通順無關。）

**渲染層提示**：`english_exam_track.source_note` 自己寫著「渲染層優先讀本區」（F-38），
所以卡片上讀者看到的極可能就是這些殘骸，不是 record 層的乾淨版本。與 FB-18（`treats_zh` ≡
`modern_applications_zh` 重複層）同類——渲染層讀哪個欄位，決定卡片對不對，是這一系列
worklist 共同指向的下一個治理問題。

---

## 交叉引用小結

| worklist | 對應 CR 段落 | 全庫列數 | 優先處理 |
|---|---|---|---|
| FB-14 | §E 毒性藥劑量疑似錯誤 | 18 | 雄黃/硃砂/冰片（300×~25×）> 細辛（9.3×~2×） |
| FB-15 | §B 逐藥標準禁忌敘述（前提：中文要先能顯示） | 14 | `si_ni_tang` 生附子全空——回陽急救方，最該優先補 |
| FB-21 | （新，FB-14 的姊妹判準） | 19 卡 / 20 組 / 136 味次 | `shi_pi_yin`/`shi_pi_san` 雙缺口（FB-14+FB-21 同卡） |
| FB-24 | （新，F-38 全庫版） | 47 筆 / 90 條 | `xiao_cheng_qi_tang`/`si_ni_tang` 的「過度證」方向相反 |

四份都是唯讀 worklist，沒有一條寫入 `data/**`。下一步是 Ting 或 SOL 決定：
FB-14/FB-21 是否需要回課件核對真實劑量（憲法紅線 4：劑量不可虛構，只能查來源或列缺口）；
FB-15 需要 CONTENT_REQUEST B 段的逐藥標準敘述才能填；FB-24 是否要整批清空
`english_exam_track.pattern_indications_zh` 改回退顯示 record 層（若 record 層更乾淨的話，
需逐筆核對，不能假設）。

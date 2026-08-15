# 樣板處方重建:67 張的分批計畫

67 張條件卡的 `acupoint_protocols` 曾經是**同一個字串**
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12),已搬進 `import_artifacts` 並清空。
重建需要逐病來源 —— 收集規格見 `GYN_PROTOCOL_COLLECTION_REQUEST.md`,每批照抄改清單即可。

**一次一批,不要一次發 67 張。** 婦科那批回來、流程驗證過再發下一批:
若回傳格式或來源標準有問題,一批 10 張改起來還來得及,67 張就來不及了。

---

## 批次順序與理由

| 批 | 類別 | 張數 | 為什麼排這個順序 |
|---|---|---|---|
| **B1** | 婦科 | 9 | **進行中**。Ting 的臨床重心,而且婦科針灸的系統性回顧相對齊全 |
| **B2** | 疼痛/肌骨 | 11 | **診間最高頻**,而且是針灸實證最強的一塊(Vickers IPD meta-analysis、多篇 Cochrane) |
| **B3** | 精神/睡眠(核心 10) | 10 | **請求已寫好** — `PSYCH_SLEEP_PROTOCOL_COLLECTION_REQUEST.md`。 焦慮、失眠、慢性疲勞在診間常見;證據中等但存在 |
| **B4** | 行為改變(2) | 2 | **預期是負面/不足的證據**,單獨一批,見下方說明 |
| **B5** | 神經 | 8 | 中風後復健有實證;其餘多為輔助角色,scope 比 protocol 重要 |
| **B6** | 呼吸(5)+腸胃(6) | 11 | 感冒/鼻竇炎為診間常見;CINV 有實證(與妊娠劇吐相反,見下) |
| **B7** | 內分泌代謝(7)+泌尿(2) | 9 | 多為輔助;骨質疏鬆、甲狀腺以安全界線為主 |
| **B8** | 心血管(4)+皮膚(3) | 7 | **風險最高的一批**,scope 與轉診條件比穴位重要 |

---

## B2 疼痛/肌骨(11)

`acute_lumbar_sprain` 急性腰扭傷 · `neck_pain_stiff` 急性頸痛／落枕 ·
`whiplash` 揮鞭式頸部損傷 · `rotator_cuff` 旋轉肌袖肌腱病變 ·
`lateral_epicondylitis` 網球肘 · `medial_epicondylitis` 高爾夫球肘 ·
`carpal_tunnel` 腕隧道症候群 · `meniscus_injury` 半月板損傷 ·
`achilles_tendinopathy` 阿基里斯腱病變 · `hip_osteoarthritis` 髖骨關節炎 ·
`piriformis_syndrome` 梨狀肌症候群

**這批的專屬要求**:
- 局部取穴容易彼此重複(阿是穴＋鄰近穴)。**11 張若回傳結果高度相似,等於另一種樣板** ——
  請說明每一張的取穴依據為何不同(受累結構、經絡循行、動作測試陽性點)。
- 半月板損傷、旋轉肌袖:**先問這張卡是否適合有處方**。結構性撕裂需要影像與骨科評估,
  針灸是症狀輔助;若來源只支持「術後或保守期的疼痛輔助」,就照實寫,不要寫成治療撕裂。
- 腕隧道:與夜間麻木、Phalen/Tinel 陽性、以及**是否已有肌肉萎縮**(手術指徵)有關,
  請一併收集轉診門檻。

## B3 精神/睡眠 核心(10)

`anxiety` · `panic_disorder` · `ptsd` · `adhd` · `stress_burnout` ·
`chronic_fatigue` · `restless_legs` · `somatic_symptom` · `poor_memory` · `eating_disorder`

**這批的專屬要求**:
- 每張都要收集**紅旗/轉診條件**(自傷風險、精神科共病、藥物交互),優先於穴位。
- `eating_disorder`:醫療不穩定(電解質、心律、體重)是禁忌情境,請明確收集。
- `adhd`、`ptsd`:若證據只支持「輔助既有治療」,請逐字寫出,不要寫成替代方案。

## B4 行為改變(2)—— **預期查不到支持性證據**

`smoking_cessation` 戒菸輔助 · `alcohol_use` 飲酒問題輔助

**這一批單獨發,而且明確告訴收集者:回傳「證據不支持」是正確答案。**
針灸用於戒菸的 Cochrane 回顧結論並不支持常規使用;若查到的就是這個結論,
請照實回傳 `no_source_found: false` 但 `points: []`,並在 `evidence_note_zh`
寫清楚「現有回顧不支持」。

**把這兩張與 B3 分開,是為了不讓「整批都要有處方」的氣氛逼出一份湊出來的配穴。**

## B5 神經(8)

`stroke_rehab` · `peripheral_neuropathy` · `diabetic_neuropathy` ·
`postherpetic_neuralgia` · `parkinsons` · `multiple_sclerosis` ·
`essential_tremor` · `menieres`

- `stroke_rehab` 有實證基礎,請收集**介入時機**(急性期 vs 恢復期)。
- `diabetic_neuropathy`:足部感覺缺失時的**針刺安全**(燙傷、感染、不易察覺的損傷)要一併收集。
- `multiple_sclerosis`、`parkinsons`:多為症狀輔助,scope 的界線比穴位重要。

## B6 呼吸(5)+腸胃(6)

`common_cold` · `influenza` · `chronic_sinusitis` · `acute_bronchitis` · `sleep_apnea`
`ibd` · `nafld` · `gallbladder_dysfunction` · `cinv` · `post_op_ileus` · `food_sensitivity`

- **`cinv`(化療相關噁心)是與妊娠劇吐相反的案例**:PC6 在 CINV 的證據基礎與
  在妊娠劇吐的證據基礎**不同**,請分別引用、不要互相套用。這正是 CD007575 那個教訓。
- `sleep_apnea`:針灸不能取代 CPAP/手術評估,請收集轉診門檻。
- `ibd`:活動期與緩解期不同,且免疫抑制劑用藥者的針刺感染風險要一併收集。

## B7 內分泌代謝(7)+泌尿(2)

`metabolic_syndrome` · `hashimoto` · `obesity` · `dyslipidemia` ·
`osteoporosis` · `hpa_dysregulation` · `edema_fluid`
`interstitial_cystitis` · `urinary_retention`

- `osteoporosis`:**針刺深度與骨折風險**是這張卡的重點,不是配穴。
- `obesity`:與 B4 同一個風險 —— 若證據只支持「輔助生活型態介入」,照實寫。
- `urinary_retention`:急性尿滯留是急症,請收集「何時不得針灸而應導尿」。

## B8 心血管(4)+皮膚(3)—— **最後做,風險最高**

`cad` · `raynaud` · `varicose_veins` · `poor_circulation`
`alopecia` · `rosacea` · `pruritus`

- `cad`:胸痛的鑑別與轉診門檻**優先於任何配穴**。這張卡若只能給 scope,那就只給 scope。
- `varicose_veins`、`poor_circulation`:**患肢局部針刺的禁忌**(血栓、潰瘍、感染)要先收集。
- `raynaud`:已於 2026-08-12 確認 can_treat/precautions 未對調,但缺血或已潰瘍指端
  禁止局部針刺的規則要寫進處方層。

---

## 每批回來之後我會做的

1. 寫進 `data/pathology/condition_canon_shortlist.json`
2. **逐病比對確認該批彼此不相同**(相同就是樣板換包裝)
3. `validate-no-template-protocol.js` + `validate-condition-standard.js` + ratchet
4. 開卡片用眼睛看:處方、證據說明、專屬注意事項三者都要在畫面上
5. 回報逐張數字(幾張有處方、幾張證據不足留空、幾張只給 scope)

**「留空」是合格結果。** 一批 10 張回來 3 張有處方、7 張證據不足,
是誠實的結果,不是失敗 —— 這一層的失敗是憑空生出 10 份配穴。

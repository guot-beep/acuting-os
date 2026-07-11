# CloudTCM Review Batch A - Safety Worksheet

Generated: 2026-07-11T01:07:20.573Z

This is a review worksheet only. It does not decide which source is correct and does not approve any merge.

## Scope

Batch A focuses on safety-sensitive differences from the D3 preview:

- eye / face points,
- neck and medulla-adjacent points,
- chest, back, and pneumothorax-risk points,
- abdomen, pregnancy, bladder, kidney, organ-depth caution points,
- other needling or contraindication differences that contain safety terms.

## Summary

- Safety-related diff items: 576
- Unique point codes: 335
- Canonical data changed: no
- Merge/apply approved: no

## Region Counts

- abdomen-pregnancy-organ-depth: 42
- chest-back-pneumothorax: 44
- eye-face: 9
- keyword-only: 228
- neck-head-risk: 8
- pregnancy-caution-common: 8

## Reviewer Rule

For each point, choose one decision:

- Keep current canonical text.
- Keep current text but add a source-review note later.
- Rewrite a concise canonical sentence after checking WHO SAPL / approved source.
- Use CloudTCM only as private draft reference.

Do not bulk copy CloudTCM prose into canonical 361 data.

## Top Safety Review Rows

| code | zh | region | fields / flags | current sample | CloudTCM sample |
|---|---|---|---|---|---|
| GB21 | 肩井 | chest-back-pneumothorax, pregnancy-caution-common | location_zh (wording); needling (direction_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:肺, safety_term_diff:孕, safety_term_diff:禁) | 肩上，乳頭直上與大椎連線中點附近。 | 肩上，前直乳中，當大椎與肩峰端連線的中點處 |
| KI12 | 大赫 | abdomen-pregnancy-organ-depth | location_zh (safety_term_diff:腹); needling (safety_term_diff:腹, safety_term_diff:腹腔, safety_term_diff:孕); contraindications (safety_term_diff:腹, safety_term_diff:孕, safety_term_diff:膀胱) | 下腹部，臍下 4 寸，前正中線旁開 0.5 寸。 | 臍下4寸，前正中線旁開0.5寸 |
| LI4 | 合谷 | pregnancy-caution-common | location_zh (wording); needling (depth_diff, safety_term_diff:孕, safety_term_diff:動脈); contraindications (safety_term_diff:禁, safety_term_diff:不可, safety_term_diff:強刺激) | 手背，第 2 掌骨橈側中點附近；常以拇指、食指併攏時肌肉隆起最高處作參考。 | 手背第一、二掌骨之間，約當第二掌骨橈側中點處。 |
| BL13 | 肺俞 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:胸, safety_term_diff:肺, safety_term_diff:氣胸) | 第 3 胸椎棘突下，旁開 1.5 寸。 | 背部第三胸椎棘突下（身柱）旁開1.5寸處 |
| KI22 | 步廊 | chest-back-pneumothorax | location_zh (safety_term_diff:胸); needling (direction_diff, safety_term_diff:肺, safety_term_diff:不可); contraindications (safety_term_diff:胸, safety_term_diff:肺, safety_term_diff:氣胸) | 胸部，第 5 肋間隙，前正中線旁開 2 寸。 | 第五肋間隙，前正中線旁開2寸 |
| ST2 | 四白 | eye-face | location_zh (safety_term_diff:面); needling (depth_diff, direction_diff, safety_term_diff:眼); contraindications (safety_term_diff:眼, safety_term_diff:不可, safety_term_diff:深刺) | 目正視，瞳孔直下，眶下孔凹陷處。 | 在面部，瞳孔直下，當眶下孔凹陷處 |
| BL10 | 天柱 | neck-head-risk | location_zh (wording); needling (direction_diff, safety_term_diff:延髓, safety_term_diff:禁); contraindications (safety_term_diff:頸, safety_term_diff:延髓, safety_term_diff:不可) | 後髮際上約 0.5 寸，斜方肌外側凹陷處。 | 項後髮際，斜方肌外緣凹陷處，當後髮際正中旁開1.3寸 |
| BL11 | 大杼 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:胸, safety_term_diff:肺, safety_term_diff:不可) | 背部，第 1 胸椎棘突下，後正中線旁開 1.5 寸。 | 背部第一胸椎棘突下（陶道）旁開1.5寸處 |
| BL47 | 魂門 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:胸, safety_term_diff:氣胸, safety_term_diff:腹) | 背部，第 9 胸椎棘突下，後正中線旁開 3 寸。 | 背部第9胸椎棘突下（筋縮）旁開3寸處 |
| ST13 | 氣戶 | keyword-only | location_zh (safety_term_diff:胸); needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:氣胸, safety_term_diff:不可, safety_term_diff:深刺) | 鎖骨下緣，前正中線旁開約 4 寸。 | 胸部，鎖骨中點下緣凹陷處，距前正中線4寸 |
| ST14 | 庫房 | keyword-only | location_zh (safety_term_diff:胸); needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:胸, safety_term_diff:深刺) | 第 1 肋間隙，前正中線旁開約 4 寸。 | 胸部前正中線旁開4寸，第一肋間隙凹陷處。與華蓋相平，約當鎖骨中點下緣（氣戶）與乳頭（乳中）連線的上1/4折點 |
| ST16 | 膺窗 | keyword-only | location_zh (safety_term_diff:胸); needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:胸, safety_term_diff:氣胸, safety_term_diff:不可) | 第 3 肋間隙，前正中線旁開約 4 寸。 | 胸部前正中線旁開4寸，第3肋間隙凹陷處，乳頭上方 |
| ST26 | 外陵 | abdomen-pregnancy-organ-depth | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:腹); contraindications (safety_term_diff:腹, safety_term_diff:孕, safety_term_diff:禁) | 下腹部，臍下 1 寸，前正中線旁開 2 寸。 | 下腹部，臍中下1寸（陰交）旁開2寸處 |
| BL1 | 睛明 | eye-face | location_zh (safety_term_diff:眼, safety_term_diff:眶, safety_term_diff:面); needling (depth_diff, direction_diff, safety_term_diff:出血) | 目內眥內上方凹陷處。 | 面部，目內眥角稍上方凹陷處，當上瞼部眼眶內側緣與眼球之間空隙部 |
| BL50 | 胃倉 | keyword-only | location_zh (wording); needling (depth_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:腹, safety_term_diff:不可, safety_term_diff:深刺) | 背部，第 12 胸椎棘突下，後正中線旁開 3 寸。 | 位於人體的背部，當第12胸椎棘突下，旁開3寸。 |
| LU1 | 中府 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:氣胸); contraindications (safety_term_diff:胸, safety_term_diff:氣胸, safety_term_diff:不可) | 前胸外上方，第 1 肋間隙附近，前正中線旁開約 6 寸。 | 在胸前壁之外上部，第一肋間隙外側，距任脈六寸 |
| SP20 | 周榮 | chest-back-pneumothorax | location_zh (wording); needling (direction_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:氣胸, safety_term_diff:不可) | 胸外側部，第 2 肋間隙，前正中線旁開 6 寸。 | 胸外側部，前正中線旁開6寸，第2肋間隙凹陷處 |
| ST1 | 承泣 | eye-face | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:眼); contraindications (safety_term_diff:眼) | 目正視，瞳孔直下，眼球與眶下緣之間。 | 目正視，瞳孔直下，當眶下緣與眼球之間 |
| ST12 | 缺盆 | keyword-only | location_zh (safety_term_diff:胸); needling (depth_diff, direction_diff, safety_term_diff:肺); contraindications (safety_term_diff:胸, safety_term_diff:氣胸, safety_term_diff:深刺) | 鎖骨上窩中央，前正中線旁開約 4 寸。 | 鎖骨上窩中央，距前正中線4寸。當鎖骨中點上方，胸鎖乳突肌鎖骨頭外側凹陷處 |
| ST5 | 大迎 | keyword-only | location_zh (safety_term_diff:動脈, safety_term_diff:面); needling (depth_diff, direction_diff, safety_term_diff:強刺激); contraindications (safety_term_diff:動脈) | 下頜角前方，咬肌前緣，面動脈搏動處附近。 | 下頷骨上，下頷角下1.3寸，咬肌附著部的前緣 |
| ST9 | 人迎 | keyword-only | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:禁); contraindications (safety_term_diff:頸, safety_term_diff:胸, safety_term_diff:神經) | 喉結旁開約 1.5 寸，胸鎖乳突肌前緣，頸總動脈搏動處。 | 頸部結喉旁，胸鎖乳突肌前緣，頸總動脈搏動處。當結喉旁1.5寸 |
| BL23 | 腎俞 | keyword-only | needling (depth_diff, direction_diff, safety_term_diff:胸); contraindications (safety_term_diff:深刺) | 向脊柱方向斜刺 0.5-1 寸；腰背深刺需避開腎臟區，並注意背部深刺氣胸風險。 | 直刺0.8-1.2寸 |
| GV16 | 風府 | neck-head-risk | location_zh (safety_term_diff:頸); needling (depth_diff, direction_diff, safety_term_diff:禁); contraindications (safety_term_diff:不可) | 頸後區，後髮際正中直上 1 寸，枕外隆凸直下，兩側斜方肌之間凹陷中。 | 正坐，頭微前傾，後正中線上，入髮際上1寸 |
| GV25 | 素髎 | keyword-only | location_zh (safety_term_diff:面); needling (depth_diff, direction_diff, safety_term_diff:出血); contraindications (safety_term_diff:出血, safety_term_diff:禁) | 面部，鼻尖正中央。 | 鼻尖正中 |
| SP19 | 胸鄉 | chest-back-pneumothorax | location_zh (wording); needling (direction_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:肺, safety_term_diff:氣胸, safety_term_diff:不可) | 胸外側部，第 3 肋間隙，前正中線旁開 6 寸。 | 胸外側部，前正中線旁開6寸，第3肋間隙凹陷處 |
| SP21 | 大包 | chest-back-pneumothorax | location_zh (wording); needling (direction_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:胸, safety_term_diff:肺, safety_term_diff:禁) | 側胸部，第 6 肋間隙，腋中線上。 | 側胸部，腋窩頂點（極泉）與第11肋游離端下方（章門）連線的中點 |
| ST11 | 氣舍 | keyword-only | location_zh (safety_term_diff:頸); needling (depth_diff, direction_diff, safety_term_diff:肺) | 鎖骨上緣，胸鎖乳突肌胸骨頭與鎖骨頭之間凹陷處。 | 頸部，鎖骨內側端上緣，胸鎖乳突肌的胸骨頭與鎖骨頭之間凹陷處；當鎖骨上小窩中 |
| ST20 | 承滿 | keyword-only | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:腹); contraindications (safety_term_diff:腹, safety_term_diff:禁) | 上腹部，臍上 5 寸，前正中線旁開 2 寸。 | 上腹部，臍中上5寸（上脘）旁開2寸處，當不容下1寸 |
| BL12 | 風門 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 背部，第 2 胸椎棘突下，後正中線旁開 1.5 寸。 | 背部第二胸椎棘突下旁開1.5寸處，約與肩胛骨上角相平 |
| BL14 | 厥陰俞 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 背部，第 4 胸椎棘突下，後正中線旁開 1.5 寸。 | 背部第四胸椎棘突下旁開1.5寸處 |
| BL15 | 心俞 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 背部，第 5 胸椎棘突下，後正中線旁開 1.5 寸。 | 心俞穴位於第五胸椎棘突、旁開1.5寸。取穴時一般可以采用正坐或俯臥姿勢。 |
| BL16 | 督俞 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 背部，第 6 胸椎棘突下，後正中線旁開 1.5 寸。 | 背部第六胸椎棘突下（靈台）旁開1.5寸處 |
| BL17 | 膈俞 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 第 7 胸椎棘突下，旁開 1.5 寸。 | 背部第七胸椎棘突下（至陽）旁開1.5寸處 |
| BL2 | 攢竹 | eye-face | location_zh (safety_term_diff:面); needling (direction_diff, safety_term_diff:眼, safety_term_diff:出血) | 眉頭凹陷處，眶上切跡附近。 | 面部眉頭陷中，當眶上切跡處 |
| BL25 | 大腸俞 | keyword-only | needling (direction_diff, safety_term_diff:胸, safety_term_diff:氣胸); contraindications (safety_term_diff:腎, safety_term_diff:深刺) | 向脊柱方向斜刺 0.8-1.2 寸；腰背深刺需避開深部臟器，並注意背部深刺氣胸風險。 | 直刺0.8-1.2寸 |
| BL40 | 委中 | keyword-only | needling (depth_diff, safety_term_diff:動脈, safety_term_diff:靜脈); contraindications (safety_term_diff:腎, safety_term_diff:神經, safety_term_diff:出血) | 直刺 1-1.5 寸，或點刺出血；避開膕動脈與膕靜脈。 | 直刺0.5-1寸，或用三稜針點刺出血。 |
| BL43 | 膏肓 | chest-back-pneumothorax | location_zh (wording); needling (depth_diff, direction_diff, safety_term_diff:胸) | 背部，第 4 胸椎棘突下，後正中線旁開 3 寸。 | 背部第四胸椎棘突下旁開3寸，內與厥陰俞相平 |
| CV14 | 巨闕 | abdomen-pregnancy-organ-depth | location_zh (safety_term_diff:胸, safety_term_diff:腹); needling (depth_diff, direction_diff, safety_term_diff:不可) | 上腹部，前正中線上，臍中上 6 寸。 | 前正中線上，臍上6寸；或胸劍聯合下2寸 |
| KI11 | 橫骨 | abdomen-pregnancy-organ-depth | location_zh (safety_term_diff:腹); needling (safety_term_diff:腹, safety_term_diff:腹腔, safety_term_diff:孕) | 下腹部，臍下 5 寸，前正中線旁開 0.5 寸。 | 臍下5寸，恥骨聯合上際，前正中線旁開0.5寸 |
| KI13 | 氣穴 | abdomen-pregnancy-organ-depth | location_zh (safety_term_diff:腹); needling (safety_term_diff:腹, safety_term_diff:腹腔, safety_term_diff:孕) | 下腹部，臍下 3 寸，前正中線旁開 0.5 寸。 | 臍下3寸，前正中線旁開0.5寸 |

## Full Code List

`GB21`, `KI12`, `LI4`, `BL13`, `KI22`, `ST2`, `BL10`, `BL11`, `BL47`, `ST13`, `ST14`, `ST16`, `ST26`, `BL1`, `BL50`, `LU1`, `SP20`, `ST1`, `ST12`, `ST5`, `ST9`, `BL23`, `GV16`, `GV25`, `SP19`, `SP21`, `ST11`, `ST20`, `BL12`, `BL14`, `BL15`, `BL16`, `BL17`, `BL2`, `BL25`, `BL40`, `BL43`, `CV14`, `KI11`, `KI13`, `KI14`, `KI15`, `KI23`, `KI24`, `KI25`, `KI26`, `KI27`, `LI18`, `LR14`, `SI16`, `SI18`, `SP14`, `SP15`, `SP18`, `SP6`, `ST10`, `ST25`, `ST30`, `BL18`, `BL19`, `BL20`, `BL21`, `BL22`, `CV12`, `CV15`, `CV17`, `CV4`, `GB20`, `GB22`, `GB23`, `GB25`, `GV1`, `GV15`, `KI16`, `KI17`, `KI21`, `LU2`, `SI13`, `SI15`, `SI17`, `SP11`, `SP12`, `SP13`, `SP16`, `SP17`, `ST15`, `ST18`, `ST28`, `ST3`, `ST42`, `ST7`, `BL41`, `BL42`, `BL44`, `BL45`, `BL46`, `BL48`, `BL49`, `CV2`, `CV22`, `CV6`, `GB24`, `KI18`, `KI19`, `KI20`, `LI10`, `LI13`, `LI17`, `LR12`, `LU8`, `LU9`, `PC1`, `SI11`, `SI12`, `SI19`, `ST19`, `ST21`, `ST22`, `ST27`, `ST29`, `ST34`, `ST37`, `ST4`, `TE16`, `BL24`, `BL26`, `BL27`, `BL28`, `BL29`, `BL30`, `BL36`, `BL55`, `BL60`, `BL61`, `GB1`, `GB28`, `GV14`, `GV6`, `GV7`, `GV8`, `HT4`, `HT5`, `KI8`, `KI9`, `LI1`, `LI19`, `LI20`, `LI5`, `LI8`, `LR10`, `LR13`, `LR5`, `SI14`, `SI7`, `ST23`, `ST24`, `ST31`, `ST38`, `ST39`, `TE15`, `TE17`, `TE23`, `BL35`, `BL38`, `BL5`, `BL52`, `BL56`, `BL57`, `BL58`, `BL59`, `BL67`, `CV10`, `CV11`, `CV13`, `CV18`, `CV19`, `CV23`, `CV24`, `CV3`, `CV7`, `CV8`, `GB10`, `GB11`, `GB2`, `GB30`, `GB31`, `GB34`, `GB36`, `GB7`, `GB8`, `GB9`, `GV10`, `GV11`, `GV12`, `GV13`, `GV20`, `GV22`, `GV23`, `GV27`, `GV9`, `LI15`, `LI16`, `LI6`, `LI7`, `LI9`, `LR6`, `PC3`, `SI10`, `SI6`, `SI9`, `ST17`, `ST32`, `ST33`, `ST41`, `ST45`, `TE10`, `TE13`, `TE21`, `TE22`, `TE6`, `BL51`, `BL53`, `BL62`, `BL63`, `BL64`, `BL65`, `BL66`, `CV16`, `CV20`, `CV21`, `CV5`, `CV9`, `GB12`, `GB13`, `GB19`, `GB26`, `GB27`, `GB3`, `GB4`, `GB44`, `GB5`, `GB6`, `GV17`, `GV18`, `GV19`, `GV21`, `GV26`, `GV28`, `HT1`, `KI10`, `KI3`, `KI4`, `KI7`, `LI11`, `LI12`, `LI14`, `LI2`, `LI3`, `LR1`, `LR2`, `LU11`, `LU3`, `LU5`, `LU7`, `PC6`, `SI8`, `SP7`, `ST35`, `ST43`, `ST6`, `ST8`, `TE18`, `TE19`, `TE20`, `BL3`, `BL31`, `BL32`, `BL33`, `BL34`, `BL37`, `BL39`, `BL4`, `BL6`, `BL7`, `BL8`, `BL9`, `GB14`, `GB15`, `GB16`, `GB17`, `GB18`, `GB29`, `GB32`, `GB33`, `GB35`, `GB37`, `GB38`, `GB39`, `GB43`, `GV24`, `GV3`, `GV4`, `GV5`, `HT2`, `HT6`, `HT7`, `HT8`, `HT9`, `KI1`, `LR11`, `LR3`, `LR4`, `LR7`, `LR8`, `LR9`, `LU10`, `LU6`, `PC2`, `PC7`, `PC9`, `SI2`, `SP1`, `SP10`, `SP3`, `SP8`, `SP9`, `ST36`, `TE11`, `TE12`, `TE14`, `TE2`, `TE5`, `TE8`, `TE9`, `TE1`

Full machine-readable worksheet: docs/CLOUDTCM_REVIEW_BATCH_A_SAFETY.json

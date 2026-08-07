# CloudTCM / 361 Canonical Encoding Findings

Generated: 2026-07-11T01:08:12.812Z

This is a finding document only. It does not modify canonical data.

## Summary

- Damaged string fields found in `data/acupoints/361.json`: 16
- Affected point codes: BL61, BL62, BL63, BL64, BL65, BL66, BL67
- Pattern: strings containing three or more literal question marks, suggesting prior encoding loss.

## Recommendation

Do not bulk apply CloudTCM. However, these damaged fields should be handled before source review because the current canonical value is not readable.

Recommended next step:

1. Create a tiny gated repair batch for BL61-BL67 damaged fields only.
2. Use CloudTCM staging only as one reference source.
3. Prefer concise rewritten canonical text over direct bulk copied prose.
4. Run validators and encoding check afterward.

## Findings Table

| code | zh | field | damaged value | CloudTCM source |
|---|---|---|---|---|
| BL61 | 僕參 | location_zh | ???????????? BL60 ????????????? | https://cloudtcm.com/acupoint/365 |
| BL61 | 僕參 | clinical_pearls | ????????????????????????????? | https://cloudtcm.com/acupoint/365 |
| BL61 | 僕參 | danger | ?????????????????????? | https://cloudtcm.com/acupoint/365 |
| BL62 | 申脈 | clinical_pearls | ????????????? SI3 ??????????????????? | https://cloudtcm.com/acupoint/366 |
| BL62 | 申脈 | danger | ???????????????????? | https://cloudtcm.com/acupoint/366 |
| BL63 | 金門 | clinical_pearls | ???????????????????????????? | https://cloudtcm.com/acupoint/367 |
| BL63 | 金門 | danger | ??????????????????????? | https://cloudtcm.com/acupoint/367 |
| BL64 | 京骨 | clinical_pearls | ???????????????????????? | https://cloudtcm.com/acupoint/368 |
| BL65 | 束骨 | clinical_pearls | ??????????????????????? | https://cloudtcm.com/acupoint/369 |
| BL65 | 束骨 | danger | ??????????? | https://cloudtcm.com/acupoint/369 |
| BL66 | 足通谷 | clinical_pearls | ?????????????????????? | https://cloudtcm.com/acupoint/370 |
| BL66 | 足通谷 | danger | ???????????????????? | https://cloudtcm.com/acupoint/370 |
| BL67 | 至陰 | location_zh | ??????????? 0.1 ??? | https://cloudtcm.com/acupoint/371 |
| BL67 | 至陰 | clinical_pearls | ??????????????????????????????? | https://cloudtcm.com/acupoint/371 |
| BL67 | 至陰 | contraindications | ?????????????????????/????????? | https://cloudtcm.com/acupoint/371 |
| BL67 | 至陰 | danger | ????????????????????? | https://cloudtcm.com/acupoint/371 |

## BL61 僕參 - location_zh

Current damaged value:

> ???????????? BL60 ?????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/365
- location_zh: 足外側部，外踝後下方，崑崙直下2寸，跟部外側面赤白肉際處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 僕參。僕參者奴僕參拜也。僕參名意指膀胱經的水濕之氣在此有少部分吸熱上行。本穴所在為膀胱經，穴內物質為寒濕水氣，水為主，火為僕，穴外傳來的火熱之氣僅能使較少部分的水濕之氣氣化上行於天，火熱之氣相對於本穴的寒濕水氣來說就如奴僕一般，故名僕參。
安邪。安，安定也。邪，邪氣也。安邪名意指穴內的火熱之為弱小之勢。本穴物質為寒濕水氣，穴外傳入穴內的火熱之氣是為邪氣，但穴外傳入的火熱之氣不足以改變穴內氣血的寒濕之性，故名安邪。安耶、安邦名意與安邪同。

## BL61 僕參 - clinical_pearls

Current damaged value:

> ?????????????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/365
- location_zh: 足外側部，外踝後下方，崑崙直下2寸，跟部外側面赤白肉際處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 僕參。僕參者奴僕參拜也。僕參名意指膀胱經的水濕之氣在此有少部分吸熱上行。本穴所在為膀胱經，穴內物質為寒濕水氣，水為主，火為僕，穴外傳來的火熱之氣僅能使較少部分的水濕之氣氣化上行於天，火熱之氣相對於本穴的寒濕水氣來說就如奴僕一般，故名僕參。
安邪。安，安定也。邪，邪氣也。安邪名意指穴內的火熱之為弱小之勢。本穴物質為寒濕水氣，穴外傳入穴內的火熱之氣是為邪氣，但穴外傳入的火熱之氣不足以改變穴內氣血的寒濕之性，故名安邪。安耶、安邦名意與安邪同。

## BL61 僕參 - danger

Current damaged value:

> ??????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/365
- location_zh: 足外側部，外踝後下方，崑崙直下2寸，跟部外側面赤白肉際處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 僕參。僕參者奴僕參拜也。僕參名意指膀胱經的水濕之氣在此有少部分吸熱上行。本穴所在為膀胱經，穴內物質為寒濕水氣，水為主，火為僕，穴外傳來的火熱之氣僅能使較少部分的水濕之氣氣化上行於天，火熱之氣相對於本穴的寒濕水氣來說就如奴僕一般，故名僕參。
安邪。安，安定也。邪，邪氣也。安邪名意指穴內的火熱之為弱小之勢。本穴物質為寒濕水氣，穴外傳入穴內的火熱之氣是為邪氣，但穴外傳入的火熱之氣不足以改變穴內氣血的寒濕之性，故名安邪。安耶、安邦名意與安邪同。

## BL62 申脈 - clinical_pearls

Current damaged value:

> ????????????? SI3 ???????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/366
- location_zh: 足外側部，外踝直下方凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 膀胱經氣血在此變為涼濕之性。

## BL62 申脈 - danger

Current damaged value:

> ????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/366
- location_zh: 足外側部，外踝直下方凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 膀胱經氣血在此變為涼濕之性。

## BL63 金門 - clinical_pearls

Current damaged value:

> ????????????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/367
- location_zh: 足外側部，外踝前緣直下，骰骨下緣凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 膀胱經氣血在此變為溫熱之性。金門。金，肺性之氣也。門，出入的門戶也。金門名意指膀胱經氣血在此變為溫熱之性。本穴物質為膀胱經下部經脈上行的陽氣，性溫熱，與肺金之氣同性，故名金門。

## BL63 金門 - danger

Current damaged value:

> ???????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/367
- location_zh: 足外側部，外踝前緣直下，骰骨下緣凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 膀胱經氣血在此變為溫熱之性。金門。金，肺性之氣也。門，出入的門戶也。金門名意指膀胱經氣血在此變為溫熱之性。本穴物質為膀胱經下部經脈上行的陽氣，性溫熱，與肺金之氣同性，故名金門。

## BL64 京骨 - clinical_pearls

Current damaged value:

> ????????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/368
- location_zh: 足外側部，第5跖骨粗隆下方赤白肉際處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 膀胱經的濕冷水濕在此聚集。「京骨」。京，古指人工築起的高丘或圓形的大穀倉也。骨，水也。京骨名意指膀胱經的濕冷水氣在此聚集。本穴物質為膀胱經吸熱蒸升的水濕之氣，性寒涼，在本穴為聚集之狀，如同儲存穀物的大倉，故名京骨。本穴為膀胱經原穴。

## BL65 束骨 - clinical_pearls

Current damaged value:

> ???????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/369
- location_zh: 足外側部，足小趾本節（第5跖趾關節）後方赤白肉際凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 束，捆也、束縛也。骨，水也。束骨名意指膀胱經的寒濕水氣在此聚集不能上行。本穴物質為膀胱經上部經脈下行的寒濕水氣和下部經脈上行的陽氣，二氣交會後聚集穴內既不能升亦不能降，如被束縛一般，故名束骨。

## BL65 束骨 - danger

Current damaged value:

> ???????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/369
- location_zh: 足外側部，足小趾本節（第5跖趾關節）後方赤白肉際凹陷處
- technique_zh: 直刺0.3-0.5寸
- description_zh: 束，捆也、束縛也。骨，水也。束骨名意指膀胱經的寒濕水氣在此聚集不能上行。本穴物質為膀胱經上部經脈下行的寒濕水氣和下部經脈上行的陽氣，二氣交會後聚集穴內既不能升亦不能降，如被束縛一般，故名束骨。

## BL66 足通谷 - clinical_pearls

Current damaged value:

> ??????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/370
- location_zh: 足外側部，足小趾本節（第5跖趾關節）前方赤白肉際凹陷處。
- technique_zh: 直刺0.2-0.3寸
- description_zh: 通，通道、通行也。谷，肉之大會也，兩山中間的空曠之處也。該穴名意指膀光經經氣在此冷降歸地。本穴物質一為膀胱經上部經脈下行的寒濕水氣，二為至陰穴上傳於此的天部濕熱水氣，二氣交會後的運行變化主要是散熱縮合冷降，冷降之水循膀胱經回流至陰穴，故名。

## BL66 足通谷 - danger

Current damaged value:

> ????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/370
- location_zh: 足外側部，足小趾本節（第5跖趾關節）前方赤白肉際凹陷處。
- technique_zh: 直刺0.2-0.3寸
- description_zh: 通，通道、通行也。谷，肉之大會也，兩山中間的空曠之處也。該穴名意指膀光經經氣在此冷降歸地。本穴物質一為膀胱經上部經脈下行的寒濕水氣，二為至陰穴上傳於此的天部濕熱水氣，二氣交會後的運行變化主要是散熱縮合冷降，冷降之水循膀胱經回流至陰穴，故名。

## BL67 至陰 - location_zh

Current damaged value:

> ??????????? 0.1 ???

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/371
- location_zh: 足小趾末節外側，距趾甲角1分處
- technique_zh: 淺刺0.1寸
- description_zh: 至陰。至，極也。陰，寒也，水也。至陰名意指體內膀胱經的寒濕水氣由此外輸體表。本穴物質為來自體內膀胱經的寒濕水氣，它位於人體的最下部，是人體寒濕水氣到達的極寒之地，故名至陰。

## BL67 至陰 - clinical_pearls

Current damaged value:

> ???????????????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/371
- location_zh: 足小趾末節外側，距趾甲角1分處
- technique_zh: 淺刺0.1寸
- description_zh: 至陰。至，極也。陰，寒也，水也。至陰名意指體內膀胱經的寒濕水氣由此外輸體表。本穴物質為來自體內膀胱經的寒濕水氣，它位於人體的最下部，是人體寒濕水氣到達的極寒之地，故名至陰。

## BL67 至陰 - contraindications

Current damaged value:

> ?????????????????????/?????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/371
- location_zh: 足小趾末節外側，距趾甲角1分處
- technique_zh: 淺刺0.1寸
- description_zh: 至陰。至，極也。陰，寒也，水也。至陰名意指體內膀胱經的寒濕水氣由此外輸體表。本穴物質為來自體內膀胱經的寒濕水氣，它位於人體的最下部，是人體寒濕水氣到達的極寒之地，故名至陰。

## BL67 至陰 - danger

Current damaged value:

> ?????????????????????

CloudTCM staging reference:

- source: https://cloudtcm.com/acupoint/371
- location_zh: 足小趾末節外側，距趾甲角1分處
- technique_zh: 淺刺0.1寸
- description_zh: 至陰。至，極也。陰，寒也，水也。至陰名意指體內膀胱經的寒濕水氣由此外輸體表。本穴物質為來自體內膀胱經的寒濕水氣，它位於人體的最下部，是人體寒濕水氣到達的極寒之地，故名至陰。


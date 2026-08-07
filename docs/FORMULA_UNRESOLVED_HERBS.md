# 組成裡連不到中藥庫的藥名（2026-08-07）

`scripts/link-composition-herbs.js` **刻意不猜**這些。它只在剝掉括號、炮製前綴
（制／薑炒／煆…）或部位後綴（尾／梢／炭）之後，剩下的名稱**剛好等於一味庫內中藥**時
才建立連結。卡片上一味錯的藥比一個點不開的拼音更糟。

重跑：`node scripts/link-composition-herbs.js`

## A. 中文名，但不在 330 味精選庫（24 種）

要 Ting 決定：擴充 `herb_canon_shortlist.json`，還是接受它們維持不可點。
（`炮薑` 是乾薑的炮製品但兩者性效有別，不宜逕自連到乾薑，所以留在這裡。）

| 藥名 | 次數 | 出現在 |
|---|---:|---|
| 炮薑 | 3 | 生化湯、少腹逐瘀湯、實脾飲 |
| 雞子黃 | 1 | 黃連阿膠湯 |
| 胡黃連 | 1 | 清骨散 |
| 地葵子 | 1 | 五味消毒飲 |
| 溫黃酒 | 1 | 五味消毒飲 |
| 麻子仁 | 1 | 潤腸丸 |
| 炙罌粟殼 | 1 | 真人養臟湯 |
| (石榴皮) | 1 | 真人養臟湯 |
| 棕櫚皮 | 1 | 十灰散 |
| 棕櫚炭 | 1 | 固沖湯 |
| 灶心土 | 1 | 黃土湯 |
| 僵蠶 | 1 | 普濟消毒飲 |
| 荊芥穗炭 | 1 | 完帶湯 |
| 穿山甲 | 1 | 復元活血湯 |
| 酒洗大黃 | 1 | 復元活血湯 |
| 當歸身 | 1 | 當歸拈痛湯 |
| 酒洗知母 | 1 | 當歸拈痛湯 |
| 津蒼朮 | 1 | 三妙丸 |
| 懷牛膝 | 1 | 三妙丸 |
| 薑半夏 | 1 | 參蘇飲 |
| 白酒 | 1 | 瓜蔞薤白白酒湯 |
| (黃酒) | 1 | 瓜蔞薤白白酒湯 |
| 赤茯苓 | 1 | 蒿芩清膽湯 |
| 碧玉散 | 1 | 蒿芩清膽湯 |

## B. 只有拼音，沒有中文名（43 種）

要從來源補中文名。多數可從 American Dragon 的拉丁藥名判定
（例：`Chuan Jiao` = Per. Zanthoxyli = 花椒；`Geng Mi` = 粳米，庫內拼音作 Jing Mi）。

| 藥名 | 次數 | 出現在 |
|---|---:|---|
| Xi Jiao | 6 | 清營湯、犀角地黃湯、安宮牛黃丸 |
| Geng Mi | 5 | 白虎湯、竹葉石膏湯、瀉白散 |
| Jin Bo | 3 | 安宮牛黃丸、紫雪丹、至寶丹 |
| Ju Chao Zhi Ke | 2 | 人參敗毒散、敗毒散 |
| Pao Jiang | 2 | 陽和湯、實脾散 |
| (Shan Yang Jiao) | 2 | 羚角鉤藤湯、羚角鉤藤丸 |
| (Zhen Zhu Mu) | 2 | 羚角鉤藤湯、羚角鉤藤丸 |
| — | 2 | 失笑散、通竅活血湯 |
| Chuan Jiao | 2 | 烏梅丸、大建中湯 |
| (Zhu Ye) | 1 | 竹葉石膏湯 |
| (Bai Jiu) | 1 | 膠艾湯 |
| Nuo Dao Gen | 1 | 泰山磐石散 |
| Gui Ban Jiao | 1 | 左歸丸 |
| Bai Jiu | 1 | 炙甘草湯 |
| Su Zhi Long Gu | 1 | 金鎖固精丸 |
| Bai Ji Li | 1 | 金鎖固精丸 |
| Xiao Mai | 1 | 甘麥大棗湯 |
| Dan Nan Xing | 1 | 清氣化痰丸 |
| Lu Cha | 1 | 川芎茶調散 |
| Zhi Cao Wu | 1 | 小活絡丹 |
| Zhi Chuan Wu | 1 | 小活絡丹 |
| Li Pi | 1 | 桑杏湯 |
| Han Shui Shi | 1 | 紫雪丹 |
| (Qing Mu Xiang) | 1 | 紫雪丹 |
| Zhi Xiao Shi | 1 | 紫雪丹 |
| (Xi Jiao) | 1 | 至寶丹 |
| Yin Bo | 1 | 至寶丹 |
| Ji Zi Huang | 1 | 大定風珠 |
| Jing Jie Sui | 1 | 槐花散 |
| Jiang Can | 1 | 牽正散 |
| An Xi Xiang | 1 | 蘇合香丸 |
| Su Jiu Gui Ban | 1 | 大补阴丸 |
| Zhu Ji Shui | 1 | 大补阴丸 |
| Chao Bai Ji Li | 1 | 當歸飲子 |
| Jiang Shi | 1 | 良附丸 |
| Sheng Jiang Pi | 1 | 五皮散 |
| Fu Ling Pi | 1 | 五皮散 |
| Zhi Chuan Shan Jia | 1 | 仙方活命飲 |
| Mi Zhi Ying Su Ke | 1 | 九仙散 |
| (Hua Ju Hong) | 1 | 厚朴溫中湯 |
| Shui Fei Zhu Sha | 1 | 朱砂安神丸 |
| Zhen Zhu Mu | 1 | 珍珠母丸 |
| Long Chi | 1 | 珍珠母丸 |

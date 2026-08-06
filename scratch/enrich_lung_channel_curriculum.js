/**
 * scratch/enrich_lung_channel_curriculum.js
 * Enriches the Lung Channel (LU) in data/channels/channels_and_charts.json
 * with full curriculum notes for all 11 points without deleting any existing fields.
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const luChannel = channels.find(c => c.code === 'LU');

if (!luChannel) {
  console.error('LU channel not found!');
  process.exit(1);
}

// Add rich curriculum notes for all 11 LU points extracted from 1 LUNG CHANNEL OF HAND TAI YIN.md
luChannel.points_curriculum = [
  {
    code: "LU1",
    nameZh: "中府 (Zhongfu)",
    nameEn: "Central Treasury",
    category: "肺之募穴 (Front-Mu) · 肺脾交會穴 · 肺經起點 (Entry)",
    location: "鎖骨下窩外側1寸，第一肋間隙，距前正中線6寸。",
    needling: "斜刺 0.5 - 0.8 寸向外側（⚠️ 禁止向內深刺，防止氣胸危險 Pneumothorax danger）。可灸。",
    actions: "宣肺理氣、止咳平喘、清熱化痰、通調水道、降胃氣。",
    indications: "咳嗽、氣喘、胸痛、胸滿、肺熱痰濁、嘔吐、腹脹。",
    notes: "肺經一切實證之首選募穴；脾濕化熱上犯於肺之嘔逆；營氣循環周天之起點。"
  },
  {
    code: "LU2",
    nameZh: "雲門 (Yunmen)",
    nameEn: "Cloud Gate",
    category: "局部要穴 (Local Point)",
    location: "鎖骨下窩凹陷中，喙突上方，距前正中線6寸。",
    needling: "斜刺 0.5 - 0.8 寸向外側（⚠️ 禁止向內深刺，防止氣胸危險）。可灸。",
    actions: "清瀉肺熱、宣肺理氣、除煩滿、利肩臂。",
    indications: "咳嗽、氣喘、胸痛、胸中煩熱、肩背痛、肩關節炎症。",
    notes: "功能與中府相似，臨床常作為肩關節局部治療要穴。"
  },
  {
    code: "LU3",
    nameZh: "天府 (Tianfu)",
    nameEn: "Celestial Storehouse",
    category: "天牖五部/天窗穴 (Window of the Sky Point)",
    location: "腋前紋頭下3寸，肱二頭肌橈側緣。",
    needling: "直刺 0.5 - 1.0 寸。（古云不宜灸）。",
    actions: "清肺熱、降肺氣、涼血止血、安魄 (Calms Po / Corporeal Soul)。",
    indications: "氣喘、哮喘、咳嗽、鼻衄（鼻出血）、咳血、上臂內側痛、癭氣、頸部腫塊、情志哀傷悲哭、失眠不安。",
    notes: "天窗穴調頭身氣血上逆；涼血止血特效；治肝火犯肺之情志型哮喘與長久哀慟。"
  },
  {
    code: "LU4",
    nameZh: "俠白 (Xiabai)",
    nameEn: "Guarding White",
    category: "局部要穴 (Local Point)",
    location: "腋前紋頭下4寸（肘橫紋上5寸），肱二頭肌橈側緣。",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "降肺氣、理氣血、清肺熱、通經活絡。",
    indications: "咳嗽、氣喘、胸滿、心痛、上臂內側前緣疼痛拘急。",
    notes: "循經遠道與局部配穴，輔助宣通胸肺氣血。"
  },
  {
    code: "LU5",
    nameZh: "尺澤 (Chize)",
    nameEn: "Cubit Marsh",
    category: "五輸穴之合穴 (He-Sea Point - 水穴 Water Point)",
    location: "肘橫紋上，肱二頭肌肌腱橈側凹陷中（微屈肘定位）。",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "宣肺理氣、清瀉肺熱、降逆止嘔、通調水道、舒筋止痛。",
    indications: "咳嗽、氣喘、咯血、潮熱、咽喉腫痛、胸滿、小兒驚風、網球肘、肘臂拘急痛。",
    notes: "合穴治逆氣而泄；瀉肺經實熱與痰熱；兼治急性與慢性病；經典記載治五種腰痛（上肢對應委中BL40）。"
  },
  {
    code: "LU6",
    nameZh: "孔最 (Kongzui)",
    nameEn: "Collection Hole",
    category: "郄穴 (Xi-Cleft Point of Lung Channel)",
    location: "太淵與尺澤連線上，腕橫紋上7寸。",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "宣肺理氣、清熱止血、潤肺平喘、理急止痛。",
    indications: "急性咳嗽、氣喘、咯血（咳血）、急性咽喉腫痛、夜間乾咳、肘臂痙攣疼痛。",
    notes: "郄穴專治急性發作與急性出血（風熱或風燥引致之咳血、哮喘急救）。"
  },
  {
    code: "LU7",
    nameZh: "列缺 (Lieque)",
    nameEn: "Broken Sequence",
    category: "絡穴 · 八脈交會穴通任脈 (Master of Ren) · 頭項六總穴 · 經穴 (Jing-River)",
    location: "橈骨莖突上方，腕橫紋上1.5寸（兩手交叉，食指盡處凹陷中）。",
    needling: "向上斜刺 0.3 - 0.5 寸。可灸。",
    actions: "宣肺解表、祛風通絡、通調任脈、利咽寬胸、通調水道。",
    indications: "頭痛、偏頭痛、項強痛、落枕、面癱、牙痛、咳嗽、氣喘、咽喉腫痛、手腕無力痛、陰虛咽乾。",
    notes: "頭項六總穴（頭項尋列缺）；外感風寒第一要穴；通任脈治婦科與陰虛咽乾；絡穴治手拇指與手腕痛。"
  },
  {
    code: "LU8",
    nameZh: "經渠 (Jingqu)",
    nameEn: "Channel Ditch",
    category: "五輸穴之經穴 (Jing-River Point - 金穴 Metal / 本穴)",
    location: "腕橫紋上1寸，橈動脈橈側凹陷中。",
    needling: "直刺 0.1 - 0.3 寸（⚠️ 避開橈動脈 Avoid Radial Artery）。",
    actions: "宣肺利咽、降氣平喘、理氣止痛。",
    indications: "咳嗽、氣喘、胸痛、發熱、咽喉腫痛、手腕痛。",
    notes: "肺經本穴（金中金），善清肺系風熱與宣通經氣。"
  },
  {
    code: "LU9",
    nameZh: "太淵 (Taiyuan)",
    nameEn: "Great Abyss",
    category: "原穴 · 輸穴 (Shu-Stream - 土/母穴) · 八會穴之脈會 (Vessels Hui)",
    location: "腕掌側橫紋橈側，橈動脈搏動處橈側凹陷中。",
    needling: "直刺 0.2 - 0.3 寸（⚠️ 避開橈動脈）。可灸。",
    actions: "補肺益氣、培土生金、止咳化痰、通利百脈、清宣肺熱。",
    indications: "久咳虛喘、氣短乏力、自汗、咽乾、咳嗽咯血、心悸、無脈症、脈律不齊、手腕痛。",
    notes: "補肺氣肺陰第一要穴（母穴土生金）；脈會太淵治全身血管與脈律病變；主客原絡 LU9+LI6 配穴。"
  },
  {
    code: "LU10",
    nameZh: "魚際 (Yuji)",
    nameEn: "Fish Border",
    category: "五輸穴之滎穴 (Ying-Spring Point - 火穴 Fire Point)",
    location: "第一掌骨中點橈側，赤白肉際處。",
    needling: "直刺 0.5 - 0.8 寸。可灸。",
    actions: "清瀉肺熱、利咽清音、解表散邪、和胃降逆。",
    indications: "咳嗽、氣喘、發熱、急性咽喉腫痛、失音、掌心發熱、乳癰、小兒疳積。",
    notes: "滎穴主身熱：清瀉肺經實熱與發炎；利咽喉失音特效穴。"
  },
  {
    code: "LU11",
    nameZh: "少商 (Shaoshang)",
    nameEn: "Lesser Shang",
    category: "五輸穴之井穴 (Jing-Well - 木穴) · 刺血救急要穴",
    location: "拇指橈側指甲角旁0.1寸。",
    needling: "淺刺 0.1 寸，或點刺出血。",
    actions: "醒腦開竅、清熱利咽、蘇厥救逆、鎮驚安神。",
    indications: "急性扁桃體炎、喉痺劇痛、咳嗽、發熱、中風昏迷、高熱抽搐、癲狂、拇指麻木痛。",
    notes: "井穴急救開竅；點刺出血治急性咽喉腫痛與乳蛾第一要穴。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully enriched Lung Channel (LU) with 11-point curriculum breakdown in channels_and_charts.json!');

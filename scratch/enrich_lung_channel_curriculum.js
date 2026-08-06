/**
 * scratch/enrich_lung_channel_curriculum.js
 * Comprehensive enrichment of Lung Channel (LU) in data/channels/channels_and_charts.json
 * with 100% complete Chenoweth course note details for all 11 points.
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

luChannel.points_curriculum = [
  {
    code: "LU1",
    nameZh: "中府 (Zhongfu)",
    nameEn: "Central Treasury",
    category: "肺之募穴 (Front-Mu) · 脾肺經交會穴 · 肺經起點 (Entry Point)",
    location: "胸前壁外上方，鎖骨下窩外側1寸，第一肋間隙，距前正中線6寸 (Latero-superior to sternum, 1 cun below LU-2, 1st intercostal space).",
    needling: "斜刺 0.5 - 0.8 寸向胸壁外側 (Obliquely toward lateral aspect)。⚠️ 嚴禁向內側直刺或深刺，防止氣胸危險 (Pneumothorax danger)。可灸。",
    actions: "宣肺降氣 (Disseminates & Descends LU Qi)、化痰止咳 (Transforms Phlegm)、清瀉肺熱 (Clears Heat)、通調水道 (Regulates Water Passages)、降胃逆氣 (Descends Stomach Qi)。",
    indications: "咳嗽、氣喘、哮喘、胸痛、肩背痛、胸中煩滿、短氣促氣、嘔吐、飲食不下。",
    notes: "【課件考綱精華】① 肺經起點與營氣周天流注起點（與脾經交會，Ying Qi cycle begins here）。② 肺之募穴，專治一切肺經實證（咳嗽、喘息、痰熱積聚）。③ 中焦脾濕化熱上犯於肺之嘔吐與咽下困難。"
  },
  {
    code: "LU2",
    nameZh: "雲門 (Yunmen)",
    nameEn: "Cloud Gate",
    category: "局部要穴 (Local Point)",
    location: "胸前壁外上方，鎖骨下凹陷中，喙突上方，距前正中線6寸 (Infra-clavicular fossa, superior to coracoid process).",
    needling: "斜刺 0.5 - 0.8 寸向胸壁外側。⚠️ 嚴禁向內側深刺，防止氣胸危險。可灸。",
    actions: "清瀉肺熱 (Clears LU Heat)、宣肺理氣 (Disseminates LU Qi)、除煩排鬱 (Dispels Anxiety & Agitation)、瀉關節熱 (Drains Heat in Joints)。",
    indications: "咳嗽、氣喘、胸痛、胸中煩熱、胸部張緊感、肩背疼痛發炎。",
    notes: "【課件考綱精華】主治與 LU1 中府相似，但臨床更常作為肩關節局部疼痛與發炎之治療要穴。"
  },
  {
    code: "LU3",
    nameZh: "天府 (Tianfu)",
    nameEn: "Celestial Storehouse",
    category: "天牖五部/天窗穴 (Window of the Sky Point)",
    location: "上臂前外側，腋前紋頭下3寸，肱二頭肌橈側緣 (3 cun below axillary fold, radial side of biceps brachii).",
    needling: "直刺 0.5 - 1.0 寸 (Perpendicular 0.5-1.0 inch)。古籍有云不宜灸 (Some say no moxa)。",
    actions: "清肺熱降肺氣 (Clears LU Heat & Descends Qi)、涼血止血 (Cools Blood & Stops Bleeding)、安魄鎮魂 (Calms the Corporeal Soul / Po)。",
    indications: "哮喘、氣喘、咳嗽、咯血、鼻衄（鼻出血）、口渴、上臂內側痛、癭氣（甲狀腺腫大）、頸部腫塊、悲傷欲哭、精神恍惚、失眠不安。",
    notes: "【課件考綱精華】① 天窗穴：調節頭身氣血上逆，治療癭氣與頸部腫脹。② 涼血止血：治虛實肺熱引致之衄血與咳血。③ 肺魄精神症：情志型哮喘、記憶力減退、思緒混亂、長期哀悼亡親、悲傷哭泣（古籍稱「飛屍鬼語」、「屍厥鬼語」）。④ 肝火犯肺（LV invading LU）之病理。"
  },
  {
    code: "LU4",
    nameZh: "俠白 (Xiabai)",
    nameEn: "Guarding White",
    category: "局部要穴 (Local Point)",
    location: "上臂前外側，腋前紋頭下4寸（或肘橫紋上5寸），肱二頭肌橈側緣 (4 cun below axillary fold / 5 cun above cubital crease).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "降肺氣 (Descends LU Qi)、理胸中氣血 (Regulates Qi & Blood in Chest)、清肺熱 (Clears LU Heat)、舒筋通絡止痛 (Relaxes Sinews & Alleviates Pain)。",
    indications: "咳嗽、氣喘、短氣、胸滿痛、心痛、上臂內側前緣疼痛拘急。",
    notes: "【課件考綱精華】循經與局部配穴，可用於咳嗽伴胸痛、心痛與上臂內側橈側疼痛。"
  },
  {
    code: "LU5",
    nameZh: "尺澤 (Chize)",
    nameEn: "Cubit Marsh",
    category: "五輸穴之合穴 (He-Sea Point - 水穴 Water Point)",
    location: "肘橫紋上，肱二頭肌肌腱橈側凹陷中，微屈肘取穴 (In depression on radial side of biceps brachii tendon, elbow slightly flexed).",
    needling: "直刺 0.5 - 1.0 寸。或點刺出血。古籍有云不宜灸。",
    actions: "清瀉肺熱降逆氣 (Clears LU Heat & Descends Rebellious Qi)、舒筋利節止痛 (Relaxes Sinews & Alleviates Pain)、通調水道 (Regulates Water Passages)。",
    indications: "咳嗽、咯血、氣喘、咽喉腫痛、上肢水腫、潮熱、遺尿、胸滿、小兒驚風、乳癰、網球肘、肱二頭肌腱炎、肘臂痙攣疼痛、腰痛。",
    notes: "【課件考綱精華】① 合穴治逆氣而泄：清瀉肺經實熱與痰熱，兼治急性/慢性與表證/裏證。② 肘部局部痛：網球肘、肌腱炎。③ 經典古籍特別記載可治「五種腰痛」（堪稱上肢之委中 BL40 等效穴）。"
  },
  {
    code: "LU6",
    nameZh: "孔最 (Kongzui)",
    nameEn: "Collection Hole",
    category: "郄穴 (Xi-Cleft Point of Lung Channel)",
    location: "前臂掌側橈側，太淵與尺澤連線上，腕橫紋上7寸 (Palmar aspect of forearm, 7 cun above wrist crease).",
    needling: "直刺 0.5 - 1.0 寸。可灸。",
    actions: "宣肺降氣 (Disseminates & Descends LU Qi)、清熱潤肺 (Clears Heat & Moistens LU)、涼血止血 (Clears Heat & Stops Bleeding)、緩急止痛 (Moderates Acute Conditions)。",
    indications: "咳嗽、氣喘、胸痛、咯血（咳血）、急性咽喉腫痛、夜間乾咳、肘臂痙攣疼痛、沿經關節痛。",
    notes: "【課件考綱精華】① 郄穴：專治外感風熱/風燥引致之急性發作與急性出血（急性哮喘、劇烈咳嗽、咯血）。② 夜間乾咳（Dry hacking cough at night）。"
  },
  {
    code: "LU7",
    nameZh: "列缺 (Lieque)",
    nameEn: "Broken Sequence",
    category: "絡穴 (to LI4) · 八脈交會穴通任脈 (Master of Ren, coupled w/ KI6) · 頭項六總穴 · 經穴 (Jing-River - 金)",
    location: "前臂橈側，橈骨莖突上方，腕橫紋上1.5寸，肱橈肌與拇長展肌腱之間 (Superior to styloid process of radius, 1.5 cun above wrist crease).",
    needling: "向上斜刺 0.3 - 0.5 寸 (Oblique 0.3-0.5 inches upward)。可灸。",
    actions: "疏風解表 (Releases Exterior)、宣肺平喘 (Promotes LU Descending)、平息內風與痰 (Pacifies Wind & Phlegm)、通調任脈 (Opens Ren Vessel)、通調水道與淋巴 (Regulates Water Passages & Lymph)、通絡止痛 (Activates Channel & Alleviates Pain)。",
    indications: "頭痛、偏頭痛、項強痛、落枕、面癱、牙痛、咳嗽、氣喘、咽喉腫痛、手腕疼痛無力、外感風寒（惡寒發熱、流涕、打噴嚏）、內風（面肌痙攣、口噤）、婦科與泌尿生殖病症、陰虛咽乾、大魚際/手拇指痛。",
    notes: "【課件考綱精華】① 頭項六總穴（頭項尋列缺）：頭面項背風邪之主穴。② 外感風寒第一要穴：發汗解表驅風。③ 平息內風：面癱、抽搐、口噤。④ 任脈主穴：治婦科、泌尿生殖與陰虛咽乾。⑤ 絡穴：絡脈散於大魚際，專治拇指與手腕痛。"
  },
  {
    code: "LU8",
    nameZh: "經渠 (Jingqu)",
    nameEn: "Channel Ditch",
    category: "五輸穴之經穴 (Jing-River Point - 金穴 Metal / 本穴)",
    location: "前臂掌側，腕橫紋上1寸，橈動脈橈側凹陷中 (1 cun above wrist crease, in depression radial to radial artery).",
    needling: "直刺 0.1 - 0.3 寸。⚠️ 避開橈動脈 (Avoid Radial Artery)。",
    actions: "宣肺降氣 (Descends LU Qi)、止咳平喘 (Alleviates Cough & Wheezing)、祛風補氣陰 (Expels Wind, Tonifies Qi & Yin)。",
    indications: "咳嗽、氣喘、發熱、胸痛、咽喉腫痛、手腕痛、足底筋膜炎痛（湧泉 KI1 區域疼痛）。",
    notes: "【課件考綱精華】① 肺經本穴（金中金）：清瀉風熱與補益肺氣陰。② 特殊遠道主治：足底筋膜炎與湧泉穴區域疼痛 (Pain in KD-1 area / plantar fasciitis)。"
  },
  {
    code: "LU9",
    nameZh: "太淵 (Taiyuan)",
    nameEn: "Great Abyss",
    category: "原穴 · 輸穴 (Shu-Stream - 土/母穴) · 八會穴之脈會 (Hui Meeting of Vessels)",
    location: "腕掌側橫紋橈側，橈動脈搏動處橈側凹陷中 (Radial end of wrist crease, lateral to radial artery).",
    needling: "直刺 0.2 - 0.3 寸。⚠️ 避開橈動脈。可灸。",
    actions: "補肺益氣養陰 (Tonifies LU Qi & Yin)、培土生金 (Earth/Mother Point)、化痰止咳 (Transforms Phlegm)、通利百脈 (Harmonizes 100 Vessels)、通絡止痛 (Activates Channel)。",
    indications: "久咳虛喘、氣短乏力、咯血、咽喉腫痛、心悸、無脈症、脈律不齊、慢性水樣鼻涕、手腕及手臂疼痛。",
    notes: "【課件考綱精華】① 培土生金第一要穴（母穴）：補肺氣與肺陰之首選。② 八會穴之脈會：調理一百脈、血液循環障礙、診脈時脈象微弱模糊不清之澄清要穴 (Clarifying indiscernible pulse)。③ 主客原絡 LU9 (原/主) + LI6 (絡/客) 配穴。"
  },
  {
    code: "LU10",
    nameZh: "魚際 (Yuji)",
    nameEn: "Fish Border",
    category: "五輸穴之滎穴 (Ying-Spring Point - 火穴 Fire Point)",
    location: "手掌橈側，第一掌骨中點橈側，赤白肉際處 (Midpoint of 1st metacarpal bone, junction of red & white skin).",
    needling: "直刺 0.5 - 0.8 寸。古籍有云不宜灸。",
    actions: "清瀉肺熱 (Clears LU Heat)、利咽清音 (Benefits Throat & Voice)、降逆和胃心 (Harmonizes Stomach & Heart)。",
    indications: "咳嗽、咯血、氣喘、發熱、急性咽喉腫痛、失音（聲音嘶啞）、掌心發熱、乳癰、小兒疳積、熱邪妄行出血。",
    notes: "【課件考綱精華】① 滎穴主身熱：清瀉肺經實熱與虛熱（清除肺臟與經絡熱邪）。② 利咽清音：急性咽喉腫痛與失音（Loss of voice）特效穴。③ 涼血止血：血熱妄行之出血症。"
  },
  {
    code: "LU11",
    nameZh: "少商 (Shaoshang)",
    nameEn: "Lesser Shang",
    category: "五輸穴之井穴 (Jing-Well - 木穴) · 刺血救急要穴",
    location: "手大拇指橈側，指甲角旁0.1寸 (Radial side of thumb, 0.1 cun posterior to nail corner).",
    needling: "淺刺 0.1 寸，或點刺出血 (Prick to bleed)。",
    actions: "醒腦開竅 (Revives Consciousness)、清熱利咽 (Clears Heat & Benefits Throat)、蘇厥救逆 (Revival Point)。",
    indications: "急性扁桃體炎、喉痺劇痛、咳嗽、氣喘、鼻衄、發熱、中風昏迷、高熱抽搐、癲狂、拇指抽搐疼痛。",
    notes: "【課件考綱精華】① 井穴急救開竅：中風急救與高熱昏迷甦醒穴。② 點刺出血（Prick to bleed）：治急性劇烈咽喉腫痛與扁桃體炎（Tonsillitis）第一要穴。"
  }
];

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated LU channel with 100% complete curriculum notes for all 11 points!');

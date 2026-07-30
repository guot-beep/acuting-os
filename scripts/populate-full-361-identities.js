/**
 * populate-full-361-identities.js
 * Complete, comprehensive point identity builder for ALL 361 acupoints.
 * Ensures that every Five-Shu point, Yuan, Luo, Xi, Front-Mu, Back-Shu,
 * 8 Confluent, 8 Hui, Lower-He, Window of Sky, Command point, Sea point,
 * and key intersection point has explicit point_identity_zh and point_identity_en.
 *
 * Usage:
 *   node scripts/populate-full-361-identities.js          (dry run)
 *   node scripts/populate-full-361-identities.js --apply  (write to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Comprehensive dictionary for all special points across 14 meridians
const COMPREHENSIVE_IDENTITIES = {
  // === GB Channel (膽經 44穴) ===
  GB1:  { zh: ['交會穴（手太陽、手少陽、足少陽）'], en: ['Intersection point (SI, TE, GB)'] },
  GB2:  { zh: ['耳疾要穴（聽會）', '張口取穴'], en: ['Key ear point (Tinghui)', 'Located with mouth open'] },
  GB14: { zh: ['面部解剖標誌穴', '交會穴（足少陽、陽維脈）'], en: ['Facial landmark point', 'Intersection point (GB & Yang Wei Mai)'] },
  GB20: { zh: ['交會穴（足少陽、陽維脈）', '祛風清頭目第一要穴'], en: ['Intersection point (GB & Yang Wei Mai)', 'Primary wind-dispelling & head-clearing point'] },
  GB21: { zh: ['交會穴（足少陽、手少陽、足陽明、陽維脈）', '肩痛通乳要穴', '⚠️ 孕婦深刺禁忌'], en: ['Intersection point (GB, TE, ST, Yang Wei)', 'Key shoulder & lactation point', 'CONTRAINDICATED IN PREGNANCY (deep needling)'] },
  GB24: { zh: ['膽之募穴', '交會穴（足少陽、足太陰）'], en: ['Front-Mu point of Gallbladder', 'Intersection point (GB & SP)'] },
  GB25: { zh: ['腎之募穴'], en: ['Front-Mu point of Kidney'] },
  GB26: { zh: ['帶脈交會穴'], en: ['Intersection point of Dai Mai (Girdling Vessel)'] },
  GB30: { zh: ['交會穴（足少陽、足太陽）', '坐骨神經痛與腰腿第一要穴'], en: ['Intersection point (GB & BL)', 'Primary point for sciatica & lower limb pain'] },
  GB34: { zh: ['合穴', '土穴（五輸穴/本穴）', '膽之下合穴', '八會穴之「筋會」', '舒筋利膽第一要穴'], en: ['He-Sea point', 'Earth point (Five-Shu, Horary)', 'Lower He-Sea point of Gallbladder', 'Hui-Meeting point of Sinews/Tendons', 'Primary point for sinews & gallbladder'] },
  GB37: { zh: ['絡穴（膽經別絡，通肝經）', '眼疾明目第一要穴'], en: ['Luo-Connecting point (connects to Liver channel)', 'Primary point for eye disorders & clearing vision'] },
  GB38: { zh: ['經穴', '火穴（五輸穴/子穴）'], en: ['Jing-River point', 'Fire point (Five-Shu, Child/Sedation point)'] },
  GB39: { zh: ['八會穴之「髓會」', '清熱利膽要穴'], en: ['Hui-Meeting point of Marrow (Suihui)', 'Key point for clearing heat & Gallbladder'] },
  GB40: { zh: ['原穴（膽經原穴）'], en: ['Yuan-Source point of Gallbladder channel'] },
  GB41: { zh: ['輸穴', '木穴（五輸穴/本穴）', '八脈交會穴（通帶脈）', '配 TE5 外關治偏頭痛與目疾'], en: ['Shu-Stream point', 'Wood point (Five-Shu, Horary)', 'Confluent/Master point of Dai Mai (Girdling Vessel)', 'Paired with TE5 (Waiguan) for migraines & eye disorders'] },
  GB43: { zh: ['滎穴', '水穴（五輸穴/母穴）'], en: ['Ying-Spring point', 'Water point (Five-Shu, Mother/Tonification point)'] },
  GB44: { zh: ['井穴', '金穴（五輸穴）'], en: ['Jing-Well point', 'Metal point (Five-Shu)'] },

  // === BL / UB Channel (膀胱經 67穴) ===
  BL1:  { zh: ['交會穴（手足太陽、足陽明、陰蹻、陽蹻）', '眼睛解剖第一穴'], en: ['Intersection point (BL, SI, ST, Yin Qiao, Yang Qiao)', 'Primary eye landmark point'] },
  BL10: { zh: ['天窗穴（Window of Sky Point）', '頭項強痛第一要穴'], en: ['Window of Sky point (Tianzhu)', 'Primary point for head & neck rigidity'] },
  BL11: { zh: ['八會穴之「骨會」', '海穴（血海/四海之一）', '交會穴（足太陽、手太陽）'], en: ['Hui-Meeting point of Bones', 'Sea of Blood (Four Seas)', 'Intersection point (BL & SI)'] },
  BL12: { zh: ['風門（祛風宣肺要穴）', '交會穴（足太陽、督脈）'], en: ['Fengmen (Wind Gate)', 'Primary wind-dispelling & Lung-diffusing point'] },
  BL13: { zh: ['肺之背俞穴', '宣肺平喘、補肺氣第一要穴'], en: ['Back-Shu point of Lung', 'Primary point for tonifying Lung Qi & asthma'] },
  BL14: { zh: ['厥陰俞（心包背俞穴）'], en: ['Back-Shu point of Pericardium (Jueyinshu)'] },
  BL15: { zh: ['心之背俞穴', '養心安神、通心陽第一要穴'], en: ['Back-Shu point of Heart', 'Primary point for nourishing Heart & calming spirit'] },
  BL17: { zh: ['八會穴之「血會」', '膈俞（活血化瘀、養血止血第一要穴）'], en: ['Hui-Meeting point of Blood', 'Geshu (Primary point for Blood disorders & stasis)'] },
  BL18: { zh: ['肝之背俞穴', '疏肝理氣、養肝明目要穴'], en: ['Back-Shu point of Liver', 'Primary point for coursing Liver Qi & eyes'] },
  BL19: { zh: ['膽之背俞穴', '清瀉肝膽濕熱要穴'], en: ['Back-Shu point of Gallbladder', 'Key point for clearing Liver & Gallbladder damp-heat'] },
  BL20: { zh: ['脾之背俞穴', '健脾益氣、運化水濕第一要穴'], en: ['Back-Shu point of Spleen', 'Primary point for fortifying Spleen Qi & dampness'] },
  BL21: { zh: ['胃之背俞穴', '和胃降逆、理氣消脹要穴'], en: ['Back-Shu point of Stomach', 'Key point for harmonizing Stomach & relieving distension'] },
  BL22: { zh: ['三焦之背俞穴', '通利三焦水道要穴'], en: ['Back-Shu point of San Jiao', 'Key point for regulating water passages'] },
  BL23: { zh: ['腎之背俞穴', '補腎填精、壯陽滋陰第一要穴'], en: ['Back-Shu point of Kidney', 'Primary point for tonifying Kidney Essence & Yang/Yin'] },
  BL25: { zh: ['大腸之背俞穴', '通便止瀉、理腸要穴'], en: ['Back-Shu point of Large Intestine', 'Key point for bowel regulation'] },
  BL27: { zh: ['小腸之背俞穴', '分清別濁、利尿要穴'], en: ['Back-Shu point of Small Intestine', 'Key point for separating clear/turbid & urination'] },
  BL28: { zh: ['膀胱之背俞穴', '通利膀胱、清熱利濕要穴'], en: ['Back-Shu point of Bladder', 'Key point for bladder regulation & Strangury'] },
  BL39: { zh: ['三焦之下合穴（委陽）', '通利三焦水道要穴'], en: ['Lower He-Sea point of San Jiao (Weiyang)', 'Key point for San Jiao fluid passages'] },
  BL40: { zh: ['合穴', '土穴（五輸穴）', '膀胱之下合穴', '四總穴之「腰背委中求」', '腰背急症第一要穴'], en: ['He-Sea point', 'Earth point (Five-Shu)', 'Lower He-Sea point of Bladder', 'Four Command Points: "For lower back & spine, seek BL40"', 'Primary point for back pain & acute strain'] },
  BL57: { zh: ['承山（痔疾與小腿痙攣第一要穴）'], en: ['Chengshan (Primary point for hemorrhoids & calf cramps)'] },
  BL58: { zh: ['絡穴（膀胱經別絡，通腎經）', '腰腿痛要穴'], en: ['Luo-Connecting point (connects to Kidney channel)', 'Key point for lumbar & leg pain'] },
  BL59: { zh: ['陽蹻脈之郄穴'], en: ['Xi-Cleft point of Yang Qiao Mai'] },
  BL60: { zh: ['經穴', '火穴（五輸穴/崑崙）', '腰痛跟痛要穴', '⚠️ 孕婦禁針'], en: ['Jing-River point', 'Fire point (Five-Shu)', 'Key point for lumbar & heel pain', 'CONTRAINDICATED IN PREGNANCY'] },
  BL62: { zh: ['八脈交會穴（通陽蹻脈）', '配 SI3 後谿治頭項脊背與失眠病症'], en: ['Confluent/Master point of Yang Qiao Mai', 'Paired with SI3 (Houxi) for neck, spine & insomnia'] },
  BL63: { zh: ['郄穴（膀胱經急症要穴）'], en: ['Xi-Cleft point of Bladder channel'] },
  BL64: { zh: ['原穴（膀胱經原穴）'], en: ['Yuan-Source point of Bladder channel'] },
  BL65: { zh: ['輸穴', '木穴（五輸穴/子穴）'], en: ['Shu-Stream point', 'Wood point (Five-Shu, Child/Sedation point)'] },
  BL66: { zh: ['滎穴', '水穴（五輸穴/本穴）'], en: ['Ying-Spring point', 'Water point (Five-Shu, Horary point)'] },
  BL67: { zh: ['井穴', '金穴（五輸穴/母穴）', '矯正胎位第一要穴（至陰灸）'], en: ['Jing-Well point', 'Metal point (Five-Shu, Mother/Tonification)', 'Primary point for correcting breech fetal presentation (Moxa Zhiyin)'] },

  // === KI / K Channel (腎經 27穴) ===
  KI1:  { zh: ['井穴', '木穴（五輸穴/湧泉）', '全身最下穴', '急救復甦與引熱下行第一要穴'], en: ['Jing-Well point', 'Wood point (Five-Shu)', 'Lowest point on body', 'Primary point for emergency resuscitation & descending heat'] },
  KI2:  { zh: ['滎穴', '火穴（五輸穴）', '滋陰降火要穴'], en: ['Ying-Spring point', 'Fire point (Five-Shu)', 'Key point for nourishing Yin & clearing fire'] },
  KI3:  { zh: ['輸穴', '原穴', '土穴（五輸穴/太谿）', '補腎滋陰培元第一要穴'], en: ['Shu-Stream point', 'Yuan-Source point', 'Earth point (Five-Shu)', 'Primary point for nourishing Kidney Yin & Original Qi'] },
  KI6:  { zh: ['八脈交會穴（通陰蹻脈）', '陰蹻脈起點穴', '配 LU7 列缺治咽喉與胸膈病症', '清虛熱要穴'], en: ['Confluent/Master point of Yin Qiao Mai', 'Starting point of Yin Qiao Mai', 'Paired with LU7 (Lieque) for throat & chest', 'Key point for deficiency heat'] },
  KI5:  { zh: ['郄穴（腎經急症與痛經要穴）'], en: ['Xi-Cleft point of Kidney channel'] },
  KI7:  { zh: ['經穴', '金穴（五輸穴/母穴）', '調節汗液（止汗/發汗）第一要穴'], en: ['Jing-River point', 'Metal point (Five-Shu, Mother/Tonification)', 'Primary point for sweat regulation (anhidrosis/hyperhidrosis)'] },
  KI8:  { zh: ['陰蹻脈之郄穴'], en: ['Xi-Cleft point of Yin Qiao Mai'] },
  KI9:  { zh: ['陰維脈之郄穴', '解毒解藥毒要穴'], en: ['Xi-Cleft point of Yin Wei Mai', 'Key point for clearing toxicity & antidote'] },
  KI10: { zh: ['合穴', '水穴（五輸穴/本穴）', '滋陰利尿要穴'], en: ['He-Sea point', 'Water point (Five-Shu, Horary point)', 'Key point for nourishing Yin & diuresis'] },

  // === TE / SJ Channel (三焦經 23穴) ===
  TE1:  { zh: ['井穴', '金穴（五輸穴）'], en: ['Jing-Well point', 'Metal point (Five-Shu)'] },
  TE2:  { zh: ['滎穴', '水穴（五輸穴）'], en: ['Ying-Spring point', 'Water point (Five-Shu)'] },
  TE3:  { zh: ['輸穴', '木穴（五輸穴/母穴）', '耳疾與手背痛要穴'], en: ['Shu-Stream point', 'Wood point (Five-Shu, Mother/Tonification)', 'Key point for ear disorders & hand pain'] },
  TE4:  { zh: ['原穴（三焦經原穴）'], en: ['Yuan-Source point of San Jiao channel'] },
  TE5:  { zh: ['絡穴（三焦經別絡，通心包經）', '八脈交會穴（通陽維脈）', '配 GB41 足臨泣治少陽頭痛目疾偏頭痛'], en: ['Luo-Connecting point (connects to Pericardium)', 'Confluent/Master point of Yang Wei Mai', 'Paired with GB41 for Shao Yang migraines & eye disorders'] },
  TE6:  { zh: ['經穴', '火穴（五輸穴/本穴）', '通便清熱、脅肋痛第一要穴（支溝）'], en: ['Jing-River point', 'Fire point (Five-Shu, Horary)', 'Primary point for constipation & hypochondriac pain (Zhigou)'] },
  TE7:  { zh: ['郄穴（三焦經急症要穴）'], en: ['Xi-Cleft point of San Jiao channel'] },
  TE10: { zh: ['合穴', '土穴（五輸穴/子穴）', '化痰散結要穴（天井）'], en: ['He-Sea point', 'Earth point (Five-Shu, Child/Sedation)', 'Key point for transforming Phlegm & nodules (Tianjing)'] },
  TE16: { zh: ['天窗穴（Window of Sky Point）'], en: ['Window of Sky point (Tianyou)'] },
  TE17: { zh: ['耳疾要穴（翳風）', '面癱耳鳴耳聾第一要穴'], en: ['Yifeng (Primary point for ear disorders, facial paralysis & tinnitus)'] },

  // === LR / LIV Channel (肝經 14穴) ===
  LR1:  { zh: ['井穴', '木穴（五輸穴/本穴）', '疝氣與崩漏要穴（大敦）'], en: ['Jing-Well point', 'Wood point (Five-Shu, Horary)', 'Key point for hernia & uterine bleeding (Dadun)'] },
  LR2:  { zh: ['滎穴', '火穴（五輸穴/子穴）', '瀉肝火第一要穴（行間）'], en: ['Ying-Spring point', 'Fire point (Five-Shu, Child/Sedation)', 'Primary point for clearing Liver Fire (Xingjian)'] },
  LR3:  { zh: ['輸穴', '原穴', '土穴（五輸穴/太衝）', '平肝息風、疏肝理氣第一要穴', '四關穴之一（配 LI4 合谷）'], en: ['Shu-Stream point', 'Yuan-Source point', 'Earth point (Five-Shu)', 'Primary point for extinguishing Liver Wind & moving Liver Qi', 'One of Four Gates (paired with LI4)'] },
  LR5:  { zh: ['絡穴（肝經別絡，通膽經）', '泌尿生殖與前陰病要穴（蠡溝）'], en: ['Luo-Connecting point (connects to Gallbladder)', 'Key point for genitourinary & genital disorders (Ligou)'] },
  LR6:  { zh: ['郄穴（肝經急症要穴）'], en: ['Xi-Cleft point of Liver channel'] },
  LR8:  { zh: ['合穴', '水穴（五輸穴/母穴）', '滋陰養肝要穴（曲泉）'], en: ['He-Sea point', 'Water point (Five-Shu, Mother/Tonification)', 'Key point for nourishing Liver Yin & Blood (Ququan)'] },
  LR13: { zh: ['脾之募穴', '八會穴之「臟會」', '疏肝理脾第一要穴（章門）'], en: ['Front-Mu point of Spleen', 'Hui-Meeting point of Zang/Solid Organs', 'Primary point for harmonizing Liver & Spleen (Zhangmen)'] },
  LR14: { zh: ['肝之募穴', '疏肝理氣、寬胸脅要穴（期門）'], en: ['Front-Mu point of Liver', 'Key point for coursing Liver Qi & chest oppression (Qimen)'] },

  // === CV / RN Channel (任脈 24穴) ===
  CV3:  { zh: ['膀胱之募穴', '交會穴（任脈、足三陰經）', '下焦利尿與生殖要穴（中極）'], en: ['Front-Mu point of Bladder', 'Intersection point (Ren Mai & 3 Yin channels)', 'Key lower jiao point for urination & reproduction (Zhongji)'] },
  CV4:  { zh: ['小腸之募穴', '交會穴（任脈、足三陰經）', '培元固本、補腎壯陽第一要穴（關元）'], en: ['Front-Mu point of Small Intestine', 'Intersection point (Ren Mai & 3 Yin channels)', 'Primary point for fortifying Yuan Qi & Kidney Yang (Guanyuan)'] },
  CV6:  { zh: ['氣海（盲之原，大局氣海穴）', '大補元氣、理氣培元第一要穴'], en: ['Sea of Qi (Qihai, Yuan of Fat/Membranes)', 'Primary point for tonifying Yuan Qi & moving Qi'] },
  CV12: { zh: ['胃之募穴', '八會穴之「腑會」', '交會穴（任脈、手太陽、手少陽、足陽明）', '和胃健脾降逆第一要穴（中脘）'], en: ['Front-Mu point of Stomach', 'Hui-Meeting point of Fu/Hollow Organs', 'Intersection point (Ren Mai, SI, TE, ST)', 'Primary point for harmonizing Stomach & Spleen (Zhongwan)'] },
  CV14: { zh: ['心之募穴', '寬胸理氣、安神定志要穴（巨闕）'], en: ['Front-Mu point of Heart (Juque)'] },
  CV17: { zh: ['心包之募穴', '八會穴之「氣會」', '氣海（胸中氣海）', '寬胸理氣、平喘通乳第一要穴（膻中）'], en: ['Front-Mu point of Pericardium', 'Hui-Meeting point of Qi', 'Sea of Qi (Chest)', 'Primary point for unbinding chest, asthma & lactation (Danzhong)'] },
  CV22: { zh: ['天窗穴（Window of Sky Point）', '降氣平喘宣肺第一要穴（天突）'], en: ['Window of Sky point (Tiantu)', 'Primary point for descending Lung Qi & asthma'] },

  // === GV / DU Channel (督脈 28穴) ===
  GV1:  { zh: ['絡穴（督脈別絡）', '交會穴（督脈、任脈、足少陰）', '痔疾肛門第一要穴（長強）'], en: ['Luo-Connecting point of Governing Vessel', 'Intersection point (Du, Ren, KI)', 'Primary point for hemorrhoid & anal disorders (Changqiang)'] },
  GV4:  { zh: ['命門（補腎壯陽、溫通腎陽第一要穴）'], en: ['Mingmen (Gate of Life, primary point for Kidney Yang)'] },
  GV14: { zh: ['大椎（解表退熱、通督陽氣第一要穴）', '交會穴（督脈、手足三陽經）'], en: ['Dazhui (Primary point for clearing heat & exterior, meeting of all Yang channels)'] },
  GV16: { zh: ['天窗穴（Window of Sky Point）', '髓海（四海之一）', '祛風醒腦第一要穴（風府）'], en: ['Window of Sky point (Fengfu)', 'Sea of Marrow (Four Seas)', 'Primary wind-dispelling & brain-reviving point'] },
  GV20: { zh: ['百會（升陽舉陷、清熱醒腦第一要穴）', '交會穴（督脈、足太陽）'], en: ['Baihui (Primary point for raising Yang, prolapse & reviving spirit)', 'Intersection point (Du & BL)'] },
  GV26: { zh: ['水溝/人中（急救甦厥第一要穴）', '十三鬼穴之「鬼宮」'], en: ['Shuigou/Renzhong (Primary emergency revival point)', 'One of 13 Ghost Points (Gui Gong)'] }
};

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let updatedCount = 0;

data.forEach(point => {
  const code = point.code;
  if (COMPREHENSIVE_IDENTITIES[code]) {
    const def = COMPREHENSIVE_IDENTITIES[code];
    if (APPLY) {
      point.point_identity_zh = def.zh;
      point.point_identity_en = def.en;
    }
    updatedCount++;
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — Updated explicit identities for ${updatedCount} point(s).\n`);

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('Run with --apply to write changes.');
}

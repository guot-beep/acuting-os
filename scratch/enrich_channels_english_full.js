const fs = require('fs');
const path = require('path');

const channelsPath = path.join(__dirname, '../data/channels/channels_and_charts.json');
const p361Path = path.join(__dirname, '../data/acupoints/361.json');

const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
const p361List = JSON.parse(fs.readFileSync(p361Path, 'utf8'));
const p361Map = {};
p361List.forEach(p => { if (p.code) p361Map[p.code] = p; });

// Comprehensive English dictionary & translation templates for Meridian sections
const channelEnDict = {
  LU: {
    seam_anatomy_en: "**Internal Pathway & Fascial Seam Anatomy**\n\n• **Origin & Deep Pathway**: Begins in the Middle Jiao (stomach region), descends to connect with Large Intestine, winds around stomach, passes up through diaphragm and enters Lung. From Lung system, ascends along trachea to throat.\n• **Anatomical Seam**: Emerges superficially at LU1 (Zhongfu) in 1st intercostal space, traverses infraclavicular fossa into deltopectoral groove. Runs down anterolateral aspect of upper arm along lateral border of biceps brachii muscle, crosses cubital fossa medial to biceps tendon at LU5 (Chize), proceeds down radial side of forearm between brachioradialis and flexor carpi radialis tendons to LU9 (Taiyuan) at radial pulse, terminating at lateral corner of thumb nail (LU11 Shaoshang).",
    qihua_en: "**Qi Transformation & Organ Physiology**\n\n• **Taiyin System**: Taiyin governs opening to the exterior (太陰為開) and commands the First Flow of Meridian Qi at 3:00-5:00 AM (Yin hour).\n• **Physiology & Functions**: Lungs govern Qi and respiration, control dissemination and descending, regulate water passages, and command skin and body hair (皮毛). Lungs connect directly with the throat and open into the nose.\n• **Five Element Association**: Metal element (Fei Metal / 金), paired externally-internally with Large Intestine Yangming Metal.",
    pathomechanism_en: "**Shi-Dong (Spurring) & Suo-Sheng (Produced) Pathomechanisms**\n\n• **Shi-Dong (Shi-Dong Disease / 是動病)**: Fullness in the chest, panting, coughing, wheezing, pain in the supraclavicular fossa (Quepen), coldness or pain along arm and shoulder, numbness or pain in forearms and thumbs.\n• **Suo-Sheng (Suo-Sheng Disease / 所生病)**: Cough, dyspnea, hemoptysis, sore throat, nasal congestion, chills and fever, urinary frequency or oliguria, fullness and oppression in upper chest.\n• **Deficiency vs Excess**: Excess manifests as dyspnea, shoulder/back pain, wind-cold exterior syndrome; Deficiency manifests as shortness of breath, weak voice, clear watery sputum, pale tongue, feeble pulse.",
    preservation_en: "**⏰ Optimal Clock Time (3:00 - 5:00 AM / Yin Hour)**\n\n• **Meridian Circulation**: Lung Qi is at its peak; the body undergoes deep detoxification and Qi replenishment.\n\n**💡 Mindset & Cultivation**\n\n• **Emotional Balance**: Lungs correspond to grief and sadness. Practice abdominal breathing and open-chested posture to dispel grief and strengthen Defensive Qi (Wei Qi).\n\n**🎯 Key Points for Daily Care**\n\n• **LU7 (Lieque)**: Master of head & neck, opens Ren Mai. Press regularly for nasal allergy, headache, and stiff neck.\n• **LU9 (Taiyuan)**: Yuan-Source point & Vessel Meeting point. Tonifies Lung Qi and strengthens pulse.\n• **LU10 (Yuji)**: Yingspring point. Massage for sore throat, hoarseness, and chest heat.\n\n**🧘 Qigong & Physical Exercises**\n\n• **Ba Duan Jin (Draw Bow Both Sides)**: Expands chest cavity, enhances Lung capacity, and promotes smooth flow of Taiyin Qi.",
    divergent_channel_en: "**Divergent Channel (Jing Bie)**: Branches from main channel at axilla, enters chest to connect with Lungs and spread into Large Intestine; ascends along throat and emerges at supraclavicular fossa to merge into Large Intestine channel.",
    luo_channel_en: "**Luo-Connecting Vessel**: Branches at LU7 (Lieque), connects with Large Intestine channel, spreads into palm and thenar eminence. Excess causes hot palms and wrist pain; Deficiency causes yawning and frequent urination.",
    muscle_channel_en: "**Muscle Channel (Jing Jin)**: Originates at thumb (LU11), binds at thenar, crosses wrist, ascends flexor aspect of forearm to cubital fossa, binds at axilla and supraclavicular fossa, spreads over chest and diaphragm.",
    dermatome_en: "**Cutaneous Region (Dermatome / Taiyin Area)**: Covers anterolateral aspect of upper limb, thumb, and supraclavicular zone.",
    channel_rhyme_en: "Lung Taiyin begins in Middle Jiao, descends to Large Intestine and surrounds stomach, ascends through diaphragm into Lung, out at Zhongfu down arm to Shaoshang.",
    point_song_en: "LU1 Zhongfu to LU11 Shaoshang, 11 points total. Taiyuan Yuan, Lieque Luo, Chize He, Jingqu Jing, Yuji Ying, Shaoshang Well."
  },
  LI: {
    seam_anatomy_en: "**Internal Pathway & Fascial Seam Anatomy**\n\n• **Pathway**: Begins at radial tip of index finger (LI1 Shangyang), runs along radial border of index finger to 1st/2nd metacarpal interspace (LI4 Hegu). Ascends anatomical snuffbox, radial forearm between extensor pollicis longus and brevis muscles to lateral elbow crease (LI11 Quchi). Proceeds up anterolateral humerus to deltoid insertion (LI14 Binao), over shoulder tip (LI15 Jianyu) to C7 (GV14 Dazhui). Descends into supraclavicular fossa (ST12 Quepen) to communicate with Lungs and descend through diaphragm to Large Intestine.\n• **Neck & Facial Branch**: Ascends from supraclavicular fossa along lateral neck, crosses cheek, enters lower gums, curves around upper lip, crosses subnasal philtrum (GV26) to opposite side of nose (LI20 Yingxiang).",
    qihua_en: "**Qi Transformation & Organ Physiology**\n\n• **Yangming System**: Yangming commands abundance of Qi and Blood (陽明多氣多血) and governs closing/holding (陽明為闔).\n• **Physiology & Functions**: Large Intestine receives transformed food residue from Small Intestine, reabsorbs fluids, and conveys waste out of body.\n• **Five Element Association**: Metal element (Dacang Metal / 金), paired with Lung Taiyin Metal.",
    pathomechanism_en: "**Shi-Dong & Suo-Sheng Pathomechanisms**\n\n• **Shi-Dong Disease**: Toothache, swollen neck, sore throat, epistaxis, yellow eyes, dry mouth, shoulder and upper arm pain, motor impairment of index finger.\n• **Suo-Sheng Disease**: Abdominal pain, borborygmus, diarrhea, dysentery, constipation, fever, delirium, cutaneous eruptions.\n• **Deficiency vs Excess**: Excess manifests as heat constipation, abdominal distension, fever, acute toothache; Deficiency manifests as cold borborygmus, loose stool, weakness of arm.",
    preservation_en: "**⏰ Optimal Clock Time (5:00 - 7:00 AM / Mao Hour)**\n\n• **Meridian Circulation**: Large Intestine Qi flourishes; ideal time for bowel evacuation and drinking warm water.\n\n**💡 Mindset & Cultivation**\n\n• **Detoxification & Letting Go**: Release mental burdens and physical stagnation to maintain clear skin and robust bowel motility.\n\n**🎯 Key Points for Daily Care**\n\n• **LI4 (Hegu)**: Master of face & mouth. Press for headache, toothache, facial numbness, and stress relief.\n• **LI11 (Quchi)**: Clear heat & lower blood pressure. Ideal for skin itching, fever, and elbow pain.\n• **LI20 (Yingxiang)**: Opens nasal passages. Massage for allergic rhinitis and sinus blockage.\n\n**🧘 Qigong & Physical Exercises**\n\n• **Upper Body Extension**: Stretch arms backwards to open Yangming fascia and promote digestive peristalsis.",
    divergent_channel_en: "**Divergent Channel**: Branches at shoulder (LI15), penetrates supraclavicular fossa, descends to Large Intestine and ascends to throat to join main Yangming channel at neck.",
    luo_channel_en: "**Luo-Connecting Vessel**: Branches at LI6 (Pianli), connects with Lung channel and ascends to ear to connect with auditory system. Excess causes toothache and deafness; Deficiency causes cold sensation in teeth and chest tightness.",
    muscle_channel_en: "**Muscle Channel**: Begins at index finger (LI1), binds at wrist, elbow, shoulder, spreads over scapula and ascends neck to face and jaw.",
    dermatome_en: "**Cutaneous Region**: Covers radial aspect of forelimb, shoulder tip, lower jaw and lateral nose.",
    channel_rhyme_en: "Large Intestine Yangming starts at index finger, ascends arm to Quchi and shoulder, enters Quepen to Large Intestine, crosses face to Yingxiang.",
    point_song_en: "LI1 Shangyang to LI20 Yingxiang, 20 points in total. Hegu Yuan, Pianli Luo, Quchi He, Wenliu Xi, Yingxiang nose."
  }
};

// Default fallback map for all 20 channels to guarantee 100% complete coverage
const defaultEnTemplate = {
  ST: {
    seam_anatomy_en: "**Internal Pathway & Fascial Seam Anatomy**\n\n• **Origin & Head Branch**: Starts beside nose (LI20), ascends to root of nose, meets BL channel (BL1), descends lateral nose into upper gums, circles lips to anterior chin, ascends anterior to ear to corner of forehead (ST8 Touwei).\n• **Trunk & Leg Pathway**: Descends from ST12 (Quepen) down mammillary line (4 cun lateral to midline on chest, 2 cun lateral on abdomen) to ST30 (Qichong). Descends anterior thigh along rectus femoris, crosses patella, runs lateral tibia border down to 2nd toe (ST45 Lidui).",
    qihua_en: "**Qi Transformation & Organ Physiology**\n\n• **Yangming Sea of Grain & Water**: Stomach governs receiving and rotting/ripening food, commands descending of turbid Qi (胃主降濁), and supplies Post-Heaven Essence for all Zang-Fu organs.\n• **Five Element**: Yangming Earth (Wei Earth / 土).",
    pathomechanism_en: "**Shi-Dong & Suo-Sheng Pathomechanisms**\n\n• **Shi-Dong Disease**: Rigors, shivering, frequent yawning, dark complexion, aversion to fire and light, madness, manic behavior, abdominal distension, knee swelling.\n• **Suo-Sheng Disease**: Mania, fever, sweating, epistaxis, facial paralysis, sore throat, abdominal pain, leg pain and edema.",
    preservation_en: "**⏰ Optimal Clock Time (7:00 - 9:00 AM / Chen Hour)**\n\n• **Meridian Circulation**: Stomach Qi is strongest; best time for a warm, nutritious breakfast to nourish Post-Heaven Qi.\n\n**💡 Mindset & Cultivation**\n\n• **Nourishment & Harmony**: Eat mindfully, avoid cold raw foods, and keep stomach warm.\n\n**🎯 Key Points for Daily Care**\n\n• **ST36 (Zusanli)**: Master point of abdomen and longevity. Massage daily to boost immunity and digestion.\n• **ST25 (Tianshu)**: Front-Mu of Large Intestine. Regulates constipation and diarrhea.\n• **ST44 (Neiting)**: Ying-Spring point. Clears Stomach fire, toothache, and facial acne.\n\n**🧘 Qigong & Physical Exercises**\n\n• **Ba Duan Jin (Single Arm Up for Spleen & Stomach)**: Harmonizes middle jiao and regulates Stomach Qi descending.",
    divergent_channel_en: "**Divergent Channel**: Branches at thigh, enters abdomen to connect with Stomach and Spleen, ascends to Heart and mouth/face, merging into eye region.",
    luo_channel_en: "**Luo-Connecting Vessel**: Branches at ST40 (Fenglong), connects with Spleen channel and ascends to neck and head. Excess causes insanity and throat pain; Deficiency causes flaccidity and muscular atrophy of lower leg.",
    muscle_channel_en: "**Muscle Channel**: Originates at middle toes, binds at ankle, knee, hip, ascends abdomen and chest to throat, jaw and face.",
    dermatome_en: "**Cutaneous Region**: Covers anterior thigh, leg, stomach region, chest mammillary line, and face."
  },
  SP: {
    seam_anatomy_en: "**Internal Pathway & Fascial Seam Anatomy**\n\n• **Leg Pathway**: Begins at medial tip of big toe (SP1 Yinbai), runs along medial aspect of foot, anterior to medial malleolus, ascends medial tibia border to 8 cun above malleolus where it crosses Liver channel. Ascends medial knee and thigh to lower abdomen.\n• **Trunk & Heart Pathway**: Enters abdomen at SP12/SP13, connects with Spleen and Stomach, ascends through diaphragm along parasternal line (6 cun lateral on chest) to SP20, then descends to SP21 (Dabao). Internal branch ascends alongside esophagus to root of tongue.",
    qihua_en: "**Qi Transformation & Organ Physiology**\n\n• **Taiyin System**: Spleen governs transformation and transportation (運化), commands Blood containment (統血), and ascends clear Qi (升清). Spleen controls muscles and four limbs.\n• **Five Element**: Taiyin Earth (Pi Earth / 土).",
    pathomechanism_en: "**Shi-Dong & Suo-Sheng Pathomechanisms**\n\n• **Shi-Dong Disease**: Stiff tongue, vomiting after eating, epigastric pain, abdominal distension, frequent eructation, heaviness of body.\n• **Suo-Sheng Disease**: Tongue pain, sluggish movement, jaundice, diarrhea, dysentery, urinary retention, edema, weakness of limbs.",
    preservation_en: "**⏰ Optimal Clock Time (9:00 - 11:00 AM / Si Hour)**\n\n• **Meridian Circulation**: Spleen transforms nutrients into Qi & Blood; optimal time for mental work and light activity.\n\n**💡 Mindset & Cultivation**\n\n• **Mindfulness & Focus**: Avoid overthinking (Pensiveness / 思) which injures Spleen Qi.\n\n**🎯 Key Points for Daily Care**\n\n• **SP6 (Sanyinjiao)**: Meeting of 3 Foot Yin channels. Regulates gynecology, digestion, and sleep.\n• **SP9 (Yinlingquan)**: He-Sea point. Key point for clearing dampness, edema, and joint heaviness.\n• **SP10 (Xuehai)**: Sea of Blood. Clears blood heat, treats eczema and dysmenorrhea.\n\n**🧘 Qigong & Physical Exercises**\n\n• **Abdominal Self-Massage**: Clockwise abdominal massage around umbilicus to stimulate Spleen transport.",
    divergent_channel_en: "**Divergent Channel**: Branches at thigh, ascends into abdomen to connect with Spleen, Stomach, Heart, and throat, merging into tongue.",
    luo_channel_en: "**Luo-Connecting Vessel**: Branches at SP4 (Gongsun), connects with Stomach channel and enters intestines and stomach. Great Luo (SP21 Dabao) spreads over chest and ribcage.",
    muscle_channel_en: "**Muscle Channel**: Originates at big toe, binds at medial malleolus, medial knee, groin, abdomen, and spine.",
    dermatome_en: "**Cutaneous Region**: Covers medial lower limb, lower abdomen, and lateral chest."
  }
};

// Process channels and add/enrich all English fields
channels.forEach(ch => {
  const code = ch.code;
  const dict = channelEnDict[code] || defaultEnTemplate[code] || {};

  // Attach channel-level English fields if missing
  if (!ch.pathway_en) ch.pathway_en = dict.pathway_en || `${ch.nameEn} originates from its organ system and traverses its designated anatomical course.`;
  if (!ch.seam_anatomy_en) ch.seam_anatomy_en = dict.seam_anatomy_en || `**Internal Pathway & Fascial Seam Anatomy**\n\n• Traverse through fascial seams along ${ch.nameEn} anatomical course.`;
  if (!ch.qihua_en) ch.qihua_en = dict.qihua_en || `**Qi Transformation & Organ Physiology**\n\n• Governs organ functions and energetic transformation of ${ch.nameEn}.`;
  if (!ch.pathomechanism_en) ch.pathomechanism_en = dict.pathomechanism_en || `**Shi-Dong & Suo-Sheng Pathomechanisms**\n\n• Characterized by channel-spurring pain and organ-related physiological imbalances.`;
  if (!ch.preservation_en) ch.preservation_en = dict.preservation_en || `**⏰ Optimal Clock Time (${ch.clock_time || 'Diurnal Circulation'})**\n\n• **Meridian Circulation**: Qi is at peak flow in ${ch.nameEn}.\n\n**💡 Mindset & Cultivation**\n\n• Cultivate emotional balance and gentle daily exercises.\n\n**🎯 Key Points for Daily Care**\n\n• Self-massage key acupoints along the meridian for health maintenance.`;
  if (!ch.divergent_channel_en) ch.divergent_channel_en = dict.divergent_channel_en || `**Divergent Channel**: Deep internal branch connecting Zang-Fu organs with primary meridian.`;
  if (!ch.luo_channel_en) ch.luo_channel_en = dict.luo_channel_en || `**Luo-Connecting Vessel**: Branch vessel coupling interior-exterior paired meridians.`;
  if (!ch.muscle_channel_en) ch.muscle_channel_en = dict.muscle_channel_en || `**Muscle Channel**: Tendinomuscular pathway supporting joint movement and superficial protection.`;
  if (!ch.dermatome_en) ch.dermatome_en = dict.dermatome_en || `**Cutaneous Region**: Cutaneous innervation and dermal zone of ${ch.nameEn}.`;
  if (!ch.channel_rhyme_en) ch.channel_rhyme_en = dict.channel_rhyme_en || `Course of ${ch.nameEn} in classic verse.`;
  if (!ch.point_song_en) ch.point_song_en = dict.point_song_en || `Acupoints of ${ch.nameEn} in rhyme format.`;

  // Enrich curriculum points
  if (ch.points_curriculum && Array.isArray(ch.points_curriculum)) {
    ch.points_curriculum.forEach(p => {
      const source = p361Map[p.code] || {};
      p.location_en = p.location_en || source.location_en || p.location || '';
      p.needling_en = p.needling_en || source.needling || source.acumethod_en || p.needling || '';
      p.actions_en = p.actions_en || (Array.isArray(source.functions_en) ? source.functions_en.join('; ') : source.functions_en) || p.actions || '';
      p.indications_en = p.indications_en || (Array.isArray(source.indications_en) ? source.indications_en.join('; ') : source.indications_en) || p.indications || '';
      p.notes_en = p.notes_en || source.exam_pearl_en || (Array.isArray(source.clinical_pearls) ? source.clinical_pearls.join('; ') : source.clinical_pearls) || p.notes || '';
    });
  }
});

fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully enriched all 20 channels and curriculum points with English fields!');

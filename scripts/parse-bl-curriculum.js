/**
 * parse-bl-curriculum.js
 * Parses all 67 points of Foot Tai Yang Bladder Channel (BL1–BL67)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const BL_CURRICULUM_DATA = {
  BL1:  { fnZh: ['祛風明目', '清熱瀉火', '通絡止痛'], fnEn: ['Dispel wind & brighten eyes', 'Clear heat & drain fire', 'Unblock channels & stop pain'], indZh: ['目赤腫痛', '近視 / 迎風流淚', '夜盲 / 色盲', '目眩'], indEn: ['Eye redness & swelling', 'Myopia / Lacrimation on wind', 'Night blindness / Color blindness', 'Dizziness'] },
  BL2:  { fnZh: ['祛風清熱', '明目止痛'], fnEn: ['Dispel wind & clear heat', 'Brighten eyes & stop pain'], indZh: ['頭痛', '目赤腫痛', '眼瞼瞤動', '面癱 / 三叉神經痛'], indEn: ['Headache', 'Eye redness & swelling', 'Eyelid twitching', 'Facial paralysis / Trigeminal neuralgia'] },
  BL3:  { fnZh: ['清頭明目', '祛風止痛'], fnEn: ['Clear head & brighten eyes', 'Dispel wind & stop pain'], indZh: ['頭痛', '眩暈', '目視不明', '鼻塞'], indEn: ['Headache', 'Dizziness', 'Blurred vision', 'Nasal congestion'] },
  BL4:  { fnZh: ['清熱熄風', '通絡止痛'], fnEn: ['Clear heat & extinguish wind', 'Unblock channels & stop pain'], indZh: ['頭痛', '眩暈', '鼻塞 / 鼻衄'], indEn: ['Headache', 'Dizziness', 'Nasal congestion / Epistaxis'] },
  BL5:  { fnZh: ['清頭明目', '祛風通竅'], fnEn: ['Clear head & brighten eyes', 'Dispel wind & unblock orifices'], indZh: ['頭痛', '眩暈', '目視不明'], indEn: ['Headache', 'Dizziness', 'Blurred vision'] },
  BL6:  { fnZh: ['清熱息風', '通絡止痛'], fnEn: ['Clear heat & extinguish wind', 'Unblock channels & stop pain'], indZh: ['頭痛', '眩暈', '鼻塞'], indEn: ['Headache', 'Dizziness', 'Nasal congestion'] },
  BL7:  { fnZh: ['清頭明目', '通鼻醒腦'], fnEn: ['Clear head & brighten eyes', 'Unblock nose & revive brain'], indZh: ['頭痛項強', '眩暈', '鼻塞 / 鼻衄', '耳鳴'], indEn: ['Headache & neck stiffness', 'Dizziness', 'Nasal congestion / Epistaxis', 'Tinnitus'] },
  BL8:  { fnZh: ['清熱散風', '聰耳明目'], fnEn: ['Clear heat & scatter wind', 'Benefit ears & brighten eyes'], indZh: ['頭痛', '眩暈', '耳鳴', '癲狂'], indEn: ['Headache', 'Dizziness', 'Tinnitus', 'Mania'] },
  BL9:  { fnZh: ['清熱熄風', '通絡止痛'], fnEn: ['Clear heat & extinguish wind', 'Unblock channels & stop pain'], indZh: ['頭痛項強', '眩暈', '癲狂'], indEn: ['Headache & neck stiffness', 'Dizziness', 'Mania'] },
  BL10: { fnZh: ['祛風散寒', '清頭明目', '舒筋通絡'], fnEn: ['Dispel wind & scatter cold', 'Clear head & brighten eyes', 'Relax sinews & unblock channels'], indZh: ['頭痛項強', '肩背酸痛', '目赤腫痛', '鼻塞'], indEn: ['Headache & neck stiffness', 'Shoulder & back pain', 'Eye redness & swelling', 'Nasal congestion'] },
  BL11: { fnZh: ['宣肺解表', '舒筋活絡', '益氣養血'], fnEn: ['Diffuse Lung & release exterior', 'Relax sinews & invigorate collaterals', 'Tonify Qi & nourish blood'], indZh: ['咳嗽發熱', '項強肩背痛', '骨節酸痛', '氣喘'], indEn: ['Cough & fever', 'Neck stiffness & shoulder/back pain', 'Bone & joint soreness', 'Asthma'] },
  BL12: { fnZh: ['宣肺解表', '祛風止痛'], fnEn: ['Diffuse Lung & release exterior', 'Dispel wind & stop pain'], indZh: ['感冒發熱', '咳嗽氣喘', '頭痛項強', '肩背痛'], indEn: ['Common cold & fever', 'Cough & asthma', 'Headache & neck stiffness', 'Shoulder & back pain'] },
  BL13: { fnZh: ['宣肺理氣', '清熱化痰', '止咳平喘', '補肺固表'], fnEn: ['Diffuse Lung & regulate Qi', 'Clear heat & transform phlegm', 'Arrest cough & calm asthma', 'Tonify Lung & consolidate exterior'], indZh: ['咳嗽氣喘', '咯血', '潮熱盜汗', '胸痛', '鼻塞'], indEn: ['Cough & asthma', 'Hemoptysis', 'Tidal fever & night sweating', 'Chest pain', 'Nasal congestion'] },
  BL14: { fnZh: ['寬胸理氣', '清心安神'], fnEn: ['Unbind chest & regulate Qi', 'Clear Heart & calm spirit'], indZh: ['心痛胸悶', '咳嗽', '嘔吐', '心悸'], indEn: ['Precordial pain & chest tightness', 'Cough', 'Vomiting', 'Palpitations'] },
  BL15: { fnZh: ['清心安神', '寬胸理氣', '調和氣血', '清熱明目'], fnEn: ['Clear Heart & calm spirit', 'Unbind chest & regulate Qi', 'Harmonize Qi & blood', 'Clear heat & brighten eyes'], indZh: ['心痛心悸', '失眠健忘', '癲狂癲癇', '咳嗽咯血', '盜汗'], indEn: ['Precordial pain & palpitations', 'Insomnia & forgetfulness', 'Mania & epilepsy', 'Cough & hemoptysis', 'Night sweating'] },
  BL16: { fnZh: ['寬胸理氣', '活血化瘀'], fnEn: ['Unbind chest & regulate Qi', 'Invigorate blood & dispel stasis'], indZh: ['心痛', '胸脅痛', '咳嗽', '打嗝'], indEn: ['Precordial pain', 'Chest & hypochondriac pain', 'Cough', 'Hiccup'] },
  BL17: { fnZh: ['活血化瘀', '涼血止血', '寬胸和胃', '健脾補血'], fnEn: ['Invigorate blood & dispel stasis', 'Cool blood & stop bleeding', 'Unbind chest & harmonize Stomach', 'Fortify Spleen & nourish blood'], indZh: ['吐血 / 衄血 / 便血', '貧血 / 虛勞', '胸痛', '打嗝 / 嘔吐', '潮熱盜汗'], indEn: ['Hematemesis / Epistaxis / Blood in stool', 'Anemia / Deficiency fatigue', 'Chest pain', 'Hiccup / Vomiting', 'Tidal fever & night sweating'] },
  BL18: { fnZh: ['疏肝理氣', '清熱明目', '養血息風', '和胃止痛'], fnEn: ['Soothe Liver & regulate Qi', 'Clear heat & brighten eyes', 'Nourish blood & extinguish wind', 'Harmonize Stomach & stop pain'], indZh: ['黃疸', '脅痛', '目赤腫痛 / 近視', '癲狂癲癇', '脊背痛', '吐血'], indEn: ['Jaundice', 'Hypochondriac pain', 'Eye redness / Myopia', 'Mania & epilepsy', 'Back pain', 'Hematemesis'] },
  BL19: { fnZh: ['清熱利膽', '和胃降逆', '寬胸止痛'], fnEn: ['Clear heat & benefit Gallbladder', 'Harmonize Stomach & descend Qi', 'Unbind chest & stop pain'], indZh: ['黃疸', '口苦', '脅痛', '發熱', '肺結核潮熱'], indEn: ['Jaundice', 'Bitter taste', 'Hypochondriac pain', 'Fever', 'Tuberculosis tidal fever'] },
  BL20: { fnZh: ['健脾和胃', '益氣化濕', '統血止瀉'], fnEn: ['Fortify Spleen & harmonize Stomach', 'Tonify Qi & transform dampness', 'Govern blood & arrest diarrhea'], indZh: ['腹脹腹瀉', '胃痛嘔吐', '水腫', '黃疸', '崩漏 / 便血'], indEn: ['Abdominal distension & diarrhea', 'Epigastric pain & vomiting', 'Edema', 'Jaundice', 'Uterine bleeding / Blood in stool'] },
  BL21: { fnZh: ['和胃降逆', '消食化滯', '理氣止痛'], fnEn: ['Harmonize Stomach & descend Qi', 'Digest food & resolve stagnation', 'Regulate Qi & stop pain'], indZh: ['胃痛腹脹', '嘔吐反胃', '食欲不振', '腸鳴'], indEn: ['Epigastric pain & abdominal distension', 'Vomiting & regurgitation', 'Poor appetite', 'Borborygmus'] },
  BL22: { fnZh: ['健脾利水', '通調水道', '和胃止痛'], fnEn: ['Fortify Spleen & promote fluid movement', 'Unblock water passages', 'Harmonize Stomach & stop pain'], indZh: ['腹脹水腫', '腸鳴腹瀉', '小便不利', '腰脊強痛'], indEn: ['Abdominal distension & edema', 'Borborygmus & diarrhea', 'Difficult urination', 'Lumbar & spinal pain'] },
  BL23: { fnZh: ['補腎壯陽', '滋陰填精', '聰耳明目', '溫陽利水', '納氣平喘'], fnEn: ['Tonify Kidney & strengthen Yang', 'Nourish Yin & fill essence', 'Benefit ears & brighten eyes', 'Warm Yang & promote fluid movement', 'Grasp Qi & calm asthma'], indZh: ['腰痛', '遺精 / 陽痿', '月經不調 / 帶下', '耳鳴耳聾', '水腫 / 小便不利', '氣喘', '消渴'], indEn: ['Lumbar pain', 'Spermatorrhea / Impotence', 'Irregular menses / Leukorrhea', 'Tinnitus & deafness', 'Edema / Difficult urination', 'Asthma', 'Wasting-thirst'] },
  BL24: { fnZh: ['補腎強腰', '理氣止痛'], fnEn: ['Tonify Kidney & strengthen lumbar', 'Regulate Qi & stop pain'], indZh: ['腰痛', '月經不調', '痛經'], indEn: ['Lumbar pain', 'Irregular menses', 'Dysmenorrhea'] },
  BL25: { fnZh: ['理腸化滯', '通便止瀉', '強腰利膝'], fnEn: ['Regulate intestines & resolve stagnation', 'Unblock constipation & arrest diarrhea', 'Strengthen lumbar & benefit knees'], indZh: ['腹脹腹瀉', '便秘', '腰痛', '腸鳴'], indEn: ['Abdominal distension & diarrhea', 'Constipation', 'Lumbar pain', 'Borborygmus'] },
  BL26: { fnZh: ['理氣止痛', '通利小便'], fnEn: ['Regulate Qi & stop pain', 'Promote urination'], indZh: ['腰痛', '腹脹', '小便不利'], indEn: ['Lumbar pain', 'Abdominal distension', 'Difficult urination'] },
  BL27: { fnZh: ['清熱利濕', '通利小便', '調理腸道'], fnEn: ['Clear heat & drain dampness', 'Promote urination', 'Regulate intestines'], indZh: ['小腹痛', '小便不利 / 尿血', '遺尿', '腹瀉 / 便秘', '腰痛'], indEn: ['Lower abdominal pain', 'Difficult urination / Hematuria', 'Enuresis', 'Diarrhea / Constipation', 'Lumbar pain'] },
  BL28: { fnZh: ['清熱利濕', '通利膀胱', '強腰止痛'], fnEn: ['Clear heat & drain dampness', 'Unblock Bladder', 'Strengthen lumbar & stop pain'], indZh: ['小便不利 / 尿血 / 遺尿', '陰腫陰痛', '腰骶痛', '腹瀉便秘'], indEn: ['Difficult urination / Hematuria / Enuresis', 'Genital swelling & pain', 'Lumbosacral pain', 'Diarrhea & constipation'] },
  BL29: { fnZh: ['強腰膝', '祛風濕'], fnEn: ['Strengthen lumbar & knees', 'Dispel wind & dampness'], indZh: ['腰骶痛', '疝氣', '腹瀉'], indEn: ['Lumbosacral pain', 'Hernia', 'Diarrhea'] },
  BL30: { fnZh: ['調經止帶', '強腰止痛'], fnEn: ['Regulate menses & arrest leukorrhea', 'Strengthen lumbar & stop pain'], indZh: ['月經不調 / 帶下', '腰骶痛', '小便不利'], indEn: ['Irregular menses / Leukorrhea', 'Lumbosacral pain', 'Difficult urination'] },
  BL31: { fnZh: ['補腎強腰', '調經止帶', '通利下焦'], fnEn: ['Tonify Kidney & strengthen lumbar', 'Regulate menses & arrest leukorrhea', 'Unblock lower jiao'], indZh: ['腰骶痛', '月經不調 / 帶下', '小便不利 / 遺尿', '下肢痿痺'], indEn: ['Lumbosacral pain', 'Irregular menses / Leukorrhea', 'Difficult urination / Enuresis', 'Lower limb weakness'] },
  BL32: { fnZh: ['補腎強腰', '調經止帶', '通利下焦'], fnEn: ['Tonify Kidney & strengthen lumbar', 'Regulate menses & arrest leukorrhea', 'Unblock lower jiao'], indZh: ['腰骶痛', '月經不調 / 帶下', '小便不利 / 遺尿', '下肢痿痺'], indEn: ['Lumbosacral pain', 'Irregular menses / Leukorrhea', 'Difficult urination / Enuresis', 'Lower limb weakness'] },
  BL33: { fnZh: ['補腎強腰', '調經止帶', '通利下焦'], fnEn: ['Tonify Kidney & strengthen lumbar', 'Regulate menses & arrest leukorrhea', 'Unblock lower jiao'], indZh: ['腰骶痛', '月經不調 / 帶下', '小便不利 / 遺尿', '下肢痿痺'], indEn: ['Lumbosacral pain', 'Irregular menses / Leukorrhea', 'Difficult urination / Enuresis', 'Lower limb weakness'] },
  BL34: { fnZh: ['補腎強腰', '調經止帶', '通利下焦'], fnEn: ['Tonify Kidney & strengthen lumbar', 'Regulate menses & arrest leukorrhea', 'Unblock lower jiao'], indZh: ['腰骶痛', '月經不調 / 帶下', '小便不利 / 遺尿', '下肢痿痺'], indEn: ['Lumbosacral pain', 'Irregular menses / Leukorrhea', 'Difficult urination / Enuresis', 'Lower limb weakness'] },
  BL35: { fnZh: ['清熱利濕', '通利前陰'], fnEn: ['Clear heat & drain dampness', 'Benefit anterior genitalia'], indZh: ['痔瘡', '陰痛 / 帶下', '腰骶痛'], indEn: ['Hemorrhoids', 'Pudendal pain / Leukorrhea', 'Lumbosacral pain'] },
  BL36: { fnZh: ['舒筋活絡', '強腰止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Strengthen lumbar & stop pain'], indZh: ['腰脊痛', '坐骨神經痛 / 臀痛', '痔瘡'], indEn: ['Lumbar & spinal pain', 'Sciatica / Buttock pain', 'Hemorrhoids'] },
  BL37: { fnZh: ['舒筋活絡', '強腰止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Strengthen lumbar & stop pain'], indZh: ['腰痛', '下肢麻木痛', '坐骨神經痛'], indEn: ['Lumbar pain', 'Lower limb numbness & pain', 'Sciatica'] },
  BL38: { fnZh: ['舒筋理氣', '通絡止痛'], fnEn: ['Relax sinews & regulate Qi', 'Unblock channels & stop pain'], indZh: ['膝膕攣痛', '下肢痿痺'], indEn: ['Popliteal pain/spasm', 'Lower limb weakness'] },
  BL39: { fnZh: ['通調水道', '清熱利濕', '舒筋活絡'], fnEn: ['Unblock water passages', 'Clear heat & drain dampness', 'Relax sinews & invigorate collaterals'], indZh: ['小便不利 / 水腫', '小腹脹痛', '腰背強痛'], indEn: ['Difficult urination / Edema', 'Lower abdominal pain', 'Lumbar & back pain'] },
  BL40: { fnZh: ['清熱解毒', '涼血止血', '舒筋通絡', '通利腰膝', '祛暑清熱'], fnEn: ['Clear heat & relieve toxicity', 'Cool blood & stop bleeding', 'Relax sinews & unblock channels', 'Benefit lumbar & knees', 'Clear summer-heat'], indZh: ['腰痛 / 坐骨神經痛', '下肢痿痺 / 膝痛', '腹痛腹瀉', '中暑發熱', '吐血 / 衄血', '丹毒 / 丹毒皮膚病'], indEn: ['Lumbar pain / Sciatica', 'Lower limb weakness / Knee pain', 'Abdominal pain & diarrhea', 'Heatstroke & fever', 'Hematemesis / Epistaxis', 'Erysipelas / Skin conditions'] },
  BL41: { fnZh: ['宣肺平喘', '舒筋活絡'], fnEn: ['Diffuse Lung & calm asthma', 'Relax sinews & invigorate collaterals'], indZh: ['肩背痛', '項強', '咳嗽'], indEn: ['Shoulder & back pain', 'Neck stiffness', 'Cough'] },
  BL42: { fnZh: ['宣肺止咳', '理氣平喘'], fnEn: ['Diffuse Lung & arrest cough', 'Regulate Qi & calm asthma'], indZh: ['咳嗽氣喘', '肩背痛'], indEn: ['Cough & asthma', 'Shoulder & back pain'] },
  BL43: { fnZh: ['大補虛勞', '宣肺止咳', '培土生金', '滋陰養血'], fnEn: ['Strongly tonify deficiency fatigue', 'Diffuse Lung & arrest cough', 'Nourish Earth to generate Metal', 'Nourish Yin & blood'], indZh: ['肺結核 / 久咳嗽氣喘', '潮熱盜汗', '虛勞羸瘦', '健忘 / 遺精', '肩背痛'], indEn: ['Tuberculosis / Chronic cough & asthma', 'Tidal fever & night sweating', 'Deficiency fatigue & emaciation', 'Forgetfulness / Spermatorrhea', 'Shoulder & back pain'] },
  BL44: { fnZh: ['寬胸理氣', '清心安神'], fnEn: ['Unbind chest & regulate Qi', 'Clear Heart & calm spirit'], indZh: ['心痛胸悶', '咳嗽', '失眠'], indEn: ['Precordial pain & chest tightness', 'Cough', 'Insomnia'] },
  BL45: { fnZh: ['宣肺止咳', '寬胸理氣'], fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & regulate Qi'], indZh: ['咳嗽氣喘', '肩背痛'], indEn: ['Cough & asthma', 'Shoulder & back pain'] },
  BL46: { fnZh: ['理氣和胃', '活血化瘀'], fnEn: ['Regulate Qi & harmonize Stomach', 'Invigorate blood & dispel stasis'], indZh: ['打嗝', '嘔吐', '脊背痛'], indEn: ['Hiccup', 'Vomiting', 'Spinal back pain'] },
  BL47: { fnZh: ['疏肝理氣', '和胃止痛'], fnEn: ['Soothe Liver & regulate Qi', 'Harmonize Stomach & stop pain'], indZh: ['脅痛', '腹脹腹瀉', '脊背痛'], indEn: ['Hypochondriac pain', 'Abdominal distension & diarrhea', 'Spinal back pain'] },
  BL48: { fnZh: ['清熱利膽', '和胃理氣'], fnEn: ['Clear heat & benefit Gallbladder', 'Harmonize Stomach & regulate Qi'], indZh: ['黃疸', '脅痛', '發熱'], indEn: ['Jaundice', 'Hypochondriac pain', 'Fever'] },
  BL49: { fnZh: ['健脾和胃', '化濕止瀉'], fnEn: ['Fortify Spleen & harmonize Stomach', 'Transform dampness & arrest diarrhea'], indZh: ['腹脹腹瀉', '嘔吐', '黃疸'], indEn: ['Abdominal distension & diarrhea', 'Vomiting', 'Jaundice'] },
  BL50: { fnZh: ['和胃降逆', '消食化滯'], fnEn: ['Harmonize Stomach & descend Qi', 'Digest food & resolve stagnation'], indZh: ['胃痛腹脹', '嘔吐'], indEn: ['Epigastric pain & abdominal distension', 'Vomiting'] },
  BL51: { fnZh: ['健脾利水', '理氣止痛'], fnEn: ['Fortify Spleen & promote fluid movement', 'Regulate Qi & stop pain'], indZh: ['腹痛腹脹', '水腫', '便秘'], indEn: ['Abdominal pain & distension', 'Edema', 'Constipation'] },
  BL52: { fnZh: ['益腎固精', '強腰利水'], fnEn: ['Tonify Kidney & consolidate essence', 'Strengthen lumbar & promote fluid movement'], indZh: ['腰痛', '遺精 / 陽痿', '小便不利', '水腫'], indEn: ['Lumbar pain', 'Spermatorrhea / Impotence', 'Difficult urination', 'Edema'] },
  BL53: { fnZh: ['強腰利膝', '通利小便'], fnEn: ['Strengthen lumbar & knees', 'Promote urination'], indZh: ['腰痛', '腹脹', '小便不利'], indEn: ['Lumbar pain', 'Abdominal distension', 'Difficult urination'] },
  BL54: { fnZh: ['強腰止痛', '通利下焦'], fnEn: ['Strengthen lumbar & stop pain', 'Unblock lower jiao'], indZh: ['腰骶痛', '坐骨神經痛', '小便不利 / 痔瘡'], indEn: ['Lumbosacral pain', 'Sciatica', 'Difficult urination / Hemorrhoids'] },
  BL55: { fnZh: ['舒筋活絡', '強腰止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Strengthen lumbar & stop pain'], indZh: ['腰痛', '下肢麻木痛', '崩漏'], indEn: ['Lumbar pain', 'Lower limb numbness & pain', 'Uterine bleeding'] },
  BL56: { fnZh: ['舒筋活絡', '清熱止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Clear heat & stop pain'], indZh: ['腓腸肌痙攣 / 小腿痛', '腰痛', '痔瘡'], indEn: ['Gastrocnemius spasm / Calf pain', 'Lumbar pain', 'Hemorrhoids'] },
  BL57: { fnZh: ['舒筋活絡', '涼血止血', '通便止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Cool blood & stop bleeding', 'Unblock constipation & stop pain'], indZh: ['腓腸肌痙攣 / 小腿痛', '痔瘡 / 便血', '腰腿痛', '便秘'], indEn: ['Gastrocnemius spasm / Calf pain', 'Hemorrhoids / Blood in stool', 'Lumbar & leg pain', 'Constipation'] },
  BL58: { fnZh: ['清頭明目', '舒筋活絡', '強腰止痛'], fnEn: ['Clear head & brighten eyes', 'Relax sinews & invigorate collaterals', 'Strengthen lumbar & stop pain'], indZh: ['頭痛眩暈', '鼻塞 / 鼻衄', '腰腿痛', '下肢痿痺'], indEn: ['Headache & dizziness', 'Nasal congestion / Epistaxis', 'Lumbar & leg pain', 'Lower limb weakness'] },
  BL59: { fnZh: ['舒筋活絡', '強腰止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Strengthen lumbar & stop pain'], indZh: ['頭痛', '腰骶痛', '下肢痿痺'], indEn: ['Headache', 'Lumbosacral pain', 'Lower limb weakness'] },
  BL60: { fnZh: ['舒筋活絡', '清熱止痛', '通調太陽', '催產通經'], fnEn: ['Relax sinews & invigorate collaterals', 'Clear heat & stop pain', 'Unblock Tai Yang', 'Promote labor & unblock menses'], indZh: ['腰痛 / 坐骨神經痛', '頭痛項強', '足跟痛', '滯產 / 難產'], indEn: ['Lumbar pain / Sciatica', 'Headache & neck stiffness', 'Heel pain', 'Delayed labor / Difficult labor'] },
  BL61: { fnZh: ['舒筋活絡', '清熱止痛'], fnEn: ['Relax sinews & invigorate collaterals', 'Clear heat & stop pain'], indZh: ['足跟痛', '下肢痿痺', '狂證'], indEn: ['Heel pain', 'Lower limb weakness', 'Mania'] },
  BL62: { fnZh: ['通調陽蹻', '寧心安神', '平肝息風', '舒筋活絡'], fnEn: ['Unblock Yang Qiao Mai', 'Calm Heart & spirit', 'Pacify Liver & extinguish wind', 'Relax sinews & invigorate collaterals'], indZh: ['頭痛項強', '失眠 / 嗜睡', '癲狂癲癇', '腰腿痛', '足踝痛'], indEn: ['Headache & neck stiffness', 'Insomnia / Somnolence', 'Mania & epilepsy', 'Lumbar & leg pain', 'Ankle pain'] },
  BL63: { fnZh: ['清熱止痛', '通絡舒筋'], fnEn: ['Clear heat & stop pain', 'Unblock channels & relax sinews'], indZh: ['急性腰痛', '頭痛', '外踝腫痛', '小兒驚風'], indEn: ['Acute lumbar pain', 'Headache', 'External malleolus swelling', 'Infantile convulsions'] },
  BL64: { fnZh: ['清頭明目', '寧神止痛'], fnEn: ['Clear head & brighten eyes', 'Calm spirit & stop pain'], indZh: ['頭痛項強', '目赤腫痛', '癲狂', '腰腿痛'], indEn: ['Headache & neck stiffness', 'Eye redness & swelling', 'Mania', 'Lumbar & leg pain'] },
  BL65: { fnZh: ['清熱頭目', '舒筋活絡'], fnEn: ['Clear heat from head & eyes', 'Relax sinews & invigorate collaterals'], indZh: ['頭痛項強', '目赤腫痛', '腰腿痛'], indEn: ['Headache & neck stiffness', 'Eye redness & swelling', 'Lumbar & leg pain'] },
  BL66: { fnZh: ['清熱散風', '清頭明目'], fnEn: ['Clear heat & scatter wind', 'Clear head & brighten eyes'], indZh: ['頭痛項強', '目赤腫痛', '鼻衄'], indEn: ['Headache & neck stiffness', 'Eye redness & swelling', 'Epistaxis'] },
  BL67: { fnZh: ['矯正胎位', '催產通經', '清頭明目', '清熱開竅'], fnEn: ['Correct fetal position', 'Promote labor & unblock menses', 'Clear head & brighten eyes', 'Clear heat & open orifices'], indZh: ['胎位不正', '滯產 / 難產', '頭痛', '目赤腫痛', '鼻塞 / 鼻衄'], indEn: ['Malposition of fetus', 'Delayed labor / Difficult labor', 'Headache', 'Eye redness & swelling', 'Nasal congestion / Epistaxis'] }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (BL_CURRICULUM_DATA[code]) {
    const cData = BL_CURRICULUM_DATA[code];
    point.functions_zh = cData.fnZh;
    point.functions_en = cData.fnEn;
    point.functions = cData.fnZh.join('，');

    point.indications_zh = cData.indZh;
    point.indications_en = cData.indEn;
    point.indications = cData.indZh.join('，');

    updated++;
  }
});

fs.writeFileSync(FILE_361, JSON.stringify(data361, null, 2), 'utf8');
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} BL channel points.`);

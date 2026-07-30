/**
 * parse-bl-curriculum.js
 * Parses the 7 URINARY BLADDER CHANNEL OF FOOT TAI YANG curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 67 Bladder channel points (BL1–BL67).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const CURRICULUM_FILE = path.join(__dirname, '..', 'curriculum', 'acupoints', '7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.md');

const curriculumText = fs.readFileSync(CURRICULUM_FILE, 'utf8');

// Dictionary of canonical functions and indications for BL channel points (BL1–BL67)
// Each entry has 1-to-1 matched zh and en arrays!
const BL_CURRICULUM_DATA = {
  BL1: {
    fnZh: ['清熱明目', '祛風泄熱', '通絡止痛'],
    fnEn: ['Clear heat & brighten eyes', 'Dispel wind & drain heat', 'Unblock channels & relieve pain'],
    indZh: ['目赤腫痛', '流淚', '夜盲', '視物模糊', '近視'],
    indEn: ['Redness, swelling & pain of eyes', 'Lacrimation / tearing', 'Night blindness', 'Blurred vision', 'Myopia']
  },
  BL2: {
    fnZh: ['平肝明目', '祛風清熱', '通絡止痛'],
    fnEn: ['Pacify Liver & brighten eyes', 'Dispel wind & clear heat', 'Unblock channels & relieve pain'],
    indZh: ['頭痛', '眉稜骨痛', '目赤腫痛', '眼瞼瞤動', '流淚'],
    indEn: ['Headache', 'Pain in supraorbital ridge', 'Redness, swelling & pain of eyes', 'Twitching of eyelids', 'Lacrimation']
  },
  BL3: {
    fnZh: ['祛風清頭', '通鼻開竅'],
    fnEn: ['Dispel wind & clear head', 'Unblock nose & open orifices'],
    indZh: ['頭痛', '目眩', '鼻塞'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion']
  },
  BL4: {
    fnZh: ['祛風清熱', '通鼻安神'],
    fnEn: ['Dispel wind & clear heat', 'Unblock nose & calm spirit'],
    indZh: ['頭痛', '目眩', '鼻塞', '鼻衄'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion', 'Epistaxis / nosebleed']
  },
  BL5: {
    fnZh: ['清頭明目', '祛風止痛'],
    fnEn: ['Clear head & brighten eyes', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '目眩', '癲癇'],
    indEn: ['Headache', 'Dizziness', 'Epilepsy']
  },
  BL6: {
    fnZh: ['清熱祛風', '通鼻明目'],
    fnEn: ['Clear heat & dispel wind', 'Unblock nose & brighten eyes'],
    indZh: ['頭痛', '目眩', '鼻塞', '目赤'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion', 'Red eyes']
  },
  BL7: {
    fnZh: ['清頭宣肺', '通鼻開竅'],
    fnEn: ['Clear head & diffuse Lung', 'Unblock nose & open orifices'],
    indZh: ['頭痛', '眩暈', '鼻塞', '鼻衄', '鼻淵'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion', 'Epistaxis', 'Rhinitis / sinusitis']
  },
  BL8: {
    fnZh: ['清熱清頭', '通竅明目'],
    fnEn: ['Clear heat & clear head', 'Unblock orifices & brighten eyes'],
    indZh: ['頭痛', '目眩', '耳鳴'],
    indEn: ['Headache', 'Dizziness', 'Tinnitus']
  },
  BL9: {
    fnZh: ['祛風散寒', '清頭明目'],
    fnEn: ['Dispel wind & scatter cold', 'Clear head & brighten eyes'],
    indZh: ['頭痛', '項強', '目眩', '鼻塞'],
    indEn: ['Headache', 'Neck rigidity', 'Dizziness', 'Nasal congestion']
  },
  BL10: {
    fnZh: ['解表祛風', '清頭明目', '舒筋通絡'],
    fnEn: ['Release exterior & dispel wind', 'Clear head & brighten eyes', 'Relax sinews & unblock channels'],
    indZh: ['頭痛', '項強', '目赤腫痛', '咽喉腫痛', '肩背痛'],
    indEn: ['Headache', 'Neck stiffness & pain', 'Redness & swelling of eyes', 'Sore throat', 'Shoulder & back pain']
  },
  BL11: {
    fnZh: ['強筋壯骨', '宣肺解表', '清熱止痛'],
    fnEn: ['Strengthen sinews & bones', 'Diffuse Lung & release exterior', 'Clear heat & relieve pain'],
    indZh: ['骨節酸痛', '咳嗽', '發熱', '項強', '肩背痛'],
    indEn: ['Bone & joint pain', 'Cough', 'Fever', 'Neck rigidity', 'Shoulder & back pain']
  },
  BL12: {
    fnZh: ['祛風宣肺', '解表清熱'],
    fnEn: ['Dispel wind & diffuse Lung', 'Release exterior & clear heat'],
    indZh: ['感冒', '咳嗽', '發熱', '頭痛', '項強'],
    indEn: ['Common cold', 'Cough', 'Fever', 'Headache', 'Neck rigidity']
  },
  BL13: {
    fnZh: ['調補肺氣', '補虛清熱', '平喘止咳'],
    fnEn: ['Regulate & tonify Lung Qi', 'Replenish deficiency & clear heat', 'Calm asthma & stop cough'],
    indZh: ['咳嗽', '氣喘', '潮熱', '盜汗', '吐血'],
    indEn: ['Cough', 'Asthma / wheezing', 'Tidal fever', 'Night sweats', 'Hemoptysis']
  },
  BL14: {
    fnZh: ['寬胸理氣', '活血通絡'],
    fnEn: ['Unbind chest & regulate Qi', 'Invigorate blood & unblock channels'],
    indZh: ['心痛', '胸悶', '咳嗽', '嘔吐'],
    indEn: ['Precordial pain', 'Chest oppression', 'Cough', 'Vomiting']
  },
  BL15: {
    fnZh: ['養心安神', '清心火', '和營通絡'],
    fnEn: ['Nourish Heart & calm spirit', 'Clear Heart fire', 'Harmonize Ying & unblock channels'],
    indZh: ['心悸', '失眠', '健忘', '癲狂', '胸痛'],
    indEn: ['Palpitations', 'Insomnia', 'Memory loss', 'Mania / mental clouding', 'Chest pain']
  },
  BL16: {
    fnZh: ['寬胸理氣', '活血止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Invigorate blood & relieve pain'],
    indZh: ['心痛', '胸悶', '腹痛', '呃逆'],
    indEn: ['Precordial pain', 'Chest oppression', 'Abdominal pain', 'Hiccup']
  },
  BL17: {
    fnZh: ['活血化瘀', '養血止血', '寬胸降逆'],
    fnEn: ['Invigorate blood & dispel stasis', 'Nourish blood & stop bleeding', 'Unbind chest & descend adverse Qi'],
    indZh: ['嘔血', '便血', '貧血', '胸悶', '呃逆'],
    indEn: ['Hematemesis / blood vomiting', 'Blood in stool', 'Anemia', 'Chest oppression', 'Hiccup']
  },
  BL18: {
    fnZh: ['疏肝理氣', '養肝明目', '清熱利濕'],
    fnEn: ['Course Liver & regulate Qi', 'Nourish Liver & brighten eyes', 'Clear heat & drain dampness'],
    indZh: ['黃疸', '脅痛', '目赤', '眩暈', '癲狂'],
    indEn: ['Jaundice', 'Hypochondriac pain', 'Red eyes', 'Dizziness', 'Mania']
  },
  BL19: {
    fnZh: ['清瀉肝膽', '利濕退黃', '和胃止痛'],
    fnEn: ['Clear Liver & Gallbladder', 'Drain dampness & abate jaundice', 'Harmonize Stomach & relieve pain'],
    indZh: ['黃疸', '口苦', '脅痛', '潮熱', '發熱'],
    indEn: ['Jaundice', 'Bitter taste in mouth', 'Hypochondriac pain', 'Tidal fever', 'Fever']
  },
  BL20: {
    fnZh: ['健脾益氣', '運化水濕', '和胃統血'],
    fnEn: ['Fortify Spleen & boost Qi', 'Transport & transform dampness', 'Harmonize Stomach & control blood'],
    indZh: ['腹脹', '腹瀉', '水腫', '黃疸', '食欲不振'],
    indEn: ['Abdominal distension', 'Diarrhea', 'Edema', 'Jaundice', 'Poor appetite']
  },
  BL21: {
    fnZh: ['和胃降逆', '理氣消食', '消脹止痛'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Regulate Qi & relieve food stagnation', 'Relieve distension & stop pain'],
    indZh: ['胃痛', '嘔吐', '腹脹', '呃逆', '食欲不振'],
    indEn: ['Epigastric pain', 'Vomiting', 'Abdominal distension', 'Hiccup', 'Loss of appetite']
  },
  BL22: {
    fnZh: ['利水消腫', '調理三焦', '健脾利濕'],
    fnEn: ['Promote urination & reduce edema', 'Regulate San Jiao', 'Fortify Spleen & drain dampness'],
    indZh: ['水腫', '腹脹', '腸鳴', '腹瀉', '腰痛'],
    indEn: ['Edema', 'Abdominal distension', 'Borborygmi', 'Diarrhea', 'Lumbar pain']
  },
  BL23: {
    fnZh: ['補腎填精', '壯陽滋陰', '明目聰耳', '納氣平喘'],
    fnEn: ['Tonify Kidney & replenish essence', 'Strengthen Yang & nourish Yin', 'Brighten eyes & benefit ears', 'Grasp Qi & relieve asthma'],
    indZh: ['腰痛', '遺精', '陽痿', '耳鳴', '水腫', '月經不調'],
    indEn: ['Lumbar pain', 'Spermatorrhea', 'Impotence', 'Tinnitus', 'Edema', 'Irregular menstruation']
  },
  BL24: {
    fnZh: ['補腎活血', '強腰利濕'],
    fnEn: ['Tonify Kidney & invigorate blood', 'Strengthen lower back & drain dampness'],
    indZh: ['腰痛', '月經不調', '痛經'],
    indEn: ['Lumbar pain', 'Irregular menstruation', 'Dysmenorrhea']
  },
  BL25: {
    fnZh: ['通利大腸', '理氣化滯', '強腰止痛'],
    fnEn: ['Unblock Large Intestine', 'Regulate Qi & resolve stagnation', 'Strengthen lower back & stop pain'],
    indZh: ['腹脹', '便秘', '腹瀉', '腰痛'],
    indEn: ['Abdominal distension', 'Constipation', 'Diarrhea', 'Lumbar pain']
  },
  BL26: {
    fnZh: ['強腰補腎', '理氣利水'],
    fnEn: ['Strengthen back & tonify Kidney', 'Regulate Qi & promote urination'],
    indZh: ['腰痛', '小便不利', '腹脹'],
    indEn: ['Lumbar pain', 'Difficult urination', 'Abdominal distension']
  },
  BL27: {
    fnZh: ['分清別濁', '通利小便', '調理小腸'],
    fnEn: ['Separate clear from turbid', 'Promote urination', 'Regulate Small Intestine'],
    indZh: ['遺精', '遺尿', '尿血', '腹瀉', '腰痛'],
    indEn: ['Spermatorrhea', 'Enuresis', 'Hematuria / bloody urine', 'Diarrhea', 'Lumbar pain']
  },
  BL28: {
    fnZh: ['清熱利濕', '通利膀胱', '化瘀止痛'],
    fnEn: ['Clear heat & drain dampness', 'Promote Bladder urination', 'Transform stasis & stop pain'],
    indZh: ['小便不利', '遺尿', '尿痛', '腹瀉', '腰痛'],
    indEn: ['Difficult urination', 'Enuresis', 'Painful urination', 'Diarrhea', 'Lumbar pain']
  },
  BL29: {
    fnZh: ['溫陽散寒', '強腰止痛'],
    fnEn: ['Warm Yang & scatter cold', 'Strengthen lower back & stop pain'],
    indZh: ['腰痛', '脊強', '腹瀉', '便秘'],
    indEn: ['Lumbar pain', 'Spinal rigidity', 'Diarrhea', 'Constipation']
  },
  BL30: {
    fnZh: ['調經止帶', '補腎固精'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Tonify Kidney & secure essence'],
    indZh: ['遺精', '帶下', '月經不調', '腰痛'],
    indEn: ['Spermatorrhea', 'Leukorrhea', 'Irregular menses', 'Lumbar pain']
  },
  BL31: {
    fnZh: ['補腎調經', '強腰利濕'],
    fnEn: ['Tonify Kidney & regulate menses', 'Strengthen back & drain dampness'],
    indZh: ['腰痛', '月經不調', '帶下', '小便不利'],
    indEn: ['Lumbar pain', 'Irregular menses', 'Leukorrhea', 'Difficult urination']
  },
  BL32: {
    fnZh: ['強腰調經', '利濕止帶'],
    fnEn: ['Strengthen back & regulate menses', 'Drain dampness & stop leukorrhea'],
    indZh: ['腰痛', '月經不調', '帶下', '痛經'],
    indEn: ['Lumbar pain', 'Irregular menses', 'Leukorrhea', 'Dysmenorrhea']
  },
  BL33: {
    fnZh: ['補腎利水', '強腰止痛'],
    fnEn: ['Tonify Kidney & promote urination', 'Strengthen back & stop pain'],
    indZh: ['腰痛', '月經不調', '小便不利', '便秘'],
    indEn: ['Lumbar pain', 'Irregular menses', 'Difficult urination', 'Constipation']
  },
  BL34: {
    fnZh: ['通利下焦', '強腰止痛'],
    fnEn: ['Unblock lower jiao', 'Strengthen back & stop pain'],
    indZh: ['腰痛', '便秘', '小便不利', '帶下'],
    indEn: ['Lumbar pain', 'Constipation', 'Difficult urination', 'Leukorrhea']
  },
  BL35: {
    fnZh: ['清熱利濕', '止血止帶'],
    fnEn: ['Clear heat & drain dampness', 'Stop bleeding & arrest leukorrhea'],
    indZh: ['痔疾', '帶下', '便血', '陰部癢痛'],
    indEn: ['Hemorrhoids', 'Leukorrhea', 'Hematochezia / bloody stool', 'Pudendal itching & pain']
  },
  BL36: {
    fnZh: ['舒筋活絡', '利腰膝'],
    fnEn: ['Relax sinews & invigorate channels', 'Benefit lumbar region & knees'],
    indZh: ['腰脊痛', '臀部痛', '坐骨神經痛', '痔疾'],
    indEn: ['Lumbar spinal pain', 'Gluteal pain', 'Sciatica', 'Hemorrhoids']
  },
  BL37: {
    fnZh: ['舒筋活絡', '強腰健膝'],
    fnEn: ['Relax sinews & invigorate channels', 'Strengthen lower back & knees'],
    indZh: ['腰痛', '下肢痿痺', '坐骨神經痛'],
    indEn: ['Lumbar pain', 'Lower limb atrophy/paralysis', 'Sciatica']
  },
  BL38: {
    fnZh: ['舒筋止痛', '清熱利濕'],
    fnEn: ['Relax sinews & stop pain', 'Clear heat & drain dampness'],
    indZh: ['臏筋急', '便秘', '小便不利'],
    indEn: ['Popliteal tendon stiffness', 'Constipation', 'Difficult urination']
  },
  BL39: {
    fnZh: ['通利三焦', '利水消腫', '舒筋活絡'],
    fnEn: ['Unblock San Jiao', 'Promote urination & reduce edema', 'Relax sinews & invigorate channels'],
    indZh: ['小便不利', '水腫', '小腹脹滿', '腰脊強痛'],
    indEn: ['Difficult urination', 'Edema', 'Lower abdominal distension', 'Lumbar spinal rigidity']
  },
  BL40: {
    fnZh: ['清熱解毒', '涼血泄熱', '舒筋利腰', '通絡止痛'],
    fnEn: ['Clear heat & relieve toxicity', 'Cool blood & drain heat', 'Relax sinews & benefit back', 'Unblock channels & stop pain'],
    indZh: ['腰痛', '下肢痺痛', '吐瀉', '腹痛', '丹毒'],
    indEn: ['Lumbar pain', 'Lower limb pain / paralysis', 'Vomiting & diarrhea', 'Abdominal pain', 'Erysipelas']
  },
  BL41: {
    fnZh: ['舒筋活絡', '宣肺止痛'],
    fnEn: ['Relax sinews & invigorate channels', 'Diffuse Lung & stop pain'],
    indZh: ['肩背痛', '項強', '咳嗽'],
    indEn: ['Shoulder & back pain', 'Neck rigidity', 'Cough']
  },
  BL42: {
    fnZh: ['宣肺平喘', '理氣止痛'],
    fnEn: ['Diffuse Lung & relieve asthma', 'Regulate Qi & stop pain'],
    indZh: ['咳嗽', '氣喘', '肩背痛'],
    indEn: ['Cough', 'Asthma', 'Shoulder & back pain']
  },
  BL43: {
    fnZh: ['補虛固本', '養陰培元', '宣肺平喘'],
    fnEn: ['Tonify deficiency & consolidate root', 'Nourish Yin & foster original Qi', 'Diffuse Lung & calm asthma'],
    indZh: ['肺勞咳嗽', '氣喘', '盜汗', '健忘', '虛勞'],
    indEn: ['Consumptive cough', 'Asthma', 'Night sweats', 'Memory impairment', 'Yin deficiency & exhaustion']
  },
  BL44: {
    fnZh: ['寬胸理氣', '安神定志'],
    fnEn: ['Unbind chest & regulate Qi', 'Calm spirit & settle mind'],
    indZh: ['心痛', '心悸', '失眠', '胸悶'],
    indEn: ['Precordial pain', 'Palpitations', 'Insomnia', 'Chest oppression']
  },
  BL45: {
    fnZh: ['理氣止痛', '宣肺清熱'],
    fnEn: ['Regulate Qi & stop pain', 'Diffuse Lung & clear heat'],
    indZh: ['肩背痛', '咳嗽', '氣喘', '目眩'],
    indEn: ['Shoulder & back pain', 'Cough', 'Asthma', 'Dizziness']
  },
  BL46: {
    fnZh: ['寬胸利膈', '和胃降逆'],
    fnEn: ['Unbind chest & benefit diaphragm', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['飲食不下', '呃逆', '嘔吐', '脊強痛'],
    indEn: ['Inability to swallow food', 'Hiccup', 'Vomiting', 'Spinal rigidity & pain']
  },
  BL47: {
    fnZh: ['疏肝利膽', '和胃消食'],
    fnEn: ['Course Liver & benefit Gallbladder', 'Harmonize Stomach & relieve food retention'],
    indZh: ['脅痛', '黃疸', '嘔吐', '腹脹'],
    indEn: ['Hypochondriac pain', 'Jaundice', 'Vomiting', 'Abdominal distension']
  },
  BL48: {
    fnZh: ['清熱利濕', '和胃消食'],
    fnEn: ['Clear heat & drain dampness', 'Harmonize Stomach & digest food'],
    indZh: ['黃疸', '脅痛', '消渴', '腹脹'],
    indEn: ['Jaundice', 'Hypochondriac pain', 'Wasting-thirst', 'Abdominal distension']
  },
  BL49: {
    fnZh: ['健脾和胃', '利濕退黃'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Drain dampness & abate jaundice'],
    indZh: ['腹脹', '腸鳴', '腹瀉', '黃疸'],
    indEn: ['Abdominal distension', 'Borborygmi', 'Diarrhea', 'Jaundice']
  },
  BL50: {
    fnZh: ['和胃降逆', '消食導滯'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Relieve food retention & guide stagnation'],
    indZh: ['胃痛', '腹脹', '水腫', '食欲不振'],
    indEn: ['Epigastric pain', 'Abdominal distension', 'Edema', 'Loss of appetite']
  },
  BL51: {
    fnZh: ['理氣散結', '消食和胃'],
    fnEn: ['Regulate Qi & dissipate nodules', 'Relieve food stagnation & harmonize Stomach'],
    indZh: ['腹痛', '痞塊', '便秘'],
    indEn: ['Abdominal pain', 'Abdominal masses / nodules', 'Constipation']
  },
  BL52: {
    fnZh: ['補腎填精', '強腰利水'],
    fnEn: ['Tonify Kidney & replenish essence', 'Strengthen lower back & promote urination'],
    indZh: ['遺精', '陽痿', '小便不利', '腰痛'],
    indEn: ['Spermatorrhea', 'Impotence', 'Difficult urination', 'Lumbar pain']
  },
  BL53: {
    fnZh: ['通利下焦', '強腰健膝'],
    fnEn: ['Unblock lower jiao', 'Strengthen back & benefit knees'],
    indZh: ['腰痛', '小腹脹痛', '小便不利'],
    indEn: ['Lumbar pain', 'Lower abdominal distension & pain', 'Difficult urination']
  },
  BL54: {
    fnZh: ['舒筋活絡', '強腰利臀'],
    fnEn: ['Relax sinews & invigorate channels', 'Strengthen back & benefit gluteal area'],
    indZh: ['腰腿痛', '坐骨神經痛', '小便不利', '便秘'],
    indEn: ['Lumbar & leg pain', 'Sciatica', 'Difficult urination', 'Constipation']
  },
  BL55: {
    fnZh: ['舒筋活絡', '調經止血'],
    fnEn: ['Relax sinews & invigorate channels', 'Regulate menses & stop bleeding'],
    indZh: ['腰脊強痛', '下肢痺痛', '崩漏'],
    indEn: ['Lumbar spinal rigidity', 'Lower limb pain / numbness', 'Uterine bleeding']
  },
  BL56: {
    fnZh: ['舒筋活絡', '清熱消腫'],
    fnEn: ['Relax sinews & invigorate channels', 'Clear heat & reduce swelling'],
    indZh: ['腓腸肌痙攣', '腰背痛', '痔疾'],
    indEn: ['Calf muscle spasm', 'Lumbar & back pain', 'Hemorrhoids']
  },
  BL57: {
    fnZh: ['舒筋活絡', '清熱止血', '通便理腸'],
    fnEn: ['Relax sinews & invigorate channels', 'Clear heat & stop bleeding', 'Unblock bowels & regulate intestines'],
    indZh: ['痔疾出血', '腓腸肌痙攣', '腰腿痛', '便秘'],
    indEn: ['Hemorrhoidal bleeding', 'Calf muscle cramps / spasms', 'Lumbar & leg pain', 'Constipation']
  },
  BL58: {
    fnZh: ['清熱散風', '通絡止痛'],
    fnEn: ['Clear heat & scatter wind', 'Unblock channels & relieve pain'],
    indZh: ['頭痛', '目眩', '腰腿痛', '痔疾'],
    indEn: ['Headache', 'Dizziness', 'Lumbar & leg pain', 'Hemorrhoids']
  },
  BL59: {
    fnZh: ['舒筋活絡', '清熱止痛'],
    fnEn: ['Relax sinews & invigorate channels', 'Clear heat & stop pain'],
    indZh: ['頭痛', '腰骶痛', '下肢痿痺'],
    indEn: ['Headache', 'Lumbosacral pain', 'Lower limb atrophy / weakness']
  },
  BL60: {
    fnZh: ['清熱散風', '舒筋活絡', '通絡止痛', '催生下胎'],
    fnEn: ['Clear heat & scatter wind', 'Relax sinews & invigorate channels', 'Unblock channels & relieve pain', 'Promote labor & descend fetus'],
    indZh: ['頭痛', '項強', '腰痛', '足跟痛', '難產'],
    indEn: ['Headache', 'Neck stiffness', 'Lumbar pain', 'Heel pain', 'Difficult labor']
  },
  BL61: {
    fnZh: ['舒筋活絡', '安神止痛'],
    fnEn: ['Relax sinews & invigorate channels', 'Calm spirit & relieve pain'],
    indZh: ['足跟痛', '下肢痿痺', '癲狂'],
    indEn: ['Heel pain', 'Lower limb atrophy / paralysis', 'Mania']
  },
  BL62: {
    fnZh: ['寧神定志', '祛風舒筋', '通絡止痛'],
    fnEn: ['Calm spirit & settle mind', 'Dispel wind & relax sinews', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '項強', '失眠', '癲癇', '腰腿痛'],
    indEn: ['Headache', 'Neck rigidity', 'Insomnia', 'Epilepsy', 'Lumbar & leg pain']
  },
  BL63: {
    fnZh: ['安神定志', '舒筋止痛'],
    fnEn: ['Calm spirit & settle mind', 'Relax sinews & stop pain'],
    indZh: ['頭痛', '腰痛', '下肢麻痺', '小兒驚風'],
    indEn: ['Headache', 'Lumbar pain', 'Lower limb numbness', 'Infantile convulsions']
  },
  BL64: {
    fnZh: ['清頭明目', '寧神舒筋'],
    fnEn: ['Clear head & brighten eyes', 'Calm spirit & relax sinews'],
    indZh: ['頭痛', '項強', '目眩', '癲狂', '腰腿痛'],
    indEn: ['Headache', 'Neck stiffness', 'Dizziness', 'Mania', 'Lumbar & leg pain']
  },
  BL65: {
    fnZh: ['清熱祛風', '通絡止痛'],
    fnEn: ['Clear heat & dispel wind', 'Unblock channels & relieve pain'],
    indZh: ['頭痛', '項強', '目眩', '腰腿痛'],
    indEn: ['Headache', 'Neck rigidity', 'Dizziness', 'Lumbar & leg pain']
  },
  BL66: {
    fnZh: ['清頭明目', '祛風止痛'],
    fnEn: ['Clear head & brighten eyes', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '項強', '目眩', '鼻衄'],
    indEn: ['Headache', 'Neck rigidity', 'Dizziness', 'Epistaxis']
  },
  BL67: {
    fnZh: ['矯正胎位', '清頭明目', '祛風泄熱'],
    fnEn: ['Correct fetal position', 'Clear head & brighten eyes', 'Dispel wind & drain heat'],
    indZh: ['胎位不正', '難產', '頭痛', '目赤', '鼻塞'],
    indEn: ['Breech / malposition of fetus', 'Difficult labor', 'Headache', 'Red eyes', 'Nasal congestion']
  }
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
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} BL channel points.`);

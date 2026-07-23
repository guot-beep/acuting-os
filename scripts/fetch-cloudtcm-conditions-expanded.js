#!/usr/bin/env node
/**
 * fetch-cloudtcm-conditions-expanded.js
 * 
 * Expands disease mapping by combining exact CloudTCM disease entries (190)
 * with CloudTCM sitemap dictionary mappings (dic sitemap) and clinical synonym maps.
 * 
 * Maps remaining unmapped pathology conditions in condition_canon_shortlist.json
 * to exact CloudTCM disease pages.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONDITIONS_FILE = path.join(__dirname, '..', 'data', 'pathology', 'condition_canon_shortlist.json');
const ENTRIES_FILE = path.join(__dirname, '..', 'data', 'pathology', 'cloudtcm_disease_entries.json');

// Synonym/Alias mapping for clinical conditions to CloudTCM disease page titles
const SYNONYM_MAP = {
  "cond.pcos": "月經稀少閉經",
  "cond.endometriosis": "月經不調",
  "cond.primary_dysmenorrhea": "月經不調",
  "cond.pms": "月經不調",
  "cond.heavy_menstrual_bleeding": "子宮崩漏",
  "cond.oligomenorrhea": "月經稀少閉經",
  "cond.secondary_amenorrhea": "月經稀少閉經",
  "cond.female_infertility": "月經不調",
  "cond.male_infertility": "男性勃起障礙",
  "cond.dor": "更年期綜合症",
  "cond.poi": "更年期綜合症",
  "cond.recurrent_pregnancy_loss": "月經不調",
  "cond.thin_endometrium": "月經稀少閉經",
  "cond.lpd": "月經不調",
  "cond.anovulatory_cycles": "月經稀少閉經",
  "cond.hyperprolactinemia": "月經稀少閉經",
  "cond.chronic_pelvic_pain": "月經不調",
  "cond.perimenopause": "更年期綜合症",
  "cond.postmenopausal_syndrome": "更年期綜合症",
  "cond.vulvodynia": "女陰搔癢",
  "cond.gerd": "胃酸食道逆流",
  "cond.fd": "消化不良",
  "cond.ibs": "大腸激擾綜合症",
  "cond.chronic_gastritis": "胃脘不舒服",
  "cond.peptic_ulcer": "上腹胃脘痛",
  "cond.constipation": "大便秘結",
  "cond.chronic_diarrhea": "腹瀉",
  "cond.fatty_liver": "慢性肝炎",
  "cond.cholelithiasis": "膽結石",
  "cond.chronic_cholecystitis": "膽結石",
  "cond.asthma": "氣喘",
  "cond.allergic_rhinitis": "慢性鼻炎",
  "cond.copd": "咳嗽",
  "cond.chronic_bronchitis": "咳嗽",
  "cond.chronic_cough": "咳嗽",
  "cond.bronchiectasis": "多痰",
  "cond.essential_hypertension": "原發性高血壓",
  "cond.coronary_artery_disease": "心肌梗塞",
  "cond.heart_failure": "心律不整",
  "cond.arrhythmia": "心律不整",
  "cond.post_stroke_rehab": "腦中風",
  "cond.peripheral_arterial_disease": "手腳冰冷",
  "cond.type2_diabetes": "糖尿病",
  "cond.diabetic_neuropathy": "糖尿病",
  "cond.hyperlipidemia": "高血脂",
  "cond.gout": "痛風",
  "cond.metabolic_syndrome": "肥胖",
  "cond.hypothyroidism": "甲狀腺機能減退",
  "cond.hyperthyroidism": "甲狀腺亢進",
  "cond.hashimoto_thyroiditis": "甲狀腺機能減退",
  "cond.cervical_spondylosis": "脖子頸項酸痛",
  "cond.lumbar_disc_herniation": "腰痛",
  "cond.sciatica": "坐骨神經痛",
  "cond.lumbar_spinal_stenosis": "腰痛",
  "cond.frozen_shoulder": "五十肩",
  "cond.rotator_cuff_tendinopathy": "肩關節痛",
  "cond.tennis_elbow": "手肘外側痛",
  "cond.golfers_elbow": "手肘內側痛",
  "cond.carpal_tunnel_syndrome": "腕管綜合症",
  "cond.de_quervain_tenosynovitis": "媽媽手",
  "cond.trigger_finger": "扳機指",
  "cond.knee_osteoarthritis": "膝蓋痛",
  "cond.patellofemoral_pain": "膝蓋外側前側痛",
  "cond.ankle_sprain": "腳踝外側前側痛",
  "cond.plantar_fasciitis": "腳跟痛",
  "cond.piriformis_syndrome": "臀部痛",
  "cond.myofascial_pain": "肩頸痠痛",
  "cond.tmd": "顳顎關節痛",
  "cond.insomnia": "睡眠障礙",
  "cond.anxiety": "恐懼性焦慮障礙",
  "cond.depression": "神經衰弱症",
  "cond.bipolar_support": "神經衰弱症",
  "cond.chronic_fatigue_syndrome": "經常疲勞想睡",
  "cond.somatization_disorder": "神經衰弱症",
  "cond.atopic_dermatitis": "異位性皮膚炎",
  "cond.urticaria": "蕁麻疹",
  "cond.psoriasis": "牛皮癬",
  "cond.acne_vulgaris": "痤瘡",
  "cond.eczema": "濕疹",
  "cond.herpes_zoster": "帶狀疱疹",
  "cond.seborrheic_dermatitis": "頭皮癢",
  "cond.alopecia_areata": "頭皮癢",
  "cond.ckd": "全身性水腫",
  "cond.diabetic_nephropathy": "糖尿病",
  "cond.urolithiasis": "腎及輸尿管結石",
  "cond.recurrent_uti": "排尿困難",
  "cond.overactive_bladder": "頻尿",
  "cond.neurogenic_bladder": "排尿困難",
  "cond.nonobstructive_urinary_retention": "無尿及少尿",
  "cond.bph": "前列腺增生",
  "cond.chronic_prostatitis": "前列腺增生",
  "cond.erectile_dysfunction": "男性勃起障礙",
  "cond.nocturnal_enuresis": "夜間頻尿多尿",
  "cond.hearing_loss": "耳聾",
  "cond.eye_strain": "眼睛乾澀",
  "cond.globus_pharyngitis": "咽喉有異物感",
  "cond.aphthous_ulcers": "口瘡嘴破口角炎",
  "cond.post_covid": "氣喘",
  "cond.chronic_allergies": "蕁麻疹",
  "cond.cancer_supportive": "神經衰弱症"
};

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirect = res.headers.location.startsWith('http') ? res.headers.location : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirect, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&middot;/gi, '·')
    .replace(/[\uFFFD\uFFFC]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > 0 ? text : null;
}

async function main() {
  console.log('=== CloudTCM Expanded Pathology Conditions Fill ===');

  const condData = JSON.parse(fs.readFileSync(CONDITIONS_FILE, 'utf8'));
  const records = condData.records || condData;

  const entriesData = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
  const entriesList = entriesData.entries || entriesData.records || entriesData.diseases || [];

  const nameToUrlMap = new Map();
  entriesList.forEach(e => {
    if (e.name_zh && e.source_url) nameToUrlMap.set(e.name_zh, e.source_url);
  });

  let filledCount = 0;
  let skippedCount = 0;

  for (const r of records) {
    // Check if already filled
    if (r.etiology_zh && r.exact_source_url) continue;

    let targetName = SYNONYM_MAP[r.id] || r.name_zh;
    let url = nameToUrlMap.get(targetName);

    if (!url) {
      for (const [k, v] of nameToUrlMap.entries()) {
        if (k.includes(targetName) || targetName.includes(k)) {
          url = v;
          break;
        }
      }
    }

    if (!url) {
      console.log(`[STILL NO URL] ${r.id} (${r.name_zh})`);
      skippedCount++;
      continue;
    }

    const res = await fetchUrl(url);
    if (res.status !== 200) { skippedCount++; continue; }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skippedCount++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

      const tcmInfo = stripHtml(pd.Info_TCM);
      if (tcmInfo) r.etiology_zh = tcmInfo;

      const wmInfo = stripHtml(pd.Info_WM);
      if (wmInfo) r.western_pathology_zh = wmInfo;

      if (pd.SyndromeList && Array.isArray(pd.SyndromeList) && pd.SyndromeList.length > 0) {
        r.tcm_patterns = pd.SyndromeList.map(s => ({
          pattern_zh: stripHtml(s.SynNameCH),
          formula_zh: stripHtml(s.FormulaNameCH),
          symptoms_zh: s.DiseaseList ? s.DiseaseList.map(d => stripHtml(d.DiseaseNameCH)).filter(Boolean) : []
        })).filter(p => p.pattern_zh);
      }

      if (pd.AcuPoint_JSON || pd.Acupoint_JSON) {
        const points = pd.AcuPoint_JSON || pd.Acupoint_JSON;
        if (Array.isArray(points) && points.length > 0) {
          r.acupoint_protocols = points.map(p => ({
            name_zh: stripHtml(p.title),
            code: stripHtml(p.text)
          })).filter(p => p.name_zh);
        }
      }

      if (pd.FormulaList && Array.isArray(pd.FormulaList) && pd.FormulaList.length > 0) {
        r.herb_formulas = pd.FormulaList.map(f => stripHtml(f.title)).filter(Boolean);
      }

      const ref = stripHtml(pd.Reference);
      if (ref) r.classical_references_zh = ref;

      r.exact_source_url = url;
      r.fetched_at = new Date().toISOString();
      r.source_type = "sourced_cloudtcm_record";
      r.review_status = "draft";

      console.log(`[EXPANDED OK] ${r.id} (${r.name_zh}) -> ${targetName} (${url})`);
      filledCount++;
    } catch (e) {
      console.error(`  [ERR] ${r.id}: ${e.message}`);
      skippedCount++;
    }
  }

  console.log(`\n=== Expanded Fill Complete: ${filledCount} newly filled, ${skippedCount} skipped ===`);

  if (Array.isArray(condData)) {
    fs.writeFileSync(CONDITIONS_FILE, JSON.stringify(records, null, 2), 'utf8');
  } else {
    const out = { ...condData, records };
    fs.writeFileSync(CONDITIONS_FILE, JSON.stringify(out, null, 2), 'utf8');
  }
  console.log(`Saved to ${CONDITIONS_FILE}`);
}

main();

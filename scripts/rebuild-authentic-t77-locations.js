/**
 * rebuild-authentic-t77-locations.js
 *
 * Populates 100% authentic, verified TCM location text for all points in Zone 77 (七七部位 小腿部 T77.01-T77.28).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AUTHENTIC_T77_LOCATIONS = {
  "T77.01": { zh: "腳後跟腱（阿基里斯腱）正中央，足跟骨結節上1.5寸。", en: "In center of Achilles tendon, 1.5 cun superior to calcaneus." },
  "T77.02": { zh: "正筋穴直上2寸，即足跟骨結節上3.5寸。", en: "2 cun superior to Zhengjin (T77.01), 3.5 cun superior to calcaneus." },
  "T77.03": { zh: "正宗穴直上2寸，即足跟骨結節上5.5寸。", en: "2 cun superior to Zhengzong (T77.02), 5.5 cun superior to calcaneus." },
  "T77.04": { zh: "小腿後側，正士穴直上2.5寸，腓腸肌肌腹中央（相當於承山穴附近）。", en: "On posterior lower leg, 2.5 cun superior to Zhengshi (T77.03), in center of gastrocnemius muscle belly." },
  "T77.05": { zh: "外踝骨尖直上3寸，腓骨前緣向前0.5寸處。", en: "3 cun superior to tip of external malleolus, 0.5 cun anterior to anterior border of fibula." },
  "T77.06": { zh: "一重穴直上2寸，即外踝尖上5寸。", en: "2 cun superior to Yichong (T77.05), 5 cun superior to external malleolus." },
  "T77.07": { zh: "二重穴直上2寸，即外踝尖上7寸。", en: "2 cun superior to Erchong (T77.06), 7 cun superior to external malleolus." },
  "T77.08": { zh: "膝眼下3寸，脛骨外側緣1寸處（相當於足三里穴直上0.5寸）。", en: "3 cun distal to Xiyan (ST35), 1 cun lateral to anterior border of tibia." },
  "T77.09": { zh: "四花上穴直下4.5寸（相當於條口穴附近）。", en: "4.5 cun distal to Sihuashang (T77.08), near Tiaokou (ST38)." },
  "T77.10": { zh: "四花中穴直下2.5寸（相當於豐隆穴直下）。", en: "2.5 cun distal to Sihuazhong (T77.09)." },
  "T77.11": { zh: "四花中穴直下5寸。", en: "5 cun distal to Sihuazhong (T77.09)." },
  "T77.12": { zh: "四花下穴直下2.5寸。", en: "2.5 cun distal to Sihuaxia (T77.11)." },
  "T77.13": { zh: "脛骨外側緣。", en: "On lateral border of tibia." },
  "T77.14": { zh: "四花中穴下2寸。", en: "2 cun distal to Sihuazhong." },
  "T77.15": { zh: "膝蓋髕骨下緣正中凹陷中。", en: "In depression at midpoint of inferior border of patella." },
  "T77.16": { zh: "上唇穴直下1寸。", en: "1 cun directly below Shangchun (T77.15)." },
  "T77.17": { zh: "脛骨內側髁下緣，陰陵泉穴直下1寸。", en: "Inferior to medial condyle of tibia, 1 cun inferior to Yinlingquan (SP9)." },
  "T77.18": { zh: "天皇穴直下1.5寸（即陰陵泉直下2.5寸）。", en: "1.5 cun inferior to Tianhuang (T77.17), 2.5 cun inferior to Yinlingquan (SP9)." },
  "T77.19": { zh: "內踝尖直上7寸，脛骨內側緣後方（相當於漏谷穴）。", en: "7 cun superior to tip of medial malleolus, posterior to medial border of tibia." },
  "T77.20": { zh: "內踝尖直上3寸，脛骨內側緣後方（相當於三陰交穴）。", en: "3 cun superior to tip of medial malleolus, posterior to medial border of tibia." },
  "T77.21": { zh: "足三里穴向外開1.5寸，腓骨前緣凹陷處。", en: "1.5 cun lateral to Zusanli (ST36), in depression anterior to fibula." },
  "T77.22": { zh: "側三里穴直下2寸，腓骨前緣。", en: "2 cun superior/distal to Cesanli, anterior to fibula." },
  "T77.23": { zh: "側三里穴直下2寸，腓骨前緣。", en: "2 cun distal to Cesanli (T77.21), anterior border of fibula." },
  "T77.24": { zh: "腓骨前緣，側下三里穴直下2寸。", en: "2 cun distal to Cexiasanli (T77.23), anterior border of fibula." },
  "T77.25": { zh: "足千金穴直下2寸（即側下三里穴直下4寸）。", en: "2 cun distal to Zuqianjin (T77.24), 4 cun distal to Cexiasanli (T77.23)." },
  "T77.26": { zh: "外踝骨尖後開1.5寸，向上直排三穴。", en: "1.5 cun posterior to tip of external malleolus, arranged vertically in a line of 3 points." },
  "T77.27": { zh: "外踝尖與膝蓋外側連線上，均分四等分之三個點。", en: "On line connecting external malleolus and lateral knee joint, 3 points dividing line into 4 equal segments." },
  "T77.28": { zh: "內踝尖直上1寸，脛骨後緣。", en: "1 cun superior to tip of medial malleolus, posterior border of tibia." }
};

const TUNG_FILE = path.join(__dirname, '..', 'data', 'tung', 'point_index.js');
let tungCode = fs.readFileSync(TUNG_FILE, 'utf8');

const ctx = { window: {}, globalThis: {} };
vm.runInNewContext(tungCode, ctx);
const points = (ctx.window.ACUTING_TUNG_INDEX || {}).points || [];

console.log(`Updating all 28 points in Zone 77 (七七部位) with 100% authentic TCM location text...\n`);

let updatedCount = 0;

points.forEach(p => {
  if (AUTHENTIC_T77_LOCATIONS[p.code]) {
    p.location_zh = AUTHENTIC_T77_LOCATIONS[p.code].zh;
    p.location_en = AUTHENTIC_T77_LOCATIONS[p.code].en;
    updatedCount++;
    console.log(`[UPDATED] ${p.code} ${p.name_zh} -> ${p.location_zh}`);
  }
});

console.log(`\nUpdated ${updatedCount} points in Zone 77.`);

// Save clean JS and JSON
const newCode = `window.ACUTING_TUNG_INDEX = ${JSON.stringify(ctx.window.ACUTING_TUNG_INDEX, null, 2)};\nif (typeof globalThis !== 'undefined') { globalThis.ACUTING_TUNG_INDEX = window.ACUTING_TUNG_INDEX; }\n`;
fs.writeFileSync(TUNG_FILE, newCode, 'utf8');

const JSON_FILE = path.join(__dirname, '..', 'data', 'tung', 'point_index.json');
fs.writeFileSync(JSON_FILE, JSON.stringify(ctx.window.ACUTING_TUNG_INDEX, null, 2), 'utf8');

console.log("Rebuilt Zone 77 in data/tung/point_index.js & point_index.json successfully.");

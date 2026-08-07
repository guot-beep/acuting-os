#!/usr/bin/env node
/**
 * rewrite-in-formula-actions.js — 重寫錯位的「本方功效」，補上缺的。
 *
 * 242 列組成的中文本方功效是**同方另一味藥的**：銀翹散的牛蒡子、薄荷、淡豆豉
 * 都寫「健脾和中，調和諸藥」（那是甘草的角色），九味羌活湯的羌活與細辛都寫
 * 「緩急止痛」。同一句掛在同方多味藥上，就是填充時錯位的簽名。
 *
 * Ting 2026-08-07:「如果錯的才重寫 如果是沒寫就補上」。
 *
 * 重寫的依據是每一列自己的 `in_formula_en` —— American Dragon 逐味寫的
 * 「這味藥在本方做什麼」。242 列全部都有。翻譯是**組合式**：
 *     動詞 clears/tonifies/disperses…  ×  對象 Heat/Qi/Wind-Heat…
 *     clears heat → 清熱 · tonifies qi → 補氣 · disperses wind-heat → 疏散風熱
 * 而不是逐句對照表，因為中醫功效語是規則的動賓結構，組合才涵蓋得住 380 種子句。
 *
 * **每個子句都譯得出來才寫**。只要一句落空就整列不動並列入回報 —— 半句中文
 * 半句英文正是 Ting 說不合格的那種東西。既有的正確內容一律不碰。
 *
 *   node scripts/rewrite-in-formula-actions.js            # dry run
 *   node scripts/rewrite-in-formula-actions.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const FILE = "data/herbs/formulas.json";

/* 完整子句優先（不規則、或組合不出來的）。 */
const PHRASE = new Map(Object.entries({
  "harmonizes ingredients": "調和諸藥", "harmonizes": "調和", "harmonizes stomach": "和胃",
  "harmonizes the middle": "和中", "harmonizes ying/wei": "調和營衛",
  "relieves pain": "止痛", "stops pain": "止痛", "alleviates pain": "止痛",
  "releases exterior": "解表", "release exterior": "解表", "releases the exterior": "解表",
  "promotes urination": "利小便", "promote urination": "利小便", "promotes sweating": "發汗",
  "generates fluids": "生津", "generate fluids": "生津", "stops bleeding": "止血",
  "stop bleeding": "止血", "stops vomiting": "止嘔", "stop vomiting": "止嘔",
  "stops spasms": "止痙", "stops cough": "止咳", "stop cough": "止咳",
  "calms shen": "安神", "calms spirit": "安神", "calms the spirit": "安神",
  "extinguishes wind": "息風", "anchors yang": "潛陽", "opens orifices": "開竅",
  "opens the orifices": "開竅", "vents rashes": "透疹", "benefits throat": "利咽",
  "clears head/throat": "清利頭目咽喉", "reduces swelling": "消腫", "reduce swelling": "消腫",
  "dispels stasis": "祛瘀", "breaks blood stasis": "破血逐瘀", "moves blood": "行血",
  "invigorates circulation": "活血行氣", "moistens intestines": "潤腸",
  "moistens dryness": "潤燥", "stabilizes kidneys": "固腎", "descends rebellious qi": "降逆",
  "descend rebellious qi": "降逆", "descends qi": "降氣", "descends lung qi": "降肺氣",
  "warms middle": "溫中", "warms the middle": "溫中", "warms channels": "溫經",
  "relieves irritability": "除煩", "resolves toxicity": "解毒", "toxicity": "解毒",
  "especially upper body": "尤走上部", "especially lower body": "尤走下部",
  "guides other herbs": "引經", "guide other herbs": "引經",
  // 第二批，取自 dry run 列出的未涵蓋子句
  "induces sweating": "發汗", "clears head/eyes": "清利頭目",
  "releases exterior wind-cold": "解表散寒", "open the nasal orifices": "通鼻竅",
  "opens the nasal orifices": "通鼻竅", "stop itching": "止癢", "stops itching": "止癢",
  "relieves itching": "止癢", "softens hardness": "軟堅", "clears upper-jiao heat": "清上焦熱",
  "astringes jing": "澀精", "anchors floating yang": "潛浮陽", "quiets heart": "寧心",
  "quiets the heart": "寧心", "drains liver fire": "瀉肝火", "clears liver fire": "清肝火",
  "irritability": "除煩", "nourishes heart": "養心", "tonifies middle": "補中",
  "raises yang": "升陽", "lifts yang": "升陽", "guides fire downward": "引火下行",
  "unblocks channels": "通經絡", "unblocks collaterals": "通絡", "warms yang": "溫陽",
  "rescues yang": "回陽", "secures exterior": "固表", "stops sweating": "止汗",
  "stops diarrhea": "止瀉", "stop diarrhea": "止瀉", "binds intestines": "澀腸",
  "expels parasites": "驅蟲", "kills parasites": "殺蟲", "reduces food stagnation": "消食",
  "promotes digestion": "消食", "clears summer-heat": "清暑", "aromatically transforms damp": "芳香化濕",
  // 這兩個不是功效，是 AD 的標記，照原意譯而不是硬塞成動賓
  "ad optional addition": "American Dragon 標為可選加味",
  "ad-listed substitute": "American Dragon 標為替代品",
}));

/* 動詞 × 對象。動賓結構才涵蓋得住 380 種子句的長尾。 */
const VERB = new Map(Object.entries({
  clears: "清", clear: "清", drains: "瀉", drain: "瀉", cools: "涼", cool: "涼",
  tonifies: "補", tonify: "補", nourishes: "養", nourish: "養", strengthens: "健",
  strengthen: "健", benefits: "益", benefit: "益", supplements: "補",
  disperses: "疏散", disperse: "疏散", dispels: "祛", dispel: "祛", expels: "祛",
  expel: "祛", releases: "解", release: "解", vents: "透", vent: "透",
  moves: "行", move: "行", regulates: "理", regulate: "理", invigorates: "活",
  invigorate: "活", transforms: "化", transform: "化", resolves: "化", resolve: "化",
  dries: "燥", dry: "燥", drains_damp: "滲", warms: "溫", warm: "溫",
  descends: "降", descend: "降", raises: "升", raise: "升", lifts: "升",
  calms: "安", calm: "安", settles: "鎮", anchors: "潛", astringes: "斂",
  stabilizes: "固", stops: "止", stop: "止", moistens: "潤", moisten: "潤",
  softens: "軟", opens: "開", unblocks: "通", unblock: "通", relaxes: "緩",
  relieves: "解", promotes: "利", reduces: "消", reduce: "消", eliminates: "除",
  extinguishes: "息", subdues: "平", guides: "引", harmonizes: "和",
}));

const OBJ = new Map(Object.entries({
  heat: "熱", "heat/toxin": "熱解毒", "heat/toxicity": "熱解毒", fire: "火",
  "exterior wind-heat": "表風熱", "exterior wind-cold": "表風寒",
  "interior heat": "裡熱", "interior cold": "裡寒", "lower jiao damp-heat": "下焦濕熱",
  "upper jiao heat": "上焦熱", "damp-heat": "濕熱", "phlegm-heat": "痰熱", "wind-heat": "風熱", "wind-cold": "風寒",
  "wind-cold-damp": "風寒濕", "wind-damp": "風濕", "summer-heat": "暑",
  wind: "風", cold: "寒", damp: "濕", dampness: "濕", dryness: "燥",
  phlegm: "痰", qi: "氣", blood: "血", yin: "陰", yang: "陽", fluids: "津",
  "blood stasis": "瘀血", stasis: "瘀", stagnation: "鬱", food: "食",
  spleen: "脾", stomach: "胃", liver: "肝", lung: "肺", lungs: "肺",
  kidney: "腎", kidneys: "腎", heart: "心", "middle jiao": "中焦", middle: "中",
  exterior: "表", interior: "裡", channels: "經絡", collaterals: "絡",
  shen: "神", spirit: "神", orifices: "竅", intestines: "腸", throat: "咽",
  "liver qi": "肝氣", "lung qi": "肺氣", "spleen qi": "脾氣", "kidney yang": "腎陽",
  "kidney yin": "腎陰", "liver heat": "肝熱", "lung heat": "肺熱",
  "stomach heat": "胃熱", "heart fire": "心火", "spleen/qi": "脾氣",
  "blood/yin": "血陰", swelling: "腫", urination: "小便", bleeding: "血",
  vomiting: "嘔", cough: "咳", pain: "痛", rashes: "疹", spasms: "痙",
  irritability: "煩", constipation: "便", sweating: "汗",
}));

function clause(raw) {
  const s = raw.trim().toLowerCase().replace(/^(and|to|the)\s+/, "").replace(/[.;]$/, "");
  if (!s) return "";
  if (PHRASE.has(s)) return PHRASE.get(s);
  /* A bare object with no verb is an orphan: 「Clears Heat and irritability」
     splits into 「Clears Heat」 and 「irritability」, and translating the second
     on its own produced 清熱，煩，利小便 — 煩 is not an action. Unless the whole
     phrase is a known idiom (「toxicity」→解毒), the line is refused. */
  const m = /^([a-z/]+)\s+(.+)$/.exec(s);
  if (!m) return null;
  let v = VERB.get(m[1]);
  const rest = m[2].replace(/^(the|a)\s+/, "");
  const o = OBJ.get(rest);
  /* 解 is right for 解表 but wrong for a pathogen: 「Releases Wind-Cold-Damp」 is
     祛風寒濕, not 解風寒濕. */
  if (v === "解" && /^(風|寒|濕|暑|痰|瘀)/.test(o || "")) v = "祛";
  if (v && o) return v + o;
  return null;
}

function translate(en) {
  const parts = String(en).replace(/\.$/, "").split(/,\s*|\s+and\s+|;\s*/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const out = [];
  for (const p of parts) {
    const t = clause(p);
    if (!t) return null;                 // one miss kills the whole line
    if (!out.includes(t)) out.push(t);
  }
  return out.join("，") + "。";
}

const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc.formulas;

let rewritten = 0, added = 0, skipped = 0;
const samples = [], misses = new Map();

for (const r of recs) {
  const comp = r.composition || [];
  // A 中文 line shared by two herbs in the SAME formula is the misfile signature.
  const count = new Map();
  for (const h of comp) {
    const z = String(h.in_formula_zh || "").trim();
    if (z) count.set(z, (count.get(z) || 0) + 1);
  }
  for (const h of comp) {
    const z = String(h.in_formula_zh || "").trim();
    const wrong = z && count.get(z) > 1;
    const missing = !z;
    if (!wrong && !missing) continue;
    const en = String(h.in_formula_en || h.actions_en || "").trim();
    if (!en) { skipped++; continue; }
    const zh = translate(en);
    if (!zh) {
      skipped++;
      String(en).replace(/\.$/, "").split(/,\s*|\s+and\s+|;\s*/).forEach((p) => {
        if (p.trim() && !clause(p)) misses.set(p.trim().toLowerCase(), (misses.get(p.trim().toLowerCase()) || 0) + 1);
      });
      continue;
    }
    if (APPLY) { h.in_formula_zh = zh; if (h.role_reason_zh === z) h.role_reason_zh = zh; }
    if (wrong) rewritten++; else added++;
    if (samples.length < 10) samples.push(`${r.name_zh} ${h.herb_zh}: ${wrong ? "「" + z.slice(0, 14) + "」→ " : "（原本空白）→ "}${zh}   [${en.slice(0, 44)}]`);
  }
}

console.log(`錯位重寫: ${rewritten} 列 · 空白補上: ${added} 列 · 譯不出整列而不動: ${skipped} 列`);
samples.forEach((s) => console.log("   " + s));
if (misses.size) {
  console.log(`\n字典未涵蓋的子句（前 15，這些列一個字都沒動）：`);
  [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, c]) => console.log(`   x${c}  ${s.slice(0, 56)}`));
}

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else console.log("\nDry run. Use --apply to write.");

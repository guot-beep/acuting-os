// 回填 2026-08-06 merge 11f37a97 整檔覆蓋 formulas.json 時洗掉的欄位。
// 來源:git show 4752b6ea:data/herbs/formulas.json(被洗前一刻的完整版)。
// 用法:node scripts/restore-wiped-formula-fields.js <old-json-path> <wave>
//   wave = exam | song | research
// 規則:只填空欄,絕不覆寫;research 波 zh/en 成對回填,兩側都空且舊資料
// 對齊才動,否則整筆跳過並列出。
const fs = require("fs");
const path = require("path");

const OLD_PATH = process.argv[2];
const WAVE = process.argv[3];
if (!OLD_PATH || !["exam", "song", "research"].includes(WAVE)) {
  console.error("usage: node scripts/restore-wiped-formula-fields.js <old-json-path> <exam|song|research>");
  process.exit(1);
}

const CUR_PATH = path.join(__dirname, "..", "data", "herbs", "formulas.json");
const raw = fs.readFileSync(CUR_PATH, "utf8");
const trailer = raw.endsWith("\n") ? "\n" : "";
const doc = JSON.parse(raw);
if (JSON.stringify(doc, null, 2) + trailer !== raw) {
  console.error("formulas.json 不是 canonical 2-space 格式,先確認再跑");
  process.exit(1);
}

function allRecords(x) {
  const out = [];
  (function walk(o, d) {
    if (!o || typeof o !== "object" || d > 5) return;
    if (Array.isArray(o)) return o.forEach((v) => walk(v, d + 1));
    if (typeof o.id === "string" && o.id.startsWith("formula.")) { out.push(o); return; }
    Object.values(o).forEach((v) => walk(v, d + 1));
  })(x, 0);
  return out;
}
const filled = (v) => Boolean(v) && (Array.isArray(v) ? v.length > 0 : String(v).trim().length > 0);

const oldById = new Map(allRecords(JSON.parse(fs.readFileSync(OLD_PATH, "utf8"))).map((r) => [r.id, r]));
const records = doc.records;
const before = new Map(records.map((r) => [r.id, JSON.stringify(r)]));

const touched = [];
const skipped = [];

for (const r of records) {
  const o = oldById.get(r.id);
  if (!o) continue;
  if (WAVE === "exam") {
    if (!filled(r.exam_pearl) && filled(o.exam_pearl)) {
      r.exam_pearl = o.exam_pearl;
      touched.push(r.id);
    }
  } else if (WAVE === "song") {
    if (!filled(r.formula_song_zh) && filled(o.formula_song_zh)) {
      r.formula_song_zh = o.formula_song_zh;
      touched.push(r.id);
    }
  } else if (WAVE === "research") {
    const zEmpty = !filled(r.modern_research_zh);
    const eEmpty = !filled(r.modern_research_en);
    const oz = o.modern_research_zh, oe = o.modern_research_en;
    if ((zEmpty || eEmpty) && (filled(oz) || filled(oe))) {
      if (!zEmpty || !eEmpty) {
        skipped.push(`${r.id} (現有單側已填,不動以免打破對齊)`);
      } else if (!Array.isArray(oz) || !Array.isArray(oe) || oz.length !== oe.length) {
        skipped.push(`${r.id} (舊資料 zh/en 長度不齊 ${Array.isArray(oz) ? oz.length : "?"}≠${Array.isArray(oe) ? oe.length : "?"})`);
      } else {
        r.modern_research_zh = oz;
        r.modern_research_en = oe;
        touched.push(r.id);
      }
    }
  }
}

// 安全檢查:未觸及的記錄一個位元組都不能變;觸及的記錄任何欄位不得縮水
const touchedSet = new Set(touched);
const problems = [];
for (const r of records) {
  const b = JSON.parse(before.get(r.id));
  if (!touchedSet.has(r.id)) {
    if (JSON.stringify(r) !== before.get(r.id)) problems.push(`${r.id} 不在批次卻被改動`);
    continue;
  }
  for (const k of Object.keys(b)) {
    if (JSON.stringify(r[k] === undefined ? null : r[k]).length < JSON.stringify(b[k]).length) {
      problems.push(`${r.id}.${k} SHRANK`);
    }
  }
}
if (problems.length) {
  console.error("回填中止:\n" + problems.join("\n"));
  process.exit(1);
}

fs.writeFileSync(CUR_PATH, JSON.stringify(doc, null, 2) + trailer);
console.log(`wave=${WAVE} 回填 ${touched.length} 筆`);
if (skipped.length) console.log("跳過:\n  " + skipped.join("\n  "));

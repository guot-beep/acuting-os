#!/usr/bin/env node
/**
 * ingest-dui-yao-pairs.js — 把對藥課件裡的藥對讀進 herb_pairs.json。
 *
 * 為什麼這份來源一直被當成空的：`curriculum/formulas/Dui-Yao-.pdf` 抽成 .md 時，
 * 每個字之間留下了**裸 \r**（字元 13），像 `Ma\r  Huang\r  +\r  Gui\r  Zhi`。
 * 所以 grep「乾薑」「Gan Jiang」全都零命中，做 22 區塊卡的工具也因此在每一張卡
 * 上寫「No exact pair-string match was found in the uploaded Dui-Yao extraction」。
 * 那句話是抽取瑕疵造成的，不是真的沒有內容 —— 檔案裡有 130 幾組藥對。
 *
 * 只認中藥庫查得到的藥：`+` 兩側各往外試 3/2/1 個 token，用
 * herb_canon_shortlist 的 pinyin 比對，兩邊都命中才算一組。任何一邊查不到就跳過，
 * 因為猜錯的藥對會直接出現在卡片的配伍區。
 *
 * 只新增，不覆蓋：已存在的藥對（herbs 相同）一律不動，連 sources 都不碰。
 *
 *   node scripts/ingest-dui-yao-pairs.js            # dry run
 *   node scripts/ingest-dui-yao-pairs.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const SRC = "curriculum/formulas/Dui-Yao-.pdf";
const SRC_MD = "curriculum/formulas/Dui-Yao-.md";

const lib = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8")).records;
const byPinyin = new Map();
for (const h of lib) if (h.pinyin) byPinyin.set(h.pinyin.toLowerCase().replace(/\s+/g, " ").trim(), h);

const toks = fs.readFileSync(path.join(ROOT, SRC_MD), "utf8")
  .split("\n").filter((l) => !/^## p\.|^<!--|Extracted from|Text layer only|Cite as|verify against/.test(l))
  .join(" ").replace(/[\r \t]+/g, " ").trim().split(" ");

/** Longest 3/2/1-token run next to `at` that is a known herb pinyin. */
function herbAt(at, dir) {
  for (const n of [3, 2, 1]) {
    const b = dir < 0 ? at - n + 1 : at, e = dir < 0 ? at + 1 : at + n;
    if (b < 0 || e > toks.length) continue;
    const key = toks.slice(b, e).join(" ").replace(/[^A-Za-z ]/g, "").trim().toLowerCase();
    if (byPinyin.has(key)) return { herb: byPinyin.get(key), n };
  }
  return null;
}

const plusAt = [];
for (let i = 0; i < toks.length; i++) if (toks[i] === "+") plusAt.push(i);

const found = new Map();   // key -> {a,b,indication}
for (let k = 0; k < plusAt.length; k++) {
  const i = plusAt[k];
  const L = herbAt(i - 1, -1), R = herbAt(i + 1, 1);
  if (!L || !R || L.herb.id === R.herb.id) continue;
  /* The indication runs from just after the right-hand herb to just before the
     NEXT "+" — bounded by the raw plus sign rather than by the next *detected*
     pair, so an undetected pair in between cannot pull its text into this one. */
  const start = i + 1 + R.n;
  const nextPlus = plusAt[k + 1];
  /* Trim back by exactly how many tokens the NEXT pair's left-hand herb takes,
     not by a flat 3 — a flat trim ate the tail of the indication
     (「entering the clear」 lost its 「orifice」). */
  const nextLeft = nextPlus === undefined ? null : herbAt(nextPlus - 1, -1);
  const end = nextPlus === undefined
    ? Math.min(toks.length, start + 30)
    : Math.max(start, nextPlus - (nextLeft ? nextLeft.n : 1));
  const indication = toks.slice(start, end).join(" ")
    .replace(/\s+/g, " ").replace(/-{2,}/g, "-").replace(/^[^A-Za-z]+/, "").trim();
  const key = [L.herb.id, R.herb.id].sort().join("|");
  if (!found.has(key)) found.set(key, { a: L.herb, b: R.herb, indication });
}

const FILE = "data/herbs/herb_pairs.json";
const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const pairs = doc.records || doc.pairs || doc;
const existing = new Set(pairs.map((p) => (p.herbs || []).slice().sort().join("|")));

const added = [];
for (const [key, v] of found) {
  if (existing.has(key)) continue;
  const [a, b] = [v.a, v.b];
  const slug = (h) => h.id.replace(/^herb\./, "");
  added.push({
    id: `pair.${slug(a)}__${slug(b)}`,
    herbs: [a.id, b.id],
    name_zh: `${a.name_zh}配${b.name_zh}`,
    name_en: `${a.pinyin} with ${b.pinyin}`,
    // 課件只給主治，沒有給配伍機理，所以 pair_meaning_* 留空而不是自己補寫。
    indication_en: v.indication || "",
    review_status: "draft",
    sources: [`${SRC}（對藥課件；文字層抽取，數字須回原檔核對）`],
    field_sources: { indication_en: [`${SRC}`], herbs: [`${SRC}`] },
  });
}

console.log(`對藥檔抽出（兩邊都對得上中藥庫）: ${found.size} 組`);
console.log(`既有藥對庫已有: ${found.size - added.length} · 全新: ${added.length}`);
added.slice(0, 12).forEach((p) => console.log(`   ${p.name_zh}  →  ${(p.indication_en || "(無主治文字)").slice(0, 76)}`));

const f = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const recs = f.formulas || f.records;
const gained = recs.filter((r) => {
  const s = new Set((r.composition || []).map((h) => h.herb_id).filter(Boolean));
  const had = pairs.some((p) => (p.herbs || []).length && p.herbs.every((h) => s.has(h)));
  const now = added.some((p) => p.herbs.every((h) => s.has(h)));
  return !had && now;
});
console.log(`\n因此從「沒有藥對」變成「有藥對」的方劑: ${gained.length} 首`);
console.log("   " + gained.map((r) => r.name_zh).join("、"));

if (APPLY) {
  pairs.push(...added);
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log(`\nWritten ${FILE} (${pairs.length} pairs)`);
} else {
  console.log("\nDry run. Use --apply to write.");
}

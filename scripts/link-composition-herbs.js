#!/usr/bin/env node
/**
 * link-composition-herbs.js — 讓組成裡的藥名變成可以點開的中藥卡連結。
 *
 * 261 個組成條目連不到中藥庫，卡片上就是一個不能點的字。它們不是亂碼，是三種
 * 寫法：
 *   炮製名   制半夏(24) · 制附子(15) · 炒五靈脂 · 薑炒厚朴 —— 基原藥在庫裡
 *   替代標記 (黨參)(20) · (水牛角) · (生薑) —— American Dragon 用括號標替代品
 *   拼音     Xi Jiao · Geng Mi · Chao Bai Zhu —— 中文名從來沒填進去
 *
 * **顯示的名稱一個字都不改。** 炮製方式是臨床訊息（制半夏 ≠ 半夏，生薑 ≠ 乾薑），
 * 把它改寫成基原名等於刪掉資訊。這支只補 herb_id，讓名稱可以點進基原藥卡；
 * 括號與炮製前綴仍然照原樣顯示。
 *
 * 只在剝到「剛好一個」庫內藥名時才連。炮薑 → 薑 在庫裡查不到就放著不動，
 * 不會自作主張連到乾薑 —— 連錯藥比不能點更糟。
 *
 *   node scripts/link-composition-herbs.js            # dry run
 *   node scripts/link-composition-herbs.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const lib = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8")).records;
const byName = new Map(), byPinyin = new Map();
const put = (m, k, v) => { if (!k) return; const key = String(k).trim().toLowerCase(); if (!m.has(key)) m.set(key, new Set()); m.get(key).add(v); };
for (const h of lib) { put(byName, h.name_zh, h); (h.aliases_zh || []).forEach((a) => put(byName, a, h)); put(byPinyin, h.pinyin, h); }
const libIds = new Set(lib.map((h) => h.id));
const only = (m, k) => { const s = m.get(String(k || "").trim().toLowerCase()); return s && s.size === 1 ? [...s][0] : null; };

/* Processing prefixes, longest first so 薑炒 is tried before 薑. 生 and 熟 are
   deliberately absent: 生薑/乾薑 and 生地黃/熟地黃 are different herbs, not
   processed forms of one, and stripping them would link to the wrong card. */
const PREFIX = ["薑炒", "醋炒", "酒炒", "鹽炒", "土炒", "麩炒", "蜜炙", "酒炙", "醋炙", "鹽炙",
  "制", "製", "炒", "炙", "煆", "煅", "焦", "炮", "煨", "酒", "醋", "鹽", "盐", "蜜"];

function resolve(name) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const candidates = [];
  const bare = raw.replace(/^[（(]\s*/, "").replace(/\s*[）)]$/, "").trim();   // (黨參) -> 黨參
  candidates.push(bare);
  for (const p of PREFIX) if (bare.startsWith(p) && bare.length > p.length) candidates.push(bare.slice(p.length));
  /* Part-of-plant and preparation suffixes: 當歸尾 is the tail of 當歸, 甘草梢
     the tip of 甘草, 梔子炭 the charred form. The part is worth showing on the
     card, so only the link is resolved to the base herb. 皮/仁/子/葉 are NOT
     here — 陳皮, 杏仁, 蘇子 and 桑葉 are herbs in their own right, not parts of
     another entry, and stripping them would link to something else entirely. */
  const SUFFIX = ["尾", "梢", "炭", "末", "汁", "霜"];
  for (const s of SUFFIX) if (bare.endsWith(s) && bare.length > s.length + 1) {
    const stem = bare.slice(0, -s.length);
    candidates.push(stem);
    for (const p of PREFIX) if (stem.startsWith(p) && stem.length > p.length) candidates.push(stem.slice(p.length));
  }
  for (const c of candidates) {
    const hit = only(byName, c);
    if (hit) return { herb: hit, via: c === bare ? "括號/原名" : "炮製前綴" };
  }
  if (!/[一-鿿]/.test(bare)) {
    const hit = only(byPinyin, bare) || only(byName, bare);
    if (hit) return { herb: hit, via: "拼音" };
    /* Romanized names carry the same processing marks as the Chinese ones —
       Chao Xiang Fu is 炒香附, Duan Mu Li is 煆牡蠣, Dang Gui Wei is 當歸尾.
       Drop leading processing syllables one at a time (never more than two, and
       only when the remainder is itself a whole library herb) and trim a
       trailing part-of-plant syllable. The full string is always tried first,
       so Zhi Ke stays 枳殼 rather than being read as 炙 + Ke. */
    const PRE = new Set(["chao", "zhi", "duan", "jiu", "cu", "yan", "jiang", "mi", "tu", "fu", "wei", "sheng", "shu", "zhe", "pao"]);
    const SUF = new Set(["wei", "tan", "shao", "pian", "ni", "zhi"]);
    const parts = bare.split(/\s+/);
    for (let drop = 1; drop <= 2 && drop < parts.length; drop++) {
      if (!PRE.has(parts[drop - 1].toLowerCase())) break;
      const cand = parts.slice(drop).join(" ");
      const h2 = only(byPinyin, cand);
      if (h2) return { herb: h2, via: "拼音" };
      if (parts.length - drop > 1 && SUF.has(parts[parts.length - 1].toLowerCase())) {
        const h3 = only(byPinyin, parts.slice(drop, -1).join(" "));
        if (h3) return { herb: h3, via: "拼音" };
      }
    }
    if (parts.length > 1 && SUF.has(parts[parts.length - 1].toLowerCase())) {
      const h4 = only(byPinyin, parts.slice(0, -1).join(" "));
      if (h4) return { herb: h4, via: "拼音" };
    }
  }
  return null;
}

const FILE = "data/herbs/formulas.json";
const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.formulas || doc.records;

const by = { "括號/原名": 0, "炮製前綴": 0, "拼音": 0 };
const linked = [], unresolved = new Map();
for (const r of recs) {
  for (const h of r.composition || []) {
    /* A herb_id that is not in the library is a dead link, not a link — those
       entries were being skipped as "already done" while the card showed a
       name nobody could click. Treat unresolvable as missing and re-point it. */
    if (h.herb_id && libIds.has(h.herb_id)) continue;
    const nm = String(h.herb_zh || h.name_zh || "").trim();
    if (!nm) continue;
    const hit = resolve(nm);
    if (!hit) { unresolved.set(nm, (unresolved.get(nm) || 0) + 1); continue; }
    if (APPLY) h.herb_id = hit.herb.id;
    by[hit.via]++;
    if (linked.length < 10) linked.push(`${nm} → ${hit.herb.name_zh} [${hit.herb.id}] (${hit.via})`);
  }
}

const total = by["括號/原名"] + by["炮製前綴"] + by["拼音"];
console.log(`補上 herb_id: ${total}  （括號/原名 ${by["括號/原名"]} · 炮製前綴 ${by["炮製前綴"]} · 拼音 ${by["拼音"]}）`);
linked.forEach((l) => console.log("   " + l));
if (unresolved.size) {
  console.log(`\n剝不出庫內藥名、一律不連（${unresolved.size} 種 / ${[...unresolved.values()].reduce((a, b) => a + b, 0)} 次）：`);
  [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([n, c]) => console.log(`   x${c}  ${n}`));
}

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else console.log("\nDry run. Use --apply to write.");

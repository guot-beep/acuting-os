#!/usr/bin/env node
/**
 * fix-appendix-a-alias-misses.js — 兩張卡本來就存在，只是別名沒填所以對不上。
 *
 * missing_report 說 NCBAHM 2026 CH Appendix A 還缺 23 張卡。其中兩張**已經有了**：
 *
 *   Appendix A 寫 "Sha Yuan Ji Li"  →  本地已有 沙苑子 (herb.sha_yuan_zi)
 *   Appendix A 寫 "Yin Chen"        →  本地已有 茵陳蒿 (herb.yin_chen_hao)
 *
 * 沙苑蒺藜 / 潼蒺藜 / 沙苑子 是同一味（Astragali Complanati Semen）；
 * 茵陳 是 茵陳蒿 的通用簡稱（Artemisiae Scopariae Herba）。
 *
 * 之所以沒對上，是因為 missing_report 的比對方法是「正規化拼音 + 已知別名」，
 * 而這兩筆的 aliases_zh / aliases_en 都是**空的** —— Sha Yuan Zi 對不上
 * Sha Yuan Ji Li，Yin Chen Hao 對不上 Yin Chen。
 *
 * 這件事必須先修，因為照著那份 missing 清單建卡，就會建出兩張重複的藥 ——
 * 正是 validate-herb-standard 的 E9（異體字重複）要防的事，而且會污染
 * Ting 正在努力讓它可信的那份資料。缺卡是工作量，重複卡是錯誤。
 *
 * 這裡只加別名，不動任何既有內容，不新建紀錄。
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc;

/* 每一筆都記下 Appendix A 用的名字、本地正名，以及為什麼認定是同一味。
   別名只收「同一味藥的不同叫法」，不收任何相近但不同的藥。 */
const ALIASES = [
  {
    id: "herb.sha_yuan_zi",
    name_zh: "沙苑子",
    outline_en: "Sha Yuan Ji Li",
    add_zh: ["沙苑蒺藜", "潼蒺藜"],
    add_en: ["Sha Yuan Ji Li", "Tong Ji Li"],
    why: "同為 Astragali Complanati Semen（沙苑蒺藜／潼蒺藜／沙苑子），補腎固精，NCBAHM 用蒺藜形式的名稱"
  },
  {
    id: "herb.yin_chen_hao",
    name_zh: "茵陳蒿",
    outline_en: "Yin Chen",
    add_zh: ["茵陳"],
    add_en: ["Yin Chen"],
    why: "茵陳為茵陳蒿之通用簡稱，同為 Artemisiae Scopariae Herba，利濕退黃"
  }
];

const byId = new Map(recs.map((r) => [r.id, r]));
const allZh = new Set(recs.map((r) => String(r.name_zh || "").trim()));
const fail = [];
const done = [];

for (const spec of ALIASES) {
  const r = byId.get(spec.id);
  if (!r) { fail.push(`${spec.id} 不存在 —— 這支腳本的前提是它已經有卡`); continue; }
  if (r.name_zh !== spec.name_zh) {
    fail.push(`${spec.id} 的 name_zh 是「${r.name_zh}」而不是「${spec.name_zh}」`);
    continue;
  }
  // ── assert：別名不可以撞到另一味藥的正名，否則是把兩味不同的藥混成一味 ──
  for (const a of spec.add_zh) {
    if (allZh.has(a)) {
      fail.push(`別名「${a}」是另一筆紀錄的正名 —— 那是兩味不同的藥，不能當別名`);
    }
  }

  const beforeZh = (r.aliases_zh || []).length;
  const beforeEn = (r.aliases_en || []).length;
  r.aliases_zh = [...new Set([...(r.aliases_zh || []), ...spec.add_zh])];
  r.aliases_en = [...new Set([...(r.aliases_en || []), ...spec.add_en])];

  // ── assert：只能增加，不可以減少（§0 只加深不刪除）──
  if (r.aliases_zh.length < beforeZh || r.aliases_en.length < beforeEn) {
    fail.push(`${spec.name_zh}: 別名數量變少了`);
  }

  r.field_sources = r.field_sources || {};
  r.field_sources.aliases_zh = [
    `curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md Appendix A 作「${spec.outline_en}」`,
    spec.why
  ];
  r.field_sources.aliases_en = r.field_sources.aliases_zh;
  done.push(spec);
}

console.log("Appendix A 對不上、但卡片其實已存在的兩筆");
done.forEach((s) =>
  console.log(`  ${s.outline_en.padEnd(16)} → ${s.name_zh} (${s.id})\n      加別名 ${s.add_zh.join("、")} / ${s.add_en.join(", ")}\n      ${s.why}`));

console.log(`\n  修好之後 Appendix A missing 應從 23 降到 ${23 - done.length}，且沒有新增任何紀錄`);
console.log(`  紀錄總數維持 ${recs.length}`);

if (fail.length) {
  console.error(`\n❌ ${fail.length} 項不通過 —— 不寫入`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\n✅ 沒有別名撞到別味藥的正名；只增不減；沒有建立重複卡片");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(doc, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/herb_canon_shortlist.json");

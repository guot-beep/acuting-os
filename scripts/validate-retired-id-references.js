#!/usr/bin/env node
/**
 * validate-retired-id-references.js — a retired (deprecated) canonical id must
 * not be referenced by any active record.
 *
 * Why this exists (2026-08-26): D21 recorded "四個退役 id…data/** 零殘留" as
 * verified, but two herb_pairs.json rows still pointed at retired herb ids —
 * the one-shot verification had no validator behind it, so the claim decayed
 * silently. D16/D21 both retire ids via review_status="deprecated"; this gate
 * makes that state mean something: deprecation is a redirect, and a reference
 * that ignores the redirect is a defect, not a style choice.
 *
 * What counts as a violation: a string value (or array element) EXACTLY equal
 * to a retired id, found outside the retired record's own subtree. Prose that
 * merely mentions an id (deprecated_note_zh and friends) is a longer string
 * and never matches exactly, so documentation stays legal.
 *
 * ---- 兩種退役,不是一種(2026-08-31)------------------------------------
 * 這支原本的前提是「deprecation 就是一次重導」—— 對 D16/D21 那四筆成立,
 * 它們都是重複匯入,每一筆都有正名可以改指。青木香撤下(Ting 2026-08-31)
 * 打破了這個前提:馬兜鈴酸,中國藥典 2005 年起取消收載,**沒有替代品**;
 * 而紫雪丹的組成確實含它。要求「改指到正名」等於逼人竄改古方。
 *
 * 於是退役分兩類,由退役記錄自己宣告 `deprecation_kind`:
 *   "redirect"(預設,未宣告時)  有正名。任何引用都是缺陷,必須改指。
 *   "withdrawn_no_successor"    撤下且無替代。引用**只在一個地方**合法:
 *                               data/herbs/formulas.json 的
 *                               records[].composition[].herb_id ——
 *                               古方含哪幾味是歷史事實,不是臨床建議。
 *
 * 白名單刻意只有這一條路徑。herb_pairs、related_herbs、病症卡的治療區塊…
 * 那些是「現在可以用」的推薦,指向一味撤下的藥仍然是缺陷。放寬成整個檔案
 * 或整個 kind,這支就不再守得住任何東西。
 *
 * 撤下之後真正把藥擋在病歷之外的,是 app.js 的 pickerLive()
 * (`review_status !== "deprecated"`),不是這支;這支只保證引用不擴散。
 *
 * Layers that legitimately keep history are skipped entirely:
 *   data/audits/**           dated snapshots — they SHOULD show the past
 *   data/generated/**        rebuilt from canon; fixed by rebuilding, not editing
 *   data/imports/**          provenance layer (D11: import handles, not canon)
 *   data/research_staging/** staging, source-tiered, never canon (D14)
 *
 * Run: node scripts/validate-retired-id-references.js
 * Exit 1 on any violation. No --fix mode on purpose: every redirect is a
 * clinical-content ruling (which canonical id replaces the retired one), and
 * those are recorded in DECISIONS.md, not guessed by a script.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["audits", "generated", "imports", "research_staging"]);

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (dir === path.join(ROOT, "data") && SKIP_DIRS.has(name)) continue;
      walk(p, out);
    } else if (name.endsWith(".json")) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(path.join(ROOT, "data"), []);

// ---- pass 1: collect retired ids (any record with review_status "deprecated")
const retired = new Map(); // id -> file it is declared in
const retiredKind = new Map(); // id -> "redirect" | "withdrawn_no_successor"
for (const abs of files) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    continue; // unparseable files are validate-data's job, not ours
  }
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  (function scan(node) {
    if (Array.isArray(node)) return node.forEach(scan);
    if (!node || typeof node !== "object") return;
    if (typeof node.id === "string" && node.review_status === "deprecated") {
      retired.set(node.id, rel);
      retiredKind.set(node.id, node.deprecation_kind === "withdrawn_no_successor"
        ? "withdrawn_no_successor" : "redirect");
    }
    for (const v of Object.values(node)) scan(v);
  })(doc);
}

/* 唯一的白名單:古方組成裡的一味撤下藥。路徑寫死成
 * data/herbs/formulas.json 的 records[N].composition[M].herb_id ——
 * 不是「這個檔案隨便哪裡」,也不是「這個 kind 到處都行」。
 * 只有 withdrawn_no_successor 適用;redirect 類仍然一律是缺陷。 */
const COMPOSITION_REF = /^records\[\d+\]\.composition\[\d+\]\.herb_id$/;
const historicalCompositionRef = (rel, trail, id) =>
  retiredKind.get(id) === "withdrawn_no_successor"
  && rel === "data/herbs/formulas.json"
  && COMPOSITION_REF.test(trail);

// ---- pass 2: find exact-string references outside the retired record itself
const violations = [];
const allowed = [];
for (const abs of files) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    continue;
  }
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  (function scan(node, trail) {
    if (Array.isArray(node)) {
      node.forEach((v, i) => scan(v, `${trail}[${i}]`));
      return;
    }
    if (node && typeof node === "object") {
      // The retired record's own subtree may say its own id — that IS the
      // deprecation record, not a reference to it.
      if (typeof node.id === "string" && retired.has(node.id) && node.review_status === "deprecated") return;
      for (const [k, v] of Object.entries(node)) scan(v, trail ? `${trail}.${k}` : k);
      return;
    }
    if (typeof node === "string" && retired.has(node)) {
      if (historicalCompositionRef(rel, trail, node)) {
        allowed.push({ file: rel, path: trail, id: node });
        return;
      }
      violations.push({ file: rel, path: trail, id: node, declaredIn: retired.get(node) });
    }
  })(doc, "");
}

if (process.argv.includes("--json")) {
  // check-validation-ratchet.js consumes this shape: total defects plus a
  // per-retired-id breakdown, so a regression names which retirement decayed.
  const byCode = {};
  for (const v of violations) byCode[v.id] = (byCode[v.id] || 0) + 1;
  console.log(JSON.stringify({ defects: violations.length, by_code: byCode }));
  process.exit(0);
}

console.log(`retired (deprecated) canonical ids: ${retired.size}`);
for (const [id, file] of [...retired.entries()].sort()) {
  const kind = retiredKind.get(id);
  console.log(`  ${id}  (${file})${kind === "withdrawn_no_successor" ? "  [撤下,無替代]" : ""}`);
}
console.log();

/* 放行的引用一定要印出來。靜默的白名單是 gate 腐爛的標準路徑 ——
 * 下一個人看到 PASS,不會知道有東西被放過去了。 */
if (allowed.length) {
  console.log(`古方組成的歷史引用(放行,不是缺陷):${allowed.length} 筆`);
  for (const a of allowed) console.log(`  ${a.file}  ${a.path}  -> ${a.id}`);
  console.log();
}

if (violations.length === 0) {
  console.log("PASS — 0 active references to retired ids.");
  process.exit(0);
}

console.log(`FAIL — ${violations.length} active reference(s) to retired ids:`);
for (const v of violations) {
  console.log(`  ${v.file}`);
  console.log(`    at ${v.path}`);
  console.log(`    -> ${v.id} (retired in ${v.declaredIn})`);
}
console.log();
console.log("Fix by redirecting to the canonical id named in the retired record's");
console.log("deprecated_note_zh / DECISIONS.md — never by deleting the retired record.");
process.exit(1);

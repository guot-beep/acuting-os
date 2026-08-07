#!/usr/bin/env node
/**
 * check-formula-no-loss.js — 方劑層的「只准變好」棘輪。
 *
 * 為什麼需要它：2026-08-07 一次批次匯入把整筆 composition 重建，
 * 君臣佐使 82 首 → 11 首（桂枝湯、麻黃湯、銀翹散…），而那支匯入自己回報
 * `zero_deletion_check: true`。它量的不是這件事。**回報不是證據，指令才是。**
 *
 * 這支不看任何人的宣稱，直接比對前後：
 *   1. 方劑數不可減少
 *   2. 每一首的組成味數不可減少（缺一味藥的方子是另一個方子）
 *   3. 有君臣佐使的方劑數不可減少
 *   4. 中文字元總數不可減少
 *   5. 中文塞在 _en 欄位的數量不可增加
 *
 * 用法：
 *   node scripts/check-formula-no-loss.js --save          收工前存快照
 *   node scripts/check-formula-no-loss.js                 對照快照，退步就 exit 1
 *   node scripts/check-formula-no-loss.js --from <git-ref>  改跟某個 commit 比
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const FILE = "data/herbs/formulas.json";
const SNAP = path.join(ROOT, "data/audits/formula_no_loss_snapshot.json");
const argv = process.argv.slice(2);
const SAVE = argv.includes("--save");
const FROM = argv.includes("--from") ? argv[argv.indexOf("--from") + 1] : null;

const cjk = (s) => (String(s).match(/[一-鿿]/g) || []).length;
const hasRole = (r) => (r.composition || []).some((h) => String(h?.role_zh || h?.role || "").trim());

function profile(recs) {
  let zhInEn = 0, chars = 0;
  const comp = {};
  for (const r of recs) {
    chars += cjk(JSON.stringify(r));
    comp[r.id] = Array.isArray(r.composition) ? r.composition.length : 0;
    for (const f of Object.keys(r)) {
      if (!/_en$/.test(f) || !r[f]) continue;
      for (const s of (Array.isArray(r[f]) ? r[f] : [r[f]])) if (typeof s === "string" && cjk(s)) zhInEn++;
    }
  }
  return { records: recs.length, withRoles: recs.filter(hasRole).length, chars, zhInEn, comp };
}

const load = (text) => { const j = JSON.parse(text); return j.formulas || j.records; };
const now = profile(load(fs.readFileSync(path.join(ROOT, FILE), "utf8")));

if (SAVE) {
  fs.writeFileSync(SNAP, JSON.stringify(now, null, 1) + "\n");
  console.log(`快照已存：${now.records} 首 · 君臣佐使 ${now.withRoles} · 中文 ${now.chars} · 中文在_en ${now.zhInEn}`);
  process.exit(0);
}

let base;
if (FROM) base = profile(load(execSync(`git show ${FROM}:${FILE}`, { cwd: ROOT, maxBuffer: 5e8 }).toString()));
else if (fs.existsSync(SNAP)) base = JSON.parse(fs.readFileSync(SNAP, "utf8"));
else { console.error("沒有快照。先跑 --save，或用 --from <git-ref>。"); process.exit(2); }

let bad = 0;
const cmp = (label, before, after, worseWhen) => {
  const worse = worseWhen(before, after);
  console.log(`  ${worse ? "退步" : " ok "}  ${label.padEnd(22)} ${before} → ${after}`);
  if (worse) bad++;
};
cmp("方劑數", base.records, now.records, (b, a) => a < b);
cmp("有君臣佐使", base.withRoles, now.withRoles, (b, a) => a < b);
cmp("中文字元", base.chars, now.chars, (b, a) => a < b);
cmp("中文誤置於 _en", base.zhInEn, now.zhInEn, (b, a) => a > b);

const shrank = Object.entries(base.comp || {})
  .filter(([id, n]) => (now.comp[id] ?? 0) < n)
  .map(([id, n]) => `${id} ${n}→${now.comp[id] ?? 0} 味`);
console.log(`  ${shrank.length ? "退步" : " ok "}  組成味數變少             ${shrank.length} 首`);
shrank.slice(0, 10).forEach((s) => console.log("          " + s));
if (shrank.length) bad++;

if (bad) {
  console.log(`\nFAIL — ${bad} 項退步。這是內容流失，不是新缺陷。`);
  console.log("還原：git checkout <上一個好的 commit> -- " + FILE);
  process.exit(1);
}
console.log("\nPASS — 沒有任何一項退步。");

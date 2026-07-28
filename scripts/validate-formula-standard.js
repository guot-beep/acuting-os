#!/usr/bin/env node
/**
 * validate-formula-standard.js — enforce docs/FORMULA_CARD_TEMPLATE.md.
 *
 * Third of the three card validators, same shape as validate-herb-standard
 * (E1–E9) and validate-acupoint-standard (A1–A9).
 *
 * BLOCKING (exit 1):
 *   F1 id / name_zh / pinyin missing
 *   F2 duplicate id
 *   F3 template-grade record's _zh field carries no Chinese at all
 *   F4 template-grade record's _en array is not index-aligned with its _zh
 *      (English would render against the wrong item — the defect that hit both
 *      the herb and the acupoint cards)
 *   F5 template-grade record missing an _en array
 *   F6 template-grade record has a composition entry with no herb_zh
 *   F7 template-grade record has no 君臣佐使, or names more than 2 君藥
 *   F8 template-grade record's actions_zh exceeds 8 items
 *   F10 misfiled content — the defect class that dominated the herb and
 *      acupoint cards (組成 inside pattern_indications, a prohibition written
 *      as an action, a whole sentence sitting in the short-tag layer)
 *   F11 formula_family entry that names a formula without saying what changed —
 *      a bare list of names throws away the only valuable part
 *   F12 composition names an herb that is not in herb_canon_shortlist
 *   F9 fully-destroyed mojibake anywhere in the record — EVERY record, not
 *      just template-grade, because corrupt text is corrupt either way and it
 *      must never reach a card. Partially damaged text (a few characters lost,
 *      the rest readable) is a worklist note instead: §0 does not delete
 *      readable clinical content.
 *
 * F3/F4/F6 apply only to template-grade records on purpose. The imported
 * English is often a 2-item summary against a 50-item CloudTCM dump — those
 * were never meant to pair, and erroring on 58 of them would wedge the wall
 * over work nobody has claimed to do. Once a card is curated, pairing is the
 * whole contract.
 *
 * "Template grade" is field_sources.actions_zh specifically, NOT "has any
 * field_sources". Both sibling validators were broken once by the loose
 * definition — the herb one produced 755 errors when import provenance was
 * attached to 217 herbs, and the acupoint one 236 when exam stars were
 * written. Attaching a citation says where content came from, not that anyone
 * curated it.
 *
 * WORKLIST — `--worklist` lists the formula names behind the numbers.
 *   --category "<分類>"  only that batch
 *   --all               do not truncate
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const HERBS = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");

const WORKLIST = process.argv.includes("--worklist");
const ALL = process.argv.includes("--all");
const catArg = (() => {
  const i = process.argv.indexOf("--category");
  return i > -1 ? process.argv[i + 1] : null;
})();

const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const recs = data.records || data;

const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const hasHan = (s) => /[一-鿿]/.test(String(s));
const MOJIBAKE = /\?{4,}|�/;
// A string that is almost entirely question marks carries no information and
// must never reach a card. A string with a few characters lost is damaged but
// still readable, and §0 says readable content is not deleted — so that is a
// worklist item for manual repair, not a blocker.
const lostRatio = (s) => ((String(s).match(/[?�]/g) || []).length) / Math.max(1, String(s).length);
const FULLY_LOST = 0.8;

// Template grade = someone wrote where actions_zh came from.
const isTemplate = (r) => !!(r.field_sources && r.field_sources.actions_zh);

const errors = [];
const flags = new Map();
const flag = (r, msg) => {
  const k = r.id || r.name_zh;
  if (!flags.has(k)) flags.set(k, { name: r.name_zh, category: r.category || r.category_en || "", items: [] });
  flags.get(k).items.push(msg);
};

const seen = new Set();
const PAIRS = [
  ["actions_zh", "actions_en"],
  ["pattern_indications_zh", "pattern_indications_en"],
  ["modifications_zh", "modifications_en"],
  ["contraindications_zh", "contraindications_en"]
];

// F12 — the composition→herb join is the formula card's whole reason to exist
// as the hub of the three cards, so an ingredient nobody can look up is a real
// break, not a cosmetic one.
const herbNames = (() => {
  if (!fs.existsSync(HERBS)) return null;
  const j = JSON.parse(fs.readFileSync(HERBS, "utf8"));
  const set = new Set();
  for (const h of (j.records || j)) {
    if (h.name_zh) set.add(String(h.name_zh).trim());
    for (const a of h.aliases_zh || []) set.add(String(a).trim());
  }
  return set;
})();

const ROLE_OK = /^(君|臣|佐|使|chief|deputy|assistant|envoy)/i;
// A whole sentence in the tag layer is the defect that destroyed the acupoint
// search layer once already. But a flat character limit is the wrong test:
// Chinese tags are 2-6 字 while English tags are snake_case slugs
// ("wheezing_context" is 16 characters and is a perfectly good tag). What
// actually marks a sentence is prose punctuation or several space-separated
// words, so that is what this checks.
const isSentence = (v) => {
  const s = String(v).trim();
  if (/[。，、；：!?]/.test(s)) return true;            // prose punctuation
  if (/[\u4e00-\u9fff]/.test(s)) return s.length > 12; // 中文 tag: still a length rule
  return s.split(/\s+/).length > 4;                    // English: a slug or short phrase
};
const BAN_IN_ACTIONS = /(禁用|忌服|孕婦忌|不可服|慎服|禁忌)/;

let nTemplate = 0, nRoles = 0, nMojibake = 0, nDamaged = 0, nComp = 0, nMisaligned = 0, nUnknownHerb = 0, nSuspect = 0;

for (const r of recs) {
  const id = r.id || r.name_zh || "(no id)";

  // F1
  for (const f of ["id", "name_zh", "pinyin"]) {
    if (!String(r[f] || "").trim()) errors.push(`F1 ${id}: missing ${f}`);
  }
  // F2
  if (r.id) {
    if (seen.has(r.id)) errors.push(`F2 ${r.id}: duplicate id`);
    seen.add(r.id);
  }

  // F9 — every record. Corrupt text is corrupt regardless of curation state.
  const mojiFields = [], damagedFields = [];
  const walk = (o, p) => {
    if (typeof o === "string") {
      if (MOJIBAKE.test(o)) (lostRatio(o) >= FULLY_LOST ? mojiFields : damagedFields).push(p);
      return;
    }
    if (Array.isArray(o)) return o.forEach((v) => walk(v, `${p}[]`));
    if (o && typeof o === "object") for (const k of Object.keys(o)) walk(o[k], p ? `${p}.${k}` : k);
  };
  walk(r, "");
  if (mojiFields.length) {
    nMojibake++;
    const uniq = [...new Set(mojiFields)];
    errors.push(`F9 ${id}: 完全損毀的亂碼 in ${uniq.slice(0, 4).join(", ")}${uniq.length > 4 ? ` +${uniq.length - 4}` : ""}`);
    flag(r, `亂碼 ${uniq.slice(0, 3).join("、")}`);
  }
  if (damagedFields.length) {
    nDamaged++;
    flag(r, `缺字待修 ${[...new Set(damagedFields)].slice(0, 3).join("、")}`);
  }

  // F3 / F4 / F5
  for (const [zf, ef] of PAIRS) {
    const zh = arr(r[zf]), en = arr(r[ef]);
    if (zh.length && !zh.some(hasHan)) {
      flag(r, `${zf} 沒有中文`);
      if (isTemplate(r)) errors.push(`F3 ${id}: ${zf} has no Chinese`);
    }
    // The imported English is often a 2-item summary against a 50-item CloudTCM
    // dump — those were never meant to pair, so on an uncurated record this is
    // a note. Once someone curates the card, pairing is the whole contract.
    if (zh.length && en.length && zh.length !== en.length) {
      nMisaligned++;
      flag(r, `中英未對齊 ${ef} ${en.length} vs ${zh.length}`);
      if (isTemplate(r)) errors.push(`F4 ${id}: ${ef} (${en.length}) is not index-aligned with ${zf} (${zh.length}) — English would land on the wrong item`);
    }
    if (zh.length && !en.length) {
      // Safety is one group. contraindications_en may legitimately be empty
      // when the English safety statement is a single umbrella sentence that
      // cannot pair line-for-line with several 中文 rules — F4 forbids padding
      // it out, and inventing three more English lines to match is the exact
      // misalignment F4 exists to stop. If cautions_en carries it, the English
      // is not missing, it is just filed where it can stand alone.
      const safetyElsewhere = ef === "contraindications_en" && arr(r.cautions_en).length;
      if (safetyElsewhere) { flag(r, "禁忌英文改掛 cautions_en（無法逐條配對）"); continue; }
      flag(r, `缺英文 ${ef}`);
      if (isTemplate(r)) errors.push(`F5 ${id}: template-grade record is missing ${ef} (${zh.length} 中文, 0 English)`);
    }
  }

  // F6 — an ingredient with no name is not an ingredient.
  const comp = arr(r.composition);
  if (comp.length) nComp++;
  comp.forEach((c, i) => {
    if (String(c?.herb_zh || "").trim()) return;
    flag(r, `組成第 ${i + 1} 味沒有藥名`);
    if (isTemplate(r)) errors.push(`F6 ${id}: composition[${i}] has no herb_zh`);
  });
  if (!comp.length) flag(r, "缺組成 composition");
  // Marked by fix-formula-name-as-ingredient.js: the composition is a single
  // herb that is also the head of the formula's own name, i.e. almost certainly
  // truncated at import. Not blocking — the real composition needs the
  // curriculum — but it must never pass silently as a complete card.
  if (r.composition_suspect) {
    nSuspect++;
    flag(r, "組成疑似被截斷(只剩方名開頭那一味)");
    if (isTemplate(r)) errors.push(`F6 ${id}: composition 疑似被截斷 — 整理前必須先從 curriculum/formulas 補齊`);
  }

  // F7 — 君臣佐使 is the core of a formula card.
  const roles = comp.map((c) => String(c?.role_zh || c?.role || "").trim()).filter(Boolean);
  if (roles.length) nRoles++;
  else {
    flag(r, "缺君臣佐使");
    if (isTemplate(r)) errors.push(`F7 ${id}: template-grade record has no 君臣佐使 in composition`);
  }
  const chiefs = roles.filter((x) => /君|chief/i.test(x)).length;
  if (chiefs > 2) errors.push(`F7 ${id}: ${chiefs} 味君藥 — 君藥只能 1-2 味`);

  // F8 — the ceiling is the real rule; there is no floor, same as A6/E8.
  const na = arr(r.actions_zh).length;
  if (na > 8) {
    flag(r, `功效 ${na} 條(上限 8，目標 3-5)`);
    if (isTemplate(r)) errors.push(`F8 ${id}: actions_zh has ${na} items — condense to the 8 key actions`);
  }

  if (isTemplate(r)) nTemplate++;
  else flag(r, "尚未依模板整理(無 field_sources.actions_zh)");

  // ── F10 misfiled content ─────────────────────────────────────────────────
  // Each of these is a real defect seen on the other two cards, not a
  // hypothetical: 麻黃湯's composition really is inside pattern_indications_zh,
  // and ST17's needling prohibition really was filed as a function.
  for (const v of arr(r.pattern_indications_zh)) {
    if (/^\s*組成\s*[:：]/.test(String(v))) {
      flag(r, "組成寫在 pattern_indications_zh 裡");
      errors.push(`F10 ${id}: pattern_indications_zh 含「組成:」條目 — 組成應該在 composition`);
      break;
    }
  }
  for (const v of arr(r.actions_zh)) {
    if (BAN_IN_ACTIONS.test(String(v))) {
      flag(r, "禁忌語寫在功效裡");
      if (isTemplate(r)) errors.push(`F10 ${id}: actions_zh 含禁忌語 — 禁忌應該在 contraindications_zh`);
      break;
    }
  }
  for (const tf of ["modern_clinical_use_tags", "study_tags"]) {
    const longs = arr(r[tf]).filter(isSentence);
    if (!longs.length) continue;
    flag(r, `${tf} 有整句(${longs.length} 條)`);
    if (isTemplate(r)) errors.push(`F10 ${id}: ${tf} 有 ${longs.length} 條是整句而非標籤 — 「${String(longs[0]).slice(0, 24)}…」`);
  }

  // ── F7 role vocabulary ───────────────────────────────────────────────────
  for (const role of roles) {
    if (ROLE_OK.test(role)) continue;
    flag(r, `角色用詞不合規:${role}`);
    if (isTemplate(r)) errors.push(`F7 ${id}: composition role「${role}」— 只能是 君/臣/佐/使`);
  }

  // ── F6b dose ─────────────────────────────────────────────────────────────
  // 桂枝湯 → 桂枝加芍藥湯 differs only in the 芍藥 dose, so a dose is part of
  // what the formula IS, not an annotation on it.
  const noDose = comp.filter((c) => !String(c?.dose_range || c?.decoction_reference_g || "").trim()).length;
  if (noDose) {
    flag(r, `${noDose} 味沒有劑量`);
    if (isTemplate(r)) errors.push(`F6 ${id}: ${noDose} 味沒有 dose_range — 比例就是方`);
  }

  // ── F11 formula_family must say what changed ─────────────────────────────
  for (const [i, fam] of arr(r.formula_family).entries()) {
    const changed = arr(fam?.change).filter((x) => String(x).trim()).length;
    const named = String(fam?.formula_id || fam?.name_zh || "").trim();
    if (!named) errors.push(`F11 ${id}: formula_family[${i}] 沒有方名也沒有 formula_id`);
    if (!changed) errors.push(`F11 ${id}: formula_family[${i}]「${named}」沒寫 change — 只列方名等於沒寫`);
    if (fam?.relation && !/^(加|減|倍|合方|同類)$/.test(String(fam.relation))) {
      errors.push(`F11 ${id}: formula_family[${i}] relation「${fam.relation}」— 只能是 加/減/倍/合方/同類`);
    }
  }
  if (!arr(r.formula_family).length) flag(r, "缺方劑家族 formula_family");

  // ── F12 composition → herb canon ─────────────────────────────────────────
  if (herbNames) {
    const unknown = comp.map((c) => String(c?.herb_zh || "").trim())
      .filter((n) => n && !herbNames.has(n));
    if (unknown.length) {
      flag(r, `中藥庫查無:${unknown.slice(0, 3).join("、")}`);
      nUnknownHerb += unknown.length;
      if (isTemplate(r)) errors.push(`F12 ${id}: composition 有 ${unknown.length} 味不在中藥庫 — ${unknown.slice(0, 4).join("、")}`);
    }
  }

  if (!arr(r.tongue_zh).length && !arr(r.pulse_zh).length) flag(r, "缺舌脈 tongue_zh/pulse_zh");
  if (!arr(r.modifications_zh).length) flag(r, "缺加減變化");
  if (!String(r.source_classic || "").trim()) flag(r, "缺出典 source_classic");
  if (!arr(r.contraindications_zh).length) flag(r, "缺禁忌 contraindications_zh");
}

console.log(`validate-formula-standard: ${recs.length} formulas (${nTemplate} template-grade)\n`);
const pct = (n) => `${n}/${recs.length}`;
console.log(`  有組成 composition        ${pct(nComp)}`);
console.log(`  有君臣佐使                ${pct(nRoles)}`);
console.log(`  有加減變化                ${pct(recs.filter((r) => arr(r.modifications_zh).length).length)}`);
console.log(`  有出典                    ${pct(recs.filter((r) => r.source_classic).length)}`);
console.log(`  有禁忌                    ${pct(recs.filter((r) => arr(r.contraindications_zh).length).length)}`);
console.log(`  ⚠️ 完全損毀的亂碼         ${pct(nMojibake)}`);
console.log(`  ⚠️ 缺字待修(仍可讀)      ${pct(nDamaged)}`);
console.log(`  ⚠️ 中英未對齊             ${pct(nMisaligned)}`);
console.log(`  有劑量的方                ${pct(recs.filter((r) => arr(r.composition).some((c) => c?.dose_range)).length)}`);
console.log(`  有舌脈                    ${pct(recs.filter((r) => arr(r.tongue_zh).length || arr(r.pulse_zh).length).length)}`);
console.log(`  有方劑家族 formula_family ${pct(recs.filter((r) => arr(r.formula_family).length).length)}`);
console.log(`  ⚠️ 組成有中藥庫查無的藥    ${nUnknownHerb} 味次`);
console.log(`  ⚠️ 組成疑似被截斷         ${pct(nSuspect)}`);

// The linking layer, reported but not blocking — same as the acupoint card.
const linked = recs.filter((r) => arr(r.related_conditions).length || arr(r.condition_links).length).length;
console.log(`\n連接層(待補不擋):`);
console.log(`  病證連結                  ${pct(linked)}`);
console.log(`  單味藥連結 herb_id        ${pct(recs.filter((r) => arr(r.composition).some((c) => c?.herb_id)).length)}`);

if (WORKLIST) {
  const rows = [...flags.values()].filter((f) => !catArg || f.category === catArg);
  const byCat = new Map();
  for (const f of rows) {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category).push(f);
  }
  console.log(`\n===== 待整理清單 WORKLIST — ${rows.length} 方 =====`);
  for (const [cat, list] of [...byCat].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n## ${cat || "(未分類)"}  (${list.length} 方)`);
    for (const f of (ALL ? list : list.slice(0, 12))) {
      console.log(`  ${String(f.name).padEnd(12)} ${f.items.length} 項：${f.items.slice(0, 3).join("；")}`);
    }
    if (!ALL && list.length > 12) console.log(`  … 還有 ${list.length - 12} 方（--all 顯示全部）`);
  }
  console.log("\n用法：--category \"<分類>\" 只看一批；--all 顯示全部。批次順序見 docs/FORMULA_CARD_TEMPLATE.md §6。");
} else {
  console.log("\n提示：加 --worklist 列出每一個不合格的方劑（--category \"<分類>\" 看單一批次）。");
}

if (errors.length) {
  console.error(`\n❌ ${errors.length} blocking defect(s):\n`);
  errors.slice(0, ALL ? errors.length : 25).forEach((e) => console.error("  " + e));
  if (!ALL && errors.length > 25) console.error(`  … and ${errors.length - 25} more (--all)`);
  process.exit(1);
}
console.log("\nPASS — no blocking defects.");

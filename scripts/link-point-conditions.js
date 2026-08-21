#!/usr/bin/env node
/**
 * link-point-conditions.js — build the point ⇄ condition / pattern links (§6.5 B).
 *
 * Ting wants both vocabularies hung off each point: 西醫病名 so a case or a chief
 * complaint finds the point, and 中醫證候 because the actual reasoning path is
 * 病 → 證 → 穴.
 *
 * ── Both links come from authored structure, not from prose ──
 *
 *   related_conditions ← cond.acupoint_protocols[].code
 *     The condition record carries a real protocol list with the point code
 *     already separated from the name. 135 of 150 conditions have one.
 *
 *   tcm_pattern_ids    ← cond.tcm_patterns[].acupoints_zh[]
 *     Each pattern inside a condition names its own points. This is a direct
 *     pattern→point statement by the same author, which is exactly the
 *     vocabulary §6.5 (B) asks for.
 *
 * An earlier version of this script scanned `JSON.stringify(condition)` for
 * anything code-shaped and matched patterns by comparing the point's own
 * disease_tags against the canon. That was two mistakes at once: the scan
 * swept up incidental prose mentions, and tag-matching found only 24 of 361
 * points because a point's tags are not written in the canon's vocabulary.
 * Reading the structured fields gives a defensible link every time and needs
 * no fuzzy matching at all.
 *
 * ⚠️ The code format differs between the two files: conditions write SP08,
 * SP06, DU04; points are SP8, SP6, GV4. A naive match returns nothing and
 * looks like "there are no links" rather than "the join is broken", so
 * normalisation is the first thing this does and unmatched codes are reported,
 * never dropped quietly.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const POINTS = path.join(ROOT, "data/acupoints/361.json");
const CONDS = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const PATTERNS = path.join(ROOT, "data/config/tcm_pattern_canon.json");
const APPLY = process.argv.includes("--apply");

const PREFIX = { DU: "GV", REN: "CV", UB: "BL", SJ: "TE", KD: "KI", LV: "LR" };
const CODE_RE = /\b(LU|LI|ST|SP|HT|SI|BL|UB|KI|KD|PC|TE|SJ|GB|LR|LV|CV|REN|GV|DU)-?(\d{1,2})\b/;

function normalizeCode(raw) {
  const m = CODE_RE.exec(String(raw || "").toUpperCase());
  if (!m) return null;
  return (PREFIX[m[1]] || m[1]) + Number(m[2]);
}

const raw = fs.readFileSync(POINTS, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const byCode = new Map(recs.map((r) => [r.code, r]));

const condRaw = JSON.parse(fs.readFileSync(CONDS, "utf8"));
const conds = condRaw.records || condRaw;
const patterns = JSON.parse(fs.readFileSync(PATTERNS, "utf8")).records;
// The canon stores 「肝氣鬱結」 while a condition may write 「肝氣鬱結證」.
const patKey = (s) => String(s || "").trim().replace(/[證症]$/, "");
const patByName = new Map(patterns.map((p) => [patKey(p.name_zh), p.id]));

// legacy pat.<中文> → canonical pattern.<slug>(data/config/pattern_alias_map.json)
const ALIAS = (() => {
  const doc = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/config/pattern_alias_map.json"), "utf8")
  );
  const out = {};
  for (const [k, v] of Object.entries(doc.aliases || {})) {
    out[k] = typeof v === "string" ? v : v && v.pattern_id;
  }
  return out;
})();

const condLinks = new Map();   // point code → [condition ids]
const patLinks = new Map();    // point code → [pattern ids]
const unmatchedCodes = new Set();
const unmatchedPatterns = new Set();
const unregisteredLegacy = new Set();

const push = (map, code, id) => {
  if (!map.has(code)) map.set(code, []);
  if (!map.get(code).includes(id)) map.get(code).push(id);
};

for (const c of conds) {
  if (!c.id) continue;

  // 西醫病名 — the authored protocol list.
  for (const ap of c.acupoint_protocols || []) {
    const src = typeof ap === "string" ? ap : ap.code;
    const code = normalizeCode(src);
    if (!code || !byCode.has(code)) { unmatchedCodes.add(String(src)); continue; }
    push(condLinks, code, c.id);
  }

  // 中醫證候 — each pattern names its own points.
  for (const p of c.tcm_patterns || []) {
    let pid = patByName.get(patKey(p.pattern_zh));
    if (!pid) { if (p.pattern_zh) unmatchedPatterns.add(p.pattern_zh); continue; }
    /* 紅線 1:新寫入只准 canonical pattern.<slug>。legacy canon 給的是
       pat.<中文>,先過 alias map 轉 canonical;轉不了的(pending_registration
       或 catch-all)攔下回報,不落一個新的 legacy id 進資料。既有記錄裡的
       legacy id 不動(alias map 政策:legacy 永不改寫),但別再生新的。 */
    const canonical = ALIAS[pid];
    if (!canonical) { unregisteredLegacy.add(pid + "（" + (p.pattern_zh || "") + "）"); continue; }
    pid = canonical;
    for (const a of p.acupoints_zh || []) {
      const code = normalizeCode(a);
      if (!code || !byCode.has(code)) { unmatchedCodes.add(String(a)); continue; }
      push(patLinks, code, pid);
    }
  }
}

/* ⚠️ 併集,不是覆寫。這兩個欄位如今不只一條線在寫:
   tcm_pattern_ids 另有 apply-acupoint-pattern-links.js(帳本推導)與
   既有 44 點的 legacy pat.<中文>;related_conditions 也可能被手工策展。
   直接 `r.x = links` 會把別條線的成果整欄洗掉——這個 repo 已經被
   「合併時整檔覆寫」燒過(knowledge.js),資料層不准再犯。
   field_sources 同理:append 具名來源,不清掉別人的。 */
const SRC_COND = "data/pathology/condition_canon_shortlist.json（acupoint_protocols 列出本穴）";
const SRC_PAT = "data/pathology/condition_canon_shortlist.json（tcm_patterns.acupoints_zh 列出本穴）";
const union = (existing, add) => {
  const out = [...(existing || [])];
  const seen = new Set(out);
  for (const x of add) if (!seen.has(x)) { seen.add(x); out.push(x); }
  return out;
};
const appendSource = (r, field, src) => {
  r.field_sources = r.field_sources || {};
  const list = r.field_sources[field] || [];
  if (!list.includes(src)) list.push(src);
  r.field_sources[field] = list;
};
let nCond = 0, nPat = 0;
for (const r of recs) {
  const cs = condLinks.get(r.code);
  if (cs && cs.length) {
    r.related_conditions = union(r.related_conditions, cs);
    appendSource(r, "related_conditions", SRC_COND);
    nCond++;
  }
  const ps = patLinks.get(r.code);
  if (ps && ps.length) {
    r.tcm_pattern_ids = union(r.tcm_pattern_ids, ps);
    appendSource(r, "tcm_pattern_ids", SRC_PAT);
    nPat++;
  }
}

const deg = (map) => {
  const v = [...map.values()].map((x) => x.length).sort((a, b) => a - b);
  return v.length ? { med: v[Math.floor(v.length / 2)], max: v[v.length - 1] } : { med: 0, max: 0 };
};
const dc = deg(condLinks), dp = deg(patLinks);

console.log(`病證連結 related_conditions   ${nCond}/${recs.length} 穴   中位數 ${dc.med}，最多 ${dc.max}`);
console.log(`證候連結 tcm_pattern_ids      ${nPat}/${recs.length} 穴   中位數 ${dp.med}，最多 ${dp.max}`);
console.log(`  代碼正規化失敗   ${unmatchedCodes.size}${unmatchedCodes.size ? " → " + [...unmatchedCodes].slice(0, 8).join(" ") : ""}`);
console.log(`  證候名不在 canon ${unmatchedPatterns.size}${unmatchedPatterns.size ? " → " + [...unmatchedPatterns].slice(0, 6).join("、") : ""}`);
console.log(`  legacy 無 canonical 對映(不落庫) ${unregisteredLegacy.size}${unregisteredLegacy.size ? " → " + [...unregisteredLegacy].slice(0, 6).join("、") : ""}`);

// The busiest points are worth eyeballing: a point linked to nearly every
// condition means the link carries no information and should be questioned.
const top = [...condLinks.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
console.log("\n病證最多的穴:");
for (const [code, ids] of top) console.log(`  ${code.padEnd(6)} ${String(ids.length).padStart(3)} 個病證  ${byCode.get(code)?.chinese || ""}`);

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(POINTS, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");

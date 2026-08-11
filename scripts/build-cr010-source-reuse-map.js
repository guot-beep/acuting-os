#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const input = argValue("--input", "data/pathology/condition_canon_shortlist.json");
const outDir = argValue("--out-dir", "tmp/cr010");

const PRIORITY_PATTERNS = [
  /DISEASE_KNOWLEDGE_CURRENT_STATE_AUDIT/i,
  /WESTERN_CONDITION_GAP_MASTERLIST/i,
  /COND_TDIS_PATTERN_RELATION_GAP_AUDIT/i,
  /BOARD_COVERAGE_RESIDUAL_GAPS/i,
  /INGESTION_QUEUE_AND_HANDOFF/i,
  /CLEAN_V2/i,
  /research_packs/i,
  /research_staging/i
];

const SKIP_DIRS = new Set([".git","node_modules","dist","build",".next","coverage","vendor"]);
const MAX_FILE = 8 * 1024 * 1024;

function loadRecords(p) {
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.records)) return raw.records;
  throw new Error(`Unsupported condition file shape: ${p}`);
}
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    if (ent.isDirectory() && SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p,out);
    else if (/\.(md|json|txt)$/i.test(ent.name)) {
      try {
        if (fs.statSync(p).size <= MAX_FILE && path.resolve(p) !== path.resolve(input)) out.push(p);
      } catch {}
    }
  }
  return out;
}
function priorityRank(p) {
  for (let i=0;i<PRIORITY_PATTERNS.length;i++) if (PRIORITY_PATTERNS[i].test(p)) return i;
  return 999;
}

const records = loadRecords(input);
const files = [...new Set([...walk("docs"), ...walk("data"), ...walk("curriculum")])]
  .sort((a,b)=>priorityRank(a)-priorityRank(b) || a.localeCompare(b));

const cache = new Map();
for (const f of files) {
  try { cache.set(f, fs.readFileSync(f,"utf8")); } catch {}
}

const results = [];
for (const r of records) {
  const id = String(r.id || "");
  const en = norm(r.name_en);
  const zh = norm(r.name_zh);
  const hits = [];

  for (const [f,text] of cache.entries()) {
    let kind = null, confidence = null;
    if (id && text.includes(id)) { kind="exact_id"; confidence="HIGH"; }
    else {
      const nt = norm(text);
      if (en && en.length >= 5 && nt.includes(en)) { kind="exact_normalized_en_name"; confidence="MEDIUM"; }
      else if (zh && zh.length >= 2 && nt.includes(zh)) { kind="exact_normalized_zh_name"; confidence="MEDIUM"; }
    }
    if (kind) hits.push({file:f.replace(/\\/g,"/"), match_kind:kind, confidence, priority_asset_rank:priorityRank(f)});
  }
  hits.sort((a,b)=>a.priority_asset_rank-b.priority_asset_rank || a.file.localeCompare(b.file));
  results.push({
    id,
    name_en:r.name_en || "",
    name_zh:r.name_zh || "",
    reuse_assets:hits.slice(0,25),
    has_high_confidence_reuse: hits.some(h=>h.confidence==="HIGH"),
    research_gate: hits.length ? "REUSE_REVIEW_BEFORE_NEW_RESEARCH" : "NO_LOCAL_MATCH_FOUND_NOT_PROOF_OF_GAP"
  });
}

fs.mkdirSync(outDir,{recursive:true});
const out = path.join(outDir,"cr010_source_reuse_map_live.json");
fs.writeFileSync(out, JSON.stringify({
  status:"AUDIT_ONLY_NOT_CANONICAL",
  input,
  files_scanned:cache.size,
  records:results
}, null, 2));
console.log(`Scanned ${cache.size} text/json assets`);
console.log(`Wrote ${out}`);

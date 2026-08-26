#!/usr/bin/env node
// Record-level 3-way JSON merge for AcuTing data files(2026-08-26 Pattern V2
// 大合併時淬出;42 檔衝突中五個大 JSON 靠它從整檔衝突降到個位數欄位衝突)。
//
// Usage: node scripts/merge-records-3way.js <file> <keyField> <baseBlob|auto> <reportPath>
//   在 merge 衝突狀態下執行:ours 讀 stage :2,theirs 讀 :3。
//   baseBlob 傳 "auto" 會自動找「兩條歷史最後一個相同的 blob」當合成基底 ——
//   這比 merge-base 的版本新得多(兩線常互相吸收),假衝突大幅減少。
//
// Field rules(逐 record、逐欄位):
//   ours==theirs 保留;ours==base 取 theirs;theirs==base 取 ours;
//   related_*/*_links 兩邊都改 => 併集(union-writes 慣例);
//   review_status 有一邊是 skeleton => 取帶內容那邊;
//   其餘兩邊都改 => 暫保 ours 並寫進 report 給人裁定 —— 不要跳過裁定。
// Arrays are atomic (never element-merged) to preserve _en/_zh index alignment.
"use strict";
const { execFileSync } = require("child_process");
const fs = require("fs");

const [file, keyField, baseBlob, reportPath] = process.argv.slice(2);
if (!file || !keyField || !baseBlob || !reportPath) {
  console.error("usage: merge-records.js <file> <keyField> <baseBlob> <reportPath>");
  process.exit(2);
}
const gitShow = (ref) =>
  execFileSync("git", ["cat-file", "blob", ref], { maxBuffer: 1 << 28 }).toString("utf8");
const gitLines = (args) =>
  execFileSync("git", args, { maxBuffer: 1 << 28 }).toString("utf8").split("\n").filter(Boolean);

function findNewestCommonBlob(f) {
  const blobAt = (c) => {
    try { return execFileSync("git", ["rev-parse", "--verify", `${c}:${f}`], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); }
    catch { return null; }
  };
  const oursSet = new Set(gitLines(["log", "--format=%H", "HEAD", "--", f]).map(blobAt).filter(Boolean));
  for (const c of gitLines(["log", "--format=%H", "MERGE_HEAD", "--", f])) {
    const b = blobAt(c);
    if (b && oursSet.has(b)) return b;
  }
  return execFileSync("git", ["rev-parse", `:1:${f}`]).toString().trim(); // fallback: merge-base stage
}

const oursRaw = gitShow(`:2:${file}`);
const theirsRaw = gitShow(`:3:${file}`);
const baseRaw = gitShow(baseBlob === "auto" ? findNewestCommonBlob(file) : baseBlob);
const ours = JSON.parse(oursRaw);
const theirs = JSON.parse(theirsRaw);
const base = JSON.parse(baseRaw);

const isArr = Array.isArray(ours);
const recsOf = (j) => (isArr ? j : j.records || []);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const report = { file, conflicts: [], unions: [], added_ours: [], added_theirs: [], deleted: [], kept_modified_vs_deleted: [] };

const isStrArr = (a) => Array.isArray(a) && a.every((x) => typeof x === "string");
const UNION_FIELD = /(^|\.)related_[a-z_]+$|_links$/;

function mergeObj(id, o, t, b, path) {
  if (o === undefined && t === undefined) return undefined;
  if (eq(o, t)) return o;
  if (eq(o, b)) return t; // covers b undef + o undef => theirs added; and o unchanged => take theirs
  if (eq(t, b)) return o;
  // link fields: union (ours order first, then theirs-only), per union-writes doctrine
  if (UNION_FIELD.test(path) && isStrArr(o) && isStrArr(t)) {
    const u = [...o];
    for (const x of t) if (!u.includes(x)) u.push(x);
    report.unions.push({ id, field: path, ours: o, theirs: t, merged: u });
    return u;
  }
  // review_status: skeleton loses to the side that actually brought content
  if (path.endsWith("review_status") && (o === "skeleton" || t === "skeleton")) {
    return o === "skeleton" ? t : o;
  }
  // both changed differently
  if (o && t && typeof o === "object" && !Array.isArray(o) && typeof t === "object" && !Array.isArray(t)) {
    const out = {};
    const keys = [...new Set([...Object.keys(o), ...Object.keys(t), ...Object.keys(b && typeof b === "object" && !Array.isArray(b) ? b : {})])];
    for (const k of keys) {
      const bv = b && typeof b === "object" && !Array.isArray(b) ? b[k] : undefined;
      const v = mergeObj(id, o[k], t[k], bv, path ? `${path}.${k}` : k);
      if (v !== undefined) out[k] = v;
      else if (o[k] === undefined && t[k] === undefined) {
        /* deleted on both or absent */
      } else if (v === undefined && (o[k] !== undefined || t[k] !== undefined)) {
        // one side deleted, other unchanged from base -> deletion wins (handled by eq checks above);
        // reaching here means genuinely undefined merge result; skip
      }
    }
    return out;
  }
  report.conflicts.push({ id, field: path, ours: o, theirs: t, base: b, resolution: "KEPT_OURS_PENDING_REVIEW" });
  return o;
}

const oRecs = recsOf(ours), tRecs = recsOf(theirs), bRecs = recsOf(base);
const byKey = (rs) => new Map(rs.map((r) => [r[keyField], r]));
const oMap = byKey(oRecs), tMap = byKey(tRecs), bMap = byKey(bRecs);

const merged = [];
const seen = new Set();
for (const r of oRecs) {
  const k = r[keyField];
  seen.add(k);
  const t = tMap.get(k), b = bMap.get(k);
  if (t === undefined) {
    if (b === undefined) { merged.push(r); report.added_ours.push(k); }
    else if (eq(r, b)) { report.deleted.push({ id: k, by: "theirs" }); } // theirs deleted, ours untouched
    else { merged.push(r); report.kept_modified_vs_deleted.push({ id: k, deletedBy: "theirs" }); }
    continue;
  }
  merged.push(mergeObj(k, r, t, b, ""));
}
for (const r of tRecs) {
  const k = r[keyField];
  if (seen.has(k)) continue;
  const b = bMap.get(k);
  if (b === undefined) { merged.push(r); report.added_theirs.push(k); }
  else if (eq(r, b)) { report.deleted.push({ id: k, by: "ours" }); }
  else { merged.push(r); report.kept_modified_vs_deleted.push({ id: k, deletedBy: "ours" }); }
}

let out;
if (isArr) out = merged;
else {
  out = {};
  const metaKeys = [...new Set([...Object.keys(ours), ...Object.keys(theirs)])];
  for (const k of metaKeys) {
    if (k === "records") { out.records = merged; continue; }
    const v = mergeObj("(metadata)", ours[k], theirs[k], base[k], k);
    if (v !== undefined) out[k] = v;
  }
  if (!("records" in out) && merged.length) out.records = merged;
}

// detect indent from ours raw (first indented line)
const m = oursRaw.match(/\n([ \t]+)\S/);
const indent = m ? m[1] : " ";
const text = JSON.stringify(out, null, indent) + (oursRaw.endsWith("\n") ? "\n" : "");
fs.writeFileSync(file, text);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
const c = report.conflicts.length;
console.log(
  `${file}: records ours=${oRecs.length} theirs=${tRecs.length} merged=${merged.length} | ` +
  `+ours=${report.added_ours.length} +theirs=${report.added_theirs.length} del=${report.deleted.length} ` +
  `modVsDel=${report.kept_modified_vs_deleted.length} CONFLICTS=${c}`
);

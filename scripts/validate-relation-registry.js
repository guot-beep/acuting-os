#!/usr/bin/env node
/**
 * validate-relation-registry.js — make the edge registry machinery, not prose.
 *
 * D13 says data/config/relation_registry.json is "the authority on which fields
 * are edges", and that CG4's reverse index, the graph UI and the validators all
 * enumerate edges from it. Measured 2026-08-06: NOTHING read the file. Zero
 * consumers, not in the build bundle. A registry nobody parses is the same
 * failure as a validator nobody runs — it looks like governance and enforces
 * nothing, and a new edge can be declared and be invisible.
 *
 * This is the first consumer. It proves each declared edge is machine-resolvable
 * and, critically, that the NESTED path form parses:
 *
 *     sym.*.differentiation[].points_to  →  pattern.*
 *
 * That edge is not a top-level id array. A consumer that assumes every `field`
 * is `record[field]` would silently skip it, or worse treat the whole
 * differentiation object as an id. Path syntax supported:
 *
 *     related_patterns                 top-level array or scalar
 *     differentiation[].points_to      array of objects → array per object
 *     case_links.tcm_patterns          dotted object path
 *
 * ERRORS (exit 1):
 *   R1 edge is missing a required key (id / stored_on / field / target)
 *   R2 duplicate edge id
 *   R3 `file` is declared but does not exist, and is not marked as not-yet-created
 *   R4 the field path cannot be resolved against the declared file's records
 *      (checked structurally: the path must be parseable and, where records
 *      exist and any of them uses the field, must yield ids rather than objects)
 *   R5 a reverse.derived_field is hand-filled in the data — D13's core rule
 *   R6 edge_kind is present but not descriptive|inferential|symmetric
 *
 * NOTES:
 *   N1 edge declares a file that has no records yet (expected for sym.*)
 *   N3 edge declares stored_shape=inline_objects — honest, but not indexable yet
 *   N2 edge has no edge_kind (older entries predate the descriptive/inferential
 *      distinction; not an error, but new edges should declare it)
 *
 *   node scripts/validate-relation-registry.js [--json]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY = "data/config/relation_registry.json";
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const EDGE_KINDS = new Set(["descriptive", "inferential", "symmetric"]);

/* Resolve a declared field path against one record.
 * Returns { ok, values, shape } — values are the ids the edge points at. */
function resolvePath(record, fieldPath) {
  // differentiation[].points_to  →  collect points_to from each array element
  const nested = fieldPath.match(/^([A-Za-z_][\w]*)\[\]\.(.+)$/);
  if (nested) {
    const [, arrayField, innerPath] = nested;
    const arr = record[arrayField];
    if (arr === undefined) return { ok: true, values: [], shape: "absent" };
    if (!Array.isArray(arr)) return { ok: false, values: [], shape: `${arrayField} is not an array` };
    const values = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") return { ok: false, values: [], shape: `${arrayField}[] element is not an object` };
      const inner = innerPath.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), item);
      if (inner === undefined) continue;
      if (Array.isArray(inner)) values.push(...inner);
      else values.push(inner);
    }
    return { ok: true, values, shape: "nested_array_of_objects" };
  }
  // dotted path
  const value = fieldPath.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), record);
  if (value === undefined) return { ok: true, values: [], shape: "absent" };
  if (Array.isArray(value)) return { ok: true, values: value, shape: "array" };
  return { ok: true, values: [value], shape: "scalar" };
}

const registry = readJson(REGISTRY);
const edges = registry.edges || [];
const errors = [];
const notes = [];
const seen = new Set();

for (const edge of edges) {
  const id = edge.id || "(no id)";
  const err = (code, detail) => errors.push({ code, id, detail });

  // R1 / R2 / R6
  for (const k of ["id", "stored_on", "field", "target"]) {
    if (!edge[k]) err("R1", `missing "${k}"`);
  }
  if (edge.id) {
    if (seen.has(edge.id)) err("R2", "duplicate edge id");
    else seen.add(edge.id);
  }
  if (edge.edge_kind && !EDGE_KINDS.has(edge.edge_kind)) {
    err("R6", `edge_kind "${edge.edge_kind}" is not ${[...EDGE_KINDS].join(" | ")}`);
  }
  if (!edge.edge_kind) notes.push({ code: "N2", id, detail: "no edge_kind declared" });

  // R3 / R4 — resolve against the declared file
  const file = edge.file || "";
  const notYetCreated = /not yet created/i.test(file);
  const filePath = file.replace(/\s*\(.*\)$/, "").trim();
  if (!filePath || notYetCreated || /^clinical layer|schema\.sql/.test(filePath)) {
    notes.push({ code: "N1", id, detail: `file not resolvable yet: ${file || "(none)"}` });
    continue;
  }
  if (!exists(filePath)) { err("R3", `declared file does not exist: ${filePath}`); continue; }

  let records;
  try {
    const j = readJson(filePath);
    records = j.records || (Array.isArray(j) ? j : null);
  } catch (e) { err("R3", `cannot read ${filePath}: ${e.message}`); continue; }
  if (!records) { notes.push({ code: "N1", id, detail: `${filePath} has no records array` }); continue; }

  let usedBy = 0;
  let shape = null;
  for (const rec of records) {
    const r = resolvePath(rec, edge.field);
    if (!r.ok) { err("R4", `${edge.field} on ${rec.id}: ${r.shape}`); break; }
    if (r.shape !== "absent") { shape = r.shape; }
    if (r.values.length) {
      usedBy += 1;
      // An edge may DECLARE that it still holds pre-id inline objects. Saying so
      // is honest and keeps the registry describing reality; silently yielding
      // objects while claiming to point at ids is the defect.
      const bad = edge.stored_shape === "inline_objects" ? undefined : r.values.find((v) => typeof v !== "string");
      if (bad !== undefined) {
        err("R4", `${edge.field} on ${rec.id} yields a non-id value (${JSON.stringify(bad).slice(0, 40)}) — the path resolves to objects, not ids`);
        break;
      }
    }
  }
  if (edge.stored_shape === "inline_objects") {
    notes.push({ code: "N3", id, detail: "declared stored_shape=inline_objects — honest, but cannot be reverse-indexed until migrated to ids" });
  }
  if (usedBy === 0) notes.push({ code: "N1", id, detail: `field "${edge.field}" not populated on any record yet (${records.length} records, path parses as ${shape || "absent"})` });

  // R5 — the reverse must NOT be hand-filled anywhere in the same file
  const rev = edge.reverse && edge.reverse.derived_field;
  if (rev && records.some((rec) => rec[rev] !== undefined)) {
    err("R5", `reverse "${rev}" is hand-filled in ${filePath} — reverses are derived (D13)`);
  }
}

const byCode = {};
for (const e of errors) (byCode[e.code] ||= []).push(e);
const noteCounts = {};
for (const n of notes) noteCounts[n.code] = (noteCounts[n.code] || 0) + 1;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    file: REGISTRY, edges: edges.length, errors: errors.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
    notes: noteCounts,
  }, null, 2));
} else {
  console.log(`validate-relation-registry — ${REGISTRY}`);
  console.log(`${edges.length} edges declared\n`);
  const kinds = {};
  edges.forEach((e) => { kinds[e.edge_kind || "(unset)"] = (kinds[e.edge_kind || "(unset)"] || 0) + 1; });
  console.log("  by kind: " + Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(" · ") + "\n");
  for (const [code, list] of Object.entries(byCode)) {
    console.log(`${code} — ${list.length}`);
    list.forEach((e) => console.log(`    ${e.id}: ${e.detail}`));
  }
  for (const [code, n] of Object.entries(noteCounts)) {
    console.log(`${code} — ${n} (note only)`);
    notes.filter((x) => x.code === code).forEach((x) => console.log(`    ${x.id}: ${x.detail}`));
  }
  console.log("");
  console.log(errors.length === 0 ? "PASS — every declared edge is machine-resolvable."
    : `FAIL — ${errors.length} problem(s).`);
}
process.exit(errors.length === 0 ? 0 : 1);

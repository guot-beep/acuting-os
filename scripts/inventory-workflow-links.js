/**
 * inventory-workflow-links.js — READ-ONLY inventory of every workflowLink value
 * actually stored in the clinical case store.
 *
 * WHY THIS IS NOT A NODE SCRIPT
 * The values live in browser localStorage under `acuting-clinical-cases-v1`.
 * data/clinical_cases/{local,private,exports}/ do not exist (D7: the real store
 * is never in git), so there is nothing on disk for Node to read. Run this in
 * the browser DevTools console on the AcuTing page instead.
 *
 *   1. Open the app, press F12, go to Console
 *   2. Paste this whole file, press Enter
 *
 * PRIVACY
 * Output stays in your own console — it is never sent anywhere. It prints
 * workflowLink values only, never chief complaints, notes or patient codes.
 * A workflow id is a protocol name, not patient information. BUT: if the field
 * was ever used as a scratch note, an "invalid" line could contain something
 * identifying. Read the invalid list before pasting any of it into a chat.
 *
 * WRITES NOTHING. Reads localStorage, prints, exits.
 */
(function inventoryWorkflowLinks() {
  const KEY = "acuting-clinical-cases-v1";
  const VALID = [
    "fertility.workflow.pcos_ovulation_induction",
    "fertility.workflow.iui_cycle",
    "fertility.workflow.ivf_stimulation",
    "fertility.workflow.embryo_transfer_luteal",
  ];

  let cases;
  try {
    cases = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    console.error("Could not parse " + KEY + ": " + e.message);
    return;
  }
  if (!Array.isArray(cases)) { console.error(KEY + " is not an array."); return; }

  const rows = [];
  cases.forEach((c, ci) => {
    (c.soapNotes || []).forEach((n, ni) => {
      rows.push({ where: `case[${ci}].soapNotes[${ni}]`, raw: n.workflowLink });
    });
  });

  const bucket = { valid: [], blank: [], case_or_space_variant: [], near_miss: [], url: [], other: [] };
  const levenshtein = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[a.length][b.length];
  };

  for (const r of rows) {
    const v = r.raw;
    if (v == null || String(v).trim() === "") { bucket.blank.push(r); continue; }
    const s = String(v);
    if (VALID.includes(s)) { bucket.valid.push(r); continue; }
    const norm = s.trim().toLowerCase().replace(/\s+/g, "");
    if (VALID.includes(norm)) { bucket.case_or_space_variant.push({ ...r, norm }); continue; }
    if (/^https?:\/\//i.test(s)) { bucket.url.push(r); continue; }
    const best = VALID.map((id) => [id, levenshtein(norm, id)]).sort((a, b) => a[1] - b[1])[0];
    if (best[1] <= 5) { bucket.near_miss.push({ ...r, closest: best[0], distance: best[1] }); continue; }
    bucket.other.push(r);
  }

  console.log("%cworkflowLink inventory", "font-weight:bold;font-size:14px");
  console.log(`cases: ${cases.length} · visits with a SOAP note: ${rows.length}`);
  console.table([
    { category: "valid registry id", count: bucket.valid.length },
    { category: "blank / not filled", count: bucket.blank.length },
    { category: "case or whitespace variant", count: bucket.case_or_space_variant.length },
    { category: "near miss (typo?)", count: bucket.near_miss.length },
    { category: "a URL", count: bucket.url.length },
    { category: "something else (prose?)", count: bucket.other.length },
  ]);

  const byId = {};
  bucket.valid.forEach((r) => (byId[r.raw] = (byId[r.raw] || 0) + 1));
  console.log("valid ids in use:", Object.keys(byId).length ? byId : "(none)");

  const show = (label, list, extra) => {
    if (!list.length) return;
    console.groupCollapsed(`${label} — ${list.length}`);
    list.forEach((r) => console.log(r.where, JSON.stringify(r.raw), extra ? extra(r) : ""));
    console.groupEnd();
  };
  show("case/whitespace variants", bucket.case_or_space_variant, (r) => "-> " + r.norm);
  show("near misses", bucket.near_miss, (r) => `closest ${r.closest} (distance ${r.distance})`);
  show("URLs", bucket.url);
  show("other / prose  ⚠ review before sharing", bucket.other);

  const needsWork = bucket.case_or_space_variant.length + bucket.near_miss.length
    + bucket.url.length + bucket.other.length;
  console.log(needsWork === 0
    ? "%cEvery non-blank value is a valid registry id — visits.fertility_workflow_id can be a clean id column."
    : `%c${needsWork} value(s) are not registry ids. Decide what happens to them BEFORE the column exists.`,
    "font-weight:bold");

  return { total: rows.length, ...Object.fromEntries(Object.entries(bucket).map(([k, v]) => [k, v.length])) };
})();

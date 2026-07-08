#!/usr/bin/env node
/**
 * fetch-cloudtcm-points.js — bulk-fetch the 361 standard acupoint pages from
 * CloudTCM's Next.js data endpoint into data/imports/cloudtcm/points/.
 *
 * RUN ON TING'S MACHINE (the sandbox cannot reach cloudtcm.com).
 *   node scripts/fetch-cloudtcm-points.js            # fetch all missing
 *   node scripts/fetch-cloudtcm-points.js --limit 5  # probe run (5 points)
 *   node scripts/fetch-cloudtcm-points.js --force LU1,PC6  # refetch specific codes
 *
 * Behavior:
 * - Probes the current buildId from https://cloudtcm.com/acupoint/161.
 * - Uses data/sources/cloudtcm_point_map.json (361 code→id) as the fetch list.
 * - Saves RAW JSON per point to data/imports/cloudtcm/points/{CODE}.json.
 * - Resumable: existing files are skipped unless --force.
 * - Rate-limited to 1 request / 600 ms. Do not lower this.
 * - Writes data/imports/cloudtcm/fetch_manifest.json (date, buildId, counts,
 *   failures) after every run.
 *
 * IMPORT POLICY (do not remove):
 * - Raw files are PRIVATE study staging only. CloudTCM content is theirs;
 *   AcuTing keeps per-point source URLs and must not republish this text.
 *   Public/Learn content must be rewritten and verified against WHO/authorized
 *   sources before any public use.
 * - This script writes ONLY under data/imports/cloudtcm/. It never touches
 *   data/acupoints/, data/generated/, or app runtime files.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const MAP_FILE = path.join(ROOT, "data", "sources", "cloudtcm_point_map.json");
const OUT_DIR = path.join(ROOT, "data", "imports", "cloudtcm", "points");
const MANIFEST_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "fetch_manifest.json");
const RATE_LIMIT_MS = 600;

const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Infinity;
const forceIndex = args.indexOf("--force");
const forceCodes = forceIndex >= 0 ? String(args[forceIndex + 1] || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) : [];

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "AcuTingOS-private-study/1.0", ...headers } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(new URL(res.headers.location, url).toString(), headers));
      }
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function probeBuildId() {
  const { status, body } = await get("https://cloudtcm.com/acupoint/161");
  if (status !== 200) throw new Error(`buildId probe failed: HTTP ${status}`);
  const match = body.match(/"buildId":"([^"]+)"/);
  if (!match) throw new Error("buildId not found in page HTML — CloudTCM may have changed frameworks. See docs/TCM_SOURCE_REGISTRY.md 末段.");
  return match[1];
}

async function main() {
  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  const points = map.points || {};
  const codes = Object.keys(points);
  console.log(`Map has ${codes.length} codes.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const buildId = await probeBuildId();
  console.log(`buildId: ${buildId}`);

  const failures = [];
  let fetched = 0;
  let skipped = 0;

  for (const code of codes) {
    if (fetched >= limit) break;
    const outFile = path.join(OUT_DIR, `${code}.json`);
    const force = forceCodes.includes(code);
    if (fs.existsSync(outFile) && !force) { skipped += 1; continue; }

    const id = points[code].id;
    const url = `https://cloudtcm.com/_next/data/${buildId}/acupoint/${id}.json`;
    try {
      const { status, body } = await get(url);
      if (status !== 200) throw new Error(`HTTP ${status}`);
      JSON.parse(body); // validate it is JSON before writing
      fs.writeFileSync(outFile, body);
      fetched += 1;
      console.log(`ok  ${code} (id ${id})  [${fetched} fetched / ${skipped} skipped]`);
    } catch (err) {
      failures.push({ code, id, url, error: String(err.message || err) });
      console.warn(`FAIL ${code} (id ${id}): ${err.message}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  const manifest = {
    source: "https://cloudtcm.com (Next.js data endpoint)",
    policy: "private study staging only; do not republish; rewrite + verify before any public use",
    last_run: new Date().toISOString(),
    build_id: buildId,
    total_codes: codes.length,
    fetched_this_run: fetched,
    skipped_existing: skipped,
    files_present: fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")).length,
    failures
  };
  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${manifest.files_present}/${codes.length} raw files present. Failures: ${failures.length}.`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_FILE)}`);
  if (failures.length) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exit(1); });

#!/usr/bin/env node
/**
 * Fetch exact MasterTungAcupuncture.org point-page identities and optionally
 * apply title/link fields to the 277-point canonical index.
 *
 * Usage:
 *   node scripts/fetch-mastertung-point-map.js --limit 5
 *   node scripts/fetch-mastertung-point-map.js
 *   node scripts/fetch-mastertung-point-map.js --apply
 *
 * Only identity metadata is retained: code, Chinese/English names, pinyin,
 * page URL, and verification method. Page prose and images are not copied.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const INDEX_FILE = path.join(ROOT, "data", "tung", "point_index.json");
const MAP_FILE = path.join(ROOT, "data", "sources", "mastertung_point_map.json");
const SITEMAP_URL = "https://www.mastertungacupuncture.org/sitemap.xml";
const RATE_LIMIT_MS = 1000;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const limitIndex = args.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Infinity;

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        accept: "text/html,application/xml",
        "user-agent": "AcuTingOS-private-study/1.0"
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        resolve(request(new URL(res.headers.location, url).toString()));
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function codeToken(code) {
  return String(code).replace(/^T/i, "").replace(/\./g, "").toLowerCase();
}

function sitemapRoutes(xml) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeHtml(match[1]))
    .filter((url) => url.includes("/acupuncture/tung/points/"));
  const routes = new Map();
  urls.forEach((url) => {
    const match = url.match(/-t-([a-z0-9]+)\/?$/i);
    if (!match) return;
    const token = match[1].toLowerCase();
    if (routes.has(token) && routes.get(token) !== url) {
      throw new Error(`Duplicate Master Tung route token ${token}`);
    }
    routes.set(token, url);
  });
  return routes;
}

function parsePointPage(html, expectedCode, pageUrl) {
  const codeMatch = html.match(/header_id_number[^>]*>([^<]+)</i);
  const nameEnMatch = html.match(/header_id_name_std[^>]*>([\s\S]*?)<\/div>/i);
  const identityMatch = html.match(/header_id_name_pinyin[^>]*>([\s\S]*?)<span[^>]*header_id_name_chinese[^>]*>\s*[\(（]([^<\)）]+)[\)）]\s*<\/span>/i);
  if (!codeMatch || !nameEnMatch || !identityMatch) {
    throw new Error("point identity header not found");
  }
  const pageCode = decodeHtml(codeMatch[1]).replace(/\s/g, "");
  if (codeToken(pageCode) !== codeToken(expectedCode)) {
    throw new Error(`code mismatch: expected ${expectedCode}, page says ${pageCode}`);
  }
  const namesZh = decodeHtml(identityMatch[2]).split(/[｜|]/).map((name) => name.trim()).filter(Boolean);
  if (!namesZh.length || !namesZh[0].match(/[\u3400-\u9fff]/)) {
    throw new Error("Chinese point name not found");
  }
  return {
    code: expectedCode,
    name_zh: namesZh[0],
    aliases_zh: namesZh.slice(1),
    name_en: decodeHtml(nameEnMatch[1]),
    pinyin_display: decodeHtml(identityMatch[1]),
    page_url: pageUrl,
    link_status: "direct",
    verified: true,
    verification_method: "page_code_and_identity_header"
  };
}

function writeMap(entries, failures, canonicalCount) {
  const output = {
    map_version: "1.0",
    updated_at: new Date().toISOString(),
    source_id: "mastertungacupuncture_point_pages",
    source_sitemap_url: SITEMAP_URL,
    policy: "Identity metadata and direct page URLs only; no page prose or images copied.",
    canonical_count: canonicalCount,
    mapped_count: entries.length,
    verified_count: entries.filter((entry) => entry.verified).length,
    failure_count: failures.length,
    entries,
    failures
  };
  fs.writeFileSync(MAP_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  return output;
}

function applyMap(indexData, entries) {
  const byCode = new Map(entries.map((entry) => [entry.code, entry]));
  const conflicts = [];
  let namesFilled = 0;
  let linksSet = 0;
  indexData.points.forEach((point) => {
    const mapped = byCode.get(point.code);
    if (!mapped) return;
    if (point.name_zh && point.name_zh !== mapped.name_zh) {
      conflicts.push({ code: point.code, field: "name_zh", current: point.name_zh, incoming: mapped.name_zh });
      return;
    }
    if (!point.name_zh) {
      point.name_zh = mapped.name_zh;
      namesFilled += 1;
    }
    point.aliases_zh = [...new Set([...(point.aliases_zh || []), ...mapped.aliases_zh])];
    point.source_urls = [...new Set([
      ...(point.source_urls || []).filter((url) => url !== "https://www.mastertungacupuncture.org/"),
      mapped.page_url
    ])];
    point.visual_links = [{
      label_zh: `董氏奇穴 · ${mapped.name_zh}`,
      label_en: `Master Tung · ${mapped.name_en}`,
      source: "MasterTungAcupuncture.org / eLotus CORE",
      url: mapped.page_url,
      link_status: "direct"
    }];
    point.identity_source_status = "source_checked";
    linksSet += 1;
  });
  if (conflicts.length) {
    throw new Error(`Refusing apply: ${conflicts.length} name conflict(s): ${JSON.stringify(conflicts.slice(0, 5))}`);
  }
  fs.writeFileSync(INDEX_FILE, `${JSON.stringify(indexData, null, 2)}\n`, "utf8");
  return { namesFilled, linksSet };
}

async function main() {
  const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  const points = indexData.points;
  if (!Array.isArray(points) || points.length !== 277) {
    throw new Error(`Expected 277 Tung points, found ${Array.isArray(points) ? points.length : "invalid data"}.`);
  }
  const sitemap = await request(SITEMAP_URL);
  if (sitemap.status !== 200) throw new Error(`Sitemap HTTP ${sitemap.status}`);
  const routes = sitemapRoutes(sitemap.body);
  const routeMisses = points.filter((point) => !routes.has(codeToken(point.code)));
  if (routeMisses.length) throw new Error(`Sitemap missing ${routeMisses.length} canonical codes.`);

  const previous = fs.existsSync(MAP_FILE)
    ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8"))
    : { entries: [] };
  const byCode = new Map((previous.entries || []).filter((entry) => entry.verified).map((entry) => [entry.code, entry]));
  const failures = [];
  let fetched = 0;

  for (const point of points) {
    if (byCode.has(point.code)) continue;
    if (fetched >= limit) break;
    const pageUrl = routes.get(codeToken(point.code));
    try {
      const response = await request(pageUrl);
      if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
      const entry = parsePointPage(response.body, point.code, pageUrl);
      byCode.set(point.code, entry);
      fetched += 1;
      console.log(`ok ${point.code} ${entry.name_zh} -> ${pageUrl}`);
    } catch (error) {
      failures.push({ code: point.code, page_url: pageUrl, error: error.message });
      console.warn(`FAIL ${point.code}: ${error.message}`);
    }
    writeMap(points.map((item) => byCode.get(item.code)).filter(Boolean), failures, points.length);
    await sleep(RATE_LIMIT_MS);
  }

  const entries = points.map((point) => byCode.get(point.code)).filter(Boolean);
  const output = writeMap(entries, failures, points.length);
  console.log(`Mapped ${output.mapped_count}/${output.canonical_count}; fetched ${fetched}; failures ${failures.length}.`);
  if (apply) {
    if (output.mapped_count !== points.length || failures.length) {
      throw new Error("Refusing apply until all 277 point identities are verified.");
    }
    const result = applyMap(indexData, entries);
    console.log(`Applied: ${result.namesFilled} Chinese names filled; ${result.linksSet} direct links set.`);
  } else {
    console.log("Dry run only. Re-run with --apply after reviewing the complete map.");
  }
  if (failures.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

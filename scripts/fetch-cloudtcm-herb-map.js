#!/usr/bin/env node
/**
 * Build the canonical herb -> CloudTCM direct-link map.
 *
 * The public /herb page contains a partial herb index. Canon herbs absent
 * from that index are resolved through CloudTCM's public name-search API.
 * A result is accepted only when HerbNameCH exactly equals the canonical
 * Chinese name. This script stores links and identity metadata only; it does
 * not copy article text.
 *
 * Usage:
 *   node scripts/fetch-cloudtcm-herb-map.js
 *   node scripts/fetch-cloudtcm-herb-map.js --limit 5
 *   node scripts/fetch-cloudtcm-herb-map.js --index-file path/to/herb.html
 *
 * Search is limited to one request per 6.5 seconds because CloudTCM's own UI
 * states a maximum of 10 searches per minute. Keep this delay conservative.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const CANON_FILE = path.join(ROOT, "data", "herbs", "herb_canon_shortlist.json");
const MAP_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "herb_url_map.json");
const INDEX_URL = "https://cloudtcm.com/herb";
const SEARCH_API = "https://search-api.cloudtcm.com/api/herb";
const SEARCH_DELAY_MS = 6500;

// Orthographic variants and established materia-medica synonyms confirmed by
// the CloudTCM result identity. Niu Xi is intentionally absent: the canonical
// Achyranthes Root must not be collapsed into CloudTCM's Chuan Niu Xi record.
const CONTROLLED_SYNONYMS = {
  "白豆蔻": { cloudtcm_id: 948, source_name_zh: "白荳蔻", pinyin_cloudtcm: "Bai Dou Kou" },
  "小茴香": { cloudtcm_id: 1218, source_name_zh: "茴香", pinyin_cloudtcm: "Hui Xiang" },
  "白及": { cloudtcm_id: 952, source_name_zh: "白笈", pinyin_cloudtcm: "Bai Ji" },
  "三棱": { cloudtcm_id: 1150, source_name_zh: "三稜", pinyin_cloudtcm: "San Leng" },
  "瓜蔞": { cloudtcm_id: 1783, source_name_zh: "栝蔞", pinyin_cloudtcm: "Gua Lou" },
  "蘇子": { cloudtcm_id: 1254, source_name_zh: "紫蘇子", pinyin_cloudtcm: "Zi Su Zi" },
  "菟絲子": { cloudtcm_id: 1196, source_name_zh: "菟蕬子", pinyin_cloudtcm: "Tu Si Zi" },
  "佛手": { cloudtcm_id: 4183, source_name_zh: "佛手柑", pinyin_cloudtcm: "Fo Shou Gan" },
  "茜草": { cloudtcm_id: 1135, source_name_zh: "茜草根", pinyin_cloudtcm: "Qian Cao Gen" },
  "烏賊骨": { cloudtcm_id: 1058, source_name_zh: "海螵蛸", pinyin_cloudtcm: "Hai Piao Shao" }
};

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const limitArg = valueAfter("--limit");
const limitValue = limitArg === null ? NaN : Number(limitArg);
const searchLimit = Number.isFinite(limitValue) && limitValue >= 0 ? limitValue : Infinity;
const indexFile = valueAfter("--index-file");

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        accept: "text/html,application/json",
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

function parseNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("CloudTCM __NEXT_DATA__ was not found; page structure may have changed.");
  return JSON.parse(match[1]);
}

function collectIndexedHerbs(nextData) {
  const rows = nextData?.props?.pageProps?.pageData?.main;
  if (!Array.isArray(rows)) throw new Error("CloudTCM herb index rows were not found.");
  const byName = new Map();
  rows.forEach((row) => {
    if (!Number.isInteger(row.HerbID) || typeof row.HerbNameCH !== "string") return;
    const candidate = {
      cloudtcm_id: row.HerbID,
      name_zh: row.HerbNameCH.trim(),
      name_en_cloudtcm: String(row.HerbNameEN || "").trim() || null,
      pinyin_cloudtcm: null,
      image_url: row.HerbPic || null,
      verification_method: "cloudtcm_public_index_exact_name"
    };
    const existing = byName.get(candidate.name_zh);
    if (existing && existing.cloudtcm_id !== candidate.cloudtcm_id) {
      throw new Error(`Ambiguous CloudTCM index name ${candidate.name_zh}: ${existing.cloudtcm_id}, ${candidate.cloudtcm_id}`);
    }
    byName.set(candidate.name_zh, candidate);
  });
  return byName;
}

async function searchExact(nameZh) {
  const query = new URLSearchParams({ text: nameZh, type: "Query Name" });
  const { status, body } = await request(`${SEARCH_API}?${query}`);
  if (status !== 200) throw new Error(`HTTP ${status}`);
  const rows = JSON.parse(body);
  if (!Array.isArray(rows)) throw new Error("Search response is not an array.");
  const exact = rows.filter((row) => String(row.HerbNameCH || "").trim() === nameZh);
  const distinctIds = [...new Set(exact.map((row) => row.HerbID).filter(Number.isInteger))];
  if (distinctIds.length !== 1) {
    return {
      match: null,
      reason: distinctIds.length ? `ambiguous_exact_ids:${distinctIds.join(",")}` : "no_exact_name_match",
      candidates: rows.slice(0, 5).map((row) => ({
        cloudtcm_id: row.HerbID,
        name_zh: row.HerbNameCH,
        pinyin: row.PinyingName || null
      }))
    };
  }
  const row = exact.find((item) => item.HerbID === distinctIds[0]);
  return {
    match: {
      cloudtcm_id: row.HerbID,
      name_zh: nameZh,
      name_en_cloudtcm: String(row.HerbNameEN || "").trim() || null,
      pinyin_cloudtcm: String(row.PinyingName || "").trim() || null,
      image_url: row.HerbPic || null,
      verification_method: "cloudtcm_name_search_exact_name"
    },
    reason: null,
    candidates: []
  };
}

function mapEntry(canon, match) {
  return {
    herb_id: canon.id,
    name_zh: canon.name_zh,
    source_name_zh: match.source_name_zh || match.name_zh,
    cloudtcm_id: match.cloudtcm_id,
    page_url: `https://cloudtcm.com/herb/${match.cloudtcm_id}`,
    image_url: match.image_url,
    name_en_cloudtcm: match.name_en_cloudtcm,
    pinyin_cloudtcm: match.pinyin_cloudtcm,
    link_status: "direct",
    verified: true,
    verification_method: match.verification_method
  };
}

async function main() {
  const canonData = JSON.parse(fs.readFileSync(CANON_FILE, "utf8"));
  const canon = canonData.records;
  if (!Array.isArray(canon) || canon.length !== 202) {
    throw new Error(`Expected 202 canonical herbs, found ${Array.isArray(canon) ? canon.length : "invalid data"}.`);
  }

  let html;
  if (indexFile) {
    html = fs.readFileSync(path.resolve(indexFile), "utf8");
  } else {
    const response = await request(INDEX_URL);
    if (response.status !== 200) throw new Error(`CloudTCM herb index HTTP ${response.status}`);
    html = response.body;
  }
  const nextData = parseNextData(html);
  const indexed = collectIndexedHerbs(nextData);
  const previous = fs.existsSync(MAP_FILE)
    ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8"))
    : { entries: [] };
  const previousById = new Map((previous.entries || []).filter((entry) => entry.verified).map((entry) => [entry.herb_id, entry]));

  const entries = [];
  const unmatched = [];
  let searched = 0;
  let reused = 0;
  let indexMatches = 0;
  let searchMatches = 0;

  for (const herb of canon) {
    const direct = indexed.get(herb.name_zh);
    if (direct) {
      entries.push(mapEntry(herb, direct));
      indexMatches += 1;
      continue;
    }

    const synonym = CONTROLLED_SYNONYMS[herb.name_zh];
    if (synonym) {
      entries.push(mapEntry(herb, {
        ...synonym,
        name_zh: herb.name_zh,
        name_en_cloudtcm: null,
        image_url: null,
        verification_method: "controlled_materia_medica_synonym"
      }));
      continue;
    }

    const old = previousById.get(herb.id);
    if (old && old.name_zh === herb.name_zh && Number.isInteger(old.cloudtcm_id)) {
      entries.push(old);
      reused += 1;
      continue;
    }

    if (searched >= searchLimit) {
      unmatched.push({ herb_id: herb.id, name_zh: herb.name_zh, reason: "not_searched_limit", candidates: [] });
      continue;
    }

    try {
      console.log(`search ${herb.name_zh} (${searched + 1})`);
      const result = await searchExact(herb.name_zh);
      searched += 1;
      if (result.match) {
        entries.push(mapEntry(herb, result.match));
        searchMatches += 1;
      } else {
        unmatched.push({ herb_id: herb.id, name_zh: herb.name_zh, reason: result.reason, candidates: result.candidates });
      }
    } catch (error) {
      searched += 1;
      unmatched.push({ herb_id: herb.id, name_zh: herb.name_zh, reason: `request_failed:${error.message}`, candidates: [] });
    }
    if (searched < searchLimit) await sleep(SEARCH_DELAY_MS);
  }

  entries.sort((a, b) => canon.findIndex((herb) => herb.id === a.herb_id) - canon.findIndex((herb) => herb.id === b.herb_id));
  const output = {
    map_version: "1.0",
    updated_at: new Date().toISOString(),
    source_id: "cloudtcm_herb_pages",
    source_index_url: INDEX_URL,
    source_search_api: SEARCH_API,
    policy: "Links and identity metadata only; no article text copied. Exact Chinese-name matches only.",
    canonical_count: canon.length,
    mapped_count: entries.length,
    verified_count: entries.filter((entry) => entry.verified).length,
    unmatched_count: unmatched.length,
    summary: {
      public_index_exact_matches: indexMatches,
      verified_entries_reused: reused,
      search_requests_this_run: searched,
      search_exact_matches_this_run: searchMatches
    },
    entries,
    unmatched
  };
  fs.writeFileSync(MAP_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Mapped ${output.mapped_count}/${output.canonical_count}; unmatched ${output.unmatched_count}.`);
  console.log(`Index ${indexMatches}; reused ${reused}; search matches ${searchMatches}/${searched}.`);
  if (unmatched.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

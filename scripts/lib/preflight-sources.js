/**
 * scripts/lib/preflight-sources.js
 *
 * Task 9A deterministic local source parser (Fast Mode),
 * and real HTTP transport verification (Deep Mode).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { loadJsonStrict } = require('./preflight-hygiene');

const REPO_PREFIXES = ['curriculum/', 'docs/', 'data/', 'scripts/'];

function cleanUrlAnnotation(rawUrl) {
  let u = rawUrl.trim();
  u = u.replace(/[\uff0c\u3001\uff1b,;]+$/, '');
  u = u.replace(/\uff08[^\uff09]*\uff09?$/g, '').trim();
  u = u.replace(/\([^\)]*(?:verified|checked|\u67e5\u8a60|\u78ba\u8a8d|\u4f86\u6e90|\u8a3b\u89e3)[^\)]*\)?$/gi, '').trim();
  return u;
}

function tokenizeProvenance(rawStr, repoRoot = path.resolve(__dirname, '../..')) {
  if (typeof rawStr !== 'string') return { urls: [], paths: [], hasExtractedUrl: false, hasExtractedPath: false };

  const raw = rawStr.trim();
  const urls = [];
  const paths = [];

  let hasExtractedUrl = false;
  let hasExtractedPath = false;

  // A. URL Extraction
  const urlRegex = /https?:\/\/[^\s"'<>，、；]+/g;
  let match;
  while ((match = urlRegex.exec(raw)) !== null) {
    const rawMatch = match[0];
    const cleanUrl = cleanUrlAnnotation(rawMatch);
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      urls.push({
        rawRef: rawMatch,
        cleanUrl,
        isHttps: cleanUrl.startsWith('https://')
      });
      hasExtractedUrl = true;
    }
  }

  // B. Repo-relative paths
  const hasPrefix = REPO_PREFIXES.some(prefix => raw.includes(prefix));

  if (hasPrefix) {
    REPO_PREFIXES.forEach(prefix => {
      let searchIdx = 0;
      while ((searchIdx = raw.indexOf(prefix, searchIdx)) !== null && searchIdx !== -1) {
        const sub = raw.slice(searchIdx);
        searchIdx += prefix.length;

        const extRegex = /\.(pdf|md|json|html|doc\.md|docx|txt)\b/gi;
        const candidates = [];
        let extMatch;

        while ((extMatch = extRegex.exec(sub)) !== null) {
          const matchEnd = extMatch.index + extMatch[0].length;
          const candidatePath = sub.slice(0, matchEnd).trim();

          const afterExt = sub.slice(matchEnd);
          let anchor = '';
          const anchorMatch = afterExt.match(/^(?:#(?:L\d+(?:-L\d+)?|p\d+(?:-p\d+)?|[a-zA-Z0-9_\-\.]+))/i);
          if (anchorMatch) {
            anchor = anchorMatch[0];
          }

          const rawRef = candidatePath + anchor;
          const cleanPath = candidatePath;
          const fullPath = path.resolve(repoRoot, cleanPath);
          const exists = fs.existsSync(fullPath);

          candidates.push({
            rawRef,
            cleanPath,
            exists,
            len: cleanPath.length
          });
        }

        if (candidates.length === 0) continue;

        const existingCandidates = candidates.filter(c => c.exists);
        let chosen;
        if (existingCandidates.length > 0) {
          chosen = existingCandidates.sort((a, b) => b.len - a.len)[0];
          paths.push({
            rawRef: chosen.rawRef,
            cleanPath: chosen.cleanPath,
            classification: 'LOCAL_EXISTS'
          });
          hasExtractedPath = true;
        } else {
          chosen = candidates[0];
          paths.push({
            rawRef: chosen.rawRef,
            cleanPath: chosen.cleanPath,
            classification: 'LOCAL_MISSING'
          });
          hasExtractedPath = true;
        }
      }
    });
  }

  // C. Standalone bare file references
  if (!hasExtractedPath && !hasExtractedUrl && /\.(pdf|md|json|html)\b/i.test(raw)) {
    const bareMatch = raw.match(/[a-zA-Z0-9_\-]+\.(?:pdf|md|json|html)/i);
    if (bareMatch) {
      const cleanPath = bareMatch[0];
      const exists = fs.existsSync(path.resolve(repoRoot, cleanPath));
      paths.push({
        rawRef: raw.trim(),
        cleanPath,
        classification: exists ? 'LOCAL_EXISTS' : 'LOCAL_MISSING'
      });
      hasExtractedPath = true;
    }
  }

  return { urls, paths, hasExtractedUrl, hasExtractedPath };
}

function probeUrl(targetUrl, timeoutMs = 10000) {
  return new Promise((resolve) => {
    let currentUrl = targetUrl;
    let redirectCount = 0;

    function doRequest(reqUrl) {
      try {
        const parsed = new URL(reqUrl);
        const protocol = parsed.protocol === 'https:' ? https : http;
        const options = {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AcuTingPreflight/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: timeoutMs
        };

        const req = protocol.request(options, (res) => {
          const status = res.statusCode || 0;
          if (status >= 300 && status < 400 && res.headers.location && redirectCount < 5) {
            redirectCount++;
            let nextLoc = res.headers.location;
            if (nextLoc.startsWith('/')) {
              nextLoc = `${parsed.protocol}//${parsed.hostname}${nextLoc}`;
            }
            res.resume();
            return doRequest(nextLoc);
          }

          res.resume();
          if (status === 200) {
            resolve({
              url: targetUrl,
              finalUrl: reqUrl,
              statusCode: status,
              classification: redirectCount > 0 ? 'REDIRECT_TO_200' : 'OK_200'
            });
          } else if (status >= 400 && status < 500) {
            resolve({
              url: targetUrl,
              finalUrl: reqUrl,
              statusCode: status,
              classification: 'DEAD_4XX'
            });
          } else if (status >= 500 && status < 600) {
            resolve({
              url: targetUrl,
              finalUrl: reqUrl,
              statusCode: status,
              classification: 'SERVER_5XX'
            });
          } else {
            resolve({
              url: targetUrl,
              finalUrl: reqUrl,
              statusCode: status,
              classification: 'OTHER_HTTP_STATUS'
            });
          }
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            url: targetUrl,
            finalUrl: reqUrl,
            statusCode: 0,
            classification: 'TIMEOUT'
          });
        });

        req.on('error', (err) => {
          resolve({
            url: targetUrl,
            finalUrl: reqUrl,
            statusCode: 0,
            classification: 'NETWORK_ERROR',
            error: err.message
          });
        });

        req.end();
      } catch (err) {
        resolve({
          url: targetUrl,
          finalUrl: reqUrl,
          statusCode: 0,
          classification: 'NETWORK_ERROR',
          error: err.message
        });
      }
    }

    doRequest(currentUrl);
  });
}

async function auditSourceIntegrity(options = {}) {
  const root = options.root || path.resolve(__dirname, '../..');
  const isDeep = options.deep || false;

  const herbsPath = path.join(root, 'data/herbs/herb_canon_shortlist.json');
  const formulasPath = path.join(root, 'data/herbs/formulas.json');

  const herbs = loadJsonStrict(herbsPath).records || [];
  const formulas = loadJsonStrict(formulasPath).records || [];

  const localPathsList = [];
  const allHttpUrls = new Set();

  function scanFields(record) {
    const fieldsToCheck = [
      record.safety_source_url,
      record.exact_source_url,
      record.cloudtcm_url,
      record.american_dragon_url,
      record.atlas_url,
      record.image,
      record.image_url,
      record.modern_functions_source_url,
      ...(Array.isArray(record.source_urls) ? record.source_urls : []),
      ...(Array.isArray(record.source_citations) ? record.source_citations.map(c => c.url) : []),
      ...(Array.isArray(record.herb_drug_interaction_sources) ? record.herb_drug_interaction_sources : [])
    ];

    if (record.field_sources && typeof record.field_sources === 'object') {
      function scanObj(obj) {
        Object.values(obj).forEach(val => {
          if (typeof val === 'string') fieldsToCheck.push(val);
          else if (Array.isArray(val)) val.forEach(v => {
            if (typeof v === 'string') fieldsToCheck.push(v);
            else if (typeof v === 'object' && v !== null) scanObj(v);
          });
          else if (typeof val === 'object' && val !== null) scanObj(val);
        });
      }
      scanObj(record.field_sources);
    }

    fieldsToCheck.forEach(f => {
      if (!f) return;
      const tok = tokenizeProvenance(String(f), root);
      tok.paths.forEach(p => localPathsList.push(p));
      tok.urls.forEach(u => allHttpUrls.add(u.cleanUrl));
    });
  }

  herbs.forEach(scanFields);
  formulas.forEach(scanFields);

  const localExists = localPathsList.filter(p => p.classification === 'LOCAL_EXISTS');
  const localMissing = localPathsList.filter(p => p.classification === 'LOCAL_MISSING');

  const uniqueLocalPaths = new Set(localPathsList.map(p => p.cleanPath));
  const uniqueMissingLocalPaths = new Set(localMissing.map(p => p.cleanPath));

  const result = {
    isDeep,
    local_reference_count: localPathsList.length,
    local_exists_reference_count: localExists.length,
    local_missing_reference_count: localMissing.length,
    unique_local_path_count: uniqueLocalPaths.size,
    unique_missing_local_path_count: uniqueMissingLocalPaths.size,
    unique_missing_local_paths: Array.from(uniqueMissingLocalPaths),
    total_http_urls_count: allHttpUrls.size,
    httpResults: null
  };

  if (isDeep) {
    const urlsArray = Array.from(allHttpUrls);
    const probeResults = [];
    const concurrency = 20;

    for (let i = 0; i < urlsArray.length; i += concurrency) {
      const batch = urlsArray.slice(i, i + concurrency);
      const batchRes = await Promise.all(batch.map(u => probeUrl(u)));
      probeResults.push(...batchRes);
    }

    const dead4xx = probeResults.filter(r => r.classification === 'DEAD_4XX');
    const ok200 = probeResults.filter(r => r.classification === 'OK_200' || r.classification === 'REDIRECT_TO_200');

    result.httpResults = {
      totalProbed: probeResults.length,
      ok200Count: ok200.length,
      dead4xxCount: dead4xx.length,
      dead4xxUrls: dead4xx.map(d => d.url),
      server5xxCount: probeResults.filter(r => r.classification === 'SERVER_5XX').length,
      timeoutCount: probeResults.filter(r => r.classification === 'TIMEOUT').length,
      networkErrorCount: probeResults.filter(r => r.classification === 'NETWORK_ERROR').length,
      otherStatusCount: probeResults.filter(r => r.classification === 'OTHER_HTTP_STATUS').length,
      probeResults
    };
  } else {
    result.httpResults = 'HTTP_NOT_RUN_IN_FAST_MODE';
  }

  return result;
}

module.exports = {
  tokenizeProvenance,
  probeUrl,
  auditSourceIntegrity
};

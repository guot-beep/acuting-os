/**
 * scripts/lib/preflight-sources.js
 *
 * Exact Task 9A Round 4 deterministic source provenance parser and field inventory:
 * - Anti-bare-tail invariant
 * - Exact URL/path tokenization with parentheses and unicode handling
 * - Scans all URL-bearing direct fields, visual_links, external_links, formula_family, field_sources
 * - Fast Mode: local deterministic check (6241 local refs, 5624 LOCAL_EXISTS, 617 LOCAL_MISSING, 1260 unique HTTP URLs)
 * - Deep Mode: asynchronous HTTP transport audit (OK_200, REDIRECT_TO_200, DEAD_4XX, SERVER_5XX, TIMEOUT, OTHER_HTTP_STATUS, NETWORK_ERROR)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { loadJsonStrict } = require('./preflight-hygiene');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AcuTing-Source-Integrity-Audit/4.0';
const TIMEOUT_MS = 10000;
const CONCURRENCY = 15;
const MAX_REDIRECTS = 5;

const REPO_PREFIXES = ['curriculum/', 'docs/', 'data/', 'scripts/'];
const VALID_EXTENSIONS = ['.pdf', '.md', '.json', '.html', '.txt', '.csv', '.js', '.tsv', '.png', '.jpg', '.jpeg', '.xlsx'];

function tokenizeProvenance(text, repoRoot = path.resolve(__dirname, '../..')) {
  if (typeof text !== 'string') return { urls: [], paths: [], hasExtractedUrl: false, hasExtractedPath: false };
  const raw = text.trim();
  if (!raw) return { urls: [], paths: [], hasExtractedUrl: false, hasExtractedPath: false };

  const urls = [];
  const paths = [];

  // A. URL Tokenizer
  const urlRegex = /https?:\/\/[^\s\u3000\u4e00-\u9fa5\uff08\uff09\u3001\u3002\uff0c\uff1b\uff1a"']+/gi;
  let match;
  let hasExtractedUrl = false;

  while ((match = urlRegex.exec(raw)) !== null) {
    let u = match[0];
    
    // Strip trailing ASCII & Chinese punctuation
    while (/[.,;:\uff0c\u3001\u3002\uff1b\uff1a]$/.test(u)) {
      u = u.slice(0, -1);
    }

    // Peel off trailing unbalanced closing parenthesis
    const openParen = (u.match(/\(/g) || []).length;
    const closeParen = (u.match(/\)/g) || []).length;
    if (closeParen > openParen && u.endsWith(')')) {
      u = u.slice(0, -(closeParen - openParen));
    }

    // Re-strip trailing punctuation
    while (/[.,;:\uff0c\u3001\u3002\uff1b\uff1a]$/.test(u)) {
      u = u.slice(0, -1);
    }

    if (u.length > 8) {
      hasExtractedUrl = true;
      let malformed = null;
      if (raw !== text && raw.includes(u)) malformed = 'LEADING_OR_TRAILING_WHITESPACE';
      if (u.includes(' ')) malformed = 'CONTAINS_SPACES';
      
      urls.push({
        rawUrl: match[0],
        cleanUrl: u,
        malformedIssue: malformed
      });
    }
  }

  // B. Missing scheme URL e.g. www.domain.com
  if (!hasExtractedUrl && /^www\.[a-z0-9]/i.test(raw)) {
    const clean = raw.split(/[\s\uff08\uff09\(\),;\uff0c\uff1b]/)[0].trim();
    urls.push({
      rawUrl: raw,
      cleanUrl: 'https://' + clean,
      malformedIssue: 'MISSING_SCHEME'
    });
    hasExtractedUrl = true;
  }

  // C. Local Repository Path Tokenizer
  const prefixMatches = [];
  REPO_PREFIXES.forEach(prefix => {
    let pos = 0;
    while ((pos = raw.indexOf(prefix, pos)) !== -1) {
      prefixMatches.push({ prefix, start: pos });
      pos += prefix.length;
    }
  });

  let hasExtractedPath = false;

  if (prefixMatches.length > 0) {
    prefixMatches.sort((a, b) => a.start - b.start);

    prefixMatches.forEach(({ prefix, start }) => {
      const rest = raw.slice(start);
      const candidates = [];

      VALID_EXTENSIONS.forEach(ext => {
        let extPos = 0;
        const lowerRest = rest.toLowerCase();
        while ((extPos = lowerRest.indexOf(ext, extPos)) !== -1) {
          const extEnd = extPos + ext.length;
          const afterChar = rest.charAt(extEnd);
          if (!afterChar || afterChar === '#' || /[\s\r\n;,，、；。\uff0c\u3001\u3002\uff1b\uff1a\(\)（）"']/.test(afterChar)) {
            let candidateClean = rest.slice(0, extEnd).trim();
            let candidateRaw = candidateClean;
            const afterRest = rest.slice(extEnd);
            const anchorMatch = afterRest.match(/^#(?:p\d+|L\d+(?:-L\d+)?|[a-zA-Z0-9_\-\.]*)/i);
            if (anchorMatch && anchorMatch[0]) {
              candidateRaw += anchorMatch[0];
            }
            const exists = fs.existsSync(path.resolve(repoRoot, candidateClean));
            candidates.push({
              rawRef: candidateRaw,
              cleanPath: candidateClean,
              exists,
              length: candidateClean.length
            });
          }
          extPos += ext.length;
        }
      });

      if (candidates.length > 0) {
        hasExtractedPath = true;
        const existingCandidates = candidates.filter(c => c.exists);
        let chosen;
        if (existingCandidates.length > 0) {
          existingCandidates.sort((a, b) => b.length - a.length);
          chosen = existingCandidates[0];
          paths.push({
            rawRef: chosen.rawRef,
            cleanPath: chosen.cleanPath,
            classification: 'LOCAL_EXISTS'
          });
        } else {
          candidates.sort((a, b) => b.length - a.length);
          chosen = candidates[0];
          paths.push({
            rawRef: chosen.rawRef,
            cleanPath: chosen.cleanPath,
            classification: 'LOCAL_MISSING'
          });
        }

        if (!REPO_PREFIXES.some(pre => chosen.cleanPath.startsWith(pre))) {
          throw new Error(`Path Parser Invariant Violation: CleanPath "${chosen.cleanPath}" is a bare tail filename!`);
        }
      }
    });
  }

  // D. Standalone bare file references
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

function probeUrl(targetUrl, timeoutMs = TIMEOUT_MS) {
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
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: timeoutMs
        };

        const req = protocol.request(options, (res) => {
          const status = res.statusCode || 0;
          if (status >= 300 && status < 400 && res.headers.location && redirectCount < MAX_REDIRECTS) {
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

  const herbsData = loadJsonStrict(herbsPath);
  const formulasData = loadJsonStrict(formulasPath);

  const herbs = herbsData.records || herbsData;
  const formulas = formulasData.records || formulasData;

  const allUrlReferences = [];
  const allLocalReferences = [];
  const otherTextReferences = [];

  function extractFromRecord(record, entityType) {
    const recordId = record.id || record.code || 'unknown';

    function processField(val, fieldPath) {
      if (typeof val !== 'string') return;
      const res = tokenizeProvenance(val, root);

      if (res.urls.length > 0) {
        res.urls.forEach(u => {
          allUrlReferences.push({
            rawUrl: u.rawUrl,
            cleanUrl: u.cleanUrl,
            entityType,
            recordId,
            fieldPath,
            malformedIssue: u.malformedIssue
          });
        });
      }

      if (res.paths.length > 0) {
        res.paths.forEach(p => {
          allLocalReferences.push({
            rawRef: p.rawRef,
            cleanPath: p.cleanPath,
            entityType,
            recordId,
            fieldPath,
            classification: p.classification
          });
        });
      }

      if (!res.hasExtractedUrl && !res.hasExtractedPath) {
        otherTextReferences.push({
          text: val.trim(),
          entityType,
          recordId,
          fieldPath,
          classification: 'NOT_A_FILE_REFERENCE'
        });
      }
    }

    function walk(obj, currentPath) {
      if (obj === null || obj === undefined) return;
      if (typeof obj === 'string') {
        processField(obj, currentPath);
      } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
          walk(item, currentPath + '[' + idx + ']');
        });
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(k => {
          const nextPath = currentPath ? currentPath + '.' + k : k;
          walk(obj[k], nextPath);
        });
      }
    }

    const directFields = [
      'safety_source_url', 'exact_source_url', 'cloudtcm_url', 'american_dragon_url',
      'atlas_url', 'image', 'image_url', 'modern_functions_source_url', 'tags_source_url',
      'source_urls', 'herb_drug_interaction_sources', 'source_citations', 'external_links',
      'visual_links', 'formula_family', 'field_sources'
    ];

    directFields.forEach(f => {
      if (record[f] !== undefined) {
        walk(record[f], f);
      }
    });
  }

  herbs.forEach(r => extractFromRecord(r, 'herb'));
  formulas.forEach(r => extractFromRecord(r, 'formula'));

  const uniqueUrlMap = new Map();
  allUrlReferences.forEach(ref => {
    if (!uniqueUrlMap.has(ref.cleanUrl)) {
      uniqueUrlMap.set(ref.cleanUrl, { cleanUrl: ref.cleanUrl, references: [] });
    }
    uniqueUrlMap.get(ref.cleanUrl).references.push(ref);
  });

  const localExists = allLocalReferences.filter(p => p.classification === 'LOCAL_EXISTS');
  const localMissing = allLocalReferences.filter(p => p.classification === 'LOCAL_MISSING');

  const uniqueLocalPaths = new Set(allLocalReferences.map(p => p.cleanPath));
  const uniqueMissingLocalPaths = new Set(localMissing.map(p => p.cleanPath));

  const result = {
    isDeep,
    local_reference_count: allLocalReferences.length,
    local_exists_reference_count: localExists.length,
    local_missing_reference_count: localMissing.length,
    unique_local_path_count: uniqueLocalPaths.size,
    unique_missing_local_path_count: uniqueMissingLocalPaths.size,
    unique_missing_local_paths: Array.from(uniqueMissingLocalPaths),
    total_url_references_count: allUrlReferences.length,
    total_http_urls_count: uniqueUrlMap.size,
    httpResults: null
  };

  if (isDeep) {
    const urlsArray = Array.from(uniqueUrlMap.keys());
    const probeResults = [];

    for (let i = 0; i < urlsArray.length; i += CONCURRENCY) {
      const batch = urlsArray.slice(i, i + CONCURRENCY);
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

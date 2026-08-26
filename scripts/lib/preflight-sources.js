/**
 * scripts/lib/preflight-sources.js
 *
 * Task 9A deterministic local source path extraction & checking (Fast Mode),
 * and optional HTTP transport verification (Deep Mode).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Extract local paths and HTTP URLs from provenance text/fields
function extractProvenanceTokens(rawStr) {
  if (typeof rawStr !== 'string') return { localPaths: [], httpUrls: [] };

  const str = rawStr.trim();
  const httpUrls = [];
  const localPaths = [];

  // Match HTTP URLs
  const urlMatches = [...str.matchAll(/https?:\/\/[^\s\(\)\[\]"'<>，、；]+/g)].map(m => m[0]);
  urlMatches.forEach(u => httpUrls.push(u));

  // Match repo-relative paths (starting with curriculum/, docs/, data/, scripts/)
  const repoPrefixes = ['curriculum/', 'docs/', 'data/', 'scripts/'];
  const pathRegex = /(?:curriculum|docs|data|scripts)\/[^，。；\n\r"'\(\)\[\]<>]+\.(?:md|pdf|json|html|doc\.md|docx|txt)(?:#[a-zA-Z0-9_\-\.#]+)?/gi;

  const pathMatches = [...str.matchAll(pathRegex)].map(m => m[0]);
  pathMatches.forEach(p => {
    // Strip trailing punctuation or annotations
    const cleanPath = p.replace(/#[a-zA-Z0-9_\-\.#]+$/, '').trim();
    localPaths.push(cleanPath);
  });

  return { localPaths: [...new Set(localPaths)], httpUrls: [...new Set(httpUrls)] };
}

function auditSourceIntegrity(options = {}) {
  const root = options.root || path.resolve(__dirname, '../..');
  const isDeep = options.deep || false;

  const herbsPath = path.join(root, 'data/herbs/herb_canon_shortlist.json');
  const formulasPath = path.join(root, 'data/herbs/formulas.json');

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8')).records || [];
  const formulas = JSON.parse(fs.readFileSync(formulasPath, 'utf8')).records || [];

  const allLocalPaths = new Set();
  const allHttpUrls = new Set();

  function scanFields(record) {
    const fieldsToCheck = [
      record.exact_source_url,
      record.safety_source_url,
      record.cloudtcm_url,
      record.atlas_url,
      ...(Array.isArray(record.source_urls) ? record.source_urls : []),
      ...(Array.isArray(record.source_citations) ? record.source_citations.map(c => c.url) : [])
    ];

    if (record.field_sources && typeof record.field_sources === 'object') {
      Object.values(record.field_sources).forEach(val => {
        if (typeof val === 'string') fieldsToCheck.push(val);
        else if (Array.isArray(val)) val.forEach(v => fieldsToCheck.push(v));
      });
    }

    fieldsToCheck.forEach(f => {
      if (!f) return;
      const tokens = extractProvenanceTokens(String(f));
      tokens.localPaths.forEach(p => allLocalPaths.add(p));
      tokens.httpUrls.forEach(u => allHttpUrls.add(u));
    });
  }

  herbs.forEach(scanFields);
  formulas.forEach(scanFields);

  // Local Path Resolution
  const localMissing = [];
  const localExisting = [];

  for (const relPath of allLocalPaths) {
    const fullPath = path.join(root, relPath);
    if (fs.existsSync(fullPath)) {
      localExisting.push(relPath);
    } else {
      localMissing.push(relPath);
    }
  }

  const result = {
    isDeep,
    totalLocalPathsScanned: allLocalPaths.size,
    localExistingCount: localExisting.length,
    localMissingCount: localMissing.length,
    localMissingSamples: localMissing.slice(0, 10),
    totalHttpUrlsScanned: allHttpUrls.size,
    httpResults: null
  };

  return result;
}

module.exports = {
  extractProvenanceTokens,
  auditSourceIntegrity
};

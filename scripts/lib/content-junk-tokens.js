/**
 * content-junk-tokens.js — single source of truth for scraped page-structure
 * "header" tokens that leak into content arrays during bulk source fills
 * (CloudTCM etc.). Shared by scripts/validate-content-junk.js (detect) and
 * scripts/clean-content-junk.js (remove).
 *
 * These are matched ONLY as a whole standalone array element (exact trim
 * equality), never as a substring — a real indication/function is never
 * literally just the word "功效" or "主治", so exact-match is false-positive safe.
 *
 * Add a token here when a new scraped header is found; both the detector and
 * the cleaner pick it up automatically.
 */
module.exports = {
  JUNK_TOKENS: new Set([
    "其他功效",
    "主治功效",
    "藥理作用",
    "現代藥理",
    "臨床應用",
    "功效",
    "主治",
    "性味",
    "性味歸經",
    "歸經",
    "用法用量",
    "用法與用量",
    "注意事項",
    "禁忌",
    "參考資料",
    "相關資訊",
    "其他",
    "以上"
  ]),
  // canonical data files scanned; generated + imports (staging) are excluded
  CONTENT_FILES: [
    "data/herbs/herb_canon_shortlist.json",
    "data/herbs/formulas.json",
    "data/acupoints/361.json",
    "data/pathology/condition_canon_shortlist.json",
    "data/pathology/pattern_library.json"
  ]
};

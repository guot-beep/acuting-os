/**
 * validate-encoding.js — 抓「中文欄位裡沒有中文」「置換字元 �」「問號串 ????」三種編碼/語言錯置。
 *
 * 豁免一律**依路徑**不依值(依值會把真缺口一起放掉),每一條都寫明它錯的方式:
 *   - data/audits、data/imports 整個不掃(帳本與匯入暫存,不上畫面)。
 *   - field_sources.*:值是引用路徑/網址,不是散文。
 *   - 整個值就是一個 URL(*_urls_zh 裝 cloudtcm 圖片網址)。
 *   - external_links/visual_links 的 label_zh(品牌名)、with_label_zh(西藥學名)、
 *     research_staging criteria[].zh 與 schema.json / field_definitions.*(描述欄位的設定)。
 *   - extraction_artifact_removed.removed_verbatim(2026-09-05):這個欄位的契約是「逐字保存
 *     被移除的 PDF 頁尾殘渣,以備歸屬裁定」(herb_pairs 兩筆:" �2013 TCM Review Seminars TM 7 …")。
 *     那個 � 不是本庫的編碼壞了,是被移除的原文抓進來時就長那樣;把它「修」成 © 等於竄改證物,
 *     刪掉又違反它自己的用途。所以只對這一個路徑尾巴跳過 �/問號檢查;� 出現在任何其他欄位照抓
 *     (負控:同結構暫存檔裡 indication_en 塞 � 仍被報 replacement_character)。
 *
 * 用法:node scripts/validate-encoding.js [--summary-only] [--json]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(ROOT, "data");
const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const REPLACEMENT_RE = /\uFFFD|ï¿½/;
const QUESTION_ONLY_RE = /^\?{2,}$/;
const QUESTION_DAMAGE_RE = /\?{3,}/;
const CHINESE_FIELD_RE = /(^|_)(zh|chinese)$/i;

function listJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // audits = merge/驗證帳本(JSON key 本身常是檔案路徑或 en 對照,不是內容);
      // imports = 匯入暫存,不上畫面。兩者的命中全是誤報,見
      // docs/UNWIRED_VALIDATORS_2026-08-24.md —— 內容缺陷要在 canonical 檔抓。
      if (dir === DATA_ROOT && (entry.name === "audits" || entry.name === "imports")) continue;
      files.push(...listJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

function jsonPath(parentPath, key) {
  if (typeof key === "number") return `${parentPath}[${key}]`;
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return `${parentPath}.${key}`;
  return `${parentPath}[${JSON.stringify(key)}]`;
}

function isChineseField(key) {
  return key === "nameZh" || key === "chinese" || CHINESE_FIELD_RE.test(key);
}

function inspectValue(value, context, issues) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    // 2026-09-05:逐字存證欄位(見檔頭)。只跳過 �/問號檢查,不跳過任何其他規則;
    // 路徑尾巴必須完整匹配,removed_verbatim 之外的鍵(reason/field)仍照常檢查。
    const isVerbatimArtifact = /\.extraction_artifact_removed\.removed_verbatim$/.test(String(context.path || ""));
    if (!isVerbatimArtifact && QUESTION_ONLY_RE.test(trimmed)) {
      issues.push({
        type: "question_mark_only",
        file: context.file,
        path: context.path,
        value
      });
    } else if (!isVerbatimArtifact && QUESTION_DAMAGE_RE.test(trimmed)) {
      issues.push({
        type: "question_mark_damage",
        file: context.file,
        path: context.path,
        value
      });
    }

    if (!isVerbatimArtifact && REPLACEMENT_RE.test(value)) {
      issues.push({
        type: "replacement_character",
        file: context.file,
        path: context.path,
        value
      });
    }

    // field_sources is keyed BY field name, so field_sources.functions_zh holds
    // a citation ("curriculum/herbs/....pdf#p1" or a URL) — a path, not prose.
    // Without this exemption every properly-cited 中文 field reports as mojibake,
    // and the noise grows with each herb that gets sourced correctly.
    const inFieldSources = String(context.path || "").includes("field_sources");
    // 2026-09-02:*_urls_zh / *_url_zh 裝的是連結(cloudtcm 圖片網址),不是中文散文 —— 361 筆 diagram_urls_zh 全是假陽性。
    // 只豁免「整個值就是一個 URL」的情況;URL 混在中文句子裡仍照常檢查。
    const isBareUrl = /^https?:\/\/\S+$/i.test(trimmed);
    /* 2026-09-02 第二輪:剩下的 156 筆逐條看過,其中 33 筆不是缺口,是這條規則問錯了問題。
     * 三種都豁免,理由分開寫,因為它們錯的方式不一樣:
     *  (a) 連結標籤(external_links[].label_zh / visual_links[].label_zh):值是網站名
     *      「American Dragon」。品牌名不翻譯 —— 翻成「美國龍」才是錯的。
     *  (b) 交互作用對象(with_label_zh):值是西藥學名「Warfarin」「Tamoxifen」。
     *      臺灣臨床本來就寫英文學名;硬翻成音譯反而讓人查不到。
     *  (c) 評分表的欄位名(research_staging 的 criteria[].zh = "summary_zh"):
     *      那是設定檔在描述「要看哪個欄位」,不是給人讀的中文。
     * 注意這三條都是**依路徑**豁免,不是依值 —— 依值(例如「短的就放過」)會把真的缺口也放掉。 */
    const p = String(context.path || "");
    const isLinkLabel = /(external_links|visual_links|source_links|links)\[\d+\]\.label_zh$/.test(p);
    const isInteractionPartner = /\.with_label_zh$/.test(p);
    const isScoringFieldName = /criteria\[\d+\]\.zh$/.test(p) && /research_staging/.test(String(context.file || ""));
    /* (d) 結構描述檔:`schema.json` 的 $.fields.location_zh、以及任何 field_definitions.* ——
     *     值是「這個欄位裝什麼」的英文說明,不是卡片內容。把它們算成缺口,等於要求
     *     schema 檔用中文描述自己的欄位。 */
    const isSchemaDefinition = /(^|\/)schema\.json$/.test(String(context.file || "").replace(/\\/g, "/")) || /(^|\.)field_definitions\./.test(p);
    const exemptByPath = isLinkLabel || isInteractionPartner || isScoringFieldName || isSchemaDefinition;
    if (context.key && isChineseField(context.key) && !inFieldSources && !isBareUrl && !exemptByPath && trimmed.length > 3 && !CJK_RE.test(trimmed)) {
      issues.push({
        type: "chinese_field_without_cjk",
        file: context.file,
        path: context.path,
        value
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      inspectValue(item, {
        file: context.file,
        path: jsonPath(context.path, index),
        key: context.key
      }, issues);
    });
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      inspectValue(item, {
        file: context.file,
        path: jsonPath(context.path, key),
        key
      }, issues);
    }
  }
}

function main() {
  const issues = [];
  const files = listJsonFiles(DATA_ROOT);
  const summaryOnly = process.argv.includes("--summary-only");

  for (const fullPath of files) {
    const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, "/");
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (error) {
      issues.push({
        type: "json_parse_error",
        file: relativePath,
        path: "$",
        value: error.message
      });
      continue;
    }

    inspectValue(data, { file: relativePath, path: "$", key: "" }, issues);
  }

  const summary = {
    files_checked: files.length,
    issues: issues.length,
    by_type: issues.reduce((counts, issue) => {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
      return counts;
    }, {}),
    by_file: issues.reduce((counts, issue) => {
      counts[issue.file] = (counts[issue.file] || 0) + 1;
      return counts;
    }, {})
  };

  // --json：給 check-validation-ratchet 用的機器可讀輸出（defects/by_code），
  // 讓這個缺陷類有天花板可守——它一度有 13,201 筆而完全沒有 gate。
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ defects: issues.length, by_code: summary.by_type, by_file: summary.by_file }));
    return;
  }

  if (issues.length > 0) {
    console.error("Encoding validation failed.");
    console.error(JSON.stringify(summary, null, 2));
    if (!summaryOnly) {
      issues.forEach((issue) => {
        console.error(`${issue.file} ${issue.path} [${issue.type}]: ${JSON.stringify(issue.value)}`);
      });
    }
    process.exit(1);
  }

  console.log("Encoding validation passed.");
  console.log(JSON.stringify(summary, null, 2));
}

main();

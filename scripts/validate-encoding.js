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
    if (QUESTION_ONLY_RE.test(trimmed)) {
      issues.push({
        type: "question_mark_only",
        file: context.file,
        path: context.path,
        value
      });
    } else if (QUESTION_DAMAGE_RE.test(trimmed)) {
      issues.push({
        type: "question_mark_damage",
        file: context.file,
        path: context.path,
        value
      });
    }

    if (REPLACEMENT_RE.test(value)) {
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
    if (context.key && isChineseField(context.key) && !inFieldSources && trimmed.length > 3 && !CJK_RE.test(trimmed)) {
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

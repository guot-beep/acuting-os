const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const COMPARISON_FILE = "data/knowledge/comparisons.json";
const CONDITIONS_FILE = "data/pathology/conditions.json";
const PATTERN_LIBRARY_FILE = "data/pathology/pattern_library.json";
const FORMULAS_FILE = "data/herbs/formulas.json";
const OUTPUT_FILE = "docs/COMPARISON_FILL_QUEUE.md";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function escPipe(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function labelMap(records, fallbackFields) {
  const map = new Map();
  asArray(records).forEach((record) => {
    if (!record || !record.id) return;
    const label = fallbackFields
      .map((field) => record[field])
      .filter(Boolean)
      .join(" / ");
    map.set(record.id, label || record.id);
  });
  return map;
}

function cellStats(record) {
  const compares = asArray(record.compares);
  const dimensions = asArray(record.dimensions);
  const total = compares.length * dimensions.length;
  let filled = 0;
  const pendingByPattern = {};

  compares.forEach((patternId) => {
    const row = (record.cells || {})[patternId] || {};
    const pending = [];
    dimensions.forEach((dimension) => {
      if (String(row[dimension] || "").trim()) {
        filled += 1;
      } else {
        pending.push(dimension);
      }
    });
    pendingByPattern[patternId] = pending;
  });

  return { filled, total, pending: Math.max(0, total - filled), pendingByPattern };
}

// 卡片素材引擎（2026-08-24）：待填 cell 旁邊直接放「卡片裡已經寫好的鑑別原文」
// 逐字照錄＋出處，讓 Ting 填 cell 時素材就在手邊。紅線（COMPARISON_CARD_TEMPLATE
// §0）不變：鑑別點 cell 只由 Ting 撰寫——這裡引用的都是卡片既有欄位原文，
// 一個模型生成的鑑別語句都沒有，也絕不寫回 comparisons.json。
function splitSentences(text) {
  return String(text || "").split(/(?<=[。；！？])/).map((s) => s.trim()).filter(Boolean);
}

// 從 F 卡挖「與同桌其他成員相互鑑別」的原文：
//   comparisons[].differentiator_zh（對象在同桌才引，同 #89 渲染端規則）
//   clinical_use_note（本質就是比較句；提到同桌成員才引）
//   exam_pearl 中提到同桌成員名的句子
function formulaQuotes(record, tableMemberIds, formulaById) {
  const quotes = [];
  const otherNames = tableMemberIds
    .filter((id) => id !== record.id)
    .map((id) => (formulaById.get(id) || {}).name_zh)
    .filter(Boolean);
  asArray(record.comparisons).forEach((cmp) => {
    if (!cmp || !tableMemberIds.includes(cmp.with) || cmp.with === record.id) return;
    if (String(cmp.differentiator_zh || "").trim()) {
      quotes.push({ text: cmp.differentiator_zh, src: `${record.id} › comparisons[with=${cmp.with}].differentiator_zh` });
    }
  });
  const note = String(record.clinical_use_note || "").trim();
  if (note && otherNames.some((n) => note.includes(n))) {
    quotes.push({ text: note, src: `${record.id} › clinical_use_note` });
  }
  splitSentences(record.exam_pearl).forEach((sentence) => {
    if (otherNames.some((n) => sentence.includes(n))) {
      quotes.push({ text: sentence, src: `${record.id} › exam_pearl` });
    }
  });
  return quotes;
}

// 證型卡的鑑別素材住在 differential_patterns[]（144/154 張卡有）：
// 對象是同桌成員才引 distinguishing_zh。
function patternQuotes(record, tableMemberIds) {
  const quotes = [];
  asArray(record.differential_patterns).forEach((dp) => {
    if (!dp || !tableMemberIds.includes(dp.pattern_id)) return;
    if (String(dp.distinguishing_zh || "").trim()) {
      quotes.push({ text: dp.distinguishing_zh, src: `${record.id} › differential_patterns[${dp.pattern_id}].distinguishing_zh` });
    }
  });
  return quotes;
}

function main() {
  const comparisons = readJson(COMPARISON_FILE);
  const conditions = readJson(CONDITIONS_FILE);
  const patternLibrary = fs.existsSync(path.join(ROOT, PATTERN_LIBRARY_FILE))
    ? readJson(PATTERN_LIBRARY_FILE)
    : { records: [] };
  const formulas = fs.existsSync(path.join(ROOT, FORMULAS_FILE))
    ? readJson(FORMULAS_FILE)
    : { records: [] };

  const conditionLabels = labelMap(conditions.records, ["name_zh", "name_en", "id"]);
  // 32/43 張表比的是 formula.*——標籤表不含方劑時，隊列表整欄印 raw id
  // （#89 在渲染端修過同一個問題，這裡是報表端的同款修法）。
  const patternLabels = labelMap(
    asArray(patternLibrary.records)
      .concat(asArray(conditions.tcm_patterns))
      .concat(asArray(formulas.records)),
    ["name_zh", "name_en", "id"]
  );
  const formulaById = new Map(asArray(formulas.records).map((r) => [r.id, r]));
  const patternById = new Map(asArray(patternLibrary.records).map((r) => [r.id, r]));

  const records = asArray(comparisons.records);
  const rows = records.map((record) => ({ record, stats: cellStats(record) }));
  const totals = rows.reduce((sum, item) => {
    sum.filled += item.stats.filled;
    sum.total += item.stats.total;
    if (item.stats.filled === 0) sum.empty += 1;
    if (item.stats.filled > 0 && item.stats.filled < item.stats.total) sum.partial += 1;
    if (item.stats.total > 0 && item.stats.filled === item.stats.total) sum.complete += 1;
    return sum;
  }, { filled: 0, total: 0, empty: 0, partial: 0, complete: 0 });

  const lines = [];
  lines.push("# LL3 Comparison Fill Queue");
  lines.push("");
  lines.push("Generated by `scripts/report-comparison-fill.js` from `data/knowledge/comparisons.json`.");
  lines.push("This is a queue for owner/source-based filling. 「填寫素材」節的內容全部是卡片欄位的逐字引用（附出處）——沒有任何模型生成的鑑別語句。");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- comparison records: ${records.length}`);
  lines.push(`- filled cells: ${totals.filled}`);
  lines.push(`- pending cells: ${Math.max(0, totals.total - totals.filled)}`);
  lines.push(`- empty tables: ${totals.empty}`);
  lines.push(`- partial tables: ${totals.partial}`);
  lines.push(`- complete tables: ${totals.complete}`);
  lines.push("");
  lines.push("## Table Queue");
  lines.push("");
  lines.push("| ID | Title | Source condition | Patterns | Progress | Status |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  rows.forEach(({ record, stats }) => {
    const title = record.title_zh || record.title_en || record.id;
    const source = record.source_condition_id
      ? `${conditionLabels.get(record.source_condition_id) || record.source_condition_id}`
      : "";
    const patterns = asArray(record.compares)
      .map((id) => patternLabels.get(id) || id)
      .join("<br>");
    const status = [record.status, record.review_status, record.authored_by].filter(Boolean).join(" / ");
    lines.push(`| ${escPipe(record.id)} | ${escPipe(title)} | ${escPipe(source)} | ${escPipe(patterns)} | ${stats.filled}/${stats.total} | ${escPipe(status)} |`);
  });
  lines.push("");
  lines.push("## Pending Axes");
  lines.push("");
  rows.forEach(({ record, stats }) => {
    lines.push(`### ${record.id}`);
    lines.push("");
    lines.push(`Progress: ${stats.filled}/${stats.total}`);
    lines.push("");
    asArray(record.compares).forEach((patternId) => {
      const pending = stats.pendingByPattern[patternId] || [];
      lines.push(`- ${patternLabels.get(patternId) || patternId}: ${pending.length ? pending.map((item) => `\`${item}\``).join(", ") : "complete"}`);
    });
    lines.push("");
  });

  // ---- 填寫素材：只列還有待填 cell 的表 -------------------------------------
  let tablesWithMaterial = 0;
  let quoteCount = 0;
  lines.push("## 填寫素材（卡片原文照錄）");
  lines.push("");
  lines.push("每一句都是卡片欄位的**逐字引用**＋出處，供 Ting 填鑑別點 cell 時參考。");
  lines.push("本節不含任何模型生成的鑑別語句；鑑別點 cell 只由 Ting 撰寫");
  lines.push("（docs/COMPARISON_CARD_TEMPLATE.md §0），本產生器絕不寫 comparisons.json。");
  lines.push("");
  rows.forEach(({ record, stats }) => {
    if (!stats.pending) return;
    const memberIds = asArray(record.compares);
    const sections = [];
    memberIds.forEach((memberId) => {
      const quotes = record.type === "formula_comparison"
        ? formulaQuotes(formulaById.get(memberId) || { id: memberId }, memberIds, formulaById)
        : patternQuotes(patternById.get(memberId) || { id: memberId }, memberIds);
      if (quotes.length) sections.push({ memberId, quotes });
    });
    if (!sections.length) return;
    tablesWithMaterial += 1;
    lines.push(`### ${record.id} — ${record.title_zh || record.title_en || ""}`);
    lines.push("");
    sections.forEach(({ memberId, quotes }) => {
      lines.push(`**${patternLabels.get(memberId) || memberId}**`);
      lines.push("");
      quotes.forEach(({ text, src }) => {
        quoteCount += 1;
        lines.push(`> ${escPipe(text)}`);
        lines.push(`> — \`${src}\``);
        lines.push("");
      });
    });
  });
  if (!tablesWithMaterial) {
    lines.push("（目前沒有「待填且卡片有現成鑑別原文」的表。）");
    lines.push("");
  }

  fs.writeFileSync(path.join(ROOT, OUTPUT_FILE), `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(JSON.stringify({
    records: records.length,
    filled_cells: totals.filled,
    pending_cells: Math.max(0, totals.total - totals.filled),
    empty_tables: totals.empty,
    partial_tables: totals.partial,
    complete_tables: totals.complete,
    material_tables: tablesWithMaterial,
    material_quotes: quoteCount
  }, null, 2));
}

main();

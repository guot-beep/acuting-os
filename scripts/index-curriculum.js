#!/usr/bin/env node
/**
 * index-curriculum.js — inventory curriculum/ and write curriculum/INDEX.md.
 *
 * Ting drops course files into curriculum/<folder>/ and every agent is told to
 * read them "first". Two failure modes this catches:
 *   1. A PDF with no text sibling is invisible to agents that cannot open PDFs
 *      — it looks ingested but half the fleet never sees it.
 *   2. A file lands in the wrong folder (a condition lecture inside herbs/),
 *      so nobody looking for it finds it.
 *
 * The index is the cross-reference layer that lets one file live in exactly one
 * folder — see curriculum/README.md, "一份檔案只放一個資料夾".
 *
 * Usage: node scripts/index-curriculum.js [--check]
 *   --check  exit 1 if INDEX.md is stale (for the validator wall)
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const CUR = path.join(ROOT, "curriculum");
const OUT = path.join(CUR, "INDEX.md");
const CHECK = process.argv.includes("--check");

// Folder purposes mirror curriculum/README.md; keep the two in sync.
const FOLDERS = {
  herbs: "中藥 — 單味藥課件、materia medica、拼音拉丁表",
  formulas: "方劑 — 組成、加減、比較表",
  acupoints: "針灸 — 經絡講義、針法、特定穴",
  conditions: "病證 — 中西醫結合的病(病因病機/辨證/治法)",
  cases: "病例 — 具體某個人(已去識別化)",
  lifestyle: "食療生活 — 飲食、作息、養生、營養學",
  theory: "基礎 — 理論、四診、經絡總論、術語英譯",
  western: "西醫 — 解剖生理病理藥理、red flag",
  board: "考綱 — outline、題庫、複習清單(決定順序,不是教材)"
};

// A PDF/DOCX is only usable by every agent if a text version sits beside it.
const TEXT_EXT = new Set([".md", ".txt", ".csv"]);

// ...and only if that text version actually has text in it. A scanned PDF
// extracts to a .md containing nothing but the auto-generated header and empty
// page markers; counting that as "✅ has text" would be a lie in the one place
// the index exists to prevent lies.
const SUBSTANTIVE_MIN = 200;
function hasRealText(abs) {
  try {
    const body = fs
      .readFileSync(abs, "utf8")
      .replace(/^#.*$/gm, "")           // headings incl. the ## p.N markers
      .replace(/^>.*$/gm, "")           // the provenance/warning block
      .replace(/^_\(.*\)_$/gm, "")      // "(這一頁沒有可抽取的文字)" placeholders
      .trim();
    return body.length >= SUBSTANTIVE_MIN;
  } catch {
    return false;
  }
}
const BINARY_EXT = new Set([".pdf", ".doc", ".docx", ".xlsx", ".ppt", ".pptx"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

const kb = (n) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

function scan(dir) {
  const out = [];
  const walk = (d, rel) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith(".") || e.name === "README.md" || e.name === "INDEX.md") continue;
      const abs = path.join(d, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(abs, r);
      else out.push({ rel: r, size: fs.statSync(abs).size, ext: path.extname(e.name).toLowerCase() });
    }
  };
  walk(dir, "");
  return out;
}

const lines = [];
lines.push("# curriculum/ INDEX — 自動產生,不要手改");
lines.push("");
lines.push("`node scripts/index-curriculum.js` 重新產生。丟完新課件就跑一次。");
lines.push("");
lines.push("**「文字版」欄的意思**:PDF/DOCX 旁邊有沒有同名的 `.md`/`.txt`/`.csv`。");
lines.push("沒有的話,讀不了 PDF 的 agent 等於看不到這份檔案 —— 需要 Claude 先抽文字。");
lines.push("");

let total = 0, needExtract = [];
const summary = [];

for (const [folder, purpose] of Object.entries(FOLDERS)) {
  const files = scan(path.join(CUR, folder));
  total += files.length;
  const textStems = new Set(
    files
      .filter((f) => TEXT_EXT.has(f.ext) && hasRealText(path.join(CUR, folder, f.rel)))
      .map((f) => f.rel.replace(/\.[^.]+$/, ""))
  );
  const missing = files.filter((f) => BINARY_EXT.has(f.ext) && !textStems.has(f.rel.replace(/\.[^.]+$/, "")));
  missing.forEach((f) => needExtract.push(`${folder}/${f.rel}`));
  summary.push({ folder, n: files.length, missing: missing.length });

  lines.push(`## ${folder}/ — ${purpose}`);
  lines.push("");
  if (!files.length) {
    lines.push("_(空)_");
    lines.push("");
    continue;
  }
  lines.push("| 檔案 | 大小 | 文字版 |");
  lines.push("|---|---|---|");
  for (const f of files) {
    const stem = f.rel.replace(/\.[^.]+$/, "");
    let mark = "—";
    if (TEXT_EXT.has(f.ext)) {
      mark = hasRealText(path.join(CUR, folder, f.rel)) ? "✅ 本身是文字" : "⚠️ 幾乎沒有內容";
    } else if (IMAGE_EXT.has(f.ext)) mark = textStems.has(stem) ? "✅" : "⚠️ 圖片,需附 .md 轉述";
    else if (BINARY_EXT.has(f.ext)) mark = textStems.has(stem) ? "✅" : "⚠️ 待抽文字";
    lines.push(`| \`${f.rel}\` | ${kb(f.size)} | ${mark} |`);
  }
  lines.push("");
  if (files.length > 30) {
    lines.push(`> 這個資料夾有 ${files.length} 檔,超過 30 —— 可以考慮依 \`README.md\` 的分法開子資料夾。`);
    lines.push("");
  }
}

lines.push("## 總計");
lines.push("");
lines.push("| 資料夾 | 檔數 | 待抽文字 |");
lines.push("|---|---|---|");
for (const s of summary) lines.push(`| ${s.folder} | ${s.n} | ${s.missing || "—"} |`);
lines.push(`| **合計** | **${total}** | **${needExtract.length}** |`);
lines.push("");
if (needExtract.length) {
  lines.push("### ⚠️ 這些檔還沒有可用的文字版");
  lines.push("");
  lines.push("讀不了 PDF/DOCX 的 agent 看不到它們。跑");
  lines.push("`python3 scripts/extract-curriculum-text.py` 產生同名 `.md`。");
  lines.push("");
  lines.push("**已經有 `.md` 但還列在這裡** = 那份是掃描檔/圖片投影片,抽不出文字,");
  lines.push("需要人工把重點打字進去 —— 空的文字版比沒有更危險,它會讓人以為已經處理過。");
  lines.push("");
  needExtract.forEach((f) => lines.push(`- \`${f}\``));
  lines.push("");
}

const body = lines.join("\n") + "\n";

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== body) {
    console.error("FAIL — curriculum/INDEX.md is stale. Run: node scripts/index-curriculum.js");
    process.exit(1);
  }
  console.log(`index-curriculum: INDEX.md up to date (${total} files).`);
} else {
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`index-curriculum: ${total} files across ${summary.length} folders → curriculum/INDEX.md`);
  if (needExtract.length) console.log(`  ⚠️ ${needExtract.length} file(s) have no text version — agents that cannot read PDFs will miss them.`);
}

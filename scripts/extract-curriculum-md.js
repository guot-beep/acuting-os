#!/usr/bin/env node
/**
 * extract-curriculum-md.js — make every curriculum file readable by every agent.
 *
 * The premise of every card template is "read curriculum/ first, it is Tier-1".
 * But 44 of the 52 files in curriculum/conditions/ are .doc/.docx and 2 are
 * PDFs — binary. An agent told to read them reads nothing, while the directory
 * *looks* ingested. That is the same class of failure as a filled-looking field
 * holding boilerplate: it passes inspection and delivers nothing.
 *
 * There is a Python version of this (scripts/extract-curriculum-text.py) but
 * python is not installed on this machine (CLAUDE.md: the python.exe on PATH is
 * a Windows Store stub). This is the JS/shell port, using tools Git for Windows
 * already ships: pdftotext for PDF, unzip for the OOXML container.
 *
 * Per format:
 *   .pdf         pdftotext -layout, page markers `## p.N` so a field_sources
 *                citation like curriculum/<path>#p12 points somewhere findable.
 *   .docx/.docm  a zip; word/document.xml is read directly and tags stripped.
 *                Paragraph and table-cell boundaries become newlines so lists
 *                stay lists.
 *   .doc         old binary Word (OLE compound, magic d0cf11e0) — antiword,
 *                also shipped with Git for Windows. 23 of the condition
 *                handouts are this format; they are Dr. Liu's AOM Therapeutics
 *                lectures, i.e. exactly the Tier-1 material the templates say
 *                to read first.
 *
 * Output is `<source>.md` beside the source, with a provenance header naming
 * the binary it came from. Never overwrites an existing .md unless --force
 * (someone may have hand-corrected an extraction).
 *
 *   node scripts/extract-curriculum-md.js                 # all of curriculum/
 *   node scripts/extract-curriculum-md.js --only conditions
 *   node scripts/extract-curriculum-md.js --force
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CURRICULUM = path.join(ROOT, "curriculum");

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? argv.slice(onlyIdx + 1).filter((a) => !a.startsWith("--")) : null;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function relOf(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }

function header(src) {
  return `<!-- Extracted from ${relOf(src)} by scripts/extract-curriculum-md.js.\n`
    + `     Text layer only — figures, tables-as-images and formatting are NOT here.\n`
    + `     Cite as ${relOf(src)}#p<N> and verify against the original before\n`
    + `     using any number (dose, depth, lab value) from it. -->\n\n`;
}

/* The mingw64 pdftotext/antiword shipped with Git for Windows cannot open a
 * path containing non-ASCII characters — it reports `M.M.1 Intro Outline
 * ????-NEW.pdf`. Five of the most valuable sources are Chinese-titled (臺灣中藥典,
 * 中药概论, 补益剂…), so run those through an ASCII-named temp copy rather than
 * losing them. */
function withAsciiPath(src, fn) {
  if (!/[^\x00-\x7F]/.test(src)) return fn(src);
  const tmp = path.join(
    fs.mkdtempSync(path.join(require("os").tmpdir(), "acuting-extract-")),
    "source" + path.extname(src).toLowerCase()
  );
  try {
    fs.copyFileSync(src, tmp);
    return fn(tmp);
  } finally {
    try { fs.rmSync(path.dirname(tmp), { recursive: true, force: true }); } catch { /* temp cleanup */ }
  }
}

function extractPdf(src) {
  // -layout keeps column structure; without it, two-column handouts interleave.
  //
  // -enc UTF-8 is NOT optional. The Xpdf pdftotext shipped with Git for Windows
  // defaults to Latin1, which silently deletes every CJK character and mangles
  // tone marks and bullets: 「Huáng Qín (黄芩)」 came out as 「Hu?ng Q?n ()」.
  // That is how 47 curriculum .md files lost 100% of their Chinese in one
  // commit (ebef2401) without anyone noticing — the files still looked
  // extracted. See the writeIfNotWorse() gate below, which now makes that
  // class of loss impossible to commit.
  // -eol unix:這個 build 在 Windows 上預設吐 CRLF,而本檔其餘輸出是 LF。
  // 混行尾會讓每次重跑都產生一整批「只有行尾不同」的假 diff(git 又會正規化回 LF,
  // 於是工作區與 repo 永遠對不齊)。統一成 LF。
  const raw = withAsciiPath(src, (p) => execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", "-eol", "unix", p, "-"], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  }));
  // pdftotext separates pages with \f — turn that into a locatable marker.
  const pages = raw.split("\f");
  return pages
    .map((text, i) => (text.trim() ? `## p.${i + 1}\n\n${text.trim()}\n` : ""))
    .filter(Boolean)
    .join("\n");
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractOoxml(src) {
  const xml = withAsciiPath(src, (p) => execFileSync("unzip", ["-p", p, "word/document.xml"], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  }));
  return decodeEntities(
    xml
      // structural boundaries first, so text does not run together
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<\/w:tc>/g, "\t")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* A scanned or handwritten PDF still HAS a text layer — of OCR noise. Writing
 * it produces a .md that looks ingested and reads as gibberish ("ton.TT",
 * "ifiTIiiTi.Ciiiiiii"), which is the same failure mode as a boilerplate field:
 * it passes every structural check and delivers nothing. Measured on this
 * corpus: real handouts run 16-19% one-or-two-letter tokens; the scanned
 * Hyperthyroidism.pdf runs 56% on 18 tokens total. Refuse rather than write. */
function looksLikeOcrNoise(text) {
  const tokens = text.match(/[A-Za-z]+/g) || [];
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  if (cjk > 200) return false;               // Chinese sources tokenise differently
  if (tokens.length < 120) return true;      // a lecture handout is never this thin
  const shortRatio = tokens.filter((w) => w.length <= 2).length / tokens.length;
  return shortRatio > 0.35;                  // well clear of the 16-19% real range
}

function extractDoc(src) {
  // -w 0 disables line wrapping so paragraphs survive as paragraphs.
  return withAsciiPath(src, (p) => execFileSync("antiword", ["-w", "0", p], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  }))
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* 只加深,不刪除 —— 套用到抽取本身。
 *
 * 2026-08-31 查出:ebef2401 用預設 Latin1 重抽,47 個 .md 的中文**全部**歸零、
 * 補進數千個 U+FFFD,而且全部 commit 進去了,沒有任何閘門攔下來。檔案看起來
 * 「有抽取」,驗證器也不看課件,所以壞了三週沒人發現;連帶讓所有 #L 錨點失效。
 *
 * 這道閘門就是為那件事設的:重抽只准變好。中文變少、壞字元變多、或內容明顯
 * 縮水,一律拒寫並列出來,由人決定 —— 因為那些症狀沒有一個是「抽得比較好」
 * 的樣子。要真的取代舊版,先讓數字說得過去。 */
function qualityOf(text) {
  const body = text.replace(/^<!--[\s\S]*?-->\n*/, "");   // 檔頭樣板不算內容
  return {
    cjk: (body.match(/[一-鿿]/g) || []).length,
    bad: (body.match(/�/g) || []).length,
    /* 去掉所有空白才是內容量。-layout 會把每一行用空格墊到欄位位置,
       同一份文字的位元組長度可以差一倍以上 —— 用原始長度比,會把
       「同樣內容、少了排版填充」誤判成內容縮水,擋掉正確的抽取。 */
    dense: body.replace(/\s+/g, "").length,
  };
}

function writeIfNotWorse(out, body, src) {
  const next = header(src) + body + "\n";
  if (!fs.existsSync(out)) { fs.writeFileSync(out, next, "utf8"); return { ok: true, note: "new" }; }

  const prev = fs.readFileSync(out, "utf8");
  const a = qualityOf(prev), b = qualityOf(next);
  const regressions = [];
  if (b.cjk < a.cjk) regressions.push(`中文字 ${a.cjk} → ${b.cjk}`);
  if (b.bad > a.bad) regressions.push(`U+FFFD ${a.bad} → ${b.bad}`);
  if (b.dense < a.dense * 0.85) regressions.push(`本文內容量 ${a.dense} → ${b.dense}（去空白後少於 85%）`);
  if (regressions.length) return { ok: false, note: regressions.join("；") };

  fs.writeFileSync(out, next, "utf8");
  const gains = [];
  if (b.cjk > a.cjk) gains.push(`中文字 ${a.cjk} → ${b.cjk}`);
  if (b.bad < a.bad) gains.push(`U+FFFD ${a.bad} → ${b.bad}`);
  return { ok: true, note: gains.length ? gains.join("；") : "無退化" };
}

const results = { written: [], skipped_existing: [], needs_ocr: [], failed: [], refused_worse: [] };

const files = walk(CURRICULUM).filter((f) => {
  if (ONLY && !ONLY.some((o) => relOf(f).includes(`/${o}/`))) return false;
  return /\.(pdf|docx|docm|doc|DOC)$/.test(f);
});

for (const src of files) {
  const ext = path.extname(src).toLowerCase();
  const out = src.replace(/\.[^.]+$/, ".md");

  if (fs.existsSync(out) && !FORCE) {
    results.skipped_existing.push(relOf(out));
    continue;
  }
  try {
    const body = ext === ".pdf" ? extractPdf(src)
      : ext === ".doc" ? extractDoc(src)
      : extractOoxml(src);
    if (!body.trim()) { results.failed.push(`${relOf(src)} (extracted empty)`); continue; }
    if (looksLikeOcrNoise(body)) {
      // Refuse to WRITE noise — but never delete what is already there. The
      // heuristic has false positives (a slide deck of two-word herb-table
      // cells reads like noise by token length), and this script must not be
      // able to destroy a hand-corrected or better-engine extraction. §0.
      results.needs_ocr.push(relOf(src) + (fs.existsSync(out) ? " (existing .md kept)" : ""));
      continue;
    }
    const w = writeIfNotWorse(out, body, src);
    if (!w.ok) { results.refused_worse.push(`${relOf(out)} — ${w.note}`); continue; }
    results.written.push(`${relOf(out)} (${Math.round(body.length / 1024)}KB text${w.note === "new" ? "" : "；" + w.note})`);
  } catch (err) {
    results.failed.push(`${relOf(src)} — ${String(err.message).split("\n")[0]}`);
  }
}

console.log(`extract-curriculum-md — scanned ${files.length} binary source(s)\n`);
console.log(`  written            ${results.written.length}`);
console.log(`  skipped (has .md)  ${results.skipped_existing.length}`);

console.log(`  needs OCR          ${results.needs_ocr.length}`);
console.log(`  拒寫(會變差)      ${results.refused_worse.length}`);
console.log(`  failed             ${results.failed.length}\n`);
if (results.written.length) { console.log("WRITTEN:"); results.written.forEach((r) => console.log("  " + r)); }
if (results.needs_ocr.length) {
  console.log(`\nNEEDS OCR — scanned/handwritten, the text layer is noise (${results.needs_ocr.length} file(s)).`);
  console.log("No .md written on purpose: gibberish that looks ingested is worse than a gap.");
  console.log("Ting: these are readable only by a human or a vision model.");
  results.needs_ocr.forEach((r) => console.log("  " + r));
}
if (results.refused_worse.length) {
  console.log(`\n拒寫 —— 新抽取比現有 .md 差,沒有覆蓋 (${results.refused_worse.length} 檔)。`);
  console.log("中文變少 / 壞字元變多 / 本文縮水都不是「抽得更好」的樣子,由人判斷後再決定。");
  results.refused_worse.forEach((r) => console.log("  " + r));
}
if (results.failed.length) { console.log("\nFAILED:"); results.failed.forEach((r) => console.log("  " + r)); }

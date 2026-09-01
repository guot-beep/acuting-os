#!/usr/bin/env node
/**
 * validate-curriculum-anchor-resolution.js
 *
 * 卡片上的「出處」寫 `curriculum/…#p12` 或 `#L344-L350`。這支只問一件事:
 * **那個位置存不存在**。檔案在不在、頁碼有沒有那一頁、行號在不在範圍內。
 *
 * 為什麼需要:2026-08-31 查出 `ebef2401` 重新抽取了兩個 Chenoweth 課件
 * (materia_medica_abbreviated 9006→3474 行、herb_functions 2281→1010 行),
 * 在那之前寫的 `#L` 錨點**全部一次失效**,而且沒有任何東西發現。19 個變成超界
 * (還算看得出來),另外 28 個仍落在新檔範圍內、卻指到不相干的段落 —— 那種
 * 「還在範圍內但指錯」是這支**抓不到**的,只有人回去讀才知道(pair.lu_dou__gan_cao
 * 就是這樣被抓到的:#L1245-L1247 在舊檔是巴豆條目的解毒句,在新檔是活血化瘀藥)。
 *
 * 所以這支的定位要講清楚:它是**下限**,不是保證。
 *   查得到:檔名改名/搬家、頁碼超出、行號超出。
 *   查不到:錨點指到的內容支不支持該主張。那要人判斷,本檔不假裝有查。
 *
 * 教訓也寫進來:頁錨點(`#pN`)跨抽取版本通用(兩版都是 41 頁 / 13 頁),
 * 行錨點(`#L`)綁死單一次抽取。新引用一律用 `#pN`。
 *
 * 用法:
 *   node scripts/validate-curriculum-anchor-resolution.js
 *   node scripts/validate-curriculum-anchor-resolution.js --json      # 給 ratchet
 *   node scripts/validate-curriculum-anchor-resolution.js --worklist  # 逐筆列出
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIR = path.join(ROOT, 'data');
// data/generated/** 是 build 產物,同一筆會被算好幾次 —— 量原始檔,不量 bundle。
const SKIP_DIRS = new Set(['generated', 'node_modules', '.git']);

const ANCHOR_RE = /curriculum\/[^"'\\\s][^"'\\]*?\.(?:md|pdf)#(?:p\d+(?:[-–]\d+)?|L\d+(?:-L\d+)?)/g;

function collectFiles(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      collectFiles(path.join(dir, e.name), out);
    } else if (/\.(json|js)$/.test(e.name)) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

/* 課件 .md 有兩種頁標記格式,認錯就會把整個檔判成壞的(2026-08-31 初版踩過:
   Therapeutics Notes 用 `--- Page N ---`,掃描抽到 0 個頁標記,於是它引用的
   4 個錨點全被誤報。抽到 0 不代表資料壞,代表解析器沒認得。) */
function readPages(text) {
  const pages = new Set();
  for (const line of text.split(/\r?\n/)) {
    let m = line.match(/^##\s*p\.(\d+)\s*$/);
    if (!m) m = line.match(/^-{2,}\s*Page\s+(\d+)\s*-{2,}$/i);
    if (m) pages.add(Number(m[1]));
  }
  return pages;
}

const infoCache = new Map();
function fileInfo(rel) {
  if (infoCache.has(rel)) return infoCache.get(rel);
  const abs = path.join(ROOT, rel);
  let v;
  if (!fs.existsSync(abs)) {
    v = { exists: false };
  } else if (rel.endsWith('.md')) {
    const text = fs.readFileSync(abs, 'utf8');
    v = { exists: true, lineCount: text.split(/\r?\n/).length, pages: readPages(text) };
  } else {
    // .pdf 本身不解析。它的孿生 .md 若在,就用 .md 的頁標記代查頁碼。
    const twin = rel.replace(/\.pdf$/, '.md');
    const twinAbs = path.join(ROOT, twin);
    if (fs.existsSync(twinAbs)) {
      const text = fs.readFileSync(twinAbs, 'utf8');
      v = { exists: true, isPdf: true, twin, pages: readPages(text) };
    } else {
      v = { exists: true, isPdf: true, twin: null, pages: null };
    }
  }
  infoCache.set(rel, v);
  return v;
}

function main() {
  const files = collectFiles(SCAN_DIR, []);
  const anchors = new Map(); // anchor -> Set(citing file, repo-relative)
  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    let m;
    ANCHOR_RE.lastIndex = 0;
    while ((m = ANCHOR_RE.exec(raw))) {
      if (!anchors.has(m[0])) anchors.set(m[0], new Set());
      anchors.get(m[0]).add(path.relative(ROOT, f).replace(/\\/g, '/'));
    }
  }

  /* 防空跑:抽到 0 筆時每一條「查不到」都會成立,報告看起來很有說服力卻全錯。
     0 筆一律當解析器壞掉,不當成資料乾淨。 */
  if (anchors.size === 0) {
    console.error('FAIL — 掃描抽到 0 個 curriculum 錨點。這是解析器壞了,不是資料乾淨。');
    console.error('       檢查 ANCHOR_RE 與 SCAN_DIR(' + path.relative(ROOT, SCAN_DIR) + ')。');
    process.exit(2);
  }

  const defects = [];     // code, anchor, detail, citedBy
  let okCount = 0;
  let uncheckable = 0;

  for (const [anchor, citers] of [...anchors].sort((a, b) => a[0].localeCompare(b[0]))) {
    const hash = anchor.indexOf('#');
    const rel = anchor.slice(0, hash);
    const frag = anchor.slice(hash + 1);
    const citedBy = [...citers].sort();
    const info = fileInfo(rel);

    if (!info.exists) {
      defects.push({ code: 'A1', anchor, detail: '檔案不存在(改名或搬家?)', citedBy });
      continue;
    }

    const lm = frag.match(/^L(\d+)(?:-L(\d+))?$/);
    if (lm) {
      if (info.isPdf) { uncheckable++; continue; }           // .pdf#L 無意義,但不誤報
      const a = Number(lm[1]);
      const b = lm[2] ? Number(lm[2]) : a;
      if (a < 1 || a > b || b > info.lineCount) {
        defects.push({ code: 'A2', anchor, detail: `行號超出範圍(檔案 ${info.lineCount} 行)`, citedBy });
      } else {
        okCount++;
      }
      continue;
    }

    const pm = frag.match(/^p(\d+)/);
    if (pm) {
      const pages = info.pages;
      if (!pages || pages.size === 0) { uncheckable++; continue; }  // 認不得頁標記 → 不判
      if (!pages.has(Number(pm[1]))) {
        const max = Math.max(...pages);
        defects.push({ code: 'A3', anchor, detail: `頁碼超出範圍(該檔最大 p${max})`, citedBy });
      } else {
        okCount++;
      }
      continue;
    }
    uncheckable++;
  }

  const byCode = {};
  for (const d of defects) {
    const label = { A1: 'A1 檔案不存在', A2: 'A2 行號超出範圍', A3: 'A3 頁碼超出範圍' }[d.code] || d.code;
    byCode[label] = (byCode[label] || 0) + 1;
  }

  // --json 必須在任何報表輸出之前,ratchet 只讀 stdout 的 JSON。
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ defects: defects.length, by_code: byCode, scanned: anchors.size }));
    return;
  }

  console.log('validate-curriculum-anchor-resolution — 課件錨點指得到嗎');
  console.log(`  掃描 ${files.length} 個資料檔(不含 data/generated),不同錨點 ${anchors.size} 個`);
  console.log(`  解析得到            ${okCount}`);
  console.log(`  無法機械判定        ${uncheckable}   (.pdf 無孿生 .md、或該 .md 沒有可辨識的頁標記)`);
  console.log(`  指不到              ${defects.length}`);
  for (const [k, v] of Object.entries(byCode)) console.log(`      ${k.padEnd(18)} ${v}`);

  if (defects.length) {
    const show = process.argv.includes('--worklist') ? defects : defects.slice(0, 15);
    console.log('');
    for (const d of show) {
      console.log(`  ${d.code}  ${d.anchor}`);
      console.log(`      ${d.detail}`);
      console.log(`      被引用於: ${d.citedBy.join(', ')}`);
    }
    if (show.length < defects.length) {
      console.log(`  …另有 ${defects.length - show.length} 筆,加 --worklist 全列。`);
    }
  }

  console.log('');
  console.log('  注意:這支只查「位置存不存在」。錨點落在範圍內但指到不相干段落,');
  console.log('  它抓不到 —— 那要人回去讀。頁錨點(#pN)跨抽取版本通用,行錨點(#L)');
  console.log('  綁死單一次抽取,新引用請一律用 #pN。');

  if (defects.length === 0) {
    console.log('\nPASS — 每個可機械判定的課件錨點都指得到。');
  } else {
    console.log(`\n${defects.length} 個錨點指不到(數量由 check-validation-ratchet.js 把關,不准變多)。`);
  }
}

main();

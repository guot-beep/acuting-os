#!/usr/bin/env node
/**
 * validate-acupoint-page-anchor-accuracy.js
 *   —— 穴位卡引的課件頁碼,指的是不是**那一頁**
 *
 * 為什麼要有這一支(`validate-curriculum-anchor-resolution.js` 已經有了):
 * 那一支只查「位置存不存在」——頁碼在檔案的頁數範圍內就算過。它抓不到
 * 「p.4 存在、但這個穴其實在 p.2」。2026-09-01/02 手動查出來的規模是:
 * `361.json` 的 438 個 `#p` 錨點裡 **220 個指錯頁**(171 + 後續拆出的 49),
 * 而那一支同一天回報 0 缺陷。天花板降到 0 不等於錨點指對。
 *
 * 三種來源結構完全不同,用同一把尺量一定誤判(我連續錯了六次才收斂):
 *   table       經絡課件,一穴一列   → 該穴自身那一列在哪一頁
 *   compendium  AP Point Book        → 專論頁 = 該頁有 `LOCATION:`(索引與對照表
 *                                      一個都沒有)且有一行以該代號開頭
 *   prose       Therapeutics / Techniques → 沒有「條目」這回事,只能問該頁有沒有提到
 * 外加第四條:`field_sources.compare_with` 引**自己**或**對比對象**那一頁都算對
 * (ST36 配 SP6 引脾經 SP-6 那頁;BL16 配 BL17 引的是 BL16 自己的專論頁)。
 *
 * ## 已知盲區:散文講義只有弱檢查
 * `Therapeutics Notes` 有 143 頁,而 SJ5 出現在其中 **45 頁**(31%)——
 * 「被引頁有沒有提到這個穴」對這種文件幾乎恆真,隨便挑一頁都有三分之一機率過。
 * 突變測試證實:把 TE5 從 `#p58` 改成 `#p3` **抓不到**。
 * 所以 prose 那一類**不計入「指對」**,單獨列成「弱檢查」——把它算成已驗證
 * 會虛報覆蓋率。它只擋得住「引了一頁完全沒提到這個穴」這種粗錯。
 *
 * ## 為什麼一定要用 pdftotext,不能讀現成的 .md
 * `curriculum/acupoints/*.md` 是 pdfplumber 版(單欄、一欄一行),同一個代號會在
 * 交叉引用裡也頂在行首 —— 實測 UB-9 在 .md 的 p.1~p.9 全部「命中」,這把尺就廢了。
 * `pdftotext -layout` 的多欄版面才留得住「自身那一列」的訊號。兩種抽取結構不同,
 * 不能互相替代。
 *
 * ## 這支怎麼避免自己製造假缺陷
 * - **只 gate「指錯」**。代號別名表一定會漏(六次教訓),漏的結果是「查不到」,
 *   那一類**單獨計數、不進缺陷數**。所以別名表不完整最多讓覆蓋率下降,
 *   永遠不會把好資料報成壞的。
 * - 抽到 0 個錨點 → `exit 2`,當解析器壞掉,不當資料乾淨。
 * - 沒有 pdftotext → 明說跳過,`--json` 吐 `skipped`,不假裝檢查過。
 *
 * 離開碼:人看的模式有指錯 → 1;`--json` 是機器模式,永遠 0(讓 ratchet 讀數字),
 * 只有「解析器/判準壞掉」才 2 —— 那一類不准當成資料乾淨帶過。
 *
 *   node scripts/validate-acupoint-page-anchor-accuracy.js
 *   node scripts/validate-acupoint-page-anchor-accuracy.js --json      # 給 ratchet
 *   node scripts/validate-acupoint-page-anchor-accuracy.js --worklist  # 逐筆列出
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const POINTS = path.join(ROOT, 'data/acupoints/361.json');
const ANCHOR_RE = /curriculum\/acupoints\/[^"'\\]+?\.pdf#p(\d+)/;

/* 課件用的代號 ≠ 卡片 id。每一條都是實際從 PDF 撈出來核對過的,不是照國際慣例猜的:
   膀胱經課件寫 UB(檔名 URINARY BLADDER)、腎經 KD、任脈 REN、督脈 DU、
   三焦 SJ、肝經 LV;AP Point Book 另外用 U.B. / L.I. / S.I. / St / Sp / Lu / Ht / P / Liv / K。
   漏一種的後果只是「查不到」(不 gate),不會變成假缺陷。 */
const ALIAS = {
  LU: 'LU', L: 'LU',
  LI: 'LI',
  ST: 'ST', S: 'ST',
  SP: 'SP',
  HT: 'HT', H: 'HT',
  SI: 'SI',
  BL: 'BL', UB: 'BL', B: 'BL',
  KI: 'KI', KD: 'KI', K: 'KI', KID: 'KI',
  PC: 'PC', P: 'PC',
  TE: 'TE', SJ: 'TE', TB: 'TE',
  GB: 'GB',
  LR: 'LR', LV: 'LR', LIV: 'LR',
  CV: 'CV', REN: 'CV', RN: 'CV',
  GV: 'GV', DU: 'GV',
};

const norm = (s) => String(s).replace(/[.\s-]/g, '').toUpperCase();
function canon(code) {
  const m = norm(code).match(/^([A-Z]+)(\d+)$/);
  return m && ALIAS[m[1]] ? ALIAS[m[1]] + m[2] : null;
}
/* 一行的開頭是不是某個穴的代號。分隔符在同一份檔裡也會混用
   (膽經前段 GB-26、後段 `GB 26*`),所以點/空白/連字號都收。 */
function codeAtLineStart(line) {
  const m = line.match(/^\s*([A-Za-z][A-Za-z.\s]{0,4}?)[\s.-]*(\d{1,3})(?![0-9])/);
  if (!m) return null;
  const ch = ALIAS[norm(m[1])];
  return ch ? ch + m[2] : null;
}
function mentionsAnywhere(txt, want) {
  const re = /([A-Za-z][A-Za-z.]{0,4})[\s.-]{0,2}(\d{1,3})(?![0-9])/g;
  let m;
  while ((m = re.exec(txt))) {
    const ch = ALIAS[norm(m[1])];
    if (ch && ch + m[2] === want) return true;
  }
  return false;
}

const kindOf = (pdf) => {
  if (/AP Point Book/i.test(pdf)) return 'compendium';
  if (/Therapeutics Notes|Techniques \d|Advanced Techniques/i.test(pdf)) return 'prose';
  return 'table';
};

/* 偵測「工具在不在」只能看 spawn 有沒有 ENOENT,**不能看離開碼**:
   Git for Windows 附的 Xpdf pdftotext 對 `-v`、`-h`、無參數一律回 99。
   第一版用離開碼判斷,結果在一台裝了 pdftotext 的機器上印出「SKIP — 找不到
   pdftotext」——什麼都沒檢查卻退出 0,正是這支想避免的那種靜默通過。 */
function havePdftotext() {
  try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); return true; }
  catch (e) { return e.code !== 'ENOENT'; }
}

const pageCache = new Map();
function pagesFor(rel) {
  if (pageCache.has(rel)) return pageCache.get(rel);
  const abs = path.join(ROOT, rel);
  let v = null;
  if (fs.existsSync(abs)) {
    try {
      v = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', '-eol', 'unix', abs, '-'],
        { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).split('\f');
    } catch { v = null; }
  }
  pageCache.set(rel, v);
  return v;
}

// 這個穴「自己的條目」在哪幾頁
function ownPages(rel, want, kind) {
  const pages = pagesFor(rel);
  if (!pages) return null;
  const hits = [];
  pages.forEach((txt, i) => {
    /* 合訂本:專論頁一定有 `LOCATION:`,索引與對照表一個都沒有
       (實測 p.15/16/147 這些索引頁 LOCATION:×0)。用**整頁有沒有**當判準,
       不要用「標題後 N 行內」—— 標題與 LOCATION: 之間的行數不固定:
       HT7 的頁是第 4 行,PC7 的頁多一行 `Ghost point` 就落到第 5 行,
       3 行窗口會漏掉,PC7 因此被誤報成指錯。
       整頁判準只會讓命中變寬(交叉提及的頁也算),而寬只會少報缺陷,
       不會把好資料報成壞的 —— 這支的取捨一律往這個方向倒。 */
    if (kind === 'compendium' && !/LOCATION:/.test(txt)) return;
    const lines = txt.split('\n');
    for (const line of lines) {
      if (codeAtLineStart(line) !== want) continue;
      hits.push(i + 1);
      break;
    }
  });
  return hits;
}

function main() {
  const jsonMode = process.argv.includes('--json');

  if (!havePdftotext()) {
    // 明說跳過,不假裝檢查過 —— 這一類靜默通過正是本 repo 反覆吃虧的地方
    if (jsonMode) { console.log(JSON.stringify({ skipped: true, reason: 'pdftotext 不存在' })); return; }
    console.log('SKIP — 找不到 pdftotext,無法重抽課件版面,本次沒有檢查任何錨點。');
    console.log('  這不是「通過」。Ubuntu: apt-get install -y poppler-utils;Windows 用 Git for Windows 內附的。');
    return;
  }

  const recs = JSON.parse(fs.readFileSync(POINTS, 'utf8'));
  const res = { ok: 0, weak: 0, wrong: [], unresolved: [] };

  for (const rec of recs) {
    const self = canon(rec.code || rec.id || '');
    if (!self) continue;
    const partners = new Set();
    for (const cw of (rec.compare_with || [])) {
      for (const c of (cw.codes || [])) { const cc = canon(c); if (cc && cc !== self) partners.add(cc); }
    }
    const seen = new Set();

    (function walk(node, inCompare) {
      if (typeof node === 'string') {
        const m = node.match(ANCHOR_RE);
        if (!m || seen.has(node)) return;
        seen.add(node);
        const rel = node.slice(0, node.lastIndexOf('#'));
        const cited = Number(m[1]);
        const kind = kindOf(rel);
        /* compare_with 可以引**對比對象**那一頁,也可以引**自己**那一頁 —— 兩者都合理:
           ST36 配 SP6 引的是脾經 SP-6 那頁(對象在另一份課件);
           BL16 配 BL17 引的是 AP Point Book p.160,那是 BL16 自己的專論頁。
           初版只收「對象」,結果 BL16/BL17 這種同檔相鄰的比較互相判錯,
           一口氣生出 37 個假缺陷。判準寧可寬:引錯頁才是缺陷,引哪一邊不是。 */
        const targets = inCompare ? [self, ...partners] : [self];
        const pages = pagesFor(rel);
        if (!pages) { res.unresolved.push({ code: rec.code, node, why: '課件檔讀不到' }); return; }

        if (kind === 'prose') {
          const txt = pages[cited - 1] || '';
          // 弱檢查:不計入「指對」,見檔頭〈已知盲區〉
          if (targets.some((t) => mentionsAnywhere(txt, t))) res.weak++;
          else res.unresolved.push({ code: rec.code, node, why: '散文:被引頁沒提到' });
          return;
        }
        const hits = [];
        for (const t of targets) {
          const h = ownPages(rel, t, kind);
          if (h) hits.push(...h);
        }
        /* 合訂本那條 `LOCATION:` 判準是為了把索引頁排掉,但它也可能排掉一頁
           排版走樣、少了 LOCATION: 的真專論頁 —— 那會讓一個**正確**的錨點被判成
           指錯,是這支最不能犯的錯。所以再放一條:被引的那一頁自己有一行以該代號
           開頭,就算對。實測這條不會讓抓錯的能力下降(突變測試仍 2/3)。 */
        if (!hits.includes(cited)) {
          const pg = pages[cited - 1] || '';
          if (pg.split('\n').some((line) => targets.includes(codeAtLineStart(line)))) { res.ok++; return; }
        }
        if (!hits.length) { res.unresolved.push({ code: rec.code, node, why: '課件裡找不到該穴自身條目(代號寫法可能不在別名表)' }); return; }
        if (hits.includes(cited)) res.ok++;
        else res.wrong.push({ code: rec.code, node, cited, actual: [...new Set(hits)].sort((a, b) => a - b), kind });
        return;
      }
      if (Array.isArray(node)) return node.forEach((v) => walk(v, inCompare));
      if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) walk(node[k], inCompare || k === 'compare_with');
      }
    })(rec, false);
  }

  const scanned = res.ok + res.weak + res.wrong.length + res.unresolved.length;
  /* 抽到 0 個錨點 = 解析器壞了,不是資料乾淨。這個 repo 已經被這種
     「抽 0 筆卻報全過」的報告誤導過很多次。 */
  if (scanned === 0) {
    console.error('FAIL — 一個 #p 錨點都沒抽到。這是解析器壞了,不是資料乾淨。');
    console.error('       檢查 ANCHOR_RE 與 ' + path.relative(ROOT, POINTS) + '。');
    process.exit(2);
  }

  /* 版面判準對不上抽取器時的斷路器。
     本機用的是 Git for Windows 內附的 Xpdf 4.00,CI 用的是 poppler 的 pdftotext ——
     兩者 -layout 的分欄結果不保證一致。判準對不上的樣子是「查不到」暴增
     (代號不再頂在行首),不是缺陷暴增,所以那個方向本來就不 gate。
     但**整批查不到**代表這支已經什麼都沒在量了,那種「安靜地全過」正是
     這個 repo 反覆吃虧的失敗模式,所以直接當工具壞掉喊出來。
     門檻放到 40%:今天是 0/419,真的撞到就一定是抽取器換了,不是資料漂移。 */
  const unresolvedRatio = res.unresolved.length / scanned;
  if (unresolvedRatio > 0.4) {
    console.error('FAIL — ' + res.unresolved.length + '/' + scanned + ' 個錨點查不到該穴自身條目('
      + Math.round(unresolvedRatio * 100) + '%)。');
    console.error('       這不是資料壞,是版面判準對不上目前這個 pdftotext 的輸出;');
    console.error('       在判準修好之前,這支量到的數字不能當作驗過。');
    process.exit(2);
  }

  const byCode = {};
  for (const w of res.wrong) {
    const label = 'P1 頁碼指錯(' + w.kind + ')';
    byCode[label] = (byCode[label] || 0) + 1;
  }

  if (jsonMode) {
    // 只有「指錯」進缺陷數。查不到單獨報,不 gate —— 別名表漏一種寫法
    // 不該讓好資料變成缺陷。
    console.log(JSON.stringify({ defects: res.wrong.length, by_code: byCode, scanned, verified: res.ok, weak: res.weak, unresolved: res.unresolved.length }));
    return;
  }

  console.log('validate-acupoint-page-anchor-accuracy — 引的頁碼是不是那一頁');
  console.log('  掃到 #p 錨點        ' + scanned);
  console.log('  強檢查通過          ' + res.ok + '   ← 確認在該穴自己那一頁');
  console.log('  弱檢查(散文)      ' + res.weak + '   ← 只確認被引頁提到過;見檔頭盲區說明,不算已驗證');
  console.log('  **指錯**            ' + res.wrong.length + '   ← 缺陷數,由 ratchet 把關');
  console.log('  查不到(不算缺陷)  ' + res.unresolved.length + '   ← 別名表或版面判準的覆蓋率問題,不是資料錯');

  if (res.wrong.length) {
    const show = process.argv.includes('--worklist') ? res.wrong : res.wrong.slice(0, 15);
    console.log('');
    for (const w of show) {
      console.log('  ' + String(w.code).padEnd(6) + ' 寫 p.' + w.cited + ' → 該穴自身條目在 p.' + w.actual.join('/'));
      console.log('      ' + w.node.replace('curriculum/acupoints/', ''));
    }
    if (show.length < res.wrong.length) console.log('  …另有 ' + (res.wrong.length - show.length) + ' 筆,加 --worklist 全列。');
  }
  if (res.unresolved.length && process.argv.includes('--worklist')) {
    console.log('\n--- 查不到(供補別名表/判準用,不是缺陷)---');
    for (const u of res.unresolved) console.log('  ' + String(u.code).padEnd(6) + ' ' + u.why + '  ' + u.node.replace('curriculum/acupoints/', ''));
  }

  console.log('');
  console.log('  三種來源用三把尺:table 看自身那一列 / compendium 看專論頁(行首代號 + LOCATION:)');
  console.log('  / prose 看該頁有沒有提到。compare_with 引自己或對比對象那一頁都算對。');
  console.log(res.wrong.length ? '\n' + res.wrong.length + ' 筆指錯(數量由 check-validation-ratchet.js 把關,不准變多)。'
    : '\nPASS — 每個判得出來的錨點都指到該穴自己的那一頁。');
  if (res.wrong.length) process.exit(1);
}

main();

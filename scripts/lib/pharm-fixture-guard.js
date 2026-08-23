'use strict';
/* pharm-fixture-guard.js — 防止負向測試把「已被改壞的檔案」當成原始檔存回去
 *
 * test-pharm-negative-cases.js 與 test-pharm-source-integrity-negative-cases.js
 * 的手法是:啟動時把 data/pharmacology/*.json 讀進記憶體當「原始檔」,接著把
 * 壞資料寫進**真正的 tracked 檔案**跑驗證器,最後再寫回原始檔。
 *
 * 單獨跑沒問題。但這個 repo 同時有多個 agent session 在跑閘門,於是:
 *
 *   A process 寫入壞資料 ──┐
 *                          ├─ B process 此刻啟動,把壞資料讀成自己的「原始檔」
 *   A process 還原 ────────┘
 *   B process 結束時還原 → 把壞資料寫回去,而且 commit 得掉
 *
 * 2026-08-12 實際發生過:`drug.albuterol` 的 medlineplus 佐證記錄整筆從
 * medlineplus_verified_links.json 消失,檔尾換行也不見了(JSON.stringify 的
 * 寫入特徵)。接著 validate-pharm-standard.js 報 P0「標註 verified_exact 但
 * 找不到佐證記錄」—— 看起來像資料缺陷,其實是測試互相踩。
 *
 * 這支守衛只做一件事:**啟動時 tracked 檔案必須是乾淨的**。不乾淨就拒跑,
 * 不要猜、不要修、更不要把當下內容當成基準存起來。
 *
 * 為什麼用 git 而不是雜湊表:git 已經知道「乾淨」的定義,而且它比對的是
 * committed 內容 —— 那正是我們要還原成的東西。多存一份基準雜湊只會多一個
 * 會過期的真相來源。
 */
const { execFileSync } = require('child_process');

function assertFixturesClean(root, paths) {
  let out;
  try {
    out = execFileSync('git', ['status', '--porcelain', '--', ...paths], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    // 沒有 git(tarball、容器)就不擋 —— 守衛不該讓合法環境跑不動。
    return { skipped: true, reason: 'git unavailable' };
  }
  const dirty = out.split('\n').map((l) => l.trim()).filter(Boolean);
  if (dirty.length) {
    const msg =
      'pharm fixture guard: 這些檔案在測試開始前就已經被改動,拒絕執行 ——\n' +
      dirty.map((d) => '    ' + d).join('\n') +
      '\n  原因:本測試會把當下內容當成「原始檔」,結束時寫回去。若現在的內容\n' +
      '  已經是別的行程寫壞的中間狀態,還原動作會把壞資料變成永久狀態。\n' +
      '  處理:確認沒有其他 session 正在跑 pharm 閘門,然後\n' +
      '    git checkout -- data/pharmacology\n' +
      '  再重跑。若那些改動是你自己刻意要留的,先 commit 或 stash。';
    const err = new Error(msg);
    err.pharmFixtureGuard = true;
    throw err;
  }
  return { skipped: false };
}

module.exports = { assertFixturesClean };

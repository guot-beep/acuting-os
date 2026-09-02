#!/usr/bin/env node
/**
 * pull-clinical-from-d1.js — 把雲端(D1)的整本病例拉回桌機當備份 + 建 29 張投影表供查詢。
 *
 * 用法(建議把鑰匙放環境變數,不要寫在指令列):
 *   $env:CF_ACCESS_CLIENT_ID="…"; $env:CF_ACCESS_CLIENT_SECRET="…"
 *   node scripts/pull-clinical-from-d1.js --url https://acuting-os.guotingru.workers.dev [--out "%USERPROFILE%\Documents\AcuTing\backups"] [--keep 14]
 *   本機 e2e:node scripts/pull-clinical-from-d1.js --url http://127.0.0.1:8797(旁路模式不需鑰匙)
 *
 * 做什麼:
 *   1. GET {url}/__clinical/kv(帶 Access service token 標頭;Access 會換成 JWT 交給 Worker)
 *   2. 寫 <out>/acuting-clinical-d1-<時間>.json(v1 信封:{schema_version:1, exported_at, source:"d1", revision, cases})
 *      —— 這份 JSON 可以直接用 app 的「匯入」還原(回滾用)。
 *   3. 用 export-clinical-to-sqlite.js 建 <out>/acuting-clinical-d1-<時間>.db(29 張表,可下 SQL)。
 *   4. 只留最近 --keep 份(json 與 db 各算)。
 * 產物是臨床資料:預設放 Documents\AcuTing\backups(repo 外),**絕不** commit(D7)。螢幕只印筆數,不印內容。
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const URL_BASE = String(arg("--url", "https://acuting-os.guotingru.workers.dev")).replace(/\/+$/, "");
const OUT = path.resolve(arg("--out", path.join(os.homedir(), "Documents", "AcuTing", "backups")));
const KEEP = Number(arg("--keep", 14));
const CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID || arg("--client-id", "");
const CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET || arg("--client-secret", "");
const KEY = "acuting-clinical-cases-v1";
const EXPORTER = path.join(__dirname, "export-clinical-to-sqlite.js");

(async () => {
  const headers = { "Accept": "application/json" };
  if (CLIENT_ID && CLIENT_SECRET) { headers["CF-Access-Client-Id"] = CLIENT_ID; headers["CF-Access-Client-Secret"] = CLIENT_SECRET; }
  let res;
  try { res = await fetch(`${URL_BASE}/__clinical/kv`, { headers, redirect: "manual" }); }
  catch (e) { console.error(`FAIL — 連不到 ${URL_BASE}:${e.message}`); process.exit(1); }
  const text = await res.text();
  let j = null; try { j = JSON.parse(text); } catch (_) { /* HTML = Access 登入頁 */ }
  if (res.status === 302 || (res.status === 200 && !j)) {
    console.error("FAIL — 被 Access 擋在門外(回的是登入頁)。service token 沒帶、過期,或 Worker 的 ACCESS_ALLOWED_SERVICE_TOKENS 沒列這把鑰匙。零寫入。");
    process.exit(1);
  }
  if (res.status !== 200) {
    console.error(`FAIL — 服務回 HTTP ${res.status}:${j ? (j.message || j.error) : text.slice(0, 120)}。零寫入。`);
    process.exit(1);
  }
  if (!j || typeof j.keys !== "object" || !Number.isSafeInteger(j.revision)) { console.error("FAIL — 快照形狀不對,零寫入。"); process.exit(1); }
  const raw = j.keys[KEY];
  let cases = [];
  if (raw !== undefined) {
    try { cases = JSON.parse(raw); } catch (_) { console.error("FAIL — 正本不是合法 JSON;雲端資料可能有問題,先別覆蓋任何東西,把這行貼給 Claude。"); process.exit(1); }
    if (!Array.isArray(cases)) { console.error("FAIL — 正本不是陣列。"); process.exit(1); }
  }
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonFile = path.join(OUT, `acuting-clinical-d1-${stamp}.json`);
  const dbFile = path.join(OUT, `acuting-clinical-d1-${stamp}.db`);
  const envelope = { schema_version: 1, exported_at: new Date().toISOString(), source: "d1", source_url: URL_BASE, revision: j.revision, case_count: cases.length, cases };
  fs.writeFileSync(jsonFile, JSON.stringify(envelope, null, 2));
  console.log(`雲端 revision ${j.revision},病例 ${cases.length} 筆,其他 key ${Object.keys(j.keys).filter((k) => k !== KEY).length} 個`);
  console.log(`JSON 備份 → ${jsonFile}`);

  let dbOk = false;
  try {
    const out = execFileSync(process.execPath, [EXPORTER, jsonFile, dbFile], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const lines = out.split(/\r?\n/).filter((l) => /寫入結果|合計|往返核對|✓ 全部相符|⛔|⚠️/.test(l));
    console.log(lines.map((l) => "  " + l).join("\n"));
    dbOk = true;
  } catch (e) {
    console.log("投影表建立有警告 / 失敗(JSON 備份仍完整):");
    console.log(String(e.stdout || e.message).split(/\r?\n/).filter(Boolean).slice(-8).map((l) => "  " + l).join("\n"));
  }
  console.log(`${dbOk ? "SQLite 投影" : "SQLite 投影(不完整)"} → ${dbFile}`);

  for (const ext of [".json", ".db"]) {
    const files = fs.readdirSync(OUT).filter((f) => f.startsWith("acuting-clinical-d1-") && f.endsWith(ext)).sort();
    while (files.length > KEEP) { const f = files.shift(); try { fs.unlinkSync(path.join(OUT, f)); } catch (_) { /* */ } }
  }
  console.log(`\n備份資料夾只留最近 ${KEEP} 份。這些檔案是病歷,不要放進 git、不要上傳到公開的地方。`);
})().catch((e) => { console.error("FAIL —", e.message); process.exit(1); });

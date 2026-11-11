#!/usr/bin/env node
/**
 * pull-clinical-from-d1.js — 把雲端(D1)的整本病例拉回桌機當備份 + 建 32 張投影表供查詢。
 *
 * 用法(通行碼只放環境變數,**不要**寫在指令列 —— 指令列會留在 shell 歷史):
 *   $env:ACUTING_CLINICAL_PASSPHRASE="…"          ← 2026-09-06 起正式站用通行碼(D1 + 通行碼上線)
 *   node scripts/pull-clinical-from-d1.js --url https://acuting-os.guotingru.workers.dev [--out "%USERPROFILE%\Documents\AcuTing\backups"] [--keep 14]
 *   (部署若換回 Cloudflare Access,改用 $env:CF_ACCESS_CLIENT_ID / $env:CF_ACCESS_CLIENT_SECRET;兩種都給就先用通行碼。)
 *   2026-11-11 之前這支只會帶 Access 的 service token —— 正式站改通行碼之後它每次都是 401,等於沒有站外備份。
 *   本機 e2e:node scripts/pull-clinical-from-d1.js --url http://127.0.0.1:8797(旁路模式不需鑰匙)
 *
 * 做什麼:
 *   1. GET {url}/__clinical/kv(帶 Access service token 標頭;Access 會換成 JWT 交給 Worker)
 *   2. 寫 <out>/acuting-clinical-d1-<時間>.json(v1 信封:{schema_version:1, exported_at, source:"d1", revision, cases})
 *      —— 這份 JSON 可以直接用 app 的「匯入」還原(回滾用)。
 *   3. 用 export-clinical-to-sqlite.js 建 <out>/acuting-clinical-d1-<時間>.db(32 張表,可下 SQL)。
 *   4. 藥櫃(acuting-herb-inventory-v1:品項、批次、異動帳、開藥紀錄)另存 <out>/acuting-herb-inventory-d1-<時間>.json,
 *      內容就是 app「匯出藥櫃備份」的那一份。雲端沒有藥櫃資料就不寫這個檔。
 *   5. 只留最近 --keep 份(各種檔各算)。
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
const INVENTORY_KEY = "acuting-herb-inventory-v1";
const PASSPHRASE = process.env.ACUTING_CLINICAL_PASSPHRASE || "";
const EXPORTER = path.join(__dirname, "export-clinical-to-sqlite.js");

(async () => {
  const headers = { "Accept": "application/json" };
  if (PASSPHRASE) {
    // 通行碼模式:先換一張通行證(只在記憶體裡,不寫檔、不印出來),再拿它讀整本。
    let a;
    try { a = await fetch(`${URL_BASE}/__clinical/auth`, { method: "POST", redirect: "manual",
      headers: { "Content-Type": "application/json", "X-AcuTing-Client": "pull-clinical-from-d1" }, body: JSON.stringify({ passphrase: PASSPHRASE }) }); }
    catch (e) { console.error(`FAIL — 連不到 ${URL_BASE}:${e.message}`); process.exit(1); }
    let aj = null; try { aj = JSON.parse(await a.text()); } catch (_) { /* */ }
    if (a.status !== 200 || !aj || typeof aj.token !== "string" || !aj.token) {
      const why = a.status === 401 ? "通行碼不對" : a.status === 429 ? "試太多次被暫時鎖住,晚點再試" : a.status === 409 ? "這個病例庫還沒設定通行碼"
        : a.status === 404 ? "這個部署不是通行碼模式(改用 Access 的 service token)" : `HTTP ${a.status}`;
      console.error(`FAIL — 換不到通行證(${why})。零寫入。`);
      process.exit(1);
    }
    headers["X-AcuTing-Auth"] = aj.token;
  } else if (CLIENT_ID && CLIENT_SECRET) { headers["CF-Access-Client-Id"] = CLIENT_ID; headers["CF-Access-Client-Secret"] = CLIENT_SECRET; }
  let res;
  try { res = await fetch(`${URL_BASE}/__clinical/kv`, { headers, redirect: "manual" }); }
  catch (e) { console.error(`FAIL — 連不到 ${URL_BASE}:${e.message}`); process.exit(1); }
  const text = await res.text();
  let j = null; try { j = JSON.parse(text); } catch (_) { /* HTML = Access 登入頁 */ }
  if (res.status === 302 || (res.status === 200 && !j)) {
    console.error("FAIL — 被 Access 擋在門外(回的是登入頁)。service token 沒帶、過期,或 Worker 的 ACCESS_ALLOWED_SERVICE_TOKENS 沒列這把鑰匙。零寫入。");
    process.exit(1);
  }
  if (res.status === 401 && j && j.auth_mode === "passphrase" && !PASSPHRASE) {
    console.error("FAIL — 這個站用通行碼登入,而環境變數 ACUTING_CLINICAL_PASSPHRASE 沒有設。零寫入。");
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
  // 藥櫃:先驗過再決定寫不寫(壞掉的內容照樣存原文,檔名標 .raw,不假裝它是好的備份)
  const invRaw = j.keys[INVENTORY_KEY];
  let inventory = null, inventoryBroken = false;
  if (invRaw !== undefined) {
    try { inventory = JSON.parse(invRaw); } catch (_) { inventoryBroken = true; }
    if (!inventoryBroken && (!inventory || typeof inventory !== "object" || !Array.isArray(inventory.txns))) inventoryBroken = true;
  }
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonFile = path.join(OUT, `acuting-clinical-d1-${stamp}.json`);
  const dbFile = path.join(OUT, `acuting-clinical-d1-${stamp}.db`);
  const envelope = { schema_version: 1, exported_at: new Date().toISOString(), source: "d1", source_url: URL_BASE, revision: j.revision, case_count: cases.length, cases };
  fs.writeFileSync(jsonFile, JSON.stringify(envelope, null, 2));
  console.log(`雲端 revision ${j.revision},病例 ${cases.length} 筆,其他 key ${Object.keys(j.keys).filter((k) => k !== KEY).length} 個`);
  console.log(`JSON 備份 → ${jsonFile}`);
  if (invRaw === undefined) console.log("藥櫃:雲端還沒有藥櫃資料,沒有寫藥櫃備份。");
  else if (inventoryBroken) {
    const f = path.join(OUT, `acuting-herb-inventory-d1-${stamp}.raw.txt`);
    fs.writeFileSync(f, invRaw);
    console.log(`⚠️ 藥櫃內容不是預期的形狀 —— 原文照存 → ${f}(把這行貼給 Claude)`);
  } else {
    const f = path.join(OUT, `acuting-herb-inventory-d1-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(inventory, null, 2));
    console.log(`藥櫃備份 → ${f}(品項 ${(inventory.products || []).length}、批次 ${(inventory.lots || []).length}、異動 ${inventory.txns.length}、開方 ${(inventory.rx || []).length})`);
  }

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

  for (const [prefix, ext] of [["acuting-clinical-d1-", ".json"], ["acuting-clinical-d1-", ".db"], ["acuting-herb-inventory-d1-", ".json"], ["acuting-herb-inventory-d1-", ".raw.txt"]]) {
    const files = fs.readdirSync(OUT).filter((f) => f.startsWith(prefix) && f.endsWith(ext)).sort();
    while (files.length > KEEP) { const f = files.shift(); try { fs.unlinkSync(path.join(OUT, f)); } catch (_) { /* */ } }
  }
  console.log(`\n備份資料夾只留最近 ${KEEP} 份。這些檔案是病歷,不要放進 git、不要上傳到公開的地方。`);
})().catch((e) => { console.error("FAIL —", e.message); process.exit(1); });

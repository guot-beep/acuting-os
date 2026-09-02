#!/usr/bin/env node
/**
 * make-clinical-passphrase-hash.js — 把妳想好的通行碼算成「鹽 + 雜湊」,貼進 Cloudflare 設定。
 *
 * **通行碼原文不會離開這台電腦**:這支不上傳、不寫檔、不進 git,螢幕上也不會回顯妳打的字。
 * 貼到雲端的只有鹽與雜湊 —— 從雜湊反推不出通行碼。
 *
 * 用法(在 PowerShell):
 *   $env:Path = "C:\Program Files\nodejs;" + $env:Path
 *   node C:\Projects\acuting-sqlite-tools\scripts\make-clinical-passphrase-hash.js
 * 它會問妳兩次通行碼(第二次確認打的一樣),然後印出要貼的四行。
 *
 * 選項:
 *   --iterations N   PBKDF2 迭代次數(預設 120000;Workers 免費方案 CPU 吃緊時會請妳降低)
 *   --check          只驗「我記得的通行碼對不對」:貼上現有的 salt/hash 再輸入通行碼
 */
"use strict";
const readline = require("readline");
const path = require("path");
const { pathToFileURL } = require("url");

const argv = process.argv.slice(2);
const iterIdx = argv.indexOf("--iterations");
const ITER = iterIdx >= 0 ? Number(argv[iterIdx + 1]) : undefined;
const CHECK = argv.includes("--check");

/* 非 TTY(管線餵資料、CI 自測):readline 會在我掛上監聽之前就把行送完,於是第二個問題永遠等不到答案。
 * 所以乾脆先把 stdin 一次讀完再逐行發 —— 行為完全確定,也讓這支能進自測。 */
let pipedLines = null;
async function pipedLine() {
  if (pipedLines === null) {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    pipedLines = Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
  }
  return pipedLines.length ? pipedLines.shift() : "";
}

/** 不回顯的輸入(Windows 的 cmd/PowerShell 都可用):把 stdin 設 raw,自己收字元。 */
function askSecret(prompt) {
  return new Promise((resolve, reject) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    if (!stdin.isTTY) { pipedLine().then((l) => { process.stdout.write("\n"); resolve(l); }); return; }
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
    let buf = "";
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n") { stdin.setRawMode(false); stdin.pause(); stdin.removeListener("data", onData); process.stdout.write("\n"); resolve(buf); return; }
      if (ch === "\u0003") { stdin.setRawMode(false); stdin.pause(); process.stdout.write("\n已取消。\n"); process.exit(130); }
      if (ch === "\u007f" || ch === "\b") { buf = buf.slice(0, -1); return; }
      buf += ch;
    };
    stdin.on("data", onData);
    stdin.on("error", reject);
  });
}

function askVisible(prompt) {
  process.stdout.write(prompt);
  if (!process.stdin.isTTY) return pipedLine().then((l) => { process.stdout.write("\n"); return String(l).trim(); });
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("", (a) => { rl.close(); resolve(a.trim()); });
  });
}

const randomSecret = () => {
  const b = require("crypto").randomBytes(32);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

(async () => {
  const A = await import(pathToFileURL(path.join(__dirname, "..", "src", "passphrase-auth.mjs")).href);

  if (CHECK) {
    const salt = await askVisible("貼上現有的 CLINICAL_PASS_SALT:");
    const hash = await askVisible("貼上現有的 CLINICAL_PASS_HASH:");
    const iter = Number(await askVisible("CLINICAL_PASS_ITER(直接按 Enter 用預設):")) || A.DEFAULT_ITERATIONS;
    const p = await askSecret("輸入妳記得的通行碼(不會顯示):");
    const ok = await A.verifyPassphrase(p, { salt, hash, iterations: iter });
    console.log(ok ? "\n✓ 對的,就是這個通行碼。" : "\n✗ 不對。(注意大小寫與空白;中文全形半形我這邊已經正規化過)");
    process.exit(ok ? 0 : 1);
  }

  console.log("設定病例通行碼\n");
  console.log("先想一句自己記得住、別人猜不到的話。可以是中文,例如「白虎湯加石膏四十克」;");
  console.log("或四五個英文詞加空格。不要用生日、電話、診所名字。");
  console.log(`強度規則:中文一個字算 2、其他算 1,總分至少 ${A.MIN_PASSPHRASE_WEIGHT},字數至少 ${A.MIN_PASSPHRASE_CHARS}。\n`);

  const p1 = await askSecret("通行碼(不會顯示):");
  const p2 = await askSecret("再打一次確認:");
  if (A.normalizePassphrase(p1) !== A.normalizePassphrase(p2)) {
    console.error("\n兩次打的不一樣,沒有產生任何東西。重跑一次。");
    process.exit(1);
  }
  let rec;
  try { rec = await A.makePassphraseRecord(p1, ITER); }
  catch (e) { console.error("\n" + e.message); process.exit(1); }

  const secret = randomSecret();
  const w = A.passphraseWeight(p1);
  console.log(`\n✓ 通行碼強度 ${w}(門檻 ${A.MIN_PASSPHRASE_WEIGHT})。以下四行貼給 Claude,或自己貼進 Cloudflare:\n`);
  console.log(`CLINICAL_PASS_SALT   = ${rec.salt}`);
  console.log(`CLINICAL_PASS_HASH   = ${rec.hash}`);
  console.log(`CLINICAL_PASS_ITER   = ${rec.iterations}`);
  console.log(`CLINICAL_TOKEN_SECRET= ${secret}`);
  console.log(`\n這四行都**不是**通行碼,外流也推不回妳打的那句話 —— 但 TOKEN_SECRET 能偽造通行證,`);
  console.log(`所以還是當作密碼看待:貼完就從畫面清掉,不要放進 git、不要用 email 寄給自己。`);
  console.log(`\n忘記通行碼怎麼辦:重跑這支產生新的四行、換上去,並把 CLINICAL_PASS_VERSION 加 1 —— `);
  console.log(`舊的通行證全部失效,病例一個字都不會動。`);
})().catch((e) => { console.error("失敗:", e && e.message || e); process.exit(1); });

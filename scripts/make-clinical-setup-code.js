#!/usr/bin/env node
/**
 * make-clinical-setup-code.js — 產生一次性「設定碼」與它的雜湊。
 *
 * 為什麼需要這一層:**這個 repo 是公開的**(github.com/guot-beep/acuting-os)。
 * wrangler.jsonc 跟著進 GitHub,所以寫在裡面的東西等於公開。
 * 一句人記得住的通行碼,把 salt+hash 公開之後撐不住離線破解 ——
 * 30,000 次 PBKDF2 迭代對 GPU 來說只是把時間從幾分鐘拉到大約一天。
 *
 * 所以分成兩層:
 *   設定碼   16 碼亂數(31 字母表 → 約 79 bits)。雜湊公開也破不了。只用一次。
 *   通行碼   她自己選、記得住的那句。雜湊由 Worker 寫進 D1,**永不進 git**。
 *
 * 產出的四行放進 wrangler.jsonc 的 vars;設定碼本身給她一次,用完就沒有用處了。
 * 忘記通行碼要重設:重跑這支、換掉四行、把 CLINICAL_SETUP_EPOCH 加 1(病例一個字都不會動)。
 *
 * 用法:node scripts/make-clinical-setup-code.js [--epoch N]
 */
"use strict";
const crypto = require("crypto");

const argv = process.argv.slice(2);
const at = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const epoch = Number(at("--epoch", "1"));
const ITER = 30000;   // 與 Worker 的 DEFAULT_ITERATIONS 一致(免費方案每請求 10ms CPU)

// 去掉 i l o 0 1:她要在手機上照著打一次,不能有看得混的字
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
let code = "";
for (let i = 0; i < 16; i++) {
  if (i && i % 4 === 0) code += "-";
  code += ALPHA[crypto.randomInt(ALPHA.length)];
}

const b64url = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const salt = crypto.randomBytes(16);
/* 與 src/passphrase-auth.mjs 的 derivePassphraseHash 逐項對齊:
 *   NFKC + trim → UTF-8 位元組、PBKDF2-SHA256、256 bit、**鹽是 base64url 解碼後的原始位元組**(不是那串文字)。
 * 這裡曾經拿 base64url 字串本身當鹽,產出的雜湊 Worker 永遠驗不過;
 * 底下的自我驗證就是為了不讓這種錯誤靜靜地印出一組沒有人能用的設定。 */
const normalized = String(code).normalize("NFKC").trim();
const saltB64 = b64url(salt);
const hash = crypto.pbkdf2Sync(Buffer.from(normalized, "utf8"), salt, ITER, 32, "sha256");

const bits = Math.round(16 * Math.log2(ALPHA.length));

/* 自我驗證:拿 Worker 自己那支 verifyPassphrase 對這組 salt/hash 驗一次。
 * 不驗就印出去的話,一組演算法對不上的設定會一路活到她打完設定碼才爆,
 * 而那時她在診間、我不在線上。對不上就直接死掉,不印任何東西。 */
(async () => {
  const { verifyPassphrase } = await import("../src/passphrase-auth.mjs");
  const ok = await verifyPassphrase(code, { salt: saltB64, hash: b64url(hash), iterations: ITER });
  const rejectsWrong = !(await verifyPassphrase(code.replace(/.$/, "z") + "x", { salt: saltB64, hash: b64url(hash), iterations: ITER }));
  if (!ok || !rejectsWrong) {
    console.error(`FAIL — 產生的設定碼過不了 Worker 的驗證(正確碼通過=${ok}、錯誤碼被擋=${rejectsWrong})。什麼都沒有輸出。`);
    process.exit(1);
  }
  console.log(`
一次性設定碼(只用一次,用完就作廢):

    ${code}

強度約 ${bits} bits —— 下面四行公開在 GitHub 上也推不回這個碼。
把這四行放進 wrangler.jsonc 的 vars:

  "CLINICAL_SETUP_SALT":  "${saltB64}",
  "CLINICAL_SETUP_HASH":  "${b64url(hash)}",
  "CLINICAL_SETUP_ITER":  "${ITER}",
  "CLINICAL_SETUP_EPOCH": "${epoch}",

已用 Worker 的 verifyPassphrase 自我驗證通過。

第一次打開 app 時會問設定碼,接著讓她訂自己的通行碼。
那句通行碼的雜湊寫進 D1,永遠不會出現在 git 裡。
設定完成後這個端點自己關上(回 410),設定碼再也用不到。

忘記通行碼:重跑這支加 --epoch ${epoch + 1},換掉四行,就能再設定一次。
`);
})();


#!/usr/bin/env node
/** test-d1-deploy-gate.js — 證明 validate-d1-deploy-gate.js 每一條都會亮紅燈(合成檔,不碰 repo)。 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { check, stripJsonc } = require("./validate-d1-deploy-gate.js");

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };
const META = '<meta name="acuting-clinical-backend" content="d1">';
const GUARD = 'document.querySelector(\'meta[name="acuting-clinical-backend"]\'); if (declaredCloud && !window.AcuTingClinicalBackend) {} }\nlet clinicalStoreIntegrityError = (typeof window !== "undefined" && window.__acutingBootIntegrityError) || null;\nfunction x() {';
const mk = (cfg, html, appJs) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-gate-"));
  fs.writeFileSync(path.join(dir, "wrangler.jsonc"), typeof cfg === "string" ? cfg : JSON.stringify(cfg, null, 2));
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><head><meta charset="utf-8">${html || ""}</head><body></body>`);
  fs.writeFileSync(path.join(dir, "app.js"), appJs === undefined ? `function loadClinicalCases() { const declaredCloud = ${GUARD} }` : appJs);
  return dir;
};
const base = {
  name: "acuting-os", compatibility_date: "2026-07-26",
  build: { command: "node scripts/build-site.js" },
  assets: { directory: "./dist", not_found_handling: "single-page-application" },
};
const full = {
  ...base, main: "src/worker.mjs",
  assets: { ...base.assets, binding: "ASSETS", run_worker_first: ["/__clinical/*"] },
  d1_databases: [{ binding: "CLINICAL_DB", database_name: "acuting-clinical", database_id: "0f1e2d3c-4b5a-4978-8a9b-0c1d2e3f4a5b" }],
  vars: { ENVIRONMENT: "production", ACCESS_TEAM_DOMAIN: "https://acuting.cloudflareaccess.com", ACCESS_AUD: "a".repeat(64), ACCESS_ALLOWED_EMAILS: "guotingru@gmail.com", CLINICAL_DB_NAME: "acuting-clinical" },
};
const expectFail = (label, dir, re) => { const p = check(dir); assert(p.length, `${label}: 竟然 PASS`); if (re) assert(p.some((x) => re.test(x)), `${label}: 訊息不含預期 → ${p.join(" | ")}`); ok(`${label} → ${p[0].slice(0, 70)}`); };
const expectPass = (label, dir) => { const p = check(dir); assert.deepStrictEqual(p, [], `${label}: ${p.join(" | ")}`); ok(label); };

console.log("\n一致性(G1)");
expectPass("兩者皆無(今天的 main)→ PASS", mk(base, ""));
expectFail("有 meta 沒 Worker → FAIL", mk(base, META), /G1/);
expectFail("有 Worker 沒 meta → FAIL(兩本簿子)", mk(full, ""), /G1/);
expectPass("兩者皆有且完整 → PASS", mk(full, META));

console.log("\n完整性(G2)");
expectFail("database_id 是 placeholder", mk({ ...full, d1_databases: [{ ...full.d1_databases[0], database_id: "<<DATABASE_ID>>" }] }, META), /UUID|placeholder/);
expectFail("缺 CLINICAL_DB 綁定", mk({ ...full, d1_databases: [] }, META), /CLINICAL_DB/);
expectFail("缺 run_worker_first", mk({ ...full, assets: { ...full.assets, run_worker_first: [] } }, META), /run_worker_first/);
expectFail("assets.binding 不是 ASSETS", mk({ ...full, assets: { ...full.assets, binding: "STATIC" } }, META), /binding/);
expectFail("ACCESS_TEAM_DOMAIN 格式錯", mk({ ...full, vars: { ...full.vars, ACCESS_TEAM_DOMAIN: "acuting.cloudflareaccess.com" } }, META), /ACCESS_TEAM_DOMAIN/);
expectFail("ACCESS_AUD 不是 64 hex", mk({ ...full, vars: { ...full.vars, ACCESS_AUD: "abc" } }, META), /ACCESS_AUD/);
expectFail("ACCESS_ALLOWED_EMAILS 空", mk({ ...full, vars: { ...full.vars, ACCESS_ALLOWED_EMAILS: " " } }, META), /ACCESS_ALLOWED_EMAILS/);
expectFail("ENVIRONMENT 不是 production", mk({ ...full, vars: { ...full.vars, ENVIRONMENT: "staging" } }, META), /ENVIRONMENT/);
expectFail("DEV_AUTH_BYPASS=1 混進正式設定", mk({ ...full, vars: { ...full.vars, DEV_AUTH_BYPASS: "1" } }, META), /DEV_AUTH_BYPASS/);
expectFail("meta content 不是 d1", mk(full, '<meta name="acuting-clinical-backend" content="sqlite">'), /content/);

console.log("\n第二道錨(G4)");
expectFail("app.js 沒有『宣告雲端但無連接器 → 唯讀』守門", mk(full, META, "function loadClinicalCases() { return []; }"), /G4/);
expectFail("守門在、但 let 沒從 hoisted 標記接手(TDZ 會讓守門失效)", mk(full, META, 'function loadClinicalCases() { const declaredCloud = document.querySelector(\'meta[name="acuting-clinical-backend"]\'); if (declaredCloud && !window.AcuTingClinicalBackend) {} }\nlet clinicalStoreIntegrityError = null;'), /接手|TDZ/);
expectPass("守門在 + 宣告接手 → PASS", mk(full, META));

console.log("\n認證模式(通行碼 / Access,恰好一種)");
const passVars = { ENVIRONMENT: "production", CLINICAL_DB_NAME: "acuting-clinical",
  CLINICAL_SETUP_SALT: "YAqmBYLid2hS2xwbjSHBGQ", CLINICAL_SETUP_HASH: "J5GLJDIgG8DOjRjoDBqbMkeeWBlx0J65yNkBOoCytdU",
  CLINICAL_SETUP_ITER: 120000, CLINICAL_SETUP_EPOCH: 1 };
const passCfg = { ...full, vars: passVars };
expectPass("通行碼模式(完整)→ PASS", mk(passCfg, META));
expectFail("兩種認證同時設", mk({ ...full, vars: { ...passVars, ACCESS_TEAM_DOMAIN: "https://acuting.cloudflareaccess.com", ACCESS_AUD: "a".repeat(64), ACCESS_ALLOWED_EMAILS: "x@y.z" } }, META), /只能留一種/);
expectFail("一種都沒設", mk({ ...full, vars: { ENVIRONMENT: "production" } }, META), /沒有任何認證設定/);
expectFail("SETUP_HASH 格式不對", mk({ ...full, vars: { ...passVars, CLINICAL_SETUP_HASH: "short" } }, META), /CLINICAL_SETUP_HASH/);
expectFail("SETUP_SALT 缺", mk({ ...full, vars: { ...passVars, CLINICAL_SETUP_SALT: "" } }, META), /CLINICAL_SETUP_SALT|只能留一種|沒有任何認證/);
expectFail("迭代次數太低", mk({ ...full, vars: { ...passVars, CLINICAL_SETUP_ITER: 500 } }, META), /CLINICAL_SETUP_ITER/);
expectFail("SETUP_EPOCH 不是正整數", mk({ ...full, vars: { ...passVars, CLINICAL_SETUP_EPOCH: 0 } }, META), /CLINICAL_SETUP_EPOCH/);
expectFail("簽證秘密被寫進 wrangler.jsonc", mk({ ...full, vars: { ...passVars, CLINICAL_TOKEN_SECRET: "oops-this-is-in-git" } }, META), /CLINICAL_TOKEN_SECRET/);
/* 這四條是最貴的那種錯誤的防線:有人(包括未來的我)把通行碼雜湊搬回設定檔。
 * repo 公開,那等於把離線破解的材料一起發佈,而一句記得住的通行碼撐不了一天。 */
for (const k of ["CLINICAL_PASS_HASH", "CLINICAL_PASS_SALT", "CLINICAL_PASS_ITER", "CLINICAL_PASS_VERSION"]) {
  expectFail(`${k} 被搬回公開設定檔`, mk({ ...full, vars: { ...passVars, [k]: "x".repeat(44) } }, META), new RegExp(k));
}

console.log("\n半套(G3)");
expectFail("沒 main 卻有 d1_databases", mk({ ...base, d1_databases: full.d1_databases }, ""), /G3/);

console.log("\njsonc 解析");
{
  const jsonc = `{\n  // 註解\n  "name": "x", /* 區塊 */\n  "url": "https://a.b/c", // 字串裡的 // 不能被吃掉\n  "arr": [1, 2,],\n}`;
  const j = JSON.parse(stripJsonc(jsonc));
  assert.strictEqual(j.url, "https://a.b/c"); assert.deepStrictEqual(j.arr, [1, 2]);
  ok("註解、尾逗號、字串內 // 都處理對");
  expectPass("真實 repo 風格的 jsonc(含註解)", mk(`{\n  // c\n  "name":"acuting-os",\n  "compatibility_date":"2026-07-26",\n  "assets":{"directory":"./dist","not_found_handling":"single-page-application"},\n}`, ""));
}
console.log(`\nPASS — ${passed} 條`);

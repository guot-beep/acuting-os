#!/usr/bin/env node
/**
 * v2-store-shape.js — D12 契約凍結的**第五個表面**(2026-08-28)。
 *
 * 第四個面凍的是 v1 的 `normalizeClinicalCase`/`normalizeSoapNote`。但 C2b 指針
 * 切過去之後,真正在用的是 **v2 staging envelope**(`acuting-clinical-v2-staging`),
 * 它由 `js/clinical-store.js` 的 `executeMigration()` / `buildMigrationPlan()` 組出來,
 * 而那裡的 **patient 列是另一份白名單**(id / patientCode / caseIds / caseCount /
 * fields / conflicts / needsReview / adjudicationsApplied)。
 *
 * 現有守衛只到 envelope 層:`minimumEnvelopeShapeError()` 會擋 schema_version /
 * journal / patients / cases 不見或型別不對 —— 但 **patient 列少一個欄位,它一句話
 * 都不會說**。少掉 `needsReview`/`conflicts` = 待審裁決狀態靜默消失。
 *
 * 這裡用靜態抽取(不執行):把三個物件字面量的**第一層鍵**抓出來凍住。
 * 不執行的原因是這條路徑是 async、且相依 crypto/IndexedDB;而契約要凍的是
 * 「寫下去的鍵有哪些」,鍵在字面量裡就看得到。抽不到就丟錯(fail-loud),
 * 不回空集合 —— 回空集合會讓 gate 看起來很綠、其實什麼都沒守。
 */
"use strict";

/** 從 `startIdx`(指向 `{`)起,抓出配對的物件字面量原文 */
function literalAt(src, startIdx) {
  let depth = 0, inStr = null, esc = false;
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return src.slice(startIdx, i + 1); }
  }
  return null;
}

/** 物件字面量第一層的鍵(略過巢狀、字串、註解) */
function topLevelKeys(literal) {
  const keys = [];
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false, atKeyPos = false;
  let i = 0;
  while (i < literal.length) {
    const ch = literal[i], next = literal[i + 1];
    if (inLine) { if (ch === "\n") inLine = false; i++; continue; }
    if (inBlock) { if (ch === "*" && next === "/") { inBlock = false; i += 2; continue; } i++; continue; }
    if (inStr) {
      if (esc) { esc = false; i++; continue; }
      if (ch === "\\") { esc = true; i++; continue; }
      if (ch === inStr) inStr = null;
      i++; continue;
    }
    if (ch === "/" && next === "/") { inLine = true; i += 2; continue; }
    if (ch === "/" && next === "*") { inBlock = true; i += 2; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; i++; continue; }
    if (ch === "{" || ch === "[" || ch === "(") { depth++; if (depth === 1) atKeyPos = true; i++; continue; }
    if (ch === "}" || ch === "]" || ch === ")") { depth--; i++; continue; }
    if (ch === "," && depth === 1) { atKeyPos = true; i++; continue; }
    // 只在「鍵的位置」(緊接 `{` 或第一層的 `,` 之後)才認鍵 —— 否則
    // `adjudicationsApplied: applied` 的**值** `applied` 會被誤認成一個簡寫鍵
    if (depth === 1 && atKeyPos) {
      const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(literal.slice(i));
      if (m) { keys.push(m[1]); atKeyPos = false; i += m[0].length; continue; }
      // 簡寫屬性(`fields,`):跟 `fields: x` 完全等價,漏掉它等於漏一個持久化欄位
      const sh = /^([A-Za-z_$][\w$]*)\s*[,}]/.exec(literal.slice(i));
      if (sh && !/^(await|new|true|false|null|undefined|typeof)$/.test(sh[1])) {
        keys.push(sh[1]); atKeyPos = false; i += sh[1].length; continue;
      }
      // 展開運算子(`...c`)代表整包收下,契約上等同 pass-through,記下來讓 gate 印
      if (literal.startsWith("...", i)) { keys.push("<spread>"); atKeyPos = false; i += 3; continue; }
    }
    i++;
  }
  return keys;
}

function grabLiteralAfter(src, anchor, label) {
  const at = src.indexOf(anchor);
  if (at < 0) {
    throw new Error(
      `clinical-store.js 裡找不到「${anchor}」(${label}) —— 這是 v2 持久化形狀的錨點,` +
      `被改寫或移除了。這支驗證器必須跟著更新,不能默默回空集合當成沒事。`
    );
  }
  const braceAt = src.indexOf("{", at + anchor.length - 1);
  const lit = literalAt(src, braceAt);
  if (!lit) throw new Error(`${label} 的物件字面量括號沒有收斂`);
  return lit;
}

/**
 * @param {string} storeSrc js/clinical-store.js 全文
 * @returns {{scopes:Object, notes:string[]}}
 */
function readV2StoreShapes(storeSrc) {
  const scopes = {};
  const notes = [];

  // 1. patient 列(buildMigrationPlan)
  const patientLit = grabLiteralAfter(storeSrc, "patients.push({", "v2 patient 列白名單");
  scopes["v2.patient_row"] = topLevelKeys(patientLit);

  // 2. staging envelope(executeMigration 寫進 STAGING_KEY 的那個物件)
  const stagingAnchor = "writeKey(STAGING_KEY, JSON.stringify(staging))";
  if (storeSrc.indexOf(stagingAnchor) < 0) {
    throw new Error("clinical-store.js 裡找不到 writeKey(STAGING_KEY, ...) —— v2 寫入點變了,驗證器必須跟著更新");
  }
  const stagingDecl = grabLiteralAfter(storeSrc, "const staging = {", "v2 staging envelope");
  scopes["v2.staging_envelope"] = topLevelKeys(stagingDecl);

  // 3. journal 子形狀(在 staging 字面量裡)
  const journalLit = grabLiteralAfter(stagingDecl, "journal: {", "v2 journal");
  scopes["v2.journal"] = topLevelKeys(journalLit);

  for (const [scope, keys] of Object.entries(scopes)) {
    if (!keys.length) throw new Error(`${scope} 抽不到任何鍵 —— 靜態抽取壞了,不能當成「沒有欄位」`);
    if (keys.includes("<spread>")) notes.push(`${scope} 含展開運算子(...):那一段是整包收下,鍵集合由上游決定`);
  }
  return { scopes, notes };
}

module.exports = { readV2StoreShapes, topLevelKeys, literalAt };

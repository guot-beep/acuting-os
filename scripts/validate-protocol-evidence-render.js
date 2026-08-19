#!/usr/bin/env node
/**
 * validate-protocol-evidence-render.js — 處方的證據等級有沒有真的到畫面上
 *
 * `acupoint_protocols` 只存 {name_zh, code},而 20 筆以下的清單在卡片上就是
 * 一排裸標籤。也就是說「某一個試驗的固定方案、certainty not_graded、指引說
 * 證據不足」與「這個病的標準處方」在畫面上長得一模一樣。
 *
 * B3 的 PTSD 是實例:13 個穴全部來自一個 combat-PTSD sham RCT,而 VA/DoD 2023
 * 明講 acupuncture 證據不足、不是一線治療。裸清單會把它讀成處方。
 *
 * `acupoint_protocol_evidence` 就是為了修這件事而加的。但這個專案反覆出現的
 * 退化型態正是:欄位加了、資料寫了、validator 全綠,而 renderer 根本沒讀它 ——
 * 於是又多一個暗欄位。檢查 JSON 抓不到那種問題。
 *
 * 所以這支把 js/knowledge.js 裡**真正在跑的** protocolEvidenceBlock 抽出來執行,
 * 斷言輸出裡真的有等級字樣。抽取失敗就 FAIL,不允許空跑通過。
 *
 * 用法:
 *   node scripts/validate-protocol-evidence-render.js
 *   node scripts/validate-protocol-evidence-render.js --self-test
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
const CANON = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");

function grabArrow(name) {
  const start = SRC.indexOf(`const ${name} = (`);
  if (start < 0) throw new Error(`js/knowledge.js 裡找不到 const ${name} —— 被改名或移除了,`
    + "這支測試必須跟著更新,不能默默跳過");
  let depth = 0, seen = false;
  for (let j = SRC.indexOf("{", start); j < SRC.length; j++) {
    if (SRC[j] === "{") { depth++; seen = true; }
    else if (SRC[j] === "}") { depth--; if (seen && depth === 0) return SRC.slice(start, j + 1) + ";"; }
  }
  throw new Error(`const ${name} 的括號沒有收斂`);
}

/* 用括號配對,不要用縮排猜結尾 —— 原本靠 "\n    };" 找,結果一路吃掉 59k 字元
   把別的函式也捲進來,vm 直接噴 Illegal return statement。 */
/* 物件常數與陣列常數都要能抽。開頭是 { 還是 [ 決定配對哪一種括號 ——
   原本寫死配 {},遇到 const SAFETY_LISTS = [...] 就抓不到收尾。 */
function grabConst(name) {
  const oIdx = SRC.indexOf(`const ${name} = {`);
  const aIdx = SRC.indexOf(`const ${name} = [`);
  const start = oIdx >= 0 ? oIdx : aIdx;
  if (start < 0) throw new Error(`js/knowledge.js 裡找不到 const ${name}`);
  const [open, close] = oIdx >= 0 ? ["{", "}"] : ["[", "]"];
  let depth = 0, seen = false;
  for (let j = SRC.indexOf(open, start); j < SRC.length; j++) {
    if (SRC[j] === open) { depth++; seen = true; }
    else if (SRC[j] === close) { depth--; if (seen && depth === 0) return SRC.slice(start, j + 1) + ";"; }
  }
  throw new Error(`const ${name} 的括號沒有收斂`);
}

function buildSandbox(contentMode) {
  const ctx = {
    contentMode,
    esc: (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (m) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])),
    usableText: (s) => (typeof s === "string" && s.trim() ? s.trim() : ""),
    modeText: (zh, en) => (contentMode === "english" ? en : zh),
  };
  vm.createContext(ctx);
  /* 兩段必須在**同一個** script 裡跑。vm 的 const 是該次 script 的語彙繫結,
     不會留到 context 上 —— 分兩次跑的話 protocolEvidenceBlock 看不見
     PROTOCOL_STATUS_LABEL,於是每張卡都回傳空字串,而且看起來像「資料沒接上」。 */
  vm.runInContext(
    grabConst("PROTOCOL_STATUS_LABEL") + "\n" + grabConst("SAFETY_LISTS") + "\n"
    + grabArrow("protocolEvidenceBlock")
    + "\nthis.__render = (card) => protocolEvidenceBlock(card);",
    ctx);
  return ctx;
}

function render(ctx, card) {
  return ctx.__render(card);
}

const fail = [];

function main() {
  const canon = JSON.parse(fs.readFileSync(CANON, "utf8"));
  const recs = canon.records;
  const withEv = recs.filter((r) => r.acupoint_protocol_evidence);

  if (!withEv.length) {
    fail.push("沒有任何卡帶 acupoint_protocol_evidence —— 這支測試失去對象,請確認是否被清空。");
    return { withEv: [] };
  }

  const ctx = buildSandbox("chinese");
  let rendered = 0, empty = [];
  for (const r of withEv) {
    const html = render(ctx, r);
    if (!html || !html.trim()) { empty.push(r.id); continue; }
    rendered++;
    const ev = r.acupoint_protocol_evidence;
    // 等級字樣必須真的出現
    if (!/證據支持|證據有限|僅症狀輔助|僅支持輔助既有治療|僅術後證據|現有證據不支持|查無合格來源|來源未經評估/.test(html)) {
      fail.push(`${r.id} 的輸出裡沒有任何等級字樣(status=${ev.protocol_status})`);
    }
    // 有穴位的卡,證據說明必須上畫面
    const pts = Array.isArray(r.acupoint_protocols) ? r.acupoint_protocols : [];
    if (pts.length && ev.evidence_note_zh && !html.includes(ctx.esc(ev.evidence_note_zh).slice(0, 24))) {
      fail.push(`${r.id} 有 ${pts.length} 個穴位,但 evidence_note_zh 沒有出現在輸出裡`);
    }
    // 有 scope 衝突就必須顯示
    if (ev.scope_conflict_note && !/衝突/.test(html)) {
      fail.push(`${r.id} 有 scope_conflict_note 但輸出沒有顯示衝突`);
    }
    /* 批次專屬安全清單:收集它們的唯一理由就是讓施術者看到。
       存進資料卻沒畫出來 = 又一個暗欄位,這正是本專案反覆踩的坑。 */
    for (const [field, zhLabel] of [
      ["sensory_loss_safety_zh", "感覺缺失"],
      ["local_needling_contraindications_zh", "患部局部施術禁忌"],
    ]) {
      const rows = Array.isArray(ev[field]) ? ev[field] : [];
      if (!rows.length) continue;
      if (!html.includes(ctx.esc(zhLabel).slice(0, 4))) {
        fail.push(`${r.id} 有 ${rows.length} 筆 ${field},但輸出沒有那個區塊的標題`);
        continue;
      }
      const first = typeof rows[0] === "string" ? rows[0] : (rows[0].text || "");
      if (first && !html.includes(ctx.esc(first).slice(0, 20))) {
        fail.push(`${r.id} 的 ${field} 有標題但內容沒上畫面`);
      }
    }
  }
  if (empty.length) fail.push(`這些卡帶了 evidence 卻渲染出空字串:${empty.join(", ")}`);

  // 英文模式也要能出東西
  const enCtx = buildSandbox("english");
  const sample = withEv[0];
  const enHtml = render(enCtx, sample);
  if (!/Supported|Limited evidence|Symptom relief only|Adjunct|Postoperative|Not supported|No qualifying source|Not assessed/.test(enHtml)) {
    fail.push(`英文模式下 ${sample.id} 的輸出沒有英文等級字樣`);
  }

  return { withEv, rendered };
}

function selfTest() {
  const ctx = buildSandbox("chinese");
  const cases = [
    { name: "沒有 evidence 就不輸出", ok: () => render(ctx, {}) === "" },
    { name: "status 不在字典裡就不輸出(不亂編標籤)",
      ok: () => render(ctx, { acupoint_protocol_evidence: { protocol_status: "made_up" } }) === "" },
    { name: "not_supported 會印出「現有證據不支持」",
      ok: () => /現有證據不支持/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "not_supported", sources: [] } })) },
    { name: "evidence_note_zh 會上畫面",
      ok: () => /檢索詞/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "no_source", evidence_note_zh: "檢索詞 X,未找到", sources: [] } })) },
    { name: "scope_conflict_note 會上畫面",
      ok: () => /衝突/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "limited", sources: [],
          scope_conflict_note: { existing_says: "舊說法", source_says: "新來源" } } })) },
    { name: "sensory_loss_safety_zh 會上畫面",
      ok: () => /燙傷風險/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "limited", sources: [],
          sensory_loss_safety_zh: [{ text: "感覺缺失足部的燙傷風險" }] } })) },
    { name: "local_needling_contraindications_zh 會上畫面",
      ok: () => /曲張靜脈/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "not_supported", sources: [],
          local_needling_contraindications_zh: [{ text: "不得直接針刺曲張靜脈" }] } })) },
    { name: "沒有安全清單就不畫空區塊",
      ok: () => !/患部局部施術禁忌/.test(render(ctx, { acupoint_protocol_evidence: { protocol_status: "limited", sources: [] } })) },
    { name: "抽取失敗會丟例外(不允許空跑)",
      ok: () => { try { grabArrow("thisFunctionDoesNotExist"); return false; } catch (e) { return /找不到/.test(e.message); } } },
  ];
  let bad = 0;
  for (const c of cases) {
    let ok = false;
    try { ok = c.ok() === true; } catch (e) { ok = false; }
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${c.name}`);
    if (!ok) bad++;
  }
  console.log(bad ? `\n負控失敗 ${bad} 項。` : "\n負控全過:每條檢查都證明過自己會失敗。");
  return bad === 0;
}

if (require.main === module) {
  if (process.argv.includes("--self-test")) process.exit(selfTest() ? 0 : 1);
  let res;
  try { res = main(); } catch (e) {
    console.log("  FAIL  " + e.message);
    console.log("\nvalidate-protocol-evidence-render: FAIL");
    process.exit(1);
  }
  console.log(`帶 acupoint_protocol_evidence 的卡:${res.withEv.length};渲染出內容:${res.rendered || 0}`);
  if (fail.length) {
    for (const f of fail) console.log("  FAIL  " + f);
    console.log(`\nvalidate-protocol-evidence-render: FAIL —— ${fail.length} 項。`);
    process.exit(1);
  }
  console.log("\nvalidate-protocol-evidence-render: PASS —— no blocking defects.");
}

/* AVS 建議庫驗證器(AVS v3 §12 Rule-library validation)
 *
 * 檢查 data/config/avs_advice_library.json:
 *   1. id 唯一、avs.* 前綴。
 *   2. category 在允許集合。
 *   3. active 記錄的 advice_zh 非空;advice_zh 內不得出現任何內部 id 前綴
 *      (pattern./cond./tdis./safety./modality./metric.)或 ICD/CPT 字樣
 *      ——「診斷選建議、輸出零診斷」的機器強制面。
 *   4. trigger namespace 合法且 id 可解析:patterns→pattern_registry、
 *      conditions→condition_canon_shortlist、modalities→modality_vocabulary、
 *      safety→引擎 canonical token 表。legacy triggers.safetyFlags 仍容許
 *      (引擎會別名正規化),但提示遷移。
 *   5. schema v3 治理欄位:version/trigger_mode/severity/evidence_type/
 *      review_status/active 齊備;evidence_type 在 §5 類別表內。
 *   6. review_status=deprecated ⇒ active:false(退役不硬刪,but 也不得再觸發)。
 *
 * 用法:node scripts/validate-avs-library.js
 */
"use strict";
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

require(path.join(root, "js", "avs.js"));
const AVS = globalThis.AcuTingAVS;

const lib = readJson("data/config/avs_advice_library.json");
const records = lib.records || [];

const patternIds = new Set((readJson("data/pathology/pattern_registry.json").records || []).map((r) => r.id));
const conditionIds = new Set((readJson("data/pathology/condition_canon_shortlist.json").records || []).map((r) => r.id));
const modalityIds = new Set((readJson("data/config/modality_vocabulary.json").records || []).map((r) => r.id));
const safetyTokens = new Set(AVS.SAFETY_CANONICAL_TOKENS);

const CATEGORIES = new Set(AVS.AVS_CATEGORIES);
const EVIDENCE_TYPES = new Set(["clinical_safety", "regulatory_or_guideline", "evidence_informed", "practice_standard", "traditional_tcm_lifestyle", "clinic_preference"]);

const failures = [];
const warnings = [];
const seen = new Set();

for (const r of records) {
  const label = r.id || "(no id)";
  if (!r.id || !/^avs\./.test(r.id)) failures.push(`${label}: id must start with "avs."`);
  if (seen.has(r.id)) failures.push(`${label}: duplicate id`);
  seen.add(r.id);
  if (!CATEGORIES.has(r.category)) failures.push(`${label}: category "${r.category}" not in ${[...CATEGORIES].join("/")}`);

  const text = String(r.advice_zh || "");
  if (r.active !== false && !text.trim()) failures.push(`${label}: active record with empty advice_zh`);
  // Codex NO-GO HIGH-3:與引擎共用同一把 canonical 尺(大小寫不敏感、
  // entity 解碼、icd/cpt 邊界比對)—— 不再各寫一份大小寫敏感的 includes。
  for (const b of AVS.findBannedTokens(text)) {
    failures.push(`${label}: advice_zh contains banned token "${b}" (patient text must be diagnosis-free)`);
  }

  const t = r.triggers || {};
  for (const p of t.patterns || []) {
    if (!/^pattern\./.test(p)) failures.push(`${label}: trigger "${p}" outside pattern.* namespace`);
    else if (!patternIds.has(p)) failures.push(`${label}: trigger pattern "${p}" not in pattern_registry`);
  }
  for (const c of t.conditions || []) {
    if (!/^cond\./.test(c)) failures.push(`${label}: trigger "${c}" outside cond.* namespace`);
    else if (!conditionIds.has(c)) failures.push(`${label}: trigger condition "${c}" not in condition canon`);
  }
  for (const m of t.modalities || []) {
    if (!modalityIds.has(m)) failures.push(`${label}: trigger modality "${m}" not in modality_vocabulary`);
  }
  for (const s of t.safety || []) {
    if (!safetyTokens.has(s)) failures.push(`${label}: trigger safety token "${s}" not in engine canonical token table`);
  }
  if ((t.safetyFlags || []).length) warnings.push(`${label}: legacy triggers.safetyFlags in use — migrate to canonical triggers.safety`);

  // schema v3 治理欄位(§5)
  if (lib.schema_version >= 3) {
    if (!Number.isInteger(r.version) || r.version < 1) failures.push(`${label}: version must be integer >= 1`);
    if (!["ANY", "ALL"].includes(String(r.trigger_mode || "").toUpperCase())) failures.push(`${label}: trigger_mode must be ANY|ALL`);
    if (!r.severity) failures.push(`${label}: severity missing`);
    if (!EVIDENCE_TYPES.has(r.evidence_type)) failures.push(`${label}: evidence_type "${r.evidence_type}" not in §5 class list`);
    if (!r.review_status) failures.push(`${label}: review_status missing`);
    if (typeof r.active !== "boolean") failures.push(`${label}: active must be boolean`);
    if (r.requires_clinician_confirmation !== true) failures.push(`${label}: requires_clinician_confirmation must be true (no auto-finalized advice, §2.3)`);
  }
  if (r.review_status === "deprecated" && r.active !== false) failures.push(`${label}: deprecated record must have active:false`);
}

// Codex NO-GO HIGH-3:clinic_profile.json 的病人可見欄位同尺掃描 —— 它逐字
// 進入每份 AVS 頁首/頁尾,之前完全沒人掃。
const clinic = readJson("data/config/clinic_profile.json");
for (const [key, value] of Object.entries(clinic)) {
  if (typeof value !== "string") continue;
  for (const b of AVS.findBannedTokens(value)) {
    failures.push(`clinic_profile.${key}: contains banned token "${b}" (renders verbatim into every patient AVS)`);
  }
}

const active = records.filter((r) => r.active !== false).length;
console.log(`avs_advice_library: ${records.length} records (${active} active, ${records.length - active} retired)`);
console.log(`  patterns resolvable against ${patternIds.size} registry ids; conditions against ${conditionIds.size}; modalities against ${modalityIds.size}; safety tokens ${safetyTokens.size}`);
for (const w of warnings) console.log(`  WARN ${w}`);
if (failures.length) {
  console.error(`FAIL — ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`PASS — 0 failures, ${warnings.length} warning(s)`);

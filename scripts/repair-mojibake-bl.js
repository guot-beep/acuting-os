#!/usr/bin/env node
/**
 * repair-mojibake-bl.js — one-off guarded repair for the 13 destroyed
 * clinical_pearls / danger fields on BL61–BL67 (legacy Windows-encoding
 * damage; original text is unrecoverable "?????" strings).
 *
 * Ting approved rewrite-as-draft on 2026-07-11. Guard: a field is replaced
 * ONLY if its current value is pure mojibake (no CJK, mostly "?"). Healthy
 * fields are never touched. Replacements are conservative model-draft study
 * notes, pending source review like all other draft content.
 *
 *   node scripts/repair-mojibake-bl.js          # dry run
 *   node scripts/repair-mojibake-bl.js --apply
 */

const fs = require("fs");
const path = require("path");
const DB_FILE = path.join(__dirname, "..", "data", "acupoints", "361.json");
const APPLY = process.argv.includes("--apply");

const REPAIRS = {
  BL61: {
    clinical_pearls: ["足跟痛、腰腿痛常用局部穴，常配崑崙（BL60）、太溪（KI3）。"],
    danger: ["跟骨外側淺層，無特殊深部危險；局部皮膚破損或感染時避開。"]
  },
  BL62: {
    clinical_pearls: ["八脈交會穴，通陽蹻脈；常配後溪（SI3）為八脈交會對穴，用於頸項強痛、腰背痛、癲癇（傳統以日間發作者為主）與失眠、目疾。"],
    danger: ["外踝下方淺層，無特殊深部危險；局部皮膚破損時避開。"]
  },
  BL63: {
    clinical_pearls: ["膀胱經郄穴，郄主急症：急性腰痛、足踝腫痛；傳統亦用於小兒驚風、癲癇。"],
    danger: ["足外側淺層，無特殊深部危險；局部皮膚破損時避開。"]
  },
  BL64: {
    clinical_pearls: ["膀胱經原穴；頭痛、項強、腰腿痛時可配束骨、崑崙使用。"]
  },
  BL65: {
    clinical_pearls: ["膀胱經輸木穴；「輸主體重節痛」，常用於頭項強痛、腰背痛、目赤。"],
    danger: ["第 5 蹠骨小頭後外側淺層，無特殊深部危險。"]
  },
  BL66: {
    clinical_pearls: ["膀胱經滎水穴；「滎主身熱」，用於頭痛、項強、目眩、鼻衄與熱病。"],
    danger: ["足小趾本節前外側淺層，無特殊深部危險。"]
  },
  BL67: {
    clinical_pearls: ["膀胱經井金穴；艾灸至陰矯正胎位是著名傳統應用（研究常以妊娠 28–37 週為範圍），屬專業臨床決策，不建議自行操作；亦用於頭痛、目痛、鼻塞、鼻衄。"],
    danger: ["孕期使用屬受訓醫者的臨床決策；自行針灸或施灸不建議。"]
  }
};

function isMojibake(value) {
  const s = Array.isArray(value) ? value.join(" ") : String(value || "");
  if (!s.trim()) return false;
  const noCjk = !/[一-鿿]/.test(s);
  const mostlyQ = (s.match(/\?/g) || []).length >= Math.max(3, s.replace(/[\s0-9A-Za-z./-]/g, "").length * 0.8);
  return noCjk && mostlyQ;
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const byCode = new Map(db.map((p) => [p.code, p]));
let replaced = 0, skipped = [];

for (const [code, fields] of Object.entries(REPAIRS)) {
  const rec = byCode.get(code);
  for (const [field, value] of Object.entries(fields)) {
    if (!isMojibake(rec[field])) { skipped.push(`${code}.${field} (not mojibake — untouched)`); continue; }
    if (APPLY) {
      rec[field] = value;
      rec.mojibake_repair = "rewritten_as_model_draft_2026-07-11";
    }
    replaced += 1;
    console.log(`${APPLY ? "repaired" : "would repair"} ${code}.${field}`);
  }
}
console.log(`\nTotal: ${replaced} fields. Skipped: ${skipped.length}`, skipped);
if (APPLY) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1)); console.log("Written."); }
else console.log("Dry run. Use --apply to write.");

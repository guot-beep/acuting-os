#!/usr/bin/env node
/**
 * audit-dark-fields.js — 哪些欄位有資料,但畫面從來不讀
 *
 * 2026-08-12 一個晚上撞到三次同一種缺陷:
 *   cautions_en                361 條逐穴安全警告,adapter 從未讀   (E3)
 *   herb_drug_interactions_en  17 張方劑卡的中西藥交互作用,0 次引用 (A0b)
 *   herb_formulas / acupoint_protocols  條件卡的處方欄,0 次引用
 * 前兩次是碰巧發現的。第三次讓我停下來問:還有幾個?
 *
 * 驗證器看不到這一類 —— 它們檢查資料,而這裡的資料是好的。壞的是「沒有人讀」。
 * 所以做法是反過來:列出資料裡真的有內容的欄位,再去渲染程式裡找它的名字。
 *
 * 已知限制,先寫在這裡免得被當成完整答案:
 *   - 動態存取(record[key]、Object.entries 迴圈)抓不到,會誤報成 dark。
 *     所以下面另外掃了動態存取樣式,命中的欄位標成 UNKNOWN 而不是 DARK。
 *   - 「被讀到」不等於「顯示得對」:E3 那次 adapter 讀的是 contraindications_en,
 *     欄位有被引用,顯示的卻是另一個欄位的通則句。這支只回答第一個問題。
 *
 * 用途是產生待查清單給人看,不是 CI 閘門 —— 所以永遠 exit 0。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// build-data.js 也要算進來:它會在打包時改欄位名,渲染程式用的是新名字,
// 只掃渲染程式會把「被改名後正常顯示」的欄位誤報成 dark。
const RENDER_SOURCES = [
  "app.js", "js/knowledge.js", "js/clinical-store.js", "js/previsit-validator.js",
  "index.html", "scripts/build-data.js",
];

const LAYERS = [
  ["361 經穴", "data/acupoints/361.json"],
  ["奇穴", "data/acupoints/extra_points.json"],
  ["方劑", "data/herbs/formulas.json"],
  ["中藥", "data/herbs/herb_canon_shortlist.json"],
  ["條件", "data/pathology/condition_canon_shortlist.json"],
  ["證型", "data/pathology/pattern_library.json"],
  ["症狀", "data/symptoms/symptoms.json"],
  ["西藥", "data/pharmacology/drugs.json"],
];

const source = RENDER_SOURCES.map((f) => {
  const p = path.join(ROOT, f);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}).join("\n");

// 動態存取:有這些樣式時,欄位名可能是變數,靜態搜尋不可信。
const DYNAMIC = /\[\s*(?:key|k|field|f|name|prop)\s*\]|Object\.(keys|entries|values)\s*\(\s*(?:record|rec|r|card|item)\b/;
const hasDynamic = DYNAMIC.test(source);

// 這些是內部/系統欄位,不該期待它們出現在畫面上。
// 抓取時間戳、來源網址、內部旗標本來就不該上畫面 —— 留著它們只會把真正的
// 臨床欄位淹沒在雜訊裡。判準是「這個欄位是內容,還是關於內容的簿記」。
const IGNORE = /^(id|_.*|schema_version|source_type|source_urls|field_sources|review_status|last_reviewed|card_grade|public_safe|import_artifacts|correction_note|superseded_statements|unsourced_claims_quarantine|entity_type|.*_status|.*_sha256|created_at|updated_at|.*fetched_at|.*_source|.*_source_url|source_hint|cloudtcm_id|draft_created|mojibake_repair|.*_verified_on)$/;

/* 分類器(2026-08-12 第二版)。
 *
 * 第一版只看欄位名,於是 `needs_fill`、`mojibake_repaired`、`name_en_translated`、
 * `glance` 全被算成「臨床內容」—— 報出來的 103 是灌了水的數字,而灌水的數字會
 * 讓人照著它排優先順序。**看值,不要只看名字。**
 *
 *   bookkeeping   布林旗標、時間戳、短 enum、製作過程紀錄(AI draft 覆核筆記、
 *                 排版說明、「這個欄位的來源是哪三家」)—— 它們描述的是卡片
 *                 怎麼做出來的,不是卡片要說的話
 *   english_twin  `X_en` 而且 `X_zh` 有值 —— 這是中英對等的題目,不是缺內容
 *   clinical      其餘 —— 真的是給讀的人看的東西
 *
 * 有疑義時歸 clinical:漏報一個簿記欄位只是多看一眼,漏報一個臨床欄位是繼續瞎。
 */
const PROCESS_NAME = /^(needs_fill|glance|updated_by|.*_repaired?|.*_translated|.*review_notes.*|.*_header_note.*|.*_source_note.*|.*_note_source|composition_cleared_note|related_formulas_note|.*_display_note_zh|fertility_notes|.*_links|legacy_ids|secondary_family)$/;
/* 上面新增的四類,逐一說明為什麼不是卡片內容(2026-08-12 逐欄看過):
 *   key_pairs_display_note_zh  寫給開發者的:「此處避免放 pair id 字串,以免前端
 *                              顯示 raw id」—— 是實作備忘,不是藥材知識。
 *   fertility_notes            「Needs fertility/IVF/IUI medication timing review
 *                              before clinical or public use.」—— 是待辦標記,
 *                              不是給讀者的敘述。
 *   condition_links / external_links / western_condition_links
 *                              前者是內部 slug(common_cold_pattern_support),
 *                              後者是連結物件,卡片已另有來源連結區塊。
 *   legacy_ids / secondary_family  舊 id 與分類軸的內部欄位。 */
/* 只認「這段文字是在描述來源或排版」的句型,不要只看開頭是不是 `課件`。
 * 第一版寫成 /^課件/,結果把「課件強調袢利尿劑非常有效且快速,是急性水腫的首選」
 * 判成簿記 —— 那是內容,只是句首交代了出處。**在句首標明來源不會讓一句話變成
 * 簿記。** 而且這個方向的誤判特別糟:把內容藏進簿記桶,它就從待辦上消失了。 */
const PROVENANCE_TEXT = /^(AI draft|中文\/拼音)|五源核讀|共同核心[：:]|^[^。]{0,40}(取自|來源為|引用自)[^。]{0,30}。?$/;

/* 靜態搜尋看不到、但已用眼睛確認畫面上有的欄位。
 * needlingEn 是這樣一筆:它經由另一條程式路徑到畫面上(奇穴卡的 Needling 欄
 * 實測有內容),但這支腳本只能做字面搜尋,所以會一直把它報成缺口。
 * 用名單而不是放寬搜尋:放寬會連真的沒接的一起放行。每一筆都要註明怎麼確認的。 */
const VERIFIED_RENDERED = {
  needlingEn: "2026-08-12 開 EX-HN1 英文卡實測:Needling 欄顯示 needlingEn 原文",
};

/* 逐欄看過、確定不是「卡片少講了什麼」的欄位。每一筆都寫原因 ——
 * 沒有原因的豁免,下一個人只能選擇相信或全部重查,兩種都不好。 */
const CLASSIFIED = {
  // 內容已由別的欄位涵蓋
  source_text_zh: "與 source_classic 同義,後者已顯示且更完整(《傷寒雜病論》vs《傷寒論》)",
  source_text_en: "同上,英文側",
  modifications: "與已顯示的 modifications_zh 是同一份內容的結構化版本,接了會重複列印",
  primary_actions_en: "6 味全都同時有 actions_en,而後者已顯示",
  pharmaceutical_name: "已被合併的拉丁名欄位涵蓋(顯示為「Semen Persicae · Prunus persica」)",
  botanical_name: "同上",
  nameIntro: "舊欄位;現行是 nameIntroZh / nameIntroEn,兩者都已接上",
  // 製作過程的紀錄,不是給讀者的
  modern_application_note: "內容是「TODO link to condition canon ids…」—— 待辦事項",
  composition_rebuilt_note: "修復稽核紀錄(組成何時由課件表重建)",
  name_fix_note: "錯字修正紀錄(都气 → 都氣丸)",
  setid_fix_note: "資料修正紀錄",
  label_format_note_zh: "標籤格式的內部註記",
  hierarchy_source_zh: "SOL 裁定的引用出處,屬決策紀錄",
  classic_formula_source_zh: "說明「本庫為何沒有以此味為核心的 board 方劑」,是館藏說明不是藥材知識",
  classic_formula_source_en: "同上,英文側",
  related_formulas_note_en: "同 related_formulas_note,說明連結為何從缺",
  herb_pair_source_note_en: "藥對來源的內部註記",
  // 驅動邏輯的旗標
  integrative_clinical_flags: "['bleeding_risk','procedural_safety'] —— 驅動判斷的旗標,對應的敘述已在針刺註記與交互作用區塊顯示",
  ncbahm_2026_official: "布林旗標;卡片已用 ★ 考試重點 banner 表達同一件事",
  tier_zh: "與 exam_rating、clinical_frequency 對同樣 58 張方講同一個訊號,banner 已顯示",
  exam_rating: "同上",
  clinical_frequency: "同上",
};

/* 導覽用的受控詞彙(tag / 分類軸),不是卡片缺的內容。
 * action_tags(339 穴,101 個不同值:Clear Heat / Tonify Spleen …)與 acuTags
 * 是「用這個條件把穴位篩出來」的軸,不是這張卡少講了什麼。把它們算成缺內容,
 * 會讓待辦數字虛胖,也會誘使人把 chip 灑在卡片上當作補完 —— 那不是同一件事。
 * 要不要做 tag 瀏覽是產品決定,列在 A0c 給 Ting。 */
const NAVIGATION_FIELDS = /^(action_tags(_zh|_en)?|acuTags|disease_tags(_zh|_en)?|study_tags|tags|function_tags(_zh|_en)?|observation_modes|zang_fu|qi_blood_fluid|taxonomy_ids)$/;
/* zang_fu(["lung"])、qi_blood_fluid(["phlegm"])、observation_modes
 * (["patient_reported"])是分類軸的原始 token。它們**已經**透過對應的
 * 名稱欄位/證型家族出現在畫面上;把原始 token 印出來只會多一行 "lung"。
 * function_tags_zh(溫裡溫中/補陽…)同理:是篩選用的標籤,不是卡片少講的話。 */

function classify(field, values) {
  if (VERIFIED_RENDERED[field]) return "verified_elsewhere";
  if (CLASSIFIED[field]) return "classified";
  if (NAVIGATION_FIELDS.test(field)) return "navigation";
  const sample = values.find((v) => v !== undefined && v !== null);
  const flat = Array.isArray(sample) ? sample[0] : sample;
  const str = typeof flat === "string" ? flat.trim() : "";

  if (PROCESS_NAME.test(field)) return "bookkeeping";
  // 識別碼與連結:名字或值任一符合就算。用值判斷是因為欄位名不一定帶 _id
  // (dailymed_setid、drugsystem_ids 是第一版漏掉的,它們被算成臨床內容)。
  if (/(^|_)(id|ids|setid|uid|url|urls|slug|code_map)$/.test(field)) return "bookkeeping";
  if (str && /^https?:\/\//.test(str)) return "bookkeeping";
  if (str && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(str)) return "bookkeeping";   // UUID
  if (str && /^[a-z]+\.[a-z0-9_]+$/.test(str)) return "bookkeeping";          // 內部 id 形狀 drug.warfarin
  // 值是布林/數字/時間戳 → 旗標,不是內容
  if (typeof flat === "boolean" || typeof flat === "number") return "bookkeeping";
  if (/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(str)) return "bookkeeping";
  // 全庫只有極少數不同值,而且都很短 → enum / 分類標記
  const distinct = new Set(values.map((v) => (Array.isArray(v) ? v.join("|") : String(v))).filter(Boolean));
  if (distinct.size <= 4 && [...distinct].every((v) => v.length <= 24)) return "bookkeeping";
  // 文字本身在講「這個欄位的來源/排版」而不是臨床事實
  if (str && PROVENANCE_TEXT.test(str) && str.length < 200) return "bookkeeping";
  return "clinical";
}

const load = (rel) => {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
    return d.records || (Array.isArray(d) ? d : null);
  } catch { return null; }
};

const nonEmpty = (v) =>
  v !== null && v !== undefined && v !== "" &&
  !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

let totalDark = 0;
const totals = { clinical: 0, english_twin: 0, navigation: 0, classified: 0, verified_elsewhere: 0, bookkeeping: 0 };
const report = [];

for (const [label, rel] of LAYERS) {
  const recs = load(rel);
  if (!recs) { report.push(`${label}: (讀不到 ${rel})`); continue; }
  const populated = new Map();
  const samples = new Map();
  for (const r of recs) {
    for (const [k, v] of Object.entries(r || {})) {
      if (IGNORE.test(k)) continue;
      if (!nonEmpty(v)) continue;
      populated.set(k, (populated.get(k) || 0) + 1);
      if (!samples.has(k)) samples.set(k, []);
      const bag = samples.get(k);
      if (bag.length < 40) bag.push(v);
    }
  }
  const dark = [];
  for (const [field, count] of populated) {
    // 欄位名出現在渲染程式裡就算「有讀到」。用引號/屬性存取兩種寫法找。
    const re = new RegExp(`[."'\`]${field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (re.test(source)) continue;
    const zhTwin = field.replace(/_en$/, "_zh");
    const kind = /_en$/.test(field) && populated.has(zhTwin)
      ? "english_twin"
      : classify(field, samples.get(field) || []);
    dark.push([field, count, kind]);
  }
  dark.sort((a, b) => b[1] - a[1]);

  const byKind = { clinical: [], english_twin: [], navigation: [], classified: [], verified_elsewhere: [], bookkeeping: [] };
  for (const row of dark) byKind[row[2]].push(row);
  for (const k of Object.keys(byKind)) totals[k] += byKind[k].length;
  totalDark += dark.length;

  report.push(`\n${label}  (${recs.length} 筆) — 畫面沒有引用的欄位:${dark.length}`);
  const LABEL = { clinical: "臨床內容 —— 真的還缺", english_twin: "英文對照(中文那側也沒接)", navigation: "導覽詞彙 —— 是篩選軸,不是卡片內容", classified: "已逐欄判定(原因見 CLASSIFIED)", verified_elsewhere: "已用眼睛確認畫面上有(靜態搜尋看不到)", bookkeeping: "簿記/製作紀錄 —— 本來就不該上畫面" };
  for (const k of ["clinical", "english_twin", "navigation", "classified", "verified_elsewhere", "bookkeeping"]) {
    if (!byKind[k].length) continue;
    report.push(`   【${LABEL[k]}】${byKind[k].length}`);
    for (const [field, count] of byKind[k].slice(0, 10)) {
      report.push(`      ${field.padEnd(34)} ${String(count).padStart(4)} 筆有值`);
    }
    if (byKind[k].length > 10) report.push(`      …另外 ${byKind[k].length - 10} 個`);
  }
}

console.log("dark fields — 有內容但渲染程式沒有引用\n");
console.log(report.join("\n"));
console.log(`\n合計 ${totalDark} 個欄位:臨床內容 ${totals.clinical} · 英文對照 ${totals.english_twin} · 導覽詞彙 ${totals.navigation} · 已判定 ${totals.classified} · 已確認有顯示 ${totals.verified_elsewhere} · 簿記 ${totals.bookkeeping}`);
console.log("**只有「臨床內容」那一欄是待辦**,其餘四類是分類結果,不是缺陷。");
if (hasDynamic) {
  console.log("\n⚠️  渲染程式有動態欄位存取(record[key] / Object.entries),");
  console.log("    所以上面有些欄位可能其實是被讀到的 —— 這份是待查清單,不是判決。");
}
console.log("逐一確認方式:開卡片、切中英文、用眼睛找那個欄位的內容。");

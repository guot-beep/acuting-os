#!/usr/bin/env node
/**
 * report-acupoint-contradictions.js — 穴位「卡內自相矛盾」探針（唯讀）
 *
 * 為什麼有這支腳本：
 *   2026-08-19 的全系統檢測發現三個真實錯誤，而 validate-acupoint-standard /
 *   validate-content-junk / check-validation-ratchet 全部 PASS 沒抓到：
 *     · BL1 clinical_pearls 說「為手太陽小腸經的經穴」，同卡 channel_zh = 膀胱經
 *     · CV8 contraindications 的禁針警語裡把「神闕」打成「神願」
 *     · BL1 needling 把「向外側固定」打成「想外側固定」
 *   這一類缺陷驗證器抓不到（格式全合法），只有讀得懂中醫的眼睛抓得到。
 *   這支腳本負責把 361 穴縮到一份「候選清單」，讓人（或代理）只需逐條裁決真偽。
 *
 * 它不做什麼：不判斷對錯、不改任何檔案。輸出是候選，不是結論。
 *   誤報是預期內的 —— 六個探針都寧可多報也不漏報，裁決由人做。
 *
 * 用法：
 *   node scripts/report-acupoint-contradictions.js            # 人讀的工單
 *   node scripts/report-acupoint-contradictions.js --json     # 機器可讀
 *   node scripts/report-acupoint-contradictions.js --seed <path>
 *       # 產出 staging 骨架（verdict 留空，mirror_paths 已解析），給裁決者填
 *
 * 探針（每一條都可獨立關閉：--only=A,C）：
 *   A channel_self_assertion   歸屬動詞把本穴綁到 channel_zh 以外的經
 *   B forbidden_needle_depth   同卡既標絕對禁針、又給了可執行刺深
 *   C cun_disagreement         旁開寸數在 location_zh 與敘述欄互相打架
 *   D raw_html_entity          內容裡殘留 &mdash; 之類的原始 HTML 實體
 *   E homophone_in_procedure   針法敘述裡的同音錯字（想/向）
 *   F point_name_near_miss     文中的「XX穴」與本穴名差一字，且不是任何已知穴名
 *   G placeholder_depth        刺深是 0.0 寸這種不可能的數字（樣板產生的假數字）
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "data/acupoints/361.json");

// ---------------------------------------------------------------- helpers

/** 名稱欄用 中衝／崑崙／後谿，散文用 中沖／昆侖／後溪 —— 比對前先折疊字形。 */
const FOLD = {
  "衝": "沖", "崑": "昆", "崙": "侖", "谿": "溪", "兪": "俞",
  "裏": "里", "臺": "台", "湧": "涌", "髎": "髎", "谷": "谷",
};
const fold = (s) => String(s).replace(/[衝崑崙谿兪裏臺湧]/g, (c) => FOLD[c] || c);

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/** 逐欄走訪，回傳 [欄位路徑, 字串] —— 路徑要能貼進裁決單當證據定位。 */
function walk(v, base, out = []) {
  if (typeof v === "string") out.push([base, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${base}[${i}]`, out));
  else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) walk(x, `${base}.${k}`, out);
  }
  return out;
}

function editDistance(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// ---------------------------------------------------------------- corpus

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const recs = Array.isArray(raw) ? raw : (raw.points || raw.records);

/** 奇穴名也要算「已知穴名」，否則 Type F 會把 膝眼 之類當成錯字。 */
const EXTRA_SRC = path.join(ROOT, "data/acupoints/extra_points.json");
let extraRecs = [];
try {
  const ex = JSON.parse(fs.readFileSync(EXTRA_SRC, "utf8"));
  extraRecs = Array.isArray(ex) ? ex : (ex.points || ex.records || []);
} catch { /* 奇穴檔不在也不影響主探針 */ }

/** 折疊後的名稱 → 它可能指涉的 code 集合（含別名）。 */
const NAME_CODES = new Map();
const addName = (name, code) => {
  const k = fold(String(name).replace(/穴$/, "").trim());
  if (k.length < 2) return;
  if (!NAME_CODES.has(k)) NAME_CODES.set(k, new Set());
  NAME_CODES.get(k).add(code);
};
for (const r of [...recs, ...extraRecs]) {
  if (r.chinese) addName(r.chinese, r.code);
  if (r.name_zh) addName(r.name_zh, r.code);
  if (r.nameZh) addName(r.nameZh, r.code);   // 奇穴檔用 camelCase
  for (const alt of strings(r.other_names_zh)) {
    for (const piece of alt.split(/[、,，/／\s]+/)) addName(piece, r.code);
  }
}
const ALL_NAMES = [...NAME_CODES.keys()];

const CHANNEL_FULL = {
  "手太陰肺經": "肺經", "手陽明大腸經": "大腸經", "足陽明胃經": "胃經",
  "足太陰脾經": "脾經", "手少陰心經": "心經", "手太陽小腸經": "小腸經",
  "足太陽膀胱經": "膀胱經", "足少陰腎經": "腎經", "手厥陰心包經": "心包經",
  "手少陽三焦經": "三焦經", "足少陽膽經": "膽經", "足厥陰肝經": "肝經",
};
const CHANNEL_NAMES = Object.keys(CHANNEL_FULL).sort((a, b) => b.length - a.length);

/** 敘述型欄位（location/needling 之外的散文），Type A 只掃這些。 */
const isProse = (f) => /_zh$|pearls|intro|identity|combine|anatomy|research/.test(f);

// ---------------------------------------------------------------- probes

const findings = [];
const add = (o) => findings.push(o);

// --- A: 歸屬動詞把本穴綁到別的經 -----------------------------------------
const ATTRIB = "(?:屬於|屬|歸屬於|歸於|係|為|是)";
function probeA(r) {
  const own = fold(r.chinese || "");
  const chan = String(r.channel_zh || "").trim();
  if (!own || !chan) return;
  const seen = new Set();
  for (const [fpath, s] of walk(r, "$")) {
    const field = fpath.split(".")[1] || "";
    if (!isProse(field)) continue;
    for (const rawSent of s.split(/[。\n；;]/)) {
      const sent = fold(rawSent);
      if (!sent.includes(own)) continue;
      for (const fu of CHANNEL_NAMES) {
        const m = sent.match(new RegExp(ATTRIB + "\\s*" + fu));
        if (!m) continue;
        if (CHANNEL_FULL[fu] === chan) continue; // 一致，不是矛盾
        const vi = sent.indexOf(m[0]);
        const oi = sent.indexOf(own);
        if (oi < 0 || oi > vi) continue; // 本穴名必須在歸屬動詞之前
        // 歸屬動詞前「最近的一個穴名」必須指得到本穴，否則這句在講別的穴（配穴句）
        const before = sent.slice(0, vi);
        let nearest = null, at = -1;
        for (const n of ALL_NAMES) {
          const i = before.lastIndexOf(n);
          if (i > at || (i === at && nearest && n.length > nearest.length)) { at = i; nearest = n; }
        }
        if (!nearest || !NAME_CODES.get(nearest).has(r.code)) continue;
        const key = field + "|" + fu;
        if (seen.has(key)) continue;
        seen.add(key);
        add({
          type: "A", label: "channel_self_assertion",
          code: r.code, chinese: r.chinese, field, json_path: fpath,
          excerpt: rawSent.trim(),
          conflict: `卡上 channel_zh = ${chan}，但這句說「${m[0]}」`,
        });
      }
    }
  }
}

// --- B: 絕對禁針 + 可執行刺深 --------------------------------------------
const ABS_FORBID = /(?:本穴)?禁針|禁刺|嚴禁針刺|不可針/;
/** 條件式禁針（小兒／過飽／感染時…）與刺深並存是合理的，只有無條件禁針才是矛盾。 */
const CONDITIONAL = /者|時|未閉|孕婦|妊娠|小兒|嬰幼兒|過飽|大者|感染|積液|慎/;
const DEPTH = /(?:直刺|斜刺|平刺|橫刺)\s*[\d.．]+\s*[~～\-—]?\s*[\d.．]*\s*寸/g;
function probeB(r) {
  const blob = strings(r).join("\n");
  if (!ABS_FORBID.test(blob)) return;
  const depths = new Set();
  for (const [fpath, s] of walk(r, "$")) {
    const field = fpath.split(".")[1] || "";
    if (!/needling|acumethod|contraindication|caution|danger/.test(field)) continue;
    for (const d of s.match(DEPTH) || []) depths.add(JSON.stringify([fpath, d]));
  }
  if (!depths.size) return;
  // 只在同一筆記錄裡「絕對禁針」語句不是孕婦條件式時才報
  const absSent = strings(r).flatMap((s) => s.split(/[。\n]/))
    .filter((x) => ABS_FORBID.test(x) && !CONDITIONAL.test(x));
  if (!absSent.length) return;
  for (const d of depths) {
    const [fpath, text] = JSON.parse(d);
    add({
      type: "B", label: "forbidden_needle_depth",
      code: r.code, chinese: r.chinese, field: fpath.split(".")[1] || "",
      json_path: fpath, excerpt: text,
      conflict: `同卡標絕對禁針（「${absSent[0].trim().slice(0, 30)}」）卻仍給了刺深`,
    });
  }
}

// --- C: 旁開寸數互相打架 --------------------------------------------------
const CUN = /旁開\s*([\d.．]+)\s*寸/g;
function probeC(r) {
  const byField = new Map();
  const textOf = new Map();
  for (const [fpath, s] of walk(r, "$")) {
    const vals = new Set();
    for (const m of s.matchAll(CUN)) vals.add(m[1].replace("．", "."));
    if (vals.size) { byField.set(fpath, [...vals]); textOf.set(fpath, s); }
  }
  const anchor = [...byField.entries()].find(([p]) => /location_zh|cun_measurement/.test(p));
  if (!anchor) return;
  const anchorVals = new Set(anchor[1]);
  for (const [fpath, vals] of byField) {
    if (fpath === anchor[0]) continue;
    const diff = vals.filter((v) => !anchorVals.has(v));
    if (!diff.length) continue;
    // excerpt 必須是原檔逐字存在的一句 —— 合成的摘要既不可回驗，也不能拿來做取代。
    const whole = textOf.get(fpath) || "";
    const sentence = whole.split(/[。\n]/).find((x) => new RegExp("旁開\\s*" + diff[0].replace(".", "\\.") + "\\s*寸").test(x));
    add({
      type: "C", label: "cun_disagreement",
      code: r.code, chinese: r.chinese, field: fpath.split(".")[1] || "",
      json_path: fpath, excerpt: (sentence !== undefined ? sentence : whole),
      conflict: `本句寫旁開 ${diff.join("/")} 寸，但 ${anchor[0]} 說旁開 ${[...anchorVals].join("/")} 寸`,
    });
  }
}

// --- D: 殘留 HTML 實體 ----------------------------------------------------
const ENTITY = /&(?:mdash|ndash|nbsp|amp|lt|gt|quot|#\d+);/g;
function probeD(r) {
  for (const [fpath, s] of walk(r, "$")) {
    const hits = s.match(ENTITY);
    if (!hits) continue;
    add({
      type: "D", label: "raw_html_entity",
      code: r.code, chinese: r.chinese, field: fpath.split(".")[1] || "",
      json_path: fpath, excerpt: s.trim().slice(0, 80),
      conflict: `殘留原始 HTML 實體：${[...new Set(hits)].join(" ")}`,
    });
  }
}

// --- E: 針法敘述裡的同音錯字 ---------------------------------------------
/** 「想」出現在方位動詞位置（推/固定/進針 等的語境），幾乎必然是「向」之誤。 */
const HOMOPHONE = [{ wrong: "想", right: "向", ctx: /[推壓拉固定進退刺]\s*.{0,3}想[外內上下左右前後]/ }];
function probeE(r) {
  for (const [fpath, s] of walk(r, "$")) {
    const field = fpath.split(".")[1] || "";
    if (!/needling|acumethod|caution|contraindication|moxa|massage/.test(field)) continue;
    for (const h of HOMOPHONE) {
      if (!h.ctx.test(s)) continue;
      add({
        type: "E", label: "homophone_in_procedure",
        code: r.code, chinese: r.chinese, field, json_path: fpath,
        excerpt: s.trim().slice(0, 80),
        conflict: `針法敘述疑似同音錯字「${h.wrong}」應為「${h.right}」`,
      });
    }
  }
}

// --- F: 文中「XX穴」與本穴名差一字且不是任何已知穴名 ----------------------
/** 「穴位」是名詞（照射穴位），「穴位於」是「穴 + 位於」（神願穴位於臍中）—— 只擋前者。 */
const NAMED = /([一-鿿]{2,4})穴(?!位(?!於|在))/g;
/**
 * 類別詞（五輸穴／交會穴／八髎穴／腹部穴…）不是穴名，只是剛好長得像。
 * 這些會與本穴名差一字純屬巧合，不是錯字。
 */
const CATEGORY_TERM = /^(?:五輸|交會|八髎|八會|下合|背俞|經外奇|阿是|局部|遠端|鄰近|同名|對側|患側|健側|該|此|本|各|諸|多個|一個|兩個|三個|其他|相關|上述|以下|以上|周圍|附近|腹部|背部|頭部|face|頸部|胸部|腰部|下肢|上肢|督脈|任脈|奇經|正經)$/;
function probeF(r) {
  const own = fold(r.chinese || "");
  if (own.length < 2) return;
  const seen = new Set();
  for (const [fpath, s] of walk(r, "$")) {
    for (const m of fold(s).matchAll(NAMED)) {
      const tok = m[1];
      if (NAME_CODES.has(tok)) continue;          // 是已知穴名（或別名），不是錯字
      if (CATEGORY_TERM.test(tok)) continue;      // 是類別詞，不是穴名
      if (/本$/.test(tok)) continue;              // 「至本穴」= 至 + 本穴（自指），不是穴名
      if (tok === own) continue;
      if (tok.length !== own.length) continue;
      if (editDistance(tok, own) !== 1) continue; // 只差一字 → 幾乎必然是本穴的錯字
      if (seen.has(tok)) continue;
      seen.add(tok);
      add({
        type: "F", label: "point_name_near_miss",
        code: r.code, chinese: r.chinese, field: fpath.split(".")[1] || "",
        json_path: fpath, excerpt: s.trim().slice(0, 80),
        conflict: `文中「${tok}穴」與本穴名「${r.chinese}」只差一字，且不是任何已知穴名`,
      });
    }
  }
}

// --- G: 不可能的刺深（樣板產生的假數字） ---------------------------------
/**
 * 「直刺0.0寸」不是保守，是假數字 —— 樣板填欄位時生出來的。
 * 憲法紅線 4：劑量、刺深絕不虛構數字。0 寸既不能執行，也不是任何來源會寫的值。
 */
const ZERO_DEPTH = /(?:直刺|斜刺|平刺|橫刺)\s*0+(?:[.．]0+)?\s*寸/g;
function probeG(r) {
  for (const [fpath, s] of walk(r, "$")) {
    for (const hit of s.match(ZERO_DEPTH) || []) {
      add({
        type: "G", label: "placeholder_depth",
        code: r.code, chinese: r.chinese, field: fpath.split(".")[1] || "",
        json_path: fpath, excerpt: hit,
        conflict: "刺深 0 寸是樣板產生的假數字，不是可執行的值（憲法紅線 4）",
      });
    }
  }
}

// ---------------------------------------------------------------- run

const args = process.argv.slice(2);
const onlyArg = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const ONLY = onlyArg ? new Set(onlyArg.split(",").map((x) => x.trim().toUpperCase())) : null;
const want = (t) => !ONLY || ONLY.has(t);

for (const r of recs) {
  if (want("A")) probeA(r);
  if (want("B")) probeB(r);
  if (want("C")) probeC(r);
  if (want("D")) probeD(r);
  if (want("E")) probeE(r);
  if (want("F")) probeF(r);
  if (want("G")) probeG(r);
}

// ---------------------------------------------------------------- mirrors

/**
 * 同一段文字常常同時存在於兩條資料線（361.json 與 embedded/），欄位名還不一樣。
 * 只修一邊，驗證器照樣全綠 —— 所以裁決單必須帶著「這段話還住在哪裡」。
 * data/generated/** 不列入：那是 build-data.js 重建的，不是要手改的地方。
 */
const MIRROR_DIRS = [
  "data/acupoints",
  "data/channels",
  "data/imports/cloudtcm/points",
  "data/imports/cloudtcm",
];
let MIRROR_FILES = null;
function mirrorFiles() {
  if (MIRROR_FILES) return MIRROR_FILES;
  MIRROR_FILES = [];
  for (const d of MIRROR_DIRS) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      const p = path.join(abs, f);
      if (fs.statSync(p).isDirectory()) {
        if (d.endsWith("acupoints") && f === "embedded") {
          for (const g of fs.readdirSync(p)) {
            if (g.endsWith(".json")) MIRROR_FILES.push(path.join(p, g));
          }
        }
        continue;
      }
      if (f.endsWith(".json")) MIRROR_FILES.push(p);
    }
  }
  return MIRROR_FILES;
}
function findMirrors(excerpt) {
  const needle = excerpt.trim();
  if (needle.length < 8) return [];
  const out = [];
  for (const f of mirrorFiles()) {
    let text;
    try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
    if (text.includes(needle)) out.push(path.relative(ROOT, f));
  }
  return out;
}

// ---------------------------------------------------------------- output

const seedIdx = args.indexOf("--seed");
const codes = [...new Set(findings.map((f) => f.code))];

if (args.includes("--json")) {
  console.log(JSON.stringify({ source: "data/acupoints/361.json", records: recs.length, findings }, null, 2));
} else if (seedIdx >= 0) {
  const out = args[seedIdx + 1];
  if (!out) { console.error("--seed 需要一個輸出路徑"); process.exit(2); }
  const seed = {
    dataset: "acupoint_intra_card_contradictions",
    policy: "staging only; no canonical write; Claude applies after Ting approval",
    canonical_write_allowed: false,
    generated_by: "scripts/report-acupoint-contradictions.js",
    source_of_truth: "data/acupoints/361.json",
    field_definitions: {
      verdict: "real | false_positive —— 二選一，不准寫「可能」",
      current_excerpt: "今天真的存在於 361.json 的逐字原文",
      proposed_excerpt: "同一段，最小改動；字數不得少於 current_excerpt（憲法紅線 3）",
      mirror_paths: "同一段文字還住在哪些檔案 —— 只修一邊會留下另一邊的同一個錯",
    },
    records: findings.map((f, i) => ({
      id: `contra.${f.code}.${f.type}${i}.${String(f.field).replace(/\[(\d+)\]/g, "_$1")}`,
      code: f.code, chinese: f.chinese,
      contradiction_type: f.label,
      json_path: f.json_path, field: f.field,
      machine_note: f.conflict,
      current_excerpt: f.excerpt,
      mirror_paths: findMirrors(f.excerpt),
      verdict: "", proposed_excerpt: "", confidence: "", notes: "",
    })),
  };
  fs.writeFileSync(out, JSON.stringify(seed, null, 2) + "\n");
  console.log(`seed written: ${out} (${seed.records.length} candidates across ${codes.length} points)`);
} else {
  const byType = {};
  for (const f of findings) (byType[f.type] = byType[f.type] || []).push(f);
  const LABEL = {
    A: "經絡自述與 channel_zh 不符", B: "標禁針卻仍有刺深",
    C: "旁開寸數互相打架", D: "殘留 HTML 實體",
    E: "針法同音錯字", F: "穴名差一字（疑似錯字）",
    G: "刺深是 0 寸（假數字）",
  };
  console.log(`穴位卡內自相矛盾探針 — ${recs.length} 筆記錄，${findings.length} 個候選，${codes.length} 個穴位`);
  console.log("（候選 ≠ 結論。誤報是預期內的，逐條裁決由人做。）\n");
  for (const t of "ABCDEFG") {
    const list = byType[t] || [];
    console.log(`── ${t} ${LABEL[t]} — ${list.length} 個候選 / ${new Set(list.map((x) => x.code)).size} 穴`);
    for (const f of list) {
      console.log(`   ${f.code} ${f.chinese}  ${f.json_path}`);
      console.log(`      ${f.conflict}`);
      console.log(`      「${f.excerpt.replace(/\n/g, " ").slice(0, 66)}」`);
    }
    if (!list.length) console.log("   （無）");
    console.log("");
  }
  console.log("涉及穴位：", codes.join(" "));
}

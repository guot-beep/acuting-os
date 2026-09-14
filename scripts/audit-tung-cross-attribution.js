#!/usr/bin/env node
/**
 * audit-tung-cross-attribution.js — 唯讀帳本:董氏穴記錄裡「別的穴的小標段落」
 *
 * 問題:data/tung/point_index.json 有些記錄的 *_zh 欄位裡帶著「X穴：」小標,
 * 小標後面是另一個穴的內容(靈骨穴卡裡有大白穴的主治;大間/小間/浮間/外間四張卡
 * 都是同一段大間/側間/小間)。原網站一頁寫好幾個穴,抓下來按「、」「，」切陣列時
 * 小標跟著進去,也把一個功效字串切成兩個穴各半(「利咽喉。 側間穴：宣肺化痰」)。
 * 如果連結器用全文比對穴名,就會把大白的主治算到靈骨頭上。
 *
 * 這支腳本不寫 data/**。它讀某個 git ref 上的 point_index.json,逐欄逐 index 切段,
 * 每段標出真正屬於哪個穴(有記錄就給 tung.* id,沒有就寫 no record),再給一個建議動作。
 *
 * 小標判定(不靠「穴：」字面,那會把「配穴：」「治療癌症主穴：」算進去):
 *   「穴：」前面那串漢字,取最長的後綴,必須是 (a) 某筆記錄的 name_zh/aliases_zh,或
 *   (b) tungs_website_structured.json 原網站文字裡當小標出現過、但沒有記錄的穴名。
 *   後綴前面多出來的字 = 黏到上一項的尾巴(glued_prefix)。解析不到的一律列進 excluded_labels。
 * 已知漏網:縮寫並列小標「姐妹一、二穴：」的「二」不是完整穴名,解析不到,那段算在前一個小標的主人。
 *
 * 用法:
 *   node scripts/audit-tung-cross-attribution.js                 # 量 origin/main,印逐欄計數
 *   node scripts/audit-tung-cross-attribution.js --ref HEAD
 *   node scripts/audit-tung-cross-attribution.js --write <path>  # 另外寫出 JSON 帳本
 * 抽到 0 個小標一律 exit 1(解析器壞掉時「全部乾淨」是假的)。
 */
"use strict";
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const argVal = (flag, dflt) => { const i = args.indexOf(flag); return i >= 0 && args[i + 1] ? args[i + 1] : dflt; };
const REF = argVal("--ref", "origin/main");
const WRITE = argVal("--write", null);

function gitShow(ref, rel) {
  return execFileSync("git", ["show", `${ref}:${rel}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
const SHA = execFileSync("git", ["rev-parse", REF], { cwd: ROOT, encoding: "utf8" }).trim();
const INDEX_REL = "data/tung/point_index.json";
const SOURCE_REL = "data/tung/tungs_website_structured.json";
const index = JSON.parse(gitShow(REF, INDEX_REL));
const source = JSON.parse(gitShow(REF, SOURCE_REL));
const points = index.points;
const TOTAL = points.length;

const FOUR = ["traditional_functions_zh", "indications_zh", "action_tags_zh", "disease_tags_zh"];
const PLACEHOLDER_EN = "Master Tung clinical indication";
const PLACEHOLDER_ZH = "eLotus董氏奇穴條目";
const CJK = /[一-鿿]/;
const J = JSON.stringify;
const stem = (s) => String(s || "").trim().replace(/穴$/, "");

// ---- 名字字典 ----------------------------------------------------------------
const recordNames = new Map();   // stem -> Set(id)
for (const p of points) {
  for (const n of [p.name_zh, ...(p.aliases_zh || [])]) {
    const k = stem(n);
    if (!k) continue;
    if (!recordNames.has(k)) recordNames.set(k, new Set());
    recordNames.get(k).add(p.id);
  }
}
// 原網站文字裡在句界(開頭/。/空白/；)之後當小標出現的名字。標籤字(主、配…)與單字不收。
const LABEL_STOP = /(主|配|倒馬|特效|董氏奇|禁針)$/;
const SOURCE_TEXT_KEYS = ["anatomy", "location", "channels", "nature", "indications", "needling", "sensation", "application", "explanation"];
const SOURCE_HEADING = /(?:^|[。\s；;])\s*((?:[一-鿿]{1,6}、)*[一-鿿]{1,6})穴\s*[：:]/g;
const noRecordNames = new Map(); // stem -> Set(source page title)
const pageHeadings = new Map();  // source page title -> Set(heading stem)
for (const e of source) {
  if (!pageHeadings.has(e.title)) pageHeadings.set(e.title, new Set());
  for (const k of SOURCE_TEXT_KEYS) {
    if (typeof e[k] !== "string") continue;
    for (const m of e[k].matchAll(SOURCE_HEADING)) {
      for (const n of m[1].split("、")) {
        pageHeadings.get(e.title).add(n);
        if (n.length < 2 || /穴/.test(n) || LABEL_STOP.test(n) || recordNames.has(n)) continue;
        if (!noRecordNames.has(n)) noRecordNames.set(n, new Set());
        noRecordNames.get(n).add(e.title);
      }
    }
  }
}
// 原網站有獨立頁、但 point_index 沒有記錄的穴名也算(分白穴有自己一頁)。
for (const e of source) {
  const n = stem(e.title);
  if (n.length >= 2 && !/、/.test(n) && !recordNames.has(n) && !noRecordNames.has(n)) noRecordNames.set(n, new Set([e.title]));
}

// ---- 小標解析 ----------------------------------------------------------------
const excludedLabels = new Map(); // label -> count
function findHeadings(text) {
  const out = [];
  const re = /穴\s*[：:]/g;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index;              // 「穴」的位置
    let j = end;
    while (j > 0 && CJK.test(text[j - 1])) j--;
    const run = text.slice(j, end);
    let hit = null;
    for (let k = 0; k < run.length; k++) {
      const cand = run.slice(k);
      if (cand.length < 2 && k > 0) break;   // 單字名只接受整串就是那個字(避免「胸膽穴」)
      if (recordNames.has(cand) || noRecordNames.has(cand)) { hit = { k, name: cand }; break; }
    }
    if (!hit) { const lab = run + "穴"; excludedLabels.set(lab, (excludedLabels.get(lab) || 0) + 1); continue; }
    const names = [hit.name];
    const glued = run.slice(0, hit.k);
    let start = j + hit.k;
    // 「人士、天士穴：」這種並列小標(只有在沒有黏字時才往前找)
    if (!glued) {
      let p = start;
      while (p > 0 && text[p - 1] === "、") {
        let q = p - 1;
        while (q > 0 && CJK.test(text[q - 1])) q--;
        const prev = text.slice(q, p - 1);
        if (!(recordNames.has(prev) || noRecordNames.has(prev))) break;
        names.unshift(prev);
        start = q; p = q;
      }
    }
    out.push({ start, headEnd: m.index + m[0].length, names, glued_prefix: glued });
  }
  return out;
}

function ownerOf(p, names) {
  const ownStems = new Set([stem(p.name_zh), ...(p.aliases_zh || []).map(stem)]);
  return names.map((n) => {
    if (ownStems.has(n)) return { name_zh: n + "穴", id: p.id, own: true };
    const ids = recordNames.has(n) ? [...recordNames.get(n)] : [];
    if (ids.includes(p.id)) return { name_zh: n + "穴", id: p.id, own: true };
    if (ids.length === 1) return { name_zh: n + "穴", id: ids[0], own: false };
    if (ids.length > 1) return { name_zh: n + "穴", id: null, ambiguous_ids: ids, own: false };
    // 沒記錄的「三重一」屬於「三重穴」這張群組卡:只在原網站那一頁的標題正好是去掉數字後的名字時才認
    // (「木一」的原頁是「木一穴」,不是「木穴」,所以不會被併到 木穴)。
    const base = n.replace(/[一二三四五六]$/, "");
    const pages = [...(noRecordNames.get(n) || [])];
    const groupId = base !== n && pages.some((t) => stem(t) === base) && recordNames.has(base) && recordNames.get(base).size === 1 ? [...recordNames.get(base)][0] : null;
    if (groupId === p.id) return { name_zh: n + "穴", id: p.id, own: true, group_member_of: p.id };
    if (groupId) return { name_zh: n + "穴", id: groupId, own: false, group_member_of: groupId };
    return { name_zh: n + "穴", id: "no record", own: false, source_pages: pages };
  });
}

// ---- 切段 --------------------------------------------------------------------
const norm = (s) => String(s || "").replace(/^[\s　]+|[\s　。；;，,、]+$/g, "").replace(/\s+/g, " ");

function segmentField(p, field) {
  const v = p[field];
  const isArr = Array.isArray(v);
  const items = isArr ? v : (typeof v === "string" ? [v] : []);
  let current = [{ name_zh: p.name_zh, id: p.id, own: true, implicit: true }];
  const segs = [];
  items.forEach((text, i) => {
    if (typeof text !== "string") return;
    const hs = findHeadings(text);
    const pieces = [];
    // 第一個小標之前的字屬於「目前的主人」(陣列裡延續上一項的小標)
    if (!hs.length || hs[0].start > 0) pieces.push({ from: 0, owner: current, headLen: 0, heading: null, glued: hs.length ? hs[0].glued_prefix : "" });
    hs.forEach((h, x) => {
      current = ownerOf(p, h.names);
      pieces.push({ from: h.start, owner: current, headLen: h.headEnd - h.start, heading: text.slice(h.start, h.headEnd).trim(), glued: hs[x + 1] ? hs[x + 1].glued_prefix : "" });
    });
    pieces.forEach((pc, x) => { pc.to = x + 1 < pieces.length ? pieces[x + 1].from : text.length; });
    const kept = pieces.filter((pc) => norm(text.slice(pc.from, pc.to)));
    const multi = kept.length > 1;
    for (const pc of kept) {
      const t = text.slice(pc.from, pc.to);
      segs.push({ index: isArr ? i : null, char_start: pc.from, char_end: pc.to, text: t, body: norm(t.slice(pc.headLen)), heading: pc.heading, owner: pc.owner, split_item: multi, glued_prefix: pc.glued || "" });
    }
  });
  return { isArr, items, segs };
}

// ---- 目標卡同欄的狀態 ----------------------------------------------------------
const byId = new Map(points.map((p) => [p.id, p]));
// 比對用:去掉所有空白(原網站穴名連結前後有空格,「同 中白穴 主治」=「同中白穴主治」)、
// 開頭的「X穴：」「配穴：」標籤、歸經前面的「入」、句尾標點。異體字(酸/痠)不合併,照實算 differs。
const cmp = (x) => String(x || "").replace(/\s+/g, "").replace(/^[一-鿿、]{0,8}穴[：:]/, "").replace(/^入/, "").replace(/[。；;，,、]+$/, "");
// 樣板:多張卡共用、只換部位名的句子。清單是逐條看過資料寫下的,不是用出現次數猜的
// (「坐骨神經痛」出現在幾十張卡上,但它是真的主治)。每條共用幾張卡印在 counts.templates。
const TEMPLATES = {
  traditional_functions_zh: [/^eLotus董氏奇穴條目$/],
  indications_zh: [/^[一-鿿]{1,6}區域痛症$/, /^經絡氣血阻滯$/, /^臟腑調理$/],
  acumethod_zh: [/^直刺0\.2～0\.5寸；或貼骨進針；倒馬針法效果更佳。$/],
  anatomy_zh: [/^分佈【[^】]+】相應經絡皮部與神經反應區。$/],
  location_zh: [/^[一二三四五六七八九十]+部位【[^】]+】：位於[一-鿿]{1,8}部。$/]
};
const isTemplate = (field, s) => (TEMPLATES[field] || []).some((re) => re.test(String(s).trim()));
function targetState(targetId, field, body) {
  const t = byId.get(targetId);
  if (!t) return "missing_record";
  const v = t[field];
  if (v === undefined || v === null || (Array.isArray(v) && !v.length) || v === "") return "empty";
  if (Array.isArray(v) ? v.every((x) => isTemplate(field, x)) : isTemplate(field, v)) return "placeholder_only";
  const b = cmp(body);
  if (!b) return "differs";
  const hay = Array.isArray(v) ? v.map(cmp) : [cmp(v)];
  if (hay.some((x) => x === b)) return "has_text";
  const joined = (Array.isArray(v) ? v.map(String).join("、") : String(v)).replace(/\s+/g, "");
  return joined.includes(b) ? "has_text" : "differs";
}

// ---- source_urls 指到的原網站頁,跟這張卡是不是同一個穴(主迴圈要用來標「目標卡本身可疑」)---------
// 標題含本卡穴名(含多穴頁「上高穴、下高穴」)= 對;否則看頁內有沒有本卡的小標;
// 標題穴名跟本卡互為前綴(心靈 / 心靈一穴、心靈二穴)= 同一族,另外分開算。
const pageMismatch = [];
for (const p of points) {
  const own = [stem(p.name_zh), ...(p.aliases_zh || []).map(stem)].filter(Boolean);
  for (const u of p.source_urls || []) {
    const m = /tungs-acupuncture\.com\/([^/?#]+)\/?$/.exec(u);
    if (!m) continue;
    let title; try { title = decodeURIComponent(m[1]); } catch { title = m[1]; }
    const titleNames = title.split("、").map((x) => stem(x.replace(/-/g, "")));
    if (titleNames.some((n) => own.includes(n))) continue;
    const heads = pageHeadings.get(title) || new Set();
    const pageHasHeading = [...heads].some((n) => own.includes(n));
    const family = titleNames.some((n) => own.some((o) => n.length >= 2 && o.length >= 2 && (n.startsWith(o) || o.startsWith(n))));
    pageMismatch.push({ record_id: p.id, name_zh: p.name_zh, source_page_title: title, page_has_heading_for_this_point: pageHasHeading, same_name_family: family, page_in_structured_source: pageHeadings.has(title) });
  }
}
const suspectPage = new Map(pageMismatch.filter((x) => !x.page_has_heading_for_this_point && !x.same_name_family).map((x) => [x.record_id, x.source_page_title]));

// ---- 主迴圈 ------------------------------------------------------------------
const zhFields = new Set();
for (const p of points) for (const k of Object.keys(p)) if (/_zh$/.test(k)) zhFields.add(k);

const rows = [];
const fieldLayouts = [];
const perField = {};
let headingsSeen = 0;
for (const field of [...zhFields].sort()) {
  perField[field] = { foreign_record: new Set(), no_record: new Set(), ambiguous: new Set(), rows: 0 };
  for (const p of points) {
    const { isArr, items, segs } = segmentField(p, field);
    headingsSeen += segs.filter((s) => s.heading).length;
    if (!segs.some((s) => s.owner.some((o) => !o.own))) continue;
    const pf = perField[field];
    for (const s of segs) for (const o of s.owner) {
      if (o.own) continue;
      if (o.id === "no record") pf.no_record.add(p.id);
      else if (o.ambiguous_ids) pf.ambiguous.add(p.id);
      else pf.foreign_record.add(p.id);
    }
    const enField = field.replace(/_zh$/, "_en");
    const en = p[enField];
    const layout = {
      record_id: p.id, name_zh: p.name_zh, field, shape: isArr ? "array" : "string",
      zh_len: isArr ? items.length : null,
      en_field: en === undefined ? null : enField,
      en_len: Array.isArray(en) ? en.length : (typeof en === "string" ? "string" : null),
      en_index_aligned: Array.isArray(en) && isArr ? en.length === items.length : null,
      en_is_placeholder_only: Array.isArray(en) && en.length === 1 && en[0] === PLACEHOLDER_EN,
      no_own_text: !segs.some((s) => s.owner.some((o) => o.own)),
      runs: []
    };
    for (const s of segs) {
      const key = s.owner.map((o) => (o.ambiguous_ids ? o.ambiguous_ids.join("|") : o.id)).join("+");
      const last = layout.runs[layout.runs.length - 1];
      if (last && last.owner_key === key) { last.to_index = s.index; last.segments++; }
      else layout.runs.push({ owner_key: key, owner_name_zh: s.owner.map((o) => o.name_zh).join("、"), from_index: s.index, to_index: s.index, segments: 1 });
    }
    fieldLayouts.push(layout);

    const isTag = field === "action_tags_zh" || field === "disease_tags_zh";
    for (const s of segs) {
      const foreign = s.owner.filter((o) => !o.own);
      const ownOnly = foreign.length === 0;
      const ownHeading = ownOnly && !!s.heading;
      // 本卡自己的段:只有「跟別人擠在同一個字串」「帶自己的小標」「尾巴黏著下一個小標」才需要一列
      if (ownOnly && !s.split_item && !ownHeading && !s.glued_prefix) continue;
      let relation, action, note, target_state = null;
      if (ownOnly) {
        relation = ownHeading ? (s.owner.some((o) => o.group_member_of) ? "own_group_member_heading" : "own_heading") : "own_part_of_split_item";
        if (ownHeading) {
          action = "KEEP_OWN_HEADING_ASK_LABEL";
          note = `內容屬本卡。小標「${s.heading}」要不要拿掉待 Ting 裁定(拿掉會讓字串變短)。`;
        } else {
          action = "KEEP_OWN_PART_SPLIT_LATER";
          note = "這個字串前後分屬兩個穴;這段屬本卡,保留。拆字串會改變陣列長度,要跟 _en 對齊一起處理。";
        }
        if (s.glued_prefix) note += ` 尾巴黏著下一個穴的小標(黏字「${s.glued_prefix}」),切開時這幾個字留在本段。`;
      } else if (!s.body) {
        relation = "heading_only";
        action = "HEADING_ONLY_NO_TEXT";
        note = "這一項只有別的穴的小標、沒有內容;內容在後面的 index,跟著那幾列處理。";
      } else if (foreign.some((o) => o.ambiguous_ids)) {
        relation = "ambiguous_owner";
        action = "ASK_OWNER";
        note = "小標穴名對到不只一筆記錄(" + foreign.map((o) => (o.ambiguous_ids || [o.id]).join("/")).join(";") + "),先裁定是哪一張再談搬。";
      } else if (foreign.every((o) => o.id === "no record")) {
        relation = "no_record";
        action = "NO_RECORD_KEEP_ASK";
        note = "這個穴在 point_index 沒有自己的記錄,不能搬、也不能刪。待 Ting 選:(a) 原地保留,卡上標明這段屬於" + foreign.map((o) => o.name_zh).join("、") + ";(b) 搬到本卡另一個欄位(例如新增的同頁併列穴欄);(c) 另立記錄(新 id,需裁定)。";
      } else {
        relation = "foreign_record";
        const targets = foreign.filter((o) => o.id !== "no record").map((o) => o.id);
        const states = targets.map((id) => targetState(id, field, s.body));
        target_state = Object.fromEntries(targets.map((id, x) => [id, states[x]]));
        const tgt = targets.join("、");
        if (isTag) {
          action = "REDERIVE_TAG_AFTER_PARENT";
          note = (field === "action_tags_zh"
            ? "action_tags_zh 與 traditional_functions_zh 逐字相同(見 counts.tag_fields_are_copies)"
            : "disease_tags_zh 等於 indications_zh 前 8 項(見 counts.tag_fields_are_copies)") + ",是衍生複本;不要手搬,等母欄修好後重新衍生。";
        } else if (states.every((x) => x === "has_text")) {
          action = "TARGET_HAS_IT_ASK_REMOVE_FROM_SOURCE";
          note = `目標卡 ${tgt} 同欄已有這句,不需要搬。本卡這段要不要移出待 Ting 裁定(移出會讓本卡欄位變短)。`;
        } else if (states.every((x) => x === "has_text" || x === "empty" || x === "placeholder_only")) {
          action = "MOVE_TO_TARGET_THEN_ASK";
          note = `目標卡 ${tgt} 同欄是空的或只有樣板「${PLACEHOLDER_ZH}」:先併集寫入目標卡(樣板要不要換掉一併問),核對後才問 Ting 本卡這段怎麼改。`;
        } else {
          action = "TARGET_DIFFERS_ASK";
          note = `目標卡 ${tgt} 同欄已有不同的內容、沒有這句。可能是原網站小標寫錯(例如中白穴頁把自己的歸經標成「上白穴：」),也可能兩個說法都對;不搬,兩邊都留,待 Ting 裁定。`;
        }
        const suspect = targets.filter((id) => suspectPage.has(id));
        if (suspect.length) note += " 注意:目標卡 " + suspect.map((id) => `${id} 的 source_urls 指向「${suspectPage.get(id)}」頁`).join("、") + ",不是它自己那一頁,目標卡內容本身要先審。";
      }
      rows.push({
        record_id: p.id,
        record_name_zh: p.name_zh,
        field,
        index: s.index,
        char_start: s.char_start,
        char_end: s.char_end,
        fragment: s.text,
        heading: s.heading,
        glued_prefix: s.glued_prefix || null,
        belongs_to: s.owner.map((o) => ({ name_zh: o.name_zh, id: o.ambiguous_ids ? o.ambiguous_ids : o.id, ...(o.group_member_of ? { group_member_of: o.group_member_of } : {}), ...(o.source_pages ? { source_pages: o.source_pages } : {}) })),
        relation,
        target_state,
        target_record_page_suspect: target_state ? Object.keys(target_state).filter((id) => suspectPage.has(id)) : null,
        proposed_action: action,
        action_note_zh: note
      });
      perField[field].rows++;
    }
  }
}

if (headingsSeen === 0) {
  console.error("FAIL — 一個小標都沒解析到;不是資料乾淨,是解析器壞了。");
  process.exit(1);
}

// ---- 計數 --------------------------------------------------------------------
const anyForeign = (fields) => {
  const s = new Set();
  for (const f of fields) if (perField[f]) for (const k of ["foreign_record", "no_record", "ambiguous"]) for (const id of perField[f][k]) s.add(id);
  return [...s].sort();
};
const fieldCounts = {};
for (const [f, c] of Object.entries(perField)) {
  const all = new Set([...c.foreign_record, ...c.no_record, ...c.ambiguous]);
  if (!all.size) continue;
  fieldCounts[f] = {
    records_with_other_point_text: `${all.size}/${TOTAL}`,
    heading_resolves_to_other_record: c.foreign_record.size,
    heading_has_no_record: c.no_record.size,
    heading_ambiguous: c.ambiguous.size,
    no_own_text_at_all: fieldLayouts.filter((l) => l.field === f && l.no_own_text).length,
    ledger_rows: c.rows,
    ids: [...all].sort()
  };
}
const placeholderEnOnly = points.filter((p) => Array.isArray(p.indications_en) && p.indications_en.length === 1 && p.indications_en[0] === PLACEHOLDER_EN).map((p) => p.id);
const placeholderEnAny = points.filter((p) => Array.isArray(p.indications_en) && p.indications_en.includes(PLACEHOLDER_EN)).length;
const placeholderZhOnly = points.filter((p) => Array.isArray(p.traditional_functions_zh) && p.traditional_functions_zh.length === 1 && p.traditional_functions_zh[0] === PLACEHOLDER_ZH).map((p) => p.id);
const tagCopy = {
  action_tags_zh_equals_traditional_functions_zh: `${points.filter((p) => J(p.action_tags_zh) === J(p.traditional_functions_zh)).length}/${TOTAL}`,
  disease_tags_zh_equals_first8_indications_zh: `${points.filter((p) => J(p.disease_tags_zh) === J((p.indications_zh || []).slice(0, 8))).length}/${TOTAL}`
};
const actionTally = {};
for (const r of rows) actionTally[r.proposed_action] = (actionTally[r.proposed_action] || 0) + 1;
const fourIds = anyForeign(FOUR);
const noOwnFields = fieldLayouts.filter((l) => l.no_own_text).map((l) => `${l.record_id} ${l.name_zh} ${l.field}`);

const ledger = {
  audit: "tung_cross_attribution",
  read_only: true,
  measured_tree: `${REF} @ ${SHA}`,
  generated_by: "node scripts/audit-tung-cross-attribution.js --ref " + REF,
  files: [INDEX_REL, SOURCE_REL],
  records_total: TOTAL,
  counts: {
    four_named_fields_any: `${fourIds.length}/${TOTAL}`,
    four_named_fields_ids: fourIds,
    any_zh_field_any: `${anyForeign(Object.keys(perField)).length}/${TOTAL}`,
    per_field: fieldCounts,
    fields_with_no_own_text: noOwnFields,
    indications_en_placeholder: { value: PLACEHOLDER_EN, placeholder_is_the_only_item: `${placeholderEnOnly.length}/${TOTAL}`, contains_placeholder: `${placeholderEnAny}/${TOTAL}`, ids: placeholderEnOnly },
    traditional_functions_zh_placeholder: { value: PLACEHOLDER_ZH, placeholder_is_the_only_item: `${placeholderZhOnly.length}/${TOTAL}`, ids: placeholderZhOnly },
    tag_fields_are_copies: tagCopy,
    templates: Object.fromEntries(Object.entries(TEMPLATES).map(([f, res]) => [f, {
      patterns: res.map((re) => re.source),
      field_entirely_template: `${points.filter((p) => { const v = p[f]; return Array.isArray(v) ? v.length > 0 && v.every((x) => isTemplate(f, x)) : typeof v === "string" && isTemplate(f, v); }).length}/${TOTAL}`
    }])),
    source_page_not_this_point: {
      rule: "source_urls 裡的 tungs-acupuncture.com 頁標題不含本卡穴名",
      entries: pageMismatch.length,
      page_has_no_heading_for_this_point: pageMismatch.filter((x) => !x.page_has_heading_for_this_point).length,
      of_which_same_name_family: pageMismatch.filter((x) => !x.page_has_heading_for_this_point && x.same_name_family).length,
      of_which_different_point: suspectPage.size,
      different_point_ids: [...suspectPage.keys()],
      list: pageMismatch
    },
    rows_total: rows.length,
    rows_by_action: actionTally
  },
  name_dictionary: {
    record_names_with_more_than_one_id: [...recordNames].filter(([, ids]) => ids.size > 1).map(([n, ids]) => ({ name_zh: n + "穴", ids: [...ids] })),
    no_record_names_from_source: [...noRecordNames].map(([n, pages]) => ({ name_zh: n + "穴", source_pages: [...pages] })),
    excluded_labels_not_point_names: [...excludedLabels].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
  },
  field_layouts: fieldLayouts,
  rows
};

console.log(`MEASURED TREE: ${REF} @ ${SHA}`);
console.log(`records: ${TOTAL}`);
console.log(`four named fields (${FOUR.join(", ")}), any other-point text: ${ledger.counts.four_named_fields_any}`);
console.log(`any *_zh field, any other-point text: ${ledger.counts.any_zh_field_any}`);
console.log("per field: records | ->other record | no record | ambiguous | no own text | ledger rows");
for (const [f, c] of Object.entries(fieldCounts)) console.log(`  ${f}: ${c.records_with_other_point_text} | ${c.heading_resolves_to_other_record} | ${c.heading_has_no_record} | ${c.heading_ambiguous} | ${c.no_own_text_at_all} | ${c.ledger_rows}`);
console.log(`fields with no own text at all: ${noOwnFields.length} ${J(noOwnFields)}`);
console.log(`indications_en == ["${PLACEHOLDER_EN}"]: ${placeholderEnOnly.length}/${TOTAL} (contains it: ${placeholderEnAny}/${TOTAL})`);
console.log(`traditional_functions_zh == ["${PLACEHOLDER_ZH}"]: ${placeholderZhOnly.length}/${TOTAL}`);
console.log(`tag copies: action_tags_zh==traditional_functions_zh ${tagCopy.action_tags_zh_equals_traditional_functions_zh}; disease_tags_zh==indications_zh[0..8] ${tagCopy.disease_tags_zh_equals_first8_indications_zh}`);
console.log(`templates (field entirely template): ${J(Object.fromEntries(Object.entries(ledger.counts.templates).map(([f, t]) => [f, t.field_entirely_template])))}`);
const spn = ledger.counts.source_page_not_this_point;
console.log(`source page title not this point: ${spn.entries} (no heading for it on that page: ${spn.page_has_no_heading_for_this_point}; same name family: ${spn.of_which_same_name_family}; different point: ${spn.of_which_different_point} ${J(spn.different_point_ids)})`);
console.log(`ledger rows: ${rows.length} ${J(actionTally)}`);
console.log(`rows whose target record has a suspect source page: ${rows.filter((r) => r.target_record_page_suspect && r.target_record_page_suspect.length).length}`);
console.log(`glued headings: ${rows.filter((r) => r.glued_prefix).length}`);
console.log(`excluded heading-like labels: ${J(ledger.name_dictionary.excluded_labels_not_point_names)}`);
if (WRITE) {
  // 帳本很長:外層縮排,rows / field_layouts / 清單每筆一行,diff 才看得懂。
  const oneLinePerItem = (arr) => "[\n" + arr.map((x) => "    " + J(x)).join(",\n") + "\n  ]";
  const parts = Object.entries(ledger).map(([k, v]) => {
    const body = Array.isArray(v) && v.length && typeof v[0] === "object" ? oneLinePerItem(v) : JSON.stringify(v, null, 2).replace(/\n/g, "\n  ");
    return `  ${J(k)}: ${body}`;
  });
  fs.writeFileSync(path.resolve(ROOT, WRITE), "{\n" + parts.join(",\n") + "\n}\n");
  JSON.parse(fs.readFileSync(path.resolve(ROOT, WRITE), "utf8"));   // 寫壞就在這裡炸,不留一份讀不回來的帳本
  console.log("wrote " + WRITE);
}

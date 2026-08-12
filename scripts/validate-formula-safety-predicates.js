#!/usr/bin/env node
/**
 * validate-formula-safety-predicates.js — machine-enforced safety-shape
 * predicates for `data/herbs/formulas.json`.
 *
 * Origin: docs/research_packs/FORMULA_EYESON_03.md §3.1 (the LIBRARY-COMPLETE
 * 慎用藥 coverage matrix — 63 cards read end to end by a human across three
 * batches) and §3.2, which distils that matrix into nine predicates a machine
 * can decide "without any clinical knowledge". This script implements the five
 * that the eyes-on sweeps actually found violations of and that no other
 * script covers: P1, P2, P3, P4, P6. (P7 is already
 * validate-formula-composition-signatures.js; P5/P8/P9 are worklist-shaped —
 * P9's "cannot classify" counter is reported here as an honesty metric, see
 * below.)
 *
 * WHAT THESE PREDICATES CAN AND CANNOT GUARANTEE — read this before quoting
 * a PASS from this script. They guarantee exactly three things:
 *   not empty  · not garbled  · has a direction word.
 * They say NOTHING about clinical correctness. Whether 附子's card actually
 * warns about 先煎 and arrhythmia, whether 木通's card mentions aristolochic
 * acid, whether the 大黃 cards cover lactation and menstruation — the ledger
 * measured all of that by hand (§3.1: present 1 / 63) and it stays un-machine-
 * checkable until CONTENT_REQUEST §B lands per-herb standard sentences with
 * named sources. Until then a card can satisfy every predicate here and still
 * be clinically silent. 憲法第四條: 查不到就停下來回報,不要編.
 *
 * ── The predicates ──────────────────────────────────────────────────────
 *
 * P1  composition contains a caution herb  ⇒  ≥1 non-empty safety string.
 *     "Safety string" = any non-empty string across contraditions_zh/_en and
 *     cautions_zh/_en (the four fields §3.2 names).
 *     The caution-herb set lives in data/config/formula_caution_herbs.json,
 *     grouped by family, with its own _readme stating that membership means
 *     "this card may not be silent", not "this herb is banned". Source cited
 *     there: §3.1's matrix.
 *     KEYED BY `herb_id` SLUG, NEVER BY CHINESE SUBSTRING. F-46 is the whole
 *     reason: `composition[].herb_zh` is romanized on 102 rows / 57 cards
 *     ("Zhi Chuan Wu", "Shui Fei Zhu Sha"), so a Chinese-substring scan
 *     produces false negatives on precisely the two most dangerous cards in
 *     the library. Matching is exact slug equality after stripping `herb.`,
 *     so `ma_huang_gen` != `ma_huang` and `bai_fu_zi` != `fu_zi`.
 *
 * P2  public_safe === true ∧ composition non-empty  ⇒  same requirement.
 *     A card a patient can see today must not have four empty safety fields,
 *     regardless of what is in it. (F-50.)
 *
 * P3  public_safe === true  ⇒  no `actions_zh` entry is garbled.
 *     "Garbled" is F-49's criterion, restated in §3.2, implemented verbatim:
 *       (a) begins with `:` `：` `-` `－` `—`
 *       (b) contains an orphan conjunction — a comma (`,` `，` `、`)
 *           immediately followed by `於` or `與`
 *       (c) begins with `於`/`與`, or ends with `於`/`與`
 *       (d) is ≤3 characters and contains any of `於 與 / ／ , ，`
 *       (e) contains a CJK-slash-CJK fragment (`肝/腎`)
 *     Half-width commas are accepted in (b) alongside full-width ones because
 *     the corpus uses both — the ledger's own count (22 cards / 83 entries)
 *     only reproduces with both, and `bei_mu_gua_lou_san`'s `"理氣寬中,與氣"`
 *     is the row that proves it. This script reports that library-wide figure
 *     next to the P3 violation count so the calibration stays checkable.
 *     These entries are what §1 block 5「功效」prints on the card; the ledger
 *     notes most of them have NO clean Chinese original to mirror (the only
 *     complete content is in `actions_en`), so P3 is a gate, not a fix.
 *
 * P4  every non-empty safety entry must contain a DIRECTION WORD.
 *     This is the matrix's real payoff and the reason a length check is not
 *     enough. F-57: `chai_hu_jia_long_gu_mu_li_tang`'s ONLY
 *     `contraindications_zh` entry is a provenance note explaining why 鉛丹
 *     was moved out of the composition table. The note itself is the best
 *     historical-ingredient handling in the library (F-56.1) — and it is
 *     sitting in the contraindications field, where any
 *     `contraindications_zh.length > 0` check reads it as "this card has
 *     contraindications". Same shape, different content: F-06's efficacy
 *     claims and `yin_chen_hao_tang.contraindications_zh[2]`'s diet advice.
 *
 *     Direction words = §3.2's P4 list ∪ the dispatch's list:
 *       zh  禁用 禁服 忌用 忌服 慎用 慎服 不宜 不可 勿
 *       en  contraindicat / caution / avoid / not recommended /
 *           do not / don't / should not / must not
 *     DELIBERATE DIVERGENCE FROM THE LEDGER: §3.2 also lists bare `only` as an
 *     English direction word. `only` is dropped here, because it is what lets
 *     the F-57 card through — its English provenance note reads "...lists
 *     only the 11 dispensable ingredients", so with `only` in the list the
 *     predicate passes the exact card it was written to catch. Verified both
 *     ways on the live corpus before dropping it.
 *     `忌食` is likewise NOT a direction word here: it is the diet-advice form
 *     the ledger wants flagged, not a contraindication.
 *     The zh and en lists are applied to every entry regardless of which
 *     field it sits in, because both languages appear in both sides today
 *     (F-61 counts `_en` arrays containing CJK).
 *
 *     P4 is reported in TWO tiers, and they are not the same defect:
 *       P4-card   a card has ≥1 non-empty safety entry but NOT ONE of them
 *                 contains a direction word ⇒ its safety fields are
 *                 EFFECTIVELY EMPTY and P1/P2 were fooled. This is F-57's
 *                 exact shape and the tier that matters.
 *       P4-entry  an individual entry lacks a direction word while the card
 *                 has others that do. Much noisier by construction: a terse
 *                 `contraindications_en` like "Yang Ming Fu pattern." is a
 *                 real contraindication whose direction is carried by the
 *                 FIELD NAME rather than by the sentence. Reported as a
 *                 worklist number only — see the graduation condition.
 *
 * P6  `composition[].role_zh` must be EXACTLY one of 君/臣/佐/使.
 *     F-59: `cang_er_zi_san`'s 薄荷 is `"佐使"` — a fifth value.
 *     validate-formula-standard.js's F7 check uses
 *     `/^(君|臣|佐|使|chief|deputy|assistant|envoy)/i`, a PREFIX regex, so
 *     `"佐使"` matches `^佐` and passes there. That is the gap this predicate
 *     closes; the ledger says the criterion has to be written as equality.
 *     A missing or empty `role_zh` is LEGAL and not counted — 憲法第四條:
 *     `chai_hu_jia_long_gu_mu_li_tang` leaves 10 of 11 roles blank on purpose
 *     because 《傷寒論》 does not assign 君臣佐使 and no source ruled on it.
 *     Leaving it empty is the honest answer; inventing a role is not.
 *
 * ── Coverage honesty (ledger P9 / F-47) ────────────────────────────────
 *
 * P1's mother lode is only as good as `herb_id`. Two blind spots are reported
 * as metrics, never as violations:
 *   • rows with NO `herb_id` and a romanized `herb_zh` — genuinely
 *     unclassifiable, so P1 cannot say whether the card is a caution card.
 *   • a card carrying ANOTHER formula's composition table (F-47:
 *     `formula.xie_xin_tang` holds 半夏瀉心湯's table and therefore has no
 *     大黃 row to match) is invisible to any composition-keyed scan,
 *     `herb_id` or not. That class belongs to
 *     validate-formula-composition-signatures.js (FB-20/FB-28).
 * So "P1: N violations" means "N cards whose composition we CAN read contain
 * a caution herb and are silent", not "only N caution cards are silent".
 *
 * ── CI tier: every predicate is NOTE today ─────────────────────────────
 *
 * Measured on the live corpus at the time of writing (branch
 * codex/pattern-v2, tip ff1903e — after FB-19/FB-26 rounds 1-3 took 20 cards
 * out of `public_safe`):
 *
 *     P1        10 cards          P2        10 cards
 *     P3         5 cards          P4-card    7 cards   (P4-entry 452/114)
 *     P6         6 rows / 6 cards
 *
 * Not one predicate is at zero, so not one is wired blocking. Default
 * invocation (no flags) NEVER exits 1 — it reports and exits 0, and the CI
 * step runs it informationally. This is the same call
 * validate-formula-composition-signatures.js made for the same reason, and
 * the reason AI_CONSTITUTION's ratchet exists at all: a gate that breaks the
 * build over a backlog nobody has been asked to fix yet gets switched off
 * within a week.
 *
 * GRADUATION CONDITION — per predicate, independently. `--blocking` takes an
 * optional comma-separated list; a predicate graduates when its count reaches
 * zero and the CI step is changed to name it:
 *
 *     node scripts/validate-formula-safety-predicates.js --blocking=P6
 *     node scripts/validate-formula-safety-predicates.js --blocking=P1,P2,P3
 *     node scripts/validate-formula-safety-predicates.js --blocking       (all)
 *
 *   P1  graduates when the 10 listed cards each carry ≥1 safety string, or
 *       are deprecated. Blocked on content, not on judgement: writing the
 *       string requires a named source (§3.5 T5). Do NOT graduate it by
 *       shrinking data/config/formula_caution_herbs.json.
 *   P2  graduates when the remaining 10 public cards with zero safety strings
 *       are either filled or flipped to `public_safe: false` — i.e. when
 *       FB-26's C tier (§3.3) is decided. Flag flip, needs Ting, no new
 *       content. This is the cheapest of the five to close.
 *   P3  graduates when the 5 public cards with garbled `actions_zh` are
 *       cleaned or taken down (FB-30 / §3.3). The garbled set is 22 cards
 *       library-wide; P3 only gates the public ones, so taking a card down
 *       closes P3 for it without inventing Chinese.
 *   P4  graduates on the P4-CARD tier only. P4-entry stays note-tier
 *       permanently unless and until a decision is recorded that a terse
 *       pattern-name entry must be rewritten with an explicit direction —
 *       that is §3.5 T20, and 452 entries is a content programme, not a gate.
 *   P6  graduates when the 6 non-vocabulary `role_zh` values are corrected.
 *       Pure vocabulary, no source needed beyond the standard 君臣佐使
 *       assignment — but it is `data/herbs/**`, so it belongs to the
 *       formula lane, not to this script's author.
 *
 * Usage:
 *   node scripts/validate-formula-safety-predicates.js
 *   node scripts/validate-formula-safety-predicates.js --worklist
 *   node scripts/validate-formula-safety-predicates.js --blocking[=P1,P2,...]
 *   node scripts/validate-formula-safety-predicates.js --json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMULAS_FILE = path.join(ROOT, "data/herbs/formulas.json");
const CONFIG_FILE = path.join(ROOT, "data/config/formula_caution_herbs.json");

const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const JSON_OUT = argv.includes("--json");
const blockingArg = argv.find((a) => a === "--blocking" || a.startsWith("--blocking="));
const BLOCKING_IDS = blockingArg
  ? blockingArg.includes("=")
    ? blockingArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : ["P1", "P2", "P3", "P4", "P6"]
  : [];

// ── inputs ────────────────────────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync(FORMULAS_FILE, "utf8"));
const recs = raw.records || raw;

if (!fs.existsSync(CONFIG_FILE)) {
  console.error(`❌ 找不到慎用藥設定檔 ${path.relative(ROOT, CONFIG_FILE)} — P1 無法判定，拒絕以「0 違反」收場。`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
const CAUTION = new Map(); // slug -> family key
for (const [family, def] of Object.entries(cfg.families || {})) {
  for (const slug of def.herb_id_slugs || []) CAUTION.set(String(slug).trim().toLowerCase(), family);
}
if (!CAUTION.size) {
  console.error(`❌ ${path.relative(ROOT, CONFIG_FILE)} 沒有任何 herb_id slug — P1 會假裝全部通過，拒絕執行。`);
  process.exit(1);
}

// ── shared helpers ────────────────────────────────────────────────────────
const SAFETY_FIELDS = ["contraindications_zh", "contraindications_en", "cautions_zh", "cautions_en"];

// A field may legally be an array (the norm) or a bare string (a handful of
// records). Anything else contributes nothing rather than throwing — a shape
// bug must not make a safety predicate silently report "clean".
const asList = (v) => (Array.isArray(v) ? v : typeof v === "string" ? [v] : []);

/** [fieldName, string] for every non-empty safety string on a record. */
function safetyEntries(r) {
  const out = [];
  for (const f of SAFETY_FIELDS) {
    for (const s of asList(r[f])) {
      if (typeof s === "string" && s.trim() !== "") out.push([f, s]);
    }
  }
  return out;
}

const slugOf = (c) =>
  String(c && c.herb_id ? c.herb_id : "")
    .replace(/^herb\./, "")
    .trim()
    .toLowerCase();

const shortId = (id) => String(id).replace(/^formula\./, "");
const clip = (s, n = 96) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

// ── P1 mother lode + coverage honesty ────────────────────────────────────
function cautionSlugsIn(r) {
  const hits = new Map(); // slug -> family
  for (const c of r.composition || []) {
    const s = slugOf(c);
    if (s && CAUTION.has(s)) hits.set(s, CAUTION.get(s));
  }
  return hits;
}

let unclassifiableRows = 0;
const unclassifiableCards = new Set();
let romanizedRows = 0;
const romanizedCards = new Set();
for (const r of recs) {
  for (const c of r.composition || []) {
    const zh = String((c && (c.herb_zh || c.name_zh)) || "");
    const romanized = /[A-Za-z]/.test(zh) && !/[一-鿿]/.test(zh);
    if (romanized) {
      romanizedRows++;
      romanizedCards.add(r.id);
    }
    if (!slugOf(c)) {
      unclassifiableRows++;
      unclassifiableCards.add(r.id);
    }
  }
}

// ── P3 garbled criterion (F-49, verbatim) ────────────────────────────────
const CJK = "\\u4e00-\\u9fff";
const RE_CJK_SLASH_CJK = new RegExp(`[${CJK}]\\s*[/／]\\s*[${CJK}]`);
/** Returns the rule name that fired, or null when the string is not garbled. */
function garbledReason(s) {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t) return null;
  if (/^[:：\-－—]/.test(t)) return "以冒號/破折號起首";
  if (/[,，、]\s*[於與]/.test(t)) return "逗號後接孤立的「於/與」";
  if (/^[於與]/.test(t)) return "以「於/與」起首";
  if (/[於與]$/.test(t)) return "以「於/與」結尾";
  if ([...t].length <= 3 && /[於與/／,，]/.test(t)) return "≤3 字且含「於/與//，」";
  if (RE_CJK_SLASH_CJK.test(t)) return "中文-斜線-中文片段";
  return null;
}

// ── P4 direction words ───────────────────────────────────────────────────
// See the header for why `only` (present in §3.2's list) is excluded and why
// `忌食` is not treated as a direction word.
const DIRECTION_ZH = ["禁用", "禁服", "忌用", "忌服", "慎用", "慎服", "不宜", "不可", "勿"];
const DIRECTION_EN = ["contraindicat", "caution", "avoid", "not recommended", "do not", "don't", "should not", "must not"];
const RE_DIRECTION = new RegExp(
  DIRECTION_ZH.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
    "|" +
    DIRECTION_EN.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);
const hasDirection = (s) => RE_DIRECTION.test(String(s));

// ── P6 role vocabulary ───────────────────────────────────────────────────
const ROLE_VOCAB = new Set(["君", "臣", "佐", "使"]);

// ── evaluate ─────────────────────────────────────────────────────────────
const violations = { P1: [], P2: [], P3: [], P4card: [], P4entry: [], P6: [] };
const stats = {
  records: recs.length,
  with_composition: 0,
  public_safe_true: 0,
  caution_cards: 0,
  garbled_actions_cards_librarywide: 0,
  garbled_actions_entries_librarywide: 0,
  romanized_herb_zh_rows: romanizedRows,
  romanized_herb_zh_cards: romanizedCards.size,
  rows_without_herb_id: unclassifiableRows,
  cards_with_rows_without_herb_id: unclassifiableCards.size,
};

for (const r of recs) {
  const comp = Array.isArray(r.composition) ? r.composition : [];
  if (comp.length) stats.with_composition++;
  if (r.public_safe === true) stats.public_safe_true++;

  const entries = safetyEntries(r);
  const cautions = cautionSlugsIn(r);
  if (cautions.size) stats.caution_cards++;

  // P1
  if (comp.length && cautions.size && entries.length === 0) {
    violations.P1.push({
      id: r.id,
      name_zh: r.name_zh || "",
      public_safe: r.public_safe === true,
      herbs: [...cautions.keys()],
      families: [...new Set(cautions.values())],
    });
  }

  // P2
  if (r.public_safe === true && comp.length && entries.length === 0) {
    violations.P2.push({
      id: r.id,
      name_zh: r.name_zh || "",
      items: comp.length,
      caution_herbs: [...cautions.keys()],
    });
  }

  // P3 — library-wide garble stats, violations only on public cards
  const acts = asList(r.actions_zh);
  const garbled = acts.map((s) => [s, garbledReason(s)]).filter(([, why]) => why);
  if (garbled.length) {
    stats.garbled_actions_cards_librarywide++;
    stats.garbled_actions_entries_librarywide += garbled.length;
    if (r.public_safe === true) {
      violations.P3.push({
        id: r.id,
        name_zh: r.name_zh || "",
        entries: garbled.map(([s, why]) => ({ value: s, rule: why })),
      });
    }
  }

  // P4
  if (entries.length) {
    const bad = entries.filter(([, s]) => !hasDirection(s));
    if (bad.length === entries.length) {
      violations.P4card.push({
        id: r.id,
        name_zh: r.name_zh || "",
        public_safe: r.public_safe === true,
        total_entries: entries.length,
        sample: { field: bad[0][0], value: bad[0][1] },
      });
    }
    for (const [field, s] of bad) violations.P4entry.push({ id: r.id, field, value: s });
  }

  // P6
  for (const c of comp) {
    const v = c && c.role_zh;
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue; // legal blank, 憲法第四條
    if (typeof v === "string" && ROLE_VOCAB.has(v.trim())) continue;
    violations.P6.push({
      id: r.id,
      name_zh: r.name_zh || "",
      herb_zh: (c && (c.herb_zh || c.name_zh)) || "",
      herb_id: (c && c.herb_id) || "",
      role_zh: v,
    });
  }
}

const p4entryCards = new Set(violations.P4entry.map((v) => v.id)).size;

const COUNTS = {
  P1: violations.P1.length,
  P2: violations.P2.length,
  P3: violations.P3.length,
  P4: violations.P4card.length, // the blocking-eligible tier
  P6: violations.P6.length,
};

// ── output ───────────────────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        stats,
        counts: { ...COUNTS, P4_entry_tier: violations.P4entry.length, P4_entry_tier_cards: p4entryCards },
        violations,
        blocking_requested: BLOCKING_IDS,
      },
      null,
      2
    )
  );
} else {
  console.log(
    `validate-formula-safety-predicates: ${stats.records} 筆方劑（${stats.with_composition} 筆有組成、` +
      `${stats.public_safe_true} 筆 public_safe:true、${stats.caution_cards} 筆含慎用藥）\n`
  );
  console.log(`  P1 含慎用藥而安全欄零字串        ${COUNTS.P1}`);
  console.log(`  P2 public 而安全欄零字串          ${COUNTS.P2}`);
  console.log(`  P3 public 而 actions_zh 亂碼      ${COUNTS.P3}` +
    `  （全庫亂碼 ${stats.garbled_actions_cards_librarywide} 卡 / ${stats.garbled_actions_entries_librarywide} 條）`);
  console.log(`  P4 安全欄全部沒有方向詞（卡層）    ${COUNTS.P4}` +
    `  （條目層 ${violations.P4entry.length} 條 / ${p4entryCards} 卡，NOTE only）`);
  console.log(`  P6 role_zh 不是 君/臣/佐/使 全等   ${COUNTS.P6} 列`);
  console.log(
    `\n  覆蓋誠實度：herb_zh 純拉丁 ${stats.romanized_herb_zh_rows} 列 / ${stats.romanized_herb_zh_cards} 卡` +
      `（herb_id 仍可判）；herb_id 為空 ${stats.rows_without_herb_id} 列 / ${stats.cards_with_rows_without_herb_id} 卡（不可判）。` +
      `\n  組成表接錯方的卡（F-47）本腳本看不見 —— 見 validate-formula-composition-signatures.js。`
  );

  const section = (title, rows, render) => {
    if (!rows.length) return;
    console.log(`\n===== ${title} =====`);
    for (const v of rows) console.log(render(v));
  };

  section(`P1 含慎用藥而安全欄零字串（${COUNTS.P1}）`, violations.P1, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  慎用藥 [${v.herbs.join(", ")}]  族 [${v.families.join(", ")}]  public_safe=${v.public_safe}`
  );
  section(`P2 public_safe:true 而安全欄零字串（${COUNTS.P2}）`, violations.P2, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  ${v.items} 味` + (v.caution_herbs.length ? `  含慎用藥 [${v.caution_herbs.join(", ")}]` : "")
  );
  section(`P3 public_safe:true 而 actions_zh 亂碼（${COUNTS.P3}）`, violations.P3, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})\n` + v.entries.map((e) => `      「${e.value}」 ← ${e.rule}`).join("\n")
  );
  section(`P4 安全欄有字串、但沒有一條含方向詞（${COUNTS.P4}）`, violations.P4card, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  ${v.total_entries} 條  public_safe=${v.public_safe}\n      ${v.sample.field}: 「${clip(v.sample.value, 120)}」`
  );
  section(`P6 role_zh 非四值全等（${COUNTS.P6}）`, violations.P6, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  ${v.herb_zh || v.herb_id} role_zh=${JSON.stringify(v.role_zh)}`
  );

  if (WORKLIST && violations.P4entry.length) {
    console.log(`\n===== P4 條目層（NOTE only，${violations.P4entry.length} 條 / ${p4entryCards} 卡）=====`);
    for (const v of violations.P4entry) console.log(`  ${shortId(v.id)}  ${v.field}: 「${clip(v.value)}」`);
  } else if (!WORKLIST && violations.P4entry.length) {
    console.log(`\n（加 --worklist 可列出 P4 條目層的 ${violations.P4entry.length} 條）`);
  }

  console.log(
    `\n提示：本檢查目前五條 predicate 全是 NOTE 級，不會讓 CI 失敗（見腳本開頭「CI tier」與逐條畢業條件）。` +
      `\n     這五條只能保證「不空、不亂、有方向」，保證不了臨床正確性 —— 那要等 CONTENT_REQUEST §B。` +
      `\n     加 --blocking=P6 之類可預覽單條畢業後的行為。`
  );
}

// ── blocking preview / graduated gate ────────────────────────────────────
if (BLOCKING_IDS.length) {
  const failed = BLOCKING_IDS.filter((p) => (COUNTS[p] || 0) > 0);
  if (failed.length) {
    console.error(
      `\n❌ --blocking: ${failed.map((p) => `${p}=${COUNTS[p]}`).join(", ")}（見上方清單）。`
    );
    process.exit(1);
  }
  console.log(`\nPASS（--blocking=${BLOCKING_IDS.join(",")}，目前 0 違反）。`);
} else if (!JSON_OUT) {
  console.log("\n完成（NOTE 級，不影響 exit code）。");
}

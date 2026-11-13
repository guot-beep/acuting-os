/* herb-dose.js — 中藥卡「常用劑量」要顯示什麼(純函式,2026-11-12)。
 *
 * 修 bug:360 張中藥卡有 145 張顯示「待補」,而那些卡的資料裡其實有帶出處的藥用範圍
 * (dosage_normalized,SOL 任務四 2026-08-15 整形、no_new_numbers)。卡片只讀 dosage_g,所以看不到。
 *
 * 照既有的規則接,不是整批放出來(規則正本:scripts/validate-herb-dosage-shape.js 開頭、
 * docs/TING_DECISION_QUEUE.md C5c、憲法紅線 4):
 *   - 整形不是查證。這裡顯示的是「單一來源的參考範圍」,畫面上照實這樣寫,並標出來源。
 *   - **食療用量永遠不顯示。** 61 張可補的卡食療上限高於藥用上限(大黃:藥用 ≤9g、食療 ≤30g)。
 *   - 給法矛盾(D4:芒硝、阿膠、鹿角膠、鹿茸)、量級可疑 / 具名列管(D5:蘇合香)→ 不顯示。
 *   - 出處寫著「待核對」的(雄黃、硃砂)→ 不顯示。
 *   - 有毒 / 劑量炮製要審 / 不可自行用藥 / 安全審查未完的藥 → 不顯示,逐張等 Ting 裁定。
 *     寧可留「待補」:沒查證的數字出現在有毒藥的卡上,比空白糟。
 *   - 藥用範圍不只一筆(細辛、佩蘭、白及、全蠍、薤白)→ 不顯示(哪一筆是「常用」要人判)。
 *   - 這裡不產生任何數字:顯示的字串就是資料裡的 verbatim 原文。
 * 已有 dosage_g.standard_daily_g 的卡不受影響(那一欄優先)。
 * 行為真值表在 scripts/validate-herb-dosage-shape.js(D6,對全部記錄逐張跑)。
 */
(function (global) {
  "use strict";

  // 具名列管(與 validate-herb-dosage-shape.js 的 SAFETY_HOLD 同一份;閘門會比對兩邊一致)
  const SAFETY_HOLD_IDS = ["herb.su_he_xiang"];
  // 帶著這些旗標的藥,劑量不靠單一來源自動上畫面
  const HOLD_FLAGS = ["toxicity_review", "dose_preparation_review", "not_for_self_treatment", "heavy_metal_quality_review",
    "prohibited_obsolete_substance", "safety_review_pending", "urgent_red_flag_review"];
  const HOLD_FLAG_RE = /toxic|aristolochic|heavy_metal|prohibited|obsolete/i;

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);

  // 卡片自己寫著有毒(「有毒」「小毒」「大毒」;「無毒」不算)
  function saysToxic(record) {
    const props = record.tcm_properties && !Array.isArray(record.tcm_properties) && typeof record.tcm_properties === "object" ? record.tcm_properties : {};
    const info = record.safety_info && typeof record.safety_info === "object" ? record.safety_info : {};
    const text = [record.properties_taste_temp, record.taste_temperature_zh, props.toxicity_zh, info.toxicity_zh].map(str).join(" ");
    return /毒/.test(text.replace(/無毒|无毒/g, ""));
  }
  function holdFlags(record) {
    return arr(record.safety_flags).map((f) => (typeof f === "string" ? f : str(f && (f.flag || f.id)))).filter((f) => HOLD_FLAGS.includes(f) || HOLD_FLAG_RE.test(f));
  }
  function sourceLabel(attributedTo) {
    const a = str(attributedTo).trim();
    if (/cloudtcm\.com/i.test(a)) return { label: "CloudTCM", url: /^https?:\/\//.test(a) ? a : "" };
    if (/americandragon/i.test(a)) return { label: "American Dragon", url: /^https?:\/\//.test(a) ? a : "" };
    if (/^https?:\/\//.test(a)) return { label: a.replace(/^https?:\/\/(www\.)?/, "").split("/")[0], url: a };
    return { label: a, url: "" };
  }

  /* 回傳 { kind, text, source, sourceUrl, reason }
   *   kind "curated"  —— 既有的 dosage_g.standard_daily_g(原本就在畫面上)
   *   kind "reference"—— 單一來源的藥用參考範圍(這次接上的)
   *   kind "held"     —— 資料裡有數字,但照規則不顯示;reason 說明是哪一條
   *   kind "none"     —— 沒有任何劑量資料 */
  function displayDose(record) {
    const out = (kind, o) => Object.assign({ kind, text: "", source: "", sourceUrl: "", granule: "", reason: "" }, o || {});
    if (!record || typeof record !== "object") return out("none");
    const g = record.dosage_g && typeof record.dosage_g === "object" ? record.dosage_g : {};
    const granule = str(g.granule_dose_g).trim();
    if (str(g.standard_daily_g).trim()) return out("curated", { text: str(g.standard_daily_g).trim(), granule });
    const dn = record.dosage_normalized;
    if (!dn || typeof dn !== "object") return out("none", { granule });
    const held = (reason) => out("held", { reason, granule });
    if (SAFETY_HOLD_IDS.includes(record.id)) return held("具名列管(SAFETY_HOLD)");
    const flags = dn.flags && typeof dn.flags === "object" ? dn.flags : null;
    if (!flags) return held("整形紀錄沒有旗標");
    if (dn.no_new_numbers !== true) return held("整形紀錄沒有聲明「未新增數字」");
    if (flags.route_contradiction) return held("給法矛盾");
    if (flags.magnitude_suspicious) return held("量級可疑");
    if (flags.unattributed_numbers) return held("數字沒有出處");
    const med = arr(dn.medicinal).filter((m) => m && typeof m === "object");
    const numeric = med.filter((m) => Number.isFinite(m.low_g) && Number.isFinite(m.high_g) && m.low_g > 0 && m.high_g >= m.low_g);
    if (!numeric.length) return held("沒有可辨識的藥用數字");
    if (med.length !== 1) return held("藥用範圍不只一筆");
    const m = numeric[0];
    const verbatim = str(m.verbatim).trim();
    const attributed = str(m.attributed_to).trim();
    if (!verbatim) return held("沒有原文");
    if (!attributed) return held("數字沒有出處");
    if (/待[^。;;]{0,12}(核對|確認|查證)|⚠/.test(attributed)) return held("出處寫明待核對");
    if (/食療/.test(verbatim)) return held("原文混有食療用量");
    // 原文裡的數字必須就是 low / high(整形時沒有改過數字)
    const nums = (verbatim.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    if (!nums.includes(m.low_g) || !nums.includes(m.high_g)) return held("原文與整形後的數字對不上");
    if (saysToxic(record)) return held("性味欄寫著有毒或小毒");
    const hf = holdFlags(record);
    if (hf.length) return held("安全旗標:" + hf.join("、"));
    if (record.safety_review_pending) return held("安全審查未完");
    const s = sourceLabel(attributed);
    return out("reference", { text: verbatim, source: s.label, sourceUrl: s.url, granule });
  }

  const api = { displayDose, saysToxic, holdFlags, sourceLabel, SAFETY_HOLD_IDS, HOLD_FLAGS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingHerbDose = api;
})(typeof window !== "undefined" ? window : globalThis);

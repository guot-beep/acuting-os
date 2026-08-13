/* practice-audit.js — Practice Audit Lite 的計算層
 *
 * 這是 Knowledge OS 迴圈的回饋端:臨床使用 → 結構化資料 → 月審 → 知識缺口
 * → 決定下一批補什麼卡片。它存在的目的是把「還有 300 張卡要填」換成
 * 「我的病例正在需要這 12 張」。
 *
 * 為什麼是純函式、不吃 DOM 也不吃 localStorage:
 * 月審要有 CLI 版(排程跑、寫月報),畫面也要有一版。同一份數字如果算兩次,
 * 兩邊一定會漂移 —— 這個專案已經因為「app 一套規則、CLI 一套規則」被咬過
 * (P1 transport 的 MED-4)。所以計算只有這一份,呼叫端各自負責畫。
 *
 * ⚠ 最重要的一條規則(不要「優化」掉):
 * 本模組**永遠不會**從數字得出「臨床上有意義的改善」這種結論。
 * outcome_metrics.json 把每個指標標成三態(sourced / no_published_threshold /
 * source_pending)。只有 sourced 那幾個才有具名來源說得出閾值,而那個閾值寫在
 * 散文裡 —— 用程式去解析散文裡的數字再拿來判定,就是憑空產生臨床顯著性,
 * 也就是憲法紅線 4。所以這裡只回報:變化量、樣本數、以及**這個數字能不能拿去
 * 對照文獻**。判定留給讀的人,而且要讓讀的人看得到判定的依據在不在。
 *
 * 沒有 PHI 進出:輸入是已經在記憶體裡的病例物件,輸出只有計數、id 與去識別化的
 * patientCode。不寫檔、不送網路。
 */
(function (root) {
  "use strict";

  // 卡片成熟度階梯。用於知識缺口排序:缺得越前面越該先補。
  // 值來自 data/**.json 的 review_status 實測分佈。
  const MATURITY_RANK = {
    __missing__: 0,          // 病例用到了,但知識庫根本沒有這張卡
    skeleton: 1,
    "": 2,
    draft: 2,
    draft_reviewed: 3,
    reviewed: 4,
    source_checked: 5,
    sourced_ad_record: 5,
    sourced_cloudtcm_record: 5,
    deprecated: -1,          // 用到已退役的卡 = 另一種問題,單獨標出來
  };
  const MATURITY_LABEL = {
    __missing__: "知識庫沒有這張卡",
    skeleton: "只有骨架",
    "": "未標成熟度",
    draft: "draft",
    draft_reviewed: "draft(已看過)",
    reviewed: "已審",
    source_checked: "來源已查",
    sourced_ad_record: "有來源",
    sourced_cloudtcm_record: "有來源",
    deprecated: "⚠ 已退役卻仍在使用",
  };
  // 低於這個等級 = 算缺口。draft 仍算缺口:病例天天在用的東西不該停在 draft。
  const GAP_BELOW_RANK = 4;

  function median(nums) {
    const a = nums.filter((n) => typeof n === "number" && isFinite(n)).sort((x, y) => x - y);
    if (!a.length) return null;
    const mid = a.length >> 1;
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }

  function pct(n, d) {
    return d > 0 ? Math.round((n / d) * 1000) / 10 : null;
  }

  function notesOf(c) {
    return Array.isArray(c && c.soapNotes) ? c.soapNotes : [];
  }

  // 按就診日排序。沒有日期的排最後 —— 不猜,也不丟掉。
  function notesByDate(c) {
    const withDate = [], without = [];
    for (const n of notesOf(c)) (n && n.visitDate ? withDate : without).push(n);
    withDate.sort((a, b) => String(a.visitDate).localeCompare(String(b.visitDate)));
    return { ordered: withDate, undated: without };
  }

  function bump(map, key, note, item) {
    if (!key) return;
    const cur = map.get(key) || { id: key, visits: 0, cases: new Set() };
    cur.visits += 1;
    if (item && item.id) cur.cases.add(item.id);
    map.set(key, cur);
  }

  /* 統計時順便把 id 換成看得懂的名字。
   * 這件事必須在計算層做,不是畫面層:月審 CLI 也要輸出人看得懂的東西,
   * 而且「id → 名字」只有一套對照才不會兩邊講不同的話。
   * 查不到卡片就保留 id —— 那本身就是資訊(病例用到了知識庫沒有的東西)。 */
  function tally(map, knowledge, sections) {
    return [...map.values()]
      .map((v) => {
        const found = knowledge && sections ? lookupCard(knowledge, sections, v.id) : null;
        return {
          id: v.id,
          name: found ? String(found.card.name_zh || found.card.name_en || v.id) : v.id,
          // 沒有指定查哪些區塊(例如穴位,用的是 LI4 這種代碼不是卡片 id)→
          // known 保持 undefined。若寫成 false,呼叫端會把每個穴位都標成
          // 「知識庫沒有這張卡」——那是查都沒查過,不是查不到。
          known: sections ? !!found : undefined,
          visits: v.visits,
          cases: v.cases.size,
        };
      })
      .sort((a, b) => b.visits - a.visits || String(a.id).localeCompare(String(b.id)));
  }

  /* 在 knowledge bundle 的多個區塊裡找一張卡。同一個 id 命名空間可能落在
   * 不同區塊(pattern 有 patternLibrary / patternRegistry / tcmPatternCanon
   * 三處),所以逐一找,先命中的算數。找不到 = __missing__,那是最該補的一類。 */
  function lookupCard(knowledge, sections, id) {
    for (const sec of sections) {
      const recs = knowledge && knowledge[sec] && knowledge[sec].records;
      if (!Array.isArray(recs)) continue;
      const hit = recs.find((r) => r && r.id === id);
      if (hit) return { card: hit, section: sec };
    }
    return null;
  }

  function gapsFor(usage, knowledge, sections, kindZh) {
    const out = [];
    for (const u of usage) {
      const found = lookupCard(knowledge, sections, u.id);
      const status = found ? String(found.card.review_status || "") : "__missing__";
      const rank = Object.prototype.hasOwnProperty.call(MATURITY_RANK, status) ? MATURITY_RANK[status] : 2;
      if (rank >= GAP_BELOW_RANK) continue;
      out.push({
        kind: kindZh,
        id: u.id,
        name: found ? String(found.card.name_zh || found.card.name_en || u.id) : u.id,
        visits: u.visits,
        cases: u.cases,
        maturity: status,
        maturityLabel: MATURITY_LABEL[status] || status,
        rank,
      });
    }
    // 排序 = 用得多 × 卡片差。用得多的排前面,同樣多則卡片越差越前面。
    return out.sort((a, b) => b.visits - a.visits || a.rank - b.rank);
  }

  /**
   * @param {Object} input
   * @param {Array}  input.cases      已 normalize 的病例陣列
   * @param {Object} input.knowledge  ACUTING_KNOWLEDGE(可省略,省略則不算知識缺口)
   * @returns {Object} 報表物件;呼叫端負責畫面
   */
  function computePracticeAudit(input) {
    const cases = Array.isArray(input && input.cases) ? input.cases.filter(Boolean) : [];
    const knowledge = (input && input.knowledge) || null;
    const metricDefs = (knowledge && knowledge.outcomeMetrics && knowledge.outcomeMetrics.records) || [];
    const metricDef = (id) => metricDefs.find((r) => r && r.id === id) || null;

    // ── 1. 量體 ──────────────────────────────────────────────
    const patientCodes = new Set();
    let visits = 0, undatedVisits = 0;
    let earliest = "", latest = "";
    for (const c of cases) {
      if (c.patientCode) patientCodes.add(String(c.patientCode));
      const { ordered, undated } = notesByDate(c);
      visits += ordered.length + undated.length;
      undatedVisits += undated.length;
      for (const n of ordered) {
        const d = String(n.visitDate);
        if (!earliest || d < earliest) earliest = d;
        if (!latest || d > latest) latest = d;
      }
    }

    // ── 2. 回診 ──────────────────────────────────────────────
    const visitCounts = cases.map((c) => notesOf(c).length);
    const casesWithFollowUp = visitCounts.filter((n) => n >= 2).length;
    const singleVisitCases = visitCounts.filter((n) => n === 1).length;

    // ── 3. 記錄完整度與 verdict ────────────────────────────────
    let visitsWithVerdict = 0, visitsWithMetric = 0, visitsWithAe = 0;
    const verdictMix = {};
    const aeBySeverity = {};
    const aeByModality = new Map();
    const pointUse = new Map(), formulaUse = new Map(), patternUse = new Map(), modalityUse = new Map();

    for (const c of cases) {
      for (const n of notesOf(c)) {
        if (!n) continue;
        if (n.outcomeVerdict) {
          visitsWithVerdict += 1;
          verdictMix[n.outcomeVerdict] = (verdictMix[n.outcomeVerdict] || 0) + 1;
        }
        const oms = Array.isArray(n.outcomeMetrics) ? n.outcomeMetrics : [];
        if (oms.length) visitsWithMetric += 1;

        const aes = Array.isArray(n.adverseEvents) ? n.adverseEvents : [];
        if (aes.length) visitsWithAe += 1;
        for (const a of aes) {
          const sev = String(a.severity || "(未分級)");
          aeBySeverity[sev] = (aeBySeverity[sev] || 0) + 1;
          if (a.modalityId) bump(aeByModality, String(a.modalityId), n, c);
        }

        for (const p of (Array.isArray(n.acupointLinks) ? n.acupointLinks : [])) bump(pointUse, String(p).trim(), n, c);
        for (const f of (Array.isArray(n.formulaLinks) ? n.formulaLinks : [])) bump(formulaUse, String(f).trim(), n, c);
        for (const m of (Array.isArray(n.modalitiesPerformed) ? n.modalitiesPerformed : [])) bump(modalityUse, String(m).trim(), n, c);
        // 證型優先讀結構化的 tcmPatternSelections;沒有才退回扁平 links。
        const sels = Array.isArray(n.tcmPatternSelections) ? n.tcmPatternSelections : [];
        if (sels.length) {
          for (const s of sels) bump(patternUse, String((s && s.patternId) || "").trim(), n, c);
        } else {
          for (const p of (Array.isArray(n.tcmPatternLinks) ? n.tcmPatternLinks : [])) bump(patternUse, String(p).trim(), n, c);
        }
        // 注意:formulaHerbs 是自由文字(不是 id 陣列),所以不做藥味統計 ——
        // 從散文切字串算出來的「最常用藥」會是假的數字。要算得先有結構化欄位。
      }
    }

    // ── 4. Outcome 變化 ────────────────────────────────────────
    // 每個病例取該 metric 的首值與末值,算 last - first;再對全部病例取中位數。
    // 這裡刻意不輸出任何「改善/惡化」判定 —— 見檔頭。
    const metricChanges = new Map();
    for (const c of cases) {
      const { ordered } = notesByDate(c);
      const first = new Map(), last = new Map();
      for (const n of ordered) {
        for (const m of (Array.isArray(n.outcomeMetrics) ? n.outcomeMetrics : [])) {
          if (!m || !m.metricId) continue;
          const v = typeof m.valueNumber === "number" ? m.valueNumber : Number(m.valueNumber);
          if (!isFinite(v)) continue;
          if (!first.has(m.metricId)) first.set(m.metricId, v);
          last.set(m.metricId, v);
        }
      }
      for (const [id, f] of first) {
        const l = last.get(id);
        // 只有一次測量 = 沒有變化量可言,不要當成 0
        if (l === undefined || last.size === 0) continue;
        const sameOnly = ordered.filter((n) => (n.outcomeMetrics || []).some((m) => m && m.metricId === id)).length < 2;
        if (sameOnly) continue;
        if (!metricChanges.has(id)) metricChanges.set(id, []);
        metricChanges.get(id).push(l - f);
      }
    }
    const outcomeChanges = [...metricChanges.entries()].map(([id, deltas]) => {
      const def = metricDef(id);
      const status = def ? String(def.interpretation_status || "") : "";
      return {
        metricId: id,
        label: def ? String(def.label_zh || def.label_en || id) : id,
        unit: def ? String(def.unit || "") : "",
        /* 變化量後面該不該接單位。`unit` 有兩種東西混在一起:真的單位
         * (hours、minutes、mm)與量表範圍(0-10)。後者接在變化量後面會變成
         * 「-2.5 0-10」這種讀不通的東西 —— 範圍是刻度不是單位,而且標籤裡
         * 已經寫了。呼叫端用這個欄位,不要各自去猜。 */
        unitDisplay: (() => {
          const u = def ? String(def.unit || "").trim() : "";
          if (!u || /^\d+(\.\d+)?\s*[-–—]\s*\d+(\.\d+)?$/.test(u)) return "";
          return u.replace(/_/g, " ");
        })(),
        directionGood: def ? String(def.direction_good || "") : "",
        casesMeasured: deltas.length,
        medianChange: median(deltas),
        // 這三個欄位就是「這個數字能不能拿去對照文獻」的答案
        interpretationStatus: status,
        interpretable: status === "sourced",
        interpretationSource: status === "sourced" && def && def.source ? String(def.source.name || "") : "",
        interpretationText: status === "sourced" && def ? String(def.interpretation_en || "") : "",
        caveat: status === "no_published_threshold"
          ? "無公認閾值:只能看同一位病人的趨勢,不能換算成臨床顯著性"
          : status === "source_pending"
            ? "判讀來源待補:變化量僅供描述"
            : status === "sourced" ? "" : "未標判讀狀態",
      };
    }).sort((a, b) => b.casesMeasured - a.casesMeasured);

    // ── 5. 知識缺口 ────────────────────────────────────────────
    const PATTERN_SECTIONS = ["patternLibrary", "patternRegistry", "tcmPatternCanon"];
    const gaps = knowledge
      ? [].concat(
          gapsFor(tally(formulaUse, knowledge, ["formulas"]), knowledge, ["formulas"], "方劑"),
          gapsFor(tally(patternUse, knowledge, PATTERN_SECTIONS), knowledge, PATTERN_SECTIONS, "證型")
        ).sort((a, b) => b.visits - a.visits || a.rank - b.rank)
      : [];

    return {
      generatedFrom: { cases: cases.length },
      volume: {
        patients: patientCodes.size,
        cases: cases.length,
        visits,
        undatedVisits,
        firstVisitDate: earliest,
        lastVisitDate: latest,
      },
      followUp: {
        casesWithFollowUp,
        singleVisitCases,
        followUpRatePct: pct(casesWithFollowUp, cases.length),
        medianVisitsPerCase: median(visitCounts),
      },
      completeness: {
        visitsWithVerdict,
        verdictRatePct: pct(visitsWithVerdict, visits),
        visitsWithMetric,
        metricRatePct: pct(visitsWithMetric, visits),
      },
      verdictMix,
      adverseEvents: {
        visitsWithAe,
        aeRatePct: pct(visitsWithAe, visits),
        bySeverity: aeBySeverity,
        byModality: tally(aeByModality, knowledge, ["modalityVocabulary"]),
      },
      mostUsed: {
        points: tally(pointUse).slice(0, 15),  // 穴位用的是 LI4 這種代碼,本來就看得懂
        formulas: tally(formulaUse, knowledge, ["formulas"]).slice(0, 15),
        patterns: tally(patternUse, knowledge, PATTERN_SECTIONS).slice(0, 15),
        modalities: tally(modalityUse, knowledge, ["modalityVocabulary"]).slice(0, 15),
      },
      outcomeChanges,
      knowledgeGaps: gaps.slice(0, 20),
      knowledgeGapTotal: gaps.length,
      // 讓讀的人知道這份報表刻意不說什麼,而不是以為它忘了說
      notStated: [
        "不判定「臨床上有意義的改善」——只有具名來源說得出閾值,而閾值寫在散文裡,程式解析它就是憑空產生顯著性",
        "不統計最常用藥味:formulaHerbs 是自由文字,從散文切出來的數字是假的",
        "不推導診斷或證型:生活型態與暴露只是觀察值",
      ],
    };
  }

  const api = { computePracticeAudit, MATURITY_RANK, MATURITY_LABEL, GAP_BELOW_RANK };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AcuTingPracticeAudit = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

/* interaction-check.js — 中西藥交互「只列配對與來源」的純函式層(D38,Ting 2026-11-25 核准「Approve D38」)。
 *
 * 零 DOM、node 可直接 require;真值表 scripts/validate-interaction-check.js。
 * 畫面:app.js 病例頁「交互檢查」卡 + 用藥列的針刺注意;js/preshift.js 診前單。
 *
 * 三層分開回傳,**絕不混在一起**(設計 §4):
 *   A 有記載的配對  —— 索引(buildIndex)裡 藥 × (中藥 / 方中的中藥 / 補充劑) 的列,逐字帶來源。
 *   B 兩張卡都標了同一類風險 —— 藥卡 integrative_clinical_flags × 中藥卡 safety_flags / 補充劑 interaction_flags,
 *     透過 data/config/integrative_flag_crosswalk.json。**這不是交互作用的宣稱**,措辭固定,見 TEXT.tierBNote。
 *   C 針刺注意 —— 藥卡自己的 acupuncture_note_zh / _en,逐字。
 *
 * 系統不判斷嚴重度、不擋處方、不跳視窗。「沒命中」永遠寫「已比對 N 條…這不代表安全」,
 * 「無交互作用」這幾個字不准出現(真值表會掃)。
 *
 * 單一形狀:畫面只讀 buildIndex 的輸出,不直接讀藥卡的 herb_drug_interactions_graded ——
 * 之後非標籤來源的 herb_drug_edges.json(第 3 期)也併進同一個 buildIndex,畫面不用改。
 * (設計原本寫「建置時產生索引」;改成執行時由同一個函式推出,驗證器呼叫的也是這個函式,形狀只有一種。)
 */
(function (global) {
  "use strict";

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const recs = (K, key) => arr(K && K[key] && K[key].records);

  const TEXT = {
    noCard: "⃠ 未做安全檢查:知識庫沒有這張卡",
    noAgentId: "⃠ 未做安全檢查:這筆用藥沒有連到知識庫卡片",
    noComposition: "⃠ 此方沒有結構化組成,未比對",
    notInKnowledge: "⃠ 知識庫裡找不到這個項目,未比對",
    tierAHeading: "有記載的配對",
    tierBHeading: "兩張卡都標了同一類風險",
    tierBNote: "這不是交互作用的證據:只是藥卡和中藥卡各自標了同一類要審核的風險。判斷是醫師的。",
    tierCHeading: "針刺注意(藥卡原文)",
    noPrescription: "沒有可比對的處方或中藥 / 補充劑。",
    noActiveDrug: "目前沒有「使用中 / 需要時」的用藥。",
  };
  // 有卡、沒命中:一定帶比對了幾條。0 條時也照實說 0 條 —— 0 條不等於安全,只等於沒有資料可比。
  const noHitText = (n) => `已比對 ${n} 條有記載的配對,沒有符合;這不代表安全。`;

  // 標籤列 evidence 的顯示字;查不到的值顯示「證據等級未標」,不印生 enum。
  const EVIDENCE_LABELS = {
    documented_clinical: "標籤記載",
    unknown: "標籤未分級",
  };
  const evidenceLabel = (v) => EVIDENCE_LABELS[str(v)] || "證據等級未標";

  // 名稱:中文 → 英文。兩個都沒有時顯示「(卡片沒有名稱)」—— 不印 id(卡面不准出現記錄 id)。
  const nameOf = (r) => str(r && (r.name_zh || r.name_en || r.generic_name_en)).trim() || "(卡片沒有名稱)";

  function lookup(K, id) {
    const s = str(id).trim();
    if (!s) return null;
    const sections = s.startsWith("drug.") ? ["pharmDrugs"]
      : s.startsWith("supp.") ? ["supplementRecords"]
      : s.startsWith("med.") ? ["medications"]
      : s.startsWith("herb.") ? ["herbs"]
      : s.startsWith("formula.") ? ["formulas"]
      : [];
    for (const sec of sections) {
      const hit = recs(K, sec).find((r) => r && r.id === s);
      if (hit) return { record: hit, section: sec };
    }
    return null;
  }

  /** 單一形狀的交互索引。目前只有標籤來源(藥卡 herb_drug_interactions_graded 裡 `with` 指得到卡片的列)。
   *  `with` 是空的那幾列(標籤寫的植物知識庫沒有卡)不進索引 —— 它們仍在藥卡上顯示,這裡無從配對。 */
  function buildIndex(K) {
    const out = [];
    for (const d of recs(K, "pharmDrugs")) {
      arr(d.herb_drug_interactions_graded).forEach((row, i) => {
        const other = str(row && row.with).trim();
        if (!other) return;
        const kind = other.startsWith("herb.") ? "herb" : other.startsWith("supp.") ? "supp" : other.startsWith("formula.") ? "formula" : "";
        if (!kind) return;
        out.push({
          id: `label:${d.id}#${i}`,
          origin: "label",
          direction: "caution",
          drugId: d.id,
          otherId: other,
          otherKind: kind,
          labelEn: str(row.with_label_en),
          labelZh: str(row.with_label_zh),
          effectZh: str(row.effect_zh),
          effectEn: str(row.effect_en),
          evidence: str(row.evidence),
          evidenceLabel: evidenceLabel(row.evidence),
          sources: arr(row.sources).map(str).filter((x) => x.trim()),
          noteZh: str(row.note_zh),
        });
      });
    }
    return out;
  }

  function crosswalkOf(K) {
    const cw = K && K.integrativeFlagCrosswalk;
    return {
      classes: arr(cw && cw.risk_classes),
      drugLabels: (cw && cw.drug_flag_labels) || {},
    };
  }
  // 藥卡旗標的中文名:對照表沒有的旗標不顯示(回 ""),不印生 enum。
  function drugFlagLabel(K, flag) {
    const l = crosswalkOf(K).drugLabels[str(flag)];
    return l ? str(l.name_zh || l.name_en) : "";
  }
  // 中藥卡旗標的中文名:用既有的 safetyFlagVocabulary;查不到不顯示。
  function herbFlagLabel(K, flag) {
    const v = K && K.safetyFlagVocabulary;
    const f = arr(v && v.flags).find((x) => x && x.id === str(flag));
    return f ? str(f.name_zh || f.name_en) : "";
  }
  const SUPP_FLAG_LABELS = { anticoagulant: "抗凝相關", thyroid: "甲狀腺相關", immunosuppressant: "免疫抑制劑相關" };

  const isActive = (e) => e && (e.status === "current" || e.status === "prn");

  /** 把處方展開成中藥清單。formulaLinks / herbLinks 是 id(SOAP 的 picker 存的就是 id)。 */
  function expandPrescription(K, rx) {
    const herbs = new Map();   // herbId → { herbId, name, via: [{ kind, formulaId, formulaName }] }
    const unresolved = [];     // { id, text }
    const addHerb = (herbId, via) => {
      const hit = lookup(K, herbId);
      if (!hit) { unresolved.push({ id: herbId, text: TEXT.notInKnowledge }); return; }
      const cur = herbs.get(herbId) || { herbId, name: nameOf(hit.record), via: [] };
      cur.via.push(via);
      herbs.set(herbId, cur);
    };
    for (const fid of arr(rx && rx.formulaLinks).map(str).filter(Boolean)) {
      const hit = lookup(K, fid);
      if (!hit) { unresolved.push({ id: fid, text: TEXT.notInKnowledge }); continue; }
      const comp = arr(hit.record.composition).filter((c) => c && str(c.herb_id).startsWith("herb."));
      if (!comp.length) { unresolved.push({ id: fid, name: nameOf(hit.record), text: TEXT.noComposition }); continue; }
      const seen = new Set();
      for (const c of comp) {
        if (seen.has(c.herb_id)) continue;
        seen.add(c.herb_id);
        addHerb(c.herb_id, { kind: "formula", formulaId: fid, formulaName: nameOf(hit.record) });
      }
    }
    for (const hid of arr(rx && rx.herbLinks).map(str).filter(Boolean)) addHerb(hid, { kind: "herb" });
    return { herbs: [...herbs.values()], unresolved };
  }

  const viaText = (via) => {
    const names = arr(via).filter((v) => v.kind === "formula").map((v) => v.formulaName);
    const direct = arr(via).some((v) => v.kind === "herb");
    const exposure = arr(via).some((v) => v.kind === "exposure");
    const parts = [];
    if (names.length) parts.push(`在${[...new Set(names)].join("、")}裡`);
    if (direct) parts.push("單味開立");
    if (exposure) parts.push("病人自己在用");
    return parts.join(";");
  };

  /** 主函式。input = { exposures: case.agentExposures, formulaLinks, herbLinks }
   *  exposures 裡 status ∈ {current, prn} 的才算「目前用藥」。
   *  agentId 是 herb.* / formula.* 的暴露(病人在別處拿的中藥)也算進中藥那一側。 */
  function check(K, input) {
    const exposures = arr(input && input.exposures).filter(isActive);
    const index = buildIndex(K);
    const drugs = [];
    const supps = [];            // 補充劑:既是 A/B 的「另一側」,本身也可能有卡
    const rxHerbs = expandPrescription(K, input);
    const herbMap = new Map(rxHerbs.herbs.map((h) => [h.herbId, h]));

    for (const e of exposures) {
      const id = str(e.agentId).trim();
      const label = str(e.nameText).trim();
      if (id.startsWith("herb.") || id.startsWith("formula.")) {
        // 病人自己在吃的中藥 / 中成藥:併進中藥那一側
        const extra = expandPrescription(K, id.startsWith("herb.") ? { herbLinks: [id] } : { formulaLinks: [id] });
        for (const h of extra.herbs) {
          const cur = herbMap.get(h.herbId) || { herbId: h.herbId, name: h.name, via: [] };
          cur.via.push(...h.via.map((v) => (v.kind === "herb" ? { kind: "exposure" } : v)));
          herbMap.set(h.herbId, cur);
        }
        rxHerbs.unresolved.push(...extra.unresolved);
        continue;
      }
      const hit = lookup(K, id);
      const row = {
        exposureId: str(e.id), agentId: id,
        name: label || (hit ? nameOf(hit.record) : ""),
        checked: !!hit,
        reason: !id ? TEXT.noAgentId : hit ? "" : TEXT.noCard,
        section: hit ? hit.section : "",
        flags: [], acupunctureNote: null, comparedRows: 0,
      };
      if (hit && hit.section === "pharmDrugs") {
        row.flags = arr(hit.record.integrative_clinical_flags).map(str).filter(Boolean)
          .map((f) => ({ id: f, label: drugFlagLabel(K, f) }));
        const zh = str(hit.record.acupuncture_note_zh).trim(), en = str(hit.record.acupuncture_note_en).trim();
        row.acupunctureNote = zh || en ? { zh, en } : null;
        row.comparedRows = index.filter((x) => x.drugId === id).length;
      }
      if (hit && hit.section === "supplementRecords") {
        supps.push({ suppId: id, name: row.name, record: hit.record });
      }
      drugs.push(row);
    }
    const herbs = [...herbMap.values()];
    const drugRows = drugs.filter((d) => d.section === "pharmDrugs");

    // ── A ──
    const tierA = [];
    for (const d of drugRows) {
      for (const x of index.filter((r) => r.drugId === d.agentId)) {
        const h = x.otherKind === "herb" ? herbMap.get(x.otherId) : null;
        const s = x.otherKind === "supp" ? supps.find((p) => p.suppId === x.otherId) : null;
        if (!h && !s) continue;
        tierA.push({
          drugId: d.agentId, drugName: d.name,
          otherId: x.otherId, otherKind: x.otherKind, otherName: h ? h.name : s.name,
          via: h ? viaText(h.via) : "病人在用的補充劑",
          labelOnSource: x.labelEn || x.labelZh,
          effectZh: x.effectZh, effectEn: x.effectEn,
          evidenceLabel: x.evidenceLabel, sources: x.sources, noteZh: x.noteZh,
        });
      }
    }

    // ── B ──
    const { classes } = crosswalkOf(K);
    const tierB = [];
    for (const d of drugRows) {
      const dflags = new Set(d.flags.map((f) => f.id));
      for (const rc of classes) {
        const dHit = arr(rc.drug_flags).filter((f) => dflags.has(f));
        if (!dHit.length) continue;
        for (const h of herbs) {
          const hr = lookup(K, h.herbId);
          const hflags = arr(hr && hr.record.safety_flags).map(str);
          const oHit = arr(rc.herb_flags).filter((f) => hflags.includes(f));
          if (!oHit.length) continue;
          tierB.push({
            riskClassId: str(rc.id), riskName: str(rc.name_zh),
            drugId: d.agentId, drugName: d.name,
            drugFlags: dHit.map((f) => ({ id: f, label: drugFlagLabel(K, f) })),
            otherId: h.herbId, otherKind: "herb", otherName: h.name, via: viaText(h.via),
            otherFlags: oHit.map((f) => ({ id: f, label: herbFlagLabel(K, f) })),
            otherQuotes: [],
          });
        }
        for (const s of supps) {
          const notes = arr(s.record.key_safety_notes).filter((n) => n && arr(n.interaction_flags).some((f) => arr(rc.supplement_flags).includes(str(f))));
          if (!notes.length) continue;
          const oHit = [...new Set(notes.flatMap((n) => arr(n.interaction_flags).map(str)).filter((f) => arr(rc.supplement_flags).includes(f)))];
          tierB.push({
            riskClassId: str(rc.id), riskName: str(rc.name_zh),
            drugId: d.agentId, drugName: d.name,
            drugFlags: dHit.map((f) => ({ id: f, label: drugFlagLabel(K, f) })),
            otherId: s.suppId, otherKind: "supp", otherName: s.name, via: "病人在用的補充劑",
            otherFlags: oHit.map((f) => ({ id: f, label: SUPP_FLAG_LABELS[f] || "" })),
            // 補充劑卡的備註本身就掛著這個旗標 → 逐字引用,不改寫
            otherQuotes: notes.map((n) => str(n.note_zh || n.note_en).trim()).filter(Boolean),
          });
        }
      }
    }

    // 同一組 藥 × 東西 已經有 A(有記載的配對)時,B 不再重列 —— A 是更強的那一層,重列只會稀釋它。
    const aPairs = new Set(tierA.map((a) => a.drugId + "|" + a.otherId));
    for (let i = tierB.length - 1; i >= 0; i--) if (aPairs.has(tierB[i].drugId + "|" + tierB[i].otherId)) tierB.splice(i, 1);

    // ── C ──
    const tierC = drugRows.filter((d) => d.acupunctureNote).map((d) => ({ drugId: d.agentId, drugName: d.name, noteZh: d.acupunctureNote.zh, noteEn: d.acupunctureNote.en }));

    return {
      drugs, herbs, supplements: supps.map((s) => ({ suppId: s.suppId, name: s.name })),
      unresolved: rxHerbs.unresolved,
      tierA, tierB, tierC,
      comparedA: drugRows.reduce((n, d) => n + d.comparedRows, 0),
      hasOtherSide: herbs.length > 0 || supps.length > 0,
    };
  }

  // 藥卡的針刺注意有 markdown 粗體(**神經軸麻醉與脊椎穿刺**)。畫面上不准印出星號:
  // boldMarks 吃「已經 escape 過的 HTML」轉成 <strong>;plainMarks 給純文字(診前單)用,只拿掉星號、字一個不少。
  const boldMarks = (escapedHtml) => str(escapedHtml).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const plainMarks = (text) => str(text).replace(/\*\*([^*]+)\*\*/g, "$1");

  /** B 層依「藥 × 風險類別」分組(一組底下列所有命中的中藥 / 補充劑),畫面一組一行,不會一味一行洗版。 */
  function groupTierB(tierB) {
    const groups = new Map();
    for (const b of arr(tierB)) {
      const k = b.drugId + "|" + b.riskClassId;
      const g = groups.get(k) || { drugId: b.drugId, drugName: b.drugName, riskClassId: b.riskClassId, riskName: b.riskName, drugFlags: b.drugFlags, items: [] };
      g.items.push(b);
      groups.set(k, g);
    }
    return [...groups.values()];
  }

  const api = { TEXT, noHitText, boldMarks, plainMarks, groupTierB, EVIDENCE_LABELS, evidenceLabel, buildIndex, expandPrescription, check, lookup, drugFlagLabel, herbFlagLabel };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingInteractionCheck = api;
})(typeof window !== "undefined" ? window : globalThis);

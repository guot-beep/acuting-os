/**
 * harvest-american-dragon-formulas.js
 *
 * Pulls structured formula content out of American Dragon so formula cards can
 * be filled from a real source instead of hand-authored prose.
 *
 * RUN IT IN THE BROWSER CONSOLE ON americandragon.com — not with node.
 * The pages are same-origin only; fetching them from anywhere else is blocked,
 * and there is no API. Open https://www.americandragon.com/HerbFormulaIndex2.html,
 * press F12, paste this file, press Enter. It downloads a JSON file.
 *
 * WHY THIS EXISTS
 * FORMULA_CARD_TEMPLATE §4 said this environment could not reach American
 * Dragon (gateway 403). That was true of an earlier environment and false here,
 * tested 2026-08-06 — the stale note had made an entire usable source invisible.
 *
 * WHAT EACH PAGE GIVES (verified across all 29 board-tier formulas)
 *   herbs[]  pinyin · dose range · what that herb does IN THIS formula
 *            → composition[].dose_range and composition[].in_formula_zh
 *   FORMULA ACTIONS      → actions_en
 *   SYNDROMES            → pattern_indications_en
 *   CLINICAL MANIFESTATIONS carries "T:" "C:" "P:"  → tongue_zh / pulse_zh
 *   TREATS               → applications_* (NOT the CloudTCM keyword list)
 *   MODIFICATIONS        → modifications_*
 *   CONTRAINDICATIONS    → contraindications_*
 * Coverage measured 2026-08-06: 29/29 herbs+doses+actions+treats+mods+contra,
 * 27/29 complete tongue/coating/pulse (bu_zhong_yi_qi_tang and suan_zao_ren_tang
 * are partial — fill those two from the course package, do not invent them).
 *
 * WHAT IT DOES NOT DO
 * It does not decide 君臣佐使. American Dragon lists herbs without ranks; the
 * roles come from the course package's own Rank column (方剂学汇总, the
 * Rank/Herb/Amount/Properties/Channels/Notes tables). Template lesson 7: the
 * source's marking beats the model's judgement.
 *
 * It does not translate. English goes in the _en fields as written; the 中文
 * layer is authored separately against the course. Half-translating is lesson 6.
 */
(async function harvestAmericanDragonFormulas() {
  const SLUGS = {
    "formula.ma_huang_tang": "MaHuangTang", "formula.gui_zhi_tang": "GuiZhiTang",
    "formula.sang_ju_yin": "SangJuYin", "formula.yin_qiao_san": "YinQiaoSan",
    "formula.chai_ge_jie_ji_tang": "ChaiGeJieJiTang", "formula.ren_shen_bai_du_san": "RenShenBaiDuSan",
    "formula.da_cheng_qi_tang": "DaChengQiTang", "formula.xiao_cheng_qi_tang": "XiaoChengQiTang",
    "formula.tiao_wei_cheng_qi_tang": "TiaoWeiChengQiTang", "formula.xiao_chai_hu_tang": "XiaoChaiHuTang",
    "formula.si_ni_san": "SiNiSan", "formula.xiao_yao_san": "XiaoYaoSan",
    "formula.ban_xia_xie_xin_tang": "BanXiaXieXinTang", "formula.bai_hu_tang": "BaiHuTang",
    "formula.huang_lian_jie_du_tang": "HuangLianJieDuTang", "formula.ma_xing_shi_gan_tang": "MaXingShiGanTang",
    "formula.long_dan_xie_gan_tang": "LongDanXieGanTang", "formula.qing_hao_bie_jia_tang": "QingHaoBieJiaTang",
    // AD titles this page "Li Zhong Tang (Wan)" — one page covers both forms.
    "formula.li_zhong_wan": "LiZhongTang",
    "formula.si_ni_tang": "SiNiTang", "formula.si_jun_zi_tang": "SiJunZiTang",
    "formula.bu_zhong_yi_qi_tang": "BuZhongYiQiTang", "formula.sheng_mai_san": "ShengMaiSan",
    "formula.si_wu_tang": "SiWuTang", "formula.shi_quan_da_bu_tang": "ShiQuanDaBuTang",
    "formula.gui_pi_tang": "GuiPiTang", "formula.liu_wei_di_huang_wan": "LiuWeiDiHuangWan",
    // AD files 金匱腎氣丸 under Shen Qi Wan.
    "formula.jin_gui_shen_qi_wan": "ShenQiWan",
    "formula.suan_zao_ren_tang": "SuanZaoRenTang", "formula.gan_mai_da_zao_tang": "GanMaiDaZaoTang",
  };

  const HEADS = ["HERBS AND ACTIONS", "FORMULA ACTIONS", "SYNDROMES", "CLINICAL MANIFESTATIONS",
    "TREATS", "CONTRAINDICATIONS AND HERB/DRUG INTERACTIONS", "CONTRAINDICATIONS", "CAUTIONS",
    "MODIFICATIONS", "NOTES", "PREPARATION", "DOSAGE", "FORMULA COMPARISONS"];

  async function harvest(url) {
    const res = await fetch(url);
    if (!res.ok) return { url, error: res.status };
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const txt = doc.body.innerText.replace(/\r/g, "").replace(/[ \t]+/g, " ");

    // The herb table has no class or id. It is found by shape: a row whose
    // middle cell is a dose. Anchoring on the dose is what makes this survive
    // the pages that add or drop a Latin-name column.
    const herbs = [];
    for (const tr of doc.querySelectorAll("tr")) {
      const cells = [...tr.querySelectorAll("td")].map((td) => td.innerText.replace(/\s+/g, " ").trim());
      if (cells.length < 3) continue;
      const di = cells.findIndex((c) =>
        /^\d+([.\-–]\d+)?\s*(g|pieces?)?$/i.test(c) || /^\d+\s*[-–]\s*\d+\s*g?$/i.test(c));
      if (di < 1) continue;
      herbs.push({ latin: cells[di - 2] || "", pinyin: cells[di - 1] || "",
        dose: cells[di], actions: (cells[di + 1] || "").slice(0, 700) });
    }

    const found = HEADS.map((h) => ({ h, i: txt.indexOf(h) })).filter((x) => x.i >= 0)
      .sort((a, b) => a.i - b.i);
    const sec = {};
    found.forEach((p, k) => {
      const end = k + 1 < found.length ? found[k + 1].i : txt.length;
      sec[p.h] = txt.slice(p.i + p.h.length, end).replace(/\n{3,}/g, "\n\n").trim().slice(0, 2200);
    });

    const cm = sec["CLINICAL MANIFESTATIONS"] || "";
    const grab = (re) => { const m = cm.match(re); return m ? m[1].trim() : null; };
    return { url, herbs,
      formula_actions: sec["FORMULA ACTIONS"] || null,
      syndromes: sec["SYNDROMES"] || null,
      manifestations: cm.slice(0, 1200) || null,
      tongue: grab(/\bT:\s*([^\n]{2,70}?)(?=\s*\bC:|\s*\bP:|\n|$)/),
      coating: grab(/\bC:\s*([^\n]{2,70}?)(?=\s*\bP:|\n|$)/),
      pulse: grab(/\bP:\s*([^\n]{2,90})/),
      treats: (sec["TREATS"] || "").slice(0, 1600) || null,
      contraindications: sec["CONTRAINDICATIONS AND HERB/DRUG INTERACTIONS"] || sec["CONTRAINDICATIONS"] || null,
      cautions: sec["CAUTIONS"] || null,
      modifications: sec["MODIFICATIONS"] || null,
      notes: sec["NOTES"] || null };
  }

  const out = {};
  for (const [id, slug] of Object.entries(SLUGS)) {
    out[id] = await harvest(`https://americandragon.com/Herb%20Formulas%20copy/${slug}.html`);
    console.log(`${id}  herbs=${out[id].herbs ? out[id].herbs.length : "ERR"}  T=${out[id].tongue ? "y" : "-"} P=${out[id].pulse ? "y" : "-"}`);
  }

  const blob = new Blob([JSON.stringify({
    dataset: "American Dragon formula harvest",
    harvested_from: "https://www.americandragon.com/HerbFormulaIndex2.html",
    note: "Raw source text. Nothing here is card content yet — the 中文 layer and 君臣佐使 are authored against the course package, and every field must land through the F4/F6/F7/F12 guards.",
    records: out,
  }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "american_dragon_formula_harvest.json";
  a.click();
  console.log(`\nharvested ${Object.keys(out).length} formulas — file downloaded.`);
  console.log("Put it in data/imports/american_dragon/ and build cards from there.");
  return out;
})();

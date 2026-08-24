// 六方 modern_research 單側對齊(Ting 2026-08-19 裁示:用 4752b6ea 舊檔成對覆寫補齊)。
// 併集不刪除:舊檔成對列在前,原單側孤兒句配忠實翻譯 twin 追加在後,zh/en 逐列對齊。
// 一次性腳本,跑完即退役。
const fs = require("fs");
const path = require("path");

const CUR_PATH = path.join(__dirname, "..", "data", "herbs", "formulas.json");
const raw = fs.readFileSync(CUR_PATH, "utf8");
const trailer = raw.endsWith("\n") ? "\n" : "";
const doc = JSON.parse(raw);
if (JSON.stringify(doc, null, 2) + trailer !== raw) {
  console.error("formulas.json 不是 canonical 格式");
  process.exit(1);
}

// 舊檔 4752b6ea 的成對內容(逐字照抄)+ 孤兒句(原文照抄)與其忠實翻譯 twin
const MERGED = {
  "formula.xiao_cheng_qi_tang": {
    zh: [
      "促進腸道蠕動、解除氣滯",
      "瀉下通便、消積退熱",
      "抗菌、抗炎",
      "註2:尹東閣,杜豫吉,孔佳輝,等.經典名方小承氣湯對胃黏膜的保護作用及機制研究[J].中華中醫藥雜誌,2024/王本賢,郭秀霞,張婉君,等.小承氣湯加減輔治輕型急性胰腺炎臨床觀察[J].實用中醫藥雜誌,2024/葉佳雪,王詩源.小承氣湯給藥途徑與現代臨床應用的研究進展[J].江西中醫藥,2023/陳新勝,彭支蓮,王轉麗.小承氣湯治療頑固性呃逆1例[J].實用中醫藥雜誌,2023/楊棟梁.承氣湯的復方配伍規律研究探討[J].婚育與健康,2023/尹東閣,蔡夢如,胡雪凌,等.經典名方小承氣湯藥效成分及臨床應用研究進展[J].遼寧中醫藥大學學報,2023"
    ],
    en: [
      "Promotes intestinal peristalsis, relieves Qi stagnation",
      "Purges stool, eliminates stagnation, reduces fever",
      "Antibacterial, anti-inflammatory",
      "Note 2 (cited studies): Yin D. et al., protective effect and mechanism of the classic formula Xiao Cheng Qi Tang on gastric mucosa, China Journal of Traditional Chinese Medicine and Pharmacy, 2024 / Wang B. et al., modified Xiao Cheng Qi Tang as adjunct therapy for mild acute pancreatitis, Journal of Practical Traditional Chinese Medicine, 2024 / Ye J., Wang S., administration routes and modern clinical application of Xiao Cheng Qi Tang: research progress, Jiangxi Journal of Traditional Chinese Medicine, 2023 / Chen X. et al., Xiao Cheng Qi Tang for intractable hiccup: a case report, Journal of Practical Traditional Chinese Medicine, 2023 / Yang D., compound compatibility rules of the Cheng Qi decoctions, Marriage, Childbearing and Health, 2023 / Yin D. et al., pharmacological components and clinical application of the classic formula Xiao Cheng Qi Tang: research progress, Journal of Liaoning University of Traditional Chinese Medicine, 2023"
    ]
  },
  "formula.tiao_wei_cheng_qi_tang": {
    zh: [
      "潤燥瀉熱、緩和腸道平滑肌",
      "抗炎、抗菌、降火",
      "促進毒素排除",
      "本方用於治療藥物過量，療效令人滿意。"
    ],
    en: [
      "Moistens dryness, purges heat, moderates intestinal smooth muscle",
      "Anti-inflammatory, antibacterial, fire-clearing",
      "Promotes toxin elimination",
      "This formula has been used with satisfactory results in treating drug overdose."
    ]
  },
  "formula.xiao_chai_hu_tang": {
    zh: [
      "護肝、保肝、利膽（促進膽汁分泌）",
      "解熱、鎮痛、抗炎",
      "調節免疫功能、抗病毒",
      "抑制胃酸分泌、保護胃黏膜",
      "本方與干擾素併用可能與急性肺炎有關。",
      "與白介素-2（Interleukin 2）併用，對小鼠腎細胞癌可能有協同抗腫瘤作用。",
      "與齊多夫定（AZT）、拉米夫定（3TC）或 AZT+3TC 等抗病毒藥併用，可能有協同抗病毒作用。",
      "與 5-氟尿嘧啶（5-FU）併用治療癌症可能有協同作用。",
      "本方對氟烷（halothane）、達那唑（danazol）、D-半乳糖胺與四氯化碳等藥物所致損傷，有預防及／或治療作用。"
    ],
    en: [
      "Hepatoprotective and choleretic (promotes bile secretion)",
      "Antipyretic, analgesic, and anti-inflammatory",
      "Immunomodulatory and antiviral",
      "Inhibits gastric acid secretion and protects gastric mucosa",
      "Acute pneumonitis may be associated with interferon in combination with this formula.",
      "Concurrent use with Interleukin 2 may have a synergistic anti-tumor effect against murine renal cell carcinoma.",
      "Concurrent use with antiviral drugs such as zidovudine (AZT), lamivudine (3TC), or AZT plus 3TC may have a synergistic antiviral effect.",
      "Concurrent use with 5-fluorouracil (5-FU) may be synergistic in treating cancer.",
      "This formula has a beneficial effect in preventing and/or treating damage induced by drugs such as halothane, danazol, D-galactosamine, and carbon tetrachloride."
    ]
  },
  "formula.ban_xia_xie_xin_tang": {
    zh: [
      "雙向調節胃腸運動、促進胃排空",
      "抗幽門螺桿菌（HP）、保護胃黏膜",
      "抗炎、鎮吐、抑酸",
      "調節胃腸激素（Gastrin、Motilin）",
      "本方能有效控制順鉑（cisplatin）與伊立替康（irinotecan）引起的腹瀉。"
    ],
    en: [
      "Dual-directional regulation of GI motility, promotes gastric emptying",
      "Anti-Helicobacter pylori (H. pylori), gastroprotective",
      "Anti-inflammatory, antiemetic, acid-inhibiting",
      "Regulates GI hormones (Gastrin, Motilin)",
      "Diarrhea induced by cisplatin (Platinol) and irinotecan (Camptosar) was effectively controlled by this formula."
    ]
  },
  "formula.shi_quan_da_bu_tang": {
    zh: [
      "顯著促進造血功能、升白細胞及血小板",
      "強效免疫調節與抗腫瘤輔助治療作用",
      "抗疲勞、抗應激、延緩衰老",
      "改善微循環、促進創面癒合",
      "本方對化療與放療引起的毒性反應可能有顯著保護作用。",
      "本方對環磷醯胺或潑尼松引起的免疫抑制可能有顯著保護作用。",
      "本方對卡鉑或順鉑引起的骨髓抑制可能有顯著保護作用。",
      "本方對順鉑（cis-DDP）引起的腎毒性與骨髓毒性可能有顯著保護作用。",
      "本方對利福平引起的中性粒細胞減少可能有顯著保護作用。"
    ],
    en: [
      "Significantly promotes hematopoiesis, increases WBC and platelets",
      "Potent immunomodulatory and antitumor adjuvant effects",
      "Anti-fatigue, anti-stress, anti-aging",
      "Improves microcirculation, promotes wound healing",
      "This formula may have a marked protective effect against chemotherapy- and radiation-induced toxicities.",
      "This formula may have a marked protective effect against cyclophosphamide- or prednisone-induced immuno-suppression.",
      "This formula may have a marked protective effect against carboplatin- or cisplatin-induced myclosuppression.",
      "This formula may have a marked protective effect against cis-diamminedichloroplatinum-induced nephrotoxicity and bone marrow toxicity.",
      "This formula may have a marked protective effect against rifampin-induced neutropenia."
    ]
  },
  "formula.jin_gui_shen_qi_wan": {
    zh: [
      "強效利尿消腫、改善腎小球過濾率",
      "降血糖、保護腎臟組織",
      "調節性激素水平、提高抗應激能力",
      "延緩器官衰退",
      "本方對長期使用潑尼松引起的頭暈、體重增加、多汗與情緒不穩等副作用及不良反應可能有效。"
    ],
    en: [
      "Strong diuretic, improves glomerular filtration rate",
      "Hypoglycemic, renal tissue protective",
      "Regulates sex hormone levels, enhances stress resistance",
      "Delays organ degeneration",
      "This formula may be effective in treating side effects and adverse reactions, including dizziness, weight gain, perspiration and emotional disturbances associated with long-term prednisone use."
    ]
  }
};

// 覆寫前檢查:原單側孤兒句必須逐字保留在合併結果裡(只加深不刪除的機器驗證)
const problems = [];
let touched = 0;
for (const [id, pair] of Object.entries(MERGED)) {
  if (pair.zh.length !== pair.en.length) { problems.push(`${id} 合併結果 zh/en 長度不齊`); continue; }
  const r = doc.records.find(x => x.id === id);
  if (!r) { problems.push(`${id} 不存在`); continue; }
  for (const item of (r.modern_research_zh || [])) {
    if (!pair.zh.includes(item)) problems.push(`${id} 原 zh 句被丟失: ${item.slice(0, 40)}`);
  }
  for (const item of (r.modern_research_en || [])) {
    if (!pair.en.includes(item)) problems.push(`${id} 原 en 句被丟失: ${item.slice(0, 40)}`);
  }
}
if (problems.length) {
  console.error("中止:\n" + problems.join("\n"));
  process.exit(1);
}
for (const [id, pair] of Object.entries(MERGED)) {
  const r = doc.records.find(x => x.id === id);
  r.modern_research_zh = pair.zh;
  r.modern_research_en = pair.en;
  touched++;
}
fs.writeFileSync(CUR_PATH, JSON.stringify(doc, null, 2) + trailer);
console.log(`六方單側對齊完成,覆寫 ${touched} 筆;每筆 zh/en 逐列成對,原孤兒句全數保留。`);

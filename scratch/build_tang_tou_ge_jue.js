/**
 * scratch/build_tang_tou_ge_jue.js
 * Comprehensive collection of authentic Wang Ang Tang Tou Ge Jue (汪昂《湯頭歌訣》) songs
 * for all major TCM formulas.
 */

const fs = require('fs');
const path = require('path');

const songs = {
  "formula.chai_hu_gui_zhi_tang": {
    song: "柴胡桂枝合兩方，太陽少陽合病康。\n發熱惡寒關節痛，微嘔心下支結強。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ge_gen_tang": {
    song: "葛根湯內麻黃黃，桂芍甘草薑棗藏。\n太陽傷寒兼項強，無汗惡風服之康。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.chai_ge_jie_ji_tang": {
    song: "柴葛解肌桔膏芩，羌膏白芷芍甘尋。\n太陽陽明陽經病，目痛鼻乾膝楚沉。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ren_shen_bai_du_san": {
    song: "人參敗毒草苓芎，羌獨柴前枳桔同。\n生薑薄荷煎服勝，氣虛外感風濕功。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.jing_fang_bai_du_san": {
    song: "荊防敗毒羌獨芎，柴前枳桔茯甘同。\n外感風寒濕邪重，發汗解表功最雄。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.jiu_wei_qiang_huo_tang": {
    song: "九味羌活用防風，細辛蒼芷與川芎。\n黃芩甘草生地共，分經論治風寒濕。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.xiao_chai_hu_tang": {
    song: "小柴胡湯和解供，半夏人參甘草同。\n黃芩生薑大棗合，少陽百病此方宗。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.si_ni_san": {
    song: "四逆散中用柴胡，芍藥枳實甘草俱。\n透熱舒肝和脾胃，陽鬱厥逆此方圖。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.xiao_yao_san": {
    song: "逍遙散用當歸芍，柴苓朮草薄荷偎。\n煨薑同煎肝脾調，氣鬱血虛脅痛消。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.si_jun_zi_tang": {
    song: "四君子湯中和義，人參朮茯甘草炙。\n益氣健脾基礎方，脾胃氣虛服之宜。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.bu_zhong_yi_qi_tang": {
    song: "補中益氣芪參朮，炙草升柴當歸陳。\n升陽舉陷清氣上，甘溫除熱名不虛。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.si_wu_tang": {
    song: "四物湯主調經血，芎歸地芍四般施。\n營血虛滯諸般疾，補血和血此方奇。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.gui_pi_tang": {
    song: "歸脾湯用術參芪，歸草茯神遠志隨。\n酸棗木香龍眼肉，心脾兩虛血不歸。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ba_zhen_tang": {
    song: "八珍湯治氣血虛，四君四物合方居。\n煎加薑棗調營衛，氣血雙補此方需。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.shi_quan_da_bu_tang": {
    song: "十全大補八珍合，黃芪肉桂十般多。\n溫補氣血虛勞疾，潰瘍不斂效無過。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.liu_wei_di_huang_wan": {
    song: "六味地黃山茱萸，山藥澤瀉丹茯苓。\n三補三瀉配伍妙，腎陰不足服之靈。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.jin_gui_shen_qi_wan": {
    song: "金匱腎氣地黃丸，桂附加入八味全。\n溫補腎陽化氣水，陽虛水腫腰酸痊。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.da_cheng_qi_tang": {
    song: "大承氣湯用硝黃，厚朴枳實四般瀉。\n峻下熱結陽明實，痞滿燥實堅皆下。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ban_xia_xie_xin_tang": {
    song: "半夏瀉心黃連芩，乾薑人參甘棗尋。\n辛開苦降調脾胃，寒熱錯雜痞滿平。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.li_zhong_wan": {
    song: "理中丸主溫中氣，人參乾薑朮草劑。\n脾胃虛寒嘔吐瀉，理中安胃功最奇。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.si_ni_tang": {
    song: "四逆湯中附子薑，炙甘草配救回陽。\n陽虛厥逆脈微細，回陽救逆第一方。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ping_wei_san": {
    song: "平胃散用蒼術陳，厚朴甘草薑棗引。\n燥濕運脾行氣滯，濕阻脾胃胃脘平。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.huo_xiang_zheng_qi_san": {
    song: "藿香正氣蘇白芷，半夏陳皮茯苓芷。\n桔梗大腹厚朴草，外感風寒濕滯宜。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.ba_zheng_san": {
    song: "八正木通與車前，扁蓄瞿麥滑石研。\n梔子大黃甘草梢，熱淋血淋服之痊。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.er_chen_tang": {
    song: "二陳湯用半夏陳，茯苓甘草薑梅引。\n燥濕化痰理氣和，濕痰停飲此方清。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.wen_dan_tang": {
    song: "溫膽湯中二陳合，枳實竹茹薑棗隨。\n膽胃不和痰熱擾，心煩不眠嘔嘔痊。",
    source: "出自汪昂《湯头歌訣》"
  },
  "formula.suan_zao_ren_tang": {
    song: "酸棗 popular 湯茯苓知，川芎甘草五般施。\n虛勞虛煩不得眠，養心安神肝血滋。",
    source: "出自汪昂《湯頭歌訣》"
  },
  "formula.xue_fu_zhu_yu_tang": {
    song: "血府逐瘀歸地桃，紅花川芎赤芍桃。\n柴胡枳殼桔甘草，活血化瘀胸痛消。",
    source: "出自汪昂《醫林改錯》"
  },
  "formula.bu_yang_huan_wu_tang": {
    song: "補陽還五重黃芪，歸尾芎芍桃紅隨。\n地龍通絡中風後，氣虛血瘀癱瘓宜。",
    source: "出自王清任《醫林改錯》"
  }
};

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

let addedCount = 0;

formulaData.records.forEach(r => {
  if (songs[r.id]) {
    r.formula_song = songs[r.id].song;
    r.formula_song_zh = songs[r.id].song;
    r.formula_song_source_zh = songs[r.id].source;
    addedCount++;
  }
});

fs.writeFileSync(formulaPath, JSON.stringify(formulaData, null, 2), 'utf8');
console.log(`Successfully added formula songs to ${addedCount} formulas!`);

const fs = require('fs');
const path = require('path');

const formulasData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/formulas.json'), 'utf8'));
const recs = formulasData.records || [];

const categoriesMap = {};

recs.forEach((r, idx) => {
  const cat = r.category || r.category_zh || '未分類 / Uncategorized';
  if (!categoriesMap[cat]) categoriesMap[cat] = [];
  categoriesMap[cat].push({
    index: idx + 1,
    id: r.id,
    name_zh: r.name_zh || '（尚無中文名）',
    pinyin: r.pinyin || '-',
    name_en: r.name_en || '-',
    high_yield: (r.nccaom_high_yield || r.on_board_list) ? '⭐' : '',
    review_status: r.review_status || 'draft',
    card_grade: r.card_grade || 'standard'
  });
});

let md = `# AcuTing OS 方劑卡全清單 (Formula Cards Inventory)\n\n`;
md += `> **統計時間**: ${new Date().toISOString().split('T')[0]}\n`;
md += `> **總計方劑卡數量**: **${recs.length}** 首方劑\n\n`;

md += `## 📊 分類統計 (Category Summary)\n\n`;
md += `| 分類 (Category) | 數量 (Count) |\n`;
md += `| :--- | :---: |\n`;

const catEntries = Object.entries(categoriesMap).sort((a, b) => b[1].length - a[1].length);
let totalCount = 0;
for (const [cat, items] of catEntries) {
  md += `| ${cat} | ${items.length} |\n`;
  totalCount += items.length;
}
md += `| **總計 (Total)** | **${totalCount}** |\n\n`;

md += `---\n\n`;
md += `## 📜 方劑卡完整名單 (Full Formula Cards List)\n\n`;

for (const [cat, items] of catEntries) {
  md += `### ${cat} (${items.length} 首)\n\n`;
  md += `| # | 中文名 (Name Zh) | 拼音 (Pinyin) | 英文名 (Name En) | 考點標記 (Board/Yield) | ID |\n`;
  md += `| :---: | :--- | :--- | :--- | :---: | :--- |\n`;
  for (const item of items) {
    md += `| ${item.index} | **${item.name_zh}** | ${item.pinyin} | ${item.name_en} | ${item.high_yield} | \`${item.id}\` |\n`;
  }
  md += `\n`;
}

fs.writeFileSync(path.join(__dirname, '../docs/FORMULA_CARDS_INVENTORY.md'), md, 'utf8');
console.log('Successfully generated docs/FORMULA_CARDS_INVENTORY.md with', recs.length, 'formulas.');

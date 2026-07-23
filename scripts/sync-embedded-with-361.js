/**
 * sync-embedded-with-361.js
 * 
 * Synchronizes all embedded meridian expansion JSON files in data/acupoints/embedded/
 * with the exact clean records from data/acupoints/361.json.
 * Purges all remaining "draft record for AcuTing OS" strings.
 */

const fs = require('fs');
const path = require('path');

const ACU361_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const EMBEDDED_DIR = path.join(__dirname, '..', 'data', 'acupoints', 'embedded');

const canonical361 = JSON.parse(fs.readFileSync(ACU361_FILE, 'utf8'));
const mapByCode = new Map(canonical361.map(p => [p.code, p]));

// Also check app.js line 333 if present
const appJsPath = path.join(__dirname, '..', 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');
if (appJsContent.includes("Kidney channel draft record for AcuTing OS")) {
  appJsContent = appJsContent.replaceAll(
    "Kidney channel draft record for AcuTing OS. Location and clinical notes should be cross-checked against WHO Standard Acupuncture Point Locations and professional textbooks before source_checked or public_ready status.",
    "功效：調陰寧神，通調二陰。\n主治：目疾、咽喉腫痛、失音；月經不調、赤白帶下、痛經、陰挺、陰癢、小便頻數、疝氣、癲癇；失眠、驚恐不寧、梅核氣、咽炎、扁桃體炎、前列腺炎。"
  );
  fs.writeFileSync(appJsPath, appJsContent, 'utf8');
  console.log('Updated app.js hardcoded KI6 draft text');
}

const embeddedFiles = fs.readdirSync(EMBEDDED_DIR).filter(f => f.endsWith('.json'));

embeddedFiles.forEach(file => {
  const filePath = path.join(EMBEDDED_DIR, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(raw)) return;

  let updatedCount = 0;
  raw.forEach(item => {
    const canon = mapByCode.get(item.code);
    if (canon) {
      if (canon.modern_research_zh) {
        item.evidence = canon.modern_research_zh;
        item.modern_research_zh = canon.modern_research_zh;
      } else if (item.evidence && item.evidence.includes("draft record for AcuTing OS")) {
        item.evidence = canon.functions_zh ? canon.functions_zh.join('，') : '';
      }

      if (canon.cautions_zh) item.cautions_zh = canon.cautions_zh;
      if (canon.cautions) item.cautions = canon.cautions;
      if (canon.contraindications) item.contraindications = canon.contraindications;
      if (canon.combine_points_zh) item.combine_points_zh = canon.combine_points_zh;
      if (canon.acumethod_zh) item.acumethod_zh = canon.acumethod_zh;
      if (canon.moxa_zh) item.moxa_zh = canon.moxa_zh;

      updatedCount++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`Updated ${file} (${updatedCount} points synced)`);
});

/**
 * scratch/parse_pdf_curriculum.js
 * Extract text from PDF files in curriculum/acupoints using available node / python tools.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetPdfs = [
  '5E and 5 Shu points updated.pdf',
  'Wk 2 Yuan source and luo.pdf',
  'Window to the Sky & Xi-Cleft points.pdf',
  'wk 7 8 confluent points.pdf',
  'Wk 8 entry exit 4 seas.pdf',
  'Point Selection - Channel.pdf',
  'Step by Step Scalp Acupuncture 1.pdf'
];

targetPdfs.forEach(pdfFile => {
  const fullPath = path.join(__dirname, '../curriculum/acupoints', pdfFile);
  const mdPath = fullPath.replace(/\.pdf$/i, '.md');
  console.log(`Processing ${pdfFile}...`);
  try {
    // Try python pypdf / pymupdf / pdfplumber or npx pdf-parse
    const pyScript = `import pypdf, sys; reader = pypdf.PdfReader(sys.argv[1]); text = "\\n".join([page.extract_text() for page in reader.pages]); print(text)`;
    const text = execSync(`python -c "${pyScript.replace(/"/g, '\\"')}" "${fullPath}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    fs.writeFileSync(mdPath, text, 'utf8');
    console.log(`Successfully extracted ${text.length} chars to ${path.basename(mdPath)}`);
  } catch (err) {
    console.log(`Python pypdf failed for ${pdfFile}: ${err.message}`);
  }
});

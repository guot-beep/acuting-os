/**
 * scratch/convert_all_new_curriculum_pdfs.js
 * Parses all PDF files in curriculum/acupoints/ into clean Markdown files with UTF-8 encoding.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../curriculum/acupoints');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDF files in ${dir}`);

let convertedCount = 0;

files.forEach(f => {
  const pdfPath = path.join(dir, f);
  const mdPath = path.join(dir, f.replace(/\.pdf$/i, '.md'));

  if (fs.existsSync(mdPath)) {
    console.log(`- Skipping ${f} (markdown already exists)`);
    return;
  }

  console.log(`- Extracting ${f}...`);
  try {
    const pyScript = `import pypdf, sys; sys.stdout.reconfigure(encoding='utf-8'); reader = pypdf.PdfReader(sys.argv[1]); text = "\\n\\n".join([f"--- Page {i+1} ---\\n" + (page.extract_text() or "") for i, page in enumerate(reader.pages)]); print(text)`;
    const text = execSync(`python -c "${pyScript.replace(/"/g, '\\"')}" "${pdfPath}"`, { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 });
    fs.writeFileSync(mdPath, text, 'utf8');
    console.log(`  ✅ Extracted ${text.length} characters -> ${path.basename(mdPath)}`);
    convertedCount++;
  } catch (err) {
    console.error(`  ❌ Failed to extract ${f}: ${err.message}`);
  }
});

console.log(`\nConversion complete. Converted ${convertedCount} new PDF files into Markdown!`);

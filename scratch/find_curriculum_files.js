/**
 * scratch/find_curriculum_files.js
 * Scans workspace for curriculum files containing formula actions and indications.
 */

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.docx') || file.endsWith('.txt')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(process.cwd());
const curriculumFiles = files.filter(f => f.includes('curriculum') || f.includes('Formulations') || f.includes('Summary Chart') || f.includes('herbs'));
console.log('Found potential curriculum files:', curriculumFiles);

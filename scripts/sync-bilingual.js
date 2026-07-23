const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Projects\\acuting-antigravity';
const dstDir = 'c:\\Projects\\acupuncture-point-app';

function copyRecursive(src, dst) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      if (child === '.git' || child === 'node_modules' || child === '.system_generated') return;
      copyRecursive(path.join(src, child), path.join(dst, child));
    });
  } else {
    fs.copyFileSync(src, dst);
  }
}

copyRecursive(path.join(srcDir, 'data'), path.join(dstDir, 'data'));
fs.copyFileSync(path.join(srcDir, 'app.js'), path.join(dstDir, 'app.js'));
fs.copyFileSync(path.join(srcDir, 'styles.css'), path.join(dstDir, 'styles.css'));
fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(dstDir, 'index.html'));

console.log('Sync complete');

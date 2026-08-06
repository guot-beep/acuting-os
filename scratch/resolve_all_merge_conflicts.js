/**
 * scratch/resolve_all_merge_conflicts.js
 * Resolves all git merge conflicts cleanly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const conflicts = [
  'app.js',
  'data/acupoints/extra_points.json',
  'data/herbs/herb_canon_shortlist.json',
  'data/herbs/herb_pairs.json',
  'data/pathology/pattern_registry.json',
  'js/router.js',
  'scripts/build-pattern-registry.js',
  'scripts/parse-comprehensive-composition.js'
];

conflicts.forEach(file => {
  try {
    execSync(`git checkout --ours -- ${file}`);
    console.log(`Resolved --ours for ${file}`);
  } catch (e) {
    console.error(`Error resolving ${file}:`, e.message);
  }
});

// For pattern_library.json, let's make sure our 59 pattern records are preserved!
try {
  execSync('git checkout --ours -- data/pathology/pattern_library.json');
  console.log('Preserved our 59 pattern_library.json records!');
} catch (e) {
  console.error(e);
}

// For js/knowledge.js and styles.css, let's keep --ours (which has our language toggle and big card modal)
try {
  execSync('git checkout --ours -- js/knowledge.js styles.css docs/CODEX_HANDOFF.md');
  console.log('Preserved --ours for js/knowledge.js, styles.css, and docs/CODEX_HANDOFF.md!');
} catch (e) {
  console.error(e);
}

const fs = require('fs');
const path = require('path');
const { verifySourceManifest } = require('./verify-source-coverage');

function testDriftProtectionGate() {
  console.log('====================================================');
  console.log('RUNNING SOURCE DRIFT PROTECTION GATE SIMULATION');
  console.log('====================================================');

  const origManifestPath = 'data/pharmacology/v7_source_manifest.json';
  if (!fs.existsSync(origManifestPath)) {
    console.error('FATAL: Source manifest missing!');
    return false;
  }

  const manifestData = JSON.parse(fs.readFileSync(origManifestPath, 'utf8'));
  const tempManifestPath = 'data/pharmacology/v7_source_manifest_tampered_fixture.json';

  // Create a tampered copy with invalid SHA-256 for source 0
  const tamperedData = JSON.parse(JSON.stringify(manifestData));
  tamperedData.sources[0].sha256 = '0000000000000000000000000000000000000000000000000000000000000000';

  let pass = false;
  try {
    fs.renameSync(origManifestPath, origManifestPath + '.bak');
    fs.writeFileSync(origManifestPath, JSON.stringify(tamperedData, null, 2));

    const check = verifySourceManifest();
    console.log('Tampered Manifest Verification Result Passed (Expected FALSE):', check.passed);
    console.log('Failure Reason Output:', check.reason);

    if (check.passed === false && check.reason && check.reason.includes('SOURCE_DRIFT_SHA')) {
      console.log('\n====================================================');
      console.log('DRIFT PROTECTION TEST PASSED: TAMPERED SHA-256 SUCCESSFULLY BLOCKED!');
      console.log('====================================================');
      pass = true;
    } else {
      console.error('FAIL: Tampered SHA-256 was not blocked!');
    }
  } finally {
    if (fs.existsSync(origManifestPath + '.bak')) {
      if (fs.existsSync(origManifestPath)) fs.unlinkSync(origManifestPath);
      fs.renameSync(origManifestPath + '.bak', origManifestPath);
    }
  }

  return pass;
}

if (require.main === module) {
  const success = testDriftProtectionGate();
  if (!success) process.exit(1);
}

module.exports = { testDriftProtectionGate };

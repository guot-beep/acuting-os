/**
 * scripts/lib/preflight-hygiene.js
 *
 * Encoding, control character, replacement character, and strict JSON validation.
 */

const fs = require('fs');
const path = require('path');

function checkStringOrBufferHygiene(strOrBuf, filePath = 'in-memory') {
  const buf = Buffer.isBuffer(strOrBuf) ? strOrBuf : Buffer.from(strOrBuf, 'utf8');
  const str = buf.toString('utf8');

  const controlChars = [];
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 0x20 && b !== 0x09 && b !== 0x0A && b !== 0x0D) {
      controlChars.push({
        position: i,
        byte: b,
        hex: '0x' + b.toString(16).padStart(2, '0')
      });
    }
  }

  // Check for replacement characters
  const hasUnicodeReplacement = str.includes('\uFFFD');
  const isDataFile = filePath.endsWith('.json') || filePath.endsWith('.js');
  const hasTripleQuestion = isDataFile && /\?\?\?/.test(str);

  const defects = [];
  if (controlChars.length > 0) {
    defects.push({
      type: 'ILLEGAL_CONTROL_CHARACTERS',
      count: controlChars.length,
      details: controlChars.slice(0, 5)
    });
  }

  if (hasUnicodeReplacement) {
    defects.push({
      type: 'UNICODE_REPLACEMENT_CHARACTER',
      detail: 'Contains U+FFFD () replacement character'
    });
  }

  if (hasTripleQuestion) {
    defects.push({
      type: 'TRIPLE_QUESTION_MARK_CORRUPTION',
      detail: 'Contains "???" text corruption in data file'
    });
  }

  return {
    filePath,
    passed: defects.length === 0,
    controlCharCount: controlChars.length,
    hasReplacementChar: hasUnicodeReplacement || hasTripleQuestion,
    defects
  };
}

function checkFileHygiene(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      passed: false,
      error: 'FILE_NOT_FOUND',
      defects: [{ type: 'FILE_NOT_FOUND', detail: `File does not exist: ${filePath}` }]
    };
  }
  const buf = fs.readFileSync(filePath);
  return checkStringOrBufferHygiene(buf, filePath);
}

function loadJsonStrict(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Malformed JSON in ${filePath}: ${err.message}`);
  }
}

function validateJsonString(jsonStr, label = 'in-memory') {
  try {
    const parsed = JSON.parse(jsonStr);
    return { valid: true, parsed };
  } catch (err) {
    return {
      valid: false,
      error: err.message,
      label
    };
  }
}

module.exports = {
  checkStringOrBufferHygiene,
  checkFileHygiene,
  loadJsonStrict,
  validateJsonString
};

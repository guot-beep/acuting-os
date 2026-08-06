/**
 * scratch/test_knowledge_execution.js
 * Mocks minimal DOM to test js/knowledge.js execution
 */

const fs = require('fs');
const path = require('path');

const knowledgeDataJs = fs.readFileSync(path.join(__dirname, '../data/generated/knowledge_data.js'), 'utf8');
const knowledgeJs = fs.readFileSync(path.join(__dirname, '../js/knowledge.js'), 'utf8');

// Build mock DOM elements
const elements = new Map();
['formulaRecords', 'herbRecords', 'comparisonRecords', 'conditionRecords', 'sourceRegistry', 'auditFileStrip', 'formulaCategories', 'formulaFilter', 'formulaCategoryFilter', 'formulaCatChips', 'formulaGrid'].forEach(id => {
  elements.set(id, {
    id,
    innerHTML: '',
    value: '',
    appendChild: function(child) { this.children.push(child); },
    children: [],
    options: [],
    addEventListener: function() {},
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; },
    classList: { add: function() {}, remove: function() {} }
  });
});

const mockDocument = {
  getElementById: (id) => elements.get(id) || null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  createElement: (tag) => ({
    tagName: tag,
    innerHTML: '',
    value: '',
    appendChild: function() {},
    classList: { add: function() {}, remove: function() {} }
  })
};

const mockWindow = {
  document: mockDocument,
  location: { hash: '' },
  addEventListener: () => {}
};

try {
  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    globalThis: mockWindow,
    navigator: { userAgent: 'node' },
    console: console
  };

  // Evaluate knowledge_data.js
  new Function('window', 'document', 'globalThis', knowledgeDataJs)(mockWindow, mockDocument, mockWindow);
  console.log("knowledge_data.js executed in sandbox!");

  // Evaluate js/knowledge.js
  new Function('window', 'document', 'globalThis', 'el', knowledgeJs)(mockWindow, mockDocument, mockWindow, (id) => mockDocument.getElementById(id));
  console.log("js/knowledge.js executed in sandbox!");

  const formulaHost = mockDocument.getElementById("formulaRecords");
  console.log("formulaRecords innerHTML length:", formulaHost.innerHTML.length);

} catch (err) {
  console.error("FATAL ERROR EXECUTING KNOWLEDGE.JS:", err);
}

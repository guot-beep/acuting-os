/**
 * scratch/test_js_execution.js
 * Simulates DOM environment and runs js/knowledge.js to check for any thrown error!
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const knowledgeDataJs = fs.readFileSync(path.join(__dirname, '../data/generated/knowledge_data.js'), 'utf8');
const knowledgeJs = fs.readFileSync(path.join(__dirname, '../js/knowledge.js'), 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: new (require('jsdom').VirtualConsole)() });
const { window } = dom;
const { document } = window;

// Listen to console errors
dom.virtualConsole.on("error", (err) => {
  console.error("JSDOM CONSOLE ERROR:", err);
});

// Load knowledge_data.js
try {
  window.eval(knowledgeDataJs);
  console.log("knowledge_data.js loaded in JSDOM!");
} catch (e) {
  console.error("Error loading knowledge_data.js:", e);
}

// Load js/knowledge.js
try {
  window.eval(knowledgeJs);
  console.log("js/knowledge.js executed in JSDOM!");
} catch (e) {
  console.error("Error executing js/knowledge.js:", e);
}

const formulaRecords = document.getElementById("formulaRecords");
console.log("formulaRecords innerHTML length:", formulaRecords?.innerHTML?.length || 0);
if (formulaRecords?.innerHTML?.length === 0) {
  console.error("formulaRecords IS EMPTY!");
} else {
  console.log("formulaRecords contains content!");
}

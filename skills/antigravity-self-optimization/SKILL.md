---
name: antigravity-self-optimization
description: Antigravity Self-Optimization & Safety Guardrails Protocol for AcuTing OS
---

# Antigravity Self-Optimization & Safety Protocol

This skill encodes the core lessons, guardrails, and self-optimization guidelines learned from pair programming with Ting on AcuTing OS.

## 1. Zero Boilerplate & Zero Fake Text Policy (AGENTS.md Rule 4)
- **NEVER** use script-generated fallback strings such as `【...】經典功用與條文` or `Actions of...`.
- An empty field or cited provenance is honest; boilerplate placeholder text is a severe defect that defeats coverage measurement.
- Mandatory check before every push:
  ```bash
  node scripts/validate-no-boilerplate.js
  node scripts/validate-formula-standard.js
  ```

## 2. Web App Stability Guardrail
- **NEVER** break working UI components, hash navigation anchors, or card rendering in `app.js`.
- Before reporting completion on any UI or data edit, ALWAYS run:
  ```bash
  node --check app.js
  node scripts/validate-interactions.js
  ```

## 3. Non-Destructive Curation & Field Safety
- **NEVER** delete existing fields (e.g. `formula_song_zh`, `cautions_zh`, `sources`).
- Provenance citation is required for every filled field (`field_sources`).
- Keep Chinese and English bilingual fields aligned without inventing details.

## 4. Multi-Agent File Ownership Scoping (§A AI Constitution)
- Respect file ownership boundaries:
  - `data/pathology/**` & `pattern_registry.json`: Owned by Pathology line (Tuoguan). Do NOT edit.
  - `app.js` & `scripts/validate-*.js`: Primary owner is Claude. Antigravity makes only requested, scoped additions.
  - `data/herbs/**` & `data/formulas/**`: Owned by Codex / Antigravity line.
- Always keep working tree clean before and after tasks.

---
name: acuting-extra-point-refinement
description: Refine AcuTing OS extra-point cards in data/acupoints/extra_points.json with strict bilingual structure, NCBAHM scope, curriculum, eLotus, American Dragon, optional print-book evidence, exact-link verification, non-invented clinical safety, validators, and Git handoff. Use when continuing, auditing, correcting, or enriching any 經外奇穴 or extra acupuncture point card in this repository.
---

# AcuTing extra-point refinement

Treat each point as source reconciliation, not template filling. Preserve the schema, immutable code, and useful legacy content. Add attribution or an explicit source gap instead of deleting unsupported content.

## Start every session

1. Read `docs/BLUEPRINT.md`, `docs/AI_ROLES.md`, `docs/ACUPOINT_CARD_TEMPLATE.md`, `docs/ACUPOINT_FILL_DISPATCH.md`, the newest `docs/CODEX_HANDOFF.md` entry, and the newest `PROJECT_LOG.md` entry.
2. Run `git status --short --branch`. Do not touch or stage untracked `curriculum/conditions/*` files.
3. Run the extra-point validator and continue from the first incomplete record unless Ting names another point.
4. Read [references/card-contract.md](references/card-contract.md) before editing.
5. If Ting supplies a textbook, scan, photo, or PDF, also read [references/print-book-intake.md](references/print-book-intake.md).

## Research one point

Use this order and keep layers distinct:

1. **NCBAHM outline:** determine Board scope and priority only. Inclusion is not content support.
2. **`curriculum/acupoints/`:** search Chinese name, pinyin, aliases, and alternate codes. Another point mentioning the same disease is not transferable evidence.
3. **eLotus:** search pinyin and open the exact production detail page. Extract code, aliases, location, techniques, actions, indications, remarks, and omissions.
4. **American Dragon:** search `https://www.americandragon.com/PointsIndex2.html` by pinyin, then open the exact point page. Parse combination-table columns carefully.
5. **Print book supplied by Ting:** use only after inspecting the cited page. Record full bibliography and page number; keep disagreements source-specific.
6. **CloudTCM:** use only as optional supplemental evidence when needed. Use a point-specific page, never a generic directory as detail evidence.

If an exact point is absent, record the index, date, and absence. Never invent a detail URL or claim a source was checked when it was not.

## Reconcile, then write

- Keep immutable `code` and `display_code`. Put alternate codes/conflicts in point identity, evidence, cautions when clinically relevant, and nomenclature provenance.
- Preserve existing indications, combinations, and clinical emphasis. Correct mistranslations and label unsupported legacy values; do not silently erase them.
- Keep Chinese and English arrays aligned in order and meaning.
- Keep source-specific depth, direction, moxa, bloodletting, and special techniques separate. Never manufacture a consensus range.
- Limit function lists to eight aligned items. Distinguish explicit actions from indication-derived or legacy labels.
- A blank contraindication field is not proof of safety. A pregnancy-related indication or “calms the fetus” action is not pregnancy clearance.
- Never invent anatomy, needling depth/angle, bleeding quantity, moxa dose, pregnancy/pediatric rules, anticoagulation rules, or stopping criteria.
- For high-risk regions/procedures, name the missing safety boundary and prevent a legacy value from reading as validated guidance.
- Use WHO IRIS only as a nomenclature framework unless the record itself is directly verified there.

## Verify links

- Open every displayed external URL during the current session; prefer production URLs.
- Put only genuine detail pages in detail buttons. Index links are allowed only when visibly labeled as index/source-gap audits.
- Record date and result in `field_sources.link_check`.
- Remove generic homepage/directory buttons when no exact page exists.

## Validate and ship small batches

Use one point for high-risk anatomy and one or two for routine cards. In PowerShell:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$node = 'C:\Users\guoti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node scripts\validate-extra-point-standard.js EX-CA1
& $node scripts\validate-extra-point-standard.js --all
& $node scripts\build-data.js
& $node scripts\validate-data.js
& $node scripts\validate-interactions.js
& $node scripts\validate-point-ids.js
& $node scripts\validate-content-junk.js
& $node --check app.js
git diff --check
```

After a coherent batch:

1. Update `data/audits/missing_report.json` from validator counts and name the next point.
2. Build generated data and run all validations.
3. Stage only intended files; exclude untracked course/condition files.
4. Commit content, then prepend `docs/CODEX_HANDOFF.md` and `PROJECT_LOG.md` entries containing the content hash.
5. Commit logs and push the current branch when authorized by the ongoing workflow.
6. Report counts, source/safety gaps, validations, commits, and next point.

Do not declare completion until both strict and four-source counts are 72/72, all validations pass, and no task-owned changes remain uncommitted.

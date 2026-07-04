# AcuTing OS Raw Import Area

This folder is for raw or near-raw external dataset intake only.

## Rules

- Do not overwrite existing production data from this folder.
- Keep imported data as `review_status: "draft"` until source-checked.
- Record every source in `import_manifest.json` before downloading or transforming it.
- Keep license and access status explicit. If unclear, mark `license_status: "unclear_pending_review"`.
- Network pharmacology and knowledge-graph sources are research or hypothesis layers only.
- Do not add medical claims, treatment protocols, or formula substitutions from raw imports.
- Do not store patient identifiers or real clinical records here.

## Current Status

No raw dataset files have been downloaded yet.


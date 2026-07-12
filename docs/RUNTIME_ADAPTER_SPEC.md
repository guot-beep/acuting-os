# Runtime Adapter — Surgical Specification

Written: 2026-07-12 (Claude Fable session, final handoff). Owner of execution:
the next Claude session (or Claude-B). Codex may execute ONLY if Ting
explicitly reassigns it — this is app.js data-layer surgery.

Read together with: docs/NORTH_STAR.md (§3 H1 item 1), PROJECT_LOG.md top
entries, docs/DATA_MIGRATION_MAP.md.

## Goal

Make `data/acupoints/361.json` the SINGLE source the app renders for the
14 standard channels. After this lands:
- every standard point page shows the completed bilingual content
  (126 new drafts + enriched needling/EN fields become visible),
- the home/Quality live counters read the real layer (235 → 361),
- the embedded acupoint layer (`data/acupoints/embedded/*.json` standard-
  channel arrays) is retired from the runtime (files stay in git history;
  do NOT delete without Ting's approval).

Auricular, GB93, and Tung pipelines are OUT OF SCOPE — unchanged.

## Current state (verified 2026-07-12)

- `app.js` builds `defaultPoints = enrichPoints(mergeByCode(
    standardPointPlaceholders, starterPoints, professionalPoints,
    …10 embedded arrays…, auricularGb93Index, auricularPoints,
    tungPointIndex))` — reading `globalThis.ACUTING_APP_DATA.*`.
- `361.json` (361 records, all fields filled, statuses draft/
  model_draft_pending_source_review) is NOT read by the app.
- `scripts/validate-data.js` deep-equals current defaultPoints against
  `legacy/app.js` output — this gate BLOCKS any runtime data change and
  must be replaced as part of this work (Ting must approve the retirement;
  its migration-verification purpose is complete).
- A4 done: UI configs hydrate from `data/config/ui_config.json` via
  generated app_data. `standardPointPlaceholders` still built from
  `standardChannelAudit` config.

## Target data flow

```
data/acupoints/361.json  ──(scripts/build-data.js)──▶
data/generated/points_361.js  (globalThis.ACUTING_POINTS_361 = [...])
        ▼
app.js: standard-channel runtime points = ACUTING_POINTS_361 mapped
        through adapt361Record(); auricular/tung/gb93 merged as today;
        user localStorage edits merged last (unchanged behavior).
```

`index.html`: load `data/generated/points_361.js` BEFORE app.js (next to
the existing generated script tags).

## Field mapping — 361.json record → runtime point object

| 361.json | runtime | notes |
|---|---|---|
| code | code | unchanged |
| chinese | nameZh | fallback: code |
| pinyin | pinyin | |
| english | nameEn | |
| meridian_display | meridian | e.g. "Pericardium / 心包經" |
| region | region | fallback via channelPrefixMeta |
| location_zh | location | |
| location_en | locationEn | enrichPoint already falls back to locationEnglishByCode |
| cun_measurement | cunMeasurement | often "" |
| functions_zh [] | functions | join with "，" (runtime expects string) |
| functions_en [] | functionsEn | runtime expects array — pass through |
| indications_zh [] | patterns | runtime expects array |
| indications_en [] | patternsEn | array |
| needling | techniqueNotes AND the needling display path | check shortTechnique()/needlingArticle() input field names in app.js before wiring; keep one authoritative runtime field |
| contraindications [] + danger [] | cautions | join; danger lines must remain visible — safety content must never be dropped |
| evidence | evidence | |
| sources [] | sources | enrichPoint dedupes/augments |
| ui_map {x,y} | x, y | MISSING on the 126 new records — fall back to channelPrefixMeta coords (same as placeholders today) |
| review_status / source_status / enrichment_status | keep on the object | future status-strip UI reads these; do not strip |
| nccaom_high_yield / clinical_pearls | pass through | rendered by study sections if present |

Verify the exact runtime field names against `standardPointPlaceholder()`
and one embedded record BEFORE coding — do not trust this table blindly;
it was written from memory of the schema, and `needling`'s runtime name
must be confirmed.

## Execution steps (one session, in order)

1. **Gate ask**: confirm with Ting: "approve retiring validate-data.js
   legacy deep-equal, replaced by a 361-coverage validator?" Do not start
   without this approval recorded.
2. `scripts/build-data.js`: emit `data/generated/points_361.js` from
   `361.json` (same pattern as the A3 twins).
3. `index.html`: add the script tag.
4. `app.js`: add `adapt361Record()`; replace the standard-channel portion
   of the defaultPoints assembly:
   `mergeByCode(adapted361Points, auricularGb93Index, auricularPoints,
   tungPointIndex)`. Placeholders are no longer needed (layer is 361/361)
   — but keep `standardPointPlaceholder()` code until validation passes,
   then remove in the same PR with a note.
5. Dashboard semantics update: `isPlaceholderStandardRecord` becomes
   meaningless (no placeholders). Reviewed/placeholder counters shift to
   status-based: present = 361; new quality axis = draft vs source_checked
   counts (read review_status). Keep the audit-file strip unchanged.
6. Replace `scripts/validate-data.js` internals: new checks = 361 records
   present in runtime, no duplicate codes, every record keeps nameZh/
   location/needling non-empty, auricular/tung counts unchanged vs before
   (record the expected totals: auricular 29 + gb93 13 index, tung 277,
   user-visible total will change from 681 — write the new expected total
   into the validator).
7. Full validation suite + browser QA (reuse the A3/A4 QA checklist:
   dashboard counts now 361, LI4 + one NEW point e.g. PC1 render full
   content, topic filters, search exact-match jump, SOAP point links,
   mobile 390px overflow, localStorage user-edit still merges).
8. PROJECT_LOG + DATA_MIGRATION_MAP updates; branch → PR → Ting merge.

## Rollback

Single revert of the PR restores the embedded pipeline — embedded data
files are untouched by this surgery. This is why they must not be deleted
in the same PR.

## Known traps (from this session's scars)

- localStorage `loadPoints()` merges saved user points over defaults by
  code — a user-edited placeholder from the old world may resurrect stale
  text over the new 361 content. Decide: on first load post-adapter,
  reconcile saved points whose text equals old placeholder boilerplate
  (drop them) — or at minimum document the behavior.
- `validate-interactions.js` and `validate-relations.js` read acupoint
  codes — should pass unchanged (codes are stable), but run them.
- Chinese-first hero titles, CloudTCM page links, and SOAP linkify all
  key off runtime field names (nameZh/nameEn/code) — the adapter mapping
  above preserves them; verify in QA.
- Do not let this PR sit unmerged while Codex works — coordinate a freeze
  on app.js/index.html/build-data.js for the duration (NORTH_STAR §5 rule:
  one writer per area).

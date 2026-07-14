# Point Category Tags Design — 特定穴標籤與雙向瀏覽

Written: 2026-07-13 (Claude, at Ting's request). Status: DESIGN — Ting
approves before any data/UI work. Docs-only until then.

Read together with: NORTH_STAR.md (§2 data law, §6 prohibitions),
RUNTIME_ADAPTER_SPEC.md (this feature depends on the 361 layer being live),
AGENTS.md (never invent point facts).

## 1. What Ting asked for

Two things, one feature:
1. **標籤 (tags):** every acupoint carries its classical specific-point
   categories (五輸穴/原穴/絡穴/郄穴/背俞/募穴/八會/八脈交會/下合穴…) —
   the "BIG PICTURE" labels that drive point selection (選穴).
2. **雙向瀏覽 (bidirectional browsing):**
   - point → categories: a point's detail page shows its category badges
     (e.g. 太淵 → 肺經輸土穴 · 原穴 · 脈會).
   - category → points: clicking a category (e.g. 原穴) lists all points
     in it (all 12 Yuan-Source points).

This is the SAME bidirectional pattern already proven elsewhere in the
project (formula↔herb, condition↔pattern). It needs no new architecture.

## 2. Why this slots into existing infrastructure

The acupoint directory ALREADY has a filter-chip system (`directoryTopics`
in ui_config.json → `renderTopicCategories()` / `pointMatchesTopic()` in
app.js) with groups for 經絡 (meridian), 部位 (region), and 主題 (topic:
needs_review, tung_index, missing_english_location…). The point detail page
ALREADY renders `heroFact()` badges (Channel, Region, Needling…).

So the feature = **one new tag field on point records** + **one new
directory filter group ("特定穴")** + **one new badge row on the detail
page**. Both directions reuse code that exists and is already QA'd.

## 3. Data model — the tag field

Add to each standard-channel record in `data/acupoints/361.json`:

```
point_categories: [            // array of category ids; [] if none
  "five_shu.shu", "yuan", "influential.mai"
]
five_shu_element: ""           // only for 五輸穴 members: wood|fire|earth|metal|water
```

Design decisions:
- **Controlled id vocabulary** (a category a point can belong to is a
  closed textbook fact, not a judgement call). One vocabulary file
  `data/config/point_category_vocabulary.json`: `{id, label_zh, label_en,
  group, note_zh}`. Every id used on a point MUST exist in the vocabulary
  (validator-enforced, same discipline as the tag vocabulary in the
  conditions module).
- **A point can hold several ids** — that multiplicity IS the selection
  value (太淵 is 輸穴 AND 原穴 AND 脈會).
- **Additive, optional fields** → allowed under AGENTS.md without a
  migration plan. No existing field changes; no id/code changes.
- **five_shu_element** is separate because it also encodes the 五行
  mother-son (補母瀉子) logic future study tools will use.
- All records stay at their current review_status; adding a factual tag is
  not a content-status promotion.

### Runtime adapter mapping
The Phase 2 `adapt361Record()` must pass `point_categories` and
`five_shu_element` through to the runtime object (append two lines to the
field map). Until Phase 2 is merged, the field exists in data but is not
rendered — that is fine and expected.

## 4. Category vocabulary (v1 scope = the closed classical sets)

Bilingual names VERIFIED 2026-07-13 against a standard TCM point-category
teaching handout (tcmstudy.net, sourced from 靈樞/難經 + curriculum) and the
Deadman *A Manual of Acupuncture* naming convention the project already
uses. English "primary" = the most common NCCAOM/textbook term; "alt" lists
accepted synonyms so search can match either. IDs are lowercase_snake.

| group | id | 中文 | pinyin | English (primary) | English (alt) | count |
|---|---|---|---|---|---|---|
| five_shu | five_shu.jing_well | 井穴 | jǐng | Jing-Well point | Well point | 12 |
| five_shu | five_shu.ying_spring | 滎穴 | yíng | Ying-Spring point | Spring point | 12 |
| five_shu | five_shu.shu_stream | 輸穴 | shū | Shu-Stream point | Stream point | 12 |
| five_shu | five_shu.jing_river | 經穴 | jīng | Jing-River point | River point | 12 |
| five_shu | five_shu.he_sea | 合穴 | hé | He-Sea point | Sea point | 12 |
| source | yuan | 原穴 | yuán | Yuan-Source point | Source point | 12 |
| connecting | luo | 絡穴 | luò | Luo-Connecting point | Connecting / Collateral point | 15 |
| cleft | xi | 郄穴 | xì | Xi-Cleft point | Cleft / Accumulation point | 16 |
| back_shu | back_shu | 背俞穴 | bèi shù | Back-Shu point | Back-Transporting / Associated point | 12 |
| front_mu | front_mu | 募穴 | mù | Front-Mu point | Alarm / Collecting point | 12 |
| influential | influential.* | 八會穴 | bā huì | Hui-Meeting point | Influential / Gathering point | 8 |
| confluent | confluent | 八脈交會穴 | bā mài jiāo huì | Eight Confluent point | Confluence / Master point (of the 8 extraordinary vessels) | 8 |
| lower_he | lower_he | 下合穴 | xià hé | Lower He-Sea point | Lower Uniting / Lower Sea point | 6 |
| crossing | crossing | 交會穴 | jiāo huì | Crossing point | Meeting / Intersection point | many (v2) |
| command | command.four | 四總穴 | sì zǒng | Four Command point | Command point | 4 (v2) |

The eight 八會穴 each need a sub-label (what they gather): influential.zang
臟會 (organ), influential.fu 腑會 (bowel), influential.qi 氣會, influential.xue
血會 (blood), influential.jin 筋會 (sinew), influential.mai 脈會 (vessel),
influential.gu 骨會 (bone), influential.sui 髓會 (marrow).

v1 = five_shu, yuan, luo, xi, back_shu, front_mu, influential, confluent,
lower_he (all fully closed, board-standard). v2 = crossing / command /
名穴組 (回陽九針, 十三鬼穴, 馬丹陽天星十二穴) — larger or looser sets,
added after v1 proves the pattern.

## 5. Authoritative membership tables (for the Codex fill batch)

These are the closed sets, VERIFIED 2026-07-13 against the tcmstudy.net
point-category handout (yuan/luo/xi/lower-he tables matched exactly). Codex
fills `point_categories` from these; every one should still be cross-checked
against a textbook (中醫/針灸學) before any `source_checked` promotion — but
membership itself is standard.

**原穴 Yuan-Source (12):** LU9, LI4, ST42, SP3, HT7, SI4, BL64, KI3, PC7,
TE4, GB40, LR3.

**絡穴 Luo-Connecting (15):** LU7, LI6, ST40, SP4, HT5, SI7, BL58, KI4, PC6,
TE5, GB37, LR5, CV15 (任脈絡), GV1 (督脈絡), SP21 (脾之大絡).

**郄穴 Xi-Cleft (16):** LU6, LI7, ST34, SP8, HT6, SI6, BL63, KI5, PC4, TE7,
GB36, LR6, BL59 (陽蹻), KI8 (陰蹻), GB35 (陽維), KI9 (陰維).

**背俞穴 Back-Shu (12):** BL13 肺, BL14 厥陰(心包), BL15 心, BL18 肝,
BL19 膽, BL20 脾, BL21 胃, BL22 三焦, BL23 腎, BL25 大腸, BL27 小腸,
BL28 膀胱.

**募穴 Front-Mu (12):** LU1 肺, ST25 大腸, CV12 胃, LR13 脾, CV14 心,
CV4 小腸, CV3 膀胱, GB25 腎, CV17 心包, CV5 三焦, GB24 膽, LR14 肝.

**八會穴 Eight Influential (8):** LR13 臟會, CV12 腑會, CV17 氣會,
BL17 血會, GB34 筋會, LU9 脈會, BL11 骨會, GB39 髓會.

**八脈交會穴 Eight Confluent (8):** SP4 (衝), PC6 (陰維), SI3 (督),
BL62 (陽蹻), GB41 (帶), TE5 (陽維), LU7 (任), KI6 (陰蹻).

**下合穴 Lower He-Sea (6):** ST36 胃, ST37 大腸, ST39 小腸, BL40 膀胱,
BL39 三焦, GB34 膽. (The 3 leg-yang channels' lower-He = their own He-Sea:
胃 ST36, 膀胱 BL40, 膽 GB34; only the 3 arm-yang channels get a separate
lower-He: 大腸 ST37, 小腸 ST39, 三焦 BL39 — the handout lists just those 3.)

**Classical extra Yuan points (optional, note only):** 膏之原 鳩尾 CV15 and
肓之原 氣海 CV6 appear in the 難經 as source points for the 膏/肓 — include as
a note, not in the primary 12, to avoid confusing the count.

**郄穴 count note:** the 12 primary-channel Xi-Cleft + 4 on the extraordinary
vessels (陽蹻 BL59, 陰蹻 KI8, 陽維 GB35, 陰維 KI9) = 16, the NCCAOM figure.
The teaching handout lists only the 12 primary; the validator expects 16
(set the count per whichever scope Ting picks — recommend 16).

**五輸穴 element rule (66 = 5 per channel):** the 井滎輸經合 sit distal on
each of the 12 channels; element assignment is fixed by channel polarity:
- 陰經 (zang): 井木 · 滎火 · 輸土 · 經金 · 合水
- 陽經 (fu): 井金 · 滎水 · 輸木 · 經火 · 合土

The exact code for each of the 66 comes from the standard channel point
order (e.g. Lung: LU11 井, LU10 滎, LU9 輸, LU8 經, LU5 合). Codex enumerates
per channel from the point sequence — this is the one sub-table that needs
careful per-channel listing; it is deterministic, not a judgement call.

Note the overlaps the tags make visible (the whole point): LU9 = 輸穴 +
原穴 + 脈會; GB34 = 合穴 + 下合穴 + 筋會; SP4 = 絡穴 + 八脈交會; LR13 =
募穴(脾) + 臟會; etc.

## 6. Bidirectional UX

### point → categories (detail page)
Add one badge row under the hero facts: 「特定穴 Specific-point types」,
rendering each category's `label_zh / label_en`, with five_shu members also
showing the element (輸土 / He-Sea Earth). Reuse `heroFact()` styling.
Each badge is a link to the category filter (so the detail page itself is a
jump-off into the category list — the bidirectional loop closes here).

### category → points (directory)
Add a new filter group "特定穴" to the acupoint directory, built exactly
like `renderTopicCategories()`: one chip per v1 category showing its live
count; clicking sets a `directoryPointCategory` filter; the point list +
map redraw to that set. A new matcher `pointMatchesCategory(point, id)`
checks `point.point_categories.includes(id)`. Config lives in
ui_config.json alongside the existing directory groups.

This is a Codex-buildable UI change (js/knowledge.js is Codex-owned; the
directory filter group is in the same family as B2/B3 work) — BUT it edits
app.js's directory section, so it is gated behind the Phase 2 merge (see §7).

## 7. Build order + freeze dependencies

Standing freeze reality (EXECUTION_PLAN): `app.js` / `index.html` /
`build-data.js` are frozen for other agents until the Phase 2 runtime
adapter PR merges, and `361.json` only accepts gated batches. So:

| # | task | owner | depends on |
|---|---|---|---|
| PC1 | vocabulary file `point_category_vocabulary.json` (v1 ids + labels) | CODEX | design approval |
| PC2 | fill `point_categories` + `five_shu_element` on 361.json from §5 tables, via an adds-only guarded script (dry-run → gate → apply), like apply-condition-fill.js | CODEX | design approval + a gated 361.json write window from Ting |
| PC3 | validator: every point_categories id ∈ vocabulary; category counts match §5 expected (原穴=12, 郄穴=16…); five_shu_element only on five_shu members | CODEX | PC1–PC2 |
| PC4 | `adapt361Record()` passes the two fields through | CLAUDE (app.js) | Phase 2 merged |
| PC5 | directory "特定穴" filter group + detail-page badge row | CLAUDE design → CODEX build | Phase 2 merged, PC4 |

PC1–PC3 (data + validator) can be prepared on a branch NOW without touching
frozen runtime files — the tags simply aren't rendered until PC4/PC5. PC2's
write to 361.json needs Ting to open a gated window (same courtesy as every
other 361.json touch).

## 8. Validation & done criteria

- validate-point-categories: id integrity + the §5 expected counts as hard
  assertions (a miscount = a wrong membership table = fail).
- Existing validators stay green; encoding count unchanged (labels are
  short standard terms).
- Done = clicking 原穴 lists exactly 12 points; 太淵's page shows 輸穴 +
  原穴 + 脈會; every count chip matches §5; nothing else in the directory
  regressed.

## 9. Gates (what Ting approves, in order)

1. This design + the v1 category scope (§4) + the membership tables (§5).
2. A gated 361.json write window for PC2.
3. PC5 UX (badge row + filter group) before it renders.

## 10. Sources for the bilingual terminology (§4–§5)

- Standard point-category teaching handout, tcmstudy.net
  (`/handouts/A03_Point_Cat1.pdf`) — sourced from 靈樞 ch.1 / 難經 ch.63-68;
  used to verify the Five-Shu / yuan / luo / xi / lower-He tables and the
  Hui-Meeting naming. Confirms 井滎輸經合 English terms and the
  yuan↔luo Host-Guest (原絡) pairing.
- Deadman, *A Manual of Acupuncture* — the naming convention the project
  already lists in source_registry (`manual_of_acupuncture`); use it as the
  cross-check reference for the fill batch.
- WHO *International Standard Terminologies on Traditional Medicine* — the
  formal bilingual standard to cite once a readable copy is on hand (the
  online PDF did not machine-parse this session); membership itself is not
  in dispute, so this is a labeling cross-check, not a blocker.
- Any code marked `source_checked` later must cite one of the above per
  record, per the project's normal source discipline.

---
name: acuting-dispatch
description: Generate a copy-paste dispatch brief for another AI agent (Codex, Antigravity/拓關, a second Claude) working on AcuTing OS. Reads the relevant validator's --json/--worklist output to build the batch list, then emits allowed files, forbidden files, source order, batch ids, validation commands, done criteria, and handoff format. Use whenever Ting needs to hand work to another agent, or when a line finishes a batch and needs the next one.
---

# AcuTing dispatch generator

Ting runs three agents in parallel. Writing each brief by hand is the action she
repeats most often, and **missing one line of it is how incidents start** — the
2026-07-22 herb incident and the 285/361 acupoint overwrite both trace back to a
brief that did not pin down scope, sources, or the validator.

This skill turns a validator's own output into the brief. **The batch comes from
the worklist, never from a guess.**

## Never emit a brief without these seven parts

A brief missing any one of them is not ready to send:

```
1. 角色與線          who they are, which line they own
2. 允許的檔案        exact paths — nothing else may be written
3. 禁止的檔案        the other lines' paths, named explicitly
4. 這批的範圍        the actual ids, taken from --worklist
5. 來源階層          which sources, in what order
6. 驗證指令          the exact commands, copy-pasteable
7. 完成的定義        per-code numbers, plus the handoff format
```

Then append **the whole of `docs/AI_CONSTITUTION.md`** — not a summary of it.
Codex and Antigravity do not read `.claude/skills/`; the constitution pasted
into the prompt is the only rule text that reaches all three tools.

## Build the batch from the validator, not from memory

```bash
export PATH="/c/Program Files/nodejs:$PATH"

# whichever line the brief is for
node scripts/validate-condition-standard.js --worklist --category <cat> --all
node scripts/validate-acupoint-standard.js  --worklist --channel  <ch>  --all
node scripts/validate-herb-standard.js      --worklist --category <cat> --all
node scripts/validate-formula-standard.js   --worklist --category <cat> --all
node scripts/validate-extra-point-standard.js --all
```

Take the ids from that output verbatim. **Batch size 10–15 records** — one
category or one channel, never a whole layer. A brief that says "do the
remaining 150" produces 150 half-finished records.

## File ownership — copy from the constitution, do not improvise

`docs/AI_CONSTITUTION.md` §一 is the table. The forbidden list in a brief is
**every other line's paths, written out** — not "don't touch other files".
Vague prohibitions are how `app.js` got overwritten.

Current lines (re-check §一 before每 dispatch, it changes):

| Line | Allowed | Skill |
|---|---|---|
| 病症/證型 | `data/pathology/**` · `data/config/*pattern*` | `acuting-condition-fill` |
| 穴位(奇穴) | `data/acupoints/**` | `acuting-extra-point-refinement` |
| 方劑/中藥 | `data/herbs/**`（formulas.json 在這裡；`data/formulas/` 只有 worklist） | — (templates only) |
| 病例/UI/工程 | `app.js` · `js/**` · `dist/**` · `data/clinical_cases/**` · `scripts/**` · `docs/**` | Claude only |

## Done criteria must be numbers

Never "finish the batch". Always:

> 完成 = `<validator> --category <cat>` 的 C4 從 95 降到 ≤80,C3 從 150 降到
> ≤135,且該批 10 筆全部 0 defect;`build-data.js` PASS;`git diff --check` PASS。

And the handoff format:

> `PROJECT_LOG.md` **最上方**新增,不改動別人的段落:
> 動到的 id · 逐碼數字 before→after · 找到的來源缺口與記錄方式 ·
> 跑了哪些驗證 PASS/FAIL · 下一批。

## Warn about what the validator cannot see

Every brief carries this line, because it is the failure the validators missed:

> **Validator PASS ≠ 沒有損失。** 穴位安全欄位被覆蓋 285/361 那次所有驗證器都
> PASS,因為每個字串都不一樣。**自己 diff 這一批,確認沒有欄位變短或被清空。**

## Output format

Emit the brief as one fenced block Ting can copy without editing. Chinese, since
that is what she sends. End with a one-line summary for her — what this batch
moves, and what the numbers should look like when it comes back.

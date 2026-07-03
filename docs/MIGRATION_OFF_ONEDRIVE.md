# Migration Spec: Move AcuTing OS off OneDrive

Status: prepared 2026-07-02 by Claude. Execute after OneDrive sync is fully green.

## Why move

OneDrive sync caused, in one day: corrupted `.git/index` (agent git over cloud
mount), truncated file reads, three collaborators (Ting local / Claude sandbox
/ Codex local) seeing different file versions, and the app silently missing
`data/generated/app_data.js` in the browser (the "search broken / 0/361" bug).
Code repos belong outside sync folders; GitHub is the real backup.

## Target

`C:\Projects\acupuncture-point-app`  (outside OneDrive; `Documents` IS OneDrive on this PC)

## Method A — File Explorer copy (no terminal needed)

Preconditions: OneDrive tray icon shows "up to date"; project files show
green check / cloud icons, NO blue sync-pending arrows.

1. Create folder `C:\Projects`.
2. Copy the whole `acupuncture-point-app` folder (includes `.git`) into it.
3. Verify: `data\generated\app_data.js` exists in the copy and is ~265 KB.
4. Open `C:\Projects\acupuncture-point-app\index.html` in browser:
   - no red warning banner at top
   - search 內關 → finds PC6
   - Acupuncture card shows non-zero reviewed count

## Method B — git clone (if Explorer copy is unreliable)

```powershell
cd "C:\Users\guoti\OneDrive\Documents\Acedemy 學習資料\acupuncture-point-app"
git remote get-url origin   # copy the URL
New-Item -ItemType Directory -Force C:\Projects | Out-Null
git clone <URL> C:\Projects\acupuncture-point-app
```
Then commit/push any uncommitted work from the OneDrive copy FIRST, or the
clone will miss it.

## After migration (checklist)

- [ ] Cowork: re-select folder `C:\Projects\acupuncture-point-app` for Claude.
- [ ] Codex: point it at the new path; forbid it from touching the old one.
- [ ] Update `push-acuting.ps1` / desktop shortcut to the new path.
- [ ] In the new folder: `git status` → commit "Migrate off OneDrive" → push.
- [ ] Rename old folder to `acupuncture-point-app_OLD_onedrive`. Keep 2 weeks.
- [ ] Delete old folder ONLY with Ting's explicit approval.

## Cleanup discovered during migration prep

- Parent folder `Acedemy 學習資料` contains a stray `.git`, `.codex`, `.agents`
  (dated 6/26). The stray parent `.git` can shadow repo operations run from the
  wrong cwd. Review and remove after migration (Ting approval required).

## Rules going forward

- Agents must NOT run `git` inside the OneDrive-mounted sandbox path.
- All git operations happen on Ting's machine (or in the new non-OneDrive path).

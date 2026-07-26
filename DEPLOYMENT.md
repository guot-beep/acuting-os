# AcuTing OS Deployment Notes

## Current Goal

This repository is prepared as a private, GitHub-ready static web app for AcuTing OS.

Primary use:

- Private study and clinical learning workspace.
- Mobile-friendly access after deployment.
- Public English content planning for a future AcuTing Learn site.

## Important Privacy Boundary

Do not commit identifiable patient information.

Use only de-identified `patient_code` values in this project unless a future version adds proper privacy, access control, encryption, backup policy, and clinic-approved workflows.

Do not commit:

- Full patient names.
- Full dates of birth.
- Phone numbers.
- Addresses.
- Insurance IDs.
- Medical record numbers.
- Real claim documents.
- Exported case files.

The `.gitignore` file excludes common private export folders, but it cannot protect data if it is manually pasted into tracked files.

## Phone Access Options

### Option A: Private Repository Only

Good for backup and collaboration, but not enough for phone browser access by itself.

You can store the code in a private GitHub repo and open it on a computer, but your phone needs a hosted website URL.

### Option B: Private Static Website

Best target for your current goal.

Deploy the static folder to a platform that supports password protection or private access, such as:

- Vercel with access protection.
- Cloudflare Pages with Access.
- Netlify with password or identity protection.
- A private acuting.com subdomain managed by the existing site workflow.

### Option C: GitHub Pages

GitHub Pages can host static HTML/CSS/JS from a repository. Private repository support and access control depend on the GitHub plan and organization settings. Confirm current GitHub settings before using it for private clinical study access.

Do not put real patient data on GitHub Pages.

Current project repository:

```text
https://github.com/guot-beep/acuting-os
```

Expected GitHub Pages project URL after Pages is enabled:

```text
https://guot-beep.github.io/acuting-os/
```

Recommended GitHub Pages settings:

```text
Settings > Pages
Build and deployment: Deploy from a branch
Branch: main
Folder: / (root)
```

This repo includes a `.nojekyll` marker so GitHub Pages serves the static app files directly.

## Static App Entry

Main page:

```text
index.html
```

Core files:

```text
app.js
styles.css
data/
```

No build step is required right now.

## Recommended Deployment Path

1. Keep this repo private.
2. Deploy only the static app folder to a protected staging URL.
3. Use the staging URL on phone for study and data lookup.
4. Keep AcuTing Learn public English content separate from private AcuTing OS clinical notes.
5. Hand public-ready content to the acuting.com / Claude-managed workflow only after source review.


---

## Cloudflare Pages 部署(2026-07-26 定案)

**設定**(Cloudflare Dashboard → Workers & Pages → 專案 → Settings → Build):

| 欄位 | 值 |
|---|---|
| Build command | `node scripts/build-site.js` |
| Build output directory | `dist` |
| Framework preset | None |

**為什麼要 build 步驟**:直接部署 repo 根目錄會失敗且不安全 ——
- `data/imports/cloudtcm/formula_url_map.json` 有 39 MB,超過 Cloudflare
  單一 asset 上限 25 MiB → `[ERROR] Asset too large`。
- 整個 repo 有 897 檔 / 137 MB,其中 **`curriculum/` 是 Ting 的版權課件,
  絕對不可上傳**。

`scripts/build-site.js` 只複製 `index.html` 實際引用的本地檔案(13 檔、
約 13 MB),其餘一律留在私人 repo。新增資料檔時只要在 index.html 引用,
build 會自動帶上,不用改腳本。

**上鎖(只有 Ting 能開)**:Cloudflare Zero Trust → Access → Applications →
Add self-hosted → 網域填 `<專案>.pages.dev` → Policy: Allow / Include /
Emails = Ting 的 email → 登入方式 One-time PIN。

**注意**:病例資料存在各瀏覽器 localStorage,手機與電腦各自獨立;
要搬用面板裡的 匯出/匯入 JSON。知識內容(穴位/中藥/方劑)則隨部署同步。

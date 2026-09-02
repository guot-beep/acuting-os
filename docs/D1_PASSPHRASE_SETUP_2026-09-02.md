# 通行碼設定(已被取代 —— 不要照這份做)

**這份的做法在 2026-09-02 當天就被自己推翻了,內容已移除,以免有人照著跑。**

原本要妳在自己電腦上把通行碼算成雜湊、四行貼給我、我寫進 `wrangler.jsonc`。
那是錯的:**`guot-beep/acuting-os` 是公開 repo**,`wrangler.jsonc` 跟著進 GitHub,
等於把離線破解一句記得住的通行碼所需的材料全部公開(30,000 次 PBKDF2 迭代,GPU 約一天)。

現在的做法:git 裡只放一次性**設定碼**的雜湊(16 碼亂數,約 79 bits,公開也破不了);
妳的通行碼在第一次開 app 時直接在瀏覽器裡訂,雜湊由 Worker 寫進 D1,永不進 git。

→ **看這份:[D1_TING_CHECKLIST_2026-09-02.md](D1_TING_CHECKLIST_2026-09-02.md)**

相關工具與閘門:

- `scripts/make-clinical-setup-code.js` — 產生設定碼與它的雜湊(會自我驗證後才輸出)
- `scripts/test-setup-flow.js` — 設定流程 11 條,跑的是 Worker 真正那支實作
- `scripts/validate-d1-deploy-gate.js` — 含四條負控:`CLINICAL_PASS_*` 出現在設定檔就擋下部署
- `scripts/make-clinical-passphrase-hash.js` — **已刪除**,它的輸出現在是被禁止的

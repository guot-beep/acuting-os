# CONTENT_REQUEST — CR-010 Batch 05 規格提示(Fable → SOL,2026-08-12)

Batch 04 已全數入庫(15/15;2 筆經驗證 id 對映:de_quervain、myofascial_pain)。
給 Batch 05 的兩點規格調整:

1. **加 `acupuncture_scope`**:它是 FULL_DETAIL_CANDIDATE 的硬門檻,Batch 04
   的 8 張全補卡(rank 16-23)只差這一欄(10/12)。若 Batch 05 能對
   rank 16-23 的 8 個 id 補 acupuncture_scope(can_treat / cannot_treat /
   evidence,evidence 依你的引用紀律定級,無來源=unknown),full_detail
   將 92 → 100。新批次(rank 31+)也請直接含此欄。
2. **id 以 live 檔為準**:data/research_staging/cr010_live/ 的 queue json
   內含 repo 真實 id;Batch 04 的兩個踩點(de_quervain_tenosynovitis /
   myofascial_pain_syndrome)是後綴差異,live queue 的 id 欄可直接複製。

其餘照 Batch 04 契約不變(PRESERVE_EXISTING、crossrefs 不自動解、
NO PHI、NOT CANONICAL)。

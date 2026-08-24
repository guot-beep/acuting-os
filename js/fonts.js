/* 品牌字型翻轉驅動（2026-08-24，Bundle Phase 2 P0；A1 硬化同日）。
 *
 * index.html 以 media="print" 載入 Google Fonts CSS——非匹配 media 的
 * stylesheet 不會進入「阻塞 script 執行」的集合，所以字型服務再慢也
 * 凍不住 app（舊的 styles.css @import 寫法實測凍 12.5 秒）。
 * 本檔是 head 裡第一支 defer script：在字型 CSS「確定載完」後把 media
 * 翻成 all。核心不變式：翻轉只發生在「確定不是 in-flight」之後——被翻轉的
 * stylesheet 永遠不可能變回 script-blocking。兩個可信訊號：
 *   (1) load 事件——規格上 <link rel=stylesheet> 的 load 只在資源抓取並
 *       解析完成後觸發，依定義就不是 in-flight（trusted=true）；
 *   (2) link.sheet 非 null——250ms 輪詢用（trusted=false 時的唯一放行條件）。
 * 為什麼 load 不能也 gate 在 .sheet 上：media 不匹配的跨網域 stylesheet，
 * WebKit 是否填 .sheet 沒有真機證據——若不填，翻轉永遠不發生，iPhone 靜默
 * 失去品牌字且零錯誤。load 本身就是完成證明，不需要第二個證人。
 * error 立刻放棄（省 6 秒空轉）。實測註記：瞬間失敗（DNS 立刻拒絕）發生在
 * HTML 解析期，error 事件在本 defer script 掛監聽之前就發過了，那種情況
 * 走 6 秒 deadline 兜底；error 監聽救的是「晚發生的失敗」（診所 Wi-Fi
 * 連上後逾時斷線那型）。逾時（FONT_DEADLINE_MS）就永久放棄，
 * 整頁用系統字 fallback 跑完全場。
 * globalThis.ACUTING_FONTS_STATE ∈ "pending"|"flipped"|"gaveup"——真機驗收
 * 用：console 一行讀狀態（iOS 用 Mac Safari 開發選單遠端偵錯）。 */
(function () {
  var link = document.getElementById("brandFont");
  if (!link) return;
  var FONT_DEADLINE_MS = 6000;
  var done = false;
  var timer = null;
  var deadline = null;
  globalThis.ACUTING_FONTS_STATE = "pending";
  function flip(trusted) {
    if (done) return;
    if (!trusted && !link.sheet) return; // 輪詢路徑：還沒載完，絕不提前翻
    done = true;
    clearInterval(timer);
    clearTimeout(deadline);
    link.media = "all";
    globalThis.ACUTING_FONTS_STATE = "flipped";
  }
  function giveUp() {
    if (done) return;
    done = true;
    clearInterval(timer);
    clearTimeout(deadline);
    globalThis.ACUTING_FONTS_STATE = "gaveup";
  }
  link.addEventListener("load", function () { flip(true); });
  link.addEventListener("error", giveUp);
  // 跨瀏覽器保險：cross-origin + media 不匹配時 load 事件與 .sheet 的時序
  // 不完全一致（Ting 用 iOS Safari），加一條 250ms 有界輪詢。
  timer = setInterval(function () { flip(false); }, 250);
  deadline = setTimeout(giveUp, FONT_DEADLINE_MS);
  flip(false);
})();

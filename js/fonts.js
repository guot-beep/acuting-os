/* 品牌字型翻轉驅動（2026-08-24，Bundle Phase 2 P0）。
 *
 * index.html 以 media="print" 載入 Google Fonts CSS——非匹配 media 的
 * stylesheet 不會進入「阻塞 script 執行」的集合，所以字型服務再慢也
 * 凍不住 app（舊的 styles.css @import 寫法實測凍 12.5 秒）。
 * 本檔是 head 裡第一支 defer script：在字型 CSS「確定載完」後把 media
 * 翻成 all。核心不變式：翻轉只發生在 link.sheet 非 null 之後——被翻轉的
 * stylesheet 永遠不是 in-flight，永遠不可能變回 script-blocking。
 * 逾時（FONT_DEADLINE_MS）就永久放棄，整頁用系統字 fallback 跑完全場。 */
(function () {
  var link = document.getElementById("brandFont");
  if (!link) return;
  var FONT_DEADLINE_MS = 6000;
  var done = false;
  var timer = null;
  var deadline = null;
  function flip() {
    if (done) return;
    if (!link.sheet) return; // 還沒載完，絕不提前翻
    done = true;
    clearInterval(timer);
    clearTimeout(deadline);
    link.media = "all";
  }
  function giveUp() {
    if (done) return;
    done = true;
    clearInterval(timer);
    link.removeEventListener("load", flip);
  }
  link.addEventListener("load", flip);
  // 跨瀏覽器保險：cross-origin + media 不匹配時 load 事件與 .sheet 的時序
  // 不完全一致（Ting 用 iOS Safari），加一條 250ms 有界輪詢。
  timer = setInterval(flip, 250);
  deadline = setTimeout(giveUp, FONT_DEADLINE_MS);
  flip();
})();

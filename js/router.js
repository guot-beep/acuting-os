/**
 * router.js — workspace switcher for AcuTing OS.
 *
 * The page is organized into workspaces via section[data-workspace]:
 *   home | lookup | cases | quality | sources | learn
 *
 * Rules:
 * - #ws/<name>            → activate that workspace, scroll to top.
 * - #point/<CODE>         → activate lookup (app.js renders the detail).
 * - #<sectionId>          → activate the workspace containing that element,
 *                           then scroll it into view (keeps all old anchors,
 *                           library cards, and quicknav links working).
 * - no hash               → home.
 *
 * This file deliberately does not touch app.js internals.
 */
(function () {
  const WORKSPACES = ["home", "lookup", "cases", "quality", "sources", "learn"];
  const DEFAULT_WS = "home";
  const sections = Array.from(document.querySelectorAll("section[data-workspace]"));
  const navLinks = Array.from(document.querySelectorAll(".workspace-nav a[data-ws]"));

  let activeWs = null;

  function activate(ws) {
    if (!WORKSPACES.includes(ws)) ws = DEFAULT_WS;
    if (ws === activeWs) return;
    activeWs = ws;
    document.body.setAttribute("data-active-ws", ws);
    sections.forEach((el) => {
      const show = el.getAttribute("data-workspace") === ws;
      el.hidden = !show;
      // A section can be wrapped in a collapsible module drawer; the drawer
      // belongs to whatever workspace its section does, so hide/show it too.
      const drawer = el.closest("details.module-drawer");
      if (drawer) drawer.hidden = !show;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("data-ws") === ws);
    });
  }

  function workspaceForElement(el) {
    const host = el.closest("section[data-workspace]");
    return host ? host.getAttribute("data-workspace") : null;
  }

  // Anchors (home library chips, quicknav links, related-point jumps) may point
  // at content that now lives inside a collapsed drawer. Open every drawer
  // ancestor so the target is actually visible after we scroll to it.
  function openDrawersFor(el) {
    let d = el.closest("details.module-drawer");
    while (d) {
      d.open = true;
      d = d.parentElement ? d.parentElement.closest("details.module-drawer") : null;
    }
  }

  function route() {
    const hash = window.location.hash || "";

    if (hash.startsWith("#ws/")) {
      activate(hash.slice(4));
      window.scrollTo({ top: 0 });
      return;
    }
    if (hash.startsWith("#point/")) {
      activate("lookup");
      requestAnimationFrame(() => {
        const detail = document.getElementById("detailCard");
        if (detail) detail.scrollIntoView({ block: "start" });
      });
      return;
    }
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        const ws = workspaceForElement(target) || activeWs || DEFAULT_WS;
        activate(ws);
        openDrawersFor(target);
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
        return;
      }
    }
    activate(DEFAULT_WS);
  }

  window.addEventListener("hashchange", route);
  // Re-click on the already-active nav item should still scroll to top.
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      if (a.classList.contains("active")) window.scrollTo({ top: 0 });
    })
  );

  route();
})();

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
  // "channels" is the Channel & Point Charts workspace. It was missing here,
  // so #ws/channels failed the membership test and fell back to home — the
  // section exists and renders its content, but was never shown.
  const WORKSPACES = ["home", "acu", "channels", "formula", "herb", "condition", "comparison", "cases", "quality", "sources"];
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
      activate("acu");
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

  // --- Slide-out navigation panel (the top-right ☰ menu) ---------------
  const navToggle = document.getElementById("navToggle");
  const navPanel = document.getElementById("navPanel");
  const navScrim = document.getElementById("navScrim");
  const navClose = document.getElementById("navClose");

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (navToggle) navToggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  if (navClose) navClose.addEventListener("click", () => setNav(false));
  if (navScrim) navScrim.addEventListener("click", () => setNav(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNav(false);
  });
  // Any navigation click inside the panel closes it (the hash change routes).
  if (navPanel) {
    navPanel.addEventListener("click", (e) => {
      if (e.target.closest("a")) setNav(false);
    });
  }

  // --- Floating action buttons (touch-friendly) ------------------------
  const fabMenu = document.getElementById("fabMenu");
  const fabSearch = document.getElementById("fabSearch");
  const fabHistory = document.getElementById("fabHistory");
  if (fabMenu) fabMenu.addEventListener("click", () => setNav(true));
  if (fabSearch) {
    fabSearch.addEventListener("click", () => {
      if (window.location.hash !== "#ws/home") window.location.hash = "#ws/home";
      requestAnimationFrame(() => {
        const box = document.getElementById("homeSearch");
        if (box) { box.scrollIntoView({ block: "center" }); box.focus(); }
      });
    });
  }
  if (fabHistory) fabHistory.addEventListener("click", () => window.history.back());

  route();
})();

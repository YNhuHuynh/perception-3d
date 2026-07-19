/* ============================================================
   PGR-3D project page — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var stored = null;
  try { stored = localStorage.getItem("pgr-theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  applyTheme(theme);

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (toggle) toggle.innerHTML = t === "dark" ? "&#9728;" : "&#9790;"; // sun / moon
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem("pgr-theme", theme); } catch (e) {}
    });
  }

  /* ---------- Interactive gallery ---------- */
  var BASE = "static/images/teaser/";
  var CONDITIONS = [
    { key: "bl",   label: "Baseline",    ours: false },
    { key: "cap",  label: "+ Semantic",  ours: false },
    { key: "dep",  label: "+ Depth",     ours: false },
    { key: "comb", label: "+ Combined",  ours: true  }
  ];

  // cd values in raw Chamfer units (Era3D; bl=lr0, cap=caption_v2, dep=depth-v5, comb=combined_v2);
  // null = not reported for this cell. Rescue cases first; chicken is an honest already-easy case.
  var OBJECTS = [
    { id: "oil",           label: "Oil Bottle",   cd: { bl: 0.10085, cap: 0.11766, dep: 0.00243, comb: 0.00378 } },
    { id: "stucking_cups", label: "Stacked Cups", cd: { bl: 0.07044, cap: 0.02966, dep: 0.00397, comb: 0.00442 } },
    { id: "alarm",         label: "Alarm Clock",  cd: { bl: 0.01032, cap: null,    dep: 0.00183, comb: 0.00180 } },
    { id: "hat",           label: "Hat",          cd: { bl: 0.03975, cap: 0.03837, dep: 0.02362, comb: 0.02673 } },
    { id: "sofa",          label: "Sofa",         cd: { bl: 0.00998, cap: 0.01236, dep: 0.00746, comb: 0.00761 } },
    { id: "chicken",       label: "Stacking Toy", cd: { bl: 0.00147, cap: 0.00171, dep: 0.00136, comb: 0.00168 } }
  ];

  var state = { obj: OBJECTS[0], cond: "comb", mode: "norm" }; // start on the oil-bottle rescue, normals

  var elObjects = document.getElementById("gallery-objects");
  var elTabs    = document.getElementById("condition-tabs");
  var elInput   = document.getElementById("viewer-input");
  var elGt      = document.getElementById("viewer-gt");
  var elResult  = document.getElementById("viewer-result");
  var elCond    = document.getElementById("viewer-cond-label");
  var elCd      = document.getElementById("viewer-cd");
  var modeBtns  = document.querySelectorAll(".mode-btn");

  if (elObjects && elResult) {
    // object thumbnails
    OBJECTS.forEach(function (o) {
      var b = document.createElement("button");
      b.className = "gobj";
      b.type = "button";
      b.innerHTML = '<img src="' + BASE + o.id + '_input.png" alt="' + o.label + '"><span>' + o.label + "</span>";
      b.addEventListener("click", function () { state.obj = o; render(); });
      b.dataset.id = o.id;
      elObjects.appendChild(b);
    });

    // condition tabs
    CONDITIONS.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "cond-tab" + (c.ours ? " is-ours" : "");
      b.type = "button";
      b.textContent = c.label;
      b.dataset.key = c.key;
      b.addEventListener("click", function () { state.cond = c.key; render(); });
      elTabs.appendChild(b);
    });

    // mode buttons
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        state.mode = b.dataset.mode;
        render();
      });
    });

    render();
  }

  function fmtCd(v) { return "CD " + v.toFixed(5).replace(/0+$/, "").replace(/\.$/, ".0"); }

  function bestCond(obj) {
    var best = null, bestV = Infinity;
    CONDITIONS.forEach(function (c) {
      var v = obj.cd[c.key];
      if (typeof v === "number" && v < bestV) { bestV = v; best = c.key; }
    });
    return best;
  }

  function render() {
    var o = state.obj, cond = state.cond, mode = state.mode;

    // fixed panels
    elInput.src = BASE + o.id + "_input.png";
    elGt.src    = BASE + o.id + "_gt.png";

    // result — fall back to rgb if a normal map isn't present
    elResult.style.opacity = "0";
    var src = BASE + o.id + "_" + cond + "_" + mode + ".png";
    var img = new Image();
    img.onload = function () { elResult.src = src; elResult.style.opacity = "1"; };
    img.onerror = function () { elResult.src = BASE + o.id + "_" + cond + "_rgb.png"; elResult.style.opacity = "1"; };
    img.src = src;

    // labels
    var condObj = CONDITIONS.filter(function (c) { return c.key === cond; })[0];
    elCond.textContent = condObj.label + (condObj.ours ? " (Ours)" : "");
    var cd = o.cd[cond];
    if (typeof cd === "number") {
      elCd.textContent = fmtCd(cd);
      elCd.className = "cd-badge" + (cond === bestCond(o) ? " win" : "");
    } else {
      elCd.textContent = "";
      elCd.className = "cd-badge";
    }

    // active states
    Array.prototype.forEach.call(elObjects.children, function (b) {
      b.classList.toggle("active", b.dataset.id === o.id);
    });
    Array.prototype.forEach.call(elTabs.children, function (b) {
      b.classList.toggle("active", b.dataset.key === cond);
    });
    modeBtns.forEach(function (b) { b.classList.toggle("active", b.dataset.mode === mode); });
  }

  /* ---------- Copy BibTeX ---------- */
  var copyBtn = document.getElementById("copy-bib");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var code = document.querySelector(".bibtex code");
      if (!code) return;
      var text = code.textContent;
      var done = function () {
        var orig = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(function () { copyBtn.textContent = orig; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Nav active-section highlight ---------- */
  var navLinks = document.querySelectorAll(".nav-links a");
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ link: a, el: el });
  });
  if ("IntersectionObserver" in window && sections.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.style.color = ""; });
          var m = sections.filter(function (s) { return s.el === e.target; })[0];
          if (m) m.link.style.color = "var(--accent)";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { obs.observe(s.el); });
  }

  /* ---------- Interactive 3D gallery (model-viewer) ---------- */
  (function () {
    var host = document.getElementById("model-objects");
    var mvGt = document.getElementById("mv-gt");
    var mvOurs = document.getElementById("mv-ours");
    if (!host || !mvGt || !mvOurs) return;              // no-op if gallery absent

    var MODELS = "static/models/";
    var THUMBS = "static/images/teaser/";
    var OBJS = [
      { id: "oil",           label: "Oil Bottle" },
      { id: "alarm",         label: "Alarm Clock" },
      { id: "stucking_cups", label: "Stacked Cups" },
      { id: "hat",           label: "Hat" },
      { id: "chicken",       label: "Stacking Toy" },
      { id: "sofa",          label: "Sofa" }
    ];

    function select(o) {
      mvGt.setAttribute("src", MODELS + o.id + "_gt.glb");
      mvOurs.setAttribute("src", MODELS + o.id + "_ours.glb");
      Array.prototype.forEach.call(host.children, function (b) {
        b.classList.toggle("active", b.dataset.id === o.id);
      });
    }

    OBJS.forEach(function (o) {
      var b = document.createElement("button");
      b.className = "mobj";
      b.type = "button";
      b.dataset.id = o.id;
      b.innerHTML = '<img src="' + THUMBS + o.id + '_input.png" alt="' + o.label + '"><span>' + o.label + "</span>";
      b.addEventListener("click", function () { select(o); });
      host.appendChild(b);
    });

    select(OBJS[0]);   // default: oil (matches initial HTML src)
  })();
})();

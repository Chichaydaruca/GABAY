/* ============================================================
   GABAY — standalone application script (plain JavaScript)
   Directory · Dijkstra wayfinding · AR overlay · QR scan flow
   Location codes match the GABAY database seed exactly.
   ============================================================ */
(function () {
  "use strict";

  var M_PER_UNIT = 0.1; // plan space 1000 x 640 units = 100 m x 64 m
  var SPEED_MPS = 3.2;  // demo walking pace
  var TICK = 100;

  /* ---------------- graph ---------------- */
  var NODES = [
    { id: "W1", label: "West Corridor", x: 70, y: 320 },
    { id: "A", label: "West Junction", x: 300, y: 320 },
    { id: "C", label: "Main Lobby", x: 500, y: 320 },
    { id: "B", label: "East Junction", x: 720, y: 320 },
    { id: "E", label: "East Corridor", x: 930, y: 320 },
    { id: "N", label: "North Wing", x: 500, y: 110 },
    { id: "NW", label: "North-West Wing", x: 300, y: 110 },
    { id: "NE", label: "North-East Wing", x: 720, y: 110 },
    { id: "S", label: "South Wing", x: 500, y: 540 },
    { id: "SW", label: "South-West Wing", x: 300, y: 540 },
    { id: "SE", label: "South-East Wing", x: 720, y: 540 }
  ];

  var EDGE_PAIRS = [
    ["W1", "A"], ["A", "C"], ["C", "B"], ["B", "E"], ["C", "N"],
    ["A", "NW"], ["B", "NE"], ["C", "S"], ["A", "SW"], ["B", "SE"]
  ];

  /* ---------------- locations (correct codes) ---------------- */
  var LOCATIONS = [
    { code: "R104", name: "Room 104", category: "Classroom", building: "Main Building", floor: "Ground Floor", node: "A", hours: "Mon–Fri, 7:00–20:00", x: 90, y: 210, w: 180, h: 70,
      desc: "Regular classroom for College of Engineering classes. Seats 40 with a projector." },
    { code: "R105", name: "Room 105", category: "Classroom", building: "Main Building", floor: "Ground Floor", node: "A", hours: "Mon–Fri, 7:00–20:00", x: 90, y: 360, w: 180, h: 70,
      desc: "Classroom behind the West Junction, used for morning lectures and quizzes." },
    { code: "ITRM", name: "IT Room", category: "Computer Laboratory", building: "Main Building", floor: "Ground Floor", node: "C", hours: "Mon–Sat, 7:00–19:00", x: 330, y: 210, w: 140, h: 70,
      desc: "Computer laboratory with 36 workstations and a live Wi-Fi 6 access point." },
    { code: "R128", name: "Room 128", category: "Classroom", building: "Main Building", floor: "Ground Floor", node: "C", hours: "Mon–Fri, 7:00–20:00", x: 530, y: 360, w: 170, h: 70,
      desc: "Large classroom beside the Main Lobby. Used as the Rizal Hall extension during exam week." },
    { code: "REG", name: "Registrar's Office", category: "Office", building: "Main Building", floor: "Ground Floor", node: "C", hours: "Mon–Fri, 8:00–17:00", x: 530, y: 210, w: 170, h: 70,
      desc: "Certificates, enrollment and Transcript of Records. Take a number at the kiosk outside the door." },
    { code: "LIB", name: "Library", category: "Facility", building: "Main Building", floor: "Ground Floor", node: "B", hours: "Mon–Sat, 7:30–19:30", x: 740, y: 210, w: 170, h: 70,
      desc: "Circulation counter, periodicals and a silent study area. Library card required at the entrance." },
    { code: "CLIN", name: "Campus Clinic", category: "Service", building: "Main Building", floor: "Ground Floor", node: "B", hours: "Mon–Fri, 8:00–17:00", x: 740, y: 360, w: 170, h: 70,
      desc: "First aid, medical and dental consultation. A nurse is on duty during office hours." },
    { code: "GUID", name: "Guidance Center", category: "Office", building: "Main Building", floor: "Ground Floor", node: "C", hours: "Mon–Fri, 8:00–17:00", x: 330, y: 360, w: 140, h: 70,
      desc: "Counseling, career and personal support for students. Walk-in and by-schedule." },
    { code: "ADMIN", name: "Administrative Office", category: "Office", building: "Science Wing", floor: "Ground Floor", node: "N", hours: "Mon–Fri, 8:00–17:00", x: 410, y: 20, w: 140, h: 55,
      desc: "Office of the Dean and the administrative staff. Document lodgments are accepted at the counter." },
    { code: "PHYLAB", name: "Physics Laboratory", category: "Laboratory", building: "Science Wing", floor: "Ground Floor", node: "NW", hours: "Mon–Sat, 7:00–17:00", x: 200, y: 20, w: 180, h: 55,
      desc: "Laboratory for Physics and General Science. Food and drinks are not allowed inside." },
    { code: "FAC", name: "Faculty Room", category: "Office", building: "Science Wing", floor: "Ground Floor", node: "NE", hours: "Mon–Fri, 7:00–18:00", x: 620, y: 20, w: 180, h: 55,
      desc: "Faculty consultation and instructor desks. Check the schedule posted on the door before knocking." },
    { code: "CAF", name: "Canteen", category: "Food", building: "Annex", floor: "Ground Floor", node: "S", hours: "Mon–Sat, 6:30–19:00", x: 380, y: 470, w: 180, h: 55,
      desc: "Cafeteria and stall-style meals. A water refill station is on the right side." },
    { code: "CR", name: "Restroom (CR)", category: "Service", building: "Annex", floor: "Ground Floor", node: "S", hours: "Daily, 6:00–21:00", x: 580, y: 470, w: 60, h: 55,
      desc: "Clean restroom beside the South Wing. An access ramp is on the right side." },
    { code: "AUD", name: "Auditorium", category: "Venue", building: "Annex", floor: "Ground Floor", node: "SW", hours: "Daily, 7:00–21:00", x: 140, y: 555, w: 220, h: 60,
      desc: "350 seats for assemblies, orientations and performances. Green room at the back." },
    { code: "GYM", name: "Gymnasium", category: "Venue", building: "Annex", floor: "Ground Floor", node: "SE", hours: "Daily, 6:00–21:00", x: 620, y: 555, w: 260, h: 60,
      desc: "Covered court for PE classes, intramurals and graduation rites. Male and female CR inside." }
  ];

  var CORRIDORS = [
    { x: 70, y: 290, w: 860, h: 60, dash: true },
    { x: 470, y: 80, w: 60, h: 490, dash: true },
    { x: 70, y: 80, w: 860, h: 60, dash: false },
    { x: 70, y: 510, w: 860, h: 60, dash: false }
  ];

  var byId = {};
  NODES.forEach(function (n) { byId[n.id] = n; });

  var EDGES = EDGE_PAIRS.map(function (p) {
    var a = byId[p[0]], b = byId[p[1]];
    return { a: p[0], b: p[1], w: Math.round(Math.hypot(a.x - b.x, a.y - b.y)) };
  });

  /* ---------------- Dijkstra ---------------- */
  function shortestPath(startId, endId) {
    if (!byId[startId] || !byId[endId]) return null;
    var adj = {};
    NODES.forEach(function (n) { adj[n.id] = []; });
    EDGES.forEach(function (e) {
      adj[e.a].push({ to: e.b, w: e.w });
      adj[e.b].push({ to: e.a, w: e.w });
    });

    var dist = {}, prev = {}, visited = {}, id;
    NODES.forEach(function (n) { dist[n.id] = Infinity; });
    dist[startId] = 0;

    for (;;) {
      var cur = null, best = Infinity;
      for (id in dist) {
        if (!visited[id] && dist[id] < best) { best = dist[id]; cur = id; }
      }
      if (cur === null) break;
      if (cur === endId) break;
      visited[cur] = true;
      adj[cur].forEach(function (edge) {
        var nd = best + edge.w;
        if (nd < dist[edge.to]) { dist[edge.to] = nd; prev[edge.to] = cur; }
      });
    }

    if (!(endId in prev) && startId !== endId) return null;
    var path = [endId], cursor = endId;
    while (cursor !== startId) {
      cursor = prev[cursor];
      if (!cursor) return null;
      path.unshift(cursor);
    }
    return path;
  }

  function angleOf(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }
  function normalize(d) { while (d > 180) d -= 360; while (d < -180) d += 360; return d; }
  function weightOf(a, b) {
    for (var i = 0; i < EDGES.length; i++) {
      var e = EDGES[i];
      if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return e.w;
    }
    return Math.round(Math.hypot(byId[a].x - byId[b].x, byId[a].y - byId[b].y));
  }
  function nearestNode(exclude) {
    var pool = NODES.filter(function (n) { return n.id !== exclude; });
    return pool.length ? pool[0].label : "";
  }

  function buildRoute(path, dest) {
    var steps = [], points = path.map(function (id) { return [byId[id].x, byId[id].y]; });
    var totalUnits = 0, i;
    for (i = 0; i < path.length - 1; i++) totalUnits += weightOf(path[i], path[i + 1]);

    if (path.length >= 2) {
      steps.push({
        turn: "start",
        text: "Head from " + byId[path[0]].label + " toward " + byId[path[1]].label,
        landmark: nearestNode(path[1]),
        meters: Math.max(1, Math.round(weightOf(path[0], path[1]) * M_PER_UNIT))
      });
      for (i = 1; i < path.length - 1; i++) {
        var prev = byId[path[i - 1]], cur = byId[path[i]], next = byId[path[i + 1]];
        var delta = normalize(angleOf(cur, next) - angleOf(prev, cur));
        var turn = "straight", verb = "Continue straight";
        if (delta >= 30 && delta < 150) { turn = "right"; verb = "Turn right"; }
        else if (delta <= -30 && delta > -150) { turn = "left"; verb = "Turn left"; }
        else if (Math.abs(delta) >= 150) { turn = "straight"; verb = "Turn around and continue"; }
        steps.push({
          turn: turn,
          text: verb + " at " + cur.label + " toward " + next.label,
          landmark: nearestNode(next),
          meters: Math.max(1, Math.round(weightOf(path[i], path[i + 1]) * M_PER_UNIT))
        });
      }
    }
    steps.push({ turn: "arrive", text: "You have arrived — " + dest.name, landmark: dest.building + " · " + dest.floor, meters: 0 });

    return {
      path: path,
      points: points,
      steps: steps,
      totalM: Math.round(totalUnits * M_PER_UNIT),
      etaMin: Math.max(1, Math.round(totalUnits * M_PER_UNIT / 1.15 / 60))
    };
  }

  /* ---------------- helpers ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function byCode(code) {
    for (var i = 0; i < LOCATIONS.length; i++) if (LOCATIONS[i].code === code) return LOCATIONS[i];
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  /* ---------------- floor plan renderer ---------------- */
  function renderPlan(svg, opts) {
    if (!svg) return;
    opts = opts || {};
    var dark = !!opts.dark, compact = !!opts.compact;
    var stroke = dark ? "#2fe2e6" : "#0e1633";
    var faint = dark ? "rgba(47,226,230,0.35)" : "rgba(14,22,51,0.28)";
    var roomFill = dark ? "rgba(47,226,230,0.06)" : "#e7e1d4";
    var s = "";

    s += '<defs><pattern id="g' + (opts.idSuffix || "h") + '" width="40" height="40" patternUnits="userSpaceOnUse">' +
      '<path d="M40 0H0V40" fill="none" stroke="' + faint + '" stroke-width="0.6" opacity="0.5"/></pattern>' +
      '<filter id="gl' + (opts.idSuffix || "h") + '" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    s += '<rect width="1000" height="640" fill="url(#g' + (opts.idSuffix || "h") + ')"/>';

    CORRIDORS.forEach(function (c) {
      s += '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h +
        '" fill="' + (dark ? "rgba(47,226,230,0.05)" : "#f7f4ee") + '" stroke="' + faint + '" stroke-width="1.4"/>';
      if (c.dash && c.w > c.h) {
        s += '<line x1="' + (c.x + 12) + '" y1="' + (c.y + c.h / 2) + '" x2="' + (c.x + c.w - 12) + '" y2="' + (c.y + c.h / 2) +
          '" stroke="' + faint + '" stroke-width="1.6" stroke-dasharray="14 12"/>';
      }
      if (c.dash && c.h > c.w) {
        s += '<line x1="' + (c.x + c.w / 2) + '" y1="' + (c.y + 12) + '" x2="' + (c.x + c.w / 2) + '" y2="' + (c.y + c.h - 12) +
          '" stroke="' + faint + '" stroke-width="1.6" stroke-dasharray="14 12"/>';
      }
    });

    LOCATIONS.forEach(function (l) {
      var sel = opts.selected === l.code;
      s += '<rect x="' + l.x + '" y="' + l.y + '" width="' + l.w + '" height="' + l.h +
        '" fill="' + (sel ? "rgba(224,52,42,0.12)" : roomFill) + '" stroke="' + (sel ? "#e0342a" : stroke) +
        '" stroke-width="' + (sel ? 3 : 1.6) + '"' + (sel ? ' filter="url(#gl' + (opts.idSuffix || "h") + ')"' : "") + "/>";
      if (!compact) {
        s += '<text x="' + (l.x + 9) + '" y="' + (l.y + 21) + '" font-family="IBM Plex Mono, monospace" font-size="15" font-weight="600" fill="' +
          (sel ? "#e0342a" : (dark ? "#2fe2e6" : "#0e1633")) + '" letter-spacing="0.06em">' + l.code + "</text>";
        s += '<text x="' + (l.x + 9) + '" y="' + (l.y + l.h - 9) + '" font-family="Archivo, sans-serif" font-size="12.5" fill="' +
          (dark ? "rgba(242,238,230,0.7)" : "#6a6757") + '">' + esc(l.name.length > 22 ? l.name.slice(0, 21) + "…" : l.name) + "</text>";
      }
    });

    if (!compact) {
      NODES.forEach(function (n) {
        s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="5.5" fill="' + (dark ? "#070912" : "#f2eee6") + '" stroke="' + stroke + '" stroke-width="2"/>';
      });
    }

    if (opts.route && opts.route.length) {
      s += '<polyline points="' + opts.route.map(function (p) { return p[0] + "," + p[1]; }).join(" ") +
        '" fill="none" stroke="#2fe2e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#gl' +
        (opts.idSuffix || "h") + ')" opacity="0.95"/>';
    }

    if (opts.start && byId[opts.start]) {
      var st = byId[opts.start];
      s += '<circle cx="' + st.x + '" cy="' + st.y + '" r="11" fill="#1b2c8a"/>';
      s += '<text x="' + (st.x + 26) + '" y="' + (st.y + 5) + '" font-family="IBM Plex Mono, monospace" font-size="13" fill="' +
        (dark ? "#2fe2e6" : "#1b2c8a") + '" letter-spacing="0.1em">YOU</text>';
    }

    if (opts.selected) {
      var d = byCode(opts.selected);
      if (d) {
        s += '<g transform="translate(' + (d.x + d.w / 2 - 16) + "," + (d.y - 40) + ')">' +
          '<path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0Z" fill="#e0342a" stroke="#0e1633" stroke-width="2"/>' +
          '<circle cx="16" cy="15" r="6" fill="#f2eee6" stroke="#0e1633" stroke-width="2"/></g>';
      }
    }
    svg.innerHTML = s;
  }

  /* ---------------- directory ---------------- */
  function renderDirectory(filter) {
    var list = $("#dir-list"), empty = $("#dir-empty");
    if (!list) return;
    var q = (filter || "").trim().toLowerCase();
    var rows = LOCATIONS.filter(function (l) {
      if (!q) return true;
      return [l.code, l.name, l.category, l.building, l.desc].join(" ").toLowerCase().indexOf(q) > -1;
    });
    list.innerHTML = "";
    rows.forEach(function (l) {
      var li = el("li", "dir-row");
      li.innerHTML =
        '<span class="dir-code">' + esc(l.code) + "</span>" +
        "<span><span class='dir-name'>" + esc(l.name) + "</span>" +
        "<p class='dir-desc'>" + esc(l.desc) + "</p>" +
        "<p class='dir-meta'>" + esc(l.category) + " · " + esc(l.hours) + "</p></span>" +
        "<span class='dir-loc'>" + esc(l.building) + "<br>" + esc(l.floor) + "</span>" +
        '<span class="dir-actions"><button class="btn btn-navy btn-sm" data-ar="' + l.code + '">AR &rarr;</button>' +
        '<button class="btn btn-outline btn-sm" data-scan="' + l.code + '">QR</button></span>';
      list.appendChild(li);
    });
    if (empty) empty.hidden = rows.length > 0;
    $("#stat-locations").textContent = LOCATIONS.length;
    var spec = $("#spec-count");
    if (spec) spec.textContent = LOCATIONS.length + " locations";
  }

  /* ---------------- view routing ---------------- */
  function showView(id) {
    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) views[i].classList.toggle("is-active", views[i].id === id);
    if (id === "ar") startArIdle();
    if (id !== "ar") stopWalk();
    window.scrollTo(0, 0);
  }
  function routeFromHash() {
    var h = (location.hash || "#home").slice(1).split("?")[0];
    var map = { home: "home", directory: "home", about: "home", ar: "ar", scan: "scan" };
    showView(map[h] || "home");
    if (h === "directory" || h === "about") {
      var target = document.getElementById(h);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
    var params = new URLSearchParams((location.hash.split("?")[1] || ""));
    var to = params.get("to"), from = params.get("from");
    if (map[h] === "ar" && to) startNavigation(to, from || "C");
    if (map[h] === "scan" && from) logScan("GABAY:" + from, "hash");
  }

  /* ---------------- AR state ---------------- */
  var route = null, stepIndex = 0, travelled = 0, timer = null, startX = "C";

  function startArIdle() {
    $("#ar-idle").hidden = false;
    $("#hud-bottom").hidden = true;
    $("#ar-pin").hidden = true;
    $("#ar-arrived").hidden = true;
    $("#chevrons").innerHTML = "";
    stopWalk();
  }

  function buildChevrons() {
    var box = $("#chevrons");
    box.innerHTML = "";
    for (var i = 0; i < 7; i++) {
      var d = el("div", "chev");
      d.style.animationDelay = (i * 0.51) + "s";
      d.innerHTML = '<svg width="140" height="72" viewBox="0 0 100 52"><path d="M0 52 50 0l50 52-26 0L50 27 26 52Z" fill="#2fe2e6"/></svg>';
      box.appendChild(d);
    }
  }

  function startNavigation(code, from) {
    var dest = byCode(code.toUpperCase());
    if (!dest) { alert("Cannot find \"" + code + "\"."); return; }
    startX = resolveStart(from || "C");
    var path = shortestPath(startX, dest.node);
    if (!path) { alert("No route to that location from where you are."); return; }

    route = buildRoute(path, dest);
    route.destination = dest;
    travelled = 0;
    stepIndex = 0;

    $("#dest-label").textContent = dest.name;
    $("#dest-panel").hidden = true;
    $("#dest-toggle").setAttribute("aria-expanded", "false");
    $("#ar-idle").hidden = true;
    $("#ar-arrived").hidden = true;
    $("#hud-bottom").hidden = false;
    $("#ar-pin").hidden = false;
    $("#hud-start").textContent = "START: " + startX;
    buildChevrons();
    renderPlan($("#mini-plan"), { dark: true, compact: true, idSuffix: "m", route: route.points, selected: dest.code, start: startX });
    paintStep();
    stopWalk();
    timer = setInterval(step, TICK);
  }

  function resolveStart(key) {
    var k = String(key).toUpperCase();
    var loc = byCode(k);
    if (loc && byId[loc.node]) return loc.node;
    if (byId[k]) return k;
    return "C";
  }

  function stopWalk() { if (timer) { clearInterval(timer); timer = null; } }

  function cumulative(i) {
    var sum = 0;
    for (var j = 0; j < i; j++) sum += route.steps[j].meters;
    return sum;
  }
  function totalMeters() {
    return route.steps.reduce(function (a, s) { return a + s.meters; }, 0);
  }

  function step() {
    travelled += (SPEED_MPS * TICK) / 1000;
    var total = totalMeters();
    if (travelled >= total) { travelled = total; paintStep(); stopWalk(); arrive(); return; }
    paintStep();
  }

  function paintStep() {
    if (!route) return;
    var idx = 0;
    for (var i = 0; i < route.steps.length; i++) if (travelled >= cumulative(i)) idx = i;
    stepIndex = idx;
    var s = route.steps[idx];
    var total = totalMeters();
    var left = Math.max(0, cumulative(idx) + s.meters - travelled);

    $("#step-count").textContent = "Step " + (idx + 1) + " of " + route.steps.length;
    $("#instr-text").textContent = s.text;
    $("#instr-landmark").textContent = "LANDMARK: " + String(s.landmark || "—").toUpperCase();
    $("#step-meters").innerHTML = Math.ceil(left) + '<span class="unit"> m</span>';
    $("#step-eta").textContent = "ETA " + route.etaMin + " min · " + route.totalM + " m";
    $("#mm-left").textContent = Math.round(Math.max(0, total - travelled)) + " m left";
    $("#bar-fill").style.width = (total ? Math.min(100, travelled / total * 100) : 0) + "%";

    var glyph = $("#turn-glyph");
    if (s.turn === "arrive") {
      glyph.innerHTML = '<circle cx="24" cy="24" r="21" fill="#2fe2e6"/><path d="M14 25l7 7 14-15" fill="none" stroke="#070912" stroke-width="5"/>';
      glyph.style.transform = "rotate(0deg)";
    } else {
      glyph.innerHTML = '<path d="M24 6 44 40 24 31 4 40Z" fill="#2fe2e6"/>';
      glyph.style.transform = "rotate(" + (s.turn === "left" ? -90 : s.turn === "right" ? 90 : 0) + "deg)";
    }
  }

  function arrive() {
    var d = route.destination;
    $("#arrive-name").textContent = d.name;
    $("#arrive-code").textContent = d.code;
    $("#arrive-floor").textContent = d.floor;
    $("#arrive-building").textContent = d.building;
    $("#arrive-dist").textContent = route.totalM + " m";
    $("#arrive-desc").textContent = d.desc;
    $("#arrive-hours").textContent = "HOURS: " + d.hours.toUpperCase();
    $("#ar-arrived").hidden = false;
    $("#chevrons").innerHTML = "";
  }

  /* ---------------- QR scan flow ---------------- */
  function logScan(token, source) {
    // Standalone build: logs locally so the flow works without a server.
    try {
      var key = "gabay_scans";
      var logs = JSON.parse(localStorage.getItem(key) || "[]");
      logs.push({ token: token, source: source || "manual", at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(logs));
      console.info("[GABAY] scan logged:", token, source);
    } catch (e) { /* storage unavailable */ }
  }

  function startFromToken(token) {
    logScan(token, "manual");
    var code = String(token).split(":").pop().toUpperCase();
    $("#scan-status").textContent = "READ — GOING TO AR…";
    setTimeout(function () { location.hash = "#ar?from=" + code; }, 400);
  }

  /* ---------------- init ---------------- */
  function init() {
    renderPlan($("#hero-plan"), { idSuffix: "h" });
    renderDirectory("");

    var destList = $("#dest-list");
    LOCATIONS.forEach(function (l) {
      var li = document.createElement("li");
      var b = el("button", null, "<span>" + esc(l.name) + '</span><span class="code">' + l.code + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { startNavigation(l.code, startX); });
      li.appendChild(b);
      destList.appendChild(li);
    });

    var quick = $("#quick-picks");
    ["R104", "R105", "ITRM"].forEach(function (c) {
      var l = byCode(c);
      var b = el("button", null, esc(l.name));
      b.type = "button";
      b.addEventListener("click", function () { startNavigation(c, startX); });
      quick.appendChild(b);
    });

    var manual = $("#manual-list");
    LOCATIONS.forEach(function (l) {
      var li = document.createElement("li");
      var b = el("button", null, "<span>" + esc(l.name) + '</span><span class="code">GABAY:' + l.code + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { startFromToken("GABAY:" + l.code); });
      li.appendChild(b);
      manual.appendChild(li);
    });

    $("#dest-toggle").addEventListener("click", function () {
      var panel = $("#dest-panel");
      panel.hidden = !panel.hidden;
      this.setAttribute("aria-expanded", String(!panel.hidden));
    });
    $("#ar-back").addEventListener("click", function () { location.hash = "#home"; });
    $("#ar-clear").addEventListener("click", function () { route = null; startArIdle(); $("#dest-panel").hidden = false; });
    $("#arrive-replay").addEventListener("click", function () {
      travelled = 0; $("#ar-arrived").hidden = true; $("#chevrons").innerHTML = "";
      buildChevrons(); paintStep(); stopWalk(); timer = setInterval(step, TICK);
    });
    $("#arrive-new").addEventListener("click", function () { route = null; startArIdle(); $("#dest-panel").hidden = false; });
    $("#manual-toggle").addEventListener("click", function () {
      var list = $("#manual-list");
      list.hidden = !list.hidden;
      this.textContent = list.hidden ? "NO CAMERA? PICK YOUR START POINT" : "CLOSE THE LIST";
    });
    $("#search").addEventListener("input", function () { renderDirectory(this.value); });

    window.addEventListener("hashchange", routeFromHash);
    routeFromHash();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

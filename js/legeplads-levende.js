// Legepladsens demoer med rigtigt indhold.
// Indholdet kommer fra data/*.js (projekter, CV, ordnet og undervisning) og fra levende kilder:
// Last.fm (via api/lastfm.ashx), Open-Meteo, GitHubs offentlige API og den delte opgaveliste i Firebase.
// Filen kører før js/legeplads.js og bygger hver demo ind i sit <div data-levende="…">.
(function () {
  "use strict";

  var DATA = window.VC_DATA || {};
  var lokal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var reduceretBevaegelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Små hjælpere ----------

  // el("button", { type: "button", class: "x", "aria-pressed": "true" }, ["tekst", andetElement])
  function el(tag, attrs, born) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") e.className = v;
        else if (k === "text") e.textContent = v;
        else if (k === "hidden") e.hidden = true;
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? "" : v);
      });
    }
    (born || []).forEach(function (b) {
      if (b === null || b === undefined) return;
      e.appendChild(typeof b === "string" ? document.createTextNode(b) : b);
    });
    return e;
  }

  function hver(selector, fn) {
    document.querySelectorAll('[data-levende="' + selector + '"]').forEach(fn);
  }

  function gemt(noegle, standard) {
    try {
      var v = localStorage.getItem("legeplads-" + noegle);
      return v === null ? standard : JSON.parse(v);
    } catch (e) { return standard; }
  }

  function gem(noegle, vaerdi) {
    try { localStorage.setItem("legeplads-" + noegle, JSON.stringify(vaerdi)); } catch (e) {}
  }

  function bland(liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function tryk(knapper, valgt) {
    knapper.forEach(function (k) { k.setAttribute("aria-pressed", String(k === valgt)); });
  }

  function to(n) { return String(n).padStart(2, "0"); }

  // Henter JSON og gemmer svaret i sessionStorage i et antal minutter, så API'er ikke bliver kaldt igen og igen
  var igangvaerende = {};
  function hentJson(url, minutter) {
    var noegle = "legeplads-cache:" + url;
    if (minutter) {
      try {
        var c = JSON.parse(sessionStorage.getItem(noegle) || "null");
        if (c && Date.now() - c.t < minutter * 60000) return Promise.resolve(c.d);
      } catch (e) {}
    }
    if (igangvaerende[url]) return igangvaerende[url];
    igangvaerende[url] = fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) {
      if (minutter) {
        try { sessionStorage.setItem(noegle, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      }
      delete igangvaerende[url];
      return d;
    }, function (fejl) {
      delete igangvaerende[url];
      throw fejl;
    });
    return igangvaerende[url];
  }

  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat("da", { numeric: "auto" }) : null;
  function siden(dato) {
    var min = Math.round((Date.now() - new Date(dato).getTime()) / 60000);
    var f = function (n, enhed, ord) { return rtf ? rtf.format(-n, enhed) : "for " + n + " " + ord + " siden"; };
    if (min < 1) return "lige nu";
    if (min < 60) return f(min, "minute", "min.");
    var t = Math.round(min / 60);
    if (t < 24) return f(t, "hour", "timer");
    var d = Math.round(t / 24);
    if (d < 30) return f(d, "day", "dage");
    return "d. " + new Date(dato).toLocaleDateString("da-DK", { day: "numeric", month: "long" });
  }

  function kilde(tekst, href) {
    var p = el("p", { class: "levende-kilde" });
    if (href) p.appendChild(el("a", { href: href, rel: "noopener", text: tekst }));
    else p.textContent = tekst;
    return p;
  }

  // ======================================================================
  // PROJEKTER (data/projekter.js)
  // ======================================================================
  var projekter = DATA.projekter ? DATA.projekter.liste : [];
  var temaer = DATA.projekter ? DATA.projekter.temaer : {};

  // Find et projekt: søgning og filtrering
  hver("projektfilter", function (demo) {
    var aktivt = "alle";
    var soeg = el("input", { class: "project-search", id: "project-search", type: "search", placeholder: "Prøv fx foredrag eller web" });
    var status = el("p", { class: "filter-status", "aria-live": "polite" });
    var knapper = [el("button", { type: "button", "data-tema": "alle", "aria-pressed": "true", text: "Alle" })]
      .concat(Object.keys(temaer).map(function (id) {
        return el("button", { type: "button", "data-tema": id, "aria-pressed": "false", text: temaer[id] });
      }));
    var resultater = projekter.map(function (p) {
      var a = el("article", { class: "project-result" }, [
        el("strong", { text: p.navn }),
        el("span", { text: p.titel })
      ]);
      a.dataset.tema = p.tema.join(" ");
      a.dataset.soeg = [p.navn, p.titel, p.kategori, p.resume, p.bidrag].concat(p.kompetencer).join(" ").toLocaleLowerCase("da");
      return a;
    });
    function filtrer() {
      var q = soeg.value.trim().toLocaleLowerCase("da");
      var synlige = 0;
      resultater.forEach(function (r) {
        var vis = (aktivt === "alle" || r.dataset.tema.split(" ").indexOf(aktivt) > -1) && (!q || r.dataset.soeg.indexOf(q) > -1);
        r.hidden = !vis;
        if (vis) synlige++;
      });
      status.textContent = synlige === 0 ? "Ingen projekter matcher — prøv en anden søgning."
        : synlige === 1 ? "Viser 1 af " + projekter.length + " projekter" : "Viser " + synlige + " af " + projekter.length + " projekter";
    }
    knapper.forEach(function (k) {
      k.addEventListener("click", function () { aktivt = k.dataset.tema; tryk(knapper, k); filtrer(); });
    });
    soeg.addEventListener("input", filtrer);
    demo.replaceChildren(
      el("label", { class: "project-search-label", for: "project-search", text: "Søg i projekter" }),
      soeg,
      el("div", { class: "project-filter-controls", role: "group", "aria-label": "Filtrér projekter efter tema" }, knapper),
      el("div", { class: "project-results", "aria-live": "polite" }, resultater),
      status
    );
    filtrer();
  });

  // Atelier: ét projekt, tre kompositioner
  var accentFarver = { fjord: "#2f5d73", sun: "#b9873a", sage: "#4f7259", berry: "#9c5446" };
  hver("kortatelier", function (demo) {
    var layout = "editorial";
    var valg = el("select", { class: "levende-select", "aria-label": "Vælg projekt" }, projekter.map(function (p, i) {
      return el("option", { value: String(i), text: p.navn });
    }));
    var layoutKnapper = [["editorial", "Redaktionelt"], ["poster", "Plakat"], ["quiet", "Roligt"]].map(function (l, i) {
      return el("button", { type: "button", "data-card-layout": l[0], "aria-pressed": String(i === 0), text: l[1] });
    });
    var kort = el("article", { class: "atelier-card" });
    function tegn() {
      var i = Number(valg.value);
      var p = projekter[i];
      kort.dataset.layout = layout;
      kort.style.setProperty("--card-accent", accentFarver[p.farve] || accentFarver.fjord);
      var link = p.link
        ? el("a", { class: "atelier-link", href: p.link, rel: "noopener" }, ["Se projektet ", el("b", { "aria-hidden": "true", text: "↗" })])
        : el("span", { class: "atelier-link", text: p.kompetencer.join(" · ") });
      kort.replaceChildren(
        el("div", { class: "atelier-art", "aria-hidden": "true" }, [el("span"), el("i"), el("b", null, [p.navn.split(" ")[0].toUpperCase().slice(0, 9), el("br"), to(i + 1)])]),
        el("div", { class: "atelier-copy" }, [
          el("span", { class: "atelier-kicker", text: p.kategori.toUpperCase() }),
          el("h4", { text: p.titel }),
          el("p", { text: p.resume }),
          link
        ])
      );
    }
    layoutKnapper.forEach(function (k) {
      k.addEventListener("click", function () { layout = k.dataset.cardLayout; tryk(layoutKnapper, k); tegn(); });
    });
    valg.addEventListener("change", tegn);
    demo.replaceChildren(
      el("div", { class: "atelier-controls" }, [valg, el("div", { class: "atelier-layouts", role: "group", "aria-label": "Vælg kortlayout" }, layoutKnapper)]),
      kort
    );
    tegn();
  });

  // Mosaik: alle projekter, nogle få ad gangen
  hver("projektmosaik", function (demo) {
    var former = ["mosaic-tall", "mosaic-short", "mosaic-medium", "mosaic-short", "mosaic-medium", "mosaic-tall"];
    var toner = { fjord: "mosaic-tone-blue", sun: "mosaic-tone-ochre", sage: "mosaic-tone-forest", berry: "mosaic-tone-clay" };
    var vist = 0;
    var gitter = el("div", { class: "mosaic-grid" });
    var flere = el("button", { type: "button", class: "mosaic-more", text: "Vis flere projekter" });
    var antal = el("span", { class: "mosaic-count", "aria-live": "polite" });
    function visFlere() {
      var naeste = projekter.slice(vist, vist + 3);
      naeste.forEach(function (p, i) {
        var form = former[(vist + i) % former.length];
        var kort = el("article", { class: "mosaic-card " + form + " " + (toner[p.farve] || "") }, [
          el("span", { text: to(vist + i + 1) + " · " + p.kategori.toUpperCase() }),
          el("strong", { text: p.titel }),
          form === "mosaic-short" ? null : el("p", { text: p.bidrag })
        ]);
        if (!reduceretBevaegelse) {
          kort.classList.add("mosaic-card-enter");
          requestAnimationFrame(function () { requestAnimationFrame(function () { kort.classList.remove("mosaic-card-enter"); }); });
        }
        gitter.appendChild(kort);
      });
      vist += naeste.length;
      antal.textContent = vist + " af " + projekter.length + " projekter vist";
      flere.disabled = vist >= projekter.length;
      if (flere.disabled) flere.textContent = "Alle projekter er vist";
    }
    flere.addEventListener("click", visFlere);
    demo.replaceChildren(gitter, flere, antal);
    visFlere();
  });

  // Galleri: projekter som små motiver, der åbner en dialog med detaljer
  hver("projektgalleri", function (demo) {
    var motiver = ["art-tile-one", "art-tile-two", "art-tile-three", "art-tile-four"];
    var titel = el("h3", { id: "art-dialog-title" });
    var tekst = el("p", { class: "art-dialog-copy" });
    var bidrag = el("p", { class: "art-dialog-copy" });
    var tags = el("ul", { class: "levende-tags" });
    var stor = el("div", { class: "art-large", "aria-hidden": "true" });
    var luk = el("button", { type: "button", class: "art-dialog-close", "aria-label": "Luk", text: "×" });
    var dialog = el("dialog", { class: "art-dialog", "aria-labelledby": "art-dialog-title" }, [
      luk, stor, el("span", { class: "eyebrow", text: "Projekt" }), titel, tekst, bidrag, tags
    ]);
    var aabner;
    var fliser = projekter.map(function (p, i) {
      var b = el("button", { type: "button", class: "art-tile " + motiver[i % motiver.length], "aria-label": "Åbn projekt: " + p.navn }, [el("span", { text: p.navn })]);
      b.addEventListener("click", function () {
        aabner = b;
        titel.textContent = p.titel;
        tekst.textContent = p.resume;
        bidrag.textContent = "Mit bidrag: " + p.bidrag;
        tags.replaceChildren.apply(tags, p.kompetencer.map(function (k) { return el("li", { class: "tag", text: k }); }));
        stor.dataset.art = String(i % motiver.length);
        if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
        luk.focus();
      });
      return b;
    });
    function lukDialog() {
      if (typeof dialog.close === "function" && dialog.open) dialog.close(); else dialog.removeAttribute("open");
      if (aabner) aabner.focus();
    }
    luk.addEventListener("click", lukDialog);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) lukDialog(); });
    demo.replaceChildren(el("div", { class: "art-gallery", role: "group", "aria-label": "Vælg et projekt" }, fliser), dialog);
  });

  // Vendekort: forsiden spørger, bagsiden svarer
  hver("projektvendekort", function (demo) {
    var i = 0;
    var forside = el("span", { class: "flip-card-face flip-card-front" });
    var bagside = el("span", { class: "flip-card-face flip-card-back", "aria-hidden": "true" });
    var kort = el("button", { type: "button", class: "flip-card", "aria-pressed": "false" }, [el("span", { class: "flip-card-inner" }, [forside, bagside])]);
    var status = el("span", { class: "flip-card-status", "aria-live": "polite" });
    function tegn() {
      var p = projekter[i];
      var vendt = kort.classList.contains("is-flipped");
      forside.replaceChildren(el("small", { text: to(i + 1) + " / " + to(projekter.length) + " · " + p.kategori.toUpperCase() }), el("strong", { text: p.navn }), el("span", { text: "Hvad lavede jeg? Vend kortet." }));
      bagside.replaceChildren(el("small", { text: "MIT BIDRAG" }), el("strong", { class: "flip-card-long", text: p.bidrag }), el("span", { text: p.kompetencer.join(" · ") }));
      forside.setAttribute("aria-hidden", String(vendt));
      bagside.setAttribute("aria-hidden", String(!vendt));
      kort.setAttribute("aria-pressed", String(vendt));
      kort.setAttribute("aria-label", vendt ? p.navn + ". Mit bidrag: " + p.bidrag : p.navn + ". Vend kortet for at læse mit bidrag.");
      status.textContent = vendt ? "Bagsiden: mit bidrag til " + p.navn + "." : "Forsiden: " + p.navn + ".";
    }
    kort.addEventListener("click", function () { kort.classList.toggle("is-flipped"); tegn(); });
    function skift(retning) {
      i = (i + retning + projekter.length) % projekter.length;
      kort.classList.remove("is-flipped");
      tegn();
    }
    demo.replaceChildren(
      kort,
      el("div", { class: "flashcard-controls" }, [
        el("button", { type: "button", "aria-label": "Forrige projekt", text: "←", onclick: function () { skift(-1); } }),
        el("button", { type: "button", "aria-label": "Næste projekt", text: "→", onclick: function () { skift(1); } })
      ]),
      status
    );
    tegn();
  });

  // ======================================================================
  // CV (data/cv.js)
  // ======================================================================
  var cv = DATA.cv || { forloeb: [], omraader: [], grundstoffer: [], vaerdier: [], grupper: {} };
  var tidslinje = cv.forloeb.slice().reverse(); // ældst først

  // Ruten: fire stop på vejen fra lingvistik til klasseværelset
  hver("cvrute", function (demo) {
    var ns = "http://www.w3.org/2000/svg";
    var sti = "M28 111 C75 111 78 42 130 42 S184 115 235 105 290 34 369 50";
    var punkter = [[28, 111], [130, 42], [235, 105], [369, 50]];
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "idea-route-map");
    svg.setAttribute("viewBox", "0 0 400 150");
    svg.setAttribute("aria-hidden", "true");
    var spor = document.createElementNS(ns, "path");
    spor.setAttribute("class", "idea-route-track");
    spor.setAttribute("d", sti);
    var fremdrift = document.createElementNS(ns, "path");
    fremdrift.setAttribute("class", "idea-route-progress");
    fremdrift.setAttribute("d", sti);
    svg.appendChild(spor);
    svg.appendChild(fremdrift);
    var markoerer = tidslinje.slice(0, 4).map(function (f, i) {
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", punkter[i][0]);
      c.setAttribute("cy", punkter[i][1]);
      c.setAttribute("r", "9");
      svg.appendChild(c);
      var aar = document.createElementNS(ns, "text");
      aar.setAttribute("class", "route-year");
      aar.setAttribute("x", punkter[i][0]);
      aar.setAttribute("y", punkter[i][1] + (punkter[i][1] > 75 ? 28 : -18));
      aar.textContent = f.aar;
      svg.appendChild(aar);
      return c;
    });
    var titel = el("strong");
    var sted = el("span", { class: "route-place" });
    var detalje = el("div", { class: "route-detail", "aria-live": "polite" }, [titel, sted]);
    var knapper = tidslinje.slice(0, 4).map(function (f, i) {
      return el("button", { type: "button", "aria-pressed": String(i === 0), text: f.aar + " · " + f.kort });
    });
    var laengde = 1;
    function vaelg(i) {
      var f = tidslinje[i];
      markoerer.forEach(function (m, j) { m.classList.toggle("is-active", j <= i); });
      tryk(knapper, knapper[i]);
      titel.textContent = f.titel;
      sted.textContent = f.sted + " · " + f.fra + " – " + f.til;
      fremdrift.style.setProperty("--route-length", laengde);
      fremdrift.style.setProperty("--route-offset", laengde * (1 - i / (markoerer.length - 1)));
    }
    knapper.forEach(function (k, i) { k.addEventListener("click", function () { vaelg(i); }); });
    demo.replaceChildren(svg, el("div", { class: "route-stops", role: "group", "aria-label": "Vælg et stop på min vej" }, knapper), detalje);
    try { laengde = fremdrift.getTotalLength(); } catch (e) {}
    vaelg(0);
  });

  // Trin for trin: hvad jeg lavede og lærte hvert sted
  hver("cvtrin", function (demo) {
    var i = 0;
    var liste = el("ol", { class: "process-steps" });
    var knapper = tidslinje.map(function (f, j) {
      var b = el("button", { type: "button" }, [el("span", { text: to(j + 1) }), el("strong", { text: f.kort })]);
      b.addEventListener("click", function () { i = j; tegn(); });
      liste.appendChild(el("li", null, [b]));
      return b;
    });
    var overskrift = el("strong", { class: "cv-step-title" });
    var punkter = el("ul", { class: "cv-step-points" });
    var beskrivelse = el("div", { class: "cv-step", "aria-live": "polite" }, [overskrift, punkter]);
    var forrige = el("button", { type: "button", class: "process-previous", text: "← Forrige" });
    var naeste = el("button", { type: "button", class: "process-next", text: "Næste →" });
    var taeller = el("span", { class: "process-count" });
    function tegn() {
      var f = tidslinje[i];
      knapper.forEach(function (k, j) { if (j === i) k.setAttribute("aria-current", "step"); else k.removeAttribute("aria-current"); });
      liste.style.setProperty("--process-progress", (tidslinje.length > 1 ? i / (tidslinje.length - 1) * 84 : 0) + "%");
      overskrift.textContent = f.titel + ", " + f.sted;
      punkter.replaceChildren.apply(punkter, f.punkter.map(function (p) { return el("li", { text: p }); }));
      forrige.disabled = i === 0;
      naeste.disabled = i === tidslinje.length - 1;
      taeller.textContent = f.fra + " – " + f.til;
    }
    forrige.addEventListener("click", function () { if (i > 0) { i--; tegn(); } });
    naeste.addEventListener("click", function () { if (i < tidslinje.length - 1) { i++; tegn(); } });
    demo.replaceChildren(liste, beskrivelse, el("div", { class: "process-controls" }, [forrige, taeller, naeste]));
    tegn();
  });

  // Medaljer: de ti kompetenceområder
  hver("cvmedaljer", function (demo) {
    var toner = ["#bc9655", "#648d87", "#7c85a1", "#638c76", "#b87668", "#517a8f", "#8a7a5c", "#6f8f6a", "#a0705a", "#5d6f8c"];
    var navn = el("strong");
    var tekst = el("p");
    var evner = el("ul", { class: "levende-tags" });
    var status = el("div", { class: "badge-detail", "aria-live": "polite" }, [navn, tekst, evner]);
    var knapper = cv.omraader.map(function (o, i) {
      var b = el("button", { class: "skill-badge", type: "button", "aria-pressed": String(i === 0) }, [
        el("span", { class: "badge-medal", "aria-hidden": "true", text: o.ikon }),
        el("strong", { text: o.titel })
      ]);
      b.style.setProperty("--badge-tone", toner[i % toner.length]);
      b.addEventListener("click", function () { vis(i); });
      return b;
    });
    function vis(i) {
      var o = cv.omraader[i];
      tryk(knapper, knapper[i]);
      navn.textContent = o.titel;
      tekst.textContent = o.beskrivelse;
      evner.replaceChildren.apply(evner, o.evner.map(function (e) { return el("li", { class: "tag", text: e }); }));
    }
    demo.replaceChildren(el("div", { class: "badge-grid badge-grid-ten", role: "group", "aria-label": "Vælg et kompetenceområde" }, knapper), status);
    vis(0);
  });

  // Det periodiske system: værktøjer, sprog og skolefag
  hver("cvsystem", function (demo) {
    var navn = el("strong", { class: "element-name", text: "Vælg et grundstof" });
    var type = el("span", { class: "element-type", text: "Mine byggesten" });
    var fakta = el("p", { class: "element-fact", text: "Hvert felt er noget fra mit CV." });
    var knapper = cv.grundstoffer.map(function (g, i) {
      var b = el("button", { type: "button", "aria-pressed": "false", "data-gruppe": g.gruppe }, [
        el("small", { text: to(i + 1) }), el("strong", { text: g.symbol }), el("span", { text: g.navn })
      ]);
      b.addEventListener("click", function () {
        tryk(knapper, b);
        navn.textContent = g.navn;
        type.textContent = cv.grupper[g.gruppe] || "";
        fakta.textContent = g.note;
      });
      return b;
    });
    demo.replaceChildren(
      el("div", { class: "curiosity-grid curiosity-grid-cv", role: "group", "aria-label": "Vælg et grundstof fra mit CV" }, knapper),
      el("div", { class: "element-detail", "aria-live": "polite" }, [navn, type, fakta]),
      el("p", { class: "levende-legende" }, Object.keys(cv.grupper).map(function (g) {
        return el("span", { "data-gruppe": g, text: cv.grupper[g] });
      }))
    );
  });

  // Gardinerne: mine fire værdier
  hver("vaerdigardin", function (demo) {
    var klasser = ["curtain-one", "curtain-two", "curtain-three", "curtain-four"];
    var status = el("span", { class: "curtain-status", "aria-live": "polite", text: "Vælg en værdi for at folde den ud." });
    var paneler = cv.vaerdier.map(function (v, i) {
      var tekst = el("span", { class: "curtain-copy", hidden: true, text: v.tekst });
      var p = el("button", { type: "button", class: "curtain-panel " + klasser[i % 4], "aria-expanded": "false" }, [
        el("span", { class: "curtain-number", text: to(i + 1) }), el("strong", { text: v.navn }), tekst
      ]);
      p.addEventListener("click", function () {
        var var_aaben = p.getAttribute("aria-expanded") === "true";
        paneler.forEach(function (o) {
          var aaben = o === p && !var_aaben;
          o.setAttribute("aria-expanded", String(aaben));
          o.querySelector(".curtain-copy").hidden = !aaben;
        });
        status.textContent = var_aaben ? "Vælg en værdi for at folde den ud." : v.navn + " er foldet ud. Tryk igen eller Escape for at lukke.";
      });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && p.getAttribute("aria-expanded") === "true") { p.click(); p.focus(); }
      });
      return p;
    });
    demo.replaceChildren(el("div", { class: "curtain-gallery", role: "group", "aria-label": "Mine værdier" }, paneler), status);
  });

  // ======================================================================
  // SPROG (data/ordnet.js) — kan senere skiftes ud med Hyponet
  // ======================================================================
  var ordnet = DATA.ordnet || { begreber: [], relationer: {}, start: "" };
  var begreb = {};
  ordnet.begreber.forEach(function (b) { begreb[b.id] = b; });
  function under(id) { return ordnet.begreber.filter(function (b) { return b.over === id; }); }
  function dele(id) { return ordnet.begreber.filter(function (b) { return b.del === id; }); }
  function relateret(id) {
    var b = begreb[id];
    var ud = (b.se || []).filter(function (x) { return begreb[x]; });
    ordnet.begreber.forEach(function (o) { if ((o.se || []).indexOf(id) > -1 && ud.indexOf(o.id) === -1) ud.push(o.id); });
    return ud;
  }
  function find(ord) {
    var q = ord.trim().toLocaleLowerCase("da");
    for (var i = 0; i < ordnet.begreber.length; i++) {
      if (ordnet.begreber[i].ord.toLocaleLowerCase("da") === q) return ordnet.begreber[i];
    }
    return null;
  }

  // Det semantiske netværk: vælg et begreb, så samles dets naboer omkring det
  hver("ordnetvaerk", function (demo) {
    var ns = "http://www.w3.org/2000/svg";
    var aktiv = begreb[ordnet.start] ? ordnet.start : (ordnet.begreber[0] || {}).id;
    var historik = [];
    var vis = { over: true, del: true, se: true };
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "semantic-graph");
    svg.setAttribute("viewBox", "0 0 440 260");
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Begreber omkring det valgte ord");
    var titel = el("strong");
    var def = el("p");
    var relationsliste = el("ul", { class: "network-relations" });
    var tilbage = el("button", { type: "button", class: "network-back", text: "← Tilbage", disabled: true });
    var filtre = Object.keys(vis).map(function (r) {
      var cb = el("input", { type: "checkbox", checked: true });
      cb.addEventListener("change", function () { vis[r] = cb.checked; tegn(); });
      return el("label", { class: "network-filter network-filter-" + r }, [cb, " " + ordnet.relationer[r].navn]);
    });

    function naboer(id) {
      var b = begreb[id];
      var n = [];
      if (vis.over && b.over && begreb[b.over]) n.push({ id: b.over, rel: "over", tekst: b.ord + " er en slags " + begreb[b.over].ord });
      if (vis.over) under(id).forEach(function (u) { n.push({ id: u.id, rel: "over", tekst: u.ord + " er en slags " + b.ord }); });
      if (vis.del && b.del && begreb[b.del]) n.push({ id: b.del, rel: "del", tekst: b.ord + " er en del af " + begreb[b.del].ord });
      if (vis.del) dele(id).forEach(function (d) { n.push({ id: d.id, rel: "del", tekst: d.ord + " er en del af " + b.ord }); });
      if (vis.se) relateret(id).forEach(function (r) { n.push({ id: r, rel: "se", tekst: b.ord + " hænger sammen med " + begreb[r].ord }); });
      return n.slice(0, 10);
    }

    function gaaTil(id, frem) {
      if (frem) historik.push(aktiv);
      aktiv = id;
      tegn();
      var fokus = svg.querySelector('[data-id="' + id + '"]');
      if (fokus) fokus.focus();
    }

    function node(id, x, y, r, valgt) {
      var g = document.createElementNS(ns, "g");
      g.setAttribute("class", "semantic-node" + (valgt ? " is-selected" : ""));
      g.setAttribute("data-id", id);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", begreb[id].ord + (valgt ? " (valgt)" : ""));
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", r);
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", x); t.setAttribute("y", y + 3);
      // Lange ord deles over to linjer, ved mellemrum eller med bindestreg midt i sammensætningen
      var ord = begreb[id].ord;
      var linjer = [ord];
      if (ord.length > (valgt ? 12 : 9)) {
        var mellemrum = ord.indexOf(" ");
        var midt = Math.ceil(ord.length / 2);
        linjer = mellemrum > 0 ? [ord.slice(0, mellemrum), ord.slice(mellemrum + 1)] : [ord.slice(0, midt) + "-", ord.slice(midt)];
      }
      linjer.forEach(function (l, i) {
        var ts = document.createElementNS(ns, "tspan");
        ts.setAttribute("x", x);
        ts.setAttribute("dy", i === 0 ? (linjer.length > 1 ? "-0.5em" : "0") : "1.1em");
        ts.textContent = l;
        t.appendChild(ts);
      });
      g.appendChild(c); g.appendChild(t);
      if (!valgt) {
        g.addEventListener("click", function () { gaaTil(id, true); });
        g.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); gaaTil(id, true); }
        });
      }
      return g;
    }

    function tegn() {
      var b = begreb[aktiv];
      var n = naboer(aktiv);
      svg.replaceChildren();
      var kanter = document.createElementNS(ns, "g");
      kanter.setAttribute("class", "semantic-edges");
      var noder = document.createElementNS(ns, "g");
      noder.setAttribute("class", "semantic-nodes");
      var cx = 220, cy = 130;
      n.forEach(function (nb, i) {
        var vinkel = -Math.PI / 2 + i * 2 * Math.PI / n.length;
        var x = cx + Math.cos(vinkel) * 165;
        var y = cy + Math.sin(vinkel) * 98;
        var linje = document.createElementNS(ns, "line");
        linje.setAttribute("x1", cx); linje.setAttribute("y1", cy);
        linje.setAttribute("x2", x); linje.setAttribute("y2", y);
        linje.setAttribute("class", "edge-" + nb.rel);
        kanter.appendChild(linje);
        noder.appendChild(node(nb.id, x, y, 27, false));
      });
      noder.appendChild(node(aktiv, cx, cy, 36, true));
      svg.appendChild(kanter);
      svg.appendChild(noder);

      titel.textContent = b.ord + " (" + b.klasse + ")";
      def.textContent = b.def;
      relationsliste.replaceChildren.apply(relationsliste, n.length ? n.map(function (nb) {
        return el("li", { class: "rel-" + nb.rel, text: nb.tekst });
      }) : [el("li", { text: "Ingen forbindelser med de valgte filtre." })]);
      tilbage.disabled = historik.length === 0;
    }

    tilbage.addEventListener("click", function () { if (historik.length) gaaTil(historik.pop(), false); });
    demo.replaceChildren(
      svg,
      el("div", { class: "network-controls" }, [
        el("fieldset", { class: "network-filters" }, [el("legend", { text: "Vis forhold" })].concat(filtre)),
        el("div", { class: "network-detail", "aria-live": "polite" }, [titel, def, relationsliste]),
        tilbage
      ])
    );
    tegn();
  });

  // Ordkort: lingvistiske fagord fra ordnettet
  hver("ordkort", function (demo) {
    var kort = ordnet.begreber.filter(function (b) { return b.kort; });
    var kendte = gemt("ordkort-kendte", []);
    var i = 0;
    var forside = el("span", { class: "flashcard-face flashcard-front" });
    var bagside = el("span", { class: "flashcard-face flashcard-back", hidden: true });
    var knap = el("button", { class: "flashcard", type: "button" }, [forside, bagside]);
    var kan = el("button", { type: "button", class: "flashcard-know", "aria-pressed": "false" });
    var status = el("span", { class: "flashcard-known", "aria-live": "polite" });
    function tegn() {
      var b = kort[i];
      var vendt = knap.classList.contains("is-flipped");
      var kendt = kendte.indexOf(b.id) > -1;
      forside.replaceChildren(el("span", { class: "flashcard-index", text: to(i + 1) + " / " + to(kort.length) }), el("strong", { text: b.ord }), el("span", { text: "Tryk for at se betydningen" }));
      bagside.replaceChildren(el("span", { class: "flashcard-index", text: "BETYDNING" }), el("strong", { class: "flashcard-def", text: b.def }), el("span", { text: b.over && begreb[b.over] ? "En slags " + begreb[b.over].ord : "Tryk for at vende tilbage" }));
      forside.hidden = vendt;
      bagside.hidden = !vendt;
      knap.setAttribute("aria-label", vendt ? b.ord + ": " + b.def : b.ord + ". Vend kortet for at se betydningen.");
      kan.setAttribute("aria-pressed", String(kendt));
      kan.textContent = kendt ? "✓ Det kan jeg" : "Det kan jeg";
      status.textContent = kendte.length + " af " + kort.length + " fagord markeret som kendte · gemmes i din browser";
    }
    function skift(r) {
      i = (i + r + kort.length) % kort.length;
      knap.classList.remove("is-flipped");
      tegn();
    }
    knap.addEventListener("click", function () { knap.classList.toggle("is-flipped"); tegn(); });
    kan.addEventListener("click", function () {
      var id = kort[i].id;
      var p = kendte.indexOf(id);
      if (p > -1) kendte.splice(p, 1); else kendte.push(id);
      gem("ordkort-kendte", kendte);
      tegn();
    });
    demo.replaceChildren(knap, el("div", { class: "flashcard-controls" }, [
      el("button", { type: "button", "data-flash-step": "-1", "aria-label": "Forrige ord", text: "←", onclick: function () { skift(-1); } }),
      kan,
      el("button", { type: "button", "aria-label": "Næste ord, som du ikke kan endnu", text: "Øv de svære", onclick: function () {
        for (var n = 1; n <= kort.length; n++) {
          var j = (i + n) % kort.length;
          if (kendte.indexOf(kort[j].id) === -1) { i = j; knap.classList.remove("is-flipped"); tegn(); return; }
        }
        status.textContent = "Du har markeret alle fagord som kendte. Flot!";
      } }),
      el("button", { type: "button", "data-flash-step": "1", "aria-label": "Næste ord", text: "→", onclick: function () { skift(1); } })
    ]), status);
    tegn();
  });

  // Ordbogen: slå op i ordnettet, eller skriv dit eget ord. Dine egne ord gemmes i browseren
  hver("ordbog", function (demo) {
    var egne = gemt("ordbog", []);
    var ordFelt = el("input", { class: "wordmaker-word", type: "text", maxlength: "32", list: "ordbog-forslag", value: "hyponymi", autocomplete: "off" });
    var klasse = el("select", { class: "wordmaker-type" }, ["navneord", "udsagnsord", "tillægsord"].map(function (k) { return el("option", { value: k, text: k[0].toUpperCase() + k.slice(1) }); }));
    var forklaring = el("textarea", { class: "wordmaker-definition", maxlength: "160", rows: "2" });
    var signatur = el("input", { class: "wordmaker-author", type: "text", maxlength: "36", value: "Villads" });
    var status = el("span", { class: "wordmaker-status", "aria-live": "polite" });
    var forslag = el("datalist", { id: "ordbog-forslag" });
    var pOrd = el("strong", { class: "wordmaker-preview-word" });
    var pKlasse = el("span", { class: "wordmaker-preview-type" });
    var pDef = el("p", { class: "wordmaker-preview-definition" });
    var pRel = el("span", { class: "wordmaker-example" });
    var pForf = el("span", { class: "wordmaker-preview-author" });
    var pInit = el("span", { class: "wordmaker-initial" });
    var kortet = el("div", { class: "wordmaker-card", role: "img" }, [pInit, el("span", { class: "wordmaker-label", text: "ET LILLE OPSLAG" }), pOrd, pKlasse, pDef, pRel, pForf]);
    var mineOrd = el("ul", { class: "wordbook-list" });

    function opdaterForslag() {
      var alle = ordnet.begreber.map(function (b) { return b.ord; }).concat(egne.map(function (e) { return e.ord; }));
      forslag.replaceChildren.apply(forslag, alle.map(function (o) { return el("option", { value: o }); }));
    }
    function relationer(b) {
      if (!b) return "";
      var dele_ = [];
      if (b.over && begreb[b.over]) dele_.push("En slags " + begreb[b.over].ord);
      var u = under(b.id).map(function (x) { return x.ord; });
      if (u.length) dele_.push("Underbegreber: " + u.slice(0, 4).join(", "));
      if (b.del && begreb[b.del]) dele_.push("Del af " + begreb[b.del].ord);
      return dele_.join(" · ");
    }
    function tegnKort() {
      var o = ordFelt.value.trim() || "dit ord";
      pInit.textContent = o[0].toUpperCase() + o[0].toLowerCase();
      pOrd.textContent = o;
      pKlasse.textContent = "(" + klasse.value + ")";
      pDef.textContent = forklaring.value.trim() || "En forklaring venter på at blive skrevet.";
      pRel.textContent = relationer(find(o)) || "Fra min personlige ordbog";
      pForf.textContent = signatur.value.trim() ? "Signeret " + signatur.value.trim() : "";
      kortet.setAttribute("aria-label", "Ordbogskort: " + o + ". " + pDef.textContent);
    }
    function slaaOp() {
      var b = find(ordFelt.value);
      var egen = egne.filter(function (e) { return e.ord.toLocaleLowerCase("da") === ordFelt.value.trim().toLocaleLowerCase("da"); })[0];
      if (b) {
        klasse.value = b.klasse;
        forklaring.value = b.def;
        status.textContent = "Fundet i ordnettet. Ret gerne forklaringen, før du gemmer.";
      } else if (egen) {
        klasse.value = egen.klasse;
        forklaring.value = egen.def;
        status.textContent = "Fundet i din egen ordbog.";
      } else {
        status.textContent = "Nyt ord — skriv din egen forklaring.";
      }
      tegnKort();
    }
    function tegnListe() {
      mineOrd.replaceChildren.apply(mineOrd, egne.length ? egne.map(function (e, i) {
        return el("li", null, [
          el("button", { type: "button", class: "wordbook-open", text: e.ord, onclick: function () { ordFelt.value = e.ord; slaaOp(); } }),
          el("button", { type: "button", class: "todo-action", "aria-label": "Slet " + e.ord, text: "×", onclick: function () {
            egne.splice(i, 1); gem("ordbog", egne); tegnListe(); opdaterForslag(); status.textContent = e.ord + " er slettet fra din ordbog.";
          } })
        ]);
      }) : [el("li", { class: "wordbook-empty", text: "Din ordbog er tom endnu." })]);
    }
    function svgKort() {
      var x = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
      var linjer = [];
      var ord_ = pDef.textContent.split(" ");
      var l = "";
      ord_.forEach(function (w) { if ((l + " " + w).length > 44) { linjer.push(l); l = w; } else l = l ? l + " " + w : w; });
      if (l) linjer.push(l);
      return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">' +
        '<rect width="600" height="340" rx="24" fill="#f6f4ef"/><rect x="20" y="20" width="560" height="300" rx="16" fill="#fff" stroke="#e2ddd2"/>' +
        '<text x="48" y="70" font-family="Inter, sans-serif" font-size="13" letter-spacing="3" fill="#5b6770">ET LILLE OPSLAG</text>' +
        '<text x="48" y="122" font-family="Fraunces, Georgia, serif" font-size="44" fill="#1f2a33">' + x(pOrd.textContent) + '</text>' +
        '<text x="48" y="152" font-family="Inter, sans-serif" font-size="16" font-style="italic" fill="#2f5d73">' + x(pKlasse.textContent) + '</text>' +
        linjer.map(function (t, i) { return '<text x="48" y="' + (196 + i * 26) + '" font-family="Inter, sans-serif" font-size="18" fill="#1f2a33">' + x(t) + '</text>'; }).join("") +
        '<text x="48" y="296" font-family="Inter, sans-serif" font-size="13" fill="#5b6770">' + x(pRel.textContent) + '</text>' +
        '<text x="552" y="296" text-anchor="end" font-family="Inter, sans-serif" font-size="13" fill="#5b6770">' + x(pForf.textContent) + '</text></svg>';
    }

    ordFelt.addEventListener("change", slaaOp);
    ordFelt.addEventListener("input", function () { if (find(ordFelt.value)) slaaOp(); else tegnKort(); });
    [klasse, forklaring, signatur].forEach(function (f) { f.addEventListener("input", tegnKort); });

    var gemKnap = el("button", { class: "btn btn-ghost", type: "button", text: "Gem i min ordbog", onclick: function () {
      var o = ordFelt.value.trim();
      if (!o || !forklaring.value.trim()) { status.textContent = "Skriv både et ord og en forklaring først."; return; }
      egne = egne.filter(function (e) { return e.ord.toLocaleLowerCase("da") !== o.toLocaleLowerCase("da"); });
      egne.unshift({ ord: o, klasse: klasse.value, def: forklaring.value.trim() });
      egne = egne.slice(0, 50);
      gem("ordbog", egne);
      tegnListe(); opdaterForslag();
      status.textContent = o + " er gemt i din ordbog i denne browser.";
    } });
    var hentKnap = el("button", { class: "btn btn-primary wordmaker-download", type: "button", text: "Hent kortet som SVG", onclick: function () {
      var url = URL.createObjectURL(new Blob([svgKort()], { type: "image/svg+xml" }));
      var a = el("a", { href: url, download: "ordbogskort-" + (ordFelt.value.trim() || "ord").replace(/[^\wæøåÆØÅ-]+/g, "-").toLowerCase() + ".svg" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      status.textContent = "Kortet er hentet som SVG.";
    } });

    demo.replaceChildren(
      el("form", { class: "wordmaker-form", onsubmit: function (e) { e.preventDefault(); slaaOp(); } }, [
        el("label", null, ["Slå et ord op ", ordFelt, forslag]),
        el("label", null, ["Ordklasse ", klasse]),
        el("label", null, ["Forklaring ", forklaring]),
        el("label", null, ["Signatur ", signatur]),
        el("div", { class: "wordmaker-actions" }, [gemKnap, hentKnap]),
        status
      ]),
      el("div", { class: "wordmaker-side" }, [kortet, el("div", { class: "wordbook" }, [el("span", { class: "wordbook-title", text: "Min ordbog" }), mineOrd])])
    );
    opdaterForslag(); tegnListe(); slaaOp();
  });

  // Bogstaver: stav et navn med det danske stavealfabet, og få det læst op
  hver("stavehjaelp", function (demo) {
    var alfabet = (DATA.undervisning || {}).stavealfabet || {};
    var felt = el("input", { class: "spell-input", type: "text", maxlength: "24", value: "Villads", "aria-label": "Ord eller navn, der skal staves", autocomplete: "off" });
    var bogstaver = el("span", { class: "letter-buttons", role: "group", "aria-label": "Bogstaverne i ordet" });
    var stavning = el("p", { class: "spell-output", "aria-live": "polite" });
    var kanTale = "speechSynthesis" in window;
    function sig(tekst) {
      if (!kanTale) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(tekst);
      u.lang = "da-DK";
      u.rate = .9;
      speechSynthesis.speak(u);
    }
    function hop(b) {
      b.classList.remove("is-bouncing");
      void b.offsetWidth;
      b.classList.add("is-bouncing");
    }
    function tegn() {
      var tegnene = Array.from(felt.value.toUpperCase()).filter(function (c) { return c.trim(); });
      bogstaver.replaceChildren.apply(bogstaver, tegnene.map(function (c) {
        var navn = alfabet[c];
        var b = el("button", { type: "button", "aria-label": navn ? c + " som i " + navn : c, text: c });
        b.addEventListener("click", function () {
          hop(b);
          stavning.textContent = navn ? c + " som i " + navn : c;
          sig(navn ? c + " som i " + navn : c);
        });
        b.addEventListener("animationend", function () { b.classList.remove("is-bouncing"); });
        return b;
      }));
      stavning.textContent = tegnene.map(function (c) { return alfabet[c] || c; }).join(" – ");
    }
    felt.addEventListener("input", tegn);
    demo.replaceChildren(
      felt,
      bogstaver,
      stavning,
      el("div", { class: "spell-actions" }, [
        kanTale ? el("button", { type: "button", class: "spell-read", text: "Læs det hele op", onclick: function () {
          sig(Array.from(felt.value.toUpperCase()).filter(function (c) { return c.trim(); }).map(function (c) { return alfabet[c] ? c + " som i " + alfabet[c] : c; }).join(". "));
        } }) : null,
        el("span", { class: "demo-note", text: kanTale ? "Klik på et bogstav for at høre det." : "Din browser kan ikke læse op, men stavningen står herover." })
      ])
    );
    tegn();
  });

  // ======================================================================
  // UNDERVISNING (data/undervisning.js)
  // ======================================================================
  var undervisning = DATA.undervisning || {};

  // Huskespil med faglige sæt: find de par, der hører sammen
  hver("huskespil", function (demo) {
    var saet = undervisning.huskespil || [];
    var valg = el("select", { class: "levende-select", "aria-label": "Vælg emne" }, saet.map(function (s, i) { return el("option", { value: String(i), text: s.navn }); }));
    valg.value = String(Math.min(gemt("huskespil-saet", 0), saet.length - 1));
    var gitter = el("div", { class: "memory-grid", role: "group", "aria-label": "Huskespil" });
    var traek = el("strong", { class: "memory-moves", text: "0" });
    var tid = el("strong", { class: "memory-time", text: "00:00" });
    var status = el("span", { class: "memory-status", "aria-live": "polite" });
    var aabne = [], fundne = 0, antalTraek = 0, start = 0, ur = null, laast = false;
    function stopUr() { if (ur) { clearInterval(ur); ur = null; } }
    function nyt() {
      stopUr();
      var s = saet[Number(valg.value)];
      gem("huskespil-saet", Number(valg.value));
      aabne = []; fundne = 0; antalTraek = 0; start = 0; laast = false;
      traek.textContent = "0"; tid.textContent = "00:00";
      status.textContent = "Find de " + s.par.length + " par, der hører sammen.";
      var kort = [];
      s.par.forEach(function (p, i) { kort.push({ tekst: p[0], par: i }); kort.push({ tekst: p[1], par: i }); });
      gitter.replaceChildren.apply(gitter, bland(kort).map(function (k) {
        var b = el("button", { type: "button", class: "memory-card memory-card-text", "aria-pressed": "false", "aria-label": "Skjult kort" }, [el("span", { class: "memory-card-face", text: k.tekst })]);
        b.dataset.par = k.par;
        b.addEventListener("click", function () { vend(b, k); });
        return b;
      }));
    }
    function vend(b, k) {
      if (laast || b.getAttribute("aria-pressed") === "true" || b.dataset.matched === "true") return;
      if (!start) {
        start = Date.now();
        ur = setInterval(function () { var s = Math.floor((Date.now() - start) / 1000); tid.textContent = to(Math.floor(s / 60)) + ":" + to(s % 60); }, 500);
      }
      b.setAttribute("aria-pressed", "true");
      b.setAttribute("aria-label", k.tekst);
      aabne.push(b);
      if (aabne.length < 2) return;
      antalTraek++;
      traek.textContent = String(antalTraek);
      var a = aabne[0], c = aabne[1];
      if (a.dataset.par === c.dataset.par) {
        [a, c].forEach(function (x) { x.dataset.matched = "true"; x.disabled = true; });
        fundne++;
        aabne = [];
        var total = saet[Number(valg.value)].par.length;
        status.textContent = fundne === total ? "Alle par fundet på " + antalTraek + " træk og " + tid.textContent + "!" : "Et par: " + a.textContent + " og " + c.textContent + ".";
        if (fundne === total) stopUr();
      } else {
        laast = true;
        status.textContent = a.textContent + " og " + c.textContent + " hører ikke sammen.";
        setTimeout(function () {
          [a, c].forEach(function (x) { x.setAttribute("aria-pressed", "false"); x.setAttribute("aria-label", "Skjult kort"); });
          aabne = []; laast = false;
        }, 900);
      }
    }
    valg.addEventListener("change", nyt);
    demo.replaceChildren(
      el("div", { class: "memory-score" }, [valg, el("span", null, ["Træk ", traek]), el("span", null, ["Tid ", tid]), el("button", { type: "button", class: "memory-restart", text: "Bland igen", onclick: nyt })]),
      gitter,
      status
    );
    nyt();
  });

  // Elevvælger: skriv klassens navne, slå fravær fra, og træk en tilfældig elev uden gentagelser
  hver("elevvaelger", function (demo) {
    var elever = gemt("elever", []);
    var trukne = [];
    var felt = el("textarea", { class: "picker-names", rows: "3", placeholder: "Skriv et navn pr. linje", "aria-label": "Elevernes navne, et pr. linje" });
    felt.value = elever.map(function (e) { return e.navn; }).join("\n");
    var liste = el("fieldset", { class: "checklist-options" });
    var resultat = el("strong", { class: "picker-result", "aria-live": "polite", text: "—" });
    var status = el("span", { class: "checklist-status", "aria-live": "polite" });
    function tilstede() { return elever.filter(function (e) { return e.her; }); }
    function tegn() {
      liste.replaceChildren.apply(liste, [el("legend", { text: elever.length ? "Hvem er her i dag?" : "Skriv navnene herover først" })].concat(elever.map(function (e) {
        var cb = el("input", { type: "checkbox", checked: e.her });
        var lbl = el("label", { class: e.her ? "is-selected" : "" }, [cb, el("span", { text: e.navn })]);
        cb.addEventListener("change", function () { e.her = cb.checked; lbl.classList.toggle("is-selected", cb.checked); gem("elever", elever); opdaterStatus(); });
        return lbl;
      })));
      opdaterStatus();
    }
    function opdaterStatus() {
      var her = tilstede();
      var tilbage = her.filter(function (e) { return trukne.indexOf(e.navn) === -1; });
      status.textContent = her.length ? her.length + " til stede · " + tilbage.length + " ikke trukket endnu" : "Ingen elever valgt.";
    }
    felt.addEventListener("change", function () {
      var gamle = {};
      elever.forEach(function (e) { gamle[e.navn] = e.her; });
      var set = {};
      elever = felt.value.split(/\n|,/).map(function (n) { return n.trim(); }).filter(function (n) {
        if (!n || set[n]) return false;
        set[n] = true; return true;
      }).slice(0, 40).map(function (n) { return { navn: n, her: gamle[n] !== false }; });
      gem("elever", elever);
      trukne = [];
      tegn();
    });
    demo.replaceChildren(
      el("label", { class: "picker-label" }, ["Klassens navne ", felt]),
      liste,
      el("div", { class: "checklist-footer" }, [
        resultat,
        el("button", { type: "button", class: "picker-draw", text: "Træk en elev", onclick: function () {
          var her = tilstede();
          if (!her.length) { resultat.textContent = "—"; status.textContent = "Der er ingen elever at trække imellem."; return; }
          var tilbage = her.filter(function (e) { return trukne.indexOf(e.navn) === -1; });
          if (!tilbage.length) { trukne = []; tilbage = her; }
          var valgt = tilbage[Math.floor(Math.random() * tilbage.length)];
          trukne.push(valgt.navn);
          resultat.textContent = valgt.navn;
          opdaterStatus();
        } }),
        el("button", { class: "checklist-clear", type: "button", text: "Start forfra", onclick: function () { trukne = []; resultat.textContent = "—"; opdaterStatus(); } })
      ]),
      status,
      el("span", { class: "demo-note", text: "Navnene gemmes kun i din egen browser." })
    );
    tegn();
  });

  // Opgavetimer med hurtigvalg — ballonerne flyver, når tiden er gået
  hver("opgavetimer", function (demo) {
    var slut = 0, ur = null, pauseRest = 0;
    var felter = { m: el("strong", { text: "00" }), s: el("strong", { text: "00" }) };
    var visning = el("div", { class: "countdown-values", role: "timer", "aria-label": "Tid tilbage" }, [
      el("span", null, [felter.m, el("small", { text: "min" })]),
      el("span", null, [felter.s, el("small", { text: "sek" })])
    ]);
    var balloner = el("div", { class: "balloon-row", "aria-hidden": "true" }, ["balloon-gold", "balloon-rose", "balloon-blue"].map(function (k) { return el("span", { class: "party-balloon " + k }, [el("i")]); }));
    var status = el("span", { class: "countdown-status", "aria-live": "polite", text: "Vælg en tid for at starte." });
    var minutter = el("input", { class: "countdown-date timer-minutes", type: "number", min: "1", max: "120", value: "7", "aria-label": "Antal minutter" });
    var pauseKnap = el("button", { type: "button", class: "timer-pause", text: "Pause", disabled: true });
    var lyd = null;
    function bip() {
      try {
        lyd = lyd || new (window.AudioContext || window.webkitAudioContext)();
        [0, .25, .5].forEach(function (t) {
          var o = lyd.createOscillator(), g = lyd.createGain();
          o.frequency.value = 880; g.gain.value = .08;
          o.connect(g); g.connect(lyd.destination);
          o.start(lyd.currentTime + t); o.stop(lyd.currentTime + t + .15);
        });
      } catch (e) {}
    }
    function vis(ms) {
      var s = Math.max(0, Math.ceil(ms / 1000));
      felter.m.textContent = to(Math.floor(s / 60));
      felter.s.textContent = to(s % 60);
    }
    function tik() {
      var rest = slut - Date.now();
      vis(rest);
      if (rest <= 0) {
        clearInterval(ur); ur = null;
        demo.classList.add("is-done");
        pauseKnap.disabled = true;
        status.textContent = "Tiden er gået!";
        bip();
      }
    }
    function start(min) {
      clearInterval(ur);
      demo.classList.remove("is-done");
      slut = Date.now() + min * 60000;
      pauseRest = 0;
      pauseKnap.disabled = false;
      pauseKnap.textContent = "Pause";
      status.textContent = "Timeren kører: " + min + " min.";
      try { if (lyd && lyd.state === "suspended") lyd.resume(); } catch (e) {}
      tik();
      ur = setInterval(tik, 250);
    }
    pauseKnap.addEventListener("click", function () {
      if (ur) {
        clearInterval(ur); ur = null;
        pauseRest = slut - Date.now();
        pauseKnap.textContent = "Fortsæt";
        status.textContent = "Timeren er sat på pause.";
      } else if (pauseRest > 0) {
        slut = Date.now() + pauseRest;
        pauseRest = 0;
        pauseKnap.textContent = "Pause";
        status.textContent = "Timeren kører igen.";
        ur = setInterval(tik, 250);
      }
    });
    demo.replaceChildren(
      balloner, visning,
      el("div", { class: "timer-presets", role: "group", "aria-label": "Hurtigvalg" }, (undervisning.timer || [5, 10]).map(function (m) {
        return el("button", { type: "button", text: m + " min", onclick: function () { start(m); } });
      })),
      el("div", { class: "timer-custom" }, [minutter, el("button", { type: "button", text: "Start", onclick: function () {
        var m = Math.min(120, Math.max(1, Number(minutter.value) || 1));
        minutter.value = m;
        start(m);
      } }), pauseKnap]),
      status
    );
  });

  // Materialeberegner: hvor meget skal der bruges til hele klassen?
  hver("materialer", function (demo) {
    var m = undervisning.materialer || { navn: "", proGruppe: [] };
    var elever = el("input", { class: "recipe-servings", type: "range", min: "2", max: "32", value: String(gemt("materialer-elever", 24)), "aria-label": "Antal elever" });
    var gruppe = el("input", { class: "recipe-servings", type: "range", min: "2", max: "6", value: String(gemt("materialer-gruppe", 3)), "aria-label": "Elever pr. gruppe" });
    var eVaerdi = el("output", { class: "recipe-servings-value" });
    var gVaerdi = el("output", { class: "recipe-servings-value" });
    var liste = el("ul", { class: "recipe-ingredients" });
    var status = el("span", { class: "recipe-status", "aria-live": "polite" });
    function tegn() {
      var e = Number(elever.value), g = Number(gruppe.value);
      var grupper = Math.ceil(e / g);
      gem("materialer-elever", e); gem("materialer-gruppe", g);
      eVaerdi.textContent = e; gVaerdi.textContent = g;
      liste.replaceChildren.apply(liste, m.proGruppe.map(function (t) {
        return el("li", null, [el("span", { text: t.ting + " (" + t.antal + " pr. gruppe)" }), el("strong", { text: (t.antal * grupper) + " " + t.enhed })]);
      }));
      var rest = e % g;
      status.textContent = grupper + " grupper" + (rest ? " — én gruppe får " + rest + (rest === 1 ? " elev" : " elever") + ", så overvej at fordele dem" : " med " + g + " i hver") + ".";
    }
    [elever, gruppe].forEach(function (i) { i.addEventListener("input", tegn); });
    demo.replaceChildren(el("div", { class: "recipe-card" }, [
      el("div", { class: "recipe-card-heading" }, [el("span", { "aria-hidden": "true", text: "✳" }), el("div", null, [el("strong", { text: "Materialer til klassen" }), el("small", { text: m.navn })])]),
      el("label", { class: "recipe-servings-label" }, ["Elever ", eVaerdi]), elever,
      el("label", { class: "recipe-servings-label" }, ["Pr. gruppe ", gVaerdi]), gruppe,
      liste,
      status
    ]));
    tegn();
  });

  // Exit ticket: eleverne svarer på skift, og læreren ser en samlet opgørelse
  hver("exitticket", function (demo) {
    var spm = undervisning.exitTicket || [];
    var svar = gemt("exitticket", []);
    var trin = 0;
    var nu = [];
    var formular = el("form", { class: "survey-form", novalidate: true });
    var faser = spm.map(function (s, i) {
      var fs = el("fieldset", { hidden: i > 0 }, [el("legend", { text: s.spoergsmaal })]);
      if (s.svar.length) {
        s.svar.forEach(function (v) { fs.appendChild(el("label", null, [el("input", { type: "radio", name: "exit-" + i, value: v }), " " + v])); });
      } else {
        fs.appendChild(el("textarea", { class: "exit-text", rows: "2", maxlength: "200", "aria-label": s.spoergsmaal }));
      }
      return fs;
    });
    var tilbage = el("button", { type: "button", class: "survey-previous", text: "← Tilbage", disabled: true });
    var frem = el("button", { type: "button", class: "survey-next", text: "Næste →" });
    var fremdrift = el("span", { class: "survey-progress", "aria-live": "polite" });
    var status = el("span", { class: "survey-status", "aria-live": "polite" });
    var oversigt = el("div", { class: "survey-result exit-summary" });
    function vaerdi(i) {
      var fs = faser[i];
      var r = fs.querySelector("input:checked");
      if (r) return r.value;
      var t = fs.querySelector("textarea");
      return t ? t.value.trim() : "";
    }
    function vis() {
      faser.forEach(function (f, i) { f.hidden = i !== trin; });
      tilbage.disabled = trin === 0;
      frem.textContent = trin === spm.length - 1 ? "Aflevér" : "Næste →";
      fremdrift.textContent = "Spørgsmål " + (trin + 1) + " af " + spm.length;
    }
    function opgoer() {
      if (!svar.length) { oversigt.replaceChildren(el("strong", { text: "Ingen svar endnu" })); return; }
      var dele_ = [el("strong", { text: svar.length + (svar.length === 1 ? " elev har" : " elever har") + " svaret" })];
      spm.forEach(function (s, i) {
        if (s.svar.length) {
          var taelling = s.svar.map(function (v) { return v + ": " + svar.filter(function (x) { return x[i] === v; }).length; });
          dele_.push(el("span", { class: "survey-summary", text: s.spoergsmaal + " — " + taelling.join(" · ") }));
        } else {
          var fri = svar.map(function (x) { return x[i]; }).filter(Boolean).slice(-3);
          if (fri.length) dele_.push(el("span", { class: "survey-summary", text: s.spoergsmaal + " — " + fri.map(function (f) { return "“" + f + "”"; }).join(" ") }));
        }
      });
      oversigt.replaceChildren.apply(oversigt, dele_);
    }
    function tekstOpgoerelse() {
      return ["Exit ticket — " + new Date().toLocaleDateString("da-DK"), svar.length + " svar", ""].concat(spm.map(function (s, i) {
        return s.spoergsmaal + "\n" + (s.svar.length
          ? s.svar.map(function (v) { return "  " + v + ": " + svar.filter(function (x) { return x[i] === v; }).length; }).join("\n")
          : svar.map(function (x) { return x[i]; }).filter(Boolean).map(function (f) { return "  – " + f; }).join("\n"));
      })).join("\n");
    }
    frem.addEventListener("click", function () {
      var v = vaerdi(trin);
      if (!v && spm[trin].svar.length) { status.textContent = "Vælg et svar for at fortsætte."; return; }
      nu[trin] = v;
      status.textContent = "";
      if (trin < spm.length - 1) { trin++; vis(); return; }
      svar.push(nu); gem("exitticket", svar);
      nu = []; trin = 0;
      formular.reset();
      vis(); opgoer();
      status.textContent = "Tak! Klar til næste elev.";
    });
    tilbage.addEventListener("click", function () { if (trin > 0) { trin--; vis(); } });
    faser.forEach(function (f) { formular.appendChild(f); });
    formular.appendChild(el("div", { class: "survey-controls" }, [tilbage, fremdrift, frem]));
    formular.appendChild(status);
    demo.replaceChildren(formular, oversigt, el("div", { class: "exit-actions" }, [
      el("button", { type: "button", text: "Kopiér opgørelse", onclick: function (e) {
        var knap = e.currentTarget;
        var t = tekstOpgoerelse();
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { knap.textContent = "Kopieret ✓"; }, function () { knap.textContent = "Kunne ikke kopiere"; });
        setTimeout(function () { knap.textContent = "Kopiér opgørelse"; }, 2000);
      } }),
      el("button", { type: "button", text: "Ny lektion", onclick: function () {
        if (svar.length && !confirm("Slet de " + svar.length + " svar og start en ny lektion?")) return;
        svar = []; gem("exitticket", svar); opgoer(); status.textContent = "Klar til en ny lektion.";
      } })
    ]));
    vis(); opgoer();
  });

  // ======================================================================
  // LAST.FM — det jeg lytter til
  // ======================================================================
  var lastfmUrl = lokal ? "api/lastfm-eksempel.json" : "api/lastfm.ashx";
  var lastfmTopUrl = lokal ? "api/lastfm-top-eksempel.json" : "api/lastfm.ashx?vis=top";

  // En farvetone ud fra albumcoveret, eller ud fra navnet, hvis coveret ikke kan læses
  function navneTone(tekst) {
    var h = 0;
    for (var i = 0; i < tekst.length; i++) h = (h * 31 + tekst.charCodeAt(i)) % 360;
    return h;
  }
  function coverTone(src) {
    return new Promise(function (ok, fejl) {
      if (!src) return fejl();
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        try {
          var c = document.createElement("canvas");
          c.width = c.height = 16;
          var ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, 16, 16);
          var d = ctx.getImageData(0, 0, 16, 16).data;
          var bedst = null, score = -1;
          for (var i = 0; i < d.length; i += 4) {
            var r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
            var mx = Math.max(r, g, b), mn = Math.min(r, g, b), mt = mx - mn;
            if (mt * mx > score) { score = mt * mx; bedst = [r, g, b, mx, mt]; }
          }
          if (!bedst || bedst[4] < .12) return fejl();
          var r_ = bedst[0], g_ = bedst[1], b_ = bedst[2], m = bedst[3], dd = bedst[4];
          var h = m === r_ ? ((g_ - b_) / dd) % 6 : m === g_ ? (b_ - r_) / dd + 2 : (r_ - g_) / dd + 4;
          ok(Math.round((h * 60 + 360) % 360));
        } catch (e) { fejl(); }
      };
      img.onerror = fejl;
      img.src = src;
    });
  }

  var sporLoefte = null;
  function seneste() {
    sporLoefte = sporLoefte || hentJson(lastfmUrl, 1).then(function (d) {
      var f = d && d.spor && d.spor[0];
      if (!f) throw new Error("ingen spor");
      return coverTone(f.billede).then(function (h) { return { spor: f, tone: h, fraCover: true }; }, function () {
        return { spor: f, tone: navneTone(f.kunstner + f.titel), fraCover: false };
      });
    });
    return sporLoefte;
  }

  // Ordet i farveforløbet bliver til det, jeg lytter til
  hver("lastfmord", function (demo) {
    var ord = demo.querySelector(".gradient-word");
    var slider = demo.querySelector(".gradient-hue");
    var info = el("p", { class: "levende-kilde", "aria-live": "polite", text: "Henter det, jeg lytter til …" });
    demo.appendChild(info);
    seneste().then(function (r) {
      ord.textContent = r.spor.titel;
      ord.setAttribute("aria-label", r.spor.titel);
      slider.value = String(r.tone);
      slider.dispatchEvent(new Event("input"));
      info.replaceChildren(
        (r.spor.nu ? "Lytter lige nu: " : "Sidst hørt: ") + r.spor.titel + " — " + r.spor.kunstner + ". ",
        el("span", { text: r.fraCover ? "Farven er hentet fra albumcoveret." : "Farven er beregnet ud fra navnet." })
      );
    }, function () { info.textContent = "Musikken kunne ikke hentes lige nu — prøv selv farverne."; });
  });

  // Stjernefeltet tones i samme farve
  hver("lastfmstjerner", function (demo) {
    var scene = demo.querySelector("[data-starfield]");
    var info = el("p", { class: "levende-kilde levende-kilde-moerk", "aria-live": "polite" });
    demo.appendChild(info);
    seneste().then(function (r) {
      scene.style.setProperty("--star-tone", "hsl(" + r.tone + " 80% 78%)");
      scene.dataset.tonet = "true";
      info.textContent = "Stjernerne har farven fra " + r.spor.titel + " af " + r.spor.kunstner + ".";
    }, function () {});
  });

  // Retroplakaten: månedens mest spillede kunstnere
  hver("lastfmplakat", function (demo) {
    var plakat = demo.querySelector(".retro-poster");
    var titel = plakat.querySelector(".retro-title");
    var script = plakat.querySelector(".retro-script");
    var eyebrow = plakat.querySelector(".retro-eyebrow");
    var liste = el("ol", { class: "retro-list" });
    script.after(liste);
    hentJson(lastfmTopUrl, 30).then(function (d) {
      var k = d && d.kunstnere;
      if (!k || !k.length) throw new Error();
      eyebrow.textContent = "MIN MEST SPILLEDE KUNSTNER DE SIDSTE 30 DAGE";
      var navn = k[0].navn.toUpperCase();
      var deling = navn.lastIndexOf(" ", Math.ceil(navn.length / 2) + 2);
      titel.replaceChildren(el("span", { text: deling > 0 ? navn.slice(0, deling) : navn }), el("span", { text: deling > 0 ? navn.slice(deling + 1) : "" }));
      titel.setAttribute("aria-label", k[0].navn);
      script.textContent = k[0].antal + " afspilninger";
      liste.replaceChildren.apply(liste, k.slice(1).map(function (a) {
        var li = el("li");
        if (/^https:\/\/www\.last\.fm\//.test(a.url)) li.appendChild(el("a", { href: a.url, rel: "noopener", text: a.navn }));
        else li.appendChild(document.createTextNode(a.navn));
        li.appendChild(el("span", { text: " " + a.antal }));
        return li;
      }));
      demo.appendChild(kilde("Data fra Last.fm", "https://www.last.fm/user/villadsclaes"));
    }).catch(function () {
      demo.appendChild(kilde("Top-listen fra Last.fm kunne ikke hentes lige nu."));
    });
  });

  // ======================================================================
  // VEJRET I HØJBJERG — Open-Meteo, ingen nøgle
  // ======================================================================
  var vejrUrl = "https://api.open-meteo.com/v1/forecast?latitude=56.1093&longitude=10.1880" +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max" +
    "&wind_speed_unit=ms&timezone=Europe%2FCopenhagen&forecast_days=4";
  var vejrLoefte = null;
  function vejr() { vejrLoefte = vejrLoefte || hentJson(vejrUrl, 15); return vejrLoefte; }

  // WMO-vejrkoder: symbol, scene (til kortets farver) og tekst
  function vejrkode(kode, vind) {
    var v;
    if (kode === 0) v = ["☀", "sun", "Klart vejr"];
    else if (kode <= 2) v = ["⛅", "sun", "Let skyet"];
    else if (kode === 3) v = ["☁", "rain", "Overskyet"];
    else if (kode <= 48) v = ["🌫", "rain", "Tåge"];
    else if (kode <= 57) v = ["🌦", "rain", "Støvregn"];
    else if (kode <= 67) v = ["☂", "rain", "Regn"];
    else if (kode <= 77) v = ["❄", "snow", "Sne"];
    else if (kode <= 82) v = ["🌧", "rain", "Regnbyger"];
    else if (kode <= 86) v = ["❄", "snow", "Snebyger"];
    else v = ["⛈", "rain", "Torden"];
    if (vind >= 10 && v[1] !== "snow") v = [v[0], "wind", v[2] + " og blæsende"];
    return { symbol: v[0], scene: v[1], tekst: v[2] };
  }
  var retninger = ["nord", "nordøst", "øst", "sydøst", "syd", "sydvest", "vest", "nordvest"];
  function retning(grader) { return retninger[Math.round(grader / 45) % 8]; }
  function komma(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }

  // Temperaturen: starter ved den rigtige temperatur lige nu
  hver("vejrtemperatur", function (demo) {
    var emoji = el("span", { class: "temperature-emoji", role: "img" });
    var slider = el("input", { id: "temperature-slider", class: "temperature-slider", type: "range", min: "-15", max: "35", value: "10" });
    var vaerdi = el("output", { class: "temperature-value", for: "temperature-slider", "aria-live": "polite" });
    var beskrivelse = el("span", { class: "temperature-description" });
    var nu = el("button", { type: "button", class: "temperature-now", text: "Henter temperaturen …", disabled: true });
    var maalt = null;
    function tegn() {
      var t = Number(slider.value);
      var f = t <= 0 ? ["🥶", "Frostvejr — hue og vanter"] : t <= 8 ? ["🧣", "Koldt — tag en varm jakke"] : t <= 15 ? ["🧥", "Friskt — en jakke er rar"] : t <= 22 ? ["😊", "Lige tilpas"] : t <= 28 ? ["😎", "Lunt — husk vand"] : ["🥵", "Hedt — find skygge"];
      emoji.textContent = f[0];
      emoji.setAttribute("aria-label", f[1]);
      vaerdi.textContent = t + " °C";
      beskrivelse.textContent = f[1] + (maalt !== null && t === Math.round(maalt) ? " (som lige nu i Højbjerg)" : "");
      slider.setAttribute("aria-valuetext", t + " grader, " + f[1]);
      slider.style.setProperty("--temperature-progress", ((t + 15) / 50 * 100) + "%");
    }
    slider.addEventListener("input", tegn);
    nu.addEventListener("click", function () { if (maalt !== null) { slider.value = String(Math.round(maalt)); tegn(); } });
    demo.replaceChildren(emoji, el("label", { class: "temperature-label", for: "temperature-slider", text: "Temperatur" }), slider, vaerdi, beskrivelse, nu);
    tegn();
    vejr().then(function (d) {
      maalt = d.current.temperature_2m;
      slider.value = String(Math.round(maalt));
      nu.disabled = false;
      nu.textContent = "Nu i Højbjerg: " + komma(maalt) + " °C, føles som " + komma(d.current.apparent_temperature) + " °C";
      tegn();
    }, function () { nu.textContent = "Vejret kunne ikke hentes — prøv selv skyderen."; });
  });

  // Vejrkortet: i dag og de næste tre dage
  hver("vejrkort", function (demo) {
    var kort = el("div", { class: "weather-card", "data-weather": "sun" });
    var symbol = el("span", { class: "weather-symbol", "aria-hidden": "true", text: "…" });
    var titel = el("strong", { text: "Henter vejret i Højbjerg …" });
    var tekst = el("p");
    kort.append(symbol, el("div", null, [titel, tekst]));
    var knapper = el("div", { class: "weather-controls", role: "group", "aria-label": "Vælg dag" });
    demo.replaceChildren(kort, knapper, kilde("Vejrdata fra Open-Meteo", "https://open-meteo.com/"));
    vejr().then(function (d) {
      var dage = d.daily.time.map(function (dato, i) {
        return {
          navn: i === 0 ? "I dag" : i === 1 ? "I morgen" : new Date(dato + "T12:00").toLocaleDateString("da-DK", { weekday: "long" }),
          kode: d.daily.weather_code[i], max: d.daily.temperature_2m_max[i], min: d.daily.temperature_2m_min[i],
          regn: d.daily.precipitation_sum[i], vind: d.daily.wind_speed_10m_max[i]
        };
      });
      var b = dage.map(function (dag, i) {
        var k = el("button", { type: "button", "aria-pressed": String(i === 0), text: dag.navn[0].toUpperCase() + dag.navn.slice(1) });
        k.addEventListener("click", function () { tryk(b, k); vis(i); });
        return k;
      });
      knapper.replaceChildren.apply(knapper, b);
      function vis(i) {
        var dag = dage[i];
        var v = vejrkode(dag.kode, dag.vind);
        kort.dataset.weather = v.scene;
        symbol.textContent = v.symbol;
        titel.textContent = (dag.navn[0].toUpperCase() + dag.navn.slice(1)) + ": " + v.tekst;
        tekst.textContent = komma(dag.min) + " til " + komma(dag.max) + " °C · " + komma(dag.regn) + " mm nedbør · vind op til " + komma(dag.vind) + " m/s";
        kort.setAttribute("role", "img");
        kort.setAttribute("aria-label", titel.textContent + ". " + tekst.textContent);
      }
      vis(0);
    }, function () {
      titel.textContent = "Vejret kunne ikke hentes lige nu.";
      tekst.textContent = "Prøv igen om lidt.";
    });
  });

  // Bladene bevæger sig i takt med vinden lige nu
  hver("vejrblade", function (demo) {
    var tekst = demo.querySelector("p");
    vejr().then(function (d) {
      var vind = d.current.wind_speed_10m;
      var varighed = Math.max(.8, 6 - vind * .5);
      demo.style.setProperty("--leaf-duration", varighed + "s");
      demo.style.setProperty("--leaf-angle", Math.min(22, 4 + vind * 1.6) + "deg");
      tekst.textContent = "Lige nu blæser det " + komma(vind) + " m/s fra " + retning(d.current.wind_direction_10m) + " i Højbjerg — og bladene svajer med.";
    }, function () {});
  });

  // ======================================================================
  // GITHUB — hvad jeg koder på
  // ======================================================================
  var ghBruger = "VilladsClaes";
  var ghLoefte = null;
  function ghEvents() {
    ghLoefte = ghLoefte || hentJson("https://api.github.com/users/" + ghBruger + "/events/public?per_page=100", 10);
    return ghLoefte;
  }
  var handlinger = {
    PushEvent: "pushede kode til", PullRequestEvent: "arbejdede på en pull request i", CreateEvent: "oprettede noget nyt i",
    IssuesEvent: "skrev en issue i", DeleteEvent: "ryddede op i", WatchEvent: "satte en stjerne på", ForkEvent: "forkede"
  };

  // Ordet ur: tiden i ord, og hvornår jeg sidst var på GitHub
  hver("githubur", function (demo) {
    var linje = el("span", { class: "clock-github", "aria-live": "off" });
    demo.appendChild(linje);
    ghEvents().then(function (ev) {
      var e = ev && ev[0];
      if (!e) return;
      var repo = e.repo.name.split("/")[1];
      function opdater() { linje.textContent = "Sidst på GitHub " + siden(e.created_at) + ": " + (handlinger[e.type] || "var aktiv i") + " " + repo + "."; }
      opdater();
      setInterval(opdater, 60000);
    }, function () {});
  });

  // Landskabet: mine seneste 30 dage på GitHub som bakker
  hver("githubterraen", function (demo) {
    var canvas = el("canvas", { class: "terrain-canvas", width: "720", height: "220", role: "img", "aria-label": "Min aktivitet på GitHub de seneste 30 dage" });
    var status = el("p", { class: "terrain-status", "aria-live": "polite", text: "Henter min aktivitet på GitHub …" });
    var tilfaeldig = el("button", { type: "button", text: "Skab et tilfældigt landskab i stedet" });
    var mit = el("button", { type: "button", text: "Vis mit GitHub-landskab", hidden: true });
    var dage = [];
    demo.replaceChildren(canvas, status, el("div", { class: "terrain-actions" }, [mit, tilfaeldig]));

    function tegnLandskab(hoejder, etiketter) {
      var ctx = canvas.getContext("2d");
      var w = canvas.width, h = canvas.height;
      var himmel = ctx.createLinearGradient(0, 0, 0, h);
      himmel.addColorStop(0, "#d9e9e6"); himmel.addColorStop(1, "#f6f4ef");
      ctx.fillStyle = himmel; ctx.fillRect(0, 0, w, h);
      var lag = [["#a9bfb2", .55, 30], ["#7d9a80", .8, 14], ["#2f5d73", 1, 0]];
      lag.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        hoejder.forEach(function (v, i) {
          var x = i / (hoejder.length - 1) * w;
          var y = h - 26 - v * l[1] * (h - 70) - l[2];
          if (i === 0) ctx.lineTo(x, y);
          else {
            var px = (i - 1) / (hoejder.length - 1) * w;
            var py = h - 26 - hoejder[i - 1] * l[1] * (h - 70) - l[2];
            ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y);
          }
        });
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = l[0]; ctx.fill();
      });
      if (etiketter) {
        ctx.fillStyle = "#ffffff"; ctx.font = "600 13px Inter, sans-serif";
        etiketter.forEach(function (t, i) {
          if (!t) return;
          var x = i / (hoejder.length - 1) * w;
          ctx.textAlign = x < 30 ? "left" : x > w - 30 ? "right" : "center";
          ctx.fillText(t, x < 30 ? 8 : x > w - 30 ? w - 8 : x, h - 8);
        });
      }
    }
    function tilfaeldigt() {
      var n = 33, ruhed = .6, v = [];
      v[0] = Math.random(); v[n - 1] = Math.random();
      (function del(a, b, s) {
        if (b - a < 2) return;
        var m = Math.floor((a + b) / 2);
        v[m] = (v[a] + v[b]) / 2 + (Math.random() - .5) * s;
        del(a, m, s * ruhed); del(m, b, s * ruhed);
      })(0, n - 1, 1);
      var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v);
      return v.map(function (x) { return (x - mn) / (mx - mn || 1) * .9; });
    }
    function visMit() {
      var mx = Math.max.apply(null, dage.map(function (d) { return d.n; })) || 1;
      // En etiket pr. uge, talt baglæns fra i dag
      var etiketter = dage.map(function (d, i) { return (dage.length - 1 - i) % 7 === 0 ? (i === dage.length - 1 ? "i dag" : d.dato.getDate() + "/" + (d.dato.getMonth() + 1)) : ""; });
      tegnLandskab(dage.map(function (d) { return .05 + d.n / mx * .85; }), etiketter);
      var top = dage.reduce(function (a, d) { return d.n > a.n ? d : a; }, dage[0]);
      var total = dage.reduce(function (a, d) { return a + d.n; }, 0);
      var aktive = dage.filter(function (d) { return d.n; }).length;
      status.textContent = total + " offentlige handlinger på GitHub fordelt på " + aktive + " af de seneste 30 dage. Den højeste top er " +
        top.dato.toLocaleDateString("da-DK", { day: "numeric", month: "long" }) + " med " + top.n + ".";
      canvas.setAttribute("aria-label", status.textContent);
      mit.hidden = true;
    }
    tilfaeldig.addEventListener("click", function () {
      tegnLandskab(tilfaeldigt());
      status.textContent = "Et tilfældigt landskab, bygget med en lille midtpunkts-algoritme.";
      canvas.setAttribute("aria-label", "Et tilfældigt genereret landskab");
      mit.hidden = !dage.length;
    });
    mit.addEventListener("click", visMit);
    tegnLandskab(tilfaeldigt());
    ghEvents().then(function (ev) {
      var idag = new Date(); idag.setHours(0, 0, 0, 0);
      for (var i = 29; i >= 0; i--) dage.push({ dato: new Date(idag.getTime() - i * 864e5), n: 0 });
      (ev || []).forEach(function (e) {
        var d = new Date(e.created_at); d.setHours(0, 0, 0, 0);
        var idx = 29 - Math.round((idag - d) / 864e5);
        if (idx >= 0 && idx < 30) dage[idx].n++;
      });
      visMit();
    }, function () {
      status.textContent = "GitHub svarede ikke — her er et tilfældigt landskab i stedet.";
    });
  });

  // Avisforsiden: nyt fra mine repositories
  hver("githubavis", function (demo) {
    var avis = el("article", { class: "newsprint" }, [el("p", { class: "newsprint-lead", text: "Henter dagens nyheder fra GitHub …" })]);
    demo.replaceChildren(avis);
    hentJson("https://api.github.com/users/" + ghBruger + "/repos?sort=pushed&per_page=4", 10).then(function (repos) {
      repos = (repos || []).filter(function (r) { return !r.fork; });
      if (!repos.length) throw new Error();
      var hoved = repos[0];
      return hentJson("https://api.github.com/repos/" + ghBruger + "/" + hoved.name + "/commits?per_page=4", 10).then(function (commits) {
        return { repos: repos, commits: commits || [] };
      });
    }).then(function (r) {
      var hoved = r.repos[0];
      var beskeder = r.commits.map(function (c) { return c.commit.message.split("\n")[0]; }).filter(function (m) { return !/^Merge /.test(m); });
      var dato = new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
      var sidste = r.repos.slice(1).map(function (x) {
        return el("p", null, [el("strong", { text: x.name + ". " }), (x.description ? x.description + " " : "") + "Opdateret " + siden(x.pushed_at) + "."]);
      });
      avis.replaceChildren(
        el("header", { class: "newsprint-header" }, [el("span", { text: "VILLADS' KODEAVIS" }), el("span", { text: dato })]),
        el("h4", null, [el("a", { href: hoved.html_url, rel: "noopener", text: "Nyt i " + hoved.name })]),
        el("p", { class: "newsprint-lead", text: (hoved.description ? hoved.description + " — " : "") + "sidst opdateret " + siden(hoved.pushed_at) + "." }),
        el("div", { class: "newsprint-columns" }, (beskeder.length ? [el("p", null, [el("strong", { text: "Seneste ændringer: " }), beskeder.slice(0, 3).join(". ") + "."])] : []).concat(sidste)),
        el("footer", { class: "newsprint-footer" }, [el("a", { href: "https://github.com/" + ghBruger, rel: "noopener", text: "GITHUB.COM/" + ghBruger.toUpperCase() })])
      );
    }).catch(function () {
      avis.replaceChildren(el("p", { class: "newsprint-lead", text: "GitHub svarede ikke lige nu. Se mine projekter på github.com/" + ghBruger + "." }));
    });
  });

  // ======================================================================
  // OPGAVELISTEN — læser den delte liste fra Firebase
  // ======================================================================
  hver("opgaveliste", function (demo) {
    var liste = el("ul", { class: "todo-list", "aria-live": "polite" }, [el("li", { class: "todo-empty", text: "Henter opgavelisten …" })]);
    var filtre = [["open", "Åbne"], ["done", "Færdige"]].map(function (f, i) {
      return el("button", { type: "button", "data-todo-filter": f[0], "aria-pressed": String(i === 0), text: f[1] });
    });
    var status = el("span", { class: "todo-status", "aria-live": "polite" });
    var opgaver = [];
    var filter = "open";
    demo.replaceChildren(
      el("div", { class: "todo-filters", role: "group", "aria-label": "Vis opgaver" }, filtre),
      liste,
      status,
      el("a", { class: "btn btn-ghost btn-small todo-link", href: "opgaveliste.html", text: "Foreslå eller tag en opgave →" })
    );
    function tegn() {
      var vis = opgaver.filter(function (o) { return filter === "done" ? o.status === "done" : o.status !== "done"; });
      liste.replaceChildren.apply(liste, vis.length ? vis.slice(0, 8).map(function (o) {
        return el("li", { class: "todo-item" + (o.status === "done" ? " is-done" : "") }, [
          el("span", { class: "todo-text", text: o.title || "(uden titel)" }),
          el("span", { class: "tag " + (o.assignee ? "tag-sage" : ""), text: o.assignee ? o.assignee : "ledig" })
        ]);
      }) : [el("li", { class: "todo-empty", text: filter === "done" ? "Ingen færdige opgaver endnu." : "Ingen åbne opgaver lige nu." })]);
      var aabne = opgaver.filter(function (o) { return o.status !== "done"; }).length;
      status.textContent = aabne + " åbne og " + (opgaver.length - aabne) + " færdige opgaver · opdateres live";
    }
    filtre.forEach(function (k) { k.addEventListener("click", function () { filter = k.dataset.todoFilter; tryk(filtre, k); tegn(); }); });

    var cfg = window.FIREBASE_CONFIG;
    if (!cfg || /UDFYLD/.test(cfg.apiKey || "")) {
      liste.replaceChildren(el("li", { class: "todo-empty", text: "Den delte opgaveliste er ikke koblet til Firebase endnu." }));
      return;
    }
    var v = "12.19.0";
    Promise.all([
      import("https://www.gstatic.com/firebasejs/" + v + "/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/" + v + "/firebase-firestore.js")
    ]).then(function (m) {
      var app = m[0].initializeApp(cfg, "legeplads");
      var fs = m[1];
      var db = fs.getFirestore(app);
      fs.onSnapshot(fs.query(fs.collection(db, "tasks"), fs.orderBy("createdAt", "desc")), function (snap) {
        opgaver = snap.docs.map(function (d) { return d.data(); });
        tegn();
      }, function () {
        liste.replaceChildren(el("li", { class: "todo-empty", text: "Opgavelisten kunne ikke hentes lige nu." }));
      });
    }).catch(function () {
      liste.replaceChildren(el("li", { class: "todo-empty", text: "Opgavelisten kunne ikke hentes lige nu." }));
    });
  });

  // ======================================================================
  // KATEGORIER — rigtigt indhold eller ren UI-leg
  // ======================================================================
  var filterbar = document.querySelector("[data-kategori-filter]");
  if (filterbar) {
    var eksperimenter = Array.prototype.slice.call(document.querySelectorAll(".experiment[data-kategori]"));
    var taelle = function (k) { return eksperimenter.filter(function (e) { return k === "alle" || e.dataset.kategori === k; }).length; };
    var knapper = Array.prototype.slice.call(filterbar.querySelectorAll("[data-kategori-valg]"));
    var filterStatus = document.querySelector("[data-kategori-status]");
    knapper.forEach(function (k) {
      var antal = k.querySelector("span");
      if (antal) antal.textContent = taelle(k.dataset.kategoriValg);
      k.addEventListener("click", function () {
        var valgt = k.dataset.kategoriValg;
        tryk(knapper, k);
        eksperimenter.forEach(function (e) {
          e.hidden = valgt !== "alle" && e.dataset.kategori !== valgt;
          if (!e.hidden) e.classList.add("in");
        });
        if (filterStatus) filterStatus.textContent = "Viser " + taelle(valgt) + " eksperimenter.";
        try { history.replaceState(null, "", valgt === "alle" ? location.pathname : "#vis-" + valgt); } catch (e) {}
      });
    });
    var fraAdresse = /^#vis-(.+)$/.exec(location.hash);
    if (fraAdresse) {
      var start = knapper.filter(function (k) { return k.dataset.kategoriValg === fraAdresse[1]; })[0];
      if (start) start.click();
    }
  }
})();

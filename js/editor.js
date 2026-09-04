/* =====================================================
   Secuna Baldé — Mode édition intégré
   - Modifier les textes (clic direct)
   - Changer les photos (clic sur une image)
   - Ajouter / déplacer / supprimer des sections
   - Sauvegarde automatique (navigateur) + export du site
   Activation : Ctrl+Shift+E, ou « ?edition » dans l'adresse,
   ou 5 clics rapides sur le monogramme « SB ».
   ===================================================== */

(function () {
  "use strict";

  var LS_KEY = "sb-site-v1";
  var REGIONS = ["siteHeader", "pageMain", "pageFooter"];
  var editing = false;
  var saveTimer = null;
  var targetImg = null;
  var appendGallery = null;

  /* ---------- 1. Restauration du contenu sauvegardé ---------- */
  /* Ce script est chargé AVANT main.js : le contenu restauré
     est donc bien pris en compte par les animations et menus. */
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (saved && saved.regions) {
      REGIONS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && typeof saved.regions[id] === "string") {
          el.innerHTML = saved.regions[id];
        }
      });
    }
  } catch (e) { /* contenu sauvegardé illisible : on garde l'original */ }

  var canEdit =
    window.SB_EDITION === true ||
    location.search.indexOf("edition") !== -1 ||
    location.hash.indexOf("edition") !== -1;

  /* ---------- 2. Styles de l'éditeur ---------- */
  var style = document.createElement("style");
  style.id = "ed-style";
  style.textContent = [
    "body.ed-editing [contenteditable='true']{outline:1.5px dashed rgba(201,162,75,.75);outline-offset:3px;border-radius:3px;}",
    "body.ed-editing [contenteditable='true']:hover{outline-color:#e3c47c;background:rgba(201,162,75,.07);}",
    "body.ed-editing [contenteditable='true']:focus{outline:2px solid #c9a24b;background:rgba(201,162,75,.09);}",
    "body.ed-editing main img,body.ed-editing header img{cursor:pointer;}",
    "body.ed-editing main img:hover{filter:brightness(.7);}",
    ".ed-toolbar{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:3000;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;background:rgba(8,17,32,.96);border:1px solid rgba(201,162,75,.5);border-radius:999px;padding:10px 14px;box-shadow:0 18px 50px rgba(0,0,0,.45);font-family:'Inter','Segoe UI',sans-serif;max-width:94vw;}",
    ".ed-toolbar button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:.78rem;font-weight:600;padding:8px 14px;border-radius:999px;cursor:pointer;transition:background .2s,border-color .2s;white-space:nowrap;}",
    ".ed-toolbar button:hover{background:rgba(201,162,75,.25);border-color:#c9a24b;}",
    ".ed-toolbar button.ed-primary{background:linear-gradient(120deg,#c9a24b,#e3c47c);color:#081120;border:none;}",
    ".ed-toolbar button.ed-danger:hover{background:rgba(206,17,38,.35);border-color:#ce1126;}",
    ".ed-launcher{position:fixed;bottom:22px;right:22px;z-index:3000;background:linear-gradient(120deg,#c9a24b,#e3c47c);color:#081120;border:none;border-radius:999px;padding:13px 22px;font-family:'Inter','Segoe UI',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;box-shadow:0 12px 34px rgba(201,162,75,.45);}",
    ".ed-launcher:hover{transform:translateY(-2px);}",
    ".ed-toast{position:fixed;bottom:86px;left:50%;transform:translateX(-50%);z-index:3001;background:#0b1b2e;color:#e3c47c;border:1px solid rgba(201,162,75,.5);padding:9px 20px;border-radius:999px;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:600;opacity:0;transition:opacity .3s;pointer-events:none;}",
    ".ed-toast.show{opacity:1;}",
    ".ed-sec-controls{position:absolute;top:14px;right:14px;display:flex;gap:6px;z-index:50;}",
    ".ed-sec-controls button{width:34px;height:34px;border-radius:50%;border:1px solid rgba(201,162,75,.6);background:rgba(8,17,32,.85);color:#e3c47c;font-size:.9rem;cursor:pointer;line-height:1;}",
    ".ed-sec-controls button:hover{background:#c9a24b;color:#081120;}",
    ".custom-section{position:relative;}",
    ".ed-add-tile{display:flex;align-items:center;justify-content:center;min-height:200px;border:2px dashed rgba(201,162,75,.6);border-radius:14px;background:rgba(201,162,75,.06);color:#8a7638;font-family:'Inter',sans-serif;font-weight:600;font-size:.9rem;cursor:pointer;transition:background .2s;}",
    ".ed-add-tile:hover{background:rgba(201,162,75,.15);}",
    ".ed-overlay{position:fixed;inset:0;background:rgba(8,17,32,.75);backdrop-filter:blur(6px);z-index:3100;display:flex;align-items:center;justify-content:center;padding:20px;}",
    ".ed-modal{background:#fff;border-radius:16px;padding:34px;width:min(520px,94vw);max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.5);font-family:'Inter','Segoe UI',sans-serif;}",
    ".ed-modal h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;color:#081120;margin-bottom:20px;}",
    ".ed-modal label{display:block;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4c5867;margin:16px 0 6px;}",
    ".ed-modal input[type=text],.ed-modal textarea{width:100%;border:1px solid #d5d9e0;border-radius:10px;padding:11px 14px;font-family:inherit;font-size:.95rem;color:#1c2430;}",
    ".ed-modal textarea{min-height:110px;resize:vertical;}",
    ".ed-modal input:focus,.ed-modal textarea:focus{outline:2px solid #c9a24b;border-color:transparent;}",
    ".ed-choices{display:flex;gap:8px;flex-wrap:wrap;}",
    ".ed-choices label{display:flex;align-items:center;gap:6px;margin:0;border:1px solid #d5d9e0;border-radius:999px;padding:9px 16px;cursor:pointer;font-size:.82rem;text-transform:none;letter-spacing:0;font-weight:600;color:#1c2430;}",
    ".ed-choices input{accent-color:#c9a24b;}",
    ".ed-choices label:has(input:checked){border-color:#c9a24b;background:rgba(201,162,75,.12);}",
    ".ed-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:26px;}",
    ".ed-modal-actions button{border-radius:999px;padding:11px 24px;font-weight:700;font-size:.85rem;cursor:pointer;border:1px solid #d5d9e0;background:#fff;color:#4c5867;}",
    ".ed-modal-actions .ed-primary{background:linear-gradient(120deg,#c9a24b,#e3c47c);border:none;color:#081120;}",
    "@media(max-width:600px){.ed-toolbar{bottom:10px;border-radius:18px;}}"
  ].join("\n");
  document.head.appendChild(style);

  /* ---------- 3. Petites aides ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function slugify(txt) {
    return (txt || "section")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "section";
  }

  function uniqueId(base) {
    var id = base, i = 2;
    while (document.getElementById(id)) { id = base + "-" + i; i++; }
    return id;
  }

  var PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500">' +
      '<rect width="900" height="500" fill="#0b1b2e"/>' +
      '<text x="450" y="240" text-anchor="middle" fill="#c9a24b" font-family="Georgia" font-size="30">Photo</text>' +
      '<text x="450" y="285" text-anchor="middle" fill="#8fa0b5" font-family="Arial" font-size="17">En mode édition, cliquez pour choisir une image</text>' +
      "</svg>"
    );

  var toast = el("div", "ed-toast");
  document.body.appendChild(toast);
  var toastTimer = null;
  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  /* ---------- 4. Sauvegarde / export ---------- */
  function collectRegions() {
    var out = {};
    REGIONS.forEach(function (id) {
      var src = document.getElementById(id);
      if (!src) return;
      var clone = src.cloneNode(true);
      clone.querySelectorAll(".ed-ui").forEach(function (n) { n.remove(); });
      clone.querySelectorAll("[contenteditable]").forEach(function (n) {
        n.removeAttribute("contenteditable");
        n.removeAttribute("spellcheck");
      });
      out[id] = clone.innerHTML;
    });
    return out;
  }

  function saveNow() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ regions: collectRegions(), t: Date.now() }));
      notify("Modifications enregistrées ✓");
    } catch (e) {
      notify("⚠ Sauvegarde impossible (photos trop lourdes ?)");
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 900);
  }

  function exportSite() {
    var regions = collectRegions();
    var head = document.head.cloneNode(true);
    var edStyle = head.querySelector("#ed-style");
    if (edStyle) edStyle.remove();
    var flag = document.querySelector(".flag-bar");
    var html =
      "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n" + head.innerHTML + "\n</head>\n<body>\n\n" +
      (flag ? flag.outerHTML : "") + "\n\n" +
      '<header class="site-header" id="siteHeader">' + regions.siteHeader + "</header>\n\n" +
      '<main id="pageMain">' + regions.pageMain + "</main>\n\n" +
      '<footer class="site-footer" id="pageFooter">' + regions.pageFooter + "</footer>\n\n" +
      '<script src="js/editor.js"><\/script>\n' +
      '<script src="js/main.js"><\/script>\n' +
      "</body>\n</html>\n";
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify("Site exporté : remplacez index.html par le fichier téléchargé");
  }

  function resetAll() {
    if (confirm("Annuler TOUTES les modifications et revenir à la version d'origine ?")) {
      localStorage.removeItem(LS_KEY);
      location.reload();
    }
  }

  /* ---------- 5. Choix d'image ---------- */
  var fileInput = el("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.addEventListener("change", function () {
    var f = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      if (appendGallery) {
        var img = el("img");
        img.src = reader.result;
        img.alt = "Photo de la galerie";
        appendGallery.insertBefore(img, appendGallery.querySelector(".ed-add-tile"));
        appendGallery = null;
      } else if (targetImg) {
        targetImg.src = reader.result;
        targetImg = null;
      }
      scheduleSave();
    };
    reader.readAsDataURL(f);
  });

  /* ---------- 6. Sections personnalisées ---------- */
  function addSectionControls(sec) {
    if (sec.querySelector(".ed-sec-controls")) return;
    var c = el("div", "ed-sec-controls ed-ui");
    c.innerHTML =
      '<button type="button" data-act="up" title="Monter la section">↑</button>' +
      '<button type="button" data-act="down" title="Descendre la section">↓</button>' +
      '<button type="button" data-act="del" title="Supprimer la section">✕</button>';
    c.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "del") {
        if (!confirm("Supprimer cette section ?")) return;
        document.querySelectorAll('a[href="#' + sec.id + '"]').forEach(function (a) { a.remove(); });
        sec.remove();
      } else {
        var sib = act === "up" ? sec.previousElementSibling : sec.nextElementSibling;
        if (sib && sib.tagName === "SECTION") {
          if (act === "up") sib.before(sec); else sib.after(sec);
          sec.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      scheduleSave();
    });
    sec.appendChild(c);
  }

  function addGalleryTile(grid) {
    if (grid.querySelector(".ed-add-tile")) return;
    var tile = el("div", "ed-add-tile ed-ui", "+ Ajouter une photo");
    tile.addEventListener("click", function () {
      appendGallery = grid;
      targetImg = null;
      fileInput.click();
    });
    grid.appendChild(tile);
  }

  function addNavLink(title, id) {
    var nav = document.getElementById("mainNav");
    var cta = nav && nav.querySelector(".nav-cta");
    if (nav && cta) {
      var a = el("a", "nav-link", title);
      a.href = "#" + id;
      nav.insertBefore(a, cta);
    }
    var fnav = document.querySelector(".footer-nav");
    if (fnav) {
      var fa = el("a", "", title);
      fa.href = "#" + id;
      fnav.appendChild(fa);
    }
  }

  function createSection(data) {
    var sec = el("section", "section custom-section");
    if (data.styleName === "sombre") sec.classList.add("section-dark");
    if (data.styleName === "vert") sec.classList.add("section-green");
    sec.id = uniqueId("custom-" + slugify(data.title));

    var kickerCls = data.styleName === "vert" ? "section-kicker section-kicker-green" : "section-kicker";
    var inner =
      '<div class="container">' +
      '<div class="section-head">' +
      (data.kicker ? '<p class="' + kickerCls + '">' + data.kicker + "</p>" : "") +
      '<h2 class="section-title">' + (data.title || "Nouvelle section") + "</h2>" +
      "</div>" +
      '<div class="custom-content">';

    if (data.type === "galerie") {
      inner += '<div class="gallery-grid"></div>';
      if (data.text) inner += "<p>" + data.text + "</p>";
    } else {
      if (data.type === "image") {
        inner +=
          '<figure class="custom-figure"><img src="' + PLACEHOLDER + '" alt="' +
          (data.title || "Illustration") + '" loading="lazy"></figure>';
      }
      inner += "<p>" + (data.text || "Votre texte ici…") + "</p>";
    }
    inner += "</div></div>";
    sec.innerHTML = inner;

    var contact = document.getElementById("contact");
    if (contact) contact.before(sec); else document.getElementById("pageMain").appendChild(sec);

    if (data.title) addNavLink(data.title, sec.id);
    if (editing) {
      addSectionControls(sec);
      applyEditable(sec);
      var grid = sec.querySelector(".gallery-grid");
      if (grid) addGalleryTile(grid);
    }
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
    scheduleSave();
  }

  function openSectionModal() {
    var overlay = el("div", "ed-overlay");
    overlay.innerHTML =
      '<div class="ed-modal" role="dialog" aria-label="Ajouter une section">' +
      "<h3>Ajouter une section</h3>" +
      "<label>Type de section</label>" +
      '<div class="ed-choices">' +
      '<label><input type="radio" name="ed-type" value="texte" checked> Texte</label>' +
      '<label><input type="radio" name="ed-type" value="image"> Texte + image</label>' +
      '<label><input type="radio" name="ed-type" value="galerie"> Galerie photos</label>' +
      "</div>" +
      "<label>Sur-titre (optionnel)</label>" +
      '<input type="text" id="ed-kicker" placeholder="Ex. : Engagements, Actualités, Médias…">' +
      "<label>Titre de la section</label>" +
      '<input type="text" id="ed-title" placeholder="Ex. : Publications récentes">' +
      "<label>Texte d'introduction (optionnel)</label>" +
      '<textarea id="ed-text" placeholder="Votre texte… (modifiable ensuite directement sur la page)"></textarea>' +
      "<label>Style</label>" +
      '<div class="ed-choices">' +
      '<label><input type="radio" name="ed-style-c" value="clair" checked> Clair</label>' +
      '<label><input type="radio" name="ed-style-c" value="sombre"> Sombre</label>' +
      '<label><input type="radio" name="ed-style-c" value="vert"> Vert</label>' +
      "</div>" +
      '<div class="ed-modal-actions">' +
      '<button type="button" data-act="cancel">Annuler</button>' +
      '<button type="button" class="ed-primary" data-act="ok">Créer la section</button>' +
      "</div></div>";
    document.body.appendChild(overlay);
    overlay.querySelector("#ed-title").focus();

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest('[data-act="cancel"]')) {
        overlay.remove();
        return;
      }
      if (e.target.closest('[data-act="ok"]')) {
        createSection({
          type: overlay.querySelector('input[name="ed-type"]:checked').value,
          styleName: overlay.querySelector('input[name="ed-style-c"]:checked').value,
          kicker: overlay.querySelector("#ed-kicker").value.trim(),
          title: overlay.querySelector("#ed-title").value.trim() || "Nouvelle section",
          text: overlay.querySelector("#ed-text").value.trim()
        });
        overlay.remove();
      }
    });
  }

  /* ---------- 7. Activation / désactivation du mode édition ---------- */
  var EDIT_SEL =
    "h1,h2,h3,h4,p,li,figcaption,.brand-text,.footer-brand > div,a.btn,.nav-link,.footer-nav a,.contact-card a";

  function applyEditable(root) {
    root.querySelectorAll(EDIT_SEL).forEach(function (n) {
      if (n.closest(".ed-toolbar,.ed-overlay,.ed-sec-controls")) return;
      if (n.parentElement && n.parentElement.closest('[contenteditable="true"]')) return;
      n.setAttribute("contenteditable", "true");
      n.setAttribute("spellcheck", "false");
    });
  }

  function clearEditable() {
    document.querySelectorAll('[contenteditable="true"]').forEach(function (n) {
      n.removeAttribute("contenteditable");
      n.removeAttribute("spellcheck");
    });
  }

  var toolbar = el("div", "ed-toolbar");
  toolbar.style.display = "none";
  toolbar.innerHTML =
    '<button type="button" class="ed-primary" data-act="add">➕ Ajouter une section</button>' +
    '<button type="button" data-act="save">💾 Enregistrer</button>' +
    '<button type="button" data-act="export">⬇ Exporter le site</button>' +
    '<button type="button" class="ed-danger" data-act="reset">↩ Tout réinitialiser</button>' +
    '<button type="button" data-act="quit">✕ Quitter l’édition</button>';
  document.body.appendChild(toolbar);

  toolbar.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    if (act === "add") openSectionModal();
    else if (act === "save") saveNow();
    else if (act === "export") { saveNow(); exportSite(); }
    else if (act === "reset") resetAll();
    else if (act === "quit") exitEdit();
  });

  var launcher = el("button", "ed-launcher", "✎ Mode édition");
  launcher.type = "button";
  launcher.style.display = canEdit ? "block" : "none";
  launcher.addEventListener("click", enterEdit);
  document.body.appendChild(launcher);

  function enterEdit() {
    if (editing) return;
    editing = true;
    document.body.classList.add("ed-editing");
    applyEditable(document);
    document.querySelectorAll(".custom-section").forEach(addSectionControls);
    document.querySelectorAll(".gallery-grid").forEach(addGalleryTile);
    toolbar.style.display = "flex";
    launcher.style.display = "none";
    notify("Mode édition : cliquez sur un texte ou une photo pour les modifier");
  }

  function exitEdit() {
    if (!editing) return;
    editing = false;
    saveNow();
    document.body.classList.remove("ed-editing");
    clearEditable();
    document.querySelectorAll(".ed-sec-controls,.ed-add-tile").forEach(function (n) { n.remove(); });
    toolbar.style.display = "none";
    launcher.style.display = canEdit ? "block" : "none";
  }

  /* ---------- 8. Interactions globales en mode édition ---------- */
  document.addEventListener("click", function (e) {
    if (!editing) return;
    if (e.target.closest(".ed-toolbar,.ed-overlay,.ed-sec-controls,.ed-add-tile,.ed-launcher")) return;

    var img = e.target.closest("img");
    if (img) {
      e.preventDefault();
      targetImg = img;
      appendGallery = null;
      fileInput.click();
      return;
    }
    var link = e.target.closest("a[href]");
    if (link) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        var url = prompt("Adresse du lien :", link.getAttribute("href"));
        if (url) { link.setAttribute("href", url); scheduleSave(); }
      }
    }
  }, true);

  document.addEventListener("input", function (e) {
    if (editing && e.target.closest("[contenteditable]")) scheduleSave();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
      e.preventDefault();
      if (editing) exitEdit(); else enterEdit();
    }
  });

  /* 5 clics rapides sur le monogramme « SB » = mode édition */
  var brandClicks = 0, brandTimer = null;
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".brand-initials")) return;
    brandClicks++;
    clearTimeout(brandTimer);
    brandTimer = setTimeout(function () { brandClicks = 0; }, 1600);
    if (brandClicks >= 5) {
      brandClicks = 0;
      if (!editing) { e.preventDefault(); enterEdit(); }
    }
  });
})();

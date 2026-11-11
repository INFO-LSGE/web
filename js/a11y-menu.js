/*
 * LSGE — Panel de accesibilidad avanzada
 * Pensado para personas con baja visión, ceguera y dificultades de lectura.
 * Sin dependencias. Guarda las preferencias en localStorage.
 */
(function () {
  'use strict';

  /* Ruta base del script, para enlazar la declaración de accesibilidad
     tanto en /web/ como en /web/diccionario/ y en local. */
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/js\/a11y-menu\.js.*$/, '') : '';

  var K = {
    scale: 'lsge-fontscale',
    bg: 'lsge-custom-bg',
    text: 'lsge-custom-text',
    theme: 'lsge-theme',
    contrast: 'lsge-contrast',
    invert: 'lsge-invert',
    spacing: 'lsge-spacing',
    links: 'lsge-links',
    cursor: 'lsge-bigcursor',
    guide: 'lsge-guide'
  };

  var root = document.documentElement;
  var statusEl = null;

  function status(msg) {
    if (!statusEl) return;
    statusEl.textContent = '';
    /* reinicio para que el lector de pantalla lo anuncie otra vez */
    window.setTimeout(function () { statusEl.textContent = msg; }, 40);
  }

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  /* === TEXTO === */
  function applyScale(scale) {
    var n = Math.min(200, Math.max(100, parseInt(scale, 10) || 100));
    root.style.fontSize = n + '%';
    save(K.scale, n);
    var out = document.getElementById('a11yFontOut');
    if (out) out.textContent = n + '%';
    return n;
  }

  function toggleClass(cls, on) {
    if (on) root.classList.add(cls); else root.classList.remove(cls);
  }

  /* === COLORES PERSONALIZADOS === */
  function applyCustomColors(bg, text) {
    if (bg) { root.style.setProperty('--custom-bg', bg); save(K.bg, bg); }
    if (text) { root.style.setProperty('--custom-text', text); save(K.text, text); }
    root.setAttribute('data-theme', 'custom');
    save(K.theme, 'custom');
  }

  /* === LECTURA POR VOZ === */
  var voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var lang = (root.lang || 'es').toLowerCase();
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.toLowerCase().indexOf(lang) === 0) return voices[i];
    }
    return voices[0] || null;
  }

  function stopSpeaking(silent) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var btn = document.getElementById('a11ySpeak');
    if (btn) btn.setAttribute('aria-pressed', 'false');
    if (!silent) status('Lectura detenida.');
  }

  function speakPage() {
    if (!('speechSynthesis' in window)) {
      status('Tu navegador no admite lectura por voz.');
      return;
    }
    stopSpeaking(true);
    var main = document.getElementById('main') || document.querySelector('main') || document.body;
    /* Se lee el contenido principal, no el menú ni el panel */
    var clone = main.cloneNode(true);
    var mute = clone.querySelectorAll('script,style,noscript,svg,video,audio,[aria-hidden="true"]');
    for (var i = 0; i < mute.length; i++) mute[i].remove();
    var text = (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) { status('No hay contenido que leer.'); return; }

    var chunks = text.match(/[^.!?·]{1,160}[.!?·]?/g) || [text];
    var lang = (root.lang || 'es').toLowerCase();

    for (var c = 0; c < chunks.length; c++) {
      (function (piece) {
        var u = new SpeechSynthesisUtterance(piece.trim());
        u.lang = lang;
        u.rate = 0.95;
        u.pitch = 1;
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
      })(chunks[c]);
    }
    var btn = document.getElementById('a11ySpeak');
    if (btn) btn.setAttribute('aria-pressed', 'true');
    status('Leyendo el contenido de la página. Pulsa Detener para parar.');
  }

  /* === GUÍA DE LECTURA === */
  var guideEl = null;
  function ensureGuide() {
    if (guideEl) return guideEl;
    guideEl = document.createElement('div');
    guideEl.className = 'a11y-reading-guide';
    guideEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(guideEl);
    return guideEl;
  }
  function moveGuide(e) {
    if (!root.classList.contains('a11y-guide') || !guideEl) return;
    guideEl.style.transform = 'translateY(' + (e.clientY - 30) + 'px)';
  }

  /* === PANEL === */
  function buildWidget(base) {
    var wrap = document.createElement('div');
    wrap.className = 'a11y-widget';
    wrap.innerHTML =
      '<button type="button" class="a11y-toggle" id="a11yToggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="a11yPanel" aria-label="Accesibilidad avanzada" aria-keyshortcuts="Alt+A" title="Accesibilidad (Alt+A)">' +
        '<span class="material-symbols-outlined" aria-hidden="true">accessibility_new</span>' +
      '</button>' +
      '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="Accesibilidad avanzada" hidden>' +
        '<div class="a11y-panel__head">' +
          '<h2 class="a11y-panel__title">Accesibilidad</h2>' +
          '<button type="button" class="a11y-panel__close" id="a11yClose" aria-label="Cerrar panel de accesibilidad">' +
            '<span class="material-symbols-outlined" aria-hidden="true">close</span>' +
          '</button>' +
        '</div>' +
        '<p class="a11y-panel__hint">Ajustes para baja visión, ceguera y lectura.</p>' +

        '<fieldset class="a11y-group">' +
          '<legend>Texto</legend>' +
          '<label class="a11y-range" for="a11yFontSlider">Tamaño del texto <output id="a11yFontOut" for="a11yFontSlider">100%</output></label>' +
          '<input type="range" id="a11yFontSlider" min="100" max="200" step="10" value="100">' +
          '<label class="a11y-switch"><input type="checkbox" id="a11ySpacing"> <span>Más espaciado entre letras y líneas</span></label>' +
          '<label class="a11y-switch"><input type="checkbox" id="a11yLinks"> <span>Subrayar todos los enlaces</span></label>' +
        '</fieldset>' +

        '<fieldset class="a11y-group">' +
          '<legend>Color y contraste</legend>' +
          '<button type="button" class="a11y-btn" id="a11yContrast" aria-pressed="false">Alto contraste</button>' +
          '<button type="button" class="a11y-btn" id="a11yInvert" aria-pressed="false">Invertir colores</button>' +
          '<div class="a11y-colors">' +
            '<label for="a11yBgColor">Fondo</label>' +
            '<input type="color" id="a11yBgColor" value="#ffffff">' +
            '<label for="a11yTextColor">Texto</label>' +
            '<input type="color" id="a11yTextColor" value="#0f1e3a">' +
          '</div>' +
        '</fieldset>' +

        '<fieldset class="a11y-group">' +
          '<legend>Puntero</legend>' +
          '<label class="a11y-switch"><input type="checkbox" id="a11yCursor"> <span>Cursor grande</span></label>' +
          '<label class="a11y-switch"><input type="checkbox" id="a11yGuide"> <span>Guía de lectura</span></label>' +
        '</fieldset>' +

        '<fieldset class="a11y-group">' +
          '<legend>Lectura por voz</legend>' +
          '<button type="button" class="a11y-btn a11y-btn--primary" id="a11ySpeak" aria-pressed="false">' +
            '<span class="material-symbols-outlined" aria-hidden="true">volume_up</span> Leer la página' +
          '</button>' +
          '<button type="button" class="a11y-btn" id="a11yStop">' +
            '<span class="material-symbols-outlined" aria-hidden="true">stop_circle</span> Detener' +
          '</button>' +
        '</fieldset>' +

        '<button type="button" class="a11y-panel__reset" id="a11yReset">' +
          '<span class="material-symbols-outlined" aria-hidden="true">restart_alt</span> Restablecer todo' +
        '</button>' +
        '<a class="a11y-panel__link" href="' + base + 'accesibilidad/">Declaración de accesibilidad</a>' +
      '</div>';
    return wrap;
  }

  function init() {
    /* estado guardado antes de montar, para no parpadear */
    var savedTheme = load(K.theme);
    if (savedTheme) root.setAttribute('data-theme', savedTheme);

    ['contrast', 'invert', 'spacing', 'links', 'cursor', 'guide'].forEach(function (name) {
      if (load(K[name]) === '1') {
        var cls = { contrast: 'a11y-contrast', invert: 'a11y-invert', spacing: 'a11y-readable', links: 'a11y-links', cursor: 'a11y-bigcursor', guide: 'a11y-guide' }[name];
        root.classList.add(cls);
      }
    });

    var mount = document.getElementById('a11yMount');
    if (!mount) return;

    statusEl = document.createElement('div');
    statusEl.className = 'sr-only';
    statusEl.id = 'a11yStatus';
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(statusEl);

    mount.appendChild(buildWidget(BASE));

    var toggle = document.getElementById('a11yToggle');
    var panel = document.getElementById('a11yPanel');
    var closeBtn = document.getElementById('a11yClose');
    var slider = document.getElementById('a11yFontSlider');
    var out = document.getElementById('a11yFontOut');
    var spacing = document.getElementById('a11ySpacing');
    var links = document.getElementById('a11yLinks');
    var contrast = document.getElementById('a11yContrast');
    var invert = document.getElementById('a11yInvert');
    var cursor = document.getElementById('a11yCursor');
    var guide = document.getElementById('a11yGuide');
    var bgInput = document.getElementById('a11yBgColor');
    var textInput = document.getElementById('a11yTextColor');
    var speakBtn = document.getElementById('a11ySpeak');
    var stopBtn = document.getElementById('a11yStop');
    var resetBtn = document.getElementById('a11yReset');

    /* restaurar valores */
    var savedScale = load(K.scale);
    if (savedScale) { slider.value = applyScale(savedScale); } else { out.textContent = '100%'; }
    spacing.checked = root.classList.contains('a11y-readable');
    links.checked = root.classList.contains('a11y-links');
    cursor.checked = root.classList.contains('a11y-bigcursor');
    guide.checked = root.classList.contains('a11y-guide');
    contrast.setAttribute('aria-pressed', String(root.classList.contains('a11y-contrast')));
    invert.setAttribute('aria-pressed', String(root.classList.contains('a11y-invert')));

    var savedBg = load(K.bg);
    var savedText = load(K.text);
    if (savedBg) bgInput.value = savedBg;
    if (savedText) textInput.value = savedText;
    if ((savedBg || savedText) && load(K.theme) === 'custom') {
      applyCustomColors(savedBg, savedText);
    }

    if (guide.checked) ensureGuide();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = function () { voice = pickVoice(); };
      voice = pickVoice();
    }

    var lastFocus = null;

    function openPanel() {
      lastFocus = document.activeElement;
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      slider.focus();
      status('Panel de accesibilidad abierto.');
    }
    function closePanel() {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    toggle.addEventListener('click', function () {
      if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);

    document.addEventListener('click', function (e) {
      if (!panel.hasAttribute('hidden') && !panel.contains(e.target) && !toggle.contains(e.target)) closePanel();
    });

    /* Escape cierra; Tab queda atrapado dentro del panel mientras está abierto */
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closePanel(); toggle.focus(); return; }
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('button, input, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
      }
    });

    slider.addEventListener('input', function () {
      var v = applyScale(slider.value);
      status('Tamaño del texto al ' + v + ' por ciento.');
    });

    spacing.addEventListener('change', function () {
      toggleClass('a11y-readable', spacing.checked);
      save(K.spacing, spacing.checked ? '1' : '0');
      status(spacing.checked ? 'Espaciado de texto ampliado.' : 'Espaciado de texto normal.');
    });

    links.addEventListener('change', function () {
      toggleClass('a11y-links', links.checked);
      save(K.links, links.checked ? '1' : '0');
      status(links.checked ? 'Enlaces subrayados.' : 'Subrayado de enlaces desactivado.');
    });

    contrast.addEventListener('click', function () {
      var on = !root.classList.contains('a11y-contrast');
      toggleClass('a11y-contrast', on);
      if (on) { toggleClass('a11y-invert', false); invert.setAttribute('aria-pressed', 'false'); save(K.invert, '0'); }
      contrast.setAttribute('aria-pressed', String(on));
      save(K.contrast, on ? '1' : '0');
      status(on ? 'Alto contraste activado.' : 'Alto contraste desactivado.');
    });

    invert.addEventListener('click', function () {
      var on = !root.classList.contains('a11y-invert');
      toggleClass('a11y-invert', on);
      if (on) { toggleClass('a11y-contrast', false); contrast.setAttribute('aria-pressed', 'false'); save(K.contrast, '0'); }
      invert.setAttribute('aria-pressed', String(on));
      save(K.invert, on ? '1' : '0');
      status(on ? 'Colores invertidos.' : 'Colores normales.');
    });

    cursor.addEventListener('change', function () {
      toggleClass('a11y-bigcursor', cursor.checked);
      save(K.cursor, cursor.checked ? '1' : '0');
      status(cursor.checked ? 'Cursor grande activado.' : 'Cursor normal.');
    });

    guide.addEventListener('change', function () {
      toggleClass('a11y-guide', guide.checked);
      if (guide.checked) ensureGuide();
      save(K.guide, guide.checked ? '1' : '0');
      status(guide.checked ? 'Guía de lectura activada.' : 'Guía de lectura desactivada.');
    });

    document.addEventListener('mousemove', moveGuide);

    bgInput.addEventListener('input', function () {
      applyCustomColors(bgInput.value, null);
      status('Color de fondo cambiado.');
    });
    textInput.addEventListener('input', function () {
      applyCustomColors(null, textInput.value);
      status('Color de texto cambiado.');
    });

    speakBtn.addEventListener('click', speakPage);
    stopBtn.addEventListener('click', function () { stopSpeaking(false); });

    resetBtn.addEventListener('click', function () {
      stopSpeaking(true);
      drop(K.bg); drop(K.text); drop(K.scale); drop(K.contrast);
      drop(K.invert); drop(K.spacing); drop(K.links); drop(K.cursor); drop(K.guide);
      root.style.removeProperty('--custom-bg');
      root.style.removeProperty('--custom-text');
      root.style.fontSize = '';
      root.classList.remove('a11y-contrast', 'a11y-invert', 'a11y-readable', 'a11y-links', 'a11y-bigcursor', 'a11y-guide');
      root.setAttribute('data-theme', 'light');
      save(K.theme, 'light');
      slider.value = 100; out.textContent = '100%';
      bgInput.value = '#ffffff'; textInput.value = '#0f1e3a';
      spacing.checked = links.checked = cursor.checked = guide.checked = false;
      contrast.setAttribute('aria-pressed', 'false');
      invert.setAttribute('aria-pressed', 'false');
      speakBtn.setAttribute('aria-pressed', 'false');
      status('Todos los ajustes de accesibilidad restablecidos.');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

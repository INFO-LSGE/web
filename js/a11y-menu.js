(function () {
  'use strict';

  var KEY_SCALE = 'lsge-fontscale';
  var KEY_BG = 'lsge-custom-bg';
  var KEY_TEXT = 'lsge-custom-text';
  var KEY_THEME = 'lsge-theme';

  function applyScale(scale) {
    document.documentElement.style.fontSize = scale + '%';
    localStorage.setItem(KEY_SCALE, scale);
  }

  function applyCustomColors(bg, text) {
    var root = document.documentElement;
    if (bg) { root.style.setProperty('--custom-bg', bg); localStorage.setItem(KEY_BG, bg); }
    if (text) { root.style.setProperty('--custom-text', text); localStorage.setItem(KEY_TEXT, text); }
    root.setAttribute('data-theme', 'custom');
    localStorage.setItem(KEY_THEME, 'custom');
  }

  function resetAll(slider, bgInput, textInput) {
    localStorage.removeItem(KEY_BG);
    localStorage.removeItem(KEY_TEXT);
    localStorage.removeItem(KEY_SCALE);
    document.documentElement.style.removeProperty('--custom-bg');
    document.documentElement.style.removeProperty('--custom-text');
    document.documentElement.style.fontSize = '';
    localStorage.setItem(KEY_THEME, 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    if (slider) slider.value = 100;
    if (bgInput) bgInput.value = '#ffffff';
    if (textInput) textInput.value = '#0f1e3a';
  }

  function buildWidget() {
    var wrap = document.createElement('div');
    wrap.className = 'a11y-widget';
    wrap.innerHTML =
      '<button type="button" class="a11y-toggle" id="a11yToggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="a11yPanel" aria-label="Herramientas de accesibilidad" title="Accesibilidad">' +
        '<span class="material-symbols-outlined" aria-hidden="true">accessibility_new</span>' +
      '</button>' +
      '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="Herramientas de accesibilidad" hidden>' +
        '<div class="a11y-panel__row">' +
          '<label for="a11yFontSlider">Tamaño de texto</label>' +
          '<input type="range" id="a11yFontSlider" min="87.5" max="130" step="12.5" value="100">' +
        '</div>' +
        '<div class="a11y-panel__row">' +
          '<label for="a11yBgColor">Color de fondo</label>' +
          '<input type="color" id="a11yBgColor" value="#ffffff">' +
        '</div>' +
        '<div class="a11y-panel__row">' +
          '<label for="a11yTextColor">Color de texto</label>' +
          '<input type="color" id="a11yTextColor" value="#0f1e3a">' +
        '</div>' +
        '<button type="button" class="a11y-panel__reset" id="a11yReset">' +
          '<span class="material-symbols-outlined" aria-hidden="true">restart_alt</span> Restablecer' +
        '</button>' +
      '</div>';
    return wrap;
  }

  function init() {
    var savedTheme = localStorage.getItem(KEY_THEME);
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    var mount = document.getElementById('a11yMount');
    if (!mount) return;
    mount.appendChild(buildWidget());

    var toggle = document.getElementById('a11yToggle');
    var panel = document.getElementById('a11yPanel');
    var slider = document.getElementById('a11yFontSlider');
    var bgInput = document.getElementById('a11yBgColor');
    var textInput = document.getElementById('a11yTextColor');
    var resetBtn = document.getElementById('a11yReset');

    var savedScale = localStorage.getItem(KEY_SCALE);
    if (savedScale) { applyScale(savedScale); slider.value = savedScale; }
    var savedBg = localStorage.getItem(KEY_BG);
    var savedText = localStorage.getItem(KEY_TEXT);
    if (savedBg) bgInput.value = savedBg;
    if (savedText) textInput.value = savedText;
    if ((savedBg || savedText) && localStorage.getItem(KEY_THEME) === 'custom') {
      applyCustomColors(savedBg, savedText);
    }

    function openPanel() {
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function closePanel() {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
    });
    document.addEventListener('click', function (e) {
      if (!panel.hasAttribute('hidden') && !panel.contains(e.target) && !toggle.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hasAttribute('hidden')) { closePanel(); toggle.focus(); }
    });

    slider.addEventListener('input', function () { applyScale(slider.value); });
    bgInput.addEventListener('input', function () { applyCustomColors(bgInput.value, null); });
    textInput.addEventListener('input', function () { applyCustomColors(null, textInput.value); });
    resetBtn.addEventListener('click', function () { resetAll(slider, bgInput, textInput); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

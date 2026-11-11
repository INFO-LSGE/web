/*
 * LSGE — Vídeos en Lengua de Signos
 * 1) Panel de vídeo por cada párrafo de contenido.
 * 2) Tooltip con el signo de cada elemento del menú de navegación.
 *
 * Los vídeos se sirven desde /videos/lsge/ (párrafos) y /videos/signos/ (menú).
 * Si el archivo no existe todavía, el panel muestra un marcador con la mano.
 */
(function () {
  'use strict';

  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/js\/lsge-media\.js.*$/, '') : '';

  function slug(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function pageKey() {
    var path = location.pathname.replace(/\/+$/, '');
    var last = path.split('/').pop() || 'index';
    return last === 'web' ? 'index' : slug(last) || 'index';
  }

  /* ============================================================
   * 1. TOOLTIP CON EL SIGNO DEL MENÚ
   * ============================================================ */
  var SIGN_RULES = [
    [/#mision/, 'MISIÓN'],
    [/#lsge/, 'LENGUA'],
    [/#comunidad/, 'COMUNIDAD'],
    [/#servicios/, 'SERVICIOS'],
    [/#impacto/, 'IMPACTO'],
    [/#contacto/, 'CONTACTO'],
    [/linguistica/, 'GRAMÁTICA'],
    [/diccionario/, 'DICCIONARIO'],
    [/accesibilidad/, 'ACCESIBILIDAD'],
    [/^\.\.\/$|^\/web\/?$|^\.\/$/, 'INICIO']
  ];

  function glossFor(el) {
    if (el.dataset && el.dataset.sign) return el.dataset.sign;
    if (el.id === 'navVideoBtn' || el.id === 'heroVideoBtn') return 'VÍDEO';
    var href = el.getAttribute('href') || '';
    if (href) {
      for (var i = 0; i < SIGN_RULES.length; i++) {
        if (SIGN_RULES[i][0].test(href)) return SIGN_RULES[i][1];
      }
    }
    var txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return txt ? txt.toUpperCase() : '';
  }

  function initSignTip() {
    var items = document.querySelectorAll('.nav__links a, .nav__links button, .site-nav a');
    if (!items.length) return;

    var tip = document.createElement('div');
    tip.className = 'sign-tip';
    tip.id = 'signTip';
    tip.setAttribute('role', 'tooltip');
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML =
      '<div class="sign-tip__media">' +
        '<video muted loop playsinline preload="none"></video>' +
        '<span class="lsge-media__hand" aria-hidden="true">🤟</span>' +
      '</div>' +
      '<span class="sign-tip__kicker">Señal LSGE</span>' +
      '<strong class="sign-tip__gloss"></strong>' +
      '<span class="sign-tip__hint">Vídeo del signo próximamente</span>';
    document.body.appendChild(tip);

    var video = tip.querySelector('video');
    var hand = tip.querySelector('.lsge-media__hand');
    var glossEl = tip.querySelector('.sign-tip__gloss');
    var hint = tip.querySelector('.sign-tip__hint');
    var hideTimer = null;

    function place(el) {
      var r = el.getBoundingClientRect();
      var w = 196;
      var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
      var top = r.bottom + 8;
      tip.style.left = Math.round(left) + 'px';
      tip.style.top = Math.round(top) + 'px';
      /* si no cabe abajo, se muestra encima */
      if (top + 150 > window.innerHeight - 8) {
        tip.style.top = Math.round(Math.max(8, r.top - 158)) + 'px';
      }
    }

    function loadSign(gloss) {
      glossEl.textContent = gloss;
      hint.textContent = 'Vídeo del signo próximamente';
      video.style.display = 'none';
      hand.style.display = '';
      video.pause();
      video.removeAttribute('src');
      video.load();
      delete video.dataset.fallback;

      var src = BASE + 'videos/signos/menu-' + slug(gloss) + '.mp4';

      video.onloadeddata = function () {
        video.style.display = 'block';
        hand.style.display = 'none';
        if (video.dataset.fallback === '1') {
          hint.textContent = 'Muestra del diccionario · signo de «' + gloss + '» pendiente';
        } else {
          hint.textContent = 'Vídeo del signo';
        }
        video.play().catch(function () {});
      };

      video.onerror = function () {
        /* Si el signo concreto del menú aún no existe, se muestra un clip de
           muestra del diccionario, claramente etiquetado como muestra. */
        if (video.dataset.fallback !== '1') {
          video.dataset.fallback = '1';
          video.src = BASE + 'videos/lsge/demo-bien.mp4';
          video.load();
          return;
        }
        video.style.display = 'none';
        hand.style.display = '';
        hint.textContent = 'Vídeo del signo próximamente';
      };

      video.src = src;
      video.load();
    }

    function show(el) {
      window.clearTimeout(hideTimer);
      var gloss = glossFor(el);
      if (!gloss) return;
      loadSign(gloss);
      place(el);
      tip.classList.add('is-open');
      tip.setAttribute('aria-hidden', 'false');
    }

    function hide() {
      tip.classList.remove('is-open');
      tip.setAttribute('aria-hidden', 'true');
      video.pause();
    }

    function delayedHide() {
      hideTimer = window.setTimeout(hide, 120);
    }

    items.forEach(function (el) {
      el.addEventListener('mouseenter', function () { show(el); });
      el.addEventListener('mouseleave', delayedHide);
      el.addEventListener('focus', function () { show(el); });
      el.addEventListener('blur', delayedHide);
    });

    tip.addEventListener('mouseenter', function () { window.clearTimeout(hideTimer); });
    tip.addEventListener('mouseleave', delayedHide);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
    });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
  }

  /* ============================================================
   * 2. PANEL DE VÍDEO POR PÁRRAFO
   * ============================================================ */
  function initParagraphPanels() {
    var main = document.getElementById('main');
    if (!main || !main.hasAttribute('data-lsge-media')) return;

    var page = pageKey();
    var counters = {};
    var total = 0;
    var SKIP = '.card,.service-card,.com-card,.portal,.feature,.stat,.impacto,.footer,.hero,.signo-card,.modal,.a11y-panel,.lsge-media';

    Array.prototype.slice.call(main.querySelectorAll('p')).forEach(function (p) {
      var text = (p.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length < 90) return;
      if (p.closest(SKIP)) return;
      if (p.nextElementSibling && p.nextElementSibling.classList.contains('lsge-media')) return;

      var section = p.closest('section[id]');
      var sid = section ? section.id : 'general';
      counters[sid] = (counters[sid] || 0) + 1;
      total += 1;

      var id = 'lsge-panel-' + total;
      var custom = p.getAttribute('data-lsge-video');
      var file = custom || ('videos/lsge/' + page + '-' + sid + '-' + counters[sid] + '.mp4');
      var label = p.getAttribute('data-lsge-label') || 'Ver este párrafo en LSGE';
      var caption = p.getAttribute('data-lsge-caption') || 'Traducción de este párrafo a la Lengua de Signos de Guinea Ecuatorial.';
      var poster = p.getAttribute('data-lsge-poster') || 'img/lsge-demo-bien.jpg';
      var centered = !!p.closest('.section-header');

      var fig = document.createElement('figure');
      fig.className = 'lsge-media' + (centered ? ' lsge-media--center' : '');
      fig.setAttribute('data-video', file);
      fig.innerHTML =
        '<button class="lsge-media__btn" type="button" aria-expanded="false" aria-controls="' + id + '">' +
          '<span class="lsge-media__hand" aria-hidden="true">🤟</span>' +
          '<span>' + label + '</span>' +
          '<span class="lsge-media__chev" aria-hidden="true">▾</span>' +
        '</button>' +
        '<div class="lsge-media__body" id="' + id + '" hidden>' +
          '<div class="lsge-media__slot">' +
            '<video controls playsinline preload="none"' + (poster ? ' poster="' + BASE + poster + '"' : '') + '></video>' +
            '<div class="lsge-media__ph">' +
              '<span class="lsge-media__hand" aria-hidden="true">🤟</span>' +
              '<p>Vídeo en LSGE pendiente de grabar.</p>' +
              '<small>Se publicará en <code>' + file + '</code></small>' +
            '</div>' +
          '</div>' +
          '<small class="lsge-media__prov" hidden>Vídeo provisional de muestra (signo BIEN). Se sustituirá por la traducción de este párrafo.</small>' +
          '<figcaption class="lsge-media__caption">' + caption + '</figcaption>' +
        '</div>';

      p.insertAdjacentElement('afterend', fig);

      var btn = fig.querySelector('.lsge-media__btn');
      var body = fig.querySelector('.lsge-media__body');
      var video = fig.querySelector('video');
      var ph = fig.querySelector('.lsge-media__ph');
      var prov = fig.querySelector('.lsge-media__prov');

      /* Todos los paneles arrancan con el póster visible */
      video.style.display = 'block';
      ph.style.display = 'none';

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        body.hidden = open;
        if (open) {
          video.pause();
          return;
        }
        if (!video.dataset.loaded) {
          video.dataset.loaded = '1';
          video.onloadeddata = function () {
            video.style.display = 'block';
            ph.style.display = 'none';
            if (prov) prov.hidden = (video.dataset.demo !== '1');
            video.play().catch(function () {});
          };
          video.onerror = function () {
            /* Si aún no existe el vídeo de este párrafo, se usa el clip
               provisional del diccionario y se indica que es una muestra. */
            if (video.dataset.demo !== '1') {
              video.dataset.demo = '1';
              video.src = BASE + 'videos/lsge/demo-bien.mp4';
              video.load();
              return;
            }
            video.style.display = 'none';
            ph.style.display = '';
          };
          video.src = BASE + file;
          video.load();
        }
      });
    });
  }

  function init() {
    initSignTip();
    initParagraphPanels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

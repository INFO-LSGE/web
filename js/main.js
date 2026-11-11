(function() {
  var currentLang = localStorage.getItem('lsge-lang') || 'es';
  var currentTheme = localStorage.getItem('lsge-theme') || 'light';

  /* Códigos BCP 47 válidos: un lang inválido hace que el lector de pantalla
     pronuncie el texto con la voz equivocada. */
  var LANG_TAG = { es: 'es', fr: 'fr', fang: 'fan', bubi: 'buw' };

  function announce(msg) {
    var live = document.getElementById('liveStatus');
    if (!live) {
      live = document.createElement('div');
      live.id = 'liveStatus';
      live.className = 'sr-only';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 60);
  }

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lsge-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) {
      var active = b.dataset.lang === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    document.documentElement.lang = LANG_TAG[lang] || 'es';
    document.documentElement.setAttribute('data-lang', lang);

    var translations = I18N[lang] || I18N.es;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key]) el.innerHTML = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.placeholder = translations[key];
    });
    document.querySelectorAll('[data-i18n-tooltip]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-tooltip');
      if (translations[key]) el.setAttribute('data-tooltip', translations[key]);
    });

    announce('Idioma cambiado a ' + ({ es: 'español', fr: 'francés', fang: 'fang', bubi: 'bubi' }[lang] || lang) + '.');
  }

  document.documentElement.setAttribute('data-theme', currentTheme);

  applyLang(currentLang);

  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { applyLang(this.dataset.lang); });
  });

  /* -- NAV SCROLL -- */
  var nav = document.getElementById('nav');
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* -- MOBILE MENU -- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function setMenu(open) {
    navToggle.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  navToggle.addEventListener('click', function() {
    var open = !navLinks.classList.contains('active');
    setMenu(open);
    if (open) {
      var first = navLinks.querySelector('a, button');
      if (first) first.focus();
    }
  });
  navLinks.querySelectorAll('a, button').forEach(function(link) {
    link.addEventListener('click', function() { setMenu(false); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* -- TABS (role=tab / role=tabpanel) -- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  function activateTab(btn) {
    if (!btn) return;
    tabButtons.forEach(function(b) {
      var on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('.tab-content').forEach(function(c) {
      c.classList.toggle('active', c.id === 'tab-' + btn.dataset.tab);
    });
  }
  tabButtons.forEach(function(btn, i) {
    btn.addEventListener('click', function() { activateTab(btn); });
    btn.addEventListener('keydown', function(e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabButtons[(i + 1) % tabButtons.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length];
      if (e.key === 'Home') next = tabButtons[0];
      if (e.key === 'End') next = tabButtons[tabButtons.length - 1];
      if (next) { e.preventDefault(); next.focus(); activateTab(next); }
    });
  });

  /* -- SCROLL ANIMATIONS (desactivadas con movimiento reducido) -- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animated = document.querySelectorAll('.card, .stat, .service-card, .feature, .com-card, .impacto__item');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animated.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1)';
      observer.observe(el);
    });

    /* Red de seguridad: si algo falla, el contenido nunca queda invisible */
    window.setTimeout(function() {
      animated.forEach(function(el) {
        if (el.style.opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
    }, 4000);
  }

  /* -- FORM -- */
  var form = document.querySelector('.contacto__form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var status = document.getElementById('formStatus');
      var originalText = btn.textContent;
      btn.textContent = 'Enviado. Gracias.';
      btn.disabled = true;
      btn.style.background = '#34a853';
      if (status) status.textContent = 'Mensaje enviado. Gracias por contactar con LSGE.';
      setTimeout(function() {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
        if (status) status.textContent = '';
        form.reset();
      }, 3000);
    });
  }

  /* -- VÍDEO LSGE (modal institucional) -- */
  (function () {
    var overlay = document.getElementById('videoModalOverlay');
    if (!overlay) return;
    var video = document.getElementById('videoModalVideo');
    var placeholder = document.getElementById('videoModalPlaceholder');
    var closeBtn = document.getElementById('videoModalClose');
    var triggers = [document.getElementById('heroVideoBtn'), document.getElementById('navVideoBtn')];
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
      if (video) { video.currentTime = 0; video.play().catch(function () {}); }
    }
    function closeModal() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      if (video) video.pause();
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    /* Trampa de foco: con el modal abierto, Tab no se escapa al fondo */
    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      var f = overlay.querySelectorAll('button, [href], video, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      f = Array.prototype.filter.call(f, function(el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    triggers.forEach(function (btn) { if (btn) btn.addEventListener('click', openModal); });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    overlay.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') closeModal();
    });

    /* si el vídeo institucional aún no existe (placeholder), mostrar el estado vacío en vez de un vídeo negro */
    if (video) {
      video.addEventListener('error', function () {
        video.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      });
      video.addEventListener('loadeddata', function () {
        video.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      });
    }
  })();

  /* -- ENLACES SIN DESTINO: no fingen ser navegables -- */
  document.querySelectorAll('a[href="#"]').forEach(function(a) {
    a.setAttribute('aria-disabled', 'true');
    a.addEventListener('click', function(e) {
      e.preventDefault();
      announce('Contenido próximamente.');
    });
  });
})();

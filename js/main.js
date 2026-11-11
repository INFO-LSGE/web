(function() {
  var currentLang = localStorage.getItem('lsge-lang') || 'es';
  var currentTheme = localStorage.getItem('lsge-theme') || 'light';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lsge-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) {
      var active = b.dataset.lang === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    document.documentElement.lang = lang;

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
  navToggle.addEventListener('click', function() {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    var open = navLinks.classList.contains('active');
    document.body.style.overflow = open ? 'hidden' : '';
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a, button').forEach(function(link) {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* -- TABS -- */
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      var target = document.getElementById('tab-' + tab);
      if (target) target.classList.add('active');
    });
  });

  /* -- SCROLL ANIMATIONS -- */
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.card, .stat, .service-card, .feature, .com-card, .impacto__item').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1)';
    observer.observe(el);
  });

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

    triggers.forEach(function (btn) { if (btn) btn.addEventListener('click', openModal); });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
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
})();

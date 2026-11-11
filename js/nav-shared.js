/* Menú de navegación compartido con la portada */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!nav) return;

  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (!toggle || !links) return;

  function setMenu(open) {
    toggle.classList.toggle('active', open);
    links.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  toggle.addEventListener('click', function () {
    var open = !links.classList.contains('active');
    setMenu(open);
    if (open) {
      var first = links.querySelector('a, button');
      if (first) first.focus();
    }
  });

  links.querySelectorAll('a, button').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('active')) {
      setMenu(false);
      toggle.focus();
    }
  });
})();

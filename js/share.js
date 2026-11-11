/* Compartir: copiar enlace y compartir nativo (móvil) */
(function () {
  'use strict';

  function setStatus(box, msg) {
    if (!box) return;
    var el = box.querySelector('.share__status');
    if (!el) return;
    el.textContent = '';
    window.setTimeout(function () { el.textContent = msg; }, 40);
  }

  function copyFallback(url, done, fail) {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      var ok = document.execCommand('copy');
      ta.remove();
      if (ok) done(); else fail();
    } catch (e) {
      ta.remove();
      fail();
    }
  }

  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy-link');
      var box = btn.closest('.share');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          setStatus(box, 'Enlace copiado al portapapeles.');
        }).catch(function () {
          copyFallback(url,
            function () { setStatus(box, 'Enlace copiado al portapapeles.'); },
            function () { setStatus(box, 'No se pudo copiar. Selecciona el enlace de la barra de direcciones.'); });
        });
      } else {
        copyFallback(url,
          function () { setStatus(box, 'Enlace copiado al portapapeles.'); },
          function () { setStatus(box, 'No se pudo copiar. Selecciona el enlace de la barra de direcciones.'); });
      }
    });
  });

  var nativeBtns = document.querySelectorAll('[data-native-share]');
  if (navigator.share) {
    nativeBtns.forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        navigator.share({
          title: btn.getAttribute('data-title') || document.title,
          url: btn.getAttribute('data-url') || location.href
        }).catch(function () {});
      });
    });
  }
})();

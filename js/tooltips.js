/*
 * LsgeDict — Motor de búsqueda del Diccionario Visual LSGE
 * v2.0 — Buscador en tiempo real con autocompletado, tooltips con vídeo y tests
 */
var LsgeDict = (function() {
  'use strict';

  /* === STATE === */
  var data = typeof SIGNOS !== 'undefined' ? SIGNOS : [];
  var activeCat = 'all';
  var searchQuery = '';
  var debounceTimer = null;
  var currentSign = null;
  var categories = [];
  var totalShown = 0;

  /* === DOM refs === */
  var els = {};
  function cache() {
    els.grid = document.getElementById('signosGrid');
    els.search = document.getElementById('searchInput');
    els.suggestions = document.getElementById('suggestions');
    els.empty = document.getElementById('emptyState');
    els.stats = document.getElementById('searchStats');
    els.statsText = document.getElementById('statsText');
    els.cats = document.getElementById('categoryFilters');
    els.resultCount = document.getElementById('resultCount');
    els.signCount = document.getElementById('signCount');
    els.tltp = document.getElementById('tltp');
    els.tltpGlosa = document.getElementById('tltpGlosa');
    els.tltpParams = document.getElementById('tltpParams');
    els.tltpVid = document.getElementById('tltpVid');
    els.tltpVideo = document.getElementById('tltpVideo');
    els.tltpPlaceholder = document.getElementById('tltpPlaceholder');
    els.modal = document.getElementById('modal');
    els.modalOverlay = document.getElementById('modalOverlay');
    els.testResult = document.getElementById('testResult');
  }

  /* === VALIDATE DATA === */
  function validateData() {
    if (!Array.isArray(data)) { console.error('SIGNOS no es un array'); return false; }
    var errors = [];
    var seen = {};
    data.forEach(function(s, i) {
      if (!s.g) errors.push('Falta glosa en índice ' + i);
      if (!s.cat) errors.push('Falta cat en ' + (s.g || i));
      if (s.g && seen[s.g]) errors.push('Duplicado: ' + s.g);
      if (s.g) seen[s.g] = 1;
    });
    if (errors.length) { console.warn('Validación:', errors); }
    return errors.length === 0;
  }

  /* === EXTRACT CATEGORIES === */
  function extractCats() {
    var set = {};
    data.forEach(function(s) { if (s.cat) set[s.cat] = 1; });
    categories = Object.keys(set).sort();
  }

  /* === BUILD CATEGORY BUTTONS === */
  function buildCats() {
    if (!els.cats) return;
    var catIcons = {saludos:'waving_hand',familia:'family_restroom',comida:'restaurant',verbos:'directions_run',tiempo:'schedule',colores:'palette',numeros:'123',lugares:'location_on'};
    var catLabels = {saludos:'Saludos',familia:'Familia',comida:'Comida',verbos:'Verbos',tiempo:'Tiempo',colores:'Colores',numeros:'Números',lugares:'Lugares'};
    function btnHtml(cat, icon, label, active) {
      return '<button class="cat-btn' + (active ? ' active' : '') + '" data-cat="' + cat + '">' +
        '<span class="material-symbols-outlined" aria-hidden="true">' + icon + '</span> ' + label + '</button>';
    }
    var html = btnHtml('all', 'apps', 'Todos', true);
    categories.forEach(function(c) {
      html += btnHtml(c, catIcons[c] || 'label', catLabels[c] || c, false);
    });
    els.cats.innerHTML = html;
    els.cats.querySelectorAll('.cat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        els.cats.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active')});
        this.classList.add('active');
        activeCat = this.dataset.cat;
        render();
      });
    });
  }

  /* === FILTER === */
  function filter() {
    return data.filter(function(s) {
      if (activeCat !== 'all' && s.cat !== activeCat) return false;
      if (!searchQuery) return true;
      var q = searchQuery.toLowerCase();
      return s.g.toLowerCase().indexOf(q) !== -1 || (s.def && s.def.toLowerCase().indexOf(q) !== -1);
    });
  }

  /* === RENDER GRID === */
  function render() {
    if (!els.grid) return;
    var results = filter();
    totalShown = results.length;
    els.grid.innerHTML = '';

    if (!results.length) {
      if (els.empty) els.empty.style.display = 'block';
      if (els.stats) els.stats.style.display = 'none';
      if (els.resultCount) els.resultCount.textContent = '';
      return;
    }
    if (els.empty) els.empty.style.display = 'none';

    results.forEach(function(s) {
      var card = document.createElement('div');
      card.className = 'signo-card';
      card.setAttribute('data-g', s.g);
      card.setAttribute('data-idx', data.indexOf(s));
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Ver ficha de ' + s.g);
      card.innerHTML =
        '<div class="signo-card__top">' +
          '<div class="signo-card__icon" aria-hidden="true">' + (s.icon || '🤟') + '</div>' +
          '<div><div class="signo-card__glosa">' + s.g + '</div><div class="signo-card__cat">' + s.cat + '</div></div>' +
        '</div>' +
        '<div class="signo-card__def">' + (s.def || '') + '</div>' +
        '<div class="signo-card__hint"><span class="material-symbols-outlined" aria-hidden="true">' + (s.video ? 'videocam' : 'edit_note') + '</span> ' + (s.video ? 'Pasa el cursor para ver el signo' : 'Clic para ver ficha') + '</div>';
      card.addEventListener('mouseenter', function(e){showTooltip(s, e)});
      card.addEventListener('mouseleave', hideTooltip);
      card.addEventListener('mousemove', function(e){moveTooltip(e)});
      card.addEventListener('click', function(){openDetail(s)});
      card.addEventListener('focus', function(e){showTooltip(s, {clientX:e.target.getBoundingClientRect().left, clientY:e.target.getBoundingClientRect().top});});
      card.addEventListener('blur', hideTooltip);
      card.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(s); }
      });
      els.grid.appendChild(card);
    });

    if (els.resultCount) els.resultCount.textContent = totalShown + ' de ' + data.length + ' signos mostrados';
    if (els.signCount) els.signCount.textContent = totalShown + ' / ' + data.length;
    updateStats(results.length);
  }

  /* === UPDATE STATS === */
  function updateStats(n) {
    if (!els.stats) return;
    if (n < data.length || searchQuery) {
      els.stats.style.display = 'block';
      els.statsText.textContent = n + ' resultado' + (n !== 1 ? 's' : '') + (searchQuery ? ' para "' + searchQuery + '"' : '');
    } else {
      els.stats.style.display = 'none';
    }
  }

  /* === SEARCH WITH DEBOUNCE & AUTOCOMPLETE === */
  function onSearchInput() {
    var val = els.search.value.trim();
    if (val === searchQuery) return;
    searchQuery = val;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      render();
      showSuggestions();
    }, 150);
  }

  function showSuggestions() {
    if (!els.suggestions) return;
    if (!searchQuery) { closeSuggestions(); return; }
    var q = searchQuery.toLowerCase();
    var matches = data.filter(function(s) {
      return s.g.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);

    if (!matches.length) { closeSuggestions(); return; }

    var html = '';
    matches.forEach(function(s, i) {
      var highlighted = s.g.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
      html += '<div class="suggestion-item" role="option" id="sugg-' + i + '" aria-selected="false" data-idx="' + data.indexOf(s) + '" data-i="' + i + '">' +
                '<span class="suggestion-icon" aria-hidden="true">' + (s.icon || '🤟') + '</span>' +
                '<span class="suggestion-text">' + highlighted + '</span>' +
                '<span class="suggestion-cat">' + s.cat + '</span>' +
              '</div>';
    });
    els.suggestions.innerHTML = html;
    els.suggestions.style.display = 'block';
    els.suggestions.removeAttribute('hidden');
    suggIndex = -1;
    if (els.search) els.search.setAttribute('aria-expanded', 'true');

    els.suggestions.querySelectorAll('.suggestion-item').forEach(function(item) {
      item.addEventListener('click', function() { chooseSuggestion(parseInt(this.dataset.idx, 10)); });
    });
  }

  var suggIndex = -1;

  function closeSuggestions() {
    if (!els.suggestions) return;
    els.suggestions.innerHTML = '';
    els.suggestions.style.display = 'none';
    els.suggestions.setAttribute('hidden', '');
    suggIndex = -1;
    if (els.search) {
      els.search.setAttribute('aria-expanded', 'false');
      els.search.removeAttribute('aria-activedescendant');
    }
  }

  function highlightSuggestion(i) {
    var items = els.suggestions.querySelectorAll('.suggestion-item');
    if (!items.length) return;
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    suggIndex = i;
    items.forEach(function(el, n) {
      var on = n === i;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', String(on));
    });
    els.search.setAttribute('aria-activedescendant', items[i].id);
  }

  function chooseSuggestion(idx) {
    var sign = data[idx];
    if (!sign) return;
    searchQuery = sign.g;
    els.search.value = sign.g;
    closeSuggestions();
    render();
    openDetail(sign);
  }

  if (els.search) {
    els.search.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (els.suggestions.style.display !== 'block') return;
        e.preventDefault();
        highlightSuggestion(suggIndex + (e.key === 'ArrowDown' ? 1 : -1));
        return;
      }
      if (e.key === 'Enter' && suggIndex >= 0) {
        e.preventDefault();
        var active = els.suggestions.querySelectorAll('.suggestion-item')[suggIndex];
        if (active) chooseSuggestion(parseInt(active.dataset.idx, 10));
        return;
      }
      if (e.key === 'Escape' && els.suggestions.style.display === 'block') {
        e.stopPropagation();
        closeSuggestions();
        els.search.focus();
      }
    });
  }

  if (els.search) els.search.addEventListener('focus', function() { if (searchQuery) showSuggestions(); });

  /* === TOOLTIP === */
  var tipTimeout = null;
  function showTooltip(s, e) {
    if (tipTimeout) clearTimeout(tipTimeout);
    currentSign = s;
    els.tltpGlosa.textContent = s.g;
    els.tltpParams.innerHTML =
      '<strong>CM:</strong> ' + s.cm + ' | <strong>LOC:</strong> ' + s.loc + '<br>' +
      '<strong>MOV:</strong> ' + s.mov + ' | <strong>OP:</strong> ' + s.op + (s.cnm ? ' | <strong>CNM:</strong> ' + s.cnm : '');
    els.tltpPlaceholder.textContent = s.icon || '🤟';

    if (s.video) {
      els.tltpVid.style.display = 'block';
      els.tltpPlaceholder.style.display = 'none';
      var src = els.tltpVideo.querySelector('source');
      src.src = '../videos/' + s.video;
      els.tltpVideo.load();
      els.tltpVideo.play().catch(function(){});
    } else {
      els.tltpVid.style.display = 'block';
      els.tltpPlaceholder.style.display = 'flex';
      els.tltpVideo.pause();
    }
    els.tltp.classList.add('visible');
    moveTooltip(e);
  }

  function hideTooltip() {
    tipTimeout = setTimeout(function() {
      els.tltp.classList.remove('visible');
      els.tltpVideo.pause();
    }, 200);
  }

  function moveTooltip(e) {
    var x = e.clientX + 20, y = e.clientY - 240;
    if (y < 5) y = 5;
    if (x + 300 > window.innerWidth) x = e.clientX - 310;
    els.tltp.style.left = x + 'px';
    els.tltp.style.top = y + 'px';
  }

  if (els.tltp) {
    els.tltp.addEventListener('mouseenter', function(){if(tipTimeout)clearTimeout(tipTimeout)});
    els.tltp.addEventListener('mouseleave', function(){els.tltp.classList.remove('visible');els.tltpVideo.pause()});
  }

  /* === MODAL DETAIL === */
  var lastFocused = null;
  function openDetail(s) {
    s = s || currentSign;
    if (!s) return;
    currentSign = s;
    lastFocused = document.activeElement;
    document.getElementById('modalGlosa').textContent = s.g;
    var modalCat = document.querySelector('.modal__cat');
    if (modalCat) modalCat.textContent = s.cat;
    document.getElementById('modalCM').textContent = s.cm;
    document.getElementById('modalLOC').textContent = s.loc;
    document.getElementById('modalMOV').textContent = s.mov;
    document.getElementById('modalOP').textContent = s.op;
    document.getElementById('modalCNM').textContent = s.cnm || '—';
    document.getElementById('modalDef').textContent = s.def || '—';
    var overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    var closeBtn = document.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();

    var mv = document.getElementById('modalVideo');
    var mp = document.getElementById('modalPlaceholder');
    if (s.video) {
      mp.style.display = 'none';
      mv.parentElement.style.display = 'block';
      mv.querySelector('source').src = '../videos/' + s.video;
      mv.load(); mv.play().catch(function(){});
    } else {
      mv.parentElement.style.display = 'none';
      mp.style.display = 'flex';
      mp.textContent = s.icon || '🤟';
    }
  }

  function closeDetail() {
    var overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.getElementById('modalVideo').pause();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* Trampa de foco en la ficha del signo */
  function trapModalFocus(e) {
    if (e.key !== 'Tab' || !els.modalOverlay || els.modalOverlay.style.display !== 'flex') return;
    var f = els.modalOverlay.querySelectorAll('button, [href], video, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* === EXPORT === */
  function exportData() {
    console.table(data);
    alert('Datos exportados a la consola. Pulsa F12 > Console para verlos.');
  }

  /* === RESET === */
  function reset() {
    if (els.search) els.search.value = '';
    searchQuery = '';
    activeCat = 'all';
    if (els.cats) { els.cats.querySelectorAll('.cat-btn').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all')}); }
    render();
  }

  /* === TESTS === */
  function runTests() {
    var passed = 0, failed = 0, logs = [];
    function t(desc, fn) {
      try { fn(); passed++; logs.push('✅ ' + desc); }
      catch(e) { failed++; logs.push('❌ ' + desc + ' — ' + e.message); }
    }
    t('SIGNOS es array', function(){ if(!Array.isArray(data)||!data.length)throw new Error('SIGNOS vacío o inválido') });
    t('Cada signo tiene glosa', function(){ data.forEach(function(s,i){if(!s.g)throw new Error('índice '+i+' sin glosa')}) });
    t('Cada signo tiene categoría', function(){ data.forEach(function(s,i){if(!s.cat)throw new Error(s.g+' sin categoría')}) });
    t('No hay glosas duplicadas', function(){var m={};data.forEach(function(s){if(m[s.g])throw new Error(s.g+' duplicado');m[s.g]=1})});
    t('Cada signo tiene 5 parámetros', function(){data.forEach(function(s){if(!s.cm||!s.loc||!s.mov||!s.op)throw new Error(s.g+' incompleto')})});
    t('Grid renderiza', function(){if(!document.getElementById('signosGrid'))throw new Error('Grid no encontrado')});
    t('Buscador existe', function(){if(!document.getElementById('searchInput'))throw new Error('Input no encontrado')});
    t('Tooltip existe', function(){if(!document.getElementById('tltp'))throw new Error('Tooltip no encontrado')});

    var msg = passed + '/' + (passed+failed) + ' tests pasados';
    if (els.testResult) els.testResult.textContent = failed ? msg + ' (' + failed + ' fallos)' : msg;
    alert(msg + '\n\n' + logs.join('\n'));
    console.log('=== LSGE DICT TESTS ===\n' + logs.join('\n'));
  }

  /* === KEYBOARD === */
  function onKey(e) {
    if (e.key === 'Escape') {
      if (els.suggestions && els.suggestions.style.display === 'block') {
        closeSuggestions();
      } else if (els.modalOverlay && els.modalOverlay.style.display === 'flex') {
        closeDetail();
      } else {
        els.tltp.classList.remove('visible');
        els.tltpVideo.pause();
      }
    }
  }

  /* === CLICK OUTSIDE === */
  function onClickOutside(e) {
    if (els.suggestions && !e.target.closest('.search-box')) {
      closeSuggestions();
    }
  }

  /* === INIT === */
  function init() {
    cache();
    if (!els.grid) { console.error('LsgeDict: grid no encontrado'); return; }
    if (!validateData()) { console.warn('LsgeDict: datos con errores, ver consola'); }
    extractCats();
    buildCats();
    render();

    if (els.search) els.search.addEventListener('input', onSearchInput);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClickOutside);
    if (els.modalOverlay) {
      els.modalOverlay.addEventListener('click', function(e){if(e.target===this)closeDetail()});
      els.modalOverlay.addEventListener('keydown', trapModalFocus);
      els.modalOverlay.setAttribute('aria-hidden', 'true');
    }

    /* si el vídeo no existe (404) o falla, volver al icono en vez de quedar en negro */
    if (els.tltpVideo) els.tltpVideo.addEventListener('error', function(){
      els.tltpPlaceholder.style.display = 'flex';
    });
    var modalVideoEl = document.getElementById('modalVideo');
    if (modalVideoEl) modalVideoEl.addEventListener('error', function(){
      var mp = document.getElementById('modalPlaceholder');
      modalVideoEl.parentElement.style.display = 'none';
      mp.style.display = 'flex';
      mp.textContent = (currentSign && currentSign.icon) || '🤟';
    });

    /* auto-run tests silently */
    setTimeout(runSilentTests, 500);
  }

  function runSilentTests() {
    try {
      if (!Array.isArray(data) || !data.length) throw new Error('Datos');
      data.forEach(function(s) { if(!s.g) throw new Error('Glosa'); });
      var ok = true;
    } catch(e) { console.error('LsgeDict test: ' + e.message); }
  }

  return {
    init: init, reset: reset,
    openDetail: openDetail, closeDetail: closeDetail,
    exportData: exportData, runTests: runTests
  };
})();

document.addEventListener('DOMContentLoaded', function() { LsgeDict.init(); });

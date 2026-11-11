# -*- coding: utf-8 -*-
"""Cabecera y pie compartidos, con el mismo diseño que la portada."""


def header(root="", active=""):
    blog_active = ' class="active" aria-current="page"' if active == "blog" else ""
    return """  <div class="toolbar">
    <div class="container toolbar__inner">
      <div class="toolbar__right">
        <div class="toolbar__theme"><div id="a11yMount"></div></div>
        <a href="%(root)s" class="toolbar__brand" aria-label="Asociación LSGE — inicio">
          <img src="%(root)simg/logo-oficial.svg" alt="" class="toolbar__logo" onerror="this.src='%(root)simg/logo-oficial.png'">
          <span>Asociación LSGE</span>
        </a>
      </div>
    </div>
  </div>

  <nav class="nav" id="nav" aria-label="Principal">
    <div class="nav__container">
      <a href="%(root)s" class="nav__logo" aria-label="Asociación LSGE — inicio">
        <img src="%(root)simg/logo-oficial.svg" alt="" class="nav__logo-img" onerror="this.src='%(root)simg/logo-oficial.png'">
        <span>LSGE</span>
      </a>
      <div class="nav__links" id="navLinks">
        <a href="%(root)s#mision">Misión</a>
        <a href="%(root)s#lsge">La Lengua</a>
        <a href="%(root)s#comunidad">Comunidad</a>
        <a href="%(root)s#servicios">Servicios</a>
        <a href="%(root)s#impacto">Impacto</a>
        <a href="%(root)sblog/"%(blog_active)s>Blog</a>
        <a href="%(root)s#contacto">Contacto</a>
      </div>
      <button class="nav__toggle" id="navToggle" type="button" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
""" % {"root": root, "blog_active": blog_active}


def footer(root=""):
    return """  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <span class="footer__logo"><img src="%(root)simg/logo-oficial.svg" alt="" style="height:22px;vertical-align:middle;margin-right:6px" onerror="this.src='%(root)simg/logo-oficial.png'"> LSGE</span>
          <p>Asociación sin ánimo de lucro. Apolítica. Constituida en Malabo, Guinea Ecuatorial. Al amparo de la Ley Nº 1/1999 de Régimen de ONG.</p>
        </div>
        <div class="footer__links">
          <h4>Enlaces</h4>
          <a href="%(root)s#mision">Misión</a>
          <a href="%(root)s#lsge">La Lengua</a>
          <a href="%(root)s#comunidad">Comunidad</a>
          <a href="%(root)s#contacto">Contacto</a>
        </div>
        <div class="footer__links">
          <h4>Recursos</h4>
          <a href="%(root)slinguistica/">Gramática LSGE</a>
          <a href="%(root)sdiccionario/">Diccionario Visual</a>
          <a href="%(root)sblog/">Blog</a>
          <a href="%(root)saccesibilidad/">Accesibilidad</a>
        </div>
        <div class="footer__links">
          <h4>Internacional</h4>
          <a href="https://wfdeaf.org" target="_blank" rel="noopener">WFD</a>
          <a href="https://wfdb.eu" target="_blank" rel="noopener">WFDB</a>
          <a href="https://wasli.org" target="_blank" rel="noopener">WASLI</a>
          <a href="https://www.un.org/development/desa/disabilities/" target="_blank" rel="noopener">ONU</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; 2026 Asociación LSGE — Lengua de Signos de Guinea Ecuatorial.</p>
        <p>Hecho con dedicación por la comunidad sorda de Guinea Ecuatorial.</p>
      </div>
    </div>
  </footer>
""" % {"root": root}

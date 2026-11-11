#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador estático del blog de la Asociación LSGE.

Uso:
    python3 tools/build_blog.py

Lee  blog/posts.json  y escribe:
    blog/index.html
    blog/<slug>/index.html
    blog/rss.xml
    blog/feed.json
    sitemap.xml

No tiene dependencias: solo la biblioteca estándar.
"""

import html
import json
import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import shell
from datetime import datetime, timezone
from email.utils import format_datetime

BASE = "https://info-lsge.github.io/web/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG = os.path.join(ROOT, "blog")

MESES = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)


def esc(text):
    return html.escape(text, quote=True)


def fecha_larga(iso):
    d = datetime.strptime(iso, "%Y-%m-%d")
    return "%d de %s de %d" % (d.day, MESES[d.month - 1], d.year)


def fecha_rss(iso):
    d = datetime.strptime(iso, "%Y-%m-%d").replace(hour=9, tzinfo=timezone.utc)
    return format_datetime(d)


def fecha_iso(iso):
    return iso + "T09:00:00+00:00"


def tags_html(tags):
    return "".join('<span class="tag">%s</span>' % esc(t) for t in tags)


def share_block(url, title, heading="Compartir este artículo"):
    import urllib.parse as up

    t = up.quote(title)
    u = up.quote(url, safe="")
    wa = up.quote(title + " " + url)
    links = [
        ("X", "https://twitter.com/intent/tweet?text=%s&url=%s" % (t, u)),
        ("Facebook", "https://www.facebook.com/sharer/sharer.php?u=%s" % u),
        ("WhatsApp", "https://api.whatsapp.com/send?text=%s" % wa),
        ("LinkedIn", "https://www.linkedin.com/sharing/share-offsite/?url=%s" % u),
        ("Telegram", "https://t.me/share/url?url=%s&text=%s" % (u, t)),
        ("Correo", "mailto:?subject=%s&body=%s" % (t, u)),
    ]
    out = ['<section class="share" aria-label="%s">' % esc(heading)]
    out.append('<h2 class="share__title">%s</h2>' % esc(heading))
    out.append('<div class="share__row">')
    for label, href in links:
        out.append(
            '<a class="share__btn" href="%s" target="_blank" rel="noopener">%s</a>'
            % (href, esc(label))
        )
    out.append(
        '<button class="share__btn" type="button" data-copy-link="%s">Copiar enlace</button>'
        % esc(url)
    )
    out.append(
        '<button class="share__btn" type="button" data-native-share data-title="%s" data-url="%s" hidden>Compartir…</button>'
        % (esc(title), esc(url))
    )
    out.append("</div>")
    out.append('<p class="share__status" role="status" aria-live="polite"></p>')
    out.append("</section>")
    return "".join(out)


def nav(root, active, cls="site-nav"):
    items = [
        (root, "Inicio", "inicio"),
        (root + "linguistica/", "Gramática", "gramatica"),
        (root + "diccionario/", "Diccionario", "diccionario"),
        (root + "blog/", "Blog", "blog"),
        (root + "accesibilidad/", "Accesibilidad", "accesibilidad"),
    ]
    out = ['<nav class="%s" aria-label="Navegación principal">' % cls]
    for href, label, key in items:
        if key == active:
            out.append(
                '<a href="%s" class="active" aria-current="page">%s</a>' % (href, label)
            )
        else:
            out.append('<a href="%s">%s</a>' % (href, label))
    out.append("</nav>")
    return "".join(out)


def page(
    title, desc, url, root, active, jsonld, main_html, og_type="website", main_attr=""
):
    rss = BASE + "blog/rss.xml"
    feed = BASE + "blog/feed.json"
    og_img = BASE + "img/og-image.png"
    return """<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%(fulltitle)s</title>
  <meta name="description" content="%(desc)s">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="Asociación LSGE">
  <link rel="canonical" href="%(url)s">
  <link rel="alternate" type="application/rss+xml" title="Blog de la Asociación LSGE" href="%(rss)s">
  <link rel="alternate" type="application/feed+json" title="Blog de la Asociación LSGE (JSON Feed)" href="%(feed)s">
  <meta name="geo.region" content="GQ">
  <meta name="geo.placename" content="Malabo, Bata, Mongomo">
  <meta name="geo.position" content="3.7523;8.7742">
  <meta name="ICBM" content="3.7523, 8.7742">
  <meta property="og:site_name" content="LSGE — Lengua de Signos de Guinea Ecuatorial">
  <meta property="og:title" content="%(title)s">
  <meta property="og:description" content="%(desc)s">
  <meta property="og:type" content="%(ogtype)s">
  <meta property="og:url" content="%(url)s">
  <meta property="og:locale" content="es_ES">
  <meta property="og:image" content="%(ogimg)s">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="%(title)s">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="%(title)s">
  <meta name="twitter:description" content="%(desc)s">
  <meta name="twitter:image" content="%(ogimg)s">
  <script type="application/ld+json">
%(jsonld)s
  </script>
  <link rel="icon" href="%(root)simg/favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="%(root)simg/logo-oficial.png">
  <link rel="apple-touch-icon" href="%(root)simg/logo-oficial.png">
  <meta name="theme-color" content="#0f1e3a">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="%(root)scss/style.css">
  <link rel="stylesheet" href="%(root)scss/subpage.css">
  <link rel="stylesheet" href="%(root)scss/lsge-media.css">
  <link rel="stylesheet" href="%(root)scss/blog.css">
  <link rel="stylesheet" href="%(root)scss/shell.css">
</head>
<body class="subpage" id="app">
  <a href="#main" class="skip-link">Saltar al contenido principal</a>

  %(header)s

  <main id="main"%(mainattr)s>
%(main)s
  </main>

  %(footer)s

  <script src="%(root)sjs/a11y-menu.js"></script>
  <script src="%(root)sjs/share.js"></script>
  <script src="%(root)sjs/lsge-media.js"></script>
  <script src="%(root)sjs/nav-shared.js"></script>
</body>
</html>
""" % {
        "title": esc(title),
        "fulltitle": esc("Blog — Asociación LSGE" if title == "Blog" else title + " | Blog LSGE"),
        "desc": esc(desc),
        "url": esc(url),
        "root": root,
        "rss": esc(rss),
        "feed": esc(feed),
        "ogimg": esc(og_img),
        "ogtype": og_type,
        "jsonld": jsonld,
        "main": main_html,
        "nav": nav(root, active),
        "mainattr": main_attr,
        "header": shell.header(root, active),
        "footer": shell.footer(root),
    }


def build_index(posts):
    items = []
    for p in posts:
        url = BASE + "blog/" + p["slug"] + "/"
        items.append(
            """        <article class="post-card">
          <p class="post-card__meta">%(fecha)s · %(author)s</p>
          <h2 class="post-card__title"><a href="%(url)s">%(title)s</a></h2>
          <p class="post-card__excerpt">%(excerpt)s</p>
          <p class="post-card__tags">%(tags)s</p>
          <a class="post-card__more" href="%(url)s">Leer el artículo →</a>
        </article>"""
            % {
                "fecha": fecha_larga(p["date"]),
                "author": esc(p["author"]),
                "url": url,
                "title": esc(p["title"]),
                "excerpt": esc(p["excerpt"]),
                "tags": tags_html(p["tags"]),
            }
        )

    main = """    <section class="blog-hero">
      <div class="container">
        <p class="blog-hero__tag">Blog</p>
        <h1 class="blog-hero__title">Lengua, comunidad y proyecto</h1>
        <p class="blog-hero__desc">Notas sobre la LSGE, el diccionario, la educación y el trabajo de la Asociación. También puedes seguirlo por RSS o JSON Feed.</p>
        <p class="blog-hero__feeds"><a href="rss.xml">RSS</a> · <a href="feed.json">JSON Feed</a></p>
      </div>
    </section>

    <section class="blog-list-wrap">
      <div class="container">
        <div class="blog-list">
%s
        </div>
      </div>
    </section>""" % "\n".join(items)

    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog de la Asociación LSGE",
            "url": BASE + "blog/",
            "description": "Notas sobre la Lengua de Signos de Guinea Ecuatorial, el diccionario, la educación y el proyecto.",
            "inLanguage": "es",
            "publisher": {
                "@type": "NGO",
                "name": "Asociación LSGE — Lengua de Signos de Guinea Ecuatorial",
                "url": BASE,
                "logo": BASE + "img/logo-oficial.png",
            },
        },
        ensure_ascii=False,
        indent=2,
    )

    return page(
        "Blog",
        "Notas sobre la Lengua de Signos de Guinea Ecuatorial: lingüística, diccionario, educación y comunidad.",
        BASE + "blog/",
        "../",
        "blog",
        jsonld,
        main,
    )


def build_post(p, prev_post, next_post):
    url = BASE + "blog/" + p["slug"] + "/"
    body = p["body"]
    share = share_block(url, p["title"])

    nav_links = []
    if prev_post:
        nav_links.append(
            '<a class="post-nav__link" href="../%s/"><span>← Anterior</span><strong>%s</strong></a>'
            % (prev_post["slug"], esc(prev_post["title"]))
        )
    if next_post:
        nav_links.append(
            '<a class="post-nav__link post-nav__link--next" href="../%s/"><span>Siguiente →</span><strong>%s</strong></a>'
            % (next_post["slug"], esc(next_post["title"]))
        )

    main = """    <article class="post">
      <div class="container">
        <nav class="breadcrumb" aria-label="Ruta de navegación" style="margin:24px auto 0;max-width:760px"><a href="../">Blog</a> &rsaquo; %(title)s</nav>

        <header class="post__header">
          <p class="post__meta">%(fecha)s · %(author)s</p>
          <h1 class="post__title">%(title)s</h1>
          <p class="post__tags">%(tags)s</p>
          %(share_top)s
        </header>

        <div class="post__body">
%(body)s
        </div>

        %(share_bottom)s

        <nav class="post-nav" aria-label="Más artículos">
          %(nav_links)s
          <a class="post-nav__link" href="../"><span>Blog</span><strong>Todos los artículos</strong></a>
        </nav>
      </div>
    </article>""" % {
        "title": esc(p["title"]),
        "fecha": fecha_larga(p["date"]),
        "author": esc(p["author"]),
        "tags": tags_html(p["tags"]),
        "body": body,
        "share_top": share,
        "share_bottom": share_block(url, p["title"], "Compartir"),
        "nav_links": "".join(nav_links),
    }

    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": p["title"],
            "description": p["excerpt"],
            "url": url,
            "mainEntityOfPage": {"@type": "WebPage", "@id": url},
            "datePublished": fecha_iso(p["date"]),
            "dateModified": fecha_iso(p["date"]),
            "inLanguage": "es",
            "author": {"@type": "Organization", "name": p["author"], "url": BASE},
            "publisher": {
                "@type": "NGO",
                "name": "Asociación LSGE — Lengua de Signos de Guinea Ecuatorial",
                "url": BASE,
                "logo": {"@type": "ImageObject", "url": BASE + "img/logo-oficial.png"},
            },
            "image": BASE + "img/og-image.png",
            "keywords": ", ".join(p["tags"]),
            "isPartOf": {
                "@type": "Blog",
                "name": "Blog de la Asociación LSGE",
                "url": BASE + "blog/",
            },
        },
        ensure_ascii=False,
        indent=2,
    )

    return page(
        p["title"],
        p["excerpt"],
        url,
        "../../",
        "blog",
        jsonld,
        main,
        og_type="article",
        main_attr=" data-lsge-media",
    )


def build_feed(posts, rss=True):
    if rss:
        items = []
        for p in posts:
            url = BASE + "blog/" + p["slug"] + "/"
            body = p["body"].replace("]]>", "]]&gt;")
            cats = "".join("<category>%s</category>" % esc(t) for t in p["tags"])
            items.append(
                """    <item>
      <title>%s</title>
      <link>%s</link>
      <guid isPermaLink="true">%s</guid>
      <pubDate>%s</pubDate>
      <description>%s</description>
      <content:encoded><![CDATA[%s]]></content:encoded>
      %s
    </item>"""
                % (
                    esc(p["title"]),
                    esc(url),
                    esc(url),
                    fecha_rss(p["date"]),
                    esc(p["excerpt"]),
                    body,
                    cats,
                )
            )
        return """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Blog — Asociación LSGE</title>
    <link>%sblog/</link>
    <description>Notas sobre la Lengua de Signos de Guinea Ecuatorial, el diccionario, la educación y la comunidad sorda.</description>
    <language>es</language>
    <lastBuildDate>%s</lastBuildDate>
    <atom:link href="%sblog/rss.xml" rel="self" type="application/rss+xml"/>
%s
  </channel>
</rss>
""" % (BASE, fecha_rss(posts[0]["date"]), BASE, "\n".join(items))

    data = {
        "version": "https://jsonfeed.org/version/1.1",
        "title": "Blog — Asociación LSGE",
        "home_page_url": BASE + "blog/",
        "feed_url": BASE + "blog/feed.json",
        "description": "Notas sobre la Lengua de Signos de Guinea Ecuatorial, el diccionario, la educación y la comunidad sorda.",
        "language": "es",
        "items": [
            {
                "id": BASE + "blog/" + p["slug"] + "/",
                "url": BASE + "blog/" + p["slug"] + "/",
                "title": p["title"],
                "summary": p["excerpt"],
                "content_html": p["body"],
                "date_published": fecha_iso(p["date"]),
                "date_modified": fecha_iso(p["date"]),
                "tags": p["tags"],
                "authors": [{"name": p["author"]}],
            }
            for p in posts
        ],
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


def build_sitemap(posts):
    urls = [
        (BASE, "2026-11-11", "1.0"),
        (BASE + "diccionario/", "2026-11-11", "0.9"),
        (BASE + "linguistica/", "2026-11-11", "0.8"),
        (BASE + "accesibilidad/", "2026-11-11", "0.7"),
        (BASE + "blog/", "2026-11-11", "0.9"),
    ]
    for p in posts:
        urls.append((BASE + "blog/" + p["slug"] + "/", p["date"], "0.8"))
    body = "\n".join(
        """  <url>
    <loc>%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>monthly</changefreq>
    <priority>%s</priority>
  </url>"""
        % u
        for u in urls
    )
    return (
        """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
%s
</urlset>
"""
        % body
    )


def main():
    with open(os.path.join(BLOG, "posts.json"), encoding="utf-8") as f:
        posts = json.load(f)

    posts.sort(key=lambda p: p["date"], reverse=True)

    with open(os.path.join(BLOG, "index.html"), "w", encoding="utf-8") as f:
        f.write(build_index(posts))

    for i, p in enumerate(posts):
        out_dir = os.path.join(BLOG, p["slug"])
        os.makedirs(out_dir, exist_ok=True)
        prev_post = posts[i + 1] if i + 1 < len(posts) else None
        next_post = posts[i - 1] if i > 0 else None
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(build_post(p, prev_post, next_post))

    with open(os.path.join(BLOG, "rss.xml"), "w", encoding="utf-8") as f:
        f.write(build_feed(posts, rss=True))

    with open(os.path.join(BLOG, "feed.json"), "w", encoding="utf-8") as f:
        f.write(build_feed(posts, rss=False))

    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(build_sitemap(posts))

    print("Blog generado: %d artículos" % len(posts))
    for p in posts:
        print("  - blog/%s/" % p["slug"])


if __name__ == "__main__":
    main()

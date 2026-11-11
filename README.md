# LSGE — Lengua de Signos de Guinea Ecuatorial

Sitio web de la Asociación LSGE: HTML/CSS/JS estático, sin build ni dependencias de servidor.

## Estructura

```
index.html              Portada (misión, la lengua, comunidad, servicios, impacto, contacto)
linguistica/index.html  Portal de lingüística: gramática de referencia en 7 áreas
diccionario/index.html  Diccionario visual: buscador de signos con tooltips en vídeo
css/style.css           Estilos base, temas de color, tipografía, layout de la portada
css/subpage.css         Layout compartido de linguistica/ y diccionario/ (topbar, sidebar, footer)
css/tooltips.css        Buscador, tarjetas de signo, tooltips y modales de vídeo
js/main.js              Portada: idioma, menú móvil, tabs, animaciones al hacer scroll, formulario
js/i18n.js              Textos en español, francés, fang y bubi (atributos data-i18n*)
js/tooltips.js          Lógica del diccionario (LsgeDict): búsqueda, filtros, tooltip y ficha modal
js/a11y-menu.js         Widget de accesibilidad: tamaño de texto y color de fondo/texto personalizados
diccionario/diccionario_data.js  Los 560 signos (glosa, categoría, parámetros fonológicos, vídeo)
img/                    Logotipos y favicon.svg
videos/                 Vídeos de cada signo (vacío por ahora, ver "Vídeos" abajo)
robots.txt, sitemap.xml SEO
```

No hay paso de compilación: cada página es HTML plano que enlaza sus propios `<script>`/`<link>`.

## Cómo previsualizar en local

Las páginas usan rutas relativas y `<script src>` normales, así que basta un servidor estático (abrir el `index.html` con doble clic también funciona, salvo el buscador de fetch si lo hubiera):

```bash
cd web
python -m http.server 8080
# abrir http://localhost:8080/
```

## Idiomas

La portada (`index.html`) cambia de idioma con los botones ES/FR/FA/BU del toolbar, vía `js/i18n.js` + `data-i18n` / `data-i18n-placeholder` / `data-i18n-tooltip` en el HTML. Las subpáginas (`linguistica/`, `diccionario/`) están solo en español.

## Widget de accesibilidad

Icono ♿ en el toolbar/topbar de las tres páginas (`js/a11y-menu.js`), con panel emergente:
- Slider de tamaño de texto (escala el `font-size` raíz, todo el sitio usa `rem`).
- Color picker de fondo y de texto → aplica un tema `data-theme="custom"` (definido en `css/style.css` con `color-mix()`).
- Botón "Restablecer" vuelve al tema claro por defecto.

Las preferencias se guardan en `localStorage` y se restauran en cualquier página del sitio.

## Vídeos

`diccionario/diccionario_data.js` y el botón "Ver vídeo LSGE" de la portada referencian archivos `.mp4` que **todavía no existen** en `videos/`. Mientras no estén, la interfaz cae automáticamente a un estado vacío (icono/placeholder) en vez de romperse:
- Tooltip y ficha del diccionario → icono del signo.
- Modal de vídeo institucional (portada) → "Vídeo institucional próximamente".

Para activar un vídeo real, basta con colocar el archivo en la ruta que ya espera el código (p. ej. `videos/saludos/hola.mp4` o `videos/lsge-presentacion.mp4`); no hace falta tocar JS ni HTML.

## Convenciones de código

- Sin build: JS plano (ES5, sin módulos) para máxima compatibilidad.
- Iconografía: [Material Symbols](https://fonts.google.com/icons) de Google en toda la interfaz (`<span class="material-symbols-outlined">`), salvo los 560 emoji de los signos del diccionario, que son el pictograma del propio signo y no un icono de interfaz.
- Tipografía: Inter (Google Fonts).
- Accesibilidad: enlace "saltar al contenido", landmarks `<main>`, `aria-label`/`aria-pressed` en botones de solo icono, `<label>` reales en formularios, foco gestionado en modales, `prefers-reduced-motion` respetado.

## Pendiente / próximos pasos sugeridos

- Subir los vídeos reales a `videos/` (por signo y el institucional de portada).
- Traducir `linguistica/` y `diccionario/` si se quiere paridad de idiomas con la portada.
- Revisar `sitemap.xml`/`robots.txt` si el dominio final no es `lsge.org`.

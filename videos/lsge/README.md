# Vídeos de la LSGE

Dos carpetas, dos usos:

## `videos/lsge/` — un vídeo por párrafo

Los paneles «Ver este párrafo en LSGE» buscan el archivo con este patrón:

```
videos/lsge/<pagina>-<seccion>-<numero>.mp4
```

Ejemplos:

```
videos/lsge/index-lsge-1.mp4        ← primer párrafo de #lsge en la portada
videos/lsge/index-mision-1.mp4      ← descripción de #mision
videos/lsge/linguistica-historia-1.mp4
videos/lsge/accesibilidad-general-1.mp4
```

`<pagina>`: `index`, `linguistica` o `accesibilidad`.
`<seccion>`: el `id` de la sección (`lsge`, `mision`, `servicios`…).
`<numero>`: orden del párrafo dentro de esa sección, empezando en 1.

Si el archivo no existe, el panel muestra el marcador con la mano y la ruta exacta
donde debe colocarse.

## `videos/signos/` — el signo de cada elemento del menú

```
videos/signos/menu-mision.mp4
videos/signos/menu-lengua.mp4
videos/signos/menu-comunidad.mp4
videos/signos/menu-servicios.mp4
videos/signos/menu-impacto.mp4
videos/signos/menu-contacto.mp4
videos/signos/menu-inicio.mp4
videos/signos/menu-gramatica.mp4
videos/signos/menu-diccionario.mp4
videos/signos/menu-accesibilidad.mp4
videos/signos/menu-video.mp4
```

El tooltip del menú los reproduce en silencio y en bucle al pasar el ratón o al
enfocar con el teclado.

Mientras un signo concreto no exista, el tooltip reproduce `videos/lsge/demo-bien.mp4`
como **muestra** y lo indica: «Muestra del diccionario · signo de "X" pendiente».
Al colocar el archivo `menu-<signo>.mp4`, sustituye a la muestra automáticamente.

## Muestra publicada

`videos/lsge/demo-bien.mp4` — signo **BIEN**, extraído del diccionario
(`Diccionario LSGE/BIEN.mp4`) y convertido a web: 1280×720, H.264, sin audio,
`+faststart`, 144 KB.

## Cómo preparar un vídeo

```bash
ffmpeg -i original.mp4 \
  -vf "scale=-2:720" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -movflags +faststart -an \
  videos/lsge/index-lsge-1.mp4
```

- 720p es suficiente: son planos de una persona firmando.
- Sin audio: la información es visual y el archivo pesa mucho menos.
- `+faststart` permite empezar a reproducir antes de descargarlo entero.
- Objetivo: menos de 1 MB por clip.

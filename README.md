# web — Sitio público de la Asociación LSGE

Único repositorio **público** de la organización. Todo lo demás (datos, motor,
aplicaciones, documentación técnica) es privado.

Aquí vive únicamente la **página pública** que se sirve con GitHub Pages.

## Cómo funciona

- **Estático puro:** un solo `index.html` con CSS incrustado, sin JavaScript,
  sin dependencias, sin build.
- **Accesible:** HTML semántico, contraste alto, foco visible, enlace de salto,
  texto escalable y respeto a `prefers-reduced-motion`.
- **Ligero y offline-friendly:** se puede guardar y abrir sin conexión.

## Publicación

GitHub Pages sirve la rama `main`, carpeta raíz:

```
https://info-lsge.github.io/web/
```

### Dominio propio (pendiente)

Para publicar en `https://lsge.org`:

1. En el DNS del dominio, crear los registros que indica GitHub para
   `info-lsge.github.io`.
2. Añadir un archivo `CNAME` con el contenido `lsge.org`.
3. Activar *Enforce HTTPS* en los ajustes de Pages.

No se ha añadido el `CNAME` todavía: si se añade sin el DNS configurado, el
sitio deja de responder.

## Editar

Todo el contenido está en `index.html`. Al hacer *push* a `main`, GitHub Pages
republica automáticamente en menos de un minuto.

## Gobernanza

La LSGE pertenece a la comunidad sorda de Guinea Ecuatorial; la Asociación LSGE
la custodia. **Toda consulta o sugerencia debe dirigirse al líder del proyecto**,
que la estudiará y dará una respuesta razonada y definitiva.

## Licencia

Contenidos: **CC BY 4.0** — ver [`LICENSE`](LICENSE).

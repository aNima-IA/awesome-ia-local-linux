# Web — Awesome IA Local en Linux (catálogo retro-90s)

> **Parte del repositorio [awesome-ia-local-linux](../README.md)**: la web se genera siempre desde el README del listado — la única fuente de verdad — y no se edita su contenido a mano. Su licencia es la misma CC0-1.0 del repositorio.

Catálogo web con estética retro años-90 (ventana clásica de navegador, banner, box art de cada recurso) que **lee los datos directamente del repositorio**: el README es la única fuente de verdad y la web se regenera desde él en cada build.

```
website/
├── index.html              # plantilla Vite (chrome de la ventana)
├── vite.config.js          # base relativa (Pages/subcarpetas/file://)
├── package.json
├── package-lock.json       # lockfile npm (estándar del proyecto)
├── scripts/
│   └── build-data.mjs      # README → datos (snapshots, meta, stats GitHub, mapa de imágenes)
├── src/
│   ├── core.js             # parser Markdown + helpers (sin DOM, testeable)
│   ├── main.js             # app: carga GitHub→snapshot, router, render
│   ├── images.js           # AUTO-GENERADO: mapa recurso → box art (alias ES/EN)
│   ├── github-data.js      # AUTO-GENERADO: mapa repo GitHub → stats
│   ├── styles.css          # el look 90s completo
│   ├── assets/
│   │   └── banner.jpg      # banner de la cabecera
│   └── data/               # AUTO-GENERADO: readme-es.md, readme-en.md, meta.json, github.json
├── public/
│   └── images/             # AUTO-GENERADO en build: copia de las box arts (excluido del repo)
├── tests/
│   └── core.test.mjs       # tests Node (node --test)
└── imgs-categorias-todas/  # FUENTE de las imágenes (una carpeta por categoría)
```

## Comandos

```bash
cd website
npm install          # dependencias (vite)
npm run data         # regenera snapshots, stats e imágenes (necesario en un clone fresco)
npm run dev          # servidor de desarrollo con recarga (ya incluye npm run data)
npm run build        # datos + build de producción → dist/
npm run preview      # sirve dist/ para comprobar
npm test             # tests del parser y del mapeo (requieren npm run data previo)
```

## Cómo se conecta con el repositorio

1. **En build (CI)**: `npm run data` lee el `README.md` / `README.en.md` **de este mismo repositorio** (o los descarga de `main` con `npm run data -- --fetch`), valida la sincronización ES/EN y genera los snapshots + el mapa de imágenes. Editar el README y pushear regenera la web automáticamente (workflow `deploy-web.yml`).
2. **En runtime**: la web intenta cargar el README **en vivo** desde `raw.githubusercontent.com` (con respaldo jsDelivr y, si no hay red, el snapshot del build). La barra de estado muestra `DATA: GITHUB LIVE` o `DATA: SNAPSHOT LOCAL`.

Así la web refleja cambios del repo dos veces: al reconstruir en CI y, en caliente, al abrirse con conexión.

Además del texto del README, el build incorpora **estadísticas de GitHub** (estrellas, forks, actividad, archivado) por recurso: parte de la caché `src/data/github.json` (confirmada en el repo como respaldo) y la refresca contra la API de GitHub cuando tiene más de 12 h; la semilla inicial procede de la verificación del repositorio (fichero local opcional, no publicado).

## Categorías → carpetas de imágenes

| Sección | Carpeta en `imgs-categorias-todas/` |
|---|---|
| A. Runtimes | `imgs-runtimes` |
| B. Servidores/APIs | `imgs-servers-ref` |
| C. Modelos abiertos | `imgs-modelos-open` |
| D. GPU/aceleración | `imgs-gpu-accel` |
| E. Escritorio | `imgs-ias-desktop` |
| F. Agentes/MCP | `imgs-automatiz` |
| G. RAG | `imgs-rags` |
| H. Voz | `imgs-voz` |
| I. Imagen/vídeo | `imgs-video-imagenes-creat` |
| J. Monitorización | `imgs-monitoring` |
| K. Seguridad | `imgs-seguridad` |
| L. Ecosistema dev | `imgs-ecosistemas` |
| M. Docs/tutoriales | `imgs-docs` |

## Añadir una imagen nueva para un recurso

1. Guarda el JPG en la carpeta de su categoría (nombre descriptivo).
2. Si su nombre no se reconoce solo, añade un *hint* en `HINTS` (`scripts/build-data.mjs`): `['Nombre del recurso', ['substring-del-fichero']]`.
3. `npm run data` re-mapea; `npm test` verifica cobertura ≥95 % y rutas existentes.

Recursos sin imagen usan una caja genérica SVG; las imágenes sobrantes se reportan en el output de `npm run data`.

## Flujo de trabajo recomendado

1. Cambia el **README del repositorio** (siempre, incluso para cambios de contenido de la web).
2. En `website/`: `npm run data` regenera snapshots y stats; `npm test` valida parser, mapeo y cobertura.
3. `npm run build` produce `dist/`; el workflow `deploy-web.yml` hace lo mismo en CI y publica en GitHub Pages en cada push a `main`.

## Publicación

La web se despliega en **GitHub Pages** (`https://marrionesa.github.io/awesome-ia-local-linux/`) desde el workflow `.github/workflows/deploy-web.yml`. Requisitos la primera vez: activar Pages en Settings → Pages con fuente «GitHub Actions».

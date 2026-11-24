# Contribuciones

En primer lugar, gracias por considerar contribuir a **Awesome IA Local en Linux**. Este listado vive de la calidad de sus aportaciones, no de su tamaño.

El idioma de trabajo del repositorio es el **español**, pero se aceptan contribuciones en inglés. Si añades o modificas un recurso, recuerda actualizar **ambos** README (`README.md` y `README.en.md`).

## Cómo proponer un nuevo recurso

1. Abre un issue con la plantilla **«Añadir recurso»** (`.github/ISSUE_TEMPLATE/add-resource.yml`) o envía un PR directo si dominas el formato.
2. Rellena al menos: nombre, URL oficial, categoría propuesta y una descripción breve escrita por ti.
3. Un maintainer verificará el recurso antes de fusionar. La verificación incluye: que la URL corresponde al proyecto descrito, que el proyecto está activo o en mantenimiento razonable, y que su documentación oficial existe.

### Requisitos mínimos de inclusión

- **Funciona en Linux** de forma nativa o con soporte documentado (no basta con «probablemente funcione»).
- **Licencia identificable**: open source con licencia reconocida, o software propietario gratuito/freemium claramente señalado como tal.
- **Documentación oficial** disponible (README del repositorio, web del proyecto o docs).
- **Actividad o mantenimiento razonable**: proyecto archivado o abandonado solo se admite si sigue siendo la referencia de su nicho y se marca como tal.
- **Aporta valor diferenciado**: no se añade un proyecto solo por popularidad ni para engordar cifras.

### Criterios de exclusión

- Proyectos sin actividad durante periodos prolongados sin estatus de referencia.
- Duplicados funcionales de recursos ya listados (salvo ventajas documentadas claras).
- Páginas personales, listas de enlaces sin mantenimiento o agregadores sin criterio.
- Herramientas cuya naturaleza no se puede verificar desde fuentes oficiales.

## Cómo verificar enlaces

Antes de proponer, comprueba que el enlace abre el proyecto correcto:

```bash
# Comprobación puntual
curl -sSIL <url> | grep -E '^HTTP'

# Comprobación completa del repositorio (necesita Node.js; sin dependencias externas)
node scripts/validate.js

# Comprobación de enlaces con lychee, si lo tienes instalado
lychee README.md README.en.md docs --max-retries 2
```

Los enlaces deben apuntar siempre a la **fuente oficial**: repositorio canónico del proyecto, web oficial o documentación oficial. Evita enlaces a mirrors, forks o publicaciones de terceros.

## Cómo clasificar recursos

- Usa la categoría existente más precisa; si ninguna encaja, propón una nueva en un issue justificándolo (las categorías nuevas deben cubrir un nicho real, no un caso aislado).
- Las directrices de cada categoría están en [`docs/categories/CATEGORY-GUIDELINES.md`](docs/categories/CATEGORY-GUIDELINES.md).
- Un recurso puede aparecer en una sola categoría principal salvo caso muy justificado; evita inflar secciones cruzadas.

## Cómo redactar descripciones

- Escribe la descripción **tú mismo**, en una o dos frases, sin copiar del README del proyecto.
- Di qué hace la herramienta y para quién es relevante; no repitas el nombre del proyecto en la descripción.
- Añade anotaciones de compatibilidad cuando estén documentadas por el proyecto: `[AMD ROCm]`, `[NVIDIA CUDA]`, `[Vulkan]`, `[CPU]`, `[Cliente]`, `[Propietario]`, etc. Las anotaciones admitidas están definidas en las directrices de categoría.
- Español neutro, terminología técnica natural. En inglés, traducción propia (no automática literal).

## Mantener el README bilingüe

`README.md` (español) y `README.en.md` (inglés) deben contener **exactamente la misma selección de recursos, categorías y criterios**. Las reglas:

1. Todo cambio de contenido se aplica a los dos ficheros en el mismo PR.
2. Las secciones se mantienen en el mismo orden y con los mismos identificadores.
3. Las anotaciones técnicas (`[NVIDIA CUDA]`, `[Propietario]`, …) no se traducen.
4. El script `node scripts/validate.js` comprueba la sincronización y debe pasar antes de fusionar.
5. Si una discrepancia es intencionada (por ejemplo, una nota dirigida a lectores hispanohablantes), documéntala en el PR.

## Mantener la web del catálogo

La web (`website/`) se genera **desde este README**: no se edita su contenido a mano.

- Si cambias el listado (ambos README), la web lo reflejará sola en el siguiente build; no hay nada más que actualizar.
- Si cambias categorías, revisa el mapa «Categorías → carpetas de imágenes» de [`website/README.md`](website/README.md) y, si hace falta, las carpetas de `imgs-categorias-todas/`.
- Para tocar presentación o motor (plantillas, CSS, parser), lee primero [`website/README.md`](website/README.md) y ejecuta su cadena de verificación:

```bash
cd website
npm run data && npm test && npm run build
```

Un PR que cambie el README debe pasar también estos comandos si toca algo que la web consume (secciones, formato de entrada, anclas).

## Enviar el cambio

- Un PR = un cambio lógico (un recurso, una categoría, una corrección de enlaces).
- Describe qué verificaste y cómo (comandos ejecutados, resultados).
- Asegúrate de que `node scripts/validate.js` pasa sin errores.
- Si el cambio afecta a lo que muestra la web (recursos, categorías, formato de entradas), ejecuta también `cd website && npm run data && npm test`.
- Firma tus commits si es posible; los PR se revisan con prioridad por maintainer y contribuciones recurrentes pueden recibir permisos de triage.

## Reconocimiento

Todas las aportaciones se reconocen en el CHANGELOG de cada versión. Gracias por ayudar a mantener un listado riguroso, bilingüe y útil.

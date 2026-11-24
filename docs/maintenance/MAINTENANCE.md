# Mantenimiento

Rutinas de mantenimiento del listado. El principio rector: **la verificación es un proceso continuo, no un evento único**.

## Cadencia

| Tarea | Cadencia | Herramienta | Umbral de actuación |
|---|---|---|---|
| Link check automático | Semanal (lunes 04:00 UTC) | Workflow `link-check.yml` (lychee) | Cualquier 404 nuevo → issue automático o manual |
| Revisión de archivados y actividad | Trimestral | `scripts/verify-github.sh` | Proyecto archivado → anotar en README + SOURCES; decidir si se mantiene como referencia |
| Revisión de licencias de entradas sensibles | Trimestral | Revisión manual de los casos NOASSERTION/anotados | Cambio de licencia → actualizar entrada y SOURCES |
| Revisión de competidores | Trimestral | `COMPETITOR-ANALYSIS.md` | Reescribir conclusiones si cambia el panorama |
| Versión menor (nuevos recursos) | Mensual o por volumen | Flujo de contribución | Acumular y publicar en CHANGELOG |
| Web del catálogo | En cada push a `main` (automático) | Workflow `deploy-web.yml` | Fallo del build o datos desincronizados → revisar parser/mapa de imágenes |
| Versión mayor (cambios de criterios/categorías) | Anual o por necesidad | Discusión en issues | Documentar en RESEARCH + CHANGELOG |

## Procedimiento trimestral paso a paso

1. **Refrescar los datos**: `bash scripts/verify-github.sh docs/research/raw/github-verify.jsonl` (usa `gh` autenticado si está disponible; respeta el rate limit). La salida es un fichero **local de trabajo** (excluido del repo vía `.gitignore`); lo que se publica de cada revisión es la actualización de `SOURCES.md` y del README.
2. **Revisar archivados nuevos**: en la salida, la lista ARCHIVADOS. Para cada uno: ¿es la referencia de su nicho? Si sí → anotar en README (ambos idiomas) y actualizar fila en SOURCES. Si no → mover a descartados con motivo y fecha.
3. **Revisar actividad**: proyectos sin push >12–18 meses sin condición de referencia → descartar.
4. **Revisar los ⚪ (verificados-reserva)** de `SOURCES.md`: ¿ya maduraron o el solapamiento se resolvió? Promover a ✅ si aportan valor diferenciado; documentar la decisión.
5. **Revisar las notas de sección** (TGI, IPEX-LLM, LLM Guard…) para ver si los sucesores anunciados ya son verificables; incorporar si lo son.
6. **Ejecutar validaciones locales** (`scripts/validate.js`, `scripts/check-links.sh`) y actualizar la fecha de verificación en ambos README.
7. **Actualizar CHANGELOG** con lo añadido, cambiado y eliminado.

## Gestión de sucesiones (proyectos archivados)

Patrón observado en la investigación de 2026-11 (TGI→runtimes activos, Piper→piper1-gpl, Coqui→fork Idiap, ROCm→TheRock, AutoGPTQ→GPTQModel, IPEX-LLM→OpenVINO, OWASP→GenAI-Security-Project):

1. Comprobar si el proyecto declaró un sucesor oficial (README, anuncio).
2. Verificar el sucesor con los criterios estándar antes de enlazarlo.
3. Sustituir la entrada **o** conservar el archivado con anotación de sucesor, según su valor de referencia.
4. Registrar la sucesión en SOURCES (fila del archivado + fila del sucesor).

## Gestión de incidencias de seguridad

Los reportes vía Security Advisory (ver `SECURITY.md`) sobre enlaces maliciosos o proyectos comprometidos se atienden con prioridad: retirada temporal de la entrada, verificación del proyecto en su fuente oficial, y restauración o descarte documentado en el CHANGELOG.

## Pull requests de contribución

1. Verificar que el PR cumple la plantilla y los criterios del README.
2. Ejecutar `node scripts/validate.js` en local; la sincronización ES/EN debe pasar.
3. Para recursos nuevos, repetir la verificación del recurso (URL → proyecto, licencia, actividad) antes de aprobar.
4. Fusionar solo con ambos README actualizados y CHANGELOG actualizado para cambios notables.
5. Si el PR toca el listado, la web se regenera sola en CI (`deploy-web.yml`); en local, `cd website && npm run data && npm test` para comprobar que el parser y el mapeo siguen cuadrando.

## Congelación pre-publicación

Antes de la primera publicación:

1. Ejecutar el ciclo completo de validación local (los scripts documentan su uso en su cabecera).
2. Revisar manualmente las ~30 URLs que no pasan por curl normal (LinkedIn no aplica aquí; en este listado: Reddit y blogs con anti-bot) decidiendo si se mantienen con exclusión en el workflow.
3. Comprobar que la trazabilidad local (`data/candidates.txt`, `docs/research/raw/`) sigue excluida del repo por `.gitignore`; el registro auditable publicado es `docs/research/SOURCES.md` (decisión pre-publicación 2026-11).
4. Activar los workflows al publicar el repositorio. Se activan dos: `link-check.yml` (chequeo semanal de enlaces) y `deploy-web.yml` (build y publicación de la web en GitHub Pages; necesita activar Pages en la settings del repo con fuente «GitHub Actions»).

# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Este proyecto usa [Semantic Versioning](https://semver.org/lang/es/) a partir de su primera publicación.

## [Unreleased]

### Añadido (preparación de la versión 1.0)

- Investigación y verificación inicial del ecosistema de IA local en Linux: runtimes, serving, modelos, hardware, escritorio, agentes, RAG, voz, imagen/vídeo, monitorización, seguridad, ecosistema de desarrollo y documentación.
- README principal en español y `README.en.md` en inglés, con la misma selección editorial.
- Sistema de contribución: `CONTRIBUTING.md`, plantillas de issues (`add-resource`, `report-broken-link`) y plantilla de PR.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 3.0, traducción oficial al español).
- `SECURITY.md`, `SUPPORT.md`, licencia CC0-1.0, `FUNDING.yml`.
- Workflow de CI `link-check.yml` (chequeo semanal de enlaces con lychee; se activa al publicar el repositorio).
- Scripts locales de validación: enlaces Markdown, duplicados, formato básico y sincronización ES/EN (`scripts/validate.js`, `scripts/check-links.sh`), y verificación de candidatos vía API de GitHub (`scripts/verify-github.sh`).
- Web catálogo retro-90s (`website/`): genera sus datos siempre desde el README del repositorio (carga en vivo desde GitHub con respaldo jsDelivr y snapshot del build), con stats de repos vía API de GitHub, box art por recurso y despliegue en GitHub Pages.
- Workflow de CI `deploy-web.yml` (build y publicación de la web en GitHub Pages; se activa al publicar el repositorio).
- Documentación de investigación: `docs/research/RESEARCH.md`, `docs/research/SOURCES.md`, `docs/research/COMPETITOR-ANALYSIS.md`, `docs/categories/CATEGORY-GUIDELINES.md`, `docs/maintenance/MAINTENANCE.md`.

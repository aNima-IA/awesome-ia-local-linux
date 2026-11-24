# Directrices de categorías

Este documento define qué pertenece a cada categoría del listado, qué anotaciones admite y cómo se escribe cada entrada. Sirve a contributores y maintainer para mantener la consistencia editorial a medida que el listado crece.

## Convenciones de entrada

Formato estándar de una entrada:

```markdown
- [Nombre](URL oficial) - Descripción de una o dos frases, redactada por la persona contribuidora. (Licencia) `[Etiqueta] [Etiqueta]`
```

Reglas:

1. **Una entrada, una URL oficial**: repositorio canónico, web oficial o documentación oficial. Nunca mirrors ni forks salvo que el fork sea el hogar vivo del proyecto (y se anote).
2. **Descripción propia**: 1–2 frases que digan qué hace y para quién es. No copiar la descripción del proyecto; no empezar por el nombre del proyecto (ya está en el enlace).
3. **Licencia entre paréntesis al final** (SPDX cuando es estándar: MIT, Apache-2.0, GPL-3.0…). Para propietario: `(Propietario gratuito)` / `(Propietario)`. Para casos especiales: texto breve entre paréntesis, y su detalle en `docs/research/SOURCES.md`.
4. **Anotaciones de compatibilidad** al final, entre corchetes:
   - `[CUDA]` — aceleración NVIDIA vía CUDA.
   - `[ROCm]` — aceleración AMD vía ROCm.
   - [Vulkan] — aceleración GPU multi-fabricante vía Vulkan.
   - `[CPU]` — funciona sin GPU dedicada.
   - `[Kubernetes]` — despliegue k8s.
   - `[Propietario]` — software no libre (junto a la licencia entre paréntesis).
   - Las etiquetas proceden siempre de la documentación oficial del proyecto; si el proyecto no las documenta, no se inventan.
5. **Un recurso, una categoría principal** (la más precisa). Las referencias cruzadas se resuelven en el texto, no duplicando entradas.
6. **Archivados y ralentizados** se mantienen solo si siguen siendo la referencia de su nicho, con la anotación correspondiente en la entrada (o como nota de sección) y la fila completa en `docs/research/SOURCES.md`.

## A. Runtimes de LLM locales

**Qué es:** motores que ejecutan modelos de lenguaje en tu hardware, de la CLI a la plataforma multi-modelo.
**Entra:** motores de inferencia con ejecución local directa (llama.cpp, vLLM, SGLang…), empaquetadores de runtime+modelo.
**No entra:** interfaces gráficas o web (§E), pasarelas/gateways (§B), bibliotecas para programar tu propio motor (§L).

## B. Servidores y APIs de inferencia

**Qué es:** la capa de servicio: servidores dedicados, gateways, y bindings que exponen modelos vía HTTP.
**Entra:** serving en producción, API compatibles OpenAI, gateways multi-proveedor, apps con servidor integrado cuando el valor es el servidor.
**No entra:** runtimes puros (§A); frameworks para *escribir* servidores (§L).

## C. Modelos abiertos

**Qué es:** familias de modelos con pesos públicos; la entrada enlaza al repositorio canónico de la familia y, si aplica, a la organización de descarga en Hugging Face.
**Entra:** familias relevantes para ejecución local (tamaño, licencia o nicho justificado).
**No entra:** cada variante/finetune individual; repos de demos; familias sin pesos públicos verificables.

## D. GPU, hardware y aceleración

**Qué es:** lo que decide si un modelo cabe y va rápido: docs de fabricante, especificaciones de formato, bibliotecas de tensores y cuantización.
**Entra:** docs CUDA/ROCm/Vulkan, formatos (GGUF, safetensors), herramientas de cuantización mantenidas.
**No entra:** monitores de hardware (§J); utilidades generales de drivers.

## E. IA de escritorio en Linux

**Qué es:** interfaz gráfica o web autohospedada para conversar y gestionar modelos. Entra lo nativo Linux o con empaquetado documentado (AppImage, deb, Flatpak, Docker desktop-style); no entran CLI puros (§A) ni extensiones de IDE (§F). Las apps multiplataforma Electron/QT entran si la experiencia Linux está cuidada y documentada.

## F. Agentes de IA y automatización

**Agentes (de código o de propósito general), protocolos de herramientas y frameworks de orquestación** que funcionan con modelos locales. Entra: coding agents, MCP, frameworks con soporte local documentado. No entra: automatización general sin componente de IA local (por ejemplo n8n, excluido por licencia y foco).

## G. RAG y sistemas de conocimiento

**Bases vectoriales, frameworks de indexación/recuperación y procesado de documentos** para conocimiento local. Entra: vector DBs, frameworks RAG, parsing local de documentos. No entra: semantic search general sin componente LLM/documentos.

## H. Voz

**STT, TTS, VAD, diarización, wake word y asistentes completos** ejecutables localmente. Entra: modelos/herramientas con ejecución offline documentada. No entra: APIs de voz cloud.

## I. Imagen, vídeo e IA creativa

**Generación/edición local de imagen y vídeo**: interfaces (ComfyUI, A1111), bibliotecas (diffusers), modelos (FLUX.1, Wan 2.2) y utilidades (Upscayl). No entra: herramientas de edición clásica sin difusión.

## J. Monitorización y rendimiento

**Observabilidad del hardware y de la inferencia**: GPU/VRAM, sistema, benchmarks de LLM. Entra: monitores multi-vendor, evaluación de modelos. No entra: profiling genérico sin relación con IA local.

## K. Security, Privacy & Hardening

**Evaluar, aislar y proteger la ejecución local**: red teaming de modelos, filtrado, sandboxing, procedencia de modelos. Entra: herramientas de evaluación, aislamiento aplicables a workloads de IA local, firma de modelos. No entra: genéricos de seguridad sin aplicación directa (por ejemplo scanners web).

## L. Ecosistema de desarrollo

**Bibliotecas/SDK para construir tu propia capa local**: Python, Rust, TypeScript, fine-tuning. Entra: frameworks de ML/DL, clientes oficiales de runtimes listados, fine-tuning en GPU única. No entra: cada cliente no oficial de Ollama (hay decenas); se prioriza cliente oficial + opciones destacadas por lenguaje.

## M. Tutoriales y documentación

**Fuentes primarias**: docs oficiales, comunidad técnica de referencia, y recursos en español de calidad. Entra: docs oficiales de proyectos listados, comunidad activa, tutoriales ES verificados. No entra: agregadores de tutoriales, vídeos sin texto verificable, blogs comerciales con bloqueo anti-bot (no verificables en CI).

## Mantenimiento de las categorías

- Las categorías se revisan cuando el volumen o los huecos lo justifican (ver `MAINTENANCE.md`).
- Propuestas de nueva categoría: vía issue justificado (nicho real, ≥5 recursos de calidad candidatos, y por qué las existentes no cubren).
- Si una categoría queda demasiado vacía, sus recursos se reubican en la categoría más precisa existente antes que crear categorías de una entrada.

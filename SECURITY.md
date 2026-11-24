# Política de Seguridad

## Alcance

Este repositorio es una **recopilación editorial de enlaces y recursos** sobre IA local en Linux. No distribuye software ejecutable, ni modelos, ni código de aplicación. Por tanto, el concepto de «vulnerabilidad» se aplica a:

1. **Contenido del repositorio**: enlaces maliciosos o suplantados, referencias a proyectos comprometidos (por ejemplo, repositorios secuestrados o releases con malware), o instrucciones que induzcan a prácticas inseguras.
2. **Infraestructura del repositorio**: el workflow de GitHub Actions (`link-check.yml`) y los scripts de validación de `scripts/`.

## Qué reportar

- Un enlace del README que apunte a un proyecto distinto del descrito, a un dominio suplantado o a contenido malicioso.
- Un proyecto listado cuyo repositorio oficial haya sido comprometido, renombrado o suplantado.
- Cualquier comportamiento inesperado o inseguro en los scripts de `scripts/` o en el workflow de Actions (por ejemplo, ejecución de comandos desde entradas no controladas).
- Suplantación de identidad del maintainer en canales externos.

## Cómo reportar

Usa el sistema de **reporte privado de vulnerabilidades de GitHub** (pestaña *Security* → *Report a vulnerability*) de este repositorio. Si no está disponible, contacta con el maintainer a través de su perfil: https://github.com/marrionesa.

No abras un issue público para vulnerabilidades: describe el problema en privado con enlaces, capturas y pasos de reproducción.

## Qué esperar

- Acuse de recibo en un plazo orientativo de **72 horas**.
- Evaluación y, si se confirma, retirada o corrección del contenido afectado.
- Publicación de un aviso en el CHANGELOG cuando la corrección sea pública.

## Notas sobre los recursos enlazados

Las herramientas y proyectos referenciados en este repositorio son obras de sus respectivos autores. Las vulnerabilidades de esos proyectos **deben reportarse a sus propios mantenedores** en sus canales oficiales (repositorio GitHub, web o security.txt del proyecto), no aquí. Este repositorio puede ayudar a localizar el canal adecuado, pero no coordina la divulgación de vulnerabilidades de terceros.

## Buenas prácticas para usuarios del listado

La inclusión de un recurso en este listado **no es una auditoría de seguridad**. Antes de ejecutar cualquier herramienta local de IA:

- Descarga siempre desde el repositorio o web oficial enlazados.
- Verifica las firmas o sumas de comprobación cuando el proyecto las publique.
- Revisa qué permisos, puertos y directorios expone cada herramienta (especialmente servidores de inferencia con API abierta).
- Preferé ejecuciones aisladas (contenedores, sandbox) cuando trabajes con modelos o herramientas de origen desconocido.

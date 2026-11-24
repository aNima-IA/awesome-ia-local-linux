#!/usr/bin/env bash
# Comprobación HTTP de enlaces externos del listado y la documentación.
# Amigable con rate limits: reutiliza conexión, duerme entre peticiones y
# reintenta con GET cuando HEAD no es aceptado.
#
# Uso: bash scripts/check-links.sh
# Salida: resumen por URL con código HTTP; exit 1 si hay enlaces con error
# (salvo los que figuren en la lista de exclusiones conocidas).
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UA='Mozilla/5.0 (X11; Linux x86_64) awesome-ia-local-linux-link-check'
SLEEP=0.4
TIMEOUT=20

# Dominios excluidos:
# - Reddit y LM Studio download: bloquean clientes no navegador (rate limit / anti-bot).
# - URLs del propio repositorio (badges, página de actions): solo verificables tras publicar.
EXCLUDE_RE='reddit\.com|lmstudio\.ai/download|datacamp\.com|github\.com/marrionesa/awesome-ia-local-linux'

# Ámbito: navegación publicable. docs/research/RESEARCH.md y SOURCES.md quedan fuera
# a propósito: son registro de auditoría y contienen enlaces muertos documentados
# (proyectos descartados), que no deben disparar fallos del chequeo.

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Recolecta URLs http(s) de los documentos publicables (excluye docs/research/raw).
{
  cat "$ROOT/README.md" "$ROOT/README.en.md" "$ROOT/CONTRIBUTING.md" \
      "$ROOT/SUPPORT.md" "$ROOT/SECURITY.md" "$ROOT/CHANGELOG.md" \
      "$ROOT/docs/research/COMPETITOR-ANALYSIS.md" \
      "$ROOT/docs/categories/CATEGORY-GUIDELINES.md" \
      "$ROOT/docs/maintenance/MAINTENANCE.md"
} | grep -oE 'https?://[^ )">]+' | sed 's/[).,]*$//' | sort -u > "$TMP/urls.txt"

total=$(wc -l < "$TMP/urls.txt")
echo "URLs únicas a comprobar: $total"
fail=0

check() {
  local url="$1"
  local code
  code=$(curl -sS -o /dev/null -m "$TIMEOUT" -A "$UA" -w '%{http_code}' -I -L "$url" 2>/dev/null)
  if [ "$code" = "405" ] || [ "$code" = "403" ] || [ "$code" = "000" ]; then
    code=$(curl -sS -o /dev/null -m "$TIMEOUT" -A "$UA" -w '%{http_code}' -L -r 0-1024 "$url" 2>/dev/null)
  fi
  printf '%s %s\n' "$code" "$url"
}

while IFS= read -r url; do
  if echo "$url" | grep -qE "$EXCLUDE_RE"; then
    printf 'SKIP %s\n' "$url"
    continue
  fi
  check "$url"
  sleep "$SLEEP"
done < "$TMP/urls.txt" | tee "$TMP/results.txt"

echo
echo "== Resumen =="
codes=$(awk '{print $1}' "$TMP/results.txt" | sort | uniq -c | sort -rn)
echo "$codes"

bad=$(awk '$1 != "200" && $1 != "SKIP" && $1 != "301" && $1 != "302" && $1 != "303" && $1 != "307" && $1 != "308" && $1 != "999" {print}' "$TMP/results.txt")
if [ -n "$bad" ]; then
  echo
  echo "== URLs con código inesperado (revisar) =="
  echo "$bad"
  exit 1
fi
echo "OK: todas las URLs comprobadas responden (o están excluidas documentadamente)."

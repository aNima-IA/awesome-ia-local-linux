#!/usr/bin/env bash
# Verifica candidatos de recursos vía API de GitHub.
# Si `gh` está autenticado usa la API autenticada (cuota 5.000/h); si no, curl anónimo (60/h).
# Registra por repo: existencia, archived, licencia SPDX, estrellas, última actividad.
# No modifica nada en GitHub: solo lecturas GET.
# Uso: bash scripts/verify-github.sh [salida.jsonl]
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
OUT="${1:-$ROOT_DIR/docs/research/raw/github-verify.jsonl}"
CANDIDATES="$ROOT_DIR/data/candidates.txt"

: > "$OUT"

USE_GH=0
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  USE_GH=1
  echo "Modo: gh api (autenticado)"
else
  echo "Modo: curl anónimo (cuota 60 req/hora)"
fi

total=0
while IFS= read -r repo; do
  case "$repo" in ''|\#*) continue ;; esac
  total=$((total+1))
  resp=""
  if [ "$USE_GH" = "1" ]; then
    resp=$(gh api "repos/$repo" 2>/dev/null || true)
  else
    resp=$(curl -sS -m 20 \
      -H 'Accept: application/vnd.github+json' \
      -H 'User-Agent: awesome-ia-local-linux-verify' \
      "https://api.github.com/repos/$repo" 2>/dev/null || true)
  fi
  [ -z "$resp" ] && resp='{"message":"empty response"}'
  printf '%s' "$resp" | node -e '
    let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
      const repo=process.argv[1];
      let r;try{r=JSON.parse(d)}catch(e){console.log(JSON.stringify({repo,error:"unparseable"}));return}
      if(r&&r.message&&!r.full_name){console.log(JSON.stringify({repo,error:r.message}));return}
      console.log(JSON.stringify({repo,error:null,archived:!!r.archived,license:r.license?r.license.spdx_id:null,stars:r.stargazers_count,pushed_at:r.pushed_at,desc:r.description||null,homepage:r.homepage||null}));
    })' "$repo" >> "$OUT"
  sleep 0.2
done < "$CANDIDATES"

node -e '
const fs=require("fs");
const rows=fs.readFileSync(process.argv[1],"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l));
const ok=rows.filter(r=>!r.error), err=rows.filter(r=>r.error);
console.log("\nCandidatos: "+rows.length+"  OK: "+ok.length+"  ERRORES: "+err.length);
for(const e of err) console.log("  ERR",e.repo,"->",e.error);
const arch=ok.filter(r=>r.archived);
if(arch.length){console.log("ARCHIVADOS ("+arch.length+"):");for(const a of arch) console.log("  ",a.repo);}
' "$OUT"

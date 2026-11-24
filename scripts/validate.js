#!/usr/bin/env node
/**
 * Validaciones locales de awesome-ia-local-linux (sin dependencias externas).
 *
 * Comprueba:
 *   1. Enlaces internos (#anclas) de los README: que apunten a secciones existentes.
 *   2. Recursos duplicados: misma URL oficial usada en más de una entrada.
 *   3. Formato básico de entradas: patrón "- [Nombre](URL) - descripción (Licencia)".
 *   4. Sincronización ES/EN: misma secuencia de recursos en README.md y README.en.md.
 *   5. Enlaces internos a ficheros del repositorio (docs/, scripts/, .github/…).
 *
 * Uso: node scripts/validate.js
 * Código de salida: 0 sin errores; 1 con errores (los avisos no fallan).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = {
  es: path.join(ROOT, 'README.md'),
  en: path.join(ROOT, 'README.en.md'),
};

const ENTRY_RE = /^- \[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s+(?:—|-)\s+/;
const LINK_RE = /\[([^\]]*)\]\(([^)\s]+)\)/g;

const errors = [];
const warnings = [];
const stats = { es: { entries: 0 }, en: { entries: 0 }, internalLinks: 0, checkedAnchors: 0 };

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

/** Slug de encabezado estilo GitHub (soporta acentos; preserva guiones dobles como GitHub). */
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, (m) => (m === '-' ? '-' : ''))
    .replace(/\s/g, '-');
}

function collectHeadings(md) {
  const slugs = new Set();
  for (const line of md.split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) slugs.add(slugify(m[1].replace(/[#\s]+$/, '')));
  }
  return slugs;
}

/** Enlaces y anclas de un documento. */
function analyze(md) {
  const entries = []; // {name,url}
  const anchors = []; // enlaces internos #
  const fileLinks = []; // enlaces relativos a ficheros
  const lines = md.split('\n');

  for (const line of lines) {
    const em = ENTRY_RE.exec(line);
    if (em) entries.push({ name: em[1], url: em[2] });

    for (const m of line.matchAll(LINK_RE)) {
      const target = m[2];
      if (target.startsWith('#')) anchors.push({ text: m[1], target });
      else if (!/^https?:/.test(target)) fileLinks.push({ text: m[1], target });
    }
  }
  return { entries, anchors, fileLinks };
}

function checkReadme(kind) {
  const file = FILES[kind];
  const md = read(file);
  const { entries, anchors, fileLinks } = analyze(md);
  stats[kind].entries = entries.length;

  // 1. Anclas internas
  const headings = collectHeadings(md);
  for (const a of anchors) {
    stats.checkedAnchors++;
    const target = decodeURIComponent(a.target.slice(1));
    if (!headings.has(target)) {
      errors.push(`[${kind}] ancla rota: "${a.target}" (texto: "${a.text}")`);
    }
  }
  stats.internalLinks += anchors.length;

  // 2. Duplicados por URL de entrada
  const seen = new Map();
  for (const e of entries) {
    const key = e.url.replace(/\/+$/, '');
    if (seen.has(key)) {
      errors.push(`[${kind}] recurso duplicado (${e.name}): ${e.url} — ya usado por "${seen.get(key)}"`);
    } else {
      seen.set(key, e.name);
    }
  }

  // 3. Formato básico de entradas: licencia/etiqueta entre paréntesis en la línea
  const LICENSE_HINT_RE = /\((?:[^()]*\b(?:-2\.0|-3\.0|-1\.0|mit|bsd|gpl|lgpl|apache|mpl|cc0|cc-by|propietari[oas]|proprietary|free of charge|comunidad|comunitaria|community|licencia|license|términos|terminos|terms|postgresql|docs|documentation|documentación|contenido|content|blog|fair.?code|dual)\b[^()]*)\)/i;
  const lines = md.split('\n');
  for (const line of lines) {
    if (!ENTRY_RE.test(line)) continue;
    const name = ENTRY_RE.exec(line)[1];
    if (!LICENSE_HINT_RE.test(line)) {
      warnings.push(`[${kind}] entrada sin licencia/etiqueta reconocible entre paréntesis: "${name}"`);
    }
  }

  // 5. Enlaces a ficheros del repo
  for (const fl of fileLinks) {
    const clean = fl.target.split('#')[0].split('?')[0];
    if (!clean) continue; // solo ancla dentro del propio fichero destino
    const abs = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(abs)) {
      errors.push(`[${kind}] fichero enlazado no existe: ${fl.target} ("${fl.text}")`);
    }
  }

  return entries;
}

/** 4. Sincronización ES/EN: misma secuencia de URLs de entrada. */
function checkSync(esEntries, enEntries) {
  if (esEntries.length !== enEntries.length) {
    errors.push(`[sync] número de entradas distinto: ES=${esEntries.length} EN=${enEntries.length}`);
    return;
  }
  for (let i = 0; i < esEntries.length; i++) {
    if (esEntries[i].url !== enEntries[i].url) {
      errors.push(
        `[sync] desalineación en la posición ${i + 1}: ES "${esEntries[i].name}" (${esEntries[i].url}) ≠ EN "${enEntries[i].name}" (${enEntries[i].url})`
      );
      return;
    }
  }
}

function main() {
  console.log('== Validación awesome-ia-local-linux ==\n');

  const esEntries = checkReadme('es');
  const enEntries = checkReadme('en');
  checkSync(esEntries, enEntries);

  // Otros ficheros: solo enlaces internos a ficheros
  const otherDocs = [
    'CONTRIBUTING.md',
    'SUPPORT.md',
    'SECURITY.md',
    'CHANGELOG.md',
    'CODE_OF_CONDUCT.md',
    'assets/README.md',
    'docs/research/RESEARCH.md',
    'docs/research/SOURCES.md',
    'docs/research/COMPETITOR-ANALYSIS.md',
    'docs/categories/CATEGORY-GUIDELINES.md',
    'docs/maintenance/MAINTENANCE.md',
  ];
  for (const rel of otherDocs) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) {
      errors.push(`[files] falta el documento: ${rel}`);
      continue;
    }
    const md = read(p);
    for (const m of md.matchAll(LINK_RE)) {
      const t = m[2];
      if (t.startsWith('#') || /^https?:/.test(t)) continue;
      const clean = t.split('#')[0].split('?')[0];
      if (!clean) continue;
      const abs = path.resolve(path.dirname(p), clean);
      if (!fs.existsSync(abs)) errors.push(`[${rel}] fichero enlazado no existe: ${t}`);
    }
  }

  console.log(`Entradas ES: ${stats.es.entries}`);
  console.log(`Entradas EN: ${stats.en.entries}`);
  console.log(`Anclas internas comprobadas: ${stats.checkedAnchors}`);
  console.log('');

  if (warnings.length) {
    console.log(`AVISOS (${warnings.length}):`);
    for (const w of warnings) console.log('  ⚠ ' + w);
    console.log('');
  }
  if (errors.length) {
    console.log(`ERRORES (${errors.length}):`);
    for (const e of errors) console.log('  ✗ ' + e);
    process.exit(1);
  } else {
    console.log('✓ Sin errores: anclas, duplicados, formato y sincronización ES/EN correctos.');
  }
}

main();

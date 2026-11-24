import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATS, parseReadme, pageRoute, ledClass, findImage, norm, esc, inlineMd, FALLBACK_BOX,
} from '../src/core.js';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = dirname(WEB);

const mdEs = readFileSync(join(ROOT, 'README.md'), 'utf8');
const mdEn = readFileSync(join(ROOT, 'README.en.md'), 'utf8');
const meta = JSON.parse(readFileSync(join(WEB, 'src', 'data', 'meta.json'), 'utf8'));
const { IMAGE_MAP } = await import('../src/images.js');

test('los README del repo existen y son sustanciales', () => {
  assert.ok(mdEs.length > 20000, 'README.md demasiado corto');
  assert.ok(mdEn.length > 20000, 'README.en.md demasiado corto');
});

test('el parser extrae las 13 secciones A–M con recursos', () => {
  const { sections } = parseReadme(mdEs);
  assert.equal(sections.length, 13);
  for (const k of Object.keys(CATS)) {
    const sec = sections.find((s) => s.key === k);
    assert.ok(sec, `falta la sección ${k.toUpperCase()}`);
    assert.ok(sec.items.length >= 5, `sección ${k.toUpperCase()} con pocos recursos`);
  }
});

test('ES y EN tienen exactamente los mismos recursos por sección', () => {
  const es = parseReadme(mdEs).sections;
  const en = parseReadme(mdEn).sections;
  assert.equal(es.length, en.length);
  for (let i = 0; i < es.length; i++) {
    assert.equal(es[i].key, en[i].key);
    assert.equal(es[i].items.length, en[i].items.length, `sección ${es[i].key}`);
    for (let j = 0; j < es[i].items.length; j++) {
      assert.equal(es[i].items[j].url, en[i].items[j].url, `sección ${es[i].key} #${j + 1}`);
    }
  }
});

test('todos los items parsean con nombre, URL y descripción', () => {
  const { sections } = parseReadme(mdEs);
  for (const s of sections) {
    for (const it of s.items) {
      assert.ok(it.name, `${s.key}: item sin nombre`);
      assert.match(it.url, /^https?:\/\//, `${s.key}/${it.name}: URL inválida`);
      assert.ok(it.desc.length > 10, `${s.key}/${it.name}: descripción ausente`);
    }
  }
});

test('las licencias se parsean en los items que las llevan', () => {
  const { sections } = parseReadme(mdEs);
  const withLic = sections.flatMap((s) => s.items).filter((i) => i.lic);
  // El README actual tiene ~115 items con licencia de 120
  assert.ok(withLic.length >= 100, `solo ${withLic.length} items con licencia`);
  assert.equal(sections[0].items[0].lic, 'MIT'); // Ollama
});

test('las etiquetas de compatibilidad se parsean', () => {
  const { sections } = parseReadme(mdEs);
  const ollama = sections[0].items[0];
  assert.deepEqual(ollama.tags, ['CUDA', 'ROCm', 'Vulkan', 'CPU']);
  const withTags = sections.flatMap((s) => s.items).filter((i) => i.tags.length > 0);
  assert.ok(withTags.length >= 40, `solo ${withTags.length} items con tags`);
});

test('el mapa de imágenes cubre los recursos y las rutas existen', () => {
  const { sections } = parseReadme(mdEs);
  const dist = join(WEB, 'public', 'images');
  let covered = 0;
  let total = 0;
  for (const s of sections) {
    for (const it of s.items) {
      total++;
      const f = findImage(IMAGE_MAP, s.key, it.name);
      if (f) {
        covered++;
        assert.ok(existsSync(join(WEB, 'public', f)), `imagen no encontrada: ${f}`);
      }
    }
  }
  assert.ok(covered / total >= 0.95, `solo ${covered}/${total} recursos con box art`);
});

test('las imágenes copiadas coinciden con las carpetas fuente', () => {
  let pub = 0;
  for (const rel of Object.values(CATS).map((c) => c.dir)) {
    const dir = join(WEB, 'public', 'images', rel);
    assert.ok(existsSync(dir), `falta public/images/${rel}`);
    pub += readdirSync(dir).length;
  }
  assert.equal(pub, meta.images.copied);
  assert.equal(pub, 120);
});

test('pageRoute mapea las páginas no-categoría', () => {
  assert.equal(pageRoute('Introducción'), 'home');
  assert.equal(pageRoute('Filosofía del proyecto'), 'home');
  assert.equal(pageRoute('Project philosophy'), 'home');
  assert.equal(pageRoute('Criterios de inclusión'), 'criteria');
  assert.equal(pageRoute('Inclusion criteria'), 'criteria');
  assert.equal(pageRoute('Otras listas relacionadas'), 'related');
  assert.equal(pageRoute('Licencia'), 'license');
  assert.equal(pageRoute('License'), 'license');
  assert.equal(pageRoute('Cosa rara sin mapa'), null);
});

test('ledClass clasifica licencias', () => {
  assert.equal(ledClass('MIT'), 'led');
  assert.equal(ledClass('Apache-2.0'), 'led');
  assert.equal(ledClass('Propietario gratuito'), 'led red');
  assert.equal(ledClass('Gemma Terms'), 'led amber');
  assert.equal(ledClass('Llama Community License'), 'led amber');
});

test('norm normaliza igual ES/EN para el matching', () => {
  assert.equal(norm('Ollama'), norm('ollama'));
  assert.equal(norm('Documentación de Ollama'), norm('Documentacion de Ollama'));
  assert.ok(norm('ExLlamaV3').includes('exllamav3'));
});

test('esc e inlineMd escapan HTML y renderizan enlaces', () => {
  assert.equal(esc('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  const html = inlineMd('mira [Ollama](https://github.com/ollama/ollama) y `code`');
  assert.ok(html.includes('<a href="https://github.com/ollama/ollama"'));
  assert.ok(html.includes('<code>code</code>'));
  assert.ok(!html.includes('<b>'));
});

test('FALLBACK_BOX es un data URI de SVG', () => {
  assert.match(FALLBACK_BOX, /^data:image\/svg\+xml/);
});

test('meta.json es coherente con el README', () => {
  const { sections } = parseReadme(mdEs);
  const total = sections.reduce((a, s) => a + s.items.length, 0);
  assert.equal(meta.items, total);
  assert.equal(meta.sections, 13);
});

/* ---------- stats de GitHub ---------- */

const { GH_STATS, GH_META } = await import('../src/github-data.js');
const { ghRepo } = await import('../scripts/build-data.mjs');

test('ghRepo extrae owner/repo de URLs de GitHub', () => {
  assert.equal(ghRepo('https://github.com/ollama/ollama'), 'ollama/ollama');
  assert.equal(ghRepo('https://github.com/ggml-org/llama.cpp'), 'ggml-org/llama.cpp');
  assert.equal(ghRepo('https://lmstudio.ai/'), null);
  assert.equal(ghRepo('https://github.com/user/repo/blob/main/x.md'), 'user/repo');
});

test('la mayoría de recursos GitHub tienen stats en el bundle', () => {
  const { sections } = parseReadme(mdEs);
  let total = 0;
  let withStats = 0;
  for (const s of sections) {
    for (const it of s.items) {
      total++;
      if (GH_STATS[ghRepo(it.url)]) withStats++;
    }
  }
  // ~9 recursos no son repos GitHub (docs, LM Studio, reddit…)
  assert.ok(withStats / total >= 0.9, `solo ${withStats}/${total} con stats`);
});

test('las stats tienen la forma esperada y datos plausibles', () => {
  const ollama = GH_STATS['ollama/ollama'];
  assert.ok(ollama, 'falta stats de ollama/ollama');
  assert.ok(typeof ollama.stars === 'number' && ollama.stars > 50000, `ollama stars=${ollama.stars}`);
  assert.ok(typeof ollama.forks === 'number');
  assert.equal(typeof ollama.archived, 'boolean');
  const piper = GH_STATS['rhasspy/piper'];
  assert.ok(piper && piper.archived, 'piper debería estar marcado archived');
  assert.ok(GH_META.withStats >= 100, `GH_META.withStats=${GH_META.withStats}`);
});

test('las secciones con repos de GitHub tienen candidato FEATURED', () => {
  const { sections } = parseReadme(mdEs);
  for (const s of sections) {
    const stars = s.items.map((i) => GH_STATS[ghRepo(i.url)]?.stars ?? -1);
    const max = Math.max(...stars);
    // La sección M (docs) no enlaza repos de GitHub: sin FEATURED es correcto.
    if (s.key === 'm') {
      assert.equal(max, -1, 'M no debería tener stats de repo');
    } else {
      assert.ok(max >= 0, `sección ${s.key} sin ningún repo con stats`);
    }
  }
});

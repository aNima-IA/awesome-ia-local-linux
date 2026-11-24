/**
 * main.js — aplicación: estado, carga de datos, router y render.
 * El diseño es el de la ventana retro-90s (styles.css); este módulo la vida.
 */
import {
  CATS, parseReadme, pageRoute, ledClass, findImage, esc, inlineMd, norm, FALLBACK_BOX,
} from './core.js';
import { IMAGE_MAP, META } from './images.js';
import { GH_STATS, GH_META } from './github-data.js';
import snapshotEs from './data/readme-es.md?raw';
import snapshotEn from './data/readme-en.md?raw';

const GH = META.repo || 'marrionesa/awesome-ia-local-linux';
const BRANCH = META.branch || 'main';
const RAW_URL = (l) => `https://raw.githubusercontent.com/${GH}/${BRANCH}/README${l === 'en' ? '.en' : ''}.md`;
const CDN_URL = (l) => `https://cdn.jsdelivr.net/gh/${GH}@${BRANCH}/README${l === 'en' ? '.en' : ''}.md`;
const GH_PAGE = `https://github.com/${GH}`;

const SNAPSHOT = { es: snapshotEs, en: snapshotEn };

const STATE = {
  lang: localStorage.getItem('ail-lang') || 'es',
  data: null,
  source: null,
  fallback: false,
  query: '',
  route: 'home',
  loaded: false,
};

const $ = (sel) => document.querySelector(sel);
const main = $('#main');
const BASE = import.meta.env.BASE_URL || '/';

/* ---------- stats de GitHub ---------- */
function ghRepo(url) {
  const m = /^https:\/\/github\.com\/([^\/\s]+)\/([^\/\s#?]+)/.exec(String(url || ''));
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : null;
}

function statsFor(url) {
  const repo = ghRepo(url);
  return repo ? GH_STATS[repo] || null : null;
}

function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.0', '') + 'k';
  return String(n);
}

function daysSince(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.max(0, Math.round((Date.now() - t) / 86400000)) : null;
}

/** Antigüedad real del último push, en texto legible ES/EN. */
function ageText(days) {
  if (days == null) return null;
  const en = STATE.lang === 'en';
  if (days <= 1) return en ? 'updated today' : 'actualizado hoy';
  if (days < 60) return en ? `updated ${days} days ago` : `actualizado hace ${days} días`;
  const m = Math.round(days / 30);
  if (m < 24) return en ? `updated ${m} ${m === 1 ? 'month' : 'months'} ago` : `actualizado hace ${m} meses`;
  const y = Math.round(m / 12);
  return en ? `updated ${y} ${y === 1 ? 'year' : 'years'} ago` : `actualizado hace ${y} años`;
}

/** Rating retro 1–5 según estrellas (1★, 500, 2k, 10k, 40k) */
function ratingFor(stars) {
  if (!stars) return 0;
  if (stars >= 40000) return 5;
  if (stars >= 10000) return 4;
  if (stars >= 2000) return 3;
  if (stars >= 500) return 2;
  return 1;
}

function starsHTML(n) {
  const r = ratingFor(n);
  return `<span class="stars" title="${esc(String(n ?? 0))} estrellas en GitHub">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</span>`;
}

function badgesFor(item, isFeatured) {
  const s = statsFor(item.url);
  const out = [];
  if (isFeatured) out.push('<span class="ribbon featured">★ FEATURED</span>');
  const days = s ? daysSince(s.pushed) : null;
  if (s && s.stars >= 20000) out.push('<span class="ribbon hot">HOT!</span>');
  if (days != null && days <= 30) out.push('<span class="ribbon new">NEW!</span>');
  if (s && s.archived) out.push('<span class="ribbon arch">ARCHIVED</span>');
  return out.join('');
}

function statsHTML(item, isFeatured) {
  const s = statsFor(item.url);
  if (!s) return '';
  return `<div class="ghstats">`
    + `<span class="ghpill" title="Estrellas en GitHub">★ ${fmtNum(s.stars)}</span>`
    + `<span class="ghpill" title="Forks en GitHub">⑂ ${s.forks == null ? '—' : fmtNum(s.forks)}</span>`
    + `</div>`;
}

/* ---------- carga de datos: GitHub en vivo con respaldo local ---------- */
function snapshotText(lang) {
  return SNAPSHOT[lang] || SNAPSHOT.es;
}

async function loadReadme(lang) {
  const urls = [RAW_URL(lang), CDN_URL(lang)];
  const attempts = [];
  for (const url of urls) {
    const host = url.replace('https://', '').split('/')[0];
    setStatus(`Cargando README (${host})…`, true);
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) {
        const t = await r.text();
        if (t.length > 5000 && t.includes('## A.')) {
          return { text: t, source: `${host}@${BRANCH}`, fallback: false };
        }
      }
      attempts.push(`${host} → HTTP ${r.status}`);
    } catch (e) {
      attempts.push(`${host} → ${e.name}`);
    }
  }
  // idioma alternativo antes del snapshot
  if (lang !== 'es') {
    try {
      const r2 = await fetch(RAW_URL('es'), { cache: 'no-store' });
      if (r2.ok) {
        const t2 = await r2.text();
        if (t2.length > 5000) return { text: t2, source: 'raw.githubusercontent (ES fallback)', fallback: true };
      }
    } catch { /* sin conexión */ }
  }
  return { text: snapshotText(lang), source: `snapshot del build (${attempts.join('; ') || 'sin conexión'})`, fallback: true };
}

/* ---------- render: piezas ---------- */
function tagLabel(t) {
  const m = { CUDA: 'CUDA', ROCm: 'ROCM', Vulkan: 'VULKAN', CPU: 'CPU', 'GPU Intel': 'IGPU', 'Intel GPU': 'IGPU', Kubernetes: 'K8S' };
  return m[t] || t.toUpperCase();
}

function cardHTML(item, catKey, isFeatured) {
  const img = findImage(IMAGE_MAP, catKey, item.name);
  const imgTag = img
    ? `<img class="boxart" src="${BASE}${img}" alt="Caja retro de ${esc(item.name)}" loading="lazy" width="112" height="142" onerror="this.onerror=null;this.src='${FALLBACK_BOX}'">`
    : `<img class="boxart" src="${FALLBACK_BOX}" alt="Caja de software genérica" width="112" height="142">`;
  const isGh = /^https:\/\/github\.com\//.test(item.url);
  const ctaLabel = isGh ? 'VER EN GITHUB' : 'SITIO OFICIAL';
  const tags = (item.tags || []).map((t) => `<span class="tag">${esc(tagLabel(t))}</span>`).join('');
  const subs = (item.subs || [])
    .map((s) => `<a class="tag" style="text-decoration:none;color:#000" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name.toUpperCase())}</a>`)
    .join('');
  const lic = item.lic
    ? `<span class="lic"><span class="${ledClass(item.lic)}"></span><span class="txt" title="${esc(item.lic)}">${esc(item.lic)}</span></span>`
    : '';
  const catShort = (CATS[catKey] || {}).short || '';
  const s = statsFor(item.url);
  const age = s ? ageText(daysSince(s.pushed)) : null;
  const csub = age
    ? (s.archived ? `${STATE.lang === 'en' ? 'Archived' : 'Archivado'} · ${age}` : age)
    : (STATE.lang === 'en' ? 'Verified Nov 2026' : 'Verificado nov 2026');
  return `<article class="card${isFeatured ? ' featured' : ''}" data-name="${esc(norm(item.name))}" data-desc="${esc(norm(item.desc))}">`
    + badgesFor(item, isFeatured)
    + imgTag
    + `<div class="cbody">`
    +   `<h3 class="ctitle"><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.name)}</a></h3>`
    +   `<div class="csub">${esc(csub)} · ${esc(catShort)}</div>`
    +   `<p class="cdesc">${inlineMd(item.desc)}</p>`
    +   `<div class="ctags">${tags}${subs}${lic}</div>`
    +   statsHTML(item, isFeatured)
    +   `<div class="cta"><a class="btn primary" href="${esc(item.url)}" target="_blank" rel="noopener">${ctaLabel}</a>${s ? starsHTML(s.stars) : ''}</div>`
    + `</div></article>`;
}

function backTop() {
  return '<div class="backtop"><a class="btn" href="#home">↑ VOLVER AL INICIO</a></div>';
}

function sectionHTML(sec) {
  // FEATURED: el recurso con más estrellas de la sección (según stats de GitHub)
  let featured = null;
  let best = -1;
  for (const it of sec.items) {
    const s = statsFor(it.url);
    if (s && s.stars > best) { best = s.stars; featured = it; }
  }
  let html = `<h2 class="sec-head">Local AI &amp; LLM Catalogue</h2>`
    + `<p class="sec-sub">${esc(sec.title.toUpperCase())} — ${sec.items.length} TÍTULOS</p>`;
  if (sec.desc.length) html += `<div class="hero"><p>${sec.desc.map(inlineMd).join(' ')}</p></div>`;
  if (featured) {
    html += `<div class="featured-wrap">` + cardHTML(featured, sec.key, true) + `</div>`;
  }
  html += `<div class="grid">${sec.items.filter((i) => i !== featured).map((it) => cardHTML(it, sec.key, false)).join('')}</div>`;
  html += sec.notes.map((n) => `<div class="note">⚠ ${inlineMd(n)}</div>`).join('');
  return html + backTop();
}

function renderBlock(lines) {
  let html = '';
  let i = 0;
  const GH_TREE = `https://github.com/${GH}/blob/${BRANCH}/`;
  const inline = (s) => inlineMd(s, GH_TREE, GH_PAGE);
  while (i < lines.length) {
    const L = lines[i];
    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(L)) { i++; continue; }
    if (/^\s*\|/.test(L)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      if (rows.length >= 2) {
        const cells = (r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
        const head = cells(rows[0]);
        const body = rows.slice(2).map(cells);
        html += `<table class="md-table"><thead><tr>${head.map((c) => `<th>${inline(c.trim())}</th>`).join('')}</tr></thead><tbody>`
          + body.map((r) => `<tr>${r.map((c) => `<td>${inline(c.trim())}</td>`).join('')}</tr>`).join('')
          + '</tbody></table>';
      }
      continue;
    }
    if (/^- /.test(L)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      html += `<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`;
      continue;
    }
    if (/^\d+\.\s/.test(L)) {
      const ol = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) ol.push(lines[i++].replace(/^\d+\.\s/, ''));
      html += `<ol>${ol.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`;
      continue;
    }
    if (/^#{1,6}\s/.test(L)) { html += `<h3>${inline(L.replace(/^#+\s/, ''))}</h3>`; i++; continue; }
    if (/^>\s?/.test(L)) { html += `<blockquote>${inline(L.replace(/^>\s?/, ''))}</blockquote>`; i++; continue; }
    if (!L.trim()) { i++; continue; }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^\s*[|>-]/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      para.push(lines[i++]);
    }
    if (!para.length) { i++; continue; }
    html += `<p>${inline(para.join(' '))}</p>`;
  }
  return html;
}

function genericPageHTML(route) {
  const pages = (STATE.data && STATE.data.pages) || {};
  const parts = [];
  for (const t of Object.keys(pages)) {
    if (pageRoute(t) === route) parts.push(pages[t]);
  }
  if (!parts.length) return '<h2 class="sec-head">404</h2><p class="sec-sub">PAGE NOT FOUND</p>' + backTop();
  const titles = {
    start: 'Start Here', criteria: 'Inclusion Criteria', status: 'Maintenance Status',
    related: 'Related Lists', contribute: 'Contribute', credits: 'Acknowledgements', license: 'License',
  };
  return `<h2 class="sec-head">${esc((titles[route] || route).toUpperCase())}</h2>`
    + '<p class="sec-sub">GENERADO EN VIVO DESDE EL README DEL REPOSITORIO</p>'
    + `<div class="gen">${parts.map((p) => renderBlock(p.lines)).join('')}</div>`
    + backTop();
}

function homeHTML() {
  const pages = (STATE.data && STATE.data.pages) || {};
  const intro = [];
  const phil = [];
  const who = [];
  for (const t of Object.keys(pages)) {
    if (pageRoute(t) !== 'home') continue;
    const n = norm(t);
    if (n.includes('filosofia') || n.includes('philosophy')) phil.push(pages[t]);
    else if (n.startsWith('paraquien') || n.startsWith('whothislist')) who.push(pages[t]);
    else intro.push(pages[t]);
  }
  const secs = STATE.data.sections || [];
  const nItems = secs.reduce((a, s) => a + s.items.length, 0);
  let html = '';
  for (const p of intro) html += `<div class="hero">${renderBlock(p.lines)}</div>`;
  for (const p of phil) html += `<div class="hero"><h2>Filosofía del proyecto</h2>${renderBlock(p.lines)}</div>`;
  for (const p of who) html += `<div class="hero"><h2>Para quién es</h2>${renderBlock(p.lines)}</div>`;
  html += `<div class="chartgrid bottom">`
    + `<a class="chartbox" href="https://star-history.com/#${GH}&${GH}" target="_blank" rel="noopener">`
    +   '<span class="chartlabel">★ STAR HISTORY</span>'
    +   `<img src="https://api.star-history.com/svg?repos=${GH}&type=Date" alt="Gráfico de evolución de estrellas del repositorio" loading="lazy" onerror="this.closest('.chartbox').classList.add('chart-missing')">`
    + '</a>'
    + `<a class="chartbox" href="${GH_PAGE}#readme" target="_blank" rel="noopener">`
    +   '<span class="chartlabel">📋 FICHA DEL PROYECTO</span>'
    +   '<div class="specbox">'
    +   '<table>'
    +   `<tr><td>RECURSOS</td><td>${nItems} verificados</td></tr>`
    +   `<tr><td>SECCIONES</td><td>${secs.length} categorías A–M</td></tr>`
    +   '<tr><td>BILINGÜE</td><td>ES / EN sincronizados</td></tr>'
    +   `<tr><td>VERIFICADO</td><td>24 nov 2026</td></tr>`
    +   '<tr><td>LICENCIA</td><td>CC0-1.0 (dominio público)</td></tr>'
    +   '<tr><td>MAINTAINER</td><td>Mario R. (@marrionesa)</td></tr>'
    +   `<tr><td>DATOS</td><td>${STATE.fallback ? 'snapshot del build' : 'README en vivo'}</td></tr>`
    +   '</table>'
    +   '</div>'
    + '</a>'
    + '</div>';
  html += `<div class="badgebar">`
    + `<a href="${GH_PAGE}" target="_blank" rel="noopener" title="Awesome lists"><img src="https://img.shields.io/badge/awesome-yes-ff47b2" alt="Awesome" height="22"></a>`
    + `<a href="${GH_PAGE}" target="_blank" rel="noopener" title="Estrellas del repo"><img src="https://img.shields.io/github/stars/${GH}?style=social&label=Stars" alt="GitHub stars" height="22"></a>`
    + `<a href="${GH_PAGE}/forks" target="_blank" rel="noopener" title="Forks del repo"><img src="https://img.shields.io/github/forks/${GH}?style=social&label=Forks" alt="GitHub forks" height="22"></a>`
    + `<a href="${GH_PAGE}" target="_blank" rel="noopener" title="Último commit"><img src="https://img.shields.io/github/last-commit/${GH}/main" alt="Last commit" height="22"></a>`
    + `<a href="${GH_PAGE}#readme" target="_blank" rel="noopener" title="Licencia CC0-1.0"><img src="https://img.shields.io/github/license/${GH}" alt="License" height="22"></a>`
    + `<a href="${GH_PAGE}" target="_blank" rel="noopener" title="Tamaño del repo"><img src="https://img.shields.io/github/repo-size/${GH}" alt="Repo size" height="22"></a>`
    + `<a href="${GH_PAGE}/actions/workflows/link-check.yml" target="_blank" rel="noopener" title="Estado del link check"><img src="https://img.shields.io/github/actions/workflow/status/${GH}/link-check.yml?label=link%20check" alt="Link check" height="22"></a>`
    + `</div>`;
  return html;
}

function searchHTML(q) {
  const secs = (STATE.data && STATE.data.sections) || [];
  const nq = norm(q);
  const hits = [];
  secs.forEach((sec) => {
    sec.items.forEach((it) => {
      if (norm(it.name).includes(nq) || norm(it.desc).includes(nq)) hits.push({ it, cat: sec.key });
    });
  });
  let html = `<h2 class="sec-head">Search Results</h2><p class="sec-sub">“${esc(q).toUpperCase()}” — ${hits.length} RESULTADO(S)</p>`;
  if (!hits.length) html += '<div class="hero"><p>Sin resultados. Prueba con otro término (p. ej. “ollama”, “whisper”, “vllm”).</p></div>';
  else html += `<div class="grid">${hits.map((h) => cardHTML(h.it, h.cat, false)).join('')}</div>`;
  return html + backTop();
}

/* ---------- render: raíz y navegación ---------- */
const VALID_ROUTES = ['home', 'search', 'start', 'criteria', 'status', 'related', 'contribute', 'credits', 'license'];

function render() {
  const route = STATE.route;
  if (window.__updateHeader) window.__updateHeader();
  if (route === 'home') main.innerHTML = homeHTML();
  else if (CATS[route]) main.innerHTML = sectionHTML(STATE.data.sections.find((s) => s.key === route));
  else if (route === 'search') main.innerHTML = STATE.query ? searchHTML(STATE.query) : homeHTML();
  else main.innerHTML = genericPageHTML(route);
  main.focus({ preventScroll: true });
  document.querySelectorAll('#catnav .navbtn, #quickbar .qbtn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-route') === route);
  });
  document.title = `Awesome IA Local Linux — ${CATS[route] ? CATS[route].short : 'Catálogo de IA Local'}`;
}

function buildNav() {
  const secs = (STATE.data && STATE.data.sections) || [];
  $('#catnav').innerHTML = secs
    .map((s) => `<button class="navbtn" data-route="${s.key}" title="${esc(s.title)}">${esc((CATS[s.key] || {}).short || s.title)}</button>`)
    .join('');
  $('#quickbar').innerHTML =
    '<span class="qlabel">BOOKMARKS:</span>'
    + '<button class="qbtn" data-route="start">Start Here</button>'
    + '<button class="qbtn" data-route="criteria">Criteria</button>'
    + '<button class="qbtn" data-route="status">Maintenance</button>'
    + '<button class="qbtn" data-route="related">Related Lists</button>'
    + '<button class="qbtn" data-route="contribute">Contribute</button>'
    + '<button class="qbtn" data-route="license">License</button>';
  document.querySelectorAll('.navbtn, .qbtn').forEach((b) => {
    b.addEventListener('click', () => go(b.getAttribute('data-route')));
  });
}

function setStatus(msg, busy) {
  $('#sb-status').innerHTML = `${busy ? '<span class="busy"></span>' : '<span class="okled"></span>'}${esc(msg)}`;
}

function setDataBadge() {
  const secs = (STATE.data && STATE.data.sections) || [];
  const total = secs.reduce((a, s) => a + s.items.length, 0);
  $('#sb-data').textContent = STATE.fallback ? 'DATA: SNAPSHOT LOCAL' : 'DATA: GITHUB LIVE';
  $('#sb-data').title = STATE.source || '';
  $('#sb-count').textContent = `ITEMS: ${total}`;
  $('#mq-text').textContent = `★ ${total} RECURSOS VERIFICADOS UNO A UNO ★ LICENCIA Y ESTADO DE MANTENIMIENTO EN CADA ENTRADA ★ IA 100% LOCAL EN LINUX: RUNTIMES · AGENTES · RAG · VOZ · VÍDEO ★ DATOS EN VIVO DESDE EL README OFICIAL ★ CC0-1.0: COPIA, REÚSA Y REMEZCLA ★`;
}

function go(route, opts) {
  if (!CATS[route] && !VALID_ROUTES.includes(route)) route = 'home';
  STATE.route = route;
  if (opts && opts.query !== undefined) STATE.query = opts.query;
  try { if (`#${route}` !== location.hash) location.hash = route; } catch { /* sin hash */ }
  render();
  window.scrollTo({ top: 0 });
}

async function refreshData(lang) {
  const r = await loadReadme(lang);
  STATE.data = parseReadme(r.text);
  STATE.source = r.source;
  STATE.fallback = r.fallback;
  STATE.loaded = true;
  buildNav();
  setDataBadge();
  render();
  setStatus(STATE.fallback ? 'Sin conexión con GitHub — mostrando el snapshot del build.' : 'Catálogo cargado y renderizado desde el README en vivo.', false);
}

/* ---------- arranque ---------- */
async function boot() {
  const hits = Number.parseInt(localStorage.getItem('ail-hits') || '0', 10) + 1;
  localStorage.setItem('ail-hits', String(hits));
  $('#hits').textContent = String(hits).padStart(6, '0');

  $('#tb-lang-label').textContent = STATE.lang.toUpperCase();
  document.documentElement.lang = STATE.lang;

  const h = (location.hash || '#home').slice(1);
  STATE.route = CATS[h] || VALID_ROUTES.includes(h) ? h : 'home';

  await refreshData(STATE.lang);

  $('#tb-back').addEventListener('click', () => history.back());
  $('#tb-fwd').addEventListener('click', () => history.forward());
  $('#tb-home').addEventListener('click', () => go('home'));
  $('#tb-reload').addEventListener('click', () => refreshData(STATE.lang));
  $('#tb-gh').addEventListener('click', () => window.open(GH_PAGE, '_blank', 'noopener'));
  $('#tb-lang').addEventListener('click', () => {
    STATE.lang = STATE.lang === 'es' ? 'en' : 'es';
    localStorage.setItem('ail-lang', STATE.lang);
    $('#tb-lang-label').textContent = STATE.lang.toUpperCase();
    document.documentElement.lang = STATE.lang;
    refreshData(STATE.lang);
  });
  $('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') go('search', { query: $('#q').value }); });

  // Cabecera sticky (una única fuente de verdad):
  //  - collapsed (>140px): pliega marquesina y bookmarks en TODAS las páginas.
  //  - banner: se pliega solo en las páginas de categorías; en Home, búsqueda y
  //    bookmarks (banner-fixed) permanece siempre visible.
  const header = document.querySelector('.win-header');
  const updateHeader = () => {
    header.classList.toggle('collapsed', window.scrollY > 140);
    header.classList.toggle('banner-fixed', VALID_ROUTES.includes(STATE.route));
    document.body.classList.toggle('banner-fixed', VALID_ROUTES.includes(STATE.route));
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.__updateHeader = updateHeader;
  window.addEventListener('hashchange', () => {
    const h2 = location.hash.slice(1) || 'home';
    if (STATE.loaded && (CATS[h2] || VALID_ROUTES.includes(h2))) { STATE.route = h2; render(); }
  });
}

boot();

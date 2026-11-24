/**
 * core.js — núcleo puro (sin DOM): parseo del README, mapeo de imágenes y helpers.
 * Se usa desde el navegador (main.js) y desde los tests de Node (tests/).
 */

export const CATS = {
  a: { dir: 'imgs-runtimes', short: 'Local LLMs' },
  b: { dir: 'imgs-servers-ref', short: 'APIs & Serving' },
  c: { dir: 'imgs-modelos-open', short: 'Model Weights' },
  d: { dir: 'imgs-gpu-accel', short: 'GPU & Accel' },
  e: { dir: 'imgs-ias-desktop', short: 'Desktop AI' },
  f: { dir: 'imgs-automatiz', short: 'Agents & MCP' },
  g: { dir: 'imgs-rags', short: 'RAG & Knowledge' },
  h: { dir: 'imgs-voz', short: 'Voice AI' },
  i: { dir: 'imgs-video-imagenes-creat', short: 'Image & Video' },
  j: { dir: 'imgs-monitoring', short: 'Monitoring' },
  k: { dir: 'imgs-seguridad', short: 'Security' },
  l: { dir: 'imgs-ecosistemas', short: 'Dev Tools' },
  m: { dir: 'imgs-docs', short: 'Docs & Guides' },
};

export const SECT_RE = /^([A-M])\.\s+/;
export const ITEM_RE = /^-\s+\[([^\]]+)\]\((https?:[^)\s]+)\)\s+(?:—|-)\s+(.*)$/;

export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Parsea el README en { sections, pages } */
export function parseReadme(md) {
  const lines = String(md || '').split('\n');
  const sections = [];
  const pages = {};
  let cur = null;
  let curPage = null;

  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) {
      const title = h2[1].trim();
      const sm = SECT_RE.exec(title);
      if (sm) {
        cur = { key: sm[1].toLowerCase(), title, desc: [], items: [], notes: [] };
        sections.push(cur);
        curPage = null;
        continue;
      }
      cur = null;
      curPage = { title, lines: [] };
      pages[title] = curPage;
      continue;
    }
    if (cur) {
      const it = ITEM_RE.exec(line);
      if (it) {
        let rest = it[3];
        const subs = [];
        const reSub = /\u00b7\s*\[([^\]]+)\]\((https?:[^)\s]+)\)/;
        let m2;
        while ((m2 = reSub.exec(rest))) {
          subs.push({ name: m2[1], url: m2[2] });
          rest = rest.slice(0, m2.index) + rest.slice(m2.index + m2[0].length);
        }
        const tm = /`?\s*(?:\s*\[[A-Z][^\]\[]{1,12}\])+\s*`?\.?\s*$/.exec(rest);
        let tags = [];
        if (tm) {
          tags = tm[0].match(/\[([A-Z][^\]\[]{1,12})\]/g).map((s) => s.slice(1, -1));
          rest = rest.slice(0, tm.index);
        }
        const lm = /\s*\(([^()]{1,120})\)\s*$/.exec(rest);
        let lic = null;
        if (lm) {
          lic = lm[1];
          rest = rest.slice(0, lm.index);
        }
        cur.items.push({ name: it[1], url: it[2], desc: rest.trim().replace(/\s+/g, ' '), lic, tags, subs });
        continue;
      }
      const nm = /^>\s+(?:\*\*Nota:\*\*|Note:)\s*(.*)$/.exec(line);
      if (nm) {
        cur.notes.push(nm[1].trim());
        continue;
      }
      if (/^[-|#]/.test(line) || !line.trim()) continue;
      // Bloques HTML crudos (p. ej. <div align="center"> del pie del README):
      // no son contenido Markdown, no se muestran como texto.
      if (/^\s*<\/?div[^>]*>\s*$/.test(line)) continue;
      cur.desc.push(line.trim());
      continue;
    }
    if (curPage) {
      // Pie del README en HTML crudo (<div align="center">Mantenido por…</div>):
      // se excluye entero — las etiquetas se mostrarían como texto literal y la
      // línea de crédito duplica la ficha del home con un enlace relativo al repo
      // que no resuelve dentro de la web.
      if (/^\s*<\/?div[^>]*>\s*$/.test(line) || /^\s*(Mantenido por|Maintained by)/.test(line)) continue;
      curPage.lines.push(line);
    }
  }
  return { sections, pages };
}

/** Título de página → ruta interna */
export function pageRoute(title) {
  const n = norm(title);
  const map = [
    ['introduccion|introduction', 'home'],
    ['filosofia|projectphilosophy', 'home'],
    ['paraquien|whothislist', 'home'],
    ['comoelegir|wheretostart', 'start'],
    ['criterios|inclusioncriteria', 'criteria'],
    ['estadod|maintenancestatus', 'status'],
    ['otraslistas|relatedlists', 'related'],
    ['comocontribuir|contributing', 'contribute'],
    ['reconocimientos|acknowledgements', 'credits'],
    ['licencia|license', 'license'],
  ];
  for (const [alts, route] of map) {
    for (const alt of alts.split('|')) {
      if (n.indexOf(alt) === 0) return route;
    }
  }
  return null;
}

/** Semáforo de licencia: verde libre, ámbar con condiciones, rojo no libre/docs */
export function ledClass(lic) {
  const s = norm(lic);
  if (/propietari|proprietary|contenido|content|blog|comunidad|community$|owasp|docs|documentacion|documentation/.test(s)) return 'led red';
  if (/comunitari|communitylic|gemmaterms|licenciapropia|custom|territori|condicion|condiciones|enterprise|excepciones|exceptions|dual|pesos|weights|modif|transicion/.test(s)) return 'led amber';
  return 'led';
}

/** Busca la box art de un recurso en el mapa { key: [{names,file}] } */
export function findImage(imageMap, catKey, itemName) {
  const table = (imageMap && imageMap[catKey]) || [];
  const nm = norm(itemName);
  let best = null;
  let bestScore = 0;
  for (const entry of table) {
    for (const n of entry.names || []) {
      const kk = norm(n);
      let s = 0;
      if (kk === nm) s = 100;
      else if (nm.indexOf(kk) === 0 || kk.indexOf(nm) === 0) s = 60 + Math.min(kk.length, 20);
      else if (nm.indexOf(kk) >= 0) s = 40 + Math.min(kk.length, 20);
      if (s > bestScore) {
        bestScore = s;
        best = entry.file;
      }
    }
  }
  return best;
}

export function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function inlineMd(s, baseUrl, ghPage) {
  const out = esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => {
    // Enlaces relativos del README (docs/…, CONTRIBUTING.md, LICENSE…): son
    // ficheros del repositorio y dentro de la web darían 404; se resuelven
    // contra el árbol de ficheros de GitHub. Las anclas internas (#a-…)
    // apuntan a secciones del README en GitHub, donde existen de verdad.
    let url = href;
    if (href.startsWith('#')) {
      if (ghPage) url = ghPage + href;
    } else if (!/^(https?:|mailto:|data:)/.test(href) && baseUrl) {
      url = baseUrl + href;
    }
    return `<a href="${url}" target="_blank" rel="noopener">${txt}</a>`;
  });
}

export const FALLBACK_BOX =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="88" height="112" viewBox="0 0 88 112">' +
      '<rect width="88" height="112" fill="#e8e4da"/>' +
      '<rect x="12" y="16" width="64" height="52" fill="#c0c0c0" stroke="#000" stroke-width="2"/>' +
      '<rect x="18" y="24" width="52" height="36" fill="#008080"/>' +
      '<rect x="24" y="30" width="40" height="24" fill="#c0c0c0"/>' +
      '<rect x="20" y="76" width="48" height="10" fill="#808080"/>' +
      '<rect x="26" y="92" width="36" height="8" fill="#000080"/>' +
      '<text x="44" y="86" font-family="monospace" font-size="8" text-anchor="middle" fill="#000">SOFTWARE</text>' +
      '</svg>'
  );

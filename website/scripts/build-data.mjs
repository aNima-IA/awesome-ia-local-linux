#!/usr/bin/env node
/**
 * build-data.mjs — genera los datos de la web desde el repositorio.
 *
 * Fuentes:
 *   1. README.md / README.en.md del propio repositorio (../)  ← fuente canónica en CI
 *   2. --fetch: descarga además la versión publicada en GitHub main
 *   3. Stats de GitHub (stars/forks/pushed/archived) por recurso:
 *        - semilla: docs/research/raw/github-verify.jsonl (verificación del repo;
 *          fichero LOCAL opcional, excluido del repo — si no existe se parte sin semilla)
 *        - actualización: API de GitHub (token opcional del entorno) o `gh` CLI
 *        - cache: src/data/github.json (se confirma en el repo como respaldo)
 *
 * Genera:
 *   - src/data/readme-es.md / readme-en.md   (snapshots para el fallback offline)
 *   - src/data/meta.json                     (build, totales)
 *   - src/data/github.json                   (cache de stats)
 *   - src/images.js                          (mapa recurso → box art, ES/EN alias)
 *   - src/github-data.js                     (mapa repo GitHub → stats)
 *   - public/images/<categoría>/<fichero>    (las 120 imágenes copiadas)
 *
 * Uso: node scripts/build-data.mjs [--fetch]
 */
'use strict';

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = dirname(WEB);
const IMGROOT = join(WEB, 'imgs-categorias-todas');
const DATA = join(WEB, 'src', 'data');
const PUBIMG = join(WEB, 'public', 'images');
const SEED = join(ROOT, 'docs', 'research', 'raw', 'github-verify.jsonl');

const FETCH = process.argv.includes('--fetch');
const REPO = process.env.WEB_REPO || 'marrionesa/awesome-ia-local-linux';
const BRANCH = process.env.WEB_BRANCH || 'main';
const REFRESH_MS = 12 * 60 * 60 * 1000; // no re-pedir stats de menos de 12h

/** Token opcional para la API de GitHub; se lee SOLO del entorno, nunca se guarda en el repo. */
function ghAuthToken() {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

const DIRS = {
  a: 'imgs-runtimes', b: 'imgs-servers-ref', c: 'imgs-modelos-open', d: 'imgs-gpu-accel',
  e: 'imgs-ias-desktop', f: 'imgs-automatiz', g: 'imgs-rags', h: 'imgs-voz',
  i: 'imgs-video-imagenes-creat', j: 'imgs-monitoring', k: 'imgs-seguridad',
  l: 'imgs-ecosistemas', m: 'imgs-docs',
};

/** [nombre de referencia (ES o EN), substrings identificativos del fichero] */
const HINTS = {
  a: [
    ['Ollama', ['for_ollama']],
    ['SGLang', ['for_sglang']],
    ['mistral.rs', ['rust_llm']],
    ['llamafile', ['usb_flash']],
    ['gemma.cpp', ['tinyllama']],
    ['vLLM', ['enterprise_pc']],
    ['llama.cpp', ['retro_pc_software_box']],
    ['LocalAI', ['07b2e6aa']],
    ['MLC LLM', ['2db10bad']],
  ],
  b: [
    ['OpenVINO', ['intel_openvino']],
    ['LM Studio', ['lm_studio']],
    ['NVIDIA Triton Inference Server', ['triton']],
    ['TensorRT-LLM', ['nvidia_gpu_software_jewel']],
    ['llama-cpp-python', ['python_software_case']],
    ['LiteLLM', ['649b38bf']],
  ],
  c: [
    ['Qwen3', ['retro_pc_software_package_display']],
    ['Llama', ['retro_jewel_case']],
    ['Gemma', ['b1452f8b']],
    ['Mistral AI', ['software_collector_box']],
    ['DeepSeek-V3', ['deepseek']],
    ['DeepSeek-R1', ['18933bff']],
    ['gpt-oss', ['openai_release']],
    ['Phi Cookbook', ['microsoft_developer']],
    ['SmolLM', ['f672d060']],
  ],
  d: [
    ['CUDA Toolkit', ['nvidia_cuda_toolkit']],
    ['ROCm', ['amd_rocm']],
    ['Vulkan-Docs', ['vulkan_documentation']],
    ['GGML', ['ggml_tensor']],
    ['GGUF specification', ['gguf_manual']],
    ['safetensors', ['1990s_data_compression']],
    ['ExLlamaV3', ['product_photography_of_90s_software']],
    ['LLM Compressor', ['65eacf9b']],
    ['GPTQModel', ['vintage_gpu_acceleration']],
    ['bitsandbytes', ['pytorch_memory']],
  ],
  e: [
    ['Jan', ['jan_ai']],
    ['GPT4All', ['desktop_ai']],
    ['AnythingLLM', ['document_chat']],
    ['Open WebUI', ['web_chat']],
    ['LibreChat', ['librechat']],
    ['Alpaca', ['alpaca']],
    ['KoboldCpp', ['koboldcpp']],
  ],
  f: [
    ['Aider', ['1990s_ai_programming']],
    ['Continue', ['af8b26cf']],
    ['Cline', ['software_box_for_ai_agent']],
    ['OpenHands', ['autonomous_deve']],
    ['Open Interpreter', ['open_interpreter']],
    ['Goose', ['desktop_automation']],
    ['MCP', ['mcp_software']],
    ['Langflow', ['langflow_software']],
    ['Pydantic AI', ['python_software_box']],
    ['smolagents', ['jewel_case_for_hugging_face']],
    ['LangGraph', ['langgraph']],
  ],
  g: [
    ['Qdrant', ['qdrant']],
    ['Milvus', ['milvus']],
    ['Weaviate', ['weaviate']],
    ['Chroma', ['product_photography_of_jewel_case']],
    ['pgvector', ['postgresql']],
    ['Haystack', ['haystack']],
    ['LlamaIndex', ['llamaindex']],
    ['Khoj', ['74334339']],
    ['Onyx', ['onyx_enterprise']],
    ['RAGFlow', ['rag_engine']],
    ['Docling', ['docling']],
    ['Marker', ['marker']],
  ],
  h: [
    ['Whisper', ['speech_recognition']],
    ['whisper.cpp', ['++_audio_software']],
    ['Faster-Whisper', ['7f4cfa8e']],
    ['Piper 1', ['piper_1']],
    ['Kokoro', ['de103dc1']],
    ['Coqui TTS', ['coqui_tts']],
    ['F5-TTS', ['voice_cloning']],
    ['Chatterbox', ['voice_software_box']],
    ['Silero VAD', ['silero_vad']],
    ['pyannote-audio', ['5afe28c5']],
    ['sherpa-onnx', ['sherpa']],
    ['Wyoming', ['voice_assistant_manual']],
    ['Home Assistant', ['home_assistant']],
  ],
  i: [
    ['ComfyUI-Manager', ['112393ff']],
    ['Stable Diffusion WebUI', ['198357bc']],
    ['InvokeAI', ['product_software_jewel_case_display']],
    ['Fooocus', ['1990s_ai_photo_studio']],
    ['FLUX.1', ['ec5950ba']],
    ['diffusers', ['pytorch_diffusion']],
    ['stable-diffusion.cpp', ['f11de9b1']],
    ['Krita AI Diffusion', ['671cda41']],
    ['Upscayl', ['upscayl']],
    ['Wan 2.2', ['871a75bf']],
    ['HunyuanVideo', ['product_photography_of_video_sof']],
    ['LTX-Video', ['d603670a']],
    ['FramePack', ['video_generator']],
    ['ComfyUI', ['62ae922e']],
  ],
  j: [
    ['nvtop', ['a65daf23']],
    ['gpustat', ['nvidia_gpu_status']],
    ['btop', ['linux_monitor']],
    ['Mission Center', ['51e91eeb']],
    ['lm-evaluation-harness', ['eleutherai']],
  ],
  k: [
    ['OWASP', ['owasp_genai']],
    ['promptfoo', ['e655d66d']],
    ['garak', ['vulnerability_scanner']],
    ['Purple Llama', ['b6dc213a']],
    ['Guardrails', ['c8a4abef']],
    ['Firejail', ['firejail']],
    ['Model Transparency', ['cryptographic']],
  ],
  l: [
    ['Transformers', ['hugging_face_software']],
    ['PEFT', ['peft']],
    ['Candle', ['candle']],
    ['Burn', ['rust_deep_learning']],
    ['Tauri', ['tauri']],
    ['llm', ['terminal_tool']],
    ['Ollama Python', ['python_library']],
    ['AI SDK', ['vercel']],
    ['Axolotl', ['axolotl']],
    ['Unsloth', ['a2168adf']],
    ['LLaMA-Factory', ['llama-factory']],
  ],
  m: [
    ['Ollama documentation', ['product_manual_with_llama']],
    ['vLLM documentation', ['server_deployment']],
    ['Hugging Face documentation', ['reference_manual_for_hugging_face']],
    ['r/LocalLLaMA', ['newsletter_binder']],
    ['Aprende Machine Learning', ['language_tutorial']],
  ],
};

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const scoreMatch = (itemN, keyN) => {
  if (!keyN) return 0;
  if (itemN === keyN) return 100;
  if (itemN.startsWith(keyN) || keyN.startsWith(itemN)) return 90;
  if (Math.max(keyN.length, 4) >= 5 && (itemN.includes(keyN) || keyN.includes(itemN))) return 70;
  return 0;
};

/** owner/repo de una URL de GitHub, o null */
export function ghRepo(url) {
  const m = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)/.exec(String(url || ''));
  if (!m) return null;
  return `${m[1]}/${m[2].replace(/\.git$/, '')}`;
}

/** Recursos por sección en orden: [{name, url}] */
function extractItems(md) {
  const out = {};
  let cur = null;
  for (const line of md.split('\n')) {
    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) {
      const sm = /^([A-M])\.\s+/.exec(h2[1].trim());
      cur = sm ? sm[1].toLowerCase() : null;
      if (cur && !out[cur]) out[cur] = [];
      continue;
    }
    if (cur) {
      const it = /^-\s+\[([^\]]+)\]\((https?:[^)\s]+)\)/.exec(line);
      if (it) out[cur].push({ name: it[1].trim(), url: it[2].trim() });
    }
  }
  return out;
}

const listDir = (rel) =>
  readdirSync(join(IMGROOT, rel))
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort()
    .map((f) => `images/${rel}/${f}`);

function buildSection(secKey, esItems, enItems, files) {
  const used = new Set();
  const unmatched = [];
  const hints = HINTS[secKey] || [];

  const cand = esItems.map((itemES, idx) => {
    const itemEN = enItems && enItems[idx] ? enItems[idx] : itemES;
    const nES = norm(itemES.name);
    const nEN = norm(itemEN.name);
    let subs = null;
    let best = 0;
    for (const [hintName, hintSubs] of hints) {
      const hN = norm(hintName);
      const s = Math.max(scoreMatch(nES, hN), scoreMatch(nEN, hN));
      if (s > best) { best = s; subs = hintSubs; }
    }
    return { names: [itemES.name, itemEN.name], url: itemES.url, subs, file: null };
  });

  // Pasada 1: hints (determinista, no roba ficheros)
  for (const c of cand) {
    if (!c.subs) continue;
    const f = files.find((f) => !used.has(f) && c.subs.every((sub) => f.toLowerCase().includes(sub.toLowerCase())));
    if (f) { c.file = f; used.add(f); }
  }
  // Pasada 2: autoasignación en orden para los restos
  for (const c of cand) {
    if (c.file) continue;
    const f = files.find((f) => !used.has(f)) || null;
    if (f) { c.file = f; used.add(f); unmatched.push(c.names[0]); }
  }
  return { entries: cand, unmatched, unused: files.filter((f) => !used.has(f)) };
}

/* ---------- stats de GitHub ---------- */

async function ghFetchApi(repo) {
  const headers = { 'user-agent': 'awesome-ia-local-linux-web', accept: 'application/vnd.github+json' };
  const token = ghAuthToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (res.status === 403 || res.status === 429) {
    throw Object.assign(new Error('rate-limited'), { code: 'RATE' });
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return { stars: j.stargazers_count || 0, forks: j.forks_count || 0, pushed: j.pushed_at || null, archived: !!j.archived };
}

function ghFetchCli(repo) {
  const out = execFileSync(
    'gh',
    ['api', `repos/${repo}`, '--jq', '{stars:.stargazers_count,forks:.forks_count,pushed:.pushed_at,archived:.archived}'],
    { encoding: 'utf8', timeout: 20000 },
  );
  const j = JSON.parse(out);
  return { stars: j.stars || 0, forks: j.forks || 0, pushed: j.pushed || null, archived: !!j.archived };
}

function seedStats() {
  const stats = {};
  if (!existsSync(SEED)) return stats;
  for (const line of readFileSync(SEED, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let r;
    try { r = JSON.parse(line); } catch { continue; }
    if (r.error || !r.repo || typeof r.stars !== 'number') continue;
    stats[r.repo] = {
      stars: r.stars, forks: null, pushed: r.pushed_at || null,
      archived: !!r.archived, fetchedAt: 'seed:2026-11-24 (verificación del repo)',
    };
  }
  return stats;
}

async function fetchGitHubStats(items) {
  const cachePath = join(DATA, 'github.json');
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : seedStats();
  const useToken = !!ghAuthToken();

  const repos = [...new Set(items.map((i) => ghRepo(i.url)).filter(Boolean))];
  let fetched = 0;
  let failed = 0;
  let rateLimited = false;
  const now = Date.now();

  process.stdout.write(`Stats de GitHub (${repos.length} repos; modo ${useToken ? 'API con token del entorno' : 'gh CLI / cache'})…\n`);

  for (const repo of repos) {
    if (rateLimited) break;
    const prev = cache[repo];
    if (prev && prev.fetchedAt && !String(prev.fetchedAt).startsWith('seed:') && now - new Date(prev.fetchedAt).getTime() < REFRESH_MS) {
      continue; // cache fresca (<12h)
    }
    try {
      const s = useToken ? await ghFetchApi(repo) : ghFetchCli(repo);
      cache[repo] = { ...s, fetchedAt: new Date().toISOString() };
      fetched++;
      await new Promise((r) => setTimeout(r, useToken ? 30 : 250));
    } catch (err) {
      if (err.code === 'RATE') {
        rateLimited = true;
        process.stdout.write('  rate limit alcanzado; el resto se toma de cache/semilla.\n');
        continue;
      }
      failed++;
      if (!prev) process.stdout.write(`  ${repo}: ${err.message}\n`);
    }
  }

  mkdirSync(DATA, { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  return { cache, fetched, failed, rateLimited, repos: repos.length };
}

async function fetchRemote(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'awesome-ia-local-linux-web-build' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function main() {
  let mdEs;
  let mdEn;
  let source;

  if (FETCH) {
    process.stdout.write(`Descargando READMEs de github.com/${REPO}@${BRANCH}…\n`);
    try {
      mdEs = await fetchRemote(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/README.md`);
      mdEn = await fetchRemote(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/README.en.md`);
      source = `github:${REPO}@${BRANCH}`;
    } catch (err) {
      process.stdout.write(`  sin acceso remoto (${err.message}); uso los ficheros locales del repo.\n`);
    }
  }
  if (!mdEs || !mdEn) {
    mdEs = readFileSync(join(ROOT, 'README.md'), 'utf8');
    mdEn = readFileSync(join(ROOT, 'README.en.md'), 'utf8');
    source = source || 'repo-local';
  }

  const esItems = extractItems(mdEs);
  const enItems = extractItems(mdEn);

  // Sanity: mismas secciones y mismos conteos ES/EN
  const secErr = [];
  for (const k of Object.keys(DIRS)) {
    if (!esItems[k]?.length) secErr.push(`sección ${k.toUpperCase()} sin recursos en ES`);
    else if (esItems[k].length !== enItems[k]?.length)
      secErr.push(`sección ${k.toUpperCase()}: ES=${esItems[k].length} ≠ EN=${enItems[k].length}`);
  }
  if (secErr.length) {
    console.error('ERROR de sincronización README ES/EN:');
    for (const e of secErr) console.error('  -', e);
    process.exit(1);
  }

  // Stats de GitHub (todas las URLs del README)
  const allItems = Object.values(esItems).flat();
  const gh = await fetchGitHubStats(allItems);

  // Mapa de imágenes + copia a public/
  rmSync(PUBIMG, { recursive: true, force: true });
  mkdirSync(PUBIMG, { recursive: true });
  const imageMap = {};
  let copied = 0;
  const noImage = [];
  const unusedAll = [];

  for (const [k, rel] of Object.entries(DIRS)) {
    const files = listDir(rel);
    mkdirSync(join(PUBIMG, rel), { recursive: true });
    for (const f of files) {
      copyFileSync(join(IMGROOT, rel, f.split('/').pop()), join(PUBIMG, rel, f.split('/').pop()));
      copied++;
    }
    const { entries, unmatched, unused } = buildSection(k, esItems[k], enItems[k], files);
    imageMap[k] = entries;
    for (const e of entries) if (!e.file) noImage.push(`${k.toUpperCase()}: ${e.names[0]}`);
    for (const u of unused) unusedAll.push(`${k.toUpperCase()}: ${u}`);
    if (unmatched.length) process.stdout.write(`  [${k.toUpperCase()}] autoasignadas: ${unmatched.join(', ')}\n`);
  }

  mkdirSync(DATA, { recursive: true });
  writeFileSync(join(DATA, 'readme-es.md'), mdEs);
  writeFileSync(join(DATA, 'readme-en.md'), mdEn);

  const totalItems = allItems.length;
  const withStats = allItems.filter((i) => gh.cache[ghRepo(i.url)]).length;
  const meta = {
    generatedAt: new Date().toISOString(),
    source,
    repo: REPO,
    branch: BRANCH,
    items: totalItems,
    sections: Object.keys(DIRS).length,
    images: { copied, withoutBoxArt: noImage.length },
    github: { repos: gh.repos, withStats, fetched: gh.fetched, failed: gh.failed, rateLimited: gh.rateLimited },
  };
  writeFileSync(join(DATA, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

  const js = `// AUTO-GENERADO por scripts/build-data.mjs — no editar a mano.
// Mapa recurso → box art. Cada entrada: { names: [ES, EN], url, file: 'images/…' | null }
export const IMAGE_MAP = ${JSON.stringify(imageMap, null, 0)};

export const META = ${JSON.stringify(meta, null, 0)};
`;
  writeFileSync(join(WEB, 'src', 'images.js'), js);

  const ghJs = `// AUTO-GENERADO por scripts/build-data.mjs — no editar a mano.
// Stats de GitHub por repo: { stars, forks, pushed, archived, fetchedAt }
export const GH_STATS = ${JSON.stringify(gh.cache, null, 0)};

export const GH_META = ${JSON.stringify({ fetchedAt: meta.generatedAt, withStats, fetched: gh.fetched, failed: gh.failed, rateLimited: gh.rateLimited }, null, 0)};
`;
  writeFileSync(join(WEB, 'src', 'github-data.js'), ghJs);

  process.stdout.write(`\nDatos OK (${source}) · ${meta.generatedAt}\n`);
  process.stdout.write(`  recursos: ${totalItems} · secciones: ${meta.sections}\n`);
  process.stdout.write(`  imágenes copiadas: ${copied}\n`);
  process.stdout.write(`  stats GitHub: ${withStats}/${totalItems} recursos (fetched ${gh.fetched}, fallos ${gh.failed}${gh.rateLimited ? ', RATE LIMIT' : ''})\n`);
  if (noImage.length) process.stdout.write(`  sin box art (usarán la caja genérica): ${noImage.join(', ')}\n`);
  if (unusedAll.length) process.stdout.write(`  imágenes sin usar: ${unusedAll.join(', ')}\n`);
}

// Solo ejecuta el build cuando el script se invoca directamente (no al importarlo en tests).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

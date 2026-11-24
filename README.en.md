<div align="center">

[![Awesome Local AI on Linux](website/src/assets/banner.jpg)](README.md)

# Awesome Local AI on Linux

A curated collection of tools, models, runtimes, applications and resources for running, developing and securing local AI systems on Linux.

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![Link check](https://github.com/marrionesa/awesome-ia-local-linux/actions/workflows/link-check.yml/badge.svg)](https://github.com/marrionesa/awesome-ia-local-linux/actions/workflows/link-check.yml)

[Contributing](CONTRIBUTING.md) · [Web catalogue](website/README.md) · [Report a broken link](.github/ISSUE_TEMPLATE/report-broken-link.yml)

</div>

---

## Introduction

Running an LLM on your own machine is no longer the hard part. The hard part is knowing **which tool to pick, what license it carries and whether it will still be maintained in six months**. That is what this list is for: every entry was verified against its official source on **November 24, 2026** (active or reference-status project, declared license, real documentation, documented Linux support), and the collection covers the whole local-AI journey: runtimes, serving, open models, desktop apps, agents and MCP, RAG, voice, image and video, monitoring, security and development.

Nothing gets in by popularity. Archived projects are labelled as such instead of silently vanishing; rejected candidates are recorded with their reason; and every entry declares its license before you adopt anything. The result is a **bilingual (EN/ES)**, independently maintained catalogue published under **CC0-1.0**: copy it, reuse it and remix it without asking permission.

## Project philosophy

| Principle                | What it means                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify, then list        | No entry gets in by popularity or padding: we check that the project exists, that its license is identifiable and that its official documentation is real. What we could not verify is not here.                    |
| Local means local        | Only tools that run or manage models on your machine or your network belong here. Cloud services are mentioned only as contrast, never as recommendations.                                                          |
| Linux first              | Everything listed works on Linux natively or with documented support; compatibility notes (CUDA, ROCm, Vulkan, CPU) come from each project's official documentation, never from guesses.                            |
| Label, don't erase       | An archived project that is still the reference in its niche does not vanish from the list: it is marked as archived and, when one exists, its successor is noted. The history of the ecosystem is information too. |
| A license on every entry | Knowing what you can do with a tool before adopting it is part of this list's value: every entry declares its SPDX license or its proprietary status.                                                               |
| Bilingual by design      | The Spanish README carries exactly the same selection and both are kept in sync; neither version is a second-class citizen.                                                                                         |
| Independent              | A curation project maintained by [Mario R.](https://github.com/marrionesa), with no affiliation to any operating system, vendor or company.                                                                         |

## Who this list is for

This list is for people who want to **run LLMs locally** for privacy, cost or data sovereignty; people **building** AI applications who need inference servers, OpenAI-compatible APIs or libraries for their language; people **administering** Linux workstations or servers with GPUs who want to monitor, secure and automate; and people working with **speech, image or video** without depending on external services.

## Where to start

| If you want to…                                 | Start with                                    |
| ----------------------------------------------- | --------------------------------------------- |
| Chat with local models today, no fuss           | `Ollama` or `Jan`                             |
| Serve models with an OpenAI-compatible API      | `Ollama`, `LocalAI` or `llama-cpp-python`     |
| Maximum throughput on GPU servers               | `vLLM` or `SGLang`                            |
| Try models on CPU, no dedicated GPU             | `llama.cpp` or `llamafile`                    |
| Transcribe or synthesize speech locally         | `whisper.cpp` and `Piper`                     |
| Generate images or video                        | `ComfyUI` or `diffusers`                      |
| Build an assistant or agent over your documents | `MCP servers` and the `RAG` section           |
| Know the license before adopting anything       | Every entry states its license in parentheses |

## A. Local LLM Runtimes

Engines that run language models on your own hardware: from a single CLI to multi-model platforms.

- [Ollama](https://github.com/ollama/ollama) - The fastest way to get started with local models: simple CLI, OpenAI-compatible API, built-in model management. (MIT) `[CUDA] [ROCm] [Vulkan] [CPU]`.
- [llama.cpp](https://github.com/ggml-org/llama.cpp) - LLM inference in C/C++ with no heavy dependencies; the reference GGUF engine behind dozens of interfaces. (MIT) `[CUDA] [ROCm] [Vulkan] [CPU]`.
- [vLLM](https://github.com/vllm-project/vllm) - High-throughput GPU inference and serving engine with PagedAttention and continuous batching; the de facto standard on servers. (Apache-2.0) `[CUDA] [ROCm] [CPU]`.
- [SGLang](https://github.com/sgl-project/sglang) - Serving for LLMs and multimodal models with structured execution and a very aggressive prefix cache; a direct alternative to vLLM. (Apache-2.0) `[CUDA] [ROCm] [CPU]`.
- [LocalAI](https://github.com/mudler/LocalAI) - Local drop-in replacement for the OpenAI API serving text, audio, image and multimodal models from your own machine. (MIT) `[CUDA] [CPU]`.
- [llamafile](https://github.com/Mozilla-Ocho/llamafile) - Packages model and runtime into a single cross-platform executable; run LLMs with a double click, even from a USB stick. (Apache-2.0) `[CPU] [CUDA]`.
- [MLC LLM](https://github.com/mlc-ai/mlc-llm) - Universal deployment engine based on ML compilation; compiles models for GPUs, CPUs and browsers. (Apache-2.0) `[CUDA] [Vulkan] [ROCm] [CPU]`.
- [gemma.cpp](https://github.com/google/gemma.cpp) - Lightweight, standalone C++ inference engine for the Gemma family; useful for studying and modifying the runtime. (Apache-2.0) `[CPU]`.
- [mistral.rs](https://github.com/EricLBuehler/mistral.rs) - LLM inference in Rust with an OpenAI-compatible API and quantization support; a solid choice if you prefer Rust. (MIT) `[CUDA] [CPU]`.
## B. Model Servers & Inference

The serving layer: dedicated servers, gateways and language bindings that expose models over HTTP.

- [LM Studio](https://lmstudio.ai/) - Desktop application to discover, download and serve local models with an OpenAI-compatible API server. (Proprietary, free of charge) `[CUDA] [Vulkan] [CPU]` · [Linux download](https://lmstudio.ai/download)
- [NVIDIA Triton Inference Server](https://github.com/triton-inference-server/server) - Production inference server for multiple backends and frameworks, with dynamic batching and metrics. (BSD-3-Clause) `[CUDA] [CPU]`.
- [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) - NVIDIA library to optimize and serve LLMs on NVIDIA GPUs with TensorRT kernels. (Apache-2.0) `[CUDA]`.
- [OpenVINO](https://github.com/openvinotoolkit/openvino) - Intel toolkit to optimize and deploy inference on CPUs, integrated GPUs and Intel NPUs. (Apache-2.0) `[CPU] [Intel GPU]`.
- [LiteLLM](https://github.com/BerriAI/litellm) - Unified gateway to 100+ LLM APIs in OpenAI format, with key management, budgets and routing; Rust core. (Apache-2.0 with a commercial enterprise directory)
- [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) - Python bindings for llama.cpp with an OpenAI-compatible web server; the classic glue of many local projects. (MIT) `[CUDA] [Vulkan] [CPU]`.
> Note: [Text Generation Inference](https://github.com/huggingface/text-generation-inference) (Apache-2.0), Hugging Face's inference server, was **archived by its maintainers** in 2026; it remains available as a historical reference, but we recommend evaluating the active runtimes in section A.

## C. Open Models

Model families with public weights. Distinguishes provider, official repository and usage terms; each family's canonical repository links to the downloads.

- [Qwen3](https://github.com/QwenLM/Qwen3) - Open model family from Alibaba Cloud, from 0.6B to 235B, with reasoning variants; official repository with the technical report. (Apache-2.0 for the weights) · [Hugging Face organization](https://huggingface.co/QwenLM)
- [Llama](https://github.com/meta-llama/llama-models) - Open model family from Meta; the repository centralizes utilities and official download links. (Llama Community License, with its own conditions)
- [Gemma](https://github.com/google-deepmind/gemma) - Open model family from Google DeepMind under the Gemma Terms of Use; official family repository. (Gemma Terms)
- [Mistral AI](https://huggingface.co/mistralai) - Official download organization for Mistral models (Mistral Small, Ministral, DevStral…); reference code lives in [mistral-src](https://github.com/mistralai/mistral-src), archived in 2026. (Apache-2.0 for most weights)
- [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) - Open MoE model from DeepSeek (671B total, ~37B active); official weights and technical report. (MIT)
- [DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1) - Open reasoning model from DeepSeek derived from the V3 line; official weights and benchmarks. (MIT)
- [gpt-oss](https://github.com/openai/gpt-oss) - OpenAI's first open-weight models (120B and 20B), tuned to run on consumer hardware. (Apache-2.0)
- [Phi Cookbook](https://github.com/microsoft/PhiCookBook) - Official guides and samples for Microsoft's Phi family of small models. (MIT)
- [SmolLM / SmolVLM](https://github.com/huggingface/smollm) - Hugging Face's family of small models designed for laptops and modest machines, with training recipes. (Apache-2.0)

## D. GPU, Hardware & Acceleration

Vendor documentation, tensor libraries, weight formats and quantization tools: what decides whether a model fits and how fast it runs.

- [CUDA Toolkit — official documentation](https://docs.nvidia.com/cuda/) - NVIDIA's installation and development guides for Linux; the starting point for any NVIDIA GPU stack.
- [ROCm (TheRock)](https://github.com/ROCm/TheRock) - Current development home of AMD's compute platform; the old central repository [ROCm/ROCm](https://github.com/ROCm/ROCm) is archived. (MIT) · [Official documentation](https://rocm.docs.amd.com/)
- [Vulkan-Docs](https://github.com/KhronosGroup/Vulkan-Docs) - Official Vulkan specification, the vendor-neutral GPU backend used by llama.cpp and other runtimes to run on AMD/Intel/NVIDIA GPUs without CUDA or ROCm. (CC-BY-4.0)
- [GGML](https://github.com/ggml-org/ggml) - The C tensor library behind llama.cpp; internal documentation on format and CPU/GPU execution. (MIT)
- [GGUF specification](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md) - Official document for the GGUF file format (quantized weights + metadata), the de facto standard of local AI.
- [safetensors](https://github.com/huggingface/safetensors) - Fast, safe tensor storage format, standard on Hugging Face; avoids arbitrary code execution when loading pickles. (Apache-2.0)
- [ExLlamaV3](https://github.com/turboderp-org/exllamav3) - Inference and quantization engine optimized for consumer GPUs; the active successor of ExLlamaV2. (MIT) `[CUDA]`.
- [LLM Compressor](https://github.com/vllm-project/llm-compressor) - Compression and quantization suite from the vLLM ecosystem (FP8, INT8, GPTQ, sparse) for serving compressed models. (Apache-2.0)
- [GPTQModel](https://github.com/ModelCloud/GPTQModel) - GPTQ quantization toolkit with hardware acceleration and deployment support in vLLM/SGLang. (Apache-2.0) `[CUDA]`.
- [bitsandbytes](https://github.com/bitsandbytes-foundation/bitsandbytes) - Accessible k-bit quantization for PyTorch (8-bit, 4-bit); a staple of consumer-GPU fine-tuning. (MIT) `[CUDA]`.
> Note: [IPEX-LLM](https://github.com/intel/ipex-llm) (Apache-2.0), the LLM acceleration library for Intel hardware, was **archived** in 2026; for recent Intel hardware, OpenVINO (section B) is the maintained path.

## E. Linux Desktop AI

Graphical applications to chat, manage models and integrate AI into the Linux desktop.

- [Jan](https://github.com/menloresearch/jan) - Open source AI assistant that works 100% offline, with model management and a local API server. (Apache-2.0)
- [GPT4All](https://github.com/nomic-ai/gpt4all) - Desktop client to run local LLMs on modest machines; flagship project whose development pace has slowed in 2026. (MIT)
- [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) - All-in-one app to chat with your documents: agents, built-in RAG and multi-user, on desktop or server. (MIT)
- [Open WebUI](https://github.com/open-webui/open-webui) - Feature-rich self-hosted web UI for Ollama and OpenAI-compatible APIs, with users, RAG and tools. (Custom license with brand exceptions for large deployments)
- [LibreChat](https://github.com/danny-avila/LibreChat) - Self-hosted multi-model chat client (local and remote) with agents, search and MCP. (MIT)
- [Alpaca](https://github.com/jeffser/Alpaca) - Native GNOME (GTK) AI client with support for Ollama and other local providers; the most desktop-integrated option on Linux. (GPL-3.0)
- [KoboldCpp](https://github.com/LostRuins/koboldcpp) - Single executable based on llama.cpp to run GGUF models with the KoboldAI UI; popular for interactive storytelling. (AGPL-3.0) `[CUDA] [Vulkan] [CPU]`.
## F. AI Agents & Automation

Coding agents, tool protocols (MCP) and orchestration frameworks that work against local models.

- [Aider](https://github.com/Aider-AI/aider) - AI pair programming in your terminal: edits the repository with diffs and makes sensible commits. (Apache-2.0)
- [Continue](https://github.com/continuedev/continue) - Open source coding agent as an IDE extension and CLI, connectable to local models via Ollama or LM Studio. (Apache-2.0)
- [Cline](https://github.com/cline/cline) - Autonomous development agent as an SDK, IDE extension and CLI; works against local or remote APIs. (Apache-2.0)
- [OpenHands](https://github.com/All-Hands-AI/OpenHands) - Development agent platform with its own sandbox: writes code, runs commands and browses. (MIT)
- [Open Interpreter](https://github.com/openinterpreter/open-interpreter) - Agent that runs code on your machine from natural language, compatible with local models. (Apache-2.0)
- [Goose](https://github.com/block/goose) - Extensible open source agent from Block for desktop and terminal automation, with MCP support. (Apache-2.0)
- [MCP — reference servers](https://github.com/modelcontextprotocol/servers) - Official reference servers of the Model Context Protocol, the standard for connecting agents to tools and data; the project is migrating from MIT to Apache-2.0. (MIT → Apache-2.0)
- [Langflow](https://github.com/langflow-ai/langflow) - Visual builder for Python agents and workflows, deployable locally and connected to Ollama and other backends. (MIT)
- [Pydantic AI](https://github.com/pydantic/pydantic-ai) - Python agent framework with type validation and dependency injection; ideal for serious apps on local models. (MIT)
- [smolagents](https://github.com/huggingface/smolagents) - Hugging Face's minimalist agent library that reasons by writing code; light and easy to audit. (Apache-2.0)
- [LangGraph](https://github.com/langchain-ai/langgraph) - Build stateful agents and cyclic workflows, from the LangChain family; the base of many multi-agent systems. (MIT)

## G. RAG & Knowledge Systems

Vector databases, indexing frameworks and retrieval pipelines for building local second brains.

- [Qdrant](https://github.com/qdrant/qdrant) - High-performance vector database written in Rust, deployable in a container or embedded. (Apache-2.0)
- [Milvus](https://github.com/milvus-io/milvus) - Cloud-native vector database for large scale, with varied indexes and distributed operations. (Apache-2.0)
- [Weaviate](https://github.com/weaviate/weaviate) - Vector database with hybrid search and vectorization modules; dual BSD-3-Clause / Weaviate License depending on component. (Dual BSD-3-Clause / Weaviate)
- [Chroma](https://github.com/chroma-core/chroma) - Developer-first embedded vector database: running in seconds, scaling when needed. (Apache-2.0)
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search as a PostgreSQL extension; reuses infrastructure you already know. (PostgreSQL License)
- [Haystack](https://github.com/deepset-ai/haystack) - Orchestration framework for building RAG applications and agents with declarative pipelines. (Apache-2.0)
- [LlamaIndex](https://github.com/run-llama/llama_index) - Framework for document ingestion, indexing and querying; the usual starting point for RAG with local models. (MIT)
- [Khoj](https://github.com/khoj-ai/khoj) - Self-hostable second brain: search your documents and the web from a web UI or the terminal. (AGPL-3.0)
- [Onyx](https://github.com/onyx-dot-app/onyx) - AI chat platform connected to a company's sources (connectors, RAG, agents); self-hosted. (Apache-2.0 with enterprise exceptions)
- [RAGFlow](https://github.com/infiniflow/ragflow) - RAG engine with deep document understanding and traceable citation, for serious local deployments. (Apache-2.0)
- [Docling](https://github.com/docling-project/docling) - Converts PDF, Office and images into structured data ready for RAG; high-quality local parsing. (MIT)
- [Marker](https://github.com/VikParuchuri/marker) - Converts PDF to Markdown and JSON with high accuracy, preserving tables, formulas and page layout; ideal to feed RAG with real documents. (Apache-2.0) `[CUDA] [CPU]`.
## H. Voice

Recognition, synthesis, diarization and complete voice assistants that work without the cloud.

- [Whisper](https://github.com/openai/whisper) - OpenAI's speech recognition model, robust across many languages; the reference for local STT. (MIT) `[CPU] [CUDA]`.
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) - C/C++ port of Whisper with quantization and many bindings; runs on modest CPUs and even the Raspberry Pi. (MIT) `[CPU] [CUDA] [Vulkan]`.
- [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper) - Whisper reimplementation on CTranslate2: up to 4× faster with less memory. (MIT) `[CPU] [CUDA]`.
- [Piper 1](https://github.com/OHF-voice/piper1-gpl) - Fast, local neural TTS engine, actively maintained by the community (successor of the [original Piper](https://github.com/rhasspy/piper), archived). (GPL-3.0) `[CPU]`.
- [Kokoro](https://github.com/hexgrad/kokoro) - Surprisingly competent TTS model for its size (82M), ideal for low-latency local voice. (Apache-2.0) `[CPU]`.
- [Coqui TTS (community maintenance)](https://github.com/idiap/coqui-ai-TTS) - Text-to-speech toolkit of the Coqui line, maintained by the community after the company shut down (the [original repository](https://github.com/coqui-ai/TTS) has been inactive for years). (MPL-2.0)
- [F5-TTS](https://github.com/SWivid/F5-TTS) - Voice-cloning TTS with fluent generation and official code; strong on Chinese and English. (MIT) `[CUDA] [CPU]`.
- [Chatterbox](https://github.com/resemble-ai/chatterbox) - Open source TTS from Resemble AI with emotion control and voice cloning, with reference models published. (MIT) `[CUDA]`.
- [Silero VAD](https://github.com/snakers4/silero-vad) - Pretrained voice activity detector with enterprise-grade accuracy and minimal latency; a key piece of voice pipelines. (MIT) `[CPU]`.
- [pyannote-audio](https://github.com/pyannote/pyannote-audio) - State-of-the-art speaker diarization and segmentation, useful for multi-speaker transcriptions. (MIT) `[CUDA] [CPU]`.
- [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) - Offline STT, TTS, diarization and speech enhancement on ONNX, with binaries for Linux, Android and embedded. (Apache-2.0) `[CPU]`.
- [Wyoming](https://github.com/rhasspy/wyoming) - Peer-to-peer protocol for modular voice assistants from the Rhasspy ecosystem (the remote satellite [wyoming-satellite](https://github.com/rhasspy/wyoming-satellite) is archived but remains the reference for the pattern). (MIT)
- [Home Assistant](https://github.com/home-assistant/core) - Home automation platform with a 100% local voice assistant (wake word, STT, TTS and LLM on your network); the integrator for everything above. (Apache-2.0)

## I. Image, Video & Creative AI

Local image and video generation and editing: interfaces, libraries and models.

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Node-based interface and backend for diffusion; the standard for reproducible image and video pipelines. (GPL-3.0) `[CUDA] [ROCm] [CPU]`.
- [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager) - Must-have extension to install and manage ComfyUI nodes and models without breaking things. (GPL-3.0)
- [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - The classic Stable Diffusion web UI; development has slowed in 2025–2026, but it remains the best documented. (AGPL-3.0) `[CUDA]`.
- [InvokeAI](https://github.com/invoke-ai/InvokeAI) - Professional creative engine with canvas, inpainting and asset organization; built for real art workflows. (Apache-2.0) `[CUDA] [ROCm] [CPU]`.
- [Fooocus](https://github.com/lllyasviel/Fooocus) - Image generation simplified Midjourney-style; the project has not seen active maintenance since 2025. (GPL-3.0) `[CUDA]`.
- [FLUX.1](https://github.com/black-forest-labs/flux) - Official repository of the FLUX.1 model family from Black Forest Labs (weights and demos). (Apache-2.0 for FLUX.1-schnell) `[CUDA]`.
- [diffusers](https://github.com/huggingface/diffusers) - Hugging Face's reference library for diffusion: image, video and audio with PyTorch; the foundation of most of the above. (Apache-2.0) `[CUDA] [ROCm] [CPU]`.
- [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) - Diffusion inference in pure C/C++ with GGUF: generate images on CPU and various GPUs via Vulkan/CUDA. (MIT) `[CUDA] [Vulkan] [CPU]`.
- [Krita AI Diffusion](https://github.com/Acly/krita-ai-diffusion) - Diffusion plugin integrated into Krita with inpaint, outpaint and layer control; a real illustration workflow. (GPL-3.0) `[CUDA]`.
- [Upscayl](https://github.com/upscayl/upscayl) - Free and open source AI image upscaler, native on Linux (Electron + real-esrgan models). (AGPL-3.0) `[Vulkan] [CPU]`.
- [Wan 2.2](https://github.com/Wan-Video/Wan2.2) - Open video generation model family from Alibaba; official weights and code. (Apache-2.0) `[CUDA]`.
- [HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo) - Video generation model from Tencent with open code and weights; the community license excludes the EU, the UK and South Korea. (Hunyuan Community License, with territorial restrictions) `[CUDA]`.
- [LTX-Video](https://github.com/Lightricks/LTX-Video) - Real-time video model from Lightricks, fast for its size and with a ComfyUI ecosystem. (Apache-2.0) `[CUDA]`.
- [FramePack](https://github.com/lllyasviel/FramePack) - The FramePack approach to practical video diffusion on consumer GPUs with limited memory. (Apache-2.0) `[CUDA]`.
## J. Monitoring & Performance

Hardware and inference observability: GPUs, VRAM, system and benchmarks.

- [nvtop](https://github.com/Syllo/nvtop) - `htop`-style GPU process monitor for NVIDIA, AMD, Intel and more; essential to watch VRAM in real time. (GPL-3.0)
- [gpustat](https://github.com/wookayin/gpustat) - One-line NVIDIA GPU status summary, ideal for scripts and dashboards. (MIT) `[CUDA]`.
- [btop](https://github.com/aristocratos/btop) - System resource monitor (CPU, memory, network, disks) with an excellent TUI. (Apache-2.0) `[CPU]`.
- [Mission Center](https://gitlab.com/mission-center-devs/mission-center) - GNOME-style graphical system monitor with GPU support; canonical project hosted on GitLab. (GPL-3.0)
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) - EleutherAI's framework to evaluate LLMs on dozens of tasks; the serious way to compare models on your hardware. (MIT)

## K. Security, Privacy & Hardening

Evaluate, isolate and protect: from model red teaming to sandboxing local execution.

- [OWASP GenAI — Top 10 for LLM Applications](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10) - The reference risk catalog for LLM apps (2026 edition); required reading before exposing anything. (OWASP content, documentation)
- [promptfoo](https://github.com/promptfoo/promptfoo) - Testing, evaluation and red teaming of prompts, agents and RAG; integrates into CI. (MIT)
- [garak](https://github.com/NVIDIA/garak) - NVIDIA's LLM vulnerability scanner: probes jailbreaks, leaks and hallucinations. (Apache-2.0)
- [Purple Llama](https://github.com/meta-llama/PurpleLlama) - Meta's LLM security tools (Llama Guard, CyberSecEval); useful to filter inputs and outputs of local models. (Llama Community License)
- [Guardrails](https://github.com/guardrails-ai/guardrails) - Validation and correction of LLM outputs against schemas and rules. (Apache-2.0)
- [Firejail](https://github.com/netblue30/firejail) - SUID sandbox for Linux applications; a simple way to isolate desktop AI tools from your data. (GPL-2.0)
- [Podman](https://github.com/containers/podman) - Daemonless, rootless containers to isolate inference servers and RAG pipelines. (Apache-2.0)
- [Model Transparency (Sigstore)](https://github.com/sigstore/model-transparency) - Signing and verification of ML model provenance; the open source answer to supply-chain risk in weights and checkpoints. (Apache-2.0)

> Note: [LLM Guard](https://github.com/protectai/llm-guard) (MIT), the filtering toolkit for LLMs, was **archived** in 2026; for active filtering see Guardrails and the other tools in this section.

## L. Developer Ecosystem

Libraries and SDKs to build your own local layer: Python, Rust, TypeScript and fine-tuning tools.

- [Transformers](https://github.com/huggingface/transformers) - Hugging Face's model framework: load, run and train practically any open model. (Apache-2.0)
- [PEFT](https://github.com/huggingface/peft) - Parameter-efficient fine-tuning (LoRA and friends) to adapt large models on small hardware. (Apache-2.0) `[CUDA]`.
- [Candle](https://github.com/huggingface/candle) - Minimalist ML framework in Rust with inference for many open models; light and easy to embed in apps. (Apache-2.0)
- [Burn](https://github.com/tracel-ai/burn) - Deep learning framework in Rust with flexible GPU/CPU backends, built for production. (Apache-2.0)
- [Tauri](https://github.com/tauri-apps/tauri) - Framework for building small, secure desktop apps; a common pairing with local runtimes to create native AI clients on Linux. (Apache-2.0/MIT)
- [llm (Simon Willison's CLI)](https://github.com/simonw/llm) - CLI to query local and remote LLMs with a plugin system; the Swiss army knife for the terminal. (Apache-2.0)
- [Ollama Python](https://github.com/ollama/ollama-python) - Official Python client for the Ollama API. (MIT)
- [AI SDK (Vercel)](https://github.com/vercel/ai) - TypeScript toolkit for building LLM apps, compatible with local providers via the OpenAI API. (Apache-2.0)
- [Axolotl](https://github.com/axolotl-ai-cloud/axolotl) - LLM fine-tuning with YAML recipes; widely used to tune models on a single GPU. (Apache-2.0) `[CUDA]`.
- [Unsloth](https://github.com/unslothai/unsloth) - Accelerated local fine-tuning and inference (up to 2× faster with less VRAM) for GGUF and diffusion models. (Apache-2.0) `[CUDA]`.
- [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) - Unified fine-tuning of 100+ LLM and VLM models with a built-in web UI. (Apache-2.0) `[CUDA]`.
## M. Tutorials & Documentation

Official documentation and community: the right source before any third-party tutorial.

- [Ollama documentation](https://docs.ollama.com/) - Official guides for Linux installation, the API, GGUF import and settings.
- [vLLM documentation](https://docs.vllm.ai/) - Deployment, quantization, parallelism and serving optimization.
- [Hugging Face documentation](https://huggingface.co/docs) - Complete reference for Transformers, diffusers, PEFT and the rest of the ecosystem, with step-by-step tutorials.
- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/) - The most active community on local AI: real benchmarks, hardware guides and daily news. (Community)
- [Aprende Machine Learning — local LLM guide (ES)](https://www.aprendemachinelearning.com/instalar-un-modelo-de-lenguaje-en-tu-ordenador-llm-local-llama) - Step-by-step Spanish tutorial to install and use a local LLM. (Spanish-language blog)

## Inclusion criteria

A resource joins this list when it meets **all** of these conditions:

| Criterion                      | Requirement                                                                                                       |                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Works on Linux                 | Natively or with officially documented support.                                                                   |                                                                                                                                                                                                                                                                                                                                                                |
| Verified official source       | The URL points to the project's canonical repository, website or documentation.                                   |                                                                                                                                                                                                                                                                                                                                                                |
| Identifiable, declared license | Open source with a recognized license, or proprietary clearly labeled as such.                                    |                                                                                                                                                                                                                                                                                                                                                                |
| Reasonable activity or status  | Actively developed, or explicitly marked as archived or unmaintained when it is still the reference in its niche. |                                                                                                                                                                                                                                                                                                                                                                |
| Official documentation         | Available for installation and usage.                                                                             |                                                                                                                                                                                                                                                                                                                                                                |
| Differentiated value           | Nothing gets in "for popularity"; every entry fills a gap the others do not.                                      | What we **do not** accept: abandoned projects with no reference status, functional duplicates, aggregator pages without editorial criteria, cloud services without a local component, and any resource whose nature we cannot verify from its official source. The detailed process and how to propose changes live in `CONTRIBUTING.md`.md](CONTRIBUTING.md). |

## Maintenance status and notices

The last bulk check of links, licenses and activity ran on **November 24, 2026**. Archived or unmaintained projects that remain in the list for their relevance carry the corresponding annotation in their entry: we do not erase history, we label it. Links are re-checked with lychee in CI and with `scripts/validate.js` locally; if you spot a broken one, open a report using the "Broken link" template. Licenses shown are those **declared by each project** in its repository as of the verification date; for any serious use, read the license text at the source.

## Web catalogue

This list ships with its own **retro-90s website**: a browsable catalogue generated directly from this README — the single source of truth — presenting every resource as a software box with live GitHub stats (stars, activity, archived status). Data is always fresh: the site loads the README live from GitHub (with a jsDelivr fallback and the latest build snapshot); edit the README, push, and the site updates itself. Source code lives in `website/` (see `website/README.md`), automatically deployed to GitHub Pages by the `deploy-web.yml` workflow on every push to `main`. Same **CC0-1.0** license and same categories; no backend and no cookies: everything renders in your browser.

## Related lists

Awesome lists with partial overlap. None covers the same niche with the same criteria (Linux + license verification + maintenance status), but all of them are useful:

- [awesome-local-llms](https://github.com/vince-lam/awesome-local-llms) - Comparison of compatible open source projects for building with local LLMs. (MIT)
- [Awesome-LLM](https://github.com/Hannibal046/Awesome-LLM) - Broad collection of LLM papers, models and frameworks, without a Linux focus. (CC0-1.0)
- [awesome-local-llm](https://github.com/rafska/awesome-local-llm) - List of platforms and tools to run LLMs locally. (MIT)
- [awesome-selfhosted-ai](https://github.com/glincker/awesome-selfhosted-ai) - Self-hosted AI projects with weekly automated link checking; server-focused, not desktop. (CC0-1.0)

## Contributing

Contributions are welcome and follow a simple process:

1. Read `CONTRIBUTING.md` - it explains the requirements, how to verify links and how to write descriptions.
2. Open an issue with the "Add resource" template (`.github/ISSUE_TEMPLATE/add-resource.yml`) or send a direct PR.
3. If you touch the README, remember to update **both languages** and run `node scripts/validate.js` before submitting.
4. Code of conduct: this project uses the Contributor Covenant (`CODE_OF_CONDUCT.md`).

## Acknowledgements

- sindresorhus/awesome and its community, for the quality conventions of Awesome lists.
- The maintainers and communities of every linked project: this list only points the way; the real work is theirs.
- The r/LocalLLaMA community, whose constant discussion makes visible what works and what gets abandoned.

## License

This list is published under **[CC0-1.0](LICENSE)** (public domain to the extent permitted by law): copy, reuse and remix it without asking permission. The rationale for this choice is documented in [docs/research/RESEARCH.md](docs/research/RESEARCH.md).

**Notice**: this repository claims no rights over the software, models or content it links to; every cited work keeps its own license and its own authors.

---

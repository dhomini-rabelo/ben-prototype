# Recon: documentação oficial do modelo GPT-5.6 Luna

**URL alvo:** https://developers.openai.com/api/docs/models/gpt-5.6-luna
**Método:** WebFetch (2 chamadas) na URL alvo + WebSearch de confirmação cruzada (OpenRouter, AWS Bedrock model card, Artificial Analysis, OpenAI blog, CometAPI).
**Aviso de premissa:** este modelo (GPT-5.6, lançado em 09/07/2026) é posterior ao meu knowledge cutoff (jan/2026). Não tenho conhecimento prévio dele — tudo abaixo vem exclusivamente das ferramentas WebFetch/WebSearch chamadas nesta tarefa, não da minha memória. Não fiz nenhuma chamada autenticada à API da OpenAI para validar; isso é apenas leitura da doc pública e de fontes terceiras que a espelham.

## 1. ID exato do modelo e snapshots

- ID literal a usar na API: `gpt-5.6-luna`
- A página não lista snapshots datados (ex.: `gpt-5.6-luna-2026-XX-XX`) — aparentemente só existe o alias único `gpt-5.6-luna`.
- Contexto da família: `gpt-5.6-sol` (= alias de `gpt-5.6`), `gpt-5.6-terra`, `gpt-5.6-luna` (a mais barata/rápida, equivalente ao tier "nano" de gerações anteriores).

## 2. A página existe?

**Sim, respondeu com conteúdo (não é 404).** O WebFetch retornou uma página estruturada com "GPT-5.6 Luna Model Facts", confirmada de forma cruzada por: OpenRouter (`openrouter.ai/openai/gpt-5.6-luna`), AWS Bedrock model card, Artificial Analysis, OpenAI blog (`openai.com/index/gpt-5-6/`) e CometAPI. Não consegui inspecionar o HTML bruto/status HTTP diretamente (WebFetch abstrai isso); a evidência de existência é o conteúdo consistente retornado + múltiplas fontes terceiras independentes confirmando o mesmo model ID e specs.

## 3. Endpoint suportado

- **Chat Completions:** suportado
- **Responses:** suportado
- **Batch:** suportado
- Não suportado: Live sessions, Realtime, Assistants, Fine-tuning, Embeddings, Image generation, Videos, Speech generation, Transcription, Moderation, e o endpoint legado `Completions` (não confundir com Chat Completions).
- **Não identifiquei diferença de endpoint em relação ao uso atual do projeto** — não fiz essa comparação porque não tenho acesso ao código do projeto nesta tarefa (sou read-only e escopado só à doc externa). Isso fica para quem for aplicar a mudança comparar com o que `ben-prototype` já usa hoje.

## 4. Parâmetros suportados / não suportados

**Confirmados como suportados pela página:**
- `streaming`
- `structured_outputs` (structured outputs / response_format com JSON schema)
- `function_calling` (tools/tool_choice)
- `file_search`
- `image_input`
- `web_search`
- `prompt_caching`
- `reasoning_effort` — valores aceitos: **none, low, medium (default), high, xhigh, max**

**NÃO CONSEGUI CONFIRMAR** (a página não documenta explicitamente, apesar de segunda tentativa de extração dirigida):
- `temperature` — não mencionado
- `top_p` — não mencionado
- `max_tokens` vs `max_completion_tokens` vs `max_output_tokens` — não mencionado qual nome de parâmetro é aceito; a página só dá o limite numérico (ver seção 5), não o nome do campo
- `verbosity` — não mencionado
- `presence_penalty` / `frequency_penalty` — não mencionados
- `logprobs` — não mencionado

Marca explícita: isso **não é "não suportado"**, é "a doc não declarou" — não deve ser tratado como confirmação de ausência. Quem for implementar precisa testar empiricamente ou achar uma referência mais detalhada (ex.: página de parâmetros da API Responses/Chat Completions da OpenAI) antes de assumir que `temperature` funciona ou que o campo é `max_completion_tokens`.

## 5. Limites

- **Context window:** 1.050.000 tokens (1,05M)
- **Max input tokens:** 922.000
- **Max output tokens:** 128.000
- **Knowledge cutoff:** 16 de fevereiro de 2026
- Observação de pricing tiered: prompts que excedem 272K tokens de input disparam multiplicadores de 2x no input e 1.5x no output para a requisição inteira.

## 6. Preço por 1M tokens

- **Input:** US$ 0,20 / 1M tokens
- **Cached input:** US$ 0,02 / 1M tokens
- **Output:** US$ 1,20 / 1M tokens
- Fonte secundária (WebSearch) também menciona "Cache Write: $0,25/M" e "Web Search: $10,00/1K calls" — **não confirmado diretamente na página oficial fetchada**, apenas em resultado de busca agregando outras fontes; incluído aqui como pista, não como fato validado na doc oficial.

## Pendências / o que falta

- Confirmar nomes exatos de parâmetros (`max_tokens` vs `max_completion_tokens` vs `max_output_tokens`, suporte a `temperature`/`top_p`/`verbosity`) — a doc do modelo em si não lista; seria necessário checar a doc de referência dos endpoints Chat Completions/Responses da OpenAI.
- Não foi possível verificar o HTTP status bruto (200 vs outro) porque o WebFetch abstrai isso — a existência foi inferida por conteúdo + confirmação cruzada, não por um código de status observado diretamente.

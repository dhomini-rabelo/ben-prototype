# Histórico de conversa dinâmico e compacto em agentes de IA — Técnicas da comunidade de devs

> Pesquisa baseada em tutoriais, blogs (Medium, Dev.to), discussões de Hacker News e repositórios GitHub.
> Foco: o que desenvolvedores reais fazem na prática para manter o histórico de chat enxuto, barato e útil.
> Data: 2026-05-31.

## Resumo executivo

A comunidade convergiu para um punhado de padrões que quase sempre aparecem combinados, não isolados:

1. **Sliding window (últimas N mensagens)** — o ponto de partida mais simples.
2. **Token budget / trimming dinâmico** — corta do meio/início até caber num orçamento de tokens.
3. **Rolling summary (resumo incremental)** — resume o que sai da janela em vez de jogar fora.
4. **Importance-based retention (retenção por importância)** — pontua cada mensagem e preserva as de alto valor.
5. **Memory slots / arquitetura híbrida** — separa âncoras (system prompt, constraints) de buffer rolante e resumo.

O consenso vivido pelos devs: **nenhuma técnica sozinha resolve.** Quase todo mundo termina num híbrido "system prompt fixo + resumo do passado + últimas N mensagens verbatim", com contagem de tokens via `tiktoken` antes de cada chamada.

---

## 1. Sliding window (janela deslizante — últimas N mensagens)

**Descrição.** Envia apenas o system message + as últimas N mensagens. Tudo antes disso é descartado. É o "hello world" do gerenciamento de histórico.

**Dica prática.**
- Sempre proteja o system message — ele nunca entra na conta do "N". A perda dele é o erro nº1 citado ("destrói a personalidade do assistente").
- N por mensagens é frágil porque mensagens têm tamanhos muito diferentes; prefira combinar com orçamento de tokens (seção 2).

**Armadilhas.**
- Esquecimento abrupto: fatos mencionados "20 mensagens atrás" somem sem aviso. Para chat casual tudo bem; para agentes com tarefa de longo prazo, péssimo.
- Quebra de pares semânticos: cortar no meio de uma sequência `tool_call → tool_result` deixa o modelo confuso. Corte sempre em fronteiras de turno completo.

**Links.** [Microsoft Agent Framework — Managing Chat History](https://devblogs.microsoft.com/agent-framework/managing-chat-history-for-large-language-models-llms/) · [Chatbot Token Management (Dev.to)](https://dev.to/chatboqai/chatbot-token-management-optimize-openai-api-costs-1ik1)

---

## 2. Token budget / trimming dinâmico

**Descrição.** Em vez de contar mensagens, conta tokens. O algoritmo padrão (visto em vários tutoriais) é:

```
while conv_history_tokens + MAX_RESPONSE_TOKENS >= TOKEN_LIMIT:
    remove a mensagem mais antiga (preservando o system message)
```

Variante mais sofisticada: poda 30–50% dos tokens do **meio** do histórico (não só do início), mantendo system prompt + últimos N turnos. Isso mantém custo fixo "por milhares de turnos".

**Dica prática.**
- **Reserve `MAX_RESPONSE_TOKENS`** dentro do orçamento. Calcular tokens *antes* da chamada (proativo) é mais barato do que tomar erro 400 e reagir.
- Mire ~90% da capacidade da janela como margem de segurança, não 100%.
- Devs relatam **40–60% de redução de tokens** com um "memory pruner" e queda das reclamações de "perdeu o contexto".

**Armadilhas.**
- **Trimming agressivo demais** mata a coerência. É um trade-off explícito: economia de tokens vs. retenção de contexto.
- Trimming **reativo** (depois do erro) é mais caro que prevenção.
- Limites variam muito por modelo (GPT-3.5 4K vs. GPT-4o 128K) — torne o limite configurável por modelo, não hardcoded.

**Links.** [Mastering Token Management (Medium)](https://medium.com/@FartsyRainbowOctopus/mastering-token-management-building-cost-efficient-enterprise-chat-with-openai-api-and-dynamic-5da08321c3c1) · [Token Pruning and Prompt Compression (Dev.to)](https://dev.to/softwarejutsu/token-pruning-and-prompt-compression-in-modern-ai-h0o) · [llm-context-trim — caso real do "turno 47" (Dev.to)](https://dev.to/mukundakatta/my-hermes-agent-loop-blew-the-context-window-at-turn-47-llm-context-trim-fixed-it-23j3)

---

## 3. Rolling summary (resumo incremental)

**Descrição.** Mantém as mensagens recentes verbatim e um **resumo rolante** do que é mais antigo. Quando a conversa cresce, atualiza o resumo (cada novo resumo construído sobre o anterior, em chunks) e descarta os turnos crus. É o `ConversationSummaryMemory` do LangChain na sua forma caseira.

**Dica prática.**
- Dispare o resumo por gatilho configurável: contagem de tokens (ex.: 80K), nº de turnos, ou nº de mensagens — o que estourar primeiro.
- Defina o que **NUNCA** é resumido: o repo de compaction inteligente preserva *blocos de código com menos de 50 linhas integralmente* e mantém *mensagens de erro verbatim* (só resume o stack trace). Resumir detalhe técnico acionável é o erro clássico.
- O alvo das sequências `Assistant → Tool Call → Tool Result → Assistant` é o melhor candidato a compactar (tool results podem ter ~300KB → ~90% de redução).

**Armadilhas.**
- **"Once you compact, you throw away tokens and the model gets dumber"** (frase recorrente no HN). O resumo perde nuance: flags de CLI corrigidas, workarounds aprendidos, detalhes de debug somem.
- Resumos automáticos privilegiam o *fim* da conversa e perdem o *meio* — exatamente o que o "letter to future self" (seção 7) tenta corrigir.
- Custo escondido: cada resumo é uma chamada extra ao LLM. Vale, mas precisa entrar na conta de custo.

**Links.** [How We Extended LLM Conversations by 10x (Dev.to)](https://dev.to/amitksingh1490/how-we-extended-llm-conversations-by-10x-with-intelligent-context-compaction-4h0a) · [Smarter Strategies for Summarizing Message History (Medium)](https://techwithibrahim.medium.com/dont-let-your-ai-agent-forget-smarter-strategies-for-summarizing-message-history-a2d5284539f1) · [Conversation Summary Memory in LangChain (GeeksforGeeks)](https://www.geeksforgeeks.org/artificial-intelligence/conversation-summary-memory-in-langchain/) · [glpayson/llm-chat-summarizer (GitHub)](https://github.com/glpayson/llm-chat-summarizer)

---

## 4. Importance-based retention (retenção por importância)

**Descrição.** Atribui um peso numérico (0 a 1) a cada memória/mensagem **no momento de salvar**, e na recuperação combina esse peso com similaridade semântica e recência. Faixas práticas sugeridas:

| Tipo de conteúdo | Score |
|---|---|
| Correções do usuário ("sou alérgico a amendoim") | 0.8–1.0 |
| Preferências / configurações | 0.6–0.8 |
| Resumos de sessão | 0.4–0.6 |
| Observações casuais ("almocei macarrão") | 0.1–0.3 |

Fórmula de retrieval citada (estilo paper de Stanford / Generative Agents): `score = recência + importância + relevância`, cada dimensão normalizada em [0,1].

**Dica prática.**
- Comece com **0.5 como default** e ajuste por contexto.
- Itens de alta importância (constraints, preferências explícitas) devem ser **sempre** recuperados, independente da similaridade.
- Use 0.0 com parcimônia — se é 0.0, provavelmente nem deveria ser salvo.

**Armadilhas (os 4 erros clássicos).**
1. Tratar todas as memórias como igualmente importantes (volta ao problema da memória plana).
2. Nunca atualizar os scores conforme o contexto muda.
3. Hardcodar o mesmo score para tipos parecidos.
4. Ignorar se o conteúdo merece ser armazenado.

**Links.** [Why Importance Scoring Changes Everything (Dev.to)](https://dev.to/anajuliabit/why-importance-scoring-changes-everything-for-agent-memory-42ic) · [Memory Optimization Strategies in AI Agents (Medium)](https://medium.com/@nirdiamant21/memory-optimization-strategies-in-ai-agents-1f75f8180d54) · [Memory in Agents: What, Why and How (mem0)](https://mem0.ai/blog/memory-in-agents-what-why-and-how)

---

## 5. Memory slots / arquitetura híbrida

**Descrição.** Em vez de trimming linear, organiza o contexto em "slots" com papéis fixos. Exemplo de um memory pruner caseiro:

- **Task Anchor** — instrução central (nunca sai)
- **User Constraints** — restrições/preferências (nunca saem)
- **Latest State** — saída de ferramenta mais recente
- **Short-Term Buffer** — janela rolante de ~5 turnos

E a arquitetura de "três memórias" comum em posts sobre LLMs locais:
- **Episódica** — índice de longo prazo para retrieval (vetorial)
- **Working/recente** — turnos recentes verbatim
- **Scratchpad** — fatos salientes que o modelo anota para si mesmo

**Dica prática.** Separar âncoras imutáveis do buffer descartável é o que dá robustez. O trimming nunca toca nas âncoras; só comprime o buffer de baixa prioridade.

**Armadilhas.** Posts conceituais frequentemente **não trazem código nem fórmulas/limiares concretos** — bom para arquitetura, fraco para copiar e colar. Valide os limiares no seu próprio tráfego.

**Links.** [How I Stopped LLM Token Overruns — Custom Memory Pruner (Medium)](https://medium.com/@bhagyarana80/how-i-stopped-llm-token-overruns-by-building-a-custom-memory-pruner-9250e81dc93e) · [7 Steps to Mastering Memory in Agentic AI (MachineLearningMastery)](https://machinelearningmastery.com/7-steps-to-mastering-memory-in-agentic-ai-systems/) · [Building Agent Memory Systems (Improving)](https://www.improving.com/thoughts/building-agent-memory-systems/)

---

## 6. Contagem de tokens na prática (tiktoken)

**Descrição.** `tiktoken` é o tokenizador oficial da OpenAI; use `tiktoken.encoding_for_model(model)` para o encoding certo. Para mensagens de chat há **overhead por mensagem**:

```
num_tokens_from_messages():
  para cada mensagem: +4 tokens (estrutura) + tokens do conteúdo de cada campo
  +2 tokens no fim (reply priming)
```

**Dica prática.**
- Conte tokens **antes** de enviar (estimativa de custo, decisão de cortar/dividir) e **logue o `usage` real** da resposta depois, para calibrar.
- **Output custa 3–8x mais que input** — nunca deixe `max_tokens` ilimitado.
- Roteie por modelo: tarefas simples no modelo barato, raciocínio só no caro (diferença de 10–30x no custo).
- Comprima o system prompt (ex.: 45 tokens → ~15) sem perder qualidade; ele é repetido em toda chamada.

**Armadilhas.**
- Cada modelo tokeniza diferente; a fórmula de overhead muda entre famílias de modelo. Não assuma a contagem de um modelo para outro.
- Estimar "1 token ≈ 4 chars" serve para um chute rápido, mas erra o suficiente para estourar a janela em conversas longas.

**Links.** [How to count tokens with tiktoken (OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken) · [What are tokens and how to count them (OpenAI Help)](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) · [How Tiktoken Stops Costs From Exploding (Galileo)](https://galileo.ai/blog/tiktoken-guide-production-ai)

---

## 7. Lições vividas pelos devs (Hacker News e afins)

**"Letter to future self" (carta para o eu futuro).** Em vez de confiar no resumo automático, devs experientes escrevem manualmente um documento de transição antes de compactar: *gotchas* aprendidos, quirks, objetivo da próxima sessão, casos de teste e quais "skills" carregar. Relatos de estender uma sessão por 4–5 compactações sem grande perda usando esse método.

**A compaction emburrece o agente.** Frase recorrente: depois de compactar, detalhes finos de debugging e correções conquistadas a duras penas somem na próxima sessão. Mesmo a carta manual perde informação na compaction automática seguinte.

**Context é o gargalo, não a janela.** A síntese do thread do Martin Fowler / Anthropic: bom *context engineering* é achar **o menor conjunto de tokens de alto sinal** que maximiza o resultado — não o máximo de tokens, e sim os *certos*. "Mais tokens deixa o agente pior."

**Sub-agentes para isolar buscas pesadas.** Padrão do Claude Code: um sub-agente varre dezenas de milhares de tokens e devolve só um resumo conciso, mantendo o raciocínio principal limpo.

**Links.** [HN — "When the LLMs start compacting..."](https://news.ycombinator.com/item?id=47240336) · [Show HN: Context Gateway](https://news.ycombinator.com/item?id=47367526) · [Context Engineering: Why More Tokens Makes Agents Worse (Morph)](https://www.morphllm.com/context-engineering) · [Continuous Context for LLMs — estratégias discutidas no HN (UBOS)](https://ubos.tech/news/continuous-context-for-llms-strategies-and-tools-discussed-on-hacker-news/)

---

## 8. Armadilha transversal: "Lost in the Middle"

**Descrição.** Mesmo com janela grande, os modelos prestam mais atenção ao **início e ao fim** do contexto; o **meio é ignorado**. Afeta diretamente histórico de conversa longo — um fato dito "no meio" pode ser ignorado mesmo estando presente.

**Dica prática.**
- Posicione o que importa nas pontas. Padrão sugerido para múltiplos trechos: `[rank1, rank4, rank5, rank3, rank2]` (melhor no início, segundo melhor no fim, pior no meio).
- Reduza o contexto com reranker (top 3–5 chunks) em vez de despejar tudo.
- Marque explicitamente no prompt o que é "primário" vs. "secundário/opcional".

**Status (2026).** Nenhum modelo de produção eliminou totalmente esse viés de posição — é estrutural aos transformers. Logo, *menos contexto bem posicionado* costuma bater *mais contexto*.

**Links.** [Lost in the Middle (arXiv 2307.03172)](https://arxiv.org/abs/2307.03172) · [The 'Lost in the Middle' Problem (Dev.to)](https://dev.to/thousand_miles_ai/the-lost-in-the-middle-problem-why-llms-ignore-the-middle-of-your-context-window-3al2)

---

## Receita híbrida recomendada (síntese da comunidade)

1. **System prompt** sempre presente e enxuto (comprimido).
2. **Âncoras** (constraints, preferências de alta importância) sempre presentes.
3. **Resumo rolante** do passado distante (preservando código <50 linhas e erros verbatim).
4. **Últimas N mensagens verbatim** (retention window, ex.: 6).
5. **Token budget** via `tiktoken`, alvo ~90% da janela, output limitado.
6. **Importance scoring** para decidir o que vira resumo vs. o que continua cru.
7. Itens críticos posicionados nas **pontas** (anti "lost in the middle").

---

## Fontes

- [LLM Chat History Summarization: Best Practices (mem0, out/2025)](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)
- [Managing Chat History for LLMs (Microsoft Agent Framework)](https://devblogs.microsoft.com/agent-framework/managing-chat-history-for-large-language-models-llms/)
- [Don't Let Your AI Agent Forget — Smarter Strategies (Medium / Ali Ibrahim)](https://techwithibrahim.medium.com/dont-let-your-ai-agent-forget-smarter-strategies-for-summarizing-message-history-a2d5284539f1)
- [Conversation Summary Memory in LangChain (GeeksforGeeks)](https://www.geeksforgeeks.org/artificial-intelligence/conversation-summary-memory-in-langchain/)
- [Conversational Memory for LLMs with Langchain (Pinecone)](https://www.pinecone.io/learn/series/langchain/langchain-conversational-memory/)
- [glpayson/llm-chat-summarizer (GitHub)](https://github.com/glpayson/llm-chat-summarizer)
- [Token Pruning and Prompt Compression in Modern AI (Dev.to)](https://dev.to/softwarejutsu/token-pruning-and-prompt-compression-in-modern-ai-h0o)
- [My Hermes agent loop blew the context window at turn 47 (Dev.to)](https://dev.to/mukundakatta/my-hermes-agent-loop-blew-the-context-window-at-turn-47-llm-context-trim-fixed-it-23j3)
- [How to Reduce LLM Token Usage Without Losing Context (Dev.to)](https://dev.to/memorylake_ai/how-to-reduce-llm-token-usage-without-losing-context-6p4)
- [How I Stopped LLM Token Overruns — Custom Memory Pruner (Medium)](https://medium.com/@bhagyarana80/how-i-stopped-llm-token-overruns-by-building-a-custom-memory-pruner-9250e81dc93e)
- [Mastering Token Management — Dynamic History Trimming (Medium)](https://medium.com/@FartsyRainbowOctopus/mastering-token-management-building-cost-efficient-enterprise-chat-with-openai-api-and-dynamic-5da08321c3c1)
- [Chatbot Token Management: Optimize OpenAI API Costs (Dev.to)](https://dev.to/chatboqai/chatbot-token-management-optimize-openai-api-costs-1ik1)
- [Why Importance Scoring Changes Everything for Agent Memory (Dev.to)](https://dev.to/anajuliabit/why-importance-scoring-changes-everything-for-agent-memory-42ic)
- [Memory Optimization Strategies in AI Agents (Medium / Nirdiamant)](https://medium.com/@nirdiamant21/memory-optimization-strategies-in-ai-agents-1f75f8180d54)
- [Memory in Agents: What, Why and How (mem0)](https://mem0.ai/blog/memory-in-agents-what-why-and-how)
- [7 Steps to Mastering Memory in Agentic AI Systems (MachineLearningMastery)](https://machinelearningmastery.com/7-steps-to-mastering-memory-in-agentic-ai-systems/)
- [Building Agent Memory Systems (Improving)](https://www.improving.com/thoughts/building-agent-memory-systems/)
- [How to count tokens with tiktoken (OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken)
- [What are tokens and how to count them (OpenAI Help Center)](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
- [How Tiktoken Stops AI Token Costs From Exploding (Galileo)](https://galileo.ai/blog/tiktoken-guide-production-ai)
- [How We Extended LLM Conversations by 10x with Intelligent Context Compaction (Dev.to)](https://dev.to/amitksingh1490/how-we-extended-llm-conversations-by-10x-with-intelligent-context-compaction-4h0a)
- [HN — When the LLMs start compacting they summarize...](https://news.ycombinator.com/item?id=47240336)
- [HN — Show HN: Context Gateway](https://news.ycombinator.com/item?id=47367526)
- [Context Engineering: Why More Tokens Makes Agents Worse (Morph)](https://www.morphllm.com/context-engineering)
- [Continuous Context for LLMs — Strategies Discussed on Hacker News (UBOS)](https://ubos.tech/news/continuous-context-for-llms-strategies-and-tools-discussed-on-hacker-news/)
- [Lost in the Middle: How Language Models Use Long Contexts (arXiv 2307.03172)](https://arxiv.org/abs/2307.03172)
- [The 'Lost in the Middle' Problem (Dev.to)](https://dev.to/thousand_miles_ai/the-lost-in-the-middle-problem-why-llms-ignore-the-middle-of-your-context-window-3al2)

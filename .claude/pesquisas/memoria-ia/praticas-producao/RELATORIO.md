# Práticas de Produção: Histórico de Conversa Dinâmico e Compacto em Agentes de IA

> Pesquisa baseada em blogs e documentação oficiais de provedores de LLM (Anthropic, OpenAI, Google) e pesquisa de engenharia (Chroma). Data: 2026-05-31.

## Resumo executivo

O consenso entre os provedores mudou de "prompt engineering" para **context engineering**: o histórico de conversa não deve ser tratado como um log que cresce indefinidamente, mas como um recurso finito que precisa ser **curado ativamente a cada turno**. As janelas de contexto grandes (200K–2M tokens) não resolvem o problema, porque a qualidade do modelo degrada bem antes do limite (fenômeno de *context rot*). As três grandes alavancas recorrentes são: (1) **compactar/sumarizar** o histórico ao se aproximar do limite, (2) **escrever notas persistentes fora da janela** (memória de arquivo), e (3) **isolar contexto em sub-agentes**. Tudo isso precisa ser equilibrado com **prompt caching**, que recompensa prefixos estáveis e penaliza reescritas do histórico.

---

## 1. Context Engineering (princípio geral)

**O que é:** A prática de curar e manter o conjunto ótimo de tokens (instruções de sistema, ferramentas, dados externos e histórico de mensagens) durante a inferência. Diferente de prompt engineering, é **iterativo e contínuo** — feito a cada passo da inferência, não uma vez só.

**Recomendação:** Tratar o contexto como recurso finito com retornos decrescentes. A diretriz-guia da Anthropic: *"encontrar o menor conjunto possível de tokens de alto sinal que maximize a probabilidade do resultado desejado"*. O Google formaliza em 4 estratégias para agentes: **Write Context** (salvar fora da janela), **Select Context** (puxar só o relevante), **Compress Context** (sumarizar), **Isolate Context** (separar em espaços distintos).

**Prós:** Mais robustez, menor custo, menos alucinação. **Contras:** Exige engenharia de runtime (não é "set and forget"); requer instrumentação/avaliação para saber o que cortar.

Fonte: [Anthropic – Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## 2. Context Window Rot (degradação por tamanho)

**O que é:** Degradação **mensurável** da qualidade da saída conforme o contexto cresce — distinta de overflow (estourar o limite). Um modelo com janela de 200K pode degradar significativamente já em 50K tokens. A pesquisa da Chroma testou 18 modelos de fronteira (incl. GPT-4.1 e Claude 4) e **todos** pioraram com o aumento do input.

**Causas/efeitos observados:**
- **Viés posicional:** modelos acertam mais quando a informação relevante está no início ou no fim; "informação no meio" se perde.
- **Distratores:** um único distrator já reduz a performance; vários pioram e induzem alucinação (modelos Claude tendem a abster-se; modelos GPT tendem a responder errado com confiança).
- **Coerência narrativa atrapalha:** modelos saíram-se melhor com "palheiros" embaralhados do que com texto logicamente estruturado.
- **Conflito recuperação x raciocínio:** prompts focados batem prompts completos — adicionar histórico irrelevante degrada até perguntas simples (LongMemEval).

**Recomendação:** Não assumir "quanto mais, melhor". Pré-filtrar conversas para os segmentos relevantes, colocar informação crítica cedo, remover conteúdo correlato porém irrelevante.

Fontes: [Chroma – Context Rot](https://www.trychroma.com/research/context-rot), [Anthropic – context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## 3. Compaction / Auto-Summarization

**O que é:** Sumarizar o histórico ao se aproximar do limite de contexto e reiniciar a partir de um resumo comprimido, preservando decisões e detalhes críticos e descartando saídas de ferramentas redundantes.

### Anthropic – Server-side compaction (recurso de plataforma)
- Dispara quando os input tokens excedem um *trigger* configurável (**default 150.000**, mínimo 50.000). O modelo gera um resumo, a API cria um bloco `compaction`, e **todas as mensagens anteriores ao bloco são automaticamente descartadas** nas requisições seguintes.
- `pause_after_compaction: true` retorna `stop_reason: "compaction"` para você **preservar manualmente as últimas N mensagens** (ex.: últimas 3) antes de continuar.
- `instructions` permite prompt de sumarização customizado (**substitui** o default, não soma).
- **Cuidado com ferramentas:** durante a sumarização o modelo pode tentar chamar uma tool em vez de escrever o resumo (retorna `content: null`). Mitigação: instruir explicitamente *"não chame ferramentas; responda só com texto dentro de `<summary></summary>`"*.
- **Billing:** custa uma chamada extra de sampling; o uso aparece no array `iterations` (somar para custo total).
- **Combinar com prompt caching:** aplicar `cache_control` no system prompt **e** no bloco de compaction; cachear o system prompt separadamente para que sobreviva aos eventos de compaction.

### Claude Code (auto-compact)
- Dispara em ~95% da capacidade da janela. **Limpa saídas de ferramentas antigas primeiro**, depois sumariza a conversa. Preserva estado crítico: arquivos ativos, planos e schemas de ferramentas. O `/compact` manual cria um resumo e inicia nova sessão com ele pré-carregado.

**Prós:** Permite tarefas de longa duração / conversas multi-turno fluidas. **Contras:** Perda de fidelidade (detalhes antigos simplificados ou perdidos); custo/latência extra; risco de "summary drift" e *context poisoning* se fatos errados entrarem no resumo.

**Recomendação geral:** começar maximizando *recall* (capturar tudo relevante), depois iterar para melhorar *precision* (eliminar supérfluo).

Fontes: [Anthropic – Compaction docs](https://platform.claude.com/docs/en/build-with-claude/compaction), [Claude Code – how it works](https://code.claude.com/docs/en/how-claude-code-works), [Cookbook – automatic context compaction](https://platform.claude.com/cookbook/tool-use-automatic-context-compaction)

---

## 4. Prompt Caching e seu impacto no design do histórico

**O que é:** Cachear o prefixo estável do contexto (system prompt, ferramentas, histórico até a última troca) para reduzir custo e latência. Na Anthropic: cache write custa ~1,25x o input base; cache read custa ~0,1x — ou seja, leituras são ~10x mais baratas. O Google reporta ~4x de economia com context caching para consultas repetidas sobre os mesmos dados.

**Implicações para o design do histórico (crítico):**
- O cache exige **prefixo idêntico byte a byte**. Uma única mudança no system prompt ou na lista de ferramentas **quebra o cache hit**.
- Ferramentas que **reformatam/comprimem** o histórico entre turnos mudam a sequência de tokens → mesmo prefixo semântico, prefixo físico diferente → **cache miss**. Portanto, há tensão entre "reescrever o histórico para compactar" e "manter o prefixo estável para cachear".
- **Recomendações:** manter a superfície de ferramentas estável; colocar conteúdo cacheável no início; usar *cache breakpoints* para separar seções; **cachear o system prompt separadamente** para que sobreviva à compaction; só compactar quando o ganho de tokens superar a perda do cache.

**Prós:** Grande economia em sessões longas com prefixo reutilizado. **Contras:** Cache write é mais caro que input normal (só compensa com reúso); fragiliza estratégias que reescrevem o histórico.

Fontes: [Anthropic – Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Claude: how prompt caching works (mager.co)](https://www.mager.co/blog/2026-04-29-claude-prompt-caching/), [Google – Long context (context caching)](https://ai.google.dev/gemini-api/docs/long-context)

---

## 5. Just-In-Time Context (contexto sob demanda)

**O que é:** Em vez de pré-carregar todos os dados, o agente mantém apenas **identificadores leves** (caminhos de arquivo, queries, links) e carrega dados dinamicamente via ferramentas no momento da execução. Usado pelo Claude Code (CLAUDE.md + grep/glob). O Google sugere o oposto em alguns casos ("forneça tudo upfront") graças ao in-context learning forte — mas mantém RAG quando custo importa ou há muitas buscas específicas simultâneas.

**Prós:** Janela focada; espelha cognição humana; *progressive disclosure* (o agente descobre o relevante incrementalmente); metadados (hierarquia, nomes, timestamps) guiam o comportamento de forma barata.

**Contras:** Exploração em runtime é mais lenta que recuperação pré-computada; exige design cuidadoso de ferramentas para evitar becos sem saída e mau uso.

**Recomendação:** Abordagem **híbrida** — recuperar alguns dados críticos upfront por velocidade, permitindo exploração autônoma no resto.

Fontes: [Anthropic – context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Google – Long context](https://ai.google.dev/gemini-api/docs/long-context)

---

## 6. Tool Result Truncation / Clearing

**O que é:** Remover ou resumir resultados brutos de ferramentas antigas, que tipicamente consomem muitos tokens e raramente precisam ser revisitados na íntegra. "Uma vez que uma ferramenta foi chamada lá no fundo do histórico, por que o agente precisaria ver o resultado bruto de novo?" (Anthropic).

**Recomendação:**
- Forma leve de compaction: a Anthropic lançou *tool result clearing* como recurso de plataforma; o Claude Code **limpa saídas de ferramentas antigas antes** de sumarizar a conversa.
- OpenAI alerta: mesmo com trimming, **turnos recentes com payloads grandes de ferramentas ainda estouram o contexto** — trate-os explicitamente.

**Prós:** Recupera muito espaço com baixa perda de informação. **Contras:** Se o resultado for relevante depois, ele se perdeu (manter um ponteiro/nota do que foi obtido mitiga).

Fontes: [Anthropic – context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Cookbook – memory, compaction & tool clearing](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools), [OpenAI – Session memory](https://developers.openai.com/cookbook/examples/agents_sdk/session_memory)

---

## 7. Trimming vs Summarization (a escolha tática da OpenAI)

A OpenAI (Agents SDK) contrapõe duas estratégias de memória de curto prazo:

| | **Context Trimming (últimas N turns)** | **Context Summarization** |
|---|---|---|
| O que é | Manter só os N turnos mais recentes (1 turn = msg do user + interações até a próxima) | Comprimir mensagens antigas em resumos estruturados injetados como pares user→assistant |
| Quando usar | Operações tool-heavy, fluxos curtos, recência importa mais que história | Tarefas de longo horizonte: planejamento, coaching, análise RAG, onde decisões/restrições persistem |
| Prós | Determinístico, simples, **zero latência extra**, preserva detalhes verbatim, sem "summary drift" | Memória de longo alcance compacta, UX mais "memória", custo controlado em escala |
| Contras | Esquece restrições/identificadores antigos abruptamente; payloads grandes ainda estouram | Perda por compressão, viés, risco de context poisoning, latência/custo nos refreshes |

**Design do prompt de resumo (OpenAI):** incluir marcos/milestones, timestamps e ordem temporal, checagem de contradições contra instruções/ferramentas, chunking estruturado (Produto, Problema, Passos Tentados, Bloqueios, Próximo Passo), controle de alucinação (citar códigos de erro exatos, marcar fatos não verificados) e insights de quais ferramentas funcionaram.

**SDK Sessions:** abstração `Session` cuida de comprimento de contexto, histórico e continuidade automaticamente — preferir a gerenciar IDs/anexos manualmente.

Fonte: [OpenAI – Short-Term Memory Management with Sessions](https://developers.openai.com/cookbook/examples/agents_sdk/session_memory)

---

## 8. Structured Note-Taking / Agentic Memory

**O que é:** O agente escreve notas persistidas **fora da janela de contexto** (arquivos/knowledge base) e as recupera depois para manter progresso ao longo de tarefas complexas e resets de contexto.

**Recomendação:** Usar em desenvolvimento iterativo com marcos claros. A Anthropic lançou uma **memory tool** (beta) baseada em arquivos, persistente entre sessões. Exemplo citado: Claude jogando Pokémon mantém contagens precisas ("nos últimos 1.234 passos treinei na Rota 1, Pikachu ganhou 8 níveis rumo à meta de 10"). OpenAI usa `RunContextWrapper` para estado estruturado persistente; Google/Letta falam em "memory hierarchy" para o agente gerenciar a própria janela e rodar indefinidamente; Gemini 3 usa *Thought Signatures* (notas criptografadas do próprio raciocínio) reinjetadas para manter o "trem de pensamento".

**Prós:** Memória persistente com pouco overhead na janela; coerência por horas/sessões. **Contras:** Exige disciplina de escrita/recuperação e tooling; notas erradas viram dívida (context poisoning).

Fontes: [Anthropic – context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [OpenAI – Context personalization](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization), [Google Developers – Real-world agents with Gemini 3](https://developers.googleblog.com/real-world-agent-examples-with-gemini-3/)

---

## 9. Sub-Agent Context Isolation

**O que é:** Agentes especializados executam tarefas focadas com **janelas de contexto limpas**; o agente principal coordena planejamento de alto nível e recebe apenas **resumos condensados** (tipicamente 1.000–2.000 tokens), não o contexto detalhado.

**Recomendação:** Melhor para pesquisa/análise complexas com exploração paralela. Mantém o contexto de busca detalhado **isolado** dentro dos sub-agentes, deixando o principal livre para síntese. A Anthropic relata melhora substancial sobre sistemas de agente único em tarefas de pesquisa complexas.

**Prós:** Separação clara de responsabilidades; janela do principal protegida; paralelização. **Contras:** Overhead de orquestração; perda de detalhe na fronteira entre sub-agente e principal (o resumo é o único canal).

Fonte: [Anthropic – context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## Síntese de recomendações práticas (checklist)

1. **Trate o histórico como recurso curado, não como log.** Curadoria a cada turno.
2. **Não confie em janelas grandes** — degrada antes do limite (context rot). Coloque o crítico no início/fim; remova distratores.
3. **Ative compaction** com trigger configurado (ex.: 100–150K tokens), preservando as últimas N mensagens e estado crítico.
4. **Limpe resultados de ferramentas antigos** primeiro — maior ganho com menor perda.
5. **Proteja o cache:** mantenha system prompt e ferramentas estáveis; cacheie o system prompt separadamente; só reescreva o histórico quando o ganho superar a perda de cache hits.
6. **Escolha trimming (rápido/determinístico) vs summarization (longo horizonte)** conforme a tarefa.
7. **Persista notas fora da janela** para tarefas longas; use memory tools/estado estruturado.
8. **Isole contexto pesado em sub-agentes** que devolvem resumos curtos.
9. **Prefira just-in-time** (ponteiros + carga sob demanda), com híbrido para dados críticos.
10. **Instrumente e avalie** o que é cortado/resumido — evite context poisoning e summary drift.

---

## Fontes

### Anthropic
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Compaction — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Prompt caching — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Context engineering: memory, compaction, and tool clearing — Claude Cookbook](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools)
- [Automatic context compaction — Claude Cookbook](https://platform.claude.com/cookbook/tool-use-automatic-context-compaction)
- [How Claude Code works — Claude Code Docs](https://code.claude.com/docs/en/how-claude-code-works)
- [Context windows — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)

### OpenAI
- [Short-Term Memory Management with Sessions — OpenAI Cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/session_memory)
- [Context Engineering for Personalization — Long-Term Memory Notes](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization)
- [Sessions — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/)

### Google
- [Long context — Gemini API](https://ai.google.dev/gemini-api/docs/long-context)
- [Manage context and memory — Gemini CLI](https://geminicli.com/docs/cli/tutorials/memory-management/)
- [Real-world agent examples with Gemini 3 — Google Developers Blog](https://developers.googleblog.com/real-world-agent-examples-with-gemini-3/)

### Pesquisa de engenharia (context rot)
- [Context Rot: How Increasing Input Tokens Impacts LLM Performance — Chroma](https://www.trychroma.com/research/context-rot)
- [Context rot explained — Redis](https://redis.io/blog/context-rot/)
- [Claude: How prompt caching actually works — mager.co](https://www.mager.co/blog/2026-04-29-claude-prompt-caching/)

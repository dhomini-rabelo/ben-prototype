# Como frameworks de agentes de IA implementam histórico de conversa dinâmico e compacto

Pesquisa sobre técnicas de memória de conversação (gerenciamento dinâmico e compactação de contexto) nos principais frameworks de agentes: LangChain, LangGraph, LlamaIndex, Semantic Kernel, AutoGen, CrewAI, Mem0 e Letta/MemGPT.

> Nota de contexto: várias classes "clássicas" do LangChain (`ConversationBufferMemory`, `ConversationSummaryMemory`, etc.) estão **deprecadas** nas versões recentes. O caminho atual recomendado é usar `trim_messages` + persistência via LangGraph. Mantivemos as classes legadas por serem o vocabulário-base do tema, mas sinalizamos o status.

---

## 1. As cinco grandes estratégias (visão geral)

Antes de entrar framework por framework, todas as abordagens são variações de cinco estratégias fundamentais:

1. **Buffer completo (verbatim)** — guarda tudo cru. Máxima fidelidade, custo de tokens cresce linearmente e estoura a janela de contexto.
2. **Janela / truncamento (sliding window)** — guarda apenas as últimas N mensagens ou os últimos N tokens. Compacto e barato, mas perde informação antiga.
3. **Sumarização (rolling summary)** — comprime mensagens antigas em um resumo gerado por LLM. Mantém o "sentido" histórico de forma compacta, ao custo de chamadas extras de LLM e perda de detalhes.
4. **Híbrido buffer + resumo** — mantém as últimas mensagens verbatim e resume o resto. É o padrão pragmático mais usado hoje.
5. **Memória externa / auto-editável / recuperada (RAG, memory blocks, fatos)** — extrai fatos salientes para um armazenamento externo (DB/vetor) e injeta de volta sob demanda; pode ser editada pelo próprio agente. Habilita memória de longo prazo entre sessões.

---

## 2. LangChain (clássico — memórias deprecadas, mas fundamentais)

### 2.1 ConversationBufferMemory
- **Framework:** LangChain.
- **Como funciona:** armazena todas as interações na íntegra (verbatim) e as reinjeta inteiras no prompt a cada turno.
- **Configuração:** `return_messages`, `memory_key`. Sem limite — guarda tudo.
- **Prós:** fidelidade total; simples.
- **Contras:** crescimento linear de tokens; estoura janela de contexto; custo cresce sem limite.
- **Link:** https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html

### 2.2 ConversationBufferWindowMemory
- **Como funciona:** mantém apenas as últimas `k` interações (janela deslizante).
- **Configuração:** parâmetro `k` (número de turnos).
- **Prós:** custo previsível e limitado.
- **Contras:** descarta tudo fora da janela; perde contexto antigo abruptamente.

### 2.3 ConversationTokenBufferMemory
- **Como funciona:** mantém as interações mais recentes que cabem dentro de um limite de **tokens** (não de turnos). Descarta as mais antigas quando ultrapassa o limite.
- **Configuração:** `max_token_limit`, `llm` (para contar tokens).
- **Prós:** controle direto sobre o orçamento de tokens (mais preciso que contar turnos).
- **Contras:** descarta antigas sem resumir (perda de informação).

### 2.4 ConversationSummaryMemory
- **Como funciona:** em vez de guardar mensagens, mantém um **resumo contínuo** da conversa, atualizado por um LLM a cada turno.
- **Configuração:** `llm`, `prompt` de sumarização.
- **Prós:** extremamente compacto para conversas longas.
- **Contras:** perde detalhes finos; chamada extra de LLM por turno (latência/custo); resumo pode "esquecer" nuances recentes.

### 2.5 ConversationSummaryBufferMemory  ⭐ (o híbrido canônico)
- **Como funciona:** combina `ConversationSummaryMemory` + `ConversationTokenBufferMemory`. Mantém as interações **recentes verbatim** dentro de um limite de tokens; quando esse limite é ultrapassado, as interações antigas são **resumidas** (flush para o resumo) em vez de descartadas. Usa comprimento em tokens para decidir quando comprimir.
- **Configuração:** `max_token_limit`, `llm`.
- **Prós:** mantém fidelidade do recente + memória de longo alcance compacta; é "o único tipo que retém interações distantes preservando as recentes na forma crua mais rica em informação".
- **Contras:** complexidade; custo de sumarização; ainda assim o resumo perde detalhes.
- **Link:** https://api.python.langchain.com/en/latest/memory/langchain.memory.summary_buffer.ConversationSummaryBufferMemory.html

### 2.6 trim_messages (abordagem moderna recomendada)
- **Framework:** `langchain_core` (substitui as memórias acima na arquitetura atual).
- **Como funciona:** função utilitária que reduz uma lista de mensagens abaixo de um limite de tokens/contagem, aplicada "na hora" (hot path) antes de chamar o modelo.
- **Configuração principal:**
  - `max_tokens` — orçamento alvo.
  - `token_counter` — função ou LLM para contar tokens; use `count_tokens_approximately` para velocidade, ou `token_counter=len` para contar por número de mensagens.
  - `strategy` — `"last"` (mantém as últimas, padrão) ou `"first"` (mantém as primeiras).
  - `start_on='human'` — garante que o histórico comece com `HumanMessage`.
  - `include_system=True` — preserva a `SystemMessage` com instruções.
  - `allow_partial` — permite cortar parte de uma mensagem.
- **Prós:** sem dependência das classes deprecadas; rápido (com contagem aproximada); flexível; integra bem com LCEL/LangGraph.
- **Contras:** é puro truncamento — **não resume**; perde informação antiga (a sumarização precisa ser montada à parte).
- **Link:** https://python.langchain.com/docs/how_to/trim_messages/

---

## 3. LangGraph (persistência, checkpointing e memória de dois níveis)

O LangGraph é a evolução arquitetural do LangChain para agentes com estado. Ele não oferece "classes de memória", mas um **mecanismo de persistência de estado** sobre o qual a memória é construída.

### 3.1 Checkpointing / persistência (memória de curto prazo)
- **Como funciona:** a cada "super-step" da execução do grafo, um **checkpoint** (snapshot do estado, incluindo `messages`) é salvo. Conversas são identificadas por um `thread_id`; mensagens de follow-up enviadas ao mesmo thread recuperam todo o histórico anterior.
- **Memória de curto prazo (short-term):** é o **estado escopado por thread**, persistido pelos checkpointers. É a "working memory" da conversa.
- **Configuração / backends (`BaseCheckpointSaver`):**
  - `InMemorySaver` — desenvolvimento/testes.
  - `SqliteSaver` / `AsyncSqliteSaver` — experimentação e workflows locais.
  - `PostgresSaver` / `AsyncPostgresSaver` — produção (usado no LangSmith).
- **Recursos extras:** "time travel" (replay/fork de checkpoints para debug e exploração de trajetórias alternativas) e tolerância a falhas (recomeçar do último passo bem-sucedido). `DeltaChannel` reduz o armazenamento guardando apenas deltas incrementais.

### 3.2 Store (memória de longo prazo)
- **Como funciona:** a interface `Store` mantém informação **compartilhada entre threads**, organizada por **namespaces** (ex.: por usuário). Não está presa a um único `thread_id`.
- **Uso:** preferências/fatos do usuário recuperados em qualquer conversa, acessados via objeto `Runtime` nos nós.

### 3.3 Compactação no LangGraph
- A compactação não é automática: combina-se `trim_messages` (LangChain) ou um nó de sumarização customizado **dentro** do grafo, persistindo o resultado no estado/checkpoint.
- **Prós:** controle total, produção robusta, separação clara curto vs. longo prazo, debug por time-travel.
- **Contras:** mais código/infra; o desenvolvedor implementa a estratégia de compactação.
- **Links:** https://docs.langchain.com/oss/python/langgraph/persistence | https://reference.langchain.com/python/langgraph/checkpoints

---

## 4. LlamaIndex

### 4.1 ChatMemoryBuffer (deprecado em favor da classe `Memory`)
- **Como funciona:** armazena as últimas X mensagens que cabem em um limite de tokens (janela por tokens).
- **Configuração:** `from_defaults(token_limit=..., llm=..., chat_store=..., tokenizer_fn=...)`.
- **Prós:** simples, controle por tokens, integra com `chat_store` para persistência por usuário.
- **Contras:** descarta antigas sem resumir.
- **Link:** https://developers.llamaindex.ai/python/examples/agent/memory/chat_memory_buffer/

### 4.2 ChatSummaryMemoryBuffer
- **Como funciona:** mantém as mensagens recentes verbatim dentro do limite de tokens e **resume iterativamente** todas as mais antigas em uma única mensagem usando o LLM. É o equivalente ao `ConversationSummaryBufferMemory` do LangChain.
- **Configuração:** `token_limit`, `llm`, e um `summary_prompt` customizável.
- **Prós:** híbrido fidelidade + compactação; resumo de baixa pegada de tokens.
- **Contras:** custo de sumarização; perda de detalhes antigos.
- **Link:** https://developers.llamaindex.ai/python/examples/agent/memory/summary_memory_buffer/

### 4.3 Classe `Memory` (atual)
- **Como funciona:** API nova e mais flexível que substitui os buffers acima; permite configurações de memória mais complexas (combinação de blocos de memória de curto e longo prazo, fontes recuperáveis etc.).
- **Link:** https://developers.llamaindex.ai/python/framework-api-reference/memory/memory/

---

## 5. Semantic Kernel (Microsoft) — Chat History Reducers

O SK gerencia o histórico via `ChatHistory` + **reducers** que avaliam o tamanho e reduzem conforme parâmetros.

### 5.1 ChatHistoryTruncationReducer
- **Como funciona:** trunca o histórico para um tamanho-alvo e **descarta** as mensagens removidas.
- **Configuração:** `target_count` (quantas mensagens manter) e `threshold_count` (gatilho para acionar a redução). Sempre **preserva mensagens de sistema**.
- **Prós:** simples e barato; preserva instruções de sistema.
- **Contras:** descarta sem resumir.

### 5.2 ChatHistorySummarizationReducer
- **Como funciona:** trunca o histórico, **resume** as mensagens removidas e reinsere o resumo como uma única mensagem no histórico.
- **Configuração:** `target_count`, `threshold_count`, `use_single_summary` (padrão `True`), `auto_reduce` (padrão `False`). Também preserva mensagens de sistema; há variante que preserva conteúdo de chamadas de função.
- **Prós:** híbrido truncamento + resumo; controle fino por contagem de mensagens.
- **Contras:** custo de LLM; configuração de auto-redução desligada por padrão.
- **Links:** https://learn.microsoft.com/en-us/python/api/semantic-kernel/semantic_kernel.contents.history_reducer.chat_history_summarization_reducer.chathistorysummarizationreducer | https://learn.microsoft.com/en-us/semantic-kernel/concepts/ai-services/chat-completion/chat-history

---

## 6. AutoGen (Microsoft) — Context Management + Memory

O AutoGen separa **ChatCompletionContext** (o que vai ao LLM) de **Memory** (interface de recuperação de contexto).

### 6.1 BufferedChatCompletionContext
- **Como funciona:** mantém apenas as N mensagens mais recentes enviadas ao LLM (ex.: últimas 20), evitando overflow e reduzindo custo. (Existem também variantes como contexto por contagem de tokens / "head and tail".)
- **Prós:** previne estouro de contexto; barato.
- **Contras:** janela simples — descarta o antigo.

### 6.2 Tipos de memória (interface `Memory`)
- **Buffer Memory:** interações recentes até um limite de tokens.
- **Summary Memory:** resume periodicamente interações antigas para manter contexto compacto (arquitetura hierárquica: buffer de curto prazo + camada de sumarização que comprime o antigo).
- **Semantic Memory:** usa embeddings para recuperar informação relevante por similaridade.
- **Memory banks / transforms:** repositórios de memória que aplicam continuamente transformações/operações sobre o que é armazenado, sob a interface `Memory` (agentes consultam a memória para aumentar seu contexto antes de responder).
- **Prós:** arquitetura híbrida flexível (buffer + resumo + semântico).
- **Contras:** mais peças móveis; integração de memória de longo prazo geralmente via terceiros (ex.: Mem0).
- **Links:** https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/memory.html | https://microsoft.github.io/autogen/0.2/docs/ecosystem/mem0/

---

## 7. CrewAI

CrewAI oferece um **sistema unificado de memória** (classe `Memory` única que substitui os tipos separados), mas conceitualmente expõe quatro tipos. Ativado com `memory=True` no Crew.

- **Short-Term Memory:** memória de trabalho que existe só durante a execução atual (a "working memory" dos agentes durante as tasks).
- **Long-Term Memory:** usa **SQLite3** para armazenar insights e resultados de tasks entre múltiplas sessões, refinando a base de conhecimento ao longo do tempo.
- **Entity Memory:** rastreia entidades (pessoas, empresas, produtos, conceitos) e seus relacionamentos, formando um grafo de conhecimento.
- **Contextual Memory:** quando `memory=True`, o CrewAI consulta automaticamente os três stores antes de cada agente rodar, monta a informação mais relevante e a injeta no contexto. Não se configura — é orquestração automática.
- **Sistema unificado:** um LLM analisa o conteúdo ao salvar (inferindo escopo, categorias e importância) e a recuperação usa **pontuação composta** (similaridade semântica + recência + importância). Memórias são organizadas em **escopos hierárquicos** tipo árvore de diretórios (`/`, `/project/alpha`, `/agent/researcher/findings`).
- **Prós:** memória de longo prazo e por entidades pronta de fábrica; injeção de contexto automática; escopos para precisão.
- **Contras:** abstração "mágica" (pouca configuração explícita); para produção/robustez, muitos integram **Mem0**.
- **Link:** https://docs.crewai.com/en/concepts/memory

---

## 8. Mem0 — camada de memória de longo prazo (independente de framework)

- **Como funciona:** Mem0 **extrai, avalia e gerencia** informação saliente das conversas. Em vez de guardar mensagens cruas, extrai apenas o **conhecimento factual** e o armazena em frases curtas de memória (ex.: "I love pizza" → "Loves pizza"). No início de cada loop do agente faz **retrieval** (`search`), e após cada interação faz **storage** (`memory.add`).
- **Configuração / uso:** APIs Python simples — `add`, `search`, gerenciar memórias. Namespaces em vários níveis: **user-level, session-level, agent-level**, para isolar memórias por usuário ou compartilhar fatos globais do agente. Adiciona semântica de entidades, metadados estruturados e extração consciente de LLM.
- **Integração:** drop-in no início (retrieval) e fim (storage) do loop, sem reescrever planejamento/tool-calling. Integra com LangGraph, AutoGen, CrewAI etc.
- **Prós:** mantém o contexto **muito compacto** (só fatos relevantes, não transcrições); personalização entre sessões; escalável para produção.
- **Contras:** depende da qualidade da extração (pode perder/distorcer fatos); é memória **factual**, não substitui o histórico literal recente; serviço/infra adicional.
- **Links:** https://mem0.ai/blog/what-is-agentic-ai-why-memory-is-the-missing-piece | https://arxiv.org/html/2504.19413v1

---

## 9. Letta / MemGPT — memória auto-editável (self-editing memory)

A abordagem mais distinta: o **próprio agente gerencia sua memória** com ferramentas, inspirado em hierarquia de SO (analogia com memória virtual/paginação).

### 9.1 Memory Blocks (núcleo)
- **Como funciona:** blocos estruturados que vivem **na janela de contexto**. Cada bloco tem `label` (ex.: "human", "persona"), `value` (string com os dados), um **limite de tamanho** (em caracteres/tokens) e descrições opcionais de uso. Os dois blocos originais do MemGPT são:
  - **Human** — fatos, preferências e contexto sobre o usuário.
  - **Persona** — autoconceito, personalidade e diretrizes de comportamento do agente.
- Os blocos são **persistidos individualmente no DB** (não efêmeros) e **editáveis pelo agente**, com limite de caracteres para controlar a alocação na janela de contexto.

### 9.2 Hierarquia de memória em três camadas
- **Core Memory:** bloco pequeno **dentro** do contexto; o agente lê e escreve diretamente.
- **Recall Memory:** histórico de conversa **pesquisável**, armazenado **fora** do contexto.
- **Archival Memory:** armazenamento de longo prazo consultado via ferramentas.

### 9.3 Ferramentas de auto-edição
- O agente decide o que vale a pena lembrar chamando funções de memória durante o loop de raciocínio:
  - **Edição de core:** `memory_replace`, `memory_insert`, `memory_rethink` (esta reescreve o valor inteiro de um bloco).
  - **Arquival:** `archival_memory_insert`, `archival_memory_search`.
- **Compactação:** quando o contexto enche, o agente move/resume informação dos blocos para recall/archival e mantém o core enxuto — uma compactação **dirigida pelo agente** em vez de regra fixa.
- **Prós:** memória persistente, consistente e de longo prazo; compactação inteligente decidida pelo agente; separa "o que está na janela" do "que está armazenado".
- **Contras:** mais chamadas de ferramenta (latência/custo); depende do agente decidir bem o que guardar; mais complexo de operar.
- **Links:** https://www.letta.com/blog/memory-blocks | https://docs.letta.com/concepts/letta/ | https://docs.letta.com/guides/legacy/memgpt_agents_legacy

---

## 10. Tabela comparativa

| Técnica / Classe | Framework | Estratégia | Compacta como? | Gatilho | Prós | Contras |
|---|---|---|---|---|---|---|
| ConversationBufferMemory | LangChain (deprecado) | Buffer total | Não compacta | — | Fidelidade total | Tokens crescem sem limite |
| ConversationBufferWindowMemory | LangChain (deprecado) | Janela por turnos | Descarta antigos | últimos `k` turnos | Custo previsível | Perde contexto antigo |
| ConversationTokenBufferMemory | LangChain (deprecado) | Janela por tokens | Descarta antigos | `max_token_limit` | Controle por tokens | Sem resumo |
| ConversationSummaryMemory | LangChain (deprecado) | Resumo contínuo | Resume tudo | a cada turno | Muito compacto | Perde detalhe; LLM/turno |
| ConversationSummaryBufferMemory | LangChain (deprecado) | Híbrido buffer+resumo | Resume o antigo | `max_token_limit` | Recente fiel + longo prazo compacto | Complexo; custo resumo |
| trim_messages | LangChain core | Truncamento por token/contagem | Descarta (não resume) | `max_tokens` | Rápido, flexível, moderno | Não resume |
| Checkpointing + Store | LangGraph | Persistência de estado (curto) + store (longo) | Via nó custom / trim | por super-step / namespace | Produção, time-travel, 2 níveis | Compactação é manual |
| ChatMemoryBuffer | LlamaIndex (deprecado) | Janela por tokens | Descarta antigos | `token_limit` | Simples + chat_store | Sem resumo |
| ChatSummaryMemoryBuffer | LlamaIndex | Híbrido buffer+resumo | Resume iterativo | `token_limit` | Híbrido com prompt custom | Custo resumo |
| ChatHistoryTruncationReducer | Semantic Kernel | Truncamento | Descarta | target/threshold count | Preserva system msg | Sem resumo |
| ChatHistorySummarizationReducer | Semantic Kernel | Híbrido truncar+resumir | Resume os removidos | target/threshold count | Controle fino | Auto-redução off por padrão |
| BufferedChatCompletionContext | AutoGen | Janela | Descarta | últimas N msgs | Evita overflow, barato | Janela simples |
| Summary/Semantic Memory | AutoGen | Resumo + embeddings | Resume / recupera | periódico / similaridade | Híbrido hierárquico | Mais peças móveis |
| Memory unificada (ST/LT/Entity/Contextual) | CrewAI | Buffer + DB + grafo + injeção | Recupera relevante (score) | automático (`memory=True`) | LT/entidades de fábrica | Pouca config explícita |
| Long-term memory | Mem0 | Extração de fatos + recuperação | Extrai fatos (não transcreve) | add/search no loop | Compacto, personalização, escala | Depende da extração |
| Memory blocks + 3 tiers | Letta/MemGPT | Auto-edição + paginação | Agente move/resume p/ recall/archival | dirigido pelo agente | LT consistente, compactação inteligente | Latência/custo de tools |

---

## 11. Conclusões e recomendações práticas

- **Para a maioria dos chatbots:** o híbrido **buffer recente + resumo contínuo** (`ConversationSummaryBufferMemory` / `ChatSummaryMemoryBuffer` / `ChatHistorySummarizationReducer` / SummaryBufferMemory do AutoGen) é o "default sensato": fidelidade do recente sem crescimento linear de tokens.
- **Arquitetura moderna LangChain/LangGraph:** abandonar as classes de memória deprecadas e usar **`trim_messages`** (compactação na hot path) + **checkpointing do LangGraph** (persistência por thread) + **Store** (longo prazo entre threads). A sumarização vira um nó explícito do grafo.
- **Memória de longo prazo entre sessões:** **Mem0** (extração de fatos) ou **Letta/MemGPT** (memory blocks auto-editáveis) são as abordagens dedicadas; CrewAI já traz LT/entidades embutidas via SQLite.
- **Distinção-chave:** truncamento (rápido, perde info) vs. sumarização (compacto, custa LLM, perde detalhe) vs. memória externa/factual (compactíssima, mas é seletiva, não literal). Os sistemas mais robustos **combinam** os três em camadas (curto prazo verbatim + resumo + fatos recuperáveis).

---

## Fontes

**LangChain (memórias clássicas e trim_messages)**
- ConversationBufferMemory — https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html
- ConversationSummaryBufferMemory — https://api.python.langchain.com/en/latest/memory/langchain.memory.summary_buffer.ConversationSummaryBufferMemory.html
- ConversationSummaryBufferMemory (JS) — https://js.langchain.com/v0.1/docs/modules/memory/types/summary_buffer/
- How to trim messages — https://python.langchain.com/docs/how_to/trim_messages/
- trim_messages (referência) — https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages

**LangGraph (persistência / checkpointing)**
- Persistence — https://docs.langchain.com/oss/python/langgraph/persistence
- Checkpoints (referência) — https://reference.langchain.com/python/langgraph/checkpoints

**LlamaIndex**
- Chat Memory Buffer — https://developers.llamaindex.ai/python/examples/agent/memory/chat_memory_buffer/
- Chat Summary Memory Buffer — https://developers.llamaindex.ai/python/examples/agent/memory/summary_memory_buffer/
- Memory (classe nova) — https://developers.llamaindex.ai/python/framework-api-reference/memory/memory/

**Semantic Kernel**
- ChatHistorySummarizationReducer — https://learn.microsoft.com/en-us/python/api/semantic-kernel/semantic_kernel.contents.history_reducer.chat_history_summarization_reducer.chathistorysummarizationreducer
- Chat history (conceito) — https://learn.microsoft.com/en-us/semantic-kernel/concepts/ai-services/chat-completion/chat-history

**AutoGen**
- Memory and RAG — https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/memory.html
- Mem0 com AutoGen — https://microsoft.github.io/autogen/0.2/docs/ecosystem/mem0/

**CrewAI**
- Memory — https://docs.crewai.com/en/concepts/memory

**Mem0**
- What is Agentic AI & Why Memory is the Missing Piece — https://mem0.ai/blog/what-is-agentic-ai-why-memory-is-the-missing-piece
- Paper (arXiv) — https://arxiv.org/html/2504.19413v1

**Letta / MemGPT**
- Memory Blocks — https://www.letta.com/blog/memory-blocks
- Research background / conceitos — https://docs.letta.com/concepts/letta/
- MemGPT Agents (legacy) — https://docs.letta.com/guides/legacy/memgpt_agents_legacy

# Retrieval e Memória Vetorial para Histórico de Conversa Dinâmico e Compacto

Pesquisa sobre técnicas para dar a um agente de IA um histórico de conversa **dinâmico** (recupera só o que importa em cada turno) e **compacto** (não joga todo o histórico no contexto, economizando tokens, latência e custo). Foco em blogs técnicos de bancos vetoriais/RAG (Pinecone, Weaviate, Qdrant, Redis, Mem0) e literatura aplicada a memória conversacional.

---

## TL;DR (resumo executivo)

O padrão dominante em produção é a **memória híbrida**: um *buffer de curto prazo* (últimas N mensagens cruas no contexto) + uma *memória de longo prazo* em vector store, da qual se **recupera apenas os trechos relevantes** para o turno atual, em vez de reenviar tudo. Em cima disso somam-se: **scoring multidimensional** (relevância semântica + recência + importância), **consolidação/deduplicação** para evitar ruído, **busca híbrida** (densa + esparsa/BM25) para precisão, e **granularidade certa** dos embeddings (segmentos de tópico costumam vencer turno-a-turno e sessão inteira).

---

## 1. Arquitetura híbrida: buffer de curto prazo + vector store de longo prazo

**Como funciona.** Separa-se a memória em dois níveis:
- **Curto prazo (working memory):** as últimas 4–15 mensagens cruas da sessão, mantidas diretamente no contexto / num checkpointer (ex.: LangGraph + Redis com leitura/escrita sub-milissegundo). Garante coerência e referência imediata.
- **Longo prazo:** fatos/mensagens importantes virados embeddings num vector store; recuperados por similaridade quando o usuário toca em algo do passado fora da janela atual.

O fluxo de recuperação típico (Redis) é **híbrido em camadas**: primeiro lookup estruturado (match exato por user_id, timestamp, preferência), depois busca vetorial semântica como segunda passada, injetando só os resultados de alta similaridade.

**Trade-offs.**
- Curto prazo: latência mínima e controle, mas limitado pelo tamanho da janela de contexto (risco de overflow).
- Longo prazo: volume praticamente ilimitado, mas **polui a recuperação** se não houver decaimento/consolidação; exige pipeline de embedding/vetorização (mais complexidade).

**Quando usar.** Praticamente todo agente conversacional multi-sessão. O buffer resolve o "agora"; o vector store resolve "lembrar de algo dito há 2 semanas" sem inflar cada prompt.

Fontes: [Redis – short-term & long-term memory](https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/), [Memory Systems for Conversational RAG](https://www.elegantsoftwaresolutions.com/blog/building-rag-systems-memory), [Zep/3 tipos de memória](https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/)

---

## 2. Retrieval de mensagens relevantes em vez de todo o histórico (o coração da memória "compacta")

**Como funciona.** Em vez de concatenar a conversa inteira, embeda-se a query/turno atual e busca-se por similaridade de cosseno os **top-k trechos** mais relacionados do histórico. Só esses entram no prompt. Pinecone descreve exatamente isso: o chatbot "retém as partes da conversa relevantes para o usuário em memória de longo prazo e as usa para adicionar contexto a conversas subsequentes semanticamente relacionadas".

**Trade-offs.**
- Recuperar poucos (ex.: **top-5**) funciona melhor na prática: a experiência do Pinecone foi que "buscar 5 mensagens similares funcionou melhor — mais do que isso aumentava custo de tokens e latência de resposta".
- Risco de **perder contexto sequencial** (fragmentação): a similaridade pode trazer mensagens isoladas sem o fio narrativo. Mitiga-se mantendo o buffer recente em paralelo.

**Quando usar.** Sempre que o histórico cresce além do que cabe (ou compensa pagar) na janela. É a técnica central para histórico **compacto e dinâmico**.

Fontes: [Pinecone – Chatbots](https://www.pinecone.io/learn/chatbots-with-pinecone/), [Pinecone – Memory for Open-Source LLMs](https://www.pinecone.io/blog/memory-for-open-source-llms/), [Chatbot com memória ilimitada (OpenAI+Pinecone)](https://hybrowlabs.com/blog/how-to-create-a-chatbot-with-unlimited-memory-using-openai-and-pinecone)

---

## 3. Scoring multidimensional: relevância × recência × importância (Generative Agents, Stanford)

**Como funciona.** Em vez de rankear só por similaridade, o paper *Generative Agents* (Park et al., 2023) combina três sinais, cada um normalizado em [0,1] e somados (na versão original com peso igual): `retrieval_score = relevância + recência + importância`.
- **Relevância:** similaridade de cosseno entre embedding do memo e da query.
- **Recência:** *decaimento exponencial* desde o último acesso (memórias recentes pesam mais).
- **Importância:** nota de 1–10 atribuída por um LLM ("quão significativo foi este evento").

Sem isso, agentes com milhares de observações recuperavam memórias quase aleatoriamente; o scoring triplo resolveu.

**Trade-offs.** Adiciona custo (chamada de LLM para importância, manutenção de timestamps de acesso). Os pesos precisam de tuning por domínio — relevância pura ignora "o que importou", recência pura esquece fatos antigos cruciais.

**Quando usar.** Agentes de longa duração / "companheiros" persistentes, onde tanto fatos antigos importantes quanto contexto recente precisam coexistir.

Fontes: [Generative Agents (arXiv 2304.03442)](https://ar5iv.labs.arxiv.org/html/2304.03442), [Why Importance Scoring Changes Everything (DEV)](https://dev.to/anajuliabit/why-importance-scoring-changes-everything-for-agent-memory-42ic), [strata-core issue #1637 – fórmula](https://github.com/stratalab/strata-core/issues/1637)

---

## 4. Recency weighting e decaimento (memory decay)

**Como funciona.** Aplica-se peso por tempo na recuperação (timestamp metadata) e/ou expiração ativa. Redis combina **TTL/eviction policies** com **recency scoring** para que memórias velhas e irrelevantes não poluam os resultados.

**Trade-offs.** Decaimento agressivo descarta fatos antigos que voltam a ser relevantes; decaimento fraco deixa o índice crescer e dilui precisão. Geralmente recência é **um fator de re-ranking**, não um filtro duro (combina-se com importância — ver seção 3).

**Quando usar.** Domínios onde frescor importa (preferências mutáveis, estado do usuário) e onde o índice cresceria sem limite.

Fontes: [Redis – memory management](https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/), [Architecture of AI agent memory systems](https://www.analyticsvidhya.com/blog/2026/04/memory-systems-in-ai-agents/)

---

## 5. Memória episódica vs. semântica (e procedural)

**Como funciona.**
- **Episódica:** registra interações/eventos específicos ("usuário reservou viagem a Londres em abril"). Recuperação prioriza **precisão** com filtros contextuais fortes.
- **Semântica:** conhecimento generalizado, fatos, regras destilados de muitos eventos. Recuperação favorece **recall alto** para fundamentar raciocínio.
- **Procedural:** estratégias aprendidas ("processo ótimo de reserva de voo").

Mem0 chega a ponderar por tipo na recuperação: `relevância × recência × type_weight` (semantic 0.6, episodic 0.3, procedural 0.1), injetando top-5 em <200 tokens.

**Trade-offs.** Tratar tudo como uma pilha indistinta de embeddings funciona mal: vector DBs cobrem episódica razoavelmente, mas têm dificuldade com semântica (relações) e são errados para *state memory*. Por isso o vector DB costuma ser **um componente** da camada de memória, não a camada inteira.

**Quando usar.** Distinguir os tipos compensa quando há personalização forte: episódica para "o que aconteceu", semântica para "quem é o usuário / regras do domínio".

Fontes: [Atlan – Episodic Memory for AI Agents](https://atlan.com/know/episodic-memory-ai-agents/), [Atlan – Agentic Memory vs Vector DB](https://atlan.com/know/agentic-ai-memory-vs-vector-database/), [Mem0 – Long-term memory](https://mem0.ai/blog/long-term-memory-ai-agents)

---

## 6. Consolidação e deduplicação de memória (mantendo o índice limpo e compacto)

**Como funciona.** Em vez de fazer *append* de cada interação (o que gera ruído de recuperação, diluição de contexto e picos de latência), roda-se um pipeline — frequentemente **assíncrono em background ao fim da sessão**:
1. **Extração:** transformar conversa crua em fatos estruturados com metadados (user_id, timestamp, negações). Mem0 nota que "60–70% dos tokens são small talk, repetição ou raciocínio transitório".
2. **Consolidação/dedup:** embeddings com similaridade > 0.85 disparam *merge* (vetores médios + resolução de conflito por LLM); clusters dentro de 0.9 são deduplicados. Resultado relatado: **−60% de storage e +22% de precisão de recuperação**.
3. **Consolidação episódica → semântica:** identificar padrões entre interações e destilá-los em conhecimento reutilizável (generalização).

Anthropic formalizou isso com a *Memory tool* (beta, abr/2026) e o recurso *Dreaming* (mai/2026): consolidação assíncrona de fatos curados entre sessões.

**Trade-offs.** Merge por LLM custa e pode introduzir erros de conflito; thresholds precisam de calibração (dedup agressivo perde nuance). Mas é o que evita o *failure mode* de "vector store que só cresce".

**Quando usar.** Qualquer agente que acumula memória ao longo de muitas sessões.

Fontes: [Mem0 – Long-term memory](https://mem0.ai/blog/long-term-memory-ai-agents), [MachineLearningMastery – 3 tipos de LTM](https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/), [Mem0 – Architecture of Remembrance](https://mem0.ai/blog/what-is-ai-agent-memory)

---

## 7. Compactação / sumarização rolante do histórico (a alternativa/complemento ao retrieval)

**Como funciona.** "Rolling summary": mantém-se as últimas N mensagens em detalhe + um **resumo compacto incremental** de tudo o que é mais antigo. Disparado por estado ("ao atingir ~70% do budget de tokens, resuma a parte mais antiga"), de forma **incremental** (resumo existente + novo trecho → resumo atualizado), sem re-sumarizar tudo. Estratégias compostas combinam *tool-result compaction* + *summarization* + *sliding window* com fallback de exclusão oldest-first.

A *Compaction API* da Anthropic (beta, fev/2026) automatiza isso, viabilizando conversas "efetivamente infinitas".

**Trade-offs.** Sumarização tem **perda de informação** (detalhes específicos somem) — daí combinar com retrieval vetorial dos fatos brutos quando precisão fina importa. É barato e simples, mas não recupera seletivamente: comprime, não seleciona.

**Quando usar.** Conversas longas de sessão única; ótimo *complemento* ao retrieval (resumo para o "fio geral" + retrieval para detalhes pontuais).

Fontes: [Microsoft – Compaction](https://learn.microsoft.com/en-us/agent-framework/agents/conversations/compaction), [Mem0 – Chat history summarization](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025), [Fundamentals of Context Management (Medium)](https://kargarisaac.medium.com/the-fundamentals-of-context-management-and-compaction-in-llms-171ea31741a2)

---

## 8. Busca híbrida (densa + esparsa/BM25) para a recuperação da memória

**Como funciona.** Combina retrieval **denso** (embeddings/Transformers — semântica) com **esparso** (BM25/SPLADE — match lexical exato), fundindo os rankings (ex.: RRF). Weaviate, Qdrant e Elasticsearch suportam nativamente; o Qdrant roda BM25 + denso numa única query e aplica RRF internamente.

**Trade-offs.** Ganho de recall expressivo — relatado **91% recall@10 (híbrido)** vs. 78% denso-only vs. 65% esparso-only — ao custo de mais um índice/pipeline. Esparso pega nomes próprios, IDs e termos raros que o denso erra; denso pega paráfrase que o esparso erra.

**Quando usar.** Memória que mistura linguagem natural com termos exatos (nomes, códigos, jargão). Para conversa pura, ajuda quando o usuário referencia palavras-chave específicas ditas antes.

Fontes: [Weaviate – Hybrid Search Explained](https://weaviate.io/blog/hybrid-search-explained), [Qdrant – Agentic Builders Guide](https://qdrant.tech/articles/agentic-builders-guide/), [Sparse vs Dense Retrieval (ML Journey)](https://mljourney.com/sparse-vs-dense-retrieval-for-rag-bm25-embeddings-and-hybrid-search/)

---

## 9. Granularidade dos embeddings de turnos de conversa (o que exatamente embedar)

**Como funciona.** Há várias unidades possíveis para indexar a conversa:
- **Turno-a-turno:** granular demais → contexto fragmentário e incompleto.
- **Sessão inteira:** grosso demais → muita informação irrelevante por chunk.
- **Resumo:** compacto, mas sofre **perda de informação**.
- **Segmentos por tópico** (ex.: SeCom segmenta por coerência) e **multi-granularidade** (ex.: MemGAS codifica turno + sessão + resumo + keyword e roteia a granularidade ótima por entropia).

A conclusão da literatura: **segmentação por tópico / multi-granularidade tende a dar maior precisão de recuperação** do que turno ou sessão isolados.

**Trade-offs.** Segmentação e multi-granularidade aumentam complexidade (modelo de segmentação, múltiplos índices). Resumo é o mais compacto, mas menos fiel; turno é o mais simples, mas fragmenta.

**Quando usar.** Comece com chunks por tópico/segmento se a conversa tem assuntos distintos; multi-granularidade quando precisão de recuperação é crítica e há budget de engenharia.

Fontes: [On Memory Construction and Retrieval (arXiv 2502.05589)](https://arxiv.org/pdf/2502.05589), [SGMem (arXiv 2509.21212)](https://arxiv.org/pdf/2509.21212), [Long-Term Dialogue Memory (EmergentMind)](https://www.emergentmind.com/topics/long-term-dialogue-memory)

---

## Recomendação prática (síntese para o caso de "histórico dinâmico e compacto")

1. **Base híbrida:** buffer cru das últimas ~6–15 mensagens + vector store de longo prazo. (seções 1, 2)
2. **Recupere top-5 por turno**, não o histórico inteiro; combine relevância + recência (+ importância se for agente persistente). (seções 2, 3, 4)
3. **Indexe por segmento/tópico**, não turno solto nem sessão inteira. (seção 9)
4. **Consolide/deduplique em background** ao fim da sessão (extrai fatos, faz merge > 0.85). (seção 6)
5. **Sumarização rolante** como camada de "fio geral" + retrieval para detalhes finos. (seção 7)
6. **Busca híbrida (denso+BM25)** se houver termos exatos/nomes relevantes. (seção 8)

---

## Fontes

- Redis – Build smarter AI agents: short-term & long-term memory: https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/
- Redis – AI agent memory: types, architecture & implementation: https://redis.io/blog/ai-agent-memory-stateful-systems/
- Pinecone – Chatbots with Pinecone: https://www.pinecone.io/learn/chatbots-with-pinecone/
- Pinecone – Memory for Open-Source LLMs: https://www.pinecone.io/blog/memory-for-open-source-llms/
- Chatbot com memória ilimitada (OpenAI + Pinecone): https://hybrowlabs.com/blog/how-to-create-a-chatbot-with-unlimited-memory-using-openai-and-pinecone
- Weaviate – Hybrid Search Explained: https://weaviate.io/blog/hybrid-search-explained
- Qdrant – Agentic Builders Guide: https://qdrant.tech/articles/agentic-builders-guide/
- Sparse vs Dense Retrieval for RAG (BM25, embeddings, hybrid): https://mljourney.com/sparse-vs-dense-retrieval-for-rag-bm25-embeddings-and-hybrid-search/
- Mem0 – Long-Term Memory for AI Agents: https://mem0.ai/blog/long-term-memory-ai-agents
- Mem0 – What is AI Agent Memory (Architecture of Remembrance): https://mem0.ai/blog/what-is-ai-agent-memory
- Mem0 – LLM Chat History Summarization Guide: https://mem0.ai/blog/llm-chat-history-summarization-guide-2025
- Generative Agents: Interactive Simulacra of Human Behavior (arXiv 2304.03442): https://ar5iv.labs.arxiv.org/html/2304.03442
- Why Importance Scoring Changes Everything for Agent Memory (DEV): https://dev.to/anajuliabit/why-importance-scoring-changes-everything-for-agent-memory-42ic
- strata-core – Implement Generative Agents memory scoring (issue #1637): https://github.com/stratalab/strata-core/issues/1637
- Atlan – Episodic Memory for AI Agents: https://atlan.com/know/episodic-memory-ai-agents/
- Atlan – Agentic AI Memory vs Vector Database: https://atlan.com/know/agentic-ai-memory-vs-vector-database/
- Analytics Vidhya – Architecture and Orchestration of Memory Systems in AI Agents: https://www.analyticsvidhya.com/blog/2026/04/memory-systems-in-ai-agents/
- MachineLearningMastery – Beyond Short-term Memory: 3 Types of Long-term Memory: https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/
- Memory Systems for Conversational RAG (Elegant Software Solutions): https://www.elegantsoftwaresolutions.com/blog/building-rag-systems-memory
- Microsoft Learn – Compaction: https://learn.microsoft.com/en-us/agent-framework/agents/conversations/compaction
- Fundamentals of Context Management and Compaction in LLMs (Medium): https://kargarisaac.medium.com/the-fundamentals-of-context-management-and-compaction-in-llms-171ea31741a2
- On Memory Construction and Retrieval for Personalized Conversational Agents (arXiv 2502.05589): https://arxiv.org/pdf/2502.05589
- SGMem: Sentence Graph Memory for Long-Term Conversational Agents (arXiv 2509.21212): https://arxiv.org/pdf/2509.21212
- Long-Term Dialogue Memory (EmergentMind): https://www.emergentmind.com/topics/long-term-dialogue-memory

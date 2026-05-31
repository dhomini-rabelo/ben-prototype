# Técnicas Acadêmicas para Histórico de Conversa Dinâmico e Compacto em Agentes de IA / LLMs

> Pesquisa focada em papers acadêmicos (arXiv, NeurIPS, ICLR, surveys) sobre gerenciamento de janela de contexto, compressão de histórico de diálogo, memória por sumarização, orçamento de tokens, janela deslizante, attention sink, técnicas de longo contexto e memória aumentada por recuperação (2023–2026).
>
> Data: 2026-05-31

---

## Sumário Executivo

O problema central: em conversas longas, o histórico cresce indefinidamente, mas a janela de contexto e o custo de inferência são finitos (o custo do transformer escala com o comprimento do contexto, e contextos muito longos *diluem* a informação relevante — o efeito "lost in the middle"). Logo, precisamos de um histórico **dinâmico** (decide o que manter/descartar/recuperar a cada turno) e **compacto** (mínimo de tokens preservando o que importa).

As técnicas se dividem em grandes famílias:

1. **Sumarização (recursiva / hierárquica / por segmentos)** — comprime turnos antigos em resumos.
2. **Janela deslizante + âncoras (attention sink)** — mantém apenas o recente + tokens iniciais.
3. **Gerenciamento de contexto virtual / paginação (estilo SO)** — MemGPT/Letta: move memória entre "RAM" (contexto) e "disco" (storage externo).
4. **Memória aumentada por recuperação (RAG de memória)** — armazena histórico em DB vetorial e recupera só o relevante por turno.
5. **Compressão de prompt (hard/soft)** — LLMLingua e variantes: remove tokens de baixa informação.
6. **Eviction de KV-cache (heavy hitters)** — H2O: nível de inferência, mantém tokens de alta atenção.
7. **Memória agêntica / estruturada** — A-MEM, memórias episódica/semântica/procedural; o agente gerencia a própria memória.

Abaixo, cada técnica com nome, funcionamento, prós/contras, quando usar e fonte.

---

## 1. Sumarização Recursiva (Recursive Summarization)

**Paper:** *Recursively Summarizing Enables Long-Term Dialogue Memory in Large Language Models* (Wang et al., 2023; publicado em Neurocomputing 2025) — arXiv:2308.15022

**Como funciona (3 passos):**
1. O LLM memoriza pequenos contextos de diálogo, gerando uma memória inicial.
2. Recursivamente, produz nova memória combinando a *memória anterior* + o *contexto seguinte* (resumo de resumos, acumulativo).
3. Gera a resposta usando a memória mais recente, mantendo consistência ao longo de toda a conversa.

Em vez de armazenar a conversa inteira, comprime hierarquicamente: resumos alimentam resumos seguintes, criando um store de conhecimento de longo prazo compacto.

**Prós:**
- Lida com conversas muito além da janela de contexto.
- Complementa modelos de longo contexto e RAG (é ortogonal).
- Funciona com modelos open e proprietários, sem fine-tuning.

**Contras:**
- Perda de informação cumulativa: erros/omissões num resumo se propagam (degradação da qualidade do resumo ao longo das iterações).
- Custo extra de chamadas de LLM para sumarizar.
- Detalhes finos podem ser perdidos irreversivelmente (não há como "voltar" ao texto original).

**Quando usar:** conversas longas multi-sessão onde consistência factual importa mais do que o texto literal; quando não há infraestrutura de DB vetorial.

**Fonte:** https://arxiv.org/abs/2308.15022

---

## 2. Buffer + Sumarização Híbrida (Conversation Summary Buffer)

**Origem:** padrão amplamente usado (LangChain `ConversationSummaryBufferMemory`); base conceitual em sumarização recursiva.

**Como funciona:** mantém um **buffer verbatim** das interações recentes (alta fidelidade) e, quando o buffer ultrapassa um **limite de tokens**, "descarrega" (flush) as interações mais antigas comprimindo-as em um **resumo corrente**. Usa comprimento em *tokens* (não número de turnos) como gatilho. O prompt final = resumo acumulado + janela recente literal.

**Prós:**
- Equilíbrio direto entre fidelidade recente e compactação antiga.
- Orçamento de tokens explícito e controlável.
- Trivial de implementar; é o "default" pragmático de produção.

**Contras:**
- O resumo único pode virar gargalo (mesma degradação da sumarização recursiva).
- Não recupera seletivamente: tudo que saiu do buffer só existe na forma resumida.

**Quando usar:** caso geral de chatbots de produção; bom ponto de partida antes de adotar RAG de memória.

**Arquitetura em camadas (recomendada por surveys):** (a) buffer de curto prazo verbatim; (b) camada de sumarização que condensa o antigo; (c) repositório de longo prazo entre sessões.

**Fontes:**
- https://reference.langchain.com/python/langchain-classic/memory/summary_buffer/ConversationSummaryBufferMemory
- https://www.pinecone.io/learn/series/langchain/langchain-conversational-memory/

---

## 3. Árvore de Agregação Hierárquica (Hierarchical Aggregate Tree)

**Paper:** *Enhancing Long-Term Memory using Hierarchical Aggregate Tree for Retrieval Augmented Generation* (2024) — arXiv:2406.06124

**Como funciona:** estrutura de dados em árvore que combina sumarização **e** recuperação. Folhas = segmentos de conversa; nós internos = resumos agregados de seus filhos, recursivamente até a raiz. Na hora de responder, percorre a árvore para recuperar o resumo no nível de granularidade certo (do detalhe específico ao panorama geral).

**Prós:**
- Granularidade *multi-nível*: pode trazer detalhe fino ou visão macro conforme a pergunta.
- Une o melhor de sumarização (compactação) e RAG (seletividade).

**Contras:**
- Manutenção da árvore é complexa (rebalanceamento/re-sumarização ao inserir).
- Mais engenharia que um buffer simples.

**Quando usar:** assistentes de longo prazo onde perguntas variam entre "o que decidimos na semana passada" (macro) e "qual era o nome exato do arquivo" (micro).

**Fonte:** https://arxiv.org/pdf/2406.06124

---

## 4. Gerenciamento de Contexto Virtual / Paginação estilo SO (MemGPT)

**Paper:** *MemGPT: Towards LLMs as Operating Systems* (Packer et al., 2023) — arXiv:2310.08560 (projeto evoluiu para **Letta**)

**Como funciona:** inspirado em **memória virtual de sistemas operacionais**. Separa:
- **Main context** (prompt buffer limitado, a "RAM") e
- **External context** (storage arquival ilimitado, o "disco").

O LLM usa **function calling** para paginar dados entre os dois níveis: lê/escreve em fontes externas, edita o próprio contexto e decide quando responder. Quando o contexto principal se aproxima da capacidade, dispara **sumarização recursiva** para liberar espaço. Dá a *ilusão* de contexto infinito sobre um modelo de contexto fixo.

**Prós:**
- Ganhos grandes em retrieval profundo (+54,2% GPT-3.5, +60,4% GPT-4 no paper) e QA multi-documento.
- O agente gerencia ativamente a própria memória (auto-edição).
- Funciona com qualquer modelo de contexto fixo.

**Contras:**
- Depende fortemente de function calling confiável; mais chamadas de LLM = mais latência/custo.
- Complexidade de orquestração; políticas de paginação precisam ser ajustadas.

**Quando usar:** agentes autônomos de longa duração, com necessidade de persistência entre sessões e acesso a grandes bases.

**Fontes:**
- https://arxiv.org/abs/2310.08560
- https://arxiv.org/pdf/2310.08560

---

## 5. Memória Aumentada por Recuperação (RAG de Memória) + Granularidade

### 5a. MemoryBank
**Paper:** *MemoryBank: Enhancing Large Language Models with Long-Term Memory* (Zhong et al., 2024).
**Como funciona:** sumariza eventos passados como *registros de memória*; recupera-os via embeddings quando relevantes. Incorpora um mecanismo de esquecimento inspirado na **curva de Ebbinghaus** (memórias decaem com o tempo conforme acesso).

### 5b. SeCom — granularidade por segmentos (estado da arte recente)
**Paper:** *On Memory Construction and Retrieval for Personalized Conversational Agents* (ICLR 2025) — arXiv:2502.05589

**Achados-chave sobre granularidade:** métodos por **turno**, por **sessão** e por **sumarização** têm, cada um, limitações em *acurácia de recuperação* e *qualidade semântica*. Solução proposta (**SeCom**):
1. Um **modelo de segmentação** parte a conversa em segmentos topicamente coerentes (granularidade intermediária, melhor que turno ou sessão).
2. Aplica **denoising por compressão de prompt** nas unidades de memória.

**Descoberta notável:** **LLMLingua-2** (compressão de prompt) funciona como **mecanismo de denoising**, aumentando a acurácia de recuperação em todas as granularidades — ou seja, comprimir não só economiza tokens, também *limpa ruído* e melhora o retrieval.

**Prós (RAG de memória em geral):**
- Recupera *só* o relevante por turno → contexto enxuto, custo baixo.
- Escala para histórico arbitrariamente grande.
- Granularidade de segmento equilibra precisão e contexto.

**Contras:**
- Qualidade depende de embeddings/segmentação; recuperação ruim = resposta ruim.
- Granularidade ótima é não-trivial (turno é fragmentado demais; sessão é grosseira demais).
- Infra adicional (DB vetorial, pipeline de indexação).

**Quando usar:** assistentes personalizados de longa duração, multi-sessão, com fatos estáveis do usuário a recuperar.

**Fontes:**
- https://arxiv.org/abs/2502.05589
- https://github.com/Shichun-Liu/Agent-Memory-Paper-List (lista de papers de memória de agentes)

---

## 6. Compressão de Prompt (LLMLingua / LLMLingua-2)

**Papers:**
- *LLMLingua: Compressing Prompts for Accelerated Inference* (Jiang et al., 2023) — arXiv:2310.05736
- *Prompt Compression for LLMs: A Survey* (2024) — arXiv:2410.12388

**Como funciona:** reduz o número de tokens de um prompt preservando o sentido. Duas famílias:
- **Hard prompt (token-level, "filtragem"):** remove tokens de baixa informação, resultado ainda é texto natural (menos fluente). Ex.: SelectiveContext, LLMLingua. **LLMLingua-2** treina um classificador (via destilação de dados) para decidir quais tokens reter. **Generaliza entre modelos.**
- **Soft prompt (encoding):** codifica o prompt em vetores latentes contínuos (tokens especiais não legíveis por humanos). Ex.: Nano-Capsulator, 500xCompressor. Mais compacto, porém atado ao modelo.

LLMLingua usa: *budget controller* (mantém integridade semântica sob alta taxa), compressão iterativa token-a-token e alinhamento de distribuição. Reporta **até 20x de compressão com queda de só ~1,5 ponto**.

**Prós:**
- Reduz drasticamente custo/latência de cada chamada.
- Hard prompt generaliza entre LLMs.
- Bônus: serve como **denoising** (melhora retrieval — ver SeCom).

**Contras:**
- Risco de descartar informação crítica em taxas altas.
- Soft prompt não é interpretável e é específico de modelo.
- Custo do próprio compressor.

**Quando usar:** quando o prompt (histórico + documentos recuperados) é grande e o gargalo é custo/latência por token; ótimo pós-RAG para "limpar" o contexto recuperado.

**Fontes:**
- https://arxiv.org/abs/2310.05736
- https://arxiv.org/html/2410.12388v2

---

## 7. Janela Deslizante + Attention Sink (StreamingLLM)

**Paper:** *Efficient Streaming Language Models with Attention Sinks* (Xiao et al., ICLR 2024) — arXiv:2309.17453

**Fenômeno (attention sink):** os **tokens iniciais** recebem scores de atenção altíssimos mesmo sem importância semântica. Causa: o softmax força a soma das atenções = 1, e os primeiros tokens são visíveis a quase todos os subsequentes (natureza autorregressiva), virando um "ralo" (sink) de atenção. Descartar esses tokens iniciais ao deslizar a janela **quebra** o modelo.

**Como funciona o StreamingLLM:** mantém **(a) os poucos tokens iniciais (attention sinks) + (b) a janela recente de tokens**, descartando os intermediários — sem reset de cache nem fine-tuning. Permite gerar texto coerente sobre sequências de **até 4 milhões de tokens**.

**Prós:**
- Geração de comprimento "infinito" estável e eficiente.
- Sem fine-tuning; já integrado a HuggingFace, TensorRT-LLM, etc.

**Contras:**
- É *eficiência de inferência*, **não memória de longo prazo**: os tokens intermediários descartados são *esquecidos de fato* (não há recuperação). Não substitui sumarização/RAG para lembrar conteúdo antigo.

**Quando usar:** streaming de gerações muito longas (assistentes always-on) onde o gargalo é o KV-cache, não a recordação de fatos antigos. Combine com RAG/sumarização para memória real.

**Fontes:**
- https://arxiv.org/abs/2309.17453
- https://hanlab.mit.edu/projects/streamingllm
- https://github.com/mit-han-lab/streaming-llm

---

## 8. Eviction de KV-Cache por Heavy Hitters (H2O)

**Paper:** *H2O: Heavy-Hitter Oracle for Efficient Generative Inference* (Zhang et al., NeurIPS 2023) — arXiv:2306.14048

**Como funciona:** observação central — uma pequena fração de tokens (os **Heavy Hitters**, H2) concentra a maior parte dos scores de atenção. H2O é uma política de **eviction do KV-cache** que mantém um equilíbrio entre tokens **recentes** (janela deslizante) e os **heavy hitters** (maior atenção cumulativa), despejando os de menor atenção. Formulado como problema submodular dinâmico com garantia teórica.

**Prós:**
- Até **29x** de throughput vs. DeepSpeed Zero-Inference; até **1,9x** menos latência.
- Mantém qualidade com só ~20% dos tokens no cache.

**Contras:**
- Nível de inferência (KV-cache) — não é memória conversacional explícita.
- Tokens despejados não são recuperáveis.

**Quando usar:** otimização de servição/inferência de modelos de contexto longo; ortogonal às técnicas de aplicação (sumarização, RAG).

**Fontes:**
- https://arxiv.org/abs/2306.14048
- https://proceedings.neurips.cc/paper_files/paper/2023/file/6ceefa7b15572587b78ecfcebb2827f8-Paper-Conference.pdf

---

## 9. Memória Agêntica e Estruturada (A-MEM, MIRIX) + Tipos de Memória

### 9a. A-MEM — memória agêntica estilo Zettelkasten
**Paper:** *A-MEM: Agentic Memory for LLM Agents* (Xu et al., NeurIPS 2025) — arXiv:2502.12110

**Como funciona:** estruturação **dinâmica** de memória, sem operações estáticas pré-definidas. Ao adicionar uma memória, gera uma *nota* com atributos estruturados (descrição contextual, keywords, tags); analisa memórias históricas e cria **links** onde há similaridade significativa (princípio Zettelkasten). Há **evolução da memória**: novas memórias podem atualizar os atributos/contexto de memórias antigas — rede de conhecimento que se refina continuamente.

**Prós:** organização adaptativa e interconectada; supera baselines SOTA em 6 modelos.
**Contras:** complexidade alta; depende da qualidade das notas geradas pelo LLM.

### 9b. Taxonomia de tipos de memória (surveys 2025–2026)
Sistemas modernos (ex.: **MIRIX**) implementam módulos especializados:
- **Curto prazo** — workspace imediato do contexto atual (capacidade limitada).
- **Episódica (longo prazo)** — experiências/eventos passados específicos.
- **Semântica** — resumos de alto nível, fatos estáveis, perfil do usuário.
- **Procedural** — regras, estratégias e padrões de ação aprendidos.

Mecanismo de aprendizado contínuo: **consolidação de experiência episódica em ativos semânticos** (do específico ao geral), análogo à memória humana.

**Quando usar:** agentes autônomos persistentes, multi-tarefa, que aprendem ao longo do tempo.

**Fontes:**
- https://arxiv.org/abs/2502.12110
- https://github.com/WujiangXu/A-mem
- Survey: *From Storage to Experience: A Survey on the Evolution of LLM Agent Memory Mechanisms* — https://www.preprints.org/manuscript/202601.0618
- Survey: *LLM Agent Memory: A Survey from a Unified Representation–Management Perspective* — https://www.preprints.org/manuscript/202603.0359
- Survey: *Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers* — https://arxiv.org/html/2603.07670v1

---

## 10. Compressão Ativa de Contexto em Agentes (intra-trajetória)

**Papers:**
- *Acon: Optimizing Context Compression for Long-horizon LLM Agents* (2025) — arXiv:2510.00615
- *Active Context Compression: Autonomous Memory Management in LLM Agents* (2026) — arXiv:2601.07190

**Como funciona:** o agente **poda ativamente o próprio histórico durante uma única tarefa** (compressão intra-trajetória), preservando aprendizados num bloco de conhecimento estruturado, em vez de carregar toda a trajetória de ferramentas/observações.

**Prós:** controla o crescimento do contexto em tarefas longas (muitas chamadas de ferramenta); reduz a "diluição" do contexto.
**Contras:** decidir o que podar é arriscado (pode descartar algo necessário depois); área ainda recente.

**Quando usar:** agentes ReAct/tool-use de horizonte longo onde observações de ferramentas inflam o contexto.

**Fontes:**
- https://arxiv.org/html/2510.00615v2
- https://arxiv.org/pdf/2601.07190

---

## Contexto/Restrição Transversal: "Lost in the Middle"

**Paper:** *Lost in the Middle: How Language Models Use Long Contexts* (Liu et al., 2023, Stanford/Berkeley/Samaya).

**Achado:** viés de atenção em **U** — modelos usam bem a informação no **início** e no **fim** do contexto, mas **ignoram o meio**, independentemente do conteúdo. Vale mesmo para janelas de 4K/16K/32K. Follow-up *Found in the Middle* (MIT/Google, 2024, arXiv:2406.16008) calibra o viés posicional para mitigar.

**Implicação prática para histórico compacto:** não basta "caber" na janela — **um contexto menor e bem posicionado supera um contexto grande e diluído**. Posicione o conteúdo mais crítico (resumo + fatos recuperados) no **início e/ou fim** do prompt. Isso justifica todas as técnicas acima: compactar e recuperar seletivamente **melhora a qualidade**, não só o custo.

**Fontes:**
- https://arxiv.org/html/2406.16008v1
- https://davidwsilva.substack.com/p/lost-in-the-middle-the-context-crisis

---

## Tabela Comparativa Rápida

| Técnica | Nível | Compacta? | Recupera seletivamente? | Esquece de fato? | Melhor para |
|---|---|---|---|---|---|
| Sumarização recursiva | Aplicação | Sim | Não | Detalhes finos | Consistência multi-sessão sem infra |
| Summary Buffer | Aplicação | Sim | Não | Antigo (só resumo) | Default de produção |
| Hierarchical Aggregate Tree | Aplicação | Sim | Sim (multi-nível) | Não | Perguntas macro+micro |
| MemGPT (contexto virtual) | Orquestração | Sim | Sim (paging) | Não (vai p/ disco) | Agentes persistentes |
| RAG de memória / SeCom | Aplicação | Sim | Sim (por segmento) | Não | Personalização longa |
| LLMLingua (compressão prompt) | Pré-processo | Sim | Não | Tokens de baixa info | Cortar custo/denoise pós-RAG |
| StreamingLLM (sink+janela) | Inferência | N/A | Não | Tokens do meio | Streaming infinito eficiente |
| H2O (KV eviction) | Inferência | N/A | Não | Tokens de baixa atenção | Throughput de servição |
| A-MEM / memória estruturada | Aplicação | Sim | Sim (grafo/links) | Não | Agentes que aprendem |
| Active Context Compression | Aplicação | Sim | Parcial | Trajetória podada | Agentes tool-use longos |

---

## Recomendação Prática (arquitetura combinável)

As famílias são **ortogonais e combináveis**. Pilha pragmática para um agente de chat com histórico dinâmico e compacto:

1. **Buffer recente verbatim** (orçamento de tokens fixo) — fidelidade imediata.
2. **Sumarização híbrida (summary buffer)** ao estourar o orçamento — comprime o antigo.
3. **RAG de memória com granularidade de segmento (SeCom)** — recupera só fatos/eventos relevantes do passado distante.
4. **Compressão de prompt (LLMLingua-2)** sobre o conteúdo recuperado — economiza tokens *e* faz denoising.
5. **Posicionamento consciente de "lost in the middle"** — críticos no início/fim do prompt.
6. (Inferência) **StreamingLLM / H2O** se o gargalo for KV-cache/latência, não recordação.
7. (Avançado) **MemGPT/Letta ou A-MEM** se o agente precisar gerenciar/evoluir a própria memória entre sessões.

---

## Fontes

### Papers principais (arXiv / conferências)
- Recursively Summarizing Enables Long-Term Dialogue Memory — https://arxiv.org/abs/2308.15022
- MemGPT: Towards LLMs as Operating Systems — https://arxiv.org/abs/2310.08560 | PDF: https://arxiv.org/pdf/2310.08560
- On Memory Construction and Retrieval for Personalized Conversational Agents (SeCom, ICLR 2025) — https://arxiv.org/abs/2502.05589
- LLMLingua: Compressing Prompts for Accelerated Inference — https://arxiv.org/abs/2310.05736
- Prompt Compression for LLMs: A Survey — https://arxiv.org/html/2410.12388v2
- Efficient Streaming Language Models with Attention Sinks (StreamingLLM, ICLR 2024) — https://arxiv.org/abs/2309.17453
- H2O: Heavy-Hitter Oracle for Efficient Generative Inference (NeurIPS 2023) — https://arxiv.org/abs/2306.14048
- A-MEM: Agentic Memory for LLM Agents (NeurIPS 2025) — https://arxiv.org/abs/2502.12110
- Enhancing Long-Term Memory using Hierarchical Aggregate Tree for RAG — https://arxiv.org/pdf/2406.06124
- Found in the Middle: Calibrating Positional Attention Bias — https://arxiv.org/html/2406.16008v1
- Acon: Optimizing Context Compression for Long-horizon LLM Agents — https://arxiv.org/html/2510.00615v2
- Active Context Compression: Autonomous Memory Management in LLM Agents — https://arxiv.org/pdf/2601.07190
- Beyond a Million Tokens: Benchmarking and Enhancing Long-Term Memory in LLMs — https://arxiv.org/html/2510.27246v1

### Surveys e listas de papers
- From Storage to Experience: A Survey on the Evolution of LLM Agent Memory Mechanisms — https://www.preprints.org/manuscript/202601.0618
- LLM Agent Memory: A Survey from a Unified Representation–Management Perspective — https://www.preprints.org/manuscript/202603.0359
- Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers — https://arxiv.org/html/2603.07670v1
- Agent-Memory-Paper-List ("Memory in the Age of AI Agents: A Survey") — https://github.com/Shichun-Liu/Agent-Memory-Paper-List

### Recursos de projeto / implementações
- StreamingLLM (MIT Han Lab) — https://hanlab.mit.edu/projects/streamingllm | https://github.com/mit-han-lab/streaming-llm
- H2O (NeurIPS proceedings) — https://proceedings.neurips.cc/paper_files/paper/2023/file/6ceefa7b15572587b78ecfcebb2827f8-Paper-Conference.pdf
- A-MEM (código) — https://github.com/WujiangXu/A-mem
- LangChain ConversationSummaryBufferMemory — https://reference.langchain.com/python/langchain-classic/memory/summary_buffer/ConversationSummaryBufferMemory
- Pinecone — Conversational Memory for LLMs with LangChain — https://www.pinecone.io/learn/series/langchain/langchain-conversational-memory/

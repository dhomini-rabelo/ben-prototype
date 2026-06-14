# Padrões de Design UI/UX e Visual — Material de Referência

> **O que é este documento.** Base de conhecimento curada para apoiar decisões de
> design de interface (UI/UX e design visual) ao alterar telas de apps mobile/web.
> A maior parte do conteúdo vem de um *deep research* multi-fonte cujas afirmações
> passaram por verificação adversarial (3 votos independentes; só sobreviveram as
> que tiveram 3-0). Fontes primárias: **Nielsen Norman Group (NNG)** e **W3C/WCAG**,
> complementadas por **Refactoring UI** e **Laws of UX**.
>
> **Como ler os selos de confiança:**
> - ✅ **Verificado (3-0)** — afirmação confirmada por verificação adversarial sobre fonte primária/citável.
> - 📐 **Convenção de plataforma** — diretriz consolidada de Apple HIG / Material Design; amplamente adotada, mas não passou pelo mesmo crivo 3-0 neste research (preenche lacunas de componentes que o research sinalizou).
>
> Última atualização: 2026-06-14. Baseado em WCAG 2.2 (W3C Recommendation, out/2023).

---

## 0. Como usar este material (para o agente consultor)

1. **Decisões devem citar um princípio.** Ao recomendar uma mudança, ancore na regra
   relevante deste doc (ex.: "aumente o contraste para ≥4.5:1 — WCAG 1.4.3").
2. **Hierarquia de autoridade quando houver conflito:**
   `WCAG (acessibilidade, mínimo legal/ético)` → `convenção da plataforma (Apple HIG / Material)` →
   `Refactoring UI / heurísticas` → `preferência estética`.
   Acessibilidade nunca é negociável para baixo.
3. **Respeite o design system existente do projeto** (`docs/design.md`, paleta
   "Warm Precision", tokens, tipografia). Estes princípios orientam *como aplicar*
   o design system, não o substituem.
4. **Contexto = mobile-first** (Ben é voice-first, telas de iPhone ~390×844).
   Priorize alvos de toque, gestos com alternativa de toque simples, e densidade
   adequada a telas pequenas.

---

## 1. Princípios de Design Visual

### 1.1 Os cinco princípios fundamentais ✅ (3-0 — NNG)

Segundo o NNG, o design visual se apoia em **cinco princípios**:

1. **Escala (Scale)** — tamanho relativo comunica importância.
2. **Hierarquia visual (Visual Hierarchy)** — guiar o olho pelos elementos *na ordem
   de sua importância*, via variações de **escala, valor (claro/escuro), cor,
   espaçamento e posicionamento**.
3. **Equilíbrio (Balance)** — distribuição estável do peso visual.
4. **Contraste (Contrast)** — justaposição de elementos visualmente diferentes para
   comunicar diferença. ⚠️ Reduzir o contraste do texto reduz a legibilidade e pode
   torná-lo inacessível.
5. **Princípios de Gestalt** — proximidade, similaridade, fechamento (closure) e
   região comum (common region).

> Aplicação: recomende **2–3 tamanhos de fonte** para estabelecer hierarquia, não
> mais. Use proximidade/região comum para agrupar itens relacionados (ex.: um card).

**Fonte:** https://www.nngroup.com/articles/principles-visual-design/

### 1.2 Tipografia e cor com contenção ✅ (3-0 — Refactoring UI)

- **Pesos de fonte:** dois pesos costumam bastar para UI — **normal (400–500)** para
  a maioria do texto e **bold (600–700)** para ênfase. Evite pesos muito leves (<400)
  em texto pequeno.
- **Cores de texto:** use **2–3 cores** — escura (primária), cinza (secundária) e
  cinza mais claro (terciária/auxiliar). Em vez de hierarquizar só por tamanho.
- **"Emphasize by de-emphasizing"** — destaque o elemento primário **reduzindo** a
  ênfase dos concorrentes, em vez de aumentar o primário indefinidamente.

**Fonte:** Refactoring UI (Wathan & Schoger) — *7 Practical Tips for Cheating at Design*.

### 1.3 Escalas de tipo e espaçamento não-lineares ✅ (3-0 — Refactoring UI)

- Não use escala linear. Use uma **escala não-linear escolhida à mão**, com ~**25%
  de diferença relativa** entre passos adjacentes.
- Exemplo de escala (px): **4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256**.
- Acima de 16px os passos podem afrouxar um pouco (aproximadamente 25%).
- Isso vale tanto para **font-size** quanto para **spacing/whitespace** — e é a base
  dos defaults do Tailwind (mesmos autores).

> Aplicação: ao adicionar espaçamentos/tamanhos novos, escolha um valor **da escala**,
> nunca um número arbitrário (ex.: prefira `24px` a `22px`).

**Fonte:** https://howtoes.blog/2025/07/04/refactoring-ui-complete-book-summary-all-key-ideas/

### 1.4 Cor: paletas completas e nunca como único indicador ✅ (3-0)

- Construa **paletas completas**: uma UI complexa pode precisar de **até ~10 cores**,
  cada uma com **5–10 tons (shades)** — não apenas "uma cor primária".
- Defina cores preferencialmente em **HSL** (mais intuitivo para gerar tons
  consistentes). *Caveat:* a recomendação específica de HSL vem de resumos
  secundários do Refactoring UI; o ponto forte e oficial é a quantidade de tons.
- **Cor nunca é o único portador de significado** (alinha com WCAG 1.4.1 Use of Color).
  Erros, estados e categorias precisam de ícone/texto/forma além da cor.

**Fontes:** Refactoring UI — *Building Your Color Palette*; WCAG 2.1/2.2 SC 1.4.1.

### 1.5 Whitespace, grid e layout 📐

- **Whitespace é ativo**, não desperdício: agrupa (Gestalt — proximidade), cria
  respiro e hierarquia. Espaço *entre* grupos > espaço *dentro* de um grupo.
- **Alinhamento:** alinhe elementos a um grid/baseline consistente; desalinhamentos
  pequenos lêem como "quebrado".
- **Grid responsivo:** em mobile, prefira layout de **coluna única** com seções
  empilhadas; reserve grids multi-coluna para conteúdo realmente tabular.

---

## 2. Padrões de UX — Heurísticas de Nielsen

As 10 heurísticas de Nielsen são o **framework padrão de avaliação heurística**. As
abaixo foram verificadas 3-0; trate-as como checklist ao revisar uma tela.

### 2.1 Visibilidade do status do sistema (#1) ✅ (3-0)

- O design deve **sempre informar o usuário** do que está acontecendo, com feedback
  apropriado em tempo razoável.
- **Indicadores de progresso** reduzem incerteza durante esperas.
- **Limiares de tempo de resposta (NNG):**
  - **~0,1 s** — sensação de instantâneo (feedback imediato).
  - **~1 s** — limite do fluxo de pensamento sem interrupção (sem feedback especial,
    mas perceptível).
  - **~10 s** — limite da atenção; **spinners genéricos não bastam** acima de 10 s.
    Use **indicador de progresso percentual / etapa atual**.

**Fontes:** NNG *Ten Usability Heuristics*; *Response Times: 3 Important Limits*.

### 2.2 Prevenção de erros (#5) ✅ (3-0)

- Boas mensagens de erro importam, mas **o melhor design previne o erro de acontecer**.
- Aplicação: desabilite/oculte ações inválidas, valide cedo, use defaults seguros,
  confirme ações destrutivas, restrinja formatos de entrada na origem.

### 2.3 Reconhecimento em vez de memorização (#6) ✅ (3-0)

- Minimize a carga de memória **tornando elementos, ações e opções visíveis**.
- Reconhecer um ícone rotulado é muito mais fácil que lembrar um atalho.
- *Qualificação:* usuários experientes ainda se beneficiam de **aceleradores**
  (atalhos) — ofereça ambos.

### 2.4 Estética e design minimalista (#8) ✅ (3-0)

- Interfaces **não devem conter informação irrelevante ou raramente necessária**.
- Cada unidade extra **compete** com a relevante e **reduz sua visibilidade**.
- ⚠️ Minimalismo = remover o irrelevante, **não** remover conteúdo útil.

### 2.5 Consistência e padrões (#4) + Lei de Jakob ✅ (3-0)

- Mantenha **consistência interna** (mesmos padrões dentro do produto) e
  **externa** (convenções consolidadas do mercado/plataforma).
- Consistência **define expectativas corretas** e **aumenta a aprendizagem**
  (*Jakob's Law:* usuários passam a maior parte do tempo em *outros* apps e esperam
  que o seu funcione igual).
- É a justificativa central para ter um **design system**.

**Fontes:** NNG *Maintain Consistency and Standards*; Laws of UX — *Jakob's Law*.

### 2.6 As demais heurísticas de Nielsen 📐 (contexto — completam o framework)

Para revisão completa, considere também: **#2 Correspondência com o mundo real**
(linguagem do usuário), **#3 Controle e liberdade do usuário** (desfazer/sair fácil),
**#7 Flexibilidade e eficiência de uso** (aceleradores), **#9 Ajude a reconhecer,
diagnosticar e recuperar de erros** (mensagens claras com solução), **#10 Ajuda e
documentação**.

### 2.7 Avaliação heurística como método ✅ (3-0)

- Método de inspeção em que avaliadores julgam a UI contra heurísticas estabelecidas.
- Use **3 a 5 avaliadores independentes** — um único avaliador (por mais expert)
  perde problemas. Aproximadamente: 1 avaliador acha ~35%; 5 acham ~75%.

**Fonte:** NNG *How to Conduct a Heuristic Evaluation*.

---

## 3. Padrões de Componentes e Estados

> ⚠️ O research sinalizou esta seção como **lacuna de cobertura** — as afirmações
> abaixo são 📐 **convenção de plataforma** (Apple HIG / Material Design / prática
> consolidada), não verificadas 3-0. Use como guia padrão, mas valide casos críticos.

### 3.1 A tríade de estados: Loading / Empty / Error 📐

Toda tela/lista que busca dados deve tratar **explicitamente** os três estados além
do estado "com conteúdo":

- **Loading:** mostre progresso (ver §2.1). Para listas, prefira **skeletons** ao
  spinner solto — comunicam a estrutura que está chegando e reduzem a percepção de espera.
- **Empty state:** nunca uma tela em branco. Explique **por que está vazio** e
  ofereça **uma ação clara** (ex.: "Nenhuma tarefa ainda — crie a primeira"). É uma
  oportunidade de onboarding.
- **Error state:** mensagem clara em linguagem humana, **o que aconteceu + como
  resolver** (heurística #9), e um caminho de recuperação (ex.: "Tentar de novo").
  Nunca exponha stack trace/jargão.

### 3.2 Botões e hierarquia de ação 📐

- **Uma ação primária por tela/seção** (botão de maior ênfase). Ações secundárias
  com menor ênfase; ações terciárias como texto/ghost.
- Estados obrigatórios: **default, hover/pressed, focus, disabled, loading**.
- **Disabled vs. erro:** prefira manter o botão habilitado e validar ao clicar
  (com feedback) quando o motivo do bloqueio não for óbvio — evita o "botão morto".
- Rótulo deve descrever a ação ("Salvar tarefa"), não genérico ("OK").

### 3.3 Formulários 📐

- **Labels sempre visíveis** (não use placeholder como label — some ao digitar).
- **Validação:** valide **no blur / após o usuário terminar o campo**, não a cada
  tecla; erros inline **junto ao campo**, com texto + ícone (não só cor — §1.4).
- Agrupe campos relacionados (Gestalt); mostre formato esperado antes do erro
  (prevenção, §2.2).
- Mobile: use o **teclado certo** por tipo de campo (email, numérico, etc.) e
  inputs com altura confortável de toque (§4.2).

### 3.4 Modais e overlays 📐

- Use modal para **decisão focada/curta** que exige interromper o fluxo
  (ex.: confirmar exclusão). Para conteúdo extenso, prefira **tela/rota** própria.
- Todo modal precisa de **saída óbvia** (botão fechar + tocar fora/esc) — heurística #3.
- Não empilhe modais. Em mobile, **bottom sheets** costumam ser melhores que modais
  centrais (alcance do polegar).

### 3.5 Listas e navegação 📐

- Itens de lista tocáveis devem parecer tocáveis (**affordance** — §3.6) e ter alvo
  de toque adequado (§4.2).
- **Navegação mobile:** tab bar para 3–5 destinos de topo (Apple HIG / Material);
  comportamento de "voltar" previsível e consistente.
- Ações destrutivas em itens (swipe-to-delete) precisam de **alternativa sem gesto
  de caminho** (WCAG 2.5.1 — §4.3) e idealmente confirmação/undo.

### 3.6 Affordances e signifiers 📐

- **Affordance:** o que um elemento *permite* fazer. **Signifier:** a pista visual
  que comunica isso (sublinhado de link, sombra/realce de botão, ícone).
- Faça o tocável **parecer** tocável; não faça texto comum parecer botão (falsa
  affordance gera frustração).

---

## 4. Acessibilidade (WCAG 2.2)

> WCAG 2.2 é a Recommendation atual do W3C (out/2023). A nota *wcag2mobile-22*
> (mai/2025) é guia **não-normativo** de como aplicar a apps mobile.

### 4.1 WCAG se aplica a mobile ✅ (3-0)

- Princípios, diretrizes e critérios da WCAG 2.2 **se aplicam a apps nativos, web
  mobile e híbridos**. Leia "tela/view" onde diz "web page".

**Fonte:** https://www.w3.org/TR/wcag2mobile-22/

### 4.2 Contraste de texto ✅ (3-0)

- **AA:** contraste de **≥ 4.5:1** entre texto e fundo.
- **Texto grande** (≥ 18pt, ou 14pt bold): **≥ 3:1**.
- (AAA, mais rígido: 7:1 / 4.5:1.) Texto decorativo/incidental e logotipos são isentos.

**Fonte:** WCAG 2.2 SC 1.4.3 Contrast (Minimum), Level AA.

### 4.3 Tamanho de alvo de toque ✅ (3-0) — com nuance de plataforma

- **Mínimo WCAG (SC 2.5.8 Target Size, AA):** alvos de **≥ 24×24 CSS px**
  (com exceções: spacing, equivalent, inline, controle do user-agent, essential).
- ⚠️ **24×24 é o mínimo de acessibilidade, não o alvo de design.** Para conforto em
  mobile, use as convenções de plataforma 📐:
  - **Apple HIG: 44×44 pt**
  - **Material Design: 48×48 dp**
  - **Default prático recomendado: ~44–48px** como tamanho confortável de toque.
- ❌ **Refutada (0-3):** "alvos precisam de área 44×44px não-sobreposta" — isso **não**
  é o que a WCAG 2.2 exige.

**Fontes:** WCAG 2.2 SC 2.5.8 + Understanding; Apple HIG; Material Design.

### 4.4 Gestos: alternativa de ponteiro único ✅ (3-0)

- Toda função que usa **gesto multiponto ou baseado em caminho** (pinça, swipe com
  trajetória) deve ter **alternativa com ponteiro único sem caminho**, salvo se o
  gesto for **essencial**.

**Fonte:** WCAG 2.2 SC 2.5.1 Pointer Gestures, Level A.

### 4.5 Indicador de foco ✅ (3-0)

- Indicador de foco com contraste **≥ 3:1** entre os estados focado e não-focado
  (ou contra cores adjacentes).

**Fonte:** WCAG 2.2 SC 2.4.11 Focus Appearance, Level AA.

### 4.6 Cor nunca sozinha ✅ (ver §1.4)

- Significado transmitido por cor deve ter **reforço** (texto/ícone/forma). WCAG 1.4.1.

---

## 5. Design Systems e Consistência

- Um design system existe para **operacionalizar a consistência** (§2.5) — tokens de
  cor/espaçamento/tipografia, componentes reutilizáveis, padrões documentados.
- **Tokens** desacoplam decisão de design (semântica: `primary`, `surface`) do valor
  bruto, permitindo temas e mudanças centralizadas.
- **Princípios de um bom design system 📐:** consistência, reutilização, escalabilidade,
  acessibilidade embutida, documentação clara, e *single source of truth*.
- **Neste projeto:** o source of truth é [docs/design.md](../../../docs/design.md)
  (paleta "Warm Precision", tipografia, spacing). Qualquer recomendação deve **usar
  os tokens existentes** antes de propor valores novos.

---

## 6. Checklist rápido de revisão de tela

Ao alterar/avaliar uma tela, percorra:

- [ ] **Hierarquia** clara? Há *uma* ação primária óbvia? (§1.1, §3.2)
- [ ] Tipografia contida (≤2 pesos, 2–3 cores de texto)? (§1.2)
- [ ] Espaçamentos/tamanhos vêm da escala (não arbitrários)? (§1.3)
- [ ] Contraste de texto ≥ 4.5:1 (≥3:1 grande)? (§4.2)
- [ ] Alvos de toque ≥ 44–48px? (§4.3)
- [ ] Cor não é o único sinal de estado/erro? (§1.4, §4.6)
- [ ] Estados **loading / empty / error** tratados? (§3.1)
- [ ] Feedback de status para esperas (>10s = progresso)? (§2.1)
- [ ] Erros prevenidos na origem + mensagens com solução? (§2.2, §3.3)
- [ ] Gestos têm alternativa de toque simples? (§4.4)
- [ ] Consistente com o resto do app e com `docs/design.md`? (§2.5, §5)
- [ ] Nada irrelevante competindo por atenção? (§2.4)

---

## 7. Perguntas em aberto (do research — aprofundar quando necessário)

1. Padrões citáveis específicos por componente (forms, modais, listas, tríade de
   estados) direto de Material Design / Apple HIG.
2. Diferenças de navegação Apple HIG vs. Material (tab bar vs. nav drawer,
   comportamento de "voltar") e qual prevalece em app cross-platform.
3. Definições autoritativas de affordances/signifiers com guia mobile-específico.
4. Reconciliação definitiva de alvo de toque entre WCAG (24px), Apple (44pt) e
   Material (48dp) para um default único do design system.

---

## Fontes (verificadas — qualidade primária salvo nota)

- **NNG — Principles of Visual Design:** https://www.nngroup.com/articles/principles-visual-design/
- **NNG — 10 Usability Heuristics:** https://www.nngroup.com/articles/ten-usability-heuristics/
- **NNG — Heuristics for Complex Apps:** https://www.nngroup.com/articles/usability-heuristics-complex-applications/
- **NNG — How to Conduct a Heuristic Evaluation:** https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/
- **NNG — Maintain Consistency and Standards:** https://www.nngroup.com/articles/maintain-consistency-and-standards/
- **NNG — Aesthetic-Minimalist Design:** https://www.nngroup.com/articles/aesthetic-minimalist-design/
- **NNG — Response Times: 3 Important Limits:** https://www.nngroup.com/articles/response-times-3-important-limits/
- **WCAG 2.2 (W3C Recommendation):** https://www.w3.org/TR/WCAG22/
- **WCAG 2 para Mobile (Group Draft Note):** https://www.w3.org/TR/wcag2mobile-22/
- **Understanding SC 2.5.8 Target Size (Minimum):** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **Understanding SC 2.5.1 Pointer Gestures:** https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html
- **Understanding SC 2.4.11 Focus Appearance:** https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- **WebAIM — WCAG 2.2 Overview:** https://webaim.org/blog/wcag-2-2-overview-and-feedback/
- **Refactoring UI — Color Palette:** https://refactoringui.com/previews/building-your-color-palette/
- **Refactoring UI — resumo (secundária):** https://howtoes.blog/2025/07/04/refactoring-ui-complete-book-summary-all-key-ideas/
- **Laws of UX — Jakob's Law (secundária):** https://lawsofux.com/jakobs-law/
- **Apple Human Interface Guidelines (📐 convenção):** https://developer.apple.com/design/human-interface-guidelines/
- **Material Design 3 (📐 convenção):** https://m3.material.io/

---
name: save-memory
description: Registra e atualiza informações duradouras do projeto em .claude/memory, classificadas por categoria e indexadas para consulta futura. Use quando o usuário pedir para salvar, guardar, registrar ou lembrar requisitos de ambiente, regras de negócio, decisões, regras de trabalho, preferências, lições ou vocabulário do projeto.
---

# Salvar memória

Preserve o que uma próxima sessão precisa saber e não consegue deduzir facilmente do código: requisitos, escolhas e seus motivos, orientações duradouras e aprendizados. Todos os caminhos abaixo são relativos à raiz do repositório, salvo os links entre arquivos.

## Categorias

Escolha a categoria pelo efeito de ignorar a informação:

| Categoria | O que guardar |
| --- | --- |
| `environment/` | Requisitos para desenvolver, executar, testar ou publicar: configuração, serviços, comandos e limitações do ambiente. |
| `business-rules/` | Comportamentos que o produto deve aplicar: critérios, limites, valores padrão, contratos e efeitos de ações. |
| `decisions/` | Escolhas técnicas ou de organização e seus motivos, incluindo alternativas consideradas. |
| `rules/` | Orientações permanentes para quem trabalha no repositório, incluindo convenções de código e estrutura. |
| `dev-preferences/` | Preferências do desenvolvedor em formato genérico: um padrão por arquivo, ilustrado com nomes. |
| `fails-and-lessons/` | Falhas já observadas, suas causas e como evitá-las ou resolvê-las. |
| `vocabulary/` | Significado de termos usados no projeto. |

Todas ficam em `.claude/memory/`. O `README.md` dessa pasta indexa as categorias; o `README.md` de cada categoria indexa seus registros.

Uma decisão explica **por que uma escolha foi feita**; uma regra diz **como trabalhar daqui em diante**. Uma preferência se aplica ao desenvolvedor; uma regra vale para o trabalho no repositório. Regras de negócio descrevem o comportamento do produto, não o modo de escrever código. Um requisito pertence ao ambiente; o episódio que revelou esse requisito pertence às lições. Uma definição pertence ao vocabulário; o comportamento associado a ela pertence às regras de negócio.

Quando houver aspectos distintos, separe-os por categoria e ligue os arquivos por links relativos. Mantenha cada informação em um único registro principal para evitar versões divergentes.

## Fluxo

1. Identifique a informação duradoura e seu escopo a partir do pedido e das evidências disponíveis. Consulte o código para resolver dúvidas verificáveis; pergunte ao usuário apenas quando faltar uma decisão que mude o significado ou o alcance do registro.
2. Leia `.claude/memory/README.md` e os índices das categorias pertinentes. Procure registros existentes sobre o assunto antes de criar outro.
3. Escolha a categoria e o nome `.claude/memory/{categoria}/{topico-em-kebab-case}.md`. Este repositório tem três projetos: use o prefixo `backend-`, `mobile-` ou `design-` quando a informação vale para um projeto só (exemplo: `mobile-token-secure-store-cache.md`). Sem prefixo quando vale para o repositório inteiro ou atravessa mais de um projeto; nesse caso, a primeira linha do arquivo diz onde ela vale. Em `dev-preferences/` o nome descreve o padrão e não leva prefixo. Declare no conteúdo onde a informação se aplica; não presuma um componente ativo.
4. Leia o registro existente antes de alterá-lo. Atualize a parte relevante, preservando o conteúdo válido. Se o usuário corrigiu explicitamente uma memória, incorpore a correção; se houver contradição sem resolução clara, esclareça antes de substituir.
5. Escreva o registro em português, com um título e um assunto por arquivo. Não copie transcrições inteiras nem invente motivos, causas, caminhos ou detalhes ausentes. Em `dev-preferences/`, o nome do arquivo descreve o padrão (`nomes-genericos-para-classes-e-funcoes-em-adapters.md`), não um episódio, vendor ou fluxo.
6. Adicione ou atualize o link no `README.md` da categoria. Preserve entradas de outros assuntos e corrija links se renomear um registro. O índice da raiz só precisa mudar quando as categorias mudarem.
7. Confira os links locais, o escopo e a consistência com registros relacionados. Informe quais arquivos foram criados ou atualizados e o que foi preservado.

Se a estrutura ainda não existir, crie `.claude/memory/README.md` com links para as sete categorias da tabela e um `README.md` em cada pasta. Os índices começam sem registros; não preencha memórias com exemplos fictícios. Não substitua índices existentes. Se nenhuma categoria comportar a informação duradoura, confirme com o usuário antes de acrescentar uma categoria e seu índice.

## Conteúdo dos registros

Use parágrafos, listas ou blocos de código conforme o assunto. Comece pelo escopo e pela informação que a próxima sessão precisa aplicar. Inclua, quando conhecido:

- **Decisões:** a escolha, o motivo e as alternativas consideradas.
- **Lições:** o sintoma observado, a causa confirmada e a solução ou prevenção. Se a causa ainda for desconhecida, diga isso; não transforme uma hipótese em fato.
- **Regras de negócio:** a regra, sua justificativa e o local de implementação, se já existir e tiver sido verificado. Diferencie comportamento esperado de comportamento implementado.

Confirme caminhos e comandos apresentados como existentes. Caminhos planejados podem ser registrados como propostas, claramente identificados. Não registre segredos, tokens ou credenciais; quando necessário, documente apenas o nome da configuração e como obtê-la pelo procedimento do projeto.

Padrões de código e organização de pastas podem ser decisões ou regras quando houver orientação duradoura a preservar. Evite copiar inventários de arquivos ou documentação que já tenha uma fonte mantida: registre o contexto ou o motivo que falta e faça referência à fonte.

Status temporário, lista de tarefas em andamento e relatos sem aprendizado duradouro não pertencem a essas categorias. Para pedidos mistos, salve a parte duradoura e explique o que ficou de fora. Se o pedido for apenas um estado temporário, esclareça onde o usuário quer acompanhá-lo.

## Índices das categorias

Cada entrada deve ajudar a decidir quando abrir o arquivo:

```md
- [Título do tópico](./topico.md) — consultar ao trabalhar neste assunto para evitar este problema.
```

Adapte a descrição ao gatilho e à consequência reais. A orientação completa fica no registro, não no índice. Remova o aviso de categoria vazia ao adicionar o primeiro registro.

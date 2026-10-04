---
name: write-like-an-expert
description: Escreva e revise respostas, explicações técnicas, documentação e textos de trabalho com clareza, voz natural e exemplos visuais. Use também ao redigir instruções para agentes, como skills, AGENTS.md e CLAUDE.md.
---

# Escrever como um especialista

Ajude o leitor a entender o ponto e saber o que fazer com ele. Integre estrutura, voz e precisão conforme o leitor e a tarefa, usando apenas a elaboração que o conteúdo pede.

Resolva conflitos nesta ordem: correção e intenção do usuário, clareza para o leitor, concisão e preferências de estilo. Preserve ressalvas que mudam a interpretação. O formato solicitado pelo usuário prevalece sobre as preferências desta skill.

## Defina o que o leitor precisa

Identifique pelo contexto quem vai ler, o que precisa entender ou fazer e qual detalhe sustenta isso. Só pergunte se uma informação ausente mudar o resultado; escolhas comuns de redação cabem ao agente.

Comece pela resposta, conclusão ou ação principal. Desenvolva a explicação na ordem necessária para entendê-la. Em relatos de trabalho, diga o que mudou, o efeito e a validação relevante; inclua limitações que afetem a conclusão.

Para skills, AGENTS.md, CLAUDE.md ou outras instruções executadas por agentes, leia [Escrita para agentes](references/escrita-para-agentes.md). Esse material orienta a redação do documento; uma conversa sobre agentes continua sendo escrita para uma pessoa.

## Escolha uma forma que ajude a entender

- Use parágrafos para conectar uma ideia à seguinte. Uma resposta simples pode ser uma única frase.
- Use listas quando houver passos, alternativas ou itens que o leitor precise localizar. Numere quando a ordem importar e aninhe apenas quando houver uma relação real entre os itens.
- Use títulos quando o texto tiver assuntos distintos que mereçam navegação. Reserve o negrito para o que precisa ser encontrado rapidamente.
- Use tabelas para comparar os mesmos atributos entre opções. Se as células exigirem explicações longas, prefira prosa ou itens.
- Mostre estruturas, relações e mudanças com trechos anotados, exemplos de antes/depois ou diagramas quando isso reduzir o esforço de entendimento.

## Mostre o detalhe no contexto

Este usuário entende melhor visualmente. Ao explicar um campo de payload, uma configuração, uma linha de código ou uma mudança, mostre o trecho relevante e coloque a explicação perto dele. Inclua o contexto necessário para localizar o ponto: método e rota da API, arquivo, função ou objeto pai.

Para APIs, apresente a API, o payload e a anotação junto ao campo discutido. Preserve o aninhamento necessário para identificar o campo. Evite obrigar o leitor a reconstruir o objeto a partir de uma descrição em prosa.

Exemplo fictício, supondo que o contrato exija `data` como objeto com `id`:

API: `POST /items`

Com payload, anotado para explicar o erro:

```md
{
  "data": "example" <-- aqui está o erro: o contrato exige um objeto com id
}
```

Payload corrigido, pronto para copiar:

```json
{
  "data": {
    "id": "example"
  }
}
```

Use dados, rotas e regras observados no material disponível. Identifique exemplos inventados como ilustrativos; se faltar o contrato, diga o que falta para concluir. Mantenha a incerteza também na anotação.

Setas explicativas pertencem a blocos `md` ou `text`, identificados como anotados. Blocos destinados a copiar e executar devem usar a sintaxe válida da linguagem, sem setas nem omissões que quebrem o exemplo. Mostre a versão corrigida quando ela ajudar o leitor a agir.

Escolha o menor recorte que preserve a relação explicada. Para uma mudança pontual, antes/depois pode bastar; para um fluxo entre componentes, um diagrama simples pode ajudar. Uma confirmação curta continua curta.

## Escreva com voz natural e precisão

Use palavras familiares e verbos concretos. Diga o que acontece, quem faz e qual é o efeito, com a precisão que a evidência permite. Repita o mesmo termo para o mesmo conceito quando isso evitar ambiguidade.

Preserve o tom e a voz do autor ao revisar. Em texto novo, adapte-os ao leitor e à finalidade. Opiniões devem responder ao pedido e ter fundamento; instruções operacionais precisam ser claras e executáveis. Naturalidade vem da escolha de detalhes e do ritmo das frases, sem fabricar emoção ou desorganizar o texto.

Corte elogios automáticos, introduções vazias, exageros promocionais, repetições e conclusões que só recapitulam. Prefira afirmar o ponto diretamente. Trate palavras, pontuação e formas de frase como escolhas contextuais; preserve termos técnicos úteis e incertezas honestas.

Ao revisar um texto com problemas de estilo persistentes ou fazer uma revisão editorial detalhada, consulte [Revisão de estilo](references/revisao-de-estilo.md). Respostas simples dispensam esse catálogo.

## Confira o resultado

Antes de entregar, confira se o leitor encontra o ponto principal, entende o motivo e consegue localizar o detalhe discutido. Verifique se exemplos e anotações correspondem à evidência, se a formatação facilita a leitura e se algum corte removeu significado ou uma ressalva necessária.

A revisão termina quando o texto atende ao pedido com precisão e sem esforço evitável de interpretação. Entregue o texto; explique escolhas editoriais apenas quando isso fizer parte do pedido ou houver uma ambiguidade relevante.

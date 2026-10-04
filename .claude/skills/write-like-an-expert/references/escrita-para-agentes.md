# Escrita para agentes

Use ao redigir ou revisar instruções que um agente executará. O resultado deve deixar claro quando agir, qual ação tomar e como reconhecer que o trabalho terminou.

## Transforme intenção em instrução

Defina o resultado esperado e as restrições que mudam a decisão. Separe requisitos, preferências e exemplos para que uma sugestão não vire obrigação. Preserve o escopo e a autorização do usuário.

Ordene passos apenas quando houver dependência. Mantenha definições, regras e exceções de um conceito no mesmo lugar. Quando duas orientações puderem competir, explicite o critério de escolha.

Use linguagem direta e termos estáveis. Um nome compacto ajuda quando seu significado já está claro; explique termos próprios antes de usá-los. Prefira descrever o comportamento esperado. Registre proibições quando elas expressarem limites reais, junto da alternativa permitida quando houver.

## Diga quando consultar cada material

A descrição de uma skill deve indicar a capacidade e as situações em que ela se aplica. Um link para uma referência deve dizer o que há nela e em que caso lê-la.

Exemplo de referência com condição de leitura:

```md
Ao alterar autenticação, leia [Autenticação](references/autenticacao.md)
para conferir expiração, renovação e invalidação de sessões.
```

Mantenha no arquivo principal o necessário aos casos comuns. Mova detalhes específicos para referências quando isso evitar carregar conteúdo irrelevante. Uma referência só economiza contexto se for consultada conforme a necessidade; carregar todas de início elimina esse benefício.

## Defina um término observável

Para etapas que exigem verificação, declare a evidência suficiente para concluir. Ajuste a exigência ao risco e ao trabalho solicitado.

Por exemplo, em uma alteração de contrato de API, concluir pode exigir que o payload de exemplo corresponda ao schema e que os consumidores afetados tenham sido verificados. “Entenda tudo” não delimita o trabalho.

Instruções editoriais podem usar critérios qualitativos, como preservar o significado e remover ambiguidade. Reserve verificações exaustivas para tarefas que precisam delas.

## Corte o que não orienta decisões

Mantenha cada regra em um lugar autoritativo e use referências para alcançá-la. Consulte configurações e código para fatos que já estão ali; documente convenções implícitas, motivos e exceções difíceis de descobrir.

Remova conselhos genéricos, repetições e teoria que não altere a execução. Preserve exemplos que esclareçam uma escolha difícil. Se uma regra não produzir o efeito esperado, observe o resultado e ajuste a instrução; intensificar adjetivos não substitui definir o comportamento.

Ao revisar, confira se os links resolvem, se as condições de leitura são claras e se o agente consegue decidir o próximo passo sem adivinhar. Para mudanças substanciais, avalie casos representativos quando isso trouxer confiança útil; ajuste com base no comportamento observado.

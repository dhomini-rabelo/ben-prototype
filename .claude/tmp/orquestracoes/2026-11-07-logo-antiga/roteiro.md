# Roteiro de comprovação — logo antiga

Status: aprovado pelo usuário no gate 4.2 (2026-11-07), sem mudanças
Origem: reconhecimento.md › ## Roteiro de comprovação, com 1 correção do O1: S09 passa a cobrir também PR-009 (que estava sem prova de tela).
Dúvida assumida (O1): a sessão para S13–S15 vem de semear `ben.jwttoken` no localStorage com um JWT válido do server-ben; se o server não emitir token de dev, S13–S15 são dispensadas e AC-009 é provada por leitura de código (sem diff em brand-mark, chat-top-bar, menu-sidebar, chat-history*) mais S12.

## Roteiro de comprovação
ambiente: `pnpm dev` (raiz: server-ben :3333 + app web :8081, regenera os ícones antes). Para as provas S01 a S08 e S10 a S11, que só leem arquivos, não precisa de ambiente; para S09 e S12, `pnpm dev:mobile` basta; S13 a S15 precisam do `pnpm dev` inteiro; S16 e S17 precisam também de `pnpm dev:design` (:3002)
estado: nenhum (o app não tem mecanismo de fixtures; a sessão do chat vem da dúvida 1)
url: `http://localhost:8081/`

S01 (PR-001; AC-001) [final] o tester abre a página temporária de comparação com o `icon.png` antes e depois → o "depois" mostra o balão âmbar sem o texto "Ben", sobre fundo claro, e nenhum dos 3 círculos pretos
S02 (PR-001; AC-002, CB-004) [final] o tester abre o `adaptive-icon-foreground.png` composto sobre `#f6f4f2` com máscara circular → balão e as 3 barras aparecem inteiros dentro do círculo, sem corte
S03 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada arredondada → balão e as 3 barras aparecem inteiros, sem corte
S04 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada → balão e as 3 barras aparecem inteiros, sem corte
S05 (PR-001; AC-003) [final] o tester abre o `adaptive-icon-monochrome.png` sobre um fundo contrastante → o balão aparece como silhueta de uma cor só, com as 3 barras vazadas (o fundo aparece através delas)
S06 (PR-001; AC-004, AC-011, CB-007) [final] o tester abre o `splash-icon.png` sobre `#f6f4f2` → o balão âmbar aparece centralizado, sem borda ou tom de fundo diferente do `#f6f4f2` ao redor
S07 (PR-001; AC-006) [final] o tester abre o `notification-icon.png` sobre fundo escuro → silhueta branca do balão com as 3 barras vazadas
S08 (PR-001; AC-005) [final] o tester abre o `favicon.png` antes e depois → o "depois" mostra o balão âmbar sobre fundo claro, no lugar dos 3 círculos pretos
S09 (PR-002, PR-009; AC-005, CB-006) [final] o tester sobe o app no web, abre `http://localhost:8081/` e abre o ícone que o `<link rel="icon">` da página aponta → mostra o balão âmbar, e o mesmo arquivo "antes" mostra os círculos
S10 (PR-007; CB-005) [final] o tester reduz o `notification-icon.png` a 24 px ao lado do original → ainda se reconhece o balão e as 3 barras vazadas ficam distinguíveis
S11 (PR-007; CB-006) [final] o tester reduz o `favicon.png` a 16 px sobre fundo claro, ao lado do original → ainda se reconhece o balão âmbar
S12 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/` sem sessão → a tela de login mostra o balão âmbar com o texto "Ben", igual ao print de antes
S13 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/chat` com sessão → o header mostra o balão âmbar com "Ben", igual ao print de antes
S14 (PR-006; AC-009) [final] o tester abre o menu lateral a partir do chat → o menu mostra o balão âmbar com "Ben", igual ao print de antes
S15 (PR-006; AC-009) [final] o tester rola o chat até uma resposta do Ben → o avatar do Ben ao lado do balão (corpo branco, barras âmbar) é igual ao de antes
S16 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/components/brand-mark` → o sandbox continua com a logo de 3 círculos pretos de antes
S17 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/` e abre o ícone que o `<link rel="icon">` aponta → continua o raio roxo do Vite de antes

comando: n/a (nenhum RT ou PR em lane `teste`)
T01..: n/a


# Regras de Negócio — Doce Mordida

> **Esta regra é soberana: TODAS as regras deste arquivo DEVEM ser seguidas em qualquer tarefa,
> por qualquer agente ou pessoa que atue neste repositório. Nenhuma tarefa está concluída se
> violar alguma regra aqui. Em conflito entre pressa e regra, vence a regra.**

## 1. Regras de processo (obrigatórias)

1. **Escopo fechado:** não mexer no que não foi pedido; não inventar problemas para depois solucioná-los; propor solução apenas para o que foi proposto.
2. **TDD obrigatório** em toda funcionalidade/correção: escrever o teste ANTES, vê-lo falhar pelo motivo certo, implementar o mínimo, refatorar se necessário — **proibido forçar o green mentindo** (teste vacilante, asserção vazia, mock que esconde comportamento real).
3. **Cada feature nova tem um smoke test** Playwright (`tests/*.spec.js`) cobrindo seu comportamento essencial.
4. **Cada tarefa concluída é commitada na branch `mobile-first`**, com mensagem descritiva no padrão do repo (`perf:` / `feat:` / `fix:`).
5. Ao final de um conjunto de tarefas, **rodar a regressão completa** (`npm test`) validando que a aplicação funciona como um todo antes de considerar entregue.
6. Verificação com evidência: nenhuma conclusão ("passou", "pronto") sem comando executado e saída confirmada.

## 2. Convenções de código (padrão style.css)

1. Cores SEMPRE via custom properties do `:root` (`--chocolate`, `--branco`, `--azul-claro`, `--whatsapp-green`, etc.) — nunca hex solto em regras novas.
2. Seções novas seguem o cabeçalho existente: `/* --- Nome da Seção --- */`.
3. Classes em kebab-case; seletores simples; uma linha por regra curta como no restante do arquivo.
4. Respeitar acessibilidade já estabelecida: `:focus-visible`, `aria-*` nos controles, `prefers-reduced-motion` (novos animations/transitions devem respeitar o bloco global).
5. JS: mesmo estilo de `script.js` (funções nomeadas, comentários de seção `/** ... */`, sem libs externas).

## 3. Regras de performance (derivadas dos audits PageSpeed)

1. **Zero CSS de terceiro render-blocking.** Ícones são SVG inline (padrão `svg.icon`: `1em`, `currentColor`, `vertical-align: -0.125em`). Proibido reintroduzir Font Awesome/CDN de CSS no `<head>` crítico.
2. **Imagens:** servidas em formato moderno (WebP) e dimensão compatível com a exibição (responsivas via `srcset`/`sizes` quando houver variação). PNG original só permanece referenciado onde necessário fora da página (favicon, og:image).
3. **Imagem LCP** (hero): nunca `loading="lazy"`, sempre detectável no HTML inicial e com `fetchpriority="high"`.
4. **Fontes:** `display=swap`; CSS de fontes carregado sem bloquear renderização (async pattern com fallback `<noscript>`).
5. **JS sem layout thrash:** leituras de geometria (`scrollWidth`, `clientWidth`, `getBoundingClientRect`) agrupadas antes de escritas no DOM dentro do mesmo handler/frame.
6. Testes não podem validar implementação interna — validam comportamento visível ao usuário (requests, elementos visíveis, atributos que afetam o carregamento).

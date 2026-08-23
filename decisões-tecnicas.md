# Decisões Técnicas — Doce Mordida

> Log vivo e LOCAL (gitignored): tudo que implementamos desde o início do
> projeto, organizado por fase, com hash de commit. Atualizar a cada tarefa.
> Fonte primária: histórico do git (`git log --reverse`).

---

## Fase 1 — Nascimento do site (23–27/03/2026)

- **Estrutura inicial do Menu de Páscoa 2026** (`ded71f3`, `02d41ef`) — página única com hero, ovos, kits e info.
- **Carrossel v1** (`9426ec1`) — cards dinâmicos 4-2-1 e navegação estática; footer/header em "pink-pill" (`e751489`, `385f8e3`).
- **Identidade:** nome fixado como **Doce Mordida** (`9baa7d2`, `7da1d28`, `5b6c1c4`); paleta migrou para azul (`7ac670c`); fonte própria no header/footer (`6029b9a`).
- **Pedido via WhatsApp** (`32b4560`, `8bd1760`) — pop-up de pedido montando mensagem para wa.me; depois evoluído a modal completa.
- **Modal de imagem** (`7725149`, `1ac9ccf`) — expandir imagem do card ao clicar, fechar por clique/X.
- **Organização:** JS separado em arquivo externo (`0e3350e`); SEO no head (`9d53d40`); imagens não usadas removidas (`27d33e3`).
- **Regras de negócio do pedido:** mensagem de erro sem seleção (`b3392f9`); aviso de data-limite 30/03 criado (`ef02954`) e depois removido da home (`ea44dcc`).
- **Domínio próprio** (`0af7adf`) — CNAME para docemordidabrigadeiros.com.br (GitHub Pages).

## Fase 2 — Testes automatizados + mobile-first UX/UI (17–20/08/2026)

- **Infraestrutura Playwright** (`603b1ad`) — 3 viewports (mobile/tablet/desktop) + número WhatsApp configurável; plano detalhado em docs (`0d6debf`).
- **Base de estilo:** tokens renomeados/unificados, fontes e acessibilidade (`98c02e5`, `67d4634`, `6bbea5e`); layout refatorado para **base mobile com min-width** (`4caf9bf`, `d1f44a1`).
- **Menu drawer acessível** (`f013cd5`, `b10babe`, `4ac5ab8`) — aria-expanded, scroll lock, touch targets 44px, fechamento ao redimensionar; pill visual original mantida (`ce5604c`).
- **Carrossel real** (`e334fb9`, `a7c622b`) — scroll nativo por card, dots, setas desabilitadas nas pontas, lazy loading (`58ce37f`); larguras responsivas por faixa (`467642d`…`c878a38`, `61d4e80`, `e83d66f`, `d38f892`); tipografia fluida com `clamp()` (`8183a6c`).
- **Modal de pedido completa** (`17becff`, `ef91108`, `825a4db`) — preços, subtotal, inputs 16px, total na mensagem do WhatsApp; bottom sheet no mobile com preselect pelos cards (`0292a26`); acessibilidade ESC/foco/dialog/alert (`302a055`, `5d3776e`).
- **FAB WhatsApp:** implementado (`376f409`, `96d0458`) e **revertido por decisão de design** (`0e8d267`, `1249573`).
- **Validação:** regressão da jornada de pedido (`e99918e`) e restauração ponto a ponto do design original (`8dfa36e`).
- **Publicação:** merge mobile-first → main (`e15e455`), README/endereço/licença CC0 (`f9a76c5`, `ba8f766`, `7767287`), verificação Google Search Console + gtag (`22a695c`, `3161f7a`).

## Fase 3 — Performance PageSpeed (21–22/08/2026)

### 1. Font Awesome do CDN → SVGs inline ✅ (`6cdad57`)
- Insight "CSS não usado" (14,8 KiB render-blocking + ~228 KiB de webfonts). Só 5 ícones eram usados → SVGs inline versão fixada 6.0.0, classe `svg.icon` (1em/currentColor/-0.125em), troca hamburguer↔X via `body.menu-open`, atribuição CC BY 4.0.
- Teste: `perf-sem-css-externo.spec.js`.

### 2. LCP do hero priorizada ✅ (`9132cd8`)
- `fetchpriority="high"` no img do coelho-borboleta. Teste: `smoke-lcp.spec.js`.

### 3. Conversão WebP ❌ REVERTIDA (`275f9c3` → revert `34f0c10`)
- PIL q80, lado ≤1000px: 1.470 → 385 KiB (−74%). width/height anti-CLS em todas as imgs; favicon dedicado 64px.
- **Motivo do revert (dono):** logo do header estourou o tamanho na tela; sem diagnóstico rápido, revert do commit inteiro. Imagens voltaram a ~1.750 KiB.
- Lição p/ retomar: converter SEM tocar no `<img>` do logo; validar header desktop+mobile antes.

### 4. Google Fonts fora do caminho crítico ✅ (`13efc5b`; ajuste de teste `6aab306`)
- `media="print"` + `onload` com fallback `<noscript>` (insight: 750 ms bloqueando).
- Lição: assertar o HTML *servido* e `textContent` do noscript (pós-onload o media já é 'all'; conteúdo de noscript é nó de texto).

### 5. Regras de negócio ✅ (`ee7fde3`)
- `regras-de-negocio.md`: TDD vermelho→verde honesto, smoke por feature, commit por task na `mobile-first`, regressão completa ao final, convenções do style.css, regras de performance.

### 6. Cache de visitas repetidas via Service Worker ✅ (`151f27e`)
- Host fixa `max-age=600` sem override possível; `sw.js` v1: stale-while-revalidate para estáticos mesmos-origem, navegação sempre pela rede; Cache Storage (não localStorage/IndexedDB); registro com guard no `script.js`.
- Operação: **bump da versão do cache** a cada mudança de assets.
- Testes: `smoke-service-worker.spec.js` (precache = 15 assets usados pela página; visita repetida controlada pelo SW).

---

## Pendências / próximas

- **Reflow carrossel** (`script.js` `update()` lê layout a cada evento de scroll): interrompido pelo incidente do logo; teste de caracterização existe não-commitado (`smoke-carousel-edge.spec.js`). Dots no desktop: comportamento atual é esperado segundo o dono (navegação por cliques).
- **Imagens grandes (~1.750 KiB)** pós-revert do WebP: retomar preservando o logo, quando autorizado.
- **Deploy:** merge `feat/mobile-first` → `main` + push ao remoto pendente de confirmação (publica produção via GitHub Pages).

## 2026-08-22 — WebP retomado com sucesso ✅ (`8903f32`, deploy em main)
- Refeito o plano de imagens com a lição do incidente: logo-1.png intocada no HTML; causa raiz do estouro confirmada (.logo-wrapper img fixava só height → width do atributo vencia) e corrigida com `width:auto` no CSS, permitindo w/h em todas as imgs.
- 12 rasters → images/img-old/ (git mv); WebP q80 na raiz (lado ≤1000px, hero resolução cheia): 1.477 → 473 KiB referenciados (−68%).
- Preload do hero c/ fetchpriority=high; hero eager; produtos lazy; aspect-ratio no hero; carrossel já reservava 350px.
- gtag diferido 2000ms pós-load (TBT). sw.js bump v3 com ASSETS .webp (precache 14).
- Testes: smoke-imagens-otimizadas.spec.js (novo) + suite 109 passed / 3 skipped.

## 2026-08-22 — Correções finais 100/100 ✅ (`24ef2d9`, deploy em main)
- Dots inteligentes: cards − visíveis + 1 (3 desktop / 4 tablet / 5 mobile), último dot ativa no fim do scroll, hitbox ::before 48px, gap 8px.
- Contraste WCAG AA ≥4.5: nav chocolate 8.81:1 · brand-sub novo token --azul-medio #256d9c 5.61:1 · btn-cta #0d8069 4.87:1 (sombra atualizada junto).
- h4→h3 ×3 na seção info (+seletor CSS). gtag injetado só após touchstart/scroll/click. .hero-image com aspect-ratio (container).
- Suite: 124 passed / 3 skipped. smoke-final-a11y-perf.spec.js cobre tudo em runtime (contraste calculado no browser).

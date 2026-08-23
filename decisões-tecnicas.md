# Decisões Técnicas — Doce Mordida

> Log vivo: tudo que implementamos desde o início do projeto, organizado por
> fase, com hash de commit. Atualizar a cada tarefa. Fonte primária: histórico
> do git (`git log --reverse`). Versionado desde `e48df9a`.

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

- **Reflow carrossel** (`script.js` `update()` lê layout a cada evento de scroll): segue em aberto por decisão do dono; caracterização commitada (`tests/smoke-carousel-edge.spec.js`). Dots no desktop: comportamento atual é esperado segundo o dono (navegação por cliques).
- ~~Imagens grandes (~1.750 KiB)~~ **Resolvido** em `8903f32` (WebP q80, −68%).
- ~~Deploy pendente~~ **Rotina ativa**: merge fast-forward `feat/mobile-first` → `main` a cada lote aprovado pelo dono.

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

## 2026-08-22 — FAQ acessível + catálogo externo + base PWA ✅ (`e48df9a`, deploy em main)
- Seção info unificada: cards estáticos (`.info-grid`) → accordion FAQ com 3 P/R nativos (`button` + `aria-expanded`/`aria-controls`), fundo branco sobre o azul da seção, título "Dúvidas Frequentes" e `btn-cta` mantido abaixo; CSS morto `.info-grid`/`.info-item` removido; teste antigo de h3 semântico migrado para o novo contrato.
- Catálogo externo: `produtos.json` na raiz alimenta os preços via fetch com fallback síncrono interno (subtotal/WhatsApp nunca quebram); JSON-LD `Product` ×10 no head.
- Base PWA/SEO: `manifest.json` linkado, sw.js bump v4 precacheando manifest, `robots.txt` e `sitemap.xml` canônicos.
- Novos testes: smoke-faq (ARIA/clique/teclado/contraste), smoke-produtos-json (fallback), smoke-pwa-seo, smoke-seo-jsonld, smoke-carousel-edge. Suite 174 passed / 3 skipped.
- Deploys em main passaram a ser sincronizados por fast-forward a cada lote aprovado.

## 2026-08-22 — X do modal dentro do cartão ✅ (`8daecd5`)
- Causa raiz: no desktop `#modal-pedido .popup-content` era `position: static`, então o `.close-popup` absoluto ancorava no overlay (tela cheia) — X visualmente fora do modal. Fix: `position: relative`.
- Contrato novo: bounding box do `.close-popup` contido no cartão nas 3 viewports.

## 2026-08-22 — Âncora DÚVIDAS ✅ (`cbb94a0`)
- Último link do menu: CONTATO → DÚVIDAS (href `#info`). `scroll-padding-top: 90px` já cobria o header fixo (~70–80px) — validado sem alteração.

## 2026-08-22 — Pacote performance mobile ✅ (`44050c1`, `76509e6`)
- Quebra da cadeia crítica: preload `produtos.json` (`as="fetch" crossorigin="anonymous"`); `script.js` com `defer`; `decoding="async"` nos 10 cards (hero já eager+fetchpriority).
- sw.js **v5**: Cache-First estrito para estáticos (css/js/json/png/webp/svg) — `caches.match` primeiro, rede só em miss com `cache.put`; navegação segue sempre pela rede. ASSETS completos (+`produtos.json`).
- Peso morto: `brigadeiro.webp` não referenciado removido do site e do precache; `images/img-old/` (12 originais) desversionado + gitignored (cópias locais preservadas).
- Determinismo de testes: smoke-produtos-json bloqueia SW (`serviceWorkers: 'block'`) para as rotas simuladas; smoke-pwa-seo exige v5 e catálogo precacheado.

## 2026-08-23 — Moeda padronizada + logo ✅ (`839d23e`)
- `formatarMoeda()`: `toLocaleString('pt-BR', BRL)` com normalização NBSP→espaço (o contrato `toContain` da mensagem WhatsApp compara espaço simples). Aplicada em `atualizarSubtotal()` e em itens/total do WhatsApp; `toFixed(2).replace('.', ',')` eliminado.
- Logo do header com dimensões de exibição reais (`width="45" height="46"`, antes atributos 429×440) — elimina warning de renderização do Lighthouse.

## 2026-08-23 — Logo em WebP com salvaguarda social ✅ (este commit)
- `logo-1.png` (258 KiB, 429×440 RGBA) → `logo-1.webp` q90 (**37 KiB, −86%**), assumindo o risco controlado: dimensões de exibição já corrigidas (`839d23e` + `width:auto` do incidente) e folga de resolução (render a ~135px @3x).
- Todas as referências migradas: img do header, favicon (`type="image/webp"`), manifest.json (ícone PWA), sw.js ASSETS e contratos (smoke-pwa-seo, smoke-imagens-otimizadas).
- Salvaguarda og:image: WebP não é confiável em preview de link (WhatsApp/Facebook) — criado `images/og-image.png` dedicado 320×328 quantizado (**25 KiB**); vendas ocorrem via WhatsApp, preview preservado.
- `logo-1.png` original excluída; sw bump **v6** (regra: mudou asset, muda versão).

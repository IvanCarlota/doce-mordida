# Doce Mordida — Diagnóstico de UX/UI e Responsividade

> Análise feita em 17/08/2026 sobre `index.html`, `style.css` e `script.js`.
> Stack atual: site estático (HTML + CSS + JS vanilla) hospedado no GitHub Pages.

---

## 1. Padrões de estilo atuais

| Padrão | Onde | Observação |
|---|---|---|
| Design tokens via `:root` | `style.css:1-10` | Vars como `--pink-pill`, `--chocolate`, `--branco` |
| Reset global `* { margin, padding, box-sizing }` | `style.css:12` | OK |
| Fontes Google: Poppins, Playfair Display, Anton, Dancing Script | `index.html:20-22` | 3 requisições separadas |
| Header fixo com `backdrop-filter: blur` | `style.css:24-32` | OK |
| Botões pílula (`border-radius: 50px`) | `.btn-cta`, `.btn-popup`, `.price-tag` | Consistente |
| Carrossel horizontal com scrollbar oculta | `.carousel-track` | Padrão de navegação |
| Divisórias de onda em SVG | `.onda` | Cores **hardcoded** no HTML (`#ffb7c5`, `#ffffff`) |
| Modais/lightbox | `.popup-overlay`, `.modal` | 2 modais no site |
| Um único breakpoint | `@media (max-width: 900px)` | Responsivo básico |

### Problemas estruturais encontrados

1. **Nomes de variáveis enganosos**: `--pink-pill` é azul claro (`#c4e8ff`); o SVG usa rosa real (`#ffb7c5`) hardcoded. `--bg-ice`, `--bg-cream` e `--branco` são todos `#ffffff`.
2. **Cores duplicadas/divergentes**: SVG no HTML repete cores que deveriam vir das vars do CSS.
3. **Classes mortas**: `.hero-subtitle` (usada no HTML, sem estilo no CSS) e `body.menu-open` (adicionada via JS, sem regra CSS).
4. **Uso excessivo de `!important`**: `.onda svg path`, `.close-modal` (3x).
5. **Sem estados de foco**: nenhum `:focus-visible` no site.
6. **Sem suporte a `prefers-reduced-motion`**.
7. **Hardcode de medidas**: scroll do carrossel fixo em 320px no JS (`script.js:7`) enquanto o card é 300px desktop / 280px mobile.
8. **Sem atributos de acessibilidade** nos modais, menu e lightbox.

---

## 2. Melhorias possíveis de implementar HOJE (curto prazo)

### 2.1 Acessibilidade (impacto imediato, baixo esforço)

- [ ] **Fechar modais com tecla ESC** (`script.js`) — hoje só fecha com clique no X ou fora.
- [ ] **Trap de foco nos modais** — o foco foge para o fundo com Tab; adicionar `role="dialog"`, `aria-modal="true"` e `aria-labelledby`.
- [ ] **`aria-expanded` no botão do menu mobile** (`index.html:95`) e fechar o menu ao clicar fora e ao apertar ESC.
- [ ] **`aria-label` nos botões de fechar** (`&times;` sem texto) e `role="alert"` na mensagem de erro do pedido (`index.html:79`).
- [ ] **Adicionar `:focus-visible`** com anel de foco visível (ex.: `outline: 3px solid var(--chocolate)`) em botões, links e imagens clicáveis.
- [ ] **Imagens do lightbox sem atalho de teclado** — adicionar `tabindex="0"` + Enter, ou transformar em `<button>`.
- [ ] **Respeitar `prefers-reduced-motion`**: desativar `float`, `popupFade`, `zoomIn` e transições.
- [ ] **Corrigir `alt`**: "Imgem de Coelho" (`index.html:127`) tem typo; cards sem `loading="lazy"` e sem `width/height`.

### 2.2 UX (melhora perceptível ao usuário)

- [ ] **Estilizar `.hero-subtitle`** — hoje o subtítulo "SEU DOCE FAVORITO" aparece sem estilo (font-size/peso/letter-spacing).
- [ ] **Preços nos itens do modal de pedido** — o usuário escolhe quantidades sem ver preço; exibir preço ao lado de cada item.
- [ ] **Subtotal em tempo real** no modal de pedido.
- [ ] **Esconder/desabilitar setas do carrossel no início/fim** (feedback visual de que não há mais conteúdo) e calcular o scroll pela largura real do card (`card.clientWidth + gap`) em vez de 320px fixo.
- [ ] **`scroll-behavior: smooth` + `scroll-padding-top`** no `html` — hoje links do menu saltam e o header fixo cobre o título da seção alvo.
- [ ] **Estado ativo no menu** (`aria-current`) e hover nos links.
- [ ] **Travar scroll do body ao abrir o menu mobile** (o `menu-open` já é adicionado; só falta a regra CSS).
- [ ] **Botão WhatsApp fixo flutuante** no mobile (padrão de conversão para vendas por WhatsApp).
- [ ] **`cursor: pointer`/link real no `.price-tag`** — hoje parece botão mas não clica (converter em botão "Pedir este sabor" que já abre o modal com o item pré-selecionado).
- [ ] **Contagem regressiva** ou selo "Últimos dias — pedidos até 30/03" no hero (urgência).

### 2.3 Performance (rápido e barato)

- [ ] **Unificar as 3 requisições de fontes Google** em 1 só `link` (menos round-trips).
- [ ] **`loading="lazy"` + `width`/`height`** em todas as imagens abaixo da dobra (elimina CLS).
- [ ] **Adicionar fallbacks de fonte**: `Playfair Display, Georgia, serif`; `Dancing Script, cursive`; `Anton, Arial Black, sans-serif`.
- [ ] **Preconnect** para `fonts.googleapis.com` e `fonts.gstatic.com`.
- [ ] **Consolidar tokens de cor**: usar `--pink-pill` real (ou renomear para `--azul-claro`), criar `--rosa: #ffb7c5`, e referenciar nos SVGs via `currentColor` ou classe, eliminando `!important`.
- [ ] **Unificar as vars duplicadas** (`--bg-ice`/`--branco`/`--bg-cream`) em uma só.
- [ ] **Remover `!important`** do `.close-modal` e das ondas (resolver pela especificidade correta).

### 2.4 Responsividade

- [ ] **Breakpoint intermediário (~600px)**: hoje só há 900px; em 375–600px o hero e os cards ficam apertados.
- [ ] **Ajustar `min-height: 80vh` do hero** em telas pequenas (virar `auto` com padding controlado) e `padding-top: 180px` do header fixo (hoje cobre conteúdo em landscape/mobile).
- [ ] **Modal de pedido com scroll interno em telas baixas** (`max-height: 85vh; overflow-y: auto` no `.popup-content`).
- [ ] **Revisar z-index do nav-pill mobile** (`3100` vs header `3000` vs toggle `3200`) e âncora `top: 65px` que pode destoar em telas grandes com menu aberto.

---

## 3. Melhorias de médio prazo (1–4 semanas)

### 3.1 Dados e conteúdo
- [ ] **Separar produtos em `produtos.json`** e renderizar via JS — hoje o HTML é duplicado à mão (5 ovos + 5 kits); mudar preço/sabor vira edição em 1 lugar.
- [ ] **Seção de depoimentos/reviews** com fotos de clientes (prova social).
- [ ] **FAQ** ("Faz entrega?", "Como pago?", "Posso trocar sabor?") — reduz dúvidas repetidas no WhatsApp.
- [ ] **Embed do Instagram** (feed ou reels) na página.
- [ ] **Link direto "Retirada via Uber Entregas"** com instruções.
- [ ] **Campanha sazonal parametrizada**: data-limite e preços configuráveis por JSON (o site é sazonal de Páscoa — hoje tudo é hardcoded e precisará de edição manual ano que vem).

### 3.2 SEO e analytics
- [ ] **Structured data JSON-LD**: `Product` (preços, imagens) e `FAQPage` — aparece em rich snippets no Google.
- [ ] **sitemap.xml + robots.txt** (GitHub Pages).
- [ ] **Analytics leve** (Plausible/GA4) + evento de conversão no clique "ENVIAR PEDIDO" — hoje não há como medir conversões.
- [ ] **og:image adequado** (1200×630) — hoje usa o logo.
- [ ] **canonical URL** e verificação de Search Console.

### 3.3 Performance e imagem
- [ ] **Converter imagens para WebP/AVIF** com fallback, `srcset` responsivo e compressão (hoje são .jpg/.png crus).
- [ ] **Inlined SVG inline das ondas** (remover repetição de path) ou usar CSS.
- [ ] **Auditoria Lighthouse como rotina** (target: 90+ em todas as métricas).

### 3.4 Engenharia
- [ ] **Organizar CSS por seções comentadas** (hoje ok) e mover para convenção BEM.
- [ ] **Extrair modais do HTML** para componentes dinâmicos.
- [ ] **Minificação automática** (GitHub Actions no push) de CSS/JS.
- [ ] **PWA leve**: manifest.json + service worker para offline de imagens (fácil em site estático).

---

## 4. Melhorias de longo prazo (2+ meses)

### 4.1 Comercial
- [ ] **Carrinho completo com checkout**: subtotal, nome/contato, resumo via WhatsApp estruturado ou integração com plataforma (Nuvemshop, Shopee, Mercado Livre).
- [ ] **WhatsApp Business API** com catálogo e respostas automáticas.
- [ ] **Programa de fidelidade/indicação** e follow-up pós-compra.
- [ ] **Página de produto individual** com fotos em galeria, detalhes e botão comprar.

### 4.2 Plataforma
- [ ] **Migrar para SSG/framework** (Astro, Next.js ou 11ty) com componentes reutilizáveis e dados tipados — elimina a manutenção manual do HTML.
- [ ] **CMS headless** (Sanity/Decap) para a dona do negócio editar produtos sem tocar em código.
- [ ] **Testes E2E** (Playwright) dos fluxos: abrir modal, montar pedido, enviar WhatsApp.
- [ ] **CI de acessibilidade** (axe-core) e Lighthouse em cada deploy.
- [ ] **Design system completo** com tokens, tipografia, botões e componentes documentados (Storybook ou CSS custom properties versionadas).

### 4.3 Experiência
- [ ] **Checkout online real** (Pix/credito) sem depender de conversa no WhatsApp — principal alavanca de conversão futura.
- [ ] **Programação de retirada com horário** e confirmação automática.
- [ ] **Testes A/B** de CTA ("Fazer meu pedido" vs "Encomendar agora") e de layout.
- [ ] **Multi-idioma** (espanhol/inglês) se houver demanda turística em Curitiba.
- [ ] **Aplicação de vídeo** (making-of dos ovos) na seção hero.

---

## 5. Priorização sugerida (pizza de impacto x esforço)

### Fazer primeiro (hoje, alto impacto / baixo esforço)
1. Fechar modais com ESC + trap de foco + `aria-modal`
2. `aria-expanded` no menu mobile + fechar ao clicar fora
3. Preços e subtotal no modal de pedido
4. `scroll-behavior: smooth` + `scroll-padding-top`
5. `loading="lazy"` + `width/height` nas imagens
6. Consolidar tokens de cor e remover `!important`
7. Estilizar `.hero-subtitle`
8. `prefers-reduced-motion`

### Depois (médio prazo)
9. Produtos via JSON
10. Structured data + sitemap + analytics com evento de conversão
11. WebP/AVIF + srcset
12. FAQ + depoimentos
13. Botão flutuante WhatsApp

### Futuro (longo prazo)
14. Checkout online
15. SSG/framework + CMS
16. Testes E2E e acessibilidade em CI
17. PWA / WhatsApp API

---

## Resumo

O site é visualmente bonito e com boa base semântica, mas carece de **acessibilidade** (modais, foco, teclado), **dados corretos de conversão** (preço no pedido, analytics) e **consistência de tokens** (cores divergentes, `!important`). As melhorias de hoje são todas pontuais e sem risco; as de médio/longo prazo evoluem o site de "página estática sazonal" para uma vitrine comercial sustentável e mensurável.
---

# Plano de Implementação — Mobile-First

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development para implementar este plano task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar todas as melhorias "Hoje" do diagnóstico com base mobile-first (375px), validando cada parte com Playwright e fechando com regressão completa da jornada de pedido.

**Architecture:** Site estático vanilla (HTML+CSS+JS). Base de estilos = mobile 375px; media queries `min-width` para escalar (768px tablet, 1024px desktop). Um agente por fase, sequencial (arquivos compartilhados `index.html`/`style.css`/`script.js`), TDD por fase (teste vermelho → implementação → verde → commit).

**Tech Stack:** HTML5, CSS3 (custom properties, clamp(), dvh, safe-area), JS vanilla, Playwright (`@playwright/test`, `channel: 'chrome'` — Chrome do sistema, sem download de browser), servidor `python3 -m http.server`.

**Spec:** Este documento (seções "Padrões de estilo", "Melhorias HOJE", "Plano de Implementação").

## Global Constraints

- Mobile-first: estilos base = 375px; NUNCA usar `max-width` para esconder layout mobile (exceção: somente regras cosméticas); usar `@media (min-width: ...)`.
- Token `--pink-pill` deve ser renomeado para `--azul-claro` em TODAS as ocorrências (definição + 11 usos em `style.css`). Não alterar o valor `#c4e8ff`.
- Remover TODOS os `!important` de `style.css` (`.onda svg path`, `.onda.invertida svg path`, `.close-modal`).
- Remover os atributos `fill` hardcoded dos SVGs das ondas em `index.html` (linhas 134, 192, 249) — o CSS controla a cor via `.onda svg path`.
- Número WhatsApp em produção: `5541996309958` (NÃO trocar). Testes usam override: `script.js` deve ler `window.WHATSAPP_NUMBER || '5541996309958'`; Playwright injeta `window.WHATSAPP_NUMBER = '5541998026260'`.
- Acessibilidade obrigatória: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` nos modais; ESC fecha modais e menu; `aria-expanded` no toggle do menu; inputs de quantidade com `font-size: 16px` (sem zoom iOS); mensagem de erro com `role="alert"`; `:focus-visible` visível em todos os focáveis.
- Touch targets: mín. 44×44px (setas do carrossel, toggle do menu, FAB, botões de fechar).
- `prefers-reduced-motion: reduce` desativa animações (float, popupFade, zoomIn, transições).
- Imagens: `loading="lazy"` + `width`/`height` reais (dimensões no plano) nas imagens dos cards e hero.
- Tipografia com `clamp()`: h1 `clamp(2.2rem, 9vw, 4rem)`; h2 `clamp(1.9rem, 6vw, 2.8rem)`; brand-name `clamp(1.4rem, 5vw, 1.6rem)`.
- Um commit por fase, mensagem no padrão do repo: `Feat:` / `Refactor:`.
- Branch: `feat/mobile-first` (nunca commitar em main).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura; metas; acessibilidade (aria/role); SVG sem fill; botões/inputs |
| `style.css` | Tokens renomeados; base mobile 375px; media queries min-width; a11y; modais bottom-sheet; FAB |
| `script.js` | Catálogo com preços; subtotal; WHATSAPP_NUMBER override; modais acessíveis; carrossel dinâmico; menu drawer |
| `package.json` | DevDeps: @playwright/test; scripts `test` e `test:regression` |
| `playwright.config.js` | channel chrome; webServer python3; 3 projetos de viewport |
| `tests/*.spec.js` | Testes por fase + regressão da jornada |

---

## Task 0: Infraestrutura de testes + número WhatsApp

**Files:**
- Create: `package.json`, `playwright.config.js`, `tests/regression-journey.spec.js`
- Modify: `script.js:134` (URL wa.me)

**Interfaces:**
- Produces: constante `window.WHATSAPP_NUMBER` (string com DDI, ex. `'5541998026260'`) consumida por `script.js`; suíte Playwright com helper `abrirModalPedido(page)` usado por tasks 4–7.

- [ ] **Step 1: Criar package.json e instalar Playwright**

```bash
npm init -y && npm pkg set type=commonjs scripts.test="playwright test" scripts.test:regression="playwright test tests/regression-journey.spec.js" && npm i -D @playwright/test
```

- [ ] **Step 2: Criar playwright.config.js**

```js
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:8080' },
  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
```

- [ ] **Step 3: Escrever o teste vermelho da jornada (falha: número antigo + window.open não interceptado)**

```js
// tests/regression-journey.spec.js
const { test, expect } = require('@playwright/test');

test('jornada: pedido envia link wa.me com número de teste e itens', async ({ page }) => {
  await page.addInitScript(() => { window.WHATSAPP_NUMBER = '5541998026260'; });
  await page.route('**/wa.me/**', route => {
    waUrl = route.request().url();
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' });
  });
  let waUrl = '';
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.locator('.item-selecao').nth(0).locator('input').fill('2');
  await page.locator('.item-selecao').nth(1).locator('input').fill('1');
  await page.getByRole('button', { name: /enviar pedido/i }).click();
  await page.waitForTimeout(500);
  expect(waUrl).toContain('wa.me/5541998026260');
  expect(waUrl).toContain(encodeURIComponent('2x'));
});
```

- [ ] **Step 4: Rodar e verificar que FALHA** — `npx playwright test tests/regression-journey.spec.js --project=mobile`

- [ ] **Step 5: Implementar o override em script.js**

```js
// topo do arquivo
const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5541996309958';
// na URL:
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
```

- [ ] **Step 6: Rodar o teste e verificar que PASSA**

- [ ] **Step 7: Commit** — `git add package.json package-lock.json playwright.config.js tests/script.js && git commit -m "Feat: infraestrutura de testes Playwright + número WhatsApp configurável"`

---

## Task 1: Tokens & fundação CSS

**Files:**
- Modify: `style.css:1-10` (tokens), `style.css` (todas as refs `--pink-pill`), `index.html:20-23` (fontes), `index.html:132-136,190-194,247-251` (fills SVG), `index.html` (meta theme-color)
- Test: `tests/smoke-foundation.spec.js`

**Interfaces:**
- Consumes: nada.
- Produces: token `--azul-claro` (#c4e8ff), token `--rosa` (#ffb7c5, usado nos SVGs via CSS), `--branco` único, classe base `:focus-visible`, regra `prefers-reduced-motion`, `scroll-behavior: smooth` + `scroll-padding-top: 90px` no `html`, fontes unificadas (1 link), `font-family` fallbacks (Playfair→Georgia serif; Dancing→cursive; Anton→Arial Black).

- [ ] **Step 1: Teste vermelho — smoke-foundation.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('tokens e base a11y', async ({ page }) => {
  await page.goto('/');
  const bg = await page.locator('.nav-pill').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(196, 232, 255)'); // #c4e8ff via --azul-claro
  const html = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(html).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Renomear token** — `--pink-pill` → `--azul-claro` (12 ocorrências: def linha 3; usos linhas 59, 65, 92, 101, 168, 228, 332, 355, 374, 418, 442). Verificar com `rg --pink-pill` = 0.

- [ ] **Step 3: Unificar brancos** — remover `--bg-ice` e `--bg-cream`; usar `--branco` em tudo (ocorrências: 2, 9, 112, 171).

- [ ] **Step 4: Remover `!important`** — `.onda svg path` (linha 92), `.onda.invertida svg path` (linha 101), `.close-modal` (linhas 362, 369, 373). Substituir por especificidade correta (`.onda.invertida svg path { fill: var(--branco); }` funciona sem !important pois SVG inline `fill` atributo será removido; `.close-modal` usar `#fff` e `var(--azul-claro)` em hover com regra mais específica ou normal).

- [ ] **Step 5: Remover fills hardcoded dos SVGs em index.html** (3 ondas) — apagar `fill="#ffb7c5"` e `fill="#ffffff"`. Adicionar `fill` controlado por CSS: `.onda svg path { fill: var(--rosa); }` e `.onda.invertida svg path { fill: var(--branco); }`. Criar token `--rosa: #ffb7c5`.

- [ ] **Step 6: Fontes** — unificar 3 links (linhas 20-22) em 1:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Dancing+Script:wght@700&family=Playfair+Display:wght@700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
```

- [ ] **Step 7: Fallbacks de fonte no CSS** — `font-family: 'Playfair Display', Georgia, serif;` / `'Dancing Script', cursive;` / `'Anton', 'Arial Black', sans-serif;` / body `'Poppins', system-ui, sans-serif`.

- [ ] **Step 8: Base a11y/perf no CSS** — adicionar:

```css
html { scroll-behavior: smooth; scroll-padding-top: 90px; }
:focus-visible { outline: 3px solid var(--chocolate); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .hero-image img { animation: none; }
}
```

- [ ] **Step 9: Meta theme-color** em index.html `<head>`: `<meta name="theme-color" content="#c4e8ff">`.

- [ ] **Step 10: Rodar smoke-foundation + verificar rg --pink-pill = 0, rg !important = 0**

- [ ] **Step 11: Commit** — `Feat: tokens renomeados, fontes unificadas e base de acessibilidade`

---

## Task 2: Layout mobile-first

**Files:**
- Modify: `style.css` (media queries, hero, seções, cards, ondas)
- Test: `tests/smoke-layout.spec.js`

**Interfaces:**
- Consumes: tokens da Task 1 (`--azul-claro`, `--rosa`, `--branco`).
- Produces: layout base 375px sem overflow horizontal; `@media (min-width: 768px)` e `@media (min-width: 1024px)`.

- [ ] **Step 1: Teste vermelho — smoke-layout.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('sem overflow horizontal em mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
test('hero-subtitle estilizado', async ({ page }) => {
  await page.goto('/');
  const fs = await page.locator('.hero-subtitle').evaluate(el => getComputedStyle(el).fontSize);
  expect(parseFloat(fs)).toBeGreaterThan(10);
});
```

- [ ] **Step 2: Inverter media queries** — REMOVER o bloco `@media (max-width: 900px)` inteiro (linhas 433-461). Suas regras viram base mobile:
  - `header { padding: 10px 5%; }` (base)
  - `.menu-toggle { display: block; ... }` (base, com 44px de alvo: `min-width: 44px; min-height: 44px;`)
  - `.hero-container { flex-direction: column; text-align: center; gap: 30px; }` (base)
  - `.hero { padding-top: 120px; }` (base → usar `clamp(100px, 15vh, 180px)`)
  - `.hero-content { order: 1; align-items: center; }` (base)
  - `.hero-image { order: 2; }` (base)
  - `.hero h1 { font-size: 2.5rem; }` (base → substituir por `clamp(2.2rem, 9vw, 4rem)` na regra original, removendo o 4rem fixo)
  - `.nav-pill { display: none; position: fixed; top: 65px; ... }` (base → drawer será refeito na Task 3; aqui apenas esconder em mobile)
  - `.card { flex: 0 0 280px; }` (base)
  - `.carousel-btn { width: 35px; height: 35px; }` (base → usar 44px na regra original e remover este override)
  - `.onda svg { height: 50px; }` (base → usar `clamp(40px, 8vw, 80px)` na original)
  - `.modal-content { width: 85%; }` (base)
  - `.close-modal { top: 15px; right: 20px; font-size: 45px; }` (base)

- [ ] **Step 3: Novo breakpoint desktop** — `@media (min-width: 1024px)` com o layout desktop:
  - `.hero { min-height: 80vh; padding: 180px 10% 40px; }` (original)
  - `.hero-container { flex-direction: row; text-align: left; }`
  - `.hero-content { align-items: flex-start; order: 0; }`
  - `.hero-image { order: 0; }`
  - `.nav-pill { display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`
  - `.menu-toggle { display: none; }`
  - `.card { flex: 0 0 300px; }`
  - `.onda svg { height: 80px; }`
  - `.modal-content { width: auto; max-width: 90%; }`
  - `.close-modal { top: 20px; right: 30px; font-size: 60px; }`

- [ ] **Step 4: Hero mobile refinado**
  - `.hero { min-height: auto; padding: clamp(100px, 15vh, 180px) 5% 40px; }` (base)
  - `.hero-subtitle { font-family: 'Poppins', sans-serif; font-weight: 600; letter-spacing: 3px; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }`
  - `.hero-image img { max-width: min(80%, 420px); }` (mobile) — mantém animação float

- [ ] **Step 5: h2 com clamp** — `h2 { font-size: clamp(1.9rem, 6vw, 2.8rem); }`

- [ ] **Step 6: Rodar smoke-layout nos 3 projetos + conferir visual em mobile (375) e desktop (1440)**

- [ ] **Step 7: Commit** — `Refactor: layout mobile-first com media queries min-width`

---

## Task 3: Header & menu drawer mobile

**Files:**
- Modify: `index.html:95-97` (toggle aria-expanded), `index.html:99-106` (nav aria-label, drawer), `style.css` (drawer), `script.js:18-43` (menu lógica)
- Test: `tests/smoke-menu.spec.js`

**Interfaces:**
- Consumes: Task 2 (base mobile, nav escondida).
- Produces: função `toggleMenu(abrir: boolean)` e atributo `aria-expanded` no `#menu-toggle`; body com classe `menu-open` (scroll lock via CSS `body.menu-open { overflow: hidden; }`).

- [ ] **Step 1: Teste vermelho — smoke-menu.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('menu drawer abre/fecha com aria-expanded', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /abrir menu/i });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.locator('#nav-menu')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#nav-menu')).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
test('scroll do body trava com menu aberto', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /abrir menu/i }).click();
  const locked = await page.evaluate(() => document.body.classList.contains('menu-open'));
  expect(locked).toBe(true);
});
```

- [ ] **Step 2: HTML** — `<button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-menu">`; `<nav class="nav-pill" id="nav-menu" aria-label="Menu principal">`.

- [ ] **Step 3: CSS drawer (base mobile)** — `.nav-pill` vira drawer full-screen:

```css
.nav-pill {
  position: fixed; top: 0; right: 0; width: 100%; height: 100dvh;
  background: var(--azul-claro); padding: 90px 5% 40px;
  border-radius: 0; display: none; z-index: 3100;
  box-shadow: none;
}
.nav-pill.active { display: block; animation: drawerIn 0.25s ease; }
.nav-pill ul { flex-direction: column; gap: 24px; align-items: flex-start; }
.nav-pill a { font-size: 1.3rem; color: var(--branco); }
@keyframes drawerIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
body.menu-open { overflow: hidden; }
```

- [ ] **Step 4: JS menu refatorado**

```js
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

function toggleMenu(open) {
  const shouldOpen = open ?? !navMenu.classList.contains('active');
  navMenu.classList.toggle('active', shouldOpen);
  document.body.classList.toggle('menu-open', shouldOpen);
  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars', !shouldOpen);
  icon.classList.toggle('fa-times', shouldOpen);
  if (shouldOpen) menuToggle.focus();
}
if (menuToggle) {
  menuToggle.addEventListener('click', () => toggleMenu());
  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navMenu.classList.contains('active')) toggleMenu(false); });
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) toggleMenu(false);
  });
}
```

- [ ] **Step 5: Desktop ≥1024px** — restaurar pill: `display: flex` (não block), alinhada ao centro, `position: absolute`, `top: 50%; left: 50%; transform: translate(-50%, -50%)`, sem animação. `body.menu-open` não afeta desktop (menu não abre por lá).

- [ ] **Step 6: aria-current** — JS: ao clicar em link, `navMenu.querySelectorAll('a').forEach(a => a.removeAttribute('aria-current'))` e `link.setAttribute('aria-current', 'page')` no clicado.

- [ ] **Step 7: Rodar smoke-menu nos 3 projetos + verificação visual**

- [ ] **Step 8: Commit** — `Feat: menu drawer mobile acessível com aria-expanded e scroll lock`

---

## Task 4: Carrossel & cards

**Files:**
- Modify: `index.html:142-187` e `196-244` (dots, setas), `style.css` (dots, setas 44px, lazy), `script.js:4-13` (scroll real + dots)
- Test: `tests/smoke-carousel.spec.js`

**Interfaces:**
- Consumes: Task 2 (cards base mobile).
- Produces: `atualizarDots(trackId)` e `updateCarouselButtons(trackId)` chamadas no load e após scroll; elementos `.carousel-dot` (um por card, `aria-label="Ir para o card N"`); setas com estado `disabled` nas pontas.

- [ ] **Step 1: Teste vermelho — smoke-carousel.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('carrossel navega e dots sincronizam', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('#ovos-track');
  await expect(page.locator('#ovos-track .carousel-dot')).toHaveCount(5);
  const next = page.locator('#ovos-track').locator('..').locator('.carousel-btn.next');
  await next.click();
  await page.waitForTimeout(600);
  const x = await track.evaluate(el => el.scrollLeft);
  expect(x).toBeGreaterThan(0);
  await page.keyboard.press('End'); // aproximação: rolar direto no fim via JS
  await track.evaluate(el => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
  const disabled = await page.locator('#ovos-track').locator('..').locator('.carousel-btn.next').isDisabled();
  expect(disabled).toBe(true);
});
```

- [ ] **Step 2: HTML** — adicionar container de dots após cada `.carousel-track`: `<div class="carousel-dots" id="ovos-dots"></div>` (e `presentes-dots`). Dots são gerados via JS.

- [ ] **Step 3: JS carrossel**

```js
function initCarousel(trackId) {
  const track = document.getElementById(trackId);
  const dots = document.getElementById(trackId.replace('-track', '-dots'));
  const wrapper = track.closest('.carousel-wrapper');
  const prev = wrapper.querySelector('.carousel-btn.prev');
  const next = wrapper.querySelector('.carousel-btn.next');
  const scrollAmount = () => track.firstElementChild ? track.firstElementChild.clientWidth + 20 : 320;

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const idx = Math.round(track.scrollLeft / scrollAmount());
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max - 1;
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  track.addEventListener('scroll', update, { passive: true });
  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

  const n = track.children.length;
  for (let i = 0; i < n; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ir para o card ${i + 1}`);
    dot.addEventListener('click', () => track.scrollTo({ left: i * scrollAmount(), behavior: 'smooth' }));
    dots.appendChild(dot);
  }
  update();
  window.addEventListener('resize', update);
}
initCarousel('ovos-track');
initCarousel('presentes-track');
```

- [ ] **Step 4: CSS** — setas 44×44px (base), `:disabled` com `opacity: .4; cursor: default`; dots 10px pill `background: rgba(78,52,46,.3)`, `.active { background: var(--chocolate); width: 24px; }`, `min-height: 44px` no wrapper dots com alinhamento central.

- [ ] **Step 5: Imagens** — em `index.html` adicionar `loading="lazy"` + `width`/`height` reais em TODAS as imagens (dimensões):
  - `coelho-borboleta.png` 508×491 (hero)
  - `ovo_brigadeiro.jpg` 1024×896, `ovo_ninho_nutella.jpg` 966×961, `ovo_uva.jpg` 963×851, `ovo_brownie.jpg` 925×881, `ovo_maracuja.jpg` 731×576
  - `dupla_ovos.jpg` 883×906, `kit_degustacao.jpg` 892×934, `caixa_6_brigadeiros.jpg` 848×722, `lembrancinha_4_unidades.jpg` 693×905, `lembrancinha_2_unidades.jpg` 622×813
  - `logo-1.png` 513×486 (header) e favicon
  - CSS: `.card img { height: auto; aspect-ratio: 4/3; object-fit: cover; }` (substitui `height: 350px`); `width: 100%` já existe. `.hero-image img` mantém altura natural (sem aspect-ratio).

- [ ] **Step 6: Rodar smoke-carousel nos 3 projetos**

- [ ] **Step 7: Commit** — `Feat: carrossel com dots, scroll por largura real e imagens lazy`

---

## Task 5: Modais & fluxo de pedido

**Files:**
- Modify: `index.html:29-83` (modal pedido: prices, aria, inputs 16px), `index.html:283-286` (lightbox aria), `style.css` (bottom sheet, subtotal, preços), `script.js` (catálogo preços, subtotal, preselect, ESC/trap foco, lightbox teclado)
- Test: `tests/smoke-modal.spec.js`

**Interfaces:**
- Consumes: Task 0 (WHATSAPP_NUMBER), Task 2 (modal-content base), Task 4 (cards).
- Produces: objeto `CATALOGO` (nome→preço), função `abrirModalPedido(itemNome?)`, função `atualizarSubtotal()`, `trapFocus(modal)`; lightbox com ESC e Enter.

- [ ] **Step 1: Teste vermelho — smoke-modal.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('modal pedido: preços, subtotal e validação', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  const modal = page.locator('#modal-pedido');
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  await expect(modal.locator('.item-selecao').first().locator('.item-price')).toContainText('R$');
  await modal.locator('.item-selecao').nth(0).locator('input').fill('2');
  await modal.locator('.item-selecao').nth(1).locator('input').fill('1');
  const total = modal.locator('.total-pedido');
  await expect(total).toContainText('R$');
  const valor = await total.textContent();
  expect(valor).toMatch(/179/); // 2×57 + 65
  await modal.getByRole('button', { name: /enviar pedido/i }).click();
  await expect(modal.locator('.erro-pedido')).toBeHidden();
});
test('modal pedido: erro role=alert quando vazio', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.locator('#modal-pedido').getByRole('button', { name: /enviar pedido/i }).click();
  await expect(page.locator('.erro-pedido')).toHaveAttribute('role', 'alert');
  await expect(page.locator('.erro-pedido')).toBeVisible();
});
test('lightbox: fecha com ESC e aceita Enter', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card img').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#image-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-modal')).toBeHidden();
});
```

- [ ] **Step 2: HTML modal pedido** — cada `.item-selecao` ganha `<span class="item-price">R$ X,00</span>` ao lado do nome; inputs com `type="number"` mantidos, `aria-label="Quantidade de {nome}"`; adicionar após a lista:

```html
<div class="resumo-pedido">
  <div class="total-pedido"><span>Total:</span><strong id="valor-total">R$ 0,00</strong></div>
</div>
```

- [ ] **Step 3: HTML lightbox** — `aria-label="Fechar imagem"` no `.close-modal`; `role="dialog"` `aria-modal="true"` `aria-label="Visualização da imagem"` na `#image-modal`.

- [ ] **Step 4: CSS bottom sheet (base mobile)** — `.popup-content` do `#modal-pedido`:

```css
#modal-pedido .popup-content {
  max-width: 100%; width: 100%; height: auto; max-height: 90dvh;
  border-radius: 24px 24px 0 0; padding: 32px 20px calc(32px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; align-items: center;
  position: fixed; bottom: 0; left: 0;
  animation: sheetUp 0.3s ease;
}
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
#modal-pedido .popup-content h3, #modal-pedido .popup-content > p { text-align: center; }
#modal-pedido .popup-content .btn-enviar { width: 100%; }
#lista-itens-pedido { width: 100%; flex: 1; }
.item-price { margin-left: auto; font-weight: 600; color: var(--chocolate); font-size: 0.85rem; }
.item-selecao input { font-size: 16px; min-height: 44px; }
.resumo-pedido { width: 100%; margin-top: 8px; }
.total-pedido { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid var(--azul-claro); font-size: 1.1rem; }
```

Desktop ≥768px: `#modal-pedido .popup-content { max-width: 450px; position: static; border-radius: 20px; margin: auto; }` e `animation: popupFade 0.4s ease;`.

- [ ] **Step 5: JS catálogo + subtotal**

```js
const CATALOGO = {
  'Ovo Brigadeiro': 57, 'Ovo Ninho com Nutella': 65, 'Ovo Surpresinha de Uva': 62,
  'Ovo Escondidinho de Brownie': 65, 'Ovo de Maracujá': 62, 'Dupla de Ovos': 79,
  'Kit Degustação': 48, 'Caixa com 6 Brigadeiros': 25, 'Caixa Livro (4 un.)': 17, 'Caixa com 2 un.': 8,
};
function atualizarSubtotal() {
  const inputs = document.querySelectorAll('#lista-itens-pedido input');
  let total = 0;
  inputs.forEach(inp => {
    const qtd = parseInt(inp.value) || 0;
    total += qtd * (CATALOGO[inp.dataset.nome] || 0);
  });
  const el = document.getElementById('valor-total');
  if (el) el.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return total;
}
document.querySelectorAll('#lista-itens-pedido input').forEach(inp => inp.addEventListener('input', atualizarSubtotal));
```

- [ ] **Step 6: JS preselect** — `abrirModalPedido(itemNome)` opcional: se nome passado, seta input correspondente para 1 antes de abrir. Botão nos cards (Task 4 já deixou `.price-tag` como `<button>` com `data-nome`): transformar `.price-tag` divs em `<button class="price-tag" data-nome="...">Pedir</button>`? — Manter exibição de preço: `<button class="price-tag" data-nome="Ovo Brigadeiro">Pedir · R$ 57,00</button>`. JS: `document.querySelectorAll('.price-tag[data-nome]').forEach(b => b.addEventListener('click', () => abrirModalPedido(b.dataset.nome)))`.

- [ ] **Step 7: JS a11y modais** — `abrirModalPedido`/`fecharModalPedido` e lightbox com:

```js
function abrirModalPedido(itemNome) {
  if (itemNome) {
    const inp = document.querySelector(`#lista-itens-pedido input[data-nome="${itemNome}"]`);
    if (inp) inp.value = '1';
  }
  if (modalPedido) {
    modalPedido.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalPedido.setAttribute('aria-modal', 'true');
    atualizarSubtotal();
    const primeiroInput = modalPedido.querySelector('input, button');
    if (primeiroInput) primeiroInput.focus();
  }
}
function fecharModalPedido() {
  if (modalPedido) {
    modalPedido.style.display = 'none';
    document.body.style.overflow = 'auto';
    const erroVisual = document.getElementById('mensagem-erro-vazio');
    if (erroVisual) erroVisual.style.display = 'none';
  }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fecharModalPedido(); fecharLightbox(); }
});
```

Lightbox: `fecharLightbox()`, `.card img` com `tabindex="0"` + Enter via keydown; remover `onclick` inline e usar listeners; `document.body.style.overflow` consistentes.

- [ ] **Step 8: Rodar smoke-modal nos 3 projetos (subtotal: 2×57+65=179)**

- [ ] **Step 9: Commit** — `Feat: modal de pedido com preços, subtotal e acessibilidade`

---

## Task 6: FAB WhatsApp

**Files:**
- Modify: `index.html` (botão FAB antes do footer), `style.css` (FAB), `script.js` (abre wa.me)
- Test: `tests/smoke-fab.spec.js`

**Interfaces:**
- Consumes: Task 0 (WHATSAPP_NUMBER).
- Produces: `#fab-whatsapp` (visível só <768px), link para `https://wa.me/${WHATSAPP_NUMBER}?text=<saudação>`.

- [ ] **Step 1: Teste vermelho — smoke-fab.spec.js**

```js
const { test, expect } = require('@playwright/test');
test('FAB visível no mobile e oculto no desktop', async ({ page }) => {
  await page.goto('/');
  if (page.viewportSize().width < 768) {
    await expect(page.locator('#fab-whatsapp')).toBeVisible();
  } else {
    await expect(page.locator('#fab-whatsapp')).toBeHidden();
  }
});
```

- [ ] **Step 2: HTML** — `<a id="fab-whatsapp" class="fab-whatsapp" href="#" aria-label="Falar no WhatsApp"><i class="fab fa-whatsapp"></i></a>` — href preenchido no JS com o número configurável.

- [ ] **Step 3: CSS**

```css
.fab-whatsapp {
  position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom));
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--whatsapp-green); color: var(--branco);
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  z-index: 2000; transition: transform 0.2s;
}
.fab-whatsapp:active { transform: scale(0.92); }
@media (min-width: 768px) { .fab-whatsapp { display: none; } }
```

- [ ] **Step 4: JS** — `document.getElementById('fab-whatsapp').href = \`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Quero fazer um pedido 🐰')}\`;`

- [ ] **Step 5: Rodar smoke-fab (mobile visível, desktop oculto)**

- [ ] **Step 6: Commit** — `Feat: botão flutuante WhatsApp no mobile`

---

## Task 7: Regressão completa da jornada

**Files:**
- Modify: `tests/regression-journey.spec.js` (expandir), `tests/smoke-*.spec.js` (se existirem)
- Test: suíte inteira.

**Interfaces:**
- Consumes: todas as tasks anteriores.

- [ ] **Step 1: Expandir regressão-journey.spec.js** — jornada completa multi-viewport:
  1. Load `/` nos 3 projetos; sem overflow horizontal; header visível
  2. Menu: abrir → `aria-expanded=true` → clicar link "OVOS" → menu fecha, `aria-current` no link, scroll até `#ovos`
  3. Carrossel: próxima seta rola; dots = 5; última seta disabled no fim
  4. Lightbox: Enter no primeiro card → visível → ESC → oculto
  5. Pedido: CTA abre modal (`aria-modal`), preencher 2×Ovo Brigadeiro + 1×Ninho, subtotal R$ 179,00, ENVIAR → popup interceptado `wa.me/5541998026260` contém `2x` e `1x` e mensagem com "Retirada em Colombo"
  6. Pedido vazio: erro `role="alert"` visível, modal permanece aberto
  7. FAB: visível mobile / oculto desktop
  8. Botão "Pedir" do card: abre modal com item pré-selecionado (valor=1)
- [ ] **Step 2: Rodar suíte completa** — `npx playwright test` (todos os projetos)
- [ ] **Step 3: Lighthouse opcional** — `npx lighthouse http://127.0.0.1:8080 --only-categories=accessibility,performance --chrome-flags="--headless"` (relatório informativo)
- [ ] **Step 4: Correções de qualquer falha e re-rodar até verde**
- [ ] **Step 5: Commit** — `Feat: regressão completa da jornada de pedido`

---

## Fases futuras (fora de escopo desta rodada)

- produtos.json + render via JS
- structured data / sitemap / analytics
- WebP/AVIF + srcset
- FAQ, depoimentos, Instagram embed
- checkout online, SSG/CMS, testes E2E em CI, PWA

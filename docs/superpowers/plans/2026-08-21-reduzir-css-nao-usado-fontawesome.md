# Redução de CSS não usado — Font Awesome → SVGs inline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar os ~15 KiB de CSS não usado apontados pelo PageSpeed removendo o `all.min.css` do Font Awesome (cdnjs) e substituindo os 5 ícones usados por SVGs inline.

**Architecture:** Site estático (1 página). Os únicos ícones em uso são `bars`, `xmark/times`, `whatsapp`, `chevron-left` e `chevron-right` (7 ocorrências). Substituí-los por SVGs inline permite remover o `<link>` render-blocking e também o download das webfonts do FA (~150 KiB extras não contabilizados na auditoria). A troca hamburguer/X passa a ser feita via CSS usando a classe `body.menu-open` que o `script.js` já alterna hoje (script.js:62).

**Tech Stack:** HTML/CSS/JS puros; Playwright para testes (`npm test`, servidor `python3 -m http.server 8080`).

**Spec:** Auditoria PageSpeed mobile — "Reduza o CSS não usado, economia estimada de 15 KiB", URL afetada: `…css/all.min.css (cdnjs.cloudflare.com), 14,8 KiB`.

## Global Constraints

- NÃO alterar nada além dos arquivos listados no plano (escopo fechado).
- NÃO "corrigir" outros pontos do site fora desta auditoria.
- NENHUM commit sem perguntar antes ao usuário.
- Fidelidade visual: ícones devem manter tamanho/cor atuais (`1em` + `currentColor`, alinhamento idêntico ao do FA).
- SVGs copiados da versão fixada `@fortawesome/fontawesome-free@6.0.0` (mesma versão hoje em produção).

## Contexto verificado (fatos, não suposições)

| Item | Local |
|---|---|
| Link CDN render-blocking | `index.html:25` |
| `fas fa-bars` | `index.html:121` |
| `fab fa-whatsapp` | `index.html:147` e `index.html:303` |
| `fas fa-chevron-left` | `index.html:169` e `index.html:228` |
| `fas fa-chevron-right` | `index.html:210` e `index.html:269` |
| Toggle `fa-bars`/`fa-times` no JS | `script.js:64-66` (dentro de `toggleMenu`) |
| Classe `body.menu-open` já alternada | `script.js:62` |
| `.menu-toggle { font-size: 1.8rem }` (desktop some) | `style.css:55` e `style.css:545` |
| Testes existentes NÃO dependem de classes `fa-*` nem de cdnjs | grep em `tests/` |

---

## Etapa 1 — Teste que falha primeiro (TDD)

### Task 1: Criar spec que detecta o problema atual

**Files:**
- Create: `tests/perf-sem-css-externo.spec.js`

**Interfaces:**
- Produces: teste de regressão permanente — nenhuma request a `cdnjs.cloudflare.com`; ícones como SVGs inline presentes.

- [ ] **Step 1: Escrever o teste**

```js
const { test, expect } = require('@playwright/test');

test('nenhum CSS do Font Awesome é baixado de cdnjs', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto('/');
  const cdnRequests = requests.filter(u => u.includes('cdnjs.cloudflare.com'));
  expect(cdnRequests).toEqual([]);
});

test('ícones são SVGs inline', async ({ page }) => {
  await page.goto('/');
  // menu-toggle fica display:none no desktop (style.css:545) → usar count
  await expect(page.locator('.menu-toggle .icon-bars')).toHaveCount(1);
  await expect(page.locator('.btn-cta .icon-whatsapp').first()).toBeVisible();
  await expect(page.locator('.carousel-btn .icon-chevron-left').first()).toBeVisible();
  await expect(page.locator('.carousel-btn .icon-chevron-right').first()).toBeVisible();
});
```

- [ ] **Step 2: Rodar e confirmar que FALHA hoje**

Run: `npm test -- tests/perf-sem-css-externo.spec.js`
Expected: FAIL — `expected [] to equal [ 'https://cdnjs.cloudflare.com/...all.min.css' ]` (o request ao CDN existe hoje).

---

## Etapa 2 — Substituição por SVG inline

### Task 2: Baixar os 5 SVGs oficiais (versão fixada)

**Files:**
- Create (temporário, fora do repo): `/tmp/opencode/fa-svg/*.svg`

- [ ] **Step 1: Baixar da mesma versão em produção**

```bash
mkdir -p /tmp/opencode/fa-svg
curl -fsSL -o /tmp/opencode/fa-svg/bars.svg          https://unpkg.com/@fortawesome/fontawesome-free@6.0.0/svgs/solid/bars.svg
curl -fsSL -o /tmp/opencode/fa-svg/xmark.svg         https://unpkg.com/@fortawesome/fontawesome-free@6.0.0/svgs/solid/xmark.svg
curl -fsSL -o /tmp/opencode/fa-svg/chevron-left.svg  https://unpkg.com/@fortawesome/fontawesome-free@6.0.0/svgs/solid/chevron-left.svg
curl -fsSL -o /tmp/opencode/fa-svg/chevron-right.svg https://unpkg.com/@fortawesome/fontawesome-free@6.0.0/svgs/solid/chevron-right.svg
curl -fsSL -o /tmp/opencode/fa-svg/whatsapp.svg      https://unpkg.com/@fortawesome/fontawesome-free@6.0.0/svgs/brands/whatsapp.svg
```

(Se unpkg estiver indisponível, alternativa: jsdelivr `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/svgs/...`)

- [ ] **Step 2: Conferir conteúdo**

Run: `grep -h 'viewBox\|<path' /tmp/opencode/fa-svg/*.svg`
Expected: cada arquivo tem um `viewBox="0 0 W 512"` e um único `<path d="..."/>`. Anotar `viewBox` e `d` de cada um — serão colados no Task 3.

### Task 3: Editar index.html

**Files:**
- Modify: `index.html:25` (remover link), `index.html:121` (bars + close), `147` e `303` (whatsapp), `169` e `228` (chevron-left), `210` e `269` (chevron-right)

**Interfaces:**
- Consumes: viewBox/d dos arquivos do Task 2.
- Produces: classes `icon-bars`, `icon-close`, `icon-whatsapp`, `icon-chevron-left`, `icon-chevron-right` (consumidas pelo CSS do Task 4 e pelos seletores do teste).

- [ ] **Step 1: Remover o link do CDN e deixar atribuição**

Linha 25:
```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```
Substituir por:
```html
    <!-- Ícones: Font Awesome Free 6.0.0 inline (CC BY 4.0) — https://fontawesome.com/license/free -->
```

- [ ] **Step 2: Trocar os 7 `<i>` por SVGs inline**

Padrão (colar o `viewBox` e o `d` reais do Task 2; `aria-hidden` pois todos são decorativos — os botões já têm texto ou `aria-label`):

```html
<svg class="icon icon-NOME" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="VIEWBOX"><path d="D"/></svg>
```

Mapeamento exato:

| Onde | Antes | Depois (classe) |
|---|---|---|
| 121 (menu-toggle) | `<i class="fas fa-bars"></i>` | `icon-bars` + adicionar também `icon-close` (xmark) logo abaixo — os dois ficam dentro do botão, visibilidade controlada por CSS |
| 147, 303 | `<i class="fab fa-whatsapp"></i>` | `icon-whatsapp` |
| 169, 228 | `<i class="fas fa-chevron-left"></i>` | `icon-chevron-left` |
| 210, 269 | `<i class="fas fa-chevron-right"></i>` | `icon-chevron-right` |

Bloco do menu-toggle (linhas 120-122) deve ficar:
```html
        <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-menu">
            <svg class="icon icon-bars" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="VIEWBOX_BARS"><path d="D_BARS"/></svg>
            <svg class="icon icon-close" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="VIEWBOX_XMARK"><path d="D_XMARK"/></svg>
        </button>
```

- [ ] **Step 3: Conferir que nada sobrou**

Run: `grep -n 'cdnjs\|<i class=' index.html`
Expected: apenas a linha do comentário de atribuição; nenhum `<i class=` restante.

### Task 4: CSS e JS mínimos

**Files:**
- Modify: `style.css` (adicionar seção nova ao final), `script.js:64-66` (remover 3 linhas)

**Interfaces:**
- Consumes: classes `icon*` do Task 3; classe `body.menu-open` já existente (script.js:62).
- Consumes: herda `font-size` do contexto (ex.: `.menu-toggle` = 1.8rem em style.css:55) para reproduzir o tamanho do FA (`1em`).

- [ ] **Step 1: Adicionar ao final do style.css**

```css
/* --- Ícones SVG inline (substitui Font Awesome) --- */
svg.icon { width: 1em; height: 1em; fill: currentColor; display: inline-block; vertical-align: -0.125em; }
.menu-toggle .icon-close { display: none; }
body.menu-open .menu-toggle .icon-close { display: block; }
body.menu-open .menu-toggle .icon-bars { display: none; }
```
(`vertical-align: -0.125em` replica o baseline do FA; irrelevante dentro dos flex, inofensivo nos CTAs.)

- [ ] **Step 2: Remover toggle de classes FA no script.js**

Remover as linhas 64-66:
```js
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars', !shouldOpen);
    icon.classList.toggle('fa-times', shouldOpen);
```
A troca hamburguer/X agora é 100% CSS via `body.menu-open` (já alternada na linha 62). Não mexer em mais nada da função.

---

## Etapa 3 — Validação e commit

### Task 5: Validação completa

- [ ] **Step 1: Suite inteira**

Run: `npm test`
Expected: PASS em mobile/tablet/desktop — incluindo os 2 novos testes da Task 1 e os smoke existentes (menu, carousel, modal, layout, foundation).

- [ ] **Step 2: Conferência de escopo**

Run: `git diff --stat`
Expected: somente `index.html`, `style.css`, `script.js`, `tests/perf-sem-css-externo.spec.js`.

- [ ] **Step 3: Sanidade visual (opcional)**

Run: `python3 -m http.server 8080 &` e conferir no navegador: hamburguer abre/fecha com X, setas dos carrosséis, WhatsApp nos CTAs.

### Task 6: Commit — SOMENTE após perguntar ao usuário

- [ ] **Step 1: Perguntar "posso commitar?"** e só então:

```bash
git add index.html style.css script.js tests/perf-sem-css-externo.spec.js docs/superpowers/plans/2026-08-21-reduzir-css-nao-usado-fontawesome.md
git commit -m "perf: substitui Font Awesome do CDN por SVGs inline"
```

- [ ] **Step 2: Pós-deploy (usuário):** após push/GitHub Pages propagar, rodar o PageSpeed de novo — auditoria de CSS não usado deve sair do relatório (economia > 15 KiB, pois as webfonts do FA também deixam de ser baixadas).

---

## Self-review executado

1. **Cobertura do spec:** auditoria cita exclusivamente `all.min.css` → Tasks 1-4 eliminam a origem; validação Task 5.
2. **Placeholders:** `viewBox`/`d` vêm de download com comandos exatos (Task 2) — dado de entrada, não TBD.
3. **Consistência de nomes:** `icon-bars/close/whatsapp/chevron-left/chevron-right` idênticos em HTML (T3), CSS (T4) e testes (T1).

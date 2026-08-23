# Performance Pós-FA — Imagens, LCP, Fonts e Reflow

> **For agentic workers:** seguir `regras-de-negocio.md` (soberano). TDD por task, smoke por feature, commit por task na `mobile-first`, regressão completa ao final. Steps com `- [ ]`.

**Goal:** Resolver os insights restantes do PageSpeed que são corrigíveis no repositório: entrega de imagens (~960 KiB), LCP (`fetchpriority`), CSS de fontes bloqueante e reflow forçado.

**Spec:** Auditoria PageSpeed mobile de docemordidabrigadeiros.com.br (insights colados pelo usuário em 21/08/2026).

## Global Constraints

- Todas as regras de `regras-de-negocio.md`.
- Escopo de conversão: SOMENTE os 10 arquivos citados na auditoria (logo-1.png, coelho-borboleta.png, dupla_ovos.jpg, ovo_brownie.jpg, kit_degustacao.jpg, caixa_6_brigadeiros.jpg, ovo_maracuja.jpg, lembrancinha_4_unidades.jpg, lembrancinha_2_unidades.jpg, ovo_uva.jpg). `ovo_brigadeiro.jpg` e `ovo_ninho_nutella.jpg` NÃO foram apontados — não tocar.
- Originais PNG/JPG permanecem no repo (favicon e og:image usam logo-1.png).
- Conversão via Python PIL (disponível v12.1.1) — sem dependências novas.

---

### Task A: LCP — hero image

**Files:** Modify `index.html` (img do coelho), Create `tests/smoke-lcp.spec.js`

- [ ] Teste (falha primeiro): hero `img[alt*="Coelho"]` tem `fetchpriority="high"` e não tem `loading="lazy"`
- [ ] Implementar: adicionar `fetchpriority="high"` ao `<img>` do hero
- [ ] Smoke passa; commit `perf: prioriza download da imagem LCP do hero`

### Task B: WebP + dimensões corretas (economia ~960 KiB)

**Files:** Create `images/*.webp` (10 arquivos, PIL), Modify `index.html`, Create `tests/smoke-images-webp.spec.js`

- [ ] Teste (falha primeiro): todas as imgs citadas na auditoria servem `.webp`, têm `width`/`height` explícitos (anti-CLS) e nenhuma img do site referencia os jpg/png convertidos
- [ ] Script PIL (temporário em /tmp/opencode): converter+redimensionar para ~1.5x a dimensão exibida (logo 154x158, produtos largura ≤900px, hero conforme exibição), WebP q80 (alpha preservado nos PNG)
- [ ] Atualizar `src`/`srcset` no index.html + `width`/`height`
- [ ] Verificar redução real de bytes (antes/depois no relatório); commit `perf: converte imagens apontadas para WebP responsivo`

### Task C: CSS de fontes sem bloquear renderização

**Files:** Modify `index.html`, Create `tests/smoke-fonts-async.spec.js`

- [ ] Teste (falha primeiro): link do fonts.googleapis tem padrão async (`media="print"` + onload) e existe fallback `<noscript>`
- [ ] Implementar padrão `media="print" onload="this.media='all'"` + `<noscript>`; manter preconnects
- [ ] Commit `perf: carrega Google Fonts de forma assíncrona`

### Task D: Reflow forçado em script.js:29-31

**Files:** Modify `script.js`, Create `tests/smoke-carousel-edge.spec.js`

- [ ] Teste comportamental (falha primeiro): estados disabled dos botões prev/next corretos nas bordas após scroll
- [ ] Refatorar `update()`: medir geometria uma vez (init/resize), agrupar leituras antes de escritas; handler de scroll só lê valores já medidos + `scrollLeft`
- [ ] Nota honesta: ms de reflow só é re-mensurável pós-deploy no PageSpeed; teste cobre comportamento, não o número
- [ ] Commit `perf: elimina leituras de layout repetidas no carrossel`

### Task E (BLOQUEADA — decisão de hosting): Cache TTL 10 min

GitHub Pages fixa `Cache-Control: max-age=600` — **não é alterável pelo repositório**. Opções: (a) Cloudflare na frente com Edge Cache TTL override; (b) aceitar limite do host. Decisão do dono do site; fora do escopo de código.

### Fim

- [ ] Regressão completa `npm test` (todos os smokes + journeys) — evidência no relatório

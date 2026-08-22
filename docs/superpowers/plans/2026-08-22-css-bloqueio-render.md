# CSS bloqueador de renderização — style.css inline

**Spec:** Insight PageSpeed "Solicitações que bloquearam a renderização". Dois dos três URLs já resolvidos (cdnjs `6cdad57`; Google Fonts `13efc5b`). Restante: `/style.css` (4,5 KiB, 170 ms).

**Decisão de abordagem:** com UMA folha de estilo pequena e site de página única, deferir causaria FOUC (flash sem estilo). O caminho correto é **inline no `<head>`** (recomendação literal da auditoria: "deferidas ou colocadas inline").

## Global Constraints
- Regras de `regras-de-negocio.md` (TDD, smoke, regressão).
- SEM commit até autorização expressa do dono.
- CSS vai inline VERBATIM (sem minificar — gzip torna whitespace quase grátis; zero risco de quebra).

### Task única
**Files:** Modify `index.html`, Delete `style.css` (fonte única evita divergência entre cópias), Create `tests/smoke-css-inline.spec.js`

- [ ] Teste (falha primeiro): HTML servido NÃO contém `<link rel="stylesheet" href="style.css">` e contém bloco `<style>` com assinaturas do CSS (ex.: `--whatsapp-green`, `.carousel-track`)
- [ ] Injetar conteúdo integral de style.css em `<style>` no lugar do link; remover arquivo
- [ ] Novo spec verde + regressão completa verde
- [ ] Aguardar autorização → commit único

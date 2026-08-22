const { test, expect } = require('@playwright/test');

// Regra: nenhuma folha de estilo externa bloqueando a renderização —
// CSS único vai inline no head (site de página única).
// Contexto isolado: sem Service Worker nem cache herdado entre testes.
test.use({ serviceWorkers: 'block' });

test('CSS é servido inline, sem folha externa bloqueando', async ({ page }) => {
  await page.goto('/');
  const estiloInline = await page.evaluate(() =>
    Array.from(document.querySelectorAll('head style')).map(s => s.textContent).join('\n')
  );
  expect(estiloInline).toContain('--whatsapp-green');
  expect(estiloInline).toContain('.carousel-track');
});

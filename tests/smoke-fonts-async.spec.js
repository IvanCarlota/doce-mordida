const { test, expect } = require('@playwright/test');

// Regra de negócio 3.4: CSS de fontes fora do caminho crítico.
// O padrão async é definido no HTML servido (depois do onload o media vira 'all' no DOM),
// então a asserção correta é sobre o documento entregue ao navegador.
test('CSS do Google Fonts é servido sem bloquear a renderização', async ({ page }) => {
  const res = await page.request.get('/');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toMatch(/rel="stylesheet" media="print" onload="this\.media='all'"/);
});

test('fallback <noscript> mantém as fontes sem JavaScript', async ({ page }) => {
  await page.goto('/');
  const raw = await page.evaluate(() => document.querySelector('head noscript')?.textContent || '');
  expect(raw).toMatch(/fonts\.googleapis\.com\/css2/);
});

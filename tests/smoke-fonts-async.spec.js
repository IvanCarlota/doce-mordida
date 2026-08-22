const { test, expect } = require('@playwright/test');

// Regra de negócio 3.4: CSS de fontes fora do caminho crítico
test('CSS do Google Fonts é carregado sem bloquear a renderização', async ({ page }) => {
  await page.goto('/');
  const fontCss = page.locator('link[href*="fonts.googleapis.com/css2"]');
  await expect(fontCss).toHaveAttribute('media', 'print');
  await expect(fontCss).toHaveAttribute('onload', /media\s*=\s*['"]all['"]/);
});

test('fallback <noscript> mantém as fontes sem JavaScript', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('head noscript')).toHaveText(/fonts\.googleapis\.com\/css2/);
});

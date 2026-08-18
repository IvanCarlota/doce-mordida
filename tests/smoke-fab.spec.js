const { test, expect } = require('@playwright/test');
test('FAB visível em todos os tamanhos de tela', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#fab-whatsapp')).toBeVisible();
});
test('FAB aponta para wa.me com o número configurável', async ({ page }) => {
  await page.addInitScript(() => { window.WHATSAPP_NUMBER = '5541998026260'; });
  await page.goto('/');
  const href = await page.locator('#fab-whatsapp').getAttribute('href');
  expect(href).toContain('wa.me/5541998026260');
});
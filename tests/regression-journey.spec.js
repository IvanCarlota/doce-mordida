// tests/regression-journey.spec.js
const { test, expect } = require('@playwright/test');

test('jornada: pedido envia link wa.me com número de teste e itens', async ({ page }) => {
  await page.addInitScript(() => { window.WHATSAPP_NUMBER = '5541998026260'; });
  let waUrl = '';
  await page.context().route('**/wa.me/**', route => {
    waUrl = route.request().url();
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.locator('.item-selecao').nth(0).locator('input').fill('2');
  await page.locator('.item-selecao').nth(1).locator('input').fill('1');
  await page.getByRole('button', { name: /enviar pedido/i }).click();
  await expect.poll(() => waUrl).toContain('wa.me/');
  expect(waUrl).toContain('wa.me/5541998026260');
  expect(decodeURIComponent(waUrl)).toContain('2x');
});
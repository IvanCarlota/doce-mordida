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
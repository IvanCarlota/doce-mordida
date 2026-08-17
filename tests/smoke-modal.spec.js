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
test('modal pedido: ESC fecha e restaura o scroll', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal-pedido')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('overflow-y', 'auto');
});
test('price-tag preselect: botão do card abre modal com item marcado', async ({ page }) => {
  await page.goto('/');
  await page.locator('.price-tag[data-nome]').first().click();
  await expect(page.locator('#modal-pedido')).toBeVisible();
  await expect(page.locator('#modal-pedido input[data-nome="Ovo Brigadeiro"]')).toHaveValue('1');
});
test('modal pedido: clique fora fecha', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.locator('#modal-pedido').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('#modal-pedido')).toBeHidden();
});
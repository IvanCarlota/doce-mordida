const { test, expect } = require('@playwright/test');

test('modal pedido: preços exibidos e subtotal em tempo real', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  const modal = page.locator('#modal-pedido');
  await expect(modal.locator('.item-selecao').first().locator('.item-price')).toHaveText('R$ 57,00');
  await modal.locator('.item-selecao').nth(0).locator('input').fill('2');
  await modal.locator('.item-selecao').nth(1).locator('input').fill('1');
  await expect(modal.locator('#valor-total')).toHaveText('R$ 179,00');
  await modal.locator('.item-selecao').nth(0).locator('input').fill('0');
  await expect(modal.locator('#valor-total')).toHaveText('R$ 65,00');
});

test('modal pedido: preços e total incluídos na mensagem do WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  const modal = page.locator('#modal-pedido');
  await modal.locator('.item-selecao').nth(0).locator('input').fill('2');
  await modal.locator('.item-selecao').nth(1).locator('input').fill('1');
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    modal.locator('.btn-enviar').click(),
  ]);
  const url = popup.url();
  expect(url).toContain('5541996309958');
  const texto = decodeURIComponent(url.split('text=')[1]).replace(/\+/g, ' ');
  expect(texto).toContain('*2x* Ovo Brigadeiro — R$ 57,00');
  expect(texto).toContain('*1x* Ovo Ninho com Nutella — R$ 65,00');
  expect(texto).toContain('*Total: R$ 179,00*');
  await popup.close();
});

test('modal pedido: inputs com 16px (sem zoom iOS) e espaçamento preço/quantidade', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  await page.waitForFunction(() => {
    const t = getComputedStyle(document.querySelector('.popup-content')).transform;
    return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
  });
  const fs = await page.locator('.item-selecao input').first().evaluate(el => getComputedStyle(el).fontSize);
  expect(fs).toBe('16px');
  const gap = await page.locator('.item-selecao').first().evaluate(el => getComputedStyle(el).gap);
  expect(gap).toBe('8px');
  const priceRight = await page.locator('.item-selecao .item-price').first().evaluate(el => el.getBoundingClientRect().right);
  const inputLeft = await page.locator('.item-selecao input').first().evaluate(el => el.getBoundingClientRect().left);
  expect(inputLeft - priceRight).toBeGreaterThanOrEqual(8);
});
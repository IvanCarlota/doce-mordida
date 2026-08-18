const { test, expect } = require('@playwright/test');

test('modal pedido: semântica de diálogo e erro como alert', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  const modal = page.locator('#modal-pedido');
  await expect(modal).toHaveAttribute('role', 'dialog');
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  await expect(modal).toHaveAttribute('aria-labelledby', 'titulo-pedido');
  await expect(modal.locator('#mensagem-erro-vazio')).toHaveAttribute('role', 'alert');
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('modal pedido: ESC fecha, foco preso e restaurado', async ({ page }) => {
  await page.goto('/');
  const abrir = page.getByRole('button', { name: /fazer meu pedido/i }).first();
  await abrir.click();
  const modal = page.locator('#modal-pedido');
  await expect(modal.locator('#lista-itens-pedido input').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.locator('#lista-itens-pedido input').nth(1)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(modal.locator('#lista-itens-pedido input').first()).toBeFocused();
  const inputs = await modal.locator('#lista-itens-pedido input').count();
  const btnEnviar = modal.locator('.btn-enviar');
  await modal.locator('#lista-itens-pedido input').nth(inputs - 1).focus();
  await page.keyboard.press('Tab');
  await expect(btnEnviar).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.locator('.close-popup')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.locator('#lista-itens-pedido input').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(abrir).toBeFocused();
});

test('lightbox: diálogo, ESC e Enter no fechar restauram foco', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.card img').first();
  await img.click();
  const lightbox = page.locator('#image-modal');
  await expect(lightbox).toBeVisible();
  await expect(lightbox).toHaveAttribute('role', 'dialog');
  await expect(lightbox.locator('.close-modal')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(lightbox).toBeHidden();
  await expect(img).toBeFocused();
  await img.click();
  await expect(lightbox).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(img).toBeFocused();
});

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
test('modal pedido: bottom sheet no mobile, centralizado no desktop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
  const sheet = page.locator('#modal-pedido .popup-content');
  const info = await sheet.evaluate(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      position: cs.position,
      bottom: parseFloat(cs.bottom),
      radius: cs.borderRadius,
      maxW: cs.maxWidth,
      desktop: window.innerWidth >= 1024,
      height: r.height,
      vh: window.innerHeight,
    };
  });
  if (info.desktop) {
    expect(info.position).toBe('static');
    expect(parseFloat(info.maxW)).toBeLessThanOrEqual(450);
  } else {
    expect(info.position).toBe('fixed');
    expect(info.bottom).toBeLessThanOrEqual(0);
    expect(info.radius).toBe('24px 24px 0px 0px');
    expect(info.height).toBeLessThanOrEqual(info.vh * 0.9 + 1);
  }
});

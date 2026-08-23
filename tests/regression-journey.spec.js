// tests/regression-journey.spec.js
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.WHATSAPP_NUMBER = '5541998026260'; });
});

test.describe('jornada de pedido', () => {
  test('carrega nos 3 viewports sem overflow horizontal e com header visível', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('pedido 2x Brigadeiro + 1x Ninho: subtotal R$ 179,00 e wa.me interceptado', async ({ page }) => {
    let waUrl = '';
    await page.context().route('**/wa.me/**', route => {
      waUrl = route.request().url();
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
    const modal = page.locator('#modal-pedido');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await modal.locator('.item-selecao').nth(0).locator('input').fill('2');
    await modal.locator('.item-selecao').nth(1).locator('input').fill('1');
    await expect(page.locator('#valor-total')).toHaveText('R$ 179,00');
    await modal.getByRole('button', { name: /enviar pedido/i }).click();
    await expect.poll(() => waUrl).toContain('wa.me/5541998026260');
    const mensagem = decodeURIComponent(waUrl);
    expect(mensagem).toContain('2x');
    expect(mensagem).toContain('1x');
    expect(mensagem).toContain('Retirada em Colombo');
  });

  test('pedido vazio: erro role=alert visível e modal permanece aberto', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
    await page.locator('#modal-pedido').getByRole('button', { name: /enviar pedido/i }).click();
    await expect(page.locator('.erro-pedido')).toHaveAttribute('role', 'alert');
    await expect(page.locator('.erro-pedido')).toBeVisible();
    await expect(page.locator('#modal-pedido')).toBeVisible();
  });

  test('botão "Pedir" do card abre modal com item pré-selecionado (valor 1)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.price-tag[data-nome]').first().click();
    await expect(page.locator('#modal-pedido')).toBeVisible();
    await expect(page.locator('#modal-pedido input[data-nome="Ovo Brigadeiro"]')).toHaveValue('1');
  });
});

test.describe('menu mobile', () => {
  test.skip(({ viewport }) => viewport.width >= 1024, 'menu é mobile-only');

  test('link OVOS fecha o menu, marca aria-current e rola até #ovos', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /abrir menu/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const linkOvos = page.locator('#nav-menu a[href="#ovos"]');
    await linkOvos.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#nav-menu')).toBeHidden();
    await expect(linkOvos).toHaveAttribute('aria-current', 'page');
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10000 }).toBeGreaterThan(0);
  });
});

test.describe('carrossel', () => {
  test('dots por viewport, seta próxima rola e fica disabled no fim', async ({ page }) => {
    await page.goto('/');
    // Dots inteligentes: total - visíveis + 1 (3 no desktop, 4 no tablet, 5 no mobile)
    const largura = await page.evaluate(() => window.innerWidth);
    const dotsEsperados = largura >= 1024 ? 3 : largura >= 700 ? 4 : 5;
    await expect(page.locator('#ovos-dots .carousel-dot')).toHaveCount(dotsEsperados);
    const wrapper = page.locator('#ovos-track').locator('..');
    const track = page.locator('#ovos-track');
    const next = wrapper.locator('.carousel-btn.next');
    await next.click();
    await page.waitForTimeout(600);
    expect(await track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await track.evaluate(el => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
    await expect(next).toBeDisabled();
  });
});

test.describe('lightbox', () => {
  test('Enter no primeiro card abre e ESC fecha', async ({ page }) => {
    await page.goto('/');
    await page.locator('.card img').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#image-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#image-modal')).toBeHidden();
  });
});
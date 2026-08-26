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

  test('pedido 2x Brigadeiro + 1x Ninho via sacola: subtotal R$ 179,00 e wa.me interceptado', async ({ page }) => {
    let waUrl = '';
    await page.context().route('**/wa.me/**', route => {
      waUrl = route.request().url();
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' });
    });
    await page.goto('/');
    const brigadeiro = page.locator('.price-tag[data-nome="Ovo Brigadeiro"]');
    await brigadeiro.click();
    await brigadeiro.click();
    await page.locator('.price-tag[data-nome="Ovo Ninho com Nutella"]').click();
    await expect(page.locator('#sacola-badge')).toHaveText('3');
    await page.locator('#btn-sacola').click();
    await expect(page.locator('#sacola-drawer')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 179,00');
    await page.locator('#btn-enviar-sacola').click();
    await expect.poll(() => waUrl).toContain('wa.me/5541998026260');
    const mensagem = decodeURIComponent(waUrl);
    expect(mensagem).toContain('2x');
    expect(mensagem).toContain('1x');
    expect(mensagem).toContain('Retirada em Colombo');
  });

  test('sacola vazia: erro role=alert visível e drawer permanece aberto', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-sacola').click();
    await page.locator('#btn-enviar-sacola').click();
    await expect(page.locator('#sacola-erro')).toHaveAttribute('role', 'alert');
    await expect(page.locator('#sacola-erro')).toBeVisible();
    await expect(page.locator('#sacola-drawer')).toBeVisible();
  });

  test('botão do card adiciona o item à sacola com quantidade 1', async ({ page }) => {
    await page.goto('/');
    await page.locator('.price-tag[data-nome]').first().click();
    await expect(page.locator('#sacola-badge')).toHaveText('1');
    const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('docemordida-carrinho-v1')));
    expect(salvo).toEqual([{ nome: 'Ovo Brigadeiro', qtd: 1 }]);
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
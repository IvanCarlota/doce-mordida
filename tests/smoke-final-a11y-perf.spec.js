const { test, expect } = require('@playwright/test');

// Contrato final: dots inteligentes, hitboxes acessíveis, contraste WCAG AA,
// títulos semânticos, gtag pós-interação e reserva de espaço do hero.
test.use({ serviceWorkers: 'block' });

test('dots por viewport: 3 no desktop, 4 no tablet, 5 no mobile', async ({ page }) => {
  await page.goto('/');
  const largura = await page.evaluate(() => window.innerWidth);
  const esperado = largura >= 1024 ? 3 : largura >= 700 ? 4 : 5;
  await expect(page.locator('#ovos .carousel-dot')).toHaveCount(esperado);
});

test('dots têm hitbox invisível de 32px (>= 24px WCAG) e gap >= 8px', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ovos .carousel-dot').first()).toBeAttached();
  const hit = await page.evaluate(() => {
    const dot = document.querySelector('.carousel-dot');
    const antes = getComputedStyle(dot, '::before');
    const gap = parseFloat(getComputedStyle(dot.parentElement).gap);
    return { w: antes.width, h: antes.height, pos: antes.position, gap };
  });
  expect(hit.w).toBe('32px');
  expect(hit.h).toBe('32px');
  expect(hit.pos).toBe('absolute');
  expect(hit.gap).toBeGreaterThanOrEqual(8);
});

test('contraste WCAG AA >= 4.5:1 em nav, brand-sub e btn-cta', async ({ page }) => {
  await page.goto('/');
  const ratios = await page.evaluate(() => {
    const lum = (cor) => {
      const m = cor.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
    };
    const ratio = (frente, fundo) => {
      const [a, b] = [lum(frente), lum(fundo)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    };
    const link = document.querySelector('.nav-pill a');
    const pill = getComputedStyle(link.closest('.nav-pill')).backgroundColor;
    const sub = document.querySelector('.brand-sub');
    const cta = document.querySelector('.btn-cta');
    return {
      nav: ratio(getComputedStyle(link).color, pill),
      sub: ratio(getComputedStyle(sub).color, 'rgb(255, 255, 255)'),
      cta: ratio(getComputedStyle(cta).color, getComputedStyle(cta).backgroundColor),
    };
  });
  expect(ratios.nav).toBeGreaterThanOrEqual(4.5);
  expect(ratios.sub).toBeGreaterThanOrEqual(4.5);
  expect(ratios.cta).toBeGreaterThanOrEqual(4.5);
});

test('seção info usa h2 com FAQ semântico (sem h4)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#info h2')).toHaveText('Dúvidas Frequentes');
  await expect(page.locator('#info .faq-pergunta')).toHaveCount(3);
  expect(await page.locator('#info h4').count()).toBe(0);
});

test('gtag só é injetado após a primeira interação do usuário', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600); // antes: load+2000ms já teria injetado
  const antes = await page.evaluate(() =>
    !!document.querySelector('script[src*="googletagmanager"]')
  );
  expect(antes).toBe(false);
  await page.mouse.wheel(0, 120); // primeira interação (scroll)
  await expect
    .poll(async () => page.evaluate(() =>
      !!document.querySelector('script[src*="googletagmanager"]')
    ), { timeout: 5000 })
    .toBe(true);
});

test('contêiner do hero reserva espaço (aspect-ratio)', async ({ page }) => {
  await page.goto('/');
  const r = await page.evaluate(
    () => getComputedStyle(document.querySelector('.hero-image')).aspectRatio
  );
  expect(r).not.toBe('auto');
});

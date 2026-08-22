const { test, expect } = require('@playwright/test');

// Contrato da otimização de imagens: WebP everywhere (logo preservada),
// dimensões explícitas, hero prioritário com preload, demais lazy.
test.use({ serviceWorkers: 'block' });

const PRODUTOS = [
  'ovo_brigadeiro', 'ovo_ninho_nutella', 'ovo_uva', 'ovo_brownie', 'ovo_maracuja',
  'dupla_ovos', 'kit_degustacao', 'caixa_6_brigadeiros',
  'lembrancinha_4_unidades', 'lembrancinha_2_unidades',
];

test('hero tem preload com prioridade alta no head', async ({ page }) => {
  const html = await (await page.request.get('/')).text();
  expect(html).toMatch(/<link[^>]+rel="preload"[^>]+as="image"[^>]+coelho-borboleta\.webp/);
  expect(html).toMatch(/<link[^>]+coelho-borboleta\.webp[^>]+fetchpriority="high"|<link[^>]+fetchpriority="high"[^>]+coelho-borboleta\.webp/);
});

test('imagens de conteúdo em .webp, com dimensões e lazy', async ({ page }) => {
  await page.goto('/');
  const imgs = await page.evaluate(() =>
    Array.from(document.images)
      .filter(i => i.getAttribute('src'))
      .map(i => ({
        src: i.getAttribute('src'),
        w: i.getAttribute('width'),
        h: i.getAttribute('height'),
        loading: i.getAttribute('loading'),
      }))
  );

  const logo = imgs.find(i => i.src.includes('logo'));
  expect(logo.src).toBe('images/logo-1.png'); // intocado desde o incidente
  expect(logo.w).toBeTruthy();
  expect(logo.h).toBeTruthy();

  for (const nome of PRODUTOS) {
    const img = imgs.find(i => i.src.includes(nome));
    expect(img, nome).toBeTruthy();
    expect(img.src.endsWith('.webp'), `${nome}: ${img && img.src}`).toBe(true);
    expect(img.w, `${nome}.width`).toBeTruthy();
    expect(img.h, `${nome}.height`).toBeTruthy();
    expect(img.loading, `${nome}.loading`).toBe('lazy');
  }

  const hero = imgs.find(i => i.src.includes('coelho-borboleta'));
  expect(hero.src.endsWith('.webp')).toBe(true);
  expect(hero.w).toBeTruthy();
  expect(hero.h).toBeTruthy();
  expect(hero.loading).toBe('eager');
});

test('contêineres reservam espaço (anti-CLS)', async ({ page }) => {
  await page.goto('/');
  const heroRatio = await page.evaluate(
    () => getComputedStyle(document.querySelector('.hero-image img')).aspectRatio
  );
  expect(heroRatio).not.toBe('auto');
  const cardImgHeight = await page.evaluate(
    () => getComputedStyle(document.querySelector('.card img')).height
  );
  expect(cardImgHeight).toBe('350px');
});

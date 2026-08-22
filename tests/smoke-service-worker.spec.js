const { test, expect } = require('@playwright/test');

// Regra de negócio 3.x: visitas repetidas devem ser servidas do cache local
// (Service Worker) já que o host fixa Cache-Control: max-age=600.

const TOTAL_PRECACHE = 15; // index.html + style.css + script.js + 12 imagens usadas pela página
                           // (brigadeiro.png existe no repo mas não é referenciado)

test('service worker registra e precacheia os assets estáticos', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);

  await expect(async () => {
    const n = await page.evaluate(async () => {
      const keys = await caches.keys();
      if (!keys.length) return 0;
      const cache = await caches.open(keys[0]);
      return (await cache.keys()).length;
    });
    expect(n).toBeGreaterThanOrEqual(TOTAL_PRECACHE);
  }).toPass({ timeout: 15000 });
});

test('visita repetida roda sob controle do service worker (cache local)', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  const controlado = await page.evaluate(() => !!navigator.serviceWorker.controller);
  expect(controlado).toBe(true);
});

const { test, expect } = require('@playwright/test');

// Regra de negócio 3.2: imagens apontadas pela auditoria devem ser servidas em formato moderno
const CITADOS = [
  'logo-1.png', 'coelho-borboleta.png', 'dupla_ovos.jpg', 'ovo_brownie.jpg',
  'kit_degustacao.jpg', 'caixa_6_brigadeiros.jpg', 'ovo_maracuja.jpg',
  'lembrancinha_4_unidades.jpg', 'lembrancinha_2_unidades.jpg', 'ovo_uva.jpg',
];

test('arquivos pesados apontados pela auditoria não são mais baixados', async ({ page }) => {
  const served = [];
  page.on('response', r => {
    if (r.url().includes('/images/')) served.push(r.url().split('/').pop());
  });
  await page.goto('/');
  // rola até o fim para disparar todos os loading="lazy" (não deixar violação escondida)
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
  });
  await page.evaluate(() =>
    Promise.all(Array.from(document.images)
      .filter(i => i.getAttribute('src'))
      .map(i => (i.complete ? 0 : Promise.race([
        new Promise(r => { i.onload = i.onerror = r; }),
        new Promise(r => setTimeout(r, 3000)),
      ]))))
  );
  for (const f of CITADOS) expect(served, `${f} ainda foi baixado`).not.toContain(f);
});

test('imagens com src têm width/height explícitos (anti-CLS)', async ({ page }) => {
  await page.goto('/');
  const semDimensoes = await page.evaluate(() =>
    Array.from(document.images)
      .filter(i => i.getAttribute('src'))
      .filter(i => !i.getAttribute('width') || !i.getAttribute('height'))
      .map(i => i.getAttribute('src'))
  );
  expect(semDimensoes).toEqual([]);
});

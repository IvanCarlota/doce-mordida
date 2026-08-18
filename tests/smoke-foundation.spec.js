const { test, expect } = require('@playwright/test');
test('tokens e base a11y', async ({ page }) => {
  await page.goto('/');
  const bg = await page.locator('.nav-pill').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(196, 232, 255)'); // #c4e8ff via --azul-claro
  const html = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(html).toBeGreaterThan(0);
});
test('fontes unificadas em 1 link com fallbacks', async ({ page }) => {
  await page.goto('/');
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter(l => (l.href || '').includes('fonts.googleapis.com/css2')).length
  );
  expect(links).toBe(1);
  const fam = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fam).toContain('Poppins');
});
test('prefers-reduced-motion desativa animações', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const anim = await page.locator('.hero-image img').evaluate(el => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
});
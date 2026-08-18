const { test, expect } = require('@playwright/test');
test('sem overflow horizontal em mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
test('hero mobile: min-height auto e padding adaptativo', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const hero = page.locator('.hero');
  const info = await hero.evaluate(el => {
    const cs = getComputedStyle(el);
    const content = el.querySelector('.hero-container').getBoundingClientRect().height;
    return {
      pt: parseFloat(cs.paddingTop),
      pl: parseFloat(cs.paddingLeft),
      pb: parseFloat(cs.paddingBottom),
      h: el.getBoundingClientRect().height,
      content,
    };
  });
  expect(Math.abs(info.pt - 812 * 0.15)).toBeLessThanOrEqual(2);
  expect(Math.abs(info.pl - 375 * 0.05)).toBeLessThanOrEqual(1);
  expect(Math.abs(info.h - (info.content + info.pt + info.pb))).toBeLessThanOrEqual(2);
});
test('tipografia fluida: clamp nos títulos e hero-subtitle estilizado', async ({ page }) => {
  await page.goto('/');
  const h1 = await page.locator('.hero h1').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const h2 = await page.locator('#ovos h2').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const sub = await page.locator('.hero-subtitle').evaluate(el => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), spacing: cs.letterSpacing, weight: cs.fontWeight, color: cs.color };
  });
  expect(h1).toBeGreaterThanOrEqual(35.2); // 2.2rem
  expect(h1).toBeLessThanOrEqual(64);      // 4rem
  expect(h2).toBeGreaterThanOrEqual(30.4); // 1.9rem
  expect(h2).toBeLessThanOrEqual(44.8);    // 2.8rem
  expect(sub.size).toBeGreaterThanOrEqual(14.4); // 0.9rem
  expect(sub.size).toBeLessThanOrEqual(17.6);    // 1.1rem
  expect(sub.spacing).toBe('3px');
  expect(sub.weight).toBe('600');
});
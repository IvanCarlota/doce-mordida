const { test, expect } = require('@playwright/test');
test('tokens e base a11y', async ({ page }) => {
  await page.goto('/');
  const bg = await page.locator('.nav-pill').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(196, 232, 255)'); // #c4e8ff via --azul-claro
  const html = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(html).toBeGreaterThan(0);
});
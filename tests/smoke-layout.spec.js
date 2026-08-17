const { test, expect } = require('@playwright/test');
test('sem overflow horizontal em mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
test('hero-subtitle estilizado', async ({ page }) => {
  await page.goto('/');
  const fs = await page.locator('.hero-subtitle').evaluate(el => getComputedStyle(el).fontSize);
  expect(parseFloat(fs)).toBeGreaterThan(10);
});
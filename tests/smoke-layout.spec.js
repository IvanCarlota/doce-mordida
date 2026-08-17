const { test, expect } = require('@playwright/test');
test('sem overflow horizontal em mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
test('hero-subtitle estilizado', async ({ page }) => {
  await page.goto('/');
  const styles = await page.locator('.hero-subtitle').evaluate(el => {
    const cs = getComputedStyle(el);
    return { fontSize: cs.fontSize, letterSpacing: cs.letterSpacing };
  });
  expect(styles.fontSize).toBe('12.8px');
  expect(styles.letterSpacing).toBe('3px');
});
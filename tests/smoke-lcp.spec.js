const { test, expect } = require('@playwright/test');

// Regra de negócio 3.3: imagem LCP nunca lazy, sempre fetchpriority=high
test('imagem LCP do hero é prioritária e não é lazy', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero-image img');
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).not.toHaveAttribute('loading', 'lazy');
});

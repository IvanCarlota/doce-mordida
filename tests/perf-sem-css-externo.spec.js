const { test, expect } = require('@playwright/test');

test('nenhum CSS do Font Awesome é baixado de cdnjs', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto('/');
  const cdnRequests = requests.filter(u => u.includes('cdnjs.cloudflare.com'));
  expect(cdnRequests).toEqual([]);
});

test('ícones são SVGs inline', async ({ page }) => {
  await page.goto('/');
  // menu-toggle fica display:none no desktop (style.css:545) → usar count
  await expect(page.locator('.menu-toggle .icon-bars')).toHaveCount(1);
  await expect(page.locator('.btn-cta .icon-whatsapp').first()).toBeVisible();
  await expect(page.locator('.carousel-btn .icon-chevron-left').first()).toBeVisible();
  await expect(page.locator('.carousel-btn .icon-chevron-right').first()).toBeVisible();
});

const { test, expect } = require('@playwright/test');
test.describe('menu mobile', () => {
test.skip(({ viewport }) => viewport.width >= 1024, 'menu é mobile-only');
test('menu drawer abre/fecha com aria-expanded', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /abrir menu/i });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.locator('#nav-menu')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#nav-menu')).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
test('scroll do body trava com menu aberto', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /abrir menu/i }).click();
  const locked = await page.evaluate(() => document.body.classList.contains('menu-open'));
  expect(locked).toBe(true);
});
});
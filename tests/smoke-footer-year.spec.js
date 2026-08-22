const { test, expect } = require('@playwright/test');

test('rodapé exibe o ano atual obtido via data do servidor', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#current-year')).toHaveText(String(new Date().getFullYear()));
});

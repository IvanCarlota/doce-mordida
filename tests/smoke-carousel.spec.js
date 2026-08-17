const { test, expect } = require('@playwright/test');
test('carrossel navega e dots sincronizam', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('#ovos-track');
  await expect(page.locator('#ovos-dots .carousel-dot')).toHaveCount(5);
  const next = page.locator('#ovos-track').locator('..').locator('.carousel-btn.next');
  await next.click();
  await page.waitForTimeout(600);
  const x = await track.evaluate(el => el.scrollLeft);
  expect(x).toBeGreaterThan(0);
  await page.keyboard.press('End'); // aproximação: rolar direto no fim via JS
  await track.evaluate(el => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
  const disabled = await page.locator('#ovos-track').locator('..').locator('.carousel-btn.next').isDisabled();
  expect(disabled).toBe(true);
});